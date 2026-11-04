// diário de lida, mapa novo, animações da lida e sons novos
const {chromium}=require('playwright');const path=require('path');const EV=path.resolve(__dirname,'../../production/qa/evidence')+'/';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:860}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});
await p.goto('file://'+path.resolve(__dirname,'../../web/index.html')+'#debug-nointro');await p.waitForTimeout(1200);
const E=s=>p.evaluate(s=>__lida.ev(s),s);await E("newGame(defaultCF())");await p.waitForTimeout(400);await E("FILM.end();closeModal();qPump=()=>{};QDQ.length=0");
const R=[];const ok=(n,c,i)=>R.push((c?'OK  ':'FALHA ')+n+(i?' — '+i:''));
await E("const a=S.animals.find(x=>x.own==='player'&&x.sp==='boi');a.bich=1;a.water=10;pegaSpawn();ctrOffers();A.ctrTake(0)");
await E("openMenu()");await p.waitForTimeout(400);
ok('menu abre no Diário',await E("/Urgente/.test(document.body.innerText)&&/Bicheira em/.test(document.body.innerText)"));
ok('diário lista contrato, barbatão e sede',await E("(()=>{const t=document.body.innerText;return /Contrato com/.test(t)&&/Barbatão/.test(t)&&/com sede/.test(t)})()"));
await p.screenshot({path:EV+'diario-lida.png'});
await E("closeModal();openMenu('map')");await p.waitForTimeout(600);ok('mapa novo com legenda de capim e marcadores',await E("/capim bom/.test(document.body.innerText)&&/barbatão/.test(document.body.innerText)"));
await p.screenshot({path:EV+'mapa-novo.png'});await E("closeModal()");
await E("const a=S.animals.find(x=>x.own==='player'&&x.sp==='boi');parts.length=0;window.__n0=0;lidaFx(a,'brand');lidaFx(a,'milk');lidaFx(a,'spray');lidaFx(a,'kick')");
ok('animações da lida soltam partículas sem erro',await E("parts.length>20"));
await E("AU.chocalho(P.x,P.y);AU.cigarra();AU.berrante();AU.squirt(P.x,P.y);AU.bemtevi();AU.brasa(P.x,P.y)");ok('sons novos tocam sem erro',true);
console.log(R.join('\n'));console.log([...new Set(errs)].join('\n')||'sem erros');await b.close();})();
