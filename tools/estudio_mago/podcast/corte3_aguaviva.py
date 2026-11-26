"""Corte do Podcast do Mago (motor 3.0, loop) — água-viva imortal (Turritopsis dohrnii)."""
GUEST = 'K'; GUEST_FN = 'agua_viva'; OUT = 'corte7_aguaviva'; VOZ = 'dub_aguaviva'; MUSIC = 'mk:dance_with_me'; HALF = True; TIGHT = True
EP = 18; NEXT = 'O BICHO QUE SÓ DESCE DA ÁRVORE PRA FAZER COCÔ'
HOOK = ['ELA NUNCA', 'MORRE DE VELHICE']
CAM_DX = 0; CAM_DY = 10
IMG = {'jv': ('OV:Turritopsis inat close', 'Água-viva imortal (Turritopsis) no mar'), 'jv2': ('OV:Turritopsis inat wide', 'O pontinho vermelho é ela: uns 4 mm')}
L = []
L.append((GUEST, 'Quando eu fico velha ou machucada, eu volto a ser bebê. E começo a vida de novo.', 'happy', 'chest', {}))
L.append(('M', 'Pera, pera, pera. Você volta a ser bebê?', 'wide', 'point', {}))
L.append((GUEST, 'Eu viro um pólipo, que é a minha fase de filhote, grudado no fundo do mar. Depois cresço de novo. E posso repetir isso várias vezes.', 'happy', 'cast', {'img': 'jv'}))
L.append(('M', 'Então você é imortal?', 'wide', 'clap', {}))
L.append((GUEST, 'Quase. Eu não morro de velhice, mas um peixe ainda pode me comer.', 'sad', 'shrug', {'laugh': 'M'}))
L.append(('M', 'E você é desse tamanho mesmo?', 'curious', 'think', {}))
L.append((GUEST, 'Que nada. Eu tenho uns quatro milímetros. Sou menor que a sua unha.', 'happy', 'hand', {'img': 'jv2', 'laugh': 'both'}))
L.append(('M', 'Então conta de novo pra quem chegou agora: o que acontece quando você fica velha?', 'curious', 'point', {}))
