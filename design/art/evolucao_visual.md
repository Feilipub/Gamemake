# Evolução visual — mapa, relevo, 2.5D, 3D pontual e arquitetura

Etapa feita sobre o jogo existente (`web/index.html`), sem trocar de motor e sem
substituir nada por demonstração. Backup antes de começar: tag
`backup-pre-evolucao-visual`.

## Auditoria (o que existia)

- **Motor:** canvas 2D próprio + pós-processamento WebGL (`FX`: luz colorida,
  bloom, água, calor, raios de sol, neblina). Mundo 240×110 ladrilhos de 16 px;
  interiores nas linhas 111–141.
- **Chão:** `GR`, pintado pixel a pixel em blocos de 64 px sob demanda.
- **Objetos:** `PROPS` (1 324 plantas e objetos), `BLD` (prédios gerados por
  código), `FLORA` (árvores), ordenação por altura do pé (`L.sort`).
- **Colisão:** por ladrilho (`obj`, `solidT`).

Problemas encontrados no mapa inteiro, a partir de uma captura completa
(204 quadros montados):

1. Cactos e árvores "brotando" de dentro das copas. A copa sobe uns 4
   ladrilhos e o plantio só reservava 1–2 em volta do tronco (cerca de 100
   casos).
2. Rios retos, com degraus de um ladrilho — pareciam canais.
3. Lagoas com bordas em escada e o fundo em quadrados de profundidade.
4. Borda entre a mata e o chão seco em linha reta, seguindo a grade.
5. Pastos da região leste chapados e repetitivos.
6. Prédios em bloco: telhado plano, sem volume nem detalhe regional.

## O que mudou

| Área | Mudança |
|---|---|
| Plantio | A copa reserva o espaço acima do tronco; nada nasce em cima de lajedo. |
| Água | Margem desenhada por pixel a partir da máscara dos ladrilhos borrada e interpolada, com praia de areia. Profundidade interpolada. A colisão não mudou. |
| Solos | Transições com ruído em duas escalas (bordas sinuosas). |
| Relevo | Morros baixos em todo o chão natural (luz do noroeste), calculados numa grade de 4 px por bloco. |
| Lajedos | Granito na região leste: domo com luz e sombra, borda, rachaduras, líquen e sombra no chão. Ficam fora dos pastos. |
| 2.5D | Árvores e prédios desenhados em faixas: o topo inclina para fora do centro da tela. As rajadas de vento percorrem as copas. |
| 3D pontual | Cata-vento ao lado do açude, modelado em 3D (torre treliçada, roda de 18 pás, leme). É rasterizado em pixel art, sem antisserrilhado, com contorno, e gira com o vento. |
| Céu | Bandos de asa-branca numa camada alta, com parallax e sombra no chão. |
| Arquitetura | Telhado de quatro águas (caimento ao sol e na sombra, arestas, cumeeira, limo), sombra do beiral, parede lateral na sombra e barra pintada no rodapé. Também: platibanda com frontão, caixa d'água azul, antena ou parabólica, chaminé com fumaça, vasos, arandela e degrau. |
| Igreja | Torre com volume, cornijas e sino; telhado em duas águas. |
| Sombras | Prédios projetam sombra comprida de manhã e à tarde. |
| Câmera | Na primeira chegada a um lugar: faixas de cinema e passeio até o prédio mais marcante, com o nome do lugar. Depois a câmera volta ao vaqueiro. |
| Opções | *Profundidade 2.5D* e *Apresentação ao chegar* podem ser desligadas. Gráficos "Baixa" também desligam inclinação e pássaros. |

## Bibliotecas e licenças

Nenhum código de terceiros foi incorporado: os shaders, o rasterizador 3D e
o pintor de terreno são próprios. As técnicas foram pesquisadas em projetos de
licença MIT: pixi-filters (PixiJS), Phaser, PixelFX e Radiant. Os detalhes
estão em `graficos_fx.md`.

## Desempenho

Medido no Chromium sem tela (WebGL por software, então os números absolutos
são piores que num celular). Valores em ms por quadro de `render()`, nos
efeitos "alta":

| Lugar | Antes | Depois |
|---|---|---|
| Fazenda | 10,4 | 10,3 |
| Cidade | 8,5 | 10,8 |
| Região | 9,4 | 9,9 |
| Mata | 10,0 | 10,3 |

- Na opção "baixa" o jogo roda a 60 qps em todos os lugares.
- A inclinação 2.5D usa uma chamada só quando o objeto está perto do centro
  da tela, e faixas de 10–12 px quando não está.

## O que ainda não foi feito nesta etapa

- **Redesenho dos sprites de personagens e animais:** continuam os da etapa
  anterior (editor de vaqueiro e espécies).
- **Prédios da região leste** (mansão, garagem e outros feitos em `RART`):
  ganharam sombra e inclinação, mas não a camada de detalhes.
- **Interiores:** não mudaram.

## Evidência

Em `production/qa/evidence/`:
- `mapa-inteiro-antes.png` e `mapa-inteiro-depois.png`;
- `mapa-antes-depois-*.png` (fazenda, cidade, rio e região, açude, lajedos, mata);
- `catavento-3d.png`, `arquitetura-quatro-aguas.png`, `camera-chegada-itarantim.png`.
