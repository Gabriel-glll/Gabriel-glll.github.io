"""Remoção de marca d'água e nitidez das fotos de captação (captações autorizadas).

1. A marca de portal/imobiliária é a mesma em todas as fotos do anúncio: a mediana dos
   gradientes entre as fotos isola o desenho dela (fundo de cada foto varia, a marca não).
2. Regressão entre as fotos mede o formato exato da marca (onde ela tem transparência).
3. Só esses pixels são preenchidos pelo modelo LaMa (lama.onnx, baixado no workflow);
   o resto da foto não é tocado. Fotos em outro formato (em pé) acham a marca por encaixe.
4. Nitidez leve (unsharp mask), sem mudar cor, tamanho ou enquadramento.
Sem marca detectável, só aplica a nitidez. Sem o modelo, usa a inversão da mistura.
"""
import os

import cv2
import numpy as np
from PIL import Image, ImageFilter

MIN_FOTOS = 6          # abaixo disso a estimativa não é confiável
RAZAO_MIN = 12.0       # força do sinal da marca em relação ao fundo


def _cinza(a):
    return cv2.cvtColor(a, cv2.COLOR_RGB2GRAY).astype(np.float32)


def _alinhar(a, h, w):
    """Recorta/centraliza o array a (H,W,...) no tamanho (h,w) pelo centro."""
    H, W = a.shape[:2]
    y0, x0 = (H - h) // 2, (W - w) // 2
    if y0 >= 0 and x0 >= 0:
        return a[y0:y0 + h, x0:x0 + w]
    return None


def _poisson(gx, gy):
    """Integra o campo (gx, gy) (diferenças para frente) com borda zero — solução exata via DST."""
    from scipy.fft import dstn, idstn
    h, w = gx.shape
    div = gx.copy()
    div[:, 1:] -= gx[:, :-1]
    div += gy
    div[1:, :] -= gy[:-1, :]
    ky = np.cos(np.pi * np.arange(1, h + 1) / (h + 1))
    kx = np.cos(np.pi * np.arange(1, w + 1) / (w + 1))
    den = 2 * ky[:, None] + 2 * kx[None, :] - 4
    return idstn(dstn(div, type=1) / den, type=1).astype(np.float32)


def detectar(arrs):
    """Retorna (caixa relativa ao centro, alpha*W por canal (h,w,3), máscara) ou None."""
    # usa o maior grupo de mesmo tamanho para estimar
    grupos = {}
    for a in arrs:
        grupos.setdefault(a.shape[:2], []).append(a)
    (H, W), base = max(grupos.items(), key=lambda kv: len(kv[1]))
    if len(base) < MIN_FOTOS:
        return None
    gx = np.median([np.diff(a.astype(np.float32), axis=1, append=a[:, -1:].astype(np.float32)) for a in base], axis=0)
    gy = np.median([np.diff(a.astype(np.float32), axis=0, append=a[-1:, :].astype(np.float32)) for a in base], axis=0)
    mag = np.sqrt((gx ** 2 + gy ** 2).sum(axis=2))
    fundo = float(np.median(mag)) + 1e-3
    forte = mag > max(np.percentile(mag, 99.7), fundo * RAZAO_MIN)
    forte = cv2.morphologyEx(forte.astype(np.uint8), cv2.MORPH_OPEN, np.ones((2, 2), np.uint8))
    n, rot, est, _ = cv2.connectedComponentsWithStats(cv2.dilate(forte, np.ones((25, 25), np.uint8)))
    if n <= 1:
        return None
    i = 1 + int(np.argmax(est[1:, cv2.CC_STAT_AREA]))
    x, y, w, h = est[i, :4]
    if est[i, cv2.CC_STAT_AREA] < 400 or w * h > 0.35 * H * W:
        return None
    if float(np.percentile(mag[rot == i], 95)) < fundo * RAZAO_MIN:
        return None
    m = 12
    x0, y0, x1, y1 = max(x - m, 0), max(y - m, 0), min(x + w + m, W), min(y + h + m, H)
    aw = np.stack([_poisson(gx[y0:y1, x0:x1, c], gy[y0:y1, x0:x1, c]) for c in range(3)], axis=2)
    aw = np.clip(aw, 0, 255)
    contorno = cv2.dilate((rot[y0:y1, x0:x1] == i).astype(np.uint8) & forte[y0:y1, x0:x1], np.ones((3, 3), np.uint8))
    # caixa em relação ao centro da imagem (serve para fotos em pé e deitadas)
    cx, cy = W / 2, H / 2
    return {"dx": x0 - cx, "dy": y0 - cy, "aw": aw, "contorno": contorno}


def _magn(g):
    gx = cv2.Sobel(g, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(g, cv2.CV_32F, 0, 1, ksize=3)
    return cv2.magnitude(gx, gy)


def posicoes(arrs, mk, folga=60, min_corr=0.25):
    """Acha a marca em cada foto (pode estar deslocada em fotos em pé/deitadas).
    Devolve (x0, y0) por foto, ou None quando a marca não aparece nela."""
    tpl = _magn(mk["aw"].max(axis=2).astype(np.float32))
    h, w = tpl.shape
    res = []
    for a in arrs:
        H, W = a.shape[:2]
        cx, cy = int(round(W / 2 + mk["dx"])), int(round(H / 2 + mk["dy"]))
        x0, y0 = max(cx - folga, 0), max(cy - folga, 0)
        x1, y1 = min(cx + w + folga, W), min(cy + h + folga, H)
        if x1 - x0 < w or y1 - y0 < h:
            res.append(None); continue
        g = _magn(_cinza(a[y0:y1, x0:x1]))
        m = cv2.matchTemplate(g, tpl, cv2.TM_CCOEFF_NORMED)
        _, val, _, loc = cv2.minMaxLoc(m)
        res.append((x0 + loc[0], y0 + loc[1], val, (H, W)))
    # a posição é fixa para cada tamanho de foto: usa a mediana das boas detecções do grupo
    final = []
    for r in res:
        if r is None:
            final.append(None); continue
        bons = [(x, y) for x, y, v, t in (q for q in res if q) if t == r[3] and v >= min_corr]
        if not bons:
            final.append(None); continue
        final.append((int(np.median([b[0] for b in bons])), int(np.median([b[1] for b in bons]))))
    return final


def estimar_mistura(arrs, mk):
    """alpha e cor da marca por pixel: regressão I = (1-a)*J + a*W entre todas as fotos,
    com J estimado pelo entorno de cada foto (inpainting só para a estimativa)."""
    msk = (mk["aw"].max(axis=2) > 4).astype(np.uint8)
    msk = cv2.dilate(msk, np.ones((3, 3), np.uint8), iterations=2)
    Is, Js = [], []
    h, w = mk["aw"].shape[:2]
    for a, pos in zip(arrs, mk["pos"]):
        if not pos:
            continue
        x0, y0 = pos
        reg = np.ascontiguousarray(a[y0:y0 + h, x0:x0 + w])
        Is.append(reg.astype(np.float32))
        Js.append(cv2.inpaint(reg, msk * 255, 6, cv2.INPAINT_TELEA).astype(np.float32))
    I, J = np.stack(Is), np.stack(Js)                 # N,h,w,3
    def ajuste(I, J, peso):
        sw = peso.sum(0) + 1e-6
        mi, mj = (peso * I).sum(0) / sw, (peso * J).sum(0) / sw
        cov = (peso * (I - mi) * (J - mj)).sum(0)
        var = (peso * (J - mj) ** 2).sum(0) + 1e-3
        a = cov / var
        return a, mi - a * mj
    peso = np.ones_like(I)
    for _ in range(3):                                # descarta fotos que fogem do padrão (reamostragem robusta)
        a, b = ajuste(I, J, peso)
        res = np.abs(I - (a * J + b))
        lim = np.percentile(res, 75, axis=0, keepdims=True) * 1.5 + 1
        peso = (res <= lim).astype(np.float32)
    alfa = np.clip(1 - a.mean(axis=2), 0, 0.9).astype(np.float32)
    alfa[msk == 0] = 0
    # a marca tem cor única: cor global (mediana onde ela é forte) evita pontos coloridos
    forte = alfa > 0.15
    cor = np.median((b / np.maximum(alfa[..., None], 1e-3))[forte], axis=0) if forte.any() else np.full(3, 255.0)
    cor = np.clip(cor, 0, 255)
    alfa = np.where(msk > 0, np.clip((b / np.maximum(cor, 1)).mean(axis=2), 0, 0.9), 0).astype(np.float32)
    # devolve a parcela somada (alfa * cor), por pixel
    return alfa, (alfa[..., None] * cor[None, None, :]).astype(np.float32)


def _aplicar(a, pos, alfa, cor):
    if not pos:
        return a
    x0, y0 = pos
    h, w = alfa.shape
    reg = a[y0:y0 + h, x0:x0 + w].astype(np.float32)
    al = alfa[..., None]
    j = np.clip((reg - cor) / (1 - al) + 0.5, 0, 255).astype(np.uint8)   # cor = alfa * cor da marca
    # a inversão amplifica o ruído de compressão onde a marca era forte: suaviza só ali,
    # na proporção da força da marca (fora dela a foto fica intacta)
    liso = cv2.fastNlMeansDenoisingColored(j, None, 6, 10, 5, 13)
    p = np.clip(alfa * 2.2, 0, 1)[..., None]
    j = np.clip(j * (1 - p) + liso * p + 0.5, 0, 255).astype(np.uint8)
    out = a.copy()
    out[y0:y0 + h, x0:x0 + w] = j
    return out


_LAMA = None
MODELO = os.environ.get("MARCA_MODELO") or os.path.join(os.path.dirname(os.path.abspath(__file__)), "lama.onnx")


def _lama():
    global _LAMA
    if _LAMA is None:
        import onnxruntime as ort
        _LAMA = ort.InferenceSession(MODELO, providers=["CPUExecutionProvider"])
    return _LAMA


def preencher(img, msk):
    """Preenche só os pixels da máscara com o modelo LaMa (janela 512x512 em volta)."""
    ys, xs = np.where(msk > 0)
    if not len(xs):
        return img
    H, W = img.shape[:2]
    m = 24
    x0, x1, y0, y1 = max(xs.min() - m, 0), min(xs.max() + m, W), max(ys.min() - m, 0), min(ys.max() + m, H)
    lado = max(512, x1 - x0, y1 - y0)
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    x0 = int(np.clip(cx - lado // 2, 0, max(W - lado, 0))); y0 = int(np.clip(cy - lado // 2, 0, max(H - lado, 0)))
    x1, y1 = min(x0 + lado, W), min(y0 + lado, H)
    rec, mr = img[y0:y1, x0:x1], (msk[y0:y1, x0:x1] > 0).astype(np.float32)
    hh, ww = rec.shape[:2]
    ent = cv2.resize(rec, (512, 512), interpolation=cv2.INTER_AREA) if (hh, ww) != (512, 512) else rec
    me = cv2.resize(mr, (512, 512), interpolation=cv2.INTER_NEAREST) if (hh, ww) != (512, 512) else mr
    o = _lama().run(None, {"image": (ent.astype(np.float32) / 255).transpose(2, 0, 1)[None],
                           "mask": (me > 0).astype(np.float32)[None, None]})[0][0].transpose(1, 2, 0)
    if o.max() <= 1.5:
        o = o * 255
    o = np.clip(o, 0, 255).astype(np.uint8)
    if (hh, ww) != (512, 512):
        o = cv2.resize(o, (ww, hh), interpolation=cv2.INTER_CUBIC)
    out = img.copy()
    reg = out[y0:y1, x0:x1]
    reg[mr > 0] = o[mr > 0]
    return out


def _encaixe_grupo(arrs, alfa):
    """Outro formato de foto (ex.: em pé): a marca é a mesma, em outra posição/escala.
    Acha pela mediana dos gradientes do grupo. Devolve (posição, alfa ajustado) ou None."""
    if len(arrs) >= 3:
        cz = [_cinza(a) for a in arrs]
        gx = np.median([np.diff(c, axis=1, append=c[:, -1:]) for c in cz], axis=0)
        gy = np.median([np.diff(c, axis=0, append=c[-1:, :]) for c in cz], axis=0)
        g = np.sqrt(gx ** 2 + gy ** 2).astype(np.float32)
    else:
        g = _magn(_cinza(arrs[0]))
    melhor = (0.35, None)
    for esc in [1.0] + [round(x, 3) for x in np.arange(0.80, 1.26, 0.025) if abs(x - 1) > 0.01]:
        al = cv2.resize(alfa, None, fx=float(esc), fy=float(esc), interpolation=cv2.INTER_LINEAR) if esc != 1.0 else alfa
        if al.shape[0] >= g.shape[0] or al.shape[1] >= g.shape[1]:
            continue
        t = np.sqrt(np.diff(al, axis=1, append=al[:, -1:]) ** 2 + np.diff(al, axis=0, append=al[-1:, :]) ** 2)
        m = cv2.matchTemplate(g, t.astype(np.float32), cv2.TM_CCOEFF_NORMED)
        _, v, _, loc = cv2.minMaxLoc(m)
        if v > melhor[0]:
            melhor = (v, (loc, al))
    return melhor[1]


def _mascara(forma, pos, alfa, dil=7):
    H, W = forma[:2]
    x0, y0 = pos
    h, w = alfa.shape
    m = np.zeros((H, W), np.uint8)
    hh, ww = min(h, H - y0), min(w, W - x0)
    m[y0:y0 + hh, x0:x0 + ww] = (alfa[:hh, :ww] > 0.03)
    return cv2.dilate(m, np.ones((dil, dil), np.uint8))


def _uma_marca(arrs, aviso=None, passo=1):
    """Recebe lista de PIL.Image; devolve (lista limpa, removeu_marca).
    1) acha a marca cruzando as fotos (mesma marca em todas); 2) mede o formato exato dela;
    3) preenche só esses pixels com IA (LaMa); 4) nitidez leve. Sem marca: só nitidez."""
    grupos = {}
    for i, a in enumerate(arrs):
        grupos.setdefault(a.shape[:2], []).append(i)
    ordem = sorted(grupos.values(), key=len, reverse=True)
    if len(ordem[0]) < MIN_FOTOS:
        return arrs, False
    base = [arrs[i] for i in ordem[0]]
    mk = detectar(base)
    if not mk:
        return arrs, False
    mk["pos"] = posicoes(base, mk)
    if sum(p is not None for p in mk["pos"]) < MIN_FOTOS:
        return arrs, False
    alfa, cor = estimar_mistura(base, mk)
    usar_ia = os.path.exists(MODELO)
    saida = list(arrs)
    feitos = [0]
    def tratar(i, pos, al, cr):
        feitos[0] += 1
        if aviso:
            aviso(feitos[0], len(arrs), passo)
        if usar_ia:
            saida[i] = preencher(arrs[i], _mascara(arrs[i].shape, pos, al))
        else:
            saida[i] = _aplicar(arrs[i], pos, al, cr)
    for i, p in zip(ordem[0], mk["pos"]):
        if p:
            tratar(i, p, alfa, cor)
    for idx in ordem[1:]:
        r = _encaixe_grupo([arrs[i] for i in idx], alfa)
        if r:
            pos, al = r
            cr = cv2.resize(np.ascontiguousarray(cor), (al.shape[1], al.shape[0]))
            for i in idx:
                tratar(i, pos, al, cr)
    return saida, True


def limpar(imagens, aviso=None):
    """Recebe lista de PIL.Image; devolve (lista limpa, removeu_marca).
    Repete até 3 vezes: portais costumam pôr mais de uma marca (logo no centro + texto no canto)."""
    arrs = [np.asarray(im.convert("RGB")) for im in imagens]
    removeu = False
    for passo in (1, 2, 3):
        arrs, ok = _uma_marca(arrs, aviso, passo)
        if not ok:
            break
        removeu = True
    return [nitidez(Image.fromarray(a)) for a in arrs], removeu


def nitidez(im):
    """Realce leve de nitidez, sem mudar cor, tamanho ou enquadramento."""
    return im.filter(ImageFilter.UnsharpMask(radius=1.4, percent=55, threshold=3))
