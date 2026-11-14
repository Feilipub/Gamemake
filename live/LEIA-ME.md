# Fazenda da Live — Lida no Sertão (jogo interativo para live do TikTok)

Um jogo separado do Lida no Sertão, feito para **transmitir ao vivo no TikTok**. Quem assiste mexe na fazenda:
comentários criam bichos com o nome da pessoa, presentes trazem chuva, caminhão de boi, o Barbatão e a grande
vaquejada, e as curtidas enchem a barra do São João. A tela já é **em pé (9:16)**, do jeito da live.

> Este jogo não mexe em nada do jogo principal (pasta `jogo/`). Tudo fica nesta pasta `live/`.

---

## 0. Só tenho celular

Dá para fazer tudo pelo celular. O jogo roda no **navegador do celular** e você transmite a **tela do celular** pela
live de **jogos para celular** do próprio TikTok. A ponte que lê os comentários e presentes fica num **servidor
grátis na internet** (Render), que você configura uma vez pelo navegador do celular.

**Passo 1. Colocar a ponte na internet (uma vez só, uns 10 minutos)**
1. No navegador do celular, entre em **https://render.com** e crie a conta com o botão **GitHub** (a mesma conta
   onde está este projeto).
2. Toque em **New +** → **Blueprint** → escolha o repositório deste projeto. O Render lê o arquivo `render.yaml`
   sozinho.
3. Quando ele pedir **TIKTOK_USUARIO**, escreva o seu usuário do TikTok **sem o @**. O **EULER_KEY** pode deixar
   vazio.
4. Toque em **Apply / Criar** e espere uns minutos. No fim aparece um link parecido com
   `https://fazenda-da-live.onrender.com`. **Esse é o link do seu jogo.** Guarde nos favoritos.
5. Para testar sem estar ao vivo: abra o link com `?sim=1` no final (ex.: `https://fazenda-da-live.onrender.com/?sim=1`)
   e use os botões do simulador. Ou, no Render, crie a variável **DEMO** = `1` (Environment) para chegarem eventos de
   mentira sozinhos; apague a variável antes da live de verdade.

> No plano grátis o Render "dorme" quando ninguém usa. Abra o link uns 2 minutos antes da live para ele acordar.
> Os planos e limites do Render mudam com o tempo; confira na página deles.

**Passo 2. Fazer a live**
1. Abra o link do jogo no navegador do celular e toque em **Começar**. O jogo pede tela cheia e deixa a tela
   sempre acesa.
2. Abra o **TikTok** → **+** → **LIVE** → escolha a live de **jogos para celular** ("Mobile gaming"). Ela transmite a
   tela do celular. Se a opção não aparecer na sua conta, o TikTok ainda não liberou esse tipo de live para você.
3. Comece a live e **volte para o navegador com o jogo**. O TikTok continua transmitindo a tela, e os comentários
   aparecem numa bolinha por cima.
4. Em poucos segundos a ponte conecta na sua live (dá para ver na página do Render, em **Logs**:
   `✅ Conectado na live de @seu_usuario`). A partir daí, o que o povo comentar e mandar aparece na fazenda.

**Dicas no celular**
- **3 toques no título** do jogo abrem e fecham o simulador.
- Deixe o celular **na tomada** e com o **"não perturbe"** ligado, para notificação não aparecer na live.
- Se a fazenda "zerar", é porque o navegador foi limpo: ela fica salva no navegador do celular.

## 1. O que precisa (no computador)

- Um **computador** (Windows, Mac ou Linux) com internet.
- **Node.js** (versão 18 ou mais nova): baixe em https://nodejs.org (botão "LTS").
- **TikTok LIVE Studio** (programa oficial do TikTok para transmitir do PC) **ou** OBS Studio.
- A conta do TikTok precisa poder fazer live. O TikTok pede um mínimo de seguidores e idade mínima, e receber
  presentes também tem regra de idade; confira no aplicativo, porque isso muda de tempos em tempos.

## 2. Testar sem estar ao vivo (2 minutos)

- **Windows:** dê dois cliques em `iniciar-live.bat`, deixe o usuário vazio e aperte Enter.
- **Mac/Linux:** rode `./iniciar-live.sh` e aperte Enter sem digitar nada.
- Ou, no terminal, dentro desta pasta: `npm install` (só na primeira vez) e depois `npm run demo`.

O navegador abre em `http://localhost:8787/?sim=1` com o **simulador** do lado (tecla **S** mostra/esconde).
No modo demonstração chegam comentários e presentes de mentira sozinhos, para você ver tudo funcionando.

## 3. Ligar na sua live de verdade

1. Comece a live no TikTok (pelo LIVE Studio ou pelo celular, tanto faz: o jogo lê a live pelo seu usuário).
2. Rode `iniciar-live.bat` (ou `node servidor.mjs SEU_USUARIO`) com o **seu usuário do TikTok** (sem o @).
3. Na janela preta deve aparecer: `✅ Conectado na live de @seu_usuario`. Se a live ainda não começou, ele avisa
   e tenta de novo a cada 20 segundos sozinho.
4. Abra o jogo em `http://localhost:8787` e coloque essa janela na transmissão:
   - **TikTok LIVE Studio:** Adicionar fonte → *Captura de janela* (ou *Navegador/Link*, se aparecer) →
     escolha a janela do jogo. Use o layout **vertical**.
   - **OBS:** Fontes → **Navegador** → URL `http://localhost:8787/?obs=1`, largura **1080**, altura **1920**.
     (No OBS o som já sai junto; marque "Controlar áudio pelo OBS" se quiser ajustar o volume lá.)
5. Pronto: o que o povo comentar e mandar aparece na hora na fazenda.

> A ligação com o TikTok usa uma biblioteca **não oficial** (`tiktok-live-connector`). Ela é muito usada por
> streamers, mas pode parar de funcionar quando o TikTok muda alguma coisa, e o uso pode esbarrar nos termos do
> TikTok. Se parar, rode `npm install tiktok-live-connector@latest` dentro desta pasta. Se a conexão ficar
> limitando, crie uma chave grátis na Euler Stream (https://www.eulerstream.com) e rode
> `node servidor.mjs SEU_USUARIO --chave=SUA_CHAVE`.

### Sem programa nenhum: TikFinity / Streamer.bot

Se preferir usar o **TikFinity** (ou Streamer.bot) para ler a live, dá para ligar presentes em **teclas** ou em
**links** (webhook):

| Tecla | Acontece | Link (webhook) |
|---|---|---|
| 1 | Nasce um bezerro | `http://localhost:8787/acao?a=bezerro&user={nickname}` |
| 2 | Chuva | `http://localhost:8787/acao?a=chuva&user={nickname}` |
| 3 | Caminhão de bois | `http://localhost:8787/acao?a=caminhao&user={nickname}` |
| 4 | Barbatão (boi bravo) | `http://localhost:8787/acao?a=barbatao&user={nickname}` |
| 5 | Grande vaquejada | `http://localhost:8787/acao?a=vaquejada&user={nickname}` |
| 6 | Festa de São João | `http://localhost:8787/acao?a=festa&user={nickname}` |
| 7 | Aboio | `http://localhost:8787/acao?a=aboio&user={nickname}` |
| 8 | Corrida de jegue | `http://localhost:8787/acao?a=corrida&user={nickname}` |
| 9 | Fogueira | `http://localhost:8787/acao?a=fogueira&user={nickname}` |
| 0 | Forró | `http://localhost:8787/acao?a=forro&user={nickname}` |

Também dá para mandar um evento completo, por exemplo um presente:
`http://localhost:8787/evento?tipo=gift&user={nickname}&diamantes=100&qtd=1`
(troque `{nickname}` pela variável de nome que o seu programa usa).

Para as **teclas** funcionarem, a janela do jogo precisa estar em foco (ou use os links acima, que funcionam sempre).

---

## 4. O que o público pode fazer (mostre isso na descrição da live)

**Comentários** (com ou sem "!"):
- `boi`, `vaca`, `cavalo`, `jegue`, `galinha`, `cachorro`: aparece o bicho **com o seu nome** na fazenda
- `aboio`: o vaqueiro aboia e o gado vem
- `laço`: o vaqueiro laça um boi
- `chuva`: vota para chover (5 votos em 40 segundos fazem chover)
- `fogueira`: acende a fogueira (bonito de noite)
- `forró`: a bicharada dança
- `1`, `2` ou `3`: aposta na corrida de jegue (quando ela está aberta)

**Presentes** (pelo valor em diamantes):
- 1 💎 (ex.: Rosa): **nasce um bezerro** com o nome de quem mandou (com combo, nascem até 5)
- 5 💎 ou mais: **chuva no sertão** e arco-íris
- 30 💎 ou mais: **chega um caminhão de bois** com o nome de quem mandou
- 100 💎 ou mais: o **Barbatão**, boi bravo, invade e o vaqueiro corre atrás até laçar
- 500 💎 ou mais: **GRANDE VAQUEJADA** com o nome de quem mandou

**Curtidas:** enchem a barra do topo. Quando enche, começa o **São João** com fogueira, bandeirolas, forró e fogos.
**Seguir:** o nome aparece como "novo vaqueiro da fazenda". **Compartilhar:** às vezes chega um caminhão.
De tempos em tempos (a cada 6 minutos) abre uma **corrida de jegue** com apostas pelo chat.

O topo mostra o ranking **Vaqueiros da live** (quem mais participou). A fazenda fica salva: na próxima live os
bichos continuam lá (o botão "Zerar fazenda" do simulador apaga tudo).

## 5. Mudar as regras

Abra `config.js` num editor de texto (Bloco de Notas serve). Lá dá para trocar: título, comandos e apelidos, quantos
votos fazem chover, qual presente faz o quê, a meta de curtidas, de quanto em quanto tempo tem corrida, a duração do
dia, o limite de bichos, as palavras bloqueadas nos nomes e o volume. Salve e aperte F5 no jogo.

## 6. Cuidados

- Os presentes acionam só acontecimentos **dentro do jogo**. Não prometa dinheiro nem prêmio fora do jogo em troca de
  presente: isso vai contra as regras do TikTok.
- Os nomes passam por um filtro de palavrões (lista em `config.js`). Aumente a lista se precisar.
- Deixe o volume do jogo baixo se você fala por cima.

## 7. Arquivos

- `index.html`: o jogo (abre no navegador).
- `config.js`: as regras que você pode editar.
- `servidor.mjs`: a ponte que lê a live do TikTok e manda para o jogo; também recebe os links (webhook).
- `iniciar-live.bat` / `iniciar-live.sh`: atalhos para começar com dois cliques.
- `testes/teste_live.cjs`: teste automático (precisa do Playwright).
