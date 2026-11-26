/* Cenário v0.8 inspirado no Senac RR, com melhorias visuais em árvores, móveis e objetos. */
window.criarCenarioTech = function(T, scene, box, walls, sign){
  const blue=0x07529b, orange=0xf7941d, white=0xe7e5df, gray=0x9ea5ab, dark=0x263747;
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

  function shrub(x,z,s=1){ box(.9*s,.45,.9*s,x,.22,z,0x4b8a52); box(.65*s,.4,.65*s,x,.52,z,0x66a668); }
  function tree(x,z,variant=0){
    const trunkColor = variant%2 ? 0x7a5734 : 0x6d4c2c;
    box(.34,2.2,.34,x,1.1,z,trunkColor);
    box(.48,.38,.48,x,2.2,z,0x8a6a43);
    box(1.45,1.05,1.45,x,2.65,z, variant%2 ? 0x4f9152 : 0x467e49);
    box(1.15,.9,1.15,x,3.25,z, variant%2 ? 0x5da75f : 0x5b9958);
    box(.82,.7,.82,x,3.85,z, variant%2 ? 0x75bd73 : 0x6eb36b);
    box(1.05,.55,.62,x+.42,3.05,z+.12,0x5fa35d); box(1.0,.52,.6,x-.42,2.95,z-.1,0x5a9759);
    shrub(x+.9,z+.9,.75); shrub(x-.85,z-.7,.62);
  }

  function chair(x,z){
    box(.6,.1,.58,x,.5,z,0x1a4671);
    box(.62,.12,.08,x,.95,z-.23,0x1d588e);
    box(.08,.5,.08,x-.22,.73,z-.23,0x1d588e); box(.08,.5,.08,x+.22,.73,z-.23,0x1d588e);
    for(const dx of [-.22,.22]) for(const dz of [-.18,.18]) box(.05,.45,.05,x+dx,.24,z+dz,gray);
    addCollider(x,z,.62,.6);
  }

  function waitingChairRow(x,z,count=4){ for(let i=0;i<count;i++) chair(x+i*.95,z); }

  function deskMonitor(x,y,z){ box(.58,.36,.1,x,y+.38,z,0x202a33); box(.48,.28,.02,x,y+.39,z+.06,0x4aa4c7); box(.12,.12,.12,x,y+.14,z,gray); box(.26,.03,.18,x,y+.02,z,0x2c343d); }

  function marbleDesk(w,h,d,x,y,z){
    const c=document.createElement('canvas'); c.width=128; c.height=128; const ctx=c.getContext('2d');
    ctx.fillStyle='#f9f7f0'; ctx.fillRect(0,0,128,128);
    for(let i=0;i<14;i++){
      ctx.strokeStyle = i%2 ? '#e5d5b9' : '#d8c6aa'; ctx.lineWidth = 1 + (i%3);
      ctx.beginPath(); ctx.moveTo(-10, i*10+5); ctx.bezierCurveTo(30, i*12-10, 75, i*9+22, 138, i*11-15); ctx.stroke();
    }
    const tex=new T.CanvasTexture(c); tex.magFilter=T.NearestFilter; tex.colorSpace=T.SRGBColorSpace;
    const body=box(w,h,d,x,y,z,0xffffff); body.material.map=tex; body.material.color.set(0xffffff);
    const top=box(w+.18,.12,d+.18,x,y+h/2+.08,z,0xffffff); top.material=body.material;
    // frente com faixa azul decorativa
    box(w-.25,.18,.06,x,y+.12,z-d/2-.01,0x184f83);
    box(w-.25,.08,.07,x,y+.29,z-d/2-.01,orange);
    // base recuada
    box(w-.45,h-.18,d-.18,x,y-.02,z,0xf0ebe0);
    addCollider(x,z,w+.22,d+.22);
    return body;
  }

  function pavilion(x,z){
    const base=new T.Mesh(new T.CylinderGeometry(3.2,3.2,4.2,16), new T.MeshLambertMaterial({color:white}));
    base.position.set(x,2.1,z); scene.add(base); addCollider(x,z,6.1,6.1);
    const ring=new T.Mesh(new T.CylinderGeometry(3.35,3.35,.35,16), new T.MeshLambertMaterial({color:orange})); ring.position.set(x,4.22,z); scene.add(ring);
    const dome=new T.Mesh(new T.SphereGeometry(3.1,16,8,0,Math.PI*2,0,Math.PI/2), new T.MeshLambertMaterial({color:0x205a92,flatShading:true})); dome.scale.y=.7; dome.position.set(x,4.35,z); scene.add(dome);
    for(let a=0;a<4;a++){
      const angle=a*Math.PI/4;
      for(let j=0;j<12;j++){
        const t0=j*Math.PI/12, t1=(j+1)*Math.PI/12;
        const v=t=>new T.Vector3(x+3.12*Math.cos(t)*Math.cos(angle),4.35+2.1*Math.sin(t),z+3.12*Math.cos(t)*Math.sin(angle));
        const p=v(t0), q=v(t1), mid=p.clone().add(q).multiplyScalar(.5);
        const rib=box(.2,p.distanceTo(q)+.03,.22,mid.x,mid.y,mid.z,orange); rib.quaternion.setFromUnitVectors(new T.Vector3(0,1,0), q.clone().sub(p).normalize());
      }
    }
    for(let a=0;a<8;a++){ const ang=a*Math.PI/4; const win=box(.92,1.35,.08, x+3.15*Math.sin(ang),2.2,z+3.15*Math.cos(ang),0x7faab9); win.rotation.y=ang; }
  }

  // Terreno e rua
  box(110,.22,96,0,-.15,0,0x70985a);
  box(110,.14,10,0,-.02,34,0x555d66);
  box(110,.08,2.4,0,.02,28.2,0xbab9b5);
  for(let x=-50;x<50;x+=5) box(2.1,.02,.14,x,.06,34,0xf3ecd0);

  // Cercas
  for(const s of [-1,1]) for(let x=3;x<=50;x+=2.4){ box(.12,1.55,.12,s*x,.78,27.4,gray); if(x<49) box(2.18,.07,.07,s*(x+1.2),1.2,27.4,white); }

  // Caminho externo e cobertura
  tile(3.8,20,0,17.5,0xe7e1cf);
  for(let z=9;z<=25;z+=4){ for(const s of [-1,1]) box(.18,4.2,.18,s*2.15,2.1,z,white); box(4.7,.22,3.6,0,4.26,z,blue); }
  box(5.2,.7,.4,0,4.45,26.9,blue); sign('SENAC',0,4.46,27.11,4.4,.72);

  // Árvores e paisagismo melhorados
  [[-7,22,0],[7,22,1],[-9,15,1],[9,15,0],[-10,8,0],[10,8,1],[16,18,0]].forEach(v=>tree(v[0],v[1],v[2]));
  [[-4,24],[4,24],[-12,25],[13,11],[18,22]].forEach(v=>shrub(v[0],v[1],.95));

  // Guarita/portaria
  tile(4.5,4,-5.9,23,0xe1ddd0);
  solid(4.8,4.5,.2,-5.9,2.25,25,white);
  solid(.2,4.5,4,-8.2,2.25,23,white);
  solid(.2,4.5,1.2,-3.6,2.25,24.4,white);
  solid(.2,4.5,1.2,-3.6,2.25,21.6,white);
  glass(1.4,2.6,.08,-3.55,1.5,22.95);
  box(4.8,.2,4.1,-5.9,4.55,23,blue); box(5,.24,4.3,-5.9,4.8,23,orange);
  sign('PORTARIA',-5.9,4.15,25.11,2.8,.46);
  marbleDesk(1.35,.95,.7,-5.65,.5,23.2); deskMonitor(-5.65,.5,23.35);

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
  // Abertura lateral esquerda de 3,4 m, no lado do bebedouro, com vidro fixo mais ao fundo.
  solid(.24,recH,6.3,-9,recH/2,-4.85,white);
  glass(.12,recH-1.2,5.5,-9,(recH-1.2)/2+.2,4.45); addCollider(-9,4.45,.12,5.5);
  box(.24,1.0,5.5,-9,5.0,4.45,white);
  solid(.24,recH,.8,-9,recH/2,7.6,white);
  box(.24,1.1,3.4,-9,4.95,0,white);
  // Lado direito volta a ser fechado, preservando a sala envidraçada.
  solid(.24,recH,14,9,recH/2,-1,white);
  solid(.24,recH,3.5,9,recH/2,6.25,white);
  for(const z of [-8,8]) box(recW,.28,.34,0,recH+.08,z,orange);
  for(const x of [-9,9]) box(.34,.28,recD+.2,x,recH+.08,0,orange);

  // Portas principais maiores e mais integradas às paredes
  function doubleDoor(z, label){
    const leaves=[];
    solid(1.7,recH,.24,-2.65,recH/2,z,white);
    solid(1.7,recH,.24, 2.65,recH/2,z,white);
    box(3.6,1.6,.24,0,4.7,z,white);
    box(.32,3.9,.28,-1.72,1.95,z,white); box(.32,3.9,.28,1.72,1.95,z,white); box(3.75,.34,.28,0,3.76,z,white);
    const baseX=.82, openDist=1.45;
    for(const s of [-1,1]){
      const g=new T.Group(); scene.add(g); g.position.set(s*baseX,0,z);
      glass(1.55,3.45,.08,0,1.75,0,g);
      box(.06,3.5,.1,.76,1.75,0,gray,g); box(.06,3.5,.1,-.76,1.75,0,gray,g);
      box(1.55,.06,.1,0,.05,0,gray,g); box(1.55,.06,.1,0,3.45,0,gray,g);
      box(.07,.38,.12,-s*.18,1.7,.07,gray,g);
      leaves.push(g);
    }
    box(3.85,.18,.26,0,3.55,z,blue);
    if(label){ const labelSign=sign(label,0,4.95,z+0.22,5.2,.62); labelSign.userData.alwaysVisible=true; }
    doorFrames.push({z,leaves,open:0,baseX,openDist,blockHalf:1.72});
  }
  doubleDoor(8,'ATENDIMENTO');
  doubleDoor(-8,'');

  // Balcões e objetos
  marbleDesk(3.8,1.08,1.05,-5.2,.56,-2.2); deskMonitor(-5.2,1.18,-1.95);
  marbleDesk(3.8,1.08,1.05, 5.2,.56,-2.2); deskMonitor(5.2,1.18,-1.95);
  waitingChairRow(-6.6,3.8,4); waitingChairRow(3.8,3.8,4);
  // bebedouro mais detalhado
  box(.58,1.18,.48,-8.0,.6,3.35,0xe4e8ea); box(.4,.3,.4,-8.0,1.38,3.35,0x73b5d2); box(.24,.12,.03,-8.0,.86,3.57,dark); box(.18,.05,.14,-8.0,1.58,3.35,0xf4f8fb); box(.3,.07,.3,-8.0,.04,3.35,0xc4cad0); addCollider(-8.0,3.35,.6,.5);

  // Sala lateral envidraçada preservada, sem bloquear o novo acesso.
  tile(7,5.3,12.6,4.5,0xded9cf);
  for(const x of [11.3,14.0]){ box(1.8,.12,1,x,.82,5.2,0xc1a77d); for(const dx of [-.72,.72]) box(.08,.8,.08,x+dx,.4,5.2,gray); box(.7,.45,.14,x,1.12,5.0,dark); addCollider(x,5.2,1.8,1); }
  solid(7,recH,.2,12.6,recH/2,7.2,white); solid(.2,recH,5.3,16.1,recH/2,4.55,white);
  // Corredor da recepção para a cantina e sala de TI, agora no lado esquerdo do atendimento.
  tile(10.4,4.6,-14,0); for(const z of [-2.3,2.3]) solid(10.4,4.5,.18,-14,2.25,z,white);
  // Pátio central e dois caminhos contornando a cantina.
  tile(15,14,-26.5,0,0xded9cf);
  for(let x=-33.5;x<-19;x++) for(let z=-6.5;z<7;z++) box(.97,.018,.97,x,.074,z,(Math.floor(x+z)%2)?0xe5e2d9:0xd9d8cf);
  solid(15,4.5,.2,-26.5,2.25,-7,white);
  // Parede compartilhada com TI construída uma única vez abaixo.
  for(const z of [-4.9,4.9]) solid(.2,4.5,4.2,-19,2.25,z,white);
  solid(.2,4.5,14,-34,2.25,0,white);
  // Cantina central, balcão voltado para a chegada pelo corredor esquerdo.
  tile(5,6,-26,0,0xcbbba4);
  solid(5,3.6,.18,-26,1.8,-3,white); solid(5,3.6,.18,-26,1.8,3,white); solid(.18,3.6,6,-28.5,1.8,0,white);
  // Balcão longitudinal na face leste; caminhos livres nos dois lados.
  solid(.75,1.15,5.6,-23.5,.58,0,0xe8dcc6); box(.91,.12,5.8,-23.5,1.2,0,white);
  for(const z of [-1.8,-.9,0,.9,1.8]) {box(.36,.15,.42,-23.5,1.32,z,0xc68a42); box(.32,.14,.35,-23.5,1.46,z,0xe8bb73);}
  box(.08,.65,2.2,-23.05,1.58,0,0x8ac6dc).material=new T.MeshPhongMaterial({color:0xaedced,transparent:true,opacity:.35});
  box(5.4,.2,6.4,-26,3.7,0,blue); const cs=sign('CANTINA',-23.35,4.45,0,5.2,.78); cs.rotation.y=Math.PI/2; cs.userData.alwaysVisible=true;
  // Objetos de cozinha da cantina.
  box(.95,1.85,.85,-27.2,.93,-1.9,0x9aa5ab); box(.75,.28,.72,-27.2,1.88,-1.9,0xd9e1e5);
  box(1.15,.9,.72,-26.7,.45,1.95,0xb98155); box(1.15,.12,.72,-26.7,.96,1.95,0x505860); box(.38,.07,.38,-26.96,1.03,1.86,0x212a33); box(.38,.07,.38,-26.44,1.03,2.05,0x212a33);
  box(.9,.8,.62,-26.45,.42,.55,0xcfd7dc); box(.6,.07,.44,-26.45,.84,.55,0x8aa5b3); box(.12,.15,.12,-26.73,.94,.55,0xe7f4fb);
  box(.68,.52,.48,-26.85,1.48,-.25,0x434a52); box(.5,.26,.42,-26.85,1.49,-.23,0x1c2329);
  for(const z of [-1.5,-.5,.5,1.5]){ box(.17,.34,.17,-23.5,1.38,z,0xd9e1e5); box(.19,.02,.19,-23.5,1.56,z,0xc33a39); }
  // Duas mesas redondas no pátio, com circulação nos lados.
  for(const z of [-4.8,4.8]){const m=new T.Mesh(new T.CylinderGeometry(.75,.75,.12,12),new T.MeshLambertMaterial({color:0xc5a67d}));m.position.set(-30.4,.87,z);scene.add(m);box(.18,.8,.18,-30.4,.4,z,gray);addCollider(-30.4,z,1.5,1.5);chair(-31.8,z); box(.16,.28,.16,-30.2,1.08,z-.1,0xd9e1e5); box(.18,.02,.18,-30.2,1.22,z-.1,0xc53f3b); box(.32,.08,.28,-30.58,1.0,z+.15,0xe8bb73); box(.26,.12,.22,-30.58,1.08,z+.15,0x7d4c28); box(.32,.05,.28,-30.58,1.15,z+.15,0xe8bb73);}
  // Sala de TI ampliada com 10 bancadas.
  tile(20,16,-25,15,0xded9cf);
  for(let x=-34.4;x<-15.3;x++) for(let z=7.6;z<22.7;z++) box(.97,.018,.97,x,.074,z,(Math.floor(x+z)%2)?0xe5e2d9:0xd9d8cf);
  solid(.22,4.9,16,-34.9,2.45,15,white); solid(.22,4.9,16,-15.1,2.45,15,white);
  solid(20,4.9,.22,-25,2.45,23.1,white);
  solid(7.4,4.9,.22,-31.3,2.45,7,white); solid(7.4,4.9,.22,-18.7,2.45,7,white);
  // Porta de correr de 4,8 metros, encaixada na parede compartilhada.
  box(4.8,1.5,.24,-25,4.18,7,white);
  for(const x of [-27,-23]) solid(.14,3.4,.28,x,1.7,7,gray);
  box(4,.15,.28,-25,3.4,7,gray);
  const tiLeaves=[];
  for(const side of [-1,1]){
    const g=new T.Group();scene.add(g);g.position.set(-25+side*1.18,0,6.96);
    glass(2.3,3.28,.09,0,1.66,0,g);
    for(const x of [-1.12,1.12])box(.06,3.34,.12,x,1.66,0,gray,g);
    for(const y of [.06,3.32])box(2.34,.06,.12,0,y,0,gray,g);
    box(.07,.38,.14,-side*.28,1.5,0,gray,g);tiLeaves.push(g);
  }
  doorFrames.push({x:-25,z:6.96,leaves:tiLeaves,open:0,baseX:1.18,openDist:2.2,blockHalf:2.45});
  const tiSign=sign('SALA DE TI',-25,5.02,6.74,5.8,.88);tiSign.rotation.y=Math.PI;tiSign.userData.alwaysVisible=true;
  const tiSpots=[];
  for(const x of [-31.2,-27.5,-23.8,-20.1,-16.9]) for(const z of [11.1,15.5]) {
    tiSpots.push({x,z});
    solid(2.7,.15,1.25,x,1.02,z,0xc1a77d);
    for(const dx of [-1.18,1.18]) for(const dz of [-.48,.48]) box(.12,.96,.12,x+dx,.48,z+dz,dark);
    box(.9,.58,.12,x+.22,1.53,z-.28,dark);box(.78,.45,.025,x+.22,1.53,z-.205,0x15283d);
    box(.13,.2,.14,x+.22,1.19,z-.28,gray);box(.38,.045,.3,x+.22,1.12,z-.23,dark);
    box(.64,.055,.26,x+.22,1.12,z+.25,dark);for(let k=0;k<7;k++)box(.06,.008,.17,x-.05+k*.08,1.153,z+.25,0x52616e);
    box(.14,.06,.22,x+.72,1.12,z+.25,0x25313d);
    box(.46,.82,.7,x-.92,1.5,z-.02,0x263747);box(.38,.76,.035,x-.92,1.5,z+.31,0x17232e);
    box(.12,.045,.04,x-.92,1.76,z+.34,0x69c78c);for(let k=0;k<4;k++)box(.28,.035,.04,x-.92,1.18+k*.082,z+.34,0x445566);
    chair(x+.18,z+1.1);
  }
  box(7,1.85,.12,-25,2.75,22.5,0xf5f5ef);box(7.2,.08,.16,-25,1.81,22.42,gray);
  solid(3.4,.15,1.1,-25,1.02,21.0,0xc1a77d);for(const dx of [-1.45,1.45])for(const dz of [-.42,.42])box(.12,.95,.12,-25+dx,.48,21+dz,dark);deskMonitor(-25,1.1,21.0);
  tile(4,9,-12.8,-8.5,0xe0ddcf);

  const marks = {
    doorman:{x:-3.0,z:23.3},
    deskLeft:{x:-5.2,z:-3.25},
    deskRight:{x:5.2,z:-3.25},
    lobby:{x:0,z:0},
    corridorEntry:{x:-9.6,z:0},
    patio:{x:-22.2,z:0},
    tiDoor:{x:-25,z:6.96},
    tiSeat:{x:-23.62,z:16.62}
  };

  for(const x of [-20,-12,12,20]) for(const z of [-11,-3,9,17]){ if(x<0) continue; pavilion(x,z); }

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

  // Visão por cômodo: geometria visual separada das colisões.
  const regions={
    reception:{minX:-9.25,maxX:9.25,minZ:-8.25,maxZ:8.25},
    corridor:{minX:-19.3,maxX:-9.25,minZ:-2.35,maxZ:2.35},
    patio:{minX:-34.2,maxX:-19.0,minZ:-7.2,maxZ:7.2},
    ti:{minX:-35.2,maxX:-14.8,minZ:7.2,maxZ:23.3},
    side:{minX:9.25,maxX:16.3,minZ:1.95,maxZ:7.4}
  };
  const regionAt=(x,z)=>Object.keys(regions).find(k=>{const r=regions[k];return x>=r.minX&&x<=r.maxX&&z>=r.minZ&&z<=r.maxZ;})||'outside';
  scene.updateMatrixWorld(true);
  const visual=scene.children.filter(o=>o.isMesh||o.isGroup).map(o=>{
    const bounds=new T.Box3().setFromObject(o), center=bounds.getCenter(new T.Vector3()), size=bounds.getSize(new T.Vector3());
    const memberships=Object.keys(regions).filter(k=>{const r=regions[k];return center.x>=r.minX-.22&&center.x<=r.maxX+.22&&center.z>=r.minZ-.22&&center.z<=r.maxZ+.22;});
    const materials=[];o.traverse(m=>{if(m.isMesh&&m.material){const list=Array.isArray(m.material)?m.material:[m.material];const copies=list.map(mat=>{const c=mat.clone();if(c.color)materials.push({mat:c,color:c.color.clone()});return c;});m.material=Array.isArray(m.material)?copies:copies[0];}});
    return {o,bounds,center,size,memberships,materials};
  });
  const background=new T.Color(0x0b172b), day=new T.Color(0x9ec9ed);
  let activeRegion='outside', previousRegion=null;
  function applyView(p,running,camera){
    activeRegion=running?regionAt(p.x,p.z):'outside';
    const inside=activeRegion!=='outside';
    scene.background.copy(inside?background:day);scene.fog.color.copy(inside?background:day);
    const r=regions[activeRegion];
    for(const v of visual){
      const {o,bounds,center,size,memberships,materials}=v;
      if(o===roof||corridorRoofs.includes(o)){if(inside)o.visible=false;continue;}
      if(o.userData && o.userData.alwaysVisible){ o.visible=true; if(camera)o.quaternion.copy(camera.quaternion); o.material.depthTest=false; o.material.depthWrite=false; o.renderOrder=100; continue; }
      const isTIDoor=tiLeaves.includes(o);
      const active=memberships.includes(activeRegion)||(isTIDoor&&(activeRegion==='ti'||activeRegion==='patio'));
      if(activeRegion!==previousRegion){for(const {mat,color} of materials)mat.color.copy(color).multiplyScalar(inside&&!active?.12:1);}
      o.visible=true;
      if(!inside)continue;
      // Mantém apenas piso/silhueta escura nos cômodos fora do foco.
      if(!active){o.visible=size.y<.32&&bounds.max.y<.45;continue;}
      const wall=size.y>2.25&&(size.x<.48||size.z<.48);
      const overhead=bounds.min.y>3.3;
      // Frente do cômodo em corte, preservando paredes laterais e do fundo.
      const front=wall&&size.z<.48&&center.z>=r.maxZ-.55;
      if(!isTIDoor&&(front||overhead)){o.visible=false;continue;}
      // Paredes que interceptam a linha de visão da câmera ao personagem.
      if(!isTIDoor&&wall&&camera){const target=new T.Vector3(p.x,1.35,p.z);const delta=target.clone().sub(camera.position);const length=delta.length();const ray=new T.Ray(camera.position,delta.normalize());const hit=ray.intersectBox(bounds,new T.Vector3());if(hit&&hit.distanceTo(camera.position)<length-.3)o.visible=false;}
    }
    previousRegion=activeRegion;
    return activeRegion;
  }
  return {
    marks, applyView,
    update(p,dt,running,flags){
      const insideLobby = Math.abs(p.x) < 8.4 && Math.abs(p.z) < 7.2;
      roof.visible = !running || !insideLobby;
      corridorRoofs.forEach(o => o.visible = !running || Math.abs(p.x)>3.4 || p.z<6 || p.z>26);
      gate.open = T.MathUtils.lerp(gate.open, flags && flags.greeted ? 1 : 0, 1-Math.exp(-dt*7));
      gate.leaves.forEach((g,i)=> g.position.x = (i?1:-1) * (.55 + gate.open * .82));
      for(const d of doorFrames){
        const near = Math.abs(p.x-(d.x||0)) < 2.7 && Math.abs(p.z-d.z) < 2.6;
        d.open = T.MathUtils.lerp(d.open, near ? 1 : 0, 1-Math.exp(-dt*8));
        d.leaves.forEach((g,i)=> g.position.x = (d.x||0)+(i?1:-1) * (d.baseX + d.open*d.openDist));
      }
    },
    doorBlocked(x,z,flags){
      if(!(flags && flags.greeted) && Math.abs(z-21.2)<.45 && Math.abs(x)<1.2) return true;
      return doorFrames.some(d=>Math.abs(z-d.z)<.5 && Math.abs(x-(d.x||0))<d.blockHalf && d.open<.8);
    }
  };
};
