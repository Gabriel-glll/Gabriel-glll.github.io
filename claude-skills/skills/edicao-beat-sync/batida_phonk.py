"""Batida estilo phonk (sem copyright) para testar edição sincronizada.
Bumbo no padrão 3+3+2 (tresillo), palma nos tempos 2 e 4, chimbal em semicolcheias, cowbell melódico.
Uso: python batida_phonk.py saida.wav --bpm 153 --compassos 10
"""
import argparse
import wave

import numpy as np

SR = 44100
RNG = np.random.default_rng(11)


def env(n, a=0.002, d=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-t / d)


def kick(dur=0.45):
    n = int(SR * dur); t = np.arange(n) / SR
    f = 45 + 120 * np.exp(-t * 30)  # 808: queda de afinação
    return np.tanh(2.2 * np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.28))


def clap():
    n = int(SR * 0.25)
    s = RNG.normal(0, 1, n) * env(n, 0.001, 0.07)
    return np.convolve(s, [1, -0.6], 'same') * 0.6


def hat(aberto=False):
    n = int(SR * (0.12 if aberto else 0.04))
    s = RNG.normal(0, 1, n); s = s - np.convolve(s, np.ones(6) / 6, 'same')  # passa-alta simples
    return s * env(n, 0.0005, 0.05 if aberto else 0.012) * 0.25


def cowbell(freq, dur=0.22):
    n = int(SR * dur); t = np.arange(n) / SR
    s = np.sign(np.sin(2 * np.pi * freq * t)) * 0.5 + np.sign(np.sin(2 * np.pi * freq * 1.48 * t)) * 0.5
    return np.convolve(s, np.ones(4) / 4, 'same') * env(n, 0.001, 0.09) * 0.22


def place(track, sig, t, g=1.0):
    i = int(t * SR); j = min(len(track), i + len(sig))
    if 0 <= i < len(track):
        track[i:j] += sig[: j - i] * g


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('saida')
    ap.add_argument('--bpm', type=float, default=153)
    ap.add_argument('--compassos', type=int, default=10)
    a = ap.parse_args()
    beat = 60 / a.bpm; e8 = beat / 2; e16 = beat / 4; bar = beat * 4
    n = int(SR * (bar * a.compassos + 1.5)); out = np.zeros(n)
    # melodia de cowbell (Mi menor) – 2 compassos que se repetem
    notas = [659, 0, 784, 659, 0, 587, 659, 0, 494, 0, 587, 494, 0, 440, 494, 0]
    for c in range(a.compassos):
        t0 = c * bar
        intro = c == 0
        for k in range(16):  # chimbal
            place(out, hat(aberto=(k % 8 == 6)), t0 + k * e16, 0.7 if intro else 1.0)
        nota = notas[(c % 2) * 8:(c % 2) * 8 + 8]
        for k, f in enumerate(nota):  # cowbell em colcheias
            if f:
                place(out, cowbell(f), t0 + k * e8, 0.8 if intro else 1.0)
        if intro:
            continue
        for k in (0, 3, 6):  # bumbo 3+3+2
            place(out, kick(), t0 + k * e8, 0.9)
        for k in (2, 6):  # palma nos tempos 2 e 4
            place(out, clap(), t0 + k * e8, 0.55)
    # impacto final
    place(out, kick(1.2), a.compassos * bar, 1.0)
    out = np.tanh(out * 1.2)
    out /= np.abs(out).max() + 1e-9
    fade = int(SR * 0.8); out[-fade:] *= np.linspace(1, 0, fade)
    with wave.open(a.saida, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((out * 0.85 * 32767).astype(np.int16).tobytes())
    print(f'salvo: {a.saida} ({a.compassos} compassos a {a.bpm} BPM = {bar * a.compassos:.2f}s)')


if __name__ == '__main__':
    main()
