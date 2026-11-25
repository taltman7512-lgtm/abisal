# Voz: corta completa.mp3 por frases, arregla la frase 44/45 («Onetusk» quedaba pegado a la anterior) y pone el texto del guion
import subprocess, sys, os, json, numpy as np, soundfile as sf
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); H = os.path.join(R, "..", "..", "skills", "shorts-volze", "herramientas"); os.chdir(R)
tempo = sys.argv[1] if len(sys.argv) > 1 else "1.45"
subprocess.run([sys.executable, os.path.join(H, "cortar_completo.py"), "voz-eleven/completa.mp3", "--tempo", tempo], check=True)
a, sr = sf.read("voz/44.wav", dtype="float32"); b, _ = sf.read("voz/45.wav", dtype="float32")
h = int(.01 * sr); env = np.array([np.sqrt(np.mean(a[k:k + h] ** 2)) for k in range(0, len(a) - h, h)]); bajo = env < .012
# el último silencio de ≥ 70 ms: después viene «Onetusk»
k = len(bajo) - 1; corte = None
while k > 0:
    if bajo[k]:
        j = k
        while j > 0 and bajo[j]: j -= 1
        if k - j >= 7 and k < len(bajo) - 8: corte = (j + k) // 2 * h; break
        k = j
    k -= 1
if corte and (len(a) - corte) / sr > .2: sf.write("voz/44.wav", a[:corte], sr); sf.write("voz/45.wav", np.concatenate([a[corte:], b]), sr); print("44/45 arreglado en", round(corte / sr, 2))
subprocess.run([sys.executable, os.path.join(H, "palabras.py"), "."], check=True, stdout=subprocess.DEVNULL)
P = json.load(open("palabras.json", encoding="utf-8")); L = json.load(open("voz.json", encoding="utf-8"))
n = lambda w: "".join(ch for ch in w.lower() if ch.isalnum())
for i, (p, l) in enumerate(zip(P, L)):
    g = l.split(); j = 0
    while len(p) > len(g) and j < len(p) - 1:   # whisper partió una palabra del guion en dos
        if j < len(g) and n(p[j][0]) != n(g[j]): p[j] = [g[j], p[j][1], p[j + 1][2]]; del p[j + 1]
        j += 1
    j = 0
    while len(p) < len(g) and j < len(p):       # whisper juntó dos palabras del guion
        if n(p[j][0]) != n(g[j]): m = (p[j][1] + p[j][2]) / 2; p[j:j + 1] = [[g[j], p[j][1], m], [g[j + 1], m, p[j][2]]]
        j += 1
    assert len(p) == len(g), (i, [w[0] for w in p], l)
    for w, t in zip(p, g): w[0] = t
json.dump(P, open("palabras.json", "w", encoding="utf-8"), ensure_ascii=False)
print("palabras", sum(len(p) for p in P))
