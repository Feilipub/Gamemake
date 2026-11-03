// Arte nova da reconstrução (pixel art por código, mesmo método do protótipo). Roda DENTRO da página
// e usa mkC, shade, outline e H2 do jogo. Tudo aqui é original da Fase 3/4 (não existia no HTML v3.2):
//   __art.fence(style, L, R, U, D, cond, post, seed)  cercas brasileiras 16x30 (chão na linha 28)
//       style 'arame'  = arame farpado em mourões roliços tortos (pastos)
//       style 'aroeira'= curral de tábuas de aroeira envelhecida com mourões grossos
//       style 'varas'  = cerca de varas de faxina amarrada com cipó (quintal, galinheiro, cavalos, roça)
//   __art.house(night)   casa da fazenda (taipa caiada, alpendre, telhado colonial de telha capa-canal)
//   __art.crop(kind, stage)  forrageiras da roça (palma, mandacaru sem espinho, maniçoba), 4 estágios
//   __art.bed()           leira de terra preparada (vai assada no chão)
module.exports = String.raw`window.__art = (() => {
  const rnd = s => { let a = s | 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  const P = g => (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };

  /* ---------------- cercas ---------------- */
  function fence(style, L, R, U, D, cond, post, seed) {
    const [c, g] = mkC(16, 30), p = P(g), Y = 28, r = rnd(seed * 7919 + 13), old = cond === 2;
    p(1, Y - 1, 14, 2, 'rgba(20,12,6,0.20)');
    if (style === 'aroeira') {
      const post0 = old ? '#5a5048' : '#4a3424', pl = shade(post0, .28), pd = shade(post0, -.35);
      const board = old ? '#a39a8c' : '#8f7558', bl = shade(board, .25), bd = shade(board, -.35), bg = shade(board, -.15);
      const rows = [Y - 21, Y - 15, Y - 9];
      const plank = (x0, x1, by, k) => { if (cond === 1 && k === 1) return; p(x0, by, x1 - x0, 4, board); p(x0, by, x1 - x0, 1, bl); p(x0, by + 3, x1 - x0, 1, bd); for (let x = x0; x < x1; x++) if (H2(x + seed, by, 3) < .3) p(x, by + 1 + (x % 2), 1, 1, bg); };
      rows.forEach((by, k) => { if (L) plank(0, 6, by, k); if (R) plank(10, 16, by, k); });
      if (U) { p(6, 0, 4, Y - 23, board); p(6, 0, 1, Y - 23, bl); p(9, 0, 1, Y - 23, bd); }
      if (D) { p(6, Y - 4, 4, 6, board); p(6, Y - 4, 1, 6, bl); }
      // mourão grosso de aroeira com topo chanfrado e pregos
      p(5, Y - 25, 6, 25, post0); p(5, Y - 25, 2, 25, pl); p(10, Y - 25, 1, 25, pd); p(5, Y - 26, 6, 1, pl); p(6, Y - 27, 4, 1, shade(post0, .45));
      for (let y = Y - 22; y < Y; y += 4) if (r() < .6) p(7 + (r() < .5 ? 1 : 0), y, 1, 2, pd);
      rows.forEach((by, k) => { if (cond === 1 && k === 1) return; if (L) p(6, by + 1, 1, 1, '#2a2a30'); if (R) p(9, by + 1, 1, 1, '#2a2a30'); });
      p(4, Y - 1, 8, 1, 'rgba(20,12,6,0.4)');
      return c;
    }
    if (style === 'varas') {
      const vara = ['#8a6a44', '#7a5a38', '#9a7a52', '#6e5032'], cipo = '#5e6a2a', cl2 = '#7e8a3a';
      const stick = (x, top) => { const col = vara[Math.floor(r() * vara.length)]; p(x, top, 1, Y - top, col); p(x, top, 1, 1, shade(col, .35)); if (r() < .3) p(x, top + 3 + Math.floor(r() * 6), 1, 1, shade(col, -.3)); };
      if (L || R) { const xs = []; for (let x = (L ? 0 : 7); x < (R ? 16 : 9); x += 2) xs.push(x); for (const x of xs) stick(x, Y - 17 - Math.floor(r() * 5)); for (const ty of [Y - 13, Y - 6]) { p(L ? 0 : 6, ty, (R ? 16 : 10) - (L ? 0 : 6), 1, cipo); for (const x of xs) if (r() < .5) p(x, ty - 1, 1, 1, cl2); } }
      if (U) { for (let y = 0; y < Y - 14; y += 3) { p(6, y, 1, 3, vara[(y >> 1) % 4]); p(9, y + 1, 1, 3, vara[(y >> 2) % 4]); } p(7, 0, 2, Y - 14, 'rgba(60,40,20,0.35)'); }
      if (D) { p(6, Y - 6, 1, 7, vara[1]); p(9, Y - 5, 1, 6, vara[2]); }
      if (post || (!L && !R) || (U && (L || R)) || (D && (L || R))) { p(6, Y - 20, 4, 20, '#6a4a2a'); p(6, Y - 20, 1, 20, '#8a6a44'); p(9, Y - 20, 1, 20, '#4a3018'); p(6, Y - 21, 4, 1, '#9a7a52'); p(5, Y - 14, 6, 2, cipo); p(5, Y - 7, 6, 2, cipo); }
      return c;
    }
    // arame farpado em mourões roliços tortos
    const wood = old ? '#77706a' : '#6e4e30', wl = shade(wood, .28), wd = shade(wood, -.32), wire = '#9da2a8', wireD = '#5e6268';
    const strands = [Y - 19, Y - 14, Y - 9, Y - 4];
    const lean = post ? Math.round((r() - .5) * 2) : 0;
    strands.forEach((sy, k) => { if (cond === 1 && k === 2) return;
      const sag = x => Math.round(Math.sin(((x + 8) % 16) / 16 * Math.PI) * 0.9);
      const run = (x0, x1) => { for (let x = x0; x < x1; x++) { p(x, sy + sag(x), 1, 1, wire); if ((x + k * 2) % 5 === 1) { p(x, sy + sag(x) - 1, 1, 1, wireD); p(x, sy + sag(x) + 1, 1, 1, wireD); } } };
      if (L) run(0, 8); if (R) run(8, 16);
      if (U) for (let y = 0; y < Y - 18; y++) if ((y + k) % 5) p(7 + (k % 2), y, 1, 1, k % 2 ? wireD : wire);
      if (D) for (let y = Y - 4; y < 30; y++) p(7 + (k % 2), y, 1, 1, wire); });
    if (post || (!L && !R)) {
      const top = Y - 23 - Math.floor(r() * 3);
      for (let y = top; y < Y; y++) { const off = Math.round((Y - y) / 23 * lean); p(6 + off, y, 4, 1, wood); p(6 + off, y, 1, 1, wl); p(9 + off, y, 1, 1, wd); if (H2(y, seed, 5) < .18) p(7 + off, y, 1, 1, wd); }
      const off = lean; p(6 + off, top, 4, 1, '#c8a878'); p(7 + off, top, 2, 1, '#a07848');
      if (r() < .35) { p(9 + off, top + 6, 1, 2, '#7e8a4a'); } // líquen
      strands.forEach(sy => p(6 + Math.round((Y - sy) / 23 * lean), sy, 1, 1, '#3a3a40'));
    }
    return c;
  }

  /* ---------------- casa da fazenda ---------------- */
  function house(night) {
    const W = 136, H = 144, [c, g] = mkC(W, H), p = P(g), r = rnd(1871);
    const FLOOR_Y = 124, EAVE = 80, RIDGE = 32;
    // piso do alpendre: cimento queimado vermelho com degrau
    p(4, FLOOR_Y, 128, 16, '#9a3c2a'); for (let x = 4; x < 132; x += 8) p(x, FLOOR_Y, 1, 16, '#86321f'); p(4, FLOOR_Y + 8, 128, 1, '#86321f'); p(4, FLOOR_Y, 128, 1, '#b4553a');
    p(56, FLOOR_Y + 14, 24, 4, '#b8a888'); p(56, FLOOR_Y + 14, 24, 1, '#d8ccb0'); p(4, FLOOR_Y + 15, 128, 1, 'rgba(30,14,6,0.45)');
    // fachada caiada com barra ocre
    const cal = '#efe6d2', calS = '#d9cdb4';
    p(8, EAVE, 120, FLOOR_Y - EAVE, cal);
    for (let k = 0; k < 240; k++) { const x = 8 + Math.floor(r() * 120), y = EAVE + Math.floor(r() * (FLOOR_Y - EAVE)); p(x, y, 1 + (r() < .3 ? 1 : 0), 1, r() < .5 ? calS : '#f7f1e2'); }
    p(8, FLOOR_Y - 11, 120, 11, '#c07a3e'); p(8, FLOOR_Y - 11, 120, 1, '#d89a5a'); for (let x = 8; x < 128; x += 3) if (r() < .3) p(x, FLOOR_Y - 9 + Math.floor(r() * 7), 2, 1, '#a8642e');
    // reboco caído mostrando a taipa (barro e varas)
    const taipa = (x, y, w, h) => { p(x, y, w, h, '#a8784a'); for (let yy = y; yy < y + h; yy += 3) p(x, yy, w, 1, '#8a5a34'); for (let xx = x + 1; xx < x + w; xx += 4) p(xx, y, 1, h, '#7a5030'); p(x - 1, y - 1, w + 2, 1, calS); };
    taipa(14, 104, 6, 5); taipa(118, 96, 5, 6);
    // portas e janelas de madeira azul colonial com moldura branca
    const azul = '#2a5d8f', azulL = '#4a80b4', azulD = '#1a3e64', mold = '#fbf7ee', dentro = night ? '#ffd27a' : '#2a1e18';
    const janela = x => { p(x - 2, 95, 20, 20, mold); p(x, 97, 16, 16, dentro); if (night) { p(x + 2, 99, 12, 12, '#fff0b0'); } else { p(x + 7, 97, 2, 16, '#3a2a22'); p(x, 104, 16, 1, '#3a2a22'); }
      p(x - 9, 96, 7, 18, azul); p(x - 9, 96, 1, 18, azulL); for (let y = 99; y < 112; y += 4) p(x - 8, y, 5, 1, azulD);
      p(x + 18, 96, 7, 18, azul); p(x + 24, 96, 1, 18, azulD); for (let y = 99; y < 112; y += 4) p(x + 19, y, 5, 1, azulD);
      p(x - 3, 115, 22, 2, mold); p(x - 3, 117, 22, 1, '#b8ae98'); };
    janela(24); janela(96);
    p(57, 89, 22, FLOOR_Y - 89, mold); p(59, 91, 18, 4, night ? '#ffd27a' : '#3a2a22'); for (let x = 60; x < 76; x += 3) p(x, 91, 1, 4, mold); // bandeira
    p(59, 96, 9, FLOOR_Y - 96, azul); p(68, 96, 9, FLOOR_Y - 96, azul); p(59, 96, 1, FLOOR_Y - 96, azulL); p(76, 96, 1, FLOOR_Y - 96, azulD); p(67, 96, 2, FLOOR_Y - 96, azulD);
    for (let y = 100; y < FLOOR_Y; y += 8) { p(60, y, 7, 1, azulL); p(69, y, 7, 1, azulL); }
    p(65, 110, 1, 2, '#e8c860'); p(70, 110, 1, 2, '#e8c860');
    if (night) { g.fillStyle = 'rgba(255,214,120,0.25)'; g.fillRect(67, 96, 2, FLOOR_Y - 96); }
    // sombra do beiral sobre a fachada
    for (let k = 0; k < 9; k++) { g.fillStyle = 'rgba(40,18,10,' + (0.42 - k * 0.045) + ')'; g.fillRect(8, EAVE + k, 120, 1); }
    // rede listrada, pote de barro, banco e vasos
    for (let x = 14; x < 44; x++) { const sag = Math.round(Math.sin((x - 14) / 30 * Math.PI) * 7); const col = ['#c83a2a', '#f0c030', '#2a7ab0', '#3a9a4a'][Math.floor((x - 14) / 4) % 4]; p(x, 100 + sag, 1, 4, col); p(x, 104 + sag, 1, 1, shade(col, -.35)); }
    p(13, 99, 1, 3, '#7a5a34'); p(44, 99, 1, 3, '#7a5a34');
    p(86, 112, 8, 10, '#a8603a'); p(87, 110, 6, 2, '#c87a4a'); p(86, 116, 8, 1, '#8a4a2a'); p(88, 112, 1, 6, '#c8845a'); p(85, 122, 10, 2, '#6a4a2a');
    p(100, 117, 18, 3, '#7a5030'); p(100, 117, 18, 1, '#9a7048'); p(101, 120, 2, 4, '#5a3a20'); p(115, 120, 2, 4, '#5a3a20');
    for (const [vx, fc] of [[50, '#e04a6a'], [82, '#f0d040'], [124, '#e04a6a']]) { p(vx, FLOOR_Y - 6, 6, 6, '#b05a32'); p(vx, FLOOR_Y - 6, 6, 1, '#d07a4a'); p(vx + 1, FLOOR_Y - 11, 4, 5, '#3a8a3a'); p(vx, FLOOR_Y - 10, 2, 2, '#4aa04a'); p(vx + 2, FLOOR_Y - 13, 2, 2, fc); }
    // esteios de madeira com mão-francesa
    for (const x of [8, 44, 90, 126]) { p(x, EAVE - 2, 4, FLOOR_Y - EAVE + 4, '#6a4426'); p(x, EAVE - 2, 1, FLOOR_Y - EAVE + 4, '#8e6038'); p(x + 3, EAVE - 2, 1, FLOOR_Y - EAVE + 4, '#4a2e18'); p(x - 1, FLOOR_Y + 1, 6, 2, '#5a3a20');
      if (x > 8) for (let k = 0; k < 6; k++) p(x - 1 - k, EAVE + 5 - k, 1, 2, '#5a381e'); if (x < 126) for (let k = 0; k < 6; k++) p(x + 4 + k, EAVE + 5 - k, 1, 2, '#5a381e'); }
    // telhado colonial de quatro águas: telha capa-canal
    const base = '#b24a2a', capa = '#d26a3c', capaH = '#ec9462', canal = '#7e2f1a', fim = '#5e2212';
    const front = y => { const t = (y - RIDGE) / (EAVE - RIDGE); return [Math.round(30 - 30 * t), Math.round(106 + 30 * t)]; }; // [x0, x1] da água da frente
    for (let y = RIDGE; y < EAVE; y++) { const [x0, x1] = front(y); p(x0, y, x1 - x0, 1, base); }
    for (let y = RIDGE + 2; y < EAVE; y += 5) { const [x0, x1] = front(y + 4);
      for (let x = x0; x < x1; x++) { const k = ((x + Math.floor(y / 5) * 3) % 6 + 6) % 6; const col = k < 3 ? (k === 0 ? capaH : capa) : (k === 5 ? fim : canal); p(x, y, 1, 4, col); }
      p(x0, y + 4, x1 - x0, 1, fim); }
    // águas laterais (mais escuras) e espigões
    g.globalCompositeOperation = 'source-atop';
    for (let y = RIDGE; y < EAVE; y++) { const t = (y - RIDGE) / (EAVE - RIDGE), [x0, x1] = front(y), wL = Math.round(18 * t + 4), wR = wL; g.fillStyle = 'rgba(60,18,8,0.28)'; g.fillRect(x0, y, wL, 1); g.fillRect(x1 - wR, y, wR, 1); }
    g.globalCompositeOperation = 'source-over';
    for (let y = RIDGE; y < EAVE; y += 1) { const t = (y - RIDGE) / (EAVE - RIDGE), [x0, x1] = front(y), wL = Math.round(18 * t + 4); p(x0 + wL, y, 1, 1, capaH); p(x1 - wL - 1, y, 1, 1, capaH); }
    // cumeeira com capas grandes
    p(30, RIDGE - 4, 76, 5, '#9a3a20'); for (let x = 30; x < 106; x += 6) { p(x, RIDGE - 5, 5, 5, capa); p(x, RIDGE - 5, 2, 1, capaH); p(x + 4, RIDGE - 4, 1, 4, fim); }
    // beiral com bocas das telhas
    for (let x = 0; x < W; x += 6) { p(x, EAVE - 2, 3, 3, fim); p(x + 3, EAVE - 1, 3, 2, canal); p(x, EAVE - 3, 3, 1, capaH); }
    p(0, EAVE + 1, W, 1, 'rgba(30,10,4,0.55)');
    // tempo: limo, fuligem e telhas trocadas
    for (let k = 0; k < 26; k++) { const y = RIDGE + 4 + Math.floor(r() * (EAVE - RIDGE - 8)), [x0, x1] = front(y), x = x0 + 3 + Math.floor(r() * (x1 - x0 - 6)); p(x, y, 2, 1, r() < .55 ? '#6a7a3a' : '#5a2a18'); }
    for (let k = 0; k < 7; k++) { const y = RIDGE + 7 + Math.floor(r() * (EAVE - RIDGE - 14)), [x0, x1] = front(y), x = x0 + 6 + Math.floor(r() * (x1 - x0 - 12)); p(x, y, 3, 4, '#c8603a'); p(x, y, 1, 4, '#e8905a'); }
    // chaminé do fogão a lenha
    p(94, 14, 12, 24, '#e8dfca'); p(94, 14, 2, 24, '#fbf6ea'); p(104, 14, 2, 24, '#c8bca2'); p(92, 11, 16, 4, '#9a3a20'); p(92, 11, 16, 1, '#d26a3c'); p(96, 15, 8, 2, '#3a2a22');
    for (let y = 32; y < 38; y++) p(94, y, 12, 1, base);
    outline(g, W, H);
    return c;
  }

  /* ---------------- roça de forragem ---------------- */
  function crop(kind, stage) {
    const [c, g] = mkC(24, 34), p = P(g), r = rnd(kind.length * 131 + stage * 17), Y = 31;
    p(5, Y - 1, 14, 3, '#5a3a22'); p(6, Y - 2, 12, 1, '#6e4a2c'); // cova
    if (kind === 'palma') {
      const pad = (cx, cy, w, h, light) => { for (let y = 0; y < h; y++) { const t = (y + .5) / h * 2 - 1, half = Math.max(1, Math.round(w / 2 * Math.sqrt(1 - t * t))); p(cx - half, cy - h + y, half * 2, 1, light ? '#86b25a' : '#6e9a48'); p(cx - half, cy - h + y, 1, 1, '#9cc46a'); p(cx + half - 1, cy - h + y, 1, 1, '#4e7a34'); }
        for (let k = 0; k < 4; k++) p(cx - Math.floor(w / 3) + Math.floor(r() * (w * .66)), cy - h + 2 + Math.floor(r() * (h - 3)), 1, 1, '#d8e8b0'); };
      const L = [[[12, Y, 5, 7]], [[12, Y, 6, 9], [9, Y - 7, 5, 7]], [[12, Y, 7, 10], [8, Y - 8, 6, 8], [16, Y - 8, 6, 9], [12, Y - 15, 5, 7]],
        [[12, Y, 7, 11], [7, Y - 8, 6, 9], [17, Y - 9, 6, 9], [12, Y - 15, 6, 8], [6, Y - 15, 5, 7], [18, Y - 16, 5, 7], [12, Y - 22, 5, 7]]][stage];
      L.forEach(([x, y, w, h], i) => pad(x, y, w, h, i % 2));
      if (stage === 3) { p(11, Y - 30, 3, 2, '#f0c840'); p(17, Y - 24, 2, 2, '#c83a4a'); p(6, Y - 23, 2, 2, '#c83a4a'); }
    } else if (kind === 'mandacaru') {
      const col = (x, top, w) => { p(x, top, w, Y - top, '#5e8a5a'); p(x, top, 1, Y - top, '#86b07a'); p(x + w - 1, top, 1, Y - top, '#3e6a42'); for (let y = top + 1; y < Y; y += 2) p(x + Math.floor(w / 2), y, 1, 1, '#4a7a4c'); p(x, top - 1, w, 1, '#86b07a'); };
      const hgt = [6, 13, 19, 25][stage]; col(10, Y - hgt, 4);
      if (stage >= 2) { p(14, Y - 10, 4, 3, '#5e8a5a'); col(16, Y - 16, 3); }
      if (stage >= 3) { p(7, Y - 13, 4, 3, '#5e8a5a'); col(6, Y - 20, 3); p(11, Y - hgt - 3, 3, 2, '#f8f4e8'); p(12, Y - hgt - 4, 1, 1, '#ffffff'); }
    } else { // maniçoba: arbusto de folhas palmadas (5 lóbulos), pecíolos avermelhados
      const stem = (x0, y0, x1, y1) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let k = 0; k <= n; k++) p(Math.round(x0 + (x1 - x0) * k / n), Math.round(y0 + (y1 - y0) * k / n), 1, 1, '#9a5a3a'); };
      const leaf = (cx, cy, s) => { for (let k = -2; k <= 2; k++) { const a = -Math.PI / 2 + k * 0.62; for (let d = 1; d <= s; d++) { const x = cx + Math.round(Math.cos(a) * d), y = cy + Math.round(Math.sin(a) * d); p(x, y, 2, 1, d >= s - 1 ? '#7ab854' : '#56963e'); } } p(cx, cy, 2, 2, '#3e7a30'); };
      const N = [[[12, Y - 6, 2]], [[12, Y - 10, 3], [9, Y - 7, 2]], [[12, Y - 16, 4], [7, Y - 11, 3], [17, Y - 12, 3], [12, Y - 8, 3]],
        [[12, Y - 24, 4], [6, Y - 19, 4], [18, Y - 20, 4], [9, Y - 13, 4], [15, Y - 12, 4], [3, Y - 11, 3], [21, Y - 12, 3], [12, Y - 17, 3]]][stage];
      N.forEach(([x, y]) => stem(12, Y - 1, x, y)); N.forEach(([x, y, s]) => leaf(x, y, s));
    }
    outline(g, 24, 34);
    return c;
  }
  function bed() { const [c, g] = mkC(32, 14), p = P(g), r = rnd(77); p(1, 2, 30, 10, '#6e4a2c'); for (let y = 3; y < 11; y += 3) { p(2, y, 28, 1, '#86603a'); p(2, y + 1, 28, 1, '#5a3a20'); } for (let k = 0; k < 18; k++) p(2 + Math.floor(r() * 28), 3 + Math.floor(r() * 8), 1, 1, r() < .5 ? '#9a7048' : '#4a2e18'); p(1, 11, 30, 1, 'rgba(30,14,6,0.4)'); return c; }
  return { fence, house, crop, bed };
})(); true`;
