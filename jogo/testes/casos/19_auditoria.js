// Regressões da auditoria de bugs: save guarda o pai da cria, ITR atrasado, sinuca, saves antigos e cenas dentro de prédio
module.exports = { nome: 'Auditoria: pai da cria no save, ITR, sinuca, fogueira em save antigo', async rodar(t) {
  await t.abrir({ ajustes: { view: '2d', cenas: false } }); await t.jogoNovo();
  // o pai da cria sobrevive ao salvar e carregar
  await t.ev("const v = estrela() || myAnimals('boi').find(a => a.sex === 'F'); v.preg = 5; v._paiBr = 'nelore'; v._paiN = 'Imperador'; v._cobD = S.day; window.__vid = v.id; window.__sv = SAVE.serialize(); 0");
  await t.ev("SAVE.apply(JSON.parse(window.__sv)); 0"); await t.espera(800);
  t.igual(await t.ev("byId(window.__vid)._paiBr"), 'nelore', 'a raça do pai da cria continua depois de carregar o save');
  t.igual(await t.ev("byId(window.__vid)._cobD"), await t.ev('S.day'), 'o limite de cobertura do dia continua no save');
  t.ok(await t.ev("JSON.parse(SAVE.serialize()).animals.every(a => a._st === undefined)"), 'campos temporários (_st) continuam fora do save');
  // ITR atrasado entra no boleto do ano seguinte
  const v = await t.ev("S.itr = { y: -1, v: 1000, due: 1, paid: 0, late: 1 }; let d = S.day; while (!(calDate(d).m === 7 && calDate(d).d === 1)) d++; S.day = d; custosDay(); S.itr.v");
  t.ok(v > 1000, 'o ITR atrasado não some quando chega o boleto novo (' + v + ')');
  // sinuca tem limite diário
  await t.ev("S.cash += 500; window.__n = 0; for (let i = 0; i < 8; i++) { const c0 = S.cash; sinuca(); if (S.cash < c0) window.__n++; P._act = null; SN.on = false; closeModal(); } 0");
  t.igual(await t.ev('window.__n'), 5, 'a sinuca aceita só 5 partidas valendo por dia');
  // save antigo (sem parto) ganha a fogueira e o baú
  await t.ev("S.story = { intro: 1, mem: {}, seen: {} }; delete S.bau; S.min = 19 * 60; 0");
  t.ok(await t.ate("CS.on || !!S.bau", 20000), 'save antigo também ganha a fogueira e o mistério do baú');
  t.semErros();
} };
