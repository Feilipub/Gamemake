// casa e móveis: comprar, aparecer dentro da casa, conforto que reduz o cansaço, cama de casal, sofá, TV e troféus
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});
await p.goto('file://'+path.resolve(__dirname,'../../web/index.html')+'#debug-nointro');await p.waitForTimeout(1200);
const E=s=>p.evaluate(s=>__lida.ev(s),s);await E("newGame(defaultCF())");await p.waitForTimeout(400);await E("FILM.end();closeModal();qPump=()=>{};QDQ.length=0");
const R=[];const ok=(n,c,i)=>R.push((c?'OK  ':'FALHA ')+n+(i?' — '+i:''));
const myF=t=>`FURN.some(f=>f.t==='${t}'&&ROOMS[f.r].H.own==='player')`;
ok('casa começa simples (sem sofá, TV e cama de casal)',await E(`!${myF('sofa')}&&!${myF('tv')}&&!${myF('camaC')}&&${myF('cama')}&&comfort()===0`));
await E("S.cash=99999;for(const k of ['sofa','tv','camaC','trofeu'])A.movBuy(k)");
ok('móveis comprados aparecem dentro da Casa Sede',await E(`${myF('sofa')}&&${myF('tv')}&&${myF('camaC')}&&${myF('trofeu')}`));
ok('conforto reduz o cansaço',await E("comfort()===8&&Math.abs(tiredMul()-0.84)<0.001"));
ok('TV mostra previsão e arroba',await E("/Previsão: Hoje/.test(tvText())&&/Arroba/.test(tvText())"));
ok('troféus contam as vitórias',await E("/pega\\(s\\) de boi/.test(trophyText())"));
ok('loja de móveis na casa',await E("/Móveis/.test(movHTML())&&/Conforto/.test(movHTML())"));
await E("SAVE.save('manual')");await p.waitForTimeout(300);await E("SAVE.loadBest(SAVE.slot)");await p.waitForTimeout(1000);
ok('móveis continuam depois de carregar',await E(`movHas('tv')&&${myF('tv')}`));
console.log(R.join('\n'));console.log([...new Set(errs)].join('\n')||'sem erros');await b.close();})();
