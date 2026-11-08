// v9.0: Itarantim de verdade (ruas do OpenStreetMap), Serra das Três Pontas e save antigo com mapa menor
module.exports = { nome: 'Itarantim real e Serra das Três Pontas', tempo: 240000, async rodar(t) {
  await t.abrir({ ajustes: { view: '2d', cenas: false } }); await t.jogoNovo();
  const r = await t.ev("({ mw: MW, ok: ITR.ok, casas: ITR.houses.length, pubs: ITR.pubs.map(b => b.k), pontas: ITR.pontas.length, ruas: ITR.rname.filter(v => v > 0).length })");
  t.ok(r.mw === 376 && r.ok, 'o mapa ficou mais largo e a cidade real foi gerada');
  t.ok(r.casas > 400, 'quadras cheias de casas (' + r.casas + ')');
  for (const k of ['townhall', 'courthouse', 'hospital', 'school', 'bank', 'post_office', 'bus_station', 'fuel', 'park', 'stadium', 'cemetery']) t.ok(r.pubs.includes(k), 'tem ' + k);
  t.ok(r.pontas === 3 && r.ruas > 500, 'três pontas de pedra e ruas com nome');
  // anda até a praça: aparece o nome da rua e a região certa
  await t.ev("const b = ITR.pubs.find(b => /Castro Alves/.test(b.n)); let best = null; for (let y = 100; y < 125; y++) for (let x = 250; x < 280; x++) if (ITR.rname[gi(x, y)] > 0 && !obj[gi(x, y)] && (!best || hyp(x - b.x, y - b.y) < hyp(best[0] - b.x, best[1] - b.y))) best = [x, y]; P.x = (best[0] + 0.5) * TS; P.y = (best[1] + 0.5) * TS; S.flags.itaReal = 1; cam.x = P.x; cam.y = P.y; 0");
  await t.espera(1500);
  t.ok(await t.ev("document.getElementById('itrRua').classList.contains('on') && document.getElementById('itrRua').textContent.length > 4"), 'o nome da rua aparece no alto da tela');
  t.ok(await t.ev("regionAt(P.x, P.y)[0] === 'Itarantim'"), 'a região é Itarantim');
    await t.espera(2500);
  await t.foto('36_praca');
  t.ok(await t.ev('ITR.walkers.length > 0'), 'tem gente andando nas calçadas');
  // mirante
  await t.ev("P.x = (TP.mirante[0] + 0.5) * TS; P.y = (TP.mirante[1] + 0.5) * TS; 0"); await t.espera(600);
  t.ok(await t.ev("interactables().some(o => o.k === 'mirante')"), 'o mirante da Ponta Sul tem interação');
  await t.foto('36_tres_pontas');
  // save: grava a largura e um save antigo (192 de largura) volta com o capim no lugar
  const sv = await t.ev("(() => { let px = -1, py = -1; for (let y = 30; y < 60 && px < 0; y++) for (let x = 5; x < 50; x++) if (ground[gi(x, y)] === G.PAST) { px = x; py = y; break; } const o = JSON.parse(SAVE.serialize()); const ow = 192, u = new Uint8Array(ow * MH); for (let y = 0; y < MH; y++) for (let x = 0; x < ow; x++) u[y * ow + x] = Math.min(255, grass[gi(x, y)] | 0); u[py * ow + px] = 77; o.grass = encodeU8(u); delete o.mw; SAVE.apply(o); return [px, py, grass[gi(px, py)], S.mw, ITR.ok]; })()");
  t.ok(sv[2] === 77 && sv[3] === 376 && sv[4], 'save antigo (mapa de 192 de largura) abre com o capim no lugar certo ' + JSON.stringify(sv));
  t.semErros();
} };
