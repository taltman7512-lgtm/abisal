"""Mide el movimiento de cámara de un video cuadro a cuadro (30 fps).

Uso:  python movimiento.py <video.mp4 | carpeta de cuadros f%05d.jpg> [--json salida.json]

Por cada par de cuadros estima una transformación de similitud (traslación + zoom + giro) con puntos seguidos
(Lucas-Kanade + RANSAC) y deja:
  - vel: velocidad de la cámara en % del ancho del cuadro por segundo
  - zoom: cambio de escala en % por segundo (positivo = se acerca)
  - res: movimiento que NO es de cámara (personajes, criatura, partículas), en % del ancho por segundo
A partir de eso: barridos (tramos rápidos), cuánto dura cada uno y hacia dónde van, cuánto dura cada encuadre
sostenido, qué velocidad tiene la cámara dentro del encuadre, cuánto empuja (zoom) y cuánto tiembla.
"""
import sys, os, glob, json, subprocess
import numpy as np, cv2

FPS, W, H = 30, 270, 360


def cuadros(src):
    if os.path.isdir(src):
        for f in sorted(glob.glob(os.path.join(src, "*.jpg"))):
            g = cv2.imread(f, cv2.IMREAD_GRAYSCALE)
            yield cv2.resize(g, (W, H), interpolation=cv2.INTER_AREA)
    else:
        p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", src, "-vf", f"fps={FPS},scale={W}:{H},format=gray",
                              "-f", "rawvideo", "-"], stdout=subprocess.PIPE)
        n = W * H
        while True:
            b = p.stdout.read(n)
            if len(b) < n:
                break
            yield np.frombuffer(b, np.uint8).reshape(H, W)


# el subtítulo (una palabra que salta al 75 % del alto, o al 22 %) no cuenta como movimiento
MASK = np.full((H, W), 255, np.uint8); MASK[int(H * .67):int(H * .83)] = 0; MASK[int(H * .16):int(H * .28)] = 0


def medir(src):
    prev = None
    out = []  # dx, dy, escala, residuo, dif, ok
    for g in cuadros(src):
        if prev is None:
            prev = g
            continue
        dif = float(np.abs(g.astype(np.int16) - prev.astype(np.int16)).mean())
        dx = dy = 0.0; sc = 1.0; res = 0.0; ok = 0
        pts = cv2.goodFeaturesToTrack(prev, 300, 0.01, 6, mask=MASK)
        if pts is not None and len(pts) >= 12:
            nxt, st, _ = cv2.calcOpticalFlowPyrLK(prev, g, pts, None, winSize=(21, 21), maxLevel=4)
            a, b = pts[st.ravel() == 1].reshape(-1, 2), nxt[st.ravel() == 1].reshape(-1, 2)
            if len(a) >= 12:
                M, inl = cv2.estimateAffinePartial2D(a, b, method=cv2.RANSAC, ransacReprojThreshold=2.0)
                if M is not None and inl is not None and inl.sum() >= 8:
                    sc = float(np.hypot(M[0, 0], M[1, 0]))
                    c = np.array([W / 2, H / 2, 1.0])
                    dx, dy = float(M[0] @ c - W / 2), float(M[1] @ c - H / 2)
                    pred = a @ M[:, :2].T + M[:, 2]
                    e = np.linalg.norm(b - pred, axis=1)
                    res = float(np.percentile(e, 90))
                    ok = 1
        out.append((dx, dy, sc, res, dif, ok))
        prev = g
    return np.array(out, np.float32)


def tramos(mask):
    r, i = [], 0
    while i < len(mask):
        if mask[i]:
            j = i
            while j < len(mask) and mask[j]:
                j += 1
            r.append((i, j)); i = j
        else:
            i += 1
    return r


def resumen(m):
    dx, dy, sc, res, dif, ok = m.T
    vel = np.hypot(dx, dy) / W * 100 * FPS          # % del ancho por segundo
    zoom = (sc - 1) * 100 * FPS                      # % por segundo
    resv = res / W * 100 * FPS
    dur = len(m) / FPS
    # corte duro: pico aislado de diferencia
    cortes = [t for t in range(2, len(dif) - 2) if dif[t] > 22 and dif[t] > 3 * max(dif[t - 2], dif[t - 1], dif[t + 1], dif[t + 2])]
    # barrido: cámara a más de 150 % del ancho por segundo, o seguimiento perdido con mucha diferencia (desenfoque)
    rap = (vel > 150) | ((ok == 0) & (dif > 14))
    for t in cortes:
        rap[t] = False
    # unir huecos de 1 cuadro
    for i in range(1, len(rap) - 1):
        if rap[i - 1] and rap[i + 1]:
            rap[i] = True
    bar = [(a, b) for a, b in tramos(rap) if b - a >= 2]
    durs = [(b - a) / FPS for a, b in bar]
    dirs = {"izq-der": 0, "arr-aba": 0, "sin dato": 0}
    for a, b in bar:
        sx, sy = np.abs(dx[a:b][ok[a:b] == 1]).sum(), np.abs(dy[a:b][ok[a:b] == 1]).sum()
        dirs["sin dato" if sx + sy == 0 else ("izq-der" if sx >= sy else "arr-aba")] += 1
    ev = sorted([a for a, _ in bar] + cortes)
    fin = sorted([b for _, b in bar] + [c + 1 for c in cortes])
    holds = []
    ini = 0
    for a, b in zip(ev, fin):
        if a - ini >= 3:
            holds.append((ini, a))
        ini = b
    if len(m) - ini >= 3:
        holds.append((ini, len(m)))
    hd = [(b - a) / FPS for a, b in holds]
    hv = [float(np.median(vel[a:b])) for a, b in holds]
    hz = [float(np.median(zoom[a:b])) for a, b in holds]
    quieto = float(np.mean([v < 1.0 and abs(z) < 0.5 for v, z in zip(hv, hz)])) if hv else 0
    # temblor: cambio de dirección cuadro a cuadro dentro de los encuadres
    jit = []
    for a, b in holds:
        if b - a > 6:
            ax = np.diff(dx[a:b]); ay = np.diff(dy[a:b])
            jit.append(float(np.median(np.hypot(ax, ay)) / W * 100))
    q = lambda v, p: round(float(np.percentile(v, p)), 2) if len(v) else None
    return {
        "dur_s": round(dur, 1),
        "cortes_duros_por_min": round(len(cortes) / dur * 60, 1),
        "barridos_por_min": round(len(bar) / dur * 60, 1),
        "cambios_por_min": round((len(bar) + len(cortes)) / dur * 60, 1),
        "barrido_dur_s": {"p25": q(durs, 25), "mediana": q(durs, 50), "p75": q(durs, 75)},
        "barrido_direccion": dirs,
        "encuadre_dur_s": {"p25": q(hd, 25), "mediana": q(hd, 50), "p75": q(hd, 75), "max": q(hd, 100)},
        "vel_en_encuadre_pct_s": {"p25": q(hv, 25), "mediana": q(hv, 50), "p75": q(hv, 75)},
        "zoom_en_encuadre_pct_s": {"p25": q(hz, 25), "mediana": q(hz, 50), "p75": q(hz, 75)},
        "encuadres_quietos_pct": round(quieto * 100, 1),
        "temblor_pct": q(jit, 50),
        "mov_no_camara_pct_s": {"mediana": q(resv[ok == 1], 50), "p90": q(resv[ok == 1], 90)},
        "_barridos": [(round(a / FPS, 2), round(b / FPS, 2)) for a, b in bar],
        "_cortes": [round(t / FPS, 2) for t in cortes],
        "_encuadres": [(round(a / FPS, 2), round(b / FPS, 2), round(v, 1), round(z, 1)) for (a, b), v, z in zip(holds, hv, hz)],
    }


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    js = next((a.split("=", 1)[1] for a in sys.argv if a.startswith("--json=")), None)
    todo = {}
    for src in args:
        r = resumen(medir(src))
        todo[os.path.basename(src.rstrip("/\\"))] = r
        print(os.path.basename(src), json.dumps({k: v for k, v in r.items() if not k.startswith("_")}, ensure_ascii=False))
    if js:
        json.dump(todo, open(js, "w", encoding="utf-8"), ensure_ascii=False)
