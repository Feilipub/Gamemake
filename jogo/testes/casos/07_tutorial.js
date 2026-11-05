module.exports = { nome: 'Tutorial guiado avança passo a passo (o divertido primeiro)', async rodar(t) {
  await t.abrir({ celular: true }); await t.jogoNovo('defaultCF()', false); await t.espera(1500);
  const i = () => t.ev('S.tut.i'); t.igual(await i(), 0, 'o tutorial começa no passo 1');
  t.igual(await t.ev('TUT[0].k + "," + TUT[1].k'), 'montar,aboio', 'os primeiros passos são montar e tocar o gado');
  await t.ev('P.mnt = mainHorse().id; 0'); t.ok(await t.ate('S.tut.i >= 1'), 'montar conclui o passo 1');
  await t.ev('S.flags.aboio = 1; 0'); t.ok(await t.ate('S.tut.i >= 2'), 'o aboio conclui o passo 2');
  await t.ev('P.mnt = null; openSheet(tutCow() || tutHorse()); closeSheet(); 0'); t.ok(await t.ate('S.tut.i >= 3'), 'abrir a ficha de um animal conclui o passo 3');
  await t.ev('S.flags.tutAgua = 1; 0'); t.ok(await t.ate('S.tut.i >= 4'), 'encher o cocho conclui o passo 4');
  t.ok(await t.ev("document.getElementById('tutArr').style.display === 'block'"), 'a seta aponta para o próximo alvo');
  await t.foto('passo'); await t.ev('A.tutSkip(); 0'); t.ok(await t.ev('S.tut.done === 1'), 'dá para pular o tutorial');
  t.semErros();
} };
