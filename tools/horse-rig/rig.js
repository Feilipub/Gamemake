// Desenhista paramétrico de animais em pixel art (RIG), original deste projeto.
// Vistas de lado (olha para a direita), frente e costas; andaduras (passo, trote, galope) e poses (parado, comer,
// beber, cochilar, deitar, assustar, empinar, relinchar). Uso: RIG.get(raça, pelagem, vista, animação, quadro, opções).
// Roda num navegador (usa <canvas>); é chamado pelo tools/asset-pipeline/export_assets.js para gerar os atlas do jogo.
const RIG = (() => {
  /* ---------- cores ---------- */
  const hx = h => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const pk = (r, g, b, a) => (((a === undefined ? 255 : a) << 24) | ((b & 255) << 16) | ((g & 255) << 8) | (r & 255)) >>> 0;
  const up = u => [u & 255, (u >>> 8) & 255, (u >>> 16) & 255, u >>> 24];
  const C = h => { const [r, g, b] = hx(h); return pk(r, g, b); };
  const cl8 = v => v < 0 ? 0 : v > 255 ? 255 : v | 0;
  const mul = (u, k) => { const a = up(u); return pk(cl8(a[0] * k), cl8(a[1] * k), cl8(a[2] * k), a[3]); };
  const mixU = (u, v, t) => { const a = up(u), b = up(v); return pk(cl8(a[0] + (b[0] - a[0]) * t), cl8(a[1] + (b[1] - a[1]) * t), cl8(a[2] + (b[2] - a[2]) * t), 255); };
  const COOL = C('#3a2c5c'), WARM = C('#fff0c0');
  // conjunto de tons: base, sombra (fria), luz (quente), escuro (linhas)
  function T(h) { const b = typeof h === 'number' ? h : C(h); return { b, s: mixU(mul(b, 0.66), COOL, 0.16), l: mixU(mul(b, 1.2), WARM, 0.18), d: mixU(mul(b, 0.46), COOL, 0.2) }; } // contraste maior entre luz e sombra: volume mais legível
  const TC = new Map(); const tn = h => { let t = TC.get(h); if (!t) TC.set(h, t = T(h)); return t; };
  const hsh = (x, y, s) => { let h = (x * 374761393 + y * 668265263 + (s | 0) * 1442695041) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const nz = (x, y, s) => { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy); const a = hsh(xi, yi, s), b = hsh(xi + 1, yi, s), c = hsh(xi, yi + 1, s), d = hsh(xi + 1, yi + 1, s); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
  /* ---------- buffer ---------- */
  let Wd = 0, Ht = 0, COL = null, PID = null, LAY = null, MSK = null, mx0, my0, mx1, my1, PIDN = 0;
  function begin(w, h) { Wd = w; Ht = h; const n = w * h; COL = new Uint32Array(n); PID = new Uint8Array(n); LAY = new Uint8Array(n); if (!MSK || MSK.length < n) MSK = new Uint8Array(n); PIDN = 0; }
  function mClear() { MSK.fill(0, 0, Wd * Ht); mx0 = Wd; my0 = Ht; mx1 = -1; my1 = -1; }
  function mSet(x, y) { if (x < 0 || y < 0 || x >= Wd || y >= Ht) return; MSK[y * Wd + x] = 1; if (x < mx0) mx0 = x; if (x > mx1) mx1 = x; if (y < my0) my0 = y; if (y > my1) my1 = y; }
  function ell(cx, cy, rx, ry, rot) {
    rx = Math.max(0.5, rx); ry = Math.max(0.5, ry); const c = Math.cos(rot || 0), s = Math.sin(rot || 0), R = Math.max(rx, ry) + 1;
    for (let y = Math.floor(cy - R); y <= Math.ceil(cy + R); y++) for (let x = Math.floor(cx - R); x <= Math.ceil(cx + R); x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy, u = (dx * c + dy * s) / rx, v = (-dx * s + dy * c) / ry; if (u * u + v * v <= 1) mSet(x, y);
    }
  }
  function cap(x0, y0, x1, y1, r0, r1) {
    if (r1 === undefined) r1 = r0; const R = Math.max(r0, r1) + 1, dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy || 1e-6;
    for (let y = Math.floor(Math.min(y0, y1) - R); y <= Math.ceil(Math.max(y0, y1) + R); y++) for (let x = Math.floor(Math.min(x0, x1) - R); x <= Math.ceil(Math.max(x0, x1) + R); x++) {
      const px = x + 0.5, py = y + 0.5; let t = ((px - x0) * dx + (py - y0) * dy) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t;
      const qx = x0 + dx * t - px, qy = y0 + dy * t - py, r = r0 + (r1 - r0) * t; if (qx * qx + qy * qy <= r * r) mSet(x, y);
    }
  }
  function poly(pts) {
    let y0 = 1e9, y1 = -1e9; for (const p of pts) { if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
      const py = y + 0.5, xs = [];
      for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; if ((a[1] <= py && b[1] > py) || (b[1] <= py && a[1] > py)) xs.push(a[0] + (py - a[1]) / (b[1] - a[1]) * (b[0] - a[0])); }
      xs.sort((a, b) => a - b); for (let i = 0; i + 1 < xs.length; i += 2) for (let x = Math.ceil(xs[i] - 0.5); x <= Math.floor(xs[i + 1] - 0.5); x++) mSet(x, y);
    }
  }
  function chain(P, R) { for (let i = 0; i + 1 < P.length; i++) cap(P[i][0], P[i][1], P[i + 1][0], P[i + 1][1], R[i], R[i + 1]); }
  const inM = i => MSK[i] === 1;
  /* pinta a máscara atual: mode 0 chapado, 1 volume (luz em cima / sombra embaixo), 2 membro (luz à esquerda, sombra à direita)
     o.fn(x,y,cor)→cor (padrões de pelagem), o.edge desenha linha escura onde a parte cobre outra, o.lay camada (0 trás, 1 frente) */
  function paint(t, mode, o) {
    o = o || {}; const id = ++PIDN, lay = o.lay | 0, sh2 = o.sh2 !== false;
    for (let y = my0; y <= my1; y++) for (let x = mx0; x <= mx1; x++) {
      const i = y * Wd + x; if (!inM(i)) continue;
      let c = t.b;
      if (mode === 1) { // volume em faixas: dorso iluminado, meio-tom pontilhado, sombra na barriga; luz na borda do lado do sol (oeste)
        let dt = 0; while (dt < 5 && y - dt - 1 >= 0 && inM(i - (dt + 1) * Wd)) dt++; let db = 0; while (db < 6 && y + db + 1 < Ht && inM(i + (db + 1) * Wd)) db++;
        const hg = dt + db + 1, chk = (x + y) & 1;
        if (dt === 0) c = t.l; else if (db === 0 || (sh2 && db === 1)) c = t.s;
        else if (dt === 1 && hg > 5) c = chk ? t.l : mixU(t.b, t.l, 0.5);
        else if (db === 2 && hg > 6) c = chk ? mixU(t.b, t.s, 0.55) : t.b;
        else if (o.rim && x < Wd - 1 && !inM(i + 1)) c = t.s;
        else if (x > 0 && !inM(i - 1) && dt < hg / 2) c = mixU(c, t.l, 0.45); }
      else if (mode === 2) { const r = x < Wd - 1 && inM(i + 1), l = x > 0 && inM(i - 1), r2 = x < Wd - 2 && inM(i + 2); if (!r) c = t.s; else if (!l && r2) c = t.l; }
      else if (mode === 3) { const a = y > 0 && inM(i - Wd); if (!a) c = t.l; }
      if (o.fn) { const r = o.fn(x, y, c, t); if (r !== undefined && r !== null) c = r; }
      if (o.edge && (o.edgeY === undefined || y >= o.edgeY)) { const nb = (j, ok) => ok && !inM(j) && PID[j] && LAY[j] <= lay; if (nb(i - 1, x > 0) || nb(i + 1, x < Wd - 1) || (o.edgeY === undefined && (nb(i - Wd, y > 0) || nb(i + Wd, y < Ht - 1)))) c = o.edgeC || t.d; }
      COL[i] = c; PID[i] = id; LAY[i] = lay;
    }
  }
  const dot = (x, y, c, lay) => { x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= Wd || y >= Ht) return; const i = y * Wd + x; COL[i] = c; if (!PID[i]) PID[i] = 250; LAY[i] = lay | 0; };
  const dotIf = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= Wd || y >= Ht) return; const i = y * Wd + x; if (PID[i]) COL[i] = c; };
  // contorno seletivo: pixel vazio vizinho de pixel cheio recebe a cor escurecida do vizinho
  function outline(k) {
    const n = Wd * Ht, oc = new Uint32Array(n), ol = new Uint8Array(n), set = new Uint8Array(n);
    for (let y = 0; y < Ht; y++) for (let x = 0; x < Wd; x++) {
      const i = y * Wd + x; if (PID[i]) continue; let j = -1;
      if (y < Ht - 1 && PID[i + Wd]) j = i + Wd; else if (y > 0 && PID[i - Wd]) j = i - Wd; else if (x > 0 && PID[i - 1]) j = i - 1; else if (x < Wd - 1 && PID[i + 1]) j = i + 1;
      if (j >= 0) { oc[i] = mixU(mul(COL[j], k), COOL, 0.25); ol[i] = LAY[j]; set[i] = 1; }
    }
    for (let i = 0; i < n; i++) if (set[i]) { COL[i] = oc[i]; LAY[i] = ol[i]; PID[i] = 251; }
  }
  function toCanvas(lay) {
    const cv = document.createElement('canvas'); cv.width = Wd; cv.height = Ht; const g = cv.getContext('2d');
    const out = new Uint32Array(Wd * Ht); let any = false;
    for (let i = 0; i < out.length; i++) if (PID[i] && (lay === undefined || LAY[i] === lay)) { out[i] = COL[i]; any = true; }
    if (any) g.putImageData(new ImageData(new Uint8ClampedArray(out.buffer), Wd, Ht), 0, 0);
    return any ? cv : null;
  }
  /* ---------- utilidades geométricas ---------- */
  const V = (x, y) => [x, y], add = (a, b) => [a[0] + b[0], a[1] + b[1]], sc = (a, k) => [a[0] * k, a[1] * k], ln = a => Math.hypot(a[0], a[1]) || 1e-6, nrm = a => sc(a, 1 / ln(a));
  const rot = (a, r) => [a[0] * Math.cos(r) - a[1] * Math.sin(r), a[0] * Math.sin(r) + a[1] * Math.cos(r)];
  const lerpP = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  function ik(U, F, a, b, sgn) { // junta J entre U e F; sgn: +1 dobra para a frente (x+), -1 para trás
    let d = [F[0] - U[0], F[1] - U[1]], L = ln(d); const mx = (a + b) * 0.999; if (L > mx) { d = sc(d, mx / L); L = mx; }
    const ca = Math.max(-1, Math.min(1, (a * a + L * L - b * b) / (2 * a * L))); const al = Math.acos(ca), u = nrm(d);
    let j1 = add(U, sc(rot(u, al), a)), j2 = add(U, sc(rot(u, -al), a)); const J = (sgn > 0 ? j1[0] > j2[0] : j1[0] < j2[0]) ? j1 : j2; return J;
  }
  function bez(a, b, c, n) { const o = []; for (let i = 0; i <= n; i++) { const t = i / n, m = 1 - t; o.push([m * m * a[0] + 2 * m * t * b[0] + t * t * c[0], m * m * a[1] + 2 * m * t * b[1] + t * t * c[1]]); } return o; }
  /* ============ PELAGENS ============ */
  // cada pelagem: corpo, crina/cauda, pernas (pontas), focinho, padrão
  const COATS = {
    alazao: { n: 'Alazão', b: '#9c4e24', m: '#7c3818', leg: null, mz: '#5a3a2e' },
    alazaoClaro: { n: 'Alazão de crina lavada', b: '#a85a2a', m: '#e6cf9a', leg: null, mz: '#5a3a2e' },
    castanho: { n: 'Castanho', b: '#6e3c22', m: '#1a1210', leg: '#1e1612', mz: '#2a1e1a' },
    castanhoEsc: { n: 'Castanho escuro', b: '#4a2818', m: '#120c0a', leg: '#140e0c', mz: '#1e1612' },
    baio: { n: 'Baio', b: '#cfaa66', m: '#2a1e14', leg: '#2e2218', mz: '#3a2e24', dorsal: '#6a4a26' },
    baioClaro: { n: 'Baio-amarilho', b: '#dcbd80', m: '#3a2a1a', leg: '#3a2a1e', mz: '#4a3a2a' },
    tordilho: { n: 'Tordilho', b: '#cfd0d3', m: '#b6b6ba', leg: '#9a9ca2', mz: '#5a5a62', pat: 'dapple', patC: '#a9abb1', head: '#bfc1c5' },
    tordilhoNegro: { n: 'Tordilho negro', b: '#8f9196', m: '#3a3a40', leg: '#4a4a52', mz: '#2a2a30', pat: 'dapple', patC: '#6e7076', head: '#6a6c72' },
    preto: { n: 'Preto', b: '#2c2724', m: '#141110', leg: '#181414', mz: '#1a1616', shine: '#4a4a5a' },
    palomino: { n: 'Palomino', b: '#d8ac56', m: '#f2e8cc', leg: null, mz: '#5a4436', tail: '#efe2c0' },
    pampaPreto: { n: 'Pampa de preto', b: '#2c2724', m: '#1a1614', leg: null, mz: '#3a3030', pat: 'tobiano', patC: '#f2eee6' },
    pampaCastanho: { n: 'Pampa de castanho', b: '#6e3c22', m: '#1a1210', leg: null, mz: '#3a2a26', pat: 'tobiano', patC: '#f2eee6' },
    pampaAlazao: { n: 'Pampa de alazão', b: '#a0522a', m: '#8a4220', leg: null, mz: '#6a4a40', pat: 'overo', patC: '#f4f0e8' },
    pampaBaio: { n: 'Pampa de baio', b: '#cfaa66', m: '#3a2a1a', leg: null, mz: '#4a3a2e', pat: 'tobiano', patC: '#f4f0e8' },
    rosilho: { n: 'Rosilho', b: '#8a5638', m: '#5a3420', leg: '#6a3e26', mz: '#3a2a24', pat: 'roan', patC: '#d9cfc6', head: '#7a4a30' },
    rosilhoMouro: { n: 'Rosilho mouro', b: '#4a4a52', m: '#1a1a1e', leg: '#2a2a30', mz: '#1e1e22', pat: 'roan', patC: '#c8c8cc', head: '#3a3a40' },
    appaLeo: { n: 'Appaloosa pintado', b: '#efebe2', m: '#6a5a4a', leg: null, mz: '#8a7068', pat: 'leopard', patC: '#4a3426' },
    appaManta: { n: 'Appaloosa manta', b: '#6e3c22', m: '#1a1210', leg: '#1e1612', mz: '#4a3a34', pat: 'blanket', patC: '#f2eee6', spotC: '#4a2a1a' },
    appaRosilho: { n: 'Appaloosa rosilho', b: '#9a8a7e', m: '#3a3030', leg: '#4a4040', mz: '#6a5a56', pat: 'leopard', patC: '#3a2a22', roan: 1 },
    // muares e jumentos
    pardo: { n: 'Pardo', b: '#8a7c70', m: '#3a322c', leg: null, mz: '#e2dace', belly: '#d8d0c4', pat: 'cross', patC: '#4a403a' },
    cinza: { n: 'Cinzento', b: '#9c9894', m: '#4a4642', leg: null, mz: '#e8e2d8', belly: '#dcd8d2', pat: 'cross', patC: '#5a5450' },
    russo: { n: 'Russo (escuro)', b: '#4e4238', m: '#221c18', leg: null, mz: '#d8cfc2', belly: '#bfb4a6', pat: 'cross', patC: '#2a2420' },
    // bovinos
    branco: { n: 'Branco', b: '#ece8dc', m: '#2a2622', mz: '#3a3530', tail: '#2a2420' },
    brancoBull: { n: 'Branco (touro)', b: '#ece8dc', m: '#2a2622', mz: '#3a3530', tail: '#2a2420', bullC: '#8a8680' },
    vermelho: { n: 'Vermelho', b: '#a4522a', m: '#5a2a14', mz: '#3a2418', tail: '#3a1e10' },
    gir: { n: 'Gir chita', b: '#a8552a', m: '#7a3818', mz: '#3a2418', tail: '#2a1a10', pat: 'chita', patC: '#efe2c8' },
    cinzaBoi: { n: 'Cinza', b: '#b8b4ac', m: '#4e4a46', mz: '#2a2624', tail: '#2a2624', bullC: '#4e4a46' },
    pretoBoi: { n: 'Preto', b: '#25211f', m: '#151211', mz: '#1a1616', tail: '#100e0d' },
    malhado: { n: 'Malhado preto e branco', b: '#f0ece4', m: '#1e1a18', mz: '#3a3434', tail: '#1e1a18', pat: 'malhado', patC: '#1e1a18' },
    amarelo: { n: 'Amarelo', b: '#c9984e', m: '#5a3a1e', mz: '#2a1e18', tail: '#2a1e18', leg: '#6a4a2a' },
    baioBoi: { n: 'Baio', b: '#d2b07a', m: '#5a442a', mz: '#2a221c', tail: '#2a221c', leg: '#7a5a38' },
    peVermelho: { n: 'Vermelho de extremidades escuras', b: '#9a4a24', m: '#3a1c0e', mz: '#1e1410', tail: '#1e1410', leg: '#4a2414' },
    // caprinos
    moxoto: { n: 'Clara de listras escuras', b: '#ece2c8', m: '#1e1a18', mz: '#2a2420', pat: 'moxoto', patC: '#1e1a18', leg: '#ece2c8' },
    caninde: { n: 'Preta de faces claras', b: '#25211f', m: '#151211', mz: '#d8b07a', pat: 'caninde', patC: '#d0a46a' },
    marota: { n: 'Branca', b: '#f2efe8', m: '#e0dcd2', mz: '#c8a8a0' },
    repartida: { n: 'Repartida (duas cores)', b: '#3a2a20', m: '#1e1612', mz: '#2a1e1a', pat: 'repartida', patC: '#c99a5a' },
    boer: { n: 'Branca de cabeça vermelha', b: '#f2eee6', m: '#e8e2d6', mz: '#c89a8a', pat: 'boer', patC: '#8a3a1e' },
    nubiana: { n: 'Malhada', b: '#7a4a2a', m: '#3a2214', mz: '#5a3a2a', pat: 'malhas', patC: '#e8dcc6' },
    saanen: { n: 'Branca', b: '#f4f2ec', m: '#e4e0d6', mz: '#e8c0b8' },
    ovPreta: { n: 'Preta', b: '#2a2422', m: '#1a1614', mz: '#2a2020', tail: '#1a1614' },
    ovMarrom: { n: 'Marrom', b: '#5a3422', m: '#3a2014', mz: '#3a2a22', tail: '#3a2014' },
    ovVermelha: { n: 'Vermelha', b: '#a8542a', m: '#7a3818', mz: '#8a5040', tail: '#7a3818' },
    ovCabPreta: { n: 'Branca de cabeça preta', b: '#f0ece2', m: '#e0dad0', mz: '#2a2420', pat: 'boer', patC: '#1e1a18' },
    // suínos (snout = cor do focinho)
    piau: { n: 'Creme pintado', b: '#e8d2b0', m: '#e8d2b0', mz: '#e0b8a0', snout: '#d89a90', pat: 'malhado', patC: '#2a2422' },
    moura: { n: 'Moura', b: '#5a5654', m: '#3a3634', mz: '#4a4040', snout: '#3a2e2e', pat: 'roan', patC: '#c8c2b8' },
    canastra: { n: 'Preta', b: '#2a2624', m: '#1a1716', mz: '#2a2222', snout: '#3a2a2a' },
    nilo: { n: 'Preta pelada', b: '#3a3436', m: '#2a2426', mz: '#3a2e30', snout: '#4a3436' },
    caruncho: { n: 'Creme de pintinhas', b: '#e4d0ae', m: '#e4d0ae', mz: '#dcb4a0', snout: '#d49a90', pat: 'leopard', patC: '#2a2422' },
    largewhite: { n: 'Branca rosada', b: '#f0dcd2', m: '#f0dcd2', mz: '#e8b8b0', snout: '#e09a98' },
    duroc: { n: 'Vermelha', b: '#a0482a', m: '#7a3218', mz: '#8a4a3a', snout: '#7a3a30' },
    // cães
    caramelo: { n: 'Caramelo', b: '#d08a3c', m: '#a0602a', mz: '#f0c88a', belly: '#f0c88a' },
    filaFulvo: { n: 'Fulvo de máscara negra', b: '#c08a48', m: '#8a5a28', mz: '#1e1612', mask: 1 },
    filaTigrado: { n: 'Tigrado', b: '#8a5a30', m: '#4a2c14', mz: '#1e1612', pat: 'brindle', patC: '#2a1a10', mask: 1 },
    filaPreto: { n: 'Preto', b: '#25211f', m: '#141110', mz: '#141110' },
    terrier: { n: 'Tricolor', b: '#f2eee6', m: '#1e1a18', mz: '#e8dcc8', pat: 'terrier', patC: '#1e1a18', tan: '#c8823a' },
    terrierAzul: { n: 'Tricolor azul', b: '#f2eee6', m: '#4a5260', mz: '#e8dcc8', pat: 'terrier', patC: '#4a5260', tan: '#c8823a' },
    rastreador: { n: 'Tricolor', b: '#f0ebe0', m: '#2a2420', mz: '#e8dcc8', pat: 'hound', patC: '#2a2420', tan: '#b8743a' },
    rastreadorAzul: { n: 'Azul mosqueado', b: '#8a96a6', m: '#2a2e36', mz: '#c8b8a0', pat: 'ticked', patC: '#3a4250', tan: '#b8743a' },
    mantiqueira: { n: 'Preto e castanho', b: '#2a2420', m: '#1a1614', mz: '#a8642c', pat: 'blacktan', patC: '#b8702e' },
    mantiqueiraFulvo: { n: 'Fulvo', b: '#b8823e', m: '#8a5a24', mz: '#2a2420' },
    heelerAzul: { n: 'Azul mosqueado (blue heeler)', b: '#6a7a8a', m: '#2a2e36', mz: '#c8b8a0', pat: 'ticked', patC: '#3a4250', tan: '#b8743a' },
    heelerVermelho: { n: 'Vermelho mosqueado', b: '#a85a3a', m: '#6a3220', mz: '#e8c8a8', pat: 'ticked', patC: '#e0b090', tan: '#c88a5a' },
    pastorSela: { n: 'Capa preta (sela) e castanho', b: '#c08a48', m: '#2a2420', mz: '#1e1612', pat: 'hound', patC: '#262220', tan: '#b07a3a', mask: 1 },
    pastorPreto: { n: 'Preto', b: '#25211f', m: '#141110', mz: '#141110' },
    rottweiler: { n: 'Preto e castanho', b: '#1e1a18', m: '#0c0a09', mz: '#a8642c', pat: 'blacktan', patC: '#a8642c' },
    labAmarelo: { n: 'Amarelo', b: '#e0c080', m: '#c8a060', mz: '#3a2a20' }, labPreto: { n: 'Preto', b: '#1e1a18', m: '#0c0a09', mz: '#1a1616' }, labChocolate: { n: 'Chocolate', b: '#5a3a24', m: '#3a2416', mz: '#2a1a12' },
    collieBP: { n: 'Preto e branco', b: '#1e1c1a', m: '#0c0b0a', mz: '#f2efe8', pat: 'blacktan', patC: '#f2efe8' },
    collieMerle: { n: 'Azul merle', b: '#8a96a6', m: '#2a2e36', mz: '#f2efe8', pat: 'ticked', patC: '#2a2e36', tan: '#f2efe8' },
    // fauna
    veado: { n: '', b: '#8a6846', m: '#5a4430', mz: '#2a2420', belly: '#d8c4a4' },
    raposa: { n: '', b: '#8a8070', m: '#2a2622', mz: '#2a2622', belly: '#c8bca8', leg: '#3a3430', pat: 'grizzle', patC: '#5a524a' },
    onca: { n: '', b: '#b8875a', m: '#8a5e38', mz: '#f0dcc0', belly: '#ecdcc0', tip: '#2a1e16' }
  };
  /* ============ ANATOMIA BASE ============ */
  const BASE = {
    equino: { H: 26, L: 26, D: 11.5, legT: 1, neckL: 12, neckW: 3.4, neckA: 0.95, arch: 1.4, headL: 10, jowl: 3.1, muzzle: 1.75, prof: 0, ear: 2.6, earW: 1.1, mane: 1.6, maneL: 2.4, maneT: 'flow', tail: 'horse', tailL: 13, tailW: 2.2, tailSet: 0, rump: 1, chest: 1, hoof: 1.35 },
    bovino: { H: 23, L: 30, D: 12.6, legT: 1.05, neckL: 9.5, neckW: 4.6, neckA: 0.36, arch: 0, headL: 9.8, jowl: 3.1, muzzle: 2.4, prof: 0, ear: 3, earW: 1.3, earT: 'horiz', mane: 0, tail: 'tuft', tailL: 12, tailW: 0.7, tailSet: 0, rump: 1, chest: 1, hoof: 1.3, horn: 'curto', hornL: 2.5, hump: 0, dew: 0 },
    caprino: { H: 14, L: 15, D: 7, legT: 0.62, neckL: 5.8, neckW: 2.2, neckA: 1.05, arch: 0.2, headL: 5.6, jowl: 1.8, muzzle: 1.15, prof: 0, ear: 2.6, earW: 0.9, earT: 'horiz', mane: 0, tail: 'goat', tailL: 3, tailW: 0.8, rump: 1, chest: 1, hoof: 0.8, horn: 'cabra', hornL: 3 },
    canino: { H: 12.5, L: 14, D: 6.2, legT: 0.72, neckL: 4.2, neckW: 2.2, neckA: 0.95, arch: 0.3, headL: 5.6, jowl: 2.2, muzzle: 1.2, snout: 2.6, prof: 0, ear: 3, earW: 1.2, earT: 'erect', mane: 0, tail: 'dog', tailT: 'saber', tailL: 7, tailW: 1, rump: 1, chest: 1.05, paw: 1 },
    cervo: { H: 14, L: 15, D: 6.2, legT: 0.5, neckL: 7.2, neckW: 1.9, neckA: 1.12, arch: 0.3, headL: 5.2, jowl: 1.6, muzzle: 0.85, prof: 0, ear: 3.4, earW: 1.2, earT: 'erect', mane: 0, tail: 'goat', tailL: 2.4, tailW: 1, rump: 1.05, chest: 0.9, hoof: 0.6, horn: null, tuck: 0.25 },
    suino: { H: 12, L: 15.5, D: 8.6, legT: 0.62, neckL: 2.2, neckW: 4.8, neckA: 0.22, arch: 0, headL: 5.4, jowl: 3.2, muzzle: 2.4, prof: 0, ear: 3.2, earW: 1.8, earT: 'drop', mane: 0, tail: 'goat', tailT: 'curl', tailL: 2.6, tailW: 0.7, rump: 1.1, chest: 1.05, hoof: 0.75, horn: null },
    felino: { H: 12.5, L: 18, D: 6, legT: 0.95, neckL: 4, neckW: 2.6, neckA: 0.55, arch: 0, headL: 4.4, jowl: 2.4, muzzle: 1.6, snout: 1.2, prof: 0, ear: 1.6, earW: 1.2, earT: 'round', tail: 'cat', tailL: 13, tailW: 1.2, rump: 1, chest: 1, paw: 1.2 }
  };
  /* ============ RAÇAS ============ */
  const BR = {
    // cavalos (as 9 do jogo + 2 antigas para saves anteriores)
    mm: { t: 'equino', H: 27, L: 27, D: 11.6, neckL: 13.2, arch: 2.1, headL: 10.6, prof: 0.2, legT: 0.94, tailSet: 0.25, coats: ['castanho', 'tordilho', 'alazao'] },
    qm: { t: 'equino', H: 25.5, L: 24.4, D: 12.3, neckL: 10.4, neckW: 3.9, arch: 0.8, headL: 9.1, jowl: 3.6, muzzle: 1.6, legT: 1.2, rump: 1.3, chest: 1.15, tailSet: -0.35, mane: 1.3, maneL: 1.8, coats: ['alazao', 'castanho', 'palomino'] },
    campolina: { t: 'equino', H: 29, L: 28.4, D: 12.1, neckL: 12.6, arch: 1.6, headL: 11.8, prof: 1, legT: 1.04, tailSet: -0.2, coats: ['tordilho', 'baio', 'castanho'] },
    crioulo: { t: 'equino', H: 24, L: 25, D: 12.6, neckL: 10.6, neckW: 4, arch: 1.2, headL: 9.4, jowl: 3.5, prof: -0.25, legT: 1.12, mane: 2.5, maneL: 3.3, tailW: 2.7, tailL: 13.5, coats: ['baio', 'rosilho', 'preto'] },
    pampa: { t: 'equino', H: 26.5, L: 26.6, D: 11.7, neckL: 12.4, arch: 1.7, headL: 10.3, prof: 0.1, coats: ['pampaPreto', 'pampaCastanho', 'pampaAlazao'] },
    nordestino: { t: 'equino', H: 23, L: 24, D: 10.4, neckL: 11, neckW: 3, arch: 0.9, headL: 9.6, jowl: 2.8, prof: 0.35, legT: 0.86, mane: 1.2, maneL: 1.8, tailW: 1.7, tailL: 12, hoof: 1.15, coats: ['castanho', 'rosilho', 'alazao'] },
    arabe: { t: 'equino', H: 25, L: 24.6, D: 11.2, neckL: 12.8, neckW: 3.1, arch: 2.5, headL: 8.9, jowl: 3.3, muzzle: 1.35, prof: -1, legT: 0.9, tailSet: 1.5, tailL: 12.5, ear: 2.3, coats: ['tordilho', 'castanho', 'alazao'] },
    paint: { t: 'equino', H: 25.5, L: 25, D: 12.2, neckL: 10.8, neckW: 3.8, arch: 0.9, headL: 9.3, jowl: 3.5, legT: 1.16, rump: 1.24, chest: 1.1, tailSet: -0.3, coats: ['pampaAlazao', 'pampaPreto', 'pampaBaio'] },
    appaloosa: { t: 'equino', H: 26, L: 25.6, D: 11.8, neckL: 11.5, arch: 1.1, headL: 9.8, legT: 1.05, rump: 1.1, mane: 0.9, maneL: 1.3, tailW: 1.25, tailL: 10, sclera: 1, stripes: 1, mottle: 1, coats: ['appaLeo', 'appaManta', 'appaRosilho'] },
    pantaneiro: { t: 'equino', H: 24.5, L: 25, D: 11.4, neckL: 11.2, arch: 1, headL: 10, prof: 0.3, legT: 0.98, coats: ['castanho', 'tordilho', 'baio'] },
    lusitano: { t: 'equino', H: 26.5, L: 25.5, D: 12.2, neckL: 11.8, neckW: 4, arch: 2.4, headL: 10.2, prof: 0.8, mane: 2.3, maneL: 3.5, tailW: 2.5, legT: 1.05, coats: ['tordilho', 'castanho', 'preto'] },
    // muares de sela e jumentos
    mula: { t: 'equino', H: 25, L: 25.4, D: 11.6, neckL: 11.4, neckW: 3.2, arch: 0.5, headL: 11, jowl: 3, muzzle: 1.9, prof: 0.6, ear: 5.4, earW: 1.4, mane: 1, maneL: 1.2, maneT: 'roach', tail: 'mule', tailW: 1.6, tailL: 12, legT: 0.9, hoof: 1.1, coats: ['castanho', 'baio', 'rosilho', 'preto', 'alazao'] },
    burro: { t: 'equino', H: 25.8, L: 25.8, D: 11.8, neckL: 11.6, neckW: 3.4, arch: 0.6, headL: 11.2, jowl: 3.1, muzzle: 1.95, prof: 0.65, ear: 5.6, earW: 1.45, mane: 1, maneL: 1.2, maneT: 'roach', tail: 'mule', tailW: 1.7, tailL: 12.4, legT: 0.94, hoof: 1.1, coats: ['castanho', 'baio', 'rosilho', 'preto', 'alazao'] },
    nordJ: { t: 'equino', H: 20.5, L: 21.5, D: 10.2, neckL: 9.4, neckW: 3, arch: 0.25, neckA: 0.82, headL: 10.4, jowl: 3, muzzle: 2.1, prof: 0.4, ear: 7.2, earW: 1.6, mane: 1.4, maneL: 1.5, maneT: 'roach', tail: 'tuft', tailL: 11, tailW: 0.8, legT: 0.95, hoof: 1.05, donkey: 1, coats: ['pardo', 'cinza', 'russo'] },
    pega: { t: 'equino', H: 24, L: 24.5, D: 11, neckL: 10.6, neckW: 3.3, arch: 0.3, neckA: 0.85, headL: 11.4, jowl: 3.2, muzzle: 2.2, prof: 0.45, ear: 7.6, earW: 1.7, mane: 1.4, maneL: 1.5, maneT: 'roach', tail: 'tuft', tailL: 12, tailW: 0.85, legT: 1, hoof: 1.1, donkey: 1, coats: ['russo', 'pardo', 'cinza'] },
    // bovinos
    peduro: { t: 'bovino', H: 20.5, L: 26, D: 11.2, legT: 0.96, neckL: 7, neckW: 4, headL: 8, jowl: 3, horn: 'peduro', hornL: 4, ear: 2.6, coats: ['peVermelho', 'amarelo', 'baioBoi'] },
    nelore: { t: 'bovino', H: 24, L: 30, D: 12.6, hump: 2.3, dew: 2.3, earT: 'curta', ear: 2.6, horn: 'curto', hornL: 2, coats: ['branco'] },
    gir: { t: 'bovino', H: 23, L: 29, D: 12.6, hump: 2.1, dew: 3, earT: 'pend', ear: 5.2, horn: 'gir', hornL: 3, prof: 1.3, coats: ['gir', 'vermelho'] },
    guzera: { t: 'bovino', H: 25, L: 30.5, D: 12.8, hump: 2.3, dew: 2.2, earT: 'media', ear: 3.4, horn: 'lira', hornL: 6.5, coats: ['cinzaBoi'] },
    tabapua: { t: 'bovino', H: 24, L: 30, D: 12.8, hump: 2.1, dew: 2.2, earT: 'curta', ear: 2.6, horn: 'mocho', coats: ['branco'] },
    brahman: { t: 'bovino', H: 25, L: 30, D: 13, hump: 2.8, dew: 3.2, earT: 'pend', ear: 4.4, horn: 'curto', hornL: 2.6, coats: ['cinzaBoi', 'vermelho'] },
    senepol: { t: 'bovino', H: 22.5, L: 28.5, D: 13, horn: 'mocho', ear: 2.6, coats: ['vermelho'] },
    girolando: { t: 'bovino', H: 23.5, L: 29.5, D: 12.8, hump: 1, dew: 1.5, earT: 'media', ear: 3.6, horn: 'curto', hornL: 2, coats: ['malhado'] },
    angus: { t: 'bovino', H: 22, L: 28, D: 13.4, horn: 'mocho', ear: 2.4, legT: 1.1, coats: ['pretoBoi', 'vermelho'] },
    mestico: { t: 'bovino', H: 23, L: 29, D: 12.6, hump: 1.3, dew: 1.6, earT: 'media', ear: 3.2, horn: 'curto', hornL: 2.4, coats: ['vermelho', 'branco', 'malhado', 'amarelo'] },
    // caprinos
    moxoto: { t: 'caprino', H: 14, L: 15, D: 7, earT: 'horiz', ear: 2.6, horn: 'cabra', coats: ['moxoto'] },
    caninde: { t: 'caprino', H: 14.2, L: 15.2, D: 7.1, earT: 'horiz', ear: 2.8, horn: 'cabra', coats: ['caninde'] },
    marota: { t: 'caprino', H: 13, L: 14, D: 6.8, earT: 'horiz', ear: 2.4, headL: 6, jowl: 2, horn: 'cabra', hornL: 3.6, coats: ['marota'] },
    repartida: { t: 'caprino', H: 14, L: 15, D: 7, earT: 'horiz', ear: 2.6, horn: 'cabra', coats: ['repartida'] },
    nubiana: { t: 'caprino', H: 15.5, L: 16, D: 7.4, earT: 'pend', ear: 4.6, earW: 1.2, prof: 1.4, headL: 6.2, horn: 'cabra', hornL: 2.4, coats: ['nubiana'] },
    boer: { t: 'caprino', H: 14.5, L: 16.5, D: 8, earT: 'pend', ear: 3.6, prof: 1, legT: 0.7, horn: 'cabra', hornL: 3, coats: ['boer'] },
    // ovinos deslanados (mochos, cauda caída, focinho mais curto e largo que o da cabra)
    santaines: { t: 'caprino', H: 15.5, L: 17, D: 8, legT: 0.68, neckL: 5.2, neckW: 2.6, headL: 6.2, jowl: 2.2, muzzle: 1.5, prof: 1.5, earT: 'pend', ear: 4.2, earW: 1.3, horn: 'mocho', tail: 'tuft', tailL: 5, tailW: 1.4, rump: 1.1, coats: ['ovPreta', 'ovMarrom'] },
    moradanova: { t: 'caprino', H: 13.5, L: 15, D: 7.2, legT: 0.62, neckL: 5, neckW: 2.4, headL: 5.6, jowl: 2, muzzle: 1.4, earT: 'horiz', ear: 2.6, horn: 'mocho', tail: 'tuft', tailL: 4.4, tailW: 1.3, coats: ['ovVermelha'] },
    somalis: { t: 'caprino', H: 14, L: 15.6, D: 8.2, legT: 0.6, neckL: 4.6, neckW: 2.8, headL: 5.6, jowl: 2.2, muzzle: 1.5, earT: 'horiz', ear: 2.4, horn: 'mocho', tail: 'tuft', tailL: 3, tailW: 2.2, rump: 1.35, coats: ['ovCabPreta'] },
    dorper: { t: 'caprino', H: 14.5, L: 17, D: 8.8, legT: 0.62, neckL: 4.6, neckW: 3, headL: 5.8, jowl: 2.4, muzzle: 1.6, earT: 'horiz', ear: 2.6, horn: 'mocho', tail: 'tuft', tailL: 4, tailW: 1.5, rump: 1.25, chest: 1.15, coats: ['ovCabPreta'] },
    saanen: { t: 'caprino', H: 15, L: 16, D: 7.4, earT: 'erect', ear: 2.6, earW: 0.9, horn: 'mocho', coats: ['saanen'] },
    // suínos
    piau: { t: 'suino', coats: ['piau'] }, moura: { t: 'suino', coats: ['moura'] }, canastra: { t: 'suino', H: 12.5, L: 18.5, D: 8.4, coats: ['canastra'] },
    nilo: { t: 'suino', H: 11, L: 16.5, earT: 'erect', ear: 2.2, coats: ['nilo'] }, caruncho: { t: 'suino', H: 10.5, L: 15, D: 7, coats: ['caruncho'] },
    largewhite: { t: 'suino', H: 12, L: 18.5, D: 8, earT: 'erect', ear: 2.4, coats: ['largewhite'] }, duroc: { t: 'suino', H: 12, L: 18, D: 8, earT: 'drop', coats: ['duroc'] },
    // cães
    fila: { t: 'canino', H: 17, L: 18.5, D: 8.6, legT: 1, neckL: 4.6, neckW: 3, headL: 6.4, jowl: 3, muzzle: 2, snout: 2.6, earT: 'drop', ear: 3.6, earW: 1.6, tailT: 'saber', tailL: 8.5, tailW: 1.4, jowls: 1, coats: ['filaFulvo', 'filaTigrado', 'filaPreto'] },
    terrier: { t: 'canino', H: 9.5, L: 10.5, D: 4.8, legT: 0.6, neckL: 3.4, neckW: 1.6, headL: 4.6, jowl: 1.7, muzzle: 1, snout: 2, earT: 'fold', ear: 2, earW: 1, tailT: 'up', tailL: 3.5, tailW: 0.8, coats: ['terrier', 'terrierAzul'] },
    rastreador: { t: 'canino', H: 14.5, L: 16, D: 6.8, legT: 0.78, neckL: 4.6, headL: 6.2, jowl: 2.1, muzzle: 1.3, snout: 3, earT: 'drop', ear: 4.8, earW: 1.4, tailT: 'saber', tailL: 8, coats: ['rastreador', 'rastreadorAzul'] },
    caramelo: { t: 'canino', H: 12.5, L: 14, D: 6.2, earT: 'semi', ear: 2.8, tailT: 'curl', tailL: 6, coats: ['caramelo'] },
    mantiqueira: { t: 'canino', H: 13.5, L: 14.6, D: 6.6, earT: 'erect', ear: 3.2, snout: 2.8, muzzle: 1.05, tailT: 'bushy', tailL: 8, tailW: 1.5, rough: 1, coats: ['mantiqueira', 'mantiqueiraFulvo'] },
    // cães antigos (saves) — mantidos com anatomia própria
    collie: { t: 'canino', H: 12, L: 14, D: 6, earT: 'semi', ear: 2.6, tailT: 'bushy', tailL: 8, tailW: 1.5, rough: 1, coats: ['collieBP', 'collieMerle'] },
    boiadeiro: { t: 'canino', H: 12.5, L: 13.5, D: 6.4, earT: 'erect', ear: 3, tailT: 'saber', tailL: 7, coats: ['heelerAzul', 'heelerVermelho'] },
    pastorAlemao: { t: 'canino', H: 14.5, L: 16.5, D: 7, legT: 0.85, neckL: 4.8, headL: 6.2, jowl: 2, muzzle: 1.1, snout: 3, earT: 'erect', ear: 3.8, earW: 1.4, tailT: 'bushy', tailL: 9, tailW: 1.5, coats: ['pastorSela', 'pastorPreto'] },
    rottweiler: { t: 'canino', H: 14, L: 15.5, D: 7.8, legT: 0.95, neckL: 4.2, neckW: 2.8, headL: 5.8, jowl: 2.8, muzzle: 1.6, snout: 2.2, earT: 'drop', ear: 2.4, earW: 1.4, tailT: 'saber', tailL: 3.5, tailW: 1.1, jowls: 1, coats: ['rottweiler'] },
    labrador: { t: 'canino', H: 13.5, L: 15.5, D: 7.4, legT: 0.85, neckL: 4.2, neckW: 2.6, headL: 5.8, jowl: 2.4, muzzle: 1.4, snout: 2.6, earT: 'drop', ear: 3.2, earW: 1.5, tailT: 'saber', tailL: 7.5, tailW: 1.5, coats: ['labAmarelo', 'labPreto', 'labChocolate'] },
    ovelheiro: { t: 'canino', H: 13, L: 14.5, D: 6.4, earT: 'semi', ear: 2.8, tailT: 'bushy', tailL: 8, tailW: 1.5, rough: 1, coats: ['terrier'] },
    // fauna
    veado: { t: 'cervo', horn: 'espeto', hornL: 2.6, coats: ['veado'] },
    raposa: { t: 'canino', H: 9, L: 12, D: 5, legT: 0.55, neckL: 3.6, headL: 5, jowl: 1.8, muzzle: 0.9, snout: 2.8, earT: 'erect', ear: 2.4, tailT: 'brush', tailL: 8, tailW: 1.6, coats: ['raposa'] },
    onca: { t: 'felino', coats: ['onca'] }
  };
  const specCache = new Map();
  function spec(br) { let s = specCache.get(br); if (s) return s; const b = BR[br] || BR.mm; s = Object.assign({}, BASE[b.t], b); specCache.set(br, s); return s; }
  /* ============ GAITS ============ */
  // fases das pernas [FN frente perto, FF frente longe, HN trás perto, HF trás longe], fator de apoio, passada
  const GAIT = {
    walk: { ph: [0.75, 0.25, 0.0, 0.5], duty: 0.62, str: 0.42, lift: 0.2, liftH: 0.15, n: 8 },
    trot: { ph: [0.0, 0.5, 0.5, 0.0], duty: 0.42, str: 0.5, lift: 0.36, liftH: 0.28, n: 8 },
    gallop: { ph: [0.6, 0.7, 0.9, 0.0], duty: 0.32, str: 0.62, lift: 0.5, liftH: 0.4, n: 8 }
  };
  function legPhase(g, i, c) { // retorna [deslocamento x (-0.5..0.5 da passada), elevação 0..1, em apoio]
    const p = ((c + g.ph[i]) % 1 + 1) % 1;
    if (p < g.duty) return [0.5 - p / g.duty, 0, true];
    const s = (p - g.duty) / (1 - g.duty), front = i < 2; return [-0.5 + s - (front ? 0.2 : 0.12) * Math.sin(2 * Math.PI * s), Math.pow(Math.sin(Math.PI * s), 0.85), false];
  }
  /* ============ POSE ============ */
  // a: idle walk trot gallop eat drink doze lie scared rear neigh sit bark sniff
  function pose(s, a, f) {
    const g = GAIT[a], n = g ? g.n : FR[a] || 4, c = f / n, Q = { by: 0, pitch: 0, na: 0, ha: 0, tail: 0, tailUp: 0, tailWave: 0, flow: 0, mouth: 0, ears: 0, eye: 1, legs: null, lie: 0, rear: 0, headDn: 0, chew: 0, tuck: 0, sit: 0, jaw: 0, crouch: 0 };
    if (g) {
      Q.legs = [0, 1, 2, 3].map(i => legPhase(g, i, c)); Q.c = c;
      if (a === 'walk') { Q.by = 0.4 * Math.cos(c * Math.PI * 4); Q.na = -0.05 * Math.cos((c - 0.3) * Math.PI * 4); Q.tail = 0.3 * Math.sin(c * Math.PI * 2); Q.flow = 0.1; }
      else if (a === 'trot') { Q.by = 0.9 * Math.cos((c - 0.2) * Math.PI * 4); Q.na = 0.03 * Math.sin(c * Math.PI * 4); Q.tail = 0.3; Q.tailUp = 0.3; Q.flow = 0.55; Q.tailWave = c; }
      else { Q.by = 1.5 * Math.cos((c - 0.4) * Math.PI * 2); Q.pitch = 0.11 * Math.cos((c - 0.1) * Math.PI * 2); Q.na = -0.16 + 0.1 * Math.cos((c - 0.85) * Math.PI * 2); Q.ha = 0.12; Q.tail = 0.9; Q.tailUp = 0.8; Q.flow = 1; Q.tailWave = c; Q.ears = -0.5; }
      return Q;
    }
    switch (a) {
      case 'idle': Q.tail = [0, 0.35, -0.1, 0][f % 4]; Q.by = f === 2 ? -0.35 : 0; Q.ears = f === 3 ? 0.6 : 0; Q.eye = f === 3 ? 0 : 1; Q.na = f === 1 ? 0.03 : 0; break;
      case 'eat': Q.headDn = 1; Q.chew = f % 2; Q.tail = [0, 0.3, 0, -0.2][f % 4]; Q.na = 0; break;
      case 'drink': Q.headDn = 1.12; Q.chew = f % 2 ? 0.5 : 0; Q.tail = 0.1; break;
      case 'doze': Q.headDn = 0.42; Q.eye = 0; Q.tuck = 1; Q.tail = f % 2 ? 0.15 : 0; Q.ears = -0.3; Q.by = 0.4; break;
      case 'lie': Q.lie = 1; Q.headDn = f % 2 ? 0.1 : 0.2; Q.chew = f % 2; Q.eye = f === 1 ? 0 : 1; Q.tail = 0; break;
      case 'scared': Q.na = 0.26; Q.ha = -0.15; Q.ears = -1; Q.tail = 0.6; Q.tailUp = 0.8; Q.by = f % 2 ? -0.5 : 0; Q.brace = 1; Q.eye = 2; break;
      case 'rear': { const k = [0.25, 0.6, 0.85, 0.85, 0.55, 0.2][f % 6]; Q.rear = k; Q.na = 0.15 * k; Q.paw = f; Q.tail = 0.4; Q.ears = -0.8; Q.mouth = k > 0.7 ? 1 : 0; Q.eye = 2; break; }
      case 'neigh': Q.na = [0.12, 0.28, 0.32, 0.15][f % 4]; Q.ha = [-0.1, -0.3, -0.35, -0.1][f % 4]; Q.mouth = f === 1 || f === 2 ? 1 : 0; Q.ears = 0.2; break;
      case 'moo': Q.na = [0.05, 0.18, 0.2, 0.08][f % 4]; Q.ha = [0, -0.25, -0.3, -0.05][f % 4]; Q.mouth = f === 1 || f === 2 ? 1 : 0; break;
      case 'sit': Q.sit = 1; Q.tail = f % 2 ? 0.3 : -0.1; Q.eye = f === 3 ? 0 : 1; break;
      case 'bark': Q.na = 0.1; Q.mouth = f % 2; Q.by = f % 2 ? -0.5 : 0; Q.tail = 0.5; Q.tailUp = 0.5; break;
      case 'sniff': Q.headDn = 0.8; Q.na = 0.02 * (f % 2); Q.tail = f % 2 ? 0.35 : -0.25; Q.tailUp = 0.35; break;
      case 'stalk': Q.crouch = 1; Q.na = -0.15; Q.legs = [0, 1, 2, 3].map(i => legPhase(GAIT.walk, i, f / 4)); Q.tail = 0.2; break;
    }
    return Q;
  }
  const FR = { idle: 4, eat: 4, drink: 2, doze: 2, lie: 2, scared: 2, rear: 6, neigh: 4, moo: 4, sit: 4, bark: 2, sniff: 2, stalk: 4 };
  /* ============ PINTURA DE PADRÕES ============ */
  function coatFn(co, s, ox, oy, view, seed, part) {
    const pat = co.pat; const pC = co.patC ? C(co.patC) : 0, pT = co.patC ? tn(co.patC) : null;
    return (x, y, c, t) => {
      const u = x - ox, v = y - oy; // coordenadas no corpo
      const tone = c === t.l ? 1 : c === t.s ? -1 : 0, pick = tt => tone > 0 ? tt.l : tone < 0 ? tt.s : tt.b;
      if (co.belly && part === 'body' && v > s.D * 0.15 && view === 'side') return pick(tn(co.belly));
      switch (pat) {
        case 'dapple': { if (part === 'body' || part === 'neck') { const k = Math.sin(u * 1.3) + Math.sin(v * 1.2 + u * 0.4); if (k > 1.25 && tone === 0) return mixU(c, pC, 0.6); } return; }
        case 'roan': { if ((part === 'body' || part === 'neck') && hsh(x, y, seed) < 0.42) return mixU(c, pC, 0.75); return; }
        case 'tobiano': { if (part === 'head') return; const n = nz(u * 0.22 + seed, v * 0.3, seed); if (n > 0.55 || (part === 'leg' && v > -3) || (part === 'tail' && n > 0.8)) return pick(pT); return; }
        case 'overo': { if (part === 'tail' || part === 'mane') return; const n = nz(u * 0.25, v * 0.25 + seed, seed) + (v + s.D * 0.2) * 0.07; if (n > 0.72 || (part === 'head' && n > 0.55)) return pick(pT); return; }
        case 'leopard': { if (part === 'mane' || part === 'tail') return; const r = hsh(Math.floor(u / 2.3), Math.floor(v / 2.1), seed); if (r < 0.3 && hsh(x, y, 7) < 0.8) return co.roan ? mixU(pC, c, 0.2) : pC; if (co.roan && hsh(x, y, seed + 3) < 0.35) return mixU(c, C('#f2eee6'), 0.7); return; }
        case 'blanket': { if (part === 'body' && u < -s.L * 0.1 && v < s.D * 0.4) { const r = hsh(Math.floor(u / 2.4), Math.floor(v / 2.2), seed); return r < 0.22 ? C(co.spotC) : pick(pT); } return; }
        case 'cross': { if (part === 'body' && view === 'side' && v < -s.H * 0.38 + 1.3 * (s.K || 1) && u < s.L * 0.3 && u > -s.L * 0.42) return pC; if (part === 'body' && view === 'back' && Math.abs(u) < 0.8) return pC; if (part === 'neck' && view === 'side' && Math.abs(u - s.L * 0.28) < 0.7 && v < -s.D * 0.15) return pC; return; }
        case 'chita': { if (part === 'body' || part === 'neck') { const n = nz(u * 0.35 + 3, v * 0.4, seed); if (n > 0.68) return pick(pT); } return; }
        case 'malhado': { if (part === 'body' || part === 'neck' || part === 'head') { const n = nz(u * 0.18 + seed, v * 0.22, seed + 1); if (n > 0.52) return pick(pT); } if (part === 'leg') return pick(tn('#f0ece4')); return; }
        case 'moxoto': { if ((part === 'body' || part === 'neck') && view === 'side' && v < -s.H * 0.38 + 1.4 && u < s.L * 0.42) return pC; if (part === 'body' && view === 'back' && Math.abs(u) < 0.8) return pC; if (part === 'body' && v > s.D * 0.32) return pick(pT); if (part === 'leg' && v > -s.H * 0.25) return pick(pT); if (part === 'head' && Math.abs((u - 2) * 0.5 - v) < 0.6) return pC; return; }
        case 'caninde': { if (part === 'body' && v > s.D * 0.36) return pick(pT); if (part === 'leg' && v > -2) return pick(pT); if (part === 'head' && hsh(x, y, 2) < 0.5 && (Math.abs(u) % 3 < 1)) return pick(pT); return; }
        case 'repartida': { if (part === 'body' && u < -s.L * 0.05) return pick(pT); if (part === 'leg' && u < -s.L * 0.05) return pick(pT); return; }
        case 'boer': { if (part === 'head' || (part === 'neck' && u > s.L * 0.3) || part === 'ear') return pick(pT); return; }
        case 'malhas': { if (part === 'body' || part === 'neck') { const n = nz(u * 0.3, v * 0.3 + seed, seed); if (n > 0.62) return pick(pT); } return; }
        case 'brindle': { if (part !== 'head' && Math.sin(u * 1.4 + v * 0.3 + hsh(Math.floor(u), 0, seed) * 2) > 0.55) return mixU(c, pC, 0.55); return; }
        case 'terrier': { if (part === 'head' || part === 'ear') { if (part === 'ear' || (view !== 'front' ? true : Math.abs(u) > 0.8)) return pick(pT); } if (part === 'body' && nz(u * 0.3, v * 0.3, seed) > 0.68) return pick(pT); if (part === 'leg' && v > -1.6) return pick(tn(co.tan)); return; }
        case 'hound': { if (part === 'body' && v < s.D * 0.05 && u > -s.L * 0.4 && u < s.L * 0.25) return pick(pT); if (part === 'head' && view !== 'back') return pick(tn(co.tan)); if (part === 'ear') return pick(tn(co.tan)); return; }
        case 'ticked': { if (part !== 'ear' && hsh(x, y, seed) < 0.4) return mixU(c, pC, 0.7); if (part === 'ear') return pick(pT); return; }
        case 'blacktan': { if (part === 'leg' && v > -s.H * 0.3) return pick(tn(co.patC)); if (part === 'body' && v > s.D * 0.3) return pick(tn(co.patC)); return; }
        case 'grizzle': { if ((part === 'body' || part === 'neck') && hsh(x, y, seed) < 0.3) return mixU(c, pC, 0.6); return; }
      }
    };
  }
  /* ---------- membro com largura constante (spans por linha ou coluna) ---------- */
  function limb(x0, y0, x1, y1, w0, w1) {
    const dx = x1 - x0, dy = y1 - y0;
    if (Math.abs(dy) >= Math.abs(dx)) {
      const ya = Math.round(Math.min(y0, y1)), yb = Math.round(Math.max(y0, y1)) - 1;
      for (let y = ya; y <= yb; y++) { let t = dy ? (y + 0.5 - y0) / dy : 0; t = t < 0 ? 0 : t > 1 ? 1 : t; const xc = x0 + dx * t, w = Math.max(1, Math.round(w0 + (w1 - w0) * t)), xs = Math.round(xc - w / 2); for (let x = xs; x < xs + w; x++) mSet(x, y); }
    } else {
      const xa = Math.round(Math.min(x0, x1)), xb = Math.round(Math.max(x0, x1)) - 1;
      for (let x = xa; x <= xb; x++) { let t = dx ? (x + 0.5 - x0) / dx : 0; t = t < 0 ? 0 : t > 1 ? 1 : t; const yc = y0 + dy * t, w = Math.max(1, Math.round(w0 + (w1 - w0) * t)), ys = Math.round(yc - w / 2); for (let y = ys; y < ys + w; y++) mSet(x, y); }
    }
  }
  function joint(p, w) { if (w >= 2) ell(p[0], p[1], w / 2, w / 2); }
  /* ============ CONSTRUÇÃO — VISTA LATERAL (olhando para a direita) ============ */
  function sideView(s, co, a, f, o) {
    const Q = pose(s, a, f), K = o.k || 1, H = s.H * K, L = s.L * K, D = s.D * K, leg = H - D;
    const eq = s.t === 'equino', bov = s.t === 'bovino', sui = s.t === 'suino', cpr = s.t === 'caprino' || sui, can = s.t === 'canino' || s.t === 'felino', cer = s.t === 'cervo';
    const W = Math.ceil(L * 2.05 + 16), Hh = Math.ceil(H * 1.8 + 12), gy = Hh - 3, cx = Math.round(W * 0.44);
    begin(W, Hh);
    const seed = o.seed || 1, bodyT = tn(co.b), maneT = tn(co.m || co.b), ptsT = co.leg ? tn(co.leg) : null;
    const lie = Q.lie, sit = Q.sit || 0, crouch = Q.crouch || 0, rear = Q.rear || 0;
    const by = Q.by * K + lie * leg * 0.8 + crouch * leg * 0.2;
    const bx = cx, B = (x, y) => [bx + x, gy + y + by];
    let pv = null, ang = 0, drop = 0;
    if (rear) { pv = [bx - L * 0.32, gy - 1]; ang = -rear * 0.78; }
    else if (sit) { pv = [bx - L * 0.48, gy - H * 0.76]; ang = -0.72; drop = H * 0.7; }
    else if (Q.pitch) { pv = [bx, gy - H * 0.62 + by]; ang = -Q.pitch; }
    const R = p => pv ? add(add(pv, rot([p[0] - pv[0], p[1] - pv[1]], ang)), [0, drop]) : p;
    const P_ = (x, y) => R(B(x, y));
    const oxB = bx, oyB = gy - H * 0.62 + by;
    const tuck = s.tuck !== undefined ? s.tuck : can ? 0.42 : cer ? 0.3 : 0;
    // ---------- pescoço / cabeça: ângulos ----------
    const hd = Q.headDn || 0;
    const nb = P_(L * 0.37, -H * 0.8), nl = s.neckL * K;
    const haRest = eq ? 0.66 : bov ? 0.5 : cpr ? 0.62 : cer ? 0.7 : 1.32;
    let ha = haRest + (Q.ha || 0) - (Q.flow > 0.8 ? 0.12 : 0) + rear * 0.3 + crouch * 0.1;
    let na = s.neckA + (Q.na || 0) - Q.pitch * 0.6 - rear * 0.1 + sit * 0.55;
    if (hd > 0) { // abaixa até o capim/água
      const haG = can ? 1.0 : 0.22, HLc = s.headL * K * Math.cos(haG) * 0.96;
      const need = (gy - 0.8 - nb[1] - HLc) / nl, naG = Math.max(-1.12, -Math.asin(Math.max(-1, Math.min(1, need))));
      const k = Math.min(1, hd); na = na + (naG - na) * k; ha = ha + (haG - ha) * k;
    }
    if (lie) na = s.neckA * 0.8 - hd * 0.4;
    const nd = [Math.cos(na), -Math.sin(na)], np = [Math.sin(na), Math.cos(na)]; // np: lado da garganta
    const poll = add(nb, sc(nd, nl));
    // ---------- pernas ----------
    const g = GAIT[a], str = g ? g.str * L : 0;
    const liftF = g ? g.lift * leg : 0, liftH = g ? (g.liftH || g.lift * 0.85) * leg : 0;
    const legX = [L * 0.32, L * 0.29, -L * 0.3, -L * 0.33];
    const legT = s.legT * K, socks = ((o.marks || 0) >> 2) & 15, face = (o.marks || 0) & 3;
    const sockOf = i => eq && !s.donkey && (socks >> i) & 1;
    function hoofAt(i) {
      const front = i < 2;
      if (lie) return front ? B(legX[i] + L * (i === 1 ? 0.02 : 0.12), -1.4 * K) : B(legX[i] + L * (i === 3 ? 0.2 : 0.28), -1.2 * K);
      if (sit) return front ? [bx + legX[i] - L * 0.12 + (i === 1 ? -1 : 0), gy] : [bx - L * 0.2 + (i === 3 ? -1 : 0), gy];
      if (rear && front) { const e = P_(legX[i], -leg - H * 0.02); const pw = Q.paw || 0; return add(e, [L * 0.12 + (i ? -1.2 : 0.6) * K, leg * (0.42 + 0.14 * Math.sin(pw * 1.7 + i * 2.2))]); }
      if (Q.legs) { const [dx, lf] = Q.legs[i]; return [bx + legX[i] + dx * str, gy - lf * (front ? liftF : liftH) + by * 0.15]; }
      let x = bx + legX[i];
      if (Q.brace) x += front ? 2.5 * K : -1 * K;
      if (Q.tuck && i === 2) return [x + 1.5 * K, gy - 1.8 * K];
      if (hd > 0.5 && (eq || bov || cpr)) x += front ? (i === 0 ? 2 : -0.5) * K : 0;
      return [x, gy];
    }
    function drawLeg(i, far) {
      const front = i < 2;
      if (lie) { // deitado: membros dobrados sob o corpo
        if (far) return; const yb = gy - 1.6 * K;
        mClear();
        if (front) { const e = P_(legX[i], -leg - H * 0.02 + 1), kn = [e[0] + L * 0.1, yb], hf = [kn[0] - L * 0.17, yb + 0.4]; limb(e[0], e[1], kn[0], kn[1], Math.round(3 * s.legT * K), Math.round(2.4 * s.legT * K)); limb(kn[0], kn[1], hf[0], hf[1], Math.round(2.2 * s.legT * K), 2); }
        else { const st = P_(legX[i] + L * 0.06, -leg - D * 0.25), hk = [st[0] - L * 0.08, yb], hf = [hk[0] + L * 0.2, yb + 0.4]; limb(st[0], st[1], hk[0], hk[1], Math.round(4 * s.legT * K), Math.round(2.8 * s.legT * K)); limb(hk[0], hk[1], hf[0], hf[1], Math.round(2.2 * s.legT * K), 2); }
        paint(bodyT, 1, { edge: true, fn: ptsT ? ((x, y, c, t) => (y > gy - 3 * K ? (c === t.l ? ptsT.l : c === t.s ? ptsT.s : ptsT.b) : undefined)) : null });
        return;
      }
      const H0 = hoofAt(i);
      const top = front ? P_(legX[i] - (i === 1 ? 0.6 * K : 0), -leg - H * 0.04) : P_(legX[i] + L * 0.09, -leg - D * 0.32);
      const lf = Q.legs ? Q.legs[i][1] : 0;
      // quartela: dobra para trás quando o membro está no ar
      const pl = leg * 0.11, th = lie ? (front ? -1.9 : 1.7) : -0.25 - (front ? 1.5 : 0.9) * lf;
      const fet = add(H0, [-Math.sin(th) * pl, -Math.cos(th) * pl]);
      const a0 = front ? leg * 0.53 : leg * 0.5 + D * 0.3, b0 = front ? leg * 0.42 : leg * 0.43;
      const J = ik(top, fet, a0, b0, front ? 1 : -1);
      const w0 = Math.max(2, Math.round((front ? 3.3 : 4.2) * legT)), w1 = Math.max(cpr || can || cer ? 1 : 2, Math.round((front ? 2.4 : 2.7) * legT)), w2 = Math.max(cpr || can || cer ? 1 : 2, Math.round(2 * legT));
      mClear(); limb(top[0], top[1], J[0], J[1], w0, w1); joint(J, w1); limb(J[0], J[1], fet[0], fet[1], w1 - (front ? 0.4 : 0.6), w2); joint(fet, w2 + (eq ? 0.6 : 0)); limb(fet[0], fet[1], H0[0], H0[1] - 0.6, w2, w2);
      const bellyY = gy - leg + by + 1;
      const lt = far ? { b: bodyT.s, s: bodyT.d, l: bodyT.b, d: bodyT.d } : bodyT;
      const pT = ptsT ? (far ? { b: ptsT.s, s: ptsT.d, l: ptsT.b, d: ptsT.d } : ptsT) : null, kneeY = J[1] - 1;
      const cf = coatFn(co, s, oxB, oyB, 'side', seed, 'leg');
      paint(lt, 2, { edge: !far, edgeY: bellyY, fn: (x, y, c, t) => { const tt = c === t.l ? 'l' : c === t.s ? 's' : 'b'; if (sockOf(i) && y > gy - leg * 0.34) return tn('#f2eee6')[tt]; if (pT && y >= kneeY) return pT[tt]; const r = cf(x, y, c, t); if (r !== undefined) return r; } });
      // casco / pata
      mClear(); const hw = Math.max(2, Math.round((s.hoof || s.paw || 1.2) * 2.2 * K)), hx0 = Math.round(H0[0] - hw / 2 + (front ? 0.5 : 0.3)), hy0 = Math.round(H0[1] - (can ? 1 : 2) * K);
      if (can) { for (let y = hy0; y < hy0 + Math.max(1, Math.round(1.6 * K)); y++) for (let x = hx0; x < hx0 + hw + 1; x++) mSet(x, y); paint(tn(co.leg || co.b), 3, {}); }
      else {
        const ang2 = lie ? 0 : lf; for (let y = hy0; y < hy0 + Math.max(2, Math.round(2 * K)); y++) for (let x = hx0; x < hx0 + hw; x++) mSet(x + (ang2 > 0.5 && y === hy0 ? 0 : 0), y);
        const hc = C(bov || cpr || cer ? '#2a2420' : sockOf(i) ? '#9a8a72' : '#2e2622'); paint(T(hc), 3, { fn: s.stripes ? (x) => (x % 2 ? C('#3a3028') : C('#c8b89a')) : null });
        if (bov || cpr || cer) dot(hx0 + Math.floor(hw / 2), hy0 + 1, C('#141110'));
        if (eq && o.shoe && !lie) for (let x = hx0; x < hx0 + hw; x++) dotIf(x, hy0 + Math.max(2, Math.round(2 * K)) - 1, C(o.shoe === 2 ? '#d0a850' : '#c8ccd4'));
      }
    }
    // ---------- cauda ----------
    const tailBase = P_(-L * (bov ? 0.47 : cpr || cer ? 0.46 : can ? 0.47 : 0.44), -H * (bov ? 0.96 : can ? 0.9 : 0.92) - (s.tailSet > 0 ? s.tailSet * 0.7 * K : 0));
    function drawTail(lay) {
      const n = 7, tl = s.tailL * K, seg = tl / n, TL = s.tail, TT = s.tailT; let dir;
      if (TL === 'goat' || TT === 'up') dir = -0.4 * Math.PI + (Q.tail || 0) * 0.15;
      else if (TT === 'curl') dir = -0.45 * Math.PI;
      else if (TL === 'cat') dir = 0.32 * Math.PI - Q.tailUp * 0.5;
      else if (TL === 'tuft') dir = (s.donkey ? 0.3 : 0.36) * Math.PI - Q.tailUp * 0.75 - rear * 0.3;
      else if (TT) dir = 0.24 * Math.PI - Q.tailUp * 0.6;
      else dir = 0.16 * Math.PI - (s.tailSet || 0) * 0.32 - Q.tailUp * 0.62 - rear * 0.2 + ang * 0.5;
      let p = tailBase; const pts = [p];
      for (let i = 1; i <= n; i++) {
        const t = i / n;
        if (TL === 'horse' || TL === 'mule') { const tg = Q.flow > 0.5 ? -0.06 + 0.3 * (1 - Q.flow) : Math.PI * 0.5 + (Q.tail || 0) * 0.3; dir += (tg - dir) * (Q.flow > 0.5 ? 0.24 : 0.32) + 0.08 * Math.sin(t * 3.4 + (Q.tailWave || 0) * 6.28 + f * 0.8) * (0.3 + Q.flow * 1.7); }
        else if (TL === 'tuft') dir += (Math.PI * 0.53 + (Q.tail || 0) * 0.35 - dir) * 0.3;
        else if (TT === 'curl') dir -= 0.46;
        else if (TL === 'cat') dir += i < n - 2 ? 0.06 : -0.5;
        else if (TL === 'goat' || TT === 'up') dir += 0.03;
        else dir += -0.12 - Q.tailUp * 0.08 + (Q.tail || 0) * 0.08;
        p = add(p, [-Math.cos(dir) * seg, Math.sin(dir) * seg]); pts.push(p);
      }
      let rads;
      if (TL === 'horse' && o.tail === 1) rads = pts.map((_, i) => Math.max(0.55, 1.15 - i * 0.07) * K);
      else if (TL === 'horse') rads = pts.map((_, i) => { const t = i / n; return (0.6 + s.tailW * (0.3 + 0.62 * t) * (1 - Math.pow(t, 5))) * K; });
      else if (TL === 'mule') rads = pts.map((_, i) => (0.65 + (i / n) * s.tailW * 0.65) * K);
      else if (TL === 'tuft') rads = pts.map((_, i) => (i >= n - 1 ? 1.25 : 0.55) * K);
      else if (TT === 'bushy' || TT === 'brush') rads = pts.map((_, i) => (0.6 + Math.sin(i / n * Math.PI * 0.9) * s.tailW) * K);
      else if (TL === 'cat') rads = pts.map(() => 0.85 * K);
      else rads = pts.map((_, i) => Math.max(0.5, s.tailW * (1 - i / (n + 2))) * K);
      mClear(); chain(pts, rads);
      const tt = tn(co.tail || co.m || co.b), end = pts[n];
      paint(tt, 2, { lay, fn: (x, y, c, t) => { if (TL === 'tuft' && Math.hypot(x + 0.5 - end[0], y + 0.5 - end[1]) > 2.1 * K) return tn(co.b).s; if (co.tip && Math.hypot(x + 0.5 - end[0], y + 0.5 - end[1]) < 2.6 * K) return C(co.tip); if ((TL === 'horse' || TL === 'mule') && hsh(x, y >> 1, 3) < 0.2) return t.s; } });
    }
    // ================= desenho =================
    drawLeg(1, 1); drawLeg(3, 1);
    const tailLate = s.tail === 'tuft' || s.tail === 'goat' || s.tail === 'cat' || !!s.tailT;
    if (!tailLate) drawTail(0);
    // ---------- tronco ----------
    const withers = P_(L * 0.27, -H), backP = P_(L * 0.03, -H * (eq ? 0.955 : bov ? 0.985 : 0.97)), croup = P_(-L * 0.3, -H * (s.donkey ? 1.0 : bov ? 0.99 : can ? 0.96 : 0.98)),
      tailHead = P_(-L * 0.43, -H * (bov ? 0.975 : 0.925)), buttock = P_(-L * 0.5, -H * (bov ? 0.82 : 0.76)), rumpLow = P_(-L * 0.45, -H * 0.58),
      flank = P_(-L * 0.2, -leg - H * 0.04 - D * tuck), girth = P_(L * 0.16, -leg + H * 0.012), elbow = P_(L * 0.34, -leg - H * 0.02),
      chestLow = P_(L * 0.47, -H * 0.6), chestFront = P_(L * 0.5, -H * 0.72), neckBaseF = P_(L * 0.47, -H * 0.84);
    mClear();
    poly([withers, backP, croup, tailHead, buttock, rumpLow, flank, girth, elbow, chestLow, chestFront, neckBaseF]);
    { const c0 = P_(-L * 0.3, -H * 0.78); ell(c0[0], c0[1], L * 0.2 * s.rump, H * 0.2 * Math.min(1.15, s.rump), ang); }
    { const c0 = P_(L * 0.02, -leg - D * 0.5); ell(c0[0], c0[1], L * 0.36, D * 0.5 * (1 - tuck * 0.35), ang); }
    { const c0 = P_(L * 0.37, -H * 0.7); ell(c0[0], c0[1], L * 0.13 * s.chest, D * 0.46 * s.chest, ang); }
    if (s.hump) { const hc = P_(L * 0.22, -H - s.hump * 0.3 * K); ell(hc[0], hc[1], s.hump * 1.3 * K, s.hump * 1.1 * K, ang); }
    if (sit) { const c0 = [bx - L * 0.3, gy - D * 0.5]; ell(c0[0], c0[1], L * 0.22, D * 0.5); }
    const bodyFn = coatFn(co, s, oxB, oyB, 'side', seed, 'body');
    paint(bodyT, 1, { rim: true, fn: (x, y, c, t) => { if (co.bullC && o.sex === 'M' && o.adult && x - bx > L * 0.05) return mixU(c, C(co.bullC), Math.min(0.62, (x - bx - L * 0.05) / (L * 0.3))); if (co.shine && c === t.l) return C(co.shine); return bodyFn(x, y, c, t); } });
    // anatomia: linha do ombro e da coxa (equinos), ossos da anca (bovinos)
    const lineIn = (p0, p1, bulge, k0) => { for (let k = 0; k <= 8; k++) { const p = lerpP(p0, p1, k / 8), x = Math.round(p[0] + Math.sin(k / 8 * Math.PI) * bulge), y = Math.round(p[1]); if (x >= 0 && y >= 0 && x < Wd && y < Ht && PID[y * Wd + x]) COL[y * Wd + x] = mul(COL[y * Wd + x], k0); } };
    if (eq && !lie && !s.donkey) { lineIn(P_(L * 0.25, -H * 0.93), P_(L * 0.36, -leg - D * 0.15), 1.2, 0.88); lineIn(P_(-L * 0.12, -H * 0.86), P_(-L * 0.18, -leg - D * 0.2), -1.4, 0.9); }
    if (bov && !lie) { const hk = P_(-L * 0.24, -H * 0.97); dotIf(hk[0], hk[1] + 1, bodyT.s); dotIf(hk[0] + 1, hk[1] + 1, bodyT.s); }
    // úbere / bainha
    if ((bov || cpr) && o.sex === 'F' && o.adult && !lie && !sit) { const u = P_(-L * 0.16, -leg + 0.5); mClear(); ell(u[0], u[1] + 0.8 * K, (bov ? 2.1 : 1.5) * K, (bov ? 1.5 : 1.2) * K); paint(tn('#e2a8a0'), 1, {}); dot(u[0] - 1, u[1] + 2.1 * K, C('#c08078')); dot(u[0] + 1, u[1] + 2.1 * K, C('#c08078')); }
    if (bov && o.sex === 'M' && o.adult && !lie) { const u = P_(L * 0.02, -leg + 0.2); mClear(); limb(u[0], u[1], u[0] + 0.8, u[1] + 2 * K, 2, 2); paint(bodyT, 2, {}); }
    // ---------- pescoço ----------
    const nwT = Math.max(1.6, (eq ? s.jowl * 0.95 : s.neckW * 0.7) * K);
    const pollTop = add(poll, sc(np, -nwT * 0.45)), throat = add(poll, sc(np, nwT * 0.9));
    const crestC = add(lerpP(withers, pollTop, 0.5), sc(np, -(s.arch * K * 0.9 + 0.4)));
    const underC = add(lerpP(throat, chestFront, 0.5), sc(np, (eq ? 0.4 : 0.9) * K));
    const crest = bez(add(withers, [-0.5, 0]), crestC, pollTop, 8);
    mClear(); poly([...crest, ...bez(throat, underC, chestFront, 6), P_(L * 0.26, -H * 0.72)]);
    if (s.dew) { const d0 = lerpP(throat, chestFront, 0.2), d1 = add(chestFront, [-1 * K, 2 * K]); poly([d0, add(lerpP(d0, d1, 0.6), [-0.6 * K, s.dew * K * (hd > 0.5 ? 0.6 : 1.25)]), d1, lerpP(d0, d1, 0.5)]); }
    const neckFn = coatFn(co, s, oxB, oyB, 'side', seed, 'neck');
    paint(bodyT, 1, { sh2: false, fn: (x, y, c, t) => { if (co.bullC && o.sex === 'M' && o.adult) return mixU(c, C(co.bullC), 0.6); return neckFn(x, y, c, t); } });
    // ---------- cabeça ----------
    const fd = [Math.sin(ha), Math.cos(ha)], fnv = [Math.cos(ha), -Math.sin(ha)];
    const HL = s.headL * K, J = s.jowl * K, M = s.muzzle * K, PH = (k, n) => add(poll, add(sc(fd, k), sc(fnv, n)));
    const pr = s.prof || 0, dog = can;
    function ear(far) {
      const base = PH(0.35 * K + (far ? -0.5 * K : 0.3 * K), (far ? -0.4 : 0.2) * K), el = s.ear * K; mClear();
      const e = s.earT;
      if (e === 'pend') { const tip = add(base, add(sc(fd, el * 0.7), sc(fnv, -el * 0.6))); limb(base[0], base[1], tip[0], tip[1], Math.round(s.earW * K * 1.8), Math.round(s.earW * K * 1.3)); }
      else if (e === 'drop') { const tip = add(base, add(sc(fd, el * 0.9), sc(fnv, -el * 0.3))); limb(base[0], base[1], tip[0], tip[1], Math.round(s.earW * K * 2), Math.round(s.earW * K * 1.5)); }
      else if (e === 'horiz' || e === 'curta' || e === 'media') { const tip = add(base, add(sc(fd, -0.15 * el), sc(fnv, -el))); limb(base[0], base[1], tip[0], tip[1], Math.max(2, Math.round(s.earW * K * 1.6)), Math.max(1, Math.round(s.earW * K))); }
      else if (e === 'fold' || e === 'semi') { const tip = add(base, add(sc(fd, -el * 0.75), sc(fnv, -el * 0.25))); limb(base[0], base[1], tip[0], tip[1], Math.max(2, Math.round(s.earW * K * 1.6)), 1); const t2 = add(tip, add(sc(fd, 1.1 * K), sc(fnv, 0.9 * K))); limb(tip[0], tip[1], t2[0], t2[1], 1, 1); }
      else if (e === 'round') { const c0 = add(base, add(sc(fd, -1.1 * K), sc(fnv, -0.7 * K))); ell(c0[0], c0[1], 1.2 * K, 1.1 * K); }
      else { const bk = Q.ears < -0.4 ? 0.95 : Q.ears > 0.3 ? -0.3 : -0.08; const d = add(sc(fd, -el * (1 - Math.abs(bk) * 0.3)), sc(fnv, -el * bk * 0.7)); const tip = add(base, d); limb(base[0], base[1], tip[0], tip[1], Math.max(2, Math.round(s.earW * K * 1.9)), 1); }
      const et = far ? { b: bodyT.s, s: bodyT.d, l: bodyT.b, d: bodyT.d } : (co.head ? tn(co.head) : bodyT);
      const ef = coatFn(co, s, oxB, oyB, 'side', seed, 'ear');
      paint(et, 2, { fn: (x, y, c, t) => { if (s.donkey && Math.hypot(x + 0.5 - base[0], y + 0.5 - base[1]) > el * 0.72) return C('#2a2420'); if (ptsT && eq && !s.donkey && Math.hypot(x + 0.5 - base[0], y + 0.5 - base[1]) > el * 0.8) return ptsT.s; return ef(x, y, c, t); } });
    }
    ear(1);
    mClear();
    if (dog) {
      const sn = (s.snout || 2.4) * K;
      poly([PH(-0.6 * K, -J * 0.5), PH(-0.4 * K, J * 0.55), PH(J * 0.7, J * 0.8), PH(J * 1.25, J * 0.45), PH(J * 1.3 + sn * 0.2, M * 0.65), PH(J * 1.25 + sn, M * 0.45), PH(J * 1.3 + sn, -M * 0.55), PH(J * 1.2 + sn * 0.4, -M * (s.jowls ? 1.5 : 1)), PH(J * 0.9, -J * 0.95), PH(J * 0.2, -J * 1.0)]);
      const jc = PH(J * 0.5, -J * 0.1); ell(jc[0], jc[1], J * 0.95, J * 0.9);
      if (Q.mouth) { const m0 = PH(J * 1.1, -M * 0.9), m1 = PH(J * 1.1 + sn * 0.9, -M * 1.7); limb(m0[0], m0[1], m1[0], m1[1], 2, 1); }
    } else {
      poly([PH(-0.4 * K, -J * 0.55), PH(0, J * 0.4), PH(HL * 0.3, J * 0.45 + pr * 0.3 * K - (pr < 0 ? 0.7 * K : 0)), PH(HL * 0.56, M * 0.95 + pr * 0.85 * K), PH(HL * 0.86, M * 1.0 + pr * 0.3 * K), PH(HL + 0.25 * K, M * 0.4), PH(HL + 0.15 * K, -M * 0.55), PH(HL - 0.9 * K, -M * 1.05), PH(HL * 0.62, -M * 1.0 - (Q.mouth ? 1 : 0)), PH(J * 1.25, -J * 0.95), PH(J * 0.45, -J * 1.05)]);
      const jc = PH(J * 1.1, -J * 0.3); ell(jc[0], jc[1], J * 0.95, J * 0.88, ha);
    }
    const headFn = coatFn(co, s, oxB, oyB, 'side', seed, 'head'), mzT = tn(co.mz || co.b);
    paint(co.head ? tn(co.head) : bodyT, 1, {
      edge: !dog || s.jowls, edgeC: mul(bodyT.s, 0.9),
      fn: (x, y, c, t) => {
        const vx = x + 0.5 - poll[0], vy = y + 0.5 - poll[1], k = vx * fd[0] + vy * fd[1], n2 = vx * fnv[0] + vy * fnv[1];
        const tt = c === t.l ? 'l' : c === t.s ? 's' : 'b';
        if (eq && face && n2 > M * 0.2 && k > HL * 0.1 && k < HL * (face === 1 ? 0.3 : face === 2 ? 0.82 : 0.95) && Math.abs(n2 - M * 0.75) < (face === 3 ? 1.5 : 0.85) * K) return tn('#f4f0e8')[tt];
        const mz = dog ? k > J * 1.25 + (s.snout || 2.4) * K * 0.45 : k > HL * 0.7;
        if (mz) { if (s.mottle && hsh(x, y, 9) < 0.5) return C('#c8a8a0'); return mzT[tt]; }
        if (co.mask && (dog ? k > J * 0.9 : k > HL * 0.4)) return tn('#1e1612')[tt];
        return headFn(x, y, c, t);
      }
    });
    // olho, narina, boca, língua
    const eyeP = dog ? PH(J * 0.75, J * 0.25) : PH(HL * (eq ? 0.27 : 0.3), J * (eq ? 0.18 : 0.08));
    if (Q.eye === 0) { dot(eyeP[0], eyeP[1] + 0.5, mul(bodyT.d, 0.85)); if (!dog) dot(eyeP[0] + 1, eyeP[1] + 0.5, mul(bodyT.d, 0.85)); }
    else { dot(eyeP[0], eyeP[1], C('#100a08')); if ((eq || bov) && K >= 0.8) dot(eyeP[0] + Math.sign(fd[0] || 1), eyeP[1], C('#100a08')); dot(eyeP[0], eyeP[1] - 1, Q.eye === 2 || s.sclera ? C('#f0ece4') : mixU(bodyT.b, C('#ffffff'), 0.5)); }
    if (dog) { const tip = PH(J * 1.28 + (s.snout || 2.4) * K, M * 0.2); dot(tip[0], tip[1], C('#141010')); dot(tip[0], tip[1] - 1, C('#2a2020')); }
    else { const nos = PH(HL - 0.7 * K, M * 0.35); dot(nos[0], nos[1], mul(mzT.d, 0.75)); }
    if (Q.mouth) { const m0 = dog ? PH(J * 1.3 + (s.snout || 2.4) * K * 0.6, -M * 1.1) : PH(HL - 0.3 * K, -M * 0.6); dot(m0[0], m0[1], C('#5a1e1e')); if (dog) dot(m0[0] - fnv[0], m0[1] + 1, C('#e06070')); }
    else if (Q.chew && !dog) { const m0 = PH(HL - 0.5 * K, -M * 0.65); dot(m0[0], m0[1] + (Q.chew ? 0.6 : 0), mzT.d); }
    if (Q.chew && hd > 0.5 && !dog) { const g0 = PH(HL + 0.2 * K, -M * 0.1); dot(g0[0], g0[1] + 1, C('#4a8a34')); dot(g0[0] + 1, g0[1] + 1, C('#6aa84a')); }
    if (sui) { const sn = PH(HL + 0.15 * K, M * 0.1); mClear(); ell(sn[0], sn[1], Math.max(1.2, 0.95 * K), Math.max(1.4, M * 1.05)); paint(tn(co.snout || co.mz || '#d89a90'), 1, {}); dot(sn[0] + Math.sign(fd[0] || 1) * 0.5, sn[1] - 0.5, C('#2a1a18')); dot(sn[0] + Math.sign(fd[0] || 1) * 0.5, sn[1] + 1, C('#2a1a18')); }
    if (cpr && !sui && o.adult && (o.sex === 'M' || hsh(seed, 3, 1) < 0.35)) { const b0 = PH(HL * 0.8, -M * 1.0); mClear(); limb(b0[0], b0[1], b0[0] - 0.6 * K, b0[1] + (o.sex === 'M' ? 2.8 : 1.6) * K, 2, 1); paint(maneT, 2, {}); }
    // chifres
    if (s.horn && s.horn !== 'mocho' && (o.adult || cpr) && !(cpr && o.sex === 'F' && hsh(seed, 5, 1) < 0.25)) {
      const hb = PH(0.5 * K, -0.2 * K), hl = s.hornL * K * (o.sex === 'M' ? 1.15 : 0.85) * (o.adult ? 1 : 0.45);
      const U = sc(fd, -1), Fw = fnv, Bk = sc(fnv, -1); let pts;
      const P2 = (u, f2) => add(hb, add(sc(U, u * hl), sc(Fw, f2 * hl)));
      switch (s.horn) {
        case 'curto': pts = [hb, P2(0.5, 0.3), P2(0.95, 0.15)]; break;
        case 'gir': pts = [hb, P2(0.25, -0.55), P2(-0.25, -0.9)]; break;
        case 'lira': pts = [hb, P2(0.3, -0.4), P2(0.8, -0.15), P2(1.0, 0.25)]; break;
        case 'peduro': pts = [hb, P2(0.35, 0.35), P2(0.85, 0.5)]; break;
        case 'cabra': pts = [hb, P2(0.6, -0.35), P2(0.65, -0.95)]; break;
        case 'espeto': pts = [hb, P2(1, -0.1)]; break;
        default: pts = [hb, P2(1, 0)];
      }
      mClear(); chain(pts, pts.map((_, i) => (cpr ? 0.75 : 0.95) * K * (1 - i / (pts.length + 0.5)) + 0.35));
      const tip = pts[pts.length - 1]; paint(tn(cpr || cer ? '#8a7a64' : '#e6dab0'), 2, { fn: (x, y, c) => Math.hypot(x + 0.5 - tip[0], y + 0.5 - tip[1]) < 1.4 ? C('#3a3028') : c });
    }
    ear(0);
    // ---------- crina e topete ----------
    if (eq && s.mane) {
      mClear(); const N = crest.length - 1, fl = Q.flow || 0;
      for (let i = 1; i < N; i++) {
        const p = crest[i], t = i / N; let h;
        const mst = o.mane || 0;
        if (s.maneT === 'roach' || mst === 1) h = sc(np, -s.maneL * K * (mst === 1 ? 0.55 : 1));
        else if (mst === 3) { if (i % 2) continue; h = sc(np, s.maneL * 0.5 * K); }
        else { const wv = Math.sin(t * 8 + (Q.tailWave || 0) * 6.28 + f) * fl, hang = add(sc(np, s.maneL * 0.85 * (1 - fl * 0.6)), [-s.maneL * 0.25, s.maneL * 0.3 * (1 - fl)]); h = add(sc(hang, K), [(-fl * 2.6 + wv * 0.5) * K, (-fl * 0.9 + wv * 0.8) * K]); if (mst === 2) h = sc(h, 1.6); }
        limb(p[0], p[1], p[0] + h[0], p[1] + h[1], Math.max(2, Math.round(s.mane * K * 1.3)), 1);
      }
      const fl0 = PH(0.1 * K, 0.5 * K); limb(fl0[0], fl0[1], fl0[0] + fd[0] * 2.4 * K + 0.6, fl0[1] + fd[1] * 2.4 * K, 2, 1);
      paint(maneT, 1, { sh2: false, fn: (x, y, c, t) => (hsh(x, y, 5) < 0.22 ? t.s : c) });
      if ((o.mane || 0) === 3) for (let i = 2; i < N; i += 2) { const q = crest[i]; dot(q[0] + np[0] * 1.2, q[1] + np[1] * 1.2, C(o.bridle || '#c03030')); } // laços da trança
    }
    if (can && o.collar) { const cp = add(nb, sc(nd, nl * 0.25)), cw = (s.neckW || 2.2) * K * 1.05; mClear(); limb(cp[0] - np[0] * cw, cp[1] - np[1] * cw, cp[0] + np[0] * cw, cp[1] + np[1] * cw, 2, 2); paint(tn(o.collar), 2, {}); dot(cp[0] + np[0] * cw * 0.9, cp[1] + np[1] * cw * 0.9 + 1, C('#e8c860')); }
    if (s.rough && can) { const p0 = P_(L * 0.3, -H * 0.85); mClear(); for (let k = 0; k < 5; k++) { const p = add(p0, [k * -0.8, k * 0.5]); dot(p[0], p[1], bodyT.s); } }
    // ---------- pernas de perto ----------
    drawLeg(2, 0); drawLeg(0, 0);
    if (tailLate) drawTail(0);
    // ---------- arreios ----------
    let seat = P_(L * 0.08, -H - 1.2 * K);
    if (o.saddle && eq && !lie) {
      const sd = o.saddle, sc0 = C(sd.c || '#7a4a22');
      mClear(); poly([P_(L * 0.25, -H - 0.3), P_(-L * 0.12, -H * 0.965 - 0.3), P_(-L * 0.13, -H + D * 0.4), P_(L * 0.24, -H + D * 0.42)]);
      paint(T(o.pad || '#a83a2a'), 1, { fn: (x, y, c) => { if (Math.abs(y - (P_(0, -H + D * 0.41)[1])) < 0.6) return C('#e0c050'); const pp = o.padPat || 0; if (pp === 1 && (x >> 1) % 2) return mul(c, 0.78); if (pp === 2 && ((x >> 1) + (y >> 1)) % 2) return mul(c, 0.8); if (pp === 3 && (x + y * 2) % 5 === 0) return C('#f0d070'); return c; } });
      const s0 = P_(L * 0.21, -H - 0.3), s1 = P_(-L * 0.09, -H * 0.965 - 0.5);
      mClear(); poly([add(s0, [1 * K, -1.8 * K]), add(s0, [0.8, 1]), add(s1, [0, 1]), add(s1, [-1.2 * K, -2.4 * K]), add(lerpP(s0, s1, 0.5), [0, -0.4])]); paint(T(sc0), 1, {});
      if (sd.id === 'basto') { const m0 = lerpP(s0, s1, 0.5); mClear(); ell(m0[0], m0[1] - 0.8, L * 0.15, 1.4 * K); paint(tn('#efe6d6'), 1, { fn: (x, y, c) => hsh(x, y, 4) < 0.3 ? C('#d4c8b4') : c }); }
      if (sd.id === 'amer') { mClear(); limb(s0[0] + 0.5, s0[1] - 1, s0[0] + 1.2, s0[1] - 3.4 * K, 2, 2); paint(tn('#4a2410'), 2, {}); }
      const g0 = P_(L * 0.12, -H + D * 0.38), g1 = P_(L * 0.15, -leg - 0.5); mClear(); limb(g0[0], g0[1], g1[0], g1[1], 2, 2); paint(tn('#3a2410'), 0, {});
      const st0 = P_(L * 0.05, -H + D * 0.3), st1 = add(st0, [0.6, D * 0.62]); mClear(); limb(st0[0], st0[1], st1[0], st1[1], 1, 1); paint(tn('#2a1a0c'), 0, {}); mClear(); ell(st1[0], st1[1] + 0.8, 1.3, 0.9); paint(tn('#a8a8b0'), 3, {});
      const b0 = PH(0.9 * K, -0.5 * K), b1 = PH(1.4 * K, -J * 0.9), b2 = PH(HL * 0.62, J * 0.25), b3 = PH(HL * 0.72, -M * 0.95), bit = PH(HL - 0.7 * K, -M * 0.35);
      const brC = C(o.bridle || '#3a2410'); [[b0, b1], [b2, b3]].forEach(([p0, p1]) => { for (let k = 0; k <= 5; k++) { const p = lerpP(p0, p1, k / 5); dotIf(p[0], p[1], brC); } });
      dot(bit[0], bit[1], C('#c8c8d0'));
      const rein = add(s0, [1.5 * K, -0.6 * K]); for (let k = 1; k < 12; k++) { const p = lerpP(bit, rein, k / 12); dot(p[0], p[1] + Math.sin(k / 12 * Math.PI) * 1.4 * K, brC); }
      if (o.breast) { const n0 = P_(L * 0.24, -H + D * 0.15), n1 = P_(L * 0.44, -H * 0.72), n2 = P_(L * 0.13, -H + D * 0.42); mClear(); limb(n0[0], n0[1], n1[0], n1[1], 2, 2); limb(n1[0], n1[1], n2[0], n2[1], 2, 1); paint(tn(o.bridle && o.bridle !== '#b8a070' ? o.bridle : '#6a3e1e'), 1, {}); dot(n1[0], n1[1], C('#d8d8e0')); } // peitoral
      seat = add(lerpP(s0, s1, 0.55), [0, -1.4 * K]);
    }
    if (o.harness && eq && !lie) { // peitoral, coalheira e barrigueira de tração
      const n0 = P_(L * 0.4, -H * 0.86), n1 = P_(L * 0.5, -H * 0.62); mClear(); limb(n0[0], n0[1], n1[0], n1[1], 2, 2); paint(tn('#5a3418'), 1, {});
      const t0 = P_(L * 0.48, -H * 0.66), t1 = P_(-L * 0.36, -H * 0.62); mClear(); limb(t0[0], t0[1], t1[0], t1[1], 1, 1); paint(tn('#3a2410'), 0, {});
      const g0 = P_(L * 0.12, -H + 0.5), g1 = P_(L * 0.14, -leg - 0.5); mClear(); limb(g0[0], g0[1], g1[0], g1[1], 2, 2); paint(tn('#5a3418'), 1, {});
      const sd0 = P_(L * 0.06, -H - 0.6); mClear(); ell(sd0[0], sd0[1], L * 0.1, 1.4 * K); paint(tn('#7a4a22'), 1, {});
      const b0 = PH(0.9 * K, -0.5 * K), b1 = PH(1.4 * K, -J * 0.9), bit = PH(HL - 0.7 * K, -M * 0.35); for (let k = 0; k <= 5; k++) { const p = lerpP(b0, b1, k / 5); dotIf(p[0], p[1], C('#3a2410')); } dot(bit[0], bit[1], C('#c8c8d0'));
    }
    if (o.pack && eq && !lie) { // cangalha com caçuás
      const c0 = P_(L * 0.04, -H); mClear(); poly([add(c0, [-L * 0.2, -0.6]), add(c0, [L * 0.2, -0.6]), add(c0, [L * 0.18, 2]), add(c0, [-L * 0.18, 2])]); paint(tn('#6a4a2a'), 1, {});
      mClear(); const k0 = add(c0, [-L * 0.17, 2]); poly([k0, add(k0, [L * 0.34, 0]), add(k0, [L * 0.3, D * 0.64]), add(k0, [L * 0.04, D * 0.64])]); paint(tn('#b08a50'), 1, { fn: (x, y, c) => ((x + y) % 3 === 0 ? C('#8a6634') : (y % 2 ? c : mixU(c, C('#d8b47a'), 0.4))) });
      if (o.load) { mClear(); ell(c0[0], c0[1] - 1.4 * K, L * 0.14, 1.9 * K); paint(tn('#d8c8a0'), 1, {}); }
      seat = add(c0, [0, -2.5 * K]);
    }
    outline(0.42);
    return { b: toCanvas(), f: null, w: Wd, h: Hh, ox: cx, oy: gy, seat: [seat[0], seat[1]] };
  }
  /* ============ VISTAS DE FRENTE / COSTAS ============ */
  function fbView(s, co, a, f, o, back) {
    const Q = pose(s, a, f), K = o.k || 1, H = s.H * K, D = s.D * K, L = s.L * K, legLen = H - D;
    const dz = L * 0.17; // profundidade (parte de trás aparece mais alto na tela)
    const W = Math.ceil(D * 2.6 + 12), Hh = Math.ceil(H + dz + s.neckL * K * 0.9 + s.headL * K * 0.7 + 10), gy = Hh - 3, cx = Math.floor(W / 2) + 0.5;
    begin(W, Hh);
    const seed = o.seed || 1, eq = s.t === 'equino', bov = s.t === 'bovino', can = s.t === 'canino' || s.t === 'felino', cpr = s.t === 'caprino' || s.t === 'suino';
    const bodyT = tn(co.b), maneT = tn(co.m || co.b), legC = co.leg ? tn(co.leg) : bodyT, mzT = tn(co.mz || co.b);
    const lie = Q.lie, sit = Q.sit || 0, by = Q.by * K + lie * legLen * 0.75 + (Q.crouch || 0) * 2 * K, sway = Q.legs ? Math.sin((Q.c || 0) * Math.PI * 2) * 0.45 * K : 0;
    const rear = Q.rear || 0;
    const marks = o.marks || 0, socks = (marks >> 2) & 15, face = marks & 3;
    const gait = GAIT[a], lift = gait ? gait.lift * legLen : 0, str = gait ? gait.str * L : 0;
    // pernas: perto (na frente da tela) e longe (mais alto)
    function leg(i, near) { // i: 0/1 dianteiras (esq/dir na tela), 2/3 traseiras
      const front = i < 2, side = (i % 2 ? 1 : -1);
      const nearPair = back ? !front : front; // par mais próximo da câmera
      const gx = cx + side * (front ? D * 0.24 : D * 0.32) * (nearPair ? 1 : 0.92) + sway;
      const gY = gy - (nearPair ? 0 : dz);
      let lf = 0, fw = 0;
      if (Q.legs) { const map = front ? (i === 0 ? 1 : 0) : (i === 2 ? 3 : 2); const [dx, l] = Q.legs[map]; lf = l * lift; fw = dx * str * 0.25 * (back ? -1 : 1); }
      if (lie) { lf = 0; }
      const topY = gy - legLen + by - (nearPair ? 0 : dz) - (front ? 0 : 1.5 * K) - (rear && front ? rear * legLen * 1.2 : 0);
      let hy = gY - lf * 0.85 + fw * (nearPair ? 0.8 : 0.5), hx = gx;
      if (rear && front) hy = topY + legLen * 0.55;
      if (lie) hy = topY + 2;
      if (sit && !front) { hy = gy - 0.5; hx = gx + side * 1.5 * K; }
      const kneeY = (topY + hy) / 2 - (lf > 0.5 ? lf * 0.25 : 0), kx = hx + side * (front ? 0 : 0.25 * K);
      mClear(); const r0 = (front ? 1.6 : 1.9) * s.legT * K * (s.t === 'caprino' ? 0.85 : 1), r1 = 1.05 * s.legT * K;
      cap(gx, topY, kx, kneeY, r0, r1); cap(kx, kneeY, hx, hy - 1.2 * K, r1, 0.9 * s.legT * K);
      const far = !nearPair, lt = far ? { b: legC.s, s: legC.d, l: legC.b, d: legC.d } : legC;
      const sockI = front ? (i === 0 ? 1 : 0) : (i === 2 ? 3 : 2);
      paint(lt, 2, { lay: near ? 1 : 0, edge: near, fn: (x, y, c, t) => { if (eq && !s.donkey && ((socks >> sockI) & 1) && y > hy - legLen * 0.32) return C('#f2eee6'); return coatFn(co, s, cx, gy - H, back ? 'back' : 'front', seed, 'leg')(x, y, c, t); } });
      mClear(); if (can) ell(hx, hy - 0.5 * K, 1.2 * K, 0.9 * K); else poly([[hx - 1.3 * K, hy - 1.5 * K], [hx + 1.3 * K, hy - 1.5 * K], [hx + 1.4 * K, hy + 0.3], [hx - 1.4 * K, hy + 0.3]]);
      paint(T(can ? C(co.leg || co.b) : C(bov || s.t === 'caprino' ? '#2a2420' : '#3a3028')), 3, { lay: near ? 1 : 0 });
      if (!can && (bov || s.t === 'caprino')) dot(hx, hy, C('#141110'), near ? 1 : 0);
    }
    const bodyY = gy - H + D * 0.5 + by - dz * 0.45;
    const bodyFn = coatFn(co, s, cx, bodyY, back ? 'back' : 'front', seed, 'body');
    // --- camada de trás ---
    // pernas longe
    if (back) { leg(0, 0); leg(1, 0); } else { leg(2, 0); leg(3, 0); }
    // tronco (visto de cima/frente: costas aparecem atrás)
    mClear(); ell(cx + sway, bodyY, D * 0.55 * (back ? Math.max(1, s.rump * 0.95) : 1), D * 0.52 + dz * 0.35);
    if (s.hump && !back) ell(cx + sway, gy - H - dz * 0.3 + by - s.hump * 0.3 * K, s.hump * 1.3 * K, s.hump * 1.1 * K);
    paint(bodyT, 1, { lay: 0, fn: bodyFn });
    // pescoço e cabeça
    const hd = Q.headDn || 0, nr = s.neckL * K * Math.sin(s.neckA + Q.na) * (back ? 0.85 : 0.62) * (1 - hd * 1.1) + (rear ? rear * 6 * K : 0);
    const headTop = gy - H - nr - (back ? dz * 0.95 : 0) + by + (bov && !back ? D * 0.22 : cpr && !back ? D * 0.1 : 0);
    const HLv = s.headL * K * (back ? 0.55 : 0.95), hw = s.jowl * K * (can ? 1.05 : 0.95);
    function neckHead(lay) {
      // pescoço
      mClear(); let nTop = headTop + HLv * (back ? 0.6 : 0.55), nBot = back ? bodyY - D * 0.3 : gy - H + D * 0.25 + by;
      if (hd > 0.5 && !back) { nTop = gy - H + D * 0.2 + by; nBot = gy - HLv * 0.5; }
      if (hd > 0.5 && back) { nTop = bodyY - D * 0.55; }
      const nwB = s.neckW * K * (bov ? 1.5 : 1.25) * (hd > 0.5 ? 0.75 : 1), nwT = s.neckW * K * 0.85 * (hd > 0.5 ? 0.8 : 1);
      poly([[cx - nwT + sway * 0.5, nTop], [cx + nwT + sway * 0.5, nTop], [cx + nwB + sway, nBot], [cx - nwB + sway, nBot]]);
      if (s.dew && !back) poly([[cx - 1.4 * K, nTop + 2], [cx + 1.4 * K, nTop + 2], [cx, nBot + s.dew * 0.8 * K]]);
      paint(bodyT, 1, { lay, fn: coatFn(co, s, cx, bodyY, back ? 'back' : 'front', seed, 'neck') });
      if (eq && s.mane && !back) { mClear(); const side = (seed % 2 ? 1 : -1); for (let y = nTop; y < nBot - 1; y += 1.5) cap(cx + side * (nwT * 0.9 + (y - nTop) / (nBot - nTop) * (nwB - nwT)), y, cx + side * (nwT + 1.2 * s.mane * K + (y - nTop) / (nBot - nTop) * (nwB - nwT)) + side * Q.flow * 1.5, y + 1 + Q.flow, 0.7, 0.5); paint(maneT, 2, { lay }); }
      if (eq && s.mane && back) { mClear(); cap(cx + sway * 0.5, nTop, cx + sway, nBot, s.mane * K * 0.7, s.mane * K * 0.6); paint(maneT, 2, { lay }); }
      // orelhas
      const ey = headTop + 0.5 * K, el = s.ear * K;
      mClear();
      for (const sd of [-1, 1]) {
        const bx0 = cx + sd * hw * 0.55 + sway * 0.4;
        if (s.earT === 'pend' || s.earT === 'drop') cap(bx0 + sd * 0.6 * K, ey + 1.2 * K, bx0 + sd * (s.earW * K + 0.6 * K), ey + el * 0.95, s.earW * K * 0.85, s.earW * K * 0.7);
        else if (s.earT === 'horiz' || s.earT === 'curta' || s.earT === 'media') cap(bx0, ey + 1.2 * K, bx0 + sd * el, ey + 1.6 * K + el * 0.2, s.earW * K * 0.8, s.earW * K * 0.55);
        else if (s.earT === 'fold' || s.earT === 'semi') { cap(bx0, ey + 0.5 * K, bx0 + sd * 0.6 * K, ey - el * 0.55, s.earW * K * 0.9, 0.6 * K); cap(bx0 + sd * 0.6 * K, ey - el * 0.55, bx0 + sd * 1.3 * K, ey - el * 0.2, 0.6 * K, 0.5 * K); }
        else if (s.earT === 'round') ell(bx0 + sd * 0.4 * K, ey - 0.4 * K, 1.1 * K, 1 * K);
        else { const bk = Q.ears < -0.4 ? 1 : 0; cap(bx0, ey + 0.8 * K, bx0 + sd * (0.4 + bk * 1.4) * K, ey - el * (1 - bk * 0.35), s.earW * K * 0.95, 0.45 * K); }
      }
      paint(tn(co.b), 2, { lay, fn: (x, y, c, t) => { if (s.donkey && y < ey - el * 0.55) return C('#2a2420'); return coatFn(co, s, cx, bodyY, 'front', seed, 'ear')(x, y, c, t); } });
      // chifres
      if (s.horn && s.horn !== 'mocho' && (o.adult || s.t === 'caprino')) {
        const hl = s.hornL * K * (o.sex === 'M' ? 1.15 : 0.85) * (o.adult ? 1 : 0.4); mClear();
        for (const sd of [-1, 1]) {
          const h0 = [cx + sd * hw * 0.45, headTop + 0.6 * K];
          if (s.horn === 'lira') { chain([h0, [h0[0] + sd * hl * 0.45, h0[1] - hl * 0.2], [h0[0] + sd * hl * 0.55, h0[1] - hl * 0.7], [h0[0] + sd * hl * 0.3, h0[1] - hl * 0.95]], [0.9 * K, 0.8 * K, 0.6 * K, 0.4]); }
          else if (s.horn === 'gir') { chain([h0, [h0[0] + sd * hl * 0.6, h0[1] + 0.2 * K], [h0[0] + sd * hl * 0.75, h0[1] + hl * 0.45]], [0.9 * K, 0.7 * K, 0.45]); }
          else if (s.horn === 'cabra') { chain([h0, [h0[0] + sd * hl * 0.25, h0[1] - hl * 0.6], [h0[0] + sd * hl * 0.55, h0[1] - hl * 0.8]], [0.7 * K, 0.55 * K, 0.35]); }
          else if (s.horn === 'peduro') { chain([h0, [h0[0] + sd * hl * 0.55, h0[1] - hl * 0.1], [h0[0] + sd * hl * 0.8, h0[1] - hl * 0.55]], [0.9 * K, 0.7 * K, 0.45]); }
          else chain([h0, [h0[0] + sd * hl * 0.7, h0[1] - hl * 0.25], [h0[0] + sd * hl * 0.9, h0[1] - hl * 0.55]], [0.9 * K, 0.7 * K, 0.45]);
        }
        paint(tn(s.t === 'caprino' ? '#8a7a64' : '#e6dab0'), 2, { lay });
      }
      // cabeça
      const grz = hd > 0.5, hx = cx + sway * 0.5;
      if (back && grz) return; // pastando de costas: cabeça escondida atrás do corpo
      mClear();
      let top = headTop, HLf = HLv;
      if (grz && !back) { HLf = HLv * 0.72; top = gy - HLf - 0.5 * K; }
      const fw = hw, mw = s.muzzle * K * (can ? 0.95 : 0.98);
      if (back) { ell(hx, top + HLf * 0.42, fw * 0.92, HLf * 0.55); }
      else if (grz) { poly([[hx - fw * 0.8, top], [hx + fw * 0.8, top], [hx + fw, top + HLf * 0.4], [hx + mw * 1.05, top + HLf], [hx - mw * 1.05, top + HLf], [hx - fw, top + HLf * 0.4]]); }
      else if (can) {
        ell(hx, top + HLf * 0.4, fw * 1.02, HLf * 0.42); ell(hx, top + HLf * 0.8, mw * 1.25, HLf * 0.24);
        if (s.jowls) { ell(hx - mw * 1.05, top + HLf * 0.86, 1.2 * K, 1.3 * K); ell(hx + mw * 1.05, top + HLf * 0.86, 1.2 * K, 1.3 * K); }
      } else {
        poly([[hx - fw * 0.72, top], [hx + fw * 0.72, top], [hx + fw, top + 1.3 * K], [hx + fw * 0.9, top + HLf * 0.38], [hx + mw * 1.08, top + HLf * 0.72], [hx + mw * 1.22, top + HLf * 0.88], [hx + mw * 0.9, top + HLf], [hx - mw * 0.9, top + HLf], [hx - mw * 1.22, top + HLf * 0.88], [hx - mw * 1.08, top + HLf * 0.72], [hx - fw * 0.9, top + HLf * 0.38], [hx - fw, top + 1.3 * K]]);
        if (bov) { ell(hx, top + HLf * 0.25, fw * 1.05, HLf * 0.28); }
      }
      const HF = coatFn(co, s, cx, bodyY, back ? 'back' : 'front', seed, 'head');
      paint(co.head ? tn(co.head) : bodyT, 1, {
        lay, edge: !back, edgeC: mul(bodyT.s, 0.85), fn: (x, y, c, t) => {
          const tt = c === t.l ? 'l' : c === t.s ? 's' : 'b';
          if (!back && !grz) {
            const k = (y + 0.5 - top) / HLf, dxh = x + 0.5 - hx;
            if (eq && face && Math.abs(dxh) < (face === 3 ? 1.6 : 0.9) * K && k > 0.12 && k < (face === 1 ? 0.3 : 0.9)) return tn('#f4f0e8')[tt];
            if (k > (can ? 0.66 : 0.74)) return mzT[tt];
            if (co.mask && k > (can ? 0.55 : 0.4)) return tn('#1e1612')[tt];
            const r = HF(x, y, c, t); if (r !== undefined) return r;
            if (dxh > fw * 0.5 && tt === 'b') return t.s; // bochecha na sombra
            if (Math.abs(dxh) < 0.7 && k > 0.2 && k < 0.66 && tt === 'b' && !can) return t.l; // chanfro iluminado
            return;
          }
          return HF(x, y, c, t);
        }
      });
      if (!back && !grz) { // olhos, narinas, boca
        const ey2 = Math.round(top + HLf * (eq ? 0.3 : can ? 0.32 : 0.3));
        for (const sd of [-1, 1]) { const x = Math.round(hx + sd * (fw - (can ? 1.4 : 0.9) * K) - (sd > 0 ? 1 : 0)); if (Q.eye === 0) dot(x, ey2 + 0.5, mul(bodyT.d, 0.9), lay); else { dot(x, ey2, C('#100a08'), lay); if (s.sclera || Q.eye === 2) dot(x - sd, ey2, C('#f0ece4'), lay); } }
        const ny = Math.round(top + HLf - 1.4 * K);
        if (can) { dot(hx - 0.5, ny, C('#141010'), lay); dot(hx + 0.5, ny, C('#141010'), lay); if (Q.mouth) { dot(hx - 0.5, ny + 2, C('#e06070'), lay); dot(hx + 0.5, ny + 2, C('#e06070'), lay); } }
        else { dot(hx - mw * 0.75, ny, mul(mzT.d, 0.7), lay); dot(hx + mw * 0.75 - 1, ny, mul(mzT.d, 0.7), lay); if (Q.mouth || Q.chew) dot(hx - 0.5, Math.round(top + HLf - 0.3), C('#4a1a1a'), lay); }
        if (eq && s.mane) { mClear(); limb(hx - 0.5, top - 0.5, hx + 0.6, top + 2.8 * K, 2, 1); paint(maneT, 2, { lay }); }
        if (o.saddle && eq) { for (let x = -fw + 0.5; x <= fw - 0.5; x++) dotIf(hx + x, Math.round(top + 1.6 * K), C('#3a2410')); for (let x = -mw - 0.5; x <= mw + 0.5; x++) dotIf(hx + x, Math.round(top + HLf * 0.66), C('#3a2410')); dotIf(hx - mw - 0.5, top + HLf * 0.8, C('#c8c8d0')); dotIf(hx + mw + 0.5, top + HLf * 0.8, C('#c8c8d0')); }
      } else if (back && eq && s.mane) { mClear(); limb(hx, top + HLf * 0.25, hx, top + HLf * 1.15, 2, 2); paint(maneT, 2, { lay }); }
    }
    // cauda
    function tail(lay) {
      const tb = [cx + sway, back ? gy - H + by + 0.8 * K : gy - H - dz + by + 0.5]; const tl = s.tailL * K * (back ? 0.9 : 0.6);
      const sw = (Q.tail || 0) * 2.2 * K * (back ? 1 : 1.5);
      const pts = []; for (let i = 0; i <= 6; i++) { const t = i / 6; pts.push([tb[0] + sw * t * t + (s.tailT === 'curl' ? Math.sin(t * 3) * 1.5 * K : 0), tb[1] + tl * t * (s.tail === 'goat' || s.tailT === 'up' || s.tailT === 'curl' ? -0.4 : 1) - (Q.tailUp || 0) * t * tl * 0.5]); }
      if (!back && !(Math.abs(sw) > 1)) return; // de frente só aparece quando balança
      mClear(); chain(pts, pts.map((_, i) => s.tail === 'horse' ? (0.9 + Math.sin(i / 6 * Math.PI * 0.85) * s.tailW * 0.6) * K : s.tail === 'tuft' ? (i > 4 ? 1.2 : 0.5) * K : (s.tailW * (s.tailT === 'bushy' || s.tailT === 'brush' ? 1.1 : 0.8)) * K));
      paint(tn(co.tail || co.m || co.b), 2, { lay, fn: (x, y, c, t) => (co.tip && y > pts[5][1] - 1 ? C(co.tip) : c) });
    }
    // arreio (de cima)
    function saddle(lay) {
      if (!o.saddle || !eq || lie) return; const sc0 = C(o.saddle.c || '#7a4a22');
      const y0 = gy - H + by - dz * 0.55; mClear(); poly([[cx - D * 0.6, y0 - 2], [cx + D * 0.6, y0 - 2], [cx + D * 0.62, y0 + D * 0.42], [cx - D * 0.62, y0 + D * 0.42]].map(p => [p[0] + sway, p[1]])); paint(T(o.pad || '#a83a2a'), 1, { lay });
      mClear(); ell(cx + sway, y0, D * 0.42, 2.6 * K); paint(T(sc0), 1, { lay });
      mClear(); for (const sd of [-1, 1]) { cap(cx + sd * D * 0.55 + sway, y0 + 1, cx + sd * D * 0.62 + sway, y0 + D * 0.55, 0.5, 0.5); } paint(tn('#3a2410'), 0, { lay });
      for (const sd of [-1, 1]) { mClear(); ell(cx + sd * D * 0.64 + sway, y0 + D * 0.62, 1, 0.8); paint(tn('#a0a0a8'), 3, { lay }); }
    }
    let seat;
    if (!back) {
      // frente: corpo/costas atrás → [cavaleiro] → peito, pernas dianteiras, pescoço, cabeça
      tail(0); saddle(0);
      seat = [cx + sway, gy - H + by - dz * 0.55 - 1.5 * K];
      mClear(); ell(cx + sway, gy - H + D * 0.62 + by, D * 0.46 * s.chest, D * 0.5); paint(bodyT, 1, { lay: 1, fn: coatFn(co, s, cx, bodyY, 'front', seed, 'body') });
      if (Q.headDn > 0.5) { leg(0, 1); leg(1, 1); neckHead(1); }
      else { leg(0, 1); leg(1, 1); neckHead(1); }
      if (!lie && !Q.headDn) { const gx = cx + sway, y0 = Math.round(gy - H + D * 0.75 + by); for (let y = y0; y < y0 + D * 0.3; y++) dotIf(gx, y, mul(bodyT.s, 0.95)); }
    } else {
      // costas: pescoço/cabeça e costas → [cavaleiro] → garupa, cauda, pernas traseiras
      neckHead(0); saddle(0);
      seat = [cx + sway, gy - H + by - dz * 0.55 - 1.5 * K];
      mClear(); ell(cx + sway, gy - H + D * 0.45 + by, D * 0.56 * Math.max(1, s.rump * 0.95), D * 0.5); paint(bodyT, 1, { lay: 1, fn: coatFn(co, s, cx, bodyY, 'back', seed, 'body') });
      leg(2, 1); leg(3, 1); tail(1);
      if (o.pack && eq) { mClear(); for (const sd of [-1, 1]) ell(cx + sd * D * 0.62 + sway, gy - H + D * 0.25 + by, D * 0.25, D * 0.32); paint(tn('#b08a50'), 1, { lay: 1, fn: (x, y, c) => ((x + y) % 3 === 0 ? C('#8a6634') : c) }); }
    }
    if (o.pack && eq && !back) { mClear(); for (const sd of [-1, 1]) ell(cx + sd * D * 0.66 + sway, gy - H + D * 0.2 + by - dz * 0.4, D * 0.25, D * 0.34); paint(tn('#b08a50'), 1, { lay: 0, fn: (x, y, c) => ((x + y) % 3 === 0 ? C('#8a6634') : c) }); }
    outline(0.42);
    return { b: toCanvas(0), f: toCanvas(1), w: Wd, h: Hh, ox: cx, oy: gy, seat };
  }
  /* ============ CACHE ============ */
  const CACHE = new Map();
  function get(br, coat, view, a, f, o) {
    o = o || {}; const s = spec(br), co = COATS[coat] || COATS[(s.coats || ['castanho'])[0]];
    const key = br + '|' + coat + '|' + view + '|' + a + '|' + f + '|' + (o.k || 1) + '|' + (o.marks || 0) + '|' + (o.seed || 0) + '|' + (o.sex || '') + (o.adult ? 1 : 0) + '|' + (o.saddle ? o.saddle.id : '') + (o.pack ? 'p' + (o.load ? 1 : 0) : '') + (o.harness ? 'h' : '') + '|' + (o.mane || 0) + (o.tail || 0) + (o.pad || '') + (o.padPat || 0) + (o.bridle || '') + (o.breast || 0) + (o.shoe || 0) + (o.collar || '');
    let r = CACHE.get(key); if (r) return r;
    if (CACHE.size > 2200) { let n = 0; for (const k of CACHE.keys()) { CACHE.delete(k); if (++n > 600) break; } }
    r = view === 'side' ? sideView(s, co, a, f, o) : fbView(s, co, a, f, o, view === 'back');
    CACHE.set(key, r); return r;
  }
  /* ============ CARROÇA (2 rodas, varais, mesa de tábuas) ============ */
  function cartSpr(view, wph, load) {
    const key = 'cart|' + view + '|' + wph + '|' + load; let r = CACHE.get(key); if (r) return r;
    const wood = tn('#8a5a2a'), woodD = tn('#6a4020'), rim = tn('#4a2e16'), iron = tn('#5a5a60'), sackT = tn('#d8c8a0'), hayT = tn('#d8b860');
    if (view === 'side') {
      begin(58, 32); const gy = 29, cx = 22;
      // varal longe
      mClear(); limb(cx + 10, gy - 12, cx + 30, gy - 15, 1, 1); paint({ b: woodD.s, s: woodD.d, l: woodD.b, d: woodD.d }, 0, {});
      // carga
      if (load) { mClear(); ell(cx - 6, gy - 16, 5, 3.2); ell(cx + 2, gy - 16.5, 4.5, 3); paint(sackT, 1, { fn: (x, y, c) => (x === cx - 2 ? sackT.s : c) }); if (load > 1) { mClear(); poly([[cx - 12, gy - 20], [cx - 1, gy - 20], [cx - 1, gy - 15], [cx - 12, gy - 15]]); paint(hayT, 1, { fn: (x, y, c) => ((x + y * 2) % 4 === 0 ? hayT.s : c) }); } }
      // mesa e guardas
      mClear(); poly([[cx - 15, gy - 14], [cx + 11, gy - 14], [cx + 11, gy - 9], [cx - 15, gy - 9]]); paint(wood, 1, { fn: (x, y, c, t) => (y === gy - 12 ? t.s : (x - cx + 15) % 6 === 0 ? woodD.b : c) });
      mClear(); for (let x = cx - 14; x <= cx + 10; x += 6) limb(x, gy - 19, x, gy - 14, 1, 1); limb(cx - 15, gy - 19, cx + 11, gy - 19, 1, 1); paint(woodD, 0, {});
      // roda (raios giram com a distância)
      const wx = cx - 2, wy = gy - 7, R0 = 7;
      mClear(); ell(wx, wy, R0, R0); paint(rim, 1, {}); mClear(); ell(wx, wy, R0 - 1.6, R0 - 1.6); paint({ b: 0, s: 0, l: 0, d: 0 }, 0, {}); for (let i = 0; i < Wd * Ht; i++) if (MSK[i]) { COL[i] = 0; PID[i] = 0; }
      mClear(); for (let k = 0; k < 6; k++) { const a = wph * Math.PI / 12 + k * Math.PI / 3; limb(wx, wy, wx + Math.cos(a) * (R0 - 1.4), wy + Math.sin(a) * (R0 - 1.4), 1, 1); } paint(wood, 0, {});
      mClear(); ell(wx, wy, 1.6, 1.6); paint(iron, 1, {});
      outline(0.42); const b = toCanvas(0);
      begin(58, 32); mClear(); limb(cx + 10, gy - 11, cx + 31, gy - 14, 1, 1); paint(wood, 0, {}); outline(0.45);
      r = { b, f: toCanvas(0), w: 58, h: 32, ox: cx, oy: gy, seat: [cx + 4, gy - 15] };
    } else {
      const back = view === 'back'; begin(36, 40); const gy = 37, cx = 18;
      // rodas de perfil (finas) dos dois lados
      for (const sd of [-1, 1]) { mClear(); ell(cx + sd * 13, gy - 8, 1.6, 7.5); paint(rim, 2, {}); for (let k = 0; k < 3; k++) { const yy = gy - 8 + Math.round(Math.sin(wph * Math.PI / 6 + k * 2.094) * 5.5); dot(cx + sd * 13, yy, wood.b); } }
      // varais em direção ao animal
      mClear(); if (back) { limb(cx - 9, gy - 22, cx - 7, gy - 38, 1, 1); limb(cx + 9, gy - 22, cx + 7, gy - 38, 1, 1); } else { limb(cx - 9, gy - 10, cx - 7, gy + 2, 1, 1); limb(cx + 9, gy - 10, cx + 7, gy + 2, 1, 1); } paint(woodD, 0, {});
      // mesa vista de cima/trás
      mClear(); poly([[cx - 12, gy - 24], [cx + 12, gy - 24], [cx + 12, gy - 12], [cx - 12, gy - 12]]); paint(wood, 3, { fn: (x, y, c, t) => ((y - gy) % 3 === 0 ? t.s : c) });
      mClear(); poly([[cx - 12, gy - 12], [cx + 12, gy - 12], [cx + 12, gy - 8], [cx - 12, gy - 8]]); paint(woodD, 1, {});
      if (load) { mClear(); ell(cx - 4, gy - 19, 4.5, 3.5); ell(cx + 4, gy - 18, 4, 3.2); paint(sackT, 1, {}); }
      outline(0.42);
      r = { b: toCanvas(0), f: null, w: 36, h: 40, ox: cx, oy: gy - 14, seat: [cx, gy - 22] };
    }
    CACHE.set(key, r); return r;
  }
  function frames(a) { return GAIT[a] ? GAIT[a].n : FR[a] || 4; }
  function cycleLen(br, a, k) { const s = spec(br), g = GAIT[a]; if (!g) return 1; return (g.str * s.L * (k || 1)) / g.duty; } // distância percorrida por ciclo (px)
  const raw = { begin, mClear, ell, cap, poly, chain, limb, paint, dot, dotIf, outline, toCanvas, T, tn, C, mixU, mul, hsh, nz, get W() { return Wd; }, get H() { return Ht; } };
  return { get, spec, COATS, BR, frames, cycleLen, GAIT, tones: tn, C, hsh, cartSpr, raw, CACHE, P: { begin, mClear, ell, cap, poly, chain, paint, dot, dotIf, outline, toCanvas, tn, C, mixU, mul } };
})();
// ---------- raças e pelagens extras do jogo equestre ----------
Object.assign(RIG.COATS, {
  dourado: { n: 'Dourado metálico', b: '#d6a248', m: '#8a5a20', leg: '#7a5020', mz: '#5a3a20', shine: '#ffe6a0' },
  dourado2: { n: 'Isabel perlino', b: '#e6cf9a', m: '#f2e8cc', leg: null, mz: '#8a6a50', shine: '#fff4d0' }
});
Object.assign(RIG.BR, {
  andaluz: { t: 'equino', H: 26, L: 25, D: 12.4, neckL: 11.6, neckW: 4.2, arch: 2.6, headL: 10, prof: 0.5, mane: 2.6, maneL: 3.6, tailW: 2.4, tailL: 13, legT: 1.05, chest: 1.1, coats: ['tordilho', 'castanho'] },
  psi: { t: 'equino', H: 29, L: 27.5, D: 10.8, neckL: 13.4, neckW: 3.2, arch: 1.2, headL: 10.2, prof: -0.1, legT: 0.84, tailSet: 0.6, mane: 0.9, maneL: 1.3, coats: ['castanho', 'alazao'] },
  frisio: { t: 'equino', H: 28, L: 26.5, D: 13, neckL: 12.2, neckW: 4.4, arch: 2.8, headL: 10.6, prof: 0.2, mane: 3, maneL: 4.4, tailW: 3, tailL: 15, legT: 1.2, hoof: 1.45, chest: 1.15, coats: ['preto'] },
  mustang: { t: 'equino', H: 23.5, L: 24, D: 11.9, neckL: 10.6, neckW: 3.8, arch: 0.8, headL: 9.6, jowl: 3.4, prof: 0.2, legT: 1.1, mane: 2.2, maneL: 3, tailW: 2.4, tailL: 13.5, coats: ['baio', 'rosilho'] },
  akhal: { t: 'equino', H: 27.5, L: 26, D: 9.8, neckL: 14.2, neckW: 2.7, arch: 0.6, headL: 10, jowl: 2.6, prof: -0.3, legT: 0.8, mane: 0.6, maneL: 0.9, tailW: 1.1, tailL: 11, ear: 2.6, coats: ['dourado', 'preto'] }
});
window.RIG = RIG;
