import os
"""Trilhas v2 (MIDI -> FluidSynth): arranjos com seções A/B, bateria completa, baixo, contracanto, viradas,
humanização e pós-produção (reverb de convolução + largura estéreo). Todas originais."""
import random, subprocess, wave
import numpy as np
import pretty_midi as pm
SF = '/usr/share/sounds/sf2/FluidR3_GM.sf2'
SR = 44100


class Song:
    def __init__(s, bpm, seed=1):
        s.M = pm.PrettyMIDI(initial_tempo=bpm); s.b = 60 / bpm; s.r = random.Random(seed); s.ins = {}

    def I(s, name, prog, drum=False):
        if name not in s.ins:
            i = pm.Instrument(program=prog, is_drum=drum, name=name); s.M.instruments.append(i); s.ins[name] = i
        return s.ins[name]

    def n(s, name, pitch, beat, length, vel=80, hum=True):
        i = s.ins[name]; b = s.b
        jt = s.r.uniform(-0.012, 0.012) if hum else 0; jv = s.r.randint(-6, 6) if hum else 0
        st = max(0, beat * b + jt); i.notes.append(pm.Note(velocity=int(max(1, min(127, vel + jv))), pitch=int(pitch), start=st, end=st + max(0.05, length * b)))

    def chord(s, name, notes, beat, length, vel=60):
        for k, p in enumerate(notes): s.n(name, p, beat + k * 0.01, length, vel)


# drum kit note numbers
KICK, SNARE, HAT, OHAT, RIDE, CRASH, TOM_L, TOM_H, CLAP, SHAKER, TAMB = 36, 38, 42, 46, 51, 49, 45, 50, 39, 70, 54


def kit(S, bar, style, vel=1.0, fill=False):
    B = bar * 4
    if style == 'pop':
        for k in (0, 2.5): S.n('dr', KICK, B + k, 0.2, 95 * vel)
        for k in (1, 3): S.n('dr', SNARE, B + k, 0.2, 80 * vel)
        for k in range(8): S.n('dr', HAT, B + k / 2, 0.1, (60 if k % 2 else 75) * vel)
    elif style == 'light':
        S.n('dr', KICK, B, 0.2, 70 * vel); S.n('dr', KICK, B + 2.5, 0.2, 55 * vel); S.n('dr', CLAP, B + 3, 0.2, 55 * vel)
        for k in range(8): S.n('dr', SHAKER, B + k / 2, 0.1, (40 if k % 2 else 55) * vel)
    elif style == 'epic':
        for k in (0, 1.5, 2, 3.5): S.n('dr', TOM_L, B + k, 0.3, 90 * vel)
        S.n('dr', KICK, B, 0.3, 100 * vel); S.n('dr', SNARE, B + 3, 0.2, 70 * vel)
    elif style == 'darbuka':
        for k, v in ((0, 90), (1.5, 70), (2, 80), (2.75, 55), (3, 70), (3.5, 60)): S.n('dr', TOM_H if v < 75 else TOM_L, B + k, 0.15, v * vel)
        for k in range(8): S.n('dr', TAMB, B + k / 2, 0.1, 40 * vel)
    elif style == 'pulse':
        for k in range(4): S.n('dr', KICK, B + k, 0.2, 70 * vel)
        S.n('dr', 75, B + 3.5, 0.1, 50 * vel)
    if fill:
        for k in range(4): S.n('dr', [TOM_H, TOM_H, TOM_L, TOM_L][k], B + 3 + k / 4, 0.1, 85 * vel)
    if bar % 8 == 0 and style in ('pop', 'epic'): S.n('dr', CRASH, B, 1, 70 * vel)


def _bars(dur, S): return int(dur / (4 * S.b)) + 2


# --------------------------------------------------------------------------- songs
def tema(dur):
    """Tema do canal — épico/mágico (D menor -> F maior), 96 bpm."""
    S = Song(96, 11); S.I('str', 48); S.I('brass', 61); S.I('horn', 60); S.I('harp', 46); S.I('choir', 52); S.I('bass', 33); S.I('cel', 8); S.I('dr', 0, True); S.I('timp', 47)
    prog = [[50, 57, 62, 65], [46, 53, 58, 62], [48, 55, 60, 64], [45, 52, 57, 61]]       # Dm Bb C A
    mA = [74, 72, 69, 72, 74, 77, 76, 74, 70, 72, 74, 72, 69, 67, 69, 73]
    mB = [77, 76, 74, 72, 74, 76, 77, 79, 81, 79, 77, 76, 74, 73, 74, 76]
    for bar in range(_bars(dur, S)):
        ch = prog[bar % 4]; B = bar * 4; sec = (bar // 8) % 2; big = bar >= 4
        S.chord('str', ch, B, 4, 55 if not big else 68)
        for k in range(8): S.n('harp', ch[k % 4] + 12 + (12 if k >= 4 else 0), B + k / 2, 0.6, 55)
        S.n('bass', ch[0] - 12, B, 1.5, 85); S.n('bass', ch[0] - 12, B + 1.5, 0.5, 70); S.n('bass', ch[2] - 12, B + 2, 2, 80)
        if big:
            m = (mA if sec == 0 else mB)[(bar % 4) * 4:(bar % 4) * 4 + 4]
            for k, p in enumerate(m): S.n('horn' if sec == 0 else 'brass', p - 12, B + k, 0.95, 82)
            if sec: S.chord('choir', [p + 12 for p in ch[1:]], B, 4, 45)
            kit(S, bar, 'epic', 0.9, fill=bar % 8 == 7)
            S.n('timp', ch[0] - 12 if ch[0] > 48 else ch[0], B, 1, 75)
        for k in range(4): S.n('cel', ch[(k * 2) % 4] + 24, B + k + 0.5, 0.4, 35)
    return S.M


def ciencia(dur):
    """Curiosidade/ciência — pizzicato, marimba, baixo pulsante, beat leve (C maior), 116 bpm."""
    S = Song(116, 21); S.I('pz', 45); S.I('mar', 12); S.I('bass', 38); S.I('pad', 89); S.I('cl', 71); S.I('glock', 9); S.I('dr', 0, True)
    prog = [[48, 55, 64, 67], [45, 52, 60, 64], [41, 48, 57, 64], [43, 50, 59, 62]]       # C Am F G
    mel = [76, 79, 81, 79, 77, 76, 74, 72, 74, 76, 79, 76, 74, 72, 71, 74]
    for bar in range(_bars(dur, S)):
        ch = prog[bar % 4]; B = bar * 4; part = (bar // 8) % 3
        S.chord('pad', ch, B, 4, 38)
        for k in range(8): S.n('mar', ch[[0, 2, 1, 3, 2, 1, 3, 2][k]] + 12, B + k / 2, 0.4, 62)
        for k in (0, 1.5, 2, 3, 3.5): S.n('bass', ch[0] - 12 + (12 if k == 3.5 else 0), B + k, 0.4, 82)
        if part >= 1:
            for k in range(4): S.n('pz', mel[(bar % 4) * 4 + k], B + k, 0.4, 70)
        if part == 2:
            for k in range(4): S.n('cl', mel[(bar % 4) * 4 + k] - 12, B + k, 0.9, 55)
            S.n('glock', mel[(bar % 4) * 4] + 12, B, 1, 45)
        kit(S, bar, 'light' if part == 0 else 'pop', 0.65 if part else 0.8, fill=bar % 8 == 7)
    return S.M


def viagem(dur):
    """Viagem pela faixa do eclipse — Espanha/Norte da África/Egito: frígio dominante, violão + cordas + darbuka, 100 bpm."""
    S = Song(100, 31); S.I('gt', 24); S.I('str', 49); S.I('oud', 105); S.I('fl', 73); S.I('bass', 32); S.I('dr', 0, True)
    prog = [[52, 56, 59], [53, 57, 60], [52, 56, 59], [50, 53, 57]]                         # E F E Dm (andaluz/frígio)
    mel = [64, 65, 68, 69, 71, 69, 68, 65, 64, 65, 64, 62, 60, 62, 64, 64]
    for bar in range(_bars(dur, S)):
        ch = prog[bar % 4]; B = bar * 4; part = (bar // 8) % 2
        for k in range(8): S.n('gt', ch[[0, 1, 2, 1, 0, 2, 1, 2][k]] + 12, B + k / 2, 0.5, 66 if k % 2 == 0 else 52)
        S.n('bass', ch[0] - 12, B, 2, 80); S.n('bass', ch[0] - 12, B + 2.5, 1.5, 70)
        S.chord('str', [p + 12 for p in ch], B, 4, 42 + part * 10)
        lead = 'oud' if part == 0 else 'fl'
        for k in range(4):
            p = mel[(bar % 4) * 4 + k] + (12 if lead == 'fl' else 0); S.n(lead, p, B + k, 0.5, 72)
            if k % 2: S.n(lead, p - 1 if p % 12 in (5, 9) else p + 1, B + k + 0.5, 0.4, 58)
        kit(S, bar, 'darbuka', 0.85)
    return S.M


def antigo(dur):
    """História antiga — tambores de guerra, cordas graves, flauta pentatônica, 88 bpm."""
    S = Song(88, 41); S.I('str', 48); S.I('fl', 77); S.I('koto', 107); S.I('bass', 43); S.I('choir', 52); S.I('dr', 0, True); S.I('taiko', 116)
    prog = [[45, 52, 57], [43, 50, 55], [41, 48, 53], [43, 50, 55]]                         # Am G F G
    pent = [69, 72, 74, 76, 79, 76, 74, 72, 69, 67, 69, 72, 74, 72, 69, 69]
    for bar in range(_bars(dur, S)):
        ch = prog[bar % 4]; B = bar * 4; part = (bar // 8) % 2
        S.chord('str', ch, B, 4, 55); S.n('bass', ch[0] - 12, B, 4, 70)
        for k in range(8): S.n('koto', ch[k % 3] + 12 + (12 if k > 4 else 0), B + k / 2, 0.4, 50)
        for k, v in ((0, 105), (1.5, 80), (2, 95), (3, 85), (3.5, 70)): S.n('taiko', 41 if v > 90 else 45, B + k, 0.5, v)
        if part:
            for k in range(4): S.n('fl', pent[(bar % 4) * 4 + k] + 12, B + k, 0.9, 70)
            S.chord('choir', [p + 12 for p in ch], B, 4, 40)
        kit(S, bar, 'epic', 0.6, fill=bar % 8 == 7)
    return S.M


def cosmos(dur):
    """Cosmos/eclipse — pads, arpejo de sintetizador, coral, sinos, 72 bpm, sem bateria pesada."""
    S = Song(72, 51); S.I('pad', 91); S.I('arp', 81); S.I('choir', 52); S.I('bell', 14); S.I('bass', 38); S.I('str', 49); S.I('dr', 0, True)
    prog = [[45, 52, 57, 60, 64], [41, 48, 53, 57, 60], [48, 55, 60, 64, 67], [43, 50, 55, 59, 62]]   # Am F C G
    for bar in range(_bars(dur, S)):
        ch = prog[bar % 4]; B = bar * 4; part = (bar // 4) % 3
        S.chord('pad', ch, B, 4, 50); S.n('bass', ch[0] - 12, B, 4, 65)
        for k in range(16): S.n('arp', ch[[0, 2, 4, 3, 1, 3, 4, 2][k % 8]] + 12, B + k / 4, 0.22, 38 + (k % 4 == 0) * 12)
        if part >= 1: S.chord('choir', [p + 12 for p in ch[1:4]], B, 4, 42)
        if part == 2: S.chord('str', [p + 12 for p in ch[2:]], B, 4, 45)
        S.n('bell', ch[4] + 12, B, 2, 40); S.n('bell', ch[3] + 12, B + 2, 2, 32)
        S.n('dr', 81, B + 3.5, 0.3, 25)
    return S.M


def tensao(dur):
    """Perigo/atenção — ostinato de cordas graves, pulso, metais, 92 bpm."""
    S = Song(92, 61); S.I('str', 48); S.I('vc', 42); S.I('brass', 61); S.I('pad', 95); S.I('dr', 0, True); S.I('timp', 47)
    prog = [[45, 52, 57], [45, 52, 57], [46, 53, 58], [44, 51, 56]]                         # Am Am Bb G#dim-ish
    for bar in range(_bars(dur, S)):
        ch = prog[bar % 4]; B = bar * 4
        for k in range(8): S.n('vc', ch[0] - 12 + (12 if k in (3, 6) else 0), B + k / 2, 0.4, 78)
        S.chord('pad', ch, B, 4, 40)
        if bar % 2: S.chord('brass', [p for p in ch], B + 2, 2, 55)
        kit(S, bar, 'pulse', 0.9); S.n('timp', 45, B, 1, 70)
    return S.M


SONGS = {'tema': tema, 'ciencia': ciencia, 'viagem': viagem, 'antigo': antigo, 'cosmos': cosmos, 'tensao': tensao}

def trap(dur):
    """Beat hip-hop/trap divertido (original): 808, chimbal rápido, palmas, sino mágico, 140 bpm (meio-tempo)."""
    S = Song(140, 71); S.I('bass', 38); S.I('bell', 10); S.I('pad', 89); S.I('pluck', 45); S.I('dr', 0, True)
    prog = [[49, 56, 61, 64], [45, 52, 57, 61], [47, 54, 59, 63], [44, 51, 56, 59]]          # C#m A B G#m
    mel = [73, 76, 78, 76, 73, 71, 73, 68, 73, 76, 80, 78, 76, 73, 71, 73]
    for bar in range(_bars(dur, S)):
        ch = prog[bar % 4]; B = bar * 4; part = (bar // 4) % 2
        S.chord('pad', ch, B, 4, 38)
        for k, ln in ((0, 1.5), (1.5, 0.5), (2.5, 1.5)): S.n('bass', ch[0] - 24 + 12, B + k, ln, 100)
        S.n('dr', 36, B, 0.2, 105); S.n('dr', 36, B + 1.5, 0.2, 90); S.n('dr', 36, B + 2.75, 0.2, 85)
        S.n('dr', 39, B + 1, 0.2, 90); S.n('dr', 39, B + 3, 0.2, 95); S.n('dr', 38, B + 3, 0.2, 60)
        for k in range(16 if bar % 4 != 3 else 24):
            step = 0.25 if k < 16 or bar % 4 != 3 else 0.125
            q = k * 0.25 if bar % 4 != 3 else (k * 0.25 if k < 12 else 3 + (k - 12) * 0.0833)
            if q < 4: S.n('dr', 42, B + q, 0.1, 55 + (k % 2 == 0) * 20)
        for k in range(4): S.n('bell' if part else 'pluck', mel[(bar % 4) * 4 + k] + (12 if part else 0), B + k * 0.5 + (2 if k >= 2 else 0) * 0.5, 0.4, 70)
    return S.M


SONGS['trap'] = trap


def blocos(dur):
    """Tema calmo e aconchegante do 'mundo de blocos' (original): piano em arpejo, pad suave e sininhos, 78 bpm."""
    S = Song(78, 81); S.I('pno', 0); S.I('pad', 89); S.I('bell', 9); S.I('bass', 32)
    prog = [[53, 57, 60, 64], [45, 52, 55, 60], [50, 53, 57, 60], [46, 53, 57, 62]]          # Fmaj7 Am7 Dm7 Bbmaj9
    mel = [72, 69, 67, 69, 72, 74, 72, 67, 65, 67, 69, 72, 74, 72, 69, 67]
    for bar in range(_bars(dur, S)):
        ch = prog[bar % 4]; B = bar * 4; part = (bar // 4) % 2
        S.chord('pad', ch, B, 4, 34); S.n('bass', ch[0] - 12, B, 3.5, 55)
        for k in range(8): S.n('pno', ch[[0, 1, 2, 3, 2, 1, 3, 2][k]] + 12, B + k / 2, 0.9, 48 + (k == 0) * 10)
        if part:
            for k in range(4): S.n('bell', mel[(bar % 4) * 4 + k] + 12, B + k + 0.5, 0.8, 38)
    return S.M


SONGS['blocos'] = blocos

_IR = None


def _reverb(a, wet=0.22):
    global _IR
    if _IR is None:
        r = np.random.RandomState(7); n = int(SR * 2.2); t = np.arange(n) / SR
        _IR = np.stack([r.randn(n) * np.exp(-t * 3.2), r.randn(n) * np.exp(-t * 3.2)], 1).astype(np.float32); _IR /= np.abs(_IR).sum(0) ** 0.5 * 6
    from scipy.signal import fftconvolve
    w = np.stack([fftconvolve(a[:, c], _IR[:, c])[:len(a)] for c in range(2)], 1)
    return a * (1 - wet) + w * wet


LIB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'music_lib')


def render_lib(name, dur):
    """'mk:<slug>' -> real track from music_lib: starts at the energetic part, loops with crossfade, fades, normalized like the MIDI songs"""
    f = os.path.join(LIB_DIR, name[3:] + '.mp3')
    pcm = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', f, '-ac', '2', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True, check=True).stdout
    a = np.frombuffer(pcm, '<i2').reshape(-1, 2).astype(np.float32) / 32768
    hop = SR // 10; e = np.array([np.sqrt((a[i:i + hop] ** 2).mean()) for i in range(0, len(a) - hop, hop)])
    start = int(np.argmax(e > 0.8 * np.median(e)) * hop)                  # skip the slow intro
    body = a[start:]; n = int(dur * SR); xf = int(1.0 * SR); out = body.copy()
    while len(out) < n:                                                    # seamless loop with 1 s crossfade
        w = np.linspace(0, 1, xf)[:, None]; out = np.concatenate([out[:-xf], out[-xf:] * (1 - w) + body[:xf] * w, body[xf:]])
    a = out[:n]
    a /= max(1e-6, np.sqrt((a ** 2).mean())) / 0.1
    fi = min(int(0.3 * SR), n // 4); fo = min(int(1.5 * SR), n // 3); a[:fi] *= np.linspace(0, 1, fi)[:, None]; a[-fo:] *= np.linspace(1, 0, fo)[:, None]
    return a


def render(name, dur, path):
    if name.startswith('mk:'): return render_lib(name, dur)
    SONGS[name](dur + 6).write(path + '.mid')
    subprocess.run(['fluidsynth', '-ni', '-g', '0.6', '-r', str(SR), '-F', path, SF, path + '.mid'], check=True, capture_output=True)
    with wave.open(path) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, 2).astype(np.float32) / 32768
    n = int(dur * SR); a = a[:n] if len(a) >= n else np.pad(a, ((0, n - len(a)), (0, 0)))
    a = _reverb(a)
    m, sd = a.mean(1, keepdims=True), (a[:, :1] - a[:, 1:]) / 2; a = np.concatenate([m + sd * 1.3, m - sd * 1.3], 1)   # widen
    a /= max(1e-6, np.sqrt((a ** 2).mean())) / 0.1
    f = int(1.5 * SR); f = min(f, n // 3); a[:f] *= np.linspace(0, 1, f)[:, None]; a[-f:] *= np.linspace(1, 0, f)[:, None]
    return a


if __name__ == '__main__':
    import sys
    for nm in (sys.argv[1:] or SONGS):
        x = render(nm, 40, f'mus/v2_{nm}.wav'); print(nm, 'rms', round(float(np.sqrt((x ** 2).mean())), 3), 'peak', round(float(np.abs(x).max()), 2))
