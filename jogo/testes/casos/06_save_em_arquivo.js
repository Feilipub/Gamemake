const path = require('path'), fs = require('fs'), { SAIDA } = require('../lib');
module.exports = { nome: 'Baixar e carregar o save em arquivo', async rodar(t) {
  await t.abrir({ downloads: true }); await t.jogoNovo(); await t.ev("S.cash = 12345; S.cf.name = 'Zé Teste'; 0");
  const [dl] = await Promise.all([t.p.waitForEvent('download'), t.ev('SAVEFILE.exportCur(); 0')]); fs.mkdirSync(SAIDA, { recursive: true });
  const arq = path.join(SAIDA, 'save_teste.json'); await dl.saveAs(arq); t.ok(/lida-no-sertao_Ze_Teste_dia\d+\.json/.test(dl.suggestedFilename()), 'o arquivo do save foi baixado com nome certo');
  await t.ev('S.cash = 1; 0'); const [fc] = await Promise.all([t.p.waitForEvent('filechooser'), t.ev('A.savImp(2); 0')]); await fc.setFiles(arq); await t.espera(800);
  await t.ate('SAVE.candidates(2).then(c => c.length > 0)', 8000); await t.ev('SAVE.loadBest(2); 0'); await t.ate('S.cash === 12345', 10000); t.igual(await t.ev('S.cash'), 12345, 'o save carregado do arquivo volta com o dinheiro certo');
  fs.writeFileSync(arq + '.ruim', '{"rec":{"data":"{}","sum":"x"}}'); const [fc2] = await Promise.all([t.p.waitForEvent('filechooser'), t.ev('A.savImp(3); 0')]); await fc2.setFiles(arq + '.ruim'); await t.espera(500);
  t.igual(await t.ev('SAVE.candidates(3).then(c => c.length)'), 0, 'arquivo inválido é recusado');
  t.semErros();
} };
