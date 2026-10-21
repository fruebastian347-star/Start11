/* =========================================================
   START11 V25 – NATIVE VISIBLE FEATURES
   Directly connected to the active match bar and squad renderer.
========================================================= */
(function(){
  const esc=v=>typeof s13Esc==="function"?s13Esc(String(v??"")):String(v??"");
  const clone=v=>JSON.parse(JSON.stringify(v));
  const uid=p=>p+"_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,7);

  /* ---------- final data normalization: folders + tactics ---------- */
  if(typeof s13Norm==="function"){
    const prev=s13Norm;
    s13Norm=function(raw={}){
      const d=prev(raw);
      d.exerciseFolders=Array.isArray(raw.exerciseFolders)?raw.exerciseFolders:(Array.isArray(d.exerciseFolders)?d.exerciseFolders:[]);
      d.matchTacticalSituations=raw.matchTacticalSituations&&typeof raw.matchTacticalSituations==="object"?raw.matchTacticalSituations:(d.matchTacticalSituations||{});
      return d;
    };
  }
  if(!Array.isArray(s13Data.exerciseFolders))s13Data.exerciseFolders=[];
  if(!s13Data.matchTacticalSituations||typeof s13Data.matchTacticalSituations!=="object")s13Data.matchTacticalSituations={};

  /* folders are now in s13Data and therefore collectTeamData/start11CoachHub.
     Keep a profile-local safety copy too, so a cloud refresh cannot erase them. */
  const folderKey=()=>`start11.v25.exerciseFolders.${session?.user?.id||"local"}`;
  function saveFolderBackup(){
    try{localStorage.setItem(folderKey(),JSON.stringify({
      folders:clone(s13Data.exerciseFolders||[]),
      assignments:(s13Data.exercises||[]).map(e=>({id:e.id,folderId:e.folderId||""}))
    }))}catch(_){}
  }
  function restoreFolderBackup(){
    try{
      const d=JSON.parse(localStorage.getItem(folderKey())||"null");if(!d)return;
      if(Array.isArray(d.folders)&&(!s13Data.exerciseFolders||!s13Data.exerciseFolders.length))s13Data.exerciseFolders=clone(d.folders);
      const m=new Map((d.assignments||[]).map(x=>[String(x.id),x.folderId||""]));
      (s13Data.exercises||[]).forEach(e=>{if(!e.folderId&&m.has(String(e.id)))e.folderId=m.get(String(e.id))});
    }catch(_){}
  }
  restoreFolderBackup();
  if(typeof s13Save==="function"){
    const prev=s13Save;
    s13Save=function(){saveFolderBackup();return prev.apply(this,arguments)};
  }

  /* ---------- styles ---------- */
  const st=document.createElement("style");st.id="s25nativecss";st.textContent=`
  #s25SquadGroups{display:flex;gap:5px;align-items:center;flex-wrap:wrap;margin:0 0 8px;padding:7px;border:1px solid rgba(130,255,84,.2);border-radius:6px;background:#071009}
  .s25gchip{padding:5px 7px;border:1px solid rgba(255,255,255,.08);border-radius:5px;background:#0b160d;color:#fff;font-size:6px;font-weight:900}
  .s25grouphead{display:flex;justify-content:space-between;align-items:center;padding:6px 8px;margin:5px 0 2px;border:1px solid rgba(130,255,84,.15);border-radius:5px;background:#0a160c;color:#fff;font-size:6px;font-weight:950}.s25grouphead b{color:var(--s11-primary,#82ff54)}
  #s25PlayerGroup{width:100%;min-height:36px;padding:7px;border:1px solid rgba(255,255,255,.12);border-radius:5px;background:#0a160d;color:#fff}
  .s25overlay{position:fixed;inset:0;z-index:2147483646;display:grid;place-items:center;padding:12px;background:#000d}
  .s25shell{width:min(1120px,96vw);max-height:94vh;overflow:auto;border:1px solid rgba(130,255,84,.35);border-radius:10px;background:#061008}
  .s25top{position:sticky;top:0;z-index:20;display:flex;gap:6px;align-items:center;flex-wrap:wrap;padding:10px;border-bottom:1px solid rgba(255,255,255,.08);background:#071009}.s25top strong{margin-right:auto;font-size:9px}
  .s25cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px;padding:12px}.s25card{padding:9px;border:1px solid rgba(255,255,255,.09);border-radius:7px;background:#0a150c}.s25card strong{font-size:8px}.s25card p{min-height:18px;color:#849087;font-size:6px}
  .s25main{display:grid;grid-template-columns:minmax(0,1fr) 290px}.s25boardwrap{padding:12px;display:grid;place-items:center}.s25pitch{position:relative;width:min(100%,610px);aspect-ratio:68/105;background:#176b37;border:2px solid #fff;overflow:hidden;touch-action:none}
  .s25half{position:absolute;left:0;right:0;top:50%;border-top:2px solid #fff9}.s25circle{position:absolute;left:50%;top:50%;width:22%;aspect-ratio:1;border:2px solid #fff9;border-radius:50%;transform:translate(-50%,-50%)}.s25box{position:absolute;left:25%;width:50%;height:15%;border:2px solid #fff9}.s25box.a{top:-2px}.s25box.b{bottom:-2px}
  .s25piece{position:absolute;transform:translate(-50%,-50%);z-index:5;cursor:grab;user-select:none;touch-action:none}.s25player,.s25opp{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font-size:8px;font-weight:950;box-shadow:0 3px 8px #0008}.s25player{background:var(--s11-shirt,#c8ff00);color:var(--s11-shirt-text,#071008);border:2px solid #fff}.s25player.gk{background:var(--s11-gk-shirt,#e31d1d);color:#fff}.s25opp{background:#eee;color:#111;border:2px solid #222}.s25name{position:absolute;top:37px;left:50%;transform:translateX(-50%);padding:2px 4px;background:#061008;color:#fff;border-radius:3px;font-size:5px;white-space:nowrap}.s25ball{width:15px;height:15px;border-radius:50%;background:#fff;border:3px dotted #111}.s25zone{position:absolute;z-index:2;border:2px dashed #ffe64d;background:#ffe64d22;cursor:grab}.s25svg{position:absolute;inset:0;width:100%;height:100%;z-index:3;pointer-events:none}
  .s25side{padding:11px;border-left:1px solid rgba(255,255,255,.08)}.s25field{display:grid;gap:4px;margin-bottom:9px}.s25field label{font-size:6px;color:#929d95;font-weight:900}.s25field input,.s25field textarea{box-sizing:border-box;width:100%;padding:7px;border:1px solid rgba(255,255,255,.11);border-radius:6px;background:#0a160d;color:#fff;font:inherit;font-size:11px}.s25field textarea{min-height:76px;resize:vertical}
  @media(max-width:780px){.s25main{grid-template-columns:1fr}.s25side{border-left:0;border-top:1px solid rgba(255,255,255,.08)}}
  `;document.head.appendChild(st);

  /* ---------- squad groups ---------- */
  const groupKey=()=>`start11.v25.squadGroups.${start11V8GetActiveTeamId?.()||"team"}`;
  function gdLoad(){try{const d=JSON.parse(localStorage.getItem(groupKey())||"null");if(d?.groups)return d}catch(_){}return{groups:[{id:"own",name:"Egen trup"},{id:"u16",name:"U16"},{id:"u13",name:"U13"}],players:{}}}
  let gd=gdLoad();
  function gdSave(){localStorage.setItem(groupKey(),JSON.stringify(gd))}
  const pgroup=p=>gd.players[String(p.id)]||"own";

  window.s25MountSquadGroups=function(){
    const list=document.getElementById("fullSquadList");if(!list)return;
    let bar=document.getElementById("s25SquadGroups");
    if(!bar){bar=document.createElement("div");bar.id="s25SquadGroups";list.insertAdjacentElement("beforebegin",bar)}
    bar.innerHTML=gd.groups.map(g=>`<span class="s25gchip">${esc(g.name)} · ${(start11FullSquad||[]).filter(p=>pgroup(p)===g.id).length}</span>`).join("")+
      `<button type="button" class="s13btn primary" id="s25NewGroup">+ NY GRUPPE</button><button type="button" class="s13btn" id="s25ManageGroups">ADMINISTRER</button>`;
    bar.querySelector("#s25NewGroup").onclick=()=>{const n=prompt("Navn på ny trupgruppe:","Ny gruppe");if(!n?.trim())return;gd.groups.push({id:uid("grp"),name:n.trim()});gdSave();start11RenderFullSquad()};
    bar.querySelector("#s25ManageGroups").onclick=()=>{const lines=gd.groups.map((g,i)=>`${i+1}. ${g.name}`).join("\n");const i=Number(prompt("Vælg gruppe:\n\n"+lines,"1"))-1;const g=gd.groups[i];if(!g)return;const a=prompt("1 = Omdøb\n2 = Slet","1");if(a==="1"){const n=prompt("Nyt navn:",g.name);if(n?.trim()){g.name=n.trim();gdSave();start11RenderFullSquad()}}else if(a==="2"&&g.id!=="own"&&confirm(`Slet ${g.name}?`)){Object.keys(gd.players).forEach(k=>{if(gd.players[k]===g.id)gd.players[k]="own"});gd.groups=gd.groups.filter(x=>x.id!==g.id);gdSave();start11RenderFullSquad()}};
  };
  window.s25OrganizeSquadRows=function(){
    const list=document.getElementById("fullSquadList");if(!list)return;
    const rows=[...list.querySelectorAll(":scope > .full-squad-row")];if(!rows.length)return;
    const map=new Map(rows.map(r=>[String(r.dataset.playerId),r]));list.innerHTML="";
    gd.groups.forEach(g=>{const ids=(start11GetVisibleSquad?.()||[]).filter(p=>pgroup(p)===g.id).map(p=>String(p.id));if(!ids.length)return;const h=document.createElement("div");h.className="s25grouphead";h.innerHTML=`<span>▾ ${esc(g.name)}</span><b>${ids.length}</b>`;list.appendChild(h);ids.forEach(x=>{const r=map.get(x);if(r)list.appendChild(r)})});
  };
  window.s25MountPlayerGroupSelect=function(player){
    const grid=document.querySelector("#squadPlayerModal .squad-player-form-grid");if(!grid)return;
    let w=document.getElementById("s25PlayerGroupWrap");if(!w){w=document.createElement("label");w.id="s25PlayerGroupWrap";w.innerHTML=`Trupgruppe<select id="s25PlayerGroup"></select>`;grid.appendChild(w)}
    const s=w.querySelector("select");s.innerHTML=gd.groups.map(g=>`<option value="${esc(g.id)}">${esc(g.name)}</option>`).join("");s.value=player?pgroup(player):"own";
  };
  document.addEventListener("click",e=>{
    if(!e.target.closest?.("#saveSquadPlayerButton"))return;
    const old=start11EditingSquadPlayerId,name=document.getElementById("squadPlayerName")?.value.trim(),g=document.getElementById("s25PlayerGroup")?.value||"own";
    setTimeout(()=>{let p=old?start11FullSquad.find(x=>x.id===old):null;if(!p&&name)p=[...start11FullSquad].reverse().find(x=>x.name===name);if(p){gd.players[String(p.id)]=g;gdSave();start11RenderFullSquad()}},30);
  },true);

  /* ---------- match tactical situations: RenderFoot-inspired editor ---------- */
  function mkey(){return String(s19MatchMode?.key||[kampplan?.matchDate,kampplan?.homeTeam,kampplan?.awayTeam].filter(Boolean).join("|")||"current")}
  function lineup(){
    const f=formationer[formationSelector?.value]||[];
    const raw=f.slice(0,11).map((pos,i)=>{const p=spillere[i]||{};return{name:p.name||pos[0]||`Spiller ${i+1}`,number:p.number||i+1,gk:i===0||pos[0]==="GK",x:Number(pos[1]||50),y:Number(pos[2]||50)}});
    // Convert the existing vertical formation coordinates to a landscape pitch.
    return raw.map(p=>({...p,x:Math.max(4,Math.min(96,100-p.y)),y:Math.max(4,Math.min(96,p.x))}));
  }
  function opponentLineup(){
    const rows=[
      [7,24,"LW"],[9,40,"ST"],[11,56,"RW"],
      [8,32,"CM"],[10,48,"CM"],[6,64,"CM"],
      [3,18,"LB"],[4,36,"CB"],[5,56,"CB"],[2,74,"RB"],[1,50,"GK"]
    ];
    return rows.map((p,i)=>({number:p[0],name:p[2],x:p[0]===1?91:64+(i%3)*7,y:p[1],gk:p[0]===1}));
  }
  function mk(title){return{id:uid("sit"),title,focus:"",note:"",type:/uden/i.test(title)?"Uden bold":/med/i.test(title)?"Med bold":"Standard",includeInPdf:true,players:lineup(),opponents:opponentLineup(),balls:[{x:50,y:50}],arrows:[],zones:[],drawings:[],cones:[]}}
  function arr(){const k=mkey();if(!Array.isArray(s13Data.matchTacticalSituations[k]))s13Data.matchTacticalSituations[k]=[mk("Med bold"),mk("Uden bold")];const a=s13Data.matchTacticalSituations[k];a.forEach(s=>{if(!Array.isArray(s.opponents)||!s.opponents.length)s.opponents=opponentLineup();if(!Array.isArray(s.drawings))s.drawings=[];if(!Array.isArray(s.cones))s.cones=[];if(!Array.isArray(s.players)||!s.players.length)s.players=lineup();if(!Array.isArray(s.balls))s.balls=[];if(!Array.isArray(s.arrows))s.arrows=[];if(!Array.isArray(s.zones))s.zones=[]});return a}
  function save(){s13Save?.()}

  const s265style=document.createElement("style");s265style.id="s265renderfootcss";s265style.textContent=`
  .s265app{height:100dvh;min-height:560px;display:flex;flex-direction:column;background:#06110b;overflow:hidden}
  .s265header{height:58px;min-height:58px;box-sizing:border-box;display:flex;align-items:center;gap:12px;padding:0 14px;background:#07120b;border-bottom:1px solid #1c3925}
  .s265brand{font-size:13px;font-weight:900;white-space:nowrap}.s265headtools{margin-left:auto;display:flex;align-items:center;gap:5px;flex-wrap:nowrap}
  .s265app button{font:700 10px Arial,sans-serif;color:#f1f8f1;background:#07140b;border:1px solid #2a6235;border-radius:6px;padding:10px 11px;white-space:nowrap;cursor:pointer}
  .s265app button:hover,.s265app button.active{background:#16351f;border-color:#80ff54;color:#a4ff83}.s265app button.primary{background:#76f044;color:#061006;border-color:#76f044}
  .s265layout{display:grid;grid-template-columns:244px minmax(360px,1fr) 310px;min-height:0;flex:1}
  .s265saved{padding:14px 12px;border-right:1px solid #1c3925;overflow:auto;background:#061009}.s265sectiontitle{font-size:10px;font-weight:900;letter-spacing:.5px;margin:0 0 12px;color:#dce9de}
  .s265scenario{width:100%;box-sizing:border-box;display:block;text-align:left;margin:0 0 7px;padding:12px!important;border-color:#203b28!important;background:#0a170e!important}.s265scenario b{display:block;font-size:11px}.s265scenario small{display:block;margin-top:7px;color:#8fa294;font-size:8px;font-weight:400}.s265scenario.chosen{border-color:#7cff51!important;background:#102318!important;box-shadow:inset 3px 0 #7cff51}.s265new{width:100%;margin-top:7px}
  .s265center{display:flex;flex-direction:column;min-width:0;min-height:0;background:#050d08}.s265toolbar{display:flex;align-items:center;gap:4px;flex-wrap:wrap;padding:9px;border-bottom:1px solid #1c3925}.s265toolbar button{padding:8px 9px!important}.s265toolbar .s265toolname{font-size:9px;color:#91a697;font-weight:900;margin-right:5px}
  .s265pitchcontrols{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px}.s265pitchcontrols>div{display:flex;gap:4px}.s265pitchcontrols button{padding:8px 10px!important}
  .s265pitchframe{flex:1;min-height:0;display:flex;padding:0 10px 10px}.s265pitch{position:relative;flex:1;min-height:280px;aspect-ratio:1.55;background:#176b37;border:2px solid #e8f4e9;border-radius:4px;overflow:hidden;touch-action:none;align-self:stretch}
  .s265stripe{position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(0,0,0,.045) 0 8.33%,transparent 8.33% 16.66%);pointer-events:none}.s265fieldlines,.s265drawings{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}.s265fieldlines{fill:none;stroke:#e5f2e6;stroke-width:.28}.s265drawings{z-index:2}
  .s265playerpiece{position:absolute;z-index:4;transform:translate(-50%,-50%);width:25px;height:29px;cursor:grab;touch-action:none;user-select:none;filter:drop-shadow(0 1px 2px #001b08a8)}.s265playerpiece svg{width:100%;height:100%;display:block}.s265playerpiece span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding-bottom:1px;color:white;font-size:10px;font-weight:900;text-shadow:0 1px 2px #0008}.s265playerpiece.home{color:#f52f35}.s265playerpiece.away{color:#2384ff}.s265playerpiece.selected{filter:drop-shadow(0 0 4px #b7ff4d)}.s265playerpiece small{position:absolute;top:29px;left:50%;transform:translateX(-50%);white-space:nowrap;background:#071009;color:white;padding:2px 4px;border-radius:3px;font-size:7px;font-weight:800;max-width:78px;overflow:hidden;text-overflow:ellipsis}
  .s265ball{position:absolute;z-index:5;transform:translate(-50%,-50%);width:16px;height:16px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#d9dedb 65%,#252a27);border:1px solid #111;box-shadow:0 1px 4px #0008;cursor:grab;touch-action:none}.s265cone{position:absolute;z-index:5;transform:translate(-50%,-50%);width:0;height:0;border-left:9px solid transparent;border-right:9px solid transparent;border-bottom:20px solid #ff941f;filter:drop-shadow(0 1px 2px #0008);cursor:grab;touch-action:none}.s265zone{position:absolute;z-index:1;background:#f4dc1830;border:2px dashed #f6d72b;cursor:grab;touch-action:none}.s265textmark{position:absolute;z-index:5;transform:translate(-50%,-50%);padding:4px 6px;background:#061008;color:#fff;border:1px solid #8bff5c;border-radius:3px;cursor:grab;white-space:nowrap}
  .s265status{padding:7px 10px;color:#91a597;font-size:9px;border-top:1px solid #172e1e}.s265settings{padding:12px;overflow:auto;border-left:1px solid #1c3925;background:#061009}.s265panel{padding:12px;margin-bottom:9px;border:1px solid #24482d;border-radius:8px;background:#08140c}.s265panel h3{font-size:10px;letter-spacing:.4px;margin:0 0 12px;color:#eff8f0}.s265panel label{display:block;font-size:8px;font-weight:900;color:#94a99a;margin:10px 0 5px}.s265panel input:not([type=checkbox]),.s265panel textarea,.s265panel select{width:100%;box-sizing:border-box;border:1px solid #2a4030;background:#0b1710;color:#f2fff2;border-radius:6px;padding:9px;font:10px Arial,sans-serif}.s265panel textarea{resize:vertical;min-height:66px}.s265panel .s265check{display:flex;align-items:center;gap:6px}.s265panel .s265check input{accent-color:#76f044}.s265seg{display:flex;gap:4px;margin-bottom:9px}.s265seg button{flex:1}.s265formations{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:8px}
  .s265formations button{position:relative;min-height:43px;padding:9px 5px!important;border:1px solid #31563a!important;border-radius:8px!important;background:linear-gradient(180deg,#14291a 0%,#0b180f 100%)!important;color:#dcefe0!important;font:800 12px/1 Arial,sans-serif!important;letter-spacing:.25px;box-shadow:inset 0 1px 0 #ffffff0a,0 2px 5px #0004;cursor:pointer;transition:transform .16s ease,border-color .16s ease,background .16s ease,box-shadow .16s ease}
  .s265formations button:hover{transform:translateY(-2px);border-color:#82ff54!important;background:linear-gradient(180deg,#21452a 0%,#112719 100%)!important;color:#aaff87!important;box-shadow:0 5px 12px #0005,0 0 0 1px #82ff5420}
  .s265formations button:active{transform:translateY(0) scale(.98)}
  .s265formations button:focus-visible{outline:2px solid #82ff54;outline-offset:2px}
  .s265formations button.selected,.s265formations button.active{border-color:#82ff54!important;background:linear-gradient(180deg,#2d5a30 0%,#16351d 100%)!important;color:#b7ff9b!important;box-shadow:inset 0 0 0 1px #82ff5440,0 0 0 1px #82ff541c}
  @media(max-width:420px){.s265formations{gap:5px}.s265formations button{min-height:39px;font-size:11px!important}}.s265hint{font-size:9px;color:#9cb0a0;line-height:1.5}.s265wide{width:100%;margin-top:5px}
  @media(max-width:1050px){.s265layout{grid-template-columns:190px minmax(300px,1fr) 260px}.s265header{padding:0 8px}.s265headtools{gap:3px}.s265app button{padding:8px 7px;font-size:9px}}
  @media(max-width:800px){.s265app{height:100dvh;overflow:auto}.s265header{height:auto;min-height:54px;flex-wrap:wrap;padding:8px}.s265headtools{margin-left:0;flex-wrap:wrap}.s265layout{grid-template-columns:1fr}.s265saved{max-height:170px;border-right:0;border-bottom:1px solid #1c3925}.s265center{min-height:65vh}.s265settings{border-left:0;border-top:1px solid #1c3925}}
  `;document.head.appendChild(s265style);

  /* The legacy tactical-situations manager was removed. The active manager is defined in V26.5 below. */

  /* Force the already visible right-hand squad panel to refresh once. */
  setTimeout(()=>{try{start11RenderFullSquad()}catch(_){};try{s19UpdateMatchBar()}catch(_){}},200);
})();




/* =========================================================
   START11 V26.2 – STABLE INTEGRATION
   - Native exercise bank + simple drag/drop
   - Persistent folder assignments through existing s13Save
   - Squad rows can be dragged directly into groups
   - Group selector remains available in player profile
   - Match situations are physically injected into KAMPPLAN modal
========================================================= */
(function start11V262StableIntegration(){
    "use strict";

    const esc = v => typeof s13Esc === "function"
        ? s13Esc(String(v ?? ""))
        : String(v ?? "").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));

    /* ---------- visual styles ---------- */
    if(!document.getElementById("s262Styles")){
        const st=document.createElement("style");
        st.id="s262Styles";
        st.textContent=`
          .s246banklayout{grid-template-columns:270px minmax(0,1fr)!important;gap:14px!important}
          .s246folders{padding:12px!important;border:1px solid rgba(130,255,84,.22)!important;border-radius:10px!important;background:#071009!important}
          .s246folder{min-height:44px!important;margin:5px 0!important;padding-top:8px!important;padding-bottom:8px!important;border-radius:7px!important;font-size:8px!important}
          .s246folder span{font-weight:900!important}
          .s246folder small{font-size:7px!important;padding:3px 6px!important;border-radius:999px!important;background:rgba(130,255,84,.08)!important}
          .s246folder.s262-drop,.s25grouphead.s262-drop{border-color:var(--s11-primary,#82ff54)!important;background:rgba(130,255,84,.20)!important;box-shadow:0 0 0 3px rgba(130,255,84,.10)!important}
          .s17-exercise-card[draggable="true"]{cursor:grab!important}
          .s17-exercise-card.s262-dragging,.full-squad-row.s262-dragging{opacity:.35!important}
          .s25grouphead{min-height:30px!important;cursor:default}
          .full-squad-row[draggable="true"]{cursor:grab}
          #s262MatchSituations{
             margin:14px 0 10px;padding:12px;border:1px solid rgba(130,255,84,.28);
             border-radius:8px;background:#071009;
          }
          #s262MatchSituations .s262head{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:8px}
          #s262MatchSituations .s262head strong{font-size:9px}
          #s262MatchSituations .s262sub{font-size:6px;color:#8e9a91;line-height:1.5;margin-bottom:9px}
          #s262MatchSituations .s262actions{display:grid;grid-template-columns:1fr 1fr;gap:7px}
          #s262MatchSituations .s262actions button{min-height:38px}
          #s262MatchSituations .s262count{color:var(--s11-primary,#82ff54);font-size:7px;font-weight:900}
          @media(max-width:760px){
             .s246banklayout{grid-template-columns:1fr!important}
             #s262MatchSituations .s262actions{grid-template-columns:1fr}
          }
        `;
        document.head.appendChild(st);
    }

    /* ---------- exercise bank: stable native drag/drop ---------- */
    let draggedExerciseId="";

    function wireExerciseBank(){
        const root=document.getElementById("s13content");
        if(!root) return;

        root.querySelectorAll(".s17-exercise-card").forEach(card=>{
            if(card.dataset.s262DragBound==="1") return;
            const edit=card.querySelector("[data-edit-exercise]");
            const id=edit?.dataset.editExercise || card.dataset.s247Exercise || "";
            if(!id) return;
            card.dataset.s262DragBound="1";
            card.draggable=true;

            card.addEventListener("dragstart",e=>{
                if(e.target.closest("button,input,select,textarea,a")){e.preventDefault();return}
                draggedExerciseId=String(id);
                card.classList.add("s262-dragging");
                try{
                    e.dataTransfer.effectAllowed="move";
                    e.dataTransfer.setData("text/start11-exercise",draggedExerciseId);
                    e.dataTransfer.setData("text/plain",draggedExerciseId);
                }catch(_){}
            });
            card.addEventListener("dragend",()=>{
                draggedExerciseId="";
                card.classList.remove("s262-dragging");
                document.querySelectorAll(".s262-drop").forEach(x=>x.classList.remove("s262-drop"));
            });
        });

        root.querySelectorAll("[data-s246-folder]").forEach(folder=>{
            if(folder.dataset.s262DropBound==="1") return;
            folder.dataset.s262DropBound="1";

            folder.addEventListener("dragover",e=>{
                if(!draggedExerciseId) return;
                e.preventDefault();
                try{e.dataTransfer.dropEffect="move"}catch(_){}
                folder.classList.add("s262-drop");
            });
            folder.addEventListener("dragleave",()=>folder.classList.remove("s262-drop"));
            folder.addEventListener("drop",e=>{
                if(!draggedExerciseId) return;
                e.preventDefault();
                folder.classList.remove("s262-drop");

                const ex=(s13Data.exercises||[]).find(x=>String(x.id)===String(draggedExerciseId));
                if(!ex) return;

                const raw=String(folder.dataset.s246Folder||"");
                ex.folderId=(raw==="all"||raw==="root") ? "" : raw;

                if(typeof s13Save==="function") s13Save();
                if(typeof visNotification==="function") visNotification("Øvelsen er flyttet til mappen.");
                draggedExerciseId="";

                const target=document.getElementById("s13content");
                if(target && typeof s13Exercises==="function") s13Exercises(target);
            });
        });
    }

    /* ---------- squad groups: drag a player row onto a group header ---------- */
    let draggedPlayerId="";

    function currentGroupData(){
        try{
            // V25 keeps the group data in localStorage. Read the same object so this
            // integration works without depending on V25's private closure variable.
            const userId=(typeof session!=="undefined" && session?.user?.id) ? session.user.id : "local";
            const teamId=(typeof currentTeamId!=="undefined" && currentTeamId) ? currentTeamId : "team";
            const candidates=[
                `start11.v25.squadGroups.${userId}.${teamId}`,
                `start11.v25.squadGroups.${teamId}`,
                `start11.v25.squadGroups.${userId}`,
                `start11.v25.squadGroups`
            ];
            for(const key of candidates){
                const raw=localStorage.getItem(key);
                if(raw){
                    const d=JSON.parse(raw);
                    if(d && Array.isArray(d.groups) && d.players) return {key,d};
                }
            }
        }catch(_){}
        return null;
    }

    function discoverActualGroupStore(){
        // Find the exact V25 key by looking for a stored object with groups + players.
        try{
            for(let i=0;i<localStorage.length;i++){
                const key=localStorage.key(i);
                if(!key || !/group/i.test(key)) continue;
                try{
                    const d=JSON.parse(localStorage.getItem(key)||"null");
                    if(d && Array.isArray(d.groups) && d.players && typeof d.players==="object") return {key,d};
                }catch(_){}
            }
        }catch(_){}
        return currentGroupData();
    }

    function wireSquadGroups(){
        const list=document.getElementById("fullSquadList");
        if(!list) return;

        list.querySelectorAll(".full-squad-row").forEach(row=>{
            if(row.dataset.s262DragBound==="1") return;
            row.dataset.s262DragBound="1";
            row.draggable=true;
            row.addEventListener("dragstart",e=>{
                draggedPlayerId=String(row.dataset.playerId||"");
                if(!draggedPlayerId){e.preventDefault();return}
                row.classList.add("s262-dragging");
                try{
                    e.dataTransfer.effectAllowed="move";
                    e.dataTransfer.setData("text/start11-player",draggedPlayerId);
                }catch(_){}
            });
            row.addEventListener("dragend",()=>{
                draggedPlayerId="";
                row.classList.remove("s262-dragging");
                document.querySelectorAll(".s262-drop").forEach(x=>x.classList.remove("s262-drop"));
            });
        });

        const heads=[...list.querySelectorAll(".s25grouphead")];
        const bar=document.getElementById("s25SquadGroups");
        const chips=bar ? [...bar.querySelectorAll(".s25gchip")] : [];
        const store=discoverActualGroupStore();
        const groups=store?.d?.groups||[];

        heads.forEach((head,index)=>{
            if(head.dataset.s262DropBound==="1") return;
            const visibleName=head.querySelector("span")?.textContent?.replace(/^▾\s*/,"").trim()||"";
            const group=groups.find(g=>String(g.name)===visibleName) || groups[index];
            if(!group) return;
            head.dataset.s262DropBound="1";
            head.title="Træk en spiller hertil for at flytte spilleren til gruppen";

            head.addEventListener("dragover",e=>{
                if(!draggedPlayerId) return;
                e.preventDefault();head.classList.add("s262-drop");
            });
            head.addEventListener("dragleave",()=>head.classList.remove("s262-drop"));
            head.addEventListener("drop",e=>{
                if(!draggedPlayerId) return;
                e.preventDefault();head.classList.remove("s262-drop");
                const s=discoverActualGroupStore();
                if(!s) return;
                const g=s.d.groups.find(x=>String(x.name)===visibleName) || s.d.groups[index];
                if(!g) return;
                s.d.players[String(draggedPlayerId)]=g.id;
                localStorage.setItem(s.key,JSON.stringify(s.d));
                draggedPlayerId="";
                if(typeof start11RenderFullSquad==="function") start11RenderFullSquad();
                if(typeof visNotification==="function") visNotification(`Spilleren er flyttet til ${g.name}.`);
            });
        });

        // Make group chips explanatory on hover.
        chips.forEach(c=>c.title="Grupperne bruges til at holde egen trup, U13, U16 osv. adskilt.");
    }

    /* ---------- match-plan: inject the missing visible section ---------- */
    window.s262EnsureMatchSituationsPanel=function(){
        const modal=document.getElementById("matchplanModal");
        if(!modal) return;

        let panel=document.getElementById("s262MatchSituations");
        if(!panel){
            panel=document.createElement("section");
            panel.id="s262MatchSituations";

            const save=document.getElementById("saveMatchplan");
            const parent=save?.parentElement || modal.querySelector(".modal-content") || modal.firstElementChild || modal;
            if(save && save.parentElement===parent) parent.insertBefore(panel,save);
            else parent.appendChild(panel);
        }

        let count=0;
        try{
            if(s13Data?.matchTacticalSituations){
                count=Object.values(s13Data.matchTacticalSituations).reduce((n,a)=>n+(Array.isArray(a)?a.length:0),0);
            }
        }catch(_){}

        panel.innerHTML=`
          <div class="s262head">
             <strong>⚽ KAMPSITUATIONER</strong>
             <span class="s262count">${count ? count+" GEMT" : "TAKTISK TAVLE"}</span>
          </div>
          <div class="s262sub">
             Opret holdets positioner i forskellige situationer. Start med MED BOLD og UDEN BOLD,
             eller opret egne situationer. Spillerne kan flyttes frit på den taktiske tavle.
          </div>
          <div class="s262actions">
             <button type="button" class="s13btn primary" id="s262OpenSituations">ÅBN KAMPSITUATIONER →</button>
             <button type="button" class="s13btn" id="s262NewSituation">+ OPRET NY SITUATION</button>
          </div>
        `;

        panel.querySelector("#s262OpenSituations").onclick=()=>{
            if(typeof window.s25OpenMatchSituations==="function") window.s25OpenMatchSituations();
            else if(typeof visNotification==="function") visNotification("Kampsituationer kunne ikke åbnes.");
        };
        panel.querySelector("#s262NewSituation").onclick=()=>{
            if(typeof window.s25OpenMatchSituations==="function"){
                window.s25OpenMatchSituations();
                setTimeout(()=>{
                    document.querySelector("#s25manager [data-new]")?.click();
                },30);
            }
        };
    };

    // Capture clicks that open KAMPPLAN, then inject after the legacy modal has opened.
    document.addEventListener("click",e=>{
        const trigger=e.target.closest?.("#openCurrentMatchButton,#editMatchPlanShortcut,#editMatchInfoBottom,#editTacticsBottom,#s19MatchPlanButton");
        if(trigger) setTimeout(()=>window.s262EnsureMatchSituationsPanel?.(),20);
    },true);

    // Also handle direct calls to åbnKampplan by observing modal visibility / DOM.
    const modalObserver=new MutationObserver(()=>{
        const modal=document.getElementById("matchplanModal");
        if(modal && getComputedStyle(modal).display!=="none") window.s262EnsureMatchSituationsPanel?.();
    });
    const observeModal=()=>{
        const modal=document.getElementById("matchplanModal");
        if(modal) modalObserver.observe(modal,{attributes:true,attributeFilter:["style","class"],childList:true,subtree:false});
        else setTimeout(observeModal,250);
    };
    observeModal();

    /* ---------- keep bindings alive after rerenders ---------- */
    let scheduled=false;
    const refresh=()=>{
        if(scheduled) return;
        scheduled=true;
        requestAnimationFrame(()=>{
            scheduled=false;
            wireExerciseBank();
            wireSquadGroups();
        });
    };

    const observer=new MutationObserver(refresh);
    const begin=()=>{
        observer.observe(document.body,{childList:true,subtree:true});
        refresh();
    };
    if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",begin,{once:true});
    else begin();

    window.START11_BUILD="V26.2-STABLE-INTEGRATION";
    console.info("START11 loaded:",window.START11_BUILD);
})();




/* =========================================================
   START11 V26.5
   BASE: V26.2_STABLE_INTEGRATION_FULD
   IMPORTANT:
   - ØVELSESBANKEN ER IKKE ÆNDRET.
   - Spillergrupper fjernes helt.
   - Kampsituationer bruger en designer tæt på øvelsesdesigneren.
   - Valgte kampsituationer tilføjes direkte til lavPDF().
========================================================= */
(function start11V265(){
"use strict";

const E=v=>typeof s13Esc==="function"?s13Esc(String(v??"")):String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const ID=p=>p+"_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,7);

/* =========================================================
   1. FJERN KUN SPILLERGRUPPER
========================================================= */
window.s25MountSquadGroups=function(){
    document.getElementById("s25SquadGroups")?.remove();
};
window.s25OrganizeSquadRows=function(){};
window.s25MountPlayerGroupSelect=function(){
    document.getElementById("s25PlayerGroupWrap")?.remove();
};

function cleanPlayerGroups(){
    document.getElementById("s25SquadGroups")?.remove();
    document.getElementById("s25PlayerGroupWrap")?.remove();

    const list=document.getElementById("fullSquadList");
    if(!list)return;

    // V25 kan allerede have indsat gruppeoverskrifter. Kun overskrifterne fjernes.
    list.querySelectorAll(".s25grouphead").forEach(x=>x.remove());
    list.querySelectorAll(".full-squad-row").forEach(r=>{
        r.draggable=false;
        r.classList.remove("s262-dragging");
        r.removeAttribute("data-s262-drag-bound");
    });
}
setTimeout(cleanPlayerGroups,0);
setTimeout(cleanPlayerGroups,250);

/* =========================================================
   2. KAMPSITUATION DATA
========================================================= */
function matchKey(){
    return String(
        (typeof s19MatchMode!=="undefined" && s19MatchMode?.key) ||
        [
            typeof kampplan!=="undefined" ? kampplan?.matchDate : "",
            typeof kampplan!=="undefined" ? kampplan?.homeTeam : "",
            typeof kampplan!=="undefined" ? kampplan?.awayTeam : ""
        ].filter(Boolean).join("|") ||
        "current"
    );
}
function currentLineup(){
    const f=(typeof formationer!=="undefined" && typeof formationSelector!=="undefined")
        ? (formationer[formationSelector?.value]||[])
        : [];
    return f.slice(0,11).map((pos,i)=>{
        const p=(typeof spillere!=="undefined" ? spillere[i] : null)||{};
        return {
            id:ID("pl"),
            name:p.name||pos?.[0]||`Spiller ${i+1}`,
            number:p.number||"",
            gk:i===0||pos?.[0]==="GK",
            x:Number(pos?.[1]||50),
            y:Number(pos?.[2]||50),
            w:7,
            h:7,
            rot:0
        };
    });
}
function displayFirstName(name){
    const value=String(name||"").trim();
    return value ? value.split(/\s+/)[0] : "";
}
function opponentPositionName(i){
    // Standard 4-3-3 position labels, ordered from goalkeeper through defence,
    // midfield and attack. Labels remain stable even when the player is moved.
    return ["GK","LB","CB","CB","RB","CDM","CM","CM","LW","ST","RW"][i] || "CB";
}
function defaultOpponents(){
    const pos=[[8,50],[23,20],[23,40],[23,60],[23,80],[42,25],[42,45],[42,65],[42,82],[63,35],[63,65]];
    return pos.map((p,i)=>({id:ID("opp"),number:String(i+1),name:opponentPositionName(i),x:p[0],y:p[1],w:3.1,h:7.5}));
}
function newSituation(title){
    return {
        id:ID("sit"),
        title,
        focus:"",
        note:"",
        includeInPdf:true,
        players:currentLineup().map(o=>{const x=o.x,y=o.y;o.x=Math.max(3,Math.min(97,100-y));o.y=Math.max(5,Math.min(95,x));return o;}),
        opponents:defaultOpponents(),
        balls:[],
        cones:[],
        texts:[],
        arrows:[],
        zones:[],
        pitchOrientation:"landscape-v1"
    };
}
function situations(){
    if(!s13Data.matchTacticalSituations || typeof s13Data.matchTacticalSituations!=="object"){
        s13Data.matchTacticalSituations={};
    }
    const k=matchKey();
    if(!Array.isArray(s13Data.matchTacticalSituations[k])){
        s13Data.matchTacticalSituations[k]=[newSituation("Med bold"),newSituation("Uden bold")];
    }
    return s13Data.matchTacticalSituations[k];
}
function saveSituations(){
    // Persist through START11's existing data/cloud save path and return its
    // result so explicit GEM can wait for completion before closing.
    if(typeof s13Save==="function")return s13Save();
    if(typeof scheduleCloudSave==="function")return scheduleCloudSave();
    console.error("START11: hverken s13Save eller scheduleCloudSave er tilgængelig.");
    return false;
}

/* =========================================================
   3. DESIGN – SAMME VISUELLE SPROG SOM ØVELSESDESIGNEREN
========================================================= */
if(!document.getElementById("s265css")){
    const st=document.createElement("style");
    st.id="s265css";
    st.textContent=`
    .s265overlay{position:fixed;inset:0;z-index:2147483646;background:#000e;display:grid;place-items:center;padding:12px}
    .s265pro{width:min(1420px,98vw);height:min(940px,97vh);overflow:hidden;border:1px solid rgba(130,255,84,.35);border-radius:11px;background:#061008;color:#fff;box-shadow:0 30px 100px #000}
    .s265top{display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:9px 10px;border-bottom:1px solid rgba(255,255,255,.08);background:#071009}
    .s265top strong{font-size:10px;margin-right:auto}.s265top .s265muted{font-size:6px;color:#829087;margin-right:12px}
    .s265top .s265iconbtn{width:39px;height:36px;min-width:39px;padding:7px!important;display:inline-flex;align-items:center;justify-content:center;color:#e8f0e9;background:#0a160d;border:1px solid #315d32;border-radius:7px;cursor:pointer;transition:background .15s,border-color .15s,color .15s}
    .s265top .s265iconbtn svg{width:21px;height:21px;display:block}
    .s265top .s265iconbtn:hover,.s265top .s265iconbtn:focus-visible{background:#15331b;border-color:#82ff54;color:#82ff54;outline:none}
    .s265top .s265iconbtn.active{background:#172d1b;border-color:#82ff54;color:#82ff54;box-shadow:inset 0 0 0 1px #82ff5433}
    .s265layout{height:calc(100% - 55px);min-height:0;display:grid;grid-template-columns:235px minmax(0,1fr) 300px}.s265workarea{display:grid;grid-template-columns:44px minmax(0,1fr);min-width:0;min-height:0}.s265toolrail{display:flex;flex-direction:column;align-items:center;gap:5px;padding:8px 4px;background:#071009;border-right:1px solid #24482d;overflow:auto}.s265toolrail .s265iconbtn{width:36px;height:36px;min-width:36px;padding:7px!important;display:flex;align-items:center;justify-content:center;background:#0a170d;border:1px solid #203b28;border-radius:7px;color:#a8b8aa;cursor:pointer}.s265toolrail .s265iconbtn svg{width:22px;height:22px;display:block}.s265toolrail .s265iconbtn:hover{background:#102318;color:#e7f5e8;border-color:#47733e}.s265toolrail .s265iconbtn.active{background:#17351d;border-color:#82ff54;color:#82ff54}
    .s265scenarios{padding:10px;overflow:auto;border-right:1px solid rgba(255,255,255,.08);background:#071009}
    .s265scenarios h3{font-size:8px;margin:2px 0 9px;color:#dce6dd}
    .s265scenario{display:block;width:100%;text-align:left;padding:10px;margin:0 0 7px;border:1px solid rgba(255,255,255,.11);border-radius:7px;background:#0a150c;color:#fff;cursor:pointer}
    .s265scenario.active{border:1px solid #82ff54;box-shadow:inset 3px 0 #82ff54;background:#102014}
    .s265scenario b{display:block;font-size:11px;margin-bottom:5px}.s265scenario small{display:block;font-size:9px;color:#829087;line-height:1.4}
    .s265boardwrap{padding:12px;min-width:0;min-height:0;overflow:auto;display:grid;place-items:center;background:#040b06}
    .s265board{position:relative;width:min(100%,1000px);aspect-ratio:105/68;max-height:100%;background:repeating-linear-gradient(90deg,#176b37 0,#176b37 12.5%,#1b713b 12.5%,#1b713b 25%);border:2px solid #fff;overflow:hidden;touch-action:none;user-select:none}
    .s265half{position:absolute;top:0;bottom:0;left:50%;border-left:2px solid #fff9}
    .s265circle{position:absolute;left:50%;top:50%;width:18%;aspect-ratio:1;border:2px solid #fff9;border-radius:50%;transform:translate(-50%,-50%)}
    .s265box{position:absolute;top:25%;width:15%;height:50%;border:2px solid #fff9}.s265box.a{left:-2px}.s265box.b{right:-2px}
    .s265board:before,.s265board:after{content:"";position:absolute;top:38%;width:5%;height:24%;border:2px solid #fff9}.s265board:before{left:-2px}.s265board:after{right:-2px}
    .s265svg{position:absolute;inset:0;width:100%;height:100%;z-index:8;pointer-events:none;overflow:visible}
    .s265item{position:absolute;z-index:6;transform:translate(-50%,-50%);display:grid;place-items:center;cursor:grab;touch-action:none}
    .s265item.selected{outline:2px solid var(--s11-primary,#82ff54);outline-offset:5px}
    .s265player,.s265opp{width:100%;height:100%;min-width:14px;min-height:16px;display:grid;place-items:center;font-size:8px;font-weight:950;filter:drop-shadow(0 2px 2px #0007)}
    .s265player,.s265opp{clip-path:none;background:transparent!important;position:relative;display:flex;align-items:center;justify-content:center}.s265shirtshape{position:absolute;inset:0;width:100%;height:100%;display:block;transform:scaleX(1.75);transform-origin:center center}.s265player,.s265opp{isolation:isolate}
    .s265player{background:#f43b40;color:#fff;border:0}.s265player.gk{background:#f43b40;color:#fff}
    .s265opp{background:#2584ff;color:#fff;border:0}.s265ball{width:100%;height:100%;border-radius:50%;background:#fff;border:3px dotted #111}
    .s265cone{font-size:24px;color:#ff9d31;line-height:1}.s265text{padding:4px 7px;background:#071008;border:1px solid #fff5;border-radius:5px;font-size:7px;white-space:nowrap}
    .s265name{position:absolute;top:calc(100% + 3px);left:50%;transform:translateX(-50%);padding:0;background:transparent;border:0;border-radius:0;color:#fff;font-size:clamp(9px,.78vw,11px);font-weight:850;line-height:1.2;white-space:nowrap;text-shadow:0 1px 2px #001b08,1px 0 1px #001b08,-1px 0 1px #001b08,0 -1px 1px #001b08;z-index:9;pointer-events:none}.s265player span,.s265opp span{font-size:clamp(8px,.8vw,11px)!important}.s265item.selected{outline:2px solid #82ff54;outline-offset:2px;border-radius:2px}
    .s265zone{position:absolute;z-index:2;border:2px dashed #ffe64d;background:#ffe64d22;cursor:grab;touch-action:none}.s265zone.selected{outline:2px solid var(--s11-primary,#82ff54);outline-offset:3px}
    .s265handle{position:absolute;width:13px;height:13px;border:2px solid #061008;border-radius:3px;background:var(--s11-primary,#82ff54);z-index:20}
    .s265handle.br{right:-8px;bottom:-8px;cursor:nwse-resize}.s265handle.tl{left:-8px;top:-8px;cursor:nwse-resize}
    .s265arrowhit{pointer-events:stroke;stroke:transparent;stroke-width:8;cursor:pointer}.s265arrow-visible{pointer-events:none}.s265handle{touch-action:none}
    .s265side{padding:12px;border-left:1px solid rgba(255,255,255,.08);overflow:auto;background:#071009}
    .s265section{padding:10px;margin-bottom:9px;border:1px solid rgba(130,255,84,.15);border-radius:8px;background:#09140b}
    .s265section-title{font-size:11px;letter-spacing:.7px;color:#82ff54;font-weight:950;margin-bottom:8px}
    .s265section .s265formations{gap:7px;margin-top:8px}
    .s265section .s265formations button{min-height:43px;padding:9px 5px!important;border:1px solid #31563a!important;border-radius:8px!important;background:linear-gradient(180deg,#14291a 0%,#0b180f 100%)!important;color:#dcefe0!important;font:800 12px/1 Arial,sans-serif!important;letter-spacing:.25px;box-shadow:inset 0 1px 0 #ffffff0a,0 2px 5px #0004;cursor:pointer;transition:transform .16s ease,border-color .16s ease,background .16s ease,box-shadow .16s ease}
    .s265section .s265formations button:hover{transform:translateY(-2px);border-color:#82ff54!important;background:linear-gradient(180deg,#21452a 0%,#112719 100%)!important;color:#aaff87!important;box-shadow:0 5px 12px #0005,0 0 0 1px #82ff5420}
    .s265section .s265formations button:active{transform:translateY(0) scale(.98)}
    .s265section .s265formations button:focus-visible{outline:2px solid #82ff54;outline-offset:2px}
    @media(max-width:420px){.s265section .s265formations{gap:5px}.s265section .s265formations button{min-height:39px;font-size:11px!important}}
    .s265toolbar-label{font-size:10px;color:#829087;font-weight:900;margin:0 0 5px 2px}
    .s265side h3{font-size:12px;margin:0 0 10px}.s265field{display:grid;gap:4px;margin-bottom:10px}.s265field label{font-size:10px;color:#929d95;font-weight:900}
    .s265field input,.s265field textarea,.s265field select{box-sizing:border-box;width:100%;padding:8px;border:1px solid rgba(255,255,255,.12);border-radius:6px;background:#0a160d;color:#fff;font:inherit;font-size:11px}
    .s265field textarea{min-height:85px;resize:vertical}.s265hint{padding:10px;border:1px dashed rgba(130,255,84,.25);border-radius:6px;color:#a8b8aa;font-size:10px;line-height:1.55}
    .s265manager{width:min(900px,96vw);max-height:92vh;overflow:auto;border:1px solid rgba(130,255,84,.35);border-radius:10px;background:#061008}
    .s265cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:8px;padding:12px}.s265card{padding:10px;border:1px solid rgba(255,255,255,.09);border-radius:7px;background:#0a150c}
    .s265card strong{font-size:8px}.s265card p{font-size:6px;color:#849087;min-height:18px}.s265cardfoot{display:flex;justify-content:space-between;align-items:center;gap:6px}
    @media(max-width:1050px){.s265layout{grid-template-columns:190px minmax(0,1fr) 260px}.s265board{width:100%}.s265workarea{grid-template-columns:40px minmax(0,1fr)}}
    @media(max-width:820px){.s265layout{grid-template-columns:1fr;height:auto}.s265pro{overflow:auto;height:96vh}.s265scenarios{border-right:0;border-bottom:1px solid rgba(255,255,255,.08);max-height:150px}.s265workarea{min-height:520px}.s265toolrail{padding:5px 2px}.s265toolrail .s265iconbtn{width:32px;min-width:32px;height:32px}.s265boardwrap{min-height:500px}.s265side{border-left:0;border-top:1px solid rgba(255,255,255,.08)}}
    `;
    document.head.appendChild(st);
}

function bindMove(el,obj,board,render){
    let moving=false;
    el.addEventListener("pointerdown",e=>{
        if(e.target.closest(".s265handle"))return;
        moving=true;
        try{el.setPointerCapture(e.pointerId)}catch(_){}
        e.preventDefault();
    });
    el.addEventListener("pointermove",e=>{
        if(!moving)return;
        const r=board.getBoundingClientRect();
        obj.x=Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100));
        obj.y=Math.max(0,Math.min(100,(e.clientY-r.top)/r.height*100));
        el.style.left=obj.x+"%";el.style.top=obj.y+"%";
    });
    el.addEventListener("pointerup",()=>{if(moving){moving=false;render();}});
    el.addEventListener("pointercancel",()=>{moving=false;render();});
}
function bindResize(handle,obj,board,render,isZone=false){
    let active=false,start=null;
    handle.addEventListener("pointerdown",e=>{
        active=true;
        start={cx:e.clientX,cy:e.clientY,w:Number(obj.w||7),h:Number(obj.h||7)};
        try{handle.setPointerCapture(e.pointerId)}catch(_){}
        e.preventDefault();e.stopPropagation();
    });
    handle.addEventListener("pointermove",e=>{
        if(!active)return;
        const r=board.getBoundingClientRect();
        obj.w=Math.max(isZone?5:2,Math.min(45,start.w+(e.clientX-start.cx)/r.width*100));
        obj.h=Math.max(isZone?5:2,Math.min(45,start.h+(e.clientY-start.cy)/r.height*100));
        render();
    });
    handle.addEventListener("pointerup",()=>{if(active){active=false;render();}});
    handle.addEventListener("pointercancel",()=>{active=false;render();});
}

function openDesigner(id,after){
    const s=situations().find(x=>String(x.id)===String(id));if(!s)return;
    ["players","opponents","balls","cones","texts","arrows","zones"].forEach(k=>{if(!Array.isArray(s[k]))s[k]=k==="players"?currentLineup():[]});
    // One-time migration from the old portrait pitch to the new landscape pitch.
    if(s.pitchOrientation!=="landscape-v1"){
        const swap=o=>{const x=Number(o.x??50),y=Number(o.y??50);o.x=Math.max(3,Math.min(97,100-y));o.y=Math.max(5,Math.min(95,x));};
        [...s.players,...s.opponents,...s.balls,...s.cones,...s.texts,...s.zones].forEach(swap);
        s.arrows.forEach(a=>{const x1=Number(a.x1),y1=Number(a.y1),x2=Number(a.x2),y2=Number(a.y2);a.x1=100-y1;a.y1=x1;a.x2=100-y2;a.y2=x2;});
        s.pitchOrientation="landscape-v1";
    }
    if(!s.awayShirtColor)s.awayShirtColor="#2584ff";
    if(!s.opponents.length)s.opponents=defaultOpponents();
    // Upgrade generic legacy labels without overwriting custom names.
    s.opponents.forEach((p,i)=>{
      if(!p.name || /^Modstander\s*\d*$/i.test(String(p.name).trim())) p.name=opponentPositionName(i);
    });
    // One-time orientation migration: the away side starts on the right and attacks right-to-left.
    if(s.opponentDirectionVersion!=="right-to-left-v1"){
        s.opponents.forEach(o=>{o.x=Math.max(3,Math.min(97,100-Number(o.x??50)));});
        s.opponentDirectionVersion="right-to-left-v1";
    }
    s.opponents.forEach((o,i)=>{if(!o.number)o.number=String(i+1);if(!o.w||o.w>6)o.w=4.4;if(o.w<4.4)o.w=4.4;if(!o.h||o.h>10)o.h=8.4;});
    s.players.forEach(x=>{if(!x.id)x.id=ID("pl");x.w=4.4;x.h=8.4});
    [...s.opponents,...s.balls,...s.cones,...s.texts].forEach(x=>{if(!x.id)x.id=ID("ob");if(!x.w)x.w=x.type==="text"?15:3.1;if(!x.h)x.h=7.5});
    s.zones.forEach(x=>{if(!x.id)x.id=ID("zone");if(!x.w)x.w=20;if(!x.h)x.h=12});
    s.arrows.forEach(x=>{if(!x.id)x.id=ID("arr")});

    document.getElementById("s265designer")?.remove();
    const ov=document.createElement("div");ov.id="s265designer";ov.className="s265overlay";ov.style.zIndex="2147483647";
    ov.innerHTML=`<div class="s265pro">
      <div class="s265top">
        <strong>TAKTISK DESIGNER</strong><span class="s265muted">${E(s.title)}</span>
        <span class="s265muted">Værktøjer findes i venstre side</span>
        <button class="s13btn" data-reset>NULSTIL XI</button>
        <button class="s13btn primary" data-save>GEM</button>
        <button class="s13btn" data-close>LUK</button>
      </div>
      <div class="s265layout">
        <aside class="s265scenarios"><h3>GEMTE SITUATIONER</h3><div id="s265scenarioList"></div><div class="s265hint">Vælg en situation for at redigere den. Ændringer gemmes med GEM.</div></aside>
        <div class="s265workarea"><nav class="s265toolrail" aria-label="Tegneværktøjer">
          <button class="s13btn s265iconbtn active" data-tool="select" title="Vælg / flyt" aria-label="Vælg / flyt"><svg viewBox="0 0 24 24"><path d="M5 3l13 11-6 .7-3.2 5.3z" fill="currentColor"/></svg></button>
          <button class="s13btn s265iconbtn" data-tool="own" title="Eget hold – spillerbrik" aria-label="Eget hold – spillerbrik"><svg viewBox="0 0 24 24"><path d="M6 4l4-2 2 3 2-3 4 2 4 5-4 3-2-3v13H8V9l-2 3-4-3z" fill="#f43b40"/></svg></button>
          <button class="s13btn s265iconbtn" data-tool="opp" title="Modstander – spillerbrik" aria-label="Modstander – spillerbrik"><svg viewBox="0 0 24 24"><path d="M6 4l4-2 2 3 2-3 4 2 4 5-4 3-2-3v13H8V9l-2 3-4-3z" fill="#2584ff"/></svg></button>
          <button class="s13btn s265iconbtn" data-tool="ball" title="Bold" aria-label="Bold"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 8h6l2 5-5 4-5-4z" fill="currentColor"/></svg></button>
          <button class="s13btn s265iconbtn" data-tool="cone" title="Kegle" aria-label="Kegle"><svg viewBox="0 0 24 24"><path d="M12 3L5 20h14z" fill="currentColor"/><path d="M8 14h8M6 19h12" stroke="#071009" stroke-width="1.5"/></svg></button>
          <button class="s13btn s265iconbtn" data-tool="pass" title="Aflevering – træk for at tegne" aria-label="Aflevering"><svg viewBox="0 0 24 24"><path d="M3 12h17m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
          <button class="s13btn s265iconbtn" data-tool="run" title="Løb – træk for at tegne" aria-label="Løb"><svg viewBox="0 0 24 24"><path d="M3 17c4-11 8 5 12-5s5-4 6-6m-6 0h6v6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
          <button class="s13btn s265iconbtn" data-tool="dribble" title="Dribling med bold – træk for at tegne" aria-label="Dribling"><svg viewBox="0 0 24 24"><path d="M3 18c4-9 7 4 11-4s4-4 7-9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="2 2"/><circle cx="5" cy="18" r="2.3" fill="currentColor"/></svg></button>
          <button class="s13btn s265iconbtn" data-tool="arrow" title="Pil – hold museknappen nede og træk" aria-label="Pil"><svg viewBox="0 0 24 24"><path d="M3 20L20 3m-9 0h9v9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
          <button class="s13btn s265iconbtn" data-tool="curve" title="Buet pil – træk fra start til slut" aria-label="Buet pil"><svg viewBox="0 0 24 24"><path d="M3 19C4 5 14 4 20 8m-6-4 6 4-4 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
          <button class="s13btn s265iconbtn" data-tool="zone" title="Zone – træk for at tegne felt" aria-label="Zone"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" fill="currentColor" fill-opacity=".16" stroke="currentColor" stroke-width="1.8" stroke-dasharray="3 2"/></svg></button>
          <button class="s13btn s265iconbtn" data-tool="text" title="Tekst" aria-label="Tekst"><svg viewBox="0 0 24 24"><path d="M4 5h16M12 5v15M8 20h8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button>
          <button class="s13btn s265iconbtn" data-tool="freehand" title="Frihåndstegning" aria-label="Frihåndstegning"><svg viewBox="0 0 24 24"><path d="M4 17c3-8 4 2 7-4s4 2 9-7M3 21h18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
          <button class="s13btn s265iconbtn" data-tool="line" title="Linje – træk for at tegne" aria-label="Linje"><svg viewBox="0 0 24 24"><path d="M4 20L20 4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button>
          <button class="s13btn s265iconbtn" data-tool="goal" title="Markér mål" aria-label="Mål"><svg viewBox="0 0 24 24"><path d="M4 20V4h16v16M4 4l16 16M20 4L4 20" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button>
          <button class="s13btn s265iconbtn" data-tool="defense" title="Forsvarsmarkering / pres – træk for at tegne" aria-label="Forsvarsmarkering"><svg viewBox="0 0 24 24"><path d="M4 4v16M9 4v16M14 4v16M19 4v16" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 2"/><path d="M3 12h18m-5-4 5 4-5 4" fill="none" stroke="currentColor" stroke-width="2"/></svg></button>
          <button class="s13btn s265iconbtn" data-tool="delete" title="Slet valgt objekt" aria-label="Slet valgt objekt"><svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3m-9 0 1 13h10l1-13M10 10v7m4-7v7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>
        </nav><div class="s265boardwrap"><div class="s265board" id="s265board">
          <div class="s265half"></div><div class="s265circle"></div><div class="s265box a"></div><div class="s265box b"></div>
          <svg class="s265svg" id="s265svg" viewBox="0 0 100 100" preserveAspectRatio="none"></svg>
        </div></div></div>
        <aside class="s265side">
          <div class="s265section"><h3>SITUATION</h3>
            <div class="s265field"><label>NAVN</label><input id="s265title" value="${E(s.title)}"></div>
            <div class="s265field"><label>TYPE</label><select id="s265type"><option value="med">Med bold</option><option value="uden">Uden bold</option><option value="standard">Standard</option></select></div>
            <div class="s265field"><label>FOKUSPUNKT</label><textarea id="s265focus">${E(s.focus||"")}</textarea></div>
            <div class="s265field"><label>NOTE</label><textarea id="s265note">${E(s.note||"")}</textarea></div>
            <div class="s265field"><label><input id="s265pdf" type="checkbox" ${s.includeInPdf!==false?"checked":""}> VIS I KAMP-PDF</label></div>
          </div>
          <div class="s265section"><div class="s265section-title">FORMATION</div><div class="s265field"><label>VÆLG HOLD</label><select id="s265team"><option value="own">Eget hold</option><option value="opp">Modstander / udehold</option></select></div><div class="s265formations"><button type="button" data-formation="4-3-3">4-3-3</button><button type="button" data-formation="4-4-2">4-4-2</button><button type="button" data-formation="4-2-3-1">4-2-3-1</button><button type="button" data-formation="3-5-2">3-5-2</button><button type="button" data-formation="5-3-2">5-3-2</button><button type="button" data-formation="4-1-4-1">4-1-4-1</button></div><div class="s265hint" style="margin-top:8px">Vælg først holdet, og vælg derefter formation. Udeholdet placeres spejlvendt, så det står modsat eget hold og spiller fra højre mod venstre.</div></div>
          <div class="s265section"><div class="s265section-title">TRØJEFARVER</div><div class="s265field"><label>UDEHOLDETS TRØJEFARVE</label><input id="s265awayColor" type="color" value="${E(s.awayShirtColor||"#2584ff")}" style="width:100%;height:38px;padding:3px;cursor:pointer"></div><div class="s265hint">Hjemmeholdet følger automatisk trøjefarven fra START11s indstillinger. Her vælger du farven for udeholdet.</div></div>
          <div class="s265section"><div class="s265section-title">TIP TIL REDIGERING</div><div class="s265hint">Klik på et objekt for at vælge det, og træk det til den ønskede position. Valgte objekter kan ændres i størrelse. Delete/Backspace sletter valgte ekstraobjekter. Spillere fra startopstillingen kan flyttes, men ikke slettes.</div></div>
        </aside>
      </div>
    </div>`;
    document.body.appendChild(ov);
    const board=ov.querySelector("#s265board"),svg=ov.querySelector("#s265svg");
    const teamSelect=ov.querySelector("#s265team");
    let activeFormationTeam="own";
    if(teamSelect)teamSelect.addEventListener("change",()=>{activeFormationTeam=teamSelect.value;});
    const awayColorInput=ov.querySelector("#s265awayColor");
    if(!s.awayShirtColor)s.awayShirtColor="#2584ff";
    if(awayColorInput)awayColorInput.addEventListener("input",()=>{s.awayShirtColor=awayColorInput.value;render();});
    const formationCoords={
      "4-3-3":[[8,50],[23,20],[23,40],[23,60],[23,80],[42,32],[45,50],[42,68],[66,22],[76,50],[66,78]],
      "4-4-2":[[8,50],[23,20],[23,40],[23,60],[23,80],[43,20],[43,40],[43,60],[43,80],[73,38],[73,62]],
      "4-2-3-1":[[8,50],[23,20],[23,40],[23,60],[23,80],[38,38],[38,62],[57,25],[60,50],[57,75],[77,50]],
      "3-5-2":[[8,50],[23,25],[23,50],[23,75],[44,15],[44,32],[44,50],[44,68],[44,85],[72,38],[72,62]],
      "5-3-2":[[8,50],[20,15],[20,32],[20,50],[20,68],[20,85],[43,32],[43,50],[43,68],[72,38],[72,62]],
      "4-1-4-1":[[8,50],[23,20],[23,40],[23,60],[23,80],[37,50],[53,18],[53,39],[53,61],[53,82],[76,50]]
    };
    // Position labels follow the selected formation. The array order matches the
    // formation coordinates: goalkeeper first, then defensive/midfield/attacking lines.
    const formationPositionLabels={
      // The editor's pitch view is mirrored relative to the team's left/right.
      // Swap L/R roles to match the visual side; central midfielders are simply CM.
      "4-3-3":["GK","RB","CB","CB","LB","CM","CM","CM","RW","ST","LW"],
      "4-4-2":["GK","RB","CB","CB","LB","RM","CM","CM","LM","ST","ST"],
      "4-2-3-1":["GK","RB","CB","CB","LB","RDM","LDM","RW","CAM","LW","ST"],
      "3-5-2":["GK","CB","CB","CB","RWB","CM","CM","CM","LWB","ST","ST"],
      "5-3-2":["GK","RWB","CB","CB","CB","LWB","CM","CM","CM","ST","ST"],
      "4-1-4-1":["GK","RB","CB","CB","LB","CDM","RM","CM","CM","LM","ST"]
    };
    ov.querySelectorAll("[data-formation]").forEach(btn=>btn.addEventListener("click",()=>{
      const team=teamSelect?.value||activeFormationTeam;
      const target=team==="opp"?s.opponents:s.players;
      const coords=formationCoords[btn.dataset.formation]||formationCoords["4-3-3"];
      target.forEach((player,i)=>{if(coords[i]){const x=coords[i][0];player.x=team==="opp"?100-x:x;player.y=coords[i][1];}});
      // Ensure 11 pieces exist before applying the selected formation.
      while(target.length<11){const i=target.length;target.push(team==="opp"?{id:ID("opp"),number:String(i+1),name:opponentPositionName(i),w:3.5,h:8.4}:{id:ID("pl"),number:"",name:"Spiller "+(i+1),w:3.1,h:7.5,gk:i===0});}
      target.forEach((player,i)=>{if(coords[i]){player.x=team==="opp"?100-coords[i][0]:coords[i][0];player.y=coords[i][1];}});
      // Opponent shirts use position abbreviations as their visible labels. Refresh
      // those labels on every formation change, without changing shirt numbers.
      if(team==="opp"){
        const labels=formationPositionLabels[btn.dataset.formation]||formationPositionLabels["4-3-3"];
        target.forEach((player,i)=>{if(labels[i])player.name=labels[i];});
      }
      render();
    }));
    const typeSelect=ov.querySelector("#s265type");
    if(typeSelect){typeSelect.value=/uden/i.test(s.title)?"uden":/med bold/i.test(s.title)?"med":"standard";typeSelect.addEventListener("change",()=>{if(typeSelect.value==="med")ov.querySelector("#s265title").value="Med bold";else if(typeSelect.value==="uden")ov.querySelector("#s265title").value="Uden bold";});}
    const scenarioList=ov.querySelector("#s265scenarioList");
    scenarioList.innerHTML=situations().map(x=>`<button type="button" class="s265scenario ${String(x.id)===String(s.id)?"active":""}" data-scenario="${E(x.id)}"><b>${E(x.title)}</b><small>${E(x.focus||"Intet fokuspunkt endnu")}</small></button>`).join("");
    scenarioList.querySelectorAll("[data-scenario]").forEach(b=>b.addEventListener("click",()=>{
      const nextId=b.dataset.scenario;
      if(String(nextId)===String(s.id))return;
      if(!confirm("Skift situation? Gem først dine ændringer med GEM, hvis du vil beholde dem."))return;
      ov.remove();openDesigner(nextId,after);
    }));
    let selected=null, activeTool="select", pointerDraw=null, previewDraw=null;
    const toolButtons=[...ov.querySelectorAll("[data-tool]")];
    function setTool(t){activeTool=t;toolButtons.forEach(b=>b.classList.toggle("active",b.dataset.tool===t));board.style.cursor=(t==="select"?"default":t==="text"?"text":"crosshair");}
    toolButtons.forEach(b=>b.addEventListener("click",()=>{const t=b.dataset.tool;setTool(t);if(t==="delete"||t==="erase")removeSelected();if(t==="text"){const text=prompt("Tekst på tavlen:","Fokus");if(text?.trim()){s.texts.push({id:ID("text"),x:50,y:50,w:15,h:7,text:text.trim()});render();setTool("select")}}}));

    function removeSelected(){
        if(!selected)return;
        ["players","opponents","balls","cones","texts","zones","arrows"].forEach(k=>s[k]=s[k].filter(x=>x!==selected));
        selected=null;render();
    }

    function select(obj){selected=obj;render()}

    function item(obj,kind){
        const cssVar=(name,fallback)=>{const v=getComputedStyle(document.documentElement).getPropertyValue(name).trim();return /^#[0-9a-f]{3,8}$/i.test(v)?v:fallback;};
        const homeColor=cssVar("--s11-shirt","#c8ff00");
        const keeperColor=cssVar("--s11-gk-shirt","#e31d1d");
        const awayColor=s.awayShirtColor||"#2584ff";
        const shade=(hex,amount)=>{if(!/^#[0-9a-f]{6}$/i.test(hex))return hex;const n=parseInt(hex.slice(1),16);return "#"+[16,8,0].map(sh=>Math.max(0,Math.min(255,((n>>sh)&255)+amount)).toString(16).padStart(2,"0")).join("");};
        const el=document.createElement("div");el.className="s265item"+(selected===obj?" selected":"");
        el.style.left=obj.x+"%";el.style.top=obj.y+"%";el.style.width=((kind==="player"||kind==="opp")?5.8:(obj.w||7))+"%";el.style.height=((kind==="player"||kind==="opp")?6.3:(obj.h||7))+"%";
        if(kind==="player")el.innerHTML=`<div class="s265player ${obj.gk?"gk":""}"><svg class="s265shirtshape" viewBox="0 0 40 48" aria-hidden="true"><path d="M12 3 17 1h6l5 2 9 7-5 9-5-3v30H13V16l-5 3-5-9z" fill="${obj.gk?keeperColor:homeColor}" stroke="${shade(obj.gk?keeperColor:homeColor,-25)}" stroke-width="1.2" stroke-linejoin="round"/><path d="M15 2q5 6 10 0" fill="none" stroke="${shade(obj.gk?keeperColor:homeColor,-45)}" stroke-width="1.4"/></svg><span style="position:relative;z-index:1;color:#fff;font-size:10px;font-weight:900;text-shadow:0 1px 2px #0008">${E(obj.number||"")}</span></div><div class="s265name">${E(displayFirstName(obj.name))}</div>`;
        if(kind==="opp")el.innerHTML=`<div class="s265opp"><svg class="s265shirtshape" viewBox="0 0 40 48" aria-hidden="true"><path d="M12 3 17 1h6l5 2 9 7-5 9-5-3v30H13V16l-5 3-5-9z" fill="${awayColor}" stroke="${shade(awayColor,-25)}" stroke-width="1.2" stroke-linejoin="round"/><path d="M15 2q5 6 10 0" fill="none" stroke="${shade(awayColor,-45)}" stroke-width="1.4"/></svg><span style="position:relative;z-index:1;color:#fff;font-size:10px;font-weight:900;text-shadow:0 1px 2px #0008">${E(obj.number||"")}</span></div><div class="s265name">${E(displayFirstName(obj.name||"Modstander"))}</div>`;
        if(kind==="ball")el.innerHTML=`<div class="s265ball"></div>`;
        if(kind==="cone")el.innerHTML=`<div class="s265cone">▲</div>`;
        if(kind==="text")el.innerHTML=`<div class="s265text">${E(obj.text||"TEKST")}</div>`;
        el.addEventListener("click",e=>{e.stopPropagation();select(obj)});
        bindMove(el,obj,board,render);
        if(selected===obj){
            const h=document.createElement("i");h.className="s265handle br";el.appendChild(h);bindResize(h,obj,board,render,false);
        }
        board.appendChild(el);
    }

    function render(){
        board.querySelectorAll(".s265item,.s265zone").forEach(x=>x.remove());
        svg.innerHTML=`<defs><marker id="s265ah" markerWidth="3.2" markerHeight="3.2" refX="2.8" refY="1.6" orient="auto"><path d="M0 0 L3.2 1.6 L0 3.2z" fill="#fff"/></marker></defs>`+
          s.arrows.map(a=>a.kind==="freehand"?`<g data-arrow="${E(a.id)}"><polyline class="s265arrowhit" points="${(a.points||[]).map(p=>`${p.x},${p.y}`).join(" ")}" fill="none" stroke="transparent" stroke-width="8"/><polyline class="s265arrow-visible" points="${(a.points||[]).map(p=>`${p.x},${p.y}`).join(" ")}" fill="none" stroke="${selected===a?"#82ff54":"#fff"}" stroke-width="${a.stroke||0.48}" stroke-linecap="round" stroke-linejoin="round"/></g>`:a.kind==="curve"?`<g data-arrow="${E(a.id)}"><path class="s265arrowhit" d="M ${a.x1} ${a.y1} Q ${a.cx} ${a.cy} ${a.x2} ${a.y2}" fill="none" stroke="transparent" stroke-width="3"/><path class="s265arrow-visible" d="M ${a.x1} ${a.y1} Q ${a.cx} ${a.cy} ${a.x2} ${a.y2}" fill="none" stroke="${selected===a?"#82ff54":"#fff"}" stroke-width="${a.stroke||0.6}" stroke-linecap="round" marker-end="url(#s265ah)"/></g>`:`<g data-arrow="${E(a.id)}"><line class="s265arrowhit" x1="${a.x1}" y1="${a.y1}" x2="${a.x2}" y2="${a.y2}" stroke="transparent" stroke-width="3"/><line class="s265arrow-visible" x1="${a.x1}" y1="${a.y1}" x2="${a.x2}" y2="${a.y2}" stroke="${selected===a?"#82ff54":"#fff"}" stroke-width="${a.stroke||0.48}" stroke-dasharray="${["run","dribble","defense"].includes(a.kind)?"2 1":a.kind==="pass"?"1 1":"none"}" marker-end="${a.kind==="line"?"none":"url(#s265ah)"}"/></g>`).join("");

        s.players.forEach(x=>item(x,"player"));
        s.opponents.forEach(x=>item(x,"opp"));
        s.balls.forEach(x=>item(x,"ball"));
        s.cones.forEach(x=>item(x,"cone"));
        s.texts.forEach(x=>item(x,"text"));
        s.zones.forEach(z=>{
            const el=document.createElement("div");el.className="s265zone"+(selected===z?" selected":"");
            el.style.left=z.x+"%";el.style.top=z.y+"%";el.style.width=z.w+"%";el.style.height=z.h+"%";
            el.addEventListener("click",e=>{e.stopPropagation();select(z)});
            bindMove(el,z,board,render);
            if(selected===z){const h=document.createElement("i");h.className="s265handle br";el.appendChild(h);bindResize(h,z,board,render,true)}
            board.appendChild(el);
        });

        // Arrow endpoint handles when selected.
        if(selected && s.arrows.includes(selected) && selected.kind!=="freehand"){
            [["x1","y1"],["x2","y2"]].forEach(([kx,ky])=>{
                const h=document.createElement("div");h.className="s265item selected";h.style.cssText=`left:${selected[kx]}%;top:${selected[ky]}%;width:16px;height:16px;border-radius:50%;background:#82ff54;z-index:12`;
                bindMove(h,{get x(){return selected[kx]},set x(v){selected[kx]=v},get y(){return selected[ky]},set y(v){selected[ky]=v}},board,render);
                board.appendChild(h);
            });
        }
        svg.querySelectorAll("[data-arrow]").forEach(g=>{
          const obj=s.arrows.find(a=>String(a.id)===g.dataset.arrow);if(!obj)return;
          g.style.pointerEvents="stroke";
          g.addEventListener("click",e=>{e.stopPropagation();selected=obj;render()});
          g.addEventListener("pointerdown",e=>{
            if(activeTool!=="select")return;
            e.stopPropagation();selected=obj;
            const start=boardPoint(e),original=obj.kind==="freehand"?(obj.points||[]).map(p=>({x:p.x,y:p.y})): {x1:obj.x1,y1:obj.y1,x2:obj.x2,y2:obj.y2};
            try{g.setPointerCapture(e.pointerId)}catch(_){}
            const move=ev=>{const now=boardPoint(ev),dx=now.x-start.x,dy=now.y-start.y;if(obj.kind==="freehand"){obj.points=original.map(p=>({x:Math.max(0,Math.min(100,p.x+dx)),y:Math.max(0,Math.min(100,p.y+dy))}));}else{obj.x1=Math.max(0,Math.min(100,original.x1+dx));obj.y1=Math.max(0,Math.min(100,original.y1+dy));obj.x2=Math.max(0,Math.min(100,original.x2+dx));obj.y2=Math.max(0,Math.min(100,original.y2+dy));if(obj.kind==="curve"){obj.cx=Math.max(0,Math.min(100,original.cx+dx));obj.cy=Math.max(0,Math.min(100,original.cy+dy));}}drawPreviewArrowMove(obj);};
            const done=()=>{g.removeEventListener("pointermove",move);g.removeEventListener("pointerup",done);g.removeEventListener("pointercancel",done);render();};
            g.addEventListener("pointermove",move);g.addEventListener("pointerup",done);g.addEventListener("pointercancel",done);
          });
        });
        queueAutoSave();
    }

    function drawPreviewArrowMove(obj){
      const g=svg.querySelector(`[data-arrow="${CSS.escape(String(obj.id))}"]`);if(!g)return;
      if(obj.kind==="freehand"){const pl=g.querySelector("polyline.s265arrow-visible");if(pl)pl.setAttribute("points",(obj.points||[]).map(p=>`${p.x},${p.y}`).join(" "));}
      else if(obj.kind==="curve"){g.querySelectorAll("path").forEach(path=>path.setAttribute("d",`M ${obj.x1} ${obj.y1} Q ${obj.cx} ${obj.cy} ${obj.x2} ${obj.y2}`));}
      else g.querySelectorAll("line").forEach(line=>{line.setAttribute("x1",obj.x1);line.setAttribute("y1",obj.y1);line.setAttribute("x2",obj.x2);line.setAttribute("y2",obj.y2);});
    }
    function boardPoint(e){const r=board.getBoundingClientRect();return{x:Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100)),y:Math.max(0,Math.min(100,(e.clientY-r.top)/r.height*100))}}
    board.addEventListener("pointerdown",e=>{
      if(e.target.closest(".s265item,.s265zone,.s265handle"))return;
      const p=boardPoint(e);
      if(activeTool==="select"){selected=null;render();return;}
      if(["arrow","curve","pass","run","dribble","line","defense","goal","zone","freehand"].includes(activeTool)){
        pointerDraw={tool:activeTool,start:p,end:p,points:[p],pointerId:e.pointerId};
        try{board.setPointerCapture(e.pointerId)}catch(_){}
        e.preventDefault();
      }else if(activeTool==="own"){
        s.players.push({id:ID("pl"),x:p.x,y:p.y,w:3.1,h:7.5,number:String(s.players.length+1),name:"Spiller",gk:false});render();
      }else if(activeTool==="opp"){
        s.opponents.push({id:ID("opp"),x:p.x,y:p.y,w:3.1,h:7.5,number:String(s.opponents.length+1),name:"Modstander "+(s.opponents.length+1)});render();
      }else if(activeTool==="ball"){s.balls.push({id:ID("ball"),x:p.x,y:p.y,w:2.5,h:4});render();}
      else if(activeTool==="cone"){s.cones.push({id:ID("cone"),x:p.x,y:p.y,w:3.1,h:5});render();}
    });
    board.addEventListener("pointermove",e=>{if(!pointerDraw)return;pointerDraw.end=boardPoint(e);if(pointerDraw.tool==="freehand")pointerDraw.points.push(pointerDraw.end);drawPreview();});
    board.addEventListener("pointerup",e=>{
      if(!pointerDraw)return;const d=pointerDraw;pointerDraw=null;previewDraw=null;
      const dx=d.end.x-d.start.x,dy=d.end.y-d.start.y;
      if(Math.hypot(dx,dy)>1.5){
        if(d.tool==="zone")s.zones.push({id:ID("zone"),x:Math.min(d.start.x,d.end.x),y:Math.min(d.start.y,d.end.y),w:Math.max(2,Math.abs(dx)),h:Math.max(2,Math.abs(dy))});
        else if(d.tool==="freehand")s.arrows.push({id:ID("arr"),points:d.points,stroke:0.48,kind:"freehand"});
        else if(d.tool==="goal")s.zones.push({id:ID("goal"),x:Math.min(d.start.x,d.end.x),y:Math.min(d.start.y,d.end.y),w:Math.max(2,Math.abs(dx)),h:Math.max(2,Math.abs(dy)),goal:true});
        else if(d.tool==="curve"){const dx=d.end.x-d.start.x,dy=d.end.y-d.start.y;s.arrows.push({id:ID("arr"),x1:d.start.x,y1:d.start.y,x2:d.end.x,y2:d.end.y,cx:(d.start.x+d.end.x)/2-dy*.42,cy:(d.start.y+d.end.y)/2+dx*.42,stroke:0.6,kind:"curve"});}else s.arrows.push({id:ID("arr"),x1:d.start.x,y1:d.start.y,x2:d.end.x,y2:d.end.y,stroke:0.48,kind:d.tool});
      }
      render();
    });
    function drawPreview(){if(!pointerDraw)return;const d=pointerDraw;const dx=d.end.x-d.start.x,dy=d.end.y-d.start.y;const extra=d.tool==='freehand'?`<polyline points="${d.points.map(p=>`${p.x},${p.y}`).join(" ")}" fill="none" stroke="#82ff54" stroke-width="1.2" stroke-linecap="round"/>`:d.tool==='curve'?`<path d="M ${d.start.x} ${d.start.y} Q ${(d.start.x+d.end.x)/2-dy*.42} ${(d.start.y+d.end.y)/2+dx*.42} ${d.end.x} ${d.end.y}" fill="none" stroke="#82ff54" stroke-width="1.2" marker-end="url(#s265ah)"/>`:`<line x1="${d.start.x}" y1="${d.start.y}" x2="${d.end.x}" y2="${d.end.y}" stroke="#82ff54" stroke-width="1.2" stroke-dasharray="${d.tool==='run'?'2 1':d.tool==='pass'?'1 1':'none'}" marker-end="url(#s265ah)"/>`;svg.querySelector("#s265preview")?.remove();svg.insertAdjacentHTML("beforeend",`<g id="s265preview" opacity=".75">${d.tool==='zone'?`<rect x="${Math.min(d.start.x,d.end.x)}" y="${Math.min(d.start.y,d.end.y)}" width="${Math.abs(d.end.x-d.start.x)}" height="${Math.abs(d.end.y-d.start.y)}" fill="#82ff5422" stroke="#82ff54" stroke-dasharray="2 1"/>`:extra}</g>`)}
    let autoSaveTimer=null;
    function queueAutoSave(){
        clearTimeout(autoSaveTimer);
        autoSaveTimer=setTimeout(()=>{
            s.title=ov.querySelector("#s265title").value.trim()||"Situation";
            s.focus=ov.querySelector("#s265focus").value.trim();
            s.note=ov.querySelector("#s265note").value.trim();
            s.includeInPdf=ov.querySelector("#s265pdf").checked;
            // Do not call after() here: that callback restores the manager and
            // can place it over the designer while the user is still editing.
            Promise.resolve(saveSituations()).catch(err=>console.error("START11: automatisk gemning fejlede",err));
        },250);
    }
    ["#s265title","#s265focus","#s265note","#s265pdf"].forEach(sel=>ov.querySelector(sel)?.addEventListener("input",queueAutoSave));
    ov.querySelector("[data-reset]").onclick=()=>{s.players=currentLineup();render();queueAutoSave()};
    const saveAndClose=async()=>{
        // Flush pending autosave so it cannot race with the explicit GEM/LUK.
        clearTimeout(autoSaveTimer);
        s.title=ov.querySelector("#s265title").value.trim()||"Situation";
        s.focus=ov.querySelector("#s265focus").value.trim();
        s.note=ov.querySelector("#s265note").value.trim();
        s.includeInPdf=ov.querySelector("#s265pdf").checked;
        try{
            await Promise.resolve(saveSituations());
        }catch(err){
            console.error("START11: kunne ikke gemme kampsituationen",err);
            alert("START11 kunne ikke bekræfte, at situationen blev gemt. Tjek forbindelsen, og prøv igen.");
            return;
        }
        ov.remove();
        if(typeof after==="function")after();
    };
    ov.querySelector("[data-close]").onclick=(e)=>{e.preventDefault();e.stopPropagation();saveAndClose();};
    ov.querySelector("[data-save]").onclick=(e)=>{e.preventDefault();e.stopPropagation();saveAndClose();};
    const key=e=>{
        if((e.key==="Delete"||e.key==="Backspace")&&!e.target.matches("input,textarea"))removeSelected();
    };
    document.addEventListener("keydown",key);
    ov.addEventListener("remove",()=>document.removeEventListener("keydown",key));
    render();
}

/* =========================================================
   4. MANAGER – BEHOLDER KAMPSITUATION-FLOWET
========================================================= */
window.s25OpenMatchSituations=function(){
    document.getElementById("s25manager")?.remove();
    const o=document.createElement("div");o.id="s25manager";o.className="s265overlay";
    o.innerHTML=`<div class="s265manager">
      <div class="s265top"><strong>KAMPSITUATIONER</strong><span class="s265muted">Med bold, uden bold og egne scenarier</span><button class="s13btn primary" data-new>+ OPRET SITUATION</button><button class="s13btn" data-close>LUK</button></div>
      <div class="s265cards" id="s265cards"></div>
    </div>`;
    document.body.appendChild(o);
    const render=()=>{
        o.querySelector("#s265cards").innerHTML=situations().map(s=>`<article class="s265card">
          <strong>${E(s.title)}</strong><p>${E(s.focus||"Intet fokuspunkt endnu")}</p>
          <div class="s265cardfoot"><button class="s13btn" data-edit="${E(s.id)}">REDIGER TAVLE →</button><label style="font-size:6px;color:#89958c"><input type="checkbox" data-pdf="${E(s.id)}" ${s.includeInPdf!==false?"checked":""}> PDF</label></div>
        </article>`).join("");
        o.querySelectorAll("[data-edit]").forEach(b=>b.onclick=(e)=>{
            e.preventDefault();e.stopPropagation();
            // Remove the manager overlay completely while the designer is open.
            // CSS forces display:block on the manager, so display:none is unreliable.
            o.remove();
            openDesigner(b.dataset.edit,()=>{
                render();
                if(!document.getElementById("s25manager")) document.body.appendChild(o);
            });
        });
        o.querySelectorAll("[data-pdf]").forEach(c=>c.onchange=()=>{const s=situations().find(x=>String(x.id)===String(c.dataset.pdf));if(s){s.includeInPdf=c.checked;saveSituations()}});
    };
    o.querySelector("[data-close]").onclick=(e)=>{e.preventDefault();e.stopPropagation();o.remove();};
    o.querySelector("[data-new]").onclick=(e)=>{
        e.preventDefault();e.stopPropagation();
        const n=prompt("Navn på situationen:","Ny kampsituation");if(!n?.trim())return;
        const s=newSituation(n.trim());situations().push(s);saveSituations();render();
        o.remove();
        openDesigner(s.id,()=>{
            render();
            if(!document.getElementById("s25manager")) document.body.appendChild(o);
        });
    };
    render();
};

/* =========================================================
   5. PDF – DIREKTE INTEGRATION I lavPDF()
========================================================= */
function situationPdfPages(){
    const list=situations().filter(s=>s.includeInPdf!==false);
    if(!list.length)return "";

    const page=(s,index)=>{
        const objs=[];
        const add=(x,html,cls="")=>objs.push(`<div class="s265pdfobj ${cls}" style="left:${Number(x.x||0)}%;top:${Number(x.y||0)}%;width:${Number(x.w||7)}%;height:${Number(x.h||7)}%">${html}</div>`);
        (s.players||[]).forEach(x=>add(x,`<div class="s265pdfplayer ${x.gk?"gk":""}">${E(x.number||"")}</div><small>${E(x.name||"")}</small>`));
        (s.opponents||[]).forEach(x=>add(x,`<div class="s265pdfopp"></div>`));
        (s.balls||[]).forEach(x=>add(x,`<div class="s265pdfball"></div>`));
        (s.cones||[]).forEach(x=>add(x,`<div class="s265pdfcone">▲</div>`));
        (s.texts||[]).forEach(x=>add(x,`<div class="s265pdftext">${E(x.text||"")}</div>`));
        (s.zones||[]).forEach(x=>add(x,`<div class="s265pdfzone"></div>`));
        const arrows=(s.arrows||[]).map(a=>{
          // PDF/print engines can drop SVG marker-end references. Draw the arrowhead
          // as explicit SVG geometry so both the shaft and tip survive PDF export.
          const x1=Number(a.x1),y1=Number(a.y1),x2=Number(a.x2),y2=Number(a.y2);
          if(![x1,y1,x2,y2].every(Number.isFinite))return "";
          const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy)||1;
          const ux=dx/len,uy=dy/len,head=Math.max(1.8,Math.min(3.2,len*.22)),half=head*.62;
          const bx=x2-ux*head,by=y2-uy*head,px=-uy*half,py=ux*half;
          const sw=Math.max(.45,Number(a.stroke)||.48);
          return `<g stroke="#fff" fill="#fff" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><line x1="${x1}" y1="${y1}" x2="${bx}" y2="${by}"/><path d="M ${x2} ${y2} L ${bx+px} ${by+py} L ${bx-px} ${by-py} Z" stroke="none"/></g>`;
        }).join("");

        return `<section class="pdf-page v24-page s265pdfpage">
          <div class="v24-top-rule"></div>
          <div class="v24-page-head"><div><div class="v24-kicker">KAMPSITUATION</div><h1>${E(s.title)}</h1></div><div class="v24-page-no">T${index+1}</div></div>
          <div class="s265pdfgrid">
            <div class="s265pdfpitch"><div class="s265pdfhalf"></div><div class="s265pdfcircle"></div><div class="s265pdfbox a"></div><div class="s265pdfbox b"></div>
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;display:block;overflow:visible;z-index:4;pointer-events:none">${arrows}</svg>${objs.join("")}
            </div>
            <div class="s265pdfside">
              <div class="s265pdfcard"><b>FOKUSPUNKT</b><p>${E(s.focus||"—")}</p></div>
              <div class="s265pdfcard"><b>NOTE</b><p>${E(s.note||"—")}</p></div>
            </div>
          </div>
          <div class="v24-pdf-footer"><span>START11 · TAKTISK KAMPSITUATION</span><span>${E(s.title)}</span></div>
        </section>`;
    };

    return `<style>
      #pdfDocument .s265pdfgrid{display:grid;grid-template-columns:180mm 1fr;gap:8mm;padding:9mm 13mm 13mm}
      #pdfDocument .s265pdfpitch{position:relative;width:173mm;height:112mm;background:#176b37;border:1mm solid #fff;overflow:hidden}
      #pdfDocument .s265pdfhalf{position:absolute;left:0;right:0;top:50%;border-top:.6mm solid #fff}
      #pdfDocument .s265pdfcircle{position:absolute;left:50%;top:50%;width:22%;aspect-ratio:1;border:.6mm solid #fff;border-radius:50%;transform:translate(-50%,-50%)}
      #pdfDocument .s265pdfbox{position:absolute;left:25%;width:50%;height:15%;border:.6mm solid #fff}.s265pdfbox.a{top:-.6mm}.s265pdfbox.b{bottom:-.6mm}
      #pdfDocument .s265pdfpitch>svg{position:absolute;inset:0;width:100%;height:100%;z-index:3}
      #pdfDocument .s265pdfobj{position:absolute;z-index:5;transform:translate(-50%,-50%);display:grid;place-items:center}
      #pdfDocument .s265pdfplayer,#pdfDocument .s265pdfopp{width:100%;height:100%;min-width:7mm;min-height:7mm;border-radius:50%;display:grid;place-items:center;font-size:6pt;font-weight:950}
      #pdfDocument .s265pdfplayer{background:var(--v24-shirt,#c8ff00);color:var(--v24-shirt-text,#071008);border:.7mm solid #fff}.s265pdfplayer.gk{background:var(--v24-gk-shirt,#e31d1d);color:#fff}
      #pdfDocument .s265pdfopp{background:#eee;border:.7mm solid #222}.s265pdfobj small{position:absolute;top:calc(100% + 1mm);background:#061008;color:#fff;padding:.6mm 1mm;border-radius:.8mm;font-size:4pt;white-space:nowrap}
      #pdfDocument .s265pdfball{width:100%;height:100%;border-radius:50%;background:#fff;border:.7mm dotted #111}.s265pdfcone{color:#ff9d31;font-size:11pt}.s265pdfzone{width:100%;height:100%;border:.6mm dashed #ffe64d;background:#ffe64d22}.s265pdftext{background:#061008;color:#fff;padding:1mm 1.5mm;border-radius:1mm;font-size:5pt;white-space:nowrap}
      #pdfDocument .s265pdfside{display:grid;align-content:start;gap:6mm}.s265pdfcard{padding:5mm;border:1px solid var(--v24-line);border-radius:3mm;background:var(--v24-card)}.s265pdfcard b{color:var(--v24-accent);font-size:7pt;letter-spacing:1px}.s265pdfcard p{font-size:8pt;line-height:1.5;color:#fff;white-space:pre-wrap}
    </style>`+list.map(page).join("");
}

/* V73: Kampsituationer placeres nu som blokke i Kampplan Builder.
   Den gamle automatiske PDF-append er derfor slået fra. */
window.s73GetMatchSituations=function(){
    return situations().map(s=>({id:s.id,title:s.title,focus:s.focus,note:s.note}));
};
window.s73RenderSituationBlock=function(id,mode="editor"){
    const s=situations().find(x=>String(x.id)===String(id));
    if(!s)return `<div style="padding:10px;border:1px dashed #744;color:#c99">Kampsituationen findes ikke længere.</div>`;
    const objs=[];
    const add=(x,html)=>objs.push(`<div class="s73sitobj" style="left:${Number(x.x||0)}%;top:${Number(x.y||0)}%;width:${Number(x.w||7)}%;height:${Number(x.h||7)}%">${html}</div>`);
    (s.players||[]).forEach(x=>add(x,`<div class="s73sitplayer ${x.gk?"gk":""}"><svg class="s73sitshirt" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4l4-2 2 3 2-3 4 2 4 5-4 3-2-3v13H8V9l-2 3-4-3z" fill="currentColor" stroke="rgba(255,255,255,.9)" stroke-width=".65" stroke-linejoin="round"/></svg><span class="s73sitnumber">${E(x.number||"")}</span></div><small>${E(x.name||"")}</small>`));
    (s.opponents||[]).forEach(x=>add(x,`<div class="s73sitopp"><svg class="s73sitshirt" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4l4-2 2 3 2-3 4 2 4 5-4 3-2-3v13H8V9l-2 3-4-3z" fill="currentColor" stroke="rgba(255,255,255,.9)" stroke-width=".65" stroke-linejoin="round"/></svg><span class="s73sitnumber">${E(x.number||"")}</span></div>`));
    (s.balls||[]).forEach(x=>add(x,`<div class="s73sitball"></div>`));
    (s.cones||[]).forEach(x=>add(x,`<div class="s73sitcone">▲</div>`));
    (s.texts||[]).forEach(x=>add(x,`<div class="s73sittext">${E(x.text||"")}</div>`));
    (s.zones||[]).forEach(x=>add(x,`<div class="s73sitzone"></div>`));
    const marker="s73ah_"+String(s.id).replace(/[^a-z0-9_-]/gi,"");
    const arrows=(s.arrows||[]).map(a=>{const x1=Number(a.x1),y1=Number(a.y1),x2=Number(a.x2),y2=Number(a.y2);if(![x1,y1,x2,y2].every(Number.isFinite))return "";const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len,head=Math.max(1.8,Math.min(3.2,len*.22)),half=head*.62,bx=x2-ux*head,by=y2-uy*head,px=-uy*half,py=ux*half;return `<g stroke="#fff" fill="#fff" stroke-width="${Math.max(.45,Number(a.stroke)||.48)}" stroke-linecap="round" stroke-linejoin="round"><line x1="${x1}" y1="${y1}" x2="${bx}" y2="${by}"/><path d="M ${x2} ${y2} L ${bx+px} ${by+py} L ${bx-px} ${by-py} Z" stroke="none"/></g>`;}).join("");
    return `<style>
      .s73sit{display:grid;grid-template-columns:minmax(0,2.2fr) minmax(115px,.8fr);gap:14px;padding:10px;border:1px solid #31523a;border-radius:8px;background:#08120b}
      .s73sitpitch{position:relative;width:min(100%,520px);aspect-ratio:105/68;max-height:none;margin:auto;background:#176b37;border:2px solid #e8f4e9;overflow:hidden}
      .s73sitpitch:before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(0,0,0,.045) 0 8.33%,transparent 8.33% 16.66%);pointer-events:none}
      .s73sithalf{position:absolute;top:0;bottom:0;left:50%;border-left:1px solid #fff}.s73sitcircle{position:absolute;left:50%;top:50%;width:22%;aspect-ratio:1;border:1px solid #fff;border-radius:50%;transform:translate(-50%,-50%)}.s73sitbox{position:absolute;top:25%;width:15%;height:50%;border:1px solid #fff}.s73sitbox.a{left:-1px}.s73sitbox.b{right:-1px}
      .s73sitpitch>svg{position:absolute;inset:0;width:100%;height:100%;z-index:3}.s73sitobj{position:absolute;z-index:5;transform:translate(-50%,-50%);display:grid;place-items:center}.s73sitplayer,.s73sitopp{width:100%;height:100%;min-width:22px;min-height:22px;position:relative;display:grid;place-items:center;font-size:8px;font-weight:950;isolation:isolate}.s73sitplayer{background:transparent!important;color:var(--s11-shirt,var(--v24-shirt,#c8ff00));border:0}.s73sitplayer.gk{color:var(--s11-gk-shirt,var(--v24-gk-shirt,#e31d1d))}.s73sitopp{background:transparent!important;color:var(--s73-away-shirt,#2584ff);border:0}.s73sitshirt{position:absolute;inset:0;width:100%;height:100%;display:block;transform:scaleX(1.75);transform-origin:center;filter:drop-shadow(0 1px 1px #0008);z-index:-1}.s73sitnumber{position:relative;z-index:1;color:#fff;text-shadow:0 1px 2px #000,0 0 2px #000;font-size:8px;line-height:1}.s73sitopp .s73sitnumber{color:#fff}.s73sitobj small{position:absolute;top:calc(100% + 3px);background:#061008;color:#fff;padding:1px 3px;border-radius:2px;font-size:6px;white-space:nowrap}.s73sitball{width:100%;height:100%;border-radius:50%;background:#fff;border:2px dotted #111}.s73sitcone{color:#ff9d31}.s73sitzone{width:100%;height:100%;border:1px dashed #ffe64d;background:#ffe64d22}.s73sittext{background:#061008;color:#fff;padding:2px 3px;border-radius:2px;font-size:6px;white-space:nowrap}
      .s73sitside{align-self:start}.s73sitside h3{margin:0 0 7px;font-size:15px;color:var(--s11-primary,var(--v24-accent,#82ff54))}.s73sitside b{display:block;margin-top:8px;font-size:7px;color:#829087;letter-spacing:.7px}.s73sitside p{margin:3px 0 0;font-size:10px;line-height:1.5;white-space:pre-wrap}
      @media(max-width:650px){.s73sit{grid-template-columns:1fr}.s73sitpitch{max-height:300px}}
    </style><div class="s73sit" style="display:grid;grid-template-columns:minmax(0,2.2fr) minmax(115px,.8fr);gap:14px;padding:10px;border:1px solid #31523a;border-radius:8px;background:#08120b;-webkit-print-color-adjust:exact;print-color-adjust:exact"><div class="s73sitpitch" style="position:relative;width:min(100%,520px);aspect-ratio:105/68;min-height:0;max-height:none;margin:auto;background:#176b37;border:2px solid #fff;overflow:hidden;-webkit-print-color-adjust:exact;print-color-adjust:exact"><div class="s73sithalf"></div><div class="s73sitcircle"></div><div class="s73sitbox a"></div><div class="s73sitbox b"></div><svg viewBox="0 0 100 100" preserveAspectRatio="none"><defs><marker id="${marker}" markerUnits="userSpaceOnUse" markerWidth="3.8" markerHeight="3.8" refX="3.3" refY="1.9" orient="auto" overflow="visible"><path d="M0 0 L3.8 1.9 L0 3.8 Z" fill="#fff" stroke="#fff" stroke-width="0.35" stroke-linejoin="round"/></marker></defs>${arrows}</svg>${objs.join("")}</div><div class="s73sitside"><h3>${E(s.title)}</h3><b>FOKUSPUNKT</b><p>${E(s.focus||"—")}</p>${s.note?`<b>NOTE</b><p>${E(s.note)}</p>`:""}</div></div>`;
};

/* Refresh KAMPPLAN count after manager closes/opens. */
const oldOpen=window.s25OpenMatchSituations;
window.s25OpenMatchSituations=function(){
    oldOpen();
    setTimeout(()=>window.s262EnsureMatchSituationsPanel?.(),20);
};

window.START11_BUILD="V26.5-V262-BASE-NO-GROUPS-TACTICAL-DESIGNER-PDF";
console.info("START11 loaded:",window.START11_BUILD);
})();






window.START11_V73_TACTICAL_BUILD="V73.3-LARGE-INLINE-TACTICAL-BOARD";
