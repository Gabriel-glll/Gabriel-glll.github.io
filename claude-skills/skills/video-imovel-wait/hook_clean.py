# Recorta os 4 s iniciais da referência (gotas na tampa da panela) e apaga o texto "Wait if you love Japan" (inpaint).
import cv2, numpy as np, subprocess, os
D = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(D, '..', '..', 'public', 'ref-japan', 'hook.mp4')
cap = cv2.VideoCapture(os.path.join(D, 'ref.mp4'))
W, H, FPS = 1080, 1920, 30
ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                       '-c:v', 'libx264', '-crf', '14', '-pix_fmt', 'yuv420p', OUT], stdin=subprocess.PIPE)
y0, y1 = int(0.205 * H), int(0.32 * H)  # faixa do texto
for i in range(int(4.0 * FPS)):
    ok, f = cap.read()
    if not ok: break
    f = cv2.resize(f, (W, H), interpolation=cv2.INTER_AREA)
    band = f[y0:y1]
    hsv = cv2.cvtColor(band, cv2.COLOR_BGR2HSV)
    m = ((hsv[..., 2] > 200) & (hsv[..., 1] < 60)) | ((hsv[..., 0] < 12) | (hsv[..., 0] > 165)) & (hsv[..., 1] > 70) & (hsv[..., 2] > 70)
    m = m.astype(np.uint8) * 255
    m[:, :int(0.25 * W)] = 0; m[:, int(0.75 * W):] = 0  # texto é centralizado
    m = cv2.dilate(m, np.ones((9, 9), np.uint8), iterations=2)
    f[y0:y1] = cv2.inpaint(band, m, 9, cv2.INPAINT_TELEA)
    ff.stdin.write(f.tobytes())
ff.stdin.close(); ff.wait(); print('ok', OUT)
