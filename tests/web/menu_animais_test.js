// menu Animais em 3D: todas as espécies (bovinos, cavalos, muares, jumentos, cabras, ovelhas, porcos, aves, cães), contagem e lista
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:860}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});
await p.goto('file://'+path.resolve(__dirname,'../../web/index.html')+'#debug-nointro');await p.waitForTimeout(1200);
const E=s=>p.evaluate(s=>__lida.ev(s),s);await E("newGame(defaultCF())");await p.waitForTimeout(400);await E("FILM.end();closeModal();qPump=()=>{};QDQ.length=0;for(const sp of ['cabra','ovelha','porco']){const a=mkAnimal(sp,null,{own:'player',age:24});S.animals.push(a)}");
const R=[];const ok=(n,c,i)=>R.push((c?'OK  ':'FALHA ')+n+(i?' — '+i:''));
await E("openMenu('ani')");await p.waitForTimeout(400);
ok('9 espécies no menu, com cabras, ovelhas e porcos',await E("(()=>{const t=[...document.querySelectorAll('.sp3d .nm')].map(e=>e.textContent);return t.length===9&&['Cabras','Ovelhas','Porcos','Aves','Muares'].every(n=>t.includes(n))})()"));
ok('cada espécie mostra a contagem certa',await E("[...document.querySelectorAll('.sp3d')].every(b=>+b.querySelector('.badge').textContent===myAnimals(b.dataset.v).length)"));
await E("A.aniF('porco')");await p.waitForTimeout(200);ok('lista dos porcos com cartão, barras e pedestal',await E("document.querySelectorAll('.an3d .ped.big').length===myAnimals('porco').length&&!!document.querySelector('.bars3d')"));
await E("A.aniF('burro')");await p.waitForTimeout(200);ok('espécie sem animal mostra onde comprar',await E("/Nenhum muares ainda|Nenhum/.test(document.body.innerText)"));
ok('cabeçalho com total e valor do rebanho',await E("/Rebanho vale/.test(document.body.innerText)"));
console.log(R.join('\n'));console.log([...new Set(errs)].join('\n')||'sem erros');await b.close();})();
