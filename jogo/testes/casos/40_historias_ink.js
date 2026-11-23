// v15: histórias com escolhas em ink (inkjs): capítulos por morador, recompensas, save e história do próprio jogador
module.exports = { nome: 'Histórias em ink: capítulos, escolhas, recompensas, save e história do jogador', async rodar(t) {
  await t.abrir({ ajustes: { view: '2d', cenas: false } }); await t.jogoNovo();
  t.ok(await t.ev("typeof inkjs !== 'undefined' && !!inkStory('b') && inkAvail('zefa') === 'b' && inkAvail('bene') === 'b'"), 'o ink carregou e Dona Zefa e Seu Bené têm história');
  t.ok(await t.ev("(() => { openNpc('zefa'); const ok = /data-a=.npcInk./.test($('mn').innerHTML); closeModal(); return ok; })()"), 'o botão História aparece na conversa');
  // capítulo 1 da Zefa: emprestar R$ 300
  const r1 = await t.ev("(() => { S.cash = 5000; const fr0 = npcState('zefa').fr, m0 = S.cash + S.acct; openNpc('zefa'); A.npcInk(); const txt = $('mn').innerHTML; const ok1 = /fiado/.test(txt) && INK.st.b.currentChoices.length === 3; A.inkPick(0); const ok2 = INK.end && Math.round(m0 - S.cash - S.acct) === 300 && npcState('zefa').fr > fr0; A.inkBack(); closeModal(); return [ok1, ok2, inkAvail('zefa')]; })()");
  t.ok(r1[0] && r1[1], 'o capítulo mostra o texto, as 3 escolhas e cobra o empréstimo ' + JSON.stringify(r1));
  t.ok(r1[2] === null, 'o próximo capítulo só vem dias depois');
  // save guarda o progresso das histórias
  const r2 = await t.ev("(() => { const o = JSON.parse(SAVE.serialize()); SAVE.apply(o); const s = inkStory('b'); return [s.variablesState.zefa_cap, s.variablesState.zefa_ajudou, inkAvail('zefa')]; })()");
  t.ok(r2[0] === 1 && r2[1] === true && r2[2] === null, 'o progresso volta depois de salvar e carregar ' + JSON.stringify(r2));
  // capítulos seguintes e devolução do dinheiro
  const r3 = await t.ev("(() => { const m0 = S.cash + S.acct; for (let k = 0; k < 2; k++) { S.day += 5; if (inkAvail('zefa') !== 'b') return 'sem capítulo ' + k; openNpc('zefa'); A.npcInk(); let g = 0; while (!INK.end && g++ < 5) A.inkPick(0); closeModal(); } return [inkStory('b').variablesState.zefa_cap, Math.round(S.cash + S.acct - m0), inkAvail('zefa')]; })()");
  t.ok(Array.isArray(r3) && r3[0] === 3 && r3[1] === 400 && r3[2] === null, 'a história termina e a Zefa devolve R$ 400 ' + JSON.stringify(r3));
  // história do jogador
  const r4 = await t.ev("(() => { const ok = inkSetUser(INK_MODELO); const a = inkAvail('dito'); openNpc('dito'); A.npcInk(); const txt = $('mn').innerHTML; A.inkPick(1); const fim = INK.end; closeModal(); return [ok, a, /rapadura/.test(txt), fim, inkAvail('dito')]; })()");
  t.ok(r4[0] && r4[1] === 'u' && r4[2] && r4[3] && r4[4] === null, 'a história do jogador (modelo) carrega e funciona com o Seu Dito ' + JSON.stringify(r4));
  t.ok(await t.ev("(() => { const ok = inkSetUser('=== dito ===\\nOi {nome(}\\n-> END'); return !ok && INK.err && INK.err.length > 0; })()"), 'história com erro mostra o erro e não quebra o jogo');
  await t.ev("A.inkDel(); 0");
  t.ok(await t.ev("(() => { cfgHTML; const h = inkCfgHTML(); return /Baixar modelo/.test(h); })()"), 'Configurações têm a parte de Histórias');
  t.semErros();
} };
