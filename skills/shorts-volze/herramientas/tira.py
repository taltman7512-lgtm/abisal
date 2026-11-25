"""Tira de cuadros seguidos para mirar movimiento (caminatas, corridas, criatura, barridos).

Uso:  python tira.py <carpeta de cuadros a 30 fps> <t0> <t1> <salida.jpg> [--paso=2] [--cols=8] [--ancho=200]

Lee los cuadros f%05d.jpg (30 por segundo) entre t0 y t1 (segundos), toma uno cada `paso` cuadros y arma una
plancha con el segundo escrito en cada cuadro. paso=1 → 30 fps, paso=2 → 15 fps, paso=3 → 10 fps.
Para un video propio primero sacar los cuadros:  ffmpeg -i video.mp4 -vf "fps=30,scale=360:-2" -q:v 5 dir/f%05d.jpg
"""
import sys, os
import cv2, numpy as np

a = [x for x in sys.argv[1:] if not x.startswith("--")]
o = dict(x[2:].split("=") for x in sys.argv[1:] if x.startswith("--"))
d, t0, t1, out = a[0], float(a[1]), float(a[2]), a[3]
paso, cols, ancho = int(o.get("paso", 2)), int(o.get("cols", 8)), int(o.get("ancho", 200))
ims = []
for n in range(int(round(t0 * 30)) + 1, int(round(t1 * 30)) + 2, paso):
    f = os.path.join(d, f"f{n:05d}.jpg")
    if not os.path.exists(f):
        break
    im = cv2.imread(f)
    h = int(im.shape[0] * ancho / im.shape[1])
    im = cv2.resize(im, (ancho, h), interpolation=cv2.INTER_AREA)
    s = f"{(n - 1) / 30:.2f}"
    cv2.putText(im, s, (4, 16), cv2.FONT_HERSHEY_SIMPLEX, .5, (0, 0, 0), 3)
    cv2.putText(im, s, (4, 16), cv2.FONT_HERSHEY_SIMPLEX, .5, (255, 255, 255), 1)
    ims.append(im)
if not ims:
    sys.exit("sin cuadros en ese rango")
while len(ims) % cols:
    ims.append(np.zeros_like(ims[0]))
rows = [np.hstack(ims[i:i + cols]) for i in range(0, len(ims), cols)]
cv2.imwrite(out, np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 82])
print(out, len(rows), "filas")
