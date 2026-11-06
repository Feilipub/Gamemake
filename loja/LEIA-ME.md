# Como colocar o Lida no Sertão na Play Store

Tudo o que dá para preparar daqui já está pronto: o app compilado e assinado, os ícones, o banner, os prints, os textos e a política de privacidade. Os passos abaixo são os que **só você** pode fazer, porque pedem a sua conta, os seus documentos e um pagamento.

## O que já está pronto

| Item | Onde |
|---|---|
| App para enviar à loja (`.aab`, versão 7.9.0, código 79) | enviado no chat: `LidaNoSertao-7.9.0.aab` |
| App para instalar direto no celular e testar (`.apk`) | enviado no chat: `LidaNoSertao-7.9.0.apk` |
| Chave de upload + senha | enviado no chat: `chave_upload_lida.zip` (**guarde bem!**) |
| Ícone 512 × 512 | `loja/imagens/icone_512.png` |
| Banner 1024 × 500 | `loja/imagens/banner_1024x500.png` |
| Prints do celular (1080 × 1920) | `loja/imagens/tela_*.png` e `divulgacao/1_…4_*_vertical.png` |
| Nome, descrição curta e completa | `loja/textos_da_loja.md` |
| Política de privacidade | `loja/politica-de-privacidade.html` |
| Respostas dos questionários | `loja/questionarios.md` |

O identificador do app é **br.com.rfgames.lidanosertao**. Ele é para sempre: depois de publicado, não dá para trocar.

## Passo 1 — Testar no seu celular (hoje)
1. Passe o arquivo `LidaNoSertao-7.9.0.apk` para o celular Android.
2. Toque nele. O Android vai pedir para permitir "instalar apps desta fonte": permita.
3. Jogue um pouco e veja se está tudo certo (tela cheia, toque, som, salvar e voltar).

## Passo 2 — Criar a conta de desenvolvedor
1. Entre em **play.google.com/console** com a conta Google que vai ser dona do jogo.
2. Escolha conta **Pessoal** (ou Organização, se você tiver CNPJ e D-U-N-S).
3. Pague a taxa única de **US$ 25** (cartão de crédito internacional).
4. Envie o documento de identidade e confirme o celular. A verificação pode levar alguns dias.

## Passo 3 — Publicar a política de privacidade
A loja pede um link público. Jeito mais fácil e gratuito:
1. Abra **sites.google.com**, crie um site em branco chamado "Lida no Sertão — Privacidade".
2. Cole o texto de `loja/politica-de-privacidade.html` (abra o arquivo no navegador e copie). Troque **[coloque aqui o seu e-mail de contato]** pelo seu e-mail.
3. Publique e copie o link.

## Passo 4 — Criar o app no Play Console
1. **Criar app** → nome "Lida no Sertão", idioma Português (Brasil), **Jogo**, **Gratuito**.
2. Em **Configurar o app**, preencha tudo usando `loja/questionarios.md`: acesso ao app, anúncios (não), classificação etária, público-alvo, segurança dos dados, apps governamentais (não), recursos financeiros (não), saúde (não).
3. Em **Presença na loja → Página principal**, cole os textos de `loja/textos_da_loja.md` e envie as imagens.

## Passo 5 — Teste fechado com 12 pessoas (obrigatório para conta pessoal nova)
O Google exige que contas pessoais novas façam um **teste fechado com pelo menos 12 testadores por 14 dias seguidos** antes de liberar o jogo para todo mundo.
1. **Testar → Teste fechado → Criar faixa**.
2. Envie o arquivo `.aab`. Quando perguntar sobre a assinatura, aceite a **Assinatura de apps do Google Play** (recomendado). A chave de upload é a que já está no arquivo.
3. Adicione os e-mails (contas Google) de 12 ou mais pessoas, ou crie um Grupo do Google e coloque o grupo.
4. Mande o link de participação para elas. Cada uma precisa aceitar o convite e **manter o jogo instalado por 14 dias**.
5. Aproveite para pedir que contem onde travaram e do que gostaram: é o teste com gente de verdade que faltava.

## Passo 6 — Produção
Depois dos 14 dias, o Play Console libera o botão **Solicitar acesso à produção**. Responda as perguntas sobre o teste, envie a versão para **Produção** e aguarde a revisão do Google (de algumas horas a alguns dias).

## Atualizações futuras
A cada versão nova do jogo eu gero um `.aab` com o código de versão maior (80, 81…), assinado com a mesma chave de upload. Você só envia no Play Console.

## Avisos
- **Guarde a chave de upload e a senha** (`chave_upload_lida.zip`) num lugar seguro, como o Google Drive pessoal e um pen drive. Sem elas não dá para mandar atualizações. Se perder, dá para pedir ao Google para trocar a chave, mas demora alguns dias.
- No app, a opção **Exportar save** ainda não salva o arquivo no celular (o download de arquivo não funciona dentro do app). O save automático e o manual funcionam normalmente.
