"""Texturizador: gera texturas procedurais e aplica em artes/fotos (grátis, só Pillow + numpy).

Uso:
  python texturizar.py entrada.jpg saida.jpg --textura papel+grunge --forca 0.5
  python texturizar.py --gerar filme --tamanho 1080x1920 saida.png     # só a textura
  python texturizar.py --amostras entrada.jpg pasta_saida/             # uma versão por textura

Texturas: ruido, filme, papel, grunge, concreto, madeira, marmore, metal, vidro, halftone
Combine com "+": papel+grunge, metal+ruido, vidro+filme, concreto+ruido
"""
import argparse
import os
import sys

import numpy as np
from PIL import Image, ImageFilter

RNG = np.random.default_rng(7)


# ── ruído base ──────────────────────────────────────────────────
def value_noise(w, h, cell):
    gw, gh = max(2, w // cell + 2), max(2, h // cell + 2)
    g = Image.fromarray((RNG.random((gh, gw)) * 255).astype(np.uint8))
    return np.asarray(g.resize((w, h), Image.BICUBIC), dtype=np.float32) / 255.0


def fractal(w, h, base=256, octaves=5, persist=0.5):
    out, amp, tot, cell = np.zeros((h, w), np.float32), 1.0, 0.0, base
    for _ in range(octaves):
        out += value_noise(w, h, max(2, cell)) * amp
        tot += amp
        amp *= persist
        cell //= 2
    return out / tot


def norm(a):
    a = a - a.min()
    return a / (a.max() + 1e-6)


# ── texturas (retornam (mapa 0..1, modo de mesclagem)) ──────────
def t_ruido(w, h):
    return np.clip(0.5 + RNG.normal(0, 0.18, (h, w)), 0, 1).astype(np.float32), 'overlay'


def t_filme(w, h):
    a = np.clip(RNG.normal(0.03, 0.06, (h, w)), 0, 1)  # granulado
    n = int(w * h / 12000)  # poeira
    ys, xs = RNG.integers(0, h, n), RNG.integers(0, w, n)
    a[ys, xs] = RNG.uniform(0.25, 0.6, n)
    a = np.asarray(Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.5)), np.float32) / 255
    for _ in range(2):  # riscos verticais discretos
        x = RNG.integers(0, w)
        y0 = RNG.integers(0, h // 2)
        a[y0:y0 + RNG.integers(h // 4, h), x] = RNG.uniform(0.12, 0.25)
    return a, 'screen'


def t_papel(w, h):
    a = 0.85 + 0.15 * fractal(w, h, base=64, octaves=6)
    fib = Image.fromarray((RNG.random((h, w)) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))
    a = a - 0.06 * (np.asarray(fib, np.float32) / 255 > 0.97)
    return np.clip(a, 0, 1), 'multiply'


def t_grunge(w, h):
    f = fractal(w, h, base=180, octaves=6)
    blot = np.clip((f - 0.55) * 4, 0, 1)
    spk = (RNG.random((h, w)) > 0.995).astype(np.float32)
    return np.clip(1 - 0.55 * blot - 0.5 * spk, 0, 1), 'multiply'


def t_concreto(w, h):
    a = 0.5 + 0.35 * (fractal(w, h, base=120, octaves=7) - 0.5) * 2
    pits = (RNG.random((h, w)) > 0.992).astype(np.float32)
    pits = np.asarray(Image.fromarray((pits * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3)), np.float32) / 255
    return np.clip(a - 0.25 * pits, 0, 1), 'overlay'


def t_madeira(w, h):
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    turb = fractal(w, h, base=200, octaves=4)
    r = np.sqrt((x - w * 0.3) ** 2 * 0.02 + (y - h * 0.5) ** 2) / max(w, h)
    rings = 0.5 + 0.5 * np.sin((r * 60 + turb * 6) * np.pi)
    return 0.35 + 0.4 * rings, 'overlay'


def t_marmore(w, h):
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    turb = fractal(w, h, base=300, octaves=6)
    v = np.abs(np.sin((x / w * 4 + y / h * 3 + turb * 5) * np.pi))
    veins = np.power(v, 0.15)
    return np.clip(0.75 + 0.25 * veins, 0, 1), 'multiply'


def t_metal(w, h):
    n = Image.fromarray((RNG.random((h, w)) * 255).astype(np.uint8))
    n = n.resize((max(1, w // 40), h)).resize((w, h), Image.BILINEAR)  # escovado horizontal
    a = np.asarray(n, np.float32) / 255
    y = np.linspace(0, 1, h, dtype=np.float32)[:, None]
    sheen = 0.5 + 0.25 * np.sin(y * np.pi * 2)
    return np.clip(0.3 * a + 0.7 * sheen, 0, 1), 'soft'


def t_halftone(w, h, src=None, step=None):
    step = step or max(6, w // 140)
    base = (np.asarray(src.convert('L').resize((w, h)), np.float32) / 255) if src is not None else fractal(w, h)
    y, x = np.mgrid[0:h, 0:w]
    cy, cx = (y // step) * step + step / 2, (x // step) * step + step / 2
    lum = base[np.clip(cy.astype(int), 0, h - 1), np.clip(cx.astype(int), 0, w - 1)]
    radius = (1 - lum) * step * 0.62
    dot = np.sqrt((y - cy) ** 2 + (x - cx) ** 2) < radius
    return np.where(dot, 0.0, 1.0).astype(np.float32), 'multiply'


TEXTURAS = {
    'ruido': t_ruido, 'filme': t_filme, 'papel': t_papel, 'grunge': t_grunge, 'concreto': t_concreto,
    'madeira': t_madeira, 'marmore': t_marmore, 'metal': t_metal, 'halftone': t_halftone,
}


# ── mesclagem ───────────────────────────────────────────────────
def mesclar(base, tex, modo, forca):
    t = tex[..., None]
    if modo == 'multiply':
        r = base * t
    elif modo == 'screen':
        r = 1 - (1 - base) * (1 - t)
    elif modo == 'overlay':
        r = np.where(base < 0.5, 2 * base * t, 1 - 2 * (1 - base) * (1 - t))
    else:  # soft light
        r = (1 - 2 * t) * base ** 2 + 2 * t * base
    return base + (r - base) * forca


def vidro(img, faixas=None, forca=1.0):
    """Vidro canelado: desloca a imagem em faixas verticais."""
    a = np.asarray(img, np.float32)
    h, w = a.shape[:2]
    faixa = faixas or max(12, w // 40)
    x = np.arange(w)
    desloc = (np.sin((x % faixa) / faixa * np.pi * 2) * faixa * 0.35 * forca).astype(int)
    xs = np.clip(x + desloc, 0, w - 1)
    out = a[:, xs]
    brilho = (0.08 * forca * np.sin((x % faixa) / faixa * np.pi))[None, :, None] * 255
    return Image.fromarray(np.clip(out + brilho, 0, 255).astype(np.uint8))


def aplicar(img, receita, forca=0.5):
    img = img.convert('RGB')
    for nome in receita.split('+'):
        nome = nome.strip()
        if nome == 'vidro':
            img = vidro(img, forca=min(1.0, forca * 1.6))
            continue
        w, h = img.size
        tex, modo = t_halftone(w, h, src=img) if nome == 'halftone' else TEXTURAS[nome](w, h)
        base = np.asarray(img, np.float32) / 255
        img = Image.fromarray((np.clip(mesclar(base, tex, modo, forca), 0, 1) * 255).astype(np.uint8))
    return img


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('entrada', nargs='?')
    ap.add_argument('saida', nargs='?')
    ap.add_argument('--textura', default='ruido')
    ap.add_argument('--forca', type=float, default=0.5)
    ap.add_argument('--gerar')
    ap.add_argument('--tamanho', default='1080x1350')
    ap.add_argument('--amostras', action='store_true')
    a = ap.parse_args()

    if a.gerar:
        w, h = map(int, a.tamanho.lower().split('x'))
        tex, _ = TEXTURAS[a.gerar](w, h)
        Image.fromarray((tex * 255).astype(np.uint8)).save(a.entrada)
        print('textura salva:', a.entrada)
        return
    img = Image.open(a.entrada)
    if a.amostras:
        os.makedirs(a.saida, exist_ok=True)
        for nome in list(TEXTURAS) + ['vidro']:
            aplicar(img, nome, a.forca).save(os.path.join(a.saida, f'{nome}.jpg'), quality=90)
        print('amostras em', a.saida)
        return
    aplicar(img, a.textura, a.forca).save(a.saida, quality=92)
    print('salvo:', a.saida)


if __name__ == '__main__':
    sys.exit(main())
