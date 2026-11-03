// Aplica um layout de fazenda (JSON) sobre o mapa gerado pelo protótipo.
// Roda DENTRO da página (via __lida.ev), com acesso aos arrays e funções internas do jogo:
// ground, obj, gateId, areaId, forest, pondT, AREAS, AKEYS, GATES, TROUGHS, BLD, PROPS, LOTS,
// fillR, fenceRect, addGate, computeDepth, initGrass. Tudo fora da faixa `band` fica como o original
// (mata dos fundos, glebas, riacho, cidade e fazendas vizinhas).
module.exports = String.raw`window.__applyLayout = function (L) {
  const [bx0, by0, bx1, by1] = L.band;
  const inB = (x, y) => x >= bx0 && x <= bx1 && y >= by0 && y <= by1;
  const R = mulberry(L.scatter ? L.scatter.seed : 1);
  // 1. remove o que estava dentro da faixa
  for (const k of Object.keys(AREAS)) { const r = AREAS[k].r; if (inB(r[0], r[1]) && inB(r[2], r[3])) delete AREAS[k]; }
  const keepG = GATES.filter(g => !g.t.some(([x, y]) => inB(x, y)));
  GATES.length = 0; gateId.fill(-1);
  for (const g of keepG) { g.id = GATES.length; GATES.push(g); g.t.forEach(([x, y]) => { gateId[gi(x, y)] = g.id; }); }
  for (const k in AREAS) { const id = GATES.findIndex(g => g.a === k); AREAS[k].gate = id >= 0 ? id : undefined; }
  const keepIn = (arr, f) => { const v = arr.filter(f); arr.length = 0; arr.push(...v); };
  keepIn(TROUGHS, t => !inB(t.x, t.y));
  keepIn(BLD, b => !(inB(b.r[0], b.r[1]) && inB(b.r[2], b.r[3])));
  keepIn(PROPS, p => !inB(Math.floor(p.x / TS), Math.floor(p.y / TS - 0.1)));
  for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++) { const i = gi(x, y); ground[i] = G.GRASS; obj[i] = 0; areaId[i] = -1; forest[i] = 0; pondT[i] = 0; }
  // 2. terreno base
  for (const o of L.ground) fillR(o.r[0], o.r[1], o.r[2], o.r[3], G[o.t]);
  // 3. áreas cercadas, chão interno e porteiras
  for (const [k, a] of Object.entries(L.areas)) {
    const r = a.r; AREAS[k] = { n: a.n, k: a.k, r, g: a.gates[0] || null, parcel: a.parcel || null };
    if (a.fill) fillR(r[0] + 1, r[1] + 1, r[2] - 1, r[3] - 1, G[a.fill]);
    fenceRect(r);
  }
  for (const [x, y] of (L.openings || [])) obj[gi(x, y)] = 0;
  for (const [k, a] of Object.entries(L.areas)) { const ids = a.gates.map(t => addGate(t, k, false)); AREAS[k].gate = ids[0]; AREAS[k].gates = ids; }
  AKEYS.length = 0; AKEYS.push(...Object.keys(AREAS)); areaId.fill(-1);
  AKEYS.forEach((k, i) => { const r = AREAS[k].r; for (let y = r[1] + 1; y < r[3]; y++) for (let x = r[0] + 1; x < r[2]; x++) areaId[gi(x, y)] = i; });
  for (const k of AKEYS) { const a = AREAS[k], g = GATES[a.gate]; if (!g) continue; const r = a.r; let dx = 0, dy = 0;
    if (g.t[0][1] === r[1]) dy = -1; else if (g.t[0][1] === r[3]) dy = 1; else if (g.t[0][0] === r[0]) dx = -1; else dx = 1;
    a.out = [g.x + dx * 1.6, g.y + dy * 1.6]; a.in = [g.x - dx * 2, g.y - dy * 2]; a.dir = [dx, dy]; }
  // 4. manchas orgânicas (terra pisada, capim seco) só sobre pasto/capim
  for (const p of (L.patches || [])) {
    const [cx, cy] = p.c; for (let y = Math.floor(cy - p.r - 1); y <= cy + p.r + 1; y++) for (let x = Math.floor(cx - p.r - 1); x <= cx + p.r + 1; x++) {
      if (!inB(x, y)) continue; const i = gi(x, y), g = ground[i]; if (g !== G.PAST && g !== G.GRASS) continue;
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy) / p.r + (H2(x, y, 77) - 0.5) * 0.45; if (d < 1) ground[i] = G[p.t]; }
  }
  // 5. açudes/reservatórios
  for (const pd of (L.ponds || [])) { const [cx, cy] = pd.c; for (let y = Math.floor(cy - pd.ry - 2); y <= cy + pd.ry + 2; y++) for (let x = Math.floor(cx - pd.rx - 2); x <= cx + pd.rx + 2; x++) {
    const d = ((x + .5 - cx) / pd.rx) ** 2 + ((y + .5 - cy) / pd.ry) ** 2 + (H2(x, y, 7) - .5) * 0.25; const i = gi(x, y);
    if (d < 1) { ground[i] = G.WATER; pondT[i] = 1; } else if (d < 1.7 && (ground[i] === G.GRASS || ground[i] === G.PAST)) ground[i] = G.SAND; } }
  // 6. cochos, prédios e objetos
  for (const t of L.troughs) { TROUGHS.push({ a: t.a, k: t.k, x: t.x, y: t.y, w: t.w, cap: t.cap }); for (let i = 0; i < t.w; i++) obj[gi(t.x + i, t.y)] = 3; }
  for (const b of L.buildings) { const o = Object.assign({}, b); o.dp = [b.door, b.r[3] + 1.35]; BLD.push(o); for (let y = b.r[1]; y <= b.r[3]; y++) for (let x = b.r[0]; x <= b.r[2]; x++) obj[gi(x, y)] = 3; }
  for (const p of L.props) { PROPS.push({ t: p.t, x: p.x * TS, y: p.y * TS, v: p.v !== undefined ? p.v : Math.floor(H2(p.x * 7, p.y * 3, 9) * 4) }); if (p.solid) obj[gi(Math.floor(p.x), Math.floor(p.y - 0.1))] = 3; }
  for (const [x, y] of (L.solid_tiles || [])) obj[gi(x, y)] = 3;
  // 7. vegetação esparsa nos cantos livres (fora de estradas, cercas, áreas de manejo e quintal)
  if (L.scatter) { const types = L.scatter.types;
    for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++) { const i = gi(x, y), g = ground[i]; if (obj[i] || (g !== G.GRASS && g !== G.PAST)) continue;
      let near = false; for (let dy = -1; dy <= 1 && !near; dy++) for (let dx = -1; dx <= 1; dx++) { const j = gi(x + dx, y + dy), t = ground[j]; if (obj[j] || t === G.DIRT || t === G.FLOOR || t === G.MUD || t === G.WATER) { near = true; break; } }
      const ak = areaId[i] >= 0 ? AKEYS[areaId[i]] : null; if (near || (ak && AREAS[ak].k !== 'pasto')) continue;
      if (PROPS.some(q => Math.abs(q.x / TS - x - 0.5) < 2.2 && Math.abs(q.y / TS - y - 0.85) < 2.2)) continue;
      if (R() < L.scatter.density) PROPS.push({ t: types[Math.floor(R() * types.length)], x: (x + 0.5) * TS, y: (y + 0.85) * TS, v: Math.floor(R() * 8) }); } }
  // 8. estado derivado
  computeDepth(); if (typeof initGrass === 'function') initGrass();
  S.tr = TROUGHS.map(t => t.cap * (t.k === 'agua' ? 0.8 : 0.6)); S.gates = GATES.map(g => g.open ? 1 : 0); groundSeason = -1;
  if (typeof GCH !== 'undefined') GCH.clear();
  return { areas: AKEYS.length, gates: GATES.length, troughs: TROUGHS.length, props: PROPS.length };
};`;
