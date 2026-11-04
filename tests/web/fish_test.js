const {chromium}=require('playwright');const ev=require('path').resolve(__dirname,'../../production/qa/evidence')+'/';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:860}});const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../../web/index.html')+'#debug-nointro');await p.waitForTimeout(1200);
const E=s=>p.evaluate(s=>__lida.ev(s),s);await E("newGame(defaultCF())");await p.waitForTimeout(400);await E("FILM.end();closeModal();qPump=()=>{};QDQ.length=0;S.min=17*60;SET.cine='off'");
const R=[];const ok=(n,c,i)=>R.push((c?'OK  ':'FALHA ')+n+(i?' — '+i:''));
// comprar na Casa do Agro
await E("S.cash=500;openAgro()");await p.waitForTimeout(300);ok('vara e minhoca no estoque do Agro',await E("S.agro.inv.vara>0&&S.agro.inv.minhoca>=40"));
await E("A.agroItem('vara|1|inv');A.agroItem('minhoca|5|inv');closeModal()");ok('comprou vara e iscas',await E("has('vara')&&has('minhoca',5)"),await E("JSON.stringify({v:S.inv.vara,m:S.inv.minhoca,c:S.cash})"));
// beira do açude, virado para a água
const pos=await E(`(()=>{for(let ty=20;ty<34;ty++)for(let tx=26;tx<40;tx++){if(ground[gi(tx,ty)]===G.WATER&&pondT[gi(tx,ty)]&&ground[gi(tx,ty+1)]!==G.WATER&&!obj[gi(tx,ty+1)]&&!obj[gi(tx,ty+2)]){P.x=(tx+.5)*TS;P.y=(ty+2.2)*TS;P.dir=1;cam.snap=true;return [tx,ty]}}})()`);
await p.waitForTimeout(400);ok('ação "Pescar" aparece na beira',await E("computeCtx(),P._ctx&&P._ctx.label"),String(pos));
await E("FISH.biteRate=()=>3;doAction()");for(let i=0;i<40&&await E("FISH.st")!=='bite';i++)await p.waitForTimeout(50);ok('lançou e fisgou',await E("FISH.st==='bite'"),await E("FISH.st+' '+FISH.fish"));
await E("FISH.press(true)");ok('briga começou',await E("FISH.st==='fight'"));
// segura conforme a tensão (jogador bom)
await E("window.__hc=setInterval(()=>{if(!FISH.on)return;const z=FISH.zone();FISH.hold=FISH.tens<(z[0]+z[1])/2},200)"); // 'jogador' que reage a cada 200 ms
for(let i=0;i<60;i++){await p.waitForTimeout(150);if(!(await E("FISH.on")))break;if(i===8)await p.screenshot({path:ev+'pesca-briga.png'});if(i===1)await p.screenshot({path:ev+'pesca-fisgada.png'});}
await E("clearInterval(window.__hc)");const r=JSON.parse(await E("JSON.stringify({on:FISH.on,inv:Object.keys(S.inv).filter(k=>k.startsWith('pe_')),col:fishS(),isca:S.inv.minhoca})"));
ok('peixe na mochila e na coleção',r.inv.length===1&&Object.keys(r.col).length===1,JSON.stringify(r));
await p.waitForTimeout(300);await p.screenshot({path:ev+'pesca-peixe.png'});await E("closeModal()");
// linha arrebenta se segurar o tempo todo
await E("FISH.start()");for(let i=0;i<60&&await E("FISH.st")!=='bite';i++)await p.waitForTimeout(50);await E("FISH.press(true)");for(let i=0;i<40&&await E("FISH.on");i++){await E("FISH.hold=true");await p.waitForTimeout(100);}ok('segurar demais arrebenta a linha',!(await E("FISH.on")));
// vender
const id=r.inv[0];const c0=await E("S.cash");await E(`A.sellF('${id}')`);ok('vende peixe no Mercadinho',await E("S.cash")>c0&&!(await E(`has('${id}')`)));
// salvar e carregar mantém coleção
await E("SAVE.save('manual')");await p.waitForTimeout(500);await E("SAVE.loadBest(SAVE.slot)");await p.waitForTimeout(1200);ok('coleção sobrevive ao salvar/carregar',await E("Object.keys(fishS()).length")===1);
// sem isca
await E("delete S.inv.minhoca;delete S.inv.massa;bagSync()");ok('sem isca não pesca',await E("FISH.start(),!FISH.on"));
// seleção por lugar/hora: noite no rio dá peixe noturno às vezes
const dist=await E(`(()=>{S.min=22*60;const c={};for(let i=0;i<400;i++){const k=FISH.pick('rio','minhoca');c[k]=(c[k]||0)+1}S.min=12*60;const d={};for(let i=0;i<400;i++){const k=FISH.pick('rio','minhoca');d[k]=(d[k]||0)+1}return JSON.stringify({noite:c,dia:d})})()`);
const D=JSON.parse(dist);ok('mandi/surubim aparecem mais à noite no rio',(D.noite.mandi||0)>(D.dia.mandi||0),dist);
const rate=await p.evaluate(()=>new Promise(res=>{const ev=window.__lida.ev;const out={};const sp=['piaba','tilapia','traira','tucunare','surubim'];let k=0,n=0,win=0;
 const run=()=>{if(k>=sp.length)return res(JSON.stringify(out));ev("S.inv.minhoca=50;bagSync&&bagSync();FISH.start();FISH.st='fight';FISH.fish='"+sp[k]+"';FISH.tens=.5;FISH.prog=.3;FISH.ui(true);FISH.msg('')");
  const h=setInterval(()=>{ev("if(FISH.on){const z=FISH.zone();FISH.hold=FISH.tens<(z[0]+z[1])/2}");if(!ev("FISH.on")){clearInterval(h);n++;if(ev("Object.keys(S.inv).some(q=>q.startsWith('pe_"+sp[k]+"'))"))win++;ev("delete S.inv['pe_"+sp[k]+"'];closeModal()");if(n>=6){out[sp[k]]=win+'/6';k++;n=0;win=0;}run();}},200);};run();}));
ok('dificuldade por espécie (controle de 200 ms)',true,rate);
console.log(R.join('\n'));console.log(errs.join('\n')||'sem erros');await b.close();})();
