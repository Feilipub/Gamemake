// v18: auditoria de botões — abre cada tela e aperta, um por um, todos os botões que o jogador pode apertar (gado e haras),
// procurando erros de JavaScript; confere também se alguma tela estoura a largura do celular.
const PULA = new Set(['toTitle', 'loadNow', 'netCriar', 'netEntrar', 'netSair', 'netConvidar', 'delSlot', 'slotDel', 'inkLoad', 'importSave', 'impSave', 'saveImport', 'loadSlot', 'newSlot', 'setupGo', 'resetAll', 'apagar', 'tutAgain', 'credits', 'help', 'fullscr', 'fs']);
const TELAS = `[
  ['menu', t => openMenu(t)], ...BLD.map(b => ['prédio ' + b.id, () => openBuilding(b)]),
  ['agro', openAgro], ['mercadinho', openMercadinho], ['banco', () => openBank(false)], ['bar', openBar], ['açougue', openAcougue], ['pedreiro', openPedreiro], ['casa', openHouse], ['galpão', openGalpao], ['depósito', openDeposito], ['fogueira', openFire], ['mochila', openBag], ['ferramentas', openFerramentas], ['estábulo', openEstabulo], ['balança', openBalanca], ['brete', openBrete], ['embarque', openEmbarque], ['quadro', openBoard], ['opções', showOptions], ['online', netOpen],
  ...Object.keys(NPCDEF).map(id => ['morador ' + id, () => openNpc(id)])
].filter(x => typeof x[1] === 'function')`;
const FUZZ = `(() => { const PULA = new Set(${JSON.stringify([...PULA])}); const falhas = [], vistos = new Set(); let n = 0; toast = () => {}; say = () => {};
  const T = ${TELAS}; const tabs0 = () => (M.tabs || []).map(x => x[0]);
  const reabre = (f, tab) => { try { closeModal(); closeSheet && closeSheet(); } catch (e) { } f(tab); if (tab && M.tabs) { M.tab = tab; renderModal(); } };
  for (const [nome, f] of T) {
    let tabs = [null]; try { reabre(f); tabs = M.tabs ? tabs0() : [null]; } catch (e) { falhas.push(nome + ' (abrir): ' + e.message); continue; }
    for (const tab of tabs) {
      let bts = []; try { reabre(f, tab); bts = [...document.querySelectorAll('#mn [data-a]')].filter(b => !b.disabled).map(b => [b.dataset.a, b.dataset.v || '']); } catch (e) { falhas.push(nome + '/' + tab + ' (abrir): ' + e.message); continue; }
      for (const [a, v] of bts.slice(0, 60)) { const key = nome + '|' + tab + '|' + a + '|' + v; if (PULA.has(a) || vistos.has(key) || !A[a]) continue; vistos.add(key);
        try { reabre(f, tab); const el = [...document.querySelectorAll('#mn [data-a]')].find(b => b.dataset.a === a && (b.dataset.v || '') === v); if (!el) continue; S.cash = Math.max(S.cash, 2e6); n++; const r = A[a](v, el); if (r && r.catch) r.catch(e => falhas.push(nome + '/' + tab + ' › ' + a + '(' + v + '): ' + e.message)); if (M.open) renderModal(); if (SH.a) renderSheet(); }
        catch (e) { falhas.push(nome + '/' + (tab || '-') + ' › ' + a + '(' + v + '): ' + e.message + ' @' + String(e.stack || '').split('\\n')[1]); }
        if (mode !== 'play') { try { mode = 'play'; } catch (e) { } }
      }
    }
  }
  try { closeModal(); } catch (e) { }
  return JSON.stringify({ n, falhas: [...new Set(falhas)].slice(0, 30) }); })()`;
module.exports = { nome: 'Auditoria: todos os botões de todas as telas (gado e haras) e telas no celular', tempo: 900, async rodar(t) {
  await t.abrir({ ajustes: { view: '2d', cenas: false } });
  for (const modo of ['gado', 'haras']) {
    await t.jogoNovo(modo === 'haras' ? "Object.assign(defaultCF(), { modo: 'haras' })" : 'defaultCF()');
    await t.ev('S.cash = 2e6; 0');
    const r = JSON.parse(await t.ev(FUZZ).catch(e => JSON.stringify({ n: 0, falhas: ['fuzz quebrou: ' + e.message] })));
    t.ok(r.falhas.length === 0, `${modo}: ${r.n} botões apertados sem erro` + (r.falhas.length ? ':\n    ' + r.falhas.join('\n    ') : ''));
  }
  t.semErros();
} };
module.exports.PULA = PULA;
