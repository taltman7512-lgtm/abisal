// Render sin pantalla: abre index.html en Chromium, dibuja cuadro por cuadro y se los pasa a ffmpeg.
//   node render.mjs                          -> out/pop_mudo.mp4 (1080x1920, 60 fps) + out/eventos.json
//   node render.mjs --fotos 0,180,600        -> out/foto_00180.png … (para revisar antes del render)
//   node render.mjs --scale 0.5 --desde 0 --hasta 600 --salida out/prueba.mp4
//   node render.mjs --gpu --nvenc            -> usa la placa de video (Chrome con GPU + codificador NVENC)
import { spawn } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath, pathToFileURL } from 'node:url'; import { createRequire } from 'node:module';
const dir = path.dirname(fileURLToPath(import.meta.url)), A = process.argv.slice(2), arg = (k, d) => { const i = A.indexOf('--' + k); return i < 0 ? d : (A[i + 1] && !A[i + 1].startsWith('--') ? A[i + 1] : true); };
const video = arg('video', 'pop'), scale = +arg('scale', 1), gpu = arg('gpu', false), nvenc = arg('nvenc', false);
let chromium; try { ({ chromium } = createRequire(import.meta.url)('playwright')); } catch { try { ({ chromium } = await import('playwright')); } catch { console.error('Falta Playwright. En esta carpeta: npm i playwright && npx playwright install chromium'); process.exit(1); } }
fs.mkdirSync(path.join(dir, 'out'), { recursive: true });
const browser = await chromium.launch({ args: gpu ? ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11', '--enable-accelerated-2d-canvas'] : [] });
const page = await browser.newPage({ viewport: { width: 540, height: 960 } });
page.on('pageerror', (e) => { console.error('ERROR en la página:', e.message); process.exitCode = 1; });
await page.goto(pathToFileURL(path.join(dir, 'index.html')).href + `?render=1&video=${video}&scale=${scale}`);
await page.waitForFunction('window.M && M.ready', null, { timeout: 60000 });
const total = await page.evaluate('M.Video.frames'), fps = await page.evaluate('M.Video.fps');
const b64 = (u) => Buffer.from(u.slice(u.indexOf(',') + 1), 'base64');
if (arg('fotos')) {
  for (const f of String(arg('fotos')).split(',').map(Number)) { const out = path.join(dir, 'out', `foto_${String(f).padStart(5, '0')}.png`); fs.writeFileSync(out, b64(await page.evaluate((f) => M.png(f), f))); console.log(out); }
} else {
  const a = +arg('desde', 0), b = Math.min(total, +arg('hasta', total)), out = path.resolve(dir, arg('salida', `out/${video}_mudo.mp4`));
  const enc = nvenc ? ['-c:v', 'h264_nvenc', '-preset', 'p7', '-rc', 'vbr', '-cq', '16', '-b:v', '0'] : ['-c:v', 'libx264', '-preset', 'slow', '-crf', '15'];
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', ...enc, '-pix_fmt', 'yuv420p', '-color_range', 'tv', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now(); if (a > 0) await page.evaluate((f) => M.goto(f, false), a - 1);
  for (let f = a; f < b; f++) { const buf = b64(await page.evaluate((f) => M.jpg(f), f)); if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r)); if (f % 120 === 0) console.log(`cuadro ${f}/${b}  (${((Date.now() - t0) / 1000).toFixed(0)} s)`); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  if (a === 0 && b === total) fs.writeFileSync(path.join(dir, 'out', 'eventos.json'), JSON.stringify(await page.evaluate('M.ev')));
  console.log('listo:', out, `(${((Date.now() - t0) / 1000).toFixed(0)} s)`);
}
await browser.close();
