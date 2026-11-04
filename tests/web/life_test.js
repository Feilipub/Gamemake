const {chromium}=require('playwright');const ev=require('path').resolve(__dirname,'../../production/qa/evidence')+'/';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:860}});const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../../web/index.html')+'#debug-nointro');await p.waitForTimeout(1200);
const E=s=>p.evaluate(s=>__lida.ev(s),s);await E("newGame(defaultCF())");await p.waitForTimeout(400);await E("FILM.end();closeModal();qPump=()=>{};QDQ.length=0;S.min=10*60;SET.cine='off';S.weather='sol'");
const R=[];const ok=(n,c,i)=>R.push((c?'OK  ':'FALHA ')+n+(i?' — '+i:''));
ok('lugares dos gatos são andáveis',await E("CAT_SPOTS.every(([x,y])=>!boxHit(x*TS,y*TS,[3,2,1],'a'))"),await E("JSON.stringify(CAT_SPOTS.filter(([x,y])=>boxHit(x*TS,y*TS,[3,2,1],'a')))"));
await E("P.x=10*TS;P.y=32*TS;cam.snap=true");await p.waitForTimeout(5000);
ok('borboletas voando de dia',await E("LIFE.bf.length")>0,await E("LIFE.bf.length"));
ok('patos no açude',await E("LIFE.ducks.every(d=>waterKind(Math.floor(d.x/TS),Math.floor(d.y/TS))==='acude')"));
ok('gatos com rotina',await E("catsS().every(c=>c.x!==undefined&&c.st)"),await E("JSON.stringify(catsS().map(c=>[c.n,c.st,Math.round(c.x/TS),Math.round(c.y/TS)]))"));
await p.screenshot({path:ev+'vida-fazenda.png'});
// carinho e peixe
await E("const c=catsS()[0];c.st='sleep';c.t=99;P.x=c.x+10;P.y=c.y+4;cam.snap=true");await p.waitForTimeout(300);let l=await E("computeCtx(),P._ctx&&P._ctx.label");ok('carinho no gato',/Carinho/.test(l||''),l);
await E("doAction()");await p.waitForTimeout(1600);ok('carinho aumenta afeto',await E("catsS()[0].aff")>2);
await E("addInv('pe_piaba',1,true)");await p.waitForTimeout(200);l=await E("computeCtx(),P._ctx&&P._ctx.label");ok('dar peixe ao gato',/peixe/.test(l||''),l);await E("doAction()");await p.waitForTimeout(1500);ok('peixe some da mochila e afeto sobe',!(await E("has('pe_piaba')"))&&await E("catsS()[0].aff")>=4.5,await E("catsS()[0].aff"));
// noite: sapos na beira d'água
await E("S.min=21*60;P.x=31*TS;P.y=30*TS;cam.snap=true;LIFE.frogs.length=0");await p.waitForTimeout(6000);ok('sapos na beira da água à noite',await E("LIFE.frogs.length")>0,await E("LIFE.frogs.length"));
ok('sem borboletas à noite',await E("LIFE.bf.length")===0);
await p.screenshot({path:ev+'vida-noite.png'});
await E("SAVE.save('manual')");await p.waitForTimeout(500);await E("SAVE.loadBest(SAVE.slot)");await p.waitForTimeout(1200);ok('afeto dos gatos salvo',await E("catsS()[0].aff")>=4.5);
console.log(R.join('\n'));console.log(errs.join('\n')||'sem erros');await b.close();})();
