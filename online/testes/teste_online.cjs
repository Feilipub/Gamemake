// Teste do modo online: sobe o servidor da sala e abre dois navegadores (dono e convidado) na mesma fazenda.
// Uso (na pasta online):  npm install   e depois   node testes/teste_online.cjs      (precisa do Playwright)
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const path = require('path'); const fs = require('fs');
const OUT = path.join(__dirname, 'saida'); fs.mkdirSync(OUT, { recursive: true });
// node testes/teste_online.cjs        -> pelo servidor de salas (servidor.mjs)
// node testes/teste_online.cjs --p2p  -> conexão direta entre os navegadores (sem servidor do jogo; usa um PeerServer local no lugar do público)
const P2P = process.argv.includes('--p2p'); const PORTA = P2P ? 8792 : 8791; let srv = { kill() { } };
if (!P2P) { srv = spawn(process.execPath, [path.join(__dirname, '..', 'servidor.mjs')], { env: Object.assign({}, process.env, { PORT: String(PORTA) }), stdio: 'ignore' }); }
else { const JOGO = path.join(__dirname, '..', '..', 'jogo'); const http = require('http');
  const st = http.createServer((q, r) => { let f = decodeURIComponent(new URL(q.url, 'http://x').pathname); if (f === '/') f = '/index.html'; const fp = path.join(JOGO, f); if (!fp.startsWith(JOGO) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': f.endsWith('.html') ? 'text/html; charset=utf-8' : f.endsWith('.js') ? 'text/javascript' : 'application/octet-stream' }); fs.createReadStream(fp).pipe(r); }).listen(PORTA, '127.0.0.1');
  const { ExpressPeerServer } = require('peer'); const app = require('express')(); const ps = app.listen(9017, '127.0.0.1'); app.use('/', ExpressPeerServer(ps, { path: '/' })); srv = { kill() { try { st.close(); ps.close && ps.close(); } catch (e) { } } }; }
process.on('exit', () => { try { srv.kill(); } catch (e) { } });
(async () => {
  await new Promise(r => setTimeout(r, 1200)); const b = await chromium.launch({ args: ['--disable-features=WebRtcHideLocalIpsWithMdns'] }); const erros = [];
  const abre = async (nome) => { const ctx = await b.newContext({ viewport: { width: 800, height: 600 } }); const p = await ctx.newPage(); p.on('pageerror', e => erros.push(nome + ': ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/status of 404/.test(m.text())) erros.push(nome + ' console: ' + m.text()); });
    await p.addInitScript(s => localStorage.setItem('lida_set', JSON.stringify(s)), { view: '2d', cenas: false });
    if (P2P) await p.addInitScript(() => localStorage.setItem('lida_net_peer', JSON.stringify({ host: '127.0.0.1', port: 9017, path: '/', secure: false, config: { iceServers: [] } })));
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
  // v17: chamado com seta, diária, pedido para dormir, corrida, convite, link e reconexão
  await ev(guest, 'netPing(); 0'); await host.waitForTimeout(900);
  R.chamado = await ev(host, '!!(NET2.ping && /Vaqueira|Gado|Vaqueiro/.test(NET2.ping.nome))');
  R.diaria = await ev(guest, 'NET2.hoje > 0 && !!localStorage.getItem("lida_net_ganho")');
  await ev(guest, 'A.netSono(); 0'); await host.waitForTimeout(900);
  R.sono = await ev(host, 'netSonoLista().length === 1');
  await ev(host, "corrStart('praca'); 0"); await host.waitForTimeout(800);
  R.largada = await ev(guest, "!!(NET2.corr && NET2.corr.st === 'cd')");
  await host.waitForTimeout(5600);
  await ev(guest, "P.x = 84 * TS; P.y = 49 * TS; 0"); await guest.waitForTimeout(1500); await ev(host, "P.x = 84 * TS; P.y = 49.5 * TS; 0"); await host.waitForTimeout(2500);
  R.corrida = await ev(guest, "!!(NET2.ult && NET2.ult.rank.length === 2 && NET2.hoje >= 300)");
  R.convite = await ev(host, "netLink(NET.sala).endsWith('#sala=' + NET.sala)" + (P2P ? " && localStorage.getItem('lida_net_sala') === NET.sala" : ''));
  { const p3 = await b.newPage(); p3.on('pageerror', e => erros.push('link: ' + e.message)); await p3.addInitScript(s => localStorage.setItem('lida_set', JSON.stringify(s)), { view: '2d', cenas: false });
    await p3.goto('http://localhost:' + PORTA + '/index.html#debug&nointro&sala=' + sala); await p3.waitForFunction(() => window.__lida, null, { timeout: 30000 }); await p3.waitForTimeout(2500);
    R.link = await p3.evaluate(() => window.__lida.ev("!!$('netCode') && $('netCode').value"));
    // pagamento das diárias quando o jogador volta para o próprio jogo
    await p3.evaluate(() => window.__lida.ev("closeModal(); localStorage.setItem('lida_net_ganho', JSON.stringify({ v: 432, fz: ['Fazenda Teste'] })); newGame(defaultCF()); 0")); await p3.waitForTimeout(1500);
    R.pagamento = await p3.evaluate(() => window.__lida.ev("(async () => { const c0 = S.cash + S.acct; SAVE.apply(JSON.parse(SAVE.serialize())); await new Promise(r => setTimeout(r, 2200)); return Math.round(S.cash + S.acct - c0) === 432 && !localStorage.getItem('lida_net_ganho'); })()"));
    await p3.close(); }
  // v19: mercado de animais — o dono vende para o convidado e compra dele
  const mkId = await ev(host, "(() => { toast = () => {}; const a = S.animals.find(mkBom); A.mkPor(a.id); return a.id; })()"); await guest.waitForTimeout(1800);
  R.mkLista = await ev(guest, `(S.mercado || []).some(m => m.id === ${mkId})`);
  const hc0 = await ev(host, 'S.cash + S.acct'), mg0 = await ev(guest, '(netGanhoGet() || { v: 0 }).v');
  await ev(guest, `A.mkCompra(${mkId}); 0`); await host.waitForTimeout(2000);
  R.mkCompra = !(await ev(host, `!!byId(${mkId})`)) && (await ev(host, 'S.cash + S.acct')) > hc0 && (await ev(guest, "JSON.parse(localStorage.getItem('lida_net_compras') || '[]').length")) === 1 && (await ev(guest, '(netGanhoGet() || { v: 0 }).v')) < mg0;
  await ev(guest, "(() => { const a = Object.assign(mkAnimal('boi', 'nelore', { sex: 'F', age: 30 }), { own: 'player', id: 777001, n: 'Mimosa' }); MK.meus = [a]; A.mkOfertar(777001); return 0; })()"); await host.waitForTimeout(1800);
  R.mkOferta = await ev(host, "M.open && /Oferta de animal/.test(M.title) && /Mimosa/.test($('mn').innerHTML)");
  const nh0 = await ev(host, 'S.animals.length'); await ev(host, 'S.cash += 50000; A.mkAceita(); 0'); await guest.waitForTimeout(1800);
  R.mkVenda = (await ev(host, 'S.animals.length')) === nh0 + 1 && await ev(host, "S.animals.some(a => a.n === 'Mimosa' && a.own === 'player')") && (await ev(guest, "JSON.parse(localStorage.getItem('lida_net_vendidos') || '[]').includes(777001)"));
  // v19: vaquejada em dupla online — o dono puxa, o convidado esteira
  await ev(host, "(() => { const h = mainHorse(); P.mnt = h.id; h._st = 'ridden'; toast = () => {}; A.vqConv('pux:' + Object.keys(NET.players)[0]); return 0; })()"); await guest.waitForTimeout(1500);
  R.vqConvite = await ev(guest, "M.open && /Convite para a vaquejada/.test(M.title)");
  const vg0 = await ev(guest, '(netGanhoGet() || { v: 0 }).v');
  await ev(guest, 'A.vqAceita(); 0'); await host.waitForTimeout(1500);
  R.vqDupla = await ev(host, "VQ.on && VQ.papel === 'pux' && !!VQ.duo") && await ev(guest, "VQ.on && VQ.papel === 'est' && !VQ.sim");
  await ev(host, "window.__vqi = setInterval(() => { if (!VQ.on || VQ.ph !== 'run') return; P.x = VQ.bull.x - 6; VQ.pv = VQ.bull.v; if (!VQ.hold) vaqAction(); else if (VQ.bull.x > (VQ.faixa[0] + 0.7) * TS) vaqAction(); }, 40); 0");
  await ev(guest, "window.__vqi = setInterval(() => { if (!VQ.on || VQ.ph !== 'run') return; P.x = VQ.bull.x - 2; VQ.pv = VQ.bull.v; if (VQ.sw) vaqAction(); }, 40); 0");
  for (let i = 0; i < 180 && !(await ev(guest, "!VQ.on && M.open && /Vaquejada em dupla/.test(M.title)")); i++) await guest.waitForTimeout(500);
  R.vqFim = await ev(guest, "!VQ.on && M.open && /esteireiro de/.test($('mc').textContent)") && (await ev(host, 'VQ.log.length')) === 3;
  R.vqPremio = (await ev(guest, '(netGanhoGet() || { v: 0 }).v')) > vg0;
  await ev(host, 'clearInterval(window.__vqi); closeModal(); 0'); await ev(guest, 'clearInterval(window.__vqi); closeModal(); 0');
  // a conexão do convidado cai e ele volta sozinho
  const cav0 = await ev(guest, 'P.mnt');
  await ev(guest, P2P ? 'NET.hc.close(); setTimeout(() => { if (NET.on) netClosed(); }, 300); 0' : 'NET.ws.close(); 0'); // queda: o canal fecha (no P2P o aviso de queda vem da própria conexão)
  let caiu = false; for (let i = 0; i < 40 && !caiu; i++) { caiu = !(await ev(guest, 'NET.on')); if (!caiu) await guest.waitForTimeout(250); }
  for (let i = 0; i < 100 && !(await ev(guest, 'NET.on && NET.guest && NET2.re === 0')); i++) await guest.waitForTimeout(250);
  await guest.waitForTimeout(1500);
  R.volta = caiu && await ev(guest, 'NET.on && NET.guest && mode === "play" && !!P.mnt && P.mnt !== ' + cav0) && (await ev(host, 'Object.keys(NET.players).length')) === 1;
  const nomes = { entrou: 'convidado entrou montado', hostVe: 'dono vê o convidado', posicao: 'posição do convidado chega no dono', porteira: 'porteira aberta pelo convidado', cocho: 'cocho enchido pelo convidado', aboio: 'gado segue o aboio do convidado', dinheiro: 'caixa da fazenda igual nos dois', hora: 'mesma hora nos dois', chat: 'chat chega no dono', mural: 'mural de tarefas no convidado', chamado: 'chamado com seta chega no dono', diaria: 'convidado ganha diária', sono: 'pedido para dormir chega no dono', largada: 'corrida: convidado na largada', corrida: 'corrida: ranking e prêmio do vencedor', convite: 'link de convite (e código fixo)', link: 'link abre o jogo com o código preenchido', pagamento: 'diárias pagas ao voltar para o próprio jogo', volta: 'convidado volta sozinho quando a conexão cai', vqConvite: 'vaquejada: convite de dupla chega no amigo', vqDupla: 'vaquejada: dono puxa e convidado esteira', vqFim: 'vaquejada: 3 bois e resultado no esteireiro', vqPremio: 'vaquejada: prêmio do esteireiro vai para o jogo dele', mkLista: 'mercado: animal à venda aparece no convidado', mkCompra: 'mercado: convidado compra do dono', mkOferta: 'mercado: oferta do convidado chega no dono', mkVenda: 'mercado: dono compra do convidado' };
  let falhas = 0; for (const k in nomes) { const ok = k === 'hostVe' ? R[k] >= 1 : k === 'aboio' ? R[k] >= 1 : k === 'mural' ? R[k] === 3 : k === 'link' ? R[k] === sala : !!R[k]; if (!ok) falhas++; console.log((ok ? '✅ ' : '❌ ') + nomes[k] + ' (' + JSON.stringify(R[k]) + ')'); }
  if (erros.length) { falhas++; console.log('❌ erros no console:', erros.slice(0, 5)); } else console.log('✅ nenhum erro no console');
  await ev(host, "document.querySelectorAll('.tip,#tipC').forEach(e=>e.remove()); P.x = 30 * TS; P.y = 40 * TS; cam.uz = 1.8; 0"); await ev(guest, "document.querySelectorAll('.tip,#tipC').forEach(e=>e.remove()); P.x = 32 * TS; P.y = 40.5 * TS; P.dir = 2; cam.uz = 1.8; netChat('Bora tocar o gado!'); 0"); await host.waitForTimeout(2500); await ev(host, "document.querySelectorAll('.tip,#tipC').forEach(e=>e.remove()); 0"); await ev(guest, "document.querySelectorAll('.tip,#tipC').forEach(e=>e.remove()); 0");
  await host.screenshot({ path: path.join(OUT, 'dono.png') }); await guest.screenshot({ path: path.join(OUT, 'convidado.png') });
  await b.close(); srv.kill(); console.log((P2P ? '[direto P2P] ' : '[servidor] ') + (falhas ? falhas + ' falha(s).' : 'Tudo certo no modo online.')); process.exit(falhas ? 1 : 0);
})();
