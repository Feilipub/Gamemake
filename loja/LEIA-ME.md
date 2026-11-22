# Como colocar o Lida no Sertão na Play Store (versão 23.0)

Tudo o que dá para preparar sem a sua conta já está pronto:

- o app compilado e assinado;
- os prints, o banner e os textos;
- a política de privacidade e as respostas dos questionários;
- a publicação automática pelo GitHub.

Os passos abaixo são os que **só você** pode fazer, porque pedem a sua conta Google, os seus documentos e um pagamento.

## O que já está pronto

| Item | Onde |
|---|---|
| App para enviar à loja (`.aab`, versão 23.0.0, código 88, Android 16 / API 36) | enviado no chat: `LidaNoSertao-23.0.0.aab` |
| App para instalar direto no celular e testar | enviado no chat: `LidaNoSertao-23.0.0.apk` |
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

## Novidades da 23.0 — gráficos 2.0
- **Gente nova:**
  - corpo com joelho, cotovelo, mãos e rosto (olhos que piscam, sobrancelha, barba e bigode);
  - os 8 cortes de cabelo e cada tipo de chapéu, roupa e bota.
- **Animação de verdade:** a gente anda dobrando o joelho, balança os braços, respira e olha em volta.
- **Bichos novos:**
  - cavalos com passo, trote e galope;
  - gado com cupim, barbela, chifres de cada raça e ruminando;
  - cão abanando o rabo.
- **Texturas:** capim, terra, calçada, asfalto, tábua, reboco, telha, pedra e água, desenhadas pelo próprio jogo.
- **Câmera mais baixa:** mostra o rosto do vaqueiro, o horizonte e o céu, com sol, lua, estrelas, nuvens e serras ao longe. A câmera alta continua nos ajustes.
- **Mato e morros:** capim e flores que balançam com o vento, copas balançando e morros suaves no campo aberto.
- **Luz:**
  - sombras de casas, árvores, gente e bicho, que acompanham o sol;
  - água que reflete o céu;
  - brilho nas luzes e cor mais viva.
- **Imagem mais nítida:** 288 em vez de 192 pixels no lado curto da tela.
- **Configurações › Ajustes do 3D:** cada novidade pode ser desligada para deixar o jogo mais leve.

## Novidades da 22.0 — visual 3D (fase 3)
- **Luzes da noite:** postes, fogueira, janelas e lampião iluminam o chão. Dentro de casa, vela e fogão.
- **Pássaros e cidade:** pássaros do sertão, pombos, semáforos, enfeites e fios da cidade.
- **Festa na praça:** bandeirolas, barracas e palco.
- **Mais leve:** só desenha o que aparece na tela, com cerca de 3 vezes menos triângulos.

## Novidades da 21.0 — visual 3D (fase 2)
- **Casas por dentro em 3D:** os cômodos viram uma maquete com piso de tábua, paredes caiadas e móveis. Tocar no chão anda lá dentro.
- **Cenas em 3D:** as 16 cenas do jogo, com o caminhão, as visitas e os atores.
- **Pesca e canoa em 3D:** vara, linha, boia e as ondinhas na água.
- **Vaquejada em 3D:** boi, parceiro, faixas e o medidor.
- **Obras e roça:** silo, bebedouro, poço, catavento, tronco, cocho coberto, andaime durante a obra, cochos com o nível de ração e a horta com plantas e mato.
- **Mais vida no mapa:** peões a pé e montados, bichos do mato, carroças, carro de boi e o trânsito da cidade.
- **Vaqueiro de verdade:** chapéu de couro com a aba virada e a estrela, gibão e cavalo selado.
- **Configurações › Ajustes do 3D:** tremidinho PS1 liga e desliga, nitidez baixa, média ou alta, e cenas em 3D ou em 2D.
- **Mais leve:** o chão usa metade dos triângulos.

## Novidades da 20.0 — visual 3D (fase 1)
- **Como ligar:** em Configurações › Visual, toque em **3D (novo)**.
- **O mundo:** chão, água, cercas, porteiras, casas, árvores, cactos e pedras viram polígonos.
- **Os bonecos:** o vaqueiro, os moradores, o gado, os cavalos e os cães viram modelos 3D com passada.
- **A câmera:** gira com os botões ↺ ↻ ou com as teclas Z e X.
- **O visual:** jeitão de PlayStation, com resolução baixa, névoa e a luz da hora do dia.

## Novidades da 19.0
- **Vaquejada em dupla:** você escolhe ser puxador ou esteireiro e corre com um morador (a amizade ajuda) ou com um amigo online.
- **O ano no sertão:**
  - Experiência de Santa Luzia e dia de São José.
  - Festa da Colheita, com concurso e barraca.
  - Fogo no pasto na seca, com aceiro para segurar.
- **Mapa novo, Serra da Pedra Pintada e Povoado de Santa Rita:**
  - Pinturas rupestres, missão do Seu Bastião, quartzo e licuri.
  - Bodega da Dona Rita e capela.
- **Histórias novas** para Seu Tonho, Dona Lúcia, Dra. Clara, Professora Helena, Seu Cícero e Dona Graça.
- **Mercado de animais no modo online:** comprar e vender animais entre vaqueiros.
- **9 conquistas novas.**

## Novidades da 18.0
- **Modo foto** (Menu › Início):
  - Esconde a tela, pausa o tempo e aproxima a câmera.
  - Tem 5 filtros e moldura com o nome da fazenda e a data.
  - No app, a foto vai para a galeria (Imagens/Lida no Sertao).
- **Retrospectiva do ano:** abre sozinha no virar do ano e também pode ser vista quando quiser. Vira um cartão 1080 × 1350 para guardar ou mandar.
- **Auditoria completa:** todos os botões do jogo (quase 6.000, no mapa de gado e no de haras) foram apertados um por um, sem erros.
- **Conquista nova:** Retratista do sertão.

## Novidades da 17.0 — Mutirão Online
- **Convidar amigos:** o convite abre o "Compartilhar" do Android, com o link e o código. O código da fazenda fica o mesmo de uma vez para a outra.
- **Reconexão:** quando a conexão cai, o convidado volta sozinho para a fazenda.
- **Diárias:** o convidado leva as diárias que ganhou para o próprio jogo.
- **Chamar todos aqui:** mostra uma seta na tela de todo mundo. O mapa mostra os outros vaqueiros.
- **Corrida de galope:** entre os vaqueiros, com prêmio de R$ 300.
- **Pedir para dormir:** o convidado pode pedir, e o dono vê quem está pronto.
- **3 conquistas novas:** Mutirão, Diarista e Ligeiro.

## Passo 1 — Testar no celular (5 minutos)

1. Passe `LidaNoSertao-23.0.0.apk` para o celular e toque nele. Permita "instalar apps desta fonte".
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

O número de versão da nuvem é automático (100, 200, 300…). Ele é sempre maior que o 88 deste envio.

## Avisos

- **Guarde a chave de upload e a senha** num lugar seguro, como o Google Drive e um pen drive. Se perder, dá para pedir ao Google para trocar a chave, mas demora alguns dias.
- **Ninguém além de você pode fazer** os passos 3 a 6: conta, pagamento, documentos, questionários, testadores e o botão de publicar. O Google exige o dono da conta.
