// v19: mapa novo — Serra da Pedra Pintada e Povoado de Santa Rita: estrada, caminhos, pinturas, missão, quartzo, licuri e bodega
module.exports = { nome: 'Serra da Pedra Pintada e Povoado de Santa Rita', tempo: 300, async rodar(t) {
  await t.abrir({ ajustes: { view: '2d', cenas: false } }); await t.jogoNovo(); await t.ev('toast = () => {}; 0');
  t.ok(await t.ev('SR.ok && SR.casas.length === 7 && ground[gi(150, SR.Y)] === G.DIRT'), 'a região nova foi gerada (estrada, capela, bodega e casinhas)');
  // dá para chegar a cavalo em tudo, saindo da estrada do Rio
  const alc = JSON.parse(await t.ev(`(() => { const ok = i => !obj[i] && ground[i] !== G.WATER; const seen = new Uint8Array(MW * MH), q = [gi(90, 140)]; seen[q[0]] = 1;
    while (q.length) { const i = q.pop(), x = i % MW, y = (i / MW) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= MW || ny >= MH) continue; const j = gi(nx, ny); if (!seen[j] && ok(j)) { seen[j] = 1; q.push(j); } } }
    const alvo = { gruta: [262, 146], paredao: [276, 145], lajedo: [248, 155], mirante: SR.mirante, rita: [309, 147], bastiao: [259, 149], vila: [318, 147], cidade: [84, 49] }; SR.quartzo.forEach((p, i) => alvo['quartzo' + i] = p);
    const r = {}; for (const k in alvo) { const [x, y] = alvo[k]; let a = false; for (let dy = -1; dy <= 1 && !a; dy++) for (let dx = -1; dx <= 1 && !a; dx++) a = !!seen[gi(Math.floor(x) + dx, Math.floor(y) + dy)]; r[k] = a; } return JSON.stringify(r); })()`));
  const falta = Object.keys(alc).filter(k => !alc[k]); t.ok(!falta.length, 'dá para chegar a cavalo em todos os lugares novos' + (falta.length ? ': falta ' + falta.join(', ') : ''));
  // chegada e missão das três pinturas
  await t.ev('P.mnt = null; P.x = 259 * TS; P.y = 150 * TS; srTick(); 0');
  t.ok(await t.ev('!!S.serra.visto && S.stats.serraVisita === 1'), 'aviso de chegada na serra');
  t.ok(await t.ev("(() => { P.x = SR.bastiao[0] * TS; P.y = (SR.bastiao[1] + 0.6) * TS; computeCtx(); return P._ctx && /Bastião/.test(P._ctx.label); })()"), 'o Seu Bastião conversa na trilha');
  await t.ev("P._ctx.fn(); A.srMissao(); closeModal(); 0");
  for (const k of ['gruta', 'paredao', 'lajedo']) {
    t.ok(await t.ev(`(() => { const [, x, y] = SR.paineis['${k}']; P.x = (x + 0.5) * TS; P.y = (y + 1.5) * TS; computeCtx(); if (!P._ctx || !/🪨/.test(P._ctx.label)) return false; P._ctx.fn(); const ok = M.open && /<img src="data:image/.test($('mn').innerHTML) && !!S.serra.ach['${k}']; closeModal(); return ok; })()`), 'pintura achada: ' + k);
  }
  t.ok(await t.ev("(() => { const c0 = S.cash + S.acct, q0 = S.inv.quartzo || 0; A.srPremio(); return S.serra.missao === 2 && Math.round(S.cash + S.acct - c0) === 1500 && (S.inv.quartzo || 0) === q0 + 2; })()"), 'missão completa: R$ 1.500 e 2 cristais');
  // quartzo e licuri
  t.ok(await t.ev("(() => { const [x, y] = SR.quartzo[0]; P.x = (x + 0.5) * TS; P.y = (y + 1.2) * TS; computeCtx(); if (!P._ctx || !/quartzo/.test(P._ctx.label)) return 'sem ação'; const q0 = S.inv.quartzo || 0; P._ctx.fn(); for (let i = 0; i < 90; i++) tick(1 / 30); return (S.inv.quartzo || 0) === q0 + 1 && !srQzOk(0); })()") === true, 'pega cristal de quartzo (e ele volta em uma semana)');
  t.ok(await t.ev("(() => { const [x, y] = SR.licuri[0]; P.x = (x + 0.5) * TS; P.y = (y + 1.6) * TS; computeCtx(); if (!P._ctx || !/licuri/.test(P._ctx.label)) return false; const l0 = S.inv.licuri || 0; P._ctx.fn(); for (let i = 0; i < 90; i++) tick(1 / 30); return (S.inv.licuri || 0) === l0 + 3; })()"), 'colhe licuri no licurizeiro');
  // bodega da Dona Rita
  t.ok(await t.ev("(() => { P.x = SR.rita[0] * TS; P.y = (SR.rita[1] + 0.6) * TS; computeCtx(); if (!P._ctx || !/Rita/.test(P._ctx.label)) return false; P._ctx.fn(); const h = $('mn').innerHTML; const c0 = S.cash + S.acct; A.srVende('quartzo'); const ok = /Comprar/.test(h) && Math.round(S.cash + S.acct - c0) === 60; closeModal(); return ok; })()"), 'a bodega compra quartzo por R$ 60');
  t.ok(await t.ev("['serra1', 'serra2', 'serra3'].every(k => CONQ.some(c => c[0] === k))"), 'conquistas da serra');
  t.ok(await t.ev("(() => { const o = JSON.parse(SAVE.serialize()); SAVE.apply(o); return S.serra.missao === 2 && Object.keys(S.serra.ach).length === 3 && SR.ok; })()"), 'o progresso da serra fica no save');
  t.semErros();
} };
