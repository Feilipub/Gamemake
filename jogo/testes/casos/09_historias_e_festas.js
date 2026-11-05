module.exports = { nome: 'Histórias, namoro, casamento, festas, ITR e final', tempo: 240, async rodar(t) {
  await t.abrir({ celular: true }); await t.jogoNovo();
  await t.ev('S.stats.born = 1; 0'); t.ok(await t.ate('!!(S.conq && S.conq.bez1)'), 'a conquista do primeiro bezerro é ganha');
  await t.ev("addFr('bia', 320); addInv('ovo', 12, true); addInv('leite', 6, true); openNpc('bia'); 0"); await t.espera(300);
  t.ok(await t.ev("$('mc').innerHTML.includes('O forno novo')"), 'a história da Bia aparece com 3 corações');
  await t.ev("A.histOpen('bia'); A.histDo('bia|-1'); 0"); t.igual(await t.ev('S.hist.bia.i'), 1, 'ajudar conclui a parte 1 da história');
  await t.ev("addFr('bia', 1000); S.cash += 5000; A.histDo('bia|-1'); A.histDo('bia|0'); 0"); t.ok(await t.ev('!!S.hist.bia.done && !!S.flags.paoBia'), 'a escolha final da história vale');
  await t.ev("addInv('buque', 1, true); A.amorPede('bia'); S.amor.d -= 8; addInv('aliancas', 1, true); A.amorCasa('bia'); 0"); t.igual(await t.ev('S.amor.wd % 7'), 0, 'o casamento fica marcado para um domingo');
  await t.ev('closeModal(); csCasamento(); 0'); await t.espera(2500); await t.foto('casamento'); await t.pularCenas(); t.igual(await t.ev('S.amor.st'), 3, 'o casamento acontece');
  await t.ev("openEventDesk('junina'); A.quadStart(); 0"); await t.espera(400); await t.foto('quadrilha');
  for (let i = 0; i < 10; i++) { const d = await t.ev('QD.seq[QD.i] && QD.seq[QD.i][1]'); const k = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' }[d]; if (k) await t.p.keyboard.press(k); await t.espera(120); }
  t.igual(await t.ev('QD.ok'), 10, 'acertando os passos a quadrilha dá 10 acertos'); t.ok(await t.ev('!!S.flags.sjoao'), 'dançar a quadrilha marca o São João');
  await t.p.evaluate(() => { const b = document.querySelector('#quad [data-qx]'); b && b.click(); });
  await t.ev('A.missaGo(); 0'); await t.pularCenas(); t.ok(await t.ev('!!S.flags.missaVaq'), 'a Missa do Vaqueiro acontece');
  await t.ev("P.mnt = tutHorse().id; tutHorse()._st = 'ridden'; A.cavGo(); 0"); await t.pularCenas(); t.ok(await t.ev('!!S.flags.cavalgada'), 'a cavalgada acontece montado');
  await t.ev("let d = S.day; while (!(calDate(d).m === 7 && calDate(d).d === 1)) d++; S.day = d; custosDay(); 0"); t.ok(await t.ev('!!S.itr && S.itr.v > 0'), 'o boleto do ITR chega em agosto');
  await t.ev('S.cash += 9999; A.itrPay(); 0'); t.ok(await t.ev('!!S.flags.itrPago'), 'pagar o ITR marca as contas em dia');
  await t.ev('S.jorn.cap = JORNADA.length; 0'); await t.ate('mode === "cs" || !!S.flags.modelo', 12000); await t.pularCenas(); await t.ate('M.open', 8000); t.ok(await t.ev('!!S.flags.modelo && M.open'), 'concluir a Jornada dá o título de Fazenda Modelo');
  await t.foto('certificado'); await t.ev("closeModal(); SAVE.save('manual', true); 0"); await t.espera(800); await t.ev('SAVE.loadBest(SAVE.slot); 0'); await t.espera(2000);
  t.igual(await t.ev("[S.amor && S.amor.st, histDone(), !!S.flags.itrPago].join(',')"), '3,1,true', 'salvar e carregar mantém casamento, histórias e ITR');
  t.semErros();
} };
