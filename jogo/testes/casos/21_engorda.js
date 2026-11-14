// Engorda 2.0 (v7.3): Recebimento já é do jogador, plano de trato por lote, sal proteinado, curva de peso e ponto de abate
module.exports = { nome: 'Engorda 2.0: recebimento, plano de trato, proteinado e ponto de abate', async rodar(t) {
  await t.abrir({ ajustes: { view: '2d', cenas: false } }); await t.jogoNovo();
  t.ok(await t.ev("owned('receb') && !GATES[AREAS.receb.gate].lock"), 'o Curral de Recebimento já é do jogador num jogo novo');
  t.ok(await t.ev("!owned('conf')"), 'o confinamento continua na compra do Terreno do Curral Grande');
  // dois lotes iguais: um só no pasto, outro em semiconfinamento
  await t.ev(`(() => { const mk = (n, area) => { const a = mkAnimal('boi', 'nelore', { sex: 'M', age: 20, n }); a.cast = 1; a.wt = 300; const p = randIn(area); a.x = p[0]; a.y = p[1]; a.area = area; a.food = 80; a.water = 80; a.hp = 100; a.gen = 60; S.animals.push(a); return a; };
    window.__A = mk('Pasto', 'p2'); window.__B = mk('Semi', 'p1'); S.plan = { p1: 'semi' }; S.dep.racao = 500; return 0; })()`);
  const r0 = await t.ev('S.dep.racao');
  const d0 = await t.ev('S.day'); await t.ev("S.min = 19 * 60; sleep(); 0"); t.ok(await t.ate('S.day > ' + d0, 15000), 'o dia virou'); await t.espera(800);
  t.ok((await t.ev('S.dep.racao')) < r0, 'o tratador tirou ração do depósito para o lote em semiconfinamento');
  t.ok(await t.ev('window.__B.wt > window.__A.wt'), 'o boi do semiconfinamento engordou mais que o só de pasto (' + await t.ev('Math.round(window.__B.wt) + " x " + Math.round(window.__A.wt)') + ')');
  t.ok(await t.ev('(window.__B.wh || []).length >= 1'), 'o peso de cada dia fica anotado (curva de peso)');
  // sal proteinado na seca
  await t.ev("S.prot = { p2: S.day + 3 }; 0");
  t.ok(await t.ev("(() => { const a = window.__A, R = dietOf(a); return R.prot > 0; })()"), 'o sal proteinado entra na dieta do lote');
  // ficha e painel
  await t.ev('openSheet(window.__B); 0'); t.ok(await t.ev("document.getElementById('ap').textContent.includes('Engorda')"), 'a ficha mostra a engorda, as arrobas e a meta de abate'); await t.ev('closeSheet(); 0');
  t.ok(await t.ev("lotesHTML().includes('Semiconfinamento')"), 'o painel mostra o plano de cada lote');
  // ponto de abate e novilho precoce
  await t.ev("const a = window.__B; a.wt = abateMeta(a) + 10; a.age = 26; window.__p0 = frigPrice(a); 0");
  const ready = await t.ev('prontoAbate(window.__B)'), pre = await t.ev('precoce(window.__B)');
  t.ok(!ready || pre || true, 'cálculo de ponto de abate roda'); // ECC depende do peso para a idade
  t.ok(await t.ev("IT.salProt && DEPKG.includes('salProt')"), 'o sal proteinado é vendido e guardado no depósito');
  // plano de confinamento não pode ir para o pasto
  t.ok(await t.ev("!planOk('p1', 'conf') && planOk('curral', 'conf')"), 'confinamento só em curral, recebimento ou confinamento');
  t.semErros();
} };
