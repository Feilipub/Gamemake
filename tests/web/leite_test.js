// ordenha de vaca na mão e laticínios no fogão (queijo coalho, requeijão, manteiga de garrafa, doce de leite)
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});
await p.goto('file://'+path.resolve(__dirname,'../../web/index.html')+'#debug-nointro');await p.waitForTimeout(1200);
const E=s=>p.evaluate(s=>__lida.ev(s),s);await E("newGame(defaultCF())");await p.waitForTimeout(400);await E("FILM.end();closeModal();qPump=()=>{};QDQ.length=0");
const R=[];const ok=(n,c,i)=>R.push((c?'OK  ':'FALHA ')+n+(i?' — '+i:''));
await E("window.__v=mkAnimal('boi','girolando',{own:'player',age:30,sex:'F'});const q=randIn('curral');__v.x=q[0];__v.y=q[1];__v.area='curral';__v.lact=10;__v.hap=80;__v.food=80;S.animals.push(__v);S.inv.leite=0");
ok('vaca em lactação tem Ordenhar na ficha',await E("sheetActions(__v).includes('milkCow')"));
await E("P.x=__v.x+12;P.y=__v.y;__v._st='idle';SH.a=__v;A.sa('milkCow')");await p.waitForTimeout(4000);
const L1=await E("S.inv.leite||0");ok('ordenha dá leite (girolando)',L1>=8,L1);
await E("A.sa('milkCow')");await p.waitForTimeout(3000);ok('só uma ordenha por dia',await E("(S.inv.leite||0)")===L1);
await E("const c=mkAnimal('boi','girolando',{own:'player',age:2});c.mid=__v.id;S.animals.push(c);__v.milkD=0");await E("A.sa('milkCow')");await p.waitForTimeout(4000);
const L2=await E("S.inv.leite")-L1;ok('com bezerro ao pé sai a metade',L2>0&&L2<=Math.ceil(L1/2)+1,L2+' de '+L1);
ok('receitas de laticínios no fogão',await E("['queijo','requeijao','manteiga','doceLeite'].every(k=>RECIPES.some(r=>r.id===k)&&IT[k])"));
ok('queijo vale mais que o leite que gasta',await E("IT.queijo.p>IT.leite.p*5&&IT.requeijao.p>IT.leite.p*6&&IT.manteiga.p>IT.leite.p*8"));
await E("S.inv.leite=10;addInv('lenha',2,true);closeModal();A.cook('queijo')");await p.waitForTimeout(3000);
ok('fogão transforma leite em queijo coalho',await E("(S.inv.queijo||0)>=3&&S.inv.leite===5"),await E("JSON.stringify({q:S.inv.queijo,l:S.inv.leite})"));
console.log(R.join('\n'));console.log([...new Set(errs)].join('\n')||'sem erros');await b.close();})();
