# Imagens do Flow (768x1376) → 1080x1920 prontas para o vídeo: Lanczos + UnsharpMask + cor leve.
# NÃO usar Real-ESRGAN em lote aqui: deixou blocos quebrados nas imagens do Flow.
# Uso: python finalizar.py <pasta_flow> <pasta_final>   (precisa do cine-grade.py ao lado)
import os, subprocess, sys
from PIL import Image, ImageFilter

src, dst = sys.argv[1], sys.argv[2]
os.makedirs(dst, exist_ok=True)
grade = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cine-grade.py')
for f in sorted(os.listdir(src)):
    if not f.lower().endswith(('.jpg', '.png', '.webp')):
        continue
    out = os.path.join(dst, os.path.splitext(f)[0] + '.jpg')
    im = Image.open(os.path.join(src, f)).convert('RGB').resize((1080, 1920), Image.LANCZOS)
    im.filter(ImageFilter.UnsharpMask(radius=1.6, percent=70, threshold=2)).save(out, quality=95)
    subprocess.run([sys.executable, grade, out, out, '--forca', '0.6'], check=True)
