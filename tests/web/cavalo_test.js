// progressão do cavalo: níveis iniciais pela raça, experiência pelo uso, treinos, talentos, humor, personalidade, valor e salvamento
const {chromium}=require('playwright');const path=require('path');const ev=path.resolve(__dirname,'../../production/qa/evidence')+'/';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:860}});const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(__dirname,'../../web/index.html')+'#debug-nointro');await p.waitForTimeout(1200);
const E=s=>p.evaluate(s=>__lida.ev(s),s);await E("newGame(defaultCF())");await p.waitForTimeout(400);await E("FILM.end();closeModal();qPump=()=>{};QDQ.length=0;S.min=9*60;SET.cine='off';S.weather='sol';S.cash=5000");
const R=[];const ok=(n,c,i)=>R.push((c?'OK  ':'FALHA ')+n+(i?' — '+i:''));
ok('Quarto de Milha nasce com Lida 3 e Velocidade 2',await E("(()=>{const h=mkAnimal('cavalo','qm',{own:'player',age:30});return hl(h,'lida')>=3&&hl(h,'vel')>=2})()"));
await E("window.__h=mainHorse();__h.traits=['curioso','agitado'];__h.aff=70;__h.mood='tranquilo';hxS(__h)");
const v0=JSON.parse(await E("JSON.stringify({vel:hl(__h,'vel'),val:animalValue(__h),spd:hxSpeed(__h)})"));
// galopar: experiência de velocidade e fôlego
for(let i=0;i<400;i++)await E("hxRide(__h,1/60,'gallop',3)");ok('galopar dá experiência de velocidade',await E("hxS(__h).vel.l>"+v0.vel+"||hxS(__h).vel.x>0"),await E("JSON.stringify(hxS(__h).vel)"));
// treinos: um por dia; aula do Ryan dobra
await E("P.x=__h.x+10;P.y=__h.y+4;__h._stam=100;P.en=100;openHorseTrain(__h)");await p.waitForTimeout(300);await p.screenshot({path:ev+'cavalo-treino.png'});
const x0=await E("hxS(__h).fol.l*1000+hxS(__h).fol.x");await E("A.hTrain(__h.id+'|1')");for(let i=0;i<40&&await E("!!P._act");i++)await p.waitForTimeout(100);
ok('treino de fôlego dá experiência',await E("hxS(__h).fol.l*1000+hxS(__h).fol.x")>x0);ok('mesmo treino só 1x por dia',await E("__h.train.fol===S.day"));
ok('treino gasta fôlego do cavalo e energia sua',await E("__h._stam<100&&P.en<100"));
await E("A.hCoach(__h.id)");ok('aula do Ryan cobra e marca o dia',await E("__h.coachD===S.day&&S.cash<5000"));
// subir até talentos
await E("for(let i=0;i<60;i++)hxGain(__h,'salto',40)");ok('salto chega no nível 8: talentos Pulo Limpo e Asas',await E("hl(__h,'salto')>=8&&htal(__h,'limpo')&&htal(__h,'asas')"),await E("hl(__h,'salto')"));
await E("for(let i=0;i<60;i++)hxGain(__h,'fol',40)");ok('Segundo Fôlego salva o galope uma vez',await E("(()=>{__h._stam=2;__h._sf=0;hxRide(__h,1/60,'gallop',1);const a=__h._stam;__h._stam=2;hxRide(__h,1/60,'gallop',1);return a>=30&&__h._stam<5})()"));
ok('fôlego alto gasta menos',await E("hxDrain(__h)<0.7"),await E("hxDrain(__h).toFixed(2)"));
// efeitos na montaria
await E("for(let i=0;i<60;i++)hxGain(__h,'vel',40)");ok('velocidade e talento Vento do Sertão aumentam o galope',await E("hxSpeed(__h)")>v0.spd+0.15,await E("hxSpeed(__h).toFixed(2)"));
await E("for(let i=0;i<40;i++)hxGain(__h,'lida',40)");ok('lida aumenta o alcance sobre o gado',await E("(()=>{P.mnt=__h.id;__h._st='ridden';const s=pressureSources()[0];P.mnt=null;__h._st=null;return s.R>64*1.3})()"));
// humor
await E("__h.brushed=S.day;__h.food=90;__h.water=90;__h.hap=90;__h.rideKm=0;__h.traits=['curioso'];window.__r=Math.random;Math.random=()=>0.9;hxDay();Math.random=__r");ok('bem cuidado acorda animado',await E("__h.mood")==='animado');
await E("__h.rideKm=2000;hxDay()");ok('depois de cavalgar muito acorda cansado',await E("__h.mood")==='cansado');
// personalidade
ok('curioso aprende mais rápido',await E("(()=>{const m1=hxMul(__h,'vel');const t=__h.traits;__h.traits=[];const m2=hxMul(__h,'vel');__h.traits=t;return m1>m2})()"));
// valor de mercado
ok('cavalo treinado vale mais',await E("animalValue(__h)")>v0.val*1.3,v0.val+' → '+await E("animalValue(__h)"));
// ficha
await E("closeModal();openSheet(__h)");await p.waitForTimeout(500);ok('ficha mostra habilidades e talentos',await E("document.getElementById('ap').innerText.includes('Habilidades')&&document.getElementById('ap').innerText.includes('Asas')"));await p.screenshot({path:ev+'cavalo-ficha.png'});await E("closeSheet&&closeSheet()");
// assovio de longe com o talento
await E("for(let i=0;i<60;i++)hxGain(__h,'doma',40);__h.x=P.x+900;__h.y=P.y;__h._st=null;P.mnt=null;mountToggle()");ok('Vem no Assovio: cavalo longe aparece perto e vem',await E("hyp(__h.x-P.x,__h.y-P.y)<300&&__h._st==='come'"));
await E("SAVE.save('manual')");await p.waitForTimeout(500);await E("SAVE.loadBest(SAVE.slot)");await p.waitForTimeout(1200);ok('níveis salvos',await E("hl(mainHorse(),'salto')>=8&&hl(mainHorse(),'doma')>=8"));
console.log(R.join('\n'));console.log([...new Set(errs)].join('\n')||'sem erros');await b.close();})();
