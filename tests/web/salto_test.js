// salto a cavalo sobre cerca: aparece a ação galopando, atravessa, refuga às vezes, treina
const {chromium}=require('playwright');const path=require('path');const ev=path.resolve(__dirname,'../../production/qa/evidence')+'/';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:860}});const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(__dirname,'../../web/index.html')+'#debug-nointro');await p.waitForTimeout(1200);
const E=s=>p.evaluate(s=>__lida.ev(s),s);await E("newGame(defaultCF())");await p.waitForTimeout(400);await E("FILM.end();closeModal();qPump=()=>{};QDQ.length=0;S.min=10*60;SET.cine='off';S.weather='sol'");
const R=[];const ok=(n,c,i)=>R.push((c?'OK  ':'FALHA ')+n+(i?' — '+i:''));
// cerca vertical com chão livre dos dois lados (na fazenda)
const f=await E(`(()=>{for(let y=24;y<64;y++)for(let x=4;x<56;x++){if(obj[gi(x,y)]!==1)continue;let okk=true;for(const dx of [-3,-2,-1,1,2,3])for(const dy of [-1,0,1]){const i=gi(x+dx,y+dy);if(obj[i]||ground[i]===G.WATER)okk=false;}if(okk)return [x,y]}})()`);ok('acha cerca para saltar',!!f,String(f));
const SET=`const h=mainHorse();P.mnt=h.id;h._st='ridden';h._stam=100;P.x=(${f[0]}-2.2)*TS;P.y=(${f[1]}+0.5)*TS;h.x=P.x;h.y=P.y;P.dir=3;P._vx=48;P._vy=0;P._mv=48;cam.snap=true;`;await E(SET);
ok('ação "Saltar a cerca" galopando para a cerca',await E(SET+"computeCtx(),P._ctx&&P._ctx.label")==='🐎 Saltar a cerca',await E("P._ctx&&P._ctx.label"));
ok('parado não aparece',await E("(()=>{const v=[P._vx,P._mv];P._vx=0;P._mv=0;computeCtx();const l=P._ctx&&P._ctx.label;P._vx=v[0];P._mv=v[1];return l!=='🐎 Saltar a cerca'})()"));
await E(SET+"window.__rnd=Math.random;Math.random=()=>0.99;computeCtx();P._ctx.fn();Math.random=__rnd");ok('salto começou',await E("!!P._jump"));
await p.waitForTimeout(250);await p.screenshot({path:ev+'salto-cerca.png'});
for(let i=0;i<20&&await E("!!P._jump");i++)await p.waitForTimeout(80);
ok('caiu do outro lado da cerca',await E(`P.x>(${f[0]}+1)*TS&&!boxHit(P.x,P.y,HB.horse,'p')`),await E("(P.x/TS).toFixed(2)"));
ok('treino: contagem de saltos',await E("mainHorse().jumps===1"));
// recusa
await E(`P.x=(${f[0]}+3.2)*TS;P.y=(${f[1]}+0.5)*TS;const h=byId(P.mnt);h.x=P.x;h.y=P.y;P.dir=2`);await E("P._vx=-48;P._vy=0;P._mv=48;window.__rnd=Math.random;Math.random=()=>0.0;computeCtx();P._ctx&&P._ctx.fn();Math.random=__rnd");ok('refugo: para na frente da cerca',await E(`!P._jump&&P._vx===0&&P.x>(${f[0]}+1)*TS`));
// sem cerca à frente não salta
await E(`P.x=30*TS;P.y=34*TS;P._vx=48;P._mv=48`);ok('sem cerca à frente não há salto',!(await E("!!jumpTarget()")));
console.log(R.join('\n'));console.log([...new Set(errs)].join('\n')||'sem erros');await b.close();})();
