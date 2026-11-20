// v9.1: Serra das Três Pontas e as fazendas novas do leste; save antigo com mapa menor
module.exports = { nome: 'Serra das Três Pontas e fazendas do leste', async rodar(t) {
  await t.abrir({ ajustes: { view: '2d', cenas: false } }); await t.jogoNovo();
  t.ok(await t.ev('MW === 376 && LST.ok && LST.pontas.length === 3 && LST.sedes.length === 5'), 'mapa mais largo, três pontas de pedra e cinco sedes');
  t.ok(await t.ev("['tresPontas', 'jundia', 'caititu', 'novaEsp', 'pauBrasil'].every(o => S.animals.filter(a => a.own === o).length >= 4)"), 'cada fazenda nova tem gado no pasto');
  t.ok(await t.ev("['tpPasto', 'jdPasto', 'ctPasto', 'nePasto', 'pbPasto'].every(k => AREAS[k].gate >= 0 && GATES[AREAS[k].gate])"), 'os pastos têm cerca e porteira');
  t.ok(await t.ev("regionAt(240 * TS, 20 * TS)[0] === 'Fazenda Três Pontas' && regionAt(202 * TS, 30 * TS)[0] === 'Serra das Três Pontas'"), 'regiões com o nome certo');
  t.ok(await t.ev("ground[gi(90, 44)] === G.PAVE || ground[gi(90, 44)] === G.WALK"), 'a cidade original continua igual');
  // dá para ir pela estrada até a última fazenda
  await t.ev("P.x = 236 * TS; P.y = 47 * TS; S.flags.leste = 1; 0"); await t.espera(800);
  t.ok(await t.ev("interactables().some(o => o.k === 'placaF')"), 'a placa da fazenda tem a história');
  await t.foto('36_sede');
  await t.ev("P.x = (TP.mirante[0] + 0.5) * TS; P.y = (TP.mirante[1] + 0.5) * TS; 0"); await t.espera(600);
  t.ok(await t.ev("interactables().some(o => o.k === 'mirante')"), 'o mirante da Ponta Sul tem interação');
  await t.foto('36_tres_pontas');
  const sv = await t.ev("(() => { let px = -1, py = -1; for (let y = 30; y < 60 && px < 0; y++) for (let x = 5; x < 50; x++) if (ground[gi(x, y)] === G.PAST) { px = x; py = y; break; } const o = JSON.parse(SAVE.serialize()); const ow = 192, u = new Uint8Array(ow * MH); for (let y = 0; y < MH; y++) for (let x = 0; x < ow; x++) u[y * ow + x] = Math.min(255, grass[gi(x, y)] | 0); u[py * ow + px] = 77; o.grass = encodeU8(u); delete o.mw; SAVE.apply(o); return [grass[gi(px, py)], S.mw, LST.ok]; })()");
  t.ok(sv[0] === 77 && sv[1] === 376 && sv[2], 'save antigo (mapa de 192 de largura) abre com o capim no lugar certo');
  t.semErros();
} };
