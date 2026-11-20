// v16.2: integração com o app Android — botão voltar fecha o que estiver aberto; arquivos vão para o plugin nativo LidaApp
module.exports = { nome: 'App Android: botão voltar e salvar arquivos pelo plugin nativo', async rodar(t) {
  await t.abrir({ ajustes: { view: '2d', cenas: false } });
  t.ok(await t.ev("window.lidaVoltar() === false"), 'na tela inicial o voltar deixa o app ir para segundo plano');
  await t.jogoNovo();
  t.ok(await t.ev("(() => { openMenu(); const a = M.open; const r = window.lidaVoltar(); return a && r && !M.open; })()"), 'voltar fecha o menu aberto');
  t.ok(await t.ev("(() => { closeModal(); const r = window.lidaVoltar(); const ok = r && M.open; closeModal(); return ok; })()"), 'voltar no jogo abre o menu (não fecha o app)');
  // simula o app nativo (Capacitor) e confere que o save exportado vai para o plugin
  const r = await t.ev("(async () => { const got = []; window.Capacitor = { isNativePlatform: () => true, Plugins: { LidaApp: { salvar: async o => { got.push(o); return { onde: 'Downloads/Lida no Sertao' }; } } } }; await SAVEFILE.exportCur(); A.inkModelo(); await new Promise(r => setTimeout(r, 200)); delete window.Capacitor; return got.map(o => [o.nome, o.mime, o.texto.length > 10]); })()");
  t.ok(Array.isArray(r) && r.length === 2 && /\.json$/.test(r[0][0]) && r[0][1] === 'application/json' && r[0][2] && r[1][0] === 'minha_historia.ink', 'save exportado e modelo de história vão para o plugin do app ' + JSON.stringify(r));
  t.ok(await t.ev("appNativo() === false"), 'no navegador continua o download normal');
  t.semErros();
} };
