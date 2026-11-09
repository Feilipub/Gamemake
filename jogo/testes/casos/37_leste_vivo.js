// v9.5: bichos em alta, donos das fazendas do leste (negócio e missões), Serra das Três Pontas (escalada, lenda, gruta) e minijogos
module.exports = { nome: 'Fazendas do leste vivas, Três Pontas e minijogos', tempo: 240000, async rodar(t) {
  await t.abrir({ ajustes: { view: '2d', cenas: false } }); await t.jogoNovo();
  // bichos em alta: o desenho do boi ganha a versão 2x
  t.ok(await t.ev("(() => { const a = myAnimals('boi')[0], d = animalDraw(a); const c = d[5] ? d[5].b : d[0]; const h = charHi(c); return !!h && h.width === c.width * 2; })()"), 'o boi tem desenho em alta (2x)');
  // dono da fazenda: janela com prosa, gado à venda e venda
  await t.ev("S.min = 9 * 60; S.weather = 'sol'; const [x, y] = lfOwnerPos('jundia'); P.x = x; P.y = y + 14; P.mnt = null; 0");
  t.ok(await t.ev("interactables().some(o => o.k === 'lfDono')"), 'o dono aparece na sede e dá para conversar');
  await t.ev("openFazL('jundia'); 0"); t.ok(await t.ev("M.open && document.getElementById('mc').textContent.includes('Gado à venda') && document.getElementById('mc').textContent.includes('Vender aqui')"), 'a janela da fazenda tem compra, venda e serviço');
  const c0 = await t.ev('S.cash + S.acct'); await t.ev("S.cash += 50000; A.lfBuy(0); 0");
  t.ok(await t.ev("S.delivery.some(d => d.to === 'receb') && lfOffers('jundia')[0].sold === 1"), 'comprou um boi da fazenda: chega amanhã no curral de recepção');
  // vender: um boi seu dentro do pasto da Jundiá
  await t.ev("const a = myAnimals('boi').find(b => !b.main); window.__v = a; const p = randIn('jdPasto'); a.x = p[0]; a.y = p[1]; renderModal(); 0");
  t.ok(await t.ev("document.getElementById('mc').textContent.includes(window.__v.n)"), 'o boi trazido até a fazenda aparece para vender');
  await t.ev("A.lfSell(window.__v.id); 0"); t.ok(await t.ev("window.__v.own === 'jundia'"), 'vendeu e o boi fica na fazenda'); await t.ev('closeModal(); 0');
  // missão: boi fugido — leva de volta ao pasto e recebe
  await t.ev("LSt().mis.caititu = null; lfNewMission('caititu', 'fujao'); 0");
  const m = await t.ev("LSt().mis.caititu"); t.ok(m && m.t === 'fujao' && m.aid, 'pediu serviço: um boi fugiu para a caatinga');
  await t.ev("const a = byId(LSt().mis.caititu.aid); window.__f = a; const p = randIn('ctPasto'); a.x = p[0]; a.y = p[1]; window.__c1 = S.cash; lfCheckMissions(); 0");
  t.ok(await t.ev("!LSt().mis.caititu && window.__f.own === 'caititu' && S.cash > window.__c1"), 'devolveu o boi fugido ao pasto e recebeu o pagamento');
  // missão: boiada — leva 3 vacas adultas suas até a Caititu
  await t.ev("LSt().mis.caititu = { t: 'boiada', n: 1, r: 260, txt: '' }; const v = myAnimals('boi').find(b => b.sex === 'F' && b.age >= 24 && !b.main) || myAnimals('boi').find(b => !b.main); v.sex = 'F'; v.age = Math.max(v.age, 30); const p = randIn('ctPasto'); v.x = p[0]; v.y = p[1]; window.__c2 = S.cash; lfCheckMissions(); 0");
  t.ok(await t.ev("!LSt().mis.caititu && S.cash > window.__c2 + 260"), 'levou a boiada até a fazenda e recebeu preço e frete');
  // minijogos: abrem e terminam pagando
  for (const [k, fim] of [['pauBrasil', 3], ['tresPontas', 6], ['caititu', 12], ['novaEsp', 1]]) {
    await t.ev(`LSt().svc['${k}'] = 0; window.__c3 = S.cash; M.lfk = '${k}'; A.lfSvc(); 0`); await t.espera(400);
    t.ok(await t.ev("MJ.on && !!document.getElementById('mjC')"), 'o minijogo de ' + k + ' abre com a tela de jogo');
    await t.espera(300); await t.ev(`mjFinish(${fim}); 0`); await t.espera(300);
    t.ok(await t.ev(`!MJ.on && LSt().svc['${k}'] === S.day`), 'terminou o minijogo de ' + k);
  }
  t.ok(await t.ev('S.inv.milho >= 1'), 'quebrar milho rende sacos de milho');
  // ferrar o próprio cavalo: dura 60 dias
  await t.ev("const h = mainHorse(); h.age = Math.max(h.age, 40); P.x = h.x; P.y = h.y; S.cash += 100; ferrarProprio(h); 0"); await t.espera(400); await t.ev('mjFinish(6); 0'); await t.espera(300);
  t.ok(await t.ev('mainHorse().ferr === S.day'), 'ferrou o próprio cavalo (cansa menos por 60 dias)');
  // corrida de jegue nas festas
  t.ok(await t.ev("typeof jegueFestaInteract === 'function'"), 'corrida de jegue existe para as festas da praça');
  // Serra: escalar as três pontas destrava a gruta e o diadema
  await t.ev("A.lfLenda && (M.lfk = 'tresPontas', A.lfLenda()); 0"); t.ok(await t.ev("LSt().lenda === 1 && document.getElementById('mc').textContent.includes('diadema')"), 'Dona Lourdes conta a lenda das Três Pontas'); await t.ev('closeModal(); 0');
  for (const key of ['norte', 'meio', 'sul']) { await t.ev(`P.en = 100; const [x, y] = tpClimbSpot('${key}'); P.x = x; P.y = y; tpClimbStart('${key}'); 0`); await t.espera(300); t.ok(await t.ev("MJ.on"), 'a escalada da ponta ' + key + ' abre'); await t.ev('mjFinish(true); 0'); await t.espera(300); }
  t.ok(await t.ev("['norte', 'meio', 'sul'].every(n => LSt().climb[n]) && LSt().grutaVista === 1"), 'subiu as três pontas e a gruta apareceu');
  await t.ev("P.x = TP_GRUTA[0] * TS; P.y = TP_GRUTA[1] * TS + 4; 0"); t.ok(await t.ev("interactables().some(o => o.k === 'gruta')"), 'dá para entrar na gruta');
  await t.ev("window.__c4 = S.cash; tpGruta(); 0"); t.ok(await t.ev("LSt().gruta === 1 && S.inv.diadema === 1 && S.cash >= window.__c4 + 2500"), 'achou o Diadema de Pedra e as moedas antigas');
  await t.ev("P.x = 228 * TS; P.y = 56 * TS; S.min = 10 * 60; 0"); await t.espera(1200); await t.foto('37_sede_dona');
  t.semErros();
} };
