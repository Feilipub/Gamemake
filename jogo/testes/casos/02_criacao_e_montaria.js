module.exports = { nome: 'Criação do vaqueiro, montaria personalizada e carro de boi', async rodar(t) {
  await t.abrir();
  await t.jogoNovo(`(()=>{ const cf = defaultCF(); cf.hbr='crioulo'; cf.coat='lobuno'; cf.mk = mkEnc(3, 15, 2); cf.age = 3; cf.ap.beard = 2; cf.ap.mark = 3; cf.cust = Object.assign(defCust(), { mane:'trancada', tail:'atada', pad:'#2f5a8a', rein:'#a83a2a', peit:true, orn:'fitas' }); return cf; })()`);
  const h = JSON.parse(await t.ev('(()=>{ const h = mainHorse(); return JSON.stringify({ br: h.br, coat: h.coat, mane: h.cust.mane, peit: h.cust.peit, beard: S.cf.ap.beard }); })()'));
  t.igual(h.br, 'crioulo', 'a raça escolhida foi aplicada'); t.igual(h.coat, 'lobuno', 'a pelagem escolhida foi aplicada'); t.igual(h.mane, 'trancada', 'a crina trançada foi aplicada'); t.igual(h.beard, 2, 'o bigode do vaqueiro foi aplicado');
  await t.ev("(()=>{ const h = mainHorse(); P.mnt = h.id; h._st = 'ridden'; P.x = h.x; P.y = h.y; })()");
  const x0 = await t.ev('P.x'); await t.p.keyboard.down('ArrowRight'); await t.espera(1500); await t.p.keyboard.up('ArrowRight');
  t.ok((await t.ev('P.x')) - x0 > 10, 'montado, o vaqueiro anda com o teclado');
  await t.ev('S.cash += 60000; mainHorse()._st = null; P.mnt = null; A.buyOxCart(); 0'); await t.pularCenas();
  const oc = await t.ev(`(()=>{ const c = S.veh.boi; const mk = n => { const a = mkAnimal('boi','caracu',{ sex:'M', age:60, n, carro:100 }); a.x = c.x + 40; a.y = c.y; a.own = 'player'; S.animals.push(a); return a; }; const a1 = mk('Brilhante'), a2 = mk('Fortaleza'); useVeh(c); c.hitch = a1.id; c.hitch2 = a2.id; placePair(c); P.x = c.x; P.y = c.y; P.cart = true; return c.own; })()`);
  t.ok(oc, 'comprou e atrelou o carro de boi'); const cx = await t.ev('S.cart.x'); await t.p.keyboard.down('ArrowRight'); const andou = await t.ate('Math.abs(S.cart.x - ' + cx + ') > 10', 8000); await t.p.keyboard.up('ArrowRight');
  t.ok(andou, 'o carro de boi anda');
  const sv = await t.ev("(()=>{ const o = JSON.parse(SAVE.serialize()); SAVE.apply(o, SAVE_V); return [S.veh.boi.own, mainHorse().cust.mane, S.cf.ap.beard].join(','); })()");
  t.igual(sv, 'true,trancada,2', 'salvar e carregar mantém carro, crina e rosto');
  t.semErros();
} };
