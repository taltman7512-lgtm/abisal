# Guion de «Nobody Hears The Bell»: escribe partes/frases.json, voz.json y guion.txt
import json, os
D = os.path.dirname(os.path.abspath(__file__))
G = [  # nombre, texto, pausa después
 ("open", "Tonight, the bell rings, and I'm already inside it.", .1),
 ("rule", "Once a year, the bell over our city rings.", .1),
 ("cost", "Whoever hears it forgets the person they love most.", .1),
 ("nobody", "Nobody knows who rings it.", .2),
 ("hangs", "It hangs from four chains, one on every mountain. It's wider than the city.", .1),
 ("shadow", "Its shadow crosses our streets every day, like the hand of a clock.", .1),
 ("plug", "So on the Long Night, everybody plugs their ears with wax.", .1),
 ("wed", "Couples plug each other's ears at the altar.", .1),
 ("babies", "Babies get wax before they get a name.", .1),
 ("school", "We learn to read lips before we learn to read.", .1),
 ("sign", "On the fountain, someone carved four words. Plug your ears. Remember.", .2),
 ("sallow", "Mister Sallow sells the wax. He has no ears. Just smooth skin.", .1),
 ("never", "He never needed them.", .2),
 ("price", "One pair costs one memory. You whisper it into his jar, and then it's his.", .1),
 ("shop", "His shop is the only place the shadow never leaves.", .1),
 ("candles", "When he walks by, the candles lean toward him.", .1),
 ("name", "He knows your name before you say it.", .1),
 ("smile", "He smiles with his whole face. Except his eyes.", .3),
 ("work", "I work for him. I melt his wax, in the dark, in the back.", .1),
 ("nell", "My little sister Nell is eight.", .1),
 ("say", "Every night, she used to say, say my name. And I did. Nell.", .2),
 ("last", "Last Long Night, I made her plugs myself.", .1),
 ("forgot", "She forgot me anyway.", .2),
 ("sir", "Now she calls me sir.", .3),
 ("found", "Last week, I found her old plugs in Sallow's drawer.", .1),
 ("hole", "Each one had a tiny hole. Made with a needle.", .1),
 ("ledger", "Next to them was his ledger. A name on every line. Who forgets. And who gets forgotten.", .1),
 ("workers", "The forgotten have nobody. So they come to work for him, in the back, with no faces left.", .1),
 ("hired", "That's how I got this job.", .3),
 ("chain", "The east chain has footholds, worn smooth. Somebody climbs it every year.", .1),
 ("boots", "Sallow's boots are worn the same way.", .2),
 ("tonight", "Tonight, Nell bought new plugs.", .1),
 ("needle", "I held them up to the light. A hole.", .1),
 ("nobodyleft", "She has nobody left to forget. Except herself.", .3),
 ("climb", "So I took the hottest pot of wax, and I climbed the east chain.", .1),
 ("links", "Every link is as big as a house.", .1),
 ("clouds", "I climbed through the clouds, with the city getting small below me.", .1),
 ("inside", "Inside the bell, it was dark, and it was humming.", .2),
 ("noclapper", "There is no clapper.", .2),
 ("hammer", "There was Sallow, with a hammer as long as a man.", .1),
 ("smiled", "He smiled at me. He'd been waiting.", .2),
 ("pour", "I poured the wax along the rim. All of it. Boiling.", .1),
 ("swing", "He swung.", .1),
 ("thud", "The bell went thud.", .3),
 ("first", "For the first time in history, nobody heard the bell.", .1),
 ("fell", "Sallow stepped back, into the dark, and fell without a sound.", .2),
 ("below", "Below, the lights of the city came on, one by one.", .1),
 ("faces", "In his shop, the workers looked at their hands. Their faces were coming back.", .1),
 ("stay", "Somebody has to keep the rim full. So I stay.", .2),
 ("nightly", "Every night, Nell climbs to the first link.", .1),
 ("end", "Say my name, she yells. And I do.", .02),
]
assert len({n for n, _, _ in G}) == len(G)
json.dump([{"n": n, "t": t, "gap": g} for n, t, g in G], open(os.path.join(D, "frases.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
R = os.path.dirname(D)
json.dump([t for _, t, _ in G], open(os.path.join(R, "voz.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
open(os.path.join(R, "guion.txt"), "w", encoding="utf-8").write(" ".join(t for _, t, _ in G))
w = sum(len(t.split()) for _, t, _ in G)
print(len(G), "frases,", w, "palabras; a 260 por minuto:", round(w / 260 * 60 + sum(g for _, _, g in G), 1), "s")
