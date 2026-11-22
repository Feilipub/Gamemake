"""Mídia real do Wikimedia Commons: baixa o original, reduz, guarda o crédito (autor + licença) para mostrar na tela."""
import json, os, re, subprocess, time, urllib.parse, urllib.request
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
D = '/tmp/claude-0/-home-user-Gamemake/c7fa80bb-2f1a-52d8-8917-ca913c38c19e/scratchpad/media'
UA = {'User-Agent': 'EducationalVideoMaker/1.0 (non-commercial script)'}
os.makedirs(D, exist_ok=True)
DB = f'{D}/credits.json'
CRED = json.load(open(DB)) if os.path.exists(DB) else {}


def _api(title):
    url = 'https://pt.wikipedia.org/w/api.php?' + urllib.parse.urlencode({'action': 'query', 'titles': title, 'prop': 'imageinfo', 'iiprop': 'url|mime|extmetadata', 'format': 'json'})
    for k in range(6):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40) as r: d = json.load(r)
            pg = list(d['query']['pages'].values())[0]; return pg['imageinfo'][0]
        except Exception as e:
            if '429' in str(e): time.sleep(6 * (k + 1)); continue
            raise


def clean(s):
    s = re.sub('<[^>]+>', '', s or ''); s = re.sub(r'\s+', ' ', s).strip()
    return s


def slug(t): return re.sub(r'[^a-zA-Z0-9]+', '_', t.replace('File:', ''))[:80]


def fetch(title, kind='img', ss=0, dur=12, maxpx=2000):
    """Returns local path. Images are resized to <= maxpx; videos are cut to an mp4 clip [ss, ss+dur]."""
    if title.startswith('LOCAL:'): return title[6:]
    if title.startswith('OV:'): return fetch_openverse(title[3:], maxpx)
    if title.startswith('NASA:'): return fetch_nasa(title[5:], kind, ss, dur, maxpx)
    if title.startswith('MIX:'): return fetch_mixkit(title[4:], ss, dur)
    title = title if title.startswith('File:') else 'File:' + title
    key = f'{title}|{ss}|{dur}' if kind == 'vid' else title
    out = f'{D}/{slug(title)}' + (f'_{ss}.mp4' if kind == 'vid' else '.jpg')
    if os.path.exists(out) and key in CRED: return out
    if os.environ.get('MEDIA_OFFLINE'): raise FileNotFoundError(title)
    META = json.load(open(f'{D}/meta.json')) if os.path.exists(f'{D}/meta.json') else {}
    ii = META.get(title) or _api(title); m = ii.get('extmetadata', {})
    artist = clean(m.get('Artist', {}).get('value')); lic = clean(m.get('LicenseShortName', {}).get('value'))
    artist = re.sub(r'\s*\(talk\)', '', artist)[:60]
    ext = os.path.splitext(urllib.parse.urlparse(ii['url']).path)[1]
    raw = f'{D}/raw_{slug(title)}{ext}'
    if not os.path.exists(raw) or os.path.getsize(raw) == 0:
        subprocess.run(['curl', '-sSfL', '-A', UA['User-Agent'], '--retry', '2', '--retry-delay', '120', '--retry-all-errors', '--max-time', '400', '-o', raw, ii['url']], check=True)
    if kind == 'vid':
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', str(ss), '-t', str(dur), '-i', raw, '-an', '-vf', 'scale=1280:-2', '-r', '30', '-c:v', 'libx264', '-crf', '18', out], check=True)
    else:
        im = Image.open(raw)
        if getattr(im, 'n_frames', 1) > 1: im.seek(0)
        im = im.convert('RGB'); r = maxpx / max(im.size)
        if r < 1: im = im.resize((int(im.width * r), int(im.height * r)), Image.LANCZOS)
        im.save(out, quality=92)
    CRED[key] = dict(title=title, artist=artist, license=lic, page='https://commons.wikimedia.org/wiki/' + urllib.parse.quote(title.replace(' ', '_')))
    json.dump(CRED, open(DB, 'w'), indent=1, ensure_ascii=False)
    return out


def fetch_nasa(nid, kind='img', ss=0, dur=12, maxpx=2000):
    key = f'NASA:{nid}|{ss}|{dur}' if kind == 'vid' else f'NASA:{nid}'
    out = f'{D}/nasa_{slug(nid)}' + (f'_{ss}.mp4' if kind == 'vid' else '.jpg')
    if os.path.exists(out) and key in CRED: return out
    q = urllib.parse.quote(nid)
    with urllib.request.urlopen(urllib.request.Request(f'https://images-api.nasa.gov/asset/{q}', headers=UA), timeout=60) as r: items = [i['href'] for i in json.load(r)['collection']['items']]
    wants = ['~mobile.mp4', '~medium.mp4', '~small.mp4', '~large.mp4'] if kind == 'vid' else ['~large.jpg']
    url = next((h for w in wants for h in items if h.endswith(w)), None) or next(h for h in items if h.endswith('.mp4' if kind == 'vid' else '.jpg'))
    url = url.replace('http://', 'https://').replace(' ', '%20')
    raw = f'{D}/raw_nasa_{slug(nid)}' + ('.mp4' if kind == 'vid' else '.jpg')
    if not os.path.exists(raw) or os.path.getsize(raw) == 0:
        subprocess.run(['curl', '-sSfL', '--retry', '3', '--max-time', '600', '-o', raw, url], check=True)
    if kind == 'vid':
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', str(ss), '-t', str(dur), '-i', raw, '-an', '-vf', 'scale=1280:-2', '-r', '30', '-c:v', 'libx264', '-crf', '18', out], check=True)
    else:
        im = Image.open(raw).convert('RGB'); r = maxpx / max(im.size)
        if r < 1: im = im.resize((int(im.width * r), int(im.height * r)), Image.LANCZOS)
        im.save(out, quality=92)
    CRED[key] = dict(title=nid, artist='NASA', license='domínio público', page='https://images.nasa.gov/details/' + q)
    json.dump(CRED, open(DB, 'w'), indent=1, ensure_ascii=False)
    return out


def fetch_openverse(query, maxpx=2000):
    """best CC0/BY/BY-SA photo for query from Openverse; cached; credit stored"""
    key = 'OV:' + query; out = f'{D}/ov_{slug(query)}.jpg'
    if os.path.exists(out) and key in CRED: return out
    if os.environ.get('MEDIA_OFFLINE'): raise FileNotFoundError(query)
    q, _, pick = query.partition('#')
    url = 'https://api.openverse.org/v1/images/?' + urllib.parse.urlencode({'q': q, 'license': 'cc0,pdm,by,by-sa', 'page_size': 12, 'mature': 'false'})
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r: res = json.load(r)['results']
    if pick: res = res[int(pick):]
    else: res = [x for x in res if (x.get('width') or 0) >= 800] or res
    raw = f'{D}/raw_ov_{slug(query)}.jpg'; best = None
    for cand in res[:8]:
        for u in (cand['url'], cand['thumbnail']):
            if subprocess.run(['curl', '-sSfL', '-A', UA['User-Agent'], '--max-time', '120', '-o', raw, u]).returncode == 0: best = cand; break
            time.sleep(3)
        if best: break
    if best is None: raise RuntimeError('no downloadable result for ' + query)
    im = Image.open(raw).convert('RGB'); r_ = maxpx / max(im.size)
    if r_ < 1: im = im.resize((int(im.width * r_), int(im.height * r_)), Image.LANCZOS)
    im.save(out, quality=92)
    lic = {'cc0': 'CC0', 'pdm': 'domínio público'}.get(best['license']) or ('CC ' + best['license'].upper() + ' ' + (best.get('license_version') or '')).strip()
    CRED[key] = dict(title=best.get('title'), artist=(best.get('creator') or 'autor desconhecido')[:50], license=lic, page=best.get('foreign_landing_url'), source=best.get('source'))
    json.dump(CRED, open(DB, 'w'), indent=1, ensure_ascii=False)
    return out


def fetch_mixkit(spec, ss=0, dur=12):
    """spec = 'search-term|keyword' : first Mixkit result for search-term whose slug contains keyword (or exact numeric id)"""
    q, _, kw = spec.partition('|'); kw = kw or q
    HQ = bool(os.environ.get('MIX_HQ'))
    out = f'{D}/mix{"hq" if HQ else ""}_{slug(q)}_{slug(kw)}_{ss}.mp4'
    if os.path.exists(out): return out
    pc = f'{D}/../mixkit/s_{q}.html'
    if os.path.exists(pc) and os.path.getsize(pc) > 1000: page = open(pc).read()
    else:
        page = subprocess.run(['curl', '-sSfL', '-A', 'Mozilla/5.0', '--max-time', '60', f'https://mixkit.co/free-stock-video/{q}/'], capture_output=True, text=True, check=True).stdout
        os.makedirs(os.path.dirname(pc), exist_ok=True); open(pc, 'w').write(page)
    items = list(dict.fromkeys(re.findall(r'/free-stock-video/([a-z0-9-]+)-(\d+)/', page)))
    pick = next(((sl, i) for sl, i in items if kw == i or kw in sl), None)
    if not pick: raise FileNotFoundError(f'mixkit: nothing for {spec} in {[s for s, _ in items][:12]}')
    sl, vid = pick; raw = f'{D}/raw_mix_{vid}{"_hq" if HQ else ""}.mp4'
    if HQ and not (os.path.exists(raw) and os.path.getsize(raw)):
        subprocess.run(['curl', '-sSfL', '--max-time', '400', '-o', raw, f'https://assets.mixkit.co/videos/{vid}/{vid}-1080.mp4'])
    if not os.path.exists(raw) or os.path.getsize(raw) == 0:
        r = subprocess.run(['curl', '-sSfL', '--max-time', '300', '-o', raw, f'https://assets.mixkit.co/videos/{vid}/{vid}-720.mp4'])
        if r.returncode: subprocess.run(['curl', '-sSfL', '--max-time', '300', '-o', raw, f'https://assets.mixkit.co/videos/{vid}/{vid}-360.mp4'], check=True)
    d = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', raw], capture_output=True, text=True).stdout or 0)
    ss2 = max(0, min(ss, d - 1)); loop = ['-stream_loop', '-1'] if d < dur + ss2 else []
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', *loop, '-ss', str(ss2), '-i', raw, '-t', str(dur), '-an', '-vf', 'scale=1920:-2:flags=lanczos' if HQ else 'scale=1280:-2', '-r', '30', '-c:v', 'libx264', '-crf', '16' if HQ else '18', '-preset', 'fast', out], check=True)
    CRED[f'MIX:{spec}'] = dict(title=sl, artist='Mixkit', license='Mixkit Free License', page=f'https://mixkit.co/free-stock-video/{sl}-{vid}/')
    json.dump(CRED, open(DB, 'w'), indent=1, ensure_ascii=False)
    print('mixkit', spec, '->', sl, vid, round(d, 1), 's')
    return out


def credit(title, ss=None):
    if title.startswith('OV:'):
        c = CRED.get(title, {}); return f"Foto: {c.get('artist', '?')} — {(c.get('source') or 'Openverse').capitalize()} ({c.get('license', '')})"
    if title.startswith('LOCAL:') and 'mapa_' in title: return 'Mapa: costa NOAA GLOBE · ilha © OpenStreetMap (ODbL)'
    if title.startswith('LOCAL:') and 'everest' in title: return 'Infográfico: Mago Pixel · medidas reais (Everest 8.849 m; Abismo Challenger ~10.935 m)'
    if title.startswith('LOCAL:') and 'gta_' in title: return 'Infográfico: Mago Pixel · dados: Rockstar Games/Take-Two (nov/2026)'
    if title.startswith('LOCAL:'): return 'Ilustração em pixel art: Mago Pixel'
    if title.startswith('NASA:'): return 'Fonte: NASA — images.nasa.gov (domínio público)'
    if title.startswith('MIX:'): return 'Vídeo: Mixkit — mixkit.co (licença gratuita)'
    title = title if title.startswith('File:') else 'File:' + title
    c = CRED.get(f'{title}|{ss}|12') or next((v for k, v in CRED.items() if k.startswith(title)), None)
    if not c: return ''
    a = c['artist'] or 'autor desconhecido'
    a = a.replace('Unknown authorUnknown author', 'autor desconhecido')
    return f"Fonte: {a} — Wikimedia Commons ({c['license']})"


def batch_meta(titles):
    """one API request per 40 titles; caches url + license metadata in meta.json"""
    META = json.load(open(f'{D}/meta.json')) if os.path.exists(f'{D}/meta.json') else {}
    todo = [t if t.startswith('File:') else 'File:' + t for t in titles]; todo = [t for t in dict.fromkeys(todo) if t not in META]
    for i in range(0, len(todo), 40):
        url = 'https://pt.wikipedia.org/w/api.php?' + urllib.parse.urlencode({'action': 'query', 'titles': '|'.join(todo[i:i + 40]), 'prop': 'imageinfo', 'iiprop': 'url|mime|extmetadata', 'format': 'json'})
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r: d = json.load(r)
        norm = {n['to']: n['from'] for n in d['query'].get('normalized', [])}
        for pg in d['query']['pages'].values():
            if 'imageinfo' in pg: META[norm.get(pg['title'], pg['title'])] = META[pg['title']] = pg['imageinfo'][0]
        time.sleep(3)
    json.dump(META, open(f'{D}/meta.json', 'w')); return META
