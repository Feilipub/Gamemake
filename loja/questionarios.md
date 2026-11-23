# Respostas para os questionários do Play Console

As respostas valem para a versão 16.2 e seguem o que o jogo faz de verdade. Confira cada uma antes de enviar.

## Acesso ao app
**Todas as funcionalidades estão disponíveis sem restrições.** Não há login nem conteúdo bloqueado por senha. O modo online só precisa do código de 4 letras que o dono da sala passa.

## Anúncios
**Não**, o app não contém anúncios.

## Classificação do conteúdo (questionário IARC)
- **Categoria:** Jogo.
- **Violência:** sim, leve e sem sangue.
  - Animais podem dar chifrada ou picar (cobra).
  - Existe uma espingarda fictícia, usada só para tiros de advertência que espantam a onça.
  - Não dá para matar pessoas nem animais, e não há sangue.
- **Medo / terror:** não.
- **Sexualidade e nudez:** não. O jogo tem namoro e casamento, sem conteúdo sexual.
- **Linguagem imprópria:** não.
- **Drogas, álcool e tabaco:** não. Há um bar na cidade com sinuca, mas ninguém bebe no jogo.
- **Jogos de azar / apostas:** não. A sinuca não usa dinheiro real nem aposta.
- **Compras dentro do jogo:** não.
- **Os usuários podem interagir ou trocar informações?** **Sim.** O modo online tem chat de texto livre entre os jogadores da mesma sala. As salas são privadas: só entra quem recebe o código.
- **Compartilha a localização do usuário com outros usuários?** Não. Só a posição do vaqueiro dentro do mapa do jogo.
- **Classificação esperada:** Livre a 12 anos. Por causa do chat, a loja mostra o aviso "Os usuários interagem".

## Público-alvo e conteúdo
- **Faixas etárias:** marque **13 a 15, 16 a 17 e 18 ou mais**.
- **Menores de 13:** não marque. Se marcar, o jogo entra nas regras do programa "Famílias", que são bem mais rígidas e exigem cuidados extras com o chat. O jogo não é feito especificamente para crianças.
- **O app pode atrair crianças sem querer?** Não. É um simulador de fazenda com gestão e economia.

## Segurança dos dados (Data safety)
1. **O app coleta ou compartilha algum dos tipos de dados obrigatórios?** **Não.**
   - A RF Games não recebe nada.
   - No modo online, nome do vaqueiro, posição e mensagens do chat vão direto de um aparelho para o outro, com criptografia de ponta a ponta (WebRTC/DTLS).
   - As regras do Google dizem que dados transferidos com criptografia de ponta a ponta, que nem o desenvolvedor nem terceiros conseguem ler, não contam como "coletados".
   - O servidor da PeerJS só ajuda os aparelhos a se acharem: recebe o código da sala e o IP de conexão, sem nenhum dado da conta ou do jogo.
2. **Os dados são criptografados em trânsito?** Sim. A conexão online é criptografada (WebRTC/DTLS e WSS).
3. **Os usuários podem pedir a exclusão dos dados?** Não se aplica. Nada fica com o desenvolvedor: os saves ficam no aparelho e desinstalar o app apaga tudo.
4. **Opção mais conservadora, se o Google pedir para reavaliar:**
   - Declare **"Mensagens no app → Outras mensagens no app"** como **compartilhado**, **efêmero**, **opcional** e com a finalidade **"Funcionalidade do app"**.
   - Pela mesma regra, declare também **"Nome"** (só o nome do personagem).

## Apps governamentais, recursos financeiros, saúde, notícias e VPN
**Não** para todos.

## Política de privacidade
Use o link do GitHub Pages: `https://feilipub.github.io/Gamemake/privacidade.html`. Ele funciona depois que o Pages estiver ligado (passo do LEIA-ME). Se preferir, use o Google Sites, como antes.
