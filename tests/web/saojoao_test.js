// São João: arraiá nos sábados de junho e 23/24, quadrilha com marcador, correio elegante, pescaria e comidas típicas
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});
await p.goto('file://'+path.resolve(__dirname,'../../web/index.html')+'#debug-nointro');await p.waitForTimeout(1200);
const E=s=>p.evaluate(s=>__lida.ev(s),s);await E("newGame(defaultCF())");await p.waitForTimeout(400);await E("FILM.end();closeModal();qPump=()=>{};QDQ.length=0");
const R=[];const ok=(n,c,i)=>R.push((c?'OK  ':'FALHA ')+n+(i?' — '+i:''));
ok('arraiá em 23 e 24 de junho e nos sábados de junho',await E("(()=>{let n=0,d23=false;for(let d=0;d<400;d++){const c=calDate(d);if(c.m===5&&eventsOnDay(d).includes('junina')){n++;if(c.d===23)d23=true}}return n>=5&&d23})()"));
await E("(()=>{for(let d=S.day;d<S.day+400;d++){const c=calDate(d);if(c.m===5&&c.d===24){S.day=d;break}}S.min=20*60})()");
ok('a festa está acontecendo à noite',await E("eventNow('junina')==='junina'"));
await E("P.x=84*TS;P.y=50*TS;openEventDesk('junina')");ok('barracas com comidas típicas, correio elegante e pescaria',await E("['Pé de moleque','Cocada','Quentão','Correio elegante','Pescaria'].every(t=>document.body.innerText.includes(t))"));
await E("closeModal();A.evDance()");await p.waitForTimeout(300);ok('dançar abre a quadrilha com o marcador',await E("QD.on&&/O marcador grita/.test(document.body.innerText)"));
for(let i=0;i<12;i++){await E("QD.on&&A.quadPick(QD.seq[QD.i])");await p.waitForTimeout(80);}
ok('acertando tudo: melhor par do arraiá com prêmio',await E("!QD.on&&S.stats.quadWin===1&&/Melhor par/.test(document.body.innerText)"));
await E("closeModal();A.evDance()");ok('uma quadrilha por noite',await E("!QD.on"));
await E("S.cash=100;window.__n=npcs.find(e=>NPCDEF[e.id]);window.__f=(S.npcs[__n.id]||{}).fr||0;A.sjMail(__n.id)");ok('correio elegante aumenta a amizade',await E("((S.npcs[__n.id]||{}).fr||0)>__f&&S.cash===98"));
await E("const c=S.cash;window.__inv=JSON.stringify(S.inv);A.sjFish()");ok('pescaria de prendas dá um prêmio',await E("JSON.stringify(S.inv)!==__inv&&S.cash===95"));
console.log(R.join('\n'));console.log([...new Set(errs)].join('\n')||'sem erros');await b.close();})();
