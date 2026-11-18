# Lida no Sertão — modo online

**Não precisa ligar servidor nenhum.** Quando o dono toca em **Abrir minha fazenda**, o próprio jogo dele vira o servidor da sala.

- Os amigos se conectam **direto no aparelho do dono** (WebRTC, pela biblioteca PeerJS, MIT).
- O jogo só usa o "telefonista" público e grátis da PeerJS (`0.peerjs.com`) para os aparelhos se acharem pelo código de 4 letras. Ele fica sempre ligado e não dorme.
- Quando a rede não deixa a ligação direta (algumas redes 4G), entra o retransmissor grátis da PeerJS.
- Funciona abrindo o jogo de qualquer lugar: o arquivo do zip, o GitHub Pages, o app instalado.

## Servidor próprio (opcional)

A pasta `online/` tem um servidor de salas (`servidor.mjs`, Node + `ws`). Ele também entrega o jogo (a pasta `../jogo`). Use se quiser não depender da PeerJS, por exemplo numa rede que bloqueia WebRTC.

- **Render, grátis:** clique em **New +**, depois em **Blueprint**, escolha este repositório e clique em **Apply**. Isso cria o serviço `lida-online` do `render.yaml`. No plano grátis ele dorme depois de 15 minutos sem uso e leva cerca de 1 minuto para acordar.
- **Abrindo pelo link do servidor:** o jogo percebe sozinho que está no servidor e passa a usá-lo.
- **Abrindo de outro lugar:** em **Jogar online › Conexão**, cole `wss://seu-endereço/ws` e toque em **Salvar**. Para voltar ao automático, deixe o campo vazio e toque em **Salvar** de novo.

## Como jogar

- **Dono:** na tela inicial, toque em **Jogar online**. Se já estiver jogando, vá em **Menu › Início › Jogar online**. Depois toque em **Abrir minha fazenda** e passe o código de 4 letras para os amigos.
- **Convidados:** toque em **Jogar online**, digite o código e toque em **Entrar**. Cada um chega montado no próprio cavalo, com o próprio boneco.
- **Juntos:** todos podem abrir porteiras, encher cochos, aboiar o gado, escovar, limpar e tratar. Tudo isso aparece para os outros. O caixa da fazenda é um só.
- **Chat:** tem chat e emojis, e as falas aparecem em balões em cima de cada vaqueiro.
- **Mural do dia:** traz 3 tarefas em grupo. Com 2 ou mais vaqueiros, a recompensa dobra.
- **Convite (v17):** o dono toca em **Convidar amigos** e manda o link pelo WhatsApp. Quem abre o link já cai na tela de entrar com o código preenchido. O código da fazenda fica o mesmo de uma vez para a outra.
- **Caiu a internet?** O convidado tenta voltar sozinho para a fazenda, até 3 vezes, antes de voltar para o próprio jogo.
- **Diária de vaqueiro:** o convidado ganha R$ 12 por tarefa feita, até R$ 900 por dia, mais metade de cada tarefa do mural. O dinheiro entra no jogo dele na próxima vez que ele abrir o próprio save.
- **Chamar todos aqui:** todo mundo vê uma seta na tela com a distância até quem chamou. No mapa aparecem os outros vaqueiros (pontos amarelos).
- **Corrida de galope:** o dono escolhe o destino (Praça de Itarantim, Pista da Fazenda Duarte ou Porto do Rio Pardo). Todos largam juntos depois de 3…2…1, e quem chegar primeiro leva R$ 300.
- **Pedir para dormir:** o convidado avisa que quer dormir, e o dono vê quem está pronto (😴 na etiqueta da sala).
- **Só o dono pode:** vender, fazer obras, comprar terra e dormir para passar o dia. O jogo fica salvo no aparelho do dono, e a sala fecha quando o dono sai.

## Rodar o servidor próprio no seu computador

```bash
cd online
npm install
node servidor.mjs        # abre em http://localhost:8790
```

Para testar, abra duas abas: abra a fazenda numa e entre com o código na outra. O teste automático confere 20 itens, entre eles convite, reconexão, diária, chamado e corrida.

Testes automáticos (precisam do Playwright):

- `node testes/teste_online.cjs` testa pelo servidor de salas.
- `node testes/teste_online.cjs --p2p` testa a conexão direta, com um PeerServer local no lugar do público.
