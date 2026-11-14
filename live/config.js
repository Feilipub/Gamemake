// =====================================================================
//  CONFIGURAÇÃO DO "LIDA NO SERTÃO — FAZENDA DA LIVE"
//  Pode editar à vontade: comandos, presentes, metas e textos.
//  Depois de salvar, recarregue a página do jogo (F5).
// =====================================================================
window.LIVE_CONFIG = {
  // Nome que aparece no topo da tela
  titulo: 'FAZENDA DA LIVE',
  subtitulo: 'Lida no Sertão',

  // Comandos de comentário (o espectador escreve a palavra no chat, com ou sem "!")
  // espera = segundos que a MESMA pessoa espera para usar o comando de novo
  comandos: {
    boi:      { acao: 'boi',      espera: 45, txt: 'um boi com o seu nome' },
    vaca:     { acao: 'vaca',     espera: 45, txt: 'uma vaca com o seu nome' },
    cavalo:   { acao: 'cavalo',   espera: 60, txt: 'um cavalo com o seu nome' },
    jegue:    { acao: 'jegue',    espera: 60, txt: 'um jegue com o seu nome' },
    galinha:  { acao: 'galinha',  espera: 30, txt: 'uma galinha com o seu nome' },
    cachorro: { acao: 'cachorro', espera: 90, txt: 'um cachorro com o seu nome' },
    aboio:    { acao: 'aboio',    espera: 20, txt: 'o vaqueiro aboia e junta o gado' },
    laco:     { acao: 'laco',     espera: 30, txt: 'o vaqueiro laça um boi' },
    chuva:    { acao: 'votoChuva', espera: 20, txt: 'vota pra chover' },
    fogueira: { acao: 'fogueira', espera: 60, txt: 'acende a fogueira' },
    forro:    { acao: 'forro',    espera: 60, txt: 'a bicharada dança forró' },
    '1':      { acao: 'aposta1',  espera: 0, txt: 'aposta no jegue 1 (na corrida)' },
    '2':      { acao: 'aposta2',  espera: 0, txt: 'aposta no jegue 2 (na corrida)' },
    '3':      { acao: 'aposta3',  espera: 0, txt: 'aposta no jegue 3 (na corrida)' }
  },
  // Apelidos aceitos (com e sem acento)
  apelidos: { 'laço': 'laco', 'forró': 'forro', 'vaquinha': 'vaca', 'jumento': 'jegue', 'jumenta': 'jegue', 'cao': 'cachorro', 'cão': 'cachorro', 'chover': 'chuva' },
  votosParaChover: 5,          // quantos votos "chuva" (em 40 s) fazem chover

  // Presentes: escolhidos pelo valor em diamantes (o maior "min" que couber vale)
  presentes: [
    { min: 1,   acao: 'bezerro',   txt: 'Nasce um bezerro com o seu nome' },
    { min: 5,   acao: 'chuva',     txt: 'Chuva no sertão + arco-íris' },
    { min: 30,  acao: 'caminhao',  txt: 'Chega um caminhão de bois' },
    { min: 100, acao: 'barbatao',  txt: 'O boi bravo Barbatão invade a fazenda' },
    { min: 500, acao: 'vaquejada', txt: 'GRANDE VAQUEJADA com o seu nome' }
  ],

  // Curtidas enchem a barra da festa; quando enche, começa o São João
  curtidasParaFesta: 1500,
  // Corrida de jegue automática (minutos entre uma e outra; 0 = desliga)
  corridaACada: 6,
  // Ciclo de dia e noite (minutos para um dia inteiro)
  minutosPorDia: 12,
  // Máximo de animais na fazenda (os mais antigos vão "pra feira" quando enche)
  maxAnimais: 45,
  // Palavras que não podem aparecer nos nomes (são trocadas por ***)
  bloqueadas: ['porra', 'caralho', 'merda', 'puta', 'buceta', 'viado', 'fdp'],
  // Som do jogo (0 a 1)
  volume: 0.6,

  // Teclas (para TikFinity, Streamer.bot ou teclado): tecla -> ação
  teclas: { Digit1: 'bezerro', Digit2: 'chuva', Digit3: 'caminhao', Digit4: 'barbatao', Digit5: 'vaquejada', Digit6: 'festa', Digit7: 'aboio', Digit8: 'corrida', Digit9: 'fogueira', Digit0: 'forro' }
};
