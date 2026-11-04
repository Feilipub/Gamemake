// condução do gado a cavalo como um jogador de verdade (chega pelo lado, passo e galope, virada para o sul).
// 10 bois, 8 repetições por jogada com sorteio fixo. Antes da correção (mesmo teste): passo 5,8 perdidos de 10, galope 6,0, virada 6,8.
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:800,height:450}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(__dirname,'../../web/index.html')+'#debug-nointro');await p.waitForTimeout(1200);
const E=s=>p.evaluate(s=>__lida.ev(s),s);await E("newGame(defaultCF())");await p.waitForTimeout(400);await E("FILM.end();closeModal();qPump=()=>{};QDQ.length=0;S.min=10*60;S.weather='sol';toast=()=>{};say=()=>{}");
const R=[];const ok=(n,c,i)=>R.push((c?'OK  ':'FALHA ')+n+(i?' — '+i:''));const res={};
for(const [mode,gal] of [['passo',0],['galope',1],['virada',0]]) for(const seed of [1,2,3,4,5,6,7,8]){
const r=JSON.parse(await E(`(()=>{let z=${seed}*9973+${mode.length}*31;Math.random=()=>{z=(z+0x6D2B79F5)|0;let t=Math.imul(z^z>>>15,1|z);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};S.animals=S.animals.filter(a=>!(a.sp==='boi'&&a.own==='player'));const h=mainHorse();P.mnt=h.id;h._st='ridden';
 let H=S.animals.filter(a=>a.sp==='boi'&&a.own==='player');while(H.length<10){const a=mkAnimal('boi','nelore',{own:'player'});S.animals.push(a);H.push(a);} H=H.slice(0,10);
 H.forEach((a,i)=>{a.x=(66+i%4*1.6+${seed}*0.3)*TS;a.y=(96+Math.floor(i/4)*1.6)*TS;a.area=null;a._st=null;a._vx=a._vy=0;a.tie=null;a._fear=0;a.food=90;a.water=90;});
 const C=()=>{let x=0,y=0;for(const a of H){x+=a.x/H.length;y+=a.y/H.length;}return [x,y];};const c0=C();P.x=c0[0]-10;P.y=c0[1]-70;
 const steer=(dx,dy)=>{const [cx,cy]=C();const tx=cx-dx*45,ty=cy-dy*45;const vx=tx-P.x,vy=ty-P.y,vl=Math.hypot(vx,vy)||1;input.x=vx/vl;input.y=vy/vl;input.gal=${gal}?true:false;};
 for(let i=0;i<60*14;i++){ if('${mode}'==='virada'&&i>60*7) steer(0,1); else steer(1,0); tick(1/60);}
 input.x=input.y=0;input.gal=false;for(let i=0;i<60*3;i++)tick(1/60);
 const c1=C();const dist=H.map(a=>Math.hypot(a.x-c1[0],a.y-c1[1]));return JSON.stringify({av:'${mode}'==='virada'?c1[1]-c0[1]:c1[0]-c0[0],perd:dist.filter(d=>d>90).length});})()`));
 (res[mode]=res[mode]||[]).push(r);}
const avg=(m,k)=>res[m].reduce((s,v)=>s+v[k],0)/res[m].length;
ok('a passo o rebanho anda no rumo',avg('passo','av')>150,Math.round(avg('passo','av'))+' px');
ok('a passo quase ninguém se perde',avg('passo','perd')<=3,avg('passo','perd').toFixed(1)+' de 10');
ok('a galope o rebanho anda e não espalha',avg('galope','av')>150&&avg('galope','perd')<=4.5,Math.round(avg('galope','av'))+' px, '+avg('galope','perd').toFixed(1)+' perdidos');
ok('dá para virar o rebanho (ainda o ponto mais difícil)',avg('virada','av')>80&&avg('virada','perd')<=7,Math.round(avg('virada','av'))+' px, '+avg('virada','perd').toFixed(1)+' perdidos');

// porteira: o vaqueiro fica atrás do rebanho e leva 6 bois do Piquete 1 para a estrada pela porteira de cima
let pass=0,tot=0;for(const seed of [1,2,3,4,5,6]){const r=JSON.parse(await E(`(()=>{const h=mainHorse();P.mnt=h.id;h._st='ridden';
 S.animals=S.animals.filter(a=>!(a.sp==='boi'&&a.own==='player'));const H=[];for(let i=0;i<6;i++){const a=mkAnimal('boi','nelore',{own:'player'});S.animals.push(a);H.push(a);}
 H.forEach((a,i)=>{a.x=(3+i%3*2.5)*TS;a.y=(56+Math.floor(i/3)*2+${seed}*0.7)*TS;a.area='p1';a._st=null;a._vx=a._vy=0;a.tie=null;});
 const g=GATES.find(g=>g.t.some(t=>t[0]===5&&t[1]===46));g.open=true;g.anim=1;P.x=6*TS;P.y=64*TS;const gx=6*TS,gy=46*TS;
 for(let i=0;i<90*60;i++){const inside=H.filter(a=>a.y>46.2*TS);if(!inside.length)break;let cx=0,cy=0;for(const a of inside){cx+=a.x;cy+=a.y;}cx/=inside.length;cy/=inside.length;
  const dx=cx-gx,dy=cy-gy,dl=Math.hypot(dx,dy)||1;const tx=cx+dx/dl*30,ty=cy+dy/dl*30;const vx=tx-P.x,vy=ty-P.y,vl=Math.hypot(vx,vy);const sp=Math.min(1,vl/40);input.x=vl>4?vx/vl*sp:0;input.y=vl>4?vy/vl*sp:0;input.gal=false;tick(1/60);}
 input.x=input.y=0;return JSON.stringify({p:H.filter(a=>a.y<=46.2*TS).length});})()`));pass+=r.p;tot+=6;}
ok('pela porteira passam quase todos',pass>=tot-6,pass+' de '+tot);
console.log(R.join('\n'));console.log([...new Set(errs)].join('\n')||'sem erros');await b.close();})();
