/* =========================================================
   START11 – V20 COACH OPERATING SYSTEM
   Dashboard · Live Match Centre · Post-match review
   Principbibliotek · Sæsonplan · Træningsstatistik
   Spillerudvikling 2.0 · Spillersamtaler
   Smart øvelsesbank · Modstanderscouting · Coach Intelligence
========================================================= */

function s20EnsureData(){
  if(!s13Data||typeof s13Data!=="object")s13Data={};
  ["liveMatches","opponentProfiles","seasonPlan","trainingEvaluations","intelligenceNotes"].forEach(k=>{
    if(!Array.isArray(s13Data[k]))s13Data[k]=[];
  });
  if(!Array.isArray(s13Data.principles))s13Data.principles=[];
  if(!Array.isArray(s13Data.exercises))s13Data.exercises=[];
  s13Data.principles.forEach(p=>{
    p.coachingPoints=String(p.coachingPoints||"");
    p.triggers=String(p.triggers||"");
    p.tags=String(p.tags||"");
    p.exerciseIds=Array.isArray(p.exerciseIds)?p.exerciseIds:[];
    p.videoClipIds=Array.isArray(p.videoClipIds)?p.videoClipIds:[];
  });
  s13Data.exercises.forEach(e=>{
    e.tags=String(e.tags||"");
    e.intensity=e.intensity||"Mellem";
    e.ageLevel=String(e.ageLevel||"");
    e.playerMin=Number(e.playerMin||0);
    e.playerMax=Number(e.playerMax||0);
  });
}
if(typeof s13Norm==="function"){
  const _s20norm=s13Norm;
  s13Norm=function(raw={}){
    const d=_s20norm(raw);
    d.liveMatches=Array.isArray(raw.liveMatches)?raw.liveMatches:[];
    d.opponentProfiles=Array.isArray(raw.opponentProfiles)?raw.opponentProfiles:[];
    d.seasonPlan=Array.isArray(raw.seasonPlan)?raw.seasonPlan:[];
    d.trainingEvaluations=Array.isArray(raw.trainingEvaluations)?raw.trainingEvaluations:[];
    d.intelligenceNotes=Array.isArray(raw.intelligenceNotes)?raw.intelligenceNotes:[];
    return d;
  };
}

const s20State={
  liveId:null,scoutingId:null,seasonId:null,developmentPlayerId:null,
  developmentAttribute:"",liveTicker:null,
  exerciseFilter:{search:"",theme:"",intensity:"",players:"",tags:""}
};

function s20InstallStyles(){
  if(document.getElementById("s20styles"))return;
  const s=document.createElement("style");s.id="s20styles";s.textContent=`
  .s20dash{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
  .s20card,.s20metric,.s20insight{padding:12px;border:1px solid rgba(255,255,255,.075);border-radius:8px;background:#071009}
  .s20label{color:#78847c;font-size:7px;font-weight:950;text-transform:uppercase;letter-spacing:.4px}
  .s20value{margin-top:5px;color:#fff;font-size:20px;font-weight:1000}.s20value.accent{color:var(--s11-primary)}
  .s20metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
  .s20metric span{display:block;color:#78847c;font-size:7px;font-weight:900}.s20metric strong{display:block;margin-top:4px;color:var(--s11-primary);font-size:17px}
  .s20progress{height:7px;border-radius:999px;background:rgba(255,255,255,.07);overflow:hidden}.s20progress span{display:block;height:100%;background:linear-gradient(90deg,var(--s11-primary),var(--s11-secondary))}
  .s20dist{display:grid;grid-template-columns:120px minmax(0,1fr) 50px;gap:8px;align-items:center;font-size:7px}
  .s20insight{border-left:3px solid var(--s11-primary)}.s20insight.high{border-left-color:#ff6868}.s20insight.medium{border-left-color:#f0c45e}
  .s20insight strong{font-size:9px}.s20insight p{margin:5px 0 0;color:#99a59c;font-size:8px;line-height:1.5}
  .s20flow{display:flex;gap:5px;overflow:auto}.s20step{min-width:145px;padding:10px;border:1px solid rgba(255,255,255,.07);border-radius:7px;background:#08100a}
  .s20arrow{display:grid;place-items:center;color:var(--s11-primary);font-weight:1000}
  .s20live{display:grid;grid-template-columns:1fr auto 1fr;gap:14px;align-items:center;text-align:center;padding:20px;border:1px solid rgba(255,255,255,.08);border-radius:10px;background:#061008}
  .s20team{font-size:17px;font-weight:1000}.s20score{font-size:38px;font-weight:1000;color:var(--s11-primary);font-variant-numeric:tabular-nums}.s20clock{font-size:10px;color:#98a39a}
  .s20event{display:grid;grid-template-columns:48px 90px minmax(0,1fr) auto;gap:8px;align-items:center;padding:8px;border:1px solid rgba(255,255,255,.06);border-radius:6px;background:#071009}
  .s20season{display:grid;grid-template-columns:110px minmax(0,1fr) 80px auto;gap:9px;align-items:center;padding:10px;border:1px solid rgba(255,255,255,.07);border-radius:7px;background:#071009}
  .s20filters{display:grid;grid-template-columns:1.5fr repeat(4,minmax(100px,1fr));gap:7px}
  .s20checklist{max-height:180px;overflow:auto;padding:7px;border:1px solid rgba(255,255,255,.07);border-radius:6px;background:#050905}
  .s20check{display:flex;align-items:center;gap:7px;min-height:27px;color:#aab5ac;font-size:7px}
  .s20chart{height:240px;border:1px solid rgba(255,255,255,.06);border-radius:7px;background:#050905;overflow:hidden}.s20chart svg{width:100%;height:100%}
  @media(max-width:1100px){.s20dash{grid-template-columns:repeat(2,minmax(0,1fr))}.s20filters{grid-template-columns:1fr}}
  @media(max-width:700px){.s20dash,.s20metrics{grid-template-columns:1fr}.s20live,.s20event,.s20season{grid-template-columns:1fr}}
  `;document.head.appendChild(s);
}

function s20UpcomingMatches(){
  if(typeof start11CalendarAllMatches!=="function")return[];
  return start11CalendarAllMatches().map(m=>typeof start11CalendarNormalizeMatch==="function"?start11CalendarNormalizeMatch(m):m)
    .filter(m=>String(m.date||"")>=s13Today())
    .sort((a,b)=>String(a.date||"").localeCompare(String(b.date||""))||String(a.time||"").localeCompare(String(b.time||"")));
}
const s20NextMatch=()=>s20UpcomingMatches()[0]||null;
function s20Opponent(m){
  if(!m)return"";
  if(typeof start11CalendarOpponent==="function")return start11CalendarOpponent(m);
  return m.away||m.home||"";
}
const s20SessionMinutes=s=>(s?.blocks||[]).reduce((n,b)=>n+Number(b.duration||0),0);
const s20AllClips=()=>Array.isArray(s13Data.videoProjects)?s13Data.videoProjects.flatMap(p=>(p.clips||[]).map(c=>({...c,projectId:p.id,projectTitle:p.title||"Video"}))):[];
const s20SessionEval=id=>s13Data.trainingEvaluations.find(x=>x.sessionId===id)||null;

function s20LineChart(points){
  if(!points.length)return`<div style="height:100%;display:grid;place-items:center;color:#748078;font-size:8px">Ingen historik endnu.</div>`;
  const W=760,H=240,P=34, sx=i=>points.length===1?W/2:P+i*(W-2*P)/(points.length-1), sy=v=>H-P-(Number(v||0)/100)*(H-2*P);
  const path=points.map((p,i)=>(i?"L":"M")+sx(i)+","+sy(p.value)).join(" ");
  return`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
    <line x1="${P}" y1="${H-P}" x2="${W-P}" y2="${H-P}" stroke="rgba(255,255,255,.1)"/>
    <path d="${path}" fill="none" stroke="var(--s11-primary)" stroke-width="4" stroke-linecap="round"/>
    ${points.map((p,i)=>`<circle cx="${sx(i)}" cy="${sy(p.value)}" r="4" fill="var(--s11-primary)"/>
      <text x="${sx(i)}" y="${sy(p.value)-9}" text-anchor="middle" fill="#fff" font-size="11">${Math.round(p.value)}</text>
      <text x="${sx(i)}" y="${H-9}" text-anchor="middle" fill="#77837b" font-size="9">${s13Esc(p.label||"")}</text>`).join("")}
  </svg>`;
}

/* =========================================================
   COACHING HUB NAV
========================================================= */
s13Render=function(){
  const meta=s13Meta(),top=document.getElementById("s13top"),tabs=document.getElementById("s13tabs");
  if(top)top.innerHTML=`<div><h2>COACHING HUB</h2><div class="s13mut">${s13Esc(meta.clubName)} · ${s13Esc(meta.teamName)} · coach operating system</div></div>
  <div><button id="s13quick" class="s13btn primary">+ TRÆNING</button> <button id="s20quicklive" class="s13btn">LIVE KAMP</button> <button id="s13close" class="s13btn">LUK</button></div>`;
  document.getElementById("s13close")?.addEventListener("click",s13Close);
  document.getElementById("s13quick")?.addEventListener("click",()=>{s13Tab="training";s13Session=null;s13Render();setTimeout(s13EditSession,0)});
  document.getElementById("s20quicklive")?.addEventListener("click",()=>{s13Tab="live";s13Render()});
  const list=[["dashboard","DASHBOARD"],["training","TRÆNING"],["exercises","ØVELSESBANK"],["attendance","FREMMØDE"],["principles","PRINCIPPER"],["live","LIVE KAMP"],["matches","KAMPANALYSE"],["season","SÆSONPLAN"],["scouting","SCOUTING"],["matrix","UDVIKLING"],["videos","VIDEO"],["meetings","SAMTALER"],["intelligence","INTELLIGENCE"]];
  if(tabs){tabs.innerHTML=list.map(([id,l])=>`<button class="s13tab ${s13Tab===id?"active":""}" data-t="${id}">${l}</button>`).join("");tabs.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{s13Tab=b.dataset.t;s13Render()})}
  s13RenderContent();s13Home();
};
s13RenderContent=function(){
  const t=document.getElementById("s13content");if(!t)return;
  const map={dashboard:s20Dashboard,training:s13Training,exercises:s13Exercises,attendance:s13Attendance,principles:s20Principles,live:s20Live,matches:s13Matches,season:s20Season,scouting:s20Scouting,matrix:s20Development,videos:s13Videos,meetings:s20Meetings,intelligence:s20Intelligence};
  (map[s13Tab]||s20Dashboard)(t);
};

/* =========================================================
   DASHBOARD
========================================================= */
function s20Dashboard(t){
  s20EnsureData();
  const nm=s20NextMatch(),opp=s20Opponent(nm),ns=s13NextSession(),stale=s13NeedEval(),clips=s20AllClips();
  const scout=s13Data.opponentProfiles.find(x=>String(x.name||"").toLowerCase()===String(opp).toLowerCase());
  const lineup=nm&&typeof s19MatchLineupRecord==="function"?s19MatchLineupRecord(s19MatchKey(nm)):null;
  const insights=s20Insights().slice(0,4);
  t.innerHTML=`<div class="s20dash">
    ${[["NÆSTE KAMP",opp||"Ingen kamp",nm?.date?s13Date(nm.date):"—"],["NÆSTE TRÆNING",ns?.title||"Ikke planlagt",ns?`${s13Date(ns.date)} · ${s20SessionMinutes(ns)} min`:"—"],["EVALUERING MANGLER",stale.length,"spillerprofiler"],["VIDEOCLIPS",clips.length,"analyserede klip"]].map(([l,v,s])=>`<div class="s20card"><div class="s20label">${l}</div><div class="s20value">${s13Esc(v)}</div><div class="s13mut">${s13Esc(s)}</div></div>`).join("")}
  </div>
  <div class="s13grid" style="margin-top:12px">
    <section class="s13panel"><div class="s13head"><div><strong>NÆSTE KAMPFORBEREDELSE</strong><div class="s13mut">START11, scouting og video samlet.</div></div></div>
      ${nm?`<div class="s13item"><div class="s13title">${s13Esc(opp)} · ${s13Date(nm.date)}</div><div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:7px">
        <span class="s13badge">${lineup?`XI ${s13Esc(lineup.formation||"—")}`:"XI MANGLER"}</span><span class="s13badge">${scout?"SCOUTING KLAR":"SCOUTING MANGLER"}</span><span class="s13badge">${clips.filter(c=>String(c.projectTitle||"").toLowerCase().includes(String(opp).toLowerCase())).length} CLIPS</span>
      </div><button id="s20dashmatch" class="s13btn primary" style="margin-top:9px">ÅBN KAMPENS START11</button></div>`:`<div class="s13mut">Ingen kommende kamp.</div>`}
    </section>
    <section class="s13panel"><div class="s13head"><div><strong>COACH INTELLIGENCE</strong><div class="s13mut">Mønstre i dine START11-data.</div></div><button id="s20dashintel" class="s13btn">SE ALLE</button></div>
      <div class="s13stack">${insights.map(i=>`<div class="s20insight ${i.priority}"><strong>${s13Esc(i.title)}</strong><p>${s13Esc(i.body)}</p></div>`).join("")||`<div class="s13mut">Registrér mere data for at få indsigt.</div>`}</div>
    </section>
  </div>
  <section class="s13panel" style="margin-top:12px"><div class="s13head"><strong>START11 WORKFLOW</strong></div><div class="s20flow">
    ${["KALENDER","START11","SCOUTING","KAMPPLAN","LIVE","VIDEO","REVIEW","TRÆNING"].map((x,i,a)=>`<div class="s20step"><div class="s20label">${i+1}</div><div class="s13title">${x}</div></div>${i<a.length-1?`<div class="s20arrow">→</div>`:""}`).join("")}
  </div></section>`;
  document.getElementById("s20dashmatch")?.addEventListener("click",()=>{if(nm&&typeof s19EnterMatchMode==="function"){s13Close();s19EnterMatchMode(nm)}});
  document.getElementById("s20dashintel")?.addEventListener("click",()=>{s13Tab="intelligence";s13Render()});
}

/* =========================================================
   SMART EXERCISE BANK
========================================================= */
function s20ExerciseMatch(e){
  const f=s20State.exerciseFilter,h=[e.title,e.theme,e.description,e.focusPoint,e.coaching,e.tags].join(" ").toLowerCase();
  if(f.search&&!h.includes(f.search.toLowerCase()))return false;
  if(f.theme&&e.theme!==f.theme)return false;
  if(f.intensity&&e.intensity!==f.intensity)return false;
  if(f.tags&&!String(e.tags||"").toLowerCase().includes(f.tags.toLowerCase()))return false;
  if(f.players){const n=Number(f.players);if(e.playerMin&&n<e.playerMin)return false;if(e.playerMax&&n>e.playerMax)return false}
  return true;
}
function s20InjectExerciseTools(){
  if(s13Tab!=="exercises")return;s20EnsureData();
  const c=document.getElementById("s13content");if(!c)return;
  if(!document.getElementById("s20exfilters")){
    const first=c.querySelector(".s13panel");if(first){
      const sec=document.createElement("section");sec.id="s20exfilters";sec.className="s13panel";sec.style.marginBottom="10px";
      const themes=[...new Set(s13Data.exercises.map(e=>e.theme).filter(Boolean))].sort();
      sec.innerHTML=`<div class="s13head"><div><strong>SMART ØVELSESBANK</strong><div class="s13mut">Filtrér på tema, intensitet, antal spillere og tags.</div></div></div>
      <div class="s20filters"><input id="s20exq" class="s13in" placeholder="Søg..." value="${s13Esc(s20State.exerciseFilter.search)}">
      <select id="s20extheme" class="s13sel"><option value="">Alle temaer</option>${themes.map(x=>`<option ${s20State.exerciseFilter.theme===x?"selected":""}>${s13Esc(x)}</option>`).join("")}</select>
      <select id="s20exint" class="s13sel"><option value="">Alle intensiteter</option>${["Lav","Mellem","Høj","Meget høj"].map(x=>`<option ${s20State.exerciseFilter.intensity===x?"selected":""}>${x}</option>`).join("")}</select>
      <input id="s20explcount" class="s13in" type="number" min="1" placeholder="Spillere" value="${s13Esc(s20State.exerciseFilter.players)}">
      <input id="s20extags" class="s13in" placeholder="Tag" value="${s13Esc(s20State.exerciseFilter.tags)}"></div><div id="s20exresult" class="s13mut"></div>`;
      c.insertBefore(sec,first);
      const apply=()=>{
        s20State.exerciseFilter={search:document.getElementById("s20exq")?.value||"",theme:document.getElementById("s20extheme")?.value||"",intensity:document.getElementById("s20exint")?.value||"",players:document.getElementById("s20explcount")?.value||"",tags:document.getElementById("s20extags")?.value||""};
        let n=0;c.querySelectorAll("[data-edit-exercise]").forEach(b=>{const e=s13Data.exercises.find(x=>x.id===b.dataset.editExercise),card=b.closest(".s17-exercise-card");if(e&&card){const show=s20ExerciseMatch(e);card.style.display=show?"":"none";if(show)n++}});
        const r=document.getElementById("s20exresult");if(r)r.textContent=`${n} af ${s13Data.exercises.length} øvelser matcher.`;
      };
      ["s20exq","s20extheme","s20exint","s20explcount","s20extags"].forEach(id=>{const el=document.getElementById(id);el?.addEventListener(el.tagName==="SELECT"?"change":"input",apply)});apply();
    }
  }
  const e=typeof s19ExerciseForDesigner==="function"?s19ExerciseForDesigner():s13Data.exercises.find(x=>x.id===s13Exercise);
  if(e&&!document.getElementById("s20exmeta")){
    const anchor=document.querySelector(".s17-media-section")||document.getElementById("s17SaveExercise")?.parentElement;
    if(anchor?.parentElement){
      const sec=document.createElement("section");sec.id="s20exmeta";sec.className="s19-diagram-section";
      sec.innerHTML=`<div class="s13head"><div><strong>SMART METADATA</strong><div class="s13mut">Bruges i søgning og træningsstatistik.</div></div><button id="s20savexmeta" class="s13btn">GEM</button></div>
      <div class="s13grid"><label class="s13field">Intensitet<select id="s20exmetaint" class="s13sel">${["Lav","Mellem","Høj","Meget høj"].map(x=>`<option ${e.intensity===x?"selected":""}>${x}</option>`).join("")}</select></label>
      <label class="s13field">Alder/niveau<input id="s20exage" class="s13in" value="${s13Esc(e.ageLevel)}" placeholder="Fx U14 Liga 1"></label></div>
      <div class="s13grid"><label class="s13field">Min. spillere<input id="s20exmin" class="s13in" type="number" value="${e.playerMin||0}"></label><label class="s13field">Maks. spillere<input id="s20exmax" class="s13in" type="number" value="${e.playerMax||0}"></label></div>
      <label class="s13field">Tags<input id="s20exmetatags" class="s13in" value="${s13Esc(e.tags)}" placeholder="1v1, pres, teknik..."></label>`;
      anchor.parentElement.insertBefore(sec,anchor);
      document.getElementById("s20savexmeta")?.addEventListener("click",()=>{e.intensity=document.getElementById("s20exmetaint")?.value||"Mellem";e.ageLevel=document.getElementById("s20exage")?.value.trim()||"";e.playerMin=Number(document.getElementById("s20exmin")?.value||0);e.playerMax=Number(document.getElementById("s20exmax")?.value||0);e.tags=document.getElementById("s20exmetatags")?.value.trim()||"";s13Save();visNotification?.("Metadata gemt.")});
    }
  }
}
if(typeof s13Exercises==="function"){const _s20ex=s13Exercises;s13Exercises=function(t){const r=_s20ex(t);setTimeout(s20InjectExerciseTools,20);return r}}

/* =========================================================
   TRAINING STATS + EVALUATION
========================================================= */
function s20TrainingStats(){
  const map=new Map();let total=0;
  s13Data.sessions.forEach(s=>(s.blocks||[]).forEach(b=>{const m=Number(b.duration||0),e=s13Data.exercises.find(x=>x.id===b.exerciseId),k=e?.theme||s.theme||b.title||"Andet";total+=m;map.set(k,(map.get(k)||0)+m)}));
  const evals=s13Data.trainingEvaluations,avg=k=>evals.length?(evals.reduce((n,x)=>n+Number(x[k]||0),0)/evals.length).toFixed(1):"—";
  const rows=[...map.entries()].sort((a,b)=>b[1]-a[1]).slice(0,10);
  return`<section id="s20trainstats" class="s13panel" style="margin-bottom:10px"><div class="s13head"><div><strong>TRÆNINGSSTATISTIK</strong><div class="s13mut">Hvordan bruges jeres registrerede træningstid?</div></div></div>
  <div class="s20metrics"><div class="s20metric"><span>MINUTTER</span><strong>${total}</strong></div><div class="s20metric"><span>KVALITET</span><strong>${avg("quality")}/5</strong></div><div class="s20metric"><span>LÆRING</span><strong>${avg("learning")}/5</strong></div></div>
  <div class="s13stack" style="margin-top:11px">${rows.map(([k,m])=>{const p=total?Math.round(m/total*100):0;return`<div class="s20dist"><span>${s13Esc(k)}</span><div class="s20progress"><span style="width:${p}%"></span></div><strong>${p}%</strong></div>`}).join("")||`<div class="s13mut">Ingen data endnu.</div>`}</div></section>`;
}
function s20InjectTrainingEval(){
  if(s13Tab!=="training"||!s13Session)return;
  const s=s13Data.sessions.find(x=>x.id===s13Session),box=document.getElementById("s13sessionedit");if(!s||!box||document.getElementById("s20traineval"))return;
  const e=s20SessionEval(s.id)||{intensity:3,quality:3,engagement:3,learning:3,note:""};
  box.insertAdjacentHTML("beforeend",`<section id="s20traineval" class="s19-diagram-section"><div class="s13head"><div><strong>EFTER TRÆNING</strong><div class="s13mut">30-sekunders evaluering.</div></div><button id="s20saveeval" class="s13btn">GEM EVALUERING</button></div>
  <div class="s20metrics">${[["intensity","INTENSITET"],["quality","KVALITET"],["engagement","ENGAGEMENT"],["learning","LÆRING"]].map(([k,l])=>`<label class="s13field">${l} 1–5<input id="s20eval_${k}" class="s13in" type="number" min="1" max="5" value="${Number(e[k]||3)}"></label>`).join("")}</div>
  <label class="s13field" style="margin-top:8px">Kort refleksion<textarea id="s20evalnote" class="s13txt">${s13Esc(e.note||"")}</textarea></label></section>`);
  document.getElementById("s20saveeval")?.addEventListener("click",()=>{const v={sessionId:s.id,date:s.date,intensity:Number(document.getElementById("s20eval_intensity")?.value||3),quality:Number(document.getElementById("s20eval_quality")?.value||3),engagement:Number(document.getElementById("s20eval_engagement")?.value||3),learning:Number(document.getElementById("s20eval_learning")?.value||3),note:document.getElementById("s20evalnote")?.value||"",updatedAt:new Date().toISOString()};const i=s13Data.trainingEvaluations.findIndex(x=>x.sessionId===s.id);i<0?s13Data.trainingEvaluations.push(v):s13Data.trainingEvaluations[i]=v;s13Save();visNotification?.("Træningsevaluering gemt.")});
}
if(typeof s13EditSession==="function"){const _s20edit=s13EditSession;s13EditSession=function(...a){const r=_s20edit(...a);setTimeout(s20InjectTrainingEval,35);return r}}
if(typeof s13Training==="function"){const _s20training=s13Training;s13Training=function(t){const r=_s20training(t);if(!document.getElementById("s20trainstats"))t.insertAdjacentHTML("afterbegin",s20TrainingStats());setTimeout(s20InjectTrainingEval,35);return r}}

/* =========================================================
   ADVANCED PRINCIPLES
========================================================= */
function s20Principles(t){
  s20EnsureData();const clips=s20AllClips();
  t.innerHTML=`<section class="s13panel"><div class="s13head"><div><strong>TAKTISK PRINCIPBIBLIOTEK</strong><div class="s13mut">Kobl principper til øvelser og videoklip.</div></div><button id="s20addpr" class="s13btn primary">+ PRINCIP</button></div>
  <div class="s13stack">${s13Data.principles.map(p=>`<div class="s13item" data-p="${p.id}">
    <div class="s13row"><input class="s13in" data-f="title" value="${s13Esc(p.title||"")}"><select class="s13sel" data-f="phase">${["Generelt","Med bold","Uden bold","Offensiv omstilling","Defensiv omstilling","Standardsituationer"].map(x=>`<option ${p.phase===x?"selected":""}>${x}</option>`).join("")}</select><button class="s13btn" data-del>×</button></div>
    <label class="s13field" style="margin-top:7px">Beskrivelse<textarea class="s13txt" data-f="description">${s13Esc(p.description||"")}</textarea></label>
    <div class="s13grid"><label class="s13field">Coachingpunkter<textarea class="s13txt" data-f="coachingPoints">${s13Esc(p.coachingPoints)}</textarea></label><label class="s13field">Triggers<textarea class="s13txt" data-f="triggers">${s13Esc(p.triggers)}</textarea></label></div>
    <label class="s13field">Tags<input class="s13in" data-f="tags" value="${s13Esc(p.tags)}"></label>
    <div class="s13grid" style="margin-top:8px"><div><div class="s20label">ØVELSER</div><div class="s20checklist">${s13Data.exercises.map(e=>`<label class="s20check"><input type="checkbox" data-ex="${e.id}" ${p.exerciseIds.includes(e.id)?"checked":""}>${s13Esc(e.title)}</label>`).join("")||`<div class="s13mut">Ingen øvelser.</div>`}</div></div>
    <div><div class="s20label">VIDEOCLIPS</div><div class="s20checklist">${clips.slice(0,60).map(c=>`<label class="s20check"><input type="checkbox" data-v="${c.id}" ${p.videoClipIds.includes(c.id)?"checked":""}>${s13Esc(c.title||"Klip")} · ${s13Esc(c.projectTitle||"")}</label>`).join("")||`<div class="s13mut">Ingen klip.</div>`}</div></div></div>
    <div style="text-align:right;margin-top:8px"><button class="s13btn primary" data-save>GEM PRINCIP</button></div>
  </div>`).join("")||`<div class="s13mut">Ingen principper endnu.</div>`}</div></section>`;
  document.getElementById("s20addpr")?.addEventListener("click",()=>{s13Data.principles.push({id:s13Id("principle"),title:"Nyt princip",phase:"Generelt",description:"",coachingPoints:"",triggers:"",tags:"",exerciseIds:[],videoClipIds:[]});s13Save();s20Principles(t)});
  t.querySelectorAll("[data-p]").forEach(r=>{const p=s13Data.principles.find(x=>x.id===r.dataset.p);r.querySelector("[data-save]")?.addEventListener("click",()=>{r.querySelectorAll("[data-f]").forEach(f=>p[f.dataset.f]=f.value);p.exerciseIds=[...r.querySelectorAll("[data-ex]:checked")].map(x=>x.dataset.ex);p.videoClipIds=[...r.querySelectorAll("[data-v]:checked")].map(x=>x.dataset.v);s13Save();visNotification?.("Princip gemt.")});r.querySelector("[data-del]")?.addEventListener("click",()=>{if(confirm("Slet princippet?")){s13Data.principles=s13Data.principles.filter(x=>x.id!==p.id);s13Save();s20Principles(t)}})});
}

/* =========================================================
   LIVE MATCH CENTRE
========================================================= */
function s20CurrentLive(){
  if(s20State.liveId){const x=s13Data.liveMatches.find(v=>v.id===s20State.liveId);if(x)return x}
  const x=[...s13Data.liveMatches].reverse().find(v=>v.status!=="finished");if(x)s20State.liveId=x.id;return x||null;
}
function s20CreateLive(match){
  const m=match||(typeof s19MatchMode!=="undefined"&&s19MatchMode.active?s19MatchMode.match:s20NextMatch());
  const n=m&&typeof start11CalendarNormalizeMatch==="function"?start11CalendarNormalizeMatch(m):m,own=typeof start11CalendarTeamName==="function"?start11CalendarTeamName():(s13Meta().teamName||"START11");
  const v={id:s13Id("live"),matchKey:n&&typeof s19MatchKey==="function"?s19MatchKey(n):"",date:n?.date||s13Today(),home:n?.home||own,away:n?.away||prompt("Modstander:","")||"Modstander",ownTeam:own,scoreHome:0,scoreAway:0,status:"ready",startedAt:null,accumulatedSec:0,events:[],coachNotes:"",createdAt:new Date().toISOString()};
  s13Data.liveMatches.push(v);s20State.liveId=v.id;s13Save();return v;
}
function s20Elapsed(v){let s=Number(v.accumulatedSec||0);if(v.status==="live"&&v.startedAt)s+=Math.max(0,(Date.now()-new Date(v.startedAt).getTime())/1000);return s}
function s20Clock(v){const s=Math.floor(s20Elapsed(v)),m=Math.floor(s/60);return String(m).padStart(2,"0")+":"+String(s%60).padStart(2,"0")}
function s20Minute(v){return Math.max(1,Math.floor(s20Elapsed(v)/60)+1)}
function s20ToggleClock(v){if(v.status==="live"){v.accumulatedSec=s20Elapsed(v);v.startedAt=null;v.status="paused"}else{v.startedAt=new Date().toISOString();v.status="live"}s13Save()}
function s20LivePlayer(label){const names=s13Players().map(p=>p.name).join(", ");return prompt(`${label}\n\n${names}`,"")||""}
function s20AddEvent(v,type){
  let note="",pid="";const find=n=>s13Players().find(p=>p.name.toLowerCase()===String(n).trim().toLowerCase());
  const ownHome=String(v.home).toLowerCase()===String(v.ownTeam).toLowerCase();
  if(type==="goal-for"){const n=s20LivePlayer("Målscorer"),a=prompt("Assist (valgfrit):","")||"";note=n+(a?` · assist ${a}`:"");pid=find(n)?.id||"";ownHome?v.scoreHome++:v.scoreAway++}
  else if(type==="goal-against"){note=prompt("Kort note om målet imod:","")||"";ownHome?v.scoreAway++:v.scoreHome++}
  else if(type==="sub"){note=`${s20LivePlayer("Spiller UD")} → ${s20LivePlayer("Spiller IND")}`}
  else if(type==="yellow"||type==="red"){const n=s20LivePlayer(type==="yellow"?"Gult kort":"Rødt kort");note=n;pid=find(n)?.id||""}
  else if(type==="formation")note=prompt("Ny formation / taktisk ændring:","4-3-3")||"";
  else note=prompt("Observation:","")||"";
  v.events.push({id:s13Id("event"),minute:s20Minute(v),second:Math.floor(s20Elapsed(v)),type,note,playerId:pid,createdAt:new Date().toISOString()});s13Save();
}
const s20EventLabel=t=>({"goal-for":"MÅL","goal-against":"MÅL IMOD",sub:"UDSKIFTNING",yellow:"GULT",red:"RØDT",formation:"TAKTIK",note:"NOTE"}[t]||t);
function s20FinishLive(v){
  if(v.status==="live")v.accumulatedSec=s20Elapsed(v);v.status="finished";v.startedAt=null;
  const ownHome=String(v.home).toLowerCase()===String(v.ownTeam).toLowerCase(),own=ownHome?v.scoreHome:v.scoreAway,opp=ownHome?v.scoreAway:v.scoreHome,opponent=ownHome?v.away:v.home;
  let r=s13Data.matches.find(x=>x.liveMatchId===v.id);if(!r){r={id:s13Id("match"),liveMatchId:v.id,date:v.date,opponent,result:`${own}-${opp}`,worked:"",improve:"",tactical:"",nextWeek:"",playerRatings:[]};s13Data.matches.push(r)}
  r.result=`${own}-${opp}`;if(!r.tactical)r.tactical=[v.coachNotes,...v.events.filter(e=>["formation","note"].includes(e.type)).map(e=>`${e.minute}' ${e.note}`)].filter(Boolean).join("\n");
  s13Match=r.id;s13Save();return r;
}
function s20Live(t){
  s20EnsureData();let v=s20CurrentLive();
  if(!v){const n=s20NextMatch();t.innerHTML=`<section class="s13panel"><div class="s13head"><div><strong>LIVE MATCH CENTRE</strong><div class="s13mut">Mål, udskiftninger, kort, taktiske ændringer og noter.</div></div></div><div style="min-height:380px;display:grid;place-items:center;text-align:center"><div><h2>${n?s13Esc(s20Opponent(n))+" · "+s13Date(n.date):"Ny kamp"}</h2><button id="s20startlive" class="s13btn primary">START KAMPCENTRUM</button></div></div></section>`;document.getElementById("s20startlive")?.addEventListener("click",()=>{v=s20CreateLive(n);s20Live(t)});return}
  const ownHome=String(v.home).toLowerCase()===String(v.ownTeam).toLowerCase(),own=ownHome?v.scoreHome:v.scoreAway,opp=ownHome?v.scoreAway:v.scoreHome,opponent=ownHome?v.away:v.home;
  t.innerHTML=`<section class="s13panel"><div class="s13head"><div><strong>LIVE MATCH CENTRE</strong><div class="s13mut">${s13Date(v.date)} · ${s13Esc(v.home)} vs ${s13Esc(v.away)}</div></div>${v.status!=="finished"?`<button id="s20finishlive" class="s13btn">AFSLUT KAMP</button>`:`<button id="s20openreview" class="s13btn primary">POST-MATCH REVIEW</button>`}</div>
  <div class="s20live"><div class="s20team">${s13Esc(v.ownTeam)}</div><div><div class="s20score">${own} - ${opp}</div><div id="s20clock" class="s20clock">${s20Clock(v)} · ${v.status.toUpperCase()}</div>${v.status!=="finished"?`<button id="s20toggleclock" class="s13btn primary" style="margin-top:7px">${v.status==="live"?"PAUSE UR":"START UR"}</button>`:""}</div><div class="s20team">${s13Esc(opponent)}</div></div>
  ${v.status!=="finished"?`<div class="s18-toolbar" style="margin-top:10px">${[["goal-for","+ MÅL"],["goal-against","MÅL IMOD"],["sub","UDSKIFTNING"],["formation","FORMATION"],["yellow","GULT"],["red","RØDT"],["note","+ OBSERVATION"]].map(([k,l])=>`<button class="s13btn ${k==="goal-for"?"primary":""}" data-ev="${k}">${l}</button>`).join("")}</div>`:""}</section>
  <div class="s13grid" style="margin-top:10px"><section class="s13panel"><div class="s13head"><strong>KAMPHÆNDELSER</strong></div><div class="s13stack">${[...v.events].sort((a,b)=>b.second-a.second).map(e=>`<div class="s20event"><strong style="color:var(--s11-primary)">${e.minute}'</strong><strong>${s20EventLabel(e.type)}</strong><span class="s13mut">${s13Esc(e.note||"—")}</span><button class="s13btn" data-delev="${e.id}">×</button></div>`).join("")||`<div class="s13mut">Ingen hændelser.</div>`}</div></section>
  <section class="s13panel"><div class="s13head"><strong>LIVE COACH NOTES</strong></div><textarea id="s20livenotes" class="s13txt" style="min-height:190px">${s13Esc(v.coachNotes||"")}</textarea><button id="s20savelivenotes" class="s13btn" style="margin-top:8px;width:100%">GEM NOTER</button></section></div>`;
  clearInterval(s20State.liveTicker);if(v.status==="live")s20State.liveTicker=setInterval(()=>{const el=document.getElementById("s20clock");if(el)el.textContent=`${s20Clock(v)} · LIVE`},1000);
  document.getElementById("s20toggleclock")?.addEventListener("click",()=>{s20ToggleClock(v);s20Live(t)});
  t.querySelectorAll("[data-ev]").forEach(b=>b.onclick=()=>{s20AddEvent(v,b.dataset.ev);s20Live(t)});
  t.querySelectorAll("[data-delev]").forEach(b=>b.onclick=()=>{const e=v.events.find(x=>x.id===b.dataset.delev);if(e?.type==="goal-for"){ownHome?v.scoreHome=Math.max(0,v.scoreHome-1):v.scoreAway=Math.max(0,v.scoreAway-1)}if(e?.type==="goal-against"){ownHome?v.scoreAway=Math.max(0,v.scoreAway-1):v.scoreHome=Math.max(0,v.scoreHome-1)}v.events=v.events.filter(x=>x.id!==b.dataset.delev);s13Save();s20Live(t)});
  document.getElementById("s20savelivenotes")?.addEventListener("click",()=>{v.coachNotes=document.getElementById("s20livenotes")?.value||"";s13Save();visNotification?.("Kampnoter gemt.")});
  document.getElementById("s20finishlive")?.addEventListener("click",()=>{if(confirm("Afslut kampen og opret post-match review?")){v.coachNotes=document.getElementById("s20livenotes")?.value||v.coachNotes;s20FinishLive(v);s13Tab="matches";s13Render()}});
  document.getElementById("s20openreview")?.addEventListener("click",()=>{const r=s13Data.matches.find(x=>x.liveMatchId===v.id);if(r)s13Match=r.id;s13Tab="matches";s13Render()});
}

/* =========================================================
   POST MATCH REVIEW INTEGRATION
========================================================= */
function s20InjectPostReview(){
  if(s13Tab!=="matches"||document.getElementById("s20postreview"))return;
  const t=document.getElementById("s13content"),m=s13Data.matches.find(x=>x.id===s13Match);if(!t||!m)return;
  const live=m.liveMatchId?s13Data.liveMatches.find(x=>x.id===m.liveMatchId):null,clips=s20AllClips().filter(c=>String(c.projectTitle||"").toLowerCase().includes(String(m.opponent||"").toLowerCase()));
  const sec=document.createElement("section");sec.id="s20postreview";sec.className="s13panel";sec.style.marginTop="10px";
  sec.innerHTML=`<div class="s13head"><div><strong>AUTOMATISK POST-MATCH REVIEW</strong><div class="s13mut">Live-data, video og næste træning.</div></div></div>
  <div class="s20metrics"><div class="s20metric"><span>LIVE EVENTS</span><strong>${live?.events?.length||0}</strong></div><div class="s20metric"><span>VIDEOCLIPS</span><strong>${clips.length}</strong></div><div class="s20metric"><span>NÆSTE UGE</span><strong>${m.nextWeek?"✓":"—"}</strong></div></div>
  ${live?.coachNotes?`<div class="s20insight" style="margin-top:9px"><strong>LIVE COACH NOTES</strong><p>${s13Esc(live.coachNotes)}</p></div>`:""}
  <div style="display:flex;gap:7px;margin-top:9px"><button id="s20reviewtraining" class="s13btn primary">OPRET NÆSTE TRÆNING</button><button id="s20reviewintel" class="s13btn">INTELLIGENCE</button></div>`;t.appendChild(sec);
  document.getElementById("s20reviewtraining")?.addEventListener("click",()=>{const d=new Date();d.setDate(d.getDate()+1);const s={id:s13Id("session"),date:d.toISOString().slice(0,10),title:`Efter ${m.opponent}`,theme:m.nextWeek||"Post-match udvikling",note:[m.improve,m.tactical].filter(Boolean).join("\n\n"),blocks:[],attendance:{}};s13Data.sessions.push(s);s13Session=s.id;s13Save();s13Tab="training";s13Render()});
  document.getElementById("s20reviewintel")?.addEventListener("click",()=>{s13Tab="intelligence";s13Render()});
}
if(typeof s13Matches==="function"){const _s20matches=s13Matches;s13Matches=function(t){const r=_s20matches(t);setTimeout(s20InjectPostReview,25);return r}}

/* =========================================================
   SEASON PLAN / PERIODIZATION
========================================================= */
function s20Season(t){
  s20EnsureData();const arr=[...s13Data.seasonPlan].sort((a,b)=>String(a.startDate).localeCompare(String(b.startDate))),d=s13Data.seasonPlan.find(x=>x.id===s20State.seasonId)||{id:"",startDate:s13Today(),endDate:s13Today(),title:"",theme:"",objective:"",load:"Mellem",principles:[],note:""};
  t.innerHTML=`<div class="s13grid"><section class="s13panel"><div class="s13head"><div><strong>SÆSONPLAN / PERIODISERING</strong><div class="s13mut">Temaer, udviklingsmål og belastning gennem sæsonen.</div></div><button id="s20newseason" class="s13btn primary">+ PERIODE</button></div>
  <div class="s13stack">${arr.map(x=>`<div class="s20season"><div><div class="s13title">${s13Date(x.startDate)}</div><div class="s13mut">→ ${s13Date(x.endDate)}</div></div><div><div class="s13title">${s13Esc(x.title||"Periode")}</div><div class="s13mut">${s13Esc(x.theme||"")}</div></div><span class="s13badge">${s13Esc(x.load||"")}</span><button class="s13btn" data-season="${x.id}">ÅBN</button></div>`).join("")||`<div class="s13mut">Ingen perioder endnu.</div>`}</div></section>
  <section class="s13panel"><div class="s13head"><strong>${d.id?"REDIGER":"NY"} PERIODE</strong></div><div class="s13stack">
  <div class="s13grid"><label class="s13field">Start<input id="s20ss" class="s13in" type="date" value="${d.startDate}"></label><label class="s13field">Slut<input id="s20se" class="s13in" type="date" value="${d.endDate}"></label></div>
  <label class="s13field">Titel<input id="s20stitle" class="s13in" value="${s13Esc(d.title)}"></label><div class="s13grid"><label class="s13field">Tema<input id="s20stheme" class="s13in" value="${s13Esc(d.theme)}"></label><label class="s13field">Belastning<select id="s20sload" class="s13sel">${["Lav","Mellem","Høj","Peak"].map(x=>`<option ${d.load===x?"selected":""}>${x}</option>`).join("")}</select></label></div>
  <label class="s13field">Udviklingsmål<textarea id="s20sobj" class="s13txt">${s13Esc(d.objective||"")}</textarea></label><label class="s13field">Note<textarea id="s20snote" class="s13txt">${s13Esc(d.note||"")}</textarea></label>
  <div class="s20checklist"><div class="s20label">PRINCIPPER</div>${s13Data.principles.map(p=>`<label class="s20check"><input type="checkbox" data-spr="${p.id}" ${(d.principles||[]).includes(p.id)?"checked":""}>${s13Esc(p.title)}</label>`).join("")||`<div class="s13mut">Ingen principper.</div>`}</div>
  <div style="text-align:right">${d.id?`<button id="s20delseason" class="s13btn">SLET</button> `:""}<button id="s20saveseason" class="s13btn primary">GEM</button></div></div></section></div>
  <section class="s13panel" style="margin-top:10px"><div class="s13head"><strong>SÆSONOVERSIGT</strong></div><div class="s20flow">${arr.map((x,i)=>`<div class="s20step"><div class="s20label">${s13Date(x.startDate)}</div><div class="s13title">${s13Esc(x.title||"Periode")}</div><div class="s13mut">${s13Esc(x.theme||"")} · ${s13Esc(x.load||"")}</div></div>${i<arr.length-1?`<div class="s20arrow">→</div>`:""}`).join("")||`<div class="s13mut">Opret perioder først.</div>`}</div></section>`;
  t.querySelectorAll("[data-season]").forEach(b=>b.onclick=()=>{s20State.seasonId=b.dataset.season;s20Season(t)});document.getElementById("s20newseason")?.addEventListener("click",()=>{s20State.seasonId=null;s20Season(t)});
  document.getElementById("s20saveseason")?.addEventListener("click",()=>{const v={id:d.id||s13Id("season"),startDate:document.getElementById("s20ss").value,endDate:document.getElementById("s20se").value,title:document.getElementById("s20stitle").value||"Periode",theme:document.getElementById("s20stheme").value,load:document.getElementById("s20sload").value,objective:document.getElementById("s20sobj").value,note:document.getElementById("s20snote").value,principles:[...t.querySelectorAll("[data-spr]:checked")].map(x=>x.dataset.spr)};const i=s13Data.seasonPlan.findIndex(x=>x.id===v.id);i<0?s13Data.seasonPlan.push(v):s13Data.seasonPlan[i]=v;s20State.seasonId=v.id;s13Save();s20Season(t)});
  document.getElementById("s20delseason")?.addEventListener("click",()=>{if(confirm("Slet perioden?")){s13Data.seasonPlan=s13Data.seasonPlan.filter(x=>x.id!==d.id);s20State.seasonId=null;s13Save();s20Season(t)}})
}

/* =========================================================
   SCOUTING
========================================================= */
function s20Scouting(t){
  s20EnsureData();const next=s20Opponent(s20NextMatch());if(!s20State.scoutingId&&next){const p=s13Data.opponentProfiles.find(x=>String(x.name).toLowerCase()===String(next).toLowerCase());if(p)s20State.scoutingId=p.id}
  const d=s13Data.opponentProfiles.find(x=>x.id===s20State.scoutingId)||{id:"",name:next||"",formation:"",buildUp:"",press:"",attack:"",transitionAttack:"",transitionDefence:"",setPieces:"",strengths:"",weaknesses:"",notes:"",keyPlayers:[],clipIds:[]},clips=s20AllClips();
  t.innerHTML=`<div class="s13grid"><section class="s13panel"><div class="s13head"><div><strong>MODSTANDERDATABASE</strong><div class="s13mut">Scouting kan genbruges mellem kampe.</div></div><button id="s20newscout" class="s13btn primary">+ MODSTANDER</button></div><div class="s13stack">
  ${s13Data.opponentProfiles.map(p=>`<div class="s13item"><div style="display:flex;justify-content:space-between"><div><div class="s13title">${s13Esc(p.name)}</div><div class="s13mut">${s13Esc(p.formation||"Formation ikke registreret")} · ${(p.clipIds||[]).length} clips</div></div><button class="s13btn" data-scout="${p.id}">ÅBN</button></div></div>`).join("")||`<div class="s13mut">Ingen profiler.</div>`}</div></section>
  <section class="s13panel"><div class="s13head"><strong>${d.id?"REDIGER":"NY"} SCOUTING</strong></div><div class="s13stack">
  <div class="s13grid"><label class="s13field">Modstander<input id="s20scname" class="s13in" value="${s13Esc(d.name)}"></label><label class="s13field">Formation<input id="s20scform" class="s13in" value="${s13Esc(d.formation)}"></label></div>
  ${[["buildUp","Opbygning"],["press","Presspil"],["attack","Angrebsmønstre"],["transitionAttack","Offensiv omstilling"],["transitionDefence","Defensiv omstilling"],["setPieces","Standardsituationer"],["strengths","Styrker"],["weaknesses","Svagheder / muligheder"],["notes","Generelle noter"]].map(([k,l])=>`<label class="s13field">${l}<textarea id="s20sc_${k}" class="s13txt">${s13Esc(d[k]||"")}</textarea></label>`).join("")}
  <div><div class="s20label">NØGLESPILLERE</div><div id="s20scplayers" class="s13stack" style="margin-top:6px">${(d.keyPlayers||[]).map((p,i)=>`<div class="s13row" data-kp="${i}"><input class="s13in" data-f="name" value="${s13Esc(p.name||"")}" placeholder="Navn/nr."><input class="s13in" data-f="note" value="${s13Esc(p.note||"")}" placeholder="Rolle/styrke"><button class="s13btn" data-del>×</button></div>`).join("")}</div><button id="s20addkp" class="s13btn" style="margin-top:6px">+ NØGLESPILLER</button></div>
  <div><div class="s20label">VIDEOCLIPS</div><div class="s20checklist">${clips.slice(0,80).map(c=>`<label class="s20check"><input type="checkbox" data-scclip="${c.id}" ${(d.clipIds||[]).includes(c.id)?"checked":""}>${s13Esc(c.title||"Klip")} · ${s13Esc(c.projectTitle||"")}</label>`).join("")||`<div class="s13mut">Ingen klip.</div>`}</div></div>
  <div style="text-align:right">${d.id?`<button id="s20delscout" class="s13btn">SLET</button> `:""}<button id="s20savescout" class="s13btn primary">GEM</button></div></div></section></div>`;
  t.querySelectorAll("[data-scout]").forEach(b=>b.onclick=()=>{s20State.scoutingId=b.dataset.scout;s20Scouting(t)});document.getElementById("s20newscout")?.addEventListener("click",()=>{s20State.scoutingId=null;s20Scouting(t)});
  document.getElementById("s20addkp")?.addEventListener("click",()=>{d.keyPlayers=d.keyPlayers||[];d.keyPlayers.push({name:"",note:""});if(d.id){const s=s13Data.opponentProfiles.find(x=>x.id===d.id);if(s)s.keyPlayers=d.keyPlayers}s20Scouting(t)});
  t.querySelectorAll("[data-kp] [data-del]").forEach(b=>b.onclick=()=>{d.keyPlayers.splice(Number(b.closest("[data-kp]").dataset.kp),1);s20Scouting(t)});
  document.getElementById("s20savescout")?.addEventListener("click",()=>{const kp=[...t.querySelectorAll("[data-kp]")].map(r=>({name:r.querySelector('[data-f="name"]')?.value.trim()||"",note:r.querySelector('[data-f="note"]')?.value.trim()||""})).filter(x=>x.name||x.note);const v={id:d.id||s13Id("opponent"),name:document.getElementById("s20scname").value||"Modstander",formation:document.getElementById("s20scform").value,keyPlayers:kp,clipIds:[...t.querySelectorAll("[data-scclip]:checked")].map(x=>x.dataset.scclip),updatedAt:new Date().toISOString()};["buildUp","press","attack","transitionAttack","transitionDefence","setPieces","strengths","weaknesses","notes"].forEach(k=>v[k]=document.getElementById("s20sc_"+k)?.value||"");const i=s13Data.opponentProfiles.findIndex(x=>x.id===v.id);i<0?s13Data.opponentProfiles.push(v):s13Data.opponentProfiles[i]=v;s20State.scoutingId=v.id;s13Save();s20Scouting(t)});
  document.getElementById("s20delscout")?.addEventListener("click",()=>{if(confirm("Slet modstanderprofilen?")){s13Data.opponentProfiles=s13Data.opponentProfiles.filter(x=>x.id!==d.id);s20State.scoutingId=null;s13Save();s20Scouting(t)}})
}

/* =========================================================
   PLAYER DEVELOPMENT 2.0
========================================================= */
function s20DevSeries(p,attr=""){
  const d=s13Dev(p),ev=[...(d.evaluations||[])].sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")));
  const pts=ev.map(e=>{let v;if(attr)v=(e.attributes||[]).find(a=>String(a.name).toLowerCase()===attr.toLowerCase())?.rating;else v=s13Ovr({attributes:e.attributes||[]});return v==null?null:{label:String(e.date||"").slice(5).replace("-","/"),value:Number(v)}}).filter(Boolean);
  let now=attr?(d.attributes||[]).find(a=>a.name.toLowerCase()===attr.toLowerCase())?.rating:s13Ovr(d);if(now!=null)pts.push({label:"NU",value:Number(now)});return pts;
}
function s20Development(t){
  const ps=s13Players();if(!s20State.developmentPlayerId&&ps[0])s20State.developmentPlayerId=ps[0].id;const p=ps.find(x=>x.id===s20State.developmentPlayerId);if(!p){t.innerHTML=`<section class="s13panel"><div class="s13mut">Ingen spillere.</div></section>`;return}
  const d=s13Dev(p),attrs=d.attributes||[];if(s20State.developmentAttribute&&!attrs.some(a=>a.name===s20State.developmentAttribute))s20State.developmentAttribute="";
  const pts=s20DevSeries(p,s20State.developmentAttribute),change=pts.length>1?pts.at(-1).value-pts[0].value:null,sorted=[...attrs].sort((a,b)=>Number(b.rating)-Number(a.rating)),clips=s20AllClips().filter(c=>c.playerId===p.id);
  t.innerHTML=`<section class="s13panel"><div class="s13head"><div><strong>SPILLERUDVIKLING 2.0</strong><div class="s13mut">Historik, udvikling og video.</div></div><button id="s20openprofile" class="s13btn primary">FULD SPILLERPROFIL</button></div>
  <div class="s13grid"><label class="s13field">Spiller<select id="s20devplayer" class="s13sel">${ps.map(x=>`<option value="${x.id}" ${x.id===p.id?"selected":""}>${s13Esc(x.name)}</option>`).join("")}</select></label><label class="s13field">Graf<select id="s20devattr" class="s13sel"><option value="">Samlet OVR</option>${attrs.map(a=>`<option value="${s13Esc(a.name)}" ${s20State.developmentAttribute===a.name?"selected":""}>${s13Esc(a.name)}</option>`).join("")}</select></label></div>
  <div class="s20metrics" style="margin-top:9px"><div class="s20metric"><span>OVR</span><strong>${s13Ovr(d)}</strong></div><div class="s20metric"><span>ÆNDRING</span><strong>${change==null?"—":(change>=0?"+":"")+Math.round(change)}</strong></div><div class="s20metric"><span>VIDEOCLIPS</span><strong>${clips.length}</strong></div></div></section>
  <div class="s13grid" style="margin-top:10px"><section class="s13panel"><div class="s13head"><strong>UDVIKLING · ${s13Esc(s20State.developmentAttribute||"OVR")}</strong></div><div class="s20chart">${s20LineChart(pts)}</div></section>
  <section class="s13panel"><div class="s13head"><strong>STATUS</strong></div><div class="s13stack"><div class="s13item"><div class="s20label">STÆRKESTE</div><div class="s13title">${sorted[0]?`${s13Esc(sorted[0].name)} · ${sorted[0].rating}`:"—"}</div></div><div class="s13item"><div class="s20label">UDVIKLINGSOMRÅDE</div><div class="s13title">${sorted.at(-1)?`${s13Esc(sorted.at(-1).name)} · ${sorted.at(-1).rating}`:"—"}</div></div><div class="s13item"><div class="s20label">AKTIVE MÅL</div><div class="s13mut">${(d.focus||[]).filter(f=>f.status!=="done").map(f=>s13Esc(f.title||"")).filter(Boolean).join(" · ")||"Ingen aktive fokusmål."}</div></div></div></section></div>`;
  document.getElementById("s20devplayer")?.addEventListener("change",e=>{s20State.developmentPlayerId=e.target.value;s20State.developmentAttribute="";s20Development(t)});
  document.getElementById("s20devattr")?.addEventListener("change",e=>{s20State.developmentAttribute=e.target.value;s20Development(t)});
  document.getElementById("s20openprofile")?.addEventListener("click",()=>start11V12Open?.(p.id));
}

/* =========================================================
   PLAYER MEETING 2.0
========================================================= */
function s20Meetings(t){
  const ps=s13Players();if(!s13MeetingPlayer&&ps[0])s13MeetingPlayer=ps[0].id;const p=ps.find(x=>x.id===s13MeetingPlayer);if(!p){t.innerHTML=`<section class="s13panel"><div class="s13mut">Ingen spillere.</div></section>`;return}
  const d=s13Dev(p),clips=typeof s18MeetingClipsForPlayer==="function"?s18MeetingClipsForPlayer(p.id):s20AllClips().filter(c=>c.playerId===p.id&&c.showInMeeting),meetings=s13Data.meetings.filter(m=>m.playerId===p.id).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  t.innerHTML=`<section class="s13panel"><div class="s13head"><div><strong>SPILLERSAMTALE 2.0</strong><div class="s13mut">Udvikling, fokus, video og 4-ugers aftaler.</div></div><button id="s20startmeeting" class="s13btn primary">START PRÆSENTATION</button></div><label class="s13field">Spiller<select id="s20meetingplayer" class="s13sel">${ps.map(x=>`<option value="${x.id}" ${x.id===p.id?"selected":""}>${s13Esc(x.name)}</option>`).join("")}</select></label></section>
  <div class="s13grid" style="margin-top:10px"><section class="s13panel">${typeof start11V11Radar==="function"?start11V11Radar(d,[...(d.evaluations||[])].sort((a,b)=>String(b.date).localeCompare(String(a.date)))[0]?.attributes||null,390):""}</section>
  <section class="s13panel"><div class="s13head"><strong>FOKUS</strong></div><div class="s13stack"><div class="s13item"><div class="s20label">STYRKER</div><div class="s13mut">${s13Esc(p.strengths||"Ikke udfyldt.")}</div></div><div class="s13item"><div class="s20label">UDVIKLING</div><div class="s13mut">${s13Esc(p.weaknesses||"Ikke udfyldt.")}</div></div><div class="s13item"><div class="s20label">AKTIVE MÅL</div><div class="s13mut">${(d.focus||[]).filter(f=>f.status!=="done").map(f=>s13Esc(f.title||"")).join(" · ")||"Ingen."}</div></div></div></section></div>
  <div class="s13grid" style="margin-top:10px"><section class="s13panel"><div class="s13head"><strong>VIDEO TIL SAMTALEN</strong></div><div class="s13stack">${clips.map(c=>`<div class="s13item"><div class="s13title">${s13Esc(c.title||"Klip")}</div><div class="s13mut">${s13Esc(c.projectTitle||"")} · ${s13Esc(c.outcome||"")}</div></div>`).join("")||`<div class="s13mut">Ingen klip markeret.</div>`}</div></section>
  <section class="s13panel"><div class="s13head"><strong>TIDLIGERE SAMTALER</strong></div><div class="s13stack">${meetings.map(m=>`<div class="s13item"><div class="s13title">${s13Date(m.date)} · ${s13Esc(m.title||"Samtale")}</div><div class="s13mut">${s13Esc(m.note||"")}</div></div>`).join("")||`<div class="s13mut">Ingen tidligere samtaler.</div>`}</div></section></div>`;
  document.getElementById("s20meetingplayer")?.addEventListener("change",e=>{s13MeetingPlayer=e.target.value;s20Meetings(t)});document.getElementById("s20startmeeting")?.addEventListener("click",()=>s20PresentMeeting(p));
}
function s20PresentMeeting(p){
  let o=document.getElementById("s20meetingoverlay");if(!o){o=document.createElement("div");o.id="s20meetingoverlay";o.className="s13present";document.body.appendChild(o)}
  const d=s13Dev(p),pts=s20DevSeries(p),clips=typeof s18MeetingClipsForPlayer==="function"?s18MeetingClipsForPlayer(p.id):[];
  o.innerHTML=`<div class="s13presentin"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px"><div><div style="color:var(--s11-primary);font-size:10px;font-weight:950">START11 · SPILLERSAMTALE 2.0</div><h1 style="font-size:34px;margin:4px 0">${s13Esc(p.name)}</h1><div class="s13mut">${s13Esc(p.position||"—")} · OVR ${s13Ovr(d)}</div></div><button id="s20meetclose" class="s13btn">LUK</button></div>
  <div class="s13presentgrid"><section class="s13panel">${typeof start11V11Radar==="function"?start11V11Radar(d,[...(d.evaluations||[])].sort((a,b)=>String(b.date).localeCompare(String(a.date)))[0]?.attributes||null,470):""}</section><section class="s13panel"><div class="s13head"><strong>UDVIKLING</strong></div><div class="s20chart">${s20LineChart(pts)}</div></section></div>
  <section class="s13panel" style="margin-top:14px"><div class="s13grid"><div><div class="s20label">STYRKER</div><p>${s13Esc(p.strengths||"Ikke udfyldt.")}</p></div><div><div class="s20label">UDVIKLINGSOMRÅDER</div><p>${s13Esc(p.weaknesses||"Ikke udfyldt.")}</p></div></div>
  <div class="s13grid"><label class="s13field">Dato<input id="s20meetdate" class="s13in" type="date" value="${s13Today()}"></label><label class="s13field">Titel<input id="s20meettitle" class="s13in" value="Spillersamtale"></label></div><label class="s13field">Aftaler de næste 4 uger<textarea id="s20meetnote" class="s13txt"></textarea></label><div style="text-align:right;margin-top:8px"><button id="s20savemeeting" class="s13btn primary">GEM SAMTALE</button></div></section>
  <section class="s13panel" style="margin-top:14px"><div class="s13head"><strong>VIDEOCLIPS</strong></div><div class="s13grid">${clips.map(c=>`<div class="s13item"><div class="s13title">${s13Esc(c.title||"Klip")}</div><div class="s13mut">${s13Esc(c.observation||"")}</div></div>`).join("")||`<div class="s13mut">Ingen klip.</div>`}</div></section></div>`;o.classList.add("open");
  document.getElementById("s20meetclose").onclick=()=>o.classList.remove("open");document.getElementById("s20savemeeting").onclick=()=>{s13Data.meetings.push({id:s13Id("meet"),playerId:p.id,date:document.getElementById("s20meetdate").value,title:document.getElementById("s20meettitle").value||"Spillersamtale",note:document.getElementById("s20meetnote").value,clipIds:clips.map(c=>c.id),createdAt:new Date().toISOString()});s13Save();o.classList.remove("open");visNotification?.("Spillersamtalen er gemt.")}
}

/* =========================================================
   COACH INTELLIGENCE
========================================================= */
function s20Insights(){
  s20EnsureData();const out=[],ps=s13Players(),stale=s13NeedEval(),matches=s13Data.matches,sessions=s13Data.sessions,next=s20NextMatch(),opp=s20Opponent(next);
  if(stale.length)out.push({priority:stale.length>=Math.max(4,ps.length/3)?"high":"medium",title:`${stale.length} spillerprofiler mangler ny evaluering`,body:"Opdatér evalueringerne, så udviklingsgrafer og spillersamtaler bygger på friske data."});
  const total=new Map();let mins=0;sessions.forEach(s=>(s.blocks||[]).forEach(b=>{const m=Number(b.duration||0),e=s13Data.exercises.find(x=>x.id===b.exerciseId),k=e?.theme||s.theme||"Andet";mins+=m;total.set(k,(total.get(k)||0)+m)}));const top=[...total.entries()].sort((a,b)=>b[1]-a[1])[0];if(top&&mins){const p=Math.round(top[1]/mins*100);if(p>=35)out.push({priority:"medium",title:`${top[0]} fylder ${p}% af træningstiden`,body:"Tjek om fordelingen matcher jeres sæsonplan og vigtigste udviklingsmål."})}
  const txt=matches.slice(-8).map(m=>[m.improve,m.tactical,m.nextWeek].filter(Boolean).join(" ")).join(" ").toLowerCase();[["pres","Pres"],["genpres","Genpres"],["1v1","1v1"],["duel","Duelspil"],["opbyg","Opbygning"],["omstilling","Omstillinger"],["kant","Kantrelationer"]].forEach(([needle,label])=>{const n=txt.split(needle).length-1;if(n>=3)out.push({priority:n>=5?"high":"medium",title:`${label} går igen i kampreviews`,body:`Begrebet optræder ${n} gange. Overvej en tydelig træningsblok og konkrete videoklip.`})});
  if(opp){const p=s13Data.opponentProfiles.find(x=>String(x.name).toLowerCase()===String(opp).toLowerCase());if(!p)out.push({priority:"medium",title:`Scouting mangler på ${opp}`,body:"Næste kamp er planlagt, men der er endnu ingen modstanderprofil."})}
  const ev=s13Data.trainingEvaluations.slice(-5);if(ev.length>=3){const a=ev.reduce((n,x)=>n+Number(x.learning||0),0)/ev.length;if(a<3)out.push({priority:"high",title:"Læring vurderes lavt i de seneste træninger",body:`Gennemsnittet er ${a.toFixed(1)}/5. Overvej færre coachingbudskaber eller tydeligere progression.`})}
  const unlinked=s13Data.principles.filter(p=>!p.exerciseIds?.length);if(unlinked.length)out.push({priority:"low",title:`${unlinked.length} principper mangler koblede øvelser`,body:"Kobl principper til konkrete øvelser, så kampplan og træning hænger tættere sammen."});
  if(matches.length>=3&&!s20AllClips().length)out.push({priority:"low",title:"Kampreviews er registreret uden video",body:"Tilføj 2–5 nøgleklip efter hver kamp for at gøre evalueringen mere konkret."});
  return out;
}
function s20Intelligence(t){
  const ins=s20Insights(),n=s20NextMatch(),opp=s20Opponent(n);
  t.innerHTML=`<section class="s13panel"><div class="s13head"><div><strong>COACH INTELLIGENCE</strong><div class="s13mut">Regelbaseret analyse af dine egne START11-data.</div></div></div><div class="s13stack">${ins.map(i=>`<div class="s20insight ${i.priority}"><strong>${s13Esc(i.title)}</strong><p>${s13Esc(i.body)}</p></div>`).join("")||`<div class="s13mut">Ingen tydelige mønstre endnu.</div>`}</div></section>
  <div class="s13grid" style="margin-top:10px"><section class="s13panel"><div class="s13head"><strong>NÆSTE BESLUTNING</strong></div>${n?`<div class="s13item"><div class="s13title">${s13Esc(opp)}</div><div class="s13mut">${s13Date(n.date)}</div></div><div style="display:flex;gap:7px;margin-top:8px"><button id="s20intelscout" class="s13btn">SCOUTING</button><button id="s20intelmatch" class="s13btn primary">START11</button></div>`:`<div class="s13mut">Ingen kommende kamp.</div>`}</section>
  <section class="s13panel"><div class="s13head"><strong>DATAGRUNDLAG</strong></div><div class="s20metrics"><div class="s20metric"><span>TRÆNINGER</span><strong>${s13Data.sessions.length}</strong></div><div class="s20metric"><span>KAMPREVIEWS</span><strong>${s13Data.matches.length}</strong></div><div class="s20metric"><span>VIDEOCLIPS</span><strong>${s20AllClips().length}</strong></div></div></section></div>`;
  document.getElementById("s20intelscout")?.addEventListener("click",()=>{const p=s13Data.opponentProfiles.find(x=>String(x.name).toLowerCase()===String(opp).toLowerCase());s20State.scoutingId=p?.id||null;s13Tab="scouting";s13Render()});
  document.getElementById("s20intelmatch")?.addEventListener("click",()=>{if(n&&typeof s19EnterMatchMode==="function"){s13Close();s19EnterMatchMode(n)}})
}

/* =========================================================
   INIT / DYNAMIC
========================================================= */
function s20Refresh(){
  s20EnsureData();
  if(s13Tab==="exercises")s20InjectExerciseTools();
  if(s13Tab==="training")s20InjectTrainingEval();
  if(s13Tab==="matches")s20InjectPostReview();
}
function s20Init(){
  s20EnsureData();s20InstallStyles();setTimeout(s20Refresh,100);
  let tm=null;const obs=new MutationObserver(ms=>{const ok=ms.some(m=>[...m.addedNodes].some(n=>n instanceof Element&&(n.id==="s13content"||n.id==="s13sessionedit"||n.querySelector?.("#s13content,#s13sessionedit"))));if(!ok)return;clearTimeout(tm);tm=setTimeout(s20Refresh,120)});obs.observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(s20Init,3600));else setTimeout(s20Init,3600);


/* =========================================================
   START11 – V21 COACHING HUB POLISH + PRINCIP FIX
   - Fjerner den grimme native scrollbar under fanerne
   - Gør fanebjælken ren og sticky
   - Princip-editor lukker ikke Coaching Hub ved select/input
========================================================= */

function s21InstallHubPolish(){
  if(document.getElementById("s21HubPolishStyles")) return;

  const style = document.createElement("style");
  style.id = "s21HubPolishStyles";
  style.textContent = `
    #s13modal .s13shell{
      overflow:hidden !important;
    }

    #s13tabs.s13tabs{
      position:relative;
      height:46px !important;
      min-height:46px !important;
      display:flex !important;
      align-items:stretch;
      overflow-x:auto !important;
      overflow-y:hidden !important;
      scrollbar-width:none !important;
      -ms-overflow-style:none !important;
      scroll-behavior:smooth;
      overscroll-behavior-x:contain;
      background:
        linear-gradient(180deg,rgba(8,22,10,.98),rgba(5,15,7,.98));
      border-bottom:1px solid rgba(96,255,55,.14) !important;
    }

    #s13tabs.s13tabs::-webkit-scrollbar{
      width:0 !important;
      height:0 !important;
      display:none !important;
    }

    #s13tabs .s13tab{
      flex:0 0 auto;
      min-width:118px;
      height:46px;
      padding:0 16px;
      white-space:nowrap;
      border-right:1px solid rgba(255,255,255,.035);
      border-bottom:2px solid transparent;
      transition:
        color .16s ease,
        background .16s ease,
        border-color .16s ease;
    }

    #s13tabs .s13tab:hover{
      color:#dfe8e1;
      background:rgba(255,255,255,.025);
    }

    #s13tabs .s13tab.active{
      color:#fff !important;
      border-bottom-color:var(--s11-primary) !important;
      background:
        linear-gradient(180deg,
          color-mix(in srgb,var(--s11-primary) 10%,transparent),
          color-mix(in srgb,var(--s11-primary) 3%,transparent)
        ) !important;
    }

    #s21TabNav{
      position:absolute;
      right:18px;
      top:86px;
      z-index:8;
      display:flex;
      gap:5px;
      pointer-events:none;
    }

    #s21TabNav button{
      pointer-events:auto;
      width:29px;
      height:29px;
      display:grid;
      place-items:center;
      padding:0;
      border:1px solid rgba(96,255,55,.32);
      border-radius:7px;
      background:rgba(3,12,5,.94);
      color:#dfffd7;
      font-size:14px;
      font-weight:1000;
      cursor:pointer;
      box-shadow:0 4px 18px rgba(0,0,0,.22);
    }

    #s21TabNav button:hover{
      background:color-mix(in srgb,var(--s11-primary) 12%,#061008);
      border-color:var(--s11-primary);
    }

    #s13content{
      scrollbar-width:thin;
      scrollbar-color:rgba(96,255,55,.28) transparent;
    }

    #s13content::-webkit-scrollbar{width:7px}
    #s13content::-webkit-scrollbar-track{background:transparent}
    #s13content::-webkit-scrollbar-thumb{
      background:rgba(96,255,55,.22);
      border-radius:999px;
    }

    #s13content [data-p] select,
    #s13content [data-p] input,
    #s13content [data-p] textarea,
    #s13content [data-p] button,
    #s13content [data-p] label{
      position:relative;
      z-index:2;
    }
  `;
  document.head.appendChild(style);
}

function s21InstallTabNavigation(){
  const shell = document.querySelector("#s13modal .s13shell");
  const tabs = document.getElementById("s13tabs");
  if(!shell || !tabs) return;

  let nav = document.getElementById("s21TabNav");
  if(!nav){
    nav = document.createElement("div");
    nav.id = "s21TabNav";
    nav.innerHTML = `
      <button type="button" id="s21TabsLeft" aria-label="Forrige faner">‹</button>
      <button type="button" id="s21TabsRight" aria-label="Næste faner">›</button>
    `;
    shell.appendChild(nav);

    document.getElementById("s21TabsLeft")?.addEventListener("click", e=>{
      e.preventDefault();
      e.stopPropagation();
      tabs.scrollBy({left:-360,behavior:"smooth"});
    });

    document.getElementById("s21TabsRight")?.addEventListener("click", e=>{
      e.preventDefault();
      e.stopPropagation();
      tabs.scrollBy({left:360,behavior:"smooth"});
    });
  }

  const active = tabs.querySelector(".s13tab.active");
  if(active){
    setTimeout(()=>{
      try{
        active.scrollIntoView({
          behavior:"smooth",
          block:"nearest",
          inline:"center"
        });
      }catch(_){}
    },20);
  }
}

function s21ProtectPrincipEditor(){
  const content = document.getElementById("s13content");
  if(!content || s13Tab !== "principles") return;

  content.querySelectorAll("[data-p]").forEach(card=>{
    if(card.dataset.s21Protected === "1") return;
    card.dataset.s21Protected = "1";

    [
      "mousedown",
      "pointerdown",
      "click",
      "change",
      "input",
      "focusin"
    ].forEach(type=>{
      card.addEventListener(type, e=>{
        e.stopPropagation();
      });
    });

    card.querySelectorAll("button").forEach(btn=>{
      if(!btn.getAttribute("type")) btn.type = "button";
    });
  });

  const add = document.getElementById("s20addpr");
  if(add && !add.getAttribute("type")) add.type = "button";
}

/* Mere robust modal-close:
   Kun et reelt klik på selve backdrop må lukke Coaching Hub.
   Interaktion med native select/options må aldrig gøre det. */
function s21ProtectHubModal(){
  const modal = document.getElementById("s13modal");
  const shell = modal?.querySelector(".s13shell");
  if(!modal || !shell || modal.dataset.s21ModalProtected === "1") return;

  modal.dataset.s21ModalProtected = "1";

  shell.addEventListener("mousedown", e=>e.stopPropagation());
  shell.addEventListener("pointerdown", e=>e.stopPropagation());
  shell.addEventListener("click", e=>e.stopPropagation());

  /* V21.1 FIX:
     Brug IKKE en capture-listener med stopImmediatePropagation her.
     Den gamle løsning stoppede eventet på modal-niveau, før klik inde i
     PRINCIPPER nåede input/select/button og fik derfor hubben til at
     opføre sig som om interaktionen blev afbrudt.

     Den oprindelige s13Modal-handler lukker allerede kun når
     e.target === modal, så klik inde i .s13shell må bare få lov
     til at fortsætte normalt. */
}

function s21HubRefresh(){
  s21InstallHubPolish();
  s21ProtectHubModal();
  s21InstallTabNavigation();
  s21ProtectPrincipEditor();
}

/* Wrapper omkring render, så polish geninstalleres efter hver fane-render. */
if(typeof s13Render === "function"){
  const s21RenderBefore = s13Render;
  s13Render = function(...args){
    const result = s21RenderBefore(...args);
    setTimeout(s21HubRefresh,0);
    setTimeout(s21HubRefresh,60);
    return result;
  };
}

function s21Init(){
  s21InstallHubPolish();
  s21HubRefresh();

  let timer = null;
  const observer = new MutationObserver(mutations=>{
    const relevant = mutations.some(m=>
      [...m.addedNodes].some(n=>
        n instanceof Element &&
        (
          n.id === "s13modal" ||
          n.id === "s13tabs" ||
          n.id === "s13content" ||
          n.matches?.("[data-p]") ||
          n.querySelector?.("#s13modal,#s13tabs,#s13content,[data-p]")
        )
      )
    );
    if(!relevant) return;
    clearTimeout(timer);
    timer = setTimeout(s21HubRefresh,40);
  });

  observer.observe(document.body,{childList:true,subtree:true});
}

if(document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded",()=>setTimeout(s21Init,3700));
}else{
  setTimeout(s21Init,3700);
}



/* =========================================================
   START11 – V22 MATCH DATA HUB
   ---------------------------------------------------------
   Wyscout-lignende kampdata oven på det eksisterende
   Video Analysis Studio.

   Vigtigt:
   - Den eksisterende manuelle klipfunktion i VIDEO bevares.
   - Hele kampvideoen genbruges fra V18/V21 videoProjects.
   - Match Data Hub kan både bruge:
       1) manuel event-tagging
       2) manuel possession-logging
       3) AI-backend når endpoint er sat op
   - Klik på statistik -> filtrer situationer -> åbn/afspil klip
   - Shot map, zoner, possession og eventfordeling
   - AI-resultater gemmes i samme datamodel som manuelle events
========================================================= */


/* =========================================================
   V22 DATA
========================================================= */

function s22EnsureData(){

    if(
        !s13Data ||
        typeof s13Data !== "object"
    ){
        s13Data = {};
    }

    if(
        !Array.isArray(
            s13Data.videoProjects
        )
    ){
        s13Data.videoProjects = [];
    }

    s13Data.videoProjects.forEach(project=>{

        if(
            !project.analytics ||
            typeof project.analytics !== "object"
        ){
            project.analytics = {};
        }

        const a = project.analytics;

        if(!Array.isArray(a.events)){
            a.events = [];
        }

        if(!Array.isArray(a.possessionSegments)){
            a.possessionSegments = [];
        }

        if(!Array.isArray(a.aiRuns)){
            a.aiRuns = [];
        }

        a.status =
            a.status ||
            "idle";

        a.selectedTeam =
            a.selectedTeam ||
            "own";

        a.createdAt =
            a.createdAt ||
            new Date().toISOString();

        a.updatedAt =
            a.updatedAt ||
            new Date().toISOString();

        a.events.forEach(event=>{

            event.id =
                event.id ||
                s13Id(
                    "match-event"
                );

            event.source =
                event.source ||
                "manual";

            event.confidence =
                event.confidence == null
                    ? 1
                    : Number(
                        event.confidence
                    );

            event.time =
                Number(
                    event.time ||
                    event.start ||
                    0
                );

            event.start =
                Number(
                    event.start ??
                    Math.max(
                        0,
                        event.time -
                        6
                    )
                );

            event.end =
                Number(
                    event.end ??
                    (
                        event.time +
                        7
                    )
                );

            event.team =
                event.team ||
                "own";

            event.type =
                event.type ||
                "note";

            event.outcome =
                event.outcome ||
                "";

            event.zone =
                event.zone ||
                "";

            if(
                event.x != null
            ){
                event.x =
                    Number(
                        event.x
                    );
            }

            if(
                event.y != null
            ){
                event.y =
                    Number(
                        event.y
                    );
            }

        });

    });

}


if(
    typeof s13Norm ===
    "function"
){

    const s22NormBefore =
        s13Norm;

    s13Norm =
        function(raw={}){

            const data =
                s22NormBefore(
                    raw
                );

            if(
                !Array.isArray(
                    data.videoProjects
                )
            ){
                data.videoProjects = [];
            }

            data.videoProjects.forEach(project=>{

                project.analytics =
                    project.analytics &&
                    typeof project.analytics ===
                    "object"
                        ? project.analytics
                        : {};

                project.analytics.events =
                    Array.isArray(
                        project.analytics.events
                    )
                        ? project.analytics.events
                        : [];

                project.analytics.possessionSegments =
                    Array.isArray(
                        project.analytics.possessionSegments
                    )
                        ? project.analytics.possessionSegments
                        : [];

                project.analytics.aiRuns =
                    Array.isArray(
                        project.analytics.aiRuns
                    )
                        ? project.analytics.aiRuns
                        : [];

            });

            return data;

        };

}


/* =========================================================
   V22 STATE
========================================================= */

const s22State = {

    projectId:
        null,

    eventFilter:
        "all",

    teamFilter:
        "all",

    minConfidence:
        0,

    pitchPoint:
        null,

    objectUrl:
        "",

    possessionTeam:
        null,

    possessionStartedAt:
        null,

    aiPollTimer:
        null,

    selectedEventId:
        null

};


/* =========================================================
   V22 EVENT TYPES
========================================================= */

const s22EventTypes = {

    shot: {
        label:
            "Skud",
        short:
            "SKUD"
    },

    goal: {
        label:
            "Mål",
        short:
            "MÅL"
    },

    chance: {
        label:
            "Stor chance",
        short:
            "CHANCE"
    },

    pass: {
        label:
            "Aflevering",
        short:
            "PAS"
    },

    progressive_pass: {
        label:
            "Progressiv aflevering",
        short:
            "PROG. PAS"
    },

    final_third_entry: {
        label:
            "Ind i sidste tredjedel",
        short:
            "SIDSTE 1/3"
    },

    cross: {
        label:
            "Indlæg",
        short:
            "INDLÆG"
    },

    ball_loss: {
        label:
            "Boldtab",
        short:
            "BOLDTAB"
    },

    recovery: {
        label:
            "Bolderobring",
        short:
            "EROBRING"
    },

    duel: {
        label:
            "Duel",
        short:
            "DUEL"
    },

    counterpress: {
        label:
            "Genpres",
        short:
            "GENPRES"
    },

    transition_attack: {
        label:
            "Offensiv omstilling",
        short:
            "OMST. +"
    },

    transition_defence: {
        label:
            "Defensiv omstilling",
        short:
            "OMST. -"
    },

    corner: {
        label:
            "Hjørnespark",
        short:
            "HJØRNE"
    },

    free_kick: {
        label:
            "Frispark",
        short:
            "FRISPARK"
    },

    keeper_action: {
        label:
            "Keeperaktion",
        short:
            "KEEPER"
    },

    press_break: {
        label:
            "Første pres spillet igennem",
        short:
            "PRESBRUD"
    },

    note: {
        label:
            "Observation",
        short:
            "NOTE"
    }

};


/* =========================================================
   V22 STYLES
========================================================= */

function s22InstallStyles(){

    if(
        document.getElementById(
            "s22styles"
        )
    ){
        return;
    }

    const style =
        document.createElement(
            "style"
        );

    style.id =
        "s22styles";

    style.textContent = `

        .s22-grid{
            display:grid;
            grid-template-columns:
                minmax(0,1.55fr)
                minmax(340px,.75fr);
            gap:10px;
        }

        .s22-stat-grid{
            display:grid;
            grid-template-columns:
                repeat(4,minmax(0,1fr));
            gap:8px;
        }

        .s22-stat{
            padding:11px;
            border:1px solid rgba(255,255,255,.07);
            border-radius:8px;
            background:#071009;
            cursor:pointer;
            transition:
                border-color .15s ease,
                transform .15s ease,
                background .15s ease;
        }

        .s22-stat:hover{
            transform:translateY(-1px);
            border-color:var(--s11-primary);
        }

        .s22-stat.active{
            border-color:var(--s11-primary);
            background:var(--s11-theme-glow-soft);
        }

        .s22-stat-label{
            color:#7c897f;
            font-size:7px;
            font-weight:950;
            text-transform:uppercase;
        }

        .s22-stat-value{
            margin-top:4px;
            color:#fff;
            font-size:22px;
            font-weight:1000;
        }

        .s22-video-stage{
            position:relative;
            aspect-ratio:16/9;
            overflow:hidden;
            border:1px solid rgba(255,255,255,.1);
            border-radius:9px;
            background:#000;
        }

        .s22-video-stage video{
            width:100%;
            height:100%;
            display:block;
            object-fit:contain;
            background:#000;
        }

        .s22-event-timeline{
            position:relative;
            height:65px;
            margin-top:8px;
            overflow:hidden;
            border:1px solid rgba(255,255,255,.07);
            border-radius:7px;
            background:#050905;
            cursor:pointer;
        }

        .s22-event-dot{
            position:absolute;
            top:24px;
            width:9px;
            height:9px;
            border-radius:50%;
            transform:translate(-50%,-50%);
            background:var(--s11-primary);
            border:1px solid #fff;
            cursor:pointer;
            z-index:4;
        }

        .s22-event-dot.opp{
            background:#ff6666;
        }

        .s22-playhead{
            position:absolute;
            top:0;
            bottom:0;
            width:2px;
            background:#fff;
            z-index:8;
            pointer-events:none;
        }

        .s22-event-row{
            display:grid;
            grid-template-columns:
                64px
                105px
                minmax(0,1fr)
                72px;
            gap:7px;
            align-items:center;
            padding:8px;
            border:1px solid rgba(255,255,255,.06);
            border-radius:6px;
            background:#071009;
            cursor:pointer;
        }

        .s22-event-row.active{
            border-color:var(--s11-primary);
        }

        .s22-event-time{
            color:var(--s11-primary);
            font-size:8px;
            font-weight:1000;
            font-variant-numeric:tabular-nums;
        }

        .s22-event-type{
            font-size:7px;
            font-weight:1000;
            text-transform:uppercase;
        }

        .s22-confidence{
            display:inline-flex;
            align-items:center;
            justify-content:center;
            min-height:22px;
            padding:0 6px;
            border-radius:999px;
            border:1px solid rgba(255,255,255,.1);
            color:#99a69d;
            font-size:6px;
            font-weight:900;
        }

        .s22-pitch{
            position:relative;
            aspect-ratio:105/68;
            overflow:hidden;
            border:1px solid rgba(255,255,255,.12);
            border-radius:8px;
            background:
                repeating-linear-gradient(
                    90deg,
                    rgba(255,255,255,.025) 0,
                    rgba(255,255,255,.025) 10%,
                    rgba(0,0,0,.02) 10%,
                    rgba(0,0,0,.02) 20%
                ),
                #176733;
            cursor:crosshair;
        }

        .s22-pitch:before{
            content:"";
            position:absolute;
            inset:5%;
            border:2px solid rgba(255,255,255,.67);
            pointer-events:none;
        }

        .s22-pitch:after{
            content:"";
            position:absolute;
            left:50%;
            top:5%;
            bottom:5%;
            width:2px;
            background:rgba(255,255,255,.6);
            transform:translateX(-50%);
            pointer-events:none;
        }

        .s22-pitch-point{
            position:absolute;
            width:12px;
            height:12px;
            border-radius:50%;
            border:2px solid #fff;
            background:var(--s11-primary);
            transform:translate(-50%,-50%);
            pointer-events:none;
            z-index:5;
        }

        .s22-shot{
            position:absolute;
            width:13px;
            height:13px;
            border-radius:50%;
            transform:translate(-50%,-50%);
            border:2px solid #fff;
            background:#f0c55d;
            cursor:pointer;
            z-index:4;
        }

        .s22-shot.goal{
            background:var(--s11-primary);
        }

        .s22-shot.opp{
            background:#ff6666;
        }

        .s22-zone-grid{
            position:absolute;
            inset:5%;
            display:grid;
            grid-template-columns:repeat(5,1fr);
            grid-template-rows:repeat(3,1fr);
            pointer-events:none;
            opacity:.17;
        }

        .s22-zone-grid span{
            border:1px solid #fff;
        }

        .s22-possession{
            display:grid;
            grid-template-columns:
                minmax(0,1fr)
                minmax(0,1fr);
            overflow:hidden;
            height:28px;
            border-radius:999px;
            background:#111;
        }

        .s22-pos-own,
        .s22-pos-opp{
            display:grid;
            place-items:center;
            min-width:0;
            font-size:7px;
            font-weight:1000;
        }

        .s22-pos-own{
            background:var(--s11-primary);
            color:#061008;
        }

        .s22-pos-opp{
            background:#b94b4b;
            color:#fff;
        }

        .s22-ai-box{
            padding:11px;
            border:1px solid rgba(255,255,255,.07);
            border-left:3px solid var(--s11-primary);
            border-radius:7px;
            background:
                linear-gradient(
                    90deg,
                    var(--s11-theme-glow-soft),
                    transparent 70%
                ),
                #071009;
        }

        .s22-toolbar{
            display:flex;
            flex-wrap:wrap;
            gap:5px;
            align-items:center;
        }

        .s22-team-toggle{
            display:inline-flex;
            overflow:hidden;
            border:1px solid rgba(255,255,255,.09);
            border-radius:7px;
        }

        .s22-team-toggle button{
            min-height:31px;
            padding:0 10px;
            border:0;
            border-right:1px solid rgba(255,255,255,.07);
            background:#071009;
            color:#8c998f;
            font:inherit;
            font-size:7px;
            font-weight:950;
            cursor:pointer;
        }

        .s22-team-toggle button:last-child{
            border-right:0;
        }

        .s22-team-toggle button.active{
            background:var(--s11-theme-glow-soft);
            color:var(--s11-primary);
        }

        .s22-filterbar{
            display:grid;
            grid-template-columns:
                minmax(150px,1fr)
                130px
                120px
                auto;
            gap:7px;
        }

        @media(max-width:1150px){
            .s22-grid{
                grid-template-columns:1fr;
            }

            .s22-stat-grid{
                grid-template-columns:
                    repeat(2,minmax(0,1fr));
            }
        }

        @media(max-width:700px){
            .s22-stat-grid{
                grid-template-columns:1fr 1fr;
            }

            .s22-event-row{
                grid-template-columns:1fr;
            }

            .s22-filterbar{
                grid-template-columns:1fr;
            }
        }

    `;

    document.head.appendChild(
        style
    );

}


/* =========================================================
   V22 HELPERS
========================================================= */

function s22Projects(){

    s22EnsureData();

    return s13Data.videoProjects;

}


function s22CurrentProject(){

    const projects =
        s22Projects();

    if(
        s22State.projectId
    ){

        const found =
            projects.find(
                project =>
                    project.id ===
                    s22State.projectId
            );

        if(found){
            return found;
        }

    }

    const first =
        projects[0] ||
        null;

    if(first){
        s22State.projectId =
            first.id;
    }

    return first;

}


function s22Analytics(){

    const project =
        s22CurrentProject();

    if(!project){
        return null;
    }

    project.analytics =
        project.analytics ||
        {
            events:[],
            possessionSegments:[],
            aiRuns:[]
        };

    return project.analytics;

}


function s22OwnTeamName(){

    return (
        typeof start11CalendarTeamName ===
        "function"
            ? start11CalendarTeamName()
            : (
                s13Meta()
                    .teamName ||
                "START11"
            )
    );

}


function s22OpponentName(project){

    if(!project){
        return "Modstander";
    }

    return (
        project.opponent ||
        String(
            project.title ||
            ""
        )
            .split(
                "-"
            )[1]
            ?.trim() ||
        "Modstander"
    );

}


function s22FormatTime(seconds){

    const s =
        Math.max(
            0,
            Number(
                seconds ||
                0
            )
        );

    const h =
        Math.floor(
            s /
            3600
        );

    const m =
        Math.floor(
            (
                s %
                3600
            ) /
            60
        );

    const sec =
        Math.floor(
            s %
            60
        );

    return h
        ? `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`
        : `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;

}


function s22ZoneFromPoint(x,y){

    if(
        x == null ||
        y == null
    ){
        return "";
    }

    const third =
        x < .333
            ? "Defensiv tredjedel"
            : (
                x < .666
                    ? "Midterste tredjedel"
                    : "Offensiv tredjedel"
            );

    const lane =
        y < .20
            ? "Venstre yderside"
            : (
                y < .40
                    ? "Venstre halfspace"
                    : (
                        y < .60
                            ? "Centralt"
                            : (
                                y < .80
                                    ? "Højre halfspace"
                                    : "Højre yderside"
                            )
                    )
            );

    return `${third} · ${lane}`;

}


function s22EventMatchesFilter(event){

    if(
        s22State.eventFilter !==
            "all" &&
        event.type !==
            s22State.eventFilter
    ){
        return false;
    }

    if(
        s22State.teamFilter !==
            "all" &&
        event.team !==
            s22State.teamFilter
    ){
        return false;
    }

    if(
        Number(
            event.confidence ??
            1
        ) <
        s22State.minConfidence
    ){
        return false;
    }

    return true;

}


function s22FilteredEvents(){

    const a =
        s22Analytics();

    if(!a){
        return [];
    }

    return a.events
        .filter(
            s22EventMatchesFilter
        )
        .sort(
            (
                a,
                b
            ) =>
                Number(
                    a.time ||
                    0
                ) -
                Number(
                    b.time ||
                    0
                )
        );

}


function s22Count(type,team="own"){

    const a =
        s22Analytics();

    if(!a){
        return 0;
    }

    return a.events
        .filter(
            event =>
                event.type ===
                    type &&
                event.team ===
                    team
        )
        .length;

}


function s22CountAny(types,team="own"){

    const a =
        s22Analytics();

    if(!a){
        return 0;
    }

    return a.events
        .filter(
            event =>
                types.includes(
                    event.type
                ) &&
                event.team ===
                    team
        )
        .length;

}


function s22PossessionStats(){

    const a =
        s22Analytics();

    if(!a){
        return {
            own:
                0,
            opp:
                0
        };
    }

    let own =
        0;

    let opp =
        0;

    a.possessionSegments.forEach(
        segment => {

            const duration =
                Math.max(
                    0,
                    Number(
                        segment.end ||
                        0
                    ) -
                    Number(
                        segment.start ||
                        0
                    )
                );

            if(
                segment.team ===
                "own"
            ){
                own +=
                    duration;
            }else if(
                segment.team ===
                "opp"
            ){
                opp +=
                    duration;
            }

        }
    );

    /*
        Åben possession tælles frem til nuværende videotid.
    */
    if(
        s22State.possessionTeam &&
        s22State.possessionStartedAt != null
    ){

        const video =
            document.getElementById(
                "s22Video"
            );

        const current =
            video
                ? video.currentTime
                : s22State.possessionStartedAt;

        const duration =
            Math.max(
                0,
                current -
                s22State.possessionStartedAt
            );

        if(
            s22State.possessionTeam ===
            "own"
        ){
            own +=
                duration;
        }else{
            opp +=
                duration;
        }

    }

    const total =
        own +
        opp;

    return total
        ? {
            own:
                own /
                total *
                100,
            opp:
                opp /
                total *
                100
        }
        : {
            own:
                0,
            opp:
                0
        };

}


function s22EventLabel(type){

    return (
        s22EventTypes[
            type
        ]
            ?.label ||
        type ||
        "Event"
    );

}


/* =========================================================
   V22 VIDEO LOADING
========================================================= */

async function s22LoadVideo(){

    const project =
        s22CurrentProject();

    const stage =
        document.getElementById(
            "s22VideoStage"
        );

    if(
        !project ||
        !stage
    ){
        return;
    }

    if(
        s22State.objectUrl
    ){

        try{
            URL.revokeObjectURL(
                s22State.objectUrl
            );
        }catch(_){}

        s22State.objectUrl =
            "";

    }

    const source =
        project.matchVideo;

    if(!source){

        stage.innerHTML = `
            <div
                style="
                    width:100%;
                    height:100%;
                    display:grid;
                    place-items:center;
                    text-align:center;
                    color:#7c897f;
                    font-size:8px;
                "
            >
                Ingen hel kampvideo på dette projekt endnu.<br>
                Gå til VIDEO og importér kampen først.
            </div>
        `;

        return;
    }

    let src =
        "";

    if(
        source.sourceType ===
        "local"
    ){

        const stored =
            await s15GetBlob(
                source.mediaId
            );

        if(
            stored?.blob
        ){

            src =
                URL.createObjectURL(
                    stored.blob
                );

            s22State.objectUrl =
                src;

        }

    }else{

        src =
            source.url ||
            "";

    }

    if(!src){

        stage.innerHTML = `
            <div
                style="
                    width:100%;
                    height:100%;
                    display:grid;
                    place-items:center;
                    color:#7c897f;
                    font-size:8px;
                "
            >
                Videoen kunne ikke findes på denne enhed.
            </div>
        `;

        return;
    }

    stage.innerHTML = `
        <video
            id="s22Video"
            src="${
                s13Esc(
                    src
                )
            }"
            controls
            preload="metadata"
            playsinline
        ></video>
    `;

    const video =
        document.getElementById(
            "s22Video"
        );

    video?.addEventListener(
        "loadedmetadata",
        () => {

            s22RenderTimeline();

            s22UpdateDataPanels();

        }
    );

    video?.addEventListener(
        "timeupdate",
        () => {

            s22UpdatePlayhead();

            const label =
                document.getElementById(
                    "s22CurrentTime"
                );

            if(label){

                label.textContent =
                    s22FormatTime(
                        video.currentTime
                    );

            }

        }
    );

}


/* =========================================================
   V22 MANUAL EVENT TAGGING
========================================================= */

function s22SelectedTeam(){

    const a =
        s22Analytics();

    return (
        a?.selectedTeam ||
        "own"
    );

}


function s22SetSelectedTeam(team){

    const a =
        s22Analytics();

    if(!a){
        return;
    }

    a.selectedTeam =
        team;

    s13Save();

    s22RenderTeamToggle();

}


function s22CreateEvent(type){

    const project =
        s22CurrentProject();

    const a =
        s22Analytics();

    const video =
        document.getElementById(
            "s22Video"
        );

    if(
        !project ||
        !a ||
        !video
    ){
        return;
    }

    const time =
        Number(
            video.currentTime ||
            0
        );

    const team =
        s22SelectedTeam();

    let outcome =
        "";

    let note =
        "";

    let playerId =
        "";

    if(
        type ===
        "shot"
    ){

        outcome =
            window.prompt(
                "Skudresultat: goal / on_target / off_target / blocked",
                "on_target"
            ) ||
            "on_target";

        if(
            outcome ===
            "goal"
        ){
            type =
                "goal";
        }

    }else if(
        type ===
        "duel"
    ){

        outcome =
            window.prompt(
                "Duel: won / lost",
                "won"
            ) ||
            "";

    }else if(
        type ===
        "counterpress"
    ){

        outcome =
            window.prompt(
                "Genpres: won / escaped",
                "won"
            ) ||
            "";

    }else if(
        type ===
        "pass" ||
        type ===
        "progressive_pass"
    ){

        outcome =
            window.prompt(
                "Aflevering: complete / incomplete",
                "complete"
            ) ||
            "";

    }else if(
        type ===
        "note"
    ){

        note =
            window.prompt(
                "Observation:",
                ""
            ) ||
            "";

    }

    const playerName =
        window.prompt(
            "Spiller (valgfrit):",
            ""
        );

    if(
        playerName
    ){

        const player =
            s13Players()
                .find(
                    p =>
                        String(
                            p.name ||
                            ""
                        )
                            .trim()
                            .toLowerCase() ===
                        String(
                            playerName
                        )
                            .trim()
                            .toLowerCase()
                );

        playerId =
            player?.id ||
            "";

    }

    const point =
        s22State.pitchPoint;

    const event = {

        id:
            s13Id(
                "match-event"
            ),

        type,

        team,

        time,

        start:
            Math.max(
                0,
                time -
                6
            ),

        end:
            time +
            7,

        x:
            point?.x ??
            null,

        y:
            point?.y ??
            null,

        zone:
            point
                ? s22ZoneFromPoint(
                    point.x,
                    point.y
                )
                : "",

        outcome,

        note,

        playerId,

        source:
            "manual",

        confidence:
            1,

        createdAt:
            new Date().toISOString()

    };

    a.events.push(
        event
    );

    a.updatedAt =
        new Date().toISOString();

    s13Save();

    s22State.selectedEventId =
        event.id;

    s22RenderDataHub(
        document.getElementById(
            "s13content"
        )
    );

    setTimeout(
        () => {

            const v =
                document.getElementById(
                    "s22Video"
                );

            if(v){
                v.currentTime =
                    time;
            }

        },
        30
    );

}


function s22DeleteEvent(eventId){

    const a =
        s22Analytics();

    if(!a){
        return;
    }

    a.events =
        a.events.filter(
            event =>
                event.id !==
                eventId
        );

    if(
        s22State.selectedEventId ===
        eventId
    ){
        s22State.selectedEventId =
            null;
    }

    s13Save();

    s22RenderDataHub(
        document.getElementById(
            "s13content"
        )
    );

}


/* =========================================================
   V22 POSSESSION LOGGER
========================================================= */

function s22SwitchPossession(team){

    const a =
        s22Analytics();

    const video =
        document.getElementById(
            "s22Video"
        );

    if(
        !a ||
        !video
    ){
        return;
    }

    const now =
        Number(
            video.currentTime ||
            0
        );

    if(
        s22State.possessionTeam &&
        s22State.possessionStartedAt != null
    ){

        if(
            now >
            s22State.possessionStartedAt
        ){

            a.possessionSegments.push({

                id:
                    s13Id(
                        "possession"
                    ),

                team:
                    s22State.possessionTeam,

                start:
                    s22State.possessionStartedAt,

                end:
                    now,

                source:
                    "manual"

            });

        }

    }

    s22State.possessionTeam =
        team;

    s22State.possessionStartedAt =
        now;

    s13Save();

    s22UpdateDataPanels();

}


function s22StopPossession(){

    const a =
        s22Analytics();

    const video =
        document.getElementById(
            "s22Video"
        );

    if(
        !a ||
        !video ||
        !s22State.possessionTeam ||
        s22State.possessionStartedAt == null
    ){
        return;
    }

    const now =
        Number(
            video.currentTime ||
            0
        );

    if(
        now >
        s22State.possessionStartedAt
    ){

        a.possessionSegments.push({

            id:
                s13Id(
                    "possession"
                ),

            team:
                s22State.possessionTeam,

            start:
                s22State.possessionStartedAt,

            end:
                now,

            source:
                "manual"

        });

    }

    s22State.possessionTeam =
        null;

    s22State.possessionStartedAt =
        null;

    s13Save();

    s22UpdateDataPanels();

}


/* =========================================================
   V22 STATISTICS
========================================================= */

function s22Stats(){

    const ownShots =
        s22CountAny(
            [
                "shot",
                "goal"
            ],
            "own"
        );

    const oppShots =
        s22CountAny(
            [
                "shot",
                "goal"
            ],
            "opp"
        );

    const ownGoals =
        s22Count(
            "goal",
            "own"
        );

    const oppGoals =
        s22Count(
            "goal",
            "opp"
        );

    const ownOnTarget =
        s22Analytics()
            ?.events
            .filter(
                event =>
                    event.team ===
                        "own" &&
                    (
                        event.type ===
                            "goal" ||
                        (
                            event.type ===
                                "shot" &&
                            event.outcome ===
                                "on_target"
                        )
                    )
            )
            .length ||
        0;

    const oppOnTarget =
        s22Analytics()
            ?.events
            .filter(
                event =>
                    event.team ===
                        "opp" &&
                    (
                        event.type ===
                            "goal" ||
                        (
                            event.type ===
                                "shot" &&
                            event.outcome ===
                                "on_target"
                        )
                    )
            )
            .length ||
        0;

    const ownDuelWon =
        s22Analytics()
            ?.events
            .filter(
                event =>
                    event.team ===
                        "own" &&
                    event.type ===
                        "duel" &&
                    event.outcome ===
                        "won"
            )
            .length ||
        0;

    const ownDuels =
        s22Count(
            "duel",
            "own"
        );

    const oppDuelWon =
        s22Analytics()
            ?.events
            .filter(
                event =>
                    event.team ===
                        "opp" &&
                    event.type ===
                        "duel" &&
                    event.outcome ===
                        "won"
            )
            .length ||
        0;

    const oppDuels =
        s22Count(
            "duel",
            "opp"
        );

    const possession =
        s22PossessionStats();

    return {

        possession,

        ownShots,
        oppShots,

        ownGoals,
        oppGoals,

        ownOnTarget,
        oppOnTarget,

        ownCorners:
            s22Count(
                "corner",
                "own"
            ),

        oppCorners:
            s22Count(
                "corner",
                "opp"
            ),

        ownBallLoss:
            s22Count(
                "ball_loss",
                "own"
            ),

        oppBallLoss:
            s22Count(
                "ball_loss",
                "opp"
            ),

        ownRecoveries:
            s22Count(
                "recovery",
                "own"
            ),

        oppRecoveries:
            s22Count(
                "recovery",
                "opp"
            ),

        ownCounterpress:
            s22Analytics()
                ?.events
                .filter(
                    event =>
                        event.team ===
                            "own" &&
                        event.type ===
                            "counterpress" &&
                        event.outcome !==
                            "escaped"
                )
                .length ||
            0,

        oppCounterpress:
            s22Analytics()
                ?.events
                .filter(
                    event =>
                        event.team ===
                            "opp" &&
                        event.type ===
                            "counterpress" &&
                        event.outcome !==
                            "escaped"
                )
                .length ||
            0,

        ownDuelPct:
            ownDuels
                ? Math.round(
                    ownDuelWon /
                    ownDuels *
                    100
                )
                : 0,

        oppDuelPct:
            oppDuels
                ? Math.round(
                    oppDuelWon /
                    oppDuels *
                    100
                )
                : 0

    };

}


/* =========================================================
   V22 TIMELINE
========================================================= */

function s22RenderTimeline(){

    const timeline =
        document.getElementById(
            "s22Timeline"
        );

    const video =
        document.getElementById(
            "s22Video"
        );

    if(
        !timeline ||
        !video
    ){
        return;
    }

    const duration =
        Number(
            video.duration ||
            1
        );

    const events =
        s22FilteredEvents();

    timeline.innerHTML = `
        ${
            events
                .map(
                    event => `
                        <div
                            class="
                                s22-event-dot
                                ${
                                    event.team ===
                                    "opp"
                                        ? "opp"
                                        : ""
                                }
                            "
                            data-s22-dot="${
                                s13Esc(
                                    event.id
                                )
                            }"
                            title="${
                                s13Esc(
                                    s22EventLabel(
                                        event.type
                                    )
                                )
                            } · ${
                                s22FormatTime(
                                    event.time
                                )
                            }"
                            style="
                                left:${
                                    Math.max(
                                        0,
                                        Math.min(
                                            100,
                                            event.time /
                                            duration *
                                            100
                                        )
                                    )
                                }%;
                            "
                        ></div>
                    `
                )
                .join(
                    ""
                )
        }

        <div
            id="s22Playhead"
            class="s22-playhead"
            style="
                left:${
                    Math.max(
                        0,
                        Math.min(
                            100,
                            video.currentTime /
                            duration *
                            100
                        )
                    )
                }%;
            "
        ></div>
    `;

    timeline
        .querySelectorAll(
            "[data-s22-dot]"
        )
        .forEach(
            dot => {

                dot.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();

                        const item =
                            s22Analytics()
                                ?.events
                                .find(
                                    e =>
                                        e.id ===
                                        dot.dataset
                                            .s22Dot
                                );

                        if(item){

                            s22State.selectedEventId =
                                item.id;

                            video.currentTime =
                                item.start ??
                                item.time;

                            video.play();

                            s22RenderEventList();

                        }

                    }
                );

            }
        );

    timeline.addEventListener(
        "click",
        event => {

            if(
                event.target.closest(
                    "[data-s22-dot]"
                )
            ){
                return;
            }

            const rect =
                timeline.getBoundingClientRect();

            const pct =
                Math.max(
                    0,
                    Math.min(
                        1,
                        (
                            event.clientX -
                            rect.left
                        ) /
                        rect.width
                    )
                );

            video.currentTime =
                pct *
                duration;

        }
    );

}


function s22UpdatePlayhead(){

    const video =
        document.getElementById(
            "s22Video"
        );

    const playhead =
        document.getElementById(
            "s22Playhead"
        );

    if(
        !video ||
        !playhead ||
        !video.duration
    ){
        return;
    }

    playhead.style.left =
        (
            video.currentTime /
            video.duration *
            100
        ) +
        "%";

}


/* =========================================================
   V22 SHOT MAP
========================================================= */

function s22ShotMapHtml(){

    const events =
        s22Analytics()
            ?.events
            .filter(
                event =>
                    (
                        event.type ===
                            "shot" ||
                        event.type ===
                            "goal"
                    ) &&
                    event.x != null &&
                    event.y != null
            ) ||
        [];

    return `
        <div
            id="s22Pitch"
            class="s22-pitch"
        >

            <div class="s22-zone-grid">
                ${
                    Array.from({
                        length:
                            15
                    })
                        .map(
                            () =>
                                "<span></span>"
                        )
                        .join(
                            ""
                        )
                }
            </div>

            ${
                events
                    .map(
                        event => `
                            <button
                                type="button"
                                class="
                                    s22-shot
                                    ${
                                        event.type ===
                                        "goal"
                                            ? "goal"
                                            : ""
                                    }
                                    ${
                                        event.team ===
                                        "opp"
                                            ? "opp"
                                            : ""
                                    }
                                "
                                data-shot-event="${
                                    s13Esc(
                                        event.id
                                    )
                                }"
                                style="
                                    left:${
                                        event.x *
                                        100
                                    }%;
                                    top:${
                                        event.y *
                                        100
                                    }%;
                                "
                                title="${
                                    s13Esc(
                                        s22EventLabel(
                                            event.type
                                        )
                                    )
                                } · ${
                                    s22FormatTime(
                                        event.time
                                    )
                                }"
                            ></button>
                        `
                    )
                    .join(
                        ""
                    )
            }

            ${
                s22State.pitchPoint
                    ? `
                        <div
                            class="s22-pitch-point"
                            style="
                                left:${
                                    s22State.pitchPoint.x *
                                    100
                                }%;
                                top:${
                                    s22State.pitchPoint.y *
                                    100
                                }%;
                            "
                        ></div>
                    `
                    : ""
            }

        </div>
    `;

}


/* =========================================================
   V22 EVENT LIST
========================================================= */

function s22RenderEventList(){

    const list =
        document.getElementById(
            "s22EventList"
        );

    if(!list){
        return;
    }

    const events =
        s22FilteredEvents();

    list.innerHTML =
        events.length
            ? events
                .map(
                    event => `
                        <div
                            class="
                                s22-event-row
                                ${
                                    event.id ===
                                    s22State.selectedEventId
                                        ? "active"
                                        : ""
                                }
                            "
                            data-s22-event="${
                                s13Esc(
                                    event.id
                                )
                            }"
                        >

                            <div class="s22-event-time">
                                ${
                                    s22FormatTime(
                                        event.time
                                    )
                                }
                            </div>

                            <div class="s22-event-type">
                                ${
                                    s13Esc(
                                        s22EventLabel(
                                            event.type
                                        )
                                    )
                                }
                            </div>

                            <div class="s13mut">
                                ${
                                    event.team ===
                                    "own"
                                        ? s13Esc(
                                            s22OwnTeamName()
                                        )
                                        : s13Esc(
                                            s22OpponentName(
                                                s22CurrentProject()
                                            )
                                        )
                                }

                                ${
                                    event.outcome
                                        ? ` · ${s13Esc(event.outcome)}`
                                        : ""
                                }

                                ${
                                    event.zone
                                        ? ` · ${s13Esc(event.zone)}`
                                        : ""
                                }

                                ${
                                    event.note
                                        ? ` · ${s13Esc(event.note)}`
                                        : ""
                                }
                            </div>

                            <div
                                style="
                                    display:flex;
                                    align-items:center;
                                    justify-content:flex-end;
                                    gap:5px;
                                "
                            >
                                <span class="s22-confidence">
                                    ${
                                        Math.round(
                                            Number(
                                                event.confidence ??
                                                1
                                            ) *
                                            100
                                        )
                                    }%
                                </span>

                                <button
                                    type="button"
                                    class="s13btn"
                                    data-event-more="${
                                        s13Esc(
                                            event.id
                                        )
                                    }"
                                >
                                    ⋯
                                </button>
                            </div>

                        </div>
                    `
                )
                .join(
                    ""
                )
            : `
                <div class="s13mut">
                    Ingen events matcher filtrene.
                </div>
            `;

    list
        .querySelectorAll(
            "[data-s22-event]"
        )
        .forEach(
            row => {

                row.addEventListener(
                    "click",
                    event => {

                        if(
                            event.target.closest(
                                "[data-event-more]"
                            )
                        ){
                            return;
                        }

                        const item =
                            s22Analytics()
                                ?.events
                                .find(
                                    e =>
                                        e.id ===
                                        row.dataset
                                            .s22Event
                                );

                        if(!item){
                            return;
                        }

                        s22State.selectedEventId =
                            item.id;

                        const video =
                            document.getElementById(
                                "s22Video"
                            );

                        if(video){

                            video.currentTime =
                                item.start ??
                                item.time;

                            video.play();

                        }

                        s22RenderEventList();

                    }
                );

            }
        );

    list
        .querySelectorAll(
            "[data-event-more]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();

                        const item =
                            s22Analytics()
                                ?.events
                                .find(
                                    e =>
                                        e.id ===
                                        button.dataset
                                            .eventMore
                                );

                        if(!item){
                            return;
                        }

                        const action =
                            window.prompt(
                                "Skriv: clip / delete / note",
                                "clip"
                            );

                        if(
                            action ===
                            "delete"
                        ){

                            s22DeleteEvent(
                                item.id
                            );

                        }else if(
                            action ===
                            "note"
                        ){

                            item.note =
                                window.prompt(
                                    "Note:",
                                    item.note ||
                                    ""
                                ) ??
                                item.note;

                            s13Save();

                            s22RenderEventList();

                        }else if(
                            action ===
                            "clip"
                        ){

                            s22CreateClipFromEvent(
                                item
                            );

                        }

                    }
                );

            }
        );

}


/* =========================================================
   V22 CREATE NORMAL VIDEO CLIP FROM DATA EVENT
========================================================= */

function s22CreateClipFromEvent(event){

    const project =
        s22CurrentProject();

    if(
        !project ||
        !event
    ){
        return;
    }

    project.clips =
        Array.isArray(
            project.clips
        )
            ? project.clips
            : [];

    const existing =
        project.clips.find(
            clip =>
                clip.analyticsEventId ===
                event.id
        );

    if(existing){

        s18State.projectId =
            project.id;

        s18State.clipId =
            existing.id;

        s13Tab =
            "videos";

        s13Render();

        return;

    }

    const clip = {

        id:
            s13Id(
                "analysis-clip"
            ),

        projectId:
            project.id,

        analyticsEventId:
            event.id,

        title:
            `${s22EventLabel(event.type)} · ${s22FormatTime(event.time)}`,

        startSec:
            Number(
                event.start ??
                Math.max(
                    0,
                    event.time -
                    6
                )
            ),

        endSec:
            Number(
                event.end ??
                (
                    event.time +
                    7
                )
            ),

        playerId:
            event.playerId ||
            "",

        attributeId:
            "",

        phase:
            event.type.includes(
                "transition"
            )
                ? (
                    event.type ===
                    "transition_attack"
                        ? "Offensiv omstilling"
                        : "Defensiv omstilling"
                )
                : "Med bold",

        outcome:
            event.team ===
            "own"
                ? "Udvikling"
                : "Korrigering",

        tags:
            [
                event.type,
                event.zone,
                event.source ===
                    "ai"
                    ? "AI"
                    : "MANUEL"
            ]
                .filter(
                    Boolean
                )
                .join(
                    ", "
                ),

        observation:
            event.note ||
            "",

        coachingQuestion:
            "",

        action:
            "",

        showInMeeting:
            false,

        annotations:
            [],

        createdAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()

    };

    project.clips.push(
        clip
    );

    s13Save();

    visNotification?.(
        "Eventet er oprettet som et normalt videoklip."
    );

}


/* =========================================================
   V22 FILTER / TEAM UI
========================================================= */

function s22RenderTeamToggle(){

    const own =
        document.getElementById(
            "s22TeamOwn"
        );

    const opp =
        document.getElementById(
            "s22TeamOpp"
        );

    const selected =
        s22SelectedTeam();

    own?.classList.toggle(
        "active",
        selected ===
        "own"
    );

    opp?.classList.toggle(
        "active",
        selected ===
        "opp"
    );

}


/* =========================================================
   V22 AI BACKEND INTEGRATION
========================================================= */

function s22AiEndpoint(){

    return String(
        localStorage.getItem(
            "start11AiAnalysisUrl"
        ) ||
        ""
    )
        .replace(
            /\/+$/,
            ""
        );

}


function s22SetAiEndpoint(){

    const current =
        s22AiEndpoint();

    const next =
        window.prompt(
            "AI backend URL\nFx http://localhost:8000",
            current ||
            "http://localhost:8000"
        );

    if(
        next ===
        null
    ){
        return;
    }

    localStorage.setItem(
        "start11AiAnalysisUrl",
        next.trim()
    );

    visNotification?.(
        "AI endpoint gemt."
    );

    s22UpdateAiBox();

}


async function s22StartAiAnalysis(){

    const endpoint =
        s22AiEndpoint();

    const project =
        s22CurrentProject();

    const a =
        s22Analytics();

    if(
        !endpoint
    ){

        visNotification?.(
            "Sæt først AI backend URL."
        );

        s22SetAiEndpoint();

        return;
    }

    if(
        !project ||
        !project.matchVideo
    ){

        visNotification?.(
            "Projektet mangler en hel kampvideo."
        );

        return;
    }

    const run = {

        id:
            s13Id(
                "ai-run"
            ),

        status:
            "uploading",

        endpoint,

        startedAt:
            new Date().toISOString(),

        jobId:
            "",

        error:
            ""

    };

    a.aiRuns.push(
        run
    );

    a.status =
        "uploading";

    s13Save();

    s22UpdateAiBox();

    try{

        let response;

        if(
            project.matchVideo.sourceType ===
            "local"
        ){

            const stored =
                await s15GetBlob(
                    project.matchVideo.mediaId
                );

            if(
                !stored?.blob
            ){
                throw new Error(
                    "Den lokale videofil kunne ikke læses."
                );
            }

            const form =
                new FormData();

            form.append(
                "file",
                stored.blob,
                project.matchVideo.name ||
                "match.mp4"
            );

            form.append(
                "project_id",
                project.id
            );

            form.append(
                "project_title",
                project.title ||
                ""
            );

            form.append(
                "own_team",
                s22OwnTeamName()
            );

            form.append(
                "opponent",
                s22OpponentName(
                    project
                )
            );

            response =
                await fetch(
                    `${endpoint}/analyze`,
                    {
                        method:
                            "POST",
                        body:
                            form
                    }
                );

        }else{

            response =
                await fetch(
                    `${endpoint}/analyze-url`,
                    {
                        method:
                            "POST",
                        headers:{
                            "Content-Type":
                                "application/json"
                        },
                        body:
                            JSON.stringify({
                                project_id:
                                    project.id,
                                project_title:
                                    project.title ||
                                    "",
                                video_url:
                                    project.matchVideo.url ||
                                    "",
                                own_team:
                                    s22OwnTeamName(),
                                opponent:
                                    s22OpponentName(
                                        project
                                    )
                            })
                    }
                );

        }

        if(
            !response.ok
        ){

            throw new Error(
                `Backend svarede ${response.status}`
            );

        }

        const result =
            await response.json();

        run.jobId =
            result.job_id ||
            result.id ||
            "";

        run.status =
            result.status ||
            "queued";

        a.status =
            run.status;

        s13Save();

        if(
            run.jobId
        ){

            s22PollAiJob(
                run.jobId,
                run.id
            );

        }else if(
            result.events
        ){

            s22ApplyAiResult(
                result,
                run.id
            );

        }else{

            throw new Error(
                "Backend returnerede intet job-id eller analyse."
            );

        }

    }catch(error){

        console.error(
            error
        );

        run.status =
            "error";

        run.error =
            error.message ||
            String(
                error
            );

        a.status =
            "error";

        s13Save();

        s22UpdateAiBox();

        visNotification?.(
            "AI-analysen kunne ikke startes."
        );

    }

}


function s22PollAiJob(jobId,runId){

    clearInterval(
        s22State.aiPollTimer
    );

    const endpoint =
        s22AiEndpoint();

    const a =
        s22Analytics();

    if(
        !endpoint ||
        !a
    ){
        return;
    }

    s22State.aiPollTimer =
        setInterval(
            async () => {

                try{

                    const response =
                        await fetch(
                            `${endpoint}/jobs/${encodeURIComponent(jobId)}`
                        );

                    if(
                        !response.ok
                    ){
                        return;
                    }

                    const result =
                        await response.json();

                    const run =
                        a.aiRuns.find(
                            item =>
                                item.id ===
                                runId
                        );

                    if(run){

                        run.status =
                            result.status ||
                            run.status;

                        run.progress =
                            result.progress ??
                            run.progress;

                    }

                    a.status =
                        result.status ||
                        a.status;

                    s13Save();

                    s22UpdateAiBox();

                    if(
                        result.status ===
                        "completed"
                    ){

                        clearInterval(
                            s22State.aiPollTimer
                        );

                        s22ApplyAiResult(
                            result,
                            runId
                        );

                    }else if(
                        result.status ===
                        "error" ||
                        result.status ===
                        "failed"
                    ){

                        clearInterval(
                            s22State.aiPollTimer
                        );

                        if(run){

                            run.error =
                                result.error ||
                                "Ukendt backend-fejl";

                        }

                        a.status =
                            "error";

                        s13Save();

                        s22UpdateAiBox();

                    }

                }catch(error){

                    console.warn(
                        "AI poll:",
                        error
                    );

                }

            },
            2500
        );

}


function s22ApplyAiResult(result,runId){

    const a =
        s22Analytics();

    if(!a){
        return;
    }

    const incomingEvents =
        Array.isArray(
            result.events
        )
            ? result.events
            : [];

    incomingEvents.forEach(
        raw => {

            const time =
                Number(
                    raw.time ??
                    raw.timestamp ??
                    raw.start ??
                    0
                );

            const event = {

                id:
                    s13Id(
                        "match-event"
                    ),

                type:
                    raw.type ||
                    "note",

                team:
                    raw.team ||
                    "own",

                time,

                start:
                    Number(
                        raw.start ??
                        Math.max(
                            0,
                            time -
                            6
                        )
                    ),

                end:
                    Number(
                        raw.end ??
                        (
                            time +
                            7
                        )
                    ),

                x:
                    raw.x == null
                        ? null
                        : Number(
                            raw.x
                        ),

                y:
                    raw.y == null
                        ? null
                        : Number(
                            raw.y
                        ),

                zone:
                    raw.zone ||
                    (
                        raw.x != null &&
                        raw.y != null
                            ? s22ZoneFromPoint(
                                Number(
                                    raw.x
                                ),
                                Number(
                                    raw.y
                                )
                            )
                            : ""
                    ),

                outcome:
                    raw.outcome ||
                    "",

                note:
                    raw.note ||
                    "",

                playerId:
                    raw.playerId ||
                    raw.player_id ||
                    "",

                playerLabel:
                    raw.player ||
                    raw.player_label ||
                    "",

                source:
                    "ai",

                confidence:
                    Number(
                        raw.confidence ??
                        .5
                    ),

                createdAt:
                    new Date().toISOString()

            };

            a.events.push(
                event
            );

        }
    );

    if(
        Array.isArray(
            result.possession_segments
        )
    ){

        result.possession_segments
            .forEach(
                segment => {

                    a.possessionSegments.push({

                        id:
                            s13Id(
                                "possession"
                            ),

                        team:
                            segment.team ||
                            "own",

                        start:
                            Number(
                                segment.start ||
                                0
                            ),

                        end:
                            Number(
                                segment.end ||
                                0
                            ),

                        source:
                            "ai",

                        confidence:
                            Number(
                                segment.confidence ??
                                .5
                            )

                    });

                }
            );

    }

    a.aiSummary =
        result.summary ||
        a.aiSummary ||
        null;

    a.status =
        "completed";

    const run =
        a.aiRuns.find(
            item =>
                item.id ===
                runId
        );

    if(run){

        run.status =
            "completed";

        run.completedAt =
            new Date().toISOString();

        run.eventCount =
            incomingEvents.length;

    }

    a.updatedAt =
        new Date().toISOString();

    s13Save();

    s22RenderDataHub(
        document.getElementById(
            "s13content"
        )
    );

    visNotification?.(
        `AI-analyse færdig · ${incomingEvents.length} events fundet.`
    );

}


function s22UpdateAiBox(){

    const box =
        document.getElementById(
            "s22AiStatus"
        );

    if(!box){
        return;
    }

    const a =
        s22Analytics();

    const latest =
        [
            ...(
                a?.aiRuns ||
                []
            )
        ]
            .reverse()[0];

    const endpoint =
        s22AiEndpoint();

    box.innerHTML = `
        <div class="s22-ai-box">

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    gap:8px;
                    align-items:flex-start;
                "
            >

                <div>
                    <div class="s20label">
                        AI MATCH ANALYSIS
                    </div>

                    <div
                        class="s13title"
                        style="margin-top:4px;"
                    >
                        ${
                            latest
                                ? s13Esc(
                                    latest.status ||
                                    "—"
                                )
                                : "Ikke kørt"
                        }
                    </div>

                    <div class="s13mut">
                        ${
                            endpoint
                                ? s13Esc(
                                    endpoint
                                )
                                : "Backend endpoint er ikke sat."
                        }
                    </div>

                    ${
                        latest?.progress != null
                            ? `
                                <div
                                    class="s20-progress"
                                    style="margin-top:8px;"
                                >
                                    <span
                                        style="
                                            width:${
                                                Math.max(
                                                    0,
                                                    Math.min(
                                                        100,
                                                        Number(
                                                            latest.progress
                                                        )
                                                    )
                                                )
                                            }%;
                                        "
                                    ></span>
                                </div>
                            `
                            : ""
                    }

                    ${
                        latest?.error
                            ? `
                                <div
                                    class="s13mut"
                                    style="
                                        margin-top:6px;
                                        color:#ff7b7b;
                                    "
                                >
                                    ${
                                        s13Esc(
                                            latest.error
                                        )
                                    }
                                </div>
                            `
                            : ""
                    }
                </div>

                <div
                    style="
                        display:flex;
                        gap:5px;
                        flex-wrap:wrap;
                        justify-content:flex-end;
                    "
                >
                    <button
                        type="button"
                        id="s22SetEndpoint"
                        class="s13btn"
                    >
                        BACKEND
                    </button>

                    <button
                        type="button"
                        id="s22RunAi"
                        class="s13btn primary"
                    >
                        START AI ANALYSE
                    </button>
                </div>

            </div>

        </div>
    `;

    document.getElementById(
        "s22SetEndpoint"
    )
        ?.addEventListener(
            "click",
            s22SetAiEndpoint
        );

    document.getElementById(
        "s22RunAi"
    )
        ?.addEventListener(
            "click",
            s22StartAiAnalysis
        );

}


/* =========================================================
   V22 DATA PANELS
========================================================= */

function s22UpdateDataPanels(){

    const stats =
        s22Stats();

    const ownPos =
        document.getElementById(
            "s22PosOwn"
        );

    const oppPos =
        document.getElementById(
            "s22PosOpp"
        );

    if(
        ownPos &&
        oppPos
    ){

        ownPos.style.width =
            `${stats.possession.own}%`;

        oppPos.style.width =
            `${stats.possession.opp}%`;

        ownPos.textContent =
            `${stats.possession.own.toFixed(0)}%`;

        oppPos.textContent =
            `${stats.possession.opp.toFixed(0)}%`;

    }

}


/* =========================================================
   V22 STAT CARD
========================================================= */

function s22StatCard(label,own,opp,type){

    return `
        <div
            class="
                s22-stat
                ${
                    s22State.eventFilter ===
                    type
                        ? "active"
                        : ""
                }
            "
            data-stat-type="${
                s13Esc(
                    type
                )
            }"
        >

            <div class="s22-stat-label">
                ${
                    s13Esc(
                        label
                    )
                }
            </div>

            <div
                style="
                    display:grid;
                    grid-template-columns:1fr 1fr;
                    gap:8px;
                    margin-top:5px;
                "
            >
                <div>
                    <div class="s22-stat-value">
                        ${own}
                    </div>
                    <div class="s13mut">
                        Eget
                    </div>
                </div>

                <div>
                    <div class="s22-stat-value">
                        ${opp}
                    </div>
                    <div class="s13mut">
                        Modstander
                    </div>
                </div>
            </div>

        </div>
    `;

}


/* =========================================================
   V22 MAIN HUB
========================================================= */

function s22RenderDataHub(target){

    s22EnsureData();

    const projects =
        s22Projects();

    if(
        !projects.length
    ){

        target.innerHTML = `
            <section class="s13panel">
                <div
                    style="
                        min-height:420px;
                        display:grid;
                        place-items:center;
                        text-align:center;
                    "
                >
                    <div>
                        <h2>MATCH DATA HUB</h2>
                        <p class="s13mut">
                            Opret først et Video Analysis-projekt og importér en hel kamp.
                        </p>
                        <button
                            type="button"
                            id="s22GoVideo"
                            class="s13btn primary"
                        >
                            GÅ TIL VIDEO
                        </button>
                    </div>
                </div>
            </section>
        `;

        document.getElementById(
            "s22GoVideo"
        )
            ?.addEventListener(
                "click",
                () => {

                    s13Tab =
                        "videos";

                    s13Render();

                }
            );

        return;
    }

    const project =
        s22CurrentProject();

    const a =
        s22Analytics();

    const stats =
        s22Stats();

    const events =
        s22FilteredEvents();

    const own =
        s22OwnTeamName();

    const opp =
        s22OpponentName(
            project
        );

    target.innerHTML = `

        <section class="s13panel">

            <div class="s13head">

                <div>
                    <strong>MATCH DATA HUB</strong>
                    <div class="s13mut">
                        Wyscout-lignende kampdata koblet direkte til Video Analysis Studio.
                    </div>
                </div>

                <div
                    style="
                        display:flex;
                        gap:6px;
                        flex-wrap:wrap;
                    "
                >

                    <select
                        id="s22ProjectSelect"
                        class="s13sel"
                        style="min-width:220px;"
                    >
                        ${
                            projects
                                .map(
                                    item => `
                                        <option
                                            value="${
                                                s13Esc(
                                                    item.id
                                                )
                                            }"
                                            ${
                                                item.id ===
                                                project.id
                                                    ? "selected"
                                                    : ""
                                            }
                                        >
                                            ${
                                                s13Esc(
                                                    item.title ||
                                                    "Kamp"
                                                )
                                            }
                                        </option>
                                    `
                                )
                                .join(
                                    ""
                                )
                        }
                    </select>

                    <button
                        type="button"
                        id="s22OpenVideoStudio"
                        class="s13btn"
                    >
                        MANUEL VIDEOANALYSE
                    </button>

                </div>

            </div>


            <div class="s20metrics">

                <div class="s20metric">
                    <span>EVENTS</span>
                    <strong>
                        ${
                            a.events.length
                        }
                    </strong>
                </div>

                <div class="s20metric">
                    <span>AI EVENTS</span>
                    <strong>
                        ${
                            a.events.filter(
                                event =>
                                    event.source ===
                                    "ai"
                            ).length
                        }
                    </strong>
                </div>

                <div class="s20metric">
                    <span>NORMALE VIDEOCLIPS</span>
                    <strong>
                        ${
                            project.clips?.length ||
                            0
                        }
                    </strong>
                </div>

            </div>

        </section>


        <div
            id="s22AiStatus"
            style="margin-top:10px;"
        ></div>


        <section
            class="s13panel"
            style="margin-top:10px;"
        >

            <div class="s13head">

                <div>
                    <strong>MATCH OVERVIEW</strong>
                    <div class="s13mut">
                        Klik på en statistik for at se situationerne.
                    </div>
                </div>

            </div>


            <div
                class="s22-possession"
                style="margin-bottom:10px;"
            >
                <div
                    id="s22PosOwn"
                    class="s22-pos-own"
                    style="
                        width:${
                            stats.possession.own
                        }%;
                    "
                >
                    ${
                        stats.possession.own.toFixed(
                            0
                        )
                    }%
                </div>

                <div
                    id="s22PosOpp"
                    class="s22-pos-opp"
                    style="
                        width:${
                            stats.possession.opp
                        }%;
                    "
                >
                    ${
                        stats.possession.opp.toFixed(
                            0
                        )
                    }%
                </div>
            </div>


            <div class="s22-stat-grid">

                ${
                    s22StatCard(
                        "Skud",
                        stats.ownShots,
                        stats.oppShots,
                        "shot"
                    )
                }

                ${
                    s22StatCard(
                        "Mål",
                        stats.ownGoals,
                        stats.oppGoals,
                        "goal"
                    )
                }

                ${
                    s22StatCard(
                        "På mål",
                        stats.ownOnTarget,
                        stats.oppOnTarget,
                        "shot"
                    )
                }

                ${
                    s22StatCard(
                        "Hjørnespark",
                        stats.ownCorners,
                        stats.oppCorners,
                        "corner"
                    )
                }

                ${
                    s22StatCard(
                        "Boldtab",
                        stats.ownBallLoss,
                        stats.oppBallLoss,
                        "ball_loss"
                    )
                }

                ${
                    s22StatCard(
                        "Bolderobringer",
                        stats.ownRecoveries,
                        stats.oppRecoveries,
                        "recovery"
                    )
                }

                ${
                    s22StatCard(
                        "Genpres vundet",
                        stats.ownCounterpress,
                        stats.oppCounterpress,
                        "counterpress"
                    )
                }

                ${
                    s22StatCard(
                        "Vundne dueller %",
                        stats.ownDuelPct,
                        stats.oppDuelPct,
                        "duel"
                    )
                }

            </div>

        </section>


        <div
            class="s22-grid"
            style="margin-top:10px;"
        >

            <div>

                <section class="s13panel">

                    <div class="s13head">

                        <div>
                            <strong>VIDEO + EVENT TAGGING</strong>
                            <div class="s13mut">
                                Manuel tagging virker fortsat, selv uden AI-backend.
                            </div>
                        </div>

                        <div class="s22-team-toggle">
                            <button
                                type="button"
                                id="s22TeamOwn"
                                class="${
                                    s22SelectedTeam() ===
                                    "own"
                                        ? "active"
                                        : ""
                                }"
                            >
                                ${
                                    s13Esc(
                                        own
                                    )
                                }
                            </button>

                            <button
                                type="button"
                                id="s22TeamOpp"
                                class="${
                                    s22SelectedTeam() ===
                                    "opp"
                                        ? "active"
                                        : ""
                                }"
                            >
                                ${
                                    s13Esc(
                                        opp
                                    )
                                }
                            </button>
                        </div>

                    </div>


                    <div
                        id="s22VideoStage"
                        class="s22-video-stage"
                    ></div>


                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            gap:8px;
                            align-items:center;
                            margin-top:8px;
                        "
                    >
                        <div class="s13mut">
                            Tid:
                            <strong id="s22CurrentTime">
                                00:00
                            </strong>
                            · klik på banen til højre for at registrere position
                        </div>

                        <div
                            style="
                                display:flex;
                                gap:5px;
                            "
                        >
                            <button
                                type="button"
                                id="s22PossOwn"
                                class="s13btn"
                            >
                                1 · EGET HOLD HAR BOLDEN
                            </button>

                            <button
                                type="button"
                                id="s22PossOpp"
                                class="s13btn"
                            >
                                2 · MODSTANDER HAR BOLDEN
                            </button>

                            <button
                                type="button"
                                id="s22PossStop"
                                class="s13btn"
                            >
                                STOP
                            </button>
                        </div>
                    </div>


                    <div
                        id="s22Timeline"
                        class="s22-event-timeline"
                    ></div>


                    <div
                        class="s22-toolbar"
                        style="margin-top:9px;"
                    >

                        ${
                            [
                                "shot",
                                "chance",
                                "ball_loss",
                                "recovery",
                                "duel",
                                "counterpress",
                                "transition_attack",
                                "transition_defence",
                                "corner",
                                "cross",
                                "progressive_pass",
                                "final_third_entry",
                                "press_break",
                                "note"
                            ]
                                .map(
                                    type => `
                                        <button
                                            type="button"
                                            class="s13btn"
                                            data-add-event="${
                                                type
                                            }"
                                        >
                                            ${
                                                s13Esc(
                                                    s22EventTypes[
                                                        type
                                                    ]
                                                        ?.short ||
                                                    type
                                                )
                                            }
                                        </button>
                                    `
                                )
                                .join(
                                    ""
                                )
                        }

                    </div>

                </section>


                <section
                    class="s13panel"
                    style="margin-top:10px;"
                >

                    <div class="s13head">

                        <div>
                            <strong>EVENTS / KLIP</strong>
                            <div class="s13mut">
                                Klik på en event for at hoppe direkte til situationen.
                            </div>
                        </div>

                    </div>


                    <div class="s22-filterbar">

                        <select
                            id="s22EventFilter"
                            class="s13sel"
                        >
                            <option value="all">
                                Alle events
                            </option>

                            ${
                                Object.entries(
                                    s22EventTypes
                                )
                                    .map(
                                        (
                                            [
                                                id,
                                                meta
                                            ]
                                        ) => `
                                            <option
                                                value="${id}"
                                                ${
                                                    s22State.eventFilter ===
                                                    id
                                                        ? "selected"
                                                        : ""
                                                }
                                            >
                                                ${
                                                    s13Esc(
                                                        meta.label
                                                    )
                                                }
                                            </option>
                                        `
                                    )
                                    .join(
                                        ""
                                    )
                            }
                        </select>

                        <select
                            id="s22TeamFilter"
                            class="s13sel"
                        >
                            <option value="all">
                                Begge hold
                            </option>

                            <option
                                value="own"
                                ${
                                    s22State.teamFilter ===
                                    "own"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Eget hold
                            </option>

                            <option
                                value="opp"
                                ${
                                    s22State.teamFilter ===
                                    "opp"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Modstander
                            </option>
                        </select>

                        <select
                            id="s22Confidence"
                            class="s13sel"
                        >
                            ${
                                [
                                    [
                                        0,
                                        "Alle sikkerheder"
                                    ],
                                    [
                                        .5,
                                        "≥ 50%"
                                    ],
                                    [
                                        .7,
                                        "≥ 70%"
                                    ],
                                    [
                                        .85,
                                        "≥ 85%"
                                    ],
                                    [
                                        .95,
                                        "≥ 95%"
                                    ]
                                ]
                                    .map(
                                        (
                                            [
                                                value,
                                                label
                                            ]
                                        ) => `
                                            <option
                                                value="${value}"
                                                ${
                                                    Number(
                                                        s22State.minConfidence
                                                    ) ===
                                                    Number(
                                                        value
                                                    )
                                                        ? "selected"
                                                        : ""
                                                }
                                            >
                                                ${label}
                                            </option>
                                        `
                                    )
                                    .join(
                                        ""
                                    )
                            }
                        </select>

                        <button
                            type="button"
                            id="s22ClearFilter"
                            class="s13btn"
                        >
                            NULSTIL
                        </button>

                    </div>


                    <div
                        id="s22EventList"
                        class="s13stack"
                    >
                        ${
                            events.length
                                ? ""
                                : `
                                    <div class="s13mut">
                                        Ingen events endnu.
                                    </div>
                                `
                        }
                    </div>

                </section>

            </div>


            <div>

                <section class="s13panel">

                    <div class="s13head">

                        <div>
                            <strong>SHOT MAP / EVENT POSITION</strong>
                            <div class="s13mut">
                                Klik på banen før du registrerer en manuel event.
                            </div>
                        </div>

                    </div>

                    ${
                        s22ShotMapHtml()
                    }

                    <div
                        id="s22PitchLabel"
                        class="s13mut"
                        style="margin-top:7px;"
                    >
                        ${
                            s22State.pitchPoint
                                ? s13Esc(
                                    s22ZoneFromPoint(
                                        s22State.pitchPoint.x,
                                        s22State.pitchPoint.y
                                    )
                                )
                                : "Ingen position valgt."
                        }
                    </div>

                </section>


                <section
                    class="s13panel"
                    style="margin-top:10px;"
                >

                    <div class="s13head">
                        <div>
                            <strong>ZONEDATA</strong>
                            <div class="s13mut">
                                Automatisk ud fra eventpositionerne.
                            </div>
                        </div>
                    </div>

                    <div class="s13stack">
                        ${
                            (()=>{

                                const map =
                                    new Map();

                                a.events.forEach(
                                    event => {

                                        if(
                                            !event.zone
                                        ){
                                            return;
                                        }

                                        map.set(
                                            event.zone,
                                            (
                                                map.get(
                                                    event.zone
                                                ) ||
                                                0
                                            ) +
                                            1
                                        );

                                    }
                                );

                                const rows =
                                    [
                                        ...map.entries()
                                    ]
                                        .sort(
                                            (
                                                a,
                                                b
                                            ) =>
                                                b[1] -
                                                a[1]
                                        )
                                        .slice(
                                            0,
                                            10
                                        );

                                return rows.length
                                    ? rows
                                        .map(
                                            (
                                                [
                                                    zone,
                                                    count
                                                ]
                                            ) => `
                                                <div class="s13item">
                                                    <div
                                                        style="
                                                            display:flex;
                                                            justify-content:space-between;
                                                            gap:8px;
                                                        "
                                                    >
                                                        <div class="s13title">
                                                            ${
                                                                s13Esc(
                                                                    zone
                                                                )
                                                            }
                                                        </div>

                                                        <span class="s13badge">
                                                            ${count}
                                                        </span>
                                                    </div>
                                                </div>
                                            `
                                        )
                                        .join(
                                            ""
                                        )
                                    : `
                                        <div class="s13mut">
                                            Tilføj eventpositioner for at få zonedata.
                                        </div>
                                    `;

                            })()
                        }
                    </div>

                </section>

            </div>

        </div>

    `;

    s22UpdateAiBox();

    s22BindHubEvents();

    s22RenderEventList();

    s22LoadVideo();

}


/* =========================================================
   V22 BINDINGS
========================================================= */

function s22BindHubEvents(){

    document.getElementById(
        "s22ProjectSelect"
    )
        ?.addEventListener(
            "change",
            event => {

                s22State.projectId =
                    event.target.value;

                s22State.eventFilter =
                    "all";

                s22State.teamFilter =
                    "all";

                s22State.pitchPoint =
                    null;

                s22State.selectedEventId =
                    null;

                s22State.possessionTeam =
                    null;

                s22State.possessionStartedAt =
                    null;

                s22RenderDataHub(
                    document.getElementById(
                        "s13content"
                    )
                );

            }
        );

    document.getElementById(
        "s22OpenVideoStudio"
    )
        ?.addEventListener(
            "click",
            () => {

                const project =
                    s22CurrentProject();

                if(project){

                    s18State.projectId =
                        project.id;

                }

                s13Tab =
                    "videos";

                s13Render();

            }
        );

    document.getElementById(
        "s22TeamOwn"
    )
        ?.addEventListener(
            "click",
            () =>
                s22SetSelectedTeam(
                    "own"
                )
        );

    document.getElementById(
        "s22TeamOpp"
    )
        ?.addEventListener(
            "click",
            () =>
                s22SetSelectedTeam(
                    "opp"
                )
        );

    document.querySelectorAll(
        "[data-add-event]"
    )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () =>
                        s22CreateEvent(
                            button.dataset
                                .addEvent
                        )
                );

            }
        );

    document.getElementById(
        "s22PossOwn"
    )
        ?.addEventListener(
            "click",
            () =>
                s22SwitchPossession(
                    "own"
                )
        );

    document.getElementById(
        "s22PossOpp"
    )
        ?.addEventListener(
            "click",
            () =>
                s22SwitchPossession(
                    "opp"
                )
        );

    document.getElementById(
        "s22PossStop"
    )
        ?.addEventListener(
            "click",
            s22StopPossession
        );

    document.getElementById(
        "s22EventFilter"
    )
        ?.addEventListener(
            "change",
            event => {

                s22State.eventFilter =
                    event.target.value;

                s22RenderEventList();

                s22RenderTimeline();

            }
        );

    document.getElementById(
        "s22TeamFilter"
    )
        ?.addEventListener(
            "change",
            event => {

                s22State.teamFilter =
                    event.target.value;

                s22RenderEventList();

                s22RenderTimeline();

            }
        );

    document.getElementById(
        "s22Confidence"
    )
        ?.addEventListener(
            "change",
            event => {

                s22State.minConfidence =
                    Number(
                        event.target.value ||
                        0
                    );

                s22RenderEventList();

                s22RenderTimeline();

            }
        );

    document.getElementById(
        "s22ClearFilter"
    )
        ?.addEventListener(
            "click",
            () => {

                s22State.eventFilter =
                    "all";

                s22State.teamFilter =
                    "all";

                s22State.minConfidence =
                    0;

                s22RenderDataHub(
                    document.getElementById(
                        "s13content"
                    )
                );

            }
        );

    document.querySelectorAll(
        "[data-stat-type]"
    )
        .forEach(
            card => {

                card.addEventListener(
                    "click",
                    () => {

                        const type =
                            card.dataset
                                .statType;

                        s22State.eventFilter =
                            s22State.eventFilter ===
                            type
                                ? "all"
                                : type;

                        s22RenderDataHub(
                            document.getElementById(
                                "s13content"
                            )
                        );

                    }
                );

            }
        );

    const pitch =
        document.getElementById(
            "s22Pitch"
        );

    pitch?.addEventListener(
        "click",
        event => {

            const shot =
                event.target.closest(
                    "[data-shot-event]"
                );

            if(shot){

                const item =
                    s22Analytics()
                        ?.events
                        .find(
                            e =>
                                e.id ===
                                shot.dataset
                                    .shotEvent
                        );

                const video =
                    document.getElementById(
                        "s22Video"
                    );

                if(
                    item &&
                    video
                ){

                    s22State.selectedEventId =
                        item.id;

                    video.currentTime =
                        item.start ??
                        item.time;

                    video.play();

                    s22RenderEventList();

                }

                return;
            }

            const rect =
                pitch.getBoundingClientRect();

            s22State.pitchPoint = {

                x:
                    Math.max(
                        0,
                        Math.min(
                            1,
                            (
                                event.clientX -
                                rect.left
                            ) /
                            rect.width
                        )
                    ),

                y:
                    Math.max(
                        0,
                        Math.min(
                            1,
                            (
                                event.clientY -
                                rect.top
                            ) /
                            rect.height
                        )
                    )

            };

            const label =
                document.getElementById(
                    "s22PitchLabel"
                );

            if(label){

                label.textContent =
                    s22ZoneFromPoint(
                        s22State.pitchPoint.x,
                        s22State.pitchPoint.y
                    );

            }

            const old =
                pitch.querySelector(
                    ".s22-pitch-point"
                );

            old?.remove();

            const marker =
                document.createElement(
                    "div"
                );

            marker.className =
                "s22-pitch-point";

            marker.style.left =
                s22State.pitchPoint.x *
                100 +
                "%";

            marker.style.top =
                s22State.pitchPoint.y *
                100 +
                "%";

            pitch.appendChild(
                marker
            );

        }
    );

}


/* =========================================================
   V22 KEYBOARD SHORTCUTS
========================================================= */

function s22Keydown(event){

    if(
        s13Tab !==
        "data"
    ){
        return;
    }

    const tag =
        event.target
            ?.tagName;

    if(
        [
            "INPUT",
            "TEXTAREA",
            "SELECT"
        ]
            .includes(
                tag
            )
    ){
        return;
    }

    const map = {

        s:
            "shot",

        l:
            "ball_loss",

        r:
            "recovery",

        d:
            "duel",

        g:
            "counterpress",

        c:
            "corner",

        x:
            "cross",

        p:
            "progressive_pass",

        f:
            "final_third_entry",

        b:
            "press_break",

        n:
            "note"

    };

    const key =
        event.key
            .toLowerCase();

    if(
        key ===
        "1"
    ){

        event.preventDefault();

        s22SwitchPossession(
            "own"
        );

        return;
    }

    if(
        key ===
        "2"
    ){

        event.preventDefault();

        s22SwitchPossession(
            "opp"
        );

        return;
    }

    if(
        key ===
        "0"
    ){

        event.preventDefault();

        s22StopPossession();

        return;
    }

    if(
        map[
            key
        ]
    ){

        event.preventDefault();

        s22CreateEvent(
            map[
                key
            ]
        );

    }

}


/* =========================================================
   V22 COACHING HUB TAB INTEGRATION
========================================================= */

function s22EnsureDataTab(){

    const tabs =
        document.getElementById(
            "s13tabs"
        );

    if(
        !tabs ||
        tabs.querySelector(
            '[data-t="data"]'
        )
    ){
        return;
    }

    const intelligence =
        tabs.querySelector(
            '[data-t="intelligence"]'
        );

    const button =
        document.createElement(
            "button"
        );

    button.className =
        `s13tab ${
            s13Tab ===
            "data"
                ? "active"
                : ""
        }`;

    button.dataset.t =
        "data";

    button.textContent =
        "MATCH DATA";

    button.addEventListener(
        "click",
        () => {

            s13Tab =
                "data";

            s13Render();

        }
    );

    if(intelligence){

        tabs.insertBefore(
            button,
            intelligence
        );

    }else{

        tabs.appendChild(
            button
        );

    }

}


if(
    typeof s13RenderContent ===
    "function"
){

    const s22RenderContentBefore =
        s13RenderContent;

    s13RenderContent =
        function(){

            if(
                s13Tab ===
                "data"
            ){

                const target =
                    document.getElementById(
                        "s13content"
                    );

                if(target){

                    s22RenderDataHub(
                        target
                    );

                }

                return;

            }

            return s22RenderContentBefore();

        };

}


if(
    typeof s13Render ===
    "function"
){

    const s22RenderBefore =
        s13Render;

    s13Render =
        function(...args){

            const result =
                s22RenderBefore(
                    ...args
                );

            setTimeout(
                () => {

                    s22EnsureDataTab();

                    if(
                        typeof s21HubRefresh ===
                        "function"
                    ){
                        s21HubRefresh();
                    }

                },
                0
            );

            return result;

        };

}


/* =========================================================
   V22 INIT
========================================================= */

function s22Init(){

    s22EnsureData();

    s22InstallStyles();

    if(
        !window.__s22KeysBound
    ){

        window.__s22KeysBound =
            true;

        document.addEventListener(
            "keydown",
            s22Keydown
        );

    }

    setTimeout(
        s22EnsureDataTab,
        80
    );

}


if(
    document.readyState ===
    "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        () =>
            setTimeout(
                s22Init,
                3800
            )
    );

}else{

    setTimeout(
        s22Init,
        3800
    );

}