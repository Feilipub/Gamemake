"""Confere cada fala do episódio com reconhecimento de voz e lista as que saíram ruins."""
import os as _o, sys as _s; _s.path.insert(0, _o.path.join(_o.path.dirname(_o.path.abspath(__file__)), '..', 'lib'))  # libs do repositório
import sys, os, glob, re, difflib, importlib, numpy as np
from scipy.signal import resample_poly
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from faster_whisper import WhisperModel
E = importlib.import_module(sys.argv[1]); ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
only = set(int(x) for x in sys.argv[2:])
WM = WhisperModel('small', device='cpu', compute_type='int8')
def norm(s): return re.sub(r'[^a-zà-ú0-9 ]', '', s.lower().replace('pra ', 'para ').replace('tá ', 'está ').replace('tô ', 'estou ')).split()
bad = []; scores = []
for i, (who, txt, emo, gest, fl) in enumerate(E.L):
    if only and i not in only: continue
    import voz as VZ
    p = os.path.join(ROOT, E.VOZ, 'cache', VZ.key(who, txt, emo))
    if not os.path.exists(p): continue
    y = np.load(p).astype(np.float32); x = resample_poly(y, 160, 441).astype('float32')
    hyp = ' '.join(s.text for s in WM.transcribe(x, language='pt')[0])
    r = difflib.SequenceMatcher(None, norm(txt), norm(hyp)).ratio(); scores.append(r)
    if r < 0.85:
        bad.append((i, who, round(r, 2), txt, hyp.strip())); print('BAIXA', bad[-1], flush=True)
print('MEDIA', round(float(np.mean(scores)), 3), 'falas', len(scores))

