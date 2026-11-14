// Teste automático da Fazenda da Live: sobe o servidor em modo normal, abre o jogo, manda eventos e confere as reações.
// Uso: node testes/teste_live.cjs   (precisa do Playwright com Chromium instalado)
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const path = require('path'); const fs = require('fs');
const RAIZ = path.resolve(__dirname, '..'), SAIDA = path.join(__dirname, 'saida'), PORTA = 8799;
let falhas = 0; const ok = (c, m) => { console.log((c ? '  ✔ ' : '  ✘ ') + m); if (!c) falhas++; };
(async () => {
  fs.mkdirSync(SAIDA, { recursive: true });
  const srv = spawn(process.execPath, ['servidor.mjs', '--porta=' + PORTA], { cwd: RAIZ }); await new Promise(r => setTimeout(r, 1500));
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 }); const erros = [];
  p.on('pageerror', e => erros.push(e.message)); p.on('console', m => m.type() === 'error' && erros.push(m.text()));
  await p.addInitScript(() => localStorage.clear());
  await p.goto(`http://localhost:${PORTA}/?auto=1`); await p.waitForFunction(() => window.FAZENDA); await p.waitForTimeout(1500);
  const ev = s => p.evaluate(s);
  const hook = q => fetch(`http://localhost:${PORTA}${q}`).then(r => r.json());
  const n0 = await ev('FAZENDA.W.animals.length'); ok(n0 >= 5, 'a fazenda começa com animais (' + n0 + ')');
  // comentário "boi" chega pelo webhook do servidor e cria um boi com o nome
  await hook('/evento?tipo=chat&user=ze&nome=Zé%20do%20Gado&texto=!boi'); await p.waitForTimeout(500);
  ok(await ev("FAZENDA.W.animals.some(a => a.name === 'Zé do Gado')"), 'comentário BOI cria um boi com o nome de quem comentou (via servidor)');
  await hook('/evento?tipo=chat&user=ze&nome=Zé%20do%20Gado&texto=boi'); await p.waitForTimeout(300);
  ok(await ev("FAZENDA.W.animals.filter(a => a.name === 'Zé do Gado').length === 1"), 'a mesma pessoa espera para pedir outro boi');
  // votos de chuva
  for (let i = 0; i < 5; i++) await ev(`FAZENDA.evento({ tipo: 'chat', user: 'v${i}', nome: 'Pessoa ${i}', texto: 'chuva' }); 0`);
  ok(await ev('FAZENDA.W.rainT > 0'), 'cinco votos de CHUVA fazem chover');
  // presente rosa: nasce um bezerro
  await ev("FAZENDA.evento({ tipo: 'gift', user: 'maria', nome: 'Maria Vaqueira', presente: 'Rosa', diamantes: 1, qtd: 1 }); 0"); await p.waitForTimeout(300);
  ok(await ev("FAZENDA.W.animals.some(a => a.name === 'Maria Vaqueira' && a.small)"), 'rosa = nasce um bezerro com o nome');
  await p.screenshot({ path: path.join(SAIDA, '1_chuva_bezerro.png') });
  // presente de 30: caminhão
  await ev("FAZENDA.W.rainT = 0; FAZENDA.evento({ tipo: 'gift', user: 'tonho', nome: 'Tonho', presente: 'Donut', diamantes: 30, qtd: 1 }); 0"); await p.waitForTimeout(2500);
  ok(await ev("FAZENDA.W.big && FAZENDA.W.big.k === 'caminhao' && !!FAZENDA.W.truck"), 'presente de 30 💎 = chega o caminhão');
  await p.waitForTimeout(3500); await p.screenshot({ path: path.join(SAIDA, '2_caminhao.png') });
  // curtidas: enche a barra e entra a festa na fila
  await ev("FAZENDA.evento({ tipo: 'like', user: 'cida', nome: 'Dona Cida', curtidas: 5000 }); 0");
  ok(await ev("FAZENDA.W.queue.some(q => q.k === 'festa') || (FAZENDA.W.big && FAZENDA.W.big.k === 'festa')"), 'as curtidas enchem a barra e chamam o São João');
  await ev("FAZENDA.W.big && (FAZENDA.W.big.t = 999); 0"); await p.waitForTimeout(3500); await p.screenshot({ path: path.join(SAIDA, '3_festa.png') });
  // barbatão, vaquejada e corrida
  await ev("FAZENDA.W.queue.length = 0; FAZENDA.W.big && (FAZENDA.W.big.t = 999); 0"); await p.waitForTimeout(200);
  await ev("FAZENDA.evento({ tipo: 'gift', user: 'leao', nome: 'Seu Bené', presente: 'Leão', diamantes: 100, qtd: 1 }); 0"); await p.waitForTimeout(3000);
  ok(await ev("FAZENDA.W.big && FAZENDA.W.big.k === 'barbatao' && FAZENDA.W.animals.some(a => a.bull)"), 'presente de 100 💎 = o Barbatão invade');
  await p.screenshot({ path: path.join(SAIDA, '4_barbatao.png') });
  await ev("FAZENDA.W.big.t = 999; 0"); await p.waitForTimeout(200);
  await ev("FAZENDA.evento({ tipo: 'gift', user: 'uni', nome: 'Biu', presente: 'Universo', diamantes: 500, qtd: 1 }); 0"); await p.waitForTimeout(3500);
  ok(await ev("FAZENDA.W.big && FAZENDA.W.big.k === 'vaquejada'"), 'presente de 500 💎 = grande vaquejada'); await p.screenshot({ path: path.join(SAIDA, '5_vaquejada.png') });
  await ev("FAZENDA.W.big.t = 999; 0"); await p.waitForTimeout(200);
  await ev("FAZENDA.ACOES.corrida({ nome: 'teste' }); 0"); await p.waitForTimeout(500);
  for (const [u, v] of [['a', '1'], ['b', '2'], ['c', '2'], ['d', '3']]) await ev(`FAZENDA.evento({ tipo: 'chat', user: '${u}', nome: '${u.toUpperCase()}', texto: '${v}' }); 0`);
  ok(await ev("FAZENDA.W.corr && FAZENDA.W.corr.cnt.join() === '1,2,1'"), 'corrida de jegue: comentários 1, 2 e 3 viram apostas'); await p.screenshot({ path: path.join(SAIDA, '6_corrida.png') });
  await ev("FAZENDA.W.corr.t = 99; 0"); await p.waitForTimeout(16000);
  ok(await ev("FAZENDA.W.corr === null || FAZENDA.W.corr.win >= 0"), 'a corrida termina com um vencedor');
  ok(await ev("Object.keys(FAZENDA.W.rank).length >= 5"), 'o ranking dos vaqueiros da live é preenchido');
  // noite com fogueira
  await ev("FAZENDA.W.day = 0.9; FAZENDA.evento({ tipo: 'chat', user: 'n', nome: 'Neném', texto: 'fogueira' }); 0"); await p.waitForTimeout(1200); await p.screenshot({ path: path.join(SAIDA, '7_noite_fogueira.png') });
  ok(erros.length === 0, 'nenhum erro no console' + (erros.length ? ': ' + erros.slice(0, 3).join(' | ') : ''));
  await b.close(); srv.kill(); console.log(falhas ? `\n${falhas} falha(s).` : '\nTudo certo!'); process.exit(falhas ? 1 : 0);
})();
