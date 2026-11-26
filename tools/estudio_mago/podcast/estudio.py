"""Estúdio do Podcast do Mago (mundo 480x270, pixel art) + o convidado Juvenal (esqueleto grumete de 1500)."""
import os as _o, sys as _s; _s.path.insert(0, _o.path.join(_o.path.dirname(_o.path.abspath(__file__)), '..', 'lib'))  # libs do repositório
import math, random, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
from px import Canvas, hexc
from scene import Layer, composite, OUT
from engine import wizard_at
from font import draw_text, text_width
import anim as A
WW, WH = 240, 135; DESK = 100
MX, JX, FEET = 74, 166, 132                    # Mago x, Juvenal x, feet y (hidden behind the desk)
BONE = ['#6a6250', '#a89c80', '#d8ccb0', '#f0e8d4', '#fffaf0']
_bg = None; _desk = None

# ------------------------------------------------------------------ headphones (shared by the whole cast)
def _hf(L, c): rgb = hexc(c); return rgb + (255,) if L.im.mode == 'RGBA' else rgb
HEADPHONES = False                                                   # pedido: personagens sem fones
def hp_band(L, x0, x1, ybase, top, w=3):
    if not HEADPHONES: return
    """thick padded headband: arc over the head from x0 to x1, resting at ybase, peaking at top"""
    h = max(2, ybase - top); L.d.arc([x0, top, x1, ybase + h], 180, 360, fill=_hf(L, '#202028'), width=w)
    L.d.arc([x0 + 1, top + 1, x1 - 1, ybase + h - 1], 205, 335, fill=_hf(L, '#70707e'), width=1)
def hp_cup(L, cx, cy, col, w=6, h=10):
    if not HEADPHONES: return
    """padded ear cup sitting ON the side of the head, with a colored plate and a shine pixel"""
    L.d.rounded_rectangle([cx - w // 2 - 1, cy - h // 2 - 1, cx + w // 2 + 1, cy + h // 2 + 1], radius=2, fill=_hf(L, '#141418'))
    L.d.rounded_rectangle([cx - w // 2, cy - h // 2, cx + w // 2, cy + h // 2], radius=2, fill=_hf(L, '#3a3a46'))
    L.d.rectangle([cx - w // 2 + 1, cy - h // 2 + 2, cx + w // 2 - 1, cy + h // 2 - 2], fill=_hf(L, col))
    L.d.point((cx - w // 2 + 1, cy - h // 2 + 2), fill=_hf(L, '#ffffff'))
def headphones(L, hx, hy, rx, top, col='#40c0ff'):
    """front view: band over the head + one cup on each side, centered on the head's edge"""
    hp_band(L, hx - rx, hx + rx, hy - 3, top); hp_cup(L, hx - rx, hy, col); hp_cup(L, hx + rx, hy, col)
def headphones_side(L, x0, x1, top, cx, cy, col='#40c0ff'):
    """side view (character in profile): band over the head, a single bigger cup on the visible ear"""
    hp_band(L, x0, x1, cy - 4, top); hp_cup(L, cx, cy, col, 8, 12)



def _grad(d, c0, c1, y0, y1, x0=0, x1=WW):
    a, b = hexc(c0), hexc(c1)
    for y in range(y0, y1):
        p = (y - y0) / max(1, y1 - y0); d.line([(x0, y), (x1, y)], fill=tuple(round(a[i] + (b[i] - a[i]) * p) for i in range(3)))


def background():
    global _bg
    if _bg is not None: return _bg
    C = Canvas(WW, WH); d = C.d
    _grad(d, '#1a1030', '#2e1c4c', 0, WH)
    for (x0, x1) in ((4, 46), (194, 236)):                                          # acoustic foam panels
        d.rectangle([x0 - 2, 12, x1 + 2, 92], fill=hexc('#120a22'))
        for gy in range(14, 90, 8):
            for gx in range(x0, x1 - 6, 8):
                k = ((gx // 8) + (gy // 8)) % 2
                d.polygon([(gx, gy + 7), (gx + 4, gy), (gx + 7, gy + 7)], fill=hexc('#3a2458' if k else '#30204c'))
    d.rectangle([84, 6, 156, 38], fill=hexc('#100820'))                             # neon sign
    sign = Image.new('RGBA', (WW, WH), (0, 0, 0, 0))
    w = text_width('PODCAST', 1); draw_text(sign, 'PODCAST', 120 - w // 2, 11, (255, 90, 200), 1, outline=None)
    w = text_width('DO MAGO', 1); draw_text(sign, 'DO MAGO', 120 - w // 2, 24, (90, 230, 255), 1, outline=None)
    glow = sign.filter(ImageFilter.GaussianBlur(2)); base = C.im.convert('RGBA'); base.alpha_composite(glow); base.alpha_composite(glow); base.alpha_composite(sign)
    C.im = base.convert('RGB'); d = C.d = ImageDraw.Draw(C.im)
    sx, sy, ex = 100, 54, 140                                                      # small shelf between the two hosts
    d.rectangle([sx, sy, ex, sy + 2], fill=hexc('#7a5634'))
    r = random.Random(4); x = sx + 2
    while x < ex - 4:
        c = r.choice(['#e04060', '#40c0a0', '#e0c040', '#6080f0', '#c060e0'])
        if r.random() < 0.5: C.rect(x, sy - 6, 3, 6, c); C.px(x + 1, sy - 7, '#d0d8e0'); x += 5
        else: C.ell(x + 2, sy - 2, 2, 2, c); C.px(x + 2, sy - 5, '#d0d8e0'); x += 6
    C.ell(120, 50, 3, 3, '#f0e8d4'); C.px(119, 50, '#100820'); C.px(121, 50, '#100820')
    for x, h in ((10, 30), (230, 34)):                                              # plants at the edges
        C.rect(x - 4, 90, 8, 8, '#7a4a2a')
        for k in range(6): a = -1.1 + k * 0.45; C.line([(x, 90), (x + round(math.sin(a) * h * 0.35), 90 - round(math.cos(a) * h * 0.6))], '#2e8a50', 2)
    d.rectangle([0, 92, WW, DESK], fill=hexc('#1a1028'))
    _bg = C.im; return _bg


def desk_layer():
    global _desk
    if _desk is not None: return _desk
    L = Image.new('RGBA', (WW, WH), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    d.rectangle([0, DESK, WW, WH], fill=hexc('#3a2418') + (255,)); d.rectangle([0, DESK, WW, DESK + 4], fill=hexc('#8a5a34') + (255,))
    d.line([(0, DESK), (WW, DESK)], fill=hexc('#c08a50') + (255,)); d.rectangle([0, DESK + 4, WW, DESK + 5], fill=hexc('#24160e') + (255,))
    d.ellipse([108, DESK + 10, 132, DESK + 30], fill=hexc('#5a2a8a') + (255,)); d.ellipse([111, DESK + 13, 129, DESK + 27], fill=hexc('#2a1a48') + (255,))
    w = text_width('PM', 1); draw_text(L, 'PM', 120 - w // 2, DESK + 17, (255, 210, 60), 1, outline=None)
    for mx in (MX + 20, JX - 20):                                                   # microphones on desk stands
        d.line([(mx, 84), (mx, DESK)], fill=hexc('#202024') + (255,)); d.ellipse([mx - 5, DESK - 2, mx + 5, DESK + 1], fill=hexc('#18181c') + (255,))
        d.rounded_rectangle([mx - 3, 70, mx + 3, 86], radius=3, fill=hexc('#2a2a30') + (255,)); d.rounded_rectangle([mx - 2, 71, mx + 2, 78], radius=2, fill=hexc('#5a5a66') + (255,))
        d.line([(mx - 3, 82), (mx + 3, 82)], fill=hexc('#ffd040') + (255,))
    _desk = L; return _desk


def mug(C, t, x, steam=True, col='#e04060'):
    C.rect(x - 3, DESK - 7, 6, 7, col); C.rect(x - 3, DESK - 7, 6, 1, '#ffffff'); C.d.arc([x + 2, DESK - 6, x + 6, DESK - 2], -90, 90, fill=hexc(col), width=1)
    if steam:
        for k in range(3):
            ph = (t * 0.6 + k / 3) % 1; C.px(x - 2 + k * 2 + round(math.sin(t * 3 + k) * 1.5), DESK - 9 - round(ph * 12), '#b0a8c0')


# ------------------------------------------------------------------ Mago with headphones
def mago(C, t, talk, gest, emo, blink, nod=0.0, laugh=False):
    kw = dict(mouth=talk, eyes='closed' if blink else {'wide': 'wide', 'scared': 'wide'}.get(emo, 'open'),
              brow={'sad': 'sad', 'scared': 'sad', 'wide': 'up', 'curious': 'up', 'angry': 'angry'}.get(emo, 'neutral'), right='rest', left='rest')
    if laugh: kw.update(mouth=4 if int(t * 10) % 2 else 3, eyes='closed', brow='up')
    g = {'point': dict(right='point'), 'cast': dict(left='cast', right='cast'), 'shrug': dict(left='shrug', right='shrug'), 'think': dict(left='think'),
         'thumb': dict(right='thumb'), 'facepalm': dict(right='facepalm'), 'clap': dict(left='clap', right='clap'), 'chest': dict(left='hold'), 'drink': dict(left='drink'),
         'slap': dict(right='bang'), 'count': dict(right='point'), 'hand': dict(right='point')}.get(gest, {})
    kw.update(g)
    dy = round(math.sin(nod * math.pi * 2) * 1.5) + (round(abs(math.sin(t * 18)) * 1.5) if laugh else 0)

    def dr(c, ax, ay):
        wizard_at(c, t, ax, ay + dy, face=1, **kw)
        hx, hy = ax, ay + dy                                                         # headphones
        if HEADPHONES: c.line([(hx - 3, hy - 68), (hx - 2, hy - 72), (hx + 1, hy - 74)], '#202028', 3); c.px(hx - 2, hy - 71, '#70707e')
        hp_cup(c, hx - 3, hy - 63, '#ffd040', 7, 11)
    A.stamp(C, dr, MX, FEET, ax=54, ay=170)


# ------------------------------------------------------------------ Juvenal (skeleton)
def juvenal(C, t, talk, gest, emo, blink, nod=0.0, laugh=False, look=-1):
    L = Layer(108, 192); x, y = 54, 170
    tilt = -2 if laugh else 0; jaw = (2 + (int(t * 12) % 2) * 2) if laugh else {0: 0, 1: 2, 2: 3, 3: 4, 4: 4}.get(talk, 0)
    dy = round(math.sin(nod * math.pi * 2) * 1.5) + (round(abs(math.sin(t * 16)) * 1.5) if laugh else 0) + round(math.sin(t * 1.7) * 0.6)
    y += dy; sh = '#e8e0c8'; sh2 = '#c8bea0'; sash = '#7a3020'
    # torso: linen shirt open over the ribcage
    L.poly([(x - 20, y - 24), (x - 17, y - 52), (x - 8, y - 58), (x + 8, y - 58), (x + 17, y - 52), (x + 20, y - 24)], sh)
    L.poly([(x - 6, y - 58), (x + 6, y - 58), (x + 3, y - 36), (x - 3, y - 36)], '#1a1424')
    for k in range(4): L.line([(x - 5 + k * 0, y - 54 + k * 5), (x + 5, y - 54 + k * 5)], BONE[2])
    L.line([(x, y - 58), (x, y - 36)], BONE[1])
    for k in range(5): L.px(x - 18 + k * 2, y - 26 - (k % 2), sh2); L.px(x + 10 + k * 2, y - 26 - (k % 2), sh2)
    L.rect(x - 20, y - 30, 40, 5, sash); L.rect(x - 20, y - 30, 40, 1, '#a04a30')
    L.rect(x - 2, y - 64, 4, 7, BONE[2]); L.line([(x - 2, y - 61), (x + 1, y - 61)], BONE[0])            # neck
    # arms (bone) by gesture
    def arm(sx, sy, ex, ey, hx, hy, side):
        L.line([(sx, sy), (ex, ey)], sh, 5); L.line([(ex, ey), (hx, hy)], BONE[2], 2); L.line([(ex + side, ey), (hx + side, hy)], BONE[1], 1)
        L.ell(hx, hy, 2, 2, BONE[3])
        for k in (-1, 0, 1): L.line([(hx, hy), (hx + side * 2 + k, hy - 3)], BONE[3])
    rest_l = ((x - 18, y - 50, x - 22, y - 34, x - 26, y - 24, -1)); rest_r = ((x + 18, y - 50, x + 22, y - 34, x + 26, y - 24, 1))
    l, r = rest_l, rest_r
    wob = round(math.sin(t * 6) * 1)
    if gest == 'point': l = (x - 18, y - 50, x - 28, y - 46, x - 40, y - 56 + wob, -1)
    elif gest == 'shrug': l = (x - 18, y - 50, x - 30, y - 42, x - 32, y - 56, -1); r = (x + 18, y - 50, x + 30, y - 42, x + 32, y - 56, 1)
    elif gest == 'hand': l = (x - 18, y - 50, x - 24, y - 38, x - 30, y - 50 + wob, -1)
    elif gest == 'chest': r = (x + 18, y - 50, x + 16, y - 36, x + 4, y - 48, -1)
    elif gest == 'count': l = (x - 18, y - 50, x - 24, y - 38, x - 26, y - 54, -1)
    elif gest == 'slap': hit = abs(math.sin(t * 7)); l = (x - 18, y - 50, x - 26, y - 38, x - 32, y - 26 - round(hit * 8), -1)
    elif gest in ('drink',): r = (x + 18, y - 50, x + 18, y - 40, x + 8, y - 66, -1)
    elif gest == 'facepalm': l = (x - 18, y - 50, x - 16, y - 40, x - 4, y - 74, 1)
    elif gest == 'thumb': l = (x - 18, y - 50, x - 26, y - 40, x - 30, y - 52, -1)
    arm(*l); arm(*r)
    if gest == 'drink': L.rect(x + 2, y - 72, 9, 9, '#3a8ad0'); L.rect(x + 2, y - 72, 9, 2, '#ffffff')
    # skull
    hx, hy = x, y - 80 + tilt
    L.ell(hx, hy, 13, 12, BONE[2]); L.ell(hx - 3, hy - 4, 8, 6, BONE[3]); L.px(hx - 6, hy - 8, BONE[4])
    L.rect(hx - 9, hy + 6, 18, 5, BONE[2])                                           # cheek/upper jaw
    for k in range(6): L.rect(hx - 7 + k * 3, hy + 8, 2, 3, BONE[4])                 # upper teeth
    jy = hy + 11 + jaw
    L.rect(hx - 8, jy, 16, 5, BONE[2]); L.rect(hx - 7, jy + 4, 14, 2, BONE[1])       # jaw
    for k in range(5): L.rect(hx - 6 + k * 3, jy - 1, 2, 2, BONE[4])
    if jaw: L.rect(hx - 6, hy + 11, 12, jaw, '#1a0c10')
    for ex in (-5, 5):                                                               # eye sockets + glowing pupils
        L.ell(hx + ex, hy, 4, 4, '#140c14')
        if not blink:
            px_ = hx + ex + look * (1 if emo != 'wide' else 0); py_ = hy + (0 if emo != 'sad' else 1)
            L.rect(px_ - 1, py_ - 1, 2, 2 if emo != 'wide' else 3, '#ffd23c'); L.px(px_, py_ - 1, '#fff6c0')
        else: L.line([(hx + ex - 2, hy + 1), (hx + ex + 2, hy + 1)], '#a07a20')
        if emo in ('sad', 'scared'): L.line([(hx + ex - 3, hy - 6 + (1 if ex < 0 else 0)), (hx + ex + 3, hy - 6 + (0 if ex < 0 else 1))], BONE[0])
    L.poly([(hx - 1, hy + 4), (hx + 1, hy + 4), (hx, hy + 1)], '#140c14')            # nose cavity
    L.line([(hx + 7, hy - 7), (hx + 10, hy - 3)], BONE[1])                          # little crack (character)
    # red barrete (Portuguese sailor cap), floppy top
    L.poly([(hx - 13, hy - 6), (hx - 11, hy - 13), (hx + 4, hy - 16), (hx + 12, hy - 11), (hx + 13, hy - 6)], '#b02a2a')
    L.poly([(hx + 4, hy - 16), (hx + 14, hy - 20 + round(math.sin(t * 2) * 1)), (hx + 16, hy - 12), (hx + 12, hy - 11)], '#901e1e')
    L.rect(hx - 13, hy - 7, 26, 2, '#7a1818')
    # headphones
    headphones(L, hx, hy, 14, hy - 21, '#40c0ff')
    def dr(c, ax, ay): composite(c, L, OUT)
    A.stamp(C, dr, JX, FEET - 4, ax=54, ay=170, sx=0.8, sy=0.8)


def scene(t, sp, guest=None):
    """sp: dict for M and J: talk, gest, emo, blink, nod, laugh"""
    C = Canvas(WW, WH); C.im = background().copy(); C.d = ImageDraw.Draw(C.im)
    if int(t * 7) % 97 == 0: C.im = Image.blend(C.im, Image.new('RGB', C.im.size, (40, 20, 60)), 0.25); C.d = ImageDraw.Draw(C.im)   # rare neon flicker
    mago(C, t, **{k: v for k, v in sp['M'].items() if k != 'drip'}); (guest or juvenal)(C, t, **{k: v for k, v in sp['J'].items() if k != 'drip'})
    base = C.im.convert('RGBA'); base.alpha_composite(desk_layer()); C.im = base.convert('RGB'); C.d = ImageDraw.Draw(C.im)
    mug(C, t, MX + 32, True, '#e04060'); mug(C, t, JX - 32, True, '#3a8ad0')
    if sp['J'].get('drip'):
        ph = (t * 1.3) % 1; C.px(JX + 2, DESK - 34 + round(ph * 32), '#6a3a1a')         # coffee leaking through the ribs
    return C.im
