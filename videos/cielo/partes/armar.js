// Arma volze-video/reel.html: motor de la plantilla de reel-historias + las partes de esta historia (historia.js y musica.js).
// Correr: node partes/armar.js   ·   Render: node render-gpu.mjs …  (usa ?provisoria: la voz por frases de voz/NN.wav)
// Cambios al motor para el estilo Volze (medido en analisis/informe.md):
//  - la voz arranca en el cuadro 0 (primera palabra en 0,0 s) y no hay fundido al principio ni al final (bucle limpio)
//  - desenfoque de movimiento variable: más sub-cuadros en los barridos de cámara (window.SUBF)
//  - fuente redonda gruesa para los subtítulos (Baloo 2)
//  - window.cuadro(f), window.mezcla() y window.NFR para el render por GPU (render-gpu.mjs)
const fs = require("fs"), path = require("path");
const PL = path.join(process.env.USERPROFILE, ".claude/skills/reel-historias/motor/plantilla.html");
const L = fs.readFileSync(PL, "utf8").split("\n"), D = __dirname;
const rd = f => fs.readFileSync(path.join(D, f), "utf8");
const find = (re, from = 0) => { for (let i = from; i < L.length; i++) if (re.test(L[i])) return i; throw new Error("no está: " + re) };
const rep = (s, a, b) => { if (!s.includes(a)) throw new Error("no está: " + a.slice(0, 70)); return s.replace(a, b) };

let head = L.slice(0, find(/^const BEN = kid/)).join("\n");
head = rep(head, "<title>Reel de historia</title>", "<title>We Hold Up The Sky</title>");
head = rep(head, "family=Poppins:wght@800&", "family=Poppins:wght@800&family=Baloo+2:wght@800&");
// pausas entre frases: cortas (≈ 260 palabras por minuto, como el canal); más largas solo donde pasa algo sin voz
const FR = require("./frases.json");   // fuente única: [{n: nombre, t: texto, gap: pausa después}] (voz.json sale de acá)
head = head.replace(/^const GAP = .*$/m, "const GAP = " + JSON.stringify(Object.fromEntries(FR.map((f, i) => [i, f.gap]))) + ";");
head = rep(head, "let cur = .5", "let cur = .02");
// formato 3:4 (1440×1920) como los Shorts de Volze (medido 25-nov-2026); ?v916 vuelve a 1080×1920
head = rep(head, "W = HORIZ ? 1920 : 1080", "W = HORIZ ? 1920 : (new URLSearchParams(location.search).has(\"v916\") ? 1080 : 1440)");
// la voz de Kokoro viene en .wav
head = rep(head, '.mp3`).then(r => r.arrayBuffer())', '.mp3`).then(r => r.ok ? r : fetch(`${VOZDIR}/${String(i).padStart(2, "0")}.wav`)).then(r => r.arrayBuffer())');
// el video termina con la última palabra (+0,35 s): sin cola
head = rep(head, "DUR = Math.ceil((cur + .2) * 10) / 10", "DUR = Math.ceil((cur + .02) * 60) / 60");

let mid = L.slice(find(/^const VIG = mk/), find(/★ HISTORIA: las partes de la música/)).join("\n");
mid = rep(mid, "const fo = Math.max(1 - t / .4, P(t, DUR - .6, DUR));", "const fo = 0;");
mid = rep(mid, "for (let k = 0; k < SUB; k++) { const t = cl(f / FPS + ((k + .5) / SUB - .5) * SHUTTER / FPS, 0, DUR - 1e-4); setScene(t); COMP.render(); X.globalAlpha = 1 / (k + 1); X.drawImage(GL, 0, 0) }",
  "const SB = window.SUBF ? window.SUBF(f / FPS) : SUB, SH = window.SHUTF ? window.SHUTF(f / FPS) : SHUTTER; for (let k = 0; k < SB; k++) { const t = cl(f / FPS + ((k + .5) / SB - .5) * SH / FPS, 0, DUR - 1e-4); setScene(t); COMP.render(); X.globalAlpha = 1 / (k + 1); X.drawImage(GL, 0, 0) }");
mid = rep(mid, "X.drawImage(VIG, 0, 0); overlay(t);", "overlay(t);");
mid = rep(mid, "mus.gain.setTargetAtTime(.5, a - .1, .06)", "mus.gain.setTargetAtTime(.5, Math.max(0, a - .1), .06)");   // la primera frase arranca en 0,02 s

let tail = L.slice(find(/^  const vc = oc.createDynamicsCompressor/)).join("\n");
tail = rep(tail, "vg.gain.value = 1.7;", "vg.gain.value = 1.7 * (window.SOLO === \"mus\" ? 0 : 1);");
tail = rep(tail, "window.ver = t =>", "window.mezcla = musica; window.cuadro = f => frame(f); window.NFR = NF;\nwindow.ver = t =>");

const hist = rd("historia.js").replace("//@ORDEN", "const ORDEN = " + JSON.stringify(FR.map(f => f.n)) + ";");
const mus = fs.existsSync(path.join(D, "musica.js")) ? rd("musica.js") : "";
const out = [head, "", hist, "", mid, mus, tail].join("\n");
fs.writeFileSync(path.join(D, "..", "reel.html"), out);
// chequeo de sintaxis (node --check sobre el módulo envuelto en una función async)
const js = out.split('<script type="module">')[1].split("</script>")[0].replace(/^import .*$/mg, "");
fs.writeFileSync(path.join(D, "_check.mjs"), "async function __m(){\n" + js + "\n}");
const chk = require("child_process").spawnSync(process.execPath, ["--check", path.join(D, "_check.mjs")], { encoding: "utf8" });
if (chk.status) { console.log("ERROR DE SINTAXIS:\n" + chk.stderr.split("\n").slice(0, 8).join("\n")); process.exit(1) }
console.log("ok", out.length, mus ? "con música" : "sin música");
