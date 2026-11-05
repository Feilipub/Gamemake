module.exports = { nome: 'Controle de videogame na tela inicial, na criação e nos menus', async rodar(t) {
  await t.abrir({ antes: () => { window.__pad = { axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) }; navigator.getGamepads = () => [Object.assign({ connected: true, id: 'teste' }, window.__pad)]; } });
  const btn = async (i, ms = 160) => { await t.p.evaluate(i => { window.__pad.buttons[i] = { pressed: true, value: 1 }; }, i); await t.espera(ms); await t.p.evaluate(i => { window.__pad.buttons[i] = { pressed: false, value: 0 }; }, i); await t.espera(200); };
  const foco = () => t.p.evaluate(() => { const f = document.querySelector('.padf'); return f ? (f.dataset.t || f.dataset.s || f.dataset.a || '') + ':' + f.textContent.trim().slice(0, 20) : ''; });
  await t.espera(1200); t.igual(await t.ev('mode'), 'title', 'começa na tela de título');
  await btn(13); const f1 = await foco(); t.ok(f1.startsWith('new:'), 'o direcional destaca o primeiro botão (' + f1 + ')');
  await btn(13); await btn(13); const f2 = await foco(); t.ok(f2 && f2 !== f1, 'descer o direcional muda o botão destacado (' + f2 + ')');
  await btn(12); await btn(12); t.ok((await foco()).startsWith('new:'), 'subir volta ao Novo jogo');
  await btn(0); await t.espera(400); t.ok(await t.p.evaluate(() => document.getElementById('setup').style.display !== 'none'), 'A abre a criação do vaqueiro');
  await btn(13); await btn(15); const f3 = await foco(); t.ok(!!f3, 'dá para navegar pelos botões da criação (' + f3 + ')');
  await btn(1); await t.espera(400); t.ok(await t.p.evaluate(() => document.getElementById('setup').style.display === 'none'), 'B volta da criação para o título');
  await t.ev('newGame(defaultCF())'); await t.espera(1500); t.igual(await t.ev('mode'), 'cs', 'a abertura começa');
  await btn(9); await t.espera(600); await t.pularCenas(); await t.ev('tutEnd(true); 0');
  await btn(9); await t.espera(300); t.ok(await t.ev('M.open'), 'Start abre o menu e ele continua aberto');
  await btn(15); await btn(15); await btn(0); await t.espera(300); t.ok(await t.ev("M.tab !== 'vaq'"), 'direcional e A trocam a aba do menu (' + (await t.ev('M.tab')) + ')');
  await btn(1); await t.espera(200); t.ok(!(await t.ev('M.open')), 'B fecha o menu');
  t.semErros();
} };
