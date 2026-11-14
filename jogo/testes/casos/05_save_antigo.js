const fs = require('fs'), path = require('path');
module.exports = { nome: 'Save de versão antiga continua abrindo', async rodar(t) {
  const fx = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'save_antigo.json'), 'utf8'));
  await t.abrir(); await t.p.evaluate(d => { window.__old = d; }, fx.data);
  const r = await t.ev(`(()=>{ const o = JSON.parse(window.__old); SAVE.apply(o, ${fx.saveV}); startPlay(false); return JSON.stringify({ dia: S.day, cash: S.cash, pesca: !!S.pesca, conq: !!S.conq || true, mode }); })()`); const o = JSON.parse(r);
  t.igual(o.dia, 30, 'o dia do save antigo (v' + fx.versao + ') foi mantido'); t.igual(o.cash, 4321, 'o dinheiro do save antigo foi mantido');
  t.ok(o.pesca, 'os sistemas novos foram criados no save antigo');
  await t.espera(1500); await t.ev('(()=>{ for (let i = 0; i < 300; i++) { input.x = 0; input.y = 1; tick(1/30); } input.y = 0; })()'); await t.espera(2500);
  t.ok(['play', 'cs'].includes(await t.ev('mode')), 'o jogo roda depois de carregar o save antigo');
  t.semErros();
} };
