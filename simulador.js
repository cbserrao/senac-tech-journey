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
function person(x,z,shirt){const g=new T.Group(); g.position.set(x,.1,z); scene.add(g); const skin=0xc9956e; box(.68,.74,.44,0,1.14,0,shirt,g); box(.58,.58,.55,0,1.82,0,skin,g); box(.66,.22,.6,0,2.12,0,0x38291f,g); box(.09,.09,.04,-.14,1.85,.29,0x252525,g); box(.09,.09,.04,.14,1.85,.29,0x252525,g); const legs=[],arms=[]; for(const s of [-1,1]){ const leg=new T.Group(); leg.position.set(s*.18,.8,0); g.add(leg); box(.29,.62,.32,0,-.31,0,0x253956,leg); box(.32,.18,.46,0,-.66,.07,0x222b36,leg); legs.push(leg); const arm=new T.Group(); arm.position.set(s*.48,1.44,0); g.add(arm); box(.23,.44,.26,0,-.16,0,shirt,arm); box(.23,.24,.26,0,-.5,0,skin,arm); arms.push(arm);} return {g,legs,arms}; }
const player=person(0,31,0xf7941d), doorman=person(world.marks.doorman.x, world.marks.doorman.z, 0x0f4d92), npc=person(world.marks.deskLeft.x, world.marks.deskLeft.z, 0x0f4d92), npc2=person(world.marks.deskRight.x, world.marks.deskRight.z, 0x0f4d92);
doorman.g.rotation.y = 1.9; npc.g.rotation.y=0; npc2.g.rotation.y=0;
const state={running:false, dialog:false, greeted:false, enrolled:false, studentName:'', dragging:false, camYaw:Math.PI, camDist:8.2};
const keys=new Set(); let last=performance.now(), walk=0;
let moveJoy={x:0,y:0,active:false}, lookJoy={x:0,y:0,active:false};

const ui=document.createElement('div'); ui.style.cssText='position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(90deg,#081a32e8,#081a3255);padding:20px;text-align:center'; root.append(ui);
ui.innerHTML='<div style="color:#ffae48;font-weight:bold;letter-spacing:3px">SIMULADOR EDUCACIONAL</div><h1 style="font-size:clamp(32px,7vw,76px);margin:12px 0;text-shadow:3px 4px #10243d">SENAC<br>TECH JOURNEY</h1><p>Assistente de Suporte e Manutenção de Computadores</p><button style="background:#f7941d;color:#10243d;border:0;border-radius:8px;padding:14px 42px;font:bold 20px Arial;cursor:pointer">INICIAR JORNADA</button>';
const hud=document.createElement('div'); hud.style.cssText='position:absolute;top:12px;left:12px;right:12px;display:none;pointer-events:none'; hud.innerHTML='<div style="display:inline-block;background:#102849e8;border:2px solid #f7941d;padding:12px;border-radius:8px"><b>MISSÃO 01</b><br><span id="tj-mission">Passe pela portaria, diga bom dia ao porteiro e entre no Senac.</span></div>'; root.append(hud);
const hint=document.createElement('div'); hint.style.cssText='position:absolute;bottom:12px;left:50%;transform:translateX(-50%);background:#102849dd;padding:8px 12px;border-radius:6px;display:none;text-align:center'; hint.textContent='WASD / setas: andar · E/OK: interagir · mouse ou joystick direito: girar câmera'; root.append(hint);

// Controles touch: joystick esquerdo (movimento) + joystick direito (rotação) + botão OK
const controlsWrap=document.createElement('div'); controlsWrap.style.cssText='position:absolute;left:14px;right:14px;bottom:36px;display:none;justify-content:space-between;align-items:flex-end;z-index:6;pointer-events:none'; root.append(controlsWrap);
const leftControls=document.createElement('div'); leftControls.style.cssText='display:flex;gap:12px;align-items:flex-end;pointer-events:auto'; controlsWrap.append(leftControls);
const rightControls=document.createElement('div'); rightControls.style.cssText='display:flex;gap:12px;align-items:flex-end;pointer-events:auto'; controlsWrap.append(rightControls);
function createJoy(labelTop, labelBottom){
  const wrap=document.createElement('div');
  wrap.style.cssText='width:122px;height:122px;border-radius:50%;background:radial-gradient(circle at 50% 50%, #234f7d99 0 32%, #12355caa 33% 66%, #0d2742cc 67% 100%); border:2px solid #fff8; position:relative; touch-action:none; box-shadow: inset 0 0 0 2px #0002';
  const ring=document.createElement('div'); ring.style.cssText='position:absolute;inset:14px;border-radius:50%;border:2px dashed #ffffff55'; wrap.append(ring);
  const crossH=document.createElement('div'); crossH.style.cssText='position:absolute;left:16px;right:16px;top:50%;height:1px;background:#ffffff30'; wrap.append(crossH);
  const crossV=document.createElement('div'); crossV.style.cssText='position:absolute;top:16px;bottom:16px;left:50%;width:1px;background:#ffffff30'; wrap.append(crossV);
  const knob=document.createElement('div'); knob.style.cssText='width:46px;height:46px;border-radius:50%;background:radial-gradient(circle at 35% 35%, #ffc46a, #f7941d); border:2px solid #fff8; position:absolute;left:38px;top:38px; box-shadow:0 3px 8px #0005'; wrap.append(knob);
  const text=document.createElement('div'); text.style.cssText='position:absolute;left:0;right:0;top:-24px;text-align:center;font-weight:bold;font-size:12px;color:#fff;text-shadow:1px 1px #0007'; text.textContent=labelTop; wrap.append(text);
  const text2=document.createElement('div'); text2.style.cssText='position:absolute;left:0;right:0;bottom:-22px;text-align:center;font-size:11px;color:#d7e8f7'; text2.textContent=labelBottom; wrap.append(text2);
  return {wrap, knob};
}
const moveUI=createJoy('Mover','andar');
const lookUI=createJoy('Câmera','girar');
leftControls.append(moveUI.wrap);
rightControls.append(lookUI.wrap);
const okBtn=document.createElement('button'); okBtn.textContent='OK'; okBtn.style.cssText='pointer-events:auto;background:#f7941d;border:0;border-radius:50%;width:78px;height:78px;font-weight:bold;font-size:22px;color:#10243d;touch-action:none;box-shadow:0 4px 10px #0005'; rightControls.append(okBtn);

function resetOneJoy(obj, knob){ obj.active=false; obj.x=0; obj.y=0; knob.style.left='38px'; knob.style.top='38px'; }
function setOneJoy(obj, knob, clientX, clientY, wrap){ const r=61, kr=23, rect=wrap.getBoundingClientRect(); const cx=rect.left+r, cy=rect.top+r; let dx=clientX-cx, dy=clientY-cy; const len=Math.hypot(dx,dy); const max=36; if(len>max){ dx=dx/len*max; dy=dy/len*max; } obj.x=dx/max; obj.y=dy/max; knob.style.left=(r-kr+dx)+'px'; knob.style.top=(r-kr+dy)+'px'; }
moveUI.wrap.onpointerdown=e=>{ moveJoy.active=true; moveUI.wrap.setPointerCapture(e.pointerId); setOneJoy(moveJoy,moveUI.knob,e.clientX,e.clientY,moveUI.wrap); };
moveUI.wrap.onpointermove=e=>{ if(moveJoy.active) setOneJoy(moveJoy,moveUI.knob,e.clientX,e.clientY,moveUI.wrap); };
moveUI.wrap.onpointerup=moveUI.wrap.onpointercancel=moveUI.wrap.onlostpointercapture=()=>resetOneJoy(moveJoy,moveUI.knob);
lookUI.wrap.onpointerdown=e=>{ lookJoy.active=true; lookUI.wrap.setPointerCapture(e.pointerId); setOneJoy(lookJoy,lookUI.knob,e.clientX,e.clientY,lookUI.wrap); };
lookUI.wrap.onpointermove=e=>{ if(lookJoy.active) setOneJoy(lookJoy,lookUI.knob,e.clientX,e.clientY,lookUI.wrap); };
lookUI.wrap.onpointerup=lookUI.wrap.onpointercancel=lookUI.wrap.onlostpointercapture=()=>resetOneJoy(lookJoy,lookUI.knob);
function resetJoys(){ resetOneJoy(moveJoy,moveUI.knob); resetOneJoy(lookJoy,lookUI.knob); }

function showMission(text){ root.querySelector('#tj-mission').textContent=text; }
function createDialog(title, html){ state.dialog=true; keys.clear(); resetJoys(); const d=document.createElement('div'); d.style.cssText='position:absolute;left:10%;right:10%;bottom:8%;background:#102849;border:3px solid #f7941d;border-radius:10px;padding:20px;max-height:70%;overflow:auto;z-index:10'; d.innerHTML='<b style="color:#f7941d">'+title+'</b>'+html; root.append(d); return d; }
function closeDialog(d){ if(d&&d.remove) d.remove(); state.dialog=false; }
function near(pos,dist){ return Math.hypot(player.g.position.x-pos.x, player.g.position.z-pos.z) < dist; }
function interact(){
  if(!state.running||state.dialog) return;
  if(near(world.marks.doorman,2.2) && !state.greeted){
    const d=createDialog('PORTEIRO','<p>Bom dia! Seja bem-vindo ao Senac. Posso liberar sua entrada.</p><p><button id="gd" style="padding:12px">Bom dia!</button></p>');
    d.querySelector('#gd').onclick=()=>{ state.greeted=true; d.innerHTML='<b style="color:#f7941d">PORTEIRO</b><p>Perfeito! Entrada liberada. Siga pelo corredor até o atendimento para realizar sua matrícula.</p><p><button id="ok" style="padding:12px">Continuar</button></p>'; showMission('Entre no prédio, vá ao atendimento e realize sua matrícula.'); d.querySelector('#ok').onclick=()=>closeDialog(d); };
    return;
  }
  if(near(world.marks.deskLeft,2.9) || near(world.marks.deskRight,2.9)){
    const d=createDialog('ATENDIMENTO', '<p>Olá! Bem-vindo ao Senac. Como posso ajudar?</p><button id="mat" style="padding:12px">Quero me matricular no curso de Assistente de Suporte e Manutenção de Computadores</button>');
    if(state.enrolled){ d.querySelector('p').textContent='Sua matrícula no simulador já foi realizada. Em seguida, você poderá explorar a recepção e depois seguir para a sala de aula.'; d.querySelector('#mat').textContent='Continuar'; d.querySelector('#mat').onclick=()=>closeDialog(d); return; }
    d.querySelector('#mat').onclick=()=>{
      d.innerHTML='<b style="color:#f7941d">MATRÍCULA</b><form id="f"><p>Informe seu nome:</p><input id="name" required maxlength="60" minlength="2" style="font-size:16px;padding:10px;width:85%" placeholder="Nome do aluno"><p><button style="padding:10px">Confirmar matrícula</button></p></form>';
      const f=d.querySelector('#f'), input=d.querySelector('#name'); input.focus();
      f.onsubmit=e=>{ e.preventDefault(); const name=input.value.trim(); if(name.length<2) return; state.studentName=name; state.enrolled=true; d.innerHTML='<b style="color:#f7941d">MATRÍCULA CONCLUÍDA</b><p>Bem-vindo, '+name+'! Sua matrícula simulada foi concluída. Agora explore a recepção. Na próxima etapa, você seguirá para a sala de aula e começará a conhecer os componentes do computador.</p><p><button id="cont" style="padding:12px">Continuar</button></p>'; showMission('Matrícula concluída! Explore a recepção ampliada.'); d.querySelector('#cont').onclick=()=>closeDialog(d); };
    };
    return;
  }
}
okBtn.onclick=interact;
ui.querySelector('button').onclick=()=>{ state.running=true; ui.remove(); hud.style.display=hint.style.display='block'; if(matchMedia('(pointer:coarse)').matches){ controlsWrap.style.display='flex'; } };
window.addEventListener('keydown',e=>{ if(!state.running||state.dialog) return; const k=e.key.toLowerCase(); if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','e'].includes(k)){ e.preventDefault(); keys.add(k); if(k==='e'&&!e.repeat) interact(); }});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase())); window.addEventListener('blur',()=>{ keys.clear(); state.dragging=false; resetJoys(); });

// PC: rotação 360° da câmera por arraste de mouse/tela fora dos joysticks
let lastPointerX=0;
root.addEventListener('pointerdown',e=>{
  if(!state.running || state.dialog) return;
  const tag=(e.target && e.target.tagName||'').toLowerCase();
  if(tag==='button' || e.target===okBtn || controlsWrap.contains(e.target)) return;
  state.dragging=true; lastPointerX=e.clientX;
  try{ root.setPointerCapture(e.pointerId); }catch{}
});
root.addEventListener('pointermove',e=>{ if(!state.dragging) return; const dx=e.clientX-lastPointerX; lastPointerX=e.clientX; state.camYaw -= dx*0.012; });
function stopDrag(){ state.dragging=false; }
root.addEventListener('pointerup',stopDrag); root.addEventListener('pointercancel',stopDrag); root.addEventListener('lostpointercapture',stopDrag);

function blocked(x,z){ return Math.abs(x)>35 || z<-18 || z>34 || world.doorBlocked(x,z,{greeted:state.greeted}) || walls.some(b=>Math.abs(x-b.x)<b.w/2+.34 && Math.abs(z-b.z)<b.d/2+.34); }
function resize(){ const w=root.clientWidth,h=root.clientHeight; if(!w||!h) return; camera.aspect=w/h; camera.updateProjectionMatrix(); const rh=Math.min(h,540); renderer.setSize(Math.round(rh*w/h),rh,false); }
window.addEventListener('resize',resize); if(window.ResizeObserver)new ResizeObserver(resize).observe(root); resize();
function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min((now-last)/1000,.05); last=now;
  const p=player.g.position;
  // rotação por joystick direito
  if(state.running && !state.dialog && (Math.abs(lookJoy.x)>.05 || Math.abs(lookJoy.y)>.05)) state.camYaw -= lookJoy.x * dt * 3.1;
  world.update(p,dt,state.running,{greeted:state.greeted});
  if(state.running && !state.dialog){
    // Movimento teclado + joystick esquerdo. Joystick é relativo à câmera (estilo jogo mobile).
    let inputX=(Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'))) + moveJoy.x;
    let inputZ=(Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'))) + moveJoy.y;
    const nInput=Math.hypot(inputX,inputZ);
    if(nInput){
      inputX/=nInput; inputZ/=nInput;
      const cos=Math.cos(state.camYaw), sin=Math.sin(state.camYaw);
      // converter input da tela para mundo, alinhado à direção atual da câmera/jogador
      let worldX = inputX * cos - inputZ * sin;
      let worldZ = inputX * sin + inputZ * cos;
      const n=Math.hypot(worldX,worldZ) || 1; worldX/=n; worldZ/=n;
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
    if(!state.greeted && near(world.marks.doorman,2.3)) hint.textContent='Pressione E ou OK para falar com o porteiro';
    else if(state.greeted && !state.enrolled && (near(world.marks.deskLeft,2.9)||near(world.marks.deskRight,2.9))) hint.textContent='Pressione E ou OK para falar no atendimento';
    else hint.textContent='WASD / setas: andar · E/OK: interagir · mouse ou joystick direito: girar câmera';
  }
  const camHeight=6.3, offX=Math.sin(state.camYaw)*state.camDist, offZ=Math.cos(state.camYaw)*state.camDist;
  const target = state.running ? new T.Vector3(p.x+offX, p.y+camHeight, p.z+offZ) : new T.Vector3(17,16,38);
  camera.position.lerp(target,1-Math.exp(-dt*6));
  camera.lookAt(state.running?p.x:0, state.running?1.6:2.5, state.running?p.z:14);
  renderer.render(scene,camera);
}
camera.position.set(17,16,38); requestAnimationFrame(frame);
})();
