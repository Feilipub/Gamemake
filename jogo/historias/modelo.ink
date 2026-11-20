// Minha história para o Lida no Sertão (linguagem ink: https://www.inklestudios.com/ink/)
// Escreva em qualquer bloco de notas, salve como .ink e carregue em Configurações › Histórias.
// Moradores: felipe, ryan, zefa, tonho, chico, lucia, joana, dito, padre, cida, bene
// Linhas que começam com "Você:" são do vaqueiro. Etiquetas # feliz # triste # bravo mudam o rosto.
// Funções do jogo: dia() hora() nome() fazenda() modo() pagar(v) dinheiro(v) item(id, n) tem(id) amizade(n) coracoes() bichos(sp) avisar(texto)

VAR dito_cap = 0

=== function tem_dito() ===
~ return dito_cap < 1

=== dito ===
Bom dia, {nome()}! Chegou rapadura nova da serra. # feliz
* [Comprar uma por R$ 5]
    {pagar(5):
        ~ item("rapadura", 1)
        Você: Vou levar uma pra lida.
        Bom proveito!
    - else:
        Fica pra próxima.
    }
* [Só passei para dar bom dia]
    Você: Só vim dar bom dia, Seu Dito.
    Volte sempre! # feliz
    ~ amizade(10)
- ~ dito_cap = 1
-> END
