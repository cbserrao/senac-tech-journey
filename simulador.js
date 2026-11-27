(function(){'use strict';
if (!window.THREE) { document.body.textContent='Não foi possível carregar Three.js.'; return; }
const T=window.THREE, root=document.createElement('div');
root.id='tech-journey'; root.style.cssText='position:fixed;inset:0;overflow:hidden;background:#122943;color:white;font:16px Arial,sans-serif;touch-action:none';
document.body.append(root);
const scene=new T.Scene(); scene.background=new T.Color(0x9ec9ed); scene.fog=new T.Fog(0x9ec9ed,45,95);
const camera=new T.PerspectiveCamera(48,1,.1,140), renderer=new T.WebGLRenderer({antialias:false});
renderer.domElement.style.cssText='width:100%;height:100%;image-rendering:pixelated;display:block'; root.append(renderer.domElement);
// Sombras e reflexos: mapa de sombra localizado e ambiente refletido procedural.
const compactGraphics=/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)|| (navigator.maxTouchPoints>1 && innerWidth<1100);
renderer.shadowMap.enabled=true; renderer.shadowMap.type=T.PCFSoftShadowMap;
renderer.outputColorSpace=T.SRGBColorSpace;
const ambient=new T.HemisphereLight(0xffffff,0x778599,1.4); scene.add(ambient);
const sun=new T.DirectionalLight(0xffefd2,2.15); scene.add(sun,sun.target);
sun.castShadow=true; sun.shadow.mapSize.set(compactGraphics?512:1024,compactGraphics?512:1024);
Object.assign(sun.shadow.camera,{left:-17,right:17,top:17,bottom:-17,near:.5,far:65});
sun.shadow.camera.updateProjectionMatrix(); sun.shadow.bias=-.00035; sun.shadow.normalBias=.035;
// Cubemap sintético: painéis claros, céu e chão. Não exige imagens externas.
function reflectionMap(){const faces=Array.from({length:6},(_,i)=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const grad=g.createLinearGradient(0,0,0,128);grad.addColorStop(0,i===2?'#eef6ff':'#91abc1');grad.addColorStop(.55,'#64788a');grad.addColorStop(1,'#303943');g.fillStyle=grad;g.fillRect(0,0,128,128);if(i!==3){g.fillStyle='#e9f3ff';g.fillRect(12,14,30,67);g.fillStyle='#b9d3e5';g.fillRect(75,10,35,46);}return c;});const tex=new T.CubeTexture(faces);tex.colorSpace=T.SRGBColorSpace;tex.needsUpdate=true;return tex;}
const reflectedEnvironment=reflectionMap();
const metallicColors=new Set([0x9ea5ab,0x9aa5ab,0xaeb9c3,0xc1ccd3,0xaab7c0,0x93a8b3,0xcfd7dc,0x748592,0x687782,0xc0c9d0]);
const woodColors=new Set([0xc1a77d,0xc5a67d,0xb67d48,0xa77d56]);
function surfaceMaterial(c,w,h,d){const floor=h<=.08&&w>.5&&d>.5;const metal=metallicColors.has(c);const wood=woodColors.has(c);return new T.MeshPhongMaterial({color:c,shininess:metal?85:floor?45:wood?25:18,specular:metal?0xaaaaaa:floor?0x393939:0x252525,envMap:metal||floor?reflectedEnvironment:null,reflectivity:metal?.28:floor?.075:0});}
function box(w,h,d,x,y,z,c,parent=scene){const m=new T.Mesh(new T.BoxGeometry(w,h,d),surfaceMaterial(c,w,h,d));m.position.set(x,y,z);m.castShadow=h>.12&&!(h<.25&&w>4&&d>4);m.receiveShadow=true;parent.add(m);return m;}
function configureSurfaces(root){root.traverse(m=>{if(!m.isMesh)return;const mat=m.material;if(mat.isMeshBasicMaterial){m.castShadow=false;m.receiveShadow=false;return;}m.receiveShadow=true;if(mat.transparent){m.castShadow=false;mat.envMap=reflectedEnvironment;mat.reflectivity=.24;mat.shininess=110;mat.specular=new T.Color(0xc5e4ff);mat.needsUpdate=true;}else if(!m.geometry.parameters||!('width' in m.geometry.parameters)){m.castShadow=true;}});}

const walls=[];
function sign(txt,x,y,z,w,h){const c=document.createElement('canvas'); c.width=512; c.height=128; const ctx=c.getContext('2d'); ctx.fillStyle='#07529b'; ctx.fillRect(0,0,512,128); ctx.fillStyle='#fff'; ctx.font='bold 70px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(txt,256,64); const tex=new T.CanvasTexture(c); tex.magFilter=T.NearestFilter; const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex,transparent:true})); m.position.set(x,y,z); scene.add(m); return m; }
const world=window.criarCenarioTech(T,scene,box,walls,sign);
configureSurfaces(scene);

function detailedPerson(x,z,style){
  const g=new T.Group(); g.position.set(x,.1,z); scene.add(g);
  const skin=style.skin || 0xc9956e, shirt=style.shirt || 0xf7941d, pants=style.pants || 0x253956, shoes=style.shoes || 0x222b36, hair=style.hair || 0x38291f;
  const accent = style.accent || 0xffffff, badge = style.badge || false, tie = style.tie || false, cap = style.cap || false;

  // torso + camisa detalhada
  box(.72,.76,.46,0,1.15,0,shirt,g);
  box(.74,.08,.48,0,1.48,0,accent,g); // faixa/peito
  box(.18,.12,.12,0,1.5,.24,accent,g); // gola central
  box(.12,.07,.05,-.09,1.42,.25,0xffffff,g); box(.12,.07,.05,.09,1.42,.25,0xffffff,g); // colarinho
  if(badge) box(.12,.14,.05,.2,1.34,.25,0xeff5ff,g);
  if(tie){ box(.07,.18,.03,0,1.25,.25,0x0c3258,g); box(.12,.12,.03,0,1.1,.25,0x0c3258,g); }

  // pescoço e cabeça
  box(.16,.12,.16,0,1.55,0,skin,g);
  box(.6,.58,.58,0,1.9,0,skin,g);
  box(.1,.1,.04,-.14,1.92,.29,0x252525,g); box(.1,.1,.04,.14,1.92,.29,0x252525,g);
  box(.18,.05,.04,0,1.75,.29,0xa35f50,g);
  // cabelo
  box(.68,.16,.64,0,2.2,0,hair,g); box(.08,.24,.56,-.3,2.02,0,hair,g); box(.08,.24,.56,.3,2.02,0,hair,g);
  if(cap){ box(.72,.12,.68,0,2.24,0,accent,g); box(.45,.05,.22,0,2.16,.33,accent,g); }

  const legs=[],arms=[];
  for(const s of [-1,1]){
    const leg=new T.Group(); leg.position.set(s*.19,.78,0); g.add(leg);
    box(.3,.64,.34,0,-.3,0,pants,leg); box(.32,.08,.36,0,-.62,0,0x1f2c3d,leg); box(.34,.18,.48,0,-.72,.08,shoes,leg); legs.push(leg);
    const arm=new T.Group(); arm.position.set(s*.5,1.44,0); g.add(arm);
    box(.24,.22,.28,0,.02,0,shirt,arm); box(.22,.26,.26,0,-.22,0,accent,arm); box(.22,.24,.26,0,-.5,0,skin,arm); arms.push(arm);
  }
  return {g,legs,arms};
}

function sodaCan(x,y,z,parent=scene){ box(.16,.28,.16,x,y,z,0xdce4ea,parent); box(.18,.02,.18,x,y+.15,z,0xc53f3b,parent); }
function burger(x,y,z,parent=scene){ box(.32,.08,.28,x,y,z,0xe8bb73,parent); box(.24,.11,.2,x,y+.08,z,0x7c4a27,parent); box(.32,.04,.28,x,y+.15,z,0xe8bb73,parent); }
function floatingArrow(){ const g=new T.Group(); scene.add(g); const shaft=box(.12,.75,.12,0,.42,0,0xffd34a,g); const head=new T.Mesh(new T.ConeGeometry(.34,.52,4),new T.MeshLambertMaterial({color:0xffd34a})); head.position.y=1.0; head.rotation.y=Math.PI/4; g.add(head); const ring=new T.Mesh(new T.TorusGeometry(.3,.05,6,12),new T.MeshLambertMaterial({color:0xfff0a5})); ring.rotation.x=Math.PI/2; ring.position.y=.05; g.add(ring); g.visible=false; return g; }

const player=detailedPerson(0,31,{shirt:0xf7941d,pants:0x274564,shoes:0x1d232d,hair:0x3b2a1e,accent:0x102849,badge:true});
const doorman=detailedPerson(world.marks.doorman.x, world.marks.doorman.z,{shirt:0x164d7d,pants:0x23364d,shoes:0x18202a,hair:0x222015,accent:0xf7d25c,badge:true,cap:true});
const npc=detailedPerson(world.marks.deskLeft.x, world.marks.deskLeft.z,{shirt:0x0f4d92,pants:0x24374f,shoes:0x1d232d,hair:0x31241b,accent:0xffffff,badge:true,tie:true});
const npc2=detailedPerson(world.marks.deskRight.x, world.marks.deskRight.z,{shirt:0x0f4d92,pants:0x24374f,shoes:0x1d232d,hair:0x4a2f22,accent:0xffffff,badge:true,tie:true});
doorman.g.rotation.y = 1.9; npc.g.rotation.y=0; npc2.g.rotation.y=0;

const canteenNpc1=detailedPerson(-26.6,-.8,{shirt:0xffffff,pants:0x263a52,shoes:0x1d232d,hair:0x302015,accent:0xf7941d,badge:true,cap:true});
const canteenNpc2=detailedPerson(-26.2,1.2,{shirt:0xffffff,pants:0x263a52,shoes:0x1d232d,hair:0x4a2f22,accent:0xf7941d,badge:true});
const tableNpc1=detailedPerson(-31.2,-4.7,{shirt:0x4d89c7,pants:0x2c3c51,shoes:0x212832,hair:0x38291f,accent:0xffffff});
const tableNpc2=detailedPerson(-31.2,4.9,{shirt:0x7b4aa8,pants:0x2c3c51,shoes:0x212832,hair:0x2e241c,accent:0xffffff});
canteenNpc1.g.rotation.y=-Math.PI/2; canteenNpc2.g.rotation.y=-Math.PI/2; tableNpc1.g.rotation.y=1.2; tableNpc2.g.rotation.y=1.2;
sodaCan(-30.18,1.22,-4.9); burger(-30.55,1.13,-4.66); sodaCan(-30.18,1.22,4.7); burger(-30.55,1.13,4.96);
const guideArrow=floatingArrow();guideArrow.traverse(m=>{if(m.isMesh){m.castShadow=false;m.receiveShadow=false;}});
const receptionNpcs=[npc,npc2], patioNpcs=[canteenNpc1,canteenNpc2,tableNpc1,tableNpc2], outsideNpcs=[doorman];


const professor=detailedPerson(-22.5,20.8,{shirt:0x174e80,accent:0xf7941d,badge:true,hair:0x352820}); professor.g.rotation.y=Math.PI;
const state={running:false, dialog:false, greeted:false, enrolled:false, arrivedTI:false, satTI:false, lessonDone:false, assemblyDone:false, studentName:'', camDist:8.2};
const keys=new Set(); let last=performance.now(), walk=0;
let moveJoy={x:0,y:0,active:false};
const mobile = navigator.userAgentData?.mobile === true || /Android|iPhone|iPad|iPod|Windows Phone|Mobile/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const ui=document.createElement('div'); ui.style.cssText='position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(90deg,#081a32e8,#081a3255);padding:20px;text-align:center'; root.append(ui);
ui.innerHTML='<div style="color:#ffae48;font-weight:bold;letter-spacing:3px">SIMULADOR EDUCACIONAL</div><h1 style="font-size:clamp(32px,7vw,76px);margin:12px 0;text-shadow:3px 4px #10243d">SENAC<br>TECH JOURNEY</h1><p>Assistente de Suporte e Manutenção de Computadores</p><button style="background:#f7941d;color:#10243d;border:0;border-radius:8px;padding:14px 42px;font:bold 20px Arial;cursor:pointer">INICIAR JORNADA</button>';
const hud=document.createElement('div'); hud.style.cssText='position:absolute;top:12px;left:12px;right:12px;display:none;pointer-events:none'; hud.innerHTML='<div style="display:inline-block;background:#102849e8;border:2px solid #f7941d;padding:12px;border-radius:8px"><b>MISSÃO 01</b><br><span id="tj-mission">Passe pela portaria, diga bom dia ao porteiro e entre no Senac.</span></div>'; root.append(hud);
const hint=document.createElement('div'); hint.style.cssText='position:absolute;bottom:12px;left:50%;transform:translateX(-50%);background:#102849dd;padding:8px 12px;border-radius:6px;display:none;text-align:center'; hint.textContent=(mobile?'Joystick: andar · OK: interagir':'WASD / setas: andar · E: interagir'); root.append(hint);

const controlsWrap=document.createElement('div'); controlsWrap.style.cssText='position:absolute;left:14px;right:14px;bottom:36px;display:none;justify-content:space-between;align-items:flex-end;z-index:6;pointer-events:none'; root.append(controlsWrap);
const leftControls=document.createElement('div'); leftControls.style.cssText='display:flex;gap:12px;align-items:flex-end;pointer-events:auto'; controlsWrap.append(leftControls);
const rightControls=document.createElement('div'); rightControls.style.cssText='display:flex;gap:12px;align-items:flex-end;pointer-events:auto'; controlsWrap.append(rightControls);
function createJoy(labelTop, labelBottom){
  const wrap=document.createElement('div'); wrap.style.cssText='width:122px;height:122px;border-radius:50%;background:radial-gradient(circle at 50% 50%, #234f7d99 0 32%, #12355caa 33% 66%, #0d2742cc 67% 100%); border:2px solid #fff8; position:relative; touch-action:none; box-shadow: inset 0 0 0 2px #0002';
  const ring=document.createElement('div'); ring.style.cssText='position:absolute;inset:14px;border-radius:50%;border:2px dashed #ffffff55'; wrap.append(ring);
  const crossH=document.createElement('div'); crossH.style.cssText='position:absolute;left:16px;right:16px;top:50%;height:1px;background:#ffffff30'; wrap.append(crossH);
  const crossV=document.createElement('div'); crossV.style.cssText='position:absolute;top:16px;bottom:16px;left:50%;width:1px;background:#ffffff30'; wrap.append(crossV);
  const knob=document.createElement('div'); knob.style.cssText='width:46px;height:46px;border-radius:50%;background:radial-gradient(circle at 35% 35%, #ffc46a, #f7941d); border:2px solid #fff8; position:absolute;left:38px;top:38px; box-shadow:0 3px 8px #0005'; wrap.append(knob);
  const text=document.createElement('div'); text.style.cssText='position:absolute;left:0;right:0;top:-24px;text-align:center;font-weight:bold;font-size:12px;color:#fff;text-shadow:1px 1px #0007'; text.textContent=labelTop; wrap.append(text);
  const text2=document.createElement('div'); text2.style.cssText='position:absolute;left:0;right:0;bottom:-22px;text-align:center;font-size:11px;color:#d7e8f7'; text2.textContent=labelBottom; wrap.append(text2);
  return {wrap, knob};
}
const moveUI=createJoy('Mover','andar'); leftControls.append(moveUI.wrap);
const okBtn=document.createElement('button'); okBtn.textContent='OK'; okBtn.style.cssText='pointer-events:auto;background:#f7941d;border:0;border-radius:50%;width:78px;height:78px;font-weight:bold;font-size:22px;color:#10243d;touch-action:none;box-shadow:0 4px 10px #0005'; rightControls.append(okBtn);
function resetOneJoy(obj, knob){ obj.active=false; obj.x=0; obj.y=0; knob.style.left='38px'; knob.style.top='38px'; }
function setOneJoy(obj, knob, clientX, clientY, wrap){ const r=61, kr=23, rect=wrap.getBoundingClientRect(); const cx=rect.left+r, cy=rect.top+r; let dx=clientX-cx, dy=clientY-cy; const len=Math.hypot(dx,dy); const max=36; if(len>max){ dx=dx/len*max; dy=dy/len*max; } obj.x=dx/max; obj.y=dy/max; knob.style.left=(r-kr+dx)+'px'; knob.style.top=(r-kr+dy)+'px'; }
moveUI.wrap.onpointerdown=e=>{ moveJoy.active=true; moveUI.wrap.setPointerCapture(e.pointerId); setOneJoy(moveJoy,moveUI.knob,e.clientX,e.clientY,moveUI.wrap); };
moveUI.wrap.onpointermove=e=>{ if(moveJoy.active) setOneJoy(moveJoy,moveUI.knob,e.clientX,e.clientY,moveUI.wrap); };
moveUI.wrap.onpointerup=moveUI.wrap.onpointercancel=moveUI.wrap.onlostpointercapture=()=>resetOneJoy(moveJoy,moveUI.knob);
function resetJoys(){ resetOneJoy(moveJoy,moveUI.knob); }

function showMission(text){ root.querySelector('#tj-mission').textContent=text; }
function createDialog(title, html){ state.dialog=true; keys.clear(); resetJoys(); const d=document.createElement('div'); d.style.cssText='position:absolute;left:10%;right:10%;bottom:8%;background:#102849;border:3px solid #f7941d;border-radius:10px;padding:20px;max-height:70%;overflow:auto;z-index:10'; d.innerHTML='<b style="color:#f7941d">'+title+'</b>'+html; root.append(d); return d; }
function closeDialog(d){ if(d&&d.remove) d.remove(); state.dialog=false; }
function near(pos,dist){ return Math.hypot(player.g.position.x-pos.x, player.g.position.z-pos.z) < dist; }

const components=[
 ['Placa-mãe','Conecta os componentes e permite a comunicação entre eles.','Qual peça interliga os componentes?',['Fonte','Placa-mãe','SSD'],1],
 ['Processador (CPU)','Executa instruções e realiza operações de processamento.','Qual peça executa as instruções?',['CPU','Gabinete','Cooler'],0],
 ['Memória RAM','Armazena temporariamente os dados em uso; perde o conteúdo ao desligar.','Qual memória é volátil?',['SSD','HD','RAM'],2],
 ['SSD','Armazena arquivos e programas de forma permanente, usando memória flash.','Qual peça armazena arquivos mesmo sem energia?',['SSD','RAM','Cooler'],0],
 ['Fonte de alimentação','Converte a energia elétrica e fornece as tensões necessárias aos componentes.','Qual peça alimenta os componentes?',['CPU','Fonte','Monitor'],1],
 ['Cooler','Ajuda a dissipar o calor do processador.','Qual peça ajuda a resfriar a CPU?',['RAM','SSD','Cooler'],2],
 ['Gabinete','Abriga e protege os componentes, permitindo ventilação e organização.','Onde os componentes são instalados?',['Gabinete','Teclado','Monitor'],0]
];
let lessonIndex=0;
function componentArt(i){
 const R=(x,y,w,h,c,stroke='none')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" stroke="${stroke}"/>`;
 const C=(x,y,r,c,stroke='none')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${stroke}"/>`;
 const P=(d,c,stroke='none')=>`<path d="${d}" fill="${c}" stroke="${stroke}"/>`;
 const repeat=(n,f)=>Array.from({length:n},(_,k)=>f(k)).join('');
 const text=(x,y,t,size=7,c='#dce4ea')=>`<text x="${x}" y="${y}" font-family="monospace" font-size="${size}" fill="${c}">${t}</text>`;
 const screw=(x,y)=>C(x,y,3,'#b5bdc2','#464e56')+P(`M${x-2} ${y}h4M${x} ${y-2}v4`,'none','#59636a');
 const fan=(x,y,r)=>C(x,y,r,'#141c24','#64717a')+repeat(7,k=>`<g transform="translate(${x} ${y}) rotate(${k*360/7})">${P(`M0 0 Q${-r*.55} ${-r*.2} ${-r*.35} ${-r*.83} L${r*.08} ${-r*.91} Q${r*.47} ${-r*.42} 0 0`,'#697781','#39454f')}</g>`)+C(x,y,r*.23,'#a4afb5','#38444d');
 const board=R(65,14,190,151,'#214b43','#75968a')+repeat(14,k=>P(`M${72+k*5} 20v${18+k*3}h${22+k*2}v${20+k}`,'none','#497b65'))+repeat(8,k=>P(`M75 ${105+k*5}h${100+k*4}v-20`,'none','#578875'))+R(101,37,68,60,'#bbc3c7','#53636d')+R(108,44,54,46,'#3b4248')+repeat(8,k=>repeat(7,j=>R(111+k*6,47+j*6,3,3,'#bda36d')))+R(99,36,4,62,'#e1e6e7')+repeat(4,k=>R(185+k*10,28,6,77,k%2?'#26323b':'#9ba9b2')+R(187+k*10,34,2,65,'#c3a775'))+R(239,39,12,43,'#e4e0d5')+repeat(8,k=>R(242,42+k*4,6,2,'#4b5153'))+R(82,112,113,7,'#d9dce0')+R(82,128,68,7,'#222b32')+R(82,143,113,8,'#d9dce0')+R(205,119,31,28,'#252c35')+repeat(7,k=>R(207+k*4,121,2,24,'#73818a'))+repeat(6,k=>C(79,29+k*12,3,'#b8c3c8','#6d7b81'))+repeat(4,k=>R(65,24+k*20,14,14,'#b4bcc1','#647078'))+R(239,112,16,27,'#20282d')+repeat(3,k=>R(242,116+k*7,12,4,'#bd9b56'))+screw(72,21)+screw(248,21)+screw(72,158)+screw(248,158)+text(102,105,'CPU SOCKET',6)+text(183,115,'DDR4',6);
 const cpu=P('M105 27H221V142H105Z','#245b4e','#70a18c')+repeat(14,k=>R(110+k*7,30,3,5,'#d8b866')+R(110+k*7,134,3,5,'#d8b866'))+P('M116 37H210L215 43V125L208 132H116L112 126V43Z','url(#metal)','#7b858c')+R(122,47,82,70,'#bac4c9')+P('M122 47H204V52H127V117H122Z','#e5e9e9')+text(140,77,'PROCESSOR',8,'#46525c')+text(147,91,'64 BIT',8,'#52616a')+P('M108 130l9 0 -9 -9Z','#e3c16b');
 const ram=P('M37 63H283V112H168L165 106H157L154 112H37Z','#28614d','#82a48b')+repeat(12,k=>P(`M${43+k*19} 69v-4h10v5`,'none','#75a88a'))+repeat(8,k=>R(47+k*29,73,23,24,'#20262d','#536068')+R(50+k*29,76,17,2,'#48535b')+repeat(5,j=>R(48+k*29+j*4,70,2,3,'#a0a8a8')+R(48+k*29+j*4,97,2,3,'#a0a8a8')))+repeat(47,k=>k===23||k===24?'':R(40+k*5.1,103,3.4,9,'#d8b45b'))+R(114,79,60,13,'#e3e4df')+text(120,88,'DDR4 DIMM',7,'#303d44');
 const ssd=P('M82 35H231L248 48V137L231 150H82Z','#212b34','#677781')+R(82,35,149,103,'url(#darkmetal)','#6a7984')+R(95,47,123,75,'#b5bec4','#dfe4e6')+R(95,47,123,19,'#31556d')+text(104,61,'SOLID STATE DRIVE',8)+text(105,87,'SSD',24,'#263a49')+text(106,102,'2.5 IN  /  SATA',8,'#354754')+repeat(4,k=>screw(k%2?224:89,k<2?42:131))+R(112,138,36,8,'#161e25')+R(156,138,62,8,'#161e25')+repeat(7,k=>R(115+k*4,140,2,5,'#c4a35c'))+repeat(15,k=>R(159+k*3.7,140,2,5,'#c4a35c'));
 const psu=P('M63 45L105 19H252L260 38L218 64H63Z','url(#metal)','#72808a')+P('M218 64L260 38V122L218 149Z','#27323c','#64717a')+R(63,45,155,104,'url(#darkmetal)','#7c8991')+fan(115,97,43)+repeat(4,k=>`<circle cx="115" cy="97" r="${15+k*9}" fill="none" stroke="#a0aab0" stroke-width="1.3"/>`)+P('M72 97h86M115 54v86','none','#b4bdc3')+R(173,60,32,28,'#111920','#7f8b91')+R(178,66,22,14,'#38444b')+repeat(3,k=>R(181+k*7,69,3,8,'#b5babe'))+R(181,97,19,14,'#111920','#a4afb5')+text(178,124,'I / O',8)+repeat(5,k=>P(`M239 ${64+k*7}l15 -9v3l-15 9Z`,'#111b23'))+screw(70,52)+screw(211,142);
 const cooler=P('M97 55L210 55L236 73V139L210 154H97Z','#53616b','#8d9da7')+repeat(12,k=>R(100,71+k*6,110,2,'#b0bcc3')+P(`M210 ${71+k*6}l25 -13v2l-25 13Z`,'#a0afb8'))+R(92,17,132,117,'#303b43','#8b99a3')+fan(158,75,53)+screw(100,25)+screw(216,25)+screw(100,126)+screw(216,126)+R(123,149,70,8,'#c19154')+P('M220 112h19v27h19','none','#bd5544')+P('M222 115h14v27h22','none','#232a34')+R(257,135,10,10,'#e1ddd4');
 const caseArt=P('M97 31L132 12H238L204 31Z','#687783','#98a5ae')+P('M204 31L238 12V142L204 162Z','#1c2833','#6c7a85')+R(97,31,107,131,'#34434f','#84929a')+R(104,39,93,115,'#182632')+R(111,47,79,99,'#3e5969','#7f98a6')+R(116,52,68,89,'#263a46')+R(122,58,45,53,'#315d50')+R(129,65,23,23,'#bbc5c8')+repeat(3,k=>R(156+k*5,61,3,43,'#c3a767'))+fan(178,121,14)+R(123,117,36,8,'#a4b1bb')+R(119,132,44,6,'#121d26')+repeat(9,k=>P(`M212 ${50+k*9}l18 -10v3l-18 10Z`,'#0d1820'))+C(222,31,4,'#64d9a4')+R(107,162,18,4,'#151d24')+R(178,162,18,4,'#151d24');
 const arts=[board,cpu,ram,ssd,psu,cooler,caseArt];
 return `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-height:min(245px,32vh);display:block;image-rendering:pixelated" role="img" aria-label="${components[i][0]}"><defs><linearGradient id="metal" x2="1" y2="1"><stop stop-color="#e1e6e9"/><stop offset=".5" stop-color="#a4afb7"/><stop offset="1" stop-color="#687782"/></linearGradient><linearGradient id="darkmetal" x2="1" y2="1"><stop stop-color="#566570"/><stop offset="1" stop-color="#26343f"/></linearGradient></defs><rect x="18" y="5" width="284" height="170" rx="5" fill="#14263a" stroke="#39577a"/><ellipse cx="160" cy="166" rx="100" ry="5" fill="#0a1827" opacity=".6"/>${arts[i]}</svg>`;
}


function startAssembly(){
 if(state.assemblyDone)return;
 root.querySelector('#tj-mission').parentElement.querySelector('b').textContent='MISSÃO 03 — DIA 2';
 showMission('Monte o computador na bancada de manutenção.');
 const d=createDialog('DIA 2 — MONTAGEM DO COMPUTADOR','<p>Vamos montar um computador em uma bancada de manutenção. Trabalhe com o equipamento desligado. Clique nas peças para inspecionar e arraste cada uma até o encaixe destacado.</p><button style="padding:12px">Iniciar montagem</button>');
 d.querySelector('button').onclick=()=>openWorkbench(d);
}
function openWorkbench(d){
 disposePartViewer();
 d.style.cssText='position:absolute;inset:0;background:#142333;z-index:20;display:flex;flex-direction:column;color:white;overflow:hidden;touch-action:none';
 d.innerHTML=`<div style="padding:10px 16px;background:#102849;border-bottom:2px solid #f7941d;display:flex;justify-content:space-between;align-items:center"><b style="color:#ffb04f">DIA 2 · BANCADA DE MANUTENÇÃO</b><span id="bench-count">0/8</span></div><div id="bench-stage" style="flex:1;min-height:0;position:relative"></div><div style="padding:9px 14px;background:#102849;display:flex;flex-wrap:wrap;gap:8px;align-items:center"><span id="bench-message" style="flex:1;min-width:200px"></span><button id="bench-rotate">Girar peça</button><button id="bench-back" hidden>Voltar à bancada</button><button id="bench-power" disabled>Ligar PC</button><button id="bench-finish" disabled>Concluir</button></div>`;
 d.querySelectorAll('button').forEach(b=>b.style.cssText='padding:10px;border:0;border-radius:5px;background:#f0a13b;color:#142333;font-weight:bold;cursor:pointer');
 const host=d.querySelector('#bench-stage'), msg=d.querySelector('#bench-message'), counter=d.querySelector('#bench-count');
 const sc=new T.Scene();sc.background=new T.Color(0x253746);const cam=new T.PerspectiveCamera(43,1,.1,100);cam.position.set(0,14,7);cam.lookAt(0,0,0);
 let r;try{r=new T.WebGLRenderer({antialias:true});}catch(e){host.textContent='Não foi possível abrir a bancada 3D. Recarregue o jogo em um navegador com WebGL.';return;}r.setPixelRatio(Math.min(devicePixelRatio,1.6));r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap;host.append(r.domElement);r.domElement.style.cssText='width:100%;height:100%;display:block;touch-action:none';
 sc.add(new T.HemisphereLight(0xffffff,0x6f8395,2));const light=new T.DirectionalLight(0xfff2df,2.8);light.position.set(-4,10,5);light.castShadow=true;light.shadow.mapSize.set(1024,1024);Object.assign(light.shadow.camera,{left:-9,right:9,top:8,bottom:-8,far:30});sc.add(light);
 const B=(g,w,h,l,x,y,z,c)=>box(w,h,l,x,y,z,c,g);const world=new T.Group();sc.add(world);const bench=new T.Group();world.add(bench);
 B(bench,16,.4,9,0,-.25,0,0xa77d56);B(bench,6.6,.035,6.5,0,0,0,0x35434b);
 const frame=new T.Group();world.add(frame);const dark=0x20252c,steel=0x8e969e,pcb=0x275e45;
 B(frame,4.45,.12,5.45,0,.15,0,steel);for(const x of [-2.2,2.2])B(frame,.12,.85,5.4,x,.57,0,dark);
 B(frame,4.4,.85,.16,0,.57,2.7,dark);B(frame,4.4,.85,.12,0,.57,-2.7,steel);
 B(frame,4.15,.05,5.15,0,.62,0,0x7d848a); B(frame,4.12,.02,5.12,0,.66,0,0xbfc5ca); // bandeja interna
 // Painel frontal estilo torre tradicional: baias, USB, áudio e power.
 for(const x of [-1.3,-.35])B(frame,.85,.13,.04,x,.75,2.8,0x10151a);
 for(let i=0;i<2;i++)B(frame,.23,.12,.045,.65+i*.38,.77,2.8,steel);
 for(let i=0;i<8;i++)B(frame,.24,.035,.045,-1.65+i*.22,.39,2.8,0x0c1014);
 const led=B(frame,.22,.18,.06,1.65,.75,2.8,0x343d45);
 // traseira: slots, conectores e grelha de ventilação.
 for(let i=0;i<7;i++)B(frame,.24,.6,.04,-1.9+i*.29,.58,-2.78,0xb4b9bd);
 for(let i=0;i<6;i++)for(let j=0;j<3;j++)B(frame,.09,.09,.025,.25+i*.23,.32+j*.22,-2.78,0x242a31);
 const cyl=(g,rad,h,x,y,z,c)=>{const m=new T.Mesh(new T.CylinderGeometry(rad,rad,h,24),surfaceMaterial(c,rad*2,h,rad*2));m.position.set(x,y,z);m.castShadow=true;g.add(m);return m;};
 function fan(g,x,y,z,rad){cyl(g,rad,.09,x,y,z,dark);for(let i=0;i<7;i++){let a=i*Math.PI*2/7;const blade=B(g,rad*.24,.065,rad*.7,x+Math.sin(a)*rad*.44,y+.07,z+Math.cos(a)*rad*.44,0x8a959f);blade.rotation.y=a+.3;}cyl(g,rad*.22,.13,x,y+.08,z,steel);}
 fan(frame,1.55,.3,-1.95,.43);
 const specs=[
 ['Placa-mãe',[-5.3,.3,-1.65],[-.65,.27,-.35],[2.8,.12,3.5],'Fixe a placa-mãe nos espaçadores.'],
 ['CPU',[-5.3,.3,1.0],[-1.03,.44,-1.15],[.66,.12,.66],'Alinhe o processador com o socket.'],
 ['RAM',[-5.3,.3,2.65],[.38,.57,-.85],[.18,.45,1.55],'Encaixe a memória no slot DIMM.'],
 ['Cooler',[5.3,.3,-2.1],[-1.03,.69,-1.15],[.9,.42,.9],'Fixe o cooler sobre o processador.'],
 ['SSD',[5.3,.3,-.15],[1.45,.39,1.3],[.95,.13,1.35],'Instale o SSD na baia de armazenamento.'],
 ['Fonte',[5.3,.3,2.15],[-.95,.59,2.02],[1.7,.62,1.05],'Instale a fonte na parte inferior.'],
 ['Cabo ATX / CPU',[-5.2,.3,-3.25],[.57,.48,.15],[1.15,.18,1.0],'Conecte a alimentação ATX e CPU.'],
 ['Cabos SATA',[5.2,.3,3.65],[.92,.48,.65],[1.05,.18,1.0],'Conecte os cabos SATA de dados e energia.']];
 const parts=[],targets=[],done=new Set();let selected=null,inspecting=false,drag=null,orientation=0,powered=false,preview=null;
 function make(i){const g=new T.Group();const [w,h,l]=specs[i][3];
 if(i===0){
   B(g,w,h,l,0,0,0,pcb); // placa base
   B(g,.82,.08,.82,-.42,.11,-.88,steel); B(g,.58,.03,.58,-.42,.17,-.88,dark); // socket
   B(g,.62,.18,.48,-1.03,.12,.95,0x6f7c85); B(g,.22,.16,.44,-1.38,.12,.95,0xaeb7bd); // heatsinks
   for(let j=0;j<4;j++) B(g,.1,.14,1.62,.84+j*.18,.09,-.52,0x1e252c); // dimm slots
   for(let j=0;j<4;j++) B(g,.03,.42,.08,.79+j*.18,.09,-.52,0xc7a964); // dimm locks accent
   for(let j=0;j<3;j++) B(g,1.95,.09,.13,-.1,.09,.5+j*.42,0xd9dfe3); // pci slots
   for(let j=0;j<2;j++) B(g,.18,.07,1.2,-.72+j*.28,.12,1.45,0x20262d); // m.2 / chipset bars
   for(let j=0;j<5;j++) B(g,.23,.25,.36,-1.34,.14,-1.35+j*.48,steel); // IO stack
   for(let j=0;j<10;j++) cyl(g,.065,.18,-.92+j*.18,.13,-1.48,steel); // caps
   for(let j=0;j<10;j++) B(g,.018,.018,1.38,-1.08+j*.2,.07,.58,0x68966f); // traces
   for(let j=0;j<8;j++) B(g,.04,.08,.05,1.19,.1,-1.15+j*.3,0xd7b05c); // 24-pin area
   for(let j=0;j<6;j++) B(g,.03,.06,.05,-1.35,.1,-.2+j*.16,0xd7b05c); // rear ports color
 }
 else if(i===1){
   B(g,.7,.06,.7,0,0,0,pcb); B(g,.59,.09,.59,0,.07,0,steel); B(g,.43,.02,.43,0,.12,0,0xc9d0d4);
   for(let x=0;x<8;x++) for(let z=0;z<8;z++) B(g,.045,.02,.045,-.28+x*.08,-.04,-.28+z*.08,0xd4b15b);
   B(g,.07,.02,.07,-.28,.12,-.28,0xe4b94e); B(g,.14,.01,.5,.24,.13,-.02,0x6c7780);
 }
 else if(i===2){
   B(g,.14,.42,1.56,0,0,0,pcb); B(g,.02,.38,1.42,.06,0,-.02,0x4b5964);
   for(let j=0;j<8;j++) B(g,.038,.23,.14,.09,.04,-.65+j*.18,dark); // chips
   for(let j=0;j<24;j++) B(g,.042,.08,.038,.08,-.17,-.7+j*.06,0xd4b15b); // contatos
   for(let j=0;j<3;j++) B(g,.1,.03,.48,-.01,.12,-.35+j*.35,0x5e7484);
 }
 else if(i===3){
   B(g,.96,.2,.96,0,0,0,0xb2bcc4); B(g,.72,.16,.72,0,.08,0,0xced5d9); // top plate
   for(let j=0;j<12;j++) B(g,.045,.24,.88,-.45+j*.082,.02,0,0xb0bbc3); // fins
   for(const x of [-.36,.36]) for(const z of [-.36,.36]) B(g,.09,.18,.09,x,-.02,z,0x89949c); // screws
   fan(g,0,.22,0,.43);
 }
 else if(i===4){
   B(g,.96,.14,1.36,0,0,0,0x212930); B(g,.85,.014,1.14,0,.078,0,0xb0b8be); B(g,.92,.03,1.32,0,-.07,0,0x1a2127);
   const c=document.createElement('canvas');c.width=256;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#e7eaec';ctx.fillRect(0,0,256,128);ctx.fillStyle='#163450';ctx.fillRect(0,0,256,38);ctx.fillStyle='white';ctx.font='bold 24px Arial';ctx.fillText('SOLID STATE DRIVE',8,27);ctx.fillStyle='#243b4f';ctx.font='bold 31px Arial';ctx.fillText('SSD',12,80);ctx.font='16px Arial';ctx.fillText('2.5” SATA 6Gb/s',12,105);const tex=new T.CanvasTexture(c);const m=new T.Mesh(new T.PlaneGeometry(.84,1.12),new T.MeshBasicMaterial({map:tex}));m.rotation.x=-Math.PI/2;m.position.y=.084;g.add(m);
   for(let j=0;j<4;j++) cyl(g,.03,.04,j<2?-0.39:0.39,.01,j%2?-0.58:0.58,0xaeb7bd); // screws
   for(let j=0;j<7;j++) B(g,.024,.026,.09,-.36+j*.036,.01,.69,0xd8b55f); // power pins
   for(let j=0;j<15;j++) B(g,.021,.026,.09,-.02+j*.026,.01,.69,0xd8b55f); // sata data pins
   B(g,.18,.08,.12,-.37,.01,.58,0x171f25); B(g,.38,.08,.12,.19,.01,.58,0x171f25); // connectors housing
 }
 else if(i===5){
   B(g,w,h,l,0,0,0,0x40474d); B(g,w-.08,h-.08,l-.08,0,.02,0,0x59636b); // casing
   fan(g,0,h/2,0,.43); B(g,.52,.29,.04,-.42,0,-.53,0x13191f); // ac socket block
   B(g,.18,.2,.03,-.74,0,-.535,0x090c10); // power switch
   for(let j=0;j<3;j++) B(g,.065,.13,.025,-.54+j*.14,0,-.565,steel); // socket pins
   for(let j=0;j<14;j++) B(g,.03,.08,.03,.38+.03*(j%7),-.16+.11*Math.floor(j/7),-.57,0x11171d); // vent holes
   B(g,.46,.08,.03,.48,.18,-.57,0x11171d);
 }
 else if(i===6){
   // cabo ATX + CPU mais grosso e visível
   for(let j=0;j<10;j++) tube(g,[[-.7,.03,-.14+j*.03],[-.25,.12,.15+j*.03],[.2,.11,.12+j*.03],[.68,.03,-.05+j*.03]],0x202429,.03);
   B(g,.38,.16,.38,-.76,.03,0,0x1a2127); B(g,.26,.13,.28,.8,.03,.16,0x1a2127); B(g,.2,.11,.24,.8,.03,-.17,0x1a2127);
   for(let j=0;j<6;j++) B(g,.022,.06,.04,-.84+j*.05,.03,0,0xc4a45f); // atx pins
   for(let j=0;j<4;j++) B(g,.02,.05,.03,.73+j*.03,.03,.16,0xd6b769); // cpu pins
 }
 else if(i===7){
   // cabos sata vermelho + energia preta
   for(let j=0;j<2;j++) tube(g,[[-.62,.02,-.15+j*.3],[-.12,.1,-.08+j*.3],[.18,.08,-.06+j*.3],[.62,.02,-.14+j*.3]],0xb63b36,.032);
   for(let j=0;j<3;j++) tube(g,[[-.56,.03,-.2+j*.2],[-.05,.11,.0+j*.15],[.3,.08,.02+j*.1],[.64,.03,.12+j*.1]],0x25292e,.028);
   B(g,.28,.12,.18,-.7,.03,0,0x171d23); B(g,.22,.1,.16,.75,.03,-.14,0x171d23); B(g,.3,.1,.16,.75,.03,.18,0x171d23);
   B(g,.08,.04,.11,.86,.03,-.14,0xc7443a); B(g,.1,.04,.13,.88,.03,.18,0x0f151a);
 }
 return g;}
 function tube(g,points,c,rad=.035){const mesh=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),24,rad,8,false),surfaceMaterial(c,.1,.1,.1));g.add(mesh);return mesh;}
 specs.forEach((s,i)=>{const g=make(i);g.position.set(...s[1]);world.add(g);g.userData.index=i;parts.push(g);const t=new T.Mesh(new T.BoxGeometry(s[3][0]+.12,.045,s[3][2]+.12),new T.MeshBasicMaterial({color:0xffc14d,transparent:true,opacity:.38,depthWrite:false}));t.position.set(s[2][0],s[2][1]+.03,s[2][2]);world.add(t);targets.push(t);});
 // Braços e mãos voxel, vistos do ponto de vista do aluno.
 const arms=new T.Group();world.add(arms);for(const x of [-2.8,2.8]){const a=B(arms,.78,.55,2.05,x,.45,4.1,0xf7941d);a.rotation.y=x<0?-.28:.28;B(arms,.6,.45,.78,x*.86,.49,3.05,0xc9956e);B(arms,.22,.3,.38,x*.86+(x<0?.34:-.34),.47,2.85,0xc9956e);}
 const labels=specs.map((s,i)=>{const el=document.createElement('button');el.textContent=s[0];el.style.cssText='position:absolute;transform:translate(-50%,-50%);padding:5px 8px;background:#132c43dd;color:white;border:1px solid #7893a7;border-radius:5px;font-size:clamp(10px,1.25vw,14px);touch-action:none;cursor:pointer';host.append(el);el.onclick=()=>{if(!done.has(i))inspect(i);};return el;});
 const ray=new T.Raycaster(),pointer=new T.Vector2(),plane=new T.Plane(new T.Vector3(0,1,0),-.65),point=new T.Vector3();const cv=r.domElement;
 function setRay(e){const q=cv.getBoundingClientRect();pointer.set((e.clientX-q.left)/q.width*2-1,-(e.clientY-q.top)/q.height*2+1);ray.setFromCamera(pointer,cam);}
 function hit(e){setRay(e);const hits=ray.intersectObjects(parts.filter((_,i)=>!done.has(i)),true);if(!hits.length)return null;let o=hits[0].object;while(o.parent&&!parts.includes(o))o=o.parent;return parts.indexOf(o);}
 function text(){counter.textContent=`${done.size}/8`;const next=specs.findIndex((_,i)=>!done.has(i));msg.style.color='white';msg.textContent=next<0?'Montagem completa. Pressione Ligar PC.':`Etapa ${next+1}: ${specs[next][4]} Clique para ampliar; arraste até a área amarela para encaixar.`;targets.forEach((t,i)=>t.visible=!inspecting&&i===next);d.querySelector('#bench-power').disabled=done.size!==8||powered;d.querySelector('#bench-finish').disabled=!powered;}
 function inspect(i){if(inspecting)leaveInspect();selected=i;inspecting=true;world.visible=false;preview=make(i);sc.add(preview);const sz=new T.Box3().setFromObject(preview).getSize(new T.Vector3());preview.scale.setScalar(4/Math.max(sz.x,sz.y,sz.z));preview.rotation.set(.35,.5,0);cam.position.set(0,5,7);cam.lookAt(0,0,0);d.querySelector('#bench-back').hidden=false;msg.textContent=specs[i][0]+' — arraste para rotacionar. Volte à bancada para encaixar.';}
 function leaveInspect(){if(preview){sc.remove(preview);free(preview);preview=null;}inspecting=false;world.visible=true;cam.position.set(0,14,7);cam.lookAt(0,0,0);d.querySelector('#bench-back').hidden=true;text();}
 function free(g){g.traverse(o=>{if(o.isMesh){o.geometry.dispose();if(o.material.map)o.material.map.dispose();o.material.dispose();}});}
 function place(i){const next=specs.findIndex((_,n)=>!done.has(n));const target=specs[i][2],g=parts[i];const dist=Math.hypot(g.position.x-target[0],g.position.z-target[2]);const snap=i>=6?1.7:.92;if(i!==next||dist>snap){g.position.set(...specs[i][1]);g.rotation.set(0,0,0);msg.textContent=i!==next?'Peça fora da sequência. Instale '+specs[next][0]+' primeiro.':'Encaixe incorreto. Arraste mais perto da área amarela.';msg.style.color='#ff7777';if(next>=0){targets[next].material.color.setHex(0xff5555);setTimeout(()=>{if(!done.has(next))targets[next].material.color.setHex(0xffc14d);},650);}return;}
 g.position.set(...target);g.rotation.set(0,0,0);done.add(i);if(i>=6){g.visible=false;if(i===6){tube(world,[[-.95,.76,2],[-1.55,.68,1.4],[-1.56,.56,-1.55],[-1.03,.5,-1.15]],dark,.05);tube(world,[[-.95,.69,2],[-.25,.6,1.95],[.45,.54,.95],[.55,.48,.15]],dark,.045);tube(world,[[-.95,.72,2],[-.72,.76,1.28],[-.84,.7,.24],[-.84,.54,-1.25]],0xe1c45b,.02);}else{tube(world,[[.5,.43,.65],[.9,.46,.74],[1.45,.46,1.75]],0xb93c36,.032);tube(world,[[-.95,.65,2],[-.15,.58,2.2],[.58,.54,2.02],[1.45,.46,1.75]],dark,.03);tube(world,[[1.36,.46,1.72],[1.22,.42,1.45],[1.06,.45,.98],[.92,.48,.65]],0xcd4c44,.022);}}text();msg.style.color='#89f4ad';msg.textContent='✓ '+specs[i][0]+' instalado. '+msg.textContent;}
 cv.onpointerdown=e=>{if(e.button!==0)return;cv.setPointerCapture(e.pointerId);if(inspecting){drag={i:-1,x:e.clientX,y:e.clientY,moved:false};return;}const i=hit(e);if(i!==null&&i>=0){selected=i;drag={i,x:e.clientX,y:e.clientY,moved:false};}};
 cv.onpointermove=e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(inspecting){preview.rotation.y+=dx*.012;preview.rotation.x+=dy*.012;drag.x=e.clientX;drag.y=e.clientY;return;}if(Math.hypot(dx,dy)>5)drag.moved=true;if(drag.moved){setRay(e);if(ray.ray.intersectPlane(plane,point))parts[drag.i].position.copy(point);}};
 cv.onpointerup=e=>{if(!drag)return;const a=drag;drag=null;if(inspecting)return;if(a.moved)place(a.i);else inspect(a.i);};cv.onpointercancel=()=>{if(drag&&drag.i>=0)parts[drag.i].position.set(...specs[drag.i][1]);drag=null;};
 d.querySelector('#bench-back').onclick=leaveInspect;d.querySelector('#bench-rotate').onclick=()=>{if(inspecting)preview.rotation.y+=Math.PI/2;else if(selected!==null&&!done.has(selected))parts[selected].rotation.y+=Math.PI/2;};
 d.querySelector('#bench-power').onclick=()=>{if(done.size!==8)return;powered=true;led.material.color.setHex(0x6aff98);led.material.emissive.setHex(0x37b862);led.material.emissiveIntensity=1;text();msg.textContent='✓ Teste de energia simulado: LED ligado. Montagem concluída.';};
 let raf;function draw(){const w=host.clientWidth,h=host.clientHeight;if(w&&h){if(r.domElement.width!==Math.round(w*r.getPixelRatio())||r.domElement.height!==Math.round(h*r.getPixelRatio())){r.setSize(w,h,false);cam.aspect=w/h;cam.fov=T.MathUtils.radToDeg(2*Math.atan(Math.max(Math.tan(T.MathUtils.degToRad(43/2)),8.6/(15.6*(w/h)))));cam.updateProjectionMatrix();}r.render(sc,cam);labels.forEach((el,i)=>{el.hidden=inspecting||done.has(i)||(drag&&drag.i===i);if(!el.hidden){const v=new T.Vector3(...specs[i][1]);v.z+=.7;v.project(cam);el.style.left=(v.x*.5+.5)*w+'px';el.style.top=(-v.y*.5+.5)*h+'px';}});}raf=requestAnimationFrame(draw);}text();draw();
 d.querySelector('#bench-finish').onclick=()=>{if(!powered)return;cancelAnimationFrame(raf);free(world);if(preview)free(preview);r.dispose();state.assemblyDone=true;state.satTI=false;closeDialog(d);player.g.position.set(-23.62,.1,18);player.legs.forEach(l=>l.rotation.x=0);player.arms.forEach(a=>a.rotation.x=0);showMission('Dia 2 concluído! Computador montado e testado.');};
}

let partViewer=null;
function disposePartViewer(){if(!partViewer)return;partViewer.dispose();partViewer=null;}
function mountPartViewer(host,i){
 const sc=new T.Scene();sc.background=new T.Color(0x14263a);const cam=new T.PerspectiveCamera(38,1,.1,100);cam.position.set(0,0,7);cam.lookAt(0,0,0);
 const group=new T.Group();sc.add(group);sc.add(new T.HemisphereLight(0xffffff,0x687c98,2.2));const light=new T.DirectionalLight(0xffffff,2.6);light.position.set(3,5,6);sc.add(light);
 const b=(w,h,d,x,y,z,c)=>box(w,h,d,x,y,z,c,group);
 const cyl=(r,h,x,y,z,c)=>{const m=new T.Mesh(new T.CylinderGeometry(r,r,h,16),new T.MeshLambertMaterial({color:c}));m.rotation.x=Math.PI/2;m.position.set(x,y,z);group.add(m);return m;};
 const metal=0xaeb9c3,black=0x202a33,green=0x23704e,gold=0xd9b45b;
 function fan(x,y,z,r){cyl(r,.12,x,y,z,black);for(let j=0;j<7;j++){const a=j*Math.PI*2/7;const m=b(r*.27,r*.62,.08,x+Math.sin(a)*r*.48,y+Math.cos(a)*r*.48,z+.08,0x71808b);m.rotation.z=-a+.35;}cyl(r*.25,.18,x,y,z+.1,0x394956);}
 switch(i){
 case 0:b(2.7,3.2,.09,0,0,0,green);b(.9,.95,.12,-.45,.55,.1,metal);b(.68,.7,.04,-.45,.55,.19,black);for(let j=0;j<4;j++){b(.12,1.65,.18,.45+j*.18,.65,.12,black);b(.035,1.45,.035,.45+j*.18,.65,.23,gold);}for(let j=0;j<3;j++)b(1.65,.13,.18,-.25,-.45-j*.37,.12,j===0?0xe0e4e7:black);for(let j=0;j<10;j++){cyl(.075,.13,-1.15+(j%2)*.2,.1+Math.floor(j/2)*.24,.15,metal);}for(let j=0;j<5;j++)b(.36,.24,.35,-1.18,1.26-j*.35,.2,metal);b(.24,.7,.2,1.18,-.35,.12,black);for(let j=0;j<12;j++)b(.025,.55,.012,-.95+j*.17,-1.23,.052,0x71a67b);break;
 case 1:b(2.15,2.15,.12,0,0,0,green);b(1.82,1.82,.22,0,0,.16,metal);b(1.55,1.55,.035,0,0,.29,0xcbd2d7);for(let x=0;x<14;x++)for(let y=0;y<14;y++)if(x<4||x>9||y<4||y>9)b(.085,.085,.025,-.91+x*.14,-.91+y*.14,-.07,gold);break;
 case 2:b(3.5,1.05,.1,0,0,0,green);for(let j=0;j<8;j++){b(.32,.48,.13,-1.48+j*.42,.1,.12,black);b(.32,.48,.13,-1.48+j*.42,.1,-.12,black);}for(let j=0;j<42;j++)if(j!==23&&j!==24)b(.055,.23,.025,-1.64+j*.08,-.43,.065,gold);break;
 case 3:b(2.8,1.95,.25,0,0,0,black);b(2.45,1.55,.025,0,0,.14,metal);b(1.8,.62,.03,0,.15,.16,0x536b85);b(.65,.15,.15,-.65,-.95,0,black);b(1.02,.15,.15,.5,-.95,0,black);for(let j=0;j<15;j++)b(.045,.12,.035,-.98+j*.13,-.99,.09,gold);break;
 case 4:b(2.6,2,1.65,0,0,0,0x485661);fan(0,0,.85,.78);for(let j=0;j<9;j++)b(1.5,.035,.04,0,-.72+j*.18,.99,metal);b(.6,.45,.08,-.7,.55,-.86,black);b(.27,.35,.08,.55,.55,-.86,0x151b23);for(let j=0;j<5;j++)b(1.6,.08,.02,0,-.65+j*.2,-.84,0x242e36);break;
 case 5:b(2.2,2.2,.4,0,0,-.48,metal);for(let j=0;j<14;j++)b(.065,2.1,.85,-1.02+j*.155,0,-.12,metal);b(2.15,2.15,.16,0,0,.4,black);fan(0,0,.52,.91);for(const x of [-.92,.92])for(const y of [-.92,.92])cyl(.07,.05,x,y,.53,metal);break;
 case 6:b(.12,3.3,2.1,-1,0,0,black);b(2.1,.12,2.1,0,-1.6,0,black);b(2.1,.12,2.1,0,1.6,0,black);b(2.1,3.3,.12,0,0,-1,0x394651);b(2.1,3.3,.16,0,0,1,black);fan(0,.55,1.12,.65);fan(0,-.87,1.12,.65);b(.18,.12,.08,.7,1.36,1.12,0x67db9b);b(.08,2.3,1.6,-.78,0,-.05,green);b(.16,.65,.65,-.66,.45,.1,metal);b(.25,.7,1.65,-.66,-.65,0,black);break;
 }
 const bounds=new T.Box3().setFromObject(group);const size=bounds.getSize(new T.Vector3());group.scale.setScalar(3.2/Math.max(size.x,size.y,size.z));group.rotation.set(-.28,.42,0);
 let r;try{r=new T.WebGLRenderer({antialias:true});}catch(e){host.innerHTML=componentArt(i);return;}
 const cv=r.domElement;cv.style.cssText='width:100%;height:100%;display:block;touch-action:none;cursor:grab';host.append(cv);let zoom=1,drag=null;
 const draw=()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;cam.aspect=w/h;cam.position.z=7/zoom;cam.updateProjectionMatrix();r.setSize(w,h,false);r.render(sc,cam);};
 const rotate=(x,y)=>{group.rotateOnWorldAxis(new T.Vector3(0,1,0),x);group.rotateOnWorldAxis(new T.Vector3(1,0,0),y);draw();};
 cv.onpointerdown=e=>{drag={id:e.pointerId,x:e.clientX,y:e.clientY};cv.setPointerCapture(e.pointerId);};cv.onpointermove=e=>{if(!drag||drag.id!==e.pointerId)return;rotate((e.clientX-drag.x)*.012,(e.clientY-drag.y)*.012);drag.x=e.clientX;drag.y=e.clientY;};cv.onpointerup=cv.onpointercancel=cv.onlostpointercapture=()=>{drag=null;};
 cv.onwheel=e=>{e.preventDefault();zoom=T.MathUtils.clamp(zoom-e.deltaY*.001, .7,1.65);draw();};
 const bar=host.nextElementSibling;bar.querySelectorAll('button').forEach(btn=>btn.onclick=()=>{const a=btn.dataset.view;if(a==='reset'){group.rotation.set(-.28,.42,0);zoom=1;draw();}else if(a==='plus'||a==='minus'){zoom=T.MathUtils.clamp(zoom+(a==='plus'?.15:-.15),.7,1.65);draw();}else rotate(a==='left'?-.35:a==='right'?.35:0,a==='up'?-.35:a==='down'?.35:0);});
 const ro=new ResizeObserver(draw);ro.observe(host);draw();partViewer={dispose(){ro.disconnect();group.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});r.dispose();r.forceContextLoss();}};
}

function startLesson(){
 if(state.lessonDone)return;
 root.querySelector('#tj-mission').parentElement.querySelector('b').textContent='MISSÃO 02 — DIA 1';
 showMission('Conheça os componentes do computador.');
 const d=createDialog('PROFESSOR DE TI','<p>Bem-vindo à primeira aula! Hoje vamos conhecer as peças do computador e suas funções.</p><button style="padding:12px">Começar aula</button>');
 d.querySelector('button').onclick=()=>renderComponent(d);
}
function renderComponent(d){
 disposePartViewer();
 const c=components[lessonIndex];
 d.innerHTML=`<b style="color:#f7941d">DIA 1 · COMPONENTE ${lessonIndex+1}/${components.length}</b><div class="part-view" style="height:clamp(140px,30vh,270px);width:100%"></div><div style="display:flex;gap:5px;flex-wrap:wrap;justify-content:center;margin:5px 0">${[["left","←"],["right","→"],["up","↑"],["down","↓"],["plus","+"],["minus","−"],["reset","Restaurar"]].map(([k,t])=>`<button data-view="${k}" type="button" style="padding:8px">${t}</button>`).join("")}</div><small>Arraste a peça para girar em 3D. Use + e − para aproximar.</small><h2 style="margin:6px 0">${c[0]}</h2><p>${c[1]}</p><b>${c[2]}</b><div style="display:flex;flex-wrap:wrap;gap:8px;margin:12px 0">${c[3].map((a,i)=>`<button data-answer="${i}" style="padding:10px;border-radius:6px">${a}</button>`).join('')}</div><p class="feedback" aria-live="polite"></p>`;
 mountPartViewer(d.querySelector(".part-view"),lessonIndex);
 d.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{
 const feedback=d.querySelector('.feedback');if(Number(b.dataset.answer)!==c[4]){feedback.textContent='Tente novamente. Leia a função da peça.';return;}
 d.querySelectorAll('[data-answer]').forEach(a=>a.disabled=true);feedback.textContent='Resposta correta!';const next=document.createElement('button');next.textContent=lessonIndex===components.length-1?'Concluir aula':'Próximo componente';next.style.cssText='padding:12px;background:#f7941d;border:0;border-radius:6px';d.append(next);next.onclick=()=>{lessonIndex++;if(lessonIndex<components.length){renderComponent(d);return;}disposePartViewer();state.lessonDone=true;showMission('Dia 1 concluído! Sente-se novamente na bancada para iniciar o Dia 2 — montagem do computador.');d.innerHTML='<b style="color:#f7941d">DIA 1 CONCLUÍDO</b><p>Parabéns! Você identificou os sete componentes. Agora vamos para o <b>Dia 2 — montagem do computador</b>.</p><button style="padding:12px">Ir para a prática</button>';d.querySelector('button').onclick=()=>{closeDialog(d);state.satTI=false;player.g.position.set(-23.62,.1,18);player.legs.forEach(l=>l.rotation.x=0);player.arms.forEach(a=>a.rotation.x=0);};};
 });
}

function interact(){
  if(!state.running||state.dialog) return;
  if(state.satTI){ if(!state.lessonDone) startLesson(); else if(!state.assemblyDone) startAssembly(); return; }
  if(near(world.marks.doorman,2.2) && !state.greeted){
    const d=createDialog('PORTEIRO','<p>Bom dia! Seja bem-vindo ao Senac. Posso liberar sua entrada.</p><p><button id="gd" style="padding:12px">Bom dia!</button></p>');
    d.querySelector('#gd').onclick=()=>{ state.greeted=true; d.innerHTML='<b style="color:#f7941d">PORTEIRO</b><p>Perfeito! Entrada liberada. Siga pelo corredor até o atendimento para realizar sua matrícula.</p><p><button id="ok" style="padding:12px">Continuar</button></p>'; showMission('Entre no prédio, vá ao atendimento e realize sua matrícula.'); d.querySelector('#ok').onclick=()=>closeDialog(d); };
    return;
  }
  if(state.arrivedTI && !state.satTI && near(world.marks.tiSeat,2.0) && (!state.lessonDone || !state.assemblyDone)){
    state.satTI=true; player.g.position.set(world.marks.tiSeat.x,-.25,world.marks.tiSeat.z); player.g.rotation.y=Math.PI; player.legs.forEach(l=>l.rotation.x=-Math.PI/2); player.arms.forEach(a=>a.rotation.x=-.65);
    const intro = !state.lessonDone ? 'a aula prática de componentes do computador' : 'a prática do Dia 2 — montagem do computador';
    const d=createDialog('SALA DE TI',`<p>Muito bem! Você encontrou sua bancada e sentou para iniciar ${intro}.</p><p><button id="sitok" style="padding:12px">Continuar</button></p>`);
    showMission(!state.lessonDone ? 'Perfeito! Você já está na bancada. Agora vamos iniciar a aula de componentes do computador.' : 'Perfeito! Você já está na bancada. Agora vamos iniciar a montagem do computador.');
    d.querySelector('#sitok').onclick=()=>{closeDialog(d); !state.lessonDone ? startLesson() : startAssembly();};
    return;
  }
  if(near(world.marks.deskLeft,2.9) || near(world.marks.deskRight,2.9)){
    const d=createDialog('ATENDIMENTO', '<p>Olá! Bem-vindo ao Senac. Como posso ajudar?</p><button id="mat" style="padding:12px">Quero me matricular no curso de Assistente de Suporte e Manutenção de Computadores</button>');
    if(state.enrolled){ d.querySelector('p').textContent='Sua matrícula no simulador já foi realizada. Siga à esquerda da recepção, no lado do bebedouro, passe pela cantina e siga até a sala de TI.'; d.querySelector('#mat').textContent='Continuar'; d.querySelector('#mat').onclick=()=>closeDialog(d); return; }
    d.querySelector('#mat').onclick=()=>{
      d.innerHTML='<b style="color:#f7941d">MATRÍCULA</b><form id="f"><p>Informe seu nome:</p><input id="name" required maxlength="60" minlength="2" style="font-size:16px;padding:10px;width:85%" placeholder="Nome do aluno"><p><button style="padding:10px">Confirmar matrícula</button></p></form>';
      const f=d.querySelector('#f'), input=d.querySelector('#name'); input.focus();
      f.onsubmit=e=>{ e.preventDefault(); const name=input.value.trim(); if(name.length<2) return; state.studentName=name; state.enrolled=true; d.innerHTML='<b style="color:#f7941d">MATRÍCULA CONCLUÍDA</b><p>Bem-vindo, '+name.replace(/[&<>]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[ch]))+'! Sua matrícula simulada foi concluída. Siga pelo corredor à esquerda da recepção, no lado do bebedouro. Passe pela cantina e encontre a sala de TI.</p><p><button id="cont" style="padding:12px">Continuar</button></p>'; showMission('Matrícula concluída! Siga à esquerda, no lado do bebedouro, passe pela cantina e encontre a sala de TI.'); d.querySelector('#cont').onclick=()=>closeDialog(d); };
    };
    return;
  }
}
okBtn.onclick=interact;
ui.querySelector('button').onclick=()=>{ state.running=true; ui.remove(); hud.style.display=hint.style.display='block'; if(mobile){ controlsWrap.style.display='flex'; } };
window.addEventListener('keydown',e=>{ if(!state.running||state.dialog) return; const k=e.key.toLowerCase(); if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','e'].includes(k)){ e.preventDefault(); keys.add(k); if(k==='e'&&!e.repeat) interact(); }});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase())); window.addEventListener('blur',()=>{ keys.clear(); resetJoys(); });
function blocked(x,z){ return Math.abs(x)>35 || z<-18 || z>34 || world.doorBlocked(x,z,{greeted:state.greeted}) || walls.some(b=>Math.abs(x-b.x)<b.w/2+.34 && Math.abs(z-b.z)<b.d/2+.34); }
function resize(){ const w=root.clientWidth,h=root.clientHeight; if(!w||!h) return; camera.aspect=w/h; camera.updateProjectionMatrix(); const rh=Math.min(h,540); renderer.setSize(Math.round(rh*w/h),rh,false); }
window.addEventListener('resize',resize); if(window.ResizeObserver)new ResizeObserver(resize).observe(root); resize();
function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min((now-last)/1000,.05); last=now;
  const p=player.g.position; if(state.enrolled && p.x>-35.0 && p.x<-15.0 && p.z>7.4 && p.z<22.8 && !state.arrivedTI){state.arrivedTI=true;showMission('Você chegou à sala de TI! Vá até a mesa destacada e pressione E para sentar.');} world.update(p,dt,state.running,{greeted:state.greeted});
  if(state.running && !state.dialog && !state.satTI){
    let inputX=(Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'))) + moveJoy.x;
    let inputZ=(Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'))) + moveJoy.y;
    const n=Math.hypot(inputX,inputZ);
    if(n){
      inputX/=n; inputZ/=n;
      const worldX = inputX;
      const worldZ = inputZ;
      const speed=4.25; const nx=p.x+worldX*speed*dt, nz=p.z+worldZ*speed*dt;
      if(!blocked(nx,p.z)) p.x=nx;
      if(!blocked(p.x,nz)) p.z=nz;
      player.g.rotation.y=Math.atan2(worldX,worldZ);
      walk+=dt*10;
      player.legs.forEach((l,i)=>l.rotation.x=Math.sin(walk+i*Math.PI)*.55);
      player.arms.forEach((a,i)=>a.rotation.x=-Math.sin(walk+i*Math.PI)*.45);
    } else {
      player.legs.forEach(l=>l.rotation.x=0);
      player.arms.forEach(a=>a.rotation.x=0);
    }
    if(!state.greeted && near(world.marks.doorman,2.3)) hint.textContent=(mobile?'OK: falar com o porteiro':'Pressione E para falar com o porteiro');
    else if(state.greeted && !state.enrolled && (near(world.marks.deskLeft,2.9)||near(world.marks.deskRight,2.9))) hint.textContent=(mobile?'OK: falar no atendimento':'Pressione E para falar no atendimento');
    else if(state.arrivedTI && !state.satTI && (!state.lessonDone || !state.assemblyDone) && near(world.marks.tiSeat,2.0)) hint.textContent=(mobile?(!state.lessonDone?'OK: sentar para a aula':'OK: sentar para montar'):(!state.lessonDone?'Pressione E para sentar na bancada':'Pressione E para iniciar a montagem')); 
    else hint.textContent=(mobile?'Joystick: andar · OK: interagir':'WASD / setas: andar · E: interagir');
  }
  const indoors=state.running&&((Math.abs(p.x)<=9.25&&Math.abs(p.z)<=8.25)||(p.x<=-9.25&&p.x>=-35.2&&p.z>=-7.2&&p.z<=23.3)||(p.x>=9.25&&p.x<=16.3&&p.z>=1.95&&p.z<=7.4));
  const camHeight=indoors?11.0:6.3, offX=0, offZ=indoors?10.5:state.camDist;
  const target = state.running ? new T.Vector3(p.x+offX, p.y+camHeight, p.z+offZ) : new T.Vector3(17,16,38);
  camera.position.lerp(target,1-Math.exp(-dt*6));
  camera.lookAt(state.running?p.x:0, state.running?1.6:2.5, state.running?p.z:14);
  const zone=world.applyView(p,state.running,camera);
  const inside=zone!=='outside';
  ambient.intensity=T.MathUtils.lerp(ambient.intensity,inside?.72:1.15,1-Math.exp(-dt*5));
  sun.visible=!inside; sun.target.position.set(p.x,0,p.z);sun.position.set(p.x-12,20,p.z+10);sun.target.updateMatrixWorld();
  world.updateShadowLight(p,zone,dt,compactGraphics);
  for(const n of outsideNpcs) n.g.visible = (zone==='outside');
  for(const n of receptionNpcs) n.g.visible = (zone==='reception');
  for(const n of patioNpcs) n.g.visible = (zone==='patio'); professor.g.visible=zone==='ti';
  let guideTarget=null;
  if(state.running && state.enrolled && !state.satTI && (!state.lessonDone || !state.assemblyDone)){
    if(!state.arrivedTI){
      if(p.x>-9.5) guideTarget=world.marks.corridorEntry;
      else if(p.x>-19.5) guideTarget=world.marks.patio;
      else if(p.z<4.5) guideTarget={x:-21,z:5};
      else guideTarget=world.marks.tiDoor;
    } else {
      guideTarget=world.marks.tiSeat;
    }
  }
  if(guideTarget){ guideArrow.visible=true; guideArrow.position.set(guideTarget.x, 2.55 + Math.sin(now*0.006)*0.18, guideTarget.z); } else guideArrow.visible=false;
  renderer.render(scene,camera);
}
camera.position.set(17,16,38); requestAnimationFrame(frame);
})();
