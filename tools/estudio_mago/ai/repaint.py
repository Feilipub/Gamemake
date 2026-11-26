"""Repinta um esboço (sprite do estúdio) com detalhe de ilustração, mantendo forma e identidade (LCM img2img, CPU).
uso: python3 repaint.py <esboco.png> <saida_prefixo> <n> <forca 0-1> "<prompt>" """
import os, sys, time
os.environ.setdefault('HF_HUB_DISABLE_XET', '1')
import torch
from PIL import Image
from diffusers import AutoPipelineForImage2Image
src, out, n, strength, prompt = sys.argv[1], sys.argv[2], int(sys.argv[3]), float(sys.argv[4]), sys.argv[5]
torch.set_num_threads(4)
pipe = AutoPipelineForImage2Image.from_pretrained("SimianLuo/LCM_Dreamshaper_v7", torch_dtype=torch.float32, safety_checker=None).to('cpu')
pipe.set_progress_bar_config(disable=True)
init = Image.open(src).convert('RGB').resize((512, 640), Image.BICUBIC)
for v in range(n):
    t = time.time()
    img = pipe(prompt, image=init, strength=strength, num_inference_steps=10, guidance_scale=7.5, generator=torch.manual_seed(77 + v * 191)).images[0]
    img.save(f'{out}_{v}.png'); print(out, v, round(time.time() - t, 1), 's', flush=True)
