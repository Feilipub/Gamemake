"""Corte do Podcast do Mago (motor 3.0, loop) — tamarutaca (camarão-louva-a-deus)."""
GUEST = 'Z'; GUEST_FN = 'tamarutaca'; OUT = 'corte7_tamarutaca'; VOZ = 'dub_tamarutaca'; MUSIC = 'mk:trap_electro_vibes'; HALF = True; TIGHT = True
EP = 20; NEXT = 'COMENTA QUEM VOCÊ QUER AQUI!'
HOOK = ['O SOCO MAIS RÁPIDO', 'DO MAR']
CAM_DX = 0; CAM_DY = 10
IMG = {'tm': ('OV:peacock mantis shrimp#0', 'Tamarutaca-pavão (Odontodactylus scyllarus)'), 'tm2': ('OV:mantis shrimp eyes#0', 'Olhos da tamarutaca')}
L = []
L.append((GUEST, 'Meu soco é tão rápido que a água em volta forma bolhas, e elas estouram com um clarão de luz.', 'wide', 'point', {}))
L.append(('M', 'Pera, pera, pera. Soco que solta luz?', 'wide', 'point', {}))
L.append((GUEST, 'Meu golpe passa dos oitenta quilômetros por hora, debaixo da água. Eu quebro concha de caranguejo numa pancada só.', 'wide', 'slap', {'img': 'tm'}))
L.append(('M', 'E é verdade que você quebra vidro de aquário?', 'curious', 'think', {}))
L.append((GUEST, 'Já aconteceu. Tem aquário que precisa de vidro reforçado por minha causa.', 'happy', 'shrug', {'laugh': 'M'}))
L.append(('M', 'E esses olhos esquisitos?', 'curious', 'point', {}))
L.append((GUEST, 'Cada um se mexe pra um lado. E eu tenho uns doze tipos de células de cor no olho. Você tem só três.', 'happy', 'cast', {'img': 'tm2'}))
L.append(('M', 'Então mostra de novo pra quem chegou agora: como é esse soco?', 'curious', 'point', {}))
