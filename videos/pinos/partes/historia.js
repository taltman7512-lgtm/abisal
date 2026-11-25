// ★ HISTORIA "Don’t Cut The Pines" — estilo Volze, aldea nevada de noche (reglas medidas en analisis/informe.md)
// Hollowpine es una aldea en un valle de pinos: un ciervo gigante de corteza (el Watcher) baja si alguien corta un árbol vivo.
// Contada en primera persona por un chico que corta el pino más viejo para salvar a su hermana Mila del frío. Personajes propios.
const dummy = new THREE.Object3D(), V = new THREE.Vector3(), V2 = new THREE.Vector3();
const place = (k, x, z, ry = 0, y = 0) => { k.g.visible = true; k.g.position.set(x, y, z); k.g.rotation.set(0, ry, 0) };
const faceTo = (k, x, z) => k.g.rotation.y = Math.atan2(x - k.g.position.x, z - k.g.position.z);
const AMBER = "#ffc480", DUSTC = "#ffd27a", FIREF = "#d6ff72";

// ---------- subtítulos con los tiempos reales de cada palabra (whisper) y el texto del guion
{ const PAL = await fetch("palabras.json").then(r => r.json()); WORDS.length = 0;
  PAL.forEach((ws0, i) => { const ws = []; ws0.forEach(w => { if (w[0].startsWith("-") && ws.length) { ws[ws.length - 1][0] += w[0]; ws[ws.length - 1][2] = w[2] } else ws.push([...w]) });
    const gui = LINES[i].split(" "); if (gui.length === ws.length) ws.forEach((w, k) => w[0] = gui[k]);
    ws.forEach(([w, a]) => WORDS.push([S[i] + a, w])); const fin = e(i), sig = S[i + 1] ?? DUR; if (sig - fin > .45) WORDS.push([fin + .2, ""]) });
  window.PAL = PAL; }
const wt = (L, k) => S[L] + (window.PAL[L][Math.min(k, window.PAL[L].length - 1)]?.[1] ?? 0);   // tiempo de la palabra k de la frase L

// ---------- texturas con aspecto real (adoquín, revoque con vigas, tejas, piedra, tierra, pantano)
const T_COB = tex(1024, 1024, (g, w, h) => { const r = rng(5); g.fillStyle = "#1f1a16"; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h + 30; y += 30) for (let x = (y / 30 % 2) * 17; x < w + 34; x += 34) { const v = 62 + r() * 46 | 0, rx = 14 + r() * 3, ry = 12 + r() * 2;
    g.fillStyle = `rgb(${v + 10},${v + 2},${v - 8})`; g.beginPath(); g.ellipse(x + (r() - .5) * 4, y + (r() - .5) * 4, rx, ry, r() * .6, 0, 7); g.fill();
    g.fillStyle = "rgba(255,225,180,.09)"; g.beginPath(); g.ellipse(x - 4, y - 4, rx * .55, ry * .4, 0, 0, 7); g.fill() }
  for (let k = 0; k < 2200; k++) { g.fillStyle = r() < .5 ? "rgba(0,0,0,.18)" : "rgba(160,140,110,.08)"; g.fillRect(r() * w, r() * h, 2, 2) } }, [6, 40]);
const T_TIMBER = (seed, base) => tex(512, 512, (g, w, h) => { const r = rng(seed); g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let k = 0; k < 900; k++) { g.fillStyle = r() < .5 ? "rgba(60,40,20,.07)" : "rgba(255,240,210,.06)"; g.beginPath(); g.arc(r() * w, r() * h, 3 + r() * 18, 0, 7); g.fill() }
  for (let k = 0; k < 14; k++) { const x = r() * w; const gr = g.createLinearGradient(0, h * .55, 0, h); gr.addColorStop(0, "rgba(40,28,16,0)"); gr.addColorStop(1, "rgba(40,28,16,.22)"); g.fillStyle = gr; g.fillRect(x, h * .55, 6 + r() * 20, h * .45) }
  const beam = (x0, y0, x1, y1, wd = 22) => { g.strokeStyle = "#3a2618"; g.lineWidth = wd; g.lineCap = "butt"; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.strokeStyle = "rgba(255,220,170,.10)"; g.lineWidth = 3; g.beginPath(); g.moveTo(x0 + 6, y0); g.lineTo(x1 + 6, y1); g.stroke() };
  beam(11, 0, 11, h); beam(w - 11, 0, w - 11, h); beam(w / 2, 0, w / 2, h, 18); beam(0, 11, w, 11); beam(0, h * .5, w, h * .5, 18); beam(0, h - 11, w, h - 11);
  beam(20, h * .5, w / 2 - 10, 18, 14); beam(w - 20, h * .5, w / 2 + 10, 18, 14) });
const T_PLANK0 = tex(256, 512, (g, w, h) => { const r = rng(7); for (let x = 0; x < w; x += 32) { const v = 70 + r() * 30 | 0; g.fillStyle = `rgb(${v + 18},${v},${v - 18})`; g.fillRect(x, 0, 31, h); g.strokeStyle = "rgba(0,0,0,.25)"; for (let k = 0; k < 6; k++) { g.lineWidth = 1 + r() * 2; g.beginPath(); const xx = x + 4 + r() * 24; g.moveTo(xx, 0); g.bezierCurveTo(xx + 6, h * .3, xx - 6, h * .6, xx + 2, h); g.stroke() } g.fillStyle = "rgba(0,0,0,.5)"; g.fillRect(x + 31, 0, 2, h) } });
const T_SHINGLE0 = tex(512, 512, (g, w, h) => { const r = rng(9); g.fillStyle = "#1e1a18"; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 24) for (let x = (y / 24 % 2) * 16 - 16; x < w; x += 32) { const v = 52 + r() * 34 | 0; g.fillStyle = `rgb(${v + 6},${v},${v - 4})`; g.fillRect(x + 1, y, 30, 22); g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(x + 1, y + 18, 30, 4); if (r() < .12) { g.fillStyle = "rgba(90,110,50,.35)"; g.fillRect(x + 1, y + 10, 30, 12) } } }, [3, 3]);
const T_STONE0 = tex(512, 512, (g, w, h) => { const r = rng(13); g.fillStyle = "#2a2622"; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 40) for (let x = (y / 40 % 2) * 36 - 36; x < w; x += 72) { const v = 88 + r() * 40 | 0; g.fillStyle = `rgb(${v + 6},${v},${v - 10})`; g.beginPath(); g.roundRect(x + 3, y + 3, 66 + r() * 4, 34, 6); g.fill(); g.fillStyle = "rgba(0,0,0,.12)"; for (let k = 0; k < 6; k++) g.fillRect(x + 6 + r() * 56, y + 6 + r() * 26, 3, 3) } }, [2, 2]);
const T_DIRT0 = tex(512, 512, (g, w, h) => { const r = rng(17); g.fillStyle = "#8a7356"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 10) { g.strokeStyle = y % 20 ? "rgba(60,45,30,.25)" : "rgba(255,240,210,.12)"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, y + r() * 3); for (let x = 0; x < w; x += 32) g.lineTo(x, y + r() * 4); g.stroke() } });
const T_GROUND = tex(1024, 1024, (g, w, h) => { const r = rng(21); g.fillStyle = "#2c2a1c"; g.fillRect(0, 0, w, h); for (let k = 0; k < 7000; k++) { const v = r(); g.strokeStyle = v < .4 ? "rgba(70,72,40,.5)" : v < .75 ? "rgba(40,34,22,.6)" : "rgba(120,100,60,.3)"; g.lineWidth = 2; const x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 6, y - 6 - r() * 8); g.stroke() } }, [50, 50]);
const T_PISO = tex(512, 512, (g, w, h) => { const r = rng(23); for (let y = 0; y < h; y += 42) { const v = 80 + r() * 26 | 0; g.fillStyle = `rgb(${v + 30},${v + 8},${v - 16})`; g.fillRect(0, y, w, 40); g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(0, y + 40, w, 2); for (let k = 0; k < 5; k++) { g.strokeStyle = "rgba(0,0,0,.12)"; g.beginPath(); g.moveTo(0, y + 6 + r() * 30); g.lineTo(w, y + 6 + r() * 30); g.stroke() } } }, [3, 3]);
const T_WALLIN = tex(512, 512, (g, w, h) => { const r = rng(29); g.fillStyle = "#8f7356"; g.fillRect(0, 0, w, h); for (let k = 0; k < 600; k++) { g.fillStyle = r() < .5 ? "rgba(50,35,20,.08)" : "rgba(255,230,190,.06)"; g.beginPath(); g.arc(r() * w, r() * h, 4 + r() * 22, 0, 7); g.fill() } g.fillStyle = "#4a3222"; g.fillRect(0, h - 40, w, 40) });
const T_QUILT = tex(512, 512, (g, w, h) => { const r = rng(31), cs = ["#7a3b32", "#b08a4a", "#3f5a6a", "#d9c7a0", "#5f6b3a"]; for (let y = 0; y < h; y += 64) for (let x = 0; x < w; x += 64) { g.fillStyle = cs[r() * 5 | 0]; g.fillRect(x, y, 64, 64); g.strokeStyle = "rgba(255,240,210,.35)"; g.setLineDash([4, 5]); g.strokeRect(x + 4, y + 4, 56, 56); g.setLineDash([]) } });
const T_WELLSIGN = tex(1024, 400, (g, w, h) => { g.fillStyle = "rgba(0,0,0,0)"; g.clearRect(0, 0, w, h); g.font = "800 150px 'Special Elite'"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#efe6d2";
  g.fillText("TWO LAMPS.", w / 2, 120); g.fillText("ALWAYS.", w / 2, 290); const r = rng(3); for (let k = 0; k < 22; k++) { const x = 120 + r() * 780, y = 170 + (k % 2) * 170; g.fillRect(x, y, 5, 18 + r() * 50) } });
const T_CANDLESIGN = tex(1024, 300, (g, w, h) => { g.fillStyle = "#2e2218"; g.fillRect(0, 0, w, h); g.strokeStyle = "#b08a4a"; g.lineWidth = 12; g.strokeRect(14, 14, w - 28, h - 28); g.font = "800 150px 'Special Elite'"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#d9b36a"; g.fillText("CANDLES", w / 2, h / 2 + 8) });
const T_CLOSED = tex(512, 220, (g, w, h) => { g.fillStyle = "#d9cdb2"; g.fillRect(0, 0, w, h); g.font = "800 110px 'Special Elite'"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#5a2a1e"; g.fillText("CLOSED", w / 2, h / 2 + 6) });

function gableUV(geo, Wd, rh) { const uv = geo.attributes.uv, p = geo.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (p.getX(i) + Wd / 2) / Wd, p.getY(i) / rh); return geo }
// ---------- texturas pintadas a mano (pedido del dueño: nada de patrones repetidos; cada lienzo se dibuja entero, con trazos irregulares)
const hx = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const rgbj = (h, r, j = 22, a = 1) => { const [R0, G0, B0] = hx(h), d = (r() - .5) * j, c = v => Math.max(0, Math.min(255, v + d + (r() - .5) * j * .3)) | 0; return `rgba(${c(R0)},${c(G0)},${c(B0)},${a})` };
function aMano(g, pts, r, amp) { g.beginPath(); pts.forEach(([x, y], i) => { const [x2, y2] = pts[(i + 1) % pts.length]; if (!i) g.moveTo(x, y); g.quadraticCurveTo((x + x2) / 2 + (r() - .5) * amp, (y + y2) / 2 + (r() - .5) * amp, x2, y2) }); g.closePath() }
function manchas(g, r, n, w, h, col, r0, r1, a0, a1) { const [R0, G0, B0] = hx(col); for (let k = 0; k < n; k++) { const x = r() * w, y = r() * h, rad = r0 + r() * (r1 - r0), gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, `rgba(${R0},${G0},${B0},${a0 + r() * (a1 - a0)})`); gr.addColorStop(1, `rgba(${R0},${G0},${B0},0)`); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2) } }
function grietas(g, r, n, w, h, col = "rgba(40,28,18,.55)") { g.strokeStyle = col; for (let k = 0; k < n; k++) { let x = r() * w, y = r() * h, a = r() * 6.28; g.lineWidth = 1 + r() * 2.5; g.beginPath(); g.moveTo(x, y); const L = 6 + r() * 18 | 0; for (let s = 0; s < L; s++) { a += (r() - .5) * 1.2; x += Math.cos(a) * (6 + r() * 10); y += Math.sin(a) * (6 + r() * 10); g.lineTo(x, y) } g.stroke() } }
function vetas(g, r, x0, y0, w, h, base, vertical = true) { g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip(); g.fillStyle = rgbj(base, r, 26); g.fillRect(x0, y0, w, h); const L = vertical ? h : w, A = vertical ? w : h;
  for (let k = 0; k < A / 3; k++) { const o = r() * A, amp = 1 + r() * 4, f = .005 + r() * .02, ph = r() * 6; g.strokeStyle = r() < .5 ? "rgba(30,18,10,.28)" : "rgba(255,230,190,.10)"; g.lineWidth = .8 + r() * 2; g.beginPath();
    for (let s = 0; s <= L; s += 12) { const d = o + Math.sin(s * f + ph) * amp; if (vertical) { s ? g.lineTo(x0 + d, y0 + s) : g.moveTo(x0 + d, y0 + s) } else { s ? g.lineTo(x0 + s, y0 + d) : g.moveTo(x0 + s, y0 + d) } } g.stroke() }
  const nn = r() * 2 | 0; for (let k = 0; k < nn; k++) { const cx = x0 + r() * w, cy = y0 + r() * h; for (let q = 4; q > 0; q--) { g.strokeStyle = `rgba(40,22,10,${.15 + q * .08})`; g.lineWidth = 1.5; g.beginPath(); g.ellipse(cx, cy, q * (vertical ? 3 : 7), q * (vertical ? 7 : 3), 0, 0, 7); g.stroke() } }
  g.restore() }
// paredes: revoque con humedad, barro, revoque caído, grietas y un entramado de vigas distinto en cada casa
const T_PARED = (seed, base) => tex(1024, 1024, (g, w, h) => { const r = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, w, h); manchas(g, r, 40, w, h, "#ffffff", 60, 220, .03, .09); manchas(g, r, 50, w, h, "#3a2a1a", 40, 200, .04, .12);
  const gb = g.createLinearGradient(0, h * .7, 0, h); gb.addColorStop(0, "rgba(50,40,25,0)"); gb.addColorStop(1, "rgba(50,40,25,.45)"); g.fillStyle = gb; g.fillRect(0, h * .7, w, h * .3);
  for (let k = 0; k < 500; k++) { g.fillStyle = `rgba(70,52,32,${.1 + r() * .3})`; g.beginPath(); g.arc(r() * w, h - Math.pow(r(), 2) * h * .18, .8 + r() * 3, 0, 7); g.fill() }
  const np = 2 + (r() * 3 | 0); for (let k = 0; k < np; k++) { const cx = r() * w, cy = h * (.15 + r() * .8), rw = 30 + r() * 70, rh = 20 + r() * 50, pts = Array.from({ length: 9 }, (_, i) => { const a = i / 9 * 6.28; return [cx + Math.cos(a) * rw * (.6 + r() * .5), cy + Math.sin(a) * rh * (.6 + r() * .5)] });
    g.save(); aMano(g, pts, r, 18); g.clip(); g.fillStyle = "#5a4c3e"; g.fillRect(cx - rw * 2, cy - rh * 2, rw * 4, rh * 4); for (let s = 0; s < 14; s++) { g.fillStyle = rgbj("#8a7e70", r, 40); g.beginPath(); g.ellipse(cx + (r() - .5) * rw * 2, cy + (r() - .5) * rh * 2, 10 + r() * 14, 6 + r() * 8, r() * 3, 0, 7); g.fill() } g.restore();
    g.strokeStyle = "rgba(40,30,20,.5)"; g.lineWidth = 2; aMano(g, pts, r, 18); g.stroke() }
  grietas(g, r, 10 + (r() * 10 | 0), w, h);
  const beam = (x0, y0, x1, y1, wd) => { const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L * wd / 2, ny = dx / L * wd / 2, j = () => (r() - .5) * wd * .25;
    const pts = [[x0 + nx + j(), y0 + ny + j()], [x1 + nx + j(), y1 + ny + j()], [x1 - nx + j(), y1 - ny + j()], [x0 - nx + j(), y0 - ny + j()]];
    g.save(); aMano(g, pts, r, wd * .2); g.clip(); vetas(g, r, Math.min(x0, x1) - wd, Math.min(y0, y1) - wd, Math.abs(dx) + wd * 2, Math.abs(dy) + wd * 2, "#3a2618", Math.abs(dy) > Math.abs(dx)); g.restore();
    g.strokeStyle = "rgba(15,8,4,.55)"; g.lineWidth = 2.5; aMano(g, pts, r, wd * .2); g.stroke();
    for (let k = 0; k < L / 120; k++) { const q = r(); g.fillStyle = "rgba(20,14,10,.8)"; g.beginPath(); g.arc(x0 + dx * q, y0 + dy * q, 2.5, 0, 7); g.fill() } };
  const W1 = 34 + r() * 10, mid = h * (.42 + r() * .16);
  beam(W1 / 2, 0, W1 / 2 + (r() - .5) * 6, h, W1); beam(w - W1 / 2, 0, w - W1 / 2 + (r() - .5) * 6, h, W1);
  const nPost = 1 + (r() * 2 | 0), xs = [W1 / 2]; for (let k = 1; k <= nPost; k++) xs.push(w * k / (nPost + 1) + (r() - .5) * 60); xs.push(w - W1 / 2);
  xs.slice(1, -1).forEach(x => beam(x, 0, x + (r() - .5) * 10, h, 26 + r() * 10));
  beam(0, W1 / 2, w, W1 / 2 + (r() - .5) * 8, W1); beam(0, mid, w, mid + (r() - .5) * 14, 26 + r() * 8); beam(0, h - W1 / 2, w, h - W1 / 2 + (r() - .5) * 6, W1 + 6);
  for (let i = 0; i < xs.length - 1; i++) for (const [ya, yb] of [[W1, mid], [mid, h - W1]]) { const t = r(); if (t < .35) continue; const xa = xs[i] + 14, xb = xs[i + 1] - 14;
    if (t < .6) beam(xa, yb, xb, ya, 18); else if (t < .85) beam(xa, ya, xb, yb, 18); else { beam(xa, ya, xb, yb, 16); beam(xa, yb, xb, ya, 16) } }
  for (let k = 0; k < 90; k++) { g.fillStyle = `rgba(${70 + r() * 30 | 0},${95 + r() * 30 | 0},${40 + r() * 20 | 0},${.15 + r() * .3})`; g.beginPath(); g.ellipse(r() * w, h - r() * r() * h * .25, 4 + r() * 16, 2 + r() * 8, r() * 3, 0, 7); g.fill() } });
// tejas: filas de alto distinto, cada teja con su forma, rajaduras, musgo y faltantes (se dibujan de abajo hacia arriba para que se encimen bien)
const T_TEJAS = tex(2048, 2048, (g, w, h) => { const r = rng(9); g.fillStyle = "#1c1814"; g.fillRect(0, 0, w, h); const filas = []; let y = -10; while (y < h) { const rh = 44 + r() * 26; filas.push([y, rh]); y += rh }
  filas.reverse().forEach(([y, rh]) => { let x = -r() * 60; const tono = r();
    while (x < w) { const sw = 46 + r() * 50; if (r() > .03) { const v = 58 + r() * 40 + tono * 14 | 0, wa = (r() - .5) * 6, pts = [[x + 2, y], [x + sw - 2, y + (r() - .5) * 4], [x + sw - 3 + wa, y + rh + 6 + r() * 6], [x + 3 + wa, y + rh + 6 + r() * 6]];
        aMano(g, pts, r, 5); const gr = g.createLinearGradient(0, y, 0, y + rh + 10); gr.addColorStop(0, `rgb(${v - 18},${v - 22},${v - 24})`); gr.addColorStop(1, `rgb(${v + 10},${v + 4},${v - 2})`); g.fillStyle = gr; g.fill(); g.strokeStyle = "rgba(0,0,0,.45)"; g.lineWidth = 2; g.stroke();
        g.fillStyle = "rgba(0,0,0,.3)"; g.fillRect(x + 3, y + rh + 2, sw - 6, 5);
        if (r() < .25) { g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x + sw * r(), y + rh * .3); g.lineTo(x + sw * r(), y + rh); g.stroke() }
        if (r() < .18) { g.fillStyle = `rgba(${80 + r() * 40 | 0},${110 + r() * 30 | 0},${50 + r() * 20 | 0},${.3 + r() * .4})`; g.beginPath(); g.ellipse(x + sw * r(), y + rh * (.5 + r() * .5), 6 + r() * 20, 4 + r() * 10, r() * 3, 0, 7); g.fill() } }
      x += sw + (r() - .3) * 4 } });
  manchas(g, r, 30, w, h, "#d8d0c0", 60, 260, .04, .1); manchas(g, r, 25, w, h, "#203018", 50, 200, .05, .15) });
// piedra: hiladas de alto distinto con piedras irregulares, verdín y grietas
const T_PIEDRA = tex(2048, 2048, (g, w, h) => { const r = rng(13); g.fillStyle = "#3a342c"; g.fillRect(0, 0, w, h);
  let y = 0; while (y < h) { const rh = 50 + r() * 60; let x = -r() * 80; while (x < w) { const sw = 60 + r() * 130, cx = x + sw / 2, cy = y + rh / 2, pts = Array.from({ length: 8 }, (_, i) => { const a = i / 8 * 6.28 + r() * .3; return [cx + Math.cos(a) * (sw / 2 - 4) * (.8 + r() * .22), cy + Math.sin(a) * (rh / 2 - 4) * (.8 + r() * .22)] });
      aMano(g, pts, r, 10); const v = r(), base = v < .3 ? "#8a8478" : v < .6 ? "#9a8e7a" : v < .85 ? "#7a7468" : "#a89a82", gr = g.createLinearGradient(cx - sw / 2, cy - rh / 2, cx + sw / 2, cy + rh / 2); gr.addColorStop(0, rgbj(base, r, 30)); gr.addColorStop(1, rgbj("#4a443c", r, 20)); g.fillStyle = gr; g.fill();
      g.strokeStyle = "rgba(255,250,235,.12)"; g.lineWidth = 3; g.stroke();
      g.save(); g.clip(); for (let k = 0; k < 10; k++) { g.fillStyle = r() < .5 ? "rgba(0,0,0,.12)" : "rgba(255,255,255,.08)"; g.beginPath(); g.arc(cx + (r() - .5) * sw, cy + (r() - .5) * rh, 2 + r() * 8, 0, 7); g.fill() } g.restore();
      x += sw + 3 + r() * 6 } y += rh + 3 + r() * 5 }
  manchas(g, r, 40, w, h, "#20301a", 40, 220, .05, .18); manchas(g, r, 30, w, h, "#ffffff", 60, 240, .03, .08); grietas(g, r, 30, w, h, "rgba(20,16,12,.5)") });
// madera: tablas de ancho distinto con veta, nudos, uniones y clavos
const T_TABLAS = tex(1024, 1024, (g, w, h) => { const r = rng(7); let x = 0; while (x < w) { const pw = 50 + r() * 70; vetas(g, r, x, 0, pw, h, r() < .5 ? "#6a4a30" : "#5a3e28", true); g.fillStyle = "rgba(0,0,0,.5)"; g.fillRect(x + pw - 3, 0, 3, h);
    if (r() < .4) { g.fillStyle = "rgba(0,0,0,.45)"; g.fillRect(x, r() * h, pw, 3) } for (const yy of [h * .08 + r() * 20, h * .92 - r() * 20]) for (const dx of [.25, .75]) { g.fillStyle = "#2a2420"; g.beginPath(); g.arc(x + pw * dx, yy, 3.5, 0, 7); g.fill() } x += pw }
  manchas(g, r, 25, w, h, "#d8c8a8", 40, 200, .04, .12); manchas(g, r, 25, w, h, "#1a120a", 40, 200, .05, .15) });
// tierra: manchas, piedritas y pasto, sin grilla
const T_TIERRA = tex(1024, 1024, (g, w, h) => { const r = rng(17); g.fillStyle = "#7d684e"; g.fillRect(0, 0, w, h); manchas(g, r, 60, w, h, "#4a3a28", 30, 160, .1, .3); manchas(g, r, 40, w, h, "#b8a080", 30, 140, .08, .2);
  for (let k = 0; k < 900; k++) { g.fillStyle = rgbj(r() < .5 ? "#9a8a72" : "#5a4a38", r, 40, .8); g.beginPath(); g.ellipse(r() * w, r() * h, 1.5 + r() * 5, 1 + r() * 4, r() * 3, 0, 7); g.fill() }
  for (let k = 0; k < 300; k++) { const x = r() * w, y = r() * h; g.strokeStyle = `rgba(${70 + r() * 40 | 0},${100 + r() * 40 | 0},40,.6)`; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 8, y - 6 - r() * 10); g.stroke() } });
const T_SHINGLE = T_TEJAS, T_STONE = T_PIEDRA, T_PLANK = T_TABLAS, T_DIRT = T_TIERRA;


// ---------- materiales
const SMt = (map, o = {}) => new THREE.MeshStandardMaterial({ map, roughness: .9, ...o });
const M_COB = SMt(T_COB, { roughness: .55, bumpMap: T_COB, bumpScale: 2.5 });
const M_SHING = SMt(T_SHINGLE, { bumpMap: T_SHINGLE, bumpScale: 2 });
const M_STONE = SMt(T_STONE, { bumpMap: T_STONE, bumpScale: 2 });
const M_PLANK = SMt(T_PLANK, { bumpMap: T_PLANK, bumpScale: 1.5 });
const M_DIRT = SMt(T_DIRT, { bumpMap: T_DIRT, bumpScale: 1 });
const M_BEAM = SM("#3a2618", { roughness: .85 });
const WALLC = ["#b8a184", "#a89276", "#c2ab8a", "#9f8a70", "#b39a7c", "#c9b598", "#a8957a", "#bfa07a", "#d0c0a0", "#9a8468", "#b8a890", "#c4a684", "#ad9c80", "#c8b08c", "#a48a6c", "#bcae96"];
const M_WALL = WALLC.map((c, i) => { const t = T_PARED(40 + i, c); return SMt(t, { bumpMap: t, bumpScale: 1.2 }) });
const M_GABLE = WALLC.map((c, i) => { const t = T_PARED(80 + i, c); return SMt(t, { bumpMap: t, bumpScale: 1 }) });
const M_WIN = () => new THREE.MeshStandardMaterial({ color: "#2a1d12", emissive: AMBER, emissiveIntensity: 1.6, roughness: .4 });
const M_GLASS = new THREE.MeshStandardMaterial({ color: "#ffe2a8", transparent: true, opacity: .1, roughness: .05, emissive: "#ffb24a", emissiveIntensity: .06, depthWrite: false });

// ---------- casas (frente = +z local). En la calle: lado -1 a la izquierda (x = -8,5, mira a +x), lado +1 a la derecha (x = 8,5, mira a -x)
// muro con huecos (ventanas y puerta de verdad, para ver adentro): se arma con franjas verticales
function wallHoles(par, Wd, Hh, th, holes, mat, z) {
  const xs = [-Wd / 2, Wd / 2]; holes.forEach(h => xs.push(h.x - h.w / 2, h.x + h.w / 2)); xs.sort((a, b) => a - b);
  for (let i = 0; i < xs.length - 1; i++) { const a = xs[i], b = xs[i + 1], cx = (a + b) / 2, w = b - a; if (w < .01) continue;
    const hh = holes.find(h => cx > h.x - h.w / 2 && cx < h.x + h.w / 2);
    const box = (y0, y1) => { if (y1 - y0 < .01) return; const m = part(new THREE.BoxGeometry(w, y1 - y0, th), mat, cx, (y0 + y1) / 2, z, par, 0); m.material.map && (m.geometry = boxUV(m.geometry, w, y1 - y0, cx, (y0 + y1) / 2, Wd, Hh)) };
    if (!hh) box(0, Hh); else { box(0, hh.y - hh.h / 2); box(hh.y + hh.h / 2, Hh) } }
  holes.forEach(h => { for (const [x, y, w, hh] of [[h.x, h.y + h.h / 2 + .08, h.w + .3, .16], [h.x, h.y - h.h / 2 - .08, h.w + .4, .16], [h.x - h.w / 2 - .08, h.y, .16, h.h], [h.x + h.w / 2 + .08, h.y, .16, h.h]]) part(new THREE.BoxGeometry(w, hh, th + .12), M_BEAM, x, y, z, par, 0) });
}
function boxUV(geo, w, h, cx, cy, Wd, Hh) { const uv = geo.attributes.uv, p = geo.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (p.getX(i) + cx + Wd / 2) / Wd, (p.getY(i) + cy) / Hh); uv.needsUpdate = true; return geo }
const HOUSES = [];
function house(x, z, side, o = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2; scene.add(g);
  const Wd = o.w ?? 7, Dp = 6, Hh = o.h ?? 5.4, rh = o.rh ?? 2.8, v = o.v ?? 0, wm = M_WALL[v % M_WALL.length], th = .3;
  const H = { g, x, z, side, walls: [], roof: new THREE.Group(), porch: null, panes: [], glows: [], holes: !!o.holes, Hh, Wd };
  const W4 = [0, 1, 2, 3].map(() => { const q = new THREE.Group(); g.add(q); H.walls.push(q); return q });
  const holes = o.holes || [];
  if (holes.length) { wallHoles(W4[0], Wd, Hh, th, holes, wm, Dp / 2 - th / 2); holes.filter(h => h.h < 2.5).forEach(h => { const m = new THREE.Mesh(new THREE.PlaneGeometry(h.w, h.h), M_GLASS); m.position.set(h.x, h.y, Dp / 2 - .05); W4[0].add(m); const gl = glowSprite(AMBER, 1.6); gl.material.opacity = .3; W4[0].add(gl); gl.position.set(h.x, h.y, Dp / 2 + .4); H.glows.push(gl) }) } else { const m = part(new THREE.BoxGeometry(Wd, Hh, th), wm, 0, Hh / 2, Dp / 2 - th / 2, W4[0], 0) }
  part(new THREE.BoxGeometry(Wd, Hh, th), wm, 0, Hh / 2, -Dp / 2 + th / 2, W4[1], 0);
  for (const [q, sx] of [[W4[2], -1], [W4[3], 1]]) { const m = part(new THREE.BoxGeometry(th, Hh, Dp), wm, sx * (Wd / 2 - th / 2), Hh / 2, 0, q, 0) }
  part(new THREE.BoxGeometry(Wd + .2, .35, Dp + .2), M_STONE, 0, .17, 0, W4[1], 0);                                         // zócalo de piedra
  // techo a dos aguas con tejas + hastiales
  g.add(H.roof); H.roof.position.y = Hh; const half = Dp / 2 + .55, sl = Math.hypot(half, rh), ang = Math.atan2(rh, half);
  for (const s of [-1, 1]) { const m = part(new THREE.BoxGeometry(Wd + .9, .22, sl), M_SHING, 0, rh / 2, s * half / 2, H.roof, 0); m.rotation.x = s * ang }
  part(new THREE.BoxGeometry(Wd + 1, .3, .3), M_BEAM, 0, rh + .05, 0, H.roof, 0);
  for (const s of [-1, 1]) { const sh = new THREE.Shape(); sh.moveTo(-Wd / 2, 0); sh.lineTo(0, rh - .05); sh.lineTo(Wd / 2, 0); sh.closePath(); const m = part(gableUV(new THREE.ShapeGeometry(sh), Wd, rh), M_GABLE[v % M_GABLE.length], 0, 0, s * (Dp / 2 - .02), H.roof, 0); if (s < 0) m.rotation.y = Math.PI }
  part(new THREE.BoxGeometry(.9, 2.2, .9), M_STONE, Wd * .28, rh * .55 + .6, -.8, H.roof, 0);                               // chimenea
  // puerta (si no tiene hueco de puerta) y ventanas con dos lámparas
  if (!holes.length) { part(new THREE.BoxGeometry(1.3, 2.6, .12), M_PLANK, o.door ?? 0, 1.3, Dp / 2 + .02, W4[0], 0); part(new THREE.BoxGeometry(1.6, .18, .3), M_BEAM, o.door ?? 0, 2.7, Dp / 2 + .05, W4[0], 0)
    for (const wx of o.wins ?? [-2.1, 2.1]) { const pm = M_WIN(); part(new THREE.BoxGeometry(1.2, 1.4, .1), pm, wx, 2.5, Dp / 2 + .01, W4[0], 0); H.panes.push(pm);
      for (const [a, b, w, h] of [[0, 3.28, 1.5, .18], [0, 1.72, 1.6, .18], [-.68, 2.5, .16, 1.6], [.68, 2.5, .16, 1.6], [0, 2.5, .07, 1.4], [0, 2.5, 1.2, .07]]) part(new THREE.BoxGeometry(w, h, .16), M_BEAM, wx + a, b, Dp / 2 + .03, W4[0], 0);
      const gl = glowSprite(AMBER, 3.2); gl.material.opacity = .55; W4[0].add(gl); gl.position.set(wx, 2.5, Dp / 2 + .4); H.glows.push(gl) } }
  if (o.attic) { const pm = M_WIN(); pm.emissiveIntensity = 0; const m = part(new THREE.CircleGeometry(.5, 24), pm, 0, rh * .42, Dp / 2 + .03, H.roof, 0); part(new THREE.TorusGeometry(.52, .08, 8, 24), M_BEAM, 0, rh * .42, Dp / 2 + .05, H.roof, 0); H.attic = pm; const gl = glowSprite(AMBER, 0); H.roof.add(gl); gl.position.set(0, rh * .42, Dp / 2 + .5); H.atticGlow = gl }
  HOUSES.push(H); return H;
}

// ---------- utilería: lámpara de aceite, bastón, farol, rastrillo, brocha, torta, frasco, velas, cama, mesa
function oilLamp(sc = 1) { const g = new THREE.Group(); g.scale.setScalar(sc); const br = SM("#8a6a3a", { metalness: .6, roughness: .35 });
  part(new THREE.CylinderGeometry(.16, .2, .1, 16), br, 0, .05, 0, g, 0); part(new THREE.SphereGeometry(.17, 16, 10), br, 0, .2, 0, g, 0); part(new THREE.CylinderGeometry(.08, .1, .08, 12), br, 0, .36, 0, g, 0);
  const ch = new THREE.Mesh(new THREE.SphereGeometry(.15, 16, 12), M_GLASS); ch.scale.set(1, 1.7, 1); ch.position.y = .58; g.add(ch); part(new THREE.TorusGeometry(.1, .015, 6, 16), br, 0, .9, 0, g, 0).rotation.x = Math.PI / 2;
  const fl = new THREE.Mesh(new THREE.SphereGeometry(.045, 10, 8), new THREE.MeshBasicMaterial({ color: "#fff2c0" })); fl.scale.set(1, 2.2, 1); fl.position.y = .55; g.add(fl);
  const gl = glowSprite(AMBER, 1.6, false); g.add(gl); gl.position.y = .55; return { g, gl, fl } }
const LIGHTS = Array.from({ length: 7 }, () => { const l = new THREE.PointLight(AMBER, 0, 12, 1.6); scene.add(l); return l });
function lights(list) { LIGHTS.forEach((l, i) => { const d = list[i]; l.intensity = d ? d[1] : 0; if (d) { l.position.set(...d[0]); l.color.set(d[2] || AMBER); l.distance = d[3] || 12 } }) }
const CANE = new THREE.Group(); part(new THREE.CylinderGeometry(.04, .045, 2.4, 8), SM("#4a3020"), 0, -1.05, .12, CANE, 0); part(new THREE.TorusGeometry(.13, .04, 6, 12, Math.PI), SM("#4a3020"), -.13, .15, .12, CANE, 0);
const LANT = new THREE.Group(); { const m = SM("#2a2420", { metalness: .5 }); part(new THREE.BoxGeometry(.32, .04, .32), m, 0, .02, 0, LANT, 0); part(new THREE.BoxGeometry(.36, .06, .36), m, 0, .5, 0, LANT, 0); for (const [x, z] of [[-.15, -.15], [.15, -.15], [-.15, .15], [.15, .15]]) part(new THREE.BoxGeometry(.03, .48, .03), m, x, .26, z, LANT, 0); const gl = new THREE.Mesh(new THREE.BoxGeometry(.28, .44, .28), M_GLASS); gl.position.y = .26; LANT.add(gl); part(new THREE.TorusGeometry(.1, .015, 6, 12, Math.PI), m, 0, .6, 0, LANT, 0) }
const LANTG = glowSprite(AMBER, 2.2, false); LANT.add(LANTG); LANTG.position.y = .26;
const RAKE = new THREE.Group(); part(new THREE.CylinderGeometry(.035, .035, 3, 8), SM("#7a5a3a"), 0, -1.2, .1, RAKE, 0); part(new THREE.BoxGeometry(1, .08, .1), SM("#3a3a3a", { metalness: .5 }), 0, -2.7, .1, RAKE, 0); for (let k = 0; k < 8; k++) part(new THREE.BoxGeometry(.03, .2, .03), SM("#3a3a3a"), -.45 + k * .13, -2.82, .1, RAKE, 0);
const BRUSH = new THREE.Group(); part(new THREE.CylinderGeometry(.03, .03, .6, 8), SM("#7a5a3a"), 0, -.25, .1, BRUSH, 0); part(new THREE.BoxGeometry(.16, .16, .06), SM("#efe6d2"), 0, -.6, .1, BRUSH, 0);
const SCISS = new THREE.Group(); for (const s of [-1, 1]) { const b = part(new THREE.BoxGeometry(.03, .34, .015), SM("#c9c9d2", { metalness: .9, roughness: .2 }), 0, -.15, .1, SCISS, 0); b.rotation.z = s * .18; part(new THREE.TorusGeometry(.05, .012, 6, 12), SM("#1a1a1a"), s * .04, .06, .1, SCISS, 0) }

// ---------- luz más cuidada: sombras más finas, luz de contorno fría del lado opuesto al sol
sun.shadow.mapSize.set(4096, 4096); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null } sun.shadow.bias = -.0003; sun.shadow.normalBias = .03;
const CONTRA = new THREE.DirectionalLight("#cfe0ff", 1.7); CONTRA.position.set(60, 30, 70); scene.add(CONTRA);

// ---------- el mar poco profundo, el agua honda y la costa (modo día)
const T_AGUA = tex(2048, 2048, (g, w, h) => { const r = rng(91); g.fillStyle = "#2fa3b4"; g.fillRect(0, 0, w, h);
  for (let k = 0; k < 9000; k++) { const x = r() * w, y = r() * h, l = 20 + r() * 60; g.strokeStyle = r() < .55 ? "rgba(255,255,255,.16)" : "rgba(10,70,90,.18)"; g.lineWidth = 2 + r() * 3; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 6, x + l, y); g.stroke() } }, [8, 8]);
// mapa de normales de olas (alturas = suma de ondas con frecuencias enteras → se repite sin costura)
const T_OLAS = (() => { const N = 512, c = document.createElement("canvas"); c.width = c.height = N; const g = c.getContext("2d"), im = g.createImageData(N, N), hgt = new Float32Array(N * N), r = rng(77);
  const ondas = Array.from({ length: 26 }, () => { const a = r() * 6.283, f = 1 + (r() * 9 | 0); return [Math.round(Math.cos(a) * f), Math.round(Math.sin(a) * f), r() * 6.283, 1 / Math.pow(f, 1.1)] });
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { let v = 0; for (const [kx, ky, ph, am] of ondas) { const q = Math.sin((kx * x + ky * y) / N * 6.283 + ph); v += am * (.55 * q + .45 * (1 - Math.abs(q))) } hgt[y * N + x] = v }
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const H = (i, j) => hgt[((j + N) % N) * N + (i + N) % N], dx = (H(x + 1, y) - H(x - 1, y)) * 3.2, dy = (H(x, y + 1) - H(x, y - 1)) * 3.2, l = Math.hypot(dx, dy, 1), o = (y * N + x) * 4;
    im.data[o] = (-dx / l * .5 + .5) * 255; im.data[o + 1] = (dy / l * .5 + .5) * 255; im.data[o + 2] = (1 / l * .5 + .5) * 255; im.data[o + 3] = 255 }
  g.putImageData(im, 0, 0); const T = new THREE.CanvasTexture(c); T.wrapS = T.wrapT = THREE.RepeatWrapping; T.colorSpace = THREE.NoColorSpace; T.anisotropy = 16; T.repeat.set(140, 140); return T })();
// el cielo que refleja el agua (mismo degradé del cielo de día + el sol) prefiltrado para el material físico
const ENV_AGUA = (() => { const es = new THREE.Scene(); es.add(new THREE.Mesh(new THREE.SphereGeometry(50, 64, 32), new THREE.ShaderMaterial({ side: THREE.BackSide,
    uniforms: { top: { value: new THREE.Color("#3f86d6") }, hor: { value: new THREE.Color("#d8ecf8") }, sd: { value: new THREE.Vector3(-56, 36, -40).normalize() } },
    vertexShader: "varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
    fragmentShader: "uniform vec3 top; uniform vec3 hor; uniform vec3 sd; varying vec3 vD; void main(){ float h = vD.y; vec3 c = mix(hor, top, smoothstep(-.02, .5, h)); c = mix(c, vec3(.42,.5,.52), smoothstep(.0, -.25, h)); c += vec3(1.,.9,.75) * (pow(max(dot(vD, sd), 0.), 900.) * 2.5 + pow(max(dot(vD, sd), 0.), 12.) * .35); gl_FragColor = vec4(c, 1.); }" })));
  const pm = new THREE.PMREMGenerator(R), rt = pm.fromScene(es, 0, .1, 100); pm.dispose(); return rt.texture })();
const M_AGUA = new THREE.MeshPhysicalMaterial({ color: "#13697e", roughness: .1, metalness: 0, ior: 1.33, specularIntensity: .35,
  normalMap: T_OLAS, normalScale: new THREE.Vector2(.6, .6), envMap: ENV_AGUA, envMapIntensity: 1.05, transparent: true, opacity: .9 });
const AGUA_T = { value: 0 };
M_AGUA.onBeforeCompile = sh => { sh.uniforms.uT = AGUA_T; sh.fragmentShader = "uniform float uT;\n" + sh.fragmentShader.replace("vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;",
  "vec3 n1 = texture2D( normalMap, vNormalMapUv * .37 + uT * vec2( .0021, .0013 ) ).xyz * 2. - 1.; vec3 n2 = texture2D( normalMap, vNormalMapUv * 1.0 + uT * vec2( -.0047, .0031 ) ).xyz * 2. - 1.; vec3 n3 = texture2D( normalMap, vNormalMapUv * 3.1 + uT * vec2( .0083, -.0069 ) ).xyz * 2. - 1.; vec3 mapN = normalize( vec3( n1.xy * 1.1 + n2.xy + n3.xy * .55, 1. ) );") };
const AGUA = part(new THREE.PlaneGeometry(3000, 3000), M_AGUA, 0, 0, 0, scene, 0); AGUA.rotation.x = -Math.PI / 2; AGUA.receiveShadow = true;
const T_ARENA = tex(2048, 2048, (g, w, h) => { const r = rng(92); g.fillStyle = "#c8b48a"; g.fillRect(0, 0, w, h); for (let k = 0; k < 30000; k++) { g.fillStyle = r() < .5 ? "rgba(120,100,70,.18)" : "rgba(255,240,210,.18)"; g.fillRect(r() * w, r() * h, 3, 3) } }, [12, 12]);
const FONDO = part(new THREE.PlaneGeometry(3000, 3000), SMt(T_ARENA, { roughness: 1 }), 0, -3, 0, scene, 0); FONDO.rotation.x = -Math.PI / 2;
// el agua honda: una mancha azul oscuro hacia +x (adonde quiere ir la tortuga)
const HONDA = part(new THREE.CircleGeometry(260, 48), new THREE.MeshStandardMaterial({ color: "#0b3a63", roughness: .2, metalness: .3, transparent: true, opacity: .9 }), 330, .02, -40, scene, 0); HONDA.rotation.x = -Math.PI / 2;
// la costa hacia −x: playa, pasto y colinas
const T_PASTO = tex(1024, 1024, (g, w, h) => { const r = rng(93); g.fillStyle = "#6f9a45"; g.fillRect(0, 0, w, h); for (let k = 0; k < 6000; k++) { const v = r(); g.strokeStyle = v < .4 ? "rgba(60,95,35,.55)" : v < .75 ? "rgba(150,185,80,.45)" : "rgba(200,170,80,.35)"; g.lineWidth = 2; const x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 6, y - 8 - r() * 10); g.stroke() } }, [30, 30]);
const COSTA = new THREE.Group(); scene.add(COSTA); COSTA.position.set(-110, 0, 0);
{ const pl = part(new THREE.PlaneGeometry(60, 700), SMt(T_ARENA), 30, .25, 0, COSTA, 0); pl.rotation.x = -Math.PI / 2; const ps = part(new THREE.PlaneGeometry(400, 700), SMt(T_PASTO), -170, .6, 0, COSTA, 0); ps.rotation.x = -Math.PI / 2;
  const r = rng(94); for (let k = 0; k < 14; k++) { const c = part(new THREE.SphereGeometry(30 + r() * 30, 18, 12), SMt(T_PASTO), -60 - r() * 180, -10, -300 + k * 46, COSTA, 0); c.scale.y = .45 + r() * .3 }
  for (let k = 0; k < 9; k++) { const x = -20 - r() * 40, z = -200 + k * 50; part(RB(6, 5, 6, .2), M_WALL[k % 5], x, 2.8, z, COSTA, 0); const t = part(new THREE.ConeGeometry(5, 3.4, 4), M_SHING, x, 7, z, COSTA, 0); t.rotation.y = Math.PI / 4 } }

// ---------- la tortuga (todo cuelga de TURT: si se inclina, se hunde o gira, el pueblo va con ella)
const TURT = new THREE.Group(); scene.add(TURT);
const SA = 34, SB = 27, SH = .3, RIM = .06;                                   // caparazón: semiejes en z y x, alto, altura del borde sobre el agua
const SY = (x, z) => { const q = 1 - (x / SB) ** 2 - (z / SA) ** 2; return RIM + SH * Math.pow(Math.max(0, q), .62) };   // altura del caparazón en (x, z)
// caparazón pintado a mano: escudos irregulares (celdas con borde torcido), anillos de crecimiento, rayones, liquen,
// algas y percebes hacia el borde; arriba, el pueblo con tierra, matas de pasto y calles de piedras sueltas (cada una distinta)
const T_CAPA = tex(2048, 2048, (g, w, h) => { const r = rng(95), X = x => (x / (2 * SB) + .5) * w, Z = z => (z / (2 * SA) + .5) * h;
  g.fillStyle = "#2a2416"; g.fillRect(0, 0, w, h);
  const S = []; for (let k = 0; k < 5; k++) S.push([(r() - .5) * 2, -24 + k * 12 + (r() - .5) * 2]);
  for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) S.push([sx * (12 + r() * 2), -18 + k * 12 + (r() - .5) * 3]);
  for (let k = 0; k < 26; k++) { const a = k / 26 * 6.28 + r() * .08; S.push([Math.cos(a) * SB * .9, Math.sin(a) * SA * .92]) }
  const P = S.map(([x, z]) => [X(x), Z(z)]), cerca = (x, y) => { let b = 0, bd = 1e12; P.forEach(([px, py], i) => { const d = (x - px) ** 2 + (y - py) ** 2; if (d < bd) { bd = d; b = i } }); return b };
  const fuera = (x, y) => ((x / w - .5) / .5) ** 2 + ((y / h - .5) / .5) ** 2 > 1.04;
  P.forEach(([px, py], i) => { const pts = []; for (let k = 0; k < 40; k++) { const a = k / 40 * 6.28; let d = 4; while (d < 700) { const x = px + Math.cos(a) * d, y = py + Math.sin(a) * d; if (cerca(x, y) !== i || fuera(x, y)) break; d += 6 } pts.push([px + Math.cos(a) * Math.max(4, d - 8), py + Math.sin(a) * Math.max(4, d - 8)]) }
    const tono = ["#6e5e36", "#5e5030", "#7a6838", "#54482a", "#68583a", "#73623c"][r() * 6 | 0];
    aMano(g, pts, r, 14); const gr = g.createRadialGradient(px - 20, py - 20, 10, px, py, 260); gr.addColorStop(0, rgbj("#8a7a4a", r, 26)); gr.addColorStop(1, rgbj(tono, r, 20)); g.fillStyle = gr; g.fill();
    for (let q = .9; q > .15; q -= .07 + r() * .06) { aMano(g, pts.map(([x, y]) => [px + (x - px) * q + (r() - .5) * 6, py + (y - py) * q + (r() - .5) * 6]), r, 10); g.strokeStyle = r() < .5 ? "rgba(30,22,10,.32)" : "rgba(220,200,150,.14)"; g.lineWidth = 1.5 + r() * 3; g.stroke() }
    aMano(g, pts, r, 14); g.strokeStyle = "#1e1810"; g.lineWidth = 9 + r() * 6; g.stroke(); g.strokeStyle = "rgba(230,210,160,.18)"; g.lineWidth = 2; g.stroke() });
  grietas(g, r, 140, w, h, "rgba(20,14,8,.45)");
  for (let k = 0; k < 260; k++) { const x = r() * w, y = r() * h, a = r() * 6.28, L = 10 + r() * 60; g.strokeStyle = "rgba(235,220,180,.25)"; g.lineWidth = 1 + r() * 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke() }
  for (let k = 0; k < 70; k++) { const cx = r() * w, cy = r() * h, n = 6 + r() * 20; for (let s = 0; s < n; s++) { g.fillStyle = `rgba(${150 + r() * 50 | 0},${160 + r() * 40 | 0},${120 + r() * 30 | 0},${.25 + r() * .35})`; g.beginPath(); g.arc(cx + (r() - .5) * 60, cy + (r() - .5) * 60, 2 + r() * 9, 0, 7); g.fill() } }
  for (let k = 0; k < 3000; k++) { const a = r() * 6.28, q = .78 + Math.pow(r(), .5) * .24, x = w / 2 + Math.cos(a) * w / 2 * q, y = h / 2 + Math.sin(a) * h / 2 * q;
    if (r() < .8) { g.fillStyle = `rgba(${50 + r() * 30 | 0},${90 + r() * 40 | 0},${40 + r() * 20 | 0},${.2 + r() * .4})`; g.beginPath(); g.ellipse(x, y, 3 + r() * 12, 2 + r() * 6, a, 0, 7); g.fill() }
    else { g.fillStyle = "rgba(30,26,18,.35)"; g.beginPath(); g.arc(x, y, 2 + r() * 6, 0, 7); g.fill() } }
  g.save(); const tp = Array.from({ length: 30 }, (_, i) => { const a = i / 30 * 6.28; return [w / 2 + Math.cos(a) * w * .4 * (.95 + r() * .08), h / 2 + Math.sin(a) * h * .42 * (.95 + r() * .08)] }); aMano(g, tp, r, 40); g.clip();
  g.fillStyle = "#86704f"; g.fillRect(0, 0, w, h); manchas(g, r, 120, w, h, "#5a4a32", 40, 220, .1, .3); manchas(g, r, 90, w, h, "#c8b48a", 40, 200, .06, .18); manchas(g, r, 90, w, h, "#5a7a34", 30, 180, .15, .4);
  for (let k = 0; k < 2600; k++) { const x = r() * w, y = r() * h; g.strokeStyle = `rgba(${60 + r() * 50 | 0},${100 + r() * 50 | 0},${30 + r() * 30 | 0},${.4 + r() * .4})`; g.lineWidth = 1.5 + r() * 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 10, y - 8 - r() * 14); g.stroke() }
  for (let k = 0; k < 1500; k++) { g.fillStyle = rgbj(r() < .5 ? "#9a8a72" : "#5a4a38", r, 40, .8); g.beginPath(); g.ellipse(r() * w, r() * h, 2 + r() * 5, 1.5 + r() * 4, r() * 3, 0, 7); g.fill() }
  const calle = (x0, z0, x1, z1, an) => { for (let q = 0; q <= 1; q += .0025) { const x = X(lerp(x0, x1, q)) + Math.sin(q * 9) * 10, y = Z(lerp(z0, z1, q)); for (let k = 0; k < 3; k++) { if (r() < .12) continue; const px = x + (r() - .5) * an, py = y + (r() - .5) * an, sz = 7 + r() * 10, pts = Array.from({ length: 6 }, (_, i) => { const a = i / 6 * 6.28 + r() * .5; return [px + Math.cos(a) * sz * (.7 + r() * .4), py + Math.sin(a) * sz * (.6 + r() * .4)] });
      aMano(g, pts, r, 4); g.fillStyle = rgbj(["#9a9082", "#8a8274", "#a89c88", "#7e7466"][r() * 4 | 0], r, 30); g.fill(); g.strokeStyle = "rgba(40,30,20,.5)"; g.lineWidth = 2; g.stroke(); g.fillStyle = "rgba(255,250,235,.15)"; g.beginPath(); g.arc(px - sz * .25, py - sz * .25, sz * .3, 0, 7); g.fill() } } };
  calle(0, -28, 0, 28, 120); calle(-24, 0, 24, 0, 96); g.restore() });
// ---------- percebes de verdad (conos huecos con la boca arriba), en el borde del caparazón y en el costado
const GEO_PERCEBE = new THREE.LatheGeometry([[0.05, .16], [.08, .3], [.115, .31], [.2, .17], [.3, 0]].map(([x, y]) => new THREE.Vector2(x, y)), 12);
const M_PERCEBE = new THREE.MeshStandardMaterial({ color: "#7e8070", roughness: .95, side: THREE.DoubleSide });
{ const r = rng(161), N = 2200, pm = new THREE.InstancedMesh(GEO_PERCEBE, M_PERCEBE, N); pm.castShadow = pm.receiveShadow = true; TURT.add(pm); const cc = new THREE.Color(); let n = 0;
  for (let c = 0; c < 150 && n < N; c++) { const a0 = r() * 6.28, f0 = .91 + r() * .08, cnt = 6 + (r() * 14 | 0);
    for (let k = 0; k < cnt && n < N; k++) { const a = a0 + (r() - .5) * .08, f = f0 + (r() - .5) * .04, x = Math.cos(a) * SB * f, z = Math.sin(a) * SA * f, y = SY(x, z);
      dummy.position.set(x, y - .02, z); dummy.rotation.set((r() - .5) * .5, r() * 6, (r() - .5) * .5); dummy.scale.setScalar(.4 + r() * .9); dummy.updateMatrix(); pm.setMatrixAt(n, dummy.matrix); pm.setColorAt(n, cc.set(["#7e8070", "#6e7262", "#8a8a76", "#6a6a5a"][r() * 4 | 0])); n++ } }
  pm.count = n; pm.visible = false }

const M_CAPA = SMt(T_CAPA, { roughness: .85, bumpMap: T_CAPA, bumpScale: 2.5 });
// ---------- flores de verdad (tallo, pétalos, centro y hojas, con relieve y sombra) en matas, y pasto 3D, sobre el anillo verde del caparazón
{ const r = rng(160), N = 1100, evitar = [[-14, 24], [-3, 25], [18.5, 3], [-18, -14], [16, 16], [-16, 14], [15, -14], [-9, 2], [-12, -11.5]];
  const tallo = new THREE.InstancedMesh(new THREE.CylinderGeometry(.012, .018, 1, 5), SM("#4f7a32"), N), cen = new THREE.InstancedMesh(new THREE.SphereGeometry(.045, 10, 8), new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .8 }), N),
    pet = new THREE.InstancedMesh(new THREE.SphereGeometry(.06, 10, 6), new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .7 }), N * 6), hoj = new THREE.InstancedMesh(new THREE.SphereGeometry(.05, 8, 6), SM("#3f6a2a", { roughness: .8 }), N * 2);
  [tallo, cen, pet, hoj].forEach(m => { m.castShadow = m.receiveShadow = true; TURT.add(m) });
  const COL = [["#f4f2ea", "#f2c41e"], ["#f2d23a", "#c98a1a"], ["#e889a8", "#f2d23a"], ["#9a6ad0", "#f2e06a"], ["#7aa0e8", "#f4f2ea"], ["#ffffff", "#e0a020"], ["#e05a4a", "#2a1a10"]], cc = new THREE.Color();
  let n = 0, np = 0, nh = 0;
  for (let c = 0; c < 130 && n < N; c++) { const a0 = r() * 6.28, f0 = .8 + r() * .1, [pc, ccn] = COL[r() * COL.length | 0], cnt = 5 + (r() * 12 | 0);
    for (let k = 0; k < cnt && n < N; k++) { const a = a0 + (r() - .5) * .1, f = f0 + (r() - .5) * .05, x = Math.cos(a) * SB * f, z = Math.sin(a) * SA * f;
      if (evitar.some(([ex, ez]) => (ex - x) ** 2 + (ez - z) ** 2 < 20)) continue;
      const y = SY(x, z), hgt = .22 + r() * .35, sz = .8 + r() * .55, tilt = (r() - .5) * .5;
      dummy.position.set(x, y + hgt / 2, z); dummy.rotation.set((r() - .5) * .3, 0, (r() - .5) * .3); dummy.scale.set(1, hgt, 1); dummy.updateMatrix(); tallo.setMatrixAt(n, dummy.matrix);
      dummy.position.set(x, y + hgt, z); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(sz); dummy.updateMatrix(); cen.setMatrixAt(n, dummy.matrix); cen.setColorAt(n, cc.set(ccn));
      const npet = 5 + (r() * 2 | 0); for (let p = 0; p < 6; p++) { if (p >= npet) dummy.scale.setScalar(0); else { const b = p / npet * 6.28 + r() * .2; dummy.position.set(x + Math.cos(b) * .075 * sz, y + hgt + .005, z + Math.sin(b) * .075 * sz); dummy.rotation.set(0, -b, .25 + tilt); dummy.scale.set(sz * 1.15, sz * .3, sz * .6) } dummy.updateMatrix(); pet.setMatrixAt(np, dummy.matrix); pet.setColorAt(np, cc.set(pc)); np++ }
      for (let q = 0; q < 2; q++) { const b = r() * 6.28; dummy.position.set(x + Math.cos(b) * .06, y + hgt * (.2 + r() * .3), z + Math.sin(b) * .06); dummy.rotation.set(0, -b, .6); dummy.scale.set(2, .3, .8); dummy.updateMatrix(); hoj.setMatrixAt(nh++, dummy.matrix) } n++ } }
  tallo.count = cen.count = n; pet.count = np; hoj.count = nh;
  // pasto 3D en matas
  const P = 9000, pa = new THREE.InstancedMesh(new THREE.ConeGeometry(.035, 1, 3), new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .85 }), P); pa.receiveShadow = true; TURT.add(pa); let m = 0;
  for (let c = 0; c < 600 && m < P; c++) { const a0 = r() * 6.28, f0 = .78 + r() * .16; if (evitar.some(([ex, ez]) => (ex - Math.cos(a0) * SB * f0) ** 2 + (ez - Math.sin(a0) * SA * f0) ** 2 < 16)) continue;
    for (let k = 0; k < 15 && m < P; k++) { const a = a0 + (r() - .5) * .03, f = f0 + (r() - .5) * .015, x = Math.cos(a) * SB * f, z = Math.sin(a) * SA * f, hg = .2 + r() * .45;
      dummy.position.set(x, SY(x, z) + hg / 2, z); dummy.rotation.set((r() - .5) * .6, r() * 6, (r() - .5) * .6); dummy.scale.set(1, hg, 1); dummy.updateMatrix(); pa.setMatrixAt(m, dummy.matrix); pa.setColorAt(m, cc.set(["#4f7a32", "#6a9a3a", "#3f6a2a", "#8aa84a", "#7a8a3a"][r() * 5 | 0])); m++ } }
  pa.count = m }

// el costado del caparazón: costuras de los escudos, chorreado de sal, flecos de algas y racimos de percebes
const T_LADO = tex(2048, 512, (g, w, h) => { const r = rng(99), gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#5a4c2e"); gr.addColorStop(.55, "#3a3220"); gr.addColorStop(1, "#1e2a1c"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  let x = 0; while (x < w) { x += 50 + r() * 40; g.strokeStyle = "#1a140c"; g.lineWidth = 5 + r() * 4; g.beginPath(); g.moveTo(x, 0); for (let y = 0; y < h; y += 30) g.lineTo(x + (r() - .5) * 10, y); g.stroke() }
  manchas(g, r, 80, w, h, "#2a4a2a", 20, 120, .15, .4);
  for (let k = 0; k < 500; k++) { const x0 = r() * w, y0 = r() * h * .5, L = 30 + r() * 200; g.strokeStyle = r() < .5 ? "rgba(230,230,215,.18)" : "rgba(10,20,10,.25)"; g.lineWidth = 1 + r() * 3; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + (r() - .5) * 6, y0 + L); g.stroke() }
  for (let k = 0; k < 900; k++) { const x0 = r() * w, y0 = h * (.45 + r() * .55); g.strokeStyle = `rgba(${40 + r() * 30 | 0},${100 + r() * 50 | 0},${40 + r() * 20 | 0},${.4 + r() * .4})`; g.lineWidth = 2 + r() * 3; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 + (r() - .5) * 20, y0 + 20, x0 + (r() - .5) * 14, y0 + 30 + r() * 50); g.stroke() }
  for (let k = 0; k < 60; k++) { g.fillStyle = "rgba(20,16,10,.3)"; g.beginPath(); g.ellipse(r() * w, h * (.3 + r() * .5), 10 + r() * 30, 6 + r() * 14, 0, 0, 7); g.fill() } });

{ const geo = new THREE.PlaneGeometry(2 * SB, 2 * SA, 200, 250); geo.rotateX(-Math.PI / 2); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setY(i, SY(p.getX(i), p.getZ(i)));
  // solo el óvalo del caparazón: las esquinas del plano quedaban como una placa cuadrada oscura vista desde arriba (pedido del dueño)
  { const ix = geo.index.array, keep = [], dentro = i => (p.getX(i) / SB) ** 2 + (p.getZ(i) / SA) ** 2 < 1; for (let k = 0; k < ix.length; k += 3) if (dentro(ix[k]) && dentro(ix[k + 1]) && dentro(ix[k + 2])) keep.push(ix[k], ix[k + 1], ix[k + 2]); geo.setIndex(keep) }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, M_CAPA); m.castShadow = m.receiveShadow = true; TURT.add(m);
  // el costado del caparazón hasta el agua, con el borde aserrado y percebes
  { const tapa = new THREE.Mesh(new THREE.RingGeometry(.985, 1.06, 96, 1), SMt(T_LADO, { roughness: .9 })); tapa.rotation.x = -Math.PI / 2; tapa.scale.set(SB, SA, 1); tapa.position.y = RIM + .02; tapa.receiveShadow = true; TURT.add(tapa) }   // el borde, entre el óvalo y el costado
  const lado = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.08, 9, 64, 1, true), SMt(T_LADO, { roughness: .9, bumpMap: T_LADO, bumpScale: 2 })); lado.scale.set(SB, 1, SA); lado.position.y = RIM - 4.4; lado.castShadow = true; TURT.add(lado);
  const bor = new THREE.InstancedMesh(new THREE.ConeGeometry(1.4, 2.4, 4), SM("#3a3220", { roughness: 1 }), 48); TURT.add(bor); for (let k = 0; k < 48; k++) { const a = k / 48 * Math.PI * 2; dummy.position.set(Math.cos(a) * SB * 1.04, RIM - .4, Math.sin(a) * SA * 1.04); dummy.rotation.set(Math.PI / 2 + .3, 0, -a + Math.PI / 2); dummy.scale.setScalar(1); dummy.updateMatrix(); dummy.lookAt(Math.cos(a) * 99, RIM - 2, Math.sin(a) * 99); dummy.updateMatrix(); bor.setMatrixAt(k, dummy.matrix) }
  const perc = new THREE.InstancedMesh(GEO_PERCEBE, M_PERCEBE, 420); TURT.add(perc); const r = rng(96); for (let k = 0; k < 420; k++) { const a = r() * Math.PI * 2, y = RIM - 1 - r() * 7; dummy.position.set(Math.cos(a) * SB * (1.02 + (RIM - y) * .008), y, Math.sin(a) * SA * (1.02 + (RIM - y) * .008)); dummy.rotation.set(0, 0, 0); dummy.lookAt(dummy.position.x * 2, y, dummy.position.z * 2); dummy.rotateX(Math.PI / 2 + (r() - .5) * .4); dummy.scale.setScalar(.8 + r() * 1.6); dummy.updateMatrix(); perc.setMatrixAt(k, dummy.matrix) } }
// ---------- relieve de verdad en el piso (pedido del dueño: nada dibujado plano): empedrado 3D en las calles, piedritas y
// terrones sueltos en la tierra. Cada piedra es un canto irregular distinto (geometría deformada), con su color y su sombra.
const PISO_LIBRE = [[-9, 2, 2.6], [-12, -11.5, 2.6], [2.4, -2.5, 1.2], [-9, -2.6, 1.6], [13.2, 2, 2], [13, -6, 2.2]];
{ const r = rng(321), libre = (x, z) => PISO_LIBRE.every(([a, b, rr]) => (a - x) ** 2 + (b - z) ** 2 > rr * rr) && (x / SB) ** 2 + (z / SA) ** 2 < .8;
  const canto = s => { const g = new THREE.IcosahedronGeometry(1, 2), p = g.attributes.position, q = rng(s), v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const k = 1 + Math.sin(v.x * 3.1 + s) * .12 + Math.sin(v.z * 2.7 + s * 2) * .12 + (q() - .5) * .05; p.setXYZ(i, v.x * k, Math.max(-.2, v.y) * k, v.z * k) } g.computeVertexNormals(); return g };
  const piedraM = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .92, bumpMap: T_CAPA, bumpScale: 1.2 }), cc = new THREE.Color();
  const geos = [canto(1), canto(2), canto(3)], N = 2400, mallas = geos.map(g => { const m = new THREE.InstancedMesh(g, piedraM, N); m.castShadow = m.receiveShadow = true; TURT.add(m); m.count = 0; return m });
  const poner = (x, z, sx, sy, sz, col) => { const m = mallas[r() * 3 | 0]; if (m.count >= N) return; const y = SY(x, z); dummy.position.set(x, y - sy * .25, z); dummy.rotation.set((r() - .5) * .15, r() * 6.28, (r() - .5) * .15); dummy.scale.set(sx, sy, sz); dummy.updateMatrix(); m.setMatrixAt(m.count, dummy.matrix); m.setColorAt(m.count, cc.set(col).multiplyScalar(.8 + r() * .35)); m.count++ };
  const PIED = ["#9a9082", "#8a8274", "#a89c88", "#7e7466", "#b0a690", "#857a6a"];
  // calles: la principal (a lo largo, z) y la que la cruza (x), con el mismo vaivén que la textura
  for (let z = -27; z <= 27; z += .3) { const cx = Math.sin((z + 28) / 56 * 9) * .27; for (let x = -1.55; x <= 1.55; x += .34) { const px = cx + x + (r() - .5) * .12, pz = z + (r() - .5) * .1; if (r() < .1 || !libre(px, pz)) continue; poner(px, pz, .13 + r() * .06, .05 + r() * .04, .12 + r() * .05, PIED[r() * PIED.length | 0]) } }
  for (let x = -23; x <= 23; x += .3) { for (let z = -1.5; z <= 1.5; z += .34) { const px = x + (r() - .5) * .1, pz = z + (r() - .5) * .12; if (Math.abs(px) < 1.8 || r() < .1 || !libre(px, pz)) continue; poner(px, pz, .13 + r() * .06, .05 + r() * .04, .12 + r() * .05, PIED[r() * PIED.length | 0]) } }
  // piedritas y terrones en la tierra del pueblo
  for (let k = 0; k < 2600; k++) { const a = r() * 6.28, f = Math.sqrt(r()) * .8, x = Math.cos(a) * SB * f, z = Math.sin(a) * SA * f; if (Math.abs(x) < 1.8 || Math.abs(z) < 1.7 || !libre(x, z)) continue; const s = .03 + Math.pow(r(), 3) * .16; poner(x, z, s * (1 + r()), s * (.6 + r() * .5), s * (1 + r()), r() < .6 ? PIED[r() * PIED.length | 0] : ["#6a5238", "#5a4630", "#7a6044"][r() * 3 | 0]) }
  mallas.forEach(m => { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true }) }
// piel de la tortuga pintada escama por escama (cabeza, cuello con pliegues, aletas) y pico gastado
function escamas(g, r, w, h, n, tam, base, borde = "rgba(25,28,18,.55)") { const puestas = [];
  for (let k = 0; k < n * 6 && puestas.length < n; k++) { const x = r() * w, y = r() * h, s = tam(x, y) * (.7 + r() * .6); if (puestas.some(([px, py, ps]) => (px - x) ** 2 + (py - y) ** 2 < ((ps + s) * .82) ** 2)) continue; puestas.push([x, y, s]) }
  puestas.forEach(([x, y, s]) => { const nv = 5 + (r() * 4 | 0), pts = Array.from({ length: nv }, (_, i) => { const a = i / nv * 6.28 + r() * .4; return [x + Math.cos(a) * s * (.75 + r() * .3), y + Math.sin(a) * s * (.75 + r() * .3)] });
    aMano(g, pts, r, s * .3); const gr = g.createRadialGradient(x - s * .3, y - s * .3, s * .1, x, y, s * 1.1); gr.addColorStop(0, rgbj(base, r, 30)); gr.addColorStop(1, rgbj("#4a4a34", r, 20)); g.fillStyle = gr; g.fill(); g.strokeStyle = borde; g.lineWidth = Math.max(1.5, s * .12); g.stroke() });
  return puestas }
const T_CAB = tex(2048, 1024, (g, w, h) => { const r = rng(97); g.fillStyle = "#3e4030"; g.fillRect(0, 0, w, h);
  escamas(g, r, w, h, 900, (x, y) => 14 + 34 * Math.sin(Math.PI * y / h) ** 2 * (y < h * .5 ? 1.3 : .6), "#8a8a68");
  for (let k = 0; k < 7; k++) { const y0 = h * (.35 + r() * .3), x0 = r() * w; g.strokeStyle = `rgba(220,200,120,${.3 + r() * .25})`; g.lineWidth = 8 + r() * 14; g.lineCap = "round"; g.beginPath(); g.moveTo(x0, y0); g.bezierCurveTo(x0 + 80, y0 + (r() - .5) * 60, x0 + 160, y0 + (r() - .5) * 60, x0 + 240 + r() * 160, y0 + (r() - .5) * 80); g.stroke() }
  manchas(g, r, 60, w, h, "#2a2a1c", 30, 140, .1, .3); manchas(g, r, 40, w, h, "#d8d0a8", 30, 120, .05, .15);
  for (let k = 0; k < 400; k++) { const x = r() * w, y = r() * h; g.strokeStyle = "rgba(25,25,15,.35)"; g.lineWidth = 1 + r() * 1.5; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 10, y + (r() - .5) * 10, x + 20 + r() * 30, y + (r() - .5) * 8); g.stroke() } });
const PLIEGUES = (() => { const r = rng(171), a = []; let y = .04; while (y < .96) { a.push(y); y += .05 + r() * .09 } return a })();
const T_CUELLO = tex(2048, 1024, (g, w, h) => { const r = rng(98); g.fillStyle = "#4a4a36"; g.fillRect(0, 0, w, h);
  escamas(g, r, w, h, 1400, () => 9 + r() * 10, "#8e8c6c");
  PLIEGUES.forEach(py => { const y0 = py * h, amp = 6 + r() * 14, f = 1 + (r() * 3 | 0), ph = r() * 6; for (const [dy, col, lw] of [[0, "rgba(20,20,12,.7)", 7 + r() * 5], [9, "rgba(225,215,170,.25)", 4], [-8, "rgba(20,20,12,.25)", 10]]) { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); for (let x = 0; x <= w; x += 16) { const y = y0 + dy + Math.sin(x / w * 6.283 * f + ph) * amp + (r() - .5) * 3; x ? g.lineTo(x, y) : g.moveTo(x, y) } g.stroke() } });
  for (let k = 0; k < 6; k++) { const x0 = r() * w; g.strokeStyle = `rgba(215,195,110,${.25 + r() * .2})`; g.lineWidth = 10 + r() * 16; g.beginPath(); g.moveTo(x0, 0); for (let y = 0; y <= h; y += 40) g.lineTo(x0 + Math.sin(y * .01 + k) * 30 + (r() - .5) * 8, y); g.stroke() }
  manchas(g, r, 50, w, h, "#24241a", 30, 140, .1, .3) });
const T_ALETA = tex(2048, 1024, (g, w, h) => { const r = rng(197); g.fillStyle = "#3e4030"; g.fillRect(0, 0, w, h); escamas(g, r, w, h, 700, (x) => 10 + 40 * Math.abs(Math.sin(x / w * 6.283)), "#8a8a68"); manchas(g, r, 60, w, h, "#2a2a1c", 30, 160, .1, .3);
  for (let k = 0; k < 40; k++) { g.fillStyle = "rgba(220,215,200,.5)"; g.beginPath(); g.arc(r() * w, r() * h, 3 + r() * 8, 0, 7); g.fill() } });
const T_PICO = tex(1024, 512, (g, w, h) => { const r = rng(198), gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#5a5642"); gr.addColorStop(.5, "#3a382a"); gr.addColorStop(1, "#24231a"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (let k = 0; k < 500; k++) { const x = r() * w, y = r() * h, L = 10 + r() * 50; g.strokeStyle = r() < .5 ? "rgba(255,245,210,.12)" : "rgba(0,0,0,.25)"; g.lineWidth = 1 + r() * 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + L, y + (r() - .5) * 8); g.stroke() } manchas(g, r, 30, w, h, "#c8c0a0", 20, 90, .05, .15) });
const T_PARPADO = tex(1024, 512, (g, w, h) => { const r = rng(200); g.fillStyle = "#5e5248"; g.fillRect(0, 0, w, h); manchas(g, r, 40, w, h, "#3a3a28", 20, 100, .15, .35);
  for (let k = 0; k < 26; k++) { const y0 = r() * h; g.strokeStyle = "rgba(25,25,15,.55)"; g.lineWidth = 2 + r() * 3; g.beginPath(); for (let x = 0; x <= w; x += 20) { const y = y0 + Math.sin(x * .02 + k) * 6 + (r() - .5) * 3; x ? g.lineTo(x, y) : g.moveTo(x, y) } g.stroke(); g.strokeStyle = "rgba(220,210,170,.2)"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, y0 + 5); g.lineTo(w, y0 + 5 + (r() - .5) * 8); g.stroke() } });
// el ojo: globo oscuro y húmedo con venitas, iris dorado con fibras radiales, pecas, anillo oscuro y pupila redonda
const T_IRIS = tex(2048, 1024, (g, w, h) => { const r = rng(199), cx = w * .25, cy = h * .5, R = 310;
  g.fillStyle = "#2a1e14"; g.fillRect(0, 0, w, h); manchas(g, r, 30, w, h, "#4a3022", 40, 200, .2, .5);
  for (let k = 0; k < 40; k++) { let x = cx + (r() - .5) * 900, y = cy + (r() - .5) * 700; g.strokeStyle = "rgba(140,40,30,.4)"; g.lineWidth = 1 + r() * 2; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 8; s++) { x += (r() - .5) * 40; y += (r() - .5) * 40; g.lineTo(x, y) } g.stroke() }
  const gr = g.createRadialGradient(cx, cy, 20, cx, cy, R); gr.addColorStop(0, "#1a0c04"); gr.addColorStop(.3, "#5a3010"); gr.addColorStop(.6, "#8a5a1e"); gr.addColorStop(.85, "#6a4214"); gr.addColorStop(1, "#1e1208"); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
  for (let k = 0; k < 700; k++) { const a = r() * 6.283, r0 = R * (.22 + r() * .2), r1 = R * (.6 + r() * .38); g.strokeStyle = r() < .5 ? `rgba(255,${200 + r() * 55 | 0},${110 + r() * 60 | 0},${.15 + r() * .3})` : `rgba(80,${30 + r() * 30 | 0},5,${.15 + r() * .3})`; g.lineWidth = 1 + r() * 3; g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); g.quadraticCurveTo(cx + Math.cos(a + .05) * (r0 + r1) / 2, cy + Math.sin(a + .05) * (r0 + r1) / 2, cx + Math.cos(a + (r() - .5) * .1) * r1, cy + Math.sin(a) * r1); g.stroke() }
  for (let k = 0; k < 30; k++) { const a = r() * 6.283, rr = R * (.45 + r() * .4); g.fillStyle = "rgba(60,25,5,.4)"; g.beginPath(); g.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 4 + r() * 12, 0, 7); g.fill() }
  g.strokeStyle = "rgba(20,10,4,.85)"; g.lineWidth = 26; g.beginPath(); g.arc(cx, cy, R - 10, 0, 7); g.stroke();
  g.fillStyle = "#050302"; g.beginPath(); g.arc(cx, cy, R * .3, 0, 7); g.fill() });
const T_PIEL = T_CAB;
const M_PIEL = SMt(T_CAB, { roughness: .7, bumpMap: T_CAB, bumpScale: 3 }), M_CUELLO = SMt(T_CUELLO, { roughness: .72, bumpMap: T_CUELLO, bumpScale: 3.5 }), M_ALETA = SMt(T_ALETA, { roughness: .85, bumpMap: T_ALETA, bumpScale: 2, emissive: "#2a2a1e", emissiveIntensity: .6 });
const M_PICO = SMt(T_PICO, { roughness: .45, bumpMap: T_PICO, bumpScale: 1 }), M_PARPADO = SMt(T_PARPADO, { roughness: .7, bumpMap: T_PARPADO, bumpScale: 2.5, side: THREE.DoubleSide });
// el cuello con pliegues de verdad (la geometría se arruga donde la textura tiene los pliegues)
const GEO_CUELLO = (() => { const geo = new THREE.CylinderGeometry(4.6, 6, 14, 192, 192, true), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), v = (y + 7) / 14, a = Math.atan2(z, x);
    let k = 1 + Math.sin(a * 3 + v * 5) * .02; PLIEGUES.forEach(py => { k -= .055 * Math.exp(-(((v - (1 - py)) / .018) ** 2)) * (1 + .4 * Math.sin(a * 2 + py * 20)) }); k += .02 * Math.sin(v * 40 + a * 1.5);
    p.setX(i, x * k); p.setZ(i, z * k) } geo.computeVertexNormals(); return geo })();
const OJOS = [];
function ojoTortuga(s, pos, nrm) { const G = new THREE.Group(); CABEZA.add(G); G.position.copy(pos); G.scale.setScalar(.85); G.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), nrm);
  G.add(new THREE.Mesh(new THREE.SphereGeometry(1.9, 64, 40), new THREE.MeshStandardMaterial({ map: T_IRIS, roughness: .25 })));
  G.add(new THREE.Mesh(new THREE.SphereGeometry(1.97, 48, 32), new THREE.MeshPhysicalMaterial({ color: "#ffffff", transparent: true, opacity: .14, roughness: .02, clearcoat: 1, clearcoatRoughness: 0, depthWrite: false })));
  for (const [dx, dy, rr] of [[-.55, .75, .36], [.4, -.25, .13], [-.15, .95, .1]]) { const b = new THREE.Mesh(new THREE.SphereGeometry(rr, 12, 8), new THREE.MeshBasicMaterial({ color: "#fffdf5" })); b.position.set(dx * s, dy, 1.72); G.add(b) }
  const sup = new THREE.Mesh(new THREE.SphereGeometry(2.18, 48, 24, 0, Math.PI * 2, 0, Math.PI * .3), M_PARPADO); sup.rotation.x = .22; sup.castShadow = true; G.add(sup);
  const inf = new THREE.Mesh(new THREE.SphereGeometry(2.12, 48, 24, 0, Math.PI * 2, Math.PI * .74, Math.PI * .26), M_PARPADO); inf.rotation.x = -.2; G.add(inf);
  
  // borde del párpado: labio húmedo y oscuro que abraza el globo, con un brillo fino (el ojo «se lee» desde lejos)
  const labio = new THREE.MeshPhysicalMaterial({ color: "#4a3e34", roughness: .45, clearcoat: .6, clearcoatRoughness: .3 });
  { const a = new THREE.Mesh(new THREE.TorusGeometry(2.18 * Math.sin(Math.PI * .3), .08, 10, 72), labio); a.position.y = 2.18 * Math.cos(Math.PI * .3); a.rotation.x = Math.PI / 2; sup.add(a);
    const b = new THREE.Mesh(new THREE.TorusGeometry(2.12 * Math.sin(Math.PI * .74), .07, 10, 72), labio); b.position.y = 2.12 * Math.cos(Math.PI * .74); b.rotation.x = Math.PI / 2; inf.add(b) }
  // lagrimal y humedad en el ángulo de adelante
  { const l = new THREE.Mesh(new THREE.SphereGeometry(.28, 16, 12), new THREE.MeshPhysicalMaterial({ color: "#6a3a30", roughness: .2, clearcoat: 1 })); l.position.set(-1.55 * s, -.2, 1.0); G.add(l) }
  G.userData.sup = sup; OJOS.push(G);
  return G }
// ---------- cabeza ultradetallada (pedido del dueño, con una foto de tortuga gigante de referencia): hocico chato con narinas
// hundidas, boca de cuerno con labio grueso, ojos hundidos con párpados pesados, piel de cuero rajada en miles de placas,
// costras de barro seco, arrugas y papada. Relieve de verdad: la geometría se deforma y además lleva un mapa de desplazamiento pintado.
function pintarDoble(w, h, fn) { const a = mk(w, h), b = mk(w, h); fn(a.getContext("2d"), b.getContext("2d"), w, h); const ta = new THREE.CanvasTexture(a), tb = new THREE.CanvasTexture(b); ta.colorSpace = THREE.SRGBColorSpace; ta.anisotropy = tb.anisotropy = 8; return [ta, tb] }
const fijo = (r, pts, amp) => pts.map(([x, y], i) => { const [x2, y2] = pts[(i + 1) % pts.length]; return [x, y, (x + x2) / 2 + (r() - .5) * amp, (y + y2) / 2 + (r() - .5) * amp, x2, y2] });
const trazo = (g, segs) => { g.beginPath(); segs.forEach(([x, y, cx, cy, x2, y2], i) => { if (!i) g.moveTo(x, y); g.quadraticCurveTo(cx, cy, x2, y2) }); g.closePath() };
// placas de cuero rajado (en los dos lienzos a la vez: color y relieve), tiradas al azar sin encimarse, con grilla para que sea rápido
function placas(c, z, r, w, h, n, tam, estira, colores, luz = "#a09484", relieve = 70) { const celdas = [], G = 40, grid = new Map(), K = (i, j) => i + "," + j;
  for (let k = 0; k < n * 12 && celdas.length < n; k++) { const x = r() * w, y = r() * h, s = tam(x, y) * (.75 + r() * .5), gi = x / G | 0, gj = y / G | 0; let ok = true;
    for (let i = -3; i <= 3 && ok; i++) for (let j = -3; j <= 3 && ok; j++) { const b = grid.get(K(gi + i, gj + j)); if (b) for (const [px, py, ps] of b) if ((px - x) ** 2 + (py - y) ** 2 < ((ps + s) * .78) ** 2) { ok = false; break } }
    if (!ok) continue; const it = [x, y, s]; celdas.push(it); if (!grid.has(K(gi, gj))) grid.set(K(gi, gj), []); grid.get(K(gi, gj)).push(it) }
  celdas.forEach(([x, y, s]) => { const nv = 5 + (r() * 4 | 0), e = estira(x, y), pts = Array.from({ length: nv }, (_, i) => { const a = i / nv * 6.28 + r() * .5; return [x + Math.cos(a) * s * e * (.72 + r() * .35), y + Math.sin(a) * s * (.72 + r() * .35)] }), segs = fijo(r, pts, s * .35);
    trazo(c, segs); const g1 = c.createRadialGradient(x - s * .3, y - s * .3, 1, x, y, s * 1.2); g1.addColorStop(0, rgbj(luz, r, 18)); g1.addColorStop(1, rgbj(colores[r() * colores.length | 0], r, 16)); c.fillStyle = g1; c.fill();
    trazo(z, segs); const hv = 150 + r() * 80 | 0, g2 = z.createRadialGradient(x, y, 1, x, y, s * 1.1); g2.addColorStop(0, `rgb(${hv},${hv},${hv})`); g2.addColorStop(1, `rgb(${hv - relieve},${hv - relieve},${hv - relieve})`); z.fillStyle = g2; z.fill() }) }
const RXc = 7.6, RYc = 6.2, RZc = 13, OJO_D = s => new THREE.Vector3(s * .72, .3, .62).normalize(), NAR_D = s => new THREE.Vector3(s * .11, .24, .96).normalize(), gss = (d, s) => Math.exp(-(d / s) * (d / s));
function formaCab(v) { let k = 1;
  for (const s of [-1, 1]) { k -= .17 * gss(v.distanceTo(OJO_D(s)), .15); k += .08 * gss(v.distanceTo(OJO_D(s).clone().add(new THREE.Vector3(0, .2, -.06)).normalize()), .13); k -= .06 * gss(v.distanceTo(NAR_D(s)), .035) }
  const fr = THREE.MathUtils.smoothstep(v.z, .15, .55), dy = v.y + .16 + (1 - v.z) * .25;
  k -= .075 * gss(dy, .035) * fr; k += .04 * gss(dy - .075, .05) * fr + .035 * gss(dy + .085, .06) * fr;
  if (v.y < -.3) k += .035 * Math.sin(v.z * 30 + v.x * 6) * THREE.MathUtils.smoothstep(-v.y, .3, .8);
  let x = v.x * k, y = v.y * k, z = v.z * k; if (z > .62) z = .62 + (z - .62) * .35; const af = 1 - .34 * Math.max(0, z); if (y > .55) y = .55 + (y - .55) * .5;
  return new THREE.Vector3(x * RXc * af, y * RYc * af, z * RZc) }
const [T_CABC, T_CABH] = pintarDoble(4096, 2048, (c, z, w, h) => { const r = rng(301), Y = new THREE.Vector3(0, 1, 0);
  const uvp = d => { const o = d.clone().normalize().applyAxisAngle(Y, Math.PI / 2); let ph = Math.atan2(o.z, -o.x); if (ph < 0) ph += Math.PI * 2; return [ph / (Math.PI * 2) * w, Math.acos(Math.max(-1, Math.min(1, o.y))) / Math.PI * h] };
  c.fillStyle = "#3a3129"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
  placas(c, z, r, w, h, 4500, (x, y) => { const v = y / h; return v < .3 ? 50 + 40 * (1 - v / .3) : v < .56 ? 26 + 20 * r() : 12 + 10 * r() }, (x, y) => y / h > .58 ? 2 : 1, ["#4a4038", "#5c5044", "#3e352e", "#66594c", "#504539", "#45403a"], "#76685a", 62);
  // costras de barro seco (claras, un poco más altas), sobre todo arriba y en el hocico
  for (let k = 0; k < 220; k++) { const x = r() * w, y = Math.pow(r(), 1.5) * h * .62, rad = 30 + r() * 140, g1 = c.createRadialGradient(x, y, 0, x, y, rad); g1.addColorStop(0, `rgba(138,126,110,${.12 + r() * .16})`); g1.addColorStop(1, "rgba(138,126,110,0)"); c.fillStyle = g1; c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    const g2 = z.createRadialGradient(x, y, 0, x, y, rad); g2.addColorStop(0, "rgba(255,255,255,.08)"); g2.addColorStop(1, "rgba(255,255,255,0)"); z.fillStyle = g2; z.fillRect(x - rad, y - rad, rad * 2, rad * 2) }
  // hocico: más claro y moteado, como gastado
  { const [x, y] = uvp(new THREE.Vector3(0, .12, 1)), g1 = c.createRadialGradient(x, y, 0, x, y, 260); g1.addColorStop(0, "rgba(120,110,98,.35)"); g1.addColorStop(1, "rgba(120,110,98,0)"); c.fillStyle = g1; c.fillRect(x - 260, y - 260, 520, 520) }
  // ojos: piel oscura y húmeda alrededor, con arrugas concéntricas
  for (const s of [-1, 1]) { const [x, y] = uvp(OJO_D(s)); const g1 = c.createRadialGradient(x, y, 0, x, y, 200); g1.addColorStop(0, "rgba(14,10,8,.85)"); g1.addColorStop(.5, "rgba(30,22,18,.45)"); g1.addColorStop(1, "rgba(30,22,18,0)"); c.fillStyle = g1; c.fillRect(x - 200, y - 200, 400, 400);
    for (let q = 70; q < 300; q += 14 + r() * 16) { const pts = Array.from({ length: 14 }, (_, i) => { const a = i / 14 * 6.28; return [x + Math.cos(a) * q * 1.35 * (.9 + r() * .2), y + Math.sin(a) * q * (.9 + r() * .2)] }), segs = fijo(r, pts, 14);
      trazo(c, segs); c.strokeStyle = `rgba(16,12,9,${.5 - q / 900})`; c.lineWidth = 3 + r() * 4; c.stroke(); trazo(z, segs); z.strokeStyle = "rgba(10,10,10,.7)"; z.lineWidth = 6 + r() * 4; z.stroke() } }
  // narinas: agujeros negros profundos
  for (const s of [-1, 1]) { const [x, y] = uvp(NAR_D(s)); c.fillStyle = "#050403"; c.beginPath(); c.ellipse(x, y, 26, 34, 0, 0, 7); c.fill(); z.fillStyle = "#000"; z.beginPath(); z.ellipse(x, y, 30, 38, 0, 0, 7); z.fill();
    c.strokeStyle = "rgba(150,140,125,.5)"; c.lineWidth = 6; c.beginPath(); c.ellipse(x, y, 34, 42, 0, 0, 7); c.stroke() }
  // la boca: surco muy oscuro y dos labios de cuerno gastado con rayas verticales
  const boca = []; for (let a = -1.25; a <= 1.25; a += .01) { const vz = Math.cos(a), d = new THREE.Vector3(Math.sin(a), -.16 - (1 - vz) * .25, vz); boca.push(uvp(d)) }
  for (const [dy, col, hc, lw] of [[-26, "rgba(156,148,132,.6)", "rgba(220,220,220,.35)", 40], [30, "rgba(140,132,118,.55)", "rgba(210,210,210,.3)", 44], [0, "#0b0806", "#000", 16]]) {
    c.strokeStyle = col; z.strokeStyle = hc; c.lineWidth = lw; z.lineWidth = lw + 4; for (const g of [c, z]) { g.beginPath(); boca.forEach(([x, y], i) => i ? g.lineTo(x, y + dy + (r() - .5) * 3) : g.moveTo(x, y + dy)); g.stroke() } }
  for (let k = 0; k < 900; k++) { const [x, y] = boca[r() * boca.length | 0], side = r() < .5 ? -1 : 1; c.strokeStyle = r() < .5 ? "rgba(40,32,26,.45)" : "rgba(200,192,176,.3)"; c.lineWidth = 1 + r() * 2; c.beginPath(); c.moveTo(x + (r() - .5) * 6, y + side * 8); c.lineTo(x + (r() - .5) * 8, y + side * (20 + r() * 26)); c.stroke() }
  // pastito seco pegado en la comisura (como en la foto)
  for (const s of [-1, 1]) { const [x, y] = boca[s < 0 ? 40 : boca.length - 40]; for (let k = 0; k < 14; k++) { c.strokeStyle = `rgba(${200 + r() * 40 | 0},${180 + r() * 40 | 0},${110 + r() * 30 | 0},.8)`; c.lineWidth = 2 + r() * 2; c.beginPath(); c.moveTo(x + (r() - .5) * 30, y + (r() - .5) * 20); c.quadraticCurveTo(x + (r() - .5) * 80, y + 30 + r() * 40, x + (r() - .5) * 120, y + 40 + r() * 70); c.stroke() } }
  // papada y garganta: arrugas horizontales finas y onduladas
  for (let k = 0; k < 520; k++) { const y0 = h * (.6 + r() * .38), x0 = r() * w, L = 60 + r() * 260; for (const [g, col, lw] of [[c, "rgba(14,10,8,.6)", 2 + r() * 3], [z, "rgba(0,0,0,.6)", 5]]) { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); for (let x = 0; x <= L; x += 12) { const y = y0 + Math.sin((x0 + x) * .02 + k) * 5; x ? g.lineTo(x0 + x, y) : g.moveTo(x0, y) } g.stroke() } }
  // motas finas de tierra
  for (let k = 0; k < 6000; k++) { c.fillStyle = r() < .5 ? "rgba(150,140,125,.15)" : "rgba(20,14,10,.25)"; c.beginPath(); c.arc(r() * w, r() * h, .8 + r() * 2.4, 0, 7); c.fill() }
  for (const [y0, y1] of [[0, h * .1], [h, h * .9]]) { const gc = c.createLinearGradient(0, y0, 0, y1); gc.addColorStop(0, "rgba(60,51,43,1)"); gc.addColorStop(.6, "rgba(60,51,43,.85)"); gc.addColorStop(1, "rgba(60,51,43,0)"); c.fillStyle = gc; c.fillRect(0, Math.min(y0, y1), w, Math.abs(y1 - y0)); const gz = z.createLinearGradient(0, y0, 0, y1); gz.addColorStop(0, "rgba(150,150,150,1)"); gz.addColorStop(.6, "rgba(150,150,150,.85)"); gz.addColorStop(1, "rgba(150,150,150,0)"); z.fillStyle = gz; z.fillRect(0, Math.min(y0, y1), w, Math.abs(y1 - y0)) }
  for (let k = 0; k < 400; k++) { c.fillStyle = r() < .5 ? "rgba(90,80,68,.4)" : "rgba(30,24,20,.4)"; c.beginPath(); c.ellipse(r() * w, r() * h * .1, 4 + r() * 20, 3 + r() * 6, 0, 0, 7); c.fill() } });
const M_CAB = new THREE.MeshStandardMaterial({ map: T_CABC, displacementMap: T_CABH, displacementScale: .32, displacementBias: -.17, bumpMap: T_CABH, bumpScale: 3.4, roughness: .84 });
// cuello: el mismo cuero rajado, con pliegues hondos que dan la vuelta (coinciden con los pliegues de la geometría)
const [T_CUEC, T_CUEH] = pintarDoble(4096, 2048, (c, z, w, h) => { const r = rng(302); c.fillStyle = "#1e1813"; c.fillRect(0, 0, w, h); z.fillStyle = "#262626"; z.fillRect(0, 0, w, h);
  placas(c, z, r, w, h, 9000, () => 9 + 12 * r(), () => 1.7, ["#4e443c", "#564a40", "#5a4e44", "#4a4038", "#52473e"], "#6e6256", 80);
  PLIEGUES.forEach(py => { const y0 = py * h, amp = 10 + r() * 20, f = 1 + (r() * 3 | 0), ph = r() * 6; for (const [dy, col, hc, lw] of [[-14, "rgba(150,140,125,.35)", "rgba(255,255,255,.25)", 18], [0, "rgba(8,6,4,.9)", "#000", 14 + r() * 8]]) { c.strokeStyle = col; z.strokeStyle = hc; c.lineWidth = lw; z.lineWidth = lw + 6; for (const g of [c, z]) { g.beginPath(); for (let x = 0; x <= w; x += 16) { const y = y0 + dy + Math.sin(x / w * 6.283 * f + ph) * amp; x ? g.lineTo(x, y) : g.moveTo(x, y) } g.stroke() } } });
  for (let k = 0; k < 160; k++) { const x = r() * w, y = r() * h, rad = 40 + r() * 160, g1 = c.createRadialGradient(x, y, 0, x, y, rad); g1.addColorStop(0, `rgba(140,128,112,${.1 + r() * .15})`); g1.addColorStop(1, "rgba(140,128,112,0)"); c.fillStyle = g1; c.fillRect(x - rad, y - rad, rad * 2, rad * 2) }
  for (let k = 0; k < 5000; k++) { c.fillStyle = r() < .5 ? "rgba(200,188,168,.3)" : "rgba(20,14,10,.3)"; c.beginPath(); c.arc(r() * w, r() * h, .8 + r() * 2.4, 0, 7); c.fill() } });
const M_CUELLO2 = new THREE.MeshStandardMaterial({ map: T_CUEC, displacementMap: T_CUEH, displacementScale: .4, displacementBias: -.22, bumpMap: T_CUEH, bumpScale: 3.5, roughness: .86 });
const CABEZA = new THREE.Group(); TURT.add(CABEZA); CABEZA.position.set(0, 7.5, SA + 4);
{ const cu = new THREE.Mesh(GEO_CUELLO, M_CUELLO2); cu.position.set(0, 0, 3); cu.rotation.x = Math.PI / 2 - .35; cu.castShadow = true; CABEZA.add(cu);
  const geo = new THREE.SphereGeometry(1, 384, 256); geo.rotateY(-Math.PI / 2); const p = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).normalize(); const q = formaCab(v); p.setXYZ(i, q.x, q.y, q.z) } geo.computeVertexNormals();
  const cab = new THREE.Mesh(geo, M_CAB); cab.position.set(0, 4, 13); cab.castShadow = cab.receiveShadow = true; CABEZA.add(cab);
  for (const s of [-1, 1]) { const n = OJO_D(s), sup = formaCab(n); ojoTortuga(s, sup.add(new THREE.Vector3(0, 4, 13)).addScaledVector(n, -.35), n) }
  const r4 = rng(410), C0 = new THREE.Vector3(0, 4, 13);
  [[.2, .9, .3], [-.25, .85, .4], [.05, .95, .1], [.35, .8, .45], [-.1, .9, .25], [.15, .82, .55], [-.35, .78, .2], [.28, .86, .12]].forEach(([x, y, z2], i) => { const d = new THREE.Vector3(x, y, z2).normalize(), b = new THREE.Mesh(GEO_PERCEBE, M_PERCEBE); b.position.copy(formaCab(d).add(C0)); b.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d); b.scale.setScalar(1.6 + (i % 3) * .6); b.castShadow = true; CABEZA.add(b) });
  const alga = new THREE.MeshStandardMaterial({ color: "#3a6a2a", roughness: .6, side: THREE.DoubleSide });
  for (let k = 0; k < 9; k++) { const a = -.9 + k / 8 * 1.8, d = new THREE.Vector3(Math.sin(a) * .8, -.55, .45 + Math.cos(a) * .3).normalize(), L = 1.2 + r4() * 1.6, g = new THREE.PlaneGeometry(.35, L, 1, 6); g.translate(0, -L / 2, 0); const pp = g.attributes.position; for (let i = 0; i < pp.count; i++) { pp.setZ(i, Math.sin(pp.getY(i) * 3.1 + k) * .32 + Math.sin(pp.getY(i) * 7 + k * 2) * .06); pp.setX(i, pp.getX(i) * (.6 + .5 * Math.abs(Math.sin(pp.getY(i) * 2 + k)))) }; const m = new THREE.Mesh(g, alga); m.position.copy(formaCab(d).add(C0)); m.rotation.y = a; CABEZA.add(m) } }

const CABL = new THREE.Object3D(); CABEZA.add(CABL); CABL.position.set(0, 11, 12);   // arriba de la cabeza (donde se para Garrow)
const ALETAS = [[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sz]) => { const piv = new THREE.Group(); TURT.add(piv); piv.position.set(sx * SB * .78, 1.1, sz * SA * .55); const gA = new THREE.SphereGeometry(1, 40, 20).rotateZ(Math.PI / 2), pA = gA.attributes.position; for (let i = 0; i < pA.count; i++) { const u = (pA.getX(i) * sx + 1) / 2; pA.setZ(i, pA.getZ(i) * (1.15 - .75 * u * u) + u * u * .35 * sz); pA.setY(i, pA.getY(i) * (1.1 - .6 * u)) } gA.computeVertexNormals(); const f = part(gA, M_ALETA, sx * 9, -1.6, 0, piv, 0); f.scale.set(sz > 0 ? 14 : 9, 1.6, sz > 0 ? 6 : 5); f.rotation.y = sx * sz * .35; return { piv, sx, sz } });
const COLA = new THREE.Group(); TURT.add(COLA); COLA.position.set(0, 2.5, -SA + 1); { const c = part(new THREE.ConeGeometry(3, 10, 16), M_PIEL, 0, 0, -4, COLA, 0); c.rotation.x = -Math.PI / 2 - .2 }
// aliento: nube tibia que sale de las narinas · espuma alrededor del cuerpo
const NUBE = Array.from({ length: 18 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#f2f2ee", transparent: true, opacity: 0, depthWrite: false })); scene.add(s); return s });
function aliento(t, k) { CABEZA.updateMatrixWorld(true); const o = new THREE.Vector3(0, 5.5, 22.2).applyMatrix4(CABEZA.matrixWorld); NUBE.forEach((s, i) => { const q = ((t * .35 + i / 18) % 1); s.visible = k > 0; s.position.set(o.x + Math.sin(i * 2.3) * q * 8, o.y + q * 9, o.z + q * 14); s.scale.setScalar(4 + q * 16); s.material.opacity = (1 - q) * .17 * k }) }
const ESPUMA = Array.from({ length: 30 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#ffffff", transparent: true, opacity: .5, depthWrite: false })); TURT.add(s); const a = i / 30 * Math.PI * 2; s.position.set(Math.cos(a) * SB * 1.12, .3, Math.sin(a) * SA * 1.12); s.scale.set(7, 1.6, 1); return s });
function tortuga(t, { paso = 1, bajo = 0, giro = 0, incl = 0, flinch = 0 } = {}) {
  // camina como una tortuga marina (pedido del dueño): las aletas van en diagonal (adelante izquierda con atrás derecha),
  // cada una barre hacia atrás apoyada y vuelve levantada; el cuerpo se balancea hacia el lado que apoya, sube con cada
  // empujón y cabecea apenas; el cuello se estira y se encoge con el paso, la cabeza mira alrededor, parpadea, y la cola acompaña.
  const ph = t * .9 * paso;
  ALETAS.forEach(({ piv, sx, sz }) => { const f = ph + (sx * sz > 0 ? 0 : Math.PI), s = Math.sin(f), c = Math.cos(f), arriba = Math.max(0, c);
    piv.rotation.set(sz * arriba * .12 * paso, sx * s * .5 * paso, sx * (.12 + arriba * .38 * paso - Math.max(0, -c) * .06 * paso)) });
  const sway = Math.sin(ph) * paso, push = Math.max(0, -Math.cos(ph * 2)) * paso;
  TURT.position.y = -bajo + push * .35 - .1 * paso + flinch * Math.sin(t * 40) * .4;
  TURT.rotation.set(incl * .6 + Math.sin(ph * 2 + 1) * .012 * paso + flinch * .03 * Math.sin(t * 33), giro + sway * .018, incl + sway * .022 + flinch * .04 * Math.sin(t * 29));
  CABEZA.position.set(0, 7.5 + Math.sin(ph * 2 + .8) * .35 * paso, SA + 4 + push * .9 - flinch * 3.5);
  CABEZA.rotation.set(Math.sin(t * .4) * .05 + Math.sin(ph * 2) * .035 * paso - flinch * .2, Math.sin(t * .23) * .16 + Math.sin(t * .61) * .04, -sway * .05);
  COLA.rotation.set(.05 * Math.sin(ph * 2), Math.sin(ph) * .25 * paso, 0);
  OJOS.forEach(G => { const b = (t % 5.3) / 5.3, cierra = b > .96 ? Math.sin((b - .96) / .04 * Math.PI) : 0; G.userData.sup.rotation.x = .22 + Math.max(cierra * 1.05, Math.min(1, flinch * 2) * 1.15) });
  T_AGUA.offset.set(t * .004 * paso, t * .012 * paso); AGUA_T.value = t * 6; ESPUMA.forEach(s => s.visible = false);
}

// ---------- Shellbrook arriba del caparazón (todo hijo de TURT)
const enConcha = (o, x, z, ry = 0, dy = 0) => { if (o.parent !== TURT) TURT.add(o); o.position.set(x, SY(x, z) + dy, z); o.rotation.y = ry; return o };
const casa = (x, z, ry, op = {}) => { const H = house(0, 0, 1, op); H.g.removeFromParent(); enConcha(H.g, x, z, ry, -.3); part(new THREE.BoxGeometry((op.w ?? 7) + .4, 9, 6.6), M_STONE, 0, -4.4, 0, H.g, 0); /* zócalo hondo: la casa nunca queda flotando en la pendiente */ H.lx = x; H.lz = z; return H };
// calle principal de atrás (−z) hacia la cabeza (+z), casas a los dos lados mirando a la calle
const CASAS = [];
[[-6.8, -18, 1], [6.8, -18, -1], [-6.8, -9, 1], [6.8, -9, -1], [-6.8, 9, 1], [6.8, 9, -1], [-6.8, 18, 1], [-15, -2, 0], [15, -14, 0], [-16, 14, 0], [16, 16, 0]].forEach(([x, z, s], i) => CASAS.push(casa(x, z, s ? s * Math.PI / 2 : (x < 0 ? Math.PI / 2 : -Math.PI / 2), { v: i, h: 4.6 + (i % 3) * .5, w: 6.4 })));
const NUESTRA = casa(6.8, 18, -Math.PI / 2, { v: 12, h: 5, w: 6.4 });
const PANADERIA = casa(18.5, 3, -Math.PI / 2, { v: 13, h: 4.6, w: 6.2 });          // la de Pim (se cae al mar en el recuerdo)
const ESCUELA = casa(-18, -14, Math.PI / 2, { v: 14, h: 5.4, w: 7 });
// reglas amarillas colgadas junto a cada puerta
const T_REGLA = tex(64, 512, (g, w, h) => { g.fillStyle = "#f2c41e"; g.fillRect(0, 0, w, h); g.fillStyle = "#2a2416"; for (let y = 8; y < h; y += 16) g.fillRect(0, y, y % 64 === 8 ? 30 : 16, 3) });
const M_REGLA = SMt(T_REGLA, { roughness: .5 });

// carteles de oficio
const cartelito = (H, txt, bg = "#3a2618") => { const m = part(new THREE.PlaneGeometry(2.4, .6), SMt(tex(512, 128, (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = "#d9c08a"; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12); g.font = "800 72px 'Special Elite'"; g.fillStyle = "#f2e6c4"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, w / 2, h / 2 + 4) })), 0, 3.6, 3.08, H.walls[0], 0); return m };
cartelito(PANADERIA, "BAKERY"); cartelito(ESCUELA, "SCHOOL", "#2a3a5a"); cartelito(CASAS[3], "FURS", "#5a4a1a");
// la iglesia arriba de todo, con el campanario de Garrow
const IGLESIA = new THREE.Group(); enConcha(IGLESIA, 0, -14, Math.PI, -.4);
{ part(new THREE.BoxGeometry(7.6, 8, 11.6), M_STONE, 0, -3.8, 0, IGLESIA, 0); part(new THREE.BoxGeometry(3.8, 8, 3.8), M_STONE, 0, -3.8, 6, IGLESIA, 0); part(new THREE.BoxGeometry(7, 7, 11), M_STONE, 0, 3.5, 0, IGLESIA, 0); const half = 4.0, rh = 3.4, sl = Math.hypot(half, rh), a = Math.atan2(rh, half); for (const s of [-1, 1]) { const m = part(new THREE.BoxGeometry(sl, .25, 11.6), M_SHING, s * half / 2, 7 + rh / 2, 0, IGLESIA, 0); m.rotation.z = -s * a }
  const tw = new THREE.Group(); tw.position.set(0, 0, 6); IGLESIA.add(tw); part(new THREE.BoxGeometry(3.2, 10, 3.2), M_STONE, 0, 5, 0, tw, 0); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) part(new THREE.BoxGeometry(.35, 3, .35), M_BEAM, a * 1.4, 11.5, b * 1.4, tw, 0); part(new THREE.BoxGeometry(3.6, .3, 3.6), M_BEAM, 0, 13.1, 0, tw, 0); part(new THREE.ConeGeometry(2.4, 6, 4), M_SHING, 0, 16, 0, tw, 0).rotation.y = Math.PI / 4;
  part(new THREE.BoxGeometry(1.6, 2.8, .2), M_PLANK, 0, 1.4, 1.62, tw, 0); 
  const campana = part(new THREE.CylinderGeometry(.5, .9, 1.3, 18, 1, true), SM("#b8893a", { metalness: .8, roughness: .3, side: THREE.DoubleSide }), 0, 11.5, 0, tw, 0); IGLESIA.userData.campana = campana; IGLESIA.userData.torre = tw;
  for (const s of [-1, 1]) part(new THREE.BoxGeometry(.6, 1.2, .2), M_PLANK, s * 2.3, 4.2, 5.52, IGLESIA, 0) }
const ESCALONES = []; for (let k = 0; k < 3; k++) ESCALONES.push(part(new THREE.BoxGeometry(3.4 - k * .4, .3, 1), M_STONE, 0, .15 + k * .3, 8.1 - k * .5, IGLESIA, 0));
// la plaza con el cartel de la regla
const CARTEL = new THREE.Group(); enConcha(CARTEL, 3.2, 3.5, -.4); CARTEL.visible = false;
{ for (const s of [-1, 1]) part(new THREE.BoxGeometry(.2, 3.2, .2), M_BEAM, s * 1.4, 1.6, 0, CARTEL, 0);
  part(new THREE.PlaneGeometry(3.2, 1.6), SMt(tex(640, 320, (g, w, h) => { g.fillStyle = "#e8dcc0"; g.fillRect(0, 0, w, h); g.strokeStyle = "#3a2618"; g.lineWidth = 16; g.strokeRect(8, 8, w - 16, h - 16); g.font = "800 92px 'Special Elite'"; g.fillStyle = "#7a1e16"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("ONE SHOVEL.", w / 2, 115); g.fillText("NO MORE.", w / 2, 220) })), 0, 2.7, .12, CARTEL, 0) }
// huertas de una pala de tierra (zanahorias) y ropa tendida del lado de la cabeza
// zanahorias de verdad (pedido del dueño): raíz que se afina con anillos y raicitas, hombro verde asomando de la tierra,
// penacho de hojas plumosas con tallos y foliolos; surcos con terrones y una o dos ya cosechadas sobre la tierra
const T_ZANA = (() => { const [c, z] = pintarDoble(128, 512, (c, z, w, h) => { const r = rng(55), gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#6a8a2a"); gr.addColorStop(.06, "#d8782a"); gr.addColorStop(.5, "#ee8a2e"); gr.addColorStop(1, "#d06a22"); c.fillStyle = gr; c.fillRect(0, 0, w, h); z.fillStyle = "#909090"; z.fillRect(0, 0, w, h);
    for (let y = 20; y < h; y += 8 + r() * 14) { const x0 = r() * w * .5, L = w * (.3 + r() * .7); c.strokeStyle = "rgba(120,50,10,.5)"; c.lineWidth = 1.5 + r() * 2; c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + L, y + (r() - .5) * 3); c.stroke(); z.strokeStyle = "rgba(0,0,0,.7)"; z.lineWidth = 3; z.beginPath(); z.moveTo(x0, y); z.lineTo(x0 + L, y); z.stroke() }
    for (let k = 0; k < 60; k++) { c.fillStyle = "rgba(90,60,35,.35)"; c.beginPath(); c.arc(r() * w, r() * h, 1 + r() * 3, 0, 7); c.fill() } }); return [c, z] })();
const GEO_ZANA = new THREE.LatheGeometry([[0, -.8], [.01, -.72], [.026, -.56], [.044, -.36], [.06, -.16], [.072, 0], [.078, .12], [.07, .18], [.03, .2], [0, .2]].map(([x, y]) => new THREE.Vector2(x, y)), 16);
const M_ZANA = new THREE.MeshStandardMaterial({ map: T_ZANA[0], bumpMap: T_ZANA[1], bumpScale: 2, roughness: .6 }), M_HOJA = new THREE.MeshStandardMaterial({ color: "#4f8a32", roughness: .7, side: THREE.DoubleSide }), M_TALLO = SM("#5f9a3a");
const GEO_FOL = new THREE.PlaneGeometry(.06, .035); GEO_FOL.translate(.03, 0, 0);
function zanahoria(g, x, y, z, ry = 0, acostada = false, r = Math.random) { const c = new THREE.Group(); c.position.set(x, y, z); c.rotation.y = ry; if (acostada) c.rotation.z = Math.PI / 2 - .15; g.add(c);
  const raiz = new THREE.Mesh(GEO_ZANA, M_ZANA); raiz.castShadow = true; c.add(raiz);
  for (let k = 0; k < 4; k++) { const pe = part(new THREE.CylinderGeometry(.002, .004, .1, 4), SM("#c8a070"), Math.cos(k * 1.7) * .05, -.2 - k * .08, Math.sin(k * 1.7) * .05, c, 0); pe.rotation.z = (k % 2 ? 1 : -1) * 1.1 }
  const nf = 5 + (r() * 3 | 0); for (let k = 0; k < nf; k++) { const a = k / nf * 6.28 + r() * .4, L = .32 + r() * .22, inc = .25 + r() * .35, f = new THREE.Group(); f.position.y = .18; f.rotation.set(0, a, inc); c.add(f);
    part(new THREE.CylinderGeometry(.006, .01, L, 5), M_TALLO, 0, L / 2, 0, f, 0);
    for (let q = 1; q <= 5; q++) for (const s of [-1, 1]) { const fo = new THREE.Mesh(GEO_FOL, M_HOJA); fo.position.set(0, L * (.35 + q * .12), 0); fo.rotation.set((r() - .5) * .4, s > 0 ? 0 : Math.PI, .5 + q * .08); fo.scale.setScalar(1.2 - q * .12); f.add(fo) } } return c }
const HUERTAS = [[-9, 2], [-12, -11.5]].map(([x, z], hi) => { const g = new THREE.Group(), r = rng(500 + hi); enConcha(g, x, z, 0, -.1);
  part(new THREE.BoxGeometry(3.2, .5, 2.2), SMt(T_DIRT, { bumpMap: T_DIRT, bumpScale: 2 }), 0, .05, 0, g, 0);
  for (const zz of [-.5, .5]) { const surco = part(new THREE.CylinderGeometry(.3, .3, 2.8, 12, 1, false, 0, Math.PI), SMt(T_DIRT, { bumpMap: T_DIRT, bumpScale: 2 }), 0, .3, zz, g, 0); surco.rotation.set(0, 0, Math.PI / 2); surco.scale.set(1, 1, .55) }
  for (let k = 0; k < 40; k++) { const t = part(new THREE.IcosahedronGeometry(.04 + r() * .05, 0), SM(["#5a4630", "#6a5238", "#4a3a28"][k % 3], { roughness: 1 }), (r() - .5) * 3, .32 + r() * .06, (r() - .5) * 2, g, 0); t.rotation.set(r() * 3, r() * 3, r() * 3) }
  for (let k = 0; k < 8; k++) zanahoria(g, -1.1 + (k % 4) * .73 + (r() - .5) * .08, .56 + r() * .05, -.5 + Math.floor(k / 4) * 1, r() * 6, false, r);
  zanahoria(g, 1.75, .32, .95, .4, true, r); if (!hi) zanahoria(g, 1.85, .32, .6, -.3, true, r);
  return g });
const TENDEDERO = new THREE.Group(); enConcha(TENDEDERO, -3, 25, 0, 0);
{ for (const s of [-1, 1]) part(new THREE.BoxGeometry(.18, 3.2, .18), M_BEAM, s * 5, 1.6, 0, TENDEDERO, 0); part(new THREE.CylinderGeometry(.02, .02, 10, 4), SM("#ddd"), 0, 3, 0, TENDEDERO, 0).rotation.z = Math.PI / 2;
  TENDEDERO.userData.ropa = ["#e05a4a", "#f2e6c4", "#4a7ab8", "#f2c41e", "#ffffff"].map((c, i) => { const m = part(new THREE.PlaneGeometry(1.3, 1.6), new THREE.MeshStandardMaterial({ color: c, side: THREE.DoubleSide, roughness: .9 }), -3.6 + i * 1.8, 2.2, 0, TENDEDERO, 0); return m }) }
// el mercado de pescado en el borde de adelante a la izquierda
const MERCADO = new THREE.Group(); enConcha(MERCADO, -14, 24, .6, -.2);
{ for (let k = 0; k < 3; k++) { const g = new THREE.Group(); g.position.set(-4 + k * 4, 0, 0); MERCADO.add(g); part(new THREE.BoxGeometry(3, 1, 1.6), M_PLANK, 0, .5, 0, g, 0); for (const s of [-1, 1]) part(new THREE.BoxGeometry(.12, 2.6, .12), M_BEAM, s * 1.4, 1.3, -.7, g, 0);
    const tol = part(new THREE.BoxGeometry(3.4, .08, 2.2), SM(["#c94b4b", "#e8dcc0", "#3f6a8a"][k]), 0, 2.6, 0, g, 0); tol.rotation.x = .25; for (let j = 0; j < 4; j++) { const p = part(new THREE.SphereGeometry(.18, 10, 8), SM("#9ab0b8", { metalness: .4, roughness: .3 }), -1 + j * .65, 1.1, .2, g, 0); p.scale.set(2.6, .7, 1) } } }
// utilería suelta: barriles, cajones, sacos (instanciados sobre el caparazón)
{ const r = rng(98), bar = new THREE.InstancedMesh(new THREE.CylinderGeometry(.42, .38, 1.1, 14), M_PLANK, 26), cra = new THREE.InstancedMesh(new THREE.BoxGeometry(.9, .8, .9), M_PLANK, 26); [bar, cra].forEach(m => { m.castShadow = m.receiveShadow = true; TURT.add(m) });
  for (let k = 0; k < 26; k++) { const x = (r() < .5 ? -1 : 1) * (3.6 + r() * 1.2), z = -24 + r() * 46; dummy.position.set(x, SY(x, z) + .55, z); dummy.rotation.set(0, r() * 6, 0); dummy.scale.setScalar(1); dummy.updateMatrix(); bar.setMatrixAt(k, dummy.matrix);
    const x2 = (r() < .5 ? -1 : 1) * (9 + r() * 6), z2 = -22 + r() * 44; dummy.position.set(x2, SY(x2, z2) + .4, z2); dummy.rotation.set(0, r() * 6, 0); dummy.updateMatrix(); cra.setMatrixAt(k, dummy.matrix) } }
// el pozo de la panadería (recuerdo), el pozo del chico (final) y la tierra que saca
const HOYO = (() => { const g = new THREE.Group(); const m = part(new THREE.CircleGeometry(1, 24), SMt(tex(256, 256, (q, w, h) => { const gr = q.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, "#120a06"); gr.addColorStop(.6, "#3a2414"); gr.addColorStop(1, "#5a3a22"); q.fillStyle = gr; q.fillRect(0, 0, w, h) }), { roughness: 1 }), 0, .12, 0, g, 0); m.rotation.x = -Math.PI / 2; const borde = part(new THREE.TorusGeometry(1.05, .22, 8, 28), SMt(T_DIRT, { bumpMap: T_DIRT, bumpScale: 3 }), 0, .06, 0, g, 0); borde.rotation.x = Math.PI / 2; borde.scale.z = .4; const piel = part(new THREE.CircleGeometry(.6, 20), SMt(T_PIEL, { color: "#d8b0a0", emissive: "#6a2a1a", emissiveIntensity: .25 }), 0, .14, 0, g, 0); piel.rotation.x = -Math.PI / 2; g.userData.piel = piel;
  const mont = part(new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), SMt(T_DIRT), 1.6, 0, .4, g, 0); g.userData.mont = mont; return g })();
const PALA = new THREE.Group(); part(new THREE.CylinderGeometry(.045, .045, 2.0, 8), SM("#8a5a30"), 0, -.6, .1, PALA, 0); { const b = part(new THREE.BoxGeometry(.42, .5, .05), SM("#8a8a90", { metalness: .7, roughness: .35 }), 0, -1.8, .14, PALA, 0) } part(new THREE.BoxGeometry(.4, .07, .07), SM("#8a5a30"), 0, .42, .1, PALA, 0);
const REGLA = new THREE.Group(); part(new THREE.BoxGeometry(.12, 1.2, .03), M_REGLA, 0, -.5, .12, REGLA, 0);
const TELESC = new THREE.Group(); { const tb = part(new THREE.CylinderGeometry(.09, .13, 1.1, 12), SM("#b8893a", { metalness: .8, roughness: .3 }), 0, -.1, .3, TELESC, 0); tb.rotation.x = Math.PI / 2 }
const TAZAS = new THREE.Group(); { const mesa = part(new THREE.BoxGeometry(2, .12, 1.2), M_PLANK, 0, 1.4, 0, TAZAS, 0); for (const [x, z] of [[-.9, -.5], [.9, -.5], [-.9, .5], [.9, .5]]) part(new THREE.BoxGeometry(.1, 1.4, .1), M_BEAM, x, .7, z, TAZAS, 0);
  TAZAS.userData.tazas = [[-.5, .1], [0, -.2], [.55, .15]].map(([x, z], i) => { const c = new THREE.Group(); c.position.set(x, 1.46, z); TAZAS.add(c); part(new THREE.CylinderGeometry(.13, .1, .22, 14), SM(["#e8dcc0", "#c94b4b", "#3f6a8a"][i]), 0, .11, 0, c, 0); part(new THREE.TorusGeometry(.07, .02, 6, 12), SM(["#e8dcc0", "#c94b4b", "#3f6a8a"][i]), .14, .12, 0, c, 0); return c }) }
enConcha(TAZAS, 2.6, 13.5, -Math.PI / 2, -.1); TAZAS.visible = false;
const PECERA = new THREE.Group(); { part(new THREE.SphereGeometry(.5, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), SMt(T_DIRT), 0, 0, 0, PECERA, 0); part(new THREE.BoxGeometry(.06, .7, .06), M_BEAM, 0, .5, 0, PECERA, 0); part(new THREE.BoxGeometry(.4, .06, .06), M_BEAM, 0, .65, 0, PECERA, 0) }
enConcha(PECERA, 2.4, -2.5, 0, -.05); PECERA.visible = false;


// ---------- más detalle (pedido del dueño): faroles, cercas, macetas, leña, algas y piedras en el borde, gaviotas
{ const r = rng(120), poste = SM("#2a2420", { metalness: .5, roughness: .5 }), vid = new THREE.MeshStandardMaterial({ color: "#fff1c8", emissive: "#ffd68a", emissiveIntensity: .2, roughness: .2 });
  [[-3.2, 12], [-3.2, 7], [-3.2, -4], [3.2, -12], [9, 4.5], [-12, 4.5], [3.2, 18], [-3.2, -20]].forEach(([x, z]) => { const g = new THREE.Group(); enConcha(g, x, z); part(new THREE.CylinderGeometry(.07, .1, 3, 8), poste, 0, 1.5, 0, g, 0); part(new THREE.BoxGeometry(.36, .5, .36), vid, 0, 3.15, 0, g, 0); part(new THREE.ConeGeometry(.32, .3, 4), poste, 0, 3.55, 0, g, 0).rotation.y = Math.PI / 4 });
  const est = new THREE.InstancedMesh(new THREE.BoxGeometry(.1, .7, .06), M_PLANK, 120); est.castShadow = true; TURT.add(est); let n = 0;
  [[-9, 2], [-12, -11.5]].forEach(([cx, cz]) => { for (let k = 0; k < 22 && n < 120; k++) { const a = k / 22 * Math.PI * 2, x = cx + Math.cos(a) * 2.1, z = cz + Math.sin(a) * 1.5; dummy.position.set(x, SY(x, z) + .3, z); dummy.rotation.set(0, -a, (r() - .5) * .15); dummy.scale.setScalar(1); dummy.updateMatrix(); est.setMatrixAt(n++, dummy.matrix) } }); est.count = n;
  const mac = new THREE.InstancedMesh(new THREE.CylinderGeometry(.22, .16, .3, 10), SM("#a8553a"), 60), flo = new THREE.InstancedMesh(new THREE.SphereGeometry(.2, 8, 6), SM("#e05a7a"), 60), flo2 = new THREE.InstancedMesh(new THREE.SphereGeometry(.16, 8, 6), SM("#f2d23a"), 60), lena = new THREE.InstancedMesh(new THREE.CylinderGeometry(.09, .09, 1, 6), SM("#7a5030"), 160);
  [mac, flo, flo2, lena].forEach(m => { m.castShadow = true; TURT.add(m) });
  let nm = 0; for (let k = 0; k < 200 && nm < 60; k++) { const sx = r() < .5 ? -1 : 1, x = sx * (3.55 + r() * .15), z = -21 + r() * 42; if (Math.abs(z) < 6) continue; const y = SY(x, z);
    dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(1); dummy.position.set(x, y + .15, z); dummy.updateMatrix(); mac.setMatrixAt(nm, dummy.matrix); dummy.position.set(x, y + .4, z); dummy.updateMatrix(); flo.setMatrixAt(nm, dummy.matrix); dummy.position.set(x + .1, y + .5, z + .1); dummy.updateMatrix(); flo2.setMatrixAt(nm, dummy.matrix); nm++ }
  mac.count = flo.count = flo2.count = nm;
  for (let k = 0; k < 160; k++) { const pila = k / 20 | 0, sx = pila % 2 ? 1 : -1, z0 = -19 + pila * 5.2, x = sx * 3.6, z = z0 + (k % 5) * .2 - .4, y = SY(x, z) + .1 + ((k % 20) / 5 | 0) * .18; dummy.position.set(x, y, z); dummy.rotation.set(Math.PI / 2, 0, 0); dummy.scale.setScalar(1); dummy.updateMatrix(); lena.setMatrixAt(k, dummy.matrix) }
  const alga = new THREE.InstancedMesh(new THREE.ConeGeometry(.25, 1.6, 5), SM("#3a6a3a", { roughness: .9 }), 260), pie = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.5, 0), SM("#8a8478", { roughness: 1 }), 140); [alga, pie].forEach(m => { m.castShadow = true; TURT.add(m) });
  for (let k = 0; k < 260; k++) { const a = r() * Math.PI * 2, f = .86 + r() * .13, x = Math.cos(a) * SB * f, z = Math.sin(a) * SA * f; dummy.position.set(x, SY(x, z) + .4, z); dummy.rotation.set((r() - .5) * .6, r() * 6, (r() - .5) * .6); dummy.scale.set(1, .6 + r(), 1); dummy.updateMatrix(); alga.setMatrixAt(k, dummy.matrix) }
  for (let k = 0; k < 140; k++) { const a = r() * Math.PI * 2, f = .7 + r() * .28, x = Math.cos(a) * SB * f, z = Math.sin(a) * SA * f; dummy.position.set(x, SY(x, z) + .1, z); dummy.rotation.set(r() * 3, r() * 3, r() * 3); dummy.scale.setScalar(.4 + r() * .9); dummy.updateMatrix(); pie.setMatrixAt(k, dummy.matrix) } }
const GAVIOTAS = Array.from({ length: 22 }, (_, i) => { const g = new THREE.Group(); scene.add(g); const m = SM("#f4f4f0"); const c = part(new THREE.CapsuleGeometry(.18, .6, 4, 8), m, 0, 0, 0, g, 0); c.rotation.x = Math.PI / 2;
  const alas = [-1, 1].map(sx => { const a = new THREE.Group(); a.position.x = sx * .12; g.add(a); part(new THREE.BoxGeometry(1.1, .04, .35), m, sx * .55, 0, 0, a, 0); part(new THREE.BoxGeometry(.3, .045, .36), SM("#2a2a2a"), sx * 1.0, 0, 0, a, 0); return a });
  g.userData = { alas, r: 22 + (i % 11) * 6, h: 14 + (i % 5) * 5, v: .25 + (i % 4) * .05, ph: i * 1.7 }; return g });
function gaviotas(t) { TURT.updateMatrixWorld(true); const c = TURT.getWorldPosition(new THREE.Vector3()); GAVIOTAS.forEach(g => { const u = g.userData, a = t * u.v + u.ph; g.position.set(c.x + Math.cos(a) * u.r, u.h + Math.sin(t * .7 + u.ph) * 2, c.z + Math.sin(a) * u.r); g.rotation.set(0, -a, Math.sin(t * .5 + u.ph) * .2); u.alas.forEach((al, i) => al.rotation.z = (i ? -1 : 1) * Math.sin(t * 6 + u.ph) * .5) }) }

// nubes con forma y un muelle con botes en la costa
const NUBES = Array.from({ length: 16 }, (_, i) => { const r = rng(300 + i), g = new THREE.Group(); scene.add(g); const a = r() * Math.PI * 2, d = 160 + r() * 160; g.position.set(Math.cos(a) * d, 70 + r() * 50, Math.sin(a) * d);
  for (let k = 0; k < 10; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: k < 6 ? "#ffffff" : "#c3c9d6", transparent: true, opacity: .85, depthWrite: false, fog: false })); sp.position.set((r() - .5) * 40, k < 6 ? (r() - .1) * 8 : -3 - r() * 3, (r() - .5) * 20); sp.scale.set(30 + r() * 30, 16 + r() * 12, 1); g.add(sp) } return g });
{ const mu = new THREE.Group(); COSTA.add(mu); mu.position.set(40, 0, 10); for (let k = 0; k < 10; k++) part(new THREE.BoxGeometry(2, .25, 1), M_PLANK, k * 2, 1.2, 0, mu, 0); for (let k = 0; k < 6; k++) part(new THREE.CylinderGeometry(.18, .18, 3, 8), M_BEAM, k * 4, 0, .6, mu, 0);
  [["#c94b4b", 6, 5], ["#3f6a8a", 14, -5], ["#e8dcc0", 24, 6]].forEach(([c, x, z]) => { const b = part(new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), SM(c), x, .6, z, mu, 0); b.scale.set(1.2, .7, 3) }) }

// ---------- todavía más detalle: hiedra en las paredes, chimeneas con humo, un pozo de agua, bancos, cajones de pescado y sogas
const HUMO_PTS = [], HUMO = [];
{ const r = rng(140), hoja = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.17, 0), SM("#3f6a2e", { roughness: .8 }), 2400), hoja2 = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.14, 0), SM("#5a8a3a", { roughness: .8 }), 2400); [hoja, hoja2].forEach(m => { m.castShadow = true; TURT.add(m) }); let n = 0;
  const v = new THREE.Vector3();
  [...CASAS, NUESTRA, ESCUELA].forEach(H => { if (r() < .35) return; H.g.updateMatrix(); const sx = r() < .5 ? -1 : 1, x0 = sx * ((H.Wd ?? 6.4) / 2 - .3), top = 2 + r() * 2.2;
    for (let k = 0; k < 220 && n < 2400; k++) { const y = Math.pow(r(), .8) * top, x = x0 - sx * r() * (1.6 * (1 - y / (top + .5))) ; v.set(x, y, 3.12 + r() * .08).applyMatrix4(H.g.matrix); dummy.position.copy(v); dummy.rotation.set(r() * 3, r() * 3, r() * 3); dummy.scale.setScalar(.7 + r() * .7); dummy.updateMatrix(); (k % 2 ? hoja2 : hoja).setMatrixAt(n >> 0, dummy.matrix); if (k % 2) n++ } });
  hoja.count = hoja2.count = n;
  // chimeneas de piedra con humo
  [...CASAS, NUESTRA, ESCUELA].forEach((H, i) => { const c = part(new THREE.BoxGeometry(.8, 2.4, .8), M_STONE, (H.Wd ?? 6.4) / 2 - 1.3, (H.Hh ?? 5) + 1.6, -1, H.g, 0); c.castShadow = true; part(new THREE.BoxGeometry(1, .2, 1), M_STONE, 0, 1.25, 0, c, 0); HUMO_PTS.push(c) });
  // el pozo de agua de la plaza
  const pozo = new THREE.Group(); enConcha(pozo, -2.8, 1, .3); part(new THREE.CylinderGeometry(.9, .95, .9, 20, 1, true), (() => { const m = M_STONE.clone(); m.side = THREE.DoubleSide; return m })(), 0, .45, 0, pozo, 0); part(new THREE.CircleGeometry(.85, 20), SM("#0e1a1c", { roughness: .1 }), 0, .5, 0, pozo, 0).rotation.x = -Math.PI / 2;
  for (const s of [-1, 1]) part(new THREE.BoxGeometry(.14, 1.8, .14), M_BEAM, s * .85, 1.3, 0, pozo, 0); part(new THREE.CylinderGeometry(.08, .08, 1.9, 8), M_BEAM, 0, 1.9, 0, pozo, 0).rotation.z = Math.PI / 2; const te = part(new THREE.ConeGeometry(1.3, .8, 4), M_SHING, 0, 2.55, 0, pozo, 0); te.rotation.y = Math.PI / 4;
  const balde = part(new THREE.CylinderGeometry(.2, .16, .3, 12), M_PLANK, .3, 1.15, 0, pozo, 0); part(new THREE.CylinderGeometry(.01, .01, .7, 4), SM("#c9b48a"), .3, 1.5, 0, pozo, 0);
  // bancos contra las casas
  [[3.3, 11.5, -Math.PI / 2], [-3.3, -10.5, Math.PI / 2], [3.3, -16, -Math.PI / 2], [-3.3, 15, Math.PI / 2]].forEach(([x, z, ry]) => { const b = new THREE.Group(); enConcha(b, x, z, ry); part(new THREE.BoxGeometry(1.8, .1, .45), M_PLANK, 0, .5, 0, b, 0); for (const s of [-1, 1]) part(new THREE.BoxGeometry(.1, .5, .4), M_BEAM, s * .75, .25, 0, b, 0); part(new THREE.BoxGeometry(1.8, .35, .06), M_PLANK, 0, .85, -.2, b, 0) });
  // cajones de pescado y rollos de soga junto al mercado
  const pez = SM("#9ab0b8", { metalness: .4, roughness: .3 });
  [[-10.5, 21.5], [-12, 26.5], [-16.5, 21], [-9.5, 24.5]].forEach(([x, z], i) => { const c = new THREE.Group(); enConcha(c, x, z, r() * 3); part(new THREE.BoxGeometry(1, .45, .7), M_PLANK, 0, .22, 0, c, 0); for (let k = 0; k < 5; k++) { const f = part(new THREE.SphereGeometry(.12, 10, 6), pez, -.3 + k * .15, .5, (r() - .5) * .3, c, 0); f.scale.set(2.2, .6, .9); f.rotation.y = (r() - .5) * .6 }
    if (i % 2) { const s = part(new THREE.TorusGeometry(.3, .06, 8, 20), SM("#c9b48a", { roughness: 1 }), .9, .07, .2, c, 0); s.rotation.x = Math.PI / 2; part(new THREE.TorusGeometry(.22, .06, 8, 20), SM("#c9b48a", { roughness: 1 }), .9, .18, .2, c, 0).rotation.x = Math.PI / 2 } }) }
HUMO_PTS.forEach(() => { for (let k = 0; k < 4; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#e8e4dc", transparent: true, opacity: 0, depthWrite: false })); scene.add(sp); HUMO.push(sp) } });
function humo(t) { HUMO_PTS.forEach((c, i) => { c.updateMatrixWorld(true); const o = new THREE.Vector3(0, 1.4, 0).applyMatrix4(c.matrixWorld); for (let k = 0; k < 4; k++) { const s = HUMO[i * 4 + k], q = (t * .25 + k / 4 + i * .13) % 1; s.position.set(o.x + Math.sin(q * 5 + i) * .6 + q * 1.5, o.y + q * 4, o.z + q * .8); s.scale.setScalar(.8 + q * 2.6); s.material.opacity = (1 - q) * .35 } }) }

const ROPA3 = [], GALLINAS = [], BOTES = [];
// ---------- ultradetalle (revisión cuadro a cuadro, 24-nov-2026)
const R3 = rng(400), V3 = new THREE.Vector3();
// espuma alrededor de la tortuga, en la línea de agua real (se achica cuando el caparazón se hunde) y salpicaduras de cada remada
const T_ESPUMA = tex(1024, 1024, (g, w, h) => { const r = rng(401); g.clearRect(0, 0, w, h); const cx = w / 2, cy = h / 2, R0 = w / 2;
  // espuma de verdad: encaje de vetas finas que siguen la orilla + burbujas chiquitas, más densa contra el cuerpo y deshilachada hacia afuera
  for (let k = 0; k < 4200; k++) { const q = .62 + Math.pow(r(), 2.2) * .38, a0 = r() * 6.283, L = .02 + r() * .09, fade = 1 - (q - .62) / .38; g.strokeStyle = `rgba(255,255,255,${(.06 + r() * .3) * fade})`; g.lineWidth = .8 + r() * 2.6 * fade; g.beginPath();
    for (let j = 0; j <= 8; j++) { const a = a0 + L * j / 8, qq = q + Math.sin(a * 37 + k) * .006 + (r() - .5) * .004; const x = cx + Math.cos(a) * R0 * qq, y = cy + Math.sin(a) * R0 * qq; j ? g.lineTo(x, y) : g.moveTo(x, y) } g.stroke() }
  for (let k = 0; k < 16000; k++) { const q = .62 + Math.pow(r(), 1.8) * .38, a = r() * 6.283, fade = 1 - (q - .62) / .38, x = cx + Math.cos(a) * R0 * q, y = cy + Math.sin(a) * R0 * q; g.fillStyle = `rgba(255,255,255,${(.15 + r() * .45) * fade})`; g.beginPath(); g.arc(x, y, .5 + r() * 1.8, 0, 7); g.fill() } });
const FOAM = new THREE.Mesh(new THREE.RingGeometry(.9, 1.15, 128, 1), new THREE.MeshStandardMaterial({ map: T_ESPUMA, transparent: true, depthWrite: false, roughness: .6 })); FOAM.rotation.order = "XYZ"; scene.add(FOAM);
const SALPI = Array.from({ length: 48 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#dfe8ea", transparent: true, opacity: 0, depthWrite: false })); scene.add(s); return s });
function espuma(t, tort) { const b = tort.bajo || 0, f = b <= RIM ? 1.04 : Math.sqrt(Math.max(.02, 1 - Math.pow(Math.min(1, (b - RIM) / SH), 1 / .62)));
  FOAM.position.set(TURT.position.x, .07, TURT.position.z); FOAM.rotation.set(-Math.PI / 2, 0, TURT.rotation.y); FOAM.scale.set(SB * f, SA * f, 1); FOAM.material.opacity = .85;
  ALETAS.forEach(({ piv, sx, sz }, i) => { piv.updateMatrixWorld(true); const o = V3.set(sx * 9, -1, 0).applyMatrix4(piv.matrixWorld), ph = t * .9 * (tort.paso ?? 1) * 1 + (sx * sz > 0 ? 0 : Math.PI), fuerza = Math.max(0, Math.cos(ph)) * (tort.paso ?? 1);
    for (let k = 0; k < 12; k++) { const s = SALPI[i * 12 + k], q = (t * 1.3 + k / 12) % 1; s.position.set(o.x + Math.sin(k * 2.1) * (3 + q * 4), Math.max(.1, q * 2.4 - q * q * 2.2), o.z + Math.cos(k * 1.7) * (3 + q * 4)); s.scale.setScalar(.6 + q * 1.4); s.material.opacity = o.y < 1.5 ? fuerza * (1 - q) * .28 : 0 } }) }
// algas colgando del borde del caparazón, escalera de soga y una red de pesca secándose
{ const al = new THREE.InstancedMesh(new THREE.BoxGeometry(.18, 1, .03), new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .7, side: THREE.DoubleSide }), 260), cc = new THREE.Color(); al.castShadow = true; TURT.add(al);
  for (let k = 0; k < 260; k++) { const a = k / 260 * 6.283 + R3() * .02, x = Math.cos(a) * SB * 1.045, z = Math.sin(a) * SA * 1.045, L = .6 + R3() * 1.6; dummy.position.set(x, RIM - .3 - L / 2, z); dummy.rotation.set(0, -a, (R3() - .5) * .25); dummy.scale.set(1, L, 1); dummy.updateMatrix(); al.setMatrixAt(k, dummy.matrix); al.setColorAt(k, cc.set(["#3f6a2e", "#2e5a26", "#5a7a2a", "#6a6a2a"][R3() * 4 | 0])) }
  const esc = new THREE.Group(); TURT.add(esc); esc.position.set(-SB * 1.05, 0, 10); esc.rotation.y = Math.PI / 2; const soga = SM("#b8a07a", { roughness: 1 });
  for (const s of [-1, 1]) part(new THREE.CylinderGeometry(.04, .04, 6, 6), soga, s * .45, RIM - 2.6, 0, esc, 0); for (let k = 0; k < 10; k++) part(new THREE.CylinderGeometry(.05, .05, .95, 6), M_PLANK, 0, RIM - 5.3 + k * .56, 0, esc, 0).rotation.z = Math.PI / 2;
  const T_RED = tex(512, 512, (g, w, h) => { const r = rng(402); g.clearRect(0, 0, w, h); g.strokeStyle = "rgba(200,190,160,.95)"; g.lineWidth = 3; for (let k = 0; k < 26; k++) { g.beginPath(); for (let y = 0; y <= h; y += 20) g.lineTo(k * 20 + Math.sin(y * .03 + k) * 5 + (r() - .5) * 4, y); g.stroke(); g.beginPath(); for (let x = 0; x <= w; x += 20) g.lineTo(x, k * 20 + Math.sin(x * .025 + k) * 6 + (r() - .5) * 4); g.stroke() } for (let k = 0; k < 30; k++) { g.fillStyle = "#c94b4b"; g.beginPath(); g.arc(r() * w, r() * 40, 7, 0, 7); g.fill() } });
  const red = new THREE.Group(); enConcha(red, -9.5, 27.5, .4); for (const s of [-1, 1]) part(new THREE.CylinderGeometry(.08, .1, 3, 8), M_BEAM, s * 1.6, 1.5, 0, red, 0);
  const rm = part(new THREE.PlaneGeometry(3.2, 2.2, 12, 8), new THREE.MeshStandardMaterial({ map: T_RED, transparent: true, alphaTest: .3, side: THREE.DoubleSide, roughness: 1 }), 0, 1.8, 0, red, 0); const pp = rm.geometry.attributes.position; for (let i = 0; i < pp.count; i++) pp.setZ(i, Math.sin(pp.getX(i) * 1.3) * .2 - (1 - Math.abs(pp.getX(i)) / 1.6) * .25 * (1.1 - pp.getY(i) / 1.1)); rm.geometry.computeVertexNormals() }
// utilería en la vereda de cada casa: barriles, cajones, baldes, bolsas y palas apoyadas, con pasto 3D al pie de las paredes
{ const bar = new THREE.InstancedMesh(new THREE.CylinderGeometry(.36, .32, .95, 14), M_PLANK, 120), caj = new THREE.InstancedMesh(new THREE.BoxGeometry(.75, .6, .75), M_PLANK, 120), bal = new THREE.InstancedMesh(new THREE.CylinderGeometry(.18, .14, .3, 12), SM("#8a8a90", { metalness: .6, roughness: .4 }), 80), bol = new THREE.InstancedMesh(new THREE.SphereGeometry(.35, 12, 8), SM("#b8a27a", { roughness: 1 }), 80), pal = new THREE.InstancedMesh(new THREE.BoxGeometry(.06, 1.8, .06), SM("#7a5030"), 50), pas = new THREE.InstancedMesh(new THREE.ConeGeometry(.04, 1, 3), new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .85 }), 5000);
  [bar, caj, bal, bol, pal, pas].forEach(m => { m.castShadow = m.receiveShadow = true; TURT.add(m); m.count = 0 }); const cc = new THREE.Color();
  const pon = (m, lx, ly, lz, H, ry = 0, sc = [1, 1, 1], rx = 0) => { V3.set(lx, 0, lz).applyMatrix4(H.g.matrix); dummy.position.set(V3.x, SY(V3.x, V3.z) + ly, V3.z); dummy.rotation.set(rx, ry, 0); dummy.scale.set(...sc); dummy.updateMatrix(); m.setMatrixAt(m.count++, dummy.matrix) };
  [...CASAS, NUESTRA, ESCUELA, PANADERIA].forEach(H => { H.g.updateMatrix(); const Wd = H.Wd ?? 6.4;
    for (const s of [-1, 1]) { const x0 = s * (Wd / 2 - .5); const t = R3();
      if (t < .3) { pon(bar, x0, .48, 3.6, H, R3()); pon(bar, x0 - s * .75, .48, 3.55, H, R3()); pon(caj, x0 - s * .3, 1.25, 3.6, H, R3() * .5) }
      else if (t < .55) { pon(caj, x0, .3, 3.6, H, R3()); pon(caj, x0, .9, 3.6, H, R3()); pon(bal, x0 - s * .8, .15, 3.5, H) }
      else if (t < .8) { pon(bol, x0, .3, 3.55, H, 0, [1, .8, 1]); pon(bol, x0 - s * .55, .28, 3.6, H, 0, [.9, .75, .9]); pon(pal, x0 - s * .9, .85, 3.25, H, 0, [1, 1, 1], -.25) }
      else { pon(bar, x0, .48, 3.6, H, R3()); pon(bal, x0 - s * .6, .15, 3.55, H) } }
    for (let k = 0; k < 140 && pas.count < 5000; k++) { const x = (R3() - .5) * Wd, hg = .15 + R3() * .35; pon(pas, x, hg / 2, 3.15 + R3() * .25, H, R3() * 6, [1, hg, 1], (R3() - .5) * .5); pas.setColorAt(pas.count - 1, cc.set(["#4f7a32", "#6a9a3a", "#3f6a2a", "#8aa84a"][R3() * 4 | 0])) } });
  // charcos que reflejan en las calles
  const ch = new THREE.MeshStandardMaterial({ color: "#5a6a70", roughness: .05, metalness: .6, transparent: true, opacity: .85 });
  [[1.2, 7], [-1.5, -3], [.8, 14.5], [-.6, 20], [10, 1], [-15, 1.5], [1.6, -18]].forEach(([x, z], i) => { const c = part(new THREE.CircleGeometry(.6 + (i % 3) * .3, 20), ch, x, SY(x, z) + .04, z, TURT, 0); c.rotation.x = -Math.PI / 2; c.scale.set(1.4, 1, 1) }) }
// ropa tendida entre casas sobre la calle principal
{ [].forEach(([z, y], j) => { const yy = SY(0, z) + y, cu = part(new THREE.CylinderGeometry(.015, .015, 7.6, 4), SM("#ddd"), 0, yy, z, TURT, 0); cu.rotation.z = Math.PI / 2;
    for (let k = 0; k < 6; k++) { const c = ["#e05a4a", "#f2e6c4", "#4a7ab8", "#f2c41e", "#ffffff", "#5a8a4a", "#c98ac9"][(k + j * 2) % 7], m = part(new THREE.PlaneGeometry(.6 + R3() * .4, .7 + R3() * .5), new THREE.MeshStandardMaterial({ color: c, side: THREE.DoubleSide, roughness: .9 }), -3 + k * 1.15 + R3() * .3, yy - .45, z, TURT, 0); ROPA3.push(m) } }) }
// gallinas y gatos (de bloques)
{ const blanco = SM("#f4f0e6"), rojo = SM("#c9302a"), ama = SM("#e8a020");
  [[-1.8, 2.6], [-.8, 3.4], [2.2, 1.2], [-11, 4.4], [11.4, -1.8]].forEach(([x, z], i) => { const g = new THREE.Group(); enConcha(g, x, z, R3() * 6); part(RB(.34, .3, .44, .06), blanco, 0, .3, 0, g, 0); part(RB(.18, .2, .18, .04), blanco, 0, .55, .2, g, 0); part(new THREE.BoxGeometry(.05, .08, .1), rojo, 0, .7, .2, g, 0); part(new THREE.ConeGeometry(.04, .1, 4), ama, 0, .55, .33, g, 0).rotation.x = Math.PI / 2; for (const s of [-1, 1]) part(new THREE.BoxGeometry(.03, .16, .03), ama, s * .08, .08, 0, g, 0); GALLINAS.push(g) });
  [[3.6, 9.2, "#e08a3a"], [-3.6, -14, "#3a3a3a"]].forEach(([x, z, c]) => { const g = new THREE.Group(); enConcha(g, x, z, x > 0 ? -1.57 : 1.57); const m = SM(c); part(RB(.25, .25, .6, .06), m, 0, .25, 0, g, 0); part(RB(.25, .22, .22, .05), m, 0, .45, .3, g, 0); for (const s of [-1, 1]) part(new THREE.ConeGeometry(.05, .1, 4), m, s * .08, .6, .3, g, 0); const co = part(new THREE.CylinderGeometry(.03, .03, .5, 6), m, 0, .45, -.4, g, 0); co.rotation.x = .8 }) }
// botes de pesca a media distancia y más casas y un muelle en la costa
{ const vela = new THREE.MeshStandardMaterial({ color: "#f0e8d8", side: THREE.DoubleSide, roughness: .9 });
  [[70, 30, "#c94b4b"], [-60, 70, "#3f6a8a"], [90, -50, "#e8dcc0"], [-70, -60, "#5a7a3a"]].forEach(([x, z, c]) => { const b = new THREE.Group(); scene.add(b); b.position.set(x, .2, z); b.rotation.y = R3() * 6; const cas = part(new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), SM(c), 0, .5, 0, b, 0); cas.scale.set(1.3, .8, 3.6); part(new THREE.CylinderGeometry(.07, .07, 5, 6), M_BEAM, 0, 2.8, .4, b, 0); const v = part(new THREE.PlaneGeometry(2.2, 3.2), vela, .05, 3, -.4, b, 0); v.rotation.y = Math.PI / 2; BOTES.push(b) });
  for (let k = 0; k < 14; k++) { const x = -15 - R3() * 30, z = -260 + k * 38 + R3() * 10; part(RB(5 + R3() * 3, 4 + R3() * 2, 5, .2), M_WALL[(k + 3) % M_WALL.length], x, 2.5, z, COSTA, 0); const t2 = part(new THREE.ConeGeometry(4.5, 3, 4), M_SHING, x, 6, z, COSTA, 0); t2.rotation.y = Math.PI / 4 } }
// el pozo: terrones sueltos y piedritas alrededor
{ const ter = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.14, 0), SMt(T_DIRT, { roughness: 1 }), 40); ter.castShadow = true; HOYO.add(ter); for (let k = 0; k < 40; k++) { const a = R3() * 6.283, d = 1.2 + R3() * 1.1; dummy.position.set(Math.cos(a) * d, .1, Math.sin(a) * d); dummy.rotation.set(R3() * 3, R3() * 3, 0); dummy.scale.setScalar(.6 + R3() * 1.4); dummy.updateMatrix(); ter.setMatrixAt(k, dummy.matrix) } }
// noche: estrellas en el cielo y luciérnagas alrededor de los faroles
const ESTRELLAS = (() => { const n = 700, p = new Float32Array(n * 3); for (let k = 0; k < n; k++) { const a = R3() * 6.283, e = .15 + R3() * 1.3; p[k * 3] = Math.cos(a) * Math.cos(e) * 360; p[k * 3 + 1] = Math.sin(e) * 360; p[k * 3 + 2] = Math.sin(a) * Math.cos(e) * 360 } const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3)); const m = new THREE.Points(g, new THREE.PointsMaterial({ color: "#fff6e0", size: 1.6, sizeAttenuation: false, fog: false, transparent: true, opacity: .9 })); scene.add(m); return m })();
const LUCES = Array.from({ length: 30 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#e8ff9a", transparent: true, opacity: .9, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(.25); TURT.add(s); s.userData = { x: [-3.2, -3.2, 3.2, -3.2][i % 4], z: [12, 7, 18, -4][i % 4], ph: i * 1.7 }; return s });
function noche(t, si) { M_AGUA.envMapIntensity = si ? .12 : 1.05; ESTRELLAS.visible = si; LUCES.forEach(s => { s.visible = si; const u = s.userData; s.position.set(u.x + Math.sin(t * .7 + u.ph) * 1.2, SY(u.x, u.z) + 2.5 + Math.sin(t * 1.1 + u.ph * 2) * 1, u.z + Math.cos(t * .6 + u.ph) * 1.2); s.material.opacity = .5 + .5 * Math.sin(t * 5 + u.ph) }) }
function vida(t) { ROPA3.forEach((m, i) => m.rotation.x = Math.sin(t * 2.2 + i) * .25); GALLINAS.forEach((g, i) => { g.children[1].position.z = .2 + Math.max(0, Math.sin(t * 6 + i * 2)) * .06 }); BOTES.forEach((b, i) => { b.position.y = .2 + Math.sin(t * 1.2 + i) * .15; b.rotation.z = Math.sin(t * .9 + i) * .05 }) }

// ================= HOLLOWPINE: aldea de cabañas de troncos en un valle de pinos nevados, de noche =================
// el lomo del motor ya no es una tortuga: es una loma nevada en el medio del valle. Se esconde todo lo de la tortuga y del mar.
CABEZA.visible = false; ALETAS.forEach(a => a.piv.visible = false); COLA.visible = false; COSTA.visible = false; FOAM.visible = false; FONDO.visible = false;
BOTES.forEach(b => b.visible = false); GAVIOTAS.forEach(g => g.visible = false); LUCES.forEach(l => l.visible = false); ESPUMA.forEach(s => s.visible = false); SALPI.forEach(s => s.visible = false);
NUBE.forEach(s => s.visible = false); ROPA3.forEach(m => m.visible = false);
// pasto, flores, hiedra y algas no van en invierno (todo lo verde del lomo)
TURT.traverse(o => { if ((o.isInstancedMesh || o.isMesh) && o.material && o.material.color && !o.material.map) { const c = o.material.color; if (c.g > c.r * 1.15 && c.g > c.b) o.visible = false } if (o.isInstancedMesh && o.material && !o.material.map) o.visible = false });
GALLINAS.forEach(g => g.visible = false);
// v3: sin el costado ni el borde del lomo (el pueblo está al nivel del valle); sin percebes
TURT.children.forEach(o => { if (o.material && o.material.map === T_LADO) o.visible = false; if (o.isInstancedMesh && o.geometry === GEO_PERCEBE) o.visible = false });
const T_LLAMA = tex(128, 256, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h * .72, 4, w / 2, h * .62, h * .55); gr.addColorStop(0, "rgba(255,250,220,1)"); gr.addColorStop(.25, "rgba(255,200,80,.95)"); gr.addColorStop(.55, "rgba(255,110,20,.6)"); gr.addColorStop(1, "rgba(160,30,0,0)"); g.fillStyle = gr; g.beginPath(); g.moveTo(w / 2, 0); g.bezierCurveTo(w * 1.05, h * .45, w, h, w / 2, h); g.bezierCurveTo(0, h, -w * .05, h * .45, w / 2, 0); g.fill() });
const T_TRAMA = tex(256, 256, (g, w, h) => { g.fillStyle = "#808080"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 4) { g.fillStyle = y % 8 ? "rgba(255,255,255,.18)" : "rgba(0,0,0,.2)"; g.fillRect(0, y, w, 2) } for (let x = 0; x < w; x += 4) { g.fillStyle = x % 8 ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.15)"; g.fillRect(x, 0, 2, h) } }, [4, 4]);
// ---------- nieve: el piso del valle, el lomo pintado de nieve con huellas y senderos, y los techos nevados
const T_NIEVE = (() => { const [c, z] = pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(1201); c.fillStyle = "#e8eef6"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
  for (let k = 0; k < 900; k++) { const x = r() * w, y = r() * h, s = 20 + r() * 90, gr = c.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, r() < .5 ? "rgba(180,196,220,.35)" : "rgba(255,255,255,.5)"); gr.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = gr; c.fillRect(x - s, y - s, s * 2, s * 2);
    const gz = z.createRadialGradient(x, y, 0, x, y, s); gz.addColorStop(0, r() < .5 ? "rgba(60,60,60,.35)" : "rgba(220,220,220,.35)"); gz.addColorStop(1, "rgba(128,128,128,0)"); z.fillStyle = gz; z.fillRect(x - s, y - s, s * 2, s * 2) }
  for (let k = 0; k < 9000; k++) { c.fillStyle = `rgba(255,255,255,${r() * .6})`; c.fillRect(r() * w, r() * h, 1.5, 1.5) } });
  [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(60, 60) }); return { c, z } })();
const M_NIEVE = new THREE.MeshStandardMaterial({ map: T_NIEVE.c, bumpMap: T_NIEVE.z, bumpScale: 4, roughness: .82, color: "#ffffff" });
AGUA.material = M_NIEVE; AGUA.position.y = .02;
// el lomo: nieve con senderos pisados (gris azulado) en las calles
M_CAPA.map = tex(2048, 2048, (g, w, h) => { const r = rng(1202), X = x => (x / (2 * SB) + .5) * w, Z = z => (z / (2 * SA) + .5) * h; g.fillStyle = "#e6ecf4"; g.fillRect(0, 0, w, h);
  for (let k = 0; k < 2500; k++) { const x = r() * w, y = r() * h, s = 10 + r() * 60; g.fillStyle = r() < .5 ? "rgba(170,186,212,.22)" : "rgba(255,255,255,.35)"; g.beginPath(); g.ellipse(x, y, s, s * .6, r() * 3, 0, 7); g.fill() }
  const senda = (x0, z0, x1, z1, an) => { for (let q = 0; q <= 1; q += .002) { const x = X(lerp(x0, x1, q)) + Math.sin(q * 11) * 8, y = Z(lerp(z0, z1, q)); g.fillStyle = `rgba(${120 + r() * 30 | 0},${132 + r() * 30 | 0},${150 + r() * 30 | 0},.22)`; g.beginPath(); g.ellipse(x + (r() - .5) * an, y + (r() - .5) * an, 6 + r() * 14, 4 + r() * 8, r() * 3, 0, 7); g.fill() }
    for (let q = 0; q <= 1; q += .006) { const x = X(lerp(x0, x1, q)) + (r() - .5) * an * .6, y = Z(lerp(z0, z1, q)); g.fillStyle = "rgba(90,100,120,.35)"; g.beginPath(); g.ellipse(x, y, 4, 7, 0, 0, 7); g.fill() } };
  senda(0, -30, 0, 30, 110); senda(-26, 0, 26, 0, 90); senda(0, 1.5, 14, 20, 50) });
M_CAPA.bumpMap = M_CAPA.map; M_CAPA.bumpScale = 1.5; M_CAPA.color.set("#ffffff"); M_CAPA.roughness = .85; M_CAPA.needsUpdate = true;
// el empedrado del motor queda debajo de la nieve: se esconden las piedritas sueltas (todo InstancedMesh gris del lomo)
TURT.children.forEach(o => { if (o.isInstancedMesh && o.material && (o.material.color?.getHex?.() === 0x8a8478 || o.material.map === T_DIRT)) o.visible = false });
// ---------- cabañas de troncos: paredes de troncos redondos con nudos y grietas, techos con nieve gruesa y carámbanos
const T_TRONCOS = seed => tex(1024, 1024, (g, w, h) => { const r = rng(seed); g.fillStyle = "#2a1a10"; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 64) { const gr = g.createLinearGradient(0, y, 0, y + 62); const b = ["#7a5030", "#6a4428", "#845a36", "#5e3c22"][r() * 4 | 0]; gr.addColorStop(0, "#3a2414"); gr.addColorStop(.2, b); gr.addColorStop(.55, rgbj(b, r, 20)); gr.addColorStop(.9, "#2e1c10"); gr.addColorStop(1, "#1a0e06"); g.fillStyle = gr; g.fillRect(0, y + 2, w, 60);
    for (let k = 0; k < 40; k++) { const x = r() * w, L = 30 + r() * 140; g.strokeStyle = r() < .5 ? "rgba(30,16,6,.45)" : "rgba(180,130,80,.18)"; g.lineWidth = 1 + r() * 2; g.beginPath(); g.moveTo(x, y + 8 + r() * 46); g.lineTo(x + L, y + 8 + r() * 46); g.stroke() }
    for (let k = 0; k < 2; k++) { const x = r() * w, yy = y + 20 + r() * 24; g.fillStyle = "#2a160a"; g.beginPath(); g.ellipse(x, yy, 7, 5, 0, 0, 7); g.fill(); g.strokeStyle = "rgba(120,80,40,.6)"; g.lineWidth = 2; g.beginPath(); g.ellipse(x, yy, 11, 8, 0, 0, 7); g.stroke() }
    g.fillStyle = "rgba(240,246,255,.85)"; for (let x = 0; x < w; x += 6) if (r() < .55) g.fillRect(x, y + 2, 6, 2 + r() * 5) } });
M_WALL.forEach((m, i) => { const t = T_TRONCOS(1300 + i); m.map = t; m.bumpMap = t; m.bumpScale = 4; m.color.set("#ffffff"); m.needsUpdate = true });
M_GABLE.forEach((m, i) => { const t = T_TRONCOS(1400 + i); m.map = t; m.bumpMap = t; m.bumpScale = 3; m.color.set("#ffffff"); m.needsUpdate = true });
const T_TECHO_NIEVE = tex(1024, 512, (g, w, h) => { const r = rng(1210); g.fillStyle = "#eef3fa"; g.fillRect(0, 0, w, h); for (let k = 0; k < 600; k++) { const x = r() * w, y = r() * h, s = 10 + r() * 40; g.fillStyle = r() < .5 ? "rgba(180,196,222,.3)" : "rgba(255,255,255,.6)"; g.beginPath(); g.ellipse(x, y, s, s * .5, 0, 0, 7); g.fill() }
  g.fillStyle = "rgba(60,40,30,.5)"; for (let x = 0; x < w; x += 40) if (r() < .25) g.fillRect(x, h - 18 - r() * 30, 26, 16) });
M_SHING.map = T_TECHO_NIEVE; M_SHING.bumpMap = T_TECHO_NIEVE; M_SHING.bumpScale = 3; M_SHING.color.set("#ffffff"); M_SHING.roughness = .8; M_SHING.needsUpdate = true;
M_BEAM.color.set("#3a2414");
// carámbanos y montoncitos de nieve en el alero de cada casa, y el antler tallado en cada puerta
const T_ASTA = tex(256, 256, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = "rgba(30,16,6,.85)"; g.lineWidth = 9; g.lineCap = "round"; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(128, 200); g.quadraticCurveTo(128 + s * 30, 120, 128 + s * 80, 40); g.stroke(); [[.35, 50], [.6, 40], [.85, 30]].forEach(([q, L]) => { const x = 128 + s * (10 + q * 70), y = 200 - q * 160; g.beginPath(); g.moveTo(x, y); g.lineTo(x + s * 10, y - L); g.stroke() }) } g.beginPath(); g.arc(128, 214, 16, 0, 7); g.stroke() });
{ const hielo = new THREE.MeshPhysicalMaterial({ color: "#dff0ff", roughness: .1, transmission: .5, thickness: .3, transparent: true, opacity: .85 }), cono = new THREE.ConeGeometry(.08, 1, 6); const r = rng(1220);
  HOUSES.forEach(H => { if (!H.g.visible) return; const Wd = H.Wd ?? 6.4; for (let k = 0; k < 9; k++) { const L = .3 + r() * .9, ic = part(cono, hielo, -Wd / 2 + .4 + k * (Wd - .8) / 8, (H.Hh ?? 5) - L / 2 + .05, 3.45, H.g, 0); ic.scale.set(1, L, 1); ic.rotation.x = Math.PI }
    const asta = part(new THREE.PlaneGeometry(.9, .9), new THREE.MeshStandardMaterial({ map: T_ASTA, transparent: true, roughness: .9 }), H.door ?? 0, 3.3, 3.32, H.g, 0) }) }
// ---------- pinos de verdad: tronco con corteza, ramas en pisos con nieve encima; un bosque alrededor de la loma hasta el horizonte
const T_CORTEZA = tex(512, 1024, (g, w, h) => { const r = rng(1230); g.fillStyle = "#3a2a1e"; g.fillRect(0, 0, w, h); for (let k = 0; k < 160; k++) { const x = r() * w; g.strokeStyle = r() < .5 ? "rgba(20,12,6,.7)" : "rgba(120,90,60,.35)"; g.lineWidth = 3 + r() * 8; g.beginPath(); g.moveTo(x, 0); for (let y = 0; y <= h; y += 30) g.lineTo(x + (r() - .5) * 14, y); g.stroke() }
  for (let k = 0; k < 40; k++) { g.fillStyle = `rgba(${90 + r() * 40 | 0},${110 + r() * 40 | 0},${70 + r() * 20 | 0},.35)`; g.beginPath(); g.arc(r() * w, r() * h, 6 + r() * 20, 0, 7); g.fill() } }, [1, 3]);
const M_CORTEZA_P = SMt(T_CORTEZA, { bumpMap: T_CORTEZA, bumpScale: 4, roughness: 1 });
const GEO_PISO = (() => { const geo = new THREE.ConeGeometry(1, 1, 18, 4, true), p = geo.attributes.position; const r = rng(1231); for (let i = 0; i < p.count; i++) { const y = p.getY(i), a = Math.atan2(p.getZ(i), p.getX(i)); const k = 1 + Math.sin(a * 9) * .08 + Math.sin(a * 23 + 1) * .05 + (r() - .5) * .04; p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); if (y < -.4) p.setY(i, y - Math.abs(Math.sin(a * 9)) * .12) } geo.computeVertexNormals(); return geo })();
const M_AGUJAS = new THREE.MeshStandardMaterial({ color: "#6a9a78", emissive: "#0e1e16", roughness: .9, side: THREE.DoubleSide, map: tex(256, 256, (g, w, h) => { const r = rng(1232); g.fillStyle = "#2a4a34"; g.fillRect(0, 0, w, h); for (let k = 0; k < 1500; k++) { g.strokeStyle = r() < .5 ? "rgba(10,30,20,.6)" : "rgba(80,120,80,.4)"; g.lineWidth = 1.5; const x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 6, y + 10); g.stroke() } }, [4, 2]) });
const M_NIEVE_P = new THREE.MeshStandardMaterial({ color: "#f2f6fc", roughness: .8, bumpMap: T_NIEVE.z, bumpScale: 2 });
const GEO_CAPNIEVE = (() => { const geo = new THREE.ConeGeometry(1, 1, 18, 3, true), p = geo.attributes.position; const r = rng(1233); for (let i = 0; i < p.count; i++) { const a = Math.atan2(p.getZ(i), p.getX(i)), k = .9 + Math.sin(a * 5 + 2) * .12 + r() * .05; p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k) } geo.computeVertexNormals(); return geo })();
// v3 (pedido del dueño: ultradetalle en los árboles): cada piso del pino es un abanico de ramas que caen (13 ramas con
// ramitas a los costados), con un relleno oscuro adentro y un terrón de nieve sobre cada rama. Se unen en una sola malla.
const mergeG = list => { const gs = list.map(([g, m]) => { const q = g.index ? g.toNonIndexed() : g.clone(); q.applyMatrix4(m); return q }); const n = gs.reduce((a, q) => a + q.attributes.position.count, 0);
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2); let o = 0; gs.forEach(q => { pos.set(q.attributes.position.array, o * 3); nor.set(q.attributes.normal.array, o * 3); if (q.attributes.uv) uv.set(q.attributes.uv.array, o * 2); o += q.attributes.position.count });
  const G = new THREE.BufferGeometry(); G.setAttribute("position", new THREE.BufferAttribute(pos, 3)); G.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); G.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); return G };
const MZ = (p, dir, s) => new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize()), s);
const [GEO_PISO2, GEO_NIEVE2] = (() => { const r = rng(1235), ver = [], nie = [], cono = new THREE.ConeGeometry(1, 1, 5, 2), bola = new THREE.IcosahedronGeometry(1, 1);
  { const p = bola.attributes.position; for (let i = 0; i < p.count; i++) { const k = .8 + r() * .35; p.setXYZ(i, p.getX(i) * k, p.getY(i) * k, p.getZ(i) * k) } bola.computeVertexNormals() }
  ver.push([new THREE.ConeGeometry(.62, 1, 12, 1, true), new THREE.Matrix4().makeTranslation(0, .05, 0)]);
  const N = 13; for (let i = 0; i < N; i++) { const a = i / N * 6.283 + (r() - .5) * .25, L = .95 + r() * .2, ca = Math.cos(a), sa = Math.sin(a);
    const s0 = new THREE.Vector3(ca * .08, .42, sa * .08), e = new THREE.Vector3(ca * L, -.42 - r() * .12, sa * L), d = e.clone().sub(s0), len = d.length();
    // la rama: un cono largo con la punta hacia afuera y un poco hacia abajo (la base gruesa pegada al tronco)
    ver.push([cono, MZ(s0.clone().addScaledVector(d, .5), d.clone().negate(), new THREE.Vector3(.15, len, .15))]);
    // ramitas a los costados, en dos alturas
    for (const q of [.4, .7]) for (const sd of [-1, 1]) { const b = s0.clone().addScaledVector(d, q), tg = new THREE.Vector3(-sa * sd, -.35, ca * sd).add(d.clone().normalize().multiplyScalar(.6)), ll = .32 - q * .12; ver.push([cono, MZ(b.clone().addScaledVector(tg.clone().normalize(), ll / 2), tg.clone().negate(), new THREE.Vector3(.07, ll, .07))]) }
    // nieve encima de la rama: dos terrones alargados
    for (const q of [.35, .7]) { const b = s0.clone().addScaledVector(d, q); b.y += .07; nie.push([bola, MZ(b, d, new THREE.Vector3(.11 - q * .04, len * .2, .09))]) } }
  nie.push([bola, new THREE.Matrix4().compose(new THREE.Vector3(0, .42, 0), new THREE.Quaternion(), new THREE.Vector3(.16, .1, .16))]);
  return [mergeG(ver), mergeG(nie)] })();
const PINOS = (() => { const N = 1400, tr = new THREE.InstancedMesh(new THREE.CylinderGeometry(.18, .32, 1, 8), M_CORTEZA_P, N), pi = new THREE.InstancedMesh(GEO_PISO, M_AGUJAS, N * 4), ni = new THREE.InstancedMesh(GEO_CAPNIEVE, M_NIEVE_P, N * 4);
  const pi2 = new THREE.InstancedMesh(GEO_PISO2, M_AGUJAS, 3600), ni2 = new THREE.InstancedMesh(GEO_NIEVE2, M_NIEVE_P, 3600); let n2 = 0; const cc = new THREE.Color();
  [tr, pi, ni, pi2, ni2].forEach(m => { m.castShadow = true; m.receiveShadow = true; scene.add(m) }); const r = rng(1240), lista = []; let n = 0, np = 0;
  const pon = (x, z, H) => { const y = 0; dummy.rotation.set(0, r() * 6, 0); dummy.position.set(x, y + H * .2, z); dummy.scale.set(H * .05 + .2, H * .4, H * .05 + .2); dummy.updateMatrix(); tr.setMatrixAt(n, dummy.matrix);
    if (Math.hypot(x, z) < 135 && n2 < 3600 - 7) { const T = 7; for (let k = 0; k < T; k++) { const q = k / (T - 1), rr = H * (.3 - q * .22), hh = H * (.17 - q * .06), yy = y + H * (.2 + q * .62); dummy.rotation.set((r() - .5) * .05, r() * 6, (r() - .5) * .05); dummy.position.set(x, yy, z); dummy.scale.set(rr, hh, rr); dummy.updateMatrix(); pi2.setMatrixAt(n2, dummy.matrix); ni2.setMatrixAt(n2, dummy.matrix); pi2.setColorAt(n2, cc.set("#ffffff").multiplyScalar(.75 + r() * .4)); n2++ }
      dummy.rotation.set(0, 0, 0); dummy.position.set(x, y + H * .9, z); dummy.scale.set(H * .05, H * .14, H * .05); dummy.updateMatrix(); pi.setMatrixAt(np, dummy.matrix); dummy.position.y += H * .03; dummy.scale.set(H * .04, H * .1, H * .04); dummy.updateMatrix(); ni.setMatrixAt(np, dummy.matrix); np++; lista.push([x, z, H]); n++; return }
    for (let k = 0; k < 4; k++) { const q = k / 4, rr = H * (.26 - q * .055), hh = H * (.34 - q * .04), yy = y + H * (.22 + q * .2) + hh / 2; dummy.rotation.set((r() - .5) * .06, r() * 6, (r() - .5) * .06); dummy.position.set(x, yy, z); dummy.scale.set(rr, hh, rr); dummy.updateMatrix(); pi.setMatrixAt(np, dummy.matrix);
      dummy.position.set(x, yy + hh * .1, z); dummy.scale.set(rr * .92, hh * .8, rr * .92); dummy.updateMatrix(); ni.setMatrixAt(np, dummy.matrix); np++ } lista.push([x, z, H]); n++ };
  for (let k = 0; k < 6000 && n < N; k++) { const a = r() * 6.283, d = 38 + Math.pow(r(), .7) * 260, x = Math.cos(a) * d * 1.05, z = Math.sin(a) * d * 1.2; if ((x - 12) ** 2 + (z - 37) ** 2 < 100 || (x - 16) ** 2 + (z - 44) ** 2 < 49 || (x - 3) ** 2 + (z - 49) ** 2 < 36 || (x - 4) ** 2 + (z + 38) ** 2 < 64 || (x + 28) ** 2 + (z - 28) ** 2 < 36 || (x - 6) ** 2 + (z - 46) ** 2 < 30) continue; pon(x, z, 9 + r() * 12 + (d > 120 ? 6 : 0)) }
  tr.count = n; pi.count = ni.count = np; pi2.count = ni2.count = n2; return lista })();
// el pino más viejo: gris, hueco, enorme, en el borde del bosque (del lado de nuestra cabaña)
const VIEJO = new THREE.Group(); scene.add(VIEJO); VIEJO.position.set(16, 0, 44);
{ const tg = new THREE.CylinderGeometry(1.6, 2.6, 30, 24, 8, true), p = tg.attributes.position; for (let i = 0; i < p.count; i++) { const a = Math.atan2(p.getZ(i), p.getX(i)), k = 1 + Math.sin(a * 7 + p.getY(i) * .3) * .08; p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k) } tg.computeVertexNormals();
  const mg = SMt(T_CORTEZA, { bumpMap: T_CORTEZA, bumpScale: 6, roughness: 1, color: "#9a948c", side: THREE.DoubleSide }); const tronco = part(tg, mg, 0, 15, 0, VIEJO, 0); VIEJO.userData.tronco = new THREE.Group(); VIEJO.add(VIEJO.userData.tronco); VIEJO.userData.tronco.add(tronco); tronco.position.set(0, 15, 0);
  const hueco = part(new THREE.CircleGeometry(1.5, 20), SM("#120a06"), 0, 1.8, 2.45, VIEJO.userData.tronco, 0); hueco.scale.set(.8, 1.4, 1);
  for (let k = 0; k < 6; k++) { const ra = part(new THREE.CylinderGeometry(.12, .3, 7, 6), mg, 0, 14 + k * 2.4, 0, VIEJO.userData.tronco, 0); ra.rotation.set(0, k * 1.9, 1.1 + (k % 2) * .3); ra.translateY(3) }
  const toc = part(new THREE.CylinderGeometry(2.6, 2.9, 1.2, 24), mg, 0, .6, 0, VIEJO, 0); const tapa = part(new THREE.CircleGeometry(2.55, 24), SM("#c9a878", { roughness: .9 }), 0, 1.22, 0, VIEJO, 0); tapa.rotation.x = -Math.PI / 2; VIEJO.userData.tapa = tapa; tapa.visible = false;
  { const mv = new THREE.MeshStandardMaterial({ color: "#8a9a88", roughness: .95, map: M_AGUJAS.map, side: THREE.DoubleSide }); for (let k = 0; k < 7; k++) { const q = k / 6, rr = 7.5 - q * 5, hh = 3.4 - q * 1.2, y = 14 + q * 16; const a = part(GEO_PISO2, mv, 0, y, 0, VIEJO.userData.tronco, 0); a.scale.set(rr, hh, rr); a.rotation.y = k * 1.3; const n = part(GEO_NIEVE2, M_NIEVE_P, 0, y, 0, VIEJO.userData.tronco, 0); n.scale.set(rr, hh, rr); n.rotation.y = k * 1.3 } }
  const nidoMusgo = part(new THREE.SphereGeometry(1.2, 16, 10, 0, 6.283, 0, 1.4), SM("#4a6a3a", { roughness: 1 }), 0, 1.2, 1.2, VIEJO.userData.tronco, 0) }
// el tocón de Brask en la plaza (nadie se sienta)
const TOCON = new THREE.Group(); enConcha(TOCON, -2.6, 2.2, 0, 0); { const mg = SMt(T_CORTEZA, { bumpMap: T_CORTEZA, bumpScale: 4 }); part(new THREE.CylinderGeometry(.9, 1.1, 1.1, 18), mg, 0, .5, 0, TOCON, 0); const an = part(new THREE.CircleGeometry(.88, 18), SMt(tex(256, 256, (g, w, h) => { g.fillStyle = "#c9a878"; g.fillRect(0, 0, w, h); for (let k = 1; k < 14; k++) { g.strokeStyle = "rgba(110,70,30,.6)"; g.lineWidth = 2; g.beginPath(); g.arc(128, 128, k * 9 + Math.sin(k) * 2, 0, 7); g.stroke() } })), 0, 1.06, 0, TOCON, 0); an.rotation.x = -Math.PI / 2;
  const nie = part(new THREE.SphereGeometry(.85, 16, 8, 0, 6.283, 0, 1.2), M_NIEVE_P, 0, .95, 0, TOCON, 0); nie.scale.y = .35 }
// montañas nevadas alrededor del valle
{ const T_MONTE = tex(1024, 1024, (g, w, h) => { const r = rng(1250); g.fillStyle = "#3a4a5e"; g.fillRect(0, 0, w, h); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#f4f8ff"); gr.addColorStop(.45, "#dfe8f4"); gr.addColorStop(.7, "rgba(80,96,120,.6)"); gr.addColorStop(1, "rgba(40,50,64,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 300; k++) { const x = r() * w, y = h * .3 + r() * h * .6; g.strokeStyle = "rgba(40,52,70,.5)"; g.lineWidth = 2 + r() * 6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 60, y + 40 + r() * 120); g.stroke() } });
  const mm = SMt(T_MONTE, { roughness: 1, fog: true }); const r = rng(1251);
  for (let k = 0; k < 16; k++) { const a = k / 16 * 6.283 + r() * .2, d = 420 + r() * 160, H = 160 + r() * 190, geo = new THREE.ConeGeometry(110 + r() * 90, H, 9, 6), p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const kk = 1 + (r() - .5) * .25; p.setX(i, p.getX(i) * kk); p.setZ(i, p.getZ(i) * kk) } geo.computeVertexNormals(); const m = part(geo, mm, Math.cos(a) * d, H / 2 - 20, Math.sin(a) * d, scene, 0); m.castShadow = false } }
// la montaña del Watcher (más cerca, detrás del bosque del norte) con una cornisa donde se para
const CORNISA = new THREE.Vector3(-30, 62, -230);
// ---------- nieve que cae (copos que dependen del tiempo: el render es determinista)
const COPOS = (() => { const n = 5000, p = new Float32Array(n * 3), base = new Float32Array(n * 4), r = rng(1260); for (let k = 0; k < n; k++) { base[k * 4] = (r() - .5) * 120; base[k * 4 + 1] = r() * 60; base[k * 4 + 2] = (r() - .5) * 120; base[k * 4 + 3] = .6 + r() * .9 }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3)); const m = new THREE.Points(g, new THREE.PointsMaterial({ map: GLOW, color: "#ffffff", size: .5, transparent: true, opacity: .85, depthWrite: false, sizeAttenuation: true })); m.frustumCulled = false; scene.add(m); m.userData.base = base; return m })();
function copos(t, c, fuerza = 1) { const p = COPOS.geometry.attributes.position.array, b = COPOS.userData.base; COPOS.visible = fuerza > 0; COPOS.material.opacity = .85 * fuerza;
  const md = (v, m) => ((v % m) + m) % m;
  for (let k = 0; k < b.length / 4; k++) { const v = b[k * 4 + 3]; p[k * 3] = c.x + md(b[k * 4] - c.x + t * 1.2 + Math.sin(t * .7 + k) * 1.5 + 60, 120) - 60; p[k * 3 + 1] = c.y - 25 + md(b[k * 4 + 1] - t * 2.4 * v, 60); p[k * 3 + 2] = c.z + md(b[k * 4 + 2] - c.z + 60, 120) - 60 }
  COPOS.geometry.attributes.position.needsUpdate = true }
// faroles con vela en las calles y ventanas cálidas (de noche)
const FAROLES = [[-3.0, 13.4], [3.4, -6], [-3.4, -16], [3.4, 11.5], [8, 2.2], [-9, 2.2]].map(([x, z]) => { const g = new THREE.Group(); enConcha(g, x, z); part(new THREE.CylinderGeometry(.07, .1, 3, 8), SM("#1a1a1e", { metalness: .5 }), 0, 1.5, 0, g, 0); const vid = part(RB(.4, .5, .4, .05), new THREE.MeshStandardMaterial({ color: "#ffe0a0", emissive: "#ffb050", emissiveIntensity: 2.2 }), 0, 3.2, 0, g, 0); const gl = glowSprite("#ffb060", 2.2); gl.material.opacity = .55; g.userData.gl = gl; return g });

// ---------- el Watcher: ciervo gigante de corteza y musgo, con cuernos más anchos que el río y ojos pálidos
const T_PELO_C = (() => { const [c, z] = pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(1300); c.fillStyle = "#3a3026"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
  for (let k = 0; k < 2600; k++) { const x = r() * w, y = r() * h, L = 20 + r() * 70; const col = r() < .7 ? `rgba(${70 + r() * 40 | 0},${56 + r() * 30 | 0},${40 + r() * 20 | 0},.7)` : `rgba(${20 + r() * 20 | 0},${16 + r() * 10 | 0},${10},.7)`; c.strokeStyle = col; c.lineWidth = 3 + r() * 5; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + (r() - .5) * 10, y + L / 2, x + (r() - .5) * 14, y + L); c.stroke();
    z.strokeStyle = r() < .5 ? "rgba(30,30,30,.5)" : "rgba(220,220,220,.4)"; z.lineWidth = 3; z.beginPath(); z.moveTo(x, y); z.lineTo(x, y + L); z.stroke() }
  for (let k = 0; k < 70; k++) { const x = r() * w, y = r() * h, s = 20 + r() * 80; for (let j = 0; j < 30; j++) { c.fillStyle = `rgba(${70 + r() * 40 | 0},${100 + r() * 50 | 0},${50 + r() * 20 | 0},${.3 + r() * .4})`; c.beginPath(); c.arc(x + (r() - .5) * s, y + (r() - .5) * s, 3 + r() * 10, 0, 7); c.fill() } } });
  [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
const M_PELO_C = new THREE.MeshStandardMaterial({ map: T_PELO_C.c, bumpMap: T_PELO_C.z, bumpScale: 6, roughness: .95 });
const M_ASTA = new THREE.MeshStandardMaterial({ color: "#cfc4aa", roughness: .7, bumpMap: T_CORTEZA, bumpScale: 2 });
const M_PEZUNA = SM("#1a1410", { roughness: .5 });
function ciervo({ escala = 1, cuernos = true, cria = false } = {}) { const G = new THREE.Group(); scene.add(G); const c = { G, patas: [] }; const pelo = cria ? new THREE.MeshStandardMaterial({ map: T_PELO_C.c, bumpMap: T_PELO_C.z, bumpScale: 3, roughness: .95, color: "#c8a070" }) : M_PELO_C;
  const raiz = new THREE.Group(); G.add(raiz); raiz.scale.setScalar(escala); c.raiz = raiz;
  const cuerpo = new THREE.Group(); cuerpo.position.y = 24; raiz.add(cuerpo); c.cuerpo = cuerpo;
  { const geo = new THREE.SphereGeometry(1, 48, 32), p = geo.attributes.position; for (let i = 0; i < p.count; i++) { let x = p.getX(i), y = p.getY(i), z = p.getZ(i); const pecho = z > .3 ? 1 + (z - .3) * .25 : 1; p.setXYZ(i, x * 5.2 * pecho, y * (y > 0 ? 5.4 : 4.6) + (z > 0 ? z * 1.2 : 0), z * 10.5) } geo.computeVertexNormals(); part(geo, pelo, 0, 0, 0, cuerpo, 0) }
  // flecos de pelo y musgo que cuelgan de la panza, del lomo y del cuello (la «pared de pelo»)
  { const fl = new THREE.InstancedMesh(new THREE.ConeGeometry(.35, 3, 5), pelo, 520), r = rng(1301); fl.castShadow = true; cuerpo.add(fl); const cc = new THREE.Color();
    for (let k = 0; k < 520; k++) { const a = r() * 6.283, z = (r() - .5) * 19, y = Math.sin(a) * 4.8, x = Math.cos(a) * 5.0; dummy.position.set(x * 1.02, y - 1.2, z); dummy.rotation.set(Math.PI + (r() - .5) * .4, r() * 6, Math.cos(a) * .5); dummy.scale.set(1, .6 + r() * 1.2, 1); dummy.updateMatrix(); fl.setMatrixAt(k, dummy.matrix); fl.setColorAt(k, cc.set(r() < .25 ? "#5a7a3a" : r() < .5 ? "#4a3a2a" : "#6a5440")) } }
  const pata = (x, z, del) => { const cad = new THREE.Group(); cad.position.set(x, -2, z); cuerpo.add(cad); part(new THREE.CylinderGeometry(1.7, 1.1, 11, 14), pelo, 0, -5.5, 0, cad, 0); const rod = new THREE.Group(); rod.position.y = -11; cad.add(rod); part(new THREE.CylinderGeometry(.9, .6, 11, 12), pelo, 0, -5.5, 0, rod, 0); part(new THREE.CylinderGeometry(.8, 1, 1.2, 12), M_PEZUNA, 0, -11.4, .2, rod, 0); c.patas.push({ cad, rod, del }); return cad };
  pata(-3.2, 7, 1); pata(3.2, 7, 1); pata(-3.2, -7.5, 0); pata(3.2, -7.5, 0);
  const cuello = new THREE.Group(); cuello.position.set(0, 3, 9); cuerpo.add(cuello); c.cuello = cuello; { const cu = part(new THREE.CylinderGeometry(2.4, 3.6, 12, 18), pelo, 0, 5, 1.5, cuello, 0); cu.rotation.x = .35;
    const fl = new THREE.InstancedMesh(new THREE.ConeGeometry(.4, 3.5, 5), pelo, 90), r = rng(1302); cuello.add(fl); for (let k = 0; k < 90; k++) { const a = r() * 3.14 + 3.14, y = r() * 10; dummy.position.set(Math.cos(a) * 3, y, 2.5 + Math.sin(a) * 1.5 + y * .3); dummy.rotation.set(Math.PI - .4, 0, (r() - .5) * .5); dummy.scale.set(1, .7 + r(), 1); dummy.updateMatrix(); fl.setMatrixAt(k, dummy.matrix) } }
  const cabeza = new THREE.Group(); cabeza.position.set(0, 11, 4.5); cuello.add(cabeza); c.cabeza = cabeza;
  { const geo = new THREE.SphereGeometry(1, 40, 28), p = geo.attributes.position; for (let i = 0; i < p.count; i++) { let x = p.getX(i), y = p.getY(i), z = p.getZ(i); const f = z > 0 ? 1 - .45 * z : 1; p.setXYZ(i, x * 2.4 * f, y * 2.5 * f - (z > 0 ? z * .8 : 0), z * 5 + 2) } geo.computeVertexNormals(); part(geo, pelo, 0, 0, 0, cabeza, 0);
    part(new THREE.SphereGeometry(.55, 20, 14), SM("#2a201a", { roughness: .4 }), 0, -1.6, 6.1, cabeza, 0).scale.set(1.3, .7, .8);
    for (const s of [-1, 1]) { const o = part(new THREE.CylinderGeometry(.9, .3, 4, 10), pelo, s * 2.6, 1.6, .2, cabeza, 0); o.rotation.z = s * -1.1; o.scale.z = .4 } }
  c.ojos = [-1, 1].map(s => { const o = part(new THREE.SphereGeometry(.62, 24, 16), cria ? SM("#0a0806", { roughness: .1 }) : new THREE.MeshStandardMaterial({ color: "#dff4ff", emissive: "#bfe6ff", emissiveIntensity: 2.4 }), s * 1.95, .7, 3.2, cabeza, 0); return o });
  if (!cria) c.brillos = c.ojos.map(o => { const g = glowSprite("#cfeaff", 3); g.material.opacity = .55; return g });
  if (cuernos) { // cuernos que se ramifican (recursivos), color hueso con musgo colgando
    const rama = (par, p0, dir, L, r0, d) => { const pts = []; const v = dir.clone().normalize(); for (let k = 0; k <= 6; k++) { const q = k / 6; pts.push(p0.clone().addScaledVector(v, L * q).add(new THREE.Vector3(0, Math.sin(q * 3) * L * .08, 0))) } const cu = new THREE.CatmullRomCurve3(pts); const m = new THREE.Mesh(new THREE.TubeGeometry(cu, 16, r0, 8), M_ASTA); m.castShadow = true; par.add(m);
      if (d < 3) { [.35, .6, .85].forEach((q, j) => { const p = cu.getPointAt(q); const nd = v.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), (j % 2 ? .7 : -.5)).add(new THREE.Vector3(0, .9, 0)).normalize(); rama(par, p, nd, L * (.55 - d * .08), r0 * .6, d + 1) }) }
      else { const mus = part(new THREE.ConeGeometry(.15, 1.6, 4), SM("#5a7a3a", { roughness: 1 }), 0, 0, 0, par, 0); mus.position.copy(cu.getPointAt(1)); mus.position.y -= .8; mus.rotation.x = Math.PI } };
    for (const s of [-1, 1]) { const g = new THREE.Group(); g.position.set(s * 1.6, 2.2, .5); cabeza.add(g); rama(g, new THREE.Vector3(0, 0, 0), new THREE.Vector3(s * 1, .9, -.3), 11, .55, 0) } }
  return c }
const WATCHER = ciervo({ escala: 1.15 }), CRIA = ciervo({ escala: .055, cuernos: false, cria: true });
if (typeof TENDEDERO !== "undefined") TENDEDERO.visible = false;
WATCHER.G.visible = CRIA.G.visible = false;
const ALIENTO = Array.from({ length: 20 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#e8eef6", transparent: true, opacity: 0, depthWrite: false })); scene.add(s); return s });
// pose: paso (caminar), echado (acostado y enroscado), cabeza (giro y baja), y respiración
function ciervoPose(c, t, { x = 0, y = 0, z = 0, ry = 0, paso = 0, echado = 0, gira = 0, baja = 0, sube = 0, aliento = 0, tiembla = 0 } = {}) { c.G.visible = true; c.G.position.set(x, y, z); c.G.rotation.set(0, ry, 0);
  const ph = t * 1.6; c.patas.forEach((p, i) => { const f = ph + (i === 0 || i === 3 ? 0 : Math.PI), s = Math.sin(f) * paso; p.cad.rotation.x = s * .45 + echado * (p.del ? -1.45 : 1.5); p.rod.rotation.x = (p.del ? Math.max(0, -Math.cos(f)) * .7 * paso : -Math.max(0, Math.cos(f)) * .6 * paso) + echado * (p.del ? 2.6 : -2.6) });
  c.cuerpo.position.y = 24 - echado * 18.5 + Math.abs(Math.sin(ph)) * .6 * paso + Math.sin(t * 1.1) * .25 + Math.sin(t * 40) * tiembla * .2; c.cuerpo.rotation.set(Math.sin(ph * 2) * .02 * paso - echado * .05, 0, Math.sin(ph) * .03 * paso + echado * .12);
  c.cuello.rotation.set(-.15 + baja * .9 - sube * .4 + echado * .5 + Math.sin(ph * 2) * .05 * paso, gira * .7, 0); c.cabeza.rotation.set(baja * .3 - sube * .2, gira * .3 + Math.sin(t * .5) * .05, 0);
  if (c.brillos) { c.G.updateMatrixWorld(true); c.ojos.forEach((o, i) => c.brillos[i].position.copy(o.getWorldPosition(V3))); c.brillos.forEach(b => b.visible = true) }
  if (aliento > 0) { c.G.updateMatrixWorld(true); const o = c.cabeza.localToWorld(new THREE.Vector3(0, -1.4, 7.4)); ALIENTO.forEach((s, i) => { const q = (t * .3 + i / 20) % 1; s.visible = true; s.position.set(o.x + Math.sin(i * 2.3) * q * 6, o.y + q * 5, o.z + q * 4); s.scale.setScalar(2 + q * 10); s.material.opacity = (1 - q) * .35 * aliento }) } }
function sinCiervos() { WATCHER.G.visible = CRIA.G.visible = false; WATCHER.brillos.forEach(b => b.visible = false); ALIENTO.forEach(s => s.visible = false) }

// ---------- adentro de nuestra cabaña (un set aparte, lejos): paredes de troncos, chimenea con fuego, cama de Mila,
// estante con tazas, ventana grande, y un techo que se puede romper
const CASA_IN = new THREE.Group(); scene.add(CASA_IN); CASA_IN.position.set(600, 200, 600);
{ const mw = SMt(T_TRONCOS(1500), { bumpMap: T_TRONCOS(1500), bumpScale: 4 }); const piso = part(new THREE.BoxGeometry(12, .3, 10), SMt(tex(512, 512, (g, w, h) => { const r = rng(1501); for (let x = 0; x < w; x += 64) vetas(g, r, x, 0, 62, h, ["#6a4a2e", "#5a3e26", "#74502e"][r() * 3 | 0], true) }), { roughness: .8 }), 0, -.15, 0, CASA_IN, 0);
  part(new THREE.BoxGeometry(12, 6, .4), mw, 0, 3, -5, CASA_IN, 0); part(new THREE.BoxGeometry(.4, 6, 10), mw, -6, 3, 0, CASA_IN, 0); part(new THREE.BoxGeometry(.4, 6, 10), mw, 6, 3, 0, CASA_IN, 0);
  // pared del frente con una ventana grande (hueco) y marco
  part(new THREE.BoxGeometry(4.5, 6, .4), mw, -3.75, 3, 5, CASA_IN, 0); part(new THREE.BoxGeometry(4.5, 6, .4), mw, 3.75, 3, 5, CASA_IN, 0); part(new THREE.BoxGeometry(3, 1.6, .4), mw, 0, .8, 5, CASA_IN, 0); part(new THREE.BoxGeometry(3, 1.6, .4), mw, 0, 5.2, 5, CASA_IN, 0);
  for (const [x, y, w, h] of [[0, 1.6, 3.2, .2], [0, 4.4, 3.2, .2], [-1.5, 3, .2, 3], [1.5, 3, .2, 3], [0, 3, .12, 2.8]]) part(new THREE.BoxGeometry(w, h, .5), SM("#3a2414"), x, y, 5, CASA_IN, 0);
  const vidrio = part(new THREE.PlaneGeometry(2.9, 2.7), new THREE.MeshPhysicalMaterial({ color: "#a8c0d8", transparent: true, opacity: .18, roughness: .05 }), 0, 3, 4.95, CASA_IN, 0);
  // techo (dos aguas) que se rompe
  const techo = new THREE.Group(); techo.position.y = 6; CASA_IN.add(techo); for (const s of [-1, 1]) { const t = part(new THREE.BoxGeometry(6.8, .3, 10.6), mw, s * 3, 1.6, 0, techo, 0); t.rotation.z = -s * .5 } CASA_IN.userData.techo = techo;
  const agujero = part(new THREE.CircleGeometry(1.6, 14), SM("#0e1626"), 2.6, 7.2, 1, CASA_IN, 0); agujero.rotation.set(Math.PI / 2, 0, .3); agujero.scale.set(1.4, 1, 1); agujero.visible = false; CASA_IN.userData.agujero = agujero;
  // chimenea de piedra con fuego
  part(new THREE.BoxGeometry(3, 6, 1.4), M_STONE, -3, 3, -4.4, CASA_IN, 0); part(new THREE.BoxGeometry(1.8, 1.4, .6), SM("#120a06"), -3, .8, -3.75, CASA_IN, 0);
  for (let k = 0; k < 4; k++) part(new THREE.CylinderGeometry(.12, .14, 1.2, 8), M_CORTEZA_P, -3.4 + k * .25, .35, -3.6, CASA_IN, 0).rotation.z = Math.PI / 2 + (k % 2 ? .3 : -.3);
  CASA_IN.userData.llamas = Array.from({ length: 14 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: T_LLAMA, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(s); return s });
  // cama con frazadas tejidas y almohada
  part(RB(2.4, .7, 4, .1), M_PLANK, 3.6, .45, -2, CASA_IN, 0); part(RB(2.3, .3, 3.9, .12), SM("#b8463a", { bumpMap: T_TRAMA, bumpScale: 3 }), 3.6, .95, -1.8, CASA_IN, 0); part(RB(1.4, .3, .8, .12), SM("#efe8da"), 3.6, 1.05, -3.6, CASA_IN, 0);
  // estante con tazas, mesa, silla rota, alfombra
  part(new THREE.BoxGeometry(2.4, .12, .5), M_PLANK, 4.4, 3.4, -4.6, CASA_IN, 0); CASA_IN.userData.tazas = [0, 1, 2, 3].map(k => { const c = new THREE.Group(); c.position.set(3.6 + k * .5, 3.62, -4.6); CASA_IN.add(c); part(new THREE.CylinderGeometry(.13, .1, .24, 14), SM(["#e8dcc0", "#3f6a8a", "#c94b4b", "#e8dcc0"][k]), 0, 0, 0, c, 0); return c });
  part(RB(1.6, .1, 1, .03), M_PLANK, -.5, 1.2, -1, CASA_IN, 0); for (const [x, z] of [[-1.2, -1.4], [.2, -1.4], [-1.2, -.6], [.2, -.6]]) part(new THREE.BoxGeometry(.1, 1.2, .1), M_BEAM, x, .6, z, CASA_IN, 0);
  part(new THREE.CircleGeometry(2, 24), SM("#6a3a5a", { bumpMap: T_TRAMA, bumpScale: 3 }), -1, .02, 1, CASA_IN, 0).rotation.x = -Math.PI / 2;
  CASA_IN.userData.copos = null }
function fuegoChimenea(t, a) { const u = CASA_IN.userData; u.llamas.forEach((s, k) => { const q = (t * (1.4 + (k % 4) * .2) + k * .37) % 1; s.visible = a > 0; s.position.set(600 - 3 + ((k * .618) % 1 - .5) * 1.2, 200.6 + q * 1.3 * a, 600 - 3.7); const sz = (1 - q * .6) * (.6 + (k % 3) * .25) * a; s.scale.set(sz, sz * 1.8, 1); s.material.opacity = (1 - q) * .9 }) }
// utilería: hacha, trineo con palitos, montaña de ramas en la puerta
const HACHA = new THREE.Group(); { part(new THREE.CylinderGeometry(.05, .06, 1.4, 8), SM("#7a5030"), 0, -.4, .1, HACHA, 0); const h = part(new THREE.BoxGeometry(.06, .35, .5), SM("#8a8e94", { metalness: .8, roughness: .3 }), 0, -1.05, .32, HACHA, 0) }
const TRINEO = new THREE.Group(); { for (const s of [-1, 1]) { const pa = part(new THREE.TorusGeometry(.8, .05, 6, 16, Math.PI / 2), SM("#2a2a2e", { metalness: .6 }), s * .35, .5, .6, TRINEO, 0); pa.rotation.y = Math.PI / 2; part(new THREE.BoxGeometry(.06, .06, 1.6), SM("#2a2a2e", { metalness: .6 }), s * .35, 0, -.2, TRINEO, 0) } part(new THREE.BoxGeometry(.9, .08, 1.7), M_PLANK, 0, .3, -.2, TRINEO, 0);
  for (let k = 0; k < 7; k++) part(new THREE.CylinderGeometry(.04, .05, 1.2, 5), M_CORTEZA_P, (k - 3) * .1, .4 + (k % 2) * .08, -.2, TRINEO, 0).rotation.x = Math.PI / 2 }
const PILA = new THREE.Group(); scene.add(PILA); { const r = rng(1510); for (let k = 0; k < 160; k++) { const L = 2 + r() * 5, m = part(new THREE.CylinderGeometry(.08 + r() * .1, .14 + r() * .12, L, 6), M_CORTEZA_P, (r() - .5) * 5, Math.pow(r(), .6) * 6, (r() - .5) * 4, PILA, 0); m.rotation.set(r() * 3, r() * 3, r() * 3) } } PILA.visible = false;

// ================= ultradetalle (revisión del dueño, 25-nov-2026) =================
// hastiales de las cabañas visibles de los dos lados (se veía el hueco del techo)
M_GABLE.forEach(m => { m.side = THREE.DoubleSide; m.needsUpdate = true });
// ---------- humo de las chimeneas (cálido, sube y se tuerce con el viento)
function humoP(t, f = 1) { HUMO_PTS.forEach((c, i) => { c.updateMatrixWorld(true); const o = new THREE.Vector3(0, 1.4, 0).applyMatrix4(c.matrixWorld); for (let k = 0; k < 4; k++) { const s = HUMO[i * 4 + k], q = (t * .22 + k / 4 + i * .13) % 1; s.visible = f > 0; s.position.set(o.x + q * 3 + Math.sin(t + k) * .3, o.y + q * 6, o.z + q * 1.2); s.scale.setScalar(1 + q * 4); s.material.opacity = (1 - q) * .32 * f; s.material.color.set("#c8ccd4") } }) }
// ---------- arbustos ultradetallados (v3): ramitas de madera que salen del piso, racimos de hojitas de pino irregulares y
// terrones de nieve encima, todo en una sola malla por material
const LIBRE_PJ = [[6.2, -37.8, 6], [2, -42.5, 6], [12.6, 40.3, 7], [16, 44, 6], [-28, 28.4, 4], [12, 37, 7], [7, 35, 4], [19.5, 39, 4], [10.5, 36.5, 4], [-26, -62, 14], [12, -32, 5]];
const M_ARB = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .9, map: tex(256, 256, (g, w, h) => { const r = rng(1702); g.fillStyle = "#2a4430"; g.fillRect(0, 0, w, h); for (let k = 0; k < 2200; k++) { const x = r() * w, y = r() * h, a = r() * 6.28; g.strokeStyle = r() < .5 ? "rgba(12,30,18,.7)" : `rgba(${70 + r() * 40 | 0},${110 + r() * 40 | 0},${70 + r() * 30 | 0},.55)`; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 7, y + Math.sin(a) * 7); g.stroke() } }, [2, 2]) });
const GEO_ARB = (() => { const r = rng(1701), ver = [], nie = [], pal = [], bola = new THREE.IcosahedronGeometry(1, 2), cono = new THREE.ConeGeometry(1, 1, 5, 1);
  { const p = bola.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = .78 + .22 * Math.abs(Math.sin(x * 9 + z * 7)) + (r() - .5) * .12; p.setXYZ(i, x * k, y * k, z * k) } bola.computeVertexNormals() }
  for (let i = 0; i < 11; i++) { const a = r() * 6.283, d = r() * .55, y = .3 + r() * .45, s = .26 + r() * .2; ver.push([bola, new THREE.Matrix4().compose(new THREE.Vector3(Math.cos(a) * d, y, Math.sin(a) * d), new THREE.Quaternion(), new THREE.Vector3(s, s * .85, s))]);
    if (y > .5 || i % 3 === 0) nie.push([bola, new THREE.Matrix4().compose(new THREE.Vector3(Math.cos(a) * d, y + s * .55, Math.sin(a) * d), new THREE.Quaternion(), new THREE.Vector3(s * .8, s * .32, s * .8))]) }
  for (let i = 0; i < 9; i++) { const a = r() * 6.283, dir = new THREE.Vector3(Math.cos(a) * .7, 1, Math.sin(a) * .7), L = .7 + r() * .4; pal.push([cono, MZ(dir.clone().normalize().multiplyScalar(L / 2), dir, new THREE.Vector3(.025, L, .025))]) }
  return [mergeG(ver), mergeG(nie), mergeG(pal)] })();
// ---------- utilería de pueblo nevado: leña apilada con nieve, barriles con tapa de nieve, cercas de troncos, coronas en las
// puertas, faroles en las ventanas, un muñeco de nieve, rocas y arbustos nevados, cuervos en los techos, huellas
{ const r = rng(1700), leña = new THREE.InstancedMesh(new THREE.CylinderGeometry(.13, .13, 1.4, 8), M_CORTEZA_P, 600), tapa = new THREE.InstancedMesh(new THREE.CylinderGeometry(.13, .13, .02, 8), SM("#c9a878", { roughness: .9 }), 1200), nie = new THREE.InstancedMesh(RB(1, .2, 1, .08), M_NIEVE_P, 80);
  [leña, tapa, nie].forEach(m => { m.castShadow = m.receiveShadow = true; TURT.add(m) }); let nl = 0, nt = 0, nn = 0;
  [...CASAS, NUESTRA, ESCUELA, PANADERIA].forEach((H, hi) => { if (!H.g.visible) return; H.g.updateMatrix(); const Wd = H.Wd ?? 6.4, Dp = H.Dp ?? 6.2, lado = hi % 2 ? 1 : -1;
    for (let f = 0; f < 4; f++) for (let c = 0; c < 6; c++) { const lx = lado * (Wd / 2 + .3), lz = -Dp / 2 + .8 + c * .28 + (f % 2) * .14, ly = .15 + f * .25; V3.set(lx, 0, lz).applyMatrix4(H.g.matrix); const y = SY(V3.x, V3.z) + ly; dummy.position.set(V3.x, y, V3.z); dummy.rotation.set(Math.PI / 2, H.g.rotation.y, 0); dummy.scale.set(1, 1, 1); dummy.updateMatrix(); if (nl < 600) leña.setMatrixAt(nl++, dummy.matrix);
      for (const e of [-.7, .7]) { const v = new THREE.Vector3(lx + lado * 0, 0, lz).applyMatrix4(H.g.matrix); const off = new THREE.Vector3(Math.cos(H.g.rotation.y) * e, 0, -Math.sin(H.g.rotation.y) * e); dummy.position.set(v.x + off.x, y, v.z + off.z); dummy.rotation.set(0, H.g.rotation.y, Math.PI / 2); dummy.updateMatrix(); if (nt < 1200) tapa.setMatrixAt(nt++, dummy.matrix) } }
    { const v = new THREE.Vector3(lado * (Wd / 2 + .3), 0, -Dp / 2 + 1.5).applyMatrix4(H.g.matrix); dummy.position.set(v.x, SY(v.x, v.z) + 1.15, v.z); dummy.rotation.set(0, H.g.rotation.y, 0); dummy.scale.set(.8, 1, 1.8); dummy.updateMatrix(); nie.setMatrixAt(nn++, dummy.matrix) }
    // corona de pino con moño rojo en la puerta
    const co = part(new THREE.TorusGeometry(.32, .1, 8, 20), M_AGUJAS, H.door ?? 0, 2.6, 3.36, H.g, 0); part(new THREE.SphereGeometry(.08, 8, 6), SM("#b8302a"), (H.door ?? 0), 2.32, 3.45, H.g, 0) });
  leña.count = nl; tapa.count = nt; nie.count = nn;
  // rocas y arbustos nevados al borde de la loma y en el bosque
  const roca = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 1), SMt(T_CORTEZA, { color: "#7a7a80", roughness: 1 }), 160), capa = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 6, 0, 6.283, 0, 1.3), M_NIEVE_P, 160), arb = new THREE.InstancedMesh(GEO_ARB[0], M_ARB, 220), arbn = new THREE.InstancedMesh(GEO_ARB[1], M_NIEVE_P, 220), arbr = new THREE.InstancedMesh(GEO_ARB[2], M_CORTEZA_P, 220);
  // nada de utilería donde se paran los personajes ni donde está la cámara (pedido del dueño: Brask quedaba adentro de un arbusto)
  const libreP = (x, z) => LIBRE_PJ.every(([a, b, rr]) => (a - x) ** 2 + (b - z) ** 2 > rr * rr);
  [roca, capa, arb, arbn, arbr].forEach(m => { m.castShadow = m.receiveShadow = true; scene.add(m) });
  let nro = 0; for (let k = 0; k < 160; k++) { const a = r() * 6.283, d = 30 + r() * 60, x = Math.cos(a) * d, z = Math.sin(a) * d * 1.2, s = .5 + r() * 1.6; if (!libreP(x, z)) continue; const k0 = k; k = nro++; dummy.position.set(x, s * .3, z); dummy.rotation.set(r(), r() * 6, r()); dummy.scale.set(s * 1.3, s * .8, s); dummy.updateMatrix(); roca.setMatrixAt(k, dummy.matrix); dummy.position.y = s * .75; dummy.rotation.set(0, r() * 6, 0); dummy.scale.set(s * 1.2, s * .4, s * .9); dummy.updateMatrix(); capa.setMatrixAt(k, dummy.matrix); k = k0 } roca.count = capa.count = nro;
  let nb = 0; for (let k = 0; k < 220; k++) { const a = r() * 6.283, d = 32 + r() * 50, x = Math.cos(a) * d, z = Math.sin(a) * d * 1.2, s = .6 + r() * 1.1; if (!libreP(x, z)) continue; dummy.position.set(x, 0, z); dummy.rotation.set(0, r() * 6, 0); dummy.scale.set(s, s * (.8 + r() * .3), s); dummy.updateMatrix(); arb.setMatrixAt(nb, dummy.matrix); arbn.setMatrixAt(nb, dummy.matrix); arbr.setMatrixAt(nb, dummy.matrix); arb.setColorAt(nb, new THREE.Color("#ffffff").multiplyScalar(.7 + r() * .45)); nb++ } arb.count = arbn.count = arbr.count = nb;
  // cerca de troncos con nieve encima alrededor de la plaza
  const poste = new THREE.InstancedMesh(new THREE.CylinderGeometry(.09, .11, 1.3, 8), M_CORTEZA_P, 90), riel = new THREE.InstancedMesh(new THREE.CylinderGeometry(.06, .06, 1.6, 6), M_CORTEZA_P, 180), pn = new THREE.InstancedMesh(new THREE.SphereGeometry(.13, 8, 4, 0, 6.283, 0, 1.4), M_NIEVE_P, 90);
  [poste, riel, pn].forEach(m => { m.castShadow = true; TURT.add(m) }); let np = 0, nr = 0;
  [[-14, 6, -14, 20], [14, 6, 14, -4], [-12, -26, 12, -26]].forEach(([x0, z0, x1, z1]) => { const n = Math.round(Math.hypot(x1 - x0, z1 - z0) / 1.6); for (let k = 0; k <= n && np < 90; k++) { const x = lerp(x0, x1, k / n), z = lerp(z0, z1, k / n), y = SY(x, z); dummy.rotation.set(0, 0, (r() - .5) * .1); dummy.scale.set(1, 1, 1); dummy.position.set(x, y + .6, z); dummy.updateMatrix(); poste.setMatrixAt(np, dummy.matrix); dummy.position.set(x, y + 1.28, z); dummy.updateMatrix(); pn.setMatrixAt(np, dummy.matrix); np++;
      if (k < n) for (const h of [.45, .95]) { const xm = lerp(x0, x1, (k + .5) / n), zm = lerp(z0, z1, (k + .5) / n); dummy.position.set(xm, SY(xm, zm) + h, zm); dummy.rotation.set(0, -Math.atan2(z1 - z0, x1 - x0), Math.PI / 2); dummy.updateMatrix(); riel.setMatrixAt(nr++, dummy.matrix) } } });
  poste.count = pn.count = np; riel.count = nr;
  // muñeco de nieve con bufanda y gorro
  const mu = new THREE.Group(); enConcha(mu, 4.4, -2.6, -.6); [[.7, .6], [.5, 1.6], [.36, 2.35]].forEach(([rr, y]) => part(new THREE.SphereGeometry(rr, 20, 14), M_NIEVE_P, 0, y, 0, mu, 0)); part(new THREE.ConeGeometry(.06, .35, 8), SM("#e07020"), 0, 2.35, .5, mu, 0).rotation.x = Math.PI / 2; for (const s of [-1, 1]) part(new THREE.SphereGeometry(.04, 8, 6), SM("#111"), s * .12, 2.45, .33, mu, 0); part(new THREE.TorusGeometry(.42, .08, 8, 18), SM("#b8302a", { bumpMap: T_TRAMA, bumpScale: 3 }), 0, 2.05, 0, mu, 0).rotation.x = Math.PI / 2; for (const s of [-1, 1]) part(new THREE.CylinderGeometry(.03, .04, .9, 5), M_CORTEZA_P, s * .7, 1.75, 0, mu, 0).rotation.z = s * 1.0;
  // cuervos en los techos
  const neg = SM("#121216", { roughness: .4 }); [[CASAS[2], -1], [CASAS[5], 1], [CASAS[0], .5], [ESCUELA, -.5], [NUESTRA, 1.4]].forEach(([H, x], i) => { const c = new THREE.Group(); H.g.add(c); c.position.set(x, (H.Hh ?? 5) + 2.55, 0); part(RB(.22, .22, .4, .08), neg, 0, 0, 0, c, 0); part(RB(.16, .16, .16, .05), neg, 0, .14, .2, c, 0); part(new THREE.ConeGeometry(.04, .14, 4), SM("#2a2a2a"), 0, .13, .33, c, 0).rotation.x = Math.PI / 2; c.rotation.y = i * 1.3 }) }
{ const r = rng(1799); for (let k = 0; k < 14; k++) { const m = part(new THREE.CylinderGeometry(.05 + r() * .05, .08 + r() * .05, 1.2 + r() * 1.6, 6), M_CORTEZA_P, -28 + (r() - .5) * 6, .15, 28.4 + (r() - .5) * 6, scene, 0); m.rotation.set(1.2 + r() * .5, r() * 6, (r() - .5) * .6); const n = part(new THREE.SphereGeometry(.35 + r() * .4, 10, 6, 0, 6.283, 0, 1.4), M_NIEVE_P, m.position.x + (r() - .5), 0, m.position.z + (r() - .5), scene, 0); n.scale.y = .45 } }
// afuera de la ventana de adentro: nieve, cerca y pinos (al cruzar la ventana se ve el pueblo, no un vacío)
{ const G = CASA_IN, r = rng(1798); const pl = part(new THREE.PlaneGeometry(80, 60), M_NIEVE, 0, -.02, 35, G, 0); pl.rotation.x = -Math.PI / 2;
  for (let k = 0; k < 18; k++) { let x = (r() - .5) * 60; const z = 14 + r() * 40, H = 9 + r() * 10; if (Math.abs(x) < 6 && z < 26) x += x < 0 ? -7 : 7; part(new THREE.CylinderGeometry(.25, .4, H * .4, 8), M_CORTEZA_P, x, H * .2, z, G, 0); for (let j = 0; j < 6; j++) { const q = j / 5, rr = H * (.3 - q * .22), hh = H * (.17 - q * .06), y = H * (.2 + q * .62); part(GEO_PISO2, M_AGUJAS, x, y, z, G, 0).scale.set(rr, hh, rr); part(GEO_NIEVE2, M_NIEVE_P, x, y, z, G, 0).scale.set(rr, hh, rr) } }
  for (let k = 0; k < 8; k++) part(new THREE.CylinderGeometry(.08, .1, 1.2, 6), M_CORTEZA_P, -6 + k * 1.7, .6, 9, G, 0); part(new THREE.CylinderGeometry(.05, .05, 12, 6), M_CORTEZA_P, 0, .9, 9, G, 0).rotation.z = Math.PI / 2 }
// ---------- árboles pelados con nieve en las ramas (variedad entre los pinos)
{ const r = rng(1750), M_RAMA = SMt(T_CORTEZA, { color: "#8a8078", roughness: 1 }), geo = new THREE.CylinderGeometry(.5, 1, 1, 6);
  const ramas = new THREE.InstancedMesh(geo, M_RAMA, 1600), nev = new THREE.InstancedMesh(new THREE.CylinderGeometry(.45, .9, 1, 6, 1, false, 0, Math.PI), M_NIEVE_P, 1600); [ramas, nev].forEach(m => { m.castShadow = true; scene.add(m) }); let n = 0;
  const rama = (p, dir, L, rad, d) => { if (n >= 1600) return; const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); dummy.quaternion.copy(q); dummy.position.copy(p).addScaledVector(dir, L / 2); dummy.scale.set(rad, L, rad); dummy.updateMatrix(); ramas.setMatrixAt(n, dummy.matrix); dummy.position.y += rad * .6; dummy.scale.set(rad * 1.05, L * .9, rad * 1.05); dummy.updateMatrix(); nev.setMatrixAt(n, dummy.matrix); n++;
    if (d < 4) { const e = p.clone().addScaledVector(dir, L); for (let k = 0; k < 2 + (r() < .4 ? 1 : 0); k++) { const nd = dir.clone().add(new THREE.Vector3((r() - .5) * 1.3, r() * .5, (r() - .5) * 1.3)).normalize(); rama(e, nd, L * (.62 + r() * .12), rad * .62, d + 1) } } };
  for (let k = 0; k < 45; k++) { const a = r() * 6.283, d = 40 + r() * 70; rama(new THREE.Vector3(Math.cos(a) * d, 0, Math.sin(a) * d * 1.2), new THREE.Vector3(0, 1, 0), 5 + r() * 3, .35, 0) } ramas.count = nev.count = n }
// ---------- la chimenea de verdad: hogar hondo de piedra con fondo ennegrecido, troncos cruzados con brasas, cama de
// brasas que titila, llamas en varias capas de profundidad, chispas y el resplandor en el piso
const HOGAR = (() => { const G = new THREE.Group(); CASA_IN.add(G); G.position.set(-3, 0, -4.4);
  part(new THREE.BoxGeometry(3.4, .4, 2.0), M_STONE, 0, .2, .6, G, 0);
  for (const s of [-1, 1]) part(new THREE.BoxGeometry(.6, 2.2, 1.4), M_STONE, s * 1.2, 1.3, .3, G, 0);
  part(new THREE.BoxGeometry(3.2, .5, 1.5), M_STONE, 0, 2.6, .3, G, 0); part(new THREE.BoxGeometry(3.6, .2, 1.8), M_PLANK, 0, 2.95, .4, G, 0);
  const fondo = part(new THREE.PlaneGeometry(1.8, 1.9), new THREE.MeshStandardMaterial({ color: "#1a0e08", emissive: "#ff5a10", emissiveIntensity: .0, roughness: 1, map: tex(256, 256, (g, w, h) => { const r = rng(1760); g.fillStyle = "#1a120c"; g.fillRect(0, 0, w, h); for (let k = 0; k < 80; k++) { g.fillStyle = `rgba(0,0,0,${.3 + r() * .5})`; g.beginPath(); g.ellipse(r() * w, r() * h * .8, 20 + r() * 40, 10 + r() * 30, 0, 0, 7); g.fill() } }) }), 0, 1.35, -.35, G, 0);
  const brasa = new THREE.MeshStandardMaterial({ color: "#3a1206", emissive: "#ff4a08", emissiveIntensity: 1.6, roughness: .8 }), troncos = [];
  [[-.3, .55, .45, .5], [.3, .55, .5, -.45], [0, .75, .35, 1.4], [-.1, .5, .8, -1.2]].forEach(([x, y, z, ry]) => { const t = part(new THREE.CylinderGeometry(.13, .15, 1.3, 10), M_CORTEZA_P, x, y, z, G, 0); t.rotation.set(Math.PI / 2, ry, .2); troncos.push(t); for (const e of [-1, 1]) { const c = part(new THREE.CircleGeometry(.13, 10), brasa, 0, e * .66, 0, t, 0); c.rotation.x = e * Math.PI / 2 } });
  const cama = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.07, 0), brasa, 120), r = rng(1761); G.add(cama); for (let k = 0; k < 120; k++) { dummy.position.set((r() - .5) * 1.4, .42, .2 + r() * .8); dummy.rotation.set(r() * 3, r() * 3, r() * 3); dummy.scale.setScalar(.6 + r()); dummy.updateMatrix(); cama.setMatrixAt(k, dummy.matrix) }
  const brillo = part(new THREE.CircleGeometry(2.4, 32), new THREE.MeshBasicMaterial({ color: "#ff8a30", transparent: true, opacity: .25, blending: THREE.AdditiveBlending, depthWrite: false }), 0, .02, 1.8, G, 0); brillo.rotation.x = -Math.PI / 2;
  const chispas = Array.from({ length: 16 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#ffb040", transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); s.scale.setScalar(.06); G.add(s); return s });
  // utensilios: atizador, pala, olla colgando, leñero
  part(new THREE.CylinderGeometry(.02, .02, 1.2, 6), SM("#222", { metalness: .7 }), 1.7, .6, 1.2, G, 0).rotation.z = .2; const olla = part(new THREE.SphereGeometry(.28, 16, 10, 0, 6.283, 0, 1.9), SM("#1a1a1c", { metalness: .6, roughness: .4 }), -.9, .9, .7, G, 0);
  part(new THREE.BoxGeometry(.9, .5, .6), M_PLANK, 2.4, .25, 1.4, G, 0);
  return { G, fondo, brasa, cama, brillo, chispas } })();
function hogar(t, a) { const h = HOGAR; h.brasa.emissiveIntensity = (.25 + a * 1.4) * (.85 + .15 * Math.sin(t * 9)); h.fondo.material.emissiveIntensity = a * .35 * (.8 + .2 * Math.sin(t * 7)); h.brillo.material.opacity = .28 * a;
  h.chispas.forEach((s, k) => { const q = (t * .7 + k / 16) % 1; s.visible = a > .3; s.position.set(Math.sin(k * 2.1 + t) * .4, .7 + q * 2.2, .5 + Math.cos(k) * .2); s.material.opacity = (1 - q) * a }) }
// la chimenea vieja (la caja plana) se esconde: la reemplaza el hogar
CASA_IN.children.forEach(o => { if (o.isMesh && o.geometry.type === "BoxGeometry" && Math.abs(o.position.x + 3) < .01 && (Math.abs(o.position.z + 4.4) < .01 || Math.abs(o.position.z + 3.75) < .01)) o.visible = false });
// ---------- paredes de adentro con cosas y luz: faroles de pared, estantes con frascos, hierbas colgadas, abrigos en
// percheros, un cuadro, cortinas, escoba, vela en la mesa, piel en el piso
const LUCES_IN = [];
{ const G = CASA_IN, r = rng(1770), vid = new THREE.MeshStandardMaterial({ color: "#ffe2a8", emissive: "#ffb050", emissiveIntensity: 1.8 });
  [[-5.75, 3.4, -1], [5.75, 3.4, 1.5], [-1, 3.6, -4.75]].forEach(([x, y, z]) => { const f = new THREE.Group(); f.position.set(x, y, z); G.add(f); part(RB(.3, .42, .3, .03), vid, 0, 0, 0, f, 0); part(new THREE.BoxGeometry(.36, .06, .36), SM("#2a2a2a", { metalness: .5 }), 0, .24, 0, f, 0); LUCES_IN.push(f) });
  const est = (x, y, z, ry, n) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; G.add(g); part(new THREE.BoxGeometry(2, .08, .4), M_PLANK, 0, 0, 0, g, 0); for (let k = 0; k < n; k++) { const c = ["#6a8aa0", "#a86a3a", "#8a9a6a", "#c9b48a", "#7a3a3a"][k % 5]; const j = part(new THREE.CylinderGeometry(.09 + r() * .05, .1, .25 + r() * .2, 12), new THREE.MeshPhysicalMaterial({ color: c, roughness: .2, transmission: .3, transparent: true, opacity: .9 }), -.8 + k * .32, .2, 0, g, 0); part(new THREE.CylinderGeometry(.1, .1, .05, 12), SM("#5a3a20"), -.8 + k * .32, .36 + (j.geometry.parameters.height - .25) / 2, 0, g, 0) } };
  est(-5.7, 2.4, 1.6, Math.PI / 2, 6); est(1.5, 2.6, -4.75, 0, 5);
  for (let k = 0; k < 7; k++) { const h = part(new THREE.ConeGeometry(.1, .5, 6), SM(["#5a7a3a", "#7a8a4a", "#8a6a3a"][k % 3], { roughness: 1 }), -1.8 + k * .4, 4.6, 4.6, G, 0); h.rotation.x = Math.PI } part(new THREE.CylinderGeometry(.02, .02, 3, 4), SM("#c9b48a"), -.6, 4.85, 4.6, G, 0).rotation.z = Math.PI / 2;
  [[4.6, "#2e4a6a"], [5.2, "#6a3a2a"]].forEach(([x, c]) => { part(RB(.7, 1.3, .25, .08), SM(c, { bumpMap: T_TRAMA, bumpScale: 3, roughness: 1 }), x, 2.6, 4.7, G, 0); part(new THREE.CylinderGeometry(.03, .03, .2, 6), M_PLANK, x, 3.3, 4.8, G, 0).rotation.x = Math.PI / 2 });
  const cuadro = part(new THREE.BoxGeometry(1.2, .9, .06), M_PLANK, 2.6, 3.6, -4.77, G, 0); part(new THREE.PlaneGeometry(1, .7), SMt(tex(256, 192, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#3a4a6a"); gr.addColorStop(1, "#c8d4e8"); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = "#1a2a1a"; for (let k = 0; k < 9; k++) { g.beginPath(); g.moveTo(k * 30 + 10, h); g.lineTo(k * 30 + 25, h * .4); g.lineTo(k * 30 + 40, h); g.fill() } })), 2.6, 3.6, -4.73, G, 0);
  for (const s of [-1, 1]) { const cu = part(new THREE.PlaneGeometry(.9, 3, 8, 1), new THREE.MeshStandardMaterial({ color: "#8a2a2a", side: THREE.DoubleSide, roughness: 1, bumpMap: T_TRAMA, bumpScale: 2 }), s * 1.9, 3, 4.72, G, 0); const p = cu.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 9) * .06); cu.geometry.computeVertexNormals() }
  part(new THREE.CylinderGeometry(.03, .03, 1.8, 6), M_PLANK, -5.4, .9, 3.6, G, 0).rotation.z = .2; part(new THREE.ConeGeometry(.25, .5, 10), SM("#c9a860", { roughness: 1 }), -5.25, .2, 3.6, G, 0);
  const vela = part(new THREE.CylinderGeometry(.06, .06, .3, 10), SM("#efe6d0"), -.5, 1.4, -1, G, 0); const ll = new THREE.Sprite(new THREE.SpriteMaterial({ map: T_LLAMA, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); ll.scale.set(.12, .22, 1); ll.position.set(-.5, 1.66, -1); G.add(ll);
  const piel = part(new THREE.CircleGeometry(1.2, 20), SM("#d8c8a8", { bumpMap: T_PELO_C.z, bumpScale: 4, roughness: 1 }), 1.6, .03, 1.6, G, 0); piel.rotation.x = -Math.PI / 2; piel.scale.set(1.4, 1, 1);
  // vigas del techo y una mecedora
  for (let k = 0; k < 4; k++) part(new THREE.BoxGeometry(12, .3, .3), M_BEAM, 0, 5.4, -3.6 + k * 2.4, G, 0);
  const mec = new THREE.Group(); mec.position.set(-3.6, 0, 1.6); mec.rotation.y = .8; G.add(mec); part(new THREE.BoxGeometry(.9, .08, .8), M_PLANK, 0, .6, 0, mec, 0); part(new THREE.BoxGeometry(.9, 1, .08), M_PLANK, 0, 1.1, -.4, mec, 0); for (const s of [-1, 1]) part(new THREE.TorusGeometry(.6, .04, 6, 16, Math.PI * .6), M_PLANK, s * .42, .55, 0, mec, 0).rotation.set(Math.PI / 2 + Math.PI, Math.PI / 2, 0) }
// ---------- el ojo enorme ultra detallado (como la referencia del dueño): esclerótica con venitas y grietas, iris ámbar con
// fibras radiales y anillo oscuro, pupila honda, córnea mojada que refleja, párpados de corteza escamosa con musgo
const T_IRIS3 = tex(1024, 1024, (g, w, h) => { const r = rng(1780), cx = w / 2, cy = h / 2, R = 430; g.fillStyle = "#d8ccb8"; g.fillRect(0, 0, w, h);
  for (let k = 0; k < 120; k++) { let x = r() * w, y = r() * h; g.strokeStyle = `rgba(${160 + r() * 60 | 0},40,30,${.25 + r() * .4})`; g.lineWidth = 1 + r() * 3; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 10; s++) { x += (r() - .5) * 50; y += (r() - .5) * 50; g.lineTo(x, y) } g.stroke() }
  const gr = g.createRadialGradient(cx, cy, 40, cx, cy, R); gr.addColorStop(0, "#1a0a02"); gr.addColorStop(.22, "#6a2a06"); gr.addColorStop(.45, "#c86a18"); gr.addColorStop(.7, "#e09a40"); gr.addColorStop(.9, "#a85010"); gr.addColorStop(1, "#3a1404"); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
  for (let k = 0; k < 1600; k++) { const a = r() * 6.283, r0 = R * (.24 + r() * .15), r1 = R * (.55 + r() * .44); g.strokeStyle = r() < .55 ? `rgba(255,${190 + r() * 60 | 0},${100 + r() * 60 | 0},${.12 + r() * .3})` : `rgba(60,${20 + r() * 20 | 0},4,${.15 + r() * .3})`; g.lineWidth = 1 + r() * 2.5; g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); g.quadraticCurveTo(cx + Math.cos(a + .05) * (r0 + r1) / 2, cy + Math.sin(a + .05) * (r0 + r1) / 2, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); g.stroke() }
  for (let k = 0; k < 60; k++) { const a = r() * 6.283, rr = R * (.5 + r() * .4); g.fillStyle = "rgba(50,16,2,.45)"; g.beginPath(); g.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 4 + r() * 14, 0, 7); g.fill() }
  g.strokeStyle = "rgba(20,6,0,.9)"; g.lineWidth = 34; g.beginPath(); g.arc(cx, cy, R - 16, 0, 7); g.stroke();
  g.fillStyle = "#020100"; g.beginPath(); g.ellipse(cx, cy, R * .3, R * .33, 0, 0, 7); g.fill() });
function construirOjo() { [...OJO.children].forEach(c => OJO.remove(c)); const G = OJO;
  const T_ESCL = tex(512, 256, (g, w, h) => { const r = rng(1782); g.fillStyle = "#d8ccb4"; g.fillRect(0, 0, w, h); for (let k = 0; k < 40; k++) { let x = r() * w, y = r() * h; g.strokeStyle = `rgba(${150 + r() * 70 | 0},30,24,${.15 + r() * .25})`; g.lineWidth = .8 + r() * 1.5; g.beginPath(); g.moveTo(x, y); for (let q = 0; q < 9; q++) { x += (r() - .5) * 40; y += (r() - .5) * 30; g.lineTo(x, y) } g.stroke() } });
  const ojo = new THREE.Mesh(new THREE.SphereGeometry(1.7, 64, 48), new THREE.MeshPhysicalMaterial({ map: T_ESCL, roughness: .3, emissive: "#3a1006", emissiveIntensity: .3 })); ojo.position.z = -1.6; G.add(ojo); OJO.userData.ojo = ojo;
  const iris = new THREE.Mesh(new THREE.CircleGeometry(1.25, 64), new THREE.MeshPhysicalMaterial({ map: T_IRIS3, roughness: .25, emissive: "#ff7020", emissiveMap: T_IRIS3, emissiveIntensity: .45 })); iris.rotation.y = Math.PI; iris.position.z = -3.3; G.add(iris);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1.3, 40, 20, 0, 6.283, 0, .75), new THREE.MeshPhysicalMaterial({ color: "#ffffff", transparent: true, opacity: .1, roughness: 0, clearcoat: 1, depthWrite: false })); dome.rotation.x = -Math.PI / 2; dome.position.z = -2.85; G.add(dome);
  const cornea = part(new THREE.SphereGeometry(1.76, 48, 32), new THREE.MeshPhysicalMaterial({ color: "#ffffff", transparent: true, opacity: .12, roughness: 0, clearcoat: 1, clearcoatRoughness: 0, depthWrite: false }), 0, 0, -1.6, G, 0);
  const T_ESC = tex(512, 512, (g, w, h) => { const r = rng(1781); g.fillStyle = "#2a2018"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 18) for (let x = (y / 18) % 2 * 14; x < w; x += 28) { const gr = g.createRadialGradient(x - 3, y - 3, 1, x, y, 14); gr.addColorStop(0, rgbj("#7a6448", r, 30)); gr.addColorStop(1, "#1a120a"); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, 13, 10, 0, 0, 7); g.fill() } for (let k = 0; k < 60; k++) { g.fillStyle = `rgba(${70 + r() * 40 | 0},${110 + r() * 40 | 0},50,.5)`; g.beginPath(); g.arc(r() * w, r() * h, 4 + r() * 14, 0, 7); g.fill() } }, [3, 2]);
  const M_ESC = SMt(T_ESC, { bumpMap: T_ESC, bumpScale: 5, roughness: .7 });
  const cara = part(new THREE.SphereGeometry(4.2, 48, 32), M_ESC, 0, 0, 2.4, G, 0); cara.scale.set(1.3, 1, 1);
  for (const s of [-1, 1]) { const p = part(new THREE.TorusGeometry(1.85, .5, 14, 40, Math.PI), M_ESC, 0, s * .15, -1.5, G, 0); p.rotation.set(0, 0, s > 0 ? 0 : Math.PI); p.scale.set(1.15, .7, 1); OJO.userData[s > 0 ? "sup" : "inf"] = p } }
// ---------- el cuerno que rompe el techo: astillas de tablas y nieve que entra
const TABLAS_ROTAS = Array.from({ length: 10 }, (_, k) => { const m = part(new THREE.BoxGeometry(.15, .04, .9), M_PLANK, 0, 0, 0, CASA_IN, 0); m.visible = false; return m });
// ---------- v3: techo de adentro de verdad (pedido del dueño: «rellená la parte que no está rellena»): tablas una por una
// en tres tramos, los dos hastiales triangulares cerrados con troncos, cumbrera, cabios y un agujero real sobre la cama
CASA_IN.userData.techo.visible = false; CASA_IN.userData.agujero.visible = false;
const HUECO_TECHO = [];
{ const G = CASA_IN, r = rng(1790), mw = SMt(T_TRONCOS(1501), { bumpMap: T_TRONCOS(1501), bumpScale: 4 }), M_TAB = [0, 1, 2].map(i => SMt(tex(512, 128, (g, w, h) => { const rr = rng(1791 + i); vetas(g, rr, 0, 0, w, h, ["#6a4a2e", "#5a3e26", "#74502e"][i], false); g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(0, 0, w, 4); g.fillRect(0, h - 4, w, 4); for (let k = 0; k < 3; k++) { g.fillStyle = "#1a1410"; g.beginPath(); g.arc(rr() * w, h / 2, 5, 0, 7); g.fill() } }), { bumpScale: 2, roughness: .85 }));
  const ang = .5, sl = 6.8;
  for (const s of [-1, 1]) { const lado = new THREE.Group(); lado.position.set(s * 3, 7.6, 0); lado.rotation.z = -s * ang; G.add(lado);
    for (let i = 0; i < 24; i++) { const z = -5.3 + .22 + i * .4425; for (let j = 0; j < 3; j++) { const x = -sl / 2 + sl / 6 + j * sl / 3, m = part(RB(sl / 3 - .03, .12, .42, .02), M_TAB[(i + j) % 3], x, (r() - .5) * .03, z, lado, 0); m.rotation.y = (r() - .5) * .01;
      if (s > 0 && z > -3.4 && z < -.3 && j === 1) HUECO_TECHO.push(m) } }
    // tejas de madera por arriba (para que desde el agujero se vea el espesor) y cabios por abajo
    part(new THREE.BoxGeometry(sl, .08, 10.6), SM("#2a1c12"), 0, .1, 0, lado, 0).userData.tapa = s;
    for (const z of [-4.6, -2.3, 0, 2.3, 4.6]) part(new THREE.BoxGeometry(sl, .22, .22), M_BEAM, 0, -.17, z, lado, 0) }
  // la capa de arriba tiene su propio hueco: se arma en dos tiras cuando el techo se rompe
  G.children.filter(o => o.isGroup && o.children.some(c => c.userData.tapa === 1)).forEach(lado => { const t = lado.children.find(c => c.userData.tapa === 1); t.visible = false; for (const [z0, z1] of [[-5.3, -3.4], [-.3, 5.3]]) part(new THREE.BoxGeometry(sl, .08, z1 - z0), SM("#2a1c12"), 0, .1, (z0 + z1) / 2, lado, 0); for (const x of [-sl / 2 + sl / 6, sl / 2 - sl / 6]) { const m = part(new THREE.BoxGeometry(sl / 3, .08, 3.1), SM("#2a1c12"), x, .1, -1.85, lado, 0) } const tapaH = part(new THREE.BoxGeometry(sl / 3, .08, 3.1), SM("#2a1c12"), 0, .1, -1.85, lado, 0); HUECO_TECHO.push(tapaH) });
  // hastiales: triángulo de troncos atrás y adelante (antes se veía el cielo por ahí)
  const tri = new THREE.Shape(); tri.moveTo(-6.2, 0); tri.lineTo(6.2, 0); tri.lineTo(0, 3.35); tri.closePath();
  for (const z of [-4.82, 4.82]) { const geo = new THREE.ShapeGeometry(tri); const p = geo.attributes.position, uv = geo.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + 6.2) / 12.4 * 2, p.getY(i) / 6 * 1); const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: mw.map, bumpMap: mw.map, bumpScale: 4, side: THREE.DoubleSide, roughness: .9 })); m.position.set(0, 6, z); m.receiveShadow = true; G.add(m) }
  part(new THREE.BoxGeometry(.4, .4, 10.6), M_BEAM, 0, 9.15, 0, G, 0);
  // astillas que cuelgan del borde del agujero (se ven solo cuando está roto)
  CASA_IN.userData.astillas = Array.from({ length: 12 }, (_, k) => { const m = part(new THREE.BoxGeometry(.06, .7 + r() * .6, .14), M_TAB[k % 3], 0, 0, 0, G, 0); const z = -3.4 + r() * 3.1, x = k % 2 ? 1.9 : 4.1; m.position.set(x + (r() - .5) * .3, 7.6 - (x - 3) * .55 - .4, z); m.rotation.set((r() - .5) * .6, 0, (r() - .5) * .8); m.visible = false; return m }) }
// el cuerno de verdad (copia del cuerno del Watcher) que entra por el agujero, y la nieve que cae sobre la cama
const ASTA_REAL = (() => { const orig = WATCHER.cabeza.children.find(c => c.isGroup && c.children.length > 3); const g = orig.clone(); g.scale.setScalar(.9); const piv = new THREE.Group(); piv.add(g); CASA_IN.add(piv); piv.visible = false; g.rotation.set(Math.PI * .85, 0, .3); const v = new THREE.Vector3(-1, .9, -.3).normalize().applyEuler(g.rotation); g.position.copy(v.multiplyScalar(-11 * .9 + 1.9)); piv.position.set(3.1, 7.4, -1.85); return piv })();
const NIEVE_IN = Array.from({ length: 60 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#ffffff", transparent: true, opacity: .9, depthWrite: false })); s.scale.setScalar(.09); s.visible = false; CASA_IN.add(s); return s });
function techoRoto(t, roto, q = 1) { HUECO_TECHO.forEach(m => m.visible = !roto); CASA_IN.userData.astillas.forEach(m => m.visible = roto);
  NIEVE_IN.forEach((s, i) => { const u = (t * .45 + i / 60) % 1; s.visible = roto && q > .2 && lineAt(t) === I.roof; s.position.set(2.2 + ((i * .618) % 1) * 2.4 + Math.sin(t * 2 + i) * .15, 7 - u * 6, -3 + ((i * .37) % 1) * 2.6) }) }
// ---------- v4 (pedido del dueño): la iglesia tenía abiertos los triángulos de las puntas del techo; se cierran con piedra,
// con una ventanita redonda iluminada y una moldura de madera
{ const tri = new THREE.Shape(); tri.moveTo(-3.95, 0); tri.lineTo(3.95, 0); tri.lineTo(0, 3.35); tri.closePath(); const ms = M_STONE.clone(); ms.side = THREE.DoubleSide;
  for (const z of [-5.52, 5.52]) { const geo = new THREE.ShapeGeometry(tri), p = geo.attributes.position, uv = geo.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + 4) / 3, p.getY(i) / 3); const m = new THREE.Mesh(geo, ms); m.position.set(0, 7, z); m.castShadow = m.receiveShadow = true; IGLESIA.add(m);
    const s = Math.sign(z); const ro = part(new THREE.TorusGeometry(.42, .09, 8, 20), M_BEAM, 0, 8.3, z + s * .06, IGLESIA, 0); const vi = part(new THREE.CircleGeometry(.4, 20), new THREE.MeshStandardMaterial({ color: "#ffe0a0", emissive: "#ffb050", emissiveIntensity: 1.4 }), 0, 8.3, z + s * .04, IGLESIA, 0); if (s < 0) vi.rotation.y = Math.PI;
    part(new THREE.BoxGeometry(8.2, .22, .3), M_BEAM, 0, 7.05, z + s * .1, IGLESIA, 0) } }
// ---------- v4: el corte del tronco como una rodaja real (foto del dueño): anillos finos irregulares, madera temprana clara y
// tardía oscura, grietas radiales, nudos, polvo de aserrín, albura más clara y corteza alrededor, con relieve
const T_RODAJA = (() => { const [c, z] = pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(1810), cx = w * .52, cy = h * .48, R = 500;
  c.fillStyle = "#3a2618"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
  const radio = (a, rr) => rr * (1 + Math.sin(a * 3 + 1) * .035 + Math.sin(a * 7 + 2) * .015 + Math.sin(a * 13) * .006) + Math.sin(a * 2) * rr * .04;
  const anillo = (rr, col, lw, ctx) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); for (let k = 0; k <= 180; k++) { const a = k / 180 * 6.2832, q = radio(a, rr); k ? ctx.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q) : ctx.moveTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q) } ctx.stroke() };
  // fondo de madera (de afuera hacia adentro): corteza, albura clara, duramen tostado
  for (let rr = R; rr > 0; rr -= 2) { const q = rr / R, col = q > .96 ? "#2e1e12" : q > .9 ? "#d8b48a" : `rgb(${190 - q * 30 + (r() - .5) * 10 | 0},${140 - q * 25 + (r() - .5) * 8 | 0},${88 - q * 20 | 0})`; anillo(rr, col, 3, c) }
  // anillos de crecimiento: finos y apretados, cada uno con su madera tardía más oscura
  let rr = 6; while (rr < R * .95) { const st = 4 + r() * 7 * (1 - rr / R * .6); rr += st; anillo(rr, `rgba(${90 + r() * 30 | 0},${52 + r() * 20 | 0},${24 + r() * 12 | 0},${.55 + r() * .3})`, 1.2 + r() * 1.6, c); anillo(rr, "rgba(40,40,40,.7)", 2, z); anillo(rr + st * .5, "rgba(250,225,190,.18)", st * .4, c) }
  // marcas de sierra en arcos y aserrín
  for (let k = 0; k < 60; k++) { c.strokeStyle = `rgba(${r() < .5 ? "255,240,210" : "70,40,20"},${.06 + r() * .08})`; c.lineWidth = 2 + r() * 3; c.beginPath(); c.arc(cx - 900 + r() * 200, cy + (r() - .5) * 900, 900 + r() * 80, -.5, .5); c.stroke() }
  for (let k = 0; k < 4000; k++) { const a = r() * 6.28, d = Math.sqrt(r()) * R * .93; c.fillStyle = `rgba(${r() < .5 ? "255,235,200" : "60,34,16"},${.15 + r() * .3})`; c.fillRect(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 1.5, 1.5) }
  // grietas radiales y nudos oscuros
  for (let k = 0; k < 7; k++) { const a = r() * 6.28, L = R * (.25 + r() * .6), d0 = R * r() * .3; c.strokeStyle = "rgba(20,10,4,.9)"; z.strokeStyle = "rgba(0,0,0,.9)"; for (const ctx of [c, z]) { ctx.lineWidth = 2 + r() * 4; ctx.beginPath(); let x = cx + Math.cos(a) * d0, y = cy + Math.sin(a) * d0; ctx.moveTo(x, y); for (let s = 0; s < 12; s++) { x += Math.cos(a + (r() - .5) * .3) * L / 12; y += Math.sin(a + (r() - .5) * .3) * L / 12; ctx.lineTo(x, y) } ctx.stroke() } }
  for (let k = 0; k < 3; k++) { const a = r() * 6.28, d = R * (.3 + r() * .5), x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d; const g = c.createRadialGradient(x, y, 1, x, y, 16); g.addColorStop(0, "#120804"); g.addColorStop(1, "rgba(60,30,10,0)"); c.fillStyle = g; c.beginPath(); c.ellipse(x, y, 16, 9, a, 0, 7); c.fill() }
  // médula en el centro
  c.fillStyle = "#5a3418"; c.beginPath(); c.arc(cx, cy, 6, 0, 7); c.fill() }); return { c, z } })();
const M_RODAJA = new THREE.MeshStandardMaterial({ map: T_RODAJA.c, bumpMap: T_RODAJA.z, bumpScale: 3, roughness: .85 });
VIEJO.userData.tapa.material = M_RODAJA; VIEJO.userData.tapa.scale.setScalar(1.02);
// la cara cortada del tronco caído también (antes era un hueco oscuro) y el tocón de Brask en la plaza
{ const tr = VIEJO.userData.tronco.children[0]; const cara = new THREE.Mesh(new THREE.CircleGeometry(2.55, 48), M_RODAJA); cara.rotation.x = Math.PI / 2; cara.position.set(0, -15 + .02, 0); tr.add(cara);
  TOCON.children.forEach(o => { if (o.geometry && o.geometry.type === "CircleGeometry") { o.material = M_RODAJA } }) }

// ---------- elenco: diseños propios de bloques (nada del protagonista de Volze ni marcas)
const ME = kid({ skin: "#e8b48c", shirt: "#d1872e", cloth: "plain", pants: "#3a4a5a", shoes: "#4a3020", hair: "#3a2416", style: "despeinado" });
const ME6 = kid({ skin: "#e8b48c", shirt: "#d1872e", cloth: "plain", pants: "#3a4a5a", shoes: "#4a3020", hair: "#3a2416", style: "despeinado" }); ME6.body.scale.setScalar(.7);
const QUILL = kid({ skin: "#f0c6a0", shirt: "#2e2e4a", cloth: "suit", alt: "#a82a2a", pants: "#2e2e4a", shoes: "#111", hair: "#9a9a9a", style: "corto" });
const PIM = kid({ skin: "#c98e64", shirt: "#f2ece0", cloth: "plain", pants: "#5a4632", shoes: "#2a2420", hair: "#2b211b", style: "corto" });
const GARROW = kid({ skin: "#d9b08c", shirt: "#3a5a4a", cloth: "sweater", alt: "#c9b48a", pants: "#3a3236", shoes: "#2a2420", hair: "#e9e4dc", style: "corto" });
const FOLK = [["#7a3a2a", "plaid", "#3a3236", "#2b211b", "corto", "#c98e64"], ["#3f6a8a", "sweater", "#3a3f4a", "#6b3f22", "melena", "#f2cfae"], ["#5a7a3a", "plain", "#3a2f28", "#c9a06a", "liso", "#e8b48c"], ["#8a5a8a", "sweater", "#3a3236", "#9a9a9a", "rodete", "#efc8a8"], ["#c9a23a", "plain", "#2e3a59", "#1d1a17", "rulos", "#8a5a3c"], ["#3a4a5a", "plain", "#2a2420", "#7a4a2a", "puntas", "#f2cfae"]].map(([sh, c, p, h, st, sk]) => { const k = kid({ skin: sk, shirt: sh, cloth: c, alt: "#d9c7a0", pants: p, shoes: "#2a2420", hair: h, style: "corto" }); k.peloR6 = [st, h]; return k });
const EXT = [["#b85a3a", "#3a3f4a", "#efc8a8"], ["#4a8a6a", "#3a2f28", "#8a5a3c"], ["#e0c060", "#2e3a59", "#f2cfae"], ["#7a4a8a", "#2a2420", "#c98e64"]].map(([sh, p, sk]) => kid({ skin: sk, shirt: sh, cloth: "plain", pants: p, shoes: "#2a2420", hair: "#2b211b", style: "corto" }));
const PESCADOR = kid({ skin: "#c98e64", shirt: "#e8c040", cloth: "plain", pants: "#3a4a5a", shoes: "#2a2420", hair: "#5a3a22", style: "corto" });
const ALL = [ME, ME6, QUILL, PIM, GARROW, ...FOLK, ...EXT, PESCADOR];
ALL.forEach(k => TURT.add(k.g));   // todos viven arriba de la tortuga
const handW = (k, h = "R") => { k.g.updateMatrixWorld(true); return (h === "R" ? k.handR : k.handL).getWorldPosition(new THREE.Vector3()) };
const attach = (obj, k, h = "R", o = [0, -.15, .1]) => { const hand = h === "R" ? k.handR : k.handL; if (obj.parent !== hand) hand.add(obj); obj.position.set(...o); obj.visible = true };
// en la concha: los personajes se paran sobre la superficie del caparazón
const placeC = (k, x, z, ry = 0) => { k.g.visible = true; k.g.position.set(x, SY(x, z), z); k.g.rotation.set(0, ry, 0) };
const faceToC = (k, x, z) => k.g.rotation.y = Math.atan2(x - k.g.position.x, z - k.g.position.z);

// ---------- estilo de bloques como el de Volze (pedido del dueño, 24-nov-2026): cabeza = cubo redondeado más ancho que alto, sin cuello,
// cara impresa al frente (ojos ovalados negros con brillo, cejas y boca gruesas); torso = un bloque; brazos y piernas = un bloque cada
// uno, del mismo ancho, con la piel abajo del brazo y el calzado pintado en la pierna. Diseños de cara propios (no la cara de fábrica de Roblox).
// Mantiene los mismos puntos de giro que kid(): pose(), los primeros planos (shF) y las velas siguen funcionando.
const CARAS_R6 = {};
function caraR6(kind) {
  if (CARAS_R6[kind]) return CARAS_R6[kind];
  return CARAS_R6[kind] = tex(512, 384, (g, w, h) => {
    const ink = "#141014", ex = [176, 336], ey = 165;
    const K = { neutral: [1, 0, "flat"], worried: [1, 1, "frown"], gloomy: [.8, 1, "flat"], pleading: [1, 1, "frown"], sad: [1, 1, "frown"], scared: [1.35, 1.2, "o"], terrified: [1.5, 1.4, "scream"], horrified: [1.45, 1.3, "scream"], panic: [1.4, 1.3, "scream"],
      shock: [1.35, -1, "o"], gasp: [1.35, -1, "o"], happy: [1, 0, "smile"], warm: [.9, 0, "smile"], laugh: [.95, -.5, "open"], excited: [1.15, -.6, "open"], starstruck: [1.2, -.8, "open"], hopeful: [1.1, .6, "smile"],
      relieved: [.9, .8, "smile"], squint: [.6, -1.2, "flat"], suspicious: [.7, -1.4, "smirk"], determined: [.85, -1.4, "smirk"], brave: [.9, -1.2, "flat"], angry: [.9, -1.6, "frown"], curious: [1.15, -.4, "o"] }[kind] || [1, 0, "flat"];
    const [es, bro, boca] = K;
    g.fillStyle = ink; g.strokeStyle = ink; g.lineCap = "round"; g.lineJoin = "round";
    // ojos: óvalo negro vertical con un brillo blanco
    ex.forEach((x, i) => { g.fillStyle = ink; g.beginPath(); g.ellipse(x, ey, 26 * Math.min(1.2, es), 46 * Math.min(1.25, es), 0, 0, 7); g.fill(); g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(x - 8, ey - 18 * Math.min(1.25, es), 8, 11, 0, 0, 7); g.fill();
      // cejas gruesas: bro > 0 preocupada (sube adentro), bro < 0 enojada (baja adentro)
      g.strokeStyle = ink; g.lineWidth = 18; const s = i ? 1 : -1, yb = ey - 10 - 66 * Math.min(1.25, es) - (bro < 0 && boca === "o" ? 14 : 0); g.beginPath(); g.moveTo(x - s * 36, yb + bro * 10 * -1 * 0 + (bro > 0 ? 8 : bro < 0 ? -12 : 0)); g.lineTo(x + s * 26, yb + (bro > 0 ? -14 : bro < 0 ? 12 : 0)); g.stroke() });
    // boca gruesa
    g.fillStyle = ink; g.lineWidth = 18; const my = 290;
    if (boca === "flat") { g.beginPath(); g.moveTo(222, my); g.lineTo(290, my); g.stroke() }
    if (boca === "frown") { g.beginPath(); g.moveTo(214, my + 16); g.quadraticCurveTo(256, my - 22, 298, my + 16); g.stroke() }
    if (boca === "smile") { g.beginPath(); g.moveTo(206, my - 14); g.quadraticCurveTo(256, my + 34, 306, my - 14); g.stroke() }
    if (boca === "smirk") { g.beginPath(); g.moveTo(220, my + 6); g.quadraticCurveTo(268, my + 10, 300, my - 14); g.stroke() }
    if (boca === "o") { g.beginPath(); g.ellipse(256, my, 22, 28, 0, 0, 7); g.fill() }
    if (boca === "open") { g.beginPath(); g.moveTo(196, my - 22); g.quadraticCurveTo(256, my + 62, 316, my - 22); g.closePath(); g.fill(); g.fillStyle = "#c94b5a"; g.beginPath(); g.ellipse(256, my + 18, 26, 10, 0, 0, 7); g.fill() }
    if (boca === "scream") { g.beginPath(); g.moveTo(214, my - 26); g.quadraticCurveTo(256, my - 44, 298, my - 26); g.lineTo(306, my + 40); g.quadraticCurveTo(256, my + 58, 206, my + 40); g.closePath(); g.fill(); g.fillStyle = "#ffffff"; g.fillRect(224, my - 30, 64, 12) }
  });
}
const LIMBT = {};
const brazoTex = (shirt, skin, manga) => LIMBT["b" + shirt + skin + manga] ||= tex(128, 256, (g, w, h) => { g.fillStyle = skin; g.fillRect(0, 0, w, h); const y = h * manga; g.fillStyle = shirt; g.fillRect(0, 0, w, y); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(255,255,255,.06)"); gr.addColorStop(1, "rgba(0,0,0,.14)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(0,0,0,.18)"; g.fillRect(0, y - 6, w, 6) });
const piernaTex = (pants, shoes) => LIMBT["p" + pants + shoes] ||= tex(128, 256, (g, w, h) => { g.fillStyle = pants; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(0,0,0,.12)"; g.fillRect(w / 2 - 2, 0, 4, h * .86); g.fillStyle = shoes; g.fillRect(0, h * .86, w, h * .14); g.fillStyle = "rgba(255,255,255,.12)"; g.fillRect(0, h * .86, w, 5); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(255,255,255,.05)"); gr.addColorStop(1, "rgba(0,0,0,.12)"); g.fillStyle = gr; g.fillRect(0, 0, w, h) });
function robloxify(k, { skin, shirt, alt = "#ffffff", cloth = "plain", pants, shoes = "#2a2420", manga = .82, pelo = null }) {
  k.r6 = true; k.skin = skin;
  const quitar = grp => [...grp.children].forEach(c => { if (c.isMesh) grp.remove(c) });
  // brazos y piernas: un solo bloque cada uno (mismo ancho), con la misma articulación que kid()
  [k.legL, k.legR].forEach(p => { quitar(p); const m = new THREE.MeshStandardMaterial({ map: piernaTex(pants, shoes), roughness: .7 }); part(RB(.5, 1.02, .5, .045), m, 0, -.5, 0, p, 0) });
  [k.armL, k.armR].forEach((p, i) => { quitar(p); const m = new THREE.MeshStandardMaterial({ map: brazoTex(shirt, skin, manga), roughness: .7 }); part(RB(.5, 1.04, .5, .045), m, 0, -.44, 0, p, 0); const hnd = new THREE.Object3D(); hnd.position.set(0, -.86, 0); p.add(hnd); if (i) k.handR = hnd; else k.handL = hnd });
  k.handMat = new THREE.MeshStandardMaterial({ color: skin });   // power() lo toca: material suelto, no pinta los brazos
  // torso: un bloque con la ropa estampada
  [...k.body.children].forEach(c => { if (c.isMesh) k.body.remove(c) });
  const sh = SM(shirt), fr = new THREE.MeshStandardMaterial({ map: clothTex(cloth, shirt, alt), roughness: .75 }), bk = new THREE.MeshStandardMaterial({ map: clothTex(cloth, shirt, alt, true), roughness: .75 });
  part(RB(1.04, 1.04, .52, .045), boxMats(sh, fr, bk), 0, 1.54, 0, k.body, 0);
  // cabeza: cubo redondeado más ancho que alto, sin cuello, cara impresa al frente
  [...k.head.children].forEach(c => { if (c.isMesh && (c.geometry.type === "LatheGeometry" || (c.geometry.type === "CylinderGeometry" && c !== k.decal))) k.head.remove(c) });
  part(RB(.7, .62, .66, .15), SM(skin, { roughness: .55 }), 0, .38, 0, k.head, 0);
  k.decal.geometry = new THREE.PlaneGeometry(.62, .465); k.decal.position.set(0, .39, .332); k.decal.material.map = caraR6("neutral"); k.decal.material.needsUpdate = true;
  // pelo de piezas facetadas (como el canal: mechones con caras planas, en punta y con volumen arriba); se saca el pelo blando de kid()
  [...k.head.children].forEach(c => { if (c.isMesh && (c.userData.shell || (c.material && c.material.map === HAIRT))) k.head.remove(c) });
  if (pelo) peloRoblox(k.head, ...pelo);
}
function peloFacetado(head, estilo, color) {
  const m = new THREE.MeshStandardMaterial({ color, roughness: .55, flatShading: true }), md = new THREE.MeshStandardMaterial({ color: new THREE.Color(color).multiplyScalar(.78), roughness: .6, flatShading: true });
  const blk = (w, hh, d, x, y, z, rx = 0, ry = 0, rz = 0, mm = m) => { const p = part(RB(w, hh, d, .05, 1), mm, x, y, z, head, 0); p.rotation.set(rx, ry, rz); return p };
  const pico = (r, l, x, y, z, rx, rz, mm = m) => { const c = part(new THREE.ConeGeometry(r, l, 5), mm, x, y, z, head, 0); c.rotation.set(rx, 0, rz); return c };
  const bola = (r, x, y, z, mm = m) => part(new THREE.IcosahedronGeometry(r, 0), mm, x, y, z, head, 0);
  // casquete: arriba, atrás y costados (tapa las esquinas del cubo de la cabeza)
  blk(.76, .22, .72, 0, .77, -.01); blk(.76, .4, .14, 0, .52, -.34, 0, 0, 0, md); for (const s of [-1, 1]) blk(.08, .18, .5, s * .37, .7, -.08, 0, 0, 0, md);
  if (estilo === "puntas") { [[-.22, .12, -.45], [0, .18, 0], [.22, .12, .45], [-.12, -.1, -.3], [.14, -.1, .3], [0, -.22, 0], [-.28, -.18, -.75], [.28, -.18, .75]].forEach(([x, z, a]) => pico(.13, .4, x, 1.0, z, .35 + z * .8, -a * .55));
    [-.2, 0, .2].forEach((x, i) => pico(.11, .3, x, .82, .3, 1.15, (i - 1) * .35)) }
  if (estilo === "liso") { blk(.62, .14, .12, .04, .66, .34, -.2, 0, -.12); blk(.42, .12, .5, -.1, .86, .06, 0, 0, .1) }
  if (estilo === "corto") { blk(.66, .08, .1, 0, .66, .35, -.15) }
  if (estilo === "trenzas") { blk(.66, .12, .12, 0, .66, .34, -.2); for (const s of [-1, 1]) for (let k2 = 0; k2 < 4; k2++) bola(.1 - k2 * .01, s * .4, .42 - k2 * .16, -.1, k2 % 2 ? md : m) }
  if (estilo === "rodete") { blk(.6, .1, .1, 0, .66, .35, -.15); bola(.2, 0, .9, -.2); blk(.3, .06, .3, 0, .82, -.2, 0, .6, 0, md) }
  if (estilo === "melena" || estilo === "largo") { blk(.7, .14, .12, 0, .65, .34, -.2); const L = estilo === "largo" ? .9 : .6; blk(.8, L, .16, 0, .66 - L / 2, -.37, 0, 0, 0, md); for (const s of [-1, 1]) blk(.12, L - .1, .5, s * .4, .7 - L / 2, -.06) }
  if (estilo === "rulos") { for (let k2 = 0; k2 < 16; k2++) { const a = k2 / 16 * Math.PI * 2, rr = .22 + (k2 % 3) * .06; bola(.12, Math.cos(a) * rr, .86 + (k2 % 2) * .05, Math.sin(a) * rr * .9 - .05, k2 % 4 ? m : md) } }
}
const setFace0 = setFace;
setFace = (k, f) => { if (!k.r6) return setFace0(k, f); const t = caraR6(f); if (k.decal.material.map !== t) { k.decal.material.map = t; k.decal.material.needsUpdate = true } };
// ---------- pelo como el del canal (pedido del dueño, 24-nov-2026): casco liso que abraza la cabeza y mechones curvos que se
// afinan en la punta, pintado a mano con mechas y brillo. Nada de cubos ni facetas.
const PELOT = {};
function peloTex(color, seed, giro = false) { const key = color + seed + giro; if (PELOT[key]) return PELOT[key];
  const t = tex(1024, 1024, (g, w, h) => { const r = rng(seed), [R0, G0, B0] = hx(color), c = (k, a = 1) => `rgba(${Math.min(255, R0 * k + (k > 1 ? (k - 1) * 120 : 0)) | 0},${Math.min(255, G0 * k + (k > 1 ? (k - 1) * 110 : 0)) | 0},${Math.min(255, B0 * k + (k > 1 ? (k - 1) * 90 : 0)) | 0},${a})`;
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, c(.7)); gr.addColorStop(.45, c(1)); gr.addColorStop(1, c(.92)); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 1400; k++) { const x = r() * w, y0 = -50 + r() * h * .5, L = 250 + r() * 800, sw = (r() - .5) * 50; g.strokeStyle = c(.5 + r() * .75, .12 + r() * .3); g.lineWidth = 1 + r() * 4; g.beginPath(); g.moveTo(x, y0); g.bezierCurveTo(x + sw, y0 + L * .33, x - sw, y0 + L * .66, x + sw * .4, y0 + L); g.stroke() }
    for (let k = 0; k < 320; k++) { const x = r() * w, y = h * (.3 + .06 * Math.sin(x / w * 12.57 + seed)) + (r() - .5) * 50, L = 30 + r() * 90; g.strokeStyle = c(1.5 + r() * .3, .15 + r() * .3); g.lineWidth = 2 + r() * 5; g.beginPath(); g.moveTo(x, y - L / 2); g.lineTo(x + (r() - .5) * 10, y + L / 2); g.stroke() } });
  if (giro) { t.center.set(.5, .5); t.rotation = -Math.PI / 2 } return PELOT[key] = t }
function cascoPelo(head, mat, { frente = .6, lado = .42, nuca = .22, vol = 1, ondas = 7 } = {}) {
  const geo = new THREE.SphereGeometry(1, 64, 40), p = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = 4, ax = .39, ay = .35, az = .375;
    const s = Math.pow(Math.abs(v.x / ax) ** n + Math.abs(v.y / ay) ** n + Math.abs(v.z / az) ** n, -1 / n);
    let x = v.x * s, y = v.y * s + .38, z = v.z * s; const an = Math.atan2(v.x, v.z), ond = 1 + Math.sin(an * ondas + v.y * 4) * .018 + Math.sin(an * 13) * .006;
    x *= ond; z *= ond; if (v.y > 0) y += v.y * v.y * .07 * vol;
    const lim = v.z > 0 ? lerp(lado, frente, Math.min(1, v.z / .55) ** .8) : lerp(lado, nuca, Math.min(1, -v.z / .6));
    if (y < lim) { y = lim - Math.min(.03, (lim - y) * .2); x *= .84; z *= .84 }
    p.setXYZ(i, x, y, z) }
  geo.computeVertexNormals(); const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.userData.pelo = 1; head.add(m); return m }
function mechon(head, mat, pts, r0, r1 = .012, plano = 1.3) { const cu = new THREE.CatmullRomCurve3(pts.map(q => new THREE.Vector3(...q))), TS = 28, RS = 12, geo = new THREE.TubeGeometry(cu, TS, 1, RS, false), p = geo.attributes.position, v = new THREE.Vector3(), fr = cu.computeFrenetFrames(TS, false);
  for (let i = 0; i <= TS; i++) { const t = i / TS, c = cu.getPointAt(t), rad = lerp(r0, r1, Math.pow(t, 1.3)) * (1 + Math.sin(t * Math.PI) * .15); for (let j = 0; j <= RS; j++) { const k = i * (RS + 1) + j; v.fromBufferAttribute(p, k).sub(c); const a = v.dot(fr.normals[i]), b = v.dot(fr.binormals[i]); v.copy(fr.normals[i]).multiplyScalar(a * rad).addScaledVector(fr.binormals[i], b * rad * plano).add(c); p.setXYZ(k, v.x, v.y, v.z) } }
  geo.computeVertexNormals(); const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.userData.pelo = 1; head.add(m); return m }
function peloVolze(head, estilo, color) { const seed = [...color].reduce((a, ch) => a + ch.charCodeAt(0), 0) + estilo.length * 31;
  const mc = new THREE.MeshStandardMaterial({ map: peloTex(color, seed), roughness: .42 }), ml = new THREE.MeshStandardMaterial({ map: peloTex(color, seed + 1, true), roughness: .42 }), r = rng(seed);
  const M = (pts, r0, r1) => mechon(head, ml, pts, r0, r1);
  const bola = (rad, x, y, z, sx = 1, sy = 1, sz = 1) => { const m = part(new THREE.SphereGeometry(rad, 32, 20), mc, x, y, z, head, 0); m.scale.set(sx, sy, sz); m.userData.pelo = 1; return m };
  if (estilo === "puntas") { cascoPelo(head, mc, { frente: .6, lado: .44, nuca: .26, vol: 1.6 });
    [[-.2, .1, -.5], [0, .16, 0], [.2, .1, .5], [-.12, -.08, -.3], [.13, -.06, .35], [0, -.2, .05], [-.27, -.14, -.8], [.27, -.16, .8]].forEach(([x, z, a]) => { const L = .17 + r() * .1; M([[x * .9, .7, z], [x * 1.08 + a * .05, .8 + L * .35, z - .08], [x * 1.3 + a * .12, .8 + L * .75, z - .24 - r() * .08]], .11, .025) });
    [-.17, .02, .2].forEach(x => M([[x - .05, .74, .12], [x, .72, .3], [x + .06, .62, .37], [x + .1, .56, .36]], .075, .018)) }
  if (estilo === "corto") { cascoPelo(head, mc, { frente: .62, lado: .46, nuca: .3, vol: .7 });
    M([[-.22, .74, .1], [-.06, .73, .3], [.12, .66, .37], [.26, .6, .36]], .08, .02); M([[-.05, .76, .05], [.08, .74, .26], [.22, .67, .35]], .07, .02) }
  if (estilo === "liso") { cascoPelo(head, mc, { frente: .58, lado: .3, nuca: .14, vol: .9 });
    M([[-.18, .78, .05], [0, .76, .28], [.2, .66, .37], [.36, .52, .3], [.4, .4, .2]], .11, .03);
    for (let k = 0; k < 6; k++) { const a = Math.PI * (.6 + k * .16), x = Math.sin(a) * .36, z = Math.cos(a) * .34; M([[x, .62, z], [x * 1.08, .4, z * 1.08], [x * 1.05, .18, z * 1.02]], .09, .03) } }
  if (estilo === "melena" || estilo === "largo") { const L = estilo === "largo" ? -.45 : .02; cascoPelo(head, mc, { frente: .6, lado: .3, nuca: .1, vol: 1 });
    for (let k = 0; k < 13; k++) { const a = Math.PI * (.42 + k / 12 * 1.16), x = Math.sin(a) * .37, z = Math.cos(a) * .35, f = 1.12 + r() * .06; M([[x, .62, z], [x * f, .38, z * f], [x * (f + .05), (L + .38) / 2 - .06, z * (f + .05)], [x * .98, L, z * .98 + .02]], .1, .035) }
    [-.2, -.06, .08, .22].forEach(x => M([[x - .03, .74, .14], [x, .7, .32], [x + .03, .6, .37]], .07, .02)) }
  if (estilo === "trenzas") { cascoPelo(head, mc, { frente: .6, lado: .36, nuca: .2, vol: .8 });
    for (const s of [-1, 1]) { for (let k = 0; k < 6; k++) bola(.09 - k * .006, s * .38 + s * k * .005, .42 - k * .13, -.04 - k * .01, 1, 1.25, 1).rotation.z = s * (k % 2 ? .3 : -.3); part(new THREE.TorusGeometry(.05, .02, 8, 16), SM("#c94b4b"), s * .41, -.36, -.1, head, 0).rotation.x = Math.PI / 2 }
    [-.15, .05].forEach(x => M([[x, .74, .12], [x + .05, .7, .3], [x + .1, .62, .37]], .07, .02)) }
  if (estilo === "rodete") { cascoPelo(head, mc, { frente: .6, lado: .4, nuca: .3, vol: .6 });
    bola(.17, 0, .86, -.24, 1, .9, 1); for (let k = 0; k < 5; k++) { const a = k / 5 * 6.28; M([[Math.cos(a) * .1, .84, -.24 + Math.sin(a) * .1], [Math.cos(a + 1) * .18, .9, -.24 + Math.sin(a + 1) * .18], [Math.cos(a + 2) * .12, .97, -.24 + Math.sin(a + 2) * .12]], .06, .02) }
    M([[-.2, .72, .2], [-.3, .6, .3], [-.33, .48, .28]], .04, .012) }
  if (estilo === "rulos") { cascoPelo(head, mc, { frente: .62, lado: .4, nuca: .2, vol: 1.8, ondas: 11 });
    for (let k = 0; k < 26; k++) { const a = r() * 6.28, rr = .1 + r() * .24, cx = Math.cos(a) * rr, cz = Math.sin(a) * rr * .9 - .05, cy = .78 + (.34 - rr) * .25, pts = []; for (let q = 0; q <= 8; q++) { const b = q / 8 * Math.PI * 2.2; pts.push([cx + Math.cos(b) * .06, cy + q * .012, cz + Math.sin(b) * .06]) } M(pts, .045, .03) } }
}


// ---------- pelo como los accesorios de pelo de Roblox (el dueño mandó «Pelo de colega», un flequillo rubio en capas y un pelo
// castaño de mechones): una masa de mechones gruesos y algo facetados que nacen de la coronilla, caen sobre la frente, las
// orejas y la nuca y terminan en punta; degradé (raíz oscura, punta clara) y mechas pintadas a lo largo de cada mechón.
const MECHT = {};
function mechTex(color, seed) { const key = color + seed; if (MECHT[key]) return MECHT[key];
  return MECHT[key] = tex(1024, 256, (g, w, h) => { const r = rng(seed), [R0, G0, B0] = hx(color), c = (k, a = 1) => `rgba(${Math.min(255, R0 * k + Math.max(0, k - 1) * 90) | 0},${Math.min(255, G0 * k + Math.max(0, k - 1) * 80) | 0},${Math.min(255, B0 * k + Math.max(0, k - 1) * 60) | 0},${a})`;
    const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, c(.55)); gr.addColorStop(.35, c(.92)); gr.addColorStop(.8, c(1.08)); gr.addColorStop(1, c(1.15)); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 260; k++) { const y = r() * h, x0 = r() * w * .3, L = w * (.4 + r() * .7); g.strokeStyle = c(.55 + r() * .8, .18 + r() * .35); g.lineWidth = 1.5 + r() * 5; g.beginPath(); g.moveTo(x0, y); g.bezierCurveTo(x0 + L * .3, y + (r() - .5) * 18, x0 + L * .6, y + (r() - .5) * 18, x0 + L, y + (r() - .5) * 10); g.stroke() }
    const br = g.createLinearGradient(0, 0, 0, h); br.addColorStop(0, "rgba(255,255,255,0)"); br.addColorStop(.28, "rgba(255,250,235,.22)"); br.addColorStop(.38, "rgba(255,255,255,0)"); g.fillStyle = br; g.fillRect(w * .25, 0, w * .6, h) }) }
function mechR(head, mat, pts, r0, r1 = .006, plano = 2.1) { const cu = new THREE.CatmullRomCurve3(pts.map(q => new THREE.Vector3(...q))), TS = 18, RS = 6, geo = new THREE.TubeGeometry(cu, TS, 1, RS, false), p = geo.attributes.position, v = new THREE.Vector3(), fr = cu.computeFrenetFrames(TS, false), up = new THREE.Vector3();
  for (let i = 0; i <= TS; i++) { const t = i / TS, c = cu.getPointAt(t), rad = lerp(r0, r1, Math.pow(t, 1.6)) * (1 + Math.sin(t * Math.PI) * .25);
    // el lado ancho del mechón queda pegado a la cabeza (normal = dirección desde el centro de la cabeza)
    const tg = cu.getTangentAt(t), out = up.set(c.x, c.y - .38, c.z).normalize(), nA = out.clone().sub(tg.clone().multiplyScalar(out.dot(tg))).normalize(), nB = new THREE.Vector3().crossVectors(tg, nA);
    for (let j = 0; j <= RS; j++) { const k = i * (RS + 1) + j; v.fromBufferAttribute(p, k).sub(c); const a = v.dot(fr.normals[i]), b = v.dot(fr.binormals[i]), ang = Math.atan2(b, a); v.copy(nA).multiplyScalar(Math.cos(ang) * rad).addScaledVector(nB, Math.sin(ang) * rad * plano).add(c); p.setXYZ(k, v.x, v.y, v.z) } }
  geo.computeVertexNormals(); const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.userData.pelo = 1; head.add(m); return m }
function peloRoblox(head, estilo, color) { const seed = [...color].reduce((a, ch) => a + ch.charCodeAt(0), 0) + estilo.length * 31, r = rng(seed);
  const mt = new THREE.MeshStandardMaterial({ map: mechTex(color, seed), roughness: .5, flatShading: true }), mc = new THREE.MeshStandardMaterial({ map: peloTex(color, seed), color: "#b0b0b0", roughness: .6 });
  // punto sobre el casco (misma superficie que cascoPelo), un poco afuera
  const S = (a, ph, out = 1.06) => { const d = [Math.sin(ph) * Math.sin(a), Math.cos(ph), Math.sin(ph) * Math.cos(a)], s = Math.pow(Math.abs(d[0] / .39) ** 4 + Math.abs(d[1] / .35) ** 4 + Math.abs(d[2] / .375) ** 4, -.25); return [d[0] * s * out, d[1] * s * out + .38, d[2] * s * out] };
  // hasta dónde baja el pelo según el lado: adelante se corta arriba de los ojos, al costado tapa la oreja, atrás llega a la nuca
  const fin = (a, largo) => { const f = Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) / Math.PI; return f < .3 ? .92 : f < .55 ? lerp(.92, 1.45 + largo * .5, (f - .3) / .25) : 1.45 + largo * .5 + (f - .55) * (.6 + largo) };
  const lock = (a, ph1, r0, caida, ext = .07, ph0 = .05) => { const pts = []; for (let q = 0; q <= 4; q++) pts.push(S(a + (r() - .5) * .05, lerp(ph0, ph1, q / 4), 1.05 + q * .012)); const e = pts[4]; pts.push([e[0] * (1 + ext), e[1] - caida, e[2] * (1 + ext)]); return mechR(head, mt, pts, r0) };
  const largo = { largo: 1.2, melena: .7, liso: .45, corto: 0, puntas: .1, rodete: -.2, trenzas: 0, rulos: .1 }[estilo] ?? 0;
  cascoPelo(head, mc, { frente: .62, lado: .44, nuca: .26, vol: estilo === "puntas" ? 1.4 : 1 });
  if (estilo === "rulos") { for (let k = 0; k < 34; k++) { const a = r() * 6.28, ph = .15 + r() * 1.05, [cx, cy, cz] = S(a, ph, 1.08), pts = []; for (let q = 0; q <= 8; q++) { const b = q / 8 * Math.PI * 2.4; pts.push([cx + Math.cos(b) * .055, cy - q * .014, cz + Math.sin(b) * .055]) } mechR(head, mt, pts, .05, .03, 1.2) } return }
  if (estilo === "rodete") { const n = 22; for (let k = 0; k < n; k++) { const a = k / n * 6.28 + r() * .1; mechR(head, mt, [S(a, fin(a, 0) - .15, 1.05), S(a, .6, 1.07), S(a, .2, 1.07), [0, .86, -.2]], .12, .04, 1.6) }
    const bo = part(new THREE.SphereGeometry(.18, 14, 10), mt, 0, .9, -.24, head, 0); bo.userData.pelo = 1; for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28; mechR(head, mt, [[Math.cos(a) * .12, .86, -.24 + Math.sin(a) * .12], [Math.cos(a + 1) * .2, .93, -.24 + Math.sin(a + 1) * .2], [Math.cos(a + 2) * .1, 1.02, -.24 + Math.sin(a + 2) * .1]], .06, .02) } return }
  // capa de mechones que cubre todo el casco desde la coronilla
  const n = estilo === "corto" ? 18 : 22; for (let k = 0; k < n; k++) { const a = k / n * 6.28 + (r() - .5) * .2, ff = fin(a, largo); lock(a, ff + (r() - .5) * .08, .1 + r() * .035, .04 + r() * .06 + Math.max(0, largo) * .2 * (ff > 1.2 ? 1 : 0)) }
  // segunda capa más corta, encima, para dar volumen y que se vean los mechones separados
  for (let k = 0; k < 10; k++) { const a = r() * 6.28; lock(a, fin(a, largo) * .75, .085 + r() * .03, .03, .1) }
  // flequillo: mechones que caen sobre la frente con las puntas separadas
  const fl = estilo === "liso" || estilo === "melena" || estilo === "largo" ? 6 : 4; for (let k = 0; k < fl; k++) { const a = -.55 + k / (fl - 1) * 1.1 + (r() - .5) * .1, e = S(a, .95, 1.13); mechR(head, mt, [S(a * .3, .1), S(a * .7, .55, 1.08), S(a, .86, 1.1), [e[0] + a * .05, .6 + r() * .03, e[2]]], .08 + r() * .02) }
  // puntas para arriba y para atrás (como «Pelo de colega»)
  if (estilo === "puntas") for (let k = 0; k < 9; k++) { const a = Math.PI + (k / 8 - .5) * 2.2 + (r() - .5) * .15, b = S(a, .35 + r() * .25, 1.03), up = .22 + r() * .14; mechR(head, mt, [S(a, .08, 1.02), b, [b[0] * 1.25, b[1] + up * .6, b[2] * 1.25 - .04], [b[0] * 1.45, b[1] + up, b[2] * 1.45 - .1]], .1, .004, 1.5) }
  if (estilo === "trenzas") for (const s of [-1, 1]) { for (let k = 0; k < 6; k++) { const bo = part(new THREE.SphereGeometry(.09 - k * .006, 10, 8), mt, s * .4 + s * k * .005, .42 - k * .13, -.06 - k * .01, head, 0); bo.scale.set(1, 1.25, 1); bo.userData.pelo = 1 } part(new THREE.TorusGeometry(.05, .02, 8, 16), SM("#c94b4b"), s * .41, -.36, -.1, head, 0).rotation.x = Math.PI / 2 }
}
// ---------- ropa con tela de verdad (pedido del dueño): relieve de trama, costuras y pliegues en el bump, y piezas en 3D
// (cuello, botones, bolsillos, cinturón con hebilla, puños, punteras de zapato). Nada de dibujos impresos en la ropa.
const T_TELA = (() => { const [c, z] = pintarDoble(512, 1024, (c, z, w, h) => { const r = rng(777); c.fillStyle = "#808080"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 3) { z.fillStyle = y % 6 ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.12)"; z.fillRect(0, y, w, 1) } for (let x = 0; x < w; x += 3) { z.fillStyle = x % 6 ? "rgba(0,0,0,.1)" : "rgba(255,255,255,.1)"; z.fillRect(x, 0, 1, h) }
    for (let k = 0; k < 70; k++) { const x = r() * w, y = r() * h, L = 40 + r() * 140, a = (r() - .5) * 1.2 + (r() < .5 ? 0 : Math.PI / 2), cx = (r() - .5) * 30, cy = (r() - .5) * 30, lw = 6 + r() * 6; for (const [col, ww, d] of [["rgba(0,0,0,.35)", lw, 0], ["rgba(255,255,255,.28)", 5, 5]]) { z.strokeStyle = col; z.lineWidth = ww; z.beginPath(); z.moveTo(x + d, y + d); z.quadraticCurveTo(x + Math.cos(a) * L / 2 + cx + d, y + Math.sin(a) * L / 2 + cy + d, x + Math.cos(a) * L + d, y + Math.sin(a) * L + d); z.stroke() } }
    for (const x of [6, w - 6]) { z.strokeStyle = "rgba(0,0,0,.5)"; z.lineWidth = 4; z.setLineDash([10, 7]); z.beginPath(); z.moveTo(x, 0); z.lineTo(x, h); z.stroke() } z.setLineDash([]) }); return z })();
function telaReal(k, { shirt, pants, shoes = "#2a2420", botones = true, bolsillo = true, cinto = true } = {}) {
  const osc = (col, f = .72) => "#" + new THREE.Color(col).multiplyScalar(f).getHexString();
  const vestir = grp => grp.children.forEach(m => { if (!m.isMesh || m.userData.pelo) return; (Array.isArray(m.material) ? m.material : [m.material]).forEach(q => { q.bumpMap = T_TELA; q.bumpScale = 1.4; q.roughness = .88; q.needsUpdate = true }) });
  [k.body, k.armL, k.armR, k.legL, k.legR].forEach(vestir);
  const ms = SM(osc(shirt), { roughness: .85, bumpMap: T_TELA, bumpScale: 1 });
  part(RB(.62, .1, .58, .04), ms, 0, 2.03, 0, k.body, 0);                                      // cuello de la remera / camisa
  if (botones) for (let j = 0; j < 4; j++) { const b = part(new THREE.CylinderGeometry(.03, .03, .025, 10), SM("#e8e0cc", { roughness: .4 }), 0, 1.86 - j * .2, .27, k.body, 0); b.rotation.x = Math.PI / 2 }
  if (bolsillo) { part(RB(.22, .2, .025, .01), ms, .25, 1.72, .265, k.body, 0); part(RB(.23, .05, .03, .01), SM(osc(shirt, .6)), .25, 1.81, .27, k.body, 0) }
  if (cinto && pants) { part(RB(1.07, .09, .55, .02), SM("#3a2618", { roughness: .5 }), 0, 1.07, 0, k.body, 0); part(RB(.13, .1, .02, .01), SM("#c8b070", { metalness: .7, roughness: .35 }), 0, 1.07, .28, k.body, 0) }
  [k.armL, k.armR].forEach(a => part(RB(.53, .06, .53, .02), ms, 0, -.74, 0, a, 0));        // puño de la manga
  if (pants) [k.legL, k.legR].forEach((l, i) => { part(RB(.53, .06, .53, .02), SM(osc(pants)), 0, -.82, 0, l, 0); part(RB(.16, .18, .02, .01), SM(osc(pants, .8)), (i ? 1 : -1) * .1, -.28, .255, l, 0);
    part(RB(.5, .1, .14, .04), SM(osc(shoes, .9), { roughness: .6 }), 0, -.97, .3, l, 0); part(RB(.54, .04, .66, .02), SM("#e8e0d0", { roughness: .7 }), 0, -1.02, .04, l, 0) }) }
// ---------- corridas como en los videos de Volze: cuerpo inclinado, brazos y piernas que se abren mucho, rebote y polvo en los pies
function correr(c, t, a = 1) { const f = t * 13, sw = Math.sin(f);
  c.legL.rotation.x = sw * 1.05 * a; c.legR.rotation.x = -sw * 1.05 * a; c.armL.rotation.x = -sw * 1.25 * a; c.armR.rotation.x = sw * 1.25 * a; c.armL.rotation.z = -.12; c.armR.rotation.z = .12;
  c.body.rotation.x = .42 * a; c.body.position.y = Math.abs(Math.cos(f)) * .17 * a; c.head.rotation.x = -.22 * a;
  if (!c.polvo) c.polvo = Array.from({ length: 4 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#d9c8a4", transparent: true, opacity: 0, depthWrite: false })); scene.add(s); return s });
  c.g.updateMatrixWorld(true); c.polvo.forEach((s, i) => { const q = (t * 2.2 + i / 4) % 1; s.visible = true; s.position.copy(c.g.localToWorld(new THREE.Vector3((i % 2 ? .25 : -.25), .1 + q * .35, -.3 - q * 1.3))); s.scale.setScalar(.35 + q * .9); s.material.opacity = (1 - q) * .4 * a }) }
// ---------- la barba de maestro sensei de Garrow: bigote largo que cae a los costados, barba blanca hasta el pecho que termina
// en punta, y cejas largas y caídas (mechones de pelo de verdad, no bloques)
function barbaSensei(k, color) { const mt = new THREE.MeshStandardMaterial({ map: mechTex(color, 91), roughness: .55, flatShading: true }), h = k.head, M = (pts, r0, r1 = .006, pl = 1.6) => mechR(h, mt, pts, r0, r1, pl);
  for (const s of [-1, 1]) { M([[s * .03, .27, .345], [s * .14, .25, .36], [s * .25, .17, .37], [s * .3, -.05, .36], [s * .31, -.32, .34]], .045, .006, 1.3);       // bigote
    M([[s * .06, .56, .345], [s * .17, .58, .36], [s * .3, .52, .36], [s * .38, .42, .34]], .04, .006, 1.3) }                                                    // cejas
  for (let j = 0; j < 7; j++) { const x = (j / 6 - .5) * .44, L = .75 - Math.abs(x) * .9; M([[x, .2, .34], [x * .95, .08, .37], [x * .7, -.15, .4], [x * .35, -.15 - L * .6, .42], [x * .1, -.2 - L, .41]], .07, .006, 1.8) } }
// ---------- el cocinero: gorro alto plisado con copa inflada, chaqueta cruzada con dos filas de botones, cuello alto, pañuelo
// rojo y delantal con bolsillo y tiras
function cocinero(k) { const bl = SM("#f6f3ec", { roughness: .8, bumpMap: T_TELA, bumpScale: 1 }), bl2 = SM("#e4dfd2", { roughness: .8, bumpMap: T_TELA, bumpScale: 1 }), h = k.head, b = k.body;
  part(new THREE.CylinderGeometry(.38, .38, .16, 28), bl2, 0, .76, 0, h, 0);
  { const g = new THREE.CylinderGeometry(.37, .34, .42, 48, 4, true), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const a = Math.atan2(p.getZ(i), p.getX(i)), f = 1 + Math.cos(a * 14) * .05; p.setX(i, p.getX(i) * f); p.setZ(i, p.getZ(i) * f) } g.computeVertexNormals(); part(g, bl, 0, 1.03, 0, h, 0) }
  part(new THREE.SphereGeometry(.3, 20, 14), bl, 0, 1.3, 0, h, 0).scale.set(1.35, .75, 1.35); for (let j = 0; j < 7; j++) { const a = j / 7 * 6.28; part(new THREE.SphereGeometry(.17, 14, 10), bl, Math.cos(a) * .3, 1.27, Math.sin(a) * .3, h, 0) }
  part(RB(.66, .14, .6, .04), bl2, 0, 2.04, 0, b, 0);                                                                    // cuello alto
  part(new THREE.ConeGeometry(.12, .22, 4), SM("#c0302a", { roughness: .7 }), 0, 1.9, .3, b, 0).rotation.x = Math.PI;   // pañuelo
  part(RB(.06, .9, .02, .01), bl2, .1, 1.55, .265, b, 0);                                                                // solapa cruzada
  for (const x of [-.22, .22]) for (let j = 0; j < 3; j++) { const bt = part(new THREE.SphereGeometry(.04, 10, 8), SM("#b8b0a0", { roughness: .4 }), x, 1.84 - j * .22, .27, b, 0); bt.scale.z = .6 }
  part(RB(.94, .6, .04, .03), SM("#e9e2d2", { roughness: .85, bumpMap: T_TELA, bumpScale: 1.4 }), 0, 1.3, .285, b, 0);      // delantal
  part(RB(.3, .18, .02, .01), SM("#d9d0bc"), .12, 1.22, .31, b, 0); part(RB(1.08, .05, .56, .01), SM("#d9d0bc"), 0, 1.58, 0, b, 0) }

// v3 (pedido del dueño): ropa como la de Volze: bloques lisos con un estampado claro que se lee de lejos (rayas, lunares,
// guarda nórdica, cuadros), sin botones ni bolsillos 3D encima
{ const ct0 = clothTex, CT = {}; clothTex = (kind, base, alt = "#ffffff", back = false) => { if (kind !== "nordico" && kind !== "lunares") return ct0(kind, base, alt, back); const key = [kind, base, alt, back].join(); return CT[key] ||= tex(256, 256, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h);
    if (kind === "lunares") { g.fillStyle = alt; for (let y = 18, f = 0; y < h; y += 42, f++) for (let x = f % 2 ? 40 : 18; x < w; x += 46) { g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill() } }
    if (kind === "nordico") { g.fillStyle = alt; g.fillRect(0, 64, w, 10); g.fillRect(0, 150, w, 10); for (let x = 0; x < w; x += 32) { g.beginPath(); g.moveTo(x + 16, 84); g.lineTo(x + 30, 112); g.lineTo(x + 16, 140); g.lineTo(x + 2, 112); g.closePath(); g.fill(); g.fillStyle = base; g.fillRect(x + 13, 109, 6, 6); g.fillStyle = alt } for (let x = 8; x < w; x += 16) { g.fillRect(x, 44, 6, 6); g.fillRect(x + 8, 172, 6, 6) } g.fillRect(0, 236, w, 20) } }) } }
// ---------- elenco nuevo de Hollowpine (diseños propios, ropa de invierno): el narrador (campera roja, gorro tejido azul con
// pompón, bufanda amarilla), Mila (campera verde, gorro blanco, trenzas), la abuela Ilse (pañuelo en la cabeza, chal violeta,
// anteojos), Brask el leñador (barba castaña, camisa escocesa roja y negra, gorro oscuro) y vecinos con gorros de piel
robloxify(ME, { skin: "#f0c8a0", shirt: "#b8302a", cloth: "nordico", alt: "#f4ecdc", pants: "#2e3a4a", shoes: "#3a2418", pelo: ["liso", "#6a4024"] });
robloxify(ME6, { skin: "#f2d0b0", shirt: "#3f7a4a", cloth: "lunares", alt: "#f6f2e6", pants: "#5a4a6a", shoes: "#5a3018", pelo: ["trenzas", "#c98a3a"] });
robloxify(GARROW, { skin: "#e8c0a0", shirt: "#7a4a8a", cloth: "cardigan", alt: "#c9b48a", pants: "#3a3236", pelo: ["rodete", "#d8d4cc"] });
robloxify(PIM, { skin: "#d8a880", shirt: "#a8282a", cloth: "plaid", alt: "#1a1a1a", pants: "#3a3a42", pelo: ["corto", "#5a3a20"] });
robloxify(QUILL, { skin: "#f0c6a0", shirt: "#4a4a5a", pants: "#2e2e3a", pelo: ["corto", "#9a9a9a"] });
FOLK.forEach((k, i) => robloxify(k, { skin: ["#c98e64", "#f2cfae", "#e8b48c", "#efc8a8", "#8a5a3c", "#f2cfae"][i], shirt: ["#5a4a3a", "#2e5a7a", "#7a3a2a", "#4a5a3a", "#8a6a3a", "#3a3a5a"][i], cloth: ["stripes", "hoodie", "plaid", "jacket", "twotone", "stripes"][i], alt: ["#e8dcc0", "#d9c7a0", "#1a1a1a", "#f2c41e", "#c9a040", "#f4f4f4"][i], pants: ["#3a3236", "#3a3f4a", "#3a2f28", "#3a3236", "#2e3a59", "#2a2420"][i], pelo: [["corto", "#2b211b"], ["melena", "#6b3f22"], ["liso", "#c9a06a"], ["rodete", "#9a9a9a"], ["rulos", "#1d1a17"], ["puntas", "#7a4a2a"]][i] }));
EXT.forEach((k, i) => robloxify(k, { skin: ["#efc8a8", "#8a5a3c", "#f2cfae", "#c98e64"][i], shirt: ["#6a2a3a", "#3a6a5a", "#a87a2a", "#3a4a6a"][i], cloth: ["lunares", "stripes", "hoodie", "jacket"][i], alt: "#f2ece0", pants: ["#3a3f4a", "#3a2f28", "#2e3a59", "#2a2420"][i], pelo: [["liso", "#3a2416"], ["rulos", "#1d1a17"], ["trenzas", "#8a5a2a"], ["corto", "#5a3a22"]][i] }));
// (telaReal sacado en v3: los botones y bolsillos 3D recargaban la ropa)
// gorros tejidos con pompón, de piel, bufandas, pañuelo, chal y anteojos
const gorroTejido = (k, col, pom = "#f2ece0") => { const m = SM(col, { roughness: 1, bumpMap: T_TRAMA, bumpScale: 4 }); [...k.head.children].forEach(c => { if (c.userData.pelo && c.position.y > .55) k.head.remove(c) });
  part(new THREE.CylinderGeometry(.42, .44, .3, 24), m, 0, .66, 0, k.head, 0); const cop = part(new THREE.SphereGeometry(.42, 24, 12, 0, 6.283, 0, Math.PI / 2), m, 0, .8, 0, k.head, 0); cop.scale.y = .8;
  part(new THREE.TorusGeometry(.43, .07, 8, 28), m, 0, .55, 0, k.head, 0).rotation.x = Math.PI / 2; part(new THREE.SphereGeometry(.15, 14, 10), SM(pom, { roughness: 1, bumpMap: T_TRAMA, bumpScale: 6 }), 0, 1.16, 0, k.head, 0) };
const gorroPiel = (k, col) => { const m = SM(col, { roughness: 1, bumpMap: T_PELO_C.z, bumpScale: 5 }); [...k.head.children].forEach(c => { if (c.userData.pelo && c.position.y > .55) k.head.remove(c) }); part(new THREE.CylinderGeometry(.46, .46, .42, 24), m, 0, .8, 0, k.head, 0); for (const s of [-1, 1]) { const o = part(RB(.12, .4, .4, .05), m, s * .4, .45, 0, k.head, 0) } };
const bufanda = (k, col) => { const m = SM(col, { roughness: 1, bumpMap: T_TRAMA, bumpScale: 4 }); part(RB(1.12, .22, .62, .08), m, 0, 2.06, 0, k.body, 0); const c = part(RB(.26, .7, .08, .03), m, .25, 1.75, .3, k.body, 0); c.rotation.z = .12 };
gorroTejido(ME, "#2a4a8a"); bufanda(ME, "#e8b42a"); gorroTejido(ME6, "#f2ece0", "#d84a6a"); bufanda(ME6, "#d84a6a");
{ const m = SM("#7a2a3a", { roughness: 1, bumpMap: T_TRAMA, bumpScale: 3 }); [...GARROW.head.children].forEach(c => { if (c.userData.pelo && c.position.y > .5) GARROW.head.remove(c) }); const pa = part(new THREE.SphereGeometry(.44, 24, 16, 0, 6.283, 0, 1.45), m, 0, .6, -.07, GARROW.head, 0); pa.scale.set(1.04, 1, 1.06); part(new THREE.ConeGeometry(.12, .3, 6), m, 0, .14, -.38, GARROW.head, 0).rotation.x = 2.6;
  const chal = part(RB(1.2, .5, .7, .15), SM("#c9b48a", { roughness: 1, bumpMap: T_TRAMA, bumpScale: 5 }), 0, 1.95, 0, GARROW.body, 0);
  for (const s of [-1, 1]) part(new THREE.TorusGeometry(.09, .018, 6, 18), SM("#3a2a1a", { metalness: .5 }), s * .14, .44, .34, GARROW.head, 0) }
barbaSensei(PIM, "#5a3a20"); gorroTejido(PIM, "#2a2a2e", "#2a2a2e");
FOLK.forEach((k, i) => i % 2 ? gorroTejido(k, ["#8a3a2a", "#3a5a7a", "#5a7a3a"][i % 3], "#f2ece0") : gorroPiel(k, ["#6a4a30", "#4a3a2a", "#8a6a4a"][i % 3]));
EXT.forEach((k, i) => i % 2 ? gorroPiel(k, "#5a4030") : gorroTejido(k, ["#c9a040", "#7a3a6a"][i % 2], "#ffffff"));
// farolito de mano
const LINTERNA = new THREE.Group(); { part(RB(.26, .34, .26, .03), new THREE.MeshStandardMaterial({ color: "#ffe0a0", emissive: "#ffb050", emissiveIntensity: 2 }), 0, -.4, .1, LINTERNA, 0); part(new THREE.TorusGeometry(.1, .015, 6, 12), SM("#2a2a2a"), 0, -.18, .1, LINTERNA, 0) }
const LINT_GL = glowSprite("#ffb060", 2); LINT_GL.visible = false;

// la abuela con arrugas (frente, patas de gallo, surcos al lado de la boca) sobre su cara de bloque
const ARR = {}; const caraArrugas = kind => ARR[kind] ||= tex(512, 384, (g, w, h) => { g.drawImage(caraR6(kind).image, 0, 0, w, h); g.strokeStyle = "rgba(90,50,40,.55)"; g.lineCap = "round"; g.lineWidth = 6;
  for (const y of [42, 60]) { g.beginPath(); g.moveTo(170, y); g.quadraticCurveTo(256, y - 10, 342, y); g.stroke() }
  for (const [x, s] of [[118, -1], [394, 1]]) for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(x, 150 + k * 16); g.lineTo(x + s * 26, 140 + k * 20); g.stroke() }
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(256 + s * 70, 240); g.quadraticCurveTo(256 + s * 86, 280, 256 + s * 70, 318); g.stroke() } });
{ const sf0 = setFace; setFace = (k, f) => { if (k !== GARROW) return sf0(k, f); const t = caraArrugas(f); if (k.decal.material.map !== t) { k.decal.material.map = t; k.decal.material.needsUpdate = true } } }


// ---------- cielo y ambientes (noche ocre, atardecer, mañana gris, interior)
const SKY = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() } },
  vertexShader: "varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
  fragmentShader: "uniform vec3 top; uniform vec3 hor; varying vec3 vD; void main(){ float h = vD.y; vec3 c = mix(hor, top, smoothstep(-.05, .55, h)); gl_FragColor = vec4(c, 1.); }" })); SKY.renderOrder = -1; scene.add(SKY);
const ENV = {
  noche: { top: "#141a2e", hor: "#3a3442", fog: .009, hemi: 1.0, hemiG: "#2a2018", sun: 1.0, sunCol: "#a8b8e0", exp: 2.3, grade: ["#d0962e", .07] },
  tarde: { top: "#2a2a48", hor: "#8a6a58", fog: .008, hemi: 1.0, hemiG: "#2a1c10", sun: 1.3, sunCol: "#ffb070", exp: 1.85, grade: ["#d8902e", .07] },
  manana: { top: "#6a7488", hor: "#a8a49a", fog: .009, hemi: 1.4, hemiG: "#3a3022", sun: 1.4, sunCol: "#f0e2c8", exp: 1.3, grade: ["#c9a06a", .05] },
  adentro: { top: "#141a2e", hor: "#2a2630", fog: .003, hemi: .7, hemiG: "#2a2018", sun: .3, sunCol: "#a8b8e0", exp: 2.05, grade: ["#d0962e", .06] },
};
// modo «pueblo de día» de la skill shorts-volze (no se usa en este video de terror; queda listo para el próximo)
ENV.dia = { top: "#5aa0e8", hor: "#cfe4f2", fog: .0026, hemi: 1.15, hemiG: "#7a6a50", sun: 3.8, sunCol: "#ffe0b4", exp: 1.16, grade: ["#ffffff", 0] };
let ENVNOW = "noche";
function setEnv(a) { const A = ENV[a]; ENVNOW = a; SKY.material.uniforms.top.value.set(A.top); SKY.material.uniforms.hor.value.set(A.hor); scene.background.set(A.hor); scene.fog.color.set(A.hor); scene.fog.density = A.fog;
  hemi.intensity = A.hemi; hemi.color.set("#c4c4d8"); hemi.groundColor.set(A.hemiG); sun.intensity = A.sun; sun.color.set(A.sunCol); R.toneMappingExposure = A.exp }
sun.position.set(-56, 36, -40); sun.target.position.set(0, 0, 0); Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 160 }); sun.shadow.camera.updateProjectionMatrix();

// ---------- las frases (índices de voz.json)
//@ORDEN
const I = Object.fromEntries(ORDEN.map((n, i) => [n, i]));
const ADENTRO_L = () => [I.ilse, I.fences, I.mila, I.badcold, I.out, I.lit, I.shook, I.window, I.roof, I.saw, I.stopped, I.morning];
const LUGAR = L => (L >= I.brask && L <= I.back) ? "recuerdo" : ADENTRO_L().includes(L) ? "adentro" : "pueblo";
const ALT = (x, z) => ((x / SB) ** 2 + (z / SA) ** 2 < 1) ? SY(x, z) : 0;   // altura del piso (loma o valle)
const placeW = (k, x, z, ry = 0) => { k.g.visible = true; k.g.position.set(x, ALT(x, z), z); k.g.rotation.set(0, ry, 0) };
const IN = o => [600 + o[0], 200 + o[1], 600 + o[2]];
const placeIn = (k, x, y, z, ry = 0) => { k.g.visible = true; k.g.position.set(600 + x, 200 + y, 600 + z); k.g.rotation.set(0, ry, 0) };
const PINO = [16, 44], MONTE = [-30, 48, -220], LINDE = [-26, 0, -62];
// el monte del Watcher (más cerca que la cordillera): un cono nevado donde está su cornisa
{ const geo = new THREE.ConeGeometry(100, 90, 14, 6), p = geo.attributes.position, r = rng(1600); for (let i = 0; i < p.count; i++) { const kk = 1 + (r() - .5) * .2; p.setX(i, p.getX(i) * kk); p.setZ(i, p.getZ(i) * kk) } geo.computeVertexNormals(); part(geo, new THREE.MeshStandardMaterial({ map: T_NIEVE.c, bumpMap: T_NIEVE.z, bumpScale: 6, roughness: .9 }), -30, 45, -262, scene, 0) }
// el ojo enorme que se asoma por la ventana, y el cuerno que rompe el techo
const OJO = new THREE.Group(); scene.add(OJO); { part(new THREE.SphereGeometry(3.4, 40, 28), M_PELO_C, 0, 0, 1.6, OJO, 0); const o = part(new THREE.SphereGeometry(1.25, 32, 24), new THREE.MeshStandardMaterial({ color: "#a8bcc8", emissive: "#7fa8c8", emissiveIntensity: .5, roughness: .12 }), 0, 0, -1.9, OJO, 0); OJO.userData.ojo = o; part(new THREE.CircleGeometry(.62, 32), SM("#5a7a8a", { roughness: .2 }), 0, 0, -3.155, OJO, 0).rotation.y = Math.PI; part(new THREE.CircleGeometry(.26, 24), SM("#06090c", { roughness: .1 }), 0, 0, -3.16, OJO, 0).rotation.y = Math.PI;
  for (const s of [-1, 1]) { const p = part(new THREE.TorusGeometry(1.35, .35, 10, 30, Math.PI), M_PELO_C, 0, s * .1, -1.9, OJO, 0); p.rotation.set(0, Math.PI, s > 0 ? 0 : Math.PI); OJO.userData[s > 0 ? "sup" : "inf"] = p } } OJO.visible = false; construirOjo();
const ASTA_T = new THREE.Group(); CASA_IN.add(ASTA_T); { const cu = new THREE.CatmullRomCurve3([[6, 14, 4], [4, 10, 2.4], [2.6, 7.4, 1], [1.8, 5.6, .2]].map(q => new THREE.Vector3(...q))); part(new THREE.TubeGeometry(cu, 20, .45, 10), M_ASTA, 0, 0, 0, ASTA_T, 0); const c2 = new THREE.CatmullRomCurve3([[3.4, 9.2, 1.8], [2.4, 9.8, 3.2], [1.6, 9.6, 4]].map(q => new THREE.Vector3(...q))); part(new THREE.TubeGeometry(c2, 10, .25, 8), M_ASTA, 0, 0, 0, ASTA_T, 0) } ASTA_T.visible = false;
// el pino que cortó Brask (en el recuerdo)
const PINO_B = new THREE.Group(); scene.add(PINO_B); PINO_B.position.set(2, 0, -42.5); { part(new THREE.CylinderGeometry(.5, .8, 16, 12), M_CORTEZA_P, 0, 8, 0, PINO_B, 0); for (let k = 0; k < 7; k++) { const q = k / 6, rr = 4.6 - q * 3.4, hh = 2.4 - q * .8, y = 6.5 + q * 10; part(GEO_PISO2, M_AGUJAS, 0, y, 0, PINO_B, 0).scale.set(rr, hh, rr); part(GEO_NIEVE2, M_NIEVE_P, 0, y, 0, PINO_B, 0).scale.set(rr, hh, rr) } }
const ASTILLAS = Array.from({ length: 24 }, () => { const m = part(new THREE.BoxGeometry(.08, .03, .2), SM("#d8b888"), 0, 0, 0, scene, 0); m.visible = false; return m });


// ---------- planos: cada frase tiene una lista de tomas; cada toma empieza en una palabra (w) y la cámara se mueve todo el tiempo (p→p1, l→l1)
// barrido de 0,2 s entre tomas del mismo lugar; corte seco cuando cambia el lugar. f = fov (gran angular en los primeros planos)
const sh = (w, p, p1, l, l1, f = 55, o = {}) => ({ w, p, p1: p1 || p, l, l1: l1 || l, f, ...o });
const add = (a, b) => a.map((v, i) => v + b[i]);
// primeros planos a partir de la cara: la cámara se pone delante de la cabeza (ang gira alrededor, dy sube) y se acerca de d0 a d1
const headW = k => { k.g.updateMatrixWorld(true); const q = k.head.getWorldQuaternion(new THREE.Quaternion()); return k.head.getWorldPosition(new THREE.Vector3()).addScaledVector(new THREE.Vector3(0, 1, 0).applyQuaternion(q), .38 * k.body.scale.y * k.g.scale.y) };
const fwdW = (k, ang) => new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang)).applyQuaternion(k.head.getWorldQuaternion(new THREE.Quaternion()));
const shF = (w, k, d0, d1, ang = 0, dy = 0, f = 62, ldy = 0, o = {}) => { const P = d => () => { const h = headW(k), v = fwdW(k, ang); return [h.x + v.x * d, h.y + v.y * d + dy, h.z + v.z * d] }, Lk = () => { const h = headW(k); return [h.x, h.y + ldy, h.z] }; return sh(w, P(d0), P(d1), Lk, Lk, f, o) };
const TW = v => () => TURT.localToWorld(new THREE.Vector3(...v)).toArray();
const TS = (x, dy, z) => TW([x, SY(x, z) + dy, z]);
const GW = (x, dy, z) => () => [x, ALT(x, z) + dy, z];
const KW = (k, o) => () => add(k.g.getWorldPosition(new THREE.Vector3()).toArray(), o);
const OW = (obj, o) => () => { obj.updateMatrixWorld(true); return obj.localToWorld(new THREE.Vector3(...o)).toArray() };
const CW = (o = [0, 0, 0]) => () => { WATCHER.G.updateMatrixWorld(true); return WATCHER.cabeza.localToWorld(new THREE.Vector3(...o)).toArray() };
const INF = o => () => IN(o);
const SHOTS = {   // v3: sin primeros planos, siempre con fondo y con lo que se cuenta a la vista
  [I.hook]: [sh(0, [4.5, 5, 31.5], [5, 5, 32], [13.5, 4.5, 41.5], [18, 8, 46], 58)],
  [I.stood0]: [sh(0, [-40, 20, -60], [-41, 21, -64], CW([0, -8, 0]), CW([0, -6, 0]), 34)],
  [I.rule]: [sh(0, [-72, 56, 72], [-62, 50, 62], TS(0, 4, 0), TS(0, 4, 0), 50)],
  [I.cost]: [sh(0, [8, 4, -38], [8, 4.6, -40], CW([0, -14, 0]), CW([0, -10, 0]), 60, { shake: .15 })],
  [I.valley]: [sh(0, [120, 64, 150], [104, 58, 132], [0, 10, 0], [0, 10, 0], 46)],
  [I.burn]: [sh(0, TS(2.6, 2.6, 1.5), TS(2.4, 2.6, 2.2), KW(FOLK[2], [0, 1.6, 0]), null, 50)],
  [I.sleds]: [sh(0, TS(-2.4, 3.4, 11), TS(-2.2, 3.5, 12), TS(0, 1.2, 22), TS(0, 1.4, 26), 54)],
  [I.watch]: [sh(0, TS(2.6, 3, 6), TS(2.4, 3.2, 5.2), [-18, 20, -46], [-20, 22, -50], 60)],
  [I.antlers]: [sh(0, TS(-1, 9, -2), TS(-1.4, 9.2, -3), CW([0, 6, 0]), CW([0, 8, 0]), 36)],
  [I.eyes]: [sh(0, TS(-2, 9.3, -4), TS(-2.3, 9.4, -4.6), CW([0, -6, 2]), CW([0, -6, 2]), 62)],
  [I.lantern]: [shF(0, FOLK[1], 6, 5.4, 2.7, 1.0, 54)],
  [I.ilse]: [sh(0, INF([3.5, 2.6, 3.2]), INF([3.0, 2.5, 2.8]), INF([-1.8, 1.6, -2.4]), null, 56)],
  [I.brask]: [sh(0, [10.5, 3.8, -45], [10.2, 3.7, -44.6], [3.4, 2.8, -41.5], null, 54)],
  [I.quiet]: [sh(0, [-2, 14, -26], [-2, 14.5, -29], [0, 10, -100], null, 52)],
  [I.shaking]: [sh(0, TS(2.8, 2.2, 4), TS(2.6, 2.3, 3.4), TS(-1, 2.2, -6), null, 56, { shake: .25 })],
  [I.taller]: [sh(0, TS(3, 2.5, 6), TS(3, 2.4, 5), [0, 20, -46], [0, 24, -50], 62, { shake: .12 })],
  [I.stepped]: [sh(0, [-50, 26, 30], [-48, 25, 28], [6, 16, -26], [6, 14, -24], 56, { shake: .2 })],
  [I.back]: [sh(0, [30, 14, 22], [30.5, 14.4, 21], [5, 22, -50], [4, 22, -58], 58)],
  [I.stump]: [sh(0, TS(2.5, 2.6, 7.5), TS(2.2, 2.5, 7), TS(-2.6, .8, 2.2), null, 52)],
  [I.doors]: [sh(0, OW(CASAS[4].g, [2.6, 2.8, 9.2]), OW(CASAS[4].g, [2.0, 2.8, 8.6]), OW(CASAS[4].g, [0, 2.6, 3.3]), null, 50)],
  [I.winter]: [sh(0, [-40, 30, 52], [-36, 28, 46], TS(0, 6, 0), TS(0, 6, 0), 54)],
  [I.buried]: [sh(0, [-31, 1.6, 31.5], [-30.6, 1.5, 31.1], [-27, .3, 27.5], null, 56)],
  [I.fences]: [sh(0, INF([2.6, 2.8, 3.2]), INF([2.2, 2.7, 2.8]), INF([-3, 1.2, -3.6]), null, 56)],
  [I.mila]: [sh(0, INF([-1.2, 3.0, 1.6]), INF([-.8, 2.9, 1.2]), INF([3.6, 1.2, -2.2]), null, 54)],
  [I.badcold]: [sh(0, INF([1.6, 2.8, 2.4]), INF([1.2, 2.7, 2.0]), INF([-1.8, 1.9, -2.4]), null, 54)],
  [I.out]: [sh(0, INF([1.2, 2.4, -1.8]), INF([.9, 2.3, -2.0]), INF([-3, .9, -3.8]), null, 52), sh(4, INF([1.2, 2.8, .8]), INF([1.5, 2.7, .5]), INF([3.6, 1.3, -2.2]), null, 50)],
  [I.axe]: [shF(0, ME, 6.5, 6, .5, .8, 52)],
  [I.oldest]: [sh(0, [4, 4, 30], [5, 4, 31], KW(ME, [0, 1.4, 0]), [16, 8, 44], 54)],
  [I.swing]: [sh(0, [5, 5, 46], [5.3, 5, 45.6], [14, 3, 42], null, 60)],
  [I.fell]: [sh(0, [8, 5, 33], [8.4, 5, 33.4], [15, 2, 43], [18, 2, 44], 54)],
  [I.calf]: [sh(0, [12.5, 4.6, 47.5], [12.7, 4.5, 47.3], () => CRIA.cuerpo.getWorldPosition(new THREE.Vector3()).toArray(), null, 42)],
  [I.baby]: [shF(0, ME, 6, 5.6, .9, .6, 54)],
  [I.stood]: [sh(0, [-80, 50, -170], [-77, 52, -176], CW([0, -14, 0]), CW([0, -10, 0]), 60)],
  [I.home]: [sh(0, TS(-2.6, 3.2, 25.5), TS(-2.2, 3.0, 24), KW(ME, [0, 1.4, 0]), TS(3.4, 1.6, 18), 56)],
  [I.lit]: [sh(0, INF([-1.6, 3.0, 3.6]), INF([-1.3, 2.9, 3.2]), INF([2.6, 1.4, -2.2]), null, 60)],
  [I.shook]: [sh(0, INF([-1, 2.8, 1.8]), INF([-.7, 2.8, 1.4]), INF([3.2, 2.6, -4]), null, 54, { shake: .2 })],
  [I.window]: [sh(0, INF([3.4, 3.2, -2.6]), INF([3.2, 3.2, -2.0]), INF([0, 3, 5]), null, 56, { shake: .06 })],
  [I.roof]: [sh(0, INF([-4.6, 2.4, 3.8]), INF([-4.2, 2.5, 3.3]), INF([2.6, 4.6, -1.6]), null, 62, { shake: .15 }), sh(6, INF([-3.6, 3.6, 3.6]), INF([-3.3, 3.5, 3.2]), INF([3.4, 1.6, -2]), null, 52)],
  [I.saw]: [sh(0, INF([4.4, 3.4, -4.4]), INF([4.2, 3.4, -4.1]), INF([1.6, 2.2, 4]), null, 66)],
  [I.stopped]: [sh(0, INF([2.6, 2.8, -3.4]), INF([2.4, 2.8, -3.0]), INF([0, 3, 5]), null, 56)],
  [I.lay]: [sh(0, [-24, 40, -4], [-22, 38, -2], [8, 3, 26], null, 50)],
  [I.breath]: [sh(0, [-2, 8, 4], [-1.6, 8, 4.6], [8, 6, 26], null, 58)],
  [I.morning]: [sh(0, INF([5.6, 3.4, 3.4]), INF([5.4, 3.4, 3.1]), INF([2.4, 1.8, -1.6]), null, 62)],
  [I.gone]: [sh(0, [7, 5, 32], [7.5, 5, 32.5], [17, 2, 44], null, 56)],
  [I.pile]: [sh(0, TS(-4, 5, 34), TS(-3.6, 5.2, 33), TS(-.2, 4, 18), TS(-.2, 5, 18), 56)],
  [I.last]: [sh(0, TS(-4, 5, 33), [-10, 26, 24], TS(-1, 2, 24.5), [6, 30, 120], 50)],
};

// tiempos de inicio de cada toma y cortes; window.SUBF: más sub-cuadros (desenfoque) en los barridos
const TOMAS = []; Object.entries(SHOTS).forEach(([L, list]) => { L = +L; list.forEach((s0, j) => { const a = j === 0 ? S[L] : wt(L, s0.w) - .06; TOMAS.push({ L, j, a, s: s0 }) }) });
TOMAS.sort((a, b) => a.a - b.a); TOMAS.forEach((t, i) => { t.b = TOMAS[i + 1]?.a ?? DUR; t.corte = i === 0 || LUGAR(t.L) !== LUGAR(TOMAS[i - 1].L) || t.s.cut });
const WHIP = .5, tomaAt = t => { let k = 0; for (let i = 0; i < TOMAS.length; i++) if (t >= TOMAS[i].a) k = i; return k };
const WC = .5; window.SUBF = t => { const k = tomaAt(t), T = TOMAS[k], N = TOMAS[k + 1]; return (N && !N.corte && N.a - t < WHIP * .6) || (!T.corte && t - T.a < WHIP * .4) || (N && N.corte && N.a - t < WC) || (T.corte && k > 0 && t - T.a < WC) ? 12 : 3 };
window.SHUTF = t => window.SUBF(t) > 3 ? .6 : .5;
const val = (v, q) => typeof v === "function" ? v(q) : v;
function camAt(T, q) { const s = T.s, p0 = val(s.p, q), p1 = val(s.p1, q), l0 = val(s.l, q), l1 = val(s.l1, q), e = q * q * (3 - 2 * q) * .35 + q * .65;
  return { p: p0.map((v, i) => lerp(v, p1[i], e)), l: l0.map((v, i) => lerp(v, l1[i], e)), f: s.f } }
const QA = new THREE.Quaternion(), QB = new THREE.Quaternion(), MA = new THREE.Matrix4();
// transiciones reales (pedido del dueño, 25-nov-2026, v3): la cámara SE TRASLADA por el pueblo de una toma a la otra en
// ≈ 0,8 s y nunca atraviesa nada. Afuera sube por encima de los techos (y de los pinos si el viaje es largo), cruza y baja;
// adentro de la cabaña se desliza bajo el techo. Para entrar a la cabaña va hasta la ventana de afuera y entra por la
// ventana; para salir, sale por la ventana y se aleja de la casa por la calle.
const TR = .8;
const enTransicion = t => { const k = tomaAt(t), T = TOMAS[k], N = TOMAS[k + 1]; if (N && N.a - t < TR / 2) return [T, N, .5 - (N.a - t) / TR]; if (k > 0 && t - T.a < TR / 2) return [TOMAS[k - 1], T, .5 + (t - T.a) / TR]; return null };
window.SUBF = t => enTransicion(t) ? 12 : 3;
const V_ = (...a) => new THREE.Vector3(...a);
const bez3 = (p0, p1, p2, p3, e) => { const u = 1 - e; return p0.clone().multiplyScalar(u * u * u).add(p1.clone().multiplyScalar(3 * u * u * e)).add(p2.clone().multiplyScalar(3 * u * e * e)).add(p3.clone().multiplyScalar(e * e * e)) };
// la ventana de nuestra cabaña vista desde afuera (la más cercana a la calle) y su normal hacia afuera
const VENTANA = (() => { let v = null; return () => { if (v) return v; NUESTRA.g.updateMatrixWorld(true); let best = null;
  const n = V_(0, 0, 1).transformDirection(NUESTRA.g.matrixWorld).setY(0).normalize(); const meshes = []; NUESTRA.g.traverse(o => { if (o.isMesh && NUESTRA.panes.includes(o.material)) meshes.push(o) });
  meshes.forEach(o => { const p = o.getWorldPosition(V_()); const sc = p.clone().sub(NUESTRA.g.getWorldPosition(V_())).dot(n); if (!best || sc > best.sc) best = { p, sc } });
  const p = (best ? best.p : NUESTRA.g.localToWorld(V_(1.6, 2.4, 3.2))).add(V_(n.z, 0, -n.x).multiplyScalar(.3)).add(V_(0, .3, 0)); v = { p, n }; return v } })();
const VENT_IN = { p: V_(...IN([.75, 3.7, 5])), n: V_(0, 0, 1) };
const altura = (pa, pb, dentro) => { const d = pa.distanceTo(pb); if (dentro) return Math.min(.5, d * .12); if (d < 5) return d * .2; const pico = d < 25 ? 12 : d < 70 ? 20 : 32; return Math.max(d * .1, (pico - Math.min(pa.y, pb.y)) / .75) };
function viaje(pa, la, pb, lb, e, dentro) { const h = altura(pa, pb, dentro); return { pos: bez3(pa, pa.clone().add(V_(0, h, 0)), pb.clone().add(V_(0, h, 0)), pb, e), lk: la.clone().lerp(lb, e) } }
function camara(t) { const k = tomaAt(t), T = TOMAS[k], q = cl((t - T.a) / Math.max(.01, T.b - T.a)); let c = camAt(T, q);
  const mira = (p, l) => { MA.lookAt(p, l, V_(0, 1, 0)); return new THREE.Quaternion().setFromRotationMatrix(MA) };
  let pos = V_(...c.p), lk = V_(...c.l), fov = c.f;
  const tr = enTransicion(t);
  if (tr) { const [A, B, u] = tr, ca = camAt(A, 1), cb = camAt(B, 0), e = eIO(cl(u));
    const pa = V_(...ca.p), pb = V_(...cb.p), la = V_(...ca.l), lb = V_(...cb.l), dA = LUGAR(A.L) === "adentro", dB = LUGAR(B.L) === "adentro";
    if (dA === dB) { const v = viaje(pa, la, pb, lb, e, dA); pos = v.pos; lk = v.lk; fov = lerp(ca.f, cb.f, e) }
    else { const W = VENTANA(), afuera0 = W.p.clone().addScaledVector(W.n, 5).add(V_(0, .6, 0)), afuera1 = W.p.clone().addScaledVector(W.n, .35), dentro1 = VENT_IN.p.clone().addScaledVector(VENT_IN.n, -.4), dentro0 = VENT_IN.p.clone().addScaledVector(VENT_IN.n, -2.6);
      const adentroDe = W.p.clone().addScaledVector(W.n, -3), haciaAdentro = VENT_IN.p.clone().addScaledVector(VENT_IN.n, -5), haciaAfuera = VENT_IN.p.clone().addScaledVector(VENT_IN.n, 3), afueraDe = W.p.clone().addScaledVector(W.n, 6);
      if (!dA) { // de afuera hacia adentro: viaja hasta la ventana, se acerca al vidrio y aparece adentro, alejándose de la ventana
        if (u < .5) { const w = u / .5; if (w < .7) { const v = viaje(pa, la, afuera0, adentroDe, eIO(w / .7), false); pos = v.pos; lk = v.lk } else { const z = eIO((w - .7) / .3); pos = afuera0.clone().lerp(afuera1, z); lk = adentroDe } fov = lerp(ca.f, 56, w) }
        else { const w = (u - .5) / .5; if (w < .3) { pos = dentro1.clone().lerp(dentro0, eOut(w / .3)); lk = haciaAdentro } else { const v = viaje(dentro0, haciaAdentro, pb, lb, eIO((w - .3) / .7), true); pos = v.pos; lk = v.lk } fov = lerp(56, cb.f, w) } }
      else { // de adentro hacia afuera: va hasta la ventana de adentro, sale por el vidrio y se aleja de la casa
        if (u < .5) { const w = u / .5; if (w < .7) { const v = viaje(pa, la, dentro0, haciaAfuera, eIO(w / .7), true); pos = v.pos; lk = v.lk } else { const z = eIO((w - .7) / .3); pos = dentro0.clone().lerp(dentro1, z); lk = haciaAfuera } fov = lerp(ca.f, 56, w) }
        else { const w = (u - .5) / .5; if (w < .3) { pos = afuera1.clone().lerp(afuera0, eOut(w / .3)); lk = afueraDe } else { const v = viaje(afuera0, afueraDe, pb, lb, eIO((w - .3) / .7), false); pos = v.pos; lk = v.lk } fov = lerp(56, cb.f, w) } } } }
  let quat = mira(pos, lk);
  if (T.s.shake) { const a = T.s.shake; pos.x += Math.sin(t * 23) * a + Math.sin(t * 37) * a * .5; pos.y += Math.sin(t * 29 + 1) * a }
  pos.x += Math.sin(t * 1.3) * .015; pos.y += Math.sin(t * 1.7 + 1) * .012;   // cámara en mano, muy suave
  cam.position.copy(pos); cam.quaternion.copy(quat); if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix() } }


// ---------- la escena en cada instante
function setScene(t) {
  const L = lineAt(t), lt = t - s(L), len = (S[L + 1] ?? DUR) - s(L), k = P(lt, 0, len), Wd = kk => wt(L, kk);
  POST = { flash: 0, sepia: 0 };
  if (!ENV.nieve) { ENV.nieve = { top: "#0c1630", hor: "#4a5a7c", fog: .0045, hemi: 1.05, hemiG: "#d0dcf0", sun: 1.7, sunCol: "#b0c4f0", exp: 1.55, grade: ["#ffffff", 0] }; ENV.casa = { top: "#0c1630", hor: "#1a1e2a", fog: .002, hemi: .95, hemiG: "#3a2a20", sun: .2, sunCol: "#a8b8e0", exp: 1.9, grade: ["#ffffff", 0] }; ENV.alba = { top: "#7a9ad0", hor: "#f0d8c8", fog: .004, hemi: 1.3, hemiG: "#d8e0f0", sun: 2.4, sunCol: "#ffd8b0", exp: 1.25, grade: ["#ffffff", 0] } }
  ALL.forEach(c => { if (c.polvo) c.polvo.forEach(q => q.visible = false); c.body.rotation.z = 0; c.head.rotation.z = 0; c.g.visible = false; c.g.scale.set(1, 1, 1); c.body.rotation.set(0, 0, 0); c.body.position.y = 0; c.head.rotation.set(0, 0, 0); power(c, null, 0); c.aura.visible = false; setFace(c, "neutral"); pose(c, t, {}) });
  [PALA, REGLA, TELESC, HOYO, HACHA, TRINEO, LINTERNA].forEach(o => o.visible = false); LINT_GL.visible = false; sinCiervos(); OJO.visible = false; ASTA_T.visible = false; PILA.visible = false; ASTILLAS.forEach(a => a.visible = false);
  const lugar = LUGAR(L), manana = (L >= I.morning && L <= I.pile) || L === I.sleds; setEnv(lugar === "adentro" && !manana ? "casa" : manana ? "alba" : "nieve"); if (lugar === "recuerdo") POST.sepia = .42;
  HOUSES.forEach(H => { H.panes.forEach(p => p.emissiveIntensity = manana ? 0 : 1.2); H.glows.forEach(g => g.visible = !manana) });
  FAROLES.forEach(f => { f.userData.gl.position.copy(f.localToWorld(new THREE.Vector3(0, 3.2, 0))); f.userData.gl.visible = !manana });
  tortuga(t, { paso: 0 }); noche(t, !manana && lugar !== "adentro"); LUCES.forEach(l => l.visible = false); ESTRELLAS.visible = !manana;
  CASAS[1].g.visible = true; CASAS[1].g.scale.set(1, 1, 1); CASAS[1].g.position.set(CASAS[1].lx, SY(CASAS[1].lx, CASAS[1].lz) - .3, CASAS[1].lz); CASAS[1].g.rotation.set(0, -Math.PI / 2, 0); if (L > I.stepped && L <= I.back) CASAS[1].g.scale.set(1, .15, 1.2); if (L === I.stepped) { const q = eIO(P(k, .45, .7)); CASAS[1].g.scale.set(1, lerp(1, .15, q), lerp(1, 1.2, q)) }
  // el pino viejo: parado hasta el hook; cae en «hook» y en «fell»; después queda acostado
  { const tr = VIEJO.userData.tronco, cae = L === I.hook ? eIO(P(k, .15, .95)) : L === I.fell ? eIO(P(k, 0, .6)) : (L > I.fell || L === I.stood0) ? 1 : (L >= I.oldest && L <= I.swing) ? 0 : 0; tr.rotation.set(0, 0, -cae * 1.5); tr.position.set(cae * 1.2, 1.2 * (1 - cae), 0); VIEJO.userData.tapa.visible = cae > .05; if ((L === I.swing) && Math.sin(t * 7) > .7) tr.rotation.z = -.01 }
  const crowd = list => list.forEach(([c, x, z, ry, f = "neutral", walk = 0]) => { placeW(c, x, z, ry); setFace(c, f); if (walk >= 1.2) { const d = Math.min(lt * 3.2, 9), nx = x + Math.sin(ry) * d, nz = z + Math.cos(ry) * d; placeW(c, nx, nz, ry); correr(c, t + x * 3) } else if (walk > 0) { const d = (lt - len / 2) * 1.5 * walk, nx = x + Math.sin(ry) * d, nz = z + Math.cos(ry) * d; placeW(c, nx, nz, ry); pose(c, t + x, { walk }); c.body.rotation.z = Math.sin((t + x) * 8) * .045 } else pose(c, t + x, { walk }) });
  let LL = [];
  // nieve que cae alrededor de la cámara (más fuerte en «winter», nada en «quiet» ni a la mañana)
  copos(t, cam.position, L === I.quiet || manana || lugar === "adentro" ? 0 : L === I.winter ? 1.6 : 1); COPOS.material.size = L === I.winter ? .7 : .5;
  // el Watcher según la frase
  const W = WATCHER, eyeL = []; const enMonte = (subir) => ciervoPose(W, t, { x: MONTE[0], y: MONTE[1], z: MONTE[2], ry: .15, echado: 1 - subir, sube: subir * .6 });
  if (L === I.stood0) enMonte(eIO(k)); if (L === I.stood) enMonte(eIO(P(k, 0, .7)));
  if (L === I.cost) ciervoPose(W, t, { x: 0, y: 0, z: -92 + k * 8, paso: 1, baja: .2 });
  if (L >= I.watch && L <= I.lantern) ciervoPose(W, t, { x: LINDE[0], y: 0, z: LINDE[2], ry: .4, baja: L === I.eyes ? .9 : .1, echado: L === I.eyes ? .35 : 0, gira: Math.sin(t * .3) * .2 });
  
  if (L === I.shaking) ciervoPose(W, t, { x: 0, y: 0, z: -70 + k * 4, paso: 1 });
  if (L === I.taller) ciervoPose(W, t, { x: 1, y: 0, z: -62 + k * 10, paso: 1, sube: .2 });
  if (L === I.stepped) ciervoPose(W, t, { x: 6.8, y: 0, z: -29 + k * 2, paso: .6, baja: .5 });
  if (L === I.back) ciervoPose(W, t, { x: 6.8, y: 0, z: -30 - k * 22, ry: Math.PI, paso: 1 });
  if (L === I.home) ciervoPose(W, t, { x: -20, y: 20, z: -150 + k * 20, paso: 1.2, ry: .2 });
  if (L === I.lay || L === I.breath) ciervoPose(W, t, { x: 8, y: ALT(8, 30) - .9, z: 30.5, ry: Math.PI / 2, echado: 1, gira: L === I.breath ? .5 : .2, baja: .3, aliento: L === I.breath ? 1 : .4 });
  if (L === I.last) ciervoPose(W, t, { x: 6, y: 0, z: 120, ry: Math.PI, baja: .1 });
  // el ojo en la ventana y el cuerno en el techo
  if ([I.window, I.saw, I.stopped].includes(L) && !(L === I.stopped && k > .35)) { OJO.visible = true; OJO.position.set(...IN([0, 3, 8.9 + (L === I.window ? (1 - eOut(k)) * 2 : 0)])); const parp = L === I.stopped && k > .5 ? P(k, .5, .8) * .6 : 0; OJO.userData.sup.rotation.x = parp; OJO.userData.ojo.material.emissiveIntensity = L === I.stopped ? .7 - k * .4 : .7 }
  { const roto = (L === I.roof && k > .22) || (L > I.roof && L < I.gone); techoRoto(t, roto, L === I.roof ? P(k, .2, .5) : 1); ASTA_REAL.visible = L === I.roof && k < .5; ASTA_REAL.position.set(3.1, 7.4 + (L === I.roof ? (1 - eOut(P(k, 0, .3))) * 4 : 0) - (L === I.stopped ? P(k, .2, .6) * 3 : 0), -1.85) }
  TABLAS_ROTAS.forEach((m, i) => { const q = L === I.roof ? P(k, .1 + i * .02, .5 + i * .03) : 0; m.visible = L === I.roof && q > 0; m.position.set(600 + 2.6 + Math.sin(i * 2.3) * 1.4, 200 + 7 - q * q * 6.8, 600 + 1 + Math.cos(i * 1.7) * 1.2); m.rotation.set(q * 6 + i, i, q * 4) });
  // fuego de la chimenea: bajo, apagado, prendido
  hogar(t, L === I.ilse ? .6 : L === I.fences ? .8 : (L === I.mila || L === I.badcold || L === I.out) ? 0 : (L >= I.lit && L <= I.morning) ? 1 : 0); humoP(t, lugar === "adentro" ? 0 : 1);
  fuegoChimenea(t, L === I.ilse ? .6 : L === I.fences ? .8 : (L === I.mila || L === I.badcold || L === I.out) ? 0 : (L >= I.lit && L <= I.morning) ? 1 : 0);
  if (lugar === "adentro") { LUCES_IN.forEach((f, i) => i < 2 && LL.push([f.getWorldPosition(new THREE.Vector3()).toArray(), 1.6, "#ffc070", 9])); const fa = (L === I.mila || L === I.badcold || L === I.out) ? 0 : 1; LL.push([IN([-3, 1.4, -3]), 3.2 * fa * (.85 + .15 * Math.sin(t * 13)), "#ff9a40", 14]); LL.push([IN([0, 4, 5.6]), L === I.window || L === I.saw || L === I.stopped ? 2.5 : .9, "#bfe6ff", 10]); if (L >= I.roof && L <= I.morning) LL.push([IN([3, 6.4, -1.8]), manana ? 3 : 2.4, manana ? "#fff0d8" : "#bfd8ff", 11]); LL.push([IN([-4, 4.6, 3.5]), 1.2, "#ffc888", 10]) }
  if ([I.hook, I.stood0, I.oldest, I.fell, I.calf, I.baby, I.swing, I.gone].includes(L)) LL.push([[11, 6, 38], 2.6, "#bcd4ff", 18]); if (L === I.calf) LL.push([[18, 4, 41], 2.2, "#d8e8ff", 8]);
  if (lugar !== "adentro" && !manana) FAROLES.forEach(f => LL.length < 4 && LL.push([f.localToWorld(new THREE.Vector3(0, 3.2, 0)).toArray(), 2.4, "#ffb060", 12]));
  // tazas que se caen del estante
  CASA_IN.userData.tazas.forEach((c, i) => { const q = L === I.shook ? P(k, .25 + i * .1, .55 + i * .1) : L > I.shook ? 1 : 0; c.position.set(3.6 + i * .5 + q * .3, 3.62 - q * q * 3.5 + (L === I.shook && q === 0 ? Math.abs(Math.sin(t * 30 + i)) * .03 : 0), -4.6 + q * .8); c.rotation.set(q * 2, 0, q * 1.4) });
  // la cría: en el hueco del pino, después en los brazos, después en la cama al lado de Mila
  const cria = (x, y, z, ry = 0, eche = 1, tiembla = 0) => ciervoPose(CRIA, t, { x, y, z, ry, echado: eche, tiembla, baja: .4 });
  if (L === I.fell && k > .6 || L === I.calf) cria(PINO[0], 1.35, PINO[1] + .2, -2.4, 1, 1);
  if ([I.lit, I.shook, I.window, I.roof, I.saw, I.stopped].includes(L)) { const p = IN([2.9, .95, -.9]); cria(p[0], p[1], p[2], Math.PI, 1, L === I.lit ? .5 : 0) }

  switch (L) {
    case I.hook: case I.swing: { placeW(ME, 12.6, 40.3, .75); ME.g.visible = true; setFace(ME, L === I.hook ? "terrified" : "determined"); attach(HACHA, ME, "R", [0, -.2, .2]); const sw = Math.sin(t * (L === I.hook ? 3 : 6)); pose(ME, t, { armFwd: 1.2 + sw * .6 }); ME.body.rotation.x = .2 + sw * .12; HACHA.rotation.set(.3 + sw * .5, 0, 0);
      if (L === I.swing) ASTILLAS.forEach((a, i) => { const q = (t * 1.5 + i / 24) % 1; a.visible = true; a.position.set(15.4 + q * (Math.sin(i) * 2), 1.4 + q * 2 - q * q * 3, 43 + q * Math.cos(i * 1.7) * 2); a.rotation.set(q * 9, i, q * 5) }); break }
    case I.stood0: placeW(ME, 12.6, 40.3, .75); setFace(ME, "horrified"); attach(HACHA, ME, "R", [0, -.2, .2]); break;
    case I.rule: case I.valley: crowd([[FOLK[0], -1.6, -6, .4, "neutral", .8], [FOLK[3], 1.8, 6, Math.PI, "neutral", .8], [EXT[2], -6, 1.4, 1.6, "neutral", .8]]); break;
    case I.burn: crowd([[FOLK[2], -1.4, 8, Math.PI - .3, "neutral", .6]]); attach(TRINEO, FOLK[2], "R", [0, -.9, .6]); TRINEO.rotation.set(0, Math.PI, 0); pose(FOLK[2], t, { armFwd: .5, walk: .6 }); break;
    case I.sleds: crowd([[ME, -.8, 22, 0, "neutral", .9], [ME6, .8, 21, 0, "happy", .9], [EXT[0], 2.2, 19.5, .1, "happy", .9], [EXT[3], -2.2, 20, -.1, "neutral", .9]]); attach(TRINEO, ME, "R", [0, -1.0, -.8]); TRINEO.rotation.set(0, 0, 0); break;
    case I.watch: case I.antlers: case I.eyes: crowd([[FOLK[0], -2.6, -3.6, -2.75, "worried"], [FOLK[4], -.6, -4.8, -2.6, "scared"]]); break;
    case I.lantern: crowd([[FOLK[1], -6, -27, -2.62, k > .55 ? "terrified" : "scared"]]); attach(LINTERNA, FOLK[1], "R", [0, -.2, .3]); pose(FOLK[1], t, { armFwd: .7 }); { const gl = P(k, .55, .75); LINT_GL.visible = gl < 1; LINT_GL.position.copy(LINTERNA.getWorldPosition(V3)); LINT_GL.material.opacity = .7 * (1 - gl); LINTERNA.children[0].material.emissiveIntensity = 2 * (1 - gl) } break;
    case I.buried: TRINEO.visible = true; if (TRINEO.parent !== scene) scene.add(TRINEO); TRINEO.position.set(-28, -.42, 28.4); TRINEO.rotation.set(.25, .6, .1); break;
    case I.ilse: case I.fences: case I.badcold: placeIn(GARROW, -1.8, 0, -2.4, .8); GARROW.g.visible = true; setFace(GARROW, L === I.badcold ? "worried" : L === I.fences ? "sad" : "neutral"); pose(GARROW, t, { sit: L === I.ilse ? .5 : 0, armFwd: L === I.fences ? .8 : 0 }); if (L === I.ilse) GARROW.g.position.y -= .25;
      if (L !== I.ilse) { placeIn(ME6, 3.6, 1.35, -2.2, 0); ME6.body.rotation.x = -Math.PI / 2 + .05; setFace(ME6, "sleepy") } break;
    case I.mila: case I.out: placeIn(ME6, 3.6, 1.35, -2.2, 0); ME6.body.rotation.x = -Math.PI / 2 + .05; setFace(ME6, "sleepy"); placeIn(GARROW, 2.0, 0, -4.1, Math.PI / 2); setFace(GARROW, "worried"); pose(GARROW, t, { armFwd: .5 }); break;
    case I.axe: crowd([[ME, 2.4, 22.4, -2.2, "determined"]]); attach(HACHA, ME, "R", [0, -.2, .2]); pose(ME, t, { lift: .3 }); break;
    case I.oldest: { const q = eIO(k); placeW(ME, lerp(9.8, 12.6, q), lerp(33.6, 40.3, q), .4); ME.g.visible = true; setFace(ME, "determined"); attach(HACHA, ME, "R", [0, -.2, .2]); pose(ME, t, { walk: 1 }); break }
    case I.fell: case I.calf: placeW(ME, 12.4, 40.0, .75); setFace(ME, L === I.calf ? "shock" : "scared"); attach(HACHA, ME, "R", [0, -.2, .2]); break;
    case I.baby: { placeW(ME, 12.4, 40.0, .75); setFace(ME, "shock"); pose(ME, t, { armFwd: 1 }); const p = KW(ME, [Math.sin(ME.g.rotation.y) * 1.0, 1.3, Math.cos(ME.g.rotation.y) * 1.0])(); ciervoPose(CRIA, t, { x: p[0], y: p[1] - .5, z: p[2], ry: ME.g.rotation.y, echado: 1 }); break }
    case I.stood: break;
    case I.brask: placeW(PIM, 4.45, -40.45, -2.27); setFace(PIM, "determined"); attach(HACHA, PIM, "R", [0, -.2, .2]); { const sw = Math.sin(t * 6); pose(PIM, t, { armFwd: 1.2 + sw * .6 }); PIM.body.rotation.x = .2 + sw * .12; HACHA.rotation.set(.3 + sw * .5, 0, 0) } break;
    case I.quiet: case I.shaking: crowd([[FOLK[3], 1.8, -4, Math.PI, "scared"], [EXT[1], -1.2, -5.5, Math.PI, "terrified"]]); break;
    case I.taller: case I.stepped: crowd([[FOLK[3], .8, -4, 0, "panic", 1.4], [EXT[1], -.8, -6, 0, "panic", 1.4]]); break;
    case I.home: { const q1 = eIO(P(k, 0, .62)), q2 = P(k, .62, .95); if (k < .62) { placeW(ME, lerp(12, 1.0, q1), lerp(30, 18.2, q1), Math.atan2(1 - 12, 18.2 - 30)); correr(ME, t) } else { const ry = lerp(Math.atan2(1 - 12, 18.2 - 30), Math.PI / 2, P(k, .62, .7)); placeW(ME, lerp(1.0, 4.2, q2), 18.2, ry); pose(ME, t, { walk: 1 }); if (q2 > .85) ME.g.visible = false } ME.g.visible = ME.g.visible && k < .95; setFace(ME, "panic"); const p = KW(ME, [Math.sin(ME.g.rotation.y) * 1.0, 1.3, Math.cos(ME.g.rotation.y) * 1.0])(); ciervoPose(CRIA, t, { x: p[0], y: p[1] - .5, z: p[2], ry: ME.g.rotation.y, echado: 1 }); pose(ME, t, { armFwd: 1 }); break }
    case I.lit: case I.shook: case I.window: case I.roof: case I.saw: case I.stopped:
      placeIn(ME6, 3.6, 1.35, -2.2, 0); ME6.body.rotation.x = -Math.PI / 2 + .05; setFace(ME6, L === I.lit ? "sleepy" : "scared"); placeIn(ME, .4, 0, -2.6, Math.PI / 2); setFace(ME, { [I.lit]: "worried", [I.shook]: "terrified", [I.window]: "horrified", [I.roof]: "terrified", [I.saw]: "scared", [I.stopped]: "shock" }[L]); if (L >= I.window) ME.g.rotation.y = 0;
      placeIn(GARROW, -2.2, 0, -1.2, .9); setFace(GARROW, L >= I.shook ? "terrified" : "worried"); pose(GARROW, t, { cover: L >= I.window ? .6 : 0 }); break;
    case I.lay: case I.breath: break;
    case I.morning: placeIn(ME6, 3.6, 1.0, -1.4, 0); setFace(ME6, "laugh"); pose(ME6, t, { sit: 1, laugh: 1 }); ME6.g.position.y += .55; placeIn(ME, 2.0, 0, -1.4, 1.2); setFace(ME, "happy"); placeIn(GARROW, 1.0, 0, -2.6, 1.4); setFace(GARROW, "relieved"); break;
    case I.gone: break;
    case I.pile: PILA.visible = true; PILA.position.set(-.2, ALT(-.2, 18), 18); PILA.scale.setScalar(1.5); crowd([[ME, -2.2, 24.5, 2.79, "shock"], [ME6, -.4, 25.2, 2.95, "excited"]]); break;
    case I.last: PILA.visible = true; PILA.position.set(-.2, ALT(-.2, 18), 18); PILA.scale.setScalar(1.5); crowd([[ME, -2.2, 24.5, .2, "warm"], [ME6, -.4, 25.2, .1, "happy"]]); break;
  }
  if (L === I.stood0) { const p = TS(-6, 0, -24)(); }
  lights(LL); camara(t);
}


// ---------- capa 2D: color ocre por escena, viñeta y subtítulos estilo Volze (una palabra, minúscula, amarillo, contorno negro grueso, 75 % del alto)
const VIG2 = (() => { const c = mk(W, H), g = c.getContext("2d"), r = g.createRadialGradient(W / 2, H * .48, Math.min(W, H) * .28, W / 2, H * .48, Math.max(W, H) * .6); r.addColorStop(0, "rgba(0,0,0,0)"); r.addColorStop(1, "rgba(10,5,0,.32)"); g.fillStyle = r; g.fillRect(0, 0, W, H); return c })();
let POST = {};
COMP = new EffectComposer(R); COMP.setPixelRatio(1); COMP.setSize(W, H); COMP.addPass(new RenderPass(scene, cam)); try { const { GTAOPass } = await import("three/addons/postprocessing/GTAOPass.js"); const ao = new GTAOPass(scene, cam, W, H); ao.updateGtaoMaterial({ radius: .8, distanceExponent: 1.5, thickness: 1.5, scale: 1.2 }); ao.blendIntensity = .9; const aoR = ao.render.bind(ao); ao.render = (...q) => { const oc = []; scene.traverse(o => { if (o.isSprite && o.visible) { o.visible = false; oc.push(o) } }); aoR(...q); oc.forEach(o => o.visible = true) }; COMP.addPass(ao) } catch (e) { console.log("sin GTAO", e.message) } COMP.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), .42, .5, .8)); COMP.addPass(new OutputPass());
const SUBY = L => [I.calf, I.buried, I.stump].includes(L) ? .22 : .75;   // sube al 22 % cuando la acción está abajo
function subV(t) {
  let i = -1; for (let k = 0; k < WORDS.length; k++) if (t >= WORDS[k][0]) i = k; if (i < 0 || !WORDS[i][1]) return;
  const w = WORDS[i][1].toLowerCase().replace(/[.,!?"“”]/g, ""), edad = t - WORDS[i][0], size = 112, y = H * SUBY(lineAt(t));
  const sc = RES(.55, 1, edad, 600, 16); X.save(); X.translate(W / 2, y); X.scale(sc, sc); X.font = `800 ${size}px 'Baloo 2'`; X.textAlign = "center"; X.textBaseline = "middle"; X.lineJoin = "round";
  X.shadowColor = "rgba(0,0,0,.55)"; X.shadowBlur = 0; X.shadowOffsetY = 7; X.lineWidth = size * .22; X.strokeStyle = "#000"; X.strokeText(w, 0, 0); X.shadowColor = "transparent"; X.fillStyle = "#fff200"; X.fillText(w, 0, 0); X.restore();
}
function overlay(t) {
  const gr = ENV[ENVNOW].grade; X.globalAlpha = gr[1]; X.globalCompositeOperation = "soft-light"; X.fillStyle = gr[0]; X.fillRect(0, 0, W, H); X.globalCompositeOperation = "source-over"; X.globalAlpha = 1; X.drawImage(VIG2, 0, 0);
  if (POST.flash > 0) { X.globalAlpha = Math.min(1, POST.flash); X.fillStyle = "#fff6e0"; X.fillRect(0, 0, W, H); X.globalAlpha = 1 }
  if (POST.sepia > 0) { X.globalAlpha = POST.sepia * .55; X.globalCompositeOperation = "color"; X.fillStyle = "#b08a5a"; X.fillRect(0, 0, W, H); X.globalCompositeOperation = "source-over"; X.globalAlpha = 1 }
  subV(t);
}
window.DBG = { cam, ALL, ME, QUILL, PIM, GARROW, TURT, WATCHER, THREE, TOMAS };