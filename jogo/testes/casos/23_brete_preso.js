// Vaqueiro montado no brete (estreito) não fica preso: o jogo desmonta e libera; encostar numa cerca não teleporta
module.exports = { nome: 'Não fica preso no brete montado', async rodar(t) {
  await t.abrir({ ajustes: { view: '2d', cenas: false } }); await t.jogoNovo();
  await t.ev("const h = mainHorse(); P.mnt = h.id; h._st = 'ridden'; P.x = 50.5 * TS; P.y = 38.5 * TS; h.x = P.x; h.y = P.y; P._vx = P._vy = 0; 0");
  const x0 = await t.ev('P.x');
  await t.p.keyboard.down('KeyD'); await t.espera(4000); await t.p.keyboard.up('KeyD');
  t.ok(await t.ate('!P.mnt || !inBrete(P.x, P.y)', 6000), 'montado no brete, o jogo desmonta ou tira o vaqueiro de lá');
  t.ok(await t.ev('!boxHit(P.x, P.y, HB.foot, "p")'), 'o vaqueiro fica num lugar livre');
  // andar contra uma cerca comum não teleporta
  await t.ev('P.mnt = null; P.x = 30 * TS; P.y = 43.5 * TS; 0'); const y0 = await t.ev('P.y');
  await t.p.keyboard.down('KeyW'); await t.espera(2500); await t.p.keyboard.up('KeyW');
  t.ok(Math.abs((await t.ev('P.x')) - 30 * 16) < 24, 'encostar numa cerca não joga o vaqueiro longe');
  t.semErros();
} };
