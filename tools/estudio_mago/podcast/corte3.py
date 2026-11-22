"""Cortes verticais do Podcast do Mago — MOTOR 3.0 (1080x1920), feito para viralizar e converter em inscritos.
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
import os as _o, sys as _s; _s.path.insert(0, _o.path.join(_o.path.dirname(_o.path.abspath(__file__)), '..', 'lib'))  # libs do repositório
import json, os, sys, math, random, subprocess, importlib
import numpy as np, soundfile as sf
from PIL import Image, ImageDraw, ImageFont, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..'); sys.path[:0] = [HERE, ROOT, os.path.join(ROOT, '..')]
import estudio as ST, biblia as BB, convidados as CV, convidados2 as CV2, convidados3 as CV3, voz as VZ
import media as MD, musicas2 as MU, sfxlib as X
E = importlib.import_module(sys.argv[1]); ARGS = sys.argv[2:]; G = E.GUEST; GFN = {**CV.GUESTS, **CV2.GUESTS, **CV3.GUESTS}[E.GUEST_FN]
VOZ = os.path.join(ROOT, E.VOZ); TL = json.load(open(os.path.join(VOZ, 'timeline.json')))
SR = 44100; FPS = 30; W, H = 1080, 1920; CAM_Y = 430; CAM = 1080; CAMH = 900; AR = CAM / CAMH
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

# ---------------------------------------------------------------- camera director (square window)
CX = {'M': (ST.MX + 4, 54), G: (ST.JX - 4 + getattr(E, 'CAM_DX', 0), 58 + getattr(E, 'CAM_DY', 0))}
def view(name):
    if name == 'two': return (124, 67.5, 135 * AR)
    who, kind = name.split('_'); x, y = CX[who]
    return (x, y + 2, 80) if kind == 'close' else (x + (12 if who == 'M' else -12), y + 6, 108)
CUTS = []; last = None; rng = random.Random(7)
for e in main:
    who = e['who']; d = e['b'] - e['a']
    s = 'two' if e['fl'].get('laugh') == 'both' and d < 2.5 else (f'{who}_close' if (last != f'{who}_close' or rng.random() < 0.5) else f'{who}_med')
    if e['fl'].get('img'): s = f'{who}_med'
    if s != last: CUTS.append((e['a'] - 0.12, s)); last = s
    if d > 6.5 and not e['fl'].get('img'):
        o = 'M' if who == G else G; CUTS.append((e['a'] + d * 0.55, f'{o}_close')); CUTS.append((e['a'] + d * 0.55 + 1.3, s))
    if e['fl'].get('laugh') == 'both': CUTS.append((e['b'] + 0.05, 'two')); last = 'two'
CUTS.sort()
if main: CUTS.append((main[-1]['b'] + 0.02, CUTS[0][1] if CUTS else 'two'))   # loop: end on the opening shot
SHAKES = [] + [(e['a'], 0.8) for e in main if e['emo'] in ('wide', 'angry', 'scared') and e['a'] > 0.5]
def _cam_raw(t):
    s, t0, prev = 'two', -1.0, 'two'
    for tc, sc in CUTS:
        if tc <= t: prev, s, t0 = s, sc, tc
        else: break
    x, y, side = view(s)
    same_who = prev.split('_')[0] == s.split('_')[0] or 'two' in (prev, s)
    if same_who and t - t0 < 0.45 and t0 > 0.05:                                                  # smooth dolly instead of a hard cut
        px_, py_, ps = view(prev); k = smooth((t - t0) / 0.45); x, y, side = px_ + (x - px_) * k, py_ + (y - py_) * k, ps + (side - ps) * k; punch = 0
    else: punch = 0.05 * (1 - smooth((t - t0) / 0.25)) if t0 > 0.05 else 0.0
    side /= 1 + 0.03 * smooth((t - t0) / 4) + punch
    return x, y, side
def camera(t):
    x, y, side = _cam_raw(t)
    x += 0.35 * math.sin(t * 0.9) + 0.2 * math.sin(t * 2.3); y += 0.25 * math.sin(t * 1.3 + 1)          # handheld drift
    for ts, amp in SHAKES:                                                                                 # impact shake
        u = t - ts
        if 0 <= u < 0.35: d = amp * 2.2 * (1 - u / 0.35); x += d * math.sin(u * 90); y += d * 0.7 * math.cos(u * 77)
    side = min(side, ST.WH * AR); hh = side / AR; x = clamp(x, side / 2, ST.WW - side / 2); y = clamp(y, hh / 2, ST.WH - hh / 2); return x, y, side

def perf(t, f):
    cur = main_at(t); sp = {}
    for who in WHO:
        lvl = ENV[who][min(f, NF - 1)]; talk = 0 if lvl < 0.12 else 1 if lvl < 0.4 else (3 if (f // 3) % 4 == 1 else 2)
        speaking = cur and cur['who'] == who and cur['a'] <= t < cur['b'] + 0.1
        gest = cur['gest'] if speaking else 'rest'; emo = cur['emo'] if cur else 'happy'
        if not speaking and cur and cur['emo'] in ('angry',): emo = 'wide'
        bc = [e for e in EV if e['bc'] and e['who'] == who and e['a'] <= t < e['b'] and not e.get('laugh_audio')]
        nod = ((t - bc[0]['a']) * 2) % 1 if bc else (((t * 0.7) % 1) if (not speaking and cur and (t - cur['a']) % 6 < 1.0) else 0.0)
        blink = ((t + (0 if who == 'M' else 1.7)) % 4.1) < 0.13
        sp[who] = dict(talk=talk, gest=gest, emo=emo, blink=blink, nod=nod, laugh=bool(LAUGH[who][min(f, NF - 1)]))
    sp[G]['look'] = -1
    return {'M': sp['M'], 'J': sp[G]}

# ---------------------------------------------------------------- living light (world resolution, keeps the pixel look)
_Yw, _Xw = np.mgrid[:ST.WH, :ST.WW].astype(np.float32)
NEON = np.exp(-np.hypot(_Xw - 120, (_Yw - 22) * 1.3) / 55.0)[..., None]
SPOT = {'M': np.exp(-(((_Xw - ST.MX) / 42) ** 2 + ((_Yw - 58) / 50) ** 2))[..., None], G: np.exp(-(((_Xw - ST.JX) / 42) ** 2 + ((_Yw - 58) / 50) ** 2))[..., None]}
VIG = (1 - 0.35 * np.clip((np.hypot((_Xw - 120) / 120, (_Yw - 67) / 67) - 0.55) / 0.6, 0, 1))[..., None]
SPK = np.zeros(NF); a_ = 0.5
for f_ in range(NF):                                                                                     # smoothed "who is speaking" (1 = Mago)
    cur_ = main_at(f_ / FPS); tgt = 0.5 if cur_ is None else (1.0 if cur_['who'] == 'M' else 0.0); a_ += (tgt - a_) * 0.12; SPK[f_] = a_
MOTES = [(random.Random(k).uniform(10, 230), random.Random(k + 99).uniform(5, 95), random.Random(k + 7).uniform(0.15, 0.5), random.Random(k + 3).uniform(0, 6.28)) for k in range(22)]
def light(world, t, f):
    a = np.asarray(world).astype(np.float32) / 255
    pulse = 0.85 + 0.1 * math.sin(t * 2.1) + 0.05 * math.sin(t * 13.7) * (math.sin(t * 0.37) > 0.6)       # neon breathing + rare flicker
    m = SPK[min(f, NF - 1)]; spot = SPOT['M'] * m + SPOT[G] * (1 - m)
    neon_col = np.array([1.0, 0.35, 0.8]) * 0.5 + np.array([0.35, 0.9, 1.0]) * 0.5
    a = a * (0.80 + 0.32 * spot) * np.array([1.04, 1.0, 0.94]) ** spot + NEON * neon_col * 0.10 * pulse
    a *= VIG
    for x0, y0, sp_, ph in MOTES:                                                                          # floating dust catching the light
        x = int((x0 + t * sp_ * 6 + 4 * math.sin(t * 0.5 + ph)) % ST.WW); y = int((y0 - t * sp_ * 3) % 98)
        tw = 0.25 + 0.25 * math.sin(t * 3 + ph)
        a[y, x] = a[y, x] * (1 - tw) + np.array([1.0, 0.92, 0.75]) * tw
    return Image.fromarray((np.clip(a, 0, 1) * 255).astype('uint8'))

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
        cx = {'M': 250, G: W - 250, 'two': W / 2}[who]; cy = CAM_Y + 150 - 20 * math.sin(u * 6) * (txt == 'KKKK')
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
    d.rounded_rectangle([W / 2 - w / 2 - 50, 52, W / 2 + w / 2 + 30, 118], radius=33, fill=(255, 70, 190))
    rec = (int(t * 2) % 2 == 0); d.ellipse([W / 2 - w / 2 - 32, 74, W / 2 - w / 2 - 10, 96], fill=(255, 255, 255) if rec else (255, 170, 220))
    d.text((W / 2 - w / 2, 58), tx, font=f, fill=(255, 255, 255))
    for k, (line, col) in enumerate(zip(E.HOOK, ((255, 255, 255), (255, 215, 30)))):
        u = t; s = 1.0 + 0.08 * (1 - smooth(u / 0.3)); fs = F(BEBAS, max(10, int(118 * s)))
        while fs.getlength(line) > W - 70: fs = F(BEBAS, fs.size - 4)
        lw = fs.getlength(line); y = 140 + k * 128 + (118 - fs.size) // 2
        d.text((W / 2 - lw / 2 + 6, y + 8), line, font=fs, fill=(0, 0, 0, 160), stroke_width=10, stroke_fill=(0, 0, 0, 160))
        d.text((W / 2 - lw / 2, y), line, font=fs, fill=col, stroke_width=10, stroke_fill=(20, 6, 30))
def name_chip(img, t):
    cur = main_at(t)
    if not cur: return
    nm = BB.CAST[cur['who']]['name']; col = BB.CAST[cur['who']]['color']; d = ImageDraw.Draw(img, 'RGBA'); f = F(BEBAS, 48); w = f.getlength(nm)
    x = 34 if cur['who'] == 'M' else W - 34 - w - 40
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
    tw = sum(f.getlength(w) for w in txt) + sp * (len(txt) - 1); x = W / 2 - tw / 2; y = CAM_Y + CAMH + 150 - (f.size - 112) // 2
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
    img.paste(lay, (W // 2 - lay.width // 2, CAM_Y + CAMH // 2 - lay.height // 2 - 10), lay)
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

def render(t, f):
    img = base_bg().copy()
    world = light(ST.scene(t, perf(t, f), GFN), t, f); x, y, s = camera(t)
    cam = world.resize((CAM, CAMH), Image.NEAREST, box=(x - s / 2, y - s / AR / 2, x + s / 2, y + s / AR / 2)); img.paste(cam, (0, CAM_Y))
    d = ImageDraw.Draw(img); d.rectangle([0, CAM_Y - 6, W, CAM_Y - 1], fill=(255, 70, 190)); d.rectangle([0, CAM_Y + CAMH, W, CAM_Y + CAMH + 5], fill=(255, 70, 190))
    header(img, t); name_chip(img, t); stickers(img, t); photo(img, t); caption(img, t); footer(img, t)
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

if __name__ == '__main__':
    print('DUR', round(DUR, 1), 'cortes', len(CUTS))
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
