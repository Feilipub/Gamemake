# Lida no Sertão — modo online

Servidor pequeno (Node + `ws`) que faz duas coisas:

1. entrega o jogo (a pasta `../jogo`), e
2. passa as mensagens entre os vaqueiros da mesma sala, que tem um código de 4 letras e cabe de 2 a 6 jogadores.

A fazenda roda no navegador de quem **cria a sala** (o dono). Os convidados recebem a fazenda do dono e jogam nela.

## Colocar na nuvem de graça (Render)

1. Entre em <https://render.com> e crie uma conta grátis (dá para entrar com o GitHub).
2. Clique em **New +**, depois em **Blueprint**, e escolha este repositório (branch `ccr-8494ac05-m0vb49`).
3. O Render lê o `render.yaml` e cria o serviço **lida-online**. Clique em **Apply**.
4. Quando terminar, o jogo fica em `https://lida-online.onrender.com` (ou no nome que o Render mostrar).

O plano grátis dorme depois de 15 minutos sem ninguém jogando. A primeira pessoa a abrir pode esperar cerca de 1 minuto até ele acordar.

Se o seu serviço ganhar outro endereço, abra o jogo e vá em **Jogar online › Servidor**, cole o endereço (por exemplo `wss://meu-nome.onrender.com/ws`) e toque em **Salvar**. Isso só é necessário para quem abre o jogo por outro lugar, como o arquivo do zip ou o app. Quem abre pelo link do Render já usa o servidor certo.

## Como jogar

- **Dono:** na tela inicial, toque em **Jogar online**. Se já estiver jogando, vá em **Menu › Início › Jogar online**. Depois toque em **Abrir minha fazenda** e passe o código de 4 letras para os amigos.
- **Convidados:** toque em **Jogar online**, digite o código e toque em **Entrar**. Cada um chega montado no próprio cavalo, com o próprio boneco.
- **Juntos:** todos podem abrir porteiras, encher cochos, aboiar o gado, escovar, limpar e tratar. Tudo isso aparece para os outros. O caixa da fazenda é um só.
- **Chat:** tem chat e emojis, e as falas aparecem em balões em cima de cada vaqueiro.
- **Mural do dia:** traz 3 tarefas em grupo. Com 2 ou mais vaqueiros, a recompensa dobra.
- **Só o dono pode:** vender, fazer obras, comprar terra e dormir para passar o dia. O jogo fica salvo no aparelho do dono.

## Rodar no seu computador

```bash
cd online
npm install
node servidor.mjs        # abre em http://localhost:8790
```

Para testar, abra duas abas: abra a fazenda numa e entre com o código na outra.

Teste automático (precisa do Playwright): `node testes/teste_online.cjs`.
