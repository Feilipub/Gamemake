// O primeiro dia: chegada a cavalo, parto da Estrela, nome do bezerro, fogueira, baú do avô e a primeira venda
module.exports = { nome: 'Primeiro dia: chegada, parto, fogueira, baú do avô e primeira venda', tempo: 300, async rodar(t) {
  await t.abrir({ celular: true });
  await t.ev('newGame(defaultCF()); 0'); await t.espera(800);
  t.ok(await t.ate("mode === 'cs'"), 'a abertura começa');
  t.ok((await t.ev('CS.steps.length')) <= 5, 'a cena de abertura é curta (poucos planos)');
  await t.ev('skipCS(); 0'); t.ok(await t.ate('S.story.ride === 1'), 'depois da abertura o jogador conduz o cavalo');
  t.ok(await t.ev("mode === 'play' && !!P.mnt"), 'está montado e com o controle');
  t.ok(await t.ev("document.getElementById('jorn').textContent.includes('Chegada')"), 'o painel mostra o objetivo da chegada');
  await t.foto('chegada');
  await t.ev('const f = felE(); P.x = f.x - 2 * TS; P.y = f.y; 0');
  t.ok(await t.ate("mode === 'cs'"), 'perto do Seu Felipe começa a cena de boas-vindas');
  await t.ev('skipCS(); 0'); t.ok(await t.ate('S.story.parto === 1'), 'a Estrela começa a parir no primeiro dia');
  t.igual(await t.ev('S.day'), 1, 'ainda é o dia 1');
  await t.ev('const m = estrela(); P.mnt = null; P.x = m.x - TS; P.y = m.y; 0');
  t.ok(await t.ate("mode === 'cs'"), 'perto da vaca começa a cena do parto');
  await t.ev('skipCS(); 0'); t.ok(await t.ate("M.open && !!document.getElementById('calfN')"), 'abre a janela para dar nome ao bezerro');
  await t.foto('nome');
  await t.ev("document.getElementById('calfN').value = 'Esperança'; A.calfName(); 0");
  t.igual(await t.ev('byId(S.story.calf).n'), 'Esperança', 'o bezerro recebe o nome escolhido');
  t.igual(await t.ev('S.story.parto'), 2, 'o parto termina');
  t.ok(await t.ate('S.tut && S.tut.i === 0 && tutOn()'), 'depois disso começa o tutorial');
  t.ok((await t.ev('S.inv.iodo || 0')) >= 2, 'o Seu Felipe deixa iodo para o umbigo');
  // fogueira da primeira noite
  await t.ev('S.tut.done = 1; S.min = 18.5 * 60; 0');
  t.ok(await t.ate("mode === 'cs'", 12000), 'ao anoitecer começa a fogueira com causos');
  await t.foto('fogueira');
  await t.ev('skipCS(); 0'); t.ok(await t.ate('S.bau && S.bau.st === 1'), 'a fogueira abre o mistério do baú do avô');
  t.ok(await t.ev("document.getElementById('jorn').textContent.includes('chave')"), 'a pista aparece no painel da Jornada');
  // o baú: a chave e as quatro lembranças
  await t.ev('P.x = BAU_KEY.at[0] * TS; P.y = BAU_KEY.at[1] * TS; 0');
  t.ok(await t.ate('S.bau.st === 2 && M.open'), 'a chave é achada no esteio da varanda');
  for (const k of ['porteira', 'acude', 'igreja', 'bene']) {
    await t.ev('closeModal(); 0'); await t.espera(300);
    await t.ev(`const b = BAU.find(q => q.k === '${k}'); P.x = b.at[0] * TS; P.y = b.at[1] * TS; 0`);
    t.ok(await t.ate(`!!S.bau.f['${k}']`), 'lembrança encontrada: ' + k);
  }
  t.ok(await t.ev('S.bau.done === 1'), 'o baú é desvendado');
  t.ok(await t.ev("wOk('hat', HATS.findIndex(h => h.id === 'avo'))"), 'o Chapéu do Avô é liberado');
  await t.ev('closeModal(); conqTick(); 0');
  // primeira venda
  await t.ev('closeModal(); S.stats.sold = 1; 0'); const vend = await t.ate('S.flags.venda1 === 1', 25000); t.ok(vend, 'a primeira venda é comemorada');
  // salvar no meio da chegada e voltar
  await t.ev('S.story.ride = 1; S.story.intro = 0.5; SAVE.save("auto", true); 0');
  t.ok(await t.ev('JSON.parse(SAVE.serialize()).story.ride === 1'), 'o progresso da chegada fica salvo');
  t.semErros();
} };
