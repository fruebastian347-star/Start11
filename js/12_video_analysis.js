/* =========================================================
 START11 V26.6 – VIDEO ANALYSIS UX
 BASE: V26.5
 - Øvelsesbank/kampsituationer/trup røres ikke.
 - Fullscreen analyse-workspace.
 - Tidsfelter bruger HH:MM:SS / MM:SS i stedet for rå sekunder.
 - Synlig fra/til bruger samme tidsformat.
========================================================= */
(function start11V266VideoUX(){
"use strict";

const timeText=(sec, decimals=false)=>{
  sec=Math.max(0,Number(sec)||0);
  const h=Math.floor(sec/3600);
  const m=Math.floor((sec%3600)/60);
  const s=sec%60;
  const ss=decimals ? s.toFixed(1).padStart(4,"0") : String(Math.floor(s)).padStart(2,"0");
  return h ? `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${ss}` : `${String(m).padStart(2,"0")}:${ss}`;
};
const parseTime=(raw,fallback=0)=>{
  const v=String(raw??"").trim().replace(",",".");
  if(!v)return Number(fallback)||0;
  if(!v.includes(":")){
    const n=Number(v);return Number.isFinite(n)?Math.max(0,n):(Number(fallback)||0);
  }
  const p=v.split(":").map(Number);
  if(p.some(n=>!Number.isFinite(n)))return Number(fallback)||0;
  let sec=0;
  if(p.length===2)sec=p[0]*60+p[1];
  else if(p.length===3)sec=p[0]*3600+p[1]*60+p[2];
  else return Number(fallback)||0;
  return Math.max(0,sec);
};

function installCss(){
 if(document.getElementById("s266VideoCss"))return;
 const st=document.createElement("style");st.id="s266VideoCss";
 st.textContent=`
 #s18Fullscreen{margin-left:auto}
 body.s266-video-fullscreen{overflow:hidden!important}
 body.s266-video-fullscreen #s13content{
   position:fixed!important;inset:0!important;z-index:2147483000!important;
   width:100vw!important;height:100vh!important;max-width:none!important;
   padding:12px!important;margin:0!important;box-sizing:border-box!important;
   overflow:auto!important;background:#050b06!important
 }
 body.s266-video-fullscreen .s18-layout{
   grid-template-columns:230px minmax(0,1fr) 330px!important;
   min-height:calc(100vh - 72px)!important
 }
 body.s266-video-fullscreen .s18-stage{max-height:calc(100vh - 265px)}
 body.s266-video-fullscreen #s18Fullscreen{border-color:var(--s11-primary)!important;color:var(--s11-primary)!important}
 .s266-time-input{font-variant-numeric:tabular-nums!important;letter-spacing:.35px}
 .s266-time-help{display:block;margin-top:3px;color:#657169;font-size:6px}
 .s266-fs-tip{font-size:6px;color:#748078;margin-left:3px}
 @media(max-width:1100px){
   body.s266-video-fullscreen .s18-layout{grid-template-columns:200px minmax(0,1fr)!important}
   body.s266-video-fullscreen .s18-layout>.s18-side:last-child{grid-column:1/-1!important}
 }
 `;
 document.head.appendChild(st);
}

function toggleFullscreen(){
 const on=!document.body.classList.contains("s266-video-fullscreen");
 document.body.classList.toggle("s266-video-fullscreen",on);
 const b=document.getElementById("s18Fullscreen");
 if(b)b.textContent=on?"⛶ LUK FULD SKÆRM":"⛶ FULD SKÆRM";
 setTimeout(()=>{
   const v=document.getElementById("s18Video");
   if(v)window.dispatchEvent(new Event("resize"));
 },30);
}
function exitFullscreen(){
 if(document.body.classList.remove("s266-video-fullscreen")){
   const b=document.getElementById("s18Fullscreen");if(b)b.textContent="⛶ FULD SKÆRM";
 }
}

function enhanceToolbar(){
 const toolbar=document.querySelector(".s18-toolbar");
 if(!toolbar||document.getElementById("s18Fullscreen"))return;
 const b=document.createElement("button");b.id="s18Fullscreen";b.className="s13btn";b.type="button";b.textContent="⛶ FULD SKÆRM";
 b.onclick=toggleFullscreen;
 toolbar.appendChild(b);
 const tip=document.createElement("span");tip.className="s266-fs-tip";tip.textContent="F11-lignende analysevisning · ESC lukker";toolbar.appendChild(tip);
}

function enhanceTimeFields(){
 const c=typeof s18Clip==="function"?s18Clip():null;
 const fields=[
   ["s18CStart",c?.startSec,"Fx 16:09"],
   ["s18CEnd",c?.endSec,"Fx 16:24"]
 ];
 fields.forEach(([id,val,ph])=>{
   const el=document.getElementById(id);if(!el||el.dataset.s266==="1")return;
   el.dataset.s266="1";el.type="text";el.inputMode="numeric";el.placeholder=ph;el.classList.add("s266-time-input");
   el.value=timeText(val);
   el.title="Skriv fx 16:09 eller 01:16:09";
   const help=document.createElement("small");help.className="s266-time-help";help.textContent="MM:SS eller HH:MM:SS";el.insertAdjacentElement("afterend",help);
 });
 const a=c?.annotations?.find(x=>x.id===s18.selectedAnn);
 [["s18AnnStart",a?.startTime,"Fx 16:09"],["s18AnnEnd",a?.endTime,"Fx 16:14"]].forEach(([id,val,ph])=>{
   const el=document.getElementById(id);if(!el||el.dataset.s266==="1")return;
   el.dataset.s266="1";el.type="text";el.inputMode="numeric";el.placeholder=ph;el.classList.add("s266-time-input");
   if(val!=null)el.value=timeText(val);
   const help=document.createElement("small");help.className="s266-time-help";help.textContent="MM:SS eller HH:MM:SS";el.insertAdjacentElement("afterend",help);
 });
}

/* Replace only the clip editor save binding so formatted time is converted back to seconds. */
if(typeof s18BindClipEditor==="function"){
 s18BindClipEditor=function(){
   const c=s18Clip();if(!c)return;
   enhanceTimeFields();
   document.getElementById("s18CPlayer")?.addEventListener("change",e=>{
     c.playerId=e.target.value;c.attributeId="";s18Touch();s18RenderPanels();
   });
   document.getElementById("s18SaveClip")?.addEventListener("click",()=>{
     c.title=document.getElementById("s18CTitle").value||"Klip";
     c.startSec=parseTime(document.getElementById("s18CStart").value,c.startSec);
     c.endSec=parseTime(document.getElementById("s18CEnd").value,c.endSec);
     if(c.endSec<=c.startSec){visNotification?.("OUT skal ligge efter IN.");return}
     c.playerId=document.getElementById("s18CPlayer").value;
     c.phase=document.getElementById("s18CPhase").value;
     c.outcome=document.getElementById("s18COutcome").value;
     c.attributeId=document.getElementById("s18CAttr").value;
     c.tags=document.getElementById("s18CTags").value;
     c.observation=document.getElementById("s18CObs").value;
     c.coachingQuestion=document.getElementById("s18CQ").value;
     c.action=document.getElementById("s18CAction").value;
     c.showInMeeting=document.getElementById("s18CMeeting").checked;
     s18Touch();s18RenderPanels();s18Seek(c);visNotification?.("Klipanalysen er gemt.");
   });
   document.getElementById("s18DelClip")?.addEventListener("click",()=>{
     const p=s18Project();if(confirm(`Slet ${c.title}?`)){
       p.clips=p.clips.filter(x=>x.id!==c.id);s18.clipId=p.clips[0]?.id||null;s18Touch();s18Render(document.getElementById("s13content"));
     }
   });
   document.getElementById("s18SaveAnnTime")?.addEventListener("click",()=>{
     const a=c.annotations.find(x=>x.id===s18.selectedAnn);
     if(!a){visNotification?.("Vælg en markering først.");return}
     s18PushUndo();
     a.startTime=parseTime(document.getElementById("s18AnnStart").value,a.startTime);
     a.endTime=parseTime(document.getElementById("s18AnnEnd").value,a.endTime);
     if(a.endTime<a.startTime)a.endTime=a.startTime;
     s18Touch();s18Draw();s18RenderAnnList();enhanceTimeFields();
   });
 };
}

/* Ensure annotation selection/render always displays readable timestamps. */
if(typeof s18RenderAnnList==="function"){
 const oldRenderAnn=s18RenderAnnList;
 s18RenderAnnList=function(){
   const r=oldRenderAnn.apply(this,arguments);
   setTimeout(enhanceTimeFields,0);
   return r;
 };
}

/* Keep enhancements alive through Video Studio rerenders. */
const observer=new MutationObserver(()=>{
 if(document.querySelector(".s18-layout")){
   installCss();enhanceToolbar();enhanceTimeFields();
 }else if(document.body.classList.contains("s266-video-fullscreen")){
   exitFullscreen();
 }
});
const begin=()=>{
 installCss();
 observer.observe(document.body,{childList:true,subtree:true});
 enhanceToolbar();enhanceTimeFields();
};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",begin,{once:true});else begin();

document.addEventListener("keydown",e=>{
 if(e.key==="Escape"&&document.body.classList.contains("s266-video-fullscreen")){e.preventDefault();exitFullscreen()}
 // F toggles fullscreen while Video Studio is active and focus is not in a field.
 if(e.key.toLowerCase()==="f"&&document.querySelector(".s18-layout")&&!["INPUT","TEXTAREA","SELECT"].includes(e.target?.tagName)){
   e.preventDefault();toggleFullscreen();
 }
});

window.START11_BUILD="V26.6-VIDEO-FULLSCREEN-TIMECODE";
console.info("START11 loaded:",window.START11_BUILD);
})();




/* =========================================================
 START11 V26.7 – PRO VIDEO WORKSPACE
 BASE: V26.6
 Scope: VIDEO ONLY. No AI.
 Inspired by coding/timeline/presentation workflows in
 Sportscode, Nacsport and LongoMatch.
========================================================= */
(function start11V267ProVideo(){
"use strict";

const q=s=>document.querySelector(s);
const qa=s=>[...document.querySelectorAll(s)];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const esc=v=>typeof s13Esc==="function"?s13Esc(String(v??"")):String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const fmt=sec=>{
 sec=Math.max(0,Number(sec)||0);const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=Math.floor(sec%60);
 return h?`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`:`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
};
const state={open:false,drawer:false,tab:"clip",tagFilter:"",phaseFilter:"",query:""};

const defaultTags=[
 {id:"possession",label:"MED BOLD",key:"1",phase:"Med bold",pre:5,post:8,color:"#82ff54"},
 {id:"defence",label:"UDEN BOLD",key:"2",phase:"Uden bold",pre:5,post:8,color:"#54a7ff"},
 {id:"transitionPlus",label:"OMSTILLING +",key:"3",phase:"Offensiv omstilling",pre:4,post:7,color:"#ffd34e"},
 {id:"transitionMinus",label:"OMSTILLING -",key:"4",phase:"Defensiv omstilling",pre:4,post:7,color:"#ff8a54"},
 {id:"shot",label:"AFSLUTNING",key:"5",tag:"afslutning",pre:6,post:5,color:"#ff5d75"},
 {id:"regain",label:"BOLDEROBRING",key:"6",tag:"bolderobring",pre:5,post:7,color:"#9f7cff"},
 {id:"loss",label:"BOLDTAB",key:"7",tag:"boldtab",pre:5,post:7,color:"#ff9966"},
 {id:"press",label:"GENPRES",key:"8",tag:"genpres",pre:5,post:8,color:"#48e0c2"},
 {id:"setpiece",label:"STANDARD",key:"9",phase:"Standard",pre:7,post:10,color:"#f3b5ff"}
];

function project(){
 const p=typeof s18Project==="function"?s18Project():null;
 if(p){
   if(!Array.isArray(p.videoTagButtons)||!p.videoTagButtons.length)p.videoTagButtons=defaultTags.map(x=>({...x}));
   if(!Array.isArray(p.videoPlaylists))p.videoPlaylists=[];
 }
 return p;
}
function video(){return q("#s18Video")}
function currentClip(){return typeof s18Clip==="function"?s18Clip():null}

function css(){
 if(q("#s267css"))return;
 const st=document.createElement("style");st.id="s267css";st.textContent=`
 body.s267open{overflow:hidden!important}
 #s267ws{position:fixed;inset:0;z-index:2147483600;background:#030704;color:#fff;display:none;grid-template-rows:auto minmax(0,1fr) auto}
 body.s267open #s267ws{display:grid}
 .s267head{height:50px;display:flex;align-items:center;gap:7px;padding:0 12px;border-bottom:1px solid #19321e;background:#061008}
 .s267head strong{font-size:10px}.s267head .mut{font-size:6px;color:#748078;margin-right:auto}.s267head .time{font-size:8px;font-variant-numeric:tabular-nums;color:#b8c4ba}
 .s267main{position:relative;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 0;transition:grid-template-columns .18s ease}
 #s267ws.drawer .s267main{grid-template-columns:minmax(0,1fr) 365px}
 .s267center{min-width:0;min-height:0;display:grid;grid-template-rows:minmax(0,1fr) auto;overflow:hidden}
 .s267videoWrap{position:relative;display:grid;place-items:center;min-height:0;background:#000;overflow:hidden}
 .s267videoWrap video{width:100%!important;height:100%!important;max-height:none!important;object-fit:contain!important;background:#000}
 .s267videoWrap canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
 .s267drawer{min-width:0;overflow:auto;border-left:1px solid #19321e;background:#071009;padding:12px;opacity:0;pointer-events:none}
 #s267ws.drawer .s267drawer{opacity:1;pointer-events:auto}
 .s267drawerTop{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}.s267drawerTop strong{font-size:9px}
 .s267tabs{display:flex;gap:5px;margin-bottom:10px}.s267tabs button.active{background:var(--s11-primary)!important;color:#061008!important}
 .s267controls{display:flex;align-items:center;gap:5px;padding:7px 10px;background:#061008;border-top:1px solid #18301d}
 .s267controls .grow{flex:1}.s267controls .time{font-size:7px;color:#b5c1b7;font-variant-numeric:tabular-nums}
 .s267bottom{border-top:1px solid #19321e;background:#050c07;max-height:270px;overflow:auto}
 .s267tags{display:flex;gap:5px;padding:7px 10px;overflow-x:auto;border-bottom:1px solid #142919}
 .s267tag{flex:0 0 auto;height:34px;padding:0 10px;border:1px solid var(--tc);border-radius:6px;background:#071009;color:#fff;font:inherit;font-size:7px;font-weight:950;cursor:pointer}
 .s267tag kbd{margin-left:7px;padding:2px 4px;border-radius:3px;background:#ffffff12;color:var(--tc);font-size:6px}
 .s267timeline{padding:7px 10px 10px}.s267scale{height:18px;position:relative;border-bottom:1px solid #18301d;color:#627067;font-size:5px}
 .s267track{height:25px;display:grid;grid-template-columns:100px minmax(0,1fr);align-items:center}.s267trackName{font-size:6px;color:#8c998f;padding-right:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
 .s267rail{height:17px;position:relative;background:#071009;border:1px solid #122817;border-radius:4px;overflow:hidden}
 .s267event{position:absolute;top:2px;bottom:2px;min-width:3px;border-radius:3px;background:var(--ec);opacity:.85;cursor:pointer}.s267event:hover{opacity:1;box-shadow:0 0 0 1px #fff8}
 .s267playhead{position:absolute;top:0;bottom:0;width:1px;background:#fff;z-index:5;pointer-events:none}
 .s267filter{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:9px}.s267filter .wide{grid-column:1/-1}
 .s267statgrid{display:grid;grid-template-columns:1fr 1fr;gap:7px}.s267stat{padding:10px;border:1px solid #18331e;border-radius:7px;background:#09140b}.s267stat b{display:block;font-size:18px;color:var(--s11-primary)}.s267stat span{font-size:6px;color:#859188}
 .s267cliprow{padding:8px;border:1px solid #17301c;border-radius:6px;margin-bottom:5px;cursor:pointer}.s267cliprow:hover{border-color:var(--s11-primary)}.s267cliprow strong{font-size:7px}.s267cliprow div{font-size:6px;color:#7e8b82;margin-top:3px}
 .s267shortcut{display:grid;grid-template-columns:42px 1fr;gap:7px;align-items:center;padding:5px 0;border-bottom:1px solid #122416;font-size:6px}.s267shortcut kbd{padding:4px;text-align:center;border:1px solid #284c30;border-radius:4px;color:var(--s11-primary)}
 .s267toast{position:absolute;left:50%;top:20px;transform:translateX(-50%);z-index:20;padding:7px 12px;border:1px solid #82ff54;border-radius:6px;background:#071009;color:#fff;font-size:7px;opacity:0;transition:.15s;pointer-events:none}.s267toast.show{opacity:1}
 @media(max-width:900px){#s267ws.drawer .s267main{grid-template-columns:1fr}.s267drawer{position:absolute;right:0;top:0;bottom:0;width:min(365px,92vw);z-index:15}}
 `;
 document.head.appendChild(st);
}

function ensure(){
 css();
 let ws=q("#s267ws");if(ws)return ws;
 ws=document.createElement("div");ws.id="s267ws";
 ws.innerHTML=`<div class="s267head">
   <strong>START11 VIDEO</strong><span class="mut">PRO ANALYSE WORKSPACE</span>
   <span class="time" id="s267Clock">00:00 / 00:00</span>
   <button class="s13btn" id="s267ClipBtn">K · NYT KLIP</button>
   <button class="s13btn" id="s267TagsBtn">TAGS</button>
   <button class="s13btn" id="s267DrawBtn">TEGN</button>
   <button class="s13btn" id="s267Close">ESC · LUK</button>
 </div>
 <div class="s267main">
   <div class="s267center">
     <div class="s267videoWrap" id="s267VideoWrap"><div class="s267toast" id="s267Toast"></div></div>
     <div class="s267controls">
       <button class="s18-tool" data-a="back">-5</button><button class="s18-tool" data-a="prev">◀|</button><button class="s18-tool" data-a="play">PLAY</button><button class="s18-tool" data-a="next">|▶</button><button class="s18-tool" data-a="forward">+5</button>
       <button class="s18-tool" data-a="in">I · IN</button><button class="s18-tool" data-a="out">O · OUT</button>
       <span class="grow"></span><span class="time" id="s267InOut">IN — · OUT —</span>
     </div>
   </div>
   <aside class="s267drawer"><div class="s267drawerTop"><strong id="s267DrawerTitle">KLIP</strong><button class="s13btn" id="s267DrawerClose">×</button></div><div class="s267tabs">
     <button class="s13btn active" data-tab="clip">KLIP</button><button class="s13btn" data-tab="filter">SØG</button><button class="s13btn" data-tab="stats">DATA</button><button class="s13btn" data-tab="keys">GENVEJE</button>
   </div><div id="s267DrawerBody"></div></aside>
 </div>
 <div class="s267bottom"><div class="s267tags" id="s267Tags"></div><div class="s267timeline" id="s267Timeline"></div></div>`;
 document.body.appendChild(ws);
 q("#s267Close").onclick=close;
 q("#s267DrawerClose").onclick=()=>drawer(false);
 q("#s267ClipBtn").onclick=quickClip;
 q("#s267TagsBtn").onclick=()=>{state.tab="filter";drawer(true);renderDrawer()};
 q("#s267DrawBtn").onclick=()=>{drawer(false);toast("Tegneværktøjer: A pil · R firkant · C cirkel · S spotlight · F frihånd · T tekst")};
 qa("#s267ws [data-tab]").forEach(b=>b.onclick=()=>{state.tab=b.dataset.tab;renderDrawer()});
 qa("#s267ws [data-a]").forEach(b=>b.onclick=()=>action(b.dataset.a));
 return ws;
}

function toast(t){
 const el=q("#s267Toast");if(!el)return;el.textContent=t;el.classList.add("show");clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove("show"),1400);
}
function action(a){
 const v=video();if(!v)return;
 if(a==="play")v.paused?v.play():v.pause();
 if(a==="back")v.currentTime=clamp(v.currentTime-5,0,v.duration||1e9);
 if(a==="forward")v.currentTime=clamp(v.currentTime+5,0,v.duration||1e9);
 if(a==="prev"){v.pause();v.currentTime=clamp(v.currentTime-1/25,0,v.duration||1e9)}
 if(a==="next"){v.pause();v.currentTime=clamp(v.currentTime+1/25,0,v.duration||1e9)}
 if(a==="in"){s18.inSec=+v.currentTime.toFixed(3);toast("IN · "+fmt(s18.inSec))}
 if(a==="out"){s18.outSec=+v.currentTime.toFixed(3);toast("OUT · "+fmt(s18.outSec))}
 renderInOut();renderTimeline();
}
function renderInOut(){const e=q("#s267InOut");if(e)e.textContent=`IN ${s18.inSec==null?"—":fmt(s18.inSec)} · OUT ${s18.outSec==null?"—":fmt(s18.outSec)}`}

function open(){
 const v=video();if(!v)return;
 const ws=ensure(),wrap=q("#s267VideoWrap");
 if(!v._s267Home)v._s267Home={parent:v.parentNode,next:v.nextSibling};
 wrap.prepend(v);
 const cv=q("#s18Canvas");if(cv){if(!cv._s267Home)cv._s267Home={parent:cv.parentNode,next:cv.nextSibling};wrap.appendChild(cv)}
 document.body.classList.remove("s266-video-fullscreen");
 document.body.classList.add("s267open");state.open=true;
 v.controls=false;
 v.ontimeupdate=()=>{if(q("#s267Clock"))q("#s267Clock").textContent=`${fmt(v.currentTime)} / ${fmt(v.duration)}`;if(typeof s18Draw==="function")s18Draw();updatePlayhead()};
 renderTags();renderTimeline();renderDrawer();renderInOut();
 setTimeout(()=>window.dispatchEvent(new Event("resize")),30);
}
function restoreNode(n){if(n?._s267Home?.parent){const {parent,next}=n._s267Home;next&&next.parentNode===parent?parent.insertBefore(n,next):parent.appendChild(n)}}
function close(){
 const v=video(),cv=q("#s18Canvas");restoreNode(v);restoreNode(cv);
 document.body.classList.remove("s267open");state.open=false;drawer(false);
 setTimeout(()=>window.dispatchEvent(new Event("resize")),30);
}
function drawer(on=true){state.drawer=on;ensure().classList.toggle("drawer",on)}
function quickClip(){
 const v=video();if(!v)return;v.pause();
 const p=project();if(!p)return;
 // K always creates a sensible review window around the current frame.
 const a=clamp(v.currentTime-5,0,v.duration||1e9),b=clamp(v.currentTime+8,0,v.duration||v.currentTime+8);
 const c={id:s13Id("clip"),title:`Klip ${p.clips.length+1}`,startSec:+a.toFixed(3),endSec:+b.toFixed(3),playerId:"",attributeId:"",phase:"Med bold",outcome:"Udvikling",tags:"",observation:"",coachingQuestion:"",action:"",showInMeeting:true,annotations:[],createdAt:new Date().toISOString()};
 p.clips.push(c);s18.clipId=c.id;s18.inSec=c.startSec;s18.outSec=c.endSec;s18Touch?.();
 state.tab="clip";drawer(true);renderDrawer();renderTimeline();toast("Klip oprettet · video pauset");
}
function tag(btn){
 const v=video(),p=project();if(!v||!p)return;
 const c={id:s13Id("clip"),title:btn.label,startSec:+clamp(v.currentTime-btn.pre,0,v.duration||1e9).toFixed(3),endSec:+clamp(v.currentTime+btn.post,0,v.duration||v.currentTime+btn.post).toFixed(3),playerId:"",attributeId:"",phase:btn.phase||"Med bold",outcome:"Udvikling",tags:btn.tag||btn.label.toLowerCase(),observation:"",coachingQuestion:"",action:"",showInMeeting:true,annotations:[],tagButtonId:btn.id,createdAt:new Date().toISOString()};
 p.clips.push(c);s18.clipId=c.id;s18Touch?.();renderTimeline();toast(`${btn.label} · ${fmt(c.startSec)}–${fmt(c.endSec)}`);
}
function renderTags(){
 const p=project(),host=q("#s267Tags");if(!p||!host)return;
 host.innerHTML=p.videoTagButtons.map(t=>`<button class="s267tag" style="--tc:${t.color}" data-tag="${esc(t.id)}">${esc(t.label)}<kbd>${esc(t.key)}</kbd></button>`).join("");
 host.querySelectorAll("[data-tag]").forEach(b=>b.onclick=()=>tag(p.videoTagButtons.find(t=>t.id===b.dataset.tag)));
}
function tracks(){
 const p=project();if(!p)return[];
 const phases=["Med bold","Uden bold","Offensiv omstilling","Defensiv omstilling","Standard"];
 return phases.map((name,i)=>({name,color:["#82ff54","#54a7ff","#ffd34e","#ff8a54","#f3b5ff"][i],clips:p.clips.filter(c=>c.phase===name)}));
}
function renderTimeline(){
 const p=project(),v=video(),host=q("#s267Timeline");if(!p||!host)return;
 const dur=Math.max(1,v?.duration||Math.max(1,...p.clips.map(c=>c.endSec||0)));
 host.innerHTML=`<div class="s267scale"><span>0:00</span></div>`+tracks().map(t=>`<div class="s267track"><div class="s267trackName">${esc(t.name)}</div><div class="s267rail">${t.clips.map(c=>`<i class="s267event" data-event="${esc(c.id)}" title="${esc(c.title)} · ${fmt(c.startSec)}" style="--ec:${t.color};left:${c.startSec/dur*100}%;width:${Math.max(.25,(c.endSec-c.startSec)/dur*100)}%"></i>`).join("")}<i class="s267playhead" style="left:${(v?.currentTime||0)/dur*100}%"></i></div></div>`).join("");
 host.querySelectorAll("[data-event]").forEach(e=>e.onclick=()=>{s18.clipId=e.dataset.event;const c=currentClip();if(v&&c){v.pause();v.currentTime=c.startSec}state.tab="clip";drawer(true);renderDrawer()});
}
function updatePlayhead(){
 const p=project(),v=video();if(!p||!v)return;const dur=Math.max(1,v.duration||1);
 qa("#s267Timeline .s267playhead").forEach(x=>x.style.left=(v.currentTime/dur*100)+"%");
}
function clipForm(c){
 if(!c)return`<div class="s13mut">Tryk K for at oprette et klip.</div>`;
 return `<div class="s13stack">
 <label class="s13field">Titel<input id="s267Title" class="s13in" value="${esc(c.title)}"></label>
 <div class="s13grid"><label class="s13field">IN<input id="s267Start" class="s13in" value="${fmt(c.startSec)}"></label><label class="s13field">OUT<input id="s267End" class="s13in" value="${fmt(c.endSec)}"></label></div>
 <label class="s13field">Spilfase<select id="s267Phase" class="s13sel">${["Med bold","Uden bold","Offensiv omstilling","Defensiv omstilling","Standard"].map(x=>`<option ${x===c.phase?"selected":""}>${x}</option>`).join("")}</select></label>
 <label class="s13field">Tags<input id="s267ClipTags" class="s13in" value="${esc(c.tags||"")}"></label>
 <label class="s13field">Observation<textarea id="s267Obs" class="s13txt">${esc(c.observation||"")}</textarea></label>
 <label class="s13field">Coaching-spørgsmål<textarea id="s267Q" class="s13txt">${esc(c.coachingQuestion||"")}</textarea></label>
 <label class="s13field">Næste handling<textarea id="s267Action" class="s13txt">${esc(c.action||"")}</textarea></label>
 <button class="s13btn primary" id="s267Save">GEM KLIP</button></div>`;
}
function parseTime(v,f=0){const p=String(v||"").replace(",",".").split(":").map(Number);if(p.some(Number.isNaN))return f;return p.length===3?p[0]*3600+p[1]*60+p[2]:p.length===2?p[0]*60+p[1]:p[0]||f}
function renderDrawer(){
 const body=q("#s267DrawerBody");if(!body)return;
 qa("#s267ws [data-tab]").forEach(b=>b.classList.toggle("active",b.dataset.tab===state.tab));
 if(state.tab==="clip"){
   const c=currentClip();q("#s267DrawerTitle").textContent="KLIPANALYSE";body.innerHTML=clipForm(c);
   q("#s267Save")?.addEventListener("click",()=>{if(!c)return;c.title=q("#s267Title").value||"Klip";c.startSec=parseTime(q("#s267Start").value,c.startSec);c.endSec=parseTime(q("#s267End").value,c.endSec);c.phase=q("#s267Phase").value;c.tags=q("#s267ClipTags").value;c.observation=q("#s267Obs").value;c.coachingQuestion=q("#s267Q").value;c.action=q("#s267Action").value;s18Touch?.();renderTimeline();toast("Klip gemt")});
 }
 if(state.tab==="filter"){
   q("#s267DrawerTitle").textContent="SØG & FILTRÉR";
   body.innerHTML=`<div class="s267filter"><input class="s13in wide" id="s267Search" placeholder="Søg titel, tags, observation..." value="${esc(state.query)}"><select class="s13sel" id="s267PhaseFilter"><option value="">Alle spilfaser</option>${["Med bold","Uden bold","Offensiv omstilling","Defensiv omstilling","Standard"].map(x=>`<option ${state.phaseFilter===x?"selected":""}>${x}</option>`).join("")}</select><select class="s13sel" id="s267TagFilter"><option value="">Alle tags</option>${[...new Set((project()?.clips||[]).flatMap(c=>String(c.tags||"").split(",").map(x=>x.trim()).filter(Boolean)))].map(x=>`<option ${state.tagFilter===x?"selected":""}>${esc(x)}</option>`).join("")}</select></div><div id="s267Results"></div>`;
   const run=()=>{state.query=q("#s267Search").value.toLowerCase();state.phaseFilter=q("#s267PhaseFilter").value;state.tagFilter=q("#s267TagFilter").value;const rows=(project()?.clips||[]).filter(c=>(!state.phaseFilter||c.phase===state.phaseFilter)&&(!state.tagFilter||String(c.tags).includes(state.tagFilter))&&(!state.query||`${c.title} ${c.tags} ${c.observation}`.toLowerCase().includes(state.query)));q("#s267Results").innerHTML=rows.map(c=>`<div class="s267cliprow" data-r="${esc(c.id)}"><strong>${esc(c.title)}</strong><div>${fmt(c.startSec)} → ${fmt(c.endSec)} · ${esc(c.phase)}</div></div>`).join("")||`<div class="s13mut">Ingen klip matcher.</div>`;qa("#s267Results [data-r]").forEach(r=>r.onclick=()=>{s18.clipId=r.dataset.r;const c=currentClip();if(video()&&c)video().currentTime=c.startSec;state.tab="clip";renderDrawer()})};["s267Search","s267PhaseFilter","s267TagFilter"].forEach(id=>q("#"+id).addEventListener(id==="s267Search"?"input":"change",run));run();
 }
 if(state.tab==="stats"){
   q("#s267DrawerTitle").textContent="ANALYSEDATA";const clips=project()?.clips||[],count=x=>clips.filter(c=>c.phase===x).length;
   body.innerHTML=`<div class="s267statgrid"><div class="s267stat"><b>${clips.length}</b><span>KLIP I ALT</span></div><div class="s267stat"><b>${count("Med bold")}</b><span>MED BOLD</span></div><div class="s267stat"><b>${count("Uden bold")}</b><span>UDEN BOLD</span></div><div class="s267stat"><b>${count("Offensiv omstilling")+count("Defensiv omstilling")}</b><span>OMSTILLINGER</span></div><div class="s267stat"><b>${clips.filter(c=>/afslutning/i.test(c.tags||"")).length}</b><span>AFSLUTNINGER</span></div><div class="s267stat"><b>${clips.filter(c=>/genpres/i.test(c.tags||"")).length}</b><span>GENPRES</span></div></div><button class="s13btn" id="s267ExportCsv" style="width:100%;margin-top:9px">EKSPORTÉR KLIPDATA CSV</button>`;
   q("#s267ExportCsv").onclick=()=>{const head=["Titel","IN","OUT","Spilfase","Tags","Observation"],rows=clips.map(c=>[c.title,c.startSec,c.endSec,c.phase,c.tags,c.observation]);const csv=[head,...rows].map(r=>r.map(x=>`"${String(x??"").replaceAll('"','""')}"`).join(";")).join("\n");const u=URL.createObjectURL(new Blob([csv],{type:"text/csv"})),a=document.createElement("a");a.href=u;a.download=(project()?.title||"analyse")+"-klip.csv";a.click();setTimeout(()=>URL.revokeObjectURL(u),500)};
 }
 if(state.tab==="keys"){
   q("#s267DrawerTitle").textContent="GENVEJE";body.innerHTML=[["K","Opret klip + pause"],["SPACE","Play / pause"],["I / O","Sæt IN / OUT"],["← / →","Frame tilbage / frem"],["J / L","5 sek. tilbage / frem"],["1–9","Tag hændelse"],["A","Pil"],["R","Firkant"],["C","Cirkel"],["S","Spotlight"],["F","Frihånd"],["T","Tekst"],["ESC","Luk panel / fullscreen"]].map(x=>`<div class="s267shortcut"><kbd>${x[0]}</kbd><span>${x[1]}</span></div>`).join("");
 }
}

/* Hook V26.6 fullscreen button to the real video workspace. */
document.addEventListener("click",e=>{
 if(e.target.closest?.("#s18Fullscreen")){e.preventDefault();e.stopImmediatePropagation();open()}
},true);

document.addEventListener("keydown",e=>{
 if(!state.open)return;
 if(["INPUT","TEXTAREA","SELECT"].includes(e.target?.tagName))return;
 const k=e.key.toLowerCase(),p=project();
 if(k==="escape"){e.preventDefault();state.drawer?drawer(false):close();return}
 if(k==="k"){e.preventDefault();quickClip();return}
 if(k===" "){e.preventDefault();action("play");return}
 if(k==="i"){action("in");return} if(k==="o"){action("out");return}
 if(e.key==="ArrowLeft"){e.preventDefault();action("prev");return} if(e.key==="ArrowRight"){e.preventDefault();action("next");return}
 if(k==="j"){action("back");return} if(k==="l"){action("forward");return}
 const tb=p?.videoTagButtons?.find(t=>t.key===e.key);if(tb){e.preventDefault();tag(tb);return}
 // Existing annotation shortcuts remain active through the original s18Key handler.
},true);

/* Keep presentation useful as a playlist builder: selected clips can be toggled via showInMeeting. */
const oldPresent=window.s18OpenPresent;
if(typeof s18OpenPresent==="function"){
 const original=s18OpenPresent;
 window.s18OpenPresent=s18OpenPresent=function(projectId){
   const p=project();if(p){
     const chosen=p.clips.filter(c=>c.showInMeeting!==false);
     if(chosen.length && chosen.length!==p.clips.length){
       // Non-destructive temporary presentation order.
       const all=p.clips;p.clips=chosen;
       const r=original(projectId);
       Promise.resolve(r).finally(()=>{p.clips=all});
       return r;
     }
   }
   return original(projectId);
 };
}

window.START11_BUILD="V26.7-PRO-VIDEO-WORKSPACE";
console.info("START11 loaded:",window.START11_BUILD);
})();




/* =========================================================
 START11 V26.8 – RESIZABLE VIDEO WORKSPACE + SCRUBBER
 BASE: V26.7
 VIDEO ONLY.
========================================================= */
(function start11V268VideoControls(){
"use strict";

function css(){
 if(document.getElementById("s268css"))return;
 const st=document.createElement("style");st.id="s268css";st.textContent=`
 #s267ws{--s268-bottom-h:230px}
 #s267ws .s267bottom{height:var(--s268-bottom-h)!important;max-height:none!important;min-height:58px!important;position:relative;overflow:auto!important}
 #s268ResizeBar{height:9px;position:sticky;top:0;z-index:30;cursor:ns-resize;background:linear-gradient(to bottom,#071009,#0c1a0f);border-bottom:1px solid #1d3b23;display:grid;place-items:center}
 #s268ResizeBar:after{content:"";width:54px;height:3px;border-radius:99px;background:#34533a}
 #s268ResizeBar:hover:after,#s268ResizeBar.dragging:after{background:var(--s11-primary,#82ff54)}
 #s268ScrubWrap{display:flex;align-items:center;gap:8px;flex:1;min-width:180px;margin:0 6px}
 #s268Scrub{appearance:none;-webkit-appearance:none;width:100%;height:5px;border-radius:99px;background:#18301d;outline:none;cursor:pointer}
 #s268Scrub::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:var(--s11-primary,#82ff54);border:2px solid #061008;box-shadow:0 0 0 1px #82ff5460}
 #s268Scrub::-moz-range-thumb{width:12px;height:12px;border-radius:50%;background:var(--s11-primary,#82ff54);border:2px solid #061008}
 #s268ScrubTime{font-size:6px;color:#9cab9f;white-space:nowrap;font-variant-numeric:tabular-nums}
 #s268Speed{width:62px!important;height:30px!important;padding:0 5px!important;font-size:6px!important}
 #s268FrameHint{font-size:5px;color:#68756b;white-space:nowrap}
 `;
 document.head.appendChild(st);
}
function fmt(sec){
 sec=Math.max(0,Number(sec)||0);const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=Math.floor(sec%60);
 return h?`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`:`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}
function enhance(){
 css();
 const ws=document.getElementById("s267ws");if(!ws)return;

 // Resizable lower analysis/timeline panel.
 const bottom=ws.querySelector(".s267bottom");
 if(bottom&&!document.getElementById("s268ResizeBar")){
   const bar=document.createElement("div");bar.id="s268ResizeBar";bar.title="Træk op eller ned for at ændre størrelsen på analyseområdet";
   bottom.prepend(bar);
   let dragging=false,startY=0,startH=0;
   const move=e=>{
     if(!dragging)return;
     const h=Math.max(58,Math.min(window.innerHeight*.58,startH+(startY-e.clientY)));
     ws.style.setProperty("--s268-bottom-h",h+"px");
   };
   const up=()=>{if(!dragging)return;dragging=false;bar.classList.remove("dragging");document.body.style.cursor="";localStorage.setItem("start11.video.bottomHeight",parseFloat(getComputedStyle(bottom).height)||230);};
   bar.addEventListener("pointerdown",e=>{dragging=true;startY=e.clientY;startH=bottom.getBoundingClientRect().height;bar.classList.add("dragging");document.body.style.cursor="ns-resize";try{bar.setPointerCapture(e.pointerId)}catch(_){};e.preventDefault()});
   bar.addEventListener("pointermove",move);bar.addEventListener("pointerup",up);bar.addEventListener("pointercancel",up);
   const saved=Number(localStorage.getItem("start11.video.bottomHeight"));if(saved>0)ws.style.setProperty("--s268-bottom-h",Math.max(58,Math.min(innerHeight*.58,saved))+"px");
   bar.addEventListener("dblclick",()=>{ws.style.setProperty("--s268-bottom-h","230px");localStorage.setItem("start11.video.bottomHeight","230")});
 }

 // Precise video scrubber between playback controls and IN/OUT readout.
 const controls=ws.querySelector(".s267controls");
 if(controls&&!document.getElementById("s268ScrubWrap")){
   const grow=controls.querySelector(".grow");
   const wrap=document.createElement("div");wrap.id="s268ScrubWrap";
   wrap.innerHTML=`<input id="s268Scrub" type="range" min="0" max="1000" step="0.1" value="0" aria-label="Videoposition"><span id="s268ScrubTime">00:00</span>`;
   if(grow)grow.replaceWith(wrap);else controls.appendChild(wrap);

   const speed=document.createElement("select");speed.id="s268Speed";speed.className="s13sel";speed.title="Afspilningshastighed";
   speed.innerHTML=`<option value=".25">0.25x</option><option value=".5">0.5x</option><option value=".75">0.75x</option><option value="1" selected>1x</option><option value="1.25">1.25x</option><option value="1.5">1.5x</option><option value="2">2x</option>`;
   wrap.insertAdjacentElement("afterend",speed);
   speed.onchange=()=>{const v=document.getElementById("s18Video");if(v)v.playbackRate=Number(speed.value)||1};

   const scrub=wrap.querySelector("#s268Scrub");
   let scrubbing=false,wasPlaying=false;
   scrub.addEventListener("pointerdown",()=>{const v=document.getElementById("s18Video");if(v){scrubbing=true;wasPlaying=!v.paused;v.pause()}});
   scrub.addEventListener("input",()=>{const v=document.getElementById("s18Video");if(!v||!Number.isFinite(v.duration))return;v.currentTime=(Number(scrub.value)/1000)*v.duration;wrap.querySelector("#s268ScrubTime").textContent=fmt(v.currentTime)});
   const finish=()=>{const v=document.getElementById("s18Video");if(!v)return;scrubbing=false;if(wasPlaying)v.play().catch(()=>{});wasPlaying=false};
   scrub.addEventListener("pointerup",finish);scrub.addEventListener("change",()=>{scrubbing=false});

   const update=()=>{const v=document.getElementById("s18Video");if(!v||scrubbing||!Number.isFinite(v.duration)||!v.duration)return;scrub.value=(v.currentTime/v.duration)*1000;wrap.querySelector("#s268ScrubTime").textContent=`${fmt(v.currentTime)} / ${fmt(v.duration)}`};
   setInterval(()=>{if(document.body.classList.contains("s267open"))update()},150);
 }
}
const mo=new MutationObserver(enhance);
const begin=()=>{mo.observe(document.body,{childList:true,subtree:true});enhance()};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",begin,{once:true});else begin();

/* Keyboard refinements. Capture before V26.7:
   Space = pause/play
   Shift+Left/Right = 1 sec
   Left/Right = one frame
   J/L = 5 sec
*/
document.addEventListener("keydown",e=>{
 if(!document.body.classList.contains("s267open"))return;
 if(["INPUT","TEXTAREA","SELECT"].includes(e.target?.tagName))return;
 const v=document.getElementById("s18Video");if(!v)return;
 if(e.code==="Space"){
   e.preventDefault();e.stopImmediatePropagation();
   v.paused?v.play().catch(()=>{}):v.pause();
   return;
 }
 if(e.key==="ArrowLeft"&&e.shiftKey){e.preventDefault();e.stopImmediatePropagation();v.pause();v.currentTime=Math.max(0,v.currentTime-1);return}
 if(e.key==="ArrowRight"&&e.shiftKey){e.preventDefault();e.stopImmediatePropagation();v.pause();v.currentTime=Math.min(v.duration||1e9,v.currentTime+1);return}
},true);

/* Clicking the video also toggles pause/play, familiar from video tools. */
document.addEventListener("click",e=>{
 if(!document.body.classList.contains("s267open"))return;
 const v=e.target.closest?.("#s18Video");if(!v)return;
 v.paused?v.play().catch(()=>{}):v.pause();
},true);

window.START11_BUILD="V26.8-RESIZABLE-VIDEO-SCRUBBER";
console.info("START11 loaded:",window.START11_BUILD);
})();




/* =========================================================
 START11 V26.9 – FREEZE FRAME FOR VIDEO DRAWINGS
 BASE: V26.8
 VIDEO ONLY.
 - Når der tegnes, pauses videoen.
 - Tegningen får et synligt tidsrum.
 - Videoen fryses automatisk i dette tidsrum ved afspilning.
========================================================= */
(function start11V269FreezeDrawings(){
"use strict";

const q=s=>document.querySelector(s);
const fmt=sec=>{
 sec=Math.max(0,Number(sec)||0);
 const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=Math.floor(sec%60);
 return h?`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`:`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
};
const state={freeze:null,holding:false,holdUntil:0,lastTime:0,defaultDuration:3};

function clip(){return typeof s18Clip==="function"?s18Clip():null}
function selectedAnnotation(){
 const c=clip();
 if(!c||!Array.isArray(c.annotations))return null;
 return c.annotations.find(a=>String(a.id)===String(s18?.selectedAnn));
}
function normalizeAnnotation(a){
 if(!a)return;
 const v=q("#s18Video");
 const now=Number(v?.currentTime)||0;
 if(a.startTime==null)a.startTime=now;
 if(a.endTime==null||Number(a.endTime)<Number(a.startTime))a.endTime=Number(a.startTime)+state.defaultDuration;
 if(a.freezeVideo==null)a.freezeVideo=true;
}
function save(){
 if(typeof s18Touch==="function")s18Touch();
}

function css(){
 if(q("#s269css"))return;
 const st=document.createElement("style");st.id="s269css";
 st.textContent=`
 #s269FreezeBar{display:none;align-items:center;gap:7px;padding:7px 10px;border-top:1px solid #19321e;background:#071009}
 body.s267open #s269FreezeBar.active{display:flex}
 #s269FreezeBar strong{font-size:6px;color:var(--s11-primary,#82ff54)}
 #s269FreezeBar span{font-size:6px;color:#8d9a90}
 #s269FreezeDuration{width:66px!important;height:29px!important;padding:0 5px!important;font-size:6px!important}
 #s269FreezeToggle{display:flex;align-items:center;gap:4px;font-size:6px;color:#a3afa6;white-space:nowrap}
 #s269FreezeBadge{position:absolute;top:14px;left:50%;transform:translateX(-50%);z-index:25;padding:6px 10px;border:1px solid #82ff54;border-radius:5px;background:#071009eF;color:#fff;font-size:7px;font-weight:900;display:none}
 #s269FreezeBadge.show{display:block}
 `;
 document.head.appendChild(st);
}
function ensureUI(){
 css();
 const controls=q("#s267ws .s267controls");
 if(!controls||q("#s269FreezeBar"))return;
 const bar=document.createElement("div");bar.id="s269FreezeBar";
 bar.innerHTML=`<strong>TEGNING / FREEZE</strong><span id="s269FreezeTimes">—</span>
 <label id="s269FreezeToggle"><input type="checkbox" id="s269FreezeEnabled" checked> FRYS VIDEO</label>
 <select id="s269FreezeDuration" class="s13sel" title="Hvor længe fryses billedet?">
 <option value="1">1 sek</option><option value="2">2 sek</option><option value="3" selected>3 sek</option><option value="4">4 sek</option><option value="5">5 sek</option><option value="7">7 sek</option><option value="10">10 sek</option>
 </select><button class="s13btn" id="s269SetVisible">SÆT SYNLIG FRA NU</button>`;
 controls.insertAdjacentElement("afterend",bar);

 const wrap=q("#s267VideoWrap");
 if(wrap&&!q("#s269FreezeBadge")){
   const badge=document.createElement("div");badge.id="s269FreezeBadge";badge.textContent="❚❚ FREEZE FRAME";wrap.appendChild(badge);
 }
 q("#s269FreezeDuration").onchange=e=>{
   state.defaultDuration=Number(e.target.value)||3;
   const a=selectedAnnotation();if(a){a.endTime=Number(a.startTime||0)+state.defaultDuration;save();syncUI()}
 };
 q("#s269FreezeEnabled").onchange=e=>{const a=selectedAnnotation();if(a){a.freezeVideo=e.target.checked;save();syncUI()}};
 q("#s269SetVisible").onclick=()=>{
   const a=selectedAnnotation(),v=q("#s18Video");if(!a||!v)return;
   a.startTime=Number(v.currentTime)||0;a.endTime=a.startTime+state.defaultDuration;a.freezeVideo=true;save();syncUI();
 };
}
function syncUI(){
 ensureUI();
 const a=selectedAnnotation(),bar=q("#s269FreezeBar");
 if(!bar)return;
 bar.classList.toggle("active",!!a);
 if(!a)return;
 normalizeAnnotation(a);
 q("#s269FreezeTimes").textContent=`${fmt(a.startTime)} → ${fmt(a.endTime)} · ${Math.max(0,a.endTime-a.startTime).toFixed(1)} sek`;
 q("#s269FreezeEnabled").checked=a.freezeVideo!==false;
 const d=Math.round(Math.max(1,a.endTime-a.startTime));
 if([...q("#s269FreezeDuration").options].some(o=>Number(o.value)===d))q("#s269FreezeDuration").value=String(d);
}

/* Detect creation/selection of drawings. Existing START11 annotation engine remains intact. */
const mo=new MutationObserver(()=>{if(document.body.classList.contains("s267open")){ensureUI();syncUI()}});
const begin=()=>{mo.observe(document.body,{childList:true,subtree:true});ensureUI()};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",begin,{once:true});else begin();

/* Any drawing-tool shortcut pauses first. This includes the existing
   annotation shortcuts used by the video canvas. */
document.addEventListener("keydown",e=>{
 if(!document.body.classList.contains("s267open"))return;
 if(["INPUT","TEXTAREA","SELECT"].includes(e.target?.tagName))return;
 if(["a","r","c","s","f","t"].includes(e.key.toLowerCase())){
   const v=q("#s18Video");if(v&&!v.paused)v.pause();
   setTimeout(()=>{
     const a=selectedAnnotation();
     if(a){
       const now=Number(v?.currentTime)||0;
       if(a.startTime==null)a.startTime=now;
       if(a.endTime==null||a.endTime<=a.startTime)a.endTime=a.startTime+state.defaultDuration;
       a.freezeVideo=true;save();syncUI();
     }
   },50);
 }
},true);

/* Clicking TEGN pauses immediately too. */
document.addEventListener("click",e=>{
 if(!document.body.classList.contains("s267open"))return;
 if(e.target.closest?.("#s267DrawBtn")){
   const v=q("#s18Video");if(v)v.pause();
 }
},true);

/* Freeze playback:
   When playback reaches a drawing's start time, hold that exact video frame
   for the drawing's visible duration, then continue after its end time.
   This does not modify the source video. */
function tick(){
 const v=q("#s18Video");
 if(!v||!document.body.classList.contains("s267open")){requestAnimationFrame(tick);return}
 const c=clip(),anns=Array.isArray(c?.annotations)?c.annotations:[];
 const now=Number(v.currentTime)||0;

 if(!state.holding && !v.paused){
   const hit=anns.find(a=>{
     normalizeAnnotation(a);
     return a.freezeVideo!==false &&
       state.lastTime < Number(a.startTime) &&
       now >= Number(a.startTime) &&
       Number(a.endTime)>Number(a.startTime);
   });
   if(hit){
     state.holding=true;
     state.freeze=hit;
     const freezeAt=Number(hit.startTime);
     const duration=Math.max(.2,Number(hit.endTime)-freezeAt);
     v.pause();
     try{v.currentTime=freezeAt}catch(_){}
     state.holdUntil=performance.now()+duration*1000;
     q("#s269FreezeBadge")?.classList.add("show");
     const resume=()=>{
       if(!state.holding||state.freeze!==hit)return;
       state.holding=false;state.freeze=null;
       q("#s269FreezeBadge")?.classList.remove("show");
       try{v.currentTime=Number(hit.endTime)}catch(_){}
       v.play().catch(()=>{});
     };
     setTimeout(resume,duration*1000);
   }
 }
 if(!state.holding)state.lastTime=now;
 requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

/* If user manually pauses/seeks during a freeze, cancel the automatic hold. */
document.addEventListener("pointerdown",e=>{
 if(!state.holding)return;
 if(e.target.closest?.("#s268Scrub,.s267controls,#s267Close")){
   state.holding=false;state.freeze=null;q("#s269FreezeBadge")?.classList.remove("show");
 }
},true);

window.START11_BUILD="V26.9-DRAWING-FREEZE-FRAME";
console.info("START11 loaded:",window.START11_BUILD);
})();




/* =========================================================
 START11 V27.0 – LIVE DRAW + EDITABLE TELESRATION + REAL FREEZE
 BASE: V26.9
 VIDEO ONLY
========================================================= */
(function start11V270Telestration(){
"use strict";
const q=s=>document.querySelector(s);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const globalFreeze=()=>localStorage.getItem("start11.video.freezeDrawings")!=="0";
let freezeRun={busy:false,lastId:null,lastAt:-999};

function annCenter(a){
 if(a.type==="text")return a.point;
 if(a.type==="free"){
   const p=a.points||[];if(!p.length)return{x:.5,y:.5};
   return{x:p.reduce((s,x)=>s+x.x,0)/p.length,y:p.reduce((s,x)=>s+x.y,0)/p.length};
 }
 if(a.start&&a.end)return{x:(a.start.x+a.end.x)/2,y:(a.start.y+a.end.y)/2};
 return{x:.5,y:.5};
}
function endpoints(a){
 if(a.type==="text")return[{part:"point",p:a.point}];
 if(a.type==="free")return[];
 if(a.start&&a.end)return[{part:"start",p:a.start},{part:"end",p:a.end}];
 return[];
}
window.s270HitAnnotation=function(pt,c,cv){
 const anns=[...(c.annotations||[])].reverse();
 const threshold=18/Math.max(1,Math.min(cv.clientWidth,cv.clientHeight));
 for(const a of anns){
   for(const h of endpoints(a))if(h.p&&dist(pt,h.p)<threshold)return{ann:a,part:h.part};
   const center=annCenter(a);
   if(dist(pt,center)<threshold*1.6)return{ann:a,part:"move"};
   if(a.type==="free"){
     for(const p of (a.points||[]))if(dist(pt,p)<threshold)return{ann:a,part:"move"};
   }
   if(a.start&&a.end){
     const A=a.start,B=a.end,dx=B.x-A.x,dy=B.y-A.y,l2=dx*dx+dy*dy||1;
     const t=clamp(((pt.x-A.x)*dx+(pt.y-A.y)*dy)/l2,0,1);
     const near={x:A.x+t*dx,y:A.y+t*dy};
     if(dist(pt,near)<threshold)return{ann:a,part:"move"};
   }
 }
 return null;
};
window.s270EditAnnotation=function(edit,pt){
 const a=edit.ann,o=edit.original;
 if(edit.part==="start"&&a.start){a.start={x:pt.x,y:pt.y};return}
 if(edit.part==="end"&&a.end){a.end={x:pt.x,y:pt.y};return}
 if(edit.part==="point"&&a.point){a.point={x:pt.x,y:pt.y};return}
 const dx=pt.x-edit.start.x,dy=pt.y-edit.start.y;
 if(o.start)a.start={x:clamp(o.start.x+dx,0,1),y:clamp(o.start.y+dy,0,1)};
 if(o.end)a.end={x:clamp(o.end.x+dx,0,1),y:clamp(o.end.y+dy,0,1)};
 if(o.point)a.point={x:clamp(o.point.x+dx,0,1),y:clamp(o.point.y+dy,0,1)};
 if(o.points)a.points=o.points.map(p=>({x:clamp(p.x+dx,0,1),y:clamp(p.y+dy,0,1)}));
};
window.s270DrawEditHandles=function(ctx,cv,c){
 const a=(c.annotations||[]).find(x=>String(x.id)===String(s18.selectedAnn));
 if(!a||s18.tool!=="select")return;
 const W=cv.width,H=cv.height;
 ctx.save();ctx.fillStyle="#82ff54";ctx.strokeStyle="#061008";ctx.lineWidth=Math.max(2,devicePixelRatio||1);
 const draw=p=>{if(!p)return;ctx.beginPath();ctx.arc(p.x*W,p.y*H,7*(devicePixelRatio||1),0,Math.PI*2);ctx.fill();ctx.stroke()};
 endpoints(a).forEach(x=>draw(x.p));draw(annCenter(a));ctx.restore();
};

function install(){
 if(q("#s270css"))return;
 const st=document.createElement("style");st.id="s270css";st.textContent=`
 #s267VideoWrap #s18Canvas{pointer-events:auto!important;cursor:crosshair!important}
 #s267VideoWrap.s270select #s18Canvas{cursor:move!important}
 #s270FreezeGlobal{display:flex;align-items:center;gap:5px;margin-left:4px;padding:0 8px;height:30px;border:1px solid #285330;border-radius:5px;background:#071009;color:#b8c4ba;font-size:6px;font-weight:900;white-space:nowrap}
 #s270FreezeGlobal input{accent-color:var(--s11-primary,#82ff54)}
 #s270FreezeNow{position:absolute;left:50%;top:14px;transform:translateX(-50%);z-index:40;display:none;padding:7px 11px;border:1px solid var(--s11-primary,#82ff54);border-radius:6px;background:#061008ed;color:#fff;font-size:7px;font-weight:950}
 #s270FreezeNow.show{display:block}
 `;
 document.head.appendChild(st);
}
function enhance(){
 install();
 const controls=q("#s267ws .s267controls");
 if(controls&&!q("#s270FreezeGlobal")){
   const lab=document.createElement("label");lab.id="s270FreezeGlobal";
   lab.innerHTML=`<input type="checkbox" ${globalFreeze()?"checked":""}> FRYS VED TEGNINGER`;
   controls.appendChild(lab);
   lab.querySelector("input").onchange=e=>localStorage.setItem("start11.video.freezeDrawings",e.target.checked?"1":"0");
 }
 const wrap=q("#s267VideoWrap");
 if(wrap&&!q("#s270FreezeNow")){
   const b=document.createElement("div");b.id="s270FreezeNow";b.textContent="❚❚ FREEZE · TEGNING";wrap.appendChild(b);
 }
 wrap?.classList.toggle("s270select",s18?.tool==="select");
}
new MutationObserver(enhance).observe(document.body,{childList:true,subtree:true});
enhance();

/* Make selecting the SELECT tool immediately editable. */
document.addEventListener("click",e=>{
 const b=e.target.closest?.("[data-tool]");
 if(b)setTimeout(()=>{q("#s267VideoWrap")?.classList.toggle("s270select",b.dataset.tool==="select")},0);
},true);

/* Real freeze-frame playback.
   The video pauses on the annotation's first frame for the annotation duration,
   then resumes just after that same frame. No source footage is skipped. */
function monitor(){
 const v=q("#s18Video"),c=typeof s18Clip==="function"?s18Clip():null;
 if(v&&c&&!v.paused&&!freezeRun.busy&&globalFreeze()){
   const t=v.currentTime;
   const hit=(c.annotations||[]).find(a=>{
     if(a.freezeVideo===false)return false;
     const s=Number(a.startTime||0),dur=Math.max(.25,Number(a.endTime??s+3)-s);
     return t>=s&&t<s+.18 && !(freezeRun.lastId===a.id&&Math.abs(freezeRun.lastAt-s)<.5) && dur>0;
   });
   if(hit){
     const s=Number(hit.startTime||0),duration=Math.max(.25,Number(hit.endTime??s+3)-s);
     freezeRun.busy=true;freezeRun.lastId=hit.id;freezeRun.lastAt=s;
     v.pause();v.currentTime=s;
     q("#s270FreezeNow")?.classList.add("show");
     if(typeof s18Draw==="function")s18Draw();
     setTimeout(()=>{
       q("#s270FreezeNow")?.classList.remove("show");
       freezeRun.busy=false;
       v.currentTime=Math.min(v.duration||1e9,s+.04);
       v.play().catch(()=>{});
     },duration*1000);
   }
 }
 requestAnimationFrame(monitor);
}
requestAnimationFrame(monitor);

/* Cancel an automatic freeze if the user seeks or presses controls. */
document.addEventListener("pointerdown",e=>{
 if(!freezeRun.busy)return;
 if(e.target.closest?.("#s268Scrub,.s267controls,#s267Close")){
   freezeRun.busy=false;q("#s270FreezeNow")?.classList.remove("show");
 }
},true);

window.START11_BUILD="V27.0-LIVE-DRAW-EDIT-REAL-FREEZE";
console.info("START11 loaded:",window.START11_BUILD);
})();



/* =========================================================
   START11 – V27.1 PDF PLAYER FOCUS BULLETS
   - Spillerspecifik MED BOLD / UDEN BOLD vises i punktform
   - Eksisterende linjeskift/bullets understøttes
   - Gentagne "Vi vil / Vi skal / Jeg vil ..." opdeles automatisk
========================================================= */
window.START11_BUILD = "V27.1-PDF-PLAYER-FOCUS-BULLETS";
console.info("START11 loaded:", window.START11_BUILD);

