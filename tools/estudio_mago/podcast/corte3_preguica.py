"""Corte do Podcast do Mago (motor 3.0, loop) — bicho-preguiça."""
GUEST = 'H'; GUEST_FN = 'preguica'; OUT = 'corte7_preguica'; VOZ = 'dub_preguica'; MUSIC = 'mk:island_beat'; HALF = True; TIGHT = True
EP = 19; NEXT = 'O CAMARÃO DO SOCO MAIS RÁPIDO DO MAR'
HOOK = ['ELE SÓ DESCE DA ÁRVORE', 'PRA FAZER COCÔ']
CAM_DX = 0; CAM_DY = 10
IMG = {'pg': ('OV:sloth algae fur#0', 'Preguiça-de-três-dedos: o verde no pelo é alga'), 'pg2': ('OV:sloth swimming#0', 'Bicho-preguiça')}
L = []
L.append((GUEST, 'Eu só desço da árvore mais ou menos uma vez por semana. E é pra fazer cocô.', 'happy', 'chest', {}))
L.append(('M', 'Pera, pera, pera. Você desce lá de cima só pra isso?', 'wide', 'point', {}))
L.append((GUEST, 'Só pra isso. Lá embaixo é perigoso, mas é ali que eu faço. Depois subo de novo, bem devagarinho.', 'happy', 'cast', {'img': 'pg'}))
L.append(('M', 'E esse verde no seu pelo? É mofo?', 'curious', 'point', {}))
L.append((GUEST, 'É alga. Ela cresce no meu pelo e me deixa verdinho. Lá em cima, ninguém me acha.', 'happy', 'shrug', {'laugh': 'M'}))
L.append(('M', 'E você é lento em tudo?', 'curious', 'think', {}))
L.append((GUEST, 'Quase tudo. Mas eu nado bem, e consigo prender a respiração por até quarenta minutos.', 'wide', 'hand', {'img': 'pg2'}))
L.append(('M', 'Então explica de novo pra quem chegou agora: por que você desce da árvore?', 'curious', 'point', {}))
