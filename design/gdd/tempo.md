# Tempo, estações, clima e calendário

## Overview
Dia de 24 min reais (Normal), 36 min (Lento) ou 16 min (Rápido) em Configurações. Calendário de 12 meses
de 28 dias com anos; quatro estações do hemisfério sul por cima do regime de águas/seca do sertão.

## Detailed Rules
- `GMPS` (min de jogo por segundo real) = 1 / 0,667 / 1,5. O relógio só anda no jogo sem menu aberto.
- Estações (`season4`): Verão dez–fev, Outono mar–mai, Inverno jun–ago, Primavera set–nov. `season()`
  (águas/seca) continua mandando no capim, nos preços e nas cores do chão; a estação muda a quantidade
  de flores no chão, a hora do nascer e do pôr do sol (`sunShift`) e a luz do inverno.
- Períodos: Madrugada, Amanhecer, Manhã, Meio-dia, Tarde, Pôr do sol, Entardecer, Noite, com luz
  interpolada por quadros-chave (`AMB`) — sem saltos (variação máx. 0,011 por 2 min).
- Clima: sol, parcialmente nublado, nublado, chuva fraca, chuva forte, tempestade, neblina, ventania e
  **calor forte** (novo; ago–out). Calor: gado bebe ~1,8x, o vaqueiro cansa a pé entre 11h e 15h, luz
  alaranjada. Neblina clareia e esbranquiça a manhã.
- Dormir na cama (Casa Sede) vira o dia uma única vez (qualquer velocidade), processa capim, ovos,
  entregas, clima do dia seguinte, restaura energia e salva.
- Exaustão gradual (não há mais "dormir à força às 2h"): energia < 25 anda 8% mais devagar, < 12 20%,
  < 5 35%; de 0h a 5h cansa 2,5 por hora a mais; se a energia zerar, desmaia (acorda em casa, paga remédio).
- Calendário: feira (sábado), forró (sexta), vaquejada, encontro de criadores, leilões, feira
  agropecuária, São João/aniversário da cidade, Natal e, novos: Carnaval (10–11/fev), Missa do Vaqueiro
  (3º domingo de julho) e Cavalgada da Primavera (22/set). Aniversários de todos os moradores (dia fixo
  por pessoa), avisados de manhã; presente no aniversário vale o dobro.
- HUD: ícone da estação, dia da semana, data, estação; relógio com arco do céu (sol ou lua andando).

## Acceptance Criteria (`time_test.js`)
Velocidades exatas, relógio parado com menu, 8 períodos, luz contínua, 4 estações, calor no fim da seca,
dormir passa 1 dia e acorda às 6h, madrugada sem dormir forçado, aniversário em dobro, eventos do ano,
salvar/carregar mantém dia e hora.
