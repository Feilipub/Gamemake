// v7.9: filhos e herança; economia (leite, carne de sol, mel, prêmios dos desafios)
module.exports = { nome: 'Filhos, herança e economia ajustada', tempo: 240, async rodar(t) {
  await t.abrir({ ajustes: { view: '2d', cenas: false } }); await t.jogoNovo();
  // casados
  await t.ev("S.amor = { id: 'clara', st: 3, d: S.day, cd: S.day - 5 }; 0");
  await t.ev("openNpc('clara'); 0"); t.ok(await t.ev("document.getElementById('mc').textContent.includes('Família')"), 'casados veem o cartão da família na conversa com o cônjuge');
  await t.ev("A.famQuer(); closeModal(); 0"); t.ok(await t.ev('S.fam.grav > 0'), 'o casal espera um bebê');
  await t.ev('S.day += FAM_GEST; famDay(); 0'); t.igual(await t.ev('S.fam.kids.length'), 1, 'o bebê nasce depois da gestação');
  await t.ev('closeModal(); famNomear(); 0'); await t.espera(200);
  await t.ev("document.getElementById('famNm').value = 'Tiana'; A.famNmOk(); 0"); t.igual(await t.ev('S.fam.kids[0].n'), 'Tiana', 'o jogador dá o nome');
  t.igual(await t.ev('kidStage(S.fam.kids[0])'), 'bebe', 'começa bebê');
  // bebê na rede da varanda
  await t.ev("S.min = 10 * 60; famTick(0.1); 0"); t.ok(await t.ev('S.fam.kids[0]._x != null'), 'o bebê aparece na varanda de dia');
  // cresce
  await t.ev('S.fam.kids[0].born -= FAM_ANO * 6; 0'); t.igual(await t.ev('kidStage(S.fam.kids[0])'), 'crianca', 'com 6 anos é criança');
  await t.ev('openFilho(0); 0'); t.ok(await t.ev("document.getElementById('mc').textContent.includes('Ensinar a lida')"), 'a ficha do filho tem lições da lida');
  const l0 = await t.ev('S.fam.kids[0].laco'); await t.ev("A.famBrinca('0'); A.famEnsina('0|mon'); 0");
  t.ok((await t.ev('S.fam.kids[0].laco')) > l0 && (await t.ev('S.fam.kids[0].ens.mon')) === 1, 'brincar e ensinar aumentam o laço e o aprendizado');
  // tarefa: ovos
  await t.ev("closeModal(); S.fam.kids[0].task = 'ovos'; S.eggs = 5; const o0 = S.inv.ovo || 0; famDay(); window.__o0 = o0; 0");
  t.ok(await t.ev('S.eggs === 0 && (S.inv.ovo || 0) >= 5'), 'a criança recolhe os ovos todo dia');
  // adulto e herança
  await t.ev("const k = S.fam.kids[0]; k.born -= FAM_ANO * 12; k.laco = 80; k.ens = { mon: 3, lac: 2, lid: 2, pec: 1 }; 0");
  t.igual(await t.ev('kidStage(S.fam.kids[0])'), 'adulto', 'com 18 anos é adulta');
  t.ok(await t.ev('herancaOk(S.fam.kids[0])'), 'adulta, com laço e lições, pode herdar');
  const n0 = await t.ev('S.cf.name'), mon0 = await t.ev("S.cf.sk.mon || 0");
  await t.ev('herancaCena(S.fam.kids[0]); 0'); await t.espera(300);
  t.igual(await t.ev('S.cf.name'), 'Tiana', 'o jogador passa a ser a filha');
  t.igual(await t.ev('S.fam.velho.n'), n0, 'o antigo vaqueiro fica na varanda');
  t.ok((await t.ev('S.cf.sk.mon || 0')) === mon0 + 1, 'o talento da herdeira vira habilidade');
  t.igual(await t.ev('S.fam.ger'), 2, 'segunda geração');
  t.ok(await t.ev("schedFor(npcs.find(e => e.id === 'clara')) && S.fam.conj === 'clara'"), 'o cônjuge continua morando na fazenda');
  // economia
  await t.ev("S.varal = [{ k: 'costela', d: S.day - 3 }, { k: 'costela', d: S.day - 3 }, { k: 'costela', d: S.day - 3 }]; S.varalF = 0; S.inv.carnesol = 0; A.varGet(); 0");
  t.igual(await t.ev('S.inv.carnesol'), 2, '3 kg de carne fresca viram 2 kg de carne de sol (perde água)');
  t.ok(await t.ev('IT.mel.p >= 40 && IT.ovo.p >= 1.5'), 'mel e ovos valem mais');
  t.semErros();
} };
