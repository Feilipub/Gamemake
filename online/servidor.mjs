// =====================================================================
//  LIDA NO SERTÃO — MODO ONLINE (sala cooperativa)
//  Serve o jogo (pasta ../jogo) e repassa as mensagens entre o dono da fazenda e os convidados.
//  A fazenda de verdade roda no jogo de quem abriu a sala; o servidor só passa recado (leve, cabe no plano grátis).
//  Uso:  npm install   e depois   node servidor.mjs      (porta 8790 ou a variável PORT)
// =====================================================================
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const JOGO = path.join(DIR, '..', 'jogo');
const PORT = +(process.env.PORT || process.argv.find(a => a.startsWith('--porta='))?.split('=')[1] || 8790);
const MAX = 6;
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.json': 'application/json', '.ink': 'text/plain; charset=utf-8' };
const log = (...m) => console.log(new Date().toLocaleTimeString('pt-BR'), ...m);
const salas = new Map(); // código -> { host, guests: Map(pid -> ws), nome, criada }

const srv = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/estado') { res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }); return res.end(JSON.stringify({ ok: true, salas: salas.size, jogadores: [...salas.values()].reduce((n, s) => n + 1 + s.guests.size, 0) })); }
  let f = decodeURIComponent(u.pathname); if (f === '/') f = '/index.html';
  const fp = path.join(JOGO, f);
  if (!fp.startsWith(JOGO) || fp.includes('testes') || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { res.writeHead(404); return res.end('não achei'); }
  res.writeHead(200, { 'Content-Type': TIPOS[path.extname(fp)] || 'application/octet-stream', 'Cache-Control': f.endsWith('sw.js') ? 'no-store' : 'no-cache' }); fs.createReadStream(fp).pipe(res);
});
const wss = new WebSocketServer({ server: srv, path: '/ws', maxPayload: 8 * 1024 * 1024 });
const mandar = (ws, o) => { if (ws && ws.readyState === 1) ws.send(typeof o === 'string' ? o : JSON.stringify(o)); };
const codigo = () => { const L = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; let c; do { c = Array.from({ length: 4 }, () => L[Math.floor(Math.random() * L.length)]).join(''); } while (salas.has(c)); return c; };
let pidN = 1;
wss.on('connection', ws => {
  ws.vivo = true; ws.on('pong', () => { ws.vivo = true; });
  ws.on('message', raw => {
    let m; try { m = JSON.parse(raw); } catch (e) { return; }
    if (m.t === 'criar') { // o dono abre a fazenda
      const c = codigo(); ws.sala = c; ws.pid = 'h'; ws.dono = true; salas.set(c, { host: ws, guests: new Map(), nome: String(m.nome || 'Fazenda').slice(0, 40), criada: Date.now() });
      log(`🏡 Sala ${c} aberta: ${m.nome || ''}`); return mandar(ws, { t: 'criada', sala: c, pid: 'h' });
    }
    if (m.t === 'entrar') { // convidado entra com o código
      const s = salas.get(String(m.sala || '').toUpperCase().trim()); if (!s) return mandar(ws, { t: 'erro', msg: 'Não achei essa sala. Confira o código com o dono da fazenda.' });
      if (s.guests.size + 1 >= MAX) return mandar(ws, { t: 'erro', msg: 'A sala está cheia.' });
      const pid = 'g' + (pidN++); ws.sala = String(m.sala).toUpperCase().trim(); ws.pid = pid; s.guests.set(pid, ws);
      log(`🤠 ${m.nome || pid} entrou na sala ${ws.sala}`); mandar(ws, { t: 'entrou', pid, sala: ws.sala, fazenda: s.nome });
      return mandar(s.host, Object.assign({}, m, { t: 'entrar', pid }));
    }
    const s = salas.get(ws.sala); if (!s) return;
    m.de = ws.pid;
    if (ws.dono) { // dono -> um convidado (para) ou todos
      if (m.para) return mandar(s.guests.get(m.para), m);
      const txt = JSON.stringify(m); for (const g of s.guests.values()) mandar(g, txt); return;
    }
    // convidado -> dono; presença e chat também vão para os outros convidados
    mandar(s.host, m);
    if (m.t === 'p' || m.t === 'chat') { const txt = JSON.stringify(m); for (const [pid, g] of s.guests) if (pid !== ws.pid) mandar(g, txt); }
  });
  ws.on('close', () => {
    const s = salas.get(ws.sala); if (!s) return;
    if (ws.dono) { for (const g of s.guests.values()) mandar(g, { t: 'fim', msg: 'O dono da fazenda saiu. A sala foi fechada.' }); salas.delete(ws.sala); log(`🚪 Sala ${ws.sala} fechada`); }
    else { s.guests.delete(ws.pid); mandar(s.host, { t: 'saiu', pid: ws.pid }); const txt = JSON.stringify({ t: 'saiu', pid: ws.pid, de: 'h' }); for (const g of s.guests.values()) mandar(g, txt); log(`👋 ${ws.pid} saiu da sala ${ws.sala}`); }
  });
});
setInterval(() => { for (const ws of wss.clients) { if (!ws.vivo) { ws.terminate(); continue; } ws.vivo = false; try { ws.ping(); } catch (e) { } } }, 25000);
srv.listen(PORT, () => log(`🌐 Lida no Sertão online em http://localhost:${PORT}  (WebSocket em /ws)`));
