# Guion de «Nobody Answers The Knock»: escribe partes/frases.json, voz.json y guion.txt
# Capas (skill «Historias más ricas»): la regla sin cartel (picaportes arrancados, roperos contra la puerta, bodas sin «sí»),
# un secundario con historia (Marga), un objeto que pasa de mano en mano (el abrigo de la colina), humor seco (el coro),
# la muletilla de Tib (buenas noches cinco veces) que vuelve con otro sentido, y un detalle plantado temprano que paga
# al final (la única puerta con picaporte, la de Crane).
import json, os
D = os.path.dirname(os.path.abspath(__file__))
G = [  # nombre, texto, pausa después
 ("open", "Tonight, something knocked on our door, with my mother's voice.", .1),
 ("rule", "In Hollowmere, nobody answers a knock after dark.", .1),
 ("cost", "If you answer, the Weaver takes your voice.", .1),
 ("mystery", "Nobody knows how it picks the door.", .2),
 ("tall", "It's taller than the church. It's made of old coats, sewn together.", .1),
 ("arms", "Its arms are coat hangers. Its face is one big button.", .1),
 ("voices", "It knocks with the voices it took. Your neighbor. Your teacher. Your grandpa, asking for soup.", .2),
 ("handles", "So we pulled the handles off our doors.", .1),
 ("wardrobe", "We sleep with the wardrobe against the door.", .1),
 ("wed", "At weddings, nobody says I do. They just nod.", .1),
 ("choir", "My little brother Tib says it must sing terribly. It took the whole choir.", .2),
 ("goodnight", "Tib says goodnight five times every night. Just in case.", .2),
 ("tailor", "I'm the tailor. Every Sunday, the town leaves one coat on the hill.", .1),
 ("sew", "I sew the holes shut first. It's polite.", .1),
 ("anyway", "It takes the coat. And it still knocks on one door.", .2),
 ("marga", "Old Marga answered once, forty years ago. It was her husband's voice.", .1),
 ("hands", "Now she talks with her hands. She taught me to sew without a sound.", .2),
 ("crane", "Father Crane picks the coat. He rings the bell, and the Weaver walks.", .1),
 ("handle", "His door is the only one in town with a handle.", .1),
 ("sinners", "He says it only knocks on sinners.", .2),
 ("pocket", "Last Sunday, I was fixing the hill coat. In the pocket, there was a list.", .1),
 ("names", "Names. In Crane's handwriting. Every door it ever knocked.", .1),
 ("owed", "Next to every name, a number. Rent. Debts. A cow.", .1),
 ("collect", "Crane isn't feeding it. He's collecting.", .2),
 ("smell", "And that's how it picks the door. It follows the coat home.", .2),
 ("red", "Two years ago, the hill coat was red. It was my mother's.", .1),
 ("mute", "She hasn't said a word since.", .2),
 ("small", "This Sunday's coat was small. It was Tib's.", .1),
 ("medicine", "My father owed Crane money. For Tib's medicine.", .3),
 ("stole", "So I did what tailors do. I swapped them.", .1),
 ("hook", "I took Crane's coat off his hook, and left it on the hill.", .1),
 ("bell", "The bell rang. The Weaver walked.", .1),
 ("notcrane", "But it didn't go to Crane's door. It came to ours.", .2),
 ("carried", "The coat smelled like me. I'd carried it all day.", .2),
 ("three", "Three knocks. Slow.", .1),
 ("love", "Open the door, love. It's cold out here.", .2),
 ("beside", "My mother's voice. And my mother, right beside me, crying without a sound.", .1),
 ("tibup", "Tib got up to answer. I covered his mouth.", .2),
 ("window", "Then I climbed out the back window, and onto the Weaver.", .1),
 ("ladder", "Its coats were a ladder. They smelled like every house in town.", .1),
 ("chest", "In its chest, sewn in tight, there was a red coat.", .1),
 ("cut", "I cut the stitches. One by one. Without a sound.", .1),
 ("scream", "It screamed with a hundred voices.", .1),
 ("fell", "The red coat fell into our street. My mother picked it up, and coughed.", .2),
 ("walked", "Then the Weaver walked to the only door with a handle.", .1),
 ("noknock", "It didn't need to knock.", .3),
 ("morning", "In the morning, Crane's door was open. Nobody went in.", .1),
 ("readnames", "Now, some nights, it knocks with Crane's voice, reading names.", .2),
 ("tonightend", "Tonight, Tib said goodnight five times.", .1),
 ("end", "And for the first time, somebody answered.", .02),
]
assert len({n for n, _, _ in G}) == len(G)
json.dump([{"n": n, "t": t, "gap": g} for n, t, g in G], open(os.path.join(D, "frases.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
R = os.path.dirname(D)
json.dump([t for _, t, _ in G], open(os.path.join(R, "voz.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
open(os.path.join(R, "guion.txt"), "w", encoding="utf-8").write(" ".join(t for _, t, _ in G))
w = sum(len(t.split()) for _, t, _ in G)
print(len(G), "frases,", w, "palabras; a 260 por minuto:", round(w / 260 * 60 + sum(g for _, _, g in G), 1), "s")
