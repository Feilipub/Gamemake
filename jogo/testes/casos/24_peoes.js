// v7.4: dormir a qualquer hora, casa de peão com parede e afastada da horta, Peões 2.0
module.exports = { nome: 'Peões 2.0, dormir antes das 18h e casa de peão sólida', tempo: 240, async rodar(t) {
  await t.abrir({ ajustes: { view: '2d', cenas: false } }); await t.jogoNovo();
  // dormir antes da hora
  await t.ev('S.min = 10 * 60; openHouse(); 0'); t.ok(await t.ev("document.getElementById('mc').textContent.includes('Pular o dia')"), 'a casa oferece pular o dia antes das 18h');
  const d0 = await t.ev('S.day'); await t.ev("closeModal(); sleep(); 0"); t.ok(await t.ate('S.day > ' + d0, 15000), 'dormir às 10h passa para o dia seguinte');
  // casa de peão no Lote C: sólida e longe da horta
  t.ok(await t.ev("LOTS.C.r[0] > Math.max(...HORTA_BEDS.map(b => b[2])) + 1"), 'o Lote C fica com uma casa de folga da horta');
  await t.ev("S.lots.C = { b: 'casapeao', done: true, prog: 1 }; applyLotSolid(); 0");
  t.ok(await t.ev("obj[gi(LOTS.C.r[0] + 3, LOTS.C.r[3] - 1)] === 3"), 'a casa de peão pronta tem parede (não dá para atravessar)');
  t.ok(await t.ev("!obj[gi(LOTS.C.r[0] + 3, LOTS.C.r[3] + 1)]"), 'a frente da casa fica livre para a porta');
  // peões: candidatos com jeito, contratar, ânimo, folga, agrado e aumento
  await t.ev('genCandidates(); 0'); t.igual(await t.ev('S.cand.length'), 4, 'o mural tem 4 candidatos');
  t.ok(await t.ev('S.cand.every(c => c.tr && c.tr.length >= 1)'), 'cada candidato tem um jeito (caprichoso, madrugador, forte...)');
  await t.ev('S.cash += 5000; A.hire(0); 0'); t.igual(await t.ev('S.workers.length'), 1, 'contratou o peão');
  const id = await t.ev('S.workers[0].id');
  const m0 = await t.ev('S.workers[0].mor'); await t.ev(`A.wGift(${id}); 0`); t.ok((await t.ev('S.workers[0].mor')) > m0, 'o agrado levanta o ânimo');
  const s0 = await t.ev('S.workers[0].sal'); await t.ev(`A.wRaise(${id}); 0`); t.ok((await t.ev('S.workers[0].sal')) > s0, 'o aumento sobe o salário');
  await t.ev(`A.wFolga(${id}); 0`); t.igual(await t.ev('S.workers[0].off'), await t.ev('S.day + 1'), 'a folga fica marcada para amanhã');
  await t.ev("openMenu('peo'); 0"); await t.espera(300); t.ok(await t.ev("document.getElementById('mc').textContent.includes('Ânimo')"), 'o cartão do peão mostra o ânimo e o jeito'); await t.ev('closeModal(); 0');
  // ordens novas: vacinar e ronda
  await t.ev("S.workers[0].off = null; S.inv.vacina = 10; myAnimals('boi').forEach(a => { a.vacc = 0; a.area = 'p1'; const p = randIn('p1'); a.x = p[0]; a.y = p[1]; }); giveOrder(S.workers[0], { type: 'vacinar', area: 'p1' }); S.min = 8 * 60; 0");
  await t.ev("for (let k = 0; k < 6000 && S.workers[0].task; k++) { S.min = 8 * 60; updWorker(S.workers[0], 0.1); } 0");
  t.ok(await t.ev("myAnimals('boi').filter(a => a.age >= 3).every(a => a.vacc > S.day)"), 'o peão vacinou o gado do pasto');
  await t.ev("giveOrder(S.workers[0], { type: 'rondar' }); for (let k = 0; k < 6000 && S.workers[0].task; k++) { S.min = 9 * 60; updWorker(S.workers[0], 0.1); } 0");
  t.igual(await t.ev('S.ronda'), await t.ev('S.day'), 'a ronda da noite fica marcada');
  t.ok(await t.ev("rollTraits.length === 1"), 'o temperamento dos animais continua funcionando (sem conflito de nomes)');
  t.semErros();
} };
