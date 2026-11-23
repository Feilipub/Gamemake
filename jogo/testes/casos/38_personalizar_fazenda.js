// v12: personalizar a fazenda — nome e placa, enfeites e plantas livres, caminhos, cercas e porteiras; tudo no save
module.exports = { nome: 'Personalizar a fazenda: nome, placa, enfeites, caminhos e cercas', async rodar(t) {
  await t.abrir({ ajustes: { view: '2d', cenas: false } }); await t.jogoNovo();
  await t.ev('S.cash = 30000; tutEnd && tutEnd(true); 0');
  // nome e placa
  t.ok(await t.ev("FN() === 'Boa Esperança' && PROPS.some(p => p.t === 'placaFaz')"), 'fazenda começa Boa Esperança e tem placa na entrada');
  await t.ev("fazSetName('Fazenda Santa Luzia'); S.placa.st = 1; 0");
  t.ok(await t.ev("FN() === 'Santa Luzia' && rankList().some(r => r.n === 'Fazenda Santa Luzia')"), 'nome novo vale no jogo (ranking)');
  t.ok(await t.ev("(() => { const c = placaSpr(); return c.width === 96 && c.getContext('2d').getImageData(0, 0, 96, 72).data.some(v => v > 0); })()"), 'placa desenhada com o nome');
  // enfeite comprado e colocado
  await t.ev("A.fazBuy('ipe'); 0");
  t.ok(await t.ev("S.decoInv.ipe === 1 && S.cash === 30000 - 220"), 'comprou um ipê (R$ 220)');
  const ok1 = await t.ev(`(() => { decoPlace('ipe'); const E = MOVE.edit; if (!E || !E.isNew) return 'sem edição';
    for (let y = 30; y < 44; y++) for (let x = 8; x < 40; x++) if (placeCheck(E.id, x, y).ok) { E.cx = x; E.cy = y; placeConfirm(); return S.deco.length === 1 && obj[gi(x, y)] === 3 && MOV[S.deco[0].id] ? 'ok' : 'falhou'; } return 'sem lugar'; })()`);
  t.ok(ok1 === 'ok', 'ipê colocado num lugar livre e vira obstáculo (' + ok1 + ')');
  // árvore dentro do pasto (sombra para o gado)
  const ok2 = await t.ev(`(() => { A.fazBuy('umbu'); decoPlace('umbu'); const E = MOVE.edit, r = AREAS.p1.r;
    for (let y = r[1] + 2; y < r[3] - 1; y++) for (let x = r[0] + 2; x < r[2] - 1; x++) if (placeCheck(E.id, x, y).ok) { E.cx = x; E.cy = y; placeConfirm(); return areaAt((x + .5) * TS, (y + .5) * TS) === 'p1' ? 'ok' : 'fora'; } placeCancel(); return 'sem lugar'; })()`);
  t.ok(ok2 === 'ok', 'umbuzeiro plantado dentro do pasto (' + ok2 + ')');
  t.ok(await t.ev("(() => { A.fazBuy('banco'); decoPlace('banco'); const E = MOVE.edit, r = AREAS.p1.r; const c = placeCheck(E.id, r[0] + 3, r[1] + 3); placeCancel(); return !c.ok && S.decoInv.banco === 1; })()"), 'banco não entra no pasto e, cancelado, volta guardado');
  t.ok(await t.ev("(() => { const id = S.deco[0].id; decoStore(id); return S.deco.length === 1 && S.decoInv.ipe === 1 && !MOV[id]; })()"), 'guardar tira o enfeite do mapa e devolve para os guardados');
  t.ok(await t.ev("(() => { const c = S.acct + S.cash; A.fazSell('ipe'); return S.decoInv.ipe === 0 && Math.round(S.acct + S.cash - c) === 110; })()"), 'vender devolve metade do preço');
  // caminhos, cerca e porteira
  const tiles = await t.ev(`(() => { const L = []; for (let y = 26; y < 50 && L.length < 6; y++) for (let x = 3; x < 45 && L.length < 6; x++) { if (fzWhyNot(x, y, 'cerca') || fzWhyNot(x + 1, y, 'cerca') || fzWhyNot(x + 2, y, 'cerca') || fzWhyNot(x + 3, y, 'cerca')) continue; if (L.some(([a, b]) => Math.abs(a - x) < 6 && Math.abs(b - y) < 3)) continue; L.push([x, y]); } return L; })()`);
  t.ok(tiles && tiles.length >= 3, 'achou lugares livres para construir');
  const [a, b, c] = tiles;
  await t.ev(`pntStart('pedra'); pntApply(${a[0]}, ${a[1]}); pntApply(${a[0] + 1}, ${a[1]}); 0`);
  t.ok(await t.ev(`ground[gi(${a[0]}, ${a[1]})] === G.WALK && ground[gi(${a[0] + 1}, ${a[1]})] === G.WALK && Object.keys(S.fz.p).length === 2`), 'caminho de pedra pintado (2 casas)');
  await t.ev(`PNT.tool = 'cerca'; pntApply(${b[0]}, ${b[1]}); pntApply(${b[0] + 3}, ${b[1]}); 0`);
  t.ok(await t.ev(`obj[gi(${b[0]}, ${b[1]})] === 1 && S.fz.f.length === 2 && solidT(${b[0]}, ${b[1]}, 'p')`), 'cerca nova bloqueia a passagem');
  await t.ev(`PNT.tool = 'porteira'; pntApply(${b[0] + 1}, ${b[1]}); 0`);
  t.ok(await t.ev(`S.fz.g.length === 1 && obj[gi(${b[0] + 1}, ${b[1]})] === 2 && obj[gi(${b[0] + 2}, ${b[1]})] === 2`), 'porteira de 2 casas entre as cercas');
  t.ok(await t.ev(`(() => { const g = GATES[gateId[gi(${b[0] + 1}, ${b[1]})]]; const was = solidT(${b[0] + 1}, ${b[1]}, 'p'); toggleGate(g, true); g.anim = 1; return was && !solidT(${b[0] + 1}, ${b[1]}, 'p'); })()`), 'a porteira nova abre');
  await t.ev(`PNT.tool = 'cerca'; pntApply(${c[0]}, ${c[1]}); PNT.tool = 'tirar'; pntApply(${c[0]}, ${c[1]}); 0`);
  t.ok(await t.ev(`obj[gi(${c[0]}, ${c[1]})] === 0 && S.fz.f.length === 2`), 'desfazer tira a cerca');
  t.ok(await t.ev("fzWhyNot(AREAS.p1.r[0] + 3, AREAS.p1.r[1] + 3, 'cerca') !== null && fzWhyNot(2, 2, 'terra') !== null"), 'não deixa construir dentro do pasto nem em terra que não é sua');
  await t.ev('pntEnd(); 0'); await t.espera(400);
  await t.ev(`P.x = ${b[0] + 1} * TS; P.y = ${b[1] + 3} * TS; cam.uz = 1.6; 0`); await t.espera(700); await t.foto('38_cerca_porteira');
  await t.ev("P.x = 55 * TS; P.y = 44.5 * TS; 0"); await t.espera(700); await t.foto('38_placa');
  // save e jogo novo
  const sv = await t.ev(`(() => { const o = JSON.parse(SAVE.serialize()); SAVE.apply(o); return [FN(), ground[gi(${a[0]}, ${a[1]})] === G.WALK, obj[gi(${b[0]}, ${b[1]})] === 1, obj[gi(${b[0] + 1}, ${b[1]})] === 2, S.deco.length, !!MOV[S.deco[0] && S.deco[0].id]]; })()`);
  t.ok(sv && sv[0] === 'Santa Luzia' && sv[1] && sv[2] && sv[3] && sv[4] === 1 && sv[5], 'tudo continua depois de salvar e carregar ' + JSON.stringify(sv));
  await t.jogoNovo();
  t.ok(await t.ev(`FN() === 'Boa Esperança' && ground[gi(${a[0]}, ${a[1]})] !== G.WALK && obj[gi(${b[0]}, ${b[1]})] === 0 && obj[gi(${b[0] + 1}, ${b[1]})] === 0 && !S.deco.length`), 'jogo novo começa com a fazenda original');
  t.semErros();
} };
