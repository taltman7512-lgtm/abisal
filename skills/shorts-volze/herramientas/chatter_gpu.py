"""Voz del narrador con Chatterbox (voz por defecto del modelo, sin clonar a nadie) en la GPU.
Es la voz libre más parecida al narrador de Volze que se midió (perfil_voz.py): tono ≈ 151 Hz, entonación amplia
(rango ≈ 75 Hz, Volze 68), brillo ≈ 1.960 Hz (Volze 2.060), ≈ 242 palabras por minuto.
Uso (con el Python de ~/.cache/chatterbox/.venv, que tiene torch 2.6 cu124):
  python chatter_gpu.py voz.json voz/ [--solo 3,7] [--emocion .45] [--ritmo .5] [--semilla 7]"""
import argparse, json, os, re, torch, torchaudio as ta
from chatterbox.tts import ChatterboxTTS

p = argparse.ArgumentParser(); p.add_argument("json"); p.add_argument("carpeta"); p.add_argument("--solo", default="")
p.add_argument("--emocion", type=float, default=.45); p.add_argument("--ritmo", type=float, default=.5); p.add_argument("--semilla", type=int, default=7)
a = p.parse_args()
dev = "cuda" if torch.cuda.is_available() else "cpu"; print("chatterbox en", dev, flush=True)
m = ChatterboxTTS.from_pretrained(device=dev)
L = json.load(open(a.json, encoding="utf-8")); os.makedirs(a.carpeta, exist_ok=True)
solo = [int(x) for x in a.solo.split(",") if x]
# Chatterbox deletrea las palabras en MAYÚSCULAS (las lee como siglas): se pasan a minúscula, salvo "I"
prep = lambda t: re.sub(r"\b[A-Z]{2,}\b", lambda g: g.group(0).lower(), t)
for i, t in enumerate(L):
    if solo and i not in solo: continue
    torch.manual_seed(a.semilla + i)
    w = m.generate(prep(t), exaggeration=a.emocion, cfg_weight=a.ritmo)
    ta.save(os.path.join(a.carpeta, f"{i:02d}.wav"), w, m.sr); print("ok", i, flush=True)
