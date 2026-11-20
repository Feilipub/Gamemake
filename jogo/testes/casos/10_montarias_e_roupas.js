module.exports = { nome: 'Haras, andamento, arreio, cangalha, roupas e espinhos', tempo: 200, async rodar(t) {
  await t.abrir(); await t.jogoNovo();
  const g = JSON.parse(await t.ev(`(()=>{ const out = {}; let cruz = 0; for (let i = 0; i < 40; i++) { const m = mkAnimal('cavalo', 'mm', { sex: 'F', age: 50, coat: 'alazao', mk: mkEnc(1, 3, 0) }); m.own = 'player'; S.animals.push(m); const s = HARAS_G[4]; Object.assign(m, { _paiN: s.n, _paiSp: 'cavalo', _paiBr: s.br, _paiGen: 90, _paiCoat: s.coat, _paiMk: s.mk, _paiAnd: 30 }); const f = birthCalf(m); out[f.coat] = (out[f.coat] || 0) + 1; if (f.cruz) cruz++; S.animals = S.animals.filter(x => x !== m && x !== f); } return JSON.stringify({ mae: out.alazao || 0, pai: out.pampaOveroPreto || 0, cruz }); })()`));
  t.ok(g.mae > 8 && g.pai > 8, 'os potros herdam a pelagem da mãe e do pai (' + g.mae + ' / ' + g.pai + ' de 40)'); t.igual(g.cruz, 40, 'cruzamento de raças diferentes vira mestiço');
  const v = JSON.parse(await t.ev('(()=>{ const h = tutHorse(); const g = gaitOf(h); g.nv = 0; const v0 = horseStats(h).B.v[0]; g.nv = 100; return JSON.stringify([v0, horseStats(h).B.v[0]]); })()'));
  t.ok(v[1] > v[0] * 1.05, 'andamento treinado deixa a montaria mais rápida sem galope');
  const c = await t.ev("(()=>{ const j = mkAnimal('jumento', 'nordestino', { age: 40 }); j.own = 'player'; j.x = P.x + 20; j.y = P.y; j._st = 'follow'; S.animals.push(j); const c0 = invCapNow(); j.cang = 1; return invCapNow() - c0; })()");
  t.igual(c, 40, 'a cangalha com caçuás aumenta a carga em 40');
  t.ok(!(await t.ev("wOk('hat', 11)")), 'roupas da loja começam trancadas'); await t.ev("S.cash += 2000; A.wbuy('hat:11'); 0"); t.ok(await t.ev("wOk('hat', 11)"), 'comprar na selaria libera a roupa');
  await t.ev('S.flags.sjoao = 1; 0'); t.ok(await t.ev("wOk('shirt', 5)"), 'dançar a quadrilha libera a roupa junina');
  await t.ev("(()=>{ const h = tutHorse(); h.saddle = 'nord'; h.cust = Object.assign(defCust(), { pel: '#efe6d6', bord: true, cab: 'enf', guiz: true, peit: true }); h.marca = 'ZG'; })()");
  const k = await t.ev('(()=>{ const o = rigOpts(tutHorse(), 1); return [o.pel, o.bord, o.cab, o.guiz, o.brand].join(","); })()'); t.igual(k, '#efe6d6,true,enf,true,ZG', 'o arreio completo e a marca vão para o desenho do cavalo');
  await t.ev("P.mnt = null; S.cf.ap.pants = 0; P.x = 150*TS; P.y = 112*TS; P.en = 80; 0"); await t.p.keyboard.down('KeyD'); await t.ate('P.en < 80', 8000); await t.p.keyboard.up('KeyD');
  t.ok((await t.ev('P.en')) < 80, 'os espinhos da caatinga cansam sem o traje de couro');
  await t.ev('S.cf.ap = Object.assign(S.cf.ap, { hat: 0, shirt: 2, pants: 3, gear: 1, gl: 1 }); P.en = 80; 0'); await t.p.keyboard.down('KeyA'); await t.espera(3000); await t.p.keyboard.up('KeyA');
  t.igual(await t.ev('P.en'), 80, 'com o traje de couro completo os espinhos não cansam');
  t.semErros();
} };
