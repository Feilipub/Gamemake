// modo construção: material, regras de lugar, caminho livre, girar, remover, cocho funcional e salvamento
const {chromium}=require('playwright');const path=require('path');const ev=path.resolve(__dirname,'../../production/qa/evidence')+'/';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:860}});const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(__dirname,'../../web/index.html')+'#debug-nointro');await p.waitForTimeout(1200);
const E=s=>p.evaluate(s=>__lida.ev(s),s);await E("newGame(defaultCF())");await p.waitForTimeout(400);await E("FILM.end();closeModal();qPump=()=>{};QDQ.length=0;S.min=10*60;SET.cine='off';S.weather='sol';S.cash=20000;A.bagUp(24);A.bagUp(36)");
const R=[];const ok=(n,c,i)=>R.push((c?'OK  ':'FALHA ')+n+(i?' — '+i:''));
const chk=(k,x,y,r)=>E(`JSON.stringify(bCheck('${k}',${x},${y},${r||0}))`).then(JSON.parse);
await E("P.x=16*TS;P.y=40*TS;cam.snap=true");
// sem material
const fr=await E(`(()=>{addInv('mourao',1,true);addInv('arame',1,true);for(let y=26;y<60;y++)for(let x=2;x<56;x++)if(bCheck('cerca',x,y).ok){useInv('mourao');useInv('arame');return [x,y]}})()`);let c=await chk('cerca',fr[0],fr[1]);ok('sem mourão não constrói',!c.ok&&/mourão/i.test(c.why),c.why);
await E("addInv('mourao',12,true);addInv('arame',1,true);addInv('tabua',20,true);addInv('telha',2,true)");
// regras de lugar
c=await chk('cerca',70,40);ok('fora da fazenda: não',!c.ok,c.why);
const road=await E("(()=>{for(let y=40;y<50;y++)for(let x=0;x<60;x++)if(ground[gi(x,y)]===G.DIRT&&farmTile(x,y))return [x,y]})()");c=await chk('cerca',road[0],road[1]);ok('na estrada: não',!c.ok&&/estrada/.test(c.why),c.why);
const g0=await E("JSON.stringify(GATES.find(g=>g.t[0][0]<60).t[0])").then(JSON.parse);c=await chk('cerca',g0[0],g0[1]+1);ok('na porteira: não',!c.ok,c.why);
// achar um lugar livre para tudo
const spot=await E(`(()=>{for(let y=24;y<64;y++)for(let x=2;x<56;x++){if(bCheck('abrigo',x,y,0).ok&&bCheck('banco',x+4,y,0).ok)return [x,y]}})()`);ok('acha lugar livre na fazenda',!!spot,String(spot));
await E(`BLD2.on=true;BLD2.k='abrigo';BLD2.rot=0;BLD2.cur=[${spot[0]},${spot[1]}];BLD2.tapT=5;bPlace()`);ok('constrói abrigo e gasta material',await E("builtS().length===1&&S.inv.mourao===8&&!has('telha')"),await E("JSON.stringify({m:S.inv.mourao,t:S.inv.tabua,te:S.inv.telha})"));
c=await chk('banco',spot[0],spot[1]);ok('não sobrepõe o que já existe',!c.ok,c.why);
await E(`BLD2.k='banco';BLD2.rot=1;BLD2.cur=[${spot[0]+4},${spot[1]}];bPlace()`);ok('banco girado (vertical)',await E("builtS()[1]&&builtS()[1].r===1"));
// cerca: um rolo de arame dá 10 lances
const line=await E(`(()=>{const L=[];for(let y=26;y<60&&L.length<4;y++){for(let x=2;x<56;x++){let k=0;for(let i=0;i<4;i++)if(bCheck('cerca',x+i,y).ok)k++;if(k===4){for(let i=0;i<4;i++)L.push([x+i,y]);break}}}return L})()`);
for(const [x,y] of line)await E(`BLD2.k='cerca';BLD2.cur=[${x},${y}];bPlace()`);ok('4 lances de cerca com 1 rolo',await E("builtS().filter(o=>o.k==='cerca').length===4&&S.arameLeft===6&&!has('arame')"),await E("S.arameLeft+' '+(S.inv.arame||0)"));
ok('cerca bloqueia passagem',await E(`obj[gi(${line[0][0]},${line[0][1]})]===1`));
// caminho: um ponto-chave cercado por todos os lados — o último lance que fecharia o caminho é recusado
const blockTry=await E(`(()=>{addInv('mourao',30,true);addInv('arame',3,true);let k=null;for(let y=26;y<60&&!k;y++)for(let x=4;x<54&&!k;x++){let all=true;for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)if((dx||dy)&&!bCheck('cerca',x+dx,y+dy).ok)all=false;if(all&&farmReach()[gi(x,y)])k=[x,y];}if(!k)return 'sem lugar';const kt=keyTiles;keyTiles=()=>[[k[0],k[1],'o ponto de teste']];let refused='';for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){if(!dx&&!dy)continue;const c=bCheck('cerca',k[0]+dx,k[1]+dy,0);if(c.ok){BLD2.cur=[k[0]+dx,k[1]+dy];bPlace()}else refused=c.why;}keyTiles=kt;window.__kk=k;return refused})()`);
ok('recusa o lance que fecharia o caminho',/caminho/.test(blockTry),blockTry);ok('ponto continua alcançável',await E("farmReach()[gi(__kk[0],__kk[1])]===1"));
ok('galinheiro continua alcançável',await E("farmReach()[gi(7,36)]===1"));
// cocho dentro de pasto vira cocho de verdade
const ps=await E(`(()=>{addInv('tabua',10,true);for(let y=24;y<66;y++)for(let x=2;x<58;x++){if(bCheck('cocho',x,y,0).ok)return [x,y]}})()`);ok('acha lugar para cocho dentro de pasto',!!ps,String(ps));
const nT=await E("TROUGHS.length");await E(`BLD2.k='cocho';BLD2.cur=[${ps[0]},${ps[1]}];bPlace()`);ok('cocho entra na lista de cochos do pasto',await E("TROUGHS.length")===nT+1&&await E("S.tr.length===TROUGHS.length&&!!TROUGHS[TROUGHS.length-1].a"),await E("TROUGHS[TROUGHS.length-1].a"));
await E(`P.x=(${spot[0]}+1.5)*TS;P.y=(${spot[1]}+3)*TS;cam.snap=true;BLD2.on=true;BLD2.tapT=0;bUI()`);await p.waitForTimeout(800);await p.screenshot({path:ev+'construcao-modo.png'});
// salvar/carregar
await E("bStop();SAVE.save('manual')");await p.waitForTimeout(500);await E("SAVE.loadBest(SAVE.slot)");await p.waitForTimeout(1200);
ok('construções voltam no carregamento',await E("builtS().length")>=7&&await E(`obj[gi(${line[0][0]},${line[0][1]})]===1&&PROPS.some(q=>q.t==='b_abrigo')&&S.tr.length===TROUGHS.length`),await E("builtS().length"));
// remover devolve material
const m0=await E("S.inv.tabua||0");await E(`bRemoveAt(${spot[0]},${spot[1]})`);ok('remover abrigo devolve metade',await E("(S.inv.tabua||0)")===m0+3&&!(await E("PROPS.some(q=>q.t==='b_abrigo')")));
const nT2=await E("TROUGHS.length");await E(`bRemoveAt(${ps[0]},${ps[1]})`);ok('remover cocho tira da lista sem desalinhar',await E("TROUGHS.length")===nT2-1&&await E("S.tr.length===TROUGHS.length"));
await E("openMenu('obr')");await p.waitForTimeout(200);ok('botão Construir no menu Obras',await E("!!document.querySelector('#mc button[data-a=buildStart]')"));await E("closeModal()");
console.log(R.join('\n'));console.log([...new Set(errs)].join('\n')||'sem erros');await b.close();})();
