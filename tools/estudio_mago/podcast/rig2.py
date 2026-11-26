"""RIG 2 — boneco de recorte (cut-out) a partir de UM retrato ilustrado, com animação solta e com peso.
Camadas (separadas por mapa de profundidade Depth Anything V2):
  fundo limpo (personagem apagado + preenchido)  <  corpo  <  cabeça  <  ponta (chapéu/crista)  <  frente (mesa, xícaras)
Cada camada recebe sua própria transformação (girar em torno do pescoço/quadril, subir, achatar), então dá para fazer
movimentos grandes — cabeça inclinando 8°, corpo balançando, pulo de risada — sem entortar o cenário.
Os alvos de movimento passam por MOLAS (massa-mola-amortecedor) em corte4: dá atraso, exagero e acomodação
(follow-through / overlap), os princípios que fazem animação parecer viva e solta.
Rig JSON (coordenadas na imagem original 512x640):
  img, frame?, eyes[[x,y,rx,ry]], mouth[x,y,w,h], jaw?, head[x0,y0,x1,y1], neck (y da junção cabeça/corpo),
  hip [x,y] (pivô do corpo), tip_y? (abaixo disso é cabeça, acima é a ponta que balança), desk_y? (linha da mesa),
  seed [x,y] (um ponto dentro do personagem), lights[[x,y,r,"#cor"]]"""
import os as _o, sys as _s; _s.path.insert(0, _o.path.join(_o.path.dirname(_o.path.abspath(__file__)), '..', 'lib'))  # libs do repositório
import json, math, os
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter
from scipy import ndimage as nd

AW, AH = 270, 338


def _M(*ms):
    out = np.eye(3)
    for m in ms: out = out @ m
    return out
def T(x, y): return np.array([[1, 0, x], [0, 1, y], [0, 0, 1.0]])
def Rot(deg, px, py):
    a = math.radians(deg); c, s = math.cos(a), math.sin(a)
    return T(px, py) @ np.array([[c, -s, 0], [s, c, 0], [0, 0, 1.0]]) @ T(-px, -py)
def Sc(sx, sy, px, py): return T(px, py) @ np.array([[sx, 0, 0], [0, sy, 0], [0, 0, 1.0]]) @ T(-px, -py)
def warp(im, M):
    inv = np.linalg.inv(M); return im.transform(im.size, Image.AFFINE, tuple(inv[:2].ravel()), resample=Image.BICUBIC)


class Personagem:
    def __init__(self, rig_path):
        R = json.load(open(rig_path)); base = os.path.dirname(rig_path); self.R = R
        name = os.path.splitext(R['img'])[0]
        im = Image.open(os.path.join(base, R['img'])).convert('RGB'); W0, H0 = im.size
        depth = np.load(os.path.join(base, name + '_depth.npy'))
        mask = self._silhouette(depth, R)
        plate = self._plate(im, mask)
        if 'frame' in R:                                                                 # zoom/reframe: crop every layer + remap coordinates
            fx0, fy0, fx1, fy1 = R['frame']; sx, sy = W0 / (fx1 - fx0), H0 / (fy1 - fy0)
            cr = lambda I, rs=Image.LANCZOS: I.crop((fx0, fy0, fx1, fy1)).resize((W0, H0), rs)
            im, plate = cr(im), cr(plate); mask = np.asarray(cr(Image.fromarray((mask * 255).astype('uint8')), Image.BILINEAR)) / 255.0
            P = lambda x, y: ((x - fx0) * sx, (y - fy0) * sy)
            R['eyes'] = [[*P(ex, ey), rx * sx, max(1, ry * sy)] for ex, ey, rx, ry in R['eyes']]
            mx, my = P(R['mouth'][0], R['mouth'][1]); R['mouth'] = [mx, my, R['mouth'][2] * sx, R['mouth'][3] * sy]
            a = P(R['head'][0], R['head'][1]); b = P(R['head'][2], R['head'][3]); R['head'] = [a[0], a[1], b[0], b[1]]
            R['neck'] = P(0, R['neck'])[1]; R['hip'] = list(P(*R['hip']))
            if 'tip_y' in R: R['tip_y'] = P(0, R['tip_y'])[1]
            if 'desk_y' in R: R['desk_y'] = P(0, R['desk_y'])[1]
            R['lights'] = [[*P(lx, ly), lr * sx, c] for lx, ly, lr, c in R.get('lights', [])]
        enh = lambda I: ImageEnhance.Color(ImageEnhance.Contrast(I).enhance(1.08)).enhance(1.12)
        im, plate = enh(im), enh(plate); self.W, self.H = im.size
        self.pal = im.resize((AW, AH), Image.BOX).quantize(96, method=Image.Quantize.MAXCOVERAGE, kmeans=3, dither=Image.Dither.NONE)
        Y, X = np.mgrid[:self.H, :self.W].astype(np.float32); self.X, self.Y = X, Y
        desk = (Y > R['desk_y']) if 'desk_y' in R else np.zeros_like(Y, bool)
        self.front_a = (mask * desk).astype(np.float32)                                 # desk/cups: static, drawn on top
        char = mask * (~desk)
        neck = R['neck']; hz = np.clip((neck + 14 - Y) / 28.0, 0, 1)                     # soft neck seam
        tip = np.clip((R['tip_y'] + 10 - Y) / 20.0, 0, 1) if 'tip_y' in R else np.zeros_like(Y)
        self.a_body = char * (1 - hz); self.a_head = char * hz * (1 - tip); self.a_tip = char * hz * tip
        self.base = np.asarray(im).astype(np.float32) / 255; self.plate = plate
        self.lid = [((ex, ey, rx, ry), self.base[int(max(0, ey - ry - 7)), int(ex)]) for ex, ey, rx, ry in R['eyes']]
        mx, my, mw, mh = R['mouth']; jm = np.zeros((self.H, self.W), np.float32)
        jm[int(my):int(R['head'][3]), int(max(0, mx - mw * 2.2)):int(mx + mw * 2.2)] = 1; self.jawm = nd.gaussian_filter(jm, 6)[..., None]
        self.lights = [((lx, ly, lr), np.array([int(c[i:i + 2], 16) for i in (1, 3, 5)]) / 255) for lx, ly, lr, c in R.get('lights', [])]
        self.L = [np.exp(-(((X - lx) ** 2 + (Y - ly) ** 2) / (2 * lr * lr)))[..., None] for (lx, ly, lr), _ in self.lights]
        rng = np.random.default_rng(len(R['img']))
        self.motes = [(rng.uniform(0, AW), rng.uniform(0, AH * 0.8), rng.uniform(0.2, 0.6), rng.uniform(0, 6.28)) for _ in range(26)]

    @staticmethod
    def _silhouette(depth, R):
        d = (depth - depth.min()) / (depth.max() - depth.min() + 1e-6)
        bg = np.percentile(d[:40, :], 60); thr = bg + 0.18
        m = d > thr; lab, n = nd.label(m); sx, sy = R['seed']; k = lab[int(sy), int(sx)]
        m = lab == k if k else m
        if 'desk_y' in R: m |= (d > thr) & (np.mgrid[:d.shape[0], :d.shape[1]][0] > R['desk_y'])
        m = nd.binary_closing(m, iterations=2); m = nd.binary_fill_holes(m)
        return nd.gaussian_filter(m.astype(np.float32), 1.0)

    @staticmethod
    def _plate(im, mask):
        """clean background: remove the character and fill the hole (OpenCV inpaint if present, else blur fill)"""
        hole = nd.binary_dilation(mask > 0.3, iterations=8)
        try:
            import cv2
            a = cv2.inpaint(np.asarray(im)[..., ::-1].copy(), hole.astype('uint8') * 255, 9, cv2.INPAINT_TELEA)[..., ::-1]
            return Image.fromarray(a.copy())
        except Exception:
            a = np.asarray(im).astype(np.float32); w = (~hole).astype(np.float32)
            for _ in range(6):
                num = nd.gaussian_filter(a * w[..., None], (12, 12, 0)); den = nd.gaussian_filter(w, 12)[..., None] + 1e-4
                a = np.where(hole[..., None], num / den, a); w = np.maximum(w, (den[..., 0] > 0.05).astype(np.float32))
            return Image.fromarray(np.clip(a, 0, 255).astype('uint8'))

    def frame(self, t, pose):
        """pose: talk, blink, head_rot, head_dx, head_dy, body_rot, body_dy, squash, tip_rot, zoom, cam_dx, cam_dy, light"""
        R = self.R; img = self.base
        mx, my, mw, mh = R['mouth']; o = pose.get('talk', 0.0)
        if o > 0.06:                                                                     # jaw drop on the source (moves with the head)
            jd = o * mh * R.get('jaw', 0.55); jaw = nd.shift(img, (jd, 0, 0), order=1, mode='nearest')
            gap = np.exp(-(((self.X - mx) / (mw * 0.5)) ** 2 + ((self.Y - my - jd * 0.45) / max(1.5, jd * 0.6)) ** 2))[..., None]
            img = img * (1 - self.jawm) + jaw * self.jawm; img = img * (1 - gap * 0.9) + np.array([0.16, 0.05, 0.07]) * gap * 0.9
        src = Image.fromarray((np.clip(img, 0, 1) * 255).astype('uint8'))
        if pose.get('blink'):
            d = ImageDraw.Draw(src)
            for (ex, ey, rx, ry), col in self.lid:
                c = tuple(int(v * 255) for v in col); d.ellipse([ex - rx, ey - ry, ex + rx, ey + ry], fill=c)
                d.line([(ex - rx + 1, ey + ry), (ex + rx - 1, ey + ry)], fill=tuple(int(v * 160) for v in col), width=1)
        hx, hy = R['hip']; nx = (R['head'][0] + R['head'][2]) / 2; ny = R['neck']
        Mb = _M(T(0, pose.get('body_dy', 0)), Rot(pose.get('body_rot', 0), hx, hy), Sc(1 + (1 - pose.get('squash', 1)) * 0.5, pose.get('squash', 1), hx, hy))
        Mh = _M(Mb, T(pose.get('head_dx', 0), pose.get('head_dy', 0)), Rot(pose.get('head_rot', 0), nx, ny))
        ty = R.get('tip_y', ny); Mt = _M(Mh, Rot(pose.get('tip_rot', 0), nx, ty))
        out = self.plate.copy().convert('RGBA')
        for alpha, M in ((self.a_body, Mb), (self.a_head, Mh), (self.a_tip, Mt)):
            lay = src.convert('RGBA'); lay.putalpha(Image.fromarray((alpha * 255).astype('uint8'))); out.alpha_composite(warp(lay, M))
        fr = Image.fromarray(np.dstack([self.base * 255, self.front_a[..., None] * 255]).astype('uint8'), 'RGBA'); out.alpha_composite(fr)
        a = np.asarray(out.convert('RGB')).astype(np.float32) / 255
        for k, ((lx, ly, lr), col) in enumerate(self.lights):                           # living light
            fl = (0.85 + 0.1 * math.sin(t * 2.3 + k) + 0.05 * math.sin(t * 11.7 + k * 3)) * pose.get('light', 1.0)
            a = a + self.L[k] * col * 0.22 * fl
        z = pose.get('zoom', 1.0); cw, ch = self.W / z, self.H / z                        # camera on the hi-res image (smooth), then pixelize
        cx = self.W / 2 + pose.get('cam_dx', 0); cy = self.H / 2 + pose.get('cam_dy', 0)
        cx = min(max(cx, cw / 2), self.W - cw / 2); cy = min(max(cy, ch / 2), self.H - ch / 2)
        im = Image.fromarray((np.clip(a, 0, 1) * 255).astype('uint8')).resize((AW, AH), Image.BOX, box=(cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2))
        q = np.asarray(im.quantize(palette=self.pal, dither=Image.Dither.NONE).convert('RGB')).astype(np.float32) / 255
        for x0, y0, sp, ph in self.motes:
            x = int((x0 + t * sp * 5 + 3 * math.sin(t * 0.6 + ph)) % AW); y = int((y0 - t * sp * 2.5) % (AH * 0.8))
            tw = 0.25 + 0.25 * math.sin(t * 2.7 + ph); q[y, x] = q[y, x] * (1 - tw) + np.array([1.0, 0.9, 0.75]) * tw
        return Image.fromarray((q * 255).astype('uint8'))
