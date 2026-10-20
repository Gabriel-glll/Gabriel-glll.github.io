"""Alinha a imagem B (ex.: sala vazia gerada por IA) sobre a imagem A (foto original), pixel a pixel.
Usa pontos em comum (SIFT nas paredes/janelas/piso) + homografia. Gera B alinhada no tamanho de A (escala opcional).
Uso: python alinhar.py original.jpg vazia.png saida.png [--escala 2]
"""
import argparse

import cv2
import numpy as np


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('a'); ap.add_argument('b'); ap.add_argument('saida')
    ap.add_argument('--escala', type=float, default=1.0, help='tamanho final = tamanho de A × escala')
    x = ap.parse_args()
    A = cv2.imread(x.a); B = cv2.imread(x.b)
    h, w = A.shape[:2]
    Bs = cv2.resize(B, (w, int(B.shape[0] * w / B.shape[1])))  # mesma largura para casar escala aproximada
    ga, gb = cv2.cvtColor(A, cv2.COLOR_BGR2GRAY), cv2.cvtColor(Bs, cv2.COLOR_BGR2GRAY)
    sift = cv2.SIFT_create(6000)
    ka, da = sift.detectAndCompute(ga, None); kb, db = sift.detectAndCompute(gb, None)
    m = cv2.BFMatcher().knnMatch(db, da, k=2)
    bons = [p for p, q in m if p.distance < 0.72 * q.distance]
    src = np.float32([kb[p.queryIdx].pt for p in bons]); dst = np.float32([ka[p.trainIdx].pt for p in bons])
    H, inl = cv2.findHomography(src, dst, cv2.RANSAC, 3.0)
    print(f'pontos em comum: {len(bons)} | usados: {int(inl.sum())}')
    W2, H2 = int(w * x.escala), int(h * x.escala)
    S = np.diag([x.escala, x.escala, 1.0])
    # desenha B (em resolução cheia) já alinhada sobre o quadro de A ampliado
    k = Bs.shape[1] / B.shape[1]
    Kb = np.diag([k, k, 1.0])
    M = S @ H @ Kb
    out = cv2.warpPerspective(B, M, (W2, H2), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REPLICATE)
    cv2.imwrite(x.saida, out)
    Aup = cv2.resize(A, (W2, H2), interpolation=cv2.INTER_LANCZOS4)
    cv2.imwrite(x.saida.replace('.png', '-check.jpg'), cv2.addWeighted(Aup, 0.5, out, 0.5, 0))
    print('salvo:', x.saida, f'{W2}x{H2}')


if __name__ == '__main__':
    main()
