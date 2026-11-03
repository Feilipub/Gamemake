# Inventário do jogo original — Lida no Sertão v3.2.0

> **Fonte de verdade:** `prototypes/html-v3.2/index.html` (7.189 linhas, `GAME_V 3.2.0`, `SAVE_V 7`).
> O arquivo enviado em 03/11/2026 (`index.html`) é **byte a byte idêntico** a este.
> Histórico: `prototypes/html-v2.1/index.html` (v2.1.0, versão anterior, sem a história de Tiãozinho).
> Linhas citadas como `L1234` referem-se ao arquivo v3.2.
>
> Fase 1 da reconstrução. Este documento descreve **o que existe** no original. Onde algo está
> incompleto ou ausente, está marcado com **[INCOMPLETO]** ou **[AUSENTE NO ORIGINAL]** — nada
> aqui foi inventado.

---

## 1. História

### 1.1 Premissa e abertura (`csIntro`, L6378–6420)

Após herdar a **Fazenda Boa Esperança** do avô **Tiãozinho** (Sebastião), o jovem vaqueiro (nome
escolhido pelo jogador) chega a **Itarantim, sudoeste da Bahia**, a cavalo, ao amanhecer (5h25).

Sequência original da cutscene:

1. Título: "RF GAMES APRESENTA" → "LIDA NO SERTÃO · Itarantim · Bahia".
2. *"Itarantim, sudoeste da Bahia. Depois da ponte do riacho fica a terra que o avô deixou."* (cavalga pela estrada)
3. *"[Nome] veio conhecer a Fazenda Boa Esperança, herança de seu avô Tiãozinho."*
4. *"No pasto, os dois bois pé-duro que ficaram: Malhado e Fumaça."* (mugidos)
5. *"Na varanda do rancho, Caramelo, o cão do avô, levanta a cabeça."* (o cão corre até o jogador)
6. O vaqueiro desmonta; **Seu Felipe** caminha até ele.
7. **Felipe** (texto oficial, `FEL_LINES`, L6379):
   - "Seja bem-vindo! Seu avô, Tiãozinho, era um homem muito querido por todos."
   - "Cuidava desta fazenda com muito amor e dedicação."
   - "Agora, ela está em suas mãos. Sua missão é dar continuidade ao trabalho dele e manter vivo esse legado."
8. **Jogador:** "Pode deixar, Seu Felipe. Vou cuidar de tudo do jeito que ele cuidava."
9. *"No esteio da varanda, o chapéu de couro de Tiãozinho continua no prego, como se ele fosse voltar a qualquer hora."*
10. *"Na porteira do curral, as iniciais que ele mesmo entalhou: T.S. Cada canto desta terra guarda uma lembrança dele."*
11. *"A história de Tiãozinho continua agora com você."*

Música: trilha **CUTSCENE** durante a abertura (`MUS.setScene`), **GAME** ao terminar. A cutscene pode ser pulada.

### 1.2 O Legado de Tiãozinho — 13 lembranças (`MEMS`, L6454–6533)

Descobertas aos poucos; cada uma tem **onde/como** e **pré-requisitos**. Objetos com lembrança disponível
**brilham** no mapa. Menu › Vaqueiro › Legado lista as encontradas e dá pistas das próximas.

| # | Chave | Título | Onde / como | Requisito | Efeito |
|---|---|---|---|---|---|
| 1 | `chapeu` | O chapéu de couro | Varanda do rancho (objeto) | — | Bilhete: "O que importa ficou guardado no baú." |
| 2 | `foto` | Tião e Ventania | Baú do rancho | chapéu | Foto com o cavalo tordilho Ventania, na pista do velho Duarte |
| 3 | `ts` | As iniciais T.S. | Porteira do curral (objeto) | — | Curral feito num ano de seca, "um mourão por dia" |
| 4 | `caderno` | O caderno de contas | Dentro do rancho | foto, dia ≥ 3 | Revela a venda dos Piquetes 3 e 4 na seca e a dívida: "um garrote de raça" ao Duarte |
| 5 | `sino` | O sino da Estrela | Clareira da mata (objeto) | ts | Sino da vaca preferida, Estrela |
| 6 | `viola` | A viola dos sábados | Conversa com Dona Zefa | 1 coração | **Ganha a viola** do avô |
| 7 | `fe` | O andor de São João | Conversa com Padre Antônio | 1 coração | — |
| 8 | `briga` | A briga da água | Conversa com Seu Ryan | caderno, 1 coração | Briga pela água do açude; promessa do garrote |
| 9 | `promessa` | Palavra cumprida | **Levar um garrote** (boi macho ≥ 8 meses) até o pasto da Fazenda Duarte | briga | +80 amizade com Ryan; famílias voltam a ser parceiras |
| 10 | `terra` | A terra de volta | Comprar o terreno dos Piquetes 3 e 4 | caderno | +30 amizade com Felipe |
| 11 | `casa` | A casa de tijolo | Reformar o rancho para alvenaria | — | +30 amizade com Felipe |
| 12 | `carta` | A carta | Conversa com Seu Felipe | 2 corações, 6 lembranças | Carta do avô; revela a lata no pé de caju |
| 13 | `lata` | A lata no pé de caju | Cavar no pé de caju do terreiro | carta | **+R$ 6.000**, o **ferro de marcar T.S.** e o retrato da avó. Legado completo |

Texto integral da carta (`carta`): *"Meu neto, se você está lendo isto, é porque veio. Esta terra me deu mais
do que tirou. Trate bem os bichos, cumpra a palavra e ajude os vizinhos, que eles ajudam você. Debaixo do pé
de caju deixei uma lata com o que juntei — é seu. Do seu avô, Sebastião, o Tiãozinho."*

Ao completar: toast *"Legado de Tiãozinho completo! O povo agora te chama de neto do Tião com orgulho."*

### 1.3 Recordações dos moradores (`STORY_TALK`, L6499)

Na primeira conversa (e depois, conforme os corações), cada morador conta algo do avô:

- **Felipe:** Tião ia ver a cheia do riacho debaixo da ponte; ensinou Felipe menino a laçar.
- **Ryan:** "meu avô falava muito dele. Nem sempre bem, nem sempre mal."
- **Zefa:** o jeito de entrar no bar e olhar a prateleira de rapadura.
- **Tonho:** vendia boi sem discutir a arroba — "conta certa não precisa de grito".
- **Bené:** aboiavam juntos nas vaquejadas.
- **Padre:** sentava sempre no terceiro banco da esquerda.
- **Joana:** a primeira vacina da vida dela foi num bezerro do Tião ("calma, doutora…").
- **Dito:** fumo de rolo e rapadura toda segunda, pago adiantado.
- **Cida:** remendou o gibão dele umas dez vezes.
- **Chico:** o rancho foi o primeiro serviço do pai dele.
- **Lúcia:** nunca atrasou uma parcela; "o nome dele ainda abre portas".

### 1.4 Itarantim real (`ITA_FACTS`, L5524) — pesquisado, usado nas conversas

- Nasceu de uma feira livre em **15/06/1946**, nas terras da Fazenda Três Pontas, de Antônio Guedes de
  Souza Alcoforado, perto do Córrego do Jundiá.
- O povoado se chamava **Nova Esperança**; virou município em **1961** com o nome Itarantim
  ("diadema de pedra" em tupi-guarani).
- Aniversário em **15 de junho**, junto do São João.
- Bacia do **Rio Pardo**, microrregião de **Itapetinga**; pecuária de corte e de leite.

---

## 2. Personagens

### 2.1 Jogador

Criado na tela inicial: nome, **estado de origem** (27 UFs, cada uma com traje típico, enfeite de chapéu,
talento e habilidades iniciais — `STATES`, L530), sexo, pele (7), cabelo (8 estilos, 8 cores), chapéu (8),
camisa (5 + 8 cores), calça (5 + 6 cores), botas (4), acessório (7), lenço (7 cores), enfeite regional (14).

Talentos (`PERKS`): aboio +40% alcance · laço +25% · compras −6% · animais perdem felicidade 30% mais devagar ·
montaria gasta 30% menos fôlego · −20% energia.

Habilidades: Lida, Pecuária, Laço, Montaria (sobem com o uso).

Necessidades: **energia** e **fome** (comida, café, refeições no bar; dormir na casa).

Montaria inicial escolhida: cavalo ou muar, raça, pelagem, sexo, nome, sela (3) e estímulo (espora/chicote/nenhum).

### 2.2 Moradores e vizinhos (`NPCDEF`, L3097; `FARMS`, L5704; leiloeiro L5866)

| Id | Nome | Papel | Personalidade | Gosta / Ama / Não gosta |
|---|---|---|---|---|
| felipe | **Sr. Felipe** | Fazenda Campos (vizinho) — gado de corte Nelore | Calmo, experiente, orgulhoso do Nelore; dá conselhos | queijo, café, rapadura / assado, picanha, cupim / farinha |
| ryan | **Sr. Ryan** | Fazenda Duarte — cavalos e muares | Jovem, animado, negociante esperto | carne de sol, café, linguiça / assado, picanha / rapadura |
| zefa | **Dona Zefa** | Dona do Bar | Animada, sabe de tudo | ovo, leite, queijo / assado / lenha |
| tonho | **Seu Tonho** | Açougueiro | Direto e trabalhador | café, farinha / cupim / queijo |
| chico | **Mestre Chico** | Pedreiro | Caprichoso e brincalhão | café, rapadura / assado / ovo |
| lucia | **Dona Lúcia** | Gerente do Banco do Sertão | Séria, organizada e justa | café, leite / queijo / lenha |
| joana | **Joana** | Balconista da Casa do Agro, veterinária | Curiosa e prestativa | ovo, rapadura / leite / carvão |
| dito | **Seu Dito** | Dono do Mercadinho | Pão-duro, bom coração | ovo, leite / queijo / lenha |
| padre | **Padre Antônio** | Pároco da Matriz | Sereno, conhece cada família | café, queijo / assado / carvão |
| cida | **Cida** | Costureira | Alegre e conversadeira | rapadura, leite / queijo / carvão |
| bene | **Seu Bené** | Vaqueiro aposentado, ex-aboiador | Contador de causos | café, carne de sol / assado / ovo |
| abilio | **Seu Abílio** | Fazenda Serra Azul (longe) | Rico, ambicioso; não gosta de perder lance | café, queijo / picanha / ovo |
| graca | **Dona Graça** | Haras Lagoa Seca (longe) | Exigente e elegante; só cavalo de marcha | rapadura, café / queijo / carvão |
| prea | **Seu Zé Preá** | Sítio Umburana (longe) — cabras, jegue, roça | Humilde, falador; sonha com uma vaca de leite | farinha, rapadura, café / canjica, pamonha / — |
| dorival | **Seu Dorival** | Leiloeiro | "Voz de trovão e humor afiado" | café, rapadura / queijo / — |
| — | **Valdemar** | Comprador de frigorífico de fora (só nos leilões) | — | — |

Personagens citados, sem presença física: **Tiãozinho (Sebastião)**, a avó, o "velho Duarte" (avô de
Ryan), o pai de Felipe, a vaca **Estrela**, o cavalo **Ventania**.

Animais nomeados do começo: bois **Malhado** e **Fumaça** (Pé-Duro), o cão **Caramelo** (do avô).

### 2.3 Rotinas (`sched`)

Cada NPC tem horários com destino e atividade (`home`, `work`, `shop`, `eat`, `chat`, `visit`). Regras extras
(`schedFor`, L3182):

- **Domingo 8h48–10h24:** quase todos vão à **missa**.
- **Churrasco do jogador:** convidados vão às churrasqueiras das 18h às 21h36.
- **Visitas:** Felipe e Ryan visitam a varanda da fazenda num dia da semana (se ≥ 2 corações e sem chuva).
- **Eventos:** os moradores vão ao local do evento.
- **Chuva:** quem estava trabalhando/conversando se abriga.
- **Moradores de longe** (Abílio, Graça, Zé Preá, Dorival) só vêm à cidade em dias específicos.
- Andam por um **grafo de estradas** (`roadPath`, `SPOTS`), desviam do jogador, **liberam a porta** ao chegar
  (`npcLife`, L5571), **conversam entre si** com balões de fala (`townTalk`), e **vão atrás do jogador**
  quando têm uma oferta.

### 2.4 Diálogos (`NPC_LINES`, L3134)

Por NPC: `intro` (1ª vez), falas por **nível de amizade** `t0` (0–1 coração), `t1` (2–4), `t2` (5–7), `t3` (8–10),
e falas de **chuva**, **seca** e **noite**. Falas de contexto: lembram presente recebido, favor feito,
churrasco, música; comentam dívida no banco; comentam o tamanho do rebanho. Uma conversa por dia dá amizade.

### 2.5 Amizade e presentes

`fr` 0–1000 → **corações** 0–10. Conversa diária +20; presente que **ama** +80, que **gosta** +45, neutro +20,
que **não gosta** −30 (1 por dia). Favor cumprido +70. Memória: os 10 últimos acontecimentos com cada um.

---

## 3. Missões e acontecimentos

### 3.1 Favores pessoais (`QUESTS`, L3159)

Pedidos de itens (queijo, galão d'água, milho, carne de sol, ovos, leite, lenha, sal, café, churrasco), do tipo
**"fujão"** (laçar e devolver uma vaca ou um burro fugido) e de **compra de animal** (novilha 3★ para Felipe).
Prazo de 3 a 5 dias.

### 3.2 Missões do mundo (`MTYPES`, L5777) — quadro de avisos da praça

| Tipo | Quem pede | Objetivo | Paga | Prazo |
|---|---|---|---|---|
| Rebanho fugido | Felipe | Tocar 3 bois soltos na estrada de volta ao pasto da Fazenda Campos | R$ 600–1.100 | 2 dias |
| Cavalo desaparecido | Ryan | Achar a égua **Brisa** na mata dos fundos e levar à Fazenda Duarte | R$ 700–1.300 | 3 dias |
| Cabra perdida | Zé Preá | Achar a cabra **Pintada** na mata, laçar e levar ao seu curral | R$ 250–450 | 3 dias |
| Cerca derrubada | Felipe/Ryan | Consertar com 1 rolo de arame | R$ 400–700 | 2 dias |
| Água para o gado do vizinho | Felipe | Levar 2 galões e encher o cocho da Fazenda Campos | R$ 300–500 | 1 dia |
| Levar animais | Felipe/Ryan | Levar 2 garrotes de uma fazenda vizinha à outra | R$ 500–900 | 3 dias |
| Ajudar na barraca da feira | Zé Preá/Zefa | Estar na praça no sábado, 7h–11h | R$ 150–300 | até sábado |

No máximo 3 pedidos pendurados e 2 aceitos. **Aceitar e não cumprir** → −30 de amizade ("palavra quebrada").
A tempestade/ventania aumenta a chance da cerca derrubada.

### 3.3 Ofertas espontâneas (`rollOffer`, L5591)

O NPC **vai até o jogador** com uma proposta que depende do estado do jogo:

- Felipe compra os bois machos adultos **12% acima do corretor**.
- Ryan oferece um cavalo, quando o jogador tem poucos equinos.
- Ryan quer comprar um **reprodutor 4★**.
- A Casa do Agro dá **20% de desconto** em selaria e ferramentas.
- Um morador pede ajuda (gera um favor).

---

## 4. Animais e pecuária

### 4.1 Espécies e raças (`DADOS`, L513–620)

- **Bovinos (10):** Pé-Duro (Curraleiro), Nelore, Gir, Guzerá, Tabapuã, Brahman, Senepol, Girolando, Angus, Mestiço.
- **Cavalos (11):** Mangalarga Marchador, Quarto de Milha, Campolina, Crioulo, Pampa, Nordestino, Árabe, Paint Horse,
  Appaloosa; Pantaneiro e Lusitano marcados `old` (só para saves antigos).
- **Muares (3):** Mula de sela, Burro de sela, Burro Baio (`old`).
- **Jumentos (2):** Jumento Nordestino, Jumento Pêga.
- **Cabras (6):** Moxotó, Canindé, Marota, Repartida, Anglo-Nubiana, Boer (cabra/bode/cabrito).
- **Galinhas (4):** Caipira, Carijó, Índio Gigante, Galinha d'Angola.
- **Cães (8):** Vira-lata Caramelo, Fila Brasileiro, Terrier Brasileiro, Rastreador Brasileiro, Pastor da Mantiqueira;
  Border Collie, Boiadeiro Australiano e Ovelheiro Gaúcho marcados `old`. Atributos: tocar gado, guarda, faro.
- **Pelagens** de equinos por raça (rig `COATS`), **temperamentos** (`TEMPS`, 14) e **habilidades** por espécie.

### 4.2 Arte dos animais

**Rig procedural por anatomia** (L1996–2781): esqueleto com corpo, pescoço, cabeça, 4 pernas com IK, cauda e crina.
É rasterizado com sombreamento, nas vistas **lateral, frente e costas**. Animações: idle, walk, trot, gallop, eat,
drink, lie, doze, sit, scared, rear, neigh/moo, bark, sniff, stalk. Também gera a **carroça**, com rodas animadas.

### 4.3 Ficha e necessidades de cada animal (`mkAnimal`)

Nome, espécie, raça, sexo, idade (meses), genética, **estrelas**, felicidade, saúde, condição, **fome**, **sede**,
peso, gestação, pai/mãe, doença, vacina, cuidado, sela, habilidades, temperamento, dois **traços de personalidade**,
vínculo com o dono e histórico de vida.

### 4.4 Comportamento (IA de rebanho, L3880; personalidade, L4392)

- Procura capim, água, sombra e cocho; deita; vagueia.
- Foge do cavaleiro (zona de fuga); obedece ao **aboio** e ao cão.
- **Estouro** com trovão e tiro; coesão com o grupo; um líder puxa a boiada.
- Traços (`TRAITS`): dócil, arisco, curioso, preguiçoso, agitado, corajoso, medroso, territorial, sociável,
  independente. Os traços **alteram de verdade** o susto, a fuga, a coesão, a obediência e a vontade de deitar.

### 4.5 Ciclo diário (`dayTick`, L2019)

- **Felicidade:** cai com fome, sede, curral sujo e lotação; sobe com cavalo escovado, estrebaria e sal mineral.
- **Doença:** a chance aumenta com sujeira, fome e animal novo fora da quarentena; vacina e raça rústica reduzem.
  O remédio cura.
- **Engorda:** ganho de peso do boi pela comida do dia, ração, confinamento, genética, saúde e habilidades.
- **Lactação, gestação e nascimentos.** Éguas com jumento geram muares; muares são estéreis.
- **Ovos:** as galinhas botam, depois são recolhidos e vendidos.
- **Leite:** com a Sala de Ordenha.

### 4.6 Manejo e ferramentas do jogador

Aboio, **laço**, cabresto (puxar), montar/desmontar/selar, escovar (rasqueadeira), dar ração, sal e água (galões),
vacinar e tratar, **tronco de contenção** (vacinação em lote), limpar curral, porteiras abrir/fechar,
carroça com jumento (carga), **apartar** e levar ao curral ou embarcadouro, vender no curral/açougue/ficha.

---

## 5. Fazenda, construções e terra

### 5.1 Mapa original (L713–1022; `AREAS` L720)

112 × 90 tiles de 16 px. A oeste, a fazenda (x < 60); no meio, um riacho com ponte (x ≈ 62); a leste,
a cidade (x 68–111, y 28–62). As fazendas vizinhas ficam nos cantos leste: **Campos** ao norte, **Duarte** ao sul.
Há também a **mata dos fundos**, ao norte e oeste da fazenda.

Áreas cercadas, cada uma com porteira de 2 tiles:

- Piquetes 1, 2, 3 e 4 (lado a lado, ao sul)
- Curral Principal, Recebimento, Confinamento e Quarentena
- Haras
- Galinheiro
- Piquetes 6 (Mandacaru), 7 e 8 (Açude), nas expansões
- Pastos da Campos e da Duarte

Prédios da fazenda (`BDEF`): Casa Sede (rancho de taipa no início), Galpão de Equipamentos e Depósito de Alimentos.

Prédios da cidade: Igreja Matriz, Banco do Sertão, Casa do Pedreiro, Mercadinho, Bar da Zefa, Açougue do Tonho,
Casa do Agro, casas da Cida e do Seu Bené. Há ainda a praça com coreto e o **recinto do leilão**.

Lotes para obras: A, B e C, mais D e E nas expansões.

Outros elementos: cochos de ração e de água (com nível), reservatório, fogueira, churrasqueira, forrageira,
baú, chapéu do avô, placa T.S. e pé de caju.

### 5.2 Começo pequeno e progressão (`startSmall`, `PARCELS`, `RANKS`, L1115–1140)

- **Novo jogo:** rancho de taipa, curral, Piquetes 1–2 e mata dos fundos; R$ 1.500 em mãos e R$ 2.500 no banco;
  **2 bois Pé-Duro**, o cão Caramelo e a montaria.
- **Terras à venda:**
  - Piquetes 3 e 4: R$ 14.000
  - Curral Grande (recebimento, confinamento, quarentena, haras e Lote B): R$ 24.000
  - Cercado do galinheiro: R$ 2.500
  - Gleba do Mandacaru (norte): R$ 30.000
  - Gleba do Açude (sul): R$ 45.000
  
  As porteiras de terra não comprada ficam **travadas**.
- **Casa:**
  - Rancho de taipa (início)
  - Casa de alvenaria: R$ 18.000 + materiais; dá mais energia ao acordar
  - Casa sede: R$ 45.000 + materiais
- **Títulos** (pelo patrimônio):
  - Pequeno produtor
  - Criador regional (R$ 60 mil): libera o Encontro de Criadores
  - Fazendeiro reconhecido (R$ 200 mil)
  - Grande pecuarista (R$ 600 mil)

### 5.3 Construções nos lotes (`BUILD`, L700) — Mestre Chico, 7h–17h, chuva atrasa

| Obra | Custo | Efeito |
|---|---|---|
| Silo de Grãos | R$ 9.000 | +3.000 kg no depósito |
| Bebedouro Australiano | R$ 6.500 | Reabastece os cochos d'água |
| Poço Artesiano | R$ 14.000 | Reservatório cheio mesmo na seca |
| Casa de Peão | R$ 12.000 | +2 vagas de funcionário, descanso 2× mais rápido |
| Tronco de Contenção | R$ 5.500 | Vacinação e tratamento em lote |
| Estrebaria | R$ 16.000 | +6 vagas de equinos, reprodução de equinos |
| Galinheiro Grande | R$ 4.800 | +12 aves, +30% de ovos |
| Sala de Ordenha | R$ 18.000 (requer poço) | Leite diário |
| Cocho Coberto | R$ 7.000 | Confinamento 3× maior, +25% de engorda |

Cada obra também consome materiais: madeira, tijolo, cimento, telha e arame.

### 5.4 Pastagem

Grade de capim por tile (`grass`, 0–255). Os animais rapam o capim, que **rebrota** (mais rápido nas águas).
Há indicador de estado por piquete e **rodízio** é recomendado. O capim é desenhado em tufos animados
de 5 níveis.

### 5.5 Açude e água

Profundidade calculada (`wdepth`). O jogador **vadeia e nada**; o cavalo vadeia com a água pela barriga.
O riacho tem 2 de fundo (o gado só passa pela ponte). O nível do açude sobe com a chuva e cai na seca,
quando a margem vira lama rachada.

---

## 6. Peões e trabalhadores (L2197, L4091)

Candidatos com nome, especialidade e salário. Pagos por semana. Ordens possíveis:

- dar ração;
- encher água;
- limpar curral;
- tocar o gado ao curral ou a um piquete;
- **ajudar a tocar o gado com o jogador**.

O peão pode ter **montaria própria**. Fora do serviço, segue uma rotina: senta, varre, faz roda na
**fogueira** à noite (assentos, viola) e dorme no galpão.

---

## 7. Economia e comércio

- **Arroba** do boi varia por dia (R$ 255–390), mais cara na seca; o histórico de 30 dias aparece num gráfico.
- **Lojas:**
  - Mercadinho: compra ovo e leite; vende comida, viola e outros.
  - Bar da Zefa: 5 refeições regionais.
  - Açougue: compra boi pela arroba; corta carnes (7 cortes).
  - Casa do Agro: trato, veterinária, selaria e ferramentas, armas fictícias; vende e compra animais.
  - Pedreiro: obras e materiais.
- **Banco do Sertão** (Dona Lúcia):
  - 5 linhas de crédito: pessoal 3,2%, rural 1,4%, terra 1,1%, obra 1,2% e pecuário 1,3% ao mês.
  - Os juros variam com o **score**.
  - Poupança rende 0,16% ao dia.
  - Parcela atrasada gera multa e os moradores comentam.
- **Negociação de animais** (`HAGGLE`): proposta e contraproposta, com **paciência** própria de cada NPC.
  O preço de reserva depende de qualidade, saúde, procura regional, mercado e amizade. Ofertas ruins cansam
  o negociador e estragam a amizade.
- **Embarcadouro / frigorífico:** venda em carga.
- **Mochila** com limite de peso; **depósito** com limite; **carroça** com carga.

## 8. Leilões (L5862–6063)

Todo **sábado à tarde (13h–18h)** no recinto da cidade, com **Seu Dorival**. O tipo de leilão muda conforme a
semana do mês: gado de corte, cavalos, reprodutores, muares e jumentos. Em junho há o **leilão beneficente de
São João**; no 2º fim de semana de julho, o **Grande leilão regional**.

Cada comprador NPC tem dinheiro, preferências, raças favoritas e estratégia própria (paciente, agressivo ou
cauteloso). O jogador pode **dar lances** e **consignar** seus animais.

## 9. Calendário, tempo e eventos

- **Calendário próprio:** 12 meses de 28 dias (4 semanas). O jogo começa em **1º de maio do Ano 1**.
  **Águas** vão de novembro a abril; **seca**, de maio a outubro.
- **Dia:** cerca de 4 minutos reais. Fases: madrugada, amanhecer, manhã, meio-dia, tarde, pôr do sol e noite.
  Dormir na casa depois das 18h.
- **Clima** em 8 tipos: sol forte, parcial, nublado, chuva fraca, chuva forte, tempestade, neblina e ventania.
  A chance de cada um depende do mês. O plano do dia tem manhã, tarde e noite (por exemplo, temporal no fim da
  tarde nas águas). A transição é suave. Há **previsão de 4 dias**, **lama** nas estradas depois da chuva e
  **raios** que causam estouro da boiada. O calor faz os bichos beberem mais.
- **Eventos** (`EVENTS`, L5532):

| Evento | Quando | Onde | O que tem |
|---|---|---|---|
| Feira livre | todo sábado, 6h–12h30 | praça | barracas (queijo, rapadura, milho assado, pamonha) |
| Forró na praça | toda sexta, 19h–23h30 | praça | dança (amizade com quem está na praça) |
| São João e aniversário de Itarantim | 15, 23 e 24 de junho, 17h–24h | praça | fogueira, quadrilha, canjica, pamonha |
| Vaquejada | último domingo do mês, 8h–17h | Fazenda Duarte | **minijogo**: emparelhar e derrubar o boi entre as faixas ("valeu boi!"), com prêmio |
| Feira agropecuária | 2º fim de semana de julho | praça | **concurso** de animais (1º/2º/3º lugar) e leilão |
| Encontro de criadores | 1º domingo do mês, 15h–20h | bar | só para quem é Criador regional ou mais: vender reprodutores 3★+ |
| Natal na matriz | 25 de dezembro | praça | missa do galo, ceia |
| Leilão de animais | sábados, 13h–18h | recinto | ver seção 8 |

- **Decoração** dos eventos: bandeirinhas, barracas, fogueira, coreto com músicos e pista da vaquejada.
- **Churrasco na fazenda** com convidados; **fogueira** com viola e violão em **minijogo de música**.
  O NPC que ouve ganha amizade.

## 10. Mata, fauna e defesa (L4127–4321)

Fauna da mata dos fundos, com horários (diurno ou noturno), zona de fuga e velocidade próprias:

- **Mamíferos:** tatu-peba, raposa (cachorro-do-mato), tamanduá-mirim, veado-catingueiro, saruê.
- **Serpentes:** jararaca, cascavel com chocalho, jiboia e coral. As peçonhentas exigem cuidado.
- **Aves:** coruja-buraqueira, seriema e gavião-carijó.
- **Onça-parda:** rara, ronda à noite e ataca a criação. É afastada com barulho, cão e **tiro de advertência**.

Defesa: **facão** (tecla G) e **espingarda de caça fictícia** com cartuchos, só para tiros de advertência; o estrondo
também assusta o gado. O jogador tem **vida** e pode ser ferido.

## 11. Salvamento (L6533–6614)

- **IndexedDB**, com cópia no localStorage.
- **3 espaços** de partida.
- **Autosave:** às 6h, ao dormir, a cada 60 s e ao sair.
- **Cópia de segurança** com checksum.
- **Migrações** de versão (`MIGR`) até o save v7.

## 12. Controles e interface

- **Dois modos**, escolhidos nas Configurações:
  - **Joystick**: joystick e botões Correr, Aboio, Laço, Montar e Ação.
  - **Toque**: tocar no destino para ir até lá (caminho A\*, L4321), tocar em animais, objetos e pessoas.
- Teclado: WASD/setas, Shift, E/Espaço, Q, F, R, G, I, M, Esc, +/−.
- Pinça para zoom. Rotação de tela com layout para paisagem.
- **Menus:**
  - Mochila
  - Menu (abas Vaqueiro, Fazenda, Animais, Peões, Banco, Região, Calendário e Legado)
  - Vender
  - Ficha do animal com ações
  - Configurações: volumes separados, qualidade, tamanho dos controles e vibração
- Abertura RF GAMES; créditos com Ryan Duarte Borges e Felipe Rodrigues Campos.
- Trilhas **INTRO, CUTSCENE, GAME1 e GAME2**.

---

## 13. Incompleto, desligado ou ausente

| Item | Situação | Onde |
|---|---|---|
| **Plantio e colheita (roça, horta, palma, capineira)** | **[AUSENTE NO ORIGINAL]** — "roça" só aparece em descrições do sítio do Zé Preá | — |
| **Porcos e chiqueiro** | **[AUSENTE NO ORIGINAL]** | — |
| Título exigido nos eventos | **[INCOMPLETO]** — `EVENTS[ev].rank && false`: a regra de rank não filtra para onde os NPCs vão | L3189 |
| Pose sentada dos NPCs em festas | **[INCOMPLETO]** — `e.act === 'festa' && false` desliga o "sentar" na festa | L3218 |
| Raças `old` (Pantaneiro, Lusitano, Burro Baio, Border Collie, Boiadeiro Australiano, Ovelheiro) | Mantidas só para saves antigos; fora das lojas e da criação | DADOS |
| Ícones de itens | Ainda há **emojis** no campo `i` de muitos itens (ração, sal, vacina, carnes…); existe gerador de ícone pixel (`itemIconURL`), mas os emojis continuam nos dados | L640–690 |
| Fazendas distantes | Simuladas só em números (compram, vendem e constroem por dia), sem mapa próprio | L5713 |
| Cutscene CUTSCENE ligada à história | Existe; usa os sprites do mundo e não tem cenas desenhadas à parte | L6378 |

## 14. Já portado para Godot (fatia 1, `src/`)

Mapa original exportado (chão, colisão, cercas, porteiras fechadas, árvores e prédios dia/noite), vaqueiro
padrão, montaria (Mangalarga castanho) com passo, trote, galope e fôlego, cavalo que pasta e atende ao
assobio, 2 Pé-Duro com pastejo, fuga do cavaleiro e aboio, câmera, toque, título, músicas e save.

Fase 3: novo mapa da fazenda (layout em dados), porteiras funcionais com travas de terreno, cochos no mapa.

**Todo o resto deste inventário ainda está só no HTML.**
