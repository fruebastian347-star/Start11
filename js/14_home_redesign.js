/* START11 Home Redesign V37 — videreudvikling af Claudes version.
   Begrænset til startskærmens præsentation og navigation. */
;(function start11HomeRedesignV37(){
  "use strict";
  if(window.__START11_HOME_V37__) return;
  window.__START11_HOME_V37__=true;
  // This module is the sole renderer for the existing dashboard calendar cards.
  // Older V35 dashboard refreshers must not overwrite these cards on their timer.
  window.__START11_HOME_V37_OWNS_CALENDAR_CARDS__=true;
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const arr=f=>{try{const v=f();return Array.isArray(v)?v.filter(Boolean):[]}catch(_){return[]}};
  const squad=()=>arr(()=>start11FullSquad);
  const starters=()=>arr(()=>spillere);
  const bench=()=>arr(()=>udskiftere);
  const norm=v=>String(v??"").trim().toLowerCase().replace(/\s+/g," ");
  const short=n=>{const a=String(n||"").trim().split(/\s+/);return a.length>1?a[0][0]+". "+a.slice(1).join(" "):(n||"")};
  const same=(a,b)=>!!a&&!!b&&((a.id&&b.id&&String(a.id)===String(b.id))||norm(a.name)===norm(b.name));
  const state=p=>{
    const s=String(p&&(p.squadStatus||p.status||p.availability)||"");
    if(/unavail|skad|injur|ikke tilgængelig|ikke tilgaengelig|fravær|fravaer|meldt fra|\bout\b/i.test(s))return"red";
    if(/begr|ukendt|limit|doubt|usikker|syg|sick|småskade|smaaskade/i.test(s))return"yellow";
    return"green";
  };
  const ICON={green:"✓",yellow:"!",red:"✕"};
  const ready=()=>$("s34HomeView")&&!$("s34HomeView").hidden;
  const set=(el,html)=>{if(el&&el.innerHTML!==html)el.innerHTML=html};
  const text=(el,v)=>{if(el&&el.textContent!==String(v??""))el.textContent=String(v??"")};
  const teamOwn=()=>String($("s34SideTeam")?.textContent||$("s41TeamSelector")?.selectedOptions?.[0]?.textContent||"").trim();
  function allMatches(){try{return typeof start11CalendarAllMatches==="function"?(start11CalendarAllMatches()||[]):[]}catch(_){return[]}}
  function dateOf(m){return String(m?.date||m?.matchDate||m?.match_date||"").slice(0,10)}
  function nextMatch(){const today=new Date();today.setHours(0,0,0,0);return allMatches().filter(m=>dateOf(m)&&dateOf(m)>=today.toISOString().slice(0,10)).sort((a,b)=>dateOf(a).localeCompare(dateOf(b)))[0]||null}
  function greeting(){
    const h=new Date().getHours(),g=h<10?"Godmorgen":h<18?"Goddag":"Godaften";
    const h1=document.querySelector("#s34HomeView .s34-hero h1");
    if(h1){const coach=$("s34CoachName")?.textContent?.trim()||"";h1.innerHTML=`${g}, <em id="s34CoachName">${esc(coach||"Træner")}</em>`}
    const hero=document.querySelector("#s34HomeView .s34-hero-copy span");
    if(hero){const d=new Date().toLocaleDateString("da-DK",{weekday:"long",day:"numeric",month:"long",year:"numeric"});text(hero,d.charAt(0).toUpperCase()+d.slice(1))}
  }
  function ensureAlertHost(){
    const hero=document.querySelector("#s34HomeView .s34-hero");if(!hero)return null;
    let host=$("s37Alerts");if(!host){host=document.createElement("div");host.id="s37Alerts";hero.appendChild(host)}return host;
  }
  function alerts(){
    const host=ensureAlertHost();if(!host)return;
    const all=squad(),st=starters();
    const redStart=st.filter(p=>state(p)==="red");
    const yellow=all.filter(p=>state(p)==="yellow");
    let html="";
    if(redStart.length){const names=redStart.slice(0,2).map(p=>short(p.name)).join(", ");html+=`<button class="s37-alert red" data-go="squad"><b aria-hidden="true">!</b><span><strong>${esc(names)}${redStart.length>2?` +${redStart.length-2}`:""} ikke tilgængelig</strong><small>Kontrollér startopstillingen før kampen.</small></span><i>›</i></button>`}
    if(yellow.length){html+=`<button class="s37-alert yellow" data-go="squad"><b aria-hidden="true">●●</b><span><strong>${yellow.length} usikker${yellow.length===1?" spiller":"e spillere"} skal afklares</strong><small>${esc(yellow.slice(0,3).map(p=>p.name).join(", "))}${yellow.length>3?" …":""}</small></span><i>›</i></button>`}
    set(host,html);
  }
  function matchBadges(){
    const h3=document.querySelector("#s34HomeView .s34-home-grid.top .s34-panel h3");if(!h3)return;
    let el=h3.querySelector(".s37-badges");if(!el){el=document.createElement("span");el.className="s37-badges";h3.insertBefore(el,h3.querySelector("b"))}
    const m=nextMatch();if(!m){set(el,"");return}
    // Use the date already rendered on the visible match card first, so the badge
    // cannot accidentally describe a different calendar fixture. UTC avoids DST/time-zone day shifts.
    const shown=$("s34MatchDate")?.textContent||"";
    const shownMatch=shown.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
    const raw=shownMatch?shownMatch[1]:dateOf(m);
    const parts=raw.split("-").map(Number);
    const target=Date.UTC(parts[0],parts[1]-1,parts[2]);
    const nowDate=new Date();const today=Date.UTC(nowDate.getFullYear(),nowDate.getMonth(),nowDate.getDate());
    const days=Math.round((target-today)/86400000);
    const own=norm(teamOwn()),home=norm(m.home||m.homeTeam||m.home_team),isHome=own?(home===own||home.includes(own)||own.includes(home)):home.includes("thy");
    const countdown=days<0?"Dato passeret":days===0?"I dag":days===1?"I morgen":"Om "+days+" dage";
    set(el,`<em>${countdown}</em><em class="n">${isHome?"Hjemme":"Ude"}</em>`);
  }
  function status(){
    const all=squad();if(!all.length)return;
    const counts={green:0,yellow:0,red:0};all.forEach(p=>counts[state(p)]++);
    text($("s34PlayerCount"),all.length);text($("s34Available"),counts.green);text($("s34Limited"),counts.yellow);
    const ps=document.querySelectorAll("#s34HomeView .s34-status p");if(ps[2]){const b=ps[2].querySelector("b");text(b,counts.red)}
    const card=document.querySelector("#s34HomeView .s34-status")?.parentElement;if(!card)return;
    let l=$("s37StatusToday");if(!l){l=document.createElement("div");l.id="s37StatusToday";card.querySelector(".s34-status")?.after(l)}
    const flagged=all.filter(p=>state(p)!=="green").slice(0,4);
    set(l,flagged.length?`<h4>Status i dag</h4>`+flagged.map(p=>`<div class="s37-status-row"><strong>${esc(short(p.name))}</strong><span class="${state(p)}">${esc(String(p.squadStatus||p.status||"Skal afklares"))}</span></div>`).join(""):"<div class=\"s37-no-status\">Ingen usikre eller utilgængelige spillere registreret.</div>");
  }
  function lineupSide(){
    const art=document.querySelector("#s34HomeView .s34-lineup");if(!art)return;
    let side=$("s37LineupSide");if(!side){side=document.createElement("div");side.id="s37LineupSide";art.appendChild(side)}
    const b=bench(),st=starters(),all=squad();
    const out=all.filter(p=>!st.some(s=>same(s,p))&&!b.some(s=>same(s,p)));
    const li=p=>`<li class="${state(p)}"><span class="s37-number">${esc(p.number||p.shirtNumber||"—")}</span><span class="s37-player-name">${esc(short(p.name))}</span><i aria-label="${state(p)==="green"?"Tilgængelig":state(p)==="yellow"?"Usikker":"Ikke tilgængelig"}">${ICON[state(p)]}</i></li>`;
    set(side,`<details open><summary>Bænk (${b.length})</summary><ul>${b.map(li).join("")||"<li class=\"s37-empty\">Ingen spillere på bænken.</li>"}</ul></details><details open><summary>Ikke udtaget (${out.length})</summary><ul class="out">${out.map(p=>`<li><span class="s37-number">${esc(p.number||p.shirtNumber||"—")}</span><span class="s37-player-name">${esc(short(p.name))}</span><i>○</i></li>`).join("")||"<li class=\"s37-empty\">Ingen spillere.</li>"}</ul></details>`);
    let bar=$("s37LineupBar");if(!bar){bar=document.createElement("div");bar.id="s37LineupBar";art.appendChild(bar)}
    set(bar,`<span class="s37-legend"><span><i class="green">✓</i>Tilgængelig</span><span><i class="yellow">!</i>Usikker</span><span><i class="red">✕</i>Ikke tilgængelig</span><span><i class="gray">○</i>Ikke udtaget</span></span><button data-go="edit">✎ Redigér opstilling</button><button data-go="send">➤ Del opstilling</button><button data-go="pdf">▤ Udskriv / PDF</button>`);
  }
  function opponent(){
    const f=document.querySelector("#s34HomeView .s34-focus");if(!f)return;
    const h=f.querySelector("h3");if(h)h.innerHTML=`◎ <span>Modstanderens scouting</span>`;
    let o=$("s37Opponent");if(!o){o=document.createElement("div");o.id="s37Opponent";const list=$("s34FocusList");if(list)list.before(o);else f.appendChild(o)}
    const m=nextMatch(),own=norm(teamOwn());let opp=String($("s34AwayTeam")?.textContent||"").trim();
    if(m){const home=String(m.home||m.homeTeam||""),away=String(m.away||m.awayTeam||"");opp=norm(home)===own||norm(home).includes(own)?away:home||opp}
    let rows=[];try{const x=JSON.parse(localStorage.getItem("start11DbuLeague")||"{}");rows=x.standings||[]}catch(_){}
    const idx=rows.findIndex(r=>norm(r.team||r.name||r.teamName)===norm(opp));const row=rows[idx];
    set(o,`<strong>Modstander: ${esc(opp||"Ikke valgt")}</strong>${row?`<small>Nr. ${esc(row.position??row.pos??row.rank??idx+1)} i ligaen · ${esc(row.points??row.pts??"—")} point</small>`:""}<div class="s37-scout-section"><h4>Modstanderens styrker</h4><p class="up"><span>Registrér styrker i kampplanen</span></p></div><div class="s37-scout-section"><h4>Modstanderens svagheder</h4><p class="down"><span>Registrér svagheder i kampplanen</span></p></div><button type="button" class="s37-scout-open" data-go="scouting">Åbn kampplan for scouting →</button>`);
    const old=$("s34FocusList");if(old){old.hidden=false;const focusTitle=document.createElement("h4");focusTitle.className="s37-focus-title";focusTitle.textContent="Vores fokus";if(!f.querySelector(".s37-focus-title"))old.before(focusTitle)}
    const button=$("s34OpenCoaching");if(button)button.textContent="Åbn kampplan →";
  }
  function calendarData(){try{return typeof s13Data!=="undefined"&&s13Data&&Array.isArray(s13Data.calendarActivities)?s13Data.calendarActivities:[]}catch(_){return[]}}
  function localDateKey(d){const x=new Date();x.setHours(0,0,0,0);return x.toLocaleDateString("sv-SE")}
  function trainingSessionData(){try{return typeof s13Data!=="undefined"&&s13Data&&Array.isArray(s13Data.sessions)?s13Data.sessions:[]}catch(_){return[]}}
  function homeActivityDate(a){
    const raw=String(a?.date||a?.sessionDate||a?.session_date||a?.matchDate||a?.match_date||"").trim();
    let m=raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if(m)return `${m[1]}-${String(m[2]).padStart(2,"0")}-${String(m[3]).padStart(2,"0")}`;
    m=raw.match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})$/);
    if(m)return `${m[3]}-${String(m[2]).padStart(2,"0")}-${String(m[1]).padStart(2,"0")}`;
    return "";
  }
  function homeActivityTime(a){return String(a?.startTime||a?.time||a?.kickoff||a?.matchTime||a?.match_time||"").slice(0,5)}
  function calendarPanel(){
    const home=$("s34HomeView");if(!home)return;
    // Integrate calendar activities, training plans and fixtures into the existing dashboard cards.
    const todayKey=localDateKey();
    const rawActivities=calendarData().filter(a=>a&&homeActivityDate(a)&&String(a.status||"Planlagt")!=="Aflyst");
    const sessions=trainingSessionData().filter(x=>x&&homeActivityDate(x));
    const sessionActivities=sessions.map(x=>({
      ...x,
      id:"session:"+String(x.id||x.sessionId||x.session_id||""),
      sessionId:String(x.id||x.sessionId||x.session_id||""),
      linkedCalendarActivityId:String(x.calendarActivityId||x.activityId||""),
      sourceKind:"session",
      type:x.type||"Træning",
      title:x.title||x.name||"Træning",
      date:homeActivityDate(x),
      startTime:homeActivityTime(x),
      focus:x.focus||x.theme||x.topic||""
    }));
    const calendarIds=new Set(rawActivities.map(a=>String(a.trainingPlanSessionId||a.sessionId||"")).filter(Boolean));
    const calendarKeys=new Set(rawActivities.map(a=>[homeActivityDate(a),String(a.title||a.name||a.type||"").trim().toLowerCase()].join("|")));
    const activities=[...rawActivities];
    // Add sessions not already represented by a calendar activity; this prevents intermittent
    // omissions while avoiding duplicate rows for a linked calendar/session pair.
    sessionActivities.forEach(a=>{
      const sid=String(a.id||"").replace(/^session:/,"");
      const represented=calendarIds.has(sid)||calendarKeys.has([a.date,String(a.title||a.name||a.type||"").trim().toLowerCase()].join("|"));
      if(!represented)activities.push(a);
    });
    let matches=[];
    try{
      if(typeof start11CalendarAllMatches==="function"){
        matches=(start11CalendarAllMatches()||[]).map((m,i)=>({
          ...m,
          id:"match:"+String(m.id||m.matchId||m.match_id||i),
          sourceKind:"match",
          type:"Kamp",
          title:[m.home||m.homeTeam||m.home_team,m.away||m.awayTeam||m.away_team].filter(Boolean).join(" – ")||"Kamp",
          date:homeActivityDate(m),
          startTime:homeActivityTime(m),
          place:m.venue||m.place||m.stadium||"",
          teamName:m.home||m.homeTeam||m.home_team||""
        })).filter(m=>m.date);
      }
    }catch(_){}
    const combined=[...activities,...matches]
      .filter(a=>homeActivityDate(a)>=todayKey)
      .sort((a,b)=>(homeActivityDate(a)+homeActivityTime(a)).localeCompare(homeActivityDate(b)+homeActivityTime(b)));
    const isTraining=a=>a?.sourceKind==="session"||/træning|traening|training|fysisk/i.test(String(a?.type||""));
    const upcomingTraining=combined.find(isTraining)||null;
    const dateLabel=d=>{try{return new Date(String(d).slice(0,10)+"T12:00:00").toLocaleDateString("da-DK",{weekday:"short",day:"2-digit",month:"short"})}catch(_){return d||""}};
    const openTraining=(a,kind)=>{
      try {
        if(kind==="session"||a?.sourceKind==="session") {
          const id=String(a.sessionId||a.id||"").replace(/^session:/,"");
          if(id && typeof window.start11OpenTrainingPlanEditorModal==="function") window.start11OpenTrainingPlanEditorModal(id);
          return;
        }
        if(a && window.START11CalendarPlanner?.openTrainingPlan) window.START11CalendarPlanner.openTrainingPlan(a);
        else if(a && window.START11CalendarPlanner?.open) window.START11CalendarPlanner.open(a.date,a.id);
        else if(a?.trainingPlanSessionId && typeof window.start11OpenTrainingPlanEditorModal==="function") window.start11OpenTrainingPlanEditorModal(a.trainingPlanSessionId);
        else if(typeof window.start11OpenTrainingPlanEditorModal==="function") window.start11OpenTrainingPlanEditorModal(a?.id);
      } catch(err){console.warn("START11 home training open:",err)}
    };
    const nextDate=$("s34TrainingDate"), nextTitle=$("s34TrainingTitle"), nextMeta=$("s34TrainingMeta"), nextBtn=$("s34OpenTraining");
    if(upcomingTraining){
      text(nextDate,`${dateLabel(homeActivityDate(upcomingTraining))}${homeActivityTime(upcomingTraining)?` · ${esc(homeActivityTime(upcomingTraining))}`:""}`);
      text(nextTitle,upcomingTraining.title||upcomingTraining.name||upcomingTraining.type||"Træning");
      const meta=[upcomingTraining.place,upcomingTraining.focus||upcomingTraining.theme].filter(Boolean).join(" · ");
      text(nextMeta,meta);
      if(nextBtn){nextBtn.textContent="Åbn træning →";nextBtn.onclick=()=>openTraining(upcomingTraining,upcomingTraining.sourceKind==="session"?"session":"activity");}
    } else {
      text(nextDate,"Ingen planlagt træning");text(nextTitle,"—");text(nextMeta,"");
      if(nextBtn){nextBtn.textContent="Åbn træning →";nextBtn.onclick=null;}
    }
    const list=$("s34Activities");
    if(list){
      const upcoming=combined.slice(0,5);
      set(list,upcoming.map(a=>{
        const date=homeActivityDate(a), time=homeActivityTime(a);
        const when=`${dateLabel(date)}${time?` · ${esc(time)}`:""}`;
        const title=a.title||a.name||a.type||"Aktivitet";
        const detail=[a.type,a.place,a.teamName||a.team].filter(Boolean).join(" · ");
        return `<button type="button" class="s37-existing-activity" data-home-activity="${esc(a.id||"")}" data-home-type="${esc(a.type||"")}" data-home-kind="${esc(a.sourceKind||"activity")}"><span>${esc(when)}</span><strong>${esc(title)}</strong><small>${esc(detail)}</small></button>`;
      }).join("")||'<div class="s37-calendar-empty">Ingen kommende aktiviteter.</div>');
      if(!list.dataset.bound){
        list.dataset.bound="1";
        list.addEventListener("click",e=>{
          const b=e.target.closest("[data-home-activity]");if(!b)return;
          const kind=b.dataset.homeKind, id=String(b.dataset.homeActivity||"");
          if(kind==="session"){openTraining({id:id.replace(/^session:/,"")}, "session");return;}
          if(kind==="match"){ $("s34OpenMatch")?.click(); return; }
          const a=calendarData().find(x=>String(x.id)===id);if(!a)return;
          if(isTraining(a))openTraining(a,"activity");
          else if(window.START11CalendarPlanner?.open)window.START11CalendarPlanner.open(a.date,a.id);
          else $("s34OpenCalendar")?.click();
        });
      }
    }
  }
  function calendarPanelStyles(){
    if($("s37CalendarPanelStyles"))return;
    const style=document.createElement("style");style.id="s37CalendarPanelStyles";
    style.textContent=`#s34Activities{display:grid;gap:6px}.s37-existing-activity{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:3px 8px;width:100%;padding:9px 0;text-align:left;border:0;border-bottom:1px solid rgba(255,255,255,.08);background:transparent;color:inherit;cursor:pointer}.s37-existing-activity:hover strong{color:#71ed54}.s37-existing-activity span{grid-column:1/-1;color:#a4b3a8;font-size:10px}.s37-existing-activity strong{font-size:12px;font-weight:700}.s37-existing-activity small{grid-column:1/-1;color:#a4b3a8;font-size:10px}.s37-calendar-empty{padding:10px 0;color:#92a096;font-size:11px}`;
    document.head.appendChild(style);
  }
  function actions(){
    // The global quick-action strip was redundant with navigation and lineup actions.
    // Hide it only on the home dashboard; keep the underlying app features intact.
    const q=document.querySelector("#s34HomeView .s34-quick");
    if(q){q.hidden=true;q.setAttribute("aria-hidden","true");q.style.display="none";}
  }
  function bindClicks(){
    if(window.__START11_HOME_V37_CLICKS__)return;window.__START11_HOME_V37_CLICKS__=true;
    document.addEventListener("click",e=>{
      const b=e.target.closest&&e.target.closest("#s34HomeView [data-go]");if(!b)return;
      const go=b.dataset.go,click=id=>$(id)?.click();
      if(go==="squad")click("s34OpenSquad");
      else if(go==="send"){if(typeof start11OpenBriefStudio==="function")start11OpenBriefStudio("match");else click("s34ShareLineup")}
      else if(go==="scouting")click("s34OpenCoaching");
      else if(go==="edit")click("s34OpenMatch");
      else if(go==="pdf")click("topPdfButton");
      else if(go==="newmatch")click("s34OpenMatch");
      else if(go==="newtraining")click("s34OpenTraining");
      else if(go==="video")document.querySelector('[data-s34="video"]')?.click();
    });
  }
  function run(){if(!ready())return;try{greeting();alerts();matchBadges();status();lineupSide();opponent();calendarPanelStyles();calendarPanel();actions();bindClicks()}catch(err){console.warn("START11 home v37:",err)}}
  function start(){run();setInterval(run,1800);document.addEventListener("click",()=>setTimeout(run,180));window.addEventListener("load",()=>setTimeout(run,400))}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
