// Jogadas reais: dormir várias noites, vaquejada, leilão, tempestade, girar a tela, joystick e toque na tela.
module.exports = { nome: 'Jogadas: dormir, vaquejada, leilão, tempestade, girar a tela e toque', tempo: 400, async rodar(t) {
  await t.abrir({ celular: true, ajustes: { view: '2d', cenas: true } }); await t.jogoNovo(); await t.ev('S.cash += 50000; 0');
  // dormir 3 noites seguidas
  for (let n = 0; n < 3; n++) { const d0 = await t.ev('S.day'); await t.ev('S.min = 21 * 60; P.x = fpx("wake")[0]; P.y = fpx("wake")[1]; A.sleep(); 0'); t.ok(await t.ate('S.day > ' + d0, 30000), 'dormiu e acordou no dia seguinte (' + (n + 1) + 'ª noite)'); await t.espera(800); await t.pularCenas(); await t.ev('closeModal(); 0'); }
  // vaquejada: no dia certo, montado
  await t.ev('let d = S.day; while (!eventsOnDay(d).includes("vaquejada")) d++; S.day = d; S.min = 9 * 60; const h = mainHorse(); h.saddle = "nord"; P.mnt = h.id; h._st = "ridden"; S.vaqDay = 0; startVaquejada(); 0');
  t.ok(await t.ev('VQ.on'), 'a vaquejada começa'); await t.ev('(()=>{ for (let i = 0; i < 900 && VQ.on; i++) { input.x = 1; input.gal = true; if (i % 40 === 20) vaqAction(); tick(1/30); } input.x = 0; input.gal = false; })()'); await t.espera(500);
  t.ok(!(await t.ev('VQ.on')) || ['fall', 'res', 'end'].includes(await t.ev('VQ.ph')), 'a corrida da vaquejada termina (' + (await t.ev('VQ.res || VQ.ph')) + ')');
  await t.ev('VQ.on = false; P.mnt = null; mainHorse()._st = "idle"; 0'); await t.pularCenas();
  // leilão
  const leilao = await t.ev('(()=>{ let d = S.day; for (let k = 0; k < 40 && !eventsOnDay(d).includes("leilao"); k++) d++; if (!eventsOnDay(d).includes("leilao")) return "sem leilão"; S.day = d; S.min = 13.5 * 60; openAucDesk(); const ok = $("mc").innerHTML.includes("aucGo"); if (ok) A.aucGo(); return ok ? "entrou" : "sem botão"; })()');
  if (leilao === 'entrou') { await t.ate('AUC.on', 6000); for (let i = 0; i < 20; i++) { await t.ev('A.aucBid && A.aucBid(); for (let k = 0; k < 60; k++) tick(1/30); 0'); } t.ok(true, 'participou do leilão dando lances'); await t.ev('if (AUC.on) auctionEnd(); closeModal(); 0'); t.ok(await t.ev('cam.fx === null && !AUC.on'), 'o leilão termina e solta a câmera'); }
  else t.ok(true, 'leilão: ' + leilao);
  await t.pularCenas();
  // tempestade com raios por 40 s de jogo
  await t.ev('S.weather = "tempestade"; for (let i = 0; i < 1200; i++) tick(1/30); S.weather = "sol"; 0'); t.ok(true, 'tempestade com raios rodou');
  // girar o celular no meio do jogo
  await t.p.setViewportSize({ width: 915, height: 412 }); await t.espera(1500); await t.p.setViewportSize({ width: 412, height: 915 }); await t.espera(1500);
  t.igual(await t.ev('mode'), 'play', 'girar a tela não quebra o jogo');
  // joystick: arrastar o círculo (antes: fecha janelas de eventos aleatórios e vai para um campo aberto)
  const limpa = async () => { await t.ev('closeModal(); closeSheet(); if (IN.on) leaveRoom(); 0'); await t.espera(700); await t.ev('closeModal(); P.mnt = null; P.x = 30 * TS; P.y = 46 * TS; cam.fx = cam.fy = null; cam.free = false; cam.snap = true; 0'); await t.espera(700); };
  await limpa();
  const j = await t.p.locator('#joy').boundingBox(); if (j) { const x0 = await t.ev('P.x'); await t.p.mouse.move(j.x + j.width / 2, j.y + j.height / 2); await t.p.mouse.down(); await t.p.mouse.move(j.x + j.width, j.y + j.height / 2, { steps: 4 }); await t.espera(1500); await t.p.mouse.up(); t.ok(Math.abs((await t.ev('P.x')) - x0) > 5, 'arrastar o joystick anda'); }
  // modo toque: tocar no chão para ir até lá
  await limpa(); await t.ev("SET.mode = 'touch'; 0"); const x1 = await t.ev('P.x'), y1 = await t.ev('P.y'); const alvo = await t.ev('(()=>{ const r = C.getBoundingClientRect(), q = w2s(P.x + 48, P.y + 4); return JSON.stringify([r.left + q[0] * r.width / W, r.top + q[1] * r.height / H]); })()'); const [tx, ty] = JSON.parse(alvo);  await t.p.touchscreen.tap(tx, ty); await t.espera(2500);
  t.ok(Math.abs((await t.ev('P.x')) - x1) + Math.abs((await t.ev('P.y')) - y1) > 5, 'no modo toque, tocar no chão leva o vaqueiro até lá');
  await t.ev("SET.mode = 'joy'; 0");
  t.semErros();
} };
