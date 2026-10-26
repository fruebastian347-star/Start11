/* START11 – Kalenderplanlægger v1
 * Adds a unified activity layer without replacing existing match/session data.
 */
(() => {
  'use strict';
  if (window.__START11_CALENDAR_PLANNER_V1__) return;
  window.__START11_CALENDAR_PLANNER_V1__ = true;

  const TYPES = ['Træning','Kamp','Træningskamp','Møde','Turnering','Stævne','Fysisk træning','Videoanalyse','Social aktivitet','Andet'];
  const STATUSES = ['Planlagt','Gennemført','Aflyst','Flyttet'];
  const esc = v => typeof s13Esc === 'function' ? s13Esc(v ?? '') : String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const today = () => new Date().toISOString().slice(0,10);
  const id = () => typeof s13Id === 'function' ? s13Id('activity') : `activity_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
  const data = () => { if (typeof s13Data === 'undefined' || !s13Data || typeof s13Data !== 'object') { throw new Error('START11 Coaching Hub-data er ikke initialiseret'); } if (!Array.isArray(s13Data.calendarActivities)) s13Data.calendarActivities=[]; if (!Array.isArray(s13Data.calendarPlaces)) s13Data.calendarPlaces=[]; return s13Data; };
  // s13Data is declared with top-level `let` in 05_coaching_hub.js, so it is a global lexical binding, not window.s13Data.
  const trainingSessions = () => typeof s13Data !== 'undefined' && Array.isArray(s13Data.sessions) ? s13Data.sessions : [];
  const hasTrainingData = () => typeof s13Data !== 'undefined' && !!s13Data && Array.isArray(s13Data.sessions);
  const save = () => { try { if (typeof s13Save === 'function') s13Save(); else if (typeof scheduleCloudSave === 'function') scheduleCloudSave(); } catch(e) { console.warn('START11 calendar save failed',e); } };
  const activeTeam = () => { try { return typeof s13Meta === 'function' ? (s13Meta().teamName || '') : ''; } catch(_) { return ''; } };
  const formatDate = d => { try { return new Date(`${d}T12:00:00`).toLocaleDateString('da-DK',{day:'2-digit',month:'short'}); } catch(_) { return d || ''; } };
  const activities = () => data().calendarActivities;
  const css = `
  #s11ActivityOverlay{position:fixed;inset:0;z-index:2147483500;display:none;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.78);backdrop-filter:blur(7px);overflow:auto;color:#f4f7f4;font:inherit}
  #s11ActivityOverlay.open{display:flex}.s11-act-modal{width:min(850px,98vw);max-height:92vh;overflow:auto;border:1px solid rgba(255,255,255,.15);border-radius:15px;background:#0b120d;box-shadow:0 24px 80px rgba(0,0,0,.5);padding:18px}
  .s11-act-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:15px}.s11-act-head h2{margin:0;font-size:20px}.s11-act-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.s11-act-field{display:grid;gap:5px;min-width:0}.s11-act-field.full{grid-column:1/-1}.s11-act-field label{font-size:11px;color:#aab8ad;font-weight:800}.s11-act-field input,.s11-act-field select,.s11-act-field textarea{box-sizing:border-box;width:100%;min-height:39px;padding:9px 10px;border:1px solid rgba(255,255,255,.13);border-radius:7px;background:#050a06;color:#fff;font:inherit;font-size:13px}.s11-act-field textarea{min-height:72px;resize:vertical}.s11-act-actions{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end;margin-top:17px}.s11-act-btn{border:1px solid rgba(255,255,255,.16);border-radius:7px;padding:10px 13px;background:#152119;color:#f5fff7;font:inherit;font-size:12px;font-weight:800;cursor:pointer}.s11-act-btn.primary{background:var(--s11-primary,#8cf34d);color:#071006;border-color:transparent}.s11-act-btn.danger{color:#ffb3b3}.s11-act-check{display:flex;gap:8px;align-items:center;font-size:12px;color:#d7e0d9}.s11-act-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px}.s11-act-chip{display:inline-block;border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:3px 7px;font-size:10px;color:#c9d4cc}.s11-act-event{display:block;width:100%;overflow:hidden;text-align:left;white-space:nowrap;text-overflow:ellipsis;margin-top:3px;padding:3px 5px;border:1px solid rgba(140,243,77,.2);border-radius:4px;background:rgba(140,243,77,.08);color:#e6f5e4;font:inherit;font-size:9px;cursor:pointer}.s11-act-event[data-status="Aflyst"]{opacity:.58;text-decoration:line-through}.s11-act-event[data-status="Gennemført"]{border-color:rgba(80,190,130,.4)}.s11-act-event[data-status="Flyttet"]{border-color:rgba(255,190,70,.4)}.s11-act-month-list{display:grid;gap:7px;margin-top:12px}.s11-act-list-row{display:grid;grid-template-columns:85px minmax(0,1fr) auto;gap:10px;align-items:center;padding:10px;border:1px solid rgba(255,255,255,.08);border-radius:7px;background:#09110b}.s11-act-list-row small{display:block;color:#93a197;margin-top:3px}.s11-act-filters{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.s11-act-filters select{max-width:190px;min-height:32px;border:1px solid rgba(255,255,255,.13);border-radius:6px;background:#08100a;color:#fff;padding:5px 8px;font:inherit;font-size:11px}
  @media(max-width:620px){.s11-act-modal{padding:12px}.s11-act-grid{grid-template-columns:1fr}.s11-act-field.full{grid-column:auto}.s11-act-list-row{grid-template-columns:65px minmax(0,1fr)}.s11-act-list-row button{grid-column:1/-1}.s11-act-head h2{font-size:17px}}
  `;
  function styles(){ if(document.getElementById('s11ActivityStyles'))return; const s=document.createElement('style');s.id='s11ActivityStyles';s.textContent=css;document.head.appendChild(s); }
  function ensureNorm(){
    if(typeof s13Norm==='function'&&!s13Norm.__s11CalendarActivities){const old=s13Norm;const wrapped=function(raw={}){const out=old(raw);out.calendarActivities=Array.isArray(raw.calendarActivities)?raw.calendarActivities:[];out.calendarPlaces=Array.isArray(raw.calendarPlaces)?raw.calendarPlaces:[];return out;};wrapped.__s11CalendarActivities=true;s13Norm=wrapped;}
    data();
  }
  function ensureOverlay(){
    if(document.getElementById('s11ActivityOverlay'))return;
    const o=document.createElement('div');o.id='s11ActivityOverlay';o.innerHTML=`<div class="s11-act-modal" role="dialog" aria-modal="true" aria-labelledby="s11ActTitle"><div class="s11-act-head"><h2 id="s11ActTitle">Opret aktivitet</h2><button type="button" class="s11-act-btn" data-close>Luk</button></div><form id="s11ActivityForm"><div class="s11-act-grid">
      <div class="s11-act-field"><label for="s11ActType">Aktivitetstype</label><select id="s11ActType" required>${TYPES.map(t=>`<option>${t}</option>`).join('')}</select></div>
      <div class="s11-act-field"><label for="s11ActTitleInput">Aktivitetens navn</label><input id="s11ActTitleInput" maxlength="120" required placeholder="Fx U13-træning"></div>
      <div class="s11-act-field"><label for="s11ActDate">Dato</label><input id="s11ActDate" type="date" required></div>
      <div class="s11-act-row"><div class="s11-act-field" style="flex:1"><label for="s11ActStart">Starttid</label><input id="s11ActStart" type="time"></div><div class="s11-act-field" style="flex:1"><label for="s11ActEnd">Sluttid</label><input id="s11ActEnd" type="time"></div></div>
      <div class="s11-act-field"><label for="s11ActPlace">Sted</label><input id="s11ActPlace" list="s11ActPlaces" placeholder="Vælg eller skriv et sted"><datalist id="s11ActPlaces"></datalist></div>
      <div class="s11-act-field"><label for="s11ActTeams">Hold (flere hold adskilles med komma)</label><input id="s11ActTeams" placeholder="Fx U13, U14"></div>
      <div class="s11-act-field"><label for="s11ActCoaches">Trænere (adskil med komma)</label><input id="s11ActCoaches" placeholder="Navne på trænere"></div>
      <div class="s11-act-field"><label for="s11ActStatus">Status</label><select id="s11ActStatus">${STATUSES.map(t=>`<option>${t}</option>`).join('')}</select></div>
      <div class="s11-act-field full"><label for="s11ActFocus">Fokus</label><input id="s11ActFocus" maxlength="180" placeholder="Fx førsteberøring og spilvendinger"></div>
      <div class="s11-act-field full"><label for="s11ActNotes">Noter</label><textarea id="s11ActNotes" placeholder="Praktiske oplysninger og noter"></textarea></div>
      <div class="s11-act-field"><label for="s11ActRepeat">Gentagelse</label><select id="s11ActRepeat"><option value="none">Ingen gentagelse</option><option value="weekly">Hver uge</option><option value="biweekly">Hver anden uge</option><option value="custom">Hver N. uge</option></select></div>
      <div class="s11-act-field"><label for="s11ActRepeatN">N, hvis brugerdefineret</label><input id="s11ActRepeatN" type="number" min="1" max="52" value="3"></div>
      <div class="s11-act-field"><label for="s11ActUntil">Gentag til (inkl.)</label><input id="s11ActUntil" type="date"></div>
      <div class="s11-act-field"><label for="s11ActPlan">Træningsplan</label><select id="s11ActPlan"><option value="no">Ingen træningsplan</option><option value="yes">Opret tilknyttet træningsplan</option></select></div>
      <div class="s11-act-field full"><label for="s11ActEvaluation">Evaluering (forløb, intensitet, udvikling og næste fokus)</label><textarea id="s11ActEvaluation" placeholder="Udfyld efter aktiviteten"></textarea></div>
      <div class="s11-act-field full"><div class="s11-act-row"><button type="button" class="s11-act-btn" id="s11ActAttendance">Fremmøde: vælg spillere</button><span id="s11ActAttendanceSummary" class="s11-act-chip">Ikke registreret</span></div><div id="s11ActAttendanceBox" hidden style="margin-top:8px;display:none"></div></div>
      <div class="s11-act-field full"><label for="s11ActSeriesScope">Anvend ændringer på gentagelsesserie</label><select id="s11ActSeriesScope"><option value="one">Kun denne aktivitet</option><option value="future">Denne og fremtidige aktiviteter</option><option value="all">Hele serien</option></select></div>
    </div><div class="s11-act-actions"><button type="button" class="s11-act-btn danger" id="s11ActDelete" hidden>Slet aktivitet</button><button type="button" class="s11-act-btn" id="s11ActOpenPlan" hidden>Åbn træningsplan</button><button type="button" class="s11-act-btn" id="s11ActExport">Eksportér aktivitet (.ics)</button><button type="submit" class="s11-act-btn primary">Gem aktivitet</button></div></form></div>`;
    document.body.appendChild(o);
    o.querySelector('[data-close]').addEventListener('click',close);
    o.addEventListener('click',e=>{if(e.target===o)close();});
    o.querySelector('#s11ActivityForm').addEventListener('submit',saveForm);
    o.querySelector('#s11ActDelete').addEventListener('click',deleteActivity);
    o.querySelector('#s11ActAttendance').addEventListener('click',toggleAttendance);
    o.querySelector('#s11ActExport').addEventListener('click',()=>{const a=activities().find(x=>x.id===editingId);if(a)downloadICS([a],`START11-${a.date}.ics`);});
    o.querySelector('#s11ActOpenPlan').addEventListener('click',()=>{const a=activities().find(x=>x.id===editingId);if(a)openLinkedTrainingPlan(a);});
    o.querySelector('#s11ActType').addEventListener('change',()=>{const t=o.querySelector('#s11ActType').value;if(!o.querySelector('#s11ActTitleInput').value||TYPES.includes(o.querySelector('#s11ActTitleInput').value))o.querySelector('#s11ActTitleInput').value=t;});
  }
  let editingId=null, attendanceDraft={};
  const val=id=>document.getElementById(id)?.value||'';
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v??'';};
  function sessionById(sessionId){
    return trainingSessions().find(s=>String(s.id)===String(sessionId)) || null;
  }
  function activityForSession(session){
    if(!session)return null;
    return activities().find(a=>String(a.id)===String(session.calendarActivityId)||String(a.trainingPlanSessionId)===String(session.id))||null;
  }
  function linkActivitySession(activity,session){
    if(!activity||!session)return false;
    // Repair one-to-one links deterministically; do not create duplicate plans.
    const otherActivity=activities().find(a=>a!==activity&&String(a.trainingPlanSessionId||'')===String(session.id));
    if(otherActivity)delete otherActivity.trainingPlanSessionId;
    const otherSession=Array.isArray(s13Data.sessions)?s13Data.sessions.find(s=>s!==session&&String(s.calendarActivityId||'')===String(activity.id)):null;
    if(otherSession)delete otherSession.calendarActivityId;
    activity.trainingPlanSessionId=session.id;
    session.calendarActivityId=activity.id;
    session.date=activity.date||session.date||today();
    session.title=activity.title||session.title||'Træning';
    session.theme=activity.focus||session.theme||'';
    session.note=activity.notes||session.note||'';
    session.attendance={...(activity.attendance||session.attendance||{})};
    return true;
  }
  function ensureActivityForSession(session){
    let activity=activityForSession(session);
    if(!activity){
      activity={id:id(),type:'Træning',title:session.title||session.theme||'Træning',date:session.date||today(),startTime:'',endTime:'',place:'',teams:[activeTeam()].filter(Boolean),coaches:[],status:'Planlagt',focus:session.theme||'',notes:session.note||'',attendance:{...(session.attendance||{})},evaluation:{},createdAt:new Date().toISOString()};
      activities().push(activity);
    }
    linkActivitySession(activity,session);
    return activity;
  }
  function openTrainingPlanById(sessionId){
    const session=sessionById(sessionId);if(!session){alert('Træningsplanen blev ikke fundet.');return;}
    if(typeof window.start11OpenTrainingPlanEditorModal==='function'){
      save();close();window.start11OpenTrainingPlanEditorModal(session.id);return;
    }
    if(typeof window.start11OpenTrainingPlanById==='function'){
      save();close();window.start11OpenTrainingPlanById(session.id);return;
    }
    alert('Træningsplaner kunne ikke åbnes. Kontrollér, at modulet Træningsplaner er indlæst.');
  }
  function showLinkChoice(activity){
    const existing=trainingSessions().filter(s=>!s.calendarActivityId&&!activities().some(a=>String(a.trainingPlanSessionId||'')===String(s.id)));
    const overlay=document.createElement('div');overlay.className='s11-link-overlay';overlay.style.cssText='position:fixed;inset:0;z-index:2147483600;background:rgba(0,0,0,.82);display:flex;align-items:center;justify-content:center;padding:16px;color:#fff';
    const options=existing.map(s=>`<option value="${esc(s.id)}">${esc(s.title||s.theme||'Træning')} · ${esc(s.date||'Ingen dato')}</option>`).join('');
    overlay.innerHTML=`<section style="width:min(520px,96vw);background:#0b120d;border:1px solid #344538;border-radius:12px;padding:20px"><h2 style="margin:0 0 8px">Tilknyt træningsplan</h2><p style="color:#aab8ad;margin:0 0 16px">${esc(activity.title||'Denne træning')} har endnu ingen tilknyttet plan. Hvad vil du gøre?</p><div style="display:grid;gap:10px"><button type="button" class="s11-act-btn primary" data-choice="new">＋ Opret ny træningsplan</button>${existing.length?`<label style="display:grid;gap:6px;font-size:12px;color:#aab8ad">Tilknyt eksisterende plan<select data-existing style="padding:10px;background:#050a06;color:white;border:1px solid #344538;border-radius:6px">${options}</select></label><button type="button" class="s11-act-btn" data-choice="link">Tilknyt valgt plan</button>`:'<p style="font-size:12px;color:#8b9b8f">Der er ingen ledige eksisterende planer at tilknytte.</p>'}<button type="button" class="s11-act-btn" data-choice="cancel">Annuller</button></div></section>`;
    document.body.appendChild(overlay);
    const done=()=>overlay.remove();
    overlay.addEventListener('click',e=>{if(e.target===overlay)done();});
    overlay.querySelector('[data-choice="cancel"]').onclick=done;
    overlay.querySelector('[data-choice="new"]').onclick=()=>{
      if(!Array.isArray(s13Data.sessions))s13Data.sessions=[];
      const session={id:id(),date:activity.date,title:activity.title||'Træning',theme:activity.focus||'',note:activity.notes||'',blocks:[],attendance:{...(activity.attendance||{})},attachments:[],calendarActivityId:activity.id};
      s13Data.sessions.push(session);linkActivitySession(activity,session);save();done();openTrainingPlanById(session.id);
    };
    overlay.querySelector('[data-choice="link"]')?.addEventListener('click',()=>{
      const session=sessionById(overlay.querySelector('[data-existing]')?.value);if(!session)return;
      linkActivitySession(activity,session);save();done();openTrainingPlanById(session.id);
    });
  }
  function openLinkedTrainingPlan(activity){
    if(!activity||activity.type!=='Træning'){if(activity)open(activity.date,activity.id);return;}
    const session=sessionById(activity.trainingPlanSessionId)||((Array.isArray(s13Data?.sessions))?s13Data.sessions.find(s=>String(s.calendarActivityId||'')===String(activity.id)):null);
    if(session){linkActivitySession(activity,session);save();openTrainingPlanById(session.id);return;}
    showLinkChoice(activity);
  }
  function openTrainingPlanFromSession(sessionId){
    const session=sessionById(sessionId);if(!session)return;
    const activity=ensureActivityForSession(session);save();renderAll();openTrainingPlanById(session.id);
  }
  function editActivityForSession(sessionId){
    const session=sessionById(sessionId);if(!session)return;
    const activity=ensureActivityForSession(session);save();renderAll();open(activity.date,activity.id);
  }
  function syncSessionToActivity(session){
    if(!session)return;
    const activity=activityForSession(session);
    if(!activity)return;
    // Session is the source of truth for plan fields when edited in Træningsplaner.
    activity.trainingPlanSessionId=session.id;session.calendarActivityId=activity.id;
    activity.title=session.title||activity.title||'Træning';activity.date=session.date||activity.date||today();activity.focus=session.theme||'';activity.notes=session.note||'';activity.attendance={...(session.attendance||activity.attendance||{})};activity.updatedAt=new Date().toISOString();
  }
  function syncActiveTrainingSession(){
    if(!hasTrainingData())return;
    const session=s13Data.sessions.find(x=>String(x.id)===String(window.s13Session||''));if(session)syncSessionToActivity(session);
  }
  function installTrainingPlanSync(){
    if(typeof s13Save!=='function'||s13Save.__s11CalendarSync)return;
    const previous=s13Save;const wrapped=function(...args){syncActiveTrainingSession();const result=previous.apply(this,args);setTimeout(()=>{try{renderAll();}catch(_){}} ,50);return result;};wrapped.__s11CalendarSync=true;s13Save=wrapped;
  }
  function open(date=today(),activityId=null){
    ensureNorm();styles();ensureOverlay();editingId=activityId;attendanceDraft={};const a=activities().find(x=>x.id===activityId)||null;const o=document.getElementById('s11ActivityOverlay');
    document.getElementById('s11ActTitle').textContent=a?'Redigér aktivitet':'Opret aktivitet';
    set('s11ActType',a?.type||'Træning');set('s11ActTitleInput',a?.title||(a?.type||'Træning'));set('s11ActDate',a?.date||date);set('s11ActStart',a?.startTime||'');set('s11ActEnd',a?.endTime||'');set('s11ActPlace',a?.place||'');set('s11ActTeams',(a?.teams||[activeTeam()].filter(Boolean)).join(', '));set('s11ActCoaches',(a?.coaches||[]).join(', '));set('s11ActStatus',a?.status||'Planlagt');set('s11ActFocus',a?.focus||'');set('s11ActNotes',a?.notes||'');set('s11ActRepeat',a?.repeatRule||'none');set('s11ActRepeatN',a?.repeatEvery||3);set('s11ActUntil',a?.repeatUntil||'');set('s11ActPlan',a?.trainingPlanSessionId?'yes':'no');set('s11ActEvaluation',a?.evaluation?`Forløb: ${a.evaluation.flow||''}\nIntensitet: ${a.evaluation.intensity||''}\nUdvikling: ${a.evaluation.development||''}\nNæste fokus: ${a.evaluation.nextFocus||''}`:'');attendanceDraft={...(a?.attendance||{})};
    const places=data().calendarPlaces;document.getElementById('s11ActPlaces').innerHTML=places.map(p=>`<option value="${esc(p)}"></option>`).join('');
    document.getElementById('s11ActDelete').hidden=!a;document.getElementById('s11ActExport').hidden=!a;document.getElementById('s11ActOpenPlan').hidden=!(a&&a.trainingPlanSessionId);set('s11ActSeriesScope','one');document.getElementById('s11ActSeriesScope').disabled=!(a&&a.seriesId);document.getElementById('s11ActRepeat').disabled=!!a?.seriesId;
    document.getElementById('s11ActAttendanceSummary').textContent=Object.keys(attendanceDraft).filter(k=>attendanceDraft[k]).length?`${Object.keys(attendanceDraft).filter(k=>attendanceDraft[k]).length} fremmødte`:'Ikke registreret';
    document.getElementById('s11ActAttendanceBox').hidden=true;document.getElementById('s11ActAttendanceBox').style.display='none';o.classList.add('open');
  }
  function close(){document.getElementById('s11ActivityOverlay')?.classList.remove('open');}
  function toggleAttendance(){
    const box=document.getElementById('s11ActAttendanceBox');const players=typeof s13Players==='function'?s13Players():(Array.isArray(window.start11FullSquad)?window.start11FullSquad:[]);
    if(!players.length){alert('Der blev ikke fundet en spillerliste for det aktive hold.');return;}
    const isOpen=box.style.display!=='none'&&!box.hidden;if(isOpen){box.hidden=true;box.style.display='none';return;}
    box.hidden=false;box.style.display='block';box.innerHTML=`<div class="s11-act-row" style="margin-bottom:7px"><button type="button" class="s11-act-btn" id="s11AttAll">Alle mødt</button><button type="button" class="s11-act-btn" id="s11AttNone">Nulstil</button></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:7px">${players.map((p,i)=>{const pid=String(p.id??p.playerId??p.name??p.navn??i);const name=p.name||p.navn||p.firstName||`Spiller ${i+1}`;return `<label class="s11-act-check"><input type="checkbox" data-player-id="${esc(pid)}" ${attendanceDraft[pid]?'checked':''}>${esc(name)}</label>`}).join('')}</div>`;
    box.querySelectorAll('[data-player-id]').forEach(el=>el.addEventListener('change',()=>{attendanceDraft[el.dataset.playerId]=el.checked;updateAttendanceSummary();}));box.querySelector('#s11AttAll').addEventListener('click',()=>{box.querySelectorAll('[data-player-id]').forEach(el=>{el.checked=true;attendanceDraft[el.dataset.playerId]=true;});updateAttendanceSummary();});box.querySelector('#s11AttNone').addEventListener('click',()=>{box.querySelectorAll('[data-player-id]').forEach(el=>{el.checked=false;attendanceDraft[el.dataset.playerId]=false;});updateAttendanceSummary();});
  }
  function updateAttendanceSummary(){const n=Object.keys(attendanceDraft).filter(k=>attendanceDraft[k]).length;document.getElementById('s11ActAttendanceSummary').textContent=n?`${n} fremmødte`:'Ingen fremmødte markeret';}
  function parseEvaluation(text){const out={flow:'',intensity:'',development:'',nextFocus:''};const map={'forløb':'flow','intensitet':'intensity','udvikling':'development','næste fokus':'nextFocus'};String(text||'').split('\n').forEach(line=>{const i=line.indexOf(':');if(i<0)return;const k=line.slice(0,i).trim().toLowerCase();if(map[k])out[map[k]]=line.slice(i+1).trim();});if(!Object.values(out).some(Boolean))out.flow=String(text||'').trim();return out;}
  function saveForm(e){
    e.preventDefault();const date=val('s11ActDate');if(!/^\d{4}-\d{2}-\d{2}$/.test(date)){alert('Vælg en gyldig dato.');return;}
    if(val('s11ActEnd')&&val('s11ActStart')&&val('s11ActEnd')<val('s11ActStart')){alert('Sluttidspunktet skal ligge efter starttidspunktet.');return;}
    const current=activities().find(x=>x.id===editingId);const repeat=val('s11ActRepeat');let createdSeriesId=null;const until=val('s11ActUntil');if(!current&&repeat!=='none'&&(!until||until<date)){alert('Vælg en slutdato, der ligger på eller efter første aktivitet.');return;}
    const place=val('s11ActPlace').trim();if(place&&!data().calendarPlaces.some(p=>p.toLowerCase()===place.toLowerCase()))data().calendarPlaces.push(place);
    const base={id:current?.id||id(),type:val('s11ActType'),title:val('s11ActTitleInput').trim(),date,startTime:val('s11ActStart'),endTime:val('s11ActEnd'),place,teams:val('s11ActTeams').split(',').map(x=>x.trim()).filter(Boolean),coaches:val('s11ActCoaches').split(',').map(x=>x.trim()).filter(Boolean),status:val('s11ActStatus'),focus:val('s11ActFocus').trim(),notes:val('s11ActNotes').trim(),attendance:{...attendanceDraft},evaluation:parseEvaluation(val('s11ActEvaluation')),updatedAt:new Date().toISOString()};
    const conflicts=activities().filter(x=>x.id!==current?.id&&x.date===base.date&&resourceOverlap(x,base));
    if(conflicts.length){const summary=conflicts.slice(0,4).map(x=>`${x.title||x.type}${x.startTime?` (${x.startTime}${x.endTime?`-${x.endTime}`:''})`:''}`).join('\n');if(!confirm(`Mulig dobbeltbooking den ${formatDate(base.date)}:\n${summary}\n\nVil du gemme aktiviteten alligevel?`))return;}
    if(current){const previousDate=current.date;const seriesId=current.seriesId;const scope=val('s11ActSeriesScope');Object.assign(current,base);if(seriesId&&scope!=='one'){activities().filter(x=>x.seriesId===seriesId&&x.id!==current.id&&(scope==='all'||x.date>=previousDate)).forEach(x=>Object.assign(x,{type:base.type,title:base.title,startTime:base.startTime,endTime:base.endTime,place:base.place,teams:[...base.teams],coaches:[...base.coaches],status:base.status,focus:base.focus,notes:base.notes,updatedAt:base.updatedAt}));}}
    else if(repeat==='none'){activities().push({...base,createdAt:new Date().toISOString()});}
    else {const seriesId=id();createdSeriesId=seriesId;const startDate=new Date(`${date}T12:00:00`);const endDate=new Date(`${until}T12:00:00`);const interval=repeat==='weekly'?1:repeat==='biweekly'?2:Math.max(1,Math.min(52,Number(val('s11ActRepeatN'))||3));let made=0;for(let d=new Date(startDate);d<=endDate&&made<160;d.setDate(d.getDate()+interval*7)){const iso=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;const holiday=danishHolidayName(iso);if(holiday){const keep=confirm(`${formatDate(iso)} falder på ${holiday}. Opret alligevel?\nOK = opret · Annuller = spring over`);if(!keep)continue;}activities().push({...base,id:id(),date:iso,seriesId,repeatRule:repeat,repeatEvery:interval,repeatUntil:until,createdAt:new Date().toISOString()});made++;}if(!made){alert('Der blev ikke oprettet nogen aktiviteter.');return;}}
    // Keep an already-linked training plan in sync when the calendar activity is edited.
    if(current?.trainingPlanSessionId&&Array.isArray(s13Data?.sessions)){
      const linked=s13Data.sessions.find(session=>session.id===current.trainingPlanSessionId);
      if(linked){linked.calendarActivityId=current.id;linked.date=base.date;linked.title=base.title||'Træning';linked.theme=base.focus||'';linked.note=base.notes||'';linked.attendance={...(base.attendance||linked.attendance||{})};}
    }
    if(val('s11ActPlan')==='yes'&&base.type==='Træning'&&typeof s13Data==='object'&&Array.isArray(s13Data.sessions)){
      const candidates=current?[current]:(createdSeriesId?activities().filter(x=>x.seriesId===createdSeriesId):activities().filter(x=>x.id===base.id));
      candidates.forEach(activity=>{if(!activity||activity.trainingPlanSessionId)return;const session={id:id(),date:activity.date,title:activity.title||'Træning',theme:activity.focus||'',note:activity.notes||'',blocks:[],attendance:{...attendanceDraft},attachments:[],calendarActivityId:activity.id};s13Data.sessions.push(session);activity.trainingPlanSessionId=session.id;});
    }
    save();close();renderAll();
  }
  function resourceOverlap(a,b){const shared=(left,right)=>left.some(x=>right.includes(x));const sameTeam=shared(a.teams||[],b.teams||[]),sameCoach=shared(a.coaches||[],b.coaches||[]),samePlace=!!a.place&&a.place.toLowerCase()===String(b.place||'').toLowerCase();if(!sameTeam&&!sameCoach&&!samePlace)return false;const mins=t=>{if(!t)return null;const [h,m]=t.split(':').map(Number);return h*60+m;};const as=mins(a.startTime),ae=mins(a.endTime),bs=mins(b.startTime),be=mins(b.endTime);if(as===null||bs===null)return true;const aEnd=ae===null?as+60:ae,bEnd=be===null?bs+60:be;return as<bEnd&&bs<aEnd;}
  function deleteActivity(){const a=activities().find(x=>x.id===editingId);if(!a)return;if(!confirm('Vil du slette denne aktivitet?'))return;if(a.trainingPlanSessionId){const removePlan=confirm('Aktiviteten har en tilknyttet træningsplan. Vil du også slette træningsplanen?\nOK = slet begge · Annuller = behold planen som selvstændigt træningspas');if(removePlan&&Array.isArray(s13Data.sessions))s13Data.sessions=s13Data.sessions.filter(s=>s.id!==a.trainingPlanSessionId);else if(Array.isArray(s13Data.sessions)){const linked=s13Data.sessions.find(s=>s.id===a.trainingPlanSessionId);if(linked)delete linked.calendarActivityId;}}data().calendarActivities=data().calendarActivities.filter(x=>x.id!==editingId);save();close();renderAll();}
  function danishHolidayName(iso){const d=new Date(`${iso}T12:00:00`);const m=d.getMonth()+1,day=d.getDate();if(m===1&&day===1)return'1. januar';if(m===12&&day===25)return'juledag';if(m===12&&day===26)return'2. juledag';if(m===12&&day===24)return'juleaftensdag';if(m===5&&day===1)return'1. maj';if(m===6&&day===5)return'Grundlovsdag';if(m===12&&day===31)return'nytårsaften';const easter=easterSunday(d.getFullYear());const delta=Math.round((d-easter)/86400000);return ({'-3':'Skærtorsdag','-2':'Langfredag','0':'Påskedag','1':'2. påskedag','39':'Kristi himmelfartsdag','49':'Pinsedag','50':'2. pinsedag'})[String(delta)]||'';}
  function easterSunday(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),month=Math.floor((h+l-7*m+114)/31),day=((h+l-7*m+114)%31)+1;return new Date(y,month-1,day,12);}
  function renderAll(){renderActivityEvents();renderActivityList();try{if(typeof start11RenderCalendarV3==='function')setTimeout(()=>{if(typeof s15DecorateCalendarTrainings==='function')s15DecorateCalendarTrainings();renderActivityEvents();renderActivityList();},30);}catch(_){} }
  function renderActivityEvents(){const grid=document.getElementById('start11CalendarGrid');if(!grid)return;grid.querySelectorAll('.s11-act-event').forEach(n=>n.remove());const days=[...grid.querySelectorAll('.start11-calendar-day')];if(!days.length)return;const dates=typeof s15CalendarDayDates==='function'?s15CalendarDayDates():[];days.forEach((day,i)=>{const date=day.dataset.s15Date||dates[i];if(!date)return;activities().filter(a=>a.date===date&&(!(a.teams||[]).length||!activeTeam()||(a.teams||[]).includes(activeTeam()))).forEach(a=>{const b=document.createElement('button');b.type='button';b.className='s11-act-event';b.dataset.status=a.status||'Planlagt';b.textContent=`${a.startTime?`${a.startTime} `:''}${a.title||a.type}`;b.title=[a.type,a.teams?.join(', '),a.place,a.status].filter(Boolean).join(' · ');b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(a.type==='Træning'){openLinkedTrainingPlan(a);}else{open(a.date,a.id);}});b.addEventListener('contextmenu',e=>{e.preventDefault();e.stopPropagation();open(a.date,a.id);});day.appendChild(b);});});}
  function renderActivityList(){const shell=document.getElementById('start11CalendarShell');if(!shell||typeof start11CalendarDate==='undefined')return;shell.querySelector('.s11-act-month-list')?.remove();const year=start11CalendarDate.getFullYear(),month=start11CalendarDate.getMonth();const inMonth=activities().filter(a=>{if(!a.date)return false;const d=new Date(`${a.date}T12:00:00`);return d.getFullYear()===year&&d.getMonth()===month;}).sort((a,b)=>(a.date+a.startTime).localeCompare(b.date+b.startTime));const list=document.createElement('section');list.className='s11-act-month-list';const uniq=(key)=>[...new Set(activities().map(a=>key==='teams'?(a.teams||[]):key==='coaches'?(a.coaches||[]):[a[key]||'']).flat().filter(Boolean))].sort();list.innerHTML=`<div class="start11-calendar-month-list-title">Aktiviteter i måneden</div><div class="s11-act-filters"><select id="s11FilterTeam"><option value="">Alle hold</option>${uniq('teams').map(x=>`<option>${esc(x)}</option>`).join('')}</select><select id="s11FilterType"><option value="">Alle aktivitetstyper</option>${TYPES.map(x=>`<option>${esc(x)}</option>`).join('')}</select><select id="s11FilterCoach"><option value="">Alle trænere</option>${uniq('coaches').map(x=>`<option>${esc(x)}</option>`).join('')}</select><select id="s11FilterPlace"><option value="">Alle steder</option>${uniq('place').map(x=>`<option>${esc(x)}</option>`).join('')}</select></div><div class="s11-act-list-items"></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button type="button" class="s11-act-btn" id="s11ExportMonth">Eksportér måned (.ics)</button><label class="s11-act-btn" for="s11ImportICS" style="cursor:pointer">Importér .ics fra Apple/Google</label><input id="s11ImportICS" type="file" accept=".ics,text/calendar" hidden></div>`;shell.appendChild(list);
    const items=list.querySelector('.s11-act-list-items');if(activeTeam()&&[...list.querySelector('#s11FilterTeam').options].some(o=>o.value===activeTeam()))list.querySelector('#s11FilterTeam').value=activeTeam();const draw=()=>{const team=val('s11FilterTeam')||activeTeam(),type=val('s11FilterType'),coach=val('s11FilterCoach'),place=val('s11FilterPlace');const filtered=inMonth.filter(a=>(!team||(a.teams||[]).includes(team))&&(!type||a.type===type)&&(!coach||(a.coaches||[]).includes(coach))&&(!place||a.place===place));items.innerHTML=filtered.length?filtered.map(a=>`<div class="s11-act-list-row"><div>${formatDate(a.date)}<small>${esc(a.startTime||'')}</small></div><div><strong>${esc(a.title||a.type)}</strong><small>${esc(a.type)} · ${esc((a.teams||[]).join(', ')||'Intet hold')} · ${esc(a.status||'Planlagt')}</small><small>${esc(a.place||'Intet sted')} · ${esc((a.coaches||[]).join(', ')||'Ingen trænere')}</small></div><button class="s11-act-btn" type="button" data-edit="${esc(a.id)}">Redigér</button></div>`).join(''):'<div class="start11-calendar-empty">Ingen aktiviteter matcher filtrene i denne måned.</div>';items.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>open(aDateFor(b.dataset.edit),b.dataset.edit)));};['s11FilterTeam','s11FilterType','s11FilterCoach','s11FilterPlace'].forEach(id=>list.querySelector('#'+id).addEventListener('change',draw));draw();list.querySelector('#s11ExportMonth').addEventListener('click',()=>downloadICS(inMonth,`START11-${year}-${String(month+1).padStart(2,'0')}.ics`));list.querySelector('#s11ImportICS').addEventListener('change',importICS);
  }
  function aDateFor(id){return activities().find(a=>a.id===id)?.date||today();}
  function toICSDate(date,time){return time?`${String(date||today()).replaceAll('-','')}T${time.replace(':','')}00`:`;VALUE=DATE:${String(date||today()).replaceAll('-','')}`;}
  function downloadICS(list,filename){if(!list.length){alert('Der er ingen aktiviteter at eksportere.');return;}const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//START11//Kalender//DA','CALSCALE:GREGORIAN'];list.forEach(a=>{lines.push('BEGIN:VEVENT',`UID:${String(a.id).replace(/[^a-zA-Z0-9_-]/g,'')}@start11`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}`,`${a.startTime?'DTSTART:':'DTSTART'}${toICSDate(a.date,a.startTime)}`,`SUMMARY:${icsEsc(a.title||a.type)}`,`DESCRIPTION:${icsEsc([a.type,a.focus,a.notes,`Status: ${a.status||'Planlagt'}`].filter(Boolean).join('\n'))}`);if(a.endTime)lines.push(`DTEND:${toICSDate(a.date,a.endTime)}`);else if(!a.startTime)lines.push(`DTEND;VALUE=DATE:${String(a.date).replaceAll('-','')}`);if(a.place)lines.push(`LOCATION:${icsEsc(a.place)}`);lines.push('END:VEVENT');});lines.push('END:VCALENDAR');const blob=new Blob([lines.join('\r\n')],{type:'text/calendar;charset=utf-8'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=filename;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function icsEsc(v){return String(v||'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');}
  function importICS(e){const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{const raw=String(reader.result||'').replace(/\r?\n[ \t]/g,'');const blocks=raw.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g)||[];let imported=0;for(const block of blocks){const get=k=>{const m=block.match(new RegExp('(?:^|\\n)'+k+'(?:;[^:]*)?:(.*)','m'));return m?m[1].trim().replace(/\\n/g,'\n').replace(/\\,/g,',').replace(/\\;/g,';'):'';};const dt=get('DTSTART');const match=dt.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2}))?/);if(!match)continue;const date=`${match[1]}-${match[2]}-${match[3]}`;const summary=get('SUMMARY')||'Importeret aktivitet';const place=get('LOCATION');if(activities().some(a=>a.date===date&&a.title===summary&&a.place===place))continue;activities().push({id:id(),type:'Andet',title:summary,date,startTime:match[4]?`${match[4]}:${match[5]}`:'',place,teams:[],coaches:[],status:'Planlagt',focus:'',notes:get('DESCRIPTION'),attendance:{},evaluation:{},importedFromICS:true,createdAt:new Date().toISOString()});imported++;}save();renderAll();alert(`${imported} aktivitet(er) importeret. Dubletter med samme dato, titel og sted blev sprunget over.`);e.target.value='';};reader.readAsText(file);}
  function interceptCalendar(){
    const grid=document.getElementById('start11CalendarGrid');if(!grid||grid.dataset.s11ActivityIntercept==='1')return;grid.dataset.s11ActivityIntercept='1';
    grid.addEventListener('click',e=>{
      const legacyTraining=e.target.closest('.s15-calendar-training');
      if(legacyTraining){const day=legacyTraining.closest('.start11-calendar-day');const date=day?.dataset.s15Date||day?.dataset.date;const sessions=trainingSessions();const visible=sessions.filter(s=>String(s.date||'')===String(date||''));const label=legacyTraining.textContent||'';const session=visible.find(s=>label.includes(s.theme||'\u0000')||label.includes(s.title||'\u0000'))||visible[0];if(session){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openTrainingPlanFromSession(session.id);}return;}
      const add=e.target.closest('#s15CalendarAddTraining');if(add){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();open(today());return;}
      const event=e.target.closest('.start11-calendar-match,.start11-calendar-event-open,.s11-act-event,button');if(event)return;
      const day=e.target.closest('.start11-calendar-day');if(!day)return;const date=day.dataset.s15Date||day.dataset.date||(typeof s15CalendarDayDates==='function'?s15CalendarDayDates()[[...grid.querySelectorAll('.start11-calendar-day')].indexOf(day)]:null);if(!date)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();open(date);
    },true);
    grid.addEventListener('contextmenu',e=>{
      const legacyTraining=e.target.closest('.s15-calendar-training');
      if(legacyTraining){const day=legacyTraining.closest('.start11-calendar-day');const date=day?.dataset.s15Date||day?.dataset.date;const sessions=trainingSessions();const visible=sessions.filter(s=>String(s.date||'')===String(date||''));const label=legacyTraining.textContent||'';const session=visible.find(s=>label.includes(s.theme||'\u0000')||label.includes(s.title||'\u0000'))||visible[0];if(session){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();editActivityForSession(session.id);}return;}
      const event=e.target.closest('.s11-act-event');if(event)return;
      const day=e.target.closest('.start11-calendar-day');if(!day)return;const date=day.dataset.s15Date||day.dataset.date;if(!date)return;const training=activities().find(a=>a.date===date&&a.type==='Træning');if(training){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();open(date,training.id);}
    },true);
  }
  function ensureToolbarButton(){const toolbar=document.querySelector('#start11CalendarShell .start11-calendar-nav:last-child');if(!toolbar)return;document.getElementById('s15CalendarAddTraining')?.remove();let b=document.getElementById('s11CalendarAddActivity');if(!b){b=document.createElement('button');b.id='s11CalendarAddActivity';b.type='button';b.className='start11-calendar-action';b.textContent='+ OPRET AKTIVITET';toolbar.appendChild(b);}if(!b.dataset.bound){b.dataset.bound='1';b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();open(today());});}}
  function downloadAll(){downloadICS(activities(),`START11-kalender.ics`);}
  function install(){ensureNorm();installTrainingPlanSync();styles();ensureOverlay();ensureToolbarButton();interceptCalendar();renderActivityEvents();renderActivityList();}
  if(typeof start11RenderCalendarV3==='function'&&!start11RenderCalendarV3.__s11ActivityWrapped){const old=start11RenderCalendarV3;const wrapped=function(...args){const r=old.apply(this,args);setTimeout(()=>{ensureNorm();ensureToolbarButton();interceptCalendar();renderActivityEvents();renderActivityList();},20);return r;};wrapped.__s11ActivityWrapped=true;start11RenderCalendarV3=wrapped;}
  if(typeof start11RenderCalendar==='function'&&!start11RenderCalendar.__s11ActivityWrapped){const old=start11RenderCalendar;const wrapped=function(...args){const r=old.apply(this,args);setTimeout(()=>{ensureNorm();ensureToolbarButton();interceptCalendar();renderActivityEvents();renderActivityList();},20);return r;};wrapped.__s11ActivityWrapped=true;start11RenderCalendar=wrapped;}
  ensureNorm();
  document.addEventListener('DOMContentLoaded',()=>setTimeout(install,100));
  window.addEventListener('load',()=>setTimeout(install,300));
  window.START11CalendarPlanner={open,render:renderAll,exportAll:downloadAll,types:TYPES,openTrainingPlan:openLinkedTrainingPlan,openTrainingPlanFromSession,editActivityForSession,syncTrainingPlan:syncActiveTrainingSession,syncSession:syncSessionToActivity};
})();
