// habilidades do vaqueiro sobem com o uso (nível 0–10) e aparecem na ficha
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});
await p.goto('file://'+path.resolve(__dirname,'../../web/index.html')+'#debug-nointro');await p.waitForTimeout(1200);
const E=s=>p.evaluate(s=>__lida.ev(s),s);await E("newGame(defaultCF())");await p.waitForTimeout(400);await E("FILM.end();closeModal();qPump=()=>{};QDQ.length=0");
const R=[];const ok=(n,c,i)=>R.push((c?'OK  ':'FALHA ')+n+(i?' — '+i:''));
const b0=await E("JSON.stringify(Object.fromEntries(Object.keys(SKX).map(k=>[k,skill(k)])))");
ok('começa com a base da origem',await E("skill('lid')===(S.cf.sk.lid||0)&&skill('neg')===0"),b0);
await E("abCd=0;doAboio()");ok('aboiar dá experiência de lida',await E("S.cf.skx.lid>0"));
await E("skXp('lac',25)");ok('25 xp sobem um nível',await E("skLv('lac')===1"));
await E("skXp('lac',99999)");ok('teto no nível 10',await E("skill('lac')===10"));
await E("const a=S.animals.find(x=>x.own==='player'&&x.sp==='boi');P.x=a.x+12;P.y=a.y;a._st='idle';window.__p0=(S.cf.skx.pec||0);SH.a=a;A.sa('pet')");await p.waitForTimeout(2500);
ok('cuidar dos animais dá experiência de pecuária',await E("(S.cf.skx.pec||0)>__p0"));
ok('ficha mostra as 5 habilidades com barra',await E("(()=>{const h=menuTab('vaq');return ['Lida','Pecuária','Laço','Montaria','Negócio'].every(n=>h.includes(n))})()"));
await E("SAVE.save('manual')");await p.waitForTimeout(300);await E("SAVE.loadBest(SAVE.slot)");await p.waitForTimeout(1000);ok('experiência salva',await E("skill('lac')===10"));
console.log(R.join('\n'));console.log([...new Set(errs)].join('\n')||'sem erros');await b.close();})();
