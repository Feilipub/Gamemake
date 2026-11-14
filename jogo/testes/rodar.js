#!/usr/bin/env node
// Roda os testes do jogo: node testes/rodar.js [nome ...]   (sem nome = todos)
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const { servir, Teste, Falha } = require('./lib');
(async () => {
  const filtro = process.argv.slice(2), dir = path.join(__dirname, 'casos');
  const casos = fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort().map(f => ({ arq: f, ...require(path.join(dir, f)) })).filter(c => !filtro.length || filtro.some(n => c.arq.includes(n)));
  const srv = await servir(), base = 'http://127.0.0.1:' + srv.address().port, nav = await chromium.launch();
  let falhas = 0; const t00 = Date.now();
  for (const c of casos) {
    const t = new Teste(nav, base, c.arq.replace('.js', '')), t0 = Date.now(); let st = 'PASSOU', det = '';
    try { await Promise.race([c.rodar(t), new Promise((_, rej) => setTimeout(() => rej(new Falha('tempo esgotado (' + (c.tempo || 240) + ' s)')), (c.tempo || 240) * 1000))]); }
    catch (e) { st = 'FALHOU'; falhas++; det = e instanceof Falha ? e.message : (e.stack || String(e)).split('\n').slice(0, 3).join('\n    '); }
    await t.fechar().catch(() => { });
    console.log(`${st === 'PASSOU' ? '✅' : '❌'} ${st}  ${c.nome}  (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
    if (process.env.DETALHES || st === 'FALHOU') t.notas.forEach(n => console.log('     ' + n));
    if (det) console.log('     ✘ ' + det);
  }
  await nav.close(); srv.close();
  console.log(`\n${casos.length - falhas} de ${casos.length} testes passaram em ${((Date.now() - t00) / 1000).toFixed(0)} s.`);
  process.exit(falhas ? 1 : 0);
})();
