"""Máscaras suaves (PNG com alfa) de cada grupo de móveis, em coordenadas da foto original (1024x561), escaladas p/ 1920x1051."""
import os

import cv2
import numpy as np

W, H, K = 1920, 1051, 1920 / 1024
GRUPOS = {  # ordem de montagem
    '1-sofa':     [[40, 228], [175, 222], [240, 250], [365, 282], [382, 345], [380, 392], [282, 395], [282, 430], [40, 432]],
    '2-rack-tv':  [[412, 160], [528, 160], [528, 242], [552, 262], [552, 362], [415, 362]],
    '3-aparador': [[565, 222], [708, 222], [708, 352], [565, 352]],
    '4-mesa':     [[535, 255], [760, 255], [760, 300], [940, 300], [945, 560], [535, 560]],
    '5-detalhes': [[855, 128], [910, 128], [910, 182], [855, 182]],
    '6-chao':     [[0, 372], [220, 372], [220, 545], [0, 545]],
}
os.makedirs('mascaras', exist_ok=True)
for nome, pts in GRUPOS.items():
    m = np.zeros((H, W), np.uint8)
    cv2.fillPoly(m, [np.int32(np.array(pts) * K)], 255)
    m = cv2.dilate(m, np.ones((15, 15), np.uint8))  # margem p/ pegar sombras
    m = cv2.GaussianBlur(m, (0, 0), 14)  # borda suave
    rgba = np.dstack([np.full((H, W, 3), 255, np.uint8), m])
    cv2.imwrite(f'mascaras/{nome}.png', rgba)
print('ok', list(GRUPOS))
