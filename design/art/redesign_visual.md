# Redesign visual (Mega atualização C)

Toda a arte é pixel art desenhada por código (sem imagens externas). Fontes:
`tools/asset-pipeline/portrait.js` (retratos), `flora.js`, `region_art.js`, embutidos em `web/index.html`
por `embed_flora.py`.

## Retratos (64x64)
- Estilo farm-sim: cabeça grande, contorno quase preto, sombreamento em faixas com sombras puxadas
  para o vinho e luzes quentes, olhos grandes com íris colorida e brilho, cílios marcados nas mulheres.
- Rosto levemente virado (traços deslocados 1 px, sombra larga do lado direito, linha do queixo).
- Cabelo em mechas grossas com risco escuro entre mechas e faixa de brilho; cabelo médio/longo é uma
  massa única que emoldura o rosto.
- Identidade sertaneja: chapéu de couro de vaqueiro (aba em meia-lua, estrelas, barbicacho), palha,
  gibão de couro, lenço, bata bordada.
- Antes/depois: `production/qa/evidence/retratos-moradores-v1.png` → `retratos-moradores.png`.

## Editor do vaqueiro, montaria e cães
- Categorias: rosto, olhos (forma e cor), nariz e boca, cabelo, barba (cor independente), detalhes.
- Montaria: crina (natural, tosada, comprida, trançada), cauda trançada, manta (cor e estampa),
  cabresto/rédeas, peitoral, ferraduras. Também editável no jogo (tela de equipamentos).
- Cão herdado do avô: o jogador escolhe raça, nome, pelagem e coleira na etapa "Seu cão"; esse cão é o
  cão do avô no jogo (`dog.avo = 1`). Saves antigos continuam com o Caramelo.

## Tela de título
- Fazenda ao fundo: casa caiada com alpendre e telha colonial, chaminé com fumaça, paiol, catavento
  girando, caixa d'água, juazeiro, varal, curral com gado e cavalos pastando (IA simples de pastar/andar).
- Luz de fim de tarde, poeira dourada no ar, boiada cruzando a estrada.
- Botões: Novo jogo, Continuar, Opções, Créditos (Controles e Tela cheia no rodapé).
- Antes/depois: `titulo-antigo-retrato.png` → `titulo-novo-retrato.png`, `titulo-novo-paisagem.png`.

## Abertura da história (substitui a cena antiga feita com o mapa)
Curta animado (`FILM` em `web/index.html`), ~70 s, pode ser pulado:
1. Estrada ao amanhecer com a montaria do jogador (raça, pelagem e equipamentos reais) e títulos.
2. Porteira "Boa Esperança" abrindo.
3. Alpendre: o cão herdado levanta, late, corre e senta ao lado do vaqueiro.
4. Seu Felipe fala (retratos e texto digitado).
5. Close do chapéu de couro de Tiãozinho no prego.
6. Close das iniciais T.S. entalhadas na porteira, com um calango atravessando.
7. A fazenda no fim da tarde.
Ao terminar, o jogo começa no terreiro com o cão e o Seu Felipe, igual à cena antiga.
Evidência: `abertura-nova-cenas.png`, `abertura-nova-paisagem.png`.
