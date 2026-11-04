# Interiores das casas e cavalos emprestados

## Interiores
- 16 cômodos reais (casa sede, Fazendas Campos e Duarte, casas da cidade, escola, ferraria, farmácia,
  sedes da Riacho Doce e da Santa Clara, Pé de Serra, mansão e casa dos funcionários da Monte Real),
  montados numa faixa do mapa abaixo do mundo (linhas 111–141), separada por parede. Mesma colisão,
  movimento, câmera (presa ao cômodo) e salvamento do resto do jogo (`P.inside`, `P.out`).
- Plantas: sede/mansão (sala, cozinha e quarto com paredes internas e vãos de porta), casa simples
  (sala-cozinha e quarto), escola (quadro-negro e carteiras), ferraria (forja e bigorna), farmácia
  (balcão e prateleiras). Pisos: lajota, assoalho, cimento queimado vermelho e cerâmica. Paredes pintadas
  na cor de cada casa, janelas, lampiões que acendem à noite, fogão a lenha e forja com brasa.
- Móveis desenhados em pixel art (cama, guarda-roupa, rede listrada, sofá, mesa e cadeiras, fogão a
  lenha, pia, filtro de barro, armário, estante, rádio, TV, oratório, quadros, relógio, violas, chapéus de
  couro, máquina de costura, troféus, sela...). Móveis grandes bloqueiam a passagem.
- Interações: olhar objetos com história de cada morador; sentar; beber água do filtro; na casa sede,
  dormir na cama, fogão (menu da casa), baú da casa e guarda-roupa.
- Entrada: bater à porta. Morador em casa deixa entrar com 1+ coração (Dona Nena e Seu Bené sempre);
  depois das 22h só com 6+ corações. Morador fora: trancado, salvo 8+ corações ("a chave fica debaixo do
  vaso"). Escola, ferraria e farmácia abrem no horário de trabalho. Montado, o vaqueiro desce e o cavalo
  fica amarrado na porta; com animal no laço ou carroça não entra.
- Moradores dentro de casa: dormem na cama à noite, cozinham no fim da tarde e sentam na sala; dá para
  conversar (o mesmo NPC do mundo, sem cópia).
- Sair: pela porta do cômodo; volta exatamente para a frente da casa.

## Cavalos dos vizinhos
- Perto de um cavalo/burro adulto de um morador: "Pedir emprestado". O dono responde pela amizade e pelo
  jeito de cada um (Ryan 2 corações, Felipe 4, Valdomiro 3, Helena 1 + R$ 60, Caetano 1, Severino 4,
  Dr. Otávio 6 corações + missão r7 + R$ 250). Perto do limite às vezes ele precisa do cavalo.
- O cavalo continua do dono (não pode vender, mandar ao leilão nem trocar); as fazendas não o vendem
  enquanto emprestado. Monta, anda, trota e galopa como os seus; a sela é a sua e volta com você.
- Devolver: conversar com o dono perto do cavalo, ou deixá-lo de volta no pasto do dono. Bem cuidado:
  +amizade; tarde: −; cansado ou ferido: −15. Passou 1h30 do combinado: o dono vai buscar (−20).

## Acceptance Criteria (`house_test.js`, `lend_test.js`)
Entrar, dormir na cama, parede bloqueia, sair no lugar certo, 10 entradas/saídas seguidas, morador
dormindo, recusa à noite sem amizade, porta trancada, horário da escola, salvar dentro de casa, sem
duplicar NPC; pedir (recusa e aceite), montar, galopar, não vender, devolver, atraso, salvar empréstimo.

## Tocada do gado (IA dos bovinos conduzidos)
- O vaqueiro montado influencia de mais longe (raio 64 em vez de 50) e, quando vem por trás andando,
  o boi à frente dele segue o rumo do cavalo (mistura de até 40% com a fuga em linha reta).
- A porteira é escolhida pelo rumo do empurrão, não pelo zigue-zague do boi; funil com ponto de
  alinhamento sempre entre o boi e o vão; na boca da porteira o boi se compromete a atravessar e
  mantém o sentido (antes virava em cima dela); perto da porteira o rebanho afrouxa a distância e passa
  em fila; quem está ao lado de um companheiro atravessando segue junto (só perto da porteira, com prazo).
- Teste (`herd_test90.js`, `herd_in.js`, `campo.js`): saindo do pasto 30–33 de 36 bois (antes 13–14);
  entrando pela estrada 15–18 de 24 (antes 12–14); tocada em campo aberto mantém o rumo como antes.
