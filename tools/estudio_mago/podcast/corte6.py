"""Cortes verticais do Podcast do Mago — MOTOR 6.0 3D: personagens 3D com esqueleto animados no Blender (canais.py +
animar.py), cada quadro renderizado; este arquivo planeja os planos e monta legendas, gancho, fotos e áudio por cima.
uso: python3 corte6.py roteiro plan  |  python3 corte6.py roteiro   (render dos quadros fica em blender/)
Herança — MOTOR 5.0: ANIMAÇÃO SOLTA. Boneco de recorte em camadas (rig2.py) movido por molas
(massa-mola-amortecedor): a cabeça marca as sílabas fortes da fala, inclina com a emoção, acena quando escuta, o corpo
balança e respira, a ponta do chapéu/crista balança atrasada, risada pula e achata; câmera com zoom suave, empurrão
no corte e chicote (whip) entre planos. Baseado no MOTOR 4.0/3.0 (1080x1920), feito para viralizar e converter em inscritos.
Regras do 3.0 (estudo de retenção em Shorts, 2026): o 1º segundo decide se a pessoa arrasta, então o quadro 0 já mostra
convidado falando + título + legenda (sem fade, sem flash, sem silêncio); sem tempo morto entre falas; final em LOOP
(a última fala do Mago puxa de volta a primeira fala, e o último plano é igual ao primeiro, para a pessoa assistir de novo
sem perceber); sem barra de progresso e sem fade de música no fim (ambos avisam que está acabando); formato de SÉRIE
numerada (série converte mais em inscritos); chamada para seguir ESPECÍFICA no meio do vídeo, não genérica; aviso do
próximo convidado no fim (curiosidade aberta para o próximo vídeo).
Herda do 2.0:
Novidades sobre o motor 1: iluminação viva no estúdio (neon pulsando, luz quente seguindo quem fala, ouvinte na penumbra,
poeira brilhando no ar, vinheta), câmera com movimentos suaves + tremor nos momentos de impacto + leve câmera na mão,
figurinhas de reação (!, ?!, KKKK) com som, legenda que destaca números, gancho com pancada de câmera e grave,
brilho passando nas fotos reais e ambiente sonoro mais rico.
uso: python3 podcast/corte2.py corte_x [test t1 t2 ...]"""
import json, os, sys, math, random, subprocess, importlib
import numpy as np, soundfile as sf
from PIL import Image, ImageDraw, ImageFont, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..'); sys.path[:0] = [HERE, ROOT, os.path.join(ROOT, '..')]
import estudio as ST, biblia as BB, voz as VZ
import media as MD, musicas2 as MU, sfxlib as X
E = importlib.import_module(sys.argv[1]); ARGS = sys.argv[2:]; G = E.GUEST
VOZ = os.path.join(ROOT, E.VOZ); TL = json.load(open(os.path.join(VOZ, 'timeline.json')))
SR = 44100; FPS = 24; W, H = 1080, 1920; CAM_Y = 300; CAM = 1080; CAMH = 1352; AR = CAM / CAMH; CAP_Y = 1430
BEBAS = '/usr/share/fonts/opentype/bebas-neue/BebasNeue-Bold.otf'; SANS = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
_F = {}
def F(p, n):
    if (p, n) not in _F: _F[(p, n)] = ImageFont.truetype(p, n)
    return _F[(p, n)]
def clamp(x, a=0.0, b=1.0): return a if x < a else (b if x > b else x)
def smooth(x): x = clamp(x); return x * x * (3 - 2 * x)
def back(x): x = clamp(x); c = 1.9; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2

EV = TL['ev']; main = [e for e in EV if not e['bc']]; DUR = TL['dur'] + 0.3
NF = int(DUR * FPS) + 2; WHO = ('M', G)
ENV = {w: np.zeros(NF) for w in WHO}; LAUGH = {w: np.zeros(NF, bool) for w in WHO}
for e in EV:
    f0 = int(e['a'] * FPS)
    if e.get('laugh_audio'): LAUGH[e['who']][f0:int(e['b'] * FPS)] = True; continue
    _, txt, emo, _, _ = E.L[e['i']]; y = np.load(os.path.join(VOZ, 'cache', VZ.key(e['who'], txt, emo))).astype(np.float32)
    hop = SR // FPS; r = np.array([np.sqrt((y[k:k + hop] ** 2).mean()) for k in range(0, len(y), hop)]) * e['gain']
    n = min(len(r), NF - f0); ENV[e['who']][f0:f0 + n] = np.maximum(ENV[e['who']][f0:f0 + n], r[:n])
for k in ENV: ENV[k] /= max(1e-6, np.percentile(ENV[k][ENV[k] > 0], 95))
def main_at(t):
    cur = None
    for e in main:
        if e['a'] <= t + 0.05: cur = e
        else: break
    return cur

# ---------------------------------------------------------------- MOTOR 4.0: câmeras individuais com retratos animados (rig.py)
BL = os.path.join(ROOT, '..', 'blender'); FR = {w: os.path.join(BL, 'fr_' + E.OUT + '_' + E.CAST4[w]) for w in WHO}
SHOTS = []                                                                   # (t, kind, who) kind: solo | close | split
rng = random.Random(11); last = None
for k, e in enumerate(main):
    who = e['who']; d = e['b'] - e['a']; o = 'M' if who == G else G
    kind = ('close' if (e['emo'] in ('wide', 'scared', 'angry') or rng.random() < 0.35) else 'solo')
    shot = (kind, who if kind != 'split' else None)
    if shot != last: SHOTS.append((max(0.0, e['a'] - 0.1), *shot)); last = shot
    if d > 5.5 and not e['fl'].get('img'):                                   # reaction cutaway in long lines
        SHOTS.append((e['a'] + d * 0.5, 'solo', o)); SHOTS.append((e['a'] + d * 0.5 + 1.2, *shot))
SHOTS.sort()
if main: SHOTS.append((main[-1]['b'] + 0.02, SHOTS[0][1], SHOTS[0][2]))     # loop: end on the opening shot
def shot_at(t):
    cur = SHOTS[0]
    for s_ in SHOTS:
        if s_[0] <= t: cur = s_
        else: break
    return cur
SHAKES = [(e['a'], 0.8) for e in main if e['emo'] in ('wide', 'angry', 'scared') and e['a'] > 0.5]
TALK = {w: np.convolve(np.clip(ENV[w] * 1.25, 0, 1), np.ones(3) / 3, 'same') for w in WHO}
BLINK_OFF = {'M': 0.0, G: 1.9}
def spring(target, impulses, f_hz=2.0, zeta=0.42):
    """damped spring following a target curve, with velocity kicks: overshoot + settle = loose, alive motion"""
    k = (2 * math.pi * f_hz) ** 2; c = 2 * zeta * math.sqrt(k); x = target[0]; v = 0.0; out = np.zeros(NF); dt = 1 / FPS
    for i in range(NF):
        v += impulses[i]; acc = k * (target[i] - x) - c * v; v += acc * dt; x += v * dt; out[i] = x
    return out
TT = np.arange(NF) / FPS
def speaker_mask(w):
    m = np.zeros(NF, bool)
    for e in main:
        if e['who'] == w: m[int(e['a'] * FPS):int(e['b'] * FPS) + 3] = True
    return m
POSE = {}
for i_w, w in enumerate(WHO):
    env = TALK[w]; spk = speaker_mask(w); ph = 1.3 * i_w
    d = np.maximum(0, np.convolve(np.diff(env, prepend=0), np.ones(3) / 3, 'same'))   # syllable onsets
    beats = [i for i in range(2, NF - 2) if d[i] > 0.09 and d[i] == d[i - 2:i + 3].max()]
    keep = []; 
    for i in beats:
        if not keep or i - keep[-1] > 0.22 * FPS: keep.append(i)
    rot_t = 2.2 * np.sin(2 * np.pi * TT / 5.3 + ph) ; dy_t = np.zeros(NF); body_t = 1.3 * np.sin(2 * np.pi * TT / 7.1 + ph); bdy_t = -3.0 * (0.5 - 0.5 * np.cos(2 * np.pi * TT / 3.6 + ph))
    imp_r = np.zeros(NF); imp_y = np.zeros(NF); imp_b = np.zeros(NF)
    for n_b, i in enumerate(keep):                                                            # beat gestures on stressed syllables
        amp = min(1.0, d[i] * 6); imp_r[i] += (1 if n_b % 2 else -1) * 30 * amp; imp_y[i] += 130 * amp; imp_b[i] += (1 if n_b % 3 else -1) * 8 * amp
    for e in main:
        a0, b0 = int(e['a'] * FPS), min(NF, int(e['b'] * FPS))
        if e['who'] == w:
            bias = {'curious': 5, 'sad': -3, 'serious': -1.5, 'mystic': 3, 'angry': -2.5, 'scared': -4}.get(e['emo'], 0)
            rot_t[a0:b0] += bias; dy_t[a0:b0] += {'sad': 6, 'serious': 2}.get(e['emo'], 0)
            if e['emo'] in ('wide', 'angry', 'scared'): bdy_t[a0:b0] -= 7; imp_y[a0] -= 160           # perk up / jump back on surprise
        else:
            if e['txt'].rstrip().endswith('?'): rot_t[a0:b0] += 6                                       # listener tilts head at a question
            for q in range(a0 + int(0.6 * FPS), b0, int(1.4 * FPS)): imp_y[q] += 110                       # listening nods
    for e in EV:
        if e['bc'] and e['who'] == w and not e.get('laugh_audio'):
            q = int(e['a'] * FPS); imp_y[q:q + 1] += 160
    lg = LAUGH[w].astype(float); lau = np.convolve(lg, np.ones(6) / 6, 'same')
    dy_t += lau * 5 * np.abs(np.sin(TT * 2 * np.pi * 3.2)); body_t += lau * 2.5 * np.sin(TT * 2 * np.pi * 1.6); rot_t += lau * 6
    head_rot = spring(rot_t, imp_r, 1.8, 0.38); head_dy = spring(dy_t, imp_y, 2.4, 0.4)
    body_rot = spring(body_t, imp_b, 1.1, 0.5); body_dy = spring(bdy_t, np.zeros(NF), 1.5, 0.55)
    hv = np.gradient(head_rot) * FPS; tip = spring(-0.22 * hv, np.zeros(NF), 1.5, 0.28)             # secondary: hat tip lags behind
    squash = 1 - lau * 0.035 * np.abs(np.sin(TT * 2 * np.pi * 3.2))
    POSE[w] = dict(head_rot=head_rot, head_dy=head_dy, head_dx=0.4 * head_rot, body_rot=body_rot, body_dy=body_dy, tip_rot=np.clip(tip, -14, 14), squash=squash)
def state(w, t, f):
    f = min(f, NF - 1); cur = main_at(t); speaking = bool(cur and cur['who'] == w and cur['a'] <= t < cur['b'] + 0.1)
    ph = (t + BLINK_OFF[w]) % 3.9; blink = ph < 0.12 or (2.1 < ph < 2.2 and int(t / 3.9) % 3 == 0)
    p = {k: float(v[f]) for k, v in POSE[w].items()}
    p.update(talk=float(TALK[w][f]), blink=blink, light=1.0 if speaking else 0.9)
    return p

# ---------------------------------------------------------------- reaction stickers
STK = []
for e in main:
    if e['emo'] in ('wide', 'scared') and e['a'] > 0.5: STK.append((e['a'] + 0.1, e['who'], '?!' if e['txt'].rstrip().endswith('?') else '!', (255, 215, 30)))
    lg = e['fl'].get('laugh')
    if lg: STK.append((e['b'] + 0.1, 'M' if lg == 'M' else (G if lg != 'both' else 'two'), 'KKKK', (255, 255, 255)))
def stickers(img, t):
    d = ImageDraw.Draw(img, 'RGBA')
    for ts, who, txt, col in STK:
        u = t - ts
        if not (0 <= u < 1.1): continue
        s = back(u / 0.25) if u < 0.25 else 1.0; a = smooth((1.1 - u) / 0.25); f = F(BEBAS, max(10, int((150 if txt != 'KKKK' else 120) * s)))
        cx = {'M': W - 230, G: W - 230, 'two': W / 2}[who]; cy = CAM_Y + 170 - 20 * math.sin(u * 6) * (txt == 'KKKK')
        rot_txt = Image.new('RGBA', (int(f.getlength(txt)) + 40, f.size + 40), (0, 0, 0, 0)); rd = ImageDraw.Draw(rot_txt)
        rd.text((20, 10), txt, font=f, fill=col + (int(255 * a),), stroke_width=10, stroke_fill=(20, 6, 30, int(255 * a)))
        rot_txt = rot_txt.rotate(8 * math.sin(u * 9) if txt == 'KKKK' else -8, expand=True, resample=Image.BICUBIC)
        img.paste(rot_txt, (int(cx - rot_txt.width / 2), int(cy - rot_txt.height / 2)), rot_txt)

# ---------------------------------------------------------------- overlays
_bg = None
def base_bg():
    global _bg
    if _bg is None:
        b = ST.background().resize((W * 2 // 3, H * 2 // 3), Image.NEAREST).resize((W, H), Image.BILINEAR).filter(ImageFilter.GaussianBlur(22))
        _bg = Image.blend(b, Image.new('RGB', (W, H), (14, 6, 30)), 0.55)
    return _bg
def header(img, t):
    d = ImageDraw.Draw(img, 'RGBA'); f = F(BEBAS, 46); tx = f'PODCAST DO MAGO · ENTREVISTA IMPOSSÍVEL #{E.EP}'; w = f.getlength(tx)
    d.rounded_rectangle([W / 2 - w / 2 - 50, 40, W / 2 + w / 2 + 30, 104], radius=32, fill=(255, 70, 190))
    rec = (int(t * 2) % 2 == 0); d.ellipse([W / 2 - w / 2 - 32, 61, W / 2 - w / 2 - 10, 83], fill=(255, 255, 255) if rec else (255, 170, 220))
    d.text((W / 2 - w / 2, 45), tx, font=f, fill=(255, 255, 255))
    for k, (line, col) in enumerate(zip(E.HOOK, ((255, 255, 255), (255, 215, 30)))):
        u = t; s = 1.0 + 0.08 * (1 - smooth(u / 0.3)); fs = F(BEBAS, max(10, int(92 * s)))
        while fs.getlength(line) > W - 70: fs = F(BEBAS, fs.size - 4)
        lw = fs.getlength(line); y = 120 + k * 92 + (88 - fs.size) // 2
        d.text((W / 2 - lw / 2 + 6, y + 8), line, font=fs, fill=(0, 0, 0, 160), stroke_width=10, stroke_fill=(0, 0, 0, 160))
        d.text((W / 2 - lw / 2, y), line, font=fs, fill=col, stroke_width=10, stroke_fill=(20, 6, 30))
def name_chip(img, t, who=None):
    if who is None: return
    nm = BB.CAST[who]['name']; col = BB.CAST[who]['color']; d = ImageDraw.Draw(img, 'RGBA'); f = F(BEBAS, 48); w = f.getlength(nm)
    x = W - 34 - w - 40
    d.rounded_rectangle([x, CAM_Y + 24, x + w + 40, CAM_Y + 86], radius=14, fill=col + (240,)); d.text((x + 20, CAM_Y + 30), nm, font=f, fill=(20, 10, 20))
def words_timed(e):
    ws = e['txt'].split(); ln = [len(w) + 2 for w in ws]; tot = sum(ln); dur = e['b'] - e['a'] - 0.15; acc = 0; out = []
    for w, l in zip(ws, ln): out.append((w, e['a'] + dur * acc / tot)); acc += l
    return out
CH = {}
for e in main:
    wt = words_timed(e); chunks = []; cur = []
    for w, ta in wt:
        cur.append((w, ta))
        if len(cur) == 3 or w[-1] in '.?!,' and len(cur) >= 2: chunks.append(cur); cur = []
    if cur: chunks.append(cur)
    CH[e['i']] = chunks
def caption(img, t):
    cur = main_at(t)
    if cur is None and main: cur = main[0]
    if not cur or not (cur['a'] - 0.1 <= t < cur['b'] + 0.3): return
    chunks = CH[cur['i']]; ch = chunks[0]
    t = max(t, cur['a'])
    for c in chunks:
        if c[0][1] <= t: ch = c
    act = max(k for k, (w, ta) in enumerate(ch) if ta <= t or k == 0); u = t - ch[0][1]
    s = 0.85 + 0.15 * back(u / 0.18) if u < 0.18 else 1.0; f = F(BEBAS, int(112 * s)); d = ImageDraw.Draw(img, 'RGBA')
    txt = [w.upper() for w, _ in ch]; sp = f.getlength(' ')
    while sum(f.getlength(w) for w in txt) + sp * (len(txt) - 1) > W - 80: f = F(BEBAS, f.size - 4)
    tw = sum(f.getlength(w) for w in txt) + sp * (len(txt) - 1); x = W / 2 - tw / 2; y = CAP_Y - (f.size - 112) // 2
    col_act = (255, 215, 30) if cur['who'] == 'M' else tuple(BB.CAST[cur['who']]['color'])
    NUMW = ('MIL', 'MILHÕES', 'MILHÃO', 'TONELADAS', 'QUILOS', 'METROS', 'ANOS', 'DOIS', 'TRÊS', 'TRINTA', 'SETENTA', 'CENTENAS', 'MEIO', 'MILÍMETRO', 'VINTE', 'SESSENTA', 'QUATROCENTOS', 'OITENTA')
    for k, w in enumerate(txt):
        c = col_act if k == act else (255, 255, 255)
        if any(ch.isdigit() for ch in w) or w.strip('.,!?') in NUMW: c = (255, 90, 90) if k != act else (255, 140, 140)
        d.text((x + 5, y + 7), w, font=f, fill=(0, 0, 0, 170), stroke_width=11, stroke_fill=(0, 0, 0, 170))
        d.text((x, y), w, font=f, fill=c, stroke_width=11, stroke_fill=(15, 5, 25)); x += f.getlength(w) + sp
_ph = {}
def photo(img, t):
    cur = main_at(t)
    if not cur or not cur['fl'].get('img'): return
    key, note = E.IMG[cur['fl']['img']]; u = t - cur['a']; dur = cur['b'] - cur['a'] + 0.3
    if u > dur or u < 0: return
    if key not in _ph:
        im = Image.open(MD.fetch(key)).convert('RGB'); s = min(940 / im.width, 700 / im.height); _ph[key] = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
    p = _ph[key]; a = smooth(u / 0.2) * smooth((dur - u) / 0.25); sc = 0.7 + 0.3 * back(u / 0.35) if u < 0.35 else 1.0 + 0.04 * (u - 0.35) / dur
    q = p.resize((max(1, int(p.width * sc)), max(1, int(p.height * sc))), Image.BILINEAR)
    lay = Image.new('RGBA', (q.width + 24, q.height + 64), (0, 0, 0, 0)); ld = ImageDraw.Draw(lay)
    ld.rounded_rectangle([0, 0, q.width + 23, q.height + 63], radius=22, fill=(255, 255, 255, 255)); lay.paste(q, (12, 12))
    cr = f"{note} · {MD.credit(key)}"; fc = F(SANS, 20)
    while fc.getlength(cr) > q.width and fc.size > 11: fc = F(SANS, fc.size - 1)
    ld.text((14, q.height + 22), cr, font=fc, fill=(40, 40, 50))
    if u < 0.9:                                                                                            # light sweep across the card
        sx = int((u / 0.9) * (lay.width + 300)) - 150; sh = Image.new('L', lay.size, 0); sd = ImageDraw.Draw(sh)
        sd.polygon([(sx, 0), (sx + 70, 0), (sx - 80, lay.height), (sx - 150, lay.height)], fill=90); sh = sh.filter(ImageFilter.GaussianBlur(12))
        white = Image.new('RGBA', lay.size, (255, 255, 255, 0)); white.putalpha(Image.fromarray(np.minimum(np.asarray(sh), np.asarray(lay.getchannel('A')))))
        lay.alpha_composite(white)
    lay = lay.rotate(-2.5 if cur['who'] == G else 2.5, expand=True, resample=Image.BICUBIC)
    lay.putalpha(Image.fromarray((np.asarray(lay.getchannel('A')) * a).astype('uint8')))
    img.paste(lay, (W // 2 - lay.width // 2, CAM_Y + 520 - lay.height // 2), lay)
CTA_T = DUR * 0.55
def footer(img, t):
    d = ImageDraw.Draw(img, 'RGBA')
    u = t - CTA_T
    if 0 <= u < 3.2:                                                                                # specific follow CTA, pops in mid-video
        s = back(u / 0.3) if u < 0.3 else 1.0; a = smooth((3.2 - u) / 0.3); f = F(BEBAS, int(64 * s)); tx = 'SIGA: TODO DIA UM CONVIDADO IMPOSSÍVEL'
        while f.getlength(tx) > W - 140: f = F(BEBAS, f.size - 2)
        w = f.getlength(tx); y = 1710; wob = 6 * math.sin(u * 8) * (u < 1.2)
        d.rounded_rectangle([W / 2 - w / 2 - 40, y + wob, W / 2 + w / 2 + 40, y + f.size + 30 + wob], radius=26, fill=(255, 40, 80, int(240 * a)))
        d.text((W / 2 - w / 2, y + 12 + wob), tx, font=f, fill=(255, 255, 255, int(255 * a)))
    elif t > DUR - 3.0:                                                                            # open loop to the next video in the series
        a = smooth((t - DUR + 3.0) / 0.3); f = F(BEBAS, 54); tx = f'PRÓXIMO CONVIDADO: {E.NEXT}'
        while f.getlength(tx) > W - 120: f = F(BEBAS, f.size - 2)
        w = f.getlength(tx); d.rounded_rectangle([W / 2 - w / 2 - 34, 1720, W / 2 + w / 2 + 34, 1720 + f.size + 26], radius=22, fill=(20, 10, 40, int(230 * a)), outline=(255, 215, 30, int(255 * a)), width=4)
        d.text((W / 2 - w / 2, 1732), tx, font=f, fill=(255, 215, 30, int(255 * a)))
    else:
        f = F(BEBAS, 44); tx = 'MAGO PIXEL'; w = f.getlength(tx); d.text((W / 2 - w / 2, 1770), tx, font=f, fill=(220, 210, 255, 150))

def frame_kind(f):
    t = f / FPS; ts, kind, who = shot_at(t); return who, ('close' if kind == 'close' else 'medium')
_cache = {}
def panel(w, t, f, kind, t0=0.0):
    p = os.path.join(FR[w], f'f_{f:04d}.png')
    if not os.path.exists(p):                                                    # missing frame (should not happen): nearest rendered
        for df in range(1, 30):
            for q in (f - df, f + df):
                pp = os.path.join(FR[w], f'f_{q:04d}.png')
                if os.path.exists(pp): p = pp; break
            else: continue
            break
    return Image.open(p).convert('RGB').resize((1080, 1352), Image.LANCZOS)
def render(t, f):
    img = base_bg().copy(); ts, kind, who = shot_at(t)
    if True:
        pn = panel(who, t, f, kind, ts)
        if 0.05 < ts and t - ts < 0.1:                                                   # whip-pan into the new shot
            k = 1 - (t - ts) / 0.1; sh = int(160 * k); a_ = np.asarray(pn).astype(np.float32)
            acc = sum(np.roll(a_, -sh * j // 4, axis=1) for j in range(4)) / 4; pn = Image.fromarray(acc.astype('uint8'))
        img.paste(pn, (0, CAM_Y))
    d = ImageDraw.Draw(img); d.rectangle([0, CAM_Y - 6, W, CAM_Y - 1], fill=(255, 70, 190))
    sh = [x for x in SHAKES if 0 <= t - x[0] < 0.3]
    if sh:                                                                         # impact shake of the whole frame
        u = t - sh[0][0]; dx = int(10 * (1 - u / 0.3) * math.sin(u * 90)); img = img.transform(img.size, Image.AFFINE, (1, 0, -dx, 0, 1, 0))
    header(img, t); name_chip(img, t, who); stickers(img, t); photo(img, t); caption(img, t); footer(img, t)
    return img

def build_audio(path):
    conv, _ = sf.read(os.path.join(VOZ, 'conversa.wav'), dtype='float32'); N = int(DUR * SR); voice = np.zeros(N, np.float32); voice[:min(N, len(conv))] = conv[:N]
    mus = MU.render(E.MUSIC, DUR + 0.5, 'x')[:N]; mus = np.pad(mus, ((0, N - len(mus)), (0, 0)))
    fx = np.zeros(N, np.float32); X.place(fx, 0.0, 'transition-whoosh-39', 0.3, 1.0); X.place(fx, 0.02, 'bass-drop-01', 0.22, 1.2)
    for ts, who, txt, col in STK: X.place(fx, ts, 'cartoon-pop-14' if txt != 'KKKK' else 'cartoon-pop-10', 0.12, 0.5)
    for e in main:
        if e['fl'].get('img'): X.place(fx, e['a'] - 0.05, 'short-video-whoosh-01', 0.18, 0.7)
    env = np.convolve(np.abs(voice), np.ones(4410) / 4410, 'same'); duck = 1 - 0.65 * np.clip(env / 0.05, 0, 1)
    fade = 1.0
    out = voice[:, None] + mus * 0.16 * duck[:, None] * fade + fx[:, None]
    out /= max(1e-6, np.abs(out).max()) / 0.95; sf.write(path, out, SR, subtype='PCM_16')

if __name__ == '__main__' and ARGS and ARGS[0] == 'plan':
    lists = {w: [] for w in WHO}
    for f in range(int(DUR * FPS)):
        who, k = frame_kind(f); lists[who].append([f, k])
    for w in WHO:
        json.dump(lists[w], open(os.path.join(BL, f'plano_{E.OUT}_{E.CAST4[w]}.json'), 'w')); print(w, len(lists[w]), 'quadros')
    sys.exit()
if __name__ == '__main__':
    print('DUR', round(DUR, 1), 'planos', len(SHOTS))
    if ARGS and ARGS[0] == 'test':
        ts = [float(v) for v in ARGS[1:]]; ims = [render(tt, int(tt * FPS)).resize((360, 640)) for tt in ts]
        Sh = Image.new('RGB', (len(ims) * 364, 640), 'white')
        for k, im in enumerate(ims): Sh.paste(im, (k * 364, 0))
        Sh.save(os.path.join(ROOT, 'sheet_corte.png')); sys.exit()
    OUT = os.path.join(ROOT, E.OUT); build_audio(OUT + '.wav')
    p = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-i', OUT + '.wav',
                          '-c:v', 'libx264', '-preset', 'medium', '-tune', 'animation', '-crf', '20', '-pix_fmt', 'yuv420p', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11',
                          '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-shortest', OUT + '.mp4'], stdin=subprocess.PIPE)
    for fr in range(int(DUR * FPS)): p.stdin.write(render(fr / FPS, fr).tobytes())
    p.stdin.close(); p.wait(); os.remove(OUT + '.wav'); print('done', OUT)
