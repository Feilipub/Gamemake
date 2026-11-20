module.exports = { nome: 'Gado: 30 dias de lida, brete e parto', tempo: 180, async rodar(t) {
  await t.abrir(); await t.jogoNovo();
  await t.ev(`(()=>{ S.cash += 200000; const add = (br, o) => { const a = mkAnimal('boi', br, o); const q = randIn('p1'); a.x = q[0]; a.y = q[1]; S.animals.push(a); return a; };
    add('nelore', { sex:'M', age:40, n:'Sultão' }); for (let i = 0; i < 8; i++) add(pick(['nelore','gir','girolando','caracu']), { sex:'F', age: rint(24, 60) }); for (let i = 0; i < 5; i++) add('nelore', { sex: i % 2 ? 'M' : 'F', age: rint(4, 10) });
    Object.assign(S.inv, { pouron: 30, vermifugo: 30, vacRaiva: 30, brinco: 30, iodo: 10, mataBicheira: 5, vacina: 30, remedio: 10 }); return 0; })()`);
  const n0 = await t.ev("myAnimals('boi').length");
  const r = JSON.parse(await t.ev("(()=>{ for (let d = 0; d < 30; d++) { dayTick(); cattleTick(1); } const L = myAnimals('boi'); return JSON.stringify({ n: L.length, born: S.stats.born }); })()"));
  t.ok(r.n >= n0 - 6, '30 dias depois o rebanho segue de pé (' + n0 + ' → ' + r.n + ')'); t.ok(r.born >= 1, 'nasceram bezerros (' + r.born + ')');
  const b = JSON.parse(await t.ev("(()=>{ const L = myAnimals('boi'); L.forEach(a => { const q = randIn('curral'); a.x = q[0]; a.y = q[1]; a.area = 'curral'; }); for (const k of ['pouron','verm','vac','raiva','brinco']) A.brt(k); return JSON.stringify({ brinco: L.filter(a => a.brinco).length, n: L.length }); })()"));
  t.ok(b.brinco >= b.n - 2, 'o brete pôs brinco no lote inteiro (' + b.brinco + '/' + b.n + ')');
  const p = await t.ev("(()=>{ const cow = myAnimals('boi').find(a => a.sex === 'F' && a.age >= 24); cow.labor = tnow() + 300; openSheet(cow); const ok = document.getElementById('ap').innerHTML.includes('Ajudar no parto'); finishLabor(cow, true); closeSheet(); return ok + ',' + myAnimals('boi').filter(a => a.maeId === cow.id).length; })()");
  t.ok(p.startsWith('true,') && +p.split(',')[1] >= 1, 'ajudar no parto difícil faz nascer o bezerro');
  t.semErros();
} };
