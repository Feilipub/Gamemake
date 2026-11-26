"""Convidados do lote 3: TARDI (tardígrado), LOLO (axolote), MARINA (baleia-azul)."""
import math
import estudio as ST
from scene import Layer
from convidados import _bob, _jaw, _headphones, _eye
from convidados2 import _stamp, _limbs, _mouth


# ------------------------------------------------------------------ TARDI, o tardígrado (urso-d'água)
TD = ['#7a6a54', '#a8967a', '#d0c0a0', '#ece0c4']
def tardigrado(C, t, talk, gest, emo, blink, nod=0.0, laugh=False, look=-1):
    L = Layer(108, 192); x, y = 54, 170; y += _bob(t, nod, laugh, 14); jaw = _jaw(t, talk, laugh)
    for k in range(4):                                                                                              # segmented chubby body
        L.ell(x + 2, y - 14 - k * 13, 22 - k * 1, 9, TD[1 if k % 2 else 2]); L.ell(x - 4, y - 17 - k * 13, 9, 3, TD[3])
    for k in range(3): L.line([(x - 18, y - 21 - k * 13), (x + 20, y - 21 - k * 13)], TD[0])
    for s in (-1, 1):                                                                                                # stubby legs with claws on the desk
        for k in range(2):
            lx = x + s * (12 + k * 8); L.rect(lx - 3, y - 12, 6, 8, TD[1]); L.line([(lx - 2, y - 4), (lx - 4, y - 1)], '#3a2a1a'); L.line([(lx + 2, y - 4), (lx + 4, y - 1)], '#3a2a1a')
    l, r = _limbs(gest, t, x, y, 15, 48)
    for a in (l, r):
        L.line([a[0:2], a[2:4], a[4:6]], TD[1], 5); L.line([a[0:2], a[2:4], a[4:6]], TD[2], 3)
        L.line([(a[4], a[5]), (a[4] - 2, a[5] - 3)], '#3a2a1a'); L.line([(a[4], a[5]), (a[4] + 2, a[5] - 3)], '#3a2a1a')
    hx, hy = x, y - 72 + (-2 if laugh else 0)
    L.ell(hx, hy, 15, 13, TD[2]); L.ell(hx - 4, hy - 5, 8, 5, TD[3])
    L.ell(hx - 8, hy + 6, 6, 5, TD[1])                                                                              # tube snout
    L.ell(hx - 9, hy + 6, 3, 2 + jaw // 2, '#4a2030') if True else None
    for ex in (-3, 6):
        if blink: L.line([(hx + ex - 2, hy - 2), (hx + ex + 2, hy - 2)], '#2a1a10'); continue
        L.ell(hx + ex, hy - 2, 2, 2 + (emo == 'wide'), '#1a1008'); L.px(hx + ex - 1, hy - 3, '#ffffff')
        if emo in ('sad', 'scared'): L.line([(hx + ex - 3, hy - 7), (hx + ex + 3, hy - 6)], TD[0])
    L.ell(hx + 9, hy + 3, 2, 1, '#ff9a9a')
    L.rect(hx - 9, hy - 16, 18, 3, '#e8e8f0'); L.rect(hx - 3, hy - 18, 6, 3, '#e04040')                          # tiny astronaut band (it went to space)
    _headphones(L, hx, hy + 1, 16, hy - 17, '#40c0ff')
    _stamp(C, L, dx=4)


# ------------------------------------------------------------------ LOLO, o axolote
AX = ['#c06a8a', '#e898b0', '#f8c0d0', '#ffe0ea']
def axolote(C, t, talk, gest, emo, blink, nod=0.0, laugh=False, look=-1):
    L = Layer(108, 192); x, y = 54, 170; y += _bob(t, nod, laugh, 14); jaw = _jaw(t, talk, laugh)
    L.ell(x + 2, y - 26, 19, 28, AX[1]); L.ell(x - 2, y - 24, 11, 18, AX[2])
    L.poly([(x + 14, y - 40), (x + 30, y - 70 + round(math.sin(t * 2) * 2)), (x + 22, y - 36)], AX[0])                 # tail fin up behind
    l, r = _limbs(gest, t, x, y, 15, 46)
    for a in (l, r):
        L.line([a[0:2], a[2:4], a[4:6]], AX[1], 4)
        for k in (-1, 0, 1): L.line([(a[4], a[5]), (a[4] + k * 2, a[5] - 3)], AX[0])
    hx, hy = x, y - 66 + (-2 if laugh else 0)
    for s in (-1, 1):                                                                                                # feathery external gills, waving
        for k in range(3):
            ang = (-0.5 + k * 0.5) + math.sin(t * 3 + k + s) * 0.12; bx, by = hx + s * 16, hy - 4 + k * 4
            ex_, ey_ = bx + s * round(17 * math.cos(ang)), by - round(17 * math.sin(ang + 0.6))
            L.line([(bx, by), (ex_, ey_)], '#d0306a', 3)
            for q in range(1, 4): L.px(bx + (ex_ - bx) * q // 4 + s, by + (ey_ - by) * q // 4 - 1, '#ff6aa0')
    L.ell(hx, hy, 18, 13, AX[1]); L.ell(hx - 4, hy - 5, 9, 5, AX[2])
    for ex in (-8, 8):
        if blink: L.line([(hx + ex - 2, hy - 2), (hx + ex + 2, hy - 2)], '#2a1020'); continue
        L.ell(hx + ex, hy - 2, 2, 2 + (emo == 'wide'), '#1a0a14'); L.px(hx + ex - 1, hy - 3, '#ffffff')
        if emo in ('sad', 'scared'): L.line([(hx + ex - 3, hy - 7), (hx + ex + 3, hy - 6)], AX[0])
    my = hy + 5                                                                                                      # the famous wide smile
    if jaw: L.ell(hx, my + jaw // 2, 7, max(1, jaw // 2 + 1), '#7a2040')
    else: L.line([(hx - 9, my - 1), (hx - 5, my + 1), (hx + 5, my + 1), (hx + 9, my - 1)], '#7a3050')
    L.ell(hx - 12, hy + 3, 2, 1, '#ff7aa0'); L.ell(hx + 12, hy + 3, 2, 1, '#ff7aa0')
    _headphones(L, hx, hy + 1, 18, hy - 15, '#40e0d0')
    _stamp(C, L)


# ------------------------------------------------------------------ MARINA, a baleia-azul (só a cabeça cabe no estúdio)
BW = ['#1c2c48', '#2a4268', '#3e5c8a', '#6a88b4', '#a8c0dc']
def baleia(C, t, talk, gest, emo, blink, nod=0.0, laugh=False, look=-1):
    L = Layer(108, 192); x, y = 60, 172; y += _bob(t, nod, laugh, 6); jaw = _jaw(t, talk, laugh); yb = y - 30
    L.ell(x + 8, yb - 40, 44, 42, BW[1]); L.ell(x, yb - 52, 30, 24, BW[2]); L.ell(x - 8, yb - 60, 12, 7, BW[3])     # enormous head
    for k in range(6): L.px(x + 14 + k * 5, yb - 66 + (k % 2) * 4, BW[3]); L.px(x - 10 + k * 6, yb - 72 + (k % 3), BW[3])
    my = yb - 22                                                                                                     # long mouth line + throat pleats
    L.poly([(x - 36, my), (x + 34, my + 4), (x + 44, y + 10), (x - 36, y + 10)], BW[3])
    for k in range(8): L.line([(x - 34, my + 4 + k * 5), (x + 36, my + 8 + k * 5)], BW[2])
    if jaw: L.poly([(x - 36, my - 1), (x + 30, my + 3), (x + 28, my + 4 + jaw * 2), (x - 34, my + 1 + jaw * 2)], '#3a0c20'); L.line([(x - 30, my + 1 + jaw), (x + 10, my + 2 + jaw)], '#c04a6a', 2)
    L.line([(x - 38, my - 1), (x + 34, my + 3)], BW[0], 2)
    l, r = _limbs(gest, t, x, y, 34, 40)
    L.poly([l[0:2], l[2:4], l[4:6], (l[4] + 6, l[5] + 5), (l[2] + 6, l[3] + 7)], BW[2])                              # flipper
    ex_, ey_ = x + 12, my - 10                                                                                       # eye just above the end of the mouth
    if blink: L.line([(ex_ - 3, ey_), (ex_ + 3, ey_)], BW[0])
    else:
        L.ell(ex_, ey_, 4, 4 + (emo == 'wide'), '#f0f4ff'); L.rect(ex_ - 2 + look, ey_ - 1, 3, 3, '#0a0a18'); L.px(ex_ - 1, ey_ - 2, '#ffffff')
        if emo in ('sad', 'scared'): L.line([(ex_ - 5, ey_ - 7), (ex_ + 5, ey_ - 6)], BW[0])
    for k in range(3): L.px(ex_ - 4 + k * 3, ey_ - 6, BW[0])                                                         # eyelashes
    L.ell(ex_ - 8, ey_ + 5, 3, 1, '#c88aa8')                                                                         # blush
    L.ell(x - 6, yb - 80, 4, 2, BW[0]); L.ell(x + 2, yb - 81, 4, 2, BW[0])                                         # blowhole
    ph = (t * 0.45) % 1.0
    if ph < 0.3:
        for k in range(6): L.px(x - 2 + round(math.sin(k * 2.1 + t * 3) * 3), yb - 86 - round(ph / 0.3 * 20) + k * 2, '#d8ecff')
    L.ell(x + 20, yb - 80, 12, 4, '#e8c040'); L.ell(x + 20, yb - 84, 7, 4, '#ffd860'); L.rect(x + 13, yb - 82, 14, 1, '#e04060')   # sun hat
    hp_band = ST.hp_band; hp_band(L, x - 24, x + 46, yb - 50, yb - 90, 4); ST.hp_cup(L, x + 45, yb - 46, '#ffd040', 9, 14)   # headphones
    _stamp(C, L, ay=172, dx=6)


GUESTS = {'tardigrado': tardigrado, 'axolote': axolote, 'baleia': baleia}

# ------------------------------------------------------------------ FLÁVIO, o flamingo de Miami (óculos escuros, camisa havaiana)
FL = ['#c0406a', '#f0709a', '#ff9ec0', '#ffd0e0']
def flamingo(C, t, talk, gest, emo, blink, nod=0.0, laugh=False, look=-1):
    L = Layer(108, 192); x, y = 54, 172; y += _bob(t, nod, laugh, 14); jaw = _jaw(t, talk, laugh)
    L.ell(x + 4, y - 22, 20, 18, FL[1]); L.ell(x + 16, y - 26, 10, 8, FL[0])                                     # body + wing
    L.poly([(x - 14, y - 34), (x + 20, y - 36), (x + 22, y - 10), (x - 16, y - 8)], '#2aa8c8')                   # hawaiian shirt
    for k in range(6): L.ell(x - 10 + k * 6, y - 26 + (k % 2) * 8, 2, 2, '#ffd040'); L.px(x - 8 + k * 6, y - 20 + (k % 2) * 6, '#ff6aa0')
    L.poly([(x - 2, y - 36), (x + 4, y - 28), (x + 10, y - 36)], '#ffffff')                                        # collar
    sway = round(math.sin(t * 1.6) * 2)
    neck = [(x + 2, y - 38), (x + 10 + sway, y - 56), (x + 2 + sway, y - 72), (x - 2 + sway, y - 86)]              # S-curved neck
    L.line(neck, FL[0], 7); L.line(neck, FL[1], 5)
    l, r = _limbs(gest, t, x, y, 16, 34)
    for a in (l, r): L.poly([a[0:2], a[2:4], a[4:6], (a[4] + 4, a[5] + 4), (a[2] + 4, a[3] + 5)], FL[0])          # wings as arms
    hx, hy = x - 2 + sway, y - 94 + (-2 if laugh else 0)
    L.ell(hx, hy, 10, 9, FL[2]); L.ell(hx - 3, hy - 4, 5, 3, FL[3])
    bk = [(hx - 8, hy + 2), (hx - 18, hy + 6), (hx - 20, hy + 12)]                                                 # bent beak, black tip
    L.line(bk, '#f8e8d8', 5); L.line([(hx - 17, hy + 7), (hx - 20, hy + 13)], '#1a1418', 4)
    if jaw: L.line([(hx - 9, hy + 6 + jaw // 2), (hx - 17, hy + 10 + jaw)], '#c08a7a', 2)
    if emo in ('wide', 'scared') or blink:                                                                          # shades pushed up when surprised
        L.rect(hx - 9, hy - 10, 18, 4, '#141420'); L.ell(hx - 3, hy - 1, 2, 2 + (emo == 'wide') if not blink else 0, '#ffffff') if not blink else L.line([(hx - 5, hy - 1), (hx - 1, hy - 1)], '#1a1418')
        if not blink: L.px(hx - 3, hy - 1, '#1a1418')
    else:
        L.rect(hx - 10, hy - 4, 9, 5, '#141420'); L.rect(hx + 0, hy - 4, 8, 5, '#141420'); L.line([(hx - 10, hy - 4), (hx + 9, hy - 4)], '#141420')
        L.px(hx - 8, hy - 3, '#7ad8ff'); L.px(hx + 2, hy - 3, '#7ad8ff')
    L.ell(hx + 6, hy + 4, 2, 1, '#ff5a8a')
    _headphones(L, hx + 1, hy + 1, 11, hy - 13, '#ffd040')
    _stamp(C, L, ay=172, dx=2)

GUESTS['flamingo'] = flamingo
