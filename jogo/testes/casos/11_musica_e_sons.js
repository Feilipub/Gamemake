module.exports = { nome: 'Trilha 8-bit e efeitos sonoros', async rodar(t) {
  await t.abrir(); await t.ev('AU.init && AU.init(); MUS.unlocked = true; 0'); await t.espera(800);
  const temas = await t.ev('Object.keys(THEMES).length'); t.ok(temas >= 10, 'há ' + temas + ' temas musicais');
  const r = await t.ev(`(()=>{ const bad = []; for (const k of Object.keys(THEMES)) { try { MUS.preview(k); for (let i = 0; i < 40; i++) MUS.update(0.05); } catch (e) { bad.push(k + ':' + e.message); } } for (const k of ['open','close','blip','coin','pay','bell','cigarra','sapo','thunder','fire']) { try { SFX[k](); } catch (e) { bad.push(k + ':' + e.message); } } try { SFX.fanfare(true); } catch (e) { bad.push('fanfare'); } return bad.join(' | '); })()`);
  t.igual(r, '', 'todos os temas e efeitos tocam sem erro');
  await t.jogoNovo(); await t.espera(1000); t.ok(!!(await t.ev('MUS.cur')), 'durante o jogo há um tema tocando (' + (await t.ev('MUS.cur')) + ')');
  t.semErros();
} };
