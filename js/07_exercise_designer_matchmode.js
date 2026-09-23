/* =========================================================
   START11 – V18 PRO VIDEO ANALYSIS STUDIO
   Hele kampe · klip · timeline · tegninger · præsentation
========================================================= */

function s18EnsureData(){
  if(!s13Data||typeof s13Data!=="object")s13Data={};
  if(!Array.isArray(s13Data.videoProjects))s13Data.videoProjects=[];
  s13Data.videoProjects.forEach(p=>{p.clips=Array.isArray(p.clips)?p.clips:[];p.clips.forEach(c=>{c.annotations=Array.isArray(c.annotations)?c.annotations:[]})});
}
if(typeof s13Norm==="function"){
  const _s18norm=s13Norm;
  s13Norm=function(raw={}){const d=_s18norm(raw);d.videoProjects=Array.isArray(raw.videoProjects)?raw.videoProjects:(Array.isArray(d.videoProjects)?d.videoProjects:[]);return d};
}

const s18={projectId:null,clipId:null,inSec:null,outSec:null,tool:"select",color:"#70ff52",width:4,drawing:false,start:null,points:[],selectedAnn:null,undo:[],redo:[],objectUrl:"",presentIndex:0,presentProject:null};
const s18fmt=s=>{s=Math.max(0,Number(s||0));const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),x=(s%60).toFixed(1).padStart(4,"0");return h?`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${x}`:`${String(m).padStart(2,"0")}:${x}`};
const s18clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function s18Project(){s18EnsureData();if(!s18.projectId&&s13Data.videoProjects[0])s18.projectId=s13Data.videoProjects[0].id;return s13Data.videoProjects.find(p=>p.id===s18.projectId)||null}
function s18Clip(){const p=s18Project();if(!p)return null;if(!s18.clipId&&p.clips[0])s18.clipId=p.clips[0].id;return p.clips.find(c=>c.id===s18.clipId)||null}
function s18Touch(){const p=s18Project();if(p)p.updatedAt=new Date().toISOString();s13Save?.()}
function s18PlayerName(id){return id?(s13Players().find(p=>p.id===id)?.name||"Spiller"):"Holdklip"}
function s18OutcomeColor(o){return o==="Positiv"?"#65e572":o==="Korrigering"?"#ff6666":"#f1c75b"}

function s18Styles(){if(document.getElementById("s18styles"))return;const st=document.createElement("style");st.id="s18styles";st.textContent=`
.s18-layout{display:grid;grid-template-columns:245px minmax(0,1fr) 320px;gap:10px;min-height:700px}.s18-side{min-width:0}.s18-toolbar{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:9px}.s18-tool{height:34px;min-width:38px;padding:0 8px;border:1px solid rgba(255,255,255,.1);border-radius:6px;background:#071009;color:#aab6ad;font:inherit;font-size:8px;font-weight:900;cursor:pointer}.s18-tool.active,.s18-tool:hover{border-color:var(--s11-primary);color:var(--s11-primary);background:var(--s11-theme-glow-soft)}
.s18-stage{position:relative;aspect-ratio:16/9;background:#000;border:1px solid rgba(255,255,255,.1);border-radius:9px;overflow:hidden}.s18-stage video{width:100%;height:100%;object-fit:contain;display:block}.s18-stage canvas{position:absolute;inset:0;width:100%;height:100%;cursor:crosshair}.s18-controls{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:7px}.s18-time{margin-left:auto;color:#dfe7e1;font-size:8px;font-variant-numeric:tabular-nums}
.s18-timeline{position:relative;height:76px;margin-top:9px;border:1px solid rgba(255,255,255,.08);border-radius:7px;background:#050905;overflow:hidden;cursor:pointer}.s18-playhead{position:absolute;top:0;bottom:0;width:2px;background:#fff;z-index:9;pointer-events:none}.s18-segment{position:absolute;top:30px;height:31px;border-radius:4px;opacity:.9;min-width:3px;cursor:pointer}.s18-segment.active{outline:2px solid #fff;z-index:5}.s18-marker{position:absolute;top:23px;height:45px;width:2px;background:var(--s11-primary);z-index:8}.s18-marker.out{background:#ff6262}.s18-tick{position:absolute;top:5px;transform:translateX(-50%);font-size:6px;color:#69756d}
.s18-project,.s18-clip{padding:9px;border:1px solid rgba(255,255,255,.07);border-radius:7px;background:#071009;cursor:pointer}.s18-project+.s18-project,.s18-clip+.s18-clip{margin-top:6px}.s18-project.active,.s18-clip.active{border-color:var(--s11-primary);background:var(--s11-theme-glow-soft)}.s18-tag{display:inline-flex;margin:5px 4px 0 0;padding:2px 5px;border:1px solid rgba(255,255,255,.1);border-radius:999px;font-size:6px;color:#c5cec7}.s18-ann{display:grid;grid-template-columns:16px minmax(0,1fr) auto;gap:6px;align-items:center;padding:6px;border:1px solid rgba(255,255,255,.06);border-radius:5px;background:#050905}.s18-ann.active{border-color:var(--s11-primary)}.s18-dot{width:12px;height:12px;border-radius:50%}
.s18-drop{min-height:100%;display:grid;place-items:center;padding:16px;border:1px dashed rgba(255,255,255,.18);color:#87938a;text-align:center;font-size:8px;cursor:pointer}.s18-present{position:fixed;inset:0;z-index:10600;display:none;background:#000;color:#fff}.s18-present.open{display:block}.s18-present-stage{position:absolute;inset:0 360px 0 0}.s18-present-stage video{width:100%;height:100%;object-fit:contain}.s18-present-stage canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}.s18-present-side{position:absolute;inset:0 0 0 auto;width:360px;padding:22px;overflow:auto;border-left:1px solid rgba(255,255,255,.1);background:#071009}.s18-present-side h3{color:var(--s11-primary);font-size:9px;margin:18px 0 5px}.s18-present-side p{font-size:9px;line-height:1.55;white-space:pre-wrap;color:#d0d7d2}.s18-present-nav{position:absolute;left:20px;bottom:20px;display:flex;gap:7px;z-index:12}
@media(max-width:1180px){.s18-layout{grid-template-columns:220px minmax(0,1fr)}.s18-layout>.s18-side:last-child{grid-column:1/-1}}@media(max-width:800px){.s18-layout{grid-template-columns:1fr}.s18-present-stage{inset:0 0 260px 0}.s18-present-side{inset:auto 0 0 0;width:100%;height:260px}}
`;document.head.appendChild(st)}

function s18NewProject(){const title=prompt("Navn på analyseprojekt:","Kampanalyse");if(title===null)return;const opponent=prompt("Modstander:","")||"";const date=prompt("Kampdato (ÅÅÅÅ-MM-DD):",s13Today())||"";const p={id:s13Id("vproj"),title:title.trim()||"Kampanalyse",opponent,date,matchVideo:null,clips:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};s13Data.videoProjects.unshift(p);s18.projectId=p.id;s18.clipId=null;s18Touch()}
async function s18SetVideo(file){const p=s18Project();if(!p||!file)return;if(!String(file.type||"").startsWith("video/")){visNotification?.("Vælg en videofil.");return}const id=s13Id("matchvideo");try{if(p.matchVideo?.mediaId)await s15DeleteBlob(p.matchVideo.mediaId);await s15StoreBlob(id,file);p.matchVideo={sourceType:"local",mediaId:id,name:file.name,type:file.type,size:file.size,url:""};s18Touch();s18Render(document.getElementById("s13content"))}catch(e){console.error(e);visNotification?.("Kunne ikke gemme kampvideoen lokalt.")}}
function s18VeoMatchId(url){try{const u=new URL(String(url||"").trim());if(!/(^|\.)veo\.co$/i.test(u.hostname))return"";const m=u.pathname.match(/^\/matches\/([^/?#]+)/i);return m?decodeURIComponent(m[1]):""}catch{return""}}
function s18VeoApiBase(id){return `https://app.veo.co/api/app/matches/${encodeURIComponent(id)}`}
async function s18ResolveVeo(url){const id=s18VeoMatchId(url);if(!id)throw new Error("Det er ikke et gyldigt Veo-matchlink.");const endpoint=`/api/veo/resolve?match=${encodeURIComponent(id)}`;const res=await fetch(endpoint,{method:"GET",headers:{Accept:"application/json"},credentials:"same-origin"});if(!res.ok)throw new Error(`Veo svarede ${res.status} på video-endpointet.`);const data=await res.json();if(!Array.isArray(data)||!data.length)throw new Error("Veo returnerede ingen videokilder.");const usable=data.filter(x=>x&&/^https?:\/\//i.test(String(x.url||""))&&String(x.mime_type||"").toLowerCase()!=="video/mp2t");if(!usable.length)throw new Error("Veo returnerede ingen browser-egnede videokilder.");const rank=x=>{const r=String(x.render_type||"").toLowerCase();const mime=String(x.mime_type||"").toLowerCase();let score=Number(x.height||0);if(r.includes("follow"))score+=100000;if(r.includes("directed"))score+=90000;if(r.includes("panorama"))score-=50000;if(mime.includes("mp4"))score+=10000;return score};usable.sort((a,b)=>rank(b)-rank(a));const best=usable[0];return{matchId:id,url:String(best.url),mimeType:String(best.mime_type||"video/mp4"),renderType:String(best.render_type||""),width:Number(best.width||0),height:Number(best.height||0)}}
async function s18SetVideoLink(){const p=s18Project();if(!p)return;const url=prompt("Veo-link eller direkte videolink:","https://app.veo.co/matches/");if(!url)return;const clean=url.trim();const veoId=s18VeoMatchId(clean);if(veoId){p.matchVideo={sourceType:"veo",mediaId:"",name:"Veo kampvideo",type:"video",size:0,url:clean,veoMatchId:veoId,directUrl:"",directMime:"",directRenderType:""};s18Touch();if(typeof saveCloudNow==="function")await saveCloudNow();s18Render(document.getElementById("s13content"));return}p.matchVideo={sourceType:"link",mediaId:"",name:"Ekstern kampvideo",type:"video",size:0,url:clean};s18Touch();if(typeof saveCloudNow==="function")await saveCloudNow();s18Render(document.getElementById("s13content"))}
function s18NewClip(){const p=s18Project(),v=document.getElementById("s18Video");if(!p||!v)return;const a=s18.inSec??Math.max(0,v.currentTime-5),b=s18.outSec??Math.min(v.duration||a+15,a+15);if(b<=a){visNotification?.("OUT skal ligge efter IN.");return}const c={id:s13Id("clip"),title:`Klip ${p.clips.length+1}`,startSec:+a.toFixed(3),endSec:+b.toFixed(3),playerId:"",attributeId:"",phase:"Med bold",outcome:"Udvikling",tags:"",observation:"",coachingQuestion:"",action:"",showInMeeting:true,annotations:[],createdAt:new Date().toISOString()};p.clips.push(c);s18.clipId=c.id;s18.inSec=s18.outSec=null;s18Touch();s18Render(document.getElementById("s13content"));setTimeout(()=>s18Seek(c),50)}
function s18Seek(c){const v=document.getElementById("s18Video");if(v&&c){v.pause();v.currentTime=s18clamp(c.startSec,0,v.duration||1e9);s18Draw()}}

function s18ProjectsHtml(){return s13Data.videoProjects.map(p=>`<div class="s18-project ${p.id===s18.projectId?"active":""}" data-project="${s13Esc(p.id)}"><div class="s13title">${s13Esc(p.title)}</div><div class="s13mut">${s13Esc(p.opponent||"Ingen modstander")}${p.date?` · ${s13Date(p.date)}`:""} · ${p.clips.length} klip</div></div>`).join("")}
function s18ClipsHtml(p){return p?.clips?.length?p.clips.map(c=>`<div class="s18-clip ${c.id===s18.clipId?"active":""}" data-clip="${s13Esc(c.id)}"><div style="display:flex;justify-content:space-between;gap:6px"><div class="s13title">${s13Esc(c.title)}</div><span class="s18-tag" style="border-color:${s18OutcomeColor(c.outcome)}">${s13Esc(c.outcome)}</span></div><div class="s13mut">${s18fmt(c.startSec)} → ${s18fmt(c.endSec)} · ${s13Esc(s18PlayerName(c.playerId))}</div>${c.phase?`<span class="s18-tag">${s13Esc(c.phase)}</span>`:""}</div>`).join(""):`<div class="s13mut">Ingen klip endnu. Sæt IN og OUT på videoen.</div>`}
function s18ClipEditor(c){if(!c)return`<div class="s13mut">Vælg et klip for at analysere det.</div>`;const player=s13Players().find(p=>p.id===c.playerId),attrs=player?(s13Dev(player).attributes||[]):[];return`<div class="s13head"><div><strong>KLIPANALYSE</strong><div class="s13mut">${s18fmt(c.startSec)} → ${s18fmt(c.endSec)}</div></div><button id="s18DelClip" class="s13btn">SLET</button></div><div class="s13stack"><label class="s13field">Titel<input id="s18CTitle" class="s13in" value="${s13Esc(c.title)}"></label><div class="s13grid"><label class="s13field">IN<input id="s18CStart" class="s13in" type="number" step=".01" value="${c.startSec}"></label><label class="s13field">OUT<input id="s18CEnd" class="s13in" type="number" step=".01" value="${c.endSec}"></label></div><label class="s13field">Spiller<select id="s18CPlayer" class="s13sel"><option value="">Holdklip</option>${s13Players().map(p=>`<option value="${p.id}" ${p.id===c.playerId?"selected":""}>${s13Esc(p.name)}</option>`).join("")}</select></label><div class="s13grid"><label class="s13field">Spilfase<select id="s18CPhase" class="s13sel">${["Med bold","Uden bold","Offensiv omstilling","Defensiv omstilling","Standard"].map(x=>`<option ${x===c.phase?"selected":""}>${x}</option>`).join("")}</select></label><label class="s13field">Type<select id="s18COutcome" class="s13sel">${["Positiv","Udvikling","Korrigering"].map(x=>`<option ${x===c.outcome?"selected":""}>${x}</option>`).join("")}</select></label></div><label class="s13field">Attribute<select id="s18CAttr" class="s13sel"><option value="">Intet attribute</option>${attrs.map(a=>`<option value="${a.id}" ${a.id===c.attributeId?"selected":""}>${s13Esc(a.name)}</option>`).join("")}</select></label><label class="s13field">Tags<input id="s18CTags" class="s13in" value="${s13Esc(c.tags||"")}" placeholder="pres, scanning, 1v1..."></label><label class="s13field">Observation<textarea id="s18CObs" class="s13txt">${s13Esc(c.observation||"")}</textarea></label><label class="s13field">Coaching-spørgsmål<textarea id="s18CQ" class="s13txt">${s13Esc(c.coachingQuestion||"")}</textarea></label><label class="s13field">Næste handling<textarea id="s18CAction" class="s13txt">${s13Esc(c.action||"")}</textarea></label><label style="display:flex;gap:7px;align-items:center;color:#c4cdc6;font-size:8px"><input id="s18CMeeting" type="checkbox" ${c.showInMeeting?"checked":""}> Brug i spillersamtale/præsentation</label><button id="s18SaveClip" class="s13btn primary">GEM KLIPANALYSE</button></div><div class="s18-editor-section"><div class="s13head"><strong>MARKERINGER</strong></div><div id="s18AnnList"></div><div class="s13grid" style="margin-top:7px"><label class="s13field">Synlig fra<input id="s18AnnStart" class="s13in" type="number" step=".01"></label><label class="s13field">Synlig til<input id="s18AnnEnd" class="s13in" type="number" step=".01"></label></div><button id="s18SaveAnnTime" class="s13btn" style="width:100%;margin-top:7px">GEM MARKERINGSTID</button></div>`}

function s18Render(target){s18EnsureData();if(!s13Data.videoProjects.length){target.innerHTML=`<section class="s13panel"><div style="min-height:460px;display:grid;place-items:center;text-align:center"><div><div style="font-size:48px">▶</div><h2>START11 PRO VIDEO ANALYSIS</h2><p class="s13mut">Importér en hel kamp, lav klip, tegn på videoen og kør analysen som præsentation.</p><button id="s18First" class="s13btn primary">+ OPRET KAMPANALYSE</button></div></div></section>`;document.getElementById("s18First").onclick=()=>{s18NewProject();s18Render(target)};return}const p=s18Project(),c=s18Clip();target.innerHTML=`<div class="s18-toolbar"><button id="s18NewProject" class="s13btn primary">+ KAMP</button><button id="s18Upload" class="s13btn">${p?.matchVideo?"SKIFT KAMPVIDEO":"IMPORTÉR KAMPVIDEO"}</button><button id="s18Link" class="s13btn">VEO / VIDEO-LINK</button><button id="s18Present" class="s13btn" ${p?.clips?.length?"":"disabled"}>PRÆSENTATION</button><button id="s18Export" class="s13btn">EKSPORTÉR JSON</button><input id="s18UploadFile" type="file" accept="video/*" hidden></div><div class="s18-layout"><aside class="s18-side"><section class="s13panel"><div class="s13head"><strong>KAMPANALYSER</strong></div><div id="s18ProjectList">${s18ProjectsHtml()}</div><button id="s18DeleteProject" class="s13btn" style="width:100%;margin-top:8px">SLET PROJEKT</button></section><section class="s13panel" style="margin-top:10px"><div class="s13head"><strong>KLIP</strong></div><div id="s18ClipList">${s18ClipsHtml(p)}</div></section></aside><main><section class="s13panel"><div class="s13head"><div><strong>${s13Esc(p?.title||"VIDEO")}</strong><div class="s13mut">${s13Esc(p?.opponent||"")}${p?.date?` · ${s13Date(p.date)}`:""}</div></div><button id="s18EditProject" class="s13btn">REDIGER PROJEKT</button></div><div id="s18Stage" class="s18-stage"></div><div class="s18-controls"><button id="s18Back5" class="s18-tool">-5</button><button id="s18PrevFrame" class="s18-tool">◀|</button><button id="s18Play" class="s18-tool">PLAY</button><button id="s18NextFrame" class="s18-tool">|▶</button><button id="s18Forward5" class="s18-tool">+5</button><button id="s18In" class="s18-tool">IN</button><button id="s18Out" class="s18-tool">OUT</button><select id="s18Speed" class="s13sel" style="width:76px"><option value=".25">0.25x</option><option value=".5">0.5x</option><option value="1" selected>1x</option><option value="1.5">1.5x</option><option value="2">2x</option></select><span id="s18Time" class="s18-time">00:00 / 00:00</span></div><div id="s18Timeline" class="s18-timeline"></div><div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px"><div class="s13mut">IN: <strong id="s18InLabel">${s18.inSec==null?"—":s18fmt(s18.inSec)}</strong> · OUT: <strong id="s18OutLabel">${s18.outSec==null?"—":s18fmt(s18.outSec)}</strong></div><button id="s18CreateClip" class="s13btn primary">+ OPRET KLIP</button></div></section><section class="s13panel" style="margin-top:10px"><div class="s13head"><strong>TEGNEVÆRKTØJER</strong></div><div class="s18-toolbar">${[["select","VÆLG"],["arrow","PIL"],["line","LINJE"],["rect","FIRKANT"],["circle","CIRKEL"],["spotlight","SPOT"],["free","TEGN"],["text","TEKST"]].map(([id,l])=>`<button class="s18-tool ${s18.tool===id?"active":""}" data-tool="${id}">${l}</button>`).join("")}<input id="s18Color" type="color" value="${s18.color}" style="width:38px;height:34px"><select id="s18Width" class="s13sel" style="width:80px">${[2,4,6,8,12].map(w=>`<option value="${w}" ${w===s18.width?"selected":""}>${w}px</option>`).join("")}</select><button id="s18Undo" class="s18-tool">↶</button><button id="s18Redo" class="s18-tool">↷</button></div><div class="s13mut">Shortcuts: SPACE play/pause · I/O IN/OUT · ←/→ frame · J/L ±5 sek · A pil · R firkant · C cirkel · S spotlight</div></section></main><aside class="s18-side"><section id="s18ClipEditor" class="s13panel">${s18ClipEditor(c)}</section></aside></div>`;s18Bind();s18LoadVideo();s18RenderAnnList()}

async function s18LoadVideo(){const p=s18Project(),stage=document.getElementById("s18Stage");if(!p||!stage)return;if(s18.objectUrl){URL.revokeObjectURL(s18.objectUrl);s18.objectUrl=""}if(!p.matchVideo){stage.innerHTML=`<div id="s18Drop" class="s18-drop"><div><strong>DROP HELE KAMPVIDEOEN HER</strong><div>MP4 / WebM / MOV · gemmes lokalt i browseren</div></div><input id="s18DropFile" type="file" accept="video/*" hidden></div>`;const d=document.getElementById("s18Drop"),f=document.getElementById("s18DropFile");d.onclick=()=>f.click();d.ondragover=e=>{e.preventDefault();d.classList.add("dragover")};d.ondragleave=()=>d.classList.remove("dragover");d.ondrop=e=>{e.preventDefault();d.classList.remove("dragover");if(e.dataTransfer.files[0])s18SetVideo(e.dataTransfer.files[0])};f.onchange=e=>e.target.files[0]&&s18SetVideo(e.target.files[0]);return}let src="";if(p.matchVideo.sourceType==="local"){const x=await s15GetBlob(p.matchVideo.mediaId);if(!x?.blob){stage.innerHTML=`<div class="s18-drop">Den lokale kampvideo findes ikke på denne enhed.</div>`;return}src=URL.createObjectURL(x.blob);s18.objectUrl=src}else if(p.matchVideo.sourceType==="veo"){stage.innerHTML=`<div class="s18-drop"><div><strong>HENTER VEO-VIDEO…</strong><div style="margin-top:6px">START11 forsøger at hente Follow-cam-kilden direkte fra Veo.</div></div></div>`;try{const resolved=await s18ResolveVeo(p.matchVideo.url);src=resolved.url;p.matchVideo.directUrl=resolved.url;p.matchVideo.directMime=resolved.mimeType;p.matchVideo.directRenderType=resolved.renderType;p.matchVideo.directHeight=resolved.height;p.matchVideo.directResolvedAt=new Date().toISOString();s18Touch()}catch(err){console.error("START11 Veo direct resolve failed",err);stage.innerHTML=`<div class="s18-drop"><div><strong>VEO DIREKTE TEST BLEV BLOKERET</strong><div style="margin-top:7px;max-width:520px">${s13Esc(err?.message||"Kunne ikke hente Veo-videokilden.")}</div><div style="margin-top:7px">Hvis browserens CORS-regler blokerer Veo-API'et, kræver næste løsning en lille resolver på START11-serveren.</div><button id="s18VeoOpen" class="s13btn primary" style="margin-top:12px">ÅBN VEO</button></div></div>`;document.getElementById("s18VeoOpen")?.addEventListener("click",()=>window.open(p.matchVideo.url,"_blank","noopener"));return}}else src=p.matchVideo.url||"";stage.innerHTML=`<video id="s18Video" src="${s13Esc(src)}" preload="metadata" playsinline crossorigin="anonymous"></video><canvas id="s18Canvas"></canvas>`;const v=document.getElementById("s18Video");if(v&&p.matchVideo.sourceType==="veo")v.onerror=()=>{console.error("START11 Veo video element error",v.error);stage.innerHTML=`<div class="s18-drop"><div><strong>VEO-KILDEN BLEV FUNDET, MEN VIDEOEN KUNNE IKKE AFSPILLES</strong><div style="margin-top:7px">Det peger på adgang/CORS på selve videofilen. Næste test er server-resolver/proxy-header-løsningen.</div><button id="s18VeoOpen" class="s13btn primary" style="margin-top:12px">ÅBN VEO</button></div></div>`;document.getElementById("s18VeoOpen")?.addEventListener("click",()=>window.open(p.matchVideo.url,"_blank","noopener"))};s18BindVideo()}

function s18BindVideo(){const v=document.getElementById("s18Video"),cv=document.getElementById("s18Canvas");if(!v||!cv)return;v.onloadedmetadata=()=>{const c=s18Clip();if(c)v.currentTime=c.startSec;s18RenderTimeline();s18UpdateTime();s18Draw()};v.ontimeupdate=()=>{s18UpdateTime();s18UpdatePlayhead();s18Draw();const c=s18Clip();if(c&&v.currentTime>c.endSec&&v.currentTime<c.endSec+.4){v.pause();v.currentTime=c.endSec}};v.onplay=()=>document.getElementById("s18Play")&&(document.getElementById("s18Play").textContent="PAUSE");v.onpause=()=>document.getElementById("s18Play")&&(document.getElementById("s18Play").textContent="PLAY");s18BindCanvas()}
function s18UpdateTime(){const v=document.getElementById("s18Video"),el=document.getElementById("s18Time");if(v&&el)el.textContent=`${s18fmt(v.currentTime)} / ${s18fmt(v.duration||0)}`}
function s18UpdatePlayhead(){const v=document.getElementById("s18Video"),ph=document.getElementById("s18Playhead");if(v&&ph&&v.duration)ph.style.left=`${v.currentTime/v.duration*100}%`}
function s18Frame(d){const v=document.getElementById("s18Video");if(v){v.pause();v.currentTime=s18clamp(v.currentTime+d/25,0,v.duration||1e9)}}
function s18SeekRel(d){const v=document.getElementById("s18Video");if(v)v.currentTime=s18clamp(v.currentTime+d,0,v.duration||1e9)}

function s18RenderTimeline(){const t=document.getElementById("s18Timeline"),v=document.getElementById("s18Video"),p=s18Project();if(!t||!v||!p)return;const d=v.duration||1,ticks=[0,1,2,3,4,5,6].map(i=>`<span class="s18-tick" style="left:${i/6*100}%">${s18fmt(d*i/6)}</span>`).join(""),segs=p.clips.map(c=>`<div class="s18-segment ${c.id===s18.clipId?"active":""}" data-tclip="${c.id}" style="left:${c.startSec/d*100}%;width:${Math.max(.2,(c.endSec-c.startSec)/d*100)}%;background:${s18OutcomeColor(c.outcome)}"></div>`).join("");t.innerHTML=`${ticks}${segs}${s18.inSec!=null?`<div class="s18-marker" style="left:${s18.inSec/d*100}%"></div>`:""}${s18.outSec!=null?`<div class="s18-marker out" style="left:${s18.outSec/d*100}%"></div>`:""}<div id="s18Playhead" class="s18-playhead" style="left:${v.currentTime/d*100}%"></div>`;t.querySelectorAll("[data-tclip]").forEach(x=>x.onclick=e=>{e.stopPropagation();s18.clipId=x.dataset.tclip;s18Seek(s18Clip());s18RenderPanels()})}
function s18TimelineSeek(e){const t=document.getElementById("s18Timeline"),v=document.getElementById("s18Video");if(!t||!v||!v.duration||e.target.closest("[data-tclip]"))return;const r=t.getBoundingClientRect();v.currentTime=s18clamp((e.clientX-r.left)/r.width,0,1)*v.duration}

function s18ResizeCanvas(cv){const r=cv.getBoundingClientRect(),q=devicePixelRatio||1,w=Math.max(1,Math.round(r.width*q)),h=Math.max(1,Math.round(r.height*q));if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h}}
function s18Pt(e,cv){const r=cv.getBoundingClientRect();return{x:s18clamp((e.clientX-r.left)/r.width,0,1),y:s18clamp((e.clientY-r.top)/r.height,0,1)}}
function s18AnnBase(type){const v=document.getElementById("s18Video"),c=s18Clip(),now=v?.currentTime||c?.startSec||0;return{id:s13Id("ann"),type,color:s18.color,lineWidth:s18.width,startTime:+Math.max(c?.startSec||0,now-.2).toFixed(2),endTime:+Math.min(c?.endSec||now+3,now+3).toFixed(2)}}
function s18Visible(a,t){return t>=Number(a.startTime||0)&&t<=Number(a.endTime??1e9)}
function s18Arrow(ctx,x1,y1,x2,y2,color,w){const a=Math.atan2(y2-y1,x2-x1),h=Math.max(10,w*4);ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=w;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-h*Math.cos(a-Math.PI/6),y2-h*Math.sin(a-Math.PI/6));ctx.lineTo(x2-h*Math.cos(a+Math.PI/6),y2-h*Math.sin(a+Math.PI/6));ctx.closePath();ctx.fill()}
function s18DrawOne(ctx,a,W,H,sel=false){if(!a)return;const p=o=>({x:o.x*W,y:o.y*H}),col=a.color||"#70ff52",w=Number(a.lineWidth||4);ctx.save();ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=w;ctx.lineCap="round";ctx.lineJoin="round";if(sel){ctx.shadowColor="#fff";ctx.shadowBlur=8}if(a.type==="arrow"){const A=p(a.start),B=p(a.end);s18Arrow(ctx,A.x,A.y,B.x,B.y,col,w)}else if(a.type==="line"){const A=p(a.start),B=p(a.end);ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.stroke()}else if(a.type==="rect"){const A=p(a.start),B=p(a.end);ctx.strokeRect(Math.min(A.x,B.x),Math.min(A.y,B.y),Math.abs(B.x-A.x),Math.abs(B.y-A.y))}else if(a.type==="circle"){const A=p(a.start),B=p(a.end),cx=(A.x+B.x)/2,cy=(A.y+B.y)/2;ctx.beginPath();ctx.ellipse(cx,cy,Math.abs(B.x-A.x)/2,Math.abs(B.y-A.y)/2,0,0,Math.PI*2);ctx.stroke()}else if(a.type==="spotlight"){const A=p(a.start),B=p(a.end),cx=(A.x+B.x)/2,cy=(A.y+B.y)/2,rad=Math.max(Math.abs(B.x-A.x),Math.abs(B.y-A.y))/2;ctx.save();ctx.fillStyle="rgba(0,0,0,.58)";ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation="destination-out";ctx.beginPath();ctx.arc(cx,cy,rad,0,Math.PI*2);ctx.fill();ctx.restore();ctx.beginPath();ctx.arc(cx,cy,rad,0,Math.PI*2);ctx.stroke()}else if(a.type==="free"){const pts=a.points||[];if(pts.length>1){const A=p(pts[0]);ctx.beginPath();ctx.moveTo(A.x,A.y);pts.slice(1).forEach(q=>{const B=p(q);ctx.lineTo(B.x,B.y)});ctx.stroke()}}else if(a.type==="text"){const A=p(a.point);ctx.font=`900 ${Math.max(18,w*5)}px Arial`;ctx.fillText(a.text||"TEXT",A.x,A.y)}ctx.restore()}
function s18Draw(){const cv=document.getElementById("s18Canvas"),v=document.getElementById("s18Video"),c=s18Clip();if(!cv||!v||!c)return;s18ResizeCanvas(cv);const ctx=cv.getContext("2d");ctx.clearRect(0,0,cv.width,cv.height);(c.annotations||[]).filter(a=>s18Visible(a,v.currentTime)).forEach(a=>s18DrawOne(ctx,a,cv.width,cv.height,a.id===s18.selectedAnn));if(s18.previewAnn)s18DrawOne(ctx,s18.previewAnn,cv.width,cv.height,true);if(typeof window.s270DrawEditHandles==="function")window.s270DrawEditHandles(ctx,cv,c)}
function s18PushUndo(){const c=s18Clip();if(!c)return;s18.undo.push(JSON.stringify(c.annotations||[]));if(s18.undo.length>40)s18.undo.shift();s18.redo=[]}
function s18Undo(){const c=s18Clip();if(!c||!s18.undo.length)return;s18.redo.push(JSON.stringify(c.annotations||[]));c.annotations=JSON.parse(s18.undo.pop());s18Touch();s18Draw();s18RenderAnnList()}
function s18Redo(){const c=s18Clip();if(!c||!s18.redo.length)return;s18.undo.push(JSON.stringify(c.annotations||[]));c.annotations=JSON.parse(s18.redo.pop());s18Touch();s18Draw();s18RenderAnnList()}
function s18BindCanvas(){
 const cv=document.getElementById("s18Canvas");if(!cv)return;
 cv.style.pointerEvents="auto";
 let edit=null;

 cv.onpointerdown=e=>{
   const v=document.getElementById("s18Video"),c=s18Clip();if(!c)return;
   if(v&&!v.paused)v.pause();
   const pt=s18Pt(e,cv);

   if(s18.tool==="select"){
     if(typeof window.s270HitAnnotation==="function"){
       const hit=window.s270HitAnnotation(pt,c,cv);
       if(hit){
         s18.selectedAnn=hit.ann.id;
         edit={ann:hit.ann,part:hit.part,start:pt,original:JSON.parse(JSON.stringify(hit.ann))};
         s18PushUndo();
         try{cv.setPointerCapture(e.pointerId)}catch(_){}
         s18RenderAnnList();s18Draw();e.preventDefault();
       }else{
         s18.selectedAnn=null;s18RenderAnnList();s18Draw();
       }
     }
     return;
   }

   e.preventDefault();
   s18.drawing=true;s18.start=pt;s18.points=[pt];
   if(s18.tool==="text"){
     const txt=prompt("Tekst på videoen:","PRES");
     if(txt){
       s18PushUndo();
       const a={...s18AnnBase("text"),point:s18.start,text:txt,freezeVideo:true};
       c.annotations.push(a);s18.selectedAnn=a.id;s18Touch();s18RenderAnnList();s18Draw();
     }
     s18.drawing=false;s18.previewAnn=null;
   }
 };

 cv.onpointermove=e=>{
   const c=s18Clip();if(!c)return;
   const pt=s18Pt(e,cv);

   if(edit&&s18.tool==="select"){
     if(typeof window.s270EditAnnotation==="function")window.s270EditAnnotation(edit,pt);
     s18Touch();s18Draw();return;
   }
   if(!s18.drawing)return;

   if(s18.tool==="free"){
     s18.points.push(pt);
     s18.previewAnn={...s18AnnBase("free"),points:[...s18.points],freezeVideo:true};
   }else if(["arrow","line","rect","circle","spotlight"].includes(s18.tool)){
     s18.previewAnn={...s18AnnBase(s18.tool),start:s18.start,end:pt,freezeVideo:true};
   }
   s18Draw();
 };

 cv.onpointerup=e=>{
   if(edit){
     edit=null;s18Touch();s18RenderAnnList();s18Draw();return;
   }
   if(!s18.drawing||s18.tool==="text")return;
   const c=s18Clip(),end=s18Pt(e,cv);let a=null;
   if(s18.tool==="free"&&s18.points.length>1)a={...s18AnnBase("free"),points:[...s18.points,end],freezeVideo:true};
   else if(["arrow","line","rect","circle","spotlight"].includes(s18.tool))a={...s18AnnBase(s18.tool),start:s18.start,end,freezeVideo:true};
   s18.drawing=false;s18.start=null;s18.points=[];s18.previewAnn=null;
   if(a){s18PushUndo();c.annotations.push(a);s18.selectedAnn=a.id;s18Touch();s18RenderAnnList();s18Draw()}
 };
 cv.onpointercancel=()=>{edit=null;s18.drawing=false;s18.previewAnn=null;s18Draw()};
}

function s18RenderAnnList(){const box=document.getElementById("s18AnnList"),c=s18Clip();if(!box||!c)return;box.innerHTML=c.annotations.length?c.annotations.map(a=>`<div class="s18-ann ${a.id===s18.selectedAnn?"active":""}" data-ann="${a.id}"><span class="s18-dot" style="background:${a.color}"></span><span><strong style="font-size:7px">${a.type.toUpperCase()}</strong><small style="display:block;color:#76827a;font-size:6px">${s18fmt(a.startTime)} → ${s18fmt(a.endTime)}</small></span><button data-ann-del class="s13btn" style="min-height:25px;padding:0 7px">×</button></div>`).join(""):`<div class="s13mut">Ingen markeringer endnu.</div>`;box.querySelectorAll("[data-ann]").forEach(r=>{r.onclick=e=>{if(e.target.closest("[data-ann-del]"))return;s18.selectedAnn=r.dataset.ann;s18RenderAnnList();s18Draw();s18FillAnnTime()};r.querySelector("[data-ann-del]")?.addEventListener("click",e=>{e.stopPropagation();s18PushUndo();c.annotations=c.annotations.filter(a=>a.id!==r.dataset.ann);if(s18.selectedAnn===r.dataset.ann)s18.selectedAnn=null;s18Touch();s18RenderAnnList();s18Draw()})});s18FillAnnTime()}
function s18FillAnnTime(){const c=s18Clip(),a=c?.annotations.find(x=>x.id===s18.selectedAnn),s=document.getElementById("s18AnnStart"),e=document.getElementById("s18AnnEnd");if(s)s.value=a?Number(a.startTime).toFixed(2):"";if(e)e.value=a?Number(a.endTime).toFixed(2):""}

function s18RenderPanels(){const p=s18Project(),c=s18Clip(),pl=document.getElementById("s18ProjectList"),cl=document.getElementById("s18ClipList"),ed=document.getElementById("s18ClipEditor");if(pl)pl.innerHTML=s18ProjectsHtml();if(cl)cl.innerHTML=s18ClipsHtml(p);if(ed)ed.innerHTML=s18ClipEditor(c);s18BindProjectClip();s18BindClipEditor();s18RenderTimeline();s18RenderAnnList()}
function s18BindProjectClip(){document.querySelectorAll("[data-project]").forEach(x=>x.onclick=()=>{s18.projectId=x.dataset.project;s18.clipId=null;s18.inSec=s18.outSec=null;s18.selectedAnn=null;s18.undo=[];s18.redo=[];s18Render(document.getElementById("s13content"))});document.querySelectorAll("[data-clip]").forEach(x=>x.onclick=()=>{s18.clipId=x.dataset.clip;s18.selectedAnn=null;s18.undo=[];s18.redo=[];s18Seek(s18Clip());s18RenderPanels()})}
function s18BindClipEditor(){const c=s18Clip();if(!c)return;document.getElementById("s18CPlayer")?.addEventListener("change",e=>{c.playerId=e.target.value;c.attributeId="";s18Touch();s18RenderPanels()});document.getElementById("s18SaveClip")?.addEventListener("click",()=>{c.title=document.getElementById("s18CTitle").value||"Klip";c.startSec=Number(document.getElementById("s18CStart").value||0);c.endSec=Number(document.getElementById("s18CEnd").value||c.startSec+1);c.playerId=document.getElementById("s18CPlayer").value;c.phase=document.getElementById("s18CPhase").value;c.outcome=document.getElementById("s18COutcome").value;c.attributeId=document.getElementById("s18CAttr").value;c.tags=document.getElementById("s18CTags").value;c.observation=document.getElementById("s18CObs").value;c.coachingQuestion=document.getElementById("s18CQ").value;c.action=document.getElementById("s18CAction").value;c.showInMeeting=document.getElementById("s18CMeeting").checked;s18Touch();s18RenderPanels();s18Seek(c);visNotification?.("Klipanalysen er gemt.")});document.getElementById("s18DelClip")?.addEventListener("click",()=>{const p=s18Project();if(confirm(`Slet ${c.title}?`)){p.clips=p.clips.filter(x=>x.id!==c.id);s18.clipId=p.clips[0]?.id||null;s18Touch();s18Render(document.getElementById("s13content"))}});document.getElementById("s18SaveAnnTime")?.addEventListener("click",()=>{const a=c.annotations.find(x=>x.id===s18.selectedAnn);if(!a){visNotification?.("Vælg en markering først.");return}s18PushUndo();a.startTime=Number(document.getElementById("s18AnnStart").value||a.startTime);a.endTime=Number(document.getElementById("s18AnnEnd").value||a.endTime);s18Touch();s18Draw();s18RenderAnnList()})}

function s18Bind(){s18BindProjectClip();s18BindClipEditor();document.getElementById("s18NewProject").onclick=()=>{s18NewProject();s18Render(document.getElementById("s13content"))};document.getElementById("s18DeleteProject").onclick=async()=>{const p=s18Project();if(!p||!confirm(`Slet ${p.title}?`))return;if(p.matchVideo?.mediaId)try{await s15DeleteBlob(p.matchVideo.mediaId)}catch{}s13Data.videoProjects=s13Data.videoProjects.filter(x=>x.id!==p.id);s18.projectId=s13Data.videoProjects[0]?.id||null;s18.clipId=null;s18Touch();s18Render(document.getElementById("s13content"))};document.getElementById("s18EditProject").onclick=()=>{const p=s18Project();if(!p)return;const a=prompt("Projektets navn:",p.title);if(a!==null)p.title=a.trim()||p.title;const b=prompt("Modstander:",p.opponent||"");if(b!==null)p.opponent=b.trim();const d=prompt("Kampdato:",p.date||"");if(d!==null)p.date=d.trim();s18Touch();s18Render(document.getElementById("s13content"))};const uf=document.getElementById("s18UploadFile");document.getElementById("s18Upload").onclick=()=>uf.click();uf.onchange=e=>{if(e.target.files[0])s18SetVideo(e.target.files[0]);e.target.value=""};document.getElementById("s18Link").onclick=s18SetVideoLink;document.getElementById("s18Play").onclick=()=>{const v=document.getElementById("s18Video");if(v)(v.paused?v.play():v.pause())};document.getElementById("s18Back5").onclick=()=>s18SeekRel(-5);document.getElementById("s18Forward5").onclick=()=>s18SeekRel(5);document.getElementById("s18PrevFrame").onclick=()=>s18Frame(-1);document.getElementById("s18NextFrame").onclick=()=>s18Frame(1);document.getElementById("s18Speed").onchange=e=>{const v=document.getElementById("s18Video");if(v)v.playbackRate=Number(e.target.value)};document.getElementById("s18In").onclick=()=>{const v=document.getElementById("s18Video");if(v){s18.inSec=+v.currentTime.toFixed(3);document.getElementById("s18InLabel").textContent=s18fmt(s18.inSec);s18RenderTimeline()}};document.getElementById("s18Out").onclick=()=>{const v=document.getElementById("s18Video");if(v){s18.outSec=+v.currentTime.toFixed(3);document.getElementById("s18OutLabel").textContent=s18fmt(s18.outSec);s18RenderTimeline()}};document.getElementById("s18CreateClip").onclick=s18NewClip;document.getElementById("s18Timeline").onclick=s18TimelineSeek;document.querySelectorAll("[data-tool]").forEach(b=>b.onclick=()=>{s18.tool=b.dataset.tool;document.querySelectorAll("[data-tool]").forEach(x=>x.classList.toggle("active",x.dataset.tool===s18.tool))});document.getElementById("s18Color").oninput=e=>s18.color=e.target.value;document.getElementById("s18Width").onchange=e=>s18.width=Number(e.target.value);document.getElementById("s18Undo").onclick=s18Undo;document.getElementById("s18Redo").onclick=s18Redo;document.getElementById("s18Present").onclick=()=>s18OpenPresent(s18Project().id);document.getElementById("s18Export").onclick=s18ExportProject}

function s18ExportProject(){const p=s18Project();if(!p)return;const blob=new Blob([JSON.stringify({version:"START11_VIDEO_V18",project:p},null,2)],{type:"application/json"}),u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=(p.title||"videoanalyse").replace(/[^a-z0-9æøå_-]+/gi,"-")+".json";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000)}

function s18PresentOverlay(){let o=document.getElementById("s18PresentOverlay");if(!o){o=document.createElement("div");o.id="s18PresentOverlay";o.className="s18-present";document.body.appendChild(o)}return o}
async function s18OpenPresent(projectId){s18.presentProject=projectId;s18.presentIndex=0;await s18RenderPresent()}
async function s18RenderPresent(){const o=s18PresentOverlay(),p=s13Data.videoProjects.find(x=>x.id===s18.presentProject),c=p?.clips[s18.presentIndex];if(!p||!c){o.classList.remove("open");return}o.innerHTML=`<div class="s18-present-stage"><video id="s18PVideo" playsinline preload="metadata"></video><canvas id="s18PCanvas"></canvas></div><aside class="s18-present-side"><div style="color:var(--s11-primary);font-size:8px;font-weight:950">START11 · VIDEO ANALYSIS</div><h1>${s13Esc(p.title)}</h1><div class="s13mut">Klip ${s18.presentIndex+1}/${p.clips.length} · ${s18fmt(c.startSec)} → ${s18fmt(c.endSec)}</div><h3>KLIP</h3><p>${s13Esc(c.title)}</p><h3>OBSERVATION</h3><p>${s13Esc(c.observation||"Ingen observation.")}</p><h3>COACHING-SPØRGSMÅL</h3><p>${s13Esc(c.coachingQuestion||"Intet spørgsmål.")}</p><h3>NÆSTE HANDLING</h3><p>${s13Esc(c.action||"Ingen handling.")}</p><div style="display:grid;gap:7px;margin-top:20px"><button id="s18PPlay" class="s13btn primary">AFSPIL KLIP</button><button id="s18PClose" class="s13btn">LUK</button></div></aside><div class="s18-present-nav"><button id="s18PPrev" class="s13btn" ${s18.presentIndex===0?"disabled":""}>← FORRIGE</button><button id="s18PNext" class="s13btn primary" ${s18.presentIndex>=p.clips.length-1?"disabled":""}>NÆSTE →</button></div>`;o.classList.add("open");document.getElementById("s18PClose").onclick=()=>o.classList.remove("open");document.getElementById("s18PPrev").onclick=()=>{if(s18.presentIndex>0){s18.presentIndex--;s18RenderPresent()}};document.getElementById("s18PNext").onclick=()=>{if(s18.presentIndex<p.clips.length-1){s18.presentIndex++;s18RenderPresent()}};const v=document.getElementById("s18PVideo");let src="";if(p.matchVideo?.sourceType==="local"){const x=await s15GetBlob(p.matchVideo.mediaId);if(x?.blob)src=URL.createObjectURL(x.blob)}else if(p.matchVideo?.sourceType==="veo"){try{const resolved=await s18ResolveVeo(p.matchVideo.url);src=resolved.url}catch(err){console.error("START11 Veo presentation resolve failed",err)}}else src=p.matchVideo?.url||"";if(!src){v.outerHTML=`<div style="display:grid;place-items:center;width:100%;height:100%;color:#888">Kampvideo mangler på denne enhed.</div>`;return}v.src=src;v.onloadedmetadata=()=>{v.currentTime=c.startSec;s18DrawPresent(c,v.currentTime)};v.ontimeupdate=()=>{s18DrawPresent(c,v.currentTime);if(v.currentTime>=c.endSec){v.pause();v.currentTime=c.endSec}};document.getElementById("s18PPlay").onclick=()=>{if(v.currentTime<c.startSec||v.currentTime>=c.endSec)v.currentTime=c.startSec;v.play()}}
function s18DrawPresent(c,t){const cv=document.getElementById("s18PCanvas");if(!cv)return;s18ResizeCanvas(cv);const ctx=cv.getContext("2d");ctx.clearRect(0,0,cv.width,cv.height);(c.annotations||[]).filter(a=>s18Visible(a,t)).forEach(a=>s18DrawOne(ctx,a,cv.width,cv.height,false))}

function s18Key(e){if(!document.querySelector(".s18-layout"))return;if(["INPUT","TEXTAREA","SELECT"].includes(e.target?.tagName))return;const k=e.key.toLowerCase();if(k===" "){e.preventDefault();document.getElementById("s18Play")?.click()}else if(k==="i")document.getElementById("s18In")?.click();else if(k==="o")document.getElementById("s18Out")?.click();else if(e.key==="ArrowLeft"){e.preventDefault();s18Frame(-1)}else if(e.key==="ArrowRight"){e.preventDefault();s18Frame(1)}else if(k==="j")s18SeekRel(-5);else if(k==="l")s18SeekRel(5);else{const m={a:"arrow",r:"rect",c:"circle",s:"spotlight",f:"free",t:"text"};if(m[k]){s18.tool=m[k];document.querySelectorAll("[data-tool]").forEach(x=>x.classList.toggle("active",x.dataset.tool===s18.tool))}}}

s13Videos=function(target){s18Render(target)};
function s18Init(){s18EnsureData();s18Styles();if(!window.__s18Key){window.__s18Key=true;document.addEventListener("keydown",s18Key)}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(s18Init,3200));else setTimeout(s18Init,3200);



/* =========================================================
   START11 – V19
   ---------------------------------------------------------
   1) ADVANCED EXERCISE TACTICAL BOARD
      - Tegn øvelser direkte i øvelsesbanken
      - Spillere, kegler, bolde, mål, mannequiner
      - Pile, afleveringslinjer, driblelinjer, zoner, tekst
      - Drag & drop
      - Flere animationstrin / frames
      - Hurtigskabelon til 4v2-rondo
      - Diagrammer følger automatisk med i trænings-PDF

   2) MATCH-SPECIFIC START11
      - Hver kalenderkamp får sin egen startopstilling
      - Egen formation + bænk pr. kamp
      - Klik på AGF viser AGF-opstillingen
      - Klik på FCK viser FCK-opstillingen
      - Ændringer gemmes kun på den konkrete kamp
      - Holdets normale START11 bevares
      - Knap til eksisterende KAMPPLAN/PDF
      - Mulighed for at kopiere seneste kampopstilling
========================================================= */


/* =========================================================
   GENERELLE V19 HELPERS
========================================================= */

function s19Clone(value) {

    try {

        if (
            typeof structuredClone ===
            "function"
        ) {
            return structuredClone(
                value
            );
        }

    } catch {

    }

    return JSON.parse(
        JSON.stringify(
            value
        )
    );

}


function s19Uid(prefix) {

    if (
        typeof s13Id ===
        "function"
    ) {
        return s13Id(
            prefix
        );
    }

    return (
        prefix +
        "_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .slice(2,8)
    );

}


/* =========================================================
   V19 DATA
========================================================= */

function s19EnsureData() {

    if (
        !s13Data ||
        typeof s13Data !==
        "object"
    ) {
        s13Data = {};
    }

    if (
        !Array.isArray(
            s13Data.matchLineups
        )
    ) {
        s13Data.matchLineups = [];
    }

    if (
        !Array.isArray(
            s13Data.exercises
        )
    ) {
        s13Data.exercises = [];
    }

    s13Data.exercises.forEach(
        exercise => {

            if (
                !exercise.diagram ||
                typeof exercise.diagram !==
                "object"
            ) {

                exercise.diagram =
                    s19DefaultDiagram();

            } else {

                exercise.diagram =
                    s19NormalizeDiagram(
                        exercise.diagram
                    );

            }

        }
    );

}


if (
    typeof s13Norm ===
    "function"
) {

    const s19NormBefore =
        s13Norm;

    s13Norm =
        function (
            raw = {}
        ) {

            const data =
                s19NormBefore(
                    raw
                );

            data.matchLineups =
                Array.isArray(
                    raw.matchLineups
                )
                    ? raw.matchLineups
                    : (
                        Array.isArray(
                            data.matchLineups
                        )
                            ? data.matchLineups
                            : []
                    );

            if (
                !Array.isArray(
                    data.exercises
                )
            ) {
                data.exercises = [];
            }

            data.exercises.forEach(
                exercise => {

                    exercise.diagram =
                        s19NormalizeDiagram(
                            exercise.diagram
                        );

                }
            );

            return data;

        };

}


/* =========================================================
   EXERCISE BOARD – DATA MODEL
========================================================= */

function s19EmptyFrame() {

    return {
        id:
            s19Uid(
                "diagram-frame"
            ),

        title:
            "Trin 1",

        duration:
            0,

        elements:
            [],

        arrows:
            [],

        zones:
            []
    };

}


function s19DefaultDiagram() {

    return {
        pitch:
            "plain",

        frames:
            [
                s19EmptyFrame()
            ],

        activeFrame:
            0
    };

}


function s19NormalizeDiagram(
    raw
) {

    if (
        !raw ||
        typeof raw !==
        "object"
    ) {
        return s19DefaultDiagram();
    }

    /*
        Migration fra et evt. ældre statisk diagram.
    */
    if (
        !Array.isArray(
            raw.frames
        )
    ) {

        const frame =
            s19EmptyFrame();

        frame.elements =
            Array.isArray(
                raw.elements
            )
                ? raw.elements
                : [];

        frame.arrows =
            Array.isArray(
                raw.arrows
            )
                ? raw.arrows
                : [];

        frame.zones =
            Array.isArray(
                raw.zones
            )
                ? raw.zones
                : [];

        raw = {
            pitch:
                raw.pitch ||
                "plain",

            frames:
                [
                    frame
                ],

            activeFrame:
                0
        };

    }

    if (
        !raw.frames.length
    ) {
        raw.frames.push(
            s19EmptyFrame()
        );
    }

    raw.frames.forEach(
        (
            frame,
            index
        ) => {

            frame.id =
                frame.id ||
                s19Uid(
                    "diagram-frame"
                );

            frame.title =
                frame.title ||
                `Trin ${index + 1}`;

            frame.duration =
                Number(
                    frame.duration ||
                    0
                );

            frame.elements =
                Array.isArray(
                    frame.elements
                )
                    ? frame.elements
                    : [];

            frame.arrows =
                Array.isArray(
                    frame.arrows
                )
                    ? frame.arrows
                    : [];

            frame.zones =
                Array.isArray(
                    frame.zones
                )
                    ? frame.zones
                    : [];

        }
    );

    raw.pitch =
        raw.pitch ||
        "plain";

    raw.activeFrame =
        Math.max(
            0,
            Math.min(
                raw.frames.length -
                1,
                Number(
                    raw.activeFrame ||
                    0
                )
            )
        );

    return raw;

}


function s19ExerciseForDesigner() {

    return s13Data.exercises.find(
        exercise =>
            exercise.id ===
            s13Exercise
    ) ||
    null;

}


function s19DiagramFrame(
    exercise
) {

    if (
        !exercise
    ) {
        return null;
    }

    exercise.diagram =
        s19NormalizeDiagram(
            exercise.diagram
        );

    return exercise.diagram.frames[
        exercise.diagram.activeFrame
    ] ||
    exercise.diagram.frames[0];
}


/* =========================================================
   EXERCISE BOARD – STYLES
========================================================= */

function s19InstallStyles() {

    if (
        document.getElementById(
            "s19styles"
        )
    ) {
        return;
    }

    const style =
        document.createElement(
            "style"
        );

    style.id =
        "s19styles";

    style.textContent = `

        /* ===========================
           MATCH MODE
        =========================== */

        #s19MatchModeBar {
            position:
                sticky;

            top:
                0;

            z-index:
                10120;

            display:
                none;

            align-items:
                center;

            justify-content:
                space-between;

            gap:
                12px;

            width:
                min(
                    1420px,
                    calc(100% - 22px)
                );

            margin:
                10px auto 0;

            padding:
                10px 12px;

            border:
                1px solid
                color-mix(
                    in srgb,
                    var(--s11-primary) 55%,
                    rgba(255,255,255,.08)
                );

            border-radius:
                9px;

            background:
                linear-gradient(
                    90deg,
                    color-mix(
                        in srgb,
                        var(--s11-primary) 13%,
                        #071009
                    ),
                    #071009 60%
                );

            box-shadow:
                0 12px 38px
                rgba(0,0,0,.28);

            color:
                #fff;
        }

        #s19MatchModeBar.open {
            display:
                flex;
        }

        .s19-match-context {
            display:
                flex;

            align-items:
                center;

            gap:
                10px;

            min-width:
                0;
        }

        .s19-match-badge {
            display:
                grid;

            place-items:
                center;

            min-width:
                45px;

            height:
                36px;

            padding:
                0 8px;

            border-radius:
                6px;

            background:
                var(--s11-primary);

            color:
                #061007;

            font-size:
                8px;

            font-weight:
                1000;

            letter-spacing:
                .5px;
        }

        .s19-match-title {
            font-size:
                12px;

            font-weight:
                1000;

            overflow:
                hidden;

            white-space:
                nowrap;

            text-overflow:
                ellipsis;
        }

        .s19-match-sub {
            margin-top:
                2px;

            color:
                #87948A;

            font-size:
                7px;
        }

        .s19-match-actions {
            display:
                flex;

            flex-wrap:
                wrap;

            justify-content:
                flex-end;

            gap:
                6px;
        }

        .s19-match-save-state {
            color:
                var(--s11-primary);

            font-size:
                7px;

            font-weight:
                900;
        }


        /* ===========================
           EXERCISE BOARD
        =========================== */

        .s19-diagram-section {
            margin-top:
                12px;

            padding-top:
                12px;

            border-top:
                1px solid
                rgba(255,255,255,.075);
        }

        .s19-diagram-top {
            display:
                flex;

            align-items:
                center;

            justify-content:
                space-between;

            flex-wrap:
                wrap;

            gap:
                8px;

            margin-bottom:
                8px;
        }

        .s19-diagram-tools {
            display:
                flex;

            align-items:
                center;

            flex-wrap:
                wrap;

            gap:
                5px;
        }

        .s19-dtool {
            min-height:
                31px;

            padding:
                0 8px;

            border:
                1px solid
                rgba(255,255,255,.1);

            border-radius:
                6px;

            background:
                #071009;

            color:
                #AEB9B0;

            font:
                inherit;

            font-size:
                7px;

            font-weight:
                900;

            cursor:
                pointer;
        }

        .s19-dtool:hover,
        .s19-dtool.active {
            border-color:
                var(--s11-primary);

            color:
                var(--s11-primary);

            background:
                var(--s11-theme-glow-soft);
        }

        .s19-board-wrap {
            position:
                relative;

            width:
                100%;

            aspect-ratio:
                16 / 9;

            overflow:
                hidden;

            border:
                1px solid
                rgba(255,255,255,.13);

            border-radius:
                9px;

            background:
                #1C6B35;

            touch-action:
                none;

            user-select:
                none;
        }

        .s19-board-wrap.pitch-full {
            background:
                #176733;
        }

        .s19-board-wrap.pitch-half {
            background:
                #176733;
        }

        .s19-board-grass {
            position:
                absolute;

            inset:
                0;

            background:
                repeating-linear-gradient(
                    90deg,
                    rgba(255,255,255,.025) 0,
                    rgba(255,255,255,.025) 10%,
                    rgba(0,0,0,.025) 10%,
                    rgba(0,0,0,.025) 20%
                );

            pointer-events:
                none;
        }

        .s19-board-lines {
            position:
                absolute;

            inset:
                5%;

            border:
                2px solid
                rgba(255,255,255,.68);

            pointer-events:
                none;
        }

        .s19-board-wrap.pitch-plain
            .s19-board-lines {
            display:
                none;
        }

        .s19-board-midline {
            position:
                absolute;

            left:
                50%;

            top:
                5%;

            bottom:
                5%;

            width:
                2px;

            background:
                rgba(255,255,255,.58);

            transform:
                translateX(-50%);

            pointer-events:
                none;
        }

        .s19-board-wrap.pitch-plain
            .s19-board-midline,
        .s19-board-wrap.pitch-half
            .s19-board-midline {
            display:
                none;
        }

        .s19-board-circle {
            position:
                absolute;

            left:
                50%;

            top:
                50%;

            width:
                16%;

            aspect-ratio:
                1;

            border:
                2px solid
                rgba(255,255,255,.58);

            border-radius:
                50%;

            transform:
                translate(
                    -50%,
                    -50%
                );

            pointer-events:
                none;
        }

        .s19-board-wrap.pitch-plain
            .s19-board-circle,
        .s19-board-wrap.pitch-half
            .s19-board-circle {
            display:
                none;
        }

        #s19DiagramSvg {
            position:
                absolute;

            inset:
                0;

            width:
                100%;

            height:
                100%;

            pointer-events:
                none;

            z-index:
                3;
        }

        .s19-board-element {
            position:
                absolute;

            z-index:
                5;

            display:
                grid;

            place-items:
                center;

            transform:
                translate(
                    -50%,
                    -50%
                );

            cursor:
                grab;

            touch-action:
                none;
        }

        .s19-board-element.selected {
            filter:
                drop-shadow(
                    0 0 5px
                    #fff
                );
        }

        .s19-player {
            width:
                28px;

            height:
                28px;

            border:
                2px solid
                rgba(255,255,255,.95);

            border-radius:
                50%;

            box-shadow:
                0 2px 8px
                rgba(0,0,0,.32);

            color:
                #fff;

            font-size:
                8px;

            font-weight:
                1000;
        }

        .s19-player.blue {
            background:
                #2778FF;
        }

        .s19-player.red {
            background:
                #E44646;
        }

        .s19-player.yellow {
            background:
                #E8BF35;

            color:
                #111;
        }

        .s19-player.green {
            background:
                #37A35B;
        }

        .s19-cone {
            width:
                0;

            height:
                0;

            border-left:
                8px solid transparent;

            border-right:
                8px solid transparent;

            border-bottom:
                18px solid #FF9D28;

            filter:
                drop-shadow(
                    0 2px 2px
                    rgba(0,0,0,.35)
                );
        }

        .s19-ball {
            width:
                15px;

            height:
                15px;

            border:
                2px solid
                #111;

            border-radius:
                50%;

            background:
                #fff;
        }

        .s19-mannequin {
            width:
                10px;

            height:
                29px;

            border:
                2px solid
                #F0CD3E;

            border-radius:
                999px 999px 3px 3px;

            background:
                rgba(240,205,62,.25);
        }

        .s19-goal {
            width:
                42px;

            height:
                21px;

            border:
                3px solid
                #fff;

            border-bottom-width:
                1px;

            background:
                repeating-linear-gradient(
                    45deg,
                    transparent 0 5px,
                    rgba(255,255,255,.24) 5px 6px
                );
        }

        .s19-minigoal {
            width:
                28px;

            height:
                15px;

            border:
                2px solid
                #fff;

            border-bottom-width:
                1px;
        }

        .s19-board-text {
            min-width:
                30px;

            padding:
                3px 5px;

            border:
                1px solid
                rgba(255,255,255,.28);

            border-radius:
                4px;

            background:
                rgba(0,0,0,.58);

            color:
                #fff;

            font-size:
                8px;

            font-weight:
                900;

            white-space:
                nowrap;
        }

        .s19-frame-bar {
            display:
                flex;

            align-items:
                center;

            flex-wrap:
                wrap;

            gap:
                5px;

            margin-top:
                8px;
        }

        .s19-frame-pill {
            min-height:
                29px;

            padding:
                0 9px;

            border:
                1px solid
                rgba(255,255,255,.08);

            border-radius:
                999px;

            background:
                #071009;

            color:
                #8F9B92;

            font:
                inherit;

            font-size:
                7px;

            cursor:
                pointer;
        }

        .s19-frame-pill.active {
            border-color:
                var(--s11-primary);

            color:
                var(--s11-primary);

            background:
                var(--s11-theme-glow-soft);
        }

        .s19-board-hint {
            margin-top:
                7px;

            color:
                #78857C;

            font-size:
                7px;

            line-height:
                1.5;
        }

        .s19-board-property {
            display:
                grid;

            grid-template-columns:
                repeat(
                    3,
                    minmax(0,1fr)
                );

            gap:
                7px;

            margin-top:
                8px;
        }

        @media (
            max-width: 850px
        ) {

            #s19MatchModeBar {
                align-items:
                    flex-start;

                flex-direction:
                    column;
            }

            .s19-match-actions {
                width:
                    100%;

                justify-content:
                    flex-start;
            }

            .s19-board-property {
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
   EXERCISE BOARD – SVG / RENDER HELPERS
========================================================= */

function s19DiagramElementHtml(
    element
) {

    const x =
        Number(
            element.x ??
            .5
        ) *
        100;

    const y =
        Number(
            element.y ??
            .5
        ) *
        100;

    const selected =
        element.id ===
        s19DiagramState.selectedId
            ? " selected"
            : "";

    const label =
        s13Esc(
            element.label ||
            ""
        );

    let inner =
        "";

    switch (
        element.type
    ) {

        case "player-blue":
            inner =
                `<div class="s19-player blue">${label}</div>`;
            break;

        case "player-red":
            inner =
                `<div class="s19-player red">${label}</div>`;
            break;

        case "player-yellow":
            inner =
                `<div class="s19-player yellow">${label}</div>`;
            break;

        case "player-green":
            inner =
                `<div class="s19-player green">${label}</div>`;
            break;

        case "cone":
            inner =
                `<div class="s19-cone"></div>`;
            break;

        case "ball":
            inner =
                `<div class="s19-ball"></div>`;
            break;

        case "goal":
            inner =
                `<div class="s19-goal"></div>`;
            break;

        case "minigoal":
            inner =
                `<div class="s19-minigoal"></div>`;
            break;

        case "mannequin":
            inner =
                `<div class="s19-mannequin"></div>`;
            break;

        case "text":
            inner =
                `<div class="s19-board-text">${label || "TEKST"}</div>`;
            break;

        default:
            inner =
                `<div class="s19-player blue">${label}</div>`;

    }

    return `
        <div
            class="s19-board-element${selected}"
            data-diagram-element="${
                s13Esc(
                    element.id
                )
            }"
            style="
                left:${x}%;
                top:${y}%;
                transform:
                    translate(-50%,-50%)
                    rotate(${Number(element.rotation || 0)}deg);
            "
        >
            ${inner}
        </div>
    `;

}


function s19DiagramSvgInner(
    frame,
    options = {}
) {

    const width =
        options.width ||
        1000;

    const height =
        options.height ||
        562.5;

    const markerId =
        options.markerId ||
        "s19ArrowHead";

    const zones =
        (
            frame?.zones ||
            []
        )
            .map(
                zone => {

                    const x =
                        Math.min(
                            zone.x1,
                            zone.x2
                        ) *
                        width;

                    const y =
                        Math.min(
                            zone.y1,
                            zone.y2
                        ) *
                        height;

                    const w =
                        Math.abs(
                            zone.x2 -
                            zone.x1
                        ) *
                        width;

                    const h =
                        Math.abs(
                            zone.y2 -
                            zone.y1
                        ) *
                        height;

                    return `
                        <rect
                            x="${x}"
                            y="${y}"
                            width="${w}"
                            height="${h}"
                            rx="8"
                            fill="${
                                zone.color ||
                                "#70ff52"
                            }"
                            fill-opacity=".16"
                            stroke="${
                                zone.color ||
                                "#70ff52"
                            }"
                            stroke-width="3"
                            stroke-dasharray="8 5"
                        />
                    `;

                }
            )
            .join(
                ""
            );

    const arrows =
        (
            frame?.arrows ||
            []
        )
            .map(
                arrow => {

                    const x1 =
                        arrow.x1 *
                        width;

                    const y1 =
                        arrow.y1 *
                        height;

                    const x2 =
                        arrow.x2 *
                        width;

                    const y2 =
                        arrow.y2 *
                        height;

                    const color =
                        arrow.color ||
                        "#ffffff";

                    const dash =
                        arrow.style ===
                            "pass"
                            ? "10 7"
                            : (
                                arrow.style ===
                                "dribble"
                                    ? "4 7"
                                    : ""
                            );

                    return `
                        <line
                            x1="${x1}"
                            y1="${y1}"
                            x2="${x2}"
                            y2="${y2}"
                            stroke="${color}"
                            stroke-width="${Number(arrow.width || 4)}"
                            stroke-linecap="round"
                            ${
                                dash
                                    ? `stroke-dasharray="${dash}"`
                                    : ""
                            }
                            marker-end="url(#${markerId})"
                        />
                    `;

                }
            )
            .join(
                ""
            );

    return `
        <defs>
            <marker
                id="${markerId}"
                markerWidth="9"
                markerHeight="9"
                refX="8"
                refY="4.5"
                orient="auto"
                markerUnits="strokeWidth"
            >
                <path
                    d="M0,0 L9,4.5 L0,9 z"
                    fill="context-stroke"
                />
            </marker>
        </defs>

        ${zones}
        ${arrows}
    `;

}


function s19PitchSvg(
    pitch,
    frame,
    index = 0
) {

    const width =
        1000;

    const height =
        562.5;

    const line =
        "#ffffff";

    const elements =
        (
            frame?.elements ||
            []
        )
            .map(
                element => {

                    const x =
                        Number(
                            element.x ??
                            .5
                        ) *
                        width;

                    const y =
                        Number(
                            element.y ??
                            .5
                        ) *
                        height;

                    const label =
                        s13Esc(
                            element.label ||
                            ""
                        );

                    switch (
                        element.type
                    ) {

                        case "cone":
                            return `
                                <polygon
                                    points="${x-10},${y+12} ${x+10},${y+12} ${x},${y-12}"
                                    fill="#FF9D28"
                                />
                            `;

                        case "ball":
                            return `
                                <circle
                                    cx="${x}"
                                    cy="${y}"
                                    r="10"
                                    fill="#fff"
                                    stroke="#111"
                                    stroke-width="3"
                                />
                            `;

                        case "goal":
                            return `
                                <rect
                                    x="${x-31}"
                                    y="${y-16}"
                                    width="62"
                                    height="32"
                                    fill="none"
                                    stroke="#fff"
                                    stroke-width="5"
                                />
                            `;

                        case "minigoal":
                            return `
                                <rect
                                    x="${x-22}"
                                    y="${y-11}"
                                    width="44"
                                    height="22"
                                    fill="none"
                                    stroke="#fff"
                                    stroke-width="4"
                                />
                            `;

                        case "mannequin":
                            return `
                                <rect
                                    x="${x-7}"
                                    y="${y-22}"
                                    width="14"
                                    height="44"
                                    rx="7"
                                    fill="#EBCB44"
                                    fill-opacity=".35"
                                    stroke="#EBCB44"
                                    stroke-width="4"
                                />
                            `;

                        case "text":
                            return `
                                <text
                                    x="${x}"
                                    y="${y}"
                                    text-anchor="middle"
                                    dominant-baseline="middle"
                                    fill="#fff"
                                    font-size="20"
                                    font-weight="900"
                                    font-family="Arial"
                                >
                                    ${label || "TEKST"}
                                </text>
                            `;

                        default: {

                            const colors = {
                                "player-blue":
                                    "#2778FF",
                                "player-red":
                                    "#E44646",
                                "player-yellow":
                                    "#E8BF35",
                                "player-green":
                                    "#37A35B"
                            };

                            const fill =
                                colors[
                                    element.type
                                ] ||
                                "#2778FF";

                            const textColor =
                                element.type ===
                                    "player-yellow"
                                    ? "#111"
                                    : "#fff";

                            return `
                                <circle
                                    cx="${x}"
                                    cy="${y}"
                                    r="18"
                                    fill="${fill}"
                                    stroke="#fff"
                                    stroke-width="4"
                                />

                                ${
                                    label
                                        ? `
                                            <text
                                                x="${x}"
                                                y="${y+1}"
                                                text-anchor="middle"
                                                dominant-baseline="middle"
                                                fill="${textColor}"
                                                font-size="14"
                                                font-weight="900"
                                                font-family="Arial"
                                            >
                                                ${label}
                                            </text>
                                        `
                                        : ""
                                }
                            `;

                        }

                    }

                }
            )
            .join(
                ""
            );

    const pitchLines =
        pitch ===
        "plain"
            ? ""
            : `
                <rect
                    x="45"
                    y="35"
                    width="910"
                    height="492.5"
                    fill="none"
                    stroke="${line}"
                    stroke-opacity=".72"
                    stroke-width="4"
                />

                ${
                    pitch ===
                    "full"
                        ? `
                            <line
                                x1="500"
                                y1="35"
                                x2="500"
                                y2="527.5"
                                stroke="${line}"
                                stroke-opacity=".68"
                                stroke-width="4"
                            />

                            <circle
                                cx="500"
                                cy="281.25"
                                r="72"
                                fill="none"
                                stroke="${line}"
                                stroke-opacity=".68"
                                stroke-width="4"
                            />
                        `
                        : ""
                }
            `;

    return `
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 ${width} ${height}"
            width="100%"
            style="
                display:block;
                border-radius:10px;
                background:#176733;
            "
        >
            <defs>
                <pattern
                    id="grass_${index}"
                    width="200"
                    height="562.5"
                    patternUnits="userSpaceOnUse"
                >
                    <rect
                        width="100"
                        height="562.5"
                        fill="rgba(255,255,255,.022)"
                    />
                    <rect
                        x="100"
                        width="100"
                        height="562.5"
                        fill="rgba(0,0,0,.022)"
                    />
                </pattern>
            </defs>

            <rect
                width="1000"
                height="562.5"
                fill="#176733"
            />

            <rect
                width="1000"
                height="562.5"
                fill="url(#grass_${index})"
            />

            ${pitchLines}

            ${s19DiagramSvgInner(
                frame,
                {
                    width,
                    height,
                    markerId:
                        `s19ArrowHeadPdf_${index}`
                }
            )}

            ${elements}
        </svg>
    `;

}


/* =========================================================
   EXERCISE BOARD – STATE / HISTORY
========================================================= */

const s19DiagramState = {
    selectedId:
        null,

    tool:
        "select",

    color:
        "#ffffff",

    drag:
        null,

    draw:
        null,

    history:
        [],

    redo:
        []
};


function s19DiagramSnapshot(
    exercise
) {

    if (!exercise) {
        return;
    }

    s19DiagramState.history.push(
        JSON.stringify(
            exercise.diagram
        )
    );

    if (
        s19DiagramState.history.length >
        35
    ) {
        s19DiagramState.history.shift();
    }

    s19DiagramState.redo =
        [];

}


function s19DiagramUndo(
    exercise
) {

    if (
        !exercise ||
        !s19DiagramState.history.length
    ) {
        return;
    }

    s19DiagramState.redo.push(
        JSON.stringify(
            exercise.diagram
        )
    );

    exercise.diagram =
        JSON.parse(
            s19DiagramState.history.pop()
        );

    s19DiagramState.selectedId =
        null;

    s13Save();

    s19RenderDiagramBoard(
        exercise
    );

}


function s19DiagramRedo(
    exercise
) {

    if (
        !exercise ||
        !s19DiagramState.redo.length
    ) {
        return;
    }

    s19DiagramState.history.push(
        JSON.stringify(
            exercise.diagram
        )
    );

    exercise.diagram =
        JSON.parse(
            s19DiagramState.redo.pop()
        );

    s19DiagramState.selectedId =
        null;

    s13Save();

    s19RenderDiagramBoard(
        exercise
    );

}


/* =========================================================
   EXERCISE BOARD – OBJECT OPERATIONS
========================================================= */

function s19AddDiagramElement(
    exercise,
    type,
    x = .5,
    y = .5
) {

    const frame =
        s19DiagramFrame(
            exercise
        );

    if (!frame) {
        return;
    }

    s19DiagramSnapshot(
        exercise
    );

    let label =
        "";

    if (
        type ===
        "text"
    ) {

        const entered =
            window.prompt(
                "Tekst:",
                "FOKUS"
            );

        if (
            entered ===
            null
        ) {
            return;
        }

        label =
            entered.trim();

    }

    const playerTypes =
        [
            "player-blue",
            "player-red",
            "player-yellow",
            "player-green"
        ];

    if (
        playerTypes.includes(
            type
        )
    ) {

        const count =
            frame.elements.filter(
                element =>
                    element.type ===
                    type
            ).length;

        label =
            String(
                count +
                1
            );

    }

    const element = {
        id:
            s19Uid(
                "diagram-element"
            ),

        type,

        x,
        y,

        label,

        rotation:
            0
    };

    frame.elements.push(
        element
    );

    s19DiagramState.selectedId =
        element.id;

    s13Save();

    s19RenderDiagramBoard(
        exercise
    );

}


function s19DeleteSelectedDiagramItem(
    exercise
) {

    const frame =
        s19DiagramFrame(
            exercise
        );

    const id =
        s19DiagramState.selectedId;

    if (
        !frame ||
        !id
    ) {
        return;
    }

    s19DiagramSnapshot(
        exercise
    );

    frame.elements =
        frame.elements.filter(
            item =>
                item.id !==
                id
        );

    frame.arrows =
        frame.arrows.filter(
            item =>
                item.id !==
                id
        );

    frame.zones =
        frame.zones.filter(
            item =>
                item.id !==
                id
        );

    s19DiagramState.selectedId =
        null;

    s13Save();

    s19RenderDiagramBoard(
        exercise
    );

}


function s19DuplicateSelectedDiagramItem(
    exercise
) {

    const frame =
        s19DiagramFrame(
            exercise
        );

    const id =
        s19DiagramState.selectedId;

    if (
        !frame ||
        !id
    ) {
        return;
    }

    const element =
        frame.elements.find(
            item =>
                item.id ===
                id
        );

    if (!element) {
        return;
    }

    s19DiagramSnapshot(
        exercise
    );

    const copy = {
        ...s19Clone(
            element
        ),

        id:
            s19Uid(
                "diagram-element"
            ),

        x:
            s19Clamp01(
                element.x +
                .035
            ),

        y:
            s19Clamp01(
                element.y +
                .035
            )
    };

    frame.elements.push(
        copy
    );

    s19DiagramState.selectedId =
        copy.id;

    s13Save();

    s19RenderDiagramBoard(
        exercise
    );

}


function s19Clamp01(
    value
) {

    return Math.max(
        0.02,
        Math.min(
            .98,
            Number(
                value ||
                0
            )
        )
    );

}


function s19Rondo4v2(
    exercise
) {

    const frame =
        s19DiagramFrame(
            exercise
        );

    if (!frame) {
        return;
    }

    s19DiagramSnapshot(
        exercise
    );

    frame.elements =
        [];

    frame.arrows =
        [];

    frame.zones =
        [];

    const add = (
        type,
        x,
        y,
        label = ""
    ) => {

        frame.elements.push({
            id:
                s19Uid(
                    "diagram-element"
                ),

            type,
            x,
            y,
            label,
            rotation:
                0
        });

    };

    /*
        Kegler – firkant.
    */
    [
        [.28,.20],
        [.72,.20],
        [.72,.80],
        [.28,.80]
    ]
        .forEach(
            (
                [
                    x,
                    y
                ]
            ) =>
                add(
                    "cone",
                    x,
                    y
                )
        );

    /*
        4 boldholdere.
    */
    [
        [.50,.18],
        [.78,.50],
        [.50,.82],
        [.22,.50]
    ]
        .forEach(
            (
                [
                    x,
                    y
                ],
                index
            ) =>
                add(
                    "player-blue",
                    x,
                    y,
                    String(
                        index +
                        1
                    )
                )
        );

    /*
        2 presspillere.
    */
    add(
        "player-red",
        .43,
        .47,
        "1"
    );

    add(
        "player-red",
        .57,
        .53,
        "2"
    );

    add(
        "ball",
        .50,
        .18
    );

    s13Save();

    s19RenderDiagramBoard(
        exercise
    );

}


/* =========================================================
   EXERCISE BOARD – FRAME OPERATIONS
========================================================= */

function s19AddDiagramFrame(
    exercise,
    duplicate = true
) {

    if (!exercise) {
        return;
    }

    exercise.diagram =
        s19NormalizeDiagram(
            exercise.diagram
        );

    s19DiagramSnapshot(
        exercise
    );

    const current =
        s19DiagramFrame(
            exercise
        );

    const frame =
        duplicate
            ? {
                ...s19Clone(
                    current
                ),

                id:
                    s19Uid(
                        "diagram-frame"
                    )
            }
            : s19EmptyFrame();

    frame.title =
        `Trin ${exercise.diagram.frames.length + 1}`;

    exercise.diagram.frames.push(
        frame
    );

    exercise.diagram.activeFrame =
        exercise.diagram.frames.length -
        1;

    s19DiagramState.selectedId =
        null;

    s13Save();

    s19RenderDiagramBoard(
        exercise
    );

}


function s19DeleteDiagramFrame(
    exercise
) {

    if (
        !exercise ||
        exercise.diagram.frames.length <=
        1
    ) {

        visNotification?.(
            "Øvelsen skal have mindst ét trin."
        );

        return;
    }

    s19DiagramSnapshot(
        exercise
    );

    exercise.diagram.frames.splice(
        exercise.diagram.activeFrame,
        1
    );

    exercise.diagram.activeFrame =
        Math.max(
            0,
            exercise.diagram.activeFrame -
            1
        );

    s19DiagramState.selectedId =
        null;

    s13Save();

    s19RenderDiagramBoard(
        exercise
    );

}


/* =========================================================
   EXERCISE BOARD – RENDER
========================================================= */

function s19RenderDiagramBoard(
    exercise
) {

    const host =
        document.getElementById(
            "s19DiagramHost"
        );

    if (
        !host ||
        !exercise
    ) {
        return;
    }

    exercise.diagram =
        s19NormalizeDiagram(
            exercise.diagram
        );

    const frame =
        s19DiagramFrame(
            exercise
        );

    const pitch =
        exercise.diagram.pitch ||
        "plain";

    host.innerHTML = `

        <div class="s19-diagram-top">

            <div>

                <div
                    style="
                        font-size:9px;
                        font-weight:950;
                    "
                >
                    GRAFISK ØVELSESTEGNER
                </div>

                <div class="s13mut">
                    Byg øvelsen direkte i START11. Diagrammet følger med i PDF'en.
                </div>

            </div>


            <div class="s19-diagram-tools">

                <select
                    id="s19PitchType"
                    class="s13sel"
                    style="width:110px;"
                >
                    <option
                        value="plain"
                        ${
                            pitch ===
                            "plain"
                                ? "selected"
                                : ""
                        }
                    >
                        FRI FLATE
                    </option>

                    <option
                        value="full"
                        ${
                            pitch ===
                            "full"
                                ? "selected"
                                : ""
                        }
                    >
                        HEL BANE
                    </option>

                    <option
                        value="half"
                        ${
                            pitch ===
                            "half"
                                ? "selected"
                                : ""
                        }
                    >
                        HALV BANE
                    </option>
                </select>

                <button
                    type="button"
                    id="s19RondoTemplate"
                    class="s19-dtool"
                >
                    4v2 RONDO
                </button>

                <button
                    type="button"
                    id="s19DiagramUndo"
                    class="s19-dtool"
                >
                    ↶
                </button>

                <button
                    type="button"
                    id="s19DiagramRedo"
                    class="s19-dtool"
                >
                    ↷
                </button>

            </div>

        </div>


        <div class="s19-diagram-tools">

            <button
                type="button"
                class="s19-dtool"
                data-add-diagram="player-blue"
            >
                + BLÅ
            </button>

            <button
                type="button"
                class="s19-dtool"
                data-add-diagram="player-red"
            >
                + RØD
            </button>

            <button
                type="button"
                class="s19-dtool"
                data-add-diagram="player-yellow"
            >
                + GUL
            </button>

            <button
                type="button"
                class="s19-dtool"
                data-add-diagram="cone"
            >
                + KEGLE
            </button>

            <button
                type="button"
                class="s19-dtool"
                data-add-diagram="ball"
            >
                + BOLD
            </button>

            <button
                type="button"
                class="s19-dtool"
                data-add-diagram="minigoal"
            >
                + SMÅMÅL
            </button>

            <button
                type="button"
                class="s19-dtool"
                data-add-diagram="goal"
            >
                + MÅL
            </button>

            <button
                type="button"
                class="s19-dtool"
                data-add-diagram="mannequin"
            >
                + DUMMY
            </button>

            <button
                type="button"
                class="s19-dtool"
                data-add-diagram="text"
            >
                + TEKST
            </button>

            <button
                type="button"
                class="
                    s19-dtool
                    ${
                        s19DiagramState.tool ===
                        "run"
                            ? "active"
                            : ""
                    }
                "
                data-diagram-tool="run"
            >
                LØB →
            </button>

            <button
                type="button"
                class="
                    s19-dtool
                    ${
                        s19DiagramState.tool ===
                        "pass"
                            ? "active"
                            : ""
                    }
                "
                data-diagram-tool="pass"
            >
                AFLEV. ⇢
            </button>

            <button
                type="button"
                class="
                    s19-dtool
                    ${
                        s19DiagramState.tool ===
                        "dribble"
                            ? "active"
                            : ""
                    }
                "
                data-diagram-tool="dribble"
            >
                DRIBLING
            </button>

            <button
                type="button"
                class="
                    s19-dtool
                    ${
                        s19DiagramState.tool ===
                        "zone"
                            ? "active"
                            : ""
                    }
                "
                data-diagram-tool="zone"
            >
                ZONE
            </button>

            <button
                type="button"
                class="
                    s19-dtool
                    ${
                        s19DiagramState.tool ===
                        "select"
                            ? "active"
                            : ""
                    }
                "
                data-diagram-tool="select"
            >
                VÆLG
            </button>

            <input
                id="s19DiagramColor"
                type="color"
                value="${
                    s19DiagramState.color
                }"
                title="Farve"
                style="
                    width:34px;
                    height:31px;
                    border:0;
                    background:transparent;
                "
            >

            <button
                type="button"
                id="s19DiagramDuplicate"
                class="s19-dtool"
            >
                KOPIÉR
            </button>

            <button
                type="button"
                id="s19DiagramDelete"
                class="s19-dtool"
            >
                SLET
            </button>

        </div>


        <div
            id="s19DiagramBoard"
            class="
                s19-board-wrap
                pitch-${pitch}
            "
            style="margin-top:8px;"
        >

            <div class="s19-board-grass"></div>
            <div class="s19-board-lines"></div>
            <div class="s19-board-midline"></div>
            <div class="s19-board-circle"></div>

            <svg
                id="s19DiagramSvg"
                viewBox="0 0 1000 562.5"
                preserveAspectRatio="none"
            >
                ${
                    s19DiagramSvgInner(
                        frame,
                        {
                            width:
                                1000,

                            height:
                                562.5,

                            markerId:
                                "s19ArrowHeadLive"
                        }
                    )
                }
            </svg>

            ${
                frame.elements
                    .map(
                        s19DiagramElementHtml
                    )
                    .join(
                        ""
                    )
            }

        </div>


        <div class="s19-frame-bar">

            ${
                exercise.diagram.frames
                    .map(
                        (
                            item,
                            index
                        ) => `
                            <button
                                type="button"
                                class="
                                    s19-frame-pill
                                    ${
                                        index ===
                                        exercise.diagram.activeFrame
                                            ? "active"
                                            : ""
                                    }
                                "
                                data-diagram-frame="${index}"
                            >
                                ${
                                    s13Esc(
                                        item.title ||
                                        `Trin ${index + 1}`
                                    )
                                }
                            </button>
                        `
                    )
                    .join(
                        ""
                    )
            }

            <button
                type="button"
                id="s19AddFrame"
                class="s19-frame-pill"
            >
                + NÆSTE TRIN
            </button>

            <button
                type="button"
                id="s19DeleteFrame"
                class="s19-frame-pill"
            >
                SLET TRIN
            </button>

        </div>


        <div class="s19-board-property">

            <label class="s13field">
                Navn på trin

                <input
                    id="s19FrameTitle"
                    class="s13in"
                    value="${
                        s13Esc(
                            frame.title ||
                            ""
                        )
                    }"
                >
            </label>

            <label class="s13field">
                Varighed / pause (sek)

                <input
                    id="s19FrameDuration"
                    class="s13in"
                    type="number"
                    min="0"
                    step=".5"
                    value="${
                        Number(
                            frame.duration ||
                            0
                        )
                    }"
                >
            </label>

            <div class="s13field">
                Valgt objekt

                <div
                    class="s13in"
                    style="
                        display:flex;
                        align-items:center;
                    "
                >
                    ${
                        s19DiagramState.selectedId
                            ? "Valgt"
                            : "Intet valgt"
                    }
                </div>
            </div>

        </div>


        <div class="s19-board-hint">
            Træk spillere og udstyr direkte rundt på banen.
            Vælg LØB, AFLEVERING, DRIBLING eller ZONE og træk på banen for at tegne.
            Flere trin kan bruges til at vise bevægelsen i øvelsen.
        </div>
    `;

    s19BindDiagramBoard(
        exercise
    );

}


/* =========================================================
   EXERCISE BOARD – POINTER EVENTS
========================================================= */

function s19BoardPoint(
    event,
    board
) {

    const rect =
        board.getBoundingClientRect();

    return {
        x:
            s19Clamp01(
                (
                    event.clientX -
                    rect.left
                ) /
                rect.width
            ),

        y:
            s19Clamp01(
                (
                    event.clientY -
                    rect.top
                ) /
                rect.height
            )
    };

}


function s19BindDiagramBoard(
    exercise
) {

    const board =
        document.getElementById(
            "s19DiagramBoard"
        );

    if (
        !board ||
        !exercise
    ) {
        return;
    }

    const frame =
        s19DiagramFrame(
            exercise
        );

    document.querySelectorAll(
        "[data-add-diagram]"
    )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () =>
                        s19AddDiagramElement(
                            exercise,
                            button.dataset
                                .addDiagram,
                            .5 +
                            (
                                Math.random() -
                                .5
                            ) *
                            .12,
                            .5 +
                            (
                                Math.random() -
                                .5
                            ) *
                            .12
                        )
                );

            }
        );

    document.querySelectorAll(
        "[data-diagram-tool]"
    )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        s19DiagramState.tool =
                            button.dataset
                                .diagramTool;

                        s19RenderDiagramBoard(
                            exercise
                        );

                    }
                );

            }
        );

    document.getElementById(
        "s19DiagramColor"
    )
        ?.addEventListener(
            "input",
            event => {

                s19DiagramState.color =
                    event.target.value;

            }
        );

    document.getElementById(
        "s19PitchType"
    )
        ?.addEventListener(
            "change",
            event => {

                s19DiagramSnapshot(
                    exercise
                );

                exercise.diagram.pitch =
                    event.target.value;

                s13Save();

                s19RenderDiagramBoard(
                    exercise
                );

            }
        );

    document.getElementById(
        "s19RondoTemplate"
    )
        ?.addEventListener(
            "click",
            () =>
                s19Rondo4v2(
                    exercise
                )
        );

    document.getElementById(
        "s19DiagramUndo"
    )
        ?.addEventListener(
            "click",
            () =>
                s19DiagramUndo(
                    exercise
                )
        );

    document.getElementById(
        "s19DiagramRedo"
    )
        ?.addEventListener(
            "click",
            () =>
                s19DiagramRedo(
                    exercise
                )
        );

    document.getElementById(
        "s19DiagramDelete"
    )
        ?.addEventListener(
            "click",
            () =>
                s19DeleteSelectedDiagramItem(
                    exercise
                )
        );

    document.getElementById(
        "s19DiagramDuplicate"
    )
        ?.addEventListener(
            "click",
            () =>
                s19DuplicateSelectedDiagramItem(
                    exercise
                )
        );

    document.getElementById(
        "s19AddFrame"
    )
        ?.addEventListener(
            "click",
            () =>
                s19AddDiagramFrame(
                    exercise,
                    true
                )
        );

    document.getElementById(
        "s19DeleteFrame"
    )
        ?.addEventListener(
            "click",
            () =>
                s19DeleteDiagramFrame(
                    exercise
                )
        );

    document.querySelectorAll(
        "[data-diagram-frame]"
    )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        exercise.diagram.activeFrame =
                            Number(
                                button.dataset
                                    .diagramFrame
                            );

                        s19DiagramState.selectedId =
                            null;

                        s13Save();

                        s19RenderDiagramBoard(
                            exercise
                        );

                    }
                );

            }
        );

    document.getElementById(
        "s19FrameTitle"
    )
        ?.addEventListener(
            "change",
            event => {

                frame.title =
                    event.target.value.trim() ||
                    `Trin ${exercise.diagram.activeFrame + 1}`;

                s13Save();

                s19RenderDiagramBoard(
                    exercise
                );

            }
        );

    document.getElementById(
        "s19FrameDuration"
    )
        ?.addEventListener(
            "change",
            event => {

                frame.duration =
                    Number(
                        event.target.value ||
                        0
                    );

                s13Save();

            }
        );


    /*
        DRAG ELEMENTS
    */
    board.querySelectorAll(
        "[data-diagram-element]"
    )
        .forEach(
            elementNode => {

                elementNode.addEventListener(
                    "pointerdown",
                    event => {

                        if (
                            s19DiagramState.tool !==
                            "select"
                        ) {
                            return;
                        }

                        event.stopPropagation();
                        event.preventDefault();

                        const id =
                            elementNode.dataset
                                .diagramElement;

                        const item =
                            frame.elements.find(
                                element =>
                                    element.id ===
                                    id
                            );

                        if (!item) {
                            return;
                        }

                        s19DiagramState.selectedId =
                            id;

                        s19DiagramSnapshot(
                            exercise
                        );

                        s19DiagramState.drag = {
                            id,
                            pointerId:
                                event.pointerId
                        };

                        elementNode.setPointerCapture?.(
                            event.pointerId
                        );

                        elementNode.classList.add(
                            "selected"
                        );

                    }
                );

                elementNode.addEventListener(
                    "pointermove",
                    event => {

                        if (
                            !s19DiagramState.drag ||
                            s19DiagramState.drag.id !==
                            elementNode.dataset
                                .diagramElement
                        ) {
                            return;
                        }

                        const point =
                            s19BoardPoint(
                                event,
                                board
                            );

                        const item =
                            frame.elements.find(
                                element =>
                                    element.id ===
                                    s19DiagramState.drag.id
                            );

                        if (!item) {
                            return;
                        }

                        item.x =
                            point.x;

                        item.y =
                            point.y;

                        elementNode.style.left =
                            point.x *
                            100 +
                            "%";

                        elementNode.style.top =
                            point.y *
                            100 +
                            "%";

                    }
                );

                elementNode.addEventListener(
                    "pointerup",
                    event => {

                        if (
                            !s19DiagramState.drag
                        ) {
                            return;
                        }

                        s19DiagramState.drag =
                            null;

                        s13Save();

                        s19RenderDiagramBoard(
                            exercise
                        );

                    }
                );

                elementNode.addEventListener(
                    "dblclick",
                    event => {

                        event.preventDefault();
                        event.stopPropagation();

                        const item =
                            frame.elements.find(
                                element =>
                                    element.id ===
                                    elementNode.dataset
                                        .diagramElement
                            );

                        if (!item) {
                            return;
                        }

                        if (
                            item.type.startsWith(
                                "player-"
                            ) ||
                            item.type ===
                            "text"
                        ) {

                            const label =
                                window.prompt(
                                    "Tekst / nummer:",
                                    item.label ||
                                    ""
                                );

                            if (
                                label !==
                                null
                            ) {

                                s19DiagramSnapshot(
                                    exercise
                                );

                                item.label =
                                    label.trim();

                                s13Save();

                                s19RenderDiagramBoard(
                                    exercise
                                );

                            }

                        }

                    }
                );

            }
        );


    /*
        TEGN PILE / ZONER
    */
    board.addEventListener(
        "pointerdown",
        event => {

            if (
                event.target.closest(
                    "[data-diagram-element]"
                )
            ) {
                return;
            }

            if (
                s19DiagramState.tool ===
                "select"
            ) {

                s19DiagramState.selectedId =
                    null;

                s19RenderDiagramBoard(
                    exercise
                );

                return;
            }

            const start =
                s19BoardPoint(
                    event,
                    board
                );

            s19DiagramState.draw = {
                start,
                end:
                    start
            };

            board.setPointerCapture?.(
                event.pointerId
            );

        }
    );

    board.addEventListener(
        "pointermove",
        event => {

            if (
                !s19DiagramState.draw
            ) {
                return;
            }

            s19DiagramState.draw.end =
                s19BoardPoint(
                    event,
                    board
                );

        }
    );

    board.addEventListener(
        "pointerup",
        event => {

            if (
                !s19DiagramState.draw
            ) {
                return;
            }

            const start =
                s19DiagramState.draw
                    .start;

            const end =
                s19BoardPoint(
                    event,
                    board
                );

            s19DiagramState.draw =
                null;

            s19DiagramSnapshot(
                exercise
            );

            if (
                s19DiagramState.tool ===
                "zone"
            ) {

                const zone = {
                    id:
                        s19Uid(
                            "diagram-zone"
                        ),

                    x1:
                        start.x,

                    y1:
                        start.y,

                    x2:
                        end.x,

                    y2:
                        end.y,

                    color:
                        s19DiagramState.color
                };

                frame.zones.push(
                    zone
                );

                s19DiagramState.selectedId =
                    zone.id;

            } else {

                const arrow = {
                    id:
                        s19Uid(
                            "diagram-arrow"
                        ),

                    x1:
                        start.x,

                    y1:
                        start.y,

                    x2:
                        end.x,

                    y2:
                        end.y,

                    style:
                        s19DiagramState.tool,

                    color:
                        s19DiagramState.color,

                    width:
                        4
                };

                frame.arrows.push(
                    arrow
                );

                s19DiagramState.selectedId =
                    arrow.id;

            }

            s19DiagramState.tool =
                "select";

            s13Save();

            s19RenderDiagramBoard(
                exercise
            );

        }
    );

}


/* =========================================================
   EXERCISE BOARD – INJECT INTO V17 EXERCISE EDITOR
========================================================= */

function s19InjectExerciseDesigner() {

    const exercise =
        s19ExerciseForDesigner();

    if (
        !exercise
    ) {
        return;
    }

    /*
        Put designer before media section if possible.
    */
    const mediaSection =
        document.querySelector(
            ".s17-media-section"
        );

    const saveArea =
        document.getElementById(
            "s17SaveExercise"
        )
            ?.parentElement;

    const parent =
        mediaSection
            ?.parentElement ||
        saveArea
            ?.parentElement;

    if (
        !parent
    ) {
        return;
    }

    let section =
        document.getElementById(
            "s19ExerciseDesigner"
        );

    if (!section) {

        section =
            document.createElement(
                "section"
            );

        section.id =
            "s19ExerciseDesigner";

        section.className =
            "s19-diagram-section";

        section.innerHTML = `
            <div id="s19DiagramHost"></div>
        `;

        if (
            mediaSection
        ) {

            parent.insertBefore(
                section,
                mediaSection
            );

        } else {

            parent.insertBefore(
                section,
                saveArea ||
                null
            );

        }

    }

    s19RenderDiagramBoard(
        exercise
    );

}


if (
    typeof s13Exercises ===
    "function"
) {

    const s19ExercisesBefore =
        s13Exercises;

    s13Exercises =
        function (
            target
        ) {

            const result =
                s19ExercisesBefore(
                    target
                );

            setTimeout(
                () => {

                    s19EnsureData();

                    s19InjectExerciseDesigner();

                },
                0
            );

            return result;

        };

}


/* =========================================================
   EXERCISE BOARD – PDF INTEGRATION
========================================================= */

if (
    typeof s17ExercisePdfMedia ===
    "function"
) {

    const s19PdfMediaBefore =
        s17ExercisePdfMedia;

    s17ExercisePdfMedia =
        async function (
            exercise
        ) {

            const media =
                await s19PdfMediaBefore(
                    exercise
                );

            const diagram =
                s19NormalizeDiagram(
                    exercise?.diagram
                );

            const frames =
                diagram.frames ||
                [];

            const diagramHtml =
                frames
                    .map(
                        (
                            frame,
                            index
                        ) => `
                            <div
                                style="
                                    margin-top:${index ? "4mm" : "0"};
                                    page-break-inside:avoid;
                                "
                            >
                                ${
                                    frames.length >
                                    1
                                        ? `
                                            <div
                                                style="
                                                    margin:0 0 1.5mm;
                                                    color:#666;
                                                    font-size:8px;
                                                    font-weight:900;
                                                    letter-spacing:.3px;
                                                "
                                            >
                                                ${
                                                    s13Esc(
                                                        frame.title ||
                                                        `TRIN ${index + 1}`
                                                    )
                                                }
                                                ${
                                                    Number(
                                                        frame.duration ||
                                                        0
                                                    )
                                                        ? ` · ${Number(frame.duration)} SEK`
                                                        : ""
                                                }
                                            </div>
                                        `
                                        : ""
                                }

                                ${
                                    s19PitchSvg(
                                        diagram.pitch,
                                        frame,
                                        index
                                    )
                                }
                            </div>
                        `
                    )
                    .join(
                        ""
                    );

            return {
                ...media,

                imageHtml:
                    (
                        diagramHtml
                            ? `
                                <div
                                    style="
                                        margin-bottom:4mm;
                                    "
                                >
                                    ${diagramHtml}
                                </div>
                            `
                            : ""
                    ) +
                    (
                        media.imageHtml ||
                        ""
                    )
            };

        };

}


/* =========================================================
   MATCH-SPECIFIC START11 – STATE
========================================================= */

const s19MatchMode = {
    active:
        false,

    key:
        "",

    match:
        null,

    baseWorkspace:
        null,

    enteredAt:
        null,

    saveTimer:
        null
};


/*
    Bevar V16's gamle kampplan-handler.
*/
const s19OpenLegacyMatchPlan =
    typeof start11CalendarApplyMatchToEditor ===
    "function"
        ? start11CalendarApplyMatchToEditor
        : null;


/* =========================================================
   MATCH-SPECIFIC START11 – HELPERS
========================================================= */

function s19MatchKey(
    match
) {

    if (
        typeof s16MatchPlanKey ===
        "function"
    ) {

        return s16MatchPlanKey(
            match
        );

    }

    const normalized =
        typeof start11CalendarNormalizeMatch ===
            "function"
            ? start11CalendarNormalizeMatch(
                match
            )
            : match;

    return String(
        normalized?.id ||
        normalized?.matchNumber ||
        [
            normalized?.date ||
                "",
            normalized?.home ||
                "",
            normalized?.away ||
                "",
            normalized?.time ||
                ""
        ]
            .join(
                "::"
            )
    );

}


function s19NormalizedMatch(
    match
) {

    return typeof start11CalendarNormalizeMatch ===
        "function"
        ? start11CalendarNormalizeMatch(
            match
        )
        : match;

}


function s19Opponent(
    match
) {

    const normalized =
        s19NormalizedMatch(
            match
        );

    if (
        typeof start11CalendarOpponent ===
        "function"
    ) {
        return start11CalendarOpponent(
            normalized
        );
    }

    const own =
        typeof start11CalendarTeamName ===
            "function"
            ? start11CalendarTeamName()
            : "";

    if (
        String(
            normalized?.home ||
            ""
        )
            .toLowerCase() ===
        String(
            own
        )
            .toLowerCase()
    ) {

        return normalized?.away ||
            "Modstander";

    }

    return normalized?.home ||
        "Modstander";

}


function s19SnapshotCurrentWorkspace() {

    return {
        spillere:
            s19Clone(
                spillere
            ),

        udskiftere:
            s19Clone(
                udskiftere
            ),

        formation:
            formationSelector.value ||
            currentFormation ||
            "4-4-2"
    };

}


function s19ApplyWorkspace(
    workspace
) {

    if (!workspace) {
        return;
    }

    spillere =
        Array.isArray(
            workspace.spillere
        )
            ? s19Clone(
                workspace.spillere
            )
            : Array(
                11
            )
                .fill(
                    null
                );

    udskiftere =
        Array.isArray(
            workspace.udskiftere
        )
            ? s19Clone(
                workspace.udskiftere
            )
            : [];

    currentFormation =
        workspace.formation ||
        "4-4-2";

    formationSelector.value =
        currentFormation;

    /*
        Her gemmer vi IKKE i localStorage.
        Match mode er kun en midlertidig editor.
    */
    tegnOpstilling();

    opdaterUdskiftere();

}


function s19MatchLineupRecord(
    key
) {

    s19EnsureData();

    return s13Data.matchLineups.find(
        item =>
            String(
                item.key
            ) ===
            String(
                key
            )
    ) ||
    null;

}


function s19CreateMatchLineupRecord(
    match,
    seed
) {

    const normalized =
        s19NormalizedMatch(
            match
        );

    const record = {
        id:
            s19Uid(
                "match-lineup"
            ),

        key:
            s19MatchKey(
                normalized
            ),

        matchId:
            normalized?.id ||
            "",

        date:
            normalized?.date ||
            "",

        time:
            normalized?.time ||
            "",

        home:
            normalized?.home ||
            "",

        away:
            normalized?.away ||
            "",

        opponent:
            s19Opponent(
                normalized
            ),

        status:
            "planned",

        formation:
            seed?.formation ||
            formationSelector.value ||
            "4-4-2",

        spillere:
            s19Clone(
                seed?.spillere ||
                spillere
            ),

        udskiftere:
            s19Clone(
                seed?.udskiftere ||
                udskiftere
            ),

        createdAt:
            new Date()
                .toISOString(),

        updatedAt:
            new Date()
                .toISOString()
    };

    s13Data.matchLineups.push(
        record
    );

    s13Save();

    return record;

}


function s19SaveActiveMatchLineup(
    notify = false
) {

    if (
        !s19MatchMode.active ||
        !s19MatchMode.key
    ) {
        return;
    }

    let record =
        s19MatchLineupRecord(
            s19MatchMode.key
        );

    if (!record) {

        record =
            s19CreateMatchLineupRecord(
                s19MatchMode.match,
                s19SnapshotCurrentWorkspace()
            );

    }

    record.formation =
        formationSelector.value ||
        currentFormation ||
        "4-4-2";

    record.spillere =
        s19Clone(
            spillere
        );

    record.udskiftere =
        s19Clone(
            udskiftere
        );

    record.updatedAt =
        new Date()
            .toISOString();

    s13Save();

    if (
        typeof scheduleCloudSave ===
        "function"
    ) {
        scheduleCloudSave();
    }

    s19UpdateMatchBar(
        notify
            ? "GEMT"
            : "AUTO-GEMT"
    );

    if (
        notify
    ) {

        visNotification?.(
            "Kampopstillingen er gemt."
        );

    }

}


function s19LatestPreviousLineup(
    currentMatch
) {

    const current =
        s19NormalizedMatch(
            currentMatch
        );

    const currentDate =
        String(
            current?.date ||
            ""
        );

    return [
        ...(
            s13Data.matchLineups ||
            []
        )
    ]
        .filter(
            record =>
                record.key !==
                    s19MatchMode.key &&
                (
                    !currentDate ||
                    !record.date ||
                    record.date <=
                    currentDate
                )
        )
        .sort(
            (
                a,
                b
            ) =>
                String(
                    b.date ||
                    b.updatedAt ||
                    ""
                )
                    .localeCompare(
                        String(
                            a.date ||
                            a.updatedAt ||
                            ""
                        )
                    )
        )[0] ||
        null;

}


/* =========================================================
   MATCH-SPECIFIC START11 – BAR
========================================================= */

function s19EnsureMatchBar() {

    let bar =
        document.getElementById(
            "s19MatchModeBar"
        );

    if (
        bar
    ) {
        return bar;
    }

    bar =
        document.createElement(
            "div"
        );

    bar.id =
        "s19MatchModeBar";

    /*
        Læg den lige før hovedindholdet når muligt.
    */
    const anchor =
        document.querySelector(
            "main"
        ) ||
        document.body.firstElementChild;

    if (
        anchor?.parentElement
    ) {

        anchor.parentElement.insertBefore(
            bar,
            anchor
        );

    } else {

        document.body.prepend(
            bar
        );

    }

    return bar;

}


function s19UpdateMatchBar(
    stateText = ""
) {

    const bar =
        s19EnsureMatchBar();

    if (
        !s19MatchMode.active
    ) {

        bar.classList.remove(
            "open"
        );

        return;
    }

    const match =
        s19NormalizedMatch(
            s19MatchMode.match
        );

    const opponent =
        s19Opponent(
            match
        );

    const record =
        s19MatchLineupRecord(
            s19MatchMode.key
        );

    bar.innerHTML = `

        <div class="s19-match-context">

            <div class="s19-match-badge">
                KAMP
            </div>

            <div
                style="
                    min-width:0;
                "
            >

                <div class="s19-match-title">
                    START11 · ${
                        s13Esc(
                            opponent
                        )
                    }
                </div>

                <div class="s19-match-sub">
                    ${
                        match?.date
                            ? s13Date(
                                match.date
                            )
                            : ""
                    }
                    ${
                        match?.time
                            ? ` · ${s13Esc(
                                match.time
                            )}`
                            : ""
                    }
                    ${
                        match?.place
                            ? ` · ${s13Esc(
                                match.place
                            )}`
                            : ""
                    }
                </div>

            </div>

            <div
                class="s19-match-save-state"
                id="s19MatchSaveState"
            >
                ${
                    stateText ||
                    (
                        record
                            ? "KAMP-SPECIFIK OPSTILLING"
                            : "NY KAMPPLAN"
                    )
                }
            </div>

        </div>


        <div class="s19-match-actions">

            <button
                type="button"
                id="s19MatchCopyPrevious"
                class="s13btn"
            >
                KOPIÉR SENESTE XI
            </button>

            <button
                type="button"
                id="s25MatchSituationsButton"
                class="s13btn"
            >
                KAMPSITUATIONER
            </button>

            <button
                type="button"
                id="s19MatchPlanButton"
                class="s13btn"
            >
                KAMPPLAN / PDF
            </button>

            <button
                type="button"
                id="s19MatchSaveButton"
                class="s13btn primary"
            >
                GEM OPSTILLING
            </button>

            <button
                type="button"
                id="s19MatchExitButton"
                class="s13btn"
            >
                AFSLUT KAMP
            </button>

        </div>
    `;

    bar.classList.add(
        "open"
    );

    document.getElementById(
        "s19MatchSaveButton"
    )
        ?.addEventListener(
            "click",
            () =>
                s19SaveActiveMatchLineup(
                    true
                )
        );

    document.getElementById(
        "s19MatchExitButton"
    )
        ?.addEventListener(
            "click",
            () =>
                s19ExitMatchMode(
                    true
                )
        );

    document.getElementById(
        "s25MatchSituationsButton"
    )
        ?.addEventListener(
            "click",
            () => {
                if (typeof window.s25OpenMatchSituations === "function") {
                    window.s25OpenMatchSituations();
                }
            }
        );


    document.getElementById(
        "s19MatchPlanButton"
    )
        ?.addEventListener(
            "click",
            () => {

                s19SaveActiveMatchLineup();

                if (
                    typeof s19OpenLegacyMatchPlan ===
                    "function"
                ) {

                    s19OpenLegacyMatchPlan(
                        s19MatchMode.match
                    );

                }

            }
        );

    document.getElementById(
        "s19MatchCopyPrevious"
    )
        ?.addEventListener(
            "click",
            () => {

                const previous =
                    s19LatestPreviousLineup(
                        s19MatchMode.match
                    );

                if (
                    !previous
                ) {

                    visNotification?.(
                        "Der findes ingen tidligere kampopstilling at kopiere."
                    );

                    return;
                }

                if (
                    !window.confirm(
                        `Kopiér opstillingen fra ${previous.opponent || "seneste kamp"}?`
                    )
                ) {
                    return;
                }

                s19ApplyWorkspace({
                    formation:
                        previous.formation,

                    spillere:
                        previous.spillere,

                    udskiftere:
                        previous.udskiftere
                });

                s19SaveActiveMatchLineup(
                    true
                );

            }
        );

}


/* =========================================================
   MATCH-SPECIFIC START11 – ENTER / EXIT
========================================================= */

function s19EnterMatchMode(
    match
) {

    s19EnsureData();

    const normalized =
        s19NormalizedMatch(
            match
        );

    const key =
        s19MatchKey(
            normalized
        );

    /*
        Hvis vi allerede er i en anden kamp:
        gem den først, men behold base-workspace.
    */
    if (
        s19MatchMode.active
    ) {

        s19SaveActiveMatchLineup();

    } else {

        s19MatchMode.baseWorkspace =
            s19SnapshotCurrentWorkspace();

    }

    let record =
        s19MatchLineupRecord(
            key
        );

    if (!record) {

        record =
            s19CreateMatchLineupRecord(
                normalized,
                s19MatchMode.baseWorkspace
            );

    }

    s19MatchMode.active =
        true;

    s19MatchMode.key =
        key;

    s19MatchMode.match =
        normalized;

    s19MatchMode.enteredAt =
        new Date()
            .toISOString();

    s19ApplyWorkspace({
        formation:
            record.formation,

        spillere:
            record.spillere,

        udskiftere:
            record.udskiftere
    });

    s19UpdateMatchBar(
        "KAMP-SPECIFIK OPSTILLING"
    );

    /*
        Luk kalenderen og gå til START11-banen.
    */
    if (
        typeof start11CalendarSetOpen ===
        "function"
    ) {

        start11CalendarSetOpen(
            false
        );

    }

    const pitchTarget =
        document.getElementById(
            "pitch"
        )
            ?.closest(
                "section, .panel, .card, main, div"
            ) ||
        document.getElementById(
            "pitch"
        );

    setTimeout(
        () => {

            pitchTarget
                ?.scrollIntoView({
                    behavior:
                        "smooth",
                    block:
                        "start"
                });

        },
        50
    );

    visNotification?.(
        `Kampopstilling åbnet: ${s19Opponent(normalized)}`
    );

}


function s19ExitMatchMode(
    saveFirst = true
) {

    if (
        !s19MatchMode.active
    ) {
        return;
    }

    if (
        saveFirst
    ) {
        s19SaveActiveMatchLineup();
    }

    const base =
        s19MatchMode.baseWorkspace;

    s19MatchMode.active =
        false;

    s19MatchMode.key =
        "";

    s19MatchMode.match =
        null;

    s19MatchMode.enteredAt =
        null;

    s19MatchMode.baseWorkspace =
        null;

    if (
        base
    ) {

        s19ApplyWorkspace(
            base
        );

        /*
            Gendan holdets normale lokale arbejdskopi.
        */
        localStorage.setItem(
            "startopstillingSpillere",
            JSON.stringify(
                spillere
            )
        );

        localStorage.setItem(
            "startopstillingUdskiftere",
            JSON.stringify(
                udskiftere
            )
        );

        localStorage.setItem(
            "start11Formation",
            formationSelector.value
        );

    }

    s19UpdateMatchBar();

    visNotification?.(
        "Tilbage til holdets normale START11."
    );

}


/* =========================================================
   MATCH-SPECIFIC START11 – GEMALT OVERRIDE
========================================================= */

if (
    typeof gemAlt ===
    "function"
) {

    const s19GemAltBefore =
        gemAlt;

    gemAlt =
        function () {

            if (
                s19MatchMode.active
            ) {

                /*
                    Match-mode må IKKE overskrive holdets
                    normale START11 i localStorage/cloud.
                */
                clearTimeout(
                    s19MatchMode.saveTimer
                );

                s19MatchMode.saveTimer =
                    setTimeout(
                        () =>
                            s19SaveActiveMatchLineup(),
                        160
                    );

                return;

            }

            return s19GemAltBefore();

        };

}


/*
    Ekstra sikkerhedsnet:
    Hvis en anden funktion kalder collectTeamData direkte mens
    match-mode er åben, skal cloud stadig få holdets NORMALE XI.
*/
if (
    typeof collectTeamData ===
    "function"
) {

    const s19CollectBefore =
        collectTeamData;

    collectTeamData =
        function () {

            const collected =
                s19CollectBefore();

            if (
                !s19MatchMode.active ||
                !s19MatchMode.baseWorkspace
            ) {
                return collected;
            }

            return {
                ...collected,

                spillere:
                    s19Clone(
                        s19MatchMode.baseWorkspace
                            .spillere
                    ),

                udskiftere:
                    s19Clone(
                        s19MatchMode.baseWorkspace
                            .udskiftere
                    ),

                formation:
                    s19MatchMode.baseWorkspace
                        .formation
            };

        };

}


/*
    Holdskift: fjern kamp-mode uden at forsøge at gendanne det
    forrige holds workspace EFTER det nye hold er indlæst.
*/
if (
    typeof applyTeamData ===
    "function"
) {

    const s19ApplyTeamDataBefore =
        applyTeamData;

    applyTeamData =
        function (
            data
        ) {

            if (
                s19MatchMode.active
            ) {

                s19SaveActiveMatchLineup();

                s19MatchMode.active =
                    false;

                s19MatchMode.key =
                    "";

                s19MatchMode.match =
                    null;

                s19MatchMode.baseWorkspace =
                    null;

                s19UpdateMatchBar();

            }

            const result =
                s19ApplyTeamDataBefore(
                    data
                );

            setTimeout(
                s19EnsureData,
                0
            );

            return result;

        };

}


/* =========================================================
   MATCH-SPECIFIC START11 – CALENDAR CLICK OVERRIDE
========================================================= */

/*
    Fra V19 betyder klik på en kamp:
    ÅBN DEN KAMP-SPECIFIKKE START11.

    Den gamle kampplan findes stadig via knappen
    "KAMPPLAN / PDF" i match-mode baren.
*/
start11CalendarApplyMatchToEditor =
    function (
        match
    ) {

        s19EnterMatchMode(
            match
        );

    };


/* =========================================================
   MATCH-SPECIFIC START11 – VIS BADGE PÅ KALENDERKAMPE
========================================================= */

function s19DecorateCalendarMatchLineups() {

    s19EnsureData();

    const calendar =
        document.getElementById(
            "start11CalendarShell"
        );

    if (!calendar) {
        return;
    }

    /*
        Brug tekst/date mapping frem for at ændre eksisterende
        kalenderstruktur aggressivt.
    */
    const records =
        s13Data.matchLineups ||
        [];

    calendar.querySelectorAll(
        "button, [role='button'], .start11-calendar-day > div, .start11-calendar-match, .start11-calendar-month-match"
    )
        .forEach(
            node => {

                if (
                    node.querySelector?.(
                        ".s19-lineup-badge"
                    )
                ) {
                    return;
                }

                const text =
                    String(
                        node.textContent ||
                        ""
                    )
                        .toLowerCase();

                const match =
                    records.find(
                        record => {

                            const opponent =
                                String(
                                    record.opponent ||
                                    ""
                                )
                                    .toLowerCase();

                            return (
                                opponent &&
                                text.includes(
                                    opponent
                                )
                            );

                        }
                    );

                if (!match) {
                    return;
                }

                const badge =
                    document.createElement(
                        "span"
                    );

                badge.className =
                    "s19-lineup-badge";

                badge.textContent =
                    "START11";

                Object.assign(
                    badge.style,
                    {
                        display:
                            "inline-flex",

                        marginLeft:
                            "5px",

                        padding:
                            "2px 5px",

                        border:
                            "1px solid var(--s11-primary)",

                        borderRadius:
                            "999px",

                        color:
                            "var(--s11-primary)",

                        fontSize:
                            "6px",

                        fontWeight:
                            "950",

                        verticalAlign:
                            "middle"
                    }
                );

                node.appendChild(
                    badge
                );

            }
        );

}


/*
    Kalender render wrap – behold V15/V16 funktionalitet.
*/
if (
    typeof start11RenderCalendarV3 ===
    "function"
) {

    const s19RenderCalendarBefore =
        start11RenderCalendarV3;

    start11RenderCalendarV3 =
        function (
            ...args
        ) {

            const result =
                s19RenderCalendarBefore(
                    ...args
                );

            setTimeout(
                s19DecorateCalendarMatchLineups,
                50
            );

            return result;

        };

}


/* =========================================================
   MATCH LINEUP – OPTIONAL QUICK SUMMARY IN COACHING HUB
========================================================= */

function s19MatchLineupSummary(
    match
) {

    const key =
        s19MatchKey(
            match
        );

    const record =
        s19MatchLineupRecord(
            key
        );

    if (!record) {
        return "";
    }

    const starters =
        (
            record.spillere ||
            []
        )
            .filter(
                Boolean
            )
            .length;

    const subs =
        (
            record.udskiftere ||
            []
        )
            .filter(
                Boolean
            )
            .length;

    return `${record.formation || "—"} · ${starters} startere · ${subs} udskiftere`;

}


/* =========================================================
   INIT
========================================================= */

function s19Init() {

    s19EnsureData();

    s19InstallStyles();

    s19EnsureMatchBar();

    /*
        Sørg for at øvelsesdesigner bliver tilføjet hvis brugeren
        allerede står på en øvelse når V19 init kører.
    */
    if (
        document.getElementById(
            "s17SaveExercise"
        )
    ) {

        s19InjectExerciseDesigner();

    }

    /*
        Let observer – kun relevante renderpunkter.
    */
    let timer =
        null;

    const observer =
        new MutationObserver(
            mutations => {

                const relevant =
                    mutations.some(
                        mutation =>
                            [
                                ...mutation.addedNodes
                            ]
                                .some(
                                    node => {

                                        if (
                                            !(
                                                node instanceof
                                                Element
                                            )
                                        ) {
                                            return false;
                                        }

                                        return (
                                            node.id ===
                                                "s17SaveExercise" ||
                                            node.id ===
                                                "start11CalendarShell" ||
                                            node.querySelector?.(
                                                "#s17SaveExercise,#start11CalendarShell"
                                            )
                                        );

                                    }
                                )
                    );

                if (!relevant) {
                    return;
                }

                clearTimeout(
                    timer
                );

                timer =
                    setTimeout(
                        () => {

                            if (
                                document.getElementById(
                                    "s17SaveExercise"
                                )
                            ) {

                                s19InjectExerciseDesigner();

                            }

                            s19DecorateCalendarMatchLineups();

                        },
                        90
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
                s19Init,
                3350
            )
    );

} else {

    setTimeout(
        s19Init,
        3350
    );

}


