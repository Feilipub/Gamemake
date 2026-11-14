module.exports = { nome: 'Tela de título e abertura no celular em pé', async rodar(t) {
  await t.abrir({ celular: true }); await t.espera(1500);
  t.igual(await t.ev('mode'), 'title', 'abre na tela de título');
  await t.foto('titulo');
  await t.ev('newGame(defaultCF())'); await t.espera(3500);
  t.igual(await t.ev('mode'), 'cs', 'a cena de abertura começa');
  const F = await t.ev('JSON.stringify({ h: HD.on ? HD.F.y1 - HD.F.y0 : -1, raw: HD.Fraw || 0 })'); const f = JSON.parse(F);
  t.ok(f.h < 0 || f.h >= Math.min(f.raw, 1700) - 1, 'o chão da prancheta HD cobre a tela em pé (' + f.h + ' de ' + f.raw + ' px)');
  await t.foto('abertura');
  await t.pularCenas(); t.igual(await t.ev('mode'), 'play', 'dá para pular a abertura e jogar');
  t.semErros();
} };
