// ★ HISTORIA "Keep Your Boots On" — estilo Volze medido cuadro a cuadro (referencia/estilo-volze-medido.md), 3:4
// Dustmere, pueblo de adobe en el desierto: nadie sopla el cuerno de la torre, porque baja Onetusk, la bestia de un solo colmillo.
// El narrador lo sopla para guiar a su hermana Bee en la tormenta; el cuerno era el otro colmillo de Onetusk. Personajes propios.
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
cartelito(PANADERIA, "BAKERY"); cartelito(ESCUELA, "SCHOOL", "#2a3a5a"); cartelito(CASAS[3], "POTS", "#5a4a1a");
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

// ================= «NOBODY HEARS THE BELL»: lo común (medidas del mundo) — lo usan la ciudad, la campana, el elenco y las escenas =================
// Norte = −z. Underbell es una ciudad de piedra en terrazas, en un valle rodeado de cuatro montañas. Sobre la ciudad cuelga una
// campana de bronce más ancha que la ciudad, de cuatro cadenas (una a cada montaña). La cadena del ESTE baja hasta un risco al
// borde de la ciudad: ahí está «el primer eslabón», al que se llega por una escalera tallada (Nell sube ahí al final).
const sstB = (a, b, v) => { const q = Math.max(0, Math.min(1, (v - a) / (b - a))); return q * q * (3 - 2 * q) };
const PLAZA_B = [0, 0];                                         // la plaza con la FUENTE (tallado: «PLUG YOUR EARS. REMEMBER.»)
const TIENDA = [0, -22];                                        // la tienda de cera de Mister Sallow: bajo el centro de la campana, siempre en sombra
const CASA_NELL = [16, 12];                                     // la casa del narrador y Nell
const RISCO_E = [118, 6];                                       // el risco del este, borde de la ciudad, con la escalera al primer eslabón
const CAMPANA_C = [0, -10];                                     // centro de la campana en planta
const CAMPANA_Y = 150;                                          // altura del BORDE de abajo (labio) de la campana
const CAMPANA_R = 95;                                           // radio del labio (≈ más ancha que la ciudad, que mide ≈ 160)
const CAMPANA_H = 150;                                          // alto de la campana (del labio a la corona)
const CORONA = [CAMPANA_C[0], CAMPANA_Y + CAMPANA_H, CAMPANA_C[1]];   // donde se enganchan las cuatro cadenas
// las cuatro montañas (cimas) y la cadena que va a cada una; la del este baja al risco y SE TREPA
const MONTES = { norte: [0, 260, -520], sur: [0, 240, 520], oeste: [-520, 250, 0], este: [RISCO_E[0], 34, RISCO_E[1]] };
// altura del piso: valle de la ciudad en terrazas (sube hacia afuera), montañas a lo lejos, risco del este
const ALT_B = (x, z) => { const r = Math.hypot(x, z); const terr = Math.floor(sstB(20, 110, r) * 5) * 3.2 + sstB(20, 110, r) * 1.5;
  const risco = 30 * Math.exp(-(((x - RISCO_E[0]) / 22) ** 2 + ((z - RISCO_E[1]) / 30) ** 2));
  const montes = 230 * sstB(220, 520, r) * (.75 + .25 * Math.sin(Math.atan2(z, x) * 4 + 1)); return terr + Math.max(risco, 0) + montes };
// climas de luz del video (el agente de la ciudad los define; los usa todo el mundo): "mediodia" (sombra de la campana
// cruzando la ciudad), "atardecer" (campana de cobre brillante), "noche" (luna + miles de velas), "sallow" (sombrío: frío,
// niebla baja, velas que tiemblan), "dentro" (adentro de la campana: oscuro, un rayo de luna por la corona)

// ================= «WE HOLD UP THE SKY»: lo común (medidas del mundo) — lo usan el pueblo, el cielo, el elenco y las escenas =================
// Norte = −z. El cielo es una TAPA de tablones pintada de celeste (con nubes y un sol blanco pintados) que tapa el mundo entero; cada
// calle la sostiene con UN poste gigante con un gato de rosca y una manivela abajo. Sobre la tapa hay campos de trigo al sol de verdad.
// La tapa está baja sobre las calles pobres (sur, z > −20) y sube hacia la Loma (norte), donde vive Kell y el cielo está altísimo.
const sst_ = (a, b, v) => { const q = Math.max(0, Math.min(1, (v - a) / (b - a))); return q * q * (3 - 2 * q) };
const CALLE_MIA = { z: 0, x0: -34, x1: 34 };                    // nuestra calle («Crank Row»), a lo largo de x
const POSTE_MIO = [0, 0];                                       // EL poste de nuestra calle, en la plazoleta, con la casilla de la manivela al lado
const CASA_YO = [-9, 6];                                          // la casa del narrador (frente a la calle, lado sur)
const TANNER = { z: 26, x0: -30, x1: 30 };                      // Tanner Street: la calle aplastada (en el recuerdo cae la tapa sobre ella)
const POSTE_NUEVE = [-8, 26];                                   // donde estaba Pole Nine (después aparece en la Loma)
const LOMA = [0, -95], LOMA_H = 9;                               // la Loma de Kell: mansiones, muchos postes dorados, barriletes
const POSTE_NUEVE_LOMA = [10, -84];                             // Pole Nine ya plantado en la Loma
const CIELO_Y0 = 12.2;                                          // «forty feet up»: altura de la tapa sobre nuestra calle (cara de abajo)
const LID_T = 1.3;                                              // espesor de la tapa (vigas + tablones); arriba va 0,4 de tierra y el trigo
// cara de ABAJO de la tapa en (x, z), sin hundimiento: baja (12,2) en el sur, sube hacia la Loma hasta ≈ 36
const CIELO = (x, z) => CIELO_Y0 + 24 * sst_(-25, -110, z) + 1.2 * sst_(30, 90, z) + .25 * Math.sin(x * .05) * Math.sin(z * .04);
// panel de la tapa que se hunde sobre nuestra calle (y que al final cae entero con el campo de arriba)
const PANEL_MIO = { x0: -26, x1: 26, z0: -10, z1: 11 };
const AGUJERO = [1.4, .2];                                      // donde el narrador corta el agujero, junto a la punta de nuestro poste
const SOL_PINTADO = [18, -46];                                  // el sol pintado (círculo blanco) en la cara de abajo de la tapa
const ESCALERA_KELL = [6, -80];                                 // la escalera de Kell sube de la Loma por una trampa hasta arriba de la tapa
// altura del piso: pueblo plano y la Loma que sube al norte
const ALT_C = (x, z) => LOMA_H * sst_(-35, -100, z) * (1 - .25 * sst_(40, 90, Math.abs(x))) + .15 * Math.sin(x * .13) * Math.sin(z * .11);
// las calles: una fila de casas a cada lado y un poste por calle (z de la calle, x del poste)
const CALLES = [{ z: -52, poste: 14 }, { z: -26, poste: -12 }, { z: 0, poste: 0 }, { z: 26, poste: -8, aplastada: true }, { z: 52, poste: 6 }];

// ---------- LEGADO de Gusthollow (el pueblo del viento: solo para que lo viejo siga armando mientras se reemplaza; BORRAR al integrar)
const VDIR = [1, 0, 0];                                         // hacia dónde sopla el viento (todo se inclina/flamea hacia acá)
const PLAZA = [0, 0], TORRE = [0, -10], TORRE_H = 14;           // torre de piedra de 14 de alto, cuadrada; arriba la VELETA
const VELETA_Y = TORRE_H + 2.2;                                 // altura del eje de la veleta (Pip se cuelga de ahí)
const COLINA = [-26, 18], COLINA_H = 7;                          // la loma pelada al oeste de la torre, donde Pip remonta la cometa
const CASA_MIA = [10, 14];                                      // la casa del narrador y Pip
const PANAD = [-12, -3];                                        // la panadería (su techo sale volando hacia +x)
const SIERRA_X = 150, SIERRA_H = 70;                            // la cordillera del este: cresta en x ≈ 150, picos de ≈ 70 con nieve arriba de 45
const VALLE = [520, 0], VALLE_Y = 2;                            // el valle verde sin viento (centro), del otro lado; plano a la altura 2
// altura del piso: valle de pasto ralo casi plano en el pueblo, la loma de Pip, sierras bajas al norte/sur/oeste y la cordillera al este;
// después de la cordillera baja al valle verde (plano)
const ALT = (x, z) => {
  const sst = (a, b, v) => { const q = cl((v - a) / (b - a)); return q * q * (3 - 2 * q) };
  const loma = COLINA_H * Math.exp(-(((x - COLINA[0]) / 13) ** 2 + ((z - COLINA[1]) / 11) ** 2));
  // las lomas y los montes que rodean el valle (norte, sur y oeste): una loma pareja hasta r ≈ 140 y después montes con picos (se apagan hacia el este)
  const r = Math.hypot(x * .8, z), an = Math.atan2(z, x * .8), montes = sst(115, 235, r) * (40 + 22 * Math.sin(an * 5 + 1.3) + 13 * Math.sin(an * 11 + .4) + 8 * Math.sin(an * 23 + r * .03)) * (.72 + .28 * Math.sin(r * .043 + an * 3));
  const anillo = (34 * sst(70, 140, r) * (1 + .12 * Math.sin(an * 7 + 2)) + montes) * (1 - sst(150, 260, x));
  const sierra = SIERRA_H * Math.exp(-(((x - SIERRA_X) / 38) ** 2)) * (.75 + .25 * Math.sin(z * .021 + 1.3));
  const valle = VALLE_Y * sst(220, 330, x);
  return loma + anillo + sierra * (1 - sst(240, 330, x) * 0) + valle;
};
const placeW = (k, x, z, ry = 0) => { k.g.visible = true; k.g.position.set(x, ALT(x, z), z); k.g.rotation.set(0, ry, 0) };
const mergeG = list => { const gs = list.map(([g, m]) => { const q = g.index ? g.toNonIndexed() : g.clone(); q.applyMatrix4(m); return q }); const n = gs.reduce((a, q) => a + q.attributes.position.count, 0);
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2); let o = 0; gs.forEach(q => { pos.set(q.attributes.position.array, o * 3); nor.set(q.attributes.normal.array, o * 3); if (q.attributes.uv) uv.set(q.attributes.uv.array, o * 2); o += q.attributes.position.count });
  const G = new THREE.BufferGeometry(); G.setAttribute("position", new THREE.BufferAttribute(pos, 3)); G.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); G.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); return G };
const MZ = (p, dir, s) => new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize()), s);


// ---------- LEGADO de Dustmere (solo para que lo viejo siga armando mientras se reemplaza; BORRAR cuando nadie lo use)
const CRESTA = [0, -160], CRESTA_H = 24;                        // donde está parado Onetusk hace 60 años (sobre la cresta, a 24 de alto)
const COLMILLO_L = 20;                                          // largo del colmillo y del cuerno (el mismo: «long as three houses»)
const ESTANQUES = Array.from({ length: 11 }, (_, i) => [(i % 2 ? 1 : -1) * 6, lerp(-146, -24, i / 10)]);
// ---------- el colmillo: la MISMA curva, las mismas grietas y el mismo blanco para el cuerno de la torre y el de Onetusk
const COLMILLO_PTS = [[0, 0, 0], [0, -2.2, 5], [0, -2.7, 10.5], [0, -.9, 15.6], [0, 3, 19.2]];
const colmilloCurva = (L = COLMILLO_L) => new THREE.CatmullRomCurve3(COLMILLO_PTS.map(q => new THREE.Vector3(q[0], q[1], q[2]).multiplyScalar(L / 20)));
// tubo que se afina de r0 (la base) a la punta; `desde` y `hasta` recortan el colmillo (0 = base, 1 = punta); `hueco` deja la base abierta
function geoColmillo(L = COLMILLO_L, r0 = 1.5, { desde = 0, hasta = 1, hueco = false } = {}) {
  const cu = colmilloCurva(L), TS = 72, RS = 28, pos = [], uv = [], idx = [], fr = cu.computeFrenetFrames(TS, false);
  for (let i = 0; i <= TS; i++) { const u = lerp(desde, hasta, i / TS), p = cu.getPointAt(u), k = Math.min(TS, Math.round(u * TS)), N = fr.normals[k], B = fr.binormals[k], r = r0 * (.1 + .9 * Math.pow(1 - u, .75)) * (1 + .03 * Math.sin(u * 40));
    for (let j = 0; j <= RS; j++) { const a = j / RS * Math.PI * 2, c = Math.cos(a), s = Math.sin(a), rr = r * (1 + .025 * Math.sin(a * 3 + u * 9)); pos.push(p.x + (N.x * c + B.x * s) * rr, p.y + (N.y * c + B.y * s) * rr, p.z + (N.z * c + B.z * s) * rr); uv.push(u, j / RS) } }
  for (let i = 0; i < TS; i++) for (let j = 0; j < RS; j++) { const a = i * (RS + 1) + j, b = a + RS + 1; idx.push(a, b, a + 1, b, b + 1, a + 1) }
  if (!hueco) { const c = pos.length / 3, p = cu.getPointAt(desde); pos.push(p.x, p.y, p.z); uv.push(desde, .5); for (let j = 0; j < RS; j++) idx.push(c, j, j + 1) }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g }
// marfil viejo pintado a mano: vetas a lo largo, grietas oscuras, manchas de té en la base y anillos de crecimiento
const T_MARFIL = (() => { const [c, z] = pintarDoble(2048, 1024, (c, z, w, h) => { const r = rng(2601); c.fillStyle = "#efe6d0"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
    const gr = c.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, "rgba(150,110,60,.55)"); gr.addColorStop(.18, "rgba(190,160,110,.25)"); gr.addColorStop(.6, "rgba(255,250,235,0)"); gr.addColorStop(1, "rgba(255,255,250,.35)"); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    for (let k = 0; k < 260; k++) { const y = r() * h, x0 = r() * w, len = 80 + r() * 700; c.strokeStyle = r() < .5 ? `rgba(120,90,50,${.08 + r() * .14})` : `rgba(255,255,245,${.1 + r() * .2})`; c.lineWidth = 1 + r() * 3; c.beginPath(); c.moveTo(x0, y); for (let q = 0; q <= 1; q += .1) c.lineTo(x0 + len * q, y + Math.sin(q * 6 + k) * 5); c.stroke() }
    for (let x = 0; x < w; x += 46 + r() * 60) { c.strokeStyle = `rgba(130,100,60,${.1 + r() * .12})`; c.lineWidth = 2 + r() * 4; c.beginPath(); c.moveTo(x, 0); for (let y = 0; y <= h; y += 40) c.lineTo(x + Math.sin(y * .02 + x) * 6, y); c.stroke(); z.strokeStyle = "rgba(70,70,70,.5)"; z.lineWidth = 3; z.beginPath(); z.moveTo(x, 0); z.lineTo(x, h); z.stroke() }
    for (let k = 0; k < 46; k++) { let x = r() * w, y = r() * h; const n = 14 + r() * 30 | 0; c.strokeStyle = `rgba(50,32,16,${.55 + r() * .35})`; c.lineWidth = 1.5 + r() * 3.5; z.strokeStyle = "rgba(0,0,0,.9)"; z.lineWidth = 4 + r() * 5; c.beginPath(); z.beginPath(); c.moveTo(x, y); z.moveTo(x, y); for (let q = 0; q < n; q++) { x += 10 + r() * 26; y += (r() - .5) * 16; c.lineTo(x, y); z.lineTo(x, y) } c.stroke(); z.stroke() }
    for (let k = 0; k < 500; k++) { c.fillStyle = `rgba(110,80,40,${r() * .25})`; c.beginPath(); c.arc(r() * w, r() * h, 1 + r() * 5, 0, 7); c.fill() } });
  return { c, z } })();
const M_MARFIL = new THREE.MeshStandardMaterial({ map: T_MARFIL.c, bumpMap: T_MARFIL.z, bumpScale: 5, roughness: .42, metalness: 0, color: "#ffffff" });
// el corte: donde el colmillo fue serruchado (anillos de dentina y un corazón oscuro); va en la base del cuerno y en el muñón de Onetusk
const T_CORTE_MARFIL = (() => { const [c, z] = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(2602); c.fillStyle = "#e6d8b8"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
    for (let k = 0; k < 44; k++) { const rr = 250 - k * 5.6; c.strokeStyle = k % 3 ? `rgba(150,120,70,${.25 + r() * .25})` : `rgba(250,244,225,${.5})`; c.lineWidth = 1.5 + r() * 2.5; c.beginPath(); for (let a = 0; a <= 6.3; a += .1) { const q = rr * (1 + .02 * Math.sin(a * 5 + k)); a ? c.lineTo(256 + Math.cos(a) * q, 256 + Math.sin(a) * q) : c.moveTo(256 + q, 256) } c.stroke() }
    c.fillStyle = "#5a3a22"; c.beginPath(); c.arc(256, 256, 26, 0, 7); c.fill(); z.fillStyle = "#202020"; z.beginPath(); z.arc(256, 256, 26, 0, 7); z.fill();
    for (let k = 0; k < 9; k++) { const a = r() * 6.3; c.strokeStyle = "rgba(60,36,18,.8)"; c.lineWidth = 2 + r() * 3; z.strokeStyle = "rgba(0,0,0,.9)"; z.lineWidth = 5; c.beginPath(); z.beginPath(); c.moveTo(256, 256); z.moveTo(256, 256); let x = 256, y = 256; for (let q = 0; q < 10; q++) { x += Math.cos(a + (r() - .5) * .6) * 24; y += Math.sin(a + (r() - .5) * .6) * 24; c.lineTo(x, y); z.lineTo(x, y) } c.stroke(); z.stroke() }
    for (let k = 0; k < 60; k++) { const a = r() * 6.3, q = 30 + r() * 210; c.strokeStyle = "rgba(90,70,40,.35)"; c.lineWidth = 1; c.beginPath(); c.moveTo(256 + Math.cos(a) * q, 256 + Math.sin(a) * q); c.lineTo(256 + Math.cos(a + .15) * (q + 14), 256 + Math.sin(a + .15) * (q + 14)); c.stroke() } });
  return { c, z } })();
const M_CORTE_MARFIL = new THREE.MeshStandardMaterial({ map: T_CORTE_MARFIL.c, bumpMap: T_CORTE_MARFIL.z, bumpScale: 3, roughness: .7 });


// ================= «NOBODY HEARS THE BELL»: UNDERBELL, la ciudad de piedra en terrazas (piso, muros de contención, escaleras, calles,
// plaza con la fuente, casas apretadas, la tienda de Mister Sallow con su trastienda, la casa de Nell) =================
// Medidas de _comun_campana.js (PLAZA_B, TIENDA, CASA_NELL, RISCO_E, ALT_B). Norte = −z. La campana, las cadenas y las montañas lejanas
// NO están acá (las hace otro agente). La utilería, las velas, los climas de luz y la animación van en _detalle_campana.js.
// Trazado: la plaza (r < 14,5) en el centro; anillos de terrazas que suben hacia afuera (bordes de ALT_B en TERR_B, cada uno un muro de
// contención de 3,2 m con parapeto arriba); en cada terraza una calle anular junto al muro de abajo y una fila de casas que mira al centro;
// siete calles radiales que bajan en curva hasta la plaza (con escaleras de piedra en cada muro).
// Los nombres de ayudantes viejos (TM, lote, uvMuro, M_MADERA, barril, farol, …) se mantienen con la misma firma por compatibilidad.
TURT.children.forEach(o => o.visible = false);
CABEZA.visible = false; ALETAS.forEach(a => a.piv.visible = false); COLA.visible = false; COSTA.visible = false; FOAM.visible = false; FONDO.visible = false; HONDA.visible = false;
BOTES.forEach(b => b.visible = false); GAVIOTAS.forEach(g => g.visible = false); LUCES.forEach(l => l.visible = false); ESPUMA.forEach(s => s.visible = false); SALPI.forEach(s => s.visible = false);
NUBE.forEach(s => s.visible = false); ROPA3.forEach(m => m.visible = false); GALLINAS.forEach(g => g.visible = false); NUBES.forEach(g => g.visible = false);
HOUSES.forEach(H => H.g.visible = false);

// ---------- ayudantes (mismas firmas que en el video del viento)
const sst = (a, b, x) => { const q = cl((x - a) / (b - a)); return q * q * (3 - 2 * q) };
const hash2 = (i, j) => { let n = (Math.imul(i | 0, 374761393) + Math.imul(j | 0, 668265263)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296 };
const ruido2 = (x, z) => { const i = Math.floor(x), j = Math.floor(z), u = x - i, v = z - j, a = u * u * (3 - 2 * u), b = v * v * (3 - 2 * v); return lerp(lerp(hash2(i, j), hash2(i + 1, j), a), lerp(hash2(i, j + 1), hash2(i + 1, j + 1), a), b) };
const fbm2 = (x, z, o = 4) => { let s = 0, a = .5, f = 1, n = 0; for (let k = 0; k < o; k++) { s += a * ruido2(x * f + k * 17.3, z * f - k * 9.1); n += a; a *= .5; f *= 2.03 } return s / n };
const TM = (x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, "YXZ")), new THREE.Vector3(sx, sy, sz));
const lote = () => { const L = {}; return { L, add(k, geo, m) { (L[k] ||= []).push([geo, m || new THREE.Matrix4()]); return this },
  fin(par, mats, o = {}) { const out = {}; for (const k in L) { if (!mats[k]) throw new Error("lote sin material: " + k); const me = new THREE.Mesh(mergeG(L[k]), mats[k]); me.castShadow = o.sombra !== false; me.receiveShadow = true; par.add(me); out[k] = me } return out } } };
const linC = h => { const c = new THREE.Color(h); return [c.r, c.g, c.b] };
const mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const envuelto = (g, w, h, fn) => { for (const dx of [-w, 0, w]) for (const dy of [-h, 0, h]) { g.save(); g.translate(dx, dy); fn(); g.restore() } };
const geoPiedra = (seed, det = 1, ach = .7) => { const g = new THREE.IcosahedronGeometry(1, det), p = g.attributes.position, r = rng(seed), fx = r() * 9, fy = r() * 9; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = .72 + .5 * ruido2(x * 1.7 + fx + y, z * 1.7 + fy - y); p.setXYZ(i, x * k, y * k * ach, z * k) } g.computeVertexNormals(); return g };
const geoUV = (g, fu, fv) => { const p = g.attributes.position, u = g.attributes.uv; for (let i = 0; i < p.count; i++) u.setXY(i, fu(p.getX(i), p.getY(i), p.getZ(i)), fv(p.getX(i), p.getY(i), p.getZ(i))); return g };
const uvMuro = (g, s = 3.2, ox = 0, oy = 0) => { const p = g.attributes.position, n = g.attributes.normal, u = g.attributes.uv; for (let i = 0; i < p.count; i++) { const nx = n.getX(i), ny = n.getY(i), nz = n.getZ(i); let U, V;
    if (Math.abs(ny) > .75) { U = p.getX(i) / s; V = p.getZ(i) / s } else if (Math.abs(nx) > Math.abs(nz)) { U = -p.getZ(i) / s * Math.sign(nx); V = p.getY(i) / s } else { U = p.getX(i) / s * Math.sign(nz); V = p.getY(i) / s } u.setXY(i, U + ox, V + oy) } return g };
const cilEntre = (a, b, r, seg = 7, r2 = r) => { const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b), d = Bv.clone().sub(A); return [new THREE.CylinderGeometry(r2, r, 1, seg), MZ(A.clone().add(Bv).multiplyScalar(.5), d, new THREE.Vector3(1, d.length(), 1))] };
const redondo = (g, P, rad) => { const n = P.length; g.beginPath(); for (let i = 0; i <= n; i++) { const a = P[i % n], pv = P[(i + n - 1) % n], nx = P[(i + 1) % n], d1 = Math.hypot(pv[0] - a[0], pv[1] - a[1]) || 1, d2 = Math.hypot(nx[0] - a[0], nx[1] - a[1]) || 1, r1 = Math.min(rad, d1 / 2) / d1, r2 = Math.min(rad, d2 / 2) / d2;
    const p1 = [a[0] + (pv[0] - a[0]) * r1, a[1] + (pv[1] - a[1]) * r1], p2 = [a[0] + (nx[0] - a[0]) * r2, a[1] + (nx[1] - a[1]) * r2]; if (i === 0) g.moveTo(p2[0], p2[1]); else { g.lineTo(p1[0], p1[1]); g.quadraticCurveTo(a[0], a[1], p2[0], p2[1]) } } g.closePath() };
const repT = q => { for (const t of (Array.isArray(q) ? q : [q.c, q.z])) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.needsUpdate = true } return q };
const RB1 = (w, h, d, r = .04) => RB(w, h, d, r, 1);
const tubo = (pts, r0, r1, seg = 7, ts = 10) => { const cu = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), g = new THREE.TubeGeometry(cu, ts, 1, seg, false), p = g.attributes.position, uv = g.attributes.uv, P = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { const u = uv.getX(i), c2 = cu.getPointAt(u); P.set(p.getX(i), p.getY(i), p.getZ(i)).sub(c2).multiplyScalar(lerp(r0, r1, u)).add(c2); p.setXYZ(i, P.x, P.y, P.z); uv.setXY(i, uv.getY(i) * 2, u * cu.getLength() / 2) } g.computeVertexNormals(); return g };
// compatibilidad: uniformes de «viento» (acá solo una brisa leve: ropa tendida y barriletes)
const VIENTO = { value: 0 }, RAFAGA = { value: .35 };
const conViento = (m, modo = "tela", amp = .12) => { if (modo === "tela" || modo === "toldo") m.side = THREE.DoubleSide; m.onBeforeCompile = sh => { sh.uniforms.uVt = VIENTO; sh.uniforms.uVa = RAFAGA;
  const cuerpo = modo === "tela" || modo === "toldo" ? `float w = ${modo === "toldo" ? "sin(uv.x * 3.1416) * sin(uv.y * 3.1416) * .7" : "uv.x"}; float f = sin(uVt * 3.1 - uv.x * 2.2 + wp.z * 1.3 + wp.x * .7) + .4 * sin(uVt * 5.3 - uv.x * 4.5 + wp.z * 2.3) + .18 * sin(uVt * 9. + uv.y * 5.);
      transformed += normal * f * w * ${amp.toFixed(3)} * (.25 + .75 * uVa);`
    : `float hh = clamp(position.y * .22, 0., 1.); float f = sin(uVt * 1.7 - wp.x * .28 + wp.z * .1) + .45 * sin(uVt * 3.3 + wp.z * .8 - wp.x * .5);
      transformed += vec3(1., .25, .35) * f * hh * ${amp.toFixed(3)} * uVa;`;
  sh.vertexShader = "uniform float uVt; uniform float uVa;\n" + sh.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>
  { vec4 wp = vec4(position, 1.);
  #ifdef USE_INSTANCING
    wp = instanceMatrix * wp;
  #endif
    wp = modelMatrix * wp; ${cuerpo} }`) }; m.customProgramCacheKey = () => "brisaP" + modo + amp; return m };

// ---------- el piso: ALT_B exacto (los personajes y la campana usan la misma altura). sueloB suma las escaleras de piedra (para pararse en ellas)
const SUELO = (x, z) => ALT_B(x, z);
const sueloN = (x, z, e = .6) => { const nx = SUELO(x - e, z) - SUELO(x + e, z), nz = SUELO(x, z - e) - SUELO(x, z + e), l = Math.hypot(nx, 2 * e, nz); return [nx / l, 2 * e / l, nz / l] };
const riscoH = (x, z) => 30 * Math.exp(-(((x - RISCO_E[0]) / 22) ** 2 + ((z - RISCO_E[1]) / 30) ** 2));
// radios de los muros de contención: donde ALT_B salta 3,2 m (≈ 45,8 · 59,0 · 71,0 · 84,2 · 110)
const TERR_B = [1, 2, 3, 4, 5].map(k => { let a = 20, b = 111; for (let i = 0; i < 44; i++) { const m = (a + b) / 2; if (Math.floor(sstB(20, 110, m) * 5) >= k) b = m; else a = m } return b });
const nivelB = r => TERR_B.filter(b => r >= b).length;
const PLAZA_R = 14.5;   // radio del enlosado de la plaza (las casas de la plaza empiezan en 15,6)
// calles radiales: ángulo en la plaza (grados, atan2(z, x): 0 = este, 90 = sur), ancho; se curvan 0,3 rad hacia afuera.
// D baja del risco del este (ancha: cámara y gente); F es la avenida del mercado (sur, la más ancha)
const CALLES_RAD = [{ a0: -165, an: 4.6, n: "A" }, { a0: -120, an: 6.2, n: "B" }, { a0: -55, an: 4.6, n: "C" }, { a0: -12, an: 6.6, n: "D", rMax: 86 }, { a0: 62, an: 4.6, n: "E" }, { a0: 100, an: 7.2, n: "F" }, { a0: 145, an: 4.8, n: "G" }].map((c, i) => ({ rMax: 126, ...c, i }));
const radAng = (c, r) => c.a0 * Math.PI / 180 + .3 * sstB(15, 120, r);
const radDist = (c, x, z) => { const r = Math.hypot(x, z), d = angD(Math.atan2(z, x), radAng(c, r)); return Math.abs(d) > Math.PI / 2 || r > c.rMax ? 999 : r * Math.abs(Math.sin(d)) };
const radPunto = (c, r, lat = 0) => { const a = radAng(c, r); return [Math.cos(a) * r - Math.sin(a) * lat, Math.sin(a) * r + Math.cos(a) * lat] };
// calles anulares [r0, r1, nombre]: A (la del mercado, alrededor de la plaza), callejones angostos, y una por terraza junto al muro de abajo
const ANILLOS = [[26.8, 33.3, "A"], [39.9, 42.1, "callejon"], ...TERR_B.slice(0, 4).map((b, i) => [b + .3, b + [6.2, 5.2, 5.4, 5.8][i], "T" + (i + 1)]), [98.4, 101.4, "callejon"], [TERR_B[4] + .3, TERR_B[4] + 5.5, "T5"]];
// filas de casas (todas miran al centro, la espalda contra el muro o el callejón de atrás)
const FILAS = [{ r0: 15.6, r1: 24.6, pisos: [3, 4], plaza: 1 }, { r0: 33.7, r1: 39.5, pisos: [2, 3] }, { r0: 42.5, r1: 45.4, pisos: [1, 1], galpon: 1 },
  { r0: TERR_B[0] + 6.6, r1: TERR_B[1] - .3, pisos: [2, 3] }, { r0: TERR_B[1] + 5.6, r1: TERR_B[2] - .3, pisos: [2, 3] }, { r0: TERR_B[2] + 5.8, r1: TERR_B[3] - .3, pisos: [2, 3] },
  { r0: TERR_B[3] + 6.2, r1: 98, pisos: [2, 3] }, { r0: 101.8, r1: TERR_B[4] - .3, pisos: [2, 3], simple: 1 }, { r0: TERR_B[4] + 5.9, r1: TERR_B[4] + 13.4, pisos: [1, 2], simple: 1 }];
const enRadial = (x, z, m = 0) => { if (Math.hypot(x, z) < PLAZA_R - 1) return null; for (const c of CALLES_RAD) if (radDist(c, x, z) < c.an / 2 + m) return c; return null };
const enAnillo = (x, z, m = 0) => { const r = Math.hypot(x, z); if (riscoH(x, z) > 3) return null; for (const A of ANILLOS) if (r > A[0] - m && r < A[1] + m) return A; return null };
const enCalle = (x, z, m = 0) => Math.hypot(x, z) < PLAZA_R + m || !!enRadial(x, z, m) || !!enAnillo(x, z, m);
// cuánto «calle» es el punto (0–1, borde suave): para el color del piso
const calleKB = (x, z) => { const r = Math.hypot(x, z), n = (fbm2(x * .7, z * .7, 2) - .5) * .3; let k = 1 - sst(PLAZA_R + .6, PLAZA_R + 1.2, r + n);
  const rk = 1 - sst(2, 4, riscoH(x, z)); for (const A of ANILLOS) k = Math.max(k, rk * sst(A[0] - .3, A[0] + .1, r + n) * (1 - sst(A[1] - .1, A[1] + .3, r + n)));
  for (const c of CALLES_RAD) { const d = radDist(c, x, z); if (d < 50) k = Math.max(k, 1 - sst(c.an / 2 - .15, c.an / 2 + .3, d + n)) } return k };
// ---------- ESCALERAS DE PIEDRA: cada calle radial sube cada muro por una escalera de 16 escalones metida en la terraza de abajo
// (r de b − 5,6 a b). Forma general (también la del risco): { cx, cz, ry (hacia arriba = +z local), L, W, y0, y1, n }
const ESCALERAS_B = [];
CALLES_RAD.forEach(c => TERR_B.forEach(b => { if (b > c.rMax + 1) return; const L = 5.6, rc = b - L / 2, [cx, cz] = radPunto(c, rc), a = radAng(c, rc), [xa, za] = radPunto(c, b - L - .2), [xb, zb] = radPunto(c, b + .25);
  ESCALERAS_B.push({ cx, cz, ry: Math.atan2(Math.cos(a), Math.sin(a)), L, W: c.an - .7, y0: SUELO(xa, za), y1: SUELO(xb, zb), n: 16, b, c }) }));
const escLocal = (E, x, z) => { const c = Math.cos(E.ry), s = Math.sin(E.ry), dx = x - E.cx, dz = z - E.cz; return [dx * c - dz * s, dx * s + dz * c] };   // [lateral, a lo largo]
const escAlto = (E, u) => E.y0 + (Math.min(E.n - 1, Math.max(0, Math.floor((u + E.L / 2) / E.L * E.n))) + 1) * (E.y1 - E.y0) / E.n;
const sueloB = (x, z) => { for (const E of ESCALERAS_B) { if (Math.abs(x - E.cx) > E.L + E.W || Math.abs(z - E.cz) > E.L + E.W) continue; const [v, u] = escLocal(E, x, z); if (Math.abs(v) < E.W / 2 + .35 && Math.abs(u) < E.L / 2) return escAlto(E, u) } return SUELO(x, z) };
// ---------- texturas pintadas: piedra de muro, ladrillo, pizarra, tejas, revoque, madera, roca (las de piedra y techo, como en el video del viento)
const T_MURO = (seed, pal, o = {}) => repT(pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(seed), S = o.escala || 1;
  c.fillStyle = o.mortero || "#5c564c"; c.fillRect(0, 0, w, h); z.fillStyle = "#2c2c2c"; z.fillRect(0, 0, w, h);
  for (let k = 0; k < 6000; k++) { c.fillStyle = r() < .5 ? "rgba(40,34,28,.3)" : "rgba(220,210,190,.2)"; c.fillRect(r() * w, r() * h, 2, 2) }
  const fil = []; let sum = 0; while (sum < h) { const fh = (o.sillar ? 110 + r() * 30 : 62 + r() * 40) * S; fil.push(fh); sum += fh } const k0 = h / sum; let y = 0;
  const piedra = (x0, y0, sw, fh) => { const m = o.sillar ? 3.5 : 5 + r() * 4, j = () => (r() - .5) * (o.sillar ? 3 : 10), rad = o.sillar ? 5 : 9 + r() * 16;
    const P = [[x0 + m + j(), y0 + m + j()], [x0 + sw * (.3 + r() * .4), y0 + m * .6 + j()], [x0 + sw - m + j(), y0 + m + j()], [x0 + sw - m * .6 + j(), y0 + fh * .5 + j()], [x0 + sw - m + j(), y0 + fh - m + j()], [x0 + sw * (.3 + r() * .4), y0 + fh - m * .5 + j()], [x0 + m + j(), y0 + fh - m + j()], [x0 + m * .6 + j(), y0 + fh * .5 + j()]];
    const col = rgbj(pal[r() * pal.length | 0], r, 26), v = 150 + r() * 90 | 0, dk = .18 + r() * .2;
    for (const dx of [-w, 0, w]) { const Q = P.map(([a, b]) => [a + dx, b]);
      redondo(c, Q, rad); c.fillStyle = col; c.fill(); const gr = c.createLinearGradient(x0 + dx, y0, x0 + dx + sw * .6, y0 + fh); gr.addColorStop(0, "rgba(255,250,235,.22)"); gr.addColorStop(.55, "rgba(255,250,235,0)"); gr.addColorStop(1, `rgba(30,24,18,${dk})`); c.fillStyle = gr; c.fill();
      c.strokeStyle = "rgba(30,26,22,.4)"; c.lineWidth = 2.5; c.stroke();
      redondo(z, Q, rad); z.fillStyle = `rgb(${v},${v},${v})`; z.fill(); z.strokeStyle = `rgba(40,40,40,.7)`; z.lineWidth = 7; z.stroke(); z.strokeStyle = `rgba(${v - 30},${v - 30},${v - 30},.8)`; z.lineWidth = 3; z.stroke() } };
  fil.forEach(fh0 => { const fh = fh0 * k0, an = []; let s2 = 0; while (s2 < w) { const sw = (o.sillar ? 170 + r() * 110 : 80 + r() * 120) * S; an.push(sw); s2 += sw } const k1 = w / s2, off = r() * w; let x = 0;
    an.forEach(sw0 => { const sw = sw0 * k1; piedra((x + off) % w, y, sw, fh); x += sw }); y += fh });
  for (let k = 0; k < 14000; k++) { const x = r() * w, y2 = r() * h; c.fillStyle = r() < .5 ? "rgba(40,34,26,.16)" : "rgba(255,250,235,.14)"; c.fillRect(x, y2, 1 + r() * 2, 1 + r() * 2) }
  for (let k = 0; k < (o.liquen ?? 30); k++) { const x = r() * w, y2 = r() * h, n = 6 + r() * 16, col = ["rgba(196,180,90,.5)", "rgba(230,228,210,.45)", "rgba(170,150,70,.45)", "rgba(120,140,80,.4)"][r() * 4 | 0]; for (let q = 0; q < n; q++) envuelto(c, w, h, () => { c.fillStyle = col; c.beginPath(); c.arc(x + (r() - .5) * 26, y2 + (r() - .5) * 18, 1.5 + r() * 5, 0, 7); c.fill() }) }
  // hollín y chorreaduras oscuras (pueblo con chimeneas bajo una tapa: todo un poco tiznado)
  for (let k = 0; k < (o.hollin ?? 30); k++) { const x = r() * w, y2 = r() * h, L = 60 + r() * 300, an = 4 + r() * 16, gr = c.createLinearGradient(0, y2, 0, y2 + L); gr.addColorStop(0, "rgba(34,30,26,.26)"); gr.addColorStop(1, "rgba(34,30,26,0)"); c.fillStyle = gr; c.fillRect(x - an / 2, y2, an, L) }
  if (o.musgo) { for (let k = 0; k < 700; k++) { const x = r() * w, y2 = r() * h; c.fillStyle = `rgba(${70 + r() * 30 | 0},${96 + r() * 30 | 0},${40 + r() * 20 | 0},${.25 + r() * .3})`; c.beginPath(); c.arc(x, y2, 2 + r() * 7, 0, 7); c.fill() } } }));
const MURO_P = [["#8e877a", "#7a7366", "#a39b8c", "#6e675c", "#9a8e7a", "#857d70"], ["#a0927c", "#8c7e68", "#b4a68e", "#7a6e5c", "#9c8a70"], ["#7c7a76", "#686660", "#8e8a84", "#5e5c58", "#9a948a"], ["#a8987e", "#94846c", "#bcae94", "#857560", "#a08c72"], ["#8a8274", "#77706a", "#9c9484", "#a69a84", "#6a645c"], ["#968a78", "#827868", "#aa9e8a", "#70685c"]];
const M_MURO = MURO_P.map((p, i) => { const [t, z] = T_MURO(4200 + i, p, { mortero: ["#5c564c", "#625a4c", "#52504c", "#665c4c", "#58544c", "#5e564c"][i] }); return new THREE.MeshStandardMaterial({ map: t, bumpMap: z, bumpScale: 4.5, roughness: .93 }) });
const M_ZOCALO = (() => { const [t, z] = T_MURO(4210, ["#6e685e", "#5e584e", "#7a7468", "#666052"], { mortero: "#4e4a42", musgo: 1, escala: 1.25 }); return new THREE.MeshStandardMaterial({ map: t, bumpMap: z, bumpScale: 5, roughness: .96 }) })();
const T_SILLAR = T_MURO(4220, ["#9a9282", "#8a8272", "#aaa290", "#7e776a", "#a49a86"], { sillar: 1, mortero: "#6a645a", liquen: 70 });
// piedra clara de las mansiones de la Loma (sillares limpios, sin hollín)
const T_SILLAR_C = T_MURO(4221, ["#e2dac8", "#d6ccb6", "#ece4d2", "#cfc4ac", "#e8dcc4"], { sillar: 1, mortero: "#b8ae98", liquen: 8, hollin: 0 });
const M_SILLAR_C = new THREE.MeshStandardMaterial({ map: T_SILLAR_C[0], bumpMap: T_SILLAR_C[1], bumpScale: 3.5, roughness: .8 });
// ladrillo: hiladas de soga, ladrillos quemados y rotos, parches, hollín
const T_LADRILLO = (seed, pal, mort) => repT(pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(seed), bh = 23, bw = 72; c.fillStyle = mort; c.fillRect(0, 0, w, h); z.fillStyle = "#303030"; z.fillRect(0, 0, w, h);
  for (let k = 0; k < 5000; k++) { c.fillStyle = r() < .5 ? "rgba(40,34,28,.25)" : "rgba(220,210,190,.18)"; c.fillRect(r() * w, r() * h, 2, 2) }
  for (let f = 0; f * bh < h; f++) { const off = (f % 2) * bw / 2 + (r() - .5) * 6; for (let x = -bw; x < w + bw; x += bw) { if (r() < .015) continue; const x0 = x + off + 2, y0 = f * bh + 2, ww = bw - 4 + (r() - .5) * 3, hh = bh - 4, col = rgbj(pal[r() * pal.length | 0], r, 28), v = 150 + r() * 80 | 0;
      for (const dx of [-w, 0, w]) { redondo(c, [[x0 + dx, y0], [x0 + dx + ww, y0], [x0 + dx + ww, y0 + hh], [x0 + dx, y0 + hh]], 3); c.fillStyle = col; c.fill(); const gr = c.createLinearGradient(0, y0, 0, y0 + hh); gr.addColorStop(0, "rgba(255,230,210,.14)"); gr.addColorStop(1, "rgba(30,14,8,.22)"); c.fillStyle = gr; c.fill();
        if (r() < .08) { c.fillStyle = "rgba(30,20,16,.35)"; c.beginPath(); c.arc(x0 + dx + r() * ww, y0 + r() * hh, 3 + r() * 5, 0, 7); c.fill() }
        redondo(z, [[x0 + dx, y0], [x0 + dx + ww, y0], [x0 + dx + ww, y0 + hh], [x0 + dx, y0 + hh]], 3); z.fillStyle = `rgb(${v},${v},${v})`; z.fill() } } }
  for (let k = 0; k < 8000; k++) { c.fillStyle = r() < .5 ? "rgba(40,24,18,.16)" : "rgba(255,240,225,.1)"; c.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2) }
  for (let k = 0; k < 30; k++) { const x = r() * w, y2 = r() * h, L = 80 + r() * 300, an = 6 + r() * 20, gr = c.createLinearGradient(0, y2, 0, y2 + L); gr.addColorStop(0, "rgba(30,24,20,.3)"); gr.addColorStop(1, "rgba(30,24,20,0)"); c.fillStyle = gr; c.fillRect(x - an / 2, y2, an, L) }
  for (let k = 0; k < 8; k++) { const x = r() * w, y2 = r() * h, s = 40 + r() * 90, gr = c.createRadialGradient(x, y2, 0, x, y2, s); gr.addColorStop(0, "rgba(220,210,190,.35)"); gr.addColorStop(1, "rgba(220,210,190,0)"); c.fillStyle = gr; c.fillRect(x - s, y2 - s, 2 * s, 2 * s) } }));
const M_LAD = [[["#9a4a34", "#8a3e2c", "#a85a3e", "#7a3826", "#b0644a", "#6e3022"], "#8a7e6e"], [["#a86a48", "#94583c", "#b87a56", "#80503a", "#c08a62"], "#9a9080"], [["#7a3a2c", "#6a3226", "#8a4a36", "#5a2a20", "#944e3a"], "#6e665c"]].map(([p, m], i) => { const [t, z] = T_LADRILLO(4230 + i, p, m); return new THREE.MeshStandardMaterial({ map: t, bumpMap: z, bumpScale: 4, roughness: .92 }) });
const T_PIZARRA = (seed, pal) => repT(pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(seed); c.fillStyle = "#1a1d20"; c.fillRect(0, 0, w, h); z.fillStyle = "#1a1a1a"; z.fillRect(0, 0, w, h);
  const nf = 15, fh = h / nf; for (let f = -1; f <= nf; f++) { const y0 = f * fh; let x = -r() * 50; while (x < w) { const sw = 54 + r() * 44, col = rgbj(pal[r() * pal.length | 0], r, 20), v = 120 + r() * 70 | 0, rot = r() < .05;
      for (const dx of [-w, 0, w]) { const x0 = x + dx + 2, x1 = x + dx + sw - 2, ya = y0 - fh * .55, yb = y0 + fh + (r() - .5) * 5, Q = [[x0, ya], [x1, ya], [x1 + (r() - .5) * 3, yb], [x0 + (r() - .5) * 3, yb]];
        redondo(c, Q, 6); c.fillStyle = rot ? "#0e1012" : col; c.fill(); const gr = c.createLinearGradient(0, ya, 0, yb); gr.addColorStop(0, "rgba(0,0,0,.35)"); gr.addColorStop(.75, "rgba(255,255,255,0)"); gr.addColorStop(1, "rgba(230,235,240,.16)"); c.fillStyle = gr; c.fill(); c.strokeStyle = "rgba(10,12,14,.55)"; c.lineWidth = 2; c.stroke();
        redondo(z, Q, 6); const gz = z.createLinearGradient(0, ya, 0, yb); gz.addColorStop(0, "#202020"); gz.addColorStop(1, `rgb(${v},${v},${v})`); z.fillStyle = gz; z.fill() } x += sw } }
  for (let k = 0; k < 9000; k++) { c.fillStyle = r() < .5 ? "rgba(0,0,0,.15)" : "rgba(220,225,230,.1)"; c.fillRect(r() * w, r() * h, 1 + r() * 2, 1) }
  for (let k = 0; k < 60; k++) { const x = r() * w, y = r() * h, n = 5 + r() * 18, col = r() < .6 ? "rgba(140,150,70,.55)" : r() < .5 ? "rgba(210,205,170,.5)" : "rgba(200,150,60,.5)"; for (let q = 0; q < n; q++) envuelto(c, w, h, () => { c.fillStyle = col; c.beginPath(); c.arc(x + (r() - .5) * 30, y + (r() - .5) * 14, 1.5 + r() * 4.5, 0, 7); c.fill() }) } }));
const T_TEJA_V = (seed, pal) => repT(pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(seed); c.fillStyle = "#3a2216"; c.fillRect(0, 0, w, h); z.fillStyle = "#202020"; z.fillRect(0, 0, w, h);
  const nf = 12, fh = h / nf, cols = Math.round(w / 64), tw = w / cols; for (let f = -1; f <= nf; f++) { const y0 = f * fh; for (let i = 0; i < cols; i++) { const x0 = i * tw + (r() - .5) * 3, col = rgbj(pal[r() * pal.length | 0], r, 24), v = 140 + r() * 60 | 0, ya = y0 - fh * .5, yb = y0 + fh + (r() - .5) * 6;
      for (const dx of [-w, 0, w]) { const Q = [[x0 + dx + 3, ya], [x0 + dx + tw - 3, ya], [x0 + dx + tw - 2, yb], [x0 + dx + 2, yb]]; redondo(c, Q, 14); c.fillStyle = col; c.fill();
        const gr = c.createLinearGradient(x0 + dx, 0, x0 + dx + tw, 0); gr.addColorStop(0, "rgba(30,14,8,.5)"); gr.addColorStop(.35, "rgba(255,230,200,.18)"); gr.addColorStop(.6, "rgba(255,230,200,0)"); gr.addColorStop(1, "rgba(30,14,8,.55)"); c.fillStyle = gr; c.fill();
        const g2 = c.createLinearGradient(0, ya, 0, yb); g2.addColorStop(0, "rgba(0,0,0,.3)"); g2.addColorStop(.3, "rgba(0,0,0,0)"); c.fillStyle = g2; c.fill(); c.strokeStyle = "rgba(40,18,10,.5)"; c.lineWidth = 2; c.stroke();
        redondo(z, Q, 14); const gz = z.createLinearGradient(x0 + dx, 0, x0 + dx + tw, 0); gz.addColorStop(0, "#303030"); gz.addColorStop(.45, `rgb(${v},${v},${v})`); gz.addColorStop(1, "#303030"); z.fillStyle = gz; z.fill() } } }
  for (let k = 0; k < 9000; k++) { c.fillStyle = r() < .5 ? "rgba(40,20,10,.15)" : "rgba(255,230,200,.1)"; c.fillRect(r() * w, r() * h, 1 + r() * 2, 1) }
  for (let k = 0; k < 70; k++) { const x = r() * w, y = r() * h, n = 5 + r() * 22, col = r() < .6 ? "rgba(110,120,60,.6)" : "rgba(220,210,170,.5)"; for (let q = 0; q < n; q++) envuelto(c, w, h, () => { c.fillStyle = col; c.beginPath(); c.arc(x + (r() - .5) * 34, y + (r() - .5) * 16, 1.5 + r() * 5, 0, 7); c.fill() }) } }));
const M_PIZ = [["#4a525a", "#3e454c", "#565e66", "#5a5a60", "#444a52"], ["#3c4048", "#484c56", "#33373e", "#545860"], ["#5a5e5e", "#4c5050", "#646866", "#42484a"]].map((p, i) => { const [t, z] = T_PIZARRA(4300 + i, p); return new THREE.MeshStandardMaterial({ map: t, bumpMap: z, bumpScale: 4, roughness: .7 }) });
const M_TEJA = [["#a4583a", "#8e4a30", "#b8683e", "#7a4028", "#a86048"], ["#8a5040", "#9c5c44", "#704030", "#a8705a"], ["#b0704a", "#9a5e3c", "#c08058", "#865032"]].map((p, i) => { const [t, z] = T_TEJA_V(4310 + i, p); return new THREE.MeshStandardMaterial({ map: t, bumpMap: z, bumpScale: 4, roughness: .85 }) });
const T_REVOQUE = repT(pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(4320); c.fillStyle = "#d2c8b2"; c.fillRect(0, 0, w, h); z.fillStyle = "#909090"; z.fillRect(0, 0, w, h);
  for (let k = 0; k < 160; k++) { const x = r() * w, y = r() * h, s = 30 + r() * 150, cl2 = r() < .55 ? "120,104,80" : "255,252,240", gr = c.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, `rgba(${cl2},${.06 + r() * .1})`); gr.addColorStop(1, `rgba(${cl2},0)`); c.fillStyle = gr; c.fillRect(x - s, y - s, s * 2, s * 2) }
  for (let k = 0; k < 400; k++) { const x = r() * w, y = r() * h, L = 30 + r() * 110, a = (r() - .5) * .8; c.strokeStyle = r() < .5 ? "rgba(140,120,90,.06)" : "rgba(255,255,250,.1)"; c.lineWidth = 6 + r() * 14; c.lineCap = "round"; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); c.stroke(); z.strokeStyle = r() < .5 ? "rgba(70,70,70,.2)" : "rgba(200,200,200,.2)"; z.lineWidth = 8; z.beginPath(); z.moveTo(x, y); z.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); z.stroke() }
  for (let k = 0; k < 7; k++) { const cx = r() * w, cy = r() * h, s = 30 + r() * 60, P = Array.from({ length: 9 }, (_, i) => { const a = i / 9 * 6.283, d = s * (.55 + r() * .6); return [cx + Math.cos(a) * d * 1.3, cy + Math.sin(a) * d] });
    redondo(c, P, 10); c.fillStyle = "#8e8474"; c.fill(); c.save(); c.clip(); for (let q = 0; q < 20; q++) { c.fillStyle = rgbj(["#a05a44", "#8a4a36", "#7e7466"][r() * 3 | 0], r, 20); c.fillRect(cx - s * 1.4 + (q % 5) * s * .58 + ((q / 5 | 0) % 2) * s * .29, cy - s + (q / 5 | 0) * s * .42, s * .52, s * .36) } c.restore(); c.strokeStyle = "rgba(90,80,64,.7)"; c.lineWidth = 3; c.stroke(); redondo(z, P, 10); z.fillStyle = "#505050"; z.fill() }
  for (let k = 0; k < 14; k++) { let x = r() * w, y = r() * h; const n = 8 + r() * 16 | 0; c.strokeStyle = "rgba(80,70,56,.55)"; c.lineWidth = 1.5; z.strokeStyle = "#202020"; z.lineWidth = 3; c.beginPath(); z.beginPath(); c.moveTo(x, y); z.moveTo(x, y); for (let q = 0; q < n; q++) { x += (r() - .5) * 26; y += 6 + r() * 18; c.lineTo(x, y); z.lineTo(x, y) } c.stroke(); z.stroke() }
  for (let k = 0; k < 24; k++) { const x = r() * w, y2 = r() * h, L = 80 + r() * 300, an = 8 + r() * 20, gr = c.createLinearGradient(0, y2, 0, y2 + L); gr.addColorStop(0, "rgba(60,52,40,.2)"); gr.addColorStop(1, "rgba(60,52,40,0)"); c.fillStyle = gr; c.fillRect(x - an / 2, y2, an, L) }
  for (let k = 0; k < 10000; k++) { c.fillStyle = r() < .5 ? "rgba(90,80,60,.12)" : "rgba(255,255,255,.12)"; c.fillRect(r() * w, r() * h, 2, 2) } }));
const M_REVOQUE = new THREE.MeshStandardMaterial({ map: T_REVOQUE[0], bumpMap: T_REVOQUE[1], bumpScale: 3.5, roughness: .95 });
const REV_C = ["#e8d8b8", "#d8c0a0", "#c8d0c0", "#e0c8a8", "#d0b898", "#c8b8a8"];
const M_REV = REV_C.map(c => new THREE.MeshStandardMaterial({ map: T_REVOQUE[0], bumpMap: T_REVOQUE[1], bumpScale: 3.5, roughness: .95, color: c }));
const T_TABLA_N = (() => { const [c, z] = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(4330); let x = 0; z.fillStyle = "#909090"; z.fillRect(0, 0, w, h); while (x < w) { const pw = 64 + r() * 50; c.fillStyle = rgbj("#e2dcd2", r, 22); c.fillRect(x, 0, pw, h); for (let k = 0; k < 40; k++) { const xx = x + r() * pw; c.strokeStyle = r() < .5 ? "rgba(90,74,60,.25)" : "rgba(255,255,255,.3)"; c.lineWidth = 1 + r() * 2; c.beginPath(); c.moveTo(xx, 0); for (let y = 0; y <= h; y += 40) c.lineTo(xx + (r() - .5) * 6, y); c.stroke(); z.strokeStyle = "rgba(60,60,60,.3)"; z.lineWidth = 2; z.beginPath(); z.moveTo(xx, 0); z.lineTo(xx, h); z.stroke() }
      for (let k = 0; k < 5; k++) { const px = x + r() * pw, py = r() * h, s = 6 + r() * 20; c.fillStyle = "rgba(120,96,70,.7)"; c.beginPath(); c.ellipse(px, py, s * .6, s, r(), 0, 7); c.fill(); z.fillStyle = "rgba(40,40,40,.6)"; z.beginPath(); z.ellipse(px, py, s * .6, s, 0, 0, 7); z.fill() }
      for (const yy of [30, h - 30]) { c.fillStyle = "#3a3430"; c.beginPath(); c.arc(x + pw / 2, yy, 4, 0, 7); c.fill() }
      c.fillStyle = "rgba(40,28,20,.8)"; c.fillRect(x + pw - 4, 0, 4, h); z.fillStyle = "#000"; z.fillRect(x + pw - 5, 0, 6, h); x += pw } }); [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
const PUERTA_C = ["#4a6a52", "#8a3a2c", "#3e5a78", "#a07a3a", "#5a4a3a", "#6a7a6a", "#7a4a3a", "#2e4e4a", "#9a8a6a"];
const M_PUERTA = PUERTA_C.map(c => new THREE.MeshStandardMaterial({ map: T_TABLA_N.c, bumpMap: T_TABLA_N.z, bumpScale: 3, roughness: .8, color: c }));
const M_MADERA = new THREE.MeshStandardMaterial({ map: T_TABLA_N.c, bumpMap: T_TABLA_N.z, bumpScale: 3.5, roughness: .9, color: "#6e5038" });
const M_MADERA_V = new THREE.MeshStandardMaterial({ map: T_TABLA_N.c, bumpMap: T_TABLA_N.z, bumpScale: 3.5, roughness: .95, color: "#9a8e7e" });
const M_VIGA = new THREE.MeshStandardMaterial({ map: T_TABLA_N.c, bumpMap: T_TABLA_N.z, bumpScale: 3, roughness: .9, color: "#4a3426" });
const M_VIDRIO = new THREE.MeshStandardMaterial({ color: "#1e2a30", roughness: .12, metalness: .55 });
const M_OSCURO = new THREE.MeshBasicMaterial({ color: "#120d0a" });
const M_HIERRO = new THREE.MeshStandardMaterial({ color: "#3a3532", roughness: .5, metalness: .75 });
const M_HIERRO_O = new THREE.MeshStandardMaterial({ color: "#5a4030", roughness: .7, metalness: .5 });
const M_TERRACOTA = new THREE.MeshStandardMaterial({ color: "#a65a3a", roughness: .8 });
const M_BLANCO_P = new THREE.MeshStandardMaterial({ map: T_TABLA_N.c, bumpMap: T_TABLA_N.z, bumpScale: 1.5, color: "#f0ece2", roughness: .6 });   // carpintería blanca (Loma)
const T_SOGA = tex(64, 64, (g, w, h) => { g.fillStyle = "#b89a6a"; g.fillRect(0, 0, w, h); for (let k = -8; k < 16; k++) { g.strokeStyle = k % 2 ? "rgba(70,50,28,.7)" : "rgba(240,220,170,.5)"; g.lineWidth = 4; g.beginPath(); g.moveTo(k * 8, 0); g.lineTo(k * 8 + 32, h); g.stroke() } }, [1, 6]);
const M_SOGA = new THREE.MeshStandardMaterial({ map: T_SOGA, bumpMap: T_SOGA, bumpScale: 2, roughness: 1 });
const T_ROCA = (() => { const [c, z] = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(4340); c.fillStyle = "#cfcac0"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
    for (let k = 0; k < 300; k++) { const x = r() * w, y = r() * h, s = 10 + r() * 60; envuelto(c, w, h, () => { c.fillStyle = r() < .5 ? "rgba(90,86,76,.14)" : "rgba(255,255,250,.14)"; c.beginPath(); c.ellipse(x, y, s, s * .6, r() * 3, 0, 7); c.fill() }); envuelto(z, w, h, () => { z.fillStyle = r() < .5 ? "rgba(50,50,50,.25)" : "rgba(210,210,210,.25)"; z.beginPath(); z.ellipse(x, y, s, s * .6, 0, 0, 7); z.fill() }) }
    for (let k = 0; k < 40; k++) { let x = r() * w, y = r() * h; c.strokeStyle = "rgba(40,36,30,.6)"; c.lineWidth = 1.5 + r() * 2; z.strokeStyle = "#000"; z.lineWidth = 4; c.beginPath(); z.beginPath(); c.moveTo(x, y); z.moveTo(x, y); for (let q = 0; q < 7; q++) { x += (r() - .5) * 50; y += (r() - .5) * 50; c.lineTo(x, y); z.lineTo(x, y) } c.stroke(); z.stroke() }
    for (let k = 0; k < 90; k++) { const x = r() * w, y = r() * h, n = 6 + r() * 14, col = ["rgba(200,190,90,.6)", "rgba(240,240,225,.6)", "rgba(210,140,60,.5)", "rgba(110,130,70,.5)"][r() * 4 | 0]; for (let q = 0; q < n; q++) { c.fillStyle = col; c.beginPath(); c.arc(x + (r() - .5) * 20, y + (r() - .5) * 20, 1.5 + r() * 4, 0, 7); c.fill() } } });
  [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
const M_ROCA = new THREE.MeshStandardMaterial({ map: T_ROCA.c, bumpMap: T_ROCA.z, bumpScale: 4, roughness: .95, color: "#ffffff" });
const M_ROCA_G = new THREE.MeshStandardMaterial({ map: T_ROCA.c, bumpMap: T_ROCA.z, bumpScale: 4, roughness: .95, color: "#8e8a80" });
const M_PIEDRA_C = new THREE.MeshStandardMaterial({ color: "#b4ab98", roughness: .9, bumpMap: T_ROCA.z, bumpScale: 2.5 });
const GEO_PIEDRAS = [geoPiedra(31, 1, .62), geoPiedra(32, 1, .8), geoPiedra(33, 1, .5)];
// chapa ondulada con óxido (parches de techo, galpones)
const T_CHAPA = repT(pintarDoble(512, 512, (c, z, w, h) => { const r = rng(4350); for (let x = 0; x < w; x += 16) { const gr = c.createLinearGradient(x, 0, x + 16, 0); gr.addColorStop(0, "#5a5e60"); gr.addColorStop(.5, "#9aa0a2"); gr.addColorStop(1, "#5a5e60"); c.fillStyle = gr; c.fillRect(x, 0, 16, h); const gz = z.createLinearGradient(x, 0, x + 16, 0); gz.addColorStop(0, "#202020"); gz.addColorStop(.5, "#e0e0e0"); gz.addColorStop(1, "#202020"); z.fillStyle = gz; z.fillRect(x, 0, 16, h) }
  for (let k = 0; k < 70; k++) { const x = r() * w, y = r() * h, s = 10 + r() * 70, gr = c.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, `rgba(${140 + r() * 40 | 0},${70 + r() * 20 | 0},30,.75)`); gr.addColorStop(1, "rgba(140,70,30,0)"); c.fillStyle = gr; c.fillRect(x - s, y - s, 2 * s, 2 * s) }
  for (let k = 0; k < 30; k++) { const x = r() * w, y2 = r() * h, L = 40 + r() * 200, gr = c.createLinearGradient(0, y2, 0, y2 + L); gr.addColorStop(0, "rgba(120,60,24,.5)"); gr.addColorStop(1, "rgba(120,60,24,0)"); c.fillStyle = gr; c.fillRect(x, y2, 3 + r() * 6, L) } }));
const M_CHAPA = new THREE.MeshStandardMaterial({ map: T_CHAPA[0], bumpMap: T_CHAPA[1], bumpScale: 3, roughness: .6, metalness: .35 });

// ---------- metal con reflejos: un cielo chiquito pintado (celeste parejo arriba, piso gris abajo, una franja clara) para la grasa, el hierro y el oro
const ENV_METAL_P = (() => { const es = new THREE.Scene(); es.add(new THREE.Mesh(new THREE.SphereGeometry(50, 48, 24), new THREE.ShaderMaterial({ side: THREE.BackSide,
    vertexShader: "varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
    fragmentShader: "varying vec3 vD; void main(){ float h = vD.y; vec3 c = mix(vec3(.62,.72,.84), vec3(.55,.7,.92), smoothstep(0., .7, h)); c = mix(c, vec3(.3,.27,.24), smoothstep(.02, -.3, h)); c += vec3(1.1,1.08,1.) * smoothstep(.93, .99, h) * .9 + vec3(.9,.92,.95) * pow(max(dot(vD, normalize(vec3(.6,.35,.5))), 0.), 40.) * .8; gl_FragColor = vec4(c, 1.); }" })));
  const pm = new THREE.PMREMGenerator(R), rt = pm.fromScene(es, 0, .1, 100); pm.dispose(); return rt.texture })();
M_HIERRO.envMap = ENV_METAL_P; M_HIERRO.envMapIntensity = .6; M_HIERRO_O.envMap = ENV_METAL_P; M_HIERRO_O.envMapIntensity = .35; M_CHAPA.envMap = ENV_METAL_P; M_CHAPA.envMapIntensity = .5;
const M_HIERRO_G = new THREE.MeshStandardMaterial({ color: "#2e2c2a", roughness: .55, metalness: .7, envMap: ENV_METAL_P, envMapIntensity: .55, bumpMap: T_ROCA.z, bumpScale: 1.2 });   // fundición del gato
const M_LATON = new THREE.MeshStandardMaterial({ color: "#c8a050", roughness: .28, metalness: .95, envMap: ENV_METAL_P, envMapIntensity: 1.1 });                                    // bronce/latón de la Loma
// ---------- textura de detalle del piso (tierra apisonada, piedritas, grietas, matitas); el color grande va por vértice
const T_TIERRA_D = (() => { const [c, z] = pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(4101); c.fillStyle = "#e4ddcc"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
    for (let k = 0; k < 260; k++) { const x = r() * w, y = r() * h, s = 30 + r() * 120, col = r() < .5 ? "rgba(120,104,80,.16)" : "rgba(255,250,235,.18)"; envuelto(c, w, h, () => { const gr = c.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, col); gr.addColorStop(1, "rgba(230,230,210,0)"); c.fillStyle = gr; c.fillRect(x - s, y - s, s * 2, s * 2) });
      envuelto(z, w, h, () => { const gr = z.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, r() < .5 ? "rgba(40,40,40,.25)" : "rgba(220,220,220,.25)"); gr.addColorStop(1, "rgba(128,128,128,0)"); z.fillStyle = gr; z.fillRect(x - s, y - s, s * 2, s * 2) }) }
    // grietas de barro seco
    for (let k = 0; k < 50; k++) { let x = r() * w, y = r() * h; c.strokeStyle = "rgba(70,56,40,.4)"; c.lineWidth = 1.5 + r() * 1.5; z.strokeStyle = "rgba(0,0,0,.8)"; z.lineWidth = 3; c.beginPath(); z.beginPath(); c.moveTo(x, y); z.moveTo(x, y); for (let q = 0; q < 6; q++) { x += (r() - .5) * 60; y += (r() - .5) * 60; c.lineTo(x, y); z.lineTo(x, y) } c.stroke(); z.stroke() }
    // matitas paradas (sin viento: acá no sopla)
    for (let k = 0; k < 7000; k++) { const x = r() * w, y = r() * h, L = 5 + r() * 14, a = -Math.PI / 2 + (r() - .5) * 1.2, cl2 = r(); c.strokeStyle = cl2 < .5 ? `rgba(70,90,30,${.12 + r() * .16})` : cl2 < .8 ? `rgba(160,170,90,${.12 + r() * .14})` : `rgba(200,180,110,${.12 + r() * .16})`;
      c.lineWidth = 1 + r() * 1.4; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); c.stroke() }
    for (let k = 0; k < 520; k++) { const x = r() * w, y = r() * h, s = 2 + r() * 6, a = r() * 3; envuelto(c, w, h, () => { c.fillStyle = "rgba(40,36,30,.18)"; c.beginPath(); c.ellipse(x + 2, y + 2, s, s * .7, a, 0, 7); c.fill(); c.fillStyle = rgbj(["#c8c2b6", "#aaa69a", "#d8d2c4", "#9a9488", "#b8a890"][r() * 5 | 0], r, 20); c.beginPath(); c.ellipse(x, y, s, s * .7, a, 0, 7); c.fill() });
      envuelto(z, w, h, () => { z.fillStyle = "rgba(250,250,250,.9)"; z.beginPath(); z.ellipse(x, y, s, s * .7, a, 0, 7); z.fill() }) } });
  [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
const M_TIERRA = new THREE.MeshStandardMaterial({ map: T_TIERRA_D.c, bumpMap: T_TIERRA_D.z, bumpScale: 3, roughness: .97, vertexColors: true });

// ---------- ventanas con vela adentro: vidrio oscuro con el brillo cálido del cuarto (cortina, marco, la llama). La intensidad la pone el clima
const T_VENT = tex(256, 256, (g, w, h) => { const r = rng(4380); const gr = g.createRadialGradient(w * .5, h * .78, 4, w * .5, h * .6, h * .75); gr.addColorStop(0, "#fff0c0"); gr.addColorStop(.25, "#ffb050"); gr.addColorStop(.7, "#7a3a10"); gr.addColorStop(1, "#2a1206"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = "rgba(30,12,4,.75)"; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(w * .22, h * .5, w * .12, h); g.lineTo(0, h); g.fill(); g.beginPath(); g.moveTo(w, 0); g.quadraticCurveTo(w * .8, h * .45, w * .9, h); g.lineTo(w, h); g.fill();
  for (let k = 0; k < 30; k++) { g.strokeStyle = "rgba(20,8,2,.18)"; g.lineWidth = 2; const x = r() * w * .2; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (r() - .5) * 20, h); g.stroke(); g.beginPath(); g.moveTo(w - x, 0); g.lineTo(w - x + (r() - .5) * 20, h); g.stroke() }
  g.fillStyle = "rgba(255,250,220,.9)"; g.beginPath(); g.ellipse(w * .5, h * .74, 7, 16, 0, 0, 7); g.fill() });
const M_VENTANA = new THREE.MeshStandardMaterial({ color: "#1c1610", roughness: .18, metalness: .35, emissive: "#ffffff", emissiveMap: T_VENT, emissiveIntensity: .25 });
const M_VIDRIO_C = new THREE.MeshStandardMaterial({ color: "#c8d4d0", roughness: .05, metalness: .1, transparent: true, opacity: .14, depthWrite: false });
// piedra tiznada de la tienda de Sallow: casi negra, chorreaduras de hollín y de cera amarillenta
const M_HOLLIN = (() => { const [t, z] = T_MURO(4250, ["#3a3632", "#2e2a28", "#46403a", "#262422", "#4a4238"], { mortero: "#1a1816", liquen: 8, hollin: 160, escala: 1.1 }); return new THREE.MeshStandardMaterial({ map: t, bumpMap: z, bumpScale: 5, roughness: .97, color: "#8c847c" }) })();
// madera vieja negra (marcos, vigas y muebles de la tienda) y cera
const M_MADERA_N = new THREE.MeshStandardMaterial({ map: T_TABLA_N.c, bumpMap: T_TABLA_N.z, bumpScale: 3.5, roughness: .85, color: "#3a2c22" });
const M_CERA = new THREE.MeshStandardMaterial({ color: "#e8d49a", roughness: .42, emissive: "#3a2808", emissiveIntensity: .25 });
const M_CERA_V = new THREE.MeshStandardMaterial({ color: "#c8a85a", roughness: .5, emissive: "#2a1a04", emissiveIntensity: .2 });   // cera vieja, amarillenta
// papel de pared (adentro de la casa de Nell): flores chiquitas desteñidas
const T_PAPEL = tex(512, 512, (g, w, h) => { const r = rng(4390); g.fillStyle = "#c8b48c"; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 64) { g.fillStyle = "rgba(150,110,70,.18)"; g.fillRect(x, 0, 6, h) }
  for (let y = 16; y < h; y += 64) for (let x = 16 + (y / 64 % 2) * 32; x < w; x += 64) { g.fillStyle = "rgba(160,70,60,.55)"; for (let p = 0; p < 5; p++) { const a = p / 5 * 6.28; g.beginPath(); g.arc(x + Math.cos(a) * 5, y + Math.sin(a) * 5, 4, 0, 7); g.fill() } g.fillStyle = "rgba(90,110,60,.5)"; g.fillRect(x - 1, y + 6, 2, 12) }
  for (let k = 0; k < 3000; k++) { g.fillStyle = r() < .5 ? "rgba(60,40,20,.06)" : "rgba(255,250,230,.06)"; g.fillRect(r() * w, r() * h, 3, 3) } const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(60,40,20,.25)"); gr.addColorStop(.3, "rgba(60,40,20,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h) }, [2, 1]);
const M_PAPEL = new THREE.MeshStandardMaterial({ map: T_PAPEL, roughness: .95 });
const T_CORTINA = tex(256, 256, (g, w, h) => { const r = rng(4392); g.fillStyle = "#d8c8a0"; g.fillRect(0, 0, w, h); for (let k = 0; k < 90; k++) { const x = r() * w, y = r() * h; g.fillStyle = ["rgba(170,60,60,.6)", "rgba(80,110,150,.55)", "rgba(200,150,60,.6)"][k % 3]; for (let p = 0; p < 5; p++) { const a = p / 5 * 6.28; g.beginPath(); g.arc(x + Math.cos(a) * 4, y + Math.sin(a) * 4, 3.5, 0, 7); g.fill() } } for (let x = 0; x < w; x += 10) { g.fillStyle = "rgba(60,40,20,.12)"; g.fillRect(x, 0, 4, h) } });
const M_CORTINA = new THREE.MeshStandardMaterial({ map: T_CORTINA, roughness: 1 });
const T_ADOQUIN = (() => { const [c, z] = pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(4410), px = w / 3; c.fillStyle = "#3e3830"; c.fillRect(0, 0, w, h); z.fillStyle = "#101010"; z.fillRect(0, 0, w, h);
    const fh = .3 * px; for (let f = 0; f * fh < h; f++) { let x = -r() * .2 * px; while (x < w) { const sw = (.2 + r() * .1) * px, x0 = x + 3, y0 = f * fh + 3, P = [[x0, y0], [x0 + sw - 6, y0 + (r() - .5) * 4], [x0 + sw - 6 + (r() - .5) * 4, y0 + fh - 6], [x0 + (r() - .5) * 4, y0 + fh - 6]], col = rgbj(["#8a8478", "#7a746a", "#9a9488", "#6e685e", "#8e8270", "#a09a8c"][r() * 6 | 0], r, 20), v = 170 + r() * 70 | 0;
        for (const dx of [-w, 0, w]) { const Q = P.map(([a, b]) => [a + dx, b]); redondo(c, Q, 12); c.fillStyle = col; c.fill(); const gr = c.createRadialGradient(x0 + dx + sw * .35, y0 + fh * .3, 2, x0 + dx + sw / 2, y0 + fh / 2, sw * .7); gr.addColorStop(0, "rgba(255,250,235,.25)"); gr.addColorStop(1, "rgba(30,26,20,.3)"); c.fillStyle = gr; c.fill();
          redondo(z, Q, 12); const gz = z.createRadialGradient(x0 + dx + sw / 2, y0 + fh / 2, 2, x0 + dx + sw / 2, y0 + fh / 2, sw * .7); gz.addColorStop(0, `rgb(${v},${v},${v})`); gz.addColorStop(1, "#404040"); z.fillStyle = gz; z.fill() } x += sw } }
    for (let k = 0; k < 9000; k++) { c.fillStyle = r() < .5 ? "rgba(30,26,20,.16)" : "rgba(255,250,235,.1)"; c.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2) }
    for (let k = 0; k < 120; k++) { const x = r() * w, y = r() * h, s = 30 + r() * 110, gr = c.createRadialGradient(x, y, 0, x, y, s), cl2 = r() < .5 ? "40,34,26" : "200,190,170"; gr.addColorStop(0, `rgba(${cl2},.2)`); gr.addColorStop(1, `rgba(${cl2},0)`); c.fillStyle = gr; c.fillRect(x - s, y - s, 2 * s, 2 * s) } });
  [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
const geoSobreSuelo = (x0, x1, z0, z1, nx, nz, dy = .02) => { const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, nz); g.rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, 0, (z0 + z1) / 2); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, SUELO(p.getX(i), p.getZ(i)) + dy); g.computeVertexNormals(); return g };
const M_ADOQ_D = new THREE.MeshStandardMaterial({ map: T_ADOQUIN.c, bumpMap: T_ADOQUIN.z, bumpScale: 6, roughness: .88, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
const GEO_ADOQ = (() => { const r = rng(4420), pos = [], nor = [], col = [], idx = []; const P = ["#8a8478", "#7a746a", "#9a9488", "#6e685e", "#8e8270", "#a09a8c", "#857a6a", "#968e80"].map(linC);
  const piedra = (cx, cz, a, b, hh) => { const o = pos.length / 3, c = P[r() * P.length | 0], k = .82 + r() * .3, cc = [c[0] * k, c[1] * k, c[2] * k], ry = (r() - .5) * .12, cs = Math.cos(ry), sn = Math.sin(ry);
    // 3 × 3 vértices arriba (el centro más alto) + 8 de la pollera que entra al piso
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const lx = i * a * (Math.abs(j) ? .82 : 1) * (Math.abs(i) && Math.abs(j) ? .92 : 1), lz = j * b * (Math.abs(i) ? .86 : 1), y = hh * (1 - .55 * (i * i + j * j) / 2) + (r() - .5) * .008;
      pos.push(cx + lx * cs - lz * sn, y, cz + lx * sn + lz * cs); const nx = i * .55, nz = j * .55, l = Math.hypot(nx, 1, nz); nor.push(nx / l, 1 / l, nz / l); col.push(...cc) }
    const ring = [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]];
    ring.forEach(([i, j]) => { const lx = i * a * 1.05, lz = j * b * 1.05; pos.push(cx + lx * cs - lz * sn, -.03, cz + lx * sn + lz * cs); const l = Math.hypot(i, .2, j); nor.push(i / l, .2 / l, j / l); col.push(cc[0] * .6, cc[1] * .6, cc[2] * .6) });
    const T = (i, j) => o + (j + 1) * 3 + (i + 1); for (const [a1, b1, c1, d1] of [[T(-1, -1), T(0, -1), T(0, 0), T(-1, 0)], [T(0, -1), T(1, -1), T(1, 0), T(0, 0)], [T(-1, 0), T(0, 0), T(0, 1), T(-1, 1)], [T(0, 0), T(1, 0), T(1, 1), T(0, 1)]]) idx.push(a1, d1, b1, b1, d1, c1);
    for (let q = 0; q < 8; q++) { const A = T(...ring[q]), B = T(...ring[(q + 1) % 8]), A2 = o + 9 + q, B2 = o + 9 + (q + 1) % 8; idx.push(A, A2, B, B, A2, B2) } };
  // filas a lo largo de z (cruzan la calle), piedras de 0,2–0,3 m, trabadas
  const fw = .25; for (let fx = 0; fx < 8; fx++) { const x = -1 + (fx + .5) * fw; let z = -1 - (fx % 2) * .14; while (z < 1) { const L = .2 + r() * .1, zz = z + L / 2; if (zz > -1 && zz < 1) piedra(x + (r() - .5) * .02, zz, fw / 2 - .018, L / 2 - .016, .06 + r() * .03); z += L } }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(pos.filter((_, i) => i % 3 !== 1).map(v => v * 1.3), 2)); g.setIndex(idx); return g })();
const M_ADOQ = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .82, map: T_ROCA.c, bumpMap: T_ROCA.z, bumpScale: 2.5 });

// ---------- color del piso por vértice: tierra y piedra gastada en la ciudad, juntas oscuras bajo el empedrado, pasto ralo en los patios,
// roca en el risco, y afuera (r > 124) prados y chacras en parches (trigo, pasto, tierra arada)
const C_TIERRA = linC("#857560"), C_TIERRA2 = linC("#6a5e4c"), C_JUNTA = linC("#3a342e"), C_RALO = linC("#77824c"), C_RALO2 = linC("#97935a"), C_PRADO = linC("#6a8a40"), C_PRADO2 = linC("#8e9c4e"),
  C_ROCA_S = linC("#7a7266"), C_TRIGO = linC("#c0a058"), C_ARADA = linC("#6a5038");
function colorSueloB(x, z) { const r = Math.hypot(x, z), n = fbm2(x * .045 + 11, z * .045 + 2, 4), n2 = fbm2(x * .27 + 5, z * .27 + 8, 2), n3 = fbm2(x * .09 - 3, z * .09 + 7, 3);
  let c = mix3(C_TIERRA, C_TIERRA2, sst(.35, .7, n));
  c = mix3(c, mix3(C_RALO, C_RALO2, n2), sst(.42, .62, n3) * .8);
  const af = sst(124, 131, r); if (af > 0) { const a = Math.atan2(z, x), h = hash2(Math.floor((a + 4) * 22 / Math.PI + Math.floor(r / 16) * .5), Math.floor(r / 16)), surco = .5 + .5 * Math.sin((r + a * 30) * 3.1);
    const campo = h < .35 ? mix3(C_TRIGO, mix3(C_TRIGO, C_ARADA, .2), surco * .4) : h < .55 ? mix3(C_ARADA, C_TIERRA2, surco * .5) : mix3(C_PRADO, C_PRADO2, n2 * .8 + surco * .2); c = mix3(c, campo, af) }
  c = mix3(c, mix3(C_ROCA_S, C_RALO, sst(.45, .7, n2) * .55), sst(2, 9, riscoH(x, z)));
  c = mix3(c, C_JUNTA, calleKB(x, z) * .85);
  const s = .88 + .22 * n2; return [c[0] * s, c[1] * s, c[2] * s] }

// ---------- la malla del piso, POLAR (anillos finos en la ciudad, con un anillo doble en cada muro: el salto de 3,2 m queda vertical y exacto)
const TERRENO = (() => { const RS = []; for (let r = 0; r < 125; r += .5) if (TERR_B.every(b => Math.abs(r - b) > .2)) RS.push(r); TERR_B.forEach(b => RS.push(b - .002, b + .002));
  for (let r = 126; r <= 160; r += 2) RS.push(r); for (let r = 165; r <= 250; r += 5) RS.push(r); RS.sort((a, b) => a - b);
  const NA = 720, nr = RS.length, n = nr * (NA + 1), pos = new Float32Array(n * 3), uv = new Float32Array(n * 2), col = new Float32Array(n * 3), idx = [];
  for (let i = 0; i < nr; i++) for (let j = 0; j <= NA; j++) { const a = j / NA * Math.PI * 2, r = RS[i], x = Math.cos(a) * r, z = Math.sin(a) * r, k = i * (NA + 1) + j, c = colorSueloB(x, z);
    pos[k * 3] = x; pos[k * 3 + 1] = SUELO(x, z) - .01; pos[k * 3 + 2] = z; uv[k * 2] = x / 6; uv[k * 2 + 1] = z / 6; col[k * 3] = c[0]; col[k * 3 + 1] = c[1]; col[k * 3 + 2] = c[2] }
  for (let i = 0; i < nr - 1; i++) for (let j = 0; j < NA; j++) { const a = i * (NA + 1) + j, b = a + NA + 1; idx.push(a, a + 1, b, b, a + 1, b + 1) }
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); geo.setAttribute("color", new THREE.BufferAttribute(col, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const nor = geo.attributes.normal; for (let i = 0; i < nr; i++) { const b = TERR_B.find(b => Math.abs(RS[i] - b) < .01); if (b === undefined) continue; const off = RS[i] < b ? -.6 : .6;
    for (let j = 0; j <= NA; j++) { const a = j / NA * Math.PI * 2, q = sueloN(Math.cos(a) * (b + off), Math.sin(a) * (b + off), .3); nor.setXYZ(i * (NA + 1) + j, q[0], q[1], q[2]) } }
  const m = new THREE.Mesh(geo, M_TIERRA); m.receiveShadow = true; scene.add(m); return m })();
AGUA.visible = false;

// ---------- banda polar: perfil [[r, y(a)], …] barrido en ángulo de a0 a a1 (cada tramo del perfil con sus propias normales). Devuelve geometría
function bandaPolar(prof, a0, a1, paso = .5, uvS = 3.2) { const pos = [], uv = [], idx = []; const rMed = prof.reduce((s, p) => s + p[0], 0) / prof.length, NA = Math.max(2, Math.ceil(Math.abs(a1 - a0) * rMed / paso));
  for (let s = 0; s < prof.length - 1; s++) { const o = pos.length / 3, [ra, ya] = prof[s], [rb, yb] = prof[s + 1], vert = Math.abs(rb - ra) < .5 * Math.abs(ya(0) - yb(0)) + .05;
    for (let j = 0; j <= NA; j++) { const a = lerp(a0, a1, j / NA), c = Math.cos(a), sn = Math.sin(a), Ya = ya(a), Yb = yb(a), u = a * rMed / uvS;
      pos.push(c * ra, Ya, sn * ra, c * rb, Yb, sn * rb); if (vert) uv.push(u, Ya / uvS, u, Yb / uvS); else uv.push(u, ra / uvS, u, rb / uvS) }
    for (let j = 0; j < NA; j++) { const A = o + j * 2, B = A + 2; idx.push(A, B, A + 1, A + 1, B, B + 1) } }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  // las caras miran hacia afuera del perfil (si quedaron al revés, se dan vuelta)
  return g }
const giraCaras = g => { const ix = g.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t } g.computeVertexNormals(); return g };
const yA = (r, d = 0) => a => SUELO(Math.cos(a) * r, Math.sin(a) * r) + d;

// ---------- piedra de los muros de contención: bloques grandes, oscuros abajo (humedad, musgo), líquenes
const M_MURO_T = (() => { const [t, z] = T_MURO(4240, ["#8a8276", "#76706a", "#9a9284", "#6a645c", "#a39a88", "#5e5a54", "#847866"], { mortero: "#46423c", escala: 1.7, musgo: 1, liquen: 90 }); return new THREE.MeshStandardMaterial({ map: t, bumpMap: z, bumpScale: 5, roughness: .95 }) })();
const M_ESCALON = new THREE.MeshStandardMaterial({ map: T_ROCA.c, bumpMap: T_ROCA.z, bumpScale: 3, roughness: .9, color: "#b2a894" });
const M_CORONA = new THREE.MeshStandardMaterial({ map: T_ROCA.c, bumpMap: T_ROCA.z, bumpScale: 3, roughness: .88, color: "#c8bea8" });
// ángulos libres (sin calle radial) sobre el radio r: lista de [a0, a1]
function angLibres(r, margen = .35) { const cort = CALLES_RAD.filter(c => r < c.rMax + 2).map(c => { const a = radAng(c, r), h = (c.an / 2 + margen) / r; return [a - h, a + h] }).sort((p, q) => p[0] - q[0]);
  const L = []; for (let k = 0; k < cort.length; k++) { const a0 = cort[k][1], a1 = k + 1 < cort.length ? cort[k + 1][0] : cort[0][0] + Math.PI * 2; if (a1 > a0) L.push([a0, a1]) } return L }
const L_PIEDRA = lote();   // muros, parapetos, escaleras, cordones (se cierra más abajo)
const CORONAS = [];        // piedras de coronamiento del parapeto (instanciadas): [x, y, z, ry, largo]
TERR_B.forEach((b, i) => { const lo = yA(b - .7, -.45), hi = yA(b + .08), top = yA(b + .08, .02);
  // la cara del muro (algo inclinada) y su tapa
  const enRiscoA = a => riscoH(Math.cos(a) * b, Math.sin(a) * b) > 5;   // sobre el risco el escalón es roca viva, sin muro ni parapeto
  for (let k = 0; k < 180; k++) { const a0 = k / 180 * Math.PI * 2, a1 = (k + 1) / 180 * Math.PI * 2; L_PIEDRA.add(enRiscoA((a0 + a1) / 2) ? "rocaT" : "muroT", bandaPolar([[b - .36, lo], [b - .17, hi]], a0, a1, .45)) }
  // parapeto de 0,95 m sobre la terraza de arriba, cortado donde llegan las escaleras
  angLibres(b + .1).flatMap(([a0, a1]) => { const L = []; let s0 = null; for (let a = a0; a <= a1 + 1e-6; a += .004) { const ok = !enRiscoA(a) && a < a1; if (ok && s0 === null) s0 = a; if (!ok && s0 !== null) { if (a - s0 > .01) L.push([s0, a]); s0 = null } } return L }).forEach(([a0, a1]) => { const pr = [[b - .17, top], [b - .17, yA(b + .08, .95)], [b + .3, yA(b + .08, .95)], [b + .3, top]];
    L_PIEDRA.add("muroT", bandaPolar(pr, a0, a1, .45));
    for (const a of [a0, a1]) { const x = Math.cos(a) * (b + .07), z = Math.sin(a) * (b + .07); L_PIEDRA.add("corona", RB1(.62, 1.25, .62, .05), TM(x, hi(a) + .6, z, 0, -a, 0)); L_PIEDRA.add("corona", RB1(.4, .22, .4, .05), TM(x, hi(a) + 1.32, z, 0, -a + .78, 0)) }
    const n = Math.floor((a1 - a0) * (b + .07) / .92); for (let k = 0; k < n; k++) { const a = lerp(a0, a1, (k + .5) / n); CORONAS.push([Math.cos(a) * (b + .07), hi(a) + .97, Math.sin(a) * (b + .07), -a, (a1 - a0) * (b + .07) / n - .04]) } }) });
// las escaleras: escalones macizos de piedra gastada (el centro más gastado), muretes a los costados con baranda de hierro
const BARANDAS = [], rectAddLater = [];   // [[x, y, z] …] tramos de baranda (los pone el detalle en hierro)
ESCALERAS_B.forEach(E => { const M = TM(E.cx, 0, E.cz, 0, E.ry, 0), base = E.y0 - .5, t = E.L / E.n;
  for (let k = 0; k < E.n; k++) { const u = -E.L / 2 + (k + .5) * t, y = E.y0 + (k + 1) * (E.y1 - E.y0) / E.n, hh = y - base;
    L_PIEDRA.add("escalon", RB1(E.W, hh, t + .06, .045), M.clone().multiply(TM((hash2(k, E.cx * 9) - .5) * .04, base + hh / 2, u)));
    for (const s of [-1, 1]) { const hm = y + .85 - base; L_PIEDRA.add("muroT", uvMuro(new THREE.BoxGeometry(.42, hm, t + .01), 3.2, E.cx * .1, k * .1), M.clone().multiply(TM(s * (E.W / 2 + .21), base + hm / 2, u)));
      L_PIEDRA.add("corona", RB1(.5, .1, t + .02, .03), M.clone().multiply(TM(s * (E.W / 2 + .21), y + .9, u))) } }
  for (const s of [-1, 1]) { const P = [], w = s * (E.W / 2 - .12); for (let k = 0; k <= E.n; k += 4) { const u = -E.L / 2 + Math.min(E.n - .5, k + .5) * t, y = E.y0 + (Math.min(E.n - 1, k) + 1) * (E.y1 - E.y0) / E.n; P.push(new THREE.Vector3(w, y, u).applyMatrix4(M).toArray()) } BARANDAS.push(P) }
  rectAddLater.push({ x: E.cx, z: E.cz, ry: E.ry, w: E.W + .9, d: E.L, esc: 1 }) });

// ---------- calcomanía de adoquines: calles anulares (bandas) y radiales (tiras curvas), y ADOQUINES EN 3D cerca del centro
const M_ADOQ_R = M_ADOQ_D.clone(); M_ADOQ_R.polygonOffsetFactor = -3; M_ADOQ_R.polygonOffsetUnits = -6;
ANILLOS.forEach(([r0, r1]) => { const pos = [], uv = [], idx = [], NA = Math.ceil(Math.PI * 2 * r1 / .6), NR = Math.max(2, Math.round((r1 - r0) / 1.2)), rm = (r0 + r1) / 2, fuera = j => riscoH(Math.cos(j / NA * Math.PI * 2) * rm, Math.sin(j / NA * Math.PI * 2) * rm) > 3;
  for (let j = 0; j <= NA; j++) for (let i = 0; i <= NR; i++) { const a = j / NA * Math.PI * 2, r = lerp(r0, r1, i / NR), x = Math.cos(a) * r, z = Math.sin(a) * r; pos.push(x, SUELO(x, z) + .015, z); uv.push(a * (r0 + r1) / 2 / 3, (r - r0) / 3) }
  for (let j = 0; j < NA; j++) { if (fuera(j) || fuera(j + 1)) continue; for (let i = 0; i < NR; i++) { const A = j * (NR + 1) + i, B = A + NR + 1; idx.push(A, A + 1, B, B, A + 1, B + 1) } }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  giraCaras(g); const m = new THREE.Mesh(g, M_ADOQ_D); m.receiveShadow = true; m.renderOrder = -.2; scene.add(m) });
CALLES_RAD.forEach(c => { const pos = [], uv = [], idx = [], NL = 4; let o = 0; const corte = r => TERR_B.some(b => r > b - 5.75 && r < b + .1);
  let tramo = []; const cerrar = () => { if (tramo.length < 2) { tramo = []; return } const base = pos.length / 3; tramo.forEach(r => { for (let i = 0; i <= NL; i++) { const lat = lerp(-c.an / 2 - .1, c.an / 2 + .1, i / NL), [x, z] = radPunto(c, r, lat); pos.push(x, SUELO(x, z) + .018, z); uv.push(lat / 3, r / 3) } });
    for (let k = 0; k < tramo.length - 1; k++) for (let i = 0; i < NL; i++) { const A = base + k * (NL + 1) + i, B = A + NL + 1; idx.push(A, B, A + 1, A + 1, B, B + 1) } tramo = [] };
  for (let r = PLAZA_R + .3; r <= c.rMax; r += .5) { if (corte(r)) cerrar(); else tramo.push(r) } cerrar();
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  if (g.attributes.normal.getY(0) < 0) giraCaras(g); const m = new THREE.Mesh(g, M_ADOQ_R); m.receiveShadow = true; m.renderOrder = -.15; scene.add(m) });
const ADOQUINES = []; { const L = [], cc = new THREE.Color(), enEsc = (x, z) => ESCALERAS_B.some(E => { const [v, u] = escLocal(E, x, z); return Math.abs(v) < E.W / 2 + 1.2 && Math.abs(u) < E.L / 2 + 1.1 });
  ANILLOS.forEach(([r0, r1, nm]) => { if (r0 > 62) return; for (let r = r0 + 1; r < r1 - .4; r += 2) { const n = Math.round(Math.PI * 2 * r / 2); for (let j = 0; j < n; j++) { const a = j / n * Math.PI * 2; L.push([Math.cos(a) * r, Math.sin(a) * r, -a]) } } });
  CALLES_RAD.forEach(c => { for (let r = PLAZA_R + 1.6; r < 60; r += 2) for (let lat = -c.an / 2 + 1; lat < c.an / 2 - .3; lat += 2) { const [x, z] = radPunto(c, r, lat); if (!enAnillo(x, z, 1)) L.push([x, z, -radAng(c, r) + Math.PI / 2]) } });
  const LL = L.filter(([x, z]) => !enEsc(x, z));
  const m = new THREE.InstancedMesh(GEO_ADOQ, M_ADOQ, LL.length); LL.forEach(([x, z, ry], i) => { const n = sueloN(x, z, 1); dummy.position.set(x, SUELO(x, z), z); dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...n)); dummy.rotateY(ry + (i % 2) * Math.PI); dummy.scale.set(1, .9 + hash2(x * 7, z * 3) * .25, 1); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); const v = .86 + hash2(x, z) * .24; m.setColorAt(i, cc.setRGB(v, v * .98, v * .95)) });
  m.receiveShadow = true; m.castShadow = false; scene.add(m); ADOQUINES.push(m) }

// ---------- LA PLAZA: losas en anillos alrededor de la fuente (doce losas de basalto marcan las horas: la sombra de la campana es la aguja),
// vereda de losas hasta las casas y cordón de piedra larga
const LOSAS_PLAZA = (() => { const r = rng(4460), L = []; let rr = 5.45;
  while (rr < 15.45) { const an = .62 + r() * .2, r1 = Math.min(15.45, rr + an), rm = (rr + r1) / 2; let a = r() * 6.283; const fin = a + 6.283;
    while (a < fin - .01) { const la = .55 + r() * .55, da = Math.min(fin - a, la / rm), am = a + da / 2, x = Math.cos(am) * rm, z = Math.sin(am) * rm;
      const hora = rm > 12.4 && rm < 14.3 && Math.abs(angD(am, Math.round(am * 6 / Math.PI) * Math.PI / 6)) * rm < .5;
      if (!(rm > PLAZA_R && enRadial(x, z, .2))) L.push({ x, z, ry: -am, w: da * rm - .03, d: (r1 - rr) - .03, k: hora ? 2 : rm > PLAZA_R ? 1 : 0, v: r() });
      a += da } rr = r1 }
  const g = RB(1, 1, 1, .06, 1), m = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({ map: T_ROCA.c, bumpMap: T_ROCA.z, bumpScale: 3, roughness: .86 }), L.length), cc = new THREE.Color();
  const P = ["#a8a090", "#9a9284", "#b4ac9a", "#8e877a", "#a49a86", "#bcb2a0", "#968c7a"];
  L.forEach((q, i) => { const hh = .16 + q.v * .03, y = SUELO(q.x, q.z) + .055 - hh / 2 + (hash2(i, 3) - .5) * .02; dummy.position.set(q.x, y, q.z); dummy.rotation.set((hash2(i, 5) - .5) * .02, q.ry, (hash2(i, 7) - .5) * .02); dummy.scale.set(q.d, hh, q.w); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix);
    m.setColorAt(i, q.k === 2 ? cc.set("#3a3836") : cc.set(P[(q.v * P.length) | 0]).multiplyScalar(q.k === 1 ? .86 : 1)) });
  m.castShadow = false; m.receiveShadow = true; scene.add(m); return m })();
// cordón de la plaza (piedras largas, un poco más altas)
angLibres(PLAZA_R + .1, .1).forEach(([a0, a1]) => { const n = Math.ceil((a1 - a0) * PLAZA_R / 1.1); for (let k = 0; k < n; k++) { const a = lerp(a0, a1, (k + .5) / n), x = Math.cos(a) * (PLAZA_R + .1), z = Math.sin(a) * (PLAZA_R + .1); L_PIEDRA.add("corona", RB1(.32, .26, (a1 - a0) * PLAZA_R / n - .03, .04), TM(x, SUELO(x, z) + .1, z, 0, -a, 0)) } });
// ---------- registro de lo ocupado (para que la utilería no se pise con las casas)
const OCUP = [], RECTS = [], GRILLA_O = new Map(), CELDA_O = 6, PAD_O = 2.5;   // grilla espacial (las búsquedas miran solo su celda)
const enRect = (R, x, z, m = 0) => { const c = Math.cos(R.ry), s = Math.sin(R.ry), dx = x - R.x, dz = z - R.z, lx = dx * c - dz * s, lz = dx * s + dz * c; return Math.abs(lx) < R.w / 2 + m && Math.abs(lz) < R.d / 2 + m };
const enGrilla = (it, x, z, rr) => { const a = Math.floor((x - rr) / CELDA_O), b = Math.floor((x + rr) / CELDA_O), c = Math.floor((z - rr) / CELDA_O), d = Math.floor((z + rr) / CELDA_O); for (let i = a; i <= b; i++) for (let j = c; j <= d; j++) { const k = i * 100003 + j; (GRILLA_O.get(k) || GRILLA_O.set(k, []).get(k)).push(it) } };
const rectAdd = R => { RECTS.push(R); R.rect = 1; enGrilla(R, R.x, R.z, Math.hypot(R.w, R.d) / 2 + PAD_O) };
const zonaLibre = (x, z, r = 0) => enCalle(x, z, r - .3) || Math.hypot(x, z) < 5.6 + r;   // calles, plaza y fuente (la utilería suelta no va ahí salvo o.zona)
const libreEn = (x, z, r = .5, o = {}) => { if (!o.zona && zonaLibre(x, z, r)) return false; const L = GRILLA_O.get(Math.floor(x / CELDA_O) * 100003 + Math.floor(z / CELDA_O)); if (!L) return true;
  for (const q of L) { if (q.rect) { if (q !== o.salvo && enRect(q, x, z, r + (o.mc ?? .1))) return false } else if (Math.hypot(x - q.x, z - q.z) < r + q.r) return false } return true };
const ocupa = (x, z, r) => { const q = { x, z, r }; OCUP.push(q); enGrilla(q, x, z, r + PAD_O); return true };
rectAddLater.forEach(rectAdd);
// ---------- LAS CASAS: piedra, ladrillo o revoque (a veces piso de arriba con entramado), techo a dos aguas de pizarra o tejas (cumbrera a lo largo
// de la calle o con el frontón a la calle), chimenea con cañones de barro, canaletas y caños de lata, puerta con escalón, ventanas con postigos.
// `simple`: casas lejanas (solo volúmenes, techo, chimenea, huecos oscuros). Todo va a lotes (pocas llamadas de dibujo).
const L_CASA = lote(), L_LEJOS = lote(), CASAS_P = [], HUMOS = [], VELAS_B = [], MACETAS_B = [];   // VELAS_B: { p: [x, y, z], h, g (grupo: 0 ventanas, 1 tienda, 2 plaza/fuente, 3 casa de Nell, 4 faroles) }
const CASA_MATS = { zocalo: M_ZOCALO, revoque: M_REVOQUE, piedraC: M_PIEDRA_C, madera: M_MADERA, maderaV: M_MADERA_V, viga: M_VIGA, vidrio: M_VIDRIO, oscuro: M_OSCURO, hierro: M_HIERRO, hierroO: M_HIERRO_O, terracota: M_TERRACOTA, roca: M_ROCA_G, soga: M_SOGA, chapa: M_CHAPA, sillarC: M_SILLAR_C, blanco: M_BLANCO_P, laton: M_LATON,
  luz: new THREE.MeshStandardMaterial({ color: "#ffe0a0", emissive: "#ffb850", emissiveIntensity: 1.3, roughness: .4 }), ventana: M_VENTANA, vidrioC: M_VIDRIO_C, hollin: M_HOLLIN, muroT: M_MURO_T, corona: M_CORONA };
M_MURO.forEach((m, i) => CASA_MATS["muro" + i] = m); M_LAD.forEach((m, i) => CASA_MATS["lad" + i] = m); M_REV.forEach((m, i) => CASA_MATS["rev" + i] = m); M_PIZ.forEach((m, i) => CASA_MATS["piz" + i] = m); M_TEJA.forEach((m, i) => CASA_MATS["teja" + i] = m); M_PUERTA.forEach((m, i) => CASA_MATS["col" + i] = m);
const ventanaPiezas = (add, M, an, al, r, col, o = {}) => {   // M = matriz en la cara (origen al pie de la ventana, +z hacia afuera)
  add(o.vidrio || "ventana", new THREE.PlaneGeometry(an, al), M.clone().multiply(TM(0, al / 2, .02)));
  if (o.simple) { add("piedraC", RB1(an + .3, .1, .2, .03), M.clone().multiply(TM(0, -.05, .06))); return }
  const mk2 = o.blanco ? "blanco" : "madera";
  for (const s of [-1, 1]) add(mk2, new THREE.BoxGeometry(.08, al + .08, .1), M.clone().multiply(TM(s * (an / 2 + .02), al / 2, .04)));
  for (const yy of [0, al]) add(mk2, new THREE.BoxGeometry(an + .12, .08, .1), M.clone().multiply(TM(0, yy, .04)));
  add(mk2, new THREE.BoxGeometry(.05, al, .05), M.clone().multiply(TM(0, al / 2, .05))); add(mk2, new THREE.BoxGeometry(an, .05, .05), M.clone().multiply(TM(0, al * .55, .05)));
  add("piedraC", RB1(an + .36, .1, .26, .03), M.clone().multiply(TM(0, -.06, .1))); add("piedraC", RB1(an + .4, .2, .14, .03), M.clone().multiply(TM(0, al + .14, .05)));
  if (o.sinPostigo) return;
  const ce = o.cerrado ?? r() < .2; for (const s of [-1, 1]) { const ang = ce ? 0 : s * (Math.PI - .12), hm = M.clone().multiply(TM(s * (an / 2 + .06), al / 2, .09, 0, ang, 0)); add(col, new THREE.BoxGeometry(an / 2 + .02, al + .04, .05), hm.clone().multiply(TM(-s * (an / 4 + .01), 0, 0)));
    for (const yy of [-al * .32, al * .32]) add("madera", new THREE.BoxGeometry(an / 2 - .04, .07, .03), hm.clone().multiply(TM(-s * (an / 4), yy, ce ? .04 : -.04))) } };
// casaP(x, z, ry, w, d, h, seed, o): frente hacia +z local (ry = 0 mira al sur, ry = π mira al norte); h = altura del alero
// o: { muro: "muro0".."lad2".."rev5"|"sillarC", techo: "piz0".."teja2", frontal (frontón a la calle), dos (entramado arriba), simple, L (lote), chimMax, chimSep, pendiente, mansion, puertaX, color }
function casaP(x, z, ry, w, d, h, seed, o = {}) { const r = rng(seed), cs = Math.cos(ry), sn = Math.sin(ry), simple = !!o.simple, L = o.L || (simple ? L_LEJOS : L_CASA);
  const y0 = o.y0 ?? Math.min(SUELO(x, z), ...[[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([a, b]) => SUELO(x + (a * w / 2) * cs + (b * d / 2) * sn, z - (a * w / 2) * sn + (b * d / 2) * cs))) - .06;
  const HM = o.HM || TM(x, y0, z, 0, ry, 0), add = (k, g, m) => L.add(k, g, m ? HM.clone().multiply(m) : HM.clone()), W = (lx, ly, lz) => new THREE.Vector3(lx, ly, lz).applyMatrix4(HM);
  const mu = o.muro ?? (r() < .45 ? "muro" + (r() * M_MURO.length | 0) : r() < .6 ? "lad" + (r() * M_LAD.length | 0) : "rev" + (r() * M_REV.length | 0)), dos = !simple && (o.dos ?? (mu.startsWith("muro") && r() < .3)), hs = dos ? 2.9 : h;
  const techo = o.techo ?? (r() < .5 ? "piz" + (r() * 3 | 0) : "teja" + (r() * 3 | 0)), col = "col" + (o.color ?? (r() * M_PUERTA.length | 0)), frontal = !!o.frontal;
  // zócalo y muros
  if (!o.sinZocalo) add("zocalo", uvMuro(new THREE.BoxGeometry(w + .2, 1.4, d + .2), 3.2), TM(0, -.45, 0));
  if (o.hueco) add(mu, uvMuro(new THREE.BoxGeometry(w, hs - o.hueco, d), 3.2, r(), r()), TM(0, o.hueco + (hs - o.hueco) / 2, 0));
  else add(mu, uvMuro(new THREE.BoxGeometry(w, hs, d), 3.2, r(), r()), TM(0, hs / 2, 0));
  if (dos) { const hu = h - hs, rv = "rev" + (r() * M_REV.length | 0); add(rv, uvMuro(new THREE.BoxGeometry(w + .2, hu, d + .2), 3.4, r(), r()), TM(0, hs + hu / 2, 0));
    const cara = (L2, M) => { add("viga", new THREE.BoxGeometry(L2 + .1, .16, .1), M.clone().multiply(TM(0, .08, 0))); add("viga", new THREE.BoxGeometry(L2 + .1, .16, .1), M.clone().multiply(TM(0, hu - .08, 0))); const n = Math.max(2, Math.round(L2 / 1.25));
      for (let k = 0; k <= n; k++) { const xx = lerp(-L2 / 2 + .06, L2 / 2 - .06, k / n); add("viga", new THREE.BoxGeometry(.15, hu, .1), M.clone().multiply(TM(xx, hu / 2, 0))); if (k < n && k % 2 === 0) { const x2 = lerp(-L2 / 2 + .06, L2 / 2 - .06, (k + 1) / n), [g, m] = cilEntre([xx, .1, 0], [x2, hu - .1, 0], .06, 4); add("viga", g, M.clone().multiply(m)) } } };
    cara(w + .2, TM(0, hs, d / 2 + .15)); cara(w + .2, TM(0, hs, -d / 2 - .15, 0, Math.PI, 0)); cara(d + .2, TM(w / 2 + .15, hs, 0, 0, Math.PI / 2, 0)); cara(d + .2, TM(-w / 2 - .15, hs, 0, 0, -Math.PI / 2, 0)) }
  if (!simple) {
    // esquineras (piedra clara) y cornisa entre pisos
    if ((!mu.startsWith("rev") || o.mansion) && !o.sinEsquinas) for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) for (let yy = .25, k = 0; yy < hs - .2; yy += .44, k++) { const la = k % 2 ? .62 : .38; add(o.mansion ? "blanco" : "piedraC", RB1(.1 + la * (k % 2 ? 1 : .1), .38, .1 + la * (k % 2 ? .1 : 1), .04), TM(sx * (w / 2 + .015) - sx * la * (k % 2 ? .5 : 0), yy, sz * (d / 2 + .015) - sz * la * (k % 2 ? 0 : .5))) }
    for (let yy = 2.95; yy < h - 1; yy += 2.9) add(o.mansion ? "blanco" : o.sinEsquinas ? "viga" : "piedraC", RB1(w + .16, .16, d + .16, .03), TM(0, yy, 0));
  }
  // ---- el techo (en el «marco del techo» la cumbrera va a lo largo de X y el ancho a lo largo de Z; frontal: girado 90°)
  const span = frontal ? w : d, len = frontal ? d : w, RM = frontal ? TM(0, 0, 0, 0, Math.PI / 2, 0) : new THREE.Matrix4(), addR = (k, g, m) => add(k, g, RM.clone().multiply(m || new THREE.Matrix4()));
  const ang = (o.pendiente ?? (40 + r() * 12)) * Math.PI / 180, ovx = .35, ovz = .45, rh = span / 2 * Math.tan(ang), ye = h - ovz * Math.tan(ang), S = (span / 2 + ovz) / Math.cos(ang), Lt = len + 2 * ovx;
  { const sh = new THREE.Shape(); sh.moveTo(-span / 2, 0); sh.lineTo(span / 2, 0); sh.lineTo(0, rh); sh.closePath(); const gp = new THREE.ExtrudeGeometry(sh, { depth: len, bevelEnabled: false }); gp.rotateY(Math.PI / 2); gp.translate(-len / 2, 0, 0); addR(dos ? "rev" + (seed % M_REV.length) : mu, uvMuro(gp, 3.2, r(), .3), TM(0, h, 0)) }
  const tk = techo.startsWith("piz") ? 4.4 : 3.4;
  for (const s of [1, -1]) { const g = new THREE.BoxGeometry(Lt, .17, S); geoUV(g, px => px / tk, (px, py, pz) => -pz / tk); const ym = h + rh + .1 - (span / 2 + ovz) * Math.tan(ang) / 2, zm = s * (span / 2 + ovz) / 2;
    addR(techo, g, TM(0, ym, zm, ang, s > 0 ? 0 : Math.PI, 0));
    if (!simple) { for (const sx of [-1, 1]) addR("madera", new THREE.BoxGeometry(.06, .3, S + .04), TM(sx * (Lt / 2 + .02), ym - .06, zm, ang, s > 0 ? 0 : Math.PI, 0));
      // canaleta de lata y caño de bajada
      addR("hierroO", new THREE.CylinderGeometry(.08, .08, Lt - .1, 8, 1, true, 0, Math.PI), TM(0, ye - .06, s * (span / 2 + ovz - .02), Math.PI / 2, 0, Math.PI / 2));
      if (r() < .7) { const xp = (r() < .5 ? -1 : 1) * (len / 2 - .25); addR("hierroO", new THREE.CylinderGeometry(.05, .05, ye - .1, 6), TM(xp, (ye - .1) / 2, s * (span / 2 + .08))); addR("hierroO", new THREE.CylinderGeometry(.05, .05, .5, 6), TM(xp, ye - .2, s * (span / 2 + .25), Math.PI / 4 * s, 0, 0)) }
      // parches: chapa clavada sobre las tejas rotas (casas pobres), o una fila de tejas nuevas
      if (o.parches && r() < .55) { const pw = .9 + r() * 1.4, pl = .8 + r() * 1.2, u = .25 + r() * .5, xx = (r() - .5) * (len - pw - .6); addR(r() < .7 ? "chapa" : techo === "piz0" ? "piz1" : "piz0", new THREE.BoxGeometry(pw, .03, pl), TM(0, ym, zm, ang, s > 0 ? 0 : Math.PI, 0).multiply(TM(xx, .1, (u - .5) * S))) } } }
  addR(techo.startsWith("teja") ? "terracota" : "zocalo", new THREE.CylinderGeometry(.15, .15, Lt + .1, 8), TM(0, h + rh + .15, 0, 0, 0, Math.PI / 2));
  // buhardilla (mansiones y algunas casas de dos pisos): ventanita con techito sobre el faldón del frente
  if (!simple && (o.mansion || (!frontal && w > 5.4 && r() < .35))) { const nb = o.mansion ? Math.max(2, Math.floor(len / 3.6)) : 1; for (let k = 0; k < nb; k++) { const xx = nb > 1 ? lerp(-len / 2 + 1.6, len / 2 - 1.6, k / (nb - 1)) : (r() - .5) * (len - 2.4), u = .42, zz = span / 2 * (1 - u) * 1, yb = h + rh * u;
      addR(mu.startsWith("rev") || o.mansion ? (o.mansion ? "sillarC" : mu) : "revoque", uvMuro(new THREE.BoxGeometry(1.2, 1.3, 1.4), 2.4), TM(xx, yb + .45, zz + .1)); ventanaPiezas(addR, TM(xx, yb + .15, zz + .82), .66, .78, r, col, { sinPostigo: 1, blanco: o.mansion });
      for (const s2 of [-1, 1]) addR(techo, new THREE.BoxGeometry(.95, .08, 1.75), TM(xx + s2 * .38, yb + 1.33, zz + .15, 0, 0, s2 * -.62)) } }
  // ---- la chimenea (en un extremo de la cumbrera); chimSep = va aparte para poder inclinarla (techosRajan)
  const sxc = o.chimX ?? (r() < .5 ? 1 : -1), cxr = sxc * (len / 2 - .6), czr = (r() - .5) * span * .15, ytop0 = h + rh + .9 + r() * .7, chMax = o.chimMax ?? 99, ctop = Math.min(ytop0, chMax), chW = .72 + r() * .2;
  const chimeneaPartes = (A, M0) => { A(mu.startsWith("rev") ? "lad" + (seed % 3) : mu, uvMuro(new THREE.BoxGeometry(chW, ctop - h + .3, chW * .9), 2.4), M0.clone().multiply(TM(0, (ctop - h + .3) / 2, 0)));
    if (simple) return; A("piedraC", RB1(chW + .18, .12, chW * .9 + .18, .03), M0.clone().multiply(TM(0, ctop - h + .36, 0)));
    for (const s of [-1, 1]) { A("terracota", new THREE.CylinderGeometry(.1, .12, .36, 10, 1, true), M0.clone().multiply(TM(s * chW * .24, ctop - h + .6, 0))); A("oscuro", new THREE.CircleGeometry(.09, 10), M0.clone().multiply(TM(s * chW * .24, ctop - h + .77, 0, -Math.PI / 2))) } };
  const chM = RM.clone().multiply(TM(cxr, h - .3, czr));   // base de la chimenea (dentro del ático), en coordenadas de la casa
  let chimG = null;
  if (o.chimSep) { const CL = lote(), base = W(...new THREE.Vector3(cxr, h + rh * (1 - Math.abs(czr) / (span / 2)) - .15, czr).applyMatrix4(RM).toArray()), Minv = new THREE.Matrix4().makeTranslation(-base.x, -base.y, -base.z);
    chimeneaPartes((k, g, m) => CL.add(k, g, Minv.clone().multiply(HM).multiply(m)), chM); chimG = { L: CL, base, ry } }
  else chimeneaPartes(add, chM);
  const chimTop = W(...new THREE.Vector3(cxr, ctop + .75, czr).applyMatrix4(RM).toArray()); HUMOS.push(chimTop);
  // ---- la puerta (al frente), con jambas, dintel y escalón; mansiones: puerta doble con pórtico de columnas
  const px = o.puertaX ?? (r() - .5) * Math.max(0, w - 3.4), dw = o.mansion ? 1.8 : 1.05, dh = o.mansion ? 2.7 : 2.1; const F = TM(px, 0, d / 2);
  if (o.sinPuerta) { }
  else if (simple) add("oscuro", new THREE.PlaneGeometry(dw, dh), F.clone().multiply(TM(0, dh / 2, .02)));
  else { add("piedraC", RB1(dw + .5, .26, .2, .03), F.clone().multiply(TM(0, dh + .13, .06))); for (const s of [-1, 1]) add("piedraC", RB1(.22, dh, .16, .03), F.clone().multiply(TM(s * (dw / 2 + .11), dh / 2, .05)));
    add("oscuro", new THREE.PlaneGeometry(dw, dh), F.clone().multiply(TM(0, dh / 2, .01)));
    if (o.mansion) for (const s of [-1, 1]) add(col, new THREE.BoxGeometry(dw / 2 - .03, dh - .03, .07), F.clone().multiply(TM(s * dw / 4, dh / 2, .04)));
    else add(col, new THREE.BoxGeometry(dw - .04, dh - .03, .06), F.clone().multiply(TM(0, dh / 2, .04)));
    for (const yy of [.35, dh - .4]) add("hierro", new THREE.BoxGeometry(dw * .75, .06, .02), F.clone().multiply(TM(-dw * .1, yy, .08)));
    add(o.mansion ? "laton" : "hierro", new THREE.TorusGeometry(.07, .015, 6, 12), F.clone().multiply(TM(dw / 2 - .2, dh * .48, .1))); add("piedraC", RB1(dw + .7, .16, .62, .05), F.clone().multiply(TM(0, .02, .3)));
    if (o.mansion) { for (let k = 0; k < 3; k++) add("blanco", RB1(dw + 2.4 - k * .4, .18, 1.6 - k * .4, .03), F.clone().multiply(TM(0, .09 + k * .18 - .1, 1.1 - k * .2)));
      for (const s of [-1, 1]) for (const s2 of [.6, 1.4]) { add("blanco", new THREE.CylinderGeometry(.16, .19, dh + .9, 14), F.clone().multiply(TM(s * (dw / 2 + s2), (dh + .9) / 2 + .2, 1.25))); add("blanco", RB1(.5, .18, .5, .03), F.clone().multiply(TM(s * (dw / 2 + s2), dh + 1.15, 1.25))) }
      add("blanco", RB1(dw + 4, .35, 1.9, .04), F.clone().multiply(TM(0, dh + 1.42, .95))); const sh = new THREE.Shape(); sh.moveTo(-(dw / 2 + 2.05), 0); sh.lineTo(dw / 2 + 2.05, 0); sh.lineTo(0, 1.1); sh.closePath(); const gp = new THREE.ExtrudeGeometry(sh, { depth: 1.9, bevelEnabled: false }); add("blanco", gp, F.clone().multiply(TM(0, dh + 1.6, 0))) } }
  // ---- ventanas: por piso, al frente y atrás; en los costados si la casa es exenta; en el frontón si es frontal
  const pisos = []; for (let yy = 0; yy + 2.4 < h; yy += 2.9) pisos.push(yy);
  const vents = [], va = o.mansion ? 1.05 : .92, vh = o.mansion ? 1.6 : 1.1;
  pisos.forEach((yy, pi) => { const vy = yy + (pi === 0 ? 1.0 : .85); const n = Math.max(1, Math.floor((w - .6) / (o.mansion ? 2.1 : 1.8)));
    for (let k = 0; k < n; k++) { const vx = n === 1 ? (pi === 0 ? px + (px > 0 ? -1 : 1) * (dw / 2 + .9) : 0) : lerp(-w / 2 + w / (2 * n), w / 2 - w / (2 * n), k / (n - 1));
      if (pi === 0 && Math.abs(vx - px) < dw / 2 + .65) continue; if (Math.abs(vx) + va / 2 + .25 > w / 2) continue; vents.push([TM(vx, vy, d / 2 + (dos && yy >= hs - .1 ? .1 : 0)), va]);
      if (r() < .75) vents.push([TM(-vx + (r() - .5) * .3, vy, -d / 2 - (dos && yy >= hs - .1 ? .1 : 0), 0, Math.PI, 0), va]) }
    if (o.exenta) for (const s of [-1, 1]) for (let k = 0; k < Math.floor(d / 2.4); k++) vents.push([TM(s * w / 2, vy, lerp(-d / 2 + 1.3, d / 2 - 1.3, Math.floor(d / 2.4) > 1 ? k / (Math.floor(d / 2.4) - 1) : .5), 0, s * Math.PI / 2, 0), va]) });
  if (frontal) vents.push([TM(0, h + .35, d / 2), .7]);
  vents.forEach(([M, an], vi) => { const piso = Math.round((M.elements[13] - .9) / 2.9), frente = M.elements[14] > 0, balcon = !simple && !o.sinBalcon && piso >= 1 && frente && r() < (o.balcones ?? .28);
    if (o.sinPiso0 && piso === 0) return;
    ventanaPiezas(add, M, an, vh, r, col, { simple, blanco: o.mansion, sinPostigo: o.mansion || balcon, vidrio: o.vidrio });
    if (balcon) { const B = M.clone().multiply(TM(0, -.82, 0)), bw = an + 1.1; add("piedraC", RB1(bw, .14, .78, .03), B.clone().multiply(TM(0, 0, .36)));
      for (const s2 of [-1, 1]) for (let q = 0; q < 3; q++) add("piedraC", RB1(.14, .16, .62 - q * .17, .02), B.clone().multiply(TM(s2 * (bw / 2 - .22), -.14 - q * .14, .38 - q * .085)));
      add("hierro", new THREE.BoxGeometry(bw, .04, .04), B.clone().multiply(TM(0, .95, .72))); add("hierro", new THREE.BoxGeometry(bw, .03, .03), B.clone().multiply(TM(0, .14, .72)));
      for (const s2 of [-1, 1]) { add("hierro", new THREE.BoxGeometry(.04, .04, .7), B.clone().multiply(TM(s2 * bw / 2, .95, .37))); add("hierro", new THREE.BoxGeometry(.03, .81, .03), B.clone().multiply(TM(s2 * bw / 2, .55, .72))) }
      for (let xb = -bw / 2 + .12; xb < bw / 2 - .05; xb += .13) add("hierro", new THREE.BoxGeometry(.018, .8, .018), B.clone().multiply(TM(xb, .55, .72)));
      const Wb = HM.clone().multiply(B); for (const s2 of [-1, 1]) if (r() < .8) { const q = new THREE.Vector3(s2 * (bw / 2 - .28), .07, .5).applyMatrix4(Wb); MACETAS_B.push([q.x, q.y, q.z, .9 + r() * .5, r() * 6]) }
      if (r() < .6) { const q = new THREE.Vector3((r() - .5) * .6, .07, .58).applyMatrix4(Wb); VELAS_B.push({ p: q.toArray(), h: .14 + r() * .14, g: 0 }) } }
    // velas en el alféizar (todas las ventanas) y alguna maceta
    const Wm = HM.clone().multiply(M), zs = simple ? .07 : .14, nv = simple ? 1 : 1 + (r() < .45) + (r() < .15);
    for (let q = 0; q < nv; q++) { const p = new THREE.Vector3((q - (nv - 1) / 2) * .2 + (r() - .5) * .06, simple ? 0 : -.01, zs + (r() - .5) * .04).applyMatrix4(Wm); VELAS_B.push({ p: p.toArray(), h: .1 + r() * .16, g: 0 }) }
    if (!simple && !balcon && r() < .22) { const p = new THREE.Vector3((r() < .5 ? -1 : 1) * (an / 2 - .02), -.01, .14).applyMatrix4(Wm); MACETAS_B.push([p.x, p.y, p.z, .7 + r() * .3, r() * 6]) } });
  if (o.puertaAtras && !simple) { const B = TM(-px * .6, 0, -d / 2, 0, Math.PI, 0); add("oscuro", new THREE.PlaneGeometry(dw, dh), B.clone().multiply(TM(0, dh / 2, .01))); add(col, new THREE.BoxGeometry(dw - .04, dh - .03, .06), B.clone().multiply(TM(0, dh / 2, .04))); add("piedraC", RB1(dw + .5, .26, .2, .03), B.clone().multiply(TM(0, dh + .13, .06))); add("piedraC", RB1(dw + .7, .16, .62, .05), B.clone().multiply(TM(0, .02, .3))) }
  // ---- farolito de pared junto a la puerta (algunas casas)
  if (!simple && (o.farol ?? r() < .3)) { const lx = px + (px > 0 ? -1 : 1) * (dw / 2 + .45); add("hierro", new THREE.BoxGeometry(.04, .04, .32), F.clone().multiply(TM(lx, 2.55, .16))); add("hierro", new THREE.CylinderGeometry(.13, .1, .05, 6), F.clone().multiply(TM(lx, 2.66, .34)));
    add("luz", new THREE.CylinderGeometry(.09, .07, .22, 6), F.clone().multiply(TM(lx, 2.52, .34))); add("hierro", new THREE.ConeGeometry(.14, .14, 6), F.clone().multiply(TM(lx, 2.75, .34))) }
  const C = { x, z, ry, w, d, h, y0, HM, px, rh, ye, dos, hs, col, techo, mu, frontal, span, len, ang, chimTop, ctop, chimG, r, seed, F, dw, dh, ridge: h + rh + .15 };
  CASAS_P.push(C); rectAdd({ x, z, ry, w: w + .6, d: d + .6, casa: C }); return C }

// ---------- ayudantes de obra: muro con huecos (puertas/ventanas) y prisma (relleno entre casas)
// muroHuecos: muro de ancho w (x de −w/2 a w/2), alto h (y de 0 a h), espesor t, centrado en z = 0 de M; huecos = [[x0, x1, y0, y1] …]
function muroHuecos(L, key, M, w, h, t, huecos, s = 3.2) { const xs = [-w / 2, w / 2]; huecos.forEach(q => xs.push(q[0], q[1])); xs.sort((a, b) => a - b);
  for (let i = 0; i < xs.length - 1; i++) { const xa = xs[i], xb = xs[i + 1]; if (xb - xa < .005) continue; const xm = (xa + xb) / 2, hs = huecos.filter(q => q[0] < xm && q[1] > xm).map(q => [q[2], q[3]]).sort((a, b) => a[0] - b[0]);
    let y = 0; for (const [ya, yb] of [...hs, [h, h]]) { if (ya - y > .005) L.add(key, uvMuro(new THREE.BoxGeometry(xb - xa, ya - y, t), s, xm / s, (y + ya) / 2 / s), M.clone().multiply(TM(xm, (y + ya) / 2, 0))); y = Math.max(y, yb) } } }
function prisma(P, y0, y1) { let A = 0; for (let i = 0; i < P.length; i++) { const [ax, az] = P[i], [bx, bz] = P[(i + 1) % P.length]; A += ax * bz - bx * az } if (A > 0) P = [...P].reverse();
  const pos = [], n = P.length; for (let i = 0; i < n; i++) { const [ax, az] = P[i], [bx, bz] = P[(i + 1) % n]; pos.push(ax, y0, az, bx, y0, bz, bx, y1, bz, ax, y0, az, bx, y1, bz, ax, y1, az) }
  for (let i = 1; i < n - 1; i++) pos.push(P[0][0], y1, P[0][1], P[i][0], y1, P[i][1], P[i + 1][0], y1, P[i + 1][1]);
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(pos.length / 3 * 2), 2)); g.computeVertexNormals();
  const nr = g.attributes.normal; if (n > 2 && nr.getY(pos.length / 3 - 1) < 0) { const p = g.attributes.position; for (let i = n * 6; i < p.count; i += 3) { for (let c = 0; c < 3; c++) { const t = p.getComponent(i + 1, c); p.setComponent(i + 1, c, p.getComponent(i + 2, c)); p.setComponent(i + 2, c, t) } } g.computeVertexNormals() }
  return g }
const esquinaW = (C, lx, lz) => [C.x + lx * Math.cos(C.ry) + lz * Math.sin(C.ry), C.z - lx * Math.sin(C.ry) + lz * Math.cos(C.ry)];

// ---------- lugares reservados en la fila de la plaza: la tienda (norte), la casa de Nell, la escuela
const A_TIENDA = Math.atan2(TIENDA[1], TIENDA[0]), A_NELL = Math.atan2(CASA_NELL[1], CASA_NELL[0]), A_ESCUELA = -142.5 * Math.PI / 180;
const RESERVA_PLAZA = [[A_TIENDA, .31], [A_NELL, .205], [A_ESCUELA, .215]];
const ryHacia = a => Math.atan2(-Math.cos(a), -Math.sin(a));   // ry de una casa en el ángulo a que mira al centro

// ---------- LAS FILAS DE CASAS: apretadas, de 2 a 4 pisos, todas mirando al centro; los huecos de atrás (por la curva) se rellenan con muro
{ const r = rng(4510);
  FILAS.forEach((F, fi) => { const rm = (F.r0 + F.r1) / 2; let tramos = angLibres(rm, .45);
    if (F.plaza) tramos = tramos.flatMap(([a0, a1]) => { let L = [[a0, a1]]; RESERVA_PLAZA.forEach(([ac, h]) => { L = L.flatMap(([b0, b1]) => { let c = ac; while (c < b0) c += Math.PI * 2; while (c > b1 + Math.PI) c -= Math.PI * 2; return c + h <= b0 || c - h >= b1 ? [[b0, b1]] : [[b0, c - h], [c + h, b1]].filter(([u, v]) => v - u > .01) }) }); return L });
    tramos.forEach(([a0, a1]) => { let a = a0, prev = null, prim = null, ult = null;
      while ((a1 - a) * F.r0 > 2.6) { let w = (F.galpon ? 3.4 : F.plaza ? 5.0 : 4.3) + r() * (F.galpon ? 2 : 2.6); const rest = (a1 - a) * F.r0 - w; if (rest < 3) w += rest; if (w < 2.6) break;
        const am = a + w / 2 / F.r0, retiro = F.plaza ? 0 : r() * .3, d = F.r1 - F.r0 - retiro, rc = F.r0 + retiro + d / 2, cx = Math.cos(am) * rc, cz = Math.sin(am) * rc;
        const enRisco = Math.max(riscoH(cx, cz), riscoH(Math.cos(am) * F.r1, Math.sin(am) * F.r1)) > 1.3;
        if (enRisco) { a += w / F.r0; prev = null; continue }
        const pisos = F.pisos[0] + Math.floor(r() * (F.pisos[1] - F.pisos[0] + 1)), frontal = w < 5.6 && r() < .5, h = F.galpon ? 2.9 + r() * .5 : pisos * 2.9 + .25 + r() * .5;
        const C = casaP(cx, cz, ryHacia(am), w - .05, d, h, 4520 + fi * 1000 + CASAS_P.length * 7, { frontal, pendiente: frontal ? 48 + r() * 8 : 40 + r() * 12, simple: !!F.simple, parches: F.galpon || r() < .2, puertaAtras: F.plaza || r() < .3,
          techo: F.galpon ? (r() < .5 ? "teja" + (r() * 3 | 0) : "piz" + (r() * 3 | 0)) : undefined, balcones: F.plaza ? .45 : .28, farol: F.plaza ? r() < .6 : undefined });
        C.fila = fi; C.am = am;
        // relleno del hueco de atrás con la casa anterior (la curva abre una cuña)
        if (prev) { // la esquina de atrás de cada casa del lado de la otra (probamos los dos lados y nos quedamos con la más cercana)
          const cand = Q => [esquinaW(Q, Q.w / 2, -Q.d / 2), esquinaW(Q, -Q.w / 2, -Q.d / 2)], [pa, pb] = cand(prev), [ca, cb] = cand(C);
          const dist = (u, v) => Math.hypot(u[0] - v[0], u[1] - v[1]), P1 = dist(pa, [C.x, C.z]) < dist(pb, [C.x, C.z]) ? pa : pb, P2 = dist(ca, [prev.x, prev.z]) < dist(cb, [prev.x, prev.z]) ? ca : cb;
          const fa = [esquinaW(prev, prev.w / 2, prev.d / 2), esquinaW(prev, -prev.w / 2, prev.d / 2)], fb = [esquinaW(C, C.w / 2, C.d / 2), esquinaW(C, -C.w / 2, C.d / 2)];
          const F1 = dist(fa[0], [C.x, C.z]) < dist(fa[1], [C.x, C.z]) ? fa[0] : fa[1], F2 = dist(fb[0], [prev.x, prev.z]) < dist(fb[1], [prev.x, prev.z]) ? fb[0] : fb[1], FM = [(F1[0] + F2[0]) / 2, (F1[1] + F2[1]) / 2];
          if (dist(P1, P2) > .08) { const y0 = Math.min(prev.y0, C.y0), y1 = y0 + Math.min(prev.h, C.h) - .2; (F.simple ? L_LEJOS : L_CASA).add(prev.mu.startsWith("rev") ? "muro0" : prev.mu, uvMuro(prisma([FM, P1, P2], y0, y1), 3.2)) } }
        if (!prim) prim = C; ult = C; prev = C; a += w / F.r0 + (r() < .08 && !F.plaza ? (prev = null, 1.3 / F.r0) : 0) }
      // las puntas del tramo: del costado de la primera y la última casa hasta el borde de la calle radial (la fila llega a la línea de la calle)
      for (const [C, ab, sg] of [[prim, a0, -1], [ult, a1, 1]]) { if (!C) continue; const cs = [[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([sx, sz]) => esquinaW(C, sx * C.w / 2, sz * C.d / 2)), lado = cs.filter(p => Math.sign(angD(Math.atan2(p[1], p[0]), C.am)) === sg);
        if (lado.length !== 2) continue; const [Fr, Bk] = Math.hypot(...lado[0]) < Math.hypot(...lado[1]) ? lado : [lado[1], lado[0]], E0 = [Math.cos(ab) * F.r0, Math.sin(ab) * F.r0], E1 = [Math.cos(ab) * (F.r1 - .05), Math.sin(ab) * (F.r1 - .05)];
        if (Math.hypot(E1[0] - Bk[0], E1[1] - Bk[1]) < .2 || Math.max(riscoH(...E1), riscoH(...E0)) > 1.3) continue; (F.simple ? L_LEJOS : L_CASA).add(C.mu.startsWith("rev") ? "muro0" : C.mu, uvMuro(prisma([E0, E1, Bk, Fr], C.y0, C.y0 + C.h - .2), 3.2)) } }) }) }

// ---------- LA ESCUELA_B (fila de la plaza, al oeste): casa baja y ancha con un soportal; bajo el soportal, el pizarrón con labios dibujados
const ESCUELA_B = (() => { const rc = 15.6 + 3.6, x = Math.cos(A_ESCUELA) * rc, z = Math.sin(A_ESCUELA) * rc, ry = ryHacia(A_ESCUELA);
  const C = casaP(x, z, ry, 6.4, 7.2, 6.3, 4588, { muro: "muro3", techo: "teja1", color: 3, frontal: false, puertaX: 2.1, farol: false, balcones: 0, pendiente: 38, sinPiso0: true });
  const M = C.HM, at = (...a) => M.clone().multiply(TM(...a)), fz = C.d / 2;
  // soportal: cuatro postes de madera, viga y techito de tejas
  for (const xx of [-3, -1, 1, 3]) { L_CASA.add("piedraC", RB1(.34, .3, .34, .04), at(xx, .15, fz + 1.75)); L_CASA.add("viga", new THREE.BoxGeometry(.2, 2.75, .2), at(xx, 1.6, fz + 1.75)); L_CASA.add("viga", new THREE.BoxGeometry(.12, .7, .12), at(xx + .25, 2.75, fz + 1.5, .78, 0, 0)) }
  L_CASA.add("viga", new THREE.BoxGeometry(6.8, .24, .24), at(0, 3.0, fz + 1.75)); L_CASA.add("teja1", geoUV(new THREE.BoxGeometry(7.2, .12, 2.3), q => q / 3.4, (a, b, c) => c / 3.4), at(0, 3.32, fz + 1.05, .3, 0, 0));
  for (let k = 0; k < 7; k++) L_CASA.add("viga", new THREE.BoxGeometry(.1, .12, 2.1), at(-3.3 + k * 1.1, 3.15, fz + 1, .3, 0, 0));
  L_CASA.add("piedraC", RB1(7, .14, 2, .03), at(0, .07, fz + 1));
  C.pizarra = at(-1.2, 0, fz + .02); C.soportal = new THREE.Vector3(0, 0, fz + 1.2).applyMatrix4(M); rectAdd({ x: C.soportal.x, z: C.soportal.z, ry: C.ry, w: 7.2, d: 2.4, soportal: 1 }); return C })();

// ---------- LA CASA DE NELL (en la fila de la plaza, al sudeste): la planta baja es un cuarto de verdad con la ventana grande a la plaza,
// la mesa con velas debajo de la ventana; la puerta al lado. CASA_NELL_V = { ventana, mesa, puerta } en coordenadas de mundo
const CASA_NELL_B = (() => { const am = A_NELL, rc = 15.6 + 4.4, x = Math.cos(am) * rc, z = Math.sin(am) * rc, ry = ryHacia(am), w = 6.0, d = 8.8;
  const C = casaP(x, z, ry, w, d, 6.1, 4590, { muro: "lad1", techo: "teja0", color: 1, frontal: true, pendiente: 50, sinPuerta: true, sinPiso0: true, hueco: 3.0, farol: false, balcones: 0 });
  const M = C.HM, at = (...a) => M.clone().multiply(TM(...a)), fz = d / 2, L = L_CASA, H = 3.0, t = .3;
  const VEN = [-2.25, -.35, .95, 2.35], PUE = [.75, 1.8, .26, 2.35];
  muroHuecos(L, "lad1", at(0, 0, fz - t / 2), w, H, t, [VEN, PUE]);                                  // frente
  for (const s of [-1, 1]) L.add("lad1", uvMuro(new THREE.BoxGeometry(t, H, d - 2 * t), 3.2), at(s * (w / 2 - t / 2), H / 2, 0));   // costados
  L.add("lad1", uvMuro(new THREE.BoxGeometry(w, H, t), 3.2), at(0, H / 2, -fz + t / 2));                                           // atrás
  muroHuecos(L, "lad1", at(0, 0, fz - 4.4), w - 2 * t, H, .16, [[-.5, .5, .26, 2.2]]);                                              // tabique del cuarto
  L.add("madera", new THREE.BoxGeometry(w - .5, .1, d - .5), at(0, .27, 0)); L.add("viga", new THREE.BoxGeometry(w - .4, .14, d - .4), at(0, H - .07, 0));
  for (let k = 0; k < 4; k++) L.add("viga", new THREE.BoxGeometry(w - .5, .16, .16), at(0, H - .2, fz - .9 - k * 1.1));
  // papel de pared adentro del cuarto y zócalo de madera
  for (const s of [-1, 1]) { L.add("papel", new THREE.BoxGeometry(.02, H - .5, 4.0), at(s * (w / 2 - t - .015), .3 + (H - .5) / 2, fz - 2.3)); L.add("madera", new THREE.BoxGeometry(.04, .2, 4.0), at(s * (w / 2 - t - .03), .4, fz - 2.3)) }
  L.add("papel", new THREE.BoxGeometry(w - 2 * t - .02, H - .5, .02), at(0, .3 + (H - .5) / 2, fz - 4.3));
  // la ventana grande (vidrio claro, marco blanco, parteluces) y la puerta
  const [vx0, vx1, vy0, vy1] = VEN, vw = vx1 - vx0, vh = vy1 - vy0, vc = (vx0 + vx1) / 2;
  L.add("vidrioC", new THREE.PlaneGeometry(vw, vh), at(vc, vy0 + vh / 2, fz - .1));
  for (const xx of [vx0, vc - vw / 6, vc + vw / 6, vx1]) L.add("blanco", new THREE.BoxGeometry(.07, vh, .1), at(xx, vy0 + vh / 2, fz - .1)); for (const yy of [vy0, vy0 + vh / 2, vy1]) L.add("blanco", new THREE.BoxGeometry(vw + .07, .07, .1), at(vc, yy, fz - .1));
  L.add("piedraC", RB1(vw + .4, .1, .36, .03), at(vc, vy0 - .05, fz + .1)); L.add("piedraC", RB1(vw + .44, .2, .16, .03), at(vc, vy1 + .14, fz + .04));
  L.add("oscuro", new THREE.PlaneGeometry(1.05, 2.09), at(1.275, .26 + 1.045, fz - .2)); L.add("col1", new THREE.BoxGeometry(1.0, 2.05, .06), at(1.275, .26 + 1.03, fz - .12)); L.add("hierro", new THREE.TorusGeometry(.07, .015, 6, 12), at(.95, 1.3, fz - .06));
  L.add("piedraC", RB1(1.6, .16, .62, .05), at(1.275, .02, fz + .3)); L.add("piedraC", RB1(1.5, .26, .2, .03), at(1.275, 2.48, fz + .04));
  // cortinas (tela floreada) recogidas a los lados de la ventana, por dentro
  for (const s of [-1, 1]) L.add("cortina", new THREE.BoxGeometry(.32, vh + .3, .06), at(vc + s * (vw / 2 - .05), vy0 + vh / 2 + .1, fz - .45));
  return { C, M, at, fz, vc, VEN } })();

// ---------- LA TIENDA DE MISTER SALLOW (al norte de la plaza, bajo el centro de la campana): angosta, alta, ennegrecida y torcida.
// Planta baja: el local (vidriera llena de frascos, mostrador, estantes de tapones) y atrás la TRASTIENDA (8,6 × 6,3 × 4,6 m, navegable):
// ollas de cera hirviendo bajo una campana de humo, mesas largas, moldes, el escritorio con el cajón abierto (el libro y los tapones agujereados).
// Coordenadas locales: origen en el medio del frente, al piso; +z hacia la plaza (sur). El frente está en z = −16,5 del mundo.
const L_TIENDA = lote();
const TI = (() => { const z0 = -16.5, y0 = SUELO(TIENDA[0], z0), MT = TM(TIENDA[0], y0, z0), at = (...a) => MT.clone().multiply(TM(...a)), L = L_TIENDA, W = (x, y, z) => new THREE.Vector3(x, y, z).applyMatrix4(MT).toArray();
  const ZB = -10.5, HT = 4.6, HS = 3.6;   // fondo de la trastienda, alto de la trastienda y del local
  // frente del local: vidriera grande a la izquierda, puerta a la derecha
  const VID = [-2.3, .6, .75, 2.75], PUE = [1.0, 2.1, .22, 2.5];
  muroHuecos(L, "hollin", at(0, 0, -.15), 5.6, HS, .3, [VID, PUE]);
  for (const s of [-1, 1]) L.add("hollin", uvMuro(new THREE.BoxGeometry(.3, HS, 3.45), 3.2), at(s * 2.65, HS / 2, -1.875));
  // tabique local/trastienda (puerta al medio) y la trastienda
  muroHuecos(L, "hollin", at(0, 0, -3.75), 9.2, HT, .3, [[-.6, .6, .22, 2.4]]);
  L.add("hollin", uvMuro(new THREE.BoxGeometry(9.2, HT, .3), 3.2), at(0, HT / 2, ZB + .15));
  muroHuecos(L, "hollin", at(-4.45, 0, (ZB - 3.6) / 2, 0, Math.PI / 2, 0), -ZB - 3.6 - .6, HT, .3, [[-.2, .8, 2.9, 3.8]]);   // costado oeste con ventanita alta
  L.add("hollin", uvMuro(new THREE.BoxGeometry(.3, HT, -ZB - 3.6 - .6), 3.2), at(4.45, HT / 2, (ZB - 3.6) / 2));
  // pisos de tablas oscuras, cielorrasos y vigas
  L.add("maderaN", new THREE.BoxGeometry(5.0, .2, 3.3), at(0, .1, -1.9)); L.add("maderaN", new THREE.BoxGeometry(8.7, .2, -ZB - 4.1), at(0, .1, (ZB - 3.6) / 2 - .1));
  L.add("maderaN", new THREE.BoxGeometry(5.1, .22, 3.4), at(0, HS + .11, -1.9)); L.add("maderaN", new THREE.BoxGeometry(9.2, .22, -ZB - 3.3), at(0, HT + .11, (ZB - 3.6) / 2));
  for (let k = 0; k < 6; k++) L.add("viga", new THREE.BoxGeometry(8.7, .24, .22), at(0, HT - .14, -4.5 - k * 1.1));
  for (let k = 0; k < 3; k++) L.add("viga", new THREE.BoxGeometry(5.0, .2, .2), at(0, HS - .12, -.7 - k * 1.1));
  // techo de pizarra de la trastienda (a un agua, hacia atrás) con alero
  { const g = new THREE.BoxGeometry(10.0, .16, -ZB - 2.6); geoUV(g, q => q / 4.4, (a, b, c) => -c / 4.4); L.add("piz1", g, at(0, HT + .5, (ZB - 3.6) / 2 - .3, -.13, 0, 0)) }
  L.add("hollin", uvMuro(new THREE.BoxGeometry(9.2, .9, .3), 3.2), at(0, HT + .45, -3.75));
  for (const s of [-1, 1]) { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(-ZB - 3.6, 0); sh.lineTo(0, .9); sh.closePath(); const g = new THREE.ExtrudeGeometry(sh, { depth: .3, bevelEnabled: false }); g.rotateY(Math.PI / 2); L.add("hollin", uvMuro(g, 3.2), at(s * 4.45 - .15, HT, -3.6)) }
  // los pisos de arriba (torcidos: se inclinan hacia la plaza y hacia el este) con casaP
  const MU = MT.clone().multiply(TM(0, HS + .22, -1.95)).multiply(TM(0, 0, 0, -.035, .04, .045));
  const C = casaP(TIENDA[0], z0 - 1.95, 0, 5.6, 3.9, 9.4, 4599, { HM: MU, frontal: true, pendiente: 62, muro: "hollin", techo: "piz1", sinPuerta: true, sinZocalo: true, vidrio: "vidrio", sinBalcon: true, chimX: 1, farol: false, sinEsquinas: true, color: 4 });
  // la vidriera: vidrio claro, marco de madera negra en paños, zócalo; adentro, gradas con frascos (los recuerdos) y tapones en platitos
  const [vx0, vx1, vy0, vy1] = VID, vw = vx1 - vx0, vh = vy1 - vy0, vc = (vx0 + vx1) / 2;
  L.add("vidrioC", new THREE.PlaneGeometry(vw, vh), at(vc, vy0 + vh / 2, -.12));
  for (const xx of [vx0, vc - vw / 6, vc + vw / 6, vx1]) L.add("maderaN", new THREE.BoxGeometry(.08, vh, .12), at(xx, vy0 + vh / 2, -.1)); for (const yy of [vy0, vy0 + vh * .62, vy1]) L.add("maderaN", new THREE.BoxGeometry(vw + .08, .08, .12), at(vc, yy, -.1));
  L.add("maderaN", new THREE.BoxGeometry(vw + .5, .14, .34), at(vc, vy0 - .07, .05)); L.add("maderaN", new THREE.BoxGeometry(vw + .6, .34, .18), at(vc, vy1 + .2, .02));
  for (let k = 0; k < 3; k++) L.add("maderaN", new THREE.BoxGeometry(vw - .1, .05, .32 - k * .02), at(vc, vy0 + .05 + k * .52, -.45 - k * .12));
  // puerta: hoja de madera negra con ventanita, campanita de la tienda arriba, escalón gastado
  L.add("oscuro", new THREE.PlaneGeometry(1.1, 2.28), at(1.55, .22 + 1.14, -.25)); L.add("maderaN", new THREE.BoxGeometry(1.04, 2.24, .07), at(1.55, .22 + 1.12, -.2));
  L.add("vidrio", new THREE.PlaneGeometry(.5, .5), at(1.55, 1.75, -.16)); for (const yy of [.6, 1.25]) L.add("maderaN", new THREE.BoxGeometry(.8, .1, .04), at(1.55, yy, -.15));
  L.add("hierro", new THREE.TorusGeometry(.08, .016, 6, 12), at(1.22, 1.25, -.14)); L.add("piedraC", RB1(1.5, .18, .7, .06), at(1.55, .05, .3));
  L.add("hierro", new THREE.BoxGeometry(.03, .03, .35), at(1.55, 2.6, -.0)); L.add("laton", new THREE.LatheGeometry([[0, .12], [.05, .12], [.08, .06], [.1, -.02], [.12, -.05], [0, -.05]].map(q => new THREE.Vector2(q[0], q[1])), 12), at(1.55, 2.5, .17));
  // el cartel colgante «SALLOW · WAX»: ménsula de hierro con volutas, dos cadenitas, tabla vieja
  L.add("hierro", new THREE.BoxGeometry(.05, .05, 1.4), at(-2.55, 4.3, .7)); L.add("hierro", new THREE.TorusGeometry(.22, .02, 5, 14, Math.PI * 1.5), at(-2.55, 4.05, .3, 0, Math.PI / 2, 0)); { const [g, m] = cilEntre([-2.55, 3.7, 0], [-2.55, 4.28, 1.0], .02, 5); L.add("hierro", g, MT.clone().multiply(m)) }
  for (const zz of [.95, 1.25]) { for (let k = 0; k < 5; k++) L.add("hierro", new THREE.TorusGeometry(.03, .006, 4, 8), at(-2.55, 4.24 - k * .055, zz, 0, k % 2 ? Math.PI / 2 : 0, 0)) }
  const CARTEL = at(-2.55, 3.62, 1.1, 0, Math.PI / 2, .05);
  // la vela del cartel y velas derretidas en el alféizar de la vidriera y en el escalón (grupo 1: se inclinan hacia Sallow)
  const vel = (x, y, z, h = .2) => VELAS_B.push({ p: W(x, y, z), h, g: 1 });
  for (let k = 0; k < 9; k++) vel(vx0 + .15 + k * (vw - .3) / 8 + (hash2(k, 3) - .5) * .08, vy0, .12 + (hash2(k, 5) - .5) * .06, .06 + hash2(k, 9) * .2);
  for (let k = 0; k < 7; k++) vel(.85 + (k % 2) * 1.35 + (hash2(k, 1) - .5) * .2, .14, .45 + (hash2(k, 2) - .5) * .3, .08 + hash2(k, 4) * .22);
  // puntos útiles (mundo)
  const P = { puerta: W(1.55, 0, .9), vidriera: W(vc, 1.6, .9), local: W(0, .3, -1.9), interior: W(0, .3, -7), olla: W(-1.3, 1.6, ZB + 1.0), cajon: W(-3.55, .78, -5.0), libro: W(-3.5, .84, -5.0), mesa: W(-.8, .95, -6.3), frascos: W(4.05, 1.7, -7.2), cartel: CARTEL.clone().multiply(TM(0, 0, 0)).elements.slice(12, 15) };
  rectAdd({ x: TIENDA[0], z: z0 - 1.8, ry: 0, w: 6.0, d: 3.9, tienda: 1, hueco: 1 }); rectAdd({ x: TIENDA[0], z: (z0 - 3.6 + z0 + ZB) / 2, ry: 0, w: 9.6, d: -ZB - 3.3, tienda: 1, hueco: 1 });
  return { MT, at, W, ZB, HT, HS, VID, P, C, CARTEL, vel } })();

// ---------- LA FUENTE de la plaza: pileta octogonal de piedra tallada (Ø 9,2 m) con escalón, borde moldurado; en el frente y en el fondo la
// inscripción tallada en relieve hundido «PLUG YOUR EARS.» / «REMEMBER.» (geometría de verdad, no solo textura); fuste central con una
// taza alta y arriba una estatua de piedra: una mujer que se tapa los oídos. Agua con chorros desde la taza.
const FUENTE = (() => { const R = 4.6, ap = R * Math.cos(Math.PI / 8), lado = 2 * R * Math.sin(Math.PI / 8), HB = 1.0, L = L_PIEDRA, G = new THREE.Group(); scene.add(G);
  const oct = (rr, h, y, key = "fuente") => { const g = new THREE.CylinderGeometry(rr, rr, h, 8); g.rotateY(Math.PI / 8); L.add(key, uvMuro(g, 2.4), TM(0, y + h / 2, 0)) };
  oct(5.3, .22, -.05, "corona"); oct(5.0, .18, .17, "corona");                          // escalones
  // pared de la pileta: anillo octogonal con espesor .45
  { const sh = new THREE.Shape(), ho = new THREE.Path(); for (let k = 0; k <= 8; k++) { const a = k / 8 * Math.PI * 2 + Math.PI / 8, a2 = a; (k ? sh.lineTo.bind(sh) : sh.moveTo.bind(sh))(Math.cos(a) * R, Math.sin(a) * R); (k ? ho.lineTo.bind(ho) : ho.moveTo.bind(ho))(Math.cos(a2) * (R - .5), Math.sin(a2) * (R - .5)) } sh.holes.push(ho);
    const g = new THREE.ExtrudeGeometry(sh, { depth: HB, bevelEnabled: false }); g.rotateX(-Math.PI / 2); L.add("fuente", uvMuro(g, 2.4), TM(0, .3, 0)) }
  // molduras: borde de arriba que sobresale y bocel abajo (anillos octogonales)
  for (const [rr, h, y] of [[R + .14, .16, .3 + HB - .02], [R + .05, .06, .3 + HB - .1], [R + .08, .12, .3]]) { const sh = new THREE.Shape(), ho = new THREE.Path(); for (let k = 0; k <= 8; k++) { const a = k / 8 * Math.PI * 2 + Math.PI / 8; (k ? sh.lineTo.bind(sh) : sh.moveTo.bind(sh))(Math.cos(a) * rr, Math.sin(a) * rr); (k ? ho.lineTo.bind(ho) : ho.moveTo.bind(ho))(Math.cos(a) * (R - .56), Math.sin(a) * (R - .56)) } sh.holes.push(ho);
    const g = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: true, bevelThickness: .03, bevelSize: .03, bevelSegments: 2 }); g.rotateX(-Math.PI / 2); L.add("corona", uvMuro(g, 2.4), TM(0, y, 0)) }
  // pilastras en las esquinas del octógono
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + Math.PI / 8; L.add("corona", RB1(.36, HB - .1, .36, .04), TM(Math.cos(a) * (R + .06), .3 + HB / 2, Math.sin(a) * (R + .06), 0, -a, 0)) }
  // las inscripciones: placa con relieve hundido (malla desplazada por la máscara de las letras), en la cara sur (+z) y la norte (−z)
  const T_INSC = (() => { const c = mk(2048, 560), g = c.getContext("2d"); g.fillStyle = "#000"; g.fillRect(0, 0, 2048, 560); g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = "bold 190px Georgia, 'Times New Roman', serif"; g.fillText("PLUG YOUR EARS.", 1024, 158, 1960); g.font = "bold 200px Georgia, 'Times New Roman', serif"; g.fillText("REMEMBER.", 1024, 400, 1900);
    g.strokeStyle = "#fff"; g.lineWidth = 7; g.strokeRect(22, 18, 2004, 524); return g.getImageData(0, 0, 2048, 560).data })();
  const muestra = (u, v) => { const X = Math.min(2047, Math.max(0, u * 2047)), Y = Math.min(559, Math.max(0, (1 - v) * 559)), x0 = X | 0, y0 = Y | 0, fx = X - x0, fy = Y - y0, at_ = (x, y) => T_INSC[(Math.min(559, y) * 2048 + Math.min(2047, x)) * 4] / 255;
    return lerp(lerp(at_(x0, y0), at_(x0 + 1, y0), fx), lerp(at_(x0, y0 + 1), at_(x0 + 1, y0 + 1), fx), fy) };
  const placa = (() => { const PW = lado - .5, PH = .76, NX = 420, NY = 110, pos = [], uv = [], col = [], idx = [];
    for (let j = 0; j <= NY; j++) for (let i = 0; i <= NX; i++) { const u = i / NX, v = j / NY, m = sst(.25, .75, muestra(u, v)), x = (u - .5) * PW, y = (v - .5) * PH; pos.push(x, y, -.04 * m); uv.push(u * PW / 2.4, v * PH / 2.4); const k = 1 - .8 * m; col.push(k, k * .97, k * .92) }
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) { const a = j * (NX + 1) + i, b = a + NX + 1; idx.push(a, a + 1, b, b, a + 1, b + 1) }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals(); return g })();
  const M_INSC = new THREE.MeshStandardMaterial({ map: T_ROCA.c, bumpMap: T_ROCA.z, bumpScale: 2, roughness: .9, vertexColors: true, color: "#d2c8b2" });
  for (const a of [Math.PI / 2, -Math.PI / 2]) { const m = new THREE.Mesh(placa, M_INSC); m.position.set(Math.cos(a) * (ap + .035), .3 + HB / 2 + .02, Math.sin(a) * (ap + .035)); m.rotation.y = Math.atan2(Math.cos(a), Math.sin(a)); m.castShadow = false; m.receiveShadow = true; G.add(m) }
  // adentro: fuste, taza alta, estatua
  oct(.95, 2.0, .3, "fuente"); oct(1.15, .2, .3, "corona"); oct(1.1, .16, 2.18, "corona");
  { const g = new THREE.LatheGeometry([[0, 0], [.7, .02], [1.6, .22], [2.05, .42], [2.1, .58], [1.95, .6], [1.5, .46], [0, .44]].map(q => new THREE.Vector2(q[0], q[1])), 32); L.add("fuente", g, TM(0, 2.3, 0)) }
  { const g = new THREE.LatheGeometry([[0, 0], [.55, 0], [.62, .1], [.42, .3], [.38, .55], [.5, .7], [.52, .8], [0, .8]].map(q => new THREE.Vector2(q[0], q[1])), 16); L.add("corona", g, TM(0, 2.74, 0)) }
  // la estatua (1,9 m): túnica larga, la cabeza un poco gacha, las dos manos tapando las orejas, los codos para afuera
  { const B = TM(0, 3.54, 0, 0, 0, 0), at = (...a) => B.clone().multiply(TM(...a)), K = "estatua";
    L.add(K, new THREE.CylinderGeometry(.28, .5, 1.15, 12), at(0, .58, 0)); L.add(K, new THREE.CylinderGeometry(.3, .3, .5, 12), at(0, 1.38, 0, 0, 0, 0, 1, 1, .78)); L.add(K, new THREE.SphereGeometry(.31, 12, 8), at(0, 1.6, 0, 0, 0, 0, 1.05, .7, .8));
    L.add(K, new THREE.CylinderGeometry(.08, .1, .14, 8), at(0, 1.72, 0)); L.add(K, RB(.36, .4, .38, .1, 2), at(0, 1.96, .02, .25, 0, 0));
    L.add(K, new THREE.SphereGeometry(.2, 10, 8), at(0, 2.02, -.08, 0, 0, 0, 1.05, 1.1, 1.1));   // pelo atado
    for (const s of [-1, 1]) { const hom = [s * .32, 1.62, 0], codo = [s * .55, 1.74, .12], mano = [s * .2, 1.98, .04]; for (const [a, b] of [[hom, codo], [codo, mano]]) { const [g, m] = cilEntre(a, b, .075, 8, .065); L.add(K, g, B.clone().multiply(m)) }
      L.add(K, RB(.08, .2, .16, .04, 2), at(s * .2, 1.97, .03, 0, 0, s * .15)); L.add(K, new THREE.SphereGeometry(.08, 8, 6), at(s * .55, 1.74, .12)) }
    for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2; L.add(K, new THREE.CylinderGeometry(.04, .07, 1.0, 5), at(Math.cos(a) * .4, .55, Math.sin(a) * .4, 0, 0, -Math.cos(a) * .12)) } }
  // agua: pileta grande y taza (planos con brillo), chorros que caen de la taza
  const M_AGUA_F = new THREE.MeshStandardMaterial({ color: "#2e4a4a", roughness: .06, metalness: .4, envMap: ENV_METAL_P, envMapIntensity: .9, transparent: true, opacity: .9 });
  { const g = new THREE.CircleGeometry(R - .5, 8); g.rotateX(-Math.PI / 2); g.rotateY(Math.PI / 8); const m = new THREE.Mesh(g, M_AGUA_F); m.position.y = .3 + HB - .22; m.receiveShadow = true; G.add(m) }
  { const g = new THREE.CircleGeometry(1.92, 32); g.rotateX(-Math.PI / 2); const m = new THREE.Mesh(g, M_AGUA_F); m.position.y = 2.3 + .55; G.add(m) }
  const M_CHORRO = new THREE.MeshStandardMaterial({ color: "#a8c8c8", roughness: .1, metalness: .2, transparent: true, opacity: .55, envMap: ENV_METAL_P, envMapIntensity: 1, depthWrite: false });
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + .2, P = [[Math.cos(a) * 2.08, 2.86, Math.sin(a) * 2.08], [Math.cos(a) * 2.35, 2.5, Math.sin(a) * 2.35], [Math.cos(a) * 2.5, 1.9, Math.sin(a) * 2.5], [Math.cos(a) * 2.55, 1.06, Math.sin(a) * 2.55]];
    const m = new THREE.Mesh(tubo(P, .045, .07, 6, 12), M_CHORRO); G.add(m) }
  // velas alrededor: en el borde de la pileta y en los escalones (grupo 2)
  { const r = rng(4470); for (let k = 0; k < 64; k++) { const a = r() * Math.PI * 2, rr = r() < .55 ? R + (r() - .5) * .3 : 5.1 + r() * .15, y = rr > 4.95 ? .35 : .3 + HB + .14; if (Math.abs(Math.cos(a) * rr) < 2.1) continue;
    VELAS_B.push({ p: [Math.cos(a) * rr, y, Math.sin(a) * rr], h: .08 + r() * .3, g: 2, gorda: r() < .4 }) } }
  rectAdd({ x: 0, z: 0, ry: 0, w: 10.6, d: 10.6, fuente: 1 });
  return { G, R, M_AGUA_F } })();

// ---------- se cierran los lotes de casas y de piedra
CASA_MATS.papel = M_PAPEL; CASA_MATS.cortina = M_CORTINA;
const CASAS_M = L_CASA.fin(scene, CASA_MATS); ["oscuro", "vidrio", "ventana", "vidrioC", "luz"].forEach(k => { if (CASAS_M[k]) CASAS_M[k].castShadow = false });
const CASAS_LEJOS_M = L_LEJOS.fin(scene, CASA_MATS); ["oscuro", "ventana"].forEach(k => { if (CASAS_LEJOS_M[k]) CASAS_LEJOS_M[k].castShadow = false });
const M_FUENTE = new THREE.MeshStandardMaterial({ map: T_SILLAR[0], bumpMap: T_SILLAR[1], bumpScale: 3, roughness: .85, color: "#e0d6c2" });
const M_ESTATUA = new THREE.MeshStandardMaterial({ map: T_ROCA.c, bumpMap: T_ROCA.z, bumpScale: 2.5, roughness: .8, color: "#c8c0b0" });
const PIEDRA_M = L_PIEDRA.fin(scene, { rocaT: M_ROCA_G, muroT: M_MURO_T, corona: M_CORONA, escalon: M_ESCALON, fuente: M_FUENTE, estatua: M_ESTATUA });
// piedras de coronamiento del parapeto (instanciadas, cada una un poco distinta)
{ const m = new THREE.InstancedMesh(RB(1, 1, 1, .05, 1), M_CORONA, CORONAS.length), cc = new THREE.Color(); CORONAS.forEach(([x, y, z, ry, la], i) => { dummy.position.set(x, y + .02 + (hash2(i, 1) - .5) * .02, z); dummy.rotation.set(0, ry, (hash2(i, 2) - .5) * .02); dummy.scale.set(.58, .16, la); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); const v = .82 + hash2(i, 3) * .26; m.setColorAt(i, cc.setRGB(v, v * .98, v * .94)) }); m.castShadow = true; m.receiveShadow = true; scene.add(m) }

// ================= LA CAMPANA DE UNDERBELL: el bronce gigante, su corona, las cuatro cadenas, el interior (plataforma de Sallow, gancho roto, rayo de luna, polvo, cera) y la SOMBRA =================
// Medidas de _comun_campana.js (CAMPANA_C, CAMPANA_Y, CAMPANA_R, CAMPANA_H, CORONA, MONTES, RISCO_E). Norte = −z; ángulos en planta: x = cos a, z = sin a (a = 0 → este).
// El cuerpo de la campana mide HB (134,2 m) del labio a la tapa de arriba; encima la corona (dos argollas cruzadas) llega a CORONA (y = 300), donde se enganchan las cadenas.
// La SOMBRA es analítica: se parchea el shader de luces de three (ShaderChunk) para que TODA luz direccional (el sol / la luna) quede tapada por la campana y por las
// cadenas, en cualquier material, a cualquier distancia (no depende de la caja de sombras del sol, que la ciudad usa para lo chico). Va siempre prendida.
// Al final: API (cadenaPunto, cadenaTangente, cadenaMarco, PRIMER_ESLABON, interior, zumbido, ceraEnLabio, golpe, sombraCampana) y los stubs del video viejo.
const CBX = (() => {
  const G = new THREE.Group(); G.name = "CAMPANA"; scene.add(G);
  const CX = CAMPANA_C[0], CZ = CAMPANA_C[1], Y0 = CAMPANA_Y, HB = 134.2, TAU = Math.PI * 2;
  const sst = (a, b, v) => { const q = cl((v - a) / (b - a)); return q * q * (3 - 2 * q) };
  const hsh = (i, j) => { let n = (Math.imul(i | 0, 374761393) + Math.imul(j | 0, 668265263)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296 };
  const rd = (x, z) => { const i = Math.floor(x), j = Math.floor(z), u = x - i, v = z - j, a = u * u * (3 - 2 * u), b = v * v * (3 - 2 * v); return lerp(lerp(hsh(i, j), hsh(i + 1, j), a), lerp(hsh(i, j + 1), hsh(i + 1, j + 1), a), b) };
  const fbm = (x, z, o = 4) => { let s = 0, a = .5, f = 1, n = 0; for (let k = 0; k < o; k++) { s += a * rd(x * f + k * 17.3, z * f - k * 9.1); n += a; a *= .5; f *= 2.03 } return s / n };
  const TMx = (x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, "YXZ")), new THREE.Vector3(sx, sy, sz));
  const polar = (r, h, a) => [CX + r * Math.cos(a), Y0 + h, CZ + r * Math.sin(a)];
  const G_ = v => { const q = Math.round(cl(v) * 255); return `rgb(${q},${q},${q})` };
  const mergeGeo = list => { let n = 0; const qs = list.map(([g, m]) => { const q = g.index ? g.toNonIndexed() : g.clone(); if (m) q.applyMatrix4(m); if (!q.attributes.uv) q.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(q.attributes.position.count * 2), 2)); if (!q.attributes.normal) q.computeVertexNormals(); n += q.attributes.position.count; return q }), hayC = qs.some(q => q.attributes.color);
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2), co = hayC ? new Float32Array(n * 3).fill(1) : null; let o = 0;
    qs.forEach(q => { const k = q.attributes.position.count; pos.set(q.attributes.position.array, o * 3); nor.set(q.attributes.normal.array, o * 3); uv.set(q.attributes.uv.array, o * 2); if (co && q.attributes.color) co.set(q.attributes.color.array, o * 3); o += k });
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); g.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); if (co) g.setAttribute("color", new THREE.BufferAttribute(co, 3)); g.computeBoundingSphere(); return g };
  const lote = () => { const B = new Map(); return { add(mat, g, m) { (B.get(mat) || B.set(mat, []).get(mat)).push([g, m]) }, fin(par) { const out = []; for (const [mat, L] of B) { const me = new THREE.Mesh(mergeGeo(L), mat); par.add(me); out.push(me) } return out } } };
  const A_CAD_E = Math.atan2(RISCO_E[1] - CZ, RISCO_E[0] - CX);   // hacia el risco: por ahí baja la cadena del este
  const A_ENT = A_CAD_E + .075;                                    // la GRIETA de entrada (al lado de la cadena) y la plataforma de adentro
  const HUECO = [CX - 14, CZ], R_HUECO = 3.4;                      // el agujero de la tapa de arriba (al oeste de la corona) por donde entra la luna
  const GRIETA = { hc: 11.5, hw: 1.75, hh: 3.7 };                  // la grieta: centro a 11,5 m del labio, 3,5 × 7,4 m, bordes dentados
  const jag = a => 1 + .16 * Math.sin(3 * a + 1.3) + .1 * Math.sin(7 * a + .4) + .06 * Math.sin(13 * a + 2.1);

  // ======================= PERFIL (r, h) =======================
  // afuera: empieza adentro del labio por abajo (cara de abajo del labio), sube por el arco sonoro, la cintura, el hombro y la tapa hasta el agujero del centro
  const PEXT = [[85.6, 0], [86.4, -.3], [88, -.5], [91, -.45], [93.2, 0], [94.6, .5], [95.6, 1.8], [95.9, 3.2], [95.4, 4.6], [94.3, 6.2], [93.4, 8], [92.2, 11], [90.2, 15], [87.5, 20], [84.2, 26], [80.6, 33], [77.2, 41], [74.3, 50], [71.9, 60], [70, 70],
    [68.4, 80], [67.1, 90], [66, 99], [64.9, 106], [63.4, 112], [61, 117.5], [57.6, 122.5], [52.8, 126.6], [46.4, 129.8], [38.5, 132], [29, 133.3], [18, 134], [8, 134.2], [3.6, 134.2]];
  const curvaE = new THREE.SplineCurve(PEXT.map(([r, h]) => new THREE.Vector2(r, h))), ARC_E = curvaE.getLength();
  const perfil = (S, adentro) => S.map((p, i) => { const a = S[Math.max(0, i - 1)], b = S[Math.min(S.length - 1, i + 1)], tr = b.x - a.x, th = b.y - a.y, l = Math.hypot(tr, th) || 1; return { r: p.x, h: p.y, v: i / (S.length - 1), nr: adentro ? -th / l : th / l, nh: adentro ? tr / l : -tr / l } });
  const PE = perfil(curvaE.getSpacedPoints(400), false);
  const I_FLANCO = PE.findIndex(p => p.r > 93);                    // donde empieza el flanco (después de la cara de abajo)
  const RT = new Float32Array(137); PE.forEach(p => { if (p.h < 0) return; const k = Math.min(136, Math.floor(p.h)); RT[k] = Math.max(RT[k], p.r) }); for (let k = 1; k < 137; k++) if (!RT[k]) RT[k] = RT[k - 1];
  const rOut = h => { if (h <= 0) return RT[0]; if (h >= 135) return RT[135]; const k = Math.floor(h); return lerp(RT[k], RT[k + 1], h - k) };   // radio de afuera a la altura h
  const vDe = (P, i0, h) => { for (let i = i0; i < P.length - 1; i++) if (P[i + 1].h >= h) { const a = P[i], b = P[i + 1]; return lerp(a.v, b.v, cl((h - a.h) / Math.max(1e-6, b.h - a.h))) } return 1 };
  // altura de la superficie de arriba (tapa / hombro) en el radio r (para apoyar cosas encima)
  const hArriba = r => { for (let i = PE.length - 1; i > I_FLANCO; i--) if (PE[i - 1].r >= r) { const a = PE[i - 1], b = PE[i]; return lerp(b.h, a.h, cl((r - b.r) / Math.max(1e-6, a.r - b.r))) } return 0 };
  // adentro: el labio por dentro (con la CANALETA entre el reborde y la pared, donde va la cera) y la pared con su espesor
  const grosor = h => h < 8 ? 6.5 : h < 20 ? lerp(6.5, 4.6, (h - 8) / 12) : h < 45 ? lerp(4.6, 3.4, (h - 20) / 25) : lerp(3.4, 3.0, sst(45, 130, h));
  const LABIO_IN = [[85.6, 0], [84.7, 1.2], [84.35, 3.4], [84.6, 5.6], [85.1, 6.5], [85.6, 6.15], [85.9, 4.9], [86.3, 4.3], [86.8, 4.4], [87.1, 5.3], [87.05, 7.0]];
  const OFFS = PE.slice(I_FLANCO).map(p => { const g = grosor(p.h); return [p.r - p.nr * g, p.h - p.nh * g] }).filter(q => q[1] > 7.8 && q[0] > 3.4);
  const curvaI = new THREE.SplineCurve([...LABIO_IN, ...OFFS].map(([r, h]) => new THREE.Vector2(r, h))), ARC_I = curvaI.getLength();
  const PI_ = perfil(curvaI.getSpacedPoints(300), true);
  const I_PARED = PI_.findIndex(p => p.h > 7.6);
  const rIn = h => { for (let i = I_PARED; i < PI_.length - 1; i++) if (PI_[i + 1].h >= h) return lerp(PI_[i].r, PI_[i + 1].r, cl((h - PI_[i].h) / Math.max(1e-6, PI_[i + 1].h - PI_[i].h))); return 3.6 };
  const H_TECHO = PI_[PI_.length - 1].h;                            // altura del techo de adentro (≈ 131)

  // torno: superficie de revolución con normales exactas (sin costura). flip = cara hacia adentro
  const torno = (P, NR, rep, flip = false, a0 = 0, a1 = TAU) => {
    const NP = P.length, n = NP * (NR + 1), pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2), idx = new Uint32Array((NP - 1) * NR * 6); let k = 0, q = 0;
    for (let i = 0; i < NP; i++) for (let j = 0; j <= NR; j++) { const a = a0 + (a1 - a0) * j / NR, c = Math.cos(a), s = Math.sin(a), p = P[i];
      pos[k * 3] = CX + p.r * c; pos[k * 3 + 1] = Y0 + p.h; pos[k * 3 + 2] = CZ + p.r * s; nor[k * 3] = p.nr * c; nor[k * 3 + 1] = p.nh; nor[k * 3 + 2] = p.nr * s; uv[k * 2] = (flip ? 1 : -1) * (a - a0) / TAU * rep; /* afuera: u crece hacia la derecha mirando desde afuera (letras derechas) */ uv[k * 2 + 1] = p.v; k++ }
    for (let i = 0; i < NP - 1; i++) for (let j = 0; j < NR; j++) { const a = i * (NR + 1) + j, b = a + NR + 1; if (!flip) { idx[q++] = a; idx[q++] = b; idx[q++] = a + 1; idx[q++] = a + 1; idx[q++] = b; idx[q++] = b + 1 } else { idx[q++] = a; idx[q++] = a + 1; idx[q++] = b; idx[q++] = a + 1; idx[q++] = b + 1; idx[q++] = b } }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); g.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); g.setIndex(new THREE.BufferAttribute(idx, 1)); g.computeBoundingSphere(); return g };

  // ======================= TEXTURAS PINTADAS DEL BRONCE =======================
  // sello: dibuja en un lienzo chico (con desenfoques baratos) y lo pega en el grande (source-over: lo transparente no toca nada)
  const sello = (g, x, y, w, h, fn, W = 0) => { const c = mk(Math.max(1, Math.ceil(w)), Math.max(1, Math.ceil(h))), t = c.getContext("2d"); fn(t, c.width, c.height); g.drawImage(c, x, y); if (W) { if (x + w > W) g.drawImage(c, x - W, y); if (x < 0) g.drawImage(c, x + W, y) } };
  // relieve en capas: la misma forma con desenfoque grande y bajo, y cada vez más nítida y más alta → bulto redondeado
  const capas = (t, forma, base, alto, bl = 5) => { [[bl, base], [bl * .5, lerp(base, alto, .6)], [bl * .2, alto]].forEach(([b, v], i) => { t.save(); t.filter = `blur(${b.toFixed(1)}px)`; t.fillStyle = t.strokeStyle = G_(v); forma(t, i); t.restore() }) };
  // hornea: altura (lienzo H) + máscaras (lienzo M: R = verdín, G = mugre, B = hierro) → color (en M) y datos (en H: R altura, G aspereza, B metal)
  function hornear(cH, cM, pal) { const W = cH.width, Hh = cH.height, gH = cH.getContext("2d", { willReadFrequently: true }), gM = cM.getContext("2d", { willReadFrequently: true });
    const W4 = W >> 2, H4 = Hh >> 2, cB = mk(W4, H4), gB = cB.getContext("2d", { willReadFrequently: true }); gB.filter = "blur(4px)"; gB.drawImage(cH, 0, 0, W4, H4);
    const dH = gH.getImageData(0, 0, W, Hh), dM = gM.getImageData(0, 0, W, Hh), dB = gB.getImageData(0, 0, W4, H4).data, h = dH.data, m = dM.data;
    const NZ = 48, nz = new Float32Array(NZ * NZ), r = rng(pal.seed); for (let i = 0; i < nz.length; i++) nz[i] = r();
    const ruido = (x, y) => { const fx = x / W * NZ, fy = y / Hh * NZ, i = Math.floor(fx), j = Math.floor(fy), u = fx - i, v = fy - j, i0 = i % NZ, i1 = (i + 1) % NZ, j1 = Math.min(NZ - 1, j + 1); return lerp(lerp(nz[j * NZ + i0], nz[j * NZ + i1], u), lerp(nz[j1 * NZ + i0], nz[j1 * NZ + i1], u), v) };
    const [b0, b1, pu0, pu1, ve0, ve1, fe0, fe1] = pal.c;
    for (let y = 0; y < Hh; y++) { const by = Math.min(H4 - 1, y >> 2);
      for (let x = 0; x < W; x++) { const i = (y * W + x) * 4, hv = h[i] / 255, hb = dB[(by * W4 + (x >> 2)) * 4] / 255, rel = hv - hb, n = ruido(x, y), n2 = ruido((x * 3.1) % W, (y * 2.7) % Hh);
        const ver = m[i] / 255, mug = m[i + 1] / 255, fer = m[i + 2] / 255;
        let R = lerp(b0[0], b1[0], n), Gc = lerp(b0[1], b1[1], n), B = lerp(b0[2], b1[2], n), rough = pal.rb, met = pal.mb;
        const pul = cl(rel * pal.kp - .03) * (1 - cl(ver * 1.4)) * pal.pul;                               // lo saliente, frotado por el viento y las manos: cobre
        R = lerp(R, lerp(pu0[0], pu1[0], n2), pul); Gc = lerp(Gc, lerp(pu0[1], pu1[1], n2), pul); B = lerp(B, lerp(pu0[2], pu1[2], n2), pul); rough = lerp(rough, .24, pul); met = lerp(met, 1, pul);
        const vv = cl((ver + Math.max(-rel, 0) * pal.kv) * pal.ver), vc = lerp(.15, 1, n2);                // verdín: en los huecos y chorreado
        R = lerp(R, lerp(ve0[0], ve1[0], vc), vv); Gc = lerp(Gc, lerp(ve0[1], ve1[1], vc), vv); B = lerp(B, lerp(ve0[2], ve1[2], vc), vv); rough = lerp(rough, .9, vv); met = lerp(met, .04, vv);
        if (fer > .02) { const f = cl(fer); R = lerp(R, lerp(fe0[0], fe1[0], n2), f); Gc = lerp(Gc, lerp(fe0[1], fe1[1], n2), f); B = lerp(B, lerp(fe0[2], fe1[2], n2), f); rough = lerp(rough, .78, f); met = lerp(met, .5, f) }
        const k = 1 - .62 * cl(mug); R *= k; Gc *= k; B *= k; rough = lerp(rough, .95, cl(mug) * .5);
        m[i] = R; m[i + 1] = Gc; m[i + 2] = B; m[i + 3] = 255; h[i + 1] = rough * 255; h[i + 2] = met * 255; h[i + 3] = 255 } }
    gH.putImageData(dH, 0, 0); gM.putImageData(dM, 0, 0);
    const tc = new THREE.CanvasTexture(cM); tc.colorSpace = THREE.SRGBColorSpace; const td = new THREE.CanvasTexture(cH); td.colorSpace = THREE.NoColorSpace;
    [tc, td].forEach(t => { t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.ClampToEdgeWrapping; t.anisotropy = 8 }); return { c: tc, d: td } }

  // figura de bulto (gente tapándose los oídos): en metros, origen en los pies, y hacia abajo positiva. tipo: 0 de pie, 1 de rodillas, 2 madre con chico, 3 grita, 4 cabeza gacha
  const figura = (t, tipo, r) => { const kn = tipo === 1 ? 2.3 : 0, hx = tipo === 4 ? .25 : 0, hy = -9.05 + kn + (tipo === 4 ? .55 : 0), w = .9 + r() * .25, ao = [(r() - .5) * .3, (r() - .5) * .3];
    const sil = (g, i) => { const s = i === 2 ? .94 : 1; g.save(); g.translate(0, -4.5); g.scale(s, s); g.translate(0, 4.5);
      g.beginPath(); g.moveTo(-1.55 * w, 0); g.quadraticCurveTo(-1.7 * w, -2, -1.15, -5.2 + kn); g.quadraticCurveTo(-1.4, -7.5 + kn, -.95, -7.95 + kn); g.lineTo(-.35, -8.1 + kn); g.lineTo(.35, -8.1 + kn); g.lineTo(.95, -7.95 + kn); g.quadraticCurveTo(1.4, -7.5 + kn, 1.15, -5.2 + kn); g.quadraticCurveTo(1.7 * w, -2, 1.55 * w, 0); g.closePath(); g.fill();
      if (tipo === 1) { g.beginPath(); g.ellipse(0, -.55, 2.1 * w, .7, 0, 0, TAU); g.fill() }
      g.beginPath(); g.ellipse(hx, hy, .74, .92, 0, 0, TAU); g.fill();
      g.lineWidth = .6; g.lineCap = g.lineJoin = "round"; [-1, 1].forEach((s2, q) => { g.beginPath(); g.moveTo(s2 * .95, -7.7 + kn); g.lineTo(s2 * 1.95, -8.2 + kn + ao[q]); g.lineTo(s2 * .9 + hx, hy + .08); g.stroke(); g.beginPath(); g.ellipse(s2 * .86 + hx, hy + .02, .3, .44, 0, 0, TAU); g.fill() });
      if (tipo === 2) { g.beginPath(); g.ellipse(1.6, -2.9, .95, 1.6, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(1.6, -4.85, .52, .6, 0, 0, TAU); g.fill(); g.lineWidth = .4; g.beginPath(); g.moveTo(1.1, -3.8); g.lineTo(1.14, -4.9); g.stroke(); g.beginPath(); g.moveTo(2.1, -3.8); g.lineTo(2.08, -4.9); g.stroke() }
      g.restore() };
    capas(t, sil, .5, .74, 5);
    t.save(); t.lineCap = "round";
    for (let k = 0; k < 7; k++) { const x0 = (k - 3) * .38 + (r() - .5) * .2, c1 = (r() - .5) * .4; t.strokeStyle = G_(.5); t.lineWidth = .09; t.beginPath(); t.moveTo(x0 * .7, -5 + kn); t.quadraticCurveTo(x0 * 1.1 + c1, -2.5 + kn * .5, x0 * 1.45, -.15); t.stroke(); t.strokeStyle = G_(.78); t.lineWidth = .05; t.beginPath(); t.moveTo(x0 * .7 + .12, -5 + kn); t.quadraticCurveTo(x0 * 1.1 + c1 + .1, -2.5 + kn * .5, x0 * 1.45 + .14, -.15); t.stroke() }
    t.strokeStyle = G_(.36); t.lineWidth = .1; for (const s2 of [-1, 1]) { t.beginPath(); t.arc(hx + s2 * .28, hy - .1, .16, .2, Math.PI - .2); t.stroke(); t.beginPath(); t.moveTo(hx + s2 * .1, hy - .32); t.lineTo(hx + s2 * .46, hy - .4 + (tipo === 3 ? .1 : 0)); t.stroke() }
    if (tipo === 3) { t.fillStyle = G_(.2); t.beginPath(); t.ellipse(hx, hy + .45, .2, .3, 0, 0, TAU); t.fill() } else { t.beginPath(); t.moveTo(hx - .18, hy + .45); t.lineTo(hx + .18, hy + .45); t.stroke() }
    t.strokeStyle = G_(.8); t.lineWidth = .06; for (let k = 0; k < 8; k++) { const a = Math.PI + k / 7 * Math.PI; t.beginPath(); t.arc(hx, hy, .8, a, a + .25); t.stroke() }
    t.strokeStyle = G_(.5); t.lineWidth = .05; for (const s2 of [-1, 1]) for (let k = 0; k < 3; k++) { t.beginPath(); t.moveTo(hx + s2 * (.72 + k * .1), hy - .3); t.lineTo(hx + s2 * (.74 + k * .1), hy + .3); t.stroke() }
    t.restore() };
  // rostro grande de medallón (radio ≈ 16 m): ojos apretados, boca abierta en un grito mudo, manos tapando las orejas, lágrimas, cuentas en el borde
  const rostro = (t, r, grita = true) => {
    t.fillStyle = G_(.39); t.beginPath(); t.arc(0, 0, 16.2, 0, TAU); t.fill();
    capas(t, (g) => { g.lineWidth = 1.5; g.beginPath(); g.arc(0, 0, 15.3, 0, TAU); g.stroke() }, .5, .72, 4);
    for (let k = 0; k < 40; k++) { const a = k / 40 * TAU; capas(t, (g) => { g.beginPath(); g.ellipse(Math.cos(a) * 13.7, Math.sin(a) * 13.7, .75, .42, a + Math.PI / 2, 0, TAU); g.fill() }, .46, .7, 2) }
    capas(t, (g) => { g.beginPath(); g.ellipse(0, .6, 6.4, 8.2, 0, 0, TAU); g.fill() }, .5, .66, 8);
    capas(t, (g) => { g.beginPath(); g.ellipse(0, -2.2, 5.6, 4.6, 0, Math.PI, TAU); g.fill() }, .55, .7, 4);
    t.save(); t.lineCap = "round";
    for (let k = 0; k < 22; k++) { const a = Math.PI * 1.05 + k / 21 * Math.PI * .9; t.strokeStyle = G_(.76); t.lineWidth = .3; t.beginPath(); t.moveTo(Math.cos(a) * 5.4, -1 + Math.sin(a) * 7.2); t.quadraticCurveTo(Math.cos(a) * 7.4, -1 + Math.sin(a) * 8.6, Math.cos(a + .1) * 7.8, -1 + Math.sin(a + .1) * 9.4); t.stroke() }
    for (const s of [-1, 1]) { capas(t, (g) => { g.lineWidth = .55; g.beginPath(); g.moveTo(s * .6, -2.6); g.quadraticCurveTo(s * 2.4, -3.8, s * 3.9, -2.9); g.stroke() }, .62, .8, 2);
      t.strokeStyle = G_(.24); t.lineWidth = .32; t.beginPath(); t.arc(s * 2.3, -1.2, 1.05, .25, Math.PI - .25); t.stroke();
      t.strokeStyle = G_(.42); t.lineWidth = .14; for (let q = 0; q < 3; q++) { t.beginPath(); t.moveTo(s * 3.4, -1.5 + q * .5); t.lineTo(s * 4.3, -1.8 + q * .7); t.stroke() }
      t.strokeStyle = G_(.32); t.lineWidth = .18; t.beginPath(); t.moveTo(s * 2.2, -.2); t.quadraticCurveTo(s * 2.5, 2.2, s * 2.1 + (r() - .5), 4.6 + r() * 1.5); t.stroke();
      capas(t, (g) => { g.beginPath(); g.ellipse(s * 7.1, -.3, 1.8, 2.8, s * .15, 0, TAU); g.fill() }, .55, .78, 4);
      t.strokeStyle = G_(.45); t.lineWidth = .16; for (let q = 0; q < 4; q++) { t.beginPath(); t.moveTo(s * (6.1 + q * .5), -2.6); t.lineTo(s * (6.2 + q * .55), .9); t.stroke() } }
    capas(t, (g) => { g.lineWidth = .8; g.beginPath(); g.moveTo(0, -1.8); g.lineTo(-.4, 1.9); g.lineTo(.5, 2.2); g.stroke() }, .62, .82, 2);
    if (grita) { capas(t, (g) => { g.lineWidth = .7; g.beginPath(); g.ellipse(0, 4.7, 1.7, 2.3, 0, 0, TAU); g.stroke() }, .58, .76, 2); t.fillStyle = G_(.12); t.beginPath(); t.ellipse(0, 4.7, 1.3, 1.95, 0, 0, TAU); t.fill() }
    else { t.strokeStyle = G_(.25); t.lineWidth = .35; t.beginPath(); t.moveTo(-1.6, 4.6); t.quadraticCurveTo(0, 4.1, 1.6, 4.6); t.stroke() }
    t.restore() };
  // la oreja tachada (emblema fundido entre los medallones)
  const orejaTachada = (t) => { capas(t, (g) => { g.lineWidth = .9; g.beginPath(); g.arc(0, 0, 5.6, 0, TAU); g.stroke() }, .52, .74, 3);
    capas(t, (g) => { g.lineWidth = 1.1; g.lineCap = "round"; g.beginPath(); g.moveTo(1.4, 3.2); g.bezierCurveTo(-2.8, 3.6, -2.6, -3.6, .2, -3.4); g.bezierCurveTo(2.6, -3.2, 2.4, -.4, .6, .4); g.bezierCurveTo(-.4, .8, .2, 1.8, -.6, 2); g.stroke() }, .52, .78, 3);
    capas(t, (g) => { g.lineWidth = .95; g.lineCap = "round"; g.beginPath(); g.moveTo(-4, 4); g.lineTo(4, -4); g.stroke() }, .55, .82, 2) };
  // máscara chica (fila del hombro)
  const mascara = (t, r) => { capas(t, (g) => { g.beginPath(); g.ellipse(0, 0, 1.9, 2.5, 0, 0, TAU); g.fill() }, .5, .7, 4);
    for (const s of [-1, 1]) { capas(t, (g) => { g.beginPath(); g.ellipse(s * 2.2, 0, .55, .9, 0, 0, TAU); g.fill() }, .52, .74, 2); t.strokeStyle = G_(.28); t.lineWidth = .16; t.beginPath(); t.arc(s * .7, -.4, .38, .3, Math.PI - .3); t.stroke() }
    t.fillStyle = G_(.15); t.beginPath(); t.ellipse(0, 1.1, .45 + r() * .2, .55 + r() * .3, 0, 0, TAU); t.fill() };

  const T_EXT = (() => { const W = 4096, Hh = 4096, REP = 2, r = rng(9101);
    const cH = mk(W, Hh), gH = cH.getContext("2d", { willReadFrequently: true }), cM = mk(W, Hh), gM = cM.getContext("2d", { willReadFrequently: true });
    gH.fillStyle = G_(.42); gH.fillRect(0, 0, W, Hh); gM.fillStyle = "#000"; gM.fillRect(0, 0, W, Hh); gM.globalCompositeOperation = "lighter";
    const Y = h => (1 - vDe(PE, I_FLANCO, h)) * Hh, ky = Hh / ARC_E, kx = h => W * REP / (TAU * rOut(h));
    const GOT = [];                                                    // de dónde chorrea el verdín: [x, y, ancho]
    for (let k = 0; k < 500; k++) { const x = r() * W, y = r() * Hh, R0 = 30 + r() * 260, gr = gH.createRadialGradient(x, y, 0, x, y, R0), v = (r() < .5 ? .4 : .445) * 255 | 0; gr.addColorStop(0, `rgba(${v},${v},${v},.35)`); gr.addColorStop(1, `rgba(${v},${v},${v},0)`); gH.fillStyle = gr; gH.fillRect(x - R0, y - R0, R0 * 2, R0 * 2) }
    for (let k = 0; k < 45000; k++) { gH.fillStyle = G_(.3 + r() * .08); gH.beginPath(); gH.arc(r() * W, r() * Hh, .6 + r() * 1.8, 0, TAU); gH.fill() }
    // molduras (anillos en relieve)
    const moldura = (h, alto, amp = .3) => { const y0 = Y(h + alto / 2), y1 = Y(h - alto / 2), gr = gH.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, G_(.42)); gr.addColorStop(.3, G_(.42 + amp)); gr.addColorStop(.55, G_(.42 + amp * .85)); gr.addColorStop(1, G_(.4)); gH.fillStyle = gr; gH.fillRect(0, y0, W, y1 - y0);
      for (let x = r() * 30; x < W; x += 14 + r() * 50) GOT.push([x, y1, 3 + r() * 9]) };
    [[2.2, .7, .32], [3.9, .6, .3], [7.3, .9, .34], [22.6, .9, .34], [24.3, .7, .28], [25.7, .6, .24], [35.2, .8, .32], [36.7, .6, .26], [88.5, .9, .32], [90, .6, .26], [101.6, .8, .3], [103.1, .6, .26], [112.2, .8, .3], [113.6, .6, .24], [120.4, .9, .3], [127, 1.1, .3], [131, .8, .28]].forEach(([h, a, p]) => moldura(h, a, p));
    // ARCADA del arco sonoro: nichos con gente tapándose los oídos (h 8,9 → 21,2)
    { const hb = 8.9, ht = 21.2, kxx = kx(15), N = 46, paso = W / N, alto = (ht - hb) * ky, yb = Y(hb);
      for (let i = 0; i < N; i++) { const x0 = i * paso, tipo = [0, 1, 0, 3, 2, 0, 4, 1, 3, 0][(i * 7 + (i >> 2)) % 10], rr = rng(9200 + i);
        sello(gH, x0, yb - alto, paso, alto, (t, w, h) => { t.translate(w / 2, h); t.scale(kxx, ky);
          const nw = paso / kxx * .74, nh = (ht - hb) - .9; t.fillStyle = G_(.33); t.beginPath(); t.moveTo(-nw / 2, -.25); t.lineTo(-nw / 2, -nh + nw / 2); t.arc(0, -nh + nw / 2, nw / 2, Math.PI, TAU); t.lineTo(nw / 2, -.25); t.closePath(); t.fill();
          t.strokeStyle = G_(.27); t.lineWidth = .18; t.stroke();
          t.save(); t.translate(0, -.35); figura(t, tipo, rr); t.restore();
          for (const s of [-1, 1]) { const cx = s * paso / kxx / 2; capas(t, (g) => { g.fillRect(cx - .38, -nh + .5, .76, nh - .5); g.fillRect(cx - .62, -nh - .1, 1.24, .7); g.fillRect(cx - .6, -.7, 1.2, .6) }, .5, .7, 2) } }, W);
        GOT.push([x0 + paso / 2, yb, 30], [x0 + paso * .3, yb, 12], [x0 + paso * .7, yb, 12]) } }
    // INSCRIPCIÓN fundida (letras antiguas)
    const inscripcion = (texto, hc, alto_m, semilla, fondo = .38) => { const rr = rng(semilla), y0 = Y(hc + alto_m * .72), y1 = Y(hc - alto_m * .72), hp = y1 - y0, kxx = kx(hc), fs = alto_m * ky;
      gH.fillStyle = G_(fondo); gH.fillRect(0, y0, W, hp);
      sello(gH, 0, y0, W, hp, (t, w, h) => { t.font = `bold ${fs.toFixed(0)}px "Times New Roman", Times, serif`; t.textBaseline = "middle"; t.textAlign = "center";
        const sx = kxx / ky, ch = [...texto], ws = ch.map(c => t.measureText(c).width * sx * 1.08), tot = ws.reduce((a, b) => a + b, 0), extra = (w - tot) / ch.length; let x = extra / 2;
        ch.forEach((c, i) => { const cx = x + ws[i] / 2; x += ws[i] + extra; if (c === " ") return;
          const rot = (rr() - .5) * .05, sc = .94 + rr() * .1, alto = .72 + rr() * .06;
          capas(t, (g) => { g.save(); g.translate(cx, h / 2); g.rotate(rot); g.scale(sx * sc, sc); g.fillText(c, 0, 0); g.restore() }, .5, alto, 3.5);
          GOT.push([cx, y1, 6 + rr() * 6]) }) }) };
    inscripcion("+ PLVG · YOVR · EARS + REMEMBER + NEMO · ME · AVDIAT + VOCO · OBLIVIONEM +", 30.5, 5.4, 9301);
    inscripcion("FVSA · SVM · ANNO · MDCCXII + QVI · ME · AVDIT · OBLIVISCITVR + SALLOW · FECIT", 107.3, 4.1, 9302);
    // MEDALLONES con rostros (cintura, h ≈ 66) y orejas tachadas entre medio
    { const hc = 66, kxx = kx(hc), N = 3;
      for (let i = 0; i < N; i++) { const xc = (i + .5) / N * W, rr = rng(9400 + i), wpx = 34 * kxx, hpx = 34 * ky;
        sello(gH, xc - wpx / 2, Y(hc) - hpx / 2, wpx, hpx, (t, w, h) => { t.translate(w / 2, h / 2); t.scale(kxx, ky); rostro(t, rr, i !== 1) }, W);
        for (let q = 0; q < 26; q++) GOT.push([xc + (rr() - .5) * 26 * kxx, Y(hc - 15 + rr() * 6), 8 + rr() * 26]);
        const xo = xc + W / N / 2, w2 = 13 * kxx, h2 = 13 * ky;
        sello(gH, xo - w2 / 2, Y(hc) - h2 / 2, w2, h2, (t, w, h) => { t.translate(w / 2, h / 2); t.scale(kxx, ky); orejaTachada(t) }, W);
        GOT.push([xo, Y(hc - 6), 20]);
        for (const dh of [-16, 16]) { const w3 = 5 * kxx, h3 = 5 * ky; sello(gH, xo - w3 / 2, Y(hc + dh) - h3 / 2, w3, h3, (t, w, h) => { t.translate(w / 2, h / 2); t.scale(kxx, ky); for (let k = 0; k < 8; k++) capas(t, (g) => { g.beginPath(); g.ellipse(Math.cos(k / 8 * TAU) * 1.3, Math.sin(k / 8 * TAU) * 1.3, 1, .45, k / 8 * TAU, 0, TAU); g.fill() }, .48, .7, 2); capas(t, (g) => { g.beginPath(); g.arc(0, 0, .8, 0, TAU); g.fill() }, .55, .78, 2) }, W) } } }
    // fila de máscaras con las manos en las orejas (h 91 → 99,5)
    { const hc = 95.3, kxx = kx(hc), N = 24;
      for (let i = 0; i < N; i++) { const xc = (i + .5) / N * W, rr = rng(9500 + i), wpx = 7.5 * kxx, hpx = 7 * ky;
        sello(gH, xc - wpx / 2, Y(hc) - hpx / 2, wpx, hpx, (t, w, h) => { t.translate(w / 2, h / 2); t.scale(kxx, ky); mascara(t, rr) }, W); GOT.push([xc, Y(hc - 3), 14]);
        const xs = xc + W / N / 2, w2 = 3 * kxx, h2 = 3 * ky; sello(gH, xs - w2 / 2, Y(hc) - h2 / 2, w2, h2, (t, w, h) => { t.translate(w / 2, h / 2); t.scale(kxx, ky); capas(t, (g) => { g.beginPath(); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU, q = k % 2 ? .5 : 1.3; g.lineTo(Math.cos(a) * q, Math.sin(a) * q) } g.closePath(); g.fill() }, .5, .74, 2) }, W) } }
    // hojas de acanto en el hombro (h 114 → 120) y nervios + remaches en la tapa
    { const hb = 114.3, kxx = kx(117), N = 70; for (let i = 0; i < N; i++) { const xc = (i + .5) / N * W, wpx = 4 * kxx, hpx = 6.4 * ky; sello(gH, xc - wpx / 2, Y(hb + 6.2), wpx, hpx, (t, w, h) => { t.translate(w / 2, h); t.scale(kxx, ky); capas(t, (g) => { g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(-1.9, -1.5, -1.2, -4.6, 0, -6); g.bezierCurveTo(1.2, -4.6, 1.9, -1.5, 0, 0); g.fill() }, .48, .7, 2); t.strokeStyle = G_(.4); t.lineWidth = .12; t.beginPath(); t.moveTo(0, -.2); t.lineTo(0, -5.4); t.stroke() }, W) } }
    { const y0 = Y(HB), y1 = Y(128); for (let i = 0; i < 64; i++) { const x = (i + .5) / 64 * W, gr = gH.createLinearGradient(x - 10, 0, x + 10, 0); gr.addColorStop(0, G_(.42)); gr.addColorStop(.5, G_(.66)); gr.addColorStop(1, G_(.42)); gH.fillStyle = gr; gH.fillRect(x - 10, y0, 20, y1 - y0) }
      for (const hh of [124, 129.5]) for (let i = 0; i < 160; i++) { const x = (i + .5) / 160 * W, y = Y(hh); gH.fillStyle = G_(.82); gH.beginPath(); gH.arc(x, y, 5, 0, TAU); gH.fill(); GOT.push([x, y + 5, 3]) } }
    // GRIETAS que suben del labio (algunas con parches de hierro remachados encima)
    for (let k = 0; k < 9; k++) { let x = r() * W, h = .8, ang = 0; const top = 26 + r() * 50, pts = [[x, Y(h)]];
      while (h < top) { h += .6 + r() * 1.6; ang += (r() - .5) * .9; ang = cl(ang, -1.1, 1.1); x += Math.sin(ang) * 12 * r(); pts.push([x, Y(h)]); if (r() < .12) { let bx = x, bh = h; gH.strokeStyle = G_(.12); gH.lineWidth = 2; gH.beginPath(); gH.moveTo(bx, Y(bh)); for (let q = 0; q < 5; q++) { bh += .5 + r(); bx += (r() - .5) * 18; gH.lineTo(bx, Y(bh)) } gH.stroke() } }
      for (const [lw, c] of [[7, .2], [3.5, .06]]) { gH.strokeStyle = G_(c); gH.lineWidth = lw; gH.beginPath(); pts.forEach(([px, py], i) => i ? gH.lineTo(px, py) : gH.moveTo(px, py)); gH.stroke() }
      gM.strokeStyle = "rgba(0,255,0,.55)"; gM.lineWidth = 10; gM.beginPath(); pts.forEach(([px, py], i) => i ? gM.lineTo(px, py) : gM.moveTo(px, py)); gM.stroke();
      gM.strokeStyle = "rgba(255,0,0,.35)"; gM.lineWidth = 22; gM.stroke();
      pts.forEach(([px, py], i) => { if (i % 3 === 0) GOT.push([px, py, 10]) });
      if (k % 2 === 0) { const [px, py] = pts[(pts.length * .45) | 0], pw = 4.2 * kx(30), ph = 7 * ky, rot = (r() - .5) * .2;
        sello(gH, px - pw, py - ph, pw * 2, ph * 2, (t, w, h) => { t.translate(w / 2, h / 2); t.rotate(rot); capas(t, (g) => g.fillRect(-pw / 2, -ph / 2, pw, ph), .52, .6, 2); for (let i = 0; i < 6; i++) for (const s of [-1, 1]) { t.fillStyle = G_(.84); t.beginPath(); t.arc(s * (pw / 2 - 8), -ph / 2 + 10 + i * (ph - 20) / 5, 5, 0, TAU); t.fill(); t.beginPath(); t.arc(-pw / 2 + 10 + i * (pw - 20) / 5, s * (ph / 2 - 8), 5, 0, TAU); t.fill() } }, W);
        gM.save(); gM.translate(px, py); gM.rotate(rot); gM.fillStyle = "rgba(0,0,255,1)"; gM.fillRect(-pw / 2, -ph / 2, pw, ph); gM.fillStyle = "rgba(0,90,0,1)"; gM.fillRect(-pw / 2, ph / 2 - 6, pw, 6); gM.restore();
        for (let q = 0; q < 6; q++) GOT.push([px - pw / 2 + r() * pw, py + ph / 2, 8]) } }
    // VERDÍN chorreado (R) desde todo lo que sobresale, y mugre de lluvia (G)
    GOT.forEach(([x, y, w]) => { if (r() < .25) return; const L = 30 + r() * r() * 900, a = .18 + r() * .5, x2 = x + (r() - .5) * 10, gr = gM.createLinearGradient(0, y, 0, y + L); gr.addColorStop(0, `rgba(255,0,0,${a})`); gr.addColorStop(.25, `rgba(255,0,0,${a * .7})`); gr.addColorStop(1, "rgba(255,0,0,0)");
      gM.strokeStyle = gr; gM.lineWidth = w * (.4 + r() * .8); gM.lineCap = "round"; gM.beginPath(); gM.moveTo(x, y); gM.quadraticCurveTo(x + (r() - .5) * 8, y + L * .5, x2, y + L); gM.stroke();
      if (r() < .3) { const gr2 = gM.createLinearGradient(0, y, 0, y + L * .7); gr2.addColorStop(0, `rgba(0,255,0,${a * .5})`); gr2.addColorStop(1, "rgba(0,255,0,0)"); gM.strokeStyle = gr2; gM.lineWidth = w * .5; gM.beginPath(); gM.moveTo(x + 3, y); gM.lineTo(x2 + 3, y + L * .7); gM.stroke() } });
    for (let k = 0; k < 220; k++) { const x = r() * W, y = Y(lerp(98, HB, r() ** .6)), R0 = 40 + r() * 240, gr = gM.createRadialGradient(x, y, 0, x, y, R0); gr.addColorStop(0, `rgba(255,0,0,${.12 + r() * .22})`); gr.addColorStop(1, "rgba(255,0,0,0)"); gM.fillStyle = gr; gM.fillRect(x - R0, y - R0, R0 * 2, R0 * 2) }
    for (let k = 0; k < 900; k++) { const x = r() * W, y = r() * Hh, L = 60 + r() * 500, gr = gM.createLinearGradient(0, y, 0, y + L); gr.addColorStop(0, `rgba(0,255,0,${.05 + r() * .14})`); gr.addColorStop(1, "rgba(0,255,0,0)"); gM.strokeStyle = gr; gM.lineWidth = 4 + r() * 30; gM.beginPath(); gM.moveTo(x, y); gM.lineTo(x + (r() - .5) * 12, y + L); gM.stroke() }
    { const y0 = Y(9), y1 = Hh, gr = gM.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, "rgba(0,255,0,0)"); gr.addColorStop(1, "rgba(0,255,0,.45)"); gM.fillStyle = gr; gM.fillRect(0, y0, W, y1 - y0) }   // el labio sucio de abajo
    return hornear(cH, cM, { seed: 9102, c: [[62, 44, 27], [96, 66, 38], [168, 98, 52], [222, 150, 92], [44, 104, 86], [124, 190, 162], [52, 46, 42], [118, 60, 30]], rb: .5, mb: .9, kp: 7, pul: 1, kv: 5, ver: 1 }) })();

  // por DENTRO: bronce oscuro con hollín, costuras de fundición, las letras y figuras al revés (relieves invertidos, hundidos)
  const T_INT = (() => { const W = 2048, Hh = 2048, REP = 2, r = rng(9601);
    const cH = mk(W, Hh), gH = cH.getContext("2d", { willReadFrequently: true }), cM = mk(W, Hh), gM = cM.getContext("2d", { willReadFrequently: true });
    gH.fillStyle = G_(.45); gH.fillRect(0, 0, W, Hh); gM.fillStyle = "#000"; gM.fillRect(0, 0, W, Hh); gM.globalCompositeOperation = "lighter";
    const Y = h => (1 - vDe(PI_, I_PARED, h)) * Hh, ky = Hh / ARC_I, kx = h => W * REP / (TAU * rIn(h));
    for (let k = 0; k < 300; k++) { const x = r() * W, y = r() * Hh, R0 = 20 + r() * 160, gr = gH.createRadialGradient(x, y, 0, x, y, R0), v = r() < .5 ? 100 : 130; gr.addColorStop(0, `rgba(${v},${v},${v},.3)`); gr.addColorStop(1, `rgba(${v},${v},${v},0)`); gH.fillStyle = gr; gH.fillRect(x - R0, y - R0, R0 * 2, R0 * 2) }
    for (let k = 0; k < 16000; k++) { gH.fillStyle = G_(.3 + r() * .1); gH.beginPath(); gH.arc(r() * W, r() * Hh, .5 + r() * 1.4, 0, TAU); gH.fill() }
    for (const h of [9, 23, 36, 52, 70, 88, 104, 118]) { const y = Y(h); gH.fillStyle = G_(.58); gH.fillRect(0, y - 2, W, 4); gH.fillStyle = G_(.36); gH.fillRect(0, y + 2, W, 2) }
    for (let i = 0; i < 6; i++) { const x = (i + .3) / 6 * W; gH.strokeStyle = G_(.6); gH.lineWidth = 3; gH.beginPath(); gH.moveTo(x, Y(8)); for (let h = 8; h < H_TECHO; h += 4) gH.lineTo(x + Math.sin(h * .3 + i) * 3, Y(h)); gH.stroke() }
    // letras al revés, hundidas
    { const hc = 30.5, alto = 5.4, y0 = Y(hc + alto * .72), y1 = Y(hc - alto * .72), kxx = kx(hc), fs = alto * ky, texto = "+ PLVG · YOVR · EARS + REMEMBER + NEMO · ME · AVDIAT + VOCO · OBLIVIONEM +";
      sello(gH, 0, y0, W, y1 - y0, (t, w, h) => { t.font = `bold ${fs.toFixed(0)}px "Times New Roman", Times, serif`; t.textBaseline = "middle"; t.textAlign = "center"; const sx = kxx / ky, ch = [...texto].reverse(), ws = ch.map(c => t.measureText(c).width * sx * 1.08), tot = ws.reduce((a, b) => a + b, 0), extra = (w - tot) / ch.length; let x = extra / 2;
        ch.forEach((c, i) => { const cx = x + ws[i] / 2; x += ws[i] + extra; if (c === " ") return; for (const [b, v] of [[3, .4], [1.4, .32], [.5, .26]]) { t.save(); t.filter = `blur(${b}px)`; t.fillStyle = G_(v); t.translate(cx, h / 2); t.scale(-sx, 1); t.fillText(c, 0, 0); t.restore() } }) }) }
    // siluetas hundidas de la arcada (las figuras al revés)
    { const hb = 9.6, ht = 20.6, kxx = kx(15), N = 46, paso = W / N; for (let i = 0; i < N; i++) { sello(gH, i * paso, Y(ht), paso, (ht - hb) * ky, (t, w, h) => { t.translate(w / 2, h); t.scale(-kxx, ky); t.globalAlpha = .55; t.filter = "blur(2px)"; t.fillStyle = t.strokeStyle = G_(.33); t.beginPath(); t.ellipse(0, -9, .8, .95, 0, 0, TAU); t.fill(); t.beginPath(); t.moveTo(-1.5, 0); t.lineTo(-1.1, -7.9); t.lineTo(1.1, -7.9); t.lineTo(1.5, 0); t.fill(); t.lineWidth = .6; for (const s of [-1, 1]) { t.beginPath(); t.moveTo(s, -7.7); t.lineTo(s * 1.9, -8.3); t.lineTo(s * .9, -9); t.stroke() } }, W) } }
    // hollín de abajo, chorreaduras de humedad y un poco de verdín
    { const gr = gM.createLinearGradient(0, Y(40), 0, Hh); gr.addColorStop(0, "rgba(0,255,0,0)"); gr.addColorStop(1, "rgba(0,255,0,.6)"); gM.fillStyle = gr; gM.fillRect(0, Y(40), W, Hh - Y(40)) }
    for (let k = 0; k < 700; k++) { const x = r() * W, y = r() * Hh, L = 40 + r() * 400, gr = gM.createLinearGradient(0, y, 0, y + L), a = .08 + r() * .3; gr.addColorStop(0, r() < .3 ? `rgba(255,0,0,${a})` : `rgba(0,255,0,${a})`); gr.addColorStop(1, "rgba(0,0,0,0)"); gM.strokeStyle = gr; gM.lineWidth = 2 + r() * 12; gM.beginPath(); gM.moveTo(x, y); gM.lineTo(x + (r() - .5) * 6, y + L); gM.stroke() }
    return hornear(cH, cM, { seed: 9602, c: [[38, 28, 19], [60, 43, 27], [120, 74, 42], [160, 104, 62], [36, 66, 54], [70, 112, 92], [44, 40, 36], [90, 50, 26]], rb: .58, mb: .75, kp: 5, pul: .5, kv: 3, ver: .45 }) })();

  // ======================= MATERIALES =======================
  const U = { uT: { value: 0 }, uRim: { value: new THREE.Color(0, 0, 0) }, uBrillo: { value: 0 }, uSolW: { value: new THREE.Vector3(0, 1, 0) }, uPat: { value: .55 },
    uOndaH: { value: -100 }, uOndaA: { value: 0 }, uBajo: { value: new THREE.Color(0, 0, 0) } };
  const GLSL_COMUN = `
varying vec3 vCbW;
uniform float uT, uBrillo, uPat, uOndaH, uOndaA; uniform vec3 uRim, uSolW, uBajo;
float cbH(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float cbN(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(cbH(i), cbH(i + vec2(1., 0.)), f.x), mix(cbH(i + vec2(0., 1.)), cbH(i + vec2(1., 1.)), f.x), f.y); }
float cbJag(float a){ return 1. + .16 * sin(3. * a + 1.3) + .1 * sin(7. * a + .4) + .06 * sin(13. * a + 2.1); }
bool cbHueco(vec3 w){ vec2 d = w.xz - vec2(${CX.toFixed(2)}, ${CZ.toFixed(2)}); float h = w.y - ${Y0.toFixed(2)};
  if (h > 120. && length(w.xz - vec2(${HUECO[0].toFixed(2)}, ${HUECO[1].toFixed(2)})) < ${R_HUECO.toFixed(2)}) return true;
  float rr = length(d); if (rr < 78. || h > 18.) return false;
  float a = atan(d.y, d.x) - ${A_ENT.toFixed(5)}; a -= 6.2831853 * floor((a + 3.1415927) / 6.2831853);
  vec2 q = vec2(a * rr / ${GRIETA.hw.toFixed(2)}, (h - ${GRIETA.hc.toFixed(2)}) / ${GRIETA.hh.toFixed(2)}); return length(q) < cbJag(atan(q.y, q.x)); }`;
  const parche = (mat, o) => { mat.onBeforeCompile = sh => { Object.assign(sh.uniforms, U); const VT = o.desplaza ? "#include <displacementmap_vertex>" : "#include <begin_vertex>";
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vCbW;").replace(VT, VT + "\n  vCbW = (modelMatrix * vec4(transformed, 1.)).xyz;");
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\n" + GLSL_COMUN + "\nfloat gCbPat = 0.;").replace("#include <clipping_planes_fragment>", "#include <clipping_planes_fragment>\n  if (cbHueco(vCbW)) discard;");
      if (o.patina) sh.fragmentShader = sh.fragmentShader.replace("#include <map_fragment>", `#include <map_fragment>
  { float n = cbN(vec2(vCbW.x / 16. + vCbW.y / 41., vCbW.z / 16. - vCbW.y / 33.)) * .65 + cbN(vec2(vCbW.x / 5.3 - vCbW.y / 9., vCbW.z / 5.3 + vCbW.y / 13.)) * .35;
    float hh = vCbW.y - ${Y0.toFixed(1)}; gCbPat = smoothstep(.56, .8, n + .14 * smoothstep(90., 134., hh)) * uPat;
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.1, .3, .24) * (.75 + .5 * n), gCbPat * .8); }`)
        .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\n  roughnessFactor = mix(roughnessFactor, .88, gCbPat);").replace("#include <metalnessmap_fragment>", "#include <metalnessmap_fragment>\n  metalnessFactor = mix(metalnessFactor, .06, gCbPat);");
      sh.fragmentShader = sh.fragmentShader.replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
  { vec3 nW = normalize((vec4(normal, 0.) * viewMatrix).xyz), vV = normalize(cameraPosition - vCbW); float hh = vCbW.y - ${Y0.toFixed(1)};
    float fr = pow(1. - max(dot(nW, vV), 0.), 3.), ls = max(dot(nW, uSolW), 0.);
    totalEmissiveRadiance += uRim * fr * (.3 + .7 * ls) * ${o.onda ? "0." : "1."};
    totalEmissiveRadiance += diffuseColor.rgb * uBrillo * pow(ls, 1.6) * (1. - gCbPat);
    totalEmissiveRadiance += uBajo * diffuseColor.rgb * (.3 + .7 * (1. - smoothstep(0., 70., hh))) * 2.5;
    totalEmissiveRadiance += vec3(1., .6, .28) * uOndaA * exp(-pow((hh - uOndaH) / 5., 2.)) * ${o.onda ? "1." : "0."}; }`) };
    mat.customProgramCacheKey = () => "cb" + o.k; return mat };
  const M_BRONCE = parche(new THREE.MeshStandardMaterial({ map: T_EXT.c, bumpMap: T_EXT.d, bumpScale: 2.2, roughnessMap: T_EXT.d, metalnessMap: T_EXT.d, displacementMap: T_EXT.d, displacementScale: 1.9, displacementBias: -.42 * 1.9, roughness: 1, metalness: 1, envMapIntensity: 1 }), { k: "ext", desplaza: true, patina: true });
  const M_BRONCE_IN = parche(new THREE.MeshStandardMaterial({ map: T_INT.c, bumpMap: T_INT.d, bumpScale: 2.6, roughnessMap: T_INT.d, metalnessMap: T_INT.d, roughness: 1, metalness: 1, envMapIntensity: .5 }), { k: "int", onda: true });
  const T_LISO = T_EXT.c.clone(); T_LISO.repeat.set(3, 3); T_LISO.wrapT = THREE.RepeatWrapping; T_LISO.needsUpdate = true;
  const M_BRONCE_L = new THREE.MeshStandardMaterial({ map: T_LISO, color: "#d0c4b0", roughness: .45, metalness: .85, envMapIntensity: 1 });
  // hierro oxidado (cadenas, gancho, anclas)
  const T_OX = (() => { const [c, z] = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(9801); c.fillStyle = "#33281f"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
      for (let k = 0; k < 2600; k++) { const x = r() * w, y = r() * h, R0 = 1 + r() * 12, t = r(); c.fillStyle = t < .4 ? `rgba(${92 + r() * 40 | 0},${46 + r() * 18 | 0},${24 + r() * 10 | 0},${.2 + r() * .4})` : t < .75 ? `rgba(28,24,22,${.25 + r() * .5})` : `rgba(${112 + r() * 30 | 0},${72 + r() * 18 | 0},44,${.12 + r() * .25})`;
        c.beginPath(); c.ellipse(x, y, R0, R0 * (.4 + r() * .6), r() * 3, 0, TAU); c.fill(); z.fillStyle = G_(r() < .5 ? .3 + r() * .2 : .6 + r() * .4); z.beginPath(); z.ellipse(x, y, R0 * .8, R0 * .5, 0, 0, TAU); z.fill() }
      for (let k = 0; k < 300; k++) { const x = r() * w, y = r() * h; c.strokeStyle = `rgba(110,56,26,${.15 + r() * .25})`; c.lineWidth = 1 + r() * 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - .5) * 20, y + 10 + r() * 40); c.stroke() } });
    [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
  const M_HIERRO = new THREE.MeshStandardMaterial({ map: T_OX.c, bumpMap: T_OX.z, bumpScale: 3, roughness: .8, metalness: .55, envMapIntensity: .5 });
  const M_HIERRO_N = new THREE.MeshStandardMaterial({ color: "#5a504a", map: T_OX.c, bumpMap: T_OX.z, bumpScale: 2, roughness: .6, metalness: .75, envMapIntensity: .6 });
  const M_BRONCE_ROTO = new THREE.MeshStandardMaterial({ color: "#5a3c22", roughness: .6, metalness: .8, bumpMap: T_OX.z, bumpScale: 5, envMapIntensity: .35, side: THREE.DoubleSide });
  // eslabones: musgo arriba (según la normal del mundo); los de la cadena del este con las PISADAS pulidas (gastadas, brillantes)
  const matCadena = gastada => { const m = new THREE.MeshStandardMaterial({ map: T_OX.c, bumpMap: T_OX.z, bumpScale: 3.5, roughness: .82, metalness: .55, envMapIntensity: .55 });
    m.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vCbW; varying vec3 vCbN;").replace("#include <begin_vertex>", `#include <begin_vertex>
  #ifdef USE_INSTANCING
  vCbW = (modelMatrix * instanceMatrix * vec4(transformed, 1.)).xyz; vCbN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * objectNormal);
  #else
  vCbW = (modelMatrix * vec4(transformed, 1.)).xyz; vCbN = normalize(mat3(modelMatrix) * objectNormal);
  #endif`);
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", `#include <common>
varying vec3 vCbW; varying vec3 vCbN; float gM = 0., gP = 0.;
float cbH(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float cbN(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(cbH(i), cbH(i + vec2(1., 0.)), f.x), mix(cbH(i + vec2(0., 1.)), cbH(i + vec2(1., 1.)), f.x), f.y); }`).replace("#include <map_fragment>", `#include <map_fragment>
  { float n = cbN(vCbW.xz * .55 + vCbW.y * .37) * .6 + cbN(vCbW.xz * 2.1 - vCbW.y * 1.3) * .4; float up = vCbN.y;
    gM = smoothstep(.15, .7, up) * smoothstep(.38, .62, n) + smoothstep(-.2, -.6, up) * smoothstep(.6, .8, n) * .5;
    ${gastada ? `gP = smoothstep(.45, .85, up) * (1. - smoothstep(.62, .8, cbN(vCbW.xz * 1.7 + vCbW.y * .9))); gM *= 1. - smoothstep(0., .3, gP) * .9;
    float hu = smoothstep(.35, .5, cbN(vec2(vCbW.x * 3. + vCbW.y * 2.2, vCbW.z * 6.))) * gP;
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.78, .74, .68) * (.85 + .3 * hu), gP);` : ""}
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.13, .21, .06) * (.6 + .8 * n), gM * .92); }`)
        .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\n  roughnessFactor = mix(mix(roughnessFactor, 1., gM), .14, gP);").replace("#include <metalnessmap_fragment>", "#include <metalnessmap_fragment>\n  metalnessFactor = mix(mix(metalnessFactor, 0., gM), 1., gP);") };
    m.customProgramCacheKey = () => "cad" + gastada; return m };
  const M_CAD = matCadena(false), M_CAD_E = matCadena(true);
  const M_MADERA = (() => { const [c, z] = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(9811); c.fillStyle = "#5a4430"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
      for (let k = 0; k < 400; k++) { const y = r() * h; c.strokeStyle = r() < .5 ? `rgba(30,20,12,${.15 + r() * .3})` : `rgba(150,120,90,${.1 + r() * .2})`; c.lineWidth = .5 + r() * 2.5; c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= w; x += 32) c.lineTo(x, y + Math.sin(x * .02 + k) * 3); c.stroke(); z.strokeStyle = G_(.3 + r() * .5); z.lineWidth = 1 + r() * 2; z.beginPath(); z.moveTo(0, y); z.lineTo(w, y); z.stroke() }
      for (let k = 0; k < 14; k++) { const x = r() * w, y = r() * h; for (let a = 0; a < 5; a++) { c.strokeStyle = `rgba(30,18,10,${.5 - a * .08})`; c.lineWidth = 1.5; c.beginPath(); c.ellipse(x, y, 6 + a * 5, 3 + a * 2, 0, 0, TAU); c.stroke() } }
      for (let k = 0; k < 60; k++) { c.fillStyle = `rgba(220,190,120,${.2 + r() * .35})`; c.beginPath(); c.ellipse(r() * w, r() * h, 2 + r() * 9, 2 + r() * 6, r() * 3, 0, TAU); c.fill() } });   // gotas de cera vieja
    [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return new THREE.MeshStandardMaterial({ map: c, bumpMap: z, bumpScale: 2, roughness: .88 }) })();
  const M_CERA_V = new THREE.MeshStandardMaterial({ color: "#b89a5a", roughness: .42, metalness: 0, emissive: "#2a1a08", emissiveIntensity: .2 });   // cera vieja (carámbanos, velas)

  // ======================= EL CUERPO =======================
  const EXT = new THREE.Mesh(torno(PE, 1024, 2, false), M_BRONCE); EXT.name = "CAMPANA_EXT"; G.add(EXT);
  const INT = new THREE.Mesh(torno(PI_, 512, 2, true), M_BRONCE_IN); INT.name = "CAMPANA_INT"; G.add(INT);
  [EXT, INT].forEach(m => { m.castShadow = false; m.receiveShadow = false; m.frustumCulled = false });
  // el borde del agujero de la luna (un caño corto entre la tapa de afuera y el techo de adentro)
  { const g = new THREE.CylinderGeometry(R_HUECO, R_HUECO, 6, 32, 1, true); g.translate(HUECO[0], Y0 + H_TECHO + 1.6, HUECO[1]); G.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: "#3a2a1a", roughness: .7, metalness: .6, side: THREE.DoubleSide }))) }
  // las paredes de la GRIETA (de la cara de afuera a la de adentro, bordes rotos brillantes)
  { const NQ = 96, pos = [], idx = [];
    for (let k = 0; k <= NQ; k++) { const th = k / NQ * TAU, q = jag(th), dh = Math.sin(th) * GRIETA.hh * q, h = GRIETA.hc + dh, ro = rOut(h) + .9, ri = rIn(h) - .3, s = Math.cos(th) * GRIETA.hw * q;
      for (const rr of [ro, ri]) { const a = A_ENT + s / rr; pos.push(CX + rr * Math.cos(a), Y0 + h, CZ + rr * Math.sin(a)) }
      if (k) { const a = (k - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2) } }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    const uv = new Float32Array(pos.length / 3 * 2); for (let i = 0; i < uv.length / 2; i++) { uv[i * 2] = (i >> 1) / NQ * 4; uv[i * 2 + 1] = i & 1 } g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    G.add(new THREE.Mesh(g, M_BRONCE_ROTO)) }

  // ======================= LA CORONA: base fundida, dos argollas cruzadas y el grillete donde se enganchan las cuatro cadenas =======================
  const CORONA_G = new THREE.Group(); G.add(CORONA_G);
  { const L = lote(), yT = Y0 + HB;
    L.add(M_BRONCE_L, new THREE.CylinderGeometry(9.5, 12, 3.2, 64), TMx(CX, yT + 1.2, CZ)); L.add(M_BRONCE_L, new THREE.TorusGeometry(10.8, .7, 10, 64), TMx(CX, yT + .6, CZ, Math.PI / 2)); L.add(M_BRONCE_L, new THREE.TorusGeometry(9.3, .55, 10, 64), TMx(CX, yT + 2.8, CZ, Math.PI / 2));
    for (const a of [Math.PI / 4, -Math.PI / 4]) { L.add(M_BRONCE_L, new THREE.TorusGeometry(7.6, 2.1, 20, 64), TMx(CX, yT + 9.2, CZ, 0, a)); for (const s of [-1, 1]) L.add(M_BRONCE_L, new THREE.CylinderGeometry(2.6, 3.4, 3, 24), TMx(CX + s * 7.6 * Math.cos(a), yT + 3.5, CZ - s * 7.6 * Math.sin(a))) }
    L.add(M_HIERRO_N, new THREE.IcosahedronGeometry(3.4, 2), TMx(CX, CORONA[1] - .5, CZ, 0, 0, 0, 1, .8, 1)); L.add(M_HIERRO_N, new THREE.CylinderGeometry(.9, .9, 10, 16), TMx(CX, CORONA[1] - .5, CZ, 0, 0, Math.PI / 2));
    for (let k = 0; k < 24; k++) { const a = k / 24 * TAU; L.add(M_HIERRO_N, new THREE.CylinderGeometry(.42, .42, .5, 8), TMx(CX + Math.cos(a) * 10.6, yT + 2.85, CZ + Math.sin(a) * 10.6)) }
    L.fin(CORONA_G) }

  // ======================= LAS CUATRO CADENAS =======================
  // cada cadena es una polilínea de abajo (u = 0: la montaña / el risco) a arriba (u = 1: el grillete de la corona)
  const CAD = {};
  const hacerPoli = pts => { const P = pts.map(p => new THREE.Vector3(p[0], p[1], p[2])), L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + P[i].distanceTo(P[i - 1])); return { P, L, tot: L[L.length - 1] } };
  const enPoli = (C, s) => { s = cl(s, 0, C.tot); let i = 1; while (i < C.L.length - 1 && C.L[i] < s) i++; const a = C.P[i - 1], b = C.P[i], k = (s - C.L[i - 1]) / Math.max(1e-6, C.L[i] - C.L[i - 1]); return a.clone().lerp(b, cl(k)) };
  const tanPoli = (C, s) => { const a = enPoli(C, s - 1.5), b = enPoli(C, s + 1.5); return b.sub(a).normalize() };
  const SAG = 18;
  ["norte", "sur", "oeste"].forEach(n => { const M = MONTES[n], dx = M[0] - CX, dz = M[2] - CZ, dl = Math.hypot(dx, dz), top = [CX + dx / dl * 3.5, CORONA[1], CZ + dz / dl * 3.5], bot = [M[0] - dx / dl * 3, M[1] + 4, M[2] - dz / dl * 3], pts = [];
    for (let i = 0; i <= 240; i++) { const s = i / 240; pts.push([lerp(top[0], bot[0], s), lerp(top[1], bot[1], s) - 4 * SAG * s * (1 - s), lerp(top[2], bot[2], s)]) }
    CAD[n] = hacerPoli(pts.reverse()) });
  { // la del ESTE: del risco sube en curva hasta el labio, se apoya en el flanco (cuerda tensa por fuera de la cintura) y sobre el hombro hasta el grillete
    const e = [Math.cos(A_CAD_E), Math.sin(A_CAD_E)], W_ = (r, y) => [CX + e[0] * r, y, CZ + e[1] * r];
    const rA = Math.hypot(RISCO_E[0] - CX, RISCO_E[1] - CZ), yA = ALT_B(RISCO_E[0], RISCO_E[1]) + 4.2;
    const pts = [[rA, yA], [rA - 1.2, yA + 14], [rA - 3.2, yA + 38], [rA - 6.4, yA + 64], [rA - 11.6, yA + 88], [rOut(3.2) + 3.6, Y0 + 3.4]];
    const hS = 112, pS = PE.slice(I_FLANCO).find(p => p.h >= hS), cuer = [pS.r + pS.nr * 3.6, Y0 + pS.h + pS.nh * 3.6];
    for (let k = 1; k <= 6; k++) pts.push([lerp(rOut(3.2) + 3.6, cuer[0], k / 6), lerp(Y0 + 3.4, cuer[1], k / 6)]);
    PE.slice(I_FLANCO).filter(p => p.h > hS + 2 && p.r > 12).forEach((p, i) => { if (i % 4 === 0) pts.push([p.r + p.nr * 3.6, Y0 + p.h + p.nh * 3.6]) });
    pts.push([6, Y0 + HB + 6.5], [3.5, CORONA[1]]);
    const cu = new THREE.CatmullRomCurve3(pts.map(([r, y]) => new THREE.Vector3(...W_(r, y))), false, "centripetal");
    CAD.este = hacerPoli(cu.getSpacedPoints(600).map(v => [v.x, v.y, v.z])) }
  const U_LABIO_E = (() => { const C = CAD.este; for (let i = 0; i < C.P.length; i++) if (C.P[i].y >= Y0 + 3.4) return C.L[i] / C.tot; return .37 })();
  // cuánto le sobra a cada cadena lejana por encima del hombro (debug)
  const CLARO = {}; ["norte", "sur", "oeste"].forEach(n => { let mn = 1e9; CAD[n].P.forEach(p => { const d = Math.hypot(p.x - CX, p.z - CZ); if (d > 12 && d < 64) mn = Math.min(mn, p.y - (Y0 + hArriba(d))) }); CLARO[n] = +mn.toFixed(2) });
  // eslabón: estadio (dos rectas y dos medias vueltas) barrido con un círculo picado por el óxido. Largo total ≈ 10,6 m, ancho 5,8 m, barra de 0,95 m de radio.
  const ESL = { a: 2.4, b: 2.0, rb: .95, paso: 7.0 };
  const geoEslabon = (() => { const { a, b, rb } = ESL, NS = 64, NR = 14, Lp = 4 * a + TAU * b, pos = [], uv = [], idx = [], r = rng(9901);
    const cen = s => { s = ((s % Lp) + Lp) % Lp; if (s < 2 * a) return [b, -a + s, 1, 0]; s -= 2 * a; if (s < Math.PI * b) { const t = s / b; return [b * Math.cos(t), a + b * Math.sin(t), Math.cos(t), Math.sin(t)] } s -= Math.PI * b; if (s < 2 * a) return [-b, a - s, -1, 0]; s -= 2 * a; const t = Math.PI + s / b; return [b * Math.cos(t), -a + b * Math.sin(t), Math.cos(t), Math.sin(t)] };
    const pit = Array.from({ length: NS * NR }, () => 1 - (r() < .25 ? r() * .12 : 0));
    for (let i = 0; i <= NS; i++) { const [cx, cy, nx, ny] = cen(i / NS * Lp); for (let j = 0; j <= NR; j++) { const t = j / NR * TAU, k = pit[(i % NS) * NR + (j % NR)] * (1 + .04 * Math.sin(i * .7 + j)), ct = Math.cos(t), st = Math.sin(t);
        pos.push(cx + nx * ct * rb * k, cy + ny * ct * rb * k, st * rb * k); uv.push(i / NS * 11, j / NR * 3) } }
    for (let i = 0; i < NS; i++) for (let j = 0; j < NR; j++) { const p = i * (NR + 1) + j, q = p + NR + 1; idx.push(p, q, p + 1, p + 1, q, q + 1) }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g })();
  const ESLABONES = {};
  const _up = new THREE.Vector3(0, 1, 0), _m4 = new THREE.Matrix4();
  const marco = (C, s) => { const p = enPoli(C, s), T = tanPoli(C, s); let S = new THREE.Vector3().crossVectors(T, _up); if (S.lengthSq() < 1e-4) S.set(1, 0, 0); S.normalize(); const N = new THREE.Vector3().crossVectors(S, T).normalize(); return { p, T, S, N } };
  Object.entries(CAD).forEach(([n, C]) => { const L = [], r = rng(9910 + n.length); for (let s = ESL.paso * .55, i = 0; s < C.tot - 2; s += ESL.paso, i++) L.push([s, i]);
    const im = new THREE.InstancedMesh(geoEslabon, n === "este" ? M_CAD_E : M_CAD, L.length); im.name = "CADENA_" + n;
    const datos = L.map(([s, i]) => { const { p, T, S, N } = marco(C, s), rol = (i % 2 ? Math.PI / 2 : 0) + (r() - .5) * .12; const X = S.clone().multiplyScalar(Math.cos(rol)).addScaledVector(N, Math.sin(rol)), Z = new THREE.Vector3().crossVectors(X, T);
      _m4.makeBasis(X, T, Z).setPosition(p); return { s, i, m: _m4.clone(), p, T, plano: i % 2 } });
    datos.forEach((d, i) => im.setMatrixAt(i, d.m)); im.computeBoundingSphere(); im.frustumCulled = false; G.add(im); ESLABONES[n] = datos });
  const cadenaMarco = (n, u) => { const C = CAD[n]; if (!C) return null; const f = marco(C, cl(u) * C.tot); return { p: f.p.toArray(), t: f.T.toArray(), lado: f.S.toArray(), n: f.N.toArray() } };
  const PRIMER = ESLABONES.este[0].p.toArray();

  // anclas: el ojo de hierro abulonado en el risco del este y en las tres cimas
  { const L = lote(); const ancla = (n, esc = 1) => { const C = CAD[n], p = C.P[0], T = tanPoli(C, 0), ry = Math.atan2(T.x, T.z), y0 = n === "este" ? ALT_B(RISCO_E[0], RISCO_E[1]) : p.y - 5, cr = Math.cos(ry), sr = Math.sin(ry);
      L.add(M_HIERRO, new THREE.BoxGeometry(9 * esc, 2.2, 9 * esc), TMx(p.x, y0 + .6, p.z, 0, ry)); L.add(M_HIERRO_N, new THREE.BoxGeometry(4.5, p.y - y0 + 2.5, 2.4), TMx(p.x, (p.y + y0) / 2, p.z, 0, ry));
      L.add(M_HIERRO_N, new THREE.TorusGeometry(2.6, 1.05, 12, 32), TMx(p.x, p.y + .4, p.z, 0, ry + Math.PI / 2));
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if (i % 3 === 0 || j % 3 === 0) { const lx = (i - 1.5) * 2.4 * esc, lz = (j - 1.5) * 2.4 * esc; L.add(M_HIERRO_N, new THREE.CylinderGeometry(.35, .45, .7, 8), TMx(p.x + lx * cr + lz * sr, y0 + 1.9, p.z - lx * sr + lz * cr)) }
      if (n === "este") rectAdd({ x: p.x, z: p.z, w: 9.5, d: 9.5, ry }) };
    ["este", "norte", "sur", "oeste"].forEach(n => ancla(n, n === "este" ? 1 : 1.6)); L.fin(G).forEach(m => { m.castShadow = m.receiveShadow = true }) }
  // la tabla (puente de Sallow) de la cadena a la grieta, con soga de baranda
  { const L = lote(), C = CAD.este, s0 = (() => { for (let i = 0; i < C.P.length; i++) if (C.P[i].y >= Y0 + 9.5) return C.L[i]; return 0 })(), pc = enPoli(C, s0), pg = new THREE.Vector3(...polar(rOut(8.2) + .4, 8.2, A_ENT));
    pc.y = Y0 + 8.2; const d = pg.clone().sub(pc), len = d.length(), mid = pc.clone().add(pg).multiplyScalar(.5), ry = Math.atan2(d.x, d.z);
    L.add(M_MADERA, new THREE.BoxGeometry(.9, .16, len + 1.2), TMx(mid.x, mid.y, mid.z, 0, ry)); for (let k = 0; k < 6; k++) L.add(M_MADERA, new THREE.BoxGeometry(1, .08, .14), TMx(lerp(pc.x, pg.x, k / 5), mid.y - .12, lerp(pc.z, pg.z, k / 5), 0, ry));
    const sog = new THREE.MeshStandardMaterial({ color: "#7a6448", roughness: .95 }); for (const s of [-1, 1]) { const ox = Math.cos(ry) * .5 * s, oz = -Math.sin(ry) * .5 * s; L.add(sog, new THREE.CylinderGeometry(.035, .035, len, 6), TMx(mid.x + ox, mid.y + 1.05, mid.z + oz, Math.PI / 2, ry)); for (const k of [0, 1]) L.add(M_MADERA, new THREE.BoxGeometry(.08, 1.1, .08), TMx(lerp(pc.x, pg.x, k) + ox, mid.y + .5, lerp(pc.z, pg.z, k) + oz)) }
    L.fin(G) }

  // ======================= EL INTERIOR =======================
  const IN = new THREE.Group(); IN.name = "CAMPANA_DENTRO"; G.add(IN);
  // costillas de fundición (32 meridianos) y anillos
  { const L = []; for (let k = 0; k < 32; k++) { const a = k / 32 * TAU, pts = []; for (let h = 9; h <= H_TECHO - 8; h += 3) pts.push(new THREE.Vector3(...polar(rIn(h) - .25, h, a))); L.push([new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, .55, 6, false), null]) }
    for (const h of [30, 60, 90, 115]) { const g = new THREE.TorusGeometry(rIn(h) - .3, .6, 6, 256); g.rotateX(Math.PI / 2); g.translate(CX, Y0 + h, CZ); L.push([g, null]) }
    IN.add(new THREE.Mesh(mergeGeo(L), new THREE.MeshStandardMaterial({ color: "#4a3420", map: T_LISO, roughness: .55, metalness: .8, envMapIntensity: .4 }))) }
  // el GANCHO del badajo: roto y vacío (no hay badajo)
  const GANCHO = (() => { const yT = Y0 + H_TECHO, L = lote();
    L.add(M_HIERRO_N, new THREE.CylinderGeometry(3.2, 4.2, 2.2, 24), TMx(CX, yT - 1, CZ)); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; L.add(M_HIERRO_N, new THREE.CylinderGeometry(.35, .35, .6, 8), TMx(CX + Math.cos(a) * 3.5, yT - 2.2, CZ + Math.sin(a) * 3.5)) }
    const pts = [[0, -1.5], [0, -5], [0, -7.5]]; for (let k = 0; k <= 10; k++) { const t = Math.PI + k / 10 * Math.PI * .78; pts.push([2.4 + Math.cos(t) * 2.4, -7.5 - Math.sin(t) * 2.4]) }
    const cu = new THREE.CatmullRomCurve3(pts.map(([x, y]) => new THREE.Vector3(CX + x, yT + y, CZ)));
    L.add(M_HIERRO_N, new THREE.TubeGeometry(cu, 50, .85, 12, false), null);
    // la punta partida (dentada) y un pedazo de la anilla del badajo, retorcido; un jirón de cuero
    const fin = cu.getPoint(1), ft = cu.getTangent(1), shard = new THREE.ConeGeometry(.95, 1.4, 7, 1); shard.translate(0, .5, 0);
    L.add(M_HIERRO_N, shard, new THREE.Matrix4().compose(fin, new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), ft), new THREE.Vector3(1, .6, 1.2)));
    L.add(M_HIERRO_N, new THREE.TorusGeometry(1.6, .45, 8, 20, Math.PI * 1.1), TMx(CX + 2.8, yT - 11.6, CZ + .5, .9, .4, 2.1));
    L.add(new THREE.MeshStandardMaterial({ color: "#3a2a1c", roughness: .9 }), new THREE.BoxGeometry(.5, 4.5, .12), TMx(CX - .4, yT - 9.6, CZ + .3, .1, .3, .15));
    L.fin(IN); return [CX + 2.4, yT - 9.9, CZ] })();
  // la PLATAFORMA de madera colgada cerca del labio (local: x = radial hacia la pared, z = a lo largo del borde)
  const PLAT = new THREE.Group(); PLAT.name = "PLATAFORMA"; IN.add(PLAT);
  const P_H = 7.0;
  { const p = polar(80.5, P_H, A_ENT); PLAT.position.set(p[0], p[1], p[2]); PLAT.rotation.y = -A_ENT }
  { const L = lote(), r = rng(9931), sog = new THREE.MeshStandardMaterial({ color: "#6a5640", roughness: .95 });
    for (let z = -4.8; z < 4.8; z += .3) { const x0 = -6.5 + r() * .25, x1 = 6.3 - r() * .2; L.add(M_MADERA, new THREE.BoxGeometry(x1 - x0, .1, .27), TMx((x0 + x1) / 2, .2 + (r() - .5) * .02, z + .15, (r() - .5) * .01, (r() - .5) * .02)) }
    for (const x of [-6, -3, 0, 3, 6]) L.add(M_MADERA, new THREE.BoxGeometry(.28, .32, 10), TMx(x, 0, 0));
    L.add(M_MADERA, new THREE.BoxGeometry(.4, .9, 10.4), TMx(4.6, -.55, 0));
    for (const z of [-4.9, 4.9]) L.add(M_MADERA, new THREE.BoxGeometry(13, .3, .3), TMx(-.1, 0, z));
    for (let z = -4.6; z <= 4.7; z += 1.55) { const roto = z > 1 && z < 2.6; L.add(M_MADERA, new THREE.BoxGeometry(.14, 1.15, .14), TMx(-6.35, .8, z, 0, 0, roto ? .5 : 0)) }
    L.add(M_MADERA, new THREE.BoxGeometry(.12, .12, 6), TMx(-6.35, 1.35, -1.8)); L.add(M_MADERA, new THREE.BoxGeometry(.12, .12, 2.4), TMx(-6.35, 1.35, 3.6, .2));
    // tirantes: cadenas chicas desde pernos en la pared (que se inclina encima) a las esquinas de adentro
    const pern = [[1.4, 17, -4.4], [1.4, 17, 4.4]], esq = [[-6.2, .25, -4.4], [-6.2, .25, 4.4]];
    pern.forEach((pp, i) => { const a = new THREE.Vector3(...pp), b = new THREE.Vector3(...esq[i]), d = b.clone().sub(a), n = Math.floor(d.length() / .62), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
      for (let k = 0; k <= n; k++) { const c = a.clone().lerp(b, k / n), qq = q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), k % 2 ? Math.PI / 2 : 0)); L.add(M_HIERRO_N, new THREE.TorusGeometry(.26, .07, 6, 12).scale(1, 1.6, 1), new THREE.Matrix4().compose(c, qq, new THREE.Vector3(1, 1, 1))) }
      L.add(M_HIERRO_N, new THREE.CylinderGeometry(.18, .18, 2.2, 8), TMx(pp[0] + .9, pp[1], pp[2], 0, 0, Math.PI / 2)); L.add(M_HIERRO_N, new THREE.BoxGeometry(.2, 1.2, 1.2), TMx(pp[0] + 1.9, pp[1], pp[2])) });
    // cosas de Sallow: cajón, rollo de soga, balde, banquito, farol apagado, cabos de vela con charcos de cera
    L.add(M_MADERA, new THREE.BoxGeometry(1.3, .8, .9), TMx(3.6, .65, -3.6, 0, .2)); L.add(M_MADERA, new THREE.BoxGeometry(1.36, .08, .96), TMx(3.6, 1.06, -3.6, 0, .2));
    for (let k = 0; k < 5; k++) L.add(sog, new THREE.TorusGeometry(.5 - k * .03, .07, 6, 18), TMx(4.2, .32 + k * .1, 3.4, Math.PI / 2));
    L.add(M_HIERRO_N, new THREE.CylinderGeometry(.32, .26, .55, 12, 1, true), TMx(2.6, .52, 3.9)); L.add(M_MADERA, new THREE.CylinderGeometry(.3, .3, .06, 12), TMx(-1.5, .7, -4)); for (let k = 0; k < 3; k++) L.add(M_MADERA, new THREE.BoxGeometry(.06, .5, .06), TMx(-1.5 + Math.cos(k * 2.1) * .22, .45, -4 + Math.sin(k * 2.1) * .22));
    L.add(M_HIERRO_N, new THREE.BoxGeometry(.4, .55, .4), TMx(1.6, 4.3, -4.4)); L.add(new THREE.MeshStandardMaterial({ color: "#1a1612", roughness: .2, metalness: .2 }), new THREE.BoxGeometry(.32, .4, .32), TMx(1.6, 4.3, -4.4)); L.add(M_HIERRO_N, new THREE.CylinderGeometry(.03, .03, 1.2, 4), TMx(1.6, 5.1, -4.4));
    for (let k = 0; k < 9; k++) { const x = 1 + r() * 4.5, z = -4.4 + r() * 8.6, hv = .15 + r() * .35; L.add(M_CERA_V, new THREE.CylinderGeometry(.07, .08, hv, 8), TMx(x, .25 + hv / 2, z)); L.add(M_CERA_V, new THREE.CylinderGeometry(.18 + r() * .2, .2 + r() * .22, .03, 10), TMx(x, .26, z)) }
    L.fin(PLAT).forEach(m => { m.castShadow = m.receiveShadow = true }) }
  // polvo suspendido (brilla en el rayo de luna; vibra con el zumbido; salta con el golpe)
  const HUECO_W = [HUECO[0], Y0 + H_TECHO + 1, HUECO[1]], PLAT_W = polar(80.5, P_H + .25, A_ENT);
  const RAYO = { a: new THREE.Vector3(...HUECO_W), b: new THREE.Vector3(...polar(79.5, P_H, A_ENT)), r0: R_HUECO * .95, r1: 5.2 };
  const PU = { uT: { value: 0 }, uZ: { value: 0 }, uG: { value: 0 }, uGt: { value: 10 }, uA: { value: 1 }, uScale: { value: 1000 }, uBA: { value: RAYO.a }, uBB: { value: RAYO.b }, uR0: { value: RAYO.r0 }, uR1: { value: RAYO.r1 }, uCol: { value: new THREE.Color("#ffe8c8") }, uRay: { value: 1 } };
  const POLVO = (() => { const N = 14000, r = rng(9941), pos = new Float32Array(N * 3), aR = new Float32Array(N * 4);
    for (let i = 0; i < N; i++) { let p; if (i < 5000) { const s = r(), q = RAYO.a.clone().lerp(RAYO.b, s), rr = lerp(RAYO.r0, RAYO.r1, s) * Math.sqrt(r()) * 1.2, a = r() * TAU; p = [q.x + Math.cos(a) * rr, q.y + (r() - .5) * 2, q.z + Math.sin(a) * rr] }
      else { const h = lerp(2, H_TECHO - 4, Math.pow(r(), 1.4)), rr = rIn(h) * Math.sqrt(r()) * .96, a = r() * TAU; p = polar(rr, h, a) }
      pos.set(p, i * 3); aR.set([r(), r(), r(), r()], i * 4) }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("aR", new THREE.BufferAttribute(aR, 4));
    const m = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms: PU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute vec4 aR; uniform float uT, uZ, uG, uGt, uA, uScale, uR0, uR1, uRay; uniform vec3 uBA, uBB; varying float vB;
void main(){ vec3 p = position;
  p += vec3(sin(uT * .13 + aR.x * 30.), sin(uT * .09 + aR.y * 20.) * .6, cos(uT * .11 + aR.z * 25.)) * (.6 + aR.w * 1.6);
  p += vec3(sin(uT * 61. + aR.x * 90.), sin(uT * 53. + aR.y * 70.), sin(uT * 67. + aR.z * 80.)) * uZ * (.04 + .12 * aR.w);
  float gk = uG * exp(-uGt * 1.3) * (1. - exp(-uGt * 14.)); vec2 ax = p.xz - vec2(${CX.toFixed(2)}, ${CZ.toFixed(2)}); p.y += gk * (1.5 + 5. * aR.x); p.xz -= normalize(ax + 1e-3) * gk * (1. + 3. * aR.y);
  vec4 mv = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mv;
  vec3 ab = uBB - uBA; float s = clamp(dot(p - uBA, ab) / dot(ab, ab), 0., 1.); float d = length(p - (uBA + ab * s)), rb = mix(uR0, uR1, s);
  float inB = (1. - smoothstep(rb * .55, rb * 1.05, d)) * uRay;
  vB = (.012 + inB * (1.2 + .6 * sin(uT * 1.7 + aR.x * 40.)) + gk * .3 + uZ * .02) * uA;
  gl_PointSize = clamp(uScale * (.018 + .04 * aR.w) / -mv.z, 1., 9.); }`,
      fragmentShader: `uniform vec3 uCol; varying float vB; void main(){ vec2 q = gl_PointCoord - .5; float a = 1. - smoothstep(.15, .5, length(q)); gl_FragColor = vec4(uCol * vB * a, 1.); }` }));
    m.frustumCulled = false; IN.add(m); return m })();
  // el RAYO de luna (cono de luz con motas) y su luz
  const HAZ = (() => { const len = RAYO.a.distanceTo(RAYO.b) + 2, g = new THREE.CylinderGeometry(RAYO.r0, RAYO.r1 * 1.05, len, 48, 24, true); g.translate(0, -len / 2, 0);
    const m = new THREE.Mesh(g, new THREE.ShaderMaterial({ uniforms: { uA: { value: .5 }, uT: PU.uT, uCol: { value: new THREE.Color("#cfe0ff") } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      vertexShader: `varying vec3 vN, vV; varying float vY; varying vec2 vUv; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.); vV = -mv.xyz; vN = normalMatrix * normal; vY = uv.y; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform float uA, uT; uniform vec3 uCol; varying vec3 vN, vV; varying float vY; varying vec2 vUv;
void main(){ float f = abs(dot(normalize(vN), normalize(vV))); float st = .7 + .3 * sin(vUv.x * 60. + sin(vUv.x * 17.) * 3.) * sin(vUv.y * 9. - uT * .3);
  float a = pow(f, 1.6) * st * smoothstep(0., .15, vY) * (.35 + .65 * vY) * uA; gl_FragColor = vec4(uCol * a, 1.); }` }));
    m.position.copy(RAYO.a); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), RAYO.b.clone().sub(RAYO.a).normalize()); m.frustumCulled = false; IN.add(m); return m })();
  const LUNA_SPOT = new THREE.SpotLight("#b8ccff", 0, 0, Math.atan(RAYO.r1 / RAYO.a.distanceTo(RAYO.b)) * 1.25, .55, 0); LUNA_SPOT.position.copy(RAYO.a); LUNA_SPOT.target.position.copy(RAYO.b); scene.add(LUNA_SPOT, LUNA_SPOT.target);
  // la CERA: anillo que llena la canaleta del labio desde el punto donde se vuelca (u 0 → 1 da toda la vuelta), el chorro y el vapor
  const A_VUELCA = A_ENT + 5.6 / 86;                                   // al costado de la plataforma
  const CU = { uFill: { value: 0 }, uA0: { value: A_VUELCA }, uCalor: { value: 1 }, uT: PU.uT };
  const CERA = (() => { const sec = [[85.42, 6.02], [85.65, 5.3], [85.92, 4.62], [86.3, 4.26], [86.8, 4.36], [87.02, 5.2], [87.12, 6.06], [86.7, 6.24], [86.1, 6.24], [85.42, 6.02]], P = sec.map(([r, h], i) => { const a = sec[(i + sec.length - 2) % (sec.length - 1)], b = sec[(i + 1) % (sec.length - 1)], tr = b[0] - a[0], th = b[1] - a[1], l = Math.hypot(tr, th) || 1; return { r, h, v: i / (sec.length - 1), nr: th / l, nh: -tr / l } });
    const m = new THREE.Mesh(torno(P, 720, 40, false), new THREE.MeshStandardMaterial({ color: "#d9a040", roughness: .22, metalness: 0, emissive: "#ff7a1a", emissiveIntensity: 1, side: THREE.DoubleSide }));
    m.material.onBeforeCompile = sh => { Object.assign(sh.uniforms, CU); sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nuniform float uFill, uA0; varying float vDa; varying float vHh;").replace("#include <begin_vertex>", `#include <begin_vertex>
  { vec2 d = transformed.xz - vec2(${CX.toFixed(2)}, ${CZ.toFixed(2)}); float a = atan(d.y, d.x) - uA0; a -= 6.2831853 * floor((a + 3.1415927) / 6.2831853); vDa = abs(a) / 3.1415927;
    float fr = uFill - vDa, k = smoothstep(-.002, .06, fr); transformed.y = ${(Y0 + 4.3).toFixed(2)} + (transformed.y - ${(Y0 + 4.3).toFixed(2)}) * k; vHh = transformed.y - ${Y0.toFixed(2)}; }`);
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nuniform float uFill, uCalor, uT; varying float vDa; varying float vHh;").replace("#include <clipping_planes_fragment>", "#include <clipping_planes_fragment>\n  if (vDa > uFill + .001) discard;")
        .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
  { float fr = uFill - vDa; float hot = uCalor * (.35 + .65 * (1. - smoothstep(0., .25, fr))) * (.85 + .15 * sin(uT * 3. + vDa * 60.)); totalEmissiveRadiance *= hot; diffuseColor.rgb *= .8 + .4 * smoothstep(5.6, 6.2, vHh); }`) };
    m.material.customProgramCacheKey = () => "cera"; m.visible = false; m.frustumCulled = false; IN.add(m); return m })();
  const CHORRO = (() => { const top = new THREE.Vector3(...polar(84.6, P_H + 2.1, A_VUELCA - .012)), bot = new THREE.Vector3(...polar(86.2, 5.4, A_VUELCA + .004));
    const cu = new THREE.QuadraticBezierCurve3(top, top.clone().lerp(bot, .5).add(new THREE.Vector3(0, .5, 0)), bot), g = new THREE.TubeGeometry(cu, 24, .16, 10, false);
    const tx = tex(64, 256, (g2, w, h) => { const r = rng(9951); g2.fillStyle = "#c08030"; g2.fillRect(0, 0, w, h); for (let k = 0; k < 60; k++) { g2.fillStyle = `rgba(255,${200 + r() * 55 | 0},120,${.3 + r() * .5})`; g2.fillRect(r() * w, r() * h, 2 + r() * 8, 10 + r() * 50) } }); tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: "#e0a848", emissive: "#ff9a30", emissiveMap: tx, map: tx, emissiveIntensity: 1.6, roughness: .2 })); m.visible = false; IN.add(m); return { m, tx, top } })();
  const VAPOR = (() => { const N = 2600, r = rng(9961), aR = new Float32Array(N * 4), pos = new Float32Array(N * 3); for (let i = 0; i < N; i++) aR.set([r(), r(), r(), r()], i * 4);
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("aR", new THREE.BufferAttribute(aR, 4));
    const m = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms: Object.assign({ uScale: PU.uScale, uCol: { value: new THREE.Color("#e8dccb") } }, CU), transparent: true, depthWrite: false,
      vertexShader: `attribute vec4 aR; uniform float uFill, uA0, uCalor, uT, uScale; varying float vA;
void main(){ float side = aR.x < .5 ? -1. : 1.; float a = uA0 + side * aR.y * uFill * 3.1415927; float life = fract(uT * (.18 + .2 * aR.z) + aR.w); float rr = 86.2 - life * 3. * aR.z;
  vec3 p = vec3(${CX.toFixed(2)} + cos(a) * rr, ${(Y0 + 6.1).toFixed(2)} + life * (4. + 7. * aR.w), ${CZ.toFixed(2)} + sin(a) * rr); p.x += sin(uT * .7 + aR.x * 20.) * life * 1.2; p.z += cos(uT * .6 + aR.y * 20.) * life * 1.2;
  vec4 mv = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mv; vA = uCalor * step(.001, uFill) * sin(3.1415927 * life) * .045 * (.4 + .6 * (1. - aR.y));
  gl_PointSize = clamp(uScale * (.25 + .9 * life) / -mv.z, 1., 60.); }`,
      fragmentShader: `uniform vec3 uCol; varying float vA; void main(){ float d = length(gl_PointCoord - .5); float a = (1. - smoothstep(.1, .5, d)) * vA; gl_FragColor = vec4(uCol, a); }` }));
    m.frustumCulled = false; m.visible = false; IN.add(m); return m })();

  // ======================= MUSGO COLGANDO DEL LABIO, CARÁMBANOS DE CERA VIEJA, NIDOS Y PÁJAROS =======================
  const T_MUSGO = tex(128, 512, (g, w, h) => { const r = rng(9971); g.clearRect(0, 0, w, h); for (let k = 0; k < 34; k++) { let x = r() * w, y = 0; const L = h * (.3 + r() * .7); g.strokeStyle = `rgb(${40 + r() * 40 | 0},${55 + r() * 45 | 0},${20 + r() * 20 | 0})`; g.lineWidth = 1 + r() * 2.2; g.beginPath(); g.moveTo(x, y); while (y < L) { y += 8 + r() * 14; x += (r() - .5) * 7; g.lineTo(x, y) } g.stroke() } g.fillStyle = "rgb(50,62,26)"; g.fillRect(0, 0, w, 6) });
  const M_MUSGO = new THREE.MeshStandardMaterial({ map: T_MUSGO, alphaTest: .4, side: THREE.DoubleSide, roughness: .95 });
  const geoMechon = (() => { const a = new THREE.PlaneGeometry(1, 1); a.translate(0, -.5, 0); const b = a.clone(); b.rotateY(Math.PI / 2); return mergeGeo([[a, null], [b, null]]) })();
  const MUSGO = (() => { const L = [], r = rng(9972);
    for (let k = 0; k < 2600; k++) { const a = r() * TAU; if (fbm(Math.cos(a) * 3 + 5, Math.sin(a) * 3, 3) < .42 && r() < .7) continue; const lado = r() < .75, rr = lado ? lerp(93.6, 95.7, r()) : lerp(84.8, 86.4, r()), hh = lado ? lerp(.2, 2.6, r()) : lerp(-.3, .8, r()); L.push([polar(rr, hh, a), a, .5 + r() * 1.6, 1 + r() * r() * 7]) }
    Object.values(ESLABONES).forEach(D => D.forEach(d => { if (r() < .5) { const nq = 1 + (r() * 3 | 0); for (let q = 0; q < nq; q++) L.push([[d.p.x + (r() - .5) * 3, d.p.y - 1.8 - r(), d.p.z + (r() - .5) * 3], r() * TAU, .5 + r(), 1 + r() * 4]) } }));
    const m = new THREE.InstancedMesh(geoMechon, M_MUSGO, L.length); L.forEach(([p, a, w, hh], i) => { dummy.position.set(...p); dummy.rotation.set((r() - .5) * .1, a, (r() - .5) * .1); dummy.scale.set(w, hh, w); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix) }); m.frustumCulled = false; G.add(m); return m })();
  const CARAMBANOS = (() => { const pts = []; for (let k = 0; k <= 8; k++) { const t = k / 8; pts.push(new THREE.Vector2(.5 * Math.pow(1 - t, 1.4) * (1 + .15 * Math.sin(t * 19)) + .001, -t)) } const g = new THREE.LatheGeometry(pts, 7);
    const L = [], r = rng(9973); for (let k = 0; k < 1300; k++) { const a = r() * TAU, este = Math.cos(a - A_CAD_E), dens = .25 + .75 * sst(-.2, .9, este) + .4 * fbm(Math.cos(a) * 4, Math.sin(a) * 4, 2); if (r() > dens) continue;
      const fuera = r() < .55, rr = fuera ? lerp(92.6, 95.3, r()) : lerp(84.9, 86.3, r()), hh = fuera ? (rr > 94 ? .6 : -.25) : -.2; L.push([polar(rr, hh, a), .22 + r() * .7, .4 + r() * r() * 4]) }
    const m = new THREE.InstancedMesh(g, M_CERA_V, L.length); L.forEach(([p, w, l], i) => { dummy.position.set(...p); dummy.rotation.set((r() - .5) * .08, r() * 6, (r() - .5) * .08); dummy.scale.set(w, l, w); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix) }); m.frustumCulled = false; G.add(m); return m })();
  const NIDOS = (() => { const r = rng(9974), L = [];
    for (let k = 0; k < 70; k++) { const a = r() * Math.PI * 1.1, lo = .55 + r() * .35, hi = .6 + r() * .5; L.push([new THREE.CylinderGeometry(.03, .04, 1, 3), TMx(Math.cos(a * 6 + k) * lo, .25 + r() * .3, Math.sin(a * 6 + k) * lo, (r() - .5) * .7 + Math.PI / 2, a * 6 + k, 0, 1, hi, 1)]) }
    L.push([new THREE.CylinderGeometry(.75, .45, .3, 10), TMx(0, .2, 0)]); for (let k = 0; k < 3; k++) L.push([new THREE.SphereGeometry(.12, 8, 6).scale(1, 1.3, 1), TMx((r() - .5) * .4, .42, (r() - .5) * .4)]);
    const g = mergeGeo(L), P = g.attributes.position, col = new Float32Array(P.count * 3); for (let i = 0; i < P.count; i++) { const egg = P.getY(i) > .3 && Math.hypot(P.getX(i), P.getZ(i)) < .35; col.set(egg ? [.85, .84, .78] : [.32 + r() * .14, .24 + r() * .1, .14 + r() * .06], i * 3) } g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const pos = []; for (let k = 0; k < 22; k++) { const rr = lerp(16, 46, r()), a = r() * TAU; pos.push([...polar(rr, hArriba(rr) + .2, a), 1.4 + r() * 1.4]) }
    for (let k = 0; k < 16; k++) { const a = r() * TAU, hh = [101.6, 112.2, 120.4, 88.5][k % 4]; pos.push([...polar(rOut(hh) + 1.1, hh + .35, a), 1.2 + r()]) }
    ["norte", "sur", "oeste"].forEach(n => ESLABONES[n].slice(-9, -1).forEach(d => { if (r() < .55) pos.push([d.p.x, d.p.y + 1.3, d.p.z, 1.3 + r()]) }));
    const m = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .95 }), pos.length); pos.forEach(([x, y, z, s], i) => { dummy.position.set(x, y, z); dummy.rotation.set(0, r() * 6, 0); dummy.scale.setScalar(s); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix) }); m.frustumCulled = false; G.add(m); return { m, pos } })();
  const AVES = (() => { const N = 90, r = rng(9975), L = [];
    for (let i = 0; i < N; i++) { const bajo = i < 22; L.push({ rr: bajo ? lerp(104, 150, r()) : lerp(78, 170, r()), h: bajo ? lerp(-25, 25, r()) : lerp(95, 175, r()), w: (.08 + r() * .14) * (r() < .5 ? 1 : -1), f: r() * TAU, b: r() * TAU, s: .8 + r() * .6 }) }
    const body = new THREE.ConeGeometry(.14, .9, 5); body.rotateX(Math.PI / 2); const ala = new THREE.BufferGeometry(); ala.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, .25, 0, 0, -.2, .75, 0, -.05, 0, 0, .25, -.75, 0, -.05, 0, 0, -.2], 3)); ala.computeVertexNormals();
    const g = mergeGeo([[body, null], [ala, null]]), ph = new Float32Array(N); L.forEach((b, i) => ph[i] = b.f); g.setAttribute("aF", new THREE.InstancedBufferAttribute(ph, 1));
    const mat = new THREE.MeshStandardMaterial({ color: "#16161a", roughness: .8, side: THREE.DoubleSide }); mat.onBeforeCompile = sh => { sh.uniforms.uT = U.uT; sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nattribute float aF; uniform float uT;").replace("#include <begin_vertex>", "#include <begin_vertex>\n  { float ax = abs(transformed.x); transformed.y += sin(uT * 7. + aF) * ax * ax * 1.1; }") }; mat.customProgramCacheKey = () => "ave";
    const m = new THREE.InstancedMesh(g, mat, N); m.frustumCulled = false; G.add(m); return { m, L } })();
  const aves = t => { const { m, L } = AVES; L.forEach((b, i) => { const a = b.b + t * b.w, x = CX + Math.cos(a) * b.rr, z = CZ + Math.sin(a) * b.rr, y = Y0 + b.h + Math.sin(t * .5 + b.f) * 4;
      dummy.position.set(x, y, z); dummy.rotation.set(Math.sin(t * .8 + b.f) * .1, b.w > 0 ? -a : Math.PI - a, (b.w > 0 ? -1 : 1) * .35, "YXZ"); dummy.scale.setScalar(b.s * 1.8); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix) }); m.instanceMatrix.needsUpdate = true };

  // ======================= LA SOMBRA: la campana y las cadenas tapan al sol (o a la luna) en TODOS los materiales =======================
  { const N = 32, arr = []; for (let i = 0; i <= N; i++) arr.push(rOut(i / N * HB).toFixed(2));
    const segs = []; ["norte", "sur", "oeste"].forEach(n => { const C = CAD[n]; for (let k = 0; k < 6; k++) segs.push([enPoli(C, C.tot * k / 6), enPoli(C, C.tot * (k + 1) / 6)]) });
    { const C = CAD.este, sL = U_LABIO_E * C.tot; for (let k = 0; k < 3; k++) segs.push([enPoli(C, sL * k / 3), enPoli(C, sL * (k + 1) / 3)]) }
    const v3 = v => `vec3(${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)})`;
    const GL = `
const float CB_R[33] = float[33](${arr.join(", ")});
float cbRad(float h){ float x = clamp(h / ${HB.toFixed(2)}, 0., 1.) * 32.; float fi = min(floor(x), 31.); int i = int(fi); return mix(CB_R[i], CB_R[i + 1], x - fi); }
float cbSeg(vec3 p, vec3 d, vec3 a, vec3 b, float r){ vec3 u = b - a, w = p - a; float uu = dot(u, u), ud = dot(u, d), uw = dot(u, w), dw = dot(d, w);
  float s = clamp((uw - dw * ud) / max(uu - ud * ud, 1e-3), 0., 1.); float t = max(s * ud - dw, 0.); s = clamp(dot(w + d * t, u) / uu, 0., 1.);
  float dist = length(w + d * t - u * s); float pen = .5 + t * .006; return (1. - smoothstep(r - pen, r + pen, dist)) * step(.5, t); }
float cbSombra(vec3 pv, vec3 dv){ mat3 iv = transpose(mat3(viewMatrix)); vec3 p = cameraPosition + iv * pv, d = normalize(iv * dv); if (d.y < .015) return 1.;
  float occ = 0.; vec2 o = p.xz - vec2(${CX.toFixed(2)}, ${CZ.toFixed(2)}), dh = d.xz; float t0 = max((${Y0.toFixed(2)} - p.y) / d.y, 0.), t1 = (${(Y0 + HB).toFixed(2)} - p.y) / d.y;
  float A = dot(dh, dh), B = dot(o, dh), Cc = dot(o, o) - ${((CAMPANA_R + 3) ** 2).toFixed(1)};
  if (A > 1e-5) { float D = B * B - A * Cc; if (D < 0.) t1 = -1.; else { float sq = sqrt(D); t0 = max(t0, (-B - sq) / A); t1 = min(t1, (-B + sq) / A); } } else if (Cc > 0.) t1 = -1.;
  if (t1 > t0) { for (int i = 0; i < 22; i++) { float t = mix(t0, t1, (float(i) + .5) / 22.); vec3 q = p + d * t; float r = cbRad(q.y - ${Y0.toFixed(2)}) - .9, dist = length(q.xz - vec2(${CX.toFixed(2)}, ${CZ.toFixed(2)})), pen = .7 + t * .0045; occ = max(occ, 1. - smoothstep(r - pen, r + pen, dist)); } }
  ${segs.map(([a, b]) => `occ = max(occ, cbSeg(p, d, ${v3(a)}, ${v3(b)}, 2.3));`).join("\n  ")}
  return 1. - occ * .97; }
`;
    THREE.ShaderChunk.lights_pars_begin = THREE.ShaderChunk.lights_pars_begin + GL;
    const A0 = "getDirectionalLightInfo( directionalLight, directLight );";
    if (THREE.ShaderChunk.lights_fragment_begin.includes(A0)) THREE.ShaderChunk.lights_fragment_begin = THREE.ShaderChunk.lights_fragment_begin.replace(A0, A0 + "\n\t\tdirectLight.color *= cbSombra( - vViewPosition, directionalLight.direction );");
    else console.error("campana: no encontré la luz direccional en el shader (la sombra de la campana no va a andar)") }

  // ======================= ESTADO, CLIMA Y POR CUADRO =======================
  const ST = { cera: 0, calor: 1, golpe: null, zumb: 0, nubes: false, temblor: 0, solDir: null };
  const reset = () => { ST.cera = 0; ST.calor = 1; ST.golpe = null; ST.zumb = 0; ST.nubes = false; ST.temblor = 0 };
  // mapas de entorno por clima (para que el metal tenga qué reflejar)
  const ENVMAPS = {};
  const envMapa = (k, top, hor, gnd, sol, solCol, solI) => { if (ENVMAPS[k]) return ENVMAPS[k]; const es = new THREE.Scene();
    es.add(new THREE.Mesh(new THREE.SphereGeometry(50, 48, 24), new THREE.ShaderMaterial({ side: THREE.BackSide, uniforms: { t: { value: new THREE.Color(top) }, h: { value: new THREE.Color(hor) }, g: { value: new THREE.Color(gnd) }, s: { value: new THREE.Vector3(...sol).normalize() }, sc: { value: new THREE.Color(solCol) }, si: { value: solI } },
      vertexShader: "varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",
      fragmentShader: "uniform vec3 t, h, g, s, sc; uniform float si; varying vec3 vD; void main(){ float y = vD.y; vec3 c = y > 0. ? mix(h, t, pow(smoothstep(0., .8, y), .6)) : mix(h, g, smoothstep(0., -.25, y)); float d = max(dot(vD, s), 0.); c += sc * si * (pow(d, 24.) * 2. + pow(d, 4.) * .3); gl_FragColor = vec4(c, 1.); }" })));
    const pm = new THREE.PMREMGenerator(R), rt = pm.fromScene(es, 0, .1, 100); pm.dispose(); return ENVMAPS[k] = rt.texture };
  const MATS_ENV = [[M_BRONCE, 1], [M_BRONCE_IN, .4], [M_BRONCE_L, 1], [M_BRONCE_ROTO, .7], [M_HIERRO, .5], [M_HIERRO_N, .6], [M_CAD, .55], [M_CAD_E, .9]];
  // valores por clima de lo mío (las claves cb* de ENV los pisan)
  const CLIMAS_CB = {
    dia: { env: ["#4a86d8", "#c8dcec", "#6a6250", [-.3, .9, .35], "#fff4e0", 1.2], rim: ["#000000", 0], brillo: .05, bajo: ["#d8c0a0", .22], rayo: 0, polvo: .25 },
    tarde: { env: ["#3a4c8a", "#f2a060", "#4a3020", [-.9, .2, .15], "#ffb060", 2.4], rim: ["#ff9a50", .25], brillo: .55, bajo: ["#e0a070", .16], rayo: 0, polvo: .3 },
    noche: { env: ["#0a1024", "#26304e", "#0a0c10", [.1, .62, -.78], "#9ab0e0", .9], envI: .4, rim: ["#9ab8ff", .9], brillo: 0, bajo: ["#1a2030", .25], rayo: 0, polvo: .2 },
    dentro: { env: ["#06080e", "#121624", "#0a0806", [-.55, .8, .1], "#8aa0d8", .6], envI: .7, rim: ["#000000", 0], brillo: 0, bajo: ["#3a3444", .28], rayo: 1, polvo: 1 } };
  let envK = null;
  function clima(A) { const k = A.cbEnv || "dia", D = CLIMAS_CB[k] || CLIMAS_CB.dia;
    if (envK !== k) { envK = k; const em = envMapa(k, ...D.env); MATS_ENV.forEach(([m, i]) => { m.envMap = em; m.envMapIntensity = i * (D.envI ?? 1); m.needsUpdate = true }) }
    const sd = ST.solDir || A.cbSol || A.sol || [-.3, .9, .3], l = Math.hypot(...sd); U.uSolW.value.set(sd[0] / l, sd[1] / l, sd[2] / l);
    U.uRim.value.set(A.cbRim ? A.cbRim[0] : D.rim[0]).multiplyScalar(A.cbRim ? A.cbRim[1] : D.rim[1]); U.uBrillo.value = A.cbBrillo ?? D.brillo; U.uPat.value = A.cbPatina ?? .42;
    U.uBajo.value.set(A.cbBajo ? A.cbBajo[0] : D.bajo[0]).multiplyScalar(A.cbBajo ? A.cbBajo[1] : D.bajo[1]);
    const rayo = A.cbRayo ?? D.rayo; HAZ.visible = rayo > 0; HAZ.material.uniforms.uA.value = .4 * rayo; PU.uRay.value = rayo; LUNA_SPOT.intensity = 9 * rayo; LUNA_SPOT.visible = rayo > 0; PU.uA.value = A.cbPolvo ?? D.polvo; POLVO.visible = PU.uA.value > 0 }
  function porCuadro(t) { U.uT.value = t; PU.uT.value = t; PU.uScale.value = (typeof H !== "undefined" ? H : 1920) / (2 * Math.tan(cam.fov * Math.PI / 360));
    const A = (typeof ENV !== "undefined" && ENV[ENVNOW]) || {}; clima(A);
    CU.uFill.value = ST.cera; CU.uCalor.value = ST.calor; CERA.visible = ST.cera > 0; VAPOR.visible = ST.cera > 0 && ST.calor > .05;
    CHORRO.m.visible = ST.cera > 0 && ST.cera < .995; CHORRO.tx.offset.y = -t * 1.6;
    PU.uZ.value = ST.zumb;
    if (ST.golpe) { const dt = ST.golpe.dt, amp = ST.cera >= .98 ? .14 : 1; PU.uG.value = amp; PU.uGt.value = dt; U.uOndaH.value = 6 + dt * 55; U.uOndaA.value = amp * 1.1 * Math.exp(-dt * 1.1) * (dt < 5 ? 1 : 0); ST.temblor = amp * .6 * Math.exp(-dt * 5) }
    else { PU.uG.value = 0; PU.uGt.value = 10; U.uOndaA.value = 0; ST.temblor = 0 }
    aves(t) }

  return { G, IN, PLAT, CAD, ESLABONES, ST, U, PU, CU, reset, porCuadro, cadenaMarco, enPoli, tanPoli, rOut, rIn, hArriba, polar, U_LABIO_E, PRIMER, GANCHO, PLAT_W, HUECO_W, RAYO, A_ENT, A_CAD_E, A_VUELCA, H_TECHO, HB, P_H, GRIETA, ESL, CLARO,
    sst, fbm, rd, hsh, mergeGeo, TMx, lote, M_MADERA, M_HIERRO, M_HIERRO_N, envMapa, CLIMAS_CB, POLVO, HAZ, VAPOR, MUSGO, CARAMBANOS, NIDOS, AVES, CERA, CHORRO, LUNA_SPOT, T_EXT, T_INT };
})();

// ======================= API DE LA CAMPANA =======================
// cadenaPunto(nombre, u): [x, y, z] en el EJE de la cadena ("norte" | "sur" | "oeste" | "este"); u 0 = abajo (cima / risco), 1 = la corona.
// cadenaTangente(nombre, u): dirección (unitaria) hacia arriba de la cadena. cadenaMarco(nombre, u): { p, t, lado (horizontal), n (normal «hacia afuera/arriba») }.
// El narrador trepando: ponelo en cadenaPunto + n · 3 (los eslabones miden 10,6 × 5,8 m; barra de 0,95 m de radio).
const cadenaPunto = (n, u) => CBX.cadenaMarco(n, u).p, cadenaTangente = (n, u) => CBX.cadenaMarco(n, u).t, cadenaMarco = (n, u) => CBX.cadenaMarco(n, u);
const PRIMER_ESLABON = CBX.PRIMER;                       // centro del primer eslabón (el que está sobre el ancla del risco del este)
const CADENA_U_LABIO = CBX.U_LABIO_E;                    // u de la cadena del este donde llega al labio de la campana (abajo de eso cuelga libre, entre las nubes)
// interior(): puntos de adentro. plataforma = centro del piso de tablas (Sallow con su martillo); labio = el reborde de adentro del labio al lado de la plataforma;
// gancho = la punta de abajo del gancho roto del badajo; entrada = la grieta del flanco (por afuera), donde llega la tabla desde la cadena del este
const interior = () => ({ plataforma: CBX.PLAT_W.slice(), labio: CBX.polar(84.85, 6.5, CBX.A_ENT + .1), gancho: CBX.GANCHO.slice(), entrada: CBX.polar(CBX.rOut(CBX.GRIETA.hc) + 1, CBX.GRIETA.hc, CBX.A_ENT), hueco: CBX.HUECO_W.slice(), vuelca: CBX.polar(84.6, CBX.P_H + 2.1, CBX.A_VUELCA - .012), ryPlataforma: -CBX.A_ENT });
// punto en coordenadas de la plataforma (x: hacia la pared de afuera −6,5…6,3; y: arriba del piso; z: a lo largo del borde −4,8…4,8) → mundo
const plataformaW = (x, y, z) => { CBX.PLAT.updateMatrixWorld(true); return CBX.PLAT.localToWorld(new THREE.Vector3(x, y + .25, z)).toArray() };
const zumbido = (t, u = 1) => { CBX.ST.zumb = cl(u, 0, 3) };                       // vibración del polvo y del aire de adentro (0 quieto … 1 zumbando … 3 temblando)
const ceraEnLabio = (u, calor = 1) => { CBX.ST.cera = cl(u); CBX.ST.calor = cl(calor, 0, 2) };   // u 0 → 1: la cera dorada humeante llena el labio de adentro desde el punto de la plataforma
const golpe = (t0, t) => { if (t >= t0) CBX.ST.golpe = { dt: t - t0 } };            // el martillo pega en t0 (polvo que salta, onda que sube por la pared; con cera: «thud»)
const golpeTemblor = () => CBX.ST.temblor;                                          // cuánto sacudir la cámara este cuadro (0 … .6)
const sombraCampana = dirSol => { CBX.ST.solDir = dirSol || null; if (dirSol && typeof SOL !== "undefined") SOL.dir = dirSol };   // la sombra sigue SIEMPRE a la luz direccional; esto además mueve el sol
// ---------- stubs de la tapa del video viejo (las escenas viejas siguen armando)
const TAPA_Y = (x, z) => CIELO(x, z), AGUJERO_W = () => [AGUJERO[0], CIELO(...AGUJERO), AGUJERO[1]], KELL_BORDE = [0, CIELO(0, 0) + LID_T, 0], tapaCaeY = u => CIELO(0, 0);
const tapaReset = () => { }, tapa = () => { }, tapaHundir = () => { }, tapaGotea = () => { }, tapaAgujero = () => { }, tapaCae = () => { }, lluviaTrigo = () => { }, tanerCae = () => { };
function sinBestia() { }

// ================= «NOBODY HEARS THE BELL»: el detalle de Underbell (utilería, velas, mercado, faroles, ropa tendida, banderines, puentes colgantes,
// el adentro de la tienda de Sallow, la casa de Nell, la escuela, el altar, el risco con su escalera), la atmósfera (humo, polvo, niebla baja,
// estrellas, luna, polillas) y los CLIMAS DE LUZ (ENV_CAMPANA_CIUDAD) =================
// ---------- texturas y materiales de la utilería
const T_TRAMA_D = tex(256, 256, (g, w, h) => { g.fillStyle = "#808080"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 4) { g.fillStyle = y % 8 ? "rgba(255,255,255,.2)" : "rgba(0,0,0,.22)"; g.fillRect(0, y, w, 2) } for (let x = 0; x < w; x += 4) { g.fillStyle = x % 8 ? "rgba(255,255,255,.14)" : "rgba(0,0,0,.16)"; g.fillRect(x, 0, 2, h) } }, [6, 6]);
// ropa tendida: siluetas recortadas (camisa, pantalón, sábana, vestido, medias) en telas lisas, a rayas o a cuadros, con desgaste
const ROPA_P = [["#efe9da", 0], ["#3e5a88", 0], ["#a8402e", 1, "#efe9da"], ["#d8a83a", 0], ["#5a7a44", 2, "#2e4a2a"], ["#e8d6c0", 1, "#7a5a8a"], ["#8a3a3a", 2, "#3a2a2a"], ["#6a8ab0", 1, "#e8e8f0"], ["#c8bca4", 0], ["#d86a3a", 0]];
const ROPA_F = ["camisa", "pantalon", "sabana", "vestido", "medias", "sabana", "camisa"];
const T_ROPA = (seed, [base, tipo, alt], forma) => tex(256, 256, (g, w, h) => { const r = rng(seed); g.clearRect(0, 0, w, h); g.save(); g.beginPath();
  if (forma === "camisa") { g.moveTo(70, 8); g.lineTo(186, 8); g.lineTo(250, 40); g.lineTo(232, 110); g.lineTo(196, 96); g.lineTo(196, 250); g.lineTo(60, 250); g.lineTo(60, 96); g.lineTo(24, 110); g.lineTo(6, 40); g.closePath() }
  else if (forma === "pantalon") { g.moveTo(40, 6); g.lineTo(216, 6); g.lineTo(236, 250); g.lineTo(146, 250); g.lineTo(128, 90); g.lineTo(110, 250); g.lineTo(20, 250); g.closePath() }
  else if (forma === "vestido") { g.moveTo(80, 6); g.lineTo(176, 6); g.lineTo(190, 80); g.lineTo(246, 250); g.lineTo(10, 250); g.lineTo(66, 80); g.closePath() }
  else if (forma === "medias") { g.moveTo(30, 4); g.lineTo(100, 4); g.lineTo(100, 190); g.quadraticCurveTo(100, 250, 40, 240); g.lineTo(30, 200); g.closePath(); g.moveTo(150, 4); g.lineTo(220, 4); g.lineTo(220, 180); g.quadraticCurveTo(220, 240, 160, 232); g.lineTo(150, 190); g.closePath() }
  else g.rect(4, 4, w - 8, h - 8);
  g.clip(); g.fillStyle = base; g.fillRect(0, 0, w, h);
  if (tipo === 1) for (let x = 0; x < w; x += 32) { g.fillStyle = alt; g.fillRect(x, 0, 12 + r() * 4, h) }
  if (tipo === 2) { g.globalAlpha = .55; for (let x = 0; x < w; x += 42) { g.fillStyle = alt; g.fillRect(x, 0, 18, h); g.fillRect(0, x, w, 18) } g.globalAlpha = 1 }
  for (let k = 0; k < 700; k++) { g.fillStyle = r() < .5 ? "rgba(255,255,250,.08)" : "rgba(40,30,20,.1)"; g.fillRect(r() * w, r() * h, 2 + r() * 20, 1.5) }
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(40,30,20,.2)"); gr.addColorStop(.12, "rgba(40,30,20,0)"); gr.addColorStop(1, "rgba(40,30,20,.12)"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.restore(); g.strokeStyle = "rgba(30,22,14,.35)"; g.lineWidth = 3; g.stroke() });
const M_ROPA = ROPA_P.map((p, i) => conViento(new THREE.MeshStandardMaterial({ map: T_ROPA(5100 + i, p, ROPA_F[i % ROPA_F.length]), bumpMap: T_TRAMA_D, bumpScale: 1.5, roughness: .95, alphaTest: .5 }), "tela", .05));
const M_ROPA_T = ROPA_P.map((p, i) => new THREE.MeshStandardMaterial({ map: M_ROPA[i].map, bumpMap: T_TRAMA_D, bumpScale: 1.5, roughness: .95, alphaTest: .5, side: THREE.DoubleSide }));   // (Tanner: se aplasta, sin brisa)
const M_BARRIL = (() => { const [c, z] = pintarDoble(256, 256, (c, z, w, h) => { const r = rng(5140); let x = 0; z.fillStyle = "#808080"; z.fillRect(0, 0, w, h); while (x < w) { const pw = 22 + r() * 10; c.fillStyle = rgbj("#8a6440", r, 26); c.fillRect(x, 0, pw, h); for (let k = 0; k < 10; k++) { c.strokeStyle = "rgba(50,34,20,.3)"; c.lineWidth = 1; const xx = x + r() * pw; c.beginPath(); c.moveTo(xx, 0); c.lineTo(xx + (r() - .5) * 4, h); c.stroke() } c.fillStyle = "rgba(30,20,12,.7)"; c.fillRect(x + pw - 2, 0, 2, h); z.fillStyle = "#202020"; z.fillRect(x + pw - 3, 0, 3, h); x += pw } }); return new THREE.MeshStandardMaterial({ map: c, bumpMap: z, bumpScale: 2.5, roughness: .9 }) })();
const M_HIERRO_N = new THREE.MeshStandardMaterial({ color: "#232120", roughness: .55, metalness: .7, envMap: ENV_METAL_P, envMapIntensity: .5 });
const M_BRONCE = new THREE.MeshStandardMaterial({ color: "#a07a3a", roughness: .34, metalness: .92, envMap: ENV_METAL_P, envMapIntensity: 1.1 });
const M_GRASA = new THREE.MeshStandardMaterial({ color: "#1e1810", roughness: .2, metalness: .3, envMap: ENV_METAL_P, envMapIntensity: .8 });
const T_FOLLAJE = (() => { const [c, z] = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(4702); c.fillStyle = "#8a9a6a"; c.fillRect(0, 0, w, h); z.fillStyle = "#606060"; z.fillRect(0, 0, w, h);
    for (let k = 0; k < 6000; k++) { const x = r() * w, y = r() * h, L = 5 + r() * 10, a = r() * 6.28, v = r(); c.strokeStyle = v < .4 ? "rgba(40,56,26,.6)" : v < .8 ? "rgba(140,160,96,.5)" : "rgba(200,210,150,.5)"; c.lineWidth = 1.5 + r() * 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); c.stroke(); z.strokeStyle = v < .4 ? "rgba(20,20,20,.5)" : "rgba(220,220,220,.5)"; z.lineWidth = 2; z.beginPath(); z.moveTo(x, y); z.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); z.stroke() } });
  [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
const T_CORTEZA = (() => { const [c, z] = pintarDoble(256, 512, (c, z, w, h) => { const r = rng(4701); c.fillStyle = "#6a5e50"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
    for (let k = 0; k < 260; k++) { const x = r() * w, y = r() * h, L = 30 + r() * 140; c.strokeStyle = r() < .5 ? `rgba(40,32,24,${.3 + r() * .4})` : `rgba(170,160,140,${.2 + r() * .3})`; c.lineWidth = 2 + r() * 5; c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + (r() - .5) * 20, y + L / 3, x + (r() - .5) * 20, y + L * .66, x + (r() - .5) * 10, y + L); c.stroke(); z.strokeStyle = "rgba(20,20,20,.6)"; z.lineWidth = 3; z.beginPath(); z.moveTo(x, y); z.lineTo(x, y + L); z.stroke() } });
  [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
const M_CORTEZA = new THREE.MeshStandardMaterial({ map: T_CORTEZA.c, bumpMap: T_CORTEZA.z, bumpScale: 4, roughness: .95 });
const M_COPA = conViento(new THREE.MeshStandardMaterial({ map: T_FOLLAJE.c, bumpMap: T_FOLLAJE.z, bumpScale: 5, roughness: .85, color: "#ffffff" }), "copa", .03);
const M_SETO = new THREE.MeshStandardMaterial({ map: T_FOLLAJE.c, bumpMap: T_FOLLAJE.z, bumpScale: 6, roughness: .9, color: "#7aa060" });
const M_INTERIOR = new THREE.MeshStandardMaterial({ map: T_TABLA_N.c, bumpMap: T_TABLA_N.z, bumpScale: 2, roughness: .9, color: "#b08a60", emissive: "#5a3418", emissiveIntensity: .55 });   // adentro de la casilla (luz del farolito)
const M_MARMOL = new THREE.MeshStandardMaterial({ map: T_SILLAR_C[0], bumpMap: T_SILLAR_C[1], bumpScale: 2, roughness: .55, color: "#f4f0e8" });
const PB = lote(), PBV = lote();   // utilería fija · ropa tendida y toldos (brisa)
const PB_M = { madera: M_MADERA, maderaV: M_MADERA_V, viga: M_VIGA, hierro: M_HIERRO, hierroO: M_HIERRO_O, hierroN: M_HIERRO_N, soga: M_SOGA, piedra: M_ROCA_G, piedraC: M_PIEDRA_C, zocalo: M_ZOCALO, barril: M_BARRIL, oscuro: M_OSCURO, terracota: M_TERRACOTA, chapa: M_CHAPA, bronce: M_BRONCE, grasa: M_GRASA, laton: M_LATON, marmol: M_MARMOL, seto: M_SETO, interior: M_INTERIOR, blanco: M_BLANCO_P, sillarC: M_SILLAR_C,
  luz: CASA_MATS.luz, tela: SM("#efe9dc", { roughness: .9 }), verde: SM("#4e7032", { roughness: .8 }), cuero: SM("#5a3e2a", { roughness: .85 }), piel: SM("#e8b898", { roughness: .7 }), tierra: SM("#5a4632", { roughness: 1 }), agua: new THREE.MeshStandardMaterial({ color: "#5a7a8a", roughness: .08, metalness: .3, envMap: ENV_METAL_P, envMapIntensity: 1 }),
  saco: new THREE.MeshStandardMaterial({ color: "#c8b898", bumpMap: T_TRAMA_D, bumpScale: 3, roughness: 1 }), cajon: new THREE.MeshStandardMaterial({ map: T_TABLA_N.c, bumpMap: T_TABLA_N.z, bumpScale: 3, roughness: .9, color: "#b89a70" }) };
M_PUERTA.forEach((m, i) => PB_M["col" + i] = m); ["#f4f0e0", "#e8c838", "#8a6ab8", "#d84a6a", "#f0a040"].forEach((c, i) => PB_M["flor" + i] = SM(c, { roughness: .6 }));
const PBV_M = {}; M_ROPA.forEach((m, i) => PBV_M["ropa" + i] = m);

// ---------- piezas sueltas (cada función agrega geometría a un lote con la matriz del lugar)
const barril = (L, M) => { const g = new THREE.CylinderGeometry(.34, .34, .9, 14, 4), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const k = 1 + .16 * Math.cos(p.getY(i) / .45 * 1.57); p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k) } g.computeVertexNormals(); L.add("barril", g, M.clone().multiply(TM(0, .45, 0))); for (const y of [.14, .45, .76]) L.add("hierroN", new THREE.TorusGeometry(y === .45 ? .395 : .365, .018, 4, 18), M.clone().multiply(TM(0, y, 0, Math.PI / 2))); L.add("madera", new THREE.CylinderGeometry(.33, .33, .03, 14), M.clone().multiply(TM(0, .9, 0))) };
const cuerda = (L, a, b, r = .018) => { const [g, m] = cilEntre(a, b, r, 4); L.add("soga", g, m) };
const banco = (L, M) => { L.add("madera", new THREE.BoxGeometry(1.6, .08, .38), M.clone().multiply(TM(0, .46, 0))); for (const s of [-1, 1]) L.add("maderaV", new THREE.BoxGeometry(.08, .44, .34), M.clone().multiply(TM(s * .66, .22, 0))) };
const cajon = (L, M, s = 1) => { L.add("cajon", RB1(.62 * s, .44 * s, .46 * s, .015), M.clone().multiply(TM(0, .22 * s, 0))); for (const yy of [.06, .38]) L.add("madera", new THREE.BoxGeometry(.64 * s, .05 * s, .48 * s), M.clone().multiply(TM(0, yy * s, 0))) };
const saco = (L, M) => { const s = new THREE.CylinderGeometry(.24, .3, .62, 10, 3), q = s.attributes.position; for (let i = 0; i < q.count; i++) { const y = q.getY(i), f = 1 + .12 * Math.cos(y * 4); q.setX(i, q.getX(i) * f); q.setZ(i, q.getZ(i) * f * .75) } s.computeVertexNormals(); L.add("saco", s, M.clone().multiply(TM(0, .31, 0))); L.add("soga", new THREE.TorusGeometry(.1, .02, 4, 10), M.clone().multiply(TM(0, .59, 0, Math.PI / 2))); L.add("saco", new THREE.ConeGeometry(.12, .16, 8), M.clone().multiply(TM(0, .7, 0, Math.PI))) };
const balde = (L, M, grasa = false) => { L.add("hierroO", new THREE.CylinderGeometry(.17, .13, .32, 12, 1, true), M.clone().multiply(TM(0, .16, 0))); L.add("hierroO", new THREE.CircleGeometry(.13, 12), M.clone().multiply(TM(0, .01, 0, -Math.PI / 2))); L.add(grasa ? "grasa" : "oscuro", new THREE.CircleGeometry(.16, 12), M.clone().multiply(TM(0, .27, 0, -Math.PI / 2))); L.add("hierro", new THREE.TorusGeometry(.17, .008, 4, 12, Math.PI), M.clone().multiply(TM(0, .32, 0, 0, 0, 0))) };
const flores3D = (L, M, n, r, an = .8, prof = .2) => { for (let k = 0; k < n; k++) { const x = (r() - .5) * an, z = (r() - .5) * prof, h = .12 + r() * .14; L.add("verde", new THREE.CylinderGeometry(.008, .01, h, 4), M.clone().multiply(TM(x, h / 2, z, 0, 0, .25))); const c = "flor" + (r() * 5 | 0); for (let p = 0; p < 5; p++) { const a = p / 5 * 6.283; L.add(c, new THREE.SphereGeometry(.026, 5, 3), M.clone().multiply(TM(x + h * .12 + Math.cos(a) * .028, h, z + Math.sin(a) * .028, 0, -a, 0, 1.3, .35, .8))) } L.add("flor1", new THREE.SphereGeometry(.015, 5, 3), M.clone().multiply(TM(x + h * .12, h + .01, z))) } };
function lena(L, M, r, an = 1.6) { for (let f = 0; f < 5; f++) for (let k = 0; k < Math.round(an / .2) - (f % 2); k++) L.add(k % 3 ? "madera" : "maderaV", new THREE.CylinderGeometry(.085 + r() * .02, .09, .52, 7), M.clone().multiply(TM(-an / 2 + .1 + k * .2 + (f % 2) * .1, .09 + f * .165, 0, Math.PI / 2, 0, 0)));
  L.add("chapa", new THREE.BoxGeometry(an + .3, .04, .8), M.clone().multiply(TM(0, .95, 0, .08, 0, 0))) }
const rueda = (L, M, R = .55) => { L.add("maderaV", new THREE.TorusGeometry(R, .055, 6, 20), M); L.add("hierroN", new THREE.TorusGeometry(R + .045, .022, 4, 20), M); L.add("madera", new THREE.CylinderGeometry(.1, .1, .2, 10), M.clone().multiply(TM(0, 0, 0, Math.PI / 2))); for (let k = 0; k < 8; k++) L.add("maderaV", new THREE.CylinderGeometry(.028, .032, R * 2, 5), M.clone().multiply(TM(0, 0, 0, 0, 0, k / 8 * Math.PI))) };
function carro(L, M, r) { const an = 1.25, la = 2.3; L.add("maderaV", new THREE.BoxGeometry(an, .08, la), M.clone().multiply(TM(0, .72, 0))); for (const s of [-1, 1]) { L.add("maderaV", new THREE.BoxGeometry(.06, .4, la), M.clone().multiply(TM(s * an / 2, .94, 0))); rueda(L, M.clone().multiply(TM(s * (an / 2 + .14), .6, .1, 0, Math.PI / 2, 0))); L.add("madera", new THREE.CylinderGeometry(.04, .045, 2.2, 6), M.clone().multiply(TM(s * .4, .45, 2.1, 1.33, 0, 0))) }
  L.add("maderaV", new THREE.BoxGeometry(an, .4, .06), M.clone().multiply(TM(0, .94, -la / 2))); for (let k = 0; k < 4; k++) saco(L, M.clone().multiply(TM((k % 2 - .5) * .55, .76, -.5 + (k >> 1) * .75, Math.PI / 2 * .9, r() * .5, 0))) }
const farol = (L, x, z, alto = 3.4) => { const y = SUELO(x, z); L.add("hierroN", new THREE.CylinderGeometry(.2, .26, .3, 8), TM(x, y + .15, z)); L.add("hierroN", new THREE.CylinderGeometry(.05, .07, alto, 8), TM(x, y + alto / 2, z));
  L.add("hierroN", new THREE.CylinderGeometry(.16, .12, .08, 6), TM(x, y + alto + .02, z)); L.add("luz", new THREE.CylinderGeometry(.15, .1, .42, 6), TM(x, y + alto + .27, z)); for (let k = 0; k < 6; k++) { const a = k / 6 * 6.283; L.add("hierroN", new THREE.BoxGeometry(.02, .44, .02), TM(x + Math.cos(a) * .15, y + alto + .27, z + Math.sin(a) * .15)) }
  L.add("hierroN", new THREE.ConeGeometry(.24, .22, 6), TM(x, y + alto + .59, z)); L.add("hierroN", new THREE.SphereGeometry(.04, 6, 4), TM(x, y + alto + .72, z)); L.add("hierroN", new THREE.BoxGeometry(.5, .03, .03), TM(x, y + alto - .25, z)); ocupa(x, z, .4) };
// ropa tendida cruzando la calle (soga de un muro al de enfrente, a la altura del primer piso; la ropa cuelga en el plano de la soga)
function tendedero(L, LV, x, zA, zB, yA, yB, r, sag = .45) { const pt = q => [x, lerp(yA, yB, q) - Math.sin(q * Math.PI) * sag, lerp(zA, zB, q)];
  for (const [zz, yy] of [[zA, yA], [zB, yB]]) { L.add("hierro", new THREE.TorusGeometry(.06, .012, 4, 10), TM(x, yy, zz + Math.sign(zz - (zA + zB) / 2) * .01, 0, Math.PI / 2, 0)); L.add("hierro", new THREE.BoxGeometry(.04, .04, .14), TM(x, yy + .05, zz - Math.sign(zz - (zA + zB) / 2) * .04)) }
  const N = 12; for (let k = 0; k < N; k++) cuerda(L, pt(k / N), pt((k + 1) / N), .011);
  const Lz = Math.abs(zB - zA); let q = .05 + r() * .05; while (q < .93) { const k = r() * M_ROPA.length | 0, forma = ROPA_F[k % ROPA_F.length], an = forma === "sabana" ? .9 + r() * .5 : forma === "medias" ? .35 : .55 + r() * .25, al = forma === "sabana" ? 1.0 + r() * .5 : forma === "pantalon" ? .9 : forma === "medias" ? .4 : .65 + r() * .15;
    const P = pt(q + an / Lz / 2), g = new THREE.PlaneGeometry(al, an, 3, 4); g.rotateZ(-Math.PI / 2); g.translate(0, -al / 2, 0); g.rotateY(Math.PI / 2); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setX(i, p.getX(i) + Math.sin((p.getZ(i) / an + .5) * Math.PI) * .03);
    LV.add("ropa" + k, g, TM(P[0] + (r() - .5) * .02, P[1] - .01, P[2], (r() - .5) * .06, 0, 0)); for (const dz of [-an / 2 + .05, an / 2 - .05]) L.add("maderaV", new THREE.BoxGeometry(.025, .09, .03), TM(P[0], P[1] + .01, P[2] + dz)); q += an / Lz + .02 + r() * .05 } }


// ================= LAS VELAS: miles, instanciadas (cuerpo de cera con chorreaduras y charquito, llama que tiembla, halo). Las llamas se inclinan
// hacia un punto con velasHacia(p, u) (cuando pasa Sallow). Grupos en VELAS_B: 0 ventanas, 1 tienda, 2 plaza y fuente, 3 casa de Nell, 4 faroles,
// 5 altar y mercado, 6 risco
const VELA_U = { uT: { value: 0 }, uP: { value: new THREE.Vector3(0, -999, 0) }, uU: { value: 0 }, uRad: { value: 26 }, uTiem: { value: 1 }, uHalo: { value: .3 }, uFogD: { value: .005 } };
const GEO_VELA = (() => { const r = rng(7300), L = [[new THREE.CylinderGeometry(.5, .53, 1, 8, 1), TM(0, .5, 0)], [new THREE.TorusGeometry(.47, .07, 4, 8), TM(0, .98, 0, Math.PI / 2)], [new THREE.CylinderGeometry(1.15, 1.4, .04, 9), TM(0, .02, 0)]];
  for (let k = 0; k < 4; k++) { const a = r() * 6.283, l = .2 + r() * .55; L.push([new THREE.CapsuleGeometry(.1, l, 2, 5), TM(Math.cos(a) * .5, .98 - l / 2 - .05, Math.sin(a) * .5)]) }
  L.push([new THREE.SphereGeometry(.28, 6, 4), TM(.55, .1, .3, 0, 0, 0, 1.6, .5, 1.3)]); return mergeG(L) })();
const GEO_LLAMA = new THREE.LatheGeometry([[0, 0], [.32, .1], [.42, .3], [.32, .58], [.14, .84], [0, 1]].map(q => new THREE.Vector2(q[0], q[1])), 7);
const M_LLAMA = new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(3.2, 2.1, .9), fog: true });
M_LLAMA.onBeforeCompile = sh => { Object.assign(sh.uniforms, { uT: VELA_U.uT, uP: VELA_U.uP, uU: VELA_U.uU, uRad: VELA_U.uRad, uTiem: VELA_U.uTiem });
  sh.vertexShader = "uniform float uT, uU, uRad, uTiem; uniform vec3 uP;\n" + sh.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>
  { vec3 b0 = (modelMatrix * instanceMatrix * vec4(0., 0., 0., 1.)).xyz; float ph = fract(sin(dot(b0.xz, vec2(12.9898, 78.233))) * 43758.5453) * 6.2831;
    float fl = 1. + uTiem * (.16 * sin(uT * 11. + ph) + .09 * sin(uT * 27.3 + ph * 3.) + .06 * sin(uT * 53. + ph * 7.)); transformed.y *= fl; transformed.xz *= 1. + .1 * uTiem * sin(uT * 17. + ph * 2.);
    vec2 dd = uP.xz - b0.xz; float L = length(dd); float k = uU * (1. - smoothstep(uRad * .25, uRad, L)); vec2 dir = L > .01 ? dd / L : vec2(0.);
    float sw = uTiem * .14 * sin(uT * 3.1 + ph) + uTiem * uTiem * .1 * sin(uT * 19. + ph * 5.);
    transformed.xz += (dir * k * 3.6 + vec2(sw, sw * .7)) * position.y * position.y; transformed.y *= 1. - .3 * k; }`) };
M_LLAMA.customProgramCacheKey = () => "llamaB";
const M_HALO_B = (col, ex = 1) => new THREE.ShaderMaterial({ uniforms: { map: { value: GLOW }, uHalo: VELA_U.uHalo, uT: VELA_U.uT, uTiem: VELA_U.uTiem, uFogD: VELA_U.uFogD, uCol: { value: new THREE.Color(col).multiplyScalar(ex) } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  vertexShader: `uniform float uT, uTiem, uFogD; varying vec2 vUv; varying float vF; void main(){ vUv = uv; vec4 c = modelMatrix * instanceMatrix * vec4(0., 0., 0., 1.); float s = length(instanceMatrix[0].xyz);
    float ph = fract(sin(dot(c.xz, vec2(12.9898, 78.233))) * 43758.5453) * 6.2831; s *= 1. + uTiem * .13 * sin(uT * 9. + ph) + uTiem * .06 * sin(uT * 23. + ph);
    vec4 mv = viewMatrix * c; mv.xy += position.xy * s; gl_Position = projectionMatrix * mv; float d = -mv.z; vF = exp(-uFogD * uFogD * d * d) * smoothstep(.5, 2.5, d); }`,
  fragmentShader: `uniform sampler2D map; uniform float uHalo; uniform vec3 uCol; varying vec2 vUv; varying float vF; void main(){ float a = texture2D(map, vUv).a; gl_FragColor = vec4(uCol * a * a * uHalo * vF, 1.); }` });
const M_VELA = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .45, emissive: "#40280c", emissiveIntensity: .35 });
let VELAS_M = null;
function velasArmar() { const N = VELAS_B.length, cuerpo = new THREE.InstancedMesh(GEO_VELA, M_VELA, N), llama = new THREE.InstancedMesh(GEO_LLAMA, M_LLAMA, N), halo = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), M_HALO_B("#ffb460", 1.0), N), cc = new THREE.Color(), r = rng(7310);
  const COL = ["#f4ecd8", "#efe2c0", "#e8d49a", "#f8f2e4", "#e0c890", "#f2e6cc"];
  VELAS_B.forEach((v, i) => { const farol = v.g === 4, rr = farol ? .025 : v.gorda ? .045 + r() * .025 : .018 + r() * .014, h = v.h ?? .15, [x, y, z] = v.p;
    dummy.position.set(x, y, z); dummy.rotation.set((r() - .5) * .06, r() * 6, (r() - .5) * .06); dummy.scale.set(rr * 2, farol ? .05 : h, rr * 2); dummy.updateMatrix(); cuerpo.setMatrixAt(i, dummy.matrix); cuerpo.setColorAt(i, cc.set(v.col || COL[r() * COL.length | 0]));
    const fw = farol ? .05 : .016 + rr * .3, fh = farol ? .16 : .055 + rr * .6 + r() * .02, yf = y + (farol ? .05 : h) + .004; dummy.position.set(x, yf, z); dummy.rotation.set(0, 0, 0); dummy.scale.set(fw, fh, fw); dummy.updateMatrix(); llama.setMatrixAt(i, dummy.matrix);
    dummy.position.set(x, yf + fh * .4, z); dummy.scale.setScalar(farol ? .9 : v.g === 0 ? .24 : .2 + rr * 2.5); dummy.updateMatrix(); halo.setMatrixAt(i, dummy.matrix) });
  cuerpo.castShadow = false; cuerpo.receiveShadow = true; llama.frustumCulled = halo.frustumCulled = false; cuerpo.frustumCulled = false; halo.renderOrder = 5; [cuerpo, llama, halo].forEach(m => scene.add(m)); VELAS_M = { cuerpo, llama, halo } }
// velasHacia(p, u): las llamas cercanas a p ([x, y, z], radio ≈ 26 m) se inclinan hacia p con fuerza u (0–1; 1 ≈ 50°); velasHacia(null) las endereza
function velasHacia(p, u = 1, radio = 26) { if (!p) { VELA_U.uU.value = 0; return } VELA_U.uP.value.set(p[0], p[1], p[2]); VELA_U.uU.value = u; VELA_U.uRad.value = radio }
// lucesCerca(p, n): las n luces puntuales sugeridas más cercanas a p (para lights() de la escena), con la intensidad del clima
const LUCES_PUNTOS = [];   // [x, y, z, intensidad, color, distancia]
function lucesCerca(p, n = 6) { const A = ENV[ENVNOW] || {}, k = A.luces ?? 1, q = Array.isArray(p) ? p : [p.x, p.y, p.z];
  return LUCES_PUNTOS.map(l => [l, Math.hypot(l[0] - q[0], l[1] - q[1], l[2] - q[2])]).sort((a, b) => a[1] - b[1]).slice(0, n).map(([l]) => [[l[0], l[1], l[2]], l[3] * k, l[4], l[5]]) }

// ================= LA CIUDAD LLENA: mercado (toldos rayados, puestos con panales y bloques de cera), faroles de hierro, barandas, ropa tendida,
// banderines, puentes colgantes de madera entre las casas, macetas, cosas en las puertas; adentro de la casa de Nell; la escuela; el altar
// de las bodas; el risco con su escalera tallada; árboles, pasto y piedras; afuera, chacras con pircas y parvas.
const T_PANAL = tex(256, 256, (g, w, h) => { g.fillStyle = "#7a4a10"; g.fillRect(0, 0, w, h); const R = 9; for (let y = 0, f = 0; y < h + R; y += R * 1.5, f++) for (let x = (f % 2) * R * .866; x < w + R; x += R * 1.732) { g.fillStyle = `rgb(${200 + (x * y % 40)},${140 + (x % 30)},${30 + (y % 20)})`; g.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * 6.283 + Math.PI / 6; g.lineTo(x + Math.cos(a) * (R - 1.5), y + Math.sin(a) * (R - 1.5)) } g.fill() } });
const T_CESTA = tex(128, 128, (g, w, h) => { g.fillStyle = "#8a6a3a"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 8) for (let x = (y / 8 % 2) * 8; x < w; x += 16) { g.fillStyle = "#b8945a"; g.fillRect(x, y, 10, 6) } }, [3, 1]);
const T_TOLDO = (a, b, seed) => tex(256, 256, (g, w, h) => { const r = rng(seed); for (let x = 0; x < w; x += 32) { g.fillStyle = (x / 32) % 2 ? b : a; g.fillRect(x, 0, 32, h) } for (let k = 0; k < 900; k++) { g.fillStyle = r() < .5 ? "rgba(40,30,20,.1)" : "rgba(255,250,240,.08)"; g.fillRect(r() * w, r() * h, 2 + r() * 14, 1.5) }
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(30,20,10,.25)"); gr.addColorStop(.3, "rgba(30,20,10,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h) });
const TOLDOS_C = [["#b03a2e", "#efe6d0"], ["#3e6a48", "#e8dcc0"], ["#2e5a8a", "#f0ece0"], ["#c88a2a", "#f2e8d0"], ["#7a3a6a", "#e8dcc8"], ["#a84a2a", "#2a3a4a"]];
TOLDOS_C.forEach(([a, b], i) => PBV_M["toldo" + i] = conViento(new THREE.MeshStandardMaterial({ map: T_TOLDO(a, b, 7700 + i), roughness: .9 }), "toldo", .05));
Object.assign(PB_M, { cera: M_CERA, ceraV: M_CERA_V, panal: new THREE.MeshStandardMaterial({ map: T_PANAL, bumpMap: T_PANAL, bumpScale: 3, roughness: .35, emissive: "#5a3000", emissiveIntensity: .25 }), miel: new THREE.MeshStandardMaterial({ color: "#c87a10", roughness: .15, transparent: true, opacity: .85 }),
  cesta: new THREE.MeshStandardMaterial({ map: T_CESTA, bumpMap: T_CESTA, bumpScale: 2, roughness: 1 }), pizarra: new THREE.MeshStandardMaterial({ map: null, roughness: .9 }), maderaN: M_MADERA_N, papel: M_PAPEL, cortina: M_CORTINA, muroT: M_MURO_T, corona: M_CORONA, mantel: SM("#e8dcc0", { roughness: 1 }), muneca: SM("#c86a4a", { roughness: 1 }) });
const pf = (x, z) => sueloB(x, z);
const ryAfuera = a => Math.atan2(Math.cos(a), Math.sin(a));   // ry que mira hacia afuera (radial)

// ---------- adentro de la casa de Nell: la mesa bajo la ventana con velas, dos sillas, una muñeca de trapo, el aparador, la alfombra, un cuadro
{ const at = CASA_NELL_B.at, fz = CASA_NELL_B.fz, vc = CASA_NELL_B.vc, L = PB, M0 = at(0, 0, 0);
  const P = (x, y, z, ...a) => at(x, y, z, ...a);
  L.add("madera", new THREE.BoxGeometry(1.5, .06, .8), P(vc, 1.08, fz - 1.0)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) L.add("madera", new THREE.BoxGeometry(.06, .76, .06), P(vc + sx * .68, .65, fz - 1.0 + sz * .33));
  L.add("mantel", new THREE.BoxGeometry(1.56, .01, .86), P(vc, 1.115, fz - 1.0)); for (const sx of [-1, 1]) L.add("mantel", new THREE.BoxGeometry(.01, .25, .86), P(vc + sx * .78, .99, fz - 1.0));
  [[-.5, .2, .3], [-.25, .3, .2], [.05, .25, .26], [.35, .22, .18], [.55, .28, .14]].forEach(([dx, dz, h]) => VELAS_B.push({ p: new THREE.Vector3(vc + dx, 1.12, fz - 1.0 + dz - .2).applyMatrix4(M0).toArray(), h, g: 3 }));
  L.add("piedraC", new THREE.CylinderGeometry(.14, .12, .02, 14), P(vc + .2, 1.125, fz - 1.15));
  for (const [sx, ry] of [[-1, Math.PI / 2], [1, -Math.PI / 2]]) { const x = vc + sx * 1.05, z = fz - 1.05; L.add("madera", new THREE.BoxGeometry(.44, .05, .44), P(x, .72, z)); for (const a of [-1, 1]) for (const b of [-1, 1]) L.add("madera", new THREE.BoxGeometry(.04, .45, .04), P(x + a * .19, .49, z + b * .19)); L.add("madera", new THREE.BoxGeometry(.04, .55, .44), P(x + sx * .2, 1.0, z)) }
  // la muñeca de trapo sentada en la silla de la derecha
  { const x = vc + 1.05, z = fz - 1.05; L.add("muneca", new THREE.SphereGeometry(.09, 8, 6), P(x, .84, z, 0, 0, 0, 1, 1.3, .8)); L.add("mantel", new THREE.SphereGeometry(.07, 8, 6), P(x, 1.0, z)); for (const s of [-1, 1]) L.add("muneca", new THREE.CapsuleGeometry(.025, .14, 2, 5), P(x - .1, .78, z + s * .05, 0, 0, Math.PI / 2)) }
  L.add("maderaN", new THREE.BoxGeometry(.5, 1.9, 1.3), P(2.35, 1.22, fz - 2.8)); for (let k = 0; k < 3; k++) L.add("piedraC", new THREE.CylinderGeometry(.11, .09, .03, 12), P(2.05, 2.2, fz - 3.2 + k * .35, 0, 0, Math.PI / 2));
  L.add("tela", new THREE.BoxGeometry(2.4, .01, 1.6), P(vc + .4, .33, fz - 2.2)); L.add("maderaN", new THREE.BoxGeometry(.6, .45, .04), P(-2.65 + .03, 1.9, fz - 2.4, 0, Math.PI / 2, 0)); L.add("papel", new THREE.PlaneGeometry(.5, .36), P(-2.62 + .03, 1.9, fz - 2.4, 0, Math.PI / 2, 0));
  // afuera: velas en el alféizar y una maceta
  for (let k = 0; k < 4; k++) VELAS_B.push({ p: new THREE.Vector3(CASA_NELL_B.VEN[0] + .2 + k * .45, .95, fz + .14).applyMatrix4(M0).toArray(), h: .08 + k % 2 * .1, g: 3 });
  LUCES_PUNTOS.push([...new THREE.Vector3(vc, 1.6, fz - 1.0).applyMatrix4(M0).toArray(), 3.5, "#ffb060", 7]) }
const CASA_NELL_V = (() => { const M0 = CASA_NELL_B.at(0, 0, 0), W = (x, y, z) => new THREE.Vector3(x, y, z).applyMatrix4(M0).toArray(); return { ventana: W(CASA_NELL_B.vc, 1.6, CASA_NELL_B.fz + .2), afuera: W(CASA_NELL_B.vc, 0, CASA_NELL_B.fz + 2.2), mesa: W(CASA_NELL_B.vc, 1.12, CASA_NELL_B.fz - 1.0), puerta: W(1.275, 0, CASA_NELL_B.fz + .7), adentro: W(CASA_NELL_B.vc + .2, .3, CASA_NELL_B.fz - 2.4) } })();

// ---------- la escuela: el pizarrón con los labios dibujados (A · E · O · M · «read the lips»), bancos y el banquito de la maestra
const T_PIZARRON_B = tex(1024, 512, (g, w, h) => { const r = rng(7720); g.fillStyle = "#24302a"; g.fillRect(0, 0, w, h); for (let k = 0; k < 400; k++) { g.fillStyle = `rgba(220,230,220,${r() * .05})`; g.fillRect(r() * w, r() * h, 20 + r() * 120, 6 + r() * 30) }
  g.strokeStyle = "rgba(240,240,230,.9)"; g.fillStyle = "rgba(240,240,230,.9)"; g.lineWidth = 6; g.lineCap = "round";
  const boca = (cx, cy, ab, an, letra) => { g.beginPath(); g.ellipse(cx, cy, an, ab + 12, 0, 0, 7); g.stroke(); g.beginPath(); g.moveTo(cx - an, cy); g.quadraticCurveTo(cx, cy - ab * .4 - 18, cx + an, cy); g.stroke(); if (ab > 6) { g.fillStyle = "rgba(20,26,22,1)"; g.beginPath(); g.ellipse(cx, cy + 2, an * .62, ab * .55, 0, 0, 7); g.fill(); g.fillStyle = "rgba(240,240,230,.9)" }
    g.beginPath(); g.moveTo(cx - an * .5, cy - ab * .2); g.lineTo(cx + an * .5, cy - ab * .2); g.lineWidth = 3; g.stroke(); g.lineWidth = 6; g.font = "bold 64px Georgia, serif"; g.textAlign = "center"; g.fillText(letra, cx, cy + 120) };
  boca(150, 200, 40, 70, "A"); boca(380, 200, 18, 82, "E"); boca(610, 200, 42, 46, "O"); boca(840, 200, 2, 72, "M");
  g.font = "italic 46px Georgia, serif"; g.textAlign = "left"; g.fillText("Read the lips. Never the bell.", 60, 440); for (let k = 0; k < 30; k++) { g.fillStyle = `rgba(230,230,220,${r() * .3})`; g.fillRect(r() * w, h - 30 + r() * 20, 8 + r() * 20, 3) } });
{ PB_M.pizarra.map = T_PIZARRON_B; const M = ESCUELA_B.pizarra, L = PB; L.add("pizarra", new THREE.BoxGeometry(2.6, 1.3, .04), M.clone().multiply(TM(0, 1.55, .05))); L.add("maderaN", new THREE.BoxGeometry(2.75, .08, .07), M.clone().multiply(TM(0, 2.22, .06))); L.add("maderaN", new THREE.BoxGeometry(2.75, .06, .14), M.clone().multiply(TM(0, .88, .1)));
  for (const s of [-1, 1]) L.add("maderaN", new THREE.BoxGeometry(.07, 1.42, .07), M.clone().multiply(TM(s * 1.34, 1.55, .06))); for (let k = 0; k < 4; k++) L.add("blanco", new THREE.CylinderGeometry(.008, .008, .06, 5), M.clone().multiply(TM(-.8 + k * .3, .92, .12, 0, 0, Math.PI / 2)));
  for (let f = 0; f < 3; f++) banco(L, M.clone().multiply(TM((f - 1) * 1.7 + 1.2, 0, 1.9 + (f % 2) * .2, 0, Math.PI, 0)));
  L.add("madera", new THREE.CylinderGeometry(.2, .2, .05, 10), M.clone().multiply(TM(-1.9, .6, .8))); for (let k = 0; k < 3; k++) L.add("madera", new THREE.CylinderGeometry(.025, .03, .6, 5), M.clone().multiply(TM(-1.9 + Math.cos(k * 2.1) * .14, .3, .8 + Math.sin(k * 2.1) * .14))) }
PB_M.blanco = M_BLANCO_P;

// ---------- el ALTAR de las bodas (en la plaza, al sur, sobre la avenida del mercado): tarima de piedra de tres escalones, arco de madera con
// flores y cintas, dos atriles con velas gordas, y velas en los escalones
const ALTAR = (() => { const a = 100 * Math.PI / 180, rr = 10.6, x = Math.cos(a) * rr, z = Math.sin(a) * rr, ry = ryHacia(a), M = TM(x, pf(x, z), z, 0, ry, 0), at = (...q) => M.clone().multiply(TM(...q)), L = PB, r = rng(7730);
  for (let k = 0; k < 3; k++) L.add("corona", RB1(4.2 - k * .7, .16, 2.6 - k * .5, .03), at(0, .08 + k * .16, 0));
  for (const s of [-1, 1]) { L.add("madera", new THREE.BoxGeometry(.16, 2.9, .16), at(s * 1.25, .48 + 1.45, -.4)); for (let k = 0; k < 10; k++) { const y = .6 + k * .27; L.add("flor" + (k % 5), new THREE.SphereGeometry(.07, 6, 4), at(s * 1.25 + (r() - .5) * .14, y, -.32)); L.add("verde", new THREE.SphereGeometry(.06, 5, 4), at(s * 1.25 - .08, y + .1, -.32)) } }
  { const g = new THREE.TorusGeometry(1.25, .08, 6, 20, Math.PI); L.add("madera", g, at(0, 3.38, -.4)); for (let k = 0; k <= 16; k++) { const q = k / 16 * Math.PI; L.add("flor" + (k % 5), new THREE.SphereGeometry(.09, 6, 4), at(Math.cos(q) * 1.25, 3.38 + Math.sin(q) * 1.25, -.3)); L.add("verde", new THREE.SphereGeometry(.07, 5, 4), at(Math.cos(q + .1) * 1.32, 3.38 + Math.sin(q + .1) * 1.32, -.32)) } }
  for (let k = 0; k < 6; k++) { const [g, m] = cilEntre([-.8 + k * .32, 4.5, -.38], [-.8 + k * .32 + (r() - .5) * .2, 3.6 - r() * .8, -.33], .012, 4); L.add("tela", g, M.clone().multiply(m)) }
  for (const s of [-1, 1]) { L.add("hierroN", new THREE.CylinderGeometry(.04, .05, 1.2, 6), at(s * 1.8, .48 + .6, .5)); L.add("hierroN", new THREE.CylinderGeometry(.14, .06, .1, 8), at(s * 1.8, 1.7, .5)); VELAS_B.push({ p: new THREE.Vector3(s * 1.8, 1.75, .5).applyMatrix4(M).toArray(), h: .35, g: 5, gorda: true }) }
  for (let k = 0; k < 26; k++) { const u = r(), x0 = (u - .5) * 4, z0 = .95 + r() * .3; VELAS_B.push({ p: new THREE.Vector3(x0, .16 + .01, z0).applyMatrix4(M).toArray(), h: .06 + r() * .2, g: 5, gorda: r() < .4 }) }
  rectAdd({ x, z, ry, w: 4.4, d: 2.8, altar: 1 }); LUCES_PUNTOS.push([...new THREE.Vector3(0, 2, .6).applyMatrix4(M).toArray(), 3, "#ffb868", 8]);
  const W = (lx, lz) => new THREE.Vector3(lx, 0, lz).applyMatrix4(M).toArray().filter((_, i) => i !== 1);
  return { M, centro: [x, pf(x, z) + .48, z], novio: W(-.45, -.1), novia: W(.45, -.1), invitados: [...Array(14)].map((_, i) => W(((i % 7) - 3) * .9, 2.4 + (i / 7 | 0) * 1.1)) } })();

// ---------- EL MERCADO: puestos con toldos rayados alrededor del oeste de la plaza y sobre la calle A (al sudoeste)
const PUESTOS = [];
function puesto(M, r, k) { const L = PB, at = (...q) => M.clone().multiply(TM(...q)), an = 2.5 + r() * .5, toldo = "toldo" + (k % TOLDOS_C.length);
  for (const sx of [-1, 1]) for (const [sz, h] of [[.55, 2.25], [-.6, 2.6]]) L.add("madera", new THREE.BoxGeometry(.09, h, .09), at(sx * an / 2, h / 2, sz));
  L.add("maderaN", new THREE.BoxGeometry(an - .1, .08, 1.0), at(0, .88, .05)); L.add("madera", new THREE.BoxGeometry(an - .1, .78, .05), at(0, .45, .52)); L.add("madera", new THREE.BoxGeometry(an, .08, .08), at(0, 2.25, .55)); L.add("madera", new THREE.BoxGeometry(an, .08, .08), at(0, 2.6, -.6));
  { const g = new THREE.PlaneGeometry(an + .4, 1.75, 4, 3); g.rotateX(-Math.PI / 2 + .3); PBV.add(toldo, g, at(0, 2.47, .1)); const v = new THREE.PlaneGeometry(an + .4, .32, 8, 1), p = v.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) < 0) p.setY(i, p.getY(i) + .12 * Math.abs(Math.sin(p.getX(i) * 5.5))); PBV.add(toldo, v, at(0, 2.08, .94)) }
  const goods = k % 4; for (let x = -an / 2 + .3; x < an / 2 - .2; x += .42) { const z = (r() - .5) * .5, q = (goods + Math.floor(r() * 2)) % 4;
    if (q === 0) { for (let j = 0; j < 2; j++) L.add("panal", RB1(.36, .04, .26, .01), at(x, .945 + j * .04, z, 0, r() * .3, 0)); L.add("madera", new THREE.BoxGeometry(.4, .02, .3), at(x, .93, z)) }
    else if (q === 1) for (let j = 0; j < 3; j++) L.add(r() < .5 ? "cera" : "ceraV", RB1(.2, .1, .13, .015), at(x + (j % 2) * .05, .97 + j * .1, z, 0, r() * .5, 0));
    else if (q === 2) { L.add("miel", new THREE.CylinderGeometry(.06, .06, .14, 10), at(x - .07, .99, z)); L.add("miel", new THREE.CylinderGeometry(.05, .05, .12, 10), at(x + .08, .98, z + .08)); L.add("tela", new THREE.CylinderGeometry(.065, .065, .02, 10), at(x - .07, 1.07, z)) }
    else { L.add("cesta", new THREE.CylinderGeometry(.16, .12, .18, 10, 1, true), at(x, 1.01, z)); for (let j = 0; j < 7; j++) L.add(r() < .5 ? "cera" : "ceraV", new THREE.CylinderGeometry(.018, .018, .3, 6), at(x + (r() - .5) * .14, 1.08, z + (r() - .5) * .14, (r() - .5) * .5, 0, (r() - .5) * .5)) } }
  for (let j = 0; j < 7; j++) L.add(r() < .5 ? "cera" : "ceraV", new THREE.CylinderGeometry(.02, .022, .34, 6), at(-an / 2 + .3 + j * .1, 1.95, .5));
  L.add("cuerda" in PB_M ? "soga" : "soga", new THREE.CylinderGeometry(.006, .006, an - .4, 3), at(0, 2.14, .5, 0, 0, Math.PI / 2));
  if (r() < .6) cajon(L, at(-an / 2 - .45, 0, -.2, 0, r(), 0)); if (r() < .6) saco(L, at(an / 2 + .35, 0, .1, 0, r() * 6, 0)); if (r() < .4) barril(L, at(an / 2 + .2, 0, -.7));
  VELAS_B.push({ p: new THREE.Vector3((r() - .5) * an * .6, .93, .3).applyMatrix4(M).toArray(), h: .12 + r() * .15, g: 5, gorda: true }) }
{ const r = rng(7740);
  for (let a = 128; a <= 214; a += 14.5) { const ar = a * Math.PI / 180, rr = 12.0, x = Math.cos(ar) * rr, z = Math.sin(ar) * rr; if (enRadial(x, z, 1.6)) continue; const ry = ryHacia(ar); puesto(TM(x, pf(x, z), z, 0, ry, 0), r, PUESTOS.length); PUESTOS.push({ x, z, ry, frente: [x - Math.cos(ar) * 1.8, z - Math.sin(ar) * 1.8] }); rectAdd({ x, z, ry, w: 3.3, d: 1.6, puesto: 1 }) }
  for (let a = 104; a <= 206; a += 8.5) { const ar = a * Math.PI / 180, rr = 27.9, x = Math.cos(ar) * rr, z = Math.sin(ar) * rr; if (enRadial(x, z, 1.8)) continue; const ry = ryAfuera(ar); puesto(TM(x, pf(x, z), z, 0, ry, 0), r, PUESTOS.length); PUESTOS.push({ x, z, ry, frente: [x + Math.cos(ar) * 1.9, z + Math.sin(ar) * 1.9] }); rectAdd({ x, z, ry, w: 3.3, d: 1.6, puesto: 1 }) } }

// ---------- FAROLES DE HIERRO (con llama adentro): alrededor de la plaza, a lo largo de las calles anulares (del lado del muro) y de las radiales
const FAROLES = [];
const farolB = (x, z, alto = 3.4) => { farol(PB, x, z, alto); rectAdd({ x, z, ry: 0, w: .6, d: .6, farol: 1 }); const y = pf(x, z); VELAS_B.push({ p: [x, y + alto + .12, z], g: 4 }); FAROLES.push([x, y + alto + .3, z]) };
{ for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2 + .1, x = Math.cos(a) * 14.0, z = Math.sin(a) * 14.0; if (Math.abs(angD(a, A_TIENDA)) < .5 || enRadial(x, z, .8) || PUESTOS.some(p => Math.hypot(p.x - x, p.z - z) < 2.6) || Math.hypot(x - ALTAR.centro[0], z - ALTAR.centro[2]) < 3.2) continue; farolB(x, z, 3.6) }
  ANILLOS.forEach(([r0, r1, nm]) => { if (nm === "callejon") return; const rr = r0 + .55, n = Math.floor(Math.PI * 2 * rr / (nm === "A" ? 13 : 16)); for (let k = 0; k < n; k++) { const a = (k + .5) / n * Math.PI * 2, x = Math.cos(a) * rr, z = Math.sin(a) * rr; if (enRadial(x, z, 1.0) || riscoH(x, z) > 1.2 || !libreEn(x, z, .4, { zona: 1 })) continue; farolB(x, z) } });
  CALLES_RAD.forEach(c => { for (let rr = 20; rr < c.rMax - 2; rr += 11) { if (TERR_B.some(b => rr > b - 6.5 && rr < b + 1)) continue; const [x, z] = radPunto(c, rr, (c.an / 2 - .45) * (c.i % 2 ? 1 : -1)); if (!libreEn(x, z, .4, { zona: 1 })) continue; farolB(x, z) } });
  FAROLES.filter((_, i) => i % 2 === 0).forEach(p => LUCES_PUNTOS.push([p[0], p[1] - .2, p[2], 4.0, "#ffb460", 12])) }
// faroles chicos de pared a los lados de las escaleras (arriba)
ESCALERAS_B.forEach((E, i) => { if (i % 2) return; const M = TM(E.cx, 0, E.cz, 0, E.ry, 0); const p = new THREE.Vector3((E.W / 2 + .21) * (i % 4 ? 1 : -1), E.y1 + .9, E.L / 2 - .2).applyMatrix4(M); PB.add("hierroN", new THREE.CylinderGeometry(.11, .08, .05, 6), TM(p.x, p.y + .02, p.z)); PB.add("luz", new THREE.CylinderGeometry(.08, .06, .2, 6), TM(p.x, p.y + .14, p.z)); PB.add("hierroN", new THREE.ConeGeometry(.13, .12, 6), TM(p.x, p.y + .3, p.z)); VELAS_B.push({ p: [p.x, p.y + .06, p.z], h: .05, g: 0 }) });
// barandas de hierro de las escaleras
BARANDAS.forEach(P => { for (let k = 0; k < P.length; k++) { const [x, y, z] = P[k]; PB.add("hierroN", new THREE.CylinderGeometry(.022, .022, .95, 6), TM(x, y + .47, z)); if (k) cuerda(PB, [P[k - 1][0], P[k - 1][1] + .95, P[k - 1][2]], [x, y + .95, z], .025) } });
PB_M.escalon = M_ESCALON;

// ---------- cosas en las puertas y frentes (casas de las filas cercanas): bancos, barriles, cajones, bolsas, macetas, velas en el escalón
{ const r = rng(7750); CASAS_P.forEach(C => { if (C.fila === undefined || C.fila > 6 || !C.F) return; const F = C.HM.clone().multiply(C.F), side = C.px > 0 ? -1 : 1;
  for (let k = 0; k < 2 + (r() * 3 | 0); k++) VELAS_B.push({ p: new THREE.Vector3((r() - .5) * .9, .1, .42 + r() * .12).applyMatrix4(F).toArray(), h: .06 + r() * .2, g: 0, gorda: r() < .3 });
  const M = (dx, dz, ry = 0) => F.clone().multiply(TM(side * dx, 0, dz, 0, ry, 0)), q = r();
  if (q < .22) banco(PB, M(1.7, .45)); else if (q < .38) { barril(PB, M(1.2, .5)); if (r() < .5) barril(PB, M(1.9, .45)) } else if (q < .5) { cajon(PB, M(1.3, .45, r())); cajon(PB, M(1.4, .45, r()).multiply(TM(0, .44, 0)), .8) } else if (q < .6) { saco(PB, M(1.2, .45, r() * 6)); saco(PB, M(1.6, .5, r() * 6)) }
  for (let k = 0; k < (r() < .5 ? 2 : 0); k++) { const p = new THREE.Vector3(side * (.95 + k * .32), .02, .38).applyMatrix4(F); MACETAS_B.push([p.x, p.y, p.z, 1.3 + r() * .8, r() * 6]) } }) }
// macetas y velas sobre los muretes de las escaleras
ESCALERAS_B.forEach((E, i) => { const M = TM(E.cx, 0, E.cz, 0, E.ry, 0), r = rng(7760 + i); for (let k = 0; k < E.n; k += 3) { if (r() < .4) continue; const s = r() < .5 ? 1 : -1, u = -E.L / 2 + (k + .5) * E.L / E.n, y = E.y0 + (k + 1) * (E.y1 - E.y0) / E.n + .95, p = new THREE.Vector3(s * (E.W / 2 + .21), y, u).applyMatrix4(M);
  if (r() < .55) MACETAS_B.push([p.x, p.y, p.z, 1.1 + r() * .6, r() * 6]); else VELAS_B.push({ p: [p.x, p.y, p.z], h: .08 + r() * .2, g: 0, gorda: r() < .5 }) } });

// ---------- ROPA TENDIDA entre dos puntos (soga con caída, ropa colgada en el plano de la soga)
function tendederoAB(A, B, r, sag = .5) { const pt = q => [lerp(A[0], B[0], q), lerp(A[1], B[1], q) - Math.sin(q * Math.PI) * sag, lerp(A[2], B[2], q)], Lr = Math.hypot(B[0] - A[0], B[2] - A[2]), ang = Math.atan2(B[0] - A[0], B[2] - A[2]);
  for (const P of [A, B]) PB.add("hierro", new THREE.TorusGeometry(.06, .012, 4, 10), TM(P[0], P[1], P[2], 0, ang, 0));
  const N = 12; for (let k = 0; k < N; k++) cuerda(PB, pt(k / N), pt((k + 1) / N), .011);
  let q = .06 + r() * .05; while (q < .92) { const k = r() * M_ROPA.length | 0, forma = ROPA_F[k % ROPA_F.length], an = forma === "sabana" ? .9 + r() * .5 : forma === "medias" ? .35 : .55 + r() * .25, al = forma === "sabana" ? 1.0 + r() * .5 : forma === "pantalon" ? .9 : forma === "medias" ? .4 : .65 + r() * .15;
    const P = pt(q + an / Lr / 2), g = new THREE.PlaneGeometry(al, an, 3, 4); g.rotateZ(-Math.PI / 2); g.translate(0, -al / 2, 0); g.rotateY(Math.PI / 2); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setX(i, p.getX(i) + Math.sin((p.getZ(i) / an + .5) * Math.PI) * .03);
    PBV.add("ropa" + k, g, TM(P[0], P[1] - .01, P[2], 0, ang, 0)); q += an / Lr + .03 + r() * .06 } }
const hayCasa = (x, z) => RECTS.some(R => R.casa && Math.abs(R.x - x) < 12 && Math.abs(R.z - z) < 12 && enRect(R, x, z, .4));
{ const r = rng(7770);
  CALLES_RAD.forEach(c => FILAS.forEach((F, fi) => { if (fi > 6 || F.galpon || r() < .35) return; const rr = lerp(F.r0, F.r1, .3 + r() * .4), A2 = radPunto(c, rr, -c.an / 2 - .08), B2 = radPunto(c, rr + (r() - .5) * 1.5, c.an / 2 + .08);
    if (!hayCasa(...radPunto(c, rr, -c.an / 2 - .6)) || !hayCasa(...radPunto(c, rr, c.an / 2 + .6))) return; const y = Math.max(pf(...A2), pf(...B2)) + 3.6 + r() * 1.6; tendederoAB([A2[0], y, A2[1]], [B2[0], y + (r() - .5) * .5, B2[1]], r, .4 + r() * .3) }));
  ANILLOS.forEach(([r0, r1, nm]) => { if (nm !== "callejon") return; const n = Math.floor(Math.PI * 2 * r0 / 7); for (let k = 0; k < n; k++) { if (r() < .4) continue; const a = (k + r() * .5) / n * Math.PI * 2, A2 = [Math.cos(a) * (r0 - .1), Math.sin(a) * (r0 - .1)], B2 = [Math.cos(a + .02) * (r1 + .1), Math.sin(a + .02) * (r1 + .1)];
    if (riscoH(...A2) > 1 || enRadial(...A2, 1)) continue; const y = pf(...A2) + 2.9 + r() * 1.2; tendederoAB([A2[0], y, A2[1]], [B2[0], y, B2[1]], r, .3) } }) }

// ---------- BANDERINES (triángulos de colores en cuerdas): cruzando la plaza, la avenida del mercado y la calle A
const BAND_L = [];
function banderines(A, B, sag = .8) { const pt = q => [lerp(A[0], B[0], q), lerp(A[1], B[1], q) - Math.sin(q * Math.PI) * sag, lerp(A[2], B[2], q)], L = Math.hypot(B[0] - A[0], B[1] - A[1], B[2] - A[2]), n = Math.floor(L / .36), ang = Math.atan2(B[0] - A[0], B[2] - A[2]);
  for (let k = 0; k < 14; k++) cuerda(PB, pt(k / 14), pt((k + 1) / 14), .008); for (let k = 1; k < n; k++) { const p = pt(k / n); BAND_L.push([p[0], p[1], p[2], ang]) } }
{ const r = rng(7780), fachada = (a, h) => { const x = Math.cos(a) * 15.7, z = Math.sin(a) * 15.7; return [x, pf(x, z) + h, z] };
  for (const [a0, a1] of [[-150, 20], [-30, 160], [70, 230], [120, -60], [-100, 80], [10, 190]]) { const A = fachada(a0 * Math.PI / 180, 7.4), B = fachada(a1 * Math.PI / 180, 7.4); if (!hayCasa(A[0] * 1.06, A[2] * 1.06) || !hayCasa(B[0] * 1.06, B[2] * 1.06)) continue; banderines(A, B, .9) }
  for (const c of CALLES_RAD) for (let rr = 18; rr < 60; rr += 7) { if (r() < .5 || TERR_B.some(b => rr > b - 7 && rr < b + 1)) continue; const A2 = radPunto(c, rr, -c.an / 2 - .1), B2 = radPunto(c, rr + 1, c.an / 2 + .1); if (!hayCasa(...radPunto(c, rr, -c.an / 2 - .6)) || !hayCasa(...radPunto(c, rr + 1, c.an / 2 + .6))) continue; const y = pf(...A2) + 5.2 + r(); banderines([A2[0], y, A2[1]], [B2[0], y, B2[1]], .45) }
  const BM = new THREE.InstancedMesh((() => { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute([-.13, 0, 0, .13, 0, 0, 0, -.3, 0], 3)); g.computeVertexNormals(); return g })(), new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .9, side: THREE.DoubleSide }), BAND_L.length), cc = new THREE.Color(), COLS = ["#c83a2e", "#e8b838", "#3a7ac0", "#efe6d0", "#4a9a4a", "#d86a2a", "#8a4ab0"];
  BAND_L.forEach(([x, y, z, ang], i) => { dummy.position.set(x, y, z); dummy.rotation.set((r() - .5) * .3, ang + Math.PI / 2, 0); dummy.scale.setScalar(1); dummy.updateMatrix(); BM.setMatrixAt(i, dummy.matrix); BM.setColorAt(i, cc.set(COLS[i % COLS.length])) }); BM.castShadow = true; scene.add(BM) }

// ---------- PUENTES COLGANTES DE MADERA entre las casas de los dos lados de las calles radiales (a la altura del segundo piso)
const PUENTES = [];
{ const r = rng(7790);
  CALLES_RAD.forEach(c => [3, 4, 5, 6].forEach(fi => { const F = FILAS[fi]; if (r() < .45) return; const rr = lerp(F.r0, F.r1, .45), A2 = radPunto(c, rr, -c.an / 2 - .05), B2 = radPunto(c, rr, c.an / 2 + .05);
    if (!hayCasa(...radPunto(c, rr, -c.an / 2 - .7)) || !hayCasa(...radPunto(c, rr, c.an / 2 + .7))) return; const y = Math.max(pf(...A2), pf(...B2)) + 5.3, A = [A2[0], y, A2[1]], B = [B2[0], y, B2[1]], ang = Math.atan2(B[0] - A[0], B[2] - A[2]), Lp = Math.hypot(B[0] - A[0], B[2] - A[2]), pt = q => [lerp(A[0], B[0], q), y - Math.sin(q * Math.PI) * .45, lerp(A[2], B[2], q)];
    const n = Math.round(Lp / .2); for (let k = 0; k < n; k++) { const q = (k + .5) / n, p = pt(q), dy = Math.cos(q * Math.PI) * .45 * Math.PI / Lp; PB.add(k % 5 ? "madera" : "maderaV", new THREE.BoxGeometry(1.05 + (r() - .5) * .08, .05, .17), TM(p[0], p[1], p[2], 0, ang, 0).multiply(TM(0, 0, 0, Math.atan(dy), 0, 0))) }
    for (const s of [-1, 1]) { const off = (q, h) => { const p = pt(q); return [p[0] + Math.cos(ang) * s * .52, p[1] + h, p[2] - Math.sin(ang) * s * .52] };
      for (let k = 0; k < 10; k++) { cuerda(PB, off(k / 10, .95), off((k + 1) / 10, .95), .02); cuerda(PB, off(k / 10, -.04), off((k + 1) / 10, -.04), .018); cuerda(PB, off(k / 10, -.02), off(k / 10, .95), .01) }
      for (const q of [0, 1]) { const p = off(q, 0); PB.add("viga", new THREE.BoxGeometry(.12, 1.3, .12), TM(p[0], p[1] + .5, p[2])) } }
    for (const P of [A, B]) PB.add("oscuro", new THREE.PlaneGeometry(.9, 1.9), TM(P[0], P[1] + .95, P[2], 0, ang + (P === A ? 0 : Math.PI), 0).multiply(TM(0, 0, -.06)));
    PUENTES.push({ A, B }); VELAS_B.push({ p: pt(.5).map((v, i) => i === 1 ? v + .03 : v), h: .1, g: 0 }) })) }

// ---------- EL RISCO DEL ESTE: escalera tallada que sube en zigzag desde el final de la calle D hasta la cima (el «primer eslabón»),
// con baranda de hierro del lado del barranco, faroles, velas; arriba un descanso de piedra con el anclaje de hierro. RISCO_CIMA = [x, y, z]
const suaveB = (x, z) => SUELO(x, z) - Math.floor(sstB(20, 110, Math.hypot(x, z)) * 5) * 3.2;
const RISCO = (() => { const D = CALLES_RAD.find(c => c.n === "D"), [sx, sz] = radPunto(D, D.rMax + .5), cima = [RISCO_E[0] - 3.5, RISCO_E[1]], pts = [[sx, sz]], r = rng(7800);
  let p = [sx, sz], lado = 1, tramo = 0;
  for (let it = 0; it < 400; it++) { const dx = cima[0] - p[0], dz = cima[1] - p[1], dist = Math.hypot(dx, dz); if (dist < 2.5) break; const base = Math.atan2(dz, dx); let mejor = null;
    for (let k = 0; k <= 16; k++) { const a = base + lado * k / 16 * 1.45, q = [p[0] + Math.cos(a) * .8, p[1] + Math.sin(a) * .8], s = (suaveB(...q) - suaveB(...p)) / .8, cost = Math.abs(Math.min(s, 3) - .55) + k * .012; if (!mejor || cost < mejor[0]) mejor = [cost, q] }
    p = mejor[1]; pts.push(p); tramo += .8; if (tramo > 11 + r() * 4 && dist > 8) { lado = -lado; tramo = 0 } }
  pts.push(cima);
  // remuestreo cada 0,34 m y perfil con «mirada adelante»: nunca debajo del piso y con pendiente ≤ 0,75 (en el muro de 3,2 la escalera se levanta antes)
  const S = [[...pts[0], 0]]; for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]); for (let u = .34; u <= L; u += .34) S.push([lerp(a[0], b[0], u / L), lerp(a[1], b[1], u / L)]) }
  const G = S.map(q => SUELO(q[0], q[1]) + .05), Y = G.map(() => 0); for (let i = S.length - 1; i >= 0; i--) Y[i] = Math.max(G[i], i + 1 < S.length ? Y[i + 1] - .26 : G[i]);
  const L = PB, ESC = []; for (let i = 1; i < S.length; i++) { const a = S[i - 1], b = S[i], ry = Math.atan2(b[0] - a[0], b[1] - a[1]), cx = (a[0] + b[0]) / 2, cz = (a[1] + b[1]) / 2, top = Y[i], gnd = Math.min(G[i - 1], G[i]) - .6, hh = top - gnd;
    L.add("escalon", RB1(1.8, hh, .4, .05), TM(cx, gnd + hh / 2, cz, 0, ry, 0)); ESC.push({ cx, cz, ry, top });
    ESCALERAS_B.push({ cx, cz, ry, L: .36, W: 1.8, y0: top - .2, y1: top, n: 1 });
    if (i % 3 === 0) { // baranda del lado de abajo (el más bajo de los dos costados)
      const o = [Math.cos(ry), -Math.sin(ry)], l1 = SUELO(cx + o[0] * 1.6, cz + o[1] * 1.6), l2 = SUELO(cx - o[0] * 1.6, cz - o[1] * 1.6), sg = l1 < l2 ? 1 : -1, px = cx + o[0] * .82 * sg, pz = cz + o[1] * .82 * sg;
      L.add("hierroN", new THREE.CylinderGeometry(.03, .035, 1.0, 6), TM(px, top + .5, pz)); ESC[ESC.length - 1].poste = [px, top + 1.0, pz] }
    if (i % 26 === 13) { const o = [Math.cos(ry), -Math.sin(ry)]; farolB(cx - o[0] * 1.3, cz - o[1] * 1.3, 3.0) }
    if (r() < .12) VELAS_B.push({ p: [cx + (r() - .5) * 1.2, top, cz], h: .06 + r() * .2, g: 6, gorda: r() < .5 }) }
  const postes = ESC.filter(e => e.poste).map(e => e.poste); for (let k = 1; k < postes.length; k++) if (Math.hypot(postes[k][0] - postes[k - 1][0], postes[k][2] - postes[k - 1][2]) < 3) { cuerda(PB, postes[k - 1], postes[k], .022); cuerda(PB, [postes[k - 1][0], postes[k - 1][1] - .45, postes[k - 1][2]], [postes[k][0], postes[k][1] - .45, postes[k][2]], .015) }
  // el descanso de la cima, el anclaje (aro de hierro gigante en un bloque) y bolardos con cadena
  const yc = Math.max(Y[Y.length - 1], SUELO(...cima) + .05), C = TM(cima[0], yc, cima[1]);
  L.add("escalon", RB1(6, 1.4, 6, .08), C.clone().multiply(TM(0, -.7, 0))); for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; if (Math.abs(Math.sin(a)) < .3 && Math.cos(a) < 0) continue; const bx = Math.cos(a) * 2.8, bz = Math.sin(a) * 2.8; L.add("corona", RB1(.36, .8, .36, .06), C.clone().multiply(TM(bx, .4, bz))); const a2 = (k + 1) / 10 * Math.PI * 2; cuerda(PB, new THREE.Vector3(bx, .7, bz).applyMatrix4(C).toArray(), new THREE.Vector3(Math.cos(a2) * 2.8, .7, Math.sin(a2) * 2.8).applyMatrix4(C).toArray(), .03) }
  L.add("corona", RB1(1.8, 1.0, 1.8, .1), C.clone().multiply(TM(1.2, .5, 0))); L.add("hierroN", new THREE.TorusGeometry(.9, .16, 10, 24), C.clone().multiply(TM(1.2, 1.55, 0, 0, Math.PI / 2 + .2, 0)));
  for (const s of [-1, 1]) farolB(cima[0] - 2.2, cima[1] + s * 2.2, 2.6);
  for (let k = 0; k < 18; k++) { const a = r() * 6.28, d = 1 + r() * 1.6; VELAS_B.push({ p: [cima[0] + Math.cos(a) * d, yc, cima[1] + Math.sin(a) * d], h: .08 + r() * .25, g: 6, gorda: r() < .5 }) }
  // rocas grandes del risco y piedras sueltas
  { const P = []; for (let k = 0; k < 6000 && P.length < 520; k++) { const x = RISCO_E[0] + (r() - .5) * 80, z = RISCO_E[1] + (r() - .5) * 100, h = riscoH(x, z); if (h < 2 || S.some(q => Math.hypot(q[0] - x, q[1] - z) < 2.6) || Math.hypot(x - cima[0], z - cima[1]) < 4.5 || enCalle(x, z, 1) || !libreEn(x, z, 1, { zona: 1 })) continue; const s = P.length < 140 ? 2.5 + r() * 4.5 : .5 + r() * r() * 3.2; P.push([x, SUELO(x, z) - s * .3, z, s]) }
    const ms = GEO_PIEDRAS.map(g => { const m = new THREE.InstancedMesh(g, M_ROCA_G, P.length); m.count = 0; m.castShadow = m.receiveShadow = true; scene.add(m); return m }), cc = new THREE.Color();
    P.forEach(([x, y, z, s], i) => { const m = ms[i % 3], n = m.count++; dummy.position.set(x, y, z); dummy.rotation.set((r() - .5) * .5, r() * 6, (r() - .5) * .5); dummy.scale.set(s * (1 + r() * .6), s * (.45 + r() * .5), s); dummy.updateMatrix(); m.setMatrixAt(n, dummy.matrix); m.setColorAt(n, cc.set(["#9a958c", "#857f76", "#aaa59a", "#726e66", "#8e8a80"][r() * 5 | 0])) }) }
  return { pie: [sx, pf(sx, sz), sz], cima: [cima[0], yc, cima[1]], anclaje: new THREE.Vector3(1.2, 1.55, 0).applyMatrix4(C).toArray(), camino: S.map((q, i) => [q[0], Y[i], q[1]]) } })();
const RISCO_CIMA = RISCO.cima;

// ---------- árboles (patios de atrás, alrededor del risco y en las chacras de afuera), pasto en matas, piedras sueltas
const ARBOLES_B = [];
{ const r = rng(7810), A = ARBOLES_B;
  for (let k = 0; k < 9000 && A.length < 520; k++) { const ang = r() * 6.283, rr = 20 + Math.sqrt(r()) * 180, x = Math.cos(ang) * rr, z = Math.sin(ang) * rr; if (rr < 125 && !(rr > 42 && rr < 46) && r() < .85) continue;
    if (enCalle(x, z, 1.5) || !libreEn(x, z, 1.6, { zona: 1 }) || TERR_B.some(b => Math.abs(rr - b) < 1.6) || A.some(([a, b]) => Math.hypot(a - x, b - z) < 4.5) || Math.hypot(x - RISCO.cima[0], z - RISCO.cima[2]) < 6) continue; A.push([x, z, (rr > 125 ? 1.3 : .9) + r() * .9]); ocupa(x, z, 1.4); rectAdd({ x, z, ry: 0, w: 1.0, d: 1.0, arbol: 1 }) }
  const GA = [0, 1, 2].map(v => { const rr = rng(4710 + v), T = [], C = [], Hh = 2.6 + rr() * 1.2; T.push([tubo([[0, -.2, 0], [(rr() - .5) * .3, Hh * .4, (rr() - .5) * .3], [(rr() - .5) * .5, Hh * .8, (rr() - .5) * .5], [(rr() - .5) * .4, Hh, (rr() - .5) * .4]], .2, .08), TM()]);
    for (let k = 0; k < 4; k++) { const a = k / 4 * 6.283 + rr(), L = .8 + rr() * .7; T.push([tubo([[0, Hh * .7, 0], [Math.cos(a) * L * .5, Hh * .85, Math.sin(a) * L * .5], [Math.cos(a) * L, Hh + .3, Math.sin(a) * L]], .07, .03, 5, 5), TM()]) }
    for (let j = 0; j < 9; j++) { const a = rr() * 6.283, d = rr() * 1.1, s = .7 + rr() * .5; C.push([geoPiedra(4720 + v * 31 + j, 1, .8), TM(Math.cos(a) * d, Hh + .3 + rr() * .9, Math.sin(a) * d, 0, rr() * 6, 0, s, s * .85, s)]) }
    const gc = mergeG(C), pc = gc.attributes.position, uc = gc.attributes.uv; for (let i = 0; i < pc.count; i++) uc.setXY(i, pc.getX(i) / 1.4, (pc.getY(i) + pc.getZ(i)) / 1.4); return [mergeG(T), gc] });
  const ims = GA.map(([gt, gc]) => { const a = new THREE.InstancedMesh(gt, M_CORTEZA, A.length), b = new THREE.InstancedMesh(gc, M_COPA, A.length); a.count = b.count = 0; [a, b].forEach(m => { m.castShadow = m.receiveShadow = true; scene.add(m) }); return [a, b] }), cc = new THREE.Color();
  A.forEach(([x, z, s], i) => { const [a, b] = ims[i % 3], n = a.count++; b.count++; dummy.position.set(x, SUELO(x, z) - .05, z); dummy.rotation.set(0, r() * 6, 0); dummy.scale.set(s, s * (.9 + r() * .3), s); dummy.updateMatrix(); a.setMatrixAt(n, dummy.matrix); b.setMatrixAt(n, dummy.matrix); b.setColorAt(n, cc.set(["#7a9a4a", "#6a8a40", "#8aa656", "#5e8038", "#9aa458"][r() * 5 | 0])) }) }
const GEO_MATA_B = (() => { const r = rng(5001), pos = [], uv = [], idx = []; for (let b = 0; b < 6; b++) { const a = r() * 6.283, d = r() * .14, bx = Math.cos(a) * d, bz = Math.sin(a) * d, Hh = .22 + r() * .26, lean = (r() - .5) * .3, fa = r() * 6.283, wv = .028 + r() * .015, o = pos.length / 3;
    for (let k = 0; k <= 3; k++) { const s = k / 3, x = bx + s * s * lean * Hh * Math.cos(fa), y = s * Hh, z = bz + s * s * lean * Hh * Math.sin(fa), wd = wv * (1 - s * .85); pos.push(x - Math.sin(fa) * wd, y, z + Math.cos(fa) * wd, x + Math.sin(fa) * wd, y, z - Math.cos(fa) * wd); uv.push(0, s, 1, s) }
    for (let k = 0; k < 3; k++) { const i = o + k * 2; idx.push(i, i + 1, i + 2, i + 1, i + 3, i + 2) } }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const n = g.attributes.normal; for (let i = 0; i < n.count; i++) n.setXYZ(i, n.getX(i) * .3, 1, n.getZ(i) * .3); n.needsUpdate = true; g.normalizeNormals(); return g })();
const PASTO_B = (() => { const N = 22000, m = new THREE.InstancedMesh(GEO_MATA_B, new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .9, side: THREE.DoubleSide }), N), r = rng(7820), cc = new THREE.Color(); m.receiveShadow = true; m.castShadow = false; let n = 0;
  for (let k = 0; k < N * 5 && n < N; k++) { const ang = r() * 6.283, rr = 15 + Math.sqrt(r()) * 190, x = Math.cos(ang) * rr, z = Math.sin(ang) * rr; if (calleKB(x, z) > .05 || !libreEn(x, z, .25, { mc: -.4, zona: 1 }) || RISCO.camino.some(q => Math.abs(q[0] - x) < 1.4 && Math.abs(q[2] - z) < 1.4)) continue;
    const c0 = colorSueloB(x, z); if (rr < 124 && c0[1] < c0[0] * .95 && r() < .7) continue; const s = .55 + r() * .6; dummy.position.set(x, SUELO(x, z) - .02, z); dummy.rotation.set(0, r() * 6, 0); dummy.scale.set(s, s * (.7 + r() * .7), s); dummy.updateMatrix(); m.setMatrixAt(n, dummy.matrix);
    cc.setRGB(c0[0] * (.8 + r() * .25), c0[1] * (.9 + r() * .25), c0[2] * (.6 + r() * .2)); m.setColorAt(n, cc); n++ }
  m.count = n; scene.add(m); return m })();
const PASTO = PASTO_B;
{ const r = rng(7830), P = [], cc = new THREE.Color();
  for (let k = 0; k < 6000 && P.length < 1400; k++) { const ang = r() * 6.283, rr = 15 + Math.sqrt(r()) * 150, x = Math.cos(ang) * rr, z = Math.sin(ang) * rr, enc = calleKB(x, z); if (!libreEn(x, z, .3, { mc: -.3, zona: 1 }) || (enc > .3 && r() < .85)) continue; const s = .05 + r() * r() * (enc > .3 ? .1 : .3); P.push([x, SUELO(x, z) + s * .2, z, s * (1 + r() * .5), s * (.55 + r() * .3), s]) }
  const ms = GEO_PIEDRAS.map(g => { const m = new THREE.InstancedMesh(g, M_ROCA, Math.ceil(P.length / 3) + 2); m.castShadow = m.receiveShadow = true; m.count = 0; scene.add(m); return m });
  P.forEach(([x, y, z, sx, sy, sz], i) => { const m = ms[i % 3], n = m.count++; dummy.position.set(x, y, z); dummy.rotation.set((r() - .5) * .3, r() * 6, (r() - .5) * .3); dummy.scale.set(sx, sy, sz); dummy.updateMatrix(); m.setMatrixAt(n, dummy.matrix); m.setColorAt(n, cc.set(["#9a968a", "#86837a", "#aaa598", "#7a776e", "#a29a88"][r() * 5 | 0])) }) }
// ---------- afuera: pircas (muros bajos de piedra seca) entre las chacras y parvas de heno
{ const r = rng(7840), L = PB, pirca = (x0, z0, x1, z1) => { const Lw = Math.hypot(x1 - x0, z1 - z0), n = Math.ceil(Lw / 2.2); for (let k = 0; k < n; k++) { const x = lerp(x0, x1, (k + .5) / n), z = lerp(z0, z1, (k + .5) / n); if (riscoH(x, z) > 2) continue; L.add("muroT", uvMuro(new THREE.BoxGeometry(Lw / n + .05, .8 + r() * .2, .55), 3.2, r(), r()), TM(x, SUELO(x, z) + .3, z, 0, Math.atan2(x1 - x0, z1 - z0) + Math.PI / 2, 0)) } };
  for (const rr of [131, 150, 172, 196]) { const n = Math.ceil(Math.PI * 2 * rr / 6); for (let k = 0; k < n; k++) { if (r() < .12) continue; const a0 = k / n * Math.PI * 2, a1 = (k + 1) / n * Math.PI * 2; pirca(Math.cos(a0) * rr, Math.sin(a0) * rr, Math.cos(a1) * rr, Math.sin(a1) * rr) } }
  for (let k = 0; k < 44; k++) { const a = k / 44 * Math.PI * 2 + .03; if (r() < .25) continue; pirca(Math.cos(a) * 131, Math.sin(a) * 131, Math.cos(a) * 205, Math.sin(a) * 205) }
  for (let k = 0; k < 70; k++) { const a = r() * 6.283, rr = 135 + r() * 70, x = Math.cos(a) * rr, z = Math.sin(a) * rr; if (riscoH(x, z) > 2 || !libreEn(x, z, 2, { zona: 1 })) continue; const y = SUELO(x, z); L.add("saco", new THREE.CylinderGeometry(1.1, 1.3, 1.6, 12), TM(x, y + .8, z)); L.add("saco", new THREE.ConeGeometry(1.15, 1.2, 12), TM(x, y + 2.2, z)); ocupa(x, z, 1.5) } }
// ---------- las macetas (instanciadas): maceta de barro, mata verde y flores
{ const N = MACETAS_B.length, pot = new THREE.InstancedMesh(new THREE.LatheGeometry([[0, 0], [.07, 0], [.09, .14], [.1, .15], [.1, .17], [0, .17]].map(q => new THREE.Vector2(q[0], q[1])), 10), M_TERRACOTA, N), mata = new THREE.InstancedMesh(geoPiedra(7850, 1, .9).scale(.12, .1, .12).translate(0, .22, 0), new THREE.MeshStandardMaterial({ map: T_FOLLAJE.c, bumpMap: T_FOLLAJE.z, bumpScale: 4, roughness: .85 }), N),
    flor = new THREE.InstancedMesh(mergeG([0, 1, 2, 3, 4, 5].map(k => [new THREE.SphereGeometry(.028, 6, 4), TM(Math.cos(k * 1.05) * .07, .29 + (k % 2) * .03, Math.sin(k * 1.05) * .07)])), new THREE.MeshStandardMaterial({ roughness: .6 }), N), cc = new THREE.Color(), r = rng(7860);
  MACETAS_B.forEach(([x, y, z, s, ry], i) => { dummy.position.set(x, y, z); dummy.rotation.set(0, ry, 0); dummy.scale.setScalar(s); dummy.updateMatrix(); pot.setMatrixAt(i, dummy.matrix); mata.setMatrixAt(i, dummy.matrix); flor.setMatrixAt(i, dummy.matrix); mata.setColorAt(i, cc.set(["#6a9a48", "#5a8a40", "#7aa656"][r() * 3 | 0])); flor.setColorAt(i, cc.set(["#d83a4a", "#f0e0e8", "#e8b838", "#8a5ac0", "#f07a3a", "#ffffff"][r() * 6 | 0])) });
  [pot, mata, flor].forEach(m => { m.castShadow = true; m.receiveShadow = true; scene.add(m) }) }

// ---------- LUGARES PARA LA GENTE (las multitudes): [x, z] en el piso (sueloB da la altura)
const LUGARES_GENTE = (() => { const r = rng(7870), anillo = (r0, r1, n, evita = () => false) => { const L = []; for (let k = 0; k < n * 6 && L.length < n; k++) { const a = r() * 6.283, rr = r0 + r() * (r1 - r0), x = Math.cos(a) * rr, z = Math.sin(a) * rr; if (evita(x, z) || !libreEn(x, z, .35, { zona: 1 }) || L.some(([p, q]) => Math.hypot(p - x, q - z) < .8)) continue; L.push([+x.toFixed(2), +z.toFixed(2)]) } return L };
  const fueraAltar = (x, z) => Math.hypot(x - ALTAR.centro[0], z - ALTAR.centro[2]) < 3.4 || PUESTOS.some(p => Math.hypot(p.x - x, p.z - z) < 2.2);
  return { plaza: anillo(5.9, 13.6, 70, fueraAltar), mercado: PUESTOS.map(p => [+p.frente[0].toFixed(2), +p.frente[1].toFixed(2)]), puestos: PUESTOS.map(p => [+p.x.toFixed(2), +p.z.toFixed(2)]),
    altar: { centro: [ALTAR.centro[0], ALTAR.centro[2]], novio: ALTAR.novio, novia: ALTAR.novia, invitados: ALTAR.invitados },
    escuela: { pizarron: ESCUELA_B.pizarra.clone().multiply(TM(0, 1.55, .1)).elements.slice(12, 15), alumnos: [...Array(9)].map((_, i) => new THREE.Vector3((i % 3 - 1) * 1.7 + 1.2 + (i / 3 | 0) * .1, 0, 1.6 + (i / 3 | 0) * .75).applyMatrix4(ESCUELA_B.pizarra).toArray().filter((_, j) => j !== 1)), maestra: new THREE.Vector3(-1.9, 0, .8).applyMatrix4(ESCUELA_B.pizarra).toArray().filter((_, j) => j !== 1) },
    calleAncha: (() => { const L = []; for (let k = 0; k < 40; k++) { const a = -Math.PI / 2 + (k - 20) * .02, rr = TERR_B[0] + 3.2; L.push([+(Math.cos(a) * rr).toFixed(2), +(Math.sin(a) * rr).toFixed(2)]) } return L })(),
    tienda: [TI.P.puerta[0], TI.P.puerta[2]], trastienda: [[-1.6, -5.5], [.8, -5.5], [-1.6, -7.1], [.8, -7.1], [2.6, -6.4], [2.6, -8.4], [-2.6, -8.3]].map(([x, z]) => TI.W(x, 0, z)).map(p => [+p[0].toFixed(2), +p[2].toFixed(2)]),
    nell: [CASA_NELL_V.afuera[0], CASA_NELL_V.afuera[2]], risco: { pie: [RISCO.pie[0], RISCO.pie[2]], cima: [RISCO.cima[0], RISCO.cima[2]] } } })();

// ================= ADENTRO DE LA TIENDA DE SALLOW (local y trastienda). Coordenadas locales de la tienda (TI.at): origen al pie del frente,
// +z hacia la plaza; el local va de z = −0,3 a −3,45 (x ±2,5) y la trastienda de z = −3,9 a −10,2 (x ±4,3), alto 4,6.
// ---------- texturas: el libro (renglones de nombres a mano), el cartel, ladrillo refractario, brasas, cera derretida, telarañas
const T_LIBRO = tex(1024, 640, (g, w, h) => { const r = rng(7400); g.fillStyle = "#d8c8a0"; g.fillRect(0, 0, w, h); for (let k = 0; k < 40; k++) { const x = r() * w, y = r() * h, s = 20 + r() * 90, gr = g.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, "rgba(140,100,50,.25)"); gr.addColorStop(1, "rgba(140,100,50,0)"); g.fillStyle = gr; g.fillRect(x - s, y - s, 2 * s, 2 * s) }
  const sombra = g.createLinearGradient(w / 2 - 60, 0, w / 2 + 60, 0); sombra.addColorStop(0, "rgba(60,40,20,0)"); sombra.addColorStop(.5, "rgba(60,40,20,.55)"); sombra.addColorStop(1, "rgba(60,40,20,0)"); g.fillStyle = sombra; g.fillRect(w / 2 - 60, 0, 120, h);
  const N = ["Ada Merrow", "Tobias Fenn", "Lila Quarle", "Oswin Hale", "Bess Thornby", "Ivo Kettle", "Maud Penrose", "Silas Dunne", "Nell Ashby", "Corin Vale", "Edda Brisk", "Jory Lamb", "Hester Moss", "Pim Rowan", "Agnes Tull", "Wendel Crane", "Rosa Mill", "Aldo Finch", "Greta Hollis", "Tam Oakes", "Una Pell", "Basil Thorne"];
  g.strokeStyle = "rgba(120,140,170,.45)"; g.lineWidth = 1.5; for (const x0 of [40, w / 2 + 40]) for (let y = 70; y < h - 30; y += 26) { g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + w / 2 - 90, y); g.stroke() }
  g.strokeStyle = "rgba(170,60,50,.5)"; for (const x0 of [92, w / 2 + 92]) { g.beginPath(); g.moveTo(x0, 40); g.lineTo(x0, h - 20); g.stroke() }
  g.font = "italic 21px Georgia, serif"; g.fillStyle = "rgba(40,26,14,.88)"; let k = 0; for (const x0 of [40, w / 2 + 40]) for (let y = 66; y < h - 30; y += 26) { const n = N[(k * 7 + 3) % N.length]; g.fillText(String(1 + k).padStart(3, "0"), x0 + 4, y - 5); g.fillText(n, x0 + 60, y - 5); g.fillText(["— Mother's laugh", "— his wife", "— little brother", "— the dog Bram", "— first kiss", "— her father", "— the sea", "— sister"][k % 8], x0 + 250, y - 5);
    if (k % 3 === 1) { g.strokeStyle = "rgba(40,26,14,.7)"; g.beginPath(); g.moveTo(x0 + 58, y - 11); g.lineTo(x0 + 220, y - 9); g.stroke() } k++ }
  g.font = "bold 30px Georgia, serif"; g.fillStyle = "rgba(60,20,14,.9)"; g.fillText("RECEIVED", 70, 44); g.fillText("OWED", w / 2 + 70, 44) });
const T_CARTEL_S = tex(1024, 560, (g, w, h) => { const r = rng(7410); g.fillStyle = "#1e2420"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 70) { g.fillStyle = "rgba(0,0,0,.4)"; g.fillRect(0, y, w, 3) }
  for (let k = 0; k < 600; k++) { g.fillStyle = r() < .5 ? "rgba(0,0,0,.25)" : "rgba(180,170,140,.08)"; g.fillRect(r() * w, r() * h, 2 + r() * 30, 1 + r() * 2) }
  g.strokeStyle = "#8a7440"; g.lineWidth = 10; g.strokeRect(26, 26, w - 52, h - 52); g.font = "bold 190px Georgia, serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#b89a58"; g.fillText("SALLOW", w / 2, h * .38, w - 120);
  g.font = "bold 110px Georgia, serif"; g.fillText("· WAX ·", w / 2, h * .74); g.globalCompositeOperation = "destination-out"; for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(0,0,0,${.3 + r() * .5})`; g.beginPath(); g.arc(r() * w, r() * h, 1 + r() * 6, 0, 7); g.fill() } g.globalCompositeOperation = "destination-over"; g.fillStyle = "#1e2420"; g.fillRect(0, 0, w, h) });
const T_TELA_ARANA = tex(256, 256, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = "rgba(230,230,220,.55)"; g.lineWidth = 1.2; for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI / 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 250, Math.sin(a) * 250); g.stroke() } for (let rr = 20; rr < 250; rr += 18 + rr * .1) { g.beginPath(); for (let k = 0; k <= 9; k++) { const a = k / 9 * Math.PI / 2, q = rr * (1 - .08 * Math.sin(k * 2)); k ? g.lineTo(Math.cos(a) * q, Math.sin(a) * q) : g.moveTo(Math.cos(a) * q, Math.sin(a) * q) } g.stroke() } });
const T_BRASA = tex(256, 256, (g, w, h) => { const r = rng(7420); g.fillStyle = "#1a0602"; g.fillRect(0, 0, w, h); for (let k = 0; k < 160; k++) { const x = r() * w, y = r() * h, s = 6 + r() * 20, gr = g.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, r() < .5 ? "#ffd070" : "#ff7a20"); gr.addColorStop(.6, "rgba(200,50,10,.6)"); gr.addColorStop(1, "rgba(60,10,2,0)"); g.fillStyle = gr; g.fillRect(x - s, y - s, 2 * s, 2 * s) } });
const T_CERA_OLLA = tex(256, 256, (g, w, h) => { const r = rng(7430); g.fillStyle = "#c89a40"; g.fillRect(0, 0, w, h); for (let k = 0; k < 50; k++) { const x = r() * w, y = r() * h, s = 8 + r() * 26; g.strokeStyle = "rgba(255,230,160,.6)"; g.lineWidth = 2; g.beginPath(); g.arc(x, y, s, 0, 7); g.stroke(); g.fillStyle = "rgba(120,70,20,.3)"; g.beginPath(); g.arc(x + 2, y + 2, s * .8, 0, 7); g.fill() } });
const TIENDA_MATS = { madera: M_MADERA, maderaV: M_MADERA_V, hollin: M_HOLLIN, maderaN: M_MADERA_N, viga: M_VIGA, piz1: M_PIZ[1], vidrioC: M_VIDRIO_C, vidrio: M_VIDRIO, oscuro: M_OSCURO, hierro: M_HIERRO, hierroN: M_HIERRO_N, laton: M_LATON, piedraC: M_PIEDRA_C, cera: M_CERA, ceraV: M_CERA_V,
  lad: M_LAD[2], brasa: new THREE.MeshBasicMaterial({ map: T_BRASA, color: new THREE.Color().setRGB(2.2, 1.3, .8) }), ceraOlla: new THREE.MeshStandardMaterial({ map: T_CERA_OLLA, emissive: "#ff9030", emissiveMap: T_CERA_OLLA, emissiveIntensity: .55, roughness: .15, metalness: .1 }),
  libro: new THREE.MeshStandardMaterial({ map: T_LIBRO, roughness: .9 }), cuero: SM("#3a1e14", { roughness: .7 }), cartel: new THREE.MeshStandardMaterial({ map: T_CARTEL_S, roughness: .8, metalness: .1 }), tela: SM("#8a8070", { roughness: 1 }), soga: M_SOGA, saco: new THREE.MeshStandardMaterial({ color: "#a89878", bumpMap: T_TRAMA_D, bumpScale: 3, roughness: 1 }),
  barril: M_BARRIL, arana: new THREE.MeshBasicMaterial({ map: T_TELA_ARANA, transparent: true, depthWrite: false, side: THREE.DoubleSide, opacity: .8 }), hollinNegro: SM("#141210", { roughness: 1 }), papel: SM("#d8c8a8", { roughness: .95 }), tinta: SM("#101014", { roughness: .3 }) };
// ---------- FRASCOS (los recuerdos: un brillo pálido adentro) y TAPONES de cera, instanciados. FRASCOS_B: matrices; TAPONES_B / TAPONES_AG: matrices
const FRASCOS_B = [], TAPONES_B = [], TAPONES_AG = [];
const frasco = (M, h = .18, rr = .06) => FRASCOS_B.push(M.clone().multiply(TM(0, 0, 0, 0, hash2(FRASCOS_B.length, 3) * 6, 0, rr * 2, h, rr * 2)));
const tapon = (M, ag = false) => (ag ? TAPONES_AG : TAPONES_B).push(M.clone().multiply(TM(0, 0, 0, (hash2(TAPONES_B.length, 1) - .5) * .5, hash2(TAPONES_B.length, 2) * 6, (hash2(TAPONES_B.length, 4) - .5) * .5)));
const montonTapones = (M, n, rad = .08, ag = false) => { const r = rng(7440 + n + TAPONES_B.length); for (let k = 0; k < n; k++) { const a = r() * 6.283, d = Math.sqrt(r()) * rad, y = .012 + (1 - d / rad) * rad * .5 * r(); tapon(M.clone().multiply(TM(Math.cos(a) * d, y, Math.sin(a) * d, r() * 3, 0, r() * 3)), ag) } };
{ const L = L_TIENDA, at = TI.at, r = rng(7450), vel = (x, y, z, h = .2, gorda = false) => VELAS_B.push({ p: TI.W(x, y, z), h, g: 1, gorda });
  // chorreaduras de cera por todos lados: gotas largas que bajan de los alféizares, los estantes y la mesa
  const chorro = (x, y, z, largo, ry = 0) => { const g = new THREE.CapsuleGeometry(.012 + r() * .012, largo, 2, 5); L.add(r() < .5 ? "cera" : "ceraV", g, at(x, y - largo / 2, z, 0, ry, 0)); L.add("ceraV", new THREE.SphereGeometry(.025, 6, 4), at(x, y - largo - .01, z, 0, 0, 0, 1, 1.4, 1)) };
  const charco = (x, y, z, s = .3) => L.add(r() < .5 ? "cera" : "ceraV", new THREE.CylinderGeometry(s, s * 1.05, .012, 10), at(x, y + .006, z, 0, r() * 6, 0, 1, 1, .6 + r() * .5));
  // --- la vidriera: tres gradas con frascos y platitos de tapones
  const [vx0, vx1] = TI.VID; for (let k = 0; k < 3; k++) { const y = .75 + .05 + k * .52 + .03, z = -.45 - k * .12; for (let x = vx0 + .12; x < vx1 - .08; x += .15 + r() * .05) { if (r() < .2) { L.add("ceraV", new THREE.CylinderGeometry(.06, .05, .02, 10), at(x, y, z)); montonTapones(at(x, y + .02, z), 7, .05) } else frasco(at(x, y, z + (r() - .5) * .06), .14 + r() * .1, .045 + r() * .025) } }
  for (let k = 0; k < 10; k++) chorro(vx0 + r() * (vx1 - vx0), .74, .2, .1 + r() * .45);
  // --- el local: mostrador, estantes en las paredes (frascos, cajitas de tapones), velas colgadas, telarañas
  L.add("maderaN", new THREE.BoxGeometry(1.8, .95, .6), at(-.9, .2 + .475, -2.5)); L.add("maderaN", new THREE.BoxGeometry(1.95, .06, .72), at(-.9, 1.18, -2.5)); for (let k = 0; k < 4; k++) chorro(-1.7 + k * .45 + r() * .2, 1.15, -2.17, .2 + r() * .5);
  L.add("laton", new THREE.CylinderGeometry(.16, .16, .02, 16), at(-1.45, 1.22, -2.5)); L.add("laton", new THREE.CylinderGeometry(.015, .015, .4, 6), at(-1.45, 1.42, -2.5)); L.add("laton", new THREE.BoxGeometry(.5, .02, .02), at(-1.45, 1.62, -2.5)); for (const s of [-1, 1]) L.add("laton", new THREE.CylinderGeometry(.08, .06, .03, 10), at(-1.45 + s * .24, 1.5, -2.5));
  montonTapones(at(-.75, 1.21, -2.45), 26, .12); vel(-.25, 1.21, -2.6, .25, true); vel(-1.75, 1.21, -2.35, .12); charco(-.25, 1.21, -2.6, .1);
  const estante = (x0, x1, z, ry, y0, n, prof = .3) => { for (let k = 0; k < n; k++) { const y = y0 + k * .5, cx = (x0 + x1) / 2, Mx = at(0, 0, 0, 0, ry, 0); const P = (x, yy, zz) => at(0, 0, 0, 0, ry, 0).multiply(TM(x, yy, zz));
      L.add("maderaN", new THREE.BoxGeometry(x1 - x0, .04, prof), P(cx, y, z)); for (let x = x0 + .1; x < x1 - .06; x += .13 + r() * .06) { const q = r(); if (q < .45) frasco(P(x, y + .02, z + (r() - .5) * .08), .12 + r() * .12, .04 + r() * .025); else if (q < .7) { L.add("maderaN", RB1(.12, .07, .12, .01), P(x, y + .055, z)); montonTapones(P(x, y + .09, z), 4, .04) } else if (q < .8) { vel(...new THREE.Vector3(x, y + .02, z).applyMatrix4(new THREE.Matrix4().makeRotationY(ry)).toArray(), .06 + r() * .12) } }
      if (r() < .6) chorro(...new THREE.Vector3(x0 + r() * (x1 - x0), y, z + prof / 2).applyMatrix4(new THREE.Matrix4().makeRotationY(ry)).toArray(), .1 + r() * .3, ry) }
    for (const x of [x0 + .03, x1 - .03]) L.add("maderaN", new THREE.BoxGeometry(.05, n * .5 + .1, prof), at(0, 0, 0, 0, ry, 0).multiply(TM(x, y0 + n * .25 - .2, z))) };
  estante(.6, 3.3, -2.3, Math.PI / 2, .7, 5); estante(-3.3, -.4, -2.3, -Math.PI / 2, .7, 5);   // paredes del local (este y oeste)
  estante(-2.3, -.8, -3.4, 0, .9, 4, .24); estante(.8, 2.3, -3.4, 0, .9, 4, .24);           // a los lados de la puerta de atrás
  for (let k = 0; k < 6; k++) { const x = -1.8 + k * .7, z = -1.2 - (k % 2) * .9; for (let j = 0; j < 5; j++) { const xx = x + (j - 2) * .05, l = .5 + r() * .4; L.add("soga", new THREE.CylinderGeometry(.004, .004, l, 3), at(xx, HSt() - l / 2, z)); L.add(r() < .6 ? "cera" : "ceraV", new THREE.CylinderGeometry(.018, .02, .32, 6), at(xx, HSt() - l - .16, z)) } }
  function HSt() { return TI.HS - .02 }
  for (const [x, y, z, ry] of [[-2.45, 3.5, -.35, 0], [2.45, 3.5, -3.4, Math.PI], [-4.25, 4.5, -9.95, Math.PI / 2], [4.25, 4.5, -4.1, -Math.PI / 2], [-4.25, 4.5, -4.1, 0]]) L.add("arana", new THREE.PlaneGeometry(.9, .9), at(x, y - .3, z, 0, ry + Math.PI / 4, Math.PI / 4));
  // --- LA TRASTIENDA
  const ZB = TI.ZB, HT = TI.HT;
  // el fogón de ladrillo contra el fondo, con tres bocas de fuego y la campana de humo encima
  L.add("lad", uvMuro(new THREE.BoxGeometry(5.6, .8, 1.3), 1.6), at(-1.4, .6, ZB + .95)); L.add("piedraC", RB1(5.8, .1, 1.4, .02), at(-1.4, 1.03, ZB + .95));
  for (const x of [-3.1, -1.4, .3]) { L.add("oscuro", new THREE.PlaneGeometry(.7, .42), at(x, .55, ZB + 1.61)); L.add("brasa", new THREE.PlaneGeometry(.62, .3), at(x, .5, ZB + 1.6)); for (let k = 0; k < 6; k++) L.add("brasa", new THREE.DodecahedronGeometry(.06 + r() * .04, 0), at(x + (r() - .5) * .5, .32, ZB + 1.45 + r() * .1)); L.add("hierro", new THREE.BoxGeometry(.8, .05, .05), at(x, .79, ZB + 1.62)) }
  { const g = new THREE.CylinderGeometry(.7, 2.1, 1.6, 4, 1, true); g.rotateY(Math.PI / 4); L.add("hollin", uvMuro(g, 2), at(-1.4, 3.0, ZB + .9, 0, 0, 0, 1.55, 1, .62)); L.add("hollin", uvMuro(new THREE.BoxGeometry(1.4, 1.0, .9), 2), at(-1.4, 4.1, ZB + .75)) }
  // las ollas de hierro (cera hirviendo, con burbujas y cucharones)
  const OLLAS = [-3.1, -1.4, .3].map((x, i) => { const R = .5 - i * .04, H = .62; L.add("hierroN", new THREE.LatheGeometry([[0, 0], [R * .75, .02], [R, .2], [R * 1.02, H * .8], [R * .96, H], [R * 1.04, H + .03], [R * .9, H + .03], [R * .9, H - .05]].map(q => new THREE.Vector2(q[0], q[1])), 20), at(x, 1.08, ZB + .95));
    for (const s of [-1, 1]) L.add("hierroN", new THREE.TorusGeometry(.08, .018, 5, 10), at(x + s * (R + .05), 1.08 + H * .8, ZB + .95, 0, Math.PI / 2, 0));
    L.add("ceraOlla", new THREE.CircleGeometry(R * .9, 20), at(x, 1.08 + H - .1, ZB + .95, -Math.PI / 2)); for (let k = 0; k < 3; k++) chorro(x + (r() - .5) * R, 1.08 + H, ZB + .95 + R * .9, .15 + r() * .4);
    if (i !== 1) { const [g, m] = cilEntre([x + .1, 1.08 + H - .2, ZB + .95], [x + .5, 1.08 + H + .55, ZB + 1.35], .015, 5); L.add("maderaN", g, TI.MT.clone().multiply(m)); L.add("hierro", new THREE.SphereGeometry(.07, 8, 6, 0, 6.3, Math.PI / 2, Math.PI / 2), at(x + .1, 1.08 + H - .2, ZB + .95)) }
    return TI.W(x, 1.08 + H - .1, ZB + .95) });
  // chimenea del fogón: sale por el techo de la trastienda (humo)
  L.add("hollin", uvMuro(new THREE.BoxGeometry(1.0, 2.6, .8), 2.4), at(-1.4, HT + 1.1, ZB + .55)); for (const s of [-1, 1]) L.add("hierroN", new THREE.CylinderGeometry(.12, .14, .5, 10, 1, true), at(-1.4 + s * .22, HT + 2.6, ZB + .55)); HUMOS.push(new THREE.Vector3(...TI.W(-1.4, HT + 3.0, ZB + .55)));
  // mesas largas de trabajo (moldes, bloques de cera, cucharones, cuchillos, tapones)
  const mesa = (cx, cz, la, an, ry) => { const P = (x, y, z) => at(cx, 0, cz, 0, ry, 0).multiply(TM(x, y, z)); L.add("maderaN", new THREE.BoxGeometry(la, .09, an), P(0, .92, 0)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) L.add("maderaN", new THREE.BoxGeometry(.1, .88, .1), P(sx * (la / 2 - .12), .44, sz * (an / 2 - .1)));
    for (const sx of [-1, 1]) L.add("maderaN", new THREE.BoxGeometry(.06, .06, an - .2), P(sx * (la / 2 - .12), .2, 0)); L.add("maderaN", new THREE.BoxGeometry(la - .3, .06, .06), P(0, .2, 0));
    for (let x = -la / 2 + .4; x < la / 2 - .3; x += .55 + r() * .3) { const q = r(), zz = (r() - .5) * (an - .3);
      if (q < .3) { L.add("maderaN", new THREE.BoxGeometry(.5, .06, .32), P(x, .99, zz)); for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) { L.add("oscuro", new THREE.CircleGeometry(.022, 8), P(x - .2 + i * .08, 1.022, zz - .08 + j * .08, -Math.PI / 2)); if (r() < .5) tapon(P(x - .2 + i * .08, 1.03, zz - .08 + j * .08)) } }
      else if (q < .55) { for (let k = 0; k < 2 + r() * 4; k++) L.add(r() < .5 ? "cera" : "ceraV", RB1(.24, .1, .14, .02), P(x + (r() - .5) * .2, 1.01 + k * .1, zz, 0, r() * .4, 0)) }
      else if (q < .7) montonTapones(P(x, .965, zz), 30, .14);
      else if (q < .8) { L.add("hierro", new THREE.BoxGeometry(.28, .01, .04), P(x, .975, zz, 0, r(), 0)); L.add("maderaN", new THREE.BoxGeometry(.12, .025, .03), P(x + .18, .975, zz, 0, 0, 0)) }
      else if (q < .9) frasco(P(x, .965, zz), .2, .07);
      else { const p = new THREE.Vector3(x, .965, zz).applyMatrix4(at(cx, 0, cz, 0, ry, 0)); VELAS_B.push({ p: p.toArray(), h: .1 + r() * .25, g: 1, gorda: r() < .5 }) } }
    for (let k = 0; k < 6; k++) { const p = new THREE.Vector3(-la / 2 + r() * la, .92, an / 2).applyMatrix4(at(cx, 0, cz, 0, ry, 0)), [lx, , lz] = [p.x, p.y, p.z]; L.add("ceraV", new THREE.CapsuleGeometry(.014, .2 + r() * .4, 2, 5), new THREE.Matrix4().makeTranslation(p.x, p.y - .2, p.z)) } };
  mesa(-.4, -6.3, 5.0, 1.1, 0); mesa(3.45, -7.3, 4.2, .9, Math.PI / 2);
  // el escritorio de Sallow (contra la pared oeste): el cajón abierto con EL LIBRO y los tapones con agujerito
  { const P = (x, y, z, ...a) => at(-3.75, 0, -5.0).multiply(TM(x, y, z, ...a)); L.add("maderaN", new THREE.BoxGeometry(.75, .06, 1.5), P(0, .78, 0)); L.add("maderaN", new THREE.BoxGeometry(.7, .7, .45), P(0, .42, -.5)); for (const s of [-1, 1]) L.add("maderaN", new THREE.BoxGeometry(.08, .75, .08), P(-.3, .375, s * .68));
    L.add("maderaN", new THREE.BoxGeometry(.04, .74, 1.4), P(-.34, .4, 0));
    // el cajón (sale .42 hacia el este), con separadores
    const C = (x, y, z, ...a) => P(.42, .62, .25).multiply(TM(x, y, z, ...a)); L.add("maderaN", new THREE.BoxGeometry(.62, .02, .7), C(0, 0, 0)); for (const s of [-1, 1]) L.add("maderaN", new THREE.BoxGeometry(.62, .13, .02), C(0, .065, s * .34)); L.add("maderaN", new THREE.BoxGeometry(.02, .15, .7), C(.31, .065, 0)); L.add("maderaN", new THREE.BoxGeometry(.02, .13, .7), C(-.31, .065, 0)); L.add("laton", new THREE.TorusGeometry(.03, .006, 4, 10), C(.33, .07, 0, 0, Math.PI / 2, 0));
        // el libro abierto (tapas de cuero, páginas con renglones de nombres) en la mitad de atrás del cajón
    L.add("cuero", new THREE.BoxGeometry(.46, .025, .29), C(-.1, .02, 0)); { const g = new THREE.PlaneGeometry(.44, .27, 16, 2); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, .018 * Math.sin(Math.min(1, Math.abs(p.getX(i)) / .22) * Math.PI)); g.computeVertexNormals(); L.add("libro", g, C(-.1, .036, 0, -Math.PI / 2, 0, 0)) }
    // tapones con agujerito (de aguja) en los compartimientos de adelante
    for (let k = 0; k < 3; k++) montonTapones(C(.2, .012, -.24 + k * .24), 8, .05, true);
    L.add("hierro", new THREE.CylinderGeometry(.002, .002, .09, 4), C(.2, .03, .3, 0, 0, Math.PI / 2 - .2));   // la aguja
    // arriba del escritorio: tintero, pluma, papeles, una vela gorda
    L.add("tinta", new THREE.CylinderGeometry(.04, .045, .06, 10), P(.05, .84, -.45)); { const [g, m] = cilEntre([.05, .86, -.45], [.12, 1.08, -.3], .004, 4); L.add("papel", g, P(0, 0, 0).multiply(m)) }
    for (let k = 0; k < 4; k++) L.add("papel", new THREE.BoxGeometry(.21, .003, .3), P(.1 + (r() - .5) * .1, .812 + k * .003, .3 + (r() - .5) * .1, 0, (r() - .5) * .5, 0));
    VELAS_B.push({ p: new THREE.Vector3(.15, .81, -.1).applyMatrix4(P(0, 0, 0)).toArray(), h: .14, g: 1, gorda: true }); LUCES_PUNTOS.push([...new THREE.Vector3(.3, 1.3, 0).applyMatrix4(P(0, 0, 0)).toArray(), 2.5, "#ffb060", 5]);
    TI.P.cajon = new THREE.Vector3(0, .1, 0).applyMatrix4(C(0, 0, 0)).toArray(); TI.P.libro = new THREE.Vector3(0, .05, 0).applyMatrix4(C(-.1, 0, 0)).toArray(); TI.P.mesa = TI.W(-.4, .97, -6.3) }
  // estantes de frascos en la pared este de la trastienda (arriba de la mesa 2) y en la oeste
  estante(5.0, 9.6, -4.12, Math.PI / 2, 1.5, 5, .3); estante(-9.2, -5.6, -4.12, -Math.PI / 2, 1.3, 5, .3);
  // barriles de sebo, bolsas, cajones, moldes apilados, bloques de cera, baldes
  for (const [x, z] of [[3.6, -4.3], [-3.9, -8.3], [3.75, -9.75], [2.05, -9.75]]) barril(L, at(x, .2, z, 0, r() * 6, 0));
  for (let k = 0; k < 5; k++) L.add(r() < .5 ? "cera" : "ceraV", RB1(.36, .2, .26, .02), at(2.5 + (k % 3) * .4, .3 + (k / 3 | 0) * .2, -8.85, 0, r() * .3, 0));
  for (let k = 0; k < 4; k++) L.add("maderaN", new THREE.BoxGeometry(.6, .06, .36), at(-2.6, .23 + k * .07, -8.2, 0, (r() - .5) * .3, 0));
  for (let k = 0; k < 14; k++) charco(-4 + r() * 8, .2, -4.2 - r() * 5.6, .1 + r() * .35);
  // vigas con velas colgadas por la mecha y trapos, ganchos
  for (let b = 0; b < 4; b++) for (let k = 0; k < 9; k++) { const x = -3.6 + k * .9 + (r() - .5) * .2, z = -4.5 - b * 1.1 * 1 - .0, l = .3 + r() * .5; L.add("soga", new THREE.CylinderGeometry(.004, .004, l, 3), at(x, HT - .26 - l / 2, z)); L.add(r() < .5 ? "cera" : "ceraV", new THREE.CylinderGeometry(.02, .022, .36, 6), at(x, HT - .26 - l - .18, z)) }
  // ventanita alta del oeste (rayo de luna) y los puntos de la trastienda
  L.add("vidrio", new THREE.PlaneGeometry(1.0, .9), at(-4.42, 3.35, -6.4, 0, Math.PI / 2, 0)); for (const yy of [2.9, 3.8]) L.add("maderaN", new THREE.BoxGeometry(.3, .08, 1.08), at(-4.45, yy, -6.4));
  TI.P.olla = OLLAS[1]; TI.OLLAS = OLLAS;
  // afuera: velas derretidas por todo el frente, chorreaduras en la fachada debajo de cada ventana, el cartel
  for (let k = 0; k < 16; k++) chorro(-2.6 + r() * 5.2, .75 + r() * 2, .02, .2 + r() * .7);
  L.add("cartel", new THREE.BoxGeometry(1.15, .62, .05), TI.CARTEL); L.add("maderaN", new THREE.BoxGeometry(1.25, .08, .07), TI.CARTEL.clone().multiply(TM(0, .35, 0)));
  for (let k = 0; k < 8; k++) { const x = -2.4 + r() * 1.1; VELAS_B.push({ p: TI.W(x, .12, .4 + r() * .6), h: .05 + r() * .25, g: 1, gorda: r() < .4 }) }
  // luces puntuales sugeridas (el fuego del fogón, las velas del local, el cartel)
  LUCES_PUNTOS.push([...TI.W(-1.4, 1.0, ZB + 2.0), 8, "#ff8a3a", 9], [...TI.W(-.4, 1.6, -6.3), 3.5, "#ffb060", 7], [...TI.W(-1.0, 2.0, -2.0), 3, "#ffb060", 6], [...TI.W(0, 1.2, 1.0), 2, "#ffb060", 6]);
}
// ---------- los frascos y los tapones (instanciados)
const FRASCOS_M = (() => { const N = FRASCOS_B.length, g = new THREE.LatheGeometry([[0, 0], [.42, 0], [.5, .06], [.5, .78], [.38, .86], [.3, .9], [.3, .98], [0, .98]].map(q => new THREE.Vector2(q[0], q[1])), 12),
    vid = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({ color: "#a8bcb4", roughness: .08, metalness: .15, transparent: true, opacity: .38, depthWrite: false }), N),
    tapa = new THREE.InstancedMesh(new THREE.CylinderGeometry(.33, .33, .1, 10).translate(0, 1.0, 0), new THREE.MeshStandardMaterial({ color: "#c8b078", roughness: .6 }), N),
    luz = new THREE.InstancedMesh(new THREE.SphereGeometry(.26, 10, 8).translate(0, .42, 0), new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(1.5, 1.75, 1.6), transparent: true, opacity: .65, depthWrite: false }), N);
  const halo = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), M_HALO_B("#c8f0e0", .5), N), cc = new THREE.Color();
  FRASCOS_B.forEach((M, i) => { vid.setMatrixAt(i, M); tapa.setMatrixAt(i, M); luz.setMatrixAt(i, M); const p = new THREE.Vector3(0, .42, 0).applyMatrix4(M); dummy.position.copy(p); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(.22); dummy.updateMatrix(); halo.setMatrixAt(i, dummy.matrix); luz.setColorAt(i, cc.setHSL(.38 + hash2(i, 9) * .14, .35, .55 + hash2(i, 8) * .2)) });
  vid.renderOrder = 3; luz.renderOrder = 2; halo.renderOrder = 6; [vid, tapa, luz, halo].forEach(m => { m.castShadow = false; m.frustumCulled = false; scene.add(m) }); return { vid, tapa, luz, halo } })();
const TAPONES_M = (() => { const geo = ag => { const g = mergeG([[new THREE.CylinderGeometry(.5, .42, .9, 8), TM(0, .45, 0)], [new THREE.SphereGeometry(.5, 8, 4, 0, 6.3, 0, Math.PI / 2), TM(0, .9, 0, 0, 0, 0, 1, .6, 1)]]), p = g.attributes.position, c = new Float32Array(p.count * 3);
      for (let i = 0; i < p.count; i++) { const hole = ag && p.getY(i) > 1.1 && Math.hypot(p.getX(i), p.getZ(i)) < .2; c[i * 3] = hole ? .05 : 1; c[i * 3 + 1] = hole ? .04 : 1; c[i * 3 + 2] = hole ? .03 : 1 } g.setAttribute("color", new THREE.BufferAttribute(c, 3)); return g };
  const mat = new THREE.MeshStandardMaterial({ color: "#efe0b0", roughness: .45, vertexColors: true, emissive: "#3a2808", emissiveIntensity: .2 }), out = [];
  for (const [L, ag] of [[TAPONES_B, false], [TAPONES_AG, true]]) { const m = new THREE.InstancedMesh(geo(ag), mat, Math.max(1, L.length)); m.count = L.length; L.forEach((M, i) => { m.setMatrixAt(i, M.clone().multiply(TM(0, 0, 0, 0, 0, 0, ag ? .026 : .018, ag ? .03 : .02, ag ? .026 : .018))) }); m.castShadow = true; m.frustumCulled = false; scene.add(m); out.push(m) } return out })();
// ---------- vapor de las ollas y rayo de luna por la ventanita (los anima ollaVapor y el clima)
const RAYO_TIENDA = (() => { const g = new THREE.CylinderGeometry(.5, 1.4, 5, 4, 1, true); g.translate(0, -2.5, 0); g.rotateY(Math.PI / 4); const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: "#7a9ad0", transparent: true, opacity: .07, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  m.applyMatrix4(TI.at(-4.3, 3.35, -6.4, 0, 0, -.75)); scene.add(m); return m })();

// ================= LA ATMÓSFERA: humo de chimeneas, vapor de las ollas, polvo en el aire, niebla baja (Sallow), estrellas, luna, disco del sol,
// polillas alrededor de las velas de la tienda y moscas. Todo lo anima atmosfera(t, clima), que llama ambiente(t)
// humo: puntos que suben y se abren (cada fuente: `per` bocanadas en fila). o: { per, sube, tam, vel, col, op }
const T_PUFF = (() => { const t = tex(128, 128, (g, w, h) => { const r = rng(7590); g.clearRect(0, 0, w, h); for (let k = 0; k < 26; k++) { const a = r() * 6.28, d = r() * 30, x = 64 + Math.cos(a) * d, y = 64 + Math.sin(a) * d, s = 14 + r() * 22, gr = g.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, "rgba(255,255,255,.35)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(x - s, y - s, 2 * s, 2 * s) } }); return t })();
function crearHumo(fuentes, o = {}) { const per = o.per || 6, N = fuentes.length * per, pos = new Float32Array(N * 3), sd = new Float32Array(N);
  fuentes.forEach((p, i) => { for (let k = 0; k < per; k++) { const j = i * per + k; pos[j * 3] = p[0]; pos[j * 3 + 1] = p[1]; pos[j * 3 + 2] = p[2]; sd[j] = (k + hash2(i, k) * .8) / per + hash2(i, 7) } });
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("sd", new THREE.BufferAttribute(sd, 1));
  const U = { uT: { value: 0 }, uCol: { value: new THREE.Color(o.col || "#aaaaaa") }, uMap0: { value: 0 }, uOp: { value: o.op ?? .5 }, uSube: { value: o.sube || 7 }, uTam: { value: o.tam || 3 }, uVel: { value: o.vel || .1 }, uFogD: VELA_U.uFogD, uViento: { value: new THREE.Vector2(.7, .25) }, map: { value: o.map || T_PUFF }, uH: { value: H * .5 } };
  const m = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false,
    vertexShader: `attribute float sd; uniform float uT, uSube, uTam, uVel, uFogD, uH; uniform vec2 uViento; varying float vA; varying float vF; varying float vR;
      void main(){ float ph = fract(uT * uVel + sd); vec3 p = position; float h = ph * uSube; p.y += h; p.xz += uViento * h * h / uSube * .8 + vec2(sin(sd * 40. + uT * .7), cos(sd * 31. + uT * .6)) * h * .14;
        vec4 mv = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mv; float d = max(.3, -mv.z); gl_PointSize = min(900., uTam * (.3 + ph * 1.2) * projectionMatrix[1][1] * uH / d);
        vA = smoothstep(0., .15, ph) * (1. - ph) * smoothstep(.5, 3., d); vF = exp(-uFogD * uFogD * d * d); vR = sd * 37. + uT * .2 * (fract(sd * 9.) - .5); }`,
    fragmentShader: `uniform sampler2D map; uniform vec3 uCol; uniform float uOp; varying float vA; varying float vF; varying float vR; void main(){ vec2 q = gl_PointCoord - .5; float c = cos(vR), s = sin(vR); q = vec2(c * q.x - s * q.y, s * q.x + c * q.y) + .5; float a = texture2D(map, q).a * 1.6; gl_FragColor = vec4(uCol * (.75 + .25 * vF), a * a * vA * uOp * (.35 + .65 * vF)); }` }));
  m.frustumCulled = false; m.renderOrder = 4; scene.add(m); return { m, U } }
// humo de las chimeneas: unas 300 (las más cercanas al centro primero; las demás sin humo)
const HUMO_CH = crearHumo(HUMOS.map(v => [v.x, v.y, v.z]).sort((a, b) => Math.hypot(a[0], a[2]) - Math.hypot(b[0], b[2])).filter((_, i) => i < 90 || i % 4 === 0).slice(0, 200), { per: 16, sube: 12, tam: 3.2, vel: .05, op: .13 });
// vapor de las ollas de la trastienda (ollaVapor)
const VAPOR = crearHumo(TI.OLLAS.flatMap(p => [0, 1, 2, 3].map(k => [p[0] + (k % 2 - .5) * .3, p[1] + .05, p[2] + ((k >> 1) - .5) * .3])), { per: 14, sube: 1.9, tam: .7, vel: .32, op: .2, col: "#e8e4d8", map: GLOW }); VAPOR.U.uViento.value.set(0, .15);
// ollaVapor(t, u): vapor de las ollas (u = cuánto: 0 nada, 1 normal, 2 mucho) y burbujas en la cera
function ollaVapor(t, u = 1) { VAPOR.U.uT.value = t; VAPOR.U.uOp.value = .4 * u; VAPOR.m.visible = u > 0; TIENDA_MATS.ceraOlla.emissiveIntensity = .5 + .12 * Math.sin(t * 5) + .08 * Math.sin(t * 13.7); if (TIENDA_MATS.ceraOlla.map) TIENDA_MATS.ceraOlla.map.offset.set(Math.sin(t * .3) * .05, t * .02) }
// polvo en el aire: motas alrededor de la cámara (caja de 28 m que se repite), brillan contra la luz
const POLVO_B = (() => { const N = 5000, r = rng(7600), pos = new Float32Array(N * 3); for (let i = 0; i < N * 3; i++) pos[i] = r() * 28;
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); const U = { uT: { value: 0 }, uCam: { value: new THREE.Vector3() }, uI: { value: .5 }, uCol: { value: new THREE.Color("#fff0d0") }, uH: { value: H * .5 }, map: { value: GLOW } };
  const m = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `uniform float uT, uH; uniform vec3 uCam; varying float vA; void main(){ vec3 b = position + vec3(sin(uT * .13 + position.y) * 1.5 + uT * .12, sin(uT * .09 + position.x) * 1.2 - uT * .05, cos(uT * .11 + position.z) * 1.5);
      vec3 p = uCam + mod(b - uCam + 14., 28.) - 14.; vec4 mv = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mv; float d = max(.2, -mv.z); gl_PointSize = clamp(.012 * projectionMatrix[1][1] * uH / d, 1., 4.);
      vA = smoothstep(14., 6., length(p - uCam)) * smoothstep(.3, 1.2, d) * (.5 + .5 * sin(uT * 2. + position.x * 7.)); }`,
    fragmentShader: `uniform sampler2D map; uniform vec3 uCol; uniform float uI; varying float vA; void main(){ float a = texture2D(map, gl_PointCoord).a; gl_FragColor = vec4(uCol * a * vA * uI, 1.); }` }));
  m.frustumCulled = false; m.renderOrder = 7; scene.add(m); return { m, U } })();
// niebla baja (clima sallow): bancos de niebla a ras del piso alrededor de la tienda y la plaza, que se mueven despacio
const NIEBLA_B = (() => { const N = 420, r = rng(7610), m = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({ uniforms: { map: { value: GLOW }, uT: VELA_U.uT, uCol: { value: new THREE.Color() }, uOp: { value: 0 }, uFogD: VELA_U.uFogD }, transparent: true, depthWrite: false,
    vertexShader: `uniform float uT; varying vec2 vUv; varying float vA; void main(){ vUv = uv; vec4 c = modelMatrix * instanceMatrix * vec4(0., 0., 0., 1.); float s = length(instanceMatrix[0].xyz); float ph = c.x * .37 + c.z * .21;
      c.x += sin(uT * .05 + ph) * 3.; c.z += cos(uT * .04 + ph) * 2.; vec4 mv = viewMatrix * c; mv.xy += position.xy * vec2(s, s * .45); gl_Position = projectionMatrix * mv; float d = -mv.z; vA = smoothstep(1.5, 7., d); }`,
    fragmentShader: `uniform sampler2D map; uniform vec3 uCol; uniform float uOp; varying vec2 vUv; varying float vA; void main(){ float a = texture2D(map, vUv).a; gl_FragColor = vec4(uCol, a * a * uOp * vA); }` }), N);
  for (let i = 0; i < N; i++) { const a = r() * 6.283, d = Math.sqrt(r()) * 70, x = Math.cos(a) * d * .9, z = TIENDA[1] * .5 + Math.sin(a) * d, s = 5 + r() * 9; dummy.position.set(x, sueloB(x, z) + .5 + r() * 1.3, z); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(s); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix) }
  m.frustumCulled = false; m.renderOrder = 8; m.visible = false; scene.add(m); return m })();
// estrellas (muchas, chiquitas, algunas titilan) y la luna (disco con mares y halo), y el disco del sol
const ESTRELLAS_B = (() => { const N = 3200, r = rng(7620), pos = new Float32Array(N * 3), sz = new Float32Array(N); for (let i = 0; i < N; i++) { const u = r(), v = r() * .96 + .04, th = u * 6.283, y = v, rr = Math.sqrt(1 - y * y); pos.set([Math.cos(th) * rr * 430, y * 430, Math.sin(th) * rr * 430], i * 3); sz[i] = r() < .04 ? 3.2 : 1 + r() * 1.4 }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("sz", new THREE.BufferAttribute(sz, 1));
  const m = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms: { uT: VELA_U.uT, uI: { value: 1 } }, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float sz; uniform float uT; varying float vA; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.); gl_Position = projectionMatrix * mv; gl_PointSize = sz * 1.6; vA = (.6 + .4 * sin(uT * (1.5 + sz) + position.x)) * smoothstep(0., .25, position.y / 430.); }`,
    fragmentShader: `uniform float uI; varying float vA; void main(){ float d = length(gl_PointCoord - .5); gl_FragColor = vec4(vec3(.85, .9, 1.) * smoothstep(.5, .1, d) * vA * uI, 1.); }` }));
  m.frustumCulled = false; m.renderOrder = -.5; m.visible = false; scene.add(m); return m })();
const T_LUNA = tex(256, 256, (g, w, h) => { const r = rng(7630); const gr = g.createRadialGradient(110, 110, 10, 128, 128, 120); gr.addColorStop(0, "#f4f2ea"); gr.addColorStop(1, "#c8ccd2"); g.fillStyle = gr; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill();
  for (let k = 0; k < 14; k++) { const a = r() * 6.28, d = r() * 90, s = 8 + r() * 30; g.fillStyle = `rgba(120,128,140,${.2 + r() * .25})`; g.beginPath(); g.arc(128 + Math.cos(a) * d, 128 + Math.sin(a) * d, s, 0, 7); g.fill() } });
const LUNA_B = (() => { const G = new THREE.Group(), d = new THREE.Mesh(new THREE.CircleGeometry(11, 32), new THREE.MeshBasicMaterial({ map: T_LUNA, fog: false, color: new THREE.Color().setRGB(1.6, 1.65, 1.8) })), h = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#8aa8e8", transparent: true, opacity: .55, fog: false, depthWrite: false, blending: THREE.AdditiveBlending }));
  h.scale.setScalar(110); G.add(h, d); G.visible = false; G.renderOrder = -.4; scene.add(G); return { G, d, h } })();
const SOL_DISCO = (() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#fff0d0", transparent: true, opacity: 1, fog: false, depthWrite: false, blending: THREE.AdditiveBlending })); s.visible = false; scene.add(s); return s })();
// polillas alrededor de las velas de la tienda y de algunos faroles; moscas en el clima sallow (en CPU: pocas)
const POLILLAS = (() => { const N = 140, geo = mergeG([[new THREE.PlaneGeometry(.035, .028), TM(.018, 0, 0, 0, 0, .3)], [new THREE.PlaneGeometry(.035, .028), TM(-.018, 0, 0, 0, 0, -.3)]]), m = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color: "#c8b89a", roughness: 1, side: THREE.DoubleSide, emissive: "#3a2a10", emissiveIntensity: .4 }), N);
  const r = rng(7640), C = VELAS_B.filter(v => v.g === 1 || v.g === 4).filter((_, i) => i % 2 === 0), P = Array.from({ length: N }, (_, i) => { const v = C[(r() * C.length) | 0] || { p: [0, 1, 0] }; return { c: [v.p[0], v.p[1] + .25 + r() * .3, v.p[2]], rad: .15 + r() * .5, w: (r() < .5 ? -1 : 1) * (2 + r() * 3), ph: r() * 6.28, mosca: i > 90 } });
  m.frustumCulled = false; m.castShadow = false; scene.add(m); return { m, P } })();
function atmosfera(t, A) { const cp = cam.position;
  CASA_MATS.luz.emissiveIntensity = .25 + 1.3 * Math.min(1.2, A.ventanas ?? .5);
  HUMO_CH.U.uT.value = t; HUMO_CH.U.uCol.value.set(A.humo || "#aaaaaa"); HUMO_CH.U.uOp.value = A.niebla ? .3 : .45;
  POLVO_B.U.uT.value = t; POLVO_B.U.uCam.value.copy(cp); POLVO_B.U.uI.value = (A.polvo ?? .5) * (A.cielo === 2 ? .35 : A.cielo === 3 ? .45 : .9); POLVO_B.U.uCol.value.set(A.cielo === 2 ? "#a8b8e0" : A.cielo === 3 ? "#c8d0c0" : "#fff0d0");
  NIEBLA_B.visible = (A.niebla || 0) > 0; NIEBLA_B.material.uniforms.uOp.value = .42 * (A.niebla || 0); NIEBLA_B.material.uniforms.uCol.value.copy(scene.fog.color).multiplyScalar(1.05);
  ESTRELLAS_B.visible = (A.estrellas || 0) > 0; ESTRELLAS_B.position.copy(cp);
  const d = SOL.dir || A.sol || [0, 1, 0], l = Math.hypot(...d); LUNA_B.G.visible = (A.luna || 0) > 0; if (LUNA_B.G.visible) { LUNA_B.G.position.set(cp.x + d[0] / l * 400, cp.y + d[1] / l * 400, cp.z + d[2] / l * 400); LUNA_B.d.lookAt(cp) }
  SOL_DISCO.visible = A.cielo === 0 || A.cielo === 1; if (SOL_DISCO.visible) { SOL_DISCO.position.set(cp.x + d[0] / l * 400, cp.y + d[1] / l * 400, cp.z + d[2] / l * 400); SOL_DISCO.scale.setScalar(A.cielo === 1 ? 160 : 70); SOL_DISCO.material.color.set(A.cielo === 1 ? "#ffb070" : "#fff4e0") }
  RAYO_TIENDA.visible = A.cielo === 2 || A.cielo === 3; RAYO_TIENDA.material.opacity = A.cielo === 2 ? .09 : .05;
  const mos = A.niebla > 0; POLILLAS.P.forEach((q, i) => { const a = t * q.w + q.ph, rr = q.rad * (1 + .3 * Math.sin(t * 1.7 + q.ph)), on = !q.mosca || mos;
    dummy.position.set(q.c[0] + Math.cos(a) * rr, q.c[1] + Math.sin(t * 2.3 + q.ph) * .15 + (q.mosca ? -.3 : 0), q.c[2] + Math.sin(a) * rr); dummy.rotation.set(0, -a, 0); const f = .4 + .6 * Math.abs(Math.sin(t * 40 + i)); dummy.scale.set(on ? (q.mosca ? .4 : 1) * f + .2 : 0, on ? 1 : 0, on ? (q.mosca ? .5 : 1) : 0); dummy.updateMatrix(); POLILLAS.m.setMatrixAt(i, dummy.matrix) });
  POLILLAS.m.instanceMatrix.needsUpdate = true; POLILLAS.m.material.color.set(mos ? "#2a2622" : "#c8b89a") }

// ================= todo junto
PB.fin(scene, PB_M); { const ms = PBV.fin(scene, PBV_M); Object.values(ms).forEach(m => { m.castShadow = true }) }
const TIENDA_M = L_TIENDA.fin(scene, TIENDA_MATS); ["vidrioC", "vidrio", "oscuro", "brasa", "ceraOlla", "frascoLuz"].forEach(k => { if (TIENDA_M[k]) TIENDA_M[k].castShadow = false });
velasArmar();

// ================= LOS CLIMAS DE LUZ. Las escenas hacen una vez Object.assign(ENV, ENV_CAMPANA_CIUDAD) y después setEnv(nombre).
// Además de lo del motor (top, hor, fog, hemi, hemiG, sun, sunCol, exp, grade) cada clima trae: sol (dirección hacia el sol o la luna),
// sombra (radio de la caja de sombras), velas (brillo de las llamas y halos), ventanas (brillo de las ventanas con vela), tiembla (cuánto
// tiemblan las llamas), estrellas, luna, niebla (niebla baja espesa), polvo (motas en el aire), humo (color del humo), luces (luces puntuales)
const ENV_CAMPANA_CIUDAD = {
  // sol alto y duro (≈ 48°), cielo azul con bruma; sombras duras y largas hacia el noreste
  mediodia: { top: "#3f7cc8", hor: "#c6d6e0", fog: .0034, hemi: 1.05, hemiG: "#7a6a52", sun: 3.9, sunCol: "#fff3de", exp: 1.12, grade: ["#fff4e0", .03], sol: [-.55, .8, .5], sombra: 95,
    velas: .35, ventanas: .1, tiembla: .8, estrellas: 0, luna: 0, niebla: 0, polvo: .55, humo: "#b8b4aa", luces: .15, cielo: 0 },
  // sol bajo naranja del oeste, cielo dorado-rosa, bruma cálida, sombras larguísimas
  atardecer: { top: "#4e5a92", hor: "#f2a878", fog: .0045, hemi: .8, hemiG: "#5a3a28", sun: 3.4, sunCol: "#ff9a52", exp: 1.22, grade: ["#ff9850", .09], sol: [-1, .2, .32], sombra: 120,
    velas: .75, ventanas: .65, tiembla: .9, estrellas: 0, luna: 0, niebla: 0, polvo: .9, humo: "#b89a8a", luces: .55, cielo: 1 },
  // luna fría azul, cielo oscuro estrellado; miles de velas cálidas en las ventanas y faroles
  noche: { top: "#04081a", hor: "#18223c", fog: .0062, hemi: .32, hemiG: "#120e0a", sun: .7, sunCol: "#8eaaf0", exp: 1.55, grade: ["#3a5aa0", .07], sol: [.42, .78, -.46], sombra: 95,
    velas: 1.5, ventanas: 1.6, tiembla: 1, estrellas: 1, luna: 1, niebla: 0, polvo: .3, humo: "#4a5266", luces: 1.6, cielo: 2 },
  // sombrío (cerca de Sallow y su tienda): luz fría verdosa-gris, casi sin sol, niebla baja espesa, velas que tiemblan, moscas
  sallow: { top: "#2e3834", hor: "#56605a", fog: .021, hemi: .5, hemiG: "#22241e", sun: .28, sunCol: "#b0c4b4", exp: 1.3, grade: ["#5a8a6a", .12], sol: [-.25, 1, .35], sombra: 60,
    velas: 1.0, ventanas: .35, tiembla: 2.2, estrellas: 0, luna: 0, niebla: 1, polvo: 1, humo: "#6a706a", luces: .8, cielo: 3 } };
const ENV_CIELO_PUEBLO = ENV_CAMPANA_CIUDAD;   // compatibilidad con escenas viejas
// el «sol» (luz direccional): las escenas pueden mover el centro de las sombras (SOL.x, SOL.z, SOL.r) y la dirección (SOL.dir = [x, y, z] hacia la luz)
const SOL = { x: 0, z: 0, r: null, dir: null };
const AMB = { t: 0, cam: [0, 0, 0] };
function ambiente(t) { const A = ENV[ENVNOW] || {}, d = SOL.dir || A.sol || [-.4, 1, .4], l = Math.hypot(d[0], d[1], d[2]), cy = SUELO(SOL.x, SOL.z), R0 = SOL.r || A.sombra || 90; AMB.t = t; AMB.cam = [cam.position.x, cam.position.y, cam.position.z];
  sun.position.set(SOL.x + d[0] / l * 160, cy + d[1] / l * 160, SOL.z + d[2] / l * 160); sun.target.position.set(SOL.x, cy, SOL.z); sun.target.updateMatrixWorld();
  { const c = sun.shadow.camera; if (c.right !== R0 || c.far !== 360) { c.left = -R0; c.right = R0; c.top = R0; c.bottom = -R0; c.near = 1; c.far = 360; c.updateProjectionMatrix() } }
  VIENTO.value = t; VELA_U.uT.value = t; VELA_U.uTiem.value = A.tiembla ?? 1; VELA_U.uHalo.value = (A.velas ?? 1) ** 2 * .42; VELA_U.uFogD.value = scene.fog.density;
  M_LLAMA.color.setRGB(3.2, 2.1, .9).multiplyScalar(.45 + .55 * Math.min(1.4, A.velas ?? 1));
  M_VENTANA.emissiveIntensity = (A.ventanas ?? .3) * (1 + .05 * Math.sin(t * 7.3) + .03 * Math.sin(t * 13.1));
  if (typeof atmosfera === "function") atmosfera(t, A) }
// deja todo en reposo (llamar al empezar cada cuadro, antes de ambiente): velas derechas, sol en el centro
function mundoReset() { velasHacia(null); SOL.x = 0; SOL.z = 0; SOL.r = null; SOL.dir = null }
mundoReset();

// ================= API para las escenas
// tiendaInterior() → puntos útiles de la tienda de Sallow ([x, y, z] de mundo): puerta (afuera, al pie del escalón), vidriera (afuera, frente al
// vidrio), local (centro del local), interior (centro de la trastienda, al piso), olla (boca de la olla del medio), cajon (el cajón abierto),
// libro (el libro abierto adentro del cajón), mesa (mesa larga, arriba), frascos (estante de frascos de la trastienda), cartel
const tiendaInterior = () => ({ ...TI.P });

// ---------- compatibilidad con las escenas y el elenco viejos (el pueblo del cielo): no hacen nada
const POSTES = [], POSTE_MI = 0, POSTE_9T = 0, POSTE_9L = 0, CASILLAS = [{ x: 0, z: 0, puerta: [0, 0, 0], cunas: [] }];
const POSTE_TOP = () => [0, 0, 0], POSTE_BASE = () => [0, 0, 0], postePeldano = () => [0, 0, 0];
const posteBaja = () => { }, posteGrasa = () => { }, manivelaGiro = () => { }, manivelaRota = () => { }, techosRajan = () => { }, tannerEstado = () => { }, tannerAltura = () => 0, poste9Corte = () => { },
  callePolvo = () => { }, escaleraKell = () => { }, campana = () => { }, barriletes = () => { }, puebloTapaPrueba = () => { }, veleta = () => { }, cadenasRotas = () => { }, techoPanaderia = () => { }, humoInclinacion = () => { }, tormenta = () => { };
function vientoFuerza(f) { RAFAGA.value = .35 * Math.max(0, f) }
const VELETA_W = () => [0, 0, 0], TECHO_W = () => [0, 0, 0], CASAS_V = CASAS_P, MI_CASA = CASA_NELL_B.C, KITE_MANOS = [], ESCALERA_TOP = [0, 0, 0], ENV_VIENTO = ENV_CAMPANA_CIUDAD;
const PUNTOS = { sopa: [0, 0], boda: [0, 0], bebe: [0, 0, 0] };

// ================= LO DE LEJOS: el valle, las montañas con nieve (y las cimas donde se anclan las cadenas), las cordilleras en capas, la bruma por capas,
// el CIELO por clima (sol, luna, estrellas), las NUBES con volumen (y la capa de nubes que se atraviesa al trepar), los climas de luz de la campana y los stubs viejos =================
// Usa CBX (_bestia_campana.js). Mi piso empieza en r = 120 (con un faldón 0,2 m abajo de ALT_B hasta r = 160 para no pelearse con el piso de la ciudad) y sigue ALT_B
// exacto hasta r ≈ 230; afuera suma montañas. Las cimas de MONTES norte/sur/oeste son picos de verdad con el ancla arriba.
const LEJOS_CB = (() => {
  const G = new THREE.Group(); G.name = "LEJOS"; scene.add(G);
  const { sst, fbm, rd, hsh, mergeGeo, TMx } = CBX, TAU = Math.PI * 2;
  const lin = h => { const c = new THREE.Color(h); return [c.r, c.g, c.b] }, mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  const smax = (a, b, k) => { const h = cl(.5 + .5 * (b - a) / k); return lerp(a, b, h) + k * h * (1 - h) };
  // ---------------- EL TERRENO ----------------
  const ALT_L = (x, z) => { const r = Math.hypot(x, z); let y = ALT_B(x, z);
    const k1 = sst(230, 440, r), k2 = sst(650, 1500, r);
    if (k1 > 0) { const rid = 1 - Math.abs(rd(x * .011 + 7, z * .011 - 3) * 2 - 1); y += k1 * ((fbm(x * .0042 + 3, z * .0042 - 1, 5) - .45) * 150 + rid * rid * 45 + (fbm(x * .02, z * .02, 3) - .5) * 22) }
    if (k2 > 0) y += k2 * (40 + 230 * fbm(x * .0011 + 9, z * .0011, 4));
    for (const n of ["norte", "sur", "oeste"]) { const M = MONTES[n], d = Math.hypot(x - M[0], z - M[2]); if (d > 420) continue; const top = M[1] - 1.5, pico = top - d * (.62 + .3 * fbm(x * .02 + 1, z * .02, 2)) - (fbm(x * .05, z * .05, 2) - .5) * 6 * sst(10, 60, d);
      y = Math.min(y, top + d * .75); y = smax(y, pico, 18) }
    return y - .2 * (1 - sst(150, 165, r)) };
  const NRM = (x, z, e = 1.5) => { const a = ALT_L(x - e, z), b = ALT_L(x + e, z), c = ALT_L(x, z - e), d = ALT_L(x, z + e), n = [a - b, 2 * e, c - d], l = Math.hypot(...n); return n.map(v => v / l) };
  const C = { prado: lin("#5d7a36"), prado2: lin("#7d8c42"), ocre: lin("#a99350"), arado: lin("#6a5238"), seto: lin("#34482a"), bosque: lin("#2c4226"), bosque2: lin("#3c5430"), roca: lin("#6e665c"), roca2: lin("#8c8274"), roca3: lin("#4e4a46"), nieve: lin("#eef2f8"), nieveS: lin("#b8c6d8"), lejos: lin("#7c8ca4") };
  const colorT = (x, z, y, n) => { const r = Math.hypot(x, z), ny = n[1], f1 = fbm(x * .02, z * .02, 3), f2 = fbm(x * .07 + 4, z * .07, 2); let c;
    // valle: parcelas de cultivo (tablero torcido en coordenadas polares) con setos
    const an = Math.atan2(z, x), pu = an * 38 + Math.sin(r * .02) * .6, pv = r / 26 + Math.sin(an * 7) * .4, i = Math.floor(pu), j = Math.floor(pv), hh = hsh(i + 400, j), bord = Math.min(pu - i, 1 - pu + i, (pv - j), 1 - pv + j);
    const campo = [C.prado, C.prado2, C.ocre, C.arado, C.prado][hh * 5 | 0];
    c = mix3(campo, C.seto, 1 - sst(.04, .12, bord)); c = mix3(c, mix3(c, C.bosque, .5), f2 * .4);
    const kb = sst(.62, .45, ny) * 0 + sst(24, 60, y) * (1 - sst(150, 185, y));     // bosque en las laderas
    c = mix3(c, mix3(C.bosque, C.bosque2, f1), kb * sst(.42, .55, f1 + .1));
    const kr = cl(sst(.82, .6, ny) + sst(150, 210, y) * .7);                           // roca: lo empinado y lo alto
    c = mix3(c, mix3(mix3(C.roca, C.roca2, f2), C.roca3, sst(.5, .7, f1) * .6), kr);
    const sn = 200 + .085 * Math.max(r - 480, 0) + 40 * fbm(x * .006, z * .006, 3) - (1 - ny) * 30, ks = sst(sn - 8, sn + 8, y) * sst(.45, .66, ny) * sst(.3, .5, fbm(x * .035 + 2, z * .035, 3) + sst(sn, sn + 40, y) * .3);
    c = mix3(c, mix3(C.roca3, C.roca2, f2), sst(.55, .75, fbm(x * .09, z * .015, 2)) * kr * .7);   // vetas de roca   // nieve
    c = mix3(c, mix3(C.nieveS, C.nieve, cl(ny * 1.4 - .3)), ks);
    c = mix3(c, C.lejos, sst(900, 1900, r) * .45);
    return c };
  const T_ROCA_L = (() => { const t = tex(512, 512, (g, w, h) => { const r = rng(9601); g.fillStyle = "#808080"; g.fillRect(0, 0, w, h); for (let k = 0; k < 2400; k++) { const v = r() * 255 | 0; g.fillStyle = `rgba(${v},${v},${v},${.15 + r() * .3})`; g.beginPath(); g.ellipse(r() * w, r() * h, 2 + r() * 18, 1 + r() * 8, r() * 3, 0, TAU); g.fill() } for (let k = 0; k < 160; k++) { g.strokeStyle = `rgba(30,30,30,${.3 + r() * .4})`; g.lineWidth = 1 + r() * 2; g.beginPath(); let x = r() * w, y = r() * h; g.moveTo(x, y); for (let q = 0; q < 6; q++) { x += (r() - .5) * 40; y += r() * 20; g.lineTo(x, y) } g.stroke() } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.NoColorSpace; return t })();
  const NIEBLA_U = { uMY0: { value: 30 }, uMY1: { value: 120 }, uMA: { value: .35 }, uMC: { value: new THREE.Color("#c8d6e4") } };
  const M_TERRENO = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .95, bumpMap: T_ROCA_L, bumpScale: 2.5 });
  M_TERRENO.onBeforeCompile = sh => { Object.assign(sh.uniforms, NIEBLA_U); sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vLW;").replace("#include <begin_vertex>", "#include <begin_vertex>\n  vLW = (modelMatrix * vec4(transformed, 1.)).xyz;");
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 vLW; uniform float uMY0, uMY1, uMA; uniform vec3 uMC;").replace("#include <fog_fragment>", `#include <fog_fragment>
  { float d = length(vLW - cameraPosition); float hm = 1. - smoothstep(uMY0, uMY1, vLW.y); float m = hm * smoothstep(90., 900., d) * uMA; gl_FragColor.rgb = mix(gl_FragColor.rgb, uMC, clamp(m, 0., .8)); }`) };
  M_TERRENO.customProgramCacheKey = () => "terrCB";
  const TERRENO = (() => { const rs = []; for (let r = 120; r < 300; r += 2) rs.push(r); { let r = 300, s = 2; while (r < 1950) { rs.push(r); s *= 1.03; r += s } }
    const NA = 900, NR = rs.length, pos = new Float32Array(NR * (NA + 1) * 3), nor = new Float32Array(NR * (NA + 1) * 3), col = new Float32Array(NR * (NA + 1) * 3), uv = new Float32Array(NR * (NA + 1) * 2), idx = new Uint32Array((NR - 1) * NA * 6); let k = 0, q = 0;
    for (let i = 0; i < NR; i++) for (let j = 0; j <= NA; j++) { const a = j / NA * TAU, x = Math.cos(a) * rs[i], z = Math.sin(a) * rs[i], y = ALT_L(x, z), n = NRM(x, z, Math.max(1.5, rs[i] * .006));
      pos.set([x, y, z], k * 3); nor.set(n, k * 3); col.set(colorT(x, z, y, n), k * 3); uv.set([x / 22, z / 22], k * 2); k++ }
    for (let i = 0; i < NR - 1; i++) for (let j = 0; j < NA; j++) { const a = i * (NA + 1) + j, b = a + NA + 1; idx[q++] = a; idx[q++] = a + 1; idx[q++] = b; idx[q++] = a + 1; idx[q++] = b + 1; idx[q++] = b }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); g.setAttribute("color", new THREE.BufferAttribute(col, 3)); g.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); g.setIndex(new THREE.BufferAttribute(idx, 1)); g.computeBoundingSphere();
    const m = new THREE.Mesh(g, M_TERRENO); m.receiveShadow = true; m.frustumCulled = false; G.add(m); return m })();
  // bosques (coníferas) en las laderas y árboles redondos y granjas en el valle
  const ARBOLES = (() => { const r = rng(9611), L = [], LR = [];
    for (let k = 0; k < 26000 && L.length < 9000; k++) { const a = r() * TAU, rr = lerp(170, 760, Math.sqrt(r())), x = Math.cos(a) * rr, z = Math.sin(a) * rr, y = ALT_L(x, z); if (y < 22 || y > 168) continue; const n = NRM(x, z); if (n[1] < .62) continue; if (fbm(x * .02, z * .02, 3) + .1 < .5) continue; L.push([x, y, z, .8 + r() * .9]) }
    for (let k = 0; k < 6000 && LR.length < 1800; k++) { const a = r() * TAU, rr = lerp(125, 300, r()), x = Math.cos(a) * rr, z = Math.sin(a) * rr, y = ALT_L(x, z); if (y > 40) continue; if (fbm(x * .05 + 3, z * .05, 2) < .52) continue; LR.push([x, y, z, .7 + r() * .7]) }
    const con = mergeGeo([[new THREE.ConeGeometry(2.2, 6, 6), TMx(0, 5.2, 0)], [new THREE.ConeGeometry(1.7, 4.5, 6), TMx(0, 7.6, 0)], [new THREE.CylinderGeometry(.25, .35, 2.4, 5), TMx(0, 1.2, 0)]]);
    const red = mergeGeo([[new THREE.IcosahedronGeometry(2.6, 1), TMx(0, 4.6, 0, 0, 0, 0, 1, .85, 1)], [new THREE.CylinderGeometry(.3, .4, 3, 5), TMx(0, 1.5, 0)]]);
    const mk_ = (geo, D, c0, c1) => { const m = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .9 }), D.length), c = new THREE.Color(); D.forEach(([x, y, z, s], i) => { dummy.position.set(x, y - .3, z); dummy.rotation.set(0, r() * 6, 0); dummy.scale.set(s, s * (.85 + r() * .4), s); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); m.setColorAt(i, c.set(c0).lerp(new THREE.Color(c1), r())) }); m.frustumCulled = false; G.add(m); return m };
    return [mk_(con, L, "#1f3420", "#3a5232"), mk_(red, LR, "#3e5a2a", "#6a7a36")] })();
  const GRANJAS = (() => { const r = rng(9612), L = []; for (let k = 0; k < 400 && L.length < 90; k++) { const a = r() * TAU, rr = lerp(160, 290, r()), x = Math.cos(a) * rr, z = Math.sin(a) * rr, y = ALT_L(x, z); if (y > 30 || NRM(x, z)[1] < .9) continue; if (Math.abs(x - RISCO_E[0]) < 50 && Math.abs(z - RISCO_E[1]) < 50) continue; L.push([x, y, z, r() * 6, .8 + r() * .6]) }
    const pared = new THREE.BoxGeometry(6, 3.6, 4.4); pared.translate(0, 1.8, 0); const techo = new THREE.CylinderGeometry(.01, 3.6, 3, 4, 1); techo.rotateY(Math.PI / 4); techo.scale(1.25, 1, .9); techo.translate(0, 5, 0);
    const mP = new THREE.InstancedMesh(pared, new THREE.MeshStandardMaterial({ color: "#b8a888", roughness: .9 }), L.length), mT = new THREE.InstancedMesh(techo, new THREE.MeshStandardMaterial({ color: "#6a3a2a", roughness: .85 }), L.length);
    L.forEach(([x, y, z, ry, s], i) => { dummy.position.set(x, y - .2, z); dummy.rotation.set(0, ry, 0); dummy.scale.setScalar(s); dummy.updateMatrix(); mP.setMatrixAt(i, dummy.matrix); mT.setMatrixAt(i, dummy.matrix) }); [mP, mT].forEach(m => { m.frustumCulled = false; G.add(m) }); return { mP, mT } })();

  // ---------------- CORDILLERAS LEJANAS EN CAPAS (más lejos = más pálidas) ----------------
  const RU = { uHor: { value: new THREE.Color("#bcd4e8") }, uSolV: { value: new THREE.Vector3(0, 1, 0) }, uSolC: { value: new THREE.Color("#ffffff") } };
  const CORDILLERAS = [[2150, 560, .5, "#6a7892"], [2950, 800, .66, "#7c8aa4"], [3900, 1100, .8, "#94a2ba"]].map(([R0, H0, haze, col], li) => {
    const N = 1440, pos = [], uv = [], idx = [], r = rng(9620 + li);
    for (let j = 0; j <= N; j++) { const a = j / N * TAU, x = Math.cos(a), z = Math.sin(a), ridge = 1 - Math.abs(rd(a * 9 + li * 30, li * 7) * 2 - 1), h = H0 * (.35 + .4 * fbm(a * 4 + li * 5, li, 4) + .35 * ridge * ridge) + 60 * (rd(a * 60, li) - .5);
      pos.push(x * R0, -80, z * R0, x * R0, h, z * R0); uv.push(j / N, 0, j / N, 1); if (j) { const b = (j - 1) * 2; idx.push(b, b + 2, b + 1, b + 1, b + 2, b + 3) } }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
    const m = new THREE.Mesh(g, new THREE.ShaderMaterial({ uniforms: Object.assign({ uCol: { value: new THREE.Color(col) }, uHaze: { value: haze }, uTop: { value: H0 } }, RU), side: THREE.DoubleSide, fog: false, depthWrite: true,
      vertexShader: "varying vec3 vW; void main(){ vW = (modelMatrix * vec4(position, 1.)).xyz; gl_Position = projectionMatrix * viewMatrix * vec4(vW, 1.); }",
      fragmentShader: `uniform vec3 uCol, uHor, uSolV, uSolC; uniform float uHaze, uTop; varying vec3 vW;
float h1(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main(){ float y = vW.y; float n = h1(floor(vW.xz / 40.)) * .5 + h1(floor(vW.xz / 13.)) * .5;
  vec3 c = uCol * (.85 + .25 * n); float sn = smoothstep(uTop * .62, uTop * .78, y + n * 40.); c = mix(c, vec3(.92, .95, 1.), sn * .8);
  vec3 d = normalize(vW - cameraPosition); float sl = pow(max(dot(normalize(vec3(d.x, 0., d.z)), normalize(vec3(uSolV.x, 0., uSolV.z))), 0.), 4.);
  c = mix(c, uSolC, sl * .25 * sn);
  float hz = clamp(uHaze + (1. - smoothstep(-60., uTop * .5, y)) * .35, 0., 1.); c = mix(c, uHor, hz);
  gl_FragColor = vec4(c, 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}` }));
    m.frustumCulled = false; m.renderOrder = -2 + li * 0; G.add(m); return m });

  // ---------------- BRUMA POR CAPAS (láminas horizontales de niebla en el valle) ----------------
  const BU = { uT: { value: 0 }, uCol: { value: new THREE.Color("#d4e2ee") }, uA: { value: .35 }, uSolV: RU.uSolV, uSolC: RU.uSolC };
  const BRUMAS = [[26, .9, 1], [48, .7, 2], [82, .55, 3], [140, .35, 4]].map(([y, k, s]) => { const g = new THREE.RingGeometry(140, 2300, 160, 12); g.rotateX(-Math.PI / 2); g.translate(0, y, 0);
    const m = new THREE.Mesh(g, new THREE.ShaderMaterial({ uniforms: Object.assign({ uK: { value: k }, uS: { value: s } }, BU), transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide,
      vertexShader: "varying vec3 vW; void main(){ vW = (modelMatrix * vec4(position, 1.)).xyz; gl_Position = projectionMatrix * viewMatrix * vec4(vW, 1.); }",
      fragmentShader: `uniform vec3 uCol, uSolV, uSolC; uniform float uT, uA, uK, uS; varying vec3 vW;
float h1(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(h1(i), h1(i + vec2(1, 0)), f.x), mix(h1(i + vec2(0, 1)), h1(i + vec2(1, 1)), f.x), f.y); }
void main(){ vec2 p = vW.xz / 260. + vec2(uT * .004 * uS, uT * .002); float n = n2(p) * .55 + n2(p * 2.3 + 7.) * .3 + n2(p * 5.1 - 3.) * .15;
  float r = length(vW.xz), d = length(vW - cameraPosition);
  float a = smoothstep(.38, .75, n) * uA * uK * smoothstep(150., 300., r) * (1. - smoothstep(1700., 2300., r)) * smoothstep(40., 260., d) * pow(1. - abs(normalize(vW - cameraPosition).y), 2.2);
  vec3 vd = normalize(vW - cameraPosition); float fw = pow(max(dot(vd, uSolV), 0.), 5.); vec3 c = mix(uCol, uSolC, fw * .45);
  gl_FragColor = vec4(c, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}` })); m.frustumCulled = false; m.renderOrder = 2; G.add(m); return m });

  // ---------------- EL CIELO (domo que sigue a la cámara): degradé, sol con halo, luna con cráteres, estrellas ----------------
  const SU = { uTop: { value: new THREE.Color() }, uHor: { value: new THREE.Color() }, uSol: { value: new THREE.Vector3(0, 1, 0) }, uSolC: { value: new THREE.Color("#fff4e0") }, uSolI: { value: 1 }, uHalo: { value: new THREE.Color("#ffe0b0") },
    uLuna: { value: new THREE.Vector3(0, 1, 0) }, uLunaI: { value: 0 }, uEst: { value: 0 }, uT: { value: 0 } };
  const DOMO = new THREE.Mesh(new THREE.SphereGeometry(4800, 64, 32), new THREE.ShaderMaterial({ uniforms: SU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: "varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",
    fragmentShader: `uniform vec3 uTop, uHor, uSol, uSolC, uHalo, uLuna; uniform float uSolI, uLunaI, uEst, uT; varying vec3 vD;
float h1(vec3 p){ return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
float n3(vec3 p){ vec3 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(mix(h1(i), h1(i + vec3(1,0,0)), f.x), mix(h1(i + vec3(0,1,0)), h1(i + vec3(1,1,0)), f.x), f.y), mix(mix(h1(i + vec3(0,0,1)), h1(i + vec3(1,0,1)), f.x), mix(h1(i + vec3(0,1,1)), h1(i + vec3(1,1,1)), f.x), f.y), f.z); }
void main(){ vec3 d = normalize(vD); float h = d.y;
  vec3 c = mix(uHor, uTop, pow(smoothstep(-.02, .85, h), .55)); c = mix(c, uHor * .85, smoothstep(0., -.25, h));
  float sd = max(dot(d, uSol), 0.); c += uHalo * uSolI * (pow(sd, 5.) * .28 + pow(sd, 40.) * .55 + pow(sd, 400.) * 1.2);
  c = mix(c, uSolC * 7., smoothstep(.99955, .9998, sd) * uSolI);
  // luna con cráteres y halo frío
  float md = dot(d, uLuna); vec3 lt = normalize(cross(uLuna, vec3(0., 1., 0.))), lb = cross(lt, uLuna); vec2 lp = vec2(dot(d, lt), dot(d, lb)) / .028;
  float disco = smoothstep(1.02, .98, length(lp)) * step(0., md); float cr = n3(vec3(lp * 3.2, 1.)) * .5 + n3(vec3(lp * 8., 4.)) * .3 + n3(vec3(lp * 1.4, 9.)) * .4;
  vec3 lc = vec3(.93, .95, 1.) * (.75 + .35 * cr - .25 * smoothstep(.55, .75, cr)) * (.88 + .12 * sqrt(max(0., 1. - dot(lp, lp))));
  c += vec3(.55, .65, .9) * uLunaI * (pow(max(md, 0.), 60.) * .3 + pow(max(md, 0.), 600.) * .5);
  c = mix(c, lc * 3.2, disco * uLunaI);
  // estrellas (más arriba, más)
  if (uEst > 0. && h > 0.) { vec3 q = d * 420.; vec3 cell = floor(q); float s = h1(cell); if (s > .985) { vec3 cp = cell + .5 + (vec3(h1(cell + 1.), h1(cell + 2.), h1(cell + 3.)) - .5) * .6; float dd = length(q - cp); float tw = .6 + .4 * sin(uT * (2. + s * 9.) + s * 90.);
      c += vec3(1., .96, .9) * uEst * smoothstep(.55, 0., dd) * (s - .985) * 66. * tw * smoothstep(0., .25, h) * (1. - disco); } }
  gl_FragColor = vec4(c, 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}` }));
  DOMO.frustumCulled = false; DOMO.renderOrder = -10; scene.add(DOMO);

  // ---------------- NUBES con volumen (racimos de copos iluminados por el sol) ----------------
  const T_COPO = tex(256, 256, (g, w, h) => { const r = rng(9631); g.clearRect(0, 0, w, h);
    // coliflor: bultos grandes en el medio y cada vez más chicos hacia el borde, base más chata; después se come el borde con agujeritos
    for (let k = 0; k < 90; k++) { const a = r() * TAU, e = Math.pow(r(), .7), x = w / 2 + Math.cos(a) * e * 92, y = h * .55 + Math.sin(a) * e * 62 - (Math.sin(a) < 0 ? e * 10 : 0), R0 = lerp(46, 12, e) * (.7 + r() * .5); if (y > h * .78) continue;
      const gr = g.createRadialGradient(x - R0 * .3, y - R0 * .35, 0, x, y, R0); gr.addColorStop(0, "rgba(255,255,255,.6)"); gr.addColorStop(.5, "rgba(236,236,236,.4)"); gr.addColorStop(1, "rgba(220,220,220,0)"); g.fillStyle = gr; g.beginPath(); g.arc(x, y, R0, 0, TAU); g.fill() }
    g.globalCompositeOperation = "destination-in"; const gm = g.createRadialGradient(w / 2, h * .52, 0, w / 2, h * .52, w * .5); gm.addColorStop(0, "rgba(0,0,0,1)"); gm.addColorStop(.45, "rgba(0,0,0,.9)"); gm.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gm; g.fillRect(0, 0, w, h); g.globalCompositeOperation = "source-over" });
  T_COPO.colorSpace = THREE.NoColorSpace;
  const NU = { uSol: SU.uSol, uLit: { value: new THREE.Color("#ffffff") }, uShade: { value: new THREE.Color("#9aaac4") }, uHor: { value: new THREE.Color("#bcd4e8") }, uHaze: { value: .00035 }, uT: { value: 0 }, uMap: { value: T_COPO }, uGA: { value: new THREE.Vector4(1, 1, 0, 1) } };
  const NUBES = (() => { const r = rng(9632), P = [], Cc = [], Vv = []; const racimo = (cx, cy, cz, ancho, alto, n, s0, s1, grupo, chato = 1) => { for (let q = 0; q < n; q++) { const u = r() * 2 - 1, v = Math.pow(r(), .8), sz = lerp(s0, s1, r()) * (1 - Math.abs(u) * .45);
      const x = cx + u * ancho, y = cy + v * alto * (1 - u * u * .6) * chato, z = cz + (r() - .5) * ancho * .55; P.push(x, y, z, sz); Cc.push(cx, cy - alto * .2, cz); Vv.push(v, r() * TAU, grupo, r()) } };
    for (let k = 0; k < 40; k++) { const a = r() * TAU, d = lerp(900, 2700, r()), w = lerp(180, 520, r()); racimo(Math.cos(a) * d, lerp(330, 720, r()), Math.sin(a) * d, w, w * .45, 16 + (r() * 14 | 0), w * .25, w * .55, 0) }
    for (let k = 0; k < 16; k++) { const a = r() * TAU, d = lerp(480, 900, r()), w = lerp(70, 180, r()); racimo(Math.cos(a) * d, lerp(130, 220, r()), Math.sin(a) * d, w, w * .25, 10 + (r() * 8 | 0), w * .3, w * .6, 1, .6) }
    // la capa que se atraviesa al trepar (alrededor de la cadena del este, y ≈ 88 → 126)
    for (let k = 0; k < 42; k++) { const u = lerp(.02, CADENA_U_LABIO * .92, r()), p = cadenaPunto("este", u), a = r() * TAU, d = lerp(16, 130, Math.pow(r(), .7)), w = lerp(18, 46, r()); racimo(p[0] + Math.cos(a) * d, lerp(86, 120, r()), p[2] + Math.sin(a) * d, w, w * .3, 14 + (r() * 8 | 0), w * .3, w * .62, 2, .7) }
    // anillo de nubes a media altura, siempre (lejos de la ciudad)
    for (let k = 0; k < 30; k++) { const a = r() * TAU, d = lerp(480, 1150, r()), w = lerp(50, 130, r()); racimo(Math.cos(a) * d, lerp(100, 140, r()), Math.sin(a) * d, w, w * .22, 10 + (r() * 6 | 0), w * .35, w * .7, 3, .55) }
    const g = new THREE.InstancedBufferGeometry(); const b = new THREE.PlaneGeometry(1, 1); g.index = b.index; g.setAttribute("position", b.attributes.position); g.setAttribute("uv", b.attributes.uv);
    g.setAttribute("aP", new THREE.InstancedBufferAttribute(new Float32Array(P), 4)); g.setAttribute("aC", new THREE.InstancedBufferAttribute(new Float32Array(Cc), 3)); g.setAttribute("aV", new THREE.InstancedBufferAttribute(new Float32Array(Vv), 4)); g.instanceCount = P.length / 4;
    const m = new THREE.Mesh(g, new THREE.ShaderMaterial({ uniforms: NU, transparent: true, depthWrite: false, fog: false,
      vertexShader: `attribute vec4 aP, aV; attribute vec3 aC; uniform vec3 uSol, uLit, uShade, uHor; uniform float uHaze, uT; uniform vec4 uGA; varying vec2 vUv; varying vec3 vCol; varying float vA; varying vec2 vSs;
void main(){ vSs = normalize((viewMatrix * vec4(uSol, 0.)).xy + 1e-4); vec3 c = aP.xyz + vec3(uT * .6, 0., uT * .25) * (aV.z < 1.5 ? 1. : .3); vec4 mv = viewMatrix * vec4(c, 1.); float ro = aV.y + uT * .01 * (aV.w - .5);
  vec2 q = position.xy; q = vec2(cos(ro) * q.x - sin(ro) * q.y, sin(ro) * q.x + cos(ro) * q.y); mv.xy += q * aP.w; gl_Position = projectionMatrix * mv; vUv = uv;
  float dcam = -mv.z; vec3 off = normalize(aP.xyz - aC + vec3(0., .001, 0.));
  float l = clamp(dot(off, uSol) * .45 + .5 + (aV.x - .45) * .5, 0., 1.); vCol = mix(uShade, uLit, l);
  float hz = 1. - exp(-max(dcam - 60., 0.) * uHaze); vCol = mix(vCol, uHor, clamp(hz, 0., .9));
  float ga = aV.z < .5 ? uGA.x : aV.z < 1.5 ? uGA.y : aV.z < 2.5 ? uGA.z : uGA.w;
  vA = ga * smoothstep(aP.w * .25, aP.w * 1.1, dcam) * step(0., dcam); }`,
      fragmentShader: `uniform sampler2D uMap; varying vec2 vUv; varying vec3 vCol; varying float vA; varying vec2 vSs;
void main(){ vec4 t = texture2D(uMap, vUv); float a = t.a * vA; if (a < .004) discard; float sl = dot(vUv - .5, vSs) * 2.; vec3 c = vCol * (.86 + .14 * t.r + .1 * sl);
  gl_FragColor = vec4(c, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}` }));
    m.frustumCulled = false; m.renderOrder = 3; scene.add(m); return m })();

  // ---------------- CLIMAS de lo mío ----------------
  // ENV_CAMPANA_PRUEBA: el clima completo (para probar en mi copia). ENV_CAMPANA_CIELO: SOLO mis claves cb* (las suma la integración con envCampana(ENV)).
  const PRUEBA = {
    mediodia: { top: "#3d7ad0", hor: "#bcd4e8", fog: .0007, hemi: 1.05, hemiG: "#6a6050", sun: 3.3, sunCol: "#fff2dc", exp: 1.1, grade: ["#ffffff", 0], sol: [-.25, 1, .3], sombra: 90 },
    atardecer: { top: "#2e3f80", hor: "#f0a466", fog: .0008, hemi: .65, hemiG: "#5a3a2a", sun: 4.2, sunCol: "#ffa860", exp: 1.15, grade: ["#ffb070", .08], sol: [-.92, .2, .2], sombra: 90 },
    noche: { top: "#050916", hor: "#1a2440", fog: .0009, hemi: .42, hemiG: "#10141c", sun: .85, sunCol: "#9ab0e0", exp: 1.6, grade: ["#7090d0", .06], sol: [.1, .62, -.78], sombra: 90 },
    dentro: { top: "#05060a", hor: "#0c1018", fog: .0012, hemi: .13, hemiG: "#100c08", sun: .4, sunCol: "#9ab0e0", exp: 1.8, grade: ["#8090c0", .05], sol: [.1, .62, -.78], sombra: 90 },
    sallow: { top: "#5a6270", hor: "#9aa2aa", fog: .0016, hemi: .8, hemiG: "#4a4640", sun: 1.2, sunCol: "#c8ccd4", exp: 1.15, grade: ["#a8b0c0", .06], sol: [-.3, .7, .4], sombra: 90 } };
  const CIELO_CB = {
    mediodia: { cbEnv: "dia", cbNubeLuz: "#ffffff", cbNubeSombra: "#93a4c0", cbBruma: ["#d6e4f0", .32], cbSolI: 1, cbHalo: "#ffe6c0", cbLuna: 0, cbEstrellas: 0, cbNubesA: [1, .8, .75, .7] },
    atardecer: { cbEnv: "tarde", cbNubeLuz: "#ffc08a", cbNubeSombra: "#6a5a84", cbBruma: ["#f2b484", .42], cbSolI: 1.6, cbHalo: "#ffb070", cbLuna: 0, cbEstrellas: 0, cbNubesA: [1, .8, .75, .7] },
    noche: { cbEnv: "noche", cbNubeLuz: "#56648a", cbNubeSombra: "#10141f", cbBruma: ["#2c3a5a", .5], cbSolI: 0, cbHalo: "#000000", cbLuna: 1, cbLunaDir: [.1, .62, -.78], cbEstrellas: 1, cbNubesA: [.8, .8, .9, .7] },
    dentro: { cbEnv: "dentro", cbNubeLuz: "#6a7898", cbNubeSombra: "#10141e", cbBruma: ["#1c2638", .5], cbSolI: 0, cbHalo: "#000000", cbLuna: 1, cbLunaDir: [.1, .62, -.78], cbEstrellas: 1, cbNubesA: [.6, .6, .6, .5] },
    sallow: { cbEnv: "dia", cbPatina: .7, cbNubeLuz: "#c0c4cc", cbNubeSombra: "#5a606c", cbBruma: ["#a4acb6", .62], cbSolI: .15, cbHalo: "#c0c0c0", cbLuna: 0, cbEstrellas: 0, cbNubesA: [1, 1, 1, 1] } };
  const vacio = {};
  function clima(A) { const D = CIELO_CB.mediodia, k = (key, def) => A[key] ?? D[key] ?? def;
    SU.uTop.value.set(A.top || "#3d7ad0"); SU.uHor.value.set(A.hor || "#bcd4e8"); RU.uHor.value.set(A.hor || "#bcd4e8"); NU.uHor.value.set(A.hor || "#bcd4e8");
    const sd = CBX.ST.solDir || A.cbSol || A.sol || [-.3, .9, .3], l = Math.hypot(...sd); SU.uSol.value.set(sd[0] / l, sd[1] / l, sd[2] / l); RU.uSolV.value.copy(SU.uSol.value);
    SU.uSolI.value = k("cbSolI", 1); SU.uSolC.value.set(A.sunCol || "#fff4e0"); SU.uHalo.value.set(k("cbHalo", "#ffe0b0")); RU.uSolC.value.set(A.sunCol || "#ffffff");
    const ld = A.cbLunaDir || sd, ll = Math.hypot(...ld); SU.uLuna.value.set(ld[0] / ll, ld[1] / ll, ld[2] / ll); SU.uLunaI.value = k("cbLuna", 0); SU.uEst.value = k("cbEstrellas", 0);
    NU.uLit.value.set(k("cbNubeLuz", "#ffffff")); NU.uShade.value.set(k("cbNubeSombra", "#9aaac4")); NU.uHaze.value = (A.fog ?? .0012) * .3;
    const na = k("cbNubesA", [1, 1, 1, 1]); NU.uGA.value.set(na[0], na[1], CBX.ST.nubes ? na[2] : 0, na[3]);
    const br = k("cbBruma", ["#d4e2ee", .35]); BU.uCol.value.set(br[0]); BU.uA.value = br[1]; NIEBLA_U.uMC.value.set(br[0]); NIEBLA_U.uMA.value = br[1] * .5 }
  function porCuadro(t) { const A = (typeof ENV !== "undefined" && ENV[ENVNOW]) || vacio; clima(A); SU.uT.value = t; NU.uT.value = t; BU.uT.value = t }

  // ---------------- antes de dibujar: plano lejano, el domo sigue a la cámara, lo transparente no entra a las pasadas con material forzado (GTAO) ----------------
  const TRANSP = [DOMO, NUBES, ...BRUMAS, CBX.POLVO, CBX.HAZ, CBX.VAPOR];
  { const prev = scene.onBeforeRender; scene.onBeforeRender = function (r, s, c, rt) { if (prev) prev.call(this, r, s, c, rt);
      if (c && c.isPerspectiveCamera) { if (c.far < 7000) { c.far = 7000; c.updateProjectionMatrix() } DOMO.position.copy(c.position); DOMO.updateMatrixWorld() }
      try { if (SKY.visible) SKY.visible = false } catch (e) { }
      if (s && s.overrideMaterial) TRANSP.forEach(p => { p.userData.ov = p.visible; p.visible = false }) } }
  { const prev = scene.onAfterRender; scene.onAfterRender = function (r, s, c, rt) { if (prev) prev.call(this, r, s, c, rt); TRANSP.forEach(p => { if (p.userData.ov !== undefined) { p.visible = p.userData.ov; delete p.userData.ov } }) } }

  return { G, ALT_L, NRM, TERRENO, ARBOLES, GRANJAS, CORDILLERAS, BRUMAS, DOMO, NUBES, SU, NU, BU, RU, NIEBLA_U, PRUEBA, CIELO_CB, porCuadro };
})();

// ======================= API DE LO DE LEJOS Y LOS CLIMAS =======================
const ALT_LEJOS = LEJOS_CB.ALT_L;                                   // altura del piso de lo mío (= ALT_B adentro de r ≈ 230; montañas afuera)
const nubesTrepada = (on = true) => { CBX.ST.nubes = !!on };         // la capa de nubes alrededor de la cadena del este (y ≈ 86 → 126) que la cámara atraviesa al trepar
const ENV_CAMPANA_CIELO = LEJOS_CB.CIELO_CB;                         // SOLO mis claves (cb*) por clima: se SUMAN a cada clima de ENV con envCampana(ENV)
const ENV_CAMPANA_PRUEBA = LEJOS_CB.PRUEBA;                          // climas completos de prueba (los usa mi copia; la ciudad define los de verdad)
// junta: a cada clima de ENV le agrega mis claves cb* (y si el clima no existe, lo crea con mis valores de prueba). No pisa ninguna clave de la ciudad.
function envCampana(E) { Object.keys(ENV_CAMPANA_CIELO).forEach(k => { E[k] = Object.assign({}, E[k] ? {} : ENV_CAMPANA_PRUEBA[k], E[k] || {}, ENV_CAMPANA_CIELO[k]) }); return E }
// ---------------- por cuadro ----------------
function lejosReset() { CBX.reset() }
function lejos(t) { CBX.porCuadro(t); LEJOS_CB.porCuadro(t) }
// ---------------- cámaras de prueba (p, l, f, env) ----------------
const CAMS_CAMPANA = (() => { const I_ = interior(), q = (n, u) => cadenaMarco(n, u), C = CAMPANA_C, Y = CAMPANA_Y;
  const tr = q("este", .2), trN = tr.n, trS = tr.lado;
  return {
    plaza: { p: [0, 1.7, 15], l: [0, 120, 110], f: 62, env: "mediodia", nota: "contrapicado desde la plaza: la campana entera encima, el labio con musgo y carámbanos, la cadena del este bajando" },
    plazaNoche: { p: [0, 1.7, 15], l: [0, 118, -130], f: 62, env: "noche", nota: "la misma, de noche: silueta con el borde iluminado por la luna" },
    aerea: { p: [300, 360, 420], l: [0, 130, -40], f: 50, env: "atardecer", nota: "aérea lejana: la ciudad, la campana y las cuatro cadenas a las montañas" },
    aereaDia: { p: [-260, 330, 380], l: [0, 110, -30], f: 50, env: "mediodia", nota: "aérea desde el suroeste al mediodía: la sombra cruzando la ciudad" },
    lejosNoche: { p: [30, 120, 430], l: [0, 215, -10], f: 52, env: "noche", nota: "de lejos de noche: la campana en silueta con el borde de luna, la luna detrás" },
    trepa: { p: [tr.p[0] + trN[0] * 20 + trS[0] * 16, tr.p[1] - 12, tr.p[2] + trN[2] * 20 + trS[2] * 16], l: cadenaPunto("este", CADENA_U_LABIO + .04), f: 60, env: "atardecer", nubes: true, nota: "trepando a mitad de la cadena del este, entre nubes, mirando arriba a la campana" },
    trepaAbajo: { p: [tr.p[0] + trN[0] * 9 + trS[0] * 7, tr.p[1] + 14, tr.p[2] + trN[2] * 9 + trS[2] * 7], l: [10, 15, 0], f: 60, env: "atardecer", nubes: true, nota: "desde la cadena mirando abajo: la ciudad chiquita entre nubes" },
    primerEslabon: { p: [PRIMER_ESLABON[0] - 16, PRIMER_ESLABON[1] - 1, PRIMER_ESLABON[2] + 12], l: [PRIMER_ESLABON[0], PRIMER_ESLABON[1] + 6, PRIMER_ESLABON[2]], f: 55, env: "atardecer", nota: "el primer eslabón sobre el ancla del risco (pisadas pulidas)" },
    dentro: { p: plataformaW(4.6, 1.65, 2.2), l: plataformaW(-14, 9, -3), f: 68, env: "dentro", nota: "adentro desde la plataforma: la caverna de bronce, el rayo de luna, el gancho roto" },
    dentroPlataforma: { p: plataformaW(-27, 15, 15), l: plataformaW(-2, 2.5, 0), f: 56, env: "dentro", nota: "la plataforma de Sallow vista desde el aire de adentro, con el rayo de luna cayendo encima y el labio abajo" },
    dentroGancho: { p: CBX.polar(70, CBX.P_H + 3, CBX.A_ENT + .1), l: I_.gancho, f: 50, env: "dentro", nota: "el gancho vacío y roto arriba, con el rayo de luna" },
    dentroLabio: { p: plataformaW(-6.1, 2.6, -4.5), l: CBX.polar(82, -16, CBX.A_ENT - .62), f: 70, env: "dentro", nota: "por encima del labio de adentro: abajo el vacío y la ciudad" },
    entrada: { p: CBX.polar(CBX.rOut(10) + 14, 13, CBX.A_ENT + .12), l: I_.entrada, f: 50, env: "atardecer", nota: "la grieta de entrada y la tabla desde la cadena del este" } } })();
// ---------------- stubs del video viejo (la tapa y su campo ya no existen) ----------------
const ARRIBA_Y = (x, z) => TAPA_Y(x, z) + LID_T, montonesTierra = () => { }, escaleraArriba = () => { }, tapaArriba = () => { };
const ENV_CIELO_TAPA = {}, CAMS_TAPA = {}, TAPA_OBJS = [];
const SUELO_LEJOS = (x, z) => ALT_LEJOS(x, z), nubesValle = () => { }, jironesNube = () => { }, cometaGeo = () => new THREE.BufferGeometry(), nuevaCometa = () => new THREE.Group(), cometaCola = () => { }, cometaHilo = () => { };
const ATERRIZA = [0, 0, 0], COMETAS_PIP = [0, 0, 0], MEDIA_PASTO = [0, 0, 0], VUELO_PTS = [[0, 16, -10], [10, 20, -10], [20, 24, -10]];
const CAMS_VALLE = Object.fromEntries(["aereoValle", "aterrizaPicado", "pastoPersona", "cometasPip", "haciaCordillera", "humoDerecho", "cresta", "marDeNubes"].map(k => [k, { p: [0, 6, 30], l: [0, 4, 0], f: 50 }]));
const ENV_LEJOS = envCampana(Object.assign({}, ENV_CAMPANA_PRUEBA)), LEJOS_G = LEJOS_CB.G, LEJOS_CFG = {};
window.CAMPANA_DBG = { CBX, LEJOS_CB, CAMS_CAMPANA };

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

// ================= PERSONAJES Y CARAS COMO LOS DE VOLZE (pedido del dueño, 25-nov-2026: «menos detalle, un brazo rectangular,
// no dos figuras; las caras son muy Playmobil y no Roblox»). Descripción completa en skills/shorts-volze/referencia/personajes-volze.md.
// Resumen: seis bloques (cabeza, torso, dos brazos, dos piernas), cada uno UNA sola pieza de plástico mate con bisel chico; la ropa
// es una CALCOMANÍA plana pintada sobre los bloques (manga, puños, zapatos, chaleco, poncho, pollera: todo pintado, nada en 3D);
// lo único en 3D son el pelo, los sombreros, los pañuelos de cabeza, los anteojos y la barba, de pocos polígonos y color liso.
// La cara es una calcomanía de Roblox: ojos de óvalo negro SIN brillo, cejas de trazo fino solo cuando expresan algo, boca de
// línea fina (o boca abierta negra, dientes apretados o zigzag de miedo).

// ---------- ropa pintada (2D, como la ropa de Roblox): colores planos, un estampado limpio, sombreado suave de arriba hacia abajo
const ROPAV = {};
const sombra2D = (g, w, h, a = .1) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(255,255,255,.05)"); gr.addColorStop(1, `rgba(0,0,0,${a})`); g.fillStyle = gr; g.fillRect(0, 0, w, h) };
function estampa(g, w, h, kind, base, alt, x0 = 0, y0 = 0, ww = w, hh = h) { g.fillStyle = alt; g.strokeStyle = alt;
  if (kind === "rayas") for (let x = x0 + 30; x < x0 + ww; x += 84) g.fillRect(x, y0, 26, hh);
  if (kind === "franjas") for (let y = y0 + 60; y < y0 + hh; y += 140) g.fillRect(x0, y, ww, 56);
  if (kind === "rombos") for (let i = 0; i < 3; i++) { const x = x0 + ww * (i + .5) / 3, y = y0 + hh * .55; g.beginPath(); g.moveTo(x, y - 46); g.lineTo(x + 34, y); g.lineTo(x, y + 46); g.lineTo(x - 34, y); g.closePath(); g.fill() }
  if (kind === "zigzag") { g.lineWidth = 20; g.lineJoin = "miter"; for (const yy of [.42, .66]) { g.beginPath(); for (let i = -1; i <= 9; i++) g.lineTo(x0 + i * ww / 8, y0 + hh * yy + (i % 2 ? -26 : 26)); g.stroke() } }
  if (kind === "guarda") { g.fillRect(x0, y0 + hh * .62, ww, 16); g.fillRect(x0, y0 + hh * .62 + 40, ww, 10) }
  if (kind === "lunares") for (let y = y0 + 50, f = 0; y < y0 + hh; y += 100, f++) for (let x = x0 + (f % 2 ? 90 : 36); x < x0 + ww; x += 120) { g.beginPath(); g.arc(x, y, 18, 0, 7); g.fill() } }
// el frente/espalda del torso. o: { col, kind, alt, cuello, poncho: [guarda, guarda2], chaleco: [col, vivo], faja: [col, vivo], panuelo, botones, vestido }
function torsoV(o, back = false) { const key = JSON.stringify(o) + back; return ROPAV[key] ||= tex(512, 512, (g, w, h) => {
  g.fillStyle = o.col; g.fillRect(0, 0, w, h); if (o.kind) estampa(g, w, h, o.kind, o.col, o.alt);
  if (o.chaleco) { g.fillStyle = o.chaleco[0]; if (back) g.fillRect(0, 0, w, h); else { g.fillRect(0, 0, 170, h); g.fillRect(w - 170, 0, 170, h) } if (o.chaleco[1] && !back) { g.fillStyle = o.chaleco[1]; g.fillRect(162, 0, 10, h); g.fillRect(w - 172, 0, 10, h) } }
  if (o.poncho) { const V = (d, lw, c) => { g.strokeStyle = c; g.lineWidth = lw; g.lineJoin = "miter"; g.beginPath(); g.moveTo(-10, 250 - d); g.lineTo(256, 470 - d); g.lineTo(522, 250 - d); g.stroke() }; V(30, 22, o.poncho[0]); V(100, 14, o.poncho[1] || o.poncho[0]) }
  if (o.faja) { g.fillStyle = o.faja[0]; g.fillRect(0, h - 120, w, 70); if (o.faja[1]) { g.fillStyle = o.faja[1]; g.fillRect(0, h - 92, w, 12) } }
  if (!back && o.cuello) { g.fillStyle = o.cuello; g.beginPath(); g.moveTo(170, 0); g.lineTo(256, 92); g.lineTo(342, 0); g.closePath(); g.fill(); g.fillStyle = o.col; g.beginPath(); g.moveTo(200, 0); g.lineTo(256, 58); g.lineTo(312, 0); g.closePath(); g.fill() }
  if (!back && o.panuelo) { g.fillStyle = o.panuelo; g.fillRect(120, 0, 272, 34); g.beginPath(); g.moveTo(170, 20); g.lineTo(256, 150); g.lineTo(342, 20); g.closePath(); g.fill() }
  if (back && o.panuelo) { g.fillStyle = o.panuelo; g.fillRect(120, 0, 272, 34) }
  if (!back && o.botones) { g.fillStyle = o.botones; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(256, 130 + k * 82, 11, 0, 7); g.fill() } }
  if (!back && o.cuello === undefined && !o.panuelo && !o.poncho) { g.fillStyle = "rgba(0,0,0,.18)"; g.beginPath(); g.moveTo(196, 0); g.lineTo(256, 50); g.lineTo(316, 0); g.closePath(); g.fill() }   // escote en V apenas marcado
  sombra2D(g, w, h, .12) }) }
// brazo: manga de color hasta `manga` (0 = sin manga, 1 = manga larga sin mano a la vista), puño pintado, mano color piel
const brazoV = (o) => ROPAV["b" + JSON.stringify(o)] ||= tex(128, 256, (g, w, h) => { const y = h * o.manga; g.fillStyle = o.skin; g.fillRect(0, 0, w, h); g.fillStyle = o.col; g.fillRect(0, 0, w, y);
  if (o.puno) { g.fillStyle = o.puno; g.fillRect(0, y - 22, w, 16) } if (o.guarda) { g.fillStyle = o.guarda; g.fillRect(0, y * .55, w, 12) } g.fillStyle = "rgba(0,0,0,.16)"; g.fillRect(0, y, w, 4); sombra2D(g, w, h, .1) });
// pierna: pantalón (o pollera pintada hasta `falda`), piel, y el zapato como una franja oscura abajo
const piernaV = (o) => ROPAV["p" + JSON.stringify(o)] ||= tex(128, 256, (g, w, h) => { g.fillStyle = o.skin; g.fillRect(0, 0, w, h);
  const y = h * (o.falda ?? .87); g.fillStyle = o.col; g.fillRect(0, 0, w, y); if (o.alt) { g.fillStyle = o.alt; g.fillRect(0, y - 26, w, 14) }
  g.fillStyle = o.zapato; g.fillRect(0, h * .87, w, h * .13); g.fillStyle = "rgba(255,255,255,.12)"; g.fillRect(0, h * .87, w, 4); sombra2D(g, w, h, .1) });

// ---------- caras ESTILO VOLZE v2 (pedido del dueño, 27-nov-2026: «las de él son más complejas»). Calcomanía plana negra #111 sobre
// la cabeza, pero con las capas que usa Volze: boca en MEDIALUNA rellena (a veces con franja de dientes), cejas y párpados de trazo
// que se afina en las puntas, rayitas de ojeras bajo los ojos en preocupación/miedo, un labio bajo la boca triste, brillo blanco en
// los ojos asustados. Medidas en px sobre 512 (= ancho de la cabeza).
const CARAV = {};
const TINTA = "#111111", BORDO = TINTA, LENGUA = TINTA;
const FW = 512, LW = 12;
const EX = 76, EY = 172, MY = 270;
const ERX = 20, ERY = 34;
// trazo que se afina en las puntas (como pincel): curva cuadrática o cúbica rellena con grosor variable
function trazoC(g, pts, W, { ini = .25, fin = .25, col = TINTA } = {}) { const N = 32, P = [];
  const at = t => { const u = 1 - t; if (pts.length === 3) return [u * u * pts[0][0] + 2 * u * t * pts[1][0] + t * t * pts[2][0], u * u * pts[0][1] + 2 * u * t * pts[1][1] + t * t * pts[2][1]];
    return [u * u * u * pts[0][0] + 3 * u * u * t * pts[1][0] + 3 * u * t * t * pts[2][0] + t * t * t * pts[3][0], u * u * u * pts[0][1] + 3 * u * u * t * pts[1][1] + 3 * u * t * t * pts[2][1] + t * t * t * pts[3][1]] };
  for (let i = 0; i <= N; i++) P.push(at(i / N)); const L = [], R = [];
  for (let i = 0; i <= N; i++) { const t = i / N, a = P[Math.max(0, i - 1)], b = P[Math.min(N, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
    const w = W / 2 * (t < .5 ? ini + (1 - ini) * Math.sin(t / .5 * Math.PI / 2) : fin + (1 - fin) * Math.sin((1 - t) / .5 * Math.PI / 2)); L.push([P[i][0] + nx * w, P[i][1] + ny * w]); R.push([P[i][0] - nx * w, P[i][1] - ny * w]) }
  g.fillStyle = col; g.beginPath(); L.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); R.reverse().forEach(p => g.lineTo(...p)); g.closePath(); g.fill() }
function pincel(g, pts, W = LW, o = {}) { trazoC(g, pts.length === 2 ? [pts[0], [(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2], pts[1]] : pts.slice(0, 4), Math.max(W, LW), o) }
const linea = (g, pts) => pincel(g, pts, LW);
// --- ojos
const ojoSolido = (g, x, k = 1, { brillo = false, dy = 0 } = {}) => { g.fillStyle = TINTA; g.beginPath(); g.ellipse(x, EY + dy, ERX * k, ERY * k, 0, 0, 7); g.fill();
  if (brillo) { g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(x + ERX * .28 * k, EY + dy - ERY * .38 * k, ERX * .3 * k, ERY * .2 * k, 0, 0, 7); g.fill() } };
const ojoAnillo = (g, x, k = 1.1) => { g.save(); g.strokeStyle = TINTA; g.lineWidth = 10; g.beginPath(); g.ellipse(x, EY, ERX * k, ERY * k, 0, 0, 7); g.stroke(); g.restore(); g.fillStyle = TINTA; g.beginPath(); g.ellipse(x, EY + 4, ERX * .38 * k, ERY * .32 * k, 0, 0, 7); g.fill() };
const ojoMedio = (g, x, s = 1) => { g.save(); g.beginPath(); g.rect(x - ERX * 1.3, EY - ERY * .15, ERX * 2.6, ERY * 1.4); g.clip(); ojoSolido(g, x); g.restore(); trazoC(g, [[x - ERX * 1.4, EY - ERY * .1 + s * 2], [x, EY - ERY * .22], [x + ERX * 1.4, EY - ERY * .1 - s * 2]], 10, { ini: .4, fin: .4 }) };
const ojoArco = (g, x, arriba = true) => trazoC(g, arriba ? [[x - 24, EY + 8], [x, EY - 20], [x + 24, EY + 8]] : [[x - 24, EY - 4], [x, EY + 20], [x + 24, EY - 4]], 13, { ini: .35, fin: .35 });
const ojoApret = (g, x, s) => trazoC(g, [[x - s * 20, EY - 20], [x + s * 18, EY], [x - s * 20, EY + 20]], 13, { ini: .4, fin: .4 });
const ojoNegro = (g, x) => ojoSolido(g, x), ojoGota = (g, x) => ojoSolido(g, x), ojoBlanco = (g, x) => ojoAnillo(g, x), ojoPunto = (g, x) => ojoSolido(g, x, .72), ojoChill = (g, x, s) => ojoMedio(g, x, s);
// --- párpados (arco sobre el ojo), ojeras (rayitas abajo)
const parpado = (g, x, s, tipo = "alto") => { const y = EY - ERY - 10;
  if (tipo === "alto") trazoC(g, [[x - 26, y + 10], [x - s * 2, y - 10], [x + 26, y + 8]], 9, { ini: .2, fin: .2 });
  if (tipo === "pena") trazoC(g, [[x - s * 26, y + 12], [x + s * 6, y - 4], [x + s * 26, y - 6]], 9, { ini: .2, fin: .3 }) };
const ojeras = (g, x, s, n = 2) => { for (let i = 0; i < n; i++) trazoC(g, [[x - 16 + i * 4, EY + ERY + 10 + i * 9], [x + s * 2, EY + ERY + 15 + i * 9], [x + 16 - i * 4, EY + ERY + 10 + i * 9]], 6, { ini: .15, fin: .15 }) };
// --- cejas: trazo que se afina (Volze: en V para enojo, /\ para pena/preocupación, arco alto para sorpresa)
const ceja = (g, x, s, tipo) => { const y = EY - ERY - 28;
  if (tipo === "enojo") trazoC(g, [[x + s * 32, y - 14], [x + s * 4, y - 2], [x - s * 26, y + 16]], 15, { ini: .3, fin: .55 });
  if (tipo === "pena") trazoC(g, [[x - s * 28, y - 12], [x + s * 4, y - 4], [x + s * 32, y + 10]], 14, { ini: .55, fin: .3 });
  if (tipo === "alta") trazoC(g, [[x - 28, y + 2], [x, y - 22], [x + 28, y + 2]], 13, { ini: .3, fin: .3 });
  if (tipo === "duda") trazoC(g, s < 0 ? [[x - 28, y - 2], [x, y - 20], [x + 28, y - 6]] : [[x - 28, y + 4], [x, y + 2], [x + 28, y - 2]], 13, { ini: .3, fin: .3 }) };
// --- bocas
// medialuna rellena: borde de arriba casi recto (o curvo) y abajo redondo; dientes = franja blanca arriba
const medialuna = (g, w = 120, h = 54, { dientes = false, curva = 10, dy = 0 } = {}) => { const x0 = 256 - w / 2, x1 = 256 + w / 2, y0 = MY - h * .35 + dy;
  const camino = () => { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(256, y0 + curva, x1, y0); g.bezierCurveTo(x1 - w * .05, y0 + h * .9, 256 + w * .25, y0 + h, 256, y0 + h); g.bezierCurveTo(256 - w * .25, y0 + h, x0 + w * .05, y0 + h * .9, x0, y0); g.closePath() };
  camino(); g.fillStyle = TINTA; g.fill(); if (dientes) { g.save(); camino(); g.clip(); g.fillStyle = "#ffffff"; g.fillRect(x0, y0 - 4, w, h * .26 + curva * .5); g.restore() } };
// boca abierta de susto: trapecio redondeado relleno (ancho abajo), con dientes arriba
const bocaSusto = (g, w = 74, h = 70) => { const y0 = MY - h * .4; g.beginPath(); g.moveTo(256 - w * .32, y0); g.lineTo(256 + w * .32, y0); g.quadraticCurveTo(256 + w * .62, y0 + h * .95, 256 + w * .38, y0 + h); g.lineTo(256 - w * .38, y0 + h); g.quadraticCurveTo(256 - w * .62, y0 + h * .95, 256 - w * .32, y0); g.closePath(); g.fillStyle = TINTA; g.fill();
  g.save(); g.clip(); g.fillStyle = "#ffffff"; g.fillRect(256 - w * .4, y0, w * .8, h * .2); g.restore() };
// sonrisa: U de trazo que se afina; tristeza: arco invertido de trazo + labio abajo
const bocaU = (g, ancho = .3, prof = 40) => { const w = FW * ancho / 2; trazoC(g, [[256 - w, MY - prof * .3], [256, MY + prof], [256 + w, MY - prof * .3]], 14, { ini: .3, fin: .3 }) };
const bocaArcoInv = (g, ancho = .16, alto = 18, labio = true) => { const w = FW * ancho / 2; trazoC(g, [[256 - w, MY + alto * .55], [256, MY - alto], [256 + w, MY + alto * .55]], 14, { ini: .3, fin: .3 });
  if (labio) trazoC(g, [[256 - 12, MY + 22], [256, MY + 27], [256 + 12, MY + 22]], 7, { ini: .3, fin: .3 }) };
const bocaRecta = (g, ancho = .14, ladeo = 0) => { const w = FW * ancho / 2; trazoC(g, [[256 - w, MY + ladeo], [256, MY + 2], [256 + w, MY - ladeo]], 13, { ini: .35, fin: .35 }) };
const bocaO = (g, rx = 16, ry = 22) => { g.fillStyle = TINTA; g.beginPath(); g.ellipse(256, MY + 4, rx, ry, 0, 0, 7); g.fill() };
const bocaAbierta = (g, w = 150) => medialuna(g, Math.min(w, 150) * .8, 56, { dientes: true });
const bocaDientes = g => { medialuna(g, 110, 40, { dientes: true, curva: -6 }) };
const bocaZig = g => trazoC(g, [[256 - 40, MY + 6], [256 - 14, MY - 10], [256 + 14, MY + 8], [256 + 40, MY - 6]], 12, { ini: .3, fin: .3 });
const bocaD = g => medialuna(g, 130, 60, { dientes: true });
const dos = (g, f) => [-1, 1].forEach(s => f(256 + s * EX, s));
const CARAS_CAT = {
  neutral: g => { dos(g, x => ojoSolido(g, x)); bocaRecta(g, .12) },
  happy: g => { dos(g, x => ojoSolido(g, x)); medialuna(g, 150, 58, { dientes: true }) },
  warm: g => { dos(g, x => ojoSolido(g, x)); bocaU(g, .26, 34) },
  hopeful: g => { dos(g, (x, s) => { ojoSolido(g, x); parpado(g, x, s, "pena") }); bocaU(g, .2, 24) },
  relieved: g => { dos(g, (x, s) => { ojoArco(g, x); ceja(g, x, s, "pena") }); bocaU(g, .28, 34) },
  paz: g => { dos(g, x => ojoArco(g, x, false)); bocaU(g, .22, 26) },
  laugh: g => { dos(g, x => ojoArco(g, x)); medialuna(g, 170, 72, { dientes: true }) },
  excited: g => { dos(g, (x, s) => { ojoSolido(g, x, 1.1, { brillo: true }); ceja(g, x, s, "alta") }); medialuna(g, 160, 68, { dientes: true }) },
  starstruck: g => { dos(g, (x, s) => { ojoSolido(g, x, 1.15, { brillo: true }); ceja(g, x, s, "alta") }); medialuna(g, 150, 64, { dientes: true }) },
  sad: g => { dos(g, (x, s) => { ojoSolido(g, x, .95, { dy: 4 }); ceja(g, x, s, "pena"); ojeras(g, x, s, 1) }); bocaArcoInv(g, .16, 16) },
  worried: g => { dos(g, (x, s) => { ojoSolido(g, x); ceja(g, x, s, "pena"); ojeras(g, x, s, 2) }); bocaArcoInv(g, .14, 12, false) },
  pleading: g => { dos(g, (x, s) => { ojoSolido(g, x, 1.15, { brillo: true }); ceja(g, x, s, "pena") }); bocaArcoInv(g, .12, 12) },
  gloomy: g => { dos(g, (x, s) => { ojoMedio(g, x, s); ojeras(g, x, s, 2) }); bocaArcoInv(g, .12, 8, false) },
  squint: g => { dos(g, (x, s) => ojoMedio(g, x, s)); bocaRecta(g, .13) },
  suspicious: g => { dos(g, (x, s) => { ojoMedio(g, x, s); ceja(g, x, s, s < 0 ? "enojo" : "duda") }); bocaRecta(g, .14, 6) },
  determined: g => { dos(g, (x, s) => { ojoSolido(g, x); ceja(g, x, s, "enojo") }); bocaRecta(g, .15) },
  brave: g => { dos(g, (x, s) => { ojoSolido(g, x); ceja(g, x, s, "duda") }); trazoC(g, [[212, MY - 4], [256, MY + 16], [302, MY - 12]], 14, { ini: .3, fin: .3 }) },
  angry: g => { dos(g, (x, s) => { ojoSolido(g, x, .9); ceja(g, x, s, "enojo") }); bocaArcoInv(g, .16, 16) },
  grito: g => { dos(g, (x, s) => { ojoSolido(g, x, .9); ceja(g, x, s, "enojo") }); medialuna(g, 120, 64, { dientes: true, curva: -14 }) },
  scared: g => { dos(g, (x, s) => { ojoSolido(g, x, 1.05, { brillo: true }); parpado(g, x, s, "alto"); ojeras(g, x, s, 1) }); bocaSusto(g, 70, 62) },
  terrified: g => { dos(g, (x, s) => { ojoSolido(g, x, 1.2, { brillo: true }); ceja(g, x, s, "pena"); ojeras(g, x, s, 2) }); bocaSusto(g, 84, 80) },
  horrified: g => { dos(g, (x, s) => { ojoAnillo(g, x, 1.25); ceja(g, x, s, "alta"); ojeras(g, x, s, 2) }); bocaSusto(g, 80, 86) },
  panic: g => { dos(g, (x, s) => { ojoSolido(g, x, 1.1, { brillo: true }); ceja(g, x, s, "pena"); ojeras(g, x, s, 1) }); bocaSusto(g, 76, 70) },
  shock: g => { dos(g, (x, s) => { ojoAnillo(g, x, 1.15); ceja(g, x, s, "alta") }); bocaO(g, 18, 24) },
  gasp: g => { dos(g, (x, s) => { ojoSolido(g, x, 1.1, { brillo: true }); ceja(g, x, s, "alta") }); bocaO(g, 13, 17) },
  curious: g => { dos(g, (x, s) => { ojoSolido(g, x); ceja(g, x, s, "duda") }); bocaO(g, 9, 11) },
  listen: g => { dos(g, (x, s) => { ojoSolido(g, x); parpado(g, x, s, "alto") }); bocaRecta(g, .08) },
  susurra: g => { dos(g, (x, s) => { ojoSolido(g, x); ceja(g, x, s, "pena") }); bocaO(g, 8, 10) },
  sopla: g => { dos(g, (x, s) => ojoApret(g, x, s)); bocaO(g, 12, 14) },
  cerrados: g => { dos(g, x => ojoArco(g, x, false)); bocaRecta(g, .11) },
  happyD: g => { dos(g, x => ojoSolido(g, x)); medialuna(g, 130, 60, { dientes: true }) },
};
// el parpadeo: los mismos rasgos con los ojos como un arco cerrado
function caraV(kind, cerr = false) { const key = kind + (cerr ? "_c" : ""); if (CARAV[key]) return CARAV[key];
  return CARAV[key] = tex(512, 384, (g, w, h) => { g.lineCap = "round"; g.lineJoin = "round"; const f = CARAS_CAT[kind] || CARAS_CAT.neutral;
    if (!cerr) return f(g);
    const c2 = mk(512, 384), g2 = c2.getContext("2d"); f(g2); g2.clearRect(0, EY - ERY - 6, 512, ERY * 2 + 12); g.drawImage(c2, 0, 0); dos(g, x => ojoArco(g, x, false)) }) }
// piel: beige claro (la piel que pase el elenco se lleva hacia el pastel)
const pielPastel = c => "#" + new THREE.Color(c).lerp(new THREE.Color("#f6e3cc"), .4).getHexString();
caraDz = (kind, cerr = false) => caraV(kind, cerr);
setFace = (k, f) => { k.cara = f; const t = caraV(f); if (k.decal.material.map !== t) { k.decal.material.map = t; k.decal.material.needsUpdate = true } };

// ---------- pelo, sombreros, pañuelos, anteojos y barba: accesorios de Roblox de pocos polígonos, color liso, caras planas
function accMat(col, o = {}) { return new THREE.MeshStandardMaterial({ color: col, roughness: .5, flatShading: true, ...o }) }
const oscV = (c, f) => "#" + new THREE.Color(c).multiplyScalar(f).getHexString();
// trozo de pelo: un poliedro estirado (de 5 lados) que nace en `a` y termina en punta en `b`
function trozo(par, m, a, b, r) { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), L = A.distanceTo(B), geo = new THREE.ConeGeometry(r, L, 5, 1); geo.translate(0, L / 2, 0);
  const me = new THREE.Mesh(geo, m); me.position.copy(A); me.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize()); me.castShadow = true; me.userData.pelo = 1; par.add(me); return me }
function bloque(par, m, w, h, d, x, y, z, rx = 0, ry = 0, rz = 0) { const me = part(new THREE.BoxGeometry(w, h, d), m, x, y, z, par, 0); me.rotation.set(rx, ry, rz); me.userData.pelo = 1; return me }
function gema(par, m, r, x, y, z, sx = 1, sy = 1, sz = 1, det = 0) { const me = part(new THREE.IcosahedronGeometry(r, det), m, x, y, z, par, 0); me.scale.set(sx, sy, sz); me.userData.pelo = 1; return me }
// la cabeza mide .74 × .66 × .70 (de y = .05 a .71); el pelo va ENCIMA y por fuera, más grande que la cabeza, como un accesorio
function peloV(h, estilo, col) { const m = accMat(col), md = accMat(oscV(col, .78));
  if (estilo === "bajo") { bloque(h, md, .8, .44, .14, 0, .5, -.36); for (const s of [-1, 1]) bloque(h, md, .1, .3, .44, s * .395, .55, -.12); return }
  // casquete facetado: tapa arriba, atrás y los costados
  gema(h, m, .5, 0, .66, -.03, .86, .4, .82, 1);
  bloque(h, md, .78, .46, .16, 0, .5, -.34); for (const s of [-1, 1]) bloque(h, md, .1, .28, .5, s * .39, .58, -.06);
  if (estilo === "corto") { [[-.26, .74, .2, -.42, .82, .44], [-.1, .8, .22, .06, .82, .48], [.08, .8, .2, .32, .74, .44], [.24, .76, .14, .44, .62, .32], [-.3, .76, -.06, -.5, .7, .1], [.3, .78, -.1, .5, .72, .02], [0, .86, -.1, -.08, 1.02, .08], [.14, .86, -.16, .26, .98, -.02]].forEach(([a, b, c, d, e, f], i) => trozo(h, i % 3 ? m : md, [a, b, c], [d, e, f], .15)) }
  if (estilo === "puntas") { [[-.22, .1, -.5], [0, .14, 0], [.22, .1, .5], [-.12, -.12, -.3], [.14, -.12, .3], [0, -.26, 0], [-.3, -.2, -.8], [.3, -.2, .8]].forEach(([x, z, a], i) => trozo(h, i % 2 ? m : md, [x, .78, z], [x * 1.4 + a * .1, 1.12, z * 1.2 - .1], .14));
    [-.2, .02, .22].forEach(x => trozo(h, m, [x, .76, .16], [x + .08, .6, .44], .12)) }
  if (estilo === "rulos") { for (let k = 0; k < 22; k++) { const a = k / 22 * 6.283 * 2.3, rr = k < 9 ? .36 : k < 17 ? .24 : .08, y = k < 9 ? .62 : k < 17 ? .82 : .92; gema(h, k % 3 ? m : md, .15, Math.cos(a) * rr, y, Math.sin(a) * rr * .95 - .04) } }
  if (estilo === "rodete") { gema(h, m, .2, 0, .88, -.26, 1, .9, 1); [[-.26, .74, .2, -.36, .62, .4], [.26, .74, .2, .36, .62, .4], [0, .8, .22, .04, .7, .44]].forEach(([a, b, c, d, e, f]) => trozo(h, m, [a, b, c], [d, e, f], .14)) }
  if (estilo === "largo" || estilo === "melena") { const L = estilo === "largo" ? -.32 : .1; bloque(h, md, .84, .6 - L, .18, 0, (.62 + L) / 2, -.36); for (const s of [-1, 1]) bloque(h, m, .14, .58 - L, .4, s * .41, (.66 + L) / 2, -.12, 0, 0, s * .06);
    [[-.24, .76, .2, -.4, .6, .42], [0, .8, .22, .1, .7, .46], [.24, .76, .2, .4, .6, .42]].forEach(([a, b, c, d, e, f]) => trozo(h, m, [a, b, c], [d, e, f], .15)) } }
function sombreroV(k, { col = "#d6b36a", cinta = "#a8553a", tilt = -.18, ala = .78, pelo = null } = {}) { const G = new THREE.Group(); G.position.set(0, .7, -.02); G.rotation.x = tilt; k.head.add(G); G.userData.pelo = 1; const m = accMat(col, { side: THREE.DoubleSide });
  part(new THREE.CylinderGeometry(ala, ala, .05, 12), m, 0, -.04, 0, G, 0); part(new THREE.CylinderGeometry(.33, .4, .36, 12), m, 0, .14, 0, G, 0); part(new THREE.CylinderGeometry(.405, .405, .09, 12), accMat(cinta), 0, .02, 0, G, 0);
  if (pelo) peloV(k.head, "bajo", pelo); return G }
function panueloV(k, col, pelo = null) { const m = accMat(col); gema(k.head, m, .5, 0, .64, -.05, .88, .46, .84, 1); bloque(k.head, m, .82, .5, .16, 0, .46, -.34); for (const s of [-1, 1]) bloque(k.head, m, .1, .34, .52, s * .4, .54, -.06);
  gema(k.head, accMat(oscV(col, .8)), .12, 0, .3, -.46); if (pelo) { const mp = accMat(pelo); for (const s of [-1, 1]) bloque(k.head, mp, .14, .1, .1, s * .26, .64, .34) } }
function anteojosV(k) { const m = accMat("#1e1a18", { flatShading: false }); for (const s of [-1, 1]) part(new THREE.TorusGeometry(.085, .014, 6, 18), m, s * .133, .45, .362, k.head, 0); part(new THREE.BoxGeometry(.1, .016, .016), m, 0, .46, .362, k.head, 0) }
function barbaV(k, col) { const m = accMat(col), md = accMat(oscV(col, .86)); bloque(k.head, m, .66, .24, .16, 0, .04, .3); bloque(k.head, md, .5, .2, .14, 0, -.12, .28); trozo(k.head, m, [0, -.08, .3], [0, -.36, .3], .14);
  for (const s of [-1, 1]) bloque(k.head, m, .12, .36, .42, s * .37, .2, .1) }   // la barba arranca debajo de la boca pintada

// ---------- reconstruir a cada personaje con seis bloques y la ropa pintada
const quitarMallas = grp => [...grp.children].forEach(c => { if (c.isMesh || c.userData.pelo) grp.remove(c) });
function volze(k, o) { const skin = pielPastel(o.skin); k.skin = skin; k.r6 = true; delete k.falda; delete k.pasoMax; delete k.zancMax;
  [k.body, k.armL, k.armR, k.legL, k.legR].forEach(quitarMallas); [...k.head.children].forEach(c => { if (c !== k.decal) k.head.remove(c) });
  const plast = map => new THREE.MeshStandardMaterial({ map, roughness: .62 });
  // torso 1,04 × 1,04 × .52; brazos y piernas .5 × 1,04 × .5 (la mitad del torso), pegados; bisel chico
  const t = o.torso, lado = plast(tex(64, 64, (g, w, h) => { g.fillStyle = t.chaleco ? t.chaleco[0] : t.col; g.fillRect(0, 0, w, h); if (t.faja) { g.fillStyle = t.faja[0]; g.fillRect(0, h * .77, w, h * .14) } sombra2D(g, w, h, .12) }));
  part(RB(1.04, 1.04, .52, .05), boxMats(lado, plast(torsoV(t)), plast(torsoV(t, true))), 0, 1.54, 0, k.body, 0);
  [k.armL, k.armR].forEach((a, i) => { part(RB(.5, 1.04, .5, .05), plast(brazoV({ skin, ...o.brazo })), 0, -.44, 0, a, 0); a.position.x = (i ? 1 : -1) * .77 });
  [k.legL, k.legR].forEach((l, i) => { part(RB(.5, 1.02, .5, .05), plast(piernaV({ skin, ...o.pierna })), 0, -.5, 0, l, 0); l.position.x = (i ? 1 : -1) * .26 });
  // cabeza de Roblox: bloque ancho con las aristas verticales bien redondeadas, sin cuello; la cara pegada al frente
  part(RB(.74, .66, .7, .075, 4), new THREE.MeshStandardMaterial({ color: skin, roughness: .6, emissive: skin, emissiveIntensity: .28 }), 0, .38, 0, k.head, 0);   // luz pareja en la cara
  k.decal.geometry = new THREE.PlaneGeometry(.74, .555); k.decal.position.set(0, .4, .3515); k.decal.material.transparent = true; k.decal.material.needsUpdate = true;
  if (o.pelo) peloV(k.head, ...o.pelo); if (o.sombrero) sombreroV(k, o.sombrero); if (o.panuelo) panueloV(k, ...o.panuelo); if (o.anteojos) anteojosV(k); if (o.barba) barbaV(k, o.barba);
  if (o.escala) k.body.scale.setScalar(o.escala); k.arrugas = 0; k._arena = null; setFace(k, "neutral") }

// ---------- el elenco con la ropa pintada (mismos colores e identidad que antes; ponchos, chalecos, fajas, polleras y pañuelos ahora son calcomanía)
const L_ = (col, skin, manga = 1, puno = null) => ({ col, manga, puno });
volze(ME, { skin: "#eebd94", torso: { col: "#0fa97c", poncho: ["#f6efdc", "#f6efdc"] }, brazo: { col: "#0fa97c", manga: .8, puno: "#f6efdc" }, pierna: { col: "#44403c", zapato: "#2e2420" }, pelo: ["corto", "#8a4f22"], escala: .9 });
volze(ME6, { skin: "#f4cba6", torso: { col: "#f7c20a", kind: "franjas", alt: "#4a3020", cuello: "#fff6dc" }, brazo: { col: "#f7c20a", manga: .32 }, pierna: { col: "#f7c20a", falda: .42, alt: "#4a3020", zapato: "#6a4426" }, pelo: ["rulos", "#a85e26"], escala: .7 });
{ const m = accMat("#e0402e"); for (const s of [-1, 1]) trozo(ME6.head, m, [0, .9, -.22], [s * .2, .92, -.26], .09); gema(ME6.head, m, .06, 0, .9, -.22) }   // moño
volze(QUILL, { skin: "#c9936a", torso: { col: "#544a4e", cuello: "#e6dcc6", botones: "#e6dcc6" }, brazo: { col: "#544a4e", manga: .82, puno: "#e6dcc6" }, pierna: { col: "#544a4e", falda: .8, alt: "#e6dcc6", zapato: "#2a2220" }, pelo: ["rodete", "#5e4a3e"], anteojos: 1 });
volze(PIM, { skin: "#b87a52", torso: { col: "#c2913a", kind: "rayas", alt: "#efe2c0", panuelo: "#b0452c" }, brazo: { col: "#c2913a", manga: .42 }, pierna: { col: "#82705A", zapato: "#3a2a1e" }, pelo: ["puntas", "#1c1816"], escala: .8 });
volze(GARROW, { skin: "#b07a58", torso: { col: "#c2913a", poncho: ["#b0452c", "#efe2c0"], panuelo: "#b0452c" }, brazo: { col: "#c2913a", manga: .8, puno: "#b0452c" }, pierna: { col: "#6a5c4c", zapato: "#3a2a1e" }, sombrero: { cinta: "#b0452c", pelo: "#e8e4dc" }, barba: "#eeeae2" });
volze(FOLK[0], { skin: "#a86c48", torso: { col: "#d8ccb4", chaleco: ["#4a4038", "#b88a3e"], faja: ["#a8553a"] }, brazo: { col: "#d8ccb4", manga: .82 }, pierna: { col: "#5a4e42", zapato: "#2a2220" }, sombrero: { cinta: "#efe6d0", pelo: "#1e1a17", tilt: -.22 } });
volze(FOLK[1], { skin: "#c98e64", torso: { col: "#e6dcc6", kind: "guarda", alt: "#a8553a" }, brazo: { col: "#e6dcc6", manga: .5 }, pierna: { col: "#e6dcc6", falda: .82, alt: "#a8553a", zapato: "#6a4a30" }, pelo: ["largo", "#3a2418"] });
{ const cols = ["#f4ecd8", "#d9a441", "#c2603c"]; for (let j = 0; j < 7; j++) { const a = (j / 6 - .5) * 2.4; gema(FOLK[1].head, accMat(cols[j % 3]), .07, Math.sin(a) * .4, .8, Math.cos(a) * .32 - .02) } }   // corona de flores (pocas, de pocos polígonos)
volze(FOLK[2], { skin: "#b87a52", torso: { col: "#7a8258", kind: "rombos", alt: "#e6dcc6" }, brazo: { col: "#7a8258", manga: .8 }, pierna: { col: "#7a8258", falda: .82, alt: "#e6dcc6", zapato: "#3a2a1e" }, panuelo: ["#a8553a", "#1e1a17"] });
volze(FOLK[3], { skin: "#c49a78", torso: { col: "#A2A497", kind: "zigzag", alt: "#7a4a4a" }, brazo: { col: "#A2A497", manga: .82 }, pierna: { col: "#A2A497", falda: .84, alt: "#7a4a4a", zapato: "#2a2220" }, panuelo: ["#7a4a4a", "#d8d4cc"] });
volze(FOLK[4], { skin: "#8a5a3c", torso: { col: "#a8553a", poncho: ["#e6dcc6", "#576371"] }, brazo: { col: "#a8553a", manga: .8, puno: "#e6dcc6" }, pierna: { col: "#576371", zapato: "#2a2220" }, sombrero: { cinta: "#576371", pelo: "#1d1a17" } });
volze(FOLK[5], { skin: "#c98e64", torso: { col: "#A2A497", kind: "rayas", alt: "#82705A", chaleco: ["#576371"], faja: ["#b88a3e"] }, brazo: { col: "#A2A497", manga: .42 }, pierna: { col: "#4a4038", zapato: "#2a2220" }, pelo: ["rulos", "#1d1a17"] });
volze(EXT[0], { skin: "#d9a67c", torso: { col: "#82705A", kind: "rayas", alt: "#d8ccb4" }, brazo: { col: "#82705A", manga: .8 }, pierna: { col: "#82705A", falda: .78, alt: "#d8ccb4", zapato: "#2a2220" }, panuelo: ["#b88a3e", "#5a3a22"] });
volze(EXT[1], { skin: "#b08060", torso: { col: "#A2A497", chaleco: ["#7a8258", "#e6dcc6"] }, brazo: { col: "#A2A497", manga: .82 }, pierna: { col: "#6a5a48", zapato: "#2a2220" }, sombrero: { cinta: "#7a8258", pelo: "#b8b2a8", tilt: -.14 } });
volze(EXT[2], { skin: "#c98e64", torso: { col: "#a8553a", kind: "zigzag", alt: "#e6dcc6" }, brazo: { col: "#a8553a", manga: .42 }, pierna: { col: "#82705A", falda: .6, alt: "#e6dcc6", zapato: "#3a2a1e" }, pelo: ["melena", "#5a3a22"] });
volze(EXT[3], { skin: "#8a5a3c", torso: { col: "#576371", poncho: ["#b88a3e", "#d8ccb4"] }, brazo: { col: "#576371", manga: .8, puno: "#b88a3e" }, pierna: { col: "#82705A", zapato: "#2a2220" }, pelo: ["corto", "#1d1a17"] });
volze(PESCADOR, { skin: "#a86c48", torso: { col: "#82705A", kind: "rombos", alt: "#b88a3e", panuelo: "#7a8258" }, brazo: { col: "#82705A", manga: .42 }, pierna: { col: "#4a4038", zapato: "#2a2220" }, sombrero: { cinta: "#82705A", pelo: "#3a2416", tilt: -.26 } });
GARROW.encorvado = .32;

// ================= ELENCO DE «NOBODY HEARS THE BELL»: personajes, caras, utilería y poses =================
// Va DESPUÉS de _volze_personajes.js (usa caraV, CARAS_CAT, pincel, peloV, panueloV, anteojosV, barbaV, accMat, trozo, bloque, gema,
// estampa, sombra2D, ojo*, ceja, boca*). Estilo: bloques de plástico mate con bisel chico, ropa PINTADA (calcomanía: un color por prenda,
// ESTAMPADOS —floreado, florecitas, cuadros, rayitas, lunares—, manchas de cera, remiendos), cabeza recta, caras de calcomanía.
// En 3D solo pelo, gorras, pañuelos de cabeza, trenzas, barba, la cola de la levita de Sallow, sus dedos largos y la utilería.
// Quién es quién (instancias del motor reutilizadas):
//   ME = el aprendiz de Sallow (14) · NELL = ME6 (8, escala .72) · SALLOW = GARROW (el villano: 1,25 × de alto, flaco, sin orejas)
//   TRABAJADORES = [QUILL, PIM, FOLK[0], FOLK[1], FOLK[2]] (los olvidados, grises y SIN CARA)
//   VECINOS = [FOLK[3..5], EXT[0..3], PESCADOR, 6 nuevos] · MADRES = [V0, V1] · NOVIO = V2 · NOVIA = V3 · MAESTRA = V4
//   CHICOS = [V5, V6, V7] · VENDEDORES = [V8, V9] · V10 viejo · V11 vieja · V12 muchacho · V13 muchacha
//   Alias del video anterior (para que lo viejo siga armando): OLLIE = NELL, KELL = SALLOW, HOMBRES_KELL = TRABAJADORES
// Convenciones de las poses: todas son fn(k, t, …) y se llaman DESPUÉS de poner al personaje (ponerP/enAire) y de pose() del motor.
// k.g es el punto de referencia (los pies, salvo donde se dice otra cosa); el personaje mira a +z local (k.g.rotation.y lo gira).
const H_CAD = 1.02, A_BRAZO = .42, F30 = 1 / 30;
const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3(), _v4 = new THREE.Vector3(), _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _q3 = new THREE.Quaternion();
const _ABAJO = new THREE.Vector3(0, -1, 0), _mb = new THREE.Matrix4(), _ax = new THREE.Vector3(), _ay = new THREE.Vector3(), _az = new THREE.Vector3();
const _frac = x => x - Math.floor(x), _suave = q => { q = cl(q); return q * q * (3 - 2 * q) };
const HC = k => k.hcad ?? H_CAD, AB = k => k.brazoA ?? A_BRAZO;   // alto de la cadera y ángulo de los brazos en «A» de cada uno (Sallow los tiene distintos)
function caraDz(kind, cerr = false) { return caraV(kind, cerr) }   // la reasigna _volze_personajes.js: la declaración tiene que existir

// ================= CARAS EXTRA del elenco: con las piezas de la v2 del integrador (_volze_personajes.js: trazoC, ojoSolido, ojoAnillo, ojoMedio,
// parpado, ojeras, ceja, medialuna, bocaSusto, bocaU, bocaArcoInv, bocaRecta, bocaO; EX, EY, MY, ERX, ERY). Misma complejidad que el catálogo:
// cejas que se afinan, ojeras en miedo/cansancio, medialuna rellena en risa/grito, labio bajo la boca triste, brillo en ojos asustados.
// dientes apretados: rectángulo redondeado negro con la fila de dientes blanca al medio y una raya
const dientesApret = (g, w = 100, h = 30) => { g.fillStyle = TINTA; g.beginPath(); g.roundRect(256 - w / 2, MY - h / 2, w, h, h * .35); g.fill(); g.fillStyle = "#ffffff"; g.beginPath(); g.roundRect(256 - w / 2 + 7, MY - h / 2 + 6, w - 14, h - 12, 5); g.fill(); g.fillStyle = TINTA; g.fillRect(256 - w / 2 + 7, MY - 1.5, w - 14, 3) };
const dosE = (g, f) => [-1, 1].forEach(s => f(256 + s * EX, s));
// «frio»: mirada fija con cejas rectas y bajas, boca recta finita
CARAS_CAT.frio = g => { dosE(g, (x, s) => { ojoSolido(g, x, .85); trazoC(g, [[x - 28, EY - ERY - 16], [x, EY - ERY - 18], [x + 28, EY - ERY - 16 + s * 3]], 12, { ini: .35, fin: .35 }) }); bocaRecta(g, .11) };
// «desprecio»: un ojo entornado, una ceja alzada, media sonrisa torcida
CARAS_CAT.desprecio = g => { dosE(g, (x, s) => { if (s < 0) ojoMedio(g, x, s); else { ojoSolido(g, x); ceja(g, x, s, "duda") } }); trazoC(g, [[256 - 34, MY + 6], [256 + 6, MY + 6], [256 + 40, MY - 12]], 13, { ini: .35, fin: .3 }) };
// «aguanta»: cejas de enojo, dientes apretados (medialuna chata con dientes)
CARAS_CAT.aguanta = g => { dosE(g, (x, s) => { ojoSolido(g, x, .9); ceja(g, x, s, "enojo") }); dientesApret(g, 100, 30) };
// «esfuerzo»: ojos apretados, cejas de enojo, dientes apretados más anchos, ojeras de cansancio
CARAS_CAT.esfuerzo = g => { dosE(g, (x, s) => { ojoApret(g, x, s); ceja(g, x, s, "enojo"); ojeras(g, x, s, 1) }); dientesApret(g, 120, 36) };
// «wow»: asombro feliz, ojos grandes con brillo, cejas altas, medialuna con dientes
CARAS_CAT.wow = g => { dosE(g, (x, s) => { ojoSolido(g, x, 1.2, { brillo: true }); ceja(g, x, s, "alta") }); medialuna(g, 130, 64, { dientes: true }) };
// «mira»: mirando algo arriba, ojos con brillo, cejas altas, «o» chica
CARAS_CAT.mira = g => { dosE(g, (x, s) => { ojoSolido(g, x, 1.05, { brillo: true, dy: -4 }); ceja(g, x, s, "alta") }); bocaO(g, 10, 13) };
// «furia»: cejas de enojo bien marcadas, ojos chicos, grito con dientes (boca hacia abajo)
CARAS_CAT.furia = g => { dosE(g, (x, s) => { ojoSolido(g, x, .85); ceja(g, x, s, "enojo") }); bocaSusto(g, 78, 58) };
// «grito» (pisa la del catálogo: es NELL llamando «Say my name»): ojos apretados, cejas de pena, boca enorme abierta con dientes
CARAS_CAT.grito = g => { dosE(g, (x, s) => { ojoApret(g, x, s); ceja(g, x, s, "pena") }); bocaSusto(g, 92, 92) };
// «terror»: ojos enormes con brillo, párpado alto, cejas de pena, doble ojera, boca de susto con dientes
CARAS_CAT.terror = g => { dosE(g, (x, s) => { ojoSolido(g, x, 1.25, { brillo: true }); ceja(g, x, s, "pena"); ojeras(g, x, s, 2) }); bocaSusto(g, 86, 88) };
// «educada»: Nell mirando a un extraño: ojos un poco chicos sin cejas, una sonrisita chata de compromiso
CARAS_CAT.educada = g => { dosE(g, x => ojoSolido(g, x, .88)); bocaU(g, .13, 10) };
// «vacia»: los olvidados. Sin rasgos.
CARAS_CAT.vacia = g => { };
// «sallow» (no se usa: hay un Sallow nuevo): ojos chiquitos fijos con ojeras, sin cejas, una U finísima demasiado ancha
CARAS_CAT.sallow = g => { dosE(g, (x, s) => { ojoSolido(g, x - s * 14, .5); ojeras(g, x - s * 14, s, 2) }); trazoC(g, [[256 - 150, MY - 50], [256 - 130, MY + 60], [256 + 130, MY + 60], [256 + 150, MY - 50]], 9, { ini: .2, fin: .2 }) };
const SIN_PARPADEO = new Set(["relieved", "paz", "cerrados", "sopla", "esfuerzo", "happyD", "grito", "sallow", "vacia", "vuelve", "terror"]);
// UN parpadeo de 4 cuadros (a 30 fps) cada 1,2–1,6 s, desfasado por personaje (Sallow no parpadea nunca)
function parpadeo(k, t) { if (k.caraFija) return false; const T = 1.2 + .4 * _frac(k.idx * .618 + .31), ph = (t + T * _frac(k.idx * .377 + .15)) % T;
  if (ph < 4 * F30 && k.cara && !SIN_PARPADEO.has(k.cara)) { const m = caraV(k.cara, true); if (k.decal.material.map !== m) { k.decal.material.map = m; k.decal.material.needsUpdate = true } return true } return false }
// setFace: Sallow siempre con su sonrisa (k.caraFija); los olvidados (k.sinCara) quedan «vacia» cuando la escena pide «neutral»
{ const sf0 = setFace; setFace = (k, f) => sf0(k, k.caraFija || (k.sinCara && f === "neutral" ? "vacia" : f)) }
// caraVuelve(k, u, cara): la cara de un olvidado vuelve: u = 0 lisa («vacia») … 1 la cara pedida (por defecto «neutral»). 11 pasos cacheados.
const CARA_VUELVE = {};
function caraVuelve(k, u, cara = "neutral") { const q = Math.round(cl(u) * 10) / 10, m = k.decal.material; let t;
  if (q <= 0) t = caraV("vacia"); else if (q >= 1) t = caraV(cara);
  else t = CARA_VUELVE[cara + q] ||= tex(512, 384, g => { g.globalAlpha = 1 - q; g.drawImage(caraV("vacia").image, 0, 0); g.globalAlpha = q; g.drawImage(caraV(cara).image, 0, 0); g.globalAlpha = 1 });
  k.cara = q >= 1 ? cara : "vuelve"; if (m.map !== t) { m.map = t; m.needsUpdate = true } return t }

// ================= ROPA PINTADA (texturas planas con sombreado suave): estampados de colores, cera, quemaduras =================
const ROPAC = {};
// manchas de grasa/hollín: gotas negras irregulares con un brillo chico (sembradas: siempre las mismas)
function manchasG(g, w, h, n, seed, y0 = 0) { const r = rng(seed); for (let i = 0; i < n; i++) { const x = r() * w, y = y0 + r() * (h - y0), R = 8 + r() * 16; g.fillStyle = "rgba(22,18,14,.86)"; g.beginPath();
    for (let j = 0; j < 9; j++) { const a = j / 9 * 6.283, rr = R * (.65 + r() * .55); g.lineTo(x + Math.cos(a) * rr * 1.7, y + Math.sin(a) * rr * .6) } g.closePath(); g.fill();
    g.fillStyle = "rgba(255,255,255,.22)"; g.beginPath(); g.ellipse(x - R * .25, y - R * .25, R * .22, R * .12, -.5, 0, 7); g.fill() } }
// chorreadas de CERA: gota de cera clara con un hilo que cae y termina en una bolita, brillo arriba
function manchasCera(g, w, h, n, seed, y0 = 0, col = "rgba(222,200,140,.8)") { const r = rng(seed); for (let i = 0; i < n; i++) { const x = r() * w, y = y0 + r() * (h - y0) * .85, R = 4 + r() * 9;
    g.fillStyle = col; g.beginPath(); for (let j = 0; j < 11; j++) { const a = j / 11 * 6.283, rr = R * (.55 + r() * .7); g.lineTo(x + Math.cos(a) * rr * 1.3, y + Math.sin(a) * rr * .8) } g.closePath(); g.fill();   // salpicón irregular
    for (let d = 0, nd = 1 + (r() * 2 | 0); d < nd; d++) { const xd = x + (r() - .5) * R * 1.4, L = R * (1 + r() * 3.2), wd = R * (.18 + r() * .2); g.beginPath(); g.moveTo(xd - wd, y); g.lineTo(xd + wd, y); g.lineTo(xd + wd * .7, y + L); g.arc(xd, y + L, wd * 1.25, 0, Math.PI); g.closePath(); g.fill() }   // chorritos que caen
    for (let d = 0; d < 4; d++) { g.beginPath(); g.arc(x + (r() - .5) * R * 4, y + (r() - .5) * R * 3, 1 + r() * 2.5, 0, 7); g.fill() }   // gotitas sueltas
    g.fillStyle = "rgba(255,250,230,.35)"; g.beginPath(); g.ellipse(x - R * .3, y - R * .2, R * .3, R * .16, 0, 0, 7); g.fill() } }
// quemaduras de cera en la piel: manchas rojizas con el centro rosado y una ampollita
function quemadurasG(g, x0, y0, w, h, n, seed) { const r = rng(seed); for (let i = 0; i < n; i++) { const x = x0 + r() * w, y = y0 + r() * h, R = 4 + r() * 7;
    g.fillStyle = "rgba(170,70,58,.45)"; g.beginPath(); for (let j = 0; j < 9; j++) { const a = j / 9 * 6.283, rr = R * (.6 + r() * .7); g.lineTo(x + Math.cos(a) * rr * 1.4, y + Math.sin(a) * rr) } g.closePath(); g.fill();
    g.fillStyle = "rgba(226,140,120,.55)"; g.beginPath(); g.ellipse(x + R * .2, y, R * .6, R * .4, r() * 3, 0, 7); g.fill(); if (r() < .5) { g.fillStyle = "rgba(255,236,214,.6)"; g.beginPath(); g.arc(x - R * .2, y - R * .1, R * .22, 0, 7); g.fill() } } }
// remiendo: un parche de otro color con puntadas
function remiendoG(g, x, y, w, h, col) { g.fillStyle = col; g.fillRect(x, y, w, h); g.fillStyle = "rgba(0,0,0,.12)"; g.fillRect(x, y + h - 6, w, 6); g.setLineDash([10, 8]); g.strokeStyle = "rgba(240,230,210,.75)"; g.lineWidth = 4; g.strokeRect(x + 7, y + 7, w - 14, h - 14); g.setLineDash([]) }
// estampados nuevos (además de los de estampa(): rayas, franjas, rombos, zigzag, guarda, lunares):
//   floreado (flores grandes de 5 pétalos con hojitas) · florecitas (chiquitas, sin hojas) · cuadros (vichy) · rayitas (finas)
// esc = escala del dibujo (.5 en brazos y piernas, que tienen la mitad de píxeles por metro que el torso)
function estampaC(g, w, h, kind, base, alt, alt2, esc = 1) { g.save(); if (esc !== 1) g.scale(esc, esc); const W = w / esc, H = h / esc;
  if (kind === "floreado" || kind === "florecitas") { const big = kind === "floreado", R = big ? 30 : 15, paso = big ? 118 : 64, r = rng(big ? 77 : 31);
    for (let y = paso * .45, f = 0; y < H + R; y += paso * .78, f++) for (let x = (f % 2) * paso / 2 + paso * .2; x < W + R; x += paso) { const xx = x + (r() - .5) * paso * .25, yy = y + (r() - .5) * paso * .25, rot = r() * 6;
      if (big) { g.fillStyle = "#5e8a52"; for (const a of [rot + 2.2, rot + 4.1]) { g.beginPath(); g.ellipse(xx + Math.cos(a) * R * 1.05, yy + Math.sin(a) * R * 1.05, R * .5, R * .22, a, 0, 7); g.fill() } }
      g.fillStyle = alt; for (let p = 0; p < 5; p++) { const a = rot + p / 5 * 6.283; g.beginPath(); g.ellipse(xx + Math.cos(a) * R * .55, yy + Math.sin(a) * R * .55, R * .45, R * .32, a, 0, 7); g.fill() }
      g.fillStyle = alt2 || "#f2c230"; g.beginPath(); g.arc(xx, yy, R * .27, 0, 7); g.fill() } }
  else if (kind === "cuadros") { g.fillStyle = alt; g.globalAlpha = .55; for (let x = 0; x < W; x += 56) g.fillRect(x, 0, 26, H); for (let y = 0; y < H; y += 56) g.fillRect(0, y, W, 26); g.globalAlpha = 1 }
  else if (kind === "rayitas") { g.fillStyle = alt; for (let x = 10; x < W; x += 34) g.fillRect(x, 0, 9, H) }
  else estampa(g, W, H, kind, base, alt);
  g.restore() }
const patronC = (g, w, h, o, base) => { g.save(); g.beginPath(); g.rect(0, 0, w, h); g.clip(); estampaC(g, w, h, o.kind, base, o.alt || "#efe6d2", o.alt2, .5); g.restore() };
// frente/espalda del torso. o: { col, kind, alt, alt2, levita: [col, chaleco, camisa, corbata], cadena: col, chaleco: [col, botón], panuelo: col, cuello: col,
//   botones: col, delantal: [col, borde, "cuero"?], chal: [col, guarda], traje: [camisa, moño, flor], encaje: col, faja: [col, vivo], tirantes: col,
//   remiendos: [col, …], manchas: n (grasa), cera: n (chorreadas de cera), seed }
function torsoC(o, back = false) { const key = "t" + JSON.stringify(o) + back; return ROPAC[key] ||= tex(512, 512, (g, w, h) => {
  g.fillStyle = o.col; g.fillRect(0, 0, w, h); if (o.kind) estampaC(g, w, h, o.kind, o.col, o.alt || "#efe6d2", o.alt2);
  if (o.tejido) { const [c1, c2] = o.tejido; g.fillStyle = c1; for (let y = 70; y < h; y += 150) g.fillRect(0, y, w, 26); g.fillStyle = c2; for (let y = 130, f = 0; y < h; y += 150, f++) for (let x = (f % 2) * 30 + 15; x < w; x += 60) { g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill() }
    g.strokeStyle = "rgba(0,0,0,.12)"; g.lineWidth = 2; for (let y = 8; y < h; y += 16) for (let x = 0; x < w; x += 16) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 8, y + 8); g.lineTo(x + 16, y); g.stroke() } }
  if (o.cuelloR && !back) { g.strokeStyle = o.cuelloR; g.lineWidth = 22; g.beginPath(); g.arc(256, -30, 120, .25, Math.PI - .25); g.stroke() }
  if (o.overol) { g.fillStyle = o.overol; g.fillRect(0, 300, w, h - 300); if (!back) { g.fillRect(150, 190, 212, 120); g.fillRect(150, 0, 40, 200); g.fillRect(322, 0, 40, 200); g.fillStyle = "#f2d060"; for (const x of [170, 342]) { g.beginPath(); g.arc(x, 200, 11, 0, 7); g.fill() } g.strokeStyle = "rgba(255,255,255,.5)"; g.setLineDash([8, 6]); g.lineWidth = 3; g.strokeRect(160, 200, 192, 100); g.setLineDash([]) } else { g.save(); g.lineWidth = 40; g.strokeStyle = o.overol; g.beginPath(); g.moveTo(120, 0); g.lineTo(380, 310); g.moveTo(392, 0); g.lineTo(132, 310); g.stroke(); g.restore() } }
  if (o.escudo && !back) { const [c1, c2] = o.escudo, x = 256, y = 250; g.fillStyle = c1; g.beginPath(); g.moveTo(x - 60, y - 60); g.lineTo(x + 60, y - 60); g.lineTo(x + 60, y + 10); g.quadraticCurveTo(x + 50, y + 60, x, y + 80); g.quadraticCurveTo(x - 50, y + 60, x - 60, y + 10); g.closePath(); g.fill(); g.fillStyle = c2; g.font = "bold 80px sans-serif"; g.textAlign = "center"; g.fillText("7", x, y + 38) }
  if (o.cuello && !back) { g.fillStyle = o.cuello; g.beginPath(); g.moveTo(160, 0); g.lineTo(256, 110); g.lineTo(352, 0); g.closePath(); g.fill() }
  if (o.chaleco) { g.fillStyle = o.chaleco[0]; if (back) g.fillRect(0, 0, w, h); else { g.beginPath(); g.moveTo(0, 0); g.lineTo(196, 0); g.lineTo(256, 150); g.lineTo(256, h); g.lineTo(0, h); g.closePath(); g.fill(); g.beginPath(); g.moveTo(w, 0); g.lineTo(316, 0); g.lineTo(256, 150); g.lineTo(256, h); g.lineTo(w, h); g.closePath(); g.fill();
      g.fillStyle = "rgba(0,0,0,.3)"; g.fillRect(253, 150, 6, h - 150); if (o.chaleco[1]) { g.fillStyle = o.chaleco[1]; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(276, 200 + i * 80, 12, 0, 7); g.fill() } } } }
  if (o.levita) { const [lc, ch, cam, cor] = o.levita; g.fillStyle = lc; if (back) { g.fillRect(0, 0, w, h); g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(250, 300, 10, h - 300); for (const x of [200, 312]) { g.fillStyle = "#4a4440"; g.beginPath(); g.arc(x, 410, 11, 0, 7); g.fill() } }
    else { g.fillStyle = ch; g.fillRect(150, 0, 212, h); g.fillStyle = cam; g.beginPath(); g.moveTo(186, 0); g.lineTo(256, 120); g.lineTo(326, 0); g.closePath(); g.fill(); g.fillStyle = cor; g.beginPath(); g.moveTo(232, 14); g.lineTo(280, 14); g.lineTo(268, 112); g.lineTo(256, 126); g.lineTo(244, 112); g.closePath(); g.fill();
      g.fillStyle = "rgba(255,255,255,.18)"; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(256, 180 + i * 78, 10, 0, 7); g.fill() }
      g.fillStyle = lc; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(256 + s * 256, 0); g.lineTo(256 + s * 66, 0); g.lineTo(256 + s * 150, 210); g.lineTo(256 + s * 106, 260); g.lineTo(256 + s * 106, h); g.lineTo(256 + s * 256, h); g.closePath(); g.fill() }
      g.fillStyle = "rgba(255,255,255,.08)"; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(256 + s * 66, 0); g.lineTo(256 + s * 150, 210); g.lineTo(256 + s * 120, 236); g.lineTo(256 + s * 96, 0); g.closePath(); g.fill() } }
    // gastada: brillos de uso y deshilachado en los bordes
    g.fillStyle = "rgba(160,150,140,.10)"; const r = rng(91 + (back ? 1 : 0)); for (let i = 0; i < 26; i++) g.fillRect(r() * w, r() * h, 6 + r() * 30, 2 + r() * 4) }
  if (o.cadena && !back) { g.strokeStyle = o.cadena; g.lineWidth = 9; g.setLineDash([12, 6]); g.beginPath(); g.moveTo(262, 260); g.quadraticCurveTo(300, 330, 352, 300); g.stroke(); g.setLineDash([]) }
  if (o.tirantes) { g.fillStyle = o.tirantes; g.fillRect(130, 0, 34, h); g.fillRect(348, 0, 34, h) }
  if (o.chal) { const V = (d, lw, c) => { g.strokeStyle = c; g.lineWidth = lw; g.lineJoin = "miter"; g.beginPath(); g.moveTo(-10, 250 - d); g.lineTo(256, 470 - d); g.lineTo(522, 250 - d); g.stroke() };
    g.fillStyle = o.chal[0]; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w, 250); g.lineTo(256, 470); g.lineTo(0, 250); g.closePath(); g.fill(); estampa(g, w, 250, "rombos", o.chal[0], oscV(o.chal[0], .82)); if (o.chal[1]) V(40, 18, o.chal[1]) }
  if (o.traje && !back) { const [cam, mo, flor] = o.traje; g.fillStyle = cam; g.beginPath(); g.moveTo(186, 0); g.lineTo(326, 0); g.lineTo(256, 230); g.closePath(); g.fill();
    g.fillStyle = "rgba(0,0,0,.35)"; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(256 + s * 70, 0); g.lineTo(256 + s * 96, 0); g.lineTo(256 + s * 8, 250); g.lineTo(256, 236); g.closePath(); g.fill() }
    g.fillStyle = mo; g.beginPath(); g.moveTo(256, 44); g.lineTo(222, 26); g.lineTo(222, 64); g.closePath(); g.fill(); g.beginPath(); g.moveTo(256, 44); g.lineTo(290, 26); g.lineTo(290, 64); g.closePath(); g.fill(); g.fillRect(248, 36, 16, 16);
    if (flor) { for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283; g.fillStyle = "#f6f2ea"; g.beginPath(); g.arc(140 + Math.cos(a) * 15, 110 + Math.sin(a) * 15, 11, 0, 7); g.fill() } g.fillStyle = flor; g.beginPath(); g.arc(140, 110, 9, 0, 7); g.fill() } }
  if (o.delantal) { const [dc, db, tipo] = o.delantal; g.fillStyle = dc; g.fillRect(0, 226, w, 22); if (!back) { g.fillRect(150, 60, 212, 180); g.fillRect(96, 236, 320, h - 236); g.fillRect(156, 0, 18, 64); g.fillRect(338, 0, 18, 64);
      g.strokeStyle = db; g.lineWidth = 8; g.strokeRect(186, 340, 140, 80); g.fillStyle = db; g.fillRect(96, h - 30, 320, 12);
      if (tipo === "cuero") { g.setLineDash([9, 7]); g.strokeStyle = "rgba(240,220,180,.6)"; g.lineWidth = 3; g.strokeRect(160, 70, 192, 160); g.strokeRect(106, 246, 300, h - 290); g.setLineDash([]);
        g.fillStyle = "rgba(0,0,0,.18)"; for (const [x, y, ww, hh] of [[110, 300, 60, 6], [330, 380, 70, 5], [200, 450, 90, 6]]) g.fillRect(x, y, ww, hh);   // marcas y rayones del cuero
        g.fillStyle = "rgba(255,240,210,.14)"; g.fillRect(150, 60, 212, 14) } } }
  if (o.encaje) { g.fillStyle = o.encaje; for (let x = 0; x < w + 32; x += 40) { g.beginPath(); g.arc(x, 0, 22, 0, Math.PI); g.fill() } }
  if (o.faja) { g.fillStyle = o.faja[0]; g.fillRect(0, h - 104, w, 54); if (o.faja[1]) { g.fillStyle = o.faja[1]; g.fillRect(0, h - 84, w, 12) } }
  if (o.panuelo) { g.fillStyle = o.panuelo; g.fillRect(96, 0, 320, 40); if (!back) { g.beginPath(); g.moveTo(150, 24); g.lineTo(256, 190); g.lineTo(362, 24); g.closePath(); g.fill(); g.fillStyle = "rgba(255,255,255,.55)"; for (const [x, y] of [[210, 60], [300, 60], [256, 120], [236, 90], [276, 90]]) { g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill() } g.fillStyle = "rgba(0,0,0,.2)"; g.fillRect(96, 36, 320, 6) } }
  if (o.corazon && !back) { const x = 330, y = 300, r = 34; g.fillStyle = o.corazon; g.beginPath(); g.moveTo(x, y + r * 1.4); g.bezierCurveTo(x - r * 2.2, y + r * .2, x - r * 1.1, y - r * 1.4, x, y - r * .35); g.bezierCurveTo(x + r * 1.1, y - r * 1.4, x + r * 2.2, y + r * .2, x, y + r * 1.4); g.fill() }
  if (o.bufanda) { const [b1, b2] = o.bufanda; for (let x = 0; x < w; x += 64) { g.fillStyle = (x / 64) % 2 ? b2 : b1; g.fillRect(x, 0, 64, 70) } if (!back) for (let y = 70; y < 330; y += 52) { g.fillStyle = ((y - 70) / 52) % 2 ? b2 : b1; g.fillRect(320, y, 74, 52) } }
  if (!back && o.botones) { g.fillStyle = o.botones; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(256, 150 + k * 82, 11, 0, 7); g.fill() } }
  if (o.remiendos) o.remiendos.forEach((c, i) => back ? remiendoG(g, i ? 300 : 70, i ? 120 : 300, 120, 100, c) : remiendoG(g, i ? 70 : 340, i ? 330 : 380, 110, 96, c));
  if (o.manchas) manchasG(g, w, h, o.manchas, (o.seed || 7) + (back ? 50 : 0), 120);
  if (o.cera) manchasCera(g, w, h, back ? Math.ceil(o.cera / 3) : o.cera, (o.seed || 7) + (back ? 60 : 0), back ? 120 : 190);
  { const gp = (x, y, r, a) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r) };   // pliegues pintados
    gp(0, 140, 150, .16); gp(w, 140, 150, .16); gp(256, h, 220, .12); g.strokeStyle = "rgba(0,0,0,.06)"; g.lineWidth = 14; g.lineCap = "round"; for (const [x0, y0, x1, y1] of [[60, 200, 180, 330], [452, 210, 340, 340], [200, 420, 300, 460]]) { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2 + 20, (y0 + y1) / 2, x1, y1); g.stroke() }
    const br = g.createRadialGradient(200, 160, 0, 200, 160, 200); br.addColorStop(0, "rgba(255,255,255,.10)"); br.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = br; g.fillRect(0, 0, w, h) }
  sombra2D(g, w, h, .12) }) }
const torsoLadoC = o => ROPAC["l" + JSON.stringify(o)] ||= tex(64, 64, (g, w, h) => { g.fillStyle = o.levita ? o.levita[0] : o.chaleco ? o.chaleco[0] : o.chal ? o.chal[0] : o.col; g.fillRect(0, 0, w, h);
  if (o.kind && !o.levita && !o.chaleco && !o.chal) estampaC(g, w, h, o.kind, o.col, o.alt || "#efe6d2", o.alt2, .125);
  if (o.delantal) { g.fillStyle = o.delantal[0]; g.fillRect(0, 28, w, 3) } if (o.faja) { g.fillStyle = o.faja[0]; g.fillRect(0, h - 13, w, 7) } if (o.panuelo) { g.fillStyle = o.panuelo; g.fillRect(0, 0, w, 5) } sombra2D(g, w, h, .12) });
// brazo: manga hasta `manga` (0 sin manga … 1 larga) con estampado (kind/alt/alt2), puño (punoH = alto: arremangado grueso), rayas, guante (y guanteDesde),
// manchas, cera, quemaduras (n, en la piel), remiendo; el resto es la mano color piel
const brazoC = o => ROPAC["b" + JSON.stringify(o)] ||= tex(128, 256, (g, w, h) => { const y = h * (o.manga ?? .82); g.fillStyle = o.skin; g.fillRect(0, 0, w, h); g.fillStyle = o.col; g.fillRect(0, 0, w, y);
  if (o.kind) patronC(g, w, y, o, o.col);
  if (o.rayas) { g.fillStyle = o.rayas; for (let yy = 34; yy < y - 34; yy += 54) g.fillRect(0, yy, w, 16) }
  if (o.puno) { const ph = o.punoH || 20; g.fillStyle = o.puno; g.fillRect(0, y - ph - 6, w, ph); if (o.punoH) { g.fillStyle = "rgba(0,0,0,.18)"; g.fillRect(0, y - ph / 2 - 6, w, 3) } }
  if (o.remiendo) remiendoG(g, 18, h * .3, 92, 60, o.remiendo);
  if (o.manchas) manchasG(g, w, y, o.manchas, o.seed || 3);
  if (o.cera) manchasCera(g, w, y, o.cera, (o.seed || 3) + 20, 10);
  g.fillStyle = "rgba(0,0,0,.16)"; g.fillRect(0, y, w, 4);
  if (o.quemaduras) quemadurasG(g, 10, y + 16, w - 20, h * .95 - y - 16, o.quemaduras, (o.seed || 3) + 40);
  if (o.guante) { const yg = h * (o.guanteDesde ?? .76); g.fillStyle = o.guante; g.fillRect(0, yg, w, h - yg); g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(0, yg + 6, w, 7); g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(0, yg, w, 5) }
  sombra2D(g, w, h, .1) });
// pierna: pantalón hasta `largo` (debajo, media o piel) con estampado, pollera/levita pintada arriba hasta `falda` (con estampado si hay kind);
// zapato = franja oscura abajo (cana = alto), gastado = raspones; frente = 1 → la cara de adelante (delantalP: el delantal sigue hasta la rodilla; cera)
const piernaC = o => ROPAC["p" + JSON.stringify(o)] ||= tex(128, 256, (g, w, h) => { const L = h * (o.largo ?? .87);
  g.fillStyle = o.media || o.skin; g.fillRect(0, 0, w, h); g.fillStyle = o.col; g.fillRect(0, 0, w, L);
  if (o.rayado) { g.fillStyle = o.rayado; for (let x = 10; x < w; x += 26) g.fillRect(x, 0, 6, L) }
  if (o.kind && !o.falda) patronC(g, w, L, o, o.col);
  if (o.denim) { const r = rng(o.seed || 5); for (let i = 0; i < 900; i++) { g.fillStyle = r() < .5 ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.08)"; g.fillRect(r() * w, r() * L, 1 + r() * 3, 1) }
    const kn = g.createRadialGradient(w / 2, L * .5, 4, w / 2, L * .5, 60); kn.addColorStop(0, "rgba(255,255,255,.12)"); kn.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = kn; g.fillRect(0, 0, w, L);
    g.strokeStyle = "rgba(230,190,110,.35)"; g.setLineDash([5, 4]); g.lineWidth = 2; g.beginPath(); g.moveTo(8, 0); g.lineTo(8, L); g.stroke(); g.setLineDash([]); g.fillStyle = "rgba(0,0,0,.15)"; g.fillRect(0, L - 16, w, 5) }
  if (!o.falda) { g.fillStyle = "rgba(0,0,0,.1)"; g.fillRect(w / 2 - 2, 0, 4, L * .9) }
  if (o.remiendo) remiendoG(g, 20, h * .42, 86, 56, o.remiendo);
  if (o.manchas) manchasG(g, w, L, o.manchas, o.seed || 5, 20);
  if (o.falda) { const yf = h * o.falda; g.fillStyle = o.faldaCol || o.col; g.fillRect(0, 0, w, yf); if (o.kind) patronC(g, w, yf, o, o.faldaCol || o.col); if (o.ruedo) { g.fillStyle = o.ruedo; g.fillRect(0, yf - 24, w, 14) } if (o.remiendoF) remiendoG(g, 24, yf * .35, 80, 50, o.remiendoF); g.fillStyle = "rgba(0,0,0,.2)"; g.fillRect(0, yf, w, 5) }
  if (o.frente && o.delantalP) { const yd = h * .5; g.fillStyle = o.delantalP; g.fillRect(0, 0, w, yd); g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(0, yd - 6, w, 6) }
  if (o.frente && o.cera) manchasCera(g, w, L, o.cera, (o.seed || 5) + 9, 10);
  if (L < h * .86) { g.fillStyle = "rgba(0,0,0,.2)"; g.fillRect(0, L, w, 4) }
  const zb = h * (1 - (o.cana ?? .13)); g.fillStyle = o.zapato || "#2a2220"; g.fillRect(0, zb, w, h - zb); g.fillStyle = "rgba(255,255,255,.12)"; g.fillRect(0, zb, w, 4);
  if (o.gastado) { g.fillStyle = "rgba(200,190,170,.3)"; for (let i = 0; i < 8; i++) g.fillRect(6 + (i * 37) % (w - 30), zb + 8 + (i * 13) % Math.max(4, h - zb - 14), 12 + (i * 7) % 16, 3) }
  sombra2D(g, w, h, .1) });

// ================= PELO COMO EL DE VOLZE: pieza esculpida con mechones, surcos y textura de hebras =================
// Base: un casco continuo (caja redondeada alrededor de la cabeza) que cubre arriba, costados y nuca hasta la línea de cada estilo y se hunde
// en la cabeza debajo de esa línea. Encima: surcos irregulares entre mechones grandes (desplazamiento + oclusión en el color de vértice: crestas
// claras, surcos oscuros), ruido de volumen asimétrico, mechones sueltos en lágrima (flequillo de 3–5, puntas que salen), trenzas de eslabones
// alternados, rodete de vueltas. Material: textura de hebras finas a lo largo del peinado (mapa de color) + bump con los surcos (1024 px).
// Estilos: "despeinado" · "trenzas" · "coletas" · "atras" · "melena" · "rodete" · "coleta" · "jopo" · "corto" · "rulos" · "calvo". Colores PELO_COL.
const PELO_COL = { rubio: "#e6b340", choco: "#5b3a24", castano: "#8a5a34", rojo: "#b2502a", gris: "#cfcfd3", negro: "#2a2422", blanco: "#ecebe6" };
const _sst = (a, b, v) => { const q = cl((v - a) / (b - a)); return q * q * (3 - 2 * q) };
// hebras: líneas finas onduladas a lo largo de v (mapa de color) y, en el bump, surcos más anchos cada tanto
const [T_HEBRAS_C, T_HEBRAS_B] = (() => { const W = 1024, H = 1024, r = rng(90210), c = mk(W, H), b = mk(W, H), g = c.getContext("2d"), z = b.getContext("2d");
  g.fillStyle = "#e8e8e8"; g.fillRect(0, 0, W, H); z.fillStyle = "#808080"; z.fillRect(0, 0, W, H);
  for (let i = 0; i < 700; i++) { const x = r() * W, a = 4 + r() * 10, ph = r() * 6, dark = r() < .55, lw = .7 + r() * 2.2;
    g.strokeStyle = dark ? `rgba(0,0,0,${.08 + r() * .16})` : `rgba(255,255,255,${.2 + r() * .35})`; z.strokeStyle = dark ? `rgba(0,0,0,${.15 + r() * .2})` : `rgba(255,255,255,${.15 + r() * .2})`;
    g.lineWidth = z.lineWidth = lw; g.beginPath(); z.beginPath(); for (let y = 0; y <= H; y += 32) { const xx = x + a * Math.sin(y / H * 6.283 * 1.5 + ph); y ? (g.lineTo(xx, y), z.lineTo(xx, y)) : (g.moveTo(xx, y), z.moveTo(xx, y)) } g.stroke(); z.stroke() }
  for (let x = 0; x < W;) { const w = 10 + r() * 16, ph = r() * 6; for (const [ctx, col] of [[g, "rgba(0,0,0,.14)"], [z, "rgba(0,0,0,.55)"]]) { ctx.strokeStyle = col; ctx.lineWidth = w * (ctx === z ? .5 : .35); ctx.beginPath(); for (let y = 0; y <= H; y += 32) { const xx = x + 6 * Math.sin(y / H * 9 + ph); y ? ctx.lineTo(xx, y) : ctx.moveTo(xx, y) } ctx.stroke() } x += 40 + r() * 60 }
  return [c, b].map(cv => { const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t }) })();
T_HEBRAS_C.colorSpace = THREE.SRGBColorSpace;
const M_PELO2 = {}; const matPelo = (col, rep = 3) => M_PELO2[col + rep] ||= (() => { const m = new THREE.MeshStandardMaterial({ color: col, roughness: .42, vertexColors: true, map: T_HEBRAS_C.clone(), bumpMap: T_HEBRAS_B.clone(), bumpScale: 2.2, side: THREE.DoubleSide });
  [m.map, m.bumpMap].forEach(t => { t.repeat.set(rep, 1); t.needsUpdate = true }); return m })();
// color de vértice: degradé suave por alto × oclusión (ao 0 = cresta, 1 = surco)
const _colorPelo = (G, ao = null, y0 = .1, y1 = 1) => { const P = G.attributes.position, c = new Float32Array(P.count * 3); for (let i = 0; i < P.count; i++) { const s = (.82 + .18 * _sst(y0, y1, P.getY(i))) * (1 - .55 * (ao ? ao[i] : 0)); c[i * 3] = c[i * 3 + 1] = c[i * 3 + 2] = s } G.setAttribute("color", new THREE.BufferAttribute(c, 3)); return G };
// mechón suelto: lágrima aplastada contra el cráneo (la textura de hebras corre a lo largo)
const GEO_MECHON = (() => { const pr = [[.001, 0], [.62, .06], [.86, .26], [.8, .52], [.5, .8], [.18, .95], [.001, 1]].map(([x, y]) => new THREE.Vector2(x, y)); return new THREE.LatheGeometry(pr, 12) })();
const _CEN_P = new THREE.Vector3(0, .5, -.05);
function mechonG(b, d, L, r, ap = .42) { const B = new THREE.Vector3(...b), Y = new THREE.Vector3(...d).normalize(), Z = B.clone().sub(_CEN_P).normalize(); Z.addScaledVector(Y, -Z.dot(Y)).normalize(); const X = new THREE.Vector3().crossVectors(Y, Z);
  const g = GEO_MECHON.clone(); g.applyMatrix4(new THREE.Matrix4().makeBasis(X.multiplyScalar(r), Y.multiplyScalar(L), Z.multiplyScalar(r * ap)).setPosition(B)); return _colorPelo(g, null, -.3, 1) }
// cfg: frente/lado/nuca = borde del pelo (coords de la cabeza: .05 mentón … .71 coronilla) · fleqBaja: [x, ancho, cuánto] · largo: estira costados y nuca
// surcos: { n, prof, modo: "a" (alrededor) | "x" (peinado atrás), seed } · raya: x de la raya (surco hondo de adelante a atrás) · vol, asim (ruido de volumen)
// bultos: [[azimut, alto, ancho, cuánto]] · mechones: [[base, dir, largo, grosor]] · trenzas: { r, n } · rodete: [x, y, z, r] · cola: [base, dir, r, largo]
function cascoPeloV(cfg) { const G = new THREE.SphereGeometry(1, 80, 56), P = G.attributes.position, C = new THREE.Vector3(0, .41, -.02), E = [.43, .42 + (cfg.alto || 0), .42], v = new THREE.Vector3(), ao = new Float32Array(P.count);
  const S = cfg.surcos || { n: 0 }, r = rng(S.seed || 7), L = cfg.largo || 1, fl = cfg.fleqBaja;
  const surcos = Array.from({ length: S.n || 0 }, (_, i) => [(i + .5 + (r() - .5) * .6) / S.n, .25 + r() * .5, .6 + r() * .8]);   // [posición 0..1, ancho relativo, hondura relativa]
  const ph = [r() * 6, r() * 6, r() * 6, r() * 6];
  for (let i = 0; i < P.count; i++) { v.set(P.getX(i), P.getY(i), P.getZ(i)); const a = Math.atan2(v.x, v.z), t = Math.abs(a) / Math.PI;
    const q = [v.x, v.y, v.z].map((u, j) => Math.sign(u) * Math.pow(Math.abs(u), .36) * E[j]); let x = q[0], y = q[1], z = q[2];
    if (L > 1 && y < 0 && t > .22) y *= lerp(1, L, _sst(.22, .45, t));
    const Y = C.y + y;
    let yB = t < .5 ? lerp(cfg.frente, cfg.lado, _sst(.12, .5, t)) : lerp(cfg.lado, cfg.nuca, _sst(.5, .88, t));
    if (fl && t < .3) yB -= fl[2] * Math.exp(-(((x - fl[0]) / fl[1]) ** 2)) * (1 - _sst(.15, .3, t));
    yB += .025 * Math.sin(a * 7 + ph[0]) + .015 * Math.sin(a * 13 + ph[1]);   // borde despar
    const vis = _sst(yB - .03, yB + .03, Y), arriba = _sst(.45, .75, Y);
    let f = 1 + (cfg.vol || 0) * arriba + (cfg.asim ?? .03) * (Math.sin(a * 2 + ph[2]) * .7 + Math.sin(a * 5 + ph[3]) * .3) * arriba, dip = 0;
    if (surcos.length) { const u = S.modo === "x" ? (x / E[0] + 1) / 2 : (a / Math.PI + 1) / 2; for (const [p, w, h] of surcos) { const d = Math.abs(u - p), dd = Math.min(d, 1 - d) * S.n; dip += h * Math.exp(-((dd / (w * .35)) ** 2)) } dip = Math.min(1, dip) * _sst(.45, .7, Y) }
    if (cfg.raya != null) { const dr = (x - cfg.raya) / .03; const rr = Math.exp(-dr * dr) * _sst(.6, .8, Y) * (z > -.1 ? 1 : _sst(-.4, -.1, z)); dip = Math.max(dip, rr) }
    f -= (S.prof || .04) * dip; (cfg.bultos || []).forEach(([ba, by, bw, bk]) => { const da = Math.atan2(Math.sin(a - ba), Math.cos(a - ba)); f += bk * Math.exp(-((da / bw) ** 2) - (((Y - by) / (bw * .5)) ** 2)) });
    ao[i] = dip * vis; f = lerp(.76, f, vis); P.setXYZ(i, C.x + x * f, C.y + y * f, C.z + z * f) }
  G.computeVertexNormals(); return _colorPelo(G, ao) }
const ESTILOS_PELO = {
  despeinado: { frente: .68, lado: .4, nuca: .26, vol: .05, asim: .05, surcos: { n: 9, prof: .05, modo: "a", seed: 3 }, bultos: [[.5, .86, .5, .07], [-.7, .82, .4, .04], [2.6, .8, .6, .05]],
    mechones: [[[-.26, .8, .3], [.3, -.6, .5], .24, .12], [[-.08, .82, .31], [.45, -.6, .45], .27, .13], [[.12, .8, .3], [.55, -.5, .4], .22, .11], [[.27, .78, .28], [.6, -.35, .3], .2, .1],
      [[.1, .9, -.05], [.7, .3, .6], .22, .12], [[-.2, .89, .02], [-.6, .25, .7], .2, .11], [[.43, .62, -.1], [.3, -.8, -.2], .2, .09], [[-.15, .7, -.44], [-.3, -.8, -.4], .2, .1]] },
  trenzas: { frente: .62, lado: .42, nuca: .3, raya: 0, surcos: { n: 10, prof: .035, modo: "x", seed: 11 },
    mechones: [[[-.2, .82, .3], [-.25, -.7, .55], .2, .12], [[-.05, .84, .31], [-.1, -.7, .55], .19, .11], [[.07, .84, .31], [.12, -.7, .55], .19, .11], [[.21, .82, .3], [.28, -.7, .5], .2, .12]],
    trenzas: { r: .085, n: 7, base: [.42, .5, -.1] } },
  coletas: { frente: .62, lado: .42, nuca: .3, raya: 0, surcos: { n: 8, prof: .035, modo: "x", seed: 5 }, cola2: 1 },
  atras: { frente: .75, lado: .42, nuca: .28, vol: .04, asim: .02, surcos: { n: 11, prof: .055, modo: "x", seed: 21 }, bultos: [[0, .84, .5, .04], [.9, .7, .4, .03]],
    mechones: [[[.4, .5, .16], [0, -1, .05], .14, .06], [[-.4, .5, .16], [0, -1, .05], .14, .06], [[.1, .9, -.38], [.1, -.4, -1], .18, .1]] },
  melena: { frente: .64, lado: -.18, nuca: -.2, largo: 1.75, fleqBaja: [-.16, .2, .08], raya: .12, surcos: { n: 8, prof: .045, modo: "a", seed: 13 }, bultos: [[1.3, .2, .6, .05], [-1.3, .15, .6, .07]],
    mechones: [[[-.26, .78, .29], [-.5, -.6, .4], .26, .12], [[-.08, .8, .31], [-.3, -.7, .5], .24, .11], [[.43, .1, .05], [.15, -1, .1], .22, .1], [[-.44, .05, -.05], [-.2, -1, 0], .24, .1]] },
  rodete: { frente: .66, lado: .42, nuca: .32, raya: -.08, surcos: { n: 10, prof: .04, modo: "x", seed: 17 }, rodete: [0, .9, -.24, .17],
    mechones: [[[.2, .8, .29], [.5, -.6, .4], .2, .1], [[.33, .74, .25], [.4, -.8, .2], .2, .08], [[-.42, .58, .05], [-.1, -1, .1], .16, .07]] },
  coleta: { frente: .66, lado: .42, nuca: .32, raya: .1, surcos: { n: 9, prof: .04, modo: "x", seed: 19 }, cola: [[0, .76, -.42], [0, -.85, -.5], .12, .42],
    mechones: [[[-.18, .8, .3], [-.4, -.6, .45], .22, .11], [[0, .82, .31], [-.2, -.7, .5], .2, .1]] },
  jopo: { frente: .72, lado: .44, nuca: .3, surcos: { n: 8, prof: .045, modo: "x", seed: 23 }, bultos: [[0, .82, .55, .14]],
    mechones: [[[-.12, .86, .26], [.1, .4, .9], .22, .13], [[.1, .87, .24], [.2, .45, .85], .2, .12], [[.3, .62, .1], [0, -1, .1], .14, .07], [[-.3, .62, .1], [0, -1, .1], .14, .07]] },
  corto: { frente: .7, lado: .44, nuca: .32, asim: .03, surcos: { n: 10, prof: .035, modo: "a", seed: 29 }, bultos: [[.4, .84, .5, .04]],
    mechones: [[[-.22, .82, .29], [.7, -.4, .4], .2, .1], [[-.05, .84, .3], [.75, -.35, .35], .2, .1], [[.13, .82, .29], [.8, -.3, .3], .18, .09]] },
  rulos: { frente: .68, lado: .4, nuca: .3, vol: .06, surcos: { n: 14, prof: .07, modo: "a", seed: 31 }, rulos: 1 } };
// peloC(estilo, col, { lazo }): devuelve un Group (casco + mechones + trenzas/rodete/cola) para k.peloG. lazo = color del moño (trenzas/coletas)
function peloC(estilo, col, op = {}) { if (estilo === "calvo") return null; const cfg = ESTILOS_PELO[estilo] || ESTILOS_PELO.corto, G = new THREE.Group(), m = matPelo(col), mS = matPelo(col, 1);
  const add = (geo, mat = m) => { const me = new THREE.Mesh(geo, mat); me.castShadow = me.receiveShadow = true; me.userData.pelo = 1; G.add(me); return me };
  add(cascoPeloV(cfg)); const extra = [];
  (cfg.mechones || []).forEach(([b, d, L, r]) => extra.push(mechonG(b, d, L, r)));
  if (cfg.rulos) { const rr = rng(5); for (let i = 0; i < 26; i++) { const u = i / 26, a = i * 2.4, R = .12 + Math.sqrt(u) * .3; extra.push(mechonG([Math.cos(a) * R, .92 - u * .3, Math.sin(a) * R - .04], [Math.cos(a) * .3, .4 + rr() * .4, Math.sin(a) * .3], .12 + rr() * .05, .09)) } }
  if (cfg.rodete) { const [x, y, z, R] = cfg.rodete; for (let i = 0; i < 3; i++) { const tg = new THREE.TorusGeometry(R * (1 - i * .3), R * .42 * (1 - i * .15), 12, 28); tg.rotateX(-Math.PI / 2 + .5); tg.translate(x, y + i * R * .45, z + i * .02); extra.push(_colorPelo(tg, null, .6, 1.2)) } const s = new THREE.SphereGeometry(R * .4, 14, 10); s.translate(x, y + R * 1.2, z + .04); extra.push(_colorPelo(s)) }
  if (cfg.cola) { const [b, d, r, Lc] = cfg.cola; for (let i = 0; i < 3; i++) extra.push(mechonG([b[0] + (i - 1) * .05, b[1], b[2]], [d[0] + (i - 1) * .2, d[1], d[2]], Lc * (1 - i * .1 + (i === 1 ? .1 : 0)), r * .9, .8)) }
  if (cfg.cola2) for (const s of [-1, 1]) for (let i = 0; i < 3; i++) extra.push(mechonG([s * .44, .56, -.1], [s * (.8 - i * .15), -.7 - i * .1, -.15 + i * .1], .36 + i * .03, .12, .8));
  if (cfg.trenzas) { const { r: R, n, base } = cfg.trenzas; for (const s of [-1, 1]) { let p = new THREE.Vector3(s * base[0], base[1], base[2]); const dir = new THREE.Vector3(s * .22, -1, .18).normalize(), seg = R * 1.45;
      for (let i = 0; i < n; i++) { const g = new THREE.SphereGeometry(1, 14, 10), lado = i % 2 ? 1 : -1, rr = R * (1 - i * .035); g.scale(rr * 1.05, seg * .78, rr * .8); g.rotateZ(lado * .55); g.translate(lado * rr * .3, 0, 0);
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().negate()); g.applyQuaternion(q); g.translate(p.x, p.y, p.z); extra.push(_colorPelo(g, null, -.6, .8)); p = p.clone().addScaledVector(dir, seg * .62) }
      if (op.lazo) { const k = new THREE.Group(); k.position.copy(p).addScaledVector(dir, -.02); G.add(k); monoCinta(k, op.lazo, 0, 0, .02, .75) }
      const pun = mechonG([p.x, p.y + .03, p.z], [dir.x * .4, -1, dir.z], .12, .07, .9); extra.push(pun) } }
  if (extra.length) add(mergeG(extra.map(g => [g, new THREE.Matrix4()])).setAttribute("color", new THREE.BufferAttribute(new Float32Array(extra.reduce((a, g) => (a.push(...(g.index ? g.toNonIndexed() : g).attributes.color.array), a), [])), 3)), mS);
  G.userData.pelo = 1; return G }
// barbaC(k, col): perilla lisa de UNA pieza debajo de la boca, con un patrón tejido IMPRESO (filas de V) como las barbas de Volze
const T_TEJIDO = tex(128, 128, (g, w, h) => { g.fillStyle = "#ffffff"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(0,0,0,.22)"; g.lineWidth = 3; for (let y = 4; y < h; y += 12) for (let x = 0; x < w; x += 12) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 6, y + 7); g.lineTo(x + 12, y); g.stroke() } }, [2, 2]);
function barbaC(k, col) { const m = new THREE.MeshStandardMaterial({ color: col, map: T_TEJIDO, roughness: .6 });
  const g = new THREE.CapsuleGeometry(.1, .2, 6, 16); g.rotateZ(Math.PI / 2); g.scale(1, 1.05, .55); const b = part(g, m, 0, .13, .355, k.head, 0); b.userData.pelo = 1;
  for (const s of [-1, 1]) { const p = part(new THREE.CapsuleGeometry(.04, .1, 4, 10), m, s * .17, .19, .35, k.head, 0); p.rotation.z = s * .5; p.scale.z = .55; p.userData.pelo = 1 } }
// sombreros y moños: piezas lisas de plástico
const M_PELO = {}; const peloMat = col => M_PELO[col] ||= new THREE.MeshStandardMaterial({ color: col, roughness: .45 });
const pzP = (h, geo, col, x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const m = part(geo, peloMat(col), x, y, z, h, 0); m.rotation.set(rx, ry, rz); m.scale.set(sx, sy, sz); m.userData.pelo = 1; return m };
const esfP = r => new THREE.SphereGeometry(r, 18, 12);
function gorraLisa(h, col) { pzP(h, new THREE.SphereGeometry(.45, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), col, 0, .6, -.01, 0, 0, 0, 1, .7, 1); pzP(h, RB(.6, .04, .34, .02, 2), col, 0, .63, .44, .12) }
const gorraTela = gorraLisa, gorraChata = gorraLisa;
function panueloC(h, col) { pzP(h, new THREE.SphereGeometry(.42, 24, 14, 0, Math.PI * 2, 0, Math.PI * .58), col, 0, .5, -.03, 0, 0, 0, 1, .95, .96); pzP(h, esfP(.1), col, 0, .34, -.42) }
function monoCinta(h, col, x = .22, y = .88, z = -.06, tam = 1) { for (const q of [-1, 1]) pzP(h, new THREE.ConeGeometry(.11 * tam, .22 * tam, 14), col, x + q * .12 * tam, y, z, 0, 0, q * Math.PI / 2); pzP(h, esfP(.06 * tam), col, x, y, z) }
function velo(k, col = "#f4f4f4") { const geo = new THREE.BoxGeometry(.68, .9, .02); geo.translate(0, -.45, -.05); const v = part(geo, new THREE.MeshStandardMaterial({ color: col, roughness: .5, transparent: true, opacity: .9 }), 0, .86, -.34, k.head, 0); v.rotation.x = .22; v.castShadow = false; v.userData.pelo = 1 }
// ================= VESTIR: reconstruye al personaje con seis bloques + ropa pintada; pelo y sombreros FUNDIDOS en pocas mallas (una por color) =================
// o: { skin (pasa por pielPastel salvo sinPastel), torso: {…torsoC}, brazo: {…brazoC}, pierna: {…piernaC}, pelo: [estilo, col] (peloC), gorra: col, panuelo: col,
//      peloExtra: h => {} (más pelo/moños, se funde con el resto), anteojos, barba: col, bigote: col, extra: k => {}, escala, encorvado,
//      forma: { torso: [w, h, d], brazo: [w, largo, d], pierna: [w, largo, d], cabeza: [w, h, d], sepPierna, cuello, cabezaZ, dedos: colorGuante }, cabezaMat }
const MANO_INVIS = new THREE.MeshBasicMaterial({ visible: false });
const FORMA0 = { torso: [1.04, 1.04, .52], brazo: [.5, 1.04, .5], pierna: [.5, 1.02, .5], cabeza: [.74, .66, .7], sepPierna: .26, cuello: 0, cabezaZ: 0, dedos: null };
function vestirC(k, o) { const skin = (typeof pielPastel === "function" && !o.sinPastel) ? pielPastel(o.skin) : o.skin, F = { ...FORMA0, ...(o.forma || {}) }; k.skin = skin; k.r6 = true; delete k.falda; delete k.pasoMax; delete k.zancMax; k.encorvado = o.encorvado || 0; k.flamea = [];
  [k.body, k.armL, k.armR, k.legL, k.legR].forEach(gr => [...gr.children].forEach(c => { if (c.isMesh || c.userData.pelo || c.userData.bota || c.userData.dedo) gr.remove(c) })); [...k.head.children].forEach(c => { if (c !== k.decal) k.head.remove(c) });
  const [tw, th, td] = F.torso, [bw, bl, bd] = F.brazo, [pw, pl, pd] = F.pierna, [cw, ch, cd] = F.cabeza, yS = pl + th - .08, yH = pl + th + F.cuello;
  k.hcad = pl; k._p0 = { armY: yS, armX: tw / 2 + bw / 2, armL: bl };
  const plast = map => new THREE.MeshStandardMaterial({ map, roughness: .5 }), t = o.torso;
  part(RB(tw, th, td, .05), boxMats(plast(torsoLadoC(t)), plast(torsoC(t)), plast(torsoC(t, true))), 0, pl + th / 2, 0, k.body, 0);
  [k.armL, k.armR].forEach((a, i) => { part(RB(bw, bl, bd, .05), plast(brazoC({ skin, ...o.brazo, seed: (o.brazo.seed || 3) + i })), 0, .08 - bl / 2, 0, a, 0); a.position.set((i ? 1 : -1) * k._p0.armX, yS, 0);
    const hd = i ? k.handR : k.handL; a.add(hd); hd.position.set(0, .18 - bl, 0); hd.rotation.set(0, 0, 0); hd.material = MANO_INVIS; hd.castShadow = hd.receiveShadow = false });   // la mano: ancla invisible para la utilería
  [k.legL, k.legR].forEach((l, i) => { const po = { skin, ...o.pierna, seed: (o.pierna.seed || 5) + i }, lado = plast(piernaC(po)); part(RB(pw, pl, pd, .05), boxMats(lado, plast(piernaC({ ...po, frente: 1 })), lado), 0, .01 - pl / 2, 0, l, 0); l.position.set((i ? 1 : -1) * F.sepPierna, pl, 0) });
  const mCab = o.cabezaMat || new THREE.MeshStandardMaterial({ color: skin, roughness: .6, emissive: skin, emissiveIntensity: .28 });
  k.head.position.set(0, yH, F.cabezaZ); part(RB(cw, ch, cd, .075, 4), mCab, 0, .05 + ch / 2, 0, k.head, 0);
  if (F.cuello) part(new THREE.CylinderGeometry(.1, .13, F.cuello + .12, 8), mCab, 0, yH - F.cuello / 2 + .02, F.cabezaZ * .6, k.body, 0);
  k.decal.geometry = new THREE.PlaneGeometry(cw, ch * .84); k.decal.position.set(0, .07 + ch / 2, cd / 2 + .0015); k.decal.material.transparent = true; k.decal.material.needsUpdate = true;
  // dedos largos (Sallow): cuatro bloques finos y un pulgar en la punta de cada brazo, con pivote (se curvan: dedosSallow)
  k.dedos = []; if (F.dedos) { const md = accMat(F.dedos, { roughness: .55 }); [k.armL, k.armR].forEach(a => { [[-.105, 0, .3], [-.035, 0, .35], [.035, 0, .35], [.105, 0, .31], [0, .12, .2]].forEach(([x, z, L]) => {
      const pv = new THREE.Group(); pv.position.set(x * bw / .32, .1 - bl, z * bd / .34); pv.userData.dedo = 1; a.add(pv); const geo = new THREE.BoxGeometry(.055, L, .06); geo.translate(0, -L / 2, 0); part(geo, md, 0, 0, 0, pv, 0); k.dedos.push(pv) }) }) }
  const tmp = new THREE.Group(); if (o.gorra) gorraLisa(tmp, o.gorra); if (o.panuelo) panueloC(tmp, o.panuelo); if (o.peloExtra) o.peloExtra(tmp);
  tmp.updateMatrixWorld(true); const porCol = new Map(); tmp.traverse(m => { if (!m.isMesh) return; const key = m.material.color.getHexString() + (m.material.roughness) + (m.material.side || 0); if (!porCol.has(key)) porCol.set(key, [m.material, []]); porCol.get(key)[1].push([m.geometry, m.matrixWorld.clone()]) });
  k.peloG = new THREE.Group(); k.head.add(k.peloG); porCol.forEach(([mat, list]) => { const me = part(mergeG(list), mat, 0, 0, 0, k.peloG, 0); me.userData.pelo = 1 });
  if (o.pelo) { const hm = peloC(...o.pelo); if (hm) k.peloG.add(hm) }
  if (o.anteojos) anteojosV(k); if (o.barba) barbaC(k, o.barba); if (o.bigote) { const m = accMat(o.bigote); for (const s of [-1, 1]) { bloque(k.head, m, .19, .06, .05, s * .1, .345, .37, 0, 0, s * -.15) } } if (o.extra) o.extra(k);
  k.body.scale.setScalar(o.escala || 1); k.arrugas = 0; k._arena = null; setFace(k, "neutral"); return k }

// ================= EL ELENCO =================
const NUEVOS_V = Array.from({ length: 6 }, () => { const k = kid({ skin: "#f2dec8", shirt: "#7a6a5a", cloth: "plain", pants: "#3a3a3a", shoes: "#2a2420", hair: "#2b211b", style: "corto" }); TURT.add(k.g); ALL.push(k); return k });
const NELL = ME6, SALLOW = GARROW, TRABAJADORES = [QUILL, PIM, FOLK[0], FOLK[1], FOLK[2]];
const VECINOS = [FOLK[3], FOLK[4], FOLK[5], EXT[0], EXT[1], EXT[2], EXT[3], PESCADOR, ...NUEVOS_V];
const MADRES = [VECINOS[0], VECINOS[1]], NOVIO = VECINOS[2], NOVIA = VECINOS[3], MAESTRA = VECINOS[4], CHICOS = [VECINOS[5], VECINOS[6], VECINOS[7]], VENDEDORES = [VECINOS[8], VECINOS[9]];
const OLLIE = NELL, KELL = SALLOW, HOMBRES_KELL = TRABAJADORES;   // alias del video anterior
const ORO = "#d9a84a";
// Ropa y pelo como los de Volze (VOLZE_ROPA.md): remeras lisas saturadas con pliegues pintados y detalles impresos, suéteres tejidos, camisas a
// cuadros, sacos con corbata, overoles; jeans con textura de denim; pelo esculpido. Personajes propios (ninguno es un recurrente de Volze).
const COL_EL = { rojo: "#d8483a", azul: "#3d8fd6", celeste: "#5aa7e0", amarillo: "#e0c040", verde: "#6aa04a", rosa: "#e88ab0", naranja: "#e8843a", violeta: "#8a5ab8",
  marino: "#1e2f5a", crema: "#efe4cf", blanco: "#f4f4f2", jean: "#2c2f36", jeanClaro: "#8fb4da", caqui: "#b8a07a", negro: "#26262a" };
const PIEL = { clara: "#eab890", durazno: "#dfa478", trigueña: "#c98d62", morena: "#a06a46", oscura: "#7e5034" };
const JEAN = (col = COL_EL.jean, o = {}) => ({ col, denim: 1, zapato: "#2a2420", ...o });
// ---------- EL APRENDIZ (14): remera roja de manga corta, delantal de cuero manchado de cera, quemaduras en los brazos, jean oscuro, pelo castaño despeinado
vestirC(ME, { skin: PIEL.durazno, torso: { col: COL_EL.rojo, cuelloR: "#b83a2e", delantal: ["#7a5034", "#4a2e18", "cuero"], cera: 3, seed: 11 },
  brazo: { col: COL_EL.rojo, manga: .34, quemaduras: 3 }, pierna: JEAN(COL_EL.jean, { delantalP: "#7a5034", zapato: "#3a2a20" }), pelo: ["despeinado", PELO_COL.choco], escala: .9 });
// ---------- NELL (8): vestido rosa con cuello blanco y florecitas impresas, medias blancas, zapatitos bordó, dos coletas pelirrojas con un moño rosa
vestirC(NELL, { skin: PIEL.clara, torso: { col: COL_EL.rosa, kind: "florecitas", alt: "#fbe6ee", alt2: COL_EL.amarillo, cuello: COL_EL.blanco }, brazo: { col: COL_EL.rosa, manga: .3 },
  pierna: { col: COL_EL.rosa, falda: .5, kind: "florecitas", alt: "#fbe6ee", alt2: COL_EL.amarillo, largo: .6, media: COL_EL.blanco, zapato: "#7a2030" }, pelo: ["trenzas", PELO_COL.rojo, { lazo: "#e86a9a" }], escala: .72 });
// ---------- MISTER SALLOW (no se usa: otro agente hace el Sallow nuevo; queda armado para que nada se rompa)
const SALLOW_PIEL = "#ece6d2";
const M_PIEL_CERA = new THREE.MeshStandardMaterial({ color: SALLOW_PIEL, roughness: .32, emissive: SALLOW_PIEL, emissiveIntensity: .12 });
vestirC(SALLOW, { skin: SALLOW_PIEL, sinPastel: 1, cabezaMat: M_PIEL_CERA,
  forma: { torso: [.84, 1.18, .44], brazo: [.32, 1.46, .34], pierna: [.36, 1.3, .4], cabeza: [.58, .82, .6], sepPierna: .2, cuello: .14, cabezaZ: .07, dedos: "#26262a" },
  torso: { col: "#111114", levita: ["#111114", "#1c1c22", "#d8d8d8", "#0a0a0c"], delantal: ["#6e6e72", "#4a4a50"], cera: 4, seed: 66 }, brazo: { col: "#111114", manga: .9, puno: "#d8d8d8", guante: "#26262a", guanteDesde: .86 },
  pierna: { col: "#1c1c22", falda: .64, faldaCol: "#111114", zapato: "#0c0c0e", cana: .2, delantalP: "#6e6e72", cera: 2 }, encorvado: .14 });
SALLOW.caraFija = "sallow"; SALLOW.brazoA = .07; SALLOW.pasoMax = .26; SALLOW.quietoTotal = true; SALLOW.cabezaBaja = .12; setFace(SALLOW, "sallow");
// ---------- LOS OLVIDADOS: suéter y pantalón grises con delantal gris impreso, SIN CARA
const GRIS = (k, o) => vestirC(k, { ...o, torso: { col: "#8c8c90", cuelloR: "#7a7a7e", delantal: ["#a6a6aa", "#77777c"], ...o.torso }, brazo: { col: "#8c8c90", manga: .86, puno: "#7a7a7e", ...o.brazo }, pierna: { col: "#606066", denim: 1, zapato: "#3a3a3e", ...o.pierna } });
{ const T = TRABAJADORES; GRIS(T[0], { skin: PIEL.clara, torso: {}, brazo: {}, pierna: {}, pelo: ["corto", PELO_COL.negro] }); GRIS(T[1], { skin: PIEL.trigueña, torso: {}, brazo: {}, pierna: { falda: .84, faldaCol: "#77777c", denim: 0 }, pelo: ["rodete", PELO_COL.gris] });
  GRIS(T[2], { skin: PIEL.morena, torso: {}, brazo: {}, pierna: {}, pelo: ["atras", PELO_COL.gris], escala: 1.04 }); GRIS(T[3], { skin: PIEL.durazno, torso: {}, brazo: {}, pierna: { falda: .8, faldaCol: "#77777c", denim: 0 }, pelo: ["melena", PELO_COL.negro] });
  GRIS(T[4], { skin: PIEL.clara, torso: {}, brazo: {}, pierna: { largo: .58, media: "#a6a6aa" }, pelo: ["rulos", PELO_COL.gris], escala: .8 }); T.forEach(k => { k.sinCara = true; setFace(k, "neutral") }) }
// ---------- LOS VECINOS
const VV = VECINOS;
vestirC(VV[0], { skin: PIEL.clara, torso: { col: COL_EL.crema, cuelloR: "#e0d2b8" }, brazo: { col: COL_EL.crema, manga: .9, puno: "#e0d2b8" }, pierna: JEAN(COL_EL.jeanClaro), pelo: ["melena", PELO_COL.negro] });   // madre 1: suéter crema
vestirC(VV[1], { skin: PIEL.trigueña, torso: { col: COL_EL.amarillo, cuelloR: COL_EL.celeste, corazon: COL_EL.rojo }, brazo: { col: COL_EL.amarillo, manga: .4, puno: COL_EL.celeste }, pierna: { col: COL_EL.marino, falda: .86, zapato: "#2a2420" }, pelo: ["coleta", PELO_COL.castano] });   // madre 2
vestirC(VV[2], { skin: PIEL.durazno, torso: { col: COL_EL.marino, traje: [COL_EL.blanco, COL_EL.rojo, COL_EL.blanco] }, brazo: { col: COL_EL.marino, manga: .88, puno: COL_EL.blanco }, pierna: { col: COL_EL.marino, zapato: "#141418" }, pelo: ["jopo", PELO_COL.negro] });   // novio: saco marino, corbata roja
vestirC(VV[3], { skin: PIEL.clara, torso: { col: COL_EL.blanco, encaje: "#ffffff", faja: ["#e8d8c8"] }, brazo: { col: COL_EL.blanco, manga: .82 }, pierna: { col: COL_EL.blanco, falda: .92, zapato: COL_EL.blanco }, pelo: ["rodete", PELO_COL.castano], extra: k => velo(k) });   // novia
vestirC(VV[4], { skin: PIEL.trigueña, torso: { col: COL_EL.celeste, botones: COL_EL.blanco, cuello: COL_EL.blanco }, brazo: { col: COL_EL.celeste, manga: .88, puno: COL_EL.blanco }, pierna: { col: COL_EL.marino, falda: .88, zapato: "#141418" }, pelo: ["melena", PELO_COL.castano], anteojos: 1 });   // maestra
vestirC(VV[5], { skin: PIEL.clara, torso: { col: COL_EL.verde, kind: "franjas", alt: COL_EL.blanco, cuelloR: COL_EL.blanco }, brazo: { col: COL_EL.verde, manga: .36 }, pierna: JEAN(COL_EL.jean, { largo: .55, media: COL_EL.blanco }), pelo: ["corto", PELO_COL.castano], escala: .72 });   // chico
vestirC(VV[6], { skin: PIEL.morena, torso: { col: COL_EL.amarillo, overol: COL_EL.jeanClaro }, brazo: { col: COL_EL.amarillo, manga: .34 }, pierna: JEAN(COL_EL.jeanClaro, { zapato: "#d84a3a" }), pelo: ["rulos", PELO_COL.negro], peloExtra: h => monoCinta(h, COL_EL.rojo, .2, .98, -.04), escala: .7 });   // chica
vestirC(VV[7], { skin: PIEL.durazno, torso: { col: COL_EL.naranja, cuelloR: COL_EL.blanco, escudo: [COL_EL.blanco, COL_EL.naranja] }, brazo: { col: COL_EL.naranja, manga: .36 }, pierna: JEAN(COL_EL.jean, { largo: .58, media: COL_EL.blanco }), gorra: COL_EL.azul, pelo: ["corto", PELO_COL.rubio], escala: .76 });   // chico 2
vestirC(VV[8], { skin: PIEL.oscura, torso: { col: "#8a5a3a", kind: "cuadros", alt: "#e0d0b0", delantal: [COL_EL.verde, "#4a7a3a"] }, brazo: { col: "#8a5a3a", kind: "cuadros", alt: "#e0d0b0", manga: .88 }, pierna: { col: COL_EL.caqui, zapato: "#2a2420", delantalP: COL_EL.verde }, pelo: ["corto", PELO_COL.negro], bigote: PELO_COL.negro, escala: 1.04 });   // vendedor: franela a cuadros
vestirC(VV[9], { skin: PIEL.durazno, torso: { col: COL_EL.violeta, cuelloR: "#6a4098", delantal: [COL_EL.blanco, "#dcdcdc"] }, brazo: { col: COL_EL.violeta, manga: .6 }, pierna: { col: COL_EL.marino, falda: .86, zapato: "#2a2420", delantalP: COL_EL.blanco }, pelo: ["rodete", PELO_COL.negro] });   // vendedora (canasta: canasta(k))
vestirC(VV[10], { skin: PIEL.durazno, torso: { col: COL_EL.marino, cuelloR: "#14203f" }, brazo: { col: COL_EL.marino, manga: .9, puno: "#14203f" }, pierna: { col: COL_EL.caqui, zapato: "#2a2420" }, pelo: ["atras", PELO_COL.gris], barba: PELO_COL.gris, encorvado: .2 });   // viejo: suéter marino
vestirC(VV[11], { skin: PIEL.clara, torso: { col: COL_EL.violeta, tejido: ["#e88ab0", "#f2e6f6"] }, brazo: { col: COL_EL.violeta, manga: .9, puno: "#e88ab0" }, pierna: { col: "#6a6a72", falda: .9, zapato: "#2a2420" }, pelo: ["rodete", PELO_COL.blanco], anteojos: 1, encorvado: .16 });   // vieja: suéter tejido
vestirC(VV[12], { skin: PIEL.trigueña, torso: { col: COL_EL.blanco, tirantes: "#6a4428", cuello: "#e6e6e6" }, brazo: { col: COL_EL.blanco, manga: .88 }, pierna: JEAN(COL_EL.jean), pelo: ["jopo", PELO_COL.castano] });   // muchacho: camisa blanca con tiradores
vestirC(VV[13], { skin: PIEL.clara, torso: { col: COL_EL.rosa, cuelloR: COL_EL.blanco, corazon: COL_EL.blanco }, brazo: { col: COL_EL.rosa, manga: .36 }, pierna: JEAN(COL_EL.jeanClaro), pelo: ["melena", PELO_COL.rubio] });   // muchacha
const ELENCO_V = [ME, NELL, SALLOW, ...TRABAJADORES, ...VECINOS];
const ELENCO_N = { ME, NELL, SALLOW, ...Object.fromEntries(TRABAJADORES.map((k, i) => ["T" + i, k])), ...Object.fromEntries(VECINOS.map((k, i) => ["V" + i, k])) };
ALL.forEach((k, i) => { k.idx = i; setFace(k, "neutral") });
function vientoPelo() { }   // (legado del video del viento: acá no sopla; queda para que lo viejo siga armando)

// ---------- helpers de pose (cuerpo entero con cuaterniones; brazos que apuntan a un punto del mundo)
function qMundo(k, arriba, frente, out = new THREE.Quaternion()) { _ay.set(...arriba).normalize(); _az.set(...frente); _az.addScaledVector(_ay, -_az.dot(_ay)); if (_az.lengthSq() < 1e-6) _az.set(1, 0, 0).addScaledVector(_ay, -_ay.x);
  _az.normalize(); _ax.crossVectors(_ay, _az); _mb.makeBasis(_ax, _ay, _az); out.setFromRotationMatrix(_mb); k.g.updateWorldMatrix(true, false); k.g.getWorldQuaternion(_q2); return out.premultiply(_q2.invert()) }
function cuerpoQ(k, q, pivL, pivG) { const b = k.body, s = b.scale.y; b.quaternion.copy(q); _v3.set(...pivL).multiplyScalar(s).applyQuaternion(q); b.position.set(pivG[0] - _v3.x, pivG[1] - _v3.y, pivG[2] - _v3.z) }
// apuntar(k, miembro, p): el brazo/pierna apunta con su punta al punto p del MUNDO (Vector3). Los brazos no doblan: la mano queda a un largo de brazo del hombro.
function apuntar(k, m, p) { k.g.updateMatrixWorld(true); _v1.copy(p); m.parent.worldToLocal(_v1); _v1.sub(m.position); if (_v1.lengthSq() < 1e-8) return; m.quaternion.setFromUnitVectors(_ABAJO, _v1.normalize()) }
const gW = (k, x, y, z, out = new THREE.Vector3()) => { k.g.updateMatrixWorld(true); return k.g.localToWorld(out.set(x, y, z)) };
const _MIEM = k => [k.armL, k.armR, k.legL, k.legR, k.head];
function fotoPose(k) { return { bq: k.body.quaternion.clone(), bp: k.body.position.clone(), m: _MIEM(k).map(o => o.quaternion.clone()) } }
function mezclaPoses(k, fA, fB, u) { fA(); const A = fotoPose(k); fB(); const B = fotoPose(k); k.body.quaternion.slerpQuaternions(A.bq, B.bq, u); k.body.position.lerpVectors(A.bp, B.bp, u); _MIEM(k).forEach((o, i) => o.quaternion.slerpQuaternions(A.m[i], B.m[i], u)) }

// ================= UTILERÍA (escondida en cada cuadro: se muestra al pedirla) =================
const PROPS_C = [];
const PROP = g => { g.visible = false; g.userData.prop = 1; PROPS_C.push(g); return g };
// enMano(obj, k, mano, { off, derecho }): en la mano; derecho = queda vertical en el mundo aunque el brazo esté inclinado. Llamar DESPUÉS de posar los brazos.
function enMano(obj, k, mano = "R", { off = [0, -.12, 0], derecho = false } = {}) { attach(obj, k, mano, off); if (!derecho) { obj.quaternion.identity(); return obj } const h = mano === "R" ? k.handR : k.handL;
  k.g.updateMatrixWorld(true); h.getWorldQuaternion(_q1); obj.parent === h && obj.quaternion.copy(_q1.invert()); return obj }
function enMundo(obj, pos, ry = 0, rx = 0, rz = 0) { if (obj.parent !== scene) scene.add(obj); obj.visible = true; obj.position.set(...pos); obj.rotation.set(rx, ry, rz); obj.scale.setScalar(obj.userData.esc || 1); return obj }
const EC_HIERRO = new THREE.MeshStandardMaterial({ color: "#4a4c52", roughness: .45, metalness: .55, flatShading: true }), EC_HIERRO_O = new THREE.MeshStandardMaterial({ color: "#2c2d31", roughness: .5, metalness: .5, flatShading: true });
const M_MADERA_U = new THREE.MeshStandardMaterial({ color: "#8a6238", roughness: .75, flatShading: true }), EC_ACERO = new THREE.MeshStandardMaterial({ color: "#b8bcc2", roughness: .3, metalness: .75, flatShading: true });
const M_CERA_ORO = new THREE.MeshStandardMaterial({ color: "#e8b234", roughness: .22, emissive: "#c07a10", emissiveIntensity: .6 }), M_CERA_SUCIA = new THREE.MeshStandardMaterial({ color: "#d8c890", roughness: .35 });
// herramienta entre las manos: el origen va a la mano `arriba` y el −y apunta a la mano `abajo` (mundo)
function entreManos(obj, k, arriba = "L", abajo = "R") { k.g.updateMatrixWorld(true); const a = (arriba === "L" ? k.handL : k.handR).getWorldPosition(new THREE.Vector3()), b = (abajo === "L" ? k.handL : k.handR).getWorldPosition(new THREE.Vector3());
  if (obj.parent !== scene) scene.add(obj); obj.visible = true; obj.position.copy(a); obj.quaternion.setFromUnitVectors(_ABAJO, b.sub(a).normalize()); obj.scale.setScalar(k.body.scale.y); return obj }
const glowEl = (col, sz, op = 1) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false })); s.scale.setScalar(sz); return s };

// ---------- LA OLLA DE CERA (el aprendiz): hierro fundido, panza redonda, tres patas, dos orejas a los costados, asa de alambre, cera dorada que brilla,
// chorreados por el borde y VAPOR que sube. Origen = centro de la boca (el borde). Diámetro .62, alto .5. Se ve también como caldero (escala 1,7).
const M_VAPOR_OLLA = () => new THREE.SpriteMaterial({ map: GLOW, color: "#f4eee4", transparent: true, opacity: .2, depthWrite: false });
function nuevaOlla() { const G = new THREE.Group();
  const cu = new THREE.LatheGeometry([[.001, -.42], [.2, -.42], [.27, -.36], [.3, -.22], [.3, -.06], [.28, 0], [.31, .01], [.31, .04], [.26, .04], [.26, -.01]].map(([x, y]) => new THREE.Vector2(x, y)), 14);
  part(cu, new THREE.MeshStandardMaterial({ color: "#3a3a3e", roughness: .55, metalness: .5, flatShading: true, side: THREE.DoubleSide }), 0, 0, 0, G, 0);
  part(new THREE.CylinderGeometry(.262, .262, .02, 14), M_CERA_ORO, 0, -.05, 0, G, 0);
  for (const s of [-1, 1]) part(new THREE.TorusGeometry(.06, .018, 4, 8), EC_HIERRO_O, s * .33, -.06, 0, G, 0);
  for (let i = 0; i < 3; i++) { const a = i / 3 * 6.283; part(new THREE.CylinderGeometry(.03, .02, .08, 5), EC_HIERRO_O, Math.cos(a) * .17, -.45, Math.sin(a) * .17, G, 0) }
  const asa = part(new THREE.TorusGeometry(.3, .014, 4, 14, Math.PI), EC_HIERRO_O, 0, .02, 0, G, 0); G.userData.asa = asa;
  for (let i = 0; i < 7; i++) { const a = i / 7 * 6.283 + .3; gema(G, M_CERA_ORO, .035, Math.cos(a) * .305, -.04 - (i % 3) * .05, Math.sin(a) * .305, .8, 2.2, .8).userData.pelo = 0 }
  const brillo = glowEl("#ffb040", .9, .55); brillo.position.y = .02; G.add(brillo);
  G.traverse(o => { if (o.isMesh) o.castShadow = true });
  G.userData.vapor = Array.from({ length: 8 }, () => { const v = new THREE.Sprite(M_VAPOR_OLLA()); G.add(v); return v }); return G }
function vaporOlla(o, t) { o.userData.vapor.forEach((v, i) => { const q = _frac(t * .32 + i / 8); v.position.set(Math.sin(i * 2.3 + t * .8) * .2 * q, .04 + q * 1.1, Math.cos(i * 1.7 + t * .6) * .12 * q); v.scale.setScalar(.25 + q * .7); v.material.opacity = .32 * Math.sin(q * Math.PI) }) }
const OLLA_LIBRE = PROP(nuevaOlla());
// ollaCera(k, visible, lugar, { inclina, escala, t }): "manos" = sostenida con las dos manos por las orejas (centro entre las manos; inclina = vuelca hacia adelante, rad)
//   · "mano"/"L" = colgada del asa en la derecha/izquierda · "piso" = apoyada a los pies, 1 m adelante (con escala 1,7 es el caldero de la trastienda).
// Sin k (null): la olla suelta (ponerla con enMundo; vaporOlla(o, t) para el vapor).
function ollaCera(k, visible = true, lugar = "manos", { inclina = 0, escala = 1, t = null } = {}) { const o = k ? (k.olla ||= PROP(nuevaOlla())) : OLLA_LIBRE; o.visible = visible; if (!visible || !k) return o;
  const s = k.body.scale.y, tt = t ?? k._t ?? 0; k.g.updateMatrixWorld(true); if (o.parent !== scene) scene.add(o); o.scale.setScalar(s * escala); k.g.getWorldQuaternion(_q1);
  if (lugar === "manos") { const a = k.handL.getWorldPosition(_v1), b = k.handR.getWorldPosition(_v2); o.position.copy(a).add(b).multiplyScalar(.5); o.position.y += .05 * s; o.quaternion.copy(_q1).multiply(_q2.setFromAxisAngle(_ax.set(1, 0, 0), inclina)); o.userData.asa.rotation.x = -1.3 }
  else if (lugar === "mano" || lugar === "L") { (lugar === "L" ? k.handL : k.handR).getWorldPosition(o.position); o.position.y -= .3 * s * escala; o.quaternion.copy(_q1); o.userData.asa.rotation.x = 0 }
  else { o.position.copy(gW(k, 0, .49 * s * escala, (.62 + .3 * escala) * s)); o.quaternion.copy(_q1); o.userData.asa.rotation.x = -1.5 }
  vaporOlla(o, tt); o.updateMatrixWorld(true); return o }
// el CHORRO_CERA de cera hirviendo (volcarOlla lo pone): cilindro dorado que cae derecho desde `desde` (mundo), `largo` metros, temblando
const CHORRO_CERA = PROP(new THREE.Group()); { const geo = new THREE.CylinderGeometry(.05, .035, 1, 8, 1, true); geo.translate(0, -.5, 0); const m = part(geo, M_CERA_ORO, 0, 0, 0, CHORRO_CERA, 0); m.castShadow = false; CHORRO_CERA.userData.m = m; scene.add(CHORRO_CERA) }
function chorroCera(desde, largo = 3, t = 0) { CHORRO_CERA.visible = true; CHORRO_CERA.position.copy(desde); CHORRO_CERA.quaternion.identity(); CHORRO_CERA.userData.m.scale.set(1 + .18 * Math.sin(t * 20), largo, 1 + .18 * Math.cos(t * 17)); return CHORRO_CERA }
// la pala de revolver: mango de madera con agarradera y paleta ancha con cera pegada. Origen en la agarradera, la paleta hacia −y (≈ 1,6 de largo)
function nuevaPalaCera() { const G = new THREE.Group(); part(new THREE.CylinderGeometry(.028, .032, 1.25, 6), M_MADERA_U, 0, -.62, 0, G, 0); part(new THREE.BoxGeometry(.16, .05, .05), M_MADERA_U, 0, 0, 0, G, 0);
  part(RB(.2, .4, .04, .015, 1), M_MADERA_U, 0, -1.42, 0, G, 0); part(RB(.205, .2, .045, .015, 1), M_CERA_ORO, 0, -1.52, 0, G, 0); gema(G, M_CERA_SUCIA, .04, .05, -1.25, .02, 1, 1.8, .6); G.traverse(o => { if (o.isMesh) o.castShadow = true }); return G }
function palaCera(k, visible = true) { const p = k.palaC ||= PROP(nuevaPalaCera()); p.visible = visible; if (visible && p.parent !== scene) scene.add(p); return p }
// los tapones de cera: dos tarugos dorados redondeados. taponesEnMano(k, visible, mano): en la palma (sobre la punta del brazo; para mostrarlos: mostrarTapones)
const M_TAPON = new THREE.MeshStandardMaterial({ color: "#efd27a", roughness: .3, emissive: "#3a2a00", emissiveIntensity: .25 });
function nuevosTapones() { const G = new THREE.Group(); for (const x of [-.07, .07]) { part(new THREE.CylinderGeometry(.04, .05, .08, 8), M_TAPON, x, 0, 0, G, 0); gema(G, M_TAPON, .045, x, .04, 0, 1, .7, 1) } return G }
function taponesEnMano(k, visible = true, mano = "R") { const p = k.tapones ||= PROP(nuevosTapones()); p.visible = visible; if (visible) { enMano(p, k, mano, { off: [0, -.04, .29], derecho: true }); p.scale.setScalar(1.6) } return p }
// la CANASTA de la vendedora: cesto liso con asa y un paño rojo arriba. canasta(k, visible, mano): colgada del brazo (derecha por defecto)
function nuevaCanasta() { const G = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: "#d99a4e", roughness: .5 });
  part(new THREE.CylinderGeometry(.24, .19, .24, 16), m, 0, -.36, 0, G, 0); part(new THREE.CylinderGeometry(.22, .22, .04, 16), new THREE.MeshStandardMaterial({ color: "#e0353a", roughness: .5 }), 0, -.23, 0, G, 0);
  part(new THREE.TorusGeometry(.2, .025, 8, 20, Math.PI), m, 0, -.24, 0, G, 0); return G }
function canasta(k, visible = true, mano = "R") { const c = k.canasta ||= PROP(nuevaCanasta()); c.visible = visible; if (visible) enMano(c, k, mano, { off: [0, .02, 0], derecho: true }); return c }
// el FRASCO de los recuerdos (Sallow): vidrio con tapa de corcho al costado, una luz pálida que late adentro con motitas, etiqueta con número
const M_VIDRIO_FR = new THREE.MeshStandardMaterial({ color: "#d8ecee", roughness: .05, metalness: .2, transparent: true, opacity: .3, depthWrite: false, side: THREE.DoubleSide });
function nuevoFrasco() { const G = new THREE.Group();
  const pr = [[.001, -.11], [.075, -.11], [.085, -.09], [.085, .06], [.06, .09], [.055, .12], [.064, .13], [.064, .145], [.05, .145]].map(([x, y]) => new THREE.Vector2(x, y));
  const v = part(new THREE.LatheGeometry(pr, 16), M_VIDRIO_FR, 0, 0, 0, G, 0); v.castShadow = false; v.renderOrder = 2;
  const nu = new THREE.Mesh(new THREE.IcosahedronGeometry(.032, 1), new THREE.MeshBasicMaterial({ color: "#eef6ff" })); G.add(nu); G.userData.nucleo = nu;
  const halo = glowEl("#bcd8ff", .38, .9); G.add(halo); G.userData.halo = halo;
  G.userData.motas = Array.from({ length: 7 }, () => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(.008, 0), new THREE.MeshBasicMaterial({ color: "#ffffff" })); G.add(m); return m });
  const et = tex(128, 64, g => { g.fillStyle = "#d8ccae"; g.fillRect(0, 0, 128, 64); g.fillStyle = "#3a2a1a"; g.font = "bold 30px serif"; g.fillText("No 317", 10, 44) });
  const e = new THREE.Mesh(new THREE.CylinderGeometry(.0865, .0865, .06, 16, 1, true, -.7, 1.4), new THREE.MeshStandardMaterial({ map: et, roughness: .9 })); e.position.y = -.02; G.add(e); return G }
function frascoSusurro(k, visible = true, mano = "R", t = null) { const f = k.frasco ||= PROP(nuevoFrasco()); f.visible = visible; if (!visible) return f; enMano(f, k, mano, { off: [0, -.22, .02], derecho: true }); const tt = t ?? k._t ?? 0;
  f.userData.halo.material.opacity = .65 + .3 * Math.sin(tt * 2.3); f.userData.nucleo.scale.setScalar(1 + .25 * Math.sin(tt * 2.3)); f.userData.motas.forEach((m, i) => m.position.set(.045 * Math.sin(tt * 1.3 + i * 2), -.07 + _frac(tt * .2 + i / 7) * .15, .045 * Math.cos(tt * 1.1 + i * 2))); return f }
// el MARTILLO de Sallow: largo como un hombre (mango de 2,5 m de madera oscura con un trapo encerado en el agarre), cabeza de hierro con zunchos y
// caras de acero gastadas, salpicada de cera. Origen = el agarre (manos); el mango sigue +y hasta la cabeza (y = 2,5); la cabeza golpea hacia ±z.
function nuevoMartillo() { const G = new THREE.Group(), L = 2.5, r = rng(515);
  const mad = new THREE.MeshStandardMaterial({ map: tex(64, 256, (g, w, h) => { g.fillStyle = "#3a2618"; g.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { g.fillStyle = i % 2 ? "rgba(0,0,0,.25)" : "rgba(120,80,40,.2)"; g.fillRect(r() * w, 0, 2, h) } }), roughness: .7 });
  part(new THREE.CylinderGeometry(.055, .065, L + .5, 7), mad, 0, (L - .5) / 2, 0, G, 0); part(new THREE.CylinderGeometry(.064, .064, .6, 7), new THREE.MeshStandardMaterial({ color: "#6a604c", roughness: .9 }), 0, .1, 0, G, 0);
  const H = new THREE.Group(); H.position.y = L; G.add(H); part(RB(.52, .52, .98, .04, 1), EC_HIERRO, 0, 0, 0, H, 0); for (const z of [-.36, .36]) part(RB(.57, .57, .07, .015, 1), EC_HIERRO_O, 0, 0, z, H, 0);
  for (const s of [-1, 1]) part(new THREE.CylinderGeometry(.27, .29, .07, 10), EC_ACERO, 0, 0, s * .51, H, 0).rotation.x = Math.PI / 2;
  for (let i = 0; i < 6; i++) gema(H, M_CERA_SUCIA, .05, (i % 2 - .5) * .24, .21, -.3 + i * .12, 1, .5, 1);
  G.traverse(o => { if (o.isMesh) o.castShadow = true }); G.userData.L = L; return G }
// martilloSallow(k, visible, modo): "apoyado" (por defecto) = la cabeza en el piso a su derecha y el mango contra el hombro, la derecha lo agarra;
// null = solo lo devuelve visible (golpeMartillo lo pone)
function martilloSallow(k, visible = true, modo = "apoyado") { const m = k.martillo ||= PROP(nuevoMartillo()); m.visible = visible; if (!visible || !modo) { if (visible && m.parent !== scene) scene.add(m); return m }
  const s = k.body.scale.y; if (m.parent !== scene) scene.add(m); m.scale.setScalar(s);
  const cab = gW(k, .92 * s, .27 * s, .42 * s), top = gW(k, .62 * s, 2.9 * s, .05 * s), d = cab.clone().sub(top).normalize();
  m.position.copy(cab).addScaledVector(d, -m.userData.L * s); m.quaternion.setFromUnitVectors(_ay.set(0, 1, 0), d.clone().negate()).multiply(_q2.setFromAxisAngle(_ax.set(1, 0, 0), Math.PI)).multiply(_q3.setFromAxisAngle(_ax.set(0, 1, 0), Math.PI / 2));
  apuntar(k, k.armR, cab.clone().addScaledVector(d, -1.25 * s)); return m }
// el bebé: atadito en una manta (cada uno de otro color), carita dormida, gorrito tejido y TAPONES DE CERA en los oídos. Origen en el centro del bulto.
const BEBE_COLS = [["#d8c49a", "#efe6d2", "#c9a0a0"], ["#9aa8b8", "#e6e0d2", "#e8d8b0"], ["#c9a88a", "#ece4d4", "#a8b89a"], ["#b8b0a0", "#e9e2cc", "#d0a090"], ["#a8a890", "#f0e8d8", "#b8c8d8"], ["#c8b8a8", "#ece2d0", "#e0c088"]];
function nuevoBebe(i) { const [man, raya, gorr] = BEBE_COLS[i % BEBE_COLS.length], G = new THREE.Group();
  const t = tex(128, 128, (g, w, h) => { g.fillStyle = man; g.fillRect(0, 0, w, h); g.fillStyle = raya; for (let y = 10; y < h; y += 32) g.fillRect(0, y, w, 10); sombra2D(g, w, h, .1) }), m = new THREE.MeshStandardMaterial({ map: t, roughness: .75 });
  part(RB(.38, .56, .32, .07, 2), m, 0, 0, 0, G, 0); part(RB(.27, .25, .25, .03, 2), new THREE.MeshStandardMaterial({ color: ["#f7e7d6", "#f1dec8", "#f4e2cc"][i % 3], roughness: .55 }), 0, .38, .02, G, 0);
  const go = part(new THREE.CylinderGeometry(.13, .17, .14, 8), accMat(gorr), 0, .5, 0, G, 0); go.rotation.x = -.15; gema(G, accMat(oscV(gorr, .8)), .05, 0, .6, -.02);
  for (const s of [-1, 1]) gema(G, M_TAPON, .035, s * .14, .37, .02);
  const cara = tex(256, 192, g => { g.strokeStyle = TINTA; g.lineCap = "round"; g.lineWidth = 11; for (const x of [84, 172]) { g.beginPath(); g.moveTo(x - 20, 82); g.quadraticCurveTo(x, 100, x + 20, 82); g.stroke() } g.fillStyle = BORDO; g.beginPath(); g.ellipse(128, 138, 10, 9, 0, 0, 7); g.fill() });
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(.25, .19), new THREE.MeshStandardMaterial({ map: cara, transparent: true, roughness: .8, depthWrite: false })); pl.position.set(0, .38, .148); G.add(pl);
  G.traverse(o => { if (o.isMesh && o !== pl) o.castShadow = true }); return G }
const BEBES = Array.from({ length: 6 }, (_, i) => PROP(nuevoBebe(i)));
// bebe(k, visible): el bebé de ese personaje contra el pecho (cargarBebe pone los brazos). Las dos madres tienen BEBES[0] y BEBES[1].
// bebeEn(i, pos, ry, acostado): el bebé i (0..5) suelto en el mundo
function bebe(k, visible = true) { const i = k === MADRES[1] ? 1 : k === MADRES[0] ? 0 : 2 + (k.idx % 4), b = BEBES[i]; b.visible = visible; if (!visible) return b;
  if (b.parent !== k.body) k.body.add(b); b.position.set(-.06, 1.6, .5); b.rotation.set(.3, 0, -1.15); b.scale.setScalar(1); return b }
function bebeEn(i, pos, ry = 0, acostado = 1) { const b = BEBES[i % BEBES.length]; return enMundo(b, [pos[0], pos[1] + (acostado ? .17 : .3), pos[2]], ry, -acostado * Math.PI / 2) }
function utileriaReset() { PROPS_C.forEach(o => o.visible = false) }

// ================= ANIMACIÓN (se llaman DESPUÉS de pose(); dejan al personaje listo) =================
// pose() del motor queda envuelta: limpia lo que estas funciones tocan (nada queda pegado de un cuadro al otro) y esconde la utilería una vez por cuadro.
{ const pose0 = pose; let tUlt = -1e9;
  pose = (k, t, o = {}) => { if (t !== tUlt) { tUlt = t; utileriaReset() } k._t = t; k.body.quaternion.identity(); k.body.position.set(0, 0, 0); _MIEM(k).forEach(m => m.quaternion.identity()); if (k._p0) { k.armL.position.y = k.armR.position.y = k._p0.armY; k.head.position.x = 0 } if (k.dedos) k.dedos.forEach(d => d.rotation.set(0, 0, 0)); pose0(k, t, o) } }
// quiebre de cadera (el torso gira en la cadera y las piernas siguen rectas; sin codos ni rodillas). lean = inclinación del torso (+ adelante); psi = ángulo de las piernas
function cadera(k, lean, psi = 0) { const b = k.body, L0 = b.rotation.x, s = b.scale.y, d = lean - L0, H = HC(k);
  b.rotation.x = lean; k.legL.rotation.x += psi - d; k.legR.rotation.x += psi - d; b.position.z -= H * s * ((Math.sin(lean) - Math.sin(L0)) - Math.sin(psi)); b.position.y -= H * s * ((Math.cos(lean) - Math.cos(L0)) - (Math.cos(psi) - 1)) }
const _fase = k => (k.idx || 0) * 1.7;
const _respira = (k, t) => k.quietoTotal ? 0 : .012 * Math.sin(t * 2.2 + (k.idx || 0));
// los dedos largos de Sallow: se curvan despacio, cada uno a su ritmo (cierre 0 = sueltos … 1 = agarrando)
function dedosSallow(k, t, cierre = 0) { if (!k.dedos || !k.dedos.length) return; k.dedos.forEach((d, i) => d.rotation.set(-(.15 + cierre * .95 + .14 * Math.sin(t * 1.1 + i * .9)), 0, 0)) }
// quieto(k, t, { mira }): parado derecho, brazos en «A», respira (Sallow: no respira, inclinado, los dedos se mueven solos)
function quieto(k, t, { mira = 0 } = {}) { const A = AB(k); k._t = t;
  k.legL.rotation.set(0, 0, 0); k.legR.rotation.set(0, 0, 0); k.armL.rotation.set(0, 0, -A - _respira(k, t)); k.armR.rotation.set(0, 0, A + _respira(k, t)); k.head.rotation.set(_respira(k, t), mira, 0); k.body.rotation.set(0, 0, 0); k.body.position.set(0, 0, 0);
  if (k.encorvado) { cadera(k, k.encorvado); k.head.rotation.x = -k.encorvado * .75 + (k.cabezaBaja || 0); k.armL.rotation.x = k.encorvado * .8; k.armR.rotation.x = k.encorvado * .8 }
  if (k.cola) k.cola.rotation.x = .1; dedosSallow(k, t); parpadeo(k, t) }
// caminata: ciclo de 0,5 s; piernas ±27,5°, brazos ±7° en «A», balanceo ±5°. vel < 0 = hacia atrás
function andar(k, t, { vel = 1 } = {}) { const f = t * vel / .5 * Math.PI * 2 + _fase(k), sw = Math.sin(f), amp = k.pasoMax ?? .48, A = AB(k), s = k.body.scale.y; k._t = t;
  k.body.rotation.set(0, 0, sw * .087); k.body.position.set(0, -HC(k) * s * (1 - Math.cos(amp * sw)), 0);
  k.legL.rotation.set(sw * amp, 0, 0); k.legR.rotation.set(-sw * amp, 0, 0); k.armL.rotation.set(-sw * .12, 0, -A); k.armR.rotation.set(sw * .12, 0, A); k.head.rotation.set(0, 0, -sw * .04);
  if (k.encorvado) { cadera(k, k.encorvado); k.head.rotation.x = -k.encorvado * .75 }
  dedosSallow(k, t); parpadeo(k, t) }
// andarSallow(k, t, { vel }): camina lento (ciclo de 1 s), pasos cortos, SIN mover los brazos (cuelgan rectos), sin balanceo, la cabeza quieta mirando al frente
function andarSallow(k, t, { vel = 1 } = {}) { const f = t * vel * Math.PI * 2 + _fase(k), sw = Math.sin(f), amp = k.pasoMax ?? .26, s = k.body.scale.y, e = k.encorvado || 0; k._t = t;
  k.body.rotation.set(0, 0, 0); k.body.position.set(0, -HC(k) * s * (1 - Math.cos(amp * sw)), 0); k.legL.rotation.set(sw * amp, 0, 0); k.legR.rotation.set(-sw * amp, 0, 0);
  k.armL.rotation.set(0, 0, -AB(k)); k.armR.rotation.set(0, 0, AB(k)); k.head.rotation.set(0, 0, 0); if (e) { cadera(k, e); k.head.rotation.x = -e + (k.cabezaBaja || 0); k.armL.rotation.x = e; k.armR.rotation.x = e }
  if (k.cola) k.cola.rotation.x = .1 + Math.max(0, amp * Math.abs(sw)) * 1.1; dedosSallow(k, t); return f }
// corrida: ciclo de 0,5 s; torso 20° adelante; fuerte = 1: brazos que bombean
function correrV(k, t, { fuerte = 0 } = {}) { const f = t / .5 * Math.PI * 2 + _fase(k), sw = Math.sin(f), amp = k.zancMax ?? .87, A = AB(k), lean = .35, s = k.body.scale.y; k._t = t;
  k.body.rotation.set(0, 0, 0); k.body.position.set(0, Math.abs(sw) * .13 * s, 0); k.legL.rotation.set(sw * amp, 0, 0); k.legR.rotation.set(-sw * amp, 0, 0); cadera(k, lean);
  const b0 = lerp(.38, -1.2, fuerte), ba = lerp(.06, .55, fuerte), bz = lerp(A * .7, .12, fuerte); k.armL.rotation.set(b0 - sw * ba, 0, -bz); k.armR.rotation.set(b0 + sw * ba, 0, bz); k.head.rotation.set(-lean * .7, 0, 0); parpadeo(k, t) }

// ---------- MIEDO Y CERA
// taparOidos(k, t, u, { cara }): se tapa las orejas con las manos (brazos arriba pegados a la cabeza, hombros encogidos), la cabeza un poco gacha, tiembla.
// u 0→1 desde quieto. cara (por defecto «terror») se pone a partir de u = .3; cara = null la deja como está.
function taparOidos(k, t, u = 1, { cara = "terror" } = {}) { const e = _suave(u), tr = .035 * Math.sin(t * 31 + (k.idx || 0)) * e; quieto(k, t);
  cadera(k, (k.encorvado || 0) + .1 * e); k.head.rotation.x += .08 * e; k.head.rotation.z = tr * .5;
  for (const [a, sg] of [[k.armL, -1], [k.armR, 1]]) { a.rotation.set(lerp(a.rotation.x, -2.98, e) + tr, 0, sg * lerp(AB(k), -.21, e)); a.position.y = k._p0.armY - .22 * e }
  if (cara && u > .3) setFace(k, cara); parpadeo(k, t) }
// taparOidosOtro(a, b, t, u): los NOVIOS se tapan los oídos uno al otro: cada uno lleva las dos manos a las orejas del otro. La escena los pone de frente,
// mirándose, a ≈ .85·s de distancia (pies a pies). No cambia las caras.
function taparOidosOtro(a, b, t, u = 1) { const e = _suave(u); quieto(a, t); quieto(b, t); [a, b].forEach(k => { cadera(k, .05 * e); k.head.rotation.x = .04 }); a.g.updateMatrixWorld(true); b.g.updateMatrixWorld(true);
  for (const [k, o] of [[a, b], [b, a]]) { o.head.updateWorldMatrix(true, false);
    for (const [arm, ox] of [[k.armL, .4], [k.armR, -.4]]) { const P = o.head.localToWorld(new THREE.Vector3(ox, .36, -.02)), Q = arm.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, -1, 0)); apuntar(k, arm, Q.lerp(P, e)) } }
  parpadeo(a, t); parpadeo(b, t) }
// leerLabios(k, t, { mano }): inclinado, mirando fijo una boca, con la mano en el mentón (mano = 0: brazos quietos). Cara «listen» si no se pidió otra.
function leerLabios(k, t, { mano = 1 } = {}) { quieto(k, t); cadera(k, (k.encorvado || 0) + .16); k.head.rotation.set(-.02, 0, .07 * Math.sin(t * .7)); if (k.cara === "neutral") setFace(k, "listen");
  if (mano) { k.g.updateMatrixWorld(true); k.head.updateWorldMatrix(true, false); apuntar(k, k.armR, k.head.localToWorld(_v4.set(.06, .1, .52))); k.armL.rotation.set(-.95, 0, .55) } parpadeo(k, t) }
// susurrarFrasco(k, t, { a }): el CLIENTE de Sallow inclinado susurrando: las dos manos haciendo bocina alrededor de la boca, la cara hacia el frasco.
// a = el frasco (Object3D) o un punto del mundo: gira la cabeza hacia ahí. Cara «susurra».
function susurrarFrasco(k, t, { a = null } = {}) { quieto(k, t); cadera(k, .34 + .02 * Math.sin(t * 3)); k.head.rotation.x = -.12; setFace(k, "susurra"); k.g.updateMatrixWorld(true); k.head.updateWorldMatrix(true, false);
  for (const [arm, sx] of [[k.armL, -1], [k.armR, 1]]) apuntar(k, arm, k.head.localToWorld(new THREE.Vector3(sx * .26, .2, .6)));
  if (a) { const P = a.isVector3 ? a : a.getWorldPosition(new THREE.Vector3()), H = k.head.getWorldPosition(new THREE.Vector3()); k.g.getWorldQuaternion(_q1); const d = P.sub(H).applyQuaternion(_q1.invert()); k.head.rotation.y = cl(Math.atan2(d.x, d.z), -.6, .6) }
  parpadeo(k, t) }
// mostrarTapones(k, t, u): adelanta la mano derecha con la palma arriba y los TAPONES encima (aparecen desde u = .3); mira la mano
function mostrarTapones(k, t, u = 1) { const e = _suave(u); quieto(k, t); k.armR.rotation.set(lerp(0, -1.32, e) + .02 * Math.sin(t * 3), lerp(0, -.25, e), lerp(AB(k), .02, e)); k.head.rotation.set(.2 * e, -.1 * e, 0); taponesEnMano(k, u > .3); parpadeo(k, t) }
// derretirCera(k, t, { olla }): inclinado sobre el CALDERO (su olla a escala 1,7 en el piso, adelante) revolviendo en círculos con la pala de madera.
// olla = false: revuelve en el punto 1,1 m adelante y .6 de alto (para un caldero de la escena). Devuelve la olla.
function derretirCera(k, t, { olla = true } = {}) { const s = k.body.scale.y, w = t * 2.4 + _fase(k); quieto(k, t); cadera(k, .28 + .03 * Math.sin(w)); k.legL.rotation.x += .1; k.legR.rotation.x -= .15;
  const o = olla ? ollaCera(k, true, "piso", { escala: 1.7, t }) : null, C = o ? o.localToWorld(new THREE.Vector3(0, -.2, 0)) : gW(k, 0, .6 * s, 1.1 * s);
  C.x += Math.cos(w) * .16 * s; C.z += Math.sin(w) * .16 * s;
  const top = gW(k, .05 * s + .12 * s * Math.cos(w), 1.72 * s, .5 * s + .1 * s * Math.sin(w)), d = C.clone().sub(top).normalize();
  apuntar(k, k.armL, top); apuntar(k, k.armR, top.clone().addScaledVector(d, .45 * s));
  const p = palaCera(k, true); k.handL.getWorldPosition(p.position); p.quaternion.setFromUnitVectors(_ABAJO, C.clone().sub(p.position).normalize()); p.scale.setScalar(s);
  k.head.rotation.x = .22; parpadeo(k, t); return o }
// cargarOlla(k, t, { andar, olla }): lleva la olla con las dos manos por las orejas, adelante a la altura de la panza, el cuerpo un poco hacia atrás (pesa)
function cargarOlla(k, t, { andar: an = 0, olla = true } = {}) { if (an) andar(k, t, { vel: .6 }); else quieto(k, t); const s = k.body.scale.y; cadera(k, k.body.rotation.x - .1);
  apuntar(k, k.armL, gW(k, -.34 * s, 1.32 * s, .62 * s)); apuntar(k, k.armR, gW(k, .34 * s, 1.32 * s, .62 * s)); k.head.rotation.x = .12; const o = olla ? ollaCera(k, true, "manos", { t }) : null; parpadeo(k, t); return o }
// volcarOlla(k, t, u, { CHORRO_CERA }): levanta la olla (u 0→.4) y la vuelca hacia adelante (u .3→1); desde que pasa los ~50° cae el CHORRO_CERA de cera (largo en m)
function volcarOlla(k, t, u = 1, { CHORRO_CERA = 3 } = {}) { const s = k.body.scale.y, a = _suave(u / .4), b = _suave((u - .3) / .7); quieto(k, t); cadera(k, -.08 + .2 * b);
  const y = lerp(1.32, 1.78, a), z = lerp(.62, .86, a); apuntar(k, k.armL, gW(k, -.34 * s, y * s, z * s)); apuntar(k, k.armR, gW(k, .34 * s, y * s, z * s));
  const inc = 2.05 * b, o = ollaCera(k, true, "manos", { inclina: inc, t }); if (inc > .9) chorroCera(o.localToWorld(new THREE.Vector3(0, .03, .31)), CHORRO_CERA * s, t);
  k.head.rotation.x = .2; parpadeo(k, t); return o }
// trepaCadena(k, t, { h, vel }): trepa un ESLABÓN enorme abrazándolo: brazos bien abiertos arriba y piernas de rana, alternados, sube a tirones.
// k.g pegado a la cara del eslabón (≈ .45·s), mirándolo (+z local hacia la cadena). h = cuánto subió (se suma al body).
function trepaCadena(k, t, { h = 0, vel = 1 } = {}) { const c = t * vel * .8 + _fase(k) * .1, sw = Math.sin(c * Math.PI * 2), s = k.body.scale.y; k._t = t;
  k.body.rotation.set(.1, 0, sw * .07); k.body.position.set(0, h + .14 * s * (.5 - .5 * Math.cos(c * Math.PI * 4)), 0);
  k.armL.rotation.set(-2.6 - .38 * sw, 0, -.5 + .1 * sw); k.armR.rotation.set(-2.6 + .38 * sw, 0, .5 + .1 * sw);
  k.legL.rotation.set(-.5 - .6 * Math.max(0, -sw), 0, -.42); k.legR.rotation.set(-.5 - .6 * Math.max(0, sw), 0, .42); k.head.rotation.set(-.38, .12 * sw, 0); parpadeo(k, t) }
// trepar(k, t, { h, vel }): trepa una escalera/poste angosto (brazos y piernas alternados)
function trepar(k, t, { h = 0, vel = 1 } = {}) { const c = t * vel * 1.1 + _fase(k) * .1, sw = Math.sin(c * Math.PI * 2), s = k.body.scale.y; k._t = t;
  k.body.rotation.set(.06, 0, sw * .05); k.body.position.set(0, h + .1 * s * (1 - Math.cos(c * Math.PI * 4)) * .5, 0);
  k.armL.rotation.set(-2.72 - .32 * sw, 0, .12); k.armR.rotation.set(-2.72 + .32 * sw, 0, -.12);
  k.legL.rotation.set(-.08 - .62 * Math.max(0, -sw), 0, -.05); k.legR.rotation.set(-.08 - .62 * Math.max(0, sw), 0, .05); k.head.rotation.set(-.32, .1 * sw, 0); parpadeo(k, t) }

// ---------- MIRAR / SEÑALAR / GRITAR / RETROCEDER / ABRAZARSE
function mirarArriba(k, t, u = 1) { const e = _suave(u); quieto(k, t); cadera(k, (k.encorvado || 0) - .14 * e); k.head.rotation.x = -.5 * e + _respira(k, t); k.armL.rotation.x = .12 * e; k.armR.rotation.x = .12 * e; parpadeo(k, t) }
function senalarArriba(k, t, u = 1, { mano = "R" } = {}) { const e = _suave(u); mirarArriba(k, t, u); const a = mano === "R" ? k.armR : k.armL, sg = mano === "R" ? 1 : -1; a.rotation.set(lerp(0, -2.75, e) + .03 * Math.sin(t * 3), 0, sg * lerp(AB(k), .05, e)); parpadeo(k, t) }
// senalar(k, t, u, { alto, mano }): señala adelante con el brazo estirado (alto = cuánto más arriba, rad)
function senalar(k, t, u = 1, { alto = 0, mano = "R" } = {}) { const e = _suave(u); quieto(k, t); const a = mano === "R" ? k.armR : k.armL, sg = mano === "R" ? 1 : -1; a.rotation.set(lerp(0, -1.5 - alto, e) + .02 * Math.sin(t * 4), 0, sg * lerp(AB(k), .03, e)); k.head.rotation.x = -alto * .4 * e; parpadeo(k, t) }
// gritarArriba(k, t, { u }): NELL gritando hacia arriba («Say my name»): mira arriba, cuerpo hacia atrás, las manos haciendo bocina en la boca, empuja con cada grito. Cara «grito».
function gritarArriba(k, t, { u = 1, cara = "grito" } = {}) { const e = _suave(u), p = Math.max(0, Math.sin(t * 2.6)); quieto(k, t); cadera(k, -.2 * e - .05 * p * e); k.head.rotation.x = -.55 * e; if (cara) setFace(k, cara);
  k.g.updateMatrixWorld(true); k.head.updateWorldMatrix(true, false); const s = k.body.scale.y;
  for (const [arm, sx] of [[k.armL, -1], [k.armR, 1]]) { const P = k.head.localToWorld(new THREE.Vector3(sx * .3, .2, .62)), Q = gW(k, sx * .9 * s, .7 * s, .2 * s); apuntar(k, arm, Q.lerp(P, e)) }
  k.legL.rotation.x += .1; k.legR.rotation.x -= .08; parpadeo(k, t) }
// retroceder(k, t, u): camina HACIA ATRÁS (la escena mueve k.g hacia −z local) mirando arriba, brazos un poco adelante. u = cuánto mira arriba.
function retroceder(k, t, u = 1) { const e = _suave(u); andar(k, t, { vel: -.85 }); cadera(k, -.1 * e); k.head.rotation.x = -.45 * e; k.armL.rotation.x -= .5 * e; k.armR.rotation.x -= .5 * e; k.armL.rotation.z -= .2 * e; k.armR.rotation.z += .2 * e; parpadeo(k, t) }
// abrazarse(k, t, { tiembla }): se abraza a sí mismo (brazos cruzados sobre el pecho), encogido, tiritando
function abrazarse(k, t, { tiembla = 1 } = {}) { quieto(k, t); const s = k.body.scale.y, j = tiembla * .02 * Math.sin(t * 37 + (k.idx || 0)); cadera(k, (k.encorvado || 0) + .1); k.head.rotation.x = .12;
  apuntar(k, k.armL, gW(k, (.5 + j) * s, 1.72 * s, .72 * s)); apuntar(k, k.armR, gW(k, (-.5 - j) * s, 1.56 * s, .68 * s)); k.body.rotation.z += j; parpadeo(k, t) }
// cargarBebe(k, t): sostiene al bebé contra el pecho con los dos brazos y lo acuna (muestra el bebé de k)
function cargarBebe(k, t, { andar: an = 0 } = {}) { if (an) andar(k, t, { vel: .7 }); else quieto(k, t); const m = .05 * Math.sin(t * 2.4 + (k.idx || 0));
  k.armL.rotation.set(-.78 + m, 0, .5); k.armR.rotation.set(-.88 - m, 0, -.5); k.head.rotation.set(.24, 0, -.08); const b = bebe(k, true); b.rotation.z = -1.15 + m * 1.2; parpadeo(k, t); return b }
// boda(novio, novia, t): de frente (≈ 1,3 de distancia) tomados de las dos manos, meciéndose apenas
function boda(a, b, t) { quieto(a, t); quieto(b, t); [a, b].forEach((k, i) => { k.body.rotation.z = .03 * Math.sin(t * 1.6 + i * Math.PI); k.head.rotation.x = .06 }); a.g.updateMatrixWorld(true); b.g.updateMatrixWorld(true);
  const pa = a.g.getWorldPosition(new THREE.Vector3()), pb = b.g.getWorldPosition(new THREE.Vector3()), mid = pa.clone().lerp(pb, .5), d = pb.clone().sub(pa).setY(0).normalize(), lat = _v3.set(d.z, 0, -d.x), y = 1.25 * Math.min(a.body.scale.y, b.body.scale.y);
  for (const [k, sg] of [[a, 1], [b, -1]]) { apuntar(k, k.armL, mid.clone().addScaledVector(lat, -.28 * sg).setY(mid.y + y)); apuntar(k, k.armR, mid.clone().addScaledVector(lat, .28 * sg).setY(mid.y + y)) } parpadeo(a, t); parpadeo(b, t) }

// ---------- SALLOW (todo lento; la cara no cambia nunca)
// ladear(k, t, u, { lado }): inclina la cabeza de costado DEMASIADO (≈ 47°), despacio. Se llama después de la pose de base (quieto, andarSallow…).
function ladear(k, t, u = 1, { lado = 1 } = {}) { const e = _suave(u); k.head.rotation.z += lado * .82 * e; k.head.rotation.x += .05 * e; k.head.position.x = lado * -.05 * e; k.body.rotation.z += -lado * .03 * e; return e }
// acercarFrasco(k, t, u, { a }): estira el brazo derecho (lento) y acerca el FRASCO a la boca de `a` (un personaje: su boca; o un Vector3 del mundo).
// El brazo no dobla: la mano queda a un largo de brazo (≈ 1,6·s) del hombro en esa dirección; la escena pone al cliente a esa distancia.
function acercarFrasco(k, t, u = 1, { a = null } = {}) { const e = _suave(u), s = k.body.scale.y; quieto(k, t); cadera(k, (k.encorvado || 0) + .12 * e); k.head.rotation.x = -(k.encorvado || 0) * .75 + .05;
  let P = null; if (a && a.isVector3) P = a.clone(); else if (a && a.head) { a.g.updateMatrixWorld(true); a.head.updateWorldMatrix(true, false); P = a.head.localToWorld(new THREE.Vector3(0, .2, .75)) }
  if (!P) P = gW(k, .2 * s, 2.3 * s, 2 * s); const R0 = gW(k, .62 * s, .9 * s, .2 * s); apuntar(k, k.armR, R0.lerp(P, e));
  const f = frascoSusurro(k, true, "R", t); dedosSallow(k, t, .55); return f }
// golpeMartillo(k, t, u, { martillo }): un golpe con el martillo largo, con las dos manos. u 0→.62: lo levanta DESPACIO por encima de la cabeza;
// .62→.70: golpe seco hacia adelante (a la altura del pecho, con la cabeza del martillo ≈ 2,8·s adelante); después queda con un rebote chico.
// Devuelve true en el cuadro del golpe (para el «thud», el temblor de cámara, etc.)
function golpeMartillo(k, t, u = 0, { martillo = true } = {}) { const s = k.body.scale.y; quieto(k, t);
  const th = u < .62 ? lerp(-.55, 2.3, _suave(u / .62)) : u < .7 ? lerp(2.3, -.25, Math.pow((u - .62) / .08, 2)) : -.25 + .1 * Math.exp(-(u - .7) * 25) * Math.sin((u - .7) * 60);
  const lean = u < .62 ? lerp(.14, -.12, _suave(u / .62)) : u < .7 ? lerp(-.12, .3, (u - .62) / .08) : .3; cadera(k, lean); k.legL.rotation.x += .2; k.legR.rotation.x -= .25; k.head.rotation.x = -lean * .9;
  k.g.updateMatrixWorld(true); const sh = k.body.localToWorld(new THREE.Vector3(0, k._p0.armY, 0)), dir = new THREE.Vector3(0, Math.sin(th), Math.cos(th)).applyQuaternion(k.g.getWorldQuaternion(_q1));
  const G = sh.clone().addScaledVector(dir, k._p0.armL * .8 * s); apuntar(k, k.armL, G); apuntar(k, k.armR, G);
  if (martillo) { const m = martilloSallow(k, true, null); k.g.updateMatrixWorld(true); m.position.copy(k.handL.getWorldPosition(_v1)).add(k.handR.getWorldPosition(_v2)).multiplyScalar(.5); m.quaternion.setFromUnitVectors(_ay.set(0, 1, 0), dir); m.scale.setScalar(s) }
  dedosSallow(k, t, 1); return u >= .69 && u < .715 }
// caerAtras(k, t, u): da un paso atrás (u 0→.3) y cae de espaldas TIESO, sin agitar los brazos (u .3→1, acelerando); queda acostado. Devuelve cuánto cayó (0..1).
function caerAtras(k, t, u = 1) { const s = k.body.scale.y; quieto(k, t); const p = _suave(u / .3), f = cl((u - .3) / .7), a = f * f * Math.PI / 2, paso = .38 * s * p;
  if (f <= 0) { k.legR.rotation.x = .4 * Math.sin(p * Math.PI); k.body.position.z -= paso; cadera(k, (k.encorvado || 0) - .08 * p) }
  else { cuerpoQ(k, _q3.setFromAxisAngle(_ax.set(1, 0, 0), -a - .08 * (1 - f)), [0, 0, -.22], [0, 0, -paso - .22 * s]); k.legL.rotation.set(0, 0, 0); k.legR.rotation.set(0, 0, 0); k.head.rotation.set(0, 0, 0) }
  k.armL.rotation.set(0, 0, -AB(k)); k.armR.rotation.set(0, 0, AB(k)); return f }

// gestos LINEALES (dur = 0,4 s), se quedan en la pose; `fin`: tiempo en que vuelve. tipos: senala, cubre, brazos, alza, abraza, tira, grita, agita, manosCabeza
const GESTOS = {
  senala: { R: [-1.5, 0] }, alza: { R: [-3.0, .1] }, para: { R: [-1.6, -.2], hx: -.06 },
  cubre: { L: [-2.2, .62], R: [-2.2, -.62], hx: .16, lean: .1 }, brazos: { L: [0, -.94], R: [0, .94], hx: -.06, lean: -.07 }, abraza: { L: [-1.2, .42], R: [-1.2, -.42] },
  tira: { L: [-1.25, .14], R: [-1.25, -.14], lean: -.3, hx: .12 }, grita: { L: [-2.0, -.14], R: [-2.0, .14], lean: .26, hx: -.2 },
  agita: { R: [-1.6, .1] }, manosCabeza: { L: [-2.7, .9], R: [-2.7, -.9], hx: .1 } };
function gesto(k, t, t0, tipo, { dur = .4, fin = null, mano = "R", alto = 0 } = {}) { const G = GESTOS[tipo]; if (!G) return 0; let u = P(t, t0, t0 + dur); if (fin != null) u *= 1 - P(t, fin, fin + dur); if (u <= 0) return 0;
  const esp = mano === "L" && !G.L, ap = (a, [x, z], sg) => { a.rotation.x = lerp(a.rotation.x, x, u); a.rotation.z = lerp(a.rotation.z, z * sg, u) };
  if (G.L) ap(k.armL, G.L, 1); if (G.R) { const [x, z] = G.R, xx = tipo === "senala" ? x - alto : x; esp ? ap(k.armL, [xx, z], -1) : ap(k.armR, [xx, z], 1) }
  if (G.lean) cadera(k, lerp(k.body.rotation.x, k.body.rotation.x + G.lean, u));
  if (G.hx) k.head.rotation.x += G.hx * u;
  if (u >= 1 && tipo === "agita") { const q = ((t - t0 - dur) / (16 * F30)) % 1, tri = q < .5 ? q * 4 - 1 : 3 - q * 4, a = esp ? k.armL : k.armR; a.rotation.x = -1.6 + tri * .38 }
  return u }
// caída: el cuerpo tieso vuelca en 16 cuadros (dir = 1 de cara, −1 de espaldas) y queda acostado
function caer(k, t, t0, { dir = -1, dur = 16 * F30 } = {}) { const u = P(t, t0, t0 + dur); if (u <= 0) return 0; const a = u * u * Math.PI / 2, s = k.body.scale.y; k.body.rotation.x = dir * a; k.body.position.y = Math.sin(a) * .3 * s; k.body.position.z = -dir * Math.sin(a) * .3 * s; k.head.rotation.set(0, 0, 0); return u }
// salto: se agacha 8 cuadros, salta tieso y cae (14 cuadros en el aire); devuelve la altura
function saltar(k, t, t0, { alto = .9, aire = 14 * F30 } = {}) { const ta = 8 * F30, s = k.body.scale.y; if (t <= t0 || t >= t0 + ta + aire) return 0;
  if (t < t0 + ta) { const c = (t - t0) / ta; cadera(k, .5 * c, -.42 * c); k.armL.rotation.x = .5 * c; k.armR.rotation.x = .5 * c; k.head.rotation.x -= .3 * c; return 0 }
  const v = (t - t0 - ta) / aire, y = alto * 4 * v * (1 - v) * s; k.body.position.y += y; k.armL.rotation.z = -A_BRAZO - .25; k.armR.rotation.z = A_BRAZO + .25; return y }

// ================= MISTER SALLOW «REALISTA» (sallowR) — «Nobody Hears The Bell» =================
// Pedido del dueño: el villano es una figura DETALLADA (no de bloques) al lado de los personajes de bloques: ese contraste es
// el de los monstruos de Volze. Diseño propio: ≈ 4,8 m (los de bloques ≈ 2,2), demacrado, torso estrecho, extremidades larguísimas
// con articulaciones marcadas, dedos de ≈ 40 cm con nudillos, encorvado, cuello largo. Cabeza alargada, calva, SIN OREJAS (piel
// lisa), piel de CERA marfil-verdosa con venas grises, brillo húmedo y gotas de cera solidificadas que chorrean del cráneo, el mentón
// y el cuello; ojos chiquitos negros mate hundidos; una sonrisa fija, finísima y demasiado ancha. Levita larga raída (pliegues de
// verdad, ruedo deshilachado, jirones), delantal de cuero manchado de cera, guantes rotos que dejan ver los dedos de cera.
// Todo procedural: lofts (anillos elípticos) con pliegues, esferas deformadas, tubos sobre curvas; texturas pintadas en canvas.
// API (todas se llaman por cuadro, en este orden: poner → quieto|andar → modificadores → headW/ojoW para la cámara):
//   sallowR.poner(x, y, z, ry)        lo muestra en ese punto (y = piso) y lo deja en la pose de reposo (borra lo del cuadro anterior)
//   sallowR.ocultar()                 lo esconde (llamarlo en el reset de cada cuadro)
//   sallowR.quieto(t)                 casi no respira; los dedos se mueven solos, lento, cada uno por su cuenta
//   sallowR.andar(t, vel = .7)        pasos larguísimos y lentos, brazos colgando sin balancear, la cabeza quieta.
//                                     El que llama avanza la raíz a `vel` m/s (ciclo de dos pasos = sallowR.PASO m) para que los pies no patinen
//   sallowR.ladear(u)                 la cabeza se inclina de costado DEMASIADO (u = 1 → 60°; negativo para el otro lado)
//   sallowR.inclinarse(u, p)          se agacha sobre alguien (p = [x, y, z] del mundo, p. ej. la cabeza del otro): baja la cara hasta él
//                                     y estira una mano abierta por encima; u 0..1
//   sallowR.frasco(visible)           sostiene un frasco con brillo pálido entre dos dedos, delante del pecho
//   sallowR.martillo(visible)         martillo enorme (largo como un hombre de bloques) apoyado en el piso, en la mano derecha
//   sallowR.golpe(t, u)               martillazo con las dos manos: 0 reposo → .35 arriba atrás → .62 impacto adelante → 1 rebote
//   sallowR.caer(u)                   paso atrás y cae de espaldas, rígido como una tabla (u 0..1)
//   sallowR.aura(on, k = 1)           niebla baja que se arrastra a sus pies, moscas y polvo flotando, luz fría tenue desde abajo;
//                                     llama a velasHacia(p, u) si existe. Llamarla DESPUÉS de la animación del cuadro (usa su t)
//   sallowR.headW() / ojoW(lado = 1)  Vector3 del centro de la cabeza / del ojo (para la cámara)
//   sallowR.ojoCam(d = .08)           [x, y, z] delante del ojo a d m, en la dirección en que mira (plano extremo del ojo)
//   sallowR.caraCam(d, ang, dy)       [x, y, z] delante de la cara a d m (ang gira alrededor, dy sube)
//   sallowR.climas()                  agrega los climas "sallow" y "noche" a ENV si nadie los definió (llamar antes de setEnv)
//   sallowR.g                         el grupo raíz (mira a +z local, como el elenco)
const sallowR = (() => {
  const T3 = THREE, PI = Math.PI, TAU = PI * 2;
  const S_ = (a, b, v) => { const q = Math.max(0, Math.min(1, (v - a) / (b - a))); return q * q * (3 - 2 * q) };
  const cl01 = v => Math.max(0, Math.min(1, v)), lerp = (a, b, k) => a + (b - a) * k, eIO = k => k * k * (3 - 2 * k);
  const ex2 = (a) => Math.exp(-a);
  const rnd = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 };
  const hsh = (i, j, k) => { let n = (Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(k, 1274126177)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296 };
  const nz3 = (x, y, z) => { const i = Math.floor(x), j = Math.floor(y), k = Math.floor(z), fx = x - i, fy = y - j, fz = z - k, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), w = fz * fz * (3 - 2 * fz);
    return lerp(lerp(lerp(hsh(i, j, k), hsh(i + 1, j, k), u), lerp(hsh(i, j + 1, k), hsh(i + 1, j + 1, k), u), v), lerp(lerp(hsh(i, j, k + 1), hsh(i + 1, j, k + 1), u), lerp(hsh(i, j + 1, k + 1), hsh(i + 1, j + 1, k + 1), u), v), w) };
  const fbm = (x, y, z) => nz3(x, y, z) * .5 + nz3(x * 2.03 + 7, y * 2.03, z * 2.03) * .3 + nz3(x * 4.1, y * 4.1 + 3, z * 4.1) * .2;
  const v1 = new T3.Vector3(), v2 = new T3.Vector3(), v3 = new T3.Vector3(), v4 = new T3.Vector3(), q1 = new T3.Quaternion(), q2 = new T3.Quaternion(), ABAJO = new T3.Vector3(0, -1, 0);

  // ---------- geometría: loft de anillos (u alrededor, v a lo largo; y baja con v → caras hacia afuera), costura sin marca
  function costura(g) { g.computeVertexNormals(); const p = g.attributes.position, n = g.attributes.normal, M = new Map();
    for (let i = 0; i < p.count; i++) { const k = Math.round(p.getX(i) * 2e4) + "," + Math.round(p.getY(i) * 2e4) + "," + Math.round(p.getZ(i) * 2e4); let L = M.get(k); if (!L) M.set(k, L = []); L.push(i) }
    M.forEach(L => { if (L.length < 2) return; let x = 0, y = 0, z = 0; L.forEach(i => { x += n.getX(i); y += n.getY(i); z += n.getZ(i) }); const l = Math.hypot(x, y, z) || 1; L.forEach(i => n.setXYZ(i, x / l, y / l, z / l)) }); return g }
  function loft(nU, nV, fn, o = {}) { const P = [], UV = [], I = [];
    for (let j = 0; j <= nV; j++) for (let i = 0; i <= nU; i++) { const u = i / nU, v = j / nV, q = fn(u, v); P.push(q[0], q[1], q[2]); UV.push(u * (o.ru || 1), (1 - v) * (o.rv || 1)) }
    for (let j = 0; j < nV; j++) for (let i = 0; i < nU; i++) { const a = j * (nU + 1) + i, b = a + 1, c = a + nU + 1, d = c + 1; I.push(a, c, b, b, c, d) }
    const g = new T3.BufferGeometry(); g.setAttribute("position", new T3.Float32BufferAttribute(P, 3)); g.setAttribute("uv", new T3.Float32BufferAttribute(UV, 2)); g.setIndex(I); return costura(g) }
  // tubo vertical (de y0 hacia abajo, largo len): fn(v, th) → [rx, rz, dz, dx, dy]
  const tubo = (y0, len, nU, nV, fn, o) => loft(nU, nV, (u, v) => { const th = u * TAU, r = fn(v, th); return [Math.sin(th) * r[0] + (r[3] || 0), y0 - v * len + (r[4] || 0), Math.cos(th) * r[1] + (r[2] || 0)] }, o);
  // tubo sobre una curva con radio variable rad(v)
  function tuboCurva(pts, nU, nV, rad) { const cv = new T3.CatmullRomCurve3(pts), F = cv.computeFrenetFrames(nV, false);
    return loft(nU, nV, (u, v) => { const j = Math.round(v * nV), p = cv.getPointAt(v), th = u * TAU, r = rad(v), N = F.normals[j], B = F.binormals[j], c = Math.cos(th), s = Math.sin(th);
      return [p.x + r * (c * N.x + s * B.x), p.y + r * (c * N.y + s * B.y), p.z + r * (c * N.z + s * B.z)] }) }
  function fusionar(L) { const P = [], N = [], UV = [], I = []; let o = 0;
    L.forEach(g => { const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv; for (let i = 0; i < p.count; i++) { P.push(p.getX(i), p.getY(i), p.getZ(i)); N.push(n.getX(i), n.getY(i), n.getZ(i)); UV.push(uv ? uv.getX(i) : 0, uv ? uv.getY(i) : 0) }
      const ix = g.index.array; for (let i = 0; i < ix.length; i++) I.push(ix[i] + o); o += p.count });
    const g = new T3.BufferGeometry(); g.setAttribute("position", new T3.Float32BufferAttribute(P, 3)); g.setAttribute("normal", new T3.Float32BufferAttribute(N, 3)); g.setAttribute("uv", new T3.Float32BufferAttribute(UV, 2)); g.setIndex(I); return g }

  // ---------- texturas pintadas en canvas
  const T_VENAS = tex(1024, 512, (c, w, h) => { const r = rnd(71); c.fillStyle = "#ffffff"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 300; i++) { const x = r() * w, y = r() * h, rr = 8 + r() * 70, k = r(), gr = c.createRadialGradient(x, y, 0, x, y, rr);
      gr.addColorStop(0, k < .45 ? "rgba(160,176,138,.26)" : k < .8 ? "rgba(255,252,232,.3)" : "rgba(150,128,140,.2)"); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(x - rr, y - rr, 2 * rr, 2 * rr) }
    const vena = (x, y, a, len, wd, d) => { c.strokeStyle = `rgba(${88 + r() * 24 | 0},${100 + r() * 20 | 0},${124 + r() * 24 | 0},${.22 + .14 * wd})`; c.lineWidth = wd; c.lineCap = "round"; c.beginPath(); c.moveTo(x, y);
      for (let i = 0; i < len; i++) { a += (r() - .5) * .55; x += Math.cos(a) * 4; y += Math.sin(a) * 4; c.lineTo(x, y); if (d < 3 && r() < .05) { c.stroke(); vena(x, y, a + (r() < .5 ? -1 : 1) * (.5 + r() * .7), len * .55 | 0, wd * .62, d + 1); c.beginPath(); c.moveTo(x, y) } } c.stroke() };
    for (let i = 0; i < 60; i++) vena(r() * w, r() * h, r() * 6.28, 30 + r() * 70 | 0, 1 + r() * 2.2, 0);
    for (let i = 0; i < 4000; i++) { c.fillStyle = r() < .5 ? "rgba(120,120,90,.07)" : "rgba(255,255,240,.08)"; c.fillRect(r() * w, r() * h, 1.5, 1.5) } });
  const T_VENAS_R = tex(512, 512, (c, w, h) => { c.drawImage(T_VENAS.image, 0, 0, w, h) }, [2, 3]);
  const T_POROS = tex(512, 512, (c, w, h) => { const r = rnd(5); c.fillStyle = "#808080"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) { c.fillStyle = r() < .55 ? "rgba(40,40,40,.25)" : "rgba(220,220,220,.18)"; c.beginPath(); c.arc(r() * w, r() * h, .6 + r() * 1.4, 0, 7); c.fill() }
    for (let i = 0; i < 40; i++) { c.strokeStyle = "rgba(200,200,200,.12)"; c.lineWidth = 2 + r() * 4; c.beginPath(); let x = r() * w, y = r() * h; c.moveTo(x, y); for (let k = 0; k < 20; k++) { x += (r() - .5) * 10; y += 6 + r() * 8; c.lineTo(x, y) } c.stroke() } }, [3, 3]);
  const T_LEVITA = tex(512, 512, (c, w, h) => { const r = rnd(9); c.fillStyle = "#1e1d21"; c.fillRect(0, 0, w, h);
    for (let i = -h; i < w; i += 3) { c.strokeStyle = (i / 3) % 2 ? "rgba(255,255,255,.028)" : "rgba(0,0,0,.12)"; c.lineWidth = 1.3; c.beginPath(); c.moveTo(i, 0); c.lineTo(i + h, h); c.stroke() }
    for (let i = 0; i < 70; i++) { const x = r() * w, y = r() * h, rr = 20 + r() * 90, gr = c.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, r() < .6 ? "rgba(74,70,54,.2)" : "rgba(0,0,0,.25)"); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(x - rr, y - rr, 2 * rr, 2 * rr) }
    for (let i = 0; i < 9; i++) { const x = r() * w, y = r() * h, pw = 26 + r() * 40, ph = 20 + r() * 40; c.fillStyle = r() < .5 ? "#27252a" : "#2a2722"; c.fillRect(x, y, pw, ph); c.strokeStyle = "rgba(120,110,90,.5)"; c.lineWidth = 1.5;
      for (let k = 0; k < (pw + ph) / 5; k++) { const t = k / ((pw + ph) / 5) * 4, side = Math.floor(t), f = t - side, px = side === 0 ? x + f * pw : side === 1 ? x + pw : side === 2 ? x + pw - f * pw : x, py = side === 0 ? y : side === 1 ? y + f * ph : side === 2 ? y + ph : y + ph - f * ph; c.beginPath(); c.moveTo(px - 2, py - 2); c.lineTo(px + 2, py + 2); c.stroke() } }
    for (let i = 0; i < 260; i++) { c.strokeStyle = "rgba(130,124,104,.08)"; c.lineWidth = 1; const x = r() * w, y = r() * h; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - .5) * 30, y + (r() - .5) * 8); c.stroke() }
    for (let i = 0; i < 26; i++) { const x = r() * w, y = r() * h; c.fillStyle = "rgba(214,206,170,.55)"; c.beginPath(); c.ellipse(x, y, 2 + r() * 5, 3 + r() * 6, 0, 0, 7); c.fill(); c.fillRect(x - 1, y, 2.5, 8 + r() * 26) } }, [3, 3]);
  const T_LEVITA_B = tex(512, 512, (c, w, h) => { const r = rnd(10); c.fillStyle = "#808080"; c.fillRect(0, 0, w, h);
    for (let i = -h; i < w; i += 3) { c.strokeStyle = (i / 3) % 2 ? "rgba(255,255,255,.18)" : "rgba(0,0,0,.25)"; c.lineWidth = 1.2; c.beginPath(); c.moveTo(i, 0); c.lineTo(i + h, h); c.stroke() }
    for (let i = 0; i < 60; i++) { c.strokeStyle = "rgba(0,0,0,.3)"; c.lineWidth = 1 + r() * 2; c.beginPath(); let x = r() * w, y = r() * h; c.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (r() - .5) * 30; y += (r() - .3) * 14; c.lineTo(x, y) } c.stroke() } }, [3, 3]);
  const T_CUERO = tex(512, 1024, (c, w, h) => { const r = rnd(12); c.fillStyle = "#3d2b1e"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 16000; i++) { c.fillStyle = r() < .6 ? "rgba(20,12,6,.18)" : "rgba(110,80,56,.12)"; c.fillRect(r() * w, r() * h, 2, 2) }
    for (let i = 0; i < 40; i++) { const x = r() * w, y = r() * h, rr = 30 + r() * 120, gr = c.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, r() < .5 ? "rgba(96,70,46,.35)" : "rgba(14,8,4,.4)"); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(x - rr, y - rr, 2 * rr, 2 * rr) }
    for (let i = 0; i < 55; i++) { const x = r() * w, y = r() * h * .9, rr = 4 + r() * 22; c.fillStyle = `rgba(${214 + r() * 20 | 0},${204 + r() * 20 | 0},${170 + r() * 20 | 0},${.55 + r() * .4})`; c.beginPath(); c.ellipse(x, y, rr, rr * (.6 + r() * .5), r() * 3, 0, 7); c.fill();
      let yy = y, xx = x, wd = rr * .5; while (wd > 1 && r() < .97) { yy += 3; xx += (r() - .5) * 1.5; wd *= .985; c.fillRect(xx - wd / 2, yy, wd, 3.2) } c.beginPath(); c.arc(xx, yy + 2, wd * 1.4 + 1, 0, 7); c.fill() }
    for (let i = 0; i < 14; i++) { c.fillStyle = "rgba(10,6,3,.6)"; c.beginPath(); c.ellipse(r() * w, r() * h, 3 + r() * 12, 3 + r() * 10, 0, 0, 7); c.fill() }
    for (let i = 0; i < 120; i++) { c.strokeStyle = "rgba(140,110,80,.2)"; c.lineWidth = 1; const x = r() * w, y = r() * h; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - .5) * 40, y + (r() - .5) * 20); c.stroke() } });
  const T_CUERO_R = tex(512, 1024, (c, w, h) => { const d = c.createImageData(w, h), s = T_CUERO.image.getContext("2d").getImageData(0, 0, w, h).data;
    for (let i = 0; i < w * h; i++) { const l = (s[i * 4] + s[i * 4 + 1] + s[i * 4 + 2]) / 3, v = l > 150 ? 70 : 205; d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255 } c.putImageData(d, 0, 0) });
  const T_GUANTE = tex(256, 256, (c, w, h) => { const r = rnd(14); c.fillStyle = "#1f1a17"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 3000; i++) { c.fillStyle = r() < .5 ? "rgba(0,0,0,.25)" : "rgba(90,74,60,.15)"; c.fillRect(r() * w, r() * h, 2, 1) }
    for (let i = 0; i < 30; i++) { c.strokeStyle = "rgba(110,92,74,.3)"; c.lineWidth = 1; const y = r() * h; c.beginPath(); c.moveTo(0, y); c.bezierCurveTo(w * .3, y + 6, w * .6, y - 6, w, y + 2); c.stroke() }
    for (let i = 0; i < 7; i++) { const x = r() * w, y = r() * h, rr = 5 + r() * 10; c.fillStyle = "#d9d2b4"; c.beginPath(); c.ellipse(x, y, rr, rr * .7, r() * 3, 0, 7); c.fill(); c.strokeStyle = "#0c0907"; c.lineWidth = 2.5; c.stroke() } }, [1, 2]);
  const T_PANT = tex(256, 256, (c, w, h) => { const r = rnd(15); c.fillStyle = "#1f1e22"; c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 2) { c.fillStyle = y % 4 ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.12)"; c.fillRect(0, y, w, 1) }
    for (let i = 0; i < 30; i++) { const x = r() * w, y = r() * h, rr = 10 + r() * 40, gr = c.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, "rgba(70,66,56,.18)"); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(x - rr, y - rr, 2 * rr, 2 * rr) } }, [2, 6]);
  const T_BOTA = tex(256, 256, (c, w, h) => { const r = rnd(16); c.fillStyle = "#17120e"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 80; i++) { c.strokeStyle = `rgba(${70 + r() * 30 | 0},${58 + r() * 20 | 0},48,.35)`; c.lineWidth = 1 + r() * 2; const x = r() * w, y = r() * h; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - .5) * 30, y + (r() - .5) * 12); c.stroke() }
    for (let i = 0; i < 20; i++) { const x = r() * w, y = r() * h, rr = 8 + r() * 26, gr = c.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, "rgba(90,78,64,.3)"); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(x - rr, y - rr, 2 * rr, 2 * rr) } }, [2, 2]);
  const T_MADERA = tex(128, 512, (c, w, h) => { const r = rnd(17); c.fillStyle = "#3b2a1c"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) { c.strokeStyle = r() < .5 ? "rgba(20,12,6,.35)" : "rgba(110,80,50,.25)"; c.lineWidth = 1 + r() * 2; const x = r() * w; c.beginPath(); c.moveTo(x, 0); for (let y = 0; y < h; y += 16) c.lineTo(x + Math.sin(y * .03 + i) * 3, y); c.stroke() }
    const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(10,6,3,.55)"); gr.addColorStop(.25, "rgba(10,6,3,0)"); c.fillStyle = gr; c.fillRect(0, 0, w, h) });
  const T_HIERRO = tex(256, 256, (c, w, h) => { const r = rnd(18); c.fillStyle = "#2a2725"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 50; i++) { const x = r() * w, y = r() * h, rr = 6 + r() * 30, gr = c.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, r() < .6 ? "rgba(104,60,30,.55)" : "rgba(10,8,8,.5)"); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(x - rr, y - rr, 2 * rr, 2 * rr) }
    for (let i = 0; i < 1500; i++) { c.fillStyle = r() < .5 ? "rgba(0,0,0,.35)" : "rgba(150,120,90,.15)"; c.fillRect(r() * w, r() * h, 2, 2) }
    for (let i = 0; i < 10; i++) { c.fillStyle = "rgba(220,212,180,.7)"; const x = r() * w, y = r() * h; c.beginPath(); c.ellipse(x, y, 3 + r() * 8, 2 + r() * 5, 0, 0, 7); c.fill(); c.fillRect(x - 1.5, y, 3, 6 + r() * 20) } });
  const T_NIEBLA = tex(256, 256, (c, w, h) => { const r = rnd(19); c.clearRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) { const x = w / 2 + (r() - .5) * w * .6, y = h / 2 + (r() - .5) * h * .4, rr = 20 + r() * 60, gr = c.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, "rgba(255,255,255,.16)"); gr.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = gr; c.fillRect(0, 0, w, h) } });
  const T_PUNTO = tex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(.4, "rgba(255,255,255,.5)"); gr.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = gr; c.fillRect(0, 0, w, h) });

  // ---------- materiales
  // piel de cera: clearcoat húmedo + brillo de borde (falso subsurface: la luz «se mete» por los bordes, tono verdoso)
  const conBorde = (m, col, k) => { m.onBeforeCompile = sh => { sh.uniforms.srRim = { value: new T3.Color(col).multiplyScalar(k) };
    sh.fragmentShader = "uniform vec3 srRim;\n" + sh.fragmentShader.replace("#include <opaque_fragment>", "outgoingLight += srRim * pow(1.0 - saturate(abs(dot(normal, normalize(vViewPosition)))), 2.2) * (0.18 + 2.2 * totalDiffuse);\n#include <opaque_fragment>") };
    m.customProgramCacheKey = () => "srRim" + col + k; return m };
  const pielM = (o = {}) => conBorde(new T3.MeshPhysicalMaterial({ color: "#e2ddc4", map: T_VENAS_R, roughness: .4, bumpMap: T_POROS, bumpScale: .9, clearcoat: .75, clearcoatRoughness: .3,
    sheen: .7, sheenColor: new T3.Color("#e2ecbc"), sheenRoughness: .45, emissive: "#1d1f14", emissiveIntensity: .35, ...o }), "#d4d8bc", .4);
  const M_PIEL = pielM(), M_CERA = pielM({ color: "#e8e2c2", roughness: .3, clearcoat: 1, clearcoatRoughness: .18, side: T3.DoubleSide });
  const M_CARA = conBorde(new T3.MeshPhysicalMaterial({ color: "#ffffff", vertexColors: true, map: T_VENAS, roughness: .38, bumpMap: T_POROS, bumpScale: .7, clearcoat: .8, clearcoatRoughness: .28,
    sheen: .6, sheenColor: new T3.Color("#ecebd4"), sheenRoughness: .4, emissive: "#1c1b14", emissiveIntensity: .3 }), "#d4d8bc", .45);
  const M_OJO = new T3.MeshStandardMaterial({ color: "#030303", roughness: 1, metalness: 0 });
  const M_BOCA = new T3.MeshStandardMaterial({ color: "#120807", roughness: .7 });
  const M_UNA = new T3.MeshPhysicalMaterial({ color: "#a89a6c", roughness: .35, clearcoat: .6 });
  const M_LEVITA = new T3.MeshPhysicalMaterial({ color: "#ffffff", map: T_LEVITA, bumpMap: T_LEVITA_B, bumpScale: 1.6, roughness: .93, sheen: .8, sheenColor: new T3.Color("#4a4a58"), sheenRoughness: .6, side: T3.DoubleSide });
  const M_CHALECO = new T3.MeshStandardMaterial({ color: "#2b2924", map: T_PANT, roughness: .9 });
  const M_PANT = new T3.MeshPhysicalMaterial({ color: "#ffffff", map: T_PANT, bumpMap: T_LEVITA_B, bumpScale: 1, roughness: .9, sheen: .5, sheenColor: new T3.Color("#3a3a44") });
  const M_CUERO = new T3.MeshStandardMaterial({ color: "#ffffff", map: T_CUERO, roughnessMap: T_CUERO_R, roughness: 1, bumpMap: T_CUERO, bumpScale: 1.2, side: T3.DoubleSide });
  const M_GUANTE = new T3.MeshStandardMaterial({ color: "#ffffff", map: T_GUANTE, roughness: .62, bumpMap: T_GUANTE, bumpScale: 1, side: T3.DoubleSide });
  const M_BOTA = new T3.MeshStandardMaterial({ color: "#ffffff", map: T_BOTA, roughness: .55, bumpMap: T_BOTA, bumpScale: 1.5 });
  const M_MADERA = new T3.MeshStandardMaterial({ color: "#ffffff", map: T_MADERA, roughness: .8, bumpMap: T_MADERA, bumpScale: 1 });
  const M_HIERRO = new T3.MeshStandardMaterial({ color: "#ffffff", map: T_HIERRO, roughness: .62, metalness: .65, bumpMap: T_HIERRO, bumpScale: 2 });

  // ---------- medidas (metros). Los de bloques miden ≈ 2,2
  const LT = 1.2, LS = 1.1, LA = .08, HIP = LT + LS + LA;   // muslo, canilla, tobillo → cadera a 2,38
  const PASO = 4 * (LT + LS) * Math.sin(.3);                 // metros por ciclo de dos pasos (≈ 2,7)
  const UA = .95, FA = .92;                                  // brazo y antebrazo (manos a la altura de las rodillas)
  const pieza = (geo, mat, par, x = 0, y = 0, z = 0, sombra = true) => { const m = new T3.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = sombra; m.receiveShadow = true; par.add(m); return m };
  const grupo = (par, x = 0, y = 0, z = 0) => { const g = new T3.Group(); g.position.set(x, y, z); par.add(g); return g };

  const g = new T3.Group(); g.name = "sallowR"; g.visible = false; scene.add(g);
  const cuerpo = grupo(g), caderas = grupo(cuerpo, 0, HIP, 0), pelvis = grupo(caderas), faldaG = grupo(caderas);
  const J = { muslo: [], rodilla: [], tobillo: [], hombro: [], codo: [], muneca: [], dedos: [[], []], pulgar: [], ojos: [] };

  // ---------- piernas: pantalón raído con arrugas en rodilla y tobillo, rodilla huesuda, bota gastada de punta larga
  const gMuslo = tubo(.08, LT + .08, 28, 44, (v, th) => { const y = v * (LT + .08), r = .09 - .024 * v + .013 * ex2(((v - .97) / .05) ** 2), w = .004 * Math.sin(th * 7 + y * 30) * S_(.75, 1, v) + .003 * Math.sin(th * 5 + y * 11); return [r + w, (r + w) * 1.08, .004 * Math.sin(y * 3)] });
  const gCanilla = tubo(.02, LS - .32, 26, 40, (v, th) => { const r = .066 - .016 * v + .014 * ex2((v / .06) ** 2) * Math.max(0, Math.cos(th)) ** 2, w = .003 * Math.sin(th * 6 + v * 25); return [r + w, (r + w) * 1.05, 0] });
  const gCana = tubo(-LS + .44, .46, 28, 30, (v, th) => { const r = .066 + .006 * v + .006 * ex2((v / .05) ** 2) + .0035 * Math.sin(v * 38 + Math.sin(th * 3) * 2) * S_(.2, .6, v), w = .002 * Math.sin(th * 9); return [r + w, (r + w) * 1.1, .006 * v] });
  const gPie = loft(28, 40, (u, v) => { const th = u * TAU, z = -.1 + v * .55, e = Math.pow(Math.sin(PI * Math.min(1, .04 + v * .96)), .3), w = (.058 + .012 * Math.sin(PI * v * .8) - .03 * S_(.6, 1, v)) * e, hh = (.14 - .09 * S_(0, .55, v)) * e,
    c = Math.cos(th), sy = c < 0 ? c * .35 : c, base = -LA + .035 + .03 * S_(.85, 1, v); return [Math.sin(th) * w, base + hh * .5 * sy + .01 * S_(.3, 0, v) * (c > 0 ? c : 0), z] });
  for (const s of [0, 1]) { const sg = s ? -1 : 1, M = grupo(caderas, sg * .135, 0, 0), R = grupo(M, 0, -LT, 0), T = grupo(R, 0, -LS, 0);
    pieza(gMuslo, M_PANT, M); pieza(gCanilla, M_PANT, R); pieza(gCana, M_BOTA, R); pieza(gPie, M_BOTA, T);
    J.muslo.push(M); J.rodilla.push(R); J.tobillo.push(T) }

  // ---------- torso: cintura de avispa, costillar estrecho, joroba; chaleco gastado debajo de la levita
  const torsoR = y => { const rx = y < .72 ? lerp(.15, .125, S_(0, .4, y)) + .04 * S_(.4, .72, y) : 0, rz = y < .72 ? lerp(.11, .09, S_(0, .4, y)) + .03 * S_(.4, .72, y) : 0; return [rx, rz] };
  const col1 = grupo(pelvis, 0, .02, 0), col2 = grupo(col1, 0, .72, 0);
  pieza(tubo(.8, .95, 30, 30, (v, th) => { const y = .8 - v * .95, [rx, rz] = torsoR(Math.max(0, y)); return [rx + .012, rz + .012, 0] }), M_CHALECO, col1);
  const pechoR = y => { const rx = .17 + .035 * S_(0, .3, y) - .0 * y, top = S_(.5, .7, y); return [lerp(rx, .07, top), lerp(.13 + .02 * S_(.1, .4, y), .06, top)] };
  pieza(tubo(.7, .78, 32, 34, (v, th) => { const y = .7 - v * .78, [rx, rz] = pechoR(y), joroba = Math.cos(th) < 0 ? -.04 * ex2(((y - .42) / .18) ** 2) * Math.cos(th) ** 2 : 0; return [rx, rz, -joroba * 0 + (Math.cos(th) < 0 ? -.03 * ex2(((y - .42) / .18) ** 2) : 0)] }), M_CHALECO, col2);
  // levita (arriba): abierta adelante, solapas que se doblan, hombros caídos y huesudos, joroba, arrugas
  pieza(tubo(.72, .98, 72, 44, (v, th) => { const y = .72 - v * .98, [rx, rz] = pechoR(Math.max(-.2, y)), hom = .1 * ex2(((y - .53) / .09) ** 2), c = Math.cos(th), sn = Math.sin(th);
    const gap = .34 - .08 * v, dg = Math.min(Math.abs(th - gap), Math.abs(th - (TAU - gap))), sol = .03 * ex2((dg / .25) ** 2) * S_(.62, .3, y) * S_(-.1, .15, y), arr = .005 * Math.sin(th * 11 + y * 18) + .004 * Math.sin(y * 40 + th * 3) * (c < 0 ? 1 : .3);
    const fuera = (th < gap || th > TAU - gap) ? -1 : 0;   // dentro del hueco del frente la levita «se dobla» hacia adentro (solapa)
    return [rx + .028 + hom * sn * sn + arr + sol + fuera * .02, rz + .03 + arr + sol * .6 + (c < 0 ? .035 * ex2(((y - .42) / .2) ** 2) : 0) + fuera * .03, 0] }), M_LEVITA, col2);
  // cuello alto de la levita, de pie detrás de la nuca, con el borde comido
  pieza(loft(40, 14, (u, v) => { const th = .9 + u * (TAU - 1.8), y = .58 + v * .3, r = .1 + .045 * v, fr = v > .85 ? -.012 * hsh(Math.floor(u * 40), 3, 1) : 0; return [Math.sin(th) * r, (1.16 - v) * 0 + y + fr, Math.cos(th) * r * 1.05 - .025 - .05 * v] }), M_LEVITA, col2);
  // levita (cintura) en col1, encima del chaleco
  pieza(tubo(.86, 1.0, 64, 30, (v, th) => { const y = .86 - v * 1.0, [rx, rz] = torsoR(Math.max(0, Math.min(.72, y))), gap = .4, dg = Math.min(Math.abs(th - gap), Math.abs(th - (TAU - gap))), sol = .015 * ex2((dg / .2) ** 2), arr = .004 * Math.sin(th * 9 + y * 22);
    const k = y > .72 ? pechoR(y - .72) : [rx, rz]; return [k[0] + .03 + sol + arr, k[1] + .035 + sol + arr, 0] }), M_LEVITA, col1);
  // delantal de cuero: peto sobre el pecho (col2) y pollera hasta las rodillas (faldaG), con tiras al cuello
  pieza(loft(20, 20, (u, v) => { const th = (u - .5) * .9, y = .52 - v * .62, R = pechoR(y)[1] + .045, w = .9 + .1 * v; return [Math.sin(th * w) * (pechoR(y)[0] + .02), y, Math.cos(th * w) * R] }), M_CUERO, col2);
  pieza(tuboCurva([new T3.Vector3(-.12, .5, .12), new T3.Vector3(-.09, .7, .03), new T3.Vector3(0, .74, -.08), new T3.Vector3(.09, .7, .03), new T3.Vector3(.12, .5, .12)], 6, 30, () => .008), M_CUERO, col2);

  // ---------- la falda de la levita (cuelga de la cadera hasta debajo de la rodilla): pliegues hondos que crecen hacia abajo, abierta
  // adelante, tajo atrás, ruedo deshilachado y jirones. Se deforma por cuadro con las piernas (ver faldaDeforma)
  const FALDA_L = 1.72;
  const gFalda = (() => { const r = rnd(33), FR = Array.from({ length: 121 }, () => .02 + .16 * r() ** 2.2);
    const body = loft(120, 56, (u, v) => { const gap = .22 + .5 * v, th = gap + u * (TAU - 2 * gap), y = .3 - v * (FALDA_L + .3), c = Math.cos(th), sn = Math.sin(th);
      const R0x = lerp(.2, .38, S_(.1, 1, v)), R0z = lerp(.15, .33, S_(.1, 1, v)), A = .004 + .034 * S_(.05, 1, v),
        plie = A * (Math.sin(th * 7 + 1.3 + v * .8) * .7 + Math.sin(th * 13 + .4) * .3) + (c < -.92 ? -.02 * v : 0), fr = S_(.93, 1, v) * FR[Math.round(u * 120)];
      return [sn * (R0x + plie), y - fr, c * (R0z + plie) - .02] }, { ru: 3, rv: 3 });
    // jirones que cuelgan del ruedo
    const tiras = []; for (let i = 0; i < 26; i++) { const gap = .72, th = gap + r() * (TAU - 2 * gap), L = .08 + r() * .22, wd = .015 + r() * .035, x0 = Math.sin(th) * .4, z0 = Math.cos(th) * .35 - .02, y0 = .3 - (FALDA_L + .3) - .02;
      tiras.push(loft(2, 8, (u, v) => { const tw = (u - .5) * wd, tx = Math.cos(th), tz = -Math.sin(th); return [x0 + tx * tw + Math.sin(th) * .01 * v, y0 - v * L, z0 + tz * tw + Math.cos(th) * .01 * v + .01 * Math.sin(v * 5 + i)] })) }
    return fusionar([body, ...tiras]) })();
  const FALDA = pieza(gFalda, M_LEVITA, faldaG); const FALDA_B = Float32Array.from(gFalda.attributes.position.array);
  const gDelantal = loft(24, 40, (u, v) => { const th = (u - .5) * (.95 + .25 * v), y = .3 - v * 1.45, R = .2 + .05 * v; return [Math.sin(th) * R * 1.15, y - (v > .96 ? .02 * hsh(Math.round(u * 24), 7, 7) : 0), Math.cos(th) * R + .01 + .005 * Math.sin(u * 20)] });
  const DELANTAL = pieza(gDelantal, M_CUERO, faldaG); const DELANTAL_B = Float32Array.from(gDelantal.attributes.position.array);
  pieza(tuboCurva([new T3.Vector3(-.22, .28, .1), new T3.Vector3(0, .3, -.19), new T3.Vector3(.22, .28, .1)], 6, 20, () => .01), M_CUERO, faldaG);

  // ---------- brazos (mangas con arrugas en el codo y puño deshilachado), muñeca de cera huesuda, mano enguantada rota
  const gManga = tubo(.08, UA + .1, 26, 40, (v, th) => { const y = v * (UA + .1) - .08, cap = Math.sqrt(cl01((y + .08) / .1)), r = (.066 - .01 * v) * (.35 + .65 * cap), w = .005 * Math.sin(th * 3 + y * 26) * ex2(((y - UA) / .16) ** 2) + .003 * Math.sin(th * 5 + y * 9);
    return [r + w, (r + w) * 1.05, 0] });
  const gAnte = (() => { const r = rnd(44), FR = Array.from({ length: 27 }, () => .01 + .06 * r() ** 2); return tubo(.03, FA - .03, 26, 40, (v, th) => { const r0 = .056 - .008 * v + .012 * S_(.85, 1, v), w = .004 * Math.sin(th * 4 + v * 30) * ex2((v / .2) ** 2) + .003 * Math.sin(th * 7 + v * 12);
    return [r0 + w, (r0 + w) * 1.05, 0, 0, -S_(.94, 1, v) * FR[Math.round(th / TAU * 26)]] }) })();
  const gMunecaPiel = tubo(.16, .22, 16, 16, (v, th) => { const r = .025 + .004 * Math.cos(th * 2) + .006 * ex2(((v - .7) / .1) ** 2); return [r, r * .8, 0] });
  // dedo: segmento con nudillo al principio y yema al final
  const gSeg = (L, r0, r1, yema) => tubo(.012, L + .012, 14, 18, (v, th) => { const y = v * (L + .012), r = lerp(r0, r1, v) + .0045 * ex2(((y - .012) / .016) ** 2) + (yema ? 0 : .003 * ex2(((y - L) / .012) ** 2)), cierre = yema ? Math.sqrt(cl01((1 - v) / .12)) : 1; return [r * cierre, r * cierre * .9, 0] });
  const gPalma = tubo(.0, .17, 22, 16, (v, th) => { const r = .022 + .004 * ex2(((v - .9) / .1) ** 2), w = .046 + .006 * v; return [r * .78, w, 0] });
  const gRotura = (r0) => { const r = rnd(r0 * 1e4 | 0), FR = Array.from({ length: 15 }, () => .003 + .02 * r()); return tubo(.0, .014, 14, 3, (v, th) => [r0 + .0012, (r0 + .0012) * .9, 0, 0, -v * FR[Math.round(th / TAU * 14)]]) };
  const DEDOS = [{ z: .034, m: 1, mat: [1, 1, 0] }, { z: .012, m: 1.08, mat: [1, 0, 0] }, { z: -.011, m: 1.0, mat: [1, 1, 0] }, { z: -.033, m: .84, mat: [1, 0, 0] }];
  const SEGL = [.15, .13, .11];
  for (const s of [0, 1]) { const sg = s ? -1 : 1, H = grupo(col2, sg * .25, .5, -.01), C = grupo(H, 0, -UA, 0), W = grupo(C, 0, -FA, 0);
    pieza(gManga, M_LEVITA, H); pieza(gAnte, M_LEVITA, C); pieza(gMunecaPiel, M_PIEL, W);
    const palma = pieza(gPalma, M_GUANTE, W, 0, -.035, 0);
    DEDOS.forEach((d, f) => { let par = W; const L = []; let y = -.2;
      for (let k = 0; k < 3; k++) { const G_ = grupo(par, 0, k ? -SEGL[k - 1] * d.m : y, k ? 0 : d.z); const r0 = .0125 - k * .0012, r1 = r0 - .0014, guante = d.mat[k];
        pieza(gSeg(SEGL[k] * d.m, r0, r1, k === 2), guante ? M_GUANTE : M_PIEL, G_);
        if (k > 0 && d.mat[k - 1] && !guante) pieza(gRotura(r0 + .002), M_GUANTE, G_, 0, .012, 0);
        if (k === 2) { const u = pieza(new T3.SphereGeometry(.009, 10, 8), M_UNA, G_, sg * .008, -SEGL[2] * d.m + .006, 0); u.scale.set(.35, 1.9, 1) }
        L.push(G_); par = G_ } J.dedos[s].push(L) });
    // pulgar: sale del costado delantero de la palma
    const P0 = grupo(W, -sg * .004, -.07, .05); P0.rotation.set(-.45, 0, -sg * .2); P0.userData.rest = [-.45, 0, -sg * .2]; const P1 = grupo(P0, 0, -.11, 0);
    pieza(gSeg(.11, .014, .0125, false), M_GUANTE, P0); pieza(gSeg(.1, .0125, .011, true), M_PIEL, P1); pieza(gRotura(.0145), M_GUANTE, P1, 0, .012, 0);
    { const u = pieza(new T3.SphereGeometry(.009, 10, 8), M_UNA, P1, sg * .008, -.094, 0); u.scale.set(.35, 1.9, 1) }
    J.pulgar.push([P0, P1]); J.hombro.push(H); J.codo.push(C); J.muneca.push(W) }

  // ---------- cuello largo con tendones y nuez; gotas de cera que bajan por él
  const cuello = grupo(col2, 0, .6, .05);
  pieza(tubo(.56, .66, 30, 40, (v, th) => { const y = .56 - v * .66, c = Math.cos(th), sn = Math.sin(th), ten = .009 * (ex2(((th - .62) / .22) ** 2) + ex2(((th - (TAU - .62)) / .22) ** 2)) * S_(.0, .3, y),
    nuez = .011 * ex2(((y - .25) / .05) ** 2) * Math.max(0, c) ** 6, r = .048 + .012 * S_(.4, .56, y) + .03 * S_(.1, -.1, y); return [r + ten, r * 1.05 + ten + nuez, .01] }), M_PIEL, cuello);
  const cabeza = grupo(cuello, 0, .52, 0); cabeza.scale.setScalar(1.15);
  { const r = rnd(91); for (let i = 0; i < 4; i++) { const th = (r() - .5) * 2.4 + (i % 3 === 0 ? PI : 0), y0 = .5 - r() * .05, y1 = y0 - .14 - r() * .26, R = .053, P = [];
    for (let k = 0; k <= 6; k++) { const y = lerp(y0, y1, k / 6), a = th + .05 * Math.sin(k * 1.7 + i); P.push(new T3.Vector3(Math.sin(a) * R, y, Math.cos(a) * R * 1.05 + .01)) }
    const r0 = .004 + r() * .004; pieza(tuboCurva(P, 8, 26, v => v < .82 ? r0 * (.55 + .45 * v) : r0 * 1.7 * Math.sqrt(Math.max(0, 1 - ((v - .9) / .1) ** 2))), M_CERA, cuello) } }

  // ---------- la cabeza: esfera deformada (alargada, calva, sin orejas), cuencas hundidas, pómulos, mejillas chupadas, nariz fina,
  // la sonrisa (surco + labios finos + línea oscura), gotas de cera del cráneo; color por vértice (cuencas, labios, surco, cera)
  const HCEN = [0, .19, .035], HS = [.124, .242, .148];
  const GOTAS = (() => { const r = rnd(57), L = []; for (let i = 0; i < 22; i++) { const lon = (r() - .5) * TAU, fr = Math.abs(lon) < .9, lat0 = .55 + r() * .4, lat1 = fr ? Math.max(.4, lat0 - .1 - r() * .25) : lat0 - .2 - r() * .7;
    L.push({ lon, lat0, lat1, w: .025 + r() * .03, h: .0035 + r() * .004 }) }
    L.push({ lon: .3, lat0: .45, lat1: .2, w: .03, h: .005 }, { lon: -.5, lat0: .1, lat1: -.35, w: .03, h: .004 }); return L })();
  const W_ = {};
  function cabezaPunto(dx, dy, dz) { let sx = HS[0], sy = HS[1], sz = HS[2];
    sx *= (1 - .37 * S_(-.05, -.95, dy)) * (1 - .1 * S_(.5, 1, dy)); sz *= dz > 0 ? 1 - .1 * S_(-.35, -1, dy) : 1.1 + .06 * S_(-.2, .5, dy);
    let x = dx * sx, y = dy * sy, z = dz * sz; const fr = S_(.05, .5, dz), ax = Math.abs(x), lon = Math.atan2(dx, dz), lat = Math.asin(Math.max(-1, Math.min(1, dy))); let d = 0;
    W_.cuenca = 0; W_.boca = 0; W_.labio = 0; W_.cera = 0; W_.nariz = 0; W_.ojera = 0;
    for (const s of [-1, 1]) { const ex = (x - s * .044) / .025, ey = (y - .03) / .02, rho = Math.sqrt(ex * ex + ey * ey); d -= .027 * ex2(rho * rho) * fr; d += .0035 * ex2(((rho - 1.35) / .28) ** 2) * fr;
      W_.cuenca = Math.max(W_.cuenca, ex2(rho * rho * .45) * fr); W_.ojera = Math.max(W_.ojera, ex2(((x - s * .046) / .03) ** 2 + ((y + .008) / .014) ** 2) * fr) }
    d += .009 * ex2(((y - .068) / .014) ** 2) * ex2((x / .075) ** 4) * fr;   // arco de las cejas (sin cejas)
    d -= .013 * ex2(((Math.abs(lon) - 1.12) / .3) ** 2) * ex2(((y - .07) / .055) ** 2);   // sienes hundidas
    d += .011 * ex2(((ax - .07) / .022) ** 2 + ((y + .022) / .018) ** 2) * fr;   // pómulos
    d -= .021 * ex2(((ax - .066) / .03) ** 2 + ((y + .1) / .042) ** 2) * fr;   // mejillas chupadas
    { const hN = .008 * S_(.03, -.03, y) * (1 - S_(-.07, -.09, y)) + .0045 * ex2(((y + .075) / .01) ** 2), wN = .006 + .006 * S_(0, -.07, y); d += hN * ex2((x / wN) ** 2) * fr;
      W_.nariz = ex2(((ax - .009) / .0045) ** 2 + ((y + .086) / .0035) ** 2) * fr; d -= .004 * W_.nariz }
    { const ym = -.152 + .052 * (x / .108) ** 2, env = S_(.114, .098, ax); d -= .015 * ex2(((y - ym) / .005) ** 2) * env * fr; d += .0011 * ex2(((y - ym - .006) / .003) ** 2) * env * fr + .0009 * ex2(((y - ym + .0065) / .0035) ** 2) * env * fr;
      d -= .006 * ex2(((ax - .108) / .006) ** 2 + ((y - ym) / .007) ** 2) * fr; W_.boca = ex2(((y - ym) / .0042) ** 2) * env * fr; W_.labio = (ex2(((y - ym - .0075) / .004) ** 2) + ex2(((y - ym + .008) / .0045) ** 2)) * env * fr }
    { const px = ax - .02, py = y + .085, t = cl01((px * .08 - py * .055) / (.08 * .08 + .055 * .055)), qx = px - .08 * t, qy = py + .055 * t; d -= .004 * ex2((qx * qx + qy * qy) / (.005 * .005)) * fr }   // surcos nariz-boca
    d += .012 * ex2((x / .03) ** 2 + ((y + .238) / .024) ** 2) * fr;   // mentón
    d += .004 * ex2(((Math.abs(lon) - PI / 2) / .28) ** 2 + (y / .05) ** 2);   // donde irían las orejas: piel lisa, un montículo de cera
    for (const G of GOTAS) { const lw = G.lon + .035 * Math.sin(lat * 22 + G.lon * 3), dl = Math.atan2(Math.sin(lon - lw), Math.cos(lon - lw)) * Math.cos(lat), on = S_(G.lat1 - .01, G.lat1 + .04, lat) * S_(G.lat0 + .12, G.lat0, lat);
      const k = G.h * ex2((dl / G.w) ** 2) * on + G.h * 1.9 * ex2((dl / (G.w * 1.35)) ** 2 + ((lat - G.lat1) / .035) ** 2); d += k; W_.cera = Math.max(W_.cera, k / G.h * .6) }
    d += .0022 * (fbm(x * 38, y * 38, z * 38) - .5);
    const n = Math.hypot(dx, dy, dz) || 1; return [HCEN[0] + x + dx / n * d, HCEN[1] + y + dy / n * d, HCEN[2] + z + dz / n * d] }
  const gCabeza = (() => { const geo = new T3.SphereGeometry(1, 200, 150), p = geo.attributes.position, C = new Float32Array(p.count * 3);
    const c0 = new T3.Color("#e6e1c8"), c1 = new T3.Color("#cfd0b0"), cS = new T3.Color("#3a322c"), cO = new T3.Color("#7e7068"), cM = new T3.Color("#140a08"), cL = new T3.Color("#9a847a"), cC = new T3.Color("#efe9cc"), cN = new T3.Color("#2a201c"), c = new T3.Color();
    for (let i = 0; i < p.count; i++) { const q = cabezaPunto(p.getX(i), p.getY(i), p.getZ(i)); p.setXYZ(i, q[0], q[1], q[2]);
      c.copy(c0).lerp(c1, .7 * S_(.4, .75, fbm(q[0] * 9, q[1] * 9, q[2] * 9))); c.lerp(cO, W_.ojera * .55); c.lerp(cS, Math.min(1, W_.cuenca * 1.05)); c.lerp(cL, Math.min(1, W_.labio) * .35); c.lerp(cC, Math.min(1, W_.cera) * .7); c.lerp(cN, Math.min(1, W_.nariz)); c.lerp(cM, Math.min(1, W_.boca));
      C[i * 3] = c.r; C[i * 3 + 1] = c.g; C[i * 3 + 2] = c.b }
    geo.setAttribute("color", new T3.BufferAttribute(C, 3)); return costura(geo) })();
  const CAB = pieza(gCabeza, M_CARA, cabeza);
  // punto de la superficie de la cara a la altura (x, y) (busca la dirección por iteración)
  function sobreCara(x, y) { let a = x / HS[0], b = (y - HCEN[1]) / HS[1], q; for (let k = 0; k < 10; k++) { const zz = Math.sqrt(Math.max(.02, 1 - a * a - b * b)); q = cabezaPunto(a, b, zz); a += (x - q[0]) / HS[0] * .8; b += (y - q[1]) / HS[1] * .8 } return new T3.Vector3(...q) }
  // ojos: chiquitos, negros, mate, hundidos en el fondo de la cuenca, con párpados de cera que se escurren
  for (const s of [1, -1]) { const p = sobreCara(s * .044, HCEN[1] + .03), e = pieza(new T3.SphereGeometry(.0125, 24, 18), M_OJO, cabeza, p.x, p.y, p.z - .0055, false); J.ojos.push(e);
    const lid = [], lid2 = []; for (let k = 0; k <= 8; k++) { const a = PI * (.08 + .84 * k / 8); lid.push(new T3.Vector3(p.x + Math.cos(a) * .0145, p.y + Math.sin(a) * .0118, p.z - .003 + .003 * Math.sin(a))); lid2.push(new T3.Vector3(p.x + Math.cos(a) * .0145, p.y - Math.sin(a) * .0105, p.z - .004)) }
    pieza(tuboCurva(lid, 8, 24, v => .0024 * Math.sin(PI * v) + .0008), M_CERA, cabeza); pieza(tuboCurva(lid2, 8, 24, v => .0018 * Math.sin(PI * v) + .0006), M_CERA, cabeza);
    // lágrima de cera que sale del lagrimal y baja por la mejilla
    const L = []; for (let k = 0; k <= 3; k++) { const yy = p.y - .013 - k * .005, xx = s * (.03 + .003 * k) ; const sp = sobreCara(xx, yy); L.push(sp.add(new T3.Vector3(0, 0, .0015))) }
    pieza(tuboCurva(L, 8, 30, v => v < .8 ? .0016 + .0008 * v : .0034 * Math.sqrt(Math.max(0, 1 - ((v - .88) / .12) ** 2))), M_CERA, cabeza) }
  // la sonrisa: una línea oscura finísima metida en el surco, de comisura a comisura
  { const L = []; for (let k = 0; k <= 24; k++) { const x = -.104 + .208 * k / 24, ym = HCEN[1] - .152 + .052 * (x / .108) ** 2; L.push(sobreCara(x, ym).add(new T3.Vector3(0, 0, -.0028))) }
    pieza(tuboCurva(L, 8, 80, v => .0042 * (.45 + .55 * Math.sin(PI * v) ** .3)), M_BOCA, cabeza, 0, 0, 0, false) }
  // gotas de cera colgando del mentón y de la mandíbula, solidificadas (estalactitas)
  { const r = rnd(29); [[.012, -.232, .035], [-.03, -.222, .045], [.064, -.196, .02]].forEach(([x, y, L0]) => {
      const p = sobreCara(x, HCEN[1] + y).add(new T3.Vector3(0, .004, -.012)), L = []; for (let k = 0; k <= 5; k++) L.push(new T3.Vector3(p.x + .003 * Math.sin(k + x * 40), p.y - L0 * k / 5, p.z - .004 * k / 5));
      const r0 = .006 + r() * .003; pieza(tuboCurva(L, 10, 26, v => v < .8 ? r0 * (1.4 - .5 * v) : r0 * 1.6 * Math.sqrt(Math.max(0, 1 - ((v - .89) / .11) ** 2))), M_CERA, cabeza) }) }

  // ---------- el frasco (vidrio con un recuerdo adentro: brillo pálido que respira) y el martillo enorme
  const FRASCO = new T3.Group(); FRASCO.visible = false;
  { const prof = [[0, -.06], [.038, -.06], [.044, -.05], [.046, .02], [.04, .04], [.026, .05], [.026, .062]].map(([x, y]) => new T3.Vector2(x, y));
    const m = new T3.Mesh(new T3.LatheGeometry(prof, 32), new T3.MeshPhysicalMaterial({ color: "#d8eee4", roughness: .08, transparent: true, opacity: .32, clearcoat: 1, side: T3.DoubleSide, depthWrite: false, emissive: "#9ec8b4", emissiveIntensity: .25 })); FRASCO.add(m);
    pieza(new T3.CylinderGeometry(.024, .022, .026, 16), new T3.MeshStandardMaterial({ color: "#5a4128", roughness: .9 }), FRASCO, 0, .07, 0);
    pieza(new T3.TorusGeometry(.027, .003, 6, 24), M_CERA, FRASCO, 0, .056, 0).rotation.x = PI / 2 }
  const FR_ALMA = new T3.Mesh(new T3.IcosahedronGeometry(.024, 3), new T3.MeshBasicMaterial({ color: "#e6fff2", transparent: true, opacity: .75, blending: T3.AdditiveBlending, depthWrite: false })); FRASCO.add(FR_ALMA);
  const FR_HALO = new T3.Sprite(new T3.SpriteMaterial({ map: T_PUNTO, color: "#bfe8d6", transparent: true, opacity: .55, blending: T3.AdditiveBlending, depthWrite: false })); FR_HALO.scale.setScalar(.34); FRASCO.add(FR_HALO);
  const FR_LUZ = new T3.PointLight("#cfeee0", 0, 3, 1.6); FRASCO.add(FR_LUZ);
  { const p0 = FR_ALMA.geometry.attributes.position; FR_ALMA.userData.base = Float32Array.from(p0.array) }
  const MARTILLO = new T3.Group(); MARTILLO.visible = false;   // el mango va por −z del grupo (agarre en el origen), la cabeza en la punta
  { const LM = 2.15, ag = .14;
    const mango = pieza(new T3.CylinderGeometry(.03, .034, LM, 14, 20), M_MADERA, MARTILLO, 0, 0, -(LM / 2 - ag)); mango.rotation.x = PI / 2;
    for (const z of [.05, -.05, -.6, -.62, -1.6]) { const b = pieza(new T3.CylinderGeometry(.037, .037, .03, 14), M_HIERRO, MARTILLO, 0, 0, z); b.rotation.x = PI / 2 }
    const hg = new T3.BoxGeometry(.56, .25, .25, 10, 6, 6), hp = hg.attributes.position; for (let i = 0; i < hp.count; i++) { const x = hp.getX(i), y = hp.getY(i), z = hp.getZ(i), k = 1 - .1 * (Math.abs(y) > .1 && Math.abs(z) > .1 ? 1 : 0); hp.setXYZ(i, x * (1 + .06 * (Math.abs(x) > .26 ? 1 : 0)), y * k, z * k) } hg.computeVertexNormals();
    pieza(hg, M_HIERRO, MARTILLO, 0, 0, -(LM - ag - .05));
    for (const sx of [-1, 1]) pieza(new T3.CylinderGeometry(.14, .14, .03, 20), M_HIERRO, MARTILLO, sx * .29, 0, -(LM - ag - .05)).rotation.z = PI / 2;
    MARTILLO.userData.punta = new T3.Vector3(0, 0, -(LM - ag - .05)); MARTILLO.userData.LM = LM }

  // ---------- aura: niebla que se arrastra, moscas, polvo, luz fría desde abajo
  const AURA = grupo(g); AURA.visible = false;
  const NIEBLA = Array.from({ length: 18 }, (_, i) => { const s = new T3.Sprite(new T3.SpriteMaterial({ map: T_NIEBLA, color: "#6f7c88", transparent: true, opacity: .3, depthWrite: false, fog: true })); s.userData = { a: i * 2.4, r: .4 + (i * .37 % 1) * 2.8, sp: .05 + (i * .61 % 1) * .08, y: .15 + (i * .29 % 1) * .45, sc: 2.2 + (i * .43 % 1) * 2 }; AURA.add(s); return s });
  const MOSCAS = new T3.InstancedMesh(new T3.SphereGeometry(.006, 5, 4), new T3.MeshBasicMaterial({ color: "#050505" }), 34); MOSCAS.frustumCulled = false; AURA.add(MOSCAS);
  const POLVO = (() => { const N = 220, p = new Float32Array(N * 3); const geo = new T3.BufferGeometry(); geo.setAttribute("position", new T3.BufferAttribute(p, 3));
    const m = new T3.Points(geo, new T3.PointsMaterial({ map: T_PUNTO, color: "#c4d2dc", size: .03, transparent: true, opacity: .55, depthWrite: false, blending: T3.AdditiveBlending })); m.frustumCulled = false; AURA.add(m); return m })();
  const LUZ_FRIA = new T3.PointLight("#8fb6e6", 0, 9, 1.5); LUZ_FRIA.position.set(0, 1.9, 1.5); g.add(LUZ_FRIA);
  const LUZ_PIES = new T3.PointLight("#6f8fb8", 0, 6, 1.6); LUZ_PIES.position.set(0, .35, .9); g.add(LUZ_PIES);
  const _m4 = new T3.Matrix4(), _p = new T3.Vector3();
  function auraTick(t, k) { NIEBLA.forEach((s, i) => { const d = s.userData, a = d.a + t * d.sp * (i % 2 ? 1 : -1), rr = d.r + .35 * Math.sin(t * .2 + i); s.position.set(Math.cos(a) * rr, d.y + .06 * Math.sin(t * .5 + i), Math.sin(a) * rr + .3); s.scale.set(d.sc * 1.6, d.sc * .55, 1); s.material.rotation = .2 * Math.sin(t * .1 + i); s.material.opacity = .32 * k * (.7 + .3 * Math.sin(t * .3 + i * 1.7)) });
    g.updateMatrixWorld(true); const hc = g.worldToLocal(API.headW()), pc = g.worldToLocal(J.muneca[0].getWorldPosition(v4).clone());
    for (let i = 0; i < 34; i++) { const c = i < 8 ? hc : i < 22 ? pc : _p.set(0, 2.6, .15), f = 1.3 + (i * .37 % 1) * 2.4, ph = i * 2.1, rr = i < 14 ? .28 : .45;
      const x = c.x + Math.sin(t * f + ph) * rr + .05 * Math.sin(t * 13 + i), y = c.y + Math.sin(t * f * 1.37 + ph * 2) * rr * .6 + .03 * Math.sin(t * 17 + i * 3), z = c.z + Math.cos(t * f * .83 + ph) * rr + .04 * Math.sin(t * 11 + i * 5);
      _m4.makeTranslation(x, y, z); MOSCAS.setMatrixAt(i, _m4) } MOSCAS.instanceMatrix.needsUpdate = true;
    const P = POLVO.geometry.attributes.position; for (let i = 0; i < P.count; i++) { const a = i * 2.399, rr = .3 + (i * .618 % 1) * 2.6, h = ((i * .377 % 1) * 5 + t * (.03 + (i % 5) * .01)) % 5;
      P.setXYZ(i, Math.cos(a + t * .02) * rr + .1 * Math.sin(t * .3 + i), h, Math.sin(a + t * .02) * rr + .4) } P.needsUpdate = true; POLVO.material.opacity = .5 * k }

  // ---------- pose
  const REST = () => { cuerpo.position.set(0, 0, 0); cuerpo.rotation.set(0, 0, 0); caderas.position.set(0, HIP, 0); caderas.rotation.set(0, 0, 0); pelvis.rotation.set(.08, 0, 0); faldaG.rotation.set(0, 0, 0);
    col1.rotation.set(.14, 0, 0); col2.rotation.set(.34, 0, 0); cuello.rotation.set(.62, 0, 0); cabeza.rotation.set(0, 0, 0);
    for (const s of [0, 1]) { J.muslo[s].rotation.set(-.04, 0, 0); J.rodilla[s].rotation.set(.1, 0, 0); J.tobillo[s].rotation.set(-.06, 0, 0); J.hombro[s].rotation.set(0, 0, 0); J.codo[s].rotation.set(0, 0, 0); J.muneca[s].rotation.set(0, 0, 0); J.pulgar[s][0].rotation.set(...J.pulgar[s][0].userData.rest) }
    FRASCO.visible = false; MARTILLO.visible = false; ST.frasco = ST.martillo = false; ST.roll = 0 };
  const ST = { t: 0, frasco: false, martillo: false, roll: 0, aura: false };
  // el miembro (grupo cuyo «largo» va por −y local) apunta en la dirección dir del MUNDO
  function apuntarW(G, dir) { G.parent.updateWorldMatrix(true, false); G.parent.getWorldQuaternion(q1).invert(); v1.copy(dir).normalize().applyQuaternion(q1); G.quaternion.setFromUnitVectors(ABAJO, v1) }
  // IK de dos huesos: la muñeca va al punto T del mundo; el codo hacia «pole»
  function ik2(s, T, pole) { const H = J.hombro[s], C = J.codo[s]; H.updateWorldMatrix(true, false); const S0 = H.getWorldPosition(v2), d = v3.copy(T).sub(S0), D = Math.min(d.length(), (UA + FA) * .999), dn = d.normalize();
    const a = Math.acos(Math.max(-1, Math.min(1, (UA * UA + D * D - FA * FA) / (2 * UA * D)))), ax = v4.crossVectors(dn, pole).normalize(), up = dn.clone().applyAxisAngle(ax, a);
    apuntarW(H, up); C.rotation.set(0, 0, 0); C.updateWorldMatrix(true, false); const E = C.getWorldPosition(new T3.Vector3()); apuntarW(C, v1.copy(T).sub(E)) }
  // dedos: curl (rad) por segmento, con el giro hacia la palma de cada mano
  function dedos(s, curl, abre = 0) { const sg = s ? -1 : 1; J.dedos[s].forEach((L, f) => L.forEach((G_, k) => { const c = typeof curl === "function" ? curl(f, k) : curl; G_.rotation.set(0, 0, -sg * c); if (k === 0) G_.rotation.x = (f - 1.5) * .06 * (1 + abre * 2) }));
    J.pulgar[s][1].rotation.set(0, 0, -sg * (typeof curl === "function" ? curl(4, 1) : curl) * .6) }
  function dedosVivos(t, s, base = .22, amp = 1) { const ph = s * 3.1; dedos(s, (f, k) => { const w = .23 + f * .07 + s * .05, lento = Math.sin(t * w + f * 1.9 + ph) * .5 + Math.sin(t * w * 2.3 + f * 4.1 + k) * .25, tic = Math.max(0, Math.sin(t * .37 + f * 2.2 + ph)) ** 12 * .7;
    return base * (1 + .3 * k) + amp * (.22 * lento * (1 + .4 * k) - tic * (k === 0 ? 1 : -.4)) }) }
  // la cabeza mira con su +z según (pitch, roll) respecto de la raíz (no se mueve aunque el cuerpo se mueva)
  function cabezaNivel(pitch, roll = 0, yaw = 0) { g.updateMatrixWorld(true); g.getWorldQuaternion(q2); q2.multiply(new T3.Quaternion().setFromEuler(new T3.Euler(pitch, yaw, roll, "YXZ")));
    cabeza.parent.getWorldQuaternion(q1).invert(); cabeza.quaternion.copy(q1.multiply(q2)) }
  function brazosColgando(t, abre = .12) { g.updateMatrixWorld(true); g.getWorldQuaternion(q2);
    for (const s of [0, 1]) { const sg = s ? -1 : 1, dir = v3.set(sg * abre, -1, .1 + .02 * Math.sin(t * .2 + s)).applyQuaternion(q2); apuntarW(J.hombro[s], dir); J.codo[s].rotation.set(-.16, 0, 0); J.muneca[s].rotation.set(-.12, 0, sg * .06) } }
  // pies planos: el tobillo compensa lo que giran cadera, muslo y rodilla
  const piesPlanos = () => { for (const s of [0, 1]) J.tobillo[s].rotation.x = -(caderas.rotation.x + J.muslo[s].rotation.x + J.rodilla[s].rotation.x) + (J.tobillo[s].userData.extra || 0) };
  const extLeg = (f, k) => LT * Math.cos(f) + LS * Math.cos(f - k) + LA;   // alto vertical de una pierna (f = muslo adelante, k = rodilla)
  function faldaDeforma(t) { const fL = -J.muslo[0].rotation.x, fR = -J.muslo[1].rotation.x, kL = J.rodilla[0].rotation.x, kR = J.rodilla[1].rotation.x;
    faldaG.rotation.x = pelvis.rotation.x * .3 - .02;
    const def = (geo, B, frente) => { const P = geo.attributes.position.array; for (let i = 0; i < P.length; i += 3) { const x = B[i], y = B[i + 1], z = B[i + 2], dep = Math.max(0, -y + .1), wL = S_(-.12, .14, x), wR = 1 - wL;
        const f = wL * fL + wR * fR, k = wL * kL + wR * kR, pie = Math.min(dep, LT), canilla = Math.max(0, dep - LT);
        let dz = Math.sin(f) * pie + Math.sin(f - k) * canilla - Math.sin(f) * 0, adel = z > 0 ? 1 : .55; dz = (dz > 0 ? (frente ? 1.05 : adel) : (z < 0 ? 1 : .5)) * dz * .9;
        const sway = .012 * Math.sin(t * 1.1 + x * 7 + y * 2) * dep / FALDA_L; P[i] = x; P[i + 1] = y + Math.min(.3, dep * (1 - Math.cos(f)) * .5); P[i + 2] = z + dz + sway + (frente && dz > 0 ? .02 * S_(0, .5, f) : 0) } geo.attributes.position.needsUpdate = true; geo.computeVertexNormals() };
    def(FALDA.geometry, FALDA_B, false); def(DELANTAL.geometry, DELANTAL_B, true) }

  // ---------- API
  const API = { g, J, PASO,
    climas() { if (typeof ENV === "undefined") return; const E = {
        sallow: { top: "#080c13", hor: "#151c24", fog: .028, hemi: .42, hemiG: "#12100e", sun: .32, sunCol: "#8ea6c4", exp: 1.35, grade: ["#7f98a8", .08], sol: [.25, 1, .45], sombra: 40 },
        noche: { top: "#060a16", hor: "#18203a", fog: .014, hemi: .55, hemiG: "#18140e", sun: .85, sunCol: "#a8bce6", exp: 1.3, grade: ["#9ab0d0", .06], sol: [-.4, 1, .25], sombra: 60 } };
      for (const k in E) if (!ENV[k]) ENV[k] = E[k] },
    ocultar() { g.visible = false; AURA.visible = false; LUZ_FRIA.intensity = LUZ_PIES.intensity = 0; FR_LUZ.intensity = 0; ST.aura = false },
    poner(x, y, z, ry = 0) { g.visible = true; g.position.set(x, y, z); g.rotation.set(0, ry, 0); REST(); API.ocultarAura(); ST.t = 0; piesPlanos(); brazosColgando(0); dedosVivos(0, 0); dedosVivos(0, 1); cabezaNivel(.12); faldaDeforma(0) },
    ocultarAura() { AURA.visible = false; LUZ_FRIA.intensity = LUZ_PIES.intensity = 0; ST.aura = false },
    quieto(t) { ST.t = t; const b = Math.sin(t * .9) * .004; caderas.position.y = extLeg(.04, .1) + b * .3; col2.rotation.x = .34 + b; cuello.rotation.x = .62 - b * .5; piesPlanos();
      brazosColgando(t); dedosVivos(t, 0); dedosVivos(t, 1); cabezaNivel(.12 + .01 * Math.sin(t * .31), .015 * Math.sin(t * .17)); faldaDeforma(t) },
    andar(t, vel = .7) { ST.t = t; const ph = t * vel / PASO * TAU, A = .3;
      for (const s of [0, 1]) { const p = ph + s * PI, f = A * Math.sin(p), sw = Math.max(0, Math.cos(p)), k = .1 + .95 * sw ** 1.6 * S_(-.2, .3, Math.sin(p) + .3);
        J.muslo[s].rotation.x = -f; J.rodilla[s].rotation.x = k; J.tobillo[s].userData.extra = sw > .2 ? .25 * sw : 0 }
      caderas.position.y = Math.max(...[0, 1].map(s => extLeg(-J.muslo[s].rotation.x, J.rodilla[s].rotation.x)));
      caderas.rotation.y = .05 * Math.sin(ph); pelvis.rotation.y = -.05 * Math.sin(ph); piesPlanos(); for (const s of [0, 1]) J.tobillo[s].userData.extra = 0;
      brazosColgando(t, .1); dedosVivos(t, 0, .2, .6); dedosVivos(t, 1, .2, .6); cabezaNivel(.1); faldaDeforma(t) },
    ladear(u) { ST.roll = u; cuello.rotation.z += -u * .18; cabeza.rotateZ(-u * PI / 3 * .85); cabeza.rotateX(u * .12) },
    inclinarse(u, p) { if (!(u > 0)) return; u = eIO(cl01(u)); const T = new T3.Vector3(...p); g.updateMatrixWorld(true); const loc = g.worldToLocal(T.clone()), yaw = Math.max(-.9, Math.min(.9, Math.atan2(loc.x, loc.z)));
      const meta = T.y + .22;   // la cara queda un poco más arriba que lo que mira, encima
      const prueba = b => { const bend = Math.min(b, 1) * 1.22, cr = Math.max(0, b - .55) * 1.1; pelvis.rotation.set(.08 + bend * u, yaw * u * .6, 0); col1.rotation.x = .14 + .12 * b * u; col2.rotation.x = .34 + .1 * b * u; cuello.rotation.x = .62 + .3 * b * u;
        for (const s of [0, 1]) { J.muslo[s].rotation.x = -(.04 + .5 * cr) * u - .04 * (1 - u); J.rodilla[s].rotation.x = .1 + 1.05 * cr * u }
        caderas.position.y = extLeg(-J.muslo[0].rotation.x, J.rodilla[0].rotation.x); caderas.position.z = -.25 * cr * u; piesPlanos(); g.updateMatrixWorld(true); return API.headW().y };
      let lo = 0, hi = 1.5; for (let i = 0; i < 14; i++) { const m = (lo + hi) / 2; if (prueba(m) > meta) lo = m; else hi = m } prueba((lo + hi) / 2);
      brazosColgando(ST.t, .08); cabeza.lookAt(T); cabeza.rotateZ(-ST.roll * PI / 3 * .85 + .25 * u);
      // una mano abierta, encima de la cabeza del otro, con los dedos estirados
      const s = 0, M_ = new T3.Vector3(...p).add(new T3.Vector3(0, .55, 0)); ik2(s, M_.lerp(J.muneca[s].getWorldPosition(new T3.Vector3()), 1 - u), new T3.Vector3(0, -1, 0).applyQuaternion(g.quaternion).add(new T3.Vector3(.6, 0, 0).applyQuaternion(g.quaternion)));
      J.muneca[s].rotation.set(.5 * u, 0, -.3 * u); dedos(s, (f, k) => (.15 + .2 * k) * u + .05 * Math.sin(ST.t * (.5 + f * .2) + f), 1);
      if (ST.frasco) API.frasco(true); faldaDeforma(ST.t) },
    frasco(v) { ST.frasco = !!v; FRASCO.visible = !!v; FR_LUZ.intensity = v ? 1.6 : 0; if (!v) return; const s = 1, W = J.muneca[s], t = ST.t;
      J.hombro[s].rotation.set(-.85 - .05 * Math.sin(t * .3), 0, -.12); J.codo[s].rotation.set(-1.45, 0, 0); W.rotation.set(-.35, 1.2, .1);
      dedos(s, (f, k) => f === 0 || f === 1 ? [.05, .2, .25][k] : [.9, 1.1, .9][k] + .05 * Math.sin(t * .4 + f)); J.pulgar[s][0].rotation.set(-.1, 0, .6);
      const a = J.dedos[s][0][1], b = J.dedos[s][1][1]; if (FRASCO.parent !== W) W.add(FRASCO); W.updateMatrixWorld(true);
      const pa = W.worldToLocal(a.getWorldPosition(new T3.Vector3())), pb = W.worldToLocal(b.getWorldPosition(new T3.Vector3())); FRASCO.position.copy(pa).add(pb).multiplyScalar(.5).add(new T3.Vector3(0, -.03, 0)); FRASCO.rotation.set(0, 0, 0);
      W.getWorldQuaternion(q1).invert(); FRASCO.quaternion.copy(q1);   // el frasco queda derecho en el mundo
      const k = .85 + .15 * Math.sin(t * 2.1) + .05 * Math.sin(t * 7.3); FR_ALMA.scale.set(k, k * 1.25, k); FR_ALMA.rotation.y = t * .6; FR_HALO.material.opacity = .45 * k; FR_LUZ.intensity = 1.6 * k },
    martillo(v) { ST.martillo = !!v; MARTILLO.visible = !!v; if (!v) return; const s = 1, W = J.muneca[s]; if (MARTILLO.parent !== W) W.add(MARTILLO);
      // apoyado en el piso: mano adelante a ≈ 1,6 m, el mango baja derecho hasta la cabeza del martillo en el piso
      g.updateMatrixWorld(true); const sh = J.hombro[s].getWorldPosition(new T3.Vector3()), fw = new T3.Vector3(0, 0, 1).applyQuaternion(g.quaternion), side = new T3.Vector3(-1, 0, 0).applyQuaternion(g.quaternion);
      const T = sh.clone().addScaledVector(fw, .55).addScaledVector(side, .22); T.y = g.position.y + MARTILLO.userData.LM - .14 - .12 + .2;
      ik2(s, T, side.clone().add(new T3.Vector3(0, -.3, 0))); MARTILLO.position.set(.025, -.13, 0); W.updateMatrixWorld(true);
      W.getWorldQuaternion(q1).invert(); MARTILLO.quaternion.copy(q1).multiply(new T3.Quaternion().setFromUnitVectors(new T3.Vector3(0, 0, -1), new T3.Vector3(.08, -1, .1).normalize().applyQuaternion(g.quaternion)));
      dedos(s, (f, k) => [1.1, 1.4, 1.2][k]) },
    golpe(t, u) { ST.t = t; u = cl01(u); API.martillo(true); const s = 1, W = J.muneca[s];
      const key = [[0, -.5], [.35, -3.35], [.5, -3.45], [.62, -1.25], [.72, -1.05], [1, -1.15]]; let a = key[0][1]; for (let i = 1; i < key.length; i++) if (u <= key[i][0]) { const [u0, a0] = key[i - 1], [u1, a1] = key[i], k = (u - u0) / (u1 - u0); a = lerp(a0, a1, i === 3 ? k * k * k : eIO(k)); break } else a = key[i][1];
      const tem = .01 * Math.sin(t * 31) * S_(.3, .5, u) * (1 - S_(.5, .6, u)) + .03 * Math.sin(t * 40) * ex2(((u - .64) / .04) ** 2);
      J.hombro[s].rotation.set(a + tem, 0, .1); J.codo[s].rotation.set(-.25, 0, 0); W.rotation.set(-PI / 2 + .25, 0, 0);
      col2.rotation.x = .34 - .15 * S_(.1, .45, u) + .3 * S_(.5, .66, u); cuello.rotation.x = .62 + .1 * S_(.5, .66, u);
      MARTILLO.position.set(.025, -.13, 0); MARTILLO.quaternion.identity(); dedos(s, (f, k) => [1.1, 1.4, 1.2][k]);
      W.updateMatrixWorld(true); const pM = MARTILLO.localToWorld(new T3.Vector3(0, 0, -.32)); const side = new T3.Vector3(1, -.4, .3).applyQuaternion(g.quaternion);
      ik2(0, pM, side); J.muneca[0].rotation.set(-PI / 2 + .2, 0, 0); dedos(0, (f, k) => [1.1, 1.4, 1.2][k]); cabezaNivel(.15 + .2 * S_(.5, .66, u), ST.roll) },
    caer(u) { u = cl01(u); const paso = eIO(S_(0, .3, u)), c = S_(.25, 1, u), a = -(PI / 2 - .04) * c * c * (1 + .05 * Math.sin(c * PI));
      J.muslo[1].rotation.x = .38 * paso * (1 - c * .5); J.rodilla[1].rotation.x = .1 + .2 * paso * (1 - c); J.muslo[0].rotation.x = -.04 - .1 * paso * (1 - c);
      caderas.position.y = Math.max(extLeg(-J.muslo[0].rotation.x, J.rodilla[0].rotation.x), extLeg(-J.muslo[1].rotation.x, J.rodilla[1].rotation.x)); piesPlanos();
      // giro rígido alrededor del talón de atrás P = (0, 0, pz): pos = P − R·P (+ el espesor de la espalda al quedar acostado)
      const pz = -.15 - .45 * paso, sa = Math.sin(a), ca = Math.cos(a); cuerpo.rotation.set(a, 0, 0); cuerpo.position.set(0, pz * sa + .14 * (1 - ca), pz - pz * ca);
      for (const s of [0, 1]) { J.hombro[s].rotation.x += .25 * c; J.hombro[s].rotation.z += (s ? -1 : 1) * .18 * c } dedos(0, .5 + .4 * c); dedos(1, .5 + .4 * c); faldaDeforma(ST.t) },
    aura(on, k = 1) { ST.aura = !!on; AURA.visible = !!on; LUZ_FRIA.intensity = on ? 7 * k : 0; LUZ_PIES.intensity = on ? 4 * k : 0; if (!on) return; auraTick(ST.t, k);
      if (typeof velasHacia === "function") velasHacia(API.headW().toArray(), k) },
    headW() { CAB.updateWorldMatrix(true, false); return CAB.localToWorld(new T3.Vector3(HCEN[0], HCEN[1], HCEN[2])) },
    ojoW(lado = 1) { const e = J.ojos[lado > 0 ? 0 : 1]; e.updateWorldMatrix(true, false); return e.getWorldPosition(new T3.Vector3()) },
    ojoDir() { cabeza.updateWorldMatrix(true, false); return new T3.Vector3(0, 0, 1).applyQuaternion(cabeza.getWorldQuaternion(new T3.Quaternion())) },
    ojoCam(d = .08, lado = 1) { return API.ojoW(lado).addScaledVector(API.ojoDir(), d).toArray() },
    caraCam(d = 1, ang = 0, dy = 0) { const h = API.headW(), q = cabeza.getWorldQuaternion(new T3.Quaternion()), f = new T3.Vector3(Math.sin(ang), 0, Math.cos(ang)).applyQuaternion(q); return [h.x + f.x * d, h.y + f.y * d + dy, h.z + f.z * d] } };
  return API;
})();


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
// lugares (cambio de lugar = corte duro): adentro de la campana, la ciudad, la tienda de Sallow, la casa de Nell, la cadena
const LUGAR = L => (L <= I.open || (L >= I.inside && L <= I.fell) || L === I.stay) ? "dentro"
  : (L >= I.sallow && L <= I.smile) || L === I.boots ? "tienda" : (L === I.work || (L >= I.found && L <= I.hired) || L === I.faces) ? "trastienda"
  : (L >= I.nell && L <= I.sir) ? "casa" : (L === I.chain || (L >= I.climb && L <= I.clouds) || L >= I.nightly) ? "cadena" : "ciudad";
const PISO = (x, z) => sueloB(x, z);
const ponerP = (k, x, z, ry = 0) => { k.g.visible = true; k.g.position.set(x, PISO(x, z), z); k.g.rotation.set(0, ry, 0) };
const enAire = (k, p, ry = 0) => { k.g.visible = true; k.g.position.set(p[0], p[1], p[2]); k.g.rotation.set(0, ry, 0) };
const ryA = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);
const P2 = a => a.length === 3 ? [a[0], a[2]] : a;


// ---------- planos: cada frase tiene una lista de tomas; cada toma empieza en una palabra (w) y la cámara se mueve todo el tiempo (p→p1, l→l1)
// barrido de 0,2 s entre tomas del mismo lugar; corte seco cuando cambia el lugar. f = fov (gran angular en los primeros planos)
const sh = (w, p, p1, l, l1, f = 55, o = {}) => ({ w, p, p1: p1 || p, l, l1: l1 || l, f, ...o });
const add = (a, b) => a.map((v, i) => v + b[i]);
// primeros planos a partir de la cara: la cámara se pone delante de la cabeza (ang gira alrededor, dy sube) y se acerca de d0 a d1
const headW = k => { k.g.updateMatrixWorld(true); const q = k.head.getWorldQuaternion(new THREE.Quaternion()); return k.head.getWorldPosition(new THREE.Vector3()).addScaledVector(new THREE.Vector3(0, 1, 0).applyQuaternion(q), .38 * k.body.scale.y * k.g.scale.y) };
const fwdW = (k, ang) => new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang)).applyQuaternion(k.head.getWorldQuaternion(new THREE.Quaternion()));
const shF = (w, k, d0, d1, ang = 0, dy = 0, f = 62, ldy = 0, o = {}) => { const P = d => () => { const h = headW(k), v = fwdW(k, ang); return [h.x + v.x * d, h.y + v.y * d + dy, h.z + v.z * d] }, Lk = () => { const h = headW(k); return [h.x, h.y + ldy, h.z] }; return sh(w, P(d0), P(d1), Lk, Lk, f, o) };
let t_ = 0;
let TAPON_P = [0, 1.2, 0]; const taponW = () => TAPON_P;
const KW = (k, o) => () => add(k.g.getWorldPosition(new THREE.Vector3()).toArray(), o);
const HDc = k => () => add(headW(k).toArray(), [0, -.3, 0]);
// frente de la cabeza de un personaje: a d metros delante de la cara, dy arriba, lat al costado
const FR = (k, d0 = 1.4, dy = 0, lat = 0) => () => { const d = d0 * 2.1, h = headW(k), a = k.g.rotation.y; return [h.x + Math.sin(a) * d + Math.cos(a) * lat, h.y + dy, h.z + Math.cos(a) * d - Math.sin(a) * lat] };
const SRH = (o = [0, 0, 0]) => () => add(sallowR.headW().toArray(), o);
const SRC = (d = 1.25, ang = 0, dy = 0) => () => sallowR.caraCam(d, ang, dy);
const CC = (n, k = "p") => () => { const c = CAMS_CAMPANA[n]; return typeof c[k] === "function" ? c[k]() : c[k] };
const PW = (x, y, z) => () => plataformaW(x, y, z);
const TIx = k => TI.P[k];
const TIo = (k, o = [0, 0, 0]) => () => add(TIx(k), o);
const RC = RISCO_CIMA, PE = PRIMER_ESLABON;
// la cadena del este: punto de trepada y su marco
const TREPA = u => cadenaMarco("este", u);
const enCadena = (u, o = [0, 0, 0]) => () => { const m = TREPA(u); return [m.p[0] + m.n[0] * o[0] + m.lado[0] * o[1], m.p[1] + o[2], m.p[2] + m.n[2] * o[0] + m.lado[2] * o[1]] };
const U_TREPA = { climb: .03, links: .08, clouds: .2 };
const SHOTS = {
  // ---- adentro de la campana (gancho del arranque)
  [I.open]: [sh(0, PW(-5.5, 3.2, 4), PW(-5, 3, 3.6), PW(1, 1.6, 0), null, 62),
    sh(5, FR(ME, 1.6, .1, .3), FR(ME, 1.4, .05, .2), HDc(ME), null, 50, { tr: "barrido" })],
  // ---- la ciudad al mediodía: la campana, las cadenas, la sombra
  [I.rule]: [sh(0, CC("aereaDia"), () => add(CAMS_CAMPANA.aereaDia.p, [20, -10, -20]), CC("aereaDia", "l"), null, 50)],
  [I.cost]: [sh(0, [7.5, 1.7, 9.5], [7, 1.8, 9], [0, 3, -2], null, 56), sh(3, FR(VECINOS[0], 1.3, .1), FR(VECINOS[0], 1.15, .05), HDc(VECINOS[0]), null, 46, { tr: "barrido" })],
  [I.nobody]: [sh(0, [0, 1.7, 19], [0, 1.8, 18], [0, 60, 40], null, 64)],
  [I.hangs]: [sh(0, CC("aerea"), () => add(CAMS_CAMPANA.aerea.p, [-30, 10, -10]), CC("aerea", "l"), null, 50), sh(9, [40, 30, 120], [30, 34, 112], [0, 150, -10], null, 56, { tr: "barrido" })],
  [I.shadow]: [sh(0, [-60, 80, 140], [-50, 82, 130], [0, 0, 0], null, 52)],
  // ---- la Larga Noche se prepara (atardecer): la plaza tapándose los oídos, la boda, los bebés, la escuela, la fuente
  [I.plug]: [sh(0, [9, 3.2, 12], [8, 3.4, 11], [0, 1.5, 0], null, 58), sh(6, FR(VECINOS[1], 1.3, .05, .2), FR(VECINOS[1], 1.15, .05, .1), HDc(VECINOS[1]), null, 46, { tr: "barrido" })],
  [I.wed]: [sh(0, () => { const c = P2(LUGARES_GENTE.altar.centro); return [2 * c[0] + 1.2, PISO(c[0], c[1]) + 1.9, 2 * c[1] - 6.2] }, () => { const c = P2(LUGARES_GENTE.altar.centro); return [2 * c[0] + 1.4, PISO(c[0], c[1]) + 1.95, 2 * c[1] - 6.6] }, () => { const c = P2(LUGARES_GENTE.altar.centro); return [c[0], PISO(c[0], c[1]) + 1.4, c[1]] }, null, 54)],
  [I.babies]: [sh(0, FR(MADRES[0], 1.6, -.1, .3), FR(MADRES[0], 1.4, -.1, .2), () => add(headW(MADRES[0]).toArray(), [0, -.4, 0]), null, 50)],
  [I.school]: [sh(0, [-7.6, 1.6, -5.4], [-7.9, 1.65, -5.8], [-12.6, 1.7, -9.8], null, 55)],
  [I.sign]: [sh(0, [1.2, 1.3, 9.6], [.5, 1.25, 9], [0, 1.1, 4.2], null, 50)],
  // ---- Mister Sallow en su tienda (clima sombrío)
  [I.sallow]: [sh(0, [4.5, 1.2, -8.5], [4, 1.3, -9.2], SRH([0, -1.6, 0]), null, 62), sh(5, SRC(2.4, .5, -.3), SRC(2.1, .4, -.3), SRH([0, -.2, 0]), null, 48, { tr: "barrido" })],
  [I.never]: [sh(0, SRC(1.1, -.6, 0), SRC(1, -.55, 0), SRH(), null, 42)],
  [I.price]: [sh(0, [3.6, 2.2, -10], [3.3, 2.3, -10.4], () => { const p = VECINOS[12].g.position; return [p.x - .2, p.y + 2.4, p.z - .8] }, null, 54),
    sh(6, () => { const p = VECINOS[12].g.position; return [p.x + 4.4, p.y + 2, p.z + 1.8] }, () => { const p = VECINOS[12].g.position; return [p.x + 4, p.y + 2.1, p.z + 2.3] }, () => add(headW(VECINOS[12]).toArray(), [-.3, 1, -1]), null, 58, { tr: "barrido" })],
  [I.shop]: [sh(0, [6, 2.2, -4], [5.4, 2.3, -4.6], [0, 4, -17], null, 58)],
  [I.candles]: [sh(0, [-3.5, .9, -9], [-3, 1, -9.6], SRH([0, -2, 0]), null, 56)],
  [I.name]: [sh(0, [2.9, 1.5, -8.2], [2.8, 1.55, -8.4], SRH([0, -.3, 0]), null, 54)],
  [I.smile]: [sh(0, SRC(2.4, 0, -.2), SRC(2.1, .15, -.2), SRH([0, -.3, 0]), null, 50), sh(6, SRC(2.2, .5, -.3), SRC(2, .35, -.3), SRH([0, -.2, 0]), null, 46, { tr: "barrido" })],
  // ---- la trastienda
  [I.work]: [sh(0, [-3.4, 2.6, -20.6], [-3.2, 2.65, -20.9], () => add(TIx("olla"), [0, .9, 0]), null, 64), sh(4, () => { const h = headW(ME); return [.6 + (h.x - .6) * .35, 2.1, -20.4 + (h.z + 20.4) * .35] }, () => { const h = headW(ME); return [.6 + (h.x - .6) * .45, 2.1, -20.4 + (h.z + 20.4) * .45] }, HDc(ME), null, 52, { tr: "barrido" })],
  // ---- la casa de Nell (noche cálida)
  [I.nell]: [sh(0, () => CASA_NELL_V.ventana.map((v, i) => v + [-.6, -.35, -.8][i]), () => CASA_NELL_V.ventana.map((v, i) => v + [-.4, -.35, -.6][i]), HDc(NELL), null, 50)],
  [I.say]: [sh(0, FR(NELL, .55, .05, 0), FR(NELL, .5, .05, 0), HDc(NELL), null, 52), sh(9, FR(ME, 1.0, .35, 0), FR(ME, .92, .35, 0), HDc(ME), null, 50, { tr: "barrido" })],
  [I.last]: [sh(0, FR(ME, 1.0, .35, .1), FR(ME, .92, .35, .05), () => add(headW(ME).toArray(), [0, -.4, 0]), null, 54)],
  [I.forgot]: [sh(0, FR(NELL, .55, 0, 0), FR(NELL, .5, 0, 0), HDc(NELL), null, 52)],
  [I.sir]: [sh(0, FR(ME, 1.0, .35, 0), FR(ME, .92, .35, 0), HDc(ME), null, 50)],
  // ---- lo que encontró en la trastienda
  [I.found]: [sh(0, [-3.2, 1.25, -20.4], [-3.25, 1.2, -20.6], [-3.45, .7, -21.4], null, 45)],
  [I.hole]: [sh(0, FR(ME, 1.2, .05, .25), FR(ME, 1.05, .05, .2), HDc(ME), null, 46)],
  [I.ledger]: [sh(0, TIo("libro", [.3, .55, .45]), TIo("libro", [.25, .5, .38]), TIo("libro"), null, 40)],
  [I.workers]: [sh(0, [-3.4, 2.6, -20.6], [-3.2, 2.6, -20.8], [0, 1.6, -25], null, 66), sh(14, [-3.6, 2.4, -21.6], [-3.4, 2.45, -21.9], [0, 2, -24.5], null, 70, { tr: "barrido" })],
  [I.hired]: [sh(0, [-3.4, 2.6, -20.6], [-3.2, 2.6, -20.8], HDc(ME), null, 62)],
  // ---- la cadena del este y las botas
  [I.chain]: [sh(0, CC("primerEslabon"), () => add(CAMS_CAMPANA.primerEslabon.p, [3, 1, -2]), CC("primerEslabon", "l"), null, 55), sh(4, () => add(PE, [-16, 8, 12]), () => add(PE, [-15, 8.8, 13]), () => add(PE, [0, 3, 0]), null, 55, { tr: "barrido" })],
  [I.boots]: [sh(0, () => add(sallowR.g.position.toArray(), [3.6, .4, 3.6]), () => add(sallowR.g.position.toArray(), [3.1, .45, 4]), () => add(sallowR.g.position.toArray(), [0, 2.2, 0]), null, 66)],
  // ---- esta noche: los tapones nuevos de Nell
  [I.tonight]: [sh(0, FR(NELL, .9, .2, -.6), FR(NELL, .82, .2, -.5), () => add(headW(NELL).toArray(), [0, -.4, 0]), null, 54)],
  [I.needle]: [sh(0, FR(ME, 1.0, .1, 0), FR(ME, .92, .1, 0), HDc(ME), null, 50)],
  [I.nobodyleft]: [sh(0, FR(NELL, .85, 0, 0), FR(NELL, .78, 0, 0), HDc(NELL), null, 50)],
  // ---- la trepada
  [I.climb]: [sh(0, () => add(RC, [-6, 2.5, 5]), () => add(RC, [-5.5, 2.7, 4.5]), () => add(RC, [-1, 1.5, 0]), null, 58), sh(10, enCadena(.05, [7, 5, 2]), enCadena(.055, [6.5, 4.5, 2.4]), () => ME.g.getWorldPosition(new THREE.Vector3()).toArray(), null, 56, { tr: "barrido" })],
  [I.links]: [sh(0, enCadena(.09, [12, 9, -4]), enCadena(.095, [11, 8.5, -3]), () => add(ME.g.getWorldPosition(new THREE.Vector3()).toArray(), [0, 1.5, 0]), null, 58)],
  [I.clouds]: [sh(0, enCadena(.2, [9, 7, 10]), enCadena(.21, [8.5, 6.5, 11]), () => ME.g.getWorldPosition(new THREE.Vector3()).toArray(), null, 58), sh(5, enCadena(.22, [7, 4, 6]), enCadena(.22, [7, 4.4, 5.4]), () => ME.g.getWorldPosition(new THREE.Vector3()).toArray(), null, 62, { tr: "barrido" })],
  // ---- adentro de la campana
  [I.inside]: [sh(0, CC("dentro"), () => add(CAMS_CAMPANA.dentro.p, [-.5, .3, .4]), HDc(ME), null, 68)],
  [I.noclapper]: [sh(0, CC("dentro"), () => add(CAMS_CAMPANA.dentro.p, [.4, .3, -.3]), () => add(headW(ME).toArray(), [0, 1.2, 0]), null, 70)],
  [I.hammer]: [sh(0, PW(-5.5, 1.2, 3.8), PW(-5, 1.3, 3.4), SRH([0, -1.8, 0]), null, 64), sh(5, () => add(sallowR.g.position.toArray(), [-3.6, 1, 3.6]), () => add(sallowR.g.position.toArray(), [-3.1, 1.1, 3.9]), () => add(sallowR.g.position.toArray(), [0, 2, 0]), null, 62, { tr: "barrido" })],
  [I.smiled]: [sh(0, SRC(2.6, 0, -.3), SRC(2.3, -.15, -.3), SRH([0, -.4, 0]), null, 52), sh(4, () => add(sallowR.g.position.toArray(), [-3.2, 1.2, 3.4]), () => add(sallowR.g.position.toArray(), [-2.6, 1.3, 3.6]), SRH([0, -1, 0]), null, 56, { tr: "barrido" })],
  [I.pour]: [sh(0, FR(ME, 1.6, .7, .7), FR(ME, 1.45, .7, .6), HDc(ME), null, 54), sh(7, () => add(interior().vuelca, [3.2, 1.6, 3.2]), () => add(interior().vuelca, [2.9, 1.4, 2.9]), () => interior().vuelca, null, 56, { tr: "barrido" })],
  [I.swing]: [sh(0, () => add(sallowR.g.position.toArray(), [-4, .6, 3.4]), () => add(sallowR.g.position.toArray(), [-3.5, .5, 3.9]), () => add(sallowR.g.position.toArray(), [0, 2.4, 0]), null, 66)],
  [I.thud]: [sh(0, CC("dentroPlataforma"), () => add(CAMS_CAMPANA.dentroPlataforma.p, [0, -1, 0]), CC("dentroPlataforma", "l"), null, 56, { shake: .08 })],
  [I.first]: [sh(0, CC("dentroLabio"), () => add(CAMS_CAMPANA.dentroLabio.p, [0, .4, 0]), CC("dentroLabio", "l"), null, 70)],
  [I.fell]: [sh(0, PW(-3, 1.6, -4.5), PW(-2.8, 1.7, -4.3), SRH([0, -1, 0]), null, 60), sh(6, PW(-6.2, 3, -3), PW(-6.2, 3.2, -2.8), () => sallowR.headW().toArray(), null, 70, { tr: "barrido" })],
  // ---- abajo: la ciudad que se enciende, los trabajadores recuperan la cara
  [I.below]: [sh(0, [0, 40, 75], [0, 44, 70], [0, 0, 0], null, 55)],
  [I.faces]: [sh(0, [.6, 2.2, -20.4], [.3, 2.2, -21], [-1, 1.4, -26], null, 64), sh(9, [-3.4, 2.6, -20.6], [-3.2, 2.6, -20.8], [0, 2, -24.5], null, 70, { tr: "barrido" })],
  [I.stay]: [sh(0, FR(ME, 1.6, .2, .5), FR(ME, 1.45, .2, .4), HDc(ME), null, 54)],
  // ---- el final: Nell en el primer eslabón
  [I.nightly]: [sh(0, () => add(RC, [-2, 1.8, -2]), () => add(RC, [-1.6, 2, -2.4]), HDc(NELL), null, 58)],
  [I.end]: [sh(0, FR(NELL, 1.4, .5, 1.1), FR(NELL, 1.3, .45, 1), HDc(NELL), null, 52), sh(5, FR(NELL, 1.5, -.3, .9), FR(NELL, 1.4, -.35, .8), () => add(headW(NELL).toArray(), [0, .7, 0]), null, 68, { tr: "barrido" })],
};
Object.values(SHOTS).forEach(L => L.forEach(x => { x.tr = x.tr || "barrido"; x.lat = x.lat ?? .35 }));

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
// Cámara con las transiciones medidas en Volze (referencia/estilo-volze-medido.md), sin atravesar nada (pedido del dueño):
//  - "vuelo"   la cámara vuela de una toma a la otra en arco, por encima de los techos (8–27 cuadros a 30 fps, poco desenfoque)
//  - "barrido" giro rápido en el lugar (≈ 7 cuadros, desenfoque fuerte, frena sin rebote)
//  - "tapa"    algo cruza por delante del lente y lo tapa 3–4 cuadros (un paño, arena, la piel de la bestia): se sale en la toma nueva
//  - "sigue"   reencuadre continuo, sin transición
// Cada toma lo elige con { tr: "vuelo" | "barrido" | "tapa" | "sigue", col: "#c9a36a" } (cómo se ENTRA a esa toma). Sin `tr`, se decide
// por la distancia. Dentro de la toma la cámara entra ya en movimiento (recorrido lineal p → p1) y nunca queda quieta.
const V_ = (...a) => new THREE.Vector3(...a);
const bez3 = (p0, p1, p2, p3, e) => { const u = 1 - e; return p0.clone().multiplyScalar(u * u * u).add(p1.clone().multiplyScalar(3 * u * u * e)).add(p2.clone().multiplyScalar(3 * u * e * e)).add(p3.clone().multiplyScalar(e * e * e)) };
// Dentro de cada toma: menos empuje hacia adelante (Volze: ≈ +8 % por segundo) y más desplazamiento de costado (≈ 24 % del ancho
// por segundo): se recorre el 55 % del camino p → p1 y se suma una órbita lateral proporcional a la distancia al sujeto.
function camO(T, q) { const c = camAt(T, .45 + .55 * q); if (T.s.fijo) return c; const p = V_(...c.p), l = V_(...c.l), v = l.clone().sub(p), D = v.length(); v.setY(0).normalize();
  const side = V_(v.z, 0, -v.x), sg = (TOMAS.indexOf(T) % 2 ? 1 : -1) * (T.s.lado ?? 1), dur = Math.max(.3, T.b - T.a), k = (T.s.lat != null ? Math.max(T.s.lat * dur, Math.min(D * .13 * dur, D * .35)) : Math.min(D * .19 * dur, D * .5)) * (q - .5);
  p.addScaledVector(side, sg * k); p.y += Math.abs(k) * .06; l.addScaledVector(side, sg * k * .62); return { p: p.toArray(), l: l.toArray(), f: c.f } }
const TRINFO = new Map();
const trDe = (A, B) => { let r = TRINFO.get(B); if (r) return r; const ca = camO(A, 1), cb = camO(B, 0), d = V_(...ca.p).distanceTo(V_(...cb.p));
  const tipo = B.s.tr || (d < 7 ? "barrido" : "vuelo"), dur = tipo === "vuelo" ? cl(.3 + d / 160, .3, .85) : tipo === "barrido" ? .24 : tipo === "tapa" ? .3 : .5;
  r = { tipo, dur: Math.min(dur, (B.b - B.a) * .9, (A.b - A.a) * .9), d }; TRINFO.set(B, r); return r };
const enTransicion = t => { const k = tomaAt(t), T = TOMAS[k], N = TOMAS[k + 1];
  if (N) { const r = trDe(T, N); if (N.a - t < r.dur / 2) return [T, N, .5 - (N.a - t) / r.dur, r] }
  if (k > 0) { const r = trDe(TOMAS[k - 1], T); if (t - T.a < r.dur / 2) return [TOMAS[k - 1], T, .5 + (t - T.a) / r.dur, r] } return null };
window.SUBF = t => { const tr = enTransicion(t); return !tr ? 4 : tr[3].tipo === "barrido" ? 14 : tr[3].tipo === "tapa" ? 10 : 6 };
window.SHUTF = t => { const tr = enTransicion(t); return !tr ? .5 : tr[3].tipo === "barrido" ? 1 : .6 };
// altura del arco: pasa por encima de las casas (5), y más alto si el viaje es largo
const altura = (pa, pb) => { const d = pa.distanceTo(pb); if (d < 8) return d * .15; const pico = d < 30 ? 9 : d < 90 ? 16 : 30; return Math.max(d * .08, (pico - Math.min(pa.y, pb.y)) / .75, 0) };
let TEMBLOR = 0;   // lo pone la escena en los 1–2 golpes grandes (en unidades del mundo); decae sola en la escena
function camara(t) { const k = tomaAt(t), T = TOMAS[k], q = cl((t - T.a) / Math.max(.01, T.b - T.a)); const c = camO(T, q);
  const mira = (p, l) => { MA.lookAt(p, l, V_(0, 1, 0)); return new THREE.Quaternion().setFromRotationMatrix(MA) };
  let pos = V_(...c.p), lk = V_(...c.l), fov = c.f, giro = 0; POST.tapa = null;
  const tr = enTransicion(t);
  if (tr) { // la transición sale de donde está la toma A en ese instante y llega EXACTAMENTE a donde la toma B va a estar cuando termina
    // (antes llegaba al inicio de B, que ya iba avanzada: al terminar pegaba un salto, que el dueño marcó)
    const [A, B, u, r] = tr, qa = cl(1 - (r.dur / 2) / Math.max(.01, A.b - A.a)), qb = cl((r.dur / 2) / Math.max(.01, B.b - B.a)), ca = camO(A, qa), cb = camO(B, qb), pa = V_(...ca.p), pb = V_(...cb.p), la = V_(...ca.l), lb = V_(...cb.l);
    if (r.tipo === "vuelo") { const e = eIO(cl(u)), h = altura(pa, pb); pos = bez3(pa, pa.clone().add(V_(0, h, 0)), pb.clone().add(V_(0, h, 0)), pb, e); lk = la.clone().lerp(lb, e); fov = lerp(ca.f, cb.f, e) }
    else if (r.tipo === "sigue") { const e = eIO(cl(u)); pos = pa.clone().lerp(pb, e); lk = la.clone().lerp(lb, e); fov = lerp(ca.f, cb.f, e) }
    else if (r.tipo === "barrido") { const s = B.s.dir ?? ((TOMAS.indexOf(B) % 2) ? 1 : -1); giro = u < .5 ? -s * Math.pow(u / .5, 2) * 1.5 : s * Math.pow(1 - (u - .5) / .5, 3) * 1.5 }   // la cámara sigue el recorrido de su toma; solo se suma el giro, que termina en 0
    else { POST.tapa = { u, col: B.s.col || "#b8905a", dir: B.s.dir ?? 1 } } }
  let quat = mira(pos, lk); if (giro) quat.premultiply(new THREE.Quaternion().setFromAxisAngle(V_(0, 1, 0), giro));
  // pulso de cámara: nunca clavada (temblor medido en Volze ≈ 0,19 % del ancho entre cuadros)
  const n1 = Math.sin(t * 5.3) + Math.sin(t * 8.1 + 1.3) * .6 + Math.sin(t * 13.7 + .4) * .3, n2 = Math.sin(t * 4.7 + 2) + Math.sin(t * 9.3 + .7) * .6 + Math.sin(t * 15.1) * .3;
  quat.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(n2 * .0026, n1 * .0026, 0)));
  const sk = (T.s.shake || 0) * .35 + TEMBLOR; if (sk) { pos.x += (Math.sin(t * 75) + Math.sin(t * 47 + 1) * .5) * sk; pos.y += Math.sin(t * 63 + 2) * sk * 1.2 }
  cam.position.copy(pos); cam.quaternion.copy(quat); if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix() } }


const QS = new URLSearchParams(location.search), VISTA = QS.get("vista") ? QS.get("vista").split(",").map(Number) : null;
let ENV_OK = false;
window.MAPA = () => RECTS.map(R => [R.x, R.z, R.w, R.d, R.ry || 0]);
// dónde está el tapón agujereado en la mano del narrador (para los planos de detalle)
function setScene(t) {
  t_ = t; POST = { flash: 0, sepia: 0 };
  if (!ENV_OK) { Object.assign(ENV, ENV_CAMPANA_CIUDAD); if (typeof envCampana === "function") envCampana(ENV); sallowR.climas(); ENV_OK = true }
  const L = lineAt(t), lt = t - s(L), len = (S[L + 1] ?? DUR) - s(L), k = P(lt, 0, len), Wd = kk => wt(L, kk), T0 = s(L), dW = kk => Wd(kk) - T0;
  mundoReset(); utileriaReset(); lejosReset(true); sallowR.ocultar(); TEMBLOR = 0;
  ALL.forEach(c => { c.g.visible = false; pose(c, t, {}); quieto(c, t); setFace(c, "neutral") });
  const lug = LUGAR(L);
  const env = lug === "dentro" ? "dentro" : (lug === "tienda" || lug === "trastienda") ? "sallow" : lug === "casa" ? "noche"
    : (L >= I.rule && L <= I.shadow) ? "mediodia" : (L >= I.plug && L <= I.sign) || L === I.chain ? "atardecer" : "noche";
  setEnv(QS.get("env") || env); ambiente(t);
  R.toneMappingExposure *= lug === "dentro" ? 1.85 : (lug === "cadena" || env === "noche") ? 1.6 : 1.3;   // revisor: luminancia 0,27 contra 0,34–0,41 y 18 % de negros
  if (scene.fog && scene.fog.density !== undefined && (L === I.rule || L === I.hangs || L === I.shadow || L === I.below || L === I.nobody)) scene.fog.density = Math.min(scene.fog.density, .0004);
  if (QS.has("caras")) { const L6 = ["happy", "sad", "worried", "angry", "scared", "terrified"], k6 = L6[Math.floor(t) % 6]; ponerP(ME, 7, 6, ryA(7, 6, 7.5, 9.5)); quieto(ME, t); setFace(ME, k6); ME.g.updateMatrixWorld(true);
    const h = headW(ME), d = new THREE.Vector3(Math.sin(ME.g.rotation.y), 0, Math.cos(ME.g.rotation.y)); lejos(t); const dC = +(QS.get("carasd") || 1.5); cam.position.set(h.x + d.x * dC, h.y + .05, h.z + d.z * dC); cam.lookAt(h.x, h.y - .05 - (dC - 1.5) * .35, h.z); cam.fov = 40; cam.updateProjectionMatrix(); lights([]); POST.tapa = null; return }
  const V = VECINOS;
  const parado = (c, x, z, ry, cara = "neutral") => { ponerP(c, x, z, ry); setFace(c, cara); quieto(c, t) };
  const mirando = (c, x, z, tx, tz, cara = "neutral") => parado(c, x, z, ryA(x, z, tx, tz), cara);
  const PL = LUGARES_GENTE.plaza.filter(([x, z]) => z < 4);
  // ---- la campana: cera en el labio, el golpe, el zumbido, las nubes de la trepada
  const cera = L === I.pour ? P(lt, dW(1), len) : (L > I.pour && L <= I.stay) ? 1 : 0;
  if (cera > 0) ceraEnLabio(cera, L === I.pour ? 1 : .6);
  if (L === I.swing || L === I.thud) golpe(s(I.swing) + .45, t);
  zumbido(t, lug === "dentro" ? (L >= I.thud ? .4 : 2) : .6);
  nubesTrepada(L === I.clouds || L === I.links);
  if (L >= I.thud && L <= I.first) TEMBLOR = Math.max(TEMBLOR, golpeTemblor());
  // ---- quiénes y dónde
  switch (L) {
    case I.open: case I.pour: case I.stay: { const pv = plataformaW(-1.2, 0, 2.6), pq = interior().vuelca; enAire(ME, pv, ryA(pv[0], pv[2], pq[0], pq[2]));
      if (L === I.pour) { volcarOlla(ME, t, P(lt, dW(1), dW(7))); ollaCera(ME, true, "manos", { t }); setFace(ME, lt > dW(7) ? "esfuerzo" : "aguanta") }
      else { ollaCera(ME, true, "manos", { t }); setFace(ME, L === I.stay ? "sad" : "determined") }
      if (L === I.open) { const sp = plataformaW(2.6, 0, -1.2); sallowR.poner(sp[0], sp[1], sp[2], ryA(sp[0], sp[2], pv[0], pv[2])); sallowR.quieto(t); sallowR.martillo(true); sallowR.aura(true, .6) }
      break }
    case I.rule: case I.hangs: case I.shadow: PL.slice(0, 40).forEach(([x, z], i) => { const c = ALL[i % ALL.length]; if (c === ME || c === NELL || TRABAJADORES.includes(c)) return; parado(c, x, z, ryA(x, z, 0, 0)) }); break;
    case I.cost: case I.nobody: case I.plug: { PL.slice(0, 18).forEach(([x, z], i) => { const c = V[i % V.length]; ponerP(c, x, z, ryA(x, z, 7.5, 9.5)); if (L === I.nobody) { mirarArriba(c, t, .8); setFace(c, "worried") } else { taparOidos(c, t, L === I.plug ? P(lt, dW(5) - .2, dW(7)) : .6, { cara: L === I.cost ? "terror" : "worried" }) } }); break }
    case I.wed: { const n = P2(LUGARES_GENTE.altar.novio), m = P2(LUGARES_GENTE.altar.novia); ponerP(NOVIO, n[0], n[1], ryA(n[0], n[1], m[0], m[1])); ponerP(NOVIA, m[0], m[1], ryA(m[0], m[1], n[0], n[1])); taparOidosOtro(NOVIO, NOVIA, t, P(lt, .2, 1)); setFace(NOVIO, "warm"); setFace(NOVIA, "happy");
      (LUGARES_GENTE.altar.invitados || []).slice(0, 8).forEach((p, i) => { const q = P2(p); const c = V[(i + 4) % V.length]; if (c === NOVIO || c === NOVIA) return; ponerP(c, q[0], q[1], ryA(q[0], q[1], n[0], n[1])); taparOidos(c, t, .9, { cara: "warm" }) }); break }
    case I.babies: { const [x, z] = PL[3]; ponerP(MADRES[0], x, z, ryA(x, z, 7.5, 9.5)); cargarBebe(MADRES[0], t); setFace(MADRES[0], "warm"); const [x2, z2] = PL[5]; ponerP(MADRES[1], x2, z2, ryA(x2, z2, 7.5, 9.5)); cargarBebe(MADRES[1], t); setFace(MADRES[1], "hopeful"); break }
    case I.school: { const E = LUGARES_GENTE.escuela; const m = P2(E.maestra); ponerP(MAESTRA, m[0], m[1], ryA(m[0], m[1], -7.6, -5.4)); setFace(MAESTRA, "neutral"); senalar(MAESTRA, t, .8);
      E.alumnos.slice(0, 3).forEach((p, i) => { const q = P2(p), c = CHICOS[i]; ponerP(c, q[0], q[1], ryA(q[0], q[1], m[0], m[1])); leerLabios(c, t); setFace(c, "curious") }); break }
    case I.sign: { const [x, z] = PL[2]; mirando(CHICOS[0], x, z, 0, 0, "curious"); break }
    case I.sallow: case I.never: case I.price: case I.shop: case I.candles: case I.name: case I.smile: case I.boots: {
      const sx = 0, sz = -14.2; sallowR.poner(sx, PISO(sx, sz), sz, 0);
      if (L === I.candles) { const z = -18 + lt * .7; sallowR.poner(-1.5, PISO(-1.5, z), z, 0); sallowR.andar(t, .7) } else sallowR.quieto(t);
      if (L === I.never || L === I.smile) sallowR.ladear(L === I.smile ? .7 * eIO(k) : .45);
      if (L === I.price) { const cx = .4, cz = -12.6; ponerP(V[12], cx, cz, Math.PI); susurrarFrasco(V[12], t); sallowR.frasco(true); sallowR.inclinarse(eIO(P(lt, 0, 1.2)) * .8, headW(V[12]).toArray()) }
      if (L === I.name) { const nx = 1.6, nz = -10.6; ponerP(NELL, nx, nz, ryA(nx, nz, 0, -14)); setFace(NELL, "terror"); taparOidos(NELL, t, 0, { cara: "terror" }); sallowR.inclinarse(.5 * eIO(k), headW(NELL).toArray()) }
      if (L === I.shop) [[V[0], -5.5, -11], [V[4], 3.5, -11.5]].forEach(([c, x, z]) => mirando(c, x, z, 0, -14, "worried"));
      sallowR.aura(true, 1); break }
    case I.work: case I.found: case I.hole: case I.ledger: case I.workers: case I.hired: case I.faces: {
      const olla = TIx("olla"), mx = olla[0] + .9, mz = olla[2] + .9; ponerP(ME, mx, mz, ryA(mx, mz, olla[0], olla[2]));
      if (L === I.work) { derretirCera(ME, t); setFace(ME, "gloomy") }
      else if (L === I.found || L === I.hole || L === I.ledger) { const cj = TIx("cajon"), x = cj[0] + .2, z = cj[2] + .9; ponerP(ME, x, z, ryA(x, z, cj[0], cj[2])); mostrarTapones(ME, t, L === I.found ? P(lt, dW(3), len) : 1); taponesEnMano(ME, true, "R"); setFace(ME, L === I.ledger ? "horrified" : "shock") }
      else setFace(ME, L === I.hired ? "sad" : "scared");
      [...LUGARES_GENTE.trastienda].sort((a, b) => Math.hypot(b[0] - .6, b[1] + 20.4) - Math.hypot(a[0] - .6, a[1] + 20.4)).forEach(([x, z], i) => { const c = TRABAJADORES[i % TRABAJADORES.length]; if (i >= TRABAJADORES.length) return; ponerP(c, x, z, (L === I.faces || L === I.workers || L === I.hired) ? ryA(x, z, .6, -20.4) : ryA(x, z, x, z - 1)); if (L === I.faces) { quieto(c, t + i); caraVuelve(c, P(lt, dW(9) - .4, len), "relieved") } else derretirCera(c, t + i); if (L === I.faces) {} else setFace(c, "vacia") });
      ME.g.updateMatrixWorld(true); TAPON_P = ME.handR.getWorldPosition(new THREE.Vector3()).toArray();
      break }
    case I.nell: case I.say: case I.last: case I.forgot: case I.sir: {
      const m = CASA_NELL_V.mesa, a = CASA_NELL_V.adentro; ponerP(NELL, a[0], a[2], ryA(a[0], a[2], m[0], m[2])); quieto(NELL, t);
      ponerP(ME, a[0] + 1.3, a[2] + .6, ryA(a[0] + 1.3, a[2] + .6, a[0], a[2])); NELL.g.rotation.y = ryA(a[0], a[2], a[0] + 1.3, a[2] + .6);
      if (L === I.say) { POST.sepia = .5; setFace(NELL, "happy"); setFace(ME, lt > dW(11) ? "happy" : "warm") }
      else if (L === I.last) { POST.sepia = .5; mostrarTapones(ME, t, 1); taponesEnMano(ME, true, "R"); setFace(ME, "warm"); setFace(NELL, "happy") }
      else { setFace(NELL, L === I.nell ? "educada" : "educada"); setFace(ME, L === I.sir ? "sad" : L === I.forgot ? "worried" : "hopeful") }
      break }
    case I.chain: { const c = RC; ponerP(ME, c[0] - 3, c[2] + 2, ryA(c[0] - 3, c[2] + 2, PE[0], PE[2])); mirarArriba(ME, t, .8); setFace(ME, "suspicious"); break }
    case I.tonight: case I.needle: case I.nobodyleft: { const [nx, nz] = [4.2, 7.2]; ponerP(NELL, nx, nz, ryA(nx, nz, 6, 9)); setFace(NELL, L === I.nobodyleft ? "educada" : "happy"); mostrarTapones(NELL, t, L === I.tonight ? P(lt, dW(2), len) : .6); taponesEnMano(NELL, true, "R");
      ponerP(ME, nx + 2.1, nz + .7, ryA(nx + 2.1, nz + .7, nx, nz)); NELL.g.rotation.y = ryA(nx, nz, nx + 2.1, nz + .7); if (L === I.needle) { mostrarTapones(ME, t, 1); taponesEnMano(ME, true, "R"); setFace(ME, "horrified"); ME.g.updateMatrixWorld(true); TAPON_P = ME.handR.getWorldPosition(new THREE.Vector3()).toArray() } else setFace(ME, L === I.nobodyleft ? "terrified" : "worried"); break }
    case I.climb: case I.links: case I.clouds: { const u = L === I.climb ? (lt < dW(9) ? 0 : U_TREPA.climb * P(lt, dW(9), len)) : L === I.links ? U_TREPA.links + .03 * k : U_TREPA.clouds + .04 * k;
      if (L === I.climb && lt < dW(9)) { const c = RC; ponerP(ME, c[0] - 2, c[2] + 1.5, ryA(c[0] - 2, c[2] + 1.5, PE[0], PE[2])); ollaCera(ME, true, "manos", { t }); setFace(ME, "determined") }
      else { const m = TREPA(Math.max(.012, u)); enAire(ME, [m.p[0] + m.n[0] * 3, m.p[1] - 1, m.p[2] + m.n[2] * 3], Math.atan2(-m.n[0], -m.n[2])); trepaCadena(ME, t, {}); ollaCera(ME, true, "L", { t }); setFace(ME, L === I.clouds ? "aguanta" : "esfuerzo") }
      break }
    case I.inside: case I.noclapper: case I.hammer: case I.smiled: case I.swing: case I.thud: case I.first: case I.fell: {
      const pv = plataformaW(-1.2, 0, 2.6), sp = plataformaW(2.6, 0, -1.2); enAire(ME, pv, ryA(pv[0], pv[2], sp[0], sp[2])); ollaCera(ME, true, "manos", { t: t });
      setFace(ME, L === I.inside ? "scared" : L === I.noclapper ? "shock" : L === I.hammer ? "terrified" : L === I.smiled ? "terrified" : L === I.first ? "relieved" : L === I.fell ? "shock" : "esfuerzo");
      sallowR.poner(sp[0], sp[1], sp[2], ryA(sp[0], sp[2], pv[0], pv[2]));
      if (L === I.swing || L === I.thud) { sallowR.martillo(true); sallowR.golpe(t, L === I.swing ? .62 * eIO(k) : .62 + .38 * k); }
      else if (L === I.fell) sallowR.caer(eIO(P(lt, dW(1), dW(7) + .4)));
      else { sallowR.quieto(t); sallowR.martillo(L !== I.inside); if (L === I.smiled) sallowR.ladear(.55 * eIO(k)) }
      sallowR.aura(L !== I.inside && L !== I.noclapper, .8); if (L === I.inside || L === I.noclapper) sallowR.ocultar();
      break }
    case I.below: break;
    case I.nightly: case I.end: { const c = RC; ponerP(NELL, c[0] - 1.2, c[2] + 1.2, ryA(c[0] - 1.2, c[2] + 1.2, PE[0], PE[2])); gritarArriba(NELL, t, { u: L === I.end ? 1 : .3, cara: L === I.end ? "grito" : "hopeful" }); break }
  }
  lejos(t);
  if (VISTA) { cam.position.set(VISTA[0], VISTA[1], VISTA[2]); cam.lookAt(VISTA[3], VISTA[4], VISTA[5]); cam.fov = VISTA[6] || 50; cam.updateProjectionMatrix(); lights([]); POST.tapa = null; return }
  camara(t); const LX = typeof lucesCerca === "function" ? lucesCerca(cam.position.toArray(), 4) : [];
  if (lug === "dentro") { LX.length = Math.min(LX.length, 2); LX.push([add(interior().gancho, [0, 1.5, 2]), 6, "#ffd6a0", 18], [add(cam.position.toArray(), [0, 2, 0]), L === I.noclapper ? .6 : 2.5, "#a8b8e0", 14]) }
  if (L === I.nightly || L === I.end) LX.push([add(headW(NELL).toArray(), [1.2, 1.5, 1.5]), 3, "#ffc480", 8]);
  lights(LX);
}


// ---------- capa 2D: color ocre por escena, viñeta y subtítulos estilo Volze (una palabra, minúscula, amarillo, contorno negro grueso, 75 % del alto)
const VIG2 = (() => { const c = mk(W, H), g = c.getContext("2d"), r = g.createRadialGradient(W / 2, H * .48, Math.min(W, H) * .28, W / 2, H * .48, Math.max(W, H) * .6); r.addColorStop(0, "rgba(0,0,0,0)"); r.addColorStop(1, "rgba(10,5,0,.32)"); g.fillStyle = r; g.fillRect(0, 0, W, H); return c })();
let POST = {};
COMP = new EffectComposer(R); COMP.setPixelRatio(1); COMP.setSize(W, H); COMP.addPass(new RenderPass(scene, cam)); try { const { GTAOPass } = await import("three/addons/postprocessing/GTAOPass.js"); const ao = new GTAOPass(scene, cam, W, H); ao.updateGtaoMaterial({ radius: .8, distanceExponent: 1.5, thickness: 1.5, scale: 1.2 }); ao.blendIntensity = .9; const aoR = ao.render.bind(ao); ao.render = (...q) => { const oc = []; scene.traverse(o => { if (o.isSprite && o.visible) { o.visible = false; oc.push(o) } }); aoR(...q); oc.forEach(o => o.visible = true) }; COMP.addPass(ao) } catch (e) { console.log("sin GTAO", e.message) } COMP.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), .42, .5, .8)); COMP.addPass(new OutputPass());
const SUBY = L => .745;   // fijo al 74,5 % del alto, como Volze en terror (medido)
function subV(t) {
  let i = -1; for (let k = 0; k < WORDS.length; k++) if (t >= WORDS[k][0]) i = k; if (i < 0 || !WORDS[i][1]) return;
  const w = WORDS[i][1].toLowerCase().replace(/[.,!?"“”]/g, ""), edad = t - WORDS[i][0], size = 112, y = H * SUBY(lineAt(t));
  const sc = edad < .13 ? 1.28 - .28 * (1 - (1 - edad / .13) ** 2) : 1; X.save(); X.translate(W / 2, y); X.scale(sc, sc); X.font = `800 ${size}px 'Baloo 2'`; X.textAlign = "center"; X.textBaseline = "middle"; X.lineJoin = "round";
  X.shadowColor = "rgba(0,0,0,.55)"; X.shadowBlur = 0; X.shadowOffsetY = 7; X.lineWidth = size * .22; X.strokeStyle = "#000"; X.strokeText(w, 0, 0); X.shadowColor = "transparent"; X.fillStyle = "#fff200"; X.fillText(w, 0, 0); X.restore();
}
function overlay(t) {
  const gr = ENV[ENVNOW].grade; X.globalAlpha = gr[1]; X.globalCompositeOperation = "soft-light"; X.fillStyle = gr[0]; X.fillRect(0, 0, W, H); X.globalCompositeOperation = "source-over"; X.globalAlpha = 1; X.drawImage(VIG2, 0, 0);
  if (POST.flash > 0) { X.globalAlpha = Math.min(1, POST.flash); X.fillStyle = "#fff6e0"; X.fillRect(0, 0, W, H); X.globalAlpha = 1 }
  if (POST.sepia > 0) { X.globalAlpha = POST.sepia * .55; X.globalCompositeOperation = "color"; X.fillStyle = "#b08a5a"; X.fillRect(0, 0, W, H); X.globalCompositeOperation = "source-over"; X.globalAlpha = 1 }
  if (POST.tapa) { const u = POST.tapa.u, cx = W / 2 + (u - .5) * POST.tapa.dir * 4.6 * W, g = X.createLinearGradient(cx - 1.3 * W, 0, cx + 1.3 * W, 0); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(.3, POST.tapa.col); g.addColorStop(.7, POST.tapa.col); g.addColorStop(1, "rgba(0,0,0,0)"); X.fillStyle = g; X.fillRect(0, 0, W, H); for (let i = 0; i < 46; i++) { const yy = ((i * 97.3) % 1) * H, hh = 6 + ((i * 31.7) % 1) * 60, xx = cx - 1.1 * W + ((i * 57.1) % 1) * 2.2 * W; X.fillStyle = i % 2 ? "rgba(255,240,210,.16)" : "rgba(40,22,8,.2)"; X.fillRect(xx - .5 * W, yy, W * (.5 + ((i * 13.3) % 1)), hh) } const v = X.createRadialGradient(cx, H / 2, H * .2, cx, H / 2, H * .9); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.45)"); X.globalAlpha = Math.max(0, 1 - Math.abs(u - .5) * 4); X.fillStyle = v; X.fillRect(0, 0, W, H); X.globalAlpha = 1 }
  subV(t);
}
window.DBG = { cam, ALL, ME, QUILL, PIM, GARROW, TURT, THREE, TOMAS };