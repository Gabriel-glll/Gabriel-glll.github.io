"""Monta as imagens de prévia dos cards: storyboard do reveal aéreo, colagem de referências e mosaico do estúdio."""
import os

import cv2
import numpy as np

R = r'C:\Users\ogabr\Documents\claude'
OUT = os.path.join(R, 'Gabriel-glll.github.io', 'aprendizados', 'prev')
PV = os.path.join(R, 'criativos', 'site-aprendizados', 'previas')
os.makedirs(OUT, exist_ok=True)


def cover(img, w, h):
    s = max(w / img.shape[1], h / img.shape[0])
    r = cv2.resize(img, (int(img.shape[1] * s) + 1, int(img.shape[0] * s) + 1), interpolation=cv2.INTER_AREA)
    y, x = (r.shape[0] - h) // 2, (r.shape[1] - w) // 2
    return r[y:y + h, x:x + w]


def seta(img, cx, cy):
    cv2.circle(img, (cx, cy), 26, (242, 236, 226), -1, cv2.LINE_AA)
    cv2.arrowedLine(img, (cx - 11, cy), (cx + 12, cy), (42, 83, 184), 4, cv2.LINE_AA, tipLength=0.45)


# 1. storyboard do reveal aéreo: céu → cidade vista do alto → fachada
paineis = [os.path.join(R, 'motion-studio', 'public', 'storyboard2', '01-nuvens.jpg'),
           os.path.join(R, 'motion-studio', 'public', 'storyboard', '03-aerea.jpg'),
           os.path.join(R, 'Gabriel-glll.github.io', 'novos-lancamentos', 'materiais', 'alentejo', 'fotos', '01.jpg')]
W, H, G = 360, 600, 10
sb = np.full((H, W * 3 + G * 2, 3), (226, 236, 242), np.uint8)
for i, p in enumerate(paineis):
    sb[:, i * (W + G):i * (W + G) + W] = cover(cv2.imread(p), W, H)
for i in (1, 2):
    seta(sb, i * (W + G) - G // 2, H // 2)
cv2.imwrite(os.path.join(OUT, 'reveal-storyboard.jpg'), sb, [cv2.IMWRITE_JPEG_QUALITY, 82])

# 2. referências: 3 prints empilhados em leque
fundo = np.full((720, 1080, 3), (226, 236, 242), np.uint8)
for i, n in enumerate(['ref-recent', 'ref-awwwards', 'ref-fontshare']):
    im = cover(cv2.imread(os.path.join(PV, n + '.jpg')), 640, 400)
    x, y = 60 + i * 190, 50 + i * 120
    cv2.rectangle(fundo, (x - 3, y - 3), (x + 643, y + 403), (40, 40, 40), -1)
    fundo[y:y + 400, x:x + 640] = im
cv2.imwrite(os.path.join(OUT, 'referencias.jpg'), fundo, [cv2.IMWRITE_JPEG_QUALITY, 82])

# 3. mosaico do estúdio (o que já saiu das ferramentas)
EX = os.path.join(R, 'Gabriel-glll.github.io', 'aprendizados', 'ex')
fontes = ['poster-1-elegante.jpg', 'anuncio-lazur-feed.jpg', 'poster-3-refinada.jpg', 'textura-combo.jpg', 'anuncio-cambui-feed.jpg', 'poster-2-casual.jpg']
mos = np.full((720, 1080, 3), (226, 236, 242), np.uint8)
for i, n in enumerate(fontes):
    x, y = (i % 3) * 360, (i // 3) * 360
    mos[y + 4:y + 356, x + 4:x + 356] = cover(cv2.imread(os.path.join(EX, n)), 352, 352)
cv2.imwrite(os.path.join(OUT, 'estudio-mosaico.jpg'), mos, [cv2.IMWRITE_JPEG_QUALITY, 82])
print('ok', os.listdir(OUT))
