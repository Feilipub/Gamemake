"""Efeitos sonoros CC0 (SFXMint, CC0 1.0 — sfxmint.com / huggingface.co/datasets/flreey/sfxmint-cc0-sound-effects)."""
import os, subprocess, numpy as np
D = '/tmp/claude-0/-home-user-Gamemake/c7fa80bb-2f1a-52d8-8917-ca913c38c19e/scratchpad/sfx'
SR = 44100; _c = {}
def load(name):
    if name not in _c:
        p = next((f'{D}/{s}/{name}.mp3' for s in ('lib', 'sample') if os.path.exists(f'{D}/{s}/{name}.mp3')), None)
        if p is None: raise FileNotFoundError(name)
        raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True, check=True).stdout
        x = np.frombuffer(raw, '<i2').astype(np.float32) / 32768; _c[name] = x / max(1e-6, np.abs(x).max())
    return _c[name]
def place(buf, t, name, vol=0.3, maxdur=None, fade=0.15):
    x = load(name).copy()
    if maxdur: x = x[:int(maxdur * SR)]; f = min(len(x), int(fade * SR)); x[-f:] *= np.linspace(1, 0, f)
    i = int(t * SR); n = min(len(x), len(buf) - i)
    if n > 0 and i >= 0: buf[i:i + n] += x[:n] * vol
