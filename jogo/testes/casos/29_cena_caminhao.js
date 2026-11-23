// v7.9.1: cena da entrega — o gado só aparece depois que o caminhão para e a porteira desce
module.exports = { nome: 'Cena do caminhão boiadeiro: entrega na ordem certa', async rodar(t) {
  await t.abrir({ ajustes: { view: '2d', cenas: true } }); await t.jogoNovo();
  await t.ev("const ids = []; for (const br of ['nelore', 'gir']) { const a = mkAnimal('boi', br, { own: 'player', age: 14 }); const q = randIn('receb'); a.x = q[0]; a.y = q[1]; a.area = 'receb'; S.animals.push(a); ids.push(a.id); } window.__ids = ids; csTruckIn(ids); 0");
  await t.espera(600);
  t.ok(await t.ev('CSX.length === 1 && CSX[0].v2 && CSX[0].x > 55.4 * TS + 20'), 'o caminhão vem chegando pela estrada');
  t.ok(await t.ev('CSA.length === 2 && CSA.every(c => c._csHide)'), 'o gado ainda não aparece: está dentro do caminhão');
  t.ok(await t.ev('window.__ids.every(id => byId(id)._hid)'), 'os animais de verdade ficam escondidos durante a cena');
  t.ok(await t.ate('CS.i >= 3', 20000), 'o caminhão para, o motorista desce e abre a porteira');
  t.ok(await t.ev('Math.abs(CSX[0].x - 55.4 * TS) < 2 && CSX[0].gate > 0.9'), 'a porteira virou rampa com o caminhão parado');
  t.ok(await t.ate('CSA.some(c => !c._csHide)', 8000), 'o gado desce depois da porteira aberta');
  await t.ev('skipCS(); 0'); await t.espera(400);
  t.ok(await t.ev("window.__ids.every(id => !byId(id)._hid && byId(id).area === 'receb') && !CSX.length && !CSA.length"), 'no fim, os animais estão no Recebimento e a cena foi limpa');
  t.semErros();
} };
