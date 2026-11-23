module.exports = { nome: 'As 16 cutscenes terminam e devolvem o controle', tempo: 600, async rodar(t) {
  await t.abrir({ tela: { width: 390, height: 760 }, ajustes: { cenas: true, view: 'hd2d', viewLock: true } }); await t.jogoNovo(); await t.ev('S.min = 9*60; S.cash += 50000; 0');
  const cenas = [['horta', 'csHorta()'], ['praga', "csPraga('h1')"], ['colheita', "csColheita(plotById('h1'), 'tomate', 'Colheu tomates')"], ['trator', "(()=>{ S.lots.C = { b: 'roca', prog: 1, done: true }; csTrator('C'); })()"],
    ['obraStart', "(()=>{ S.lots.A = { b: 'cocho', prog: 0, done: false }; csObraStart('A'); })()"], ['obraFim', "(()=>{ S.lots.A = { b: 'cocho', prog: 1, done: true }; csObraFim('A'); })()"], ['expansao', "csExpansion('norte')"], ['parto', "csParto(myAnimals('boi').find(a => a.sex === 'F'))"],
    ['truckIn', "(()=>{ const a = mkAnimal('boi', 'nelore', { age: 20 }); a.own = 'player'; const p = randIn('receb'); a.x = p[0]; a.y = p[1]; S.animals.push(a); csTruckIn([a.id]); })()"], ['truckOut', "(()=>{ const a = myAnimals('boi')[0]; csTruckOut([csClone(a)], 1234, 'Vendido'); })()"],
    ['theft', "(()=>{ const a = myAnimals('boi')[1] || myAnimals('boi')[0]; csTheft({ names: [a.n], c: [{ id: a.id, sp: a.sp, br: a.br, coat: a.coat, sex: a.sex, age: a.age, wt: a.wt, n: a.n, x: a.x, y: a.y, f: 1, gen: a.gen, skills: [], traits: [] }] }); })()"], ['escape', "csEscape(myAnimals('boi')[0])"], ['oxcart', 'csOxCart()'], ['brete', "csBrete('vac', 'vacina polivalente', myAnimals('boi').slice(0, 2))"], ['pardo', '(()=>{ S.flags.pardo = 0; csPardo(); })()'], ['chuva', 'csChuva()']];
  for (const [n, code] of cenas) {
    await t.ev('P.x = 14*TS; P.y = 36*TS; P.mnt = null; P._act = null; cam.snap = true; 0'); await t.espera(200); await t.ev(code + '; 0');
    const t0 = Date.now(); let last = -1, lt = Date.now(), travou = false;
    while ((await t.ev('mode')) === 'cs' && Date.now() - t0 < 90000) { const i = await t.ev('CS.i'); if (i !== last) { last = i; lt = Date.now(); } if (Date.now() - lt > 30000) { travou = true; break; } await t.espera(250); }
    t.ok(!travou && (await t.ev('mode')) === 'play', 'a cena "' + n + '" terminou em ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s');
  }
  t.semErros();
} };
