"""Resume los JSON de procesar.py: hook, cortes, movimiento de cámara, voz (F0), cierre."""
import os, json, glob, re, subprocess, wave, csv
import numpy as np

BASE = r"C:\Users\123\Documents\volze-fuentes"
OUT = os.path.join(BASE, "analisis")


def motion(path):
    """Puntaje scdet medio por frame (0-100): proxy del movimiento de cámara/plano."""
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", path, "-vf", "fps=30,scale=270:-1,scdet=threshold=0",
                        "-an", "-f", "null", "-"], capture_output=True, text=True, encoding="utf-8", errors="replace")
    s = np.array([float(x) for x in re.findall(r"lavfi\.scd\.score:\s*([\d.]+)", r.stderr)])
    if not len(s):
        return None, None
    return round(float(np.median(s)), 2), round(float((s > 1.0).mean() * 100), 1)


def f0(a, sr=16000):
    """F0 mediana por autocorrelación en ventanas de 40 ms con energía suficiente."""
    win = int(0.04 * sr)
    vals = []
    for i in range(0, len(a) - win, win):
        x = a[i:i + win]
        if np.sqrt(np.mean(x ** 2)) < 0.02:
            continue
        x = x - x.mean()
        ac = np.correlate(x, x, "full")[win - 1:]
        lo, hi = sr // 400, sr // 70
        k = lo + np.argmax(ac[lo:hi])
        if ac[k] > 0.3 * ac[0]:
            vals.append(sr / k)
    return vals


def main():
    rows = []
    for j in sorted(glob.glob(os.path.join(OUT, "*.json"))):
        d = json.load(open(j, encoding="utf-8"))
        name = d["video"]
        vid = os.path.join(BASE, "videos", name + ".mp4")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", vid, "-ac", "1", "-ar", "16000", os.path.join(OUT, "_a.wav")])
        w = wave.open(os.path.join(OUT, "_a.wav"))
        a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
        w.close()
        segF0 = []
        for s in d["segmentos"]:
            v = f0(a[int(s["start"] * 16000):int(s["end"] * 16000)])
            if len(v) > 5:
                segF0.append(float(np.median(v)))
        dur = d["duracion"]
        words = d["palabras"]
        cuts = d["cortes"]
        shots = np.diff([0] + cuts + [dur])
        mmed, mpct = motion(vid)
        hook = " ".join(w["w"] for w in words if w["start"] < 3.0)
        first_word = words[0]["start"] if words else None
        cierre = " ".join(s["text"] for s in d["segmentos"][-2:])
        rows.append({
            "video": name.split("_")[0], "dur_s": dur, "palabras": len(words),
            "ppm": round(len(words) / dur * 60), "1a_palabra_s": first_word,
            "hook_3s": hook, "cortes": len(cuts), "plano_medio_s": round(float(np.mean(shots)), 1),
            "plano_max_s": round(float(np.max(shots)), 1), "1er_corte_s": cuts[0] if cuts else None,
            "mov_cam_mediana": mmed, "pct_frames_en_mov": mpct,
            "f0_mediana_hz": round(float(np.median(segF0)), 0) if segF0 else None,
            "f0_iqr_hz": round(float(np.subtract(*np.percentile(segF0, [75, 25]))), 0) if segF0 else None,
            "db_voz": d["db_con_voz"], "db_huecos": d["db_huecos"], "bpm_mezcla": d["bpm_mezcla"],
            "shazam": "; ".join(x.get("match") or "—" for x in d["shazam"]),
            "cierre": cierre,
        })
        print(name, flush=True)
    with open(os.path.join(OUT, "resumen.csv"), "w", newline="", encoding="utf-8") as f:
        wr = csv.DictWriter(f, fieldnames=list(rows[0]))
        wr.writeheader()
        wr.writerows(rows)


if __name__ == "__main__":
    main()
