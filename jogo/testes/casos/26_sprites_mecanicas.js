// v7.7: volume nos animais, apicultura, varal de carne de sol, cata-vento e bichinhos voando
module.exports = { nome: 'Sprites e mecânicas: abelhas, varal, cata-vento, volume e vaga-lumes', async rodar(t) {
  await t.abrir({ ajustes: { view: '2d', cenas: false } }); await t.jogoNovo();
  t.ok(await t.ev("(() => { const r = RIG.get('nelore', 'branco', 'side', 'idle', 0, {}); return !!(r.b && r.b._lk); })()"), 'os animais ganharam luz e sombra');
  // apicultura
  await t.ev("S.cash += 2000; buyItem('caixaAbelha', 1, 'inv'); buyItem('fumigador', 1, 'inv'); P.mnt = null; for (let y = 46; y < 66 && !window.__ok; y++) for (let x = 3; x < 55; x++) { const i = gi(x, y + 1); if (!obj[i] && !obj[gi(x, y)] && [G.GRASS, G.PAST].includes(ground[i]) && !['curral','receb','conf','quar','galin'].includes(areaAt((x + .5) * TS, (y + .5) * TS))) { P.x = (x + 0.5) * TS; P.y = (y + 0.4) * TS; window.__ok = 1; break; } } 0");
  await t.ev('instalarColmeia(); 0'); t.igual(await t.ev('(S.colm || []).length'), 1, 'a caixa de abelha foi instalada na fazenda');
  t.ok(await t.ev("PROPS.some(p => p.t === 'caixaAbelha')"), 'a caixa aparece no mapa');
  await t.ev('S.colm[0].last = S.day - 3; S.inv.mel = 0; P.x = S.colm[0].x; P.y = S.colm[0].y + 12; colherColmeia(0); 0');
  t.ok(await t.ate('(S.inv.mel || 0) >= 1'), 'depois de 3 dias a caixa dá mel');
  // varal de carne de sol
  await t.ev("S.inv.costela = 3; A.varPut('costela'); A.varPut('costela'); 0"); t.igual(await t.ev('S.varal.length'), 2, 'pendurou a carne no varal');
  await t.ev('S.day += 2; S.inv.carnesol = 0; A.varGet(); 0'); t.igual(await t.ev('S.inv.carnesol'), 2, 'em 2 dias vira carne de sol');
  // cata-vento
  t.ok(await t.ev("!!BUILD.catavento"), 'o cata-vento aparece nas obras');
  await t.ev("S.lots.A = { b: 'catavento', done: true, prog: 1 }; S.res = 10; 0"); const d0 = await t.ev('S.day');
  await t.ev("S.min = 19 * 60; sleep(); 0"); t.ok(await t.ate('S.day > ' + d0, 15000), 'o dia virou');
  t.ok((await t.ev('S.res')) >= 20, 'o cata-vento bombeou água para o reservatório');
  // vaga-lumes à noite
  await t.ev("inExitNow(); closeModal(); S.min = 21 * 60; P.x = 20 * TS; P.y = 50 * TS; 0"); t.ok(await t.ate("CRIT.some(c => c.k === 'v')", 15000), 'de noite aparecem vaga-lumes');
  t.semErros();
} };
