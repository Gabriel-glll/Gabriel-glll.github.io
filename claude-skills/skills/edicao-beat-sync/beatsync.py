"""Analisa uma música e gera os tempos de CORTE sincronizados (para edição estilo AMV/trend).
Uso: python beatsync.py musica.mp3 saida.json [--modo percussao|batida|meia] [--inicio 0] [--fim 15] [--min 0.3]

Modos:
  grave      cortes no BUMBO/808 (graves) — o mais limpo para phonk, funk, trap (padrão)
  percussao  cortes nos golpes fortes de percussão (bumbo/caixa) — é o que os edits virais fazem (padrão)
  batida     um corte por batida (tempo)
  meia       um corte a cada 2 batidas (mais calmo)
Saída JSON: { bpm, duracao, cortes:[s...], fortes:[s...] }  — 'fortes' = golpes mais intensos (use flash/punch zoom)
"""
import argparse
import json

import librosa
import numpy as np


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('audio')
    ap.add_argument('saida')
    ap.add_argument('--modo', default='grave', choices=['grave', 'percussao', 'batida', 'meia'])
    ap.add_argument('--inicio', type=float, default=0)
    ap.add_argument('--fim', type=float, default=None)
    ap.add_argument('--min', type=float, default=0.3, help='intervalo mínimo entre cortes (s)')
    ap.add_argument('--livre', dest='regular', action='store_false', help='não regularizar o padrão (usa só o que detectou)')
    ap.add_argument('--ajuste', type=float, default=0.0, help='desloca todos os cortes (s). -0.05 = corta ~1 quadro antes do golpe (prática de editor; compensa atraso do AAC do Instagram)')
    a = ap.parse_args()

    y, sr = librosa.load(a.audio, sr=22050, mono=True, offset=a.inicio, duration=(a.fim - a.inicio) if a.fim else None)
    dur = len(y) / sr
    _, perc = librosa.effects.hpss(y)  # só a parte percussiva
    oenv = librosa.onset.onset_strength(y=perc, sr=sr, aggregate=np.median)
    tempo, beats = librosa.beat.beat_track(onset_envelope=oenv, sr=sr, tightness=120)
    bpm = float(np.atleast_1d(tempo)[0])
    beat_t = librosa.frames_to_time(beats, sr=sr)

    onsets = librosa.onset.onset_detect(onset_envelope=oenv, sr=sr, backtrack=False, units='frames')
    forca = oenv[onsets] if len(onsets) else np.array([])
    on_t = librosa.frames_to_time(onsets, sr=sr)

    if a.modo == 'grave':  # bumbo/808: energia só nos graves
        low = librosa.onset.onset_strength(y=y, sr=sr, n_mels=24, fmax=200, hop_length=256)
        pk = librosa.onset.onset_detect(onset_envelope=low, sr=sr, hop_length=256, units='frames')
        fl = low[pk] if len(pk) else np.array([])
        lim = np.percentile(fl, 40) if len(fl) else 0
        bt = librosa.onset.onset_backtrack(pk, low)  # recua até o ataque real do bumbo
        tp = librosa.frames_to_time(pk, sr=sr, hop_length=256); tb = librosa.frames_to_time(bt, sr=sr, hop_length=256)
        ta = np.where(tp - tb <= 0.05, tb, tp - 0.02)  # recuo limitado a 50 ms (evita pular p/ a nota anterior)
        cortes = [t for t, f in zip(ta, fl) if f >= lim]
    elif a.modo == 'batida':
        cortes = list(beat_t)
    elif a.modo == 'meia':
        cortes = list(beat_t[::2])
    else:
        lim = np.percentile(forca, 55) if len(forca) else 0  # só golpes acima da mediana
        cortes = [t for t, f in zip(on_t, forca) if f >= lim]
    # refina BPM e fase: acha a grade de semicolcheias que melhor casa com os cortes detectados
    c = np.array(cortes)
    if len(c) > 4:
        melhor = (1e9, bpm, 0.0)
        for b in np.arange(bpm - 4, bpm + 4, 0.05):
            passo = 60 / b / 4
            fase = np.angle(np.exp(2j * np.pi * c / passo).mean()) / (2 * np.pi) * passo  # média circular
            r = (c - fase) / passo
            erro = np.abs(r - np.round(r)).mean() * passo
            if erro < melhor[0]:
                melhor = (erro, b, fase)
        _, bpm, fase = melhor
        passo = 60 / bpm / 4
        idx = np.round((c - fase) / passo).astype(int)  # posição na grade de semicolcheias
        cortes = [float(fase + i * passo) for i in idx]  # encaixa na grade
        if a.regular:  # padrão rítmico do compasso (16 semicolcheias) repetido em todos os compassos
            n_comp = max(1, (idx.max() - idx.min()) / 16)
            cont = np.bincount(idx % 16, minlength=16)
            slots = [s for s in range(16) if cont[s] >= max(2, 0.6 * n_comp)]
            slots = [s for s in slots if not ((s + 1) % 16 in slots and cont[(s + 1) % 16] > cont[s]) and not ((s - 1) % 16 in slots and cont[(s - 1) % 16] >= cont[s])]
            if slots:
                cortes = [float(fase + i * passo) for i in range(idx.min(), idx.max() + 1) if i % 16 in slots]
                print('padrão do compasso (semicolcheias com corte):', slots)
    # intervalo mínimo e ordenação
    # intervalo mínimo e ordenação
    cortes = sorted(t + a.ajuste for t in cortes); limpo = []
    for t in cortes:
        if t > 0.15 and (not limpo or t - limpo[-1] >= a.min):
            limpo.append(round(float(t), 3))
    lim_f = np.percentile(forca, 88) if len(forca) else 0
    fortes = [round(float(t), 3) for t, f in zip(on_t, forca) if f >= lim_f]
    res = {'bpm': round(bpm, 1), 'duracao': round(dur, 3), 'modo': a.modo, 'cortes': limpo, 'fortes': fortes}
    with open(a.saida, 'w', encoding='utf-8') as fo:
        json.dump(res, fo, indent=1)
    gaps = np.diff([0] + limpo)
    print(f"BPM ~{res['bpm']} | {len(limpo)} cortes | intervalo médio {gaps.mean():.3f}s | {len(fortes)} fortes")


if __name__ == '__main__':
    main()
