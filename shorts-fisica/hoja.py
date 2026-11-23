# Arma una hoja con varias fotos para revisarlas de un vistazo:  python hoja.py out/hoja.jpg 5 out/foto_*.png
import sys; from PIL import Image
out, cols, files = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
ims = [Image.open(f).convert('RGB') for f in files]; w = 360; h = int(w * ims[0].height / ims[0].width)
S = Image.new('RGB', (w * cols, h * -(-len(ims) // cols)))
for i, im in enumerate(ims): S.paste(im.resize((w, h), Image.LANCZOS), ((i % cols) * w, (i // cols) * h))
S.save(out, quality=88)
