// Flora do sertão (pixel art por código). Fonte da verdade da arte das árvores e plantas do jogo.
// O mesmo texto é embutido em web/index.html como `const FLORA = ...` (ver tools/asset-pipeline/embed_flora.py).
// Usa H2 e shade do jogo. Desenha num canvas 64x72 com a base em (32, 70), como o propSpr.
//   FLORA.draw(g, t, v, se) -> true se a espécie t é desenhada aqui (v = variação 0..7, se = 1 na seca)
// Espécies: mata1, mata2, umbu, juazeiro, manga, caju, inga, ipe, barriguda, catingueira, angico, aroeira,
//           jurema, facheiro, macambira, coroa, flor, capim, coqueiro, licuri, palmeira
// Na seca as árvores caducifólias da caatinga perdem a folha (galhada cinza); ipê e barriguda florescem.
(() => {
  const BX = 32, BY = 70;
  const mkP = g => (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
  const H = (x, y, s) => H2(x, y, s);
  // tronco afinando, com curva, casca e raízes; devolve o topo
  function trunk(P, bx, by, h, w0, w1, lean, c, s) {
    const cl = shade(c, .28), cd = shade(c, -.32);
    for (let y = 0; y < h; y++) { const t = y / h, w = Math.max(1, Math.round(w0 + (w1 - w0) * t)), x = Math.round(bx + lean * t * t - w / 2);
      P(x, by - y, w, 1, c); P(x, by - y, 1, 1, cl); if (w > 2) P(x + w - 1, by - y, 1, 1, cd); if (w > 3 && H(y, s, 7) < .22) P(x + 1 + Math.floor(H(y, s, 8) * (w - 2)), by - y, 1, 2, cd); }
    P(bx - w0 / 2 - 2, by, 3, 1, cd); P(bx + w0 / 2 - 1, by, 3, 1, cd); P(bx - w0 / 2 - 1, by - 1, 2, 1, c); P(bx + w0 / 2 - 1, by - 1, 2, 1, c);
    return [bx + lean, by - h];
  }
  function branch(P, x0, y0, x1, y1, w, c) { const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0))); for (let i = 0; i <= n; i++) { const t = i / n, ww = Math.max(1, Math.round(w * (1 - t * .6))); P(x0 + (x1 - x0) * t - (ww >> 1), y0 + (y1 - y0) * t, ww, 1, i % 3 ? c : shade(c, -.15)); } }
  // galhada sem folha (seca): galhos finos saindo do centro de cada tufo
  function twigs(P, cl, c, s) { for (const [k, q] of cl.entries()) for (let j = 0; j < 5; j++) { const a = -Math.PI / 2 + (H(k, j, s + 21) - .5) * 2.6, L = q.r * (.55 + H(j, k, s + 22) * .5); let x = q.x, y = q.y + (q.ry || q.r) * .4; for (let i = 0; i < L; i++) { x += Math.cos(a) + (H(i, j + k * 9, s) - .5) * .6; y += Math.sin(a) * .8; P(x, y, 1, 1, i < 3 ? c : shade(c, .18)); } } }
  // copa: união de tufos elípticos com borda recortada e 4 tons de luz (de cima à esquerda)
  function canopy(P, cl, pal, o) {
    o = o || {}; let x0 = 64, y0 = 72, x1 = 0, y1 = 0; const s = o.seed || 0, dens = o.dens === undefined ? 1 : o.dens;
    for (const c of cl) { const ry = c.ry || c.r; x0 = Math.min(x0, c.x - c.r - 2); x1 = Math.max(x1, c.x + c.r + 2); y0 = Math.min(y0, c.y - ry - 2); y1 = Math.max(y1, c.y + ry + 2); }
    x0 = Math.max(0, Math.floor(x0)); y0 = Math.max(1, Math.floor(y0)); x1 = Math.min(63, Math.ceil(x1)); y1 = Math.min(69, Math.ceil(y1));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      let best = 9, bc = null; for (const c of cl) { const dx = (x - c.x) / c.r, dy = (y - c.y) / (c.ry || c.r), d = Math.sqrt(dx * dx + dy * dy); if (d < best) { best = d; bc = c; } }
      const jag = (H(x >> 1, y >> 1, s + 3) - .5) * (o.jag || .3) + (H(x, y, s + 4) - .5) * .14; if (best + jag > 1) continue;
      if (dens < 1 && H(x >> 1, y >> 1, s + 9) > dens) continue;
      const nx = (x - bc.x) / bc.r, ny = (y - bc.y) / (bc.ry || bc.r);
      let l = (-nx * .55 - ny * .85) * .5 + .52; l += (H(x >> 1, y >> 1, s + 5) - .5) * .42; l -= Math.max(0, (y - (y1 - 7)) / 7) * .3; if (best > .82) l -= .14;
      P(x, y, 1, 1, pal[l < .28 ? 0 : l < .52 ? 1 : l < .76 ? 2 : 3]);
    }
    if (o.fruit) for (let i = 0; i < o.fruit; i++) { const c = cl[i % cl.length], a = H(i, s, 11) * 6.28, d = H(i, s, 12) * c.r * .7, fx = Math.round(c.x + Math.cos(a) * d), fy = Math.round(c.y + Math.sin(a) * d * .7 + 2), fs = o.fs || 2; P(fx, fy, fs, fs, o.fruitC); P(fx, fy, 1, 1, shade(o.fruitC, .4)); }
  }
  const M = (cl, f) => f ? cl.map(c => Object.assign({}, c, { x: 64 - c.x })) : cl; // espelha a variação
  const GREEN = { forest: ['#1a3618', '#2c5626', '#3f7834', '#5e9846'], dark: ['#163a18', '#245824', '#367632', '#509440'], olive: ['#2c4e20', '#467a30', '#64983e', '#8ab854'], light: ['#2e5a26', '#4a8a38', '#6aac4c', '#96cc6c'] };
  const DRY = ['#5a5a44', '#7a7a5c', '#9a9676', '#bab496'];
  function tree(P, t, v, se) {
    const f = v & 1, s = v * 31 + t.length * 7, sc = .9 + (v % 4) * .05, L = f ? -1 : 1;
    const C = (x, y, r, ry) => ({ x: 32 + (x - 32) * sc, y: 70 - (70 - y) * sc, r: r * sc, ry: (ry || r) * sc });
    switch (t) {
      case 'mata1': { const top = trunk(P, BX, BY, 30 * sc, 6, 3, 3 * L, '#4a3a2a', s); const cl = M([C(32, 24, 15, 11), C(19, 30, 11, 8), C(45, 29, 11, 8), C(31, 14, 10, 8)], f);
        for (const c of cl) branch(P, top[0], top[1] + 6, c.x, c.y + 3, 2, '#4a3a2a'); canopy(P, cl, GREEN.forest, { seed: s }); return; }
      case 'mata2': { const top = trunk(P, BX, BY, 24 * sc, 5, 3, -2 * L, '#5a4632', s); const cl = M([C(23, 32, 12, 9), C(41, 26, 13, 10), C(33, 17, 9, 7)], f);
        for (const c of cl) branch(P, top[0], top[1] + 4, c.x, c.y + 3, 2, '#5a4632'); canopy(P, cl, ['#1c3a1a', '#2e5c2e', '#42803a', '#62a04c'], { seed: s }); return; }
      case 'umbu': { const bark = se ? '#8a8272' : '#6a5a48', top = trunk(P, BX, BY, 13 * sc, 8, 5, 2 * L, bark, s); const cl = M([C(32, 37, 23, 10), C(15, 41, 10, 7), C(49, 41, 10, 7), C(30, 30, 13, 8)], f);
        for (const c of cl) branch(P, top[0], top[1] + 2, c.x, c.y + 2, 3, bark);
        if (se) { twigs(P, cl, bark, s); canopy(P, cl, DRY, { seed: s, dens: .32 }); } else canopy(P, cl, GREEN.olive, { seed: s, fruit: 5, fruitC: '#c8c060' }); return; }
      case 'juazeiro': { trunk(P, BX - 3, BY, 15 * sc, 5, 3, -3, '#5a4434', s); const top = trunk(P, BX + 2, BY, 17 * sc, 5, 3, 3, '#5a4434', s + 1); const cl = M([C(32, 31, 18, 14), C(20, 38, 10, 8), C(44, 37, 10, 8), C(32, 20, 11, 8)], f);
        canopy(P, cl, GREEN.dark, { seed: s, fruit: se ? 6 : 0, fruitC: '#d8b040' }); return; }
      case 'manga': { const top = trunk(P, BX, BY, 15 * sc, 8, 5, 0, '#5a3e2a', s); const cl = M([C(32, 31, 24, 17), C(32, 18, 14, 9), C(15, 38, 10, 8), C(49, 38, 10, 8)], f);
        canopy(P, cl, ['#143a18', '#225824', '#327630', '#4a943c'], { seed: s, fruit: 9, fruitC: '#e8a030' }); return; }
      case 'caju': { const top = trunk(P, BX - 4 * L, BY, 13 * sc, 7, 4, 10 * L, '#6a4a30', s); branch(P, BX - 3 * L, BY - 6, BX - 16 * L, BY - 16, 3, '#6a4a30'); const cl = M([C(25, 41, 14, 9), C(43, 36, 12, 9), C(34, 29, 10, 7), C(15, 45, 8, 6)], f);
        canopy(P, cl, GREEN.light, { seed: s, fruit: 7, fruitC: se ? '#e8c030' : '#e04a2a' }); return; }
      case 'inga': { const top = trunk(P, BX, BY, 17 * sc, 7, 4, 2 * L, '#5e4a3a', s); const cl = M([C(32, 31, 27, 11), C(21, 24, 12, 7), C(44, 24, 12, 7)], f);
        for (const c of cl) branch(P, top[0], top[1] + 3, c.x, c.y + 3, 2, '#5e4a3a'); canopy(P, cl, GREEN.light, { seed: s, fruit: 4, fruitC: '#8aa040', fs: 1 }); return; }
      case 'ipe': { const bark = '#6a5a4a', top = trunk(P, BX, BY, 27 * sc, 5, 2, 2 * L, bark, s); const cl = M([C(32, 21, 14, 10), C(23, 27, 9, 6), C(42, 26, 9, 6)], f);
        for (const c of cl) branch(P, top[0], top[1] + 3, c.x, c.y + 2, 2, bark);
        if (se) { twigs(P, cl, bark, s); canopy(P, cl, ['#b08a10', '#e0b818', '#f4d030', '#fff07a'], { seed: s, dens: .8, jag: .5 }); } else canopy(P, cl, ['#2a5226', '#3f7a34', '#5a9a44', '#7ab858'], { seed: s }); return; }
      case 'barriguda': { const bark = '#7a8a6a'; for (let y = 0; y < 32 * sc; y++) { const t = y / (32 * sc), w = Math.round(4 + 10 * Math.sin(Math.min(1, t * 1.25) * Math.PI) * (1 - t * .3)); const x = BX - (w >> 1);
          P(x, BY - y, w, 1, y % 5 ? bark : shade(bark, -.1)); P(x, BY - y, 1, 1, shade(bark, .3)); P(x + w - 1, BY - y, 1, 1, shade(bark, -.3)); if (y % 7 === 3) P(x + 2, BY - y, 1, 1, '#4a5a3a'); }
        const ty = BY - 32 * sc, cl = M([C(32, 17, 15, 8), C(21, 21, 8, 5), C(44, 20, 8, 5)], f); for (const c of cl) branch(P, BX, ty + 2, c.x, c.y + 2, 2, bark);
        if (se) { twigs(P, cl, bark, s); canopy(P, cl, DRY, { seed: s, dens: .25, fruit: 14, fruitC: '#ea8cb4' }); } else canopy(P, cl, GREEN.olive, { seed: s }); return; }
      case 'catingueira': { const bark = se ? '#8a8478' : '#6a5a46'; const tops = [trunk(P, BX - 3, BY, 18 * sc, 3, 2, -7, bark, s), trunk(P, BX + 2, BY, 21 * sc, 3, 2, 6, bark, s + 1), trunk(P, BX, BY, 15 * sc, 3, 2, 1, bark, s + 2)];
        const cl = M([C(22, 34, 11, 8), C(40, 31, 12, 8), C(32, 25, 10, 7)], f); cl.forEach((c, i) => branch(P, tops[i % 3][0], tops[i % 3][1] + 2, c.x, c.y + 2, 1, bark));
        if (se) { twigs(P, cl, bark, s); canopy(P, cl, DRY, { seed: s, dens: .18 }); } else canopy(P, cl, ['#36662a', '#548c3a', '#76ac4c', '#a0cc6a'], { seed: s, jag: .45, fruit: 6, fruitC: '#f0d040', fs: 1 }); return; }
      case 'angico': { const bark = '#5a4a3c', top = trunk(P, BX, BY, 30 * sc, 5, 3, 2 * L, bark, s); const cl = M([C(32, 17, 27, 7), C(20, 21, 11, 5), C(44, 20, 11, 5)], f);
        for (const c of cl) branch(P, top[0], top[1] + 3, c.x, c.y + 2, 2, bark);
        if (se) { twigs(P, cl, bark, s); canopy(P, cl, DRY, { seed: s, dens: .3, jag: .5 }); } else canopy(P, cl, ['#2c5428', '#467a36', '#64a048', '#8cc262'], { seed: s, jag: .55 }); return; }
      case 'aroeira': { const bark = '#4a3a30', top = trunk(P, BX, BY, 18 * sc, 6, 3, -2 * L, bark, s); const cl = M([C(32, 29, 18, 13), C(21, 36, 9, 8), C(43, 35, 9, 8)], f);
        canopy(P, cl, se ? ['#28401e', '#3e5a2c', '#56763a', '#70904a'] : ['#1c3c1c', '#2e582a', '#447838', '#62964a'], { seed: s, fruit: 12, fruitC: '#d02a2a', fs: 1 }); return; }
      case 'jurema': { const bark = '#3a3028'; for (let k = 0; k < 4; k++) branch(P, BX + (k - 1.5) * 2, BY, BX + (k - 1.5) * 9, BY - 16 - (k % 2) * 4, 2, bark);
        const cl = M([C(23, 51, 10, 7), C(41, 49, 11, 8), C(32, 43, 9, 6)], f);
        if (se) { twigs(P, cl, bark, s); for (let i = 0; i < 14; i++) P(18 + H(i, s, 2) * 28, 40 + H(s, i, 3) * 14, 1, 1, '#d8d0b8'); } else canopy(P, cl, ['#1c3020', '#2c4a2a', '#3e6636', '#56844a'], { seed: s, jag: .5 }); return; }
    }
    return false;
  }
  function palm(P, t, v, se) {
    const tall = t === 'coqueiro' ? 42 : t === 'palmeira' ? 48 : 24, lean = t === 'coqueiro' ? (v & 1 ? 9 : -9) : t === 'licuri' ? (v & 1 ? 2 : -2) : 0, w = t === 'palmeira' ? 4 : 3;
    const bark = t === 'palmeira' ? '#b4b0a6' : '#8a6a4a'; let tx = BX, ty = BY;
    for (let y = 0; y < tall; y++) { const k = y / tall, x = Math.round(BX + lean * k * k - w / 2); tx = x + w / 2; ty = BY - y; P(x, BY - y, w, 1, bark); P(x, BY - y, 1, 1, shade(bark, .25)); P(x + w - 1, BY - y, 1, 1, shade(bark, -.3)); if (y % 3 === 0) P(x, BY - y, w, 1, shade(bark, -.18)); }
    if (t === 'palmeira') { P(tx - 3, ty - 6, 6, 7, '#5a8a3a'); P(tx - 3, ty - 6, 2, 7, '#7aaa52'); }
    const fc = t === 'licuri' ? ['#3a6a2a', '#5a8a3a', '#7aaa52'] : ['#2a6a2a', '#3f8a3a', '#62ac52'], n = t === 'licuri' ? 9 : 10, top = ty - (t === 'palmeira' ? 6 : 0);
    const fronds = []; for (let k = 0; k < n; k++) { const a = -Math.PI / 2 + (k - (n - 1) / 2) * (t === 'licuri' ? .34 : .4) + (H(k, v, 5) - .5) * .2; fronds.push({ a, back: k % 2 }); }
    fronds.sort((p, q) => q.back - p.back);
    for (const fr of fronds) { const Lf = (t === 'licuri' ? 14 : 18) + H(fr.a * 10, v, 6) * 4, droop = t === 'licuri' ? .025 : .045; let x = tx, y = top; const col = fr.back ? fc[0] : fc[1];
      for (let i = 0; i < Lf; i++) { const dx = Math.cos(fr.a), dy = Math.sin(fr.a) * .8 + i * droop * 2; const d = Math.hypot(dx, dy); x += dx / d; y += dy / d;
        P(x, y, 1, 1, fr.back ? fc[0] : fc[2]); const pl = Math.max(1, Math.round(4 * (1 - i / Lf))), px = -dy / d, py = dx / d;
        if (i > 1 && i % 2 === 0) for (const sg of [-1, 1]) for (let q = 1; q <= pl; q++) P(x + px * q * sg, y + py * q * sg + q * .6, 1, 1, col); } }
    if (t === 'coqueiro') { P(tx - 3, top + 1, 3, 3, '#7a5a2a'); P(tx + 1, top + 2, 3, 3, '#8a6a30'); P(tx - 1, top + 3, 3, 3, '#6a4a22'); P(tx - 3, top + 1, 1, 1, '#a88a50'); }
    if (t === 'licuri') { for (let i = 0; i < 6; i++) P(tx - 3 + (i % 3) * 2, top + 3 + Math.floor(i / 3) * 2, 2, 2, i % 2 ? '#e0a030' : '#c88020'); }
  }
  function small(P, t, v, se) {
    const s = v * 13 + t.length;
    switch (t) {
      case 'facheiro': { const col = '#4e8a64', cl = '#82b890', cd = '#2e5a42', H0 = 38 + (v % 3) * 5;
        const colu = (x, y0, h) => { P(x, y0 - h, 6, h, col); P(x + 1, y0 - h, 1, h, cl); P(x + 4, y0 - h, 1, h, cd); P(x + 1, y0 - h - 1, 4, 1, col); for (let y = y0 - h + 2; y < y0; y += 3) { P(x + 3, y, 1, 1, '#e0e8c8'); P(x, y + 1, 1, 1, '#c8d0b0'); } if (se) P(x + 1, y0 - h - 3, 4, 2, '#f0f0e0'); };
        colu(BX - 3, BY, H0); P(BX + 3, BY - 22, 5, 4, col); P(BX + 3, BY - 22, 5, 1, cl); colu(BX + 6, BY - 21, 10 + (v % 3) * 3); if (v % 2) { P(BX - 8, BY - 15, 5, 4, col); colu(BX - 11, BY - 14, 8); } return; }
      case 'macambira': for (let k = 0; k < 13; k++) { const a = Math.PI + k / 12 * Math.PI, L = 10 + (k % 3) * 3; for (let i = 0; i < L; i++) P(BX + Math.cos(a) * i * 1.3, BY - 2 + Math.sin(a) * i * .9, 1, 1, i < 2 ? '#5a6a3a' : se ? (i % 2 ? '#8a8a52' : '#a0a062') : (i % 2 ? '#4a7a3a' : '#6a9a4a')); }
        P(BX - 1, BY - 4, 3, 2, se ? '#9a4a2a' : '#d03a3a'); return;
      case 'coroa': { P(BX - 5, BY - 7, 10, 7, '#4a8a4a'); P(BX - 6, BY - 5, 12, 4, '#4a8a4a'); P(BX - 4, BY - 7, 2, 6, '#78b878'); for (let x = BX - 5; x < BX + 5; x += 2) P(x, BY - 6, 1, 5, '#2e5e30'); P(BX - 3, BY - 10, 6, 3, '#c8304a'); P(BX - 2, BY - 11, 4, 1, '#e85a6a'); for (let i = 0; i < 6; i++) P(BX - 5 + i * 2, BY - 7 + (i % 2), 1, 1, '#f0f0d8'); return; }
      case 'flor': { const cols = ['#f0d040', '#b060c0', '#f4f0e8', '#e86a3a']; for (let k = 0; k < 10; k++) { const x = BX - 11 + H(k, s, 1) * 22, h = 5 + H(s, k, 2) * 8; P(x, BY - h, 1, h, se ? '#9a8a5a' : '#4a8a3a'); if (!se) { const c = cols[(k + v) % 4]; P(x - 1, BY - h - 1, 3, 2, c); P(x, BY - h - 2, 1, 1, shade(c, .3)); } else P(x - 1, BY - h - 1, 2, 1, '#7a6a44'); } return; }
      case 'capim': for (let k = 0; k < 16; k++) { const x = BX - 11 + k * 1.4, h = 9 + H(k, s, 3) * 10, lean = (H(s, k, 4) - .5) * 4; for (let i = 0; i < h; i++) P(x + lean * i / h, BY - i, 1, 1, se ? (i > h * .6 ? '#d8c078' : '#b8a060') : (i > h * .6 ? '#8ac05a' : '#5a9040')); } return;
    }
    return false;
  }
  return { draw(g, t, v, se) { const P = mkP(g); if (t === 'coqueiro' || t === 'licuri' || t === 'palmeira') { palm(P, t, v, se); return true; } if (tree(P, t, v, se) !== false) return true; return small(P, t, v, se) !== false; } };
})()
