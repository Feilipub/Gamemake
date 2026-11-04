// mega atualização: capítulos e hipoteca, seca, roubo, morte, histórias dos moradores, casamento, laço com mira, notícias, desafio, catálogo, foto
const {chromium}=require('playwright');const path=require('path');const EV=path.resolve(__dirname,'../../production/qa/evidence')+'/';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:860}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});
await p.goto('file://'+path.resolve(__dirname,'../../web/index.html')+'#debug-nointro');await p.waitForTimeout(1200);
const E=s=>p.evaluate(s=>__lida.ev(s),s);await E("newGame(defaultCF())");await p.waitForTimeout(400);await E("FILM.end();closeModal();qPump=()=>{};QDQ.length=0;S.story=S.story||{};S.story.intro=1");
const R=[];const ok=(n,c,i)=>R.push((c?'OK  ':'FALHA ')+n+(i?' — '+i:''));
// capítulos
ok('começa no capítulo 1',await E("herS().ch===0&&herCap().n==='O rancho do avô'"));
await E("qState('q4').s='done';while(myAnimals().filter(a=>a.sp!=='cao'&&!a.main).length<6)S.animals.push(mkAnimal('boi','nelore',{own:'player'}));const c0=S.cash;herTick();window.__c=c0");
ok('capítulo 1 concluído abre a hipoteca',await E("herS().ch===1&&herS().debt===40000&&herS().due===S.day+60&&S.cash>__c"));
await E("S.cash=0;S.acct=12000;A.herPay('5000')");ok('pagar parcela de 5 mil',await E("herS().debt===35000"));
await E("S.day=herS().due+1;herDay()");ok('prazo perdido: juros e o Abílio compra a dívida',await E("herS().fails===1&&herS().debt===42000&&herS().due===S.day+30"));
await E("S.day=herS().due+1;herDay()");ok('perdeu de novo: o Abílio fica com o Retiro',await E("herS().lost&&!owned('r1')"));
await E("S.cash=90000;A.herBuyBack()");ok('recompra do Retiro',await E("!herS().lost"));
await E("S.ret={r1:1,r2:1,rcur:1};herS().debt=0;herTick()");ok('hipoteca quitada passa ao capítulo 3',await E("herS().ch===2"));
ok('Diário mostra a herança e o desafio',await E("/Herança/.test(diarioHTML())&&/Desafio da semana/.test(diarioHTML())"));
// riscos
await E("S.drought={from:S.day,until:S.day+5};const k='p1';const r=AREAS[k].r;let i0=gi(r[0]+2,r[1]+2);ground[i0]=G.PAST;grass[i0]=50;regrow(10);window.__g=grass[i0]");ok('seca braba: capim quase não rebrota',await E("__g<60"),await E("__g"));
await E("S.drought=null;const n0=myAnimals('boi').length;window.__n0=n0;const L=myAnimals('boi').slice(0,3);L.forEach(a=>{const q=randIn('p3');a.x=q[0];a.y=q[1];a.area='p3'});for(let i=0;i<10;i++)S.animals.push(mkAnimal('boi','nelore',{own:'player'}));S.land.piquetes=true;const R0=Math.random;Math.random=()=>0.01;riskDay();Math.random=R0");
ok('roubo de gado à noite tira cabeças de pasto longe',await E("(S.stats.roubos||0)>=1"));
await E("const a=mkAnimal('boi','nelore',{own:'player'});a.hp=4;S.animals.push(a);window.__d=a;deathCheck(a)");ok('animal muito fraco: aviso no primeiro dia',await E("S.animals.includes(__d)&&__d._dying===1"));
await E("deathCheck(__d)");ok('segundo dia sem cuidado: morre',await E("!S.animals.includes(__d)&&S.stats.mortes===1"));
// histórias dos moradores
ok('7 histórias novas no motor de missões',await E("CHAINS.length>=6&&CHAINS.every(q=>QBY[q.id])"));
await E("qState('q4').s='done';qRefresh();qState('c_bene1').s='active';S.stats.aboios=20;questTick(1)");ok('etapa automática (aboiar 15 vezes) avança sozinha',await E("qState('c_bene1').step===1"));
// casamento
await E("S.npcs.joana=S.npcs.joana||npcState('joana');npcState('joana').fr=950;S.cash=5000");ok('casamento: botão de pedido com 9 corações',await E("/Pedir em casamento/.test(marBtns('joana'))"));
await E("A.marAsk('joana')");ok('pedido aceito e casamento marcado no domingo',await E("S.mar&&S.mar.sp==='joana'&&S.mar.day%7===0&&S.cash===3800"));
await E("S.day=S.mar.day;marDay()");ok('casou na Matriz',await E("S.mar.wed===true"));
await E("TROUGHS.forEach((t,i)=>{if(t.a==='p1'&&t.k==='agua')S.tr[i]=0});S.day++;marDay()");ok('cônjuge enche os bebedouros de manhã',await E("TROUGHS.some((t,i)=>t.a==='p1'&&t.k==='agua'&&S.tr[i]>=trCap(i))"));
// laço com mira
await E("const a=S.animals.find(x=>x.own==='player'&&x.sp==='boi');P.x=a.x+20;P.y=a.y;P._act=null;lasso.t=null;LZ.on=false;doLasso();window.__lt=a");ok('primeiro toque gira o laço (mira)',await E("LZ.on&&!lasso.t"));
await E("LZ.t0=drawT-(0.9/1.25);doLasso()");ok('toque na hora certa laça',await E("lasso.t===LZ.t||!!lasso.t"));
await E("lasso.t=null;doLasso();LZ.t0=drawT-0.05;doLasso()");ok('toque fora da hora erra',await E("!lasso.t&&!LZ.on"));
await E("const g={own:'abilio'};S.pega=null;window.__w=pegaSpawn();P.x=__w.x+20;P.y=__w.y;LZ.on=false;lasso.t=null;doLasso()");ok('dá para laçar o barbatão (antes era impossível)',await E("LZ.on&&LZ.t===__w"));await E("LZ.on=false");
// notícias, desafio, catálogo, foto, menu
await E("morningNews()");await p.waitForTimeout(300);ok('notícias da manhã ao acordar',await E("/Notícias da manhã/.test(document.body.innerText)&&/Desafio da semana/.test(document.body.innerText)"));await p.screenshot({path:EV+'noticias-manha.png'});await E("closeModal()");
await E("const c=wkS();c.got=0;c.done=false;c.i=1;c.need=2;wkEvent('cook','queijo',1);wkEvent('cook','queijo',1)");ok('desafio da semana cumprido paga prêmio',await E("wkS().done"));
ok('catálogo de raças na Coleção',await E("/Catálogo de raças/.test(catalogHTML())&&/Nelore/i.test(catalogHTML())"));
await E("A.farmPhoto()");await p.waitForTimeout(400);ok('foto da fazenda com moldura',await E("/Foto da fazenda/.test(document.body.innerText)"));await E("closeModal()");
ok('botão "O que fazer?" na barra',await E("!!document.getElementById('bdia')"));
await E("openMenu('dia')");await p.waitForTimeout(300);await p.screenshot({path:EV+'diario-heranca.png'});await E("closeModal()");
await E("SAVE.save('manual')");await p.waitForTimeout(300);await E("SAVE.loadBest(SAVE.slot)");await p.waitForTimeout(1000);ok("tudo salvo (capítulo, casamento, desafio)",await E("herS().ch>=2&&S.mar&&S.mar.wed&&wkS().done"),await E("JSON.stringify({ch:herS().ch,mar:S.mar,wk:wkS()})"));
console.log(R.join('\n'));console.log([...new Set(errs)].join('\n')||'sem erros');await b.close();})();
