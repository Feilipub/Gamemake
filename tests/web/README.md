# Testes do jogo web

Scripts Playwright que abrem `web/index.html` e verificam os sistemas da expansão de vida rural. Rodar da raiz do repositório:

```
node tests/web/fish_test.js
node tests/web/roca2_test.js
node tests/web/expl_test.js
node tests/web/life_test.js
```

Cada linha começa com OK ou FALHA; capturas vão para `production/qa/evidence/`.
