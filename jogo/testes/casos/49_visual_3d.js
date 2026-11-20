// v20: visual 3D (fase 1) — mundo e bonecos em polígonos, câmera que gira, toque no chão, telas especiais no 2D, foto e opção nas Configurações
module.exports = { nome: 'Visual 3D: mundo, câmera, toque, telas especiais e foto', tempo: 300, async rodar(t) {
  await t.abrir({ ajustes: { view: '3d', cenas: false } }); await t.jogoNovo(); await t.ev('toast = () => {}; 0'); await t.espera(2500);
  const st = JSON.parse(await t.ev('JSON.stringify({ vis: R3.vis, st: R3.stats, hd: HD.on, c: C.style.opacity })'));
  t.ok(st.vis && st.st.tris > 20000 && st.st.pedacos > 9 && !st.hd && st.c === '0', 'o 3D desenha o mundo no lugar do 2D ' + JSON.stringify(st));
  t.ok(await t.ev("(() => { cfgHTML; showOptions(); const ok = /data-v=.view\\|3d./.test($('mn').innerHTML); closeModal(); return ok; })()"), 'Configurações › Visual tem a opção 3D');
  // o toque no chão aponta para o lugar certo e a seta sabe projetar o 3D
  t.ok(await t.ev("(() => { const [sx, sy] = w2s(P.x + 40, P.y); const p = s2w(sx, sy); return isFinite(sx) && Math.hypot(p[0] - (P.x + 40), p[1] - P.y) < 3; })()"), 'tela ↔ mundo: tocar no chão acha o ponto certo');
  // câmera gira e o direcional acompanha (para cima = para longe da câmera)
  const gi = JSON.parse(await t.ev("(async () => { r3Gira(1); await new Promise(r => setTimeout(r, 1500)); const x0 = P.x, y0 = P.y; input.y = -1; for (let i = 0; i < 20; i++) tick(1 / 30); input.y = 0; return JSON.stringify({ yaw: R3.yaw, dx: P.x - x0, dy: P.y - y0 }); })()"));
  t.ok(Math.abs(gi.yaw - Math.PI / 2) < 0.1 && gi.dx < -5 && Math.abs(gi.dy) < Math.abs(gi.dx) * 0.5, 'girando a câmera 90°, "para cima" anda para o lado certo ' + JSON.stringify(gi));
  await t.ev('R3.yawT = 0; 0');
  // telas especiais continuam no desenho 2D e o 3D volta depois
  t.ok(await t.ev("(async () => { P.mnt = null; enterRoom(Object.keys(IROOM)[0], true); await new Promise(r => setTimeout(r, 1800)); const no2d = IN.on && !R3.vis && C.style.opacity === '1'; inExitNow(); await new Promise(r => setTimeout(r, 900)); return no2d && !IN.on && R3.vis; })()"), 'dentro das casas usa o 2D e o 3D volta ao sair');
  // foto no 3D
  await t.ev("A.fotoAbrir(); FOTO.want = 'tirar'; 0"); await t.ate('!!FOTO.last', 6000);
  t.ok(await t.ev("(async () => { const im = new Image(); im.src = FOTO.last; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0); const d = g.getImageData(0, 0, c.width, c.height * 0.8).data; let mn = 255, mx = 0; for (let i = 0; i < d.length; i += 4 * 101) { mn = Math.min(mn, d[i + 1]); mx = Math.max(mx, d[i + 1]); } fotoSair(); return mx - mn > 50; })()"), 'o modo foto fotografa o 3D');
  // mapa muda → o 3D refaz o pedaço (porteira aberta/fechada aparece na hora)
  t.ok(await t.ev("(() => { const v0 = R3.ver; applyObjs(); return R3.ver > v0; })()"), 'mudança no mapa refaz o 3D');
  t.semErros();
} };
