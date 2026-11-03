# Fazenda Boa Esperança — planejamento do novo mapa (Fase 2)

> Fonte de verdade do conteúdo: `design/reference/inventario_original_v3_2.md`.
> Este documento planeja **onde** cada coisa fica. Não cria história nem sistema novo:
> o que for proposta nova está marcado **[NOVO]**.
> Layout em dados: `tools/asset-pipeline/layouts/fazenda_boa_esperanca.json`.

## 1. Referências de pesquisa

**Região.** Itarantim fica na bacia do Rio Pardo, na microrregião pecuarista de Itapetinga, no sudoeste baiano.
A economia gira em torno da pecuária bovina de corte e de leite
([smargiassi](https://smargiassi.com.br/ba/itarantim/)).

**Vegetação.** A região é uma **transição entre Mata Atlântica e Caatinga**, com clima tropical de seca no inverno
(tipo Aw). A vegetação nativa restante cobria cerca de 28% da microrregião em 2008, e a pecuária extensiva é o
principal vetor de conversão
([UESB, anais](https://anais2.uesb.br/index.php/semicit/article/download/4530/4430/12209)).
Os focos de queimada se concentram em pastagem e agricultura
([IFRN, Geoconexões](https://www2.ifrn.edu.br/ojs/index.php/geoconexoes/article/download/15014/4087/46012)).

**Consequência para a arte:**
- não é caatinga pura: pasto plantado (braquiária) verde nas águas e palha na seca;
- capões e fragmentos de mata;
- árvores de sombra deixadas no pasto;
- vegetação de caatinga (mandacaru, xique-xique, palma, umbuzeiro) só nos trechos mais secos e pedregosos;
- **afloramentos de pedra (lajedos)**, coerentes com o nome Itarantim, "diadema de pedra".

**Curral.** O modelo Embrapa "módulo 500" tem curral funcional com **seringa, brete, tronco de contenção,
apartadouro e embarcadouro**
([Embrapa, Curral para bovinos](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/319837/1/Curralparabovinos.pdf);
[1983](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/319846/1/Curralparabovinosdecorte.pdf)).
- A seringa afunila o gado para o brete ([Emater-DF](https://emater.df.gov.br/wp-content/uploads/2018/06/bovinocultura-curral-4.pdf)).
- Recomendação de 2,2 m² por animal adulto e seringa curva ([Revista Cultivar](https://revistacultivar.com.br/index.php/artigos/curral-sem-estresse)).
- O embarcadouro facilita subir no caminhão ([Embrapa, boas práticas](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/866781/1/Boaspraticasinstalacoesruraisemanejo.pdf)).

**Piquetes.** No pastejo rotacionado, piquetes alternam pastejo e descanso. O gado precisa de **acesso ao
bebedouro, ao cocho de sal e à sombra**, e o manejo em **corredores e porteiras** deve ser cuidadoso.
Número de piquetes = descanso ÷ pastejo + 1
([Embrapa, guia prático](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/47246/1/GuiaPraticoImplantacao.pdf);
[Embrapa](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/48759/1/PROCI2008.00305.pdf)).

**Casa.**
- A **taipa** é a expressão típica da habitação sertaneja, com passagem gradual para a alvenaria
  ([UFU, Habitar o Sertão](https://repositorio.ufu.br/bitstream/123456789/36715/3/HabitarSert%c3%a3oHabita%c3%a7%c3%a3o.pdf)).
- O **alpendre** de entrada funciona como área de recepção
  ([Revista Pesquisa FAPESP](https://revistapesquisa.fapesp.br/outros-sertoes/)).

Isso já bate com a progressão original: rancho de taipa → casa de alvenaria → casa sede.

## 2. Escala e dimensões

- **1 tile = 16 px.** Nas construções, 1 tile ≈ 1,5 m: a casa tem 8 × 5 tiles, cerca de 12 × 7,5 m.
- Os **piquetes e o pasto são comprimidos**, como em todo jogo de fazenda: um piquete de 9 × 20 tiles
  representa vários hectares. A proporção entre gado e área é jogável, não literal.
- Mundo completo: 112 × 90 tiles. A fazenda ocupa x 0–59 (60 × 90 tiles); a cidade e os vizinhos ficam a leste
  do riacho. A geografia da cidade e dos vizinhos **não muda**, porque NPCs, rotas e eventos dependem dela.

## 3. Divisão territorial (x = coluna, y = linha, em tiles)

```
 y   x: 0        10        20        30   37-39   40        50      59
 0  +---------------------------------------------------------------+
    | MATA DOS FUNDOS (1-28)   |      GLEBA DO MANDACARU (Piq. 6)    |  expansão norte (comprável)
    | trilha, clareiras, riacho|      caatinga seca, lajedos         |
21  +==========================+=====[porteira da divisa]===========+
22  | SEDE: casa+varanda, depós.,galpão | C | LOTE A    LOTE B        |
    | terreiro, chapéu do avô, baú   R  | O |                         |
    | reservatório (R) ~ caixa d'água   | R | CURRAL  APART.1 SERINGA |
31  | GALINHEIRO | fogueira, churrasq. | R |  de     ------  /BRETE  |
    | cercado,   | mesa, bancos,       | E |  ESPERA APART.2  |      |
    | ninhos     | PÉ DE CAJU | CAVALOS| D |          | EMBARCADOURO |
41  |            |            |cocheira| O |  porteiras para a estrada|
43  |================ ESTRADA DA FAZENDA (corredor de manejo) =======> ponte → cidade
46  | PIQ. 1  | PIQ. 2  | PIQ. 3  | PIQ.4| R |RECEBIMENTO|QUARENTENA  |
    | bebedouro, sombra, terra pisada   |   |-----------+------------ |
    | perto da porteira                 |   |CONFINAM.  |  HARAS      |
66  |  (3 e 4: compráveis, pasto seco)  |   |(compráveis: Curral Grande)|
67  +==========================+=====[porteira da divisa]===========+
    | GLEBA DO AÇUDE (Piq. 7 e 8, açude grande) — expansão sul         |
89  +---------------------------------------------------------------+
```

**Começo pequeno** (regra original preservada): o jogador começa com a sede, o curral, a área dos cavalos e os
Piquetes 1 e 2. Os Piquetes 3 e 4, o Curral Grande (recebimento, confinamento, quarentena e haras), o cercado do
galinheiro e as glebas norte e sul continuam **compráveis**, com as porteiras travadas até a compra.

## 4. Zonas em detalhe

**A. Sede**
- Casa (rancho de taipa no início) virada para o sul, com o alpendre de frente para o terreiro.
- Terreiro de chão batido diante da casa.
- **Chapéu do avô** no esteio do alpendre e **baú** junto à casa (lembranças 1 e 2).
- Depósito de alimentos e galpão de equipamentos lado a lado, a leste da casa.
- **Reservatório** com caixa d'água a nordeste, perto do galpão. É onde se enchem os galões.
- **Roda de fogo:** fogueira com troncos de sentar, churrasqueira, mesa e bancos ao sul do terreiro.
- **Pé de caju** no canto do quintal (lembrança da lata).

**B. Gado**
- **Curral de espera** grande, com chão de terra e lama e cochos de água e ração.
- Ao lado, **dois apartadouros** e a **seringa / brete**. O brete corre para o sul e termina no
  **embarcadouro**, virado para a estrada onde o caminhão encosta.
- Todas as divisões têm **porteiras**.
- A porteira do curral de espera tem as **iniciais T.S.** (lembrança 3).
- Lotes A e B para obras (tronco de contenção, cocho coberto e outras, do sistema original).

**C. Piquetes 1–4**
- Lado a lado ao sul da estrada, que é o **corredor de manejo**. Cada um tem porteira dupla abrindo para a estrada.
- Cada um tem **bebedouro junto à porteira** (onde o gado se concentra).
- **Terra pisada** em volta da porteira e do bebedouro.
- **Árvores de sombra** (umbuzeiro, juazeiro) no meio do pasto.
- Moitas e algumas pedras.
- Os Piquetes 3 e 4 (vendidos pelo avô na seca) têm **pasto mais seco e falhado**. Isso conta a história sem texto.

**D. Pastagens**
- Capim verde.
- Capim seco (DRY).
- Solo exposto (terra pisada).
- Manchas de vegetação nativa nas bordas.
- O capim por tile (rapado e rebrota) é o sistema original e vem depois, na fase dos animais.

**E. Galinheiro**
- Cercado ao lado da sede, com o poleiro coberto (`coop`: ninhos e poleiro no sprite).
- Comedouro e bebedouro.
- Porteira para o terreiro.

**F. Cavalos [NOVO na disposição; elementos do original]**
- Cercado ao sul da roda de fogo, com uma **cocheira** coberta (sprite `estabulo` do original).
- Bebedouro e cocho de milho.
- **Mourão de amarrar** para selar e escovar (ações do original: selar, escovar).
- O **haras grande** continua no Curral Grande comprável. A **Estrebaria** (reprodução e vagas) continua sendo
  uma obra de lote.
- A cocheira é só abrigo e **não** dá os bônus da Estrebaria.

**G. Mata dos fundos e glebas.** Ficam como no original (trilha, clareiras, riacho, fauna, sino da Estrela;
Mandacaru ao norte; açude ao sul).

## 5. Circulação

- **Jogador:** a ponte leste leva à estrada da fazenda, que é a espinha dorsal. Dela saem a sede (norte), o curral
  (norte, leste do corredor), os piquetes (sul) e o corredor x 37–39, que liga as glebas norte e sul.
  A trilha para a mata sai do quintal.
- **Gado:** piquete → porteira → estrada/corredor → porteira do curral de espera → apartação → seringa → brete →
  embarcadouro. Nenhuma rota de gado passa pela sede.
- **Cavalos:** cercado dos cavalos → porteira na estrada.
- **NPCs:** chegam pela ponte e pela estrada; a visita é na varanda da sede.

## 6. Colisões e porteiras

- Cercas, paredes e troncos de árvores grandes **bloqueiam**. Moitas, capim, palma e xique-xique **não**.
- **Porteiras funcionais:** abrem e fecham com **Ação** e animam em 4 quadros.
- Fechada, a porteira bloqueia **todos**, inclusive o gado; aberta, deixa passar.
- Porteiras de terra não comprada ficam **travadas**.
- Água do açude e do reservatório bloqueia por enquanto. O nado vem na fase de refinamento, com o sistema original
  de profundidade.

## 7. Pontos de interação (marcadores no layout)

Porteiras, cochos (encher: água/ração), reservatório (encher galão), baú, chapéu do avô, porteira T.S., pé de caju,
fogueira, churrasqueira, mourão (selar/escovar), depósito, galpão, porta da casa (dormir), embarcadouro
(vender carga), lotes de obra.

O código do Godot liga **um sistema de cada vez** a esses marcadores. Nenhum marcador vira botão sem função.

## 8. Camadas de profundidade

1. Chão (terreno com bordas orgânicas, terra pisada, capim seco).
2. Sombras estáticas (árvores, prédios).
3. Objetos de pé, ordenados pelo pé (y-sort): cercas, porteiras, cochos, árvores, prédios, animais, pessoas.
4. Partículas e clima.
5. Luz do dia (CanvasModulate).
6. Interface.

## 9. Arquitetura (Godot 4.7, GDScript)

A engine continua a mesma, conforme o ADR-0001 aceito. Organização por módulos em `src/`:

| Módulo | Pasta | Responsabilidade | Estado |
|---|---|---|---|
| Núcleo | `src/core/` | dados (GameData), música, entrada, save | pronto (fatia 1) |
| Mundo | `src/world/` | mapa, colisão por grade, porteiras, áreas, interações | **em construção (Fase 3)** |
| Jogabilidade (lógica pura) | `src/gameplay/` | relógio, IA de rebanho, regras de porteira, depois economia, calendário e missões | parcial |
| Entidades | `src/entities/` | vaqueiro, cavalo, gado, depois galinhas, cabras, cães, NPCs | parcial |
| Interface | `src/ui/` | HUD, joystick, título, depois menus | parcial |
| Dados | `assets/data/` | `world_map.json`, `art_sprites.json`, `game_tuning.json` | pronto |
| Arte | `tools/asset-pipeline/` | geradores do protótipo + layout em dados → PNG + JSON | pronto |

**Regras:**
- A lógica fica em classes `RefCounted` testáveis; os nós de cena só apresentam.
- Os números de jogo ficam em `game_tuning.json`.
- A interface só escuta sinais.

**Ordem das fases seguintes:**
1. Fase 3: mapa, porteiras, cochos e interações.
2. Fase 4: animais com necessidades (capim, água, cocho), galinhas, cabras, cães e NPCs com rotinas.
3. Fase 5: cutscene de abertura com o texto oficial, legado de Tiãozinho, calendário e clima, economia e lojas,
   missões, eventos e leilões.
4. Fase 6: refinamento.
5. Fase 7: testes.
