// Exporta a arte procedural e o mapa do protótipo HTML (v3.2) para o projeto Godot.
//
// O protótipo desenha toda a pixel art por código. Em vez de redesenhar à mão,
// rodamos os próprios geradores no Chromium (Playwright) e salvamos PNGs + JSON:
//   assets/art/world/ground_s0.png, ground_s1.png   chão das duas estações (águas/seca)
//   assets/art/world/obj/*.png                       cercas, porteiras, props e prédios
//   assets/art/chars/*.png                           tiras de animação (frames lado a lado)
//   assets/data/world_map.json                           grade de colisão, objetos e pontos
//   assets/data/art_sprites.json                         metadados de cada tira (tamanho, frames, âncora)
//
// Uso:  node tools/asset-pipeline/export_from_html.js prototypes/html-v3.2/index.html .
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const html = path.resolve(process.argv[2] || 'prototypes/html-v3.2/index.html');
const root = path.resolve(process.argv[3] || '.');
const P = (...p) => path.join(root, ...p);
for (const d of ['assets/art/world/obj', 'assets/art/chars', 'assets/data']) fs.mkdirSync(P(d), { recursive: true });
const savePng = (rel, dataUrl) => fs.writeFileSync(P(rel), Buffer.from(dataUrl.split(',')[1], 'base64'));

// Código executado DENTRO do jogo (acesso às funções internas via __lida.ev).
const HELPERS = `window.__exp = {
  url(c) { return c.toDataURL('image/png'); },
  strip(cs) { const fw = Math.max(...cs.map(c => c.width)), fh = Math.max(...cs.map(c => c.height)); const [c, g] = mkC(fw * cs.length, fh); cs.forEach((k, i) => g.drawImage(k, i * fw, 0)); return { url: c.toDataURL('image/png'), fw, fh, n: cs.length }; },
  ground(se) { buildGround(se); const [c, g] = mkC(WPX, HPX); g.drawImage(groundC, 0, 0);
    for (let cy = 0; cy * GCS < MH; cy++) for (let cx = 0; cx * GCS < MW; cx++) { const ch = grassChunk(cx, cy, se); if (ch && ch.any) g.drawImage(ch.l[0], cx * GCS * TS, cy * GCS * TS - 4); }
    return c.toDataURL('image/png'); },
  world() {
    const solid = []; for (let ty = 0; ty < MH; ty++) for (let tx = 0; tx < MW; tx++) solid.push(solidT(tx, ty) ? 1 : 0);
    const water = []; for (let ty = 0; ty < MH; ty++) for (let tx = 0; tx < MW; tx++) water.push(ground[gi(tx, ty)] === G.WATER ? 1 : 0);
    const tex = {}, inst = []; const reg = (key, mk) => { if (!tex[key]) tex[key] = this.url(mk()); return key; };
    for (let ty = 0; ty < MH; ty++) for (let tx = 0; tx < MW; tx++) { const i = gi(tx, ty); if (obj[i] !== 1) continue;
      const isF = (x, y) => x >= 0 && y >= 0 && x < MW && y < MH && (obj[gi(x, y)] === 1 || obj[gi(x, y)] === 2);
      const st = fenceStyleAt(tx, ty), h = H2(tx, ty, 21), cond = h < .07 ? 1 : h < .2 ? 2 : 0; const l = isF(tx - 1, ty) ? 1 : 0, r = isF(tx + 1, ty) ? 1 : 0, u = isF(tx, ty - 1) ? 1 : 0, dn = isF(tx, ty + 1) ? 1 : 0, straight = (l && r && !u && !dn) || (u && dn && !l && !r), pst = !straight || (tx + ty) % 2 === 0;
      const key = 'fence_' + st + '_' + l + r + u + dn + '_' + cond + (pst ? 'p' : '');
      inst.push({ t: reg(key, () => fenceSpr(st, l, r, u, dn, cond, pst)), x: tx * TS, y: ty * TS - 12, s: ty * TS + 15, k: 'fence' }); }
    for (const p of PROPS) { const key = 'prop_' + p.t + '_' + p.v; inst.push({ t: reg(key, () => propSpr(p.t, p.v, 0)), x: p.x - 32, y: p.y - 70, s: p.y, k: TREES.has(p.t) ? 'tree' : 'prop', px: p.x, py: p.y }); }
    for (const b of BLD) { const x0 = b.r[0] * TS, y1 = (b.r[3] + 1) * TS; const mk = n => () => (b.id === 'casa' && S.house === 0 && typeof ranchoSpr === 'function' ? ranchoSpr(b, n) : bldSpr(b, n));
      const key = 'bld_' + b.id; reg(key, mk(false)); reg(key + '_n', mk(true)); inst.push({ t: key, x: x0 - 4, y: b.r[1] * TS - b.top, s: y1 - 2, k: 'bld', id: b.id, w: (b.r[2] - b.r[0] + 1) * TS }); }
    // porteiras: desenhadas fechadas, capturadas do canvas principal
    GATES.forEach((g, gi2) => { const xs = g.t.map(q => q[0]), ys = g.t.map(q => q[1]); const x0 = Math.min(...xs) * TS - 16, y0 = Math.min(...ys) * TS - 32, w = (Math.max(...xs) - Math.min(...xs) + 1) * TS + 32, hh = (Math.max(...ys) - Math.min(...ys) + 1) * TS + 48;
      const was = S.gates[gi2]; S.gates[gi2] = 0; X.setTransform(1, 0, 0, 1, -x0, -y0); X.clearRect(x0, y0, w, hh); drawGate(g, X); X.setTransform(1, 0, 0, 1, 0, 0); const d = X.getImageData(0, 0, w, hh); S.gates[gi2] = was;
      const [c, gg] = mkC(w, hh); gg.putImageData(d, 0, 0); const key = 'gate_' + gi2; tex[key] = this.url(c);
      inst.push({ t: key, x: x0, y: y0, s: g.h ? Math.max(...ys) * TS + 14 : (Math.max(...ys) + 1) * TS - 1, k: 'gate' }); });
    return { TS, MW, MH, solid, water, tex, inst, areas: AREAS, spawn: (() => { const q = newState().p; return { x: q.x, y: q.y }; })(), herd: S.animals.filter(a => a.own === 'player' && a.sp === 'boi').map(a => ({ x: a.x, y: a.y, sex: a.sex, n: a.n })) };
  },
  char(ap, pose, dir, n) { const cs = []; for (let f = 0; f < n; f++) cs.push(charSpr(ap, dir, f, pose)); return this.strip(cs); },
  rig(a, view, an) { const n = RIG.frames(an), rs = []; for (let f = 0; f < n; f++) rs.push(rigFrame(a, view, an, f));
    // o rig tem duas camadas: b (fundo) e f (frente, onde fica o corpo nas vistas de frente/costas)
    const flat = r => { const [c, g] = mkC(r.w || r.b.width, r.b.height); g.drawImage(r.b, 0, 0); if (r.f) g.drawImage(r.f, 0, 0); return c; };
    const s = this.strip(rs.map(flat)); s.ox = rs[0].ox; s.oy = rs[0].oy; return s; },
  mounted(h, ap, dir, an) { const n = an === 'idle' ? 4 : RIG.frames(an), cs = [], FW = 128, FH = 128, AX = 64, AY = 104;
    for (let f = 0; f < n; f++) { X.setTransform(1, 0, 0, 1, 0, 0); X.clearRect(0, 0, FW, FH); drawMounted(h, ap, AX, AY, dir, an, f); const d = X.getImageData(0, 0, FW, FH); const [c, g] = mkC(FW, FH); g.putImageData(d, 0, 0); cs.push(c); }
    const s = this.strip(cs); s.ox = AX; s.oy = AY; return s; }
};`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 480, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + html + '#debug-nointro');
  await p.waitForFunction(() => window.__lida, null, { timeout: 30000 });
  const ev = s => p.evaluate(s => window.__lida.ev(s), s);
  // o título da v3.2 não tem mundo: inicia uma partida nova para gerar mapa, rebanho e estado
  await ev('newGame(defaultCF()); true');
  await p.waitForFunction(() => window.__lida.S && window.__lida.S.animals && window.__lida.S.animals.length > 0, null, { timeout: 30000 });
  await p.waitForTimeout(1500);
  await ev(HELPERS);
  // congela o laço do jogo para o canvas principal servir de área de captura
  await ev('window.requestAnimationFrame = () => 0; true');
  await p.waitForTimeout(200);

  const meta = {};
  const putStrip = (name, s, extra) => { savePng('assets/art/chars/' + name + '.png', s.url); meta[name] = Object.assign({ file: 'res://assets/art/chars/' + name + '.png', fw: s.fw, fh: s.fh, n: s.n, ox: s.ox ?? 12, oy: s.oy ?? 30 }, extra || {}); };

  // chão
  for (const se of [0, 1]) savePng(`assets/art/world/ground_s${se}.png`, await ev(`__exp.ground(${se})`));
  // mundo
  const W = await ev('__exp.world()');
  for (const [k, u] of Object.entries(W.tex)) savePng('assets/art/world/obj/' + k + '.png', u);
  const world = { schema_version: 1, tile_size: W.TS, map_width: W.MW, map_height: W.MH, solid: W.solid, water: W.water, spawn: W.spawn, herd: W.herd, areas: W.areas,
    objects: W.inst.map(o => Object.assign({}, o, { t: 'res://assets/art/world/obj/' + o.t + '.png' })) };
  fs.writeFileSync(P('assets/data/world_map.json'), JSON.stringify(world));

  // vaqueiro padrão (dir: 0 frente, 1 costas, 3 lado direito; esquerda = espelho)
  const AP = 'defaultCF().ap';
  for (const [pose, n] of [['idle', 4], ['walk', 8], ['run', 8]]) for (const d of [0, 1, 3]) putStrip(`player_${pose}_${d}`, await ev(`__exp.char(${AP}, '${pose}', ${d}, ${n})`), { ox: 12, oy: 30 });

  // montaria principal: Mangalarga Marchador castanho, sela nordestina
  const H = `({ id: 7, sp: 'cavalo', br: 'mm', coat: 'castanho', sex: 'M', age: 60, saddle: 'nord', travel: false })`;
  for (const an of ['idle', 'walk', 'trot', 'gallop']) for (const d of [0, 1, 3]) putStrip(`mounted_${an}_${d}`, await ev(`__exp.mounted(${H}, ${AP}, ${d}, '${an}')`));
  for (const an of ['idle', 'walk', 'trot', 'gallop', 'eat']) for (const v of ['side', 'front', 'back']) putStrip(`horse_${an}_${v}`, await ev(`__exp.rig(${H}, '${v}', '${an}')`));

  // gado Pé-Duro (vaca e touro)
  for (const [sex, id] of [['F', 11], ['M', 12]]) { const A = `({ id: ${id}, sp: 'boi', br: 'peduro', sex: '${sex}', age: 40 })`;
    for (const an of ['idle', 'walk', 'trot', 'gallop', 'eat', 'lie']) for (const v of ['side', 'front', 'back']) putStrip(`peduro${sex}_${an}_${v}`, await ev(`__exp.rig(${A}, '${v}', '${an}')`)); }

  fs.writeFileSync(P('assets/data/art_sprites.json'), JSON.stringify(meta, null, 1));
  console.log('objetos:', world.objects.length, 'texturas:', Object.keys(W.tex).length, 'tiras:', Object.keys(meta).length);
  if (errs.length) console.log('ERROS:', errs.slice(0, 5).join('\n'));
  await b.close();
})();
