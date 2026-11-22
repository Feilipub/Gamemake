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
  t.ok(await t.ev("(async () => { P.mnt = null; enterRoom(Object.keys(IROOM)[0], true); await new Promise(r => setTimeout(r, 1800)); const dentro3d = IN.on && R3.vis && R3.dentro && R3.stats.dentro === IN.id && R3.stats.tris > 200; inExitNow(); await new Promise(r => setTimeout(r, 900)); return dentro3d && !IN.on && R3.vis && !R3.dentro; })()"), 'dentro das casas também é 3D, e o mundo volta ao sair');
  t.ok(await t.ev("(async () => { P.mnt = null; closeModal(); enterRoom('casa', true); for (let i = 0; i < 40 && (!IN.on || IN.seq || !R3.dentro); i++) await new Promise(r => setTimeout(r, 150)); closeModal(); const x0 = IN.x, y0 = IN.y, tx = IN.x - 40, ty = IN.y - 16; const [sx, sy] = w2s(tx, ty); inTap(sx, sy); for (let i = 0; i < 90; i++) tick(1 / 30); const d0 = Math.hypot(tx - x0, ty - y0), d1 = Math.hypot(tx - IN.x, ty - IN.y), info = JSON.stringify({ x0, y0, x: IN.x, y: IN.y, seq: !!IN.seq, seat: !!IN.seat, lie: !!IN.lie, path: IN.path && IN.path.length, d: R3.dentro }); inExitNow(); await new Promise(r => setTimeout(r, 600)); return d1 < d0 * 0.5 ? true : info; })()") === true, 'dentro de casa, tocar no chão do 3D leva o vaqueiro até lá');
  t.ok(await t.ev("(async () => { closeModal(); const L = myAnimals('boi').slice(0, 2).map(a => a.id); SET.cenas = true; csTruckIn(L); await new Promise(r => setTimeout(r, 2500)); const ok = mode === 'cs' && R3.vis && CSX.length > 0; for (let i = 0; i < 80 && mode === 'cs'; i++) { const sk = document.getElementById('skip'); if (sk) sk.click(); await new Promise(r => setTimeout(r, 250)); } return ok; })()"), 'as cenas também rodam no 3D (caminhão boiadeiro)');
  // foto no 3D
  await t.ev("A.fotoAbrir(); FOTO.want = 'tirar'; 0"); await t.ate('!!FOTO.last', 6000);
  t.ok(await t.ev("(async () => { const im = new Image(); im.src = FOTO.last; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0); const d = g.getImageData(0, 0, c.width, c.height * 0.8).data; let mn = 255, mx = 0; for (let i = 0; i < d.length; i += 4 * 101) { mn = Math.min(mn, d[i + 1]); mx = Math.max(mx, d[i + 1]); } fotoSair(); return mx - mn > 50; })()"), 'o modo foto fotografa o 3D');
  // mapa muda → o 3D refaz o pedaço (porteira aberta/fechada aparece na hora)
  t.ok(await t.ev("(() => { const v0 = R3.ver; applyObjs(); return R3.ver > v0; })()"), 'mudança no mapa refaz o 3D');
  t.semErros();
} };
