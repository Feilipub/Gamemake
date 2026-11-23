# Testes do Lida no Sertão

Testes automáticos que abrem o jogo num navegador (Chromium, via Playwright), jogam
por conta própria e conferem se cada sistema funciona: criação do vaqueiro, gado, pesca,
saves (inclusive de versão antiga), tutorial, controles, histórias, festas, montarias,
música e as cutscenes.

## Como rodar

Precisa de Node.js 18+ e do Playwright com o Chromium:

```bash
npm install playwright      # uma vez
npx playwright install chromium
node jogo/testes/rodar.js            # todos os testes (~6 min)
node jogo/testes/rodar.js gado save  # só os que têm "gado" ou "save" no nome
DETALHES=1 node jogo/testes/rodar.js # mostra cada checagem que passou
```

O executor sobe sozinho um servidor local da pasta `jogo/`. As fotos de tela vão para
`jogo/testes/saida/` (ignorada pelo git). Um teste falha quando uma checagem não bate ou
quando aparece qualquer erro no console do jogo.

## Como escrever um teste novo

Crie `casos/NN_nome.js` exportando `{ nome, tempo?, rodar(t) }`. Dentro de `rodar`:

- `await t.abrir({ celular: true })` abre o jogo (opções: `tela`, `ajustes`, `antes`, `downloads`);
- `await t.jogoNovo()` começa um jogo novo e pula a abertura;
- `await t.ev('código')` roda código dentro do jogo, com acesso às funções internas;
- `t.ok(cond, 'o que deveria acontecer')`, `t.igual(a, b, '...')` e `t.semErros()` checam;
- `await t.foto('nome')` salva uma foto da tela.

`fixtures/save_antigo.json` é um save real da versão 6.0, usado para garantir que saves
antigos continuem abrindo.

## Ferramentas de análise

- `node jogo/testes/economia.js medio` (ou `novo`) simula um ano do jogo (336 dias) com um
  jogador cuidadoso e mostra o dinheiro que entra e sai por categoria. Serve para calibrar
  preços, custos fixos e recompensas.
- `node jogo/testes/resistencia.js 8` joga sozinho por 8 minutos num celular simulado
  (anda, corre, monta, abre menus, aboia) e mostra a cada meio minuto a memória usada, os
  quadros por segundo e os erros. Serve para achar vazamento de memória e travamentos.
