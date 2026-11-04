// HUD 2: minimapa com bússola, seta do objetivo, roda de ações no animal, avisos por tipo e agrupados, barras baixas piscando
const {chromium}=require('playwright');const path=require('path');const EV=path.resolve(__dirname,'../../production/qa/evidence')+'/';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:860},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});
await p.goto('file://'+path.resolve(__dirname,'../../web/index.html')+'#debug-nointro');await p.waitForTimeout(1200);
const E=s=>p.evaluate(s=>__lida.ev(s),s);await E("newGame(defaultCF())");await p.waitForTimeout(400);await E("FILM.end();closeModal();qPump=()=>{};QDQ.length=0;S.min=9*60");
const R=[];const ok=(n,c,i)=>R.push((c?'OK  ':'FALHA ')+n+(i?' — '+i:''));
await E("pegaSpawn()");await p.waitForTimeout(800);
ok('minimapa redondo aparece no jogo',await E("getComputedStyle(document.getElementById('mmap')).display==='block'"));
ok('seta do objetivo na borda da tela com a distância',await E("getComputedStyle(document.getElementById('objArr')).display==='flex'&&/ m$/.test(document.querySelector('#objArr span').textContent)"),await E("document.querySelector('#objArr span').textContent"));
await E("toast('🥛 teste de leite');toast('🥛 teste de leite');toast('🚨 Roubaram uma vaca');");await p.waitForTimeout(150);
ok('aviso repetido agrupa (×2)',await E("[...document.querySelectorAll('#toast .t2')].some(d=>d.querySelector('.tn').textContent==='×2')"));
ok('avisos com cor por tipo (dinheiro, alerta)',await E("!!document.querySelector('#toast .t2.money')&&!!document.querySelector('#toast .t2.warn')"));
await p.screenshot({path:EV+'hud2-minimapa-seta.png'});
await E("const a=S.animals.find(x=>x.own==='player'&&x.sp==='boi');P.x=a.x+45;P.y=a.y;myAnimals('cao').forEach(d=>{d.x=a.x+200;d.y=a.y+120});cam.free=false;a._st='stay';a._t=999;window.__a=a");await p.waitForTimeout(500);
await E("(()=>{const a=__a,s=SCL();handleTap((a.x-cam.x)*s,(a.y-8-cam.y)*s)})()");await p.waitForTimeout(400);
ok('tocar no animal abre a roda de ações',await E("!!document.getElementById('wheel')&&document.querySelectorAll('#wheel .wb').length>=5"),await E("document.querySelectorAll('#wheel .wb').length"));
await p.screenshot({path:EV+'hud2-roda-acoes.png'});
await E("const b=[...document.querySelectorAll('#wheel .wb')].find(x=>/Carinho/.test(x.textContent));b.click()");for(let i=0;i<40;i++){await p.waitForTimeout(500);if(await E("__a.petD===S.day"))break;}
ok('ação da roda funciona (carinho)',await E("__a.petD===S.day&&!document.getElementById('wheel')"),await E("JSON.stringify({pd:__a.petD,day:S.day,act:P._act?P._act.k:null,d:Math.round(hyp(P.x-__a.x,P.y-__a.y))})"));
await E("const a=__a,s=SCL();handleTap((a.x-cam.x)*s,(a.y-8-cam.y)*s)");await p.waitForTimeout(200);await E("[...document.querySelectorAll('#wheel .wb')].find(x=>/Ficha/.test(x.textContent)).click()");await p.waitForTimeout(200);
ok('roda leva à ficha completa',await E("SH.a===__a&&document.getElementById('ap').classList.contains('on')"));await E("closeSheet()");
await E("P.en=10");await p.waitForTimeout(600);ok('energia baixa pisca',await E("document.getElementById('hEnC').classList.contains('low')"));
await E("SET.roda='off';const a=__a,s=SCL();handleTap((a.x-cam.x)*s,(a.y-8-cam.y)*s)");await p.waitForTimeout(200);ok('opção: toque abre a ficha direto',await E("!document.getElementById('wheel')&&SH.a===__a"));
console.log(R.join('\n'));console.log([...new Set(errs)].join('\n')||'sem erros');await b.close();})();
