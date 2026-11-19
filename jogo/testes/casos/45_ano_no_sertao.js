// v19: acontecimentos das estações — Santa Luzia, São José, Festa da Colheita e fogo no pasto (com aceiro)
module.exports = { nome: 'O ano no sertão: Santa Luzia, São José, Festa da Colheita e fogo no pasto', tempo: 300, async rodar(t) {
  await t.abrir({ ajustes: { view: '2d', cenas: false } }); await t.jogoNovo(); await t.ev('toast = () => {}; 0');
  const dia = (m, d) => `(() => { let x = S.day; while (!(calDate(x).m === ${m} && calDate(x).d === ${d})) x++; S.day = x; return x; })()`;
  // Santa Luzia: as pedrinhas mostram o inverno
  await t.ev(dia(11, 12)); await t.ev("S.min = 18 * 60; clima().inv = 'bom'; 0");
  t.ok(await t.ev('luziaPode()'), 'na noite de 12 de dezembro dá para fazer a experiência de Santa Luzia');
  await t.ev('A.luziaFaz(); S.day += 1; hourTick(6); 0');
  t.ok(await t.ev("M.open && /Santa Luzia/.test(M.title) && S.luzia.der.length >= 4 && /inverno bom/.test($('mn').innerHTML)"), 'de manhã: inverno bom = muitas pedrinhas derretidas');
  await t.ev('closeModal(); 0');
  // São José: chuva melhora o inverno
  await t.ev(dia(2, 19)); await t.ev("clima().inv = 'fraco'; S.weather = 'chuva'; hourTick(21); 0");
  t.ok(await t.ev("clima().inv === 'regular' && S.stats.sjose === 1"), 'choveu no dia de São José: o inverno melhora');
  // Festa da Colheita
  const dc = await t.ev("(() => { let x = S.day; while (!eventsOnDay(x).includes('colheita')) x++; S.day = x; S.min = 10 * 60; return calDate(x).m; })()");
  t.ok(dc === 3 && await t.ev("eventNow('colheita') === 'colheita'"), 'a Festa da Colheita cai em abril, no fim das águas');
  t.ok(await t.ev("(() => { S.inv.abobora = 8; S.inv.milho = 2; openEventDesk('colheita'); return /Concurso do melhor produto/.test($('mn').innerHTML) && /data-v=.abobora./.test($('mn').innerHTML); })()"), 'na festa: concurso e barraca com os produtos da mochila');
  t.ok(await t.ev("(() => { const c0 = S.cash + S.acct; A.colhVende('milho'); const ok1 = S.cash + S.acct > c0; A.colhInsc('abobora'); return ok1 && S.colhY === calDate().y && /lugar|colocação/.test(S.colhRes); })()"), 'vende na barraca e concorre uma vez no ano');
  await t.ev('closeModal(); 0');
  // fogo no pasto
  const fogo = JSON.parse(await t.ev(`(() => { S.weather = 'sol'; const k = 'p1'; for (let y = AREAS[k].r[1]; y <= AREAS[k].r[3]; y++) for (let x = AREAS[k].r[0]; x <= AREAS[k].r[2]; x++) { const i = gi(x, y); if (ground[i] === G.PAST) grass[i] = 220; }
    S.aceiro = 0; window.__wk = S.workers; S.workers = []; const ok = fogoComeca(k); for (let i = 0; i < 40; i++) fogoTick(0.5); const n = S.fogo.length; return JSON.stringify({ ok, n }); })()`));
  t.ok(fogo.ok && fogo.n > 2, 'o fogo pega no pasto e se espalha (' + fogo.n + ' chamas)');
  t.ok(await t.ev("(() => { const f = S.fogo[0]; P.mnt = null; P.x = (f[0] + 0.5) * TS; P.y = (f[1] + 1.2) * TS; computeCtx(); return P._ctx && /Apagar o fogo/.test(P._ctx.label); })()"), 'perto do fogo a AÇÃO é apagar');
  t.ok(await t.ev("(() => { let g = 0; while (S.fogo.length && g++ < 80) { const f = S.fogo[0]; fogoApagar((f[0] + 0.5) * TS, (f[1] + 0.5) * TS); } return !S.fogo.length && S.stats.fogos === 1; })()"), 'apagando as chamas, o fogo acaba');
  const ac = JSON.parse(await t.ev(`(() => { const k = 'p1', r = AREAS[k].r; for (let y = 40; y <= 70; y++) for (let x = 0; x <= 40; x++) { const i = gi(x, y); if (ground[i] === G.PAST) grass[i] = 220; }
    S.cash += 5000; A.aceiro(); fogoComeca(k); S.workers = window.__wk; for (let i = 0; i < 60; i++) fogoTick(0.5); const fora = S.fogo.filter(f => f[0] <= r[0] || f[1] <= r[1] || f[0] >= r[2] || f[1] >= r[3]).length; const n = S.fogo.length; S.weather = 'chuva'; fogoTick(0.1); return JSON.stringify({ aceiro: S.aceiro === calDate().y, n, fora, chuva: S.fogo.length }); })()`));
  t.ok(ac.aceiro && ac.fora === 0 && ac.n <= 10, 'com aceiro o fogo fica preso no pasto ' + JSON.stringify(ac));
  t.ok(ac.chuva === 0, 'a chuva apaga o fogo');
  t.ok(await t.ev("['luzia1', 'fogo1', 'colh1'].every(k => CONQ.some(c => c[0] === k))"), 'conquistas novas do ano no sertão');
  t.ok(await t.ev("(() => { openMenu('far'); const ok = /Aceiro contra o fogo/.test($('mn').innerHTML); closeModal(); return ok; })()") || await t.ev("/Aceiro contra o fogo/.test(farmTab())"), 'aceiro no menu da fazenda');
  t.semErros();
} };
