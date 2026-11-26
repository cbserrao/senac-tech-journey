// Substitua SEU_USUARIO pelo usuário do GitHub antes de publicar.
(async function(){
 const base='https://cdn.jsdelivr.net/gh/SEU_USUARIO/senac-tech-journey@main/';
 function load(url){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=url;s.onload=resolve;s.onerror=()=>reject(new Error('Falha ao carregar '+url));document.head.appendChild(s);});}
 try{if(!window.THREE)await load('https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.min.js');await load(base+'simulador.js');}catch(e){const p=document.createElement('p');p.textContent=e.message;document.body.appendChild(p);}
})();
