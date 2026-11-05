module.exports = { nome: 'Tutorial guiado avança passo a passo', async rodar(t) {
  await t.abrir({ celular: true }); await t.jogoNovo('defaultCF()', false); await t.espera(1500);
  const i = () => t.ev('S.tut.i'); t.igual(await i(), 0, 'o tutorial começa no passo 1');
  await t.ev('P.x += 5 * TS; 0'); t.ok(await t.ate('S.tut.i >= 1'), 'andar conclui o passo 1');
  await t.ev('openSheet(tutCow() || tutHorse()); closeSheet(); 0'); t.ok(await t.ate('S.tut.i >= 2'), 'abrir a ficha de um animal conclui o passo 2');
  await t.ev('S.flags.tutAgua = 1; 0'); t.ok(await t.ate('S.tut.i >= 3'), 'encher o cocho conclui o passo 3');
  t.ok(await t.ev("document.getElementById('tutArr').style.display === 'block'"), 'a seta aponta para o próximo alvo');
  await t.foto('passo'); await t.ev('A.tutSkip(); 0'); t.ok(await t.ev('S.tut.done === 1'), 'dá para pular o tutorial');
  t.semErros();
} };
