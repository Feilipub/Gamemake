"""ANIM — biblioteca de animação do Mago Pixel (repositório de animações reutilizável em todos os episódios).

  Curvas (easing) ....... linear, in/out quad/cubic/sine, back (passa e volta), elastic (mola), bounce (quica)
  Track ................. quadros-chave: Track([(t, valor, curva), ...]).at(t) — valores numéricos ou tuplas
  Movimentos ............ hop (pulo com achata-estica), arc (trajetória em arco), sway, bob, walk_x (andar de A até B)
  Atuador ............... stamp(): desenha qualquer sprite num canvas temporário e cola no mundo com
                          escala X/Y (achata-estica), rotação, espelho, transparência e âncora nos pés
  Partículas ............ burst / emit determinísticos (fumaça, faíscas, poeira, corações, estrelas)
  Câmera ................ Camera: plano geral, close, plano duplo e acompanhamento, com transição suave, limites
                          no cenário (nunca mostra fora do mapa) e tremor amortecido
"""
import math, random
import numpy as np
from PIL import Image, ImageDraw
from px import Canvas, hexc

TAU = math.pi * 2


# ------------------------------------------------------------------ easing
def clamp(x, a=0.0, b=1.0): return a if x < a else (b if x > b else x)
def lerp(a, b, p): return a + (b - a) * p
def linear(p): return clamp(p)
def in_quad(p): p = clamp(p); return p * p
def out_quad(p): p = clamp(p); return 1 - (1 - p) * (1 - p)
def in_out_quad(p): p = clamp(p); return 2 * p * p if p < 0.5 else 1 - (-2 * p + 2) ** 2 / 2
def in_cubic(p): p = clamp(p); return p ** 3
def out_cubic(p): p = clamp(p); return 1 - (1 - p) ** 3
def in_out_cubic(p): p = clamp(p); return 4 * p ** 3 if p < 0.5 else 1 - (-2 * p + 2) ** 3 / 2
def in_out_sine(p): p = clamp(p); return -(math.cos(math.pi * p) - 1) / 2
def smooth(p): p = clamp(p); return p * p * (3 - 2 * p)
def out_back(p, s=1.7): p = clamp(p) - 1; return 1 + p * p * ((s + 1) * p + s)
def in_back(p, s=1.7): p = clamp(p); return p * p * ((s + 1) * p - s)
def out_elastic(p):
    p = clamp(p)
    if p in (0, 1): return p
    return 2 ** (-10 * p) * math.sin((p * 10 - 0.75) * TAU / 3) + 1
def out_bounce(p):
    p = clamp(p); n, d = 7.5625, 2.75
    if p < 1 / d: return n * p * p
    if p < 2 / d: p -= 1.5 / d; return n * p * p + 0.75
    if p < 2.5 / d: p -= 2.25 / d; return n * p * p + 0.9375
    p -= 2.625 / d; return n * p * p + 0.984375
EASE = dict(linear=linear, in_quad=in_quad, out_quad=out_quad, in_out_quad=in_out_quad, in_cubic=in_cubic, out_cubic=out_cubic, in_out_cubic=in_out_cubic,
            sine=in_out_sine, smooth=smooth, out_back=out_back, in_back=in_back, elastic=out_elastic, bounce=out_bounce)


def prog(t, t0, dur, ease='smooth'):
    """0..1 progress of an animation that starts at t0 and lasts dur, passed through an easing curve"""
    return EASE[ease]((t - t0) / max(1e-6, dur))


class Track:
    """keyframes [(time, value, ease_into_this_key)]; value may be a number or tuple"""
    def __init__(s, keys): s.k = sorted(keys, key=lambda k: k[0])
    def at(s, t):
        k = s.k
        if t <= k[0][0]: return k[0][1]
        for (t0, v0, *_), (t1, v1, *e) in zip(k, k[1:]):
            if t < t1:
                p = EASE[e[0] if e else 'smooth']((t - t0) / max(1e-6, t1 - t0))
                return tuple(lerp(a, b, p) for a, b in zip(v0, v1)) if isinstance(v0, tuple) else lerp(v0, v1, p)
        return k[-1][1]


# ------------------------------------------------------------------ motions
def hop(t, t0, dur=0.5, h=12):
    """(dy, sx, sy): jump arc with anticipation squash, stretch in the air, squash on landing"""
    u = (t - t0) / dur
    if u < -0.15 or u > 1.2: return 0, 1.0, 1.0
    if u < 0: q = (u + 0.15) / 0.15; return 0, 1 + 0.12 * q, 1 - 0.14 * q                    # anticipation
    if u <= 1: dy = -h * 4 * u * (1 - u); st = 1 + 0.12 * math.sin(u * math.pi); return dy, 1 / st, st
    q = 1 - (u - 1) / 0.2; return 0, 1 + 0.16 * q, 1 - 0.18 * q                               # landing squash


def arc(p, a, b, h):
    """point along a parabola from a to b with apex height h"""
    return lerp(a[0], b[0], p), lerp(a[1], b[1], p) - h * 4 * p * (1 - p)


def walk_x(t, t0, dur, x0, x1):
    """x position + walk phase (None when standing) + facing for walking from x0 to x1"""
    if t < t0: return x0, None, 1 if x1 >= x0 else -1
    if t > t0 + dur: return x1, None, 1 if x1 >= x0 else -1
    p = in_out_sine((t - t0) / dur); return lerp(x0, x1, p), (t - t0) * 1.7, 1 if x1 >= x0 else -1


def bob(t, f=2.0, a=1.0, ph=0.0): return math.sin(t * f * TAU / 2 + ph) * a
def sway(t, f=0.6, a=3.0, ph=0.0): return math.sin(t * f * TAU + ph) * a


# ------------------------------------------------------------------ actor stamping
KEY = (255, 0, 254)


def stamp(world, draw, wx, wy, ax=54, ay=170, sx=1.0, sy=1.0, rot=0.0, flip=False, alpha=1.0, size=(108, 192)):
    """draw(tmp_canvas, ax, ay) renders a sprite with its anchor at (ax, ay) on a temporary canvas;
    the result is scaled (sx, sy), rotated (deg, around the anchor), mirrored and pasted so the anchor lands at (wx, wy)."""
    tmp = Canvas(*size); tmp.im.paste(KEY, (0, 0, size[0], size[1])); tmp.d = ImageDraw.Draw(tmp.im)
    draw(tmp, ax, ay)
    a = np.asarray(tmp.im); m = np.any(a != KEY, axis=2)
    if not m.any(): return
    rgba = np.dstack([a, (m * 255).astype('uint8')]); im = Image.fromarray(rgba, 'RGBA')
    if flip: im = im.transpose(Image.FLIP_LEFT_RIGHT); ax = size[0] - 1 - ax
    if sx != 1 or sy != 1:
        nw, nh = max(1, round(size[0] * sx)), max(1, round(size[1] * sy)); im = im.resize((nw, nh), Image.NEAREST); ax, ay = ax * nw / size[0], ay * nh / size[1]
    if rot:
        im = im.rotate(rot, resample=Image.NEAREST, center=(ax, ay))
    if alpha < 1:
        al = np.asarray(im)[:, :, 3].astype(float) * alpha; th = (np.indices(al.shape).sum(0) % 2) * 0.5 + 0.25
        im.putalpha(Image.fromarray(np.where(al / 255 > th, 255, 0).astype('uint8')))
    base = world.im.convert('RGBA'); base.alpha_composite(im, (round(wx - ax), round(wy - ay))) if (wx - ax >= 0 and wy - ay >= 0) else _paste_any(base, im, round(wx - ax), round(wy - ay))
    world.im = base.convert('RGB'); world.d = ImageDraw.Draw(world.im)


def _paste_any(base, im, x, y):
    cx, cy = max(0, -x), max(0, -y)
    if cx >= im.width or cy >= im.height: return
    base.alpha_composite(im.crop((cx, cy, im.width, im.height)), (x + cx, y + cy))


# ------------------------------------------------------------------ particles
def burst(C, t, t0, x, y, n=20, cols=('#ffffff',), speed=40, life=1.0, grav=60, seed=0, size=1):
    u = t - t0
    if not (0 <= u < life): return
    r = random.Random(seed)
    for k in range(n):
        a = r.uniform(0, TAU); v = r.uniform(0.3, 1) * speed; px = x + math.cos(a) * v * u; py = y + math.sin(a) * v * u * 0.8 + grav * u * u
        c = cols[k % len(cols)] if u < life * 0.7 else '#ffffff'
        if size > 1 and u < life * 0.5: C.rect(round(px), round(py), size, size, c)
        else: C.px(round(px), round(py), c)


def emit(C, t, x, y, rate=6, life=1.5, vx=0, vy=-14, spread=4, grow=2.5, cols=('#8a8490',), seed=0, shape='puff'):
    """continuous emitter (smoke, steam, embers) — deterministic in t"""
    n = int(rate * life)
    for k in range(n):
        ph = ((t + k / rate) % life) / life; r = random.Random(seed * 1000 + k)
        px = x + vx * ph * life + r.uniform(-spread, spread) * ph + math.sin(t * 2 + k) * 1.5; py = y + vy * ph * life
        c = cols[k % len(cols)]
        if shape == 'puff': rad = round(1 + ph * grow); C.ell(round(px), round(py), rad, rad, c)
        else: C.px(round(px), round(py), c)


def heart(C, x, y, c='#ff4070', c2='#ff9ab4'):
    for dx, dy in ((-1, 0), (1, 0), (0, 1), (-2, -1), (2, -1), (-1, -1), (1, -1), (0, 2)): C.px(x + dx, y + dy, c)
    C.px(x - 1, y - 1, c2)


def hearts(C, t, x, y, n=5, h=30):
    for k in range(n):
        ph = (t * 0.6 + k / n) % 1; heart(C, x + round(math.sin(t * 2 + k * 2) * 10), y - round(ph * h))


def stars_ring(C, t, x, y, r=8, n=3, c='#ffe060'):
    for k in range(n):
        a = t * 5 + k * TAU / n; sx, sy = x + round(math.cos(a) * r), y + round(math.sin(a) * r * 0.35)
        C.px(sx, sy, c); C.px(sx - 1, sy, c); C.px(sx + 1, sy, c); C.px(sx, sy - 1, c); C.px(sx, sy + 1, c)


# ------------------------------------------------------------------ camera
class Camera:
    """world W x H. shot = ('wide',) | ('close', (hx, hy)) | ('two', (x1,y1), (x2,y2)) | ('track', (x, y), zoom) | ('frame', (cx, cy), zoom).
    view(t) blends from the previous shot to the current one with an easing curve; always clamped inside the world."""
    def __init__(s, W, H, close_zoom=1.9): s.W, s.H, s.cz = W, H, close_zoom

    def target(s, shot):
        k = shot[0]
        if k == 'wide': return s.W / 2, s.H / 2, 1.0
        if k == 'close': z = s.cz; hx, hy = shot[1]; return hx, hy + s.H / z * 0.08, z
        if k == 'two':
            (x1, y1), (x2, y2) = shot[1], shot[2]; dx = abs(x2 - x1) + 90; dy = abs(y2 - y1) + 70
            z = clamp(min(s.W / dx, s.H / dy), 1.0, 1.6); return (x1 + x2) / 2, (y1 + y2) / 2 + s.H / z * 0.06, z
        if k in ('track', 'frame'): return shot[1][0], shot[1][1], shot[2]
        return s.W / 2, s.H / 2, 1.0

    def clamp_view(s, cx, cy, z):
        w, h = s.W / z, s.H / z; cx = clamp(cx, w / 2, s.W - w / 2); cy = clamp(cy, h / 2, s.H - h / 2); return cx, cy, z

    def blend(s, a, b, p):
        a = s.clamp_view(*a); b = s.clamp_view(*b); return s.clamp_view(lerp(a[0], b[0], p), lerp(a[1], b[1], p), lerp(a[2], b[2], p))

    def render(s, world_im, view, shake=0.0, t=0.0):
        cx, cy, z = view; w, h = s.W / z, s.H / z
        if shake:
            r = random.Random(int(t * 30)); cx += r.uniform(-1, 1) * shake; cy += r.uniform(-1, 1) * shake
            cx, cy, z = s.clamp_view(cx, cy, z)
        box = (cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2)
        return world_im.resize((s.W, s.H), Image.NEAREST, box=box)


def vignette_mask(W, H, strength=0.45):
    yy, xx = np.mgrid[0:H, 0:W]; v = np.hypot((xx - W / 2) / (W / 2), (yy - H / 2) / (H / 2))
    return np.clip(1.08 - v * strength, 0.35, 1)[..., None].astype(np.float32)
