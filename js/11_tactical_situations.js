/* =========================================================
   START11 V25 – NATIVE VISIBLE FEATURES
   Directly connected to the active match bar and squad renderer.
========================================================= */
(function(){
  const esc=v=>typeof s13Esc==="function"?s13Esc(String(v??"")):String(v??"");
  const clone=v=>JSON.parse(JSON.stringify(v));
  const uid=p=>p+"_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,7);

  /* ---------- final data normalization: folders + tactics ---------- */
  if(typeof s13Norm==="function"){
    const prev=s13Norm;
    s13Norm=function(raw={}){
      const d=prev(raw);
      d.exerciseFolders=Array.isArray(raw.exerciseFolders)?raw.exerciseFolders:(Array.isArray(d.exerciseFolders)?d.exerciseFolders:[]);
      d.matchTacticalSituations=raw.matchTacticalSituations&&typeof raw.matchTacticalSituations==="object"?raw.matchTacticalSituations:(d.matchTacticalSituations||{});
      return d;
    };
  }
  if(!Array.isArray(s13Data.exerciseFolders))s13Data.exerciseFolders=[];
  if(!s13Data.matchTacticalSituations||typeof s13Data.matchTacticalSituations!=="object")s13Data.matchTacticalSituations={};

  /* folders are now in s13Data and therefore collectTeamData/start11CoachHub.
     Keep a profile-local safety copy too, so a cloud refresh cannot erase them. */
  const folderKey=()=>`start11.v25.exerciseFolders.${session?.user?.id||"local"}`;
  function saveFolderBackup(){
    try{localStorage.setItem(folderKey(),JSON.stringify({
      folders:clone(s13Data.exerciseFolders||[]),
      assignments:(s13Data.exercises||[]).map(e=>({id:e.id,folderId:e.folderId||""}))
    }))}catch(_){}
  }
  function restoreFolderBackup(){
    try{
      const d=JSON.parse(localStorage.getItem(folderKey())||"null");if(!d)return;
      if(Array.isArray(d.folders)&&(!s13Data.exerciseFolders||!s13Data.exerciseFolders.length))s13Data.exerciseFolders=clone(d.folders);
      const m=new Map((d.assignments||[]).map(x=>[String(x.id),x.folderId||""]));
      (s13Data.exercises||[]).forEach(e=>{if(!e.folderId&&m.has(String(e.id)))e.folderId=m.get(String(e.id))});
    }catch(_){}
  }
  restoreFolderBackup();
  if(typeof s13Save==="function"){
    const prev=s13Save;
    s13Save=function(){saveFolderBackup();return prev.apply(this,arguments)};
  }

  /* ---------- styles ---------- */
  const st=document.createElement("style");st.id="s25nativecss";st.textContent=`
  #s25SquadGroups{display:flex;gap:5px;align-items:center;flex-wrap:wrap;margin:0 0 8px;padding:7px;border:1px solid rgba(130,255,84,.2);border-radius:6px;background:#071009}
  .s25gchip{padding:5px 7px;border:1px solid rgba(255,255,255,.08);border-radius:5px;background:#0b160d;color:#fff;font-size:6px;font-weight:900}
  .s25grouphead{display:flex;justify-content:space-between;align-items:center;padding:6px 8px;margin:5px 0 2px;border:1px solid rgba(130,255,84,.15);border-radius:5px;background:#0a160c;color:#fff;font-size:6px;font-weight:950}.s25grouphead b{color:var(--s11-primary,#82ff54)}
  #s25PlayerGroup{width:100%;min-height:36px;padding:7px;border:1px solid rgba(255,255,255,.12);border-radius:5px;background:#0a160d;color:#fff}
  .s25overlay{position:fixed;inset:0;z-index:2147483646;display:grid;place-items:center;padding:12px;background:#000d}
  .s25shell{width:min(1120px,96vw);max-height:94vh;overflow:auto;border:1px solid rgba(130,255,84,.35);border-radius:10px;background:#061008}
  .s25top{position:sticky;top:0;z-index:20;display:flex;gap:6px;align-items:center;flex-wrap:wrap;padding:10px;border-bottom:1px solid rgba(255,255,255,.08);background:#071009}.s25top strong{margin-right:auto;font-size:9px}
  .s25cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px;padding:12px}.s25card{padding:9px;border:1px solid rgba(255,255,255,.09);border-radius:7px;background:#0a150c}.s25card strong{font-size:8px}.s25card p{min-height:18px;color:#849087;font-size:6px}
  .s25main{display:grid;grid-template-columns:minmax(0,1fr) 290px}.s25boardwrap{padding:12px;display:grid;place-items:center}.s25pitch{position:relative;width:min(100%,610px);aspect-ratio:68/105;background:#176b37;border:2px solid #fff;overflow:hidden;touch-action:none}
  .s25half{position:absolute;left:0;right:0;top:50%;border-top:2px solid #fff9}.s25circle{position:absolute;left:50%;top:50%;width:22%;aspect-ratio:1;border:2px solid #fff9;border-radius:50%;transform:translate(-50%,-50%)}.s25box{position:absolute;left:25%;width:50%;height:15%;border:2px solid #fff9}.s25box.a{top:-2px}.s25box.b{bottom:-2px}
  .s25piece{position:absolute;transform:translate(-50%,-50%);z-index:5;cursor:grab;user-select:none;touch-action:none}.s25player,.s25opp{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font-size:8px;font-weight:950;box-shadow:0 3px 8px #0008}.s25player{background:var(--s11-shirt,#c8ff00);color:var(--s11-shirt-text,#071008);border:2px solid #fff}.s25player.gk{background:var(--s11-gk-shirt,#e31d1d);color:#fff}.s25opp{background:#eee;color:#111;border:2px solid #222}.s25name{position:absolute;top:37px;left:50%;transform:translateX(-50%);padding:2px 4px;background:#061008;color:#fff;border-radius:3px;font-size:5px;white-space:nowrap}.s25ball{width:15px;height:15px;border-radius:50%;background:#fff;border:3px dotted #111}.s25zone{position:absolute;z-index:2;border:2px dashed #ffe64d;background:#ffe64d22;cursor:grab}.s25svg{position:absolute;inset:0;width:100%;height:100%;z-index:3;pointer-events:none}
  .s25side{padding:11px;border-left:1px solid rgba(255,255,255,.08)}.s25field{display:grid;gap:4px;margin-bottom:9px}.s25field label{font-size:6px;color:#929d95;font-weight:900}.s25field input,.s25field textarea{box-sizing:border-box;width:100%;padding:7px;border:1px solid rgba(255,255,255,.11);border-radius:6px;background:#0a160d;color:#fff;font:inherit;font-size:7px}.s25field textarea{min-height:76px;resize:vertical}
  @media(max-width:780px){.s25main{grid-template-columns:1fr}.s25side{border-left:0;border-top:1px solid rgba(255,255,255,.08)}}
  `;document.head.appendChild(st);

  /* ---------- squad groups ---------- */
  const groupKey=()=>`start11.v25.squadGroups.${start11V8GetActiveTeamId?.()||"team"}`;
  function gdLoad(){try{const d=JSON.parse(localStorage.getItem(groupKey())||"null");if(d?.groups)return d}catch(_){}return{groups:[{id:"own",name:"Egen trup"},{id:"u16",name:"U16"},{id:"u13",name:"U13"}],players:{}}}
  let gd=gdLoad();
  function gdSave(){localStorage.setItem(groupKey(),JSON.stringify(gd))}
  const pgroup=p=>gd.players[String(p.id)]||"own";

  window.s25MountSquadGroups=function(){
    const list=document.getElementById("fullSquadList");if(!list)return;
    let bar=document.getElementById("s25SquadGroups");
    if(!bar){bar=document.createElement("div");bar.id="s25SquadGroups";list.insertAdjacentElement("beforebegin",bar)}
    bar.innerHTML=gd.groups.map(g=>`<span class="s25gchip">${esc(g.name)} · ${(start11FullSquad||[]).filter(p=>pgroup(p)===g.id).length}</span>`).join("")+
      `<button type="button" class="s13btn primary" id="s25NewGroup">+ NY GRUPPE</button><button type="button" class="s13btn" id="s25ManageGroups">ADMINISTRER</button>`;
    bar.querySelector("#s25NewGroup").onclick=()=>{const n=prompt("Navn på ny trupgruppe:","Ny gruppe");if(!n?.trim())return;gd.groups.push({id:uid("grp"),name:n.trim()});gdSave();start11RenderFullSquad()};
    bar.querySelector("#s25ManageGroups").onclick=()=>{const lines=gd.groups.map((g,i)=>`${i+1}. ${g.name}`).join("\n");const i=Number(prompt("Vælg gruppe:\n\n"+lines,"1"))-1;const g=gd.groups[i];if(!g)return;const a=prompt("1 = Omdøb\n2 = Slet","1");if(a==="1"){const n=prompt("Nyt navn:",g.name);if(n?.trim()){g.name=n.trim();gdSave();start11RenderFullSquad()}}else if(a==="2"&&g.id!=="own"&&confirm(`Slet ${g.name}?`)){Object.keys(gd.players).forEach(k=>{if(gd.players[k]===g.id)gd.players[k]="own"});gd.groups=gd.groups.filter(x=>x.id!==g.id);gdSave();start11RenderFullSquad()}};
  };
  window.s25OrganizeSquadRows=function(){
    const list=document.getElementById("fullSquadList");if(!list)return;
    const rows=[...list.querySelectorAll(":scope > .full-squad-row")];if(!rows.length)return;
    const map=new Map(rows.map(r=>[String(r.dataset.playerId),r]));list.innerHTML="";
    gd.groups.forEach(g=>{const ids=(start11GetVisibleSquad?.()||[]).filter(p=>pgroup(p)===g.id).map(p=>String(p.id));if(!ids.length)return;const h=document.createElement("div");h.className="s25grouphead";h.innerHTML=`<span>▾ ${esc(g.name)}</span><b>${ids.length}</b>`;list.appendChild(h);ids.forEach(x=>{const r=map.get(x);if(r)list.appendChild(r)})});
  };
  window.s25MountPlayerGroupSelect=function(player){
    const grid=document.querySelector("#squadPlayerModal .squad-player-form-grid");if(!grid)return;
    let w=document.getElementById("s25PlayerGroupWrap");if(!w){w=document.createElement("label");w.id="s25PlayerGroupWrap";w.innerHTML=`Trupgruppe<select id="s25PlayerGroup"></select>`;grid.appendChild(w)}
    const s=w.querySelector("select");s.innerHTML=gd.groups.map(g=>`<option value="${esc(g.id)}">${esc(g.name)}</option>`).join("");s.value=player?pgroup(player):"own";
  };
  document.addEventListener("click",e=>{
    if(!e.target.closest?.("#saveSquadPlayerButton"))return;
    const old=start11EditingSquadPlayerId,name=document.getElementById("squadPlayerName")?.value.trim(),g=document.getElementById("s25PlayerGroup")?.value||"own";
    setTimeout(()=>{let p=old?start11FullSquad.find(x=>x.id===old):null;if(!p&&name)p=[...start11FullSquad].reverse().find(x=>x.name===name);if(p){gd.players[String(p.id)]=g;gdSave();start11RenderFullSquad()}},30);
  },true);

  /* ---------- match tactical situations ---------- */
  function mkey(){return String(s19MatchMode?.key||[kampplan?.matchDate,kampplan?.homeTeam,kampplan?.awayTeam].filter(Boolean).join("|")||"current")}
  function lineup(){
    const f=formationer[formationSelector?.value]||[];
    return f.slice(0,11).map((pos,i)=>{const p=spillere[i]||{};return{name:p.name||pos[0]||`Spiller ${i+1}`,number:p.number||"",gk:i===0||pos[0]==="GK",x:Number(pos[1]||50),y:Number(pos[2]||50)}})
  }
  function mk(title){return{id:uid("sit"),title,focus:"",note:"",includeInPdf:true,players:lineup(),opponents:[],balls:[],arrows:[],zones:[]}}
  function arr(){const k=mkey();if(!Array.isArray(s13Data.matchTacticalSituations[k]))s13Data.matchTacticalSituations[k]=[mk("Med bold"),mk("Uden bold")];return s13Data.matchTacticalSituations[k]}
  function save(){s13Save?.()}

  window.s25OpenMatchSituations=function(){
    document.getElementById("s25manager")?.remove();
    const o=document.createElement("div");o.id="s25manager";o.className="s25overlay";o.innerHTML=`<div class="s25shell" style="width:min(780px,96vw)"><div class="s25top"><strong>KAMPSITUATIONER · ${esc(s19Opponent?.(s19MatchMode?.match)||"KAMP")}</strong><button class="s13btn primary" data-new>+ OPRET SITUATION</button><button class="s13btn" data-close>LUK</button></div><div class="s25cards" id="s25cards"></div></div>`;document.body.appendChild(o);
    const render=()=>{const h=o.querySelector("#s25cards");h.innerHTML=arr().map(s=>`<div class="s25card"><strong>${esc(s.title)}</strong><p>${esc(s.focus||"Intet fokuspunkt endnu")}</p><div style="display:flex;justify-content:space-between;gap:5px"><button class="s13btn" data-edit="${esc(s.id)}">REDIGER TAVLE</button><label style="font-size:6px;color:#89958c"><input type="checkbox" data-pdf="${esc(s.id)}" ${s.includeInPdf!==false?"checked":""}> PDF</label></div></div>`).join("");h.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>board(b.dataset.edit,render));h.querySelectorAll("[data-pdf]").forEach(c=>c.onchange=()=>{const s=arr().find(x=>x.id===c.dataset.pdf);s.includeInPdf=c.checked;save()})};
    o.querySelector("[data-close]").onclick=()=>o.remove();o.querySelector("[data-new]").onclick=()=>{const n=prompt("Navn på situationen:","Ny kampsituation");if(!n?.trim())return;const s=mk(n.trim());arr().push(s);save();render();board(s.id,render)};render();
  };

  function board(id,after){
    const s=arr().find(x=>x.id===id);if(!s)return;["players","opponents","balls","arrows","zones"].forEach(k=>{if(!Array.isArray(s[k]))s[k]=k==="players"?lineup():[]});
    const o=document.createElement("div");o.className="s25overlay";o.innerHTML=`<div class="s25shell"><div class="s25top"><strong>TAKTISK TAVLE · ${esc(s.title)}</strong><button class="s13btn" data-a="opp">+ MODSPILLER</button><button class="s13btn" data-a="ball">+ BOLD</button><button class="s13btn" data-a="arrow">+ PIL</button><button class="s13btn" data-a="zone">+ ZONE</button><button class="s13btn" data-reset>NULSTIL XI</button><button class="s13btn primary" data-save>GEM</button><button class="s13btn" data-close>LUK</button></div><div class="s25main"><div class="s25boardwrap"><div class="s25pitch" id="s25pitch"><div class="s25half"></div><div class="s25circle"></div><div class="s25box a"></div><div class="s25box b"></div><svg class="s25svg" id="s25svg" viewBox="0 0 100 100" preserveAspectRatio="none"></svg></div></div><div class="s25side"><div class="s25field"><label>SITUATION</label><input id="s25title" value="${esc(s.title)}"></div><div class="s25field"><label>FOKUSPUNKT</label><textarea id="s25focus">${esc(s.focus||"")}</textarea></div><div class="s25field"><label>NOTE</label><textarea id="s25note">${esc(s.note||"")}</textarea></div><label style="font-size:6px;color:#89958c"><input id="s25pdf" type="checkbox" ${s.includeInPdf!==false?"checked":""}> VIS I KAMP-PDF</label></div></div></div>`;document.body.appendChild(o);const p=o.querySelector("#s25pitch");
    function drag(e,obj){let on=false;e.onpointerdown=x=>{on=true;try{e.setPointerCapture(x.pointerId)}catch(_){}x.preventDefault()};e.onpointermove=x=>{if(!on)return;const r=p.getBoundingClientRect();obj.x=Math.max(0,Math.min(100,(x.clientX-r.left)/r.width*100));obj.y=Math.max(0,Math.min(100,(x.clientY-r.top)/r.height*100));e.style.left=obj.x+"%";e.style.top=obj.y+"%"};e.onpointerup=()=>on=false}
    function render(){
      p.querySelectorAll(".s25piece,.s25zone").forEach(x=>x.remove());o.querySelector("#s25svg").innerHTML=`<defs><marker id="s25ah" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 z" fill="#fff"/></marker></defs>`+s.arrows.map(a=>`<line x1="${a.x1}" y1="${a.y1}" x2="${a.x2}" y2="${a.y2}" stroke="#fff" stroke-width="1.1" marker-end="url(#s25ah)"/>`).join("");
      const piece=(k,x,i)=>{const e=document.createElement("div");e.className="s25piece";e.style.left=x.x+"%";e.style.top=x.y+"%";e.innerHTML=k==="p"?`<div class="s25player ${x.gk?"gk":""}">${esc(x.number)}</div><div class="s25name">${esc(x.name)}</div>`:k==="o"?`<div class="s25opp"></div>`:`<div class="s25ball"></div>`;p.appendChild(e);drag(e,x);if(k!=="p")e.ondblclick=()=>{(k==="o"?s.opponents:s.balls).splice(i,1);render()}};
      s.players.forEach((x,i)=>piece("p",x,i));s.opponents.forEach((x,i)=>piece("o",x,i));s.balls.forEach((x,i)=>piece("b",x,i));s.zones.forEach((z,i)=>{const e=document.createElement("div");e.className="s25zone";e.style.cssText=`left:${z.x}%;top:${z.y}%;width:${z.w||20}%;height:${z.h||12}%`;p.appendChild(e);drag(e,z);e.ondblclick=()=>{s.zones.splice(i,1);render()}});
    }
    o.querySelector('[data-a="opp"]').onclick=()=>{s.opponents.push({x:50,y:35});render()};o.querySelector('[data-a="ball"]').onclick=()=>{s.balls.push({x:50,y:50});render()};o.querySelector('[data-a="arrow"]').onclick=()=>{s.arrows.push({x1:35,y1:55,x2:65,y2:45});render()};o.querySelector('[data-a="zone"]').onclick=()=>{s.zones.push({x:40,y:40,w:20,h:12});render()};o.querySelector("[data-reset]").onclick=()=>{s.players=lineup();render()};o.querySelector("[data-close]").onclick=()=>o.remove();o.querySelector("[data-save]").onclick=()=>{s.title=o.querySelector("#s25title").value.trim()||"Situation";s.focus=o.querySelector("#s25focus").value.trim();s.note=o.querySelector("#s25note").value.trim();s.includeInPdf=o.querySelector("#s25pdf").checked;save();after?.();o.remove()};render();
  }

  /* Force the already visible right-hand squad panel to refresh once. */
  setTimeout(()=>{try{start11RenderFullSquad()}catch(_){};try{s19UpdateMatchBar()}catch(_){}},200);
})();




/* =========================================================
   START11 V26.2 – STABLE INTEGRATION
   - Native exercise bank + simple drag/drop
   - Persistent folder assignments through existing s13Save
   - Squad rows can be dragged directly into groups
   - Group selector remains available in player profile
   - Match situations are physically injected into KAMPPLAN modal
========================================================= */
(function start11V262StableIntegration(){
    "use strict";

    const esc = v => typeof s13Esc === "function"
        ? s13Esc(String(v ?? ""))
        : String(v ?? "").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));

    /* ---------- visual styles ---------- */
    if(!document.getElementById("s262Styles")){
        const st=document.createElement("style");
        st.id="s262Styles";
        st.textContent=`
          .s246banklayout{grid-template-columns:270px minmax(0,1fr)!important;gap:14px!important}
          .s246folders{padding:12px!important;border:1px solid rgba(130,255,84,.22)!important;border-radius:10px!important;background:#071009!important}
          .s246folder{min-height:44px!important;margin:5px 0!important;padding-top:8px!important;padding-bottom:8px!important;border-radius:7px!important;font-size:8px!important}
          .s246folder span{font-weight:900!important}
          .s246folder small{font-size:7px!important;padding:3px 6px!important;border-radius:999px!important;background:rgba(130,255,84,.08)!important}
          .s246folder.s262-drop,.s25grouphead.s262-drop{border-color:var(--s11-primary,#82ff54)!important;background:rgba(130,255,84,.20)!important;box-shadow:0 0 0 3px rgba(130,255,84,.10)!important}
          .s17-exercise-card[draggable="true"]{cursor:grab!important}
          .s17-exercise-card.s262-dragging,.full-squad-row.s262-dragging{opacity:.35!important}
          .s25grouphead{min-height:30px!important;cursor:default}
          .full-squad-row[draggable="true"]{cursor:grab}
          #s262MatchSituations{
             margin:14px 0 10px;padding:12px;border:1px solid rgba(130,255,84,.28);
             border-radius:8px;background:#071009;
          }
          #s262MatchSituations .s262head{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:8px}
          #s262MatchSituations .s262head strong{font-size:9px}
          #s262MatchSituations .s262sub{font-size:6px;color:#8e9a91;line-height:1.5;margin-bottom:9px}
          #s262MatchSituations .s262actions{display:grid;grid-template-columns:1fr 1fr;gap:7px}
          #s262MatchSituations .s262actions button{min-height:38px}
          #s262MatchSituations .s262count{color:var(--s11-primary,#82ff54);font-size:7px;font-weight:900}
          @media(max-width:760px){
             .s246banklayout{grid-template-columns:1fr!important}
             #s262MatchSituations .s262actions{grid-template-columns:1fr}
          }
        `;
        document.head.appendChild(st);
    }

    /* ---------- exercise bank: stable native drag/drop ---------- */
    let draggedExerciseId="";

    function wireExerciseBank(){
        const root=document.getElementById("s13content");
        if(!root) return;

        root.querySelectorAll(".s17-exercise-card").forEach(card=>{
            if(card.dataset.s262DragBound==="1") return;
            const edit=card.querySelector("[data-edit-exercise]");
            const id=edit?.dataset.editExercise || card.dataset.s247Exercise || "";
            if(!id) return;
            card.dataset.s262DragBound="1";
            card.draggable=true;

            card.addEventListener("dragstart",e=>{
                if(e.target.closest("button,input,select,textarea,a")){e.preventDefault();return}
                draggedExerciseId=String(id);
                card.classList.add("s262-dragging");
                try{
                    e.dataTransfer.effectAllowed="move";
                    e.dataTransfer.setData("text/start11-exercise",draggedExerciseId);
                    e.dataTransfer.setData("text/plain",draggedExerciseId);
                }catch(_){}
            });
            card.addEventListener("dragend",()=>{
                draggedExerciseId="";
                card.classList.remove("s262-dragging");
                document.querySelectorAll(".s262-drop").forEach(x=>x.classList.remove("s262-drop"));
            });
        });

        root.querySelectorAll("[data-s246-folder]").forEach(folder=>{
            if(folder.dataset.s262DropBound==="1") return;
            folder.dataset.s262DropBound="1";

            folder.addEventListener("dragover",e=>{
                if(!draggedExerciseId) return;
                e.preventDefault();
                try{e.dataTransfer.dropEffect="move"}catch(_){}
                folder.classList.add("s262-drop");
            });
            folder.addEventListener("dragleave",()=>folder.classList.remove("s262-drop"));
            folder.addEventListener("drop",e=>{
                if(!draggedExerciseId) return;
                e.preventDefault();
                folder.classList.remove("s262-drop");

                const ex=(s13Data.exercises||[]).find(x=>String(x.id)===String(draggedExerciseId));
                if(!ex) return;

                const raw=String(folder.dataset.s246Folder||"");
                ex.folderId=(raw==="all"||raw==="root") ? "" : raw;

                if(typeof s13Save==="function") s13Save();
                if(typeof visNotification==="function") visNotification("Øvelsen er flyttet til mappen.");
                draggedExerciseId="";

                const target=document.getElementById("s13content");
                if(target && typeof s13Exercises==="function") s13Exercises(target);
            });
        });
    }

    /* ---------- squad groups: drag a player row onto a group header ---------- */
    let draggedPlayerId="";

    function currentGroupData(){
        try{
            // V25 keeps the group data in localStorage. Read the same object so this
            // integration works without depending on V25's private closure variable.
            const userId=(typeof session!=="undefined" && session?.user?.id) ? session.user.id : "local";
            const teamId=(typeof currentTeamId!=="undefined" && currentTeamId) ? currentTeamId : "team";
            const candidates=[
                `start11.v25.squadGroups.${userId}.${teamId}`,
                `start11.v25.squadGroups.${teamId}`,
                `start11.v25.squadGroups.${userId}`,
                `start11.v25.squadGroups`
            ];
            for(const key of candidates){
                const raw=localStorage.getItem(key);
                if(raw){
                    const d=JSON.parse(raw);
                    if(d && Array.isArray(d.groups) && d.players) return {key,d};
                }
            }
        }catch(_){}
        return null;
    }

    function discoverActualGroupStore(){
        // Find the exact V25 key by looking for a stored object with groups + players.
        try{
            for(let i=0;i<localStorage.length;i++){
                const key=localStorage.key(i);
                if(!key || !/group/i.test(key)) continue;
                try{
                    const d=JSON.parse(localStorage.getItem(key)||"null");
                    if(d && Array.isArray(d.groups) && d.players && typeof d.players==="object") return {key,d};
                }catch(_){}
            }
        }catch(_){}
        return currentGroupData();
    }

    function wireSquadGroups(){
        const list=document.getElementById("fullSquadList");
        if(!list) return;

        list.querySelectorAll(".full-squad-row").forEach(row=>{
            if(row.dataset.s262DragBound==="1") return;
            row.dataset.s262DragBound="1";
            row.draggable=true;
            row.addEventListener("dragstart",e=>{
                draggedPlayerId=String(row.dataset.playerId||"");
                if(!draggedPlayerId){e.preventDefault();return}
                row.classList.add("s262-dragging");
                try{
                    e.dataTransfer.effectAllowed="move";
                    e.dataTransfer.setData("text/start11-player",draggedPlayerId);
                }catch(_){}
            });
            row.addEventListener("dragend",()=>{
                draggedPlayerId="";
                row.classList.remove("s262-dragging");
                document.querySelectorAll(".s262-drop").forEach(x=>x.classList.remove("s262-drop"));
            });
        });

        const heads=[...list.querySelectorAll(".s25grouphead")];
        const bar=document.getElementById("s25SquadGroups");
        const chips=bar ? [...bar.querySelectorAll(".s25gchip")] : [];
        const store=discoverActualGroupStore();
        const groups=store?.d?.groups||[];

        heads.forEach((head,index)=>{
            if(head.dataset.s262DropBound==="1") return;
            const visibleName=head.querySelector("span")?.textContent?.replace(/^▾\s*/,"").trim()||"";
            const group=groups.find(g=>String(g.name)===visibleName) || groups[index];
            if(!group) return;
            head.dataset.s262DropBound="1";
            head.title="Træk en spiller hertil for at flytte spilleren til gruppen";

            head.addEventListener("dragover",e=>{
                if(!draggedPlayerId) return;
                e.preventDefault();head.classList.add("s262-drop");
            });
            head.addEventListener("dragleave",()=>head.classList.remove("s262-drop"));
            head.addEventListener("drop",e=>{
                if(!draggedPlayerId) return;
                e.preventDefault();head.classList.remove("s262-drop");
                const s=discoverActualGroupStore();
                if(!s) return;
                const g=s.d.groups.find(x=>String(x.name)===visibleName) || s.d.groups[index];
                if(!g) return;
                s.d.players[String(draggedPlayerId)]=g.id;
                localStorage.setItem(s.key,JSON.stringify(s.d));
                draggedPlayerId="";
                if(typeof start11RenderFullSquad==="function") start11RenderFullSquad();
                if(typeof visNotification==="function") visNotification(`Spilleren er flyttet til ${g.name}.`);
            });
        });

        // Make group chips explanatory on hover.
        chips.forEach(c=>c.title="Grupperne bruges til at holde egen trup, U13, U16 osv. adskilt.");
    }

    /* ---------- match-plan: inject the missing visible section ---------- */
    window.s262EnsureMatchSituationsPanel=function(){
        const modal=document.getElementById("matchplanModal");
        if(!modal) return;

        let panel=document.getElementById("s262MatchSituations");
        if(!panel){
            panel=document.createElement("section");
            panel.id="s262MatchSituations";

            const save=document.getElementById("saveMatchplan");
            const parent=save?.parentElement || modal.querySelector(".modal-content") || modal.firstElementChild || modal;
            if(save && save.parentElement===parent) parent.insertBefore(panel,save);
            else parent.appendChild(panel);
        }

        let count=0;
        try{
            if(s13Data?.matchTacticalSituations){
                count=Object.values(s13Data.matchTacticalSituations).reduce((n,a)=>n+(Array.isArray(a)?a.length:0),0);
            }
        }catch(_){}

        panel.innerHTML=`
          <div class="s262head">
             <strong>⚽ KAMPSITUATIONER</strong>
             <span class="s262count">${count ? count+" GEMT" : "TAKTISK TAVLE"}</span>
          </div>
          <div class="s262sub">
             Opret holdets positioner i forskellige situationer. Start med MED BOLD og UDEN BOLD,
             eller opret egne situationer. Spillerne kan flyttes frit på den taktiske tavle.
          </div>
          <div class="s262actions">
             <button type="button" class="s13btn primary" id="s262OpenSituations">ÅBN KAMPSITUATIONER →</button>
             <button type="button" class="s13btn" id="s262NewSituation">+ OPRET NY SITUATION</button>
          </div>
        `;

        panel.querySelector("#s262OpenSituations").onclick=()=>{
            if(typeof window.s25OpenMatchSituations==="function") window.s25OpenMatchSituations();
            else if(typeof visNotification==="function") visNotification("Kampsituationer kunne ikke åbnes.");
        };
        panel.querySelector("#s262NewSituation").onclick=()=>{
            if(typeof window.s25OpenMatchSituations==="function"){
                window.s25OpenMatchSituations();
                setTimeout(()=>{
                    document.querySelector("#s25manager [data-new]")?.click();
                },30);
            }
        };
    };

    // Capture clicks that open KAMPPLAN, then inject after the legacy modal has opened.
    document.addEventListener("click",e=>{
        const trigger=e.target.closest?.("#openCurrentMatchButton,#editMatchPlanShortcut,#editMatchInfoBottom,#editTacticsBottom,#s19MatchPlanButton");
        if(trigger) setTimeout(()=>window.s262EnsureMatchSituationsPanel?.(),20);
    },true);

    // Also handle direct calls to åbnKampplan by observing modal visibility / DOM.
    const modalObserver=new MutationObserver(()=>{
        const modal=document.getElementById("matchplanModal");
        if(modal && getComputedStyle(modal).display!=="none") window.s262EnsureMatchSituationsPanel?.();
    });
    const observeModal=()=>{
        const modal=document.getElementById("matchplanModal");
        if(modal) modalObserver.observe(modal,{attributes:true,attributeFilter:["style","class"],childList:true,subtree:false});
        else setTimeout(observeModal,250);
    };
    observeModal();

    /* ---------- keep bindings alive after rerenders ---------- */
    let scheduled=false;
    const refresh=()=>{
        if(scheduled) return;
        scheduled=true;
        requestAnimationFrame(()=>{
            scheduled=false;
            wireExerciseBank();
            wireSquadGroups();
        });
    };

    const observer=new MutationObserver(refresh);
    const begin=()=>{
        observer.observe(document.body,{childList:true,subtree:true});
        refresh();
    };
    if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",begin,{once:true});
    else begin();

    window.START11_BUILD="V26.2-STABLE-INTEGRATION";
    console.info("START11 loaded:",window.START11_BUILD);
})();




/* =========================================================
   START11 V26.5
   BASE: V26.2_STABLE_INTEGRATION_FULD
   IMPORTANT:
   - ØVELSESBANKEN ER IKKE ÆNDRET.
   - Spillergrupper fjernes helt.
   - Kampsituationer bruger en designer tæt på øvelsesdesigneren.
   - Valgte kampsituationer tilføjes direkte til lavPDF().
========================================================= */
(function start11V265(){
"use strict";

const E=v=>typeof s13Esc==="function"?s13Esc(String(v??"")):String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const ID=p=>p+"_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,7);

/* =========================================================
   1. FJERN KUN SPILLERGRUPPER
========================================================= */
window.s25MountSquadGroups=function(){
    document.getElementById("s25SquadGroups")?.remove();
};
window.s25OrganizeSquadRows=function(){};
window.s25MountPlayerGroupSelect=function(){
    document.getElementById("s25PlayerGroupWrap")?.remove();
};

function cleanPlayerGroups(){
    document.getElementById("s25SquadGroups")?.remove();
    document.getElementById("s25PlayerGroupWrap")?.remove();

    const list=document.getElementById("fullSquadList");
    if(!list)return;

    // V25 kan allerede have indsat gruppeoverskrifter. Kun overskrifterne fjernes.
    list.querySelectorAll(".s25grouphead").forEach(x=>x.remove());
    list.querySelectorAll(".full-squad-row").forEach(r=>{
        r.draggable=false;
        r.classList.remove("s262-dragging");
        r.removeAttribute("data-s262-drag-bound");
    });
}
setTimeout(cleanPlayerGroups,0);
setTimeout(cleanPlayerGroups,250);

/* =========================================================
   2. KAMPSITUATION DATA
========================================================= */
function matchKey(){
    return String(
        (typeof s19MatchMode!=="undefined" && s19MatchMode?.key) ||
        [
            typeof kampplan!=="undefined" ? kampplan?.matchDate : "",
            typeof kampplan!=="undefined" ? kampplan?.homeTeam : "",
            typeof kampplan!=="undefined" ? kampplan?.awayTeam : ""
        ].filter(Boolean).join("|") ||
        "current"
    );
}
function currentLineup(){
    const f=(typeof formationer!=="undefined" && typeof formationSelector!=="undefined")
        ? (formationer[formationSelector?.value]||[])
        : [];
    return f.slice(0,11).map((pos,i)=>{
        const p=(typeof spillere!=="undefined" ? spillere[i] : null)||{};
        return {
            id:ID("pl"),
            name:p.name||pos?.[0]||`Spiller ${i+1}`,
            number:p.number||"",
            gk:i===0||pos?.[0]==="GK",
            x:Number(pos?.[1]||50),
            y:Number(pos?.[2]||50),
            w:7,
            h:7,
            rot:0
        };
    });
}
function newSituation(title){
    return {
        id:ID("sit"),
        title,
        focus:"",
        note:"",
        includeInPdf:true,
        players:currentLineup(),
        opponents:[],
        balls:[],
        cones:[],
        texts:[],
        arrows:[],
        zones:[]
    };
}
function situations(){
    if(!s13Data.matchTacticalSituations || typeof s13Data.matchTacticalSituations!=="object"){
        s13Data.matchTacticalSituations={};
    }
    const k=matchKey();
    if(!Array.isArray(s13Data.matchTacticalSituations[k])){
        s13Data.matchTacticalSituations[k]=[newSituation("Med bold"),newSituation("Uden bold")];
    }
    return s13Data.matchTacticalSituations[k];
}
function saveSituations(){
    if(typeof s13Save==="function")s13Save();
}

/* =========================================================
   3. DESIGN – SAMME VISUELLE SPROG SOM ØVELSESDESIGNEREN
========================================================= */
if(!document.getElementById("s265css")){
    const st=document.createElement("style");
    st.id="s265css";
    st.textContent=`
    .s265overlay{position:fixed;inset:0;z-index:2147483646;background:#000e;display:grid;place-items:center;padding:12px}
    .s265pro{width:min(1420px,98vw);height:min(940px,97vh);overflow:hidden;border:1px solid rgba(130,255,84,.35);border-radius:11px;background:#061008;color:#fff;box-shadow:0 30px 100px #000}
    .s265top{display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:9px 10px;border-bottom:1px solid rgba(255,255,255,.08);background:#071009}
    .s265top strong{font-size:10px;margin-right:auto}.s265top .s265muted{font-size:6px;color:#829087;margin-right:12px}
    .s265layout{height:calc(100% - 55px);display:grid;grid-template-columns:minmax(0,1fr) 310px}
    .s265boardwrap{padding:14px;overflow:auto;display:grid;place-items:center}
    .s265board{position:relative;width:min(100%,700px);aspect-ratio:68/105;background:#176b37;border:2px solid #fff;overflow:hidden;touch-action:none;user-select:none}
    .s265half{position:absolute;left:0;right:0;top:50%;border-top:2px solid #fff9}
    .s265circle{position:absolute;left:50%;top:50%;width:22%;aspect-ratio:1;border:2px solid #fff9;border-radius:50%;transform:translate(-50%,-50%)}
    .s265box{position:absolute;left:25%;width:50%;height:15%;border:2px solid #fff9}.s265box.a{top:-2px}.s265box.b{bottom:-2px}
    .s265svg{position:absolute;inset:0;width:100%;height:100%;z-index:3;pointer-events:none}
    .s265item{position:absolute;z-index:6;transform:translate(-50%,-50%);display:grid;place-items:center;cursor:grab;touch-action:none}
    .s265item.selected{outline:2px solid var(--s11-primary,#82ff54);outline-offset:5px}
    .s265player,.s265opp{width:100%;height:100%;min-width:25px;min-height:25px;border-radius:50%;display:grid;place-items:center;font-size:8px;font-weight:950;box-shadow:0 3px 8px #0008}
    .s265player{background:var(--s11-shirt,#c8ff00);color:var(--s11-shirt-text,#071008);border:2px solid #fff}.s265player.gk{background:var(--s11-gk-shirt,#e31d1d);color:#fff}
    .s265opp{background:#eee;color:#111;border:2px solid #222}.s265ball{width:100%;height:100%;border-radius:50%;background:#fff;border:3px dotted #111}
    .s265cone{font-size:24px;color:#ff9d31;line-height:1}.s265text{padding:4px 7px;background:#071008;border:1px solid #fff5;border-radius:5px;font-size:7px;white-space:nowrap}
    .s265name{position:absolute;top:calc(100% + 5px);left:50%;transform:translateX(-50%);padding:2px 4px;background:#061008;border-radius:3px;color:#fff;font-size:5px;white-space:nowrap}
    .s265zone{position:absolute;z-index:2;border:2px dashed #ffe64d;background:#ffe64d22;cursor:grab;touch-action:none}.s265zone.selected{outline:2px solid var(--s11-primary,#82ff54);outline-offset:3px}
    .s265handle{position:absolute;width:13px;height:13px;border:2px solid #061008;border-radius:3px;background:var(--s11-primary,#82ff54);z-index:20}
    .s265handle.br{right:-8px;bottom:-8px;cursor:nwse-resize}.s265handle.tl{left:-8px;top:-8px;cursor:nwse-resize}
    .s265arrowhit{pointer-events:stroke;stroke:transparent;stroke-width:6;cursor:pointer}
    .s265side{padding:12px;border-left:1px solid rgba(255,255,255,.08);overflow:auto;background:#071009}
    .s265side h3{font-size:9px;margin:0 0 10px}.s265field{display:grid;gap:4px;margin-bottom:10px}.s265field label{font-size:6px;color:#929d95;font-weight:900}
    .s265field input,.s265field textarea,.s265field select{box-sizing:border-box;width:100%;padding:8px;border:1px solid rgba(255,255,255,.12);border-radius:6px;background:#0a160d;color:#fff;font:inherit;font-size:7px}
    .s265field textarea{min-height:85px;resize:vertical}.s265hint{padding:9px;border:1px dashed rgba(130,255,84,.25);border-radius:6px;color:#829087;font-size:6px;line-height:1.5}
    .s265manager{width:min(900px,96vw);max-height:92vh;overflow:auto;border:1px solid rgba(130,255,84,.35);border-radius:10px;background:#061008}
    .s265cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:8px;padding:12px}.s265card{padding:10px;border:1px solid rgba(255,255,255,.09);border-radius:7px;background:#0a150c}
    .s265card strong{font-size:8px}.s265card p{font-size:6px;color:#849087;min-height:18px}.s265cardfoot{display:flex;justify-content:space-between;align-items:center;gap:6px}
    @media(max-width:820px){.s265layout{grid-template-columns:1fr;height:auto}.s265pro{overflow:auto}.s265side{border-left:0;border-top:1px solid rgba(255,255,255,.08)}}
    `;
    document.head.appendChild(st);
}

function bindMove(el,obj,board,render){
    let moving=false;
    el.addEventListener("pointerdown",e=>{
        if(e.target.closest(".s265handle"))return;
        moving=true;
        try{el.setPointerCapture(e.pointerId)}catch(_){}
        e.preventDefault();
    });
    el.addEventListener("pointermove",e=>{
        if(!moving)return;
        const r=board.getBoundingClientRect();
        obj.x=Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100));
        obj.y=Math.max(0,Math.min(100,(e.clientY-r.top)/r.height*100));
        el.style.left=obj.x+"%";el.style.top=obj.y+"%";
    });
    el.addEventListener("pointerup",()=>moving=false);
}
function bindResize(handle,obj,board,render,isZone=false){
    let active=false,start=null;
    handle.addEventListener("pointerdown",e=>{
        active=true;
        start={cx:e.clientX,cy:e.clientY,w:Number(obj.w||7),h:Number(obj.h||7)};
        try{handle.setPointerCapture(e.pointerId)}catch(_){}
        e.preventDefault();e.stopPropagation();
    });
    handle.addEventListener("pointermove",e=>{
        if(!active)return;
        const r=board.getBoundingClientRect();
        obj.w=Math.max(isZone?5:2,Math.min(45,start.w+(e.clientX-start.cx)/r.width*100));
        obj.h=Math.max(isZone?5:2,Math.min(45,start.h+(e.clientY-start.cy)/r.height*100));
        render();
    });
    handle.addEventListener("pointerup",()=>active=false);
}

function openDesigner(id,after){
    const s=situations().find(x=>String(x.id)===String(id));if(!s)return;
    ["players","opponents","balls","cones","texts","arrows","zones"].forEach(k=>{if(!Array.isArray(s[k]))s[k]=k==="players"?currentLineup():[]});
    s.players.forEach(x=>{if(!x.id)x.id=ID("pl");if(!x.w)x.w=7;if(!x.h)x.h=7});
    [...s.opponents,...s.balls,...s.cones,...s.texts].forEach(x=>{if(!x.id)x.id=ID("ob");if(!x.w)x.w=x.type==="text"?15:7;if(!x.h)x.h=7});
    s.zones.forEach(x=>{if(!x.id)x.id=ID("zone");if(!x.w)x.w=20;if(!x.h)x.h=12});
    s.arrows.forEach(x=>{if(!x.id)x.id=ID("arr")});

    document.getElementById("s265designer")?.remove();
    const ov=document.createElement("div");ov.id="s265designer";ov.className="s265overlay";
    ov.innerHTML=`<div class="s265pro">
      <div class="s265top">
        <strong>TAKTISK DESIGNER</strong><span class="s265muted">${E(s.title)}</span>
        <button class="s13btn" data-add="opp">+ MODSPILLER</button>
        <button class="s13btn" data-add="ball">+ BOLD</button>
        <button class="s13btn" data-add="cone">+ KEGLE</button>
        <button class="s13btn" data-add="arrow">+ PIL</button>
        <button class="s13btn" data-add="zone">+ ZONE</button>
        <button class="s13btn" data-add="text">+ TEKST</button>
        <button class="s13btn" data-reset>NULSTIL XI</button>
        <button class="s13btn primary" data-save>GEM</button>
        <button class="s13btn" data-close>LUK</button>
      </div>
      <div class="s265layout">
        <div class="s265boardwrap"><div class="s265board" id="s265board">
          <div class="s265half"></div><div class="s265circle"></div><div class="s265box a"></div><div class="s265box b"></div>
          <svg class="s265svg" id="s265svg" viewBox="0 0 100 100" preserveAspectRatio="none"></svg>
        </div></div>
        <aside class="s265side">
          <h3>SITUATION</h3>
          <div class="s265field"><label>NAVN</label><input id="s265title" value="${E(s.title)}"></div>
          <div class="s265field"><label>FOKUSPUNKT</label><textarea id="s265focus">${E(s.focus||"")}</textarea></div>
          <div class="s265field"><label>NOTE</label><textarea id="s265note">${E(s.note||"")}</textarea></div>
          <div class="s265field"><label><input id="s265pdf" type="checkbox" ${s.includeInPdf!==false?"checked":""}> VIS I KAMP-PDF</label></div>
          <div class="s265hint">Vælg et objekt ved at klikke på det. Træk objektet frit. Når det er valgt, får det resize-håndtag ligesom i øvelsesdesigneren. Delete/Backspace sletter valgte ekstraobjekter. Spillere fra startopstillingen kan flyttes og ændres i størrelse, men ikke slettes.</div>
        </aside>
      </div>
    </div>`;
    document.body.appendChild(ov);
    const board=ov.querySelector("#s265board"),svg=ov.querySelector("#s265svg");
    let selected=null;

    function removeSelected(){
        if(!selected)return;
        if(s.players.includes(selected))return;
        ["opponents","balls","cones","texts","zones","arrows"].forEach(k=>s[k]=s[k].filter(x=>x!==selected));
        selected=null;render();
    }

    function select(obj){selected=obj;render()}

    function item(obj,kind){
        const el=document.createElement("div");el.className="s265item"+(selected===obj?" selected":"");
        el.style.left=obj.x+"%";el.style.top=obj.y+"%";el.style.width=(obj.w||7)+"%";el.style.height=(obj.h||7)+"%";
        if(kind==="player")el.innerHTML=`<div class="s265player ${obj.gk?"gk":""}">${E(obj.number||"")}</div><div class="s265name">${E(obj.name||"")}</div>`;
        if(kind==="opp")el.innerHTML=`<div class="s265opp"></div>`;
        if(kind==="ball")el.innerHTML=`<div class="s265ball"></div>`;
        if(kind==="cone")el.innerHTML=`<div class="s265cone">▲</div>`;
        if(kind==="text")el.innerHTML=`<div class="s265text">${E(obj.text||"TEKST")}</div>`;
        el.addEventListener("click",e=>{e.stopPropagation();select(obj)});
        bindMove(el,obj,board,render);
        if(selected===obj){
            const h=document.createElement("i");h.className="s265handle br";el.appendChild(h);bindResize(h,obj,board,render,false);
        }
        board.appendChild(el);
    }

    function render(){
        board.querySelectorAll(".s265item,.s265zone").forEach(x=>x.remove());
        svg.innerHTML=`<defs><marker id="s265ah" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0 0 L5 2.5 L0 5z" fill="#fff"/></marker></defs>`+
          s.arrows.map(a=>`<g data-arrow="${E(a.id)}"><line class="s265arrowhit" x1="${a.x1}" y1="${a.y1}" x2="${a.x2}" y2="${a.y2}"/><line x1="${a.x1}" y1="${a.y1}" x2="${a.x2}" y2="${a.y2}" stroke="${selected===a?"#82ff54":"#fff"}" stroke-width="${a.stroke||1.1}" marker-end="url(#s265ah)"/></g>`).join("");

        s.players.forEach(x=>item(x,"player"));
        s.opponents.forEach(x=>item(x,"opp"));
        s.balls.forEach(x=>item(x,"ball"));
        s.cones.forEach(x=>item(x,"cone"));
        s.texts.forEach(x=>item(x,"text"));
        s.zones.forEach(z=>{
            const el=document.createElement("div");el.className="s265zone"+(selected===z?" selected":"");
            el.style.left=z.x+"%";el.style.top=z.y+"%";el.style.width=z.w+"%";el.style.height=z.h+"%";
            el.addEventListener("click",e=>{e.stopPropagation();select(z)});
            bindMove(el,z,board,render);
            if(selected===z){const h=document.createElement("i");h.className="s265handle br";el.appendChild(h);bindResize(h,z,board,render,true)}
            board.appendChild(el);
        });

        // Arrow endpoint handles when selected.
        if(selected && s.arrows.includes(selected)){
            [["x1","y1"],["x2","y2"]].forEach(([kx,ky])=>{
                const h=document.createElement("div");h.className="s265item selected";h.style.cssText=`left:${selected[kx]}%;top:${selected[ky]}%;width:16px;height:16px;border-radius:50%;background:#82ff54;z-index:12`;
                bindMove(h,{get x(){return selected[kx]},set x(v){selected[kx]=v},get y(){return selected[ky]},set y(v){selected[ky]=v}},board,render);
                board.appendChild(h);
            });
        }
        svg.querySelectorAll("[data-arrow]").forEach(g=>g.addEventListener("click",()=>{selected=s.arrows.find(a=>String(a.id)===g.dataset.arrow)||null;render()}));
    }

    board.addEventListener("click",()=>{selected=null;render()});
    ov.querySelector('[data-add="opp"]').onclick=()=>{s.opponents.push({id:ID("opp"),x:50,y:35,w:7,h:7});render()};
    ov.querySelector('[data-add="ball"]').onclick=()=>{s.balls.push({id:ID("ball"),x:50,y:50,w:4,h:4});render()};
    ov.querySelector('[data-add="cone"]').onclick=()=>{s.cones.push({id:ID("cone"),x:45,y:45,w:5,h:5});render()};
    ov.querySelector('[data-add="arrow"]').onclick=()=>{s.arrows.push({id:ID("arr"),x1:35,y1:55,x2:65,y2:45,stroke:1.1});render()};
    ov.querySelector('[data-add="zone"]').onclick=()=>{s.zones.push({id:ID("zone"),x:40,y:40,w:20,h:12});render()};
    ov.querySelector('[data-add="text"]').onclick=()=>{const t=prompt("Tekst på tavlen:","Fokus");if(t?.trim()){s.texts.push({id:ID("text"),x:50,y:50,w:15,h:7,text:t.trim()});render()}};
    ov.querySelector("[data-reset]").onclick=()=>{s.players=currentLineup();render()};
    ov.querySelector("[data-close]").onclick=()=>ov.remove();
    ov.querySelector("[data-save]").onclick=()=>{
        s.title=ov.querySelector("#s265title").value.trim()||"Situation";
        s.focus=ov.querySelector("#s265focus").value.trim();
        s.note=ov.querySelector("#s265note").value.trim();
        s.includeInPdf=ov.querySelector("#s265pdf").checked;
        saveSituations();after?.();ov.remove();
    };
    const key=e=>{
        if((e.key==="Delete"||e.key==="Backspace")&&!e.target.matches("input,textarea"))removeSelected();
    };
    document.addEventListener("keydown",key);
    ov.addEventListener("remove",()=>document.removeEventListener("keydown",key));
    render();
}

/* =========================================================
   4. MANAGER – BEHOLDER KAMPSITUATION-FLOWET
========================================================= */
window.s25OpenMatchSituations=function(){
    document.getElementById("s25manager")?.remove();
    const o=document.createElement("div");o.id="s25manager";o.className="s265overlay";
    o.innerHTML=`<div class="s265manager">
      <div class="s265top"><strong>KAMPSITUATIONER</strong><span class="s265muted">Med bold, uden bold og egne scenarier</span><button class="s13btn primary" data-new>+ OPRET SITUATION</button><button class="s13btn" data-close>LUK</button></div>
      <div class="s265cards" id="s265cards"></div>
    </div>`;
    document.body.appendChild(o);
    const render=()=>{
        o.querySelector("#s265cards").innerHTML=situations().map(s=>`<article class="s265card">
          <strong>${E(s.title)}</strong><p>${E(s.focus||"Intet fokuspunkt endnu")}</p>
          <div class="s265cardfoot"><button class="s13btn" data-edit="${E(s.id)}">REDIGER TAVLE →</button><label style="font-size:6px;color:#89958c"><input type="checkbox" data-pdf="${E(s.id)}" ${s.includeInPdf!==false?"checked":""}> PDF</label></div>
        </article>`).join("");
        o.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>openDesigner(b.dataset.edit,render));
        o.querySelectorAll("[data-pdf]").forEach(c=>c.onchange=()=>{const s=situations().find(x=>String(x.id)===String(c.dataset.pdf));if(s){s.includeInPdf=c.checked;saveSituations()}});
    };
    o.querySelector("[data-close]").onclick=()=>o.remove();
    o.querySelector("[data-new]").onclick=()=>{
        const n=prompt("Navn på situationen:","Ny kampsituation");if(!n?.trim())return;
        const s=newSituation(n.trim());situations().push(s);saveSituations();render();openDesigner(s.id,render);
    };
    render();
};

/* =========================================================
   5. PDF – DIREKTE INTEGRATION I lavPDF()
========================================================= */
function situationPdfPages(){
    const list=situations().filter(s=>s.includeInPdf!==false);
    if(!list.length)return "";

    const page=(s,index)=>{
        const objs=[];
        const add=(x,html,cls="")=>objs.push(`<div class="s265pdfobj ${cls}" style="left:${Number(x.x||0)}%;top:${Number(x.y||0)}%;width:${Number(x.w||7)}%;height:${Number(x.h||7)}%">${html}</div>`);
        (s.players||[]).forEach(x=>add(x,`<div class="s265pdfplayer ${x.gk?"gk":""}">${E(x.number||"")}</div><small>${E(x.name||"")}</small>`));
        (s.opponents||[]).forEach(x=>add(x,`<div class="s265pdfopp"></div>`));
        (s.balls||[]).forEach(x=>add(x,`<div class="s265pdfball"></div>`));
        (s.cones||[]).forEach(x=>add(x,`<div class="s265pdfcone">▲</div>`));
        (s.texts||[]).forEach(x=>add(x,`<div class="s265pdftext">${E(x.text||"")}</div>`));
        (s.zones||[]).forEach(x=>add(x,`<div class="s265pdfzone"></div>`));
        const arrows=(s.arrows||[]).map(a=>`<line x1="${a.x1}" y1="${a.y1}" x2="${a.x2}" y2="${a.y2}" stroke="#fff" stroke-width="${a.stroke||1.1}" marker-end="url(#s265pdfah${index})"/>`).join("");

        return `<section class="pdf-page v24-page s265pdfpage">
          <div class="v24-top-rule"></div>
          <div class="v24-page-head"><div><div class="v24-kicker">KAMPSITUATION</div><h1>${E(s.title)}</h1></div><div class="v24-page-no">T${index+1}</div></div>
          <div class="s265pdfgrid">
            <div class="s265pdfpitch"><div class="s265pdfhalf"></div><div class="s265pdfcircle"></div><div class="s265pdfbox a"></div><div class="s265pdfbox b"></div>
              <svg viewBox="0 0 100 100" preserveAspectRatio="none"><defs><marker id="s265pdfah${index}" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0 0 L5 2.5 L0 5z" fill="#fff"/></marker></defs>${arrows}</svg>${objs.join("")}
            </div>
            <div class="s265pdfside">
              <div class="s265pdfcard"><b>FOKUSPUNKT</b><p>${E(s.focus||"—")}</p></div>
              <div class="s265pdfcard"><b>NOTE</b><p>${E(s.note||"—")}</p></div>
            </div>
          </div>
          <div class="v24-pdf-footer"><span>START11 · TAKTISK KAMPSITUATION</span><span>${E(s.title)}</span></div>
        </section>`;
    };

    return `<style>
      #pdfDocument .s265pdfgrid{display:grid;grid-template-columns:118mm 1fr;gap:8mm;padding:9mm 13mm 13mm}
      #pdfDocument .s265pdfpitch{position:relative;width:112mm;height:173mm;background:#176b37;border:1mm solid #fff;overflow:hidden}
      #pdfDocument .s265pdfhalf{position:absolute;left:0;right:0;top:50%;border-top:.6mm solid #fff}
      #pdfDocument .s265pdfcircle{position:absolute;left:50%;top:50%;width:22%;aspect-ratio:1;border:.6mm solid #fff;border-radius:50%;transform:translate(-50%,-50%)}
      #pdfDocument .s265pdfbox{position:absolute;left:25%;width:50%;height:15%;border:.6mm solid #fff}.s265pdfbox.a{top:-.6mm}.s265pdfbox.b{bottom:-.6mm}
      #pdfDocument .s265pdfpitch>svg{position:absolute;inset:0;width:100%;height:100%;z-index:3}
      #pdfDocument .s265pdfobj{position:absolute;z-index:5;transform:translate(-50%,-50%);display:grid;place-items:center}
      #pdfDocument .s265pdfplayer,#pdfDocument .s265pdfopp{width:100%;height:100%;min-width:7mm;min-height:7mm;border-radius:50%;display:grid;place-items:center;font-size:6pt;font-weight:950}
      #pdfDocument .s265pdfplayer{background:var(--v24-shirt,#c8ff00);color:var(--v24-shirt-text,#071008);border:.7mm solid #fff}.s265pdfplayer.gk{background:var(--v24-gk-shirt,#e31d1d);color:#fff}
      #pdfDocument .s265pdfopp{background:#eee;border:.7mm solid #222}.s265pdfobj small{position:absolute;top:calc(100% + 1mm);background:#061008;color:#fff;padding:.6mm 1mm;border-radius:.8mm;font-size:4pt;white-space:nowrap}
      #pdfDocument .s265pdfball{width:100%;height:100%;border-radius:50%;background:#fff;border:.7mm dotted #111}.s265pdfcone{color:#ff9d31;font-size:11pt}.s265pdfzone{width:100%;height:100%;border:.6mm dashed #ffe64d;background:#ffe64d22}.s265pdftext{background:#061008;color:#fff;padding:1mm 1.5mm;border-radius:1mm;font-size:5pt;white-space:nowrap}
      #pdfDocument .s265pdfside{display:grid;align-content:start;gap:6mm}.s265pdfcard{padding:5mm;border:1px solid var(--v24-line);border-radius:3mm;background:var(--v24-card)}.s265pdfcard b{color:var(--v24-accent);font-size:7pt;letter-spacing:1px}.s265pdfcard p{font-size:8pt;line-height:1.5;color:#fff;white-space:pre-wrap}
    </style>`+list.map(page).join("");
}

if(typeof lavPDF==="function"){
    const oldLavPDF=lavPDF;
    lavPDF=function(){
        const base=oldLavPDF.apply(this,arguments);
        return base+situationPdfPages();
    };
}

/* Refresh KAMPPLAN count after manager closes/opens. */
const oldOpen=window.s25OpenMatchSituations;
window.s25OpenMatchSituations=function(){
    oldOpen();
    setTimeout(()=>window.s262EnsureMatchSituationsPanel?.(),20);
};

window.START11_BUILD="V26.5-V262-BASE-NO-GROUPS-TACTICAL-DESIGNER-PDF";
console.info("START11 loaded:",window.START11_BUILD);
})();




