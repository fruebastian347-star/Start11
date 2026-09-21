/* =========================================================
   START11 – V24.4 TRAINING LIBRARY
   ---------------------------------------------------------
   Ingen AI-funktioner.

   - Personlig øvelsesbank på tværs af hold/klubber
   - Mapper + ubegrænsede undermapper
   - Trin kan markeres til trænings-PDF
   - Opsætning/Trin 1 bruges som cover i øvelsesbanken
   - Kegler kan få individuel farve
   - PDF viser opsætning + de valgte animationstrin
========================================================= */

(function start11TrainingLibraryV244(){

    const PROFILE_KEY_PREFIX = "start11.profile.exerciseLibrary.v244.";
    let profileReady = false;
    let profileOwnerId = "";
    let folderFilter = "all";
    let selectedFolder = "";

    const userKey = () => {
        const uid = (typeof session !== "undefined" && session?.user?.id)
            ? session.user.id
            : "local";
        return PROFILE_KEY_PREFIX + uid;
    };

    const clone = v => JSON.parse(JSON.stringify(v));

    function normalizeFolders(folders){
        return (Array.isArray(folders) ? folders : []).map(f => ({
            id: String(f.id || s13Id("folder")),
            name: String(f.name || "Ny mappe"),
            parentId: f.parentId ? String(f.parentId) : ""
        }));
    }

    function normalizeExerciseLibrary(exercises){
        return (Array.isArray(exercises) ? exercises : []).map(ex => {
            ex.folderId = String(ex.folderId || "");
            ex.diagram = typeof s19NormalizeDiagram === "function"
                ? s19NormalizeDiagram(ex.diagram)
                : ex.diagram;

            if(ex.diagram?.frames?.length){
                ex.diagram.frames.forEach((frame, i) => {
                    if(typeof frame.includeInPdf !== "boolean"){
                        /*
                           Eksisterende øvelser beholder alle trin i PDF
                           første gang. Træneren kan derefter fravælge dem.
                        */
                        frame.includeInPdf = true;
                    }
                });
            }
            return ex;
        });
    }

    function currentLibrary(){
        return {
            exercises: normalizeExerciseLibrary(clone(s13Data?.exercises || [])),
            folders: normalizeFolders(clone(s13Data?.exerciseFolders || []))
        };
    }

    function applyLibrary(lib){
        if(!s13Data || typeof s13Data !== "object") return;
        s13Data.exercises = normalizeExerciseLibrary(clone(lib?.exercises || []));
        s13Data.exerciseFolders = normalizeFolders(clone(lib?.folders || []));
    }

    function saveLocal(){
        try{
            localStorage.setItem(userKey(), JSON.stringify(currentLibrary()));
        }catch(error){
            console.warn("START11: Kunne ikke gemme personlig øvelsesbank lokalt.", error);
        }
    }

    function loadLocal(){
        try{
            const raw = localStorage.getItem(userKey());
            if(!raw) return null;
            const parsed = JSON.parse(raw);
            if(!parsed || !Array.isArray(parsed.exercises)) return null;
            return {
                exercises: normalizeExerciseLibrary(parsed.exercises),
                folders: normalizeFolders(parsed.folders)
            };
        }catch{
            return null;
        }
    }

    /*
       Cloud-adfærd:
       Den personlige øvelsesbank replikeres til brugerens holdposter.
       Resultatet er, at samme bank følger kontoen på tværs af klub/hold
       og også kan hentes på en anden enhed, uden at ændre den nuværende
       Supabase-database-struktur.
    */
    let cloudSyncTimer = null;

    function syncLibraryToCloud(){
        clearTimeout(cloudSyncTimer);

        cloudSyncTimer = setTimeout(async () => {
            if(
                typeof supabaseRequest !== "function" ||
                typeof CLOUD_TABLE === "undefined" ||
                typeof cloudTeams === "undefined" ||
                !Array.isArray(cloudTeams) ||
                !cloudTeams.length
            ) return;

            const lib = currentLibrary();

            for(const team of cloudTeams){
                if(!team?.id) continue;

                const data = clone(team.data || {});
                data.start11CoachHub = {
                    ...(data.start11CoachHub || {}),
                    exercises: clone(lib.exercises),
                    exerciseFolders: clone(lib.folders)
                };

                try{
                    await supabaseRequest(
                        `/rest/v1/${CLOUD_TABLE}?id=eq.${encodeURIComponent(team.id)}`,
                        {
                            method:"PATCH",
                            headers:{Prefer:"return=minimal"},
                            body:JSON.stringify({data})
                        }
                    );
                    team.data = data;
                }catch(error){
                    console.warn("START11: Personlig øvelsesbank cloud-sync fejlede.", error);
                }
            }
        }, 650);
    }

    function persistProfileLibrary(){
        if(!profileReady) return;
        saveLocal();
        syncLibraryToCloud();
    }

    /*
       Udvid Coach Hub-normalisering med mapper.
    */
    if(typeof s13Norm === "function"){
        const beforeNorm = s13Norm;
        s13Norm = function(raw={}){
            const d = beforeNorm(raw);
            d.exerciseFolders = normalizeFolders(raw.exerciseFolders || d.exerciseFolders);
            d.exercises = normalizeExerciseLibrary(d.exercises);
            return d;
        };
    }

    /*
       Første load:
       1) lokal profilbank hvis den findes
       2) ellers den øvelsesbank der allerede ligger i cloud-holdet
       Dermed migreres eksisterende øvelser automatisk.
    */
    function initializeProfileLibrary(){
        const currentUid = (typeof session !== "undefined" && session?.user?.id)
            ? String(session.user.id)
            : "local";

        if(profileReady && profileOwnerId === currentUid) return;

        /*
           V27.4:
           Cloud-data fra den AKTUELLE konto er førstevalg på tværs af enheder.
           Den lokale profilbank er kun fallback/recovery.

           Det er vigtigt, fordi en gammel lokal cache ellers kan overskrive
           en nyere øvelse, som blev oprettet på en anden enhed.
        */
        const cloudLibrary = {
            exercises: normalizeExerciseLibrary(clone(s13Data?.exercises || [])),
            folders: normalizeFolders(clone(s13Data?.exerciseFolders || []))
        };
        const local = loadLocal();

        const cloudHasData = cloudLibrary.exercises.length > 0 || cloudLibrary.folders.length > 0;
        const localHasData = !!local && (local.exercises.length > 0 || local.folders.length > 0);

        if(cloudHasData){
            applyLibrary(cloudLibrary);
            saveLocal();
        }else if(localHasData){
            applyLibrary(local);
            /* Recovery: hvis cloud er tom, må en eksisterende lokal bank gerne
               gendanne kontoen og derefter blive sendt til cloud. */
        }else{
            applyLibrary(cloudLibrary);
            saveLocal();
        }

        profileOwnerId = currentUid;
        profileReady = true;
        syncLibraryToCloud();
    }

    /*
       Holdskift må ikke udskifte den personlige øvelsesbank.
    */
    if(typeof applyTeamData === "function"){
        const beforeApplyTeam = applyTeamData;
        applyTeamData = function(data){
            const currentUid = (typeof session !== "undefined" && session?.user?.id)
                ? String(session.user.id)
                : "local";
            const sameOwner = profileReady && profileOwnerId === currentUid;
            const keep = sameOwner ? currentLibrary() : null;

            /* Ved kontoskift må den gamle kontos bank aldrig overleve i memory. */
            if(!sameOwner){
                profileReady = false;
                profileOwnerId = "";
            }

            const result = beforeApplyTeam(data);

            if(keep){
                /* Holdskift på SAMME konto: personlig bank bevares. */
                applyLibrary(keep);
            }else{
                /* Ny konto/enhed: brug den aktuelle kontos cloud-bank først. */
                initializeProfileLibrary();
            }

            return result;
        };
    }

    /*
       Gem almindelige Coach Hub-data som før, men hold den personlige
       øvelsesbank synkroniseret separat.
    */
    if(typeof s13Save === "function"){
        const beforeSave = s13Save;
        s13Save = function(){
            const result = beforeSave();
            persistProfileLibrary();
            return result;
        };
    }


    /* =====================================================
       MAPPEMODEL
    ===================================================== */

    function folders(){
        if(!Array.isArray(s13Data.exerciseFolders)){
            s13Data.exerciseFolders = [];
        }
        return s13Data.exerciseFolders;
    }

    function childrenOf(parentId){
        return folders()
            .filter(f => String(f.parentId || "") === String(parentId || ""))
            .sort((a,b) => a.name.localeCompare(b.name, "da"));
    }

    function descendantIds(id){
        const out = new Set([id]);
        let changed = true;
        while(changed){
            changed = false;
            folders().forEach(f => {
                if(out.has(f.parentId) && !out.has(f.id)){
                    out.add(f.id);
                    changed = true;
                }
            });
        }
        return out;
    }

    function folderPath(id){
        const names = [];
        let current = folders().find(f => f.id === id);
        const guard = new Set();

        while(current && !guard.has(current.id)){
            guard.add(current.id);
            names.unshift(current.name);
            current = folders().find(f => f.id === current.parentId);
        }

        return names.join(" / ");
    }

    function folderOptions(excludeId=""){
        const excluded = excludeId ? descendantIds(excludeId) : new Set();

        const walk = (parent="", depth=0) =>
            childrenOf(parent)
                .filter(f => !excluded.has(f.id))
                .map(f => `
                    <option value="${s13Esc(f.id)}">
                        ${"— ".repeat(depth)}${s13Esc(f.name)}
                    </option>
                    ${walk(f.id, depth+1)}
                `)
                .join("");

        return `<option value="">Ingen mappe</option>${walk()}`;
    }

    function folderTreeHtml(parent="", depth=0){
        return childrenOf(parent).map(folder => {
            const count = s13Data.exercises.filter(ex => ex.folderId === folder.id).length;
            return `
                <div class="s244-folder-node" style="--depth:${depth}">
                    <button class="s244-folder ${folderFilter===folder.id?"active":""}" data-s244-folder="${s13Esc(folder.id)}">
                        <span>📁 ${s13Esc(folder.name)}</span>
                        <small>${count}</small>
                    </button>
                    ${folderTreeHtml(folder.id, depth+1)}
                </div>
            `;
        }).join("");
    }

    function installStyles(){
        if(document.getElementById("s244TrainingStyles")) return;

        const s = document.createElement("style");
        s.id = "s244TrainingStyles";
        s.textContent = `
            .s244-library-tools{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:0 0 10px}
            .s244-library-layout{display:grid;grid-template-columns:205px minmax(0,1fr);gap:10px}
            .s244-folder-panel{padding:9px;border:1px solid rgba(255,255,255,.08);border-radius:8px;background:#061008;min-width:0}
            .s244-folder-title{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:7px}
            .s244-folder-title strong{font-size:8px}
            .s244-folder{width:100%;min-height:30px;display:flex;align-items:center;justify-content:space-between;gap:6px;padding:0 7px 0 calc(7px + var(--depth,0)*12px);border:0;border-radius:5px;background:transparent;color:#9ca89f;font:inherit;font-size:7.5px;text-align:left;cursor:pointer}
            .s244-folder:hover,.s244-folder.active{background:color-mix(in srgb,var(--s11-primary) 10%,transparent);color:#fff}
            .s244-folder small{color:var(--s11-primary);font-size:6px}
            .s244-all{margin-bottom:4px}
            .s244-folder-actions{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.07)}
            .s244-current-folder{margin:0 0 9px;padding:7px 9px;border:1px solid rgba(255,255,255,.07);border-radius:6px;background:#08100a;color:#8e9b91;font-size:7px}
            .s244-current-folder strong{color:#fff}
            .s244framewrap{display:inline-flex;align-items:center;border:1px solid rgba(255,255,255,.09);border-radius:7px;overflow:hidden;background:#0c130f}
            .s244framewrap .s23b{border:0!important;border-radius:0!important}
            .s244pdfcheck{display:flex;align-items:center;gap:3px;padding:0 6px;color:#87948a;font-size:6px;font-weight:900;white-space:nowrap;cursor:pointer}
            .s244pdfcheck input{accent-color:var(--s11-primary);width:12px;height:12px}
            .s244-setup-thumb{width:100%;height:100%;display:grid;place-items:center;overflow:hidden;background:#176733}
            .s244-setup-thumb svg{width:100%;height:100%;display:block}
            .s244-folder-chip{display:inline-flex;margin-top:5px;padding:3px 6px;border:1px solid rgba(255,255,255,.08);border-radius:999px;color:#8c998f;font-size:6px}
            @media(max-width:760px){
                .s244-library-layout{grid-template-columns:1fr}
                .s244-folder-panel{max-height:240px;overflow:auto}
            }
        `;
        document.head.appendChild(s);
    }


    /* =====================================================
       ØVELSESBANK UI – mapper oven på eksisterende editor
    ===================================================== */

    const baseExercisesRender = typeof s13Exercises === "function" ? s13Exercises : null;

    if(baseExercisesRender){
        s13Exercises = function(target){
            initializeProfileLibrary();
            baseExercisesRender(target);
            enhanceExerciseLibrary(target);
        };
    }

    function enhanceExerciseLibrary(target){
        return; /* V24.6: replaced by native integration in the real exercise renderer */
        installStyles();
        if(!target) return;

        const mainGrid = target.querySelector(".s13grid");
        if(!mainGrid || target.querySelector(".s244-library-layout")) return;

        const listPanel = mainGrid.querySelector(".s13panel");
        const editorPanel = mainGrid.querySelectorAll(".s13panel")[1];
        if(!listPanel) return;

        /*
           Marker kort med exercise-id og filtrér efter valgt mappe.
        */
        listPanel.querySelectorAll(".s17-exercise-card").forEach(card => {
            const thumb = card.querySelector("[data-thumb-exercise]");
            const id = thumb?.dataset.thumbExercise || "";
            card.dataset.s244Exercise = id;

            const ex = s13Data.exercises.find(x => x.id === id);
            if(ex?.folderId){
                const info = card.querySelector(".s17-focus")?.parentElement || card.querySelector(".s17-exercise-preview > div:nth-child(2)");
                if(info && !card.querySelector(".s244-folder-chip")){
                    info.insertAdjacentHTML("beforeend", `<span class="s244-folder-chip">📁 ${s13Esc(folderPath(ex.folderId))}</span>`);
                }
            }

            let visible = true;
            if(folderFilter === "root"){
                visible = !ex?.folderId;
            }else if(folderFilter !== "all"){
                const ids = descendantIds(folderFilter);
                visible = !!ex && ids.has(ex.folderId);
            }
            card.style.display = visible ? "" : "none";
        });

        const existingHead = listPanel.querySelector(".s13head");
        if(existingHead){
            existingHead.insertAdjacentHTML("afterend", `
                <div class="s244-current-folder">
                    VISER: <strong>${
                        folderFilter==="all" ? "ALLE ØVELSER" :
                        folderFilter==="root" ? "UDEN MAPPE" :
                        s13Esc(folderPath(folderFilter))
                    }</strong>
                </div>
            `);
        }

        const wrapper = document.createElement("div");
        wrapper.className = "s244-library-layout";

        const folderPanel = document.createElement("aside");
        folderPanel.className = "s244-folder-panel";
        folderPanel.innerHTML = `
            <div class="s244-folder-title">
                <strong>MIN ØVELSESBANK</strong>
                <button class="s13btn" id="s244NewRoot" style="min-height:27px;padding:0 7px">+ MAPPE</button>
            </div>
            <button class="s244-folder s244-all ${folderFilter==="all"?"active":""}" data-s244-folder="all"><span>▦ Alle øvelser</span><small>${s13Data.exercises.length}</small></button>
            <button class="s244-folder s244-all ${folderFilter==="root"?"active":""}" data-s244-folder="root"><span>⌂ Uden mappe</span><small>${s13Data.exercises.filter(x=>!x.folderId).length}</small></button>
            ${folderTreeHtml()}
            <div class="s244-folder-actions">
                <button class="s13btn" id="s244SubFolder" ${folderFilter==="all"||folderFilter==="root"?"disabled":""}>+ UNDERMAPPE</button>
                <button class="s13btn" id="s244RenameFolder" ${folderFilter==="all"||folderFilter==="root"?"disabled":""}>OMDØB</button>
                <button class="s13btn" id="s244MoveFolder" ${folderFilter==="all"||folderFilter==="root"?"disabled":""}>FLYT</button>
                <button class="s13btn" id="s244DeleteFolder" ${folderFilter==="all"||folderFilter==="root"?"disabled":""}>SLET</button>
            </div>
        `;

        listPanel.parentElement.insertBefore(wrapper, listPanel);
        wrapper.appendChild(folderPanel);
        wrapper.appendChild(listPanel);

        /*
           Folder-vælger i øvelseseditoren.
        */
        if(editorPanel){
            const stack = editorPanel.querySelector(".s13stack");
            if(stack && !editorPanel.querySelector("#s244ExerciseFolder")){
                const current = s13Data.exercises.find(x => x.id === s13Exercise);
                const label = document.createElement("label");
                label.className = "s13field";
                label.innerHTML = `Mappe<select id="s244ExerciseFolder" class="s13sel">${folderOptions()}</select>`;
                stack.insertBefore(label, stack.firstChild);
                label.querySelector("select").value = current?.folderId || "";
            }
        }

        target.querySelectorAll("[data-s244-folder]").forEach(btn => {
            btn.onclick = () => {
                folderFilter = btn.dataset.s244Folder;
                selectedFolder = (folderFilter==="all"||folderFilter==="root") ? "" : folderFilter;
                s13Exercises(target);
            };
        });

        document.getElementById("s244NewRoot")?.addEventListener("click", () => createFolder(""));
        document.getElementById("s244SubFolder")?.addEventListener("click", () => createFolder(folderFilter));
        document.getElementById("s244RenameFolder")?.addEventListener("click", renameFolder);
        document.getElementById("s244MoveFolder")?.addEventListener("click", moveFolder);
        document.getElementById("s244DeleteFolder")?.addEventListener("click", deleteFolder);

        /*
           Den eksisterende GEM-knap opretter/redigerer stadig øvelsen.
           Capture-listeneren husker mappevalget og lægger det på objektet
           umiddelbart efter den oprindelige save-handler.
        */
        const save = target.querySelector("#s13saveex, #s17SaveExercise");
        if(save && !save.dataset.s244Bound){
            save.dataset.s244Bound = "1";
            save.addEventListener("click", () => {
                const folderId = target.querySelector("#s244ExerciseFolder")?.value || selectedFolder || "";
                setTimeout(() => {
                    const ex = s13Data.exercises.find(x => x.id === s13Exercise);
                    if(ex){
                        ex.folderId = folderId;
                        s13Save();
                    }
                }, 0);
            }, true);
        }

        /*
           Nye øvelser oprettet mens en mappe er åben lander i den mappe.
        */
        target.querySelector("#s17NewExercise, #s13newex")?.addEventListener("click", () => {
            selectedFolder = (folderFilter==="all"||folderFilter==="root") ? "" : folderFilter;
        }, true);

        /*
           Trin 1 som cover.
        */
        s13Data.exercises.forEach(ex => s244RenderSetupThumbnail(ex));
    }

    function createFolder(parentId){
        const name = prompt(parentId ? "Navn på undermappe:" : "Navn på mappe:", "");
        if(!name?.trim()) return;

        const folder = {
            id:s13Id("folder"),
            name:name.trim(),
            parentId:parentId || ""
        };

        folders().push(folder);
        folderFilter = folder.id;
        selectedFolder = folder.id;
        s13Save();
        s13Exercises(document.getElementById("s13content"));
    }

    function renameFolder(){
        const folder = folders().find(f => f.id === folderFilter);
        if(!folder) return;
        const name = prompt("Nyt mappenavn:", folder.name);
        if(!name?.trim()) return;
        folder.name = name.trim();
        s13Save();
        s13Exercises(document.getElementById("s13content"));
    }

    function moveFolder(){
        const folder = folders().find(f => f.id === folderFilter);
        if(!folder) return;

        const modal = document.createElement("div");
        modal.className = "modal";
        modal.style.display = "flex";
        modal.style.zIndex = "2147482500";
        modal.innerHTML = `
            <div class="modal-content" style="width:min(430px,calc(100vw - 20px));padding:16px">
                <div class="s13head"><strong>FLYT MAPPE</strong><button class="s13btn" data-close>LUK</button></div>
                <label class="s13field">Ny placering
                    <select class="s13sel" id="s244MoveFolderSelect">
                        ${folderOptions(folder.id)}
                    </select>
                </label>
                <button class="s13btn primary" id="s244ConfirmMove" style="width:100%;margin-top:10px">FLYT MAPPE</button>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector("#s244MoveFolderSelect").value = folder.parentId || "";
        modal.querySelector("[data-close]").onclick = () => modal.remove();
        modal.querySelector("#s244ConfirmMove").onclick = () => {
            folder.parentId = modal.querySelector("#s244MoveFolderSelect").value || "";
            s13Save();
            modal.remove();
            s13Exercises(document.getElementById("s13content"));
        };
    }

    function deleteFolder(){
        const folder = folders().find(f => f.id === folderFilter);
        if(!folder) return;

        if(!confirm(`Slet mappen "${folder.name}" og dens undermapper?\n\nØvelserne slettes IKKE – de flyttes til "Uden mappe".`)) return;

        const ids = descendantIds(folder.id);
        s13Data.exercises.forEach(ex => {
            if(ids.has(ex.folderId)) ex.folderId = "";
        });
        s13Data.exerciseFolders = folders().filter(f => !ids.has(f.id));
        folderFilter = "all";
        selectedFolder = "";
        s13Save();
        s13Exercises(document.getElementById("s13content"));
    }


    /* =====================================================
       COVER = OPSÆTNING / TRIN 1
    ===================================================== */

    function s244RenderSetupThumbnail(exercise){
        const target = document.querySelector(
            `[data-thumb-exercise="${CSS.escape(exercise.id)}"]`
        );
        if(!target) return;

        const frame = exercise.diagram?.frames?.[0];
        if(!frame || typeof s19PitchSvg !== "function") return;

        target.innerHTML = `
            <div class="s244-setup-thumb" title="Opsætning · Trin 1">
                ${s19PitchSvg(exercise.diagram.pitch || "plain", frame, 0)}
            </div>
        `;
    }

    /*
       V17's async medie-loader må gerne køre, men diagrammet vinder som
       cover, så "INGEN MEDIE" aldrig vises på grafiske øvelser.
    */
    if(typeof s17LoadExerciseThumbnail === "function"){
        const beforeThumb = s17LoadExerciseThumbnail;
        s17LoadExerciseThumbnail = async function(exercise){
            if(exercise?.diagram?.frames?.[0]){
                s244RenderSetupThumbnail(exercise);
                return;
            }
            return beforeThumb(exercise);
        };
    }


    /* =====================================================
       KEGLEFARVER – NORMALISERING + SVG/PDF
    ===================================================== */

    const beforeNormElement = typeof normElement === "function" ? normElement : null;
    if(beforeNormElement){
        normElement = function(x){
            const r = beforeNormElement(x);
            if(x.type === "cone" && !x.color) x.color = "#ff972d";
            return r;
        };
    }

    /*
       s19PitchSvg genererer PDF/thumbnail-SVG. Efter den eksisterende
       renderer har tegnet keglerne orange, erstattes farven pr. kegle.
    */
    if(typeof s19PitchSvg === "function"){
        const beforePitchSvg = s19PitchSvg;
        s19PitchSvg = function(pitch, frame, index=0){
            let svg = beforePitchSvg(pitch, frame, index);
            const cones = (frame?.elements || []).filter(x => x.type === "cone");

            cones.forEach(cone => {
                const color = cone.color || "#ff972d";
                /*
                   Rendererens kegle-polygon har fill="#ff972d".
                   Erstat én forekomst ad gangen i samme rækkefølge.
                */
                svg = svg.replace('fill="#ff972d"', `fill="${s13Esc(color)}"`);
            });

            return svg;
        };
    }


    /* =====================================================
       PDF – KUN MARKEREDE TRIN
       PDF kan ikke afspille JavaScript-animation. Derfor vises:
       OPSÆTNING + de animationstrin træneren har markeret.
    ===================================================== */

    if(typeof s17ExercisePdfMedia === "function"){
        const beforePdfMedia = s17ExercisePdfMedia;

        s17ExercisePdfMedia = async function(exercise){
            /*
               Kør først den normale media-del uden diagram for at undgå,
               at den gamle renderer automatisk tager alle trin med.
            */
            const diagram = exercise?.diagram;
            let media;

            if(diagram){
                const saved = exercise.diagram;
                exercise.diagram = null;
                try{
                    media = await beforePdfMedia(exercise);
                }finally{
                    exercise.diagram = saved;
                }
            }else{
                media = await beforePdfMedia(exercise);
            }

            if(!diagram?.frames?.length || typeof s19PitchSvg !== "function"){
                return media;
            }

            const allFrames = diagram.frames;
            const setup = allFrames[0];

            /*
               Trin 1 er altid OPSÆTNING.
               Derefter kommer kun de trin der er markeret "PDF".
               Hvis Trin 1 også er markeret, duplikeres det ikke.
            */
            const selected = allFrames
                .map((frame,index) => ({frame,index}))
                .filter(x => x.index > 0 && x.frame.includeInPdf !== false);

            const framesForPdf = [
                {frame:setup,index:0,setup:true},
                ...selected.map(x => ({...x,setup:false}))
            ];

            const diagrams = framesForPdf.map(({frame,index,setup}, pos) => `
                <div style="margin-top:${pos ? "4mm" : "0"};page-break-inside:avoid">
                    <div style="margin:0 0 1.5mm;color:#666;font-size:8px;font-weight:900;letter-spacing:.3px">
                        ${setup ? "OPSÆTNING" : s13Esc(frame.title || `TRIN ${index+1}`)}
                        ${!setup && Number(frame.duration||0) ? ` · ${Number(frame.duration)} SEK` : ""}
                    </div>
                    ${s19PitchSvg(diagram.pitch || "plain", frame, index)}
                </div>
            `).join("");

            return {
                ...media,
                imageHtml: `
                    <div style="margin-bottom:4mm">
                        ${diagrams}
                    </div>
                    ${media?.imageHtml || ""}
                `
            };
        };
    }


    /* =====================================================
       INITIALISERING
    ===================================================== */

    function init(){
        installStyles();
        initializeProfileLibrary();

        /*
           Gør eksisterende diagrammer klar til PDF-markering.
        */
        s13Data.exercises.forEach(ex => {
            if(ex.diagram?.frames){
                ex.diagram.frames.forEach(frame => {
                    if(typeof frame.includeInPdf !== "boolean"){
                        frame.includeInPdf = true;
                    }
                });
            }
        });

        saveLocal();
    }

    if(document.readyState === "loading"){
        document.addEventListener("DOMContentLoaded", () => setTimeout(init, 3300));
    }else{
        setTimeout(init, 3300);
    }

})();

/* START11 V24.6 – klikbart animationslink til den konkrete øvelse */
(function(){
    function s246AnimationUrl(id){
        const u=new URL(window.location.href);
        u.searchParams.set("start11Exercise",id);
        u.searchParams.set("start11Animation","1");
        return u.toString();
    }
    window.s246AnimationUrl=s246AnimationUrl;

    if(typeof s17ExercisePdfMedia==="function"){
        const before=s17ExercisePdfMedia;
        s17ExercisePdfMedia=async function(exercise){
            const r=await before(exercise);
            if(!exercise?.diagram?.frames?.length) return r;
            const url=s246AnimationUrl(exercise.id);
            return {...r,imageHtml:(r?.imageHtml||"")+`
                <div style="margin:4mm 0 2mm;padding:3mm;border:1px solid #bbb;border-radius:2mm;page-break-inside:avoid">
                    <div style="font-size:7px;font-weight:900;margin-bottom:1mm">FULD ANIMATION</div>
                    <a href="${s13Esc(url)}" style="font-size:9px;font-weight:900;color:#126b27;text-decoration:underline">SE ANIMATION I START11 →</a>
                </div>`};
        };
    }

    function tryOpen(){
        const p=new URLSearchParams(location.search);
        if(p.get("start11Animation")!=="1") return;
        const id=p.get("start11Exercise");
        const ex=s13Data?.exercises?.find?.(x=>String(x.id)===String(id));
        if(!ex?.diagram?.frames?.length || typeof window.s24OpenAnimation!=="function") return;
        const u=new URL(location.href);
        u.searchParams.delete("start11Exercise"); u.searchParams.delete("start11Animation");
        history.replaceState(null,"",u.toString());
        setTimeout(()=>window.s24OpenAnimation(ex),250);
    }
    window.addEventListener("load",()=>setTimeout(tryOpen,2500));
})();

/* =========================================================
   START11 – V24.7 WINDOWS-STYLE ØVELSESBANK
   ---------------------------------------------------------
   - Drag øvelse direkte ind i mappe
   - Drag mappe ind i anden mappe = undermappe
   - Drop på "Uden mappe" = flyt ud af mapper
   - Drop på "Alle øvelser" = rodniveau for mapper
   - Tydelig drop-highlight
   - Breadcrumb / sti
   - Mere kompakt Windows/Stifinder-inspireret mappepanel
   - Ensartet øvelses-grid
   - ⋯ menu på øvelser: Flyt, Rediger, Dupliker, Slet
   - "Flyt til..." dialog som mobilvenligt alternativ
   - Nye øvelser arver den mappe man står i
   Ingen AI.
========================================================= */

(function start11V247Explorer(){
    return; // V26.2: disabled; native exercise-bank renderer is used instead.

    function install(){
        if(document.getElementById("s247ExplorerStyles")) return;
        const s=document.createElement("style");
        s.id="s247ExplorerStyles";
        s.textContent=`
            /* Mere Stifinder-lignende layout */
            .s246banklayout{
                grid-template-columns:210px minmax(0,1fr)!important;
                gap:12px!important;
                align-items:start;
            }
            .s246folders{
                position:sticky;
                top:8px;
                padding:8px!important;
                border-color:rgba(255,255,255,.09)!important;
                background:linear-gradient(180deg,#071109,#050c07)!important;
            }
            .s246folderhead{
                min-height:30px;
                padding:0 2px 6px;
                border-bottom:1px solid rgba(255,255,255,.07);
            }
            .s246folderhead strong{font-size:7.2px!important;letter-spacing:.65px}
            .s246folder{
                position:relative;
                min-height:31px!important;
                margin:2px 0;
                border:1px solid transparent!important;
                border-radius:5px!important;
                transition:background .12s,border-color .12s,transform .12s;
            }
            .s246folder span{
                min-width:0;
                overflow:hidden;
                text-overflow:ellipsis;
                white-space:nowrap;
            }
            .s246folder.active{
                border-color:color-mix(in srgb,var(--s11-primary,#82ff54) 35%,transparent)!important;
                background:color-mix(in srgb,var(--s11-primary,#82ff54) 11%,transparent)!important;
            }
            .s246folder.s247-drop{
                border-color:var(--s11-primary,#82ff54)!important;
                background:color-mix(in srgb,var(--s11-primary,#82ff54) 20%,transparent)!important;
                box-shadow:0 0 0 2px color-mix(in srgb,var(--s11-primary,#82ff54) 12%,transparent);
                transform:translateX(2px);
            }
            .s246folder.s247-dragging{opacity:.42}
            .s246folderactions{display:none!important}

            .s247-pathbar{
                display:flex;
                align-items:center;
                gap:5px;
                min-height:34px;
                margin:0 0 8px;
                padding:5px 8px;
                border:1px solid rgba(255,255,255,.08);
                border-radius:6px;
                background:#071009;
                overflow-x:auto;
                scrollbar-width:thin;
            }
            .s247-pathhome,.s247-pathpart{
                flex:0 0 auto;
                border:0;
                background:transparent;
                color:#8c998f;
                font:inherit;
                font-size:6.5px;
                cursor:pointer;
                padding:3px 4px;
                border-radius:4px;
            }
            .s247-pathhome:hover,.s247-pathpart:hover{background:rgba(255,255,255,.05);color:#fff}
            .s247-pathpart.current{color:#fff;font-weight:900}
            .s247-chevron{color:#465149;font-size:7px}

            .s246list{
                display:grid!important;
                grid-template-columns:repeat(auto-fill,minmax(210px,1fr));
                gap:9px!important;
                align-content:start;
            }
            .s247-pathbar{grid-column:1/-1}
            .s246list>.s13mut{grid-column:1/-1}
            .s17-exercise-card{
                position:relative;
                min-width:0;
                margin:0!important;
                border:1px solid rgba(255,255,255,.08)!important;
                border-radius:7px!important;
                background:#071009!important;
                transition:border-color .12s,transform .12s,box-shadow .12s,opacity .12s;
            }
            .s17-exercise-card:hover{
                border-color:rgba(130,255,84,.25)!important;
                transform:translateY(-1px);
            }
            .s17-exercise-card.s247-dragging{opacity:.38}
            .s17-exercise-preview{
                display:grid!important;
                grid-template-columns:112px minmax(0,1fr) auto!important;
                gap:9px!important;
                align-items:center!important;
                min-height:92px;
                padding:8px!important;
            }
            .s17-exercise-thumb{
                width:112px!important;
                height:72px!important;
                border-radius:6px!important;
                overflow:hidden!important;
            }
            .s247-cardmenu{
                position:absolute;
                top:6px;
                right:6px;
                z-index:4;
                width:27px;
                height:27px;
                display:grid;
                place-items:center;
                border:1px solid rgba(255,255,255,.09);
                border-radius:5px;
                background:#09130b;
                color:#dbe4dc;
                font-size:13px;
                line-height:1;
                cursor:pointer;
            }
            .s247-cardmenu:hover{border-color:var(--s11-primary,#82ff54);color:#fff}
            .s247-context{
                position:fixed;
                z-index:2147483500;
                width:150px;
                padding:5px;
                border:1px solid rgba(130,255,84,.24);
                border-radius:7px;
                background:#071009;
                box-shadow:0 14px 38px rgba(0,0,0,.48);
            }
            .s247-context button{
                width:100%;
                min-height:29px;
                display:flex;
                align-items:center;
                gap:7px;
                padding:0 8px;
                border:0;
                border-radius:4px;
                background:transparent;
                color:#d6dfd8;
                font:inherit;
                font-size:6.5px;
                text-align:left;
                cursor:pointer;
            }
            .s247-context button:hover{background:rgba(130,255,84,.09);color:#fff}
            .s247-context button.danger{color:#ff8585}
            .s247-draghint{
                margin:7px 2px 0;
                color:#667269;
                font-size:5.8px;
                line-height:1.45;
            }
            .s247-moveoverlay{
                position:fixed;
                inset:0;
                z-index:2147483600;
                display:grid;
                place-items:center;
                padding:12px;
                background:rgba(0,0,0,.72);
            }
            .s247-movebox{
                width:min(430px,100%);
                max-height:min(620px,86vh);
                overflow:auto;
                padding:12px;
                border:1px solid rgba(130,255,84,.24);
                border-radius:9px;
                background:#071009;
                box-shadow:0 20px 60px rgba(0,0,0,.55);
            }
            .s247-movehead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
            .s247-movehead strong{font-size:8px}
            .s247-movedest{
                width:100%;
                min-height:34px;
                display:flex;
                align-items:center;
                gap:7px;
                margin:3px 0;
                padding:0 8px;
                border:1px solid rgba(255,255,255,.07);
                border-radius:5px;
                background:#09130b;
                color:#cdd7cf;
                font:inherit;
                font-size:6.8px;
                text-align:left;
                cursor:pointer;
            }
            .s247-movedest:hover{border-color:var(--s11-primary,#82ff54);background:rgba(130,255,84,.07)}
            @media(max-width:980px){
                .s246banklayout{grid-template-columns:175px minmax(0,1fr)!important}
                .s246list{grid-template-columns:1fr!important}
            }
            @media(max-width:760px){
                .s246banklayout{grid-template-columns:1fr!important}
                .s246folders{position:relative;top:auto;max-height:none!important}
                .s246list{grid-template-columns:1fr!important}
                .s17-exercise-preview{grid-template-columns:96px minmax(0,1fr)!important;padding-right:38px!important}
                .s17-exercise-thumb{width:96px!important;height:64px!important}
                .s17-exercise-preview>.s13btn{grid-column:1/-1;width:100%}
                .s247-draghint{display:none}
            }
        `;
        document.head.appendChild(s);
    }

    function rerender(){
        const target=document.getElementById("s13content");
        if(target && typeof s13Exercises==="function") s13Exercises(target);
    }

    function exerciseById(id){
        return (s13Data.exercises||[]).find(x=>String(x.id)===String(id));
    }

    function folderById(id){
        return s246Folders().find(x=>String(x.id)===String(id));
    }

    function saveAndRender(){
        s13Save();
        rerender();
    }

    function moveExercise(exerciseId,folderId){
        const ex=exerciseById(exerciseId);
        if(!ex) return;
        ex.folderId=(folderId==="root"||folderId==="all")?"":String(folderId||"");
        saveAndRender();
    }

    function moveFolder(folderId,parentId){
        const folder=folderById(folderId);
        if(!folder) return;
        const blocked=s246FolderDescendants(folderId);
        const destination=(parentId==="root"||parentId==="all")?"":String(parentId||"");
        if(destination && blocked.has(destination)) return;
        folder.parentId=destination;
        saveAndRender();
    }

    function currentPathIds(){
        const filter=String(window.s246ExerciseFolderFilter||"all");
        if(filter==="all"||filter==="root") return [];
        const ids=[],seen=new Set();
        let f=folderById(filter);
        while(f&&!seen.has(String(f.id))){
            seen.add(String(f.id));
            ids.unshift(String(f.id));
            f=folderById(f.parentId);
        }
        return ids;
    }

    function addBreadcrumb(list){
        if(list.querySelector(".s247-pathbar")) return;
        const filter=String(window.s246ExerciseFolderFilter||"all");
        const path=currentPathIds();
        const bar=document.createElement("div");
        bar.className="s247-pathbar";
        bar.innerHTML=`
            <button type="button" class="s247-pathhome" data-s247-path="all">▦ ØVELSESBANK</button>
            ${
                filter==="root"
                ? `<span class="s247-chevron">›</span><button type="button" class="s247-pathpart current" data-s247-path="root">UDEN MAPPE</button>`
                : path.map((id,i)=>`<span class="s247-chevron">›</span><button type="button" class="s247-pathpart ${i===path.length-1?"current":""}" data-s247-path="${s13Esc(id)}">${s13Esc(folderById(id)?.name||"Mappe")}</button>`).join("")
            }
        `;
        list.prepend(bar);
        bar.querySelectorAll("[data-s247-path]").forEach(b=>b.onclick=()=>{
            window.s246ExerciseFolderFilter=b.dataset.s247Path;
            rerender();
        });
    }

    function closeMenus(){
        document.querySelectorAll(".s247-context").forEach(x=>x.remove());
    }

    function moveDialog(exerciseId){
        const ex=exerciseById(exerciseId);
        if(!ex) return;
        closeMenus();
        const overlay=document.createElement("div");
        overlay.className="s247-moveoverlay";
        const rows=[
            `<button class="s247-movedest" data-dest="">⌂ Uden mappe</button>`,
            ...s246Folders().map(f=>`<button class="s247-movedest" data-dest="${s13Esc(f.id)}">📁 ${s13Esc(s246FolderPath(f.id))}</button>`)
        ].join("");
        overlay.innerHTML=`<div class="s247-movebox">
            <div class="s247-movehead"><strong>FLYT “${s13Esc(ex.title||"ØVELSE")}”</strong><button type="button" class="s13btn" data-close>LUK</button></div>
            ${rows}
        </div>`;
        document.body.appendChild(overlay);
        overlay.querySelector("[data-close]").onclick=()=>overlay.remove();
        overlay.addEventListener("click",e=>{if(e.target===overlay) overlay.remove();});
        overlay.querySelectorAll("[data-dest]").forEach(b=>b.onclick=()=>{
            ex.folderId=b.dataset.dest||"";
            s13Save(); overlay.remove(); rerender();
        });
    }

    function duplicateExercise(id){
        const ex=exerciseById(id);
        if(!ex) return;
        const copy=JSON.parse(JSON.stringify(ex));
        copy.id=s13Id("exercise");
        copy.title=(ex.title||"Øvelse")+" – kopi";
        s13Data.exercises.push(copy);
        s13Save();
        rerender();
    }

    function deleteExercise(id){
        const ex=exerciseById(id);
        if(!ex) return;
        if(!confirm(`Slet øvelsen "${ex.title||"Øvelse"}"?`)) return;
        s13Data.exercises=s13Data.exercises.filter(x=>String(x.id)!==String(id));
        if(String(window.s13Exercise||"")===String(id) || (typeof s13Exercise!=="undefined"&&String(s13Exercise)===String(id))){
            try{s13Exercise="";}catch(e){}
        }
        s13Save(); rerender();
    }

    function cardMenu(button,id){
        closeMenus();
        const r=button.getBoundingClientRect();
        const menu=document.createElement("div");
        menu.className="s247-context";
        menu.innerHTML=`
            <button type="button" data-action="move">📁 Flyt til mappe…</button>
            <button type="button" data-action="edit">✎ Rediger</button>
            <button type="button" data-action="duplicate">⧉ Dupliker</button>
            <button type="button" class="danger" data-action="delete">✕ Slet</button>
        `;
        document.body.appendChild(menu);
        const width=150;
        menu.style.left=Math.max(6,Math.min(innerWidth-width-6,r.right-width))+"px";
        menu.style.top=Math.min(innerHeight-150,r.bottom+4)+"px";
        menu.querySelector('[data-action="move"]').onclick=()=>moveDialog(id);
        menu.querySelector('[data-action="edit"]').onclick=()=>{
            closeMenus();
            try{s13Exercise=id;}catch(e){}
            rerender();
        };
        menu.querySelector('[data-action="duplicate"]').onclick=()=>{closeMenus();duplicateExercise(id);};
        menu.querySelector('[data-action="delete"]').onclick=()=>{closeMenus();deleteExercise(id);};
        setTimeout(()=>document.addEventListener("pointerdown",function once(e){
            if(!menu.contains(e.target)&&e.target!==button){menu.remove();document.removeEventListener("pointerdown",once);}
        }),0);
    }

    function enhance(){
        install();
        const target=document.getElementById("s13content");
        if(!target) return;
        const list=target.querySelector(".s246list");
        const sidebar=target.querySelector(".s246folders");
        if(!list||!sidebar) return;

        addBreadcrumb(list);

        // Helpful one-line hint under folder tree.
        if(!sidebar.querySelector(".s247-draghint")){
            const hint=document.createElement("div");
            hint.className="s247-draghint";
            hint.textContent="Træk en øvelse over på en mappe for at flytte den. Mapper kan også trækkes ind i andre mapper.";
            sidebar.appendChild(hint);
        }

        // Exercise cards: draggable + ⋯ menu.
        target.querySelectorAll(".s17-exercise-card").forEach(card=>{
            const edit=card.querySelector("[data-edit-exercise]");
            const id=edit?.dataset.editExercise;
            if(!id) return;
            card.draggable=true;
            card.dataset.s247Exercise=id;
            card.addEventListener("dragstart",e=>{
                card.classList.add("s247-dragging");
                e.dataTransfer.effectAllowed="move";
                e.dataTransfer.setData("application/x-start11-exercise",id);
                e.dataTransfer.setData("text/plain","exercise:"+id);
            });
            card.addEventListener("dragend",()=>card.classList.remove("s247-dragging"));

            if(!card.querySelector(".s247-cardmenu")){
                const m=document.createElement("button");
                m.type="button";m.className="s247-cardmenu";m.textContent="⋯";
                m.title="Flere muligheder";
                m.onclick=e=>{e.stopPropagation();cardMenu(m,id);};
                card.appendChild(m);
            }
        });

        // Folder targets + draggable folders.
        target.querySelectorAll("[data-s246-folder]").forEach(folderButton=>{
            const id=String(folderButton.dataset.s246Folder||"");
            if(id!=="all"&&id!=="root"){
                folderButton.draggable=true;
                folderButton.addEventListener("dragstart",e=>{
                    folderButton.classList.add("s247-dragging");
                    e.dataTransfer.effectAllowed="move";
                    e.dataTransfer.setData("application/x-start11-folder",id);
                    e.dataTransfer.setData("text/plain","folder:"+id);
                });
                folderButton.addEventListener("dragend",()=>folderButton.classList.remove("s247-dragging"));
            }

            folderButton.addEventListener("dragover",e=>{
                const types=[...e.dataTransfer.types];
                if(types.includes("application/x-start11-exercise")||types.includes("application/x-start11-folder")){
                    e.preventDefault();
                    e.dataTransfer.dropEffect="move";
                    folderButton.classList.add("s247-drop");
                }
            });
            folderButton.addEventListener("dragleave",()=>folderButton.classList.remove("s247-drop"));
            folderButton.addEventListener("drop",e=>{
                e.preventDefault();
                folderButton.classList.remove("s247-drop");
                const exId=e.dataTransfer.getData("application/x-start11-exercise");
                const folderId=e.dataTransfer.getData("application/x-start11-folder");
                if(exId) return moveExercise(exId,id);
                if(folderId && folderId!==id) return moveFolder(folderId,id);
            });
        });

        // New exercise automatically belongs to the open folder.
        const newBtn=document.getElementById("s17NewExercise");
        if(newBtn&&!newBtn.dataset.s247FolderDefault){
            newBtn.dataset.s247FolderDefault="1";
            newBtn.addEventListener("click",()=>{
                const filter=String(window.s246ExerciseFolderFilter||"all");
                window.s247PendingFolder=(filter==="all"||filter==="root")?"":filter;
            },true);
        }

        const folderSelect=document.getElementById("s246ExerciseFolder");
        if(folderSelect && !folderSelect.dataset.s247Defaulted){
            folderSelect.dataset.s247Defaulted="1";
            const editingId=(typeof s13Exercise!=="undefined")?String(s13Exercise||""):"";
            if(!editingId && window.s247PendingFolder){
                folderSelect.value=window.s247PendingFolder;
            }
        }
    }

    // Make the existing save path inherit current folder for a newly-created exercise.
    document.addEventListener("click",e=>{
        const save=e.target.closest?.("#s17SaveExercise");
        if(!save) return;
        const select=document.getElementById("s246ExerciseFolder");
        if(select && !select.value && window.s247PendingFolder) select.value=window.s247PendingFolder;
        setTimeout(()=>{window.s247PendingFolder="";},100);
    },true);

    let timer;
    const schedule=()=>{clearTimeout(timer);timer=setTimeout(enhance,30);};
    if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",schedule);
    else schedule();

    const observer=new MutationObserver(schedule);
    const startObserve=()=>{
        const root=document.getElementById("s13content");
        if(root) observer.observe(root,{childList:true,subtree:true});
        else setTimeout(startObserve,250);
    };
    startObserve();

})();

/* =========================================================
   START11 – V24.8 LARGE FOLDERS + HOLD/DRAG
   ---------------------------------------------------------
   Retter V24.7:
   - Større og langt tydeligere mapper
   - Hele øvelseskortet kan holdes/trækkes
   - Pointer-baseret drag virker uden HTML5 draggable-problemer
   - Hold ~180 ms og træk øvelse til mappe
   - Virker med mus og touch/pen
   - Tydelig ghost + grøn destination
========================================================= */
(function start11V248HoldDrag(){
    return; // V26.2: disabled; replaced by stable drag/drop below.

    function installStyles(){
        if(document.getElementById("s248HoldDragStyles")) return;
        const s=document.createElement("style");
        s.id="s248HoldDragStyles";
        s.textContent=`
            .s246banklayout{
                grid-template-columns:260px minmax(0,1fr)!important;
                gap:14px!important;
            }
            .s246folders{
                padding:12px!important;
                border-radius:9px!important;
                border:1px solid rgba(130,255,84,.16)!important;
            }
            .s246folderhead{
                min-height:42px!important;
                margin-bottom:8px!important;
            }
            .s246folderhead strong{
                font-size:9px!important;
                letter-spacing:.7px!important;
            }
            .s246folderhead .s13btn{
                min-width:34px!important;
                min-height:34px!important;
                font-size:10px!important;
            }
            .s246folder{
                min-height:43px!important;
                margin:4px 0!important;
                padding:5px 9px 5px calc(9px + var(--d,0)*16px)!important;
                border-radius:7px!important;
                font-size:8px!important;
                font-weight:800!important;
            }
            .s246folder span{
                display:flex!important;
                align-items:center!important;
                gap:7px!important;
            }
            .s246folder small{
                min-width:22px;
                padding:3px 5px;
                border-radius:999px;
                background:rgba(130,255,84,.08);
                text-align:center;
                font-size:7px!important;
            }
            .s246folder.active{
                border-color:rgba(130,255,84,.48)!important;
                background:rgba(130,255,84,.12)!important;
            }
            .s246folder.s248-target{
                border-color:var(--s11-primary,#82ff54)!important;
                background:rgba(130,255,84,.23)!important;
                box-shadow:0 0 0 3px rgba(130,255,84,.12), inset 0 0 20px rgba(130,255,84,.05)!important;
                transform:translateX(4px) scale(1.015)!important;
            }
            .s247-draghint{
                margin-top:10px!important;
                padding:8px!important;
                border:1px dashed rgba(130,255,84,.18);
                border-radius:6px;
                color:#8e9b91!important;
                font-size:6.5px!important;
            }

            .s17-exercise-card{
                cursor:grab!important;
                user-select:none;
                -webkit-user-select:none;
                touch-action:pan-y;
            }
            .s17-exercise-card:active{cursor:grabbing!important}
            .s17-exercise-card.s248-armed{
                border-color:rgba(130,255,84,.55)!important;
                box-shadow:0 0 0 2px rgba(130,255,84,.10)!important;
            }
            body.s248-drag-active{
                cursor:grabbing!important;
                user-select:none!important;
                -webkit-user-select:none!important;
            }
            body.s248-drag-active .s17-exercise-card{cursor:grabbing!important}
            .s248-ghost{
                position:fixed;
                z-index:2147483640;
                width:260px;
                max-width:44vw;
                pointer-events:none;
                opacity:.92;
                transform:rotate(1.5deg);
                border:1px solid var(--s11-primary,#82ff54);
                border-radius:8px;
                background:#071009;
                box-shadow:0 18px 50px rgba(0,0,0,.58);
                overflow:hidden;
            }
            .s248-ghost-inner{
                display:grid;
                grid-template-columns:74px minmax(0,1fr);
                align-items:center;
                gap:9px;
                min-height:72px;
                padding:8px;
            }
            .s248-ghost-thumb{
                width:74px;height:52px;border-radius:5px;overflow:hidden;background:#176a36;
            }
            .s248-ghost-thumb>*{width:100%!important;height:100%!important}
            .s248-ghost-title{font-size:8px;font-weight:900;color:#fff}
            .s248-ghost-sub{margin-top:4px;font-size:6px;color:#91a096}
            .s248-drop-toast{
                position:fixed;
                left:50%;bottom:24px;
                z-index:2147483641;
                transform:translateX(-50%);
                padding:9px 13px;
                border:1px solid rgba(130,255,84,.35);
                border-radius:7px;
                background:#071009;
                color:#fff;
                font-size:7px;
                font-weight:900;
                box-shadow:0 12px 35px rgba(0,0,0,.4);
                pointer-events:none;
            }
            @media(max-width:1050px){
                .s246banklayout{grid-template-columns:220px minmax(0,1fr)!important}
            }
            @media(max-width:760px){
                .s246banklayout{grid-template-columns:1fr!important}
                .s246folder{min-height:46px!important;font-size:8.5px!important}
                .s246folders{padding:10px!important}
                .s248-ghost{width:220px;max-width:68vw}
            }
        `;
        document.head.appendChild(s);
    }

    const state={
        card:null,id:"",pointerId:null,
        startX:0,startY:0,x:0,y:0,
        timer:null,armed:false,dragging:false,
        ghost:null,target:null
    };

    function clearTarget(){
        document.querySelectorAll(".s248-target").forEach(x=>x.classList.remove("s248-target"));
        state.target=null;
    }

    function reset(){
        clearTimeout(state.timer);
        clearTarget();
        state.card?.classList.remove("s248-armed");
        state.ghost?.remove();
        document.body.classList.remove("s248-drag-active");
        Object.assign(state,{
            card:null,id:"",pointerId:null,startX:0,startY:0,x:0,y:0,
            timer:null,armed:false,dragging:false,ghost:null,target:null
        });
    }

    function makeGhost(card,id){
        const ex=(s13Data.exercises||[]).find(x=>String(x.id)===String(id));
        const ghost=document.createElement("div");
        ghost.className="s248-ghost";
        const thumb=card.querySelector(".s17-exercise-thumb");
        ghost.innerHTML=`
            <div class="s248-ghost-inner">
                <div class="s248-ghost-thumb">${thumb?.innerHTML||""}</div>
                <div>
                    <div class="s248-ghost-title">${s13Esc(ex?.title||"Øvelse")}</div>
                    <div class="s248-ghost-sub">Slip på en mappe for at flytte</div>
                </div>
            </div>`;
        document.body.appendChild(ghost);
        state.ghost=ghost;
        moveGhost();
    }

    function moveGhost(){
        if(!state.ghost) return;
        state.ghost.style.left=(state.x+16)+"px";
        state.ghost.style.top=(state.y+14)+"px";
    }

    function arm(){
        if(!state.card) return;
        state.armed=true;
        state.card.classList.add("s248-armed");
    }

    function beginDrag(){
        if(state.dragging||!state.card) return;
        state.dragging=true;
        state.armed=true;
        state.card.classList.add("s248-armed");
        document.body.classList.add("s248-drag-active");
        makeGhost(state.card,state.id);
        updateTarget();
    }

    function folderUnderPointer(){
        if(state.ghost) state.ghost.style.display="none";
        const el=document.elementFromPoint(state.x,state.y);
        if(state.ghost) state.ghost.style.display="";
        return el?.closest?.("[data-s246-folder]")||null;
    }

    function updateTarget(){
        clearTarget();
        const folder=folderUnderPointer();
        if(!folder) return;
        folder.classList.add("s248-target");
        state.target=folder;
    }

    function toast(text){
        document.querySelectorAll(".s248-drop-toast").forEach(x=>x.remove());
        const t=document.createElement("div");
        t.className="s248-drop-toast";t.textContent=text;
        document.body.appendChild(t);
        setTimeout(()=>t.remove(),1300);
    }

    function finish(){
        if(!state.card){ reset(); return; }
        const id=state.id;
        const target=state.target;
        const wasDragging=state.dragging;
        if(wasDragging&&target){
            const destination=String(target.dataset.s246Folder||"");
            const ex=(s13Data.exercises||[]).find(x=>String(x.id)===String(id));
            if(ex){
                ex.folderId=(destination==="all"||destination==="root")?"":destination;
                const label=destination==="all"||destination==="root"
                    ?"Uden mappe"
                    :(typeof s246FolderPath==="function"?s246FolderPath(destination):"mappe");
                s13Save();
                toast("Flyttet til "+label);
                const targetEl=document.getElementById("s13content");
                reset();
                if(targetEl&&typeof s13Exercises==="function") s13Exercises(targetEl);
                return;
            }
        }
        reset();
    }

    function pointerDown(e){
        if(e.button!==undefined&&e.button!==0) return;
        if(e.target.closest("button,input,select,textarea,a,.s247-cardmenu")) return;
        const card=e.target.closest(".s17-exercise-card");
        if(!card) return;
        const edit=card.querySelector("[data-edit-exercise]");
        const id=edit?.dataset.editExercise||card.dataset.s247Exercise;
        if(!id) return;

        reset();
        state.card=card;state.id=id;state.pointerId=e.pointerId;
        state.startX=state.x=e.clientX;state.startY=state.y=e.clientY;
        state.timer=setTimeout(arm,180);

        try{card.setPointerCapture(e.pointerId);}catch(_){}
    }

    function pointerMove(e){
        if(!state.card||e.pointerId!==state.pointerId) return;
        state.x=e.clientX;state.y=e.clientY;
        const distance=Math.hypot(state.x-state.startX,state.y-state.startY);

        // A tiny movement before hold = normal scroll/click.
        // After ~180ms, or a deliberate mouse movement, start dragging.
        if(!state.dragging){
            if(state.armed || (e.pointerType==="mouse"&&distance>7)){
                clearTimeout(state.timer);
                beginDrag();
            }else if(distance>14){
                clearTimeout(state.timer);
                state.timer=null;
                return;
            }
        }
        if(state.dragging){
            e.preventDefault();
            moveGhost();
            updateTarget();
        }
    }

    function pointerUp(e){
        if(!state.card||e.pointerId!==state.pointerId) return;
        clearTimeout(state.timer);
        finish();
    }

    function pointerCancel(e){
        if(state.pointerId===e.pointerId) reset();
    }

    document.addEventListener("pointerdown",pointerDown,true);
    document.addEventListener("pointermove",pointerMove,{capture:true,passive:false});
    document.addEventListener("pointerup",pointerUp,true);
    document.addEventListener("pointercancel",pointerCancel,true);

    // Disable native HTML5 dragging on exercise cards: V24.8 uses pointer drag instead.
    document.addEventListener("dragstart",e=>{
        if(e.target.closest?.(".s17-exercise-card")){
            e.preventDefault();
        }
    },true);

    installStyles();

    // Update hint text whenever the exercise bank is rendered.
    const observer=new MutationObserver(()=>{
        const hint=document.querySelector(".s247-draghint");
        if(hint) hint.textContent="Hold på et øvelseskort og træk det direkte over på en mappe. Slip når mappen lyser grønt.";
    });
    const wait=()=>{
        const root=document.getElementById("s13content");
        if(root){
            observer.observe(root,{childList:true,subtree:true});
            const hint=root.querySelector(".s247-draghint");
            if(hint) hint.textContent="Hold på et øvelseskort og træk det direkte over på en mappe. Slip når mappen lyser grønt.";
        }else setTimeout(wait,250);
    };
    wait();

})();


