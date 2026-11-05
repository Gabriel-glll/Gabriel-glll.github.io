# Cor "cinematográfica" para fotos de imóvel (estilo do reel DfCzIDpzgIT): contraste em S, pretos
# levemente lavados, sombras frias (teal), luzes quentes, bege do render menos amarelado, vinheta e grão.
# Uso: python scripts/cine-grade.py <entrada> <saida.jpg> [--vertical CX] [--forca 1.0]
#   --vertical CX recorta 9:16 centrado em CX (0-1) e entrega 2160x3840 (4K vertical).
import argparse
import numpy as np
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument('src'); ap.add_argument('dst')
ap.add_argument('--vertical', type=float); ap.add_argument('--forca', type=float, default=1.0)
a = ap.parse_args()

im = Image.open(a.src).convert('RGB')
if a.vertical is not None:
    w, h = im.size
    cw = round(h * 9 / 16)
    x = min(max(round(a.vertical * w - cw / 2), 0), w - cw)
    im = im.crop((x, 0, x + cw, h)).resize((2160, 3840), Image.LANCZOS)
x = np.asarray(im).astype(np.float32) / 255
k = a.forca

lum = x @ np.array([0.2126, 0.7152, 0.0722], np.float32)
# tira o amarelado do render: puxa saturação dos tons quentes médios
mean = lum[..., None]
x = mean + (x - mean) * (1 - 0.18 * k)

# contraste com pretos levemente levantados
x =np.clip(0.5 + (x - 0.5) * (1 + 0.22 * k), 0, 1)
x = x * (1 - 0.035 * k) + 0.035 * k * np.array([0.05, 0.10, 0.12], np.float32) / 0.12  # pretos lavados com tom frio

# split toning: sombras teal, luzes quentes
lum = (x @ np.array([0.2126, 0.7152, 0.0722], np.float32))[..., None]
sh = np.clip(1 - lum * 2, 0, 1) ** 1.5
hi = np.clip(lum * 2 - 1, 0, 1) ** 1.2
x = x + k * (sh * np.array([-0.05, 0.015, 0.06], np.float32) + hi * np.array([0.04, 0.012, -0.035], np.float32))

# vinheta suave
H, W = x.shape[:2]
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
x = x * (1 - 0.28 * k * np.clip(r - 0.55, 0, 1) ** 1.6)[..., None]

# grão de filme fino
rng = np.random.default_rng(7)
g = rng.normal(0, 0.018 * k, (H, W, 1)).astype(np.float32)
x = np.clip(x + g * (0.4 + 0.6 * (1 - lum)), 0, 1)

Image.fromarray((x * 255 + 0.5).astype(np.uint8)).save(a.dst, quality=94)
print('ok ->', a.dst)
