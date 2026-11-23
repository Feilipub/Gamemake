// v19: mercado online — de volta ao próprio jogo, os animais comprados chegam, os vendidos vão embora e as compras são descontadas
module.exports = { nome: 'Mercado online: volta para o próprio jogo', async rodar(t) {
  await t.abrir({ ajustes: { view: '2d', cenas: false } }); await t.jogoNovo(); await t.ev('toast = () => {}; 0');
  const r = JSON.parse(await t.ev(`(async () => { const vend = S.animals.find(a => a.own === 'player' && a.sp === 'boi' && !a.main); const comp = Object.assign(mkAnimal('boi', 'gir', { sex: 'F', age: 24 }), { own: 'player', n: 'Princesa', id: 991 });
    localStorage.setItem('lida_net_compras', JSON.stringify([comp])); localStorage.setItem('lida_net_vendidos', JSON.stringify([vend.id])); localStorage.setItem('lida_net_ganho', JSON.stringify({ v: -500, fz: ['Fazenda do Amigo'] }));
    const c0 = S.cash + S.acct, n0 = S.animals.length; SAVE.apply(JSON.parse(SAVE.serialize())); await new Promise(r => setTimeout(r, 2200));
    return JSON.stringify({ chegou: S.animals.some(a => a.n === 'Princesa' && a.own === 'player' && a.id !== 991 || a.n === 'Princesa'), saiu: !S.animals.some(a => a.id === vend.id), desconto: Math.round(c0 - (S.cash + S.acct)), limpo: !localStorage.getItem('lida_net_compras') && !localStorage.getItem('lida_net_vendidos') && !localStorage.getItem('lida_net_ganho'), idsUnicos: new Set(S.animals.map(a => a.id)).size === S.animals.length }); })()`));
  t.ok(r.chegou && r.saiu, 'o animal comprado chega e o vendido vai embora ' + JSON.stringify(r));
  t.ok(r.desconto === 500 && r.limpo, 'as compras são descontadas e os recados apagados');
  t.ok(r.idsUnicos, 'nenhum animal fica com número repetido');
  t.semErros();
} };
