// Simula um ano de jogo com um "jogador típico" e mede entradas e saídas por categoria.
// Uso: node jogo/testes/economia.js [medio|novo]
// Simula um ano do jogo (336 dias) com um jogador cuidadoso e mostra entradas e saídas por categoria.
const { chromium } = require('playwright'); const { servir } = require('./lib');
(async () => { const srv = await servir(), base = 'http://127.0.0.1:' + srv.address().port; const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 800, height: 500 } }); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { try { localStorage.setItem('lida_set', JSON.stringify({ cenas: false, view: '2d' })); } catch (e) { } });
  await p.goto(base + '/index.html#debug&nointro'); await p.waitForFunction(() => window.__lida); await p.waitForTimeout(800);
  const ev = s => p.evaluate(s => window.__lida.ev(s), s);
  await ev('newGame(defaultCF())'); await p.waitForTimeout(800);
  for (let i = 0; i < 60 && (await ev('mode')) !== 'play'; i++) { await p.evaluate(() => { const s = document.getElementById('skip'); s && s.offsetParent && s.click(); }); await p.waitForTimeout(300); }
  await ev('tutEnd(true); toast = () => {}; say = () => {}; 0');
  const cen = process.argv[2] || 'medio';
  const r = await ev(`(()=>{
    const cen = '${cen}';
    if (cen === 'medio') { // fazenda no meio do jogo: 20 vacas, 1 touro, 3 obras, casa de alvenaria, 3 cavalos
      const add = (br, o, area) => { const a = mkAnimal('boi', br, Object.assign({ own: 'player' }, o)); const q = randIn(area || 'p1'); a.x = q[0]; a.y = q[1]; a.own = 'player'; S.animals.push(a); return a; };
      add('nelore', { sex: 'M', age: 40, n: 'Touro' }); for (let i = 0; i < 20; i++) add(pick(['nelore', 'girolando', 'gir', 'caracu']), { sex: 'F', age: rint(26, 70) }, i % 2 ? 'p1' : 'p2');
      for (let i = 0; i < 2; i++) { const h = mkAnimal('cavalo', 'nordestino', { age: 50 }); h.own = 'player'; S.animals.push(h); }
      S.lots.A = { b: 'cocho', prog: 1, done: true }; S.lots.B = { b: 'silo', prog: 1, done: true }; S.lots.C = { b: 'ordenha', prog: 1, done: true }; S.house = 1; S.cash += 20000;
    }
    const cat = {}, add = (k, v) => cat[k] = (cat[k] || 0) + v;
    const led0 = S.ledger.length; let lastLed = S.ledger[0];
    const months = [];
    for (let d = 0; d < 336; d++) {
      S.min = 6 * 60; for (let h = 6; h < 24; h += 1) { try { hourTick(h); } catch (e) { } }
      dayTick(); cattleTick(1);
      // trato: cocho de água cheio e sal; ração na seca (comprada)
      TROUGHS.forEach((t, i) => { if (AREAS[t.a] && AREAS[t.a].k === 'pasto') S.tr[i] = trCap(i); });
      if (season()) { const n = myAnimals('boi').length, kg = n * 2; const v = kg / 25 * IT.racao.p * priceMul(); S.cash -= v; add('- ração (seca)', v); S.dep.racao = 500; }
      // sanidade de um jogador cuidadoso: vacina a cada 6 meses, antirrábica 1x por ano, trata quem adoece, cocho com comida na seca
      for (const a of myAnimals('boi')) { if (!((a.vacc || 0) >= S.day)) { a.vacc = S.day + 168; add('- vacinas e remédios', IT.vacina.p); } if (!((a.vRaiva || 0) >= S.day)) { a.vRaiva = S.day + 336; add('- vacinas e remédios', IT.vacRaiva.p); } if (a.sick) { a.sick = 0; a.dz = null; a.hp = Math.max(a.hp, 70); add('- vacinas e remédios', IT.remedio.p); } if (season()) a.food = Math.max(a.food || 0, 75); a.water = Math.max(a.water || 0, 80); }
      // leite e ovos vendidos no mercadinho
      if (S.milk > 0) { const v = S.milk * IT.leite.p * 0.9; S.cash += v; add('+ leite', v); S.milk = 0; }
      if (S.eggs > 0) { const v = S.eggs * IT.ovo.p * 0.9; S.cash += v; add('+ ovos', v); S.eggs = 0; }
      // a cada 28 dias vende os machos prontos (24+ meses) e as vacas velhas
      if (d % 28 === 27) { for (const a of myAnimals('boi').slice()) { if ((a.sex === 'M' && a.age >= 24 && !a.repro && a.n !== 'Touro') || (a.sex === 'F' && a.age > 220)) { const v = frigPrice(a); soldRecord(a, v, 'sim'); S.animals = S.animals.filter(x => x !== a); S.cash += v; add('+ venda de gado', v); } } }
      if (d % 7 === 6) months.push({ dia: d + 1, cab: myAnimals('boi').length, mortos: S.stats.dead || 0, caixa: Math.round(S.cash + S.acct) });
    }
    // custos e receitas automáticas do jogo, pelo extrato
    for (const l of S.ledger) { if (/Manutenção/.test(l.desc)) add('- manutenção', -l.v); else if (/ITR/.test(l.desc)) add('- ITR', -l.v); }
    const I = S.itr; if (I && !I.paid) add('- ITR (boleto)', I.v);
    const out = {}; for (const k in cat) out[k] = Math.round(cat[k]);
    return JSON.stringify({ cen, cat: out, meses: months.filter((m, i) => i % 12 === 11), final: { cab: myAnimals('boi').length, patr: Math.round(patrimonio()), manut: manutTotal(), itr: itrValor() } }, null, 1);
  })()`);
  console.log(r); if (errs.length) console.log('erros', errs.slice(0, 3)); await b.close(); srv.close(); })();
