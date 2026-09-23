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

  function boot(){injectStyles();installSaveFeedback();installDragFeedback();palette();tacticalTemplates();dashboardBriefing();installPlayerTimelineButton();const h=location.hash.match(/start11-share=([^&]+)/);if(h){const p=decodeShare(h[1]);if(p)setTimeout(()=>renderShared(p),200)}}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();

