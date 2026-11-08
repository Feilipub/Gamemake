// v8.0: mega atualização das cenas — legenda letra a letra, toque para avançar, cenas novas e refeitas
module.exports = { nome: 'Cenas: legenda letra a letra, toque para avançar e cenas novas', tempo: 200, async rodar(t) {
  const p = await t.abrir({ ajustes: { view: '2d', cenas: true } }); await t.jogoNovo();
  // legenda letra a letra
  await t.ev("cutscene([{ fade: 0, txt: 'Uma frase bem comprida para ler com calma no sertão da Bahia.', d: 1 }, { txt: 'Segunda.', d: 1 }, { clr: 1, d: 0.1 }]); 0"); await t.espera(250);
  const parcial = await t.ev("document.getElementById('sub').textContent.length"); t.ok(parcial > 0 && parcial < 60, 'a legenda aparece letra a letra (' + parcial + ' letras até agora)');
  t.ok(await t.ev('CS.steps[0].d > 2'), 'o plano ganha tempo para dar para ler a frase inteira');
  await t.espera(200); await p.mouse.click(300, 250); await t.espera(80); t.ok(await t.ev("document.getElementById('sub').textContent.length >= 60"), 'o primeiro toque mostra a frase inteira');
  await p.mouse.click(300, 250); await t.ate('CS.i >= 1', 3000); t.ok(await t.ev('CS.i >= 1'), 'o segundo toque passa para o próximo plano');
  await t.ev('skipCS(); 0'); await t.espera(300);
  // cenas novas e refeitas rodam até o fim sem erro
  const roda = async (nome, code) => { await t.ev(code + '; 0'); await t.espera(300); const ok = await t.ev('CS.on'); for (let i = 0; i < 40 && (await t.ev('CS.on')); i++) { await p.mouse.click(300, 250); await t.espera(200); } t.ok(ok && !(await t.ev('CS.on')), 'a cena ' + nome + ' roda e termina tocando para avançar'); await t.ev('closeModal(); 0'); };
  await roda('da obra começando', "S.lots.A = { b: 'silo', done: false, prog: 0 }; csObraStart('A')");
  await roda('da inauguração (fita cortada)', "S.lots.A = { b: 'silo', done: true, prog: 1 }; csObraFim('A')");
  t.ok(await t.ev('!P._csHide && !CSX.length && !CINE.actors.length'), 'no fim da cena o jogador volta a aparecer e os figurantes somem');
  await roda('do nascimento do filho', "S.amor = { id: 'clara', st: 3, d: 1, cd: 1 }; S.fam = { kids: [{ id: 1, n: 'Bebê', sex: 'M', born: S.day, ap: kidMakeAp('M'), laco: 20, ens: {}, task: 'nada' }], nomear: 0 }; CS2.filho({ id: 1 })");
  await roda('da primeira farinhada', "S.lots.B = { b: 'farinha', done: true, prog: 1 }; CS2.farinhada()");
  await roda('da chegada da seca', 'CS2.seca()');
  await roda('do peão novo', 'genCandidates(); S.workers.push(S.cand[0]); CS2.peao({ id: S.cand[0].id })');
  // ganchos: os momentos entram na fila de cenas
  await t.ev("S.pend.length = 0; S.flags.farin1 = 0; S.dep.mandioca = 30; S.inv.lenha = 1; S.far = null; A.farGo('1'); 0");
  t.ok(await t.ev("S.pend.some(p => p.k === 'cs2' && p.n === 'farinhada')"), 'a primeira farinhada chama a cena');
  t.semErros();
} };
