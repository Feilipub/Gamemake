// Gera a arte do jogo equestre a partir do desenhista de cavalos (tools/horse-rig/rig.js) e da fonte Pixelify Sans:
//   game/Shared/Assets/atlas_N.png  — atlas 2048×2048 com todos os quadros dos cavalos e os glifos da fonte
//   game/Shared/Assets/atlas.json   — posição, âncora (ponto no chão) e assento (onde senta o cavaleiro) de cada quadro
// Uso: node tools/asset-pipeline/export_assets.js [pasta de saída]
// Precisa de: playwright (com o Chromium) e @fontsource/pixelify-sans (npm).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = path.resolve(process.argv[2] || path.join(__dirname, '../../game/Shared/Assets'));
const RIG_JS = path.join(__dirname, '../horse-rig/rig.js');

function fontFile() {
  try { return require.resolve('@fontsource/pixelify-sans/files/pixelify-sans-latin-400-normal.woff'); }
  catch (e) { return null; }
}

// raças do jogo -> chave no RIG e pelagens exportadas
const BREEDS = {
  arabe: ['tordilho', 'castanho'], qm: ['alazao', 'castanho'], mm: ['castanho', 'tordilho'], andaluz: ['tordilho', 'castanho'],
  psi: ['castanho', 'alazao'], frisio: ['preto'], appaloosa: ['appaLeo', 'appaManta'], mustang: ['baio', 'rosilho'],
  paint: ['pampaAlazao', 'pampaPreto'], lusitano: ['castanho', 'tordilho'], crioulo: ['baio', 'preto'], akhal: ['dourado', 'preto']
};
const SIDE = ['idle', 'walk', 'trot', 'gallop', 'eat', 'drink', 'doze', 'lie', 'scared', 'rear', 'neigh'];
const FB = ['idle', 'walk', 'trot', 'gallop', 'eat', 'scared'];
const SIDE_S = ['idle', 'walk', 'trot', 'gallop', 'scared', 'rear'];
const FB_S = ['idle', 'walk', 'trot', 'gallop'];
const GLYPHS = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~ÁÀÂÃÉÊÍÓÔÕÚÜÇáàâãéêíóôõúüç°ºª·—–…“”‘’•';
const FONT_SIZES = [16, 24];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const ff = fontFile(); const fontB64 = ff ? fs.readFileSync(ff).toString('base64') : null;
  if (!ff) console.warn('Aviso: @fontsource/pixelify-sans não encontrado; a fonte usará monospace.');
  const browser = await chromium.launch(); const page = await browser.newPage();
  page.on('pageerror', e => console.error('Erro na página:', e.message));
  await page.setContent('<html><body></body></html>');
  await page.addScriptTag({ path: RIG_JS });
  const res = await page.evaluate(async ({ BREEDS, SIDE, FB, SIDE_S, FB_S, GLYPHS, FONT_SIZES, fontB64 }) => {
    const items = []; // {key, cv, ox, oy, sx, sy}
    const saddle = { id: 'basica', c: '#7a4422' };
    function add(key, cv, ox, oy, seat) {
      if (!cv) return; const g = cv.getContext('2d'); const d = g.getImageData(0, 0, cv.width, cv.height).data;
      let x0 = cv.width, y0 = cv.height, x1 = -1, y1 = -1;
      for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) if (d[(y * cv.width + x) * 4 + 3]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (x1 < 0) return;
      items.push({ key, cv, cx: x0, cy: y0, w: x1 - x0 + 1, h: y1 - y0 + 1, ox: ox - x0, oy: oy - y0, sx: seat ? seat[0] - x0 : 0, sy: seat ? seat[1] - y0 : 0 });
    }
    const meta = { breeds: {}, frames: {}, cyc: {} };
    for (const [br, coats] of Object.entries(BREEDS)) {
      meta.breeds[br] = coats; meta.cyc[br] = {};
      for (const a of ['walk', 'trot', 'gallop']) meta.cyc[br][a] = RIG.cycleLen(br, a, 1);
      for (const coat of coats) {
        const job = (view, anims, sad) => {
          for (const a of anims) {
            const n = RIG.frames(a); meta.frames[a] = n;
            for (let f = 0; f < n; f++) {
              const o = { adult: 1, seed: 3 }; if (sad) o.saddle = saddle;
              const r = RIG.get(br, coat, view, a, f, o); const base = `h:${br}|${coat}|${view}|${a}|${f}|${sad ? 1 : 0}`;
              add(base + ':b', r.b, r.ox, r.oy, r.seat); add(base + ':f', r.f, r.ox, r.oy, r.seat);
            }
          }
        };
        job('side', SIDE, false); job('front', FB, false); job('back', FB, false);
        job('side', SIDE_S, true); job('front', FB_S, true); job('back', FB_S, true);
      }
    }
    // fonte: glifos brancos, nítidos (alfa com limiar), para pintar com qualquer cor no jogo
    let family = 'monospace';
    if (fontB64) { const face = new FontFace('Pixelify', `url(data:font/woff;base64,${fontB64})`); await face.load(); document.fonts.add(face); family = 'Pixelify'; }
    const font = {};
    for (const size of FONT_SIZES) {
      const H = Math.ceil(size * 1.3); font[size] = { h: H, g: {} };
      for (const ch of GLYPHS) {
        const cv = document.createElement('canvas'); const g = cv.getContext('2d'); g.font = `${size}px ${family}`;
        const adv = Math.round(g.measureText(ch).width); cv.width = Math.max(1, adv + 2); cv.height = H;
        g.font = `${size}px ${family}`; g.textBaseline = 'alphabetic'; g.fillStyle = '#fff'; g.fillText(ch, 0, Math.round(size * 1.0));
        const id = g.getImageData(0, 0, cv.width, cv.height); for (let i = 3; i < id.data.length; i += 4) { const on = id.data[i] >= 110; id.data[i] = on ? 255 : 0; id.data[i - 1] = id.data[i - 2] = id.data[i - 3] = on ? 255 : 0; } g.putImageData(id, 0, 0);
        font[size].g[ch.codePointAt(0)] = adv;
        // o glifo fica com a caixa inteira (altura fixa) para alinhar a linha de base
        items.push({ key: `t${size}:${ch.codePointAt(0)}`, cv, cx: 0, cy: 0, w: cv.width, h: H, ox: 0, oy: 0, sx: 0, sy: 0 });
      }
    }
    // empacota em prateleiras
    const S = 2048, atlases = []; items.sort((a, b) => b.h - a.h || b.w - a.w);
    let cur = null, x = 0, y = 0, rowH = 0; const map = {};
    const newAtlas = () => { cur = document.createElement('canvas'); cur.width = S; cur.height = S; atlases.push(cur); x = 0; y = 0; rowH = 0; };
    newAtlas();
    for (const it of items) {
      if (x + it.w + 1 > S) { x = 0; y += rowH + 1; rowH = 0; }
      if (y + it.h + 1 > S) newAtlas();
      cur.getContext('2d').drawImage(it.cv, it.cx, it.cy, it.w, it.h, x, y, it.w, it.h);
      map[it.key] = [atlases.length - 1, x, y, it.w, it.h, it.ox, it.oy, Math.round(it.sx * 10) / 10, Math.round(it.sy * 10) / 10];
      x += it.w + 1; rowH = Math.max(rowH, it.h);
    }
    return { atlases: atlases.map(c => c.toDataURL('image/png')), map, meta, font, count: items.length };
  }, { BREEDS, SIDE, FB, SIDE_S, FB_S, GLYPHS, FONT_SIZES, fontB64 });
  res.atlases.forEach((u, i) => fs.writeFileSync(path.join(OUT, `atlas_${i}.png`), Buffer.from(u.split(',')[1], 'base64')));
  fs.writeFileSync(path.join(OUT, 'atlas.json'), JSON.stringify({ atlases: res.atlases.length, s: res.map, horses: res.meta, font: res.font }));
  console.log(`OK: ${res.count} quadros em ${res.atlases.length} atlas -> ${OUT}`);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
