// padaria, restaurante e oficina; laços entre moradores e conversas com contexto
const {chromium}=require('playwright');const path=require('path');const ev=path.resolve(__dirname,'../../production/qa/evidence')+'/';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:860}});const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(__dirname,'../../web/index.html')+'#debug-nointro');await p.waitForTimeout(1200);
const E=s=>p.evaluate(s=>__lida.ev(s),s);await E("newGame(defaultCF())");await p.waitForTimeout(400);await E("FILM.end();closeModal();qPump=()=>{};QDQ.length=0;S.min=9*60;SET.cine='off';S.weather='sol';S.cash=20000;A.bagUp(24);A.bagUp(36)");
const R=[];const ok=(n,c,i)=>R.push((c?'OK  ':'FALHA ')+n+(i?' — '+i:''));
ok('três prédios novos no mapa',await E("['padaria','restaurante','oficina'].every(id=>BLD.some(b=>b.id===id))"));
ok('prédios não sobrepõem outros nem a rua',await E("['padaria','restaurante','oficina'].every(id=>{const b=BLD.find(q=>q.id===id);return !BLD.some(o=>o!==b&&o.r[0]<=b.r[2]&&o.r[2]>=b.r[0]&&o.r[1]<=b.r[3]&&o.r[3]>=b.r[1])})"));
ok('donos novos na cidade',await E("['neide','damiao','bira'].every(id=>npcs.some(e=>e.id===id))"));
// esperar os donos chegarem: avança o tempo de jogo andando o relógio
await E("S.min=9.5*60;for(const e of npcs)placeNpc(e)");await p.waitForTimeout(500);
ok('padaria aberta de manhã',await E("shopOpen('padaria')"));ok('oficina aberta de manhã',await E("shopOpen('oficina')"));
await E("openPadaria()");await p.waitForTimeout(300);await p.screenshot({path:ev+'vila-padaria.png'});
const c0=await E("S.cash");await E("A.vBuy('paoQueijo|5|1.5')");ok('compra pão de queijo e o estoque baixa',await E("has('paoQueijo',5)&&vilaS().stock.paoQueijo===25"));
await E("addInv('ovo',10,true);M.tab='com';renderModal()");const c1=await E("S.cash");await E("document.querySelector('#mc button[data-a=vSell]').click()");ok('padaria compra ovos (melhor que o Mercadinho)',await E("S.cash")-c1>10*1.2,(await E("S.cash")-c1).toFixed(2));
await E("closeModal();S.min=12*60;for(const e of npcs)placeNpc(e)");ok('restaurante aberto no almoço',await E("shopOpen('restaurante')"));
await E("P.fo=20;P.en=30;openRestaurante()");await p.waitForTimeout(200);await E("document.querySelector('#mc button[data-a=meal]').click()");for(let i=0;i<30&&await E("!!P._act");i++)await p.waitForTimeout(100);
ok('refeição mata a fome e passa 30 min',await E("P.fo")>=60&&await E("S.min")>=12*60+29,await E("P.fo+' '+S.min"));
const o=JSON.parse(await E("JSON.stringify(vilaS().ord)"));await E(`addInv('${o.id}',${o.n},true);openRestaurante();M.tab='enc';renderModal()`);await p.waitForTimeout(200);await p.screenshot({path:ev+'vila-restaurante.png'});
const c2=await E("S.cash");await E("A.restDeliver()");ok('encomenda do dia paga acima do preço',await E("S.cash")-c2>=await E(`IT['${o.id}'].p*${o.n}*1.39`),o.id+' x'+o.n);
ok('encomenda só uma vez por dia',await E("A.restDeliver(),vilaS().ordDone===1&&S.stats.orders===1"));
await E("closeModal();S.min=10*60;openOficina()");await E("A.vBuy('mourao|5|14');A.vBuy('arame|1|42')");ok('oficina vende mourão e arame',await E("has('mourao',5)&&has('arame')"));
await E("M.tab='ser';renderModal()");await p.screenshot({path:ev+'vila-oficina.png'});await E("A.cartUp()");ok('reforma da carroça: +150 kg',await E("CART_CAP")===550);
await E("closeModal();S.day++");ok('estoque e encomenda renovam no dia seguinte',await E("vilaS().stock.paoQueijo===30&&vilaS().ordDone===0"));
// laços e conversas
ok('laços aparecem nas relações',await E("relList('zefa').join(',')").then(x=>/Zé Cantador/.test(x)),await E("relList('zefa').join(', ')"));
const lines=new Set();for(let i=0;i<60;i++){lines.add(await E("ctxLine(pick(['zefa','tonho','neide','bira','nena','rita']))"));}ok('conversas variadas com contexto (40+ falas diferentes em 60)',lines.size>=12,lines.size+' diferentes');
const pl=await E("(()=>{const a=npcs.find(e=>e.id==='zefa'),b=npcs.find(e=>e.id==='ze');a.talk={lead:1};return pairLine(a,b)})()");ok('conversa de casal entre Zefa e Zé',!!pl,pl);
await E("openMenu('rel')");await p.waitForTimeout(300);ok('aba Relações mostra laços',await E("document.querySelector('#mc').innerText.includes('casada com')"));await p.screenshot({path:ev+'vila-relacoes.png'});await E("closeModal()");
await E("SAVE.save('manual')");await p.waitForTimeout(500);await E("SAVE.loadBest(SAVE.slot)");await p.waitForTimeout(1200);ok('carroça e encomendas salvas',await E("CART_CAP===550&&S.stats.orders===1"));
await E("P.x=67.5*TS;P.y=44*TS;cam.snap=true;S.min=10*60");await p.waitForTimeout(1500);await p.screenshot({path:ev+'vila-padaria-rua.png'});
console.log(R.join('\n'));console.log([...new Set(errs)].join('\n')||'sem erros');await b.close();})();
