// Arte da Região das Serras (pixel art por código). Fonte da verdade; embutida em web/index.html como
// `const RART = ...` por tools/asset-pipeline/embed_flora.py (marcadores RART:begin/RART:end).
// Usa mkC, shade, outline, txt e H2 do jogo. Cada função devolve um canvas.
//   mansao(night)          mansão de dois andares da Fazenda Monte Real (224 x 168)
//   piscina()              piscina com deck, espreguiçadeiras e guarda-sol (112 x 64)
//   chafariz()             chafariz de pedra (48 x 48)
//   galpaoModerno(night)   galpão metálico com portões de correr (144 x 96)
//   estabuloLuxo(night)    estábulo de alvenaria e madeira com cúpula e cata-vento (176 x 104)
//   garagem()              garagem aberta com caminhonete (112 x 72)
//   guarita(night)         guarita com cancela (48 x 56)
//   portal(nome, cor)      portal de entrada de fazenda com o nome (96 x 64)
//   sebe(v)                cerca viva podada (32 x 22)
//   canteiro(v)            canteiro de flores (32 x 16)
(() => {
  const mk = (w, h) => { const [c, g] = mkC(w, h); const p = (x, y, ww, hh, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), ww, hh); }; return [c, g, p]; };
  const roofTiles = (p, x0, y0, w, h, base, light, dark) => { p(x0, y0, w, h, base); for (let y = y0 + 2; y < y0 + h; y += 4) { p(x0, y, w, 1, dark); for (let x = x0 + ((y >> 2) % 2 ? 0 : 3); x < x0 + w; x += 6) { p(x, y - 2, 3, 2, light); p(x + 3, y - 1, 1, 2, dark); } } };
  const window2 = (p, x, y, w, h, night, frame) => { p(x - 2, y - 2, w + 4, h + 4, frame); p(x, y, w, h, night ? '#ffd27a' : '#34465a'); if (!night) { p(x + 1, y + 1, Math.max(1, w / 3 | 0), h - 2, '#5a7896'); p(x, y + (h >> 1), w, 1, frame); } p(x + (w >> 1), y, 1, h, frame); p(x - 3, y + h + 2, w + 6, 2, shade(frame, -.15)); };
  function mansao(night) {
    const W = 224, H = 168, [c, g, p] = mk(W, H), wall = '#f4efe4', wallS = '#ddd5c4', trim = '#7a5a3a', roof = '#a94a2c', roofL = '#cf6a40', roofD = '#7a2e18';
    const GY = 150; // chão
    p(6, GY + 6, W - 12, 8, 'rgba(30,20,10,0.25)');
    // telhado de quatro águas (fundo) e corpo do 2º andar
    for (let y = 0; y < 30; y++) { const x0 = 30 - y, w = W - 60 + y * 2; p(x0, 14 + y, w, 1, y % 4 === 2 ? roofD : roof); if (y % 4 === 0) for (let x = x0 + (y % 8 ? 0 : 3); x < x0 + w; x += 6) p(x, 14 + y, 3, 1, roofL); }
    p(30, 12, W - 60, 3, roofD); p(28, 43, W - 56, 3, roofD);
    p(24, 46, W - 48, 46, wall); for (let y = 48; y < 92; y += 6) p(24, y, W - 48, 1, wallS);
    p(24, 46, W - 48, 3, '#c8bfae'); for (let k = 0; k < 6; k++) window2(p, 38 + k * 28, 56, 12, 20, night, trim);
    // sacada central com balaústres
    p(84, 86, 56, 4, '#e8e0d0'); for (let x = 86; x < 138; x += 4) p(x, 78, 2, 8, '#e8e0d0'); p(84, 76, 56, 2, '#e8e0d0');
    // 1º andar com varanda de colunas
    p(10, 92, W - 20, 6, '#c8bfae'); p(16, 98, W - 32, GY - 98, wall); for (let y = 100; y < GY; y += 6) p(16, y, W - 32, 1, wallS);
    for (let k = 0; k < 7; k++) { const x = 26 + k * 28; if (k === 3) continue; window2(p, x, 108, 14, 24, night, trim); }
    // portal central: frontão, colunas e porta dupla de madeira
    for (let y = 0; y < 14; y++) p(92 - y * 0.5 + 0.5, 92 - y, 40 + y, 1, y % 3 ? wall : wallS); p(88, 92, 48, 3, '#c8bfae');
    p(100, 112, 24, GY - 112, '#6a3e22'); p(100, 112, 24, 2, '#8a5a32'); p(111, 112, 2, GY - 112, '#4a2a16'); p(104, 128, 2, 3, '#e8c860'); p(118, 128, 2, 3, '#e8c860'); p(98, 108, 28, 4, trim);
    for (const x of [12, 44, 86, 132, 174, 206]) { p(x, 96, 6, GY - 96, '#fbf8f0'); p(x, 96, 2, GY - 96, '#ffffff'); p(x + 5, 96, 1, GY - 96, '#d8d0c0'); p(x - 1, 94, 8, 3, '#e8e0d0'); p(x - 1, GY - 3, 8, 3, '#d8d0c0'); }
    // degraus, vasos e lampiões
    p(84, GY, 56, 3, '#d8d0c0'); p(80, GY + 3, 64, 3, '#c8c0b0'); p(76, GY + 6, 72, 3, '#b8b0a0');
    for (const x of [70, 148]) { p(x, GY - 8, 8, 8, '#a8603a'); p(x + 1, GY - 16, 6, 8, '#3a7a3a'); p(x, GY - 14, 3, 3, '#4a9a4a'); }
    for (const x of [92, 128]) { p(x, 112, 3, 6, '#2a2a2a'); p(x - 1, 110, 5, 3, night ? '#ffe08a' : '#c8b070'); }
    if (night) { g.fillStyle = 'rgba(255,214,120,0.16)'; g.fillRect(84, 100, 56, 50); }
    // chaminé e brasão
    p(170, 2, 12, 20, '#e8e0d0'); p(168, 0, 16, 3, '#a94a2c'); p(104, 96, 16, 10, '#b8963a'); p(106, 98, 12, 6, '#7a2e18'); p(110, 99, 4, 4, '#e8c860');
    outline(g, W, H); return c;
  }
  function piscina() {
    const W = 112, H = 64, [c, g, p] = mk(W, H);
    p(0, 4, W, H - 6, '#e8dcc0'); for (let x = 0; x < W; x += 8) p(x, 4, 1, H - 6, '#d4c8aa'); for (let y = 4; y < H - 2; y += 8) p(0, y, W, 1, '#d4c8aa');
    p(10, 12, W - 20, H - 26, '#f2f2f2'); p(12, 14, W - 24, H - 30, '#2aa8c8');
    for (let k = 0; k < 18; k++) p(14 + (k * 37) % (W - 30), 16 + (k * 13) % (H - 34), 6, 1, '#7ad8ec');
    p(12, 14, W - 24, 3, '#1a7a9a'); p(W - 22, 20, 2, 10, '#c8c8d0'); p(W - 18, 20, 2, 10, '#c8c8d0'); for (let y = 22; y < 30; y += 3) p(W - 22, y, 6, 1, '#c8c8d0');
    for (const x of [16, 40]) { p(x, H - 10, 18, 6, '#f4f0e8'); p(x, H - 10, 18, 1, '#ffffff'); p(x + 16, H - 14, 2, 6, '#f4f0e8'); p(x, H - 4, 2, 3, '#a8a8a8'); p(x + 16, H - 4, 2, 3, '#a8a8a8'); }
    p(76, H - 18, 1, 14, '#5a4a3a'); for (let y = 0; y < 6; y++) p(68 - y, H - 24 + y, 18 + y * 2, 1, y % 2 ? '#e05a3a' : '#f4e8d8');
    outline(g, W, H); return c;
  }
  function chafariz() { const [c, g, p] = mk(48, 48); p(4, 38, 40, 8, '#b8b0a0'); p(6, 34, 36, 6, '#c8c0b0'); p(8, 35, 32, 4, '#2aa8c8'); p(21, 16, 6, 20, '#c8c0b0'); p(15, 14, 18, 4, '#b8b0a0'); p(17, 15, 14, 2, '#2aa8c8'); p(23, 6, 2, 9, '#7ad8ec'); for (let k = 0; k < 6; k++) p(16 + k * 3, 18 + (k % 2) * 3, 1, 14 - (k % 3) * 3, '#9ae4f4'); outline(g, 48, 48); return c; }
  function galpaoModerno(night) {
    const W = 144, H = 96, [c, g, p] = mk(W, H), m = '#8a9aa8';
    for (let y = 0; y < 22; y++) p(4 + y * 0.6, 8 + y, W - 8 - y * 1.2, 1, y % 2 ? '#9aaab8' : '#b0bec8'); p(2, 6, W - 4, 3, '#6a7a88');
    p(10, 30, W - 20, H - 36, m); for (let x = 10; x < W - 10; x += 4) p(x, 30, 1, H - 36, '#7a8a98'); p(10, 30, W - 20, 2, '#c8d4dc');
    for (const x0 of [22, 82]) { p(x0, 48, 40, H - 54, '#4a5a68'); for (let y = 50; y < H - 6; y += 6) p(x0, y, 40, 1, '#3a4a58'); p(x0 + 19, 48, 2, H - 54, '#2a3a48'); p(x0 - 2, 46, 44, 3, '#2a3a48'); }
    p(54, 34, 36, 9, '#f4f0e8'); txt(p, 'MONTE REAL', 55, 36, '#2a5a8a');
    if (night) { p(70, 26, 4, 4, '#ffe08a'); g.fillStyle = 'rgba(255,214,120,0.15)'; g.fillRect(56, 30, 32, 40); }
    p(6, H - 6, W - 12, 6, '#a8a8a8'); outline(g, W, H); return c;
  }
  function estabuloLuxo(night) {
    const W = 176, H = 104, [c, g, p] = mk(W, H), brick = '#b0603a', wood = '#6a4426';
    roofTiles(p, 6, 22, W - 12, 26, '#3a4a5a', '#5a6a7a', '#2a3440'); p(4, 46, W - 8, 3, '#2a3440');
    p(76, 4, 24, 20, '#f4efe4'); p(74, 2, 28, 4, '#3a4a5a'); p(82, 8, 12, 10, '#2a3a48'); p(87, 0, 2, 4, '#3a3a3a'); p(83, -1, 10, 1, '#3a3a3a');
    p(12, 49, W - 24, H - 55, brick); for (let y = 51; y < H - 6; y += 4) { p(12, y, W - 24, 1, '#d8c0a0'); for (let x = 12 + (y % 8 ? 0 : 6); x < W - 12; x += 12) p(x, y + 1, 1, 3, '#d8c0a0'); }
    for (let k = 0; k < 6; k++) { const x = 20 + k * 24; p(x, 62, 18, H - 68, wood); p(x, 62, 18, 2, '#8a5a32'); for (let y = 66; y < H - 8; y += 5) p(x + 1, y, 16, 1, '#4a2e18'); p(x + 1, 62, 16, 12, '#2a1a10'); p(x + 3, 58, 12, 4, '#f4efe4'); p(x + 5, 56, 8, 2, '#f4efe4'); if (night) p(x + 2, 63, 14, 10, '#ffd27a'); for (let i = 0; i < 4; i++) p(x + i * 5, 66 + i * 6, 1, 1, '#8a5a32'); }
    p(8, H - 6, W - 16, 6, '#9a9690'); outline(g, W, H); return c;
  }
  function garagem() {
    const W = 112, H = 72, [c, g, p] = mk(W, H);
    roofTiles(p, 2, 4, W - 4, 16, '#8a8e92', '#a8acb0', '#6a6e72'); p(6, 20, W - 12, H - 26, '#e8e2d4'); p(14, 26, W - 28, H - 32, '#3a3a3a');
    // caminhonete prata
    p(22, 44, 66, 16, '#c8ccd0'); p(22, 44, 66, 2, '#e8ecf0'); p(50, 34, 30, 12, '#c8ccd0'); p(54, 36, 22, 7, '#5a7896'); p(22, 52, 66, 2, '#8a8e92'); for (const x of [30, 74]) { p(x, 56, 10, 10, '#1a1a1e'); p(x + 3, 59, 4, 4, '#9a9aa2'); } p(86, 48, 3, 3, '#ffe08a'); p(22, 48, 2, 3, '#e04a3a');
    p(4, H - 6, W - 8, 6, '#a8a8a8'); outline(g, W, H); return c;
  }
  function guarita(night) { const [c, g, p] = mk(48, 56); roofTiles(p, 4, 6, 26, 8, '#a94a2c', '#cf6a40', '#7a2e18'); p(6, 14, 22, 36, '#f4efe4'); p(10, 20, 14, 10, night ? '#ffd27a' : '#34465a'); p(10, 34, 8, 16, '#6a3e22'); p(30, 34, 2, 16, '#3a3a3a'); p(30, 32, 18, 3, '#e04a3a'); for (let x = 32; x < 48; x += 6) p(x, 32, 3, 3, '#f4f0e8'); outline(g, 48, 56); return c; }
  function portal(nome, cor) {
    const W = 96, H = 64, [c, g, p] = mk(W, H), wood = '#5a3a20';
    for (const x of [6, 84]) { p(x, 14, 7, H - 14, wood); p(x, 14, 2, H - 14, '#7a5230'); p(x - 2, 10, 11, 6, '#4a2e18'); }
    p(4, 16, W - 8, 12, cor || '#7a5230'); p(4, 16, W - 8, 2, shade(cor || '#7a5230', .3)); p(4, 26, W - 8, 2, shade(cor || '#7a5230', -.35));
    const L = nome.length * 4; txt(p, nome, Math.round(W / 2 - L / 2), 19, '#f8f0d8');
    p(30, 2, 36, 12, cor || '#7a5230'); p(42, 4, 12, 8, '#e8c860'); p(46, 6, 4, 4, cor || '#7a5230');
    outline(g, W, H); return c;
  }
  function sebe(v) { const [c, g, p] = mk(32, 22); p(1, 6, 30, 14, '#2e6a2a'); p(1, 6, 30, 3, '#4a8a3a'); for (let k = 0; k < 14; k++) p(2 + (k * 7 + v * 3) % 28, 7 + (k * 5) % 12, 2, 1, k % 2 ? '#5a9a44' : '#24561f'); p(1, 19, 30, 2, 'rgba(20,30,10,0.4)'); outline(g, 32, 22); return c; }
  function canteiro(v) { const [c, g, p] = mk(32, 16); p(1, 8, 30, 7, '#6a4a2c'); p(1, 8, 30, 1, '#8a6a44'); const cols = ['#e04a6a', '#f0d040', '#f4f0e8', '#b060c0']; for (let k = 0; k < 10; k++) { const x = 3 + k * 3; p(x, 4 + (k % 2), 1, 5, '#3a7a3a'); p(x - 1, 2 + (k % 2), 3, 3, cols[(k + v) % 4]); } outline(g, 32, 16); return c; }
  return { mansao, piscina, chafariz, galpaoModerno, estabuloLuxo, garagem, guarita, portal, sebe, canteiro };
})()
