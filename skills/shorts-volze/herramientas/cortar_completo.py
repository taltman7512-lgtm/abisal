"""Corta una voz completa (ElevenLabs u otra, un solo MP3 con todo el guion) en una frase por archivo: voz/NN.wav.
Alinea las palabras de whisper (CUDA) con las del guion (voz.json) y corta cada frase entre su primera y su última palabra.
Uso (desde la carpeta del proyecto):  python cortar_completo.py voz-eleven/completa.mp3 [--tempo 1.15]
--tempo acelera cada frase sin cambiar el tono (rubberband, formantes preservados), para acercarse a ≈ 250 palabras/min."""
import os, sys, json, re, difflib, subprocess, argparse, numpy as np, soundfile as sf
SP = os.path.join(os.path.dirname(sys.executable), "Lib", "site-packages", "nvidia")
for s in ("cublas", "cudnn"):
    d = os.path.join(SP, s, "bin"); os.add_dll_directory(d); os.environ["PATH"] = d + os.pathsep + os.environ["PATH"]
from faster_whisper import WhisperModel

a = argparse.ArgumentParser(); a.add_argument("mp3"); a.add_argument("--tempo", type=float, default=1.0); a = a.parse_args()
P = os.getcwd(); L = json.load(open(os.path.join(P, "voz.json"), encoding="utf-8"))
tmp = os.path.join(P, "voz", "_completa48k.wav"); os.makedirs(os.path.join(P, "voz"), exist_ok=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a.mp3, "-ac", "1", "-ar", "48000", tmp], check=True)
x, sr = sf.read(tmp, dtype="float32"); x16 = x[::3]
m = WhisperModel("large-v3", device="cuda", compute_type="float16")
W = [(w.word, w.start, w.end) for s in m.transcribe(x16, language="en", word_timestamps=True, initial_prompt=" ".join(L)[:800])[0] for w in s.words]
norm = lambda t: re.sub(r"[^a-z0-9]", "", t.lower())
num = {"12": "twelve", "40": "forty", "42": "fortytwo", "1": "one", "2": "two", "3": "three"}
hw = [num.get(norm(w), norm(w)) for w, _, _ in W]
gw, own = [], []
# nombres inventados que whisper oye en dos palabras («Onetusk» → «on tusk»): voz-alias.json = {"onetusk": ["on", "tusk"]}
ALIAS = json.load(open(os.path.join(P, "voz-alias.json"), encoding="utf-8")) if os.path.exists(os.path.join(P, "voz-alias.json")) else {}
for i, l in enumerate(L):
    for t in l.split():
        for q in ALIAS.get(norm(t), [norm(t)]): gw.append(q); own.append(i)
sm = difflib.SequenceMatcher(None, gw, hw, autojunk=False); idx = [None] * len(gw)
for b in sm.get_matching_blocks():
    for k in range(b.size): idx[b.a + k] = b.b + k
cortes = []
for i in range(len(L)):
    ks = [idx[j] for j in range(len(gw)) if own[j] == i and idx[j] is not None]
    if not ks: print("SIN ALINEAR frase", i, L[i]); cortes.append(None); continue
    cortes.append((W[min(ks)][1], W[max(ks)][2]))
# límites entre frases: en el silencio más largo entre la última palabra de una y la primera de la siguiente
# (whisper a veces corre el inicio de la frase siguiente y se lleva la última palabra de la anterior: «hungry» terminaba en la frase 16)
env = np.array([np.sqrt(np.mean(x[k:k + int(.02 * sr)] ** 2)) for k in range(0, len(x) - int(.02 * sr), int(.02 * sr))])
def corte_en_silencio(t0, t1):
    a0, a1 = int(t0 / .02), max(int(t0 / .02) + 1, int(t1 / .02))
    if a1 - a0 < 3: return (t0 + t1) / 2
    seg = np.convolve(env[a0:a1], np.ones(3) / 3, "same"); bajo = seg < .015
    # el ÚLTIMO silencio de al menos 60 ms antes de la frase siguiente (no el más largo: una pausa dramática dentro de la frase
    # «Two lamps. Always.» era más larga que la pausa entre frases y se llevaba «Always» a la frase siguiente)
    k = len(seg) - 1
    while k >= 0:
        if bajo[k]:
            j = k
            while j >= 0 and bajo[j]: j -= 1
            if k - j >= 3: return (a0 + (j + 1 + k) // 2) * .02
            k = j
        k -= 1
    return (a0 + int(np.argmin(seg))) * .02
lim = [None] * (len(cortes) + 1)
validos = [i for i, c in enumerate(cortes) if c]
for a_, b_ in zip(validos, validos[1:]):
    ultimo_ini = W[max(idx[j] for j in range(len(gw)) if own[j] == a_ and idx[j] is not None)][1]
    lim[b_] = corte_en_silencio(ultimo_ini + .08, cortes[b_][0] + .35)
for i, c in enumerate(cortes):
    if c is None: continue
    ini = lim[i] if lim[i] is not None else max(0, c[0] - .06)
    sig = next((lim[j] for j in range(i + 1, len(cortes)) if lim[j] is not None), None)
    fin = sig if sig else min(len(x) / sr, c[1] + .5)
    seg = x[int(ini * sr):int(fin * sr)]; out = os.path.join(P, "voz", f"{i:02d}.wav")
    # pausas internas (ElevenLabs deja ~0,5 s entre oraciones dentro de una frase): cada silencio de más de 0,2 s queda en 0,16 s
    w = int(.02 * sr); n = len(seg) // w; e = np.array([np.sqrt(np.mean(seg[k * w:(k + 1) * w] ** 2)) for k in range(n)]) < .012
    keep = np.ones(len(seg), bool); k = 0
    while k < n:
        if e[k]:
            j = k
            while j < n and e[j]: j += 1
            if (j - k) * .02 > .2 and k > 0 and j < n: c = (k + j) // 2 * w; keep[(k * w + int(.08 * sr)):c] = False; keep[c:(j * w - int(.08 * sr))] = False
            k = j
        else: k += 1
    seg = seg[keep]; sf.write(out + ".raw.wav", seg, sr)
    af = f"rubberband=tempo={a.tempo}:formant=preserved:pitchq=quality" if a.tempo != 1 else "anull"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", out + ".raw.wav", "-af", af, out], check=True); os.remove(out + ".raw.wav")
os.remove(tmp)
tot = sum((c[1] - c[0]) / a.tempo for c in cortes if c); print(f"{sum(1 for c in cortes if c)}/{len(L)} frases cortadas · voz {tot:.1f} s · {len(gw) / tot * 60:.0f} palabras/min sin pausas")
