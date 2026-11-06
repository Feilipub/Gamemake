// v7.8: avisos um por vez, painel Início, dicas na hora certa, retratos com expressão, desafios do ano e ranking
module.exports = { nome: 'Avisos em fila, painel Início, dicas, retratos e desafios do ano', async rodar(t) {
  await t.abrir({ ajustes: { view: '2d', cenas: false } }); await t.jogoNovo();
  // avisos
  await t.ev("NOTIF.q.length = 0; for (let i = 0; i < 8; i++) toast('Aviso de rotina ' + i); 0");
  t.ok(await t.ev('NOTIF.vis.length <= 2 && NOTIF.q.length <= 3'), 'no máximo 2 avisos na tela e uma fila curta');
  t.ok(await t.ev('NOTIF.unread > 0 && !!document.querySelector("#br .nbad")'), 'os avisos que sobram vão para a central e o botão Menu mostra a contagem');
  await t.ev("toast('A onça atacou uma cabra!'); 0"); t.ok(await t.ev("NOTIF.vis.some(o => o.u) || NOTIF.q[0].u"), 'aviso urgente passa na frente da fila');
  // painel Início
  await t.ev('openMenu(); 0'); t.igual(await t.ev('M.tab'), 'ini', 'o Menu abre no painel Início');
  t.ok(await t.ev("document.querySelectorAll('#mc .icard').length >= 6 && document.getElementById('mc').textContent.includes('Precisa de atenção')"), 'o Início mostra cartões com ícones e o que precisa de atenção');
  t.igual(await t.ev('NOTIF.unread'), 0, 'abrir o Menu zera a contagem de avisos');
  await t.ev("S.animals.find(a => a.own === 'player' && a.sp === 'boi').sick = 1; renderModal(); 0");
  t.ok(await t.ev("document.getElementById('mc').textContent.includes('doente')"), 'animal doente aparece no painel');
  // desafios e ranking
  await t.ev("A.tab('jor'); 0"); t.ok(await t.ev("document.getElementById('mc').textContent.includes('Desafios do ano') && document.getElementById('mc').textContent.includes('Ranking dos criadores')"), 'a Jornada mostra os Desafios do ano e o Ranking');
  await t.ev('closeModal(); 0');
  t.igual(await t.ev('desState().list.length'), 4, 'quatro desafios por ano');
  const k = await t.ev('desState().list[0]'), c0 = await t.ev('S.cash + S.acct');
  await t.ev(`const D = desState(), d = DESAFIOS.find(x => x[0] === '${k}'); if (d[4] === 'abs') { for (let i = 0; i < 25; i++) S.animals.push(mkAnimal('boi', null, { own: 'player', age: 20 })); } else D.base['${k}'] = d[2]() - d[3]; desTick(); 0`);
  t.ok(await t.ev(`!!desState().done['${k}'] && S.prest >= 1`), 'cumprir um desafio marca como feito e dá fama');
  t.ok((await t.ev('S.cash + S.acct')) > c0, 'o desafio paga prêmio');
  t.ok(await t.ev("rankList().length === Object.keys(FARMS).length + 1 && rankList().some(x => x.k === 'me')"), 'o ranking lista as fazendas da região e a sua');
  // dicas
  await t.ev("S.flags.tip_doente = 0; tipLast = -99; tipAcc = 5; M.open = false; tipTick(0.1); 0");
  t.ok(await t.ev("document.getElementById('tipC') && document.getElementById('tipC').classList.contains('on')"), 'a dica aparece na hora certa');
  t.ok(await t.ev("!!S.flags.tip_doente || Object.keys(S.flags).some(k => k.startsWith('tip_') && S.flags[k])"), 'a dica fica marcada para não repetir');
  // retratos
  t.ok(await t.ev("bustCanvas(S.cf.ap, 'bravo') !== bustCanvas(S.cf.ap, 'feliz')"), 'o retrato muda com a expressão');
  t.igual(await t.ev("moodOf('felipe', 'Que bom te ver, seja bem-vindo!')"), 'feliz', 'fala alegre dá rosto feliz');
  t.igual(await t.ev("moodOf('felipe', 'Que saudade do seu avô...')"), 'triste', 'fala triste dá rosto triste');
  await t.ev("openNpc('felipe', 'Cuidado com os ladrões de gado!'); 0"); t.ok(await t.ev("!!document.querySelector('#mc .bust img')"), 'o diálogo mostra o retrato grande'); await t.ev('closeModal(); 0');
  t.semErros();
} };
