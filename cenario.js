/* Cenário original inspirado no Senac RR. Eixo Z positivo aponta para a rua. */
window.criarCenarioTech = function(T,scene,box,walls,sign){
 const blue=0x07529b,orange=0xf7941d,white=0xe4e4df,gray=0x9a9fa5;
 const solid=(w,h,d,x,y,z,c)=>{const m=box(w,h,d,x,y,z,c);walls.push({x,z,w,d});return m;};
 const glass=(w,h,d,x,y,z)=>{const m=box(w,h,d,x,y,z,0x8ac6dc);m.material=new T.MeshPhongMaterial({color:0x9bd1e3,transparent:true,opacity:.25,depthWrite:false,shininess:90});return m;};
 const tile=(w,d,x,z)=>box(w,.1,d,x,.015,z,0xe0dfd8);
 box(86,.2,86,0,-.16,0,0x668e54);box(86,.12,8,0,-.02,30,0x505761);box(86,.12,2,0,-.01,25,0xb7b9b8);
 for(let x=-40;x<40;x+=5)box(2,.02,.12,x,.06,30,0xf4ecd1);
 tile(3.4,19,0,15.5);tile(10,8,0,0);tile(8,2.6,-9,0);tile(8,2.6,9,0);tile(3,7,0,-7.5);tile(7,6,8,4);
 for(let x=-4.5;x<5;x++)for(let z=-3.5;z<4;z++)box(.98,.018,.98,x,.074,z,(Math.round(x+z)%2)?0xe5e3da:0xd5d6d1);
 // Recepção facetada: centro aberto, quatro acessos.
 for(const s of [-1,1]){
 solid(3.5,3.2,.22,s*2.75,1.6,-4,white);solid(3.5,3.2,.22,s*2.75,1.6,4,white);
 solid(.22,3.2,2.1,s*5,1.6,-2.6,white);
 if(s<0)solid(.22,3.2,2.1,-5,1.6,2.6,white);
 else {glass(.12,2.9,2.1,5,1.5,2.6);walls.push({x:5,z:2.6,w:.12,d:2.1});for(const z of [1.55,2.6,3.65])box(.13,3,.09,5,1.5,z,gray);}
 for(const z of [-4,4])box(3.5,.22,.27,s*2.75,3.15,z,orange);
 // Corredores laterais
 for(const z of [-1.4,1.4])solid(8,3,.18,s*9,1.5,z,white);
 // Balcão com veios de mármore gerados em canvas
 const desk=solid(2.4,1.05,.85,s*2.8,.58,-1.7,white);const top=box(2.55,.12,1,s*2.8,1.17,-1.7,white);
 const c=document.createElement('canvas');c.width=128;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#f8f5ed';ctx.fillRect(0,0,128,128);for(let i=0;i<9;i++){ctx.strokeStyle=i%2?'#e5d5b9':'#d8c6aa';ctx.lineWidth=1+i%3;ctx.beginPath();ctx.moveTo(0,i*17);ctx.lineTo(40,i*17-12);ctx.lineTo(75,i*17+5);ctx.lineTo(128,i*17-17);ctx.stroke();}const tex=new T.CanvasTexture(c);tex.magFilter=T.NearestFilter;tex.colorSpace=T.SRGBColorSpace;desk.material.map=tex;desk.material.color.set(0xffffff);top.material=desk.material;
 box(.48,.34,.12,s*2.8,1.45,-1.92,0x263747);box(.12,.12,.15,s*2.8,1.28,-1.92,gray);
 for(let i=0;i<3;i++){const z=2.05+i*.58,x=s*3.7;solid(.52,.12,.48,x,.53,z,blue);box(.12,.52,.48,x+s*.22,.79,z,blue);for(const dx of [-.19,.19])for(const dz of [-.17,.17])box(.06,.48,.06,x+dx,.25,z+dz,gray);}
 }
 solid(.5,1.05,.45,-3.9,.58,1.1,0xe1e6e8);box(.35,.32,.32,-3.9,1.25,1.1,0x73b5d2);box(.24,.12,.03,-3.9,.8,1.34,0x40596b);
 // Sala lateral visível através do vidro
 for(const x of [6.8,9.2]){box(1.4,.12,.8,x,.82,4.6,0xc1a77d);for(const dx of [-.55,.55])box(.08,.8,.08,x+dx,.4,4.6,gray);box(.55,.4,.12,x,1.1,4.5,0x263747);}
 solid(7,3,.2,8,1.5,7,white);solid(.2,3,6,11.5,1.5,4,white);
 // Porta dupla: painéis e moldura; colisão dinâmica pela função atualizar.
 const doors=[];for(const z of [4,-4]){const leaves=[];for(const s of [-1,1]){const g=new T.Group();scene.add(g);g.position.set(s*.5,0,z);const p=glass(.98,2.3,.075,0,1.2,0);scene.remove(p);g.add(p);for(const dx of [-.49,.49])box(.045,2.4,.1,dx,1.2,0,gray,g);for(const y of [.05,2.35])box(1,.05,.1,0,y,0,gray,g);box(.06,.32,.12,-s*.1,1.15,.07,gray,g);leaves.push(g);}box(2.2,.16,.25,0,2.48,z,blue);doors.push({z,leaves,open:0});}
 // Cobertura externa e guarita
 for(let z=6;z<=24;z+=3){for(const s of [-1,1])solid(.18,2.85,.18,s*1.75,1.43,z,white);box(3.8,.23,3.05,0,2.9,z,blue);}
 box(4.3,.6,.35,0,3.05,24.7,blue);sign('SENAC',0,3.05,24.9,3.8,.55);sign('ATENDIMENTO',0,2.85,4.2,3.3,.45);
 for(const s of [-1,1]){for(let x=3;x<=26;x+=2){box(.12,1.3,.12,s*x,.65,24,gray);box(2,.07,.07,s*(x+1),1.1,24,white);}for(let z=7;z<=22;z+=5){box(.28,1.5,.28,s*6,.75,z,0x785936);box(1.5,1.8,1.5,s*6,2,z,0x3b7541);}}
 // Pavilhões decorativos: volumes facetados e abóbadas com nervuras laranja.
 function pavilion(x,z){const base=new T.Mesh(new T.CylinderGeometry(3.1,3.1,2.7,16),new T.MeshLambertMaterial({color:white}));base.position.set(x,1.35,z);scene.add(base);walls.push({x,z,w:5.9,d:5.9});const ring=new T.Mesh(new T.CylinderGeometry(3.25,3.25,.35,16),new T.MeshLambertMaterial({color:orange}));ring.position.set(x,2.75,z);scene.add(ring);const dome=new T.Mesh(new T.SphereGeometry(3.05,16,8,0,Math.PI*2,0,Math.PI/2),new T.MeshLambertMaterial({color:0x205a92,flatShading:true}));dome.scale.y=.65;dome.position.set(x,2.92,z);scene.add(dome);for(let a=0;a<4;a++){const angle=a*Math.PI/4;for(let j=0;j<12;j++){const t0=j*Math.PI/12,t1=(j+1)*Math.PI/12;const v=t=>new T.Vector3(x+3.1*Math.cos(t)*Math.cos(angle),2.92+2.02*Math.sin(t),z+3.1*Math.cos(t)*Math.sin(angle));const p=v(t0),q=v(t1),mid=p.clone().add(q).multiplyScalar(.5);const rib=box(.22,p.distanceTo(q)+.03,.24,mid.x,mid.y,mid.z,orange);rib.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),q.sub(p).normalize());}}for(let a=0;a<8;a++){const ang=a*Math.PI/4;const win=box(.85,1,.08,x+3.08*Math.sin(ang),1.45,z+3.08*Math.cos(ang),0x7faab9);win.rotation.y=ang;}}
 for(const x of [-19,-12,12,19])for(const z of [-10,-3,10,17]){if(x===12&&z===-3)continue;pavilion(x,z);}
 // Cobertura da recepção: removida quando jogador entra para liberar câmera.
 const roof=new T.Group();scene.add(roof);const cap=new T.Mesh(new T.SphereGeometry(1,20,8,0,Math.PI*2,0,Math.PI/2),new T.MeshLambertMaterial({color:0x205a92,flatShading:true}));cap.scale.set(5.2,2.2,4.3);cap.position.y=3.2;roof.add(cap);for(let a=0;a<4;a++){let angle=a*Math.PI/4;for(let j=0;j<12;j++){let t=j*Math.PI/12,u=(j+1)*Math.PI/12;const v=k=>new T.Vector3(5.25*Math.cos(k)*Math.cos(angle),3.2+2.25*Math.sin(k),4.35*Math.cos(k)*Math.sin(angle));let p=v(t),q=v(u),m=p.clone().add(q).multiplyScalar(.5);const rib=box(.23,p.distanceTo(q)+.04,.23,m.x,m.y,m.z,orange,roof);rib.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),q.sub(p).normalize());}}
 // Oculta coberturas do corredor quando câmera está sobre ele.
 const corridorRoofs=scene.children.filter(o=>o.isMesh&&o.geometry.parameters?.width===3.8);
 return {update(p,dt,running){roof.visible=!running||Math.abs(p.x)>6||Math.abs(p.z)>6;corridorRoofs.forEach(o=>o.visible=!running||Math.abs(p.x)>3||p.z<3||p.z>26);for(const d of doors){const near=Math.abs(p.x)<1.8&&Math.abs(p.z-d.z)<2;d.open=T.MathUtils.lerp(d.open,near?1:0,1-Math.exp(-dt*9));d.leaves.forEach((g,i)=>g.position.x=(i?1:-1)*(.5+d.open*1.02));}},doorBlocked(x,z){return doors.some(d=>Math.abs(z-d.z)<.42&&Math.abs(x)<1.05&&d.open<.8);}};
};
