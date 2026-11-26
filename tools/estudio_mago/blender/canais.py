"""Gera os CANAIS DE ANIMAÇÃO 3D (um valor por osso por quadro, 24 fps) a partir da dublagem e do roteiro.
Atuação procedural com física de molas: boca pelo volume da voz, cabeça marcando sílabas fortes, sobrancelhas na ênfase,
piscadas naturais, respiração, gestos de braço do roteiro com antecipação e acomodação, ponta do chapéu atrasada,
quem escuta acena e vira para o outro. uso: python3 canais.py <modulo_roteiro> <quem> <saida.json> [t0 t1]"""
import os, sys, json, math, importlib, random
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); POD = os.path.join(HERE, '..', 'reels', 'podcast'); sys.path[:0] = [POD, os.path.join(POD, '..')]
import voz as VZ
E = importlib.import_module(sys.argv[1]); WHO = sys.argv[2]; OUT = sys.argv[3]
VOZ = os.path.join(POD, '..', E.VOZ); TL = json.load(open(os.path.join(VOZ, 'timeline.json')))
FPS = 24; SR = 44100
EV = TL['ev']; main = [e for e in EV if not e['bc']]
t0 = float(sys.argv[4]) if len(sys.argv) > 4 else 0.0; t1 = float(sys.argv[5]) if len(sys.argv) > 5 else TL['dur'] + 0.3
NF = int((t1 - t0) * FPS) + 1; T = t0 + np.arange(NF) / FPS

def env_for(w):
    env = np.zeros(NF); lau = np.zeros(NF)
    for e in EV:
        if e['who'] != w: continue
        f0 = int((e['a'] - t0) * FPS)
        if e.get('laugh_audio'):
            a, b = max(0, f0), min(NF, int((e['b'] - t0) * FPS)); lau[a:b] = 1; continue
        _, txt, emo, _, _ = E.L[e['i']]; y = np.load(os.path.join(VOZ, 'cache', VZ.key(w, txt, emo))).astype(np.float32)
        hop = SR // FPS; r = np.array([np.sqrt((y[k:k + hop] ** 2).mean()) for k in range(0, len(y), hop)]) * e['gain']
        for k, v in enumerate(r):
            if 0 <= f0 + k < NF: env[f0 + k] = max(env[f0 + k], v)
    if env.max() > 0: env /= np.percentile(env[env > 0], 95)
    return np.clip(env, 0, 1.2), lau

def spring(target, imp, f_hz, zeta):
    k = (2 * math.pi * f_hz) ** 2; c = 2 * zeta * math.sqrt(k); x = target[0]; v = 0.0; out = np.zeros(NF); dt = 1 / FPS
    for i in range(NF):
        v += imp[i]; v += (k * (target[i] - x) - c * v) * dt; x += v * dt; out[i] = x
    return out

env, lau = env_for(WHO)
jaw = np.convolve(env, [0.25, 0.5, 0.25], 'same')                                   # mouth follows the voice, slightly smoothed
d = np.maximum(0, np.diff(env, prepend=0)); beats = []
for i in range(2, NF - 2):
    if d[i] > 0.12 and d[i] == d[i - 2:i + 3].max() and (not beats or i - beats[-1] > 0.25 * FPS): beats.append(i)

ph = 0.0 if WHO == 'M' else 1.7
nod_t = np.zeros(NF); roll_t = 3.0 * np.sin(2 * np.pi * T / 6.1 + ph); turn_t = 4.0 * np.sin(2 * np.pi * T / 8.3 + ph)
spine_t = 1.5 * np.sin(2 * np.pi * T / 7.0 + ph); brow_t = np.zeros(NF)
imp_nod = np.zeros(NF); imp_roll = np.zeros(NF); imp_turn = np.zeros(NF); imp_spine = np.zeros(NF); imp_brow = np.zeros(NF)
for n, i in enumerate(beats):                                                        # stressed syllables: nod + tilt + brows
    a = min(1.0, d[i] * 4); imp_nod[i] += 110 * a; imp_roll[i] += (1 if n % 2 else -1) * 70 * a; imp_turn[i] += (1 if n % 3 == 0 else -1) * 40 * a
    imp_brow[i] += 0.5 * a; imp_spine[i] += 25 * a
arms = {k: np.zeros(NF) for k in ('uL_x', 'uL_z', 'fL_x', 'fL_z', 'uR_x', 'uR_z', 'fR_x', 'fR_z')}
GEST = {'point': {'fL_x': 55, 'fL_z': 15, 'uL_x': -10}, 'hand': {'fL_x': 40, 'fL_z': 25}, 'count': {'fL_x': 50, 'fL_z': 10},
        'cast': {'uL_z': -22, 'fL_z': 40, 'fL_x': 30, 'uR_z': 22, 'fR_z': -40, 'fR_x': 30},
        'shrug': {'uL_z': -18, 'fL_z': 55, 'fL_x': 20, 'uR_z': 18, 'fR_z': -55, 'fR_x': 20},
        'chest': {'fR_x': 70, 'fR_z': -25}, 'think': {'fR_x': 80, 'fR_z': -15}, 'clap': {'fL_x': 45, 'fR_x': 45, 'fL_z': -10, 'fR_z': 10},
        'slap': {'fL_x': 35, 'uL_x': -20}, 'facepalm': {'fR_x': 95, 'uR_x': -20, 'fR_z': -10}, 'drink': {'fR_x': 60}}
for e in main:
    a, b = int((e['a'] - t0) * FPS), int((e['b'] - t0) * FPS)
    if b < 0 or a >= NF: continue
    a0, b0 = max(0, a), min(NF, b)
    if e['who'] == WHO:
        bias = {'curious': (6, 0.6), 'sad': (-4, -0.4), 'serious': (-2, -0.2), 'mystic': (4, 0.3), 'angry': (-3, -0.8), 'scared': (-6, 0.9), 'wide': (0, 1.0)}.get(e['emo'], (0, 0.2))
        roll_t[a0:b0] += bias[0]; brow_t[a0:b0] += bias[1]
        if e['emo'] in ('wide', 'scared', 'angry') and a >= 0: imp_spine[a] -= 120; imp_nod[a] -= 160         # pull back in surprise
        g = GEST.get(e['gest'])
        if g:                                                                           # gesture held for most of the line, eased by springs
            hold_end = min(b0, a0 + int(max(1.2, (b - a) / FPS * 0.7) * FPS))
            for k, v in g.items(): arms[k][a0:hold_end] += v
        turn_t[a0:b0] += 0
    else:
        turn_t[a0:b0] += 14 if WHO == 'M' else -14                                       # listener turns toward the speaker
        if e['txt'].rstrip().endswith('?'): roll_t[a0:b0] += 5; brow_t[a0:b0] += 0.4
        for q in range(a0 + int(0.7 * FPS), b0, int(1.5 * FPS)): imp_nod[q] += 90       # listening nods
for e in EV:
    if e['bc'] and e['who'] == WHO and not e.get('laugh_audio'):
        q = int((e['a'] - t0) * FPS)
        if 0 <= q < NF: imp_nod[q] += 140
L = np.convolve(lau, np.ones(5) / 5, 'same')
nod_t += L * (-8 + 6 * np.abs(np.sin(T * 2 * np.pi * 3.0))); spine_t += L * 6 * np.sin(T * 2 * np.pi * 1.5); brow_t += L * 0.8; jaw = np.maximum(jaw, L * (0.55 + 0.4 * np.abs(np.sin(T * 2 * np.pi * 5))))

C = {}
C['head_x'] = spring(nod_t, imp_nod, 2.2, 0.38); C['head_y'] = spring(roll_t, imp_roll, 1.6, 0.4); C['head_z'] = spring(turn_t, imp_turn, 1.3, 0.5)
C['spine_x'] = spring(spine_t, imp_spine, 1.2, 0.45); C['breath'] = 0.012 * (0.5 - 0.5 * np.cos(2 * np.pi * T / 3.8 + ph)) + L * 0.02
C['jaw'] = np.clip(jaw, 0, 1.1) * 32
C['brow'] = spring(brow_t, imp_brow, 3.0, 0.45)
hv = np.gradient(C['head_y'] + C['head_x'] * 0.5) * FPS; C['hat_tip'] = spring(-0.35 * hv, np.zeros(NF), 1.4, 0.25)
for k, v in arms.items():
    C[k] = spring(v, np.zeros(NF), 1.7, 0.55)
rng = random.Random(7 + len(WHO)); blink = np.zeros(NF); t = 0.8
while t < T[-1] - t0:                                                                # natural blinks: 3-5 s apart, sometimes double
    f = int(t * FPS)
    for k, v in enumerate([0.5, 1.0, 1.0, 0.6, 0.2]):
        if f + k < NF: blink[f + k] = max(blink[f + k], v)
    if rng.random() < 0.2: t += 0.35; continue
    t += rng.uniform(2.6, 5.0)
C['lid'] = blink
for k in C: C[k] = [round(float(x), 4) for x in C[k]]
shots = []; last = None
for e in main:
    if e['b'] < t0 or e['a'] > t1: continue
    s = 'close' if (e['who'] == WHO and e['emo'] in ('wide', 'scared', 'angry', 'mystic')) else 'medium'
    if s != last: shots.append((max(0.0, e['a'] - t0 - 0.1), s)); last = s
json.dump(dict(fps=FPS, nf=NF, t0=t0, ch=C, shots=shots), open(OUT, 'w'))
print('canais', OUT, NF, 'quadros; batidas', len(beats))
