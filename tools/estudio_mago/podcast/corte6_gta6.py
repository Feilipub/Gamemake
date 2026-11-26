"""Corte do Podcast do Mago (motor 3.0, loop) — GTA 6 saiu (19/11/2026). Convidado original: Flávio, flamingo de Miami.
Sem imagens/marcas do jogo: fotos reais de Miami (inspiração de Vice City) + infográficos próprios com os dados oficiais."""
GUEST = 'Y'; GUEST_FN = 'flamingo'; OUT = 'corte6_gta6'; VOZ = 'dub_gta6'; MUSIC = 'mk:midnight_funk'; HALF = True; TIGHT = True
CAST4 = {'M': 'mago', GUEST: 'flamingo'}
EP = 17; NEXT = 'COMENTA QUEM VOCÊ QUER AQUI!'
HOOK = ['GTA 6 FEZ US$ 3,8 BI', 'EM UM ÚNICO DIA']
CAM_DX = 0; CAM_DY = -22
IMG = {'vendas': ('LOCAL:' + __import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), '..', '..', 'media', 'ilus', 'gta_vendas.png'), 'Vendas do 1º dia (estimativa oficial)'),
       'compara': ('LOCAL:' + __import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), '..', '..', 'media', 'ilus', 'gta_compara.png'), 'GTA 5 x GTA 6: primeiro dia'),
       'miami': ('OV:miami ocean drive art deco#4', 'Ocean Drive, Miami Beach: a inspiração de Vice City'),
       'skyline': ('OV:miami skyline night#0', 'Miami à noite')}
L = []
L.append((GUEST, 'Treze anos. Eu esperei treze anos por esse jogo. E ele finalmente saiu.', 'wide', 'cast', {}))
L.append(('M', 'Pera, pera, pera. Você tá falando do GTA 6?', 'wide', 'point', {}))
L.append((GUEST, 'Lançou dia dezenove de novembro. E num único dia, vendeu três bilhões e setecentos milhões de dólares.', 'wide', 'hand', {'img': 'vendas'}))
L.append(('M', 'Num dia só? Isso é muito dinheiro!', 'scared', 'shrug', {}))
L.append((GUEST, 'É o maior lançamento de entretenimento da história. Quase cinco vezes o primeiro dia do GTA 5.', 'happy', 'count', {'img': 'compara'}))
L.append(('M', 'E por que um flamingo tá tão animado com isso?', 'curious', 'think', {}))
L.append((GUEST, 'Porque o jogo se passa num lugar inspirado na Flórida, a minha casa! E a cidade de Vice City é inspirada em Miami.', 'happy', 'chest', {'img': 'miami'}))
L.append(('M', 'E valeu a pena esperar tanto?', 'curious', 'shrug', {}))
L.append((GUEST, 'Adiaram duas vezes, Mago. Eu fiquei tanto tempo num pé só, que esqueci qual era o outro.', 'sad', 'facepalm', {'laugh': 'both'}))
L.append(('M', 'Peraí. Quanto tempo você esperou mesmo?', 'curious', 'point', {}))
