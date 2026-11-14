// v8.2: aboio cantado (segurar) e vaquejada com emparelhar, pegar o rabo e derrubar na faixa
module.exports = { nome: 'Aboio cantado e vaquejada de verdade', async rodar(t) {
  await t.abrir({ ajustes: { view: '2d', cenas: false } }); await t.jogoNovo();
  // aboio: curto chama perto; segurado vai mais longe e convence até o teimoso
  await t.ev("abCd = 0; P.mnt = null; const L = myAnimals('boi'); L.forEach((a, i) => { a._st = 'idle'; a.x = P.x + 200 + i * 6; a.y = P.y; a.traits = []; }); window.__L = L; 0");
  await t.ev('aboioPress(); aboioRelease(); 0'); t.ok(await t.ev("window.__L.every(a => a._st !== 'follow')"), 'aboio curto não alcança o gado a 12 m');
  await t.ev('abCd = 0; aboioPress(); ABH.t0 = performance.now() - 2000; aboioRelease(); 0');
  t.ok(await t.ev("window.__L.every(a => a._st === 'follow')"), 'aboio cantado (segurando o botão) alcança longe e o gado vem');
  // vaquejada: 3 bois; emparelhado pega o rabo; derruba na faixa = valeu boi
  await t.ev("const h = mainHorse(); P.mnt = h.id; h._st = 'ridden'; Object.assign(VQ, { on: true, round: 0, pts: 0, log: [] }); vqNext(); 0");
  t.ok(await t.ev("VQ.ph === 'ready' && VQ.bull && !!VQ.estH"), 'o boi sai do brete com o esteireiro do outro lado');
  const corre = async (bom) => {
    await t.ev('for (let i = 0; i < 80; i++) updVaquejada(1 / 30); 0'); // largada
    // emparelha (ou não) e pega o rabo
    await t.ev(`for (let i = 0; i < 20; i++) { ${bom ? 'P.x = VQ.bull.x - 6; VQ.pv = VQ.bull.v;' : 'P.x = VQ.bull.x - 60;'} updVaquejada(1 / 30); } vaqAction(); 0`);
    const pegou = await t.ev('VQ.hold');
    await t.ev(`for (let i = 0; i < 400 && VQ.ph === 'run' && VQ.bull.x < (VQ.faixa[0] + 0.6) * TS; i++) { ${bom ? 'P.x = VQ.bull.x - 6; VQ.pv = VQ.bull.v;' : ''} updVaquejada(1 / 30); } vaqAction(); 0`);
    const res = await t.ev('VQ.res'); await t.ev("for (let i = 0; i < 200 && VQ.on && (VQ.ph === 'fall' || VQ.ph === 'end' || VQ.ph === 'run'); i++) { updVaquejada(1 / 30); if (VQ.ph === 'ready') break; } 0");
    return [pegou, res];
  };
  const [p1, r1] = await corre(true); t.ok(p1 && r1 === 'valeu', 'emparelhado, pega o rabo e derruba na faixa: VALEU BOI');
  const [p2] = await corre(false); t.ok(!p2, 'longe do boi não dá para pegar o rabo');
  await corre(true); await t.ev("for (let i = 0; i < 300 && VQ.on; i++) updVaquejada(1 / 30); 0");
  t.ok(await t.ev("!VQ.on && VQ.log.length === 3 && document.getElementById('mc').textContent.includes('Dupla')"), 'depois de 3 bois sai a classificação das duplas com o prêmio');
  t.ok(await t.ev('VQ.pts === 20 && (S.stats.vaq || 0) >= 2'), 'cada valeu boi vale 10 pontos');
  await t.ev('closeModal(); 0');
  t.semErros();
} };
