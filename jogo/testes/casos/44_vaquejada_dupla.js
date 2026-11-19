// v19: vaquejada em dupla — escolha de papel e parceiro; puxador com esteireiro morador; esteireiro com puxador morador
module.exports = { nome: 'Vaquejada em dupla: puxador e esteireiro', tempo: 300, async rodar(t) {
  await t.abrir({ ajustes: { view: '2d', cenas: false } }); await t.jogoNovo();
  await t.ev('let d = S.day; while (!eventsOnDay(d).includes("vaquejada")) d++; S.day = d; S.min = 9 * 60; const h = mainHorse(); P.mnt = h.id; h._st = "ridden"; S.vaqDay = 0; toast = () => {}; 0');
  t.ok(await t.ev("(() => { startVaquejada(); const h = $('mn').innerHTML; return M.open && /puxador/.test(h) && /esteireiro/.test(h) && /data-v=.pux:ryan./.test(h) && /data-v=.est:ryan./.test(h); })()"), 'a vaquejada pergunta o papel e o parceiro');
  // amizade melhora a ajuda do parceiro
  t.ok(await t.ev("(() => { const a = vqParcQ('chico'); npcState('chico').fr += 300; return vqParcQ('chico') > a; })()"), 'mais amizade = parceiro ajuda mais');
  // puxador com esteireiro morador: corre os 3 bois emparelhado
  await t.ev("A.vqIr('pux:ryan'); 0");
  t.ok(await t.ev("VQ.on && VQ.papel === 'pux' && VQ.npc === 'ryan' && !M.open"), 'corre de puxador com o Ryan de esteireiro');
  const rodaPux = `(() => { let g = 0; while (VQ.on && g++ < 4000) { if (VQ.ph === 'run') { P.x = VQ.bull.x - 6; VQ.pv = VQ.bull.v; if (!VQ.hold) vaqAction(); else if (VQ.bull.x > (VQ.faixa[0] + 0.7) * TS) vaqAction(); } updVaquejada(1 / 30); } return JSON.stringify({ on: VQ.on, pts: VQ.pts, log: VQ.log }); })()`;
  const r1 = JSON.parse(await t.ev(rodaPux));
  t.ok(!r1.on && r1.log.length === 3 && r1.pts >= 20, 'puxador: 3 bois corridos, emparelhado derruba ' + JSON.stringify(r1));
  t.ok(await t.ev("M.open && /Dupla: você de puxador e .*Ryan/.test($('mn').innerHTML)"), 'o resultado mostra a dupla');
  await t.ev('closeModal(); 0');
  // esteireiro: bem emparelhado e fechando o boi, o puxador derruba mais
  const rodaEst = bom => `(() => { S.vaqDay = 0; vqComecar({ papel: 'est', npc: 'ryan', q: vqParcQ('ryan') }); let g = 0; while (VQ.on && g++ < 5000) { if (VQ.ph === 'run') { ${bom ? "P.x = VQ.bull.x - 2; VQ.pv = VQ.bull.v; if (VQ.sw) vaqAction();" : "P.x = VQ.bull.x - 80; VQ.pv = 0;"} } updVaquejada(1 / 30); } return JSON.stringify({ on: VQ.on, pts: VQ.pts, log: VQ.log, sw: VQ.swOk, swN: VQ.swN }); })()`;
  t.ok(await t.ev("(() => { S.vaqDay = 0; vqComecar({ papel: 'est', npc: 'ryan', q: 0.7 }); const ok = VQ.papel === 'est' && Math.abs(P.y - (VQ.bull.y - 18)) < 1; VQ.on = false; VQ.papel = null; return ok; })()"), 'o esteireiro corre do outro lado do boi');
  let bons = 0, ruins = 0; for (let k = 0; k < 3; k++) { const a = JSON.parse(await t.ev(rodaEst(true))); bons += a.pts; await t.ev('closeModal(); 0'); const b = JSON.parse(await t.ev(rodaEst(false))); ruins += b.pts; await t.ev('closeModal(); 0'); if (k === 0) t.ok(a.log.length === 3 && a.sw > 0, 'esteireiro: 3 bois, fechou o boi quando ele tentou abrir ' + JSON.stringify(a)); }
  t.ok(bons > ruins, 'esteirar bem dá mais pontos que esteirar mal (' + bons + ' × ' + ruins + ')');
  t.semErros();
} };
