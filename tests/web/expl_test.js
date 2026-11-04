const {chromium}=require('playwright');const ev=require('path').resolve(__dirname,'../../production/qa/evidence')+'/';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:860}});const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../../web/index.html')+'#debug-nointro');await p.waitForTimeout(1200);
const E=s=>p.evaluate(s=>__lida.ev(s),s);await E("newGame(defaultCF())");await p.waitForTimeout(400);await E("FILM.end();closeModal();qPump=()=>{};QDQ.length=0;S.min=9*60;SET.cine='off';S.weather='sol';A.bagUp&&(S.cash=20000,A.bagUp(24))");
const R=[];const ok=(n,c,i)=>R.push((c?'OK  ':'FALHA ')+n+(i?' — '+i:''));
const wait=async(ms)=>{for(let i=0;i<50&&await E("!!P._act");i++)await p.waitForTimeout(100);await p.waitForTimeout(ms||200);};
const goPOI=async k=>{await E(`P.x=POI.${k}.act[0]*TS;P.y=POI.${k}.act[1]*TS+4;cam.snap=true;computeCtx()`);await p.waitForTimeout(200);return E("P._ctx&&P._ctx.label");};
// todos os pontos são alcançáveis: andar até lá a partir de um vizinho livre sem colidir
ok('pontos de ação em chão livre',await E("Object.keys(POI).every(k=>{const [x,y]=POI[k].act;return !boxHit(x*TS,y*TS+4,HB.foot,'p')})"));
let l=await goPOI('cachoeira');ok('cachoeira oferece banho',/Banho/.test(l||''),l);await E("P.en=50;doAction()");await wait(600);ok('banho dá energia e a carta I',await E("P.en>=74&&!!relS().carta1"),await E("P.en"));
await p.screenshot({path:ev+'exploracao-carta.png'});await E("closeModal()");await E("doAction()");await wait();ok('banho só 1x por dia',await E("P.en")<100);
l=await goPOI('gruta');ok('gruta pede lampião',/Gruta/.test(l||''),l);await E("doAction()");await wait();ok('sem lampião não entra',!(await E("!!relS().carta2")));
await E("addInv('lampiao',1,true);doAction()");await wait(900);ok('com lampião: pinturas, carta II e fóssil',await E("!!relS().carta2&&!!relS().fossil"));await p.screenshot({path:ev+'exploracao-gruta.png'});await E("closeModal()");
l=await goPOI('tapera');ok('tapera para vasculhar',/tapera/i.test(l||''),l);await E("doAction()");await wait(500);ok('tapera dá a carta III',await E("!!relS().carta3"));await E("closeModal()");
l=await goPOI('mirante');ok('mirante oferece a vista',/vista/.test(l||''),l);await E("doAction()");await p.waitForTimeout(3000);await p.screenshot({path:ev+'exploracao-mirante.png'});await p.waitForTimeout(9000);ok('vista termina e dá a carta IV',await E("!CINE.on&&!!relS().carta4"));await E("closeModal()");
// relíquias soltas: todas em chão andável e coletáveis
const pos=await E("JSON.stringify(Object.keys(RELICS).filter(k=>RELICS[k].xy).map(k=>[k,!!relicPos(k)]))");ok('7 relíquias soltas com posição válida',JSON.parse(pos).every(q=>q[1]),pos);
let got=0;for(const k of JSON.parse(pos).map(q=>q[0])){await E(`{const q=relicPos('${k}');P.x=q.x;P.y=q.y+2;cam.snap=true}`);await p.waitForTimeout(150);const lab=await E("computeCtx(),P._ctx&&P._ctx.label");if(/brilhando/.test(lab||'')){await E("doAction()");await wait(300);await E("closeModal()");if(await E(`!!relS()['${k}']`))got++;}}
ok('coletou as 7 relíquias soltas',got===7,got+'/7');
// baú do avô
await E(`P.x=BAU_AVO.x*TS;P.y=BAU_AVO.y*TS+2;cam.snap=true`);await p.waitForTimeout(200);l=await E("computeCtx(),P._ctx&&P._ctx.label");ok('com as 4 cartas aparece o baú',/Cavar/.test(l||''),l);
const c0=await E("S.cash");await E("doAction()");await wait(600);ok('baú: R$ 3.000 e a medalha',await E("S.cash")-c0>=3000&&await E("has('medalhaAvo')"));await E("closeModal()");
// coleção no menu
await E("openMenu('col')");await p.waitForTimeout(400);ok('aba Coleção lista relíquias e peixes',await E("document.querySelector('#mc').innerText.includes('Relíquias')&&document.querySelector('#mc').innerText.includes('Peixes')"));await p.screenshot({path:ev+'colecao.png'});await E("closeModal()");
await E("SAVE.save('manual')");await p.waitForTimeout(500);await E("SAVE.loadBest(SAVE.slot)");await p.waitForTimeout(1200);ok('relíquias e baú sobrevivem ao salvar',await E("Object.keys(relS()).length===12&&!!poiS().bau"));
console.log(R.join('\n'));console.log(errs.join('\n')||'sem erros');await b.close();})();
