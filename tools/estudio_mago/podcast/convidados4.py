"""Convidados do lote 4: KIKA (água-viva imortal), SERAFIM (bicho-preguiça), ZECA (tamarutaca)."""
import math
from scene import Layer
from convidados import _bob, _jaw
from convidados2 import _stamp, _limbs, _mouth


def _eyes(L, hx, hy, dx, blink, emo, look, iris='#140a18', lid='#000000', r=2):
    for ex in dx:
        if blink: L.line([(hx + ex - 2, hy), (hx + ex + 2, hy)], lid); continue
        L.ell(hx + ex, hy, r + 1, r + 1 + (emo == 'wide'), '#fbf6ff'); L.rect(hx + ex - 1 + (look if look in (-1, 0, 1) else 0), hy - 1, 2, 3, iris)
        L.px(hx + ex, hy - 1, '#ffffff')
        if emo in ('sad', 'scared'): L.line([(hx + ex - 3, hy - 5), (hx + ex + 3, hy - 4)], lid)
        elif emo in ('angry',): L.line([(hx + ex - 3, hy - 4), (hx + ex + 3, hy - 5 + (1 if ex > 0 else 0))], lid)


# ------------------------------------------------------------------ KIKA, a água-viva imortal (Turritopsis): sino translúcido, miolo vermelho
JV = ['#5a6cd0', '#8aa0f0', '#bcd0ff', '#e8f0ff']
def agua_viva(C, t, talk, gest, emo, blink, nod=0.0, laugh=False, look=-1):
    L = Layer(108, 192); x = 54; y = 128 + round(math.sin(t * 1.6) * 3) + _bob(t, nod, laugh, 14); jaw = _jaw(t, talk, laugh)
    pulse = math.sin(t * 3.2)                                                                                        # the bell breathes (pulsing swim)
    for k in range(9):                                                                                               # long thin tentacles drifting
        bx = x - 22 + k * 5.5; pts = []
        for s in range(8):
            yy = y - 8 + s * 4; xx = bx + math.sin(t * 2.2 + k * 0.9 + s * 0.6) * (1 + s * 0.7); pts.append((round(xx), yy))
        L.line(pts, JV[1] if k % 2 else JV[2])
    l, r = _limbs(gest, t, x, y + 4, 12, 24)                                                                         # frilly oral arms used as hands
    for a in (l, r):
        L.line([a[0:2], a[2:4], a[4:6]], '#ff8a9a', 4); L.line([a[0:2], a[2:4], a[4:6]], '#ffc0c8', 2)
        L.ell(a[4], a[5], 3, 3, '#ff8a9a')
    bw = 30 + round(pulse * 2); bh = 30 - round(pulse * 2); cy = y - 26
    L.ell(x, cy, bw, bh, JV[0]); L.ell(x, cy - 2, bw - 3, bh - 3, JV[1]); L.ell(x - 6, cy - 10, bw - 12, bh - 14, JV[2])
    for k in range(-3, 4): L.px(x + k * 8, cy + bh - 2, JV[3])                                                       # rim dots (little glowing bulbs)
    L.ell(x + 2, cy - 14, 10, 6, '#d02a3a'); L.ell(x, cy - 15, 6, 4, '#ff5a5a'); L.px(x - 3, cy - 17, '#ffb0a0')         # famous red core
    L.ell(x - 18, cy - 12, 4, 2, JV[3]); L.px(x - 21, cy - 9, '#ffffff')                                            # gloss
    hy = cy + 3; _eyes(L, x, hy, (-10, 10), blink, emo, look, lid='#2a3080')
    _mouth(L, x, hy + 9, jaw, col='#4a1030', line='#2a3080', w=5, sad=emo == 'sad')
    L.ell(x - 17, hy + 6, 3, 1, '#ff9ad0'); L.ell(x + 17, hy + 6, 3, 1, '#ff9ad0')
    halo = 0.5 + 0.5 * math.sin(t * 2)                                                                               # tiny "immortal" halo
    L.ell(x, cy - bh - 6, 12, 3, '#ffe070' if halo > 0.3 else '#ffd040'); L.ell(x, cy - bh - 6, 9, 1, JV[3])
    _stamp(C, L)


# ------------------------------------------------------------------ SERAFIM, o bicho-preguiça: pelo com alga verde, máscara escura, sorriso eterno
PG = ['#4a3a2a', '#7a6650', '#a08a6c', '#c8b494', '#e8dcc0']
def preguica(C, t, talk, gest, emo, blink, nod=0.0, laugh=False, look=-1):
    T = t * 0.6                                                                                                      # everything a bit slower
    L = Layer(108, 192); x, y = 54, 170; y += _bob(T, nod, laugh, 10); jaw = _jaw(t, talk, laugh)
    L.ell(x, y - 30, 24, 32, PG[1]); L.ell(x - 2, y - 28, 15, 22, PG[2])
    for k in range(14):                                                                                              # shaggy fur strokes + green algae patches
        fx = x - 20 + (k * 7) % 40; fy = y - 56 + (k * 11) % 46; L.line([(fx, fy), (fx - 1, fy + 4)], PG[0])
    for (ax_, ay_) in ((x + 14, y - 44), (x - 16, y - 20), (x + 8, y - 14)): L.ell(ax_, ay_, 4, 3, '#6a8a4a'); L.px(ax_ - 1, ay_ - 1, '#8ab060')
    l, r = _limbs(gest, round(T * 10) / 10, x, y, 18, 50)                                                          # long arms, three huge claws
    for a in (l, r):
        L.line([a[0:2], a[2:4], a[4:6]], PG[1], 6); L.line([a[0:2], a[2:4], a[4:6]], PG[2], 3)
        for k in (-1, 0, 1): L.line([(a[4] + k * 2, a[5]), (a[4] + k * 3 - 1, a[5] + 7)], '#efe6d0')
    hx, hy = x, y - 70 + (-2 if laugh else 0) + round(math.sin(T * 1.3) * 1)
    L.ell(hx, hy, 19, 16, PG[2]); L.ell(hx, hy + 2, 15, 12, PG[4])                                                  # round head, pale face
    for k in range(-16, 17, 4): L.line([(hx + k, hy - 15), (hx + k + 1, hy - 18)], PG[1])                           # messy hair
    for s in (-1, 1): L.poly([(hx + s * 3, hy - 3), (hx + s * 14, hy - 2), (hx + s * 15, hy + 3), (hx + s * 4, hy + 2)], PG[0])   # dark eye mask
    for ex in (-8, 8):
        if blink or emo == 'happy' and laugh: L.line([(hx + ex - 2, hy), (hx + ex + 2, hy)], '#1a1008'); continue
        L.ell(hx + ex, hy, 2, 2 + (emo == 'wide'), '#0a0604'); L.px(hx + ex - 1, hy - 1, '#ffffff')
        if emo in ('sad', 'scared'): L.line([(hx + ex - 3, hy - 5), (hx + ex + 3, hy - 4)], PG[0])
    L.ell(hx, hy + 5, 3, 2, '#2a1a10')                                                                               # nose
    my = hy + 10
    if jaw: L.ell(hx, my + jaw // 2, 5, max(1, jaw // 2 + 1), '#4a1a14')
    else: L.line([(hx - 7, my - 2), (hx - 3, my), (hx + 3, my), (hx + 7, my - 2)], '#3a2010')                      # eternal smile
    L.ell(hx - 12, hy + 7, 2, 1, '#e0a090'); L.ell(hx + 12, hy + 7, 2, 1, '#e0a090')
    L.ell(hx + 15, hy - 16, 7, 3, '#5a9a4a'); L.ell(hx + 19, hy - 18, 4, 3, '#7ac060'); L.line([(hx + 12, hy - 15), (hx + 22, hy - 21)], '#3a6a2a')   # leaf on head
    _stamp(C, L)


# ------------------------------------------------------------------ ZECA, a tamarutaca (camarão-louva-a-deus): cores neon, olhos em haste, clavas de soco
ZT = ['#1a7a5a', '#2ab07a', '#5ad8a0', '#a8f0c8']
def tamarutaca(C, t, talk, gest, emo, blink, nod=0.0, laugh=False, look=-1):
    L = Layer(108, 192); x, y = 54, 170; y += _bob(t, nod, laugh, 18); jaw = _jaw(t, talk, laugh)
    for k in range(5):                                                                                               # segmented armored body, upright
        L.ell(x + 1, y - 14 - k * 11, 20 - k, 8, ZT[0] if k % 2 else ZT[1]); L.ell(x - 4, y - 17 - k * 11, 8, 2, ZT[3])
        L.px(x - 12 + k * 4, y - 12 - k * 11, '#ff6a3a')
    L.poly([(x + 12, y - 6), (x + 30, y - 2), (x + 26, y + 4), (x + 10, y + 2)], '#3a7ad0')                          # blue tail fan
    for s in (-1, 1): L.line([(x + s * 6, y - 4), (x + s * 9, y + 2)], '#ff7a3a', 2)                                # little legs
    punch = gest in ('point', 'slap', 'count', 'hand')
    sw, sy = 14, 56
    for s in (-1, 1):                                                                                                # raptorial club arms, folded like a mantis
        left = s < 0
        if punch and left:
            ph = (t * 1.4) % 1.0; ext = 1.0 if ph < 0.12 else max(0.0, 1 - (ph - 0.12) * 3)                        # lightning-fast strike, slow reload
            sx0, sy0 = x - sw, y - sy; hx_, hy_ = round(sx0 - 6 - 22 * ext), round(sy0 + 6 - 4 * ext)
            L.line([(sx0, sy0), (round(sx0 - 6 - 10 * ext), sy0 + 8), (hx_, hy_)], '#ff7a3a', 4)
            L.ell(hx_, hy_, 5, 4, '#ff4a2a'); L.ell(hx_ - 1, hy_ - 1, 2, 2, '#ffb080')
            if ext > 0.9:
                L.ell(hx_ - 8, hy_, 5, 5, '#e8fbff'); L.ell(hx_ - 8, hy_, 3, 3, '#a0e8ff')                           # cavitation bubble flash
                for k in range(6): L.px(hx_ - 8 + round(math.cos(k) * 8), hy_ + round(math.sin(k) * 8), '#ffffff')
        else:
            sx0, sy0 = x + s * sw, y - sy; wob = round(math.sin(t * 5 + s) * 1)
            L.line([(sx0, sy0), (sx0 + s * 9, sy0 + 10), (sx0 + s * 4, sy0 - 2 + wob)], '#ff7a3a', 4)
            L.ell(sx0 + s * 4, sy0 - 3 + wob, 4, 3, '#ff4a2a')
    hx, hy = x, y - 72 + (-2 if laugh else 0)
    L.ell(hx, hy, 14, 9, ZT[1]); L.ell(hx - 3, hy - 3, 7, 3, ZT[3])
    for k, s in enumerate((-1, 1)):                                                                                 # antennae + orange antennal scales
        L.line([(hx + s * 4, hy - 6), (hx + s * 18, hy - 24 + round(math.sin(t * 4 + k) * 2)), (hx + s * 26, hy - 20)], '#ffd040')
        L.ell(hx + s * 10, hy - 10, 4, 2, '#ff9a3a')
    for k, s in enumerate((-1, 1)):                                                                                 # eyes on stalks, each moving on its own
        wx = round(math.sin(t * 1.9 + k * 2.3) * 3); wy = round(math.cos(t * 1.3 + k * 1.7) * 2)
        ex_, ey_ = hx + s * 7 + wx, hy - 16 + wy
        L.line([(hx + s * 4, hy - 7), (ex_, ey_)], ZT[0], 3)
        if blink: L.line([(ex_ - 3, ey_), (ex_ + 3, ey_)], '#0a2a1a'); continue
        L.ell(ex_, ey_, 4, 4 + (emo == 'wide'), '#3a50c0'); L.rect(ex_ - 3, ey_ - 1, 7, 1, '#ffe070')             # trinocular stripe across the eye
        L.ell(ex_ + (look if look in (-1, 0, 1) else 0), ey_, 1, 1, '#0a0a18'); L.px(ex_ - 2, ey_ - 2, '#ffffff')
    _mouth(L, hx, hy + 5, jaw, col='#3a0a10', line='#0a3a2a', w=5, sad=emo == 'sad')
    if emo in ('angry', 'wide'): L.line([(hx - 9, hy - 4), (hx - 3, hy - 2)], '#0a3a2a'); L.line([(hx + 9, hy - 4), (hx + 3, hy - 2)], '#0a3a2a')
    _stamp(C, L)


GUESTS = {'agua_viva': agua_viva, 'preguica': preguica, 'tamarutaca': tamarutaca}
