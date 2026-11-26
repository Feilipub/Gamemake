"""DUBLAGEM — motor de vozes expressivas do Podcast do Mago (substitui o Kokoro).
Modelo: Chatterbox Multilingual (Resemble AI, licença MIT), português, com controle de emoção (exaggeration).
Cada personagem tem uma voz própria clonada de uma REFERÊNCIA SINTÉTICA (gerada por TTS, nunca de pessoa real).
Controle de qualidade: cada fala é transcrita por reconhecimento de voz; se as palavras não batem, a fala é refeita
com outra semente (até 4 tentativas) e fica a melhor. Saída idêntica ao voz.py (cache/*.npy + conversa.wav + timeline.json),
então os motores de vídeo (corte3, corte4) funcionam sem mudança.
uso (no ambiente cbenv):  python podcast/dublagem.py <modulo_do_roteiro>"""
import os, sys, re, difflib, random, subprocess, importlib, json
import numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..'); SCR = os.path.join(ROOT, '..')
sys.path[:0] = [HERE, ROOT]
os.environ.setdefault('HF_HOME', os.path.join(SCR, 'ai', 'hf')); os.environ.setdefault('HF_HUB_OFFLINE', '1')
import torch, torchaudio as ta
torch.set_num_threads(4)
import voz as VZ
from num2words import num2words

REFS = os.path.join(SCR, 'tts', 'refs')
# voz de cada personagem: arquivo de referência + temperamento (multiplica a emoção)
VOICES = {'M': ('mago.wav', 1.0), 'Y': ('flamingo.wav', 1.15), 'J': ('medio_m.wav', 1.0), 'R': ('grave.wav', 1.0), 'S': ('grave.wav', 0.8),
          'U': ('grave.wav', 0.9), 'W': ('madura_f.wav', 0.9), 'N': ('madura_f.wav', 1.0), 'X': ('jovem_f.wav', 1.1), 'T': ('jovem_f.wav', 1.15),
          'Q': ('jovem_f.wav', 1.1), 'B': ('jovem_f.wav', 1.05), 'F': ('jovem_f.wav', 1.05), 'G': ('madura_f.wav', 1.0), 'O': ('madura_f.wav', 1.05),
          'P': ('flamingo.wav', 1.05), 'V': ('grave.wav', 1.05), 'I': ('medio_m.wav', 0.9), 'D': ('flamingo.wav', 1.1), 'K': ('jovem_f.wav', 1.1), 'H': ('medio_m.wav', 0.75), 'Z': ('medio_m.wav', 1.2)}
EMO = {'wide': 0.68, 'angry': 0.72, 'scared': 0.66, 'happy': 0.58, 'curious': 0.52, 'serious': 0.45, 'sad': 0.45, 'mystic': 0.5}
_M = None; _W = None


def _model():
    global _M
    if _M is None:
        from chatterbox.mtl_tts import ChatterboxMultilingualTTS
        _M = ChatterboxMultilingualTTS.from_pretrained(device='cpu')
    return _M


def _asr():
    global _W
    if _W is None:
        from faster_whisper import WhisperModel
        _W = WhisperModel('small', device='cpu', compute_type='int8')
    return _W


def norm(s):
    s = s.lower().replace('pra ', 'para ').replace('tá ', 'está ').replace('tô ', 'estou ').replace('%', ' por cento')
    s = re.sub(r'\d+(?:[.,]\d+)?', lambda m: num2words(int(m.group().replace('.', '').split(',')[0]), lang='pt_BR'), s)
    return re.sub(r'[^a-zà-ú ]', ' ', s).split()


def score(text, y, sr):
    from scipy.signal import resample_poly
    x = resample_poly(y, 16000, sr).astype('float32')
    hyp = ' '.join(s.text for s in _asr().transcribe(x, language='pt')[0])
    return difflib.SequenceMatcher(None, norm(text), norm(hyp)).ratio(), hyp


def tts(text, who, emo):
    """Chatterbox + verificação: devolve (audio, sr) da melhor tentativa."""
    ref, temper = VOICES.get(who, ('medio_m.wav', 1.0)); say = text
    for a, b in VZ.PRON:
        if a in ('GTA 6', 'GTA 5'): say = say.replace(a, b)
    ex = min(0.85, EMO.get(emo, 0.5) * temper); best = None
    for k in range(4):
        torch.manual_seed(1234 + k * 977 + len(text))
        e = ex if k < 2 else ex * 0.8                                                    # se errar, acalma um pouco a emoção
        wav = _model().generate(say, language_id='pt', audio_prompt_path=os.path.join(REFS, ref), exaggeration=e, cfg_weight=0.5, temperature=0.75)
        y = wav.squeeze(0).numpy().astype(np.float32); sr = _model().sr
        r, hyp = score(text, y, sr)
        if best is None or r > best[0]: best = (r, y, hyp)
        print(f'   tentativa {k + 1}: {r:.2f}  «{hyp.strip()[:70]}»', flush=True)
        if r >= 0.88: break
    if best[0] < 0.8: print('   ATENÇÃO: fala abaixo do ideal:', text[:60], flush=True)
    return best[1], sr


CHAIN = ("highpass=f=70,lowpass=f=13000,equalizer=f=180:t=q:w=1:g=1.5,equalizer=f=3000:t=q:w=1.2:g=1.5,"
         "acompressor=threshold=-20dB:ratio=2.5:attack=8:release=160:makeup=1.5")


def process(x, sr, who, tmp):
    sf.write(tmp + '_r.wav', x / max(1e-6, np.abs(x).max()) * 0.6, sr, subtype='PCM_16')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', tmp + '_r.wav', '-af', f'aresample={VZ.SR},{CHAIN}', '-ac', '1', tmp + '.wav'], check=True)
    y, _ = sf.read(tmp + '.wav', dtype='float32'); os.remove(tmp + '_r.wav'); os.remove(tmp + '.wav')
    nz = np.nonzero(np.abs(y) > 0.012)[0]
    if len(nz): y = y[max(0, nz[0] - 300):nz[-1] + 2200]
    rms = np.sqrt((y[np.abs(y) > 0.02] ** 2).mean()) if (np.abs(y) > 0.02).any() else 0.1
    return np.clip(y * (0.2 / rms), -0.98, 0.98)


if __name__ == '__main__':
    VZ.tts = tts; VZ.process = process
    VZ.build(sys.argv[1])
