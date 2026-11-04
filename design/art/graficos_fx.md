# Efeitos gráficos (FX) — pós-processamento WebGL

## Pesquisa e decisão
| Projeto | Licença | O que tem | Decisão |
|---|---|---|---|
| PixiJS / pixi-filters (github.com/pixijs/filters) | MIT (Mathew Groves, Chad Engler) | AdjustmentFilter (gama, contraste, saturação), GodrayFilter, Bloom | Não migrar a engine (o jogo é Canvas 2D próprio). Adaptadas as fórmulas de saturação/contraste e a ideia dos raios por ruído ao longo de uma direção. |
| Phaser | MIT | Engine completa, partículas, pipelines WebGL | Não usado: exigiria reescrever o jogo. Técnica de partículas por emissor reaproveitada na forma de "vida do ar". |
| PixelFX (github.com/patch-gg/pixelfx) | MIT (fonte Patch Pixel fora do MIT) | 244 efeitos pixel art com buffer de cor + buffer de luz aditiva | Adotada a arquitetura cor + luz aditiva (mapa de luz colorido); efeitos de vaga-lume, folhas ao vento e respingo de chuva escritos no estilo dele, código próprio. |
| Radiant (pbakaus/radiant) | MIT | 94 shaders Canvas 2D/WebGL independentes | Referência para calor e água; código próprio. |
Nenhum arquivo desses projetos foi copiado para o jogo; o código é próprio, com as técnicas creditadas acima.

## Como funciona
- O jogo continua desenhando no canvas 2D. Em Média/Alta, um canvas WebGL (`#fxc`, sem toque) fica por cima e
  cada quadro do canvas 2D vira textura de um shader de um passo só, com mais duas texturas pequenas:
  o **mapa de luz** colorido (1/4 da resolução, fontes de luz em modo aditivo) e a **máscara de água/poças**
  (1 pixel por ladrilho visível).
- Shader: luz da noite com cor azulada e fontes quentes (lampiões, janelas, fogueira, forja, fogão, vaga-lumes)
  + bloom pelo mapa de luz; água com ondulação, reflexo do céu da hora, brilhos de sol e estrelas à noite;
  poças na chuva; calor tremendo o ar (mais forte no alto da tela); raios de sol no amanhecer e fim de tarde;
  neblina com densidade por ruído; relâmpago; luz dourada no amanhecer/tarde/pôr do sol; ajuste de cor por
  horário e clima; vinheta só nas cenas e bem leve à noite.
- Nitidez: toda distorção anda em passos de 1 pixel do jogo e a cena é lida com filtro "nearest".
- Interior das casas: sem neblina, calor e raios; luz de lampião, fogão e janela.
- Partículas novas (todas as qualidades exceto Baixa): vaga-lumes, folhas soltas das árvores com o vento
  (muitas na ventania), respingos de chuva no chão.

## Qualidade e desempenho
- Configurações › Efeitos gráficos: **Alta** (tudo), **Média** (sem raios de sol e neblina por ruído),
  **Baixa** (sem shader: o caminho antigo, idêntico ao de antes).
- Sem WebGL: cai sozinho para Baixa. Se a média de quadro passar de 33 ms por 6 s, desce um nível e avisa.
- Custo medido (navegador sem GPU, renderização por software): igual ao modo antigo, porque o shader
  substitui a iluminação que era feita no canvas.

## Limitações honestas
- Sombras projetadas continuam sendo as manchas de contato e as sombras de árvore/casa já existentes; não há
  sombra calculada por fonte de luz.
- Crina e cauda dos cavalos seguem a animação de passo/trote/galope já existente (sem física de vento).
- Antes/depois: `production/qa/evidence/fx-antes-depois-*.png` (esquerda Baixa, direita Alta).

## Rodada de "visual de cinema" (pesquisa de repositórios)

| Projeto | Licença | Técnica | O que entrou no jogo (código próprio) |
|---|---|---|---|
| [pixijs/filters](https://github.com/pixijs/filters) — TiltShiftFilter, AdjustmentFilter | MIT | Desfoque por faixa de tela; ajuste de cor | **Profundidade de campo**: desfoque leve só no alto e no pé da tela, que dá o ar de maquete |
| [pmndrs/postprocessing](https://github.com/pmndrs/postprocessing) — LUT3DEffect e tone mapping | Zlib (partes MIT/BSD) | Gradação de cor por tabela (LUT) e curvas | **Gradação por hora e clima**: sombras e luzes com cor própria (madrugada roxa, tarde laranja com azul-petróleo, noite de luar azul; chuva neutra; seca desbotada), **curva em S** e **vibração** |
| [jwagner/normalmap.js](https://github.com/jwagner/normalmap.js), [Everade/NormalMap32](https://github.com/Everade/NormalMap32), [malbernaz/bevy_lit](https://github.com/malbernaz/bevy_lit) | MIT | Luz por pixel, sombra suave por campo de distância | **Oclusão de ambiente**: sombra suave em volta de casas, cercas e árvores, calculada da máscara de ladrilhos (filtro linear) |
| — | — | Partículas por emissor | **Ondas de vento no capim** (faixas claras passando pelos pastos) e **redemoinhos de poeira** na seca (coluna girando que assusta o gado) |
| — | — | Ruído por quadro | **Grão de filme** leve (mais forte à noite) |

Configurações › "Visual de cinema" liga e desliga a profundidade de campo e o grão. A oclusão e a gradação valem em Média e Alta.
Antes e depois: `production/qa/evidence/graficos-cinema-antes-depois.png` (esquerda: antes; direita: agora; 7h, 12h, 17h, 21h).
