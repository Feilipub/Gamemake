"""Embute os módulos de arte em web/index.html (substitui a versão anterior de cada um).
- tools/asset-pipeline/flora.js      -> const FLORA (árvores, plantas, frutíferas)
- tools/asset-pipeline/region_art.js -> const RART  (prédios e objetos da Região das Serras)
- tools/asset-pipeline/portrait.js   -> const PORT  (retratos 64x64 dos personagens)
"""
import pathlib
root = pathlib.Path(__file__).resolve().parents[2]
html = (root / 'web/index.html').read_text(encoding='utf-8')
anchor = '/* ============ CENÁRIO ============ */'
for name, fn in [('FLORA', 'flora.js'), ('RART', 'region_art.js'), ('PORT', 'portrait.js')]:
    src = (root / 'tools/asset-pipeline' / fn).read_text(encoding='utf-8')
    body = src[src.index('(() => {'):].rstrip().rstrip(';')
    begin, end = f'/* {name}:begin (gerado de tools/asset-pipeline/{fn}) */', f'/* {name}:end */'
    block = begin + f'\nconst {name} = ' + body + ';\n' + end
    if begin in html:
        html = html[:html.index(begin)] + block + html[html.index(end) + len(end):]
    else:
        assert html.count(anchor) == 1
        html = html.replace(anchor, anchor + '\n' + block)
    print(name, 'embutido', len(body), 'bytes')
(root / 'web/index.html').write_text(html, encoding='utf-8')
