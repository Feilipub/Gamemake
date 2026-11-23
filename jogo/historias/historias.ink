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

// ======================= v19: novas histórias =======================
VAR tonho_cap = 0
VAR tonho_dia = 0
VAR tonho_sol = false
VAR lucia_cap = 0
VAR lucia_dia = 0
VAR lucia_plano = 0
VAR clara_cap = 0
VAR clara_dia = 0
VAR clara_mutirao = false
VAR helena_cap = 0
VAR helena_dia = 0
VAR helena_foi = false
VAR cicero_cap = 0
VAR cicero_dia = 0
VAR cicero_semente = false
VAR graca_cap = 0
VAR graca_dia = 0
VAR graca_potro = false

// ---------- Seu Tonho: a carne de sol de Itarantim ----------
=== function tem_tonho() ===
~ return tonho_cap < 3 && dia() >= tonho_dia

=== tonho ===
{ tonho_cap:
- 0: -> tonho1
- 1: -> tonho2
- 2: -> tonho3
}
=== tonho1 ===
Rapaz, você sabe o que faz a carne de sol de Itarantim ser a melhor da Bahia? # feliz
É o sal grosso, o vento da tarde e a paciência. Mas o pessoal da capital quer carne de sol em embalagem, com selo.
* [Dizer que tradição não se troca por selo]
    Você: Seu Tonho, o segredo é o jeito de fazer. Selo não dá gosto.
    Isso! Falou bonito. Mas sem selo não vendo pra fora...
    ~ amizade(20)
* [Sugerir uma marca da cidade]
    Você: E se o senhor criasse uma marca? "Carne de Sol do Tonho, de Itarantim".
    Uma marca... com o desenho de um boi e o serrote atrás. Gostei! # feliz
    ~ tonho_sol = true
    ~ amizade(30)
* [Perguntar quanto ele paga num boi gordo]
    Você: E um boi gordo, o senhor paga quanto?
    Hahaha, vaqueiro esperto. Depende da arroba, você sabe. Traga e a gente conversa.
    ~ amizade(10)
- ~ tonho_cap = 1
~ tonho_dia = dia() + 3
-> END

=== tonho2 ===
{tonho_sol: Fiz a marca! Mandei pintar na parede do açougue. # feliz | Fiquei pensando no que você disse...}
Agora preciso de um varal novo de carne de sol, coberto, pra chuva não estragar. Custa R$ 250 de madeira e tela.
* [Ajudar com os R$ 250]
    {pagar(250):
        Você: Pode contar comigo. Faz o varal.
        Você é dos bons, viu? Isso eu não esqueço. # feliz
        ~ amizade(35)
        ~ tonho_sol = true
    - else:
        Você: Tô sem dinheiro agora, Seu Tonho.
        Tranquilo, a gente dá um jeito.
    }
* [Ensinar a fazer o varal com o que tem]
    Você: Dá pra fazer com estaca de sabiá e lona de caminhão. Sai quase de graça.
    Sabiá não apodrece mesmo... Vou fazer assim.
    ~ amizade(20)
- ~ tonho_cap = 2
~ tonho_dia = dia() + 4
-> END

=== tonho3 ===
A primeira remessa foi pra Vitória da Conquista e vendeu tudo! # feliz
{tonho_sol:
    O nome de Itarantim tá correndo a Bahia. E isso tem a sua mão. Toma, é a sua parte.
    ~ dinheiro(450)
- else:
    Não deu pra fazer tudo que eu queria, mas vendeu bem. Leva um agrado.
    ~ dinheiro(150)
}
* [Comemorar com ele]
    Você: Agora é carne de sol de exportação!
    Hahaha! Exportação pra Conquista já tá bom demais. # feliz
    ~ amizade(25)
- ~ tonho_cap = 3
-> END

// ---------- Dona Lúcia: o sonho da agência ----------
=== function tem_lucia() ===
~ return lucia_cap < 2 && dia() >= lucia_dia

=== lucia ===
{ lucia_cap:
- 0: -> lucia1
- 1: -> lucia2
}
=== lucia1 ===
{nome()}, posso ser sincera? O banco quer fechar a agência de Itarantim. Dizem que não dá lucro.
Se fechar, o povo vai ter que ir a Itapetinga pra tudo. Os aposentados, os pequenos criadores... # triste
* [Abrir uma poupança para ajudar a agência]
    Você: Então eu abro uma poupança aqui. Ponho R$ 500 agora.
    {pagar(500):
        Ah, que alegria! Cada conta nova conta muito no relatório. # feliz
        ~ lucia_plano = 2
        ~ amizade(30)
    - else:
        Você: Hum... vou ter que juntar primeiro.
        Tudo bem, a intenção já vale.
        ~ amizade(10)
    }
* [Sugerir um mutirão de abertura de contas na feira]
    Você: Na feira de sábado vem gente de todo canto. Monta uma mesa lá!
    Uma mesa na feira... o gerente regional vai achar estranho, mas eu gosto. # feliz
    ~ lucia_plano = 1
    ~ amizade(25)
- ~ lucia_cap = 1
~ lucia_dia = dia() + 5
-> END

=== lucia2 ===
Saiu o relatório! A agência fica aberta! # feliz
{lucia_plano == 2:
    E a sua poupança rendeu um bônus de cliente fundador. Devolvo os R$ 500 com rendimento.
    ~ dinheiro(560)
- else:
    {lucia_plano == 1:
        A mesa na feira abriu quarenta contas num sábado só. O gerente regional ficou de boca aberta.
        ~ dinheiro(200)
    - else:
        Não sei bem como, mas o povo veio. Obrigada pela conversa daquele dia.
    }
}
* [Parabenizar]
    Você: A senhora salvou a agência, Dona Lúcia.
    Nós salvamos. Sertão é assim: ninguém faz nada sozinho.
    ~ amizade(25)
- ~ lucia_cap = 2
-> END

// ---------- Dra. Clara: a febre do carrapato ----------
=== function tem_clara() ===
~ return clara_cap < 2 && dia() >= clara_dia

=== clara ===
{ clara_cap:
- 0: -> clara1
- 1: -> clara2
}
=== clara1 ===
{nome()}, tem um surto de tristeza parasitária nas fazendas do leste. É a febre do carrapato. # triste
Os pequenos criadores não têm dinheiro pra remédio. Já perderam bezerro.
* [Pagar R$ 300 em remédios para os pequenos]
    {pagar(300):
        Você: Compra os remédios, doutora. A gente acerta depois.
        Você não imagina quantos bezerros isso vai salvar. # feliz
        ~ clara_mutirao = true
        ~ amizade(35)
    - else:
        Você: Queria ajudar, mas tô apertado.
        Eu entendo. Vou ver com a prefeitura.
    }
* [Organizar um mutirão de banho carrapaticida]
    Você: E se a gente fizer um mutirão? Cada um leva o gado no brete de quem tem.
    Mutirão! Isso é a cara do sertão. Eu levo o produto. # feliz
    ~ clara_mutirao = true
    ~ amizade(25)
* [Perguntar como proteger o próprio gado]
    Você: E o meu gado, doutora, como protejo?
    Vacine, ponha sal mineral e não deixe o pasto rapado. Gado bem tratado aguenta mais.
    ~ amizade(10)
- ~ clara_cap = 1
~ clara_dia = dia() + 4
-> END

=== clara2 ===
{clara_mutirao: O surto acabou. Nenhum bezerro morreu depois do mutirão! # feliz | O surto passou, mas foi difícil...}
{clara_mutirao:
    Os criadores do leste mandaram isso pra você. Disseram que é pouco, mas é de coração.
    ~ item("queijo", 2)
    ~ item("mel", 1)
}
* [Dizer que é o certo a fazer]
    Você: Vizinho é pra isso, doutora.
    Se todo fazendeiro pensasse assim... # feliz
    ~ amizade(25)
- ~ clara_cap = 2
-> END

// ---------- Professora Helena: a escola rural ----------
=== function tem_helena() ===
~ return helena_cap < 2 && dia() >= helena_dia

=== helena ===
{ helena_cap:
- 0: -> helena1
- 1: -> helena2
}
=== helena1 ===
Bom dia, {nome()}! Os meninos da escola rural nunca viram de perto como se cuida de um bezerro.
Será que eu podia levar a turma na {fazenda()} um dia desses?
* [Convidar a turma]
    Você: Pode trazer! Eu mostro o curral, os cavalos e a gente faz um aboio pra eles.
    Eles vão amar! E eu levo o lanche. # feliz
    ~ helena_foi = true
    ~ amizade(30)
* [Doar R$ 150 para o material da escola]
    {pagar(150):
        Você: Não sei se dá pra receber a turma agora, mas toma, para o material.
        Caderno, lápis de cor... obrigada! # feliz
        ~ amizade(25)
    - else:
        Você: Agora não vai dar, professora.
        Fica pra outra vez.
    }
- ~ helena_cap = 1
~ helena_dia = dia() + 3
-> END

=== helena2 ===
{helena_foi: A visita foi o assunto da semana! Olha os desenhos que eles fizeram. # feliz | Os meninos fizeram desenhos da lida pra mostrar na feira.}
Tem vaqueiro de gibão, cavalo, boi... e até você, de chapéu de couro!
{helena_foi:
    O Pedrinho disse que vai ser vaqueiro igual a você.
    ~ amizade(20)
}
* [Pedir um desenho para pendurar em casa]
    Você: Me dá um desses? Vou pendurar na sala.
    Leva o mais bonito. E volte na escola quando puder. # feliz
    ~ amizade(15)
    ~ avisar("🖍 Você ganhou um desenho dos alunos da escola rural.")
- ~ helena_cap = 2
-> END

// ---------- Seu Cícero: a semente crioula ----------
=== function tem_cicero() ===
~ return cicero_cap < 2 && dia() >= cicero_dia

=== cicero ===
{ cicero_cap:
- 0: -> cicero1
- 1: -> cicero2
}
=== cicero1 ===
Vaqueiro, essa semente aqui é de milho crioulo. Meu bisavô plantava, meu avô plantava... # feliz
Aguenta a seca melhor que qualquer semente de loja. Mas tá acabando, ninguém guarda mais.
* [Guardar semente com ele numa casa de sementes]
    Você: Vamos fazer uma casa de sementes, Seu Cícero? Cada um planta e devolve o dobro.
    Casa de sementes! Era assim no meu tempo. # feliz
    ~ cicero_semente = true
    ~ amizade(30)
* [Comprar um saco por R$ 80]
    {pagar(80):
        Você: Me vende um saco. Vou plantar na roça.
        Planta no começo das águas, viu? E guarda um punhado pro ano que vem.
        ~ item("milho", 1)
        ~ amizade(20)
    - else:
        Você: Fica pra próxima.
    }
- ~ cicero_cap = 1
~ cicero_dia = dia() + 5
-> END

=== cicero2 ===
{cicero_semente: A casa de sementes já tem doze famílias! # feliz | Plantei o milho crioulo de novo.}
Esse ano o milho veio bonito, mesmo com pouca chuva. A terra sabe o que é dela.
{cicero_semente:
    Toma, a sua parte da primeira colheita.
    ~ item("milho", 2)
    ~ item("abobora", 2)
}
* [Prometer plantar também]
    Você: Esse ano eu planto crioulo na roça também.
    Aí sim! Semente que não se planta, se perde. # feliz
    ~ amizade(20)
- ~ cicero_cap = 2
-> END

// ---------- Dona Graça: a égua da avó ----------
=== function tem_graca() ===
~ return graca_cap < 2 && dia() >= graca_dia

=== graca ===
{ graca_cap:
- 0: -> graca1
- 1: -> graca2
}
=== graca1 ===
{nome()}, a Estrela-d'Alva, égua da minha avó, tá velhinha. Ela foi campeã de marcha em Itapetinga. # triste
Eu queria muito um potro dela antes que ela se vá. Mas garanhão bom é caro.
* {bichos("cavalo") >= 2} [Oferecer o seu garanhão para a cobertura]
    Você: Eu tenho cavalo bom na fazenda. Faz a cobertura, sem cobrar nada.
    Você faria isso? Deus lhe abençoe! # feliz
    ~ graca_potro = true
    ~ amizade(40)
* [Ajudar com R$ 400 para a cobertura]
    {pagar(400):
        Você: Toma, Dona Graça. Para a cobertura com um garanhão de raça.
        Isso é presente de gente grande. Obrigada. # feliz
        ~ graca_potro = true
        ~ amizade(35)
    - else:
        Você: Hoje não tenho, mas vou pensar num jeito.
    }
* [Dizer que a égua merece descansar]
    Você: Talvez ela mereça só descansar, Dona Graça.
    Pode ser... ela já deu tanto. # triste
    ~ amizade(10)
- ~ graca_cap = 1
~ graca_dia = dia() + 6
-> END

=== graca2 ===
{graca_potro:
    Nasceu! Um potro castanho, com a estrela na testa igualzinha a da avó dele! # feliz
    Vou chamar de Vaqueiro, em sua homenagem. E quando ele crescer, a primeira montaria é sua.
    ~ dinheiro(300)
    ~ amizade(30)
- else:
    A Estrela-d'Alva tá bem, descansando no pasto. Obrigada por perguntar.
    ~ amizade(10)
}
* [Prometer visitar o potro]
    Você: Vou visitar ele sempre, Dona Graça.
    A porteira tá sempre aberta pra você. # feliz
- ~ graca_cap = 2
-> END
