# Música y efectos 100 % sintetizados (sin samples ni descargas), sincronizados con out/eventos.json.
#   python audio/hacer_audio.py            -> out/audio.wav (48 kHz, estéreo)
# Cada evento de la simulación (pop, rebote, golpe…) dispara su sonido en su momento exacto.
import json, os, wave, numpy as np
SR = 48000; here = os.path.dirname(os.path.abspath(__file__)); out = os.path.join(here, '..', 'out')
ev = json.load(open(os.path.join(out, 'eventos.json'))); DUR = 30.0
N = int(SR * (DUR + 0.5)); L = np.zeros(N); Rr = np.zeros(N); rng = np.random.default_rng(7)
def T(d): return np.arange(int(SR * d)) / SR
def env(t, a, d): return np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / d)
def glide(f0, f1, d, curve=1.0): t = T(d); u = (t / d) ** curve; f = f0 * (f1 / f0) ** u; return t, 2 * np.pi * np.cumsum(f) / SR
def lp(x, k):  # pasa-bajos de un polo (k = 0..1, más chico = más oscuro)
    y = np.empty_like(x); a = 0.0
    for i in range(len(x)): a += k * (x[i] - a); y[i] = a
    return y
def put(x, t, g=1.0, pan=0.0):
    i = int(t * SR)
    if i < 0 or i >= N: return
    x = x[:N - i] * g; L[i:i + len(x)] += x * (1 - max(0, pan)); Rr[i:i + len(x)] += x * (1 + min(0, pan))
# ---------- efectos ----------
def pop(v):   t, ph = glide(900 - 480 * v, 170 - 60 * v, 0.11, 0.5); return np.sin(ph) * env(t, 0.002, 0.035) + rng.standard_normal(len(t)) * env(t, 0.0005, 0.006) * 0.5
def boing(v): t = T(0.26); f = 240 + 260 * np.sin(np.minimum(1, t / 0.12) * np.pi * 0.5) + 30 * np.sin(2 * np.pi * 26 * t); return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(t, 0.004, 0.09)
def land(v):  t, ph = glide(150, 70, 0.12); return np.sin(ph) * env(t, 0.002, 0.04)
def step():   t, ph = glide(520, 300, 0.05); return np.sin(ph) * env(t, 0.001, 0.015)
def thud(v):  t, ph = glide(120, 42, 0.3); return np.sin(ph) * env(t, 0.003, 0.09) + lp(rng.standard_normal(len(t)), 0.08) * env(t, 0.001, 0.03) * 1.5
def whoosh(v): t = T(0.28); return lp(rng.standard_normal(len(t)), 0.12 + 0.25 * v) * np.sin(np.pi * t / 0.28) ** 2 * 1.6
def ting(v):  t = T(0.7); return (np.sin(2 * np.pi * 2637 * t) + 0.5 * np.sin(2 * np.pi * 3951 * t) + 0.25 * np.sin(2 * np.pi * 5274 * t)) * env(t, 0.001, 0.16) * 0.5
def whistle(f0, f1, d, c=1.0): t, ph = glide(f0, f1, d, c); return np.sin(ph + 0.6 * np.sin(2 * np.pi * 7 * t)) * np.minimum(1, t / 0.05) * np.minimum(1, (d - t) / 0.03) * 0.5
def poof():   t = T(0.22); return lp(rng.standard_normal(len(t)), 0.06) * env(t, 0.004, 0.06) * 2.2
def voice(f0, f1, d, bright=0.25, vib=0.0):   # «vocecita»: diente de sierra filtrado con vibrato
    t, ph = glide(f0, f1, d); ph = ph + vib * np.sin(2 * np.pi * 9 * t); x = 2 * ((ph / (2 * np.pi)) % 1) - 1; return lp(x, bright) * np.minimum(1, t / 0.012) * np.minimum(1, (d - t) / 0.03)
def seq(notes, gap, mk):
    x = np.zeros(int(SR * (gap * len(notes) + 0.4)))
    for i, n in enumerate(notes): y = mk(n); a = int(i * gap * SR); x[a:a + len(y)] += y
    return x
def giggle(v): return seq([1250, 1480, 1250, 1570, 1320], 0.085, lambda f: voice(f, f * 1.25, 0.06, 0.5) * 0.6)
def evil():    return seq([210, 190, 172, 150], 0.13, lambda f: voice(f * 1.2, f * 0.85, 0.1, 0.12) * 1.3)
def grr():     t = T(0.75); x = voice(96, 78, 0.75, 0.1) * (0.55 + 0.45 * np.sign(np.sin(2 * np.pi * 31 * t))); return x * 1.8
def huh():     return voice(240, 400, 0.24, 0.16, 0.4) * 1.2
def gasp():    t = T(0.3); return lp(rng.standard_normal(len(t)), 0.35) * (t / 0.3) ** 2 * 1.2 + voice(300, 620, 0.3, 0.2) * 0.9
def kiss():    t, ph = glide(900, 2600, 0.09, 2.0); return np.sin(ph) * env(t, 0.01, 0.03) * 0.8
def click():   t = T(0.05); return (np.sin(2 * np.pi * 1900 * t) * env(t, 0.0005, 0.006) + rng.standard_normal(len(t)) * env(t, 0.0003, 0.003)) * 1.2
def chain():   return seq(list(range(11)), 0.085, lambda i: (np.sin(2 * np.pi * (1500 + 300 * (i % 3)) * T(0.05)) * env(T(0.05), 0.0005, 0.01)) * 0.5)
def rumble(d): t = T(d); eng = np.sign(np.sin(2 * np.pi * 27 * t)) * 0.5 + np.sin(2 * np.pi * 54 * t); x = lp(eng + rng.standard_normal(len(t)) * 0.8, 0.05) * (0.7 + 0.3 * np.sin(2 * np.pi * 13.5 * t)); return x * np.minimum(1, t / 0.5) * np.minimum(1, (d - t) / 0.5) * 1.5
def boom():    t, ph = glide(150, 30, 1.4, 0.4); return np.tanh((np.sin(ph) * env(t, 0.002, 0.45) * 2.2 + lp(rng.standard_normal(len(t)), 0.1) * env(t, 0.001, 0.25) * 2.5) * 1.5)
def tick(v):   t = T(0.04); return np.sin(2 * np.pi * (900 + 1500 * v) * t) * env(t, 0.001, 0.01) * 0.6
def ding():    t = T(1.2); return sum(np.sin(2 * np.pi * f * t) for f in (1047, 1319, 1568, 2093)) * env(t, 0.002, 0.3) * 0.25
def cheer():
    x = np.zeros(int(SR * 1.7))
    for i in range(26): f = rng.uniform(1000, 1900); y = voice(f, f * rng.uniform(1.2, 1.6), rng.uniform(0.08, 0.2), 0.5) * 0.3; a = int(rng.uniform(0, 1.3) * SR); x[a:a + len(y)] += y
    return x
last = {}
def once(k, t, gap):
    if t - last.get(k, -9) < gap: return False
    last[k] = t; return True
for e in ev:
    t, k, v = e['t'], e['k'], e['v']; pan = float(rng.uniform(-0.35, 0.35))
    if k == 'pop' and once('pop', t, 0.012): put(pop(v), t, 0.5 + 0.5 * v, pan)
    elif k == 'boing' and once('boing', t, 0.07): put(boing(v), t, 0.28 * v + 0.1, pan)
    elif k == 'land' and once('land', t, 0.05): put(land(v), t, 0.45 * v, pan)
    elif k == 'step': put(step(), t, 0.25)
    elif k == 'thud': put(thud(v), t, 0.5 + 0.4 * v)
    elif k == 'whoosh': put(whoosh(v), t - 0.1, 0.5)
    elif k == 'ting': put(ting(v), t, 0.55 * v)
    elif k == 'whistleup': put(whistle(700, 3200, 0.55, 1.6), t, 0.35)
    elif k == 'whistledown': put(whistle(3000, 520, v, 1.4), t, 0.4)
    elif k == 'drop': put(whistle(1500, 300, 0.28, 2.0), t, 0.6)
    elif k == 'poof': put(poof(), t, 0.6)
    elif k == 'giggle': put(giggle(v), t, 0.45 * v, -0.2); put(giggle(v) , t + 0.21, 0.3 * v, 0.3)
    elif k == 'evil': put(evil(), t, 0.5, 0.25)
    elif k == 'grr': put(grr(), t, 0.36, 0.2)
    elif k == 'huh': put(huh(), t, 0.7, 0.2)
    elif k == 'gasp': put(gasp(), t, 0.6)
    elif k == 'kiss': put(kiss(), t + 0.25, 0.8)
    elif k == 'click': put(click(), t, 0.9)
    elif k == 'chain': put(chain(), t, 0.6)
    elif k == 'rumble': put(rumble(v), t, 0.3)
    elif k == 'boom': put(boom(), t, 1.0)
    elif k == 'tick' and once('tick', t, 0.04): put(tick(v), t, 0.35)
    elif k == 'ding': put(ding(), t, 0.9)
    elif k == 'cheer': put(cheer(), t, 0.7)
    elif k == 'brikpop': put(pop(1.0), t, 1.2); put(boing(1), t + 0.03, 0.5); put(thud(1), t, 0.6)
# ---------- música original: marimba + bajo + percusión, 132 pulsos por minuto ----------
BPM = 132; B = 60 / BPM; ML = np.zeros(N); MR = np.zeros(N)
def mput(x, t, g, pan=0.0):
    i = int(t * SR)
    if 0 <= i < N: x = x[:N - i] * g; ML[i:i + len(x)] += x * (1 - max(0, pan)); MR[i:i + len(x)] += x * (1 + min(0, pan))
def hz(n): return 440 * 2 ** ((n - 69) / 12)
def marimba(n): t = T(0.5); f = hz(n); return (np.sin(2 * np.pi * f * t) * env(t, 0.002, 0.16) + 0.35 * np.sin(2 * np.pi * f * 4 * t) * env(t, 0.001, 0.03))
def bass(n):    t = T(0.3); f = hz(n); return np.tanh(2 * np.sin(2 * np.pi * f * t) + 0.5 * np.sin(4 * np.pi * f * t)) * env(t, 0.004, 0.11)
def kick():     t, ph = glide(140, 45, 0.16); return np.sin(ph) * env(t, 0.001, 0.05)
def hat():      t = T(0.04); x = rng.standard_normal(len(t)); return (x - lp(x, 0.4)) * env(t, 0.0005, 0.008)
def clap():     t = T(0.12); x = rng.standard_normal(len(t)); return (lp(x, 0.5) - lp(x, 0.1)) * env(t, 0.001, 0.03)
CH = [(60, [60, 64, 67]), (57, [57, 60, 64]), (53, [53, 57, 60]), (55, [55, 59, 62])]            # Do – La m – Fa – Sol
MEL = [[76, 0, 79, 76, 0, 72, 74, 0], [72, 0, 76, 72, 0, 69, 72, 0], [69, 0, 72, 77, 0, 76, 72, 0], [74, 0, 79, 83, 79, 0, 74, 79]]
def level(t):  # (melodía, bajo, percusión) según el momento de la historia
    if t < 2.55: return (0.8, 0.5, 0.0)
    if t < 3.05: return (0, 0, 0)                 # silencio antes del primer pop
    if t < 10.1: return (1, 1, 0.7)
    if t < 11.5: return (0, 0.9, 0.25)            # suspenso: viene el rodillo
    if t < 15.0: return (1, 1, 1)
    if t < 16.75: return (0.7, 0.8, 0.4)
    if t < 18.3: return (0, 0.9, 0.0)
    if t < 18.75: return (0, 0, 0)                # silencio antes del MEGA POP
    if t < 24.4: return (1.15, 1.1, 1.1)
    if t < 25.8: return (0.6, 0.6, 0.0)
    if t < 27.0: return (0, 0, 0)                 # silencio: cae el alfiler
    if t < 29.3: return (1, 1, 0.9)
    return (0, 0, 0)
s8 = B / 2; n8 = int(DUR / s8)
for i in range(n8):
    t = i * s8; m, b, p = level(t); bar = (i // 8) % 4; st8 = i % 8; root, tri = CH[bar]; sw = s8 * 0.16 if i % 2 else 0.0; tt = t + sw
    hi = 12 if 18.75 <= t < 24.4 else 0
    if m and MEL[bar][st8]: mput(marimba(MEL[bar][st8] + hi), tt, 0.3 * m, -0.15)
    if m and st8 in (2, 6): [mput(marimba(n + 12), tt, 0.1 * m, 0.3) for n in tri]
    if b and st8 in (0, 3, 4, 6): mput(bass(root - 24 + (7 if st8 == 3 else 0)), tt, 0.42 * b)
    if p:
        if st8 in (0, 4): mput(kick(), tt, 0.6 * p)
        if st8 in (2, 6): mput(clap(), tt, 0.3 * p, 0.1)
        mput(hat(), tt, (0.16 if i % 2 else 0.09) * p, 0.25)
# redoble que crece antes del MEGA POP + acorde final
for i in range(46): t = 16.8 + 1.45 * (i / 46) ** 0.8; mput(clap(), t, 0.05 + 0.3 * (i / 46) ** 2, 0.1)
t = T(1.45); mput(np.sin(2 * np.pi * np.cumsum(180 * (4.2 ** (t / 1.45))) / SR) * (t / 1.45) ** 2, 16.85, 0.16)
for n in (60, 64, 67, 72, 76): mput(marimba(n), 29.32, 0.4)
mput(bass(36), 29.32, 0.5)
# ---------- mezcla: efectos al frente, música ~8 dB abajo ----------
ML *= 0.95; MR *= 0.95
def rms(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
print('RMS música %.1f dB · efectos %.1f dB' % (rms(ML), rms(L * 0.8)))
mix = np.stack([L * 0.8 + ML, Rr * 0.8 + MR], 1); mix = np.tanh(mix * 1.3); mix = mix / max(1e-9, np.abs(mix).max()) * 0.92
mix = mix[:int(SR * DUR)]
with wave.open(os.path.join(out, 'audio.wav'), 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype('<i2').tobytes())
print('listo: out/audio.wav', round(len(mix) / SR, 2), 's')
