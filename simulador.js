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
const keys=new Set(); let last=performance.now(), walk=0; let joyX=0, joyY=0, joyActive=false;

const ui=document.createElement('div'); ui.style.cssText='position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(90deg,#081a32e8,#081a3255);padding:20px;text-align:center'; root.append(ui);
ui.innerHTML='<div style="color:#ffae48;font-weight:bold;letter-spacing:3px">SIMULADOR EDUCACIONAL</div><h1 style="font-size:clamp(32px,7vw,76px);margin:12px 0;text-shadow:3px 4px #10243d">SENAC<br>TECH JOURNEY</h1><p>Assistente de Suporte e Manutenção de Computadores</p><button style="background:#f7941d;color:#10243d;border:0;border-radius:8px;padding:14px 42px;font:bold 20px Arial;cursor:pointer">INICIAR JORNADA</button>';
const hud=document.createElement('div'); hud.style.cssText='position:absolute;top:12px;left:12px;right:12px;display:none;pointer-events:none'; hud.innerHTML='<div style="display:inline-block;background:#102849e8;border:2px solid #f7941d;padding:12px;border-radius:8px"><b>MISSÃO 01</b><br><span id="tj-mission">Passe pela portaria, diga bom dia ao porteiro e entre no Senac.</span></div>'; root.append(hud);
const hint=document.createElement('div'); hint.style.cssText='position:absolute;bottom:12px;left:50%;transform:translateX(-50%);background:#102849dd;padding:8px 12px;border-radius:6px;display:none;text-align:center'; hint.textContent='WASD / setas: andar · E/OK: interagir · arraste a tela para girar a câmera'; root.append(hint);

// Controles touch: joystick + direcionais + OK
const controlsWrap=document.createElement('div'); controlsWrap.style.cssText='position:absolute;left:14px;right:14px;bottom:42px;display:none;justify-content:space-between;align-items:flex-end;z-index:6;pointer-events:none'; root.append(controlsWrap);
const leftControls=document.createElement('div'); leftControls.style.cssText='display:flex;gap:12px;align-items:flex-end;pointer-events:auto'; controlsWrap.append(leftControls);
const joyWrap=document.createElement('div'); joyWrap.style.cssText='width:118px;height:118px;border-radius:50%;background:#12355c99;border:2px solid #fff8;position:relative;touch-action:none'; leftControls.append(joyWrap);
const joyKnob=document.createElement('div'); joyKnob.style.cssText='width:44px;height:44px;border-radius:50%;background:#f7941d;border:2px solid #fff8;position:absolute;left:37px;top:37px'; joyWrap.append(joyKnob);
const dpad=document.createElement('div'); dpad.style.cssText='display:grid;grid-template-columns:repeat(3,42px);gap:4px;pointer-events:auto'; leftControls.append(dpad);
for(const [label,key] of [['',''],['↑','w'],['',''],['←','a'],['↓','s'],['→','d']]){ const b=document.createElement('button'); b.textContent=label; b.style.cssText='height:42px;background:#12355cdd;color:white;border:2px solid #fff8;border-radius:8px;font-size:22px;touch-action:none'; if(!key)b.style.visibility='hidden'; else{ b.onpointerdown=e=>{b.setPointerCapture(e.pointerId); keys.add(key);}; b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>keys.delete(key);} dpad.append(b); }
const okBtn=document.createElement('button'); okBtn.textContent='OK'; okBtn.style.cssText='pointer-events:auto;background:#f7941d;border:0;border-radius:50%;width:78px;height:78px;font-weight:bold;font-size:22px;color:#10243d;touch-action:none'; controlsWrap.append(okBtn);

function resetJoystick(){ joyActive=false; joyX=0; joyY=0; joyKnob.style.left='37px'; joyKnob.style.top='37px'; }
function setJoy(clientX, clientY){ const r=59, kr=22, rect=joyWrap.getBoundingClientRect(); const cx=rect.left+r, cy=rect.top+r; let dx=clientX-cx, dy=clientY-cy; const len=Math.hypot(dx,dy); const max=34; if(len>max){ dx=dx/len*max; dy=dy/len*max; } joyX=dx/max; joyY=dy/max; joyKnob.style.left=(r-kr+dx)+'px'; joyKnob.style.top=(r-kr+dy)+'px'; }
joyWrap.onpointerdown=e=>{ joyActive=true; joyWrap.setPointerCapture(e.pointerId); setJoy(e.clientX,e.clientY); };
joyWrap.onpointermove=e=>{ if(joyActive) setJoy(e.clientX,e.clientY); };
joyWrap.onpointerup=joyWrap.onpointercancel=joyWrap.onlostpointercapture=()=>resetJoystick();

function showMission(text){ root.querySelector('#tj-mission').textContent=text; }
function createDialog(title, html){ state.dialog=true; keys.clear(); resetJoystick(); const d=document.createElement('div'); d.style.cssText='position:absolute;left:10%;right:10%;bottom:8%;background:#102849;border:3px solid #f7941d;border-radius:10px;padding:20px;max-height:70%;overflow:auto;z-index:10'; d.innerHTML='<b style="color:#f7941d">'+title+'</b>'+html; root.append(d); return d; }
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
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase())); window.addEventListener('blur',()=>{ keys.clear(); state.dragging=false; resetJoystick(); });

// rotação 360° da câmera por arraste
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
function frame(now){ requestAnimationFrame(frame); const dt=Math.min((now-last)/1000,.05); last=now; const p=player.g.position; world.update(p,dt,state.running,{greeted:state.greeted});
  if(state.running && !state.dialog){
    let x=(Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'))) + joyX;
    let z=(Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'))) + joyY;
    const n=Math.hypot(x,z);
    if(n){ x/=n; z/=n; const speed=4.25; const nx=p.x+x*speed*dt, nz=p.z+z*speed*dt; if(!blocked(nx,p.z)) p.x=nx; if(!blocked(p.x,nz)) p.z=nz; player.g.rotation.y=Math.atan2(x,z); walk+=dt*10; }
    player.legs.forEach((l,i)=>l.rotation.x=n?Math.sin(walk+i*Math.PI)*.55:0); player.arms.forEach((a,i)=>a.rotation.x=n?-Math.sin(walk+i*Math.PI)*.45:0);
    if(!state.greeted && near(world.marks.doorman,2.3)) hint.textContent='Pressione E ou OK para falar com o porteiro';
    else if(state.greeted && !state.enrolled && (near(world.marks.deskLeft,2.9)||near(world.marks.deskRight,2.9))) hint.textContent='Pressione E ou OK para falar no atendimento';
    else hint.textContent='WASD / setas: andar · E/OK: interagir · arraste a tela para girar a câmera';
  }
  const camHeight=6.3; const offX=Math.sin(state.camYaw)*state.camDist; const offZ=Math.cos(state.camYaw)*state.camDist;
  const target = state.running ? new T.Vector3(p.x+offX, p.y+camHeight, p.z+offZ) : new T.Vector3(17,16,38);
  camera.position.lerp(target,1-Math.exp(-dt*6));
  camera.lookAt(state.running?p.x:0, state.running?1.6:2.5, state.running?p.z:14);
  renderer.render(scene,camera);
}
camera.position.set(17,16,38); requestAnimationFrame(frame);
})();
