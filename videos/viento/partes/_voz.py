# Voz: corta completa.mp3 por frases, pone el texto del guion
import subprocess, sys, os, json, numpy as np, soundfile as sf
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); H = os.path.join(R, "..", "..", "skills", "shorts-volze", "herramientas"); os.chdir(R)
tempo = sys.argv[1] if len(sys.argv) > 1 else "1.45"
subprocess.run([sys.executable, os.path.join(H, "cortar_completo.py"), "voz-eleven/completa.mp3", "--tempo", tempo], check=True)
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
