"""PODCAST DO MAGO — bíblia do formato. Tudo o que o roteirista (Claude) segue ao escrever cada episódio.

ESTRUTURA DE EPISÓDIO (40–60 min), inspirada no formato de conversa longa dos grandes podcasts (Flow nasceu do Joe Rogan Experience):
  0. COLD OPEN (30–45 s)  — o melhor trecho do episódio, sem contexto, para prender nos primeiros segundos
  1. VINHETA + ABERTURA   — apresentador recebe o convidado; papo leve, quebra-gelo, piada sobre a chegada
  2. ORIGEM               — quem é o convidado antes da fama: infância, família, o que o levou até a história
  3. A JORNADA            — o miolo: a história principal contada em ordem, com detalhes sensoriais (cheiro, comida, medo)
  4. O CLÍMAX             — o momento mais marcante (a virada); apresentador desacelera e deixa o convidado contar
  5. A CONVERSA PROFUNDA  — reflexão honesta, um tema sério tratado com respeito, opiniões diferentes convivem
  6. O AGORA              — o convidado no presente; humor de contraste; histórias leves
  7. PINGA-FOGO           — perguntas rápidas, respostas curtas e engraçadas
  8. ENCERRAMENTO         — recado do convidado, agradecimento, chamada para o próximo episódio

REGRAS DE CONVERSA (o que faz parecer real)
  • Toda pergunta nasce da resposta anterior (pergunta de acompanhamento: "pera, volta aí…", "como assim?").
  • Perguntas abertas ("me conta…", "como foi…"), nunca de sim/não no miolo.
  • O apresentador reage antes de perguntar ("caramba", "sério?") e às vezes conta uma história própria curta.
  • Reações curtas do ouvinte por cima da fala do outro ("uhum", "nossa") — mixadas baixinho.
  • Interrupções naturais quando há empolgação; risadas de verdade nos momentos engraçados (sem forçar).
  • Piadas que voltam depois (callbacks) costuram o episódio.
  • Ganchos a cada bloco: o convidado anuncia algo que vai contar ("e aí aconteceu a coisa mais louca…").
  • Fatos históricos/científicos reais e conferidos; quando houver dúvida, os personagens falam como dúvida.
  • Temas sensíveis com respeito, sem deboche de povos, religiões ou pessoas reais.

ELENCO FIXO
  MAGO — apresentador. Curioso, bem-humorado, ouve mais do que fala, faz a pergunta que o público faria,
         admite quando não sabe. Tique: "pera, pera, pera". Voz: pm_santa natural.
CONVIDADOS
  JUVENAL (ep. 1) — esqueleto de um grumete português da frota de Cabral (1500). Acordou em 2026 quando o Mago
         derrubou uma poção na praia de Porto Seguro. Contador de histórias empolgado, autoironia de esqueleto,
         mistura palavras antigas ("vossa mercê", "rapaz") com gírias que está aprendendo errado. Coração mole
         ("coração eu não tenho mais, mas sinto aqui"). Saudade da mãe, Dona Inês, em Lisboa.
         Piadas recorrentes: o café que vaza pelas costelas; "a culpa é sua, Mago"; acha que celular é espelho.
         Voz: pm_alex natural, um pouquinho mais grave.
"""
CAST = {
    'M': dict(name='MAGO', voice='pm_santa', pitch=1.00, speed=1.00, color=(255, 210, 60)),
    'J': dict(name='JUVENAL', voice='pm_alex', pitch=0.96, speed=1.02, color=(150, 220, 255)),
    # convidados dos cortes curtos
    'R': dict(name='REX', voice={'pm_alex': 0.6, 'am_onyx': 0.4}, pitch=0.9, speed=0.98, color=(120, 230, 120)),
    'N': dict(name='NEFERU', voice='pf_dora', pitch=0.97, speed=0.97, color=(255, 120, 210)),
    'T': dict(name='TONHA', voice='pf_dora', pitch=1.06, speed=1.1, color=(255, 170, 80)),
    'P': dict(name='PEDRO POMBO', voice='pm_alex', pitch=1.06, speed=1.06, color=(170, 190, 230)),
    'O': dict(name='OLGA', voice={'pf_dora': 0.75, 'af_bella': 0.25}, pitch=0.98, speed=1.0, color=(240, 120, 190)),
    'S': dict(name='VOVÔ TUBARÃO', voice={'pm_alex': 0.6, 'bm_george': 0.4}, pitch=0.88, speed=0.9, color=(160, 200, 240)),
    'Q': dict(name='ZUZU', voice='pf_dora', pitch=1.1, speed=1.12, color=(255, 90, 110)),
    'B': dict(name='MELISSA', voice={'pf_dora': 0.75, 'af_heart': 0.25}, pitch=1.04, speed=1.04, color=(255, 210, 40)),
    'V': dict(name='BJORN', voice={'pm_alex': 0.6, 'am_onyx': 0.4}, pitch=0.94, speed=1.0, color=(230, 110, 60)),
    'U': dict(name='MANECO', voice={'pm_alex': 0.65, 'bm_lewis': 0.35}, pitch=0.86, speed=0.94, color=(210, 150, 90)),
    'F': dict(name='FÁTIMA', voice='pf_dora', pitch=1.07, speed=1.1, color=(240, 100, 70)),
    'G': dict(name='GIGI', voice={'pf_dora': 0.7, 'af_sarah': 0.3}, pitch=0.97, speed=0.97, color=(250, 190, 80)),
    'D': dict(name='TARDI', voice='pm_alex', pitch=1.08, speed=1.08, color=(230, 210, 160)),
    'X': dict(name='LOLO', voice={'pf_dora': 0.7, 'af_nicole': 0.3}, pitch=1.05, speed=1.02, color=(255, 150, 190)),
    'W': dict(name='MARINA', voice={'pf_dora': 0.7, 'af_kore': 0.3}, pitch=0.9, speed=0.92, color=(110, 170, 255)),
    'Y': dict(name='FLÁVIO FLAMINGO', voice={'pm_alex': 0.75, 'am_puck': 0.25}, pitch=1.04, speed=1.05, color=(255, 120, 180)),
    'K': dict(name='KIKA', voice='pf_dora', pitch=1.08, speed=1.05, color=(150, 170, 255)),
    'H': dict(name='SERAFIM', voice='pm_alex', pitch=0.95, speed=0.85, color=(200, 170, 120)),
    'Z': dict(name='ZECA', voice='pm_alex', pitch=1.08, speed=1.12, color=(90, 220, 150)),
    'I': dict(name='BERG', voice={'pm_alex': 0.7, 'bm_daniel': 0.3}, pitch=0.92, speed=0.94, color=(150, 220, 255)),
}
