// v7.9.4: casa de farinha (farinhada) e tanque de leite (resfriador + laticínio)
module.exports = { nome: 'Casa de farinha e tanque de leite', async rodar(t) {
  await t.abrir({ ajustes: { view: '2d', cenas: false } }); await t.jogoNovo();
  t.ok(await t.ev("!!BUILD.farinha && !!BUILD.tanque && BUILD.tanque.req.includes('ordenha')"), 'as duas obras estão na Casa do Pedreiro (o tanque pede a ordenha)');
  await t.ev("S.lots.A = { b: 'farinha', done: true, prog: 1 }; S.dep.mandioca = 60; S.inv.lenha = 2; S.inv.farinha = 0; S.inv.beiju = 0; 0");
  await t.ev("openLot('A'); 0"); t.ok(await t.ev("document.getElementById('mc').textContent.includes('Fazer farinhada')"), 'o lote mostra a farinhada');
  await t.ev("A.farGo('2'); 0"); t.ok(await t.ev('S.far && S.far.n === 2 && S.dep.mandioca < 11 && (S.inv.lenha || 0) === 1'), 'a farinhada usa 2 sacos de mandioca e 1 lenha');
  t.ok(await t.ev('!farPronta()'), 'a farinha leva umas horas para ficar pronta');
  await t.ev('S.min += S.far.dur + 1; renderModal(); 0'); t.ok(await t.ev("document.getElementById('mc').textContent.includes('Farinha pronta')"), 'depois de umas horas a farinha fica pronta');
  await t.ev("A.farGet(); closeModal(); 0"); t.ok(await t.ev('S.inv.farinha === 16 && S.inv.beiju === 6 && !S.far'), '2 sacos viram 16 kg de farinha e 6 beijus');
  t.ok(await t.ev('FAR_KG * IT.farinha.p + FAR_BEIJU * IT.beiju.p > IT.mandioca.p * 1.8'), 'vale bem mais que vender a mandioca crua');
  // leite: sem resfriador azeda; com o tanque o laticínio busca e paga
  await t.ev("S.lots.B = { b: 'ordenha', done: true, prog: 1 }; S.milk = 100; milkDay(); 0"); t.igual(await t.ev('S.milk'), 60, 'sem o tanque, 40% do leite que sobrou azeda');
  await t.ev("S.lots.C = { b: 'tanque', done: true, prog: 1 }; S.milk = 100; milkDay(); 0"); t.igual(await t.ev('S.milk'), 100, 'com o tanque o leite não azeda');
  const c0 = await t.ev('S.acct'); await t.ev('laticinio(); 0'); t.ok((await t.ev('S.acct')) > c0 + 200 && (await t.ev('S.milk')) === 0, 'às 7h o caminhão do laticínio leva o leite e paga na conta');
  await t.ev("S.tqAuto = false; S.milk = 50; laticinio(); 0"); t.igual(await t.ev('S.milk'), 50, 'dá para desligar a entrega e guardar o leite');
  t.semErros();
} };
