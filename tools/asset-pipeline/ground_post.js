// Pós-processo do chão (roda DENTRO da página, depois de buildGround):
// bordas orgânicas onduladas entre capim/terra/pasto seco, manchas de cor em grande escala com
// pontilhado (mantém o pixel art) e sombra de barranco sob a borda do capim.
// Mesmo método da melhoria gráfica da v2.2 do HTML, adaptado ao chão da v3.2.
module.exports = String.raw`window.__groundPost = function (se) {
  const H = (x, y, s) => H2(x, y, s);
  const vn = (x, y, s) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); const a = H(xi, yi, s), b = H(xi + 1, yi, s), c = H(xi, yi + 1, s), d = H(xi + 1, yi + 1, s); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
  const warp = (x, y, s) => vn(x * 0.07, y * 0.07, s) * 0.78 + vn(x * 0.17, y * 0.17, s + 5) * 0.22;
  const BAY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => v / 16 - 0.47);
  const W0 = WPX, H0 = HPX, img = gg.getImageData(0, 0, W0, H0), src = img.data, out = new Uint8ClampedArray(src);
  const SOFT = new Set([G.GRASS, G.DRY, G.PAST, G.DIRT, G.SAND, G.MUD, G.FLOOR]);
  const GRASSY = t => t === G.GRASS || t === G.DRY || t === G.PAST, BARE = t => t === G.DIRT || t === G.SAND || t === G.MUD || t === G.FLOOR;
  const eff = new Int8Array(W0 * H0), tt = (x, y) => ground[gi(x >> 4, y >> 4)];
  for (let ty = 0; ty < MH; ty++) for (let tx = 0; tx < MW; tx++) {
    const t = ground[gi(tx, ty)], X0 = tx * 16, Y0 = ty * 16; let border = false;
    if (SOFT.has(t)) for (let dy = -1; dy <= 1 && !border; dy++) for (let dx = -1; dx <= 1; dx++) { const n = gt(tx + dx, ty + dy); if (n !== t && SOFT.has(n)) { border = true; break; } }
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const px = X0 + x, py = Y0 + y, p = py * W0 + px, o = p * 4;
      if (!SOFT.has(t)) { eff[p] = t; continue; }
      let sx = px, sy = py;
      if (border) { const qx = Math.max(0, Math.min(W0 - 1, Math.round(px + (warp(px, py, 3) - 0.5) * 16))), qy = Math.max(0, Math.min(H0 - 1, Math.round(py + (warp(px, py, 9) - 0.5) * 16))); if (SOFT.has(tt(qx, qy))) { sx = qx; sy = qy; } }
      const st = tt(sx, sy), so = (sy * W0 + sx) * 4; eff[p] = st;
      let r = src[so], g = src[so + 1], b = src[so + 2];
      const n = vn(px / 64, py / 64, 21) * 0.7 + vn(px / 23, py / 23, 22) * 0.3;
      const q = Math.floor(((n - 0.5) * (GRASSY(st) ? 4.2 : 3) + BAY[(py & 3) * 4 + (px & 3)]) + 0.5);
      if (q) { const f = 1 + q * 0.055; r *= f; g *= f; b *= f; if (GRASSY(st) && q > 0) { r += 6 * q * (se ? 1.4 : 1); b -= 4 * q; } if (GRASSY(st) && q < 0) g += 3; }
      out[o] = r; out[o + 1] = g; out[o + 2] = b;
    }
  }
  for (let y = 2; y < H0 - 1; y++) for (let x = 0; x < W0; x++) {
    const p = y * W0 + x, e = eff[p], o = p * 4;
    if (BARE(e)) { const k = GRASSY(eff[p - W0]) ? 0.74 : GRASSY(eff[p - 2 * W0]) ? 0.87 : 1; if (k < 1) { out[o] *= k; out[o + 1] *= k * 0.97; out[o + 2] *= k * 1.02; } }
    else if (GRASSY(e) && BARE(eff[p - W0])) { out[o] += (255 - out[o]) * 0.16; out[o + 1] += (250 - out[o + 1]) * 0.16; out[o + 2] += (170 - out[o + 2]) * 0.1; }
  }
  img.data.set(out); gg.putImageData(img, 0, 0);
};`;
