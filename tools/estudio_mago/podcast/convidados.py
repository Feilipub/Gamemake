"""Convidados extras do Podcast do Mago (pixel art, mesma cadeira do Juvenal): REX (tiranossauro), NEFERU (múmia), TONHA (barata).
Mesma assinatura do estudio.juvenal: (C, t, talk, gest, emo, blink, nod, laugh, look)."""
import math
import estudio as ST
from scene import Layer, composite, OUT
import anim as A


def _bob(t, nod, laugh, sp=16):
    return round(math.sin(nod * math.pi * 2) * 1.5) + (round(abs(math.sin(t * sp)) * 1.5) if laugh else 0) + round(math.sin(t * 1.7) * 0.6)


def _jaw(t, talk, laugh):
    return (2 + (int(t * 12) % 2) * 2) if laugh else {0: 0, 1: 2, 2: 3, 3: 4, 4: 4}.get(talk, 0)


def _headphones(L, hx, hy, rx, top, col='#40c0ff'):
    ST.headphones(L, hx, hy, rx, top - 2, col)


def _eye(L, x, y, blink, emo, look, iris='#20180c', r=3):
    if blink: L.line([(x - r, y), (x + r, y)], '#20180c'); return
    L.ell(x, y, r, r + (1 if emo == 'wide' else 0), '#ffffff')
    L.rect(x - 1 + look, y - 1, 2, 3, iris); L.px(x + look, y - 1, '#ffffff')
    if emo in ('sad', 'scared'): L.line([(x - r, y - r - 2), (x + r, y - r - 1 - (1 if x > 0 else 0))], '#20180c')
    if emo == 'angry': L.line([(x - r, y - r - 3), (x + r, y - r - 1)], '#20180c')


# ------------------------------------------------------------------ REX: tiranossauro de braço curtinho
GR = ['#1f4a2a', '#2f6e3a', '#47944c', '#6cb862', '#a8dc8c']
def rex(C, t, talk, gest, emo, blink, nod=0.0, laugh=False, look=-1):
    L = Layer(108, 192); x, y = 58, 170; y += _bob(t, nod, laugh); jaw = _jaw(t, talk, laugh) + (1 if talk >= 3 else 0)
    # body (big chest leaning on the desk)
    L.ell(x + 4, y - 34, 26, 32, GR[1]); L.ell(x - 2, y - 34, 16, 26, GR[3]); L.ell(x - 4, y - 32, 10, 20, GR[4])
    for k in range(5): L.line([(x - 12, y - 44 + k * 6), (x + 6, y - 44 + k * 6)], GR[3])
    L.poly([(x + 8, y - 54), (x + 22, y - 82), (x + 30, y - 52)], GR[1])                         # neck
    L.poly([(x + 4, y - 50), (x + 14, y - 80), (x + 24, y - 78), (x + 20, y - 50)], GR[2])
    for k in range(5): L.poly([(x + 22 + k, y - 84 + k * 7), (x + 29 + k, y - 82 + k * 7), (x + 24 + k, y - 78 + k * 7)], GR[0])   # back spikes
    # head (huge, deep skull), facing left toward the Mago
    hx, hy = x + 4, y - 94 + (-1 if laugh else 0)
    L.ell(hx + 10, hy + 2, 17, 17, GR[2]); L.rect(hx - 28, hy - 8, 38, 17, GR[2]); L.ell(hx - 27, hy, 5, 8, GR[2])      # skull + snout
    L.rect(hx - 28, hy - 8, 38, 3, GR[3]); L.ell(hx + 8, hy - 10, 13, 5, GR[3]); L.px(hx - 24, hy - 5, GR[4])
    L.rect(hx - 29, hy - 4, 2, 2, GR[0]); L.rect(hx - 24, hy - 5, 2, 1, GR[0])                                          # nostrils
    L.line([(hx - 6, hy - 9), (hx + 4, hy - 12)], GR[1], 3)                                                              # brow ridge
    for k in range(8): L.poly([(hx - 28 + k * 4, hy + 9), (hx - 26 + k * 4, hy + 13), (hx - 24 + k * 4, hy + 9)], '#fffaf0')   # upper teeth
    jy = hy + 9 + jaw * 2
    if jaw: L.rect(hx - 27, hy + 9, 36, jaw * 2 + 1, '#4a0c14'); L.rect(hx - 22, hy + 9 + jaw, 12, max(1, jaw), '#d04060')
    L.rect(hx - 27, jy, 36, 8, GR[2]); L.rect(hx - 27, jy + 6, 36, 2, GR[1]); L.ell(hx + 10, jy + 3, 10, 6, GR[2])
    for k in range(7): L.poly([(hx - 26 + k * 4, jy + 1), (hx - 24 + k * 4, jy - 3), (hx - 22 + k * 4, jy + 1)], '#fffaf0')
    ex_, ey_ = hx - 2, hy - 4                                                                                            # eye
    if blink: L.line([(ex_ - 3, ey_), (ex_ + 3, ey_)], GR[0])
    else:
        L.ell(ex_, ey_, 3, 3 + (1 if emo == 'wide' else 0), '#ffd23c'); L.rect(ex_ - 1 + min(0, look), ey_ - 2, 1, 4, '#140c08')
        if emo in ('sad', 'scared'): L.line([(ex_ - 4, ey_ - 4), (ex_ + 3, ey_ - 6)], GR[0])
        if emo == 'angry': L.line([(ex_ - 4, ey_ - 6), (ex_ + 3, ey_ - 4)], GR[0], 2)
    L.ell(hx + 14, hy - 14, 11, 5, '#e04040'); L.rect(hx + 20, hy - 13, 10, 3, '#b02a2a')                                # cap backwards
    ST.headphones_side(L, hx + 2, hx + 26, hy - 21, hx + 13, hy + 2, '#ffd040')                                        # headphones (side view)
    # tiny arms (the joke): gestures only move them a little
    wob = round(math.sin(t * 9) * 1)
    ay_ = {'point': -6, 'shrug': -8, 'hand': -4, 'count': -6, 'cast': -9, 'slap': -3 + wob * 2}.get(gest, 0)
    for s, dx in ((1, 4), (-1, -6)):
        ex, ey = x + dx, y - 58; hx2, hy2 = ex - 6, ey + 6 + ay_ + (wob if gest in ('point', 'hand') else 0)
        L.line([(ex, ey), (ex - 3, ey + 4), (hx2, hy2)], GR[0], 5); L.line([(ex, ey), (ex - 3, ey + 4), (hx2, hy2)], GR[3] if s > 0 else GR[2], 3)
        L.px(hx2 - 2, hy2, '#fffaf0'); L.px(hx2 - 2, hy2 + 2, '#fffaf0')
    def dr(c, ax, ay): composite(c, L, OUT)
    A.stamp(C, dr, ST.JX + 2, ST.FEET - 4, ax=54, ay=170, sx=0.8, sy=0.8)


# ------------------------------------------------------------------ NEFERU: múmia egípcia vaidosa
LN = ['#8a7a5a', '#b8a67e', '#dccaa0', '#f2e6c4']
def neferu(C, t, talk, gest, emo, blink, nod=0.0, laugh=False, look=-1):
    L = Layer(108, 192); x, y = 54, 170; y += _bob(t, nod, laugh); jaw = _jaw(t, talk, laugh)
    L.poly([(x - 19, y - 24), (x - 16, y - 54), (x - 6, y - 60), (x + 6, y - 60), (x + 16, y - 54), (x + 19, y - 24)], LN[2])   # wrapped torso
    for k in range(7): L.line([(x - 18, y - 28 - k * 4 - (k % 2)), (x + 18, y - 31 - k * 4 + (k % 2))], LN[1])
    L.poly([(x - 14, y - 58), (x + 14, y - 58), (x + 10, y - 50), (x - 10, y - 50)], '#2a6ad0')                      # broad collar (usekh)
    for k in range(7): L.px(x - 12 + k * 4, y - 55, '#ffd040'); L.px(x - 10 + k * 4, y - 52, '#e04040')
    L.rect(x - 2, y - 66, 4, 7, LN[2])
    def arm(sx, sy, ex, ey, hx, hy):
        L.line([(sx, sy), (ex, ey)], LN[2], 5); L.line([(ex, ey), (hx, hy)], LN[2], 4); L.line([(sx + 1, sy + 3), (ex + 1, ey + 3)], LN[1]); L.ell(hx, hy, 3, 3, LN[3])
        L.line([(hx, hy), (hx + 4, hy + 5 + round(math.sin(t * 5 + hx) * 2))], LN[3])                             # loose bandage end
    l = (x - 17, y - 52, x - 22, y - 36, x - 26, y - 26); r = (x + 17, y - 52, x + 22, y - 36, x + 26, y - 26); wob = round(math.sin(t * 6))
    if gest == 'point': l = (x - 17, y - 52, x - 28, y - 46, x - 40, y - 56 + wob)
    elif gest == 'shrug': l = (x - 17, y - 52, x - 30, y - 42, x - 32, y - 56); r = (x + 17, y - 52, x + 30, y - 42, x + 32, y - 56)
    elif gest in ('hand', 'count', 'thumb'): l = (x - 17, y - 52, x - 24, y - 38, x - 30, y - 50 + wob)
    elif gest == 'chest': r = (x + 17, y - 52, x + 16, y - 36, x + 4, y - 48)
    elif gest == 'facepalm': l = (x - 17, y - 52, x - 16, y - 40, x - 4, y - 74)
    elif gest == 'slap': hit = abs(math.sin(t * 7)); l = (x - 17, y - 52, x - 26, y - 38, x - 32, y - 26 - round(hit * 8))
    arm(*l); arm(*r)
    hx, hy = x, y - 80 + (-2 if laugh else 0)
    # nemes-style striped headdress behind the head
    L.poly([(hx - 17, hy - 8), (hx - 20, hy + 18), (hx - 12, hy + 20), (hx + 12, hy + 20), (hx + 20, hy + 18), (hx + 17, hy - 8)], '#2a6ad0')
    for k in range(5): L.line([(hx - 19, hy - 2 + k * 5), (hx - 13, hy - 2 + k * 5)], '#ffd040', 2); L.line([(hx + 13, hy - 2 + k * 5), (hx + 19, hy - 2 + k * 5)], '#ffd040', 2)
    L.ell(hx, hy, 13, 14, LN[2]); L.ell(hx - 3, hy - 5, 8, 6, LN[3])
    for k in range(6): L.line([(hx - 12, hy - 10 + k * 5), (hx + 12, hy - 12 + k * 5)], LN[1])                 # bandage wraps
    L.rect(hx - 10, hy - 4, 20, 8, '#3a2a1a')                                                                     # eye gap
    _eye(L, hx - 5, hy, blink, emo, look, '#3a7ad0', 2); _eye(L, hx + 5, hy, blink, emo, look, '#3a7ad0', 2)
    L.line([(hx - 8, hy - 3), (hx - 1, hy - 3)], '#101010'); L.line([(hx + 1, hy - 3), (hx + 8, hy - 3)], '#101010')   # eyeliner
    L.px(hx + 9, hy - 2, '#101010'); L.px(hx - 9, hy - 2, '#101010')
    my = hy + 8
    if jaw: L.ell(hx, my + jaw // 2, 4, max(1, jaw // 2 + 1), '#4a1018'); L.rect(hx - 3, my, 6, 1, '#fffaf0')
    else: L.line([(hx - 3, my), (hx + 3, my)], '#7a3a2a')
    if laugh or emo in ('happy', 'wide'): L.px(hx - 4, my - 1, '#7a3a2a'); L.px(hx + 4, my - 1, '#7a3a2a')
    L.poly([(hx - 3, hy - 16), (hx + 3, hy - 16), (hx + 2, hy - 12), (hx - 2, hy - 12)], '#ffd040')               # gold uraeus
    L.px(hx, hy - 18, '#40c0a0'); L.px(hx, hy - 17, '#ffd040')
    _headphones(L, hx, hy + 2, 16, hy - 20, '#ff60c0')
    def dr(c, ax, ay): composite(c, L, OUT)
    A.stamp(C, dr, ST.JX, ST.FEET - 4, ax=54, ay=170, sx=0.8, sy=0.8)


# ------------------------------------------------------------------ TONHA: barata falante, sentada de pé na cadeira
BR = ['#2a1408', '#4a2410', '#6e3a18', '#9a5a28', '#c88a4a']
def tonha(C, t, talk, gest, emo, blink, nod=0.0, laugh=False, look=-1):
    L = Layer(108, 192); x, y = 54, 172; y += _bob(t, nod, laugh, 22); jaw = _jaw(t, talk, laugh)
    flap = gest == 'cast' or (laugh and int(t * 14) % 2)
    # wings (shell) behind, standing upright body
    if flap: L.poly([(x + 4, y - 66), (x + 34, y - 92), (x + 30, y - 40)], '#b0703a'); L.poly([(x - 4, y - 66), (x - 32, y - 92), (x - 28, y - 40)], '#b0703a')
    L.ell(x, y - 34, 18, 34, BR[2]); L.ell(x - 4, y - 38, 10, 26, BR[3]); L.line([(x, y - 66), (x, y - 4)], BR[1])
    for k in range(5): L.line([(x - 15, y - 20 - k * 8), (x + 15, y - 20 - k * 8)], BR[1])
    L.ell(x, y - 66, 13, 7, BR[3]); L.ell(x - 3, y - 68, 6, 3, BR[4])                                           # pronotum
    # 4 thin legs/arms: 2 lower rest on the desk, upper pair gestures
    wob = round(math.sin(t * 10))
    for s in (-1, 1): L.line([(x + s * 14, y - 30), (x + s * 26, y - 22), (x + s * 30, y - 10)], BR[1], 2)
    l = (x - 14, y - 50, x - 24, y - 46, x - 28, y - 32); r = (x + 14, y - 50, x + 24, y - 46, x + 28, y - 32)
    if gest == 'point': l = (x - 14, y - 50, x - 28, y - 56, x - 40, y - 60 + wob)
    elif gest == 'shrug': l = (x - 14, y - 50, x - 26, y - 56, x - 28, y - 66); r = (x + 14, y - 50, x + 26, y - 56, x + 28, y - 66)
    elif gest in ('hand', 'count', 'thumb'): l = (x - 14, y - 50, x - 26, y - 48, x - 32, y - 60 + wob)
    elif gest == 'chest': r = (x + 14, y - 50, x + 18, y - 40, x + 4, y - 48)
    elif gest == 'facepalm': l = (x - 14, y - 50, x - 16, y - 66, x - 4, y - 84)
    elif gest == 'slap': hit = abs(math.sin(t * 7)); l = (x - 14, y - 50, x - 26, y - 40, x - 30, y - 28 - round(hit * 8))
    for a in (l, r): L.line([a[0:2], a[2:4], a[4:6]], BR[1], 2); L.ell(a[4], a[5], 2, 2, BR[0])
    hx, hy = x, y - 80 + (-2 if laugh else 0)
    L.ell(hx, hy, 11, 10, BR[2]); L.ell(hx - 3, hy - 4, 6, 4, BR[3])
    for s in (-1, 1):                                                                                             # long antennae, always moving
        a0 = math.sin(t * 3 + s) * 0.25
        L.line([(hx + s * 4, hy - 8), (hx + s * 10, hy - 22), (hx + s * (18 + round(math.sin(t * 4 + s) * 3)), hy - 34 + round(a0 * 8)), (hx + s * 30, hy - 30 + round(a0 * 10))], BR[1])
    _eye(L, hx - 5, hy - 1, blink, emo, look, '#140c08', 3); _eye(L, hx + 5, hy - 1, blink, emo, look, '#140c08', 3)
    my = hy + 6
    if jaw: L.ell(hx, my + jaw // 2, 4, max(1, jaw // 2 + 1), '#3a0810'); L.rect(hx - 2, my - 1, 4, 1, '#fffaf0')
    else: L.line([(hx - 3, my), (hx + 3, my + (0 if emo != 'sad' else 1))], BR[0])
    L.line([(hx - 5, my + 4), (hx - 8, my + 7)], BR[0]); L.line([(hx + 5, my + 4), (hx + 8, my + 7)], BR[0])        # mandibles
    L.rect(hx - 6, hy - 11, 12, 2, '#ff60c0'); L.ell(hx + 6, hy - 11, 3, 2, '#ff9ad8')                           # little bow
    _headphones(L, hx, hy + 1, 13, hy - 15, '#40e080')
    def dr(c, ax, ay): composite(c, L, OUT)
    A.stamp(C, dr, ST.JX, ST.FEET - 4, ax=54, ay=172, sx=0.8, sy=0.8)


GUESTS = {'rex': rex, 'neferu': neferu, 'tonha': tonha}
