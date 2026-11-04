// contratos de venda: propostas semanais, aceitar, entregar bois e produtos, prêmio, multa no vencimento
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});
await p.goto('file://'+path.resolve(__dirname,'../../web/index.html')+'#debug-nointro');await p.waitForTimeout(1200);
const E=s=>p.evaluate(s=>__lida.ev(s),s);await E("newGame(defaultCF())");await p.waitForTimeout(400);await E("FILM.end();closeModal();qPump=()=>{};QDQ.length=0");
const R=[];const ok=(n,c,i)=>R.push((c?'OK  ':'FALHA ')+n+(i?' — '+i:''));
await E("ctrOffers()");ok('3 propostas na semana, uma do frigorífico',await E("ctrS().off.length===3&&ctrS().off[0].k==='boi'"));
ok('todo contrato de produto paga acima do preço normal',await E("Object.keys(CTR_KINDS).filter(k=>k!=='boi').every(k=>CTR_KINDS[k].mk().pu>IT[CTR_KINDS[k].item].p)"));
await E("const C=ctrS();C.off=[{k:'boi',id:1,got:0,need:2,minKg:450,days:10,prem:0.1},{k:'queijo',id:2,got:0,need:4,days:5,pu:33},{k:'leite',id:3,got:0,need:30,days:2,pu:3.9}];A.ctrTake(0);A.ctrTake(0)");
ok('aceita até 2',await E("ctrS().act.length===2&&ctrS().off.length===1"));
await E("window.__L=[480,500,300].map(w=>{const a=mkAnimal('boi','nelore',{own:'player',age:30,sex:'M'});a.wt=w;const q=randIn('curral');a.x=q[0];a.y=q[1];a.area='curral';S.animals.push(a);return a});window.__exp=(frigPrice(__L[0])+frigPrice(__L[1]))*1.1;window.__c0=S.cash+S.acct");
await E("A.ctrGive(0)");ok('entrega só os bois acima do peso e paga a arroba + prêmio',await E("!S.animals.includes(__L[0])&&!S.animals.includes(__L[1])&&S.animals.includes(__L[2])&&Math.abs(S.cash+S.acct-__c0-__exp)<2"));
ok('contrato cumprido sai da lista',await E("ctrS().done===1&&ctrS().act.length===1"));
await E("S.inv.queijo=2;A.ctrGive(0)");ok('produtos podem ser entregues aos poucos',await E("ctrS().act[0].got===2&&!S.inv.queijo"));
await E("window.__c1=S.cash+S.acct;S.day=ctrS().act[0].due+1;ctrDay()");ok('contrato vencido cobra multa de 10%',await E("ctrS().fail===1&&ctrS().act.length===0&&Math.round(__c1-(S.cash+S.acct))===Math.round(4*33*0.1)"));
ok('aparece na aba Fazenda',await E("/Contratos de venda/.test(farmTab())"));
await E("SAVE.save('manual')");await p.waitForTimeout(300);await E("SAVE.loadBest(SAVE.slot)");await p.waitForTimeout(1000);ok('salvo no jogo',await E("ctrS().done===1&&ctrS().fail===1"));
console.log(R.join('\n'));console.log([...new Set(errs)].join('\n')||'sem erros');await b.close();})();
