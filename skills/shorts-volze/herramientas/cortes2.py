"""Detector de cortes duros por pico aislado de diferencia entre frames (robusto a paletas uniformes)."""
import sys, os, glob, json, subprocess
import numpy as np

BASE = r"C:\Users\123\Documents\volze-fuentes"
W, H, FPS = 72, 96, 30


def frames(path):
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vf", f"fps={FPS},scale={W}:{H},format=rgb24",
                        "-f", "rawvideo", "-"], capture_output=True)
    a = np.frombuffer(r.stdout, np.uint8).reshape(-1, H, W, 3).astype(np.float32)
    return a


def detect(a, ratio=3.0, floor=18.0):
    # Diferencia por histograma de color (gruesa, insensible a pequeños movimientos) + diferencia de píxel
    q = (a // 32).astype(np.int32)
    idx = q[..., 0] * 64 + q[..., 1] * 8 + q[..., 2]
    hist = np.stack([np.bincount(i.ravel(), minlength=512) for i in idx]).astype(np.float32)
    hist /= hist.sum(1, keepdims=True)
    dh = np.abs(np.diff(hist, axis=0)).sum(1) * 50          # 0..100
    dp = np.abs(np.diff(a, axis=0)).mean((1, 2, 3))        # 0..255
    d = dh + dp
    cuts = []
    for t in range(2, len(d) - 2):
        nb = max(d[t - 2], d[t - 1], d[t + 1], d[t + 2])
        if d[t] > floor and d[t] > ratio * nb:
            cuts.append(round((t + 1) / FPS, 2))
    return cuts, d


if __name__ == "__main__":
    files = sorted(glob.glob(os.path.join(BASE, "videos", "*.mp4")))
    if len(sys.argv) > 1:
        files = [f for f in files if any(k in f for k in sys.argv[1:])]
    res = {}
    for f in files:
        name = os.path.basename(f)[:-4]
        a = frames(f)
        c, d = detect(a)
        dur = len(a) / FPS
        sh = np.diff([0] + c + [dur])
        # Barridos: picos de la diferencia suavizada (ventana 0,2 s) > 35, separados al menos 0,4 s
        ds = np.convolve(d, np.ones(6) / 6, "same")
        pk = [t for t in range(1, len(ds) - 1) if ds[t] > 35 and ds[t] >= ds[t - 1] and ds[t] > ds[t + 1]]
        wh = []
        for t in pk:
            if not wh or (t - wh[-1]) / FPS >= 0.4:
                wh.append(t)
            elif ds[t] > ds[wh[-1]]:
                wh[-1] = t
        wh = [round((t + 1) / FPS, 2) for t in wh]
        ev = sorted(set(wh) | set(c))
        gaps = np.diff([0] + ev + [dur])
        res[name] = {"cortes": c, "n": len(c), "plano_medio": round(float(sh.mean()), 2),
                     "plano_mediana": round(float(np.median(sh)), 2), "plano_max": round(float(sh.max()), 1),
                     "cortes_por_min": round(len(c) / dur * 60, 1),
                     "cortes_0_3s": [x for x in c if x < 3], "mov_medio": round(float(np.median(d)), 2),
                     "barridos": wh, "n_barridos": len(wh), "cambios_encuadre_por_min": round(len(ev) / dur * 60, 1),
                     "encuadre_mediana_s": round(float(np.median(gaps)), 2), "cambios_0_3s": [x for x in ev if x < 3]}
        r = res[name]
        print(name, "cortes", r["n"], "barridos", r["n_barridos"], "camb/min", r["cambios_encuadre_por_min"],
              "mediana", r["encuadre_mediana_s"], "0-3s", r["cambios_0_3s"], flush=True)
    out = os.path.join(BASE, "analisis", "_cortes2.json")
    old = json.load(open(out)) if os.path.exists(out) else {}
    old.update(res)
    json.dump(old, open(out, "w"), indent=1)
