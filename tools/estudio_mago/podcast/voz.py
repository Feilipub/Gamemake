"""Motor de voz do Podcast do Mago: gera cada fala (Kokoro, Apache-2.0), aplica cadeia de estúdio, e monta a conversa
com tempo humano — pausas variáveis, interrupções, reações por cima, risadas gravadas, tom de sala.
uso: python3 podcast/voz.py ep1  ->  voz_pod_ep1/conversa.wav + timeline.json"""
import os as _o, sys as _s; _s.path.insert(0, _o.path.join(_o.path.dirname(_o.path.abspath(__file__)), '..', 'lib'))  # libs do repositório
import json, os, random, subprocess, sys, importlib
import numpy as np, soundfile as sf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
import biblia as BB
SR = 44100
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
STUDIO = ("highpass=f=80,lowpass=f=12500,equalizer=f=160:t=q:w=1:g=2,equalizer=f=3200:t=q:w=1.4:g=1.8,"
          "acompressor=threshold=-21dB:ratio=3:attack=6:release=140:makeup=2")
SPD = {'wide': 1.0, 'happy': 0.98, 'curious': 0.96, 'serious': 0.95, 'mystic': 0.88, 'scared': 1.0, 'sad': 0.9, 'angry': 0.96}
PRON = [('Pixel', 'Píksel'), ('vossa mercê', 'vóssa mercê'), ('Juvenal', 'Juvenál'), ('grumete', 'gruméte'), ('Ataíde', 'Ataíde'),
        ('Caminha', 'Camínha'), ('Tupiniquim', 'Tupinikím'), ('Pascoal', 'Pascoál'), ('Dom Manuel', 'Dom Manuél'), ('Sue', 'Siú'), ('Neferu', 'Néferu'), ('Cher Ami', 'Xér Amí'), ('Wrangel', 'Vrânguel'), ('Xochimilco', 'Sotchimílco'), ('GTA 6', 'gê tê á seis'), ('GTA 5', 'gê tê á cinco')]
_K = None; _V = None


def tts(text, who, emo):
    global _K, _V
    if _K is None:
        from kokoro_onnx import Kokoro
        _K = Kokoro(os.path.join(ROOT, '..', 'tts/kokoro/kokoro-v1.0.onnx'), os.path.join(ROOT, '..', 'tts/kokoro/voices-v1.0.bin'))
    c = BB.CAST[who]; say = text
    for a, b in PRON: say = say.replace(a, b)
    v = c['voice']
    if isinstance(v, dict): v = sum(_K.get_voice_style(n) * w for n, w in v.items())
    x, sr = _K.create(say, voice=v, speed=SPD.get(emo, 0.97) * c['speed'], lang='pt-br')
    return np.asarray(x, np.float32), sr


def process(x, sr, who, tmp):
    c = BB.CAST[who]; sf.write(tmp + '_r.wav', x / max(1e-6, np.abs(x).max()) * 0.6, sr, subtype='PCM_16')
    pitch = f"rubberband=pitch={c['pitch']}:formant=preserved," if c['pitch'] != 1 else ''
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', tmp + '_r.wav', '-af', f'aresample={SR},{pitch}{STUDIO}', '-ac', '1', tmp + '.wav'], check=True)
    y, _ = sf.read(tmp + '.wav', dtype='float32'); os.remove(tmp + '_r.wav'); os.remove(tmp + '.wav')
    nz = np.nonzero(np.abs(y) > 0.01)[0]
    if len(nz): y = y[max(0, nz[0] - 400):nz[-1] + 2500]
    rms = np.sqrt((y[np.abs(y) > 0.02] ** 2).mean()) if (np.abs(y) > 0.02).any() else 0.1
    return np.clip(y * (0.2 / rms), -0.98, 0.98)


def load_sfx(name):
    for d in ('sfx/lib', 'sfx/sample'):
        p = os.path.join(ROOT, '..', d, name + '.mp3')
        if os.path.exists(p):
            pcm = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True).stdout
            return np.frombuffer(pcm, '<i2').astype(np.float32) / 32768
    raise FileNotFoundError(name)


def laugh(who, seed):
    """real recorded laugh, pitched per character, short and natural"""
    base = load_sfx('laugh-01'); r = random.Random(seed)
    st = int(r.uniform(0, max(1, len(base) - 1.6 * SR))); seg = base[st:st + int(r.uniform(0.9, 1.4) * SR)].copy()
    f = {'M': 1.0, 'J': 0.88, 'R': 0.8, 'N': 1.15, 'T': 1.22}.get(who, 1.0); tmp = os.path.join(ROOT, f'_lg{seed}.wav'); sf.write(tmp, seg, SR)
    out = tmp + '_o.wav'
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', tmp, '-af', f'rubberband=pitch={f}:formant=preserved,{STUDIO}', out], check=True)
    y, _ = sf.read(out, dtype='float32'); os.remove(tmp); os.remove(out)
    n = len(y); env = np.minimum(1, np.minimum(np.arange(n) / (0.05 * SR), (n - np.arange(n)) / (0.25 * SR)))
    return y * env * (0.11 / max(1e-6, np.sqrt((y ** 2).mean())))


def key(who, txt, emo):
    import hashlib
    return f"{who}_{hashlib.md5((who + '|' + txt + '|' + emo).encode()).hexdigest()[:12]}.npy"


def build(mod):
    E = importlib.import_module(mod); out_dir = os.path.join(ROOT, E.VOZ); os.makedirs(out_dir, exist_ok=True)
    cache = os.path.join(out_dir, 'cache'); os.makedirs(cache, exist_ok=True)
    clips = []
    for i, (who, txt, emo, gest, fl) in enumerate(E.L):
        p = os.path.join(cache, key(who, txt, emo))
        if os.path.exists(p): y = np.load(p).astype(np.float32)
        else:
            x, sr = tts(txt, who, emo); y = process(x, sr, who, os.path.join(cache, f'tmp{i}')); np.save(p, y.astype(np.float16) if getattr(E, 'HALF', False) else y)
        clips.append(y)
        if i % 20 == 0: print('fala', i, '/', len(E.L), flush=True)
    # ---- timeline with human timing
    TIGHT = getattr(E, 'TIGHT', False); gk = 0.45 if TIGHT else 1.0           # TIGHT: shorts mode, no dead air
    ev = []; t = 0.05 if TIGHT else 0.6; prev = None
    for i, ((who, txt, emo, gest, fl), y) in enumerate(zip(E.L, clips)):
        r = random.Random(i * 7 + 1); d = len(y) / SR
        if fl.get('bc') and prev is not None:                                       # reaction under the other's line
            a = prev['a'] + (prev['b'] - prev['a']) * r.uniform(0.5, 0.7)
            ev.append(dict(i=i, who=who, txt=txt, emo=emo, gest=gest, fl=fl, a=a, b=a + d, gain=0.55, bc=True)); continue
        if prev is None: gap = 0
        elif fl.get('cut'): gap = -r.uniform(0.25, 0.45)
        elif prev['who'] == who: gap = r.uniform(0.14, 0.26) * gk
        elif prev['txt'].rstrip().endswith('?'): gap = r.uniform(0.22, 0.38) * gk
        else: gap = r.uniform(0.3, 0.55) * gk
        a = max(t + gap, (prev['a'] + 0.3) if prev else 0); e = dict(i=i, who=who, txt=txt, emo=emo, gest=gest, fl=fl, a=a, b=a + d, gain=1.0, bc=False)
        ev.append(e); prev = e; t = e['b']
        if fl.get('laugh'):
            who_l = ['M', getattr(E, 'GUEST', 'J')] if fl['laugh'] == 'both' else [fl['laugh']]
            for k, wl in enumerate(who_l):
                la = t + 0.08 + k * 0.18; lg = laugh(wl, i * 10 + k)
                ev.append(dict(i=i, who=wl, txt='', emo='happy', gest='laugh', fl={}, a=la, b=la + len(lg) / SR, gain=1.0, bc=True, laugh_audio=True, _y=lg))
            t += 0.45 if TIGHT else 0.9
        t += fl.get('pause', 0)
    dur = max(e['b'] for e in ev) + (0.35 if TIGHT else 1.0); N = int(dur * SR); mix = np.zeros(N, np.float32)
    ci = 0
    for e in ev:
        y = e.pop('_y') if 'laugh_audio' in e else clips[e['i']]
        k = int(e['a'] * SR); n = min(len(y), N - k); mix[k:k + n] += y[:n] * e['gain']
    noise = np.random.default_rng(5).normal(0, 1, N).astype(np.float32)
    for _ in range(2): noise = np.convolve(noise, np.ones(8) / 8, 'same')
    mix += noise * 0.0025                                                           # room tone
    mix = np.clip(mix, -0.99, 0.99)
    sf.write(os.path.join(out_dir, 'conversa.wav'), mix, SR, subtype='PCM_16')
    json.dump(dict(dur=dur, ev=[{k: v for k, v in e.items() if k != '_y'} for e in ev]), open(os.path.join(out_dir, 'timeline.json'), 'w'), ensure_ascii=False, indent=0)
    print('DUR', round(dur, 1), 's =', round(dur / 60, 1), 'min; falas', len(E.L))
    return out_dir


if __name__ == '__main__':
    build(sys.argv[1])
