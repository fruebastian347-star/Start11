/* =========================================================
   START11 – COACHING HUB V13.1 PERFORMANCE FIX
   Fixer MutationObserver-loop ved opstart.
   ---------------------------------------------------------
   START11 – COACHING HUB V13
   Træning · øvelsesbank · fremmøde · principper · kampanalyse
   · kampkarakterer · udviklingsmatrix · videoarkiv
   · spillersamtaler · udvikling over tid
========================================================= */

let s13Data={principles:[],exercises:[],sessions:[],matches:[],meetings:[],weeklyFocus:""};
let s13Tab="dashboard",s13Session=null,s13Exercise=null,s13Match=null,s13AttendanceSession=null,s13MeetingPlayer=null;

const s13Id=(p="id")=>`${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;
const s13Esc=v=>String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
const s13Clone=v=>JSON.parse(JSON.stringify(v));
const s13Today=()=>new Date().toISOString().slice(0,10);
const s13Date=v=>{if(!v)return"—";const d=new Date(v+"T12:00:00");return isNaN(d)?v:d.toLocaleDateString("da-DK",{day:"2-digit",month:"2-digit",year:"numeric"})};
const s13Avg=a=>a.length?a.reduce((s,v)=>s+Number(v||0),0)/a.length:0;
const s13Players=()=>Array.isArray(start11FullSquad)?start11FullSquad:[];
const s13Dev=p=>typeof start11V11Dev==="function"?start11V11Dev(p?.development||{}):(p?.development||{attributes:[],evaluations:[],focus:[],trainingPlan:[],videos:[],coachNote:""});
const s13Ovr=d=>typeof start11V11Overall==="function"?start11V11Overall(d):0;
const s13Meta=()=>typeof start11V8GetActiveMeta==="function"?start11V8GetActiveMeta():({clubName:"START11",teamName:""});
let s13Save=()=>{if(typeof scheduleCloudSave==="function")scheduleCloudSave()};
function s13Norm(raw={}){return{
 principles:Array.isArray(raw.principles)?raw.principles:[],
 exercises:Array.isArray(raw.exercises)?raw.exercises:[],
 exerciseFolders:Array.isArray(raw.exerciseFolders)?raw.exerciseFolders:[],
 sessions:Array.isArray(raw.sessions)?raw.sessions:[],
 matches:Array.isArray(raw.matches)?raw.matches:[],
 meetings:Array.isArray(raw.meetings)?raw.meetings:[],
 weeklyFocus:String(raw.weeklyFocus||"")
}}

if(typeof collectTeamData==="function"){const f=collectTeamData;collectTeamData=function(){return{...f(),start11CoachHub:s13Clone(s13Data)}}}
if(typeof applyTeamData==="function"){const f=applyTeamData;applyTeamData=function(data){const r=f(data);s13Data=s13Norm(data?.start11CoachHub||{});setTimeout(s13Refresh,0);return r}}

function s13Styles(){
 if(document.getElementById("s13styles"))return;
 const s=document.createElement("style");s.id="s13styles";s.textContent=`
 #s13modal{z-index:10160}.s13shell{width:min(1500px,calc(100vw - 24px));height:min(930px,calc(100vh - 24px));max-width:none!important;padding:0!important;overflow:hidden;border:1px solid var(--s11-border-strong);border-radius:12px;background:radial-gradient(circle at 70% 0,var(--s11-theme-glow-soft),transparent 42%),#061008;color:#fff}
 .s13top{height:82px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;border-bottom:1px solid rgba(255,255,255,.08)}.s13top h2{margin:0;font-size:24px}.s13mut{color:#839087;font-size:8px;line-height:1.45}
 .s13tabs{height:44px;display:flex;overflow-x:auto;border-bottom:1px solid rgba(255,255,255,.07)}.s13tab{min-width:120px;border:0;border-right:1px solid rgba(255,255,255,.05);border-bottom:2px solid transparent;background:transparent;color:#839087;font:inherit;font-size:8px;font-weight:950;cursor:pointer}.s13tab.active{border-bottom-color:var(--s11-primary);color:#fff;background:color-mix(in srgb,var(--s11-primary) 6%,transparent)}
 .s13content{height:calc(100% - 126px);overflow-y:auto;padding:18px 20px 30px}.s13grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.s13grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
 .s13panel{padding:14px;border:1px solid rgba(255,255,255,.08);border-radius:8px;background:rgba(255,255,255,.016)}.s13head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px}.s13head strong{font-size:10px}
 .s13btn{min-height:35px;padding:0 12px;border:1px solid var(--s11-border-strong);border-radius:6px;background:#09120b;color:#dbe2dc;font:inherit;font-size:8px;font-weight:950;cursor:pointer}.s13btn:hover{border-color:var(--s11-primary);color:#fff}.s13btn.primary{background:linear-gradient(90deg,var(--s11-primary),var(--s11-secondary));border-color:var(--s11-primary);color:var(--s11-primary-text)}
 .s13field{display:grid;gap:6px;color:#a1aba3;font-size:8px;font-weight:900}.s13in,.s13sel,.s13txt{width:100%;box-sizing:border-box;border:1px solid rgba(255,255,255,.12);border-radius:5px;background:#050a06;color:#fff;font:inherit;font-size:9px;outline:0}.s13in,.s13sel{height:33px;padding:0 8px}.s13txt{min-height:82px;padding:9px;resize:vertical;line-height:1.45}
 .s13stack{display:grid;gap:9px}.s13item{padding:10px;border:1px solid rgba(255,255,255,.075);border-radius:7px;background:#08100a}.s13title{font-size:10px;font-weight:900;color:#fff}.s13badge{display:inline-flex;align-items:center;min-height:21px;padding:0 7px;border:1px solid var(--s11-border);border-radius:999px;color:var(--s11-primary);font-size:7px;font-weight:900}
 .s13stat{padding:12px;border:1px solid rgba(255,255,255,.075);border-radius:7px;background:#08100a}.s13stat span{display:block;color:#7d8980;font-size:7px;font-weight:900;text-transform:uppercase}.s13stat strong{display:block;margin-top:5px;color:var(--s11-primary);font-size:22px}
 .s13tablewrap{overflow:auto;border:1px solid rgba(255,255,255,.07);border-radius:7px}.s13table{width:100%;min-width:760px;border-collapse:collapse}.s13table th,.s13table td{padding:9px;border-bottom:1px solid rgba(255,255,255,.06);border-right:1px solid rgba(255,255,255,.04);font-size:8px;text-align:center}.s13table th{background:#09120b;color:#849088}.s13table td:first-child,.s13table th:first-child{text-align:left;position:sticky;left:0;background:#09120b}
 .s13row{display:grid;grid-template-columns:minmax(0,1fr) 95px auto;gap:8px;align-items:center}.s13att{display:grid;grid-template-columns:minmax(0,1fr) 180px;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.055)}
 .s13present{position:fixed;inset:0;z-index:10260;display:none;overflow-y:auto;background:radial-gradient(circle at 60% 0,var(--s11-theme-glow-soft),transparent 45%),#050b06;color:#fff}.s13present.open{display:block}.s13presentin{width:min(1220px,calc(100vw - 40px));margin:0 auto;padding:30px 0 50px}.s13presentgrid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
 .s13home{margin-top:12px;padding:12px;border:1px solid var(--s11-border);border-radius:8px;background:linear-gradient(90deg,var(--s11-theme-glow-soft),transparent),#071009}
 @media(max-width:1000px){.s13grid,.s13grid3,.s13presentgrid{grid-template-columns:1fr}}
 `;document.head.appendChild(s)
}

function s13Nav(){
 if(document.getElementById("s13nav"))return;
 const nav=document.querySelector(".start11-main-nav");if(!nav)return;
 const b=document.createElement("button");b.id="s13nav";b.className="start11-nav-item";b.type="button";b.textContent="COACHING";b.onclick=s13Open;nav.appendChild(b)
}
function s13Modal(){
 if(document.getElementById("s13modal"))return;
 const m=document.createElement("div");m.id="s13modal";m.className="modal";m.innerHTML=`<div class="modal-content s13shell"><div id="s13top" class="s13top"></div><div id="s13tabs" class="s13tabs"></div><div id="s13content" class="s13content"></div></div>`;document.body.appendChild(m);m.addEventListener("mousedown",e=>{if(e.target===m)s13Close()})
}
function s13Open(){s13Modal();s13Tab="dashboard";s13Render();document.getElementById("s13modal").style.display="flex"}
function s13Close(){const m=document.getElementById("s13modal");if(m)m.style.display="none"}
function s13Render(){
 const meta=s13Meta(),top=document.getElementById("s13top"),tabs=document.getElementById("s13tabs");
 if(top)top.innerHTML=`<div><h2>COACHING HUB</h2><div class="s13mut">${s13Esc(meta.clubName)} · ${s13Esc(meta.teamName)} · træning, kampanalyse og spillerudvikling</div></div><div><button id="s13quick" class="s13btn primary">+ TRÆNING</button> <button id="s13close" class="s13btn">LUK</button></div>`;
 document.getElementById("s13close")?.addEventListener("click",s13Close);document.getElementById("s13quick")?.addEventListener("click",()=>{s13Tab="training";s13Session=null;s13Render();setTimeout(s13EditSession,0)});
 const list=[["dashboard","DASHBOARD"],["training","TRÆNING"],["exercises","ØVELSESBANK"],["attendance","FREMMØDE"],["principles","PRINCIPPER"],["matches","KAMPANALYSE"],["matrix","UDVIKLING"],["videos","VIDEOARKIV"],["meetings","SPILLERSAMTALER"]];
 if(tabs){tabs.innerHTML=list.map(([id,l])=>`<button class="s13tab ${s13Tab===id?"active":""}" data-t="${id}">${l}</button>`).join("");tabs.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{s13Tab=b.dataset.t;s13Render()})}
 s13RenderContent();s13Home()
}
function s13RenderContent(){
 const t=document.getElementById("s13content");if(!t)return;
 ({dashboard:s13Dashboard,training:s13Training,exercises:s13Exercises,attendance:s13Attendance,principles:s13Principles,matches:s13Matches,matrix:s13Matrix,videos:s13Videos,meetings:s13Meetings}[s13Tab]||s13Dashboard)(t)
}

/* DASHBOARD */
function s13NeedEval(){const now=Date.now();return s13Players().filter(p=>{const e=[...(s13Dev(p).evaluations||[])].sort((a,b)=>String(b.date||"").localeCompare(String(a.date||"")))[0];if(!e)return true;const x=new Date(e.date+"T12:00:00").getTime();return isNaN(x)||((now-x)/86400000)>=60})}
function s13NextSession(){return [...s13Data.sessions].filter(x=>x.date>=s13Today()).sort((a,b)=>a.date.localeCompare(b.date))[0]||null}
function s13AttendancePct(){let p=0,n=0;s13Data.sessions.forEach(s=>Object.values(s.attendance||{}).forEach(v=>{n++;if(v==="present")p++}));return n?Math.round(p/n*100):0}
function s13Weak(){const m=new Map();s13Players().forEach(p=>(s13Dev(p).attributes||[]).forEach(a=>{const k=a.name.toLowerCase();if(!m.has(k))m.set(k,{name:a.name,v:[]});m.get(k).v.push(Number(a.rating||0))}));return [...m.values()].map(x=>({name:x.name,a:Math.round(s13Avg(x.v))})).sort((a,b)=>a.a-b.a).slice(0,4)}
function s13Dashboard(t){const next=s13NextSession(),need=s13NeedEval(),weak=s13Weak(),last=[...s13Data.matches].sort((a,b)=>String(b.date).localeCompare(String(a.date)))[0];t.innerHTML=`
 <div class="s13grid3"><div class="s13stat"><span>Næste træning</span><strong>${next?s13Date(next.date):"—"}</strong><div class="s13mut">${next?s13Esc(next.title):"Ingen planlagt"}</div></div><div class="s13stat"><span>Klar til evaluering</span><strong>${need.length}</strong><div class="s13mut">Ingen evaluering eller 60+ dage</div></div><div class="s13stat"><span>Fremmøde</span><strong>${s13AttendancePct()}%</strong><div class="s13mut">Registrerede træninger</div></div></div>
 <div class="s13grid" style="margin-top:12px"><section class="s13panel"><div class="s13head"><strong>UGENS FOKUS</strong></div><textarea id="s13weekly" class="s13txt" placeholder="Fx 1v1 offensivt, genpres...">${s13Esc(s13Data.weeklyFocus)}</textarea><div style="text-align:right;margin-top:8px"><button id="s13saveweekly" class="s13btn primary">GEM</button></div></section>
 <section class="s13panel"><div class="s13head"><strong>STØRSTE UDVIKLINGSOMRÅDER</strong></div><div class="s13stack">${weak.length?weak.map(x=>`<div class="s13item"><div style="display:flex;justify-content:space-between"><span class="s13title">${s13Esc(x.name)}</span><span class="s13badge">${x.a}/100</span></div></div>`).join(""):`<div class="s13mut">Opret spiller-attributes først.</div>`}</div></section></div>
 <div class="s13grid" style="margin-top:12px"><section class="s13panel"><div class="s13head"><strong>SPILLERE TIL EVALUERING</strong></div><div class="s13stack">${need.slice(0,8).map(p=>`<div class="s13item" style="display:flex;justify-content:space-between;align-items:center"><div><div class="s13title">${s13Esc(p.name)}</div><div class="s13mut">${s13Esc(p.position||"—")}</div></div><button class="s13btn" data-p="${s13Esc(p.id)}">ÅBN PROFIL</button></div>`).join("")||`<div class="s13mut">Alle spillere er opdateret.</div>`}</div></section>
 <section class="s13panel"><div class="s13head"><strong>SENESTE KAMPANALYSE</strong></div>${last?`<div class="s13item"><div class="s13title">${s13Esc(last.opponent||"Kamp")}</div><div class="s13mut">${s13Date(last.date)} ${last.result?"· "+s13Esc(last.result):""}</div><p class="s13mut">${s13Esc(last.nextWeek||last.improve||"Ingen fokus registreret.")}</p></div>`:`<div class="s13mut">Ingen kampanalyse endnu.</div>`}</section></div>`;
 document.getElementById("s13saveweekly")?.addEventListener("click",()=>{s13Data.weeklyFocus=document.getElementById("s13weekly").value;s13Save();s13Home()});t.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>start11V12Open?.(b.dataset.p))
}

/* PRINCIPPER */
function s13Principles(t){t.innerHTML=`<section class="s13panel"><div class="s13head"><div><strong>HOLDPRINCIPPER</strong><div class="s13mut">Kan kobles til øvelser og træningspas.</div></div><button id="s13addpr" class="s13btn primary">+ PRINCIP</button></div><div class="s13stack">${s13Data.principles.map(p=>`<div class="s13item" data-pr="${p.id}"><div class="s13row"><input class="s13in" data-f="title" value="${s13Esc(p.title||"")}"><select class="s13sel" data-f="phase">${["Generelt","Med bold","Uden bold","Omstillinger","Standardsituationer"].map(x=>`<option ${p.phase===x?"selected":""}>${x}</option>`).join("")}</select><button class="s13btn" data-del>×</button></div><textarea class="s13txt" data-f="description" style="margin-top:8px">${s13Esc(p.description||"")}</textarea></div>`).join("")||`<div class="s13mut">Ingen principper endnu.</div>`}</div></section>`;
 t.querySelectorAll("[data-pr]").forEach(r=>{const p=()=>s13Data.principles.find(x=>x.id===r.dataset.pr);r.querySelectorAll("[data-f]").forEach(f=>f.addEventListener(f.tagName==="SELECT"?"change":"input",()=>{p()[f.dataset.f]=f.value;s13Save()}));r.querySelector("[data-del]")?.addEventListener("click",()=>{s13Data.principles=s13Data.principles.filter(x=>x.id!==r.dataset.pr);s13Save();s13Principles(t)})});document.getElementById("s13addpr").onclick=()=>{s13Data.principles.push({id:s13Id("pr"),title:"Nyt princip",phase:"Generelt",description:""});s13Save();s13Principles(t)}
}

/* ØVELSESBANK */
function s13Exercises(t){const e=s13Data.exercises.find(x=>x.id===s13Exercise)||{id:"",title:"",theme:"",duration:15,players:"",coaching:"",progression:"",regression:""};t.innerHTML=`<div class="s13grid"><section class="s13panel"><div class="s13head"><strong>ØVELSESBANK</strong><button id="s13newex" class="s13btn primary">+ NY ØVELSE</button></div><div class="s13stack">${s13Data.exercises.map(x=>`<div class="s13item"><div style="display:flex;justify-content:space-between"><div><div class="s13title">${s13Esc(x.title||"Øvelse")}</div><div class="s13mut">${s13Esc(x.theme||"")} · ${Number(x.duration||0)} min</div></div><button class="s13btn" data-e="${x.id}">REDIGER</button></div></div>`).join("")||`<div class="s13mut">Ingen øvelser endnu.</div>`}</div></section>
 <section class="s13panel"><div class="s13head"><strong>${e.id?"REDIGER":"NY"} ØVELSE</strong></div><div class="s13stack">
 <label class="s13field">Navn<input id="s13extitle" class="s13in" value="${s13Esc(e.title)}"></label><div class="s13grid"><label class="s13field">Tema<input id="s13extheme" class="s13in" value="${s13Esc(e.theme)}"></label><label class="s13field">Varighed<input id="s13exdur" class="s13in" type="number" value="${Number(e.duration||15)}"></label></div><label class="s13field">Spillere / organisation<input id="s13expl" class="s13in" value="${s13Esc(e.players)}"></label><label class="s13field">Coachingpunkter<textarea id="s13excoach" class="s13txt">${s13Esc(e.coaching)}</textarea></label><label class="s13field">Progression<textarea id="s13exprog" class="s13txt">${s13Esc(e.progression)}</textarea></label><label class="s13field">Regression<textarea id="s13exreg" class="s13txt">${s13Esc(e.regression)}</textarea></label><div style="text-align:right">${e.id?`<button id="s13delex" class="s13btn">SLET</button> `:""}<button id="s13saveex" class="s13btn primary">GEM ØVELSE</button></div></div></section></div>`;
 t.querySelectorAll("[data-e]").forEach(b=>b.onclick=()=>{s13Exercise=b.dataset.e;s13Exercises(t)});document.getElementById("s13newex").onclick=()=>{s13Exercise=null;s13Exercises(t)};document.getElementById("s13saveex").onclick=()=>{const v={id:e.id||s13Id("ex"),title:document.getElementById("s13extitle").value||"Øvelse",theme:document.getElementById("s13extheme").value,duration:Number(document.getElementById("s13exdur").value||15),players:document.getElementById("s13expl").value,coaching:document.getElementById("s13excoach").value,progression:document.getElementById("s13exprog").value,regression:document.getElementById("s13exreg").value};const i=s13Data.exercises.findIndex(x=>x.id===v.id);i<0?s13Data.exercises.push(v):s13Data.exercises[i]=v;s13Exercise=v.id;s13Save();s13Exercises(t)};document.getElementById("s13delex")?.addEventListener("click",()=>{if(confirm("Slet øvelsen?")){s13Data.exercises=s13Data.exercises.filter(x=>x.id!==e.id);s13Exercise=null;s13Save();s13Exercises(t)}})
}

/* TRÆNING */
function s13Training(t){const arr=[...s13Data.sessions].sort((a,b)=>String(b.date).localeCompare(String(a.date)));t.innerHTML=`<div class="s13grid"><section class="s13panel"><div class="s13head"><strong>TRÆNINGSPLANLÆGGER</strong><button id="s13newsession" class="s13btn primary">+ NY TRÆNING</button></div><div class="s13stack">${arr.map(x=>`<div class="s13item"><div style="display:flex;justify-content:space-between"><div><div class="s13title">${s13Esc(x.title||"Træning")}</div><div class="s13mut">${s13Date(x.date)} · ${s13Esc(x.theme||"")} · ${(x.blocks||[]).reduce((s,b)=>s+Number(b.duration||0),0)} min</div></div><button class="s13btn" data-s="${x.id}">ÅBN</button></div></div>`).join("")||`<div class="s13mut">Ingen træninger endnu.</div>`}</div></section><section id="s13sessionedit" class="s13panel"><div class="s13mut">Vælg eller opret en træning.</div></section></div>`;
 t.querySelectorAll("[data-s]").forEach(b=>b.onclick=()=>{s13Session=b.dataset.s;s13EditSession()});document.getElementById("s13newsession").onclick=()=>{s13Session=null;s13EditSession()};if(s13Session)s13EditSession()
}
function s13EditSession(){const box=document.getElementById("s13sessionedit");if(!box)return;const old=s13Data.sessions.find(x=>x.id===s13Session),d=old?s13Clone(old):{id:"",date:s13Today(),title:"Træning",theme:"",note:"",blocks:[],attendance:{}};let blocks=s13Clone(d.blocks||[]);
 const draw=()=>{box.innerHTML=`<div class="s13head"><strong>${d.id?"REDIGER":"NY"} TRÆNING</strong></div><div class="s13stack"><div class="s13grid"><label class="s13field">Dato<input id="s13sdate" class="s13in" type="date" value="${d.date}"></label><label class="s13field">Tema<input id="s13stheme" class="s13in" value="${s13Esc(d.theme)}"></label></div><label class="s13field">Titel<input id="s13stitle" class="s13in" value="${s13Esc(d.title)}"></label><label class="s13field">Note<textarea id="s13snote" class="s13txt">${s13Esc(d.note)}</textarea></label><div class="s13head"><strong>ØVELSER · ${blocks.reduce((s,b)=>s+Number(b.duration||0),0)} MIN</strong><button id="s13addblock" class="s13btn">+ ØVELSE</button></div><div class="s13stack">${blocks.map(b=>`<div class="s13item" data-b="${b.id}"><div class="s13row"><select class="s13sel" data-f="exerciseId"><option value="">Manuel øvelse</option>${s13Data.exercises.map(e=>`<option value="${e.id}" ${b.exerciseId===e.id?"selected":""}>${s13Esc(e.title)}</option>`).join("")}</select><input class="s13in" type="number" data-f="duration" value="${Number(b.duration||15)}"><button class="s13btn" data-del>×</button></div><input class="s13in" style="margin-top:7px" data-f="title" value="${s13Esc(b.title||"")}"><textarea class="s13txt" style="margin-top:7px" data-f="note">${s13Esc(b.note||"")}</textarea></div>`).join("")||`<div class="s13mut">Tilføj første øvelse.</div>`}</div><div style="text-align:right">${d.id?`<button id="s13delsession" class="s13btn">SLET</button> `:""}<button id="s13savesession" class="s13btn primary">GEM TRÆNING</button></div></div>`;
 box.querySelectorAll("[data-b]").forEach(r=>{const get=()=>blocks.find(x=>x.id===r.dataset.b);r.querySelectorAll("[data-f]").forEach(f=>f.addEventListener(f.tagName==="SELECT"?"change":"input",()=>{const x=get();if(f.dataset.f==="duration")x.duration=Number(f.value||0);else x[f.dataset.f]=f.value;if(f.dataset.f==="exerciseId"&&f.value){const e=s13Data.exercises.find(q=>q.id===f.value);if(e){x.title=e.title;x.duration=e.duration;x.note=e.coaching;draw()}}}));r.querySelector("[data-del]")?.addEventListener("click",()=>{blocks=blocks.filter(x=>x.id!==r.dataset.b);draw()})});
 document.getElementById("s13addblock").onclick=()=>{blocks.push({id:s13Id("b"),exerciseId:"",title:"Ny øvelse",duration:15,note:""});draw()};
 document.getElementById("s13savesession").onclick=()=>{const v={...d,id:d.id||s13Id("session"),date:document.getElementById("s13sdate").value,title:document.getElementById("s13stitle").value||"Træning",theme:document.getElementById("s13stheme").value,note:document.getElementById("s13snote").value,blocks:s13Clone(blocks)};const i=s13Data.sessions.findIndex(x=>x.id===v.id);i<0?s13Data.sessions.push(v):s13Data.sessions[i]=v;s13Session=v.id;s13AttendanceSession=v.id;s13Save();s13Training(document.getElementById("s13content"));s13Home()};
 document.getElementById("s13delsession")?.addEventListener("click",()=>{if(confirm("Slet træningen?")){s13Data.sessions=s13Data.sessions.filter(x=>x.id!==d.id);s13Session=null;s13Save();s13Training(document.getElementById("s13content"));s13Home()}})};
 draw()
}

/* FREMMØDE */
function s13Attendance(t){const arr=[...s13Data.sessions].sort((a,b)=>String(b.date).localeCompare(String(a.date)));if(!s13AttendanceSession&&arr[0])s13AttendanceSession=arr[0].id;const s=arr.find(x=>x.id===s13AttendanceSession);t.innerHTML=`<div class="s13grid"><section class="s13panel"><div class="s13head"><strong>TRÆNINGSFREMMØDE</strong></div><label class="s13field">Træning<select id="s13attsession" class="s13sel">${arr.map(x=>`<option value="${x.id}" ${s?.id===x.id?"selected":""}>${s13Date(x.date)} · ${s13Esc(x.title)}</option>`).join("")}</select></label></section><section class="s13panel"><div class="s13head"><strong>SPILLERE</strong></div>${s?s13Players().map(p=>`<div class="s13att"><div><div class="s13title">${s13Esc(p.name)}</div><div class="s13mut">${s13Esc(p.position||"—")}</div></div><select class="s13sel" data-ap="${p.id}">${[["","Ikke registreret"],["present","✓ Deltog"],["absent","✕ Fravær"],["injured","⚠ Skadet"]].map(([v,l])=>`<option value="${v}" ${(s.attendance||{})[p.id]===v?"selected":""}>${l}</option>`).join("")}</select></div>`).join(""):`<div class="s13mut">Opret en træning først.</div>`}</section></div>`;
 document.getElementById("s13attsession")?.addEventListener("change",e=>{s13AttendanceSession=e.target.value;s13Attendance(document.getElementById("s13content"))});t.querySelectorAll("[data-ap]").forEach(x=>x.onchange=()=>{s.attendance=s.attendance||{};x.value?s.attendance[x.dataset.ap]=x.value:delete s.attendance[x.dataset.ap];s13Save();s13Home()})
}

/* KAMPANALYSE */
function s13Matches(t){const d=s13Data.matches.find(x=>x.id===s13Match)||{id:"",date:s13Today(),opponent:"",result:"",worked:"",improve:"",tactical:"",nextWeek:"",playerRatings:[]};t.innerHTML=`<div class="s13grid"><section class="s13panel"><div class="s13head"><strong>KAMPANALYSER</strong><button id="s13newmatch" class="s13btn primary">+ ANALYSE</button></div><div class="s13stack">${[...s13Data.matches].sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(x=>`<div class="s13item"><div style="display:flex;justify-content:space-between"><div><div class="s13title">${s13Esc(x.opponent||"Kamp")}</div><div class="s13mut">${s13Date(x.date)} ${x.result?"· "+s13Esc(x.result):""}</div></div><button class="s13btn" data-m="${x.id}">ÅBN</button></div></div>`).join("")||`<div class="s13mut">Ingen kampanalyser endnu.</div>`}</div></section>
 <section class="s13panel"><div class="s13head"><strong>${d.id?"REDIGER":"NY"} ANALYSE</strong></div><div class="s13stack"><div class="s13grid"><label class="s13field">Dato<input id="s13mdate" class="s13in" type="date" value="${d.date}"></label><label class="s13field">Resultat<input id="s13mres" class="s13in" value="${s13Esc(d.result)}"></label></div><label class="s13field">Modstander<input id="s13mopp" class="s13in" value="${s13Esc(d.opponent)}"></label><label class="s13field">Hvad fungerede?<textarea id="s13mworked" class="s13txt">${s13Esc(d.worked)}</textarea></label><label class="s13field">Hvad skal forbedres?<textarea id="s13mimp" class="s13txt">${s13Esc(d.improve)}</textarea></label><label class="s13field">Taktiske observationer<textarea id="s13mtac" class="s13txt">${s13Esc(d.tactical)}</textarea></label><label class="s13field">Fokus til næste uge<textarea id="s13mnext" class="s13txt">${s13Esc(d.nextWeek)}</textarea></label><div class="s13head"><strong>SPILLERKARAKTERER 1–10</strong></div><div id="s13ratings">${s13Players().map(p=>{const r=d.playerRatings.find(x=>x.playerId===p.id)||{rating:6,note:""};return`<div class="s13att" data-rp="${p.id}"><div><div class="s13title">${s13Esc(p.name)}</div><div class="s13mut">${s13Esc(p.position||"—")}</div></div><div class="s13grid"><input class="s13in" data-f="rating" type="number" min="1" max="10" step=".1" value="${Number(r.rating)}"><input class="s13in" data-f="note" value="${s13Esc(r.note)}" placeholder="Kort note"></div></div>`}).join("")}</div><div style="text-align:right">${d.id?`<button id="s13delmatch" class="s13btn">SLET</button> `:""}<button id="s13savematch" class="s13btn primary">GEM ANALYSE</button></div></div></section></div>`;
 t.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>{s13Match=b.dataset.m;s13Matches(t)});document.getElementById("s13newmatch").onclick=()=>{s13Match=null;s13Matches(t)};document.getElementById("s13savematch").onclick=()=>{const ratings=[...t.querySelectorAll("[data-rp]")].map(r=>({playerId:r.dataset.rp,rating:Math.max(1,Math.min(10,Number(r.querySelector('[data-f="rating"]').value||6))),note:r.querySelector('[data-f="note"]').value}));const v={id:d.id||s13Id("match"),date:document.getElementById("s13mdate").value,opponent:document.getElementById("s13mopp").value,result:document.getElementById("s13mres").value,worked:document.getElementById("s13mworked").value,improve:document.getElementById("s13mimp").value,tactical:document.getElementById("s13mtac").value,nextWeek:document.getElementById("s13mnext").value,playerRatings:ratings};const i=s13Data.matches.findIndex(x=>x.id===v.id);i<0?s13Data.matches.push(v):s13Data.matches[i]=v;s13Match=v.id;s13Save();s13Matches(t);s13Home()};document.getElementById("s13delmatch")?.addEventListener("click",()=>{if(confirm("Slet kampanalysen?")){s13Data.matches=s13Data.matches.filter(x=>x.id!==d.id);s13Match=null;s13Save();s13Matches(t);s13Home()}})
}

/* UDVIKLINGSMATRIX + HISTORIK */
function s13Matrix(t){const ps=s13Players(),names=[...new Map(ps.flatMap(p=>(s13Dev(p).attributes||[]).map(a=>[a.name.toLowerCase(),a.name]))).values()];const val=(p,n)=>(s13Dev(p).attributes||[]).find(a=>a.name.toLowerCase()===n.toLowerCase())?.rating??null;t.innerHTML=`<section class="s13panel"><div class="s13head"><div><strong>HOLDETS UDVIKLINGSMATRIX</strong><div class="s13mut">Sammenlign spillerne på jeres egne attributes.</div></div></div>${ps.length&&names.length?`<div class="s13tablewrap"><table class="s13table"><thead><tr><th>Spiller</th><th>OVR</th>${names.map(n=>`<th>${s13Esc(n)}</th>`).join("")}</tr></thead><tbody>${ps.map(p=>`<tr><td><button class="s13btn" data-mp="${p.id}">${s13Esc(p.name)}</button></td><td><strong>${s13Ovr(s13Dev(p))}</strong></td>${names.map(n=>{const v=val(p,n);return`<td style="color:${v>=75?"var(--s11-primary)":v!==null&&v<50?"#ff7474":"#e8ece9"}">${v??"—"}</td>`}).join("")}</tr>`).join("")}</tbody></table></div>`:`<div class="s13mut">Opret attributes på spillerprofilerne først.</div>`}</section>
 <section class="s13panel" style="margin-top:12px"><div class="s13head"><strong>UDVIKLING OVER TID</strong></div><div class="s13grid">${ps.map(p=>{const d=s13Dev(p),ev=[...(d.evaluations||[])].sort((a,b)=>String(a.date).localeCompare(String(b.date))).slice(-8);return`<div class="s13item"><div style="display:flex;justify-content:space-between"><div><div class="s13title">${s13Esc(p.name)}</div><div class="s13mut">${s13Esc(p.position||"—")}</div></div><span class="s13badge">${s13Ovr(d)}</span></div><div style="display:flex;align-items:flex-end;gap:5px;height:76px;margin-top:10px">${ev.length?ev.map(e=>{const v=s13Ovr({attributes:e.attributes||[]});return`<div title="${s13Esc(e.date)} · ${v}" style="flex:1;height:${Math.max(8,v*.68)}px;background:var(--s11-primary);opacity:.72;border-radius:3px 3px 0 0"></div>`}).join(""):`<div class="s13mut">Ingen evalueringer endnu.</div>`}</div></div>`}).join("")}</div></section>`;t.querySelectorAll("[data-mp]").forEach(b=>b.onclick=()=>start11V12Open?.(b.dataset.mp))
}

/* VIDEOARKIV */
function s13Videos(t){const rows=s13Players().flatMap(p=>{const d=s13Dev(p);return(d.videos||[]).map(v=>({p,d,v}))});t.innerHTML=`<section class="s13panel"><div class="s13head"><div><strong>VIDEOARKIV</strong><div class="s13mut">Kobl kampklip direkte til spillerens attributes.</div></div></div><div class="s13stack">${rows.map(({p,d,v})=>`<div class="s13item" data-vp="${p.id}" data-vid="${v.id}"><div style="display:flex;justify-content:space-between"><div><div class="s13title">${s13Esc(p.name)} · ${s13Esc(v.title||"Videoklip")}</div><div class="s13mut">${s13Esc(v.match||"")} ${v.timestamp?"· "+s13Esc(v.timestamp):""}</div></div>${v.url?`<a class="s13btn" style="display:inline-flex;align-items:center;text-decoration:none" target="_blank" rel="noopener noreferrer" href="${s13Esc(v.url)}">ÅBN</a>`:""}</div><div class="s13grid" style="margin-top:9px"><label class="s13field">Attribute<select class="s13sel" data-f="attributeId"><option value="">Intet attribute</option>${(d.attributes||[]).map(a=>`<option value="${a.id}" ${v.attributeId===a.id?"selected":""}>${s13Esc(a.name)}</option>`).join("")}</select></label><label class="s13field">Kliptype<select class="s13sel" data-f="clipType">${[["","Ikke valgt"],["positive","Positivt eksempel"],["development","Udviklingsklip"],["negative","Korrigeringsklip"]].map(([x,l])=>`<option value="${x}" ${v.clipType===x?"selected":""}>${l}</option>`).join("")}</select></label></div></div>`).join("")||`<div class="s13mut">Ingen videoer endnu.</div>`}</div></section>`;
 t.querySelectorAll("[data-vp]").forEach(r=>{const p=s13Players().find(x=>x.id===r.dataset.vp);p.development=s13Dev(p);const v=p.development.videos.find(x=>x.id===r.dataset.vid);r.querySelectorAll("[data-f]").forEach(f=>f.onchange=()=>{v[f.dataset.f]=f.value;start11SaveFullSquad?.();s13Save()})})
}

/* SPILLERSAMTALER */
function s13Meetings(t){const ps=s13Players();if(!s13MeetingPlayer&&ps[0])s13MeetingPlayer=ps[0].id;const p=ps.find(x=>x.id===s13MeetingPlayer),d=p?s13Dev(p):null;t.innerHTML=`<section class="s13panel"><div class="s13head"><div><strong>SPILLERSAMTALE-MODE</strong><div class="s13mut">Radar, styrker, udviklingsmål, video og aftaler i én visning.</div></div>${p?`<button id="s13startmeeting" class="s13btn primary">START SPILLERSAMTALE</button>`:""}</div><label class="s13field">Spiller<select id="s13meetingplayer" class="s13sel">${ps.map(x=>`<option value="${x.id}" ${p?.id===x.id?"selected":""}>${s13Esc(x.name)}</option>`).join("")}</select></label>${p&&d?`<div class="s13grid" style="margin-top:14px"><div class="s13stack"><div class="s13item"><div class="s13title">${s13Esc(p.name)}</div><div class="s13mut">${s13Esc(p.position||"—")} · OVR ${s13Ovr(d)} · kampkarakter ${s13PlayerRating(p.id)}</div></div><div class="s13item"><div class="s13title">STYRKER</div><p class="s13mut">${s13Esc(p.strengths||"Ikke udfyldt.")}</p></div><div class="s13item"><div class="s13title">UDVIKLINGSOMRÅDER</div><p class="s13mut">${s13Esc(p.weaknesses||"Ikke udfyldt.")}</p></div></div><div class="s13panel">${typeof start11V11Radar==="function"?start11V11Radar(d,[...(d.evaluations||[])].sort((a,b)=>String(b.date).localeCompare(String(a.date)))[0]?.attributes||null,380):""}</div></div>`:""}</section>`;
 document.getElementById("s13meetingplayer")?.addEventListener("change",e=>{s13MeetingPlayer=e.target.value;s13Meetings(t)});document.getElementById("s13startmeeting")?.addEventListener("click",()=>s13Present(p))
}
function s13PlayerRating(id){const a=s13Data.matches.flatMap(m=>(m.playerRatings||[]).filter(r=>r.playerId===id).map(r=>Number(r.rating)));return a.length?s13Avg(a).toFixed(1):"—"}
function s13Present(p){let o=document.getElementById("s13present");if(!o){o=document.createElement("div");o.id="s13present";o.className="s13present";document.body.appendChild(o)}const d=s13Dev(p);o.innerHTML=`<div class="s13presentin"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px"><div><div style="color:var(--s11-primary);font-size:10px;font-weight:950">START11 · SPILLERSAMTALE</div><h1 style="font-size:34px;margin:4px 0">${s13Esc(p.name)}</h1><div class="s13mut">${s13Esc(p.position||"—")} · OVR ${s13Ovr(d)}</div></div><button id="s13presentclose" class="s13btn">LUK</button></div><div class="s13presentgrid"><section class="s13panel">${typeof start11V11Radar==="function"?start11V11Radar(d,[...(d.evaluations||[])].sort((a,b)=>String(b.date).localeCompare(String(a.date)))[0]?.attributes||null,470):""}</section><section class="s13panel"><h3 style="color:var(--s11-primary)">STYRKER</h3><p>${s13Esc(p.strengths||"Ikke udfyldt.")}</p><h3 style="color:var(--s11-primary)">UDVIKLINGSOMRÅDER</h3><p>${s13Esc(p.weaknesses||"Ikke udfyldt.")}</p><h3 style="color:var(--s11-primary)">MED BOLD</h3><p>${s13Esc(p.focusWithBall||"Ikke udfyldt.")}</p><h3 style="color:var(--s11-primary)">UDEN BOLD</h3><p>${s13Esc(p.focusWithoutBall||"Ikke udfyldt.")}</p></section></div><section class="s13panel" style="margin-top:14px"><div class="s13head"><strong>AFSLUT SAMTALEN</strong></div><div class="s13grid"><label class="s13field">Titel<input id="s13meettitle" class="s13in" value="Spillersamtale"></label><label class="s13field">Dato<input id="s13meetdate" class="s13in" type="date" value="${s13Today()}"></label></div><label class="s13field" style="margin-top:9px">Aftaler / note<textarea id="s13meetnote" class="s13txt"></textarea></label><div style="text-align:right;margin-top:9px"><button id="s13savemeeting" class="s13btn primary">GEM SAMTALE</button></div></section></div>`;o.classList.add("open");document.getElementById("s13presentclose").onclick=()=>o.classList.remove("open");document.getElementById("s13savemeeting").onclick=()=>{s13Data.meetings.push({id:s13Id("meet"),playerId:p.id,date:document.getElementById("s13meetdate").value,title:document.getElementById("s13meettitle").value||"Spillersamtale",note:document.getElementById("s13meetnote").value});s13Save();o.classList.remove("open");if(typeof visNotification==="function")visNotification("Spillersamtalen er gemt.")}
}

/* HJEMMEKORT + KAMPCARD */
function s13Home(){
    const dbu=document.querySelector(".dbu-connect-card");
    const parent=dbu?.parentElement;
    if(!parent)return;

    const n=s13NextSession();
    const needCount=s13NeedEval().length;

    const signature=JSON.stringify({
        id:n?.id||"",
        date:n?.date||"",
        title:n?.title||"",
        needCount
    });

    let c=document.getElementById("s13home");

    if(!c){
        c=document.createElement("section");
        c.id="s13home";
        c.className="s13home";
        parent.insertBefore(c,dbu);
    }else if(c.parentElement!==parent){
        parent.insertBefore(c,dbu);
    }

    if(c.dataset.renderSignature===signature){
        return;
    }

    c.dataset.renderSignature=signature;

    c.innerHTML=`<div style="color:var(--s11-primary);font-size:8px;font-weight:950">COACHING</div><div style="margin-top:4px;font-size:11px;font-weight:950">${n?`${s13Esc(n.title)} · ${s13Date(n.date)}`:"Ingen træning planlagt"}</div><div class="s13mut">${needCount} spiller(e) klar til evaluering</div><button id="s13homeopen" class="s13btn primary" style="width:100%;margin-top:9px">ÅBN COACHING HUB →</button>`;

    c.querySelector("#s13homeopen")?.addEventListener("click",s13Open);
}
function s13LatestCard(){const card=document.querySelector(".start11-v8-latest-card");if(!card||card.querySelector(".s13analyse"))return;const b=document.createElement("button");b.className="s13btn s13analyse";b.textContent="ANALYSÉR KAMP";b.style.marginTop="8px";b.onclick=e=>{e.stopPropagation();s13Open();s13Tab="matches";s13Render()};card.appendChild(b)}

/* PLAYER PROFILE MATCH RATINGS */
if(typeof start11V12RenderSide==="function"){const f=start11V12RenderSide;start11V12RenderSide=function(){f();const p=start11V12GetActivePlayer?.(),t=document.getElementById("s11v12Side");if(!p||!t)return;const vals=s13Data.matches.flatMap(m=>(m.playerRatings||[]).filter(r=>r.playerId===p.id).map(r=>Number(r.rating)));const s=document.createElement("section");s.className="s11v12-panel";s.innerHTML=`<div class="s11v12-panel-head"><strong>KAMPKARAKTERER</strong></div>${vals.length?`<strong style="font-size:27px;color:var(--s11-primary)">${s13Avg(vals).toFixed(1)}</strong><span class="s11v12-muted"> sæsongennemsnit</span>`:`<div class="s11v12-muted">Ingen kampkarakterer endnu.</div>`}`;t.appendChild(s)}}

function s13Refresh(){s13Home();s13LatestCard();const m=document.getElementById("s13modal");if(m?.style.display==="flex")s13Render()}
function s13Init(){
    s13Styles();
    s13Modal();
    s13Nav();

    try{
        const team=
            typeof start11V8GetActiveTeam==="function"
                ? start11V8GetActiveTeam()
                : cloudTeams?.find(x=>x.id===activeTeamId);

        if(team?.data?.start11CoachHub){
            s13Data=s13Norm(team.data.start11CoachHub);
        }
    }catch{}

    s13Home();
    s13LatestCard();

    let refreshTimer=null;

    const observer=new MutationObserver(()=>{
        if(refreshTimer){
            clearTimeout(refreshTimer);
        }

        refreshTimer=setTimeout(()=>{
            refreshTimer=null;

            if(!document.getElementById("s13nav")){
                s13Nav();
            }

            if(!document.getElementById("s13home")){
                s13Home();
            }

            const latest=document.querySelector(".start11-v8-latest-card");
            if(latest && !latest.querySelector(".s13analyse")){
                s13LatestCard();
            }
        },120);
    });

    observer.observe(document.body,{
        childList:true,
        subtree:true
    });
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(s13Init,1700));else setTimeout(s13Init,1700);



/* =========================================================
   START11 – V14
   ---------------------------------------------------------
   FIX / UDVIDELSER:
   1) Coaching Hub lukker før spillerprofil åbnes
   2) Reel spillerudvikling over tid med delta pr. attribute
   3) Kampplan pr. kommende kamp
   4) Udvidet videoanalyse med klip, tags, faser og coachingnoter
========================================================= */


/* =========================================================
   V14 DATA
========================================================= */

function s14EnsureData() {

    if (!s13Data || typeof s13Data !== "object") {
        s13Data = {};
    }

    if (!Array.isArray(s13Data.matchPlans)) {
        s13Data.matchPlans = [];
    }

    if (!Array.isArray(s13Data.videoClips)) {
        s13Data.videoClips = [];
    }

}


if (typeof s13Norm === "function") {

    const s14NormBefore =
        s13Norm;

    s13Norm =
        function (raw = {}) {

            const normalized =
                s14NormBefore(
                    raw
                );

            normalized.matchPlans =
                Array.isArray(raw.matchPlans)
                    ? raw.matchPlans
                    : [];

            normalized.videoClips =
                Array.isArray(raw.videoClips)
                    ? raw.videoClips
                    : [];

            return normalized;

        };

}


/* =========================================================
   STYLES
========================================================= */

function s14InstallStyles() {

    if (
        document.getElementById(
            "s14styles"
        )
    ) {
        return;
    }

    const style =
        document.createElement(
            "style"
        );

    style.id =
        "s14styles";

    style.textContent = `

        /* ==========================================
           KAMPPLAN
        ========================================== */

        #s14GamePlanModal {
            z-index: 10280;
        }

        .s14-gameplan-shell {
            width:
                min(
                    1180px,
                    calc(100vw - 28px)
                );

            max-width: none !important;
            max-height:
                calc(100vh - 28px);

            overflow-y: auto;

            padding: 0 !important;

            border:
                1px solid
                var(--s11-border-strong);

            border-radius: 12px;

            background:
                radial-gradient(
                    circle at 72% 0%,
                    var(--s11-theme-glow-soft),
                    transparent 40%
                ),
                #061008;

            color: #fff;
        }

        .s14-gameplan-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 18px;

            padding: 19px 21px;

            border-bottom:
                1px solid
                rgba(255,255,255,.08);
        }

        .s14-gameplan-top h2 {
            margin: 0 0 4px;
            font-size: 22px;
        }

        .s14-gameplan-body {
            padding: 18px 20px 24px;
        }

        .s14-gameplan-grid {
            display: grid;
            grid-template-columns:
                repeat(
                    2,
                    minmax(0,1fr)
                );

            gap: 12px;
        }

        .s14-gameplan-card {
            padding: 13px;

            border:
                1px solid
                rgba(255,255,255,.08);

            border-radius: 8px;

            background:
                rgba(255,255,255,.016);
        }

        .s14-gameplan-card.wide {
            grid-column: 1 / -1;
        }

        .s14-gameplan-card h3 {
            margin: 0 0 9px;

            color:
                var(--s11-primary);

            font-size: 10px;
            font-weight: 950;
        }

        .s14-gameplan-match {
            display: flex;
            align-items: center;
            gap: 10px;

            color: #A5B0A7;
            font-size: 9px;
        }

        .s14-gameplan-status {
            display: inline-flex;
            align-items: center;

            min-height: 22px;
            padding: 0 7px;

            border:
                1px solid
                var(--s11-border);

            border-radius: 999px;

            color:
                var(--s11-primary);

            font-size: 7px;
            font-weight: 900;
        }

        .s14-upcoming-plan-badge {
            display: inline-flex;
            margin-left: 4px;

            padding:
                2px 5px;

            border:
                1px solid
                var(--s11-border);

            border-radius: 999px;

            color:
                var(--s11-primary);

            font-size: 6px;
            font-weight: 950;
        }


        /* ==========================================
           UDVIKLING OVER TID
        ========================================== */

        .s14-dev-player {
            display: grid;
            grid-template-columns:
                280px
                minmax(0,1fr);

            gap: 14px;
        }

        .s14-dev-player-list {
            display: grid;
            gap: 7px;
            align-content: start;
        }

        .s14-dev-player-button {
            width: 100%;

            display: grid;
            grid-template-columns:
                minmax(0,1fr)
                auto;

            gap: 8px;

            padding: 10px;

            border:
                1px solid
                rgba(255,255,255,.075);

            border-radius: 7px;

            background: #08100A;
            color: #fff;

            font: inherit;
            text-align: left;

            cursor: pointer;
        }

        .s14-dev-player-button.active {
            border-color:
                var(--s11-primary);

            background:
                color-mix(
                    in srgb,
                    var(--s11-primary) 8%,
                    #08100A
                );
        }

        .s14-delta-pos {
            color: #72E663;
        }

        .s14-delta-neg {
            color: #FF7474;
        }

        .s14-delta-flat {
            color: #A6B0A8;
        }

        .s14-progress-row {
            display: grid;
            grid-template-columns:
                160px
                72px
                72px
                72px
                minmax(160px,1fr);

            gap: 8px;
            align-items: center;

            min-height: 40px;

            padding: 6px 0;

            border-bottom:
                1px solid
                rgba(255,255,255,.055);
        }

        .s14-progress-bar {
            position: relative;

            height: 7px;

            overflow: hidden;

            border-radius: 999px;

            background:
                rgba(255,255,255,.08);
        }

        .s14-progress-bar span {
            position: absolute;
            inset:
                0 auto 0 0;

            border-radius: inherit;

            background:
                linear-gradient(
                    90deg,
                    var(--s11-secondary),
                    var(--s11-primary)
                );
        }

        .s14-history {
            display: flex;
            align-items: end;
            gap: 7px;

            min-height: 130px;

            padding-top: 12px;
        }

        .s14-history-column {
            flex: 1;

            min-width: 32px;

            display: grid;
            justify-items: center;
            align-items: end;

            gap: 5px;
        }

        .s14-history-bar {
            width: min(35px,100%);

            min-height: 5px;

            border-radius:
                4px 4px 0 0;

            background:
                linear-gradient(
                    180deg,
                    var(--s11-primary),
                    var(--s11-secondary)
                );
        }

        .s14-history-column small {
            color: #79867D;
            font-size: 6px;
            white-space: nowrap;
        }


        /* ==========================================
           VIDEOANALYSE
        ========================================== */

        .s14-video-layout {
            display: grid;
            grid-template-columns:
                355px
                minmax(0,1fr);

            gap: 13px;
        }

        .s14-video-list {
            display: grid;
            gap: 8px;
            align-content: start;
        }

        .s14-video-clip {
            padding: 10px;

            border:
                1px solid
                rgba(255,255,255,.075);

            border-radius: 7px;

            background: #08100A;

            cursor: pointer;
        }

        .s14-video-clip.active {
            border-color:
                var(--s11-primary);
        }

        .s14-video-meta {
            margin-top: 4px;

            color: #7E8A81;
            font-size: 7px;
        }

        .s14-video-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;

            margin-top: 8px;
        }

        .s14-video-tag {
            display: inline-flex;

            padding:
                3px 6px;

            border:
                1px solid
                var(--s11-border);

            border-radius: 999px;

            color:
                var(--s11-primary);

            font-size: 6px;
            font-weight: 900;
        }

        .s14-video-player {
            min-height: 220px;

            display: grid;
            place-items: center;

            padding: 16px;

            border:
                1px dashed
                rgba(255,255,255,.12);

            border-radius: 8px;

            background: #040805;

            text-align: center;
        }

        .s14-video-player a {
            color:
                var(--s11-primary);

            font-size: 10px;
            font-weight: 900;
            text-decoration: none;
        }

        .s14-video-form-grid {
            display: grid;
            grid-template-columns:
                repeat(
                    2,
                    minmax(0,1fr)
                );

            gap: 9px;
        }

        .s14-video-filter-row {
            display: grid;
            grid-template-columns:
                minmax(0,1fr)
                180px
                180px;

            gap: 8px;

            margin-bottom: 10px;
        }

        .s14-video-stat-grid {
            display: grid;
            grid-template-columns:
                repeat(
                    4,
                    minmax(0,1fr)
                );

            gap: 8px;

            margin-bottom: 12px;
        }


        @media (
            max-width: 1000px
        ) {

            .s14-gameplan-grid,
            .s14-dev-player,
            .s14-video-layout,
            .s14-video-form-grid,
            .s14-video-filter-row,
            .s14-video-stat-grid {
                grid-template-columns:
                    1fr;
            }

        }

    `;

    document.head.appendChild(
        style
    );

}


/* =========================================================
   1) LUK COACHING HUB FØR SPILLERPROFIL ÅBNES
========================================================= */

function s14InstallPlayerOpenGuard() {

    const modal =
        document.getElementById(
            "s13modal"
        );

    if (
        !modal ||
        modal.dataset.s14PlayerGuard ===
            "1"
    ) {
        return;
    }

    modal.dataset.s14PlayerGuard =
        "1";

    modal.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-p], [data-mp]"
                );

            if (!button) {
                return;
            }

            const playerId =
                button.dataset.p ||
                button.dataset.mp;

            if (!playerId) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            s13Close();

            setTimeout(
                () => {

                    if (
                        typeof start11V12Open ===
                        "function"
                    ) {

                        start11V12Open(
                            playerId
                        );

                    }

                },
                60
            );

        },
        true
    );

}


/* =========================================================
   2) REEL UDVIKLING OVER TID
========================================================= */

let s14SelectedDevelopmentPlayerId =
    null;


function s14PlayerEvaluations(
    player
) {

    const development =
        s13Dev(
            player
        );

    return [
        ...(
            development.evaluations ||
            []
        )
    ]
        .sort(
            (
                a,
                b
            ) =>
                String(
                    a.date ||
                    ""
                )
                    .localeCompare(
                        String(
                            b.date ||
                            ""
                        )
                    )
        );

}


function s14LatestEvaluation(
    player
) {

    return [
        ...s14PlayerEvaluations(
            player
        )
    ]
        .reverse()[0] ||
        null;

}


function s14AttributePreviousRating(
    player,
    attribute
) {

    const latest =
        s14LatestEvaluation(
            player
        );

    if (!latest) {
        return null;
    }

    const previous =
        (
            latest.attributes ||
            []
        )
            .find(
                item =>
                    item.id ===
                        attribute.id ||
                    String(
                        item.name ||
                        ""
                    )
                        .trim()
                        .toLowerCase() ===
                    String(
                        attribute.name ||
                        ""
                    )
                        .trim()
                        .toLowerCase()
            );

    return previous
        ? Number(
            previous.rating
        )
        : null;

}


function s14DeltaMarkup(
    delta
) {

    if (
        delta === null ||
        !Number.isFinite(
            delta
        )
    ) {
        return "—";
    }

    const className =
        delta > 0
            ? "s14-delta-pos"
            : (
                delta < 0
                    ? "s14-delta-neg"
                    : "s14-delta-flat"
            );

    const prefix =
        delta > 0
            ? "+"
            : "";

    return `
        <strong class="${className}">
            ${prefix}${delta}
        </strong>
    `;

}


function s14PlayerOverallHistory(
    player
) {

    const development =
        s13Dev(
            player
        );

    const history =
        s14PlayerEvaluations(
            player
        )
            .map(
                evaluation => ({
                    date:
                        evaluation.date,

                    title:
                        evaluation.title ||
                        "Evaluering",

                    value:
                        s13Ovr({
                            attributes:
                                evaluation.attributes ||
                                []
                        })
                })
            );

    history.push({
        date:
            "Nu",
        title:
            "Nuværende",
        value:
            s13Ovr(
                development
            )
    });

    return history;

}


function s14RenderDevelopment(
    target
) {

    const players =
        s13Players();

    if (
        !s14SelectedDevelopmentPlayerId &&
        players.length
    ) {

        s14SelectedDevelopmentPlayerId =
            players[0].id;

    }

    const player =
        players.find(
            item =>
                item.id ===
                s14SelectedDevelopmentPlayerId
        ) ||
        players[0] ||
        null;

    if (!player) {

        target.innerHTML = `
            <section class="s13panel">
                <div class="s13mut">
                    Der er ingen spillere på holdet endnu.
                </div>
            </section>
        `;

        return;
    }

    const development =
        s13Dev(
            player
        );

    const latest =
        s14LatestEvaluation(
            player
        );

    const currentOverall =
        s13Ovr(
            development
        );

    const previousOverall =
        latest
            ? s13Ovr({
                attributes:
                    latest.attributes ||
                    []
            })
            : null;

    const overallDelta =
        previousOverall === null
            ? null
            : currentOverall -
                previousOverall;

    const history =
        s14PlayerOverallHistory(
            player
        );

    target.innerHTML = `

        <div class="s14-dev-player">

            <section class="s13panel">

                <div class="s13head">
                    <strong>SPILLERE</strong>
                </div>

                <div class="s14-dev-player-list">

                    ${
                        players
                            .map(
                                item => {

                                    const dev =
                                        s13Dev(
                                            item
                                        );

                                    const prev =
                                        s14LatestEvaluation(
                                            item
                                        );

                                    const now =
                                        s13Ovr(
                                            dev
                                        );

                                    const before =
                                        prev
                                            ? s13Ovr({
                                                attributes:
                                                    prev.attributes ||
                                                    []
                                            })
                                            : null;

                                    const delta =
                                        before ===
                                        null
                                            ? null
                                            : now -
                                                before;

                                    return `
                                        <button
                                            type="button"
                                            class="
                                                s14-dev-player-button
                                                ${
                                                    item.id ===
                                                    player.id
                                                        ? "active"
                                                        : ""
                                                }
                                            "
                                            data-s14-player="${
                                                s13Esc(
                                                    item.id
                                                )
                                            }"
                                        >
                                            <span>
                                                <strong>
                                                    ${
                                                        s13Esc(
                                                            item.name
                                                        )
                                                    }
                                                </strong>

                                                <small
                                                    style="
                                                        display:block;
                                                        margin-top:3px;
                                                        color:#7D8980;
                                                        font-size:7px;
                                                    "
                                                >
                                                    ${
                                                        s13Esc(
                                                            item.position ||
                                                            "—"
                                                        )
                                                    }
                                                    · OVR ${now}
                                                </small>
                                            </span>

                                            <span>
                                                ${
                                                    s14DeltaMarkup(
                                                        delta
                                                    )
                                                }
                                            </span>
                                        </button>
                                    `;

                                }
                            )
                            .join(
                                ""
                            )
                    }

                </div>

            </section>


            <div>

                <div class="s13grid3">

                    <div class="s13stat">
                        <span>Nuværende OVR</span>
                        <strong>
                            ${currentOverall}
                        </strong>
                    </div>

                    <div class="s13stat">
                        <span>Sidste evaluering</span>
                        <strong>
                            ${
                                previousOverall ??
                                "—"
                            }
                        </strong>
                    </div>

                    <div class="s13stat">
                        <span>Fremskridt</span>
                        <strong>
                            ${
                                overallDelta ===
                                null
                                    ? "—"
                                    : (
                                        overallDelta >
                                        0
                                            ? `+${overallDelta}`
                                            : overallDelta
                                    )
                            }
                        </strong>
                    </div>

                </div>


                <section
                    class="s13panel"
                    style="margin-top:12px;"
                >

                    <div class="s13head">

                        <div>
                            <strong>
                                ATTRIBUTE-FREMSKRIDT
                            </strong>

                            <div class="s13mut">
                                Nuværende rating sammenlignes med seneste gemte evaluering.
                            </div>
                        </div>

                        <button
                            type="button"
                            class="s13btn"
                            id="s14OpenDevelopmentPlayer"
                        >
                            ÅBN SPILLERPROFIL
                        </button>

                    </div>


                    ${
                        (
                            development.attributes ||
                            []
                        )
                            .length
                            ? `
                                <div>

                                    ${
                                        development.attributes
                                            .map(
                                                attribute => {

                                                    const current =
                                                        Number(
                                                            attribute.rating ||
                                                            0
                                                        );

                                                    const previous =
                                                        s14AttributePreviousRating(
                                                            player,
                                                            attribute
                                                        );

                                                    const delta =
                                                        previous ===
                                                        null
                                                            ? null
                                                            : current -
                                                                previous;

                                                    return `
                                                        <div class="s14-progress-row">

                                                            <div>
                                                                <strong
                                                                    style="
                                                                        font-size:8px;
                                                                    "
                                                                >
                                                                    ${
                                                                        s13Esc(
                                                                            attribute.name
                                                                        )
                                                                    }
                                                                </strong>

                                                                <div class="s13mut">
                                                                    ${
                                                                        s13Esc(
                                                                            attribute.category ||
                                                                            ""
                                                                        )
                                                                    }
                                                                </div>
                                                            </div>

                                                            <div>
                                                                Nu
                                                                <strong>
                                                                    ${current}
                                                                </strong>
                                                            </div>

                                                            <div>
                                                                Før
                                                                <strong>
                                                                    ${
                                                                        previous ??
                                                                        "—"
                                                                    }
                                                                </strong>
                                                            </div>

                                                            <div>
                                                                ${
                                                                    s14DeltaMarkup(
                                                                        delta
                                                                    )
                                                                }
                                                            </div>

                                                            <div class="s14-progress-bar">
                                                                <span
                                                                    style="
                                                                        width:${Math.max(
                                                                            0,
                                                                            Math.min(
                                                                                100,
                                                                                current
                                                                            )
                                                                        )}%;
                                                                    "
                                                                ></span>
                                                            </div>

                                                        </div>
                                                    `;

                                                }
                                            )
                                            .join(
                                                ""
                                            )
                                    }

                                </div>
                            `
                            : `
                                <div class="s13mut">
                                    Spilleren har endnu ingen attributes.
                                </div>
                            `
                    }

                </section>


                <section
                    class="s13panel"
                    style="margin-top:12px;"
                >

                    <div class="s13head">

                        <div>
                            <strong>OVR OVER TID</strong>

                            <div class="s13mut">
                                Hver søjle er et gemt evaluerings-snapshot.
                            </div>
                        </div>

                    </div>

                    <div class="s14-history">

                        ${
                            history
                                .map(
                                    item => `
                                        <div class="s14-history-column">

                                            <strong
                                                style="
                                                    color:var(--s11-primary);
                                                    font-size:8px;
                                                "
                                            >
                                                ${item.value}
                                            </strong>

                                            <div
                                                class="s14-history-bar"
                                                style="
                                                    height:${
                                                        Math.max(
                                                            8,
                                                            Number(
                                                                item.value ||
                                                                0
                                                            ) *
                                                            .95
                                                        )
                                                    }px;
                                                "
                                            ></div>

                                            <small>
                                                ${
                                                    item.date ===
                                                    "Nu"
                                                        ? "NU"
                                                        : s13Date(
                                                            item.date
                                                        )
                                                }
                                            </small>

                                        </div>
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
                    style="margin-top:12px;"
                >

                    <div class="s13head">
                        <strong>RADAR · NU VS. SIDSTE EVALUERING</strong>
                    </div>

                    ${
                        typeof start11V11Radar ===
                            "function"
                            ? start11V11Radar(
                                development,
                                latest
                                    ?.attributes ||
                                null,
                                420
                            )
                            : ""
                    }

                </section>

            </div>

        </div>
    `;


    target.querySelectorAll(
        "[data-s14-player]"
    )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        s14SelectedDevelopmentPlayerId =
                            button.dataset
                                .s14Player;

                        s14RenderDevelopment(
                            target
                        );

                    }
                );

            }
        );


    document.getElementById(
        "s14OpenDevelopmentPlayer"
    )
        ?.addEventListener(
            "click",
            () => {

                s13Close();

                setTimeout(
                    () => {

                        if (
                            typeof start11V12Open ===
                            "function"
                        ) {

                            start11V12Open(
                                player.id
                            );

                        }

                    },
                    60
                );

            }
        );

}


/*
    Erstat kun udviklingsfanen.
*/
if (
    typeof s13Matrix ===
    "function"
) {

    s13Matrix =
        function (
            target
        ) {

            s14RenderDevelopment(
                target
            );

        };

}


/* =========================================================
   3) KAMPPLAN PR. KOMMENDE KAMP
========================================================= */

function s14MatchKey(
    match,
    index = 0
) {

    if (
        typeof start11V13MatchKey ===
        "function"
    ) {

        return start11V13MatchKey(
            match,
            index
        );

    }

    return String(
        match.matchNumber ||
        match.matchNo ||
        match.id ||
        `${match.date || ""}_${match.home || match.homeTeam || ""}_${match.away || match.awayTeam || ""}_${index}`
    );

}


function s14UpcomingMatches() {

    if (
        typeof start11CalendarV3SortedMatches !==
            "function"
    ) {

        return [];
    }

    return start11CalendarV3SortedMatches()
        .filter(
            match =>
                typeof start11CalendarV3IsUpcoming ===
                    "function"
                    ? start11CalendarV3IsUpcoming(
                        match
                    )
                    : true
        )
        .slice(
            0,
            6
        );

}


function s14Opponent(
    match
) {

    if (
        typeof start11V5GetOpponentData ===
        "function"
    ) {

        return start11V5GetOpponentData(
            start11CalendarNormalizeMatch(
                match
            )
        )?.name ||
        "Modstander";
    }

    return (
        match.away ||
        match.awayTeam ||
        match.home ||
        match.homeTeam ||
        "Modstander"
    );

}


function s14GetMatchPlan(
    match,
    index = 0
) {

    s14EnsureData();

    const key =
        s14MatchKey(
            match,
            index
        );

    return s13Data.matchPlans.find(
        plan =>
            plan.matchKey ===
            key
    ) ||
    null;

}


function s14EnsureGamePlanModal() {

    if (
        document.getElementById(
            "s14GamePlanModal"
        )
    ) {
        return;
    }

    const modal =
        document.createElement(
            "div"
        );

    modal.id =
        "s14GamePlanModal";

    modal.className =
        "modal";

    modal.innerHTML = `
        <div
            class="
                modal-content
                s14-gameplan-shell
            "
        >
            <div id="s14GamePlanInner"></div>
        </div>
    `;

    document.body.appendChild(
        modal
    );

    modal.addEventListener(
        "mousedown",
        event => {

            if (
                event.target ===
                modal
            ) {

                modal.style.display =
                    "none";

            }

        }
    );

}


function s14OpenGamePlan(
    rawMatch,
    index = 0
) {

    s14EnsureData();

    s14EnsureGamePlanModal();

    const match =
        typeof start11CalendarNormalizeMatch ===
            "function"
            ? start11CalendarNormalizeMatch(
                rawMatch
            )
            : rawMatch;

    const key =
        s14MatchKey(
            match,
            index
        );

    const existing =
        s14GetMatchPlan(
            match,
            index
        );

    const plan =
        existing
            ? s13Clone(
                existing
            )
            : {
                id:
                    s13Id(
                        "gameplan"
                    ),

                matchKey:
                    key,

                date:
                    match.date ||
                    "",

                opponent:
                    s14Opponent(
                        match
                    ),

                objective:
                    "",

                withBall:
                    "",

                withoutBall:
                    "",

                pressing:
                    "",

                buildUp:
                    "",

                transitions:
                    "",

                setPieces:
                    "",

                playerTasks:
                    "",

                risk:
                    "",

                coachMessage:
                    "",

                updatedAt:
                    ""
            };

    const inner =
        document.getElementById(
            "s14GamePlanInner"
        );

    inner.innerHTML = `

        <div class="s14-gameplan-top">

            <div>

                <h2>
                    GAMEPLAN
                </h2>

                <div class="s14-gameplan-match">
                    <span>
                        ${
                            s13Esc(
                                plan.opponent
                            )
                        }
                    </span>

                    <span>
                        ${
                            s13Date(
                                plan.date
                            )
                        }
                    </span>

                    <span class="s14-gameplan-status">
                        ${
                            existing
                                ? "GEMT PLAN"
                                : "NY PLAN"
                        }
                    </span>
                </div>

            </div>

            <button
                type="button"
                class="s13btn"
                id="s14GamePlanClose"
            >
                LUK
            </button>

        </div>


        <div class="s14-gameplan-body">

            <div class="s14-gameplan-grid">

                <section
                    class="
                        s14-gameplan-card
                        wide
                    "
                >
                    <h3>KAMPENS HOVEDMÅL</h3>

                    <textarea
                        id="s14GpObjective"
                        class="s13txt"
                        placeholder="Hvad skal være tydeligt i denne kamp?"
                    >${
                        s13Esc(
                            plan.objective
                        )
                    }</textarea>
                </section>


                <section class="s14-gameplan-card">

                    <h3>MED BOLD</h3>

                    <textarea
                        id="s14GpWithBall"
                        class="s13txt"
                        placeholder="Principper og løsninger med bold..."
                    >${
                        s13Esc(
                            plan.withBall
                        )
                    }</textarea>

                </section>


                <section class="s14-gameplan-card">

                    <h3>UDEN BOLD</h3>

                    <textarea
                        id="s14GpWithoutBall"
                        class="s13txt"
                        placeholder="Blok, presretning, kompakthed..."
                    >${
                        s13Esc(
                            plan.withoutBall
                        )
                    }</textarea>

                </section>


                <section class="s14-gameplan-card">

                    <h3>PRES</h3>

                    <textarea
                        id="s14GpPressing"
                        class="s13txt"
                        placeholder="Pres-triggers, roller, retning..."
                    >${
                        s13Esc(
                            plan.pressing
                        )
                    }</textarea>

                </section>


                <section class="s14-gameplan-card">

                    <h3>OPBYGNING</h3>

                    <textarea
                        id="s14GpBuildUp"
                        class="s13txt"
                        placeholder="Hvordan vil vi spille os frem?"
                    >${
                        s13Esc(
                            plan.buildUp
                        )
                    }</textarea>

                </section>


                <section class="s14-gameplan-card">

                    <h3>OMSTILLINGER</h3>

                    <textarea
                        id="s14GpTransitions"
                        class="s13txt"
                        placeholder="Genpres, kontra, restforsvar..."
                    >${
                        s13Esc(
                            plan.transitions
                        )
                    }</textarea>

                </section>


                <section class="s14-gameplan-card">

                    <h3>STANDARDER</h3>

                    <textarea
                        id="s14GpSetPieces"
                        class="s13txt"
                        placeholder="Hjørnespark, frispark, indkast..."
                    >${
                        s13Esc(
                            plan.setPieces
                        )
                    }</textarea>

                </section>


                <section class="s14-gameplan-card">

                    <h3>SPILLEROPGAVER</h3>

                    <textarea
                        id="s14GpPlayerTasks"
                        class="s13txt"
                        placeholder="Fx 9'er lukker CB→CB, 8'er lukker 6'er..."
                    >${
                        s13Esc(
                            plan.playerTasks
                        )
                    }</textarea>

                </section>


                <section class="s14-gameplan-card">

                    <h3>RISICI / MODSTANDER</h3>

                    <textarea
                        id="s14GpRisk"
                        class="s13txt"
                        placeholder="Hvad skal vi især være opmærksomme på?"
                    >${
                        s13Esc(
                            plan.risk
                        )
                    }</textarea>

                </section>


                <section
                    class="
                        s14-gameplan-card
                        wide
                    "
                >

                    <h3>TRÆNERBESKED</h3>

                    <textarea
                        id="s14GpCoach"
                        class="s13txt"
                        placeholder="Kort besked til spillerne før kampen..."
                    >${
                        s13Esc(
                            plan.coachMessage
                        )
                    }</textarea>

                </section>

            </div>


            <div
                style="
                    display:flex;
                    justify-content:flex-end;
                    gap:8px;
                    margin-top:14px;
                "
            >

                ${
                    existing
                        ? `
                            <button
                                type="button"
                                class="s13btn"
                                id="s14GamePlanDelete"
                            >
                                SLET PLAN
                            </button>
                        `
                        : ""
                }

                <button
                    type="button"
                    class="s13btn primary"
                    id="s14GamePlanSave"
                >
                    GEM GAMEPLAN
                </button>

            </div>

        </div>
    `;


    document.getElementById(
        "s14GamePlanClose"
    )
        ?.addEventListener(
            "click",
            () => {

                document.getElementById(
                    "s14GamePlanModal"
                )
                    .style.display =
                    "none";

            }
        );


    document.getElementById(
        "s14GamePlanSave"
    )
        ?.addEventListener(
            "click",
            () => {

                plan.objective =
                    document.getElementById(
                        "s14GpObjective"
                    )?.value ||
                    "";

                plan.withBall =
                    document.getElementById(
                        "s14GpWithBall"
                    )?.value ||
                    "";

                plan.withoutBall =
                    document.getElementById(
                        "s14GpWithoutBall"
                    )?.value ||
                    "";

                plan.pressing =
                    document.getElementById(
                        "s14GpPressing"
                    )?.value ||
                    "";

                plan.buildUp =
                    document.getElementById(
                        "s14GpBuildUp"
                    )?.value ||
                    "";

                plan.transitions =
                    document.getElementById(
                        "s14GpTransitions"
                    )?.value ||
                    "";

                plan.setPieces =
                    document.getElementById(
                        "s14GpSetPieces"
                    )?.value ||
                    "";

                plan.playerTasks =
                    document.getElementById(
                        "s14GpPlayerTasks"
                    )?.value ||
                    "";

                plan.risk =
                    document.getElementById(
                        "s14GpRisk"
                    )?.value ||
                    "";

                plan.coachMessage =
                    document.getElementById(
                        "s14GpCoach"
                    )?.value ||
                    "";

                plan.updatedAt =
                    new Date()
                        .toISOString();


                const planIndex =
                    s13Data.matchPlans
                        .findIndex(
                            item =>
                                item.matchKey ===
                                key
                        );


                if (
                    planIndex === -1
                ) {

                    s13Data.matchPlans.push(
                        plan
                    );

                } else {

                    s13Data.matchPlans[
                        planIndex
                    ] =
                        plan;

                }


                s13Save();

                s14DecorateUpcomingRows();


                document.getElementById(
                    "s14GamePlanModal"
                )
                    .style.display =
                    "none";


                if (
                    typeof visNotification ===
                    "function"
                ) {

                    visNotification(
                        "Gameplanen er gemt til kampen."
                    );

                }

            }
        );


    document.getElementById(
        "s14GamePlanDelete"
    )
        ?.addEventListener(
            "click",
            () => {

                if (
                    !window.confirm(
                        "Slet gameplanen til denne kamp?"
                    )
                ) {
                    return;
                }


                s13Data.matchPlans =
                    s13Data.matchPlans
                        .filter(
                            item =>
                                item.matchKey !==
                                key
                        );


                s13Save();

                s14DecorateUpcomingRows();


                document.getElementById(
                    "s14GamePlanModal"
                )
                    .style.display =
                    "none";

            }
        );


    document.getElementById(
        "s14GamePlanModal"
    )
        .style.display =
        "flex";

}


function s14DecorateUpcomingRows() {

    const list =
        document.getElementById(
            "upcomingMatchesList"
        );

    if (!list) {
        return;
    }

    const matches =
        s14UpcomingMatches();

    const rows =
        [
            ...list.querySelectorAll(
                ".start11-upcoming-v5-row, .start11-upcoming-v2-row"
            )
        ];

    rows.forEach(
        (
            row,
            index
        ) => {

            const match =
                matches[
                    index
                ];

            if (!match) {
                return;
            }

            row.dataset.s14UpcomingIndex =
                String(
                    index
                );

            const existingBadge =
                row.querySelector(
                    ".s14-upcoming-plan-badge"
                );

            const hasPlan =
                Boolean(
                    s14GetMatchPlan(
                        match,
                        index
                    )
                );

            if (
                hasPlan &&
                !existingBadge
            ) {

                const opponentCopy =
                    row.querySelector(
                        ".start11-v5-opponent-copy strong"
                    ) ||
                    row.querySelector(
                        ".match-opponent"
                    );


                if (opponentCopy) {

                    const badge =
                        document.createElement(
                            "span"
                        );

                    badge.className =
                        "s14-upcoming-plan-badge";

                    badge.textContent =
                        "GAMEPLAN";

                    opponentCopy.appendChild(
                        badge
                    );

                }

            } else if (
                !hasPlan &&
                existingBadge
            ) {

                existingBadge.remove();

            }

        }
    );

}


function s14InstallUpcomingGamePlanClicks() {

    const list =
        document.getElementById(
            "upcomingMatchesList"
        );

    if (
        !list ||
        list.dataset.s14GamePlanBound ===
            "1"
    ) {
        return;
    }

    list.dataset.s14GamePlanBound =
        "1";

    list.addEventListener(
        "click",
        event => {

            const row =
                event.target.closest(
                    ".start11-upcoming-v5-row, .start11-upcoming-v2-row"
                );

            if (!row) {
                return;
            }

            const rows =
                [
                    ...list.querySelectorAll(
                        ".start11-upcoming-v5-row, .start11-upcoming-v2-row"
                    )
                ];

            const index =
                rows.indexOf(
                    row
                );

            const match =
                s14UpcomingMatches()[
                    index
                ];

            if (!match) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            s14OpenGamePlan(
                match,
                index
            );

        },
        true
    );

    s14DecorateUpcomingRows();

}


/* =========================================================
   4) UDVIDET VIDEOANALYSE
========================================================= */

let s14SelectedClipId =
    null;

let s14VideoPlayerFilter =
    "";

let s14VideoPhaseFilter =
    "";


function s14ClipPlayer(
    clip
) {

    return s13Players().find(
        player =>
            player.id ===
            clip.playerId
    ) ||
    null;

}


function s14ClipAttributeName(
    clip
) {

    const player =
        s14ClipPlayer(
            clip
        );

    if (!player) {
        return "";
    }

    const development =
        s13Dev(
            player
        );

    return (
        development.attributes ||
        []
    )
        .find(
            attribute =>
                attribute.id ===
                clip.attributeId
        )
        ?.name ||
        "";

}


function s14FilteredClips() {

    s14EnsureData();

    return s13Data.videoClips.filter(
        clip => {

            if (
                s14VideoPlayerFilter &&
                clip.playerId !==
                s14VideoPlayerFilter
            ) {
                return false;
            }

            if (
                s14VideoPhaseFilter &&
                clip.phase !==
                s14VideoPhaseFilter
            ) {
                return false;
            }

            return true;

        }
    );

}


function s14RenderVideoAnalysis(
    target
) {

    s14EnsureData();

    const clips =
        s14FilteredClips();

    if (
        s14SelectedClipId &&
        !s13Data.videoClips.some(
            clip =>
                clip.id ===
                s14SelectedClipId
        )
    ) {

        s14SelectedClipId =
            null;

    }

    const selected =
        s13Data.videoClips.find(
            clip =>
                clip.id ===
                s14SelectedClipId
        ) ||
        null;

    const positiveCount =
        s13Data.videoClips.filter(
            clip =>
                clip.outcome ===
                "Positiv"
        ).length;

    const developmentCount =
        s13Data.videoClips.filter(
            clip =>
                clip.outcome ===
                "Udvikling"
        ).length;

    const meetingsCount =
        s13Data.videoClips.filter(
            clip =>
                clip.showInMeeting ===
                true
        ).length;

    target.innerHTML = `

        <div class="s14-video-stat-grid">

            <div class="s13stat">
                <span>Alle klip</span>
                <strong>
                    ${
                        s13Data.videoClips
                            .length
                    }
                </strong>
            </div>

            <div class="s13stat">
                <span>Positive</span>
                <strong>
                    ${positiveCount}
                </strong>
            </div>

            <div class="s13stat">
                <span>Udviklingsklip</span>
                <strong>
                    ${developmentCount}
                </strong>
            </div>

            <div class="s13stat">
                <span>Til spillersamtale</span>
                <strong>
                    ${meetingsCount}
                </strong>
            </div>

        </div>


        <div class="s14-video-filter-row">

            <button
                type="button"
                class="s13btn primary"
                id="s14NewClip"
            >
                + NYT VIDEOCLIP
            </button>

            <select
                id="s14VideoPlayerFilter"
                class="s13sel"
            >
                <option value="">
                    Alle spillere
                </option>

                ${
                    s13Players()
                        .map(
                            player => `
                                <option
                                    value="${
                                        s13Esc(
                                            player.id
                                        )
                                    }"
                                    ${
                                        s14VideoPlayerFilter ===
                                        player.id
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    ${
                                        s13Esc(
                                            player.name
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
                id="s14VideoPhaseFilter"
                class="s13sel"
            >
                <option value="">
                    Alle spilfaser
                </option>

                ${
                    [
                        "Med bold",
                        "Uden bold",
                        "Offensiv omstilling",
                        "Defensiv omstilling",
                        "Standard"
                    ]
                        .map(
                            phase => `
                                <option
                                    ${
                                        s14VideoPhaseFilter ===
                                        phase
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    ${phase}
                                </option>
                            `
                        )
                        .join(
                            ""
                        )
                }
            </select>

        </div>


        <div class="s14-video-layout">

            <section class="s13panel">

                <div class="s13head">

                    <div>
                        <strong>KLIPBIBLIOTEK</strong>

                        <div class="s13mut">
                            Klik på et klip for at analysere det.
                        </div>
                    </div>

                </div>


                <div class="s14-video-list">

                    ${
                        clips.length
                            ? clips
                                .map(
                                    clip => {

                                        const player =
                                            s14ClipPlayer(
                                                clip
                                            );

                                        const attribute =
                                            s14ClipAttributeName(
                                                clip
                                            );

                                        return `
                                            <div
                                                class="
                                                    s14-video-clip
                                                    ${
                                                        selected?.id ===
                                                        clip.id
                                                            ? "active"
                                                            : ""
                                                    }
                                                "
                                                data-s14-clip="${
                                                    s13Esc(
                                                        clip.id
                                                    )
                                                }"
                                            >

                                                <div class="s13title">
                                                    ${
                                                        s13Esc(
                                                            clip.title ||
                                                            "Videoklip"
                                                        )
                                                    }
                                                </div>

                                                <div class="s14-video-meta">
                                                    ${
                                                        player
                                                            ? s13Esc(
                                                                player.name
                                                            )
                                                            : "Holdklip"
                                                    }
                                                    ${
                                                        clip.match
                                                            ? ` · ${s13Esc(
                                                                clip.match
                                                            )}`
                                                            : ""
                                                    }
                                                    ${
                                                        clip.start
                                                            ? ` · ${s13Esc(
                                                                clip.start
                                                            )}`
                                                            : ""
                                                    }
                                                </div>


                                                <div class="s14-video-tags">

                                                    ${
                                                        clip.phase
                                                            ? `
                                                                <span class="s14-video-tag">
                                                                    ${
                                                                        s13Esc(
                                                                            clip.phase
                                                                        )
                                                                    }
                                                                </span>
                                                            `
                                                            : ""
                                                    }

                                                    ${
                                                        attribute
                                                            ? `
                                                                <span class="s14-video-tag">
                                                                    ${
                                                                        s13Esc(
                                                                            attribute
                                                                        )
                                                                    }
                                                                </span>
                                                            `
                                                            : ""
                                                    }

                                                    ${
                                                        clip.outcome
                                                            ? `
                                                                <span class="s14-video-tag">
                                                                    ${
                                                                        s13Esc(
                                                                            clip.outcome
                                                                        )
                                                                    }
                                                                </span>
                                                            `
                                                            : ""
                                                    }

                                                </div>

                                            </div>
                                        `;

                                    }
                                )
                                .join(
                                    ""
                                )
                            : `
                                <div class="s13mut">
                                    Ingen videoklip matcher filtrene.
                                </div>
                            `
                    }

                </div>

            </section>


            <section class="s13panel">

                ${
                    selected
                        ? s14VideoEditorMarkup(
                            selected
                        )
                        : `
                            <div class="s13head">
                                <strong>VIDEOANALYSE</strong>
                            </div>

                            <div class="s14-video-player">
                                <div>
                                    <div
                                        style="
                                            font-size:24px;
                                            margin-bottom:8px;
                                        "
                                    >
                                        ▶
                                    </div>

                                    <div class="s13mut">
                                        Vælg et klip eller opret et nyt.
                                    </div>
                                </div>
                            </div>
                        `
                }

            </section>

        </div>
    `;


    document.getElementById(
        "s14VideoPlayerFilter"
    )
        ?.addEventListener(
            "change",
            event => {

                s14VideoPlayerFilter =
                    event.target.value;

                s14RenderVideoAnalysis(
                    target
                );

            }
        );


    document.getElementById(
        "s14VideoPhaseFilter"
    )
        ?.addEventListener(
            "change",
            event => {

                s14VideoPhaseFilter =
                    event.target.value;

                s14RenderVideoAnalysis(
                    target
                );

            }
        );


    document.getElementById(
        "s14NewClip"
    )
        ?.addEventListener(
            "click",
            () => {

                const clip = {
                    id:
                        s13Id(
                            "clip"
                        ),

                    title:
                        "Nyt videoklip",

                    url:
                        "",

                    match:
                        "",

                    playerId:
                        "",

                    attributeId:
                        "",

                    start:
                        "",

                    end:
                        "",

                    phase:
                        "Med bold",

                    outcome:
                        "Udvikling",

                    tags:
                        "",

                    observation:
                        "",

                    coachingQuestion:
                        "",

                    action:
                        "",

                    showInMeeting:
                        true,

                    createdAt:
                        new Date()
                            .toISOString()
                };


                s13Data.videoClips.unshift(
                    clip
                );

                s14SelectedClipId =
                    clip.id;

                s13Save();

                s14RenderVideoAnalysis(
                    target
                );

            }
        );


    target.querySelectorAll(
        "[data-s14-clip]"
    )
        .forEach(
            row => {

                row.addEventListener(
                    "click",
                    () => {

                        s14SelectedClipId =
                            row.dataset
                                .s14Clip;

                        s14RenderVideoAnalysis(
                            target
                        );

                    }
                );

            }
        );


    if (selected) {

        s14BindVideoEditor(
            target,
            selected
        );

    }

}


function s14VideoEditorMarkup(
    clip
) {

    const player =
        s14ClipPlayer(
            clip
        );

    const development =
        player
            ? s13Dev(
                player
            )
            : null;

    const attributes =
        development
            ?.attributes ||
        [];

    return `

        <div class="s13head">

            <div>
                <strong>VIDEOANALYSE</strong>

                <div class="s13mut">
                    Observation → spørgsmål → handling.
                </div>
            </div>

            <button
                type="button"
                class="s13btn"
                id="s14DeleteClip"
            >
                SLET
            </button>

        </div>


        <div class="s14-video-player">

            ${
                clip.url
                    ? `
                        <div>
                            <div
                                style="
                                    font-size:28px;
                                    margin-bottom:10px;
                                "
                            >
                                ▶
                            </div>

                            <a
                                href="${
                                    s13Esc(
                                        clip.url
                                    )
                                }"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                ÅBN VIDEO / KLIP ↗
                            </a>

                            ${
                                clip.start ||
                                clip.end
                                    ? `
                                        <div
                                            class="s13mut"
                                            style="margin-top:8px;"
                                        >
                                            Klip:
                                            ${
                                                s13Esc(
                                                    clip.start ||
                                                    "start"
                                                )
                                            }
                                            →
                                            ${
                                                s13Esc(
                                                    clip.end ||
                                                    "slut"
                                                )
                                            }
                                        </div>
                                    `
                                    : ""
                            }
                        </div>
                    `
                    : `
                        <div class="s13mut">
                            Tilføj et videolink nedenfor.
                        </div>
                    `
            }

        </div>


        <div
            class="s13stack"
            style="margin-top:12px;"
        >

            <label class="s13field">
                Titel

                <input
                    id="s14ClipTitle"
                    class="s13in"
                    value="${
                        s13Esc(
                            clip.title ||
                            ""
                        )
                    }"
                >
            </label>


            <label class="s13field">
                Videolink

                <input
                    id="s14ClipUrl"
                    class="s13in"
                    value="${
                        s13Esc(
                            clip.url ||
                            ""
                        )
                    }"
                    placeholder="https://..."
                >
            </label>


            <div class="s14-video-form-grid">

                <label class="s13field">
                    Kamp

                    <input
                        id="s14ClipMatch"
                        class="s13in"
                        value="${
                            s13Esc(
                                clip.match ||
                                ""
                            )
                        }"
                        placeholder="Fx vs AGF"
                    >
                </label>


                <label class="s13field">
                    Spiller

                    <select
                        id="s14ClipPlayer"
                        class="s13sel"
                    >
                        <option value="">
                            Holdklip
                        </option>

                        ${
                            s13Players()
                                .map(
                                    item => `
                                        <option
                                            value="${
                                                s13Esc(
                                                    item.id
                                                )
                                            }"
                                            ${
                                                clip.playerId ===
                                                item.id
                                                    ? "selected"
                                                    : ""
                                            }
                                        >
                                            ${
                                                s13Esc(
                                                    item.name
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

                </label>


                <label class="s13field">
                    Start

                    <input
                        id="s14ClipStart"
                        class="s13in"
                        value="${
                            s13Esc(
                                clip.start ||
                                ""
                            )
                        }"
                        placeholder="34:20"
                    >
                </label>


                <label class="s13field">
                    Slut

                    <input
                        id="s14ClipEnd"
                        class="s13in"
                        value="${
                            s13Esc(
                                clip.end ||
                                ""
                            )
                        }"
                        placeholder="34:36"
                    >
                </label>


                <label class="s13field">
                    Spilfase

                    <select
                        id="s14ClipPhase"
                        class="s13sel"
                    >
                        ${
                            [
                                "Med bold",
                                "Uden bold",
                                "Offensiv omstilling",
                                "Defensiv omstilling",
                                "Standard"
                            ]
                                .map(
                                    phase => `
                                        <option
                                            ${
                                                clip.phase ===
                                                phase
                                                    ? "selected"
                                                    : ""
                                            }
                                        >
                                            ${phase}
                                        </option>
                                    `
                                )
                                .join(
                                    ""
                                )
                        }
                    </select>

                </label>


                <label class="s13field">
                    Kliptype

                    <select
                        id="s14ClipOutcome"
                        class="s13sel"
                    >
                        ${
                            [
                                "Positiv",
                                "Udvikling",
                                "Korrigering"
                            ]
                                .map(
                                    outcome => `
                                        <option
                                            ${
                                                clip.outcome ===
                                                outcome
                                                    ? "selected"
                                                    : ""
                                            }
                                        >
                                            ${outcome}
                                        </option>
                                    `
                                )
                                .join(
                                    ""
                                )
                        }
                    </select>

                </label>


                <label class="s13field">
                    Attribute

                    <select
                        id="s14ClipAttribute"
                        class="s13sel"
                    >
                        <option value="">
                            Intet attribute
                        </option>

                        ${
                            attributes
                                .map(
                                    attribute => `
                                        <option
                                            value="${
                                                s13Esc(
                                                    attribute.id
                                                )
                                            }"
                                            ${
                                                clip.attributeId ===
                                                attribute.id
                                                    ? "selected"
                                                    : ""
                                            }
                                        >
                                            ${
                                                s13Esc(
                                                    attribute.name
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

                </label>


                <label class="s13field">
                    Tags

                    <input
                        id="s14ClipTags"
                        class="s13in"
                        value="${
                            s13Esc(
                                clip.tags ||
                                ""
                            )
                        }"
                        placeholder="1v1, scanning, genpres"
                    >
                </label>

            </div>


            <label class="s13field">
                Observation

                <textarea
                    id="s14ClipObservation"
                    class="s13txt"
                    placeholder="Hvad sker der konkret i klippet?"
                >${
                    s13Esc(
                        clip.observation ||
                        ""
                    )
                }</textarea>
            </label>


            <label class="s13field">
                Coaching-spørgsmål

                <textarea
                    id="s14ClipQuestion"
                    class="s13txt"
                    placeholder="Fx Hvad kunne du have set før boldmodtagelsen?"
                >${
                    s13Esc(
                        clip.coachingQuestion ||
                        ""
                    )
                }</textarea>
            </label>


            <label class="s13field">
                Næste handling

                <textarea
                    id="s14ClipAction"
                    class="s13txt"
                    placeholder="Hvad skal spilleren gøre anderledes / gentage?"
                >${
                    s13Esc(
                        clip.action ||
                        ""
                    )
                }</textarea>
            </label>


            <label
                style="
                    display:flex;
                    align-items:center;
                    gap:7px;
                    color:#C4CDC6;
                    font-size:8px;
                "
            >
                <input
                    id="s14ClipMeeting"
                    type="checkbox"
                    ${
                        clip.showInMeeting
                            ? "checked"
                            : ""
                    }
                >

                Vis klippet i spillersamtale
            </label>


            <div
                style="
                    display:flex;
                    justify-content:flex-end;
                "
            >

                <button
                    type="button"
                    class="s13btn primary"
                    id="s14SaveClip"
                >
                    GEM VIDEOANALYSE
                </button>

            </div>

        </div>
    `;

}


function s14BindVideoEditor(
    target,
    clip
) {

    document.getElementById(
        "s14ClipPlayer"
    )
        ?.addEventListener(
            "change",
            event => {

                clip.playerId =
                    event.target.value;

                clip.attributeId =
                    "";

                s13Save();

                s14RenderVideoAnalysis(
                    target
                );

            }
        );


    document.getElementById(
        "s14SaveClip"
    )
        ?.addEventListener(
            "click",
            () => {

                clip.title =
                    document.getElementById(
                        "s14ClipTitle"
                    )?.value.trim() ||
                    "Videoklip";

                clip.url =
                    document.getElementById(
                        "s14ClipUrl"
                    )?.value.trim() ||
                    "";

                clip.match =
                    document.getElementById(
                        "s14ClipMatch"
                    )?.value.trim() ||
                    "";

                clip.playerId =
                    document.getElementById(
                        "s14ClipPlayer"
                    )?.value ||
                    "";

                clip.start =
                    document.getElementById(
                        "s14ClipStart"
                    )?.value.trim() ||
                    "";

                clip.end =
                    document.getElementById(
                        "s14ClipEnd"
                    )?.value.trim() ||
                    "";

                clip.phase =
                    document.getElementById(
                        "s14ClipPhase"
                    )?.value ||
                    "";

                clip.outcome =
                    document.getElementById(
                        "s14ClipOutcome"
                    )?.value ||
                    "";

                clip.attributeId =
                    document.getElementById(
                        "s14ClipAttribute"
                    )?.value ||
                    "";

                clip.tags =
                    document.getElementById(
                        "s14ClipTags"
                    )?.value.trim() ||
                    "";

                clip.observation =
                    document.getElementById(
                        "s14ClipObservation"
                    )?.value ||
                    "";

                clip.coachingQuestion =
                    document.getElementById(
                        "s14ClipQuestion"
                    )?.value ||
                    "";

                clip.action =
                    document.getElementById(
                        "s14ClipAction"
                    )?.value ||
                    "";

                clip.showInMeeting =
                    Boolean(
                        document.getElementById(
                            "s14ClipMeeting"
                        )?.checked
                    );


                s13Save();

                s14RenderVideoAnalysis(
                    target
                );


                if (
                    typeof visNotification ===
                    "function"
                ) {

                    visNotification(
                        "Videoanalysen er gemt."
                    );

                }

            }
        );


    document.getElementById(
        "s14DeleteClip"
    )
        ?.addEventListener(
            "click",
            () => {

                if (
                    !window.confirm(
                        "Slet videoklippet?"
                    )
                ) {
                    return;
                }


                s13Data.videoClips =
                    s13Data.videoClips
                        .filter(
                            item =>
                                item.id !==
                                clip.id
                        );


                s14SelectedClipId =
                    null;

                s13Save();

                s14RenderVideoAnalysis(
                    target
                );

            }
        );

}


/*
    Erstat V13-videoarkivet med V14-videoanalyse.
*/
if (
    typeof s13Videos ===
    "function"
) {

    s13Videos =
        function (
            target
        ) {

            s14RenderVideoAnalysis(
                target
            );

        };

}


/* =========================================================
   VIDEOER I SPILLERSAMTALEN
========================================================= */

function s14MeetingClipsForPlayer(
    playerId
) {

    s14EnsureData();

    return s13Data.videoClips
        .filter(
            clip =>
                clip.playerId ===
                    playerId &&
                clip.showInMeeting ===
                    true
        )
        .slice(
            0,
            8
        );

}


/*
    Tilføj V14-klip til presentation efter V13 har renderet den.
*/
if (
    typeof s13Present ===
    "function"
) {

    const s14PresentBefore =
        s13Present;


    s13Present =
        function (
            player
        ) {

            s14PresentBefore(
                player
            );


            const overlay =
                document.getElementById(
                    "s13present"
                );


            const inner =
                overlay?.querySelector(
                    ".s13presentin"
                );


            if (
                !inner ||
                inner.querySelector(
                    ".s14-meeting-video-section"
                )
            ) {
                return;
            }


            const clips =
                s14MeetingClipsForPlayer(
                    player.id
                );


            if (!clips.length) {
                return;
            }


            const section =
                document.createElement(
                    "section"
                );


            section.className =
                "s13panel s14-meeting-video-section";

            section.style.marginTop =
                "14px";


            section.innerHTML = `

                <div class="s13head">
                    <strong>VIDEOANALYSE TIL SAMTALEN</strong>
                </div>

                <div class="s13grid">

                    ${
                        clips
                            .map(
                                clip => `
                                    <div class="s13item">

                                        <div class="s13title">
                                            ${
                                                s13Esc(
                                                    clip.title
                                                )
                                            }
                                        </div>

                                        <div class="s13mut">
                                            ${
                                                s13Esc(
                                                    clip.phase ||
                                                    ""
                                                )
                                            }
                                            ${
                                                clip.start
                                                    ? ` · ${s13Esc(
                                                        clip.start
                                                    )}`
                                                    : ""
                                            }
                                        </div>

                                        ${
                                            clip.observation
                                                ? `
                                                    <p class="s13mut">
                                                        ${
                                                            s13Esc(
                                                                clip.observation
                                                            )
                                                        }
                                                    </p>
                                                `
                                                : ""
                                        }

                                        ${
                                            clip.coachingQuestion
                                                ? `
                                                    <p
                                                        style="
                                                            color:var(--s11-primary);
                                                            font-size:8px;
                                                            line-height:1.45;
                                                        "
                                                    >
                                                        ${
                                                            s13Esc(
                                                                clip.coachingQuestion
                                                            )
                                                        }
                                                    </p>
                                                `
                                                : ""
                                        }

                                        ${
                                            clip.url
                                                ? `
                                                    <a
                                                        href="${
                                                            s13Esc(
                                                                clip.url
                                                            )
                                                        }"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style="
                                                            color:var(--s11-primary);
                                                            font-size:8px;
                                                        "
                                                    >
                                                        ÅBN KLIP ↗
                                                    </a>
                                                `
                                                : ""
                                        }

                                    </div>
                                `
                            )
                            .join(
                                ""
                            )
                    }

                </div>
            `;


            const closeSection =
                inner.lastElementChild;


            if (closeSection) {

                inner.insertBefore(
                    section,
                    closeSection
                );

            } else {

                inner.appendChild(
                    section
                );

            }

        };

}


/* =========================================================
   INIT / DOM REFRESH
========================================================= */

function s14RefreshDynamicUi() {

    s14EnsureData();

    s14InstallPlayerOpenGuard();

    s14InstallUpcomingGamePlanClicks();

    s14DecorateUpcomingRows();

}


function s14Init() {

    s14EnsureData();

    s14InstallStyles();

    s14EnsureGamePlanModal();

    s14RefreshDynamicUi();


    let timer =
        null;


    const observer =
        new MutationObserver(
            mutations => {

                const relevant =
                    mutations.some(
                        mutation => {

                            return [
                                ...mutation.addedNodes
                            ]
                                .some(
                                    node => {

                                        if (
                                            !(node instanceof Element)
                                        ) {
                                            return false;
                                        }

                                        return (
                                            node.id ===
                                                "upcomingMatchesList" ||
                                            node.id ===
                                                "s13modal" ||
                                            node.matches?.(
                                                ".start11-upcoming-v5-row, .start11-upcoming-v2-row"
                                            ) ||
                                            node.querySelector?.(
                                                "#upcomingMatchesList, #s13modal, .start11-upcoming-v5-row, .start11-upcoming-v2-row"
                                            )
                                        );

                                    }
                                );

                        }
                    );


                if (!relevant) {
                    return;
                }


                if (timer) {
                    clearTimeout(
                        timer
                    );
                }


                timer =
                    setTimeout(
                        () => {

                            timer =
                                null;

                            s14RefreshDynamicUi();

                        },
                        100
                    );

            }
        );


    observer.observe(
        document.body,
        {
            childList:
                true,
            subtree:
                true
        }
    );

}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () =>
            setTimeout(
                s14Init,
                2100
            )
    );

} else {

    setTimeout(
        s14Init,
        2100
    );

}



