"""Compara frames del canal (videos de terror) con frames del video propio: luminancia, contraste, saturación, % de negros y tono."""
import sys, glob, subprocess, os, numpy as np

def frames(video, n=40, out=None):
    os.makedirs(out, exist_ok=True)
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video], capture_output=True, text=True).stdout)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", video, "-vf", f"fps={n / dur},scale=270:480", os.path.join(out, "f%03d.png")])
    return sorted(glob.glob(os.path.join(out, "*.png")))

def stats(paths):
    from PIL import Image
    L, C, Sat, Blk, Hue = [], [], [], [], []
    for p in paths:
        a = np.asarray(Image.open(p).convert('RGB')).astype(np.float32) / 255
        a = a[int(a.shape[0] * .05):int(a.shape[0] * .62)]   # sin la zona del subtítulo
        y = .2126 * a[..., 0] + .7152 * a[..., 1] + .0722 * a[..., 2]
        mx, mn = a.max(-1), a.min(-1); s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
        L.append(y.mean()); C.append(y.std()); Sat.append(s.mean()); Blk.append((y < .06).mean())
        r, g, b = a[..., 0].mean(), a[..., 1].mean(), a[..., 2].mean(); Hue.append((r - b))
    f = lambda v: round(float(np.median(v)), 3)
    return {"luminancia": f(L), "contraste": f(C), "saturacion": f(Sat), "negros_pct": round(f(Blk) * 100, 1), "calidez_R-B": f(Hue)}

if __name__ == "__main__":
    base = sys.argv[1]
    canal = []
    for v in ["rec01", "rec02", "rec03", "rec04", "rec05", "rec06", "top10", "top03"]:
        vid = glob.glob(rf"C:\Users\123\Documents\volze-fuentes\videos\{v}_*.mp4")[0]
        canal += frames(vid, 30, os.path.join(base, "canal", v))
    propio = frames(sys.argv[2], 60, os.path.join(base, "propio"))
    print("canal (8 videos de terror/noche):", stats(canal))
    print("propio:", stats(propio))
