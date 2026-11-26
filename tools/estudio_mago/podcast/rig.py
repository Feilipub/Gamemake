"""RIG — anima um retrato ilustrado (gerado por IA) como personagem vivo, mantendo o visual de pixel art.
A animação acontece na imagem em alta (512x640, movimentos suaves) e cada quadro é pixelizado com a paleta fixa do
personagem (270x338 px de arte), então os movimentos ficam "presos" na grade de pixels, como em pixel art feita à mão.
Movimentos: piscar, boca falando (abertura vem do volume real da voz), respiração, balanço da cabeça (acena, ri),
luz viva (neon pulsando, vela tremulando) e poeira no ar.
O rig de cada personagem é um JSON em elenco/<nome>.json:
  {"img": "...png", "eyes": [[x, y, rx, ry], ...], "mouth": [x, y, w, h], "head": [x0, y0, x1, y1], "neck": y,
   "lid": [r, g, b] (opcional), "lights": [[x, y, r, "#cor"], ...]}   (coordenadas na imagem 512x640)"""
import os as _o, sys as _s; _s.path.insert(0, _o.path.join(_o.path.dirname(_o.path.abspath(__file__)), '..', 'lib'))  # libs do repositório
import json, math, os
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance
from scipy import ndimage as nd

AW, AH = 270, 338                                                    # art-pixel grid (x4 = 1080x1352)


def _feather(mask, r):
    return nd.gaussian_filter(mask.astype(np.float32), r)


class Personagem:
    def __init__(self, rig_path):
        R = json.load(open(rig_path)); base = os.path.dirname(rig_path); self.R = R
        im = Image.open(os.path.join(base, R['img'])).convert('RGB')
        if 'frame' in R:                                                                 # reframe (zoom) and remap the rig coordinates
            fx0, fy0, fx1, fy1 = R['frame']; sx, sy = im.width / (fx1 - fx0), im.height / (fy1 - fy0); W0, H0 = im.size
            im = im.crop((fx0, fy0, fx1, fy1)).resize((W0, H0), Image.LANCZOS)
            P = lambda x, y: (round((x - fx0) * sx), round((y - fy0) * sy))
            R['eyes'] = [[*P(ex, ey), round(rx * sx), max(1, round(ry * sy))] for ex, ey, rx, ry in R['eyes']]
            mx, my = P(R['mouth'][0], R['mouth'][1]); R['mouth'] = [mx, my, round(R['mouth'][2] * sx), round(R['mouth'][3] * sy)]
            hx0, hy0 = P(R['head'][0], R['head'][1]); hx1, hy1 = P(R['head'][2], R['head'][3]); R['head'] = [max(0, hx0), max(0, hy0), min(W0, hx1), min(H0, hy1)]
            R['neck'] = P(0, R['neck'])[1]; R['lights'] = [[*P(lx, ly), round(lr * sx), c] for lx, ly, lr, c in R.get('lights', [])]
        im = ImageEnhance.Contrast(im).enhance(1.08); im = ImageEnhance.Color(im).enhance(1.12)
        self.hi = np.asarray(im).astype(np.float32) / 255; self.H, self.W = self.hi.shape[:2]
        small = im.resize((AW, AH), Image.BOX)
        self.pal = small.quantize(96, method=Image.Quantize.MAXCOVERAGE, kmeans=3, dither=Image.Dither.NONE)   # fixed palette per character
        Y, X = np.mgrid[:self.H, :self.W]; self.Y, self.X = Y, X
        x0, y0, x1, y1 = R['head']; hm = np.zeros((self.H, self.W)); hm[y0:y1, x0:x1] = 1; self.headm = _feather(hm, 14)[..., None]
        bm = (Y > R['neck']).astype(np.float32); self.bodym = _feather(bm, 10)[..., None]
        self.lid = []
        for (ex, ey, rx, ry) in R['eyes']:
            col = np.array(R['lid']) / 255 if 'lid' in R else self.hi[max(0, ey - ry - 7), ex]
            self.lid.append(((ex, ey, rx, ry), col))
        mx, my, mw, mh = R['mouth']; jm = np.zeros((self.H, self.W)); jm[my:y1, max(0, mx - int(mw * 2.2)):mx + int(mw * 2.2)] = 1
        self.jawm = _feather(jm, 6)[..., None]
        self.lights = [((lx, ly, lr), np.array([int(c[i:i + 2], 16) for i in (1, 3, 5)]) / 255) for lx, ly, lr, c in R.get('lights', [])]
        self.L = [np.exp(-(((X - lx) ** 2 + (Y - ly) ** 2) / (2 * lr * lr)))[..., None] for (lx, ly, lr), _ in self.lights]
        rng = np.random.default_rng(len(R['img']))
        self.motes = [(rng.uniform(0, AW), rng.uniform(0, AH * 0.8), rng.uniform(0.2, 0.6), rng.uniform(0, 6.28)) for _ in range(26)]

    def frame(self, t, talk=0.0, blink=False, nod=0.0, laugh=False, lean=0.0, light=1.0):
        """talk: 0..1 abertura da boca; nod: fase 0..1 de aceno; laugh: sacode; lean: inclina p/ frente (0..1)"""
        img = self.hi
        # breathing: body rises/expands slightly (sub-pixel on the hi-res image)
        br = (0.5 - 0.5 * math.cos(t * 2 * math.pi / 3.6)) * 2.2
        dyb = -br - lean * 3
        # head: idle drift + nod + laugh shake + follows the breath
        hx = 1.2 * math.sin(t * 0.7) + 0.6 * math.sin(t * 1.9 + 1)
        hy = dyb * 1.2 + 2.0 * math.sin(nod * 2 * math.pi) + (1.6 * abs(math.sin(t * 15)) if laugh else 0) + 0.6 * math.sin(t * 1.3)
        body = nd.shift(img, (dyb, 0, 0), order=1, mode='nearest')
        head = nd.shift(img, (hy, hx, 0), order=1, mode='nearest')
        out = img * (1 - self.bodym) + body * self.bodym
        out = out * (1 - self.headm) + head * self.headm
        mx, my, mw, mh = self.R['mouth']
        o = max(0.0, min(1.0, talk)) if not laugh else 0.55 + 0.35 * abs(math.sin(t * 14))
        if o > 0.06:                                                                     # jaw drop: chin/beard slides down, dark gap opens
            jd = o * mh * self.R.get('jaw', 0.55)
            jaw = nd.shift(out, (jd, 0, 0), order=1, mode='nearest')
            gap = np.exp(-(((self.X - mx - hx) / (mw * 0.5)) ** 2 + ((self.Y - my - hy - jd * 0.45) / max(1.5, jd * 0.6)) ** 2))[..., None]
            out = out * (1 - self.jawm) + jaw * self.jawm
            out = out * (1 - gap * 0.9) + np.array([0.16, 0.05, 0.07]) * gap * 0.9
        pim = Image.fromarray((np.clip(out, 0, 1) * 255).astype('uint8')); d = ImageDraw.Draw(pim)
        ox, oy = hx, hy
        # blink
        if blink:
            for (ex, ey, rx, ry), col in self.lid:
                c = tuple(int(v * 255) for v in col)
                d.ellipse([ex + ox - rx, ey + oy - ry, ex + ox + rx, ey + oy + ry], fill=c)
                d.line([(ex + ox - rx + 1, ey + oy + ry), (ex + ox + rx - 1, ey + oy + ry)], fill=tuple(int(v * 160) for v in col), width=1)
        out = np.asarray(pim).astype(np.float32) / 255
        # living light
        for k, ((lx, ly, lr), col) in enumerate(self.lights):
            fl = (0.85 + 0.1 * math.sin(t * 2.3 + k) + 0.05 * math.sin(t * 11.7 + k * 3)) * light
            out = out + self.L[k] * col * 0.22 * fl
        # pixelize with the character's fixed palette
        small = Image.fromarray((np.clip(out, 0, 1) * 255).astype('uint8')).resize((AW, AH), Image.BOX)
        q = small.quantize(palette=self.pal, dither=Image.Dither.NONE).convert('RGB')
        a = np.asarray(q).astype(np.float32) / 255
        for x0, y0, sp, ph in self.motes:                                              # dust motes drifting in the light
            x = int((x0 + t * sp * 5 + 3 * math.sin(t * 0.6 + ph)) % AW); y = int((y0 - t * sp * 2.5) % (AH * 0.8))
            tw = 0.25 + 0.25 * math.sin(t * 2.7 + ph); a[y, x] = a[y, x] * (1 - tw) + np.array([1.0, 0.9, 0.75]) * tw
        return Image.fromarray((a * 255).astype('uint8'))
