// Uso: node jogo/testes/resistencia.js [minutos]   — joga sozinho num celular simulado e mede memória, quadros e erros.
const { chromium, devices } = require('playwright'); const { servir } = require('./lib');
(async () => {
  const min = +(process.argv[2] || 8), srv = await servir(), base = 'http://127.0.0.1:' + srv.address().port;
  const b = await chromium.launch({ args: ['--enable-precise-memory-info'] }), c = await b.newContext(devices['Pixel 7']), p = await c.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message.split('\n')[0])); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().split('\n')[0]); });
  if (process.env.LEVE) await p.addInitScript(() => { try { localStorage.setItem('lida_set', JSON.stringify({ q: 'leve', view: '2d', aves: 'poucas', dof: false })); } catch (e) { } });
  await p.goto(base + '/index.html#debug&nointro'); await p.waitForFunction(() => window.__lida); await p.waitForTimeout(800);
  const ev = s => p.evaluate(s => window.__lida.ev(s), s);
  await ev('newGame(defaultCF())'); await p.waitForTimeout(800);
  for (let i = 0; i < 60 && (await ev('mode')) !== 'play'; i++) { await p.evaluate(() => { const s = document.getElementById('skip'); s && s.offsetParent && s.click(); }); await p.waitForTimeout(400); }
  await ev('tutEnd(true); 0');
  const medir = async () => JSON.parse(await p.evaluate(() => new Promise(r => { let n = 0; const t = performance.now(); (function f() { n++; if (performance.now() - t < 2000) requestAnimationFrame(f); else r(JSON.stringify({ fps: +(n / 2).toFixed(1), mem: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1e6) : -1 })); })(); })));
  const acoes = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'];
  const t0 = Date.now(), fim = t0 + min * 60000; let prox = t0, rodada = 0; const linhas = [];
  while (Date.now() < fim) {
    const r = Math.random();
    if (r < 0.55) { const k = acoes[(Math.random() * acoes.length) | 0], run = Math.random() < 0.4; if (run) await p.keyboard.down('ShiftLeft'); await p.keyboard.down(k); await p.waitForTimeout(400 + Math.random() * 1600); await p.keyboard.up(k); if (run) await p.keyboard.up('ShiftLeft'); }
    else if (r < 0.65) { await p.keyboard.press('KeyR'); await p.waitForTimeout(600); }
    else if (r < 0.72) { await p.keyboard.press('KeyQ'); await p.waitForTimeout(400); }
    else if (r < 0.8) { await p.keyboard.press('KeyM'); await p.waitForTimeout(500); await ev("A.tab && A.tab(MTABS[(Math.random() * MTABS.length) | 0][0]); 0").catch(() => { }); await p.waitForTimeout(500); await p.keyboard.press('Escape'); }
    else if (r < 0.86) { await p.keyboard.press('KeyE'); await p.waitForTimeout(800); for (let i = 0; i < 3; i++) await p.keyboard.press('Escape'); }
    else if (r < 0.9) { await ev("(()=>{ const R = [[30,46],[90,45],[72,160],[22,186],[150,112],[14,36]], q = R[(Math.random() * R.length) | 0]; P.mnt = null; P.cart = false; P.boat = false; P.x = q[0] * TS; P.y = q[1] * TS; cam.snap = true; })()").catch(() => { }); await p.waitForTimeout(1500); }
    else { await p.waitForTimeout(1500); }
    if ((await ev('mode').catch(() => 'play')) === 'cs') await ev('skipCS && skipCS(); 0').catch(() => { });
    if (Date.now() >= prox) { prox += 30000; const m = await medir(), st = JSON.parse(await ev('JSON.stringify({ dia: S.day, h: clock(), chao: GCH2.size, sprites: typeof CACHE !== "undefined" && CACHE.size !== undefined ? CACHE.size : -1, animais: S.animals.length, aves: AVES.length, mode })'));
      const l = `${String(Math.round((Date.now() - t0) / 1000)).padStart(4)} s  ${String(m.fps).padStart(5)} qps  mem ${String(m.mem).padStart(4)} MB  chão ${st.chao}  sprites ${st.sprites}  animais ${st.animais}  aves ${st.aves}  dia ${st.dia} ${st.h}  erros ${errs.length}`; console.log(l); linhas.push(m); }
    rodada++;
  }
  const mem = linhas.map(l => l.mem), fps = linhas.map(l => l.fps);
  console.log(`\nResumo: ${rodada} ações em ${min} min · qps médio ${(fps.reduce((a, b) => a + b, 0) / fps.length).toFixed(1)} (mín ${Math.min(...fps)}) · memória ${mem[0]} → ${mem[mem.length - 1]} MB (máx ${Math.max(...mem)}) · ${errs.length} erro(s)`);
  if (errs.length) console.log([...new Set(errs)].slice(0, 8).join('\n'));
  await b.close(); srv.close(); process.exit(errs.length ? 1 : 0);
})();
