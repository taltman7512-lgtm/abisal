"""Chequeo automático de TODOS los cuadros de un MP4 (pedido del dueño: revisar cada frame).
Uso:  python chequeo_cuadros.py video.mp4 [--hojas carpeta --fps 4]
Mide cada cuadro (gris 64×114) y marca:
  - negro (luminancia media < .06) o quemado (> 6 % de píxeles casi blancos)
  - salto de luz brusco entre cuadros seguidos dentro de una misma toma (diferencia media > .18 sin ser corte)
  - congelado (3+ cuadros idénticos seguidos)
  - parpadeo (un cuadro distinto de sus dos vecinos, que sí se parecen entre sí)
Con --hojas arma hojas de contacto densas (8×6 cuadros) para el agente revisor.
"""
import subprocess, sys, os, argparse, numpy as np
a = argparse.ArgumentParser(); a.add_argument("video"); a.add_argument("--hojas", default=""); a.add_argument("--fps", type=float, default=4); a = a.parse_args()
FF = os.environ.get("FFDEC", "ffmpeg")   # el de winget (el de Remotion no trae rawvideo)
W, H = 64, 114
raw = subprocess.run([FF, "-v", "error", "-i", a.video, "-vf", f"scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
F = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3).astype(np.float32) / 255
G = F.mean(3); n = len(G); fps = 60
lum = G.mean((1, 2)); blanco = (G > .97).mean((1, 2)); d = np.abs(np.diff(G, axis=0)).mean((1, 2))
t = lambda i: f"{i / fps:6.2f}s"
prob = []
for i in range(n):
    if lum[i] < .06: prob.append((i, "negro", f"lum {lum[i]:.3f}"))
    if blanco[i] > .06: prob.append((i, "quemado", f"{blanco[i] * 100:.1f}% blanco"))
for i in range(1, n - 1):
    if d[i - 1] > .12 and d[i] > .12 and np.abs(G[i + 1] - G[i - 1]).mean() < .04: prob.append((i, "parpadeo", f"dif {d[i - 1]:.2f}"))
cortes = np.where(d > .18)[0]
eq = 0
for i in range(len(d)):
    eq = eq + 1 if d[i] < 1e-5 else 0
    if eq == 2: prob.append((i, "congelado", "3 cuadros iguales"))
print(f"{n} cuadros revisados ({n / fps:.1f} s) · lum media {lum.mean():.3f} · cambios grandes de imagen (cortes/barridos): {len(cortes)}")
for i, k, x in prob[:300]: print(t(i), f"cuadro {i:5d}", k, x)
print("problemas:", len(prob))
if a.hojas:
    os.makedirs(a.hojas, exist_ok=True)
    subprocess.run([FF, "-v", "error", "-y", "-i", a.video, "-vf", f"fps={a.fps},scale=180:320,drawtext=fontfile='C\\:/Windows/Fonts/arial.ttf':text='%{{pts\\:hms}}':x=4:y=4:fontsize=18:fontcolor=yellow:box=1:boxcolor=black@0.6,tile=8x6", os.path.join(a.hojas, "hoja-%02d.jpg")])
    print("hojas en", a.hojas, sorted(os.listdir(a.hojas)), f"· cuadro k (0-47, de izq. a der. y de arriba abajo) de la hoja N = segundo (N-1)*{48 / a.fps:g} + k/{a.fps:g}")
