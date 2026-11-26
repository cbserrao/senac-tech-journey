(function(){'use strict';
if (!window.THREE) { document.body.textContent='Não foi possível carregar Three.js.'; return; }
const T=window.THREE, root=document.createElement('div');
root.id='tech-journey'; root.style.cssText='position:fixed;inset:0;overflow:hidden;background:#122943;color:white;font:16px Arial,sans-serif;touch-action:none';
document.body.append(root);
const scene=new T.Scene(); scene.background=new T.Color(0x9ec9ed); scene.fog=new T.Fog(0x9ec9ed,45,95);
const camera=new T.PerspectiveCamera(48,1,.1,140), renderer=new T.WebGLRenderer({antialias:false});
renderer.domElement.style.cssText='width:100%;height:100%;image-rendering:pixelated;display:block'; root.append(renderer.domElement);
scene.add(new T.HemisphereLight(0xffffff,0x778599,2)); const sun=new T.DirectionalLight(0xffefd2,2.15); sun.position.set(-10,16,12); scene.add(sun);
function box(w,h,d,x,y,z,c,parent=scene){const m=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshLambertMaterial({color:c})); m.position.set(x,y,z); parent.add(m); return m; }
const walls=[];
function sign(txt,x,y,z,w,h){const c=document.createElement('canvas'); c.width=512; c.height=128; const ctx=c.getContext('2d'); ctx.fillStyle='#07529b'; ctx.fillRect(0,0,512,128); ctx.fillStyle='#fff'; ctx.font='bold 70px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(txt,256,64); const tex=new T.CanvasTexture(c); tex.magFilter=T.NearestFilter; const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex,transparent:true})); m.position.set(x,y,z); scene.add(m); return m; }
const world=window.criarCenarioTech(T,scene,box,walls,sign);

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
const guideArrow=floatingArrow();
const receptionNpcs=[npc,npc2], patioNpcs=[canteenNpc1,canteenNpc2,tableNpc1,tableNpc2], outsideNpcs=[doorman];


const professor=detailedPerson(-22.5,20.8,{shirt:0x174e80,accent:0xf7941d,badge:true,hair:0x352820}); professor.g.rotation.y=Math.PI;
const state={running:false, dialog:false, greeted:false, enrolled:false, arrivedTI:false, satTI:false, lessonDone:false, studentName:'', camDist:8.2};
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
function startLesson(){
 if(state.lessonDone)return;
 root.querySelector('#tj-mission').previousElementSibling.textContent='MISSÃO 02 — DIA 1';
 showMission('Conheça os componentes do computador.');
 const d=createDialog('PROFESSOR DE TI','<p>Bem-vindo à primeira aula! Hoje vamos conhecer as peças do computador e suas funções.</p><button style="padding:12px">Começar aula</button>');
 d.querySelector('button').onclick=()=>renderComponent(d);
}
function renderComponent(d){
 const c=components[lessonIndex];
 d.innerHTML=`<b style="color:#f7941d">DIA 1 · COMPONENTE ${lessonIndex+1}/${components.length}</b>${componentArt(lessonIndex)}<h2 style="margin:6px 0">${c[0]}</h2><p>${c[1]}</p><b>${c[2]}</b><div style="display:flex;flex-wrap:wrap;gap:8px;margin:12px 0">${c[3].map((a,i)=>`<button data-answer="${i}" style="padding:10px;border-radius:6px">${a}</button>`).join('')}</div><p class="feedback" aria-live="polite"></p>`;
 d.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{
 const feedback=d.querySelector('.feedback');if(Number(b.dataset.answer)!==c[4]){feedback.textContent='Tente novamente. Leia a função da peça.';return;}
 d.querySelectorAll('[data-answer]').forEach(a=>a.disabled=true);feedback.textContent='Resposta correta!';const next=document.createElement('button');next.textContent=lessonIndex===components.length-1?'Concluir aula':'Próximo componente';next.style.cssText='padding:12px;background:#f7941d;border:0;border-radius:6px';d.append(next);next.onclick=()=>{lessonIndex++;if(lessonIndex<components.length){renderComponent(d);return;}state.lessonDone=true;showMission('Dia 1 concluído! Você já conhece os principais componentes.');d.innerHTML='<b style="color:#f7941d">DIA 1 CONCLUÍDO</b><p>Parabéns! Você identificou os sete componentes. Na próxima aula, vamos montar o computador.</p><button style="padding:12px">Encerrar aula</button>';d.querySelector('button').onclick=()=>{closeDialog(d);state.satTI=false;player.g.position.set(-23.62,.1,18);player.legs.forEach(l=>l.rotation.x=0);player.arms.forEach(a=>a.rotation.x=0);};};
 });
}

function interact(){
  if(!state.running||state.dialog) return;
  if(state.satTI){if(!state.lessonDone)startLesson();return;}
  if(near(world.marks.doorman,2.2) && !state.greeted){
    const d=createDialog('PORTEIRO','<p>Bom dia! Seja bem-vindo ao Senac. Posso liberar sua entrada.</p><p><button id="gd" style="padding:12px">Bom dia!</button></p>');
    d.querySelector('#gd').onclick=()=>{ state.greeted=true; d.innerHTML='<b style="color:#f7941d">PORTEIRO</b><p>Perfeito! Entrada liberada. Siga pelo corredor até o atendimento para realizar sua matrícula.</p><p><button id="ok" style="padding:12px">Continuar</button></p>'; showMission('Entre no prédio, vá ao atendimento e realize sua matrícula.'); d.querySelector('#ok').onclick=()=>closeDialog(d); };
    return;
  }
  if(state.arrivedTI && !state.satTI && !state.lessonDone && near(world.marks.tiSeat,2.0)){
    state.satTI=true; player.g.position.set(world.marks.tiSeat.x,-.25,world.marks.tiSeat.z); player.g.rotation.y=Math.PI; player.legs.forEach(l=>l.rotation.x=-Math.PI/2); player.arms.forEach(a=>a.rotation.x=-.65);
    const d=createDialog('SALA DE TI','<p>Muito bem! Você encontrou sua bancada e sentou para iniciar a aula prática.</p><p><button id="sitok" style="padding:12px">Continuar</button></p>');
    showMission('Perfeito! Você já está na bancada. Agora vamos iniciar a aula de componentes do computador.');
    d.querySelector('#sitok').onclick=()=>{closeDialog(d);startLesson();};
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
  const p=player.g.position; if(state.enrolled && p.x>-34.6 && p.x<-15.4 && p.z>8 && p.z<22.5 && !state.arrivedTI){state.arrivedTI=true;showMission('Você chegou à sala de TI! Vá até a mesa destacada e pressione E para sentar.');} world.update(p,dt,state.running,{greeted:state.greeted});
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
    else if(state.arrivedTI && !state.satTI && !state.lessonDone && near(world.marks.tiSeat,2.0)) hint.textContent=(mobile?'OK: sentar na bancada':'Pressione E para sentar na bancada');
    else hint.textContent=(mobile?'Joystick: andar · OK: interagir':'WASD / setas: andar · E: interagir');
  }
  const indoors=state.running&&((Math.abs(p.x)<=9.25&&Math.abs(p.z)<=8.25)||(p.x<=-9.25&&p.x>=-35.2&&p.z>=-7.2&&p.z<=23.3)||(p.x>=9.25&&p.x<=16.3&&p.z>=1.95&&p.z<=7.4));
  const camHeight=indoors?11.0:6.3, offX=0, offZ=indoors?10.5:state.camDist;
  const target = state.running ? new T.Vector3(p.x+offX, p.y+camHeight, p.z+offZ) : new T.Vector3(17,16,38);
  camera.position.lerp(target,1-Math.exp(-dt*6));
  camera.lookAt(state.running?p.x:0, state.running?1.6:2.5, state.running?p.z:14);
  const zone=world.applyView(p,state.running,camera);
  for(const n of outsideNpcs) n.g.visible = (zone==='outside');
  for(const n of receptionNpcs) n.g.visible = (zone==='reception');
  for(const n of patioNpcs) n.g.visible = (zone==='patio'); professor.g.visible=zone==='ti';
  let guideTarget=null;
  if(state.running && state.enrolled && !state.satTI && !state.lessonDone){
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
