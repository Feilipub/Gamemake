"""Monta uma imagem de visão geral do mapa exportado (chão + objetos + porteiras fechadas),
para revisar o layout sem abrir o Godot.

Uso: python3 tools/asset-pipeline/render_overview.py SAIDA.png [x0 y0 x1 y1 em pixels] [--season 0|1]
"""
import json
import sys

from PIL import Image


def main() -> None:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    season = 1 if "--season" in sys.argv and sys.argv[sys.argv.index("--season") + 1] == "1" else 0
    out = args[0]
    world = json.load(open("assets/data/world_map.json"))
    canvas = Image.open(f"assets/art/world/ground_s{season}.png").convert("RGBA")
    items = [(o["s"], o["t"], o["x"], o["y"], None) for o in world["objects"]]
    items += [(g["s"], g["t"], g["x"], g["y"], (0, 0, g["fw"], g["fh"])) for g in world["gates"]]
    items.sort(key=lambda t: t[0])
    cache: dict = {}
    for _, tex, x, y, crop in items:
        path = tex.replace("res://", "")
        if path not in cache:
            cache[path] = Image.open(path).convert("RGBA")
        im = cache[path].crop(crop) if crop else cache[path]
        canvas.paste(im, (int(x), int(y)), im)
    if len(args) >= 5:
        canvas = canvas.crop(tuple(int(v) for v in args[1:5]))
    canvas.save(out)
    print(out, canvas.size)


if __name__ == "__main__":
    main()
