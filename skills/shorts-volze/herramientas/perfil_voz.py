"""Perfil de una voz: F0 (mediana, rango), brillo (centroide espectral), inclinación espectral, MFCC medios.
Uso: python perfil_voz.py volze   → separa la voz de 4 videos del canal con Demucs (CUDA) y guarda el perfil
     python perfil_voz.py a.wav b.wav …  → perfil de cada archivo y distancia al perfil de Volze"""
import sys, os, json, glob, subprocess, numpy as np, soundfile as sf

SR = 16000
OUT = r"C:\Users\123\Documents\volze-fuentes\analisis\_perfil_voz_volze.json"

def load(path, sr=SR):
    tmp = path + ".16k.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", path, "-ac", "1", "-ar", str(sr), tmp])
    a, _ = sf.read(tmp, dtype="float32"); os.remove(tmp); return a

def f0s(a, sr=SR):
    win = int(.04 * sr); v = []
    for i in range(0, len(a) - win, win // 2):
        x = a[i:i + win]
        if np.sqrt(np.mean(x ** 2)) < .02: continue
        x = x - x.mean(); ac = np.correlate(x, x, "full")[win - 1:]; lo, hi = sr // 400, sr // 70; k = lo + np.argmax(ac[lo:hi])
        if ac[k] > .35 * ac[0]: v.append(sr / k)
    return np.array(v)

def mfcc_mean(a, sr=SR, n=13):
    fr, hop = 400, 160; nfft = 512; mel_n = 26
    frames = [a[i:i + fr] * np.hamming(fr) for i in range(0, len(a) - fr, hop) if np.sqrt(np.mean(a[i:i + fr] ** 2)) > .02]
    if not frames: return np.zeros(n)
    S = np.abs(np.fft.rfft(np.array(frames), nfft)) ** 2
    mel = lambda f: 2595 * np.log10(1 + f / 700); imel = lambda m: 700 * (10 ** (m / 2595) - 1)
    pts = imel(np.linspace(mel(60), mel(7600), mel_n + 2)); bins = np.floor((nfft + 1) * pts / sr).astype(int)
    fb = np.zeros((mel_n, nfft // 2 + 1))
    for m in range(1, mel_n + 1):
        for k in range(bins[m - 1], bins[m]): fb[m - 1, k] = (k - bins[m - 1]) / max(1, bins[m] - bins[m - 1])
        for k in range(bins[m], bins[m + 1]): fb[m - 1, k] = (bins[m + 1] - k) / max(1, bins[m + 1] - bins[m])
    E = np.log(S @ fb.T + 1e-10); n_ = np.arange(mel_n)
    dct = np.cos(np.pi / mel_n * (n_[None, :] + .5) * np.arange(n)[:, None])
    return (E @ dct.T).mean(0)

def perfil(a, sr=SR):
    f = f0s(a, sr); sp = np.abs(np.fft.rfft(a[: sr * 60])); fr = np.fft.rfftfreq(min(len(a), sr * 60), 1 / sr)
    cen = float((sp * fr).sum() / sp.sum()); lo = sp[(fr > 100) & (fr < 1000)].mean(); hi = sp[(fr > 2000) & (fr < 6000)].mean()
    return {"f0_med": float(np.median(f)), "f0_iqr": float(np.subtract(*np.percentile(f, [75, 25]))), "centroide": cen, "tilt_db": float(20 * np.log10(hi / lo)), "mfcc": mfcc_mean(a, sr).tolist()}

def dist(p, q):
    d = ((p["f0_med"] - q["f0_med"]) / 15) ** 2 + ((p["f0_iqr"] - q["f0_iqr"]) / 10) ** 2 + ((p["tilt_db"] - q["tilt_db"]) / 3) ** 2
    m = np.array(p["mfcc"][1:]) - np.array(q["mfcc"][1:]); return float(np.sqrt(d + (m ** 2).sum() / 40))

if __name__ == "__main__":
    if sys.argv[1] == "volze":
        import torch; from demucs.pretrained import get_model; from demucs.apply import apply_model
        model = get_model("htdemucs").to("cuda").eval(); voz = []
        for v in ["top02", "top03", "top07", "rec04"]:
            f = glob.glob(rf"C:\Users\123\Documents\volze-fuentes\videos\{v}_*.mp4")[0]; tmp = f + ".44k.wav"
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f, "-t", "60", "-ac", "2", "-ar", "44100", tmp]); a, _ = sf.read(tmp, dtype="float32"); os.remove(tmp)
            x = torch.from_numpy(a.T)[None].cuda(); ref = x.mean(1).std()
            with torch.no_grad(): s = apply_model(model, x / ref, device="cuda", split=True, overlap=.1)[0] * ref
            vo = s[model.sources.index("vocals")].mean(0).cpu().numpy(); out = rf"C:\Users\123\Documents\volze-fuentes\stems\{v}_voz.wav"; sf.write(out, vo, 44100); voz.append(load(out))
            print(v, {k: round(x, 1) for k, x in perfil(voz[-1]).items() if k != "mfcc"})
        P = perfil(np.concatenate(voz)); json.dump(P, open(OUT, "w")); print("VOLZE", {k: round(x, 1) for k, x in P.items() if k != "mfcc"})
    else:
        V = json.load(open(OUT)); res = []
        for f in sys.argv[1:]:
            p = perfil(load(f)); res.append((dist(p, V), os.path.basename(f), p))
        for d, n, p in sorted(res): print(f"{d:6.2f}  {n:28s} f0 {p['f0_med']:5.0f}  iqr {p['f0_iqr']:4.0f}  tilt {p['tilt_db']:5.1f}  cen {p['centroide']:5.0f}")
