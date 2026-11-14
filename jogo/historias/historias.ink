// Histórias de Itarantim (ink). Cada morador tem um capítulo por vez; o próximo só aparece dias depois.
// Linhas que começam com "Você:" são do vaqueiro. Etiquetas # feliz / # triste / # bravo mudam o rosto de quem fala.

VAR zefa_cap = 0
VAR zefa_dia = 0
VAR zefa_ajudou = false
VAR bene_cap = 0
VAR bene_dia = 0
VAR padre_cap = 0
VAR padre_dia = 0
VAR padre_doou = 0
VAR cida_cap = 0
VAR cida_dia = 0
VAR chico_cap = 0
VAR chico_dia = 0
VAR ryan_cap = 0
VAR ryan_dia = 0

// ---------- Dona Zefa: o caderno do fiado ----------
=== function tem_zefa() ===
~ return zefa_cap < 3 && dia() >= zefa_dia

=== zefa ===
{ zefa_cap:
- 0: -> zefa1
- 1: -> zefa2
- 2: -> zefa3
}
=== zefa1 ===
Ô, {nome()}... senta aqui um minutinho. # triste
Tá vendo esse caderno? É o fiado do bar. Metade de Itarantim me deve, e eu não tenho coragem de cobrar ninguém.
* [Oferecer R$ 300 para ela fechar o mês]
    {pagar(300):
        Você: Toma, Dona Zefa. Paga as contas do mês e depois a gente vê.
        Ai, meu filho... Deus lhe pague. Eu devolvo, juro por Nossa Senhora. # feliz
        ~ zefa_ajudou = true
        ~ amizade(40)
    - else:
        Você: Eu queria ajudar, mas tô sem dinheiro agora.
        Eu sei, eu sei. A seca aperta todo mundo.
    }
* [Sugerir vender pastel com queijo da roça]
    Você: E se a senhora vendesse pastel de queijo coalho? Gente com fome paga na hora.
    Pastel... sabe que não é má ideia? O Seu Dito tem farinha boa. # feliz
    ~ amizade(25)
* [Dizer que ela precisa cobrar]
    Você: Fiado é amizade, Dona Zefa, mas conta é conta. A senhora tem que cobrar.
    Você fala igual ao finado meu marido. Ele também dizia isso. # bravo
    Vou pensar.
    ~ amizade(5)
- ~ zefa_cap = 1
~ zefa_dia = dia() + 3
-> END

=== zefa2 ===
{zefa_ajudou: O dinheiro que você me emprestou segurou o bar. Agora escuta essa... # feliz | Lembra do caderno? Pois escuta essa...}
Comecei a vender pastel de queijo no sábado. Acabou em uma hora! O povo vem de longe.
* [Perguntar se ela precisa de queijo]
    Você: Precisa de queijo? A gente tem na fazenda.
    Se você me trouxer, eu pago bem. E o primeiro pastel é sempre seu.
    ~ amizade(20)
* [Brincar com ela]
    Você: Daqui a pouco a senhora abre filial na capital.
    Hahaha! Capital nada, aqui é melhor. # feliz
    ~ amizade(15)
- ~ zefa_cap = 2
~ zefa_dia = dia() + 4
-> END

=== zefa3 ===
{nome()}, fiz as contas: o caderno do fiado tá quase zerado e o bar nunca teve tanta gente. # feliz
{zefa_ajudou:
    Toma os seus R$ 400. Os 300 que você me emprestou e mais um agrado.
    ~ dinheiro(400)
- else:
    Quero te dar um presente pelos conselhos. Leva essas rapaduras pra lida.
    ~ item("rapadura", 4)
}
* [Agradecer]
    Você: Fico feliz demais, Dona Zefa.
- E pode beber o café de graça aqui pro resto da vida, ouviu?
~ amizade(50)
~ avisar("📖 História completa: O caderno do fiado")
~ zefa_cap = 3
-> END

// ---------- Seu Bené: o aboio do avô ----------
=== function tem_bene() ===
~ return bene_cap < 3 && dia() >= bene_dia

=== bene ===
{ bene_cap:
- 0: -> bene1
- 1: -> bene2
- 2: -> bene3
}
=== bene1 ===
Senta, menino. Vou lhe contar do aboio que seu avô Tiãozinho cantava.
Era um aboio comprido, que começava baixo e subia feito poeira no fim da tarde. O gado vinha de longe só de ouvir.
* [Pedir para ele cantar]
    Você: O senhor lembra como era?
    Eôôô, boi... eôôô... # feliz
    A garganta já não é a mesma. Mas a toada eu guardo.
    ~ amizade(20)
* [Perguntar sobre o avô]
    Você: Como era o meu avô na lida?
    Teimoso que nem jumento e manso que nem chuva fina. Nunca bateu num bicho.
    ~ amizade(25)
- Volta outro dia que eu lhe ensino o primeiro verso.
~ bene_cap = 1
~ bene_dia = dia() + 2
-> END

=== bene2 ===
O primeiro verso é assim: "Ê, boi da Boa Esperança, vem pra casa que a noite avança".
{modo() == "haras": No seu caso, é tropa e não boiada. Mas cavalo também entende aboio, viu? }
* [Repetir o verso]
    Você: Ê, boi... vem pra casa que a noite avança...
    Isso! Mais do peito, menos da boca. # feliz
    ~ amizade(30)
* [Rir de vergonha]
    Você: Não sei cantar não, Seu Bené.
    Ninguém sabe. A gente aprende cantando.
    ~ amizade(15)
- ~ bene_cap = 2
~ bene_dia = dia() + 3
-> END

=== bene3 ===
Hoje eu fecho o aboio com você. O último verso é o mais importante. # triste
"E se um dia eu não voltar, o meu canto vai ficar."
Seu avô cantava isso no fim. Agora o canto é seu.
* [Prometer que vai cantar]
    Você: Vou cantar todo fim de tarde, Seu Bené.
    Então valeu a pena eu chegar até aqui. # feliz
- ~ amizade(60)
~ dinheiro(250)
Toma: é o dinheiro de um boi que seu avô me ajudou a criar. Sempre achei que era dele.
~ avisar("📖 História completa: O aboio do avô")
~ bene_cap = 3
-> END

// ---------- Padre Antônio: o sino rachado ----------
=== function tem_padre() ===
~ return padre_cap < 2 && dia() >= padre_dia

=== padre ===
{ padre_cap:
- 0: -> padre1
- 1: -> padre2
}
=== padre1 ===
Meu filho, o sino da Matriz rachou na última trovoada. Sem sino, como o povo vai saber da missa? # triste
Estou juntando dinheiro para mandar consertar em Vitória da Conquista.
* [Doar R$ 500]
    {pagar(500):
        ~ padre_doou = 500
        Deus abençoe a sua fazenda! # feliz
        ~ amizade(50)
    - else:
        Não tem problema. A boa vontade já vale muito.
    }
* [Doar R$ 150]
    {pagar(150):
        ~ padre_doou = 150
        Cada moeda ajuda. Obrigado. # feliz
        ~ amizade(25)
    }
* [Sugerir um leilão de prendas]
    Você: E se a gente fizesse um leilão de prendas depois da missa?
    Um leilão! O povo adora. Vou anunciar no domingo. # feliz
    ~ amizade(30)
* [Hoje não posso]
    Você: Hoje não posso, Padre.
    Fica em paz.
- ~ padre_cap = 1
~ padre_dia = dia() + 5
-> END

=== padre2 ===
Ouviu o sino hoje cedo? Voltou a tocar! # feliz
{padre_doou > 0: O seu nome está na lista dos benfeitores, pregada na porta da igreja. | O povo se juntou e conseguimos.}
{padre_doou >= 500: E tem mais: o ferreiro cobrou menos do que eu esperava. O que sobrou da sua doação eu lhe devolvo.}
{padre_doou >= 500:
    ~ dinheiro(300)
}
* [Dizer que ouviu]
    Você: Ouvi sim, Padre. Parecia festa.
- ~ amizade(30)
~ avisar("📖 História completa: O sino rachado")
~ padre_cap = 2
-> END

// ---------- Cida: o vestido da quadrilha ----------
=== function tem_cida() ===
~ return cida_cap < 2 && dia() >= cida_dia

=== cida ===
{ cida_cap:
- 0: -> cida1
- 1: -> cida2
}
=== cida1 ===
{nome()}, me salva! Encomendaram doze vestidos de quadrilha e o tecido de chita acabou.
* [Oferecer carona até Itapetinga para comprar]
    Você: Eu levo a senhora até Itapetinga na carroça. Lá tem chita.
    Você faria isso? Que anjo! # feliz
    ~ amizade(35)
* [Dar R$ 200 para ela comprar o tecido]
    {pagar(200):
        Vou fazer um vestido especial com o nome da sua fazenda bordado! # feliz
        ~ amizade(40)
    - else:
        Deixa, eu dou um jeito.
    }
* [Sugerir usar retalhos]
    Você: E se fizesse de retalho? Fica colorido.
    Vestido de retalho... sabe que fica lindo? # feliz
    ~ amizade(25)
- ~ cida_cap = 1
~ cida_dia = dia() + 3
-> END

=== cida2 ===
Os vestidos ficaram prontos! A quadrilha desse ano vai ser a mais bonita. # feliz
Uma cliente me pagou com café torrado na hora. Leva dois pacotes pra fazenda.
~ item("cafe", 2)
* [Agradecer]
    Você: Obrigado, Cida. Vou usar na festa.
- ~ amizade(40)
~ avisar("📖 História completa: O vestido da quadrilha")
~ cida_cap = 2
-> END

// ---------- Mestre Chico: a casa de taipa ----------
=== function tem_chico() ===
~ return chico_cap < 2 && dia() >= chico_dia

=== chico ===
{ chico_cap:
- 0: -> chico1
- 1: -> chico2
}
=== chico1 ===
Sabia que fui eu que levantei as paredes da sua casa sede, junto com o seu avô? Taipa de mão, barro e varinha.
Ele fez questão de enterrar uma moeda debaixo da porta, pra dar sorte.
* [Perguntar se a moeda ainda está lá]
    Você: Será que a moeda ainda tá lá?
    Se ninguém mexeu, tá. Mas não vá quebrar a soleira atrás de moeda, hein! # feliz
    ~ amizade(20)
* [Perguntar como se faz taipa]
    Você: Me ensina a fazer taipa?
    Barro bem amassado, palha e paciência. A pressa racha a parede.
    ~ amizade(25)
- ~ chico_cap = 1
~ chico_dia = dia() + 4
-> END

=== chico2 ===
Pensei no que você disse e fui olhar a soleira da sua casa enquanto você estava na lida. # feliz
Tava lá: um tostão de 1950, verde de velho. Não tive coragem de tirar. Deixei onde seu avô pôs.
Mas pra você não sair de mãos vazias, faço a sua próxima obra com desconto de amigo.
~ dinheiro(500)
* [Agradecer]
    Você: Obrigado, Mestre. É bom saber que a sorte continua lá.
- ~ amizade(40)
~ avisar("📖 História completa: A moeda da soleira")
~ chico_cap = 2
-> END

// ---------- Sr. Ryan: cavalos ----------
=== function tem_ryan() ===
~ return ryan_cap < 2 && dia() >= ryan_dia

=== ryan ===
{ ryan_cap:
- 0: -> ryan1
- 1: -> ryan2
}
=== ryan1 ===
{modo() == "haras":
    Então você virou criador de cavalo! Isso é coisa séria, rapaz. Tem que ter olho, paciência e muita água limpa.
- else:
    Gado é dinheiro, mas cavalo é paixão. Um dia você ainda vai querer um haras, escuta o que eu digo.
}
* [Pedir um conselho]
    Você: Qual o segredo de um bom cavalo?
    Escovar todo dia e treinar a marcha no fim da tarde, quando o sol baixa. Cavalo cuidado ganha prova.
    ~ amizade(25)
* [Desafiar para uma corrida]
    Você: O senhor topa uma corrida qualquer dia?
    Hahaha! Topo. Mas o meu Quarto de Milha não perde pra ninguém. # feliz
    ~ amizade(20)
- ~ ryan_cap = 1
~ ryan_dia = dia() + 4
-> END

=== ryan2 ===
Lembra que eu falei de cuidar bem? Pois vim ver os seus bichos de longe. # feliz
Tá caprichado. Vou falar do seu nome pros compradores da vaquejada.
{bichos("cavalo") >= 3: Com {bichos("cavalo")} cavalos, você já pode pensar em cobrir éguas pra fora. | Junte mais uns cavalos e o negócio cresce.}
~ dinheiro(300)
Isso aqui é de um comprador que eu indiquei e pagou adiantado a comissão. É seu.
* [Agradecer]
    Você: Valeu, Seu Ryan.
- ~ amizade(40)
~ avisar("📖 História completa: Conselho de criador")
~ ryan_cap = 2
-> END
