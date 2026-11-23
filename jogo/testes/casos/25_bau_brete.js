// v7.5: compras vão direto para o Baú do brete (veterinária) e o Depósito (trato); brete, cocho e peões usam de lá
module.exports = { nome: 'Baú do brete, depósito direto e mochila organizada', async rodar(t) {
  await t.abrir({ ajustes: { view: '2d', cenas: false } }); await t.jogoNovo();
  t.ok(await t.ev("PROPS.some(p => p.t === 'bauBrete')"), 'o Baú do brete está no mapa, ao lado do brete');
  await t.ev('S.cash += 20000; S.inv.vacina = 0; 0');
  await t.ev("buyItem('vacina', 20, 'bret'); 0"); t.igual(await t.ev('S.bret.vacina'), 20, 'vacinas compradas vão direto para o Baú do brete');
  const r0 = await t.ev('S.dep.racao || 0'); await t.ev("buyItem('racao', 5, 'dep'); 0"); t.igual(Math.round(await t.ev('S.dep.racao')), Math.round(r0 + 125), 'ração comprada vai direto para o Depósito (5 sacos = 125 kg)');
  t.ok(await t.ev("shopRow('vacina').includes('baú do brete') && shopRow('racao').includes('depósito')"), 'a loja mostra para onde cada compra vai');
  // usar sem estar na mochila
  t.ok(await t.ev("has('vacina') && !(S.inv.vacina > 0)"), 'a vacina conta como disponível mesmo fora da mochila');
  await t.ev("const a = myAnimals('boi')[0]; a.area = 'curral'; a.vacc = 0; const p = randIn('curral'); a.x = p[0]; a.y = p[1]; A.tronVac(); 0");
  t.ok(await t.ev("S.bret.vacina < 20"), 'a vacinação do brete tira as vacinas do baú');
  const d0 = await t.ev('S.dep.racao'); t.ok(await t.ev("useInv('racao')") && (await t.ev('S.dep.racao')) < d0, 'o cocho de trato pega ração do depósito quando falta na mochila');
  // guardar o que é da fazenda
  await t.ev("S.inv.remedio = 3; S.inv.sal = 2; guardarFazenda(); 0");
  t.ok(await t.ev("!S.inv.remedio && !S.inv.sal && S.bret.remedio === 3"), 'guardar o que é da fazenda leva remédio para o baú e sal para o depósito');
  await t.ev("openBag(); 0"); t.ok(await t.ev("document.getElementById('mc').textContent.includes('Baú do brete')"), 'a mochila mostra o depósito e o baú do brete'); await t.ev('closeModal(); openBret(); 0');
  t.ok(await t.ev("document.getElementById('mc').textContent.includes('Remédio')"), 'o baú do brete lista o que tem dentro'); await t.ev('closeModal(); 0');
  t.semErros();
} };
