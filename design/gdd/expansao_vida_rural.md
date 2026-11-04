# Expansão: vida rural (rodada 1)

Expansão construída sobre o jogo existente (`web/index.html`), sem trocar o motor e
sem apagar sistemas. Antes de começar foi criado o ponto de restauração local
`backup-pre-expansao`.

## Overview

Esta rodada acrescenta quatro sistemas completos e ligados aos que já existiam:

- **Pesca**
- **Roçado de comida com cozinha**
- **Exploração com relíquias e a história do avô**
- **Vida ambiental**

Também corrige um defeito antigo: o riacho da mata nunca aparecia no mapa.

## Player Fantasy

No fim da tarde, pescar traíra no açude; no dia seguinte, levar a mandioca colhida
para virar farinha no fogão a lenha; num domingo, subir ao cruzeiro para ver o vale
e achar a última carta do avô. Tudo isso com o gato da casa esperando um peixe na
varanda.

## Detailed Rules

### Pesca
- **Lugares:** açude (lagoas e açudes), rio (os dois rios grandes) e riacho (mata).
  `waterKind()` classifica a água pelo ladrilho.
- **Espécies (12), definidas em `FISHD`:** cada uma tem lugar, horário, peso mínimo
  e máximo, dificuldade (1–5), preço por kg e, quando houver, preferência de chuva
  ou sol, isca favorita e raridade.
- **Equipamento:** vara (R$ 85) e iscas (minhoca R$ 1,50; massa de milho R$ 2,50),
  na Casa do Agro, aba Ferramentas. A massa também sai do fogão (1 espiga = 6
  iscas). A isca é gasta quando o peixe pega, escapa ou rouba.
- **Fluxo:** lançar, esperar, fisgar e brigar.
  - **Fisgada:** a janela para fisgar dura 0,95 s.
  - **Briga:** a tensão sobe enquanto você segura e cai quando solta. O peixe dá
    trancos. Ficar na zona verde enche o progresso; fora dela, o progresso esvazia.
  - **Fim:** tensão em 100% arrebenta a linha; progresso zerado deixa o peixe
    escapar.
- **Resultado:** o peixe vai para a mochila (`pe_<espécie>`) e entra na coleção com
  quantidade e recorde. Vende no Mercadinho e vira "peixe assado" no fogão.

### Roçado de comida
- **Leiras:** as mesmas 12 leiras da roça aceitam milho, feijão-de-corda, mandioca,
  abóbora e cana.
- **Crescimento:** só avança nos dias com água (chuva no dia anterior ou rega).
  Quatro dias secos seguidos e a lavoura se perde.
- **Adubo:** 1 saco de esterco por leira dá +50% na colheita.
- **Depois da colheita:** a leira fica vazia para replantar. A forragem nativa
  continua como antes: cresce pela idade e rebrota.

### Cozinha (fogão a lenha da casa)
- **9 receitas:** farinha, rapadura, doce de abóbora, cuscuz, pamonha, canjica,
  feijão tropeiro, peixe assado e massa de isca.
- **Custo:** gastam ingredientes reais da mochila e 1 feixe de lenha (ou carvão)
  por fornada.
- **Destino:** as comidas matam a fome e dão energia, podem ser presente e são
  vendidas no Mercadinho.

### Exploração
| Lugar | Onde | Regra | Recompensa |
|---|---|---|---|
| Cachoeira da Mata | nascente do riacho da mata | banho 1x por dia | +25 de energia; carta I |
| Gruta do Lajedo | margem do rio, região leste | precisa de lampião | pinturas rupestres; carta II e fóssil |
| Tapera do Velho Juca | margem do rio, sul | vasculhar uma vez | carta III e lenha |
| Cruzeiro do Mirante | margem do rio, norte | contemplar | a câmera percorre o vale; carta IV |

- **Relíquias soltas:** sete pelo mapa. Brilham só a menos de 90 px e são pegas com
  "Algo brilhando no chão".
- **Baú do avô:** com as quatro cartas, cave ao pé do umbuzeiro atrás da casa. Dá
  R$ 3.000 e a Medalha da Vaquejada de 1974.
- **Aba Coleção (menu):** peixes, relíquias, o texto das cartas e os lugares.

### Vida ambiental
- **Borboletas:** de dia, sem chuva.
- **Abelhas:** em volta de flores e frutíferas.
- **Sapos:** à noite ou na chuva, na beira d'água. Fogem para a água quando você
  chega e coaxam.
- **Patos:** quatro patos nadam no açude da fazenda.
- **Gatos Mingau e Frajola:**
  - **Rotina:** dormem ao sol, passeiam entre lugares da casa e miam.
  - **Carinho:** +0,5 de afeto e +2 de energia, uma vez por dia.
  - **Peixe:** +2 de afeto, uma vez por dia.
  - **Afeto 6 ou mais:** o gato segue o vaqueiro perto da casa.
- **Simulação por visibilidade:** só o que está perto da câmera é simulado.

## Formulas

- **Mordida por segundo** = 0,22 × 1,8 (5–8h ou 16–19h) × 0,55 (11–14h com
  sol ou calor) × 1,4 (chuva) × 0,5 (tempestade).
- **Peso do peixe** = mín + (máx − mín) × u^1,7, com u sorteado entre 0 e 1.
  Peixes grandes são mais raros.
- **Zona verde** = 0,52 − 0,075 × dificuldade, centrada em 0,5.
- **Tranco** = ±(0,08 + 0,09 × dificuldade).
- **Progresso** = +(0,28 − 0,03 × dificuldade)/s dentro da zona; −0,10/s fora.
- **Colheita de comida** = rendimento base × 1,5 com adubo.

## Edge Cases

- **Mochila cheia:** a colheita vai para o depósito; a cozinha recusa se não
  couber o resultado.
- **Sem isca, sem vara ou sem lenha:** aparece um aviso e nada é gasto.
- **Saves antigos:** os campos novos (`S.fish`, `S.relics`, `S.poi`, `S.cats`,
  `q.g`/`q.w`/`q.ad`) são criados com valores padrão na primeira leitura. As
  leiras e itens antigos continuam iguais.
- **Item novo numa semana de loja já aberta:** entra no estoque da Casa do Agro
  na hora.
- **Plantas no caminho dos lugares de exploração:** são retiradas na geração do
  mapa e a pedra fica sólida.

## Dependencies

Mochila (`addInv`, `useInv`, `invRoom`), lojas (Casa do Agro, Mercadinho), clima
(`isRain`, `S.weather`), interiores (fogão da casa), câmera (`CINE`), missões
(`questEvent` para `fish`, `cook`, `harvest` e `relic`), salvamento (`SAVE`) e
áudio (`AU`).

## Tuning Knobs

`FISHD` (pesos, preços, dificuldade, horários), `FISH.biteRate`, `CROPS`
(dias, rendimento, preço da semente), `RECIPES`, a posição de `POI`, `RELICS` e
`BAU_AVO`, e `CAT_SPOTS`.

## Acceptance Criteria

Todos verificados por scripts automatizados no navegador:

| Teste | Cobre | Resultado |
|---|---|---|
| `fish_test` | comprar, pescar, briga, linha arrebentada, venda, coleção salva, sem isca, peixes por horário | 12 de 12 |
| `roca2_test` | plantar, adubar, sem água não cresce, regar, colher, seca mata, chuva rega, 4 receitas, comer, vender, salvar | 17 de 17 |
| `expl_test` | os 4 lugares, lampião, 12 relíquias, baú, aba Coleção, salvar | 17 de 17 |
| `life_test` | gatos, carinho, peixe, borboletas, patos, sapos à noite, afeto salvo | 11 de 11 |

A regressão dos sistemas antigos também passou: inventário, casas, cavalos
emprestados, horário, missões, editor, abertura, região, correções anteriores,
Agro, roça e o fluxo completo de um jogo novo.

## O que esta rodada não fez

Já existia antes desta rodada: genética e leilão do gado, feira, vaquejada, São
João, ordenha e queijaria, interiores, cavalos emprestados, clima com seca e lama
nas estradas, missões e memória dos NPCs.

| Pedido | Situação |
|---|---|
| Ovelhas e patos de criação (produção, reprodução) | Não feito. Os patos de agora são só ambientais. |
| Padaria, restaurante, oficina | Não feito. Faltam os prédios e os donos no mapa da cidade. |
| Mais falas variadas por NPC e relações entre moradores | Não ampliado nesta rodada. |
| Ferramenta livre de construir, girar e remover cercas e prédios | Não feito. Hoje existem lotes, obras e mover objetos. |
| Redesenho dos sprites de personagens e animais | Não feito. |
| Saltar obstáculos a cavalo | Não feito. |
| Música nova | Não feita. Os sons novos são sintetizados: sapo, pato, miado e ronronar. |

## Rodada 2

| Sistema | O que foi feito | Teste |
|---|---|---|
| Ovelhas | 4 raças deslanadas (Santa Inês, Morada Nova, Somalis, Dorper): carne, borregos com gêmeos por raça, aprisco, rebanho, tocada, compra e venda | `criacao_test` 14/14 |
| Patos de criação | Pato-crioulo e marreca-pequim: passam o dia no açude, botam ovo de pata, vendido no Mercadinho e na Padaria | `criacao_test` |
| Padaria, restaurante e oficina | Donos novos (Neide, Damião, Bira) com rotina, horário, estoque diário e preços variáveis. A padaria compra produção da fazenda; o restaurante tem encomenda do dia (contrato); a oficina vende material e reforma a carroça (400 → 700 kg) | `vila_test` 19/19 |
| Conversas e laços | 15 laços entre moradores (aba Relações). Falas entre moradores conforme o laço; falas com contexto (tempo, estação, hora, estado do vaqueiro, recordes, festas, fofoca) e banco de prosa do sertão | `vila_test` |
| Construção | Cerca, cocho, bebedouro, abrigo, banco, poste, canteiro e espantalho, com material real. Regras de lugar, sem sobreposição e sem fechar caminhos (busca em largura); girar e remover | `construcao_test` 19/19 |
| Salto a cavalo | Salto sobre cerca galopando, com refugo por temperamento, embalo e treino | `salto_test` 8/8 |
| Música | 4 peças originais sintetizadas (baião, xote, toada, quadrilha) no revezamento, nas festas e à noite | `musica_test` 9/9 |
| Animais (arte) | Volume em faixas com meio-tom pontilhado e contraste maior em todas as pelagens | inspeção visual |

### Correções da rodada 2
- **Compras:** iam para o Recebimento, que pertence ao Terreno do Curral Grande, ainda não comprado. Agora vão para um cercado que é seu; animais já presos lá são levados ao curral ao carregar o save.
- **Abertura:** o vaqueiro passava ao lado da porteira. Agora para, espera abrir e entra por ela.
- **Economia do bezerro:**
  - O ágio do bezerro caía de uma vez aos 12 dias; agora diminui aos poucos com o peso (até +25% aos 120 kg, zerando aos 300 kg).
  - Boi gordo (macho acima de 450 kg) ganha +6%.
  - A Casa do Agro tem um lote de 6 bezerros desmamados toda semana, sem a margem da loja.
- Teste: `entrega_test` 7/7.

### Ainda não feito
- Redesenho dos personagens (rostos e roupas): os sprites são os da etapa anterior.
- O caixa da fazenda vizinha Serra cresce rápido demais (observado: ~579 mil → ~1,07 milhão em 20 dias).

## Progressão do cavalo

- **Habilidades** (nível 1–10): Velocidade, Fôlego, Lida com gado, Salto e Doma.
  - O nível inicial vem da raça (Quarto de Milha: Lida 3; Mangalarga: Fôlego 3…) e dos talentos de nascença.
  - O cavalo ganha experiência pelo uso: galopar, galopar cansado, cavalgar, tocar o gado montado, laçar montado, saltar e escovar.
  - Também ganha com 5 treinos diários na ficha. O Haras rende +40% e a aula do Sr. Ryan (R$ 250) dobra a experiência do dia.
- **Experiência por nível:** 60 + 45 × nível.
- **Talentos** (nível 4 e nível 8 de cada habilidade):

  | Habilidade | Nível 4 | Nível 8 |
  |---|---|---|
  | Velocidade | Arrancada | Vento do Sertão |
  | Fôlego | Segundo Fôlego | Incansável |
  | Lida com gado | Faro de Gado | Cavalo de Vaquejada |
  | Salto | Pulo Limpo | Asas |
  | Doma | Vem no Assovio | Parceiro |

- **Efeitos por nível:**
  - Velocidade: galope +1,5%.
  - Fôlego: gasto −4,5% e recuperação +5%.
  - Lida com gado: alcance +4%.
  - Salto: refugo −2 pontos.
  - Doma: arrancada +3%.
- **Humor do dia:** animado, tranquilo, cansado, birrento ou carente. Depende de escovação, comida, saúde, vínculo, quanto cavalgou ontem e personalidade. Muda a velocidade e o aprendizado.
- **Personalidade com efeito:**
  - Curioso aprende mais rápido.
  - Agitado galopa mais e cansa mais.
  - Preguiçoso recupera o fôlego devagar.
  - Obediente rende mais na doma.
  - Teimoso às vezes empaca.
  - Medroso e arisco se assustam com trovão e onça.
  - Corajoso salta melhor e não se assusta.
- **Valor de mercado:** +2,5% por nível acima do inicial.
- **Teste:** `tests/web/cavalo_test.js`, 18/18.

## Rodada 3 — terra, pasto e lida do gado

### Pesquisa (fontes)

- Cura do umbigo com iodo nos primeiros dias; umbigo mal curado atrai a mosca-varejeira (bicheira); a ivermectina/mata-bicheira protege
  ([Agrolink](https://www.agrolink.com.br/noticias/bezerros-recem-nascidos-demandam-grande-atencao-no-manejo-sanitario_185509.html), [Embrapa COT48](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/320642/1/COT48.pdf.pdf)).
- Sal mineral o ano todo; na seca, sal com ureia/proteinado ([IF Goiano](https://repositorio.ifgoiano.edu.br/bitstream/prefix/5495/1/Tcc_%20Gustavo%20Lima.pdf)).
- Pastejo rotacionado: ocupação de até 7 dias, nº de piquetes = descanso/ocupação + 1; na caatinga, 28–42 dias de descanso e 1–2 UA/ha
  ([Embrapa guia](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/47246/1/GuiaPraticoImplantacao.pdf), [Embrapa Petrolina](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/397966/1/1651.pdf)).
- A lida do vaqueiro: tanger o gado manso, ordenhar, curar bicheira, aboiar; gibão e perneiras contra o espinho
  ([Diário do Nordeste](https://diariodonordeste.verdesmares.com.br/opiniao/colunistas/xico-sa/lengo-lengo-tengo-pense-na-importancia-do-vaqueiro-1.3537487), [A Tarde](https://atarde.com.br/fenagro/estas-pecas-de-couro-salvam-vaqueiros-todos-os-dias-entenda-como-1370687)).

### Mapa maior: Retiro do Umbuzeiro

O mundo passou de 110 para 150 linhas (`MH`); os interiores das casas ficam abaixo (`MHT = MH + 32`). Abaixo do Pomar (y 110–149) fica o
**Retiro**, terra da Fazenda Boa Esperança herdada do avô, mas **abandonada** (cerca caída com buracos, porteiras travadas). Cada cercado é recuperado aos poucos, com dinheiro, pela placa do Retiro, pela porteira ou pela aba Fazenda: Piquete 9 R$ 6 000, Piquete 10 R$ 8 000, Piquete 11 R$ 10 000, Piquete 12 R$ 12 000, Curral com brete e balança R$ 12 000, Piquete da Aguada R$ 18 000 (total R$ 66 000). Assim a terra cresce com a progressão; quem tinha comprado o Retiro na versão anterior fica com tudo recuperado. Ele tem:
- 4 piquetes (9 a 12) de arame farpado em volta de um **corredor de manejo**: todas as porteiras abrem no corredor, que leva à estrada;
- o **Piquete da Aguada**, com açude natural (o gado bebe no açude, sem bebedouro);
- o **Curral do Retiro** (tábua), a casa do retireiro e o **brete com tronco de contenção e balança**;
- cochos de sal **cobertos** em cada piquete e umbuzeiros de sombra.

### Lida do gado (ficha do animal, caderneta e objetos)

| Lida | Onde | Precisa | Efeito |
|---|---|---|---|
| Curar umbigo | ficha do bezerro, até 3 dias de vida | iodo (¼ frasco) | sem cura: 14%/dia de bicheira (×1,5 nas águas) |
| Bicheira | aparece sozinha | mata-bicheira | −7 saúde e −5 felicidade por dia; ganho de peso ×0,5; valor −10% |
| Castrar | macho de 3 a 18 dias, num curral | mata-bicheira | capão: não cobre, fica manso, ganho ×1,08 depois de adulto; ferida 3 dias |
| Desmamar | bezerro ≥ 6 dias (cabrito ≥ 3) mamando | — | vaca +15 condição e fertilidade ×1,5 por 20 dias; mamando com 4+ dias, a vaca emprenha ×0,6 |
| Ferrar | boi/cavalo ≥ 6 dias, num curral | ferro T.S. do avô ou ferro novo | +3% no valor; ferida 3 dias |
| Pesar | num curral, com a balança do Retiro ou um tronco | — | guarda o histórico e mostra o GMD (kg/dia) |
| Brete | objeto no Retiro | — | pesa o lote do Curral do Retiro: kg, arrobas (52% de carcaça) e valor |
| Caderneta | botão na aba Fazenda | — | conta por cercado e lista a lida pendente |
| Sal no cocho coberto | objeto nos piquetes | 1 saco de sal | 7 dias de sal (o cocho comum dá 3) |

GMD = (peso atual − peso anterior) / (dias entre pesagens × 30), já que 1 dia de jogo vale cerca de 1 mês do animal.

Teste: `tests/web/lida_test.js` (23 verificações).

### Pessoas no esqueleto dos animais

As pessoas passaram a ser desenhadas pelo mesmo esqueleto (`RIG`) dos bois e cavalos (`PRIG.draw`):
- cabeça, tronco, braços e pernas são elipses, cápsulas e polígonos com volume em faixas (luz quente em cima, sombra fria embaixo, membros iluminados a oeste);
- uma linha separa as partes que se cobrem, e o contorno seletivo é tingido pela cor da peça;
- a cabeça ficou menor (proporção menos "cabeçuda"), mais perto dos animais;
- continuam todas as opções do editor (sexo, corpo, pele, 13 cabelos, barbas, olhos, 8 camisas, 5 calças, 4 botas, 7 chapéus, ornamentos e acessórios) e todas as poses (andar, correr, montar, sentar, agachar, ferramentas, viola).

Em Opções › Desenho das pessoas dá para voltar ao desenho **Clássico**. Os retratos dos diálogos não mudaram.

Evidência: `production/qa/evidence/personagens-classico-x-novo.png`, `personagens-novo-com-cavalo.png`, `retiro-mapa.png`, `retiro-brete.png`, `lida-caderneta.png`, `lida-balanca.png`.
