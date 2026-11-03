"""Embute tools/asset-pipeline/flora.js em web/index.html como `const FLORA = ...;` (substitui a versão anterior)."""
import re, sys, pathlib
root = pathlib.Path(__file__).resolve().parents[2]
src = (root / 'tools/asset-pipeline/flora.js').read_text(encoding='utf-8')
body = src[src.index('(() => {'):].rstrip().rstrip(';')
html = (root / 'web/index.html').read_text(encoding='utf-8')
begin, end = '/* FLORA:begin (gerado de tools/asset-pipeline/flora.js) */', '/* FLORA:end */'
block = begin + '\nconst FLORA = ' + body + ';\n' + end
if begin in html:
    html = html[:html.index(begin)] + block + html[html.index(end) + len(end):]
else:
    anchor = '/* ============ CENÁRIO ============ */'
    assert html.count(anchor) == 1
    html = html.replace(anchor, anchor + '\n' + block)
(root / 'web/index.html').write_text(html, encoding='utf-8')
print('FLORA embutida', len(body), 'bytes')
