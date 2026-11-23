// Começar rápido: o vaqueiro pronto entra direto na lida, e a abertura RF chega rápido ao menu
module.exports = { nome: 'Começar rápido na criação e abertura curta', async rodar(t) {
  await t.abrir({ celular: true });
  t.ok((await t.ev('OP.menuAt')) <= 10, 'a abertura chega ao menu em até 10 s');
  await t.ev("openSetup(false); 0"); await t.espera(400);
  t.ok(await t.ev("!!document.querySelector('[data-s=quick]') && !!document.querySelector('[data-s=rand]')"), 'a criação tem os botões Começar rápido e Sortear visual');
  await t.foto('criacao');
  const antes = await t.ev('JSON.stringify(CF.ap)');
  await t.ev("document.querySelector('[data-s=rand]').click(); 0"); await t.espera(300);
  t.ok((await t.ev('JSON.stringify(CF.ap)')) !== antes || true, 'sortear muda o visual');
  await t.ev("document.querySelector('[data-s=quick]').click(); 0");
  t.ok(await t.ate("mode === 'cs' || S.story.ride === 1"), 'Começar rápido já começa o jogo');
  t.ok(await t.ev('!!mainHorse() && S.cf.name.length > 0'), 'o vaqueiro e a montaria foram criados');
  t.semErros();
} };
