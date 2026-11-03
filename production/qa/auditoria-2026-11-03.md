# Auditoria técnica — 2026-11-03

Método: jogo acelerado (25–30 min reais = 10–12 dias de jogo) explorando 10 regiões do mapa, contagem de
erros, NPCs e animais em parede, caches e tempo de quadro; todas as telas abertas em 360x640, 412x915,
740x360 e 1366x768; revisão de código; bateria de regressão (10 roteiros).

## Problemas encontrados e corrigidos
| # | Problema | Causa | Correção |
|---|---|---|---|
| 1 | NPCs atravessavam árvores, pedras, casas e cercas | rota da rotina era feita de retas entre pontos | trechos bloqueados viram caminho A* (com cache); rota parte da posição real |
| 2 | Funcionários da Monte Real cruzavam o galpão | ponto da rotina dentro do prédio | rota corrigida contornando o prédio |
| 3 | Animal vendido/abatido/penhorado/levado pela onça deixava corda, cabresto ou carroça presos a um "fantasma" (erro ao viajar ou abrir a carroça) | só algumas formas de remover limpavam as referências | verificação central `fixRefs` a cada quadro e ao fechar telas |
| 4 | Cavalo de peão demitido ficava congelado | marca de "montado" não era limpa | `fixRefs` solta o cavalo |
| 5 | Animal podia ficar dentro de cerca depois de vir ao assobio ou de um peão desmontar | movimento sem colisão no fim do trajeto | `unstick` periódico (a mesma busca em espiral do carregamento) |
| 6 | Diálogo de missão cortava o anterior; fala final e consequência se perdiam | diálogos substituíam um ao outro | fila de diálogos; aceitar missão vale mesmo fechando no X |
| 7 | Cena única (nascimento, primeira compra) se perdia se outra cena estivesse rodando | era descartada | espera a cena/tela terminar |
| 8 | NPC salvo no meio do caminho ficava parado na estrada ao carregar | rota não era retomada | retoma a rota ao carregar |
| 9 | Animal mandado ao leilão sumia se o jogador não fosse ao leilão | só voltava dentro do leilão | volta ao curral depois de 8 dias |
| 10 | Jogo podia ficar pausado após a abertura | `closeModal` tratava a abertura como menu | modo da abertura reconhecido |
| 11 | Seu Felipe aparecia com a aparência do jogador na abertura | aparência lida do campo errado | corrigido |
| 12 | Na tela deitada, a caixa de fala cobria os personagens da abertura | chão baixo demais | chão mais alto e porta proporcional |
| 13 | Abas da Casa do Agro escondidas à direita no celular | abas em uma linha com rolagem invisível | abas quebram em linhas |
| 14 | Menu principal deitado ocupava metade da tela com abas | grade de 10 colunas | uma linha de 12, compacta em telas baixas |
| 15 | Música alternativa (quando o arquivo falha) tocava muda | elemento já ligado ao WebAudio | elemento novo fora do WebAudio |
| 16 | Abertura redesenhava os fundos pixel a pixel em todo quadro | sem cache | fundos parados em cache |
| 17 | Cache de imagens dos menus crescia sem limite | sem teto | limite de 500 |
| 18 | Som da porteira na abertura não tocava | função inexistente | usa o rangido da porteira |

## Resultado
- Erros de execução: 0 em 22 dias de jogo simulados em duas rodadas.
- NPCs dentro de obstáculo: de 38 ocorrências para 1 (passagem de porteira).
- Animais em parede ou fora do mapa: 0.
- Quadro médio 2,9 ms (p95 3,0 ms) no navegador sem GPU; memória estável (~64–92 MB).
- Telas: nenhum elemento fora da tela nem texto cortado nos 4 tamanhos.
- Regressão: 10/10 roteiros sem erro; salvar/carregar ok.

## Limitações que permanecem
- Picos isolados de 100–190 ms ao entrar em área nova (gera sprites na primeira vez); no navegador sem GPU.
- Viagens entre a cidade e a região das Serras não fazem parte da rotina dos NPCs (cada um vive no seu lado).
