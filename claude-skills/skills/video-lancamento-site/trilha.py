"""Trilha leve gerada em código (sem copyright): dedilhado Karplus-Strong + pad + shaker + efeitos.
Uso: python trilha.py saida.wav --dur 18 --bpm 100 --pops 6.6,7.1,7.6,10.4 --whoosh 2.4,5.2,9.4,13.2
"""
import argparse
import wave

import numpy as np

SR = 44100
RNG = np.random.default_rng(3)
NOTE = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}


def hz(n, octv):
    return 440.0 * 2 ** ((NOTE[n] + 12 * (octv + 1) - 69) / 12)


def pluck(f, dur, amp=0.3):
    n = int(SR * dur)
    p = max(2, int(SR / f))
    buf = RNG.uniform(-1, 1, p)
    out = np.empty(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.996 * 0.5 * (buf[i % p] + buf[(i + 1) % p])
    return out * amp


def place(track, sig, t):
    i = int(t * SR)
    j = min(len(track), i + len(sig))
    if i < len(track):
        track[i:j] += sig[: j - i]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('saida')
    ap.add_argument('--dur', type=float, default=18)
    ap.add_argument('--bpm', type=float, default=100)
    ap.add_argument('--pops', default='')
    ap.add_argument('--whoosh', default='')
    a = ap.parse_args()

    n = int(SR * a.dur)
    mus, sfx = np.zeros(n), np.zeros(n)
    beat = 60 / a.bpm
    # I–V–vi–IV em Dó
    chords = [[('C', 4), ('E', 4), ('G', 4), ('C', 5)], [('G', 3), ('B', 3), ('D', 4), ('G', 4)],
              [('A', 3), ('C', 4), ('E', 4), ('A', 4)], [('F', 3), ('A', 3), ('C', 4), ('F', 4)]]
    pattern = [0, 2, 1, 3, 2, 1, 3, 2]  # dedilhado em colcheias
    t, bar = 0.0, 0
    while t < a.dur:
        ch = chords[bar % 4]
        root = ch[0]
        place(mus, pluck(hz(root[0], root[1] - 1), 2.4, 0.35), t)  # baixo
        for k, idx in enumerate(pattern):
            nn = ch[idx]
            place(mus, pluck(hz(nn[0], nn[1]), 1.2, 0.18 if k % 2 else 0.24), t + k * beat / 2)
        # pad suave
        tt = np.arange(int(SR * beat * 4)) / SR
        env = np.minimum(1, tt / 0.6) * np.minimum(1, (tt[::-1]) / 0.6)
        pad = sum(np.sin(2 * np.pi * hz(x, o) * tt) for x, o in ch[:3]) * env * 0.03
        place(mus, pad, t)
        # shaker nos contratempos
        for k in range(4):
            sh = RNG.normal(0, 1, int(SR * 0.05)) * np.exp(-np.linspace(0, 8, int(SR * 0.05))) * 0.03
            place(mus, sh, t + k * beat + beat / 2)
        t += beat * 4
        bar += 1

    for s in filter(None, a.pops.split(',')):  # pop afinado (G5 → C6)
        tt = np.arange(int(SR * 0.18)) / SR
        f = np.linspace(hz('G', 5), hz('C', 6), len(tt))
        place(sfx, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 28) * 0.22, float(s))
    for s in filter(None, a.whoosh.split(',')):  # whoosh: ruído com envelope
        L = int(SR * 0.5)
        env = np.sin(np.linspace(0, np.pi, L)) ** 2
        w = np.convolve(RNG.normal(0, 1, L), np.ones(40) / 40, 'same') * env * 0.12
        place(sfx, w, float(s) - 0.25)

    mix = mus * 0.9 + sfx
    fade = int(SR * 1.2)
    mix[-fade:] *= np.linspace(1, 0, fade)
    mix[: int(SR * 0.05)] *= np.linspace(0, 1, int(SR * 0.05))
    mix = mix / (np.abs(mix).max() + 1e-9) * 0.8
    pcm = (mix * 32767).astype(np.int16)
    with wave.open(a.saida, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print('trilha salva:', a.saida)


if __name__ == '__main__':
    main()
