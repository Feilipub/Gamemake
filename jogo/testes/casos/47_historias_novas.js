// v19: histórias novas em ink — Seu Tonho, Dona Lúcia, Dra. Clara, Professora Helena, Seu Cícero e Dona Graça
module.exports = { nome: 'Histórias novas: Tonho, Lúcia, Clara, Helena, Cícero e Graça', tempo: 240, async rodar(t) {
  await t.abrir({ ajustes: { view: '2d', cenas: false } }); await t.jogoNovo(); await t.ev('toast = () => {}; S.cash = 20000; 0');
  const caps = { tonho: 3, lucia: 2, clara: 2, helena: 2, cicero: 2, graca: 2 };
  for (const id in caps) {
    const r = JSON.parse(await t.ev(`(() => { const out = []; for (let k = 0; k < ${caps[id]}; k++) { S.day += 7; const w = inkAvail('${id}'); if (w !== 'b') return JSON.stringify({ erro: 'sem capítulo ' + (k + 1), out }); openNpc('${id}'); A.npcInk(); const txt = $('mn').innerHTML; let g = 0; while (!INK.end && g++ < 6) A.inkPick(0); out.push(INK.end && txt.length > 200 && !/erro na história/.test(INK.log.join(' '))); closeModal(); }
      return JSON.stringify({ out, depois: inkAvail('${id}'), cap: inkStory('b').variablesState['${id}_cap'] }); })()`));
    t.ok(!r.erro && r.out.every(Boolean) && r.depois === null && r.cap === caps[id], id + ': ' + caps[id] + ' capítulos jogados até o fim ' + JSON.stringify(r));
  }
  t.ok(await t.ev("(() => { const s = inkStory('b'); return s.variablesState.tonho_sol === true && s.variablesState.lucia_plano === 2 && s.variablesState.clara_mutirao === true; })()"), 'as escolhas ficam guardadas na história');
  t.semErros();
} };
