// compras chegam num curral que é seu; animais presos em cercado alheio são resgatados; abertura entra pela porteira
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});
await p.goto('file://'+path.resolve(__dirname,'../../web/index.html')+'#debug-nointro');await p.waitForTimeout(1200);
const E=s=>p.evaluate(s=>__lida.ev(s),s);await E("newGame(defaultCF())");await p.waitForTimeout(400);await E("FILM.end();closeModal();qPump=()=>{};QDQ.length=0");
const R=[];const ok=(n,c,i)=>R.push((c?'OK  ':'FALHA ')+n+(i?' — '+i:''));
ok('jogo novo: Recebimento ainda não é seu',!(await E("owned('receb')")));
await E("const a=mkAnimal('boi','nelore',{own:'delivery',age:8,sex:'M'});a.x=a.y=-999;S.animals.push(a);S.delivery.push({id:a.id,day:S.day,to:'receb'});window.__b=a.id;deliveries()");
ok('bezerro comprado chega no seu curral',await E("areaAt(byId(__b).x,byId(__b).y)")==='curral',await E("areaAt(byId(__b).x,byId(__b).y)"));
ok('porteira do curral abre',await E("(()=>{const g=GATES[AREAS.curral.gate];return !g.lock})()"));
await E("const q=randIn('receb');const a=byId(__b);a.x=q[0];a.y=q[1];SAVE.save('manual')");await p.waitForTimeout(500);await E("SAVE.loadBest(SAVE.slot)");await p.waitForTimeout(1200);
ok('animal preso no Recebimento alheio é levado ao curral ao carregar',await E("areaAt(byId(__b).x,byId(__b).y)")==='curral');
await E("S.land.leste=true;applyLand()");ok('com o Curral Grande comprado, entrega vai ao Recebimento',await E("ownDest('receb',byId(__b))")==='receb');
ok('Agro tem lote de bezerros mais barato que o valor',await E("(()=>{S.agro=null;agroRestock();const c=S.agro.list.filter(a=>a.sp==='boi'&&a.age<12);return c.length>=6&&c.every(a=>agroAnimalPrice(a)<animalValue(a)*1.05)})()"));
ok('bezerro valoriza ao engordar (sem queda aos 12 dias)',await E("(()=>{const a=mkAnimal('boi','nelore',{own:'player',age:10,sex:'M'});a.wt=170;const v0=animalValue(a);a.age=13;a.wt=190;return animalValue(a)>v0})()"));
console.log(R.join('\n'));console.log([...new Set(errs)].join('\n')||'sem erros');await b.close();})();
