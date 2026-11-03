#!/usr/bin/env bash
# Prepara o jogo HTML (web/index.html) para rodar offline dentro do app Android:
# copia o HTML, as músicas (audio/) e a fonte Pixelify Sans, e troca o link do Google Fonts
# por @font-face local. Saída: android-app/app/src/main/assets/www/
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$ROOT/android-app/app/src/main/assets/www"
mkdir -p "$OUT/audio" "$OUT/fonts"
cp "$ROOT"/assets/audio/music/*.mp3 "$OUT/audio/"
cp "$ROOT"/assets/fonts/PixelifySans-Regular.ttf "$ROOT"/assets/fonts/PixelifySans-Bold.ttf "$OUT/fonts/"
python3 - "$ROOT/web/index.html" "$OUT/index.html" <<'PY'
import re, sys
s = open(sys.argv[1], encoding='utf-8').read()
s = re.sub(r'<link rel="preconnect"[^>]*>\s*', '', s)
s = re.sub(r'<link href="https://fonts\.googleapis\.com[^>]*>', "<style>@font-face{font-family:'Pixelify Sans';src:url(fonts/PixelifySans-Regular.ttf) format('truetype');font-weight:400;font-display:block}@font-face{font-family:'Pixelify Sans';src:url(fonts/PixelifySans-Bold.ttf) format('truetype');font-weight:500 900;font-display:block}</style>", s)
assert 'fonts.googleapis' not in s, 'link de fonte externa não foi trocado'
open(sys.argv[2], 'w', encoding='utf-8').write(s)
print('www pronto:', len(s), 'bytes')
PY
ls -la "$OUT" "$OUT/audio" | head -20
