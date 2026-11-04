// pega de boi no mato: barbatão aparece na caatinga, foge do vaqueiro, cansa, é laçado e levado a um cercado seu
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});
await p.goto('file://'+path.resolve(__dirname,'../../web/index.html')+'#debug-nointro');await p.waitForTimeout(1200);
const E=s=>p.evaluate(s=>__lida.ev(s),s);await E("newGame(defaultCF())");await p.waitForTimeout(400);await E("FILM.end();closeModal();qPump=()=>{};QDQ.length=0");
const R=[];const ok=(n,c,i)=>R.push((c?'OK  ':'FALHA ')+n+(i?' — '+i:''));
await E("window.__a=pegaSpawn()");ok('barbatão aparece na caatinga ao sul da cidade',await E("!!__a&&__a.wild&&__a.x/TS>=PEGA.x0&&__a.y/TS>=PEGA.y0&&S.pega.rew>=700"));
await E("P.x=__a.x-60;P.y=__a.y;window.__d0=hyp(P.x-__a.x,P.y-__a.y)");await p.waitForTimeout(1500);
ok('foge quando o vaqueiro chega perto',await E("hyp(P.x-__a.x,P.y-__a.y)>__d0+20"),await E("Math.round(hyp(P.x-__a.x,P.y-__a.y))"));
await E("__a._stam=0;P.x=__a.x-30;P.y=__a.y");await p.waitForTimeout(500);ok('cansado, fica parado',await E("__a._st==='tired'"));
await E("const g=S.pega;const q=randIn('curral');lasso.t=__a;__a.x=q[0];__a.y=q[1];P.x=q[0]+20;P.y=q[1];window.__c0=S.cash+S.acct;window.__rew=g.rew");await p.waitForTimeout(800);
ok('laçado e trazido ao curral: recompensa e boi devolvido ao dono',await E("!S.pega&&!S.animals.includes(__a)&&Math.round(S.cash+S.acct-__c0)===__rew&&S.stats.pegas===1"));
await E("S.pega={aid:-1,due:S.day-1,rew:500};pegaDay()");ok('sem pegar até o prazo, o barbatão some',await E("!S.pega"));
ok('gibão à venda na Casa do Agro',await E("AGRO_ITEMS.fer.includes('gibao')&&IT.gibao.p>0"));
console.log(R.join('\n'));console.log([...new Set(errs)].join('\n')||'sem erros');await b.close();})();
