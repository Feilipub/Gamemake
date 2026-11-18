# Como colocar o Lida no Sertão na Play Store (versão 17.0)

Tudo o que dá para preparar sem a sua conta já está pronto:

- o app compilado e assinado;
- os prints, o banner e os textos;
- a política de privacidade e as respostas dos questionários;
- a publicação automática pelo GitHub.

Os passos abaixo são os que **só você** pode fazer, porque pedem a sua conta Google, os seus documentos e um pagamento.

## O que já está pronto

| Item | Onde |
|---|---|
| App para enviar à loja (`.aab`, versão 17.0.0, código 83, Android 16 / API 36) | enviado no chat: `LidaNoSertao-17.0.0.aab` |
| App para instalar direto no celular e testar | enviado no chat: `LidaNoSertao-17.0.0.apk` |
| Chave de upload e senha | já enviadas antes no chat, em `chave_upload_lida.zip` (**é a mesma chave; guarde bem!**) |
| Ícone 512 × 512 | `loja/imagens/icone_512.png` |
| Banner 1024 × 500 | `loja/imagens/banner_1024x500.png` |
| 8 prints do celular (1080 × 1920) | `loja/imagens/tela_1…8_*.png`: fazenda, **online com amigos**, **haras**, cidade, **histórias**, mata, rio e menu |
| Nome, descrição curta e descrição completa | `loja/textos_da_loja.md` |
| Política de privacidade (com o modo online) | `loja/politica-de-privacidade.html` |
| Respostas dos questionários | `loja/questionarios.md` |
| Publicação automática | `.github/workflows/lida-android.yml` e `lida-site.yml` |

O identificador do app é **br.com.rfgames.lidanosertao**. Ele é para sempre: depois de publicado, não dá para trocar.

## Novidades do app na 16.2

- **Botão voltar do celular:** fecha o menu, a ficha ou a pesca. No jogo, abre o menu em vez de fechar o app. Na tela inicial, o app vai para segundo plano.
- **Exportar save e Baixar modelo de história:** agora funcionam dentro do app. O arquivo vai para a pasta **Downloads/Lida no Sertao**. Em Android antigo, abre a tela de compartilhar.
- **Modo online:** funciona no app, ligando um celular direto no outro.
- **Android 16 (API 36):** o app mira a versão que a Play Store exige para apps novos.
- **Tela "Sobre e privacidade":** fica em Configurações. Os créditos agora incluem PeerJS e OpenStreetMap.

## Novidades da 17.0 — Mutirão Online
- **Convidar amigos:** o convite abre o "Compartilhar" do Android, com o link e o código. O código da fazenda fica o mesmo de uma vez para a outra.
- **Reconexão:** quando a conexão cai, o convidado volta sozinho para a fazenda.
- **Diárias:** o convidado leva as diárias que ganhou para o próprio jogo.
- **Chamar todos aqui:** mostra uma seta na tela de todo mundo. O mapa mostra os outros vaqueiros.
- **Corrida de galope:** entre os vaqueiros, com prêmio de R$ 300.
- **Pedir para dormir:** o convidado pode pedir, e o dono vê quem está pronto.
- **3 conquistas novas:** Mutirão, Diarista e Ligeiro.

## Passo 1 — Testar no celular (5 minutos)

1. Passe `LidaNoSertao-17.0.0.apk` para o celular e toque nele. Permita "instalar apps desta fonte".
2. Jogue um pouco.
3. Teste o botão voltar, o **Exportar save** e uma sala online com outro celular.

## Passo 2 — Ligar o link grátis do jogo e da política de privacidade (1 clique)

1. No GitHub, abra o repositório **Gamemake › Settings › Pages**.
2. Em **Source**, escolha **GitHub Actions**.
3. Pronto. A cada atualização, o jogo e a política são publicados sozinhos em:
   - jogo (dá para instalar no celular pelo navegador): `https://feilipub.github.io/Gamemake/`
   - política de privacidade (use na loja): `https://feilipub.github.io/Gamemake/privacidade.html`

Se aparecer "Branch is not allowed to deploy", vá em **Settings › Environments › github-pages** e adicione o branch `ccr-8494ac05-m0vb49`.

Antes de usar a política, troque **[coloque aqui o seu e-mail de contato]** pelo seu e-mail em `loja/politica-de-privacidade.html`. Se quiser, eu troco: é só me passar o e-mail.

## Passo 3 — Criar a conta de desenvolvedor

1. Entre em **play.google.com/console** com a conta Google que vai ser a dona do jogo.
2. Escolha conta **Pessoal**, ou **Organização** se você tiver CNPJ e número D-U-N-S.
3. Pague a taxa única de **US$ 25** (cartão de crédito internacional).
4. Envie o documento de identidade e confirme o celular. A verificação pode levar alguns dias.

## Passo 4 — Criar o app no Play Console

1. Clique em **Criar app**:
   - nome: "Lida no Sertão";
   - idioma: Português (Brasil);
   - tipo: **Jogo**;
   - preço: **Gratuito**.
2. Em **Configurar o app**, preencha tudo com as respostas de `loja/questionarios.md`. Atenção ao modo online: a resposta para "usuários interagem" agora é **sim**.
3. Em **Presença na loja › Página principal**, cole os textos de `loja/textos_da_loja.md` e envie as imagens da pasta `loja/imagens`.

## Passo 5 — Teste fechado com 12 pessoas (obrigatório para conta pessoal nova)

1. Vá em **Testar › Teste fechado › Criar faixa**.
2. Envie o `.aab`. Aceite a **Assinatura de apps do Google Play**.
3. Adicione 12 ou mais testadores (contas Google ou um Grupo do Google) e mande o link de participação.
4. Cada testador precisa ficar com o jogo instalado por **14 dias seguidos**.

O modo online ajuda aqui: os testadores podem jogar juntos.

## Passo 6 — Produção

Depois dos 14 dias, clique em **Solicitar acesso à produção**, responda às perguntas e envie a versão para **Produção**.

## Passo 7 (opcional) — Atualizações sem mexer em nada

Depois do primeiro envio manual, o GitHub pode compilar e mandar cada versão nova para a loja sozinho. Configure uma vez:

1. **Conta de serviço:**
   - No Google Cloud, crie uma conta de serviço e baixe a chave JSON.
   - No Play Console, vá em **Usuários e permissões**, convide o e-mail dessa conta e dê a ela permissão de **Liberar apps**.
2. **Segredos:** no GitHub, abra **Settings › Secrets and variables › Actions** e crie:
   - `LIDA_KEYSTORE_BASE64`: o arquivo `lida-upload.jks` convertido em base64. No computador, rode `base64 -w0 lida-upload.jks` (Linux) ou `certutil -encode` (Windows).
   - `LIDA_KEYSTORE_SENHA`: a senha da chave, que está no `chave_upload_lida.zip`.
   - `PLAY_SERVICE_ACCOUNT_JSON`: o conteúdo do JSON da conta de serviço.
3. **Enviar uma versão:** abra **Actions › Lida no Sertão — Android › Run workflow** e escolha a faixa:
   - `internal`: teste interno;
   - `alpha`: teste fechado;
   - `production`: todo mundo.
   
   Use `draft` enquanto o app ainda não tiver passado pela primeira revisão. Atualizações no branch `main` também são enviadas sozinhas para o teste interno.

Sem esses segredos, o GitHub continua gerando um **APK de teste** a cada atualização (em **Actions**, na parte de baixo da execução, em "Artifacts").

O número de versão da nuvem é automático (100, 200, 300…). Ele é sempre maior que o 83 deste envio.

## Avisos

- **Guarde a chave de upload e a senha** num lugar seguro, como o Google Drive e um pen drive. Se perder, dá para pedir ao Google para trocar a chave, mas demora alguns dias.
- **Ninguém além de você pode fazer** os passos 3 a 6: conta, pagamento, documentos, questionários, testadores e o botão de publicar. O Google exige o dono da conta.
