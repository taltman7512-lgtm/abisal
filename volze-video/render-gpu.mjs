// Render del reel con la GPU: Chrome sin ventana (WebGL por ANGLE/D3D11 en la RTX) → cuadros JPEG → ffmpeg h264_nvenc.
// Uso (desde esta carpeta):
//   node render-gpu.mjs info                         → qué placa usa WebGL y cuánto dura el video
//   node render-gpu.mjs hoja 0.5,3,8.2 hoja.jpg      → hoja de cuadros sueltos (para revisar)
//   node render-gpu.mjs video salida/moth.mp4 [--conc=3] [--desde=0 --hasta=N] [--cpu]
//   --cpu: WebGL por SwiftShader (sin GPU) y libx264, solo para comparar tiempos.
// Variables: PAGINA (reel.html), QUERY (provisoria), CHROME (ruta de chrome.exe).
import http from "http"; import fs from "fs"; import path from "path"; import { spawn } from "child_process";
import { chromium } from "playwright-core"; import { fileURLToPath } from "url";

const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2), flag = (n, d) => { const a = args.find(x => x.startsWith(`--${n}`)); return a ? (a.includes("=") ? a.split("=")[1] : true) : d };
const pos = args.filter(x => !x.startsWith("--")), modo = pos[0] || "info";
const PAGINA = process.env.PAGINA || "reel.html", QUERY = process.env.QUERY ?? "provisoria";
const CHROME = process.env.CHROME || "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe";
const CPU = !!flag("cpu", false);
// el ffmpeg 9 instalado pide la API 13.1 de NVENC (driver 610+); el driver 566 trae la 12.2. El ffmpeg 7.1 que trae Remotion sí codifica con h264_nvenc en este driver.
const FFENC = process.env.FFENC || "C:/Users/123/shorts-remotion/base-shorts-estilo-mixto/node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe";
const TIPOS = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".wav": "audio/wav", ".mp3": "audio/mpeg", ".jpg": "image/jpeg", ".png": "image/png" };

// servidor estático mínimo (la página pide voz.json, voz/NN.wav, palabras.json)
const srv = http.createServer((q, r) => {
  const f = path.join(DIR, decodeURIComponent(q.url.split("?")[0]));
  if (!f.startsWith(DIR) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end() }
  r.writeHead(200, { "Content-Type": TIPOS[path.extname(f)] || "application/octet-stream", "Cache-Control": "no-store" }); fs.createReadStream(f).pipe(r);
});
await new Promise(ok => srv.listen(0, ok)); const PORT = srv.address().port;

const GPU_ARGS = ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-gpu-rasterization", "--disable-gpu-sandbox", "--force_high_performance_gpu"];
const CPU_ARGS = ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--disable-gpu"];
const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ["--headless=new", "--autoplay-policy=no-user-gesture-required", ...(CPU ? CPU_ARGS : GPU_ARGS)] });

async function abrir() {
  const p = await browser.newPage({ viewport: { width: 540, height: 960 } });
  p.on("pageerror", e => console.log("ERROR en la página:", e.message)); p.on("console", m => { if (m.type() === "error") console.log("consola:", m.text()) });
  await p.goto(`http://localhost:${PORT}/${PAGINA}?${QUERY}`);
  await p.waitForFunction(() => window.listo, null, { timeout: 180000 });
  const info = await p.evaluate(async () => { const r = await window.listo; return { DUR: r.DUR, NF: window.NFR ?? Math.round(r.DUR * 60) } });
  return { p, ...info };
}
const placa = p => p.evaluate(() => { const g = document.createElement("canvas").getContext("webgl2"), d = g.getExtension("WEBGL_debug_renderer_info"); return d ? g.getParameter(d.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER) });
const jpeg = (p, f, q = .93) => p.evaluate(([f, q]) => { window.cuadro(f); return document.getElementById("c").toDataURL("image/jpeg", q) }, [f, q]).then(u => Buffer.from(u.split(",")[1], "base64"));

// mezcla de audio de la página → WAV 16 bit estéreo 48 kHz (base64). solo: "mus" (sin voz), "voz" (sin música ni efectos) o nada
const wavB64 = (p, solo = null) => p.evaluate(async (solo) => { window.SOLO = solo; const { buf } = await window.mezcla(); window.SOLO = null; const n = buf.length, L = buf.getChannelData(0), R = buf.getChannelData(1), ab = new ArrayBuffer(44 + n * 4), v = new DataView(ab);
  const w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0))); w(0, "RIFF"); v.setUint32(4, 36 + n * 4, true); w(8, "WAVEfmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true); v.setUint32(24, 48000, true); v.setUint32(28, 192000, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, n * 4, true);
  for (let i = 0; i < n; i++) { v.setInt16(44 + i * 4, Math.max(-1, Math.min(1, L[i])) * 32767, true); v.setInt16(46 + i * 4, Math.max(-1, Math.min(1, R[i])) * 32767, true) }
  let s = "", u = new Uint8Array(ab); for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s) }, solo);
if (modo === "audio") { const { p } = await abrir(); for (const [solo, nom] of [[null, "mezcla"], ["mus", "solo-musica"], ["voz", "solo-voz"]]) { const f = path.join(DIR, "salida", nom + ".wav"); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, Buffer.from(await wavB64(p, solo), "base64")); console.log("audio", f) } }

if (modo === "info") {
  const { p, DUR, NF } = await abrir(); console.log(JSON.stringify({ placa: await placa(p), DUR, NF }));
}

if (modo === "hoja") {
  const ts = (pos[1] || "1").split(",").map(Number), out = path.join(DIR, pos[2] || "salida/hoja.jpg"); fs.mkdirSync(path.dirname(out), { recursive: true });
  const { p } = await abrir(); const tmp = path.join(DIR, "salida", "_hoja"); fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp, { recursive: true });
  for (let i = 0; i < ts.length; i++) fs.writeFileSync(path.join(tmp, `${String(i).padStart(3, "0")}.jpg`), await jpeg(p, Math.round(ts[i] * 60), .85));
  const cols = Math.min(+(flag("cols", 6)), ts.length), filas = Math.ceil(ts.length / cols);
  const lab = ts.map((t, i) => `[${i}:v]scale=270:480,drawtext=fontfile='C\\:/Windows/Fonts/arial.ttf':text='${t.toFixed(1)}':x=6:y=6:fontsize=24:fontcolor=yellow:box=1:boxcolor=black@0.6[v${i}]`).join(";");
  const inp = ts.flatMap((_, i) => ["-i", path.join(tmp, `${String(i).padStart(3, "0")}.jpg`)]);
  const layout = ts.map((_, i) => `${(i % cols) * 270}_${Math.floor(i / cols) * 480}`).join("|");
  const r = spawn("ffmpeg", ["-v", "error", "-y", ...inp, "-filter_complex", `${lab};${ts.map((_, i) => `[v${i}]`).join("")}xstack=inputs=${ts.length}:layout=${layout}:fill=black`, "-frames:v", "1", "-q:v", "3", out], { stdio: "inherit" });
  await new Promise(ok => r.on("close", ok)); console.log("hoja", out, `(${filas} filas)`);
}

if (modo === "tomas") {   // un cuadro del medio de cada toma → hojas de 24 (8 × 3) en salida/tomas-NN.jpg
  const { p } = await abrir(); const T = await p.evaluate(() => window.DBG.TOMAS.map(x => [x.L, x.j, x.a, x.b]));
  const dir = path.join(DIR, "salida", "_tomas"); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const solo = flag("lineas", null), lista = T.filter(([L]) => !solo || String(solo).split(",").map(Number).includes(L));
  for (let i = 0; i < lista.length; i++) { const [L, j, a, b] = lista[i]; fs.writeFileSync(path.join(dir, `${String(i).padStart(3, "0")}.jpg`), await jpeg(p, Math.round((a + (b - a) * +(flag("pos", .5))) * 60), .8)) }
  for (let h = 0; h * 24 < lista.length; h++) { const grupo = lista.slice(h * 24, h * 24 + 24), n = grupo.length;
    const inp = grupo.flatMap((_, i) => ["-i", path.join(dir, `${String(h * 24 + i).padStart(3, "0")}.jpg`)]);
    const lab = grupo.map(([L, j, a], i) => `[${i}:v]scale=270:480,drawtext=fontfile='C\\:/Windows/Fonts/arial.ttf':text='${L}.${j} ${a.toFixed(1)}':x=6:y=6:fontsize=22:fontcolor=yellow:box=1:boxcolor=black@0.6[v${i}]`).join(";");
    const layout = grupo.map((_, i) => `${(i % 8) * 270}_${Math.floor(i / 8) * 480}`).join("|"), out = path.join(DIR, "salida", `tomas-${String(h).padStart(2, "0")}.jpg`);
    const r = spawn("ffmpeg", ["-v", "error", "-y", ...inp, "-filter_complex", n > 1 ? `${lab};${grupo.map((_, i) => `[v${i}]`).join("")}xstack=inputs=${n}:layout=${layout}:fill=black` : lab.replace("[v0]", ""), "-frames:v", "1", "-q:v", "3", out], { stdio: "inherit" });
    await new Promise(ok => r.on("close", ok)); console.log("hoja", out) }
}

if (modo === "video") {
  const out = path.join(DIR, pos[1] || "salida/video.mp4"), conc = +flag("conc", 3); fs.mkdirSync(path.dirname(out), { recursive: true });
  const t0 = Date.now(), main = await abrir(); console.log("placa:", await placa(main.p), "· duración", main.DUR, "s ·", main.NF, "cuadros");
  // audio: la mezcla completa (música + efectos + voz) se calcula en la página y se guarda como WAV
  const wav = out.replace(/\.mp4$/, ".wav");
  if (!flag("sinaudio", false)) {
    const b64 = await wavB64(main.p);
    fs.writeFileSync(wav, Buffer.from(b64, "base64")); console.log("audio listo", ((Date.now() - t0) / 1000).toFixed(1), "s");
  }
  const desde = +flag("desde", 0), hasta = +flag("hasta", main.NF), total = hasta - desde, paso = Math.ceil(total / conc);
  const enc = CPU ? ["-c:v", "libx264", "-preset", "medium", "-crf", "19"] : ["-c:v", "h264_nvenc", "-preset", "p5", "-tune", "hq", "-rc", "vbr", "-cq", "19", "-b:v", "0", "-profile:v", "high"];
  const partes = [];
  await Promise.all(Array.from({ length: conc }, async (_, k) => {
    const a = desde + k * paso, b = Math.min(hasta, a + paso); if (a >= b) return;
    const pg = k === 0 ? main : await abrir(), seg = out.replace(/\.mp4$/, `.parte${k}.mp4`); partes[k] = seg;
    const ff = spawn(CPU ? "ffmpeg" : FFENC, ["-v", "error", "-y", "-f", "image2pipe", "-framerate", "60", "-c:v", "mjpeg", "-i", "-", ...enc, "-pix_fmt", "yuv420p", "-r", "60", seg], { stdio: ["pipe", "inherit", "inherit"] });
    for (let f = a; f < b; f++) {
      const j = await jpeg(pg.p, f); if (!ff.stdin.write(j)) await new Promise(ok => ff.stdin.once("drain", ok));
      if ((f - a) % 300 === 0) console.log(`[${k}] cuadro ${f - a}/${b - a} · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    }
    ff.stdin.end(); await new Promise(ok => ff.on("close", ok));
  }));
  const lista = out.replace(/\.mp4$/, ".lista.txt"); fs.writeFileSync(lista, partes.filter(Boolean).map(p => `file '${p.replace(/\\/g, "/")}'`).join("\n"));
  const audio = fs.existsSync(wav) && !flag("sinaudio", false) ? ["-i", wav, "-map", "0:v", "-map", "1:a", "-c:a", "aac", "-b:a", "192k", "-shortest"] : [];
  const m = spawn("ffmpeg", ["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lista, ...audio, "-c:v", "copy", "-movflags", "+faststart", out], { stdio: "inherit" });
  await new Promise(ok => m.on("close", ok)); partes.filter(Boolean).forEach(p => fs.rmSync(p, { force: true })); fs.rmSync(lista, { force: true });
  const seg = (Date.now() - t0) / 1000; console.log(`LISTO ${out} · ${total} cuadros en ${seg.toFixed(1)} s · ${(total / seg).toFixed(1)} cuadros/s`);
}
await browser.close(); srv.close();
