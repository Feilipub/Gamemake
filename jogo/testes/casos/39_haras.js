// v14: modo Haras — escolhido na criação; fazenda vira haras; égua pare no primeiro dia; coberturas, provas, hotel e aulas; save; o modo gado continua igual
module.exports = { nome: 'Modo Haras: mapa, potro, coberturas, provas, hotel e aulas', async rodar(t) {
  await t.abrir({ ajustes: { view: '2d', cenas: false } });
  // a escolha aparece no começo da criação
  t.ok(await t.ev("(() => { openSetup(false); const ok = !!document.querySelector('#setup [data-s=\"modo\"][data-v=\"haras\"]'); $('setup').style.display = 'none'; document.body.classList.remove('ovl'); return ok; })()"), 'a criação do personagem oferece o mapa Haras');
  await t.jogoNovo("Object.assign(defaultCF(), { modo: 'haras' })", false);
  t.ok(await t.ev("S.modo === 'haras' && FT().startsWith('Haras') && AREAS.curral.n === 'Picadeiro de Areia' && AREAS.quar.n === 'Hotel de Cavalos'"), 'a fazenda virou haras (picadeiro, hotel de cavalos)');
  t.ok(await t.ev("myAnimals('boi').length === 0 && ['Imperador', 'Estrela', 'Ventania'].every(n => harHorses().some(a => a.n === n))"), 'começa com garanhão e duas éguas, sem gado');
  t.ok(await t.ev("ground[gi(44, 37)] === G.SAND && !PROPS.some(p => p.t === 'balanca' || p.t === 'troncoCont') && fenceStyleAt(5, 50) === 'm'"), 'picadeiro de areia, sem balança/tronco de gado e cercas de tábua');
  t.ok(await t.ev("JORNADA[0].n === 'A chegada ao haras' && built('estrebaria') && buildKeys().includes('cocheira') && !buildKeys().includes('ordenha')"), 'jornada e obras próprias do haras');
  t.ok(await t.ev("(() => { const T = TUT.find(x => x.k === 'aboio'); return T && /éguas/.test(T.t) && !!tutCow() && tutCow().sp === 'cavalo'; })()"), 'tutorial usa as éguas no lugar do gado');
  // o primeiro parto é de um potro
  t.ok(await t.ev("(() => { const e = estrela(), c = S.story && byId(S.story.calf); return e && e.sp === 'cavalo' && e.sex === 'F' && (e.preg > 0 || (c && c.sp === 'cavalo')); })()"), 'a Estrela é uma égua e o primeiro parto é de potro');
  t.ok(await t.ev("(() => { const e = estrela(); const c = birthCalf(e, { help: 1 }); return c && c.sp === 'cavalo' && cria(c, c.sex === 'F').startsWith('pot'); })()"), 'nasce um potro');
  // renda
  await t.ev("S.cash = 20000; S.day += 1; 0");
  const cob = await t.ev("(() => { const H = harS(); for (let i = 0; i < 30 && !H.cob.length; i++) harasDay(); const c = H.cob[0]; if (!c) return 'sem pedido'; const m0 = S.cash + S.acct; A.harCob(c.id); return Math.round(S.cash + S.acct - m0) === c.p && H.nCob === 1 ? 'ok' : 'falhou'; })()");
  t.ok(cob === 'ok', 'pedido de cobertura chega e paga (' + cob + ')');
  t.ok(await t.ev("(() => { const g = harHorses().find(a => a.n === 'Imperador'); const m0 = S.cash + S.acct; A.harProva('corrida|' + g.id); closeModal(); return harS().nProva === 1 && g._provaD === S.day; })()"), 'cavalo corre uma prova (inscrição e resultado)');
  t.ok(await t.ev("(() => { S.min = 9 * 60; P.x = 20 * TS; P.y = 40 * TS; const m0 = S.cash + S.acct; A.harAula(); return harS().nAula === 1 && S.cash + S.acct > m0; })()"), 'aula de equitação paga');
  const hot = await t.ev("(() => { S.land = S.land || {}; for (const k in PARCELS) S.land[k] = 1; applyLand(); const H = harS(); for (let i = 0; i < 40 && !H.hreq.length; i++) harasDay(); const r = H.hreq[0]; if (!r) return 'sem pedido'; A.harHosp(r.id); const a = byId(H.hosp[0].id); const wi = trIdx('quar', 'agua'); if (wi >= 0) S.tr[wi] = trCap(wi); const m0 = S.cash + S.acct; harasDay(); return a && a.hotel && !myAnimals('cavalo').includes(a) && S.cash + S.acct > m0 ? 'ok' : 'falhou'; })()");
  t.ok(hot === 'ok', 'hotel recebe hóspede, cobra diária e não conta como animal seu (' + hot + ')');
  t.ok(await t.ev("(() => { openMenu('har'); const ok = M.tab === 'har' && /Pedidos de cobertura/.test($('mn').innerHTML); closeModal(); return ok; })()"), 'aba Haras no menu');
  await t.ev("P.x = 44 * TS; P.y = 44 * TS; cam.uz = 1; 0"); await t.espera(800); await t.foto('39_picadeiro');
  await t.ev("P.x = 18 * TS; P.y = 62 * TS; 0"); await t.espera(800); await t.foto('39_pista');
  // salvar e carregar mantém o haras
  t.ok(await t.ev("(() => { const o = JSON.parse(SAVE.serialize()); SAVE.apply(o); return S.modo === 'haras' && AREAS.curral.n === 'Picadeiro de Areia' && ground[gi(44, 37)] === G.SAND && JORNADA[0].n === 'A chegada ao haras'; })()"), 'save do haras volta como haras');
  // jogo de gado continua como antes
  await t.jogoNovo();
  t.ok(await t.ev("S.modo === 'gado' && AREAS.curral.n === 'Curral Principal' && myAnimals('boi').length >= 3 && JORNADA[0].n === 'A chegada' && !buildKeys().includes('cocheira') && fenceStyleAt(5, 50) !== 'm'"), 'o mapa de gado continua igual');
  t.semErros();
} };
