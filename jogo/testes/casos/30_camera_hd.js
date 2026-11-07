// v7.9.2: câmera estável no HD — sem balanço no ziguezague, sem tremedeira de cena no jogo normal
module.exports = { nome: 'Câmera estável no visual HD (2,5D)', async rodar(t) {
  const p = await t.abrir({ ajustes: { view: 'hd', cenas: false }, tela: { width: 400, height: 760 } }); await t.jogoNovo();
  if (!(await t.ev('HD.on'))) { t.ok(true, 'este navegador não tem WebGL2: teste do HD pulado'); return t.semErros(); }
  await t.ev("S.min = 9 * 60; P.x = 30 * TS; P.y = 40 * TS; const h = S.animals.find(a => a.own === 'player' && a.sp === 'cavalo'); if (h) { P.mnt = h.id; h._st = 'ridden'; } cam.snap = true; 0"); await t.espera(1200);
  t.igual(await t.ev('CINE.drift'), 0, 'no jogo normal a câmera não balança como nas cenas');
  t.ok(await t.ev('Math.abs(CINE.phi - CINE.phiT) < 0.5'), 'a inclinação da câmera fica parada no ângulo padrão');
  await t.ev("window.__xs = []; window.__on = 1; const f = () => { if (!window.__on) return; window.__xs.push(w2s(ix(P), iy(P))[0]); requestAnimationFrame(f); }; requestAnimationFrame(f); 0");
  for (let i = 0; i < 10; i++) { await p.keyboard.up(i % 2 ? 'ArrowLeft' : 'ArrowRight'); await p.keyboard.down(i % 2 ? 'ArrowRight' : 'ArrowLeft'); await t.espera(260); }
  await p.keyboard.up('ArrowRight'); await p.keyboard.up('ArrowLeft'); await t.ev('window.__on = 0; 0');
  const xs = await t.ev('window.__xs'), lo = Math.min(...xs), hi = Math.max(...xs);
  t.ok(xs.length > 10 && hi - lo < 45, 'no ziguezague o vaqueiro fica perto do centro da tela (variou ' + Math.round(hi - lo) + ' px)');
  await p.keyboard.down('Shift'); await p.keyboard.down('ArrowRight'); await t.espera(1500);
  const sx = await t.ev('w2s(ix(P), iy(P))[0] / W'); await p.keyboard.up('ArrowRight'); await p.keyboard.up('Shift');
  t.ok(sx > 0.3 && sx < 0.6, 'no galope a câmera acompanha com um pequeno adiantamento (vaqueiro em ' + Math.round(sx * 100) + '% da tela)');
  t.semErros();
} };
