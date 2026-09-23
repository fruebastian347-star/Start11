/* =========================================================
   START11 V27.4 – MULTI DEVICE EXERCISE SYNC
   - Cloud-first exercise library per authenticated account
   - Local storage only fallback/recovery
   - Account switch cannot carry in-memory exercise library
   - Same-account team switches preserve personal library
========================================================= */
window.START11_BUILD = "V27.4-MULTI-DEVICE-EXERCISE-SYNC";
console.info("START11 loaded:", window.START11_BUILD);
/* =========================================================
   START11 V28 – COACH EXPERIENCE LAYER
   - Coach briefing on dashboard
   - Global Ctrl/Cmd+K search
   - Player timeline
   - Match story + read-only share link
   - Tactical focus templates + empty-state shortcuts
   - Drag/drop feedback
   - Stronger autosave feedback / unload flush
   ========================================================= */
(() => {
  "use strict";
  if (window.__START11_V28__) return;
  window.__START11_V28__ = true;
  window.START11_BUILD = "V28-COACH-EXPERIENCE";

  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  const clone = v => { try { return JSON.parse(JSON.stringify(v)); } catch { return v; } };
  const today = () => new Date().toISOString().slice(0,10);
  const fmt = d => { if(!d) return "—"; try { return new Intl.DateTimeFormat("da-DK",{day:"2-digit",month:"short",year:"numeric"}).format(new Date(d+"T12:00:00")); } catch { return d; } };
  const data = () => (typeof s13Data === "object" && s13Data) ? s13Data : {};
  const players = () => (typeof start11FullSquad !== "undefined" && Array.isArray(start11FullSquad)) ? start11FullSquad : (typeof spillere !== "undefined" && Array.isArray(spillere) ? spillere : []);
  const save = () => { try { if(typeof s13Save === "function") s13Save(); else if(typeof scheduleCloudSave === "function") scheduleCloudSave(); } catch(e){ console.warn("START11 V28 save",e); } };
  const notify = msg => { if(typeof visNotification === "function") visNotification(msg); };

  function injectStyles(){
    if(document.getElementById("s28styles")) return;
    const st=document.createElement("style"); st.id="s28styles"; st.textContent=`
      .s28-card{border:1px solid rgba(255,255,255,.10);border-radius:18px;padding:16px;background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.025));box-shadow:0 14px 40px rgba(0,0,0,.16)}
      .s28-kicker{font-size:10px;font-weight:950;letter-spacing:.12em;color:var(--s11-primary,#72e06a);text-transform:uppercase}.s28-title{font-size:20px;font-weight:950;margin:4px 0 2px}.s28-muted{opacity:.68;font-size:12px}.s28-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.s28-btn{border:1px solid rgba(255,255,255,.13);background:rgba(255,255,255,.06);color:inherit;border-radius:10px;padding:9px 12px;font:inherit;font-size:11px;font-weight:900;cursor:pointer}.s28-btn.primary{background:var(--s11-primary,#72e06a);color:#08120a;border-color:transparent}.s28-list{display:grid;gap:7px;margin-top:12px}.s28-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 10px;border-radius:11px;background:rgba(255,255,255,.035)}
      #s28palette,#s28overlay{position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.72);backdrop-filter:blur(8px);display:none;align-items:flex-start;justify-content:center;padding:10vh 16px 24px}#s28palette.open,#s28overlay.open{display:flex}.s28-modal{width:min(760px,96vw);max-height:82vh;overflow:auto;background:#111713;border:1px solid rgba(255,255,255,.14);border-radius:18px;box-shadow:0 30px 90px rgba(0,0,0,.5);padding:16px}.s28-search{width:100%;box-sizing:border-box;border:1px solid rgba(255,255,255,.14);background:#0b100d;color:white;border-radius:12px;padding:13px 14px;font:inherit;font-size:15px;outline:none}.s28-result{display:block;width:100%;text-align:left;border:0;border-bottom:1px solid rgba(255,255,255,.06);background:transparent;color:inherit;padding:12px 8px;cursor:pointer}.s28-result:hover{background:rgba(255,255,255,.05)}.s28-type{font-size:9px;font-weight:950;color:var(--s11-primary,#72e06a);letter-spacing:.1em}.s28-drop-active{outline:2px solid var(--s11-primary,#72e06a)!important;outline-offset:3px!important;box-shadow:0 0 0 7px rgba(114,224,106,.12)!important;transform:scale(1.01)}body.s28-dragging [draggable="true"],body.s28-dragging .player,body.s28-dragging .pitch-player{transition:transform .12s,box-shadow .12s}.s28-save-pill{position:fixed;right:16px;bottom:16px;z-index:2147482000;padding:7px 10px;border-radius:999px;background:#111713;border:1px solid rgba(255,255,255,.13);font-size:10px;font-weight:900;opacity:0;transform:translateY(8px);transition:.18s}.s28-save-pill.show{opacity:1;transform:none}.s28-templatebar{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}.s28-chip{border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.045);color:inherit;border-radius:999px;padding:6px 9px;font-size:10px;font-weight:850;cursor:pointer}
      @media(max-width:700px){.s28-modal{padding:12px}.s28-title{font-size:17px}.s28-btn{padding:10px 11px}.s28-card{border-radius:14px;padding:13px}}
    `; document.head.appendChild(st);
  }

  function installSaveFeedback(){
    if(document.getElementById("s28savepill")) return;
    const pill=document.createElement("div"); pill.id="s28savepill"; pill.className="s28-save-pill"; pill.textContent="✓ Gemt"; document.body.appendChild(pill);
    if(typeof scheduleCloudSave === "function" && !scheduleCloudSave.__s28){
      const old=scheduleCloudSave;
      const wrapped=function(...a){ pill.textContent="☁ Gemmer…"; pill.classList.add("show"); const r=old.apply(this,a); clearTimeout(wrapped._t); wrapped._t=setTimeout(()=>{pill.textContent="✓ Gemt"; setTimeout(()=>pill.classList.remove("show"),1100)},900); return r; };
      wrapped.__s28=true; scheduleCloudSave=wrapped;
    }
    const flush=()=>{ try { if(typeof saveCloudNow === "function" && typeof cloudReady!=="undefined" && cloudReady) saveCloudNow(); } catch{} };
    window.addEventListener("pagehide",flush);
    document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="hidden") flush(); });
  }

  function installDragFeedback(){
    document.addEventListener("dragstart",e=>{ if(e.target.closest?.('[draggable="true"],.player,.pitch-player')) document.body.classList.add("s28-dragging"); },true);
    document.addEventListener("dragend",()=>{document.body.classList.remove("s28-dragging");document.querySelectorAll(".s28-drop-active").forEach(x=>x.classList.remove("s28-drop-active"))},true);
    document.addEventListener("dragenter",e=>{const z=e.target.closest?.('[data-position],[data-slot],.position,.formation-slot,.pitch');if(z)z.classList.add("s28-drop-active")},true);
    document.addEventListener("dragleave",e=>{const z=e.target.closest?.('.s28-drop-active');if(z&&!z.contains(e.relatedTarget))z.classList.remove("s28-drop-active")},true);
    document.addEventListener("drop",()=>document.querySelectorAll(".s28-drop-active").forEach(x=>x.classList.remove("s28-drop-active")),true);
  }

  function palette(){
    if(document.getElementById("s28palette")) return;
    const o=document.createElement("div"); o.id="s28palette"; o.innerHTML=`<div class="s28-modal"><input id="s28search" class="s28-search" placeholder="Søg spiller, kamp, træning, øvelse eller video…"><div id="s28results" style="margin-top:8px"></div><div class="s28-muted" style="margin-top:10px">ESC lukker · Ctrl/Cmd + K åbner</div></div>`; document.body.appendChild(o);
    const input=o.querySelector("#s28search"), results=o.querySelector("#s28results");
    const all=()=>{
      const d=data(), out=[];
      players().forEach(p=>out.push({type:"SPILLER",title:p.name||p.fullName||"Spiller",sub:p.position||"",run:()=>openPlayerTimeline(p)}));
      (d.sessions||[]).forEach(x=>out.push({type:"TRÆNING",title:x.title||x.theme||"Træning",sub:fmt(x.date),run:()=>openCoach("training",x.id)}));
      (d.exercises||[]).forEach(x=>out.push({type:"ØVELSE",title:x.title||x.name||"Øvelse",sub:x.theme||"",run:()=>openCoach("exercises",null,x.id)}));
      (d.matches||[]).forEach(x=>out.push({type:"KAMP",title:x.opponent||x.title||"Kamp",sub:`${fmt(x.date)} ${x.result||""}`,run:()=>openMatchStory(x)}));
      (d.videoProjects||[]).forEach(x=>out.push({type:"VIDEO",title:x.title||x.opponent||"Videoanalyse",sub:x.matchVideo?.sourceType||"",run:()=>{ if(typeof s18OpenProject==="function") s18OpenProject(x.id); else openCoach("videos"); }}));
      return out;
    };
    function render(){ const q=input.value.trim().toLowerCase(); const items=all().filter(x=>!q||(`${x.type} ${x.title} ${x.sub}`).toLowerCase().includes(q)).slice(0,30); results.innerHTML=items.map((x,i)=>`<button class="s28-result" data-i="${i}"><div class="s28-type">${esc(x.type)}</div><strong>${esc(x.title)}</strong><div class="s28-muted">${esc(x.sub)}</div></button>`).join("")||`<div class="s28-muted" style="padding:18px 8px">Ingen resultater.</div>`; results.querySelectorAll("[data-i]").forEach(b=>b.onclick=()=>{items[+b.dataset.i].run();close()}); }
    const open=()=>{o.classList.add("open");input.value="";render();setTimeout(()=>input.focus(),0)}, close=()=>o.classList.remove("open");
    input.oninput=render; o.onclick=e=>{if(e.target===o)close()};
    document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();open()} if(e.key==="Escape")close()});
    window.start11CommandPalette=open;
  }

  function openCoach(tab,id,exerciseId){
    if(typeof s13Open!=="function") return;
    s13Open(); s13Tab=tab; if(id) s13Session=id; if(exerciseId) s13Exercise=exerciseId; s13Render();
  }

  function ensureOverlay(){ let o=document.getElementById("s28overlay"); if(!o){o=document.createElement("div");o.id="s28overlay";document.body.appendChild(o);o.onclick=e=>{if(e.target===o)o.classList.remove("open")}} return o; }
  function showOverlay(html){const o=ensureOverlay();o.innerHTML=`<div class="s28-modal">${html}</div>`;o.classList.add("open");o.querySelectorAll("[data-s28close]").forEach(b=>b.onclick=()=>o.classList.remove("open"));return o;}

  function playerEvents(p){
    const d=data(), id=p.id, rows=[];
    (d.sessions||[]).forEach(s=>{const a=s.attendance?.[id];if(a)rows.push({date:s.date,type:"TRÆNING",title:s.title||s.theme||"Træning",text:a==="present"?"Tilstede":a})});
    (d.matches||[]).forEach(m=>{const r=(m.playerRatings||[]).find(x=>x.playerId===id); if(r)rows.push({date:m.date,type:"KAMP",title:m.opponent||"Kamp",text:`Karakter ${r.rating??"—"}`})});
    const dev=p.development||{};(dev.evaluations||[]).forEach(e=>rows.push({date:e.date,type:"EVALUERING",title:"Spillerevaluering",text:e.note||"Ny evaluering"}));
    (dev.videos||[]).forEach(v=>rows.push({date:v.date||"",type:"VIDEO",title:v.title||"Videoklip",text:v.match||v.clipType||""}));
    return rows.sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  }
  function openPlayerTimeline(p){
    const rows=playerEvents(p); showOverlay(`<div style="display:flex;justify-content:space-between;gap:12px"><div><div class="s28-kicker">SPILLERENS UDVIKLINGSTIDSLINJE</div><div class="s28-title">${esc(p.name||p.fullName||"Spiller")}</div><div class="s28-muted">${esc(p.position||"")}</div></div><button class="s28-btn" data-s28close>LUK</button></div><div class="s28-list">${rows.map(r=>`<div class="s28-row"><div><div class="s28-type">${esc(r.type)} · ${esc(fmt(r.date))}</div><strong>${esc(r.title)}</strong><div class="s28-muted">${esc(r.text)}</div></div></div>`).join("")||`<div class="s28-muted">Der er endnu ingen registrerede hændelser på spilleren.</div>`}</div>`);
  }

  function matchPayload(m){
    const d=data(); return {v:1,match:{id:m.id,date:m.date,opponent:m.opponent,title:m.title,result:m.result,good:m.good,improve:m.improve,tactical:m.tactical,nextWeek:m.nextWeek,playerRatings:m.playerRatings||[]},team:{name:(typeof start11GetClubMeta==="function"?start11GetClubMeta()?.teamName:"")||"START11"},lineup:(d.matchLineups||[]).find(x=>x.id===m.id||x.matchId===m.id||x.opponent===m.opponent)||null};
  }
  function encodeShare(obj){ try{return btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/=+$/,'')}catch{return ""} }
  function decodeShare(s){try{return JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g,'+').replace(/_/g,'/')))))}catch{return null}}
  async function copyShare(m){const token=encodeShare(matchPayload(m));if(!token)return;const url=location.origin+location.pathname+"#start11-share="+token;try{await navigator.clipboard.writeText(url);notify("Delingslink kopieret.")}catch{showOverlay(`<div class="s28-kicker">DELINGSLINK</div><div class="s28-title">Kopiér linket</div><textarea class="s28-search" style="min-height:120px">${esc(url)}</textarea><div class="s28-actions"><button class="s28-btn" data-s28close>LUK</button></div>`)} }
  function openMatchStory(m){
    const d=data(), live=(d.liveMatches||[]).find(x=>x.id===m.liveMatchId), clips=(d.videoProjects||[]).flatMap(p=>(p.clips||[]).map(c=>({...c,projectTitle:p.title||p.opponent||"Video"}))).filter(c=>String(c.projectTitle||"").toLowerCase().includes(String(m.opponent||"").toLowerCase()));
    const o=showOverlay(`<div style="display:flex;justify-content:space-between;gap:12px"><div><div class="s28-kicker">KAMPENS HISTORIE</div><div class="s28-title">${esc(m.opponent||m.title||"Kamp")}</div><div class="s28-muted">${esc(fmt(m.date))} ${m.result?"· "+esc(m.result):""}</div></div><button class="s28-btn" data-s28close>LUK</button></div><div class="s28-list"><div class="s28-row"><div><div class="s28-type">FØR KAMP</div><strong>Plan & startopstilling</strong><div class="s28-muted">${(d.matchLineups||[]).some(x=>x.id===m.id||x.matchId===m.id||x.opponent===m.opponent)?"Startopstilling registreret":"Startopstilling mangler"}</div></div></div><div class="s28-row"><div><div class="s28-type">LIVE</div><strong>${live?.events?.length||0} events</strong><div class="s28-muted">${esc(live?.coachNotes||"Ingen live-noter")}</div></div></div><div class="s28-row"><div><div class="s28-type">VIDEO</div><strong>${clips.length} klip</strong><div class="s28-muted">Koblet til kampen</div></div></div><div class="s28-row"><div><div class="s28-type">LÆRING</div><strong>${esc(m.improve||m.tactical||"Ikke udfyldt endnu")}</strong><div class="s28-muted">Næste fokus: ${esc(m.nextWeek||"—")}</div></div></div></div><div class="s28-actions"><button id="s28share" class="s28-btn primary">KOPIÉR DELINGSLINK</button><button class="s28-btn" data-s28close>LUK</button></div>`);o.querySelector("#s28share").onclick=()=>copyShare(m);
  }
  function renderShared(payload){
    const m=payload?.match;if(!m)return; const o=showOverlay(`<div class="s28-kicker">START11 · MATCHDAY VIEW</div><div class="s28-title">${esc(payload.team?.name||"START11")}</div><div style="font-size:28px;font-weight:950;margin-top:20px">${esc(m.opponent||m.title||"Kamp")}</div><div class="s28-muted">${esc(fmt(m.date))} ${m.result?"· "+esc(m.result):""}</div><div class="s28-list"><div class="s28-row"><div><div class="s28-type">KAMPFOKUS</div><strong>${esc(m.tactical||m.good||"Kampinformation")}</strong></div></div>${m.nextWeek?`<div class="s28-row"><div><div class="s28-type">LÆRING</div><strong>${esc(m.nextWeek)}</strong></div></div>`:""}</div><div class="s28-actions"><button class="s28-btn" data-s28close>LUK</button></div>`);o.style.zIndex="2147483647";
  }

  function tacticalTemplates(){
    const withBall=["Spil frem, når muligheden er der","Skab overtal omkring bolden","Brug bredden og find rum centralt","Tredjemandsløb efter fremadrettet aflevering","Genkend øjeblikket for temposkifte"];
    const without=["Nærmeste spiller presser","Hvis én går, dækker den næste diagonalt","Højt pres ved tilbagelægning","Luk centralt og styr spillet ud","110% genpres efter boldtab"];
    const apply=()=>{
      document.querySelectorAll('textarea,input[type="text"]').forEach(el=>{
        if(el.dataset.s28templates) return; const hint=(el.placeholder+" "+el.name+" "+el.id+" "+el.closest("label")?.textContent).toLowerCase(); let arr=null;
        if(hint.includes("med bold")||hint.includes("teamwithball"))arr=withBall; else if(hint.includes("uden bold")||hint.includes("teamwithoutball"))arr=without; if(!arr)return;
        el.dataset.s28templates="1"; const bar=document.createElement("div");bar.className="s28-templatebar";bar.innerHTML=arr.map(x=>`<button type="button" class="s28-chip">+ ${esc(x)}</button>`).join(""); el.insertAdjacentElement("afterend",bar);bar.querySelectorAll("button").forEach((b,i)=>b.onclick=()=>{el.value=(el.value.trim()?el.value.trim()+"\n":"")+arr[i];el.dispatchEvent(new Event("input",{bubbles:true}));el.dispatchEvent(new Event("change",{bubbles:true}));save()});
      });
    }; new MutationObserver(()=>apply()).observe(document.body,{subtree:true,childList:true});apply();
  }

  function dashboardBriefing(){
    function xdate(x){return String(x?.date||"9999")}
    function buildCard(){
      const d=data();
      const sessions=(d.sessions||[]).filter(x=>x.date>=today()).sort((a,b)=>xdate(a).localeCompare(xdate(b)));
      const matches=(d.matches||[]).filter(x=>x.date>=today()).sort((a,b)=>xdate(a).localeCompare(xdate(b)));
      const nextS=sessions[0], nextM=matches[0];
      const clips=(d.videoProjects||[]).reduce((n,p)=>n+(p.clips?.length||0),0);
      const attMissing=nextS?players().filter(p=>!nextS.attendance?.[p.id]).length:0;
      const card=document.createElement("section");
      card.id="s28brief"; card.className="s28-card"; card.style.margin="0 0 14px";
      card.innerHTML=`<div class="s28-kicker">COACH ASSISTANT · I DAG</div><div class="s28-title">${nextM?`Næste kamp: ${esc(nextM.opponent||nextM.title||"Kamp")}`:nextS?`Næste træning: ${esc(nextS.title||nextS.theme||"Træning")}`:"Ingen kommende aktivitet registreret"}</div><div class="s28-muted">START11 samler det vigtigste, så du ikke skal lede efter det.</div><div class="s28-list">${nextM?`<div class="s28-row"><span>⚽ Kamp</span><strong>${esc(fmt(nextM.date))}</strong></div>`:""}${nextS?`<div class="s28-row"><span>🎯 Træning</span><strong>${esc(nextS.theme||nextS.title||fmt(nextS.date))}</strong></div>`:""}<div class="s28-row"><span>🎥 Videoklip</span><strong>${clips}</strong></div>${nextS?`<div class="s28-row"><span>✓ Fremmøde mangler</span><strong>${attMissing}</strong></div>`:""}</div><div class="s28-actions"><button id="s28cmd" class="s28-btn primary">SØG I START11</button>${nextM?`<button id="s28story" class="s28-btn">KAMPENS HISTORIE</button>`:""}</div>`;
      card.querySelector("#s28cmd").onclick=()=>window.start11CommandPalette?.();
      if(nextM) card.querySelector("#s28story").onclick=()=>openMatchStory(nextM);
      return card;
    }
    function inject(){
      const old=document.getElementById("s28brief");
      if(old) return;
      /* Main START11 match/dashboard page. */
      const matches=document.getElementById("matchesSection");
      if(matches && getComputedStyle(matches).display!=="none"){
        const anchor=matches.querySelector(".matches-dashboard-grid,.dashboard-grid,.start11-matches-grid")||matches.firstElementChild;
        const card=buildCard();
        if(anchor) matches.insertBefore(card,anchor); else matches.prepend(card);
        return;
      }
      /* Coaching Hub dashboard. */
      if(typeof s13Tab!=="undefined" && s13Tab==="dashboard"){
        const hub=document.getElementById("s13content");
        if(hub){hub.prepend(buildCard());return;}
      }
    }
    if(typeof s20Dashboard==="function" && !s20Dashboard.__s28){
      const old=s20Dashboard;
      const wrapped=function(t){const r=old.apply(this,arguments);setTimeout(()=>{document.getElementById("s28brief")?.remove();inject()},0);return r};
      wrapped.__s28=true; s20Dashboard=wrapped;
    }
    new MutationObserver(()=>inject()).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["style","class"]});
    inject(); setTimeout(inject,250); setTimeout(inject,1000);
  }

  function installPlayerTimelineButton(){
    function addButton(){
      const modal=document.getElementById("start11UnifiedPlayerModalV12");
      if(!modal || modal.style.display==="none") return;
      const top=modal.querySelector(".s11v12-top-right");
      if(!top || document.getElementById("s28PlayerTimelineBtn")) return;
      if(typeof start11V12IsNew!=="undefined" && start11V12IsNew) return;
      const btn=document.createElement("button");
      btn.type="button"; btn.id="s28PlayerTimelineBtn"; btn.className="s11v12-btn";
      btn.textContent="UDVIKLINGSTIDSLINJE";
      const saveBtn=top.querySelector("#s11v12Save");
      if(saveBtn) top.insertBefore(btn,saveBtn); else top.appendChild(btn);
      btn.addEventListener("click",()=>{
        const id=(typeof start11V12PlayerId!=="undefined")?start11V12PlayerId:null;
        const p=players().find(x=>String(x.id)===String(id));
        if(p) openPlayerTimeline(p); else notify("Kunne ikke finde spilleren.");
      });
    }
    if(typeof start11V12RenderTop==="function" && !start11V12RenderTop.__s28){
      const old=start11V12RenderTop;
      const wrapped=function(){const r=old.apply(this,arguments);setTimeout(addButton,0);return r};
      wrapped.__s28=true; start11V12RenderTop=wrapped;
    }
    if(typeof start11V12Open==="function" && !start11V12Open.__s28){
      const old=start11V12Open;
      const wrapped=function(){const r=old.apply(this,arguments);setTimeout(addButton,0);return r};
      wrapped.__s28=true; start11V12Open=wrapped;
    }
    new MutationObserver(addButton).observe(document.body,{subtree:true,childList:true});
    addButton();
  }

  function installMatchStoryButton(){
    function currentStoryMatch(){
      if(typeof s19MatchMode==="undefined" || !s19MatchMode?.active || !s19MatchMode?.match) return null;
      const raw=s19MatchMode.match;
      const opponent=(typeof s19Opponent==="function"?s19Opponent(raw):(raw.opponent||raw.away||raw.home||"Modstander"));
      const d=data();
      const review=(d.matches||[]).find(m=>
        (raw.id && (m.id===raw.id || m.matchId===raw.id)) ||
        (String(m.opponent||"").toLowerCase()===String(opponent||"").toLowerCase() && (!raw.date || !m.date || m.date===raw.date))
      );
      return review || {
        id:raw.id||s19MatchMode.key||"",
        matchId:raw.id||"",
        date:raw.date||"",
        time:raw.time||"",
        opponent,
        title:opponent,
        result:raw.result||"",
        good:"",
        improve:"",
        tactical:"",
        nextWeek:"",
        playerRatings:[]
      };
    }
    function add(){
      const bar=document.getElementById("s19MatchModeBar");
      if(!bar || !bar.classList.contains("open") || document.getElementById("s28MatchStoryBtn")) return;
      const buttons=[...bar.querySelectorAll("button")];
      const host=buttons[0]?.parentElement || bar;
      const btn=document.createElement("button");
      btn.type="button"; btn.id="s28MatchStoryBtn";
      btn.className=buttons[0]?.className || "s28-btn";
      btn.textContent="KAMPENS HISTORIE";
      btn.title="Saml startopstilling, live-data, video og læring for denne kamp";
      btn.addEventListener("click",()=>{const m=currentStoryMatch();if(m)openMatchStory(m);else notify("Kunne ikke finde den aktive kamp.")});
      host.insertBefore(btn,buttons[0]||null);
    }
    if(typeof s19UpdateMatchBar==="function" && !s19UpdateMatchBar.__s28story){
      const old=s19UpdateMatchBar;
      const wrapped=function(){const r=old.apply(this,arguments);setTimeout(add,0);return r};
      wrapped.__s28story=true; s19UpdateMatchBar=wrapped;
    }
    new MutationObserver(add).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["class"]});
    add(); setTimeout(add,300); setTimeout(add,1200);
  }

  function boot(){injectStyles();installSaveFeedback();installDragFeedback();palette();tacticalTemplates();dashboardBriefing();installPlayerTimelineButton();installMatchStoryButton();const h=location.hash.match(/start11-share=([^&]+)/);if(h){const p=decodeShare(h[1]);if(p)setTimeout(()=>renderShared(p),200)}}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();


/* =========================================================
   START11 V28.3 – COMPLETE COACH WORKFLOW LAYER
   - Discoverable tactical designer
   - Background DBU refresh (max every 6 hours)
   - Draft autosave through existing native save handlers
   - Live notes autosave
   - Match stats + Player of the Match
   - Better empty-state shortcuts
   ========================================================= */
(() => {
  "use strict";
  if (window.__START11_V283__) return;
  window.__START11_V283__ = true;
  window.START11_BUILD = "V28.3-COMPLETE-COACH-WORKFLOW";

  const esc28 = v => String(v ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  const d28 = () => (typeof s13Data === "object" && s13Data) ? s13Data : {};
  const save28 = () => { try { if(typeof s13Save === "function") s13Save(); else if(typeof scheduleCloudSave === "function") scheduleCloudSave(); } catch(_){} };
  const notify28 = m => { try { if(typeof visNotification === "function") visNotification(m); } catch(_){} };

  /* ---------- Tactical designer: make the existing V26.5 board obvious ---------- */
  function mountTacticalButton(){
    const bar=document.getElementById("s19MatchModeBar");
    if(!bar || !bar.classList.contains("open") || document.getElementById("s28TacticalBtn")) return;
    const host=bar.querySelector(".s19-match-actions") || bar.querySelector("div:last-child") || bar;
    const sample=host.querySelector("button");
    const b=document.createElement("button");
    b.type="button"; b.id="s28TacticalBtn"; b.className=sample?.className || "s28-btn"; b.textContent="TAKTIKTAVLE";
    b.onclick=()=>{
      if(typeof window.s25OpenMatchSituations === "function") window.s25OpenMatchSituations();
      else notify28("Taktikdesigneren kunne ikke åbnes.");
    };
    host.appendChild(b);
  }
  if(typeof s19UpdateMatchBar === "function" && !s19UpdateMatchBar.__s283){
    const old=s19UpdateMatchBar;
    const wrapped=function(){const r=old.apply(this,arguments);setTimeout(mountTacticalButton,0);return r};
    wrapped.__s283=true; s19UpdateMatchBar=wrapped;
  }
  setInterval(mountTacticalButton,1800);

  /* ---------- Background DBU sync: use the app's existing DBU connector ---------- */
  function maybeAutoDbu(){
    try{
      if(typeof syncDbuMatches !== "function") return;
      const key=(typeof START11_DBU_URL_KEY !== "undefined" ? START11_DBU_URL_KEY : "start11DbuTeamUrl");
      if(!localStorage.getItem(key)) return;
      const stampKey="start11.v28.lastDbuSync."+(typeof activeTeamId!=="undefined"&&activeTeamId?activeTeamId:"default");
      const last=Number(localStorage.getItem(stampKey)||0);
      if(Date.now()-last < 6*60*60*1000) return;
      localStorage.setItem(stampKey,String(Date.now()));
      Promise.resolve(syncDbuMatches()).catch(()=>localStorage.removeItem(stampKey));
    }catch(_){}
  }
  setTimeout(maybeAutoDbu,6500);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden) maybeAutoDbu()});

  /* ---------- Autosave drafts using the app's own save buttons ----------
     Text fields commit on blur/change so typing is never interrupted. ---------- */
  const nativeSaveByPrefix=[
    {prefixes:["s13weekly"],button:"s13saveweekly"},
    {prefixes:["s13ex"],button:"s13saveex"},
    {prefixes:["s13sdate","s13stheme","s13stitle","s13snote"],button:"s13savesession"},
    {prefixes:["s13mdate","s13mres","s13mopp","s13mworked","s13mimp","s13mtac","s13mnext"],button:"s13savematch"},
    {prefixes:["s20ss","s20se","s20stitle","s20stheme","s20sload","s20sobj","s20snote"],button:"s20saveseason"},
    {prefixes:["s20sc"],button:"s20savescout"}
  ];
  let draftTimer=null;
  document.addEventListener("change",e=>{
    const el=e.target;
    if(!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement)) return;
    if(el.id==="s20livenotes") return;
    const rule=nativeSaveByPrefix.find(r=>r.prefixes.some(p=>el.id?.startsWith(p)));
    if(!rule) return;
    clearTimeout(draftTimer);
    draftTimer=setTimeout(()=>{
      const b=document.getElementById(rule.button);
      if(b && !b.disabled) b.click();
    },180);
  },true);

  /* Live notes are model-aware, so they can save while typing without rerendering. */
  let liveNoteTimer=null;
  document.addEventListener("input",e=>{
    if(e.target?.id!=="s20livenotes") return;
    clearTimeout(liveNoteTimer);
    liveNoteTimer=setTimeout(()=>{
      try{
        const v=typeof s20CurrentLive==="function"?s20CurrentLive():null;
        if(!v) return;
        v.coachNotes=e.target.value||"";
        save28();
      }catch(_){}
    },650);
  },true);

  /* ---------- Match stats ---------- */
  function ownPlayers(){
    return (typeof start11FullSquad!=="undefined"&&Array.isArray(start11FullSquad))?start11FullSquad:[];
  }
  function matchLive(m){
    const all=d28().liveMatches||[];
    if(m?.liveMatchId) return all.find(x=>x.id===m.liveMatchId)||null;
    return all.find(x=>x.date===m?.date && (!m?.opponent || [x.home,x.away].some(n=>String(n||"").toLowerCase()===String(m.opponent||"").toLowerCase())))||null;
  }
  function matchStats(m){
    const live=matchLive(m), ev=live?.events||[], by={};
    const ensure=(id,name)=>{const k=id||name||"unknown";return by[k]||(by[k]={id,name:name||ownPlayers().find(p=>p.id===id)?.name||"Ukendt",goals:0,assists:0,yellow:0,red:0})};
    ev.forEach(x=>{
      if(x.type==="goal-for"){
        const scorer=(x.note||"").split(" · assist ")[0].trim(); const p=ensure(x.playerId,scorer); p.goals++;
        const a=(x.note||"").split(" · assist ")[1]?.trim(); if(a){const ap=ownPlayers().find(q=>String(q.name||"").toLowerCase()===a.toLowerCase());ensure(ap?.id,a).assists++}
      }
      if(x.type==="yellow"||x.type==="red"){const p=ensure(x.playerId,x.note||"");p[x.type]++}
    });
    return {live,rows:Object.values(by).filter(x=>x.goals||x.assists||x.yellow||x.red)};
  }
  window.start11V28OpenMatchStats=function(m){
    if(!m) return;
    const {live,rows}=matchStats(m), ps=ownPlayers();
    const overlay=typeof showOverlay==="function"?showOverlay(`
      <div style="display:flex;justify-content:space-between;gap:12px"><div><div class="s28-kicker">KAMPSTATISTIK</div><div class="s28-title">${esc28(m.opponent||"Kamp")}</div><div class="s28-muted">${esc28(m.result||"")} · ${live?.events?.length||0} registrerede events</div></div><button class="s28-btn" data-s28close>LUK</button></div>
      <div class="s28-list">${rows.map(x=>`<div class="s28-row"><strong>${esc28(x.name)}</strong><span>${x.goals?`⚽ ${x.goals} `:""}${x.assists?`A ${x.assists} `:""}${x.yellow?`🟨 ${x.yellow} `:""}${x.red?`🟥 ${x.red}`:""}</span></div>`).join("")||`<div class="s28-muted">Ingen individuelle kamp-events registreret endnu.</div>`}</div>
      <label style="display:grid;gap:6px;margin-top:16px"><span class="s28-type">KAMPENS SPILLER</span><select id="s28potm" class="s28-search"><option value="">Ikke valgt</option>${ps.map(p=>`<option value="${esc28(p.id)}" ${m.playerOfMatchId===p.id?"selected":""}>${esc28(p.name)}</option>`).join("")}</select></label>
      <div class="s28-actions"><button id="s28potmsave" class="s28-btn primary">GEM KAMPENS SPILLER</button><button class="s28-btn" data-s28close>LUK</button></div>`):null;
    overlay?.querySelector("#s28potmsave")?.addEventListener("click",()=>{m.playerOfMatchId=overlay.querySelector("#s28potm")?.value||"";save28();notify28("Kampens spiller gemt.")});
  };

  /* Add stats to Match Story without replacing the existing story implementation. */
  if(typeof openMatchStory==="function" && !openMatchStory.__s283){
    const old=openMatchStory;
    const wrapped=function(m){const r=old.apply(this,arguments);setTimeout(()=>{const modal=document.querySelector("#s28overlay .s28-modal");if(!modal||modal.querySelector("#s28stats"))return;const actions=modal.querySelector(".s28-actions");if(!actions)return;const b=document.createElement("button");b.id="s28stats";b.className="s28-btn";b.textContent="KAMPSTATISTIK";b.onclick=()=>window.start11V28OpenMatchStats(m);actions.prepend(b);const p=ownPlayers().find(x=>x.id===m?.playerOfMatchId);if(p){const row=document.createElement("div");row.className="s28-row";row.innerHTML=`<div><div class="s28-type">KAMPENS SPILLER</div><strong>${esc28(p.name)}</strong></div>`;modal.querySelector(".s28-list")?.appendChild(row)}},0);return r};
    wrapped.__s283=true; openMatchStory=wrapped;
  }

  /* ---------- Empty states: add useful next action where there is none ---------- */
  function improveEmptyStates(root=document){
    root.querySelectorAll(".s13mut").forEach(el=>{
      if(el.dataset.s283empty) return;
      const t=(el.textContent||"").trim().toLowerCase();
      let label="", action=null;
      if(t.includes("ingen øvelser")){label="+ OPRET ØVELSE";action=()=>document.getElementById("s13newex")?.click()}
      else if(t.includes("ingen træninger")){label="+ OPRET TRÆNING";action=()=>document.getElementById("s13newsession")?.click()}
      else if(t.includes("ingen kampanalyser")){label="+ OPRET ANALYSE";action=()=>document.getElementById("s13newmatch")?.click()}
      else if(t.includes("ingen principper")){label="+ OPRET PRINCIP";action=()=>document.getElementById("s13addpr")?.click()}
      if(!action) return;
      el.dataset.s283empty="1";
      const b=document.createElement("button");b.type="button";b.className="s13btn primary";b.style.marginTop="8px";b.textContent=label;b.onclick=action;el.insertAdjacentElement("afterend",b);
    });
  }
  const mo=new MutationObserver(()=>improveEmptyStates());
  mo.observe(document.body,{childList:true,subtree:true});
  setTimeout(()=>improveEmptyStates(),1200);

  console.info("START11 loaded:",window.START11_BUILD);
})();


/* =========================================================
   START11 V29 – DBU LIGA HUB + MATCH STORY SCORER FIX
========================================================= */
(function(){
  if(window.__START11_V29__) return;
  window.__START11_V29__=true;
  window.START11_BUILD="V29-DBU-LIGA-HUB";

  const esc29=v=>String(v??"").replace(/[&<>\"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const norm29=v=>String(v||"").trim().toLowerCase();
  const notify29=m=>{try{if(typeof visNotification==="function")visNotification(m);else console.info(m)}catch(_){}};
  const data29=()=>typeof s13Data!=="undefined"&&s13Data?s13Data:{};
  const ownTeam29=()=>{try{return (typeof start11CalendarTeamName==="function"?start11CalendarTeamName():"")||(typeof start11GetClubMeta==="function"?start11GetClubMeta()?.teamName:"")||""}catch(_){return ""}};

  function styles29(){
    if(document.getElementById("s29styles"))return;
    const s=document.createElement("style");s.id="s29styles";s.textContent=`
      #s29overlay{position:fixed;inset:0;z-index:2147483500;background:rgba(0,0,0,.78);backdrop-filter:blur(9px);display:none;align-items:flex-start;justify-content:center;padding:5vh 14px 24px}#s29overlay.open{display:flex}
      .s29modal{width:min(1050px,98vw);max-height:90vh;overflow:auto;background:#0d130f;border:1px solid rgba(255,255,255,.14);border-radius:18px;box-shadow:0 30px 100px rgba(0,0,0,.58);padding:18px;color:#fff}.s29head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.s29k{font-size:9px;font-weight:950;letter-spacing:.13em;color:var(--s11-primary,#72e06a)}.s29title{font-size:28px;font-weight:950;margin-top:3px}.s29mut{font-size:11px;opacity:.62}.s29btn{border:1px solid rgba(255,255,255,.13);background:rgba(255,255,255,.05);color:inherit;border-radius:9px;padding:9px 12px;font:inherit;font-size:10px;font-weight:900;cursor:pointer}.s29btn.primary{background:var(--s11-primary,#72e06a);color:#071007;border-color:transparent}.s29tabs{display:flex;gap:6px;flex-wrap:wrap;margin:18px 0 12px}.s29tab.active{background:var(--s11-primary,#72e06a);color:#071007}.s29panel{border:1px solid rgba(255,255,255,.09);border-radius:13px;overflow:hidden;background:rgba(255,255,255,.025)}.s29table{width:100%;border-collapse:collapse;font-size:11px}.s29table th{font-size:8px;letter-spacing:.08em;text-transform:uppercase;opacity:.55;text-align:left;padding:9px 8px;border-bottom:1px solid rgba(255,255,255,.08)}.s29table td{padding:10px 8px;border-bottom:1px solid rgba(255,255,255,.055)}.s29table tr.mine{background:color-mix(in srgb,var(--s11-primary,#72e06a) 12%,transparent)}.s29table tr:last-child td{border-bottom:0}.s29team{display:flex;align-items:center;gap:8px;font-weight:850}.s29logo{width:24px;height:24px;object-fit:contain}.s29cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.s29card{padding:14px;border:1px solid rgba(255,255,255,.09);border-radius:13px;background:rgba(255,255,255,.025)}.s29big{font-size:25px;font-weight:950;margin-top:4px}.s29empty{padding:28px;text-align:center;opacity:.62}.s29match{display:grid;grid-template-columns:80px 1fr auto 1fr;gap:10px;align-items:center;padding:10px;border-bottom:1px solid rgba(255,255,255,.055)}.s29match:last-child{border-bottom:0}.s29right{text-align:right}@media(max-width:700px){.s29cards{grid-template-columns:1fr}.s29table{font-size:9px}.s29table th,.s29table td{padding:8px 5px}.s29match{grid-template-columns:62px 1fr auto 1fr;font-size:9px}.s29hide-mobile{display:none}}
    `;document.head.appendChild(s);
  }
  function overlay29(){let o=document.getElementById("s29overlay");if(!o){o=document.createElement("div");o.id="s29overlay";document.body.appendChild(o);o.onclick=e=>{if(e.target===o)o.classList.remove("open")}}return o}
  function dbuKey29(){return typeof START11_DBU_URL_KEY!=="undefined"?START11_DBU_URL_KEY:"start11DbuTeamUrl"}
  function cacheKey29(){return "start11.v29.league."+(typeof activeTeamId!=="undefined"&&activeTeamId?activeTeamId:"default")}
  function cached29(){try{return JSON.parse(localStorage.getItem(cacheKey29())||"null")}catch(_){return null}}
  function saveCache29(x){try{localStorage.setItem(cacheKey29(),JSON.stringify({at:Date.now(),data:x}))}catch(_){}}

  async function fetchLeague29(force=false){
    const cached=cached29();if(!force&&cached?.data&&Date.now()-Number(cached.at||0)<6*60*60*1000)return cached.data;
    const url=(document.getElementById("dbuTeamUrlInput")?.value||localStorage.getItem(dbuKey29())||"").trim();
    if(!url)throw new Error("Indsæt først jeres DBU-holdlink.");
    if(typeof ensureSession==="function"){const ok=await ensureSession();if(!ok)throw new Error("Du skal være logget ind.")}
    const res=await fetch(`${SUPABASE_URL}/functions/v1/dbu-matches`,{method:"POST",headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${session?.access_token}`,"Content-Type":"application/json"},body:JSON.stringify({url})});
    const x=await res.json().catch(()=>null);if(!res.ok||!x?.success)throw new Error(x?.error||`DBU svarede ${res.status}`);
    if(!x.league?.found)throw new Error("START11 kunne ikke finde rækken/puljen fra dette DBU-holdlink.");
    saveCache29(x.league);return x.league;
  }

  function teamLogo29(x){return x?.logo?`<img class="s29logo" src="${esc29(x.logo)}" alt="">`:""}
  function standing29(l){
    const own=norm29(ownTeam29()),rows=l.standings||[];
    if(!rows.length)return `<div class="s29empty">DBU-siden indeholder ikke en stilling, som START11 kunne læse.</div>`;
    return `<div class="s29panel"><table class="s29table"><thead><tr><th>#</th><th>Hold</th><th>K</th><th>V</th><th>U</th><th>T</th><th>Mål</th><th class="s29hide-mobile">+/-</th><th>P</th></tr></thead><tbody>${rows.map((r,i)=>`<tr class="${own&&norm29(r.team).includes(own)||own&&own.includes(norm29(r.team))?"mine":""}"><td>${esc29(r.position||i+1)}</td><td><div class="s29team">${teamLogo29(r)}<span>${esc29(r.team)}</span></div></td><td>${esc29(r.played)}</td><td>${esc29(r.won)}</td><td>${esc29(r.drawn)}</td><td>${esc29(r.lost)}</td><td>${esc29(r.goals)}</td><td class="s29hide-mobile">${esc29(r.difference)}</td><td><strong>${esc29(r.points)}</strong></td></tr>`).join("")}</tbody></table></div>`;
  }
  function matches29(l){const rows=l.matches||[];if(!rows.length)return `<div class="s29empty">Ingen ligakampe fundet på DBU-siden.</div>`;return `<div class="s29panel">${rows.map(m=>`<div class="s29match"><div class="s29mut">${esc29(m.date)}<br>${esc29(m.time)}</div><div class="s29right">${esc29(m.homeTeam)}</div><strong>${esc29(m.result||"–")}</strong><div>${esc29(m.awayTeam)}</div></div>`).join("")}</div>`}
  function scorers29(l){const rows=l.topScorers||[];if(!rows.length)return `<div class="s29empty">DBU stiller ikke en målscorerliste til rådighed på den fundne rækkeside.</div>`;return `<div class="s29panel"><table class="s29table"><thead><tr><th>#</th><th>Spiller</th><th>Hold</th><th>Mål</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><td>${esc29(r.position||i+1)}</td><td><strong>${esc29(r.player)}</strong></td><td>${esc29(r.team)}</td><td><strong>${esc29(r.goals)}</strong></td></tr>`).join("")}</tbody></table></div>`}
  function teams29(l){const rows=l.teams||[];if(!rows.length)return `<div class="s29empty">Ingen hold fundet.</div>`;return `<div class="s29cards">${rows.map(t=>`<div class="s29card"><div class="s29team">${teamLogo29(t)}<strong>${esc29(t.name)}</strong></div></div>`).join("")}</div>`}
  function overview29(l){const own=norm29(ownTeam29()),me=(l.standings||[]).find(r=>norm29(r.team).includes(own)||own.includes(norm29(r.team))),top=(l.topScorers||[])[0];return `<div class="s29cards"><div class="s29card"><div class="s29k">JERES PLACERING</div><div class="s29big">${esc29(me?.position||"—")}</div><div class="s29mut">${esc29(me?`${me.points} point · ${me.goals}`:"Holdet blev ikke matchet i stillingen")}</div></div><div class="s29card"><div class="s29k">RÆKKEN</div><div class="s29big">${esc29((l.standings||[]).length||"—")}</div><div class="s29mut">hold i den fundne stilling</div></div><div class="s29card"><div class="s29k">TOPSCORER</div><div class="s29big" style="font-size:18px">${esc29(top?.player||"—")}</div><div class="s29mut">${top?`${esc29(top.goals)} mål · ${esc29(top.team)}`:"Ingen målscorerdata fra DBU"}</div></div></div>`}

  function renderLeague29(l,tab="overview"){
    styles29();const o=overlay29();const tabs=[["overview","OVERSIGT"],["standing","STILLING"],["matches","KAMPE"],["scorers","MÅLSCORERE"],["teams","HOLD"]];
    const body=tab==="standing"?standing29(l):tab==="matches"?matches29(l):tab==="scorers"?scorers29(l):tab==="teams"?teams29(l):overview29(l);
    o.innerHTML=`<div class="s29modal"><div class="s29head"><div><div class="s29k">START11 · DBU LIGA</div><div class="s29title">${esc29(l.name||"Liga")}</div><div class="s29mut">Data hentet fra den DBU-række, der er koblet til holdet.</div></div><div style="display:flex;gap:7px"><button id="s29refresh" class="s29btn">OPDATÉR</button><button id="s29close" class="s29btn">LUK</button></div></div><div class="s29tabs">${tabs.map(([k,n])=>`<button class="s29btn s29tab ${tab===k?"active":""}" data-tab="${k}">${n}</button>`).join("")}</div><div id="s29body">${body}</div></div>`;o.classList.add("open");
    o.querySelector("#s29close").onclick=()=>o.classList.remove("open");o.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>renderLeague29(l,b.dataset.tab));o.querySelector("#s29refresh").onclick=async()=>{const b=o.querySelector("#s29refresh");b.disabled=true;b.textContent="HENTER…";try{const n=await fetchLeague29(true);renderLeague29(n,tab);notify29("Liga-data opdateret.")}catch(e){notify29(e.message||String(e));b.disabled=false;b.textContent="OPDATÉR"}}
  }
  window.start11OpenDbuLeague=async function(){styles29();const c=cached29();if(c?.data)renderLeague29(c.data);else{notify29("Henter liga fra DBU…");try{renderLeague29(await fetchLeague29(false))}catch(e){notify29(e.message||String(e))}}};

  function mountLeagueButton29(){
    const sync=document.getElementById("syncDbuMatchesButton");if(!sync||document.getElementById("s29LeagueButton"))return;
    const b=document.createElement("button");b.type="button";b.id="s29LeagueButton";b.className=sync.className||"";b.textContent="LIGA";b.style.marginLeft="8px";b.onclick=()=>window.start11OpenDbuLeague();sync.insertAdjacentElement("afterend",b);
  }

  /* Match Story: show only goal scorers actually registered in START11 live data. */
  function storyMatch29(modal){
    const title=norm29(modal.querySelector(".s28-title")?.textContent);const d=data29();
    let m=(d.matches||[]).find(x=>norm29(x.opponent||x.title)===title);
    if(!m&&typeof s19MatchMode!=="undefined"&&s19MatchMode?.active)m=s19MatchMode.match;
    return m||null;
  }
  function liveFor29(m){const all=data29().liveMatches||[];if(m?.liveMatchId){const x=all.find(v=>v.id===m.liveMatchId);if(x)return x}const opp=norm29(m?.opponent||m?.title);return all.find(v=>(!m?.date||v.date===m.date)&&(!opp||[v.home,v.away].some(n=>norm29(n)===opp)))||null}
  function addScorersToStory29(){
    const modal=document.querySelector("#s28overlay.open .s28-modal");if(!modal||!String(modal.querySelector(".s28-kicker")?.textContent||"").includes("KAMPENS HISTORIE")||modal.querySelector("#s29StoryGoals"))return;
    const m=storyMatch29(modal),live=liveFor29(m),goals=(live?.events||[]).filter(e=>e.type==="goal-for");if(!goals.length)return;
    const row=document.createElement("div");row.id="s29StoryGoals";row.className="s28-row";row.innerHTML=`<div><div class="s28-type">VORES MÅL</div><strong>${goals.map(g=>`${esc29(g.minute?g.minute+"' ":"")}${esc29(String(g.note||"").split(" · assist ")[0]||"Ukendt målscorer")}`).join(" · ")}</strong></div>`;
    const liveRow=[...modal.querySelectorAll(".s28-row")].find(x=>String(x.querySelector(".s28-type")?.textContent||"").trim()==="LIVE");if(liveRow)liveRow.insertAdjacentElement("afterend",row);else modal.querySelector(".s28-list")?.prepend(row);
  }

  const obs=new MutationObserver(()=>{mountLeagueButton29();addScorersToStory29()});obs.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["class","style"]});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{styles29();mountLeagueButton29()});else{styles29();mountLeagueButton29()}
  setTimeout(mountLeagueButton29,1000);setTimeout(mountLeagueButton29,3500);
  console.info("START11 loaded:",window.START11_BUILD);
})();


/* =========================================================
   START11 V30 – DEVELOPMENT CYCLE + BRIEF STUDIO
   Observation -> Fokus -> Træning -> Kamp -> Video -> Evaluering
   + Kampbrief / Træningsbrief / Udviklingsrapport
========================================================= */
(() => {
"use strict";
if(window.__START11_V30__) return;
window.__START11_V30__=true;
window.START11_BUILD="V30-DEVELOPMENT-CYCLE-BRIEF-STUDIO";

const E=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
const D=()=>typeof s13Data==="object"&&s13Data?s13Data:{};
const P=()=>typeof start11FullSquad!=="undefined"&&Array.isArray(start11FullSquad)?start11FullSquad:[];
const id=(p="id")=>typeof s13Id==="function"?s13Id(p):`${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;
const save=()=>{try{typeof s13Save==="function"?s13Save():scheduleCloudSave?.()}catch(e){console.warn("V30 save",e)}};
const fmt=v=>{if(!v)return"—";try{return new Intl.DateTimeFormat("da-DK",{day:"2-digit",month:"short",year:"numeric"}).format(new Date(v+"T12:00:00"))}catch{return v}};
const meta=()=>typeof s13Meta==="function"?s13Meta():({clubName:"START11",teamName:""});
let activeCycle=null;

function ensure(){
 const d=D();
 if(!Array.isArray(d.developmentCycles))d.developmentCycles=[];
 d.developmentCycles.forEach(c=>{
  c.scope=c.scope||"team";c.playerId=c.playerId||"";c.title=c.title||"Udviklingsforløb";
  c.observation=c.observation||"";c.focus=c.focus||"";c.sessionIds=Array.isArray(c.sessionIds)?c.sessionIds:[];
  c.matchIds=Array.isArray(c.matchIds)?c.matchIds:[];c.videoRefs=Array.isArray(c.videoRefs)?c.videoRefs:[];
  c.evaluation=c.evaluation||"";c.nextFocus=c.nextFocus||"";c.status=c.status||"active";
  c.createdAt=c.createdAt||new Date().toISOString();c.updatedAt=c.updatedAt||c.createdAt;
 });
}
if(typeof s13Norm==="function"&&!s13Norm.__v30){
 const old=s13Norm;
 const wrapped=function(raw={}){const x=old(raw);x.developmentCycles=Array.isArray(raw.developmentCycles)?raw.developmentCycles:[];return x};
 wrapped.__v30=true;s13Norm=wrapped;
}

function styles(){
 if(document.getElementById("s30styles"))return;
 const s=document.createElement("style");s.id="s30styles";s.textContent=`
 .s30hero{padding:16px;border:1px solid var(--s11-border-strong);border-radius:10px;background:linear-gradient(115deg,var(--s11-theme-glow-soft),transparent),#071009}
 .s30flow{display:grid;grid-template-columns:repeat(7,minmax(110px,1fr));gap:7px;overflow:auto;margin:12px 0}.s30step{min-height:82px;padding:10px;border:1px solid rgba(255,255,255,.08);border-radius:8px;background:#08100a}.s30step b{display:block;color:var(--s11-primary);font-size:8px;margin-bottom:6px}.s30step span{font-size:8px;line-height:1.45;color:#d8e0da}
 .s30cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.s30card{padding:13px;border:1px solid rgba(255,255,255,.08);border-radius:9px;background:#071009}.s30bar{display:flex;gap:6px;flex-wrap:wrap;align-items:center}.s30field{display:grid;gap:5px;margin-top:9px}.s30field label{font-size:7px;font-weight:950;color:#8e9a91;text-transform:uppercase}.s30field input,.s30field textarea,.s30field select{box-sizing:border-box;width:100%;border:1px solid rgba(255,255,255,.12);border-radius:6px;background:#050a06;color:#fff;padding:9px;font:inherit;font-size:9px}.s30field textarea{min-height:75px;resize:vertical}
 #s30overlay{position:fixed;inset:0;z-index:2147483300;display:none;align-items:flex-start;justify-content:center;padding:4vh 16px;background:rgba(0,0,0,.78);backdrop-filter:blur(8px);overflow:auto}#s30overlay.open{display:flex}.s30modal{width:min(1050px,96vw);background:#101612;border:1px solid rgba(255,255,255,.14);border-radius:16px;padding:17px;box-shadow:0 30px 90px rgba(0,0,0,.5)}
 .s30preview{margin-top:12px;padding:28px;background:#fff;color:#111;border-radius:10px;font-family:Arial,sans-serif}.s30preview h1,.s30preview h2,.s30preview h3{margin:0 0 8px}.s30preview .muted{color:#666;font-size:12px}.s30preview .box{border:1px solid #ddd;border-radius:8px;padding:12px;margin:10px 0}.s30preview ul{padding-left:18px}
 @media(max-width:850px){.s30cards{grid-template-columns:1fr}.s30flow{grid-template-columns:repeat(7,140px)}}
 @media print{body>*{display:none!important}#s30overlay{display:block!important;position:static!important;background:white!important;padding:0!important}#s30overlay>*:not(.s30modal){display:none!important}.s30modal{display:block!important;width:100%!important;border:0!important;box-shadow:none!important;padding:0!important}.s30modal>*:not(.s30preview){display:none!important}.s30preview{display:block!important;margin:0!important;padding:12mm!important}}
 `;document.head.appendChild(s);
}

function playerName(c){return c.scope==="player"?(P().find(p=>String(p.id)===String(c.playerId))?.name||"Spiller"):"Holdet"}
function cycleProgress(c){return [c.observation,c.focus,c.sessionIds.length,c.matchIds.length,c.videoRefs.length,c.evaluation,c.nextFocus].filter(x=>Array.isArray(x)?x.length:!!String(x||"").trim()).length}
function selectOptions(arr,selected,label){
 return arr.map(x=>`<option value="${E(x.id)}" ${selected.includes(String(x.id))?"selected":""}>${E(label(x))}</option>`).join("");
}
function clips(){
 const out=[];(D().videoProjects||[]).forEach(p=>(p.clips||[]).forEach(c=>out.push({id:`${p.id}::${c.id}`,title:`${p.title||"Video"} · ${c.title||"Klip"}`})));return out;
}
function renderCycle(t){
 ensure();
 const all=D().developmentCycles;
 const c=all.find(x=>x.id===activeCycle)||null;
 if(!c){
  t.innerHTML=`<div class="s30hero"><div class="s13head"><div><strong>DEVELOPMENT CYCLE</strong><div class="s13mut">Observation → fokus → træning → kamp → video → evaluering → næste fokus.</div></div><button id="s30new" class="s13btn primary">+ NYT FORLØB</button></div>
  <div class="s30cards">${all.map(x=>`<div class="s30card"><div class="s30bar" style="justify-content:space-between"><div><div class="s13title">${E(x.title)}</div><div class="s13mut">${E(playerName(x))} · ${x.status==="done"?"AFSLUTTET":"AKTIV"} · ${cycleProgress(x)}/7 trin</div></div><button class="s13btn" data-cycle="${E(x.id)}">ÅBN</button></div><div class="s20progress" style="margin-top:10px"><span style="width:${cycleProgress(x)/7*100}%"></span></div><div class="s13mut" style="margin-top:8px">${E(x.focus||x.observation||"Tilføj observation og fokus.")}</div></div>`).join("")||`<div class="s13mut">Ingen udviklingsforløb endnu. Opret det første fra en observation.</div>`}</div></div>`;
  t.querySelector("#s30new")?.addEventListener("click",()=>{const n={id:id("cycle"),scope:"team",playerId:"",title:"Nyt udviklingsforløb",observation:"",focus:"",sessionIds:[],matchIds:[],videoRefs:[],evaluation:"",nextFocus:"",status:"active",createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};all.unshift(n);activeCycle=n.id;save();renderCycle(t)});
  t.querySelectorAll("[data-cycle]").forEach(b=>b.onclick=()=>{activeCycle=b.dataset.cycle;renderCycle(t)});
  return;
 }
 const sessions=D().sessions||[],matches=D().matches||[],cs=clips();
 t.innerHTML=`<div class="s30hero"><div class="s13head"><div><strong>DEVELOPMENT CYCLE</strong><div class="s13mut">${E(playerName(c))} · ${cycleProgress(c)}/7 trin udfyldt</div></div><div class="s30bar"><button id="s30back" class="s13btn">← ALLE</button><button id="s30report" class="s13btn">UDVIKLINGSRAPPORT</button><button id="s30save" class="s13btn primary">GEM</button></div></div>
 <div class="s30flow">${[["1 · OBSERVATION",c.observation],["2 · FOKUS",c.focus],["3 · TRÆNING",c.sessionIds.length?`${c.sessionIds.length} valgt`:"Ikke koblet"],["4 · KAMP",c.matchIds.length?`${c.matchIds.length} valgt`:"Ikke koblet"],["5 · VIDEO",c.videoRefs.length?`${c.videoRefs.length} klip`:"Ikke koblet"],["6 · EVALUERING",c.evaluation],["7 · NÆSTE FOKUS",c.nextFocus]].map(([a,b])=>`<div class="s30step"><b>${a}</b><span>${E(b||"Mangler")}</span></div>`).join("")}</div></div>
 <div class="s30cards" style="margin-top:10px">
 <div class="s30card"><div class="s30field"><label>Titel</label><input id="s30title" value="${E(c.title)}"></div><div class="s30field"><label>Forløb for</label><select id="s30scope"><option value="team" ${c.scope==="team"?"selected":""}>Holdet</option><option value="player" ${c.scope==="player"?"selected":""}>Spiller</option></select></div><div class="s30field"><label>Spiller</label><select id="s30player"><option value="">Vælg spiller</option>${P().map(p=>`<option value="${E(p.id)}" ${String(p.id)===String(c.playerId)?"selected":""}>${E(p.name)}</option>`).join("")}</select></div><div class="s30field"><label>Observation</label><textarea id="s30obs">${E(c.observation)}</textarea></div><div class="s30field"><label>Fokus</label><textarea id="s30focus">${E(c.focus)}</textarea></div></div>
 <div class="s30card"><div class="s30field"><label>Kobl træninger (Ctrl/Cmd for flere)</label><select id="s30sessions" multiple size="5">${selectOptions(sessions,c.sessionIds.map(String),x=>`${fmt(x.date)} · ${x.title||x.theme||"Træning"}`)}</select></div><div class="s30field"><label>Kobl kampe</label><select id="s30matches" multiple size="5">${selectOptions(matches,c.matchIds.map(String),x=>`${fmt(x.date)} · ${x.opponent||x.title||"Kamp"}`)}</select></div><div class="s30field"><label>Kobl videoklip</label><select id="s30clips" multiple size="5">${cs.map(x=>`<option value="${E(x.id)}" ${c.videoRefs.includes(x.id)?"selected":""}>${E(x.title)}</option>`).join("")}</select></div></div>
 <div class="s30card"><div class="s30field"><label>Evaluering – hvad så vi?</label><textarea id="s30eval">${E(c.evaluation)}</textarea></div><div class="s30field"><label>Næste fokus</label><textarea id="s30next">${E(c.nextFocus)}</textarea></div></div>
 <div class="s30card"><div class="s13title">STATUS</div><div class="s13mut" style="margin-top:6px">Afslut først forløbet når evaluering og næste fokus er klar.</div><div class="s30bar" style="margin-top:12px"><button id="s30done" class="s13btn">${c.status==="done"?"GENÅBN":"MARKÉR AFSLUTTET"}</button><button id="s30delete" class="s13btn">SLET</button></div></div></div>`;
 const sync=()=>{c.title=t.querySelector("#s30title").value.trim()||"Udviklingsforløb";c.scope=t.querySelector("#s30scope").value;c.playerId=t.querySelector("#s30player").value;c.observation=t.querySelector("#s30obs").value.trim();c.focus=t.querySelector("#s30focus").value.trim();c.sessionIds=[...t.querySelector("#s30sessions").selectedOptions].map(o=>o.value);c.matchIds=[...t.querySelector("#s30matches").selectedOptions].map(o=>o.value);c.videoRefs=[...t.querySelector("#s30clips").selectedOptions].map(o=>o.value);c.evaluation=t.querySelector("#s30eval").value.trim();c.nextFocus=t.querySelector("#s30next").value.trim();c.updatedAt=new Date().toISOString()};
 t.querySelector("#s30back").onclick=()=>{activeCycle=null;renderCycle(t)};
 t.querySelector("#s30save").onclick=()=>{sync();save();visNotification?.("Development Cycle gemt.");renderCycle(t)};
 t.querySelector("#s30done").onclick=()=>{sync();c.status=c.status==="done"?"active":"done";save();renderCycle(t)};
 t.querySelector("#s30delete").onclick=()=>{if(confirm("Slet udviklingsforløbet?")){D().developmentCycles=D().developmentCycles.filter(x=>x.id!==c.id);activeCycle=null;save();renderCycle(t)}};
 t.querySelector("#s30report").onclick=()=>{sync();openBrief("development",c)};
}

function overlay(){let o=document.getElementById("s30overlay");if(!o){o=document.createElement("div");o.id="s30overlay";document.body.appendChild(o);o.onclick=e=>{if(e.target===o)o.classList.remove("open")}}return o}
function nextMatch(){
 try{if(typeof s20NextMatch==="function")return s20NextMatch()}catch{}
 try{return typeof start11CalendarAllMatches==="function"?start11CalendarAllMatches().find(x=>String(x.date||"")>=new Date().toISOString().slice(0,10)):null}catch{return null}
}
function nextSession(){return [...(D().sessions||[])].filter(x=>String(x.date||"")>=new Date().toISOString().slice(0,10)).sort((a,b)=>String(a.date).localeCompare(String(b.date)))[0]||[...(D().sessions||[])].sort((a,b)=>String(b.date).localeCompare(String(a.date)))[0]}
function opponent(m){try{return typeof s20Opponent==="function"?s20Opponent(m):(m?.opponent||m?.away||m?.home||"Modstander")}catch{return m?.opponent||"Modstander"}}
function bullets(v){return String(v||"").split(/\n|•|;/).map(x=>x.trim()).filter(Boolean)}
function selectedValues(o,names){const out={};names.forEach(n=>out[n]=o.querySelector(`[name="${n}"]`)?.checked!==false);return out}

function buildPreview(type,obj,flags){
 const M=meta(),d=D();
 if(type==="training"){
  const s=obj||nextSession();if(!s)return`<h1>Træningsbrief</h1><p>Ingen træning fundet.</p>`;
  const blocks=s.blocks||[];
  return `<h1>TRÆNINGSBRIEF</h1><div class="muted">${E(M.clubName)} · ${E(M.teamName)} · ${E(fmt(s.date))}</div><div class="box"><h2>${E(s.title||s.theme||"Træning")}</h2>${s.theme?`<b>Tema:</b> ${E(s.theme)}`:""}</div>${flags.plan?`<div class="box"><h3>PLAN</h3>${blocks.length?blocks.map(b=>`<p><b>${E(b.duration||0)} min · ${E(b.title||b.name||"Blok")}</b>${b.note||b.description?`<br>${E(b.note||b.description)}`:""}</p>`).join(""):"<p>Ingen blokke oprettet.</p>"}</div>`:""}${flags.notes&&s.note?`<div class="box"><h3>COACHING / NOTER</h3><p>${E(s.note).replace(/\n/g,"<br>")}</p></div>`:""}`;
 }
 if(type==="development"){
  const c=obj;return `<h1>UDVIKLINGSRAPPORT</h1><div class="muted">${E(M.clubName)} · ${E(M.teamName)} · ${E(playerName(c))}</div><div class="box"><h2>${E(c.title)}</h2><b>Fokus:</b> ${E(c.focus||"—")}</div>${flags.observation?`<div class="box"><h3>OBSERVATION</h3><p>${E(c.observation||"—")}</p></div>`:""}${flags.evaluation?`<div class="box"><h3>EVALUERING</h3><p>${E(c.evaluation||"—")}</p></div>`:""}${flags.next?`<div class="box"><h3>NÆSTE FOKUS</h3><p>${E(c.nextFocus||"—")}</p></div>`:""}`;
 }
 const m=obj||nextMatch(),opp=opponent(m),lineup=m&&typeof s19MatchLineupRecord==="function"?s19MatchLineupRecord(typeof s19MatchKey==="function"?s19MatchKey(m):m.id):null;
 const scout=(d.opponentProfiles||[]).find(x=>String(x.name||"").toLowerCase()===String(opp||"").toLowerCase());
 const principles=(d.principles||[]).slice(0,5);
 return `<h1>KAMPBRIEF</h1><div class="muted">${E(M.clubName)} · ${E(M.teamName)}</div><div class="box"><h2>${E(opp||"Modstander")}</h2><p>${E(fmt(m?.date))}${m?.time?` · ${E(m.time)}`:""}${m?.place||m?.venue?` · ${E(m.place||m.venue)}`:""}</p></div>${flags.principles?`<div class="box"><h3>VORES PRINCIPPER</h3>${principles.length?`<ul>${principles.map(p=>`<li><b>${E(p.title||p.name||"Princip")}</b>${p.coachingPoints?` – ${E(p.coachingPoints)}`:""}</li>`).join("")}</ul>`:"<p>Ingen principper valgt.</p>"}</div>`:""}${flags.lineup?`<div class="box"><h3>START11</h3><p>${lineup?`Formation: <b>${E(lineup.formation||"—")}</b>`:"Ingen gemt kampopstilling endnu."}</p></div>`:""}${flags.scouting&&scout?`<div class="box"><h3>MODSTANDER</h3><p>${E(scout.notes||scout.note||scout.strengths||"Scoutingprofil er oprettet.")}</p></div>`:""}`;
}

function openBrief(type="match",obj=null){
 styles();const o=overlay();const isDev=type==="development";
 const defs=type==="training"?[["plan","Træningsplan"],["notes","Coaching/noter"]]:isDev?[["observation","Observation"],["evaluation","Evaluering"],["next","Næste fokus"]]:[["principles","Principper"],["lineup","Startopstilling"],["scouting","Modstander/scouting"]];
 o.innerHTML=`<div class="s30modal"><div class="s13head"><div><strong>BRIEF STUDIO</strong><div class="s13mut">Preview før eksport. Interne noter deles kun, hvis du aktivt vælger dem.</div></div><button id="s30close" class="s13btn">LUK</button></div><div class="s30bar">${defs.map(([n,l])=>`<label class="s13btn"><input type="checkbox" name="${n}" checked> ${l}</label>`).join("")}<button id="s30print" class="s13btn primary">PDF / PRINT</button></div><div id="s30preview" class="s30preview"></div></div>`;
 o.classList.add("open");const names=defs.map(x=>x[0]),render=()=>o.querySelector("#s30preview").innerHTML=buildPreview(type,obj,selectedValues(o,names));render();
 o.querySelectorAll('input[type="checkbox"]').forEach(x=>x.onchange=render);
 o.querySelector("#s30close").onclick=()=>o.classList.remove("open");
 o.querySelector("#s30print").onclick=()=>{
  const preview=o.querySelector("#s30preview");
  if(!preview)return;
  const frame=document.createElement("iframe");
  frame.setAttribute("aria-hidden","true");
  frame.style.cssText="position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
  document.body.appendChild(frame);
  const doc=frame.contentDocument||frame.contentWindow?.document;
  if(!doc){frame.remove();return;}
  doc.open();
  doc.write(`<!doctype html><html><head><meta charset="utf-8"><title>START11 rapport</title><style>
    @page{size:A4;margin:14mm}*{box-sizing:border-box}body{margin:0;color:#111;background:#fff;font-family:Arial,sans-serif;font-size:12px;line-height:1.45}h1{font-size:27px;margin:0 0 6px}h2{font-size:20px;margin:0 0 7px}h3{font-size:15px;margin:0 0 8px}.muted{color:#666;font-size:11px;margin-bottom:10px}.box{border:1px solid #d9d9d9;border-radius:8px;padding:12px;margin:10px 0;break-inside:avoid;page-break-inside:avoid}ul{padding-left:18px}p{margin:7px 0}
  </style></head><body>${preview.innerHTML}</body></html>`);
  doc.close();
  const run=()=>{
    try{frame.contentWindow.focus();frame.contentWindow.print();}
    finally{setTimeout(()=>frame.remove(),1500)}
  };
  if(frame.contentWindow?.document?.readyState==="complete")setTimeout(run,120);
  else frame.onload=()=>setTimeout(run,120);
 };
}
window.start11OpenBriefStudio=openBrief;

function installHub(){
 if(typeof s13Render!=="function"||s13Render.__v30)return false;
 const old=s13Render;
 const wrapped=function(...a){const r=old.apply(this,a);setTimeout(()=>{
  const tabs=document.getElementById("s13tabs");if(tabs&&!tabs.querySelector('[data-t="cycle"]')){const b=document.createElement("button");b.className=`s13tab ${s13Tab==="cycle"?"active":""}`;b.dataset.t="cycle";b.textContent="DEVELOPMENT CYCLE";b.onclick=()=>{s13Tab="cycle";s13Render()};tabs.appendChild(b)}
  const top=document.getElementById("s13top");if(top&&!document.getElementById("s30brief")){const holder=top.lastElementChild||top;const b=document.createElement("button");b.id="s30brief";b.className="s13btn";b.textContent="DEL / EKSPORT";b.onclick=()=>openBrief("match");holder.insertBefore(b,holder.lastElementChild)}
  if(s13Tab==="cycle"){const t=document.getElementById("s13content");if(t)renderCycle(t)}
 },0);return r};
 wrapped.__v30=true;s13Render=wrapped;return true;
}
function init(){ensure();styles();if(!installHub())setTimeout(init,500)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(init,4500));else setTimeout(init,4500);
console.info("START11 loaded:",window.START11_BUILD);
})();

/* =========================================================
   START11 V35 – MOCKUP SHELL + ORIGINAL INTERACTIVE LINEUP
========================================================= */
(function start11V35(){
  "use strict";
  if(window.__START11_V35__)return; window.__START11_V35__=true;
  window.START11_BUILD="V35-NATIVE-INTERACTIVE-LINEUP";
  const $=id=>document.getElementById(id), esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  let nativeCenterOrigin=null,nativeSquadOrigin=null,coachingReturn=false,currentView="home";
  const getPlayers=()=>{try{if(typeof start11FullSquad!=="undefined"&&Array.isArray(start11FullSquad))return start11FullSquad;if(typeof spillere!=="undefined"&&Array.isArray(spillere))return spillere}catch(_){}return[]};
  const getData=()=>{try{return typeof s13Data!=="undefined"&&s13Data?s13Data:{}}catch(_){return{}}};
  const teamName=()=>{try{const m=typeof start11V8GetActiveMeta==="function"?start11V8GetActiveMeta():null;return m?.teamName||m?.clubName||$("accountDisplayName")?.textContent||"FC THY U14"}catch(_){return"FC THY U14"}};
  function setText(id,v){const e=$(id);if(e)e.textContent=v??"—"}
  function moveNode(node,host,key){if(!node||!host||node.parentNode===host)return key;if(!key)key={parent:node.parentNode,next:node.nextSibling};host.appendChild(node);return key}
  function restoreNode(key,selector){if(!key)return null;const node=document.querySelector(selector);if(node&&key.parent){key.parent.insertBefore(node,key.next&&key.next.parentNode===key.parent?key.next:null)}return null}
  function restoreNative(){nativeCenterOrigin=restoreNode(nativeCenterOrigin,'.start11-center-column');nativeSquadOrigin=restoreNode(nativeSquadOrigin,'.start11-right-column')}
  function activate(view="home"){
    if(view!=="lineup")restoreNative(); currentView=view; document.body.classList.add("s34-active");
    $("s34HomeView").hidden=view!=="home"; $("s34LineupView").hidden=view!=="lineup";
    document.querySelectorAll("[data-s34]").forEach(x=>x.classList.toggle("active",x.dataset.s34===view));
    if(view==="home")refreshHome(); if(view==="lineup")openNativeLineup(); window.scrollTo(0,0);
  }
  function leave(){restoreNative();document.body.classList.remove("s34-active")}
  function native(target){leave();const b=document.querySelector(`.start11-nav-item[data-start11-target="${target}"]`);b?.click()}
  function openCoach(tab){coachingReturn=true;leave();if(typeof s13Open==="function"){s13Open();if(tab&&typeof s13Tab!=="undefined")s13Tab=tab;if(typeof s13Render==="function")s13Render()}}
  function installCoachReturn(){if(typeof s13Close!=="function"||s13Close.__v35)return;const old=s13Close;s13Close=function(...a){const r=old.apply(this,a);if(coachingReturn){coachingReturn=false;activate("home")}return r};s13Close.__v35=true}
  function openCalendar(){leave();const b=$("s15CalendarNav")||[...document.querySelectorAll("button")].find(x=>/KALENDER/i.test(x.textContent||""));b?.click()}
  function logos(){const h=$("dashboardHomeLogo")?.src||"",a=$("dashboardAwayLogo")?.src||"";[["s34HomeLogo",h],["s34AwayLogo",a],["s34LineHomeLogo",h],["s34LineAwayLogo",a]].forEach(([id,src])=>{const e=$(id);if(e){if(src)e.src=src;else e.removeAttribute("src")}})}
  function refreshHome(){const tn=teamName();["s34SideTeam","s34TopTeam","s34ProfileTeam"].forEach(id=>setText(id,tn));setText("s34HomeTeam",$("dashboardHomeTeam")?.textContent?.trim()||"—");setText("s34AwayTeam",$("dashboardAwayTeam")?.textContent?.trim()||"—");const d=$("dashboardMatchDate")?.textContent?.trim()||"",t=$("dashboardMatchTime")?.textContent?.trim()||"";setText("s34MatchDate",[d,t].filter(Boolean).join(" · ")||"—");setText("s34MatchPlace",$("dashboardMatchPlace")?.textContent?.trim()||"—");logos();setText("s34Formation",$("formationSelector")?.selectedOptions?.[0]?.textContent||"—");const ps=getPlayers(),rendered=parseInt($("fullSquadCount")?.textContent||"0",10)||0,total=ps.length||rendered;setText("s34PlayerCount",total);const limited=ps.filter(p=>/skade|begrænset|ukendt|fravær|ikke/i.test(String(p?.status||""))).length;setText("s34Available",ps.length?Math.max(0,total-limited):total);setText("s34Limited",limited);refreshTraining();refreshFocus();refreshLeague();refreshActivities();refreshPreview()}
  function refreshTraining(){const d=getData();let ss=Array.isArray(d.sessions)?d.sessions.slice():[];const today=new Date().toISOString().slice(0,10);ss=ss.filter(x=>String(x.date||x.sessionDate||"")>=today).sort((a,b)=>String(a.date||a.sessionDate||"").localeCompare(String(b.date||b.sessionDate||"")));const x=ss[0];if(!x){setText("s34TrainingDate","Ingen planlagt træning");setText("s34TrainingTitle","—");$("s34TrainingMeta").innerHTML="";return}setText("s34TrainingDate",[x.date||x.sessionDate,x.time].filter(Boolean).join(" · "));setText("s34TrainingTitle",x.title||x.theme||x.name||"Træning");let items=[];if(Array.isArray(x.blocks))items=x.blocks.slice(0,3).map(b=>b.title||b.name).filter(Boolean);if(!items.length)items=[x.focus,x.note].filter(Boolean).slice(0,3);$("s34TrainingMeta").innerHTML=items.map(v=>`<span>${esc(v)}</span>`).join("")}
  function refreshFocus(){const h=$("s34FocusList");if(!h)return;let p=(getData().principles||[]).slice(0,3);h.innerHTML=p.length?p.map((x,i)=>`<div class="s34-focus-item"><i>${i+1}</i><div><strong>${esc(x.title||x.name||x.principle||"Princip")}</strong><small>${esc(x.coachingPoints||x.description||x.note||"")}</small></div></div>`).join(""):`<div style="color:#8e9992;font-size:11px">Tilføj principper i Coaching Hub.</div>`}
  function s43LeagueData(){try{const d=JSON.parse(localStorage.getItem("start11DbuLeague")||"{}");return d&&typeof d==="object"?d:{}}catch(_){return {}}}
  function s43Logo(team,league){const key=String(team||"").trim().toLowerCase();if(!key)return "";const pool=[...(Array.isArray(league?.teams)?league.teams:[]),...(Array.isArray(league?.standings)?league.standings:[])];const exact=pool.find(x=>String(x?.name||x?.team||"").trim().toLowerCase()===key);if(exact?.logo)return exact.logo;const loose=pool.find(x=>{const n=String(x?.name||x?.team||"").trim().toLowerCase();return n&&(n.includes(key)||key.includes(n))});return loose?.logo||""}
  function refreshLeague(){const h=$("s43LeagueTable");if(!h)return;const league=s43LeagueData(),rows=Array.isArray(league?.standings)?league.standings:[],title=$("s43LeagueName");if(title)title.textContent=league?.name||"DBU";if(!rows.length){h.innerHTML=`<div class="s43-league-empty">Synkronisér DBU under Mine hold for at hente tabellen.</div>`;return}const own=teamName().trim().toLowerCase();h.innerHTML=`<div class="s43-league-head"><span>#</span><span>Hold</span><span>K</span><span>M</span><span>P</span></div>`+rows.map((r,i)=>{const n=String(r.team||r.name||r.teamName||"—"),norm=n.trim().toLowerCase(),mine=own&&(norm===own||norm.includes(own)||own.includes(norm)),logo=r.logo||s43Logo(n,league),pos=r.position??r.pos??r.rank??r.place??(i+1),played=r.played??r.matches??r.games??r.kampe??"—",goals=r.goals??r.goalDifference??r.score??r.maal??"",pts=r.points??r.pts??r.point??"—";return `<div class="s43-league-row${mine?" is-own":""}"><span>${esc(pos)}</span><span class="s43-league-club">${logo?`<img src="${esc(logo)}" alt="">`:`<i>${esc(n.slice(0,1))}</i>`}<strong>${esc(n)}</strong></span><span>${esc(played)}</span><span>${esc(goals)}</span><b>${esc(pts)}</b></div>`}).join("")}
  function refreshActivities(){const h=$("s34Activities");if(!h)return;let ms=[];try{if(typeof start11CalendarAllMatches==="function")ms=start11CalendarAllMatches()||[]}catch(_){}const today=new Date().toISOString().slice(0,10),league=s43LeagueData(),own=teamName().trim().toLowerCase();ms=ms.filter(m=>String(m.date||m.matchDate||"")>=today).slice(0,4);h.innerHTML=ms.map(m=>{const raw=String(m.date||m.matchDate||""),ds=raw.match(/^\d{4}-(\d\d)-(\d\d)$/),date=ds?`${ds[2]}. ${["","jan.","feb.","mar.","apr.","maj","jun.","jul.","aug.","sep.","okt.","nov.","dec."][+ds[1]]}`:raw,home=String(m.home||m.homeTeam||""),away=String(m.away||m.awayTeam||""),hn=home.toLowerCase(),isHome=own?(hn===own||hn.includes(own)||own.includes(hn)):hn.includes("thy"),opp=isHome?away:home,logo=(isHome?m.awayLogo:m.homeLogo)||s43Logo(opp,league);return `<div class="s34-activity s43-activity"><time>${esc(date)}</time><span class="s43-activity-logo">${logo?`<img src="${esc(logo)}" alt="">`:`<i>${esc(opp.slice(0,1)||"•")}</i>`}</span><strong>${esc(opp)} (${isHome?"H":"U"})</strong><span>${esc(m.time||m.matchTime||"")}</span></div>`}).join("")||`<div style="padding:30px 0;color:#8e9992;font-size:11px">Ingen kommende aktiviteter.</div>`}
  function refreshPreview(){const h=$("s34PitchPreview"),p=$("pitch");if(!h||!p||currentView==="lineup")return;const c=p.cloneNode(true);c.removeAttribute("id");c.querySelectorAll("[id]").forEach(x=>x.removeAttribute("id"));c.style.pointerEvents="none";h.replaceChildren(c)}
  function openNativeLineup(){setText("s34LineHome",$("dashboardHomeTeam")?.textContent?.trim()||"—");setText("s34LineAway",$("dashboardAwayTeam")?.textContent?.trim()||"—");setText("s34LineDate",$("dashboardMatchDate")?.textContent?.trim()||"—");setText("s34LineTime",$("dashboardMatchTime")?.textContent?.trim()||"—");setText("s34LinePlace",$("dashboardMatchPlace")?.textContent?.trim()||"—");logos();nativeCenterOrigin=moveNode(document.querySelector('.start11-center-column'),$("s35NativeCenterHost"),nativeCenterOrigin);nativeSquadOrigin=moveNode(document.querySelector('.start11-right-column'),$("s35NativeSquadHost"),nativeSquadOrigin)}
  function bind(){
    document.querySelectorAll("[data-s34]").forEach(b=>b.addEventListener("click",()=>{const a=b.dataset.s34;if(a==="home")activate("home");else if(a==="matches")openCalendar();else if(a==="training")openCoach("training");else if(a==="players")native("squadSection");else if(a==="analysis")openCoach("matches");else if(a==="video")openCoach("videos");else if(a==="share"){if(typeof start11OpenBriefStudio==="function")start11OpenBriefStudio("match");else openCoach()}else if(a==="settings")$("accountMenuButton")?.click()}));
    $("s34Search")?.addEventListener("click",()=>typeof start11CommandPalette==="function"&&start11CommandPalette());
    $("s34OpenMatch")?.addEventListener("click",()=>activate("lineup")); $("s34PitchPreview")?.addEventListener("click",()=>activate("lineup"));
    $("s34OpenTraining")?.addEventListener("click",()=>openCoach("training")); $("s34OpenSquad")?.addEventListener("click",()=>native("squadSection")); $("s34OpenCoaching")?.addEventListener("click",()=>openCoach("principles")); $("s34OpenCalendar")?.addEventListener("click",openCalendar);
    $("s34BackMatches")?.addEventListener("click",()=>activate("home")); $("s34TeamSwitch")?.addEventListener("click",()=>{leave();$("myTeamsMenuButton")?.click()}); $("s34ProfileButton")?.addEventListener("click",()=>{leave();$("accountMenuButton")?.click()});
    $("s34ResetLineup")?.addEventListener("click",()=>{const b=[...document.querySelectorAll("button")].find(x=>/NULSTIL/i.test(x.textContent||""));b?.click()}); $("s34SaveLineup")?.addEventListener("click",()=>$("saveButton")?.click()); $("s34ShareLineup")?.addEventListener("click",()=>typeof start11OpenBriefStudio==="function"&&start11OpenBriefStudio("match"));
    $("s35OpenTactics")?.addEventListener("click",()=>native("tacticsSection")); $("s35OpenNotes")?.addEventListener("click",()=>openCoach("matches"));
    // Old top navigation can no longer expose a second lineup UI: route it into V35.
    document.querySelectorAll('.start11-nav-item[data-start11-target="lineupSection"]').forEach(b=>b.addEventListener("click",e=>{if(!document.body.classList.contains("s34-active")){e.preventDefault();e.stopImmediatePropagation();activate("lineup")}},true));
  }
  function boot(){if(!$("s34App"))return;installCoachReturn();bind();activate("home");setInterval(()=>{if(document.body.classList.contains("s34-active")&&currentView==="home")refreshHome()},2500)}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
