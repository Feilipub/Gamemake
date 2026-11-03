// Retratos 64x64 (busto de frente), pixel art por código em camadas — estilo "farm-sim" de cabeça grande,
// contorno escuro por material, sombreamento em faixas (cel) com sombras puxadas para o vinho e luzes quentes,
// olhos grandes com íris colorida e brilho. Personagens e roupas do sertão (chapéu de couro de vaqueiro, gibão,
// chapéu de palha, lenço, bata bordada).
// Fonte da verdade; embutido em web/index.html como `const PORT = ...` por tools/asset-pipeline/embed_flora.py
// (marcadores PORT:begin/end). Usa SKINS, HAIRC, SHIRTC, SCARFC, HATS, ORN, mix, shade e mkC do jogo.
//   PORT.draw(ap) -> canvas 64x64.  Campos de `ap` (todos opcionais, com padrão):
//   face 0 oval, 1 redondo, 2 quadrado, 3 fino, 4 largo · eyes 0 amendoado, 1 redondo, 2 puxado, 3 caído, 4 grande
//   eyeC 0..7 (EYEC) · brows 0 retas, 1 grossas, 2 arqueadas, 3 finas, 4 angulosas · nose 0 reto, 1 largo, 2 fino, 3 arrebitado, 4 adunco
//   mouth 0 fina, 1 cheia, 2 larga, 3 pequena, 4 marcada · expr 0 neutro, 1 sorriso, 2 sério, 3 surpreso, 4 bravo
//   hair 0..12 (HAIRS) · hairC · beard 0..9 (BEARDS) · beardC · shirt 0..7 · shirtC · hat (HATS) · acc · scarfC · body 0 normal, 1 forte, 2 magro
//   age 0 jovem, 1 adulto, 2 idoso (rugas) · freck (sardas)
(() => {
  const EYEC = ['#4a2c1a', '#6a4024', '#8a5a2e', '#a87a2c', '#4c8a3e', '#3a78c0', '#7a8a96', '#2a1a12'];
  // rampa de cor: luz quente, sombra puxada para o vinho (evita o cinza "sujo" de escurecer para o preto)
  const ramp = c => [mix(c, '#fff4d8', 0.3), c, mix(c, '#7a2a30', 0.26), mix(c, '#5a1a24', 0.44), mix(c, '#120810', 0.86)];
  const W = 64;
  function draw(ap) {
    const [cv, g] = mkC(W, W);
    const P = (x, y, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), 1, 1); };
    const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), w, h); };
    const H = (x, y, s) => { let h = (x | 0) * 374761393 + (y | 0) * 668265263 + (s | 0) * 1442695041; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
    const mk = f => { const m = new Uint8Array(W * W); for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) if (f(x, y)) m[y * W + x] = 1; return m; };
    const at = (m, x, y) => x >= 0 && y >= 0 && x < W && y < W && m[y * W + x] === 1;
    // pinta uma máscara em faixas: t = posição entre a borda iluminada (cima-esquerda) e a da sombra; contorno no próprio material
    function cel(m, C, o) {
      o = o || {}; const lx = o.lx !== undefined ? o.lx : -0.85, ly = o.ly !== undefined ? o.ly : -0.6, th = o.th || [0.17, 0.6, 0.84];
      for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
        if (!m[y * W + x]) continue;
        let a = 0; while (a < 48 && at(m, Math.round(x - lx * (a + 1)), Math.round(y - ly * (a + 1)))) a++;
        let b = 0; while (b < 48 && at(m, Math.round(x + lx * (b + 1)), Math.round(y + ly * (b + 1)))) b++;
        const t = (b + 0.5) / (a + b + 1) + (o.bias || 0);
        let k = t < th[0] ? 0 : t < th[1] ? 1 : t < th[2] ? 2 : 3; if (o.noHi && k === 0) k = 1;
        P(x, y, o.fn ? o.fn(x, y, k, C) : C[k]);
      }
      if (o.line !== false) for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) if (m[y * W + x] && (!at(m, x + 1, y) || !at(m, x - 1, y) || !at(m, x, y + 1) || !at(m, x, y - 1))) P(x, y, C[4]);
    }
    const fem = ap.sex === 'F', age = ap.age || 0, ex = ap.expr || 0;
    const sk = SKINS[ap.skin || 0], S = ramp(sk);
    const hramp = c => [mix(c, '#ffe6b8', 0.42), mix(c, '#ffdcae', 0.1), mix(c, '#3a1024', 0.3), mix(c, '#2a0818', 0.52), mix(c, '#120810', 0.86)];
    const hc = HAIRC[ap.hairC || 0], HC = hramp(hc), bc = HAIRC[ap.beardC !== undefined ? ap.beardC : (ap.hairC || 0)], BC = ramp(bc);
    const hat = HATS[ap.hat] && HATS[ap.hat].id !== 'none' ? HATS[ap.hat] : null, hair = ap.hair || 0, body = ap.body || 0;
    // ---- geometria da cabeça (grande, ocupando o quadro) ----
    const face = ap.face || 0, FP = [[15.5, 2.3, 20], [16.5, 2.8, 19], [16.5, 4.2, 19.5], [14.5, 2.0, 20.5], [17.5, 3.2, 19]][face];
    const rx = FP[0], nJ = FP[1], ryB = FP[2], cx = 32, cy = 27, ryT = 19;
    const inHead = (x, y) => { const dx = Math.abs(x + 0.5 - cx) / rx; if (y + 0.5 <= cy) { const dy = (y + 0.5 - cy) / ryT; return dx * dx + dy * dy <= 1; } const dy = (y + 0.5 - cy) / ryB; return dy <= 1 && Math.pow(dx, nJ) + dy * dy <= 1; };
    const head = mk(inHead), chinY = Math.round(cy + ryB);
    const brimY = cy - 8; // linha da aba do chapéu
    const hairFn = (x, y, k, C) => { // mechas grossas: risco escuro entre mechas e brilho em faixa na parte de cima
      const q = (((x + 64 - y * 0.4) % 6) + 6) % 6;
      if (q < 1 && k >= 1) return C[Math.min(3, k + 1)];
      if (q >= 2 && q < 3.4 && k <= 1 && y < cy - 4 && y > cy - 17) return C[0];
      return C[k]; };
    const curlFn = (x, y, k, C) => (H(x >> 1, y >> 1, 4) < 0.2 && k < 3 ? C[k + 1] : C[k]);
    // ---- cabelo de trás ----
    if (hair === 3) cel(mk((x, y) => Math.hypot((x + 0.5 - cx) / (rx + 9), (y + 0.5 - (cy - 5)) / (ryT + 5)) < 1 - H(x >> 1, y >> 1, 3) * 0.07), HC, { fn: curlFn });
    if (hair === 4 || hair === 9) cel(mk((x, y) => y > cy - 10 && y < (hair === 4 ? 60 : 54) && Math.abs(x + 0.5 - cx) < rx + 4 + (hair === 9 ? Math.sin(y * 0.55) * 1.2 : 0) + Math.max(0, y - cy - 10) * 0.12), HC, { fn: hairFn });
    if (hair === 5 && !hat) cel(mk((x, y) => Math.hypot((x + 0.5 - (cx + rx + 2)) / 4, (y + 0.5 - (cy + 6)) / 13) < 1), HC, { fn: hairFn });
    // ---- orelhas ----
    for (const s of [-1, 1]) cel(mk((x, y) => Math.hypot((x + 0.5 - (cx + s * (rx - 1))) / 3.4, (y + 0.5 - (cy + 4)) / 4.4) < 1), s < 0 ? [S[1], S[1], S[1], S[2], S[3]] : [S[2], S[2], S[2], S[3], S[3]], {});
    for (const s of [-1, 1]) R(cx + s * (rx + 0.8) - (s < 0 ? 1 : 0), cy + 3, 1, 3, S[3]);
    // ---- pescoço ----
    const neckW = [6, 7.5, 5.5][body];
    const neck = mk((x, y) => y >= cy + 8 && y < 56 && Math.abs(x + 0.5 - cx) < neckW + Math.max(0, y - 50) * 0.8);
    cel(neck, S, { bias: 0.25 });
    for (let x = cx - neckW; x < cx + neckW; x++) for (let y = chinY - 1; y < chinY + 3; y++) if (at(neck, x, y)) P(x, y, S[3]); // sombra do queixo
    // ---- roupa (ombros) ----
    const shirt = ap.shirt || 0, sc0 = shirt === 4 ? '#f2ecdc' : SHIRTC[ap.shirtC || 0], SC = ramp(sc0);
    const sw = [0, 3, -3][body], vDepth = shirt === 1 || shirt === 7 ? 3 : shirt === 4 ? 5 : 6;
    const torso = mk((x, y) => { if (y < 51) return false; const t = y - 51, hw = Math.min(29 + sw, 9 + Math.sqrt(t) * 7.4 + sw * 0.6), d = Math.abs(x + 0.5 - cx); if (d > hw) return false; if (t < vDepth && d < (vDepth - t) * 0.9 + 1.5) return false; return true; });
    const LEA = ramp('#8a5228'), JEA = ramp('#4a6ea0'), VEST = ramp('#6a4428');
    cel(torso, SC, { lx: -0.7, ly: -0.4, fn: (x, y, k, C) => {
      const d = x + 0.5 - cx;
      if (shirt === 0) { const a = ((x + 64) % 6) < 2, b = (y % 6) < 2; return a && b ? C[Math.min(4, k + 2)] : a || b ? C[Math.min(3, k + 1)] : C[k]; }
      if (shirt === 2) return Math.abs(d) > 4 ? LEA[k] : C[k];
      if (shirt === 5) return Math.abs(d) > 3 ? JEA[k] : C[k];
      if (shirt === 6) return Math.abs(d) > 5 ? VEST[k] : C[k];
      return C[k]; } });
    // detalhes da roupa
    if (shirt === 0 || shirt === 3 || shirt === 7) for (let k = 0; k < 5; k++) { P(cx - 7 + k * 0.6, 49 + k, SC[0]); P(cx + 6 - k * 0.6, 49 + k, SC[0]); P(cx - 8 + k * 0.6, 49 + k, SC[4]); P(cx + 7 - k * 0.6, 49 + k, SC[4]); }
    if (shirt === 3 || shirt === 7) for (let y = 56; y < 64; y += 3) { P(cx, y, SC[4]); P(cx, y - 1, SC[0]); }
    if (shirt === 7) { R(cx - 13, 56, 6, 1, SC[4]); R(cx + 8, 56, 6, 1, SC[4]); R(cx - 13, 57, 6, 4, SC[2]); R(cx + 8, 57, 6, 4, SC[2]); }
    if (shirt === 2) { for (let y = 51; y < 64; y += 2) { P(cx - 6, y, '#e8c088'); P(cx + 6, y, '#e8c088'); } for (let x = cx - 20; x < cx + 21; x += 3) P(x, 61, '#e8c088'); }
    if (shirt === 4) for (let x = cx - 10; x <= cx + 10; x++) { const yy = 49 + Math.round(Math.abs(x - cx) * -0.35 + 6); P(x, yy, (x % 3) ? SHIRTC[ap.shirtC || 0] : '#e0b030'); if (x % 4 === 0) P(x, yy + 1, '#d04040'); }
    if (shirt === 5) { for (let y = 50; y < 64; y += 4) { P(cx - 4, y, '#e0b860'); P(cx + 4, y, '#e0b860'); } for (const s of [-1, 1]) for (let k = 0; k < 6; k++) P(cx + s * (4 + k), 50 + k, JEA[4]); }
    if (shirt === 6) for (let y = 52; y < 64; y += 4) P(cx + 6, y, '#e0b860');
    // ---- cabeça ----
    cel(head, S, { th: [0.14, 0.56, 0.88] });
    for (let y = cy + 4; y < chinY - 1; y++) for (let x = 0; x < W; x++) if (at(head, x, y) && !at(head, x + 2, y) && x > cx) P(x, y, S[3]); // linha do queixo no lado da sombra
    if (fem || age === 0) { g.fillStyle = 'rgba(236,96,110,0.32)'; g.fillRect(cx - 10, cy + 7, 4, 2); g.fillRect(cx + 7, cy + 7, 4, 2); }
    R(cx - 2, chinY - 3, 5, 1, S[0]);
    if (ap.freck) for (let k = 0; k < 12; k++) P(cx - 9 + (k * 7) % 19, cy + 5 + (k * 3) % 4, S[3]);
    const fx = cx - 1; // rosto levemente virado: traços puxados para a esquerda
    // ---- olhos (grandes, íris colorida, brilho) ----
    const eS = ap.eyes || 0, ew = eS === 4 || fem ? 6 : 5;
    let eh = [4, 5, 3, 4, 5][eS] + (fem ? 1 : 0); if (ex === 3) eh += 1; if (ex === 1) eh = Math.max(2, eh - 1);
    const ey = cy + 2 - Math.floor(eh / 2), ic = EYEC[ap.eyeC !== undefined ? ap.eyeC : 1], IC = ramp(ic), lid = '#2a1218';
    for (const s of [-1, 1]) {
      const x0 = s < 0 ? fx - 3 - ew : fx + 3;
      R(x0, ey, ew, eh, '#fbf6ee'); R(x0, ey + eh - 1, ew, 1, '#e4d8d0');
      const iw = ew >= 6 ? 4 : 3, ix = s < 0 ? x0 + ew - iw - 1 : x0 + 1;
      for (let yy = 0; yy < eh; yy++) for (let xx = 0; xx < iw; xx++) P(ix + xx, ey + yy, yy === 0 ? IC[3] : yy === eh - 1 ? IC[0] : IC[1]);
      if (eh >= 3) { R(ix + 1, ey + 1, iw - 2 + (iw === 3 ? 0 : 0), Math.min(2, eh - 2), '#140a0c'); }
      P(ix, ey + (eh >= 3 ? 1 : 0), '#ffffff'); // brilho
      R(x0 - (s < 0 ? 1 : 0), ey - 1, ew + 1, 1, lid); P(s < 0 ? x0 - 1 : x0 + ew, ey, lid); // pálpebra e canto externo
      if (eS === 3) P(s < 0 ? x0 - 1 : x0 + ew, ey + 1, lid);
      if (eS === 2) P(s < 0 ? x0 : x0 + ew - 1, ey - 2, lid);
      if (fem) { R(x0 - (s < 0 ? 1 : 0), ey - 2, ew + 1, 1, lid); P(s < 0 ? x0 - 2 : x0 + ew + 1, ey - 2, lid); P(s < 0 ? x0 - 2 : x0 + ew + 1, ey - 3, lid); }
      if (ex === 4) { P(s < 0 ? x0 + ew - 1 : x0, ey, lid); P(s < 0 ? x0 + ew - 2 : x0 + 1, ey, lid); }
      R(x0, ey + eh, ew, 1, ex === 1 ? S[3] : S[2]);
      if (age === 2) { P(s < 0 ? x0 - 2 : x0 + ew + 1, ey + 1, S[3]); P(s < 0 ? x0 - 2 : x0 + ew + 1, ey + 3, S[3]); }
    }
    // ---- sobrancelhas ----
    const bS = ap.brows || 0, brc = (hair === 12 || hair === 1) ? BC[2] : HC[3], bth = bS === 1 || bS === 4 ? 2 : bS === 3 ? 1 : (fem ? 1 : 2), by0 = ey - 3 - (ex === 3 ? 1 : 0);
    for (const s of [-1, 1]) for (let i = 0; i < ew + 1; i++) {
      const x = s < 0 ? fx - 3 - i : fx + 2 + i; let yy = by0;
      if (bS === 2 && i > 0 && i < ew) yy -= 1; if (bS === 4 && i < 2) yy += 1; if (ex === 4 && i < 2) yy += 1; if (ex === 2 && i < 1) yy += 1; if (ex === 3 && i > 1) yy -= 1;
      R(x, yy - (bth - 1), 1, bth, brc);
    }
    // ---- nariz ----
    const nS = ap.nose || 0, nyT = cy + 10, nW = [1, 2, 1, 1, 1][nS];
    for (let y = cy + 4; y < nyT; y++) P(fx + 1, y, S[2]);
    if (nS === 4) P(fx + 2, cy + 6, S[2]);
    P(fx - nW, nyT, S[3]); P(fx + nW + 1, nyT, S[3]); R(fx - nW + 1, nyT, nW * 2, 1, S[2]); P(fx, nyT - 1, S[0]);
    if (nS === 3) P(fx, nyT - 2, S[0]);
    R(fx + 2, nyT - 2, 1, 2, S[2]); P(fx + 2, nyT + 1, S[2]);
    // ---- boca ----
    const mS = ap.mouth || 0, MW = [5, 6, 8, 4, 7][mS], my = cy + 14, ml = fem ? '#8a2a3a' : S[4], lipL = fem ? '#d8707e' : S[0], mx0 = fx - (MW >> 1);
    if (ex === 3) { R(fx - 1, my - 1, 3, 3, '#4a1420'); R(fx - 1, my - 2, 3, 1, ml); R(fx - 1, my + 2, 3, 1, lipL); }
    else if (ex === 1) { for (let i = 0; i < MW; i++) { const e = i === 0 || i === MW - 1; P(mx0 + i, my - (e ? 1 : 0), ml); } if (MW >= 5) R(mx0 + 1, my + 1, MW - 2, 1, '#f8f2ea'); R(mx0 + 1, my + (MW >= 5 ? 2 : 1), MW - 2, 1, lipL); }
    else { for (let i = 0; i < MW; i++) { const e = i === 0 || i === MW - 1; P(mx0 + i, my + ((ex === 4 || ex === 2) && e ? 1 : 0), ml); } if (mS === 1 || mS === 4 || fem) R(mx0 + 1, my + 1, MW - 2, 1, lipL); }
    if (mS === 4 || age === 2) { P(fx - (MW >> 1) - 2, my - 2, S[2]); P(fx + (MW >> 1) + 2, my - 2, S[2]); }
    if (age === 2) { R(fx - 4, cy - 6, 3, 1, S[2]); R(fx + 2, cy - 6, 3, 1, S[2]); }
    // ---- barba e bigode ----
    const bd = ap.beard || 0, mouthBox = (x, y) => Math.abs(x + 0.5 - fx) <= (MW >> 1) + 1 && y >= my - 1 && y <= my + 1;
    if (bd === 1 || bd === 5) for (let y = cy + 6; y <= chinY + 1; y++) for (let x = cx - rx; x <= cx + rx; x++) { if (!at(head, x, y)) continue; const low = y >= my - 2 || Math.abs(x - cx) > rx - 4; if (!low || mouthBox(x, y)) continue; if (H(x, y, 21) < (bd === 5 ? 0.7 : 0.4)) P(x, y, mix(S[2], BC[2], bd === 5 ? 0.7 : 0.5)); }
    const fullB = bd === 2 || bd === 3 || bd === 4;
    if (fullB) { const ext = bd === 2 ? 1 : bd === 3 ? 3 : 9;
      cel(mk((x, y) => { const d = Math.abs(x + 0.5 - cx); if (y > chinY + ext) return false; if (y > chinY - 1) return d < (rx * 0.7) * (1 - (y - chinY + 1) / (ext + 2)) + 2; if (y < cy + 2) return false; if (!at(head, x, y) && !(y > cy + 2 && d < rx + 1)) return false; if (mouthBox(x, y)) return false; return d > rx - (bd === 2 ? 3 : 4) || y >= my - 1; }), BC, { fn: (x, y, k, C) => (H(x, y, 23) < 0.2 && k < 3 ? C[k + 1] : C[k]) }); }
    if (bd === 6 || bd === 9) cel(mk((x, y) => y > my + 2 && y <= chinY + 2 && Math.abs(x + 0.5 - fx) < 3.2 - Math.max(0, y - chinY + 1) * 0.9), BC, {});
    if (fullB || bd >= 7) { const mw = bd === 8 ? 6 : 5, th = bd === 8 ? 3 : 2;
      cel(mk((x, y) => { const d = Math.abs(x + 0.5 - fx); return d < mw && y >= my - 1 - th && y < my - 1 + (d > mw - 2 ? 2 : 0); }), BC, { th: [0.25, 0.6, 0.85] }); }
    // ---- cabelo da frente ----
    const capMask = (low, fr) => mk((x, y) => {
      const d = Math.hypot((x + 0.5 - cx) / (rx + 2.6), (y + 0.5 - (cy - 1.5)) / (ryT + 2.8)); if (d > 1) return false;
      if (hat && y < brimY - 1) return false;
      if (!at(head, x, y)) return hat ? y < brimY + 2 : (y < Math.min(low, cy - 2) || (low > cy + 4 && y < low));
      return y < fr(x);
    });
    const fringe = (base, amp, per, side) => x => base + Math.round((Math.abs(((x + 64) % per) - per / 2) / (per / 2)) * amp) + (side ? Math.round((x - cx) * side) : 0);
    const hairOpts = { fn: hairFn, th: [0.2, 0.6, 0.86] };
    if (hair === 0) cel(capMask(cy + 1, fringe(cy - 10, 4, 6, -0.18)), HC, hairOpts);
    else if (hair === 1) { const m = capMask(cy - 1, () => cy - 10); for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) if (m[y * W + x] && H(x, y, 31) < 0.6) P(x, y, mix(S[2], HC[2], 0.7)); }
    else if (hair === 2) { const m = capMask(cy + 2, fringe(cy - 8, 3, 4)); const extra = mk((x, y) => { for (let k = 0; k < 13; k++) { const a = Math.PI * 1.05 + k / 12 * Math.PI * 0.9, px = cx + Math.cos(a) * (rx + 1.5), py = cy - 2 + Math.sin(a) * (ryT + 1.5); if (hat && py < brimY) continue; if (Math.hypot(x + 0.5 - px, y + 0.5 - py) < 3) return true; } return false; }); for (let i = 0; i < m.length; i++) if (extra[i] && !(head[i] && Math.floor(i / W) > cy - 8)) m[i] = 1; cel(m, HC, { fn: (x, y, k, C) => (H(x >> 1, y >> 1, 5) < 0.25 && k < 3 ? C[k + 1] : C[k]), th: [0.22, 0.6, 0.86] }); }
    else if (hair === 3) cel(mk((x, y) => at(head, x, y) && y < cy - 9 + Math.round(Math.sin(x * 1.3) * 0.8) && !(hat && y < brimY - 1)), HC, { fn: curlFn });
    else if (hair === 4 || hair === 8 || hair === 9) { // médio, longo e ondulado: uma massa só que emoldura o rosto
      const part = x => cy - 10 + Math.round(Math.abs(x + 0.5 - (cx - 4)) * 0.22), low = hair === 8 ? cy + 13 : hair === 9 ? 57 : 62;
      cel(mk((x, y) => { if (hat && y < brimY - 1) return false; if (y >= low) return false; const yy = y + 0.5 - (cy - 1.5); let w;
        if (yy < 0) { const t = yy / (ryT + 3); if (t < -1) return false; w = (rx + 3.2) * Math.sqrt(1 - t * t); } else w = rx + 3.2 + yy * 0.06 + (hair === 9 ? Math.sin(y * 0.55) * 1.2 : 0) - Math.max(0, y - low + 4) * 0.9;
        const d = Math.abs(x + 0.5 - cx); if (d > w) return false; if (at(head, x, y) && y >= part(x) && d < rx - 2.5) return false; if (y > cy + 8 && d < rx - 1.5) return false; return true; }), HC, hairOpts); }
    else if (hair === 5 || hair === 6 || hair === 7) { cel(capMask(cy + 1, x => cy - 9 + Math.round(Math.abs(x + 0.5 - cx) * 0.08)), HC, hairOpts);
      if (hair === 6) cel(mk((x, y) => { if (y < cy + 4 || y > 61) return false; const seg = Math.floor((y - cy - 4) / 3), xo = cx + rx - 1 + (seg % 2 ? 1 : 0); return Math.abs(x + 0.5 - xo) < 2.4 - (y > 58 ? 1 : 0); }), HC, { th: [0.3, 0.6, 0.85] });
      if (hair === 7 && !hat) cel(mk((x, y) => Math.hypot(x + 0.5 - cx, y + 0.5 - (cy - ryT - 2)) < 5.2), HC, hairOpts); }
    else if (hair === 10) { cel(capMask(cy + 1, fringe(cy - 9, 1, 6)), HC, hairOpts); if (!hat) cel(mk((x, y) => Math.hypot((x + 0.5 - (cx - 3)) / 10, (y + 0.5 - (cy - ryT + 1)) / 5.5) < 1 && y < cy - ryT + 3), HC, hairOpts); }
    else if (hair === 11) { cel(capMask(cy + 1, fringe(cy - 9, 1, 7, 0.05)), HC, hairOpts); for (const s of [-1, 1]) cel(mk((x, y) => at(head, x, y) && y >= cy - 6 && y < cy + 7 && Math.abs(x + 0.5 - (cx + s * (rx - 1.6))) < 1.8 - Math.max(0, y - cy) * 0.12), [HC[1], HC[1], HC[2], HC[2], HC[3]], {}); }
    else if (hair === 12) { for (const s of [-1, 1]) cel(mk((x, y) => y >= cy - 4 && y < cy + 3 && Math.abs(x + 0.5 - (cx + s * (rx + 0.2))) < 1.8), HC, {}); if (!hat) { R(cx - 6, cy - ryT + 3, 3, 1, S[0]); P(cx - 7, cy - ryT + 4, S[0]); } }
    // ---- óculos, lenço e colar ----
    if (ap.acc === 5) { for (const s of [-1, 1]) { const x0 = s < 0 ? cx - 4 - ew : cx + 2; g.fillStyle = 'rgba(150,190,230,0.25)'; g.fillRect(x0 + 1, ey - 1, ew + 1, eh + 2); R(x0, ey - 2, ew + 3, 1, '#2a1a1a'); R(x0, ey + eh + 1, ew + 3, 1, '#2a1a1a'); R(x0, ey - 2, 1, eh + 4, '#2a1a1a'); R(x0 + ew + 2, ey - 2, 1, eh + 4, '#2a1a1a'); P(x0 + 1, ey - 1, '#ffffff'); } R(cx - 2, ey - 1, 4, 1, '#2a1a1a'); }
    if (ap.acc === 1) { const SF = ramp(SCARFC[ap.scarfC || 0]); cel(mk((x, y) => { const d = Math.abs(x + 0.5 - cx); return (y >= 48 && y < 52 && d < 10 - (y - 48)) || (y >= 50 && y < 60 && d < 5 - (y - 50) * 0.5); }), SF, {}); R(cx - 1, 50, 3, 2, SF[3]); }
    if (ap.acc === 4) for (let x = cx - 8; x <= cx + 8; x++) { const yy = 50 + Math.round(Math.cos((x - cx) / 8 * 1.4) * 4); P(x, yy, x % 2 ? '#7a2a14' : '#e8c880'); }
    // ---- chapéu ----
    if (hat) {
      const id = hat.id, HT = ramp(hat.c), O = ORN[ap.orn || 'none'] || ORN.none;
      for (let y = brimY + 1; y < brimY + 4; y++) for (let x = 0; x < W; x++) if (at(head, x, y)) { g.fillStyle = 'rgba(60,16,40,0.32)'; g.fillRect(x, y, 1, 1); } // sombra da aba na testa
      const weave = id === 'palha', wfn = (x, y, k, C) => (weave && ((x + y) % 3 === 0 || (x - y + 64) % 4 === 0) && k < 3 ? C[k + 1] : C[k]);
      if (id === 'couro') { // chapéu de couro de vaqueiro: aba quebrada para cima em meia-lua, estrelas e costura
        cel(mk((x, y) => { const dx = (x + 0.5 - cx) / (rx + 7), dy = (y + 0.5 - (brimY + 2)) / 16; return dx * dx + dy * dy < 1 && y <= brimY + 2; }), HT, {});
        cel(mk((x, y) => { const dx = (x + 0.5 - cx) / (rx - 1), dy = (y + 0.5 - (brimY - 1)) / 11; return dx * dx + dy * dy < 1 && y <= brimY; }), HT, {});
        for (let x = cx - rx - 4; x <= cx + rx + 4; x += 3) { const yy = brimY + 2 - Math.round(Math.sqrt(Math.max(0, 1 - ((x - cx) / (rx + 7)) ** 2)) * 14); P(x, yy + 2, '#e8c890'); }
        for (const x of [-7, 0, 7]) { R(cx + x, brimY - 9 - (x ? 0 : 1), 1, 3, '#f0d878'); R(cx + x - 1, brimY - 8 - (x ? 0 : 1), 3, 1, '#f0d878'); }
        R(cx - rx - 2, brimY + 1, rx * 2 + 5, 2, HT[3]); R(cx - rx - 2, brimY + 1, rx * 2 + 5, 1, HT[4]);
        for (const s of [-1, 1]) for (let y = brimY + 3; y < chinY - 2; y++) P(cx + s * (rx - 1 - (y - brimY) * 0.12), y, '#3a1a10'); // barbicacho
      } else {
        const brimW = id === 'bone' || id === 'boina' ? 0 : rx + (id === 'palha' ? 11 : id === 'pantaneiro' ? 10 : 8);
        if (brimW) cel(mk((x, y) => { const dx = (x + 0.5 - cx) / brimW, curl = id === 'rodeio' ? Math.pow(Math.abs(dx), 3) * 4 : id === 'palha' ? -Math.pow(Math.abs(dx), 2) * 1.5 : Math.pow(Math.abs(dx), 2) * 1.5; const yc = brimY + 1 - curl; return Math.abs(dx) < 1 && y >= yc - 1.6 && y <= yc + 1.6 + (1 - Math.abs(dx)) * 1.2; }), HT, { fn: wfn, lx: 0, ly: -1 });
        if (id === 'bone') { cel(mk((x, y) => { const dx = (x + 0.5 - cx) / (rx + 1.5), dy = (y + 0.5 - brimY) / 10; return dx * dx + dy * dy < 1 && y <= brimY + 1; }), HT, {}); cel(mk((x, y) => { const dx = (x + 0.5 - (cx - 2)) / 15; return Math.abs(dx) < 1 && y >= brimY + 1 && y <= brimY + 3 - Math.abs(dx) * 1.5; }), HT, { lx: 0, ly: -1 }); P(cx, brimY - 10, HT[3]); }
        else if (id === 'boina') cel(mk((x, y) => { const dx = (x + 0.5 - (cx + 2)) / (rx + 4), dy = (y + 0.5 - (brimY - 2)) / 6; return dx * dx + dy * dy < 1; }), HT, {});
        else { const ch = id === 'palha' ? 9 : 11, pinch = id !== 'palha'; cel(mk((x, y) => { const t = (brimY - y) / ch; if (t < 0 || t > 1) return false; const w = rx - 1.5 - t * 2.5 - (pinch && t > 0.75 ? (t - 0.75) * 8 : 0); return Math.abs(x + 0.5 - cx) < w && !(pinch && t > 0.88 && Math.abs(x + 0.5 - cx) < 3); }), HT, { fn: wfn });
          const band = O.band || ['#4a2a14']; for (let x = Math.round(cx - rx + 2); x <= cx + rx - 2; x++) { P(x, brimY - 2, band[(x + 64) % band.length]); P(x, brimY - 1, shade(band[(x + 64) % band.length], -0.2)); }
          if (O.feather) { R(cx + 8, brimY - 11, 2, 9, '#f4f0e4'); R(cx + 9, brimY - 11, 1, 9, '#c8bca8'); }
          if (O.stars) for (const x of [-5, 5]) { R(cx + x, brimY - 6, 1, 3, '#f0d878'); R(cx + x - 1, brimY - 5, 3, 1, '#f0d878'); } }
      }
    }
    outline(g, W, W);
    return cv;
  }
  return { draw, EYEC };
})()
