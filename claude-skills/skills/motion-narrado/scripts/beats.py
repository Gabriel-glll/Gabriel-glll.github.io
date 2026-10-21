# Detecta as batidas de uma música (para sincronizar cortes).
# Uso: python scripts/beats.py musica.mp3 [inicio_s=0] [duracao_s=30] -> JSON {tempo, beats:[s...]} relativo ao início
import json, sys
import librosa

path = sys.argv[1]
start = float(sys.argv[2]) if len(sys.argv) > 2 else 0
dur = float(sys.argv[3]) if len(sys.argv) > 3 else 30
y, sr = librosa.load(path, sr=22050, offset=start, duration=dur)
tempo, frames = librosa.beat.beat_track(y=y, sr=sr)
beats = librosa.frames_to_time(frames, sr=sr).round(3).tolist()
onset = librosa.onset.onset_strength(y=y, sr=sr)
print(json.dumps({'start': start, 'tempo': float(tempo if not hasattr(tempo, '__len__') else tempo[0]), 'beats': beats}))
