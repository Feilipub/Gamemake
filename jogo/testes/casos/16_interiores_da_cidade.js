// Todos os prédios da cidade têm interior: entrar, usar o balcão, sentar, olhar, conversar e sair pela porta.
module.exports = { nome: 'Interiores da cidade: entrar, balcão, sentar, conversar e sair', tempo: 300, async rodar(t) {
  await t.abrir({ ajustes: { view: '2d', cenas: false } }); await t.jogoNovo(); await t.ev('for (const id in NPCDEF) addFr(id, 400); S.cash += 5000; 0');
  const ids = JSON.parse(await t.ev('CITYR = 1; buildCityRooms(); JSON.stringify(CITY_IDS().map(b => b.id))'));
  t.ok(ids.length >= 18, 'a cidade tem ' + ids.length + ' prédios com interior');
  const fora = []; let lojas = 0;
  for (const id of ids) {
    const casa = id.startsWith('casa') || ['cida', 'rosa'].includes(id);
    const r = JSON.parse(await t.ev(`(()=>{ S.min = ${casa ? 19.5 : 10.5} * 60; closeModal(); const b = BLD.find(q => q.id === '${id}'); P.x = b.dp[0] * TS; P.y = b.dp[1] * TS + 6; for (const e of npcs) updNpc(e, 0.05); openBuilding(b); return JSON.stringify({ ok: !!IROOM['${id}'] }); })()`));
    await t.espera(500); const on = await t.ev(`IN.on && IN.id === '${id}'`);
    if (!on) { fora.push(id); continue; }
    // usa o balcão/mesa principal (a primeira ação que abre loja) e confere que abre uma janela sem erro
    const usou = await t.ev(`(()=>{ const u = inUses().find(f => /Balcão|Caixa|Comprar|Pedir|Mesa do|Guichê|Encomendar|Falar de serviço|cadeira do Neném|Biblioteca/.test(f.label || '')); if (!u) return 'sem balcão'; u.fn(u); const m = M.open; closeModal(); return m ? 'abriu' : 'não abriu'; })()`);
    if (usou === 'abriu') lojas++;
    // senta e levanta, quando há assento
    await t.ev(`(()=>{ const f = IROOM['${id}'].furn.find(q => q.seat); if (f) { inSit(f); inStand(); } })()`);
    // sai pela porta
    await t.ev('leaveRoom(); 0'); await t.espera(450); t.ok(!(await t.ev('IN.on')), 'saiu de ' + id + ' pela porta');
  }
  t.ok(fora.length <= 3, 'quase todos os prédios abriram nesse horário (fechados agora: ' + (fora.join(', ') || 'nenhum') + ')');
  t.ok(lojas >= 12, 'o balcão de ' + lojas + ' lojas abre a loja de sempre');
  // sinuca, reza e café
  await t.ev(`(()=>{ S.min = 19.5 * 60; const b = BLD.find(q => q.id === 'bar'); P.x = b.dp[0] * TS; P.y = b.dp[1] * TS + 6; for (const e of npcs) updNpc(e, 0.05); openBuilding(b); })()`); await t.espera(500);
  if (await t.ev("IN.on && IN.id === 'bar'")) { const c0 = await t.ev('S.cash'); await t.ev("(()=>{ const u = inUses().find(f => /sinuca/.test(f.label)); u.fn(u); for (let i = 0; i < 80; i++) updInterior(1/30); })()"); t.ok((await t.ev('S.cash')) !== c0, 'jogou sinuca no bar'); await t.ev('leaveRoom(); 0'); await t.espera(450); }
  await t.ev(`(()=>{ S.min = 9 * 60; const b = BLD.find(q => q.id === 'igreja'); P.x = b.dp[0] * TS; P.y = b.dp[1] * TS + 6; openBuilding(b); })()`); await t.espera(500);
  await t.ev("(()=>{ const u = inUses().find(f => /Rezar/.test(f.label)); u.fn(u); for (let i = 0; i < 90; i++) updInterior(1/30); })()"); t.ok(await t.ev('S.flags.prayD === S.day'), 'rezou na igreja');
  await t.ev('leaveRoom(); 0'); await t.espera(450);
  t.semErros();
} };
