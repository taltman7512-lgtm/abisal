"""Cuenta y ubica los efectos de sonido de un video y los cruza con los movimientos de cámara y con la voz.

Uso:  python sonido_eventos.py <fondo.wav (pista sin voz)> [--mov=movimiento.json --id=top02] [--palabras=analisis.json]

Un «golpe» es un salto brusco de energía en la pista sin voz (flujo espectral por encima de la mediana local).
Devuelve: golpes por minuto, cuántos caen a menos de 0,15 s del inicio de un barrido o corte (y cuántos barridos
tienen golpe), cuántos caen en pausas de la voz, y el reparto por banda (grave < 200 Hz, medio, agudo > 4 kHz).
"""
import sys, json
import numpy as np, soundfile as sf

a = [x for x in sys.argv[1:] if not x.startswith("--")]
o = dict(x[2:].split("=", 1) for x in sys.argv[1:] if x.startswith("--"))
x, sr = sf.read(a[0])
if x.ndim > 1:
    x = x.mean(1)
N, Hh = 2048, 512
w = np.hanning(N)
n = 1 + (len(x) - N) // Hh
S = np.abs(np.stack([np.fft.rfft(x[i * Hh:i * Hh + N] * w) for i in range(n)]))
L = np.log1p(S * 50)
fl = np.maximum(0, np.diff(L, axis=0)).sum(1)
t = (np.arange(1, n) * Hh + N / 2) / sr
k = int(1.0 * sr / Hh)
med = np.array([np.median(fl[max(0, i - k):i + k]) for i in range(len(fl))])
mad = np.array([np.median(np.abs(fl[max(0, i - k):i + k] - med[i])) for i in range(len(fl))]) + 1e-6
z = (fl - med) / mad
pk = [i for i in range(2, len(z) - 2) if z[i] > 9 and fl[i] == fl[i - 2:i + 3].max() and fl[i] > np.percentile(fl, 75)]
ev = []
for i in pk:
    if not ev or t[i] - t[ev[-1]] > 0.12:
        ev.append(i)
f = np.fft.rfftfreq(N, 1 / sr)
bandas = {"grave": 0, "medio": 0, "agudo": 0}
for i in ev:
    d = np.maximum(0, L[i + 1] - L[i])
    g, m, ag = d[f < 200].sum(), d[(f >= 200) & (f < 4000)].sum(), d[f >= 4000].sum()
    bandas[["grave", "medio", "agudo"][int(np.argmax([g / 20, m / 350, ag / 800]))]] += 1
te = t[ev]
dur = len(x) / sr
r = {"dur_s": round(dur, 1), "golpes": len(ev), "golpes_por_min": round(len(ev) / dur * 60, 1), "bandas": bandas}
if "mov" in o:
    mv = json.load(open(o["mov"], encoding="utf-8"))[o["id"]]
    ini = np.array([b[0] for b in mv["_barridos"]] + mv["_cortes"])
    if len(ini) and len(te):
        cerca = np.array([np.abs(ini - q).min() < 0.15 for q in te])
        con = np.array([np.abs(te - q).min() < 0.15 for q in ini])
        r["golpes_sobre_cambio_de_camara_pct"] = round(float(cerca.mean()) * 100, 1)
        r["cambios_de_camara_con_golpe_pct"] = round(float(con.mean()) * 100, 1)
if "palabras" in o:
    P = json.load(open(o["palabras"], encoding="utf-8"))["palabras"]
    habla = lambda q: any(p["start"] - .03 <= q <= p["end"] + .03 for p in P)
    r["golpes_en_pausa_de_voz_pct"] = round(float(np.mean([not habla(q) for q in te])) * 100, 1) if len(te) else None
    pausas = [P[i + 1]["start"] - P[i]["end"] for i in range(len(P) - 1)]
    r["voz_callada_pct"] = round(sum(p for p in pausas if p > 0.05) / dur * 100, 1)
    r["pausas_mas_de_0.4s"] = int(sum(p > 0.4 for p in pausas))
print(json.dumps(r, ensure_ascii=False))
