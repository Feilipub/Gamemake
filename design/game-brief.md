# Game Brief: Terra de Crinas

**One-sentence pitch:** Uma aventura em mundo aberto de pixel art 2.5D em que cada cavalo é um indivíduo — raça, corpo, atributos e personalidade de verdade — e você explora, doma, cria, treina e vive a sua história ao lado deles.

## Core loop
- Explorar o mundo contínuo a pé e a cavalo (passo, trote, galope, disparada).
- Encontrar cavalos e lugares; aproximar, ganhar confiança e domar (Fase 2).
- Cuidar, treinar e personalizar os cavalos — o vínculo e os atributos crescem.
- Usar os cavalos melhores para chegar mais longe, vencer desafios e avançar a aventura.

## Player goal & fail state — what "working" looks like
- Objetivo: formar um estábulo de cavalos únicos e completar a jornada pelo vale e além.
- Sessão completa quando o jogador descobre algo novo e o cavalo evolui (vínculo, atributo ou conquista). Sem derrota dura: cavalo esgotado não galopa, susto derruba o ritmo, cavalo independente pode não atender.

## MVP — what must exist to be the game (Fase 1, entregue)
1. Menu inicial, criação de personagem e escolha do primeiro cavalo.
2. Vale aberto contínuo gerado em pedaços (chunks) com rancho, campos, matas, rios e lagos.
3. Cavalo detalhado com animações (passo, trote, galope, parado, comer, beber, cochilar, deitar, susto, empinar, relinchar) e 3 vistas.
4. Andar a pé, montar e desmontar; andaduras passo/trote/galope/disparada/ré com fôlego.
5. 12 atributos e personalidade (2–3 traços) que mudam de verdade a obediência, os sustos, a preguiça, o impulso e a IA.
6. Ficha do cavalo (identidade, atributos com potencial, personalidade, condição).
7. Salvamento automático e manual (atômico, com cópia de segurança).

## Out of scope — not building this (agora)
- Domesticação, treinamento, genética e reprodução (Fases 2 e 4).
- Outros biomas (deserto, montanha, neve, litoral), clima e NPCs (Fase 3).
- Missões, narrativa, competições (Fase 5); áudio (Fase 6).
- Multijogador.

## Build order
1. Fase 1 — fundação (feita): projeto, câmera, movimento, visual, primeiro ambiente, primeiro cavalo, animações.
2. Fase 2 — cavalos: domesticação, vínculo completo, IA social da manada.
3. Fase 3 — mundo: biomas, clima, NPCs com rotina, exploração e persistência de objetos.
4. Fase 4 — progressão: treino, personalização visível, inventário, economia, estábulos.
5. Fase 5 — aventura: missões, narrativa, eventos, locais secretos, competições.
6. Fase 6 — polimento: animações avançadas, efeitos, áudio, interface final, otimização.

---
**Who it's for / what they feel:** quem ama cavalos e jogos de exploração aconchegantes; liberdade, descoberta e carinho pelo animal.

**Art & audio direction:** pixel art HD 2.5D original — chão em ladrilhos com bordas macias, objetos com volume e luz de cima, mapa de luz de dia/noite, partículas; cavalos paramétricos por raça. Áudio: violão, cascos por superfície, vento (Fase 6).

**Reference game:** Stardew Valley (sensação de aconchego e pixel art) + jogos de cavalo em mundo aberto — fica o passeio livre a cavalo com cavalos individuais; sai o combate.
