// Teste do modo online: sobe o servidor da sala e abre dois navegadores (dono e convidado) na mesma fazenda.
// Uso (na pasta online):  npm install   e depois   node testes/teste_online.cjs      (precisa do Playwright)
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const path = require('path'); const fs = require('fs');
const OUT = path.join(__dirname, 'saida'); fs.mkdirSync(OUT, { recursive: true });
const PORTA = 8791; const srv = spawn(process.execPath, [path.join(__dirname, '..', 'servidor.mjs')], { env: Object.assign({}, process.env, { PORT: String(PORTA) }), stdio: 'ignore' });
process.on('exit', () => { try { srv.kill(); } catch (e) { } });
(async () => {
  await new Promise(r => setTimeout(r, 1200)); const b = await chromium.launch(); const erros = [];
  const abre = async (nome) => { const ctx = await b.newContext({ viewport: { width: 800, height: 600 } }); const p = await ctx.newPage(); p.on('pageerror', e => erros.push(nome + ': ' + e.message)); p.on('console', m => { if (m.type() === 'error') erros.push(nome + ' console: ' + m.text()); });
    await p.addInitScript(s => localStorage.setItem('lida_set', JSON.stringify(s)), { view: '2d', cenas: false });
    await p.goto('http://localhost:' + PORTA + '/index.html#debug&nointro'); await p.waitForFunction(() => window.__lida, null, { timeout: 30000 }); return p; };
  const ev = (p, c) => p.evaluate(c => window.__lida.ev(c), c);
  const host = await abre('dono'); await ev(host, 'newGame(defaultCF())'); await host.waitForTimeout(800);
  for (let i = 0; i < 30 && (await ev(host, 'mode')) !== 'play'; i++) { await ev(host, 'typeof introSkipAll === "function" && introSkipAll(); 0'); await host.waitForTimeout(300); }
  await ev(host, 'tutEnd(true); closeModal(); netCriar(); 0');
  for (let i = 0; i < 40 && !(await ev(host, 'NET.sala')); i++) await host.waitForTimeout(250);
  const sala = await ev(host, 'NET.sala'); console.log('sala', sala);
  const guest = await abre('convidado'); await ev(guest, `netEntrar('${sala}'); 0`);
  for (let i = 0; i < 60 && !(await ev(guest, 'NET.guest && mode === "play"')); i++) await guest.waitForTimeout(250);
  await guest.waitForTimeout(2500);
  const R = {};
  R.entrou = await ev(guest, 'NET.guest && mode === "play" && !!P.mnt');
  R.hostVe = await ev(host, 'Object.keys(NET.players).length');
  R.animaisIguais = await ev(guest, 'S.animals.length') + ' vs ' + await ev(host, 'S.animals.length');
  // convidado anda: dono vê
  await ev(guest, 'P.x = 20 * TS; P.y = 40 * TS; 0'); await guest.waitForTimeout(900);
  R.posicao = await ev(host, '(() => { const r = Object.values(NET.players)[0]; return r && Math.abs(r.x - 20 * TS) < 6 && Math.abs(r.y - 40 * TS) < 6; })()');
  // porteira
  const gi0 = await ev(host, 'GATES.findIndex(g => !g.lock && !g.open)'); const g0 = await ev(host, `GATES[${gi0}].open`);
  await ev(guest, `toggleGate(GATES[${gi0}], true); 0`); await guest.waitForTimeout(900);
  R.porteira = (await ev(host, `GATES[${gi0}].open`)) !== g0;
  // cocho
  const ti = await ev(host, "trIdx('p1', 'agua')"); await ev(host, `S.tr[${ti}] = 5; 0`); await host.waitForTimeout(1300);
  await ev(guest, `S.tr[${ti}] = trCap(${ti}); 0`); await guest.waitForTimeout(900);
  R.cocho = await ev(host, `S.tr[${ti}] >= trCap(${ti}) - 1`);
  // aboio do convidado perto de bois
  await ev(host, "(() => { const bs = myAnimals('boi'); bs.forEach((a, i) => { a.x = 20 * TS + i * 12; a.y = 41 * TS; }); return 0; })()"); await host.waitForTimeout(800);
  await ev(guest, 'abCd = 0; doAboio(); 0'); await guest.waitForTimeout(900);
  R.aboio = await ev(host, "myAnimals('boi').filter(a => a._st === 'follow' && a._fol).length");
  // dinheiro e hora do dono chegam no convidado
  await ev(host, 'S.cash += 777; 0'); await host.waitForTimeout(1300);
  R.dinheiro = await ev(guest, 'Math.round(S.cash)') === await ev(host, 'Math.round(S.cash)');
  R.hora = Math.abs(await ev(guest, 'S.min') - await ev(host, 'S.min')) < 3;
  // chat
  await ev(guest, "netChat('Ê boi! Cheguei!'); 0"); await host.waitForTimeout(700);
  R.chat = await ev(host, "NET.chat.some(c => /Cheguei/.test(c.t))");
  R.mural = await ev(guest, 'S.mural && S.mural.t.length');
  const nomes = { entrou: 'convidado entrou montado', hostVe: 'dono vê o convidado', posicao: 'posição do convidado chega no dono', porteira: 'porteira aberta pelo convidado', cocho: 'cocho enchido pelo convidado', aboio: 'gado segue o aboio do convidado', dinheiro: 'caixa da fazenda igual nos dois', hora: 'mesma hora nos dois', chat: 'chat chega no dono', mural: 'mural de tarefas no convidado' };
  let falhas = 0; for (const k in nomes) { const ok = k === 'hostVe' ? R[k] >= 1 : k === 'aboio' ? R[k] >= 1 : k === 'mural' ? R[k] === 3 : !!R[k]; if (!ok) falhas++; console.log((ok ? '✅ ' : '❌ ') + nomes[k] + ' (' + JSON.stringify(R[k]) + ')'); }
  if (erros.length) { falhas++; console.log('❌ erros no console:', erros.slice(0, 5)); } else console.log('✅ nenhum erro no console');
  await ev(host, "document.querySelectorAll('.tip,#tipC').forEach(e=>e.remove()); P.x = 30 * TS; P.y = 40 * TS; cam.uz = 1.8; 0"); await ev(guest, "document.querySelectorAll('.tip,#tipC').forEach(e=>e.remove()); P.x = 32 * TS; P.y = 40.5 * TS; P.dir = 2; cam.uz = 1.8; netChat('Bora tocar o gado!'); 0"); await host.waitForTimeout(2500); await ev(host, "document.querySelectorAll('.tip,#tipC').forEach(e=>e.remove()); 0"); await ev(guest, "document.querySelectorAll('.tip,#tipC').forEach(e=>e.remove()); 0");
  await host.screenshot({ path: path.join(OUT, 'dono.png') }); await guest.screenshot({ path: path.join(OUT, 'convidado.png') });
  await b.close(); srv.kill(); console.log(falhas ? falhas + ' falha(s).' : 'Tudo certo no modo online.'); process.exit(falhas ? 1 : 0);
})();
