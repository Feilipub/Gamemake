module.exports = { nome: 'Teclas personalizadas, controle de videogame e daltonismo', async rodar(t) {
  await t.abrir({ antes: () => { window.__pad = { axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) }; navigator.getGamepads = () => [Object.assign({ connected: true, id: 'teste' }, window.__pad)]; } });
  await t.jogoNovo(); await t.ev("KB.set('aboio', 'KeyZ'); S.flags.aboio = 0; 0");
  await t.p.keyboard.press('KeyQ'); await t.espera(200); t.igual(await t.ev('S.flags.aboio || 0'), 0, 'a tecla antiga do aboio para de funcionar');
  await t.p.keyboard.press('KeyZ'); await t.espera(200); t.igual(await t.ev('S.flags.aboio || 0'), 1, 'a tecla nova do aboio funciona'); await t.ev('A.kbReset(); closeModal(); 0');
  const x0 = await t.ev('P.x'); await t.p.evaluate(() => { window.__pad.axes[0] = 1; }); await t.espera(4000); await t.p.evaluate(() => { window.__pad.axes[0] = 0; }); t.ok((await t.ev('P.x')) - x0 > 15, 'o analógico do controle anda');
  const btn = async i => { await t.p.evaluate(i => { window.__pad.buttons[i] = { pressed: true, value: 1 }; }, i); await t.espera(150); await t.p.evaluate(i => { window.__pad.buttons[i] = { pressed: false, value: 0 }; }, i); await t.espera(150); };
  await btn(9); t.ok(await t.ev('M.open'), 'Start abre o menu'); await btn(1); t.ok(!(await t.ev('M.open')), 'B fecha o menu');
  await t.ev("A.setOpt('cb|deut'); closeModal(); 0"); t.igual(await t.ev("$('c').style.filter"), 'url("#cb-deut")', 'o filtro de daltonismo é aplicado');
    // v9.6: empurrar o direcional até a borda faz correr (sem precisar do botão Correr)
  const gal = await t.p.evaluate(async () => { const J = document.getElementById('joy'), b = J.getBoundingClientRect(), cx = b.left + b.width / 2, cy = b.top + b.height / 2, o = { pointerId: 1, bubbles: true, pointerType: 'mouse', isPrimary: true };
    J.dispatchEvent(new PointerEvent('pointerdown', Object.assign({ clientX: cx, clientY: cy }, o))); J.dispatchEvent(new PointerEvent('pointermove', Object.assign({ clientX: cx + b.width, clientY: cy }, o)));
    await new Promise(r => setTimeout(r, 450)); J.dispatchEvent(new PointerEvent('pointermove', Object.assign({ clientX: cx + b.width + 2, clientY: cy }, o)));
    const a = window.__lida.ev('input.gal'); J.dispatchEvent(new PointerEvent('pointerup', Object.assign({ clientX: cx, clientY: cy }, o))); return [a, window.__lida.ev('input.gal')]; });
  t.ok(gal[0] === true && gal[1] === false, 'empurrar o direcional até a borda faz correr e soltar para');
  t.semErros();
} };
