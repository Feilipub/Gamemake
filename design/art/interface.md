# Interface — tema "Couro e Madeira"

Redesign das interfaces do *Lida no Sertão* (HUD, botões, barra rápida, mochila,
menu inicial, editor do vaqueiro, diálogos, lojas/menus/janelas, avisos).
Implementado em `web/index.html` — bloco CSS `TEMA "COURO E MADEIRA"` e a função
`uiTex()`.

## Direção

Objetos de trabalho do vaqueiro, não "tela de app": **couro costurado** nos botões,
**madeira escura com rebites de latão** nas molduras, na HUD e na barra de baixo,
**pergaminho** no miolo das janelas. Texto creme com sombra de 2 px sobre couro; texto
marrom-escuro sobre pergaminho. Nenhuma imagem externa: toda textura é pixel art
gerada em código e servida como `data:` URL (funciona offline no APK).

## Texturas (`uiTex(kind)` → variáveis CSS, usadas como 9-slice em `border-image`)

| Variável | Uso | Recorte |
|---|---|---|
| `--bN` | botão normal (couro marrom, costura tracejada) | 4 px → 8 px |
| `--bH` | botão em foco/hover (couro mais claro) | 4 → 8 |
| `--bP` | botão pressionado (couro afundado, sem brilho de cima) | 4 → 8 |
| `--bS` | selecionado (aba/opção ativa — couro dourado) | 4 → 8 |
| `--bG` | ação principal (Novo jogo, Continuar, botão de ação ativo) | 4 → 8 |
| `--bD` | desativado (couro acinzentado) | 4 → 8 |
| `--pn` / `--pnD` | janela: moldura de madeira + rebites, miolo claro / escuro | 8 → 16 |
| `--wd` | tábua escura (HUD, barra de baixo, barra rápida, retrato do diálogo) | 6 → 12 |
| `--sl` / `--slS` | espaço de item (couro afundado com tachas) / selecionado | 4 → 4 |
| `--pl` | placa de nome (diálogo, legenda) | 5 → 6 |

**Regra do 9-slice:** o centro da textura é *esticado* para preencher a janela. Por isso
o miolo é de **cor lisa** — qualquer traço ou pinta no centro vira uma faixa grossa.
(Este erro apareceu na ficha do animal: a linha de tinta ficou 1 px para dentro do
recorte e virou uma faixa de 22 px que cobria o texto. Corrigido: moldura cabe em 8 px.)

## Estados dos botões

Todo botão existente usa o mesmo sistema; nenhuma função ou evento foi trocado — só a
aparência. Normal → `--bN`; hover (apenas em aparelhos com mouse) → `--bH`;
pressionado → `--bP` + desce 2 px; selecionado → `--bS`; principal → `--bG`;
desativado → `--bD` com opacidade 0,78.

## Microinterações

- Janela abre com leve "pulo" (`winIn`); troca de aba desliza o conteúdo (`swap`).
- Fala dos diálogos aparece letra a letra (`typeText`); um toque mostra o texto inteiro.
- Dinheiro: `+R$`/`−R$` sobe do contador (`moneyFx`) e a moeda pulsa.
- Item recebido: o espaço da barra rápida pulsa (`got`).
- Conquista/missão concluída: aviso dourado com brilhos (`toast` classe `win`).
- Menu inicial: placa pendurada balança; botões entram em sequência.

## Responsividade

- Retrato e paisagem testados em 412×860 e 800×450.
- Paisagem: ficha do animal vira painel lateral; editor usa rótulos curtos nas etapas
  (número em cima, "Origem", "Cão"), já que a coluna esquerda tem ~320 px.
- Alvos de toque: botões ≥ 34 px, barra de baixo ≥ 44 px.

## Evidência

`production/qa/evidence/ui-redesign-*.png` (antes/depois, retrato e paisagem).

## HUD 2 (pesquisa de projetos de interface)

| Fonte | Licença | O que aproveitamos |
|---|---|---|
| [RPGUI](https://www.npmjs.com/package/rpgui) (RonenNess) | zlib | Molduras e botões de RPG com volume; inspirou os botões redondos da roda |
| NES.css | MIT | Contornos pixelados e estados de botão; confirmou o estilo de contorno de 3 px |
| [Kenney UI Pack](https://www.kenney.nl/assets/ui-pack) | CC0 | Referência de ícones circulares e badges (não embutido: a interface continua desenhada por código, offline) |
| Guias de HUD ([strayspark](https://www.strayspark.studio/blog/game-ui-ux-design-principles), [300mind](https://300mind.studio/blog/radial-menus-in-game-design/), [playbooks](https://playbooks.com/skills/a5c-ai/babysitter/game-hud)) | — | Informação fixa nos cantos, o resto só quando precisa; menu radial para escolhas rápidas; alvos ≥ 44 px; barras que mudam suave |

**O que entrou:**
- **Minimapa redondo com bússola**, logo acima dos botões de ação. Mostra:
  - o rumo do vaqueiro (seta vermelha), o gado (branco), outros animais e os moradores (azul);
  - o barbatão (vermelho), a festa (★) e o objetivo (losango dourado, preso na borda quando está longe).
  - Tocar no minimapa abre o mapa grande.
- **Seta do objetivo na borda da tela**, com a distância em metros. Vale para a missão rastreada, o barbatão, o serviço ou o bico.
- **Roda de ações** ao tocar num animal seu: Ficha, Curar (bicheira, umbigo ou doença), Alimentar, Dar água, Ordenhar, Carinho, Conduzir ou Montar. O toque na roda não vaza para o chão.
- **Avisos por tipo** (verde = dinheiro, vermelho = alerta, dourado = conquista), entrando deslizando. Aviso repetido agrupa (×2, ×3…).
- **Barras de energia e fome** mudam suave e piscam abaixo de 25%.
- **Botões de ação e da barra de baixo em 3D** (espessura e afundam ao tocar).
- Opções: mostrar ou esconder o minimapa; o toque no animal abre a roda ou a ficha completa.

Teste: `tests/web/hud2_test.js` (9 verificações). Evidência: `hud2-minimapa-seta.png`, `hud2-roda-acoes.png`.
