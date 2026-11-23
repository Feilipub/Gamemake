// Mata Grande (v7.2): mapa novo ao sul, lugares, coleta, Caderneta da Mata e a caça ao Barbatão
module.exports = { nome: 'Mata Grande: lugares, coleta, caderneta e o Barbatão', tempo: 300, async rodar(t) {
  await t.abrir({ ajustes: { view: '2d', cenas: false } }); await t.jogoNovo();
  t.igual(await t.ev('MH'), 264, 'o mapa cresceu para o sul');
  t.ok(await t.ev('forest[gi(90, 240)] === 1 && ground[gi(90, 215)] === G.DIRT'), 'a mata e a trilha da Mata Grande existem');
  t.ok(await t.ev("PROPS.some(p => p.t === 'tapera') && PROPS.some(p => p.t === 'cachoeira') && PROPS.some(p => p.t === 'gruta')"), 'tapera, cachoeira e gruta estão no mapa');
  // lugares
  for (const k of ['entrada', 'tapera', 'cachoeira', 'gruta', 'mirante', 'grota', 'lagoinha']) {
    await t.ev(`P.mnt = null; P.x = MG_PL.${k}[0] * TS; P.y = MG_PL.${k}[1] * TS; 0`);
    t.ok(await t.ate(`!!MS().pl.${k}`), 'lugar descoberto: ' + k);
  }
  t.igual(await t.ev("regionAt(90 * TS, 240 * TS)[0]"), 'Mata Grande', 'o nome da região aparece ao entrar');
  // coleta
  await t.ev("const i = MATA_COL.findIndex(q => q.t === 'cajazeira'); window.__ci = i; P.x = MATA_COL[i].x; P.y = MATA_COL[i].y + 10; S.inv.caja = 0; colher(i); 0");
  t.ok(await t.ate('(S.inv.caja || 0) >= 3'), 'colher cajá põe frutas na mochila');
  t.ok(await t.ev('!colReady(MATA_COL[window.__ci])'), 'a cajazeira só dá de novo depois de alguns dias');
  await t.ev('S.day += 3; 0'); t.ok(await t.ev('colReady(MATA_COL[window.__ci])'), 'depois de 3 dias dá para colher de novo');
  t.ok(await t.ev("MATA_COL.some(q => q.t === 'erva' && q.y < 20 * TS)"), 'a Mata dos Fundos também tem o que colher');
  // gruta, banho e caderneta
  await t.ev('openGruta(); 0'); t.ok(await t.ev("M.open && document.getElementById('mc').textContent.includes('1974')"), 'a gruta mostra as pinturas e a inscrição do avô'); await t.ev('closeModal(); 0');
  await t.ev('P.en = 30; banhoCachoeira(); 0'); t.ok(await t.ate('P.en >= 60'), 'o banho de cachoeira devolve energia');
  await t.ev("cadSee('tatu'); cadSee('veado'); 0"); t.ok(await t.ev("Object.keys(MS().cad).length >= 2"), 'a Caderneta da Mata anota os bichos');
  await t.ev("openMenu('jor'); 0"); t.ok(await t.ev("document.getElementById('mc').textContent.includes('Caderneta da Mata')"), 'a Jornada mostra a Mata Grande'); await t.ev('closeModal(); 0');
  // o Barbatão
  await t.ev('S.story.fog = 1; barbEnsure(); 0');
  const id = await t.ev('S.barb && S.barb.id'); t.ok(!!id, 'o Barbatão aparece na Grota depois do causo da fogueira');
  await t.ev(`const b = byId(${id}); window.__dogs = myAnimals('cao'); S.animals = S.animals.filter(a => a.sp !== 'cao'); byId(${id})._acu = 0; P.mnt = mainHorse().id; P.x = b.x - 4 * TS; P.y = b.y; 0`);
  await t.espera(1500); t.ok(await t.ev(`hyp(byId(${id}).x - MG.grota[0] * TS, byId(${id}).y - MG.grota[1] * TS) > 4`), 'ele foge quando o vaqueiro chega perto');
  await t.ev(`const b = byId(${id}); b._acu = 0; P.x = b.x - 20; P.y = b.y; lasso.t = null; lasso.aim = null; doLasso(); if (lasso.aim) { lasso.aim.t0 = drawT - (1.5 * Math.PI) / lasso.aim.spd; doLasso(); } 0`); await t.ate('!lasso.fly', 3000);
  t.ok(await t.ev('lasso.t === null'), 'sem acuar, o laço não pega o Barbatão (nem com a mira certa)');
  await t.ev(`const b = byId(${id}); for (const d of window.__dogs) S.animals.push(d); const d = window.__dogs[0]; d.x = b.x + 12; d.y = b.y; 0`);
  t.ok(await t.ate(`byId(${id})._acu > 0`), 'os cães acuam o Barbatão');
  await t.ev(`const b = byId(${id}); P.x = b.x - 20; P.y = b.y; lasso.aim = null; doLasso(); lasso.aim.t0 = drawT - (1.5 * Math.PI) / lasso.aim.spd; doLasso(); 0`); await t.ate('!lasso.fly', 3000);
  t.ok(await t.ev(`lasso.t && lasso.t.id === ${id}`), 'acuado, ele é laçado (mira no anel verde)');
  await t.ev(`const b = byId(${id}); const r = AREAS.p1.r; b.x = (r[0] + 3) * TS; b.y = (r[1] + 3) * TS; P.x = b.x + 20; P.y = b.y; 0`);
  t.ok(await t.ate('S.barb.caught > 0'), 'levado ao pasto da fazenda, o Barbatão é seu');
  t.igual(await t.ev(`byId(${id}).own`), 'player', 'o Barbatão agora é do jogador');
  // Mercadinho compra o que é da mata
  await t.ev('S.inv.mel = 2; openMercadinho(); M.tab = "ven"; renderModal(); 0');
  t.ok(await t.ev("document.getElementById('mc').textContent.includes('Mel da mata')"), 'o Mercadinho compra o mel e as frutas da mata'); await t.ev('closeModal(); 0');
  // save guarda a mata
  t.ok(await t.ev('(() => { const o = JSON.parse(SAVE.serialize()); return !!(o.mata && o.mata.pl.cachoeira && o.barb && o.barb.caught); })()'), 'o save guarda lugares, coleta e o Barbatão');
  t.semErros();
} };
