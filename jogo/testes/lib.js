// Ferramentas comuns dos testes do Lida no Sertão: servidor local, navegador e checagens.
const { chromium, devices } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const RAIZ = path.resolve(__dirname, '..'); // pasta jogo/
const SAIDA = path.join(__dirname, 'saida');
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };

/** Sobe um servidor estático da pasta jogo/ numa porta livre. */
function servir() {
  return new Promise(res => {
    const srv = http.createServer((q, r) => {
      let f = decodeURIComponent(q.url.split('?')[0].split('#')[0]); if (f === '/') f = '/index.html';
      const fp = path.join(RAIZ, f); if (!fp.startsWith(RAIZ) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { r.writeHead(404); return r.end(); }
      r.writeHead(200, { 'Content-Type': TIPOS[path.extname(fp)] || 'application/octet-stream' }); fs.createReadStream(fp).pipe(r);
    });
    srv.listen(0, '127.0.0.1', () => res(srv));
  });
}

class Falha extends Error { }

/** Contexto de um caso de teste: abre o jogo, roda código dentro dele e checa resultados. */
class Teste {
  constructor(nav, base, nome) { this.nav = nav; this.base = base; this.nome = nome; this.erros = []; this.notas = []; }
  async abrir(op = {}) {
    const ctxOp = op.celular ? Object.assign({}, devices['Pixel 7']) : { viewport: op.tela || { width: 1100, height: 700 } };
    if (op.downloads) ctxOp.acceptDownloads = true;
    this.ctx = await this.nav.newContext(ctxOp); const p = this.p = await this.ctx.newPage();
    p.on('pageerror', e => this.erros.push('erro na página: ' + e.message.split('\n')[0]));
    p.on('console', m => { if (m.type() === 'error') this.erros.push('console: ' + m.text().split('\n')[0]); });
    if (op.antes) await p.addInitScript(op.antes);
    if (op.ajustes) await p.addInitScript(s => { try { localStorage.setItem('lida_set', JSON.stringify(s)); } catch (e) { } }, op.ajustes);
    await p.goto(this.base + '/index.html#debug&nointro'); await p.waitForFunction(() => window.__lida, null, { timeout: 30000 }); await p.waitForTimeout(800);
    return p;
  }
  /** Roda código JavaScript dentro do jogo (tem acesso às funções internas). */
  ev(codigo) { return this.p.evaluate(c => window.__lida.ev(c), codigo); }
  espera(ms) { return this.p.waitForTimeout(ms); }
  async pularCenas(max = 60) { for (let i = 0; i < max && (await this.ev('mode')) !== 'play'; i++) { await this.p.evaluate(() => { const s = document.getElementById('skip'); if (s && s.offsetParent) s.click(); }); await this.espera(400); } }
  /** Começa um jogo novo (com a ficha padrão ou a informada) e pula a abertura. */
  async jogoNovo(cfCodigo = 'defaultCF()', semTutorial = true) { await this.ev('newGame(' + cfCodigo + ')'); await this.espera(800); await this.pularCenas(); await this.ev('typeof introSkipAll === "function" && introSkipAll(); 0'); await this.pularCenas(); await this.espera(500); if (semTutorial) await this.ev('tutEnd(true); 0'); this.ok((await this.ev('mode')) === 'play', 'o jogo entrou no modo de jogo'); }
  /** Espera até o código do jogo dar verdadeiro (o tempo do jogo corre mais devagar em aparelho lento). */
  async ate(codigo, ms = 8000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await this.ev(codigo)) return true; await this.espera(250); } return false; }
  ok(cond, msg) { if (!cond) throw new Falha(msg); this.notas.push('✔ ' + msg); }
  igual(a, b, msg) { if (a !== b) throw new Falha(msg + ` (esperado ${JSON.stringify(b)}, veio ${JSON.stringify(a)})`); this.notas.push('✔ ' + msg); }
  semErros(msg = 'nenhum erro no console') { if (this.erros.length) throw new Falha(msg + ':\n    ' + this.erros.slice(0, 5).join('\n    ')); this.notas.push('✔ ' + msg); }
  async foto(nome) { fs.mkdirSync(SAIDA, { recursive: true }); await this.p.screenshot({ path: path.join(SAIDA, this.nome + '_' + nome + '.png') }); }
  async fechar() { if (this.ctx) await this.ctx.close(); }
}
module.exports = { servir, Teste, Falha, RAIZ, SAIDA };
