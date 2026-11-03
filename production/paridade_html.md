# Paridade com o HTML v3.2 — o que já está no APK

Regra: um item só é marcado **[x]** quando está **no APK**, **testado no jogo** e com evidência em
`production/qa/evidence/`. Fonte de cada item: `design/reference/inventario_original_v3_2.md`.
Pedido da RF Games (03/11/2026): **nada pode faltar no APK**, inclusive o menu inicial **igual ao HTML**.

## Abertura, menu e criação
- [ ] Abertura cinematográfica RF GAMES (amanhecer no sertão, título LIDA NO SERTÃO, pular com toque) — idêntica ao HTML
- [ ] Menu inicial idêntico: Continuar, Novo Jogo, Carregar Partida, Configurações, Controles, Créditos (mesmo visual)
- [ ] 3 espaços de partida (escolher, carregar, apagar)
- [ ] Configurações: volumes (geral, efeitos, ambiente, música), qualidade, tamanho dos controles, vibração, modo joystick/toque
- [ ] Controles (tela) e Como jogar
- [ ] Créditos (RF Games; Ryan Duarte Borges e Felipe Rodrigues Campos)
- [ ] Criação do vaqueiro completa: nome, 27 estados (traje, enfeite, talento, habilidades), sexo, pele, cabelo, cor, chapéu, camisa, calça, botas, acessório, lenço, enfeite
- [ ] Escolha da montaria: cavalo/muar, raça, pelagem, sexo, nome, sela, estímulo
- [ ] Cutscene da herança com o texto oficial do Felipe e trilha CUTSCENE

## Mundo
- [x] Mapa da fazenda (novo layout), cidade, vizinhos, mata, riacho e ponte — fatia 1 + fase 3
- [x] Porteiras funcionais com trava de terreno — fase 3
- [x] Dia e noite, janelas acesas — fatia 1
- [ ] Calendário (12×28 dias, águas/seca), clima de 8 tipos com previsão, lama, raios
- [ ] Capim por tile (rapa e rebrota), estação muda o chão
- [ ] Açude com profundidade: vadear, nadar, cavalo na água
- [ ] Mata dos fundos: fauna (13 espécies), onça-parda, defesa (facão, espingarda fictícia), vida do jogador

## Vaqueiro e montaria
- [x] Andar, correr, montar, passo/trote/galope, fôlego, assobio — fatia 1
- [ ] Aparência personalizada do vaqueiro (todas as combinações)
- [ ] Laço, cabresto, selar/escovar, energia e fome, comer, dormir
- [ ] Habilidades (lida, pecuária, laço, montaria) e talentos

## Animais
- [x] Pé-Duro com pastejo, fuga e aboio — fatia 1
- [ ] Todas as raças: 10 bovinos, 9 cavalos, muares, jumentos, 6 cabras, 4 galinhas, 5 cães (com pelagens)
- [ ] Ficha do animal com ações; necessidades (fome, sede, saúde, felicidade), doença, vacina, peso, gestação, nascimento
- [ ] Personalidade (traços) e vínculo; IA de rebanho completa, estouro, cão tocando gado
- [ ] Galinhas (ovos), leite, carroça com jumento

## Fazenda e progressão
- [x] Cochos no mapa — fase 3
- [ ] Encher cochos/galões, reservatório, depósito, mochila com peso
- [ ] Compra de terrenos e glebas (destrava porteiras), títulos de produtor
- [ ] Reforma da casa (taipa → alvenaria → sede)
- [ ] Obras nos lotes com o Mestre Chico (9 construções)
- [ ] Peões: contratar, ordens, montaria própria, rotina e roda da fogueira

## Gente e história
- [ ] 16 personagens com rotinas, casas, missa, abrigo na chuva, visitas
- [ ] Conversas por amizade, presentes, memória, recordações de Tiãozinho
- [ ] Legado de Tiãozinho: 13 lembranças, carta, lata no pé de caju
- [ ] Favores, missões do quadro de avisos, ofertas espontâneas
- [ ] Conversas entre moradores com balões

## Economia e eventos
- [ ] Lojas (Mercadinho, Bar, Açougue, Casa do Agro, Pedreiro), arroba diária, venda no curral/embarcadouro
- [ ] Banco do Sertão (5 créditos, poupança, score)
- [ ] Negociação com paciência por NPC
- [ ] Leilões de sábado (6 tipos, compradores com estratégia, lances e consignação)
- [ ] Eventos: feira, forró, São João, vaquejada (minijogo), feira agropecuária (concurso), encontro de criadores, Natal
- [ ] Churrasco com convidados; música na fogueira (viola/violão)
- [ ] Região: fazendas distantes simuladas e notícias

## Sistema
- [x] Trilhas INTRO e GAME1/GAME2 com transição — fatia 1
- [x] Salvamento automático com cópia de segurança — fatia 1 (falta: 3 espaços e todos os dados)
- [ ] Modo toque: tocar no destino (caminho A*)
- [ ] Efeitos sonoros procedurais do HTML (cascos, mugido, relincho, aboio, chuva, vento…)
- [ ] HUD completo do HTML (data, hora, clima, dinheiro, banco, energia, fome) e menus (Mochila, Menu, Vender)
