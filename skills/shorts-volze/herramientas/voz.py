"""Voz del narrador de punta a punta, para un proyecto de shorts-volze.
Uso (desde la carpeta del proyecto):  python <skill>/herramientas/voz.py [--vel 1.3] [--voz am_eric] [--solo 12,13]
  1) partes/frases.json → voz.json
  2) Kokoro (voz libre, ONNX, corre en esta PC) → voz/NN.wav    (--solo: regenera solo esas frases)
  3) whisper large-v3 en CUDA: avisa las frases que no se entienden igual que el guion
  4) whisper con timestamps por palabra → palabras.json (los subtítulos usan esto)
"""
import argparse, json, os, subprocess, sys

H = os.path.dirname(os.path.abspath(__file__))
KPY = os.path.expanduser(r"~\.cache\kokoro\.venv\Scripts\python.exe")
KSCRIPT = r"C:\Users\123\Documents\documentos y indice.abisal\storyblocks-oficina\kokoro_voz.py"
a = argparse.ArgumentParser(); a.add_argument("--vel", type=float, default=1.3); a.add_argument("--voz", default="am_eric"); a.add_argument("--solo", default="")
a = a.parse_args(); P = os.getcwd()
F = json.load(open(os.path.join(P, "partes", "frases.json"), encoding="utf-8"))
json.dump([f["t"] for f in F], open(os.path.join(P, "voz.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
os.makedirs(os.path.join(P, "voz"), exist_ok=True)
solo = [int(x) for x in a.solo.split(",") if x]
if solo:
    for i in solo: subprocess.run([KPY, KSCRIPT, "--voz", a.voz, "--vel", str(a.vel), "--texto", F[i]["t"], "--salida", os.path.join(P, "voz", f"{i:02d}.wav")], check=True)
else:
    for f in os.listdir(os.path.join(P, "voz")):
        if f.endswith(".wav"): os.remove(os.path.join(P, "voz", f))
    subprocess.run([KPY, KSCRIPT, "--voz", a.voz, "--vel", str(a.vel), "--json", os.path.join(P, "voz.json"), "--carpeta", os.path.join(P, "voz")], check=True)
subprocess.run([sys.executable, os.path.join(H, "verif_voz.py"), P], check=True)
subprocess.run([sys.executable, os.path.join(H, "palabras.py"), P], check=True)
print("voz lista: voz/*.wav, voz.json, palabras.json")
