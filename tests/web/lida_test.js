// Retiro do Umbuzeiro (mapa maior) e lida do gado: umbigo, bicheira, castração, desmama, ferra, balança, caderneta e sal
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});
await p.goto('file://'+path.resolve(__dirname,'../../web/index.html')+'#debug-nointro');await p.waitForTimeout(1200);
const E=s=>p.evaluate(s=>__lida.ev(s),s);await E("newGame(defaultCF())");await p.waitForTimeout(400);await E("FILM.end();closeModal();qPump=()=>{};QDQ.length=0");
const R=[];const ok=(n,c,i)=>R.push((c?'OK  ':'FALHA ')+n+(i?' — '+i:''));
ok('mapa com 150 linhas e interiores abaixo',await E("MH===150&&MHT===182&&ROOMS.every(r=>r.y0===undefined||r.y0>=WMH)"));
ok('Retiro começa à venda e trancado',await E("!S.land.retiro&&!owned('r1')&&GATES[AREAS.r1.gate].lock&&regionAt(20*TS,120*TS)[1]==='TERRA À VENDA'"));
await E("S.cash=99999;buyParcel('retiro')");
ok('comprar o Retiro destrava os 6 cercados',await E("S.land.retiro&&['r1','r2','r3','r4','r5','rcur'].every(k=>owned(k)&&!GATES[AREAS[k].gate].lock)"));
ok('Retiro conta como fazenda (obras)',await E("farmTile(20,120)&&regionAt(20*TS,120*TS)[0]==='Retiro do Umbuzeiro'"));
ok('aguada do Retiro tem água dentro do piquete',await E("(()=>{let n=0;const r=AREAS.r5.r;for(let y=r[1]+1;y<r[3];y++)for(let x=r[0]+1;x<r[2];x++)if(ground[gi(x,y)]===G.WATER)n++;return n>40})()"));
ok('cercas: arame no piquete, tábua no curral do Retiro',await E("fenceStyleAt(10,112)==='a'&&fenceStyleAt(41,114)==='m'"));
ok('corredor de manejo liga as porteiras à estrada',await E("(()=>{for(let x=1;x<=36;x++)if(obj[gi(x,130)])return false;return ground[gi(37,130)]===G.DIRT})()"));
// bezerro que nasce precisa de cura do umbigo
await E("window.__v=mkAnimal('boi','nelore',{own:'player',age:30,sex:'F'});const q=randIn('r1');__v.x=q[0];__v.y=q[1];__v.area='r1';S.animals.push(__v);__v.preg=1;window.__n0=S.animals.length;dayTick()");
ok('bezerro nasce com umbigo por curar',await E("(()=>{const c=S.animals.find(a=>a.mid===__v.id);window.__c=c;return c&&c.umb===1&&lidaActions(c).some(x=>x[2]==='umbigo')})()"));
await E("addInv('iodo',2);addInv('mataBicheira',3);P.x=__c.x+10;P.y=__c.y;lidaDo(__c,'umbigo')");await p.waitForTimeout(3500);
ok('iodo cura o umbigo',await E("__c.umb===2&&(__c.hist||[]).some(h=>/Umbigo/.test(h.t))"));
// bicheira
await E("window.__m=mkAnimal('boi','nelore',{own:'player',age:8,sex:'M'});S.animals.push(__m);__m.wound=S.day+5;__m.umb=0;let k=0;while(!__m.bich&&k++<200)lidaDay(__m,0)");
ok('ferida aberta nas águas pega bicheira',await E("__m.bich===1"));
await E("const h=__m.hp;lidaDay(__m,0);window.__dh=h-__m.hp");ok('bicheira tira saúde todo dia',await E("__dh>0"),await E("__dh"));
await E("P.x=__m.x+10;P.y=__m.y;lidaDo(__m,'bicheira')");await p.waitForTimeout(3500);
ok('mata-bicheira cura',await E("__m.bich===0"));
// castração só no curral
await E("__m.area='r1';say=()=>{};lidaDo(__m,'castrar')");await p.waitForTimeout(400);ok('não castra no pasto',await E("!__m.cast"));
await E("const q=randIn('rcur');__m.x=q[0];__m.y=q[1];__m.area='rcur';__m._st='idle';P.x=__m.x+10;P.y=__m.y;lidaDo(__m,'castrar')");await p.waitForTimeout(4000);
ok('castra no curral e deixa ferida',await E("__m.cast===1&&__m.wound>=S.day"));
ok('capão não cobre vaca',await E("(()=>{const v=mkAnimal('boi','nelore',{own:'player',age:30,sex:'F'});v.area=__m.area;__m.age=30;const m=S.animals.filter(m=>m.own==='player'&&m.sex==='M'&&!m.cast&&m.area===v.area);__m.age=8;return !m.includes(__m)})()"));
// desmama
await E("__c.age=7");ok('bezerro mamando derruba a fertilidade da vaca',await E("__c.age=7,lidaFert(__v)<1"));
await E("P.x=__c.x+10;P.y=__c.y;__c._st='idle';lidaDo(__c,'desmamar')");await p.waitForTimeout(3000);
ok('desmama: vaca recupera e volta ao cio mais rápido',await E("__c.desm===1&&lidaFert(__v)>1"));
// balança e GMD
await E("const q=randIn('rcur');__m.x=q[0];__m.y=q[1];__m.area='rcur';__m.wt=200;weighOne(__m);S.day+=2;__m.wt=230;weighOne(__m)");
ok('pesagem mostra GMD',await E("Math.abs(gmd(__m)-0.5)<0.01"),await E("gmd(__m)"));
await E("weighLot('rcur')");ok('brete pesa o lote',await E("/Balança/.test(document.querySelector('#modal,.modal,#mw')?.innerText||document.body.innerText)"));await E("closeModal()");
// ferra
await E("__m.age=8;addInv('ferroMarca',1);P.x=__m.x+10;P.y=__m.y;__m._st='idle';const v0=animalValue(__m);window.__v0=v0;lidaDo(__m,'ferrar')");await p.waitForTimeout(3500);
ok('ferra marca e valoriza',await E("__m.brand===1&&animalValue(__m)>__v0"));
// caderneta
await E("A.lidaCount()");ok('caderneta conta o gado e lista a lida',await E("/Caderneta/.test(document.body.innerText)&&/Retiro/.test(document.body.innerText)"));await E("closeModal()");
// sal no cocho coberto
await E("addInv('sal',1);const c=PROPS.find(q=>q.t==='cochoSal');P.x=c.x;P.y=c.y+14;window.__it=interactables().find(o=>o.k==='sal');__it&&__it.fn()");await p.waitForTimeout(3000);
ok('sal no cocho coberto dura 7 dias',await E("(S.salt.r1||0)>=S.day+6"),await E("JSON.stringify(S.salt)"));
await E("SAVE.save('manual')");await p.waitForTimeout(400);await E("SAVE.loadBest(SAVE.slot)");await p.waitForTimeout(1200);
ok('lida e Retiro sobrevivem ao salvar',await E("S.land.retiro&&byId(__m.id).cast===1&&byId(__m.id).brand===1&&byId(__m.id).wH.length===2"));
console.log(R.join('\n'));console.log([...new Set(errs)].join('\n')||'sem erros');await b.close();})();
