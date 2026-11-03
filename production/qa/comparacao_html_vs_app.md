# HTML v3.2 × app (APK nº 6) — o que não funciona no app

Teste de 03/11/2026. O HTML foi jogado do portão de início até a gameplay, com fotos de cada tela
(menu, criação, cutscene, HUD, 10 abas do Menu, Mochila, Vender, ficha do animal, moradores, bar,
praça, calendário, legado, noite e chuva). O app foi rodado nos mesmos pontos em retrato (450×800).

**Resumo honesto:** o app tem o mapa, o vaqueiro com o cavalo, 2 bois, porteiras, roça e cochos.
**Quase todo o resto do jogo do HTML não existe no app.** Não é um defeito pontual: os sistemas
ainda não foram portados.

## 1. Defeitos do que já existe no app

| # | Problema | Como aparece |
|---|---|---|
| D1 | Interface **minúscula com o celular em pé** | O projeto foi configurado para paisagem (640×360). Em retrato, o relógio, os botões e o joystick ficam pequenos e ilegíveis. |
| D2 | Câmera **longe demais em retrato** | A fazenda aparece miúda; o HTML usa um zoom bem mais perto. |
| D3 | Porteiras de terreno à venda **sem como comprar** | Piquetes 3 e 4, Curral Grande e galinheiro ficam travados para sempre, porque ainda não há dinheiro nem a aba Fazenda. |
| D4 | Tocar num animal **não faz nada** | No HTML abre a ficha com as ações. |
| D5 | Plantio **de graça** | Ainda não existe dinheiro nem loja de mudas. |
| D6 | Gado **sem fome nem sede** | Ele come no cocho, mas isso não muda nada no animal. |

## 2. Início do jogo

| HTML | App |
|---|---|
| Portão "Toque para começar" (libera o som) | não tem |
| Abertura cinematográfica: sertão ao amanhecer, sol, pássaros, boiada, título | só o texto "RF GAMES" |
| Menu: Novo jogo, Continuar, Configurações, Créditos, Controles; tela cheia | só Novo Jogo e Sair |
| Escolha do espaço de save (3 partidas) | 1 save só |
| **Criação do vaqueiro em 4 etapas**: nome, sexo, pele, cabelo, cor; 27 estados com roupa e talento; montaria (**cavalo, mula/burro ou jegue**), raça, pelagem, sinais, sexo, sela e estímulo; resumo | **não tem**: vaqueiro e cavalo fixos |
| Cutscene da chegada: Itarantim, a ponte, os bois Malhado e Fumaça, o cão Caramelo, **a fala do Felipe** | não tem |

## 3. Tela de jogo (HUD e botões)

| HTML | App |
|---|---|
| Data com estação, hora, clima, dinheiro, banco, vida, energia, fome | só dia, hora, fôlego e forragem |
| Botões Correr, Aboio, **Laço**, Montar, **Arma** e Ação com o nome do alvo ("Sr. Felipe", "Bar da Zefa", "Caramelo") | Correr, Aboio, Montar e Ação; sem Laço e sem Arma |
| Barra de baixo: **Mochila, Menu, Vender, Som** | não tem |
| Dicas e balões de fala | só mensagens simples |
| Modo **toque no chão para andar** (Configurações) | não tem |

## 4. Menus (no HTML todos funcionam)

**Nenhum menu existe no app.** O que fica de fora:
- Menu com 10 abas:
  - **Vaqueiro:** energia, fome, habilidades, estatísticas, compromissos e Legado.
  - **Mochila:** peso, itens e equipamentos.
  - **Animais:** por espécie.
  - **Fazenda:** reservatório, depósito, título, reforma da casa e compra de terras.
  - **Mapa:** posição de tudo, região e calendário.
  - **Banco:** carteira, conta, poupança, dívidas, score e cotação da arroba.
  - **Obras:** lotes e projetos.
  - **Peões:** vagas e contratação.
  - **Relações:** corações e onde cada morador está.
  - **Configurações:** volumes, gráficos, joystick ou toque, tamanho dos botões, orientação, cenas de leilão e vibração.
- **Mochila** e **Vender**.
- **Ficha do animal:** saúde, fome, sede, energia, felicidade, vínculo, condicionamento, genética, desenvolvimento,
  cuidados e personalidade. Ações: alimentar, dar água, acariciar, conduzir, tocar o gado, chamar, armar, seguir.
- Calendário com previsão do tempo e próximos eventos.
- Legado de Tiãozinho (13 lembranças).

## 5. Mundo, gente e sistemas

| Sistema do HTML | App |
|---|---|
| 16 moradores com rotina, casa, missa, chuva, visitas, conversas entre eles | **nenhum morador**: a cidade fica vazia |
| Conversar, presentes, amizade, memória, histórias de Tiãozinho | não tem |
| Bar da Zefa (refeições, mural de peões, quem está aqui), Mercadinho, Açougue, Casa do Agro, Pedreiro, Banco | as portas não fazem nada |
| Dinheiro, arroba diária, vender gado, comprar animais, negociação | não tem |
| Comprar terras, reforma da casa, obras com o Mestre Chico | não tem |
| Peões: contratar, ordens, montaria, roda da fogueira | não tem |
| Missões do quadro de avisos, favores e ofertas que os moradores trazem | não tem |
| Calendário de 12 meses, águas e seca; clima de 8 tipos (chuva, tempestade, neblina, vento) e lama | só dia e noite |
| Eventos: feira, forró, São João, vaquejada (minijogo), feira agropecuária, encontro de criadores, Natal, leilões de sábado | não tem |
| Animais: cão Caramelo, galinhas e ovos, jegue, cabras, animais dos vizinhos, todas as raças | só 2 bois e 1 cavalo |
| Necessidades, doença, vacina, peso, gestação e nascimento | não tem |
| Laço, cabresto, carroça com jumento | não tem |
| Mata dos fundos com fauna, onça-parda, facão e espingarda, vida do vaqueiro | não tem |
| Açude: vadear e nadar | a água bloqueia |
| Efeitos sonoros (cascos, mugido, aboio, chuva, vento…) | só música |

Fotos: HTML em `production/qa/evidence/html-*.png`; app em `production/qa/evidence/app-*.png`.
