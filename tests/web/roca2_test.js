const {chromium}=require('playwright');const ev=require('path').resolve(__dirname,'../../production/qa/evidence')+'/';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:860}});const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../../web/index.html')+'#debug-nointro');await p.waitForTimeout(1200);
const E=s=>p.evaluate(s=>__lida.ev(s),s);await E("newGame(defaultCF())");await p.waitForTimeout(400);await E("FILM.end();closeModal();qPump=()=>{};QDQ.length=0;S.min=8*60;SET.cine='off';S.weather='sol';S.cash=20000;A.bagUp(24);A.bagUp(36);addInv('regador',1,true);addInv('esterco',1,true)");
const R=[];const ok=(n,c,i)=>R.push((c?'OK  ':'FALHA ')+n+(i?' — '+i:''));
const wait=async()=>{for(let i=0;i<40&&await E("!!P._act");i++)await p.waitForTimeout(100);};
// plantar milho na leira 0 e feijão na 1, mandioca na 2
await E("P.x=ROCA_PLOTS[0].x;P.y=ROCA_PLOTS[0].y+6");for(const [i,k] of [[0,'milho'],[1,'feijao'],[2,'mandioca'],[3,'abobora'],[4,'cana']]){await E(`A.rocaPlant('${i}|${k}')`);await wait();}
ok('plantou 5 lavouras de comida',await E("rocaS().slice(0,5).every(q=>q.d!=null&&CROPS[q.c].food)"),await E("JSON.stringify(rocaS().slice(0,5).map(q=>q.c))"));
await E("A.rocaFert(0)");await wait();ok('adubou o milho com esterco',await E("rocaS()[0].ad===1&&!has('esterco')"));
// dias sem água: não cresce; regar faz crescer
await E("S.rained=-9;S.day++;rocaGrowTick()");ok('sem água não cresce',await E("rocaS()[0].g||0")===0);
for(let d=0;d<10;d++){await E("rocaS().slice(0,5).forEach(q=>q.w=S.day);S.day++;rocaGrowTick()");}
ok('regando todo dia o milho fica pronto',await E("rocaStage(0)")===3,await E("JSON.stringify(rocaS().slice(0,5).map(q=>[q.c,q.g]))"));
await p.waitForTimeout(300);await E("cam.snap=true;P.y=ROCA_PLOTS[0].y+30");await p.waitForTimeout(600);await p.screenshot({path:ev+'roca-comida.png'});
await E("rocaHarvest(0)");ok('colheu milho com adubo (9 espigas)',await E("S.inv.espiga")===9,await E("S.inv.espiga"));
ok('leira de comida fica vazia depois da colheita',await E("rocaS()[0].d===null"));
await E("rocaHarvest(2);rocaHarvest(4);rocaHarvest(3);rocaHarvest(1)");ok('colheu mandioca, cana, abóbora, feijão',await E("has('mandioca',6)&&has('cana',5)&&has('abobora',3)&&has('feijao',4)"),await E("JSON.stringify({m:S.inv.mandioca,c:S.inv.cana,a:S.inv.abobora,f:S.inv.feijao})"));
// seca mata a lavoura em 4 dias
await E("A.rocaPlant('5|feijao')");await wait();for(let d=0;d<4;d++)await E("S.rained=-9;S.day++;rocaGrowTick()");ok('4 dias sem água perde a lavoura',await E("rocaS()[5].d===null"));
// chuva rega sozinha
await E("A.rocaPlant('6|milho')");await wait();await E("S.rained=S.day;S.day++;rocaGrowTick()");ok('chuva faz crescer sem regar',await E("rocaS()[6].g")===1);
// cozinha: sem lenha não cozinha; com lenha faz farinha e tropeiro
ok('sem lenha não cozinha',await E("openStove(),!fuelId()"));await E("closeModal();addInv('lenha',6,true)");
await E("A.cook('farinha')");await wait();ok('farinha: gasta 3 mandioca e 1 lenha',await E("S.inv.farinha===2&&S.inv.mandioca===3&&S.inv.lenha===5"),await E("JSON.stringify({fa:S.inv.farinha,m:S.inv.mandioca,l:S.inv.lenha})"));
await E("A.cook('tropeiro')");await wait();ok('feijão tropeiro com feijão + farinha',await E("S.inv.tropeiro===1&&S.inv.farinha===1&&S.inv.feijao===3"));
await E("A.cook('rapadura')");await wait();await E("A.cook('doceAbobora')");await wait();ok('rapadura e doce de abóbora',await E("has('doceAbobora',2)"),await E("JSON.stringify({r:S.inv.rapadura,d:S.inv.doceAbobora,l:S.inv.lenha})"));
await E("openStove()");await p.waitForTimeout(400);await p.screenshot({path:ev+'cozinha-fogao.png'});await E("closeModal()");
// comer e vender
await E("P.fo=20");await E("A.eat('tropeiro')");await wait();ok('comer tropeiro mata a fome',await E("P.fo")>=55,await E("P.fo"));
const c0=await E("S.cash");await E("A.sellF('espiga')");ok('vende espigas no Mercadinho',await E("S.cash")>c0);
// salvar/carregar
await E("SAVE.save('manual')");await p.waitForTimeout(500);await E("SAVE.loadBest(SAVE.slot)");await p.waitForTimeout(1200);ok('roça e itens sobrevivem ao salvar',await E("rocaS()[6].c==='milho'&&rocaS()[6].g===1&&has('doceAbobora',2)"));
// forragem antiga continua funcionando
ok('forragem nativa continua igual (palma pela idade)',await E("(()=>{const q=rocaS()[7];q.c='palma';q.d=S.day-6;return rocaStage(7)===3})()"));
console.log(R.join('\n'));console.log(errs.join('\n')||'sem erros');await b.close();})();
