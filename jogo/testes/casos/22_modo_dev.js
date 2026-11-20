// Modo desenvolvedor escondido: 7 toques na versão (Menu › Config) liberam botões de dinheiro
module.exports = { nome: 'Modo desenvolvedor escondido nas configurações', async rodar(t) {
  await t.abrir({ ajustes: { view: '2d', cenas: false }, celular: true }); await t.jogoNovo();
  await t.ev("openMenu('cfg'); 0"); await t.espera(500);
  t.ok(!(await t.ev("document.getElementById('mc').textContent.includes('Modo desenvolvedor')")), 'o modo fica escondido no começo');
  for (let i = 0; i < 7; i++) { await t.p.evaluate(() => document.querySelector('[data-a="devTap"]').click()); await t.espera(120); }
  t.ok(await t.ev('SET.dev === true'), '7 toques na versão ligam o modo desenvolvedor');
  t.ok(await t.ev("document.getElementById('mc').textContent.includes('Modo desenvolvedor')"), 'o painel aparece nas configurações');
  await t.foto('painel');
  const c0 = await t.ev('S.cash'), e0 = await t.ev('S.stats.earned');
  await t.p.evaluate(() => document.querySelector('[data-a="devCash"][data-v="cash|10000"]').click()); await t.espera(200);
  t.igual(await t.ev('S.cash'), c0 + 10000, '+R$ 10.000 no bolso');
  await t.ev("document.getElementById('devV').value = '2500'; 0"); await t.p.evaluate(() => document.querySelector('[data-a="devCustom"][data-v="acct"]').click()); await t.espera(200);
  t.ok((await t.ev('S.acct')) >= 2500, 'valor livre vai para o banco');
  t.igual(await t.ev('S.stats.earned'), e0, 'o dinheiro do modo dev não conta como dinheiro ganho');
  await t.p.evaluate(() => document.querySelector('[data-a="devOff"]').click()); t.ok(await t.ev('SET.dev === false'), 'dá para desligar');
  t.semErros();
} };
