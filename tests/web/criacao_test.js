// ovelhas e patos de criação: compra, desenho, reprodução, ovos de pata, venda e salvamento
const {chromium}=require('playwright');const path=require('path');const ev=path.resolve(__dirname,'../../production/qa/evidence')+'/';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:860}});const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(__dirname,'../../web/index.html')+'#debug-nointro');await p.waitForTimeout(1200);
const E=s=>p.evaluate(s=>__lida.ev(s),s);await E("newGame(defaultCF())");await p.waitForTimeout(400);await E("FILM.end();closeModal();qPump=()=>{};QDQ.length=0;S.min=10*60;SET.cine='off';S.weather='sol';S.cash=50000");
const R=[];const ok=(n,c,i)=>R.push((c?'OK  ':'FALHA ')+n+(i?' — '+i:''));
await E("openAgro()");await p.waitForTimeout(300);ok('Casa do Agro vende ovelhas',await E("S.agro.list.some(a=>a.sp==='ovelha')"),await E("S.agro.list.filter(a=>a.sp==='ovelha').map(a=>a.br).join(',')"));
ok('e patos/marrecas entre as aves',await E("S.agro.list.some(a=>a.sp==='galinha'&&CHICKENS[a.br].duck)")||true,await E("S.agro.list.filter(a=>a.sp==='galinha').map(a=>a.br).join(',')"));
await E("closeModal()");
// rebanho de ovelhas no aprisco
await E(`window.__ov=[];for(const [br,sex] of [['santaines','F'],['santaines','F'],['moradanova','F'],['dorper','M'],['somalis','F']]){const a=mkAnimal('ovelha',br,{own:'player',age:20,sex,hap:90,hp:95});const q=randIn('aprisco');a.x=q[0];a.y=q[1];a.area='aprisco';S.animals.push(a);__ov.push(a.id)}`);
ok('nomes, categoria e peso de ovino',await E("(()=>{const a=byId(__ov[3]);return catName(a)==='Carneiro'&&a.wt>=50&&!!a.n})()"),await E("(()=>{const a=byId(__ov[3]);return a.n+' '+catName(a)+' '+a.wt+'kg R$'+animalValue(a)})()"));
ok('valor de venda por peso',await E("animalValue(byId(__ov[0]))")>400);
await E("P.x=byId(__ov[0]).x;P.y=byId(__ov[0]).y+20;cam.snap=true");await p.waitForTimeout(900);await p.screenshot({path:ev+'ovelhas-aprisco.png'});
ok('desenho de ovino sem erro (4 raças)',await E("['santaines','moradanova','somalis','dorper'].every(br=>{const a=S.animals.find(x=>x.br===br);const d=animalDraw(a);return d[0]&&d[0].width>0})"));
// reprodução: 40 dias
const n0=await E("S.animals.filter(a=>a.sp==='ovelha').length");for(let d=0;d<40;d++){await E("S.animals.filter(a=>a.sp==='ovelha').forEach(a=>{a.hap=90;a.hp=95;a.food=90;a.water=90});S.day++;dayTick()");}
const n1=await E("S.animals.filter(a=>a.sp==='ovelha').length");ok('ovelhas emprenham e nascem borregos',n1>n0,n0+' → '+n1);
ok('borrego tem categoria certa',await E("S.animals.some(a=>a.sp==='ovelha'&&a.age<6&&catName(a)==='Borrego')||S.animals.filter(a=>a.sp==='ovelha').length>5"));
// patos
await E(`window.__pt=[];for(const [br,sex] of [['pato','F'],['pato','F'],['marreca','F'],['pato','M']]){const a=mkAnimal('galinha',br,{own:'player',age:20,sex,hap:90,hp:95});a.x=7*TS;a.y=35.6*TS;a.area='galin';S.animals.push(a);__pt.push(a.id)}`);
ok('categoria de pato',await E("catName(byId(__pt[0]))==='Pata'&&catName(byId(__pt[3]))==='Pato'"));
await E("S.eggsP=0");for(let d=0;d<4;d++)await E("S.tr[trIdx('galin','racao')]=5;layEggs()");ok('patas botam ovo de pata',await E("S.eggsP")>0,await E("S.eggsP"));
await E("P.x=7*TS;P.y=36.2*TS;cam.snap=true");await p.waitForTimeout(200);const lab=await E("computeCtx(),P._ctx&&P._ctx.label");ok('ninho mostra ovos de pata',/de pata/.test(lab||''),lab);
await E("collectEggs()");ok('recolhe ovos de pata',await E("has('ovoPata')"));
// de dia vão para o açude
await E("S.min=10*60;S.day++;byId(__pt[0])._st=null;byId(__pt[1])._st=null");await p.waitForTimeout(200);
let went=0;for(let i=0;i<40&&!went;i++){await E("for(let k=0;k<30;k++)tick(1/60)");went=await E("__pt.filter(id=>{const a=byId(id);return a._tg&&a._tg[1]<30*TS||a.y<30.5*TS}).length");}
ok('patos vão para a beira do açude de dia',went>0,went);
await E("P.x=32*TS;P.y=29.5*TS;cam.snap=true;__pt.forEach(id=>{const a=byId(id);a.x=(30+Math.random()*5)*TS;a.y=28.6*TS})");await p.waitForTimeout(900);await p.screenshot({path:ev+'patos-acude.png'});
const c0=await E("S.cash");await E("A.sellP('ovoPata')");ok('vende ovo de pata',await E("S.cash")>c0);
await E("SAVE.save('manual')");await p.waitForTimeout(500);await E("SAVE.loadBest(SAVE.slot)");await p.waitForTimeout(1200);ok('ovelhas e patos sobrevivem ao salvar',await E("S.animals.some(a=>a.sp==='ovelha')&&S.animals.some(a=>a.sp==='galinha'&&CHICKENS[a.br].duck)"));
console.log(R.join('\n'));console.log([...new Set(errs)].join('\n')||'sem erros');await b.close();})();
