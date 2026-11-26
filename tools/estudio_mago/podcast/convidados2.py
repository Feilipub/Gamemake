"""Mais convidados do Podcast do Mago (pixel art, cadeira do convidado). Mesma assinatura do estudio.juvenal."""
import math
import estudio as ST
from scene import Layer, composite, OUT
import anim as A
from convidados import _bob, _jaw, _headphones, _eye


def _stamp(C, L, ay=170, dx=0):
    def dr(c, ax, ay_): composite(c, L, OUT)
    A.stamp(C, dr, ST.JX + dx, ST.FEET - 4, ax=54, ay=ay, sx=0.8, sy=0.8)


def _limbs(gest, t, x, y, sw=17, sy=52):
    """shoulder/elbow/hand triples (left, right) for a gesture; left points toward the Mago"""
    wob = round(math.sin(t * 6))
    l = (x - sw, y - sy, x - sw - 5, y - sy + 16, x - sw - 9, y - sy + 26); r = (x + sw, y - sy, x + sw + 5, y - sy + 16, x + sw + 9, y - sy + 26)
    if gest == 'point': l = (x - sw, y - sy, x - sw - 11, y - sy + 6, x - sw - 23, y - sy - 4 + wob)
    elif gest == 'shrug': l = (x - sw, y - sy, x - sw - 13, y - sy + 10, x - sw - 15, y - sy - 4); r = (x + sw, y - sy, x + sw + 13, y - sy + 10, x + sw + 15, y - sy - 4)
    elif gest in ('hand', 'count', 'thumb'): l = (x - sw, y - sy, x - sw - 7, y - sy + 14, x - sw - 13, y - sy + 2 + wob)
    elif gest == 'chest': r = (x + sw, y - sy, x + sw - 1, y - sy + 16, x + 4, y - sy + 4)
    elif gest == 'facepalm': l = (x - sw, y - sy, x - sw + 1, y - sy + 12, x - 4, y - sy - 22)
    elif gest == 'slap': hit = abs(math.sin(t * 7)); l = (x - sw, y - sy, x - sw - 9, y - sy + 14, x - sw - 15, y - sy + 26 - round(hit * 8))
    elif gest == 'cast': l = (x - sw, y - sy, x - sw - 12, y - sy - 4, x - sw - 18, y - sy - 16 + wob); r = (x + sw, y - sy, x + sw + 12, y - sy - 4, x + sw + 18, y - sy - 16 - wob)
    return l, r


def _mouth(L, hx, my, jaw, col='#3a0810', line='#2a1408', w=4, sad=False):
    if jaw: L.ell(hx, my + jaw // 2, w, max(1, jaw // 2 + 1), col); L.rect(hx - w + 2, my - 1, 2 * w - 4, 1, '#fffaf0')
    else: L.line([(hx - w + 1, my + (1 if sad else 0)), (hx, my), (hx + w - 1, my + (1 if sad else 0))], line)


# ------------------------------------------------------------------ PEDRO, o pombo
def pombo(C, t, talk, gest, emo, blink, nod=0.0, laugh=False, look=-1):
    L = Layer(108, 192); x, y = 54, 170; y += _bob(t, nod, laugh); jaw = _jaw(t, talk, laugh)
    L.ell(x, y - 30, 21, 30, '#8a90a0'); L.ell(x - 3, y - 26, 13, 20, '#a8aebc')
    L.ell(x, y - 60, 11, 6, '#4a8a7a'); L.ell(x - 3, y - 59, 6, 4, '#8a5aa0')                                       # iridescent neck
    l, r = _limbs(gest, t, x, y, 16, 50)
    for a, c in ((r, '#6a7080'), (l, '#767c8c')):                                                                   # wings as arms
        L.poly([a[0:2], a[2:4], a[4:6], (a[4] + 4, a[5] + 4), (a[2] + 3, a[3] + 5)], c)
        for k in range(3): L.line([(a[4] + k * 2, a[5] + k), (a[4] + k * 2 + 2, a[5] + k + 5)], '#3a3e48')
    hx, hy = x - 2, y - 78 + (-2 if laugh else 0)
    L.ell(hx, hy, 12, 11, '#7a8090'); L.ell(hx - 3, hy - 4, 6, 4, '#9aa0b0')
    L.poly([(hx - 12, hy + 1), (hx - 21, hy + 4), (hx - 12, hy + 5)], '#d8b080'); L.rect(hx - 13, hy - 1, 3, 3, '#f0f0f0')   # beak + cere
    if jaw: L.poly([(hx - 12, hy + 5), (hx - 19, hy + 5 + jaw), (hx - 11, hy + 7)], '#c09060')
    for ex in (-5, 4):
        if blink: L.line([(hx + ex - 2, hy - 2), (hx + ex + 2, hy - 2)], '#2a2a30'); continue
        L.ell(hx + ex, hy - 2, 3, 3 + (emo == 'wide'), '#f08020'); L.rect(hx + ex - 1 + look, hy - 3, 2, 2, '#101010')
    if emo in ('sad', 'scared'): L.line([(hx - 8, hy - 7), (hx - 2, hy - 6)], '#3a3e48')
    L.rect(hx - 9, hy - 13, 18, 3, '#2a4a8a'); L.rect(hx - 6, hy - 18, 12, 6, '#3a5aa0'); L.rect(hx - 13, hy - 12, 6, 2, '#2a4a8a')   # mailman cap
    L.rect(hx - 2, hy - 16, 4, 3, '#ffd040')
    L.rect(x + 8, y - 44, 14, 10, '#c8a060'); L.line([(x + 8, y - 44), (x + 15, y - 39), (x + 22, y - 44)], '#8a6a30')   # letter bag
    L.line([(x - 10, y - 62), (x + 14, y - 40)], '#6a4a20', 2)
    _headphones(L, hx, hy + 1, 13, hy - 14, '#ffd040')
    _stamp(C, L, dx=6)


# ------------------------------------------------------------------ OLGA, a polvo
PV = ['#6a1a4a', '#9a2a6a', '#c84a8a', '#e88ab8']
def polvo(C, t, talk, gest, emo, blink, nod=0.0, laugh=False, look=-1):
    L = Layer(108, 192); x, y = 54, 170; y += _bob(t, nod, laugh); jaw = _jaw(t, talk, laugh)
    for k in range(6):                                                                                                # tentacles draping over the desk
        bx = x - 25 + k * 10; ph = t * 2.2 + k
        pts = [(bx, y - 44), (bx + round(math.sin(ph) * 3) - 2, y - 30), (bx + round(math.sin(ph + 1) * 5) - 4, y - 16), (bx + round(math.sin(ph + 2) * 6) - 3, y - 2)]
        L.line(pts, PV[1], 6); L.line(pts, PV[2], 3)
        for p in pts[1:]: L.px(p[0] - 2, p[1], PV[3])
    l, r = _limbs(gest, t, x, y, 14, 46)
    for a in (r, l):
        pts = [a[0:2], a[2:4], a[4:6], (a[4] - 3 if a is l else a[4] + 3, a[5] - 4)]; L.line(pts, PV[0], 6); L.line(pts, PV[2], 4)
        L.px(a[4], a[5] + 1, PV[3]); L.px(a[2], a[3] + 1, PV[3])
    hx, hy = x, y - 70 + (-2 if laugh else 0)
    L.ell(hx + 2, hy - 8, 19, 22, PV[1]); L.ell(hx - 3, hy - 14, 11, 12, PV[2]); L.ell(hx - 7, hy - 20, 4, 4, PV[3])   # mantle
    for k in range(5): L.px(hx + 8 + k * 2, hy - 18 + k * 3, PV[0])
    for ex in (-7, 5):                                                                                                # goat-like pupils
        if blink: L.line([(hx + ex - 3, hy + 2), (hx + ex + 3, hy + 2)], PV[0]); continue
        L.ell(hx + ex, hy + 2, 4, 4 + (emo == 'wide'), '#f8e8a0'); L.rect(hx + ex - 2 + look, hy + 1, 4, 2, '#140810')
        if emo in ('sad', 'scared'): L.line([(hx + ex - 3, hy - 4), (hx + ex + 3, hy - 3 - (ex > 0))], PV[0])
    _mouth(L, hx - 1, hy + 11, jaw, '#3a0820', PV[0], 3, emo == 'sad')
    L.ell(hx - 13, hy + 7, 2, 1, '#ff9ac8'); L.ell(hx + 11, hy + 7, 2, 1, '#ff9ac8')
    for k in range(3): L.ell(hx - 6 + k * 6, hy - 30, 2, 2, '#f0f0ff')                                               # pearl necklace as a crown
    _headphones(L, hx + 2, hy + 3, 20, hy - 33, '#40e0d0')
    _stamp(C, L)


# ------------------------------------------------------------------ VOVÔ TUBARÃO (tubarão-da-groenlândia, 400 anos)
SH = ['#3a3a3e', '#56565c', '#76767c', '#9a9aa0']
def tubarao(C, t, talk, gest, emo, blink, nod=0.0, laugh=False, look=-1):
    L = Layer(108, 192); x, y = 56, 170; y += _bob(t, nod, laugh, 8); jaw = _jaw(t, talk, laugh)
    L.ell(x, y - 34, 23, 34, SH[1]); L.ell(x - 4, y - 30, 14, 24, SH[3])
    L.poly([(x + 6, y - 64), (x + 18, y - 90), (x + 22, y - 62)], SH[0])                                               # dorsal fin
    L.rect(x - 20, y - 60, 40, 6, '#b03030'); L.poly([(x - 6, y - 56), (x + 2, y - 56), (x + 4, y - 36), (x - 4, y - 38)], '#b03030')   # knitted scarf
    for k in range(6): L.px(x - 18 + k * 7, y - 58, '#e05050')
    l, r = _limbs(gest, t, x, y, 18, 50)
    for a in (r, l): L.poly([a[0:2], a[2:4], a[4:6], (a[4] + 5, a[5] + 2), (a[2] + 5, a[3] + 3)], SH[0])               # pectoral fins
    hx, hy = x - 4, y - 80 + (-1 if laugh else 0)
    L.ell(hx + 4, hy, 19, 14, SH[1]); L.rect(hx - 20, hy - 6, 24, 13, SH[1]); L.ell(hx - 20, hy, 5, 7, SH[1]); L.ell(hx, hy - 7, 14, 5, SH[2])
    my = hy + 7
    L.rect(hx - 20, my, 26, 2 + jaw, '#2a0c10') if jaw else L.line([(hx - 20, my), (hx + 6, my + 1)], SH[0])
    for k in range(6): L.poly([(hx - 19 + k * 4, my), (hx - 18 + k * 4, my + 2), (hx - 17 + k * 4, my)], '#f0eee0')
    L.rect(hx - 20, my + 2 + jaw, 26, 4, SH[1])
    for k in range(3): L.line([(hx + 8 + k * 3, hy - 2), (hx + 8 + k * 3, hy + 6)], SH[0])                              # gills
    ex_, ey_ = hx - 8, hy - 3
    L.ell(ex_, ey_, 5, 5, '#202028'); L.ell(ex_, ey_, 4, 4, '#b8d8f0')                                                # round glasses
    if blink: L.line([(ex_ - 2, ey_), (ex_ + 2, ey_)], SH[0])
    else: L.ell(ex_, ey_, 2, 2 + (emo == 'wide'), '#ffffff'); L.rect(ex_ - 1 + min(0, look), ey_ - 1, 2, 2, '#101018')
    L.line([(ex_ + 5, ey_ - 1), (ex_ + 14, ey_ - 3)], '#202028')
    L.line([(hx - 18, my - 2), (hx - 14, my - 4), (hx - 9, my - 2)], '#f0f0f0', 2)                                       # white moustache
    if emo in ('sad', 'scared'): L.line([(ex_ - 4, ey_ - 6), (ex_ + 4, ey_ - 7)], SH[0])
    L.ell(hx + 8, hy - 14, 10, 4, '#5a6a8a'); L.ell(hx + 8, hy - 17, 3, 2, '#e0e0e0')                                   # beanie with pompom
    ST.headphones_side(L, hx - 2, hx + 24, hy - 20, hx + 11, hy + 1, '#40c0ff')                                        # headphones (side view)
    _stamp(C, L, dx=2)


# ------------------------------------------------------------------ ZUZU, a mosquita
def mosquito(C, t, talk, gest, emo, blink, nod=0.0, laugh=False, look=-1):
    L = Layer(108, 192); x, y = 54, 170; y += _bob(t, nod, laugh, 30) + round(math.sin(t * 9) * 1); jaw = _jaw(t, talk, laugh)
    for s in (-1, 1):                                                                                                   # buzzing wings
        sp = 4 if int(t * 30) % 2 else 0
        L.poly([(x + s * 4, y - 62), (x + s * 34, y - 84 - sp), (x + s * 30, y - 66 + sp)], '#c8e0f0'); L.line([(x + s * 4, y - 62), (x + s * 32, y - 78)], '#90b0c8')
    L.ell(x + 4, y - 26, 10, 22, '#5a5048')
    for k in range(5): L.line([(x - 5, y - 40 + k * 7), (x + 13, y - 40 + k * 7)], '#e8e0d0')                           # striped abdomen
    L.ell(x, y - 56, 10, 9, '#4a4038'); L.px(x - 3, y - 59, '#7a7068')
    for s in (-1, 1): L.line([(x + s * 6, y - 52), (x + s * 18, y - 40), (x + s * 22, y - 8)], '#3a3028')                # long legs on the desk
    l, r = _limbs(gest, t, x, y, 7, 56)
    for a in (l, r): L.line([a[0:2], a[2:4], a[4:6]], '#3a3028', 1); L.px(a[4], a[5], '#2a2018')
    hx, hy = x - 2, y - 76 + (-2 if laugh else 0)
    L.ell(hx, hy, 11, 10, '#5a5048')
    for ex in (-5, 4):                                                                                                 # big compound eyes
        if blink: L.line([(hx + ex - 3, hy - 1), (hx + ex + 3, hy - 1)], '#1a1010'); continue
        L.ell(hx + ex, hy - 1, 5, 5 + (emo == 'wide'), '#c02838'); L.ell(hx + ex - 1, hy - 2, 2, 2, '#ff8a90'); L.px(hx + ex - 2 + look, hy - 3, '#ffffff')
        if emo in ('sad', 'scared', 'angry'): L.line([(hx + ex - 4, hy - 7 + (emo == 'angry') * (ex < 0)), (hx + ex + 4, hy - 7)], '#1a1010')
    L.line([(hx - 3, hy + 5), (hx - 14, hy + 10 + jaw), (hx - 22, hy + 13 + jaw)], '#2a2018', 2)                      # proboscis (moves when talking)
    for s in (-1, 1): L.line([(hx + s * 3, hy - 9), (hx + s * 9, hy - 18), (hx + s * 14, hy - 20 + round(math.sin(t * 5 + s) * 2))], '#3a3028')
    for k in range(3): L.px(hx + 10 - k * 2, hy - 12 + k, '#ff60c0')                                                   # eyelashes / little bow
    _headphones(L, hx, hy + 1, 12, hy - 14, '#ff60c0')
    _stamp(C, L, dx=8)


# ------------------------------------------------------------------ MELISSA, a abelha
def abelha(C, t, talk, gest, emo, blink, nod=0.0, laugh=False, look=-1):
    L = Layer(108, 192); x, y = 54, 170; y += _bob(t, nod, laugh, 20); jaw = _jaw(t, talk, laugh)
    for s in (-1, 1):
        sp = 3 if int(t * 24) % 2 else 0
        L.ell(x + s * 22, y - 64 - sp, 14, 9, '#d8f0ff'); L.ell(x + s * 22, y - 64 - sp, 10, 5, '#eaf8ff')
    L.ell(x, y - 32, 21, 30, '#f2c024')
    for k in range(4): L.rect(x - 20 + (k % 2), y - 50 + k * 10, 40 - 2 * (k % 2), 5, '#2a1c10')
    L.ell(x - 5, y - 44, 6, 6, '#ffe070')
    l, r = _limbs(gest, t, x, y, 16, 52)
    for a in (l, r): L.line([a[0:2], a[2:4], a[4:6]], '#2a1c10', 2); L.ell(a[4], a[5], 2, 2, '#2a1c10')
    hx, hy = x, y - 76 + (-2 if laugh else 0)
    L.ell(hx, hy, 13, 12, '#2a1c10'); L.ell(hx, hy + 2, 10, 9, '#f2c024')
    for ex in (-5, 5): _eye(L, hx + ex, hy, blink, emo, look, '#2a1c10', 3)
    _mouth(L, hx, hy + 7, jaw, '#5a1010', '#2a1c10', 3, emo == 'sad')
    L.ell(hx - 8, hy + 5, 2, 1, '#ff9a6a'); L.ell(hx + 8, hy + 5, 2, 1, '#ff9a6a')
    for s in (-1, 1): L.line([(hx + s * 4, hy - 11), (hx + s * 8, hy - 20), (hx + s * 11, hy - 22)], '#2a1c10'); L.ell(hx + s * 11, hy - 22, 2, 2, '#2a1c10')
    _headphones(L, hx, hy + 1, 14, hy - 16, '#ffd040')
    _stamp(C, L)


# ------------------------------------------------------------------ BJORN, o viking (sem chifre!)
def viking(C, t, talk, gest, emo, blink, nod=0.0, laugh=False, look=-1):
    L = Layer(108, 192); x, y = 54, 170; y += _bob(t, nod, laugh); jaw = _jaw(t, talk, laugh)
    L.poly([(x - 24, y - 20), (x - 22, y - 54), (x - 10, y - 62), (x + 10, y - 62), (x + 22, y - 54), (x + 24, y - 20)], '#4a5a7a')   # tunic
    L.poly([(x - 24, y - 52), (x - 12, y - 64), (x + 12, y - 64), (x + 24, y - 52), (x + 18, y - 48), (x - 18, y - 48)], '#8a6a4a')     # fur cloak
    for k in range(8): L.px(x - 20 + k * 5, y - 50 + (k % 2), '#c0a080')
    L.rect(x - 22, y - 30, 44, 4, '#5a3a20'); L.rect(x - 3, y - 31, 6, 6, '#c0a040')
    l, r = _limbs(gest, t, x, y, 20, 52)
    for a in (r, l): L.line([a[0:2], a[2:4]], '#4a5a7a', 6); L.line([a[2:4], a[4:6]], '#e0a888', 4); L.ell(a[4], a[5], 3, 3, '#e8b090')
    hx, hy = x, y - 78 + (-2 if laugh else 0)
    L.ell(hx, hy, 12, 13, '#e8b090')
    L.poly([(hx - 12, hy + 2), (hx + 12, hy + 2), (hx + 10, hy + 18), (hx, hy + 24), (hx - 10, hy + 18)], '#c0501c')     # big red beard
    for s in (-1, 1): L.line([(hx + s * 4, hy + 18), (hx + s * 5, hy + 28)], '#a0401a', 3); L.px(hx + s * 5, hy + 29, '#ffd040')   # braids with beads
    my = hy + 7
    if jaw: L.ell(hx, my + jaw // 2, 4, max(1, jaw // 2 + 1), '#4a1010'); L.rect(hx - 2, my - 1, 4, 1, '#fffaf0')
    else: L.line([(hx - 3, my), (hx + 3, my)], '#7a2a10')
    L.rect(hx - 8, hy + 2, 16, 3, '#c0501c')                                                                            # moustache
    for ex in (-5, 5): _eye(L, hx + ex, hy - 2, blink, emo, look, '#3a7ad0', 2)
    L.line([(hx - 8, hy - 6), (hx - 2, hy - 5)], '#a0401a', 2); L.line([(hx + 2, hy - 5), (hx + 8, hy - 6)], '#a0401a', 2)
    L.ell(hx, hy - 9, 14, 9, '#8a8e98'); L.rect(hx - 14, hy - 9, 28, 4, '#8a8e98'); L.rect(hx - 1, hy - 18, 2, 14, '#6a6e78')   # round helmet, NO horns
    L.rect(hx - 1, hy - 6, 2, 8, '#6a6e78'); L.ell(hx - 5, hy - 13, 3, 2, '#b8bcc8')
    _headphones(L, hx, hy + 1, 15, hy - 19, '#40c0ff')
    _stamp(C, L)


# ------------------------------------------------------------------ MANECO, o mamute
MF = ['#3a2210', '#5a3418', '#7a4a24', '#9a6a3a']
def mamute(C, t, talk, gest, emo, blink, nod=0.0, laugh=False, look=-1):
    L = Layer(108, 192); x, y = 56, 172; y += _bob(t, nod, laugh, 10); jaw = _jaw(t, talk, laugh)
    L.ell(x + 2, y - 34, 27, 36, MF[1]); L.ell(x - 3, y - 36, 16, 26, MF[2])
    for k in range(12): L.line([(x - 22 + k * 4, y - 62 + (k % 3) * 2), (x - 23 + k * 4, y - 52 + (k % 3) * 2)], MF[0])   # shaggy fur strands
    hx, hy = x - 4, y - 76 + (-2 if laugh else 0)
    L.ell(hx + 2, hy - 2, 18, 17, MF[2]); L.ell(hx + 4, hy - 16, 10, 8, MF[1])                                           # domed head
    for k in range(6): L.line([(hx - 6 + k * 3, hy - 22), (hx - 7 + k * 3, hy - 27)], MF[0])
    L.ell(hx + 16, hy - 2, 5, 7, MF[1])                                                                                  # small ear
    sw = round(math.sin(t * 2.5) * 3) + (jaw if talk else 0)
    trunk = [(hx - 8, hy + 4), (hx - 14, hy + 16), (hx - 18 - sw, hy + 30), (hx - 24 - sw, hy + 34)]                      # trunk sways
    if gest in ('point', 'hand', 'count', 'cast'): trunk = [(hx - 8, hy + 4), (hx - 18, hy + 6), (hx - 30, hy - 2 + sw), (hx - 34, hy - 8 + sw)]
    L.line(trunk, MF[1], 7); L.line(trunk, MF[2], 4)
    for s, c in ((1, '#efe6d0'), (-1, '#f8f0e0')):                                                                        # curved tusks
        b = hx - 4 + s * 3; L.line([(b, hy + 8), (b - 10, hy + 22), (b - 22, hy + 24), (b - 28, hy + 16)], c, 3)
    if jaw: L.ell(hx - 2, hy + 10, 3, 1 + jaw // 2, '#3a0810')
    for ex in (-6, 5):
        if blink: L.line([(hx + ex - 2, hy - 3), (hx + ex + 2, hy - 3)], MF[0]); continue
        L.ell(hx + ex, hy - 3, 2, 3 + (emo == 'wide'), '#ffffff'); L.rect(hx + ex - 1 + look, hy - 3, 2, 2, '#140a04')
        if emo in ('sad', 'scared'): L.line([(hx + ex - 3, hy - 8), (hx + ex + 3, hy - 7)], MF[0])
    L.rect(hx - 6, hy - 22, 20, 4, '#3a8ad0'); L.rect(hx - 4, hy - 24, 4, 3, '#ffffff')                                   # winter beanie band
    _headphones(L, hx + 3, hy - 1, 19, hy - 22, '#ffd040')
    _stamp(C, L, ay=172, dx=2)


# ------------------------------------------------------------------ FÁTIMA, a formiga
def formiga(C, t, talk, gest, emo, blink, nod=0.0, laugh=False, look=-1):
    L = Layer(108, 192); x, y = 54, 170; y += _bob(t, nod, laugh, 22); jaw = _jaw(t, talk, laugh)
    L.ell(x + 4, y - 18, 16, 18, '#8a2a14'); L.ell(x + 1, y - 22, 8, 9, '#b84024')                                       # gaster
    L.ell(x, y - 46, 9, 12, '#9a3018'); L.ell(x - 3, y - 49, 4, 5, '#c85030')                                             # thorax
    for s in (-1, 1): L.line([(x + s * 6, y - 40), (x + s * 18, y - 32), (x + s * 22, y - 6)], '#5a1a0c', 2)
    l, r = _limbs(gest, t, x, y, 8, 52)
    for a in (l, r): L.line([a[0:2], a[2:4], a[4:6]], '#5a1a0c', 2); L.ell(a[4], a[5], 2, 2, '#3a1008')
    if gest == 'rest': L.rect(x + 14, y - 32, 9, 9, '#ffffff'); L.rect(x + 14, y - 32, 9, 2, '#e8e8f0')                  # her sugar cube
    hx, hy = x - 1, y - 74 + (-2 if laugh else 0)
    L.ell(hx, hy, 13, 11, '#9a3018'); L.ell(hx - 4, hy - 4, 6, 4, '#c85030')
    for ex in (-5, 5): _eye(L, hx + ex, hy - 1, blink, emo, look, '#140808', 3)
    _mouth(L, hx, hy + 6, jaw, '#3a0810', '#3a1008', 3, emo == 'sad')
    for s in (-1, 1): L.poly([(hx + s * 3, hy + 9), (hx + s * 8, hy + 12), (hx + s * 2, hy + 12)], '#5a1a0c')            # mandibles
    for s in (-1, 1): L.line([(hx + s * 4, hy - 9), (hx + s * 6, hy - 22), (hx + s * (14 + round(math.sin(t * 4 + s) * 2)), hy - 28)], '#5a1a0c', 2)
    L.rect(hx - 12, hy - 11, 24, 3, '#e8d040'); L.ell(hx, hy - 14, 8, 4, '#e8d040')                                        # straw farmer hat
    _headphones(L, hx, hy + 1, 14, hy - 16, '#40e080')
    _stamp(C, L)


# ------------------------------------------------------------------ GIGI, a girafa
def girafa(C, t, talk, gest, emo, blink, nod=0.0, laugh=False, look=-1):
    L = Layer(108, 192); x, y = 54, 172; y += _bob(t, nod, laugh); jaw = _jaw(t, talk, laugh)
    body = '#e8b048'; spot = '#9a5a20'
    L.ell(x + 4, y - 22, 22, 22, body)
    sway = round(math.sin(t * 1.3) * 2)
    L.poly([(x - 2, y - 36), (x + 10, y - 36), (x + 6 + sway, y - 120), (x - 4 + sway, y - 120)], body)                    # long neck
    for k in range(6): L.poly([(x - 1 + sway * k // 6, y - 44 - k * 13), (x + 6 + sway * k // 6, y - 46 - k * 13), (x + 4 + sway * k // 6, y - 40 - k * 13)], spot)
    for k in range(5): L.ell(x - 10 + k * 7, y - 22 + (k % 2) * 6, 3, 2, spot)
    L.line([(x + 8 + sway, y - 120), (x + 12, y - 40)], '#7a4010', 2)                                                       # mane
    l, r = _limbs(gest, t, x, y, 16, 34)
    for a in (l, r): L.line([a[0:2], a[2:4], a[4:6]], body, 4); L.rect(a[4] - 2, a[5] - 1, 4, 3, '#4a2a10')
    hx, hy = x - 2 + sway, y - 132 + (-2 if laugh else 0)
    L.ell(hx, hy, 10, 9, body); L.ell(hx - 9, hy + 5, 8, 6, '#f0c870'); L.ell(hx - 4, hy - 3, 4, 3, '#f8d890')
    for s in (-1, 1): L.rect(hx + s * 5 - 1, hy - 16, 3, 8, body); L.ell(hx + s * 5, hy - 17, 2, 2, '#7a4010')            # ossicones
    L.ell(hx + 10, hy - 3, 5, 2, body)                                                                                    # ear
    for ex in (-4, 4):
        if blink: L.line([(hx + ex - 2, hy - 1), (hx + ex + 2, hy - 1)], '#3a2010'); continue
        L.ell(hx + ex, hy - 1, 3, 3 + (emo == 'wide'), '#ffffff'); L.rect(hx + ex - 1 + look, hy - 1, 2, 2, '#1a0c04')
        for k in range(3): L.px(hx + ex - 2 + k * 2, hy - 5, '#1a0c04')                                                 # long lashes
    my = hy + 8
    if jaw: L.ell(hx - 9, my + jaw // 2, 4, max(1, jaw // 2 + 1), '#4a1030'); L.rect(hx - 13, my + jaw // 2, 4, 2, '#4a2a6a') if talk >= 3 else None
    else: L.line([(hx - 13, my), (hx - 6, my)], '#7a4010')
    L.px(hx - 14, hy + 3, '#5a3010'); L.px(hx - 10, hy + 3, '#5a3010')
    _headphones(L, hx, hy + 1, 11, hy - 13, '#ff60c0')
    _stamp(C, L, ay=172)


# ------------------------------------------------------------------ BERG, o iceberg do Titanic
def iceberg(C, t, talk, gest, emo, blink, nod=0.0, laugh=False, look=-1):
    L = Layer(108, 192); x, y = 54, 172; y += _bob(t, nod, laugh, 6); jaw = _jaw(t, talk, laugh)
    L.poly([(x - 30, y), (x - 26, y - 44), (x - 16, y - 70), (x - 4, y - 104), (x + 8, y - 88), (x + 18, y - 98), (x + 28, y - 60), (x + 32, y)], '#d8f0fa')
    L.poly([(x - 4, y - 104), (x + 8, y - 88), (x + 2, y - 40), (x - 12, y - 60)], '#f4fcff')
    L.poly([(x + 18, y - 98), (x + 28, y - 60), (x + 32, y), (x + 14, y - 30)], '#a8d4e8')
    for k in range(3):                                                                                                  # melting drips
        ph = (t * 0.8 + k * 0.33) % 1; L.px(x - 20 + k * 18, y - 30 + round(ph * 26), '#80c8f0')
    l, r = _limbs(gest, t, x, y, 22, 46)
    for a in (l, r): L.line([a[0:2], a[2:4], a[4:6]], '#c0e4f4', 4); L.ell(a[4], a[5], 3, 3, '#e8f8ff')
    hx, hy = x, y - 64 + (-2 if laugh else 0)
    for ex in (-7, 7): _eye(L, hx + ex, hy, blink, emo, look, '#2a6a9a', 3)
    if emo in ('sad', 'serious'): L.line([(hx - 10, hy - 6), (hx - 4, hy - 7)], '#6aa8c8'); L.line([(hx + 4, hy - 7), (hx + 10, hy - 6)], '#6aa8c8')
    _mouth(L, hx, hy + 10, jaw, '#2a4a6a', '#5a90b0', 5, emo == 'sad')
    L.ell(hx - 12, hy + 6, 3, 1, '#ffb0c8'); L.ell(hx + 12, hy + 6, 3, 1, '#ffb0c8')
    L.rect(x - 22, y - 44, 44, 5, '#c03040'); L.rect(x + 10, y - 44, 6, 14, '#c03040')                                    # scarf (it is cold)
    _headphones(L, hx, hy + 2, 20, hy - 26, '#40c0ff')
    _stamp(C, L, ay=172)


GUESTS = {'pombo': pombo, 'polvo': polvo, 'tubarao': tubarao, 'mosquito': mosquito, 'abelha': abelha,
          'viking': viking, 'mamute': mamute, 'formiga': formiga, 'girafa': girafa, 'iceberg': iceberg}
