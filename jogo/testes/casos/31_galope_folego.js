// v7.9.3: galope mais longo — o fôlego dura dezenas de segundos, cai a velocidade aos poucos e recupera parado
module.exports = { nome: 'Galope e fôlego do cavalo', async rodar(t) {
  await t.abrir({ ajustes: { view: '2d', cenas: false } }); await t.jogoNovo();
  // simula o galope quadro a quadro (60 por segundo, no relógio do jogo), sempre num campo aberto
  const sim = br => t.ev(`(() => { paused = true; const h = S.animals.find(a => a.own === 'player' && a.sp === 'cavalo'); h.br = '${br}'; h.age = 60; h.cond = 80; P.mnt = h.id; h._st = 'ridden'; h._stam = 100; h._winded = false; P._act = null;
    const keys0 = Object.assign({}, input); let tg = 0, v0 = 0, v20 = 0;
    for (let i = 0; i < 60 * 180 && !h._winded; i++) { P.x = 70 * TS; P.y = 120 * TS; input.x = 1; input.y = 0; input.gal = true; updPlayer(1 / 60); const v = Math.hypot(P._vx, P._vy); if (i === 120) v0 = v; if (h._stam < 12 && !v20) v20 = v; tg += 1 / 60; }
    input.x = 0; input.gal = false; let tr = 0; for (let i = 0; i < 60 * 120 && h._stam < 30; i++) { P._vx = P._vy = 0; updPlayer(1 / 60); tr += 1 / 60; }
    paused = false; return { tg: +tg.toFixed(1), tr: +tr.toFixed(1), slow: v20 && v0 ? +(v20 / v0).toFixed(2) : 1, winded: h._winded }; })()`);
  const mm = await sim('mm'), psi = await sim('psi'), cri = await sim('crioulo');
  t.ok(mm.tg >= 30 && mm.tg <= 60, 'Mangalarga galopa ' + mm.tg + ' s até cansar (antes uns 9 s)');
  t.ok(psi.tg >= 18 && psi.tg < mm.tg, 'Puro-Sangue, o mais veloz, cansa antes: ' + psi.tg + ' s');
  t.ok(cri.tg > mm.tg, 'Crioulo, o mais resistente, aguenta mais: ' + cri.tg + ' s');
  t.ok(mm.slow < 0.95 && mm.slow > 0.6, 'com pouco fôlego a velocidade cai aos poucos (' + Math.round(mm.slow * 100) + '% da velocidade)');
  t.ok(mm.tr > 3 && mm.tr < 20, 'parado, recupera fôlego para galopar de novo em ' + mm.tr + ' s');
  await t.ev("const h = S.animals.find(a => a.own === 'player' && a.sp === 'cavalo'); P.mnt = h.id; hudT = 0; hud(0.016); 0");
  t.ok(await t.ev("document.querySelector('#bg .stb') !== null"), 'o botão de galope mostra a barra de fôlego');
  t.semErros();
} };
