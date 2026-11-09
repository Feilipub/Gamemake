// =====================================================================
//  PONTE TikTok LIVE  ->  FAZENDA DA LIVE
//  Lê comentários, presentes, curtidas, seguidores e compartilhamentos da sua live
//  e manda tudo para o jogo (que roda no navegador / OBS / TikTok LIVE Studio).
//
//  Uso:
//    node servidor.mjs seu_usuario            (conecta na sua live; o @ é opcional)
//    node servidor.mjs --demo                 (sem TikTok: eventos de mentira para testar)
//    node servidor.mjs seu_usuario --chave=XXXX   (chave da Euler Stream, se tiver: menos limite)
//
//  Depois abra no navegador:  http://localhost:8787
//  Para ferramentas como TikFinity/Streamer.bot (webhook):
//    http://localhost:8787/acao?a=chuva&user=Fulano
//    http://localhost:8787/evento?tipo=gift&user=Fulano&diamantes=100&qtd=1
// =====================================================================
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const DEMO = args.includes('--demo');
const chave = (args.find(a => a.startsWith('--chave=')) || '').split('=')[1] || process.env.EULER_KEY || '';
const PORT = +((args.find(a => a.startsWith('--porta=')) || '').split('=')[1] || process.env.PORT || 8787);
const usuario = (args.find(a => !a.startsWith('--')) || '').replace(/^@/, '').trim();

const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav' };
const log = (...m) => console.log(new Date().toLocaleTimeString('pt-BR'), ...m);

// ---------- servidor do jogo + webhooks ----------
const srv = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/acao' || u.pathname === '/evento') {
    const q = Object.fromEntries(u.searchParams);
    const ev = u.pathname === '/acao' ? { tipo: 'acao', acao: q.a || q.acao, user: q.user || 'Live', nome: q.nome || q.user || 'Live' }
      : { tipo: q.tipo || 'chat', user: q.user || 'Live', nome: q.nome || q.user || 'Live', texto: q.texto || '', presente: q.presente || '', diamantes: +q.diamantes || 0, qtd: +q.qtd || 1, curtidas: +q.curtidas || 0 };
    enviar(ev); res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }); return res.end(JSON.stringify({ ok: true, ev }));
  }
  if (u.pathname === '/estado') { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ usuario, demo: DEMO, conectado: estado.conectado, jogos: wss.clients.size })); }
  let f = decodeURIComponent(u.pathname); if (f === '/') f = '/index.html';
  const fp = path.join(DIR, f);
  if (!fp.startsWith(DIR) || fp.includes('node_modules') || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { res.writeHead(404); return res.end('não achei'); }
  res.writeHead(200, { 'Content-Type': TIPOS[path.extname(fp)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); fs.createReadStream(fp).pipe(res);
});
const wss = new WebSocketServer({ server: srv, path: '/ws' });
const estado = { conectado: false };
function enviar(ev) { const s = JSON.stringify(ev); for (const c of wss.clients) if (c.readyState === 1) c.send(s); }
wss.on('connection', c => { log('🎮 Jogo conectado (' + wss.clients.size + ' aberto[s])'); c.send(JSON.stringify({ tipo: 'status', conectado: estado.conectado, usuario, demo: DEMO })); });
srv.listen(PORT, () => {
  log(`🌵 Fazenda da Live rodando em  http://localhost:${PORT}`);
  log(`   Simulador (para testar):     http://localhost:${PORT}/?sim=1`);
  if (!usuario && !DEMO) log('⚠️  Sem usuário do TikTok. Rode:  node servidor.mjs seu_usuario   (ou --demo para testar)');
});

// ---------- TikTok LIVE ----------
const nomeDe = d => ({ user: d?.user?.uniqueId || 'alguem', nome: d?.user?.nickname || d?.user?.uniqueId || 'Alguém' });
async function conectarTikTok() {
  let lib; try { lib = await import('tiktok-live-connector'); } catch (e) { log('❌ Falta instalar as dependências. Rode:  npm install'); return; }
  const { TikTokLiveConnection, WebcastEvent } = lib;
  const con = new TikTokLiveConnection(usuario, Object.assign({ enableExtendedGiftInfo: false, processInitialData: false }, chave ? { signApiKey: chave } : {}));
  const tentar = async () => {
    try { const st = await con.connect(); estado.conectado = true; log(`✅ Conectado na live de @${usuario} (sala ${st.roomId})`); enviar({ tipo: 'status', conectado: true, usuario }); }
    catch (e) { estado.conectado = false; const msg = String(e && (e.message || e)); log('⏳ Não conectou (' + (/offline|Room ID/i.test(msg) || (e && e.constructor && e.constructor.name === 'UserOfflineError') ? 'a live de @' + usuario + ' ainda não começou, ou o usuário está errado' : msg.slice(0, 120)) + '). Tentando de novo em 20 s…'); setTimeout(tentar, 20000); }
  };
  con.on(WebcastEvent.CHAT, d => enviar(Object.assign({ tipo: 'chat', texto: d.comment || '' }, nomeDe(d))));
  con.on(WebcastEvent.GIFT, d => { const g = d.giftDetails || {}; if (g.giftType === 1 && !d.repeatEnd) return; // sequência ainda em andamento: conta só no fim
    const ev = Object.assign({ tipo: 'gift', presente: g.giftName || 'presente', diamantes: g.diamondCount || 1, qtd: d.repeatCount || 1 }, nomeDe(d)); log(`🎁 ${ev.nome} mandou ${ev.qtd}x ${ev.presente} (${ev.diamantes} 💎)`); enviar(ev); });
  con.on(WebcastEvent.LIKE, d => enviar(Object.assign({ tipo: 'like', curtidas: d.likeCount || 1, total: d.totalLikeCount || 0 }, nomeDe(d))));
  con.on(WebcastEvent.FOLLOW, d => enviar(Object.assign({ tipo: 'follow' }, nomeDe(d))));
  con.on(WebcastEvent.SHARE, d => enviar(Object.assign({ tipo: 'share' }, nomeDe(d))));
  con.on(WebcastEvent.MEMBER, d => enviar(Object.assign({ tipo: 'join' }, nomeDe(d))));
  con.on(WebcastEvent.STREAM_END, () => { estado.conectado = false; log('📴 A live terminou.'); enviar({ tipo: 'status', conectado: false, usuario }); });
  con.on((lib.ControlEvent && lib.ControlEvent.DISCONNECTED) || 'disconnected', () => { if (!estado.conectado) return; estado.conectado = false; log('🔌 Desconectou. Tentando de novo em 10 s…'); enviar({ tipo: 'status', conectado: false, usuario }); setTimeout(tentar, 10000); });
  let ultErro = ''; con.on('error', e => { const m = String((e && (e.info || (e.exception && e.exception.message) || e.message)) || '').slice(0, 160); if (m && m !== ultErro) { ultErro = m; log('⚠️ Aviso da conexão:', m); } });
  tentar();
}
if (usuario && !DEMO) conectarTikTok();

// ---------- modo demonstração ----------
if (DEMO) {
  log('🎭 Modo demonstração: eventos de mentira a cada poucos segundos.');
  const NOMES = ['Zé do Gado', 'Maria Vaqueira', 'Tonho', 'Dona Cida', 'Biu', 'Neném', 'Juca', 'Lia', 'Seu Bené', 'Toinho', 'Rosinha', 'Chico Bento'];
  const CMDS = ['boi', 'boi', 'vaca', 'chuva', 'chuva', 'aboio', 'cavalo', 'jegue', 'galinha', 'laço', 'fogueira', 'forró', 'oi gente', 'kkkk', '1', '2', '3', 'cachorro'];
  const PRES = [['Rosa', 1], ['Rosa', 1], ['TikTok', 1], ['Chapéu', 5], ['Donut', 30], ['Leão', 100], ['Universo', 500]];
  setInterval(() => { const n = NOMES[Math.floor(Math.random() * NOMES.length)], user = n.toLowerCase().replace(/\W+/g, ''), r = Math.random();
    if (r < 0.62) enviar({ tipo: 'chat', user, nome: n, texto: CMDS[Math.floor(Math.random() * CMDS.length)] });
    else if (r < 0.82) enviar({ tipo: 'like', user, nome: n, curtidas: 5 + Math.floor(Math.random() * 40) });
    else if (r < 0.9) { const p = PRES[Math.floor(Math.random() * (Math.random() < 0.85 ? 4 : PRES.length))]; enviar({ tipo: 'gift', user, nome: n, presente: p[0], diamantes: p[1], qtd: 1 + Math.floor(Math.random() * 3) }); }
    else if (r < 0.95) enviar({ tipo: 'follow', user, nome: n }); else enviar({ tipo: 'join', user, nome: n });
  }, 1800);
}
