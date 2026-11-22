"""Gera personagens/cenários do Podcast do Mago com o modelo local (LCM Dreamshaper v7, CPU).
uso: python3 char_gen.py <nome> <n> "<prompt>" [W H]"""
import os, sys, time
os.environ.setdefault('HF_HUB_DISABLE_XET', '1')
import torch
from diffusers import DiffusionPipeline
here = os.path.dirname(os.path.abspath(__file__)); out = os.path.join(here, 'img_chars'); os.makedirs(out, exist_ok=True)
name, n, prompt = sys.argv[1], int(sys.argv[2]), sys.argv[3]
W = int(sys.argv[4]) if len(sys.argv) > 4 else 512; H = int(sys.argv[5]) if len(sys.argv) > 5 else 640
torch.set_num_threads(4)
pipe = DiffusionPipeline.from_pretrained("SimianLuo/LCM_Dreamshaper_v7", torch_dtype=torch.float32, safety_checker=None).to('cpu')
pipe.set_progress_bar_config(disable=True)
for v in range(n):
    f = os.path.join(out, f'{name}_{v}.png')
    if os.path.exists(f): continue
    t = time.time()
    img = pipe(prompt, num_inference_steps=8, guidance_scale=8.0, width=W, height=H, generator=torch.manual_seed(4242 + v * 131)).images[0]
    img.save(f); print(name, v, round(time.time() - t, 1), 's', flush=True)
print('DONE', name, flush=True)
