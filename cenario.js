/* Cenário v0.4 inspirado no Senac RR, com guarita, portas ajustadas e colisões. */
window.criarCenarioTech = function(T, scene, box, walls, sign){
  const blue=0x07529b, orange=0xf7941d, white=0xe7e5df, gray=0x9ea5ab;
  const doorFrames=[];
  const gate={open:0, leaves:[]};

  function addCollider(x,z,w,d){ walls.push({x,z,w,d}); }
  function solid(w,h,d,x,y,z,c,parent=scene){ const m=box(w,h,d,x,y,z,c,parent); addCollider(x,z,w,d); return m; }
  function glass(w,h,d,x,y,z,parent=scene){
    const g=box(w,h,d,x,y,z,0x8ac6dc,parent);
    g.material = new T.MeshPhongMaterial({color:0xaedced, transparent:true, opacity:0.33, depthWrite:false, shininess:100});
    return g;
  }
  function tile(w,d,x,z,c=0xe4e1d8){ return box(w,.06,d,x,.03,z,c); }
  function chair(x,z){ box(.6,.1,.58,x,.52,z,blue); box(.1,.58,.58,x+.23,.81,z,blue); for(const dx of [-.19,.19]) for(const dz of [-.18,.18]) box(.05,.45,.05,x+dx,.24,z+dz,gray); addCollider(x,z,.62,.6); }
  function marbleDesk(w,h,d,x,y,z){
    const c=document.createElement('canvas'); c.width=128; c.height=128; const ctx=c.getContext('2d');
    ctx.fillStyle='#f9f7f0'; ctx.fillRect(0,0,128,128);
    for(let i=0;i<12;i++){
      ctx.strokeStyle = i%2 ? '#e5d5b9' : '#d8c6aa'; ctx.lineWidth = 1 + (i%3);
      ctx.beginPath(); ctx.moveTo(-10, i*12+5); ctx.bezierCurveTo(30, i*14-10, 70, i*10+20, 138, i*12-15); ctx.stroke();
    }
    const tex=new T.CanvasTexture(c); tex.magFilter=T.NearestFilter; tex.colorSpace=T.SRGBColorSpace;
    const body=box(w,h,d,x,y,z,0xffffff); body.material.map=tex; body.material.color.set(0xffffff);
    const top=box(w+.14,.12,d+.12,x,y+h/2+.06,z,0xffffff); top.material=body.material;
    box(.55,.34,.12,x,y+h/2+.33,z-d/2-.02,0x263747); box(.12,.12,.15,x,y+h/2+.17,z-d/2-.02,gray);
    addCollider(x,z,w+.2,d+.2);
    return body;
  }
  function pavilion(x,z){
    const base=new T.Mesh(new T.CylinderGeometry(3.2,3.2,4.2,16), new T.MeshLambertMaterial({color:white}));
    base.position.set(x,2.1,z); scene.add(base); addCollider(x,z,6.1,6.1);
    const ring=new T.Mesh(new T.CylinderGeometry(3.35,3.35,.35,16), new T.MeshLambertMaterial({color:orange})); ring.position.set(x,4.22,z); scene.add(ring);
    const dome=new T.Mesh(new T.SphereGeometry(3.1,16,8,0,Math.PI*2,0,Math.PI/2), new T.MeshLambertMaterial({color:0x205a92,flatShading:true}));
    dome.scale.y=.7; dome.position.set(x,4.35,z); scene.add(dome);
    for(let a=0;a<4;a++){
      const angle=a*Math.PI/4;
      for(let j=0;j<12;j++){
        const t0=j*Math.PI/12, t1=(j+1)*Math.PI/12;
        const v=t=>new T.Vector3(x+3.12*Math.cos(t)*Math.cos(angle),4.35+2.1*Math.sin(t),z+3.12*Math.cos(t)*Math.sin(angle));
        const p=v(t0), q=v(t1), mid=p.clone().add(q).multiplyScalar(.5);
        const rib=box(.2,p.distanceTo(q)+.03,.22,mid.x,mid.y,mid.z,orange); rib.quaternion.setFromUnitVectors(new T.Vector3(0,1,0), q.clone().sub(p).normalize());
      }
    }
    for(let a=0;a<8;a++){
      const ang=a*Math.PI/4; const win=box(.92,1.35,.08, x+3.15*Math.sin(ang),2.2,z+3.15*Math.cos(ang),0x7faab9); win.rotation.y=ang;
    }
  }

  // Terreno e rua
  box(110,.22,96,0,-.15,0,0x70985a);
  box(110,.14,10,0,-.02,34,0x555d66);
  box(110,.08,2.4,0,.02,28.2,0xbab9b5);
  for(let x=-50;x<50;x+=5) box(2.1,.02,.14,x,.06,34,0xf3ecd0);

  // Cercas
  for(const s of [-1,1]){
    for(let x=3;x<=50;x+=2.4){ box(.12,1.55,.12,s*x,.78,27.4,gray); if(x<49) box(2.18,.07,.07,s*(x+1.2),1.2,27.4,white); }
  }

  // Caminho externo e cobertura
  tile(3.8,20,0,17.5,0xe7e1cf);
  for(let z=9;z<=25;z+=4){ for(const s of [-1,1]) box(.18,4.2,.18,s*2.15,2.1,z,white); box(4.7,.22,3.6,0,4.26,z,blue); }
  box(5.2,.7,.4,0,4.45,26.9,blue); sign('SENAC',0,4.46,27.11,4.4,.72);

  // Árvores
  for(const [x,z] of [[-7,22],[7,22],[-9,15],[9,15],[-10,8],[10,8],[-16,18],[16,18]]){ box(.34,2.6,.34,x,1.3,z,0x785936); box(2.2,2.4,2.2,x,3,z,0x3b7541); }

  // Guarita/portaria
  tile(4.5,4,-5.9,23,0xe1ddd0);
  solid(4.8,4.5,.2,-5.9,2.25,25,white);
  solid(.2,4.5,4,-8.2,2.25,23,white);
  solid(.2,4.5,1.2,-3.6,2.25,24.4,white);
  solid(.2,4.5,1.2,-3.6,2.25,21.6,white);
  // frente mais aberta, com faixa de janela e abertura interna
  glass(1.4,2.6,.08,-3.55,1.5,22.95);
  box(4.8,.2,4.1,-5.9,4.55,23,blue); box(5,.24,4.3,-5.9,4.8,23,orange);
  sign('PORTARIA',-5.9,4.15,25.11,2.8,.46);
  marbleDesk(1.35,.95,.7,-5.65,.5,23.2);

  // Portão/cancela
  for(const s of [-1,1]){ const g=new T.Group(); g.position.set(s*.55,0,21.2); scene.add(g); box(1.05,2.4,.08,0,1.3,0,0xd3d8dc,g); box(.07,2.48,.1,0.5,1.3,0,gray,g); box(.07,2.48,.1,-0.5,1.3,0,gray,g); gate.leaves.push(g); }
  box(2.6,.18,.26,0,2.56,21.2,blue);

  // Recepção ampliada
  const recW=18, recD=16, recH=5.5;
  tile(recW+1,recD+1,0,0,0xded9cf);
  for(let x=-8;x<8.5;x++) for(let z=-7.5;z<8;z++) box(.98,.018,.98,x,.074,z, (Math.round(x+z)%2) ? 0xe6e4db : 0xd6d7d2);

  // Paredes exteriores recepção
  solid(6.8,recH,.24,-5.6,recH/2,-8,white); solid(6.8,recH,.24,5.6,recH/2,-8,white);
  solid(6.2,recH,.24,-5.9,recH/2,8,white); solid(6.2,recH,.24,5.9,recH/2,8,white);
  solid(.24,recH,14,-9,recH/2,-1,white);
  solid(.24,recH,3.5,-9,recH/2,6.25,white);
  glass(.12,recH-1.2,9.4,9, (recH-1.2)/2+.2, 2.3); addCollider(9,2.3,.12,9.4);
  solid(.24,recH,4.1,9,recH/2,-5.95,white);
  solid(.24,recH,1.6,9,recH/2,7.2,white);
  for(const z of [-8,8]) box(recW,.28,.34,0,recH+.08,z,orange);
  for(const x of [-9,9]) box(.34,.28,recD+.2,x,recH+.08,0,orange);

  // Corredores laterais internos
  solid(9,recH,.18,-13,recH/2,-3.5,white); solid(9,recH,.18,-13,recH/2,3.5,white);
  solid(9,recH,.18,13,recH/2,-3.5,white); solid(9,recH,.18,13,recH/2,3.5,white);
  solid(.18,recH,7.4,-17.4,recH/2,0,white); solid(.18,recH,7.4,17.4,recH/2,0,white);
  tile(8,3.2,-13,0,0xe4dfd0); tile(8,3.2,13,0,0xe4dfd0);

  // Portas principais mais conectadas às paredes
  function doubleDoor(z, label){
    const leaves=[];
    // faixas laterais de parede junto à porta
    solid(3.1,recH,.22,-4.45,recH/2,z,white);
    solid(3.1,recH,.22, 4.45,recH/2,z,white);
    // pilares laterais e travessa superior colados na porta
    box(.22,3.5,.24,-1.33,1.75,z,white); box(.22,3.5,.24,1.33,1.75,z,white); box(2.9,.3,.26,0,3.5,z,white);
    for(const s of [-1,1]){
      const g=new T.Group(); scene.add(g); g.position.set(s*.62,0,z);
      glass(1.15,3.15,.075,0,1.62,0,g);
      box(.05,3.2,.1,.56,1.62,0,gray,g); box(.05,3.2,.1,-.56,1.62,0,gray,g);
      box(1.15,.05,.1,0,.06,0,gray,g); box(1.15,.05,.1,0,3.18,0,gray,g); box(.06,.34,.12,-s*.12,1.55,.07,gray,g);
      leaves.push(g);
    }
    box(2.8,.18,.25,0,3.35,z,blue);
    if(label) sign(label,0,4.75,z+0.22,4.9,.56);
    doorFrames.push({z,leaves,open:0});
  }
  doubleDoor(8,'ATENDIMENTO');
  doubleDoor(-8,'');

  // Balcões e objetos
  marbleDesk(3.8,1.08,1.05,-5.2,.56,-2.2);
  marbleDesk(3.8,1.08,1.05, 5.2,.56,-2.2);
  for(let i=0;i<4;i++){ chair(-6.6+i*.95,3.8); chair(3.8+i*.95,3.8); }
  box(.58,1.18,.48,-8.0,.6,3.35,0xe4e8ea); box(.38,.35,.38,-8.0,1.35,3.35,0x73b5d2); box(.24,.12,.03,-8.0,.86,3.57,0x40596b); addCollider(-8.0,3.35,.6,.5);

  // Sala lateral visível pelo vidro
  tile(7.2,8,12.8,2.5,0xded9cf);
  for(const x of [11.3,14.0]){ box(1.8,.12,1,x,.82,3.2,0xc1a77d); for(const dx of [-.72,.72]) box(.08,.8,.08,x+dx,.4,3.2,gray); box(.7,.45,.14,x,1.12,3.0,0x263747); addCollider(x,3.2,1.8,1); }
  solid(7.8,recH,.2,12.8,recH/2,6.6,white); solid(.2,recH,8,16.6,recH/2,2.6,white);

  tile(4,9,-12.8,-8.5,0xe0ddcf); tile(4,9,12.8,-8.5,0xe0ddcf);

  const marks = {
    doorman:{x:-5.55,z:22.85},
    deskLeft:{x:-5.2,z:-0.4},
    deskRight:{x:5.2,z:-0.4},
    lobby:{x:0,z:0}
  };

  for(const x of [-20,-12,12,20]) for(const z of [-11,-3,9,17]){ if(x===12&&z===-3) continue; pavilion(x,z); }

  const roof = new T.Group(); scene.add(roof);
  const cap = new T.Mesh(new T.SphereGeometry(1,20,8,0,Math.PI*2,0,Math.PI/2), new T.MeshLambertMaterial({color:0x205a92,flatShading:true}));
  cap.scale.set(9.3,3.2,8.3); cap.position.y=5.8; roof.add(cap);
  for(let a=0;a<4;a++){
    const angle=a*Math.PI/4;
    for(let j=0;j<12;j++){
      const t0=j*Math.PI/12, t1=(j+1)*Math.PI/12;
      const v=t=>new T.Vector3(9.2*Math.cos(t)*Math.cos(angle),5.8+3.25*Math.sin(t),8.2*Math.cos(t)*Math.sin(angle));
      const p=v(t0), q=v(t1), m=p.clone().add(q).multiplyScalar(.5);
      const rib=box(.23,p.distanceTo(q)+.05,.23,m.x,m.y,m.z,orange,roof); rib.quaternion.setFromUnitVectors(new T.Vector3(0,1,0), q.clone().sub(p).normalize());
    }
  }

  const corridorRoofs = scene.children.filter(o=>o.isMesh && o.geometry && o.geometry.parameters && o.geometry.parameters.width===4.7);

  return {
    marks,
    update(p,dt,running,flags){
      const insideLobby = Math.abs(p.x) < 8.4 && Math.abs(p.z) < 7.2;
      roof.visible = !running || !insideLobby;
      corridorRoofs.forEach(o => o.visible = !running || Math.abs(p.x)>3.4 || p.z<6 || p.z>26);
      gate.open = T.MathUtils.lerp(gate.open, flags && flags.greeted ? 1 : 0, 1-Math.exp(-dt*7));
      gate.leaves.forEach((g,i)=> g.position.x = (i?1:-1) * (.55 + gate.open * .82));
      for(const d of doorFrames){
        const near = Math.abs(p.x) < 2.2 && Math.abs(p.z-d.z) < 2.4;
        d.open = T.MathUtils.lerp(d.open, near ? 1 : 0, 1-Math.exp(-dt*8));
        d.leaves.forEach((g,i)=> g.position.x = (i?1:-1) * (.62 + d.open*1.15));
      }
    },
    doorBlocked(x,z,flags){
      if(!(flags && flags.greeted) && Math.abs(z-21.2)<.45 && Math.abs(x)<1.2) return true;
      return doorFrames.some(d=>Math.abs(z-d.z)<.45 && Math.abs(x)<1.25 && d.open<.8);
    }
  };
};
