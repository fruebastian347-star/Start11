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


/* =========================================================
   START11 V58 – VIDEO LIBRARY PRO
   - Existing videoProjects/clips remain the source of truth
   - Clip folders + nested folders
   - Live still previews from the source video
   - Native video controls in the detail player
   - Rich detail panel matching the modern Video mockup
========================================================= */
(function start11V58VideoLibrary(){
"use strict";
if(window.__START11_V58_VIDEO_LIBRARY__)return;
window.__START11_V58_VIDEO_LIBRARY__=true;

const $=id=>document.getElementById(id);
const esc=v=>typeof s13Esc==="function"?s13Esc(String(v??"")):String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const fmt=sec=>{sec=Math.max(0,Number(sec)||0);const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=Math.floor(sec%60);return h?`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`:`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`};
const date=v=>{if(!v)return"Ingen dato";try{return new Intl.DateTimeFormat("da-DK",{day:"numeric",month:"long",year:"numeric"}).format(new Date(v+"T12:00:00"))}catch(_){return v}};
const uid=p=>typeof s13Id==="function"?s13Id(p):`${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;
const state={mode:"library",query:"",project:"",phase:"",folder:"all",selected:"",objectUrls:[],detailTab:"description"};

function ensureData(){
  try{s18EnsureData?.()}catch(_){}
  if(!s13Data||typeof s13Data!=="object")return;
  if(!Array.isArray(s13Data.videoProjects))s13Data.videoProjects=[];
  if(!Array.isArray(s13Data.videoFolders))s13Data.videoFolders=[];
  s13Data.videoProjects.forEach(p=>(p.clips||[]).forEach(c=>{if(typeof c.folderId!=="string")c.folderId="";if(typeof c.favorite!=="boolean")c.favorite=false}));
}
function save(){try{if(typeof s13Save==="function")s13Save();else if(typeof scheduleCloudSave==="function")scheduleCloudSave()}catch(e){console.warn("START11 V58 save",e)}}
function projects(){ensureData();return Array.isArray(s13Data?.videoProjects)?s13Data.videoProjects:[]}
function folders(){ensureData();return Array.isArray(s13Data?.videoFolders)?s13Data.videoFolders:[]}
function clips(){return projects().flatMap(p=>(Array.isArray(p.clips)?p.clips:[]).map(c=>({project:p,clip:c,key:`${p.id}::${c.id}`})))}
function folderById(id){return folders().find(f=>String(f.id)===String(id))}
function folderChildren(id=""){return folders().filter(f=>String(f.parentId||"")===String(id||""))}
function folderPath(id){const names=[];let cur=folderById(id),guard=0;while(cur&&guard++<20){names.unshift(cur.name);cur=folderById(cur.parentId)}return names.join(" / ")}
function folderContains(folderId,clipFolderId){if(String(folderId)===String(clipFolderId))return true;let cur=folderById(clipFolderId),guard=0;while(cur&&guard++<20){if(String(cur.parentId)===String(folderId))return true;cur=folderById(cur.parentId)}return false}
function selected(){const all=clips();return all.find(x=>x.key===state.selected)||filtered()[0]||null}
function filtered(){
 const q=state.query.trim().toLowerCase();
 return clips().filter(x=>
   (!state.project||String(x.project.id)===state.project)&&
   (!state.phase||String(x.clip.phase||"")===state.phase)&&
   (state.folder==="all"||folderContains(state.folder,x.clip.folderId||""))&&
   (!q||`${x.clip.title||""} ${x.clip.tags||""} ${x.clip.observation||""} ${x.clip.phase||""} ${x.project.title||""} ${x.project.opponent||""}`.toLowerCase().includes(q))
 );
}
function cleanup(){state.objectUrls.forEach(u=>{try{URL.revokeObjectURL(u)}catch(_){}});state.objectUrls=[]}

async function sourceFor(p){
 const mv=p?.matchVideo;if(!mv)return"";
 if(mv.sourceType==="local"&&mv.mediaId&&typeof s15GetBlob==="function"){
   const x=await s15GetBlob(mv.mediaId);if(x?.blob){const u=URL.createObjectURL(x.blob);state.objectUrls.push(u);return u}return""
 }
 if(mv.sourceType==="veo"){
   if(mv.directUrl)return mv.directUrl;
   if(typeof s18ResolveVeo==="function"){try{const r=await s18ResolveVeo(mv.url);return r?.url||""}catch(e){console.warn("START11 V58 Veo preview",e);return""}}
 }
 return mv.url||""
}

function styles(){if($("s58VideoStyles"))return;const st=document.createElement("style");st.id="s58VideoStyles";st.textContent=`
#s57VideoView{padding:18px 20px 40px;min-width:0;color:#f4fff5}.s58-shell{display:grid;grid-template-columns:205px minmax(0,1fr);gap:18px}.s58-left{min-width:0;border-right:1px solid rgba(255,255,255,.06);padding-right:14px}.s58-upload{width:100%;height:42px;border:0;border-radius:6px;background:var(--s11-primary,#6df052);color:#061008;font:inherit;font-size:8px;font-weight:950;cursor:pointer}.s58-side-title{margin:18px 5px 7px;color:#6df052;font-size:7px;font-weight:950;letter-spacing:1px}.s58-nav{display:grid;gap:2px}.s58-nav button,.s58-folder-row{width:100%;height:31px;display:flex;align-items:center;gap:8px;padding:0 8px;border:0;border-radius:5px;background:transparent;color:#98a69c;font:inherit;font-size:7.5px;text-align:left;cursor:pointer}.s58-nav button b,.s58-folder-row b{margin-left:auto;color:#708078;font-size:6.5px}.s58-nav button:hover,.s58-nav button.active,.s58-folder-row:hover,.s58-folder-row.active{background:rgba(109,240,82,.09);color:#78ef60}.s58-folder-head{display:flex;align-items:center;justify-content:space-between}.s58-folder-head button{width:25px;height:25px;border:1px solid rgba(109,240,82,.25);border-radius:5px;background:#071009;color:#6df052;cursor:pointer}.s58-folder-row{position:relative;padding-left:calc(8px + var(--depth,0)*12px)}.s58-folder-menu{margin-left:auto!important;width:18px!important;height:20px!important;padding:0!important;justify-content:center!important;color:#65736a!important}.s58-main{min-width:0}.s57-head{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;padding:3px 0 14px;border-bottom:1px solid rgba(255,255,255,.07)}.s57-kicker{color:#6df052;font-size:7px;font-weight:950;letter-spacing:1.2px}.s57-head h1{margin:4px 0 0;font-size:27px;line-height:1}.s57-head p{margin:5px 0 0;color:#7f8c83;font-size:8px}.s57-tabs{display:flex;gap:6px}.s57-tab,.s57-btn{height:34px;padding:0 12px;border:1px solid rgba(255,255,255,.1);border-radius:6px;background:#071009;color:#aab6ad;font:inherit;font-size:7px;font-weight:950;cursor:pointer}.s57-tab.active,.s57-btn.primary{border-color:#6df052;background:#6df052;color:#061008}.s57-tools{display:grid;grid-template-columns:minmax(220px,1fr) 175px 155px;gap:8px;margin:14px 0}.s57-input,.s57-select{width:100%;height:36px;box-sizing:border-box;border:1px solid rgba(255,255,255,.09);border-radius:6px;background:#061009;color:#edf8ee;padding:0 10px;font:inherit;font-size:8px;outline:none}.s57-layout{display:grid;grid-template-columns:minmax(0,1fr) 385px;gap:12px;align-items:start}.s57-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.s57-card{min-width:0;border:1px solid rgba(255,255,255,.075);border-radius:8px;background:#061009;overflow:hidden;cursor:pointer;transition:.14s}.s57-card:hover,.s57-card.active{border-color:rgba(109,240,82,.62);transform:translateY(-1px)}.s57-thumb{position:relative;aspect-ratio:16/9;display:grid;place-items:center;background:linear-gradient(145deg,#102817,#07130a);overflow:hidden}.s57-thumb video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}.s57-thumb:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 55%,rgba(0,0,0,.28))}.s57-play{position:relative;z-index:3;width:35px;height:35px;display:grid;place-items:center;border-radius:50%;background:#061008b8;color:white;font-size:13px}.s57-time{position:absolute;right:6px;bottom:6px;z-index:4;padding:3px 5px;border-radius:3px;background:#000d;color:#fff;font-size:6px;font-weight:900}.s57-cardbody{padding:9px}.s57-cardbody strong{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:9px}.s57-meta{display:flex;gap:5px;align-items:center;margin-top:5px;color:#718078;font-size:6.5px}.s57-chip{display:inline-flex;padding:3px 6px;border-radius:999px;background:rgba(109,240,82,.09);color:#8df477;font-size:5.8px;font-weight:900}.s57-tags{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#718078;font-size:6px;margin-top:5px}.s57-side{position:sticky;top:74px;border:1px solid rgba(255,255,255,.085);border-radius:8px;background:#061009;overflow:hidden}.s57-preview{aspect-ratio:16/9;background:#000;position:relative}.s57-preview video{width:100%;height:100%;display:block;object-fit:contain;background:#000}.s581-player{position:relative;width:100%;height:100%;background:#000}.s581-player>video{width:100%;height:100%;display:block;object-fit:contain}.s581-player>canvas{position:absolute;inset:0;width:100%;height:100%;z-index:3;pointer-events:none}.s581-controls{z-index:6!important}.s581-controls{position:absolute;left:0;right:0;bottom:0;z-index:5;display:grid;grid-template-columns:auto auto minmax(80px,1fr) auto auto auto;align-items:center;gap:7px;padding:22px 9px 8px;background:linear-gradient(transparent,rgba(0,0,0,.88));opacity:0;transition:.15s}.s581-player:hover .s581-controls,.s581-player:focus-within .s581-controls,.s581-player.paused .s581-controls{opacity:1}.s581-controls button{width:27px;height:25px;border:0;background:transparent;color:#fff;cursor:pointer;font-size:11px}.s581-controls input[type=range]{width:100%;accent-color:#fff}.s581-clock{font-size:7px;font-weight:800;color:#fff;white-space:nowrap;font-variant-numeric:tabular-nums}.s581-vol{max-width:65px}.s581-player video::-webkit-media-controls{display:none!important}.s57-emptyvideo{height:100%;display:grid;place-items:center;padding:25px;text-align:center;color:#758178;font-size:8px}.s58-detail-head{display:flex;justify-content:space-between;gap:8px;padding:11px 12px 8px}.s58-detail-head h2{margin:3px 0 3px;font-size:16px}.s58-detail-head p{margin:0;color:#79877e;font-size:6.5px}.s58-detail-actions{display:flex;gap:5px}.s58-iconbtn{width:29px;height:29px;border:1px solid rgba(255,255,255,.08);border-radius:5px;background:#071009;color:#dfe8e1;cursor:pointer}.s58-iconbtn.favorite{color:#ffd72e}.s58-tags{padding:0 12px 9px;display:flex;gap:5px;flex-wrap:wrap}.s58-tabs{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid rgba(255,255,255,.06);border-bottom:1px solid rgba(255,255,255,.06)}.s58-tabs button{height:34px;border:0;border-bottom:2px solid transparent;background:transparent;color:#839087;font:inherit;font-size:6.5px;cursor:pointer}.s58-tabs button.active{color:#fff;border-bottom-color:#6df052}.s58-tabbody{min-height:90px;padding:12px;font-size:7.5px;line-height:1.55;color:#a7b2aa}.s58-tabbody strong{display:block;margin-bottom:5px;color:#6df052;font-size:7px}.s58-info{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:0 12px 12px}.s58-info div{padding:8px;border:1px solid rgba(255,255,255,.065);border-radius:5px}.s58-info span{display:block;color:#68766d;font-size:5.7px;font-weight:900}.s58-info b{display:block;margin-top:3px;color:#e6eee8;font-size:6.8px}.s58-actions{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:0 12px 12px}.s58-actions button{height:34px}.s58-actions .danger{color:#e86f68;border-color:rgba(232,90,80,.25)}.s57-count{color:#6f7d74;font-size:7px;margin:0 0 8px}.s57-empty{grid-column:1/-1;padding:60px 20px;border:1px dashed rgba(255,255,255,.1);border-radius:8px;text-align:center;color:#78857c}.s57-empty b{display:block;color:#fff;font-size:14px;margin-bottom:5px}.s57-analyser{min-height:720px}.s57-analyser .s18-layout{grid-template-columns:230px minmax(0,1fr) 310px}.s58-folder-modal{position:fixed;inset:0;z-index:2147483600;display:grid;place-items:center;background:#000b;backdrop-filter:blur(6px)}.s58-folder-box{width:min(390px,92vw);padding:18px;border:1px solid rgba(109,240,82,.24);border-radius:9px;background:#071009}.s58-folder-box h3{margin:0 0 12px}.s58-folder-box label{display:grid;gap:5px;margin:8px 0;color:#829087;font-size:7px}.s58-folder-box input,.s58-folder-box select{height:36px;border:1px solid rgba(255,255,255,.1);border-radius:5px;background:#020805;color:#fff;padding:0 9px}.s58-folder-box footer{display:flex;justify-content:flex-end;gap:6px;margin-top:13px}
@media(max-width:1250px){.s57-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.s57-layout{grid-template-columns:minmax(0,1fr) 330px}.s58-shell{grid-template-columns:185px minmax(0,1fr)}}
@media(max-width:900px){.s58-shell{grid-template-columns:1fr}.s58-left{border-right:0;padding-right:0}.s57-layout{grid-template-columns:1fr}.s57-side{position:static}.s57-grid{grid-template-columns:1fr}.s57-tools{grid-template-columns:1fr}.s57-analyser .s18-layout{grid-template-columns:1fr}}
`;document.head.appendChild(st)}

function ensureView(){styles();let view=$("s57VideoView");if(view)return view;const home=$("s34HomeView");const parent=home?.parentElement||$("s34App");if(!parent)return null;view=document.createElement("main");view.id="s57VideoView";view.className="s34-view s57-video-view";view.hidden=true;parent.appendChild(view);return view}
function showOnly(){const view=ensureView();if(!view)return;["s34HomeView","s34LineupView","s34PlayersView","s45ExerciseBankView","s57VideoView"].forEach(id=>{const el=$(id);if(el)el.hidden=id!=="s57VideoView"});$("s34App")?.removeAttribute("hidden");document.body.classList.add("s34-active","s39-modern-only");document.querySelectorAll("[data-s34]").forEach(b=>b.classList.toggle("active",b.dataset.s34==="video"));render();window.scrollTo({top:0,behavior:"smooth"})}
function header(){return `<div class="s57-head"><div><div class="s57-kicker">VIDEO</div><h1>Videobibliotek</h1><p>Dine klip fra kampanalyser samlet, organiseret og klar til læring.</p></div><div class="s57-tabs"><button class="s57-tab ${state.mode==="library"?"active":""}" data-s57-mode="library">VIDEOBIBLIOTEK</button><button class="s57-tab ${state.mode==="analysis"?"active":""}" data-s57-mode="analysis">KAMPANALYSE</button></div></div>`}

function folderTree(parent="",depth=0){
 return folderChildren(parent).map(f=>{
   const count=clips().filter(x=>folderContains(f.id,x.clip.folderId||"")).length;
   return `<div><div class="s58-folder-row ${state.folder===String(f.id)?"active":""}" style="--depth:${depth}" data-folder="${esc(f.id)}"><span>▱</span><span>${esc(f.name)}</span><b>${count}</b><button class="s58-folder-menu" data-folder-menu="${esc(f.id)}" title="Mappeindstillinger">•••</button></div>${folderTree(f.id,depth+1)}</div>`
 }).join("")
}
function sidebar(){
 const all=clips(),fav=all.filter(x=>x.clip.favorite).length;
 return `<aside class="s58-left">
   <button class="s58-upload" id="s58NewAnalysis">＋ KAMPANALYSE</button>
   <div class="s58-side-title">VIDEOER</div>
   <nav class="s58-nav">
     <button class="${state.folder==="all"?"active":""}" data-folder="all"><span>▣</span> Alle klip <b>${all.length}</b></button>
     <button data-s58-special="favorites"><span>☆</span> Favoritter <b>${fav}</b></button>
   </nav>
   <div class="s58-folder-head"><div class="s58-side-title">MAPPER</div><button id="s58AddFolder" title="Ny mappe">＋</button></div>
   <div id="s58Folders">${folderTree()}</div>
   <div class="s58-side-title">SPILFASE</div>
   <nav class="s58-nav">
    ${["Med bold","Uden bold","Offensiv omstilling","Defensiv omstilling","Standard"].map(ph=>`<button data-phase="${esc(ph)}"><span>◉</span>${esc(ph)}<b>${all.filter(x=>x.clip.phase===ph).length}</b></button>`).join("")}
   </nav>
 </aside>`
}
function libraryHtml(){const ps=projects(),all=filtered();return `<div class="s58-shell">${sidebar()}<section class="s58-main">${header()}<div class="s57-tools"><input id="s57Search" class="s57-input" placeholder="Søg i videoer, kampe, tags eller noter…" value="${esc(state.query)}"><select id="s57Project" class="s57-select"><option value="">Alle kampe</option>${ps.map(p=>`<option value="${esc(p.id)}" ${state.project===String(p.id)?"selected":""}>${esc(p.title||p.opponent||"Kampanalyse")}</option>`).join("")}</select><select id="s57Phase" class="s57-select"><option value="">Alle spilfaser</option>${["Med bold","Uden bold","Offensiv omstilling","Defensiv omstilling","Standard"].map(x=>`<option ${state.phase===x?"selected":""}>${x}</option>`).join("")}</select></div><div class="s57-count">${all.length} klip · ${ps.length} kampanalyser${state.folder!=="all"?` · ${esc(folderPath(state.folder))}`:""}</div><div class="s57-layout"><section id="s57Grid" class="s57-grid">${cards(all)}</section><aside id="s57Side" class="s57-side"></aside></div></section></div>`}

function cards(rows){if(!rows.length)return `<div class="s57-empty"><b>Ingen klip her endnu</b>Lav et klip i Kampanalyse eller flyt et eksisterende klip til denne mappe.</div>`;return rows.map(x=>{const c=x.clip,p=x.project,dur=Math.max(0,Number(c.endSec||0)-Number(c.startSec||0));return `<article class="s57-card ${state.selected===x.key?"active":""}" data-s57-clip="${esc(x.key)}"><div class="s57-thumb" data-s58-thumb="${esc(x.key)}"><span class="s57-play">▶</span><span class="s57-time">${fmt(dur)}</span></div><div class="s57-cardbody"><strong>${esc(c.title||"Klip")}</strong><div class="s57-meta"><span>${esc(p.title||p.opponent||"Kamp")}</span><span>·</span><span>${esc(date(p.date))}</span></div><div style="margin-top:6px"><span class="s57-chip">${esc(c.phase||"Video")}</span></div>${c.tags?`<div class="s57-tags">${esc(c.tags)}</div>`:""}</div></article>`}).join("")}

async function hydrateThumbs(){
 const rows=filtered(),cache=new Map();
 for(const x of rows){
   const host=document.querySelector(`[data-s58-thumb="${CSS.escape(x.key)}"]`);if(!host)continue;
   let src=cache.get(x.project.id);
   if(src===undefined){src=await sourceFor(x.project);cache.set(x.project.id,src||"")}
   if(!src||!document.body.contains(host))continue;
   const v=document.createElement("video");v.muted=true;v.playsInline=true;v.preload="metadata";v.src=src;
   v.addEventListener("loadedmetadata",()=>{try{v.currentTime=Math.min(Math.max(0,Number(x.clip.startSec||0)+.25),Math.max(0,(v.duration||1)-.1))}catch(_){}},{once:true});
   host.prepend(v);
 }
}
function s581PrepareAnalysis(preferred=null){
 const x=preferred||selected();
 let p=x?.project||null,c=x?.clip||null;
 if(!p){
   const ps=projects();
   p=ps.find(z=>String(z.id)===String(s18?.projectId||""))||ps.find(z=>(z.clips||[]).length)||ps[0]||null;
   c=p?.clips?.[0]||null;
 }
 if(p&&typeof s18!=="undefined"){
   s18.projectId=p.id;
   s18.clipId=c?.id||p.clips?.[0]?.id||null;
   if(s18.clipId){
     const cc=(p.clips||[]).find(z=>String(z.id)===String(s18.clipId));
     if(cc){s18.inSec=Number(cc.startSec)||0;s18.outSec=Number(cc.endSec)||0}
   }
 }
 return {project:p,clip:c};
}
function render(){const view=ensureView();if(!view)return;cleanup();if(state.mode==="analysis"){s581PrepareAnalysis();view.innerHTML=`<div class="s58-main">${header()}<div id="s57AnalysisHost" class="s57-analyser" style="margin-top:14px"></div></div>`;view.querySelectorAll("[data-s57-mode]").forEach(b=>b.onclick=()=>{state.mode=b.dataset.s57Mode;if(state.mode==="analysis")s581PrepareAnalysis();render()});const host=$("s57AnalysisHost");if(typeof s18Render==="function"){s18Render(host);setTimeout(()=>{try{s18RenderPanels?.();const cc=typeof s18Clip==="function"?s18Clip():null;if(cc)s18Seek?.(cc)}catch(_){}},0)}else host.innerHTML=`<div class="s57-empty"><b>Kampanalyse kunne ikke indlæses</b></div>`;return}
 view.innerHTML=libraryHtml();bindLibrary();renderPreview();hydrateThumbs()
}
function bindLibrary(){
 viewModeBindings();
 $("s57Search")?.addEventListener("input",e=>{state.query=e.target.value;render()});
 $("s57Project")?.addEventListener("change",e=>{state.project=e.target.value;state.selected="";render()});
 $("s57Phase")?.addEventListener("change",e=>{state.phase=e.target.value;state.selected="";render()});
 $("s58NewAnalysis")?.addEventListener("click",()=>{state.mode="analysis";render();setTimeout(()=>$("s18NewProject")?.click(),0)});
 $("s58AddFolder")?.addEventListener("click",()=>folderDialog());
 document.querySelectorAll("[data-folder]").forEach(el=>el.addEventListener("click",e=>{if(e.target.closest("[data-folder-menu]"))return;state.folder=el.dataset.folder;render()}));
 document.querySelectorAll("[data-folder-menu]").forEach(b=>b.onclick=e=>{e.stopPropagation();folderActions(b.dataset.folderMenu)});
 document.querySelectorAll("[data-phase]").forEach(b=>b.onclick=()=>{state.phase=state.phase===b.dataset.phase?"":b.dataset.phase;render()});
 document.querySelectorAll("[data-s57-clip]").forEach(card=>card.onclick=()=>{state.selected=card.dataset.s57Clip;document.querySelectorAll("[data-s57-clip]").forEach(x=>x.classList.toggle("active",x.dataset.s57Clip===state.selected));renderPreview()})
}
function viewModeBindings(){document.querySelectorAll("[data-s57-mode]").forEach(b=>b.onclick=()=>{state.mode=b.dataset.s57Mode;if(state.mode==="analysis")s581PrepareAnalysis();render()})}

function folderDialog(editId="",parentPreset=""){
 const f=folderById(editId);const modal=document.createElement("div");modal.className="s58-folder-modal";
 modal.innerHTML=`<div class="s58-folder-box"><h3>${f?"Rediger mappe":"Ny mappe"}</h3><label>NAVN<input id="s58FolderName" value="${esc(f?.name||"")}"></label><label>PLACERING<select id="s58FolderParent"><option value="">Ingen overmappe</option>${folders().filter(x=>String(x.id)!==String(editId)).map(x=>`<option value="${esc(x.id)}" ${String(f?.parentId||parentPreset)===String(x.id)?"selected":""}>${esc(folderPath(x.id))}</option>`).join("")}</select></label><footer><button class="s57-btn" id="s58FolderCancel">Annuller</button><button class="s57-btn primary" id="s58FolderSave">Gem</button></footer></div>`;
 document.body.appendChild(modal);$("s58FolderCancel").onclick=()=>modal.remove();$("s58FolderSave").onclick=()=>{const name=$("s58FolderName").value.trim();if(!name)return;if(f){f.name=name;f.parentId=$("s58FolderParent").value}else folders().push({id:uid("vfolder"),name,parentId:$("s58FolderParent").value});save();modal.remove();render()}
}
function folderActions(id){
 const f=folderById(id);if(!f)return;
 const action=prompt(`Mappe: ${f.name}\n\nSkriv:\n1 = Omdøb/flyt\n2 = Ny undermappe\n3 = Slet mappe`,"1");
 if(action==="1")folderDialog(id);
 if(action==="2")folderDialog("",id);
 if(action==="3"){if(!confirm(`Slet mappen "${f.name}"? Klippene slettes ikke.`))return;const ids=new Set([id]);let changed=true;while(changed){changed=false;folders().forEach(x=>{if(ids.has(x.parentId)&&!ids.has(x.id)){ids.add(x.id);changed=true}})}clips().forEach(x=>{if(ids.has(x.clip.folderId))x.clip.folderId=""});s13Data.videoFolders=folders().filter(x=>!ids.has(x.id));if(ids.has(state.folder))state.folder="all";save();render()}
}
function moveClipDialog(x){
 const modal=document.createElement("div");modal.className="s58-folder-modal";
 modal.innerHTML=`<div class="s58-folder-box"><h3>Flyt klip</h3><label>MAPPE<select id="s58MoveSelect"><option value="">Ingen mappe</option>${folders().map(f=>`<option value="${esc(f.id)}" ${String(x.clip.folderId||"")===String(f.id)?"selected":""}>${esc(folderPath(f.id))}</option>`).join("")}</select></label><footer><button class="s57-btn" id="s58MoveCancel">Annuller</button><button class="s57-btn primary" id="s58MoveSave">Flyt</button></footer></div>`;
 document.body.appendChild(modal);$("s58MoveCancel").onclick=()=>modal.remove();$("s58MoveSave").onclick=()=>{x.clip.folderId=$("s58MoveSelect").value;save();modal.remove();render()}
}

function tabContent(c){
 if(state.detailTab==="notes")return `<strong>NOTER</strong>${esc(c.coachingQuestion||c.action||"Ingen noter tilføjet endnu.")}`;
 if(state.detailTab==="time")return `<strong>TIDSKODER</strong>IN ${fmt(c.startSec)}<br>OUT ${fmt(c.endSec)}<br>Varighed ${fmt(Math.max(0,Number(c.endSec||0)-Number(c.startSec||0)))}`;
 if(state.detailTab==="analysis")return `<strong>ANALYSE</strong>Spilfase: ${esc(c.phase||"—")}<br>Resultat: ${esc(c.outcome||"—")}<br>${c.playerId?`Spiller-ID: ${esc(c.playerId)}`:"Ingen spiller koblet til klippet."}`;
 return `<strong>BESKRIVELSE</strong>${esc(c.observation||"Ingen beskrivelse tilføjet endnu.")}`;
}
async function renderPreview(){
 const host=$("s57Side");if(!host)return;const x=selected();if(!x){host.innerHTML=`<div class="s57-emptyvideo" style="min-height:300px">Vælg et klip for at se det her.</div>`;return}
 state.selected=x.key;const c=x.clip,p=x.project,dur=Math.max(0,Number(c.endSec||0)-Number(c.startSec||0));
 host.innerHTML=`<div id="s57Preview" class="s57-preview"><div class="s57-emptyvideo">Indlæser video…</div></div>
 <div class="s58-detail-head"><div><div class="s57-kicker">${esc(c.phase||"VIDEO")}</div><h2>${esc(c.title||"Klip")}</h2><p>${esc(date(p.date))} · ${esc(p.title||p.opponent||"Kampanalyse")}</p></div><div class="s58-detail-actions"><button id="s58Favorite" class="s58-iconbtn ${c.favorite?"favorite":""}" title="Favorit">${c.favorite?"★":"☆"}</button><button id="s58Move" class="s58-iconbtn" title="Flyt til mappe">•••</button></div></div>
 <div class="s58-tags"><span class="s57-chip">${esc(c.phase||"Video")}</span>${String(c.tags||"").split(/[,;]+/).map(t=>t.trim()).filter(Boolean).map(t=>`<span class="s57-chip">${esc(t)}</span>`).join("")}</div>
 <div class="s58-tabs">${[["description","Beskrivelse"],["notes","Noter"],["time","Tidskoder"],["analysis","Analyse"]].map(([id,label])=>`<button data-s58-tab="${id}" class="${state.detailTab===id?"active":""}">${label}</button>`).join("")}</div>
 <div class="s58-tabbody">${tabContent(c)}</div>
 <div class="s58-info"><div><span>VARIGHED</span><b>${fmt(dur)}</b></div><div><span>TYPE</span><b>${esc(c.phase||"Video")}</b></div><div><span>DATO</span><b>${esc(date(p.date))}</b></div><div><span>MAPPE</span><b>${esc(folderPath(c.folderId)||"Ingen mappe")}</b></div></div>
 <div class="s58-actions"><button id="s57OpenAnalysis" class="s57-btn primary">✎ REDIGER / ANALYSE</button><button id="s58MoveBottom" class="s57-btn">▱ FLYT</button></div>`;
 $("s57OpenAnalysis").onclick=()=>{s18.projectId=p.id;s18.clipId=c.id;state.mode="analysis";render()};
 $("s58Favorite").onclick=()=>{c.favorite=!c.favorite;save();render()};
 $("s58Move").onclick=$("s58MoveBottom").onclick=()=>moveClipDialog(x);
 host.querySelectorAll("[data-s58-tab]").forEach(b=>b.onclick=()=>{state.detailTab=b.dataset.s58Tab;renderPreview()});
 const src=await sourceFor(p),preview=$("s57Preview");if(!preview)return;
 if(!src){preview.innerHTML=`<div class="s57-emptyvideo">Kampvideoen kan ikke hentes på denne enhed.<br>Åbn kampanalysen for at kontrollere videokilden.</div>`;return}
 preview.innerHTML=`<div class="s581-player paused" id="s581Player"><video id="s57Video" playsinline preload="metadata"></video><canvas id="s581Canvas"></canvas><div class="s581-controls"><button id="s581Play" title="Afspil">▶</button><span id="s581Clock" class="s581-clock">00:00 / ${fmt(dur)}</span><input id="s581Seek" type="range" min="0" max="${Math.max(.01,dur)}" step=".05" value="0" aria-label="Klip tidslinje"><button id="s581Mute" title="Lyd">🔊</button><input id="s581Vol" class="s581-vol" type="range" min="0" max="1" step=".05" value="1" aria-label="Lydstyrke"><button id="s581Full" title="Fuld skærm">⛶</button></div></div>`;
 const v=$("s57Video"),player=$("s581Player"),play=$("s581Play"),seekBar=$("s581Seek"),clock=$("s581Clock"),mute=$("s581Mute"),vol=$("s581Vol"),full=$("s581Full"),annCanvas=$("s581Canvas");
 const clipStart=Number(c.startSec)||0,clipEnd=Number(c.endSec)||clipStart,clipDur=Math.max(0,clipEnd-clipStart);
 let s581Freeze={busy:false,lastId:null,lastAt:-999,timer:null};
 const resizeAnn=()=>{
   if(!annCanvas||!player)return;
   const r=player.getBoundingClientRect(),dpr=window.devicePixelRatio||1;
   const w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr));
   if(annCanvas.width!==w||annCanvas.height!==h){annCanvas.width=w;annCanvas.height=h}
 };
 const drawAnn=()=>{
   if(!annCanvas)return;
   resizeAnn();
   const ctx=annCanvas.getContext("2d");
   ctx.clearRect(0,0,annCanvas.width,annCanvas.height);
   const anns=Array.isArray(c.annotations)?c.annotations:[];
   anns.filter(a=>typeof s18Visible==="function"?s18Visible(a,v.currentTime):(v.currentTime>=Number(a.startTime||0)&&v.currentTime<=Number(a.endTime??1e9)))
       .forEach(a=>{if(typeof s18DrawOne==="function")s18DrawOne(ctx,a,annCanvas.width,annCanvas.height,false)});
 };
 const maybeFreeze=()=>{
   if(s581Freeze.busy||v.paused||localStorage.getItem("start11.video.freezeDrawings")==="0")return;
   const t=v.currentTime;
   const hit=(Array.isArray(c.annotations)?c.annotations:[]).find(a=>{
     if(a.freezeVideo===false)return false;
     const s=Number(a.startTime||0),dur=Math.max(.25,Number(a.endTime??s+3)-s);
     return t>=s&&t<s+.18&&!(s581Freeze.lastId===a.id&&Math.abs(s581Freeze.lastAt-s)<.5)&&dur>0;
   });
   if(!hit)return;
   const s=Number(hit.startTime||0),freezeDur=Math.max(.25,Number(hit.endTime??s+3)-s);
   s581Freeze.busy=true;s581Freeze.lastId=hit.id;s581Freeze.lastAt=s;
   v.pause();v.currentTime=s;drawAnn();
   s581Freeze.timer=setTimeout(()=>{
     s581Freeze.busy=false;
     v.currentTime=Math.min(clipEnd,s+.04);
     v.play().catch(()=>{});
   },freezeDur*1000);
 };
 const annRO=typeof ResizeObserver!=="undefined"?new ResizeObserver(()=>drawAnn()):null;
 annRO?.observe(player);
 v.src=src;
 const reset=()=>{try{v.currentTime=clipStart}catch(_){};if(seekBar)seekBar.value=0;if(clock)clock.textContent=`00:00 / ${fmt(clipDur)}`};
 v.addEventListener("loadedmetadata",()=>{reset();drawAnn()},{once:true});
 v.addEventListener("play",()=>{player?.classList.remove("paused");if(play)play.textContent="❚❚"});
 v.addEventListener("pause",()=>{player?.classList.add("paused");if(play)play.textContent="▶"});
 v.addEventListener("timeupdate",()=>{
   let rel=Math.max(0,v.currentTime-clipStart);
   if(clipDur>0&&rel>=clipDur-.03){v.pause();reset();rel=0}
   if(seekBar&&!seekBar.matches(":active"))seekBar.value=Math.min(clipDur,rel);
   if(clock)clock.textContent=`${fmt(Math.min(clipDur,rel))} / ${fmt(clipDur)}`;
   drawAnn();
   maybeFreeze();
 });
 play.onclick=()=>v.paused?v.play():v.pause();
 seekBar.oninput=()=>{if(s581Freeze.timer){clearTimeout(s581Freeze.timer);s581Freeze.timer=null;s581Freeze.busy=false}v.currentTime=clipStart+Number(seekBar.value||0);clock.textContent=`${fmt(Number(seekBar.value||0))} / ${fmt(clipDur)}`;drawAnn()};
 mute.onclick=()=>{v.muted=!v.muted;mute.textContent=v.muted?"🔇":"🔊"};
 vol.oninput=()=>{v.volume=Number(vol.value);v.muted=v.volume===0;mute.textContent=v.muted?"🔇":"🔊"};
 full.onclick=()=>{if(player.requestFullscreen)player.requestFullscreen();else if(v.webkitEnterFullscreen)v.webkitEnterFullscreen()};
 v.addEventListener("click",()=>v.paused?v.play():v.pause());
}

function bindNav(){document.querySelectorAll('[data-s34="video"]').forEach(btn=>{if(btn.dataset.s58Bound)return;btn.dataset.s58Bound="1";btn.addEventListener("click",e=>{e.preventDefault();e.stopImmediatePropagation();showOnly()},true)})}
window.start11ShowVideoLibrary=showOnly;window.start11RenderVideoLibrary=render;
const boot=()=>{ensureData();ensureView();bindNav();new MutationObserver(bindNav).observe(document.body,{childList:true,subtree:true})};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(boot,350),{once:true});else setTimeout(boot,350);
window.START11_BUILD="V58.1-VIDEO-CLIP-FIX";console.info("START11 loaded:",window.START11_BUILD);
})();


/* =========================================================
   START11 V58.2 – MODERN KAMPANALYSE PROJECT SWITCH FIX
   - Clicking a project inside the modern Video > Kampanalyse
     keeps the analyser inside #s57AnalysisHost
   - Automatically selects that project's first clip
   - Loads/seeks the correct project video immediately
========================================================= */
(function start11V582ProjectSwitchFix(){
"use strict";

function analysisHost(){
  return document.getElementById("s57AnalysisHost") || document.getElementById("s13content");
}

if(typeof s18BindProjectClip==="function"){
  s18BindProjectClip=function(){
    document.querySelectorAll("[data-project]").forEach(x=>{
      x.onclick=()=>{
        const p=(Array.isArray(s13Data?.videoProjects)?s13Data.videoProjects:[])
          .find(z=>String(z.id)===String(x.dataset.project));
        if(!p)return;

        s18.projectId=p.id;
        s18.clipId=p.clips?.[0]?.id||null;
        s18.inSec=null;
        s18.outSec=null;
        s18.selectedAnn=null;
        s18.undo=[];
        s18.redo=[];

        const host=analysisHost();
        if(host&&typeof s18Render==="function"){
          s18Render(host);
          setTimeout(()=>{
            const c=typeof s18Clip==="function"?s18Clip():null;
            if(c&&typeof s18Seek==="function")s18Seek(c);
          },80);
        }
      };
    });

    document.querySelectorAll("[data-clip]").forEach(x=>{
      x.onclick=()=>{
        s18.clipId=x.dataset.clip;
        s18.selectedAnn=null;
        s18.undo=[];
        s18.redo=[];
        const c=typeof s18Clip==="function"?s18Clip():null;
        if(c&&typeof s18Seek==="function")s18Seek(c);
        if(typeof s18RenderPanels==="function")s18RenderPanels();
      };
    });
  };
}

window.START11_BUILD="V58.2-VIDEO-PROJECT-SWITCH-FIX";
console.info("START11 loaded:",window.START11_BUILD);
})();


/* START11 V58.3 – VIDEO LIBRARY ANNOTATION PLAYBACK
   Videobibliotek reuses the exact clip.annotations from Kampanalyse.
   No duplicate annotation data is created. */
window.START11_BUILD="V58.3-VIDEO-LIBRARY-ANNOTATIONS";
console.info("START11 loaded:",window.START11_BUILD);


/* =========================================================
 START11 V59 – REAL FREEZE + VIDEO PRESENTATIONS
 - Robust wall-clock freeze for annotation duration
 - Freeze does NOT skip source footage
 - Build ordered presentations from any saved clips
 - Presentation playback uses the existing clip videos + annotations
========================================================= */
(function start11V59VideoPresentations(){
"use strict";
if(window.__START11_V59_VIDEO_PRESENTATIONS__)return;
window.__START11_V59_VIDEO_PRESENTATIONS__=true;

const q=s=>document.querySelector(s), qa=s=>[...document.querySelectorAll(s)];
const esc=v=>typeof s13Esc==="function"?s13Esc(String(v??"")):String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const uid=p=>typeof s13Id==="function"?s13Id(p):`${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
const fmt=sec=>{sec=Math.max(0,Number(sec)||0);const m=Math.floor(sec/60),s=Math.floor(sec%60);return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`};

function ensure(){
 if(!s13Data||typeof s13Data!=="object")return;
 if(!Array.isArray(s13Data.videoPresentations))s13Data.videoPresentations=[];
}
function save(){try{s13Save?.()}catch(_){try{scheduleCloudSave?.()}catch(__){}}}
function projects(){return Array.isArray(s13Data?.videoProjects)?s13Data.videoProjects:[]}
function allClips(){
 return projects().flatMap(p=>(p.clips||[]).map(c=>({project:p,clip:c,key:`${p.id}::${c.id}`})));
}
function resolve(key){
 const [pid,cid]=String(key||"").split("::");
 const p=projects().find(x=>String(x.id)===pid);
 const c=p?.clips?.find(x=>String(x.id)===cid);
 return p&&c?{project:p,clip:c,key}:null;
}
function sourceFor(p){
 try{
   if(typeof s18VideoSource==="function")return s18VideoSource(p);
   if(typeof s18ResolveVideoSource==="function")return s18ResolveVideoSource(p);
 }catch(_){}
 return p?.videoUrl||p?.url||p?.video||p?.src||"";
}

/* ---------- Robust freeze engine for the Video Library preview ---------- */
let freeze={raf:0,video:null,clip:null,last:null,busy:false,timer:0,lastHit:""};
function stopFreeze(){
 cancelAnimationFrame(freeze.raf);clearTimeout(freeze.timer);
 freeze={raf:0,video:null,clip:null,last:null,busy:false,timer:0,lastHit:""};
 q("#s59FreezeBadge")?.remove();
}
function freezeBadge(player){
 let b=player?.querySelector("#s59FreezeBadge");
 if(!b&&player){b=document.createElement("div");b.id="s59FreezeBadge";b.textContent="❚❚ FRYS · MARKERING";player.appendChild(b)}
 return b;
}
function startFreezeEngine(v,c,draw){
 stopFreeze(); if(!v||!c)return;
 freeze.video=v;freeze.clip=c;
 const player=v.closest(".s581-player"), badge=freezeBadge(player);
 const tick=()=>{
   if(freeze.video!==v)return;
   const t=Number(v.currentTime)||0;
   if(!freeze.busy&&!v.paused&&localStorage.getItem("start11.video.freezeDrawings")!=="0"){
     const anns=Array.isArray(c.annotations)?c.annotations:[];
     const hit=anns.find(a=>{
       if(a.freezeVideo===false)return false;
       const s=Number(a.startTime)||0,e=Number(a.endTime??s);
       const id=String(a.id||`${s}-${e}`);
       const crossed=freeze.last==null ? Math.abs(t-s)<.12 : freeze.last < s && t>=s;
       return e>s && crossed && freeze.lastHit!==id;
     });
     if(hit){
       const s=Number(hit.startTime)||0,e=Number(hit.endTime)||s,d=Math.max(.2,e-s);
       freeze.busy=true;freeze.lastHit=String(hit.id||`${s}-${e}`);
       v.pause();try{v.currentTime=s}catch(_){}
       draw?.();badge?.classList.add("show");
       freeze.timer=setTimeout(()=>{
         if(freeze.video!==v)return;
         freeze.busy=false;badge?.classList.remove("show");
         /* resume just after the SAME source frame; annotation duration is wall-clock time */
         try{v.currentTime=Math.min(Number(c.endSec)||1e9,s+.04)}catch(_){}
         freeze.last=s+.04;v.play().catch(()=>{});
       },d*1000);
     }
   }
   if(!freeze.busy)freeze.last=t;
   freeze.raf=requestAnimationFrame(tick);
 };
 freeze.raf=requestAnimationFrame(tick);
}

/* Hook the V58.3 library player after it is rendered. */
function attachLibraryFreeze(){
 const v=q("#s57Video"); if(!v||v.dataset.s59Freeze==="1")return;
 v.dataset.s59Freeze="1";
 const selectedKey=qa("[data-s57-card].selected,[data-s57-card].active")[0]?.dataset?.s57Card;
 let item=selectedKey?allClips().find(x=>String(x.clip.id)===String(selectedKey)):null;
 if(!item){
   const title=q(".s57-detail h2,.s57-detail h3")?.textContent?.trim();
   item=allClips().find(x=>x.clip.title===title)||null;
 }
 if(!item)return;
 startFreezeEngine(v,item.clip,()=>{try{v.dispatchEvent(new Event("timeupdate"))}catch(_){}});
}
new MutationObserver(()=>setTimeout(attachLibraryFreeze,0)).observe(document.body,{childList:true,subtree:true});

/* ---------- Presentation UI ---------- */
const css=document.createElement("style");
css.textContent=`
#s59Overlay{position:fixed;inset:0;z-index:10080;background:rgba(0,8,4,.86);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:24px}
.s59modal{width:min(1180px,96vw);height:min(760px,92vh);background:#031108;border:1px solid #245d31;border-radius:14px;display:grid;grid-template-rows:auto 1fr auto;overflow:hidden;color:#fff;box-shadow:0 30px 100px #000}
.s59head,.s59foot{padding:16px 20px;border-bottom:1px solid #173b22;display:flex;align-items:center;gap:12px}.s59foot{border-top:1px solid #173b22;border-bottom:0;justify-content:flex-end}
.s59head h2{margin:0;font-size:22px}.s59head small{color:#7f9a87}.s59close{margin-left:auto}
.s59body{display:grid;grid-template-columns:1.15fr .85fr;min-height:0}.s59pane{padding:18px;overflow:auto}.s59pane+.s59pane{border-left:1px solid #173b22}
.s59search,.s59name{width:100%;box-sizing:border-box;background:#06170d;border:1px solid #245d31;border-radius:8px;padding:11px;color:#fff;margin-bottom:12px}
.s59clip,.s59pick{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:10px 12px;border:1px solid #183d23;border-radius:8px;margin-bottom:7px;background:#06140b}
.s59clip b,.s59pick b{display:block}.s59clip small,.s59pick small{color:#789382}
.s59btn{border:1px solid #3a8c48;background:#07160c;color:#fff;border-radius:7px;padding:9px 12px;font-weight:800;cursor:pointer}.s59btn.primary{background:#62f34f;color:#001b05;border-color:#62f34f}.s59btn.danger{border-color:#7c2d2d;color:#ff8b8b}
.s59empty{padding:35px;text-align:center;color:#71877a;border:1px dashed #23452c;border-radius:10px}
#s59Player{position:fixed;inset:0;z-index:10100;background:#000;color:#fff;display:grid;grid-template-rows:auto 1fr auto}
.s59playhead{padding:12px 18px;background:#041008;display:flex;align-items:center;gap:12px}.s59playhead strong{font-size:15px}.s59playhead span{color:#8ca293;font-size:11px}.s59playhead button{margin-left:auto}
.s59stage{position:relative;min-height:0;display:flex;align-items:center;justify-content:center}.s59stage video{max-width:100%;max-height:100%;width:100%;height:100%;object-fit:contain}.s59stage canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.s59controls{padding:12px 18px;background:#041008;display:grid;grid-template-columns:auto auto 1fr auto auto;gap:10px;align-items:center}.s59controls input{width:100%;accent-color:#62f34f}
#s59FreezeBadge{position:absolute;left:50%;top:18px;transform:translateX(-50%);z-index:7;background:#62f34f;color:#002b08;font-size:10px;font-weight:900;padding:7px 11px;border-radius:999px;opacity:0;transition:.15s}#s59FreezeBadge.show{opacity:1}
@media(max-width:850px){.s59body{grid-template-columns:1fr}.s59pane+.s59pane{border-left:0;border-top:1px solid #173b22}}
`;
document.head.appendChild(css);

let draft={id:"",title:"",clips:[]};

function openBuilder(existing=null){
 ensure();
 draft=existing?JSON.parse(JSON.stringify(existing)):{id:"",title:"Ny videopræsentation",clips:[]};
 q("#s59Overlay")?.remove();
 const ov=document.createElement("div");ov.id="s59Overlay";
 ov.innerHTML=`<div class="s59modal">
  <div class="s59head"><div><h2>Videopræsentation</h2><small>Vælg klip fra dit videobibliotek og bestem rækkefølgen.</small></div><button class="s59btn s59close">LUK</button></div>
  <div class="s59body">
   <section class="s59pane"><input class="s59search" id="s59Search" placeholder="Søg i klip, kamp eller tags…"><div id="s59Available"></div></section>
   <section class="s59pane"><input class="s59name" id="s59Name" value="${esc(draft.title)}" placeholder="Navn på præsentation"><div id="s59Selected"></div></section>
  </div>
  <div class="s59foot"><button class="s59btn" id="s59Saved">GEMTE PRÆSENTATIONER</button><button class="s59btn primary" id="s59Save">GEM PRÆSENTATION</button></div>
 </div>`;
 document.body.appendChild(ov);
 ov.querySelector(".s59close").onclick=()=>ov.remove();
 ov.onclick=e=>{if(e.target===ov)ov.remove()};
 q("#s59Search").oninput=renderBuilder;
 q("#s59Save").onclick=savePresentation;
 q("#s59Saved").onclick=showSaved;
 renderBuilder();
}
function renderBuilder(){
 const term=(q("#s59Search")?.value||"").toLowerCase();
 const chosen=new Set(draft.clips);
 const avail=allClips().filter(x=>{
   const hay=[x.clip.title,x.project.title,x.project.opponent,x.clip.tags].flat().join(" ").toLowerCase();
   return !chosen.has(x.key)&&(!term||hay.includes(term));
 });
 q("#s59Available").innerHTML=avail.length?avail.map(x=>`<div class="s59clip"><div><b>${esc(x.clip.title||"Klip")}</b><small>${esc(x.project.title||x.project.opponent||"Kamp")} · ${fmt((Number(x.clip.endSec)||0)-(Number(x.clip.startSec)||0))}</small></div><button class="s59btn primary" data-s59-add="${esc(x.key)}">+ TILFØJ</button></div>`).join(""):`<div class="s59empty">Ingen flere klip matcher.</div>`;
 q("#s59Selected").innerHTML=draft.clips.length?draft.clips.map((key,i)=>{const x=resolve(key);return x?`<div class="s59pick"><div><b>${i+1}. ${esc(x.clip.title||"Klip")}</b><small>${esc(x.project.title||x.project.opponent||"Kamp")}</small></div><div><button class="s59btn" data-s59-up="${i}">↑</button> <button class="s59btn" data-s59-down="${i}">↓</button> <button class="s59btn danger" data-s59-remove="${i}">×</button></div></div>`:""}).join(""):`<div class="s59empty">Tilføj klip fra venstre side.</div>`;
 qa("[data-s59-add]").forEach(b=>b.onclick=()=>{draft.clips.push(b.dataset.s59Add);renderBuilder()});
 qa("[data-s59-remove]").forEach(b=>b.onclick=()=>{draft.clips.splice(+b.dataset.s59Remove,1);renderBuilder()});
 qa("[data-s59-up]").forEach(b=>b.onclick=()=>{const i=+b.dataset.s59Up;if(i>0)[draft.clips[i-1],draft.clips[i]]=[draft.clips[i],draft.clips[i-1]];renderBuilder()});
 qa("[data-s59-down]").forEach(b=>b.onclick=()=>{const i=+b.dataset.s59Down;if(i<draft.clips.length-1)[draft.clips[i+1],draft.clips[i]]=[draft.clips[i],draft.clips[i+1]];renderBuilder()});
}
function savePresentation(){
 ensure();draft.title=(q("#s59Name")?.value||"Videopræsentation").trim();if(!draft.clips.length){alert("Tilføj mindst ét klip.");return}
 if(!draft.id)draft.id=uid("video-presentation");
 const i=s13Data.videoPresentations.findIndex(x=>x.id===draft.id);
 if(i>=0)s13Data.videoPresentations[i]=JSON.parse(JSON.stringify(draft));else s13Data.videoPresentations.unshift(JSON.parse(JSON.stringify(draft)));
 save();q("#s59Overlay")?.remove();playPresentation(draft);
}
function showSaved(){
 ensure();const box=q("#s59Selected");if(!box)return;
 box.innerHTML=s13Data.videoPresentations.length?s13Data.videoPresentations.map(p=>`<div class="s59pick"><div><b>${esc(p.title)}</b><small>${p.clips?.length||0} klip</small></div><div><button class="s59btn primary" data-s59-play="${esc(p.id)}">AFSPIL</button> <button class="s59btn" data-s59-edit="${esc(p.id)}">REDIGER</button></div></div>`).join(""):`<div class="s59empty">Ingen gemte præsentationer endnu.</div>`;
 qa("[data-s59-play]").forEach(b=>b.onclick=()=>{const p=s13Data.videoPresentations.find(x=>x.id===b.dataset.s59Play);if(p){q("#s59Overlay")?.remove();playPresentation(p)}});
 qa("[data-s59-edit]").forEach(b=>b.onclick=()=>{const p=s13Data.videoPresentations.find(x=>x.id===b.dataset.s59Edit);if(p)openBuilder(p)});
}

let pres={data:null,index:0,url:"",freeze:null};
function closePlayer(){stopFreeze();if(pres.url?.startsWith("blob:"))URL.revokeObjectURL(pres.url);q("#s59Player")?.remove();pres={data:null,index:0,url:"",freeze:null}}
async function presentationSource(p){
 let src=sourceFor(p);
 if(src&&typeof src.then==="function")src=await src;
 return src||"";
}
function playPresentation(data,index=0){
 q("#s59Overlay")?.remove();closePlayer();
 pres.data=data;pres.index=Math.max(0,Math.min(index,(data.clips||[]).length-1));
 const x=resolve(data.clips[pres.index]);if(!x)return;
 const root=document.createElement("div");root.id="s59Player";
 root.innerHTML=`<div class="s59playhead"><div><strong>${esc(data.title)}</strong><br><span>Klip ${pres.index+1} af ${data.clips.length} · ${esc(x.clip.title||"Klip")}</span></div><button class="s59btn" id="s59Exit">LUK PRÆSENTATION</button></div><div class="s59stage"><video id="s59Video" playsinline></video><canvas id="s59Canvas"></canvas><div id="s59FreezeBadge">❚❚ FRYS · MARKERING</div></div><div class="s59controls"><button class="s59btn" id="s59Prev">← FORRIGE</button><button class="s59btn primary" id="s59Play">▶</button><input id="s59Seek" type="range" min="0" max="${Math.max(.01,(Number(x.clip.endSec)||0)-(Number(x.clip.startSec)||0))}" step=".05" value="0"><span id="s59Time">00:00 / ${fmt((Number(x.clip.endSec)||0)-(Number(x.clip.startSec)||0))}</span><button class="s59btn" id="s59Next">NÆSTE →</button></div>`;
 document.body.appendChild(root);
 q("#s59Exit").onclick=closePlayer;q("#s59Prev").onclick=()=>playPresentation(data,Math.max(0,pres.index-1));q("#s59Next").onclick=()=>playPresentation(data,Math.min(data.clips.length-1,pres.index+1));
 setupPresentationVideo(x);
}
async function setupPresentationVideo(x){
 const v=q("#s59Video"),cv=q("#s59Canvas"),seek=q("#s59Seek"),time=q("#s59Time"),play=q("#s59Play");if(!v)return;
 const start=Number(x.clip.startSec)||0,end=Number(x.clip.endSec)||start,dur=Math.max(0,end-start);
 const draw=()=>{
   if(!cv)return;const r=v.getBoundingClientRect(),dpr=devicePixelRatio||1;cv.width=Math.max(1,Math.round(r.width*dpr));cv.height=Math.max(1,Math.round(r.height*dpr));
   const ctx=cv.getContext("2d");ctx.clearRect(0,0,cv.width,cv.height);
   (x.clip.annotations||[]).filter(a=>typeof s18Visible==="function"?s18Visible(a,v.currentTime):(v.currentTime>=Number(a.startTime||0)&&v.currentTime<=Number(a.endTime||0))).forEach(a=>s18DrawOne?.(ctx,a,cv.width,cv.height,false));
 };
 let src=await presentationSource(x.project);if(!src)return;
 v.src=src;v.onloadedmetadata=()=>{v.currentTime=start;draw()};
 v.ontimeupdate=()=>{let rel=Math.max(0,v.currentTime-start);if(rel>=dur-.03&&dur){v.pause();if(pres.index<(pres.data.clips.length-1)){setTimeout(()=>playPresentation(pres.data,pres.index+1),250)}else{v.currentTime=start}}seek.value=Math.min(dur,rel);time.textContent=`${fmt(Math.min(dur,rel))} / ${fmt(dur)}`;draw()};
 v.onplay=()=>play.textContent="❚❚";v.onpause=()=>play.textContent="▶";
 play.onclick=()=>v.paused?v.play():v.pause();v.onclick=play.onclick;
 seek.oninput=()=>{v.currentTime=start+Number(seek.value||0);draw()};
 startFreezeEngine(v,x.clip,draw);
}

/* Add a presentation button to the modern Video library header.
   MutationObserver keeps it present after V58 rerenders. */
function injectButton(){
 const view=q("#s57VideoView");if(!view||view.hidden)return;
 if(q("#s59PresentationBtn"))return;
 const candidates=qa("#s57VideoView button");
 const analysis=candidates.find(b=>/KAMPANALYSE/i.test(b.textContent||""));
 if(!analysis)return;
 const b=document.createElement("button");b.id="s59PresentationBtn";b.className=analysis.className;b.textContent="PRÆSENTATION";b.onclick=()=>openBuilder();
 analysis.parentElement?.insertBefore(b,analysis);
}
new MutationObserver(()=>injectButton()).observe(document.body,{childList:true,subtree:true});
setTimeout(injectButton,300);

window.start11OpenVideoPresentation=openBuilder;
window.START11_BUILD="V59-REAL-FREEZE-VIDEO-PRESENTATIONS";
console.info("START11 loaded:",window.START11_BUILD);
})();
