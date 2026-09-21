/* =========================================================
   START11 – DBU -> KAMPPLAN SAFETY BRIDGE
   Sikrer at DBU-kampens stamdata altid er source of truth,
   også når kampplan/PDF åbnes fra match-mode.
========================================================= */

function start11ApplyDbuDataToKampplan(match) {

    if (
        !match ||
        typeof kampplan === "undefined"
    ) {
        return;
    }


    const normalized =
        typeof start11CalendarNormalizeMatch === "function"
            ? start11CalendarNormalizeMatch(match)
            : match;


    kampplan = {

        ...kampplan,

        homeTeam:
            normalized?.home ||
            normalized?.homeTeam ||
            kampplan.homeTeam ||
            "",

        awayTeam:
            normalized?.away ||
            normalized?.awayTeam ||
            kampplan.awayTeam ||
            "",

        matchDate:
            normalized?.date ||
            normalized?.matchDate ||
            kampplan.matchDate ||
            "",

        matchTime:
            normalized?.time ||
            normalized?.matchTime ||
            kampplan.matchTime ||
            "",

        matchPlace:
            normalized?.place ||
            normalized?.venue ||
            normalized?.matchPlace ||
            kampplan.matchPlace ||
            "",

        homeLogo:
            normalized?.homeLogo ||
            kampplan.homeLogo ||
            "",

        awayLogo:
            normalized?.awayLogo ||
            kampplan.awayLogo ||
            ""

    };


    /*
        Gem også stamdata lokalt, så PDF'en læser præcis de samme
        værdier som kampplanen.
    */
    try {

        localStorage.setItem(
            "kampplan",
            JSON.stringify(
                kampplan
            )
        );

    } catch (error) {

        console.warn(
            "Kunne ikke cache DBU-data til kampplan:",
            error
        );

    }

}


/*
   Match-mode-knappen bliver oprettet dynamisk.
   Capture-listeneren kører før den eksisterende click-handler
   og sørger for at kampdata ligger i kampplan, før PDF-modal åbnes.
*/
document.addEventListener(
    "click",
    event => {

        const button =
            event.target?.closest?.(
                "#s19MatchPlanButton"
            );


        if (
            !button ||
            typeof s19MatchMode === "undefined" ||
            !s19MatchMode?.match
        ) {
            return;
        }


        start11ApplyDbuDataToKampplan(
            s19MatchMode.match
        );

    },
    true
);

/* =========================================================
   START11 – V23 PRO EXERCISE DESIGNER
   ---------------------------------------------------------
   Advanced tactical / training graphics editor
========================================================= */
(function(){
if(typeof s19DiagramState==="undefined"||typeof s19DiagramFrame!=="function") return;

const V23={
  defaults:{
    "player-blue":[.05,.089],"player-red":[.05,.089],"player-yellow":[.05,.089],"player-green":[.05,.089],
    cone:[.03,.053],ball:[.028,.05],goal:[.125,.105],minigoal:[.09,.08],mannequin:[.037,.115],
    text:[.14,.07],pole:[.016,.12],disc:[.03,.022],hoop:[.07,.124],ladder:[.075,.22],hurdle:[.075,.075],gate:[.09,.085]
  }
};

s19DiagramState.snap=s19DiagramState.snap??true;
s19DiagramState.grid=s19DiagramState.grid??20;
s19DiagramState.showGrid=s19DiagramState.showGrid??true;
s19DiagramState.dragPro=null;

const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number(v)||0));
const esc=v=>typeof s13Esc==="function"?s13Esc(String(v??"")):String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
const snap=v=>{
  if(!s19DiagramState.snap)return clamp(v,.004,.996);
  const n=Math.max(4,Number(s19DiagramState.grid||20));
  return clamp(Math.round(v*n)/n,.004,.996);
};

function normElement(x){
  const d=V23.defaults[x.type]||[.05,.09];
  x.w=Number(x.w??d[0]); x.h=Number(x.h??d[1]);
  x.rotation=Number(x.rotation??0); x.opacity=Number(x.opacity??1); x.z=Number(x.z??10);
  x.locked=!!x.locked; x.label=x.label||""; return x;
}
function normArrow(x){
  x.width=Number(x.width??4);x.opacity=Number(x.opacity??1);x.curved=!!x.curved;x.locked=!!x.locked;
  x.z=Number(x.z??20);x.headStart=!!x.headStart;x.headEnd=x.headEnd!==false;x.label=x.label||"";
  if(x.curved&&(x.c1x==null||x.c1y==null||x.c2x==null||x.c2y==null)) curvePreset(x,"left");
  return x;
}
function normZone(x){
  x.opacity=Number(x.opacity??.18);x.strokeWidth=Number(x.strokeWidth??3);x.radius=Number(x.radius??8);
  x.locked=!!x.locked;x.z=Number(x.z??5);x.label=x.label||"";return x;
}
function normFrame(f){
  f.elements=Array.isArray(f.elements)?f.elements:[];
  f.arrows=Array.isArray(f.arrows)?f.arrows:[];
  f.zones=Array.isArray(f.zones)?f.zones:[];
  f.elements.forEach(normElement);f.arrows.forEach(normArrow);f.zones.forEach(normZone);return f;
}
function findItem(f,id){
  let item=f.elements.find(x=>x.id===id);if(item)return{kind:"element",item};
  item=f.arrows.find(x=>x.id===id);if(item)return{kind:"arrow",item};
  item=f.zones.find(x=>x.id===id);if(item)return{kind:"zone",item};return null;
}
function point(e,b,useSnap=false){
  const r=b.getBoundingClientRect();
  const x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
  return{x:useSnap?snap(x):clamp(x,.004,.996),y:useSnap?snap(y):clamp(y,.004,.996)};
}

function installStyles(){
 if(document.getElementById("s23ProStyles"))return;
 const s=document.createElement("style");s.id="s23ProStyles";s.textContent=`
 .s23pro{--a:var(--s11-primary,#73e45c);--line:rgba(255,255,255,.12);--panel:#0b100d;--p2:#121a15;--mut:#829087}
 .s23top,.s23bar{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.s23top{justify-content:space-between;margin-bottom:7px}
 .s23grp{display:flex;flex-wrap:wrap;gap:5px;align-items:center;padding:6px;border:1px solid var(--line);background:rgba(0,0,0,.18);border-radius:9px}
 .s23b{min-height:29px;padding:0 8px;border:1px solid var(--line);border-radius:7px;background:#151d18;color:#dce5df;font-size:7px;font-weight:900;cursor:pointer}
 .s23b:hover{background:#1c271f;border-color:rgba(255,255,255,.28)}.s23b.active{border-color:var(--a);color:var(--a)}.s23b.danger{color:#ff7777}.s23b.icon{width:30px;padding:0;font-size:13px}
 .s23sep{width:1px;height:22px;background:var(--line)}
 .s23layout{display:grid;grid-template-columns:minmax(0,1fr) 230px;gap:9px;margin-top:8px;align-items:start}
 #s19DiagramBoard.s23board{overflow:hidden;touch-action:none;user-select:none;isolation:isolate}
 #s19DiagramBoard.s23grid::after{content:"";position:absolute;inset:0;z-index:2;pointer-events:none;background-image:linear-gradient(to right,rgba(255,255,255,.055) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,.055) 1px,transparent 1px);background-size:calc(100%/var(--gridN,20)) calc(100%/var(--gridN,20))}
 #s19DiagramSvg{pointer-events:auto!important;z-index:7!important}
 .s23hit{fill:none;stroke:transparent;stroke-width:22;pointer-events:stroke;cursor:move}.s23vis{pointer-events:none}.s23sel{filter:drop-shadow(0 0 4px rgba(115,228,92,.95))}
 .s23handle{pointer-events:all;cursor:grab;fill:#fff;stroke:#111;stroke-width:2}.s23handle.ctrl{fill:#ffd24c}.s23guide{fill:none;stroke:#ffd24c;stroke-width:2;stroke-dasharray:7 6;pointer-events:none}
 .s23obj{position:absolute;z-index:12;transform-origin:center;touch-action:none}.s23obj.selected{outline:1px dashed var(--a);outline-offset:5px;filter:drop-shadow(0 0 5px rgba(115,228,92,.4))}.s23obj.locked{cursor:not-allowed!important}
 .s23body{position:relative;width:100%;height:100%;display:grid;place-items:center;pointer-events:none}
 .s23player{width:100%;height:100%;border-radius:50%;display:grid;place-items:center;border:3px solid #fff;font-weight:950;font-size:clamp(8px,1.1vw,14px);box-shadow:0 2px 7px #0007}.s23player.blue{background:#2878ff}.s23player.red{background:#e44747}.s23player.yellow{background:#ebc63b;color:#111}.s23player.green{background:#35a85c}
 .s23cone{width:100%;height:100%;clip-path:polygon(50% 0,100% 100%,0 100%);background:#ff972d}.s23ball{width:90%;aspect-ratio:1;border-radius:50%;background:#fff;border:3px solid #111}
 .s23goal{width:100%;height:100%;border:4px solid #fff;background:repeating-linear-gradient(0deg,transparent 0 9px,#fff3 10px 11px),repeating-linear-gradient(90deg,transparent 0 10px,#fff3 11px 12px)}
 .s23mini{width:100%;height:100%;border:3px solid #fff;background:repeating-linear-gradient(0deg,transparent 0 9px,#fff3 10px 11px),repeating-linear-gradient(90deg,transparent 0 10px,#fff3 11px 12px)}
 .s23man{width:42%;height:100%;border-radius:50% 50% 18% 18%;background:#e7c73f;border:3px solid #fff}.s23text{width:100%;height:100%;display:grid;place-items:center;text-align:center;color:#fff;font-weight:950;font-size:clamp(8px,1.2vw,16px);text-shadow:0 2px 4px #000;overflow:hidden}
 .s23pole{width:22%;height:100%;border-radius:99px;background:linear-gradient(90deg,#f7e35b,#ff932c);box-shadow:0 0 0 2px #fff9}.s23disc{width:100%;height:100%;border-radius:50%;background:#ff8e2b}.s23hoop{width:100%;height:100%;border-radius:50%;border:5px solid #ffd44c}
 .s23ladder{width:100%;height:100%;border-left:4px solid #ffd44c;border-right:4px solid #ffd44c;background:repeating-linear-gradient(0deg,transparent 0 14%,#ffd44c 14% 18%)}.s23hurdle,.s23gate{width:100%;height:100%;border-left:5px solid #ffb33f;border-right:5px solid #ffb33f;border-top:5px solid #ffb33f}.s23gate{border-top-color:#5ee674}
 .s23rs{position:absolute;width:10px;height:10px;border:2px solid #111;background:#fff;border-radius:2px;z-index:99;pointer-events:auto}.s23rs.nw{left:-10px;top:-10px;cursor:nwse-resize}.s23rs.n{left:50%;top:-10px;transform:translateX(-50%);cursor:ns-resize}.s23rs.ne{right:-10px;top:-10px;cursor:nesw-resize}.s23rs.e{right:-10px;top:50%;transform:translateY(-50%);cursor:ew-resize}.s23rs.se{right:-10px;bottom:-10px;cursor:nwse-resize}.s23rs.s{left:50%;bottom:-10px;transform:translateX(-50%);cursor:ns-resize}.s23rs.sw{left:-10px;bottom:-10px;cursor:nesw-resize}.s23rs.w{left:-10px;top:50%;transform:translateY(-50%);cursor:ew-resize}
 .s23rot{position:absolute;width:12px;height:12px;border-radius:50%;background:#ffd24c;border:2px solid #111;left:50%;top:-30px;transform:translateX(-50%);z-index:100;pointer-events:auto;cursor:grab}.s23rot:after{content:"";position:absolute;width:1px;height:14px;background:#ffd24c;left:50%;top:10px}
 .s23x{position:absolute;right:-25px;top:-25px;width:19px;height:19px;border:0;border-radius:50%;display:grid;place-items:center;background:#d94747;color:#fff;font-weight:950;z-index:101;cursor:pointer;pointer-events:auto}
 .s23ins{position:sticky;top:8px;border:1px solid var(--line);border-radius:10px;background:var(--panel);overflow:hidden}.s23ih{padding:9px 10px;border-bottom:1px solid var(--line);background:var(--p2)}.s23ih strong{display:block;font-size:8px}.s23ih span{font-size:7px;color:var(--mut)}.s23ib{padding:8px;max-height:600px;overflow:auto}
 .s23pg{display:grid;grid-template-columns:1fr 1fr;gap:6px}.s23p{display:flex;flex-direction:column;gap:3px;color:var(--mut);font-size:6.5px;font-weight:800}.s23p.full{grid-column:1/-1}.s23p input,.s23p select{width:100%;min-height:28px;border:1px solid var(--line);border-radius:6px;background:#111814;color:#fff;padding:0 7px;font-size:8px}
 .s23acts{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:8px}.s23layers{margin-top:9px;border-top:1px solid var(--line);padding-top:8px}.s23layer{display:grid;grid-template-columns:1fr auto;gap:4px;padding:5px 6px;border-radius:6px;font-size:7px;cursor:pointer}.s23layer:hover{background:#fff1}.s23layer.active{background:color-mix(in srgb,var(--a) 14%,transparent);color:var(--a)}
 .s23curves{display:grid;grid-template-columns:1fr 1fr;gap:5px;grid-column:1/-1}.s23frames{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}.s23bottom{display:grid;grid-template-columns:1fr 160px;gap:8px;margin-top:8px}.s23help{margin-top:7px;padding:7px 9px;border:1px dashed var(--line);border-radius:7px;color:#7f8c83;font-size:7px;line-height:1.5}
 @media(max-width:1050px){.s23layout{grid-template-columns:1fr}.s23ins{position:relative;top:auto}.s23ib{max-height:none}}
 `;document.head.appendChild(s);
}

function bodyHtml(x){
 const l=esc(x.label||"");
 switch(x.type){
  case"player-blue":return`<div class="s23player blue">${l}</div>`;
  case"player-red":return`<div class="s23player red">${l}</div>`;
  case"player-yellow":return`<div class="s23player yellow">${l}</div>`;
  case"player-green":return`<div class="s23player green">${l}</div>`;
  case"cone":return`<div class="s23cone" style="background:${esc(x.color||"#ff972d")}"></div>`;case"ball":return`<div class="s23ball"></div>`;
  case"goal":return`<div class="s23goal"></div>`;case"minigoal":return`<div class="s23mini"></div>`;
  case"mannequin":return`<div class="s23man"></div>`;case"text":return`<div class="s23text">${l||"TEKST"}</div>`;
  case"pole":return`<div class="s23pole"></div>`;case"disc":return`<div class="s23disc"></div>`;
  case"hoop":return`<div class="s23hoop"></div>`;case"ladder":return`<div class="s23ladder"></div>`;
  case"hurdle":return`<div class="s23hurdle"></div>`;case"gate":return`<div class="s23gate"></div>`;
  default:return`<div class="s23player blue">${l}</div>`;
 }
}
function elementHtml(x){
 normElement(x);const sel=x.id===s19DiagramState.selectedId;
 const handles=sel&&!x.locked?`<i class="s23rs nw" data-rs="nw"></i><i class="s23rs n" data-rs="n"></i><i class="s23rs ne" data-rs="ne"></i><i class="s23rs e" data-rs="e"></i><i class="s23rs se" data-rs="se"></i><i class="s23rs s" data-rs="s"></i><i class="s23rs sw" data-rs="sw"></i><i class="s23rs w" data-rs="w"></i><i class="s23rot" data-rot="1"></i><button class="s23x" type="button" data-qdel="1">×</button>`:"";
 return`<div class="s23obj ${sel?"selected":""} ${x.locked?"locked":""}" data-diagram-element="${esc(x.id)}" style="left:${x.x*100}%;top:${x.y*100}%;width:${x.w*100}%;height:${x.h*100}%;opacity:${x.opacity};z-index:${x.z};transform:translate(-50%,-50%) rotate(${x.rotation}deg);cursor:${x.locked?"not-allowed":"move"}"><div class="s23body">${bodyHtml(x)}</div>${handles}</div>`;
}

function curvePreset(a,p){
 const x1=+a.x1,y1=+a.y1,x2=+a.x2,y2=+a.y2,dx=x2-x1,dy=y2-y1,len=Math.max(.04,Math.hypot(dx,dy)),nx=-dy/len,ny=dx/len;
 if(p==="straight"){a.curved=false;return}
 a.curved=true;let m=Math.min(.18,Math.max(.055,len*.38)),m1=m,m2=m;
 if(p==="right"){m1=-m;m2=-m}else if(p==="s"){m2=-m}else if(p==="s-reverse"){m1=-m}else if(p==="wide-left"){m1=m2=m*1.7}else if(p==="wide-right"){m1=m2=-m*1.7}
 a.c1x=clamp(x1+dx*.33+nx*m1,-.3,1.3);a.c1y=clamp(y1+dy*.33+ny*m1,-.3,1.3);a.c2x=clamp(x1+dx*.67+nx*m2,-.3,1.3);a.c2y=clamp(y1+dy*.67+ny*m2,-.3,1.3);
}
function pathD(a,W=1000,H=562.5){
 const x1=a.x1*W,y1=a.y1*H,x2=a.x2*W,y2=a.y2*H;
 return a.curved?`M ${x1} ${y1} C ${a.c1x*W} ${a.c1y*H}, ${a.c2x*W} ${a.c2y*H}, ${x2} ${y2}`:`M ${x1} ${y1} L ${x2} ${y2}`;
}
function svgInner(f,opt={}){
 normFrame(f);const W=opt.width||1000,H=opt.height||562.5,m=opt.markerId||"s23arr",ms=m+"_s",inter=opt.interactive!==false;
 const zones=f.zones.map(z=>{const sel=z.id===s19DiagramState.selectedId,x=Math.min(z.x1,z.x2)*W,y=Math.min(z.y1,z.y2)*H,w=Math.abs(z.x2-z.x1)*W,h=Math.abs(z.y2-z.y1)*H;
  const hs=sel&&inter&&!z.locked?[["nw",x,y],["ne",x+w,y],["se",x+w,y+h],["sw",x,y+h]].map(q=>`<rect x="${q[1]-6}" y="${q[2]-6}" width="12" height="12" rx="2" class="s23handle" data-zh="${q[0]}" data-zid="${esc(z.id)}"/>`).join(""):"";
  return`<g opacity="${z.opacity}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${z.radius}" fill="${z.color||"#70ff52"}" fill-opacity=".55" stroke="${z.color||"#70ff52"}" stroke-width="${z.strokeWidth}" stroke-dasharray="9 6" class="${sel?"s23sel":""}"/>${inter?`<rect x="${x}" y="${y}" width="${w}" height="${h}" class="s23hit" data-zhit="${esc(z.id)}"/>`:""}${hs}</g>`}).join("");
 const arrows=f.arrows.map(a=>{normArrow(a);const sel=a.id===s19DiagramState.selectedId,c=a.color||"#fff",dash=a.style==="pass"?"12 8":a.style==="dribble"?"4 8":"",d=pathD(a,W,H),x1=a.x1*W,y1=a.y1*H,x2=a.x2*W,y2=a.y2*H;
  const guide=sel&&a.curved&&inter?`<path d="M ${x1} ${y1} L ${a.c1x*W} ${a.c1y*H} M ${x2} ${y2} L ${a.c2x*W} ${a.c2y*H}" class="s23guide"/>`:"";
  const hs=sel&&inter&&!a.locked?`<circle cx="${x1}" cy="${y1}" r="7" class="s23handle" data-ah="start" data-aid="${esc(a.id)}"/><circle cx="${x2}" cy="${y2}" r="7" class="s23handle" data-ah="end" data-aid="${esc(a.id)}"/>${a.curved?`<circle cx="${a.c1x*W}" cy="${a.c1y*H}" r="7" class="s23handle ctrl" data-ah="c1" data-aid="${esc(a.id)}"/><circle cx="${a.c2x*W}" cy="${a.c2y*H}" r="7" class="s23handle ctrl" data-ah="c2" data-aid="${esc(a.id)}"/>`:""}`:"";
  return`<g opacity="${a.opacity}">${guide}<path d="${d}" fill="none" stroke="${c}" stroke-width="${a.width}" stroke-linecap="round" stroke-linejoin="round" ${dash?`stroke-dasharray="${dash}"`:""} ${a.headEnd?`marker-end="url(#${m})"`:""} ${a.headStart?`marker-start="url(#${ms})"`:""} class="s23vis ${sel?"s23sel":""}"/>${inter?`<path d="${d}" class="s23hit" data-ahit="${esc(a.id)}"/>`:""}${hs}${a.label?`<text x="${(x1+x2)/2}" y="${(y1+y2)/2-10}" text-anchor="middle" fill="${c}" font-size="16" font-family="Arial" font-weight="900" pointer-events="none">${esc(a.label)}</text>`:""}</g>`}).join("");
 return`<defs><marker id="${m}" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L10,5 L0,10 z" fill="context-stroke"/></marker><marker id="${ms}" markerWidth="10" markerHeight="10" refX="1" refY="5" orient="auto-start-reverse" markerUnits="strokeWidth"><path d="M10,0 L0,5 L10,10 z" fill="context-stroke"/></marker></defs>${zones}${arrows}`;
}
s19DiagramSvgInner=(f,o={})=>svgInner(f,{...o,interactive:false});

s19DeleteSelectedDiagramItem=function(ex){
 const f=normFrame(s19DiagramFrame(ex)),id=s19DiagramState.selectedId;if(!f||!id)return;s19DiagramSnapshot(ex);
 f.elements=f.elements.filter(x=>x.id!==id);f.arrows=f.arrows.filter(x=>x.id!==id);f.zones=f.zones.filter(x=>x.id!==id);s19DiagramState.selectedId=null;s13Save();s19RenderDiagramBoard(ex);
};
s19DuplicateSelectedDiagramItem=function(ex){
 const f=normFrame(s19DiagramFrame(ex)),s=findItem(f,s19DiagramState.selectedId);if(!s)return;s19DiagramSnapshot(ex);const c=s19Clone(s.item),o=.03;c.id=s19Uid(s.kind==="element"?"diagram-element":s.kind==="arrow"?"diagram-arrow":"diagram-zone");
 if(s.kind==="element"){c.x=clamp(c.x+o);c.y=clamp(c.y+o);f.elements.push(c)}
 else if(s.kind==="arrow"){["x1","x2","c1x","c2x"].forEach(k=>c[k]!=null&&(c[k]=clamp(c[k]+o,-.3,1.3)));["y1","y2","c1y","c2y"].forEach(k=>c[k]!=null&&(c[k]=clamp(c[k]+o,-.3,1.3)));f.arrows.push(c)}
 else{c.x1=clamp(c.x1+o);c.x2=clamp(c.x2+o);c.y1=clamp(c.y1+o);c.y2=clamp(c.y2+o);f.zones.push(c)}
 s19DiagramState.selectedId=c.id;s13Save();s19RenderDiagramBoard(ex);
};
function bring(ex,d){const f=normFrame(s19DiagramFrame(ex)),s=findItem(f,s19DiagramState.selectedId);if(!s)return;s19DiagramSnapshot(ex);s.item.z=Number(s.item.z||10)+(d==="front"?10:-10);s13Save();s19RenderDiagramBoard(ex)}
function toggleLock(ex){const f=normFrame(s19DiagramFrame(ex)),s=findItem(f,s19DiagramState.selectedId);if(!s)return;s19DiagramSnapshot(ex);s.item.locked=!s.item.locked;s13Save();s19RenderDiagramBoard(ex)}

function layers(f){
 const rows=[...f.elements.map(item=>({kind:"element",item})),...f.arrows.map(item=>({kind:"arrow",item})),...f.zones.map(item=>({kind:"zone",item}))].sort((a,b)=>(b.item.z||0)-(a.item.z||0));
 return rows.length?`<div class="s23layers"><div style="color:#748078;font-size:6px;font-weight:900;margin-bottom:4px">LAG · ${rows.length} OBJEKTER</div>${rows.map(r=>{const n=r.kind==="arrow"?(r.item.style==="pass"?"AFLEVERING":r.item.style==="dribble"?"DRIBLING":"LØB")+" PIL":r.kind==="zone"?"ZONE":String(r.item.type).replaceAll("-"," ").toUpperCase();return`<div class="s23layer ${r.item.id===s19DiagramState.selectedId?"active":""}" data-layer="${esc(r.item.id)}"><span>${esc(r.item.label||n)}</span><span>${r.item.locked?"🔒":""}</span></div>`}).join("")}</div>`:"";
}
const num=(l,k,v,min,max,step)=>`<label class="s23p">${l}<input type="number" data-prop="${k}" value="${Number(v).toFixed(step<.01?3:2)}" min="${min}" max="${max}" step="${step}"></label>`;
function inspector(f){
 const s=findItem(f,s19DiagramState.selectedId);
 if(!s)return`<div class="s23ih"><strong>PRO INSPECTOR</strong><span>Vælg et objekt</span></div><div class="s23ib"><div style="font-size:7px;color:#829087;line-height:1.5">Klik på spillere, udstyr, zoner eller pile. Du kan derefter ændre størrelse, rotation, lag, farver, låsning og kurver.</div>${layers(f)}</div>`;
 let p="",x=s.item;
 if(s.kind==="element")p=`<div class="s23pg">${num("X","x",x.x,0,1,.005)}${num("Y","y",x.y,0,1,.005)}${num("BREDDE","w",x.w,.008,.7,.005)}${num("HØJDE","h",x.h,.008,.85,.005)}${num("ROTATION","rotation",x.rotation,-360,360,1)}${num("OPACITY","opacity",x.opacity,.1,1,.05)}${["cone","disc","pole","mannequin","hurdle","ladder","hoop","gate"].includes(x.type)?`<label class="s23p">FARVE<input type="color" data-prop="color" value="${esc(x.color||"#ff972d")}"></label>`:""}<label class="s23p full">TEKST / NUMMER<input data-prop="label" value="${esc(x.label)}"></label></div>`;
 else if(s.kind==="arrow")p=`<div class="s23pg">${num("TYKKELSE","width",x.width,1,20,.5)}${num("OPACITY","opacity",x.opacity,.1,1,.05)}<label class="s23p">FARVE<input type="color" data-prop="color" value="${esc(x.color||"#ffffff")}"></label><label class="s23p">TYPE<select data-prop="style"><option value="run" ${x.style==="run"?"selected":""}>Løb</option><option value="pass" ${x.style==="pass"?"selected":""}>Aflevering</option><option value="dribble" ${x.style==="dribble"?"selected":""}>Dribling</option></select></label><label class="s23p full">LABEL<input data-prop="label" value="${esc(x.label)}"></label><div class="s23curves"><button class="s23b" data-curve="straight">RET</button><button class="s23b" data-curve="left">BØJ ↶</button><button class="s23b" data-curve="right">BØJ ↷</button><button class="s23b" data-curve="s">S-KURVE</button><button class="s23b" data-curve="s-reverse">OMV. S</button><button class="s23b" data-curve="wide-left">STOR ↶</button><button class="s23b" data-curve="wide-right">STOR ↷</button></div><label class="s23p">STARTPIL<select data-prop="headStart"><option value="false" ${!x.headStart?"selected":""}>Nej</option><option value="true" ${x.headStart?"selected":""}>Ja</option></select></label><label class="s23p">SLUTPIL<select data-prop="headEnd"><option value="true" ${x.headEnd?"selected":""}>Ja</option><option value="false" ${!x.headEnd?"selected":""}>Nej</option></select></label></div>`;
 else p=`<div class="s23pg">${num("OPACITY","opacity",x.opacity,.03,.8,.03)}${num("RAMME","strokeWidth",x.strokeWidth,1,12,.5)}${num("HJØRNE","radius",x.radius,0,40,1)}<label class="s23p">FARVE<input type="color" data-prop="color" value="${esc(x.color||"#70ff52")}"></label><label class="s23p full">LABEL<input data-prop="label" value="${esc(x.label)}"></label></div>`;
 return`<div class="s23ih"><strong>${s.kind==="element"?String(x.type).toUpperCase():s.kind==="arrow"?"PIL / LINJE":"ZONE"}</strong><span>${x.locked?"🔒 Låst":"Klar til redigering"}</span></div><div class="s23ib">${p}<div class="s23acts"><button class="s23b" data-act="duplicate">KOPIÉR</button><button class="s23b" data-act="lock">${x.locked?"LÅS OP":"LÅS"}</button><button class="s23b" data-act="front">FORREST</button><button class="s23b" data-act="back">BAGERST</button><button class="s23b danger" data-act="delete" style="grid-column:1/-1">SLET OBJEKT</button></div>${layers(f)}</div>`;
}

function addElement(ex,type){
 const f=normFrame(s19DiagramFrame(ex));s19DiagramSnapshot(ex);let label="";
 if(type==="text"){const t=prompt("Tekst:","FOKUS");if(t===null)return;label=t.trim()}
 else if(type.startsWith("player-"))label=String(f.elements.filter(x=>x.type===type).length+1);
 const d=V23.defaults[type]||[.05,.09],x={id:s19Uid("diagram-element"),type,x:.5+(Math.random()-.5)*.08,y:.5+(Math.random()-.5)*.08,w:d[0],h:d[1],rotation:0,opacity:1,z:10+f.elements.length,label,locked:false,color:type==="cone"?"#ff972d":(s19DiagramState.color||"#ffffff")};
 f.elements.push(x);s19DiagramState.selectedId=x.id;s19DiagramState.tool="select";s13Save();s19RenderDiagramBoard(ex);
}

s19RenderDiagramBoard=function(ex){
 installStyles();const host=document.getElementById("s19DiagramHost");if(!host||!ex)return;
 ex.diagram=s19NormalizeDiagram(ex.diagram);const f=normFrame(s19DiagramFrame(ex)),pitch=ex.diagram.pitch||"plain";
 host.innerHTML=`<div class="s23pro">
 <div class="s23top"><div><div style="font-size:10px;font-weight:950">START11 PRO EXERCISE DESIGNER</div><div class="s13mut">Flyt · skalér · roter · kurv pile · lag · snap · animationstrin</div></div>
 <div class="s23grp">
   <select id="s23Pitch" class="s13sel" style="width:106px"><option value="plain" ${pitch==="plain"?"selected":""}>FRI FLADE</option><option value="full" ${pitch==="full"?"selected":""}>HEL BANE</option><option value="half" ${pitch==="half"?"selected":""}>HALV BANE</option></select>
   <button class="s23b icon" id="s23Undo" title="Fortryd">↶</button>
   <button class="s23b icon" id="s23Redo" title="Gentag">↷</button>
   <button class="s23b" id="s23Rondo">4v2 RONDO</button>
   <button class="s23b s242animate" id="s242Animate">▶ ANIMER ØVELSE</button>
   <button class="s23b s242fullscreen" id="s242Fullscreen">⛶ FULD SKÆRM</button>
 </div></div>
 <div class="s23bar">
  <div class="s23grp">${[["player-blue","BLÅ"],["player-red","RØD"],["player-yellow","GUL"],["player-green","GRØN"],["ball","BOLD"],["cone","KEGLE"],["disc","MARKØR"],["pole","STANG"],["mannequin","DUMMY"],["hurdle","HÆK"],["ladder","STIGE"],["hoop","RING"],["gate","PORT"],["minigoal","SMÅMÅL"],["goal","MÅL"],["text","TEKST"]].map(q=>`<button class="s23b" data-add="${q[0]}">${q[1]}</button>`).join("")}</div>
  <div class="s23grp">${[["select","VÆLG"],["run","LØB →"],["pass","AFLEV. ⇢"],["dribble","DRIBLING"],["curve","KURVET PIL"],["zone","ZONE"]].map(q=>`<button class="s23b ${s19DiagramState.tool===q[0]?"active":""}" data-tool="${q[0]}">${q[1]}</button>`).join("")}<input id="s23Color" type="color" value="${esc(s19DiagramState.color||"#ffffff")}" style="width:31px;height:29px;border:0;background:transparent"></div>
  <div class="s23grp"><button class="s23b ${s19DiagramState.snap?"active":""}" id="s23Snap">SNAP</button><button class="s23b ${s19DiagramState.showGrid?"active":""}" id="s23Grid">GRID</button><select id="s23GridN" class="s13sel" style="width:65px">${[10,16,20,25,32,40].map(n=>`<option value="${n}" ${+s19DiagramState.grid===n?"selected":""}>${n}</option>`).join("")}</select><button class="s23b" id="s23Dup">KOPIÉR</button><button class="s23b danger" id="s23Del">SLET</button></div>
 </div>
 <div class="s23layout"><div>
  <div id="s19DiagramBoard" class="s19-board-wrap s23board pitch-${pitch} ${s19DiagramState.showGrid?"s23grid":""}" style="--gridN:${+s19DiagramState.grid||20}">
   <div class="s19-board-grass"></div><div class="s19-board-lines"></div><div class="s19-board-midline"></div><div class="s19-board-circle"></div>
   <svg id="s19DiagramSvg" viewBox="0 0 1000 562.5" preserveAspectRatio="none">${svgInner(f,{width:1000,height:562.5,markerId:"s23live",interactive:true})}</svg>
   ${f.elements.slice().sort((a,b)=>(a.z||10)-(b.z||10)).map(elementHtml).join("")}
  </div>
  <div class="s23frames">${ex.diagram.frames.map((x,i)=>`<span class="s243framewrap"><button class="s23b ${i===ex.diagram.activeFrame?"active":""}" data-frame="${i}">${esc(x.title||`Trin ${i+1}`)}</button><label class="s243pdfcheck" title="Vis dette trin i trænings-PDF"><input type="checkbox" data-pdf-frame="${i}" ${x.includeInPdf!==false?"checked":""}> PDF</label></span>`).join("")}<button class="s23b" id="s23AddFrame">+ NÆSTE TRIN</button><button class="s23b danger" id="s23DelFrame">SLET TRIN</button><button class="s23b s242animate" id="s242Preview">▶ PREVIEW</button></div>
  <div class="s23bottom"><label class="s13field">Navn på trin<input id="s23FrameTitle" class="s13in" value="${esc(f.title||"")}"></label><label class="s13field">Varighed / pause<input id="s23FrameDur" class="s13in" type="number" min="0" step=".5" value="${+f.duration||0}"></label></div>
  <div class="s23help"><strong>PRO CONTROLS:</strong> Træk alt frit · 8 hvide håndtag ændrer bredde/højde · gult håndtag roterer · pile har flytbare endepunkter · kurvede pile får 2 uafhængige gule kontrolpunkter til S-kurver · Delete/Backspace sletter · Ctrl+D kopierer · Ctrl+Z/Y fortryd/gentag · piletaster nudger · Shift+piletaster flytter hurtigere.</div>
 </div><aside class="s23ins">${inspector(f)}</aside></div></div>`;
 bind(ex);
};

function startDrag(ex,b,p,e){e.preventDefault();e.stopPropagation();s19DiagramSnapshot(ex);s19DiagramState.dragPro={...p,start:point(e,b,false)};b.setPointerCapture?.(e.pointerId)}
function updateElement(d,p,b,e){
 const x=d.item,o=d.original;
 if(d.mode==="moveE"){x.x=snap(o.x+p.x-d.start.x);x.y=snap(o.y+p.y-d.start.y)}
 else if(d.mode==="rotE"){const r=b.getBoundingClientRect(),cx=r.left+x.x*r.width,cy=r.top+x.y*r.height;x.rotation=Math.round(Math.atan2(e.clientY-cy,e.clientX-cx)*180/Math.PI+90)}
 else if(d.mode==="resizeE"){const dx=p.x-d.start.x,dy=p.y-d.start.y,h=d.handle;let w=o.w,hh=o.h,xx=o.x,yy=o.y;
  if(h.includes("e")){w=Math.max(.008,o.w+dx);xx=o.x+dx/2}if(h.includes("w")){w=Math.max(.008,o.w-dx);xx=o.x+dx/2}if(h.includes("s")){hh=Math.max(.008,o.h+dy);yy=o.y+dy/2}if(h.includes("n")){hh=Math.max(.008,o.h-dy);yy=o.y+dy/2}
  x.w=clamp(w,.008,.75);x.h=clamp(hh,.008,.85);x.x=clamp(xx,.004,.996);x.y=clamp(yy,.004,.996)}
}
function updateArrow(d,p){
 const a=d.item,o=d.original;
 if(d.mode==="moveA"){const dx=p.x-d.start.x,dy=p.y-d.start.y;["x1","x2","c1x","c2x"].forEach(k=>o[k]!=null&&(a[k]=clamp(o[k]+dx,-.3,1.3)));["y1","y2","c1y","c2y"].forEach(k=>o[k]!=null&&(a[k]=clamp(o[k]+dy,-.3,1.3)))}
 else{if(d.handle==="start"){a.x1=snap(p.x);a.y1=snap(p.y)}else if(d.handle==="end"){a.x2=snap(p.x);a.y2=snap(p.y)}else if(d.handle==="c1"){a.c1x=p.x;a.c1y=p.y}else{a.c2x=p.x;a.c2y=p.y}}
}
function updateZone(d,p){
 const z=d.item,o=d.original;
 if(d.mode==="moveZ"){const dx=p.x-d.start.x,dy=p.y-d.start.y,minx=Math.min(o.x1,o.x2),maxx=Math.max(o.x1,o.x2),miny=Math.min(o.y1,o.y2),maxy=Math.max(o.y1,o.y2),sx=Math.max(-minx,Math.min(1-maxx,dx)),sy=Math.max(-miny,Math.min(1-maxy,dy));z.x1=o.x1+sx;z.x2=o.x2+sx;z.y1=o.y1+sy;z.y2=o.y2+sy}
 else{const x=snap(p.x),y=snap(p.y);if(d.handle==="nw"){z.x1=x;z.y1=y}else if(d.handle==="ne"){z.x2=x;z.y1=y}else if(d.handle==="se"){z.x2=x;z.y2=y}else{z.x1=x;z.y2=y}}
}
function drawNew(ex,f,start,end){
 s19DiagramSnapshot(ex);const t=s19DiagramState.tool;
 if(t==="zone"){const z={id:s19Uid("diagram-zone"),x1:start.x,y1:start.y,x2:end.x,y2:end.y,color:s19DiagramState.color||"#70ff52",opacity:.18,strokeWidth:3,radius:8,z:5,locked:false,label:""};f.zones.push(z);s19DiagramState.selectedId=z.id}
 else{const a={id:s19Uid("diagram-arrow"),x1:start.x,y1:start.y,x2:end.x,y2:end.y,style:t==="curve"?"run":t,color:s19DiagramState.color||"#fff",width:4,opacity:1,headStart:false,headEnd:true,z:20,locked:false,label:"",curved:t==="curve"};if(a.curved)curvePreset(a,"left");f.arrows.push(a);s19DiagramState.selectedId=a.id}
 s19DiagramState.tool="select";s13Save();s19RenderDiagramBoard(ex);
}

function bind(ex){
 const b=document.getElementById("s19DiagramBoard"),f=normFrame(s19DiagramFrame(ex));if(!b)return;
 document.querySelectorAll("[data-add]").forEach(q=>q.onclick=()=>addElement(ex,q.dataset.add));
 document.querySelectorAll("[data-tool]").forEach(q=>q.onclick=()=>{s19DiagramState.tool=q.dataset.tool;s19DiagramState.selectedId=null;s19RenderDiagramBoard(ex)});
 document.getElementById("s23Color")?.addEventListener("input",e=>s19DiagramState.color=e.target.value);
 document.getElementById("s23Pitch")?.addEventListener("change",e=>{s19DiagramSnapshot(ex);ex.diagram.pitch=e.target.value;s13Save();s19RenderDiagramBoard(ex)});
 document.getElementById("s23Undo")?.addEventListener("click",()=>s19DiagramUndo(ex));document.getElementById("s23Redo")?.addEventListener("click",()=>s19DiagramRedo(ex));document.getElementById("s23Rondo")?.addEventListener("click",()=>s19Rondo4v2(ex));

 document.getElementById("s242Animate")?.addEventListener("click",()=>{
   if(typeof window.s24OpenAnimation==="function"){
     window.s24OpenAnimation(ex);
   }else{
     console.error("START11: Animation engine blev ikke fundet.");
     if(typeof visNotification==="function")visNotification("Animationen kunne ikke åbnes. Genindlæs siden og prøv igen.");
   }
 });

 document.getElementById("s242Preview")?.addEventListener("click",()=>{
   if(typeof window.s24OpenAnimation==="function"){
     window.s24OpenAnimation(ex);
   }else{
     console.error("START11: Animation engine blev ikke fundet.");
     if(typeof visNotification==="function")visNotification("Animationen kunne ikke åbnes. Genindlæs siden og prøv igen.");
   }
 });

 document.getElementById("s242Fullscreen")?.addEventListener("click",()=>{
   const host=document.getElementById("s19DiagramHost");
   if(!host)return;
   const active=host.classList.toggle("s242fullscreenhost");
   document.body.classList.toggle("s242fullscreenbody",active);
   const btn=document.getElementById("s242Fullscreen");
   if(btn)btn.textContent=active?"↙ LUK FULD SKÆRM":"⛶ FULD SKÆRM";
 });
 document.getElementById("s23Dup")?.addEventListener("click",()=>s19DuplicateSelectedDiagramItem(ex));document.getElementById("s23Del")?.addEventListener("click",()=>s19DeleteSelectedDiagramItem(ex));
 document.getElementById("s23Snap")?.addEventListener("click",()=>{s19DiagramState.snap=!s19DiagramState.snap;s19RenderDiagramBoard(ex)});document.getElementById("s23Grid")?.addEventListener("click",()=>{s19DiagramState.showGrid=!s19DiagramState.showGrid;s19RenderDiagramBoard(ex)});document.getElementById("s23GridN")?.addEventListener("change",e=>{s19DiagramState.grid=+e.target.value;s19RenderDiagramBoard(ex)});
 document.getElementById("s23AddFrame")?.addEventListener("click",()=>s19AddDiagramFrame(ex,true));document.getElementById("s23DelFrame")?.addEventListener("click",()=>s19DeleteDiagramFrame(ex));
 document.querySelectorAll("[data-frame]").forEach(q=>q.onclick=()=>{ex.diagram.activeFrame=+q.dataset.frame;s19DiagramState.selectedId=null;s13Save();s19RenderDiagramBoard(ex)});
 document.querySelectorAll("[data-pdf-frame]").forEach(q=>q.onchange=()=>{const i=+q.dataset.pdfFrame;if(ex.diagram.frames[i]){ex.diagram.frames[i].includeInPdf=!!q.checked;s13Save();}});
 document.getElementById("s23FrameTitle")?.addEventListener("change",e=>{f.title=e.target.value.trim()||`Trin ${ex.diagram.activeFrame+1}`;s13Save();s19RenderDiagramBoard(ex)});document.getElementById("s23FrameDur")?.addEventListener("change",e=>{f.duration=+e.target.value||0;s13Save()});
 document.querySelectorAll("[data-prop]").forEach(inp=>inp.addEventListener(inp.type==="color"?"input":"change",()=>{const s=findItem(f,s19DiagramState.selectedId);if(!s)return;s19DiagramSnapshot(ex);let v=inp.value,k=inp.dataset.prop;if(inp.type==="number")v=+v;if(k==="headStart"||k==="headEnd")v=v==="true";s.item[k]=v;s13Save();s19RenderDiagramBoard(ex)}));
 document.querySelectorAll("[data-curve]").forEach(q=>q.onclick=()=>{const s=findItem(f,s19DiagramState.selectedId);if(!s||s.kind!=="arrow")return;s19DiagramSnapshot(ex);curvePreset(s.item,q.dataset.curve);s13Save();s19RenderDiagramBoard(ex)});
 document.querySelectorAll("[data-act]").forEach(q=>q.onclick=()=>{const a=q.dataset.act;if(a==="delete")s19DeleteSelectedDiagramItem(ex);else if(a==="duplicate")s19DuplicateSelectedDiagramItem(ex);else if(a==="lock")toggleLock(ex);else bring(ex,a)});
 document.querySelectorAll("[data-layer]").forEach(q=>q.onclick=()=>{s19DiagramState.selectedId=q.dataset.layer;s19DiagramState.tool="select";s19RenderDiagramBoard(ex)});

 b.querySelectorAll("[data-diagram-element]").forEach(n=>{
  const item=f.elements.find(x=>x.id===n.dataset.diagramElement);if(!item)return;
  n.addEventListener("pointerdown",e=>{if(s19DiagramState.tool!=="select"||e.target.closest("[data-qdel]"))return;s19DiagramState.selectedId=item.id;if(item.locked){s19RenderDiagramBoard(ex);return}const rs=e.target.closest("[data-rs]"),rot=e.target.closest("[data-rot]");startDrag(ex,b,{mode:rs?"resizeE":rot?"rotE":"moveE",item,handle:rs?.dataset.rs,original:s19Clone(item)},e)});
  n.querySelector("[data-qdel]")?.addEventListener("click",e=>{e.stopPropagation();s19DiagramState.selectedId=item.id;s19DeleteSelectedDiagramItem(ex)});
  n.addEventListener("dblclick",e=>{e.preventDefault();e.stopPropagation();const t=prompt("Tekst / nummer:",item.label||"");if(t===null)return;s19DiagramSnapshot(ex);item.label=t.trim();s13Save();s19RenderDiagramBoard(ex)});
 });
 b.querySelectorAll("[data-ahit]").forEach(n=>n.addEventListener("pointerdown",e=>{if(s19DiagramState.tool!=="select")return;const a=f.arrows.find(x=>x.id===n.dataset.ahit);if(!a)return;s19DiagramState.selectedId=a.id;if(a.locked){s19RenderDiagramBoard(ex);return}startDrag(ex,b,{mode:"moveA",item:a,original:s19Clone(a)},e)}));
 b.querySelectorAll("[data-ah]").forEach(n=>n.addEventListener("pointerdown",e=>{const a=f.arrows.find(x=>x.id===n.dataset.aid);if(!a||a.locked)return;s19DiagramState.selectedId=a.id;startDrag(ex,b,{mode:"handleA",item:a,handle:n.dataset.ah,original:s19Clone(a)},e)}));
 b.querySelectorAll("[data-zhit]").forEach(n=>n.addEventListener("pointerdown",e=>{if(s19DiagramState.tool!=="select")return;const z=f.zones.find(x=>x.id===n.dataset.zhit);if(!z)return;s19DiagramState.selectedId=z.id;if(z.locked){s19RenderDiagramBoard(ex);return}startDrag(ex,b,{mode:"moveZ",item:z,original:s19Clone(z)},e)}));
 b.querySelectorAll("[data-zh]").forEach(n=>n.addEventListener("pointerdown",e=>{const z=f.zones.find(x=>x.id===n.dataset.zid);if(!z||z.locked)return;s19DiagramState.selectedId=z.id;startDrag(ex,b,{mode:"handleZ",item:z,handle:n.dataset.zh,original:s19Clone(z)},e)}));
 b.addEventListener("pointermove",e=>{const d=s19DiagramState.dragPro;if(!d){if(s19DiagramState.draw)s19DiagramState.draw.end=point(e,b,false);return}const p=point(e,b,false);if(d.mode.endsWith("E"))updateElement(d,p,b,e);else if(d.mode.endsWith("A"))updateArrow(d,p);else updateZone(d,p);
  if(d.mode.endsWith("E")){const n=b.querySelector(`[data-diagram-element="${CSS.escape(d.item.id)}"]`);if(n){n.style.left=d.item.x*100+"%";n.style.top=d.item.y*100+"%";n.style.width=d.item.w*100+"%";n.style.height=d.item.h*100+"%";n.style.transform=`translate(-50%,-50%) rotate(${d.item.rotation}deg)`}}
  else{const svg=document.getElementById("s19DiagramSvg");if(svg)svg.innerHTML=svgInner(f,{width:1000,height:562.5,markerId:"s23live",interactive:true})}
 });
 b.addEventListener("pointerup",e=>{if(s19DiagramState.dragPro){s19DiagramState.dragPro=null;s13Save();s19RenderDiagramBoard(ex);return}if(!s19DiagramState.draw)return;const st=s19DiagramState.draw.start,en=point(e,b,true);s19DiagramState.draw=null;if(Math.hypot(en.x-st.x,en.y-st.y)<.015){s19DiagramState.tool="select";s19RenderDiagramBoard(ex);return}drawNew(ex,f,st,en)});
 b.addEventListener("pointercancel",()=>{if(s19DiagramState.dragPro){s19DiagramState.dragPro=null;s13Save();s19RenderDiagramBoard(ex)}});
 b.addEventListener("pointerdown",e=>{if(e.target.closest("[data-diagram-element],[data-ahit],[data-ah],[data-zhit],[data-zh]"))return;if(s19DiagramState.tool==="select"){s19DiagramState.selectedId=null;s19RenderDiagramBoard(ex);return}const st=point(e,b,true);s19DiagramState.draw={start:st,end:st};b.setPointerCapture?.(e.pointerId)});
}

function nudge(ex,dx,dy){
 const f=normFrame(s19DiagramFrame(ex)),s=findItem(f,s19DiagramState.selectedId);if(!s||s.item.locked)return;s19DiagramSnapshot(ex);
 if(s.kind==="element"){s.item.x=clamp(s.item.x+dx);s.item.y=clamp(s.item.y+dy)}
 else if(s.kind==="arrow"){["x1","x2","c1x","c2x"].forEach(k=>s.item[k]!=null&&(s.item[k]=clamp(s.item[k]+dx,-.3,1.3)));["y1","y2","c1y","c2y"].forEach(k=>s.item[k]!=null&&(s.item[k]=clamp(s.item[k]+dy,-.3,1.3)))}
 else{s.item.x1=clamp(s.item.x1+dx);s.item.x2=clamp(s.item.x2+dx);s.item.y1=clamp(s.item.y1+dy);s.item.y2=clamp(s.item.y2+dy)}
 s13Save();s19RenderDiagramBoard(ex);
}
function keyHandler(e){
 const host=document.getElementById("s19DiagramHost");if(!host||!host.offsetParent||["INPUT","TEXTAREA","SELECT"].includes(e.target?.tagName))return;
 const ex=typeof s19ExerciseForDesigner==="function"?s19ExerciseForDesigner():null;if(!ex)return;const k=e.key.toLowerCase();
 if(e.key==="Delete"||e.key==="Backspace"){e.preventDefault();s19DeleteSelectedDiagramItem(ex);return}
 if((e.ctrlKey||e.metaKey)&&k==="d"){e.preventDefault();s19DuplicateSelectedDiagramItem(ex);return}
 if((e.ctrlKey||e.metaKey)&&k==="z"){e.preventDefault();e.shiftKey?s19DiagramRedo(ex):s19DiagramUndo(ex);return}
 if((e.ctrlKey||e.metaKey)&&k==="y"){e.preventDefault();s19DiagramRedo(ex);return}
 const st=e.shiftKey?.02:.004;if(e.key==="ArrowLeft"){e.preventDefault();nudge(ex,-st,0)}else if(e.key==="ArrowRight"){e.preventDefault();nudge(ex,st,0)}else if(e.key==="ArrowUp"){e.preventDefault();nudge(ex,0,-st)}else if(e.key==="ArrowDown"){e.preventDefault();nudge(ex,0,st)}
}
if(!window.__s23Keys){window.__s23Keys=true;document.addEventListener("keydown",keyHandler)}

const oldPitchSvg=typeof s19PitchSvg==="function"?s19PitchSvg:null;
s19PitchSvg=function(pitch,f,index=0){
 f=normFrame(f||{elements:[],arrows:[],zones:[]});const W=1000,H=562.5,line="#fff";
 const field=pitch==="plain"?"":`<rect x="45" y="35" width="910" height="492.5" fill="none" stroke="${line}" stroke-opacity=".72" stroke-width="4"/>${pitch==="full"?`<line x1="500" y1="35" x2="500" y2="527.5" stroke="${line}" stroke-opacity=".68" stroke-width="4"/><circle cx="500" cy="281.25" r="72" fill="none" stroke="${line}" stroke-opacity=".68" stroke-width="4"/>`:""}`;
 const els=f.elements.map(x=>{normElement(x);const px=x.x*W,py=x.y*H,w=x.w*W,h=x.h*H,r=+x.rotation||0,o=x.opacity??1,l=esc(x.label||""),tr=`rotate(${r} ${px} ${py})`;
  if(x.type.startsWith("player-")){const c={"player-blue":"#2878ff","player-red":"#e44747","player-yellow":"#ebc63b","player-green":"#35a85c"}[x.type]||"#2878ff";return`<g opacity="${o}" transform="${tr}"><ellipse cx="${px}" cy="${py}" rx="${w/2}" ry="${h/2}" fill="${c}" stroke="#fff" stroke-width="4"/><text x="${px}" y="${py+1}" text-anchor="middle" dominant-baseline="middle" fill="${x.type==="player-yellow"?"#111":"#fff"}" font-size="${Math.max(11,Math.min(w,h)*.42)}" font-weight="900" font-family="Arial">${l}</text></g>`}
  if(x.type==="cone")return`<polygon points="${px},${py-h/2} ${px+w/2},${py+h/2} ${px-w/2},${py+h/2}" fill="#ff972d" opacity="${o}" transform="${tr}"/>`;
  if(x.type==="ball")return`<ellipse cx="${px}" cy="${py}" rx="${w/2}" ry="${h/2}" fill="#fff" stroke="#111" stroke-width="3" opacity="${o}" transform="${tr}"/>`;
  if(x.type==="text")return`<text x="${px}" y="${py}" text-anchor="middle" dominant-baseline="middle" fill="#fff" font-size="${Math.max(12,h*.42)}" font-weight="900" font-family="Arial" opacity="${o}" transform="${tr}">${l||"TEKST"}</text>`;
  const stroke=x.type==="mannequin"?"#e7c73f":x.type==="pole"?"#ffd44c":"#fff",none=["goal","minigoal","hoop","hurdle","gate","ladder"].includes(x.type);
  return`<rect x="${px-w/2}" y="${py-h/2}" width="${w}" height="${h}" rx="${x.type==="mannequin"?Math.min(w,h)/2:4}" fill="${none?"none":stroke}" fill-opacity=".4" stroke="${stroke}" stroke-width="4" opacity="${o}" transform="${tr}"/>`
 }).join("");
 return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" style="display:block;border-radius:10px;background:#176733"><rect width="${W}" height="${H}" fill="#176733"/>${field}${svgInner(f,{width:W,height:H,markerId:`s23pdf${index}`,interactive:false})}${els}</svg>`;
};

setTimeout(()=>{const ex=typeof s19ExerciseForDesigner==="function"?s19ExerciseForDesigner():null;if(ex&&document.getElementById("s19DiagramHost"))s19RenderDiagramBoard(ex)},250);
})();

/* =========================================================
   START11 – V24.2
   CINEMATIC EXERCISE ANIMATION + FULLSCREEN
   MODERN MATCH PDF / STARTING XI REDESIGN
========================================================= */

(function () {

    /* =====================================================
       V24 – SHARED HELPERS
    ===================================================== */

    function s24Esc(value) {

        if (
            typeof escapeHTML ===
            "function"
        ) {
            return escapeHTML(
                String(
                    value ?? ""
                )
            );
        }

        return String(
            value ?? ""
        )
            .replaceAll("&","&amp;")
            .replaceAll("<","&lt;")
            .replaceAll(">","&gt;")
            .replaceAll('"',"&quot;");

    }


    function s24Clone(value) {

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


    function s24Lerp(
        a,
        b,
        t
    ) {

        return (
            Number(a || 0) +
            (
                Number(b || 0) -
                Number(a || 0)
            ) *
            t
        );

    }


    function s24Clamp(
        value,
        min = 0,
        max = 1
    ) {

        return Math.max(
            min,
            Math.min(
                max,
                Number(value) || 0
            )
        );

    }


    function s24Ease(
        t
    ) {

        /*
            Smoothstep:
            rolig acceleration + nedbremsning,
            så animationen ligner en rigtig taktisk præsentation
            i stedet for objekter der bare "teleporterer".
        */

        t =
            s24Clamp(
                t
            );

        return (
            t *
            t *
            (
                3 -
                2 *
                t
            )
        );

    }


    function s24CurrentExercise() {

        return typeof s19ExerciseForDesigner ===
            "function"
                ? s19ExerciseForDesigner()
                : null;

    }


    /* =====================================================
       V24 – FULLSCREEN + ANIMATION STYLES
    ===================================================== */

    function s24InstallStyles() {

        if (
            document.getElementById(
                "s24AnimationStyles"
            )
        ) {
            return;
        }

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "s24AnimationStyles";

        style.textContent = `

            /* ---------- Designer fullscreen ---------- */

            .s23-pro-designer:fullscreen,
            .s23-pro-designer.s24-fallback-fullscreen {
                width:100vw !important;
                height:100vh !important;
                max-width:none !important;
                max-height:none !important;
                overflow:auto !important;
                padding:14px !important;
                background:#070b08 !important;
                color:#fff !important;
            }

            .s23-pro-designer:fullscreen .s23-board-layout,
            .s23-pro-designer.s24-fallback-fullscreen .s23-board-layout {
                min-height:calc(100vh - 180px);
                grid-template-columns:minmax(0,1fr) 250px;
            }

            .s23-pro-designer:fullscreen #s19DiagramBoard,
            .s23-pro-designer.s24-fallback-fullscreen #s19DiagramBoard {
                min-height:min(72vh,820px);
            }

            .s24-editor-actions {
                display:flex;
                gap:5px;
                align-items:center;
                flex-wrap:wrap;
            }

            .s24-play-btn {
                border-color:rgba(103,238,110,.55) !important;
                color:#8cf08e !important;
                background:rgba(61,133,65,.18) !important;
            }


            /* ---------- Animation modal ---------- */

            .s24-animation-overlay {
                position:fixed;
                inset:0;
                z-index:999999;
                display:flex;
                flex-direction:column;
                background:
                    radial-gradient(circle at 50% 0%,rgba(69,130,77,.18),transparent 34%),
                    #050806;
                color:#fff;
                overflow:hidden;
            }

            .s24-animation-overlay[hidden] {
                display:none !important;
            }

            .s24-animation-overlay:fullscreen {
                background:#030504;
            }

            .s24-animation-top {
                min-height:64px;
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:15px;
                padding:10px 16px;
                border-bottom:1px solid rgba(255,255,255,.09);
                background:rgba(7,12,9,.92);
            }

            .s24-animation-title {
                min-width:0;
            }

            .s24-animation-title strong {
                display:block;
                font-size:15px;
                letter-spacing:.35px;
            }

            .s24-animation-title span {
                display:block;
                margin-top:2px;
                color:#829088;
                font-size:9px;
            }

            .s24-animation-top-actions {
                display:flex;
                gap:6px;
                align-items:center;
            }

            .s24-animation-main {
                flex:1;
                min-height:0;
                display:grid;
                place-items:center;
                padding:14px;
            }

            .s24-animation-stage {
                position:relative;
                width:min(92vw,1450px);
                aspect-ratio:16 / 9;
                max-height:calc(100vh - 150px);
                border:1px solid rgba(255,255,255,.13);
                border-radius:13px;
                overflow:hidden;
                background:
                    linear-gradient(rgba(255,255,255,.016),rgba(255,255,255,.016)),
                    #176733;
                box-shadow:
                    0 25px 70px rgba(0,0,0,.45),
                    0 0 0 1px rgba(255,255,255,.02) inset;
            }

            .s24-animation-stage.pitch-plain .s24-pitch-markings {
                display:none;
            }

            .s24-anim-grass {
                position:absolute;
                inset:0;
                background:
                    repeating-linear-gradient(
                        90deg,
                        rgba(255,255,255,.026) 0 8.333%,
                        rgba(0,0,0,.024) 8.333% 16.666%
                    ),
                    linear-gradient(180deg,#1c743b,#125b2f);
            }

            .s24-pitch-markings {
                position:absolute;
                inset:5%;
                border:2px solid rgba(255,255,255,.68);
                border-radius:2px;
                pointer-events:none;
            }

            .s24-pitch-midline {
                position:absolute;
                left:50%;
                top:0;
                bottom:0;
                width:2px;
                background:rgba(255,255,255,.62);
                transform:translateX(-50%);
            }

            .s24-pitch-circle {
                position:absolute;
                width:16%;
                aspect-ratio:1;
                left:50%;
                top:50%;
                transform:translate(-50%,-50%);
                border:2px solid rgba(255,255,255,.62);
                border-radius:50%;
            }

            .s24-pitch-box {
                position:absolute;
                left:0;
                width:14%;
                height:48%;
                top:26%;
                border:2px solid rgba(255,255,255,.58);
                border-left:0;
            }

            .s24-pitch-box.right {
                left:auto;
                right:0;
                border-left:2px solid rgba(255,255,255,.58);
                border-right:0;
            }

            .s24-anim-elements,
            .s24-anim-svg {
                position:absolute;
                inset:0;
                width:100%;
                height:100%;
                pointer-events:none;
            }

            .s24-anim-object {
                position:absolute;
                transform-origin:center;
                display:grid;
                place-items:center;
                pointer-events:none;
            }

            .s24-anim-player {
                width:100%;
                height:100%;
                border-radius:50%;
                border:3px solid #fff;
                display:grid;
                place-items:center;
                font-weight:950;
                font-size:clamp(8px,1.4vw,18px);
                box-shadow:0 5px 15px rgba(0,0,0,.33);
            }

            .s24-anim-player.blue{background:#2478ff}
            .s24-anim-player.red{background:#e64a4a}
            .s24-anim-player.yellow{background:#f0c934;color:#111}
            .s24-anim-player.green{background:#35ac5e}

            .s24-anim-cone {
                width:100%;
                height:100%;
                clip-path:polygon(50% 0,100% 100%,0 100%);
                background:#ff922f;
            }

            .s24-anim-ball {
                width:85%;
                aspect-ratio:1;
                border-radius:50%;
                background:#fff;
                border:2px solid #141414;
                box-shadow:inset 0 0 0 4px #fff;
            }

            .s24-anim-goal {
                width:100%;
                height:100%;
                border:3px solid #fff;
                background:
                    repeating-linear-gradient(0deg,transparent 0 11px,rgba(255,255,255,.2) 12px 13px),
                    repeating-linear-gradient(90deg,transparent 0 11px,rgba(255,255,255,.2) 12px 13px);
            }

            .s24-anim-text {
                width:100%;
                height:100%;
                display:grid;
                place-items:center;
                text-align:center;
                font-size:clamp(9px,1.3vw,18px);
                font-weight:950;
                text-shadow:0 2px 4px rgba(0,0,0,.75);
                overflow:hidden;
            }

            .s24-animation-status {
                position:absolute;
                left:14px;
                top:14px;
                z-index:30;
                display:flex;
                align-items:center;
                gap:7px;
                padding:7px 9px;
                border:1px solid rgba(255,255,255,.14);
                border-radius:8px;
                background:rgba(4,8,5,.72);
                backdrop-filter:blur(8px);
                font-size:8px;
                font-weight:900;
            }

            .s24-animation-status .dot {
                width:7px;
                height:7px;
                border-radius:50%;
                background:#74e87d;
                box-shadow:0 0 10px rgba(116,232,125,.8);
            }

            .s24-animation-bottom {
                min-height:68px;
                display:grid;
                grid-template-columns:auto 1fr auto;
                align-items:center;
                gap:12px;
                padding:9px 16px;
                border-top:1px solid rgba(255,255,255,.09);
                background:#080d09;
            }

            .s24-animation-controls {
                display:flex;
                gap:5px;
                align-items:center;
            }

            .s24-progress-track {
                height:5px;
                border-radius:99px;
                background:rgba(255,255,255,.12);
                overflow:hidden;
            }

            .s24-progress-bar {
                height:100%;
                width:0%;
                background:linear-gradient(90deg,#62df6e,#d9ff8c);
                border-radius:99px;
                transition:width .05s linear;
            }

            .s24-animation-frame-label {
                min-width:100px;
                text-align:right;
                color:#9eaaa2;
                font-size:8px;
                font-weight:900;
            }

            @media(max-width:760px) {
                .s24-animation-bottom {
                    grid-template-columns:1fr;
                }

                .s24-animation-frame-label {
                    text-align:left;
                }

                .s24-animation-stage {
                    width:98vw;
                }
            }
        `;

        document.head.appendChild(
            style
        );

    }


    /* =====================================================
       V24 – EXERCISE ANIMATION ENGINE
    ===================================================== */

    const s24Animation = {

        overlay:
            null,

        exercise:
            null,

        running:
            false,

        raf:
            null,

        segmentIndex:
            0,

        segmentStart:
            0,

        speed:
            1,

        loop:
            true,

        pausedProgress:
            0

    };


    function s24NormalizeAnimElement(
        item
    ) {

        const defaults = {
            "player-blue":[.05,.089],
            "player-red":[.05,.089],
            "player-yellow":[.05,.089],
            "player-green":[.05,.089],
            cone:[.03,.053],
            ball:[.028,.05],
            goal:[.125,.105],
            minigoal:[.09,.08],
            mannequin:[.037,.115],
            text:[.13,.07],
            pole:[.016,.12],
            disc:[.03,.022],
            hoop:[.07,.124],
            ladder:[.075,.22],
            hurdle:[.075,.075],
            gate:[.09,.085]
        };

        const d =
            defaults[
                item.type
            ] ||
            [.05,.089];

        return {
            ...item,

            x:
                Number(
                    item.x ??
                    .5
                ),

            y:
                Number(
                    item.y ??
                    .5
                ),

            w:
                Number(
                    item.w ??
                    d[0]
                ),

            h:
                Number(
                    item.h ??
                    d[1]
                ),

            rotation:
                Number(
                    item.rotation ??
                    0
                ),

            opacity:
                Number(
                    item.opacity ??
                    1
                )
        };

    }


    function s24StraightControls(
        arrow
    ) {

        return {
            c1x:
                s24Lerp(
                    arrow.x1,
                    arrow.x2,
                    .33
                ),

            c1y:
                s24Lerp(
                    arrow.y1,
                    arrow.y2,
                    .33
                ),

            c2x:
                s24Lerp(
                    arrow.x1,
                    arrow.x2,
                    .67
                ),

            c2y:
                s24Lerp(
                    arrow.y1,
                    arrow.y2,
                    .67
                )
        };

    }


    function s24NormalizeAnimArrow(
        item
    ) {

        const straight =
            s24StraightControls(
                item
            );

        return {
            ...item,

            x1:
                Number(
                    item.x1 ||
                    0
                ),

            y1:
                Number(
                    item.y1 ||
                    0
                ),

            x2:
                Number(
                    item.x2 ||
                    0
                ),

            y2:
                Number(
                    item.y2 ||
                    0
                ),

            c1x:
                Number(
                    item.c1x ??
                    straight.c1x
                ),

            c1y:
                Number(
                    item.c1y ??
                    straight.c1y
                ),

            c2x:
                Number(
                    item.c2x ??
                    straight.c2x
                ),

            c2y:
                Number(
                    item.c2y ??
                    straight.c2y
                ),

            width:
                Number(
                    item.width ??
                    4
                ),

            opacity:
                Number(
                    item.opacity ??
                    1
                ),

            curved:
                Boolean(
                    item.curved
                )
        };

    }


    function s24NormalizeAnimZone(
        item
    ) {

        return {
            ...item,

            x1:
                Number(
                    item.x1 ||
                    0
                ),

            y1:
                Number(
                    item.y1 ||
                    0
                ),

            x2:
                Number(
                    item.x2 ||
                    0
                ),

            y2:
                Number(
                    item.y2 ||
                    0
                ),

            opacity:
                Number(
                    item.opacity ??
                    .18
                ),

            strokeWidth:
                Number(
                    item.strokeWidth ??
                    3
                ),

            radius:
                Number(
                    item.radius ??
                    8
                )
        };

    }


    function s24AnimFrame(
        frame
    ) {

        return {

            ...frame,

            elements:
                Array.isArray(
                    frame?.elements
                )
                    ? frame.elements.map(
                        s24NormalizeAnimElement
                    )
                    : [],

            arrows:
                Array.isArray(
                    frame?.arrows
                )
                    ? frame.arrows.map(
                        s24NormalizeAnimArrow
                    )
                    : [],

            zones:
                Array.isArray(
                    frame?.zones
                )
                    ? frame.zones.map(
                        s24NormalizeAnimZone
                    )
                    : []

        };

    }


    function s24InterpolateCollection(
        from,
        to,
        t,
        normalizer,
        numericKeys
    ) {

        const fromMap =
            new Map(
                from.map(
                    item => [
                        item.id,
                        normalizer(
                            item
                        )
                    ]
                )
            );

        const toMap =
            new Map(
                to.map(
                    item => [
                        item.id,
                        normalizer(
                            item
                        )
                    ]
                )
            );

        const ids =
            new Set([
                ...fromMap.keys(),
                ...toMap.keys()
            ]);

        const output =
            [];

        ids.forEach(
            id => {

                const a =
                    fromMap.get(
                        id
                    );

                const b =
                    toMap.get(
                        id
                    );

                if (
                    a &&
                    b
                ) {

                    const item = {
                        ...a,
                        ...b
                    };

                    numericKeys.forEach(
                        key => {

                            item[key] =
                                s24Lerp(
                                    a[key],
                                    b[key],
                                    t
                                );

                        }
                    );

                    item.opacity =
                        s24Lerp(
                            a.opacity ?? 1,
                            b.opacity ?? 1,
                            t
                        );

                    output.push(
                        item
                    );

                } else if (
                    a
                ) {

                    output.push({
                        ...a,
                        opacity:
                            (
                                a.opacity ??
                                1
                            ) *
                            (
                                1 -
                                t
                            )
                    });

                } else if (
                    b
                ) {

                    output.push({
                        ...b,
                        opacity:
                            (
                                b.opacity ??
                                1
                            ) *
                            t
                    });

                }

            }
        );

        return output;

    }


    function s24InterpolateFrame(
        fromFrame,
        toFrame,
        t
    ) {

        const a =
            s24AnimFrame(
                fromFrame
            );

        const b =
            s24AnimFrame(
                toFrame
            );

        return {

            title:
                t <
                .5
                    ? a.title
                    : b.title,

            elements:
                s24InterpolateCollection(
                    a.elements,
                    b.elements,
                    t,
                    s24NormalizeAnimElement,
                    [
                        "x",
                        "y",
                        "w",
                        "h",
                        "rotation"
                    ]
                ),

            arrows:
                s24InterpolateCollection(
                    a.arrows,
                    b.arrows,
                    t,
                    s24NormalizeAnimArrow,
                    [
                        "x1",
                        "y1",
                        "x2",
                        "y2",
                        "c1x",
                        "c1y",
                        "c2x",
                        "c2y",
                        "width"
                    ]
                ),

            zones:
                s24InterpolateCollection(
                    a.zones,
                    b.zones,
                    t,
                    s24NormalizeAnimZone,
                    [
                        "x1",
                        "y1",
                        "x2",
                        "y2",
                        "strokeWidth",
                        "radius"
                    ]
                )

        };

    }


    function s24AnimObjectBody(
        item
    ) {

        const label =
            s24Esc(
                item.label ||
                ""
            );

        switch (
            item.type
        ) {

            case "player-blue":
                return `<div class="s24-anim-player blue">${label}</div>`;

            case "player-red":
                return `<div class="s24-anim-player red">${label}</div>`;

            case "player-yellow":
                return `<div class="s24-anim-player yellow">${label}</div>`;

            case "player-green":
                return `<div class="s24-anim-player green">${label}</div>`;

            case "cone":
                return `<div class="s24-anim-cone"></div>`;

            case "ball":
                return `<div class="s24-anim-ball"></div>`;

            case "goal":
            case "minigoal":
                return `<div class="s24-anim-goal"></div>`;

            case "text":
                return `<div class="s24-anim-text">${label}</div>`;

            case "mannequin":
                return `<div style="width:42%;height:100%;border-radius:50% 50% 20% 20%;background:#e4c646;border:3px solid #fff"></div>`;

            case "pole":
                return `<div style="width:20%;height:100%;border-radius:99px;background:#ffd34a;border:2px solid #fff"></div>`;

            case "disc":
                return `<div style="width:100%;height:100%;border-radius:50%;background:#ff8f2b"></div>`;

            case "hoop":
                return `<div style="width:100%;height:100%;border-radius:50%;border:5px solid #ffd34a"></div>`;

            case "ladder":
                return `<div style="width:100%;height:100%;border-left:4px solid #ffd34a;border-right:4px solid #ffd34a;background:repeating-linear-gradient(0deg,transparent 0 14%,#ffd34a 14% 18%)"></div>`;

            case "hurdle":
            case "gate":
                return `<div style="width:100%;height:100%;border-left:5px solid #ffaf3d;border-right:5px solid #ffaf3d;border-top:5px solid ${item.type==="gate" ? "#62e77a" : "#ffaf3d"}"></div>`;

            default:
                return `<div class="s24-anim-player blue">${label}</div>`;

        }

    }


    function s24AnimationSvg(
        frame
    ) {

        const marker =
            "s24AnimArrow";

        const zones =
            frame.zones
                .map(
                    zone => {

                        const x =
                            Math.min(
                                zone.x1,
                                zone.x2
                            ) *
                            1000;

                        const y =
                            Math.min(
                                zone.y1,
                                zone.y2
                            ) *
                            562.5;

                        const w =
                            Math.abs(
                                zone.x2 -
                                zone.x1
                            ) *
                            1000;

                        const h =
                            Math.abs(
                                zone.y2 -
                                zone.y1
                            ) *
                            562.5;

                        return `
                            <rect
                                x="${x}"
                                y="${y}"
                                width="${w}"
                                height="${h}"
                                rx="${zone.radius || 8}"
                                fill="${zone.color || "#70ff52"}"
                                fill-opacity="${Math.min(.75,(zone.opacity ?? .18)*2.5)}"
                                stroke="${zone.color || "#70ff52"}"
                                stroke-width="${zone.strokeWidth || 3}"
                                stroke-dasharray="10 7"
                                opacity="${zone.opacity ?? 1}"
                            />
                        `;

                    }
                )
                .join(
                    ""
                );

        const arrows =
            frame.arrows
                .map(
                    arrow => {

                        const straight =
                            s24StraightControls(
                                arrow
                            );

                        const curved =
                            Boolean(
                                arrow.curved
                            );

                        const c1x =
                            (
                                arrow.c1x ??
                                straight.c1x
                            ) *
                            1000;

                        const c1y =
                            (
                                arrow.c1y ??
                                straight.c1y
                            ) *
                            562.5;

                        const c2x =
                            (
                                arrow.c2x ??
                                straight.c2x
                            ) *
                            1000;

                        const c2y =
                            (
                                arrow.c2y ??
                                straight.c2y
                            ) *
                            562.5;

                        const x1 =
                            arrow.x1 *
                            1000;

                        const y1 =
                            arrow.y1 *
                            562.5;

                        const x2 =
                            arrow.x2 *
                            1000;

                        const y2 =
                            arrow.y2 *
                            562.5;

                        const path =
                            curved
                                ? `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`
                                : `M ${x1} ${y1} L ${x2} ${y2}`;

                        const dash =
                            arrow.style ===
                            "pass"
                                ? "12 8"
                                : arrow.style ===
                                    "dribble"
                                    ? "4 8"
                                    : "";

                        return `
                            <path
                                d="${path}"
                                fill="none"
                                stroke="${arrow.color || "#ffffff"}"
                                stroke-width="${arrow.width || 4}"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                ${dash ? `stroke-dasharray="${dash}"` : ""}
                                opacity="${arrow.opacity ?? 1}"
                                marker-end="url(#${marker})"
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
                    id="${marker}"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="5"
                    orient="auto"
                    markerUnits="strokeWidth"
                >
                    <path
                        d="M0,0 L10,5 L0,10 z"
                        fill="context-stroke"
                    />
                </marker>
            </defs>

            ${zones}
            ${arrows}
        `;

    }


    function s24RenderAnimationFrame(
        frame
    ) {

        const overlay =
            s24Animation.overlay;

        if (
            !overlay
        ) {
            return;
        }

        const svg =
            overlay.querySelector(
                "#s24AnimationSvg"
            );

        const elements =
            overlay.querySelector(
                "#s24AnimationElements"
            );

        if (
            svg
        ) {

            svg.innerHTML =
                s24AnimationSvg(
                    frame
                );

        }

        if (
            elements
        ) {

            elements.innerHTML =
                frame.elements
                    .map(
                        item => `
                            <div
                                class="s24-anim-object"
                                style="
                                    left:${item.x*100}%;
                                    top:${item.y*100}%;
                                    width:${item.w*100}%;
                                    height:${item.h*100}%;
                                    opacity:${item.opacity ?? 1};
                                    transform:
                                        translate(-50%,-50%)
                                        rotate(${item.rotation || 0}deg);
                                "
                            >
                                ${s24AnimObjectBody(item)}
                            </div>
                        `
                    )
                    .join(
                        ""
                    );

        }

    }


    function s24AnimationDuration(
        frame
    ) {

        /*
            frame.duration bruges som animationstid hvis træneren har sat den.
            0 betyder en moderne standardtransition på 1.25 sek.
        */

        const value =
            Number(
                frame?.duration ||
                0
            );

        return Math.max(
            .45,
            value >
            0
                ? value
                : 1.25
        );

    }


    function s24UpdateAnimationUi(
        frameIndex,
        segmentProgress = 0
    ) {

        const overlay =
            s24Animation.overlay;

        const exercise =
            s24Animation.exercise;

        if (
            !overlay ||
            !exercise
        ) {
            return;
        }

        const frames =
            exercise.diagram?.frames ||
            [];

        const label =
            overlay.querySelector(
                "#s24AnimationFrameLabel"
            );

        const progress =
            overlay.querySelector(
                "#s24AnimationProgress"
            );

        const status =
            overlay.querySelector(
                "#s24AnimationStatusText"
            );

        if (
            label
        ) {

            label.textContent =
                `${
                    Math.min(
                        frameIndex +
                        1,
                        frames.length
                    )
                } / ${frames.length} · ${
                    frames[
                        Math.min(
                            frameIndex,
                            frames.length -
                            1
                        )
                    ]?.title ||
                    `Trin ${frameIndex+1}`
                }`;

        }

        if (
            progress
        ) {

            const totalSegments =
                Math.max(
                    1,
                    frames.length -
                    1
                );

            const overall =
                frames.length <=
                1
                    ? 1
                    : (
                        frameIndex +
                        segmentProgress
                    ) /
                    totalSegments;

            progress.style.width =
                `${Math.min(100,overall*100)}%`;

        }

        if (
            status
        ) {

            status.textContent =
                s24Animation.running
                    ? "AFSPILLER"
                    : "PAUSE";

        }

        const playButton =
            overlay.querySelector(
                "#s24AnimationPlay"
            );

        if (
            playButton
        ) {

            playButton.textContent =
                s24Animation.running
                    ? "Ⅱ PAUSE"
                    : "▶ AFSPIL";

        }

    }


    function s24AnimationTick(
        now
    ) {

        if (
            !s24Animation.running ||
            !s24Animation.exercise
        ) {
            return;
        }

        const frames =
            s24Animation.exercise.diagram?.frames ||
            [];

        if (
            frames.length <=
            1
        ) {

            s24RenderAnimationFrame(
                s24AnimFrame(
                    frames[0] || {}
                )
            );

            s24Animation.running =
                false;

            s24UpdateAnimationUi(
                0,
                1
            );

            return;
        }

        const i =
            Math.min(
                s24Animation.segmentIndex,
                frames.length -
                2
            );

        const duration =
            (
                s24AnimationDuration(
                    frames[i]
                ) *
                1000
            ) /
            Math.max(
                .1,
                s24Animation.speed
            );

        if (
            !s24Animation.segmentStart
        ) {

            s24Animation.segmentStart =
                now -
                (
                    s24Animation.pausedProgress *
                    duration
                );

        }

        const raw =
            (
                now -
                s24Animation.segmentStart
            ) /
            duration;

        const progress =
            s24Clamp(
                raw
            );

        const eased =
            s24Ease(
                progress
            );

        const interpolated =
            s24InterpolateFrame(
                frames[i],
                frames[i+1],
                eased
            );

        s24RenderAnimationFrame(
            interpolated
        );

        s24UpdateAnimationUi(
            i,
            progress
        );

        if (
            raw >=
            1
        ) {

            s24Animation.segmentIndex =
                i +
                1;

            s24Animation.segmentStart =
                0;

            s24Animation.pausedProgress =
                0;

            if (
                s24Animation.segmentIndex >=
                frames.length -
                1
            ) {

                s24RenderAnimationFrame(
                    s24AnimFrame(
                        frames[
                            frames.length -
                            1
                        ]
                    )
                );

                s24UpdateAnimationUi(
                    frames.length -
                    1,
                    1
                );

                if (
                    s24Animation.loop
                ) {

                    s24Animation.segmentIndex =
                        0;

                    s24Animation.segmentStart =
                        now +
                        350;

                } else {

                    s24Animation.running =
                        false;

                    s24UpdateAnimationUi(
                        frames.length -
                        1,
                        1
                    );

                    return;

                }

            }

        }

        s24Animation.raf =
            requestAnimationFrame(
                s24AnimationTick
            );

    }


    function s24PlayAnimation() {

        if (
            !s24Animation.exercise
        ) {
            return;
        }

        s24Animation.running =
            true;

        s24Animation.segmentStart =
            0;

        cancelAnimationFrame(
            s24Animation.raf
        );

        s24Animation.raf =
            requestAnimationFrame(
                s24AnimationTick
            );

        s24UpdateAnimationUi(
            s24Animation.segmentIndex,
            s24Animation.pausedProgress
        );

    }


    function s24PauseAnimation() {

        if (
            !s24Animation.running
        ) {
            return;
        }

        const frames =
            s24Animation.exercise?.diagram?.frames ||
            [];

        const i =
            Math.min(
                s24Animation.segmentIndex,
                Math.max(
                    0,
                    frames.length -
                    2
                )
            );

        const duration =
            (
                s24AnimationDuration(
                    frames[i]
                ) *
                1000
            ) /
            Math.max(
                .1,
                s24Animation.speed
            );

        if (
            s24Animation.segmentStart
        ) {

            s24Animation.pausedProgress =
                s24Clamp(
                    (
                        performance.now() -
                        s24Animation.segmentStart
                    ) /
                    duration
                );

        }

        s24Animation.running =
            false;

        cancelAnimationFrame(
            s24Animation.raf
        );

        s24UpdateAnimationUi(
            s24Animation.segmentIndex,
            s24Animation.pausedProgress
        );

    }


    function s24RestartAnimation() {

        s24Animation.segmentIndex =
            0;

        s24Animation.segmentStart =
            0;

        s24Animation.pausedProgress =
            0;

        const first =
            s24Animation.exercise?.diagram?.frames?.[0];

        if (
            first
        ) {

            s24RenderAnimationFrame(
                s24AnimFrame(
                    first
                )
            );

        }

        s24UpdateAnimationUi(
            0,
            0
        );

        s24PlayAnimation();

    }


    function s24CloseAnimation() {

        s24PauseAnimation();

        if (
            document.fullscreenElement ===
            s24Animation.overlay
        ) {

            document.exitFullscreen?.();

        }

        s24Animation.overlay
            ?.remove();

        s24Animation.overlay =
            null;

        s24Animation.exercise =
            null;

    }


    function s24OpenAnimation(
        exercise
    ) {

        s24InstallStyles();

        if (
            !exercise
        ) {
            return;
        }

        exercise.diagram =
            typeof s19NormalizeDiagram ===
            "function"
                ? s19NormalizeDiagram(
                    exercise.diagram
                )
                : exercise.diagram;

        const frames =
            exercise.diagram?.frames ||
            [];

        if (
            !frames.length
        ) {

            if (
                typeof visNotification ===
                "function"
            ) {

                visNotification(
                    "Tilføj mindst ét trin til øvelsen først."
                );

            }

            return;
        }

        s24CloseAnimation();

        const overlay =
            document.createElement(
                "div"
            );

        overlay.className =
            "s24-animation-overlay";

        overlay.innerHTML = `

            <div class="s24-animation-top">

                <div class="s24-animation-title">
                    <strong>
                        ${s24Esc(exercise.title || "Øvelsesanimation")}
                    </strong>

                    <span>
                        START11 · TACTICAL MOTION PREVIEW
                    </span>
                </div>


                <div class="s24-animation-top-actions">

                    <button
                        type="button"
                        class="s23-btn"
                        id="s24AnimationFullscreen"
                    >
                        ⛶ FULD SKÆRM
                    </button>

                    <button
                        type="button"
                        class="s23-btn danger"
                        id="s24AnimationClose"
                    >
                        LUK
                    </button>

                </div>

            </div>


            <div class="s24-animation-main">

                <div
                    class="
                        s24-animation-stage
                        pitch-${s24Esc(exercise.diagram.pitch || "plain")}
                    "
                    id="s24AnimationStage"
                >

                    <div class="s24-anim-grass"></div>

                    <div class="s24-pitch-markings">
                        <div class="s24-pitch-midline"></div>
                        <div class="s24-pitch-circle"></div>
                        <div class="s24-pitch-box"></div>
                        <div class="s24-pitch-box right"></div>
                    </div>

                    <svg
                        class="s24-anim-svg"
                        id="s24AnimationSvg"
                        viewBox="0 0 1000 562.5"
                        preserveAspectRatio="none"
                    ></svg>

                    <div
                        class="s24-anim-elements"
                        id="s24AnimationElements"
                    ></div>

                    <div class="s24-animation-status">
                        <span class="dot"></span>
                        <span id="s24AnimationStatusText">
                            PAUSE
                        </span>
                    </div>

                </div>

            </div>


            <div class="s24-animation-bottom">

                <div class="s24-animation-controls">

                    <button
                        type="button"
                        class="s23-btn s24-play-btn"
                        id="s24AnimationPlay"
                    >
                        ▶ AFSPIL
                    </button>

                    <button
                        type="button"
                        class="s23-btn"
                        id="s24AnimationRestart"
                    >
                        ↺ START FORFRA
                    </button>

                    <button
                        type="button"
                        class="s23-btn active"
                        id="s24AnimationLoop"
                    >
                        LOOP
                    </button>

                    <select
                        class="s13sel"
                        id="s24AnimationSpeed"
                        style="width:76px;"
                    >
                        <option value=".5">0.5×</option>
                        <option value=".75">0.75×</option>
                        <option value="1" selected>1×</option>
                        <option value="1.25">1.25×</option>
                        <option value="1.5">1.5×</option>
                        <option value="2">2×</option>
                    </select>

                </div>


                <div class="s24-progress-track">
                    <div
                        class="s24-progress-bar"
                        id="s24AnimationProgress"
                    ></div>
                </div>


                <div
                    class="s24-animation-frame-label"
                    id="s24AnimationFrameLabel"
                >
                    1 / ${frames.length}
                </div>

            </div>
        `;

        document.body.appendChild(
            overlay
        );

        s24Animation.overlay =
            overlay;

        s24Animation.exercise =
            exercise;

        s24Animation.running =
            false;

        s24Animation.segmentIndex =
            0;

        s24Animation.segmentStart =
            0;

        s24Animation.pausedProgress =
            0;

        s24Animation.speed =
            1;

        s24Animation.loop =
            true;

        s24RenderAnimationFrame(
            s24AnimFrame(
                frames[0]
            )
        );

        s24UpdateAnimationUi(
            0,
            0
        );


        overlay.querySelector(
            "#s24AnimationPlay"
        )
            ?.addEventListener(
                "click",
                () => {

                    if (
                        s24Animation.running
                    ) {

                        s24PauseAnimation();

                    } else {

                        s24PlayAnimation();

                    }

                }
            );


        overlay.querySelector(
            "#s24AnimationRestart"
        )
            ?.addEventListener(
                "click",
                s24RestartAnimation
            );


        overlay.querySelector(
            "#s24AnimationClose"
        )
            ?.addEventListener(
                "click",
                s24CloseAnimation
            );


        overlay.querySelector(
            "#s24AnimationLoop"
        )
            ?.addEventListener(
                "click",
                event => {

                    s24Animation.loop =
                        !s24Animation.loop;

                    event.currentTarget.classList.toggle(
                        "active",
                        s24Animation.loop
                    );

                }
            );


        overlay.querySelector(
            "#s24AnimationSpeed"
        )
            ?.addEventListener(
                "change",
                event => {

                    const wasRunning =
                        s24Animation.running;

                    if (
                        wasRunning
                    ) {
                        s24PauseAnimation();
                    }

                    s24Animation.speed =
                        Number(
                            event.target.value ||
                            1
                        );

                    if (
                        wasRunning
                    ) {
                        s24PlayAnimation();
                    }

                }
            );


        overlay.querySelector(
            "#s24AnimationFullscreen"
        )
            ?.addEventListener(
                "click",
                async () => {

                    try {

                        if (
                            document.fullscreenElement ===
                            overlay
                        ) {

                            await document.exitFullscreen?.();

                        } else {

                            await overlay.requestFullscreen?.();

                        }

                    } catch {

                    }

                }
            );

    }


    window.s24OpenAnimation =
        s24OpenAnimation;


    /* =====================================================
       V24 – INJECT ANIMATION + FULLSCREEN INTO V23 DESIGNER
    ===================================================== */

    const s24DesignerRenderBase =
        typeof s19RenderDiagramBoard ===
        "function"
            ? s19RenderDiagramBoard
            : null;


    if (
        s24DesignerRenderBase
    ) {

        s19RenderDiagramBoard =
            function (
                exercise
            ) {

                s24DesignerRenderBase(
                    exercise
                );

                s24InstallStyles();

                const designer =
                    document.querySelector(
                        "#s19DiagramHost .s23-pro-designer"
                    );

                if (
                    !designer
                ) {
                    return;
                }

                const topbar =
                    designer.querySelector(
                        ".s23-topbar"
                    );

                if (
                    topbar &&
                    !topbar.querySelector(
                        ".s24-editor-actions"
                    )
                ) {

                    const actions =
                        document.createElement(
                            "div"
                        );

                    actions.className =
                        "s24-editor-actions";

                    actions.innerHTML = `

                        <button
                            type="button"
                            class="s23-btn s24-play-btn"
                            data-s24-animate="1"
                        >
                            ▶ ANIMER ØVELSE
                        </button>

                        <button
                            type="button"
                            class="s23-btn"
                            data-s24-fullscreen="1"
                        >
                            ⛶ FULD SKÆRM
                        </button>

                    `;

                    topbar.appendChild(
                        actions
                    );


                    actions.querySelector(
                        "[data-s24-animate]"
                    )
                        ?.addEventListener(
                            "click",
                            () =>
                                s24OpenAnimation(
                                    exercise
                                )
                        );


                    actions.querySelector(
                        "[data-s24-fullscreen]"
                    )
                        ?.addEventListener(
                            "click",
                            async () => {

                                try {

                                    if (
                                        document.fullscreenElement ===
                                        designer
                                    ) {

                                        await document.exitFullscreen?.();

                                    } else if (
                                        designer.requestFullscreen
                                    ) {

                                        await designer.requestFullscreen();

                                    } else {

                                        designer.classList.toggle(
                                            "s24-fallback-fullscreen"
                                        );

                                    }

                                } catch {

                                    designer.classList.toggle(
                                        "s24-fallback-fullscreen"
                                    );

                                }

                            }
                        );

                }

                const framebar =
                    designer.querySelector(
                        ".s23-framebar"
                    );

                if (
                    framebar &&
                    !framebar.querySelector(
                        "[data-s24-animate-small]"
                    )
                ) {

                    const play =
                        document.createElement(
                            "button"
                        );

                    play.type =
                        "button";

                    play.className =
                        "s23-btn s24-play-btn";

                    play.dataset.s24AnimateSmall =
                        "1";

                    play.textContent =
                        "▶ PREVIEW";

                    play.addEventListener(
                        "click",
                        () =>
                            s24OpenAnimation(
                                exercise
                            )
                    );

                    framebar.appendChild(
                        play
                    );

                }

            };

    }


    /* =====================================================
       V24 – MODERN MATCH PDF
    ===================================================== */

    function s24PdfTheme() {

        const fallback = {
            primaryColor:"#82FF54",
            secondaryColor:"#54D92F",
            surfaceAccent:"#08130B",
            playerShirtColor:"#C8FF00",
            playerShirtTextColor:"#071008",
            goalkeeperShirtColor:"#E31D1D",
            goalkeeperShirtTextColor:"#FFFFFF",
            nameplateColor:"#071008",
            nameplateTextColor:"#FFFFFF"
        };

        try {

            if (
                typeof start11V9GetActiveTheme ===
                "function"
            ) {

                return {
                    ...fallback,
                    ...start11V9GetActiveTheme()
                };

            }

            if (
                typeof start11V9CurrentTheme !==
                "undefined"
            ) {

                return {
                    ...fallback,
                    ...start11V9CurrentTheme
                };

            }

        } catch {

        }

        return fallback;

    }


    function s24PdfSplitLines(
        text
    ) {

        return String(
            text ||
            ""
        )
            .split(
                /\n|•|;/g
            )
            .map(
                item =>
                    item
                        .replace(
                            /^[-–—]\s*/,
                            ""
                        )
                        .trim()
            )
            .filter(
                Boolean
            );

    }


    function s24PdfIcon(
        type
    ) {

        const icons = {

            date:
                `<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4M17 3v4M3 10h18"/></svg>`,

            time:
                `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg>`,

            place:
                `<svg viewBox="0 0 24 24"><path d="M12 22s7-6.1 7-13A7 7 0 0 0 5 9c0 6.9 7 13 7 13Z"/><circle cx="12" cy="9" r="2.5"/></svg>`,

            ball:
                `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m12 7 3 2-1 4h-4L9 9l3-2Zm-3 6-4 2m9-2 5 2M9 9 6 6m9 3 3-3"/></svg>`,

            press:
                `<svg viewBox="0 0 24 24"><path d="M4 19 9 5l3 6 4-7 4 15"/><path d="M6 16h12"/></svg>`,

            info:
                `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 10v7M12 7h.01"/></svg>`

        };

        return `
            <span class="v24-icon">
                ${icons[type] || icons.info}
            </span>
        `;

    }


    function s24PdfLogo(
        src,
        fallback
    ) {

        return src
            ? `
                <div class="v24-logo-wrap">
                    <img
                        src="${src}"
                        alt=""
                    >
                </div>
            `
            : `
                <div class="v24-logo-wrap fallback">
                    ${s24Esc(fallback || "START11")}
                </div>
            `;

    }


    function s24PdfShirt(
        player,
        keeper = false,
        small = false
    ) {

        const number =
            s24Esc(
                player?.number ||
                ""
            );

        const theme =
            s24PdfTheme();

        const shirtColor =
            keeper
                ? theme.goalkeeperShirtColor
                : theme.playerShirtColor;

        const numberColor =
            keeper
                ? theme.goalkeeperShirtTextColor
                : theme.playerShirtTextColor;

        return `
            <svg
                class="
                    v24-shirt-svg
                    ${keeper ? "keeper" : ""}
                    ${small ? "small" : ""}
                "
                style="
                    --v24-shirt-color:${shirtColor};
                    --v24-shirt-number:${numberColor};
                "
                viewBox="0 0 84 84"
                aria-hidden="true"
            >
                <path
                    d="
                        M29 10
                        L37 5
                        Q42 10 47 5
                        L55 10
                        L72 18
                        L64 34
                        L56 30
                        L56 73
                        Q42 79 28 73
                        L28 30
                        L20 34
                        L12 18
                        Z
                    "
                />

                <path
                    class="collar"
                    d="
                        M35 8
                        Q42 15 49 8
                    "
                />

                <text
                    x="42"
                    y="47"
                    text-anchor="middle"
                    dominant-baseline="middle"
                >
                    ${number}
                </text>
            </svg>
        `;

    }


    function s24ModernLineup() {

        const formation =
            formationer[
                formationSelector.value
            ] ||
            [];

        const nodes =
            formation
                .map(
                    (
                        position,
                        index
                    ) => {

                        const player =
                            spillere[index];

                        if (
                            !player
                        ) {
                            return "";
                        }

                        const [
                            role,
                            x,
                            y
                        ] =
                            position;

                        const keeper =
                            player.position ===
                            "GK" ||
                            role ===
                            "GK";

                        return `
                            <div
                                class="v24-lineup-player"
                                style="
                                    left:${x}%;
                                    top:${y}%;
                                "
                            >
                                ${s24PdfShirt(player,keeper)}

                                <div class="v24-lineup-name">
                                    ${s24Esc(player.name)}
                                </div>

                                <div class="v24-lineup-role">
                                    ${s24Esc(role)}
                                </div>
                            </div>
                        `;

                    }
                )
                .join(
                    ""
                );

        return `
            <div class="v24-lineup-shell">

                <div class="v24-lineup-top">

                    <div>
                        <div class="v24-kicker">
                            START11 · STARTOPSTILLING
                        </div>

                        <div class="v24-lineup-title">
                            STARTING XI
                        </div>
                    </div>

                    <div class="v24-formation-pill">
                        ${s24Esc(
                            formationSelector.options[
                                formationSelector.selectedIndex
                            ]?.text ||
                            formationSelector.value ||
                            ""
                        )}
                    </div>

                </div>


                <div class="v24-pitch">

                    <div class="v24-pitch-stripes"></div>

                    <div class="v24-pitch-frame">
                        <div class="v24-pitch-halfway"></div>
                        <div class="v24-pitch-circle"></div>
                        <div class="v24-pitch-dot"></div>

                        <div class="v24-pitch-penalty top"></div>
                        <div class="v24-pitch-goalarea top"></div>
                        <div class="v24-pitch-penalty bottom"></div>
                        <div class="v24-pitch-goalarea bottom"></div>
                    </div>

                    ${nodes}

                    <div class="v24-pitch-watermark">
                        START11
                    </div>

                </div>

            </div>
        `;

    }


    function s24ModernSubs() {

        const players =
            (udskiftere || [])
                .filter(
                    Boolean
                );

        if (
            !players.length
        ) {

            return `
                <div class="v24-empty-copy">
                    Ingen udskiftere registreret.
                </div>
            `;

        }

        return `
            <div class="v24-sub-grid">
                ${
                    players
                        .map(
                            player => `
                                <div class="v24-sub-card">

                                    ${s24PdfShirt(player,false,true)}

                                    <div>
                                        <strong>
                                            ${s24Esc(player.name)}
                                        </strong>

                                        <span>
                                            #${s24Esc(player.number || "—")}
                                            ·
                                            ${s24Esc(player.position || "—")}
                                        </span>
                                    </div>

                                </div>
                            `
                        )
                        .join(
                            ""
                        )
                }
            </div>
        `;

    }


    function s24TacticList(
        text,
        type
    ) {

        const rows =
            s24PdfSplitLines(
                text
            );

        if (
            !rows.length
        ) {

            return `
                <div class="v24-empty-copy">
                    Ingen fokuspunkter tilføjet.
                </div>
            `;

        }

        return `
            <div class="v24-principles">
                ${
                    rows
                        .slice(
                            0,
                            7
                        )
                        .map(
                            (
                                row,
                                index
                            ) => `
                                <div class="v24-principle">

                                    <div class="v24-principle-index">
                                        ${index+1}
                                    </div>

                                    <div>
                                        <strong>
                                            ${
                                                type ===
                                                "with"
                                                    ? "MED BOLD"
                                                    : "UDEN BOLD"
                                            }
                                        </strong>

                                        <p>
                                            ${s24Esc(row)}
                                        </p>
                                    </div>

                                </div>
                            `
                        )
                        .join(
                            ""
                        )
                }
            </div>
        `;

    }


    function s24PlayerFocusBullets(text) {

        const raw =
            String(text || "")
                .replace(/\r/g, "")
                .trim();

        if (!raw) {
            return `<span class="v24-focus-empty">—</span>`;
        }

        /*
            Understøtter både:
            - linjeskift
            - eksisterende bullets
            - flere fokuspunkter skrevet efter hinanden:
              "Vi vil ... Vi vil ..."
              "Vi skal ... Vi skal ..."
        */
        const points =
            raw
                .replace(/[•●▪◦]\s*/g, "\n")
                .replace(/\s+(?=(?:Vi|Jeg)\s+(?:vil|skal|kan|må|ønsker|arbejder|fokuserer)\b)/gi, "\n")
                .split(/\n+/)
                .map(point =>
                    point
                        .trim()
                        .replace(/^[-–—]\s*/, "")
                        .trim()
                )
                .filter(Boolean);

        return `
            <ul class="v24-focus-bullets">
                ${
                    points
                        .map(
                            point => `
                                <li>
                                    ${s24Esc(point)}
                                </li>
                            `
                        )
                        .join("")
                }
            </ul>
        `;

    }


    function s24PlayerFocusPages() {

        const players = [

            ...(spillere || [])
                .filter(Boolean)
                .map(
                    player => ({
                        ...player,
                        pdfPlayerStatus:
                            "STARTOPSTILLING"
                    })
                ),

            ...(udskiftere || [])
                .filter(Boolean)
                .map(
                    player => ({
                        ...player,
                        pdfPlayerStatus:
                            "UDSKIFTER"
                    })
                )

        ];

        if (
            !players.length
        ) {
            return "";
        }

        const pages =
            [];

        for (
            let i = 0;
            i < players.length;
            i += 4
        ) {

            const pagePlayers =
                players.slice(
                    i,
                    i +
                    4
                );

            pages.push(`
                <section class="pdf-page v24-page v24-focus-page">

                    <div class="v24-top-rule"></div>

                    <div class="v24-page-head">

                        <div>
                            <div class="v24-kicker">
                                INDIVIDUELT FOKUS
                            </div>

                            <h1>
                                SPILLERPLAN
                            </h1>
                        </div>

                        <div class="v24-page-no">
                            ${Math.floor(i/4)+1}
                        </div>

                    </div>


                    <div class="v24-focus-grid">

                        ${
                            pagePlayers
                                .map(
                                    player => {

                                        const withBall =
                                            player.focusWithBall ||
                                            "";

                                        const withoutBall =
                                            player.focusWithoutBall ||
                                            "";

                                        const strengths =
                                            player.strengths ||
                                            "";

                                        return `
                                            <article class="v24-player-focus-card">

                                                <div class="v24-player-focus-head">

                                                    ${s24PdfShirt(
                                                        player,
                                                        player.position==="GK",
                                                        true
                                                    )}

                                                    <div>
                                                        <div class="v24-player-status">
                                                            ${s24Esc(player.pdfPlayerStatus)}
                                                        </div>

                                                        <h2>
                                                            ${s24Esc(player.name)}
                                                        </h2>

                                                        <div class="v24-player-meta">
                                                            #${s24Esc(player.number || "—")}
                                                            ·
                                                            ${s24Esc(player.position || "—")}
                                                        </div>
                                                    </div>

                                                </div>


                                                ${
                                                    strengths
                                                        ? `
                                                            <div class="v24-focus-line">
                                                                <strong>STYRKE</strong>
                                                                <span>${s24Esc(strengths)}</span>
                                                            </div>
                                                        `
                                                        : ""
                                                }

                                                <div class="v24-focus-line accent">
                                                    <strong>MED BOLD</strong>
                                                    ${s24PlayerFocusBullets(withBall)}
                                                </div>

                                                <div class="v24-focus-line">
                                                    <strong>UDEN BOLD</strong>
                                                    ${s24PlayerFocusBullets(withoutBall)}
                                                </div>

                                            </article>
                                        `;

                                    }
                                )
                                .join(
                                    ""
                                )
                        }

                    </div>


                    <div class="v24-pdf-footer">
                        START11 · SPILLERSPECIFIKKE FOKUSPUNKTER
                    </div>

                </section>
            `);

        }

        return pages.join(
            ""
        );

    }


    function s24ModernPdfStyles() {

        const theme =
            s24PdfTheme();

        return `
            <style id="v24-modern-match-pdf">

                #pdfDocument {
                    --v24-bg:${theme.surfaceAccent || "#07100c"};
                    --v24-card:#0d1812;
                    --v24-card2:#111f17;
                    --v24-ink:#f5f8f6;
                    --v24-muted:#9aa79f;
                    --v24-line:rgba(255,255,255,.12);
                    --v24-accent:${theme.primaryColor};
                    --v24-accent2:${theme.secondaryColor};
                    --v24-shirt:${theme.playerShirtColor};
                    --v24-shirt-text:${theme.playerShirtTextColor};
                    --v24-gk-shirt:${theme.goalkeeperShirtColor};
                    --v24-gk-shirt-text:${theme.goalkeeperShirtTextColor};
                    --v24-nameplate:${theme.nameplateColor};
                    --v24-nameplate-text:${theme.nameplateTextColor};
                    --v24-danger:#ff6d6d;
                    color:var(--v24-ink);
                    background:#050907;
                    font-family:
                        Inter,
                        ui-sans-serif,
                        system-ui,
                        -apple-system,
                        BlinkMacSystemFont,
                        "Segoe UI",
                        Arial,
                        sans-serif;
                }

                #pdfDocument * {
                    box-sizing:border-box;
                }

                #pdfDocument .pdf-page.v24-page {
                    position:relative;
                    width:210mm;
                    min-height:297mm;
                    height:297mm;
                    margin:0 auto;
                    overflow:hidden;
                    break-after:page;
                    page-break-after:always;
                    background:
                        radial-gradient(circle at 90% 0%,rgba(72,166,88,.16),transparent 28%),
                        linear-gradient(145deg,#07100c,#050806 62%,#08110c);
                    color:var(--v24-ink);
                }

                #pdfDocument .v24-page::before {
                    content:"";
                    position:absolute;
                    inset:0;
                    pointer-events:none;
                    opacity:.18;
                    background-image:
                        linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),
                        linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px);
                    background-size:10mm 10mm;
                    mask-image:linear-gradient(to bottom,#000,transparent 80%);
                }

                #pdfDocument .v24-top-rule {
                    position:absolute;
                    top:0;
                    left:0;
                    width:100%;
                    height:2.3mm;
                    background:
                        linear-gradient(
                            90deg,
                            var(--v24-accent) 0 34%,
                            var(--v24-accent2) 34% 46%,
                            rgba(255,255,255,.92) 46% 61%,
                            transparent 61%
                        );
                    z-index:20;
                }

                #pdfDocument .v24-page-content {
                    position:relative;
                    z-index:5;
                    height:100%;
                    padding:13mm 13mm 11mm;
                }

                #pdfDocument .v24-page-head {
                    position:relative;
                    z-index:5;
                    display:flex;
                    justify-content:space-between;
                    align-items:flex-start;
                    gap:10mm;
                    padding:13mm 13mm 0;
                }

                #pdfDocument .v24-page-head h1 {
                    margin:1.5mm 0 0;
                    font-size:23pt;
                    line-height:.95;
                    letter-spacing:-1px;
                    color:#fff;
                    font-weight:950;
                }

                #pdfDocument .v24-page-no {
                    width:11mm;
                    height:11mm;
                    display:grid;
                    place-items:center;
                    border:1px solid var(--v24-line);
                    border-radius:50%;
                    color:var(--v24-accent);
                    font-size:8pt;
                    font-weight:900;
                }

                #pdfDocument .v24-kicker {
                    color:var(--v24-accent);
                    font-size:7.2pt;
                    font-weight:950;
                    letter-spacing:1.7px;
                    text-transform:uppercase;
                }

                #pdfDocument .v24-pdf-footer {
                    position:absolute;
                    left:13mm;
                    right:13mm;
                    bottom:7mm;
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    gap:8mm;
                    color:#6e7c73;
                    font-size:6.6pt;
                    font-weight:800;
                    letter-spacing:1.1px;
                    text-transform:uppercase;
                    z-index:9;
                }

                /* ----- Cover ----- */

                #pdfDocument .v24-cover {
                    background:#030605;
                }

                #pdfDocument .v24-cover-bg {
                    position:absolute;
                    inset:0;
                    z-index:0;
                    overflow:hidden;
                }

                #pdfDocument .v24-cover-bg img {
                    width:100%;
                    height:100%;
                    object-fit:cover;
                    filter:grayscale(1) contrast(1.05) brightness(.42);
                }

                #pdfDocument .v24-cover-bg::after {
                    content:"";
                    position:absolute;
                    inset:0;
                    background:
                        linear-gradient(
                            90deg,
                            rgba(3,7,5,.98) 0 46%,
                            rgba(3,7,5,.78) 64%,
                            rgba(3,7,5,.35) 100%
                        ),
                        linear-gradient(
                            0deg,
                            rgba(3,7,5,.94),
                            transparent 42%
                        );
                }

                #pdfDocument .v24-cover-noimage {
                    position:absolute;
                    inset:0;
                    background:
                        radial-gradient(circle at 80% 25%,rgba(89,202,99,.2),transparent 28%),
                        linear-gradient(135deg,#08120d,#020403 70%);
                }

                #pdfDocument .v24-cover-content {
                    position:relative;
                    z-index:5;
                    height:100%;
                    padding:15mm 14mm 12mm;
                    display:flex;
                    flex-direction:column;
                }

                #pdfDocument .v24-cover-brand {
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    gap:8mm;
                    font-size:6.8pt;
                    letter-spacing:1.6px;
                    font-weight:850;
                    color:#dfe6e1;
                }

                #pdfDocument .v24-cover-brand span:last-child {
                    color:#76837a;
                }

                #pdfDocument .v24-cover-title {
                    margin-top:24mm;
                    max-width:150mm;
                }

                #pdfDocument .v24-cover-title .small {
                    color:var(--v24-accent);
                    font-size:11pt;
                    font-weight:900;
                    letter-spacing:2px;
                }

                #pdfDocument .v24-cover-title h1 {
                    margin:2mm 0 0;
                    font-size:51pt;
                    line-height:.82;
                    letter-spacing:-3.2px;
                    font-weight:1000;
                    text-transform:uppercase;
                }

                #pdfDocument .v24-cover-title h1 span {
                    color:var(--v24-accent);
                }

                #pdfDocument .v24-matchup {
                    margin-top:18mm;
                    display:grid;
                    grid-template-columns:1fr 22mm 1fr;
                    align-items:center;
                    gap:8mm;
                    max-width:168mm;
                }

                #pdfDocument .v24-team {
                    display:flex;
                    align-items:center;
                    gap:5mm;
                    min-width:0;
                }

                #pdfDocument .v24-team.away {
                    flex-direction:row-reverse;
                    text-align:right;
                }

                #pdfDocument .v24-team strong {
                    display:block;
                    font-size:13pt;
                    line-height:1;
                    font-weight:950;
                }

                #pdfDocument .v24-team span {
                    display:block;
                    margin-top:1mm;
                    color:#859188;
                    font-size:7pt;
                    letter-spacing:.8px;
                }

                #pdfDocument .v24-logo-wrap {
                    width:22mm;
                    height:22mm;
                    flex:0 0 22mm;
                    display:grid;
                    place-items:center;
                    border:1px solid rgba(255,255,255,.18);
                    border-radius:5mm;
                    background:rgba(255,255,255,.055);
                    overflow:hidden;
                    font-size:7pt;
                    font-weight:950;
                    text-align:center;
                }

                #pdfDocument .v24-logo-wrap img {
                    width:80%;
                    height:80%;
                    object-fit:contain;
                }

                #pdfDocument .v24-logo-wrap.fallback {
                    color:#fff;
                    padding:2mm;
                }

                #pdfDocument .v24-vs {
                    width:19mm;
                    height:19mm;
                    display:grid;
                    place-items:center;
                    border:1px solid rgba(255,255,255,.18);
                    border-radius:50%;
                    color:var(--v24-accent);
                    font-size:8pt;
                    font-weight:950;
                    letter-spacing:1px;
                }

                #pdfDocument .v24-cover-meta {
                    margin-top:12mm;
                    display:flex;
                    flex-wrap:wrap;
                    gap:3mm;
                    max-width:170mm;
                }

                #pdfDocument .v24-meta-chip {
                    min-height:11mm;
                    display:flex;
                    align-items:center;
                    gap:3mm;
                    padding:2.5mm 4mm;
                    border:1px solid rgba(255,255,255,.12);
                    border-radius:3mm;
                    background:rgba(7,13,9,.68);
                    backdrop-filter:blur(8px);
                    color:#edf2ef;
                    font-size:7.5pt;
                    font-weight:750;
                }

                #pdfDocument .v24-icon {
                    width:5mm;
                    height:5mm;
                    display:grid;
                    place-items:center;
                    color:var(--v24-accent);
                }

                #pdfDocument .v24-icon svg {
                    width:100%;
                    height:100%;
                    fill:none;
                    stroke:currentColor;
                    stroke-width:1.8;
                    stroke-linecap:round;
                    stroke-linejoin:round;
                }

                #pdfDocument .v24-cover-bottom {
                    margin-top:auto;
                    display:grid;
                    grid-template-columns:1fr auto;
                    align-items:end;
                    gap:10mm;
                }

                #pdfDocument .v24-cover-quote {
                    max-width:118mm;
                    padding-left:5mm;
                    border-left:1.5mm solid var(--v24-accent);
                }

                #pdfDocument .v24-cover-quote strong {
                    display:block;
                    font-size:13pt;
                    line-height:1.12;
                }

                #pdfDocument .v24-cover-quote span {
                    display:block;
                    margin-top:2mm;
                    color:#77857c;
                    font-size:7pt;
                    letter-spacing:.8px;
                }

                #pdfDocument .v24-cover-mark {
                    font-size:7pt;
                    color:#718078;
                    letter-spacing:2px;
                    font-weight:900;
                    writing-mode:vertical-rl;
                    transform:rotate(180deg);
                }

                /* ----- General cards ----- */

                #pdfDocument .v24-grid-2 {
                    display:grid;
                    grid-template-columns:1fr 1fr;
                    gap:5mm;
                }

                #pdfDocument .v24-card {
                    border:1px solid var(--v24-line);
                    border-radius:4mm;
                    background:
                        linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.018));
                    overflow:hidden;
                }

                #pdfDocument .v24-card-head {
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    gap:5mm;
                    padding:4mm 4.5mm;
                    border-bottom:1px solid var(--v24-line);
                }

                #pdfDocument .v24-card-head strong {
                    font-size:8pt;
                    letter-spacing:.9px;
                    text-transform:uppercase;
                }

                #pdfDocument .v24-card-body {
                    padding:4.5mm;
                }

                #pdfDocument .v24-copy {
                    white-space:pre-wrap;
                    color:#d9e0dc;
                    font-size:8.7pt;
                    line-height:1.58;
                }

                #pdfDocument .v24-empty-copy {
                    color:#6f7c74;
                    font-size:8pt;
                    font-style:italic;
                }

                #pdfDocument .v24-info-row {
                    display:grid;
                    grid-template-columns:8mm 1fr;
                    gap:3mm;
                    align-items:start;
                    padding:3mm 0;
                    border-bottom:1px solid rgba(255,255,255,.07);
                }

                #pdfDocument .v24-info-row:last-child {
                    border-bottom:0;
                }

                #pdfDocument .v24-info-row .v24-icon {
                    margin-top:.5mm;
                }

                #pdfDocument .v24-info-row strong {
                    display:block;
                    color:#fff;
                    font-size:7.5pt;
                }

                #pdfDocument .v24-info-row span {
                    display:block;
                    margin-top:.8mm;
                    color:#8e9a92;
                    font-size:7.5pt;
                    line-height:1.4;
                }

                /* ----- Starting XI ----- */

                #pdfDocument .v24-lineup-page .v24-page-content {
                    padding-top:12mm;
                }

                #pdfDocument .v24-lineup-shell {
                    height:234mm;
                    display:grid;
                    grid-template-rows:auto 1fr;
                    gap:4mm;
                }

                #pdfDocument .v24-lineup-top {
                    display:flex;
                    justify-content:space-between;
                    align-items:end;
                    gap:8mm;
                }

                #pdfDocument .v24-lineup-title {
                    margin-top:1mm;
                    font-size:24pt;
                    line-height:.9;
                    letter-spacing:-1.3px;
                    font-weight:1000;
                }

                #pdfDocument .v24-formation-pill {
                    padding:2.4mm 4mm;
                    border:1px solid rgba(112,229,129,.35);
                    border-radius:99px;
                    background:rgba(112,229,129,.08);
                    color:var(--v24-accent);
                    font-size:10pt;
                    font-weight:950;
                    letter-spacing:.8px;
                }

                #pdfDocument .v24-pitch {
                    position:relative;
                    border:1px solid rgba(255,255,255,.12);
                    border-radius:4mm;
                    overflow:hidden;
                    background:
                        linear-gradient(
                            180deg,
                            rgba(11,57,27,.02),
                            rgba(3,23,12,.22)
                        ),
                        #176a34;
                    box-shadow:
                        0 18px 35px rgba(0,0,0,.23) inset,
                        0 0 0 1px rgba(0,0,0,.25);
                }

                #pdfDocument .v24-pitch-stripes {
                    position:absolute;
                    inset:0;
                    background:
                        repeating-linear-gradient(
                            0deg,
                            rgba(255,255,255,.025) 0 11.111%,
                            rgba(0,0,0,.028) 11.111% 22.222%
                        );
                }

                #pdfDocument .v24-pitch-frame {
                    position:absolute;
                    inset:5mm;
                    border:.7mm solid rgba(255,255,255,.58);
                }

                #pdfDocument .v24-pitch-halfway {
                    position:absolute;
                    left:0;
                    right:0;
                    top:50%;
                    height:.6mm;
                    background:rgba(255,255,255,.55);
                    transform:translateY(-50%);
                }

                #pdfDocument .v24-pitch-circle {
                    position:absolute;
                    width:28mm;
                    height:28mm;
                    left:50%;
                    top:50%;
                    transform:translate(-50%,-50%);
                    border:.7mm solid rgba(255,255,255,.55);
                    border-radius:50%;
                }

                #pdfDocument .v24-pitch-dot {
                    position:absolute;
                    width:1.8mm;
                    height:1.8mm;
                    left:50%;
                    top:50%;
                    transform:translate(-50%,-50%);
                    background:rgba(255,255,255,.7);
                    border-radius:50%;
                }

                #pdfDocument .v24-pitch-penalty,
                #pdfDocument .v24-pitch-goalarea {
                    position:absolute;
                    left:50%;
                    transform:translateX(-50%);
                    border:.7mm solid rgba(255,255,255,.55);
                }

                #pdfDocument .v24-pitch-penalty {
                    width:65mm;
                    height:27mm;
                }

                #pdfDocument .v24-pitch-goalarea {
                    width:31mm;
                    height:11mm;
                }

                #pdfDocument .v24-pitch-penalty.top,
                #pdfDocument .v24-pitch-goalarea.top {
                    top:-.7mm;
                }

                #pdfDocument .v24-pitch-penalty.bottom,
                #pdfDocument .v24-pitch-goalarea.bottom {
                    bottom:-.7mm;
                }

                #pdfDocument .v24-lineup-player {
                    position:absolute;
                    transform:translate(-50%,-50%);
                    width:26mm;
                    text-align:center;
                    z-index:8;
                }

                #pdfDocument .v24-shirt-svg {
                    display:block;
                    width:17mm;
                    height:17mm;
                    margin:0 auto;
                    filter:drop-shadow(0 2mm 2mm rgba(0,0,0,.28));
                }

                #pdfDocument .v24-shirt-svg path:first-child {
                    fill:var(--v24-shirt-color,var(--v24-shirt));
                    stroke:color-mix(in srgb,var(--v24-shirt-color,var(--v24-shirt)) 32%,#ffffff);
                    stroke-width:2.2;
                }

                #pdfDocument .v24-shirt-svg.keeper path:first-child {
                    fill:var(--v24-shirt-color,var(--v24-gk-shirt));
                    stroke:color-mix(in srgb,var(--v24-shirt-color,var(--v24-gk-shirt)) 32%,#ffffff);
                }

                #pdfDocument .v24-shirt-svg .collar {
                    fill:none;
                    stroke:#8d9a92;
                    stroke-width:2;
                    stroke-linecap:round;
                }

                #pdfDocument .v24-shirt-svg text {
                    fill:var(--v24-shirt-number,var(--v24-shirt-text));
                    font-size:22px;
                    font-weight:950;
                    font-family:Arial,sans-serif;
                }

                #pdfDocument .v24-shirt-svg.keeper text {
                    fill:var(--v24-shirt-number,var(--v24-gk-shirt-text));
                }

                #pdfDocument .v24-shirt-svg.small {
                    width:12mm;
                    height:12mm;
                    margin:0;
                    flex:0 0 12mm;
                }

                #pdfDocument .v24-lineup-name {
                    display:inline-block;
                    max-width:27mm;
                    margin-top:-1.5mm;
                    padding:1mm 2mm;
                    border:1px solid rgba(255,255,255,.12);
                    border-radius:1.3mm;
                    background:var(--v24-nameplate);
                    color:var(--v24-nameplate-text);
                    font-size:7pt;
                    line-height:1;
                    font-weight:950;
                    white-space:nowrap;
                    overflow:hidden;
                    text-overflow:ellipsis;
                }

                #pdfDocument .v24-lineup-role {
                    width:max-content;
                    margin:.7mm auto 0;
                    padding:.6mm 1.5mm;
                    border-radius:99px;
                    background:var(--v24-accent);
                    color:#07100c;
                    font-size:5.4pt;
                    font-weight:950;
                }

                #pdfDocument .v24-pitch-watermark {
                    position:absolute;
                    left:50%;
                    top:50%;
                    transform:translate(-50%,-50%) rotate(-90deg);
                    color:rgba(255,255,255,.025);
                    font-size:58pt;
                    font-weight:1000;
                    letter-spacing:5px;
                    pointer-events:none;
                }

                #pdfDocument .v24-lineup-bottom {
                    margin-top:5mm;
                    display:grid;
                    grid-template-columns:1.35fr .65fr;
                    gap:5mm;
                }

                #pdfDocument .v24-sub-grid {
                    display:grid;
                    grid-template-columns:repeat(2,1fr);
                    gap:2.5mm;
                }

                #pdfDocument .v24-sub-card {
                    min-height:15mm;
                    display:flex;
                    align-items:center;
                    gap:2.5mm;
                    padding:2mm;
                    border:1px solid rgba(255,255,255,.1);
                    border-radius:2mm;
                    background:rgba(255,255,255,.025);
                }

                #pdfDocument .v24-sub-card strong {
                    display:block;
                    font-size:7pt;
                }

                #pdfDocument .v24-sub-card span {
                    display:block;
                    margin-top:.6mm;
                    color:#7f8c84;
                    font-size:5.7pt;
                }

                /* ----- Tactics ----- */

                #pdfDocument .v24-tactic-hero {
                    margin:9mm 13mm 0;
                    display:grid;
                    grid-template-columns:1fr 1fr;
                    gap:5mm;
                }

                #pdfDocument .v24-tactic-panel {
                    min-height:172mm;
                    padding:5mm;
                    border:1px solid var(--v24-line);
                    border-radius:4mm;
                    background:
                        linear-gradient(145deg,rgba(255,255,255,.04),rgba(255,255,255,.012));
                }

                #pdfDocument .v24-tactic-panel.with {
                    border-top:1.2mm solid var(--v24-accent);
                }

                #pdfDocument .v24-tactic-panel.without {
                    border-top:1.2mm solid #9ca9a0;
                }

                #pdfDocument .v24-tactic-panel h2 {
                    margin:0 0 5mm;
                    font-size:17pt;
                    letter-spacing:-.5px;
                }

                #pdfDocument .v24-principles {
                    display:flex;
                    flex-direction:column;
                    gap:3mm;
                }

                #pdfDocument .v24-principle {
                    display:grid;
                    grid-template-columns:8mm 1fr;
                    gap:3mm;
                    align-items:start;
                    padding:3mm 0;
                    border-bottom:1px solid rgba(255,255,255,.07);
                }

                #pdfDocument .v24-principle:last-child {
                    border-bottom:0;
                }

                #pdfDocument .v24-principle-index {
                    width:7mm;
                    height:7mm;
                    display:grid;
                    place-items:center;
                    border-radius:50%;
                    background:var(--v24-accent);
                    color:#07100c;
                    font-size:7pt;
                    font-weight:950;
                }

                #pdfDocument .v24-principle strong {
                    color:#7d8a82;
                    font-size:5.6pt;
                    letter-spacing:.9px;
                }

                #pdfDocument .v24-principle p {
                    margin:1mm 0 0;
                    color:#f0f4f1;
                    font-size:8.5pt;
                    line-height:1.35;
                }

                /* ----- Player focus ----- */

                #pdfDocument .v24-focus-grid {
                    position:relative;
                    z-index:4;
                    margin:8mm 13mm 18mm;
                    display:grid;
                    grid-template-columns:1fr 1fr;
                    gap:5mm;
                }

                #pdfDocument .v24-player-focus-card {
                    min-height:103mm;
                    padding:5mm;
                    border:1px solid var(--v24-line);
                    border-radius:4mm;
                    background:
                        radial-gradient(circle at 100% 0%,rgba(112,229,129,.08),transparent 30%),
                        rgba(255,255,255,.025);
                }

                #pdfDocument .v24-player-focus-head {
                    display:flex;
                    align-items:center;
                    gap:4mm;
                    padding-bottom:4mm;
                    border-bottom:1px solid var(--v24-line);
                }

                #pdfDocument .v24-player-focus-head h2 {
                    margin:1mm 0;
                    font-size:14pt;
                }

                #pdfDocument .v24-player-status {
                    color:var(--v24-accent);
                    font-size:5.5pt;
                    font-weight:950;
                    letter-spacing:1px;
                }

                #pdfDocument .v24-player-meta {
                    color:#7e8b83;
                    font-size:6.4pt;
                }

                #pdfDocument .v24-focus-line {
                    margin-top:4mm;
                    padding:3mm;
                    border-radius:2.5mm;
                    background:rgba(255,255,255,.028);
                }

                #pdfDocument .v24-focus-line.accent {
                    border-left:1mm solid var(--v24-accent);
                }

                #pdfDocument .v24-focus-line strong {
                    display:block;
                    color:#77847c;
                    font-size:5.5pt;
                    letter-spacing:1px;
                }

                #pdfDocument .v24-focus-line span {
                    display:block;
                    margin-top:1mm;
                    color:#f1f5f2;
                    font-size:8pt;
                    line-height:1.38;
                }

                #pdfDocument .v24-focus-bullets {
                    margin:1.4mm 0 0 0;
                    padding:0;
                    list-style:none;
                }

                #pdfDocument .v24-focus-bullets li {
                    position:relative;
                    margin:0 0 1.15mm 0;
                    padding-left:4mm;
                    color:#f1f5f2;
                    font-size:8pt;
                    line-height:1.34;
                }

                #pdfDocument .v24-focus-bullets li:last-child {
                    margin-bottom:0;
                }

                #pdfDocument .v24-focus-bullets li::before {
                    content:"•";
                    position:absolute;
                    left:.7mm;
                    top:0;
                    color:var(--v24-accent);
                    font-size:9pt;
                    font-weight:950;
                    line-height:1.2;
                }

                #pdfDocument .v24-focus-line:not(.accent) .v24-focus-bullets li::before {
                    color:#8e9b93;
                }

                #pdfDocument .v24-focus-empty {
                    display:block;
                    margin-top:1mm;
                    color:#7e8b83;
                    font-size:8pt;
                }

                @page {
                    size:A4 portrait;
                    margin:0;
                }

                @media print {

                    body {
                        margin:0 !important;
                        background:#fff !important;
                    }

                    #pdfDocument .pdf-page.v24-page {
                        margin:0 !important;
                        box-shadow:none !important;
                    }

                    #pdfDocument .pdf-page.v24-page:last-child {
                        page-break-after:auto;
                    }
                }

            </style>
        `;

    }


    /*
        Hele kamp-PDF'en overtages af V24.
        genererPDF() fortsætter med at virke uændret,
        fordi den stadig kalder lavPDF().
    */
    lavPDF =
        function () {

            const home =
                kampplan.homeTeam ||
                "FC THY";

            const away =
                kampplan.awayTeam ||
                "MODSTANDER";

            const date =
                typeof formaterDato ===
                "function"
                    ? formaterDato(
                        kampplan.matchDate
                    )
                    : (
                        kampplan.matchDate ||
                        ""
                    );

            const time =
                kampplan.matchTime ||
                "";

            const place =
                kampplan.matchPlace ||
                "";

            const formation =
                formationSelector.options[
                    formationSelector.selectedIndex
                ]?.text ||
                formationSelector.value ||
                "";

            const bg =
                kampplan.backgroundImage ||
                "";

            const practical =
                kampplan.practicalInfo ||
                "";

            const program =
                kampplan.matchProgram ||
                "";

            const coach =
                kampplan.coachMessage ||
                "";

            return `

                ${s24ModernPdfStyles()}


                <!-- =========================================
                     PAGE 1 · MATCHDAY COVER
                ========================================== -->

                <section class="pdf-page v24-page v24-cover">

                    <div class="v24-top-rule"></div>

                    <div class="v24-cover-bg">

                        ${
                            bg
                                ? `
                                    <img
                                        src="${bg}"
                                        alt=""
                                    >
                                `
                                : `
                                    <div class="v24-cover-noimage"></div>
                                `
                        }

                    </div>


                    <div class="v24-cover-content">

                        <div class="v24-cover-brand">
                            <span>
                                START11 · MATCHDAY
                            </span>

                            <span>
                                PLAY · DEVELOP · BELONG
                            </span>
                        </div>


                        <div class="v24-cover-title">

                            <div class="small">
                                KAMPFORBEREDELSE
                            </div>

                            <h1>
                                KAMP<span>PLAN</span>
                            </h1>

                        </div>


                        <div class="v24-matchup">

                            <div class="v24-team">

                                ${s24PdfLogo(
                                    kampplan.homeLogo,
                                    home
                                )}

                                <div>
                                    <strong>
                                        ${s24Esc(home)}
                                    </strong>

                                    <span>
                                        HJEMMEHOLD
                                    </span>
                                </div>

                            </div>


                            <div class="v24-vs">
                                VS
                            </div>


                            <div class="v24-team away">

                                ${s24PdfLogo(
                                    kampplan.awayLogo,
                                    away
                                )}

                                <div>
                                    <strong>
                                        ${s24Esc(away)}
                                    </strong>

                                    <span>
                                        UDEHOLD
                                    </span>
                                </div>

                            </div>

                        </div>


                        <div class="v24-cover-meta">

                            ${
                                date
                                    ? `
                                        <div class="v24-meta-chip">
                                            ${s24PdfIcon("date")}
                                            ${s24Esc(date)}
                                        </div>
                                    `
                                    : ""
                            }

                            ${
                                time
                                    ? `
                                        <div class="v24-meta-chip">
                                            ${s24PdfIcon("time")}
                                            KL. ${s24Esc(time)}
                                        </div>
                                    `
                                    : ""
                            }

                            ${
                                place
                                    ? `
                                        <div class="v24-meta-chip">
                                            ${s24PdfIcon("place")}
                                            ${s24Esc(place)}
                                        </div>
                                    `
                                    : ""
                            }

                            <div class="v24-meta-chip">
                                ${s24PdfIcon("ball")}
                                ${s24Esc(formation)}
                            </div>

                        </div>


                        <div class="v24-cover-bottom">

                            ${
                                coach
                                    ? `
                                        <div class="v24-cover-quote">

                                            <strong>
                                                ${s24Esc(
                                                    coach
                                                        .split("\n")
                                                        .filter(Boolean)[0] ||
                                                    coach
                                                )}
                                            </strong>

                                            <span>
                                                START11 · TRÆNERTEAM
                                            </span>

                                        </div>
                                    `
                                    : `<div></div>`
                            }

                            <div class="v24-cover-mark">
                                MATCH PLAN  /  START11
                            </div>

                        </div>

                    </div>

                </section>



                <!-- =========================================
                     PAGE 2 · MATCH HUB
                ========================================== -->

                <section class="pdf-page v24-page">

                    <div class="v24-top-rule"></div>

                    <div class="v24-page-head">

                        <div>
                            <div class="v24-kicker">
                                MATCHDAY HUB
                            </div>

                            <h1>
                                KAMPEN
                            </h1>
                        </div>

                        <div class="v24-page-no">
                            02
                        </div>

                    </div>


                    <div
                        class="v24-grid-2"
                        style="
                            position:relative;
                            z-index:5;
                            margin:9mm 13mm 0;
                        "
                    >

                        <div class="v24-card">

                            <div class="v24-card-head">
                                <strong>
                                    KAMPINFO
                                </strong>

                                <span class="v24-kicker">
                                    ${s24Esc(formation)}
                                </span>
                            </div>

                            <div class="v24-card-body">

                                <div class="v24-info-row">
                                    ${s24PdfIcon("date")}
                                    <div>
                                        <strong>DATO</strong>
                                        <span>${s24Esc(date || "—")}</span>
                                    </div>
                                </div>

                                <div class="v24-info-row">
                                    ${s24PdfIcon("time")}
                                    <div>
                                        <strong>KAMPSTART</strong>
                                        <span>${s24Esc(time || "—")}</span>
                                    </div>
                                </div>

                                <div class="v24-info-row">
                                    ${s24PdfIcon("place")}
                                    <div>
                                        <strong>SPILLESTED</strong>
                                        <span>${s24Esc(place || "—")}</span>
                                    </div>
                                </div>

                            </div>

                        </div>


                        <div class="v24-card">

                            <div class="v24-card-head">
                                <strong>
                                    PRAKTISK INFO
                                </strong>

                                ${s24PdfIcon("info")}
                            </div>

                            <div class="v24-card-body">
                                <div class="v24-copy">
                                    ${s24Esc(practical || "Ingen praktisk info tilføjet.")}
                                </div>
                            </div>

                        </div>


                        <div class="v24-card">

                            <div class="v24-card-head">
                                <strong>
                                    KAMPPROGRAM
                                </strong>

                                <span class="v24-kicker">
                                    TIMELINE
                                </span>
                            </div>

                            <div class="v24-card-body">
                                <div class="v24-copy">
                                    ${s24Esc(program || "Ingen kampplan/tidslinje tilføjet.")}
                                </div>
                            </div>

                        </div>


                        <div class="v24-card">

                            <div class="v24-card-head">
                                <strong>
                                    TRÆNERENS BESKED
                                </strong>

                                <span class="v24-kicker">
                                    TEAM TALK
                                </span>
                            </div>

                            <div class="v24-card-body">

                                <div
                                    style="
                                        color:var(--v24-accent);
                                        font-size:26pt;
                                        line-height:.7;
                                        font-weight:950;
                                    "
                                >
                                    “
                                </div>

                                <div
                                    class="v24-copy"
                                    style="
                                        margin-top:2mm;
                                        font-size:10pt;
                                        line-height:1.55;
                                    "
                                >
                                    ${s24Esc(coach || "Tilføj en besked til spillerne.")}
                                </div>

                            </div>

                        </div>

                    </div>


                    <div class="v24-pdf-footer">
                        <span>START11 · ${s24Esc(home)} VS ${s24Esc(away)}</span>
                        <span>MATCHDAY 02</span>
                    </div>

                </section>



                <!-- =========================================
                     PAGE 3 · STARTING XI
                ========================================== -->

                <section class="pdf-page v24-page v24-lineup-page">

                    <div class="v24-top-rule"></div>

                    <div class="v24-page-content">

                        ${s24ModernLineup()}

                        <div class="v24-lineup-bottom">

                            <div class="v24-card">

                                <div class="v24-card-head">
                                    <strong>UDSKIFTERE</strong>
                                    <span class="v24-kicker">BENCH</span>
                                </div>

                                <div class="v24-card-body">
                                    ${s24ModernSubs()}
                                </div>

                            </div>


                            <div class="v24-card">

                                <div class="v24-card-head">
                                    <strong>KAMPEN</strong>
                                </div>

                                <div class="v24-card-body">

                                    <div class="v24-info-row">
                                        ${s24PdfIcon("time")}
                                        <div>
                                            <strong>${s24Esc(time || "—")}</strong>
                                            <span>KAMPSTART</span>
                                        </div>
                                    </div>

                                    <div class="v24-info-row">
                                        ${s24PdfIcon("place")}
                                        <div>
                                            <strong>${s24Esc(place || "—")}</strong>
                                            <span>SPILLESTED</span>
                                        </div>
                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>


                    <div class="v24-pdf-footer">
                        <span>
                            ${s24Esc(home)} · ${s24Esc(formation)}
                        </span>

                        <span>
                            STARTING XI
                        </span>
                    </div>

                </section>



                <!-- =========================================
                     PAGE 4 · TEAM PRINCIPLES
                ========================================== -->

                <section class="pdf-page v24-page">

                    <div class="v24-top-rule"></div>

                    <div class="v24-page-head">

                        <div>
                            <div class="v24-kicker">
                                GAME MODEL
                            </div>

                            <h1>
                                VORES SPIL
                            </h1>
                        </div>

                        <div class="v24-page-no">
                            04
                        </div>

                    </div>


                    <div class="v24-tactic-hero">

                        <div class="v24-tactic-panel with">

                            <div class="v24-kicker">
                                ATTACKING PHASE
                            </div>

                            <h2>
                                MED BOLD
                            </h2>

                            ${s24TacticList(
                                kampplan.teamWithBall,
                                "with"
                            )}

                        </div>


                        <div class="v24-tactic-panel without">

                            <div class="v24-kicker">
                                DEFENSIVE PHASE
                            </div>

                            <h2>
                                UDEN BOLD
                            </h2>

                            ${s24TacticList(
                                kampplan.teamWithoutBall,
                                "without"
                            )}

                        </div>

                    </div>


                    <div class="v24-pdf-footer">
                        <span>START11 · GAME MODEL</span>
                        <span>${s24Esc(home)}</span>
                    </div>

                </section>


                ${s24PlayerFocusPages()}
            `;

        };


    /*
        Hvis andre dele af START11 kalder disse funktioner direkte,
        får de samme nye starting-XI grafik.
    */
    lavPDFBane =
        function () {

            return s24ModernLineup();

        };


    lavPDFUdskiftere =
        function () {

            return `
                <div class="v24-card">
                    <div class="v24-card-head">
                        <strong>UDSKIFTERE</strong>
                    </div>

                    <div class="v24-card-body">
                        ${s24ModernSubs()}
                    </div>
                </div>
            `;

        };


    /* Re-render designer once if it is open already. */
    setTimeout(
        () => {

            const exercise =
                s24CurrentExercise();

            if (
                exercise &&
                document.getElementById(
                    "s19DiagramHost"
                )
            ) {

                s19RenderDiagramBoard(
                    exercise
                );

            }

        },
        350
    );

})();

/* =========================================================
   START11 – V24.1 FIX
   - Editor-fullscreen virker uden afhængighed af Fullscreen API
   - Animation-knap injiceres robust selv efter editor rerenders
   - F11-lignende fixed fullscreen for øvelsesdesigneren
========================================================= */

(function () {

    function s241InstallStyles() {

        if (
            document.getElementById(
                "s241FixStyles"
            )
        ) {
            return;
        }

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "s241FixStyles";

        style.textContent = `

            body.s241-editor-open {
                overflow:hidden !important;
            }

            #s19DiagramHost.s241-fullscreen-host {
                position:fixed !important;
                inset:0 !important;
                z-index:2147483000 !important;
                width:100vw !important;
                height:100vh !important;
                max-width:none !important;
                margin:0 !important;
                padding:10px !important;
                overflow:auto !important;
                background:#050806 !important;
            }

            #s19DiagramHost.s241-fullscreen-host .s23-pro-designer {
                width:100% !important;
                min-height:100% !important;
                max-width:none !important;
                margin:0 !important;
            }

            #s19DiagramHost.s241-fullscreen-host .s23-board-layout {
                grid-template-columns:minmax(0,1fr) 260px !important;
            }

            #s19DiagramHost.s241-fullscreen-host #s19DiagramBoard {
                min-height:min(76vh,860px) !important;
            }

            .s241-floating-controls {
                position:sticky;
                top:6px;
                z-index:5000;
                display:flex;
                justify-content:flex-end;
                gap:6px;
                margin:0 0 7px;
                pointer-events:none;
            }

            .s241-floating-controls > * {
                pointer-events:auto;
            }

            .s241-floating-controls .s23-btn {
                min-height:34px;
                box-shadow:0 5px 18px rgba(0,0,0,.26);
                backdrop-filter:blur(10px);
            }

            .s241-floating-controls .animate {
                border-color:color-mix(in srgb,var(--s11-primary,#82ff54) 60%,transparent) !important;
                color:var(--s11-primary,#82ff54) !important;
            }

            @media(max-width:900px) {
                #s19DiagramHost.s241-fullscreen-host .s23-board-layout {
                    grid-template-columns:1fr !important;
                }
            }
        `;

        document.head.appendChild(
            style
        );

    }


    function s241ToggleFullscreen(
        host
    ) {

        if (!host) {
            return;
        }

        const active =
            host.classList.toggle(
                "s241-fullscreen-host"
            );

        document.body.classList.toggle(
            "s241-editor-open",
            active
        );

        const button =
            host.querySelector(
                "[data-s241-fullscreen]"
            );

        if (
            button
        ) {

            button.textContent =
                active
                    ? "↙ LUK FULD SKÆRM"
                    : "⛶ FULD SKÆRM";

        }

    }


    function s241EnsureControls() {

        s241InstallStyles();

        const host =
            document.getElementById(
                "s19DiagramHost"
            );

        if (
            !host ||
            !host.querySelector(
                ".s23-pro-designer"
            )
        ) {
            return;
        }

        let controls =
            host.querySelector(
                ".s241-floating-controls"
            );

        if (
            !controls
        ) {

            controls =
                document.createElement(
                    "div"
                );

            controls.className =
                "s241-floating-controls";

            controls.innerHTML = `

                <button
                    type="button"
                    class="s23-btn animate"
                    data-s241-animate="1"
                >
                    ▶ ANIMER ØVELSE
                </button>

                <button
                    type="button"
                    class="s23-btn"
                    data-s241-fullscreen="1"
                >
                    ⛶ FULD SKÆRM
                </button>
            `;

            host.prepend(
                controls
            );

            controls.querySelector(
                "[data-s241-animate]"
            )
                ?.addEventListener(
                    "click",
                    () => {

                        const exercise =
                            typeof s19ExerciseForDesigner ===
                            "function"
                                ? s19ExerciseForDesigner()
                                : null;

                        if (
                            exercise &&
                            typeof s24OpenAnimation ===
                            "function"
                        ) {

                            s24OpenAnimation(
                                exercise
                            );

                        }

                    }
                );


            controls.querySelector(
                "[data-s241-fullscreen]"
            )
                ?.addEventListener(
                    "click",
                    () =>
                        s241ToggleFullscreen(
                            host
                        )
                );

        }

    }


    /*
        s24OpenAnimation var tidligere intern i IIFE'en.
        Hvis den ikke er global, find V24's preview-knap og klik den.
        Derfor laver vi en robust fallback her.
    */
    function s241OpenAnimationFallback() {

        const button =
            document.querySelector(
                "#s19DiagramHost [data-s24-animate], #s19DiagramHost [data-s24-animate-small]"
            );

        button?.click();

    }


    const observer =
        new MutationObserver(
            () => {

                s241EnsureControls();

            }
        );

    observer.observe(
        document.body,
        {
            childList:true,
            subtree:true
        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                const host =
                    document.getElementById(
                        "s19DiagramHost"
                    );

                if (
                    host?.classList.contains(
                        "s241-fullscreen-host"
                    )
                ) {

                    s241ToggleFullscreen(
                        host
                    );

                }

            }

        }
    );


    setTimeout(
        s241EnsureControls,
        300
    );

    setTimeout(
        s241EnsureControls,
        1200
    );

})();

/* =========================================================
   START11 – V24.2 DIRECT DESIGNER CONTROLS
   Targets the active V23 renderer: .s23pro / .s23top / .s23b
========================================================= */

(function(){

    if(document.getElementById("s242DirectStyles"))return;

    const style=document.createElement("style");
    style.id="s242DirectStyles";
    style.textContent=`

        .s242animate{
            border-color:color-mix(in srgb,var(--s11-primary,#82ff54) 70%,transparent)!important;
            color:var(--s11-primary,#82ff54)!important;
            background:color-mix(in srgb,var(--s11-primary,#82ff54) 10%,#111814)!important;
            box-shadow:0 0 0 1px color-mix(in srgb,var(--s11-primary,#82ff54) 14%,transparent) inset;
        }

        .s242animate:hover{
            background:color-mix(in srgb,var(--s11-primary,#82ff54) 17%,#111814)!important;
        }

        .s242fullscreen{
            border-color:rgba(255,255,255,.25)!important;
            color:#fff!important;
        }

        body.s242fullscreenbody{
            overflow:hidden!important;
        }

        #s19DiagramHost.s242fullscreenhost{
            position:fixed!important;
            inset:0!important;
            z-index:2147483000!important;
            width:100vw!important;
            height:100vh!important;
            max-width:none!important;
            max-height:none!important;
            margin:0!important;
            padding:12px!important;
            overflow:auto!important;
            background:#050806!important;
        }

        #s19DiagramHost.s242fullscreenhost .s23pro{
            width:100%!important;
            min-height:100%!important;
            max-width:none!important;
            margin:0!important;
            padding:0!important;
        }

        #s19DiagramHost.s242fullscreenhost .s23top{
            position:sticky!important;
            top:0!important;
            z-index:10000!important;
            padding:8px!important;
            margin:-1px -1px 7px!important;
            border:1px solid rgba(255,255,255,.08)!important;
            border-radius:8px!important;
            background:rgba(5,8,6,.95)!important;
            backdrop-filter:blur(12px)!important;
        }

        #s19DiagramHost.s242fullscreenhost .s23layout{
            grid-template-columns:minmax(0,1fr) 280px!important;
            min-height:calc(100vh - 150px)!important;
        }

        #s19DiagramHost.s242fullscreenhost #s19DiagramBoard{
            min-height:min(74vh,880px)!important;
            max-height:none!important;
        }

        #s19DiagramHost.s242fullscreenhost .s23ins{
            position:sticky!important;
            top:78px!important;
            max-height:calc(100vh - 95px)!important;
            overflow:auto!important;
        }

        #s19DiagramHost.s242fullscreenhost .s23bar{
            position:sticky!important;
            top:67px!important;
            z-index:9999!important;
            background:rgba(5,8,6,.94)!important;
            backdrop-filter:blur(10px)!important;
            padding:5px 0!important;
        }

        @media(max-width:1100px){
            #s19DiagramHost.s242fullscreenhost .s23layout{
                grid-template-columns:1fr!important;
            }

            #s19DiagramHost.s242fullscreenhost .s23ins{
                position:relative!important;
                top:auto!important;
                max-height:none!important;
            }
        }

        /* Make the direct buttons impossible to miss */
        #s242Animate,
        #s242Fullscreen{
            min-height:31px!important;
            padding:0 11px!important;
            font-size:7px!important;
            font-weight:950!important;
            letter-spacing:.25px!important;
        }

        #s242Preview{
            margin-left:4px!important;
        }
    `;

    document.head.appendChild(style);

    document.addEventListener("keydown",event=>{
        if(event.key!=="Escape")return;

        const host=document.getElementById("s19DiagramHost");
        if(!host?.classList.contains("s242fullscreenhost"))return;

        host.classList.remove("s242fullscreenhost");
        document.body.classList.remove("s242fullscreenbody");

        const btn=document.getElementById("s242Fullscreen");
        if(btn)btn.textContent="⛶ FULD SKÆRM";
    });

})();

/* =========================================================
   START11 – RESPONSIVE WEB DESIGN V24.3
   ---------------------------------------------------------
   Formål:
   - Bevar desktop-designet på store skærme.
   - Tilpas laptop/tablet uden horisontal "sprængning".
   - Giv telefoner et rigtigt mobil-layout.
   - Gør knapper/inputs touch-venlige.
   - Tilpas START11-bane, kamptrup, kalender, modaler,
     Coaching Hub, Video Studio, Match Data og øvelsesdesigner.
========================================================= */

(function start11ResponsiveV243() {

    /* -----------------------------------------------------
       1) Sørg for korrekt viewport på telefoner
    ----------------------------------------------------- */
    let viewport =
        document.querySelector('meta[name="viewport"]');

    if (!viewport) {
        viewport =
            document.createElement("meta");

        viewport.name =
            "viewport";

        document.head.appendChild(
            viewport
        );
    }

    viewport.content =
        "width=device-width, initial-scale=1, viewport-fit=cover";


    /* -----------------------------------------------------
       2) Responsive CSS
    ----------------------------------------------------- */
    if (
        document.getElementById(
            "start11ResponsiveV243Styles"
        )
    ) {
        return;
    }

    const style =
        document.createElement(
            "style"
        );

    style.id =
        "start11ResponsiveV243Styles";

    style.textContent = `

        /* =================================================
           GLOBALT
        ================================================= */

        html {
            max-width: 100%;
            overflow-x: hidden;
        }

        body {
            max-width: 100%;
            overflow-x: hidden;
        }

        *,
        *::before,
        *::after {
            box-sizing: border-box;
        }

        img,
        svg,
        video,
        canvas {
            max-width: 100%;
        }

        input,
        select,
        textarea,
        button {
            max-width: 100%;
        }

        .start11-responsive-scroll {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
        }


        /* =================================================
           LAPTOP / SMÅ DESKTOPS
           Beholder desktop-følelsen, men komprimerer.
        ================================================= */

        @media (max-width: 1280px) {

            .start11-topbar,
            .start11-header,
            .start11-main-header {
                padding-left: 18px !important;
                padding-right: 18px !important;
            }

            .start11-main-nav {
                min-width: 0 !important;
                gap: 4px !important;
            }

            .start11-nav-item {
                padding-left: 10px !important;
                padding-right: 10px !important;
                white-space: nowrap;
            }

            .dashboard-grid,
            .matches-dashboard-grid,
            .start11-matches-grid,
            .s13grid,
            .s20grid,
            .s22-grid,
            .s22-stat-grid,
            .s22-zone-grid {
                min-width: 0 !important;
            }

            .start11-card,
            .next-match-card,
            .upcoming-card,
            .dbu-connect-card,
            .match-squad-card,
            .full-squad-card,
            .s13panel,
            .s20card,
            .s22-card {
                min-width: 0 !important;
            }

            #pitch {
                max-width: 100% !important;
            }
        }


        /* =================================================
           TABLET / MINDRE LAPTOP
        ================================================= */

        @media (max-width: 1024px) {

            body {
                --s11-responsive-page-gap: 14px;
            }

            /* ---------- TOPBAR ---------- */

            .start11-topbar,
            .start11-header,
            .start11-main-header {
                flex-wrap: wrap !important;
                gap: 10px !important;
                height: auto !important;
                min-height: 0 !important;
            }

            .start11-topbar-left,
            .start11-topbar-center,
            .start11-topbar-right {
                min-width: 0 !important;
            }

            .start11-topbar-right {
                margin-left: auto !important;
            }

            .start11-main-nav {
                order: 10;
                width: 100% !important;
                max-width: 100% !important;
                display: flex !important;
                overflow-x: auto !important;
                overflow-y: hidden !important;
                scrollbar-width: thin;
                -webkit-overflow-scrolling: touch;
                padding-bottom: 4px;
            }

            .start11-main-nav .start11-nav-item {
                flex: 0 0 auto !important;
            }


            /* ---------- HOVED-GRIDS ---------- */

            .dashboard-grid,
            .matches-dashboard-grid,
            .start11-matches-grid,
            .match-dashboard-grid,
            .squad-dashboard-grid,
            .start11-dashboard-grid,
            .start11-v8-form-grid,
            .start11-v9-color-grid,
            .start11-v9-theme-identity,
            .s13grid,
            .s20grid,
            .s22-grid,
            .s22-stat-grid,
            .s22-zone-grid {
                grid-template-columns:
                    repeat(
                        2,
                        minmax(0, 1fr)
                    ) !important;
            }


            /* ---------- KORT ---------- */

            .start11-card,
            .next-match-card,
            .upcoming-card,
            .dbu-connect-card,
            .match-squad-card,
            .full-squad-card,
            .s13panel,
            .s20card,
            .s22-card {
                width: 100% !important;
                max-width: 100% !important;
            }


            /* ---------- MODALER ---------- */

            .modal-content,
            .start11-account-panel,
            .start11-player-picker-panel,
            .s13modal,
            .s18-modal,
            .s19-modal,
            .s20modal,
            .s22-modal {
                max-width:
                    calc(
                        100vw - 28px
                    ) !important;
            }


            /* ---------- KAMP / STARTOPSTILLING ---------- */

            #pitch {
                width: 100% !important;
                max-width: 720px !important;
                margin-left: auto !important;
                margin-right: auto !important;
            }

            #substituteList {
                max-width: 100% !important;
            }


            /* ---------- ØVELSESDESIGNER ---------- */

            .s23layout {
                grid-template-columns:
                    minmax(180px, .72fr)
                    minmax(0, 1.8fr) !important;
            }

            .s23ins {
                grid-column:
                    1 / -1 !important;
            }

            .s23top,
            .s23bar {
                flex-wrap: wrap !important;
            }


            /* ---------- VIDEO ---------- */

            .s18-grid,
            .s18-editor-grid,
            .s18-presentgrid,
            .s13presentgrid {
                grid-template-columns:
                    1fr !important;
            }

            .s18-video-wrap,
            .s18-player,
            .s18-stage {
                max-width: 100% !important;
            }
        }


        /* =================================================
           MOBIL / STOR TELEFON
        ================================================= */

        @media (max-width: 760px) {

            html,
            body {
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                overflow-x: hidden !important;
            }

            body {
                -webkit-text-size-adjust: 100%;
            }


            /* ---------- GENEREL SIDE ---------- */

            main,
            .main,
            .content,
            .main-content,
            .start11-content,
            .start11-main,
            .start11-page,
            .page-content {
                width: 100% !important;
                max-width: 100% !important;
                margin-left: 0 !important;
                margin-right: 0 !important;
                padding-left: 11px !important;
                padding-right: 11px !important;
            }


            /* ---------- TOUCH ---------- */

            button,
            .start11-nav-item,
            .start11-primary-button,
            .start11-secondary-button,
            .start11-primary-action,
            .start11-secondary-action,
            .s13btn,
            .s19btn,
            .s22-btn,
            .s23b {
                min-height: 42px;
                touch-action: manipulation;
            }

            input,
            textarea,
            select {
                font-size: 16px !important;
            }


            /* ---------- TOPBAR ---------- */

            .start11-topbar,
            .start11-header,
            .start11-main-header {
                position: relative !important;
                display: flex !important;
                align-items: center !important;
                padding:
                    max(
                        10px,
                        env(safe-area-inset-top)
                    )
                    11px
                    8px !important;
            }

            .start11-brand,
            .start11-logo {
                flex: 0 0 auto !important;
            }

            .start11-topbar-right {
                display: flex !important;
                gap: 6px !important;
                flex-wrap: wrap !important;
                justify-content: flex-end !important;
            }

            .start11-main-nav {
                width: calc(100% + 22px) !important;
                margin-left: -11px !important;
                margin-right: -11px !important;
                padding:
                    3px 11px 7px !important;
                gap: 5px !important;
                border-top:
                    1px solid
                    rgba(255,255,255,.05);
            }

            .start11-main-nav .start11-nav-item {
                min-height: 38px !important;
                padding:
                    8px 11px !important;
                font-size: 11px !important;
                white-space: nowrap !important;
            }


            /* ---------- KLUB / HOLD SWITCHER ---------- */

            .start11-v8-switcher-button {
                max-width:
                    min(
                        66vw,
                        310px
                    ) !important;
            }

            .start11-v8-switcher-menu {
                position: fixed !important;
                left: 10px !important;
                right: 10px !important;
                top: auto !important;
                bottom:
                    max(
                        10px,
                        env(safe-area-inset-bottom)
                    ) !important;
                width: auto !important;
                max-width: none !important;
                max-height: 74vh !important;
                overflow-y: auto !important;
                z-index: 2147482000 !important;
                border-radius: 16px !important;
            }


            /* ---------- ALLE CENTRALE GRIDS = 1 KOLONNE ---------- */

            .dashboard-grid,
            .matches-dashboard-grid,
            .start11-matches-grid,
            .match-dashboard-grid,
            .squad-dashboard-grid,
            .start11-dashboard-grid,
            .start11-v8-form-grid,
            .start11-v9-color-grid,
            .start11-v9-theme-identity,
            .start11-v9-kit-preview-wrap,
            .s13grid,
            .s20grid,
            .s22-grid,
            .s22-stat-grid,
            .s22-zone-grid,
            .v24-grid-2 {
                grid-template-columns:
                    minmax(0, 1fr) !important;
            }

            [style*="grid-template-columns: 1fr 1fr"],
            [style*="grid-template-columns:1fr 1fr"],
            [style*="grid-template-columns: repeat(2"],
            [style*="grid-template-columns:repeat(2"] {
                grid-template-columns:
                    minmax(0, 1fr) !important;
            }


            /* ---------- GENERELLE FLEX-RÆKKER ---------- */

            .start11-card-header,
            .start11-modal-heading,
            .s13head,
            .s20head,
            .s22-head,
            .s19-match-context,
            .s19-match-actions,
            .start11-calendar-toolbar,
            .start11-v9-theme-actions,
            .start11-v8-modal-actions {
                flex-wrap: wrap !important;
                gap: 9px !important;
            }


            /* ---------- KORT ---------- */

            .start11-card,
            .next-match-card,
            .upcoming-card,
            .dbu-connect-card,
            .match-squad-card,
            .full-squad-card,
            .team-dashboard-card,
            .s13panel,
            .s13item,
            .s20card,
            .s22-card {
                width: 100% !important;
                min-width: 0 !important;
                max-width: 100% !important;
            }


            /* ---------- MODALER SOM MOBILE SHEETS ---------- */

            .modal,
            [class*="modal-overlay"],
            .start11-player-picker-overlay {
                align-items: flex-end !important;
                padding: 0 !important;
            }

            .modal-content,
            .start11-account-panel,
            .start11-player-picker-panel,
            .s13modal,
            .s18-modal,
            .s19-modal,
            .s20modal,
            .s22-modal {
                width: 100% !important;
                max-width: 100% !important;
                max-height: 92dvh !important;
                overflow-y: auto !important;
                border-radius:
                    18px 18px 0 0 !important;
                margin: 0 !important;
                padding-bottom:
                    max(
                        16px,
                        env(safe-area-inset-bottom)
                    ) !important;
            }

            .start11-player-picker-panel {
                height: min(86dvh, 760px) !important;
            }


            /* =================================================
               STARTOPSTILLING
            ================================================= */

            #pitch {
                position: relative !important;
                display: block !important;
                width: 100% !important;
                max-width: 520px !important;
                min-width: 0 !important;
                margin:
                    0 auto !important;

                /*
                    Hvis desktop-CSS har en fast bredde/højde, holder
                    aspect-ratio banen brugbar på mobilen.
                */
                aspect-ratio:
                    3 / 4 !important;

                height: auto !important;
                min-height: 455px !important;
                max-height: none !important;
            }

            #pitch .player-slot {
                max-width: 78px !important;
            }

            #pitch .player-slot .shirt {
                transform:
                    scale(.82);
                transform-origin:
                    center bottom;
            }

            #pitch .player-slot .player-name {
                max-width: 78px !important;
                padding:
                    3px 5px !important;
                font-size:
                    9px !important;
                line-height:
                    1.1 !important;
                white-space:
                    nowrap !important;
                overflow:
                    hidden !important;
                text-overflow:
                    ellipsis !important;
            }

            #substituteList {
                width: 100% !important;
                max-width: 100% !important;
                display: grid !important;
                grid-template-columns:
                    repeat(
                        2,
                        minmax(0, 1fr)
                    ) !important;
                gap: 8px !important;
            }

            #substituteList .substitute {
                width: 100% !important;
                min-width: 0 !important;
            }


            /* =================================================
               TRUP
            ================================================= */

            .squad-overview-row {
                grid-template-columns:
                    30px
                    35px
                    minmax(0,1fr)
                    auto !important;
                gap: 6px !important;
                padding:
                    9px 7px !important;
            }

            .squad-overview-position {
                display: none !important;
            }

            .squad-role-pill {
                font-size: 8px !important;
                padding: 4px 6px !important;
                white-space: nowrap !important;
            }

            .start11-squad-actions {
                width: 100% !important;
                flex-wrap: wrap !important;
            }


            /* =================================================
               KALENDER
            ================================================= */

            .start11-calendar-shell {
                padding: 8px !important;
                overflow: hidden !important;
            }

            .start11-calendar-toolbar {
                align-items: stretch !important;
            }

            .start11-calendar-nav {
                width: 100% !important;
                justify-content: space-between !important;
            }

            .start11-calendar-month {
                min-width: 0 !important;
                flex: 1 !important;
            }

            .start11-calendar-grid {
                gap: 2px !important;
            }

            .start11-calendar-weekday {
                font-size: 7px !important;
                overflow: hidden;
            }

            .start11-calendar-day {
                min-height: 58px !important;
                padding: 3px !important;
                border-radius: 5px !important;
            }

            .start11-calendar-day-number {
                font-size: 9px !important;
            }

            .start11-calendar-match {
                padding: 2px !important;
                font-size: 7px !important;
                border-left-width: 2px !important;
            }

            .start11-calendar-legend {
                flex-wrap: wrap !important;
            }


            /* =================================================
               COACHING HUB / COACH OS
            ================================================= */

            .s13shell,
            .s20shell,
            .s22-shell {
                width: 100% !important;
                max-width: 100% !important;
                padding:
                    10px !important;
            }

            .s13nav,
            .s20nav,
            .s22-nav {
                overflow-x: auto !important;
                max-width: 100% !important;
                -webkit-overflow-scrolling: touch;
            }

            .s13toolbar,
            .s20toolbar,
            .s22-toolbar {
                flex-wrap: wrap !important;
            }

            .s13in,
            .s13sel,
            .s13txt,
            .s20in,
            .s20sel,
            .s20txt {
                width: 100% !important;
            }


            /* =================================================
               VIDEO STUDIO
            ================================================= */

            .s18-shell,
            .s18-studio,
            .s18-editor,
            .s18-content {
                width: 100% !important;
                max-width: 100% !important;
            }

            .s18-grid,
            .s18-editor-grid,
            .s18-presentgrid,
            .s13presentgrid {
                display: grid !important;
                grid-template-columns:
                    minmax(0,1fr) !important;
            }

            .s18-toolbar,
            .s18-present-nav {
                flex-wrap: wrap !important;
                gap: 7px !important;
            }

            .s18-video-wrap,
            .s18-stage,
            .s18-player {
                width: 100% !important;
                max-width: 100% !important;
                min-height: 0 !important;
            }

            .s18-video-wrap video,
            .s18-stage video,
            .s18-player video {
                width: 100% !important;
                height: auto !important;
            }


            /* =================================================
               MATCH DATA / AI HUB
            ================================================= */

            .s22-shell,
            .s22-wrap,
            .s22-content {
                max-width: 100% !important;
            }

            .s22-stat-grid,
            .s22-zone-grid,
            .s22-grid {
                grid-template-columns:
                    minmax(0,1fr) !important;
            }


            /* =================================================
               ØVELSESDESIGNER
               Mobil = bane først, værktøjer under/over.
            ================================================= */

            .s23pro {
                width: 100% !important;
                max-width: 100% !important;
            }

            .s23top,
            .s23bar {
                display: flex !important;
                width: 100% !important;
                max-width: 100% !important;
                flex-wrap: nowrap !important;
                overflow-x: auto !important;
                gap: 6px !important;
                padding-bottom: 5px !important;
                -webkit-overflow-scrolling: touch;
            }

            .s23top > *,
            .s23bar > * {
                flex: 0 0 auto;
            }

            .s23grp {
                flex: 0 0 auto !important;
                flex-wrap: nowrap !important;
            }

            .s23layout {
                display: flex !important;
                flex-direction: column !important;
                width: 100% !important;
                max-width: 100% !important;
                gap: 8px !important;
            }

            .s23board {
                order: 1 !important;
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
                overflow: hidden !important;
            }

            .s23ins {
                order: 2 !important;
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
            }

            .s23layout > *:not(.s23board):not(.s23ins) {
                order: 3;
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
            }

            .s23b {
                min-width: 42px !important;
                white-space: nowrap !important;
            }


            /* =================================================
               DESIGN & FARVER
            ================================================= */

            .start11-v9-kit-preview-wrap,
            .start11-v9-theme-identity {
                display: grid !important;
                grid-template-columns:
                    minmax(0,1fr) !important;
            }

            .start11-v9-theme-actions {
                display: grid !important;
                grid-template-columns:
                    1fr !important;
            }


            /* ---------- TABELLER / BREDE DATA ---------- */

            table {
                max-width: 100%;
            }

            .table-wrap,
            .start11-table-wrap,
            .s13tablewrap,
            .s22-table-wrap {
                overflow-x: auto !important;
                -webkit-overflow-scrolling: touch;
            }
        }


        /* =================================================
           SMÅ TELEFONER
        ================================================= */

        @media (max-width: 430px) {

            .start11-brand,
            .start11-logo {
                font-size:
                    18px !important;
            }

            .start11-topbar-right button {
                padding-left:
                    8px !important;
                padding-right:
                    8px !important;
            }

            #pitch {
                min-height:
                    430px !important;
            }

            #pitch .player-slot {
                max-width:
                    70px !important;
            }

            #pitch .player-slot .shirt {
                transform:
                    scale(.74);
            }

            #pitch .player-slot .player-name {
                max-width:
                    68px !important;
                font-size:
                    8px !important;
            }

            #substituteList {
                grid-template-columns:
                    minmax(0, 1fr) !important;
            }

            .squad-overview-row {
                grid-template-columns:
                    26px
                    30px
                    minmax(0,1fr) !important;
            }

            .squad-role-pill {
                grid-column:
                    3 !important;
                justify-self:
                    start !important;
            }

            .start11-v8-switcher-button {
                max-width:
                    56vw !important;
            }

            .start11-calendar-match strong {
                font-size:
                    6.5px !important;
            }
        }


        /* =================================================
           LANDSCAPE TELEFON
        ================================================= */

        @media (
            max-width: 900px
        ) and (
            orientation: landscape
        ) {

            .modal-content,
            .start11-account-panel,
            .start11-player-picker-panel {
                max-height:
                    88dvh !important;
            }

            #pitch {
                max-width:
                    430px !important;
                min-height:
                    440px !important;
            }

            .s23layout {
                display: grid !important;
                grid-template-columns:
                    minmax(0, 1.6fr)
                    minmax(200px, .75fr) !important;
                align-items:
                    start !important;
            }

            .s23board {
                order:
                    initial !important;
            }

            .s23ins {
                order:
                    initial !important;
            }
        }


        /* =================================================
           PRINT
           Responsive-regler må IKKE ændre PDF-printet.
        ================================================= */

        @media print {

            #pdfDocument,
            #pdfDocument * {
                box-sizing:
                    border-box;
            }

            #pdfDocument {
                overflow:
                    visible !important;
                max-width:
                    none !important;
            }
        }
    `;

    document.head.appendChild(
        style
    );


    /* -----------------------------------------------------
       3) Device class på <html>
       Gør det lettere at videreudvikle senere.
    ----------------------------------------------------- */

    const updateResponsiveClass =
        () => {

            const root =
                document.documentElement;

            root.classList.remove(
                "s11-device-desktop",
                "s11-device-tablet",
                "s11-device-mobile"
            );

            const width =
                window.innerWidth;

            if (
                width <= 760
            ) {

                root.classList.add(
                    "s11-device-mobile"
                );

            } else if (
                width <= 1024
            ) {

                root.classList.add(
                    "s11-device-tablet"
                );

            } else {

                root.classList.add(
                    "s11-device-desktop"
                );

            }
        };


    updateResponsiveClass();


    let resizeTimer =
        null;

    window.addEventListener(
        "resize",
        () => {

            clearTimeout(
                resizeTimer
            );

            resizeTimer =
                setTimeout(
                    updateResponsiveClass,
                    90
                );

        },
        {
            passive:true
        }
    );


    /* -----------------------------------------------------
       4) Brede elementer får automatisk scroll-container
       i stedet for at sprænge siden.
    ----------------------------------------------------- */

    const markWideElements =
        () => {

            document
                .querySelectorAll(
                    "table, .s13table, .s22-table"
                )
                .forEach(
                    element => {

                        if (
                            element.parentElement &&
                            element.scrollWidth >
                            element.parentElement.clientWidth
                        ) {

                            element.parentElement.classList.add(
                                "start11-responsive-scroll"
                            );

                        }

                    }
                );

        };


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            () =>
                setTimeout(
                    markWideElements,
                    50
                )
        );

    } else {

        setTimeout(
            markWideElements,
            50
        );

    }


    /* Dynamisk START11 UI bliver ofte re-renderet. */
    const observer =
        new MutationObserver(
            () => {

                clearTimeout(
                    observer._timer
                );

                observer._timer =
                    setTimeout(
                        markWideElements,
                        80
                    );

            }
        );


    if (
        document.body
    ) {

        observer.observe(
            document.body,
            {
                childList:true,
                subtree:true
            }
        );

    } else {

        document.addEventListener(
            "DOMContentLoaded",
            () => {

                observer.observe(
                    document.body,
                    {
                        childList:true,
                        subtree:true
                    }
                );

            },
            {
                once:true
            }
        );

    }

})();

