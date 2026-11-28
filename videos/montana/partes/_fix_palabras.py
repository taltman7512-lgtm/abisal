# Los subtítulos llevan el texto del guion: reemplaza las palabras de whisper por las del guion (mismos tiempos)
import json, os
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = json.load(open(os.path.join(R, "palabras.json"), encoding="utf-8")); L = json.load(open(os.path.join(R, "voz.json"), encoding="utf-8"))
mal = 0
for i, (p, l) in enumerate(zip(P, L)):
    g = l.split()
    # «On tusk» → una sola palabra
    j = 0
    while j < len(p) - 1:
        if p[j][0].lower().strip(",.") == "on" and p[j + 1][0].lower().strip(",.") == "tusk" and len(p) > len(g): p[j] = [p[j][0], p[j][1], p[j + 1][2]]; del p[j + 1]
        j += 1
    if len(p) == len(g):
        for w, t in zip(p, g): w[0] = t
    else: mal += 1; print("NO COINCIDE", i, [w[0] for w in p], "|", l)
json.dump(P, open(os.path.join(R, "palabras.json"), "w", encoding="utf-8"), ensure_ascii=False)
print("ok", sum(len(p) for p in P), "palabras;", mal, "frases sin coincidir")
