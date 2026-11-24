"""Procesa los videos de Volze: audio, frames 1 fps, cortes, whisper CUDA, shazam, métricas."""
import os, sys, json, re, subprocess, time, wave, asyncio, glob
import numpy as np

SP = os.path.join(os.path.dirname(sys.executable), "Lib", "site-packages", "nvidia")
for sub in ("cublas", "cudnn", "cuda_nvrtc"):
    d = os.path.join(SP, sub, "bin")
    if os.path.isdir(d):
        os.add_dll_directory(d)
        os.environ["PATH"] = d + os.pathsep + os.environ["PATH"]

from faster_whisper import WhisperModel

BASE = r"C:\Users\123\Documents\volze-fuentes"
VID = os.path.join(BASE, "videos")
OUT = os.path.join(BASE, "analisis")
FR = os.path.join(BASE, "frames")
os.makedirs(OUT, exist_ok=True)


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")


def wav16(path, dst):
    run(["ffmpeg", "-v", "error", "-y", "-i", path, "-ac", "1", "-ar", "16000", dst])
    w = wave.open(dst)
    a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    w.close()
    return a


def cortes(path, thr):
    r = run(["ffmpeg", "-hide_banner", "-i", path, "-vf", f"scale=360:-1,scdet=threshold={thr}", "-an", "-f", "null", "-"])
    return [float(x) for x in re.findall(r"lavfi\.scd\.time:\s*([\d.]+)", r.stderr)]


def frames(path, name, cuts):
    d = os.path.join(FR, name)
    os.makedirs(d, exist_ok=True)
    run(["ffmpeg", "-v", "error", "-y", "-i", path, "-vf", "fps=1,scale=360:-1", "-q:v", "4", os.path.join(d, "s%03d.jpg")])
    for t in cuts:
        run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t + 0.08:.2f}", "-i", path, "-frames:v", "1",
             "-vf", "scale=360:-1", "-q:v", "4", os.path.join(d, f"corte_{t:07.2f}.jpg")])


def bpm(a, sr=16000):
    hop = 256
    n = len(a) // hop
    e = np.sqrt(np.mean(a[: n * hop].reshape(n, hop) ** 2, axis=1))
    on = np.maximum(np.diff(np.log(e + 1e-6)), 0)
    on = on - on.mean()
    ac = np.correlate(on, on, "full")[len(on) - 1:]
    fps = sr / hop
    lags = np.arange(len(ac)) / fps
    m = (lags > 60 / 180) & (lags < 60 / 70)
    lag = lags[m][np.argmax(ac[m])]
    return round(float(60 / lag), 1)


def niveles(a, words, sr=16000):
    """dB RMS con voz vs. en los huecos sin palabras (proxy de música/SFX de fondo)."""
    mask = np.zeros(len(a), bool)
    for w in words:
        mask[int(w["start"] * sr): int(w["end"] * sr)] = True
    db = lambda x: round(float(20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)), 1) if len(x) else None
    gaps = a[~mask]
    return {"db_con_voz": db(a[mask]), "db_huecos": db(gaps), "seg_huecos": round(len(gaps) / sr, 1)}


async def shazam(path, dur):
    from shazamio import Shazam
    sz = Shazam()
    res = []
    for t0 in (2, dur / 2, max(dur - 14, 0)):
        clip = os.path.join(OUT, "_clip.wav")
        run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t0:.1f}", "-t", "12", "-i", path, "-ac", "1", "-ar", "44100", clip])
        try:
            r = await sz.recognize(clip)
            tr = r.get("track")
            res.append({"t": round(t0, 1), "match": f"{tr['title']} — {tr['subtitle']}" if tr else None})
        except Exception as ex:
            res.append({"t": round(t0, 1), "error": str(ex)[:120]})
    return res


def main():
    modelo = WhisperModel("large-v3", device="cuda", compute_type="float16")
    files = sorted(glob.glob(os.path.join(VID, "*.mp4")))
    if len(sys.argv) > 1:
        files = [f for f in files if any(k in f for k in sys.argv[1:])]
    for f in files:
        name = os.path.basename(f)[:-4]
        dst = os.path.join(OUT, name + ".json")
        if os.path.exists(dst):
            continue
        dur = float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).stdout)
        a = wav16(f, os.path.join(OUT, "_a.wav"))
        c = cortes(f, 10)
        frames(f, name, c)
        t = time.time()
        segs, info = modelo.transcribe(a, language="en", word_timestamps=True, vad_filter=False)
        segs = list(segs)
        tw = round(time.time() - t, 2)
        words = [{"w": w.word.strip(), "start": round(w.start, 2), "end": round(w.end, 2)} for s in segs for w in s.words]
        d = {
            "video": name, "duracion": round(dur, 2), "whisper_cuda_seg": tw,
            "cortes": c, "n_cortes": len(c),
            "texto": " ".join(s.text.strip() for s in segs),
            "segmentos": [{"start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip()} for s in segs],
            "palabras": words, "bpm_mezcla": bpm(a), **niveles(a, words),
            "shazam": asyncio.run(shazam(f, dur)),
        }
        json.dump(d, open(dst, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        print(name, dur, "cortes", len(c), "whisper", tw, "s", flush=True)


if __name__ == "__main__":
    main()

