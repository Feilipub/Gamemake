/* Opções de estilo para o retrato do vaqueiro e dos moradores (64x64), para o jogador escolher.
   Roda dentro da página do jogo (usa SKINS, HAIRC, HATS, SHIRTC, SCARFC, EYE). Cada estilo usa a mesma
   cabeça "3D" (elipsoides com normal), muda luz, número de tons, contorno, olhos e fundo.
   Guia seguido: design/art/prompts_retratos.md e design/art/redesign_visual.md. */
window.PORTOPT = (() => {
  const W = 64, hx = h => { h = h.replace('#', ''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  const lum = c => (c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11) / 255;
  const EYE = ['#4a2c1a', '#6a4024', '#8a5a2e', '#a87a2c', '#4c8a3e', '#3a78c0', '#7a8a96', '#2a1a12'];
  const BAY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  /* ---------- geometria comum (busto em 3/4) ---------- */
  function build(ap, big) {
    const fem = ap.sex === 'F', age = ap.age || 0;
    const sk = hx(SKINS[ap.skin || 0]), hc = hx(HAIRC[ap.hairC || 0]), bc = hx(HAIRC[ap.beardC !== undefined ? ap.beardC : ap.hairC || 0]);
    const st = ap.shirt | 0, sh = hx(st === 2 ? '#8a5226' : st === 4 ? '#f0eadc' : st === 5 ? '#3e5e8c' : SHIRTC[ap.shirtC] || SHIRTC[0]);
    const hat = HATS[ap.hat] && HATS[ap.hat].id !== 'none' ? HATS[ap.hat] : null, hair = ap.hair || 0;
    const k = big ? 1.1 : 1, cx = 32, cy = big ? 29 : 30, rx = (fem ? 14.6 : 15.6) * k * [1, 1.05, 1.07, 0.94, 1.1][ap.face || 0], ry = 18.2 * k;
    const turn = big ? 0 : 1.8; // rosto virado 3/4 para a direita
    const parts = []; // ordem de pintura (de trás para frente)
    const ell = (ex, ey, erx, ery) => (x, y) => { const u = (x + 0.5 - ex) / erx, v = (y + 0.5 - ey) / ery; const d = u * u + v * v; return d <= 1 ? [u, v, Math.sqrt(1 - d)] : null; };
    const head = (x, y) => { const v = (y + 0.5 - cy) / ry; let w = rx; if (v > 0) w *= 1 - 0.2 * v * v * v; const u = (x + 0.5 - cx - turn * 0.3) / w; const d = u * u + v * v; return d <= 1 ? [u * 0.9 + 0.12 * (turn / 2), v, Math.sqrt(1 - d)] : null; };
    const longH = !hat && (hair === 4 || hair === 6 || hair === 9 || (fem && hair === 8)) || (hat && (hair === 4 || hair === 9));
    if (longH) parts.push({ id: 'hairB', c: hc, f: (x, y) => { const r = ell(cx, cy + 6, rx + 3.4, ry + 6)(x, y); return r && y > cy - 8 ? r : null; } });
    parts.push({ id: 'shirt', c: sh, f: ell(cx, 79, 42, 25) });
    if (st === 6) parts.push({ id: 'vest', c: hx('#6a4a2c'), f: (x, y) => { const r = ell(cx, 79, 42, 25)(x, y); return r && Math.abs(x + 0.5 - cx) > 7 ? r : null; } });
    if (st === 2) parts.push({ id: 'gibao', c: mul(hx('#8a5226'), 0.85), f: (x, y) => { const r = ell(cx, 66, 10, 9)(x, y); return r && y > 56 ? r : null; } });
    parts.push({ id: 'neck', c: mul(sk, 0.8), f: (x, y) => (Math.abs(x + 0.5 - cx - 0.5) < 7.6 + Math.max(0, y - 50) * 0.8 && y > cy + 8 && y < 60) ? [((x + 0.5 - cx) / 9) * 0.8, 0.45, 0.55] : null });
    if (ap.acc === 1) parts.push({ id: 'scarf', c: hx(SCARFC[ap.scarfC] || SCARFC[0]), f: (x, y) => { const dx = x + 0.5 - cx; return y >= 53 && y < 61 && Math.abs(dx) < 10 - (y - 53) * 1.2 ? [dx / 9, -0.2, 0.9] : null; } });
    else parts.push({ id: 'collar', c: sk, f: (x, y) => { const dx = x + 0.5 - cx; return y >= 54 && y < 62 && Math.abs(dx) < 5 - (y - 54) * 0.6 ? [dx / 6, 0.1, 0.95] : null; } });
    parts.push({ id: 'ear', c: sk, f: ell(cx - rx + 0.8 + turn * 0.4, cy + 2, 2.6, 4) });
    if (big) parts.push({ id: 'ear2', c: sk, f: ell(cx + rx - 0.8, cy + 2, 2.6, 4) });
    parts.push({ id: 'head', c: sk, f: head });
    if (!hat || hair === 7 || longH) { // cabelo: topo, laterais e franja
      const hr = hair === 3 ? 3 : hair === 2 || hair === 9 ? 1.6 : hair === 1 ? -0.6 : 0.6;
      if (hair !== 12) parts.push({ id: 'hair', c: hair === 1 ? mixc(hc, sk, 0.45) : hc, f: (x, y) => { const r = ell(cx + turn * 0.2, cy - 3.2 - hr * 0.3, rx + 1.4 + hr, ry - 1 + hr * 0.6)(x, y); if (!r) return null; const fr = cy - 7 + (hair === 10 ? -2 : 0) + Math.sin(x * 0.9) * 0.8; const side = (x < cx - rx + 3.2) && y < cy + (longH ? 12 : hair === 11 ? 6 : 2); return y < fr || side ? r : null; } });
      if (hair === 7) parts.push({ id: 'bun', c: hc, f: ell(cx - 2, cy - ry - 1, 5.2, 4.4) });
    }
    if (hat && hair !== 12) parts.push({ id: 'hair', c: hair === 1 ? mixc(hc, sk, 0.45) : hc, f: (x, y) => { const r = head(x, y); if (!r) return null; const top = cy - ry + 9; return y < top + (x < cx - rx + 4 ? 6 + (hair === 11 ? 3 : 0) : big && x > cx + rx - 4 ? 6 : 0) && y > top - 4 ? r : null; } });
    if (hat) {
      const id = hat.id, hcol = hx(hat.c), ty = cy - ry + 6.6;
      if (id === 'bone') { parts.push({ id: 'hat', c: hcol, f: (x, y) => { const r = ell(cx, ty + 1, rx + 1.4, 9)(x, y); return r && y < ty + 2 ? r : null; } }); parts.push({ id: 'brim', c: mul(hcol, 0.8), f: (x, y) => { const r = ell(cx + 6, ty + 2.2, 11, 2.6)(x, y); return r && x > cx - 2 ? [r[0] * 0.3, -0.6, 0.8] : null; } }); }
      else if (id === 'boina') parts.push({ id: 'hat', c: hcol, f: (x, y) => { const r = ell(cx - 1.5, ty, rx + 3, 6)(x, y); return r && y < ty + 3 ? r : null; } });
      else {
        const bw = id === 'pantaneiro' || id === 'rodeio' ? 28 : 26;
        parts.push({ id: 'brimB', c: mul(hcol, 0.72), f: (x, y) => { const r = ell(cx, ty + 0.5, bw, 4.6)(x, y); return r && y < ty + 0.5 ? [r[0] * 0.4, -0.9, 0.45] : null; } });
        parts.push({ id: 'hat', c: hcol, f: (x, y) => { const r = ell(cx, ty - 3, 14, 10.4)(x, y); return r && y < ty + 1 && y > ty - 13 + (id === 'couro' ? 2 : 0) ? r : null; } });
        parts.push({ id: 'band', c: hx(((ORN[ap.orn || 'none'] || ORN.none).band || ['#4a2a14'])[0]), f: (x, y) => { const r = ell(cx, ty - 3, 14.2, 10.6)(x, y); return r && y >= ty - 1.6 && y < ty + 0.6 ? r : null; } });
        parts.push({ id: 'brim', c: id === 'couro' ? mixc(hcol, [255, 224, 160], 0.1) : hcol, f: (x, y) => { const r = ell(cx, ty + 0.6, bw, id === 'couro' ? 5.2 : 4.6)(x, y); if (!r || y < ty + 0.6 - (id === 'couro' ? 3.4 * (1 - Math.abs(x + 0.5 - cx) / bw) : 0)) return null; return [r[0] * 0.4, -0.5 + r[1] * 0.3, 0.75]; } });
      }
    }
    const fx = Math.round(cx + turn), eyeY = Math.round(cy + 1.5), eyeDX = Math.round((fem ? 5.6 : 6) * k);
    return { fem, age, sk, hc, bc, sh, cx, cy, rx, ry, fx, eyeY, eyeDX, parts, hat, beard: ap.beard || 0, ex: ap.expr || 0, eyeC: hx(EYE[ap.eyeC !== undefined ? ap.eyeC : 1]), big };
  }
  // rasteriza: para cada pixel guarda parte, cor base e normal
  function raster(G) { const id = new Array(W * W).fill(null), N = new Array(W * W).fill(null), Cc = new Array(W * W).fill(null);
    for (const p of G.parts) for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) { const n = p.f(x, y); if (n) { const i = y * W + x; id[i] = p.id; N[i] = n; Cc[i] = p.c; } }
    return { id, N, C: Cc }; }
  const put = (D, i, c, a) => { D[i * 4] = Math.max(0, Math.min(255, c[0])); D[i * 4 + 1] = Math.max(0, Math.min(255, c[1])); D[i * 4 + 2] = Math.max(0, Math.min(255, c[2])); D[i * 4 + 3] = a === undefined ? 255 : a; };
  /* ---------- estilos ---------- */
  const STY = {
    // 1. Couro e sol: semirrealista, 5 tons com pontilhado, sombra vinho, luz quente, contorno só na silhueta
    real: { n: 'Couro e Sol (semirrealista)', L: [-0.55, -0.6, 0.58], tones: 5, dither: 1, bg: (x, y) => mixc([200, 178, 134], [150, 120, 86], Math.min(1, Math.hypot(x - 30, y - 26) / 46)), outline: 'sil', inner: 0.0, eyes: 'real' },
    // 2. Cordel: xilogravura de folheto de cordel, tinta preta no papel, hachuras
    cordel: { n: 'Cordel (xilogravura)', L: [-0.5, -0.65, 0.57], bg: () => [236, 224, 192], ink: 1, eyes: 'ink' },
    // 3. Mesmo estilo dos animais (rig): volume suave, sombra fria, luz quente, contorno tingido
    rig: { n: 'Estilo dos animais', L: [-0.65, -0.5, 0.57], tones: 4, dither: 0, bg: (x, y) => mixc([232, 214, 172], [214, 192, 146], y / 64), outline: 'sel', inner: 1, eyes: 'dot', cool: 1 },
    // 4. Farm-sim fofo: cabeça grande de frente, olhos grandes com brilho, contorno escuro em tudo
    fofo: { n: 'Fofo (farm-sim)', big: 1, L: [-0.5, -0.7, 0.5], tones: 3, dither: 0, bg: (x, y) => ((x >> 3) + (y >> 3)) % 2 ? [246, 228, 190] : [240, 220, 178], outline: 'black', inner: 1, eyes: 'big' },
    // 5. Fim de tarde: contra-luz do sol se pondo, rosto na sombra com borda laranja
    tarde: { n: 'Fim de tarde (contraluz)', L: [0.75, -0.35, -0.1], tones: 4, dither: 1, bg: (x, y) => mixc([255, 168, 80], [92, 52, 98], Math.min(1, y / 58)), outline: 'sil', inner: 0, eyes: 'dot', rim: 1 }
  };
  function shadeC(s, c, n, x, y) {
    const L = s.L, ln = Math.hypot(L[0], L[1], L[2]); let d = (n[0] * L[0] + n[1] * L[1] + n[2] * L[2]) / ln;
    if (s.rim) { const r = Math.max(0, d); const base = mixc(mul(c, 0.62), [90, 50, 100], 0.25); return r > 0.32 ? mixc(base, [255, 176, 90], Math.min(1, (r - 0.32) * 2.6)) : base; }
    let t = (d + 0.35) / 1.25; t = Math.max(0, Math.min(1, t)); // 0 sombra .. 1 luz
    if (s.dither) t += (BAY[(y & 3) * 4 + (x & 3)] / 16 - 0.5) * 0.6 / (s.tones);
    const q = Math.max(0, Math.min(s.tones - 1, Math.round(t * (s.tones - 1)))) / (s.tones - 1);
    const lo = s.cool ? mixc(mul(c, 0.62), [58, 44, 92], 0.2) : mixc(mul(c, 0.6), [110, 36, 44], 0.22), hi = s.cool ? mixc(mul(c, 1.14), [255, 240, 192], 0.2) : mixc(mul(c, 1.12), [255, 236, 200], 0.24);
    return q < 0.5 ? mixc(lo, c, q * 2) : mixc(c, hi, (q - 0.5) * 2);
  }
  function face(D, G, s, R) { // olhos, sobrancelhas, nariz, boca, barba, bochechas
    const P = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= W || y >= W) return; put(D, y * W + x, c); };
    const ink = s.ink ? [30, 20, 14] : s.rim ? [40, 22, 40] : [40, 22, 18], skD = s.ink ? ink : s.rim ? mul(G.sk, 0.3) : mixc(mul(G.sk, 0.62), [110, 36, 44], 0.25);
    const brow = s.ink ? ink : mul(G.hc, s.rim ? 0.4 : 0.7), wh = s.rim ? [120, 90, 100] : [244, 238, 226];
    const ey = G.eyeY, ex0 = G.fx;
    for (const sg of [-1, 1]) {
      const ex = ex0 + sg * G.eyeDX - (G.big ? 0 : sg < 0 ? 0.6 : 0); // olho de trás um pouco menor no 3/4
      if (s.eyes === 'big') { for (let yy = -2; yy <= 2; yy++) for (let xx = -1; xx <= 2; xx++) P(ex + xx - 1, ey + yy, yy === -2 ? ink : xx >= 0 && yy >= -1 ? (yy === 2 ? mul(G.eyeC, 0.6) : G.eyeC) : wh); P(ex, ey - 1, [255, 255, 255]); P(ex - 1, ey + 1, [255, 255, 255]); if (G.fem) { P(ex - 2, ey - 2, ink); P(ex + 2, ey - 2, ink); } P(ex - 1, ey - 4, brow); P(ex, ey - 4, brow); P(ex + 1, ey - 4, brow); }
      else if (s.eyes === 'real') { P(ex - 1, ey, wh); P(ex + 2, ey, wh); P(ex, ey + 1, mul(G.eyeC, 0.7)); P(ex + 1, ey + 1, mul(G.eyeC, 0.5)); P(ex, ey, G.eyeC); P(ex + 1, ey, mul(G.eyeC, 0.5)); P(ex, ey - 1, skD); P(ex - 1, ey - 1, skD); P(ex + 1, ey - 1, mul(skD, 0.8)); P(ex + 2, ey, mul(G.sk, 0.85)); P(ex, ey, mixc(G.eyeC, [255, 255, 255], 0.15)); for (let xx = -2; xx <= 2; xx++) P(ex + xx, ey - 3 + (Math.abs(xx) === 2 ? 1 : 0), brow); if (G.age >= 2) P(ex + 2, ey + 1, skD); }
      else if (s.eyes === 'ink') { P(ex - 1, ey, ink); P(ex, ey, ink); P(ex + 1, ey, ink); P(ex, ey - 1, ink); for (let xx = -2; xx <= 2; xx++) P(ex + xx, ey - 3, ink); }
      else { P(ex, ey, s.rim ? [255, 200, 140] : ink); P(ex + 1, ey, s.rim ? [60, 30, 50] : mul(G.eyeC, 0.7)); P(ex, ey + 1, s.rim ? [60, 30, 50] : G.eyeC); P(ex + 1, ey + 1, s.rim ? [60, 30, 50] : ink); if (!s.rim) P(ex, ey, [250, 246, 236]); for (let xx = -1; xx <= 2; xx++) P(ex + xx, ey - 2 - (xx === -1 ? -1 : 0), brow); }
    }
    // nariz: sombra do lado oposto à luz e ponta
    const nx = ex0 + (G.big ? 0 : 1), ny = ey + 5;
    if (s.ink) { P(nx + 1, ny, ink); P(nx + 1, ny + 1, ink); P(nx, ny + 2, ink); P(nx - 1, ny + 2, ink); } else { P(nx + 1, ny - 1, skD); P(nx + 1, ny, skD); P(nx, ny + 1, skD); P(nx - 1, ny + 1, mul(skD, 1.15)); if (!s.rim) P(nx - 1, ny - 1, mixc(G.sk, [255, 240, 210], 0.4)); }
    // boca
    const my = ny + 5 + (G.big ? 0 : 0), mc = s.ink ? ink : s.rim ? mul(G.sk, 0.25) : mixc(mul(G.sk, 0.55), [140, 40, 40], 0.4);
    const w2 = G.big ? 2 : 2; for (let xx = -w2; xx <= w2; xx++) P(ex0 + xx, my + (G.ex === 1 && Math.abs(xx) === w2 ? -1 : 0), mc);
    if (G.ex === 3) P(ex0, my + 1, mc); if (!s.ink && !s.rim) P(ex0, my + 2, mixc(mul(G.sk, 0.8), [110, 36, 44], 0.15));
    // barba
    if (G.beard && G.beard < 7) { const len = [0, 2, 4, 6, 9, 5][G.beard] || 4; for (let y = my - 2; y < my + len; y++) for (let x = Math.round(G.cx - G.rx); x <= G.cx + G.rx; x++) { const i = y * W + x; if (R.id[i] !== 'head' && !(y > my && R.id[i] === 'neck')) continue; if (y < my + 1 && Math.abs(x - ex0) < 3 && y >= my) continue; if (y < ny + 2 && Math.abs(x - ex0) < 4) continue; const sh2 = shadeC(s, G.bc, R.N[i] || [0, 0.5, 0.8], x, y); P(x, y, s.ink ? (((x + y) % 2) ? ink : [236, 224, 192]) : (G.beard === 1 && (x + y) % 2) ? mixc(sh2, G.sk, 0.5) : sh2); } }
    if (G.beard >= 7) for (let xx = -3; xx <= 3; xx++) { P(ex0 + xx, my - 1, s.ink ? ink : mul(G.bc, 0.85)); if (G.beard === 8) P(ex0 + xx, my - 2, s.ink ? ink : G.bc); }
    if ((G.fem || G.age === 0) && !s.ink && !s.rim) for (const sg of [-1, 1]) { P(ex0 + sg * (G.eyeDX + 1), ey + 3, mixc(G.sk, [230, 90, 90], 0.35)); P(ex0 + sg * (G.eyeDX + 1) + 1, ey + 3, mixc(G.sk, [230, 90, 90], 0.25)); }
  }
  function draw(ap, key) {
    const s = STY[key], G = build(ap, s.big), R = raster(G);
    const cv = document.createElement('canvas'); cv.width = cv.height = W; const g = cv.getContext('2d'); const im = g.createImageData(W, W), D = im.data;
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) { const i = y * W + x; const b = s.bg(x, y); put(D, i, b);
      if (!R.id[i]) continue; let c = R.C[i];
      if (s.ink) { // xilogravura: papel, hachura diagonal, tinta
        const L = s.L, d = (R.N[i][0] * L[0] + R.N[i][1] * L[1] + R.N[i][2] * L[2]); const v = lum(c) * 0.75 + (d + 0.3) * 0.38;
        const ink = [30, 20, 14], paper = [236, 224, 192], red = [168, 50, 30];
        let o = v > 0.7 ? paper : v > 0.5 ? ((x + y) % 3 === 0 ? ink : paper) : v > 0.34 ? ((x + y) % 2 === 0 || (x - y) % 4 === 0 ? ink : paper) : ink;
        if ((R.id[i] === 'scarf' || R.id[i] === 'band') && o === paper) o = red;
        put(D, i, o); continue; }
      put(D, i, shadeC(s, c, R.N[i], x, y)); }
    // contornos
    const src = new Uint8ClampedArray(D), at = (x, y) => x >= 0 && y >= 0 && x < W && y < W ? R.id[y * W + x] : null;
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) { const i = y * W + x, me = R.id[i]; if (!me) continue;
      const nb = [at(x - 1, y), at(x + 1, y), at(x, y - 1), at(x, y + 1)], sil = nb.some(q => !q), inner = nb.some(q => q && q !== me && !(me === 'band' || q === 'band') && !((me === 'head' && q === 'ear') || (me === 'ear' && q === 'head')) && !(me === 'neck' && q === 'collar'));
      const front = inner && nb.some(q => q && q !== me && G.parts.findIndex(p => p.id === q) < G.parts.findIndex(p => p.id === me));
      if (s.ink) { if (sil || front) put(D, i, [30, 20, 14]); continue; }
      if (s.outline === 'black' && (sil || front)) put(D, i, [34, 20, 18]);
      else if (s.outline === 'sel' && (sil || front)) put(D, i, mixc(mul([src[i * 4], src[i * 4 + 1], src[i * 4 + 2]], 0.5), [58, 44, 92], 0.3));
      else if (s.outline === 'sil' && sil) put(D, i, s.rim ? [40, 20, 44] : [52, 28, 20]);
      else if (s.inner === 0 && front && !s.rim) put(D, i, mul([src[i * 4], src[i * 4 + 1], src[i * 4 + 2]], 0.72)); }
    face(D, G, s, R);
    if (s.ink) for (let k = 0; k < W; k++) { put(D, k, [30, 20, 14]); put(D, (W - 1) * W + k, [30, 20, 14]); put(D, k * W, [30, 20, 14]); put(D, k * W + W - 1, [30, 20, 14]); }
    g.putImageData(im, 0, 0); return cv;
  }
  return { draw, STY };
})();
