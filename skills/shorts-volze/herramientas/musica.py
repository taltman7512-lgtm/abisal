"""Separa voz/fondo con Demucs en CUDA, y analiza el fondo: Shazam, BPM, nivel, presencia, brillo."""
import os, sys, glob, json, subprocess, asyncio, time
import numpy as np, soundfile as sf, torch
from demucs.pretrained import get_model
from demucs.apply import apply_model

BASE = r"C:\Users\123\Documents\volze-fuentes"
SEP = os.path.join(BASE, "stems")
os.makedirs(SEP, exist_ok=True)
SR = 44100


def load(path):
    tmp = os.path.join(SEP, "_in.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", path, "-ac", "2", "-ar", str(SR), tmp])
    a, _ = sf.read(tmp, dtype="float32")
    return a.T


def db(x):
    return float(20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9))


def tempo(m):
    hop = 512
    n = len(m) // hop
    e = np.sqrt(np.mean(m[: n * hop].reshape(n, hop) ** 2, axis=1))
    on = np.maximum(np.diff(np.log(e + 1e-6)), 0)
    on -= on.mean()
    ac = np.correlate(on, on, "full")[len(on) - 1:]
    lags = np.arange(len(ac)) * hop / SR
    k = (lags > 60 / 180) & (lags < 60 / 70)
    best = lags[k][np.argmax(ac[k])]
    strength = float(ac[k].max() / (ac[0] + 1e-9))  # 0..1: qué tan periódico es el fondo
    return round(60 / float(best), 1), round(strength, 3)


def centroid(m):
    sp = np.abs(np.fft.rfft(m[: SR * 60] * np.hanning(min(len(m), SR * 60))))
    f = np.fft.rfftfreq(min(len(m), SR * 60), 1 / SR)
    return round(float((sp * f).sum() / sp.sum()))


async def shazam(wav, dur):
    from shazamio import Shazam
    sz, res = Shazam(), []
    for t0 in (2, dur * 0.33, dur * 0.66, max(dur - 14, 0)):
        clip = os.path.join(SEP, "_clip.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t0:.1f}", "-t", "12", "-i", wav, clip])
        try:
            tr = (await sz.recognize(clip)).get("track")
            res.append(f"{tr['title']} — {tr['subtitle']}" if tr else None)
        except Exception as ex:
            res.append("error: " + str(ex)[:60])
    return res


def main():
    model = get_model("htdemucs").to("cuda").eval()
    files = sorted(glob.glob(os.path.join(BASE, "videos", "*.mp4")))
    if len(sys.argv) > 1:
        files = [f for f in files if any(k in f for k in sys.argv[1:])]
    out = {}
    for f in files:
        name = os.path.basename(f)[:-4]
        a = load(f)
        x = torch.from_numpy(a)[None].to("cuda")
        ref = x.mean(1).std()
        t = time.time()
        with torch.no_grad():
            s = apply_model(model, x / ref, device="cuda", split=True, overlap=0.1)[0] * ref
        torch.cuda.synchronize()
        tg = round(time.time() - t, 2)
        src = dict(zip(model.sources, s.cpu().numpy()))
        voc = src["vocals"].mean(0)
        bg = (src["drums"] + src["bass"] + src["other"]).mean(0)
        wav = os.path.join(SEP, name + "_fondo.wav")
        sf.write(wav, bg, SR)
        dur = len(bg) / SR
        win = SR // 2
        rms = np.array([db(bg[i:i + win]) for i in range(0, len(bg) - win, win)])
        bpm, per = tempo(bg)
        out[name] = {
            "demucs_cuda_seg": tg,
            "db_voz": round(db(voc), 1), "db_fondo": round(db(bg), 1),
            "db_drums": round(db(src["drums"].mean(0)), 1), "db_bass": round(db(src["bass"].mean(0)), 1),
            "db_other": round(db(src["other"].mean(0)), 1),
            "pct_fondo_audible": round(float((rms > -45).mean() * 100), 1),
            "bpm_fondo": bpm, "periodicidad": per, "centroide_hz": centroid(bg),
            "fondo_primeros_3s_db": round(db(bg[: 3 * SR]), 1),
            "shazam_fondo": asyncio.run(shazam(wav, dur)),
        }
        print(name, out[name], flush=True)
    json.dump(out, open(os.path.join(BASE, "analisis", "_musica.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
