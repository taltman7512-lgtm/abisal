# Guion de «We Pay The Mountain In Teeth» — reglas «Romper el techo» (45–70 s, criatura a plena luz en el segundo 0,
# giro cada 5–8 s, final en loop con la primera frase). Protagonista fijo del canal: Toby (buzo naranja).
import json, os
D = os.path.dirname(os.path.abspath(__file__))
G = [  # nombre, texto, pausa después
 ("open", "The mountain opened its mouth today. It wants my brother's last tooth.", .1),
 ("rule", "In Gumridge, every kid pays the mountain. One baby tooth, every Sunday.", .1),
 ("cost", "Forget, and it leans down and bites your house.", .1),
 ("smile", "So we wear our teeth on strings. And nobody smiles near the mountain.", .1),
 ("pell", "Doctor Pell collects the teeth. He's the only one who smiles.", .1),
 ("ollie", "My brother Ollie has one tooth left. It isn't even loose.", .1),
 ("pliers", "Today, Pell came for it anyway. With pliers.", .1),
 ("bag", "I grabbed his bag. It was heavy. Full of teeth.", .1),
 ("never", "Hundreds of them. He never fed the mountain at all.", .1),
 ("gold", "For every tooth, the mountain spits out gold. Pell keeps the gold.", .1),
 ("hungry", "And the mountain stays hungry.", .1),
 ("rumble", "The ground shook. The mountain was leaning down. Over our street.", .1),
 ("run", "Everyone ran. Pell ran faster.", .1),
 ("climb", "I climbed onto its lip, with the bag.", .1),
 ("pour", "And I poured every tooth into its mouth.", .1),
 ("chew", "It chewed for a long time.", .2),
 ("sleep", "Then it closed its eyes, and went back up.", .1),
 ("smiled", "Ollie smiled at the mountain. First kid in Gumridge to do it.", .1),
 ("back", "The mountain smiled back.", .2),
 ("end", "And that's why, today, the mountain opened its mouth.", .02),
]
assert len({n for n, _, _ in G}) == len(G)
json.dump([{"n": n, "t": t, "gap": g} for n, t, g in G], open(os.path.join(D, "frases.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
R = os.path.dirname(D)
json.dump([t for _, t, _ in G], open(os.path.join(R, "voz.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
open(os.path.join(R, "guion.txt"), "w", encoding="utf-8").write(" ".join(t for _, t, _ in G))
w = sum(len(t.split()) for _, t, _ in G)
print(len(G), "frases,", w, "palabras; a 260 por minuto:", round(w / 260 * 60 + sum(g for _, _, g in G), 1), "s")
