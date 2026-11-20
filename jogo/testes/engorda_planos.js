// Simula a engorda de um lote de 10 garrotes em cada plano de trato e mostra o lucro por cabeça.
// Uso: node jogo/testes/engorda_planos.js [dias] [mes_inicial]
const { chromium } = require('playwright'); const { servir } = require('./lib');
(async () => { const srv = await servir(), base = 'http://127.0.0.1:' + srv.address().port; const b = await chromium.launch();
  const dias = +(process.argv[2] || 120), mes0 = +(process.argv[3] || 0); const out = [];
  for (const plano of ['pasto', 'mineral', 'proteinado', 'semi', 'conf']) {
    const p = await b.newPage({ viewport: { width: 800, height: 500 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(() => { try { localStorage.setItem('lida_set', JSON.stringify({ cenas: false, view: '2d' })); } catch (e) { } });
    await p.goto(base + '/index.html#debug&nointro'); await p.waitForFunction(() => window.__lida); await p.waitForTimeout(600);
    const ev = s => p.evaluate(s => window.__lida.ev(s), s);
    await ev('newGame(defaultCF())'); await p.waitForTimeout(800);
    for (let i = 0; i < 60 && (await ev('mode')) !== 'play'; i++) { await p.evaluate(() => { const s = document.getElementById('skip'); s && s.offsetParent && s.click(); }); await p.waitForTimeout(300); }
    await ev('introSkipAll && introSkipAll(); tutEnd(true); toast = () => {}; say = () => {}; 0');
    const r = await ev(`(()=>{
      const plano = '${plano}', area = plano === 'conf' ? 'curral' : 'p2';
      S.day += ${mes0} * 28; S.animals.filter(a => a.own === 'player' && a.sp === 'boi').forEach(a => { a.area = 'p1'; const q = randIn('p1'); a.x = q[0]; a.y = q[1]; });
      const L = []; for (let i = 0; i < 10; i++) { const a = mkAnimal('boi', 'nelore', { own: 'player', sex: 'M', age: 8 }); a.cast = 1; a.wt = expWt(a); a.hp = 100; a.vacc = 9999; a.vRaiva = 9999; a.area = area; const q = randIn(area); a.x = q[0]; a.y = q[1]; markBought(a, animalValue(a)); S.animals.push(a); L.push(a); }
      const compra = L.reduce((s, a) => s + a.buyP, 0);
      S.plan = S.plan || {}; S.plan[area] = plano; S.cash += 1e6; S.acct += 1e6; S.dep = { racao: 0, silagem: 0, sal: 0, salProt: 0 };
      let gasto = 0; const preco = { racao: IT.racao.p / IT.racao.kg, silagem: IT.silagem.p / IT.silagem.kg, sal: IT.sal.p / IT.sal.kg, salProt: IT.salProt.p / IT.salProt.kg };
      const acct0 = S.acct; let w30 = 0;
      for (let d = 0; d < ${dias}; d++) {
        for (const k in preco) { const falta = 3000 - (S.dep[k] || 0); if (falta > 0) { gasto += falta * preco[k]; S.dep[k] = 3000; } }
        S.arroba = 312; S.ronda = S.day; S.min = 6 * 60; for (let h = 6; h < 24; h++) { try { hourTick(h); } catch (e) { } }
        dayTick(); cattleTick(1);
        TROUGHS.forEach((t, i) => { if (t.a === area || t.a === 'p1') S.tr[i] = trCap(i); });
        for (const a of L) { if (!S.animals.includes(a)) S.animals.push(a); a.sick = 0; a.dz = null; a.hp = Math.max(a.hp, 90); a.food = Math.max(a.food, plano === 'conf' ? 70 : a.food); }
        if (d === 29) w30 = L.reduce((s, a) => s + a.wt, 0) / L.length;
      }
      const vivos = L.filter(a => S.animals.includes(a));
      for (const k in preco) gasto -= (S.dep[k] || 0) * preco[k] - 0; // devolve o que sobrou no depósito
      S.arroba = 312; const venda = vivos.reduce((s, a) => s + frigPrice(a), 0), tratador = acct0 - S.acct;
      const pesoF = vivos.reduce((s, a) => s + a.wt, 0) / Math.max(1, vivos.length);
      return { plano, dias: ${dias}, vivos: vivos.length, pesoIni: Math.round(L[0].buyW), peso30: Math.round(w30), pesoFim: Math.round(pesoF), compra: Math.round(compra / 10), venda: Math.round(venda / Math.max(1, vivos.length)), trato: Math.round(gasto / 10), lucroCab: Math.round((venda - compra - gasto) / 10), lucroDia: Math.round((venda - compra - gasto) / 10 / ${dias}), tratoPorGanho: +(gasto / Math.max(1, venda - compra)).toFixed(2), arroba: S.arroba };
    })()`);
    out.push(r); if (errs.length) console.log(plano, 'erros', errs.slice(0, 2)); await p.close();
  }
  console.table(out); await b.close(); srv.close(); })();
