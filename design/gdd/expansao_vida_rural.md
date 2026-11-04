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
