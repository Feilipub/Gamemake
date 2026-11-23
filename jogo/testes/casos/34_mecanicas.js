// v8.1: laço com mira, ordenha no ritmo e sinuca com física
module.exports = { nome: 'Laço com mira, ordenha no ritmo e sinuca de verdade', async rodar(t) {
  await t.abrir({ ajustes: { view: '2d', cenas: false } }); await t.jogoNovo();
  // laço: primeiro toque gira, o segundo arremessa; acerto depende do anel
  await t.ev("lasso.t = null; const a = myAnimals('boi')[0]; a._st = 'idle'; P.mnt = null; P._act = null; P.x = a.x - 30; P.y = a.y; S.animals.forEach(b => { if (b !== a && Math.hypot(b.x - P.x, b.y - P.y) < 140) b.x += 400; }); window.__a = a; doLasso(); 0");
  t.ok(await t.ev('!!lasso.aim && lasso.aim.t === window.__a && !lasso.t'), 'o primeiro toque começa a girar o laço mirando o animal');
  await t.ev('lasso.aim.t0 = drawT - (1.5 * Math.PI) / lasso.aim.spd; doLasso(); 0'); // anel fechado (verde)
  t.ok(await t.ev('!!lasso.fly && lasso.fly.ok'), 'tocando com o anel verde o laço vai certeiro');
  await t.ate('!lasso.fly', 3000); t.ok(await t.ev('lasso.t === window.__a'), 'o animal fica laçado');
  await t.ev('doLasso(); 0'); t.ok(await t.ev('!lasso.t'), 'tocando de novo solta a corda');
  await t.ev("doLasso(); lasso.aim.t0 = drawT - (0.5 * Math.PI) / lasso.aim.spd; doLasso(); 0"); // anel aberto (vermelho)
  t.ok(await t.ev('!!lasso.fly && !lasso.fly.ok'), 'com o anel aberto o laço erra');
  await t.ate('!lasso.fly', 3000); t.ok(await t.ev('!lasso.t'), 'errou: a corda cai no chão');
  // ordenha: alternar os lados enche o balde; repetir o lado incomoda a vaca
  await t.ev("const c = myAnimals('boi').find(b => b.sex === 'F'); window.__c = c; S.inv.leite = 0; ordenhaStart(c, null); 0");
  t.ok(await t.ev("document.getElementById('ordE') !== null"), 'a ordenha abre com os botões esquerda e direita');
  for (let i = 0; i < 16; i++) { await t.ev(`ordenhaTap('${i % 2 ? 'D' : 'E'}'); 0`); await t.espera(170); }
  const bom = await t.ev('ORD.L'); await t.ev("ordenhaTap('D'); ordenhaTap('D'); 0"); t.ok(bom > 0 && (await t.ev('ORD.bad')) >= 1, 'alternar enche o balde; repetir o mesmo lado conta como erro');
  await t.ev('ordenhaEnd(); 0'); t.ok(await t.ev('(S.inv.leite || 0) >= 1 && !ORD.on'), 'no fim o leite vai para a mochila');
  // sinuca: mesa com física
  await t.ev("sinucaStart(); 0"); t.ok(await t.ev("document.getElementById('snC') !== null && SN.B.length === 11"), 'a sinuca abre a mesa com a branca e 10 bolas');
  await t.ev("const b = SN.B[1]; b.x = 280; b.y = 20; const cue = SN.B[0]; cue.x = 250; cue.y = 50; SN.B.slice(2).forEach(o => { o.x = 120 + Math.random() * 20; o.y = 120; }); sinucaShoot(Math.atan2(20 - 50, 280 - 250), 0.6); for (let i = 0; i < 400 && SN.state === 'roll'; i++) sinucaStep(1 / 60); 0");
  t.ok(await t.ev('SN.pot >= 1 && SN.shots === 5'), 'a tacada leva a colorida para a caçapa (física de verdade)');
  await t.ev("SN.pot = 2; const b = SN.B[2]; b.in = 0; b.x = 285; b.y = 140; b.vx = 0; b.vy = 0; const cue = SN.B[0]; cue.in = 0; cue.x = 255; cue.y = 110; const c0 = S.cash; window.__c0 = c0; sinucaShoot(Math.atan2(140 - 110, 285 - 255), 0.6); for (let i = 0; i < 400 && SN.state === 'roll'; i++) sinucaStep(1 / 60); 0");
  t.ok(await t.ev("SN.state === 'end' && S.cash > window.__c0"), 'com 3 coloridas o desafio é vencido e paga o prêmio');
  await t.ev('SN.on = false; closeModal(); 0');
  t.semErros();
} };
