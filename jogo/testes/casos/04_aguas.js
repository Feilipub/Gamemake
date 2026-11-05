module.exports = { nome: 'Rio Pardo: pesca, canoa, aves e venda', tempo: 200, async rodar(t) {
  await t.abrir({ ajustes: { view: '2d', cenas: false } }); await t.jogoNovo();
  await t.ev("S.min = 6*60; S.weather = 'sol'; S.cash += 5000; S.flags.pardo = 1; window.FF = (n, f) => { for (let i = 0; i < n; i++) { if (f) f(i); tick(1/30); } }; 0");
  await t.ev("['vara','molinete'].forEach(k => buyItem(k, 1, 'inv')); buyItem('minhoca', 20, 'inv'); buyItem('massa', 20, 'inv'); 0");
  const pesca = await t.ev(`(()=>{ P.x = (PARDO.pier + 0.5)*TS; P.y = (PARDO.top(PARDO.pier) + 2.5)*TS; let n = 0; for (let r = 0; r < 12; r++) { startFishing(); FS.bait = 'massa'; fishPress(true); FF(25); fishPress(false); FF(30); let k = 0; while (FS.st === 'wait' && k++ < 1500) tick(1/30); if (FS.st === 'bite') { fishPress(true); let j = 0; while (FS.st === 'fight' && j++ < 3000) { FS.hold = FS.ten < 0.6; tick(1/30); } } if (FS.card) { n++; fishKeep(true); } } stopFishing(); return n; })()`);
  t.ok(pesca >= 1, 'pescou peixes no trapiche (' + pesca + ' em 12 tentativas)');
  const canoa = await t.ev("(()=>{ S.boat.rent = S.day; P.x = S.boat.x; P.y = S.boat.y - 20; boatBoard(); const y0 = P.y; FF(120, () => { input.x = 0; input.y = 1; }); input.x = input.y = 0; FF(10); return P.boat + ',' + Math.round(P.y - y0); })()");
  t.ok(canoa.startsWith('true,') && +canoa.split(',')[1] > 20, 'embarcou na canoa e remou');
  const aves = await t.ev("(()=>{ let tot = 0; for (const [x, y] of [[30,46],[22,186],[152,184],[72,160]]) { P.boat = false; P.x = x*TS; P.y = y*TS; for (let i = 0; i < 6; i++) { cam.x = P.x - VW()/2; cam.y = P.y - VH()/2; FF(60); } tot += AVES.length; } return tot; })()");
  t.ok(aves > 0, 'aves aparecem pelo mapa (' + aves + ')'); t.ok(await t.ev('AVES.length <= 22'), 'número de aves respeita o limite');
  const v = await t.ev('(()=>{ const c0 = S.cash; openBene(); A.fishSellAll("1"); closeModal(); return Math.round(S.cash - c0); })()');
  t.ok(v > 0, 'vendeu o peixe ao Seu Bené (R$ ' + v + ')');
  t.semErros();
} };
