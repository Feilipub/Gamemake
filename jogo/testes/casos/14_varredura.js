// Super varredura: abre todas as telas do jogo e simula 120 dias procurando erros e estados quebrados.
module.exports = { nome: 'Varredura geral: todas as telas, 120 dias e saves', tempo: 400, async rodar(t) {
  await t.abrir({ ajustes: { view: '2d', cenas: false } }); await t.jogoNovo();
  await t.ev('toast = () => {}; S.cash += 500000; 0');
  const r = JSON.parse(await t.ev(`(()=>{ const falhas = [], tenta = (nome, fn) => { try { fn(); if (M.open) renderModal(); } catch (e) { falhas.push(nome + ': ' + e.message); } };
    const abas = () => (M.tabs || []).map(x => x[0]);
    const percorre = nome => { for (const k of abas()) tenta(nome + ' › ' + k, () => A.tab(k)); };
    // menu principal
    tenta('menu', () => openMenu('jor')); percorre('menu'); closeModal();
    // lojas e prédios
    for (const b of BLD) { tenta('prédio ' + b.id, () => openBuilding(b)); percorre('prédio ' + b.id); closeModal(); }
    for (const [n, f] of [['agro', openAgro], ['mercadinho', openMercadinho], ['banco', () => openBank(false)], ['caixa 24h', () => openBank(true)], ['bar', openBar], ['açougue', openAcougue], ['pedreiro', openPedreiro], ['bené', openBene], ['casa', openHouse], ['galpão', openGalpao], ['depósito', openDeposito], ['fogueira', openFire], ['calendário', openCalendar], ['mochila', openBag], ['ferramentas', openFerramentas], ['máquina', openMachine], ['baú do avô', openBauAvo], ['igreja', openIgreja], ['churrasqueira', openChurras], ['fogão', openFogao], ['cama', openCama], ['estábulo', openEstabulo], ['carroça', openCart], ['balança', openBalanca], ['brete', openBrete], ['embarque', openEmbarque], ['quadro', openBoard], ['ajuda', showHelp], ['opções', showOptions]]) { if (typeof f !== 'function') { falhas.push('tela ausente: ' + n); continue; } tenta(n, f); percorre(n); closeModal(); }
    for (const k in LOTS) { tenta('lote ' + k, () => openLot(k)); closeModal(); }
    TROUGHS.forEach((tr, i) => { tenta('cocho ' + i, () => openTrough(i)); closeModal(); });
    for (const k in EXP) { tenta('placa ' + k, () => openSign(k)); closeModal(); }
    for (const q of agroPlots()) { tenta('canteiro ' + q.id, () => openPlot(q.id)); closeModal(); }
    // moradores: conversa, prosa, presente, negócio e história
    for (const id in NPCDEF) { tenta('morador ' + id, () => { openNpc(id); A.npcTalk(); A.npcGift && A.npcGift(); M.sub = null; A.npcProsa && A.npcProsa(); M.sub = null; renderModal(); if (NPCDEF[id].sells && A.npcTrade) { A.npcTrade(); M.sub = null; } if (HIST[id]) { A.histOpen(id); M.sub = null; } renderModal(); }); closeModal(); }
    // eventos
    for (const k in EVENTS) { tenta('evento ' + k, () => openEventDesk(k)); closeModal(); }
    // fichas de todas as espécies com todos os painéis
    for (const [sp, br, o] of [['boi', 'nelore', { sex: 'F', age: 40 }], ['boi', 'gir', { sex: 'M', age: 3 }], ['cavalo', 'mm', { sex: 'F', age: 50 }], ['cavalo', 'crioulo', { sex: 'M', age: 40 }], ['burro', 'marchador', { age: 40 }], ['jumento', 'nordestino', { age: 40 }], ['cabra', 'saanen', { age: 20 }], ['galinha', 'caipira', {}], ['cao', 'caramelo', { age: 30 }]]) {
      tenta('ficha ' + sp + '/' + br, () => { const a = mkAnimal(sp, br, o); a.own = 'player'; a.x = P.x + 20; a.y = P.y; S.animals.push(a); openSheet(a); for (const sub of [null, 'custom', 'manejo', 'cobrir', 'ia']) { SH.sub = sub; renderSheet(); } closeSheet(); }); }
    // guarda-roupa
    tenta('guarda-roupa', () => { openSetup(true); for (let i = 0; i < 2; i++) { setStep = i; renderSetup(); } $('setup').style.display = 'none'; document.body.classList.remove('ovl'); paused = false; });
    return JSON.stringify(falhas); })()`));
  t.ok(r.length === 0, 'todas as telas abrem sem erro' + (r.length ? ':\n    ' + r.slice(0, 12).join('\n    ') : ''));
  // cada raça precisa de um desenho da espécie certa (o Campeiro já usou o desenho do cão Buldogue Campeiro)
  const rac = JSON.parse(await t.ev(`(()=>{ const bad = []; const chk = (sp, br, sex, tipo) => { const k = rigBreedKey(sp, br, sex), b = RIG.BR[k]; if (!b) bad.push(sp + '/' + br + ': sem desenho'); else if (tipo && b.t !== tipo) bad.push(sp + '/' + br + ' desenhado como ' + b.t); };
    for (const br of MOUNT_BREEDS.cavalo) for (const sx of ['M', 'F']) chk('cavalo', br, sx, 'equino');
    for (const br of MOUNT_BREEDS.muar) for (const sx of ['M', 'F']) chk('burro', br, sx, 'equino');
    for (const br of MOUNT_BREEDS.jegue) chk('jumento', br, 'M', 'equino');
    for (const br in DOGS) chk('cao', br, 'M', 'canino');
    for (const br in CATTLE) chk('boi', br, 'M', null);
    return JSON.stringify(bad); })()`));
  t.ok(rac.length === 0, 'toda raça tem desenho da espécie certa' + (rac.length ? ':\n    ' + rac.join('\n    ') : ''));
  // 120 dias de simulação com checagem de estado
  const sim = JSON.parse(await t.ev(`(()=>{ const prob = [], bad = v => typeof v === 'number' && !isFinite(v);
    for (let d = 0; d < 120; d++) {
      try { for (let h = 6; h < 24; h++) { S.min = h * 60; hourTick(h); } dayTick(); cattleTick(1); for (let i = 0; i < 20; i++) tick(1/30); } catch (e) { prob.push('dia ' + S.day + ': ' + e.message); break; }
      for (const k of ['cash', 'acct', 'sav', 'res', 'score', 'arroba']) if (bad(S[k])) prob.push('dia ' + S.day + ' S.' + k + ' = ' + S[k]);
      for (const k of ['en', 'fo', 'x', 'y']) if (bad(P[k])) prob.push('dia ' + S.day + ' P.' + k + ' quebrado');
      for (const a of S.animals) { for (const k of ['x', 'y', 'hp', 'food', 'water', 'age', 'wt']) if (bad(a[k])) { prob.push('dia ' + S.day + ' animal ' + a.n + '.' + k + ' = ' + a[k]); break; } if (a.own === 'player' && (a.x < -50 || a.y < -50 || a.x > WPX + 50 || a.y > HPX + 50)) prob.push('animal fora do mapa: ' + a.n); }
      for (const k in S.inv) if (S.inv[k] < 0 || bad(S.inv[k])) prob.push('mochila ' + k + ' = ' + S.inv[k]);
      const ids = S.animals.map(a => a.id); if (new Set(ids).size !== ids.length) prob.push('dia ' + S.day + ': ids de animais repetidos');
      if (d % 30 === 29) { try { const o = JSON.parse(SAVE.serialize()); SAVE.apply(o, SAVE_V); mode = 'play'; } catch (e) { prob.push('save no dia ' + S.day + ': ' + e.message); } }
      if (prob.length > 15) break;
    }
    return JSON.stringify({ prob: [...new Set(prob)].slice(0, 15), dia: S.day, animais: S.animals.length }); })()`));
  t.ok(sim.prob.length === 0, '120 dias simulados sem estado quebrado (dia ' + sim.dia + ', ' + sim.animais + ' animais)' + (sim.prob.length ? ':\n    ' + sim.prob.join('\n    ') : ''));
  t.semErros();
} };
