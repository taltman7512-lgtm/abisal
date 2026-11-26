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


// ================= «WE HOLD UP THE SKY»: EL PUEBLO bajo la tapa (piso, calles empedradas, filas de casas, postes con gato y manivela) =================
// Medidas de _comun_cielo.js (CALLES, CALLE_MIA, POSTE_MIO, CASA_YO, TANNER, POSTE_NUEVE, LOMA, POSTE_NUEVE_LOMA, ESCALERA_KELL, CIELO, ALT_C).
// Norte = −z. Las calles corren a lo largo de x; cada una tiene su poste en la plazoleta (x = CALLES[i].poste). La tapa NO está acá
// (la hace otro agente): este archivo termina cada poste en un capitel de hierro justo debajo de CIELO(x, z).
// Los nombres de ayudantes viejos (TM, lote, uvMuro, M_MADERA, …) se mantienen con la misma firma por compatibilidad.
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

// ---------- el piso: ALT_C exacto (los personajes y la tapa usan la misma altura); el relieve va en piedras, adoquines y matas en 3D
const SUELO = (x, z) => ALT_C(x, z);
const sueloN = (x, z, e = .6) => { const nx = SUELO(x - e, z) - SUELO(x + e, z), nz = SUELO(x, z - e) - SUELO(x, z + e), l = Math.hypot(nx, 2 * e, nz); return [nx / l, 2 * e / l, nz / l] };
// las calles del pueblo: las cinco de CALLES y dos más al sur que se pierden en la bruma (sin API)
const CALLES_TODAS = [...CALLES.map((c, i) => ({ ...c, i, tipo: c.z >= -1 ? "pobre" : c.z > -40 ? "media" : "buena" })), { z: 78, poste: -18, i: 5, tipo: "pobre", lejos: 1 }, { z: 104, poste: 10, i: 6, tipo: "pobre", lejos: 1 }];
const CALLE_AN = 3.0, VEREDA = 4.0;   // medio ancho del empedrado y donde empiezan los frentes de las casas
const CALLE_X = 132;                  // las calles siguen hasta x = ±132 (se pierden en la bruma)
const GAP_N = 8.5, GAP_S = 6.5;       // medio ancho de la plazoleta (sin casas) al norte y al sur de cada poste
const PLAZ_R = 7.4;                   // radio del enlosado de la plazoleta
const LOMA_Z = -66;                   // al norte de esto empieza la Loma (mansiones, jardines)
const calleK = (x, z) => { let k = 0; for (const c of CALLES_TODAS) { if (Math.abs(x) > CALLE_X + 4) continue; const d = Math.abs(z - c.z) + (fbm2(x * .7, z * .7, 2) - .5) * .25; k = Math.max(k, 1 - sst(CALLE_AN - .1, CALLE_AN + .35, d)) } return k };
const plazK = (x, z) => { let k = 0; for (const c of CALLES_TODAS) k = Math.max(k, 1 - sst(PLAZ_R - .5, PLAZ_R + .3 + (fbm2(x * .9, z * .9, 2) - .5) * .8, Math.hypot(x - c.poste, z - c.z))); return k };
const veredaK = (x, z) => { let k = 0; for (const c of CALLES_TODAS) { const d = Math.abs(z - c.z); k = Math.max(k, sst(CALLE_AN, CALLE_AN + .2, d) * (1 - sst(VEREDA - .1, VEREDA + .5, d))) } return k };

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

// ---------- color del piso por vértice: tierra apisonada y gris en el pueblo, juntas oscuras bajo el empedrado, pasto ralo en los patios,
// césped parejo y caminos de pedregullo en la Loma
const C_TIERRA = linC("#8e7c62"), C_TIERRA2 = linC("#76664e"), C_JUNTA = linC("#4a4238"), C_VEREDA = linC("#8a8478"), C_RALO = linC("#8a9058"), C_RALO2 = linC("#a09a62"), C_CESPED = linC("#6a9a44"), C_CESPED2 = linC("#82aa50"), C_PEDREG = linC("#b8ae98");
const lomaK = (x, z) => sst(LOMA_Z + 4, LOMA_Z - 8, z);
function colorSuelo(x, z) { const n = fbm2(x * .045 + 11, z * .045 + 2, 4), n2 = fbm2(x * .27 + 5, z * .27 + 8, 2), n3 = fbm2(x * .09 - 3, z * .09 + 7, 3);
  let c = mix3(C_TIERRA, C_TIERRA2, sst(.35, .7, n));
  // patios entre filas: pasto ralo a manchones
  let patio = 1; for (const cc of CALLES_TODAS) patio = Math.min(patio, sst(VEREDA + 5.5, VEREDA + 8, Math.abs(z - cc.z)));
  c = mix3(c, mix3(C_RALO, C_RALO2, n2), patio * sst(.4, .62, n3) * .85);
  c = mix3(c, C_VEREDA, veredaK(x, z) * .55); c = mix3(c, C_JUNTA, Math.max(calleK(x, z), plazK(x, z)) * .85);
  // la Loma: césped cuidado con franjas de corte, caminos de pedregullo
  const lk = lomaK(x, z); if (lk > 0) { const franja = .5 + .5 * Math.sin((x + z * .3) * .9); let cv = mix3(C_CESPED, C_CESPED2, .35 * franja + .4 * n2); const cam = LOMA_CAMINOS.reduce((m, [x0, z0, x1, z1, an]) => { const dx = x1 - x0, dz = z1 - z0, t = cl(((x - x0) * dx + (z - z0) * dz) / (dx * dx + dz * dz)); return Math.max(m, 1 - sst(an * .5, an * .5 + .4, Math.hypot(x - x0 - dx * t, z - z0 - dz * t))) }, 0); cv = mix3(cv, C_PEDREG, cam); c = mix3(c, cv, lk) }
  const s = .9 + .2 * n2; return [c[0] * s, c[1] * s, c[2] * s] }
// caminos de pedregullo de la Loma (x0, z0, x1, z1, ancho)
const LOMA_CAMINOS = [[0, -64, 0, -118, 4.2], [-56, -76, 56, -76, 3.2], [-48, -100, 48, -100, 3.2], [6, -80, 12, -86, 2.2], [-30, -76, -30, -120, 2.4], [30, -76, 30, -120, 2.4], [0, -88, -18, -88, 2.2], [0, -112, 22, -112, 2.2]];

// ---------- la malla del piso: fina en el pueblo (≈ 0,5 m) y más gruesa lejos; x de −230 a 230, z de −220 a 190
const TERRENO = (() => { const N = 300, geo = new THREE.PlaneGeometry(2, 2, N, N); geo.rotateX(-Math.PI / 2); const p = geo.attributes.position, uv = geo.attributes.uv, col = new Float32Array(p.count * 3);
  const mx = u => 230 * (.3 * u + .7 * u * u * u), mz = u => u < 0 ? 220 * (.42 * u + .58 * u * u * u) : 190 * (.34 * u + .66 * u * u * u);
  for (let i = 0; i < p.count; i++) { const x = mx(p.getX(i)), z = mz(p.getZ(i)); p.setXYZ(i, x, SUELO(x, z) - .01, z); uv.setXY(i, x / 6, z / 6); const c = colorSuelo(x, z); col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2] }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals(); const m = new THREE.Mesh(geo, M_TIERRA); m.receiveShadow = true; scene.add(m); return m })();
AGUA.visible = false;

// ---------- calcomanía de adoquines a lo largo de cada calle (bump fuerte: se ve en todo el largo), y la plazoleta enlosada
const T_ADOQUIN = (() => { const [c, z] = pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(4410), px = w / 3; c.fillStyle = "#3e3830"; c.fillRect(0, 0, w, h); z.fillStyle = "#101010"; z.fillRect(0, 0, w, h);
    const fh = .3 * px; for (let f = 0; f * fh < h; f++) { let x = -r() * .2 * px; while (x < w) { const sw = (.2 + r() * .1) * px, x0 = x + 3, y0 = f * fh + 3, P = [[x0, y0], [x0 + sw - 6, y0 + (r() - .5) * 4], [x0 + sw - 6 + (r() - .5) * 4, y0 + fh - 6], [x0 + (r() - .5) * 4, y0 + fh - 6]], col = rgbj(["#8a8478", "#7a746a", "#9a9488", "#6e685e", "#8e8270", "#a09a8c"][r() * 6 | 0], r, 20), v = 170 + r() * 70 | 0;
        for (const dx of [-w, 0, w]) { const Q = P.map(([a, b]) => [a + dx, b]); redondo(c, Q, 12); c.fillStyle = col; c.fill(); const gr = c.createRadialGradient(x0 + dx + sw * .35, y0 + fh * .3, 2, x0 + dx + sw / 2, y0 + fh / 2, sw * .7); gr.addColorStop(0, "rgba(255,250,235,.25)"); gr.addColorStop(1, "rgba(30,26,20,.3)"); c.fillStyle = gr; c.fill();
          redondo(z, Q, 12); const gz = z.createRadialGradient(x0 + dx + sw / 2, y0 + fh / 2, 2, x0 + dx + sw / 2, y0 + fh / 2, sw * .7); gz.addColorStop(0, `rgb(${v},${v},${v})`); gz.addColorStop(1, "#404040"); z.fillStyle = gz; z.fill() } x += sw } }
    for (let k = 0; k < 9000; k++) { c.fillStyle = r() < .5 ? "rgba(30,26,20,.16)" : "rgba(255,250,235,.1)"; c.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2) }
    for (let k = 0; k < 120; k++) { const x = r() * w, y = r() * h, s = 30 + r() * 110, gr = c.createRadialGradient(x, y, 0, x, y, s), cl2 = r() < .5 ? "40,34,26" : "200,190,170"; gr.addColorStop(0, `rgba(${cl2},.2)`); gr.addColorStop(1, `rgba(${cl2},0)`); c.fillStyle = gr; c.fillRect(x - s, y - s, 2 * s, 2 * s) } });
  [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
const geoSobreSuelo = (x0, x1, z0, z1, nx, nz, dy = .02) => { const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, nz); g.rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, 0, (z0 + z1) / 2); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, SUELO(p.getX(i), p.getZ(i)) + dy); g.computeVertexNormals(); return g };
const M_ADOQ_D = new THREE.MeshStandardMaterial({ map: T_ADOQUIN.c, bumpMap: T_ADOQUIN.z, bumpScale: 6, roughness: .88, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
CALLES_TODAS.forEach(c => { const g = geoSobreSuelo(-CALLE_X, CALLE_X, c.z - CALLE_AN, c.z + CALLE_AN, 220, 4, .015), uv = g.attributes.uv, p = g.attributes.position; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / 3, (p.getZ(i) - c.z) / 3); const m = new THREE.Mesh(g, M_ADOQ_D); m.receiveShadow = true; m.renderOrder = -.2; scene.add(m) });
// enlosado de las plazoletas (anillos de losas grises alrededor del poste, borde roto con pasto)
const T_LOSAS = (() => { const [c, z] = pintarDoble(2048, 2048, (c, z, w, h) => { const r = rng(4400), C = w / 2, px = w / 16, R0 = 2.4, R1 = PLAZ_R; z.fillStyle = "#606060"; z.fillRect(0, 0, w, h);
    c.fillStyle = "#4e483e"; c.beginPath(); for (let i = 0; i <= 200; i++) { const a = i / 200 * 6.283, rr = (R1 + .15 + Math.sin(a * 7) * .2 + Math.sin(a * 13 + 1) * .15) * px; i ? c.lineTo(C + Math.cos(a) * rr, C + Math.sin(a) * rr) : c.moveTo(C + Math.cos(a) * rr, C + Math.sin(a) * rr) } c.fill();
    const losa = (r0, r1, a0, a1, col) => { const m = .03 * px, ma0 = a0 + m / r1, ma1 = a1 - m / r1; if (ma1 <= ma0) return; const j = () => (r() - .5) * .05 * px, pts = [[r0 + m, ma0], [r1 - m, ma0], [r1 - m, (ma0 + ma1) / 2], [r1 - m, ma1], [r0 + m, ma1], [r0 + m, (ma0 + ma1) / 2]].map(([rr, a]) => [C + Math.cos(a) * rr + j(), C + Math.sin(a) * rr + j()]);
      const v = 180 + r() * 70 | 0; redondo(c, pts, .07 * px); c.fillStyle = col; c.fill(); redondo(z, pts, .07 * px); z.fillStyle = `rgb(${v},${v},${v})`; z.fill();
      const mx = C + Math.cos((a0 + a1) / 2) * (r0 + r1) / 2, my = C + Math.sin((a0 + a1) / 2) * (r0 + r1) / 2, s = (r1 - r0) * .6; redondo(c, pts, .07 * px); const gr = c.createRadialGradient(mx - s * .3, my - s * .3, 0, mx, my, s * 1.4); gr.addColorStop(0, "rgba(255,250,235,.18)"); gr.addColorStop(1, "rgba(30,26,20,.24)"); c.fillStyle = gr; c.fill() };
    const grises = ["#9a968c", "#8a867c", "#a8a296", "#7c786e", "#949082", "#b0aa9c", "#868070", "#a09884"];
    let rr = R0; while (rr < R1 - .1) { const an = .45 + r() * .2, r1 = Math.min(R1, rr + an); let a = r() * 6.283; const fin = a + 6.283; while (a < fin - .02) { const da = Math.min(fin - a, (.4 + r() * .35) / rr); if (r() > .03) losa(rr * px, r1 * px, a, a + da, rgbj(grises[r() * 8 | 0], r, 22)); a += da } rr = r1 }
    for (let k = 0; k < 220; k++) { const a = r() * 6.283, d = Math.sqrt(r()) * R1 * px, s = 20 + r() * 90, X0 = C + Math.cos(a) * d, Y0 = C + Math.sin(a) * d, gr = c.createRadialGradient(X0, Y0, 0, X0, Y0, s), cl2 = r() < .5 ? "180,170,140" : "40,36,30"; gr.addColorStop(0, `rgba(${cl2},.22)`); gr.addColorStop(1, `rgba(${cl2},0)`); c.fillStyle = gr; c.fillRect(X0 - s, Y0 - s, s * 2, s * 2) }
    // manchas de grasa alrededor del gato (lo engrasan todos los días)
    for (let k = 0; k < 40; k++) { const a = r() * 6.283, d = (R0 + r() * 1.6) * px, s = 12 + r() * 50, X0 = C + Math.cos(a) * d, Y0 = C + Math.sin(a) * d, gr = c.createRadialGradient(X0, Y0, 0, X0, Y0, s); gr.addColorStop(0, "rgba(24,18,12,.5)"); gr.addColorStop(1, "rgba(24,18,12,0)"); c.fillStyle = gr; c.fillRect(X0 - s, Y0 - s, s * 2, s * 2) }
    // camino gastado en círculo donde la gente empuja las barras de la manivela
    c.strokeStyle = "rgba(60,52,42,.28)"; c.lineWidth = .9 * px; c.beginPath(); c.arc(C, C, 3.25 * px, 0, 7); c.stroke();
    for (let k = 0; k < 2500; k++) { const a = r() * 6.283, d = (R1 - 1.6 + r() * 1.7) * px, x = C + Math.cos(a) * d, y = C + Math.sin(a) * d, L = 4 + r() * 10; c.strokeStyle = `rgba(${90 + r() * 50 | 0},${110 + r() * 40 | 0},50,${.4 + r() * .4})`; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - .5) * L, y - L); c.stroke() }
    c.globalCompositeOperation = "destination-out"; for (let k = 0; k < 500; k++) { const a = r() * 6.283, d = (R1 - .7 + r() * 1.2) * px, s = 14 + r() * 50, X0 = C + Math.cos(a) * d, Y0 = C + Math.sin(a) * d, gr = c.createRadialGradient(X0, Y0, 0, X0, Y0, s); gr.addColorStop(0, "rgba(0,0,0,.9)"); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(X0 - s, Y0 - s, s * 2, s * 2) } c.globalCompositeOperation = "source-over" }); return { c, z } })();
const M_LOSAS = new THREE.MeshStandardMaterial({ map: T_LOSAS.c, bumpMap: T_LOSAS.z, bumpScale: 5, roughness: .85, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -8 });
CALLES_TODAS.forEach(c => { const m = new THREE.Mesh(geoSobreSuelo(c.poste - 8, c.poste + 8, c.z - 8, c.z + 8, 32, 32, .03), M_LOSAS); m.receiveShadow = true; m.renderOrder = -.1; scene.add(m) });

// ---------- ADOQUINES EN 3D: parches de 2 × 2 m con ≈ 56 piedras abombadas (color por vértice), instanciados en las calles cercanas
// (|x| < 46 en las cinco calles), fuera de la plazoleta enlosada. Cada calle va en tramos (InstancedMesh por tramo de 16 m: la cámara descarta lo que no ve).
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
const ADOQUINES = []; { const cc = new THREE.Color();
  CALLES_TODAS.filter(c => !c.lejos).forEach(c => { for (let t0 = -48; t0 < 48; t0 += 16) { const L = []; for (let x = t0 + 1; x < t0 + 16; x += 2) for (const z of [c.z - 2, c.z, c.z + 2]) { if (Math.hypot(x - c.poste, z - c.z) < PLAZ_R + .6) continue; L.push([x, z]) }
      if (!L.length) continue; const m = new THREE.InstancedMesh(GEO_ADOQ, M_ADOQ, L.length); L.forEach(([x, z], i) => { const n = sueloN(x, z, 1); dummy.position.set(x, SUELO(x, z), z); dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...n)); dummy.rotateY((i % 2) * Math.PI); dummy.scale.set(1, .9 + hash2(x * 7, z * 3) * .25, 1); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); const v = .9 + hash2(x, z) * .2; m.setColorAt(i, cc.setRGB(v, v * .98, v * .95)) });
      m.receiveShadow = true; m.castShadow = false; m.computeBoundingSphere(); scene.add(m); ADOQUINES.push(m) } }) }

// ---------- registro de lo ocupado (para que la utilería no se pise con las casas)
const OCUP = [], RECTS = [], GRILLA_O = new Map(), CELDA_O = 6, PAD_O = 2.5;   // grilla espacial (las búsquedas miran solo su celda)
const enRect = (R, x, z, m = 0) => { const c = Math.cos(R.ry), s = Math.sin(R.ry), dx = x - R.x, dz = z - R.z, lx = dx * c - dz * s, lz = dx * s + dz * c; return Math.abs(lx) < R.w / 2 + m && Math.abs(lz) < R.d / 2 + m };
const enGrilla = (it, x, z, rr) => { const a = Math.floor((x - rr) / CELDA_O), b = Math.floor((x + rr) / CELDA_O), c = Math.floor((z - rr) / CELDA_O), d = Math.floor((z + rr) / CELDA_O); for (let i = a; i <= b; i++) for (let j = c; j <= d; j++) { const k = i * 100003 + j; (GRILLA_O.get(k) || GRILLA_O.set(k, []).get(k)).push(it) } };
const rectAdd = R => { RECTS.push(R); R.rect = 1; enGrilla(R, R.x, R.z, Math.hypot(R.w, R.d) / 2 + PAD_O) };
const zonaLibre = (x, z, r = 0) => CALLES_TODAS.some(c => Math.hypot(x - c.poste, z - c.z) < 4.3 + r);   // la vuelta de la manivela
const libreEn = (x, z, r = .5, o = {}) => { if (!o.zona && zonaLibre(x, z, r)) return false; const L = GRILLA_O.get(Math.floor(x / CELDA_O) * 100003 + Math.floor(z / CELDA_O)); if (!L) return true;
  for (const q of L) { if (q.rect) { if (q !== o.salvo && enRect(q, x, z, r + (o.mc ?? .1))) return false } else if (Math.hypot(x - q.x, z - q.z) < r + q.r) return false } return true };
const ocupa = (x, z, r) => { const q = { x, z, r }; OCUP.push(q); enGrilla(q, x, z, r + PAD_O); return true };

// ---------- LAS CASAS: piedra, ladrillo o revoque (a veces piso de arriba con entramado), techo a dos aguas de pizarra o tejas (cumbrera a lo largo
// de la calle o con el frontón a la calle), chimenea con cañones de barro, canaletas y caños de lata, puerta con escalón, ventanas con postigos.
// `simple`: casas lejanas (solo volúmenes, techo, chimenea, huecos oscuros). Todo va a lotes (pocas llamadas de dibujo).
const L_CASA = lote(), L_LEJOS = lote(), CASAS_P = [], HUMOS = [];
const CASA_MATS = { zocalo: M_ZOCALO, revoque: M_REVOQUE, piedraC: M_PIEDRA_C, madera: M_MADERA, maderaV: M_MADERA_V, viga: M_VIGA, vidrio: M_VIDRIO, oscuro: M_OSCURO, hierro: M_HIERRO, hierroO: M_HIERRO_O, terracota: M_TERRACOTA, roca: M_ROCA_G, soga: M_SOGA, chapa: M_CHAPA, sillarC: M_SILLAR_C, blanco: M_BLANCO_P, laton: M_LATON,
  luz: new THREE.MeshStandardMaterial({ color: "#ffe0a0", emissive: "#ffb850", emissiveIntensity: 1.3, roughness: .4 }) };
M_MURO.forEach((m, i) => CASA_MATS["muro" + i] = m); M_LAD.forEach((m, i) => CASA_MATS["lad" + i] = m); M_REV.forEach((m, i) => CASA_MATS["rev" + i] = m); M_PIZ.forEach((m, i) => CASA_MATS["piz" + i] = m); M_TEJA.forEach((m, i) => CASA_MATS["teja" + i] = m); M_PUERTA.forEach((m, i) => CASA_MATS["col" + i] = m);
const ventanaPiezas = (add, M, an, al, r, col, o = {}) => {   // M = matriz en la cara (origen al pie de la ventana, +z hacia afuera)
  add("vidrio", new THREE.PlaneGeometry(an, al), M.clone().multiply(TM(0, al / 2, .02)));
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
  const y0 = Math.min(SUELO(x, z), ...[[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([a, b]) => SUELO(x + (a * w / 2) * cs + (b * d / 2) * sn, z - (a * w / 2) * sn + (b * d / 2) * cs))) - .06;
  const HM = TM(x, y0, z, 0, ry, 0), add = (k, g, m) => L.add(k, g, m ? HM.clone().multiply(m) : HM.clone()), W = (lx, ly, lz) => new THREE.Vector3(lx, ly, lz).applyMatrix4(HM);
  const mu = o.muro ?? (r() < .45 ? "muro" + (r() * M_MURO.length | 0) : r() < .6 ? "lad" + (r() * M_LAD.length | 0) : "rev" + (r() * M_REV.length | 0)), dos = !simple && (o.dos ?? (mu.startsWith("muro") && r() < .3)), hs = dos ? 2.9 : h;
  const techo = o.techo ?? (r() < .5 ? "piz" + (r() * 3 | 0) : "teja" + (r() * 3 | 0)), col = "col" + (o.color ?? (r() * M_PUERTA.length | 0)), frontal = !!o.frontal;
  // zócalo y muros
  add("zocalo", uvMuro(new THREE.BoxGeometry(w + .2, 1.4, d + .2), 3.2), TM(0, -.45, 0));
  add(mu, uvMuro(new THREE.BoxGeometry(w, hs, d), 3.2, r(), r()), TM(0, hs / 2, 0));
  if (dos) { const hu = h - hs, rv = "rev" + (r() * M_REV.length | 0); add(rv, uvMuro(new THREE.BoxGeometry(w + .2, hu, d + .2), 3.4, r(), r()), TM(0, hs + hu / 2, 0));
    const cara = (L2, M) => { add("viga", new THREE.BoxGeometry(L2 + .1, .16, .1), M.clone().multiply(TM(0, .08, 0))); add("viga", new THREE.BoxGeometry(L2 + .1, .16, .1), M.clone().multiply(TM(0, hu - .08, 0))); const n = Math.max(2, Math.round(L2 / 1.25));
      for (let k = 0; k <= n; k++) { const xx = lerp(-L2 / 2 + .06, L2 / 2 - .06, k / n); add("viga", new THREE.BoxGeometry(.15, hu, .1), M.clone().multiply(TM(xx, hu / 2, 0))); if (k < n && k % 2 === 0) { const x2 = lerp(-L2 / 2 + .06, L2 / 2 - .06, (k + 1) / n), [g, m] = cilEntre([xx, .1, 0], [x2, hu - .1, 0], .06, 4); add("viga", g, M.clone().multiply(m)) } } };
    cara(w + .2, TM(0, hs, d / 2 + .15)); cara(w + .2, TM(0, hs, -d / 2 - .15, 0, Math.PI, 0)); cara(d + .2, TM(w / 2 + .15, hs, 0, 0, Math.PI / 2, 0)); cara(d + .2, TM(-w / 2 - .15, hs, 0, 0, -Math.PI / 2, 0)) }
  if (!simple) {
    // esquineras (piedra clara) y cornisa entre pisos
    if (!mu.startsWith("rev") || o.mansion) for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) for (let yy = .25, k = 0; yy < hs - .2; yy += .44, k++) { const la = k % 2 ? .62 : .38; add(o.mansion ? "blanco" : "piedraC", RB1(.1 + la * (k % 2 ? 1 : .1), .38, .1 + la * (k % 2 ? .1 : 1), .04), TM(sx * (w / 2 + .015) - sx * la * (k % 2 ? .5 : 0), yy, sz * (d / 2 + .015) - sz * la * (k % 2 ? 0 : .5))) }
    for (let yy = 2.95; yy < h - 1; yy += 2.9) add(o.mansion ? "blanco" : "piedraC", RB1(w + .16, .16, d + .16, .03), TM(0, yy, 0));
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
  if (simple) add("oscuro", new THREE.PlaneGeometry(dw, dh), F.clone().multiply(TM(0, dh / 2, .02)));
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
  vents.forEach(([M, an]) => ventanaPiezas(add, M, an, vh, r, col, { simple, blanco: o.mansion, sinPostigo: o.mansion }));
  // ---- farolito de pared junto a la puerta (algunas casas)
  if (!simple && (o.farol ?? r() < .3)) { const lx = px + (px > 0 ? -1 : 1) * (dw / 2 + .45); add("hierro", new THREE.BoxGeometry(.04, .04, .32), F.clone().multiply(TM(lx, 2.55, .16))); add("hierro", new THREE.CylinderGeometry(.13, .1, .05, 6), F.clone().multiply(TM(lx, 2.66, .34)));
    add("luz", new THREE.CylinderGeometry(.09, .07, .22, 6), F.clone().multiply(TM(lx, 2.52, .34))); add("hierro", new THREE.ConeGeometry(.14, .14, 6), F.clone().multiply(TM(lx, 2.75, .34))) }
  const C = { x, z, ry, w, d, h, y0, HM, px, rh, ye, dos, hs, col, techo, mu, frontal, span, len, ang, chimTop, ctop, chimG, r, seed, F, dw, dh, ridge: h + rh + .15 };
  CASAS_P.push(C); rectAdd({ x, z, ry, w: w + .6, d: d + .6, casa: C }); return C }

// ---------- las filas: casas apretadas a los dos lados de cada calle; las calles pobres (sur) con techos bajos (¡el cielo está a 12 m!)
// tipo: pobre (z ≥ 0), media (z = −26), buena (z = −52). Junto a cada poste se abre la plazoleta (sin casas en |x − poste| < GAP) y del otro lado
// de la plazoleta hay casas retiradas que la cierran. Tanner Street (z = 26) va aparte (se aplasta).
const TANNER_X = 36;   // las 40 casas de Tanner Street (20 por lado) ocupan x de −36 a 36
const CASA_NARRADOR = (() => { const d = 5.6; return casaP(CASA_YO[0], CALLE_MIA.z + VEREDA + d / 2, Math.PI, 5.2, d, 5.2, 4501, { muro: "lad0", techo: "teja1", color: 2, puertaX: .6, frontal: false, chimMax: CIELO(CASA_YO[0], CASA_YO[1]) - 1.5, chimSep: true, parches: true, farol: true, pendiente: 46 }) })();
const TECHOS_MIOS = [CASA_NARRADOR];   // casas de nuestra calle (z = 0) cuyos techos se rajan
{ const r = rng(4510);
  const fila = (c, side, xa, xb, tipo, extra = {}) => { let x = xa; while (x < xb - 2.4) { const lejos = !!c.lejos || Math.abs(x) > 46, pobre = tipo === "pobre", cielo = CIELO(x, c.z + side * 8);
      let w = pobre ? 4.2 + r() * 2.2 : tipo === "media" ? 5.2 + r() * 2.2 : 6.4 + r() * 2.4; if (xb - x - w < 3.2) w = xb - x; if (w < 2.6) break;
      const d = pobre ? 5.6 + r() * 1.6 : 6.4 + r() * 1.6, frontal = w < 5.6 && r() < .45, ang = (frontal ? 46 + r() * 10 : 42 + r() * 10);
      // el alero se elige para que la cumbrera quede entre 7 y 9 (sur) y la chimenea a ≤ cielo − 1,3
      const span = frontal ? w : d, rh = span / 2 * Math.tan(ang * Math.PI / 180), ridgeMax = Math.min(tipo === "buena" ? 13.5 : 8.9, cielo - 3.2), h = cl(ridgeMax - rh - r() * 1.2, 3.3, tipo === "buena" ? 9 : 6.2);
      const cx = x + w / 2, cz = c.z + side * (VEREDA + d / 2 + (r() < .2 ? .25 : 0)), ry = side > 0 ? Math.PI : 0;
      const C = casaP(cx, cz, ry, w - .04, d, h, 4520 + CASAS_P.length * 7, { frontal, pendiente: ang, simple: lejos, chimMax: cielo - 1.3, parches: pobre, techo: tipo === "buena" ? (r() < .7 ? "piz" + (r() * 3 | 0) : undefined) : undefined, muro: tipo === "buena" && r() < .5 ? "muro3" : undefined, chimSep: extra.chimSep && Math.abs(cx) < 30, ...extra.o });
      if (extra.chimSep && Math.abs(cx) < 30) TECHOS_MIOS.push(C);
      x += w + (r() < .16 ? 1.2 + r() * .8 : 0) } };   // a veces un callejón angosto
  CALLES_TODAS.forEach(c => { if (c.aplastada) return; const t = c.tipo, mia = c.z === CALLE_MIA.z;
    for (const side of [-1, 1]) { const G = side < 0 ? GAP_N : GAP_S;
      // de −X a la plazoleta y de la plazoleta a +X (en nuestra calle, del lado sur, la casa del narrador ya está puesta en x = −11,6 … −6,4)
      const xa0 = -CALLE_X, xb0 = c.poste - G, xa1 = c.poste + G, xb1 = CALLE_X;
      if (mia && side > 0) { fila(c, side, xa0, CASA_YO[0] - 2.6, t, { chimSep: 1 }); fila(c, side, xa1, xb1, t, { chimSep: 1 }) }
      else { fila(c, side, xa0, xb0, t, { chimSep: mia }); fila(c, side, xa1, xb1, t, { chimSep: mia }) }
      // casas retiradas que cierran la plazoleta
      if (!c.lejos) { const zf = c.z + side * 10.6, w0 = 2 * G; let x = c.poste - G + .2; const n = Math.max(2, Math.round(w0 / 5.4)); for (let k = 0; k < n; k++) { const w = (w0 - .4) / n, d = 5.0, cielo = CIELO(x, zf);
          const C = casaP(x + w / 2, zf + side * d / 2, side > 0 ? Math.PI : 0, w - .05, d, cl(Math.min(8.4, cielo - 3.4) - d / 2 * 1.05, 3.4, 5.8), 4900 + c.i * 31 + k, { frontal: k % 2 === 1, pendiente: 46, chimMax: cielo - 1.3, parches: t === "pobre", chimSep: mia, farol: true });
          if (mia) TECHOS_MIOS.push(C); x += w } } } }) }
const CASAS_M = L_CASA.fin(scene, CASA_MATS); CASAS_M.oscuro.castShadow = false; CASAS_M.vidrio.castShadow = false; if (CASAS_M.luz) CASAS_M.luz.castShadow = false;
const CASAS_LEJOS_M = L_LEJOS.fin(scene, CASA_MATS);

// ---------- TANNER STREET: 40 casas angostas (20 por lado, x de −36 a 36) con materiales que se aplastan desde arriba (tannerEstado en el detalle)
const TANNER_U = { top: { value: 99 } };   // altura (mundo) por encima de la cual todo se aplasta
const aplastable = m => { const q = m.clone(); q.onBeforeCompile = sh => { sh.uniforms.uTop = TANNER_U.top;
    sh.vertexShader = "uniform float uTop; varying float vCr;\n" + sh.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>
    { vec4 wp = modelMatrix * vec4(transformed, 1.); vCr = 0.; if (wp.y > uTop) { float e = wp.y - uTop; float hsh = fract(sin(dot(floor(wp.xz * 1.7), vec2(12.9898, 78.233))) * 43758.5453);
        wp.y = uTop + e * .05 + hsh * .25 * min(e, 1.); wp.x += (hsh - .5) * min(e, 3.) * .22; wp.z += (fract(hsh * 7.3) - .5) * min(e, 3.) * .22; vCr = clamp(e * .4, 0., 1.);
        transformed = (inverse(modelMatrix) * wp).xyz; } }`);
    sh.fragmentShader = "varying float vCr;\n" + sh.fragmentShader.replace("#include <color_fragment>", "#include <color_fragment>\n diffuseColor.rgb *= 1. - .38 * vCr;") };
  q.customProgramCacheKey = () => "aplasta"; return q };
const TANNER_MATS = Object.fromEntries(Object.entries(CASA_MATS).map(([k, m]) => [k, m.isMeshBasicMaterial ? m : aplastable(m)]));
const L_TANNER = lote(), TANNER_CASAS = [];
{ const r = rng(4700), c = CALLES[3], G = 6.2;
  for (const side of [-1, 1]) { const tramos = [[-TANNER_X, c.poste - G], [c.poste + G, TANNER_X]], tot = tramos.reduce((a, [p, q]) => a + q - p, 0); let n = 0;
    tramos.forEach(([xa, xb], ti) => { const k = ti === 0 ? Math.round(20 * (xb - xa) / tot) : 20 - n, w = (xb - xa) / k; for (let j = 0; j < k; j++) { const cx = xa + (j + .5) * w, d = 6 + r() * 1.4, cielo = CIELO(cx, c.z), ang = 50 + r() * 8, rh = w / 2 * Math.tan(ang * Math.PI / 180);
        const C = casaP(cx, c.z + side * (VEREDA + d / 2), side > 0 ? Math.PI : 0, w - .06, d, cl(8.6 - rh - r() * .8, 4.6, 6.4), 4710 + n * 13 + side * 300, { frontal: true, pendiente: ang, chimMax: cielo - 1.4, parches: true, L: L_TANNER, farol: r() < .25 });
        TANNER_CASAS.push(C); CASAS_P.pop(); n++ } }) } }
const TANNER_M = L_TANNER.fin(scene, TANNER_MATS);

// ---------- LA LOMA DE KELL: mansiones grandes de piedra clara (exentas, con pórtico de columnas, buhardillas, pizarra oscura)
const MANSIONES = [], L_MANS = lote();
{ const r = rng(4800), L = [[-38, -82, .1], [-14, -79, 0], [24, -79, 0], [44, -86, -.15], [-46, -104, .2], [-18, -103, 0], [18, -104, 0], [42, -108, -.1], [0, -126, 0], [-30, -126, .1], [32, -127, -.1], [-60, -92, .3], [60, -96, -.3]];
  L.forEach(([x, z, ry], i) => { const w = 13 + r() * 4, d = 9 + r() * 2, cielo = CIELO(x, z), y = SUELO(x, z);
    const C = casaP(x, z, ry, w, d, 8.6 + r() * 1.4, 4810 + i * 17, { muro: "sillarC", techo: "piz" + (i % 2), mansion: true, exenta: true, pendiente: 38 + r() * 6, chimMax: cielo - 4, color: [2, 0, 7, 1][i % 4], farol: true, puertaX: 0, L: L_MANS });
    MANSIONES.push(C) }) }
const MANSIONES_M = L_MANS.fin(scene, CASA_MATS); MANSIONES_M.oscuro.castShadow = false;

// ================= LOS POSTES =================
// Cada calle: UN poste de madera vieja (≈ 2 m de diámetro) con zunchos de hierro, que sube de la zapata (3,45 m) hasta un capitel de hierro
// justo debajo de CIELO(x, z). Abajo: zócalo de piedra, cuerpo de fundición del GATO DE ROSCA, la tuerca-cabrestante con 4 barras de madera en cruz
// (la MANIVELA, a 1,45 m: la empujan entre varios caminando en círculo) y el tornillo engrasado (Ø ≈ 1 m) entre la tuerca y la zapata.
// Peldaños de hierro del lado +x (dirección PELDANO_DIR). «HOLD IT UP» y el número del poste pintados tres veces alrededor.
const POSTE_R = 1.0, ZAP_Y = 3.2, POLO_Y = 3.45, BARRA_Y = 1.45, BARRA_R = 3.9, CAPITEL_H = .72, PELDANO_DIR = [1, 0], PELDANO_PASO = .38;
const POSTE_NUM = ["7", "11", "4", "9", "14", "16", "18"];   // número pintado en cada poste de calle (el de Tanner es Pole Nine)
const polR = (a, y, L) => POSTE_R * (1 - .07 * y / L) * (1 + .028 * (fbm2(Math.cos(a) * 1.4 + y * .23, Math.sin(a) * 1.4 - y * .17, 2) - .5) * 2 + .008 * Math.sin(a * 11 + y * .9));
// madera vieja del poste: vetas verticales, grietas hondas, nudos, manchas de grasa y de agua (gris marrón)
const T_POSTE = repT(pintarDoble(512, 1024, (c, z, w, h) => { const r = rng(4900); c.fillStyle = "#7a6a58"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
  for (let k = 0; k < 120; k++) { const x = r() * w, s = 20 + r() * 80, gr = c.createLinearGradient(x - s, 0, x + s, 0), cl2 = r() < .5 ? "60,48,36" : "170,160,140"; gr.addColorStop(0, `rgba(${cl2},0)`); gr.addColorStop(.5, `rgba(${cl2},${.08 + r() * .12})`); gr.addColorStop(1, `rgba(${cl2},0)`); c.fillStyle = gr; c.fillRect(x - s, 0, 2 * s, h) }
  for (let k = 0; k < 900; k++) { const x = r() * w, y = r() * h, L = 40 + r() * 300; c.strokeStyle = r() < .55 ? `rgba(50,38,28,${.15 + r() * .3})` : `rgba(200,190,170,${.1 + r() * .2})`; c.lineWidth = 1 + r() * 2.5; c.beginPath(); c.moveTo(x, y); for (let q = 1; q <= 6; q++) c.lineTo(x + Math.sin(q * 1.3 + k) * 2.5, y + L * q / 6); c.stroke();
    const v = r() < .5 ? 40 : 200; z.strokeStyle = `rgba(${v},${v},${v},.25)`; z.lineWidth = 2; z.beginPath(); z.moveTo(x, y); z.lineTo(x, y + L); z.stroke() }
  // grietas hondas (se abren en el medio)
  for (let k = 0; k < 26; k++) { const x = r() * w, y = r() * h, L = 120 + r() * 500, an = 3 + r() * 7, dx = (r() - .5) * 6; c.fillStyle = "rgba(24,18,12,.85)"; z.fillStyle = "#000"; for (const g of [c, z]) { g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + an, y + L / 2, x + dx, y + L); g.quadraticCurveTo(x - an * .6, y + L / 2, x, y); g.fill() } }
  for (let k = 0; k < 8; k++) { const x = r() * w, y = r() * h, s = 10 + r() * 18; c.fillStyle = "#4a3a2c"; c.beginPath(); c.ellipse(x, y, s * .7, s * 1.3, 0, 0, 7); c.fill(); c.strokeStyle = "rgba(30,22,14,.7)"; c.lineWidth = 2; for (let q = 1; q < 4; q++) { c.beginPath(); c.ellipse(x, y, s * .7 + q * 6, s * 1.3 + q * 14, 0, 0, 7); c.stroke() } z.fillStyle = "#303030"; z.beginPath(); z.ellipse(x, y, s * .7, s * 1.3, 0, 0, 7); z.fill() }
  for (let k = 0; k < 30; k++) { const x = r() * w, y = r() * h, s = 20 + r() * 70, gr = c.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, "rgba(30,22,14,.3)"); gr.addColorStop(1, "rgba(30,22,14,0)"); c.fillStyle = gr; c.fillRect(x - s, y - s, 2 * s, 2 * s) } }));
const M_POSTE = new THREE.MeshStandardMaterial({ map: T_POSTE[0], bumpMap: T_POSTE[1], bumpScale: 6, roughness: .92, color: "#d8d0c4" });
// el letrero pintado: tres copias alrededor (número en un círculo arriba, «HOLD / IT / UP» abajo), pintura blanca gastada con chorreaduras
const PX_M = 240, LET_Y0 = 1.8, LET_Y1 = 7.8;   // la calcomanía cubre de 1,8 a 7,8 m sobre la base del poste (entre zunchos)
const T_LETRAS = num => { const t = tex(1536, Math.round((LET_Y1 - LET_Y0) * PX_M), (g, w, h) => { const r = rng(4950 + num.length * 7 + num.charCodeAt(0)); g.clearRect(0, 0, w, h); g.textAlign = "center"; g.textBaseline = "middle";
    const yc = yy => (LET_Y1 - yy) * PX_M, col = "#efe9da";
    for (let k = 0; k < 3; k++) { const cx = (k + .5) * w / 3;
      const linea = (txt, yy, size, maxW) => { g.font = `900 ${size}px Impact, "Arial Black", sans-serif`; const m = g.measureText(txt).width, sx = Math.min(1.05, maxW / m), y = yc(yy);
        g.save(); g.translate(cx + 5, y + 7); g.scale(sx, 1); g.fillStyle = "rgba(30,22,14,.35)"; g.fillText(txt, 0, 0); g.restore(); g.save(); g.translate(cx, y); g.scale(sx, 1); g.fillStyle = col; g.fillText(txt, 0, 0); g.restore();
        for (let q = 0; q < 10; q++) { const x = cx + (r() - .5) * m * sx * .9, L = 14 + r() * 70; g.strokeStyle = "rgba(239,233,218,.85)"; g.lineWidth = 3 + r() * 6; g.lineCap = "round"; g.beginPath(); g.moveTo(x, y + size * .34); g.lineTo(x + (r() - .5) * 3, y + size * .34 + L); g.stroke() } };
      // el número en un círculo pintado a mano
      { const y = yc(7.05), R0 = .62 * PX_M; g.strokeStyle = col; g.lineWidth = 22; g.beginPath(); for (let a = 0; a <= 6.4; a += .1) { const q = R0 * (1 + .03 * Math.sin(a * 3 + k)); a ? g.lineTo(cx + Math.cos(a) * q, y + Math.sin(a) * q) : g.moveTo(cx + q, y) } g.stroke(); linea(num, 7.08, 250, 220) }
      linea("HOLD", 5.55, 230, 470); linea("IT", 4.05, 240, 470); linea("UP", 2.55, 240, 470) }
    g.globalCompositeOperation = "destination-out"; for (let k = 0; k < 2600; k++) { g.fillStyle = `rgba(0,0,0,${.2 + r() * .55})`; g.fillRect(r() * w, r() * h, 1 + r() * 4, 4 + r() * 30) }
    for (let k = 0; k < 160; k++) { g.fillStyle = "rgba(0,0,0,.85)"; g.beginPath(); g.ellipse(r() * w, r() * h, 3 + r() * 14, 6 + r() * 30, 0, 0, 7); g.fill() } g.globalCompositeOperation = "source-over" }); t.anisotropy = 8; return t };
// malla del cuerpo (o de la calcomanía, que sigue el mismo relieve + 8 mm): y local de y0 a y1, alto total L
const geoPoste = (L, y0, y1, dr = 0, NS = 40, uRep = 3, vFn = y => y / 3) => { const nr = Math.max(2, Math.ceil((y1 - y0) / .45)), pos = [], uv = [], idx = [];
  for (let i = 0; i <= nr; i++) { const y = lerp(y0, y1, i / nr); for (let j = 0; j <= NS; j++) { const u = j / NS, a = -u * Math.PI * 2, rr = polR(a, y, L) + dr; pos.push(Math.cos(a) * rr, y, Math.sin(a) * rr); uv.push(u * uRep, vFn(y)) } }
  for (let i = 0; i < nr; i++) for (let j = 0; j < NS; j++) { const a = i * (NS + 1) + j, b = a + NS + 1; idx.push(a, a + 1, b, a + 1, b + 1, b) }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g };
// zuncho: anillo de hierro con bisel
const geoZuncho = (rr, NS = 40) => new THREE.LatheGeometry([[rr - .02, -.09], [rr + .035, -.085], [rr + .045, -.06], [rr + .045, .06], [rr + .035, .085], [rr - .02, .09]].map(q => new THREE.Vector2(q[0], q[1])), NS);
// el tornillo: rosca de un filete (Ø 1 m, paso 0,17), de y 0,3 a ZAP_Y; corte = { y, a, s0 } deja el tajo de serrucho (las caras frescas van en el grupo 1)
const geoTornillo = (NS = 48, rpp = 10, corte = null) => { const R0 = .44, DP = .065, PI = .17, ya = .3, yb = ZAP_Y, pos = [], uv = [], idx0 = [], idx1 = [], idx2 = [], enK = [], ys = [];
  // filas: parejas en el tornillo, y muy apretadas alrededor del tajo (para que se vea el corte con sus dos caras frescas)
  const nr = Math.ceil((yb - ya) / PI * rpp); for (let i = 0; i <= nr; i++) ys.push(lerp(ya, yb, i / nr)); if (corte) { for (let k = -8; k <= 8; k++) ys.push(corte.y + k * corte.h / 7); ys.sort((p, q) => p - q) }
  ys.forEach(y => { for (let j = 0; j <= NS; j++) { const a = j / NS * Math.PI * 2, f = ((y / PI + a / (Math.PI * 2)) % 1 + 1) % 1, prof = cl(1.7 * (1 - Math.abs(2 * f - 1)) - .35);
      let rr = R0 + DP * prof * prof * (3 - 2 * prof), k = 0;
      if (corte && Math.abs(y - corte.y) < corte.h * .99) { const ca = Math.cos(a - corte.a); if (ca > corte.s0 / rr) { rr = Math.max(corte.s0 / ca, corte.s0); k = 1 } }
      pos.push(Math.cos(a) * rr, y, -Math.sin(a) * rr); uv.push(j / NS * 4, y * 2); enK.push(k) } });
  for (let i = 0; i < ys.length - 1; i++) for (let j = 0; j < NS; j++) { const a = i * (NS + 1) + j, b = a + NS + 1, q = [a, a + 1, b, a + 1, b + 1, b], n = enK[a] + enK[b] + enK[a + 1] + enK[b + 1]; (n === 0 ? idx0 : n === 4 ? idx2 : idx1).push(...q) }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex([...idx0, ...idx1, ...idx2]); g.addGroup(0, idx0.length, 0); g.addGroup(idx0.length, idx1.length, 1); g.addGroup(idx0.length + idx1.length, idx2.length, 2); g.computeVertexNormals(); return g };
const T_GRASA = tex(256, 256, (g, w, h) => { const r = rng(4960); g.fillStyle = "#808080"; g.fillRect(0, 0, w, h); for (let k = 0; k < 220; k++) { const x = r() * w, y = r() * h, s = 4 + r() * 22, gr = g.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, r() < .5 ? "rgba(255,255,255,.5)" : "rgba(0,0,0,.5)"); gr.addColorStop(1, "rgba(128,128,128,0)"); g.fillStyle = gr; g.fillRect(x - s, y - s, 2 * s, 2 * s) } }, [2, 3]);
const matTornillo = () => new THREE.MeshStandardMaterial({ color: "#2c241a", roughness: .16, metalness: .82, envMap: ENV_METAL_P, envMapIntensity: 1.25, bumpMap: T_GRASA, bumpScale: 1.6 });
const M_CORTE_F = new THREE.MeshStandardMaterial({ color: "#d4d6d8", roughness: .32, metalness: 1, envMap: ENV_METAL_P, envMapIntensity: 1.6, side: THREE.DoubleSide });   // acero recién cortado
const M_CORTE_D = new THREE.MeshStandardMaterial({ color: "#3a3c3e", roughness: .5, metalness: .9, envMap: ENV_METAL_P, envMapIntensity: .5 });   // fondo del tajo
const CORTE_Y = 2.45, CORTE_A = Math.PI * 1.5;   // el tajo: a 2,45 m del piso, del lado +z (hacia el sur)
const GEO_TORN = geoTornillo(), GEO_TORN_C = geoTornillo(64, 24, { y: CORTE_Y, a: CORTE_A, s0: .08, h: .026 });
// el cuerpo del gato (fundición), el zócalo de piedra, la cabeza del cabrestante (gira) y las barras (giran)
const GEO_ZOC_P = uvMuro(mergeG([[new THREE.CylinderGeometry(2.35, 2.5, .5, 8), TM(0, .05, 0, 0, Math.PI / 8, 0)], [new THREE.CylinderGeometry(2.75, 2.9, .2, 8), TM(0, -.08, 0, 0, Math.PI / 8, 0)]]), 2);
const GEO_GATO = (() => { const L = [], prof = [[0, .28], [1.6, .28], [1.6, .4], [1.42, .46], [1.2, .6], [1.1, .75], [1.08, 1.04], [1.2, 1.07], [1.2, 1.15], [.56, 1.15], [.56, 1.0]];
  L.push([new THREE.LatheGeometry(prof.map(q => new THREE.Vector2(q[0], q[1])), 32), TM()]);
  for (let k = 0; k < 14; k++) { const a = k / 14 * 6.283; L.push([new THREE.CylinderGeometry(.065, .065, .07, 6), TM(Math.cos(a) * 1.46, .43, Math.sin(a) * 1.46, 0, a, 0)]) }
  for (let k = 0; k < 6; k++) { const a = (k + .5) / 6 * 6.283; L.push([new THREE.BoxGeometry(.1, .55, .4), TM(Math.cos(a) * 1.22, .62, Math.sin(a) * 1.22, 0, -a, 0)]) }
  return mergeG(L) })();
const GEO_CAB_H = (() => { const L = [[new THREE.CylinderGeometry(.92, .92, .6, 16), TM(0, BARRA_Y, 0)], [new THREE.CylinderGeometry(.98, .98, .07, 16), TM(0, BARRA_Y - .27, 0)], [new THREE.CylinderGeometry(.98, .98, .07, 16), TM(0, BARRA_Y + .27, 0)]];
  for (let k = 0; k < 4; k++) { const a = k / 4 * 6.283; L.push([RB(.34, .34, .3, .03, 1), TM(Math.cos(a) * .98, BARRA_Y, -Math.sin(a) * .98, 0, a, 0)]); L.push([new THREE.CylinderGeometry(.09, .09, .14, 8), TM(Math.cos(a) * (BARRA_R - .06), BARRA_Y, -Math.sin(a) * (BARRA_R - .06), 0, a, Math.PI / 2)]) }
  for (let k = 0; k < 16; k++) { const a = k / 16 * 6.283; L.push([new THREE.SphereGeometry(.035, 6, 4), TM(Math.cos(a) * .93, BARRA_Y + .2, Math.sin(a) * .93)]) } return mergeG(L) })();
const barraGeo = (r0, r1) => { const g = new THREE.CylinderGeometry(.075, .075, r1 - r0, 8); g.rotateZ(Math.PI / 2); g.translate((r0 + r1) / 2, 0, 0); const p = g.attributes.position, u = g.attributes.uv; for (let i = 0; i < p.count; i++) u.setXY(i, p.getX(i) / 1.5, u.getX(i) * .3); return g };
const BARRA_ROTA_R = 2.15;   // donde se parte la barra (manivelaRota)
const GEO_BARRAS = mergeG([0, 1, 2, 3].map(k => [barraGeo(.95, BARRA_R - .1), TM(0, BARRA_Y, 0, 0, k * Math.PI / 2, 0)]));
const GEO_BARRAS3 = mergeG([1, 2, 3].map(k => [barraGeo(.95, BARRA_R - .1), TM(0, BARRA_Y, 0, 0, k * Math.PI / 2, 0)]).concat([[barraGeo(.95, BARRA_ROTA_R), TM(0, BARRA_Y, 0)]]));
const M_BARRA = new THREE.MeshStandardMaterial({ map: T_TABLA_N.c, bumpMap: T_TABLA_N.z, bumpScale: 2, roughness: .55, color: "#8a6a4a" });   // gastadas y lustradas por las manos
// capitel: cuello que se abre, plato cuadrado de 3 m y cuatro tornapuntas; arriba del plato apoya la placa de la tapa (la pone el otro agente)
const GEO_CAPITEL = (() => { const L = [[new THREE.LatheGeometry([[.9, -.02], [.98, .05], [1.12, .3], [1.38, .5], [1.45, .55]].map(q => new THREE.Vector2(q[0], q[1])), 32), TM()], [RB(3.0, .16, 3.0, .04, 1), TM(0, CAPITEL_H - .08, 0)]];
  for (let k = 0; k < 4; k++) { const a = k / 4 * 6.283 + Math.PI / 4, [g, m] = cilEntre([Math.cos(a) * .95, -.85, Math.sin(a) * .95], [Math.cos(a) * 1.95, CAPITEL_H - .16, Math.sin(a) * 1.95], .06, 6); L.push([g, m]); L.push([RB(.28, .1, .28, .02, 1), TM(Math.cos(a) * 1.95, CAPITEL_H - .2, Math.sin(a) * 1.95)]) }
  for (let k = 0; k < 16; k++) { const a = k / 16 * 6.283; L.push([new THREE.CylinderGeometry(.05, .05, .06, 6), TM(Math.cos(a) * 1.3, CAPITEL_H + .03, Math.sin(a) * 1.3)]) }
  return mergeG(L) })();
const GEO_PELDANO = mergeG([[new THREE.CylinderGeometry(.024, .024, .46, 6), TM(.2, 0, 0, Math.PI / 2, 0, 0)], [new THREE.CylinderGeometry(.022, .022, .26, 5), TM(.08, 0, -.22, 0, 0, Math.PI / 2)], [new THREE.CylinderGeometry(.022, .022, .26, 5), TM(.08, 0, .22, 0, 0, Math.PI / 2)]]);
const M_LETRAS = {};
const POSTES = [];   // { i, x, z, y0, top, tipo, g, cab, tor, matT, num, baja, … }
// un poste de madera completo (calles y Pole Nine en la Loma): grupo propio (se puede bajar, girar la manivela, romperla, engrasar)
function posteMadera(i, x, z, num, o = {}) { const y0 = SUELO(x, z), top = CIELO(x, z) - .02, L = top - CAPITEL_H - (y0 + POLO_Y), P = { i, x, z, y0, top, tipo: "madera", num, baja: 0, L, ang: 0 };
  const base = new THREE.Group(); base.position.set(x, y0, z); scene.add(base); P.base = base;
  const zoc = new THREE.Mesh(GEO_ZOC_P, M_ZOCALO); zoc.receiveShadow = zoc.castShadow = true; base.add(zoc);
  const gato = new THREE.Mesh(GEO_GATO, M_HIERRO_G); gato.castShadow = gato.receiveShadow = true; base.add(gato);
  const cab = new THREE.Group(); base.add(cab); P.cab = cab; const ch = new THREE.Mesh(GEO_CAB_H, M_HIERRO_G); ch.castShadow = ch.receiveShadow = true; cab.add(ch);
  P.barras = new THREE.Mesh(GEO_BARRAS, M_BARRA); P.barras.castShadow = true; P.barras.receiveShadow = true; cab.add(P.barras);
  P.matT = matTornillo(); P.tor = new THREE.Mesh(GEO_TORN, [P.matT, M_CORTE_F, M_CORTE_D]); P.tor.castShadow = true; P.tor.receiveShadow = true; base.add(P.tor);
  if (o.corte) { P.torC = new THREE.Mesh(GEO_TORN_C, [P.matT, M_CORTE_F, M_CORTE_D]); P.torC.castShadow = P.torC.receiveShadow = true; base.add(P.torC); P.tor.visible = false }
  // el poste: zapata de hierro, cuerpo, zunchos con remaches, peldaños, calcomanía, capitel (todo en P.g, que baja con posteBaja)
  const g = new THREE.Group(); base.add(g); P.g = g; const Li = lote(), Lw = lote();
  Li.add("h", new THREE.CylinderGeometry(1.12, 1.15, .25, 32), TM(0, ZAP_Y + .125, 0)); Li.add("h", new THREE.CylinderGeometry(1.06, 1.12, .2, 32), TM(0, ZAP_Y + .32, 0));
  for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283; Li.add("h", new THREE.BoxGeometry(.06, .5, .14), TM(Math.cos(a) * 1.05, ZAP_Y + .55, Math.sin(a) * 1.05, 0, -a, -.08)) }
  Lw.add("w", geoPoste(L, 0, L), TM(0, POLO_Y, 0));
  for (let y = .3; y < L - .3; y += 1.5) { const rr = polR(0, y, L) + .012; Li.add("h", geoZuncho(rr), TM(0, POLO_Y + y, 0)); for (let k = 0; k < 10; k++) { const a = (k + .5) / 10 * 6.283; Li.add("h", new THREE.SphereGeometry(.03, 5, 4), TM(Math.cos(a) * (rr + .045), POLO_Y + y, Math.sin(a) * (rr + .045))) } }
  P.peldanos = []; for (let y = POLO_Y + .35; y < POLO_Y + L - .5; y += PELDANO_PASO) { const rr = polR(0, y - POLO_Y, L); Li.add("h", GEO_PELDANO, TM(rr - .04, y, 0)); P.peldanos.push(y) }
  Li.fin(g, { h: M_HIERRO_O }); Lw.fin(g, { w: M_POSTE });
  const M_L = M_LETRAS[num] ||= new THREE.MeshStandardMaterial({ map: T_LETRAS(num), transparent: true, depthWrite: false, roughness: .8, bumpMap: T_POSTE[1], bumpScale: 3, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
  const dec = new THREE.Mesh(geoPoste(L, LET_Y0, Math.min(LET_Y1, L - .1), .008, 48, 1, y => (y - LET_Y0) / (LET_Y1 - LET_Y0)), M_L); dec.position.y = POLO_Y; dec.receiveShadow = true; dec.renderOrder = 1; g.add(dec);
  const cap = new THREE.Mesh(GEO_CAPITEL, M_HIERRO_G); cap.position.y = POLO_Y + L; cap.castShadow = cap.receiveShadow = true; g.add(cap);
  POSTES[i] = P; return P }
CALLES_TODAS.forEach(c => posteMadera(c.i, c.poste, c.z, POSTE_NUM[c.i], { corte: c.aplastada }));
// ---------- LOS POSTES DORADOS DE LA LOMA (nuevos, pintados de oro con zunchos de latón): todo instanciado
const T_ORO = repT(pintarDoble(256, 512, (c, z, w, h) => { const r = rng(4970); c.fillStyle = "#d8b048"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
  for (let k = 0; k < 500; k++) { const x = r() * w; c.strokeStyle = r() < .5 ? `rgba(150,100,30,${.08 + r() * .15})` : `rgba(255,240,180,${.1 + r() * .2})`; c.lineWidth = 1 + r() * 3; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + (r() - .5) * 4, h); c.stroke() } }));
const M_ORO = new THREE.MeshStandardMaterial({ map: T_ORO[0], bumpMap: T_ORO[1], bumpScale: 1, color: "#ffffff", roughness: .3, metalness: .85, envMap: ENV_METAL_P, envMapIntensity: 1.2 });
const M_MARMOL = new THREE.MeshStandardMaterial({ map: T_SILLAR_C[0], bumpMap: T_SILLAR_C[1], bumpScale: 2, roughness: .55, color: "#f4f0e8" });
const M_BARRA_L = new THREE.MeshStandardMaterial({ map: T_TABLA_N.c, bumpMap: T_TABLA_N.z, bumpScale: 1, roughness: .3, color: "#7a3a24", envMap: ENV_METAL_P, envMapIntensity: .3 });   // barras barnizadas
const M_TORN_L = new THREE.MeshStandardMaterial({ color: "#8a8478", roughness: .2, metalness: .9, envMap: ENV_METAL_P, envMapIntensity: 1.3 });
const LOMA_POSTES = (() => { const r = rng(4980), L = [], ok = (x, z) => MANSIONES.every(m => Math.hypot(m.x - x, m.z - z) > 11) && L.every(([a, b]) => Math.hypot(a - x, b - z) > 13) && Math.hypot(x - ESCALERA_KELL[0], z - ESCALERA_KELL[1]) > 7 && Math.hypot(x - POSTE_NUEVE_LOMA[0], z - POSTE_NUEVE_LOMA[1]) > 9 && LOMA_CAMINOS.every(([x0, z0, x1, z1, an]) => { const dx = x1 - x0, dz = z1 - z0, t = cl(((x - x0) * dx + (z - z0) * dz) / (dx * dx + dz * dz)); return Math.hypot(x - x0 - dx * t, z - z0 - dz * t) > an / 2 + 3.4 });
  for (let k = 0; k < 4000 && L.length < 15; k++) { const x = (r() - .5) * 130, z = -70 - r() * 62; if (ok(x, z)) L.push([x, z]) } return L })();
{ const n = LOMA_POSTES.length, r = rng(4981), im = (geo, mat, cnt = n) => { const m = new THREE.InstancedMesh(geo, mat, cnt); m.castShadow = m.receiveShadow = true; scene.add(m); return m };
  const gz = im(GEO_ZOC_P, M_MARMOL), gg = im(GEO_GATO, M_HIERRO_G), gc = im(GEO_CAB_H, M_LATON), gb = im(GEO_BARRAS, M_BARRA_L), gt = im(GEO_TORN, M_TORN_L), gp = im(geoPoste(1, 0, 1, 0, 32, 2, y => y * 6), M_ORO), gk = im(GEO_CAPITEL, M_LATON);
  const bandas = []; LOMA_POSTES.forEach(([x, z], k) => { const y0 = SUELO(x, z), top = CIELO(x, z) - .02, L2 = top - CAPITEL_H - (y0 + POLO_Y), ry = r() * 6; POSTES.push({ i: POSTES.length, x, z, y0, top, tipo: "oro", L: L2, baja: 0 });
    for (const m of [gz, gg, gc, gb, gt]) { dummy.position.set(x, y0, z); dummy.rotation.set(0, ry, 0); dummy.scale.set(1, 1, 1); dummy.updateMatrix(); m.setMatrixAt(k, dummy.matrix) }
    dummy.position.set(x, y0 + POLO_Y, z); dummy.rotation.set(0, 0, 0); dummy.scale.set(.97, L2, .97); dummy.updateMatrix(); gp.setMatrixAt(k, dummy.matrix);
    dummy.position.set(x, y0 + POLO_Y + L2, z); dummy.scale.set(1, 1, 1); dummy.updateMatrix(); gk.setMatrixAt(k, dummy.matrix);
    for (let y = .6; y < L2 - .4; y += 2.4) bandas.push([x, y0 + POLO_Y + y, z]) });
  const gband = im(geoZuncho(.98, 32), M_LATON, bandas.length); bandas.forEach(([x, y, z], k) => { dummy.position.set(x, y, z); dummy.rotation.set(0, 0, 0); dummy.scale.set(1, 1.4, 1); dummy.updateMatrix(); gband.setMatrixAt(k, dummy.matrix) }) }
// Pole Nine plantado en la Loma (el MISMO poste viejo, con el «9» y el tajo en el tornillo), entre los dorados
const POSTE_9L = POSTES.length; posteMadera(POSTE_9L, POSTE_NUEVE_LOMA[0], POSTE_NUEVE_LOMA[1], "9", { corte: true });
const POSTE_MI = CALLES.findIndex(c => c.z === CALLE_MIA.z), POSTE_9T = CALLES.findIndex(c => c.aplastada);

// ---------- API de los postes
// POSTE_TOP(i) → [x, y, z] de la cara de arriba del capitel (justo debajo de CIELO; baja con posteBaja). POSTE_BASE(i) → centro de la manivela (barras a 1,45 m).
// postePeldano(i, h) → [x, y, z] del peldaño más cercano a la altura h (metros sobre el piso), en la punta del peldaño (donde van manos y pies);
// el que trepa mira hacia −x (los peldaños salen del lado +x: PELDANO_DIR).
const POSTE_TOP = i => { const P = POSTES[i]; return [P.x, P.top - (P.baja || 0), P.z] };
const POSTE_BASE = i => { const P = POSTES[i]; return [P.x, P.y0 + BARRA_Y, P.z] };
function postePeldano(i, h) { const P = POSTES[i]; if (!P.peldanos) return [P.x + POSTE_R + .25, P.y0 + h, P.z]; const hl = h + (P.baja || 0); let b = P.peldanos[0]; for (const y of P.peldanos) if (Math.abs(y - hl) < Math.abs(b - hl)) b = y;
  const rr = polR(0, b - POLO_Y, P.L) + .4; return [P.x + rr * PELDANO_DIR[0], P.y0 + b - (P.baja || 0), P.z + rr * PELDANO_DIR[1]] }
// posteGrasa(i, brillo): 1 = tornillo recién engrasado (negro brillante), 0 = seco (marrón óxido, opaco; «a dry screw slips»)
function posteGrasa(i, b = 1) { const P = POSTES[i]; if (!P || !P.matT) return; b = cl(b); P.matT.color.set("#7a5a40").lerp(new THREE.Color("#2c241a"), b); P.matT.roughness = lerp(.78, .16, b); P.matT.metalness = lerp(.5, .82, b); P.matT.envMapIntensity = lerp(.35, 1.25, b); P.matT.bumpScale = lerp(3.5, 1.6, b) }
// manivelaGiro(i, ang): gira la tuerca-cabrestante (radianes; una vuelta por campanada = 2π) y, más lento, el tornillo
function manivelaGiro(i, ang = 0) { const P = POSTES[i]; if (!P || !P.cab) return; P.ang = ang; P.cab.rotation.y = ang; P.tor.rotation.y = ang * .5; if (P.torC) P.torC.rotation.y = ang * .5; if (P.rotaU > 0) manivelaRota(i, P.rotaU) }
// posteBaja(i, d): el poste (zapata, cuerpo, capitel) y el tornillo bajan d metros (el tornillo se mete en el gato); 0 = en su lugar
function posteBaja(i, d = 0) { const P = POSTES[i]; if (!P || !P.g) return; P.baja = d; P.g.position.y = -d; P.tor.position.y = -d; if (P.torC) P.torC.position.y = -d }

// ================= LA TAPA: el cielo de tablones pintados (cara de abajo), su espesor, el panel que se hunde y cae, el agujero, el polvo y la lluvia de oro =================
// Medidas de _comun_cielo.js (CIELO, LID_T, PANEL_MIO, AGUJERO, SOL_PINTADO, TANNER, CALLES). Lo de ARRIBA de la tapa (trigo, granja, cielo real) está en _lejos_cielo.js.
// La tapa es una «membrana»: cara de abajo, tierra de arriba y trigo se hunden juntos con la MISMA función (sagF en GLSL = tapaSag en JS).
// El panel PANEL_MIO es aparte (grupo TAPA.PAN): se hunde rígido (+ se dobla un poco) y al final cae entero con su campo encima.
const TAPA = (() => {
  const G = new THREE.Group(); G.name = "TAPA"; scene.add(G);
  const PAN = new THREE.Group(); PAN.name = "TAPA_PANEL"; scene.add(PAN);                  // el panel que se hunde y cae (con su tierra, su trigo y los montones)
  const PAN_ARR = new THREE.Group(); PAN.add(PAN_ARR);                                    // lo que el panel lleva ARRIBA (se esconde con la cámara abajo y todo cerrado)
  const sst = (a, b, v) => { const q = cl((v - a) / (b - a)); return q * q * (3 - 2 * q) };
  const hsh = (i, j) => { let n = (Math.imul(i | 0, 374761393) + Math.imul(j | 0, 668265263)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296 };
  const rd = (x, z) => { const i = Math.floor(x), j = Math.floor(z), u = x - i, v = z - j, a = u * u * (3 - 2 * u), b = v * v * (3 - 2 * v); return lerp(lerp(hsh(i, j), hsh(i + 1, j), a), lerp(hsh(i, j + 1), hsh(i + 1, j + 1), a), b) };
  const fbm = (x, z, o = 4) => { let s = 0, a = .5, f = 1, n = 0; for (let k = 0; k < o; k++) { s += a * rd(x * f + k * 17.3, z * f - k * 9.1); n += a; a *= .5; f *= 2.03 } return s / n };
  const nrm = a => { const l = Math.hypot(...a); return a.map(v => v / l) };
  // une geometrías (posición, normal, uv y color si hay): lista de [geo, matriz | null]
  const mergeGeo = list => { let n = 0; const qs = list.map(([g, m]) => { const q = g.index ? g.toNonIndexed() : g.clone(); if (m) q.applyMatrix4(m); n += q.attributes.position.count; return q }), hayC = qs.some(q => q.attributes.color);
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2), co = hayC ? new Float32Array(n * 3).fill(1) : null; let o = 0;
    qs.forEach(q => { const k = q.attributes.position.count; pos.set(q.attributes.position.array, o * 3); if (q.attributes.normal) nor.set(q.attributes.normal.array, o * 3); if (q.attributes.uv) uv.set(q.attributes.uv.array, o * 2); if (co && q.attributes.color) co.set(q.attributes.color.array, o * 3); o += k });
    const G = new THREE.BufferGeometry(); G.setAttribute("position", new THREE.BufferAttribute(pos, 3)); G.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); G.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); if (co) G.setAttribute("color", new THREE.BufferAttribute(co, 3)); G.computeBoundingSphere(); return G };
  const P0 = PANEL_MIO, PC = [(P0.x0 + P0.x1) / 2, (P0.z0 + P0.z1) / 2];
  const TAN_R = { x0: TANNER.x0, x1: TANNER.x1, z0: 16, z1: 36 }, TAN_PISO = 1.5;
  const HAZ = nrm([-.3, 1, -.35]);                 // dirección HACIA el sol de verdad para el haz que entra por el agujero/hueco (empinado: cae cerca del poste)
  const SOL_REAL = nrm([-.82, .34, -.3]);          // el sol dorado bajo que se ve desde arriba (oeste-noroeste, ≈ 21°)
  const AG_R = .45;                                // radio del agujero terminado (≈ 0,9 m)

  // ---------------- estado (lo pone la escena en cada cuadro; tapaReset() lo vuelve a cero) ----------------
  const ST = { t: 0, m: 0, cruje: 0, cae: 0, agu: 0, tan: 0, gotea: 0, foco: null, lluvia: 0, montones: true, escalera: false };
  // uniforms compartidos por TODOS los materiales que se hunden (la misma función en GLSL y en JS)
  const U = { uM: { value: 0 }, uCaeK: { value: 0 }, uTan: { value: 0 }, uTanD: { value: CIELO((TAN_R.x0 + TAN_R.x1) / 2, (TAN_R.z0 + TAN_R.z1) / 2) - TAN_PISO },
    uPan: { value: new THREE.Vector4(P0.x0, P0.x1, P0.z0, P0.z1) }, uTanR: { value: new THREE.Vector4(TAN_R.x0, TAN_R.x1, TAN_R.z0, TAN_R.z1) },
    uT: { value: 0 }, uWind: { value: 1 }, uAg: { value: new THREE.Vector2(AGUJERO[0], AGUJERO[1]) }, uAgR: { value: new THREE.Vector2(0, 0) },
    uEsc: { value: 0 }, uEscP: { value: new THREE.Vector2(ESCALERA_KELL[0], ESCALERA_KELL[1]) }, uEmi: { value: .9 }, uPisa: { value: 0 }, uSunV: { value: new THREE.Vector3(0, 0, -1) }, uGlow: { value: 0 } };
  const rectD = (x, z, r) => Math.hypot(Math.max(0, r.x0 - x, x - r.x1), Math.max(0, r.z0 - z, z - r.z1));
  const panB = (x, z) => Math.sin(Math.PI * cl((x - P0.x0) / (P0.x1 - P0.x0))) * Math.sin(Math.PI * cl((z - P0.z0) / (P0.z1 - P0.z0)));
  // hundimiento de la membrana (sin el panel): lo mismo que sagF() del GLSL
  const sagMain = (x, z) => U.uM.value * (1 - U.uCaeK.value) * (1 - sst(0, 5, rectD(x, z, P0))) + U.uTan.value * U.uTanD.value * (1 - sst(0, 4.5, rectD(x, z, TAN_R)));
  const enPanel = (x, z) => x > P0.x0 && x < P0.x1 && z > P0.z0 && z < P0.z1;
  const SAG_GLSL = `
uniform float uM, uCaeK, uTan, uTanD, uT, uWind, uPisa; uniform vec2 uAg;
uniform vec4 uPan, uTanR;
float rectD(vec2 p, vec4 r){ vec2 d = max(vec2(r.x - p.x, r.z - p.y), vec2(p.x - r.y, p.y - r.w)); return length(max(d, 0.)); }
float panB(vec2 p){ vec2 q = clamp((p - uPan.xz) / (uPan.yw - uPan.xz), 0., 1.); return sin(3.14159 * q.x) * sin(3.14159 * q.y); }
float sagF(vec2 p){
#ifdef PANEL
  return uM * .1 * panB(p);
#else
  return uM * (1. - uCaeK) * (1. - smoothstep(0., 5., rectD(p, uPan))) + uTan * uTanD * (1. - smoothstep(0., 4.5, rectD(p, uTanR)));
#endif
}
varying vec3 vWq; varying float vWave;`;
  const FRAG_HEAD = `uniform vec2 uAg, uAgR, uEscP; uniform float uEsc, uEmi, uGlow, uT; uniform vec3 uSunV; varying vec3 vWq; varying float vWave;
float hsh1(float n){ return fract(sin(n * 127.1) * 43758.5453); }`;
  // inyecta en un MeshStandardMaterial (o MeshDepthMaterial): hundimiento, viento (trigo), agujero y trampa de la escalera
  // o: { panel, wind, hole, esc, glow, frag: código que reemplaza a map_fragment, emi: código para emissivemap_fragment }
  const sagify = (mat, o = {}) => {
    mat.defines = Object.assign(mat.defines || {}, o.panel ? { PANEL: "" } : {}, o.wind ? { WIND: "" } : {}, o.hole ? { HOLE: "" } : {}, o.esc ? { ESC: "" } : {}, o.glow ? { GLOWW: "" } : {});
    const prev = mat.onBeforeCompile;
    mat.onBeforeCompile = (sh, r) => { if (prev) prev(sh, r); Object.assign(sh.uniforms, U, o.uni || {});
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\n" + SAG_GLSL).replace("#include <begin_vertex>", `#include <begin_vertex>
#ifdef USE_INSTANCING
  { vec4 o4 = modelMatrix * instanceMatrix * vec4(0., 0., 0., 1.); float sy = length(instanceMatrix[1].xyz); transformed.y -= sagF(o4.xz) / max(sy, 1e-4);
    vWave = 0.;
  #ifdef WIND
    float h = max(position.y, 0.), hh = h * h;
    float w = sin(uT * 1.3 + o4.x * .07 + o4.z * .05) * .45 + sin(dot(o4.xz, vec2(.075, .045)) - uT * 1.7) * .85 + sin(uT * 3.3 + o4.x * .9 + o4.z * 1.3) * .22;
    vec3 wd = vec3(.86, 0., .5) * (w * .085 + .05) * hh * uWind;
    { float pk = uPisa * (1. - smoothstep(1.9, 2.7, length(o4.xz - uAg))); if (pk > 0.) { vec2 od = normalize(o4.xz - uAg + vec2(1e-3, 0.)); float hs = h * length(instanceMatrix[1].xyz); vec3 pd = (vec3(od.x, 0., od.y) * .9 + vec3(.3 * od.y, 0., -.3 * od.x) * sin(o4.x * 7. + o4.z * 5.)) * hs - vec3(0., hs * .8, 0.); wd = mix(wd, pd, pk); w *= 1. - pk; } }
    transformed += inverse(mat3(instanceMatrix)) * wd; vWave = w;
  #endif
    vWq = (modelMatrix * instanceMatrix * vec4(transformed, 1.)).xyz; }
#else
  { vec4 o4 = modelMatrix * vec4(transformed, 1.); float sg = sagF(o4.xz); transformed.y -= sg; vWq = (modelMatrix * vec4(transformed, 1.)).xyz; vWave = sg; }
#endif`);
      if (!sh.fragmentShader.includes("#include <map_fragment>")) return;   // material de profundidad: solo el vértice
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\n" + FRAG_HEAD + (o.fragHead || "")).replace("#include <clipping_planes_fragment>", `#include <clipping_planes_fragment>
#ifdef HOLE
  { vec2 d = vWq.xz - uAg; float a = atan(d.y, d.x); vec2 R = uAgR * (1. + .07 * sin(a * 7. + 1.) + .05 * sin(a * 13.)); if (R.x > 1e-3 && dot(d / R, d / R) < 1.) discard; }
#endif
#ifdef ESC
  if (uEsc > .5 && abs(vWq.x - uEscP.x) < .72 && abs(vWq.z - uEscP.y) < .72) discard;
#endif`);
      if (o.frag) sh.fragmentShader = sh.fragmentShader.replace("#include <map_fragment>", o.frag);
      if (o.wind) sh.fragmentShader = sh.fragmentShader.replace("#include <color_fragment>", "#include <color_fragment>\n  diffuseColor.rgb *= .9 + .13 * vWave;");
      if (o.emi) sh.fragmentShader = sh.fragmentShader.replace("#include <emissivemap_fragment>", o.emi);
      else if (o.glow) sh.fragmentShader = sh.fragmentShader.replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
  { float sc = max(dot(normalize(-vViewPosition), uSunV), 0.); totalEmissiveRadiance += diffuseColor.rgb * uGlow * (.18 + 1.4 * pow(sc, 6.)); }`);
    };
    mat.customProgramCacheKey = () => JSON.stringify(Object.keys(mat.defines)) + (o.key || "");
    return mat };
  const depthDe = (o = {}) => sagify(new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking }), o);

  // ---------------- TEXTURAS PINTADAS ----------------
  const envuelto = (g, w, h, fn) => { for (const dx of [-w, 0, w]) for (const dy of [-h, 0, h]) { g.save(); g.translate(dx, dy); fn(); g.restore() } };
  // junta 3 lienzos grises en una textura RGB de datos (lineal, se repite)
  const juntar = (cs, w, h) => { const c = mk(w, h), g = c.getContext("2d", { willReadFrequently: true }), out = g.createImageData(w, h), ds = cs.map(x => x ? x.getContext("2d").getImageData(0, 0, w, h).data : null);
    for (let i = 0; i < w * h; i++) { out.data[i * 4] = ds[0] ? ds[0][i * 4] : 0; out.data[i * 4 + 1] = ds[1] ? ds[1][i * 4] : 0; out.data[i * 4 + 2] = ds[2] ? ds[2][i * 4] : 0; out.data[i * 4 + 3] = 255 }
    g.putImageData(out, 0, 0); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t };
  const lienzo = (w, h, fondo, fn) => { const c = mk(w, h), g = c.getContext("2d", { willReadFrequently: true }); g.fillStyle = fondo; g.fillRect(0, 0, w, h); fn(g, w, h); return c };
  const gris = v => { const q = Math.round(cl(v) * 255); return `rgb(${q},${q},${q})` };
  // DETALLE DE CERCA: 4 m (x) × 2 m (z) = 2048 × 1024; 8 tablones de 0,25 m por fila; vigas cada 0,6 m (clavos)
  const DET = (() => { const W = 2048, H = 1024, PX = 512, RH = 128, r = rng(7701), FIL = [];
    for (let k = 0; k < 8; k++) { const n = 1 + (r() * 2.2 | 0), xs = []; for (let q = 0; q < n; q++) xs.push(((q + .2 + r() * .6) / n) * W); FIL.push(xs) }
    const tramo = (k, x) => { const xs = FIL[k]; let i = 0; while (i < xs.length && xs[i] < x) i++; return i };   // tramo (tablón) dentro de la fila
    // vetas (R)
    const cG = lienzo(W, H, "#808080", (g) => { for (let k = 0; k < 8; k++) { const y0 = k * RH, xs = [0, ...FIL[k], W];
      for (let s = 0; s < xs.length - 1; s++) { const tono = .35 + r() * .35; g.fillStyle = gris(tono); g.fillRect(xs[s], y0, xs[s + 1] - xs[s], RH) }
      for (let q = 0; q < 70; q++) { const yy = y0 + r() * RH, x0 = r() * W, len = 200 + r() * 1400, am = 2 + r() * 6, f = .004 + r() * .01; g.strokeStyle = r() < .55 ? `rgba(0,0,0,${.08 + r() * .22})` : `rgba(255,255,255,${.06 + r() * .16})`; g.lineWidth = .8 + r() * 2.6;
        g.save(); g.beginPath(); g.rect(0, y0 + 2, W, RH - 4); g.clip(); g.beginPath(); for (let x = 0; x <= len; x += 16) { const X = x0 + x, Y = yy + Math.sin(X * f + q) * am; x ? g.lineTo(X, Y) : g.moveTo(X, Y) } g.stroke();
        g.beginPath(); for (let x = 0; x <= len; x += 16) { const X = x0 + x - W, Y = yy + Math.sin((X + W) * f + q) * am; x ? g.lineTo(X, Y) : g.moveTo(X, Y) } g.stroke(); g.restore() }
      for (let q = 0; q < 2; q++) if (r() < .7) { const kx = r() * W, ky = y0 + 25 + r() * (RH - 50), rx = 10 + r() * 18; for (let a = 0; a < 7; a++) { g.strokeStyle = `rgba(30,20,10,${.5 - a * .05})`; g.lineWidth = 2; g.beginPath(); g.ellipse(kx, ky, rx + a * 7, (rx + a * 7) * .45, 0, 0, 7); g.stroke() } g.fillStyle = "rgba(20,12,6,.8)"; g.beginPath(); g.ellipse(kx, ky, rx * .6, rx * .35, 0, 0, 7); g.fill() } } });
    // pintura (G): 1 = pintado; descascarado cerca de las juntas y los clavos, cuarteado en parches
    const cP = lienzo(W, H, "#ffffff", (g) => { g.fillStyle = "#000";
      const mancha = (cx, cy, R, n = 9) => { g.beginPath(); for (let a = 0; a < n; a++) { const an = a / n * 6.283, rr = R * (.45 + r() * .75); a ? g.lineTo(cx + Math.cos(an) * rr * 1.6, cy + Math.sin(an) * rr * .8) : g.moveTo(cx + Math.cos(an) * rr * 1.6, cy + Math.sin(an) * rr * .8) } g.closePath(); g.fill() };
      for (let k = 0; k < 8; k++) { const y0 = k * RH;
        for (let q = 0; q < 26; q++) { const x = r() * W, yy = y0 + (r() < .5 ? r() * 16 : RH - r() * 16); envuelto(g, W, H, () => mancha(x, yy, 4 + r() * 16, 7)) }        // a lo largo de las juntas
        for (const bx of FIL[k]) for (let q = 0; q < 6; q++) envuelto(g, W, H, () => mancha(bx + (r() - .5) * 40, y0 + r() * RH, 6 + r() * 18));        // en los extremos de los tablones
        if (r() < .5) { const cx = r() * W, cy = y0 + RH / 2; envuelto(g, W, H, () => { mancha(cx, cy, 20 + r() * 40, 12); for (let q = 0; q < 14; q++) mancha(cx + (r() - .5) * 220, cy + (r() - .5) * 90, 3 + r() * 9, 6) }) } }
      // cuarteado (grietas finas en la pintura)
      for (let q = 0; q < 9; q++) { const cx = r() * W, cy = r() * H; g.strokeStyle = "#000"; for (let l = 0; l < 40; l++) { let x = cx + (r() - .5) * 260, y = cy + (r() - .5) * 140; g.lineWidth = .8 + r() * 1.4; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 6; s++) { x += (r() - .5) * 40; y += (r() - .5) * 24; g.lineTo(x, y) } g.stroke() } } });
    // altura (B): juntas hondas, uniones de punta, clavos salientes, la madera pelada un poco más abajo
    const cH = lienzo(W, H, gris(.82), (g) => {
      g.globalCompositeOperation = "multiply"; g.drawImage(cP, 0, 0); g.globalCompositeOperation = "source-over";   // pelado = más bajo (0 → negro: se corrige abajo)
      g.fillStyle = gris(.82); g.globalAlpha = .82; g.fillRect(0, 0, W, H); g.globalAlpha = 1;
      for (let k = 0; k <= 8; k++) { const y = k * RH; g.fillStyle = "#000"; g.fillRect(0, y - 3, W, 6); g.fillStyle = gris(.4); g.fillRect(0, y - 5, W, 2); g.fillRect(0, y + 3, W, 2) }
      for (let k = 0; k < 8; k++) for (const bx of FIL[k]) { g.fillStyle = "#000"; g.fillRect(bx - 2, k * RH, 4, RH); g.fillStyle = gris(.45); g.fillRect(bx - 4, k * RH, 2, RH) }
      for (let k = 0; k < 8; k++) for (let x = 120; x < W; x += .6 * PX) for (const yy of [30, RH - 30]) { const X = x + (r() - .5) * 8, Y = k * RH + yy + (r() - .5) * 6; g.fillStyle = gris(.3); g.beginPath(); g.arc(X, Y, 9, 0, 7); g.fill(); g.fillStyle = gris(1); g.beginPath(); g.arc(X, Y, 6, 0, 7); g.fill() } });
    // manchas (R2): agua sucia que baja por las juntas, aureolas de goteo, óxido de los clavos — y clavos (G2)
    const cS = lienzo(W, H, "#000", (g) => { for (let k = 0; k <= 8; k++) for (let q = 0; q < 10; q++) { const x = r() * W, y = k * RH, L = 60 + r() * 380, A = 10 + r() * 30;
        envuelto(g, W, H, () => { const gr = g.createRadialGradient(x, y, 0, x, y, L); gr.addColorStop(0, `rgba(255,255,255,${.35 + r() * .4})`); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.save(); g.translate(x, y); g.scale(1, A / L); g.translate(-x, -y); g.beginPath(); g.arc(x, y, L, 0, 7); g.fill(); g.restore() }) }
      for (let q = 0; q < 26; q++) { const x = r() * W, y = r() * H, R0 = 14 + r() * 50; for (let a = 0; a < 2; a++) { g.strokeStyle = `rgba(255,255,255,${.08 + r() * .12})`; g.lineWidth = 4 + r() * 8; envuelto(g, W, H, () => { g.beginPath(); g.ellipse(x, y, R0 * (1 + a * .35), R0 * (.8 + a * .3), r(), 0, 7); g.stroke() }) } }
      for (let k = 0; k < 8; k++) for (let x = 120; x < W; x += .6 * PX) for (const yy of [30, RH - 30]) { const gr = g.createRadialGradient(x, k * RH + yy, 0, x, k * RH + yy, 30 + r() * 30); gr.addColorStop(0, "rgba(255,255,255,.35)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(x - 70, k * RH + yy - 70, 140, 140) }
      for (let q = 0; q < 34; q++) { const x = r() * W, y = r() * H, L = 30 + r() * 90; const gr = g.createLinearGradient(x, y, x + (r() - .5) * 30, y + L); gr.addColorStop(0, `rgba(255,255,255,${.3 + r() * .3})`); gr.addColorStop(1, "rgba(255,255,255,0)"); g.strokeStyle = gr; g.lineWidth = 3 + r() * 6; g.lineCap = "round"; envuelto(g, W, H, () => { g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 20, y + L); g.stroke() }) } });
    const cN = lienzo(W, H, "#000", (g) => { for (let k = 0; k < 8; k++) for (let x = 120; x < W; x += .6 * PX) for (const yy of [30, RH - 30]) { g.fillStyle = "#fff"; g.beginPath(); g.arc(x, k * RH + yy, 7, 0, 7); g.fill() } });
    return { d1: juntar([cG, cP, cH], W, H), d2: juntar([cS, cN, null], W, H) } })();
  // NUBES PINTADAS: textura de 160 m que se repite. R = nube, G = luz de la nube (1 arriba-izquierda, 0 abajo), B = pinceladas del celeste
  const NUB = (() => { const W = 2048, r = rng(7702), NUBS = [];
    for (let k = 0; k < 9; k++) { const cx = r() * W, cy = r() * W, sw = 260 + r() * 460, bumps = []; const n = 5 + (r() * 6 | 0);
      for (let q = 0; q < n; q++) { const u = (q + .5) / n - .5, R = sw * (.16 + r() * .14) * (1 - Math.abs(u) * .7); bumps.push([cx + u * sw, cy - R * .35 - r() * R * .4, R]) }
      bumps.push([cx, cy + sw * .02, sw * .28]); NUBS.push({ cx, cy, sw, bumps }) }
    const forma = (g, fn) => NUBS.forEach(N => envuelto(g, W, W, () => fn(N)));
    const cA = lienzo(W, W, "#000", g => { g.filter = "blur(2px)"; forma(g, N => { g.fillStyle = "#fff"; N.bumps.forEach(([x, y, R]) => { g.beginPath(); for (let a = 0; a <= 24; a++) { const an = a / 24 * 6.283, rr = R * (1 + .06 * Math.sin(an * 5 + x)); a ? g.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr) : g.moveTo(x + rr, y) } g.fill() });
        g.fillRect(N.cx - N.sw * .48, N.cy - 6, N.sw * .96, N.sw * .1) }); g.filter = "none";
      // borde de pincel: trazos cortos sueltos alrededor
      forma(g, N => N.bumps.forEach(([x, y, R]) => { for (let q = 0; q < 14; q++) { const an = -Math.PI + r() * Math.PI * 1.1, rr = R * (.92 + r() * .12); g.strokeStyle = `rgba(255,255,255,${.4 + r() * .4})`; g.lineWidth = 3 + r() * 6; g.beginPath(); g.arc(x, y, rr, an, an + .2 + r() * .3); g.stroke() } })) });
    const cL = lienzo(W, W, "#000", g => { forma(g, N => N.bumps.forEach(([x, y, R]) => { const gr = g.createRadialGradient(x - R * .3, y - R * .45, R * .1, x, y, R * 1.05); gr.addColorStop(0, "#fff"); gr.addColorStop(.6, "#d8d8d8"); gr.addColorStop(1, "#5a5a5a"); g.fillStyle = gr; g.beginPath(); g.arc(x, y, R * 1.06, 0, 7); g.fill() }));
      forma(g, N => { const gr = g.createLinearGradient(0, N.cy - N.sw * .1, 0, N.cy + N.sw * .08); gr.addColorStop(0, "rgba(60,60,60,0)"); gr.addColorStop(1, "rgba(60,60,60,.9)"); g.fillStyle = gr; g.fillRect(N.cx - N.sw * .55, N.cy - N.sw * .1, N.sw * 1.1, N.sw * .2) });
      // pinceladas ingenuas dentro de las nubes (curvas blancas y grises)
      forma(g, N => { for (let q = 0; q < 40; q++) { const [x, y, R] = N.bumps[r() * N.bumps.length | 0], an = r() * 6.283, rr = R * r() * .85; g.strokeStyle = r() < .6 ? `rgba(255,255,255,${.25 + r() * .35})` : `rgba(40,40,40,${.15 + r() * .2})`; g.lineWidth = 4 + r() * 9; g.lineCap = "round"; g.beginPath(); g.arc(x + Math.cos(an) * rr * .3, y + Math.sin(an) * rr * .3, rr, an, an + .4 + r() * .8); g.stroke() } }) });
    const cB = lienzo(W, W, "#808080", g => { for (let q = 0; q < 700; q++) { const x = r() * W, y = r() * W, L = 80 + r() * 380, a = (r() - .5) * .5; g.strokeStyle = r() < .5 ? `rgba(255,255,255,${.04 + r() * .09})` : `rgba(0,0,0,${.04 + r() * .09})`; g.lineWidth = 12 + r() * 40; g.lineCap = "round";
        envuelto(g, W, W, () => { g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * L * .5, y + Math.sin(a) * L * .5 + (r() - .5) * 30, x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke() }) } });
    return juntar([cA, cL, cB], W, W) })();
  // CORTE de la tapa (bordes del agujero, del hueco y los costados del panel): 2 m × LID_T. Abajo el tablón pintado, las vigas, el entablonado de arriba y la tierra
  const CORTE = (() => { const W = 1024, H = Math.round(1024 / 2 * LID_T), py = v => H - v / LID_T * H;
    const [c, z] = pintarDoble(W, H, (c, z, w, h) => { const r = rng(7703); c.fillStyle = "#1c130c"; c.fillRect(0, 0, w, h); z.fillStyle = "#202020"; z.fillRect(0, 0, w, h);
      // tierra (0,9 → 1,3)
      c.fillStyle = "#4a3422"; c.fillRect(0, 0, w, py(.9)); z.fillStyle = "#909090"; z.fillRect(0, 0, w, py(.9));
      for (let k = 0; k < 900; k++) { const x = r() * w, y = r() * py(.9); c.fillStyle = r() < .5 ? `rgba(30,20,12,${.3 + r() * .5})` : `rgba(140,110,80,${.2 + r() * .4})`; c.beginPath(); c.ellipse(x, y, 2 + r() * 7, 2 + r() * 5, r() * 3, 0, 7); c.fill(); z.fillStyle = gris(.4 + r() * .6); z.beginPath(); z.ellipse(x, y, 2 + r() * 6, 2 + r() * 4, 0, 0, 7); z.fill() }
      for (let k = 0; k < 40; k++) { let x = r() * w, y = 0; c.strokeStyle = `rgba(190,160,110,${.4 + r() * .4})`; c.lineWidth = .8 + r() * 1.6; c.beginPath(); c.moveTo(x, y); for (let s = 0; s < 8; s++) { x += (r() - .5) * 18; y += 6 + r() * 14; c.lineTo(x, y) } c.stroke() }   // raíces del trigo
      c.fillStyle = "#8a7a3a"; c.fillRect(0, 0, w, 6);
      // entablonado de arriba (0,76 → 0,9)
      c.fillStyle = "#6a5038"; c.fillRect(0, py(.9), w, py(.76) - py(.9)); z.fillStyle = "#c0c0c0"; z.fillRect(0, py(.9), w, py(.76) - py(.9));
      for (let x = r() * 120; x < w; x += 90 + r() * 160) { c.fillStyle = "#140c06"; c.fillRect(x, py(.9), 3, py(.76) - py(.9)) }
      // vigas (0,06 → 0,76): cortes de punta con anillos cada 0,6 m, y el hueco oscuro entre vigas con tierra colada
      for (let x = 40; x < w; x += .6 * 512) { const bw = .14 * 512; c.fillStyle = "#7a5a3c"; c.fillRect(x, py(.76), bw, py(.06) - py(.76)); z.fillStyle = "#d0d0d0"; z.fillRect(x, py(.76), bw, py(.06) - py(.76));
        for (let a = 1; a < 9; a++) { c.strokeStyle = `rgba(60,40,24,${.5})`; c.lineWidth = 1.5; c.strokeRect(x + a * 4, py(.76) + a * 6, bw - a * 8, py(.06) - py(.76) - a * 12) } }
      for (let k = 0; k < 60; k++) { const x = r() * w, y = py(.76) + r() * (py(.06) - py(.76)); c.fillStyle = `rgba(80,60,40,${.3 + r() * .3})`; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 6, y + 40 + r() * 60); c.lineTo(x - 6, y + 40 + r() * 60); c.fill() }   // tierra colada
      // tablón de abajo (0 → 0,06) con la pintura celeste en el canto inferior
      c.fillStyle = "#86684a"; c.fillRect(0, py(.06), w, h - py(.06)); z.fillStyle = "#d8d8d8"; z.fillRect(0, py(.06), w, h - py(.06));
      for (let x = r() * 60; x < w; x += .25 * 512) { c.fillStyle = "#1a120a"; c.fillRect(x, py(.06), 3, h - py(.06)) }
      c.fillStyle = "#7fb2e6"; c.fillRect(0, h - 5, w, 5);
      for (let k = 0; k < 200; k++) { c.strokeStyle = `rgba(40,26,14,${.2 + r() * .3})`; c.lineWidth = 1; const x = r() * w, y = py(.06) + r() * (h - py(.06)); c.beginPath(); c.moveTo(x, y); c.lineTo(x + 20 + r() * 60, y + (r() - .5) * 3); c.stroke() } });
    [c, z].forEach(t => { t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.ClampToEdgeWrapping });
    return { c, z } })();

  // ---------------- MATERIALES ----------------
  const SKY_A = new THREE.Color("#4d8fd8"), SKY_B = new THREE.Color("#b4d6f0"), NUB_SH = new THREE.Color("#a9bdd6"), NUB_HI = new THREE.Color("#eef3f8"), SOL_C = new THREE.Color("#efe5c9"), HALO_C = new THREE.Color("#e9e6c8");
  const LID_FRAG = `{
  vec2 wp = vWq.xz; float dist = length(vViewPosition);
  // el cielo pintado: degradé (más hondo arriba del pueblo, más pálido lejos), pinceladas, nubes y el sol blanco
  float r0 = length(wp - vec2(0., -30.));
  vec3 sky = mix(uSkyA, uSkyB, smoothstep(15., 560., r0));
  vec3 nb = texture2D(tNub, wp / 120. + vec2(.13, .41)).rgb;
  vec3 nb2 = texture2D(tNub, vec2(wp.y, -wp.x) / 113. + vec2(.57, .2)).rgb;
  float m2 = max(smoothstep(.45, .56, texture2D(tNub, wp / 1300. + vec2(.3, .7)).b), 1. - smoothstep(120., 220., r0));
  sky *= .9 + .2 * nb.b;
  float c2 = nb2.r * m2; float cl = max(nb.r, c2); float shd = nb.r >= c2 ? nb.g : nb2.g;
  vec2 dso = wp - uSol; float ds = length(dso), ang = atan(dso.y, dso.x);
  cl *= smoothstep(10., 18., ds) * smoothstep(7., 13., length(wp - uAg)) * (1. - .75 * smoothstep(2.5, 7., vWave));
  vec3 paint = mix(sky, mix(uNubSh, uNubHi, shd), cl);
  paint = mix(paint, uNubSh * .82, smoothstep(.12, .35, cl) * (1. - smoothstep(.4, .75, cl)) * .55);   // contorno de pincel
  float rr = 3.3 * (1. + .022 * sin(ang * 9.) + .014 * sin(ang * 23. + 1.));
  float halo = (1. - smoothstep(rr, 7.5, ds)) * (.7 + .3 * sin(ds * 4.1 + sin(ang * 5.) * .9));
  paint = mix(paint, uHalo, clamp(halo, 0., 1.) * .28);
  float disco = 1. - smoothstep(rr - .05, rr + .05, ds); gSunM = max(disco, clamp(halo, 0., 1.) * .5);
  vec3 sc = uSunC * (.9 + .1 * nb.b) * (.94 + .06 * sin(ang * 3. + ds * 6.) * sin(ds * 9. - ang * 2.));
  sc = mix(sc, uSunC * .82, smoothstep(rr - .45, rr - .05, ds));
  paint = mix(paint, sc, disco);
  // de cerca: tablones, vetas, clavos, pintura descascarada, manchas de goteo
  float nd = gl_FrontFacing ? max(1. - smoothstep(2., 8., dist), smoothstep(2.5, 7., vWave) * (1. - smoothstep(30., 70., dist))) : 1.;
  vec3 col = paint;
  float fw = fwidth(wp.y);
  float jz = abs(fract(wp.y / .25 + .5) - .5) * .25;
  float jl = (1. - smoothstep(0., fw * 1.2 + .004, jz)) * min(1., .007 / max(fw, 1e-5));
  col *= 1. - jl * .1 * (1. - smoothstep(8., 45., dist));
  if (nd > 0.) {
    float blk = floor(wp.y / 2.);
    vec2 tuv = vec2(wp.x / 4. + hsh1(blk) * 7.31, wp.y / 2.);
    vec2 gx = dFdx(tuv), gy = dFdy(tuv);
    vec3 d1 = textureGrad(tDet, tuv, gx, gy).rgb, d2 = textureGrad(tDet2, tuv, gx, gy).rgb;
    float row = floor(wp.y / .25), seg = floor(tuv.x * 3.);
    float ph = hsh1(row * 3.1 + seg * 17.7);
    vec3 painted = paint * (.95 + .1 * (ph - .5)) * (.95 + .08 * (d1.r - .5));
    vec3 wood = mix(vec3(.075, .062, .05), vec3(.21, .18, .145), d1.r);
    vec3 near = mix(wood, painted, smoothstep(.35, .65, d1.g));
    near = mix(near, near * vec3(.62, .55, .45), d2.r * .7);
    near = mix(near, vec3(.06, .045, .035), smoothstep(.3, .7, d2.g));
    float groove = 1. - smoothstep(.08, .42, d1.b);
    near *= 1. - .9 * groove;
    float sh2 = clamp(1. + 5. * (dFdx(d1.b) * -.55 + dFdy(d1.b) * .8), .55, 1.35);
    col = mix(col, near * sh2, nd);
  }
  if (!gl_FrontFacing) col = mix(col, vec3(.15, .11, .075), .5 + .3 * texture2D(tNub, wp / 7.).b);
  diffuseColor.rgb = col;
}`;
  const lidUni = () => ({ tNub: { value: NUB }, tDet: { value: DET.d1 }, tDet2: { value: DET.d2 }, uSol: { value: new THREE.Vector2(SOL_PINTADO[0], SOL_PINTADO[1]) }, uSkyA: { value: SKY_A }, uSkyB: { value: SKY_B }, uNubSh: { value: NUB_SH }, uNubHi: { value: NUB_HI }, uSunC: { value: SOL_C }, uHalo: { value: HALO_C } });
  const LID_HEAD = "\nfloat gSunM = 0.; uniform sampler2D tNub, tDet, tDet2; uniform vec2 uSol; uniform vec3 uSkyA, uSkyB, uNubSh, uNubHi, uSunC, uHalo;";
  const lidMat = (panel) => sagify(new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .92, metalness: 0, side: THREE.DoubleSide }), { panel, hole: panel, esc: !panel, uni: lidUni(), fragHead: LID_HEAD, frag: LID_FRAG, emi: "totalEmissiveRadiance = diffuseColor.rgb * uEmi * (1. - .5 * gSunM) * (gl_FrontFacing ? 1. : .35);", key: "lid" });
  const M_LID = lidMat(false), M_LID_P = lidMat(true);
  const corteMat = (panel, hole) => sagify(new THREE.MeshStandardMaterial({ map: CORTE.c, bumpMap: CORTE.z, bumpScale: 3, roughness: .95, side: THREE.DoubleSide }), { panel, hole, key: "corte" });
  const M_CORTE = corteMat(false, false), M_CORTE_P = corteMat(true, false);

  // ---------------- MALLAS ----------------
  // coordenadas: parejas (paso) en [a0, a1] y crecen de a `grow` hasta ±lim
  const coords = (a0, a1, step, lim, grow) => { const L = []; for (let v = a0; v <= a1 + 1e-6; v += step) L.push(+v.toFixed(3)); let s = step, v = L[L.length - 1]; while (v < lim) { s *= grow; v += s; L.push(v) } s = step; v = L[0]; while (v > -lim) { s *= grow; v -= s; L.unshift(v) } return L };
  // grilla: y = fy(x, z); skip(x0, x1, z0, z1) saltea celdas; abajo = normales hacia abajo; color = fc(x, z) → [r,g,b]
  const grilla = (xs, zs, fy, { skip = null, abajo = false, uvs = 4, fc = null } = {}) => { const nx = xs.length, nz = zs.length, pos = new Float32Array(nx * nz * 3), uv = new Float32Array(nx * nz * 2), col = fc ? new Float32Array(nx * nz * 3) : null, idx = [];
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const k = j * nx + i, x = xs[i], z = zs[j]; pos[k * 3] = x; pos[k * 3 + 1] = fy(x, z); pos[k * 3 + 2] = z; uv[k * 2] = x / uvs; uv[k * 2 + 1] = z / uvs; if (col) { const c = fc(x, z); col.set(c, k * 3) } }
    for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) { if (skip && skip(xs[i], xs[i + 1], zs[j], zs[j + 1])) continue; const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1; abajo ? idx.push(a, b, c, b, d, c) : idx.push(a, c, b, b, c, d) }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); if (col) g.setAttribute("color", new THREE.BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals(); g.computeBoundingSphere(); return g };
  const fueraPanel = (x0, x1, z0, z1) => x0 >= P0.x0 - 1e-3 && x1 <= P0.x1 + 1e-3 && z0 >= P0.z0 - 1e-3 && z1 <= P0.z1 + 1e-3;
  // cara de ABAJO (el cielo que se ve), toda la tapa menos el panel
  const LID = new THREE.Mesh(grilla(coords(-40, 40, .5, 1700, 1.07), coords(-20, 50, .5, 1700, 1.07), (x, z) => CIELO(x, z), { skip: fueraPanel, abajo: true }), M_LID);
  LID.frustumCulled = false; LID.receiveShadow = false; LID.castShadow = false; G.add(LID);
  // el panel: cara de abajo
  const PXS = coords(P0.x0, P0.x1, .5, 0, 1).filter(v => v >= P0.x0 && v <= P0.x1), PZS = coords(P0.z0, P0.z1, .5, 0, 1).filter(v => v >= P0.z0 && v <= P0.z1);
  const LID_P = new THREE.Mesh(grilla(PXS, PZS, (x, z) => CIELO(x, z), { abajo: true }), M_LID_P); LID_P.castShadow = true; LID_P.receiveShadow = false; PAN.add(LID_P);
  // paredes de corte: a lo largo de un borde (lista de [x, z]), de CIELO a CIELO + LID_T, mirando hacia `n` (normal horizontal)
  const pared = (pts, mat) => { const pos = [], uv = [], idx = []; let s = 0;
    pts.forEach(([x, z], i) => { if (i) s += Math.hypot(x - pts[i - 1][0], z - pts[i - 1][1]); const y0 = CIELO(x, z); pos.push(x, y0, z, x, y0 + LID_T, z); uv.push(s / 2, 0, s / 2, 1); if (i) { const a = (i - 1) * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3) } });
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return new THREE.Mesh(g, mat) };
  const borde = (x0, z0, x1, z1, n = 60) => Array.from({ length: n + 1 }, (_, i) => [lerp(x0, x1, i / n), lerp(z0, z1, i / n)]);
  const LADOS = [[P0.x0, P0.z0, P0.x1, P0.z0], [P0.x1, P0.z0, P0.x1, P0.z1], [P0.x1, P0.z1, P0.x0, P0.z1], [P0.x0, P0.z1, P0.x0, P0.z0]];
  const BORDE_HUECO = new THREE.Group(); G.add(BORDE_HUECO); LADOS.forEach(L => { const m = pared(borde(...L), M_CORTE); m.receiveShadow = true; BORDE_HUECO.add(m) });
  const LADOS_PANEL = new THREE.Group(); PAN.add(LADOS_PANEL); LADOS.forEach(L => { const m = pared(borde(...L), M_CORTE_P); m.castShadow = m.receiveShadow = true; LADOS_PANEL.add(m) });
  // astillas y vigas rotas en el borde del hueco (aparecen cuando cae el panel)
  const ROTOS = (() => { const r = rng(7704), vig = [], ast = [];
    LADOS.forEach(([x0, z0, x1, z1]) => { const L = Math.hypot(x1 - x0, z1 - z0), dx = (x1 - x0) / L, dz = (z1 - z0) / L, nx = dz, nz = -dx;   // nx,nz apunta hacia adentro del hueco
      for (let s = .3; s < L; s += .6) { const x = x0 + dx * s, z = z0 + dz * s, y = CIELO(x, z); if (r() < .55) vig.push({ p: [x + nx * (.1 + r() * .5), y + .42, z + nz * (.1 + r() * .5)], ry: Math.atan2(nx, nz), rx: (r() - .5) * .5 - .3, s: [1, 1, .4 + r() * 1.4] }) }
      for (let s = .1; s < L; s += .25) { const x = x0 + dx * s, z = z0 + dz * s, y = CIELO(x, z); if (r() < .7) ast.push({ p: [x + nx * r() * .2, y + .02, z + nz * r() * .2], ry: Math.atan2(nx, nz) + (r() - .5) * .6, rx: .5 + r() * 1.1, s: [.7 + r() * .6, .6 + r() * 1.6, .7 + r() * .6] }) } });
    const gV = new THREE.BoxGeometry(.14, .68, 1); gV.translate(0, 0, .5); const gA = new THREE.ConeGeometry(.06, .5, 4); gA.translate(0, -.25, 0); gA.rotateX(Math.PI);
    const M_V = SMt(CORTE.c, { roughness: .9, color: "#9a7a58" }), M_A = new THREE.MeshStandardMaterial({ color: "#8a6a4a", roughness: .9 });
    const mk_ = (geo, mat, L) => { const m = new THREE.InstancedMesh(geo, mat, L.length); L.forEach((q, i) => { dummy.position.set(...q.p); dummy.rotation.set(q.rx, q.ry, 0, "YXZ"); dummy.scale.set(...q.s); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix) }); m.castShadow = m.receiveShadow = true; BORDE_HUECO.add(m); return m };
    return [mk_(gV, M_V, vig), mk_(gA, M_A, ast)] })();
  // el agujero del narrador: cilindro de corte (escalado al tamaño del tajo)
  const RIM = (() => { const g = new THREE.CylinderGeometry(1, 1, LID_T, 40, 1, true), p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) { const a = Math.atan2(p.getZ(i), p.getX(i)), k = 1 + .07 * Math.sin(a * 7 + 1) + .05 * Math.sin(a * 13); p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); uv.setX(i, uv.getX(i) * 1.4) }
    g.translate(0, LID_T / 2, 0); g.computeVertexNormals(); const m = new THREE.Mesh(g, corteMat(true, false)); m.position.set(AGUJERO[0], CIELO(...AGUJERO), AGUJERO[1]); m.visible = false; m.castShadow = m.receiveShadow = true; PAN.add(m); return m })();

  // ---------------- PLACAS DE HIERRO abulonadas donde apoya cada poste ----------------
  const T_RUST = (() => { const [c, z] = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(7705); c.fillStyle = "#3a3634"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
      for (let k = 0; k < 500; k++) { const x = r() * w, y = r() * h, R = 2 + r() * 22; c.fillStyle = r() < .5 ? `rgba(130,60,24,${.15 + r() * .4})` : `rgba(20,18,16,${.2 + r() * .3})`; c.beginPath(); c.ellipse(x, y, R, R * (.5 + r() * .5), r() * 3, 0, 7); c.fill(); z.fillStyle = gris(.3 + r() * .7); z.beginPath(); z.arc(x, y, R * .6, 0, 7); z.fill() }
      c.strokeStyle = "rgba(200,190,170,.25)"; c.lineWidth = 6; c.strokeRect(8, 8, w - 16, h - 16) }); return { c, z } })();
  const M_PLACA = new THREE.MeshStandardMaterial({ map: T_RUST.c, bumpMap: T_RUST.z, bumpScale: 2, roughness: .62, metalness: .55 });
  const T_MANCHA = tex(256, 256, (g, w, h) => { const r = rng(7706); g.clearRect(0, 0, w, h); for (let k = 0; k < 60; k++) { const a = r() * 6.283, d = 40 + r() * 70, x = w / 2 + Math.cos(a) * d, y = h / 2 + Math.sin(a) * d, gr = g.createRadialGradient(x, y, 0, x, y, 14 + r() * 26); gr.addColorStop(0, `rgba(96,60,34,${.15 + r() * .25})`); gr.addColorStop(1, "rgba(96,60,34,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h) } });
  const M_MANCHA = new THREE.MeshBasicMaterial({ map: T_MANCHA, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const PLACAS = [];
  const placaEn = (x, z, par = G) => { const g = new THREE.Group(), S = 1.8; par.add(g);
    const pl = part(new THREE.BoxGeometry(S, .06, S), M_PLACA, 0, -.03, 0, g, 0); pl.castShadow = true;
    const bl = new THREE.InstancedMesh(new THREE.CylinderGeometry(.045, .045, .05, 6), SM("#2c2826", { metalness: .6, roughness: .45 }), 20); let n = 0;
    for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) { if (i > 0 && i < 4 && j > 0 && j < 4) continue; dummy.position.set(-S / 2 + .14 + i * (S - .28) / 4, -.075, -S / 2 + .14 + j * (S - .28) / 4); dummy.rotation.set(0, i + j, 0); dummy.scale.setScalar(1); dummy.updateMatrix(); bl.setMatrixAt(n++, dummy.matrix) }
    bl.count = n; g.add(bl);
    const mc = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.8), M_MANCHA); mc.rotation.x = Math.PI / 2; mc.position.y = -.004; g.add(mc);
    const q = { g, x, z, par }; PLACAS.push(q); return q };
  CALLES.forEach(C => { const x = C.poste, z = C.z; placaEn(x, z, enPanel(x, z) ? PAN : G) });
  placaEn(POSTE_NUEVE_LOMA[0], POSTE_NUEVE_LOMA[1]);

  // ---------------- PARTÍCULAS ----------------
  const PSCALE = { value: 1000 };
  const ptsMat = (vtx, frag, uni, add = false) => new THREE.ShaderMaterial({ uniforms: Object.assign({}, U, { uScale: PSCALE }, uni), vertexShader: SAG_GLSL + "\nuniform float uScale;\n" + vtx, fragmentShader: frag, transparent: true, depthWrite: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending });
  // POLVO Y TIERRA que caen de las juntas: kind 0 polvo fino (lento, flota), 1 granos (caen), 2 chorritos (siempre del mismo punto)
  const POLVO = (() => { const N = 9000, r = rng(7707), aO = new Float32Array(N * 4), aR = new Float32Array(N * 4), pos = new Float32Array(N * 3);
    const CH = Array.from({ length: 40 }, () => [lerp(-24, 24, r()), Math.round(lerp(-9, 10, r()) / .25) * .25]);
    for (let i = 0; i < N; i++) { const kind = i < 1800 ? 2 : r() < .5 ? 0 : 1; let x, z;
      if (kind === 2) { const c = CH[i % CH.length]; x = c[0] + (r() - .5) * .04; z = c[1] } else { x = lerp(-30, 30, r()); z = r() < .7 ? Math.round(lerp(-11, 12, r()) / .25) * .25 : lerp(-11, 12, r()) }
      aO.set([x, z, kind === 2 ? (i / CH.length | 0) / 45 + r() * .01 : r(), kind], i * 4); aR.set([r(), r(), Math.sqrt(r()) * Math.cos(r() * 6.283), Math.sqrt(r()) * Math.sin(r() * 6.283)], i * 4); pos.set([x, CIELO(x, z), z], i * 3) }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("aO", new THREE.BufferAttribute(aO, 4)); g.setAttribute("aR", new THREE.BufferAttribute(aR, 4));
    const m = new THREE.Points(g, ptsMat(`
attribute vec4 aO, aR; uniform float uAmt, uFocoY; uniform vec4 uFoco; varying float vA; varying float vK;
void main(){
  float kind = aO.w; float T = kind < .5 ? 5. : 2.2;
  float tau = mod(uT + aO.z * T, T);
  vec2 xz = mix(aO.xy, uFoco.xy + aR.zw * uFoco.z, uFoco.w);
  float y0 = mix(position.y, uFocoY, uFoco.w) - sagF(xz) - .03;
  float fall = kind < .5 ? (.55 * tau + .12 * tau * tau) : (kind < 1.5 ? 4.9 * tau * tau : 4.9 * tau * tau);
  vec3 p = vec3(xz.x, y0 - fall, xz.y);
  if (kind < .5) { p.x += sin(tau * 1.7 + aR.y * 6.) * .25 * tau; p.z += cos(tau * 1.3 + aR.x * 6.) * .2 * tau; }
  vA = step(aR.x, uAmt) * smoothstep(.0, .25, tau) * smoothstep(.1, .8, p.y) * (kind < .5 ? (1. - tau / T) : 1.);
  vK = kind;
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  float sz = (kind < .5 ? .04 : (kind < 1.5 ? .05 + aR.y * .05 : .045)) * mix(1., .35, uFoco.w);
  vA *= smoothstep(.35, 1.2, -mv.z);
  gl_PointSize = vA > 0. ? clamp(sz * uScale / -mv.z, 1.2, mix(40., 9., uFoco.w)) : 0.;
  gl_Position = projectionMatrix * mv;
}`, `varying float vA; varying float vK; uniform vec3 uCol;
void main(){ vec2 d = gl_PointCoord - .5; float a = 1. - smoothstep(.3, .5, length(d)); if (a * vA < .02) discard;
  vec3 c = vK < .5 ? vec3(.62, .52, .40) : vec3(.24, .17, .11); gl_FragColor = vec4(c * uCol, a * vA * (vK < .5 ? .55 : .95)); }`, { uAmt: { value: 0 }, uFoco: { value: new THREE.Vector4(0, 0, 1, 0) }, uFocoY: { value: 12 }, uCol: { value: new THREE.Color(1, 1, 1) } }));
    m.frustumCulled = false; m.renderOrder = 3; G.add(m); return m })();
  // EL HAZ de sol de verdad (agujero o hueco): volumen aditivo + polvo brillante + una luz focal sin sombras
  const BEAM_V = `varying vec2 vUv; varying vec3 vN, vV; void main(){ vUv = uv; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`;
  const BEAM_F = `uniform float uA, uT; uniform vec3 uC; varying vec2 vUv; varying vec3 vN, vV;
void main(){ float f = abs(dot(vN, vV)); float st = .62 + .25 * sin(vUv.x * 41. + sin(vUv.x * 13.) * 2. + uT * .3) + .13 * sin(vUv.x * 97. - uT * .5);
  float al = uA * pow(f, 1.4) * st * smoothstep(0., .08, vUv.y) * (1. - smoothstep(.55, 1., vUv.y));
  gl_FragColor = vec4(uC * al, al); }`;
  const beamMat = () => new THREE.ShaderMaterial({ uniforms: { uA: { value: 0 }, uT: U.uT, uC: { value: new THREE.Color("#ffd49a") } }, vertexShader: BEAM_V, fragmentShader: BEAM_F, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  // un prisma inclinado: sección `sec` (lista de [x,z]) arriba en y=0, baja a lo largo de −HAZ hasta y = −L
  const prisma = (sec, L) => { const pos = [], uv = [], idx = [], n = sec.length, dx = -HAZ[0] / HAZ[1] * L, dz = -HAZ[2] / HAZ[1] * L; let per = 0; const acc = [0]; for (let i = 1; i <= n; i++) { per += Math.hypot(sec[i % n][0] - sec[i - 1][0], sec[i % n][1] - sec[i - 1][1]); acc.push(per) }
    for (let i = 0; i <= n; i++) { const [x, z] = sec[i % n]; for (let j = 0; j <= 8; j++) { const v = j / 8; pos.push(x + dx * v, -L * v, z + dz * v); uv.push(acc[i] / per, v) } }
    for (let i = 0; i < n; i++) for (let j = 0; j < 8; j++) { const a = i * 9 + j, b = a + 9; idx.push(a, b, a + 1, a + 1, b, b + 1) }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g };
  const HAZ_AG = new THREE.Mesh(prisma(Array.from({ length: 24 }, (_, i) => [Math.cos(i / 24 * 6.283) * AG_R, Math.sin(i / 24 * 6.283) * AG_R]), 16), beamMat()); HAZ_AG.frustumCulled = false; HAZ_AG.renderOrder = 4; G.add(HAZ_AG);
  const HAZ_HU = new THREE.Mesh(prisma([[P0.x0, P0.z0], [P0.x1, P0.z0], [P0.x1, P0.z1], [P0.x0, P0.z1]].map(([x, z]) => [x - PC[0], z - PC[1]]).flatMap((p, i, L) => { const q = L[(i + 1) % 4]; return Array.from({ length: 12 }, (_, k) => [lerp(p[0], q[0], k / 12), lerp(p[1], q[1], k / 12)]) }), 16), beamMat()); HAZ_HU.frustumCulled = false; HAZ_HU.renderOrder = 4; G.add(HAZ_HU);
  const MOTAS = (() => { const N = 2600, r = rng(7708), aR = new Float32Array(N * 4); for (let i = 0; i < N; i++) aR.set([r(), r(), r(), r()], i * 4);
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3)); g.setAttribute("aR", new THREE.BufferAttribute(aR, 4));
    const m = new THREE.Points(g, ptsMat(`
attribute vec4 aR; uniform vec4 uBox; uniform vec3 uTop, uHaz; uniform float uL, uA, uDisk; varying float vA;
void main(){
  vec2 o = uDisk > .5 ? vec2(cos(aR.y * 6.283), sin(aR.y * 6.283)) * sqrt(aR.x) * uBox.x : vec2(mix(uBox.x, uBox.y, aR.x), mix(uBox.z, uBox.w, aR.y));
  float s = fract(aR.z + uT * (.004 + aR.w * .006)) * uL;
  vec3 p = uTop + vec3(o.x, 0., o.y) - uHaz / uHaz.y * s;
  p += vec3(sin(uT * .4 + aR.w * 30.), sin(uT * .3 + aR.z * 20.) * .6, cos(uT * .35 + aR.x * 25.)) * .12;
  vA = uA * smoothstep(0., .1, s / uL) * (1. - smoothstep(.7, 1., s / uL)) * (.5 + .5 * sin(uT * 2. + aR.w * 40.));
  vec4 mv = modelViewMatrix * vec4(p, 1.); gl_PointSize = vA > .01 ? clamp((.012 + aR.x * .02) * uScale / -mv.z, 1., 14.) : 0.; gl_Position = projectionMatrix * mv; }`,
      `varying float vA; void main(){ vec2 d = gl_PointCoord - .5; float a = (1. - smoothstep(.15, .5, length(d))) * vA; gl_FragColor = vec4(vec3(1., .86, .6) * a, a); }`,
      { uBox: { value: new THREE.Vector4() }, uTop: { value: new THREE.Vector3() }, uHaz: { value: new THREE.Vector3(...HAZ) }, uL: { value: 14 }, uA: { value: 0 }, uDisk: { value: 1 } }, true));
    m.frustumCulled = false; m.renderOrder = 5; G.add(m); return m })();
  const SPOT = new THREE.SpotLight("#ffd29a", 0, 0, .1, .3, 0); SPOT.castShadow = false; scene.add(SPOT, SPOT.target);

  // LLUVIA DE ORO: espigas que caen girando, terrones de tierra y briznas que brillan al sol
  const ESPIGA_G = (() => { const L = [], cab = new THREE.CylinderGeometry(.022, .009, .1, 5, 3); { const p = cab.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i), k = .55 + .45 * Math.sin((y / .1 + .5) * Math.PI); p.setX(i, p.getX(i) * k * 1.3); p.setZ(i, p.getZ(i) * k) } } cab.translate(0, .05, 0); L.push([cab, null]);
    const tal = new THREE.CylinderGeometry(.003, .003, .22, 3); tal.translate(0, -.11, 0); L.push([tal, null]); const bar = new THREE.PlaneGeometry(.004, .07); for (let k = 0; k < 4; k++) { const b = bar.clone(); b.translate(0, .035, 0); b.rotateZ((k - 1.5) * .12); b.rotateY(k * .8); b.translate(0, .09, 0); L.push([b, null]) }
    return mergeGeo(L) })();
  const M_ORO = new THREE.MeshStandardMaterial({ color: "#f0c45e", roughness: .4, metalness: .15, emissive: "#b07820", emissiveIntensity: .7, side: THREE.DoubleSide });
  const LLUVIA = (() => { const N = 2400, NT = 80, r = rng(7709), d = [], dt = []; for (let i = 0; i < N; i++) { const borde = r() < .55; let x, z; if (borde) { const s = r() * 2 * (P0.x1 - P0.x0 + P0.z1 - P0.z0); const L1 = P0.x1 - P0.x0, L2 = P0.z1 - P0.z0; if (s < L1) { x = P0.x0 + s; z = P0.z0 + r() * 1.2 } else if (s < 2 * L1) { x = P0.x0 + s - L1; z = P0.z1 - r() * 1.2 } else if (s < 2 * L1 + L2) { x = P0.x0 + r() * 1.2; z = P0.z0 + s - 2 * L1 } else { x = P0.x1 - r() * 1.2; z = P0.z0 + s - 2 * L1 - L2 } } else { x = lerp(P0.x0, P0.x1, r()); z = lerp(P0.z0, P0.z1, r()) }
      d.push([x, z, r(), 2.2 + r() * 1.6, r() * 6.28, r() * 6.28, 2.6 + r() * 1.2, r()]) }
    for (let i = 0; i < NT; i++) dt.push([lerp(P0.x0, P0.x1, r()), lerp(P0.z0, P0.z1, r()), r(), r() * 6.28, .5 + r()]);
    const m = new THREE.InstancedMesh(ESPIGA_G, M_ORO, N), mt = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.045, 0), new THREE.MeshStandardMaterial({ color: "#3a2a1c", roughness: 1 }), NT); [m, mt].forEach(q => { q.frustumCulled = false; q.castShadow = true; G.add(q) });
    // briznas: puntos dorados que destellan
    const NB = 6000, aR = new Float32Array(NB * 4); for (let i = 0; i < NB; i++) aR.set([r(), r(), r(), r()], i * 4);
    const gb = new THREE.BufferGeometry(); gb.setAttribute("position", new THREE.BufferAttribute(new Float32Array(NB * 3), 3)); gb.setAttribute("aR", new THREE.BufferAttribute(aR, 4));
    const mb = new THREE.Points(gb, ptsMat(`attribute vec4 aR; uniform float uA, uY0, uY1; varying float vA;
void main(){ float T = 9.; float tau = mod(uT + aR.z * T, T); float y = uY0 - tau * (1. + aR.w * .8);
  vec3 p = vec3(mix(uPan.x, uPan.y, aR.x) + sin(tau * 1.3 + aR.w * 20.) * .5, y, mix(uPan.z, uPan.w, aR.y) + cos(tau * 1.1 + aR.z * 20.) * .5);
  vA = step(aR.w, uA) * smoothstep(uY1, uY1 + 1., y) * (.35 + .65 * pow(.5 + .5 * sin(uT * 9. + aR.x * 60.), 4.));
  vec4 mv = modelViewMatrix * vec4(p, 1.); gl_PointSize = vA > .01 ? clamp((.03 + aR.y * .03) * uScale / -mv.z, 1.5, 12.) : 0.; gl_Position = projectionMatrix * mv; }`,
      `varying float vA; void main(){ vec2 d = gl_PointCoord - .5; float a = (1. - smoothstep(.1, .5, length(d))) * vA; gl_FragColor = vec4(vec3(1., .82, .45) * a, a); }`, { uA: { value: 0 }, uY0: { value: 14 }, uY1: { value: 2.4 } }, true));
    mb.frustumCulled = false; mb.renderOrder = 5; G.add(mb);
    return { m, mt, mb, d, dt, N, NT } })();

  // ---------------- LUGARES para la cámara ----------------
  const AG_Y0 = CIELO(...AGUJERO);
  const KELL_BORDE = [AGUJERO[0] + 4.5, CIELO(AGUJERO[0] + 4.5, P0.z0 - .9) + LID_T, P0.z0 - .9];

  // ---------------- API ----------------
  const tapaCaeY = u => { const y0 = CIELO(...PC) - ST.m; u = cl(u); if (u < .3) return lerp(y0, 7, (u / .3) ** 2); if (u < .45) return 7 - .3 * Math.sin(Math.PI * (u - .3) / .15); if (u < .85) { const q = (u - .45) / .4; return 7 - 6 * (q < .5 ? 2 * q * q : 1 - (-2 * q + 2) ** 2 / 2) + .08 * Math.sin(q * 40) * (1 - q) } return 1 + .12 * Math.sin((u - .85) / .15 * Math.PI) * (1 - (u - .85) / .15) };
  // altura de la cara de ABAJO en (x, z) con el hundimiento actual (dentro del panel caído: la cara de abajo del panel)
  const TAPA_Y = (x, z) => { if (enPanel(x, z)) { if (ST.cae > 0) return CIELO(x, z) + (tapaCaeY(ST.cae) - CIELO(...PC)); return CIELO(x, z) - ST.m - ST.m * .1 * panB(x, z) } return CIELO(x, z) - sagMain(x, z) };
  // piso de ARRIBA (tierra) en (x, z) con el hundimiento actual (sin relieve fino: ± 8 cm)
  const ARRIBA_Y = (x, z) => TAPA_Y(x, z) + LID_T;
  const AGUJERO_W = () => [AGUJERO[0], TAPA_Y(...AGUJERO), AGUJERO[1]];
  function tapaReset() { Object.assign(ST, { m: 0, cruje: 0, cae: 0, agu: 0, tan: 0, gotea: 0, foco: null, lluvia: 0, montones: true, escalera: false }) }
  const tapaHundir = (m, o = {}) => { ST.m = cl(m, 0, 4.5); ST.cruje = o.cruje ?? (ST.m > 0 && ST.m < 3.49 ? .6 : 0); if (o.polvo !== false && ST.m > 0) ST.gotea = Math.max(ST.gotea, o.polvo ?? .35) };
  const tapaGotea = (t, cant = .5, o = {}) => { ST.gotea = cl(cant); ST.foco = o.en ? [o.en[0], o.en[1], o.r ?? .6] : null };
  const tapaAgujero = u => { ST.agu = cl(u) };
  const tapaCae = u => { ST.cae = cl(u) };
  const lluviaTrigo = (t, u) => { ST.lluvia = cl(u) };
  const tanerCae = u => { ST.tan = cl(u) };

  // por cuadro (llamar después de tapaReset y de las funciones de arriba): mueve todo y prende/apaga lo que corresponde
  function tapa(t) { ST.t = t; U.uT.value = t;
    const caeK = sst(0, .12, ST.cae); U.uM.value = ST.m; U.uCaeK.value = ST.cae > 0 ? caeK : 0; U.uTan.value = ST.tan < 1 ? ST.tan * ST.tan * (3 - 2 * ST.tan) : 1;
    // el panel: rígido + crujidos; cae entero
    if (ST.cae > 0) { const y = tapaCaeY(ST.cae); PAN.position.set(0, y - CIELO(...PC), 0); PAN.rotation.set(.012 * Math.sin(Math.PI * ST.cae) + (ST.cae > .85 ? 0 : .004 * Math.sin(ST.cae * 50)), 0, -.018 * Math.sin(Math.PI * ST.cae)) }
    else { PAN.position.set(0, -ST.m, 0); PAN.rotation.set(0, 0, 0); }
    BORDE_HUECO.visible = ST.cae > 0; LADOS_PANEL.visible = ST.cae > 0;
    // agujero: tajo (0 → .35: se alarga) y después se abre (→ 1)
    const u = ST.agu, rx = u <= 0 ? 0 : u < .35 ? AG_R * u / .35 : AG_R, rz = u <= 0 ? 0 : u < .35 ? .025 : lerp(.025, AG_R, eOut((u - .35) / .65));
    U.uAgR.value.set(rx, rz); U.uPisa.value = sst(.35, .6, u); RIM.visible = u > 0 && ST.cae === 0; if (RIM.visible) RIM.scale.set(rx, 1, rz);
    // placas: siguen a la tapa
    PLACAS.forEach(q => { if (q.par === PAN) q.g.position.set(q.x, CIELO(q.x, q.z), q.z); else q.g.position.set(q.x, CIELO(q.x, q.z) - sagMain(q.x, q.z), q.z) });
    // polvo de las juntas
    { const M = POLVO.material.uniforms; M.uAmt.value = ST.gotea; POLVO.visible = ST.gotea > 0; if (ST.foco) { M.uFoco.value.set(ST.foco[0], ST.foco[1], ST.foco[2], 1); M.uFocoY.value = CIELO(ST.foco[0], ST.foco[1]) } else M.uFoco.value.w = 0 }
    // el haz
    const aguA = ST.cae > 0 ? 0 : sst(.35, 1, u), huA = sst(.05, .35, ST.cae);
    HAZ_AG.visible = aguA > 0; HAZ_HU.visible = huA > 0; MOTAS.visible = aguA > 0 || huA > 0;
    const MU = MOTAS.material.uniforms;
    if (aguA > 0) { const p = AGUJERO_W(); HAZ_AG.position.set(p[0], p[1] + .02, p[2]); HAZ_AG.scale.set(rx / AG_R, 1, rz / AG_R); HAZ_AG.material.uniforms.uA.value = .55 * aguA;
      MU.uDisk.value = 1; MU.uBox.value.set(Math.min(rx, rz) * .9, 0, 0, 0); MU.uTop.value.set(p[0], p[1], p[2]); MU.uL.value = p[1] / HAZ[1] * .98; MU.uA.value = aguA;
      SPOT.position.set(p[0] + HAZ[0] * 40, p[1] + HAZ[1] * 40, p[2] + HAZ[2] * 40); SPOT.target.position.set(p[0] - HAZ[0] * 12, p[1] - HAZ[1] * 12, p[2] - HAZ[2] * 12); SPOT.angle = Math.atan(Math.max(rx, rz) / 40) * 1.08; SPOT.penumbra = .35; SPOT.intensity = 16 * aguA }
    else if (huA > 0) { const y = CIELO(...PC); HAZ_HU.position.set(PC[0], y, PC[1]); HAZ_HU.material.uniforms.uA.value = .2 * huA;
      MU.uDisk.value = 0; MU.uBox.value.set(P0.x0 + 1, P0.x1 - 1, P0.z0 + 1, P0.z1 - 1); MU.uTop.value.set(0, y, 0); MU.uL.value = y / HAZ[1]; MU.uA.value = huA;
      SPOT.position.set(PC[0] + HAZ[0] * 150, y + HAZ[1] * 150, PC[1] + HAZ[2] * 150); SPOT.target.position.set(PC[0], 0, PC[1]); SPOT.angle = Math.atan(17 / 150); SPOT.penumbra = .25; SPOT.intensity = 7 * huA }
    else SPOT.intensity = 0;
    ST.spotI = SPOT.intensity; SPOT.visible = true; SPOT.target.updateMatrixWorld();
    // lluvia de oro
    { const L = LLUVIA, on = ST.lluvia > 0; L.m.visible = L.mt.visible = L.mb.visible = on; if (on) { const ytop = CIELO(...PC) + LID_T, ybot = ST.cae > 0 ? tapaCaeY(ST.cae) + LID_T + .1 : 0;
      let n = 0; const Q = new THREE.Quaternion(), E = new THREE.Euler(), M4 = new THREE.Matrix4(), S = new THREE.Vector3();
      for (let i = 0; i < L.N; i++) { const [x, z, ph, v, a1, a2, sc, act] = L.d[i]; if (act > ST.lluvia) continue; const T = (ytop - ybot) / v + .6, tau = (t + ph * T) % T, y = ytop - tau * v; if (y < ybot) continue;
        E.set(a1 + tau * 3.1, a2 + tau * 2.3, tau * 1.7); Q.setFromEuler(E); S.setScalar(sc); M4.compose(new THREE.Vector3(x + Math.sin(tau * 1.9 + a1) * .5, y, z + Math.cos(tau * 1.6 + a2) * .5), Q, S); L.m.setMatrixAt(n++, M4) }
      L.m.count = n; L.m.instanceMatrix.needsUpdate = true; n = 0;
      for (let i = 0; i < L.NT; i++) { const [x, z, ph, a, sc] = L.dt[i]; if (L.d[i][7] > ST.lluvia) continue; const T = Math.sqrt(2 * (ytop - ybot) / 9.8) + .8, tau = (t + ph * T) % T, y = ytop - 4.9 * tau * tau; if (y < ybot) continue;
        E.set(a + tau * 4, a, tau * 3); Q.setFromEuler(E); S.setScalar(sc); M4.compose(new THREE.Vector3(x, y, z), Q, S); L.mt.setMatrixAt(n++, M4) }
      L.mt.count = n; L.mt.instanceMatrix.needsUpdate = true; const B = L.mb.material.uniforms; B.uA.value = ST.lluvia; B.uY0.value = ytop; B.uY1.value = ybot } }
    if (typeof tapaArriba === "function") tapaArriba(t, ST);
  }
  return { G, PAN, PAN_ARR, ST, U, mergeGeo, sagify, depthDe, sagMain, enPanel, panB, fbm, rd, hsh, sst, coords, grilla, fueraPanel, juntar, lienzo, gris, envuelto, NUB, CORTE, M_LID, LID, LID_P, RIM, POLVO, MOTAS, SPOT, HAZ_AG, HAZ_HU, LLUVIA, PLACAS, placaEn, HAZ, SOL_REAL, AG_R, PC, TAN_R, PSCALE, M_ORO, ESPIGA_G,
    TAPA_Y, ARRIBA_Y, AGUJERO_W, KELL_BORDE, tapaCaeY, tapaReset, tapa, tapaHundir, tapaGotea, tapaAgujero, tapaCae, lluviaTrigo, tanerCae };
})();
// ---------------- API de la TAPA ----------------
const { TAPA_Y, AGUJERO_W, KELL_BORDE, tapaCaeY, tapaReset, tapa, tapaHundir, tapaGotea, tapaAgujero, tapaCae, lluviaTrigo, tanerCae } = TAPA;
// (stubs del video viejo: la bestia ya no existe)
function sinBestia() { }

// ================= «WE HOLD UP THE SKY»: detalle del pueblo (utilería, casillas de la manivela, campana, Tanner aplastada, jardines de la Loma,
// escalera de Kell, barriletes), animaciones (manivela rota, techos que se rajan, polvillo, Tanner que se aplasta) y la luz bajo la tapa =================
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
const PB = lote(), PBV = lote(), PBT = lote();   // utilería fija · ropa tendida (brisa) · utilería de Tanner (se aplasta)
const PB_M = { madera: M_MADERA, maderaV: M_MADERA_V, viga: M_VIGA, hierro: M_HIERRO, hierroO: M_HIERRO_O, hierroN: M_HIERRO_N, soga: M_SOGA, piedra: M_ROCA_G, piedraC: M_PIEDRA_C, zocalo: M_ZOCALO, barril: M_BARRIL, oscuro: M_OSCURO, terracota: M_TERRACOTA, chapa: M_CHAPA, bronce: M_BRONCE, grasa: M_GRASA, laton: M_LATON, marmol: M_MARMOL, seto: M_SETO, interior: M_INTERIOR, blanco: M_BLANCO_P, sillarC: M_SILLAR_C,
  luz: CASA_MATS.luz, tela: SM("#efe9dc", { roughness: .9 }), verde: SM("#4e7032", { roughness: .8 }), cuero: SM("#5a3e2a", { roughness: .85 }), piel: SM("#e8b898", { roughness: .7 }), tierra: SM("#5a4632", { roughness: 1 }), agua: new THREE.MeshStandardMaterial({ color: "#5a7a8a", roughness: .08, metalness: .3, envMap: ENV_METAL_P, envMapIntensity: 1 }),
  saco: new THREE.MeshStandardMaterial({ color: "#c8b898", bumpMap: T_TRAMA_D, bumpScale: 3, roughness: 1 }), cajon: new THREE.MeshStandardMaterial({ map: T_TABLA_N.c, bumpMap: T_TABLA_N.z, bumpScale: 3, roughness: .9, color: "#b89a70" }) };
M_PUERTA.forEach((m, i) => PB_M["col" + i] = m); ["#f4f0e0", "#e8c838", "#8a6ab8", "#d84a6a", "#f0a040"].forEach((c, i) => PB_M["flor" + i] = SM(c, { roughness: .6 }));
const PBV_M = {}; M_ROPA.forEach((m, i) => PBV_M["ropa" + i] = m);
const PBT_M = Object.fromEntries(Object.entries(PB_M).map(([k, m]) => [k, m.isMeshBasicMaterial ? m : aplastable(m)])); M_ROPA_T.forEach((m, i) => PBT_M["ropa" + i] = aplastable(m));

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

// ---------- las chimeneas de nuestra calle (van aparte: techosRajan las inclina)
const CHIMS = TECHOS_MIOS.filter(C => C.chimG).map((C, k) => { const G = new THREE.Group(); G.position.copy(C.chimG.base); scene.add(G); C.chimG.L.fin(G, CASA_MATS); const r = rng(5900 + k);
  // se inclina hacia la calle o hacia un costado, con un poco de giro; empieza a distintas alturas de u
  const lado = new THREE.Vector3(Math.sin(C.ry) * (r() < .6 ? 1 : 0) + (r() - .5), 0, Math.cos(C.ry) * (r() < .6 ? 1 : 0) + (r() - .5)).normalize(), eje = new THREE.Vector3(lado.z, 0, -lado.x);
  return { G, C, eje, max: .16 + r() * .32, d0: r() * .5, sube: r() * .3 } });

// ---------- LA CASILLA DE LA MANIVELA («crank house»): tablas, puerta abierta, adentro tres cunas con bebés envueltos y un farolito (todo cálido).
// Una por calle, al norte del poste mirando al poste. CASILLAS[i] = { x, z, puerta: [x, y, z] (centro del vano), cunas: [[x, y, z] …] }
const T_CARTEL_C = tex(512, 192, (g, w, h) => { const r = rng(5920); g.fillStyle = "#6a4a2e"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 48) { g.fillStyle = rgbj("#7a5636", r, 20); g.fillRect(0, y, w, 45); g.fillStyle = "rgba(30,18,10,.6)"; g.fillRect(0, y + 45, w, 3) }
  g.fillStyle = "#efe6cc"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = "900 62px Georgia, serif"; g.fillText("CRANK HOUSE", w / 2, 66); g.font = "italic 700 46px Georgia, serif"; g.fillText("hush · babies sleeping", w / 2, 140);
  g.globalCompositeOperation = "destination-out"; for (let k = 0; k < 400; k++) { g.fillStyle = `rgba(0,0,0,${.2 + r() * .5})`; g.fillRect(r() * w, r() * h, 2 + r() * 14, 1 + r() * 3) } g.globalCompositeOperation = "source-over" });
const M_CARTEL_C = new THREE.MeshStandardMaterial({ map: T_CARTEL_C, roughness: .85 });
const CASILLAS = [];
function casilla(L, P, seed, cartel = true) { const r = rng(seed), x = P.x, z = P.z - 6.3, y = SUELO(x, z), M = TM(x, y, z, 0, 0, 0), at = (...a) => M.clone().multiply(TM(...a)), W = 3.4, D = 2.8, H = 2.45;
  // patas de piedra, piso, paredes de tablas (forro interior cálido), vano de la puerta
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) L.add("piedra", GEO_PIEDRAS[1], at(sx * (W / 2 - .2), .08, sz * (D / 2 - .2), 0, r() * 6, 0, .3, .2, .3));
  L.add("maderaV", new THREE.BoxGeometry(W, .14, D), at(0, .24, 0)); L.add("interior", new THREE.BoxGeometry(W - .2, .02, D - .2), at(0, .32, 0));
  const pared = (w, hh, M2) => { L.add("maderaV", new THREE.BoxGeometry(w, hh, .07), M2.clone().multiply(TM(0, hh / 2, .035))); L.add("interior", new THREE.BoxGeometry(w - .02, hh - .02, .02), M2.clone().multiply(TM(0, hh / 2, -.01))) };
  pared(W, H, at(0, .3, -D / 2 + .07)); pared(D - .14, H, at(-W / 2 + .07, .3, 0, 0, -Math.PI / 2, 0)); pared(D - .14, H, at(W / 2 - .07, .3, 0, 0, Math.PI / 2, 0));
  pared(1.2, H, at(-1.1, .3, D / 2 - .07, 0, Math.PI, 0)); pared(1.2, H, at(1.1, .3, D / 2 - .07, 0, Math.PI, 0)); pared(1.0, .42, at(0, .3 + 2.03, D / 2 - .07, 0, Math.PI, 0));
  for (const s of [-1, 1]) L.add("viga", new THREE.BoxGeometry(.12, H + .1, .12), at(s * .56, .3 + (H + .1) / 2, D / 2 + .02)); L.add("viga", new THREE.BoxGeometry(1.3, .14, .14), at(0, .3 + 2.06, D / 2 + .03));
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) L.add("viga", new THREE.BoxGeometry(.13, H + .2, .13), at(sx * (W / 2 - .04), .3 + (H + .2) / 2, sz * (D / 2 - .04)));
  // la puerta abierta hacia afuera (bisagra a la izquierda), con el escalón
  L.add("col" + (seed % 9), new THREE.BoxGeometry(.96, 1.98, .05), at(-.5, .32 + .99, D / 2 + .03, 0, -1.9, 0).multiply(TM(.48, 0, 0))); L.add("piedraC", RB1(1.3, .16, .5, .03), at(0, .1, D / 2 + .3));
  // techo a dos aguas de chapa con tablas de borde y frontones de tablas
  const ang = .62, rh = (D / 2) * Math.tan(ang), S = (D / 2 + .35) / Math.cos(ang); for (const s of [1, -1]) { L.add("chapa", new THREE.BoxGeometry(W + .6, .06, S), at(0, .3 + H + rh / 2 - .02, s * (D / 2 + .35) / 2, s * ang, 0, 0)) }
  { const sh = new THREE.Shape(); sh.moveTo(-D / 2, 0); sh.lineTo(D / 2, 0); sh.lineTo(0, rh); sh.closePath(); const gp = new THREE.ExtrudeGeometry(sh, { depth: W - .02, bevelEnabled: false }); gp.rotateY(Math.PI / 2); gp.translate(-(W - .02) / 2, 0, 0); L.add("maderaV", gp, at(0, .3 + H, 0)) }
  // ventanita a cada costado
  for (const s of [-1, 1]) { L.add("vidrioC", new THREE.PlaneGeometry(.6, .5), at(s * (W / 2 + .005), 1.75, -.2, 0, s * Math.PI / 2, 0)); L.add("madera", new THREE.BoxGeometry(.06, .62, .74), at(s * (W / 2 + .02), 1.75, -.2)); L.add("madera", new THREE.BoxGeometry(.06, .06, .74), at(s * (W / 2 + .03), 1.75, -.2)) }
  // las cunas: cajón sobre balancines, colchita, el bebé envuelto (bulto con carita) y la almohada
  const cunas = [];
  for (const [cx, cz, ry] of [[0, -.75, 0], [-1.05, -.05, Math.PI / 2], [1.05, -.05, -Math.PI / 2]]) { const Mc = at(cx, .33, cz, 0, ry, 0), a2 = (...q) => Mc.clone().multiply(TM(...q));
    for (const s of [-1, 1]) L.add("interior", new THREE.TorusGeometry(.5, .03, 5, 12, Math.PI * .5), a2(s * .0, .02, s * .2, 0, 0, Math.PI * 1.25).multiply(TM(0, 0, 0)));
    L.add("interior", new THREE.BoxGeometry(.9, .06, .48), a2(0, .16, 0)); for (const s of [-1, 1]) { L.add("interior", new THREE.BoxGeometry(.9, .26, .04), a2(0, .32, s * .22)); L.add("interior", new THREE.BoxGeometry(.04, .38, .48), a2(s * .45, .36, 0)) }
    const m = new THREE.SphereGeometry(.3, 10, 6); m.scale(1.35, .32, .66); L.add("tela", m, a2(-.02, .24, 0)); const b = new THREE.CapsuleGeometry(.1, .3, 4, 8); b.rotateZ(Math.PI / 2); L.add("col" + ((seed + cunas.length * 3) % 9), b, a2(.02, .32, 0));
    L.add("piel", RB1(.14, .13, .13, .04), a2(.28, .34, 0)); L.add("tela", new THREE.SphereGeometry(.09, 8, 5), a2(.34, .3, 0, 0, 0, 0, .9, .5, 1.3)); cunas.push(new THREE.Vector3(.02, .45, 0).applyMatrix4(Mc).toArray()) }
  // farolito colgado y cartel; baldes de grasa al costado
  L.add("hierro", new THREE.CylinderGeometry(.006, .006, .3, 3), at(0, .3 + H - .15, -.3)); L.add("luz", new THREE.CylinderGeometry(.08, .07, .18, 6), at(0, .3 + H - .38, -.3)); L.add("hierro", new THREE.ConeGeometry(.1, .08, 6), at(0, .3 + H - .26, -.3));
  if (cartel) L.add("cartelC", new THREE.BoxGeometry(1.2, .45, .04), at(0, .3 + H + .36, D / 2 + .05).multiply(TM(0, 0, 0)));
  balde(L, at(W / 2 + .35, 0, .8, 0, .4, 0), true); balde(L, at(W / 2 + .65, 0, .5, 0, 1, 0), true); L.add("madera", new THREE.CylinderGeometry(.02, .02, .9, 5), at(W / 2 + .4, .45, .78, .3, 0, .2));
  rectAdd({ x, z, ry: 0, w: W + .8, d: D + .8 }); const C = { x, z, puerta: new THREE.Vector3(0, 1.3, D / 2).applyMatrix4(M).toArray(), cunas }; return C }
PB_M.vidrioC = M_VIDRIO; PB_M.cartelC = M_CARTEL_C; PBT_M.vidrioC = M_VIDRIO; PBT_M.cartelC = aplastable(M_CARTEL_C);
CALLES.forEach((c, i) => { CASILLAS[i] = casilla(c.aplastada ? PBT : PB, POSTES[i], 5930 + i * 11) });

// ---------- LA CAMPANA de nuestra plazoleta: dos postes gruesos, viga con techito, campana de bronce con badajo y soga (campana(ang) la hamaca)
const CAMPANA = new THREE.Group(); const CAMPANA_P = [POSTE_MIO[0] - 6.2, CALLE_MIA.z - 6.4];
{ const [x, z] = CAMPANA_P, y = SUELO(x, z), M = TM(x, y, z, 0, .15, 0), at = (...a) => M.clone().multiply(TM(...a)), H = 3.6;
  for (const s of [-1, 1]) { PB.add("viga", new THREE.BoxGeometry(.26, H, .26), at(s * .9, H / 2, 0)); PB.add("zocalo", RB1(.6, .3, .6, .04), at(s * .9, .1, 0)); for (const s2 of [-1, 1]) { const [g, m] = cilEntre([s * .9, .1, s2 * .7], [s * .9, 1.3, 0], .07, 5); PB.add("viga", g, at().multiply(m)) } }
  PB.add("viga", new THREE.BoxGeometry(2.3, .26, .3), at(0, H - .05, 0)); for (const s of [1, -1]) PB.add("chapa", new THREE.BoxGeometry(2.6, .05, .75), at(0, H + .3, s * .28, s * .7, 0, 0));
  CAMPANA.position.copy(new THREE.Vector3(0, H - .2, 0).applyMatrix4(M)); CAMPANA.rotation.y = .15; scene.add(CAMPANA);
  const L = lote(), perfil = [[0, -.02], [.12, 0], [.2, -.06], [.27, -.3], [.33, -.58], [.42, -.74], [.44, -.8], [.4, -.8], [.3, -.66], [.24, -.36], [.17, -.1], [0, -.08]];
  L.add("b", new THREE.LatheGeometry(perfil.map(q => new THREE.Vector2(q[0], q[1])), 24)); L.add("b", new THREE.TorusGeometry(.09, .025, 6, 10), TM(0, .03, 0)); L.add("h", new THREE.CylinderGeometry(.012, .012, .62, 4), TM(0, -.36, 0)); L.add("h", new THREE.SphereGeometry(.06, 8, 6), TM(0, -.68, 0));
  L.add("s", new THREE.CylinderGeometry(.015, .015, 2.5, 4), TM(.35, -1.45, 0, 0, 0, .05)); L.fin(CAMPANA, { b: M_BRONCE, h: M_HIERRO_N, s: M_SOGA }); ocupa(x, z, 1.4) }
function campana(ang = 0) { CAMPANA.rotation.set(0, .15, 0); CAMPANA.rotateX(ang) }

// ---------- utilería de las calles: faroles, cajones, barriles, sacos, baldes, bancos, macetas, carros, escaleras apoyadas, ropa tendida cruzando la calle
const TENDEDEROS = [];
{ const r = rng(6000);
  CALLES.forEach((c, ci) => { const tan = !!c.aplastada, L = tan ? PBT : PB, LV = tan ? PBT : PBV, XM = 46;
    // faroles en el cordón, alternados
    for (let x = -XM + 4 + ci * 2.3; x < XM; x += 11 + r() * 3) for (const s of [-1, 1]) { const xx = x + (s > 0 ? 5.5 : 0); if (Math.abs(xx - c.poste) < 9.5) continue; if (tan && Math.abs(xx) > TANNER_X) { farol(PB, xx, c.z + s * 3.45); continue } farol(L, xx, c.z + s * 3.45) }
    // contra los frentes: cosas apiladas (evitando las puertas)
    const puertas = CASAS_P.concat(tan ? TANNER_CASAS : []).filter(C => Math.abs(C.z - c.z) < 12).map(C => new THREE.Vector3(C.px, 0, C.d / 2).applyMatrix4(C.HM));
    for (let x = -XM; x < XM; x += .9 + r() * 2.4) for (const s of [-1, 1]) { if (r() < .45) continue; const z = c.z + s * (VEREDA - .45); if (Math.abs(x - c.poste) < 8.6 || puertas.some(p => Math.abs(p.x - x) < 1.1 && Math.abs(p.z - z) < 2)) continue; if (!libreEn(x, z, .45, { zona: 1, mc: -.5 })) continue;
      const y = SUELO(x, z), M = TM(x, y, z, 0, (r() - .5) * .6, 0), q = r(); ocupa(x, z, .5);
      if (q < .22) { barril(L, M); if (r() < .4) cajon(L, M.clone().multiply(TM(.62, 0, .05)), .9) } else if (q < .45) { cajon(L, M); if (r() < .6) cajon(L, M.clone().multiply(TM(.03, .44, 0, 0, (r() - .5) * .5, 0)), .9); if (r() < .3) cajon(L, M.clone().multiply(TM(.65, 0, 0, 0, .2, 0))) }
      else if (q < .6) { saco(L, M); saco(L, M.clone().multiply(TM(.45, 0, .05, 0, 1, 0))); if (r() < .5) saco(L, M.clone().multiply(TM(.22, .45, 0, Math.PI / 2 * .9, .3, 0))) } else if (q < .7) { balde(L, M); if (r() < .5) balde(L, M.clone().multiply(TM(.36, 0, .1)), r() < .5) }
      else if (q < .8) { banco(L, M.clone().multiply(TM(0, 0, s > 0 ? -.05 : .05, 0, s > 0 ? Math.PI : 0, 0))) } else if (q < .9) { for (let k = 0; k < 3; k++) { L.add("terracota", new THREE.CylinderGeometry(.16, .11, .26, 10), M.clone().multiply(TM(k * .36 - .36, .13, 0))); flores3D(L, M.clone().multiply(TM(k * .36 - .36, .24, 0)), 4, r, .2, .2) } }
      else { const hh = 3.2 + r() * 1.2; for (const s2 of [-1, 1]) L.add("madera", new THREE.BoxGeometry(.06, hh, .08), M.clone().multiply(TM(s2 * .22, hh / 2, -s * .45, s * .16, 0, 0))); for (let k = 0; k < hh / .32; k++) L.add("maderaV", new THREE.CylinderGeometry(.022, .022, .44, 5), M.clone().multiply(TM(0, .2 + k * .32, -s * .45 + s * .16 * (.2 + k * .32) * .16, 0, 0, Math.PI / 2))) } }
    // carros en la calle (calles pobres)
    if (c.tipo !== "buena") for (let k = 0; k < 2; k++) { const x = (r() < .5 ? -1 : 1) * (16 + r() * 24), z = c.z + (r() - .5) * 1.4; if (!libreEn(x, z, 1.8, { zona: 1 })) continue; ocupa(x, z, 1.8); carro(L, TM(x, SUELO(x, z), z, 0, Math.PI / 2 + (r() - .5) * .3, 0), r) }
    // ropa tendida cruzando la calle (calles del sur)
    if (c.z >= -1) for (let x = -44 + r() * 4; x < 44; x += 5.5 + r() * 4) { if (Math.abs(x - c.poste) < 9.5) continue; const yA = 4.4 + r() * 1.1, yB = yA + (r() - .5) * .8; tendedero(L, LV, x, c.z - VEREDA + .06, c.z + VEREDA - .06, yA, yB, r); TENDEDEROS.push([+x.toFixed(1), c.z]) } }) }
// los patios de atrás: galpones de chapa, cercos de tablas, leña, letrinas, baldes, tendederos chicos, arbolitos
const ARBOLES = [];
{ const r = rng(6100);
  for (let k = 0; k < 2600; k++) { const x = (r() - .5) * 110, ci = r() * (CALLES.length - 1) | 0, c = CALLES[ci], c2 = CALLES[ci + 1], z = lerp(c.z + 10.8, c2.z - 10.8, r()); if (z < LOMA_Z + 6 && c.z < -40) continue; if (!libreEn(x, z, 1.4)) continue;
    const tan = (c.aplastada && z < c.z + 12) || (c2.aplastada && z > c2.z - 12), L = tan && Math.abs(x) < TANNER_X ? PBT : PB, y = SUELO(x, z), M = TM(x, y, z, 0, (r() < .5 ? 0 : Math.PI / 2) + (r() - .5) * .2, 0), q = r();
    if (q < .2) { ocupa(x, z, 2); const w = 2.2 + r() * 1.2, d = 1.8 + r(); for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) L.add("viga", new THREE.BoxGeometry(.1, 2, .1), M.clone().multiply(TM(sx * w / 2, 1, sz * d / 2)));
      L.add("maderaV", new THREE.BoxGeometry(w, 1.8, .05), M.clone().multiply(TM(0, .9, -d / 2))); L.add("maderaV", new THREE.BoxGeometry(.05, 1.8, d), M.clone().multiply(TM(-w / 2, .9, 0))); L.add("chapa", new THREE.BoxGeometry(w + .4, .04, d + .5), M.clone().multiply(TM(0, 2.05, 0, .12, 0, 0))); lena(L, M.clone().multiply(TM(.2, 0, -d / 2 + .35)), r, w - .6) }
    else if (q < .32) { ocupa(x, z, 1); L.add("maderaV", RB1(1, 2.1, 1, .02), M.clone().multiply(TM(0, 1.05, 0))); L.add("chapa", new THREE.BoxGeometry(1.3, .04, 1.3), M.clone().multiply(TM(0, 2.17, 0, .15, 0, 0))); L.add("oscuro", new THREE.CircleGeometry(.05, 8), M.clone().multiply(TM(0, 1.7, .51))) }
    else if (q < .55) { ocupa(x, z, .6); barril(L, M); if (r() < .5) balde(L, M.clone().multiply(TM(.5, 0, .1))) }
    else if (q < .75 && !tan) { ocupa(x, z, 2.2); const n = 2 + r() * 2 | 0; ARBOLES.push([x, z, .7 + r() * .4]) }
    else { ocupa(x, z, .8); cajon(L, M); saco(L, M.clone().multiply(TM(.6, 0, 0))) } }
  // cercos de tablas entre los patios (a lo largo de x, en el medio de la franja)
  CALLES.slice(0, -1).forEach((c, ci) => { const zc = (c.z + CALLES[ci + 1].z) / 2; if (zc < LOMA_Z + 6) return; for (let x = -50; x < 50; x += .16) { if (r() < .04) { x += 1.2; continue } const tan = Math.abs(zc - CALLES[3].z) < 14 && Math.abs(x) < TANNER_X, L = tan ? PBT : PB, h = 1.3 + r() * .25; L.add(r() < .5 ? "maderaV" : "madera", new THREE.BoxGeometry(.14, h, .03), TM(x, SUELO(x, zc) + h / 2 - .05, zc + (r() - .5) * .04, 0, 0, (r() - .5) * .04)) }
    for (let x = -50; x < 50; x += 2.4) PB.add("viga", new THREE.BoxGeometry(2.4, .06, .05), TM(x + 1.2, SUELO(x, zc) + .9, zc - .04)) }) }

// ---------- árboles: tronco y copa redonda en bultos (arbolitos de patio en el sur; árboles grandes de jardín y conos recortados en la Loma)
const GEO_ARBOL = [0, 1, 2].map(v => { const r = rng(4710 + v), T = [], C = [], H = 2.6 + r() * 1.2;
  T.push([tubo([[0, -.2, 0], [(r() - .5) * .3, H * .4, (r() - .5) * .3], [(r() - .5) * .5, H * .8, (r() - .5) * .5], [(r() - .5) * .4, H, (r() - .5) * .4]], .2, .08), TM()]);
  for (let k = 0; k < 4; k++) { const a = k / 4 * 6.283 + r(), L = .8 + r() * .7; T.push([tubo([[0, H * .7, 0], [Math.cos(a) * L * .5, H * .85, Math.sin(a) * L * .5], [Math.cos(a) * L, H + .3, Math.sin(a) * L]], .07, .03, 5, 5), TM()]) }
  for (let j = 0; j < 9; j++) { const a = r() * 6.283, d = r() * 1.1, s = .7 + r() * .5; C.push([geoPiedra(4720 + v * 31 + j, 1, .8), TM(Math.cos(a) * d, H + .3 + r() * .9, Math.sin(a) * d, 0, r() * 6, 0, s, s * .85, s)]) }
  const gc = mergeG(C), pc = gc.attributes.position, uc = gc.attributes.uv; for (let i = 0; i < pc.count; i++) uc.setXY(i, pc.getX(i) / 1.4, (pc.getY(i) + pc.getZ(i)) / 1.4); return [mergeG(T), gc] });
{ const r = rng(6150), A = ARBOLES;
  // la Loma: árboles grandes en los jardines (lejos de las mansiones, los caminos y los postes)
  for (let k = 0; k < 3000 && A.length < 120; k++) { const x = (r() - .5) * 150, z = -70 - r() * 70; if (MANSIONES.some(m => Math.hypot(m.x - x, m.z - z) < 10.5) || POSTES.some(p => Math.hypot(p.x - x, p.z - z) < 5.5) || Math.hypot(x - ESCALERA_KELL[0], z - ESCALERA_KELL[1]) < 6 || colorSuelo(x, z)[0] > .5) continue;
    if (LOMA_CAMINOS.some(([x0, z0, x1, z1, an]) => { const dx = x1 - x0, dz = z1 - z0, t = cl(((x - x0) * dx + (z - z0) * dz) / (dx * dx + dz * dz)); return Math.hypot(x - x0 - dx * t, z - z0 - dz * t) < an / 2 + 2 })) continue; if (A.some(([a, b]) => Math.hypot(a - x, b - z) < 6)) continue; A.push([x, z, 1.4 + r() * .8]); ocupa(x, z, 2) }
  const ims = GEO_ARBOL.map(([gt, gc]) => { const a = new THREE.InstancedMesh(gt, M_CORTEZA, A.length), b = new THREE.InstancedMesh(gc, M_COPA, A.length); a.count = b.count = 0; [a, b].forEach(m => { m.castShadow = m.receiveShadow = true; scene.add(m) }); return [a, b] }), cc = new THREE.Color();
  A.forEach(([x, z, s], i) => { const [a, b] = ims[i % 3], n = a.count++; b.count++; dummy.position.set(x, SUELO(x, z) - .05, z); dummy.rotation.set(0, r() * 6, 0); dummy.scale.set(s, s * (.9 + r() * .2), s); dummy.updateMatrix(); a.setMatrixAt(n, dummy.matrix); b.setMatrixAt(n, dummy.matrix); b.setColorAt(n, cc.set(z < LOMA_Z ? ["#6a9a48", "#5a8a40", "#7aa650", "#4e8038"][r() * 4 | 0] : ["#8aa05a", "#7a9250", "#98a862", "#86984e"][r() * 4 | 0])) }) }

// ---------- LA LOMA: reja de hierro con pilares que separa la Loma del pueblo (portón en el camino), setos alrededor de las mansiones, conos recortados,
// canteros con flores, fuentes, bancos, faroles finos, y el camino a la escalera de Kell
{ const r = rng(6200), zr = LOMA_Z - 1.5, barrotes = [], puntas = [];
  for (let x = -96; x < 96; x += .16) { if (Math.abs(x) < 2.4) continue; const y = SUELO(x, zr); barrotes.push([x, y, zr]) }
  for (let x = -96; x <= 96; x += 6.4) { if (Math.abs(x) < 2.4) continue; const y = SUELO(x, zr); PB.add("sillarC", RB1(.6, 2.5, .6, .04), TM(x, y + 1.25, zr)); PB.add("marmol", RB1(.75, .16, .75, .04), TM(x, y + 2.55, zr)); PB.add("laton", new THREE.SphereGeometry(.18, 10, 8), TM(x, y + 2.78, zr)) }
  for (const s of [-1, 1]) { const x = s * 3.2, y = SUELO(x, zr); PB.add("sillarC", RB1(.9, 3.6, .9, .04), TM(x, y + 1.8, zr)); PB.add("laton", new THREE.SphereGeometry(.28, 10, 8), TM(x, y + 3.85, zr)); for (let k = 0; k < 14; k++) PB.add("hierroN", new THREE.CylinderGeometry(.018, .018, 2.6, 5), TM(s * (.2 + k * .17), y + 1.3, zr - .2 + s * 0, 0, 0, 0)) }
  const gb = new THREE.InstancedMesh(new THREE.CylinderGeometry(.016, .016, 2.1, 5), M_HIERRO_N, barrotes.length), gp = new THREE.InstancedMesh(new THREE.ConeGeometry(.04, .14, 5), M_LATON, barrotes.length);
  barrotes.forEach(([x, y, z], k) => { dummy.position.set(x, y + 1.05, z); dummy.rotation.set(0, 0, 0); dummy.scale.set(1, 1, 1); dummy.updateMatrix(); gb.setMatrixAt(k, dummy.matrix); dummy.position.y = y + 2.17; dummy.updateMatrix(); gp.setMatrixAt(k, dummy.matrix) });
  [gb, gp].forEach(m => { m.castShadow = true; m.receiveShadow = true; scene.add(m) });
  for (const yy of [.25, 1.9]) for (let x = -96; x < 96; x += 6.4) { if (Math.abs(x + 3.2) < 5) continue; PB.add("hierroN", new THREE.BoxGeometry(6.4, .05, .04), TM(x + 3.2, SUELO(x + 3.2, zr) + yy, zr)) }
  // setos: rectángulo alrededor de cada mansión (abierto adelante), y canteros con flores al pie del frente
  const setos = []; MANSIONES.forEach(m => { const W2 = m.w / 2 + 3.2, D2 = m.d / 2 + 3.4, at = (...a) => TM(m.x, SUELO(m.x, m.z), m.z, 0, m.ry, 0).multiply(TM(...a));
    for (let k = -W2; k < W2; k += 1.2) { setos.push(at(k + .6, .5, -D2)); if (Math.abs(k + .6) > 2.4) setos.push(at(k + .6, .5, D2)) } for (let k = -D2; k < D2; k += 1.2) for (const s of [-1, 1]) setos.push(at(s * W2, .5, k + .6));
    for (const s of [-1, 1]) { const Mc = at(s * (m.w / 4 + 1.4), 0, m.d / 2 + 1.0); PB.add("sillarC", RB1(m.w / 2 - 3.6, .3, .9, .04), Mc.clone().multiply(TM(0, .15, 0))); PB.add("tierra", new THREE.BoxGeometry(m.w / 2 - 3.8, .04, .7), Mc.clone().multiply(TM(0, .31, 0))); flores3D(PB, Mc.clone().multiply(TM(0, .3, 0)), 22, r, m.w / 2 - 4, .6) }
    // conos recortados a los lados de la entrada
    for (const s of [-1, 1]) { const g = new THREE.ConeGeometry(.7, 2.4, 10, 3), p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) + (fbm2(p.getX(i) * 3, p.getZ(i) * 3) - .5) * .1); g.computeVertexNormals(); PB.add("seto", g, at(s * 2.4, 1.4, D2)); PB.add("terracota", new THREE.CylinderGeometry(.6, .45, .5, 12), at(s * 2.4, .25, D2)) }
    ocupa(m.x, m.z, 1) });
  const gs = new THREE.InstancedMesh(geoUV(RB(1.3, 1.1, 1.0, .25, 2), (x, y, z) => (x + z) * .7, (x, y) => y * .7), M_SETO, setos.length); setos.forEach((M, k) => { M.decompose(dummy.position, dummy.quaternion, dummy.scale); dummy.scale.set(1, .9 + r() * .2, 1); dummy.updateMatrix(); gs.setMatrixAt(k, dummy.matrix) }); gs.castShadow = gs.receiveShadow = true; scene.add(gs);
  // fuentes de mármol con agua quieta
  for (const [x, z] of [[0, -94], [-16, -112]]) { const y = SUELO(x, z), at = (...a) => TM(x, y, z).multiply(TM(...a)); PB.add("marmol", new THREE.CylinderGeometry(3, 3.2, .7, 24), at(0, .35, 0)); PB.add("agua", new THREE.CircleGeometry(2.75, 24), at(0, .62, 0, -Math.PI / 2));
    PB.add("marmol", new THREE.CylinderGeometry(.35, .5, 1.8, 12), at(0, 1.2, 0)); PB.add("marmol", new THREE.CylinderGeometry(1.3, .4, .4, 16), at(0, 2.1, 0)); PB.add("agua", new THREE.CircleGeometry(1.15, 16), at(0, 2.31, 0, -Math.PI / 2)); PB.add("laton", new THREE.SphereGeometry(.22, 10, 8), at(0, 2.6, 0)); ocupa(x, z, 3.6) }
  // faroles finos y bancos a lo largo de los caminos
  LOMA_CAMINOS.forEach(([x0, z0, x1, z1, an]) => { const L2 = Math.hypot(x1 - x0, z1 - z0), nx = -(z1 - z0) / L2, nz = (x1 - x0) / L2; for (let s = 6; s < L2; s += 14) for (const sd of [-1, 1]) { const x = lerp(x0, x1, s / L2) + nx * sd * (an / 2 + .5), z = lerp(z0, z1, s / L2) + nz * sd * (an / 2 + .5); if (z > LOMA_Z - 3 || !libreEn(x, z, .6, { zona: 1 })) continue; if ((s / 14 | 0) % 2) farol(PB, x, z, 3.2); else { ocupa(x, z, 1); banco(PB, TM(x, SUELO(x, z), z, 0, Math.atan2(nx * sd, nz * sd), 0)) } } }) }

// ---------- pasto en matas (patios y canteros del sur, césped de la Loma) y piedras sueltas
const GEO_MATA = (() => { const r = rng(5001), pos = [], uv = [], idx = []; for (let b = 0; b < 6; b++) { const a = r() * 6.283, d = r() * .14, bx = Math.cos(a) * d, bz = Math.sin(a) * d, H = .22 + r() * .26, lean = (r() - .5) * .3, fa = r() * 6.283, wv = .028 + r() * .015, o = pos.length / 3;
    for (let k = 0; k <= 3; k++) { const s = k / 3, x = bx + s * s * lean * H * Math.cos(fa), y = s * H, z = bz + s * s * lean * H * Math.sin(fa), wd = wv * (1 - s * .85); pos.push(x - Math.sin(fa) * wd, y, z + Math.cos(fa) * wd, x + Math.sin(fa) * wd, y, z - Math.cos(fa) * wd); uv.push(0, s, 1, s) }
    for (let k = 0; k < 3; k++) { const i = o + k * 2; idx.push(i, i + 1, i + 2, i + 1, i + 3, i + 2) } }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const n = g.attributes.normal; for (let i = 0; i < n.count; i++) n.setXYZ(i, n.getX(i) * .3, 1, n.getZ(i) * .3); n.needsUpdate = true; g.normalizeNormals(); return g })();
const PASTO = (() => { const N = 14000, m = new THREE.InstancedMesh(GEO_MATA, new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .9, side: THREE.DoubleSide }), N), r = rng(5010), cc = new THREE.Color(); m.receiveShadow = true; m.castShadow = false; let n = 0;
  for (let k = 0; k < N * 4 && n < N; k++) { const loma = k % 3 === 0, x = (r() - .5) * (loma ? 150 : 110), z = loma ? -66 - r() * 70 : -40 + r() * 100; if (!loma && (calleK(x, z) > .05 || plazK(x, z) > .05 || veredaK(x, z) > .6)) continue; if (!libreEn(x, z, .25, { mc: -.4, zona: 1 })) continue;
    if (!loma && r() < .35 && colorSuelo(x, z)[1] < .25) continue; const s = loma ? .6 + r() * .3 : .55 + r() * .5; dummy.position.set(x, SUELO(x, z) - .02, z); dummy.rotation.set(0, r() * 6, 0); dummy.scale.set(s, s * (.7 + r() * .6), s); dummy.updateMatrix(); m.setMatrixAt(n, dummy.matrix);
    const c0 = colorSuelo(x, z); cc.setRGB(c0[0] * (.75 + r() * .25), c0[1] * (.85 + r() * .25), c0[2] * (.6 + r() * .2)); m.setColorAt(n, cc); n++ }
  m.count = n; scene.add(m); return m })();
{ const r = rng(6300), P = [], cc = new THREE.Color();
  for (let k = 0; k < 1800 && P.length < 900; k++) { const x = (r() - .5) * 110, z = -60 + r() * 120, cerca = veredaK(x, z) > .3; if (!libreEn(x, z, .3, { mc: -.3, zona: 1 }) || calleK(x, z) > .3 || plazK(x, z) > .3) continue; const s = .06 + r() * r() * (cerca ? .14 : .32); P.push([x, SUELO(x, z) + s * .2, z, s * (1 + r() * .5), s * (.55 + r() * .3), s]) }
  const ms = GEO_PIEDRAS.map(g => { const m = new THREE.InstancedMesh(g, M_ROCA, Math.ceil(P.length / 3) + 2); m.castShadow = m.receiveShadow = true; m.count = 0; scene.add(m); return m });
  P.forEach(([x, y, z, sx, sy, sz], i) => { const m = ms[i % 3], n = m.count++; dummy.position.set(x, y, z); dummy.rotation.set((r() - .5) * .3, r() * 6, (r() - .5) * .3); dummy.scale.set(sx, sy, sz); dummy.updateMatrix(); m.setMatrixAt(n, dummy.matrix); m.setColorAt(n, cc.set(["#9a968a", "#86837a", "#aaa598", "#7a776e", "#a29a88"][r() * 5 | 0])) }) }

// ---------- junto a cada poste de calle: baldes de grasa, el cuchillo de grasa clavado en un tarro, trapos; en nuestra plazoleta, la bomba de agua y un banco
{ const r = rng(6400); CALLES.forEach((c, i) => { const P = POSTES[i], L = c.aplastada ? PBT : PB, a0 = .9 + i;
    for (let k = 0; k < 3; k++) { const a = a0 + k * .5, x = P.x + Math.cos(a) * 1.95, z = P.z + Math.sin(a) * 1.95; balde(L, TM(x, P.y0 + .3, z, 0, r() * 6, 0), k < 2) }
    L.add("grasa", new THREE.CylinderGeometry(.25, .25, .05, 14), TM(P.x + Math.cos(a0 + .25) * 2.0, P.y0 + .31, P.z + Math.sin(a0 + .25) * 2.0)) });
  const [x, z] = [POSTE_MIO[0] + 6, CALLE_MIA.z - 5.6], y = SUELO(x, z), M = TM(x, y, z, 0, -.4, 0);
  PB.add("hierroN", new THREE.CylinderGeometry(.14, .18, 1.3, 10), M.clone().multiply(TM(0, .65, 0))); PB.add("hierroN", new THREE.CylinderGeometry(.05, .05, .55, 6), M.clone().multiply(TM(.22, 1.15, 0, 0, 0, 1.2))); PB.add("hierroN", new THREE.CylinderGeometry(.04, .05, .3, 6), M.clone().multiply(TM(0, 1.0, .2, Math.PI / 2.4, 0, 0)));
  PB.add("piedraC", RB1(1.1, .2, .8, .03), M.clone().multiply(TM(0, .1, .35))); balde(PB, M.clone().multiply(TM(0, .2, .4))); ocupa(x, z, .9);
  banco(PB, TM(POSTE_MIO[0] - 2.8, SUELO(-2.8, 7.4), CALLE_MIA.z + 7.4, 0, Math.PI, 0)); banco(PB, TM(POSTE_MIO[0] + 3, SUELO(3, 7.4), CALLE_MIA.z + 7.4, 0, Math.PI, 0)) }

// ---------- TANNER: escombros (vigas partidas, tejas, piedras, ladrillos, muebles rotos) que aparecen cuando la calle queda aplastada (tannerEstado ≥ 0,6)
const ESCOMBROS = (() => { const r = rng(6500), G = new THREE.Group(); scene.add(G); const piezas = { viga: [], teja: [], piedra: [], mueble: [] }, c = CALLES[POSTE_9T];
  for (let k = 0; k < 1400; k++) { const x = (r() - .5) * 2 * (TANNER_X + 1), z = c.z + (r() - .5) * 2 * 11.5, calle = Math.abs(z - c.z) < VEREDA; if (calle && r() < .6) continue; if (Math.hypot(x - c.poste, z - c.z) < 4.6) continue;
    const y = SUELO(x, z), q = r(), M = TM(x, y + (calle ? .05 : .2 + r() * .9), z, (r() - .5) * .9, r() * 6, (r() - .5) * .9);
    if (q < .2) piezas.viga.push(M.multiply(TM(0, 0, 0, 0, 0, 0, .9 + r() * 1.8, 1, 1))); else if (q < .62) piezas.teja.push(M); else if (q < .92) piezas.piedra.push(M.multiply(TM(0, 0, 0, 0, 0, 0, .14 + r() * .2))); else piezas.mueble.push(M) }
  const gv = (() => { const g = new THREE.BoxGeometry(1.6, .2, .2, 4, 1, 1), p = g.attributes.position; for (let i = 0; i < p.count; i++) if (Math.abs(p.getX(i)) > .7) { p.setY(i, p.getY(i) * (.4 + Math.random() * .5)); p.setZ(i, p.getZ(i) * (.5 + Math.random() * .4)) } g.computeVertexNormals(); return g })();
  const gt = new THREE.CylinderGeometry(.13, .13, .36, 6, 1, true, 0, Math.PI); gt.rotateZ(Math.PI / 2);
  const gm = mergeG([[RB1(.9, .06, .55), TM(0, .5, 0)], [new THREE.BoxGeometry(.06, .5, .06), TM(.4, .25, .22, .2, 0, 0)], [new THREE.BoxGeometry(.06, .5, .06), TM(-.4, .25, -.22, 0, 0, .5)], [RB1(.45, .05, .45), TM(.9, .25, .2, .4, .3, 0)], [new THREE.BoxGeometry(.04, .55, .04), TM(.75, .45, .4, 0, 0, -.3)], [RB1(.8, .9, .3), TM(-.9, .2, .4, 1.3, .4, 0)]]);
  const ims = [[gv, M_VIGA, piezas.viga], [gt, M_TEJA[0], piezas.teja], [GEO_PIEDRAS[0], M_ROCA_G, piezas.piedra], [gm, M_MADERA, piezas.mueble]].map(([g, m, L]) => { const im = new THREE.InstancedMesh(g, m, L.length); L.forEach((M, k) => im.setMatrixAt(k, M)); im.castShadow = im.receiveShadow = true; G.add(im); return im });
  return { G, ims } })();
// tannerAltura(u) → altura (mundo) de la cara de abajo de la tapa que baja sobre Tanner en u (0 = CIELO, 1 = apoyada sobre los escombros, 1,4 m)
const tannerAltura = u => lerp(CIELO(POSTE_NUEVE[0], TANNER.z), 1.4, cl(u));
// tannerEstado(u): 0 = Tanner en pie (el recuerdo), 1 = aplastada. Las casas se aplastan de arriba hacia abajo siguiendo tannerAltura(u);
// Pole Nine se hunde en el gato (el tornillo se resbaló) y en u = 1 ya no está (solo quedan el gato y el tornillo con el tajo)
const TAN_E = { u: -1 };
function tannerEstado(u = 1) { u = cl(u); if (TAN_E.u === u) return; TAN_E.u = u; const h = tannerAltura(u); TANNER_U.top.value = u <= 0 ? 99 : h;
  const P = POSTES[POSTE_9T], d = Math.max(0, P.top - h - .02); P.g.position.y = -d; P.g.visible = u < .995; const dt = Math.min(d, .35); P.tor.position.y = -dt; if (P.torC) P.torC.position.y = -dt; P.cab.visible = true;
  const s = sst(.55, .95, u); ESCOMBROS.G.visible = s > 0; ESCOMBROS.G.scale.set(1, Math.max(.001, s), 1); ESCOMBROS.G.position.y = (1 - s) * .3 }
// poste9Corte(visible): muestra el tajo fresco de serrucho en el tornillo de Pole Nine (en Tanner y en la Loma), con limaduras brillantes y aserrín
const LIMADURAS = (() => { const r = rng(6600), N = 420, g = new THREE.TetrahedronGeometry(.012, 0), m = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .3, metalness: .6, envMap: ENV_METAL_P, envMapIntensity: 1.2 }), N * 2), cc = new THREE.Color(); let n = 0;
  for (const P of [POSTES[POSTE_9T], POSTES[POSTE_9L]]) for (let k = 0; k < N; k++) { const a = CORTE_A + (r() - .5) * 1.6, en = r(), rr = en < .5 ? .6 + r() * .35 : 1.2 + r() * .5, y = en < .5 ? 1.75 : en < .8 ? 1.16 : .42, wx = P.x + Math.cos(a) * rr, wz = P.z - Math.sin(a) * rr;
    dummy.position.set(wx, P.y0 + y + .006, wz); dummy.rotation.set(r() * 6, r() * 6, r() * 6); dummy.scale.set(1 + r() * 2, .4, 1 + r()); dummy.updateMatrix(); m.setMatrixAt(n, dummy.matrix); m.setColorAt(n, cc.set(r() < .6 ? "#e8eaec" : r() < .6 ? "#c8a878" : "#9a9894")); n++ }
  m.count = n; m.castShadow = false; m.receiveShadow = true; scene.add(m); return m })();
function poste9Corte(v = true) { for (const P of [POSTES[POSTE_9T], POSTES[POSTE_9L]]) { P.torC.visible = !!v; P.tor.visible = !v } LIMADURAS.visible = !!v }

// ---------- la manivela que se parte: manivelaRota(i, u). En u > 0 la barra que apunta a la calle se parte a 2,15 m del eje: el muñón astillado
// queda en la tuerca y el pedazo largo cae y queda tirado en el piso (u = 1). Astillas en las dos puntas.
const GEO_ASTILLAS = (() => { const r = rng(6700), L = []; for (let k = 0; k < 9; k++) { const a = r() * 6.283, rr = r() * .055; L.push([new THREE.ConeGeometry(.018 + r() * .012, .1 + r() * .14, 4), TM(0, Math.cos(a) * rr, Math.sin(a) * rr, 0, 0, -Math.PI / 2 + (r() - .5) * .5)]) } return mergeG(L) })();
function manivelaRota(i, u = 0) { const P = POSTES[i]; if (!P || !P.cab) return; u = cl(u); P.rotaU = u;
  if (!P.rota) { if (u <= 0) return; const st = new THREE.Mesh(GEO_ASTILLAS, M_BARRA); st.position.set(BARRA_ROTA_R, BARRA_Y, 0); P.cab.add(st); const pz = new THREE.Group(), pm = new THREE.Mesh(barraGeo(0, BARRA_R - .1 - BARRA_ROTA_R), M_BARRA), pa = new THREE.Mesh(GEO_ASTILLAS, M_BARRA);
    pa.rotation.y = Math.PI; pm.castShadow = pa.castShadow = true; pz.add(pm, pa); scene.add(pz); P.rota = { st, pz } }
  const R0 = P.rota; P.barras.geometry = u > 0 ? GEO_BARRAS3 : GEO_BARRAS; R0.st.visible = u > 0; R0.pz.visible = u > 0; if (u <= 0) return;
  // dónde estaba la punta rota (con el giro de la manivela) y adónde cae
  const a = P.ang || 0, c = Math.cos(a), s = Math.sin(a), bx = P.x + c * BARRA_ROTA_R, bz = P.z - s * BARRA_ROTA_R, f = sst(.08, 1, u), g = f * f;
  const y = lerp(P.y0 + BARRA_Y, SUELO(bx, bz) + .08, g), tilt = -lerp(0, .06, sst(0, .08, u)) - lerp(0, 0, g), roll = f * 1.2;
  R0.pz.position.set(bx + c * f * .5, y, bz - s * f * .5); R0.pz.rotation.set(0, a + f * .7, 0); R0.pz.rotateZ(tilt - Math.sin(f * Math.PI) * .5); R0.pz.rotateX(roll) }

// ---------- LOS TECHOS DE NUESTRA CALLE SE RAJAN: techosRajan(u) — grietas que se abren en los faldones, tejas que se deslizan y caen a la calle,
// chimeneas que se inclinan (u 0 → 1)
const T_GRIETA = (() => { const t = tex(1024, 512, (g, w, h) => { const r = rng(6800); g.clearRect(0, 0, w, h);
    // el alfa dice CUÁNDO aparece cada parte (1 = primero): alphaTest = 1 − u las va mostrando
    const rama = (x, y, a, L, al, wd, n) => { for (let k = 0; k < n; k++) { const x2 = x + Math.cos(a) * L / n, y2 = y + Math.sin(a) * L / n, a2 = al * (1 - k / n * .7); g.strokeStyle = `rgba(22,14,10,${a2})`; g.lineWidth = wd * (1 - k / n * .6); g.lineCap = "round"; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke();
        if (r() < .18 && wd > 3) rama(x2, y2, a + (r() < .5 ? 1 : -1) * (.5 + r() * .6), L * .45, a2 * .9, wd * .55, 6); x = x2; y = y2; a += (r() - .5) * .7 } };
    for (let k = 0; k < 3; k++) { const x = w * (.2 + k * .3 + (r() - .5) * .1), y = h * (.3 + r() * .4); rama(x, y, r() * 6.3, 420, .98 - k * .1, 14, 18); rama(x, y, r() * 6.3, 300, .95 - k * .1, 11, 14) }
    // huecos de tejas caídas (oscuros, con la madera del entablonado)
    for (let k = 0; k < 16; k++) { const x = r() * w, y = r() * h, s = 14 + r() * 26, al = .2 + r() * .6; g.fillStyle = `rgba(40,26,16,${al})`; g.fillRect(x, y, s * 1.6, s); g.fillStyle = `rgba(110,80,50,${al})`; g.fillRect(x + 3, y + s * .45, s * 1.6 - 6, 4) } }); return t })();
const M_GRIETA = new THREE.MeshStandardMaterial({ map: T_GRIETA, alphaTest: .999, roughness: 1, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -8 });
const TEJAS_C = [];   // tejas que caen: { S (arriba en el faldón), E (alero), n (afuera), d0 (cuándo), sp (giro) }
{ const L = lote(), r = rng(6900);
  TECHOS_MIOS.forEach(C => { const RM = C.frontal ? TM(0, 0, 0, 0, Math.PI / 2, 0) : new THREE.Matrix4(), ovz = .45, S = (C.span / 2 + ovz) / Math.cos(C.ang);
    for (const s of [1, -1]) { const ym = C.h + C.rh + .1 - (C.span / 2 + ovz) * Math.tan(C.ang) / 2, zm = s * (C.span / 2 + ovz) / 2, Mf = C.HM.clone().multiply(RM).multiply(TM(0, ym, zm, C.ang, s > 0 ? 0 : Math.PI, 0)), g = new THREE.PlaneGeometry(Math.min(C.len, 5.5), S * .9);
      g.rotateX(-Math.PI / 2); const uv = g.attributes.uv, o = r(); for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * Math.min(C.len, 5.5) / 5.5 * .9 + o * .1, uv.getY(i)); L.add("g", g, Mf.clone().multiply(TM((r() - .5) * Math.max(0, C.len - 5.5), .1, 0)));
      // tejas sueltas del faldón (más del lado de la calle)
      const nT = s > 0 === (Math.cos(C.ry) > 0) ? 4 : 9; for (let k = 0; k < nT; k++) { const lx = (r() - .5) * (C.len - .8), q = .2 + r() * .6, Sp = new THREE.Vector3(lx, .12, (q - .5) * S).applyMatrix4(Mf), Ep = new THREE.Vector3(lx, .12, .5 * S).applyMatrix4(Mf), n = Ep.clone().sub(Sp).setY(0).normalize();
        TEJAS_C.push({ S: Sp, E: Ep, n, d0: r() * .82, sp: (r() - .5) * 14, ry: Math.atan2(n.x, n.z), mat: C.techo.startsWith("teja") ? 0 : 1 }) } } });
  L.fin(scene, { g: M_GRIETA }) }
const TEJAS_IM = [new THREE.InstancedMesh(new THREE.BoxGeometry(.3, .04, .4), M_TEJA[0], TEJAS_C.length), new THREE.InstancedMesh(new THREE.BoxGeometry(.32, .03, .44), M_PIZ[0], TEJAS_C.length)];
TEJAS_IM.forEach(m => { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; scene.add(m) });
const RAJ = { u: -1 };
function techosRajan(u = 0) { u = cl(u); if (RAJ.u === u) return; RAJ.u = u; M_GRIETA.alphaTest = Math.max(.02, 1 - u * 1.05); M_GRIETA.visible = u > 0;
  CHIMS.forEach(ch => { const k = sst(ch.d0, ch.d0 + .4, u); ch.G.quaternion.setFromAxisAngle(ch.eje, ch.max * k); ch.G.position.copy(ch.C.chimG.base).add(new THREE.Vector3(0, -ch.sube * k, 0)) });
  const n = [0, 0], q = new THREE.Quaternion(), e = new THREE.Euler(); TEJAS_C.forEach(T => { const t = (u - T.d0) / .16; if (t <= 0) return; const im = TEJAS_IM[T.mat], k = n[T.mat]++;
    let p; if (t < .3) p = T.S.clone().lerp(T.E, (t / .3) ** 2); else { const tau = (t - .3) * 1.4, v = 2.2; p = T.E.clone().addScaledVector(T.n, v * tau); p.y -= 4.9 * tau * tau; const gy = SUELO(p.x, p.z) + .03; if (p.y < gy) p.y = gy }
    const giro = t < .3 ? 0 : Math.min((t - .3) * T.sp, p.y < SUELO(p.x, p.z) + .05 ? T.sp * .6 : 99); e.set(t < .3 ? -.7 : -.7 + giro, T.ry, giro * .4, "YXZ"); q.setFromEuler(e); dummy.position.copy(p); dummy.quaternion.copy(q); dummy.scale.setScalar(1); dummy.updateMatrix(); im.setMatrixAt(k, dummy.matrix) });
  TEJAS_IM.forEach((im, j) => { im.count = n[j]; im.instanceMatrix.needsUpdate = true }) }

// ---------- POLVILLO que cae de la tapa sobre nuestra calle: callePolvo(u) — motas que bajan despacio por toda la calle y chorritos finos de tierra
// que caen de las juntas de la tapa (u = 0 nada, 1 mucho). Se dibujan en el sombreador (tiempo = AMB.t).
const AMB = { t: 0, cam: [0, 0, 0] };
const POLVO_U = { uT: { value: 0 }, uD: { value: 0 } };
const POLVO_M = (() => { const N = 2600, g = new THREE.PlaneGeometry(1, 1), r = rng(7000), aS = new Float32Array(N * 4); for (let k = 0; k < N; k++) aS.set([(r() - .5) * 64, r(), (r() - .5) * 22, r()], k * 4); g.setAttribute("aS", new THREE.InstancedBufferAttribute(aS, 4));
  const mat = new THREE.ShaderMaterial({ uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uT: POLVO_U.uT, uD: POLVO_U.uD, uMap: { value: GLOW }, uCol: { value: new THREE.Color("#c8b494") } }]), transparent: true, depthWrite: false, fog: true,
    vertexShader: `uniform float uT, uD; attribute vec4 aS; varying vec2 vUv; varying float vA;
    #include <fog_pars_vertex>
    void main() { vUv = uv; float top = ${CIELO_Y0.toFixed(2)} - .3, f = fract(aS.y - uT * (.05 + aS.w * .07)); vec3 p = vec3(aS.x + sin(uT * .7 + aS.w * 30.) * .4, f * top, aS.z + cos(uT * .6 + aS.y * 20.) * .4);
      vA = step(aS.w, uD) * smoothstep(0., .08, f) * smoothstep(1., .9, f); vec4 mv = viewMatrix * vec4(p, 1.); mv.xy += position.xy * (.035 + aS.w * .05); vec4 mvPosition = mv; gl_Position = projectionMatrix * mv;
      #include <fog_vertex>
    }`, fragmentShader: `uniform sampler2D uMap; uniform vec3 uCol; varying vec2 vUv; varying float vA;
    #include <fog_pars_fragment>
    void main() { float a = texture2D(uMap, vUv).a * vA * .8; if (a < .01) discard; gl_FragColor = vec4(uCol, a);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      #include <fog_fragment>
    }` });
  const m = new THREE.InstancedMesh(g, mat, N), Z = new THREE.Matrix4().makeScale(0, 0, 0); for (let k = 0; k < N; k++) m.setMatrixAt(k, Z); m.frustumCulled = false; m.renderOrder = 3; m.visible = false; scene.add(m); return m })();
const T_CHORRO = tex(64, 512, (g, w, h) => { const r = rng(7010); g.clearRect(0, 0, w, h); for (let k = 0; k < 900; k++) { const x = w / 2 + (r() - .5) * (6 + r() * r() * 50), y = r() * h, s = 1 + r() * 3; g.fillStyle = `rgba(170,140,100,${.25 + r() * .6})`; g.fillRect(x, y, s, s * (1 + r() * 3)) } const gr = g.createLinearGradient(0, 0, 0, h); g.globalCompositeOperation = "destination-in"; gr.addColorStop(0, "rgba(0,0,0,1)"); gr.addColorStop(.8, "rgba(0,0,0,.7)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h) });
T_CHORRO.wrapT = THREE.RepeatWrapping;
const CHORROS = (() => { const r = rng(7020), L = []; for (let k = 0; k < 9; k++) { const x = (r() - .5) * 44, z = CALLE_MIA.z + (r() - .5) * 7, top = CIELO(x, z) - .05, m = new THREE.Mesh(new THREE.PlaneGeometry(.5 + r() * .4, top), new THREE.MeshBasicMaterial({ map: T_CHORRO.clone(), transparent: true, depthWrite: false, opacity: 0, fog: true }));
    m.material.map.wrapT = THREE.RepeatWrapping; m.material.map.repeat.set(1, top / 6); m.material.map.needsUpdate = true; m.position.set(x, top / 2, z); m.userData = { d0: r() * .6, v: .8 + r() * .8 }; m.visible = false; m.renderOrder = 3; scene.add(m); L.push(m) } return L })();
function callePolvo(u = 0) { u = cl(u); POLVO_U.uD.value = u; POLVO_M.visible = u > 0; CHORROS.forEach(m => { const k = sst(m.userData.d0, m.userData.d0 + .3, u); m.visible = k > 0; m.material.opacity = k * .85; m.quaternion.copy(cam.quaternion); m.rotation.set(0, Math.atan2(cam.position.x - m.position.x, cam.position.z - m.position.z), 0); m.material.map.offset.y = AMB.t * m.userData.v }) }

// ---------- LA ESCALERA DE KELL: sube de una tarima de piedra en la Loma (ESCALERA_KELL) hasta 2 m por encima de la tapa (la trampa la hace el otro
// agente), con largueros de madera, peldaños redondos, abrazaderas, cuatro vientos de soga y un torno con sogas, bolsas de tierra y carretillas al pie
const ESCALERA = new THREE.Group(); scene.add(ESCALERA);
const ESC_TOP = CIELO(ESCALERA_KELL[0], ESCALERA_KELL[1]) + LID_T + 2.4;
{ const [x, z] = ESCALERA_KELL, y = SUELO(x, z), L = lote(), H = ESC_TOP - y - .5, r = rng(7100), at = (...a) => TM(x, y, z).multiply(TM(...a));
  L.add("zocalo", uvMuro(new THREE.BoxGeometry(4.2, .5, 4.2), 2.4), at(0, .05, 0)); L.add("madera", new THREE.BoxGeometry(3.6, .1, 3.6), at(0, .35, 0));
  for (const s of [-1, 1]) L.add("madera", new THREE.BoxGeometry(.13, H, .09), at(s * .38, .4 + H / 2, 0)); for (let k = 0; k * .32 < H - .2; k++) L.add("maderaV", new THREE.CylinderGeometry(.03, .03, .76, 6), at(0, .7 + k * .32, 0, 0, 0, Math.PI / 2));
  for (let yy = 2; yy < H; yy += 3) L.add("hierro", new THREE.BoxGeometry(.95, .08, .14), at(0, .4 + yy, 0));
  // pie de apoyo: caballete de vigas
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const [g, m] = cilEntre([sx * 1.5, .35, sz * 1.5], [sx * .4, 4.5, sz * .05], .08, 6); L.add("viga", g, at().multiply(m)) }
  // vientos de soga a estacas
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const ex = sx * 7, ez = sz * 7, ey = SUELO(x + ex, z + ez) - y; const [g, m] = cilEntre([0, H * .62, 0], [ex, ey + .3, ez], .018, 4); L.add("soga", g, at().multiply(m)); L.add("hierroO", new THREE.CylinderGeometry(.04, .05, .5, 6), at(ex, ey + .15, ez, .25 * sz, 0, -.25 * sx)) }
  // el torno (rueda con manija y soga que sube por la escalera), bolsas de tierra apiladas y dos carretillas con tierra
  { const M = at(2.4, .4, .8); L.add("viga", new THREE.BoxGeometry(.12, 1.1, .12), M.clone().multiply(TM(-.5, .55, 0))); L.add("viga", new THREE.BoxGeometry(.12, 1.1, .12), M.clone().multiply(TM(.5, .55, 0))); L.add("madera", new THREE.CylinderGeometry(.18, .18, 1.0, 10), M.clone().multiply(TM(0, 1.0, 0, 0, 0, Math.PI / 2))); L.add("soga", new THREE.CylinderGeometry(.2, .2, .7, 10), M.clone().multiply(TM(0, 1.0, 0, 0, 0, Math.PI / 2)));
    L.add("hierro", new THREE.BoxGeometry(.05, .5, .05), M.clone().multiply(TM(.62, .78, 0))); const [g, m] = cilEntre([2.4, 1.6, .8], [.1, H, -.12], .016, 4); L.add("soga", g, at().multiply(m)) }
  for (let k = 0; k < 14; k++) saco(L, at(-2.4 + (k % 4) * .55, .4 + (k >> 2) * .48 * 0 + (k >= 8 ? .5 : 0), 1.2 + (k % 3) * .12 - (k >> 2) * .1, k >= 8 ? Math.PI / 2 * .95 : 0, r() * .6, 0));
  for (const [dx, dz, ry] of [[-3.8, -1.6, .5], [3.6, -1.9, -.3]]) { const M = at(dx, -.05 + SUELO(x + dx, z + dz) - y, dz, 0, ry, 0); L.add("hierroO", new THREE.CylinderGeometry(.45, .3, .35, 12, 1, true), M.clone().multiply(TM(0, .55, 0))); L.add("tierra", geoPiedra(7110, 1, .5), M.clone().multiply(TM(0, .72, 0, 0, 0, 0, .44, .5, .44)));
    rueda(L, M.clone().multiply(TM(0, .2, .6, 0, Math.PI / 2, 0)), .2); for (const s of [-1, 1]) L.add("madera", new THREE.CylinderGeometry(.03, .03, 1.3, 5), M.clone().multiply(TM(s * .25, .5, -.5, 1.35, 0, 0))) }
  { const g = new THREE.CylinderGeometry(.35, .5, .3, 12); L.add("tierra", geoPiedra(7120, 2, .45), at(-1.2, .4, -2.6, 0, 0, 0, 1.3, .9, 1)) }
  for (const [dx, dz] of [[1.2, -2.2], [1.6, -2.4]]) L.add("madera", new THREE.CylinderGeometry(.025, .025, 1.5, 5), at(dx, 1.1, dz, .15, 0, .1));
  L.fin(ESCALERA, { ...PB_M }); ocupa(x, z, 4.5) }
const ESCALERA_TOP = [ESCALERA_KELL[0], ESC_TOP - .1, ESCALERA_KELL[1]];   // la punta de la escalera (para la cámara / los hombres de Kell)
const escaleraKell = (v = true) => { ESCALERA.visible = !!v };

// ---------- BARRILETES sobre la Loma: rombos de colores con varillas, cola de moñitos y el hilo hasta la mano del que lo remonta.
// barriletes(t) los mueve. KITE_MANOS = [[x, y, z] …]: dónde va la mano de cada uno (para poner a la gente)
const KITE_MANOS = [[-26, 0, -74], [-12, 0, -96], [22, 0, -96], [36, 0, -74], [-42, 0, -92], [4, 0, -116], [46, 0, -114], [-6, 0, -71], [-56, 0, -110]].map(([x, , z]) => [x, SUELO(x, z) + 1.35, z]);
const KITES = (() => { const r = rng(7200), cols = [["#d83a2e", "#f0c838"], ["#2e6ad8", "#f0f0e8"], ["#38a048", "#f0d040"], ["#e86a2a", "#5a2e88"], ["#f0f0e8", "#d83a6a"], ["#2a9ab0", "#f08a2a"]];
  const ts = cols.map(([a, b], k) => tex(256, 256, (g, w, h) => { g.fillStyle = a; g.fillRect(0, 0, w, h); g.fillStyle = b; if (k % 2) { g.fillRect(0, 0, w / 2, h / 2); g.fillRect(w / 2, h / 2, w / 2, h / 2) } else { g.beginPath(); g.arc(w / 2, h / 2, 70, 0, 7); g.fill() } g.strokeStyle = "rgba(40,30,20,.5)"; g.lineWidth = 8; g.strokeRect(0, 0, w, h) }));
  const gk = (() => { const g = new THREE.BufferGeometry(), pos = [0, .9, 0, -.55, .15, -.06, 0, -.75, 0, .55, .15, -.06, 0, .15, .05], uv = [.5, 1, 0, .5, .5, 0, 1, .5, .5, .5]; g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex([0, 1, 4, 1, 2, 4, 2, 3, 4, 3, 0, 4]); g.computeVertexNormals(); return g })();
  const gv = mergeG([[new THREE.CylinderGeometry(.012, .012, 1.65, 4), TM(0, .07, .03)], [new THREE.CylinderGeometry(.012, .012, 1.1, 4), TM(0, .15, .0, 0, 0, Math.PI / 2)]]);
  const L = KITE_MANOS.map((p, k) => { const G = new THREE.Group(); scene.add(G); const m = new THREE.Mesh(gk, new THREE.MeshStandardMaterial({ map: ts[k % ts.length], side: THREE.DoubleSide, roughness: .7 })); m.castShadow = true; G.add(m); const v = new THREE.Mesh(gv, M_MADERA); G.add(v);
    const cielo = CIELO(p[0], p[2]); return { G, p, alto: Math.min(cielo - 4, p[1] + 9 + r() * 8), dx: 5 + r() * 5, dz: (r() - .5) * 6, f: r() * 6.3, s: .9 + r() * .4, col: cols[k % cols.length] } });
  return L })();
const KITE_COLA = new THREE.InstancedMesh(mergeG([[new THREE.ConeGeometry(.09, .14, 3), TM(.07, 0, 0, 0, 0, -Math.PI / 2)], [new THREE.ConeGeometry(.09, .14, 3), TM(-.07, 0, 0, 0, 0, Math.PI / 2)]]), new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .8, side: THREE.DoubleSide }), KITES.length * 12);
const KITE_HILO = new THREE.InstancedMesh(new THREE.CylinderGeometry(.006, .006, 1, 3), new THREE.MeshStandardMaterial({ color: "#efe9da", roughness: 1 }), KITES.length * 24);
[KITE_COLA, KITE_HILO].forEach(m => { m.frustumCulled = false; scene.add(m) }); KITE_COLA.castShadow = true;
{ const cc = new THREE.Color(); KITES.forEach((K, k) => { for (let j = 0; j < 12; j++) KITE_COLA.setColorAt(k * 12 + j, cc.set(K.col[j % 2])) }) }
const KITE_E = { vis: true };
function barriletes(t = 0, vis = KITE_E.vis) { KITE_E.vis = vis; [KITE_COLA, KITE_HILO].forEach(m => m.visible = vis); const up = new THREE.Vector3(0, 1, 0), a = new THREE.Vector3(), b = new THREE.Vector3(), q = new THREE.Quaternion();
  KITES.forEach((K, k) => { K.G.visible = vis; if (!vis) return; const ph = t * .9 + K.f, kp = new THREE.Vector3(K.p[0] + K.dx + Math.sin(ph * .7) * 1.2, K.alto + Math.sin(ph * 1.1) * .6, K.p[2] + K.dz + Math.sin(ph * .5) * 1.4);
    K.G.position.copy(kp); K.G.rotation.set(-.5 + Math.sin(ph * 1.7) * .08, -Math.PI / 2 + .3 + Math.sin(ph * .6) * .25, Math.sin(ph * 1.3) * .22, "YXZ"); K.G.scale.setScalar(K.s);
    // hilo: curva que cuelga un poco, de la mano al barrilete
    const H = new THREE.Vector3(...K.p); for (let j = 0; j < 24; j++) { const u0 = j / 24, u1 = (j + 1) / 24, P = u => H.clone().lerp(kp, u).add(new THREE.Vector3(0, -Math.sin(u * Math.PI) * 1.1, 0)); a.copy(P(u0)); b.copy(P(u1)); const d = b.clone().sub(a); q.setFromUnitVectors(up, d.clone().normalize()); dummy.position.copy(a).add(b).multiplyScalar(.5); dummy.quaternion.copy(q); dummy.scale.set(1, d.length(), 1); dummy.updateMatrix(); KITE_HILO.setMatrixAt(k * 24 + j, dummy.matrix) }
    // cola: cuelga y se va con la brisa hacia +x, ondulando
    const bot = new THREE.Vector3(0, -.75 * K.s, 0).applyQuaternion(K.G.quaternion).add(kp); for (let j = 0; j < 12; j++) { const s = (j + 1) * .32; dummy.position.set(bot.x + s * .55 + Math.sin(ph * 3 - j * .7) * .12 * (j / 12), bot.y - s * .75, bot.z + Math.sin(ph * 2.3 - j * .9) * .25 * (j / 12)); dummy.rotation.set(0, Math.sin(ph * 4 + j) * .6, .4 + Math.sin(ph * 3 - j) * .3); dummy.scale.setScalar(1); dummy.updateMatrix(); KITE_COLA.setMatrixAt(k * 12 + j, dummy.matrix) } });
  KITE_COLA.instanceMatrix.needsUpdate = true; KITE_HILO.instanceMatrix.needsUpdate = true }

// ---------- todo junto
PB.fin(scene, PB_M); { const ms = PBV.fin(scene, PBV_M); Object.values(ms).forEach(m => { m.castShadow = true }) } PBT.fin(scene, PBT_M);

// ---------- TAPA DE PRUEBA (provisoria, apagada): un plano celeste a la altura CIELO(x, z) para ver el pueblo con el techo encima. puebloTapaPrueba(true)
const TAPA_PRUEBA = (() => { const g = new THREE.PlaneGeometry(460, 420, 92, 84); g.rotateX(Math.PI / 2); g.translate(0, 0, -15); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, CIELO(p.getX(i), p.getZ(i))); g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: "#8ab8e8", roughness: .9, side: THREE.DoubleSide, emissive: "#6a98c8", emissiveIntensity: .35 })); m.visible = false; m.receiveShadow = true; scene.add(m); return m })();
const puebloTapaPrueba = (v = false) => { TAPA_PRUEBA.visible = !!v };

// ---------- LA LUZ BAJO LA TAPA. El motor declara ENV después de este archivo: las escenas hacen una vez Object.assign(ENV, ENV_CIELO_PUEBLO)
// y después setEnv("bajo" | "recuerdo") (al recuerdo se le pone sepia aparte, con POST.sepia). «bajo»: de día pero sin sol visible (el sol es pintado):
// luz pareja, un poco fría, que baja casi derecha; sombras suaves; bruma celeste grisácea a lo lejos, por las calles.
const ENV_CIELO_PUEBLO = {
  bajo: { top: "#8fb2d6", hor: "#b4c4d0", fog: .0085, hemi: 2.25, hemiG: "#7e7464", sun: 1.55, sunCol: "#e4ecf8", exp: 1.2, grade: ["#d4e2f0", .05], sol: [-.28, 1, .32], sombra: 84 },
  recuerdo: { top: "#a8b8c8", hor: "#c8c2b2", fog: .008, hemi: 2.15, hemiG: "#8a7a60", sun: 1.75, sunCol: "#fff0d8", exp: 1.2, grade: ["#e8d0a8", .05], sol: [-.32, 1, .3], sombra: 84 } };
const ENV_VIENTO = { ...ENV_CIELO_PUEBLO, ventoso: ENV_CIELO_PUEBLO.bajo, tormenta: ENV_CIELO_PUEBLO.bajo };   // compatibilidad con escenas viejas
// el «sol» (luz direccional): las escenas pueden mover el centro de las sombras (SOL.x, SOL.z, SOL.r) y la dirección (SOL.dir = [x, y, z] hacia la luz)
const SOL = { x: 0, z: 0, r: null, dir: null };
function ambiente(t) { const A = ENV[ENVNOW] || {}, d = SOL.dir || A.sol || [-.28, 1, .32], l = Math.hypot(d[0], d[1], d[2]), cy = SUELO(SOL.x, SOL.z), R0 = SOL.r || A.sombra || 84; AMB.t = t; AMB.cam = [cam.position.x, cam.position.y, cam.position.z];
  sun.position.set(SOL.x + d[0] / l * 140, cy + d[1] / l * 140, SOL.z + d[2] / l * 140); sun.target.position.set(SOL.x, cy, SOL.z); sun.target.updateMatrixWorld();
  { const c = sun.shadow.camera; if (c.right !== R0) { c.left = -R0; c.right = R0; c.top = R0; c.bottom = -R0; c.near = 1; c.far = 330; c.updateProjectionMatrix() } }
  VIENTO.value = t; POLVO_U.uT.value = t; if (POLVO_M.visible) callePolvo(POLVO_U.uD.value); barriletes(t) }
// deja todo lo animado del pueblo en su estado de reposo (llamar al empezar cada cuadro, antes de ambiente): manivelas quietas y enteras, tornillos
// engrasados, techos sanos, sin polvillo, Tanner APLASTADA (el presente), el tajo de Pole Nine a la vista, escalera de Kell puesta, tapa de prueba apagada
function mundoReset() { for (let i = 0; i < POSTES.length; i++) if (POSTES[i].cab) { manivelaRota(i, 0); manivelaGiro(i, 0); posteGrasa(i, 1); if (i !== POSTE_9T) posteBaja(i, 0) }
  techosRajan(0); callePolvo(0); tannerEstado(1); poste9Corte(true); escaleraKell(true); campana(0); puebloTapaPrueba(false); KITE_E.vis = true; SOL.x = 0; SOL.z = 0; SOL.r = null; SOL.dir = null }
mundoReset();

// ---------- compatibilidad con las escenas viejas (Gusthollow): no hacen nada
const veleta = () => { }, VELETA_W = () => POSTE_TOP(POSTE_MI), TECHO_W = () => POSTE_TOP(POSTE_MI), cadenasRotas = () => { }, techoPanaderia = () => { }, humoInclinacion = () => { }, tormenta = () => { };
function vientoFuerza(f) { RAFAGA.value = .35 * Math.max(0, f) }
const CASAS_V = CASAS_P, MI_CASA = CASA_NARRADOR, PUNTOS = { sopa: [6, -5.6], boda: [0, 5.5], bebe: CASILLAS[POSTE_MI].puerta.filter((_, i) => i !== 1) };

// ================= ARRIBA DE LA TAPA: la tierra, los campos de trigo hasta el borde del mundo, la granja de Kell, la escalera, los montones de tierra nueva y el cielo DE VERDAD =================
// Usa TAPA (_bestia_cielo.js): todo lo de acá se hunde con la misma membrana (sagify) y lo del panel cae con el panel (TAPA.PAN_ARR).
// Al final: ENV_CIELO_TAPA (ambientes arriba / luzReal / bajoTapa), ARRIBA_Y, CAMS_TAPA y los stubs del video viejo (lejos, lejosReset…).
const ARRIBA = (() => {
  const T = TAPA, G = new THREE.Group(); G.name = "ARRIBA"; scene.add(G);
  const FINO = new THREE.Group(); G.add(FINO);                     // trigo de cerca (se apaga con la cámara lejos)
  const { sst, fbm, rd, hsh, sagify, depthDe, mergeGeo, coords, grilla, fueraPanel, lienzo, gris, envuelto, PAN_ARR } = T;
  const P0 = PANEL_MIO, AG = AGUJERO, ESC = ESCALERA_KELL;
  const TMx = (x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, "YXZ")), new THREE.Vector3(sx, sy, sz));
  const lin = h => { const c = new THREE.Color(h); return [c.r, c.g, c.b] }, mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  const SOMBRA = [];                                               // mallas de arriba que hacen sombra (se apagan con la cámara abajo)
  const sombra = (m, on = true) => { m.castShadow = on; m.receiveShadow = true; if (on) SOMBRA.push(m); return m };

  // ---------------- EL PISO DE ARRIBA ----------------
  const relieve = (x, z) => (fbm(x * .045, z * .045, 3) - .5) * .32 + (fbm(x * .4, z * .4, 2) - .5) * .05;
  const ARR0 = (x, z) => CIELO(x, z) + LID_T + relieve(x, z);       // en reposo (sin hundir)
  // caminos: de la trampa de la escalera hasta nuestro panel (y a la granja), y la huella larga de este a oeste
  const GRANJA = [-38, -50];
  const CAMINOS = [[[ESC[0], ESC[1]], [5, -66], [2, -50], [-1, -38], [1, -24], [3.5, -15], [4, -10.2]], [[2, -50], [-12, -51], [-24, -50], [GRANJA[0] + 6, GRANJA[1] + 1]]];
  const RUTA_Z = x => -30 + 5 * Math.sin(x * .006) + 2 * Math.sin(x * .021);
  const segD = (x, z, L) => { let d = 1e9; for (let i = 0; i < L.length - 1; i++) { const [x0, z0] = L[i], [x1, z1] = L[i + 1], dx = x1 - x0, dz = z1 - z0, t = cl(((x - x0) * dx + (z - z0) * dz) / (dx * dx + dz * dz)); d = Math.min(d, Math.hypot(x - x0 - dx * t, z - z0 - dz * t)) } return d };
  const caminoD = (x, z) => Math.min(...CAMINOS.map(L => segD(x, z, L)), Math.abs(z - RUTA_Z(x)) * (Math.abs(x) < 1600 ? 1 : 9));
  // parcelas (manchones de cultivo, como un tablero torcido): 0 trigo maduro, 1 trigo pálido, 2 arado, 3 rastrojo con fardos
  const parcela = (x, z) => { const u = x + 9 * Math.sin(z * .013), v = z + 7 * Math.sin(x * .011), i = Math.floor(u / 74), j = Math.floor(v / 48), fu = u / 74 - i, fv = v / 48 - j;
    const borde = Math.min(fu, 1 - fu) * 74, bordeV = Math.min(fv, 1 - fv) * 48, h = hsh(i + 300, j - 700);
    let tipo = h < .7 ? 0 : h < .84 ? 1 : h < .93 ? 2 : 3; if (x > -75 && x < 75 && z > -100 && z < 40) tipo = (Math.abs(x - GRANJA[0]) < 22 && Math.abs(z - GRANJA[1] + 14) < 8) ? 3 : 0;
    return { tipo, linde: Math.min(borde, bordeV), id: h } };
  const MONTONES_P = [[-6, -6.5, 2.4, .9], [-12.5, -4, 2.8, 1.1], [8.5, -6.8, 2.2, .8], [14.5, -3.5, 3, 1.2], [-1.5, -8.4, 1.8, .7], [20.5, -7, 2.4, .9], [-19.5, -6, 2.6, 1], [-8, 4.5, 2, .7], [11, 6, 2.3, .85]];
  const GRANJA_R = (x, z) => Math.abs(x - GRANJA[0]) < 22 && Math.abs(z - GRANJA[1]) < 14;
  const C_ORO = lin("#c7993f"), C_PALIDO = lin("#d5b56a"), C_ARADO = lin("#4e3826"), C_RASTROJO = lin("#b39a5e"), C_LINDE = lin("#7c7836"), C_CAMINO = lin("#9c8460"), C_PATIO = lin("#8f7a56");
  const colorArr = (x, z) => { const p = parcela(x, z), d = caminoD(x, z); let c = [C_ORO, C_PALIDO, C_ARADO, C_RASTROJO][p.tipo];
    c = mix3(c, [c[0] * .85, c[1] * .82, c[2] * .8], fbm(x * .03, z * .03, 3));
    if (p.linde < 1.4) c = mix3(C_LINDE, c, sst(.6, 1.4, p.linde));
    if (GRANJA_R(x, z)) c = C_PATIO;
    if (T.enPanel(x, z)) for (const [mx, mz, R] of MONTONES_P) { const dm = Math.hypot(x - mx, (z - mz) / .9) / R; if (dm < 2.1) c = mix3(mix3(C_ARADO, C_CAMINO, .35), c, sst(1.2, 2.1, dm)) }
    const tr = Math.hypot(x - ESC[0], z - ESC[1]); if (tr < 4) c = mix3(C_CAMINO, c, sst(2.5, 4, tr));
    return mix3(C_CAMINO, c, sst(1.1, 2, d)) };
  const T_ARR = (() => { const [c, z] = pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(7801); c.fillStyle = "#d8cfc0"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
      for (let k = 0; k < 2600; k++) { const x = r() * w, y = r() * h, R = 2 + r() * 9; c.fillStyle = r() < .5 ? `rgba(90,70,50,${.15 + r() * .3})` : `rgba(255,245,220,${.1 + r() * .25})`; envuelto(c, w, h, () => { c.beginPath(); c.ellipse(x, y, R, R * .7, r() * 3, 0, 7); c.fill() }); z.fillStyle = gris(.2 + r() * .8); z.beginPath(); z.ellipse(x, y, R * .8, R * .6, 0, 0, 7); z.fill() }
      for (let k = 0; k < 1400; k++) { const x = r() * w, y = r() * h, a = r() * 6.283, L = 10 + r() * 30; c.strokeStyle = `rgba(${200 + r() * 55 | 0},${170 + r() * 50 | 0},${90 + r() * 40 | 0},${.35 + r() * .4})`; c.lineWidth = 1.5 + r() * 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); c.stroke(); z.strokeStyle = "rgba(255,255,255,.6)"; z.lineWidth = 2; z.beginPath(); z.moveTo(x, y); z.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); z.stroke() }
      for (let y = 0; y < h; y += 64) { c.fillStyle = "rgba(60,40,20,.12)"; c.fillRect(0, y, w, 18); z.fillStyle = "rgba(0,0,0,.35)"; z.fillRect(0, y, w, 18) } });   // surcos
    [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
  const sueloMat = panel => sagify(new THREE.MeshStandardMaterial({ map: T_ARR.c, bumpMap: T_ARR.z, bumpScale: 2.5, vertexColors: true, roughness: .95 }), { panel, hole: panel, esc: !panel, key: "suelo" });
  const SUELO_A = sombra(new THREE.Mesh(grilla(coords(-50, 50, .5, 1700, 1.06), coords(-90, 45, .5, 1700, 1.06), ARR0, { skip: fueraPanel, uvs: 4, fc: colorArr }), sueloMat(false)), false); SUELO_A.frustumCulled = false; G.add(SUELO_A);
  const PXS = coords(P0.x0, P0.x1, .5, 0, 1).filter(v => v >= P0.x0 && v <= P0.x1), PZS = coords(P0.z0, P0.z1, .5, 0, 1).filter(v => v >= P0.z0 && v <= P0.z1);
  const SUELO_P = sombra(new THREE.Mesh(grilla(PXS, PZS, ARR0, { uvs: 4, fc: colorArr }), sueloMat(true)), false); PAN_ARR.add(SUELO_P);

  // ---------------- MONTONES DE TIERRA NUEVA sobre nuestro panel (y palas, carretillas) ----------------
  const T_TNUEVA = (() => { const [c, z] = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(7802); c.fillStyle = "#2b1f15"; c.fillRect(0, 0, w, h); z.fillStyle = "#606060"; z.fillRect(0, 0, w, h);
      for (let k = 0; k < 1500; k++) { const x = r() * w, y = r() * h, R = 2 + r() * 10; c.fillStyle = r() < .6 ? `rgba(14,9,5,${.3 + r() * .5})` : `rgba(90,66,44,${.2 + r() * .4})`; envuelto(c, w, h, () => { c.beginPath(); c.ellipse(x, y, R, R * .8, r() * 3, 0, 7); c.fill() }); z.fillStyle = gris(.3 + r() * .7); z.beginPath(); z.arc(x, y, R * .8, 0, 7); z.fill() } });
    [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3) }); return { c, z } })();
  const M_TNUEVA = sagify(new THREE.MeshStandardMaterial({ map: T_TNUEVA.c, bumpMap: T_TNUEVA.z, bumpScale: 4, roughness: .9, color: "#d0c4b8" }), { panel: true, key: "tn" });
  const MONTONES = new THREE.Group(); PAN_ARR.add(MONTONES);
  const montonG = seed => { const g = new THREE.IcosahedronGeometry(1, 4), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const v = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i)).normalize(), k = 1 + (fbm(v.x * 2.2 + seed, v.z * 2.2 - seed + v.y, 3) - .5) * .5; p.setXYZ(i, v.x * k, Math.max(v.y * k, -.05) , v.z * k) } g.computeVertexNormals(); return g };
  MONTONES_P.forEach(([x, z, R, H], i) => { const m = sombra(new THREE.Mesh(montonG(i * 3.7 + 1), M_TNUEVA)); m.position.set(x, ARR0(x, z) - .08, z); m.scale.set(R, H, R * (.75 + hsh(i, 3) * .4)); m.rotation.y = i; MONTONES.add(m) });
  { const r = rng(7803), L = []; MONTONES_P.forEach(([x, z, R]) => { for (let k = 0; k < 40; k++) { const a = r() * 6.283, d = R * (.9 + r() * .9); L.push([x + Math.cos(a) * d, z + Math.sin(a) * d * .9]) } });
    const m = sombra(new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.09, 0), M_TNUEVA, L.length)); L.forEach(([x, z], i) => { dummy.position.set(x, ARR0(x, z) + .02, z); dummy.rotation.set(r() * 3, r() * 3, 0); dummy.scale.set(.6 + r() * 1.4, .5 + r() * .8, .6 + r() * 1.4); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix) }); MONTONES.add(m) }
  // utilería de campo (merge por material)
  const M_MAD = new THREE.MeshStandardMaterial({ color: "#7a5636", roughness: .85 }), M_MADC = new THREE.MeshStandardMaterial({ color: "#a07a4e", roughness: .85 }), M_FIE = new THREE.MeshStandardMaterial({ color: "#3a3632", roughness: .5, metalness: .6 });
  const lote = () => { const B = new Map(); return { add(mat, g, m) { (B.get(mat) || B.set(mat, []).get(mat)).push([g, m]) }, fin(par, { panel = null, sh = true } = {}) { for (const [mat, L] of B) { const mm = panel === null ? mat : sagify(mat.clone(), { panel, key: "u" + panel }); const me = new THREE.Mesh(mergeGeo(L), mm); sombra(me, sh); par.add(me) } } } };
  const pala = (Lt, M) => { Lt.add(M_MADC, new THREE.CylinderGeometry(.02, .02, 1.1, 6), M.clone().multiply(TMx(0, .55, 0))); Lt.add(M_FIE, new THREE.BoxGeometry(.22, .28, .02), M.clone().multiply(TMx(0, -.12, 0))); Lt.add(M_MADC, new THREE.BoxGeometry(.14, .03, .03), M.clone().multiply(TMx(0, 1.1, 0))) };
  const carretilla = (Lt, M, llena = true) => { const q = (...a) => M.clone().multiply(TMx(...a));
    Lt.add(M_MAD, new THREE.BoxGeometry(.7, .05, .9), q(0, .42, 0)); for (const s of [-1, 1]) { Lt.add(M_MAD, new THREE.BoxGeometry(.05, .32, .95), q(s * .37, .56, 0, 0, 0, s * .2)); Lt.add(M_MADC, new THREE.CylinderGeometry(.025, .025, 1.7, 6), q(s * .28, .4, -.2, Math.PI / 2 - .12)); Lt.add(M_MAD, new THREE.BoxGeometry(.04, .4, .04), q(s * .25, .2, -.35)) }
    Lt.add(M_MAD, new THREE.BoxGeometry(.8, .3, .05), q(0, .56, .46, -.25)); Lt.add(M_MAD, new THREE.BoxGeometry(.8, .3, .05), q(0, .56, -.46, .2));
    Lt.add(M_FIE, new THREE.CylinderGeometry(.2, .2, .07, 14), q(0, .2, .72, 0, 0, Math.PI / 2)); if (llena) Lt.add(M_TNUEVA, new THREE.SphereGeometry(.42, 10, 6, 0, 6.283, 0, 1.4), q(0, .55, 0, 0, 0, 0, 1, .55, 1.1)) };
  { const Lt = lote(); const en = (x, z, ry, rx = 0, rz = 0) => TMx(x, ARR0(x, z), z, rx, ry, rz);
    pala(Lt, en(-5, -5, .3, .35, .2).multiply(TMx(0, .7, 0))); pala(Lt, en(-11.5, -2.6, 1.2, -.4).multiply(TMx(0, .8, 0))); pala(Lt, en(9.4, -5.8, -.6, .3, -.3).multiply(TMx(0, .6, 0))); pala(Lt, en(14, -1.8, 2, .2).multiply(TMx(0, .9, 0)));
    carretilla(Lt, en(-3.2, -7.5, 2.4)); carretilla(Lt, en(5.5, -8.2, -2.8)); carretilla(Lt, en(17.5, -5.2, 1.1), false); carretilla(Lt, en(-15.5, -7.6, .5));
    Lt.fin(MONTONES, { panel: true }) }

  // ---------------- TRIGO ----------------
  const trigoOk = (x, z, enPan) => { const p = parcela(x, z); if (p.tipo > 1 || p.linde < 1.1) return null; if (caminoD(x, z) < 1.5) return null; if (GRANJA_R(x, z)) return null; if (Math.hypot(x - ESC[0], z - ESC[1]) < 3.6) return null;
    if (Math.hypot(x - AG[0], z - AG[1]) < .62) return null; if (enPan) { for (const [mx, mz, R] of MONTONES_P) if (Math.hypot(x - mx, (z - mz) / .9) < R * 1.9) return null } return p.tipo };
  // mata de 8 tallos con espiga (cerca): ≈ 270 triángulos
  const MATA = (() => { const r = rng(7804), pos = [], col = [], nor = [];
    const tri = (a, b, c, ca, cb, cc) => { pos.push(...a, ...b, ...c); col.push(...ca, ...cb, ...cc); const n = new THREE.Vector3(...b).sub(new THREE.Vector3(...a)).cross(new THREE.Vector3(...c).sub(new THREE.Vector3(...a))).normalize(); if (n.y < 0) n.negate(); n.lerp(new THREE.Vector3(0, 1, 0), .55).normalize(); for (let k = 0; k < 3; k++) nor.push(n.x, n.y, n.z) };
    const quad = (a, b, c, d, ca, cb) => { tri(a, b, c, ca, ca, cb); tri(b, d, c, ca, cb, cb) };
    const cTB = lin("#6c6a30"), cTA = lin("#c9a14a"), cE1 = lin("#dcae54"), cE2 = lin("#a87d34"), cBa = lin("#f2d790"), cH = lin("#8a8a3c");
    for (let k = 0; k < 8; k++) { const a0 = r() * 6.283, d0 = Math.sqrt(r()) * .15, bx = Math.cos(a0) * d0, bz = Math.sin(a0) * d0, h = .92 + r() * .32, la = r() * 6.283, lv = .04 + r() * .16;
      const p0 = [bx, 0, bz], p1 = [bx + Math.cos(la) * lv * .25, h * .55, bz + Math.sin(la) * lv * .25], p2 = [bx + Math.cos(la) * lv, h, bz + Math.sin(la) * lv];
      const wa = la + Math.PI / 2, w = .0045, wx = Math.cos(wa) * w, wz = Math.sin(wa) * w;
      const L = (p, s) => [p[0] + wx * s, p[1], p[2] + wz * s];
      quad(L(p0, -1), L(p0, 1), L(p1, -1), L(p1, 1), cTB, mix3(cTB, cTA, .6)); quad(L(p1, -1), L(p1, 1), L(p2, -1), L(p2, 1), mix3(cTB, cTA, .6), cTA);
      // espiga: huso de 4 lados en la dirección del tallo
      const ax = new THREE.Vector3(...p2).sub(new THREE.Vector3(...p1)).normalize(), u = new THREE.Vector3(1, 0, 0).cross(ax).normalize(), v = ax.clone().cross(u), L0 = .075 + r() * .03, rot = r();
      const RR = [[0, .002], [.15, .009], [.5, .012], [.82, .009], [1, .002]], ring = RR.map(([t, rr]) => Array.from({ length: 4 }, (_, j) => { const an = (j + rot) / 4 * 6.283, q = new THREE.Vector3(...p2).addScaledVector(ax, t * L0).addScaledVector(u, Math.cos(an) * rr * 1.25).addScaledVector(v, Math.sin(an) * rr); return [q.x, q.y, q.z] }));
      for (let s = 0; s < RR.length - 1; s++) for (let j = 0; j < 4; j++) { const c0 = s % 2 ? cE1 : cE2, c1 = s % 2 ? cE2 : cE1; quad(ring[s][j], ring[s][(j + 1) % 4], ring[s + 1][j], ring[s + 1][(j + 1) % 4], c0, c1) }
      for (let q = 0; q < 3; q++) { const t = .35 + q * .3, b0 = new THREE.Vector3(...p2).addScaledVector(ax, t * L0), dir = ax.clone().multiplyScalar(.8).addScaledVector(u, (q - 1) * .5).normalize(), b1 = b0.clone().addScaledVector(dir, .07 + r() * .03); tri([b0.x - wx * .4, b0.y, b0.z - wz * .4], [b0.x + wx * .4, b0.y, b0.z + wz * .4], [b1.x, b1.y, b1.z], cBa, cBa, cBa) } }
    for (let k = 0; k < 3; k++) { const a = r() * 6.283, l = .25 + r() * .2, y0 = .05 + r() * .25, P = s => [Math.cos(a) * l * s, y0 + Math.sin(s * 2.2) * .18 * l * 2, Math.sin(a) * l * s], w = .012, wx = Math.cos(a + 1.57) * w, wz = Math.sin(a + 1.57) * w;
      for (let s = 0; s < 3; s++) { const A = P(s / 3), B = P((s + 1) / 3), f = 1 - s / 3; quad([A[0] - wx * f, A[1], A[2] - wz * f], [A[0] + wx * f, A[1], A[2] + wz * f], [B[0] - wx * f * .6, B[1], B[2] - wz * f * .6], [B[0] + wx * f * .6, B[1], B[2] + wz * f * .6], cH, cH) } }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); g.computeBoundingSphere(); return g })();
  // tarjetas cruzadas con trigo pintado (medio y lejos)
  const T_TARJ = tex(512, 512, (g, w, h) => { const r = rng(7805); g.clearRect(0, 0, w, h);
    for (let k = 0; k < 90; k++) { const x = 6 + r() * (w - 12), top = h * (.04 + r() * .2), lean = (r() - .5) * 26; g.strokeStyle = `rgb(${150 + r() * 50 | 0},${120 + r() * 40 | 0},${50 + r() * 30 | 0})`; g.lineWidth = 1.6 + r() * 1.4; g.beginPath(); g.moveTo(x, h); g.quadraticCurveTo(x + lean * .3, (h + top) / 2, x + lean, top + 34); g.stroke() }
    for (let k = 0; k < 70; k++) { const x = 10 + r() * (w - 20), y = h * (.05 + r() * .22), a = (r() - .5) * .4, L = 30 + r() * 16; g.save(); g.translate(x, y); g.rotate(a);
      g.strokeStyle = "rgba(245,220,150,.85)"; g.lineWidth = 1; for (let q = 0; q < 5; q++) { g.beginPath(); g.moveTo(0, -L * .3 + q * 5); g.lineTo((q - 2) * 5, -L * .3 + q * 5 - 22); g.stroke() }
      for (let q = 0; q < 6; q++) { g.fillStyle = q % 2 ? "#dcae54" : "#b08236"; g.beginPath(); g.ellipse(q % 2 ? 2.5 : -2.5, -L * .3 + q * L / 6, 4.2, 5.5, 0, 0, 7); g.fill() } g.restore() }
    for (let k = 0; k < 40; k++) { const x = r() * w; g.strokeStyle = "rgba(110,108,50,.9)"; g.lineWidth = 3; g.beginPath(); g.moveTo(x, h); g.quadraticCurveTo(x + (r() - .5) * 40, h * .75, x + (r() - .5) * 70, h * (.6 + r() * .2)); g.stroke() } });
  const TARJ = (() => { const L = []; for (let k = 0; k < 3; k++) { const p = new THREE.PlaneGeometry(1.15, 1.2); p.translate(0, .6, 0); p.rotateY(k * Math.PI / 3); const n = p.attributes.normal; for (let i = 0; i < n.count; i++) n.setXYZ(i, n.getX(i) * .35, .94, n.getZ(i) * .35); L.push([p, null]) } return mergeGeo(L) })();
  const trigoMat = (panel, tarj) => sagify(new THREE.MeshStandardMaterial(tarj ? { map: T_TARJ, alphaTest: .42, side: THREE.DoubleSide, roughness: .8 } : { vertexColors: true, side: THREE.DoubleSide, roughness: .75 }), { panel, wind: true, glow: true, key: "trigo" + (tarj ? "t" : "m") });
  const M_MATA = trigoMat(false, false), M_MATA_P = trigoMat(true, false), M_TARJ = trigoMat(false, true), M_TARJ_P = trigoMat(true, true);
  const D_MATA = depthDe({ wind: true }), D_MATA_P = depthDe({ wind: true, panel: true });
  const tinte = (tipo, x, z) => { const v = fbm(x * .05, z * .05, 2); return tipo === 1 ? [1.05, 1.02, .86] : [.92 + v * .16, .9 + v * .14, .86 + v * .1] };
  // instancias repartidas en celdas (la cámara y las sombras descartan lo que no ven)
  const instancias = (geo, mat, Lq, par, { celda = 16, sh = false, depth = null } = {}) => { const B = new Map(); Lq.forEach(q => { const k = Math.floor(q[0] / celda) + "_" + Math.floor(q[2] / celda); (B.get(k) || B.set(k, []).get(k)).push(q) }); const out = [], cc = new THREE.Color();
    for (const L of B.values()) { const m = new THREE.InstancedMesh(geo, mat, L.length); L.forEach((q, i) => { dummy.position.set(q[0], q[1], q[2]); dummy.rotation.set(q[4] || 0, q[3], q[5] || 0, "YXZ"); dummy.scale.setScalar(q[6]); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); m.setColorAt(i, cc.setRGB(...q[7])) }); m.computeBoundingSphere(); if (depth) m.customDepthMaterial = depth; sh ? sombra(m) : (m.receiveShadow = true); par.add(m); out.push(m) } return out };
  const MATAS = [], TARJS = [];
  { const r = rng(7806), hi = [], hiP = [], mid = [], midP = [];
    // cerca (matas 3D): alrededor del agujero, todo el panel y una banda de 7 m alrededor del panel
    const zonaHi = (x, z) => Math.hypot(x - AG[0], z - AG[1]) < 10 || (x > P0.x0 - 7 && x < P0.x1 + 7 && z > P0.z0 - 7 && z < P0.z1 + 7);
    for (let x = P0.x0 - 7; x < P0.x1 + 7; x += .34) for (let z = P0.z0 - 7; z < P0.z1 + 7; z += .34) { const d = Math.hypot(x - AG[0], z - AG[1]); if (d > 10 && r() < .42) continue;
      const px = x + (r() - .5) * .3, pz = z + (r() - .5) * .3, enPan = T.enPanel(px, pz), tp = trigoOk(px, pz, enPan); if (tp === null) continue;
      (enPan ? hiP : hi).push([px, ARR0(px, pz) - .03, pz, r() * 6.283, (r() - .5) * .12, (r() - .5) * .12, .9 + r() * .25, tinte(tp, px, pz)]) }
    // medio (tarjetas): hasta 70 m cada 0,95 m, hasta 190 m cada 1,6 m (más grandes)
    const cx = 0, cz = -20;
    for (let x = cx - 190; x < cx + 190; x += .95) for (let z = cz - 190; z < cz + 190; z += .95) { const R = Math.hypot(x - cx, z - cz); if (R > 190) continue; if (R > 70 && (Math.floor(x / .95) % 2 || Math.floor(z / .95) % 2)) continue;
      const px = x + (r() - .5) * .8, pz = z + (r() - .5) * .8; if (zonaHi(px, pz)) continue; const enPan = T.enPanel(px, pz), tp = trigoOk(px, pz, enPan); if (tp === null) continue;
      (enPan ? midP : mid).push([px, ARR0(px, pz) - .05, pz, r() * 6.283, 0, 0, R > 70 ? 1.75 + r() * .3 : .95 + r() * .2, tinte(tp, px, pz)]) }
    MATAS.push(...instancias(MATA, M_MATA, hi, FINO, { celda: 10, sh: true, depth: D_MATA }), ...instancias(MATA, M_MATA_P, hiP, PAN_ARR, { celda: 10, sh: true, depth: D_MATA_P }));
    TARJS.push(...instancias(TARJ, M_TARJ, mid, G, { celda: 24 }), ...instancias(TARJ, M_TARJ_P, midP, PAN_ARR, { celda: 24 }));
    T.ST.nTrigo = [hi.length, hiP.length, mid.length, midP.length] }

  // ---------------- CERCAS, ESPANTAPÁJAROS, FARDOS ----------------
  { const Lt = lote(), r = rng(7807), poste = (x, z, h = 1.25) => Lt.add(M_MAD, new THREE.BoxGeometry(.12, h, .12), TMx(x, ARR0(x, z) + h / 2 - .15, z, (r() - .5) * .08, r(), (r() - .5) * .08));
    const cerca = (L, paso = 2.4) => { for (let i = 0; i < L.length - 1; i++) { const [x0, z0] = L[i], [x1, z1] = L[i + 1], d = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(d / paso));
      for (let k = 0; k <= n; k++) { const x = lerp(x0, x1, k / n), z = lerp(z0, z1, k / n); poste(x, z); if (k < n) { const xa = lerp(x0, x1, (k + .5) / n), za = lerp(z0, z1, (k + .5) / n), ry = Math.atan2(x1 - x0, z1 - z0); for (const hy of [.45, .9]) Lt.add(M_MADC, new THREE.BoxGeometry(.06, .1, d / n + .1), TMx(xa, ARR0(xa, za) + hy - (r() - .5) * .05, za, 0, ry, (r() - .5) * .05)) } } } };
    cerca([[1.2, -12.5], [-1.5, -24], [-3, -36], [0, -48]]); cerca([[6.6, -13], [5.8, -24], [3.5, -36], [5, -48]]);
    cerca([[GRANJA[0] - 20, GRANJA[1] - 13], [GRANJA[0] + 20, GRANJA[1] - 13], [GRANJA[0] + 20, GRANJA[1] + 13], [GRANJA[0] + 7, GRANJA[1] + 13]]); cerca([[GRANJA[0] + 3, GRANJA[1] + 13], [GRANJA[0] - 20, GRANJA[1] + 13], [GRANJA[0] - 20, GRANJA[1] - 13]]);
    cerca([[-60, -18], [-30, -16], [-12, -14]], 3); cerca([[30, -16], [60, -19], [95, -22]], 3);
    // espantapájaros
    { const x = 12, z = -16, y = ARR0(x, z); Lt.add(M_MAD, new THREE.CylinderGeometry(.05, .06, 2.4, 6), TMx(x, y + 1, z)); Lt.add(M_MAD, new THREE.CylinderGeometry(.04, .04, 1.7, 6), TMx(x, y + 1.6, z, 0, .4, Math.PI / 2));
      Lt.add(new THREE.MeshStandardMaterial({ color: "#5a6a7a", roughness: 1 }), new THREE.BoxGeometry(.6, .8, .3), TMx(x, y + 1.3, z, 0, .4)); Lt.add(new THREE.MeshStandardMaterial({ color: "#d8c49a", roughness: 1 }), new THREE.SphereGeometry(.2, 10, 8), TMx(x, y + 2, z));
      Lt.add(new THREE.MeshStandardMaterial({ color: "#6a4a28", roughness: 1 }), new THREE.CylinderGeometry(.42, .42, .03, 14), TMx(x, y + 2.15, z)); Lt.add(new THREE.MeshStandardMaterial({ color: "#6a4a28", roughness: 1 }), new THREE.CylinderGeometry(.18, .22, .22, 12), TMx(x, y + 2.27, z)) }
    Lt.fin(G, { panel: false }) }
  // fardos redondos en los rastrojos
  const T_PAJA = (() => { const [c, z] = pintarDoble(512, 256, (c, z, w, h) => { const r = rng(7808); c.fillStyle = "#c8a65c"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h); for (let k = 0; k < 1800; k++) { const x = r() * w, y = r() * h, L = 8 + r() * 30; c.strokeStyle = r() < .5 ? `rgba(120,90,40,${.3 + r() * .4})` : `rgba(250,225,150,${.3 + r() * .4})`; c.lineWidth = 1 + r() * 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + L, y + (r() - .5) * 6); c.stroke(); z.strokeStyle = r() < .5 ? "#000" : "#fff"; z.lineWidth = 2; z.beginPath(); z.moveTo(x, y); z.lineTo(x + L, y); z.stroke() } }); [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
  const M_PAJA = new THREE.MeshStandardMaterial({ map: T_PAJA.c, bumpMap: T_PAJA.z, bumpScale: 3, roughness: 1 });
  { const r = rng(7809), L = []; for (let k = 0; k < 400 && L.length < 60; k++) { const x = -400 + r() * 800, z = -400 + r() * 700; if (parcela(x, z).tipo === 3 && caminoD(x, z) > 3 && !GRANJA_R(x, z)) L.push([x, z]) }
    for (const [x, z] of [[GRANJA[0] - 8, GRANJA[1] - 18], [GRANJA[0] - 4, GRANJA[1] - 17], [GRANJA[0] + 4, GRANJA[1] - 19], [GRANJA[0] + 10, GRANJA[1] - 17.5]]) L.push([x, z]);
    const g = new THREE.CylinderGeometry(.75, .75, 1.3, 20); g.rotateZ(Math.PI / 2); const m = sombra(new THREE.InstancedMesh(g, M_PAJA, L.length)); L.forEach(([x, z], i) => { dummy.position.set(x, ARR0(x, z) + .7, z); dummy.rotation.set(0, r() * 6.28, 0); dummy.scale.setScalar(.9 + r() * .2); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix) }); m.computeBoundingSphere(); G.add(m) }

  // ---------------- LA GRANJA DE KELL: casa de piedra clara, granero, silo, pozo, carro ----------------
  const T_PIEDRA_C = (() => { const [c, z] = pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(7810); c.fillStyle = "#a89a84"; c.fillRect(0, 0, w, h); z.fillStyle = "#303030"; z.fillRect(0, 0, w, h); const RH = 1024 / 6;   // 3 m de alto → hiladas de 0,5 m
      for (let y = 0; y < h; y += RH) { let x = -r() * 200; while (x < w) { const L = 180 + r() * 260, v = 200 + r() * 30 | 0; c.fillStyle = `rgb(${v},${v - 8 - r() * 8 | 0},${v - 26 - r() * 10 | 0})`; c.fillRect(x + 4, y + 4, L - 8, RH - 8); z.fillStyle = gris(.75 + r() * .2); z.fillRect(x + 5, y + 5, L - 10, RH - 10);
          for (let k = 0; k < 30; k++) { c.fillStyle = `rgba(${r() < .5 ? "120,110,90" : "250,245,230"},${.1 + r() * .2})`; c.beginPath(); c.arc(x + r() * L, y + r() * RH, 2 + r() * 8, 0, 7); c.fill() } x += L } }
      for (let k = 0; k < 40; k++) { const x = r() * w, y = r() * h, gr = c.createRadialGradient(x, y, 0, x, y, 40 + r() * 80); gr.addColorStop(0, "rgba(140,130,100,.25)"); gr.addColorStop(1, "rgba(140,130,100,0)"); c.fillStyle = gr; c.fillRect(0, 0, w, h) } }); [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
  const T_TEJA_R = (() => { const [c, z] = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(7811); c.fillStyle = "#5a2418"; c.fillRect(0, 0, w, h); z.fillStyle = "#000"; z.fillRect(0, 0, w, h);
      for (let y = h; y > -40; y -= 32) for (let x = (y / 32 % 2) * 20 - 20; x < w + 40; x += 40) { const v = r(); c.fillStyle = `rgb(${150 + v * 50 | 0},${60 + v * 25 | 0},${40 + v * 15 | 0})`; c.beginPath(); c.ellipse(x, y, 19, 30, 0, Math.PI, 0); c.fill(); const g = z.createRadialGradient(x, y - 8, 2, x, y, 30); g.addColorStop(0, "#fff"); g.addColorStop(1, "#202020"); z.fillStyle = g; z.beginPath(); z.ellipse(x, y, 19, 30, 0, Math.PI, 0); z.fill();
        if (r() < .08) { c.fillStyle = `rgba(90,110,50,${.3 + r() * .3})`; c.beginPath(); c.arc(x + (r() - .5) * 20, y - 10, 5 + r() * 8, 0, 7); c.fill() } } }); [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
  const T_TABLA_R = (() => { const [c, z] = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(7812); c.fillStyle = "#1e0e08"; c.fillRect(0, 0, w, h); z.fillStyle = "#000"; z.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 42) { const v = r(); c.fillStyle = `rgb(${110 + v * 30 | 0},${44 + v * 14 | 0},${30 + v * 10 | 0})`; c.fillRect(x + 2, 0, 38, h); z.fillStyle = "#c0c0c0"; z.fillRect(x + 2, 0, 38, h); for (let k = 0; k < 12; k++) { c.strokeStyle = `rgba(40,16,8,${.2 + r() * .3})`; c.lineWidth = 1; const xx = x + 4 + r() * 34; c.beginPath(); c.moveTo(xx, 0); c.lineTo(xx + (r() - .5) * 6, h); c.stroke() } for (const yy of [60, 300]) { c.fillStyle = "#222"; c.beginPath(); c.arc(x + 12, yy, 3, 0, 7); c.arc(x + 30, yy, 3, 0, 7); c.fill() } } }); [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
  const M_PIEDRA_C = new THREE.MeshStandardMaterial({ map: T_PIEDRA_C.c, bumpMap: T_PIEDRA_C.z, bumpScale: 3, roughness: .85 }), M_TEJA_R = new THREE.MeshStandardMaterial({ map: T_TEJA_R.c, bumpMap: T_TEJA_R.z, bumpScale: 4, roughness: .8 }), M_TABLA_R = new THREE.MeshStandardMaterial({ map: T_TABLA_R.c, bumpMap: T_TABLA_R.z, bumpScale: 2, roughness: .85 });
  const M_BLANCO = new THREE.MeshStandardMaterial({ color: "#ece6da", roughness: .7 }), M_VIDRIO = new THREE.MeshStandardMaterial({ color: "#20303a", roughness: .12, metalness: .7 }), M_POSTIGO = new THREE.MeshStandardMaterial({ color: "#3f6a4e", roughness: .7 }), M_PUERTA = new THREE.MeshStandardMaterial({ color: "#5a3420", roughness: .7 });
  // caja con uv por metro (tile = metros que cubre la textura)
  const caja = (w, h, d, tile = 3) => { const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]]; for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / tile, uv.getY(i) * dims[f][1] / tile) } return g };
  // techo a dos aguas sobre un rectángulo w × d (cumbrera a lo largo de x), alto hr, alero `al`
  const techo = (Lt, M, w, d, hr, al = .45, mat = M_TEJA_R) => { const s = Math.hypot(d / 2 + al, hr * (1 + al / (d / 2))), a = Math.atan2(hr, d / 2);
    for (const sg of [-1, 1]) Lt.add(mat, caja(w + al * 2, .14, s, 2.5), M.clone().multiply(TMx(0, hr / 2 - al * Math.tan(a) / 2, sg * (d / 4 + al / 2), sg * a, 0, 0)));
    Lt.add(mat, new THREE.CylinderGeometry(.14, .14, w + al * 2, 8), M.clone().multiply(TMx(0, hr + .06, 0, 0, 0, Math.PI / 2))) };
  const hastial = (Lt, M, d, hr, mat, tile = 3) => { const sh = new THREE.Shape([[-d / 2, 0], [d / 2, 0], [0, hr]].map(p => new THREE.Vector2(...p))), g = new THREE.ShapeGeometry(sh), p = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / tile, p.getY(i) / tile); Lt.add(mat, g, M) };
  const ventana = (Lt, M) => { const q = (...a) => M.clone().multiply(TMx(...a)); Lt.add(M_BLANCO, new THREE.BoxGeometry(1, 1.45, .16), q(0, 0, .02)); Lt.add(M_VIDRIO, new THREE.BoxGeometry(.8, 1.25, .1), q(0, 0, .06)); Lt.add(M_BLANCO, new THREE.BoxGeometry(.06, 1.25, .14), q(0, 0, .07)); Lt.add(M_BLANCO, new THREE.BoxGeometry(.8, .06, .14), q(0, .1, .07)); Lt.add(M_BLANCO, new THREE.BoxGeometry(1.2, .1, .3), q(0, -.78, .1));
    for (const s of [-1, 1]) { Lt.add(M_POSTIGO, new THREE.BoxGeometry(.5, 1.4, .05), q(s * .78, 0, .1)); for (let k = 0; k < 5; k++) Lt.add(M_POSTIGO, new THREE.BoxGeometry(.42, .04, .07), q(s * .78, -.5 + k * .25, .12, .4)) } };
  const piso = (x0, x1, z0, z1) => { let m = -1e9; for (let i = 0; i <= 4; i++) for (let j = 0; j <= 4; j++) m = Math.max(m, ARR0(lerp(x0, x1, i / 4), lerp(z0, z1, j / 4))); return m };
  const GRANJA_G = new THREE.Group(); G.add(GRANJA_G);
  { const Lt = lote(), [gx, gz] = GRANJA;
    // casa: 12 × 8, dos pisos (6,4 m), frente hacia +z (al campo y al pueblo); ala de un piso al este
    { const W = 12, D = 8, H = 6.4, x = gx + 2, z = gz + 2, y = piso(x - W / 2, x + W / 2, z - D / 2, z + D / 2), M = TMx(x, y, z), q = (...a) => M.clone().multiply(TMx(...a));
      Lt.add(M_PIEDRA_C, caja(W + .4, 1.6, D + .4), q(0, -.4, 0)); Lt.add(M_PIEDRA_C, caja(W, H, D), q(0, H / 2, 0)); Lt.add(M_BLANCO, caja(W + .2, .22, D + .2, 1), q(0, 3.2, 0)); Lt.add(M_BLANCO, caja(W + .3, .25, D + .3, 1), q(0, H, 0));
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (let k = 0; k < 9; k++) Lt.add(M_PIEDRA_C, caja(k % 2 ? .5 : .75, .34, k % 2 ? .75 : .5, 1.5), q(sx * (W / 2 - .15), .3 + k * .7, sz * (D / 2 - .15)));
      techo(Lt, q(0, H, 0), W, D, 3.4); for (const s of [-1, 1]) hastial(Lt, q(s * W / 2, H, 0, 0, s * Math.PI / 2), D, 3.4, M_PIEDRA_C);
      for (const cx of [-3.6, 3.6]) { Lt.add(M_PIEDRA_C, caja(1, 3.4, 1, 1.5), q(cx, H + 2.6, -1)); Lt.add(M_BLANCO, caja(1.25, .2, 1.25, 1), q(cx, H + 4.3, -1)) }
      for (const fx of [-4.3, -1.6, 1.6, 4.3]) { ventana(Lt, q(fx, 4.8, D / 2)); if (Math.abs(fx) > 2) ventana(Lt, q(fx, 1.75, D / 2)) }
      for (const fx of [-3, 3]) { ventana(Lt, q(fx, 4.8, -D / 2, 0, Math.PI)); ventana(Lt, q(fx, 1.75, -D / 2, 0, Math.PI)) } ventana(Lt, q(W / 2, 4.8, 0, 0, Math.PI / 2)); ventana(Lt, q(-W / 2, 4.8, 0, 0, -Math.PI / 2));
      Lt.add(M_PUERTA, new THREE.BoxGeometry(1.3, 2.4, .2), q(0, 1.2, D / 2)); Lt.add(M_BLANCO, new THREE.BoxGeometry(1.7, 2.8, .14), q(0, 1.35, D / 2 - .02)); Lt.add(M_FIE, new THREE.SphereGeometry(.05, 8, 6), q(.45, 1.2, D / 2 + .12));
      for (const s of [-1, 1]) Lt.add(M_BLANCO, new THREE.CylinderGeometry(.16, .2, 2.8, 12), q(s * 1.3, 1.4, D / 2 + 1.6)); techo(Lt, q(0, 2.85, D / 2 + 1.1, 0, Math.PI / 2), 2.4, 3.4, .7, .15);
      for (let k = 0; k < 3; k++) Lt.add(M_PIEDRA_C, caja(3.4, .2, .5, 1.5), q(0, -.1 - k * .2, D / 2 + .5 + k * .45));
      // ala este
      Lt.add(M_PIEDRA_C, caja(6, 3.6, 6.5), q(W / 2 + 3, 1.8, -.5)); techo(Lt, q(W / 2 + 3, 3.6, -.5, 0, Math.PI / 2), 6.5, 6, 2.2); ventana(Lt, q(W / 2 + 3, 1.8, 2.75)); ventana(Lt, q(W / 2 + 6, 1.8, -.5, 0, Math.PI / 2));
      for (let k = 0; k < 6; k++) Lt.add(new THREE.MeshStandardMaterial({ color: ["#c0392b", "#e8c040", "#e07a9a", "#f0f0e0"][k % 4], roughness: .8 }), new THREE.SphereGeometry(.13, 6, 5), q(-4.3 + (k % 3) * .3 - .3, 1.05, D / 2 + .25)) }
    // granero: 15 × 10, tablas rojas sobre zócalo de piedra, portón, pajar
    { const W = 15, D = 10, H = 5.6, x = gx - 12, z = gz - 4, y = piso(x - D / 2, x + D / 2, z - W / 2, z + W / 2), M = TMx(x, y, z, 0, Math.PI / 2), q = (...a) => M.clone().multiply(TMx(...a));
      Lt.add(M_PIEDRA_C, caja(W + .3, 2.4, D + .3), q(0, .2, 0)); Lt.add(M_TABLA_R, caja(W, H - 1.4, D, 3), q(0, 1.4 + (H - 1.4) / 2, 0)); techo(Lt, q(0, H, 0), W, D, 4.6, .6, new THREE.MeshStandardMaterial({ color: "#5a5a58", roughness: .8, map: T_TEJA_R.c }));
      for (const s of [-1, 1]) { hastial(Lt, q(s * W / 2, H, 0, 0, s * Math.PI / 2), D, 4.6, M_TABLA_R); Lt.add(M_PUERTA, new THREE.BoxGeometry(.2, 3.6, 4.4), q(s * (W / 2 + .05), 1.8, 0)); Lt.add(M_BLANCO, new THREE.BoxGeometry(.24, .2, 4.6), q(s * (W / 2 + .07), 3.6, 0)); for (const d of [-1, 1]) Lt.add(M_BLANCO, new THREE.BoxGeometry(.24, 4.4, .16), q(s * (W / 2 + .07), 1.8, 0, Math.atan2(4.4, 3.6) * d, 0, 0)); Lt.add(M_PUERTA, new THREE.BoxGeometry(.2, 1.5, 1.6), q(s * (W / 2 + .05), 6.3, 0)); Lt.add(M_PAJA, new THREE.BoxGeometry(.1, 1.2, 1.3), q(s * (W / 2 + .14), 6.25, 0)) }
      for (let k = -2; k <= 2; k++) ventana(Lt, q(k * 2.8, 3.2, D / 2, 0, 0, 0, .7)) }
    // silo y pozo
    { const x = gx - 22, z = gz + 6, y = piso(x - 2.5, x + 2.5, z - 2.5, z + 2.5); const g = new THREE.CylinderGeometry(2.4, 2.6, 10, 28, 1, true), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 15 / 3, uv.getY(i) * 10 / 3); Lt.add(M_PIEDRA_C, g, TMx(x, y + 4.4, z)); Lt.add(M_TEJA_R, new THREE.ConeGeometry(2.9, 2.6, 28), TMx(x, y + 10.7, z)); Lt.add(M_BLANCO, new THREE.TorusGeometry(2.45, .1, 6, 28), TMx(x, y + 9.4, z, Math.PI / 2)) }
    { const x = gx + 8, z = gz + 10, y = ARR0(x, z); Lt.add(M_PIEDRA_C, new THREE.CylinderGeometry(.9, .95, .9, 18), TMx(x, y + .4, z)); for (const s of [-1, 1]) Lt.add(M_MAD, new THREE.BoxGeometry(.12, 1.8, .12), TMx(x + s * .8, y + 1.3, z)); techo(Lt, TMx(x, y + 2.1, z), 2, 1.6, .6, .2) }
    // carro de tierra junto al camino (dos ruedas)
    { const x = -4, z = -44, y = ARR0(x, z), M = TMx(x, y, z, 0, .3), q = (...a) => M.clone().multiply(TMx(...a)); Lt.add(M_MAD, caja(1.8, .5, 3, 1.5), q(0, 1, 0)); Lt.add(M_TNUEVA, new THREE.SphereGeometry(1, 12, 8, 0, 6.283, 0, 1.3), q(0, 1.15, 0, 0, 0, 0, .85, .45, 1.4));
      for (const s of [-1, 1]) Lt.add(M_MAD, new THREE.TorusGeometry(.6, .07, 6, 18), q(s * 1, .6, 0, 0, Math.PI / 2)); Lt.add(M_MAD, new THREE.BoxGeometry(.1, .1, 2.4), q(-.3, .8, 2.4)); Lt.add(M_MAD, new THREE.BoxGeometry(.1, .1, 2.4), q(.3, .8, 2.4)) }
    Lt.fin(GRANJA_G) }
  // árboles (robles): copas de bultos, troncos; cerca de la granja, en lindes y aislados
  const ARBOL = (() => { const r = rng(7813), cop = [], tr = []; const bul = (s) => { const g = new THREE.IcosahedronGeometry(1, 2), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const v = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i)), k = 1 + (fbm(v.x * 1.6 + s, v.z * 1.6 - s + v.y, 3) - .5) * .6; p.setXYZ(i, v.x * k, v.y * k * .85, v.z * k) } g.computeVertexNormals(); return g };
    tr.push([new THREE.CylinderGeometry(.28, .45, 4.4, 8), TMx(0, 2.2, 0)]); for (let k = 0; k < 3; k++) tr.push([new THREE.CylinderGeometry(.12, .2, 2.6, 6), TMx(Math.cos(k * 2.1) * .7, 4.2, Math.sin(k * 2.1) * .7, Math.sin(k * 2.1) * .6, 0, -Math.cos(k * 2.1) * .6)]);
    for (let k = 0; k < 9; k++) { const a = r() * 6.283, d = r() * 2.4; cop.push([bul(k), TMx(Math.cos(a) * d, 5.6 + r() * 2.2, Math.sin(a) * d, 0, 0, 0, 1.6 + r() * 1)]) }
    const gc = mergeGeo(cop), c = gc.attributes.position, col = new Float32Array(c.count * 3); for (let i = 0; i < c.count; i++) { const v = .55 + .45 * cl((c.getY(i) - 4) / 5), q = fbm(c.getX(i) * .9, c.getZ(i) * .9 + c.getY(i), 2); col.set([.26 * v + q * .08, .38 * v + q * .08, .14 * v], i * 3) } gc.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return { gc, gt: mergeGeo(tr) } })();
  { const r = rng(7814), L = [[GRANJA[0] - 22, GRANJA[1] - 8], [GRANJA[0] - 24, GRANJA[1] + 1], [GRANJA[0] + 16, GRANJA[1] - 10], [GRANJA[0] + 14, GRANJA[1] + 12], [GRANJA[0] - 6, GRANJA[1] - 15], [26, -42], [-24, -22], [48, -12]];
    for (let k = 0; k < 160 && L.length < 70; k++) { const x = -700 + r() * 1400, z = -700 + r() * 1200, p = parcela(x, z); if (p.linde < 1.2 && Math.hypot(x, z) > 60) L.push([x, z]) }
    const mc = new THREE.InstancedMesh(ARBOL.gc, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .85 }), L.length), mt = new THREE.InstancedMesh(ARBOL.gt, new THREE.MeshStandardMaterial({ color: "#4a3626", roughness: .9 }), L.length);
    L.forEach(([x, z], i) => { dummy.position.set(x, ARR0(x, z) - .2, z); dummy.rotation.set(0, r() * 6.28, 0); dummy.scale.setScalar(.8 + r() * .5); dummy.updateMatrix(); mc.setMatrixAt(i, dummy.matrix); mt.setMatrixAt(i, dummy.matrix) }); [mc, mt].forEach(m => { m.computeBoundingSphere(); sombra(m); G.add(m) }) }

  // ---------------- LA ESCALERA DE KELL: trampa con tapa abierta y la escalera larga que baja a la Loma ----------------
  const ESCALERA = new THREE.Group(); scene.add(ESCALERA);
  { const Lt = lote(), [x, z] = ESC, yb = CIELO(x, z), yt = ARR0(x, z), yp = ALT_C(x, z), H = .7;
    for (const [dx, dz, w, d] of [[0, -H - .08, 1.7, .16], [0, H + .08, 1.7, .16], [-H - .08, 0, .16, 1.4], [H + .08, 0, .16, 1.4]]) Lt.add(M_MAD, new THREE.BoxGeometry(w, .3, d), TMx(x + dx, yt + .08, z + dz));
    Lt.add(M_MAD, new THREE.BoxGeometry(1.4, .08, 1.4), TMx(x, yt + .7, z - H - .35, -1.25)); Lt.add(M_FIE, new THREE.BoxGeometry(.5, .04, .06), TMx(x, yt + .75, z - H - .3, -1.25));
    for (const s of [-1, 1]) { Lt.add(M_MADC, new THREE.BoxGeometry(.08, yt + 1.1 - yp, .1), TMx(x + s * .32, (yt + 1.1 + yp) / 2, z + .4)); }
    const n = Math.floor((yt + 1 - yp) / .32); for (let k = 0; k < n; k++) Lt.add(M_MADC, new THREE.CylinderGeometry(.025, .025, .64, 6), TMx(x, yp + .3 + k * .32, z + .4, 0, 0, Math.PI / 2));
    // la boca en el corte de la tapa (cuatro paredes de tablón y tierra)
    for (const [dx, dz, ry] of [[0, -H, 0], [0, H, Math.PI], [-H, 0, Math.PI / 2], [H, 0, -Math.PI / 2]]) Lt.add(new THREE.MeshStandardMaterial({ map: T.CORTE.c, bumpMap: T.CORTE.z, bumpScale: 3, roughness: .95, side: THREE.DoubleSide }), new THREE.PlaneGeometry(1.44, LID_T), TMx(x + dx, yb + LID_T / 2, z + dz, 0, ry));
    // farol colgado
    Lt.add(M_MAD, new THREE.BoxGeometry(.1, 2, .1), TMx(x + 1.3, yt + 1, z + 1.2)); Lt.add(M_MAD, new THREE.BoxGeometry(.6, .08, .08), TMx(x + 1.05, yt + 1.95, z + 1.2)); Lt.add(M_FIE, new THREE.BoxGeometry(.22, .3, .22), TMx(x + .8, yt + 1.7, z + 1.2));
    Lt.fin(ESCALERA) }

  // ---------------- EL CIELO DE VERDAD: sol dorado bajo y nubes con volumen ----------------
  const SOL_G = new THREE.Group(); scene.add(SOL_G);
  const T_DISCO = tex(256, 256, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, "rgba(255,250,230,1)"); gr.addColorStop(.42, "rgba(255,240,200,1)"); gr.addColorStop(.5, "rgba(255,214,140,.55)"); gr.addColorStop(1, "rgba(255,190,110,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h) });
  const SOL_D = new THREE.Sprite(new THREE.SpriteMaterial({ map: T_DISCO, fog: false, depthWrite: false, toneMapped: false, color: "#ffffff" })), SOL_H = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#ffc070", fog: false, depthWrite: false, transparent: true, opacity: .55, blending: THREE.AdditiveBlending }));
  SOL_D.scale.setScalar(22); SOL_H.scale.setScalar(150); SOL_G.add(SOL_H, SOL_D);
  const T_COPO = tex(256, 256, (g, w, h) => { const r = rng(7815); g.clearRect(0, 0, w, h); for (let k = 0; k < 26; k++) { const a = r() * 6.283, d = r() * 60, x = w / 2 + Math.cos(a) * d, y = h / 2 + Math.sin(a) * d * .8, R = 30 + r() * 40, gr = g.createRadialGradient(x - R * .2, y - R * .3, 0, x, y, R); gr.addColorStop(0, "rgba(255,255,255,.55)"); gr.addColorStop(.6, "rgba(235,238,245,.3)"); gr.addColorStop(1, "rgba(220,225,235,0)"); g.fillStyle = gr; g.beginPath(); g.arc(x, y, R, 0, 7); g.fill() } });
  const NUBES_R = (() => { const r = rng(7816), Cq = []; for (let k = 0; k < 30; k++) { const a = r() * 6.283, d = 280 + r() * 700, cx = Math.cos(a) * d, cz = Math.sin(a) * d - 40, cy = 120 + r() * 140, R0 = 26 + r() * 30, n = 14 + r() * 12 | 0;
      for (let q = 0; q < n; q++) { const u = r() * 2 - 1, v = r(), R = R0 * (.4 + r() * .4) * (1 - Math.abs(u) * .45), y = cy + v * R0 * .6 * (1 - u * u); Cq.push([cx + u * R0 * 1.9, y, cz + (r() - .5) * R0 * .9, R * 2.2, v, r() * 6.28]) } }
    const m = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: T_COPO, transparent: true, depthWrite: false, fog: true }), Cq.length); m.frustumCulled = false; m.renderOrder = 1; scene.add(m);
    Cq.forEach((_, i) => m.setColorAt(i, new THREE.Color(1, 1, 1))); return { m, Cq } })();

  // ---------------- AMBIENTES ----------------
  const ENV_T = {
    arriba: { top: "#2a6cd0", hor: "#f2d9a8", fog: .0012, hemi: .85, hemiG: "#8a6a30", sun: 4.6, sunCol: "#ffcf8c", exp: 1.05, grade: ["#ffcf8a", .06], sol: T.SOL_REAL, nube: ["#fff2dc", 1], tapaEmi: .9, trigoGlow: .5 },
    luzReal: { top: "#9cc4ea", hor: "#a6c8e6", fog: .005, hemi: 1.0, hemiG: "#7a6a50", sun: 1.4, sunCol: "#dfe8f4", exp: 1.12, grade: ["#ffd9a0", .04], sol: [-.3, .9, .3], nube: ["#ffffff", 1], tapaEmi: .7, trigoGlow: .7 },
    bajoTapa: { top: "#9cc4ea", hor: "#b4d3ee", fog: .0035, hemi: 1.3, hemiG: "#8a7a5c", sun: 2.8, sunCol: "#fff0da", exp: 1.12, grade: ["#ffffff", 0], sol: [-.35, .85, .4], nube: ["#ffffff", 1], tapaEmi: .95, trigoGlow: .35 } };

  // ---------------- por cuadro (lo llama tapa()) ----------------
  const AR = { montones: true, escalera: false };
  function tapaArriba(t, ST) { MONTONES.visible = ST.montones; ESCALERA.visible = ST.escalera; T.U.uEsc.value = ST.escalera ? 1 : 0 }
  // ---------------- antes de dibujar: qué se ve según la cámara, el sol, el cielo ----------------
  const _d = new THREE.Vector3(), _q2 = new THREE.Quaternion(), _Z = new THREE.Vector3(0, 0, 1), _c = new THREE.Color(), _sv = new THREE.Vector3();
  const sombraOn = []; let ultAbajo = null;
  function arribaCam(c, s0) { if (!c || !c.isPerspectiveCamera) return;
    if (c.far < 2999) { c.far = 3000; c.updateProjectionMatrix() }
    try { SKY.position.copy(c.position); SKY.updateMatrixWorld() } catch (e) { }
    const ST = T.ST, A = (typeof ENV !== "undefined" && ENV[ENVNOW]) || {}, cp = c.position;
    const abajo = cp.y < (ST.cae > 0 && T.enPanel(cp.x, cp.z) ? CIELO(cp.x, cp.z) : TAPA_Y(cp.x, cp.z)) - .02;
    const abierto = ST.agu > .3 || ST.cae > 0 || ST.escalera;
    const ver = !abajo || abierto;
    T.SPOT.intensity = abajo ? (ST.spotI || 0) : 0;   // el haz solo ilumina abajo (arriba ya pega el sol)
    G.visible = SOL_G.visible = NUBES_R.m.visible = ver; PAN_ARR.visible = ver || ST.cae > 0;
    FINO.visible = ver && Math.hypot(cp.x - T.PC[0], (cp.z - T.PC[1]) * 1.4) < 70;
    if (abajo !== ultAbajo) { ultAbajo = abajo; SOMBRA.forEach(m => m.castShadow = !abajo) }
    if (ST.cae > .3) PAN_ARR.traverse(o => { if (o.isMesh) o.castShadow = true });
    T.U.uEmi.value = A.tapaEmi ?? .9; T.U.uGlow.value = A.trigoGlow ?? .35; T.PSCALE.value = (typeof H !== "undefined" ? H : 1920) / (2 * Math.tan(c.fov * Math.PI / 360));
    _sv.set(...T.SOL_REAL).transformDirection(c.matrixWorldInverse); T.U.uSunV.value.copy(_sv);
    if (s0 && s0.overrideMaterial) return;
    if (!ver) return;
    // sol y nubes de verdad
    SOL_G.position.set(cp.x + T.SOL_REAL[0] * 380, cp.y + T.SOL_REAL[1] * 380, cp.z + T.SOL_REAL[2] * 380);
    { const M = NUBES_R.m; NUBES_R.Cq.forEach(([x, y, z, sc, v, rot], i) => { dummy.position.set(x, y, z); _q2.setFromAxisAngle(_Z, rot); dummy.quaternion.copy(c.quaternion).multiply(_q2); dummy.scale.set(sc, sc * .8, 1); dummy.updateMatrix(); M.setMatrixAt(i, dummy.matrix);
        _d.set(x - cp.x, y - cp.y, z - cp.z).normalize(); const al = Math.max(0, _d.dot(new THREE.Vector3(...T.SOL_REAL))), b = .72 + .28 * v; M.setColorAt(i, _c.setRGB(b + al * .25, b * .97 + al * .15, b * .93)) }); M.instanceMatrix.needsUpdate = true; M.instanceColor.needsUpdate = true }
    // el sol de arriba: la caja de sombras se centra donde mira la cámara (sobre el piso de arriba)
    if (!abajo && typeof sun !== "undefined") { c.getWorldDirection(_d); let hit = null; for (let s = 2; s < 900; s *= 1.06) { const x = cp.x + _d.x * s, y = cp.y + _d.y * s, z = cp.z + _d.z * s; if (y < ARR0(x, z)) { hit = [x, z, s]; break } }
      if (!hit) hit = [cp.x + _d.x * 120, cp.z + _d.z * 120, 120]; const sd = T.SOL_REAL, cy = ARR0(hit[0], hit[1]), Rr = cl(hit[2] * .7, 14, 140);
      sun.position.set(hit[0] + sd[0] * 300, cy + sd[1] * 300, hit[1] + sd[2] * 300); sun.target.position.set(hit[0], cy, hit[1]); sun.updateMatrixWorld(); sun.target.updateMatrixWorld();
      const sc = sun.shadow.camera; if (sc.right !== Rr || sc.far !== 700) { sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 100; sc.far = 700; sc.updateProjectionMatrix() } } }
  { const prev = scene.onBeforeRender; scene.onBeforeRender = function (r, s, c, rt) { if (prev) prev.call(this, r, s, c, rt); arribaCam(c, s) } }
  // los puntos (polvo, motas, briznas) no entran a las pasadas con material forzado (GTAO, normales): ahí salían como cuadrados negros
  const PUNTOS = [T.POLVO, T.MOTAS, T.LLUVIA.mb];
  { const prev = scene.onBeforeRender; scene.onBeforeRender = function (r, s, c, rt) { if (prev) prev.call(this, r, s, c, rt); if (s && s.overrideMaterial) PUNTOS.forEach(p => { p.userData.ov = p.visible; p.visible = false }) } }
  { const prev = scene.onAfterRender; scene.onAfterRender = function (r, s, c, rt) { if (prev) prev.call(this, r, s, c, rt); PUNTOS.forEach(p => { if (p.userData.ov !== undefined) { p.visible = p.userData.ov; delete p.userData.ov } }) } }

  // ---------------- coordenadas para la cámara ----------------
  const AGY = CIELO(...AG);
  const CAMS = {
    calleArriba: { p: [0, 1.7, 8], l: [0, 12, -20], f: 60, env: "bajoTapa", nota: "desde la calle mirando arriba: tiene que parecer cielo (sol pintado arriba a la derecha si se mira al noreste)" },
    calleSol: { p: [6, 1.7, -22], l: [SOL_PINTADO[0], CIELO(...SOL_PINTADO), SOL_PINTADO[1]], f: 50, env: "bajoTapa", nota: "el sol pintado (círculo blanco) con el halo y nubes alrededor" },
    bajoTapa: { p: [AG[0] - .7, AGY - .8, AG[1] + 1.1], l: [AG[0] + .4, AGY, AG[1] - .4], f: 55, env: "bajoTapa", nota: "a 0,8 m de la tapa junto al agujero: madera pintada (tablones, vetas, clavos, descascarado)" },
    cuchillo: { p: [AG[0] - .35, AGY - .45, AG[1] + .45], l: [AG[0], AGY, AG[1]], f: 50, env: "bajoTapa", nota: "plano detalle del tajo (tapaAgujero 0 → .35)" },
    cabezaAgujero: { p: [AG[0], AGY + LID_T + .32, AG[1]], l: [AG[0] - 30, AGY + LID_T + 1.8, AG[1] - 9], f: 55, env: "arriba", nota: "la cabeza asomada por el agujero mirando al oeste: trigo enorme, campo hasta el horizonte, el sol dorado" },
    cabezaGranja: { p: [AG[0], AGY + LID_T + .32, AG[1]], l: [GRANJA[0], ARR0(...GRANJA) + 3, GRANJA[1]], f: 50, env: "arriba", nota: "desde el agujero hacia la granja de Kell y la loma de trigo" },
    montones: { p: [AG[0] + .2, AGY + LID_T + 1.05, AG[1] + .3], l: [-4, AGY + LID_T + .3, -8], f: 52, env: "arriba", nota: "desde el agujero hacia los montones de tierra nueva, carretillas y palas (escena «dirt»)" },
    escalera: { p: [ESC[0] + 7, ARR0(ESC[0] + 7, ESC[1] + 10) + 4.5, ESC[1] + 10], l: [ESC[0], ARR0(...ESC) + .5, ESC[1]], f: 50, env: "arriba", nota: "la boca de la escalera de Kell en la trampa (escaleraArriba(true))" },
    aereoHueco: { p: [34, 58, 48], l: [0, 8, 0], f: 45, env: "arriba", nota: "aéreo con el hueco (tapaCae 1): se ve la calle abajo con el panel caído" },
    kellMira: { p: [KELL_BORDE[0] + 3, KELL_BORDE[1] + 5.5, KELL_BORDE[2] - 5], l: [KELL_BORDE[0] - 1.5, KELL_BORDE[1] - 9, KELL_BORDE[2] + 8], f: 50, env: "arriba", nota: "detrás de Kell parado en el borde del hueco, mirando abajo" },
    calleHueco: { p: [8, 1.6, 16], l: [0, 12, -2], f: 55, env: "luzReal", nota: "desde la calle: el hueco con el cielo de verdad, el haz y la lluvia de oro (tapaCae 1, lluviaTrigo)" },
    calleHaz: { p: [9, 1.6, 9], l: [3, 4, 2], f: 55, env: "luzReal", nota: "el haz del agujero cayendo en la calle con polvo (tapaAgujero 1)" } };

  return { G, FINO, ARR0, relieve, parcela, caminoD, CAMINOS, GRANJA, ENV_T, CAMS, AR, MONTONES, ESCALERA, SOL_G, NUBES_R, GRANJA_G, MATAS, TARJS, tapaArriba };
})();
// ---------------- API de ARRIBA ----------------
function tapaArriba(t, ST) { ARRIBA.tapaArriba(t, ST) }
const ENV_CIELO_TAPA = ARRIBA.ENV_T, CAMS_TAPA = ARRIBA.CAMS;
const TAPA_OBJS = [TAPA.G, TAPA.PAN, ARRIBA.G, ARRIBA.ESCALERA, ARRIBA.SOL_G, ARRIBA.NUBES_R.m, TAPA.SPOT, TAPA.SPOT.target];   // todo lo de esta parte que cuelga de scene
// piso de arriba (tierra, con relieve) en (x, z), con el hundimiento actual
const ARRIBA_Y = (x, z) => TAPA_Y(x, z) + LID_T + ARRIBA.relieve(x, z);
const montonesTierra = (v = true) => { TAPA.ST.montones = !!v };
const escaleraArriba = (v = true) => { TAPA.ST.escalera = !!v };
// ---------------- stubs del video viejo (la cordillera y el valle ya no existen): las escenas viejas siguen armando ----------------
const SUELO_LEJOS = (x, z) => ALT_C(x, z), nubesValle = () => { }, jironesNube = () => { }, cometaGeo = () => new THREE.BufferGeometry(), nuevaCometa = () => new THREE.Group(), cometaCola = () => { }, cometaHilo = () => { };
function lejosReset() { tapaReset() }
function lejos(t) { tapa(t) }
const ATERRIZA = [0, 0, 0], COMETAS_PIP = [0, 0, 0], MEDIA_PASTO = [0, 0, 0], VUELO_PTS = [[0, 16, -10], [10, 20, -10], [20, 24, -10]];
const CAMS_VALLE = Object.fromEntries(["aereoValle", "aterrizaPicado", "pastoPersona", "cometasPip", "haciaCordillera", "humoDerecho", "cresta", "marDeNubes"].map(k => [k, { p: [0, 6, 30], l: [0, 4, 0], f: 50 }]));
const ENV_LEJOS = ENV_CIELO_TAPA, LEJOS_G = ARRIBA.G, LEJOS_CFG = {};
window.TAPA_DBG = { TAPA, ARRIBA };

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

// ---------- caras de Roblox (calcomanía 512 × 384 sobre el frente de la cabeza)
// ---------- caras con el estilo del catálogo clásico de caras de Roblox (pedido del dueño, 25-nov-2026: mandó capturas del catálogo).
// Dibujadas por nosotros, no copiadas: trazos negros que se afinan en las puntas (como pincel), ojos de óvalo negro con un
// puntito de brillo, ojos blancos con contorno y pupila cuando hay sorpresa o risa, párpados de «chill», boca abierta bordó con
// lengua rosa y dientes blancos. Calcomanía de 512 × 384 que cubre el frente de la cabeza.
const CARAV = {};
const TINTA = "#111012", BORDO = "#6e1830", LENGUA = "#ef9cb4";
// trazo de pincel: curva (puntos de control) rellena con un ancho que crece al medio y se afina en las dos puntas
function pincel(g, pts, W, { col = TINTA } = {}) { g.save(); g.strokeStyle = col; g.lineWidth = W * 1.25; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); g.moveTo(...pts[0]);
  if (pts.length === 3) g.quadraticCurveTo(...pts[1], ...pts[2]); else g.bezierCurveTo(...pts[1], ...pts[2], ...pts[3]); g.stroke(); g.restore() }
const EX = 80, EY = 142, MY = 262;   // ojos a ±80 del centro; boca más arriba para que las bocas abiertas entren enteras
// --- ojos
const ojoNegro = (g, x, rx = 24, ry = 44, brillo = false) => { g.fillStyle = TINTA; g.beginPath(); g.ellipse(x, EY, rx, ry, 0, 0, 7); g.fill(); if (brillo) { g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(x - rx * .32, EY - ry * .42, rx * .26, ry * .2, 0, 0, 7); g.fill() } };
const ojoGota = (g, x, s) => { g.fillStyle = TINTA; g.beginPath(); g.moveTo(x - s * 4, EY - 46); g.bezierCurveTo(x + s * 34, EY - 30, x + s * 30, EY + 40, x, EY + 40); g.bezierCurveTo(x - s * 30, EY + 40, x - s * 30, EY - 20, x - s * 4, EY - 46); g.fill(); };
const ojoBlanco = (g, x, r = 40, px = 0, py = 0, rp = 15) => { g.fillStyle = "#ece6dc"; g.beginPath(); g.ellipse(x, EY, r * .86, r, 0, 0, 7); g.fill(); g.lineWidth = 9; g.strokeStyle = TINTA; g.stroke(); g.fillStyle = TINTA; g.beginPath(); g.arc(x + px, EY + py, rp, 0, 7); g.fill() };
const ojoChill = (g, x, s) => { g.fillStyle = TINTA; g.fillRect(x - 32, EY - 6, 64, 22); pincel(g, [[x - 44, EY - 8], [x, EY - 14], [x + 44, EY - 8]], 10); pincel(g, [[x - 40, EY + 24], [x, EY + 30], [x + 40, EY + 24]], 8); pincel(g, s < 0 ? [[x - 34, EY - 40], [x, EY - 62], [x + 34, EY - 40]] : [[x - 34, EY - 56], [x, EY - 36], [x + 34, EY - 56]], 12) };
const ojoArco = (g, x, arriba = true) => pincel(g, arriba ? [[x - 34, EY + 12], [x, EY - 30], [x + 34, EY + 12]] : [[x - 34, EY - 6], [x, EY + 30], [x + 34, EY - 6]], 15);
const ojoApret = (g, x, s) => pincel(g, [[x - s * 30, EY - 30], [x + s * 26, EY], [x - s * 30, EY + 30]], 14, { ini: .3, fin: .3 });
const ojoPunto = (g, x) => { g.fillStyle = TINTA; g.beginPath(); g.ellipse(x, EY, 17, 21, 0, 0, 7); g.fill() };
// --- cejas (pincel)
const ceja = (g, x, s, tipo) => { const y = EY - 66;
  if (tipo === "pena") pincel(g, [[x - s * 38, y - 4], [x + s * 6, y - 16], [x + s * 36, y + 12]], 13);
  if (tipo === "enojo") pincel(g, [[x - s * 38, y - 14], [x, y - 4], [x + s * 34, y + 18]], 15);
  if (tipo === "alta") pincel(g, [[x - 36, y - 12], [x, y - 34], [x + 36, y - 12]], 12);
  if (tipo === "duda") pincel(g, s < 0 ? [[x - 36, y - 18], [x - 4, y - 44], [x + 34, y - 26], [x + 44, y - 8]] : [[x - 36, y + 4], [x, y + 2], [x + 36, y - 2]], 13) };
// --- bocas
const bocaAbierta = (g, w = 150, h = 110, lengua = true, dientes = false, y0 = MY - 30) => { const camino = () => { g.beginPath(); g.moveTo(256 - w / 2, y0); g.lineTo(256 + w / 2, y0); g.bezierCurveTo(256 + w / 2, y0 + h * .75, 256 + w * .3, y0 + h, 256, y0 + h); g.bezierCurveTo(256 - w * .3, y0 + h, 256 - w / 2, y0 + h * .75, 256 - w / 2, y0); g.closePath() };
  camino(); g.fillStyle = BORDO; g.fill(); g.save(); g.clip(); if (lengua) { g.fillStyle = LENGUA; g.beginPath(); g.ellipse(256, y0 + h * .98, w * .3, h * .36, 0, 0, 7); g.fill() } if (dientes) { g.fillStyle = "#fff"; g.fillRect(256 - w / 2, y0, w, h * .2) } g.restore(); camino(); g.lineWidth = 11; g.strokeStyle = TINTA; g.stroke() };
const bocaO = (g, rx = 24, ry = 30) => { g.beginPath(); g.ellipse(256, MY, rx, ry, 0, 0, 7); g.fillStyle = BORDO; g.fill(); g.lineWidth = 9; g.strokeStyle = TINTA; g.stroke() };
const bocaDientes = (g, w = 130, h = 54) => { g.fillStyle = "#fff"; g.beginPath(); g.roundRect(256 - w / 2, MY - h / 2, w, h, 16); g.fill(); g.lineWidth = 9; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = 6; g.beginPath(); g.moveTo(256 - w / 2 + 4, MY); g.lineTo(256 + w / 2 - 4, MY); for (let i = 1; i < 5; i++) { const x = 256 - w / 2 + i * w / 5; g.moveTo(x, MY - h / 2 + 3); g.lineTo(x, MY + h / 2 - 3) } g.stroke() };
const bocaZig = (g, w = 150) => { g.lineWidth = 11; g.strokeStyle = TINTA; g.lineJoin = "round"; g.lineCap = "round"; g.beginPath(); for (let i = 0; i <= 6; i++) g.lineTo(256 - w / 2 + i * w / 6, MY + (i % 2 ? -14 : 12)); g.stroke() };
const bocaD = g => { g.beginPath(); g.moveTo(206, MY - 34); g.lineTo(306, MY - 34); g.bezierCurveTo(306, MY + 30, 270, MY + 46, 256, MY + 46); g.bezierCurveTo(242, MY + 46, 206, MY + 30, 206, MY - 34); g.closePath(); g.lineWidth = 15; g.strokeStyle = TINTA; g.stroke() };
// cada cara: ojos, cejas y boca
const CARAS_CAT = {
  neutral: g => { [-1, 1].forEach(s => ojoNegro(g, 256 + s * EX)); pincel(g, [[218, MY], [256, MY + 4], [296, MY - 2]], 13) },
  happy: g => { [-1, 1].forEach(s => ojoNegro(g, 256 + s * EX)); pincel(g, [[180, MY - 20], [256, MY + 50], [332, MY - 20]], 16) },
  warm: g => { [-1, 1].forEach(s => ojoNegro(g, 256 + s * EX, 22, 40)); pincel(g, [[214, MY - 12], [256, MY + 22], [298, MY - 12]], 14) },
  hopeful: g => { [-1, 1].forEach(s => { ojoNegro(g, 256 + s * EX); ceja(g, 256 + s * EX, s, "pena") }); pincel(g, [[218, MY - 8], [256, MY + 16], [294, MY - 8]], 13) },
  relieved: g => { [-1, 1].forEach(s => { ojoArco(g, 256 + s * EX); ceja(g, 256 + s * EX, s, "pena") }); pincel(g, [[204, MY - 16], [256, MY + 30], [308, MY - 16]], 15) },
  paz: g => { [-1, 1].forEach(s => ojoArco(g, 256 + s * EX)); pincel(g, [[214, MY - 10], [256, MY + 22], [298, MY - 10]], 14) },
  laugh: g => { [-1, 1].forEach(s => ojoBlanco(g, 256 + s * EX, 40, 6, -14)); bocaAbierta(g, 170, 120) },
  excited: g => { [-1, 1].forEach(s => ojoBlanco(g, 256 + s * EX, 42, 0, -4, 17)); bocaAbierta(g, 160, 110, true, true) },
  starstruck: g => { [-1, 1].forEach(s => ojoBlanco(g, 256 + s * EX, 42, 0, 0, 20)); bocaAbierta(g, 160, 110, true, true) },
  sad: g => { [-1, 1].forEach(s => { ojoGota(g, 256 + s * EX, s); ceja(g, 256 + s * EX, s, "pena") }); pincel(g, [[206, MY + 18], [232, MY - 6], [270, MY - 14], [306, MY + 14]], 13) },
  worried: g => { [-1, 1].forEach(s => { ojoGota(g, 256 + s * EX, s); ceja(g, 256 + s * EX, s, "pena") }); pincel(g, [[214, MY + 8], [240, MY - 4], [268, MY + 6], [298, MY - 2]], 12) },
  pleading: g => { [-1, 1].forEach(s => { ojoNegro(g, 256 + s * EX, 28, 48); ceja(g, 256 + s * EX, s, "pena") }); pincel(g, [[220, MY + 12], [256, MY - 10], [292, MY + 12]], 12) },
  gloomy: g => { [-1, 1].forEach(s => ojoChill(g, 256 + s * EX, s)); pincel(g, [[220, MY + 6], [256, MY - 2], [292, MY + 8]], 12) },
  squint: g => { [-1, 1].forEach(s => ojoChill(g, 256 + s * EX, s)); pincel(g, [[214, MY], [256, MY + 2], [298, MY - 2]], 13) },
  suspicious: g => { [-1, 1].forEach(s => ojoChill(g, 256 + s * EX, s)); pincel(g, [[214, MY + 2], [262, MY - 8], [300, MY - 2]], 13); pincel(g, [[282, MY + 6], [292, MY + 14], [298, MY + 6]], 6) },
  determined: g => { [-1, 1].forEach(s => { ojoNegro(g, 256 + s * EX, 22, 40); ceja(g, 256 + s * EX, s, s < 0 ? "duda" : "enojo") }); pincel(g, [[214, MY + 4], [262, MY + 10], [302, MY - 12]], 13) },
  brave: g => { [-1, 1].forEach(s => { ojoNegro(g, 256 + s * EX, 22, 40); ceja(g, 256 + s * EX, s, "duda") }); pincel(g, [[206, MY - 4], [252, MY + 28], [304, MY - 18]], 14) },
  angry: g => { [-1, 1].forEach(s => { ojoNegro(g, 256 + s * EX, 22, 38); ceja(g, 256 + s * EX, s, "enojo") }); bocaDientes(g) },
  grito: g => { [-1, 1].forEach(s => { ojoNegro(g, 256 + s * EX, 20, 36); ceja(g, 256 + s * EX, s, "enojo") }); bocaAbierta(g, 150, 120, true, true) },
  scared: g => { [-1, 1].forEach(s => { ojoBlanco(g, 256 + s * EX, 38, 0, 6, 12); ceja(g, 256 + s * EX, s, "pena") }); bocaZig(g) },
  terrified: g => { [-1, 1].forEach(s => { ojoBlanco(g, 256 + s * EX, 42, 0, 0, 10); ceja(g, 256 + s * EX, s, "pena") }); bocaAbierta(g, 120, 120, false, true) },
  horrified: g => { [-1, 1].forEach(s => { ojoBlanco(g, 256 + s * EX, 44, 0, 0, 9); ceja(g, 256 + s * EX, s, "alta") }); bocaZig(g, 170) },
  panic: g => { [-1, 1].forEach(s => { ojoBlanco(g, 256 + s * EX, 42, s * -6, 0, 11); ceja(g, 256 + s * EX, s, "pena") }); bocaAbierta(g, 130, 110, true, true) },
  shock: g => { [-1, 1].forEach(s => { ojoBlanco(g, 256 + s * EX, 42, 0, 0, 12); ceja(g, 256 + s * EX, s, "alta") }); bocaO(g) },
  gasp: g => { [-1, 1].forEach(s => { ojoBlanco(g, 256 + s * EX, 40, 0, 2, 13); ceja(g, 256 + s * EX, s, "alta") }); bocaO(g, 20, 26) },
  curious: g => { [-1, 1].forEach(s => { ojoNegro(g, 256 + s * EX); ceja(g, 256 + s * EX, s, "duda") }); bocaO(g, 14, 16) },
  listen: g => { [-1, 1].forEach(s => { ojoBlanco(g, 256 + s * EX, 40, s * 12, -4, 15); ceja(g, 256 + s * EX, s, "alta") }); bocaO(g, 13, 15) },
  susurra: g => { [-1, 1].forEach(s => { ojoNegro(g, 256 + s * EX, 22, 40); ceja(g, 256 + s * EX, s, "pena") }); bocaO(g, 11, 13) },
  sopla: g => { [-1, 1].forEach(s => ojoApret(g, 256 + s * EX, s)); bocaO(g, 22, 26) },
  cerrados: g => { [-1, 1].forEach(s => ojoArco(g, 256 + s * EX, false)); pincel(g, [[220, MY], [256, MY + 4], [292, MY - 2]], 12) },
  happyD: g => { [-1, 1].forEach(s => ojoPunto(g, 256 + s * EX * .7)); bocaD(g) },
};
// el parpadeo: los mismos rasgos con los ojos como un arco cerrado
function caraV(kind, cerr = false) { const key = kind + (cerr ? "_c" : ""); if (CARAV[key]) return CARAV[key];
  return CARAV[key] = tex(512, 384, (g, w, h) => { g.lineCap = "round"; g.lineJoin = "round"; const f0 = CARAS_CAT[kind] || CARAS_CAT.neutral, f = gg => { gg.save(); gg.translate(256, 222); gg.scale(1.15, 1.15); gg.translate(-256, -222); f0(gg); gg.restore() };
    if (!cerr) return f(g);
    // dibuja la cara en otro lienzo, borra la franja de los ojos y pone los párpados cerrados (las cejas y la boca quedan)
    const c2 = mk(512, 384), g2 = c2.getContext("2d"); g2.lineCap = "round"; g2.lineJoin = "round"; f(g2); const y0 = 222 + (EY - 222) * 1.15; g2.clearRect(0, y0 - 64, 512, 126); g.drawImage(c2, 0, 0); g.save(); g.translate(256, 222); g.scale(1.15, 1.15); g.translate(-256, -222); [-1, 1].forEach(s => ojoArco(g, 256 + s * EX, false)); g.restore() }) }
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
function volze(k, o) { const skin = o.skin; k.skin = skin; k.r6 = true; delete k.falda; delete k.pasoMax; delete k.zancMax;
  [k.body, k.armL, k.armR, k.legL, k.legR].forEach(quitarMallas); [...k.head.children].forEach(c => { if (c !== k.decal) k.head.remove(c) });
  const plast = map => new THREE.MeshStandardMaterial({ map, roughness: .62 });
  // torso 1,04 × 1,04 × .52; brazos y piernas .5 × 1,04 × .5 (la mitad del torso), pegados; bisel chico
  const t = o.torso, lado = plast(tex(64, 64, (g, w, h) => { g.fillStyle = t.chaleco ? t.chaleco[0] : t.col; g.fillRect(0, 0, w, h); if (t.faja) { g.fillStyle = t.faja[0]; g.fillRect(0, h * .77, w, h * .14) } sombra2D(g, w, h, .12) }));
  part(RB(1.04, 1.04, .52, .05), boxMats(lado, plast(torsoV(t)), plast(torsoV(t, true))), 0, 1.54, 0, k.body, 0);
  [k.armL, k.armR].forEach((a, i) => { part(RB(.5, 1.04, .5, .05), plast(brazoV({ skin, ...o.brazo })), 0, -.44, 0, a, 0); a.position.x = (i ? 1 : -1) * .77 });
  [k.legL, k.legR].forEach((l, i) => { part(RB(.5, 1.02, .5, .05), plast(piernaV({ skin, ...o.pierna })), 0, -.5, 0, l, 0); l.position.x = (i ? 1 : -1) * .26 });
  // cabeza de Roblox: bloque ancho con las aristas verticales bien redondeadas, sin cuello; la cara pegada al frente
  part(RB(.74, .66, .7, .075, 4), new THREE.MeshStandardMaterial({ color: skin, roughness: .55 }), 0, .38, 0, k.head, 0);
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

// ================= ELENCO DE «WE HOLD UP THE SKY»: personajes, utilería y animaciones (manivela, trepar, engrasar, hombros…) =================
// Va DESPUÉS de _volze_personajes.js (usa caraV, CARAS_CAT, pincel, peloV, panueloV, anteojosV, accMat, trozo, bloque, gema, estampa,
// sombra2D, ojo*, ceja, boca*). Estilo: seis bloques de plástico mate con bisel chico, ropa PINTADA (calcomanía plana: un color por prenda,
// un estampado simple, manchas y remiendos pintados), cabeza recta, caras del catálogo dibujadas por nosotros; en 3D solo pelo, gorras,
// galera, pañuelos de cabeza, barba y la utilería.
// Quién es quién (instancias del motor reutilizadas):
//   ME = el engrasador (14) · OLLIE = ME6 (8, escala .74) · KELL = GARROW (el Overseer) · HOMBRES_KELL = [QUILL, PIM, FOLK[0], FOLK[1]]
//   VECINOS = [FOLK[2..5], EXT[0..3], PESCADOR, 3 nuevos] · MADRES = [VECINOS[0], VECINOS[1]] · NOVIO = VECINOS[2] · NOVIA = VECINOS[3]
// Convenciones de las poses: todas son fn(k, t, opciones) y se llaman DESPUÉS de poner al personaje (ponerP/enAire) y de pose() del motor.
// k.g es el punto de referencia (los pies, salvo donde se dice otra cosa); el personaje mira a +z local (k.g.rotation.y lo gira).
const H_CAD = 1.02, A_BRAZO = .42, F30 = 1 / 30;
const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3(), _v4 = new THREE.Vector3(), _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _q3 = new THREE.Quaternion();
const _ABAJO = new THREE.Vector3(0, -1, 0), _mb = new THREE.Matrix4(), _ax = new THREE.Vector3(), _ay = new THREE.Vector3(), _az = new THREE.Vector3();
const _frac = x => x - Math.floor(x), _suave = q => { q = cl(q); return q * q * (3 - 2 * q) };
function caraDz(kind, cerr = false) { return caraV(kind, cerr) }   // la reasigna _volze_personajes.js: la declaración tiene que existir

// ---------- caras nuevas (mismo trazo de pincel del catálogo)
// «frio» (Kell): ojos chicos, cejas PLANAS bajas, boca fina recta · «desprecio»: una ceja alta, media sonrisa torcida
// «aguanta» (empujar la manivela) · «esfuerzo» (ojos apretados, dientes) · «wow» (asombro feliz) · «mira» (mirar arriba, boca chica)
CARAS_CAT.frio = g => { [-1, 1].forEach(s => { const x = 256 + s * EX; ojoNegro(g, x, 20, 30); pincel(g, [[x - 40, EY - 50], [x, EY - 54], [x + 40, EY - 48 + s * 4]], 12) }); pincel(g, [[222, MY + 4], [256, MY + 4], [290, MY + 4]], 9) };
CARAS_CAT.desprecio = g => { [-1, 1].forEach(s => { const x = 256 + s * EX; ojoNegro(g, x, 20, 30); pincel(g, s < 0 ? [[x - 40, EY - 50], [x, EY - 54], [x + 40, EY - 50]] : [[x - 36, EY - 62], [x, EY - 78], [x + 38, EY - 62]], 12) }); pincel(g, [[220, MY + 6], [262, MY + 2], [298, MY - 14]], 10) };
CARAS_CAT.aguanta = g => { [-1, 1].forEach(s => { ojoNegro(g, 256 + s * EX, 20, 34); ceja(g, 256 + s * EX, s, "enojo") }); bocaDientes(g, 120, 46) };
CARAS_CAT.esfuerzo = g => { [-1, 1].forEach(s => ojoApret(g, 256 + s * EX, s)); bocaDientes(g, 130, 52) };
CARAS_CAT.wow = g => { [-1, 1].forEach(s => { const x = 256 + s * EX; ojoBlanco(g, x, 44, 0, -6, 19); g.fillStyle = "#fff"; g.beginPath(); g.arc(x - 7, EY - 13, 6, 0, 7); g.fill(); ceja(g, x, s, "alta") }); bocaAbierta(g, 118, 96, true, false) };
CARAS_CAT.mira = g => { [-1, 1].forEach(s => { ojoBlanco(g, 256 + s * EX, 40, 0, -14, 15); ceja(g, 256 + s * EX, s, "alta") }); bocaO(g, 14, 17) };
const SIN_PARPADEO = new Set(["relieved", "paz", "cerrados", "sopla", "esfuerzo", "happyD"]);
// UN parpadeo de 4 cuadros (a 30 fps) cada 1,2–1,6 s, desfasado por personaje
function parpadeo(k, t) { const T = 1.2 + .4 * _frac(k.idx * .618 + .31), ph = (t + T * _frac(k.idx * .377 + .15)) % T;
  if (ph < 4 * F30 && k.cara && !SIN_PARPADEO.has(k.cara)) { const m = caraV(k.cara, true); if (k.decal.material.map !== m) { k.decal.material.map = m; k.decal.material.needsUpdate = true } return true } return false }

// ---------- ROPA PINTADA de calle pobre (mameluco, levita, chalecos, vestidos gastados): texturas planas con sombreado suave
const ROPAC = {};
// manchas de grasa: gotas negras irregulares con un brillo chico (sembradas: siempre las mismas)
function manchasG(g, w, h, n, seed, y0 = 0) { const r = rng(seed); for (let i = 0; i < n; i++) { const x = r() * w, y = y0 + r() * (h - y0), R = 8 + r() * 16; g.fillStyle = "rgba(22,18,14,.86)"; g.beginPath();
    for (let j = 0; j < 9; j++) { const a = j / 9 * 6.283, rr = R * (.65 + r() * .55); g.lineTo(x + Math.cos(a) * rr * 1.7, y + Math.sin(a) * rr * .6) } g.closePath(); g.fill();
    if (r() < .6) { g.beginPath(); g.ellipse(x + R * .6, y + R * .9, R * .25, R * .5, 0, 0, 7); g.fill() } g.fillStyle = "rgba(255,255,255,.22)"; g.beginPath(); g.ellipse(x - R * .25, y - R * .25, R * .22, R * .12, -.5, 0, 7); g.fill() } }
// remiendo: un parche de otro color con puntadas
function remiendoG(g, x, y, w, h, col) { g.fillStyle = col; g.fillRect(x, y, w, h); g.fillStyle = "rgba(0,0,0,.12)"; g.fillRect(x, y + h - 6, w, 6); g.setLineDash([10, 8]); g.strokeStyle = "rgba(240,230,210,.75)"; g.lineWidth = 4; g.strokeRect(x + 7, y + 7, w - 14, h - 14); g.setLineDash([]) }
// frente/espalda del torso. o: { col, kind, alt, mameluco: [col, botón], levita: [col, chaleco, camisa, corbata], cadena: col, chaleco: [col, botón],
//   panuelo: col, cuello: col (camisa en V), botones: col, delantal: [col, borde], chal: [col, guarda], traje: [camisa, moño, flor], encaje: col, faja: [col],
//   tirantes: col, remiendos: [col, …], manchas: n, seed }
function torsoC(o, back = false) { const key = "t" + JSON.stringify(o) + back; return ROPAC[key] ||= tex(512, 512, (g, w, h) => {
  g.fillStyle = o.col; g.fillRect(0, 0, w, h); if (o.kind) estampa(g, w, h, o.kind, o.col, o.alt || "#efe6d2");
  if (o.cuello && !back) { g.fillStyle = o.cuello; g.beginPath(); g.moveTo(160, 0); g.lineTo(256, 110); g.lineTo(352, 0); g.closePath(); g.fill() }
  if (o.chaleco) { g.fillStyle = o.chaleco[0]; if (back) g.fillRect(0, 0, w, h); else { g.beginPath(); g.moveTo(0, 0); g.lineTo(196, 0); g.lineTo(256, 150); g.lineTo(256, h); g.lineTo(0, h); g.closePath(); g.fill(); g.beginPath(); g.moveTo(w, 0); g.lineTo(316, 0); g.lineTo(256, 150); g.lineTo(256, h); g.lineTo(w, h); g.closePath(); g.fill();
      g.fillStyle = "rgba(0,0,0,.3)"; g.fillRect(253, 150, 6, h - 150); if (o.chaleco[1]) { g.fillStyle = o.chaleco[1]; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(276, 200 + i * 80, 12, 0, 7); g.fill() } } } }
  if (o.levita) { const [lc, ch, cam, cor] = o.levita; g.fillStyle = lc; if (back) { g.fillRect(0, 0, w, h); g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(250, 300, 10, h - 300); for (const x of [200, 312]) { g.fillStyle = "#c9a24a"; g.beginPath(); g.arc(x, 410, 11, 0, 7); g.fill() } }
    else { g.fillStyle = ch; g.fillRect(150, 0, 212, h); g.fillStyle = cam; g.beginPath(); g.moveTo(186, 0); g.lineTo(256, 120); g.lineTo(326, 0); g.closePath(); g.fill(); g.fillStyle = cor; g.beginPath(); g.moveTo(232, 14); g.lineTo(280, 14); g.lineTo(268, 112); g.lineTo(256, 126); g.lineTo(244, 112); g.closePath(); g.fill();
      g.fillStyle = "rgba(255,255,255,.18)"; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(256, 180 + i * 78, 10, 0, 7); g.fill() }
      g.fillStyle = lc; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(256 + s * 256, 0); g.lineTo(256 + s * 66, 0); g.lineTo(256 + s * 150, 210); g.lineTo(256 + s * 106, 260); g.lineTo(256 + s * 106, h); g.lineTo(256 + s * 256, h); g.closePath(); g.fill() }
      g.fillStyle = "rgba(255,255,255,.08)"; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(256 + s * 66, 0); g.lineTo(256 + s * 150, 210); g.lineTo(256 + s * 120, 236); g.lineTo(256 + s * 96, 0); g.closePath(); g.fill() } } }
  if (o.cadena && !back) { g.strokeStyle = o.cadena; g.lineWidth = 9; g.setLineDash([12, 6]); g.beginPath(); g.moveTo(262, 260); g.quadraticCurveTo(300, 330, 352, 300); g.stroke(); g.setLineDash([]); g.fillStyle = o.cadena; g.beginPath(); g.arc(352, 300, 15, 0, 7); g.fill(); g.fillStyle = "rgba(255,255,255,.5)"; g.beginPath(); g.arc(347, 295, 5, 0, 7); g.fill() }
  if (o.mameluco) { const [mc, bot] = o.mameluco; g.fillStyle = mc; if (back) { g.fillRect(0, 300, w, h - 300); g.save(); g.lineWidth = 56; g.strokeStyle = mc; g.beginPath(); g.moveTo(110, 0); g.lineTo(400, 320); g.moveTo(402, 0); g.lineTo(112, 320); g.stroke(); g.restore() }
    else { g.fillRect(128, 170, 256, h - 170); g.fillRect(0, 320, w, h - 320); g.fillRect(126, 0, 56, 180); g.fillRect(330, 0, 56, 180); g.fillStyle = "rgba(0,0,0,.22)"; g.fillRect(0, 316, 128, 6); g.fillRect(384, 316, 128, 6);
      g.strokeStyle = "rgba(0,0,0,.3)"; g.lineWidth = 6; g.setLineDash([12, 8]); g.strokeRect(186, 220, 140, 96); g.setLineDash([]); g.fillStyle = bot || "#d6b45a"; for (const x of [154, 358]) { g.beginPath(); g.arc(x, 186, 16, 0, 7); g.fill(); g.fillStyle = "rgba(255,255,255,.45)"; g.beginPath(); g.arc(x - 4, 182, 5, 0, 7); g.fill(); g.fillStyle = bot || "#d6b45a" } } }
  if (o.tirantes) { g.fillStyle = o.tirantes; g.fillRect(130, 0, 34, h); g.fillRect(348, 0, 34, h) }
  if (o.chal) { const V = (d, lw, c) => { g.strokeStyle = c; g.lineWidth = lw; g.lineJoin = "miter"; g.beginPath(); g.moveTo(-10, 250 - d); g.lineTo(256, 470 - d); g.lineTo(522, 250 - d); g.stroke() };
    g.fillStyle = o.chal[0]; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w, 250); g.lineTo(256, 470); g.lineTo(0, 250); g.closePath(); g.fill(); if (o.chal[1]) V(40, 18, o.chal[1]) }
  if (o.traje && !back) { const [cam, mo, flor] = o.traje; g.fillStyle = cam; g.beginPath(); g.moveTo(186, 0); g.lineTo(326, 0); g.lineTo(256, 230); g.closePath(); g.fill();
    g.fillStyle = "rgba(0,0,0,.35)"; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(256 + s * 70, 0); g.lineTo(256 + s * 96, 0); g.lineTo(256 + s * 8, 250); g.lineTo(256, 236); g.closePath(); g.fill() }
    g.fillStyle = mo; g.beginPath(); g.moveTo(256, 44); g.lineTo(222, 26); g.lineTo(222, 64); g.closePath(); g.fill(); g.beginPath(); g.moveTo(256, 44); g.lineTo(290, 26); g.lineTo(290, 64); g.closePath(); g.fill(); g.fillRect(248, 36, 16, 16);
    if (flor) { for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283; g.fillStyle = "#f6f2ea"; g.beginPath(); g.arc(140 + Math.cos(a) * 15, 110 + Math.sin(a) * 15, 11, 0, 7); g.fill() } g.fillStyle = flor; g.beginPath(); g.arc(140, 110, 9, 0, 7); g.fill() } }
  if (o.delantal) { const [dc, db] = o.delantal; g.fillStyle = dc; g.fillRect(0, 226, w, 22); if (!back) { g.fillRect(150, 60, 212, 180); g.fillRect(96, 236, 320, h - 236); g.fillRect(156, 0, 18, 64); g.fillRect(338, 0, 18, 64);
      g.strokeStyle = db; g.lineWidth = 8; g.strokeRect(186, 340, 140, 80); g.fillStyle = db; g.fillRect(96, h - 30, 320, 12) } }
  if (o.encaje) { g.fillStyle = o.encaje; for (let x = 0; x < w + 32; x += 40) { g.beginPath(); g.arc(x, 0, 22, 0, Math.PI); g.fill() } }
  if (o.faja) { g.fillStyle = o.faja[0]; g.fillRect(0, h - 104, w, 54); if (o.faja[1]) { g.fillStyle = o.faja[1]; g.fillRect(0, h - 84, w, 12) } }
  if (o.panuelo) { g.fillStyle = o.panuelo; g.fillRect(96, 0, 320, 40); if (!back) { g.beginPath(); g.moveTo(150, 24); g.lineTo(256, 190); g.lineTo(362, 24); g.closePath(); g.fill(); g.fillStyle = "rgba(255,255,255,.55)"; for (const [x, y] of [[210, 60], [300, 60], [256, 120], [236, 90], [276, 90]]) { g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill() } g.fillStyle = "rgba(0,0,0,.2)"; g.fillRect(96, 36, 320, 6) } }
  if (!back && o.botones) { g.fillStyle = o.botones; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(256, 150 + k * 82, 11, 0, 7); g.fill() } }
  if (o.remiendos) o.remiendos.forEach((c, i) => back ? remiendoG(g, i ? 300 : 70, i ? 120 : 300, 120, 100, c) : remiendoG(g, i ? 70 : 340, i ? 330 : 380, 110, 96, c));
  if (o.manchas) manchasG(g, w, h, o.manchas, (o.seed || 7) + (back ? 50 : 0), 120);
  sombra2D(g, w, h, .12) }) }
const torsoLadoC = o => ROPAC["l" + JSON.stringify(o)] ||= tex(64, 64, (g, w, h) => { g.fillStyle = o.levita ? o.levita[0] : o.chaleco ? o.chaleco[0] : o.chal ? o.chal[0] : o.col; g.fillRect(0, 0, w, h);
  if (o.mameluco) { g.fillStyle = o.mameluco[0]; g.fillRect(0, h * .62, w, h * .38) } if (o.delantal) { g.fillStyle = o.delantal[0]; g.fillRect(0, 28, w, 3) } if (o.faja) { g.fillStyle = o.faja[0]; g.fillRect(0, h - 13, w, 7) } if (o.panuelo) { g.fillStyle = o.panuelo; g.fillRect(0, 0, w, 5) } sombra2D(g, w, h, .12) });
// brazo: manga hasta `manga` (0 sin manga … 1 larga), puño, rayas, brazalete (los hombres de Kell), guante, manchas, remiendo; el resto es la mano color piel
const brazoC = o => ROPAC["b" + JSON.stringify(o)] ||= tex(128, 256, (g, w, h) => { const y = h * (o.manga ?? .82); g.fillStyle = o.skin; g.fillRect(0, 0, w, h); g.fillStyle = o.col; g.fillRect(0, 0, w, y);
  if (o.rayas) { g.fillStyle = o.rayas; for (let yy = 34; yy < y - 34; yy += 54) g.fillRect(0, yy, w, 16) } if (o.puno) { g.fillStyle = o.puno; g.fillRect(0, y - 26, w, 20) }
  if (o.brazalete) { g.fillStyle = o.brazalete; g.fillRect(0, 40, w, 34); g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(0, 44, w, 4) }
  if (o.remiendo) remiendoG(g, 18, h * .3, 92, 60, o.remiendo);
  if (o.manchas) manchasG(g, w, y, o.manchas, o.seed || 3);
  g.fillStyle = "rgba(0,0,0,.16)"; g.fillRect(0, y, w, 4);
  if (o.guante) { const yg = h * (o.guanteDesde ?? .76); g.fillStyle = o.guante; g.fillRect(0, yg, w, h - yg); g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(0, yg + 6, w, 7); g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(0, yg, w, 5) }
  sombra2D(g, w, h, .1) });
// pierna: pantalón hasta `largo` (debajo, media o piel), pollera/levita pintada arriba hasta `falda`; zapato = franja oscura abajo
const piernaC = o => ROPAC["p" + JSON.stringify(o)] ||= tex(128, 256, (g, w, h) => { const L = h * (o.largo ?? .87);
  g.fillStyle = o.media || o.skin; g.fillRect(0, 0, w, h); g.fillStyle = o.col; g.fillRect(0, 0, w, L);
  if (o.rayado) { g.fillStyle = o.rayado; for (let x = 10; x < w; x += 26) g.fillRect(x, 0, 6, L) }
  if (!o.falda) { g.fillStyle = "rgba(0,0,0,.1)"; g.fillRect(w / 2 - 2, 0, 4, L * .9) }
  if (o.remiendo) remiendoG(g, 20, h * .42, 86, 56, o.remiendo);
  if (o.manchas) manchasG(g, w, L, o.manchas, o.seed || 5, 20);
  if (o.falda) { const yf = h * o.falda; g.fillStyle = o.faldaCol || o.col; g.fillRect(0, 0, w, yf); if (o.ruedo) { g.fillStyle = o.ruedo; g.fillRect(0, yf - 24, w, 14) } if (o.remiendoF) remiendoG(g, 24, yf * .35, 80, 50, o.remiendoF); g.fillStyle = "rgba(0,0,0,.2)"; g.fillRect(0, yf, w, 5) }
  if (L < h * .86) { g.fillStyle = "rgba(0,0,0,.2)"; g.fillRect(0, L, w, 4) }
  const zb = h * (1 - (o.cana ?? .13)); g.fillStyle = o.zapato || "#2a2220"; g.fillRect(0, zb, w, h - zb); g.fillStyle = "rgba(255,255,255,.12)"; g.fillRect(0, zb, w, 4); sombra2D(g, w, h, .1) });

// ---------- accesorios de cabeza (pocos polígonos, color liso)
// gorra de tela (el engrasador): copa abullonada de 8 lados un poco caída hacia adelante, botón arriba, visera corta
function gorraTela(h, col) { const m = accMat(col), md = accMat(oscV(col, .78));
  const c = part(new THREE.CylinderGeometry(.47, .44, .2, 8), m, 0, .79, .03, h, 0); c.userData.pelo = 1; c.rotation.x = .16; c.scale.z = 1.08;
  const t = part(new THREE.CylinderGeometry(.42, .49, .1, 8), m, 0, .92, .07, h, 0); t.userData.pelo = 1; t.rotation.x = .16; t.scale.z = 1.1;
  gema(h, md, .06, 0, .99, .08); bloque(h, md, .6, .05, .28, 0, .72, .47, .26) }
// gorra plana (los capataces): igual pero más chata, sin botón
function gorraChata(h, col) { const m = accMat(col), md = accMat(oscV(col, .8)); const c = part(new THREE.CylinderGeometry(.46, .48, .16, 8), m, 0, .78, .02, h, 0); c.userData.pelo = 1; c.rotation.x = .1;
  const t = part(new THREE.CylinderGeometry(.36, .46, .06, 8), m, 0, .88, .03, h, 0); t.userData.pelo = 1; t.rotation.x = .1; bloque(h, md, .62, .05, .26, 0, .71, .45, .22) }
// la galera de Kell: copa alta negra con cinta bordó y ala curvada apenas
function galera(h, col = "#17161a", cinta = "#6e1e2a") { const m = accMat(col, { roughness: .35 }); const G = new THREE.Group(); G.position.set(0, .7, -.02); G.rotation.x = -.06; h.add(G);
  part(new THREE.CylinderGeometry(.56, .56, .04, 12), m, 0, 0, 0, G, 0).scale.z = .86; part(new THREE.CylinderGeometry(.36, .34, .62, 12), m, 0, .33, 0, G, 0); part(new THREE.CylinderGeometry(.37, .37, .12, 12), accMat(cinta), 0, .09, 0, G, 0); part(new THREE.CylinderGeometry(.365, .365, .02, 12), accMat("#2a282e", { roughness: .3 }), 0, .64, 0, G, 0);
  G.traverse(o => o.userData.pelo = 1) }
// pelo revuelto (Ollie): casquete facetado y mechones gruesos en punta que salen para todos lados
function peloRev(h, col) { const m = accMat(col), md = accMat(oscV(col, .76)); gema(h, m, .5, 0, .66, -.03, .88, .42, .84, 1); bloque(h, md, .8, .44, .16, 0, .5, -.35); for (const s of [-1, 1]) bloque(h, md, .1, .3, .5, s * .39, .58, -.06);
  const r = rng(4242); for (let i = 0; i < 13; i++) { const a = i / 13 * 6.283 + r() * .3, rr = .16 + r() * .2, x = Math.sin(a) * rr, z = Math.cos(a) * rr * .9 - .04, L = .2 + r() * .14;
    trozo(h, i % 3 ? m : md, [x, .78, z], [x * 1.9 + (r() - .5) * .2, .82 + L * (.6 + r() * .6), z * 1.8 + (r() - .5) * .2], .13 + r() * .03) }
  [[-.22, .06], [-.02, .02], [.18, .08]].forEach(([x, d]) => trozo(h, m, [x, .76, .18], [x + d, .58, .44], .12)) }
// gorrito de lana chico (los bebés llevan otro, de utilería)
function gorroLana(h, col, pompon = null) { const m = accMat(col), mb = accMat(oscV(col, .8)); part(new THREE.CylinderGeometry(.46, .5, .14, 8), mb, 0, .69, -.01, h, 0).userData.pelo = 1;
  part(new THREE.CylinderGeometry(.24, .46, .3, 8), m, 0, .9, -.03, h, 0).userData.pelo = 1; part(new THREE.CylinderGeometry(.25, .25, .04, 8), m, 0, 1.06, -.03, h, 0).userData.pelo = 1; if (pompon) gema(h, accMat(pompon), .13, 0, 1.13, -.03) }
function coronita(h) { const cols = ["#f6f2ea", "#f2c230", "#e08a9a"]; for (let j = 0; j < 7; j++) { const a = (j / 6 - .5) * 2.4; gema(h, accMat(cols[j % 3]), .07, Math.sin(a) * .4, .8, Math.cos(a) * .32 - .02) } }
// velo corto de la novia: una tela que cae por la espalda (sin viento: cuelga quieto)
function velo(k, col = "#ece6da") { const geo = new THREE.BoxGeometry(.68, .9, .02); geo.translate(0, -.45, -.05); const v = part(geo, new THREE.MeshStandardMaterial({ color: col, roughness: .8, transparent: true, opacity: .9, flatShading: true }), 0, .76, -.3, k.head, 0); v.rotation.x = .22; v.castShadow = false; v.userData.pelo = 1 }

// ---------- vestir: reconstruye al personaje con seis bloques + ropa pintada; pelo y sombreros FUNDIDOS en pocas mallas (una por color)
// o: { skin, torso: {…torsoC}, brazo: {…brazoC}, pierna: {…piernaC}, pelo: [estilo, col], rev: col (pelo revuelto), gorraTela: col, gorraChata: col,
//      galera: [col, cinta], gorro: [col, pompón], panuelo: [col, pelo], coronita, anteojos, barba: col, bigote: col, extra: k => {}, escala, encorvado }
const MANO_INVIS = new THREE.MeshBasicMaterial({ visible: false });
function vestirC(k, o) { const skin = o.skin; k.skin = skin; k.r6 = true; delete k.falda; delete k.pasoMax; delete k.zancMax; k.encorvado = o.encorvado || 0; k.flamea = [];
  [k.body, k.armL, k.armR, k.legL, k.legR].forEach(gr => [...gr.children].forEach(c => { if (c.isMesh || c.userData.pelo || c.userData.bota) gr.remove(c) })); [...k.head.children].forEach(c => { if (c !== k.decal) k.head.remove(c) });
  const plast = map => new THREE.MeshStandardMaterial({ map, roughness: .62 }), t = o.torso;
  part(RB(1.04, 1.04, .52, .05), boxMats(plast(torsoLadoC(t)), plast(torsoC(t)), plast(torsoC(t, true))), 0, 1.54, 0, k.body, 0);
  [k.armL, k.armR].forEach((a, i) => { part(RB(.5, 1.04, .5, .05), plast(brazoC({ skin, ...o.brazo, seed: (o.brazo.seed || 3) + i })), 0, -.44, 0, a, 0); a.position.x = (i ? 1 : -1) * .77;
    const hd = i ? k.handR : k.handL; a.add(hd); hd.position.set(0, -.86, 0); hd.rotation.set(0, 0, 0); hd.material = MANO_INVIS; hd.castShadow = hd.receiveShadow = false });   // la mano: ancla invisible para la utilería
  [k.legL, k.legR].forEach((l, i) => { part(RB(.5, 1.02, .5, .05), plast(piernaC({ skin, ...o.pierna, seed: (o.pierna.seed || 5) + i })), 0, -.5, 0, l, 0); l.position.x = (i ? 1 : -1) * .26 });
  part(RB(.74, .66, .7, .075, 4), new THREE.MeshStandardMaterial({ color: skin, roughness: .55 }), 0, .38, 0, k.head, 0);
  k.decal.geometry = new THREE.PlaneGeometry(.74, .555); k.decal.position.set(0, .4, .3515); k.decal.material.transparent = true; k.decal.material.needsUpdate = true;
  const tmp = new THREE.Group(); if (o.pelo) peloV(tmp, ...o.pelo); if (o.rev) peloRev(tmp, o.rev); if (o.gorraTela) gorraTela(tmp, o.gorraTela); if (o.gorraChata) gorraChata(tmp, o.gorraChata);
  if (o.galera) galera(tmp, ...o.galera); if (o.gorro) gorroLana(tmp, ...o.gorro); if (o.panuelo) panueloV({ head: tmp }, ...o.panuelo); if (o.coronita) coronita(tmp);
  tmp.updateMatrixWorld(true); const porCol = new Map(); tmp.traverse(m => { if (!m.isMesh) return; const key = m.material.color.getHexString() + (m.material.roughness) + (m.material.side || 0); if (!porCol.has(key)) porCol.set(key, [m.material, []]); porCol.get(key)[1].push([m.geometry, m.matrixWorld.clone()]) });
  k.peloG = new THREE.Group(); k.head.add(k.peloG); porCol.forEach(([mat, list]) => { const me = part(mergeG(list), mat, 0, 0, 0, k.peloG, 0); me.userData.pelo = 1 });
  if (o.anteojos) anteojosV(k); if (o.barba) barbaV(k, o.barba); if (o.bigote) { const m = accMat(o.bigote); for (const s of [-1, 1]) { bloque(k.head, m, .19, .06, .05, s * .1, .345, .37, 0, 0, s * -.15) } } if (o.extra) o.extra(k);
  k.body.scale.setScalar(o.escala || 1); k.arrugas = 0; k._arena = null; setFace(k, "neutral"); return k }

// ---------- EL ELENCO
const OLLIE = ME6, KELL = GARROW, HOMBRES_KELL = [QUILL, PIM, FOLK[0], FOLK[1]];
const VECINOS = [FOLK[2], FOLK[3], FOLK[4], FOLK[5], EXT[0], EXT[1], EXT[2], EXT[3], PESCADOR];
for (let i = 0; i < 3; i++) { const k = kid({ skin: "#d9a67c", shirt: "#7a6a5a", cloth: "plain", pants: "#3a3a3a", shoes: "#2a2420", hair: "#2b211b", style: "corto" }); TURT.add(k.g); ALL.push(k); VECINOS.push(k) }
const MADRES = [VECINOS[0], VECINOS[1]], NOVIO = VECINOS[2], NOVIA = VECINOS[3];
// colores de Kell (los repiten el brazalete de sus hombres y la cinta de la galera)
const KELL_BORDO = "#6e1e2a", KELL_NEGRO = "#1f1d24", ORO = "#d9a84a";
// el engrasador (14): silueta de TRES colores — mameluco azul con manchas de grasa, pañuelo rojo, gorra de tela marrón — y guantes de cuero
vestirC(ME, { skin: "#eebd94", torso: { col: "#d9ccb2", mameluco: ["#3f6596", "#d6b45a"], panuelo: "#c8372c", manchas: 4, seed: 11 }, brazo: { col: "#d9ccb2", manga: .46, puno: "#c4b598", guante: "#4a3222", guanteDesde: .74 },
  pierna: { col: "#3f6596", manchas: 2, remiendo: "#5a7cae", zapato: "#2c221c", cana: .14 }, pelo: ["bajo", "#3a2416"], gorraTela: "#7a5434", escala: .9 });
// Ollie (8): saco amarillo fuerte con botones, pantalón corto marrón con medias, pelo negro revuelto
vestirC(OLLIE, { skin: "#f2c9a4", torso: { col: "#f2b21c", botones: "#7a4a1a", cuello: "#fff4dc" }, brazo: { col: "#f2b21c", manga: .8, puno: "#d8901a" }, pierna: { col: "#6a4a32", largo: .5, media: "#efe6d2", zapato: "#3a2618" }, rev: "#2a1e18", escala: .74 });
// Kell, el Overseer: levita larga casi negra, chaleco bordó con cadena de reloj dorada, camisa blanca, galera; alto y derecho; cara fría
vestirC(KELL, { skin: "#ecccb4", torso: { col: KELL_NEGRO, levita: [KELL_NEGRO, KELL_BORDO, "#f4f0e6", "#2a2830"], cadena: ORO }, brazo: { col: KELL_NEGRO, manga: .88, puno: "#f4f0e6" },
  pierna: { col: "#46444c", rayado: "#5a5862", falda: .52, faldaCol: KELL_NEGRO, zapato: "#121114" }, pelo: ["bajo", "#8a8680"], galera: [KELL_NEGRO, KELL_BORDO], bigote: "#8a8680", escala: 1.1 });
// los hombres de Kell: chaleco pardo con botones de bronce, brazalete bordó, gorra chata; uno con barba, uno grandote
const HK = (k, o) => vestirC(k, { ...o, torso: { chaleco: ["#5a4a30", "#c9a04a"], ...o.torso }, brazo: { brazalete: KELL_BORDO, manga: .84, ...o.brazo }, pierna: { zapato: "#231c18", ...o.pierna } });
HK(HOMBRES_KELL[0], { skin: "#c48a62", torso: { col: "#b8aa8c" }, brazo: { col: "#b8aa8c" }, pierna: { col: "#3e3a36" }, pelo: ["bajo", "#2a201a"], gorraChata: "#4a4038", barba: "#2a201a", escala: 1.04 });
HK(HOMBRES_KELL[1], { skin: "#e2b08a", torso: { col: "#8a9078", kind: "rayas", alt: "#7a8068" }, brazo: { col: "#8a9078", manga: .5 }, pierna: { col: "#4a4038" }, pelo: ["bajo", "#6a4a2a"], gorraChata: "#3a3a40" });
HK(HOMBRES_KELL[2], { skin: "#a86c48", torso: { col: "#c9b99a" }, brazo: { col: "#c9b99a" }, pierna: { col: "#3a3a44" }, pelo: ["bajo", "#1d1a17"], gorraChata: "#5a4a3a", escala: 1.12 });
HK(HOMBRES_KELL[3], { skin: "#d9a67c", torso: { col: "#9a8a6a", kind: "franjas", alt: "#8a7a5c" }, brazo: { col: "#9a8a6a" }, pierna: { col: "#44403a" }, pelo: ["bajo", "#b06a32"], gorraChata: "#4a4038", bigote: "#8a4a22" });
// vecinos: ropa gastada de colores apagados, remiendos y un estampado cada uno
const VV = VECINOS;
vestirC(VV[0], { skin: "#d9a07a", torso: { col: "#7a5a6a", kind: "rombos", alt: "#8a6a7a", remiendos: ["#9a8a6a"] }, brazo: { col: "#7a5a6a", manga: .82 }, pierna: { col: "#4a4248", falda: .86, faldaCol: "#5a5058", ruedo: "#7a5a6a", zapato: "#2a2220" }, panuelo: ["#8a6a4a", "#3a2418"] });   // madre 1
vestirC(VV[1], { skin: "#a86c48", torso: { col: "#5f6e7a", delantal: ["#cfc3a6", "#8a7a5a"] }, brazo: { col: "#5f6e7a", manga: .6 }, pierna: { col: "#3a3a40", falda: .86, faldaCol: "#4f5a64", ruedo: "#cfc3a6", remiendoF: "#7a6a52", zapato: "#2a2220" }, pelo: ["rodete", "#1d1a17"] });   // madre 2
vestirC(VV[2], { skin: "#c48a62", torso: { col: "#3e3c44", traje: ["#ece6d8", "#7a2a34", "#f2c230"], remiendos: ["#4e4a52"] }, brazo: { col: "#3e3c44", manga: .86, puno: "#ece6d8", remiendo: "#4e4a52" }, pierna: { col: "#38363e", zapato: "#1e1a18" }, pelo: ["corto", "#241c18"] });   // novio (traje prestado)
vestirC(VV[3], { skin: "#f0c7a4", torso: { col: "#e2d8c4", encaje: "#f2ece0", faja: ["#c09048"] }, brazo: { col: "#e2d8c4", manga: .5 }, pierna: { col: "#e2d8c4", falda: .9, faldaCol: "#e2d8c4", ruedo: "#c9a256", zapato: "#8a6a4a" }, pelo: ["rodete", "#6b4430"], coronita: 1, extra: k => velo(k) });   // novia
vestirC(VV[4], { skin: "#d9b08c", torso: { col: "#6a5a44", chaleco: ["#4a3e30"], remiendos: ["#8a7a5a", "#5a4a3a"] }, brazo: { col: "#8a8070", manga: .84, remiendo: "#6a6050" }, pierna: { col: "#4a443e", remiendo: "#6a5e50" }, pelo: ["bajo", "#d8d4cc"], gorraChata: "#5a5048", barba: "#dedad1", encorvado: .2 });   // viejo
vestirC(VV[5], { skin: "#e6c0a0", torso: { col: "#3a3640", chal: ["#7a7064", "#a89878"] }, brazo: { col: "#7a7064", manga: .84 }, pierna: { col: "#3a3640", falda: .88, faldaCol: "#3a3640", ruedo: "#7a7064", zapato: "#2a2220" }, panuelo: ["#5a3a4a", "#d8d4cc"], anteojos: 1, encorvado: .16 });   // vieja
vestirC(VV[6], { skin: "#f2cfae", torso: { col: "#5a7a6a", kind: "franjas", alt: "#4a6a5a", remiendos: ["#a8956a"] }, brazo: { col: "#5a7a6a", manga: .42 }, pierna: { col: "#5a4a3c", largo: .55, media: "#d8ccb4", zapato: "#3a2a20" }, pelo: ["puntas", "#c9a060"], escala: .76 });   // chico
vestirC(VV[7], { skin: "#c98e64", torso: { col: "#8a5a5a", kind: "lunares", alt: "#9a6a6a" }, brazo: { col: "#8a5a5a", manga: .4 }, pierna: { col: "#4a3e46", falda: .4, faldaCol: "#8a5a5a", ruedo: "#cfc3a6", largo: .58, media: "#d8ccb4", zapato: "#3a2a20" }, pelo: ["rulos", "#2b1d16"], escala: .72 });   // chica
vestirC(VV[8], { skin: "#a86c48", torso: { col: "#6a6a5a", tirantes: "#3a3028", remiendos: ["#8a7a5c"] }, brazo: { col: "#6a6a5a", manga: .5 }, pierna: { col: "#4a4038", remiendo: "#6a5a48" }, pelo: ["corto", "#1d1a17"], gorraChata: "#6a5a48" });
vestirC(VV[9], { skin: "#e2b48e", torso: { col: "#8a7a5a", kind: "rayas", alt: "#7a6a4c" }, brazo: { col: "#8a7a5a", manga: .82 }, pierna: { col: "#5a5048", falda: .82, faldaCol: "#6a5a4a", ruedo: "#8a7a5a", zapato: "#2a2220" }, pelo: ["largo", "#5a3a22"] });
vestirC(VV[10], { skin: "#9a6444", torso: { col: "#5a5446", delantal: ["#a89a80", "#5a4a3a"] }, brazo: { col: "#5a5446", manga: .82, remiendo: "#7a705a" }, pierna: { col: "#3a3a36" }, pelo: ["bajo", "#1d1a17"], barba: "#1d1a17" });
vestirC(VV[11], { skin: "#d9a67c", torso: { col: "#6a5a7a", kind: "zigzag", alt: "#5a4a6a" }, brazo: { col: "#6a5a7a", manga: .42 }, pierna: { col: "#4a4038", largo: .6, media: "#cfc3a6", zapato: "#2a2220" }, gorro: ["#8a3a2e", null], pelo: ["bajo", "#3a2416"], escala: .82 });   // muchacho
// los que no están en el elenco nuevo: escondidos para siempre (no hay: todas las instancias del motor se usan)
const ELENCO_V = [ME, OLLIE, KELL, ...HOMBRES_KELL, ...VECINOS];
const ELENCO_N = { ME, OLLIE, KELL, ...Object.fromEntries(HOMBRES_KELL.map((k, i) => ["HK" + i, k])), ...Object.fromEntries(VECINOS.map((k, i) => ["V" + i, k])) };
ALL.forEach((k, i) => { k.idx = i; setFace(k, "neutral") });
function vientoPelo() { }   // (legado del video del viento: acá no sopla; queda para que lo viejo siga armando)

// ---------- helpers de pose (cuerpo entero con cuaterniones; brazos que apuntan a un punto del mundo)
// qMundo(k, arriba, frente): orientación del body (en coords de k.g) para que su cabeza apunte a `arriba` y su pecho a `frente` (vectores del MUNDO)
function qMundo(k, arriba, frente, out = new THREE.Quaternion()) { _ay.set(...arriba).normalize(); _az.set(...frente); _az.addScaledVector(_ay, -_az.dot(_ay)); if (_az.lengthSq() < 1e-6) _az.set(1, 0, 0).addScaledVector(_ay, -_ay.x);
  _az.normalize(); _ax.crossVectors(_ay, _az); _mb.makeBasis(_ax, _ay, _az); out.setFromRotationMatrix(_mb); k.g.updateWorldMatrix(true, false); k.g.getWorldQuaternion(_q2); return out.premultiply(_q2.invert()) }
// cuerpoQ(k, q, pivL, pivG): el body toma la orientación q y el punto pivL (coords del body, sin escala) queda en pivG (coords de k.g)
function cuerpoQ(k, q, pivL, pivG) { const b = k.body, s = b.scale.y; b.quaternion.copy(q); _v3.set(...pivL).multiplyScalar(s).applyQuaternion(q); b.position.set(pivG[0] - _v3.x, pivG[1] - _v3.y, pivG[2] - _v3.z) }
// apuntar(k, miembro, p): el brazo/pierna apunta con su punta al punto p del MUNDO (Vector3)
function apuntar(k, m, p) { k.g.updateMatrixWorld(true); _v1.copy(p); m.parent.worldToLocal(_v1); _v1.sub(m.position); if (_v1.lengthSq() < 1e-8) return; m.quaternion.setFromUnitVectors(_ABAJO, _v1.normalize()) }
// punto de k.g (coords locales de los pies, en metros) → mundo
const gW = (k, x, y, z, out = new THREE.Vector3()) => { k.g.updateMatrixWorld(true); return k.g.localToWorld(out.set(x, y, z)) };
// mezclaPoses(k, fA, fB, u): arma la pose A, después la B, y deja la mezcla (u = 0 → A, 1 → B). Sirve para transiciones.
const _MIEM = k => [k.armL, k.armR, k.legL, k.legR, k.head];
function fotoPose(k) { return { bq: k.body.quaternion.clone(), bp: k.body.position.clone(), m: _MIEM(k).map(o => o.quaternion.clone()) } }
function mezclaPoses(k, fA, fB, u) { fA(); const A = fotoPose(k); fB(); const B = fotoPose(k); k.body.quaternion.slerpQuaternions(A.bq, B.bq, u); k.body.position.lerpVectors(A.bp, B.bp, u); _MIEM(k).forEach((o, i) => o.quaternion.slerpQuaternions(A.m[i], B.m[i], u)) }

// ================= UTILERÍA (escondida en cada cuadro: se muestra al pedirla) =================
const PROPS_C = [];
const PROP = g => { g.visible = false; g.userData.prop = 1; PROPS_C.push(g); return g };
// enMano(obj, k, mano, { off, derecho }): en la mano; derecho = queda vertical en el mundo (balde colgando) aunque el brazo esté inclinado. Llamar DESPUÉS de posar los brazos.
function enMano(obj, k, mano = "R", { off = [0, -.12, 0], derecho = false } = {}) { attach(obj, k, mano, off); if (!derecho) { obj.quaternion.identity(); return obj } const h = mano === "R" ? k.handR : k.handL;
  k.g.updateMatrixWorld(true); h.getWorldQuaternion(_q1); obj.parent === h && obj.quaternion.copy(_q1.invert()); return obj }
// enMundo(obj, pos, ry): suelta en el mundo (coords de la escena)
function enMundo(obj, pos, ry = 0, rx = 0, rz = 0) { if (obj.parent !== scene) scene.add(obj); obj.visible = true; obj.position.set(...pos); obj.rotation.set(rx, ry, rz); obj.scale.setScalar(obj.userData.esc || 1); return obj }
const EC_HIERRO = new THREE.MeshStandardMaterial({ color: "#4a4c52", roughness: .45, metalness: .55, flatShading: true }), EC_HIERRO_O = new THREE.MeshStandardMaterial({ color: "#2c2d31", roughness: .5, metalness: .5, flatShading: true });
const EC_GRASA = new THREE.MeshStandardMaterial({ color: "#0e0c0a", roughness: .12, metalness: .25 }), M_MADERA_U = new THREE.MeshStandardMaterial({ color: "#8a6238", roughness: .75, flatShading: true });
const EC_ACERO = new THREE.MeshStandardMaterial({ color: "#b8bcc2", roughness: .3, metalness: .75, flatShading: true }), EC_ORO = new THREE.MeshStandardMaterial({ color: ORO, roughness: .3, metalness: .8, flatShading: true });
// el balde de grasa: hierro remachado con dos aros, asa de alambre, grasa negra brillante adentro (con un copete) y la espátula clavada.
// Origen = la punta del asa (para colgarlo de la mano). Alto ≈ .55.
function nuevoBalde() { const G = new THREE.Group(), B = new THREE.Group(); B.position.y = -.2; G.add(B);
  const cuerpo = new THREE.CylinderGeometry(.23, .19, .36, 10, 1, true); cuerpo.translate(0, -.18, 0); part(cuerpo, new THREE.MeshStandardMaterial({ color: "#4a4c52", roughness: .45, metalness: .55, flatShading: true, side: THREE.DoubleSide }), 0, 0, 0, B, 0);
  part(new THREE.CylinderGeometry(.19, .19, .02, 10), EC_HIERRO_O, 0, -.36, 0, B, 0); for (const y of [-.03, -.3]) part(new THREE.TorusGeometry(.225 - (y < -.1 ? .03 : 0), .014, 4, 10), EC_HIERRO_O, 0, y, 0, B, 0).rotation.x = Math.PI / 2;
  const gr = part(new THREE.CylinderGeometry(.215, .215, .02, 10), EC_GRASA, 0, -.05, 0, B, 0); gema(B, EC_GRASA, .11, .04, -.02, .02, 1.2, .5, 1).userData.pelo = 0;
  for (let i = 0; i < 4; i++) { const a = i / 4 * 6.283 + .4; gema(B, EC_GRASA, .045, Math.cos(a) * .22, -.06 - (i % 2) * .05, Math.sin(a) * .22, .7, 1.6, .7) }   // chorreado del borde
  const asa = part(new THREE.TorusGeometry(.22, .012, 4, 12, Math.PI), EC_HIERRO_O, 0, -.02, 0, B, 0); asa.scale.y = .9;
  const esp = new THREE.Group(); esp.position.set(-.06, -.02, -.04); esp.rotation.set(.25, 0, .3); B.add(esp); part(new THREE.BoxGeometry(.035, .26, .03), M_MADERA_U, 0, .13, 0, esp, 0); part(new THREE.BoxGeometry(.12, .14, .012), EC_ACERO, 0, -.04, 0, esp, 0); part(new THREE.BoxGeometry(.121, .07, .013), EC_GRASA, 0, -.08, 0, esp, 0);
  G.traverse(o => { if (o.isMesh) o.castShadow = true }); return G }
// baldeGrasa(k, visible, lugar): "L"/"R" = colgado de esa mano · "cinto" = colgado de la cadera derecha · "piso" = en el piso a los pies (frente-derecha).
// Sin k (null): devuelve el balde suelto para ponerlo con enMundo(b, [x, y, z]) (origen en el asa: el fondo queda .55 más abajo).
const BALDE_LIBRE = PROP(nuevoBalde());
function baldeGrasa(k, visible = true, lugar = "L") { if (!k) { BALDE_LIBRE.visible = visible; return BALDE_LIBRE } const b = k.balde ||= PROP(nuevoBalde()); b.visible = visible; if (!visible) return b;
  if (lugar === "L" || lugar === "R") return enMano(b, k, lugar, { off: [0, -.06, 0], derecho: true });
  if (lugar === "cinto") { if (b.parent !== k.body) k.body.add(b); b.position.set(.66, 1.2, .12); k.g.updateMatrixWorld(true); k.body.getWorldQuaternion(_q1); b.quaternion.copy(_q1.invert()); b.scale.setScalar(.85); return b }
  b.scale.setScalar(k.body.scale.y); const p = gW(k, .55 * k.body.scale.y, .55 * k.body.scale.y, .35); if (b.parent !== scene) scene.add(b); b.position.copy(p); b.rotation.set(0, k.g.rotation.y, 0); return b }
// el cuchillo de grasa: mango de madera con virola y hoja ancha de punta redonda, engrasada en la mitad. La hoja sigue la línea del brazo (−y de la mano).
function nuevoCuchillo() { const G = new THREE.Group(); part(RB(.07, .2, .07, .015, 1), M_MADERA_U, 0, .04, 0, G, 0); part(new THREE.CylinderGeometry(.045, .045, .04, 6), EC_ACERO, 0, -.07, 0, G, 0);
  const h = new THREE.Shape(); h.moveTo(-.06, 0); h.lineTo(.06, 0); h.lineTo(.065, -.24); h.quadraticCurveTo(.06, -.33, 0, -.35); h.quadraticCurveTo(-.06, -.33, -.065, -.24); h.closePath();
  const geo = new THREE.ExtrudeGeometry(h, { depth: .012, bevelEnabled: false }); geo.translate(0, -.09, -.006); part(geo, EC_ACERO, 0, 0, 0, G, 0);
  const sm = new THREE.Shape(); sm.moveTo(-.062, -.2); sm.lineTo(.062, -.16); sm.lineTo(.065, -.24); sm.quadraticCurveTo(.06, -.33, 0, -.35); sm.quadraticCurveTo(-.06, -.33, -.065, -.24); sm.closePath();
  const g2 = new THREE.ExtrudeGeometry(sm, { depth: .016, bevelEnabled: false }); g2.translate(0, -.09, -.008); part(g2, EC_GRASA, 0, 0, 0, G, 0); G.traverse(o => { if (o.isMesh) o.castShadow = true }); return G }
function cuchilloGrasa(k, visible = true, mano = "R") { const c = k.cuchillo ||= PROP(nuevoCuchillo()); c.visible = visible; if (visible) enMano(c, k, mano, { off: [0, -.1, 0] }); return c }
// el serrucho (hombre de Kell): mango cerrado de madera y hoja de acero con dientes; la hoja sigue el brazo
function nuevoSerrucho() { const G = new THREE.Group(); const T = tex(64, 256, (g, w, h) => { g.fillStyle = "#b8bcc2"; g.fillRect(0, 0, w, h); g.fillStyle = "#8a8e96"; g.fillRect(0, 0, 8, h); g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(20, 0, 6, h); g.fillStyle = "#6a6e76"; for (let y = 0; y < h; y += 12) { g.beginPath(); g.moveTo(w, y); g.lineTo(w - 12, y + 6); g.lineTo(w, y + 12); g.fill() } });
  part(RB(.08, .2, .12, .02, 1), M_MADERA_U, 0, .02, -.02, G, 0); part(new THREE.BoxGeometry(.01, .62, .16), new THREE.MeshStandardMaterial({ map: T, roughness: .35, metalness: .6 }), 0, -.38, .05, G, 0).rotation.x = .04; G.traverse(o => { if (o.isMesh) o.castShadow = true }); return G }
function serrucho(k, visible = true, mano = "R") { const c = k.serrucho ||= PROP(nuevoSerrucho()); c.visible = visible; if (visible) enMano(c, k, mano, { off: [0, -.12, 0] }); return c }
// la pala: mango de madera con agarradera en T y hoja de hierro; origen en la agarradera, la hoja hacia −y (≈ 1,55 de largo). Se pone ENTRE las dos manos.
function nuevaPala() { const G = new THREE.Group(); part(new THREE.CylinderGeometry(.03, .03, 1.2, 6), M_MADERA_U, 0, -.6, 0, G, 0); part(new THREE.BoxGeometry(.22, .05, .05), M_MADERA_U, 0, 0, 0, G, 0);
  const h = part(RB(.3, .36, .04, .015, 1), EC_HIERRO, 0, -1.36, .02, G, 0); h.rotation.x = .25; const ti = part(new THREE.DodecahedronGeometry(.16, 0), SMt(T_DIRT, { roughness: 1 }), 0, -1.3, .1, G, 0); ti.scale.set(1, .6, 1); G.userData.tierra = ti; G.traverse(o => { if (o.isMesh) o.castShadow = true }); return G }
function pala(k, visible = true) { const p = k.pala ||= PROP(nuevaPala()); p.visible = visible; return p }
// herramienta entre las manos: el origen va a la mano `arriba` y el −y apunta a la mano `abajo` (mundo)
function entreManos(obj, k, arriba = "L", abajo = "R") { k.g.updateMatrixWorld(true); const a = (arriba === "L" ? k.handL : k.handR).getWorldPosition(new THREE.Vector3()), b = (abajo === "L" ? k.handL : k.handR).getWorldPosition(new THREE.Vector3());
  if (obj.parent !== scene) scene.add(obj); obj.visible = true; obj.position.copy(a); obj.quaternion.setFromUnitVectors(_ABAJO, b.sub(a).normalize()); obj.scale.setScalar(k.body.scale.y); return obj }
// la carretilla: cajón de madera con tierra, rueda adelante y dos varas (origen = entre las manos, en las varas)
function nuevaCarretilla() { const G = new THREE.Group(); const T = tex(128, 64, (g, w, h) => { g.fillStyle = "#7a5634"; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(0,0,0,.25)"; for (let y = 0; y < h; y += 16) g.fillRect(0, y, w, 3) }), m = new THREE.MeshStandardMaterial({ map: T, roughness: .8 });
  const C = new THREE.Group(); C.position.set(0, -.25, .95); G.add(C); part(new THREE.BoxGeometry(.8, .05, .9), m, 0, 0, 0, C, 0); for (const s of [-1, 1]) { part(new THREE.BoxGeometry(.05, .34, .9), m, s * .4, .17, 0, C, 0); part(new THREE.BoxGeometry(.8, .34, .05), m, 0, .17, s * .45, C, 0) }
  const ti = part(new THREE.SphereGeometry(.42, 10, 6, 0, 6.283, 0, 1.4), SMt(T_DIRT, { roughness: 1 }), 0, .18, 0, C, 0); ti.scale.set(.95, .55, 1.05);
  for (const s of [-1, 1]) { const v = part(new THREE.BoxGeometry(.05, .05, 1.7), M_MADERA_U, s * .3, -.05, .65, G, 0); v.rotation.x = -.18 } const r = part(new THREE.CylinderGeometry(.22, .22, .08, 10), EC_HIERRO_O, 0, -.58, 1.45, G, 0); r.rotation.z = Math.PI / 2;
  for (const s of [-1, 1]) { const p = part(new THREE.BoxGeometry(.05, .42, .05), M_MADERA_U, s * .3, -.42, .72, G, 0) } G.traverse(o => { if (o.isMesh) o.castShadow = true }); return G }
function carretilla(k, visible = true) { const c = k.carretilla ||= PROP(nuevaCarretilla()); c.visible = visible; return c }
// el bastón de Kell: negro con puño de oro; si está en su mano, quieto/bastonQuieto lo dejan vertical y apoyado en el piso
const BASTON = PROP(new THREE.Group());
{ const v = part(new THREE.CylinderGeometry(.03, .024, 1, 7), new THREE.MeshStandardMaterial({ color: "#1a1816", roughness: .3, flatShading: true }), 0, -.5, 0, BASTON, 0); BASTON.userData.vara = new THREE.Group(); BASTON.add(BASTON.userData.vara); BASTON.userData.vara.add(v);
  gema(BASTON, EC_ORO, .06, 0, .04, 0, 1, .8, 1); part(new THREE.CylinderGeometry(.03, .03, .05, 7), EC_ORO, 0, -.04, 0, BASTON, 0); part(new THREE.CylinderGeometry(.03, .034, .05, 7), EC_ORO, 0, -.98, 0, BASTON.userData.vara, 0) }
function bastonAlPiso(k) { if (!BASTON.visible || (BASTON.parent !== k.handR && BASTON.parent !== k.handL)) return; k.g.updateMatrixWorld(true); const h = BASTON.parent; h.getWorldQuaternion(_q1); k.g.getWorldQuaternion(_q2); BASTON.quaternion.copy(_q1.invert().multiply(_q2));
  BASTON.getWorldPosition(_v1); k.g.getWorldPosition(_v2); BASTON.userData.vara.scale.y = Math.max(.2, _v1.y - _v2.y) }
function baston(k, visible = true, mano = "R") { BASTON.visible = visible; if (visible) { attach(BASTON, k, mano, [0, -.1, .06]); bastonAlPiso(k) } return BASTON }
// el bebé: atadito en una manta (cada uno de otro color), carita dormida y gorrito tejido. Origen en el centro del bulto (≈ .38 × .6).
const BEBE_COLS = [["#d8c49a", "#efe6d2", "#c9a0a0"], ["#9aa8b8", "#e6e0d2", "#e8d8b0"], ["#c9a88a", "#ece4d4", "#a8b89a"], ["#b8b0a0", "#e9e2cc", "#d0a090"], ["#a8a890", "#f0e8d8", "#b8c8d8"], ["#c8b8a8", "#ece2d0", "#e0c088"]];
function nuevoBebe(i) { const [man, raya, gorr] = BEBE_COLS[i % BEBE_COLS.length], G = new THREE.Group();
  const t = tex(128, 128, (g, w, h) => { g.fillStyle = man; g.fillRect(0, 0, w, h); g.fillStyle = raya; for (let y = 10; y < h; y += 32) g.fillRect(0, y, w, 10); if (i % 2) { g.fillStyle = "rgba(0,0,0,.12)"; g.fillRect(70, 40, 36, 30) } sombra2D(g, w, h, .1) }), m = new THREE.MeshStandardMaterial({ map: t, roughness: .75 });
  part(RB(.38, .56, .32, .07, 2), m, 0, 0, 0, G, 0); part(RB(.27, .25, .25, .03, 2), new THREE.MeshStandardMaterial({ color: ["#f0c7a4", "#c48a62", "#e2b48e"][i % 3], roughness: .55 }), 0, .38, .02, G, 0);
  const go = part(new THREE.CylinderGeometry(.13, .17, .14, 8), accMat(gorr), 0, .5, 0, G, 0); go.rotation.x = -.15; gema(G, accMat(oscV(gorr, .8)), .05, 0, .6, -.02);
  const cara = tex(256, 192, g => { g.strokeStyle = TINTA; g.lineCap = "round"; g.lineWidth = 11; for (const x of [84, 172]) { g.beginPath(); g.moveTo(x - 20, 82); g.quadraticCurveTo(x, 100, x + 20, 82); g.stroke() } g.fillStyle = BORDO; g.beginPath(); g.ellipse(128, 138, 10, 9, 0, 0, 7); g.fill() });
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(.25, .19), new THREE.MeshStandardMaterial({ map: cara, transparent: true, roughness: .8, depthWrite: false })); pl.position.set(0, .38, .148); G.add(pl);
  G.traverse(o => { if (o.isMesh && o !== pl) o.castShadow = true }); return G }
const BEBES = Array.from({ length: 6 }, (_, i) => PROP(nuevoBebe(i)));
// bebe(k, visible): el bebé de ese personaje contra el pecho (cargarBebe pone los brazos). Las dos madres tienen BEBES[0] y BEBES[1].
// bebeEn(i, pos, ry, acostado): el bebé i (0..5) suelto en el mundo (acostado = 1 lo deja de espaldas, para la casilla de la manivela)
function bebe(k, visible = true) { const i = k === MADRES[1] ? 1 : k === MADRES[0] ? 0 : 2 + (k.idx % 4), b = BEBES[i]; b.visible = visible; if (!visible) return b;
  if (b.parent !== k.body) k.body.add(b); b.position.set(-.06, 1.6, .5); b.rotation.set(.3, 0, -1.15); b.scale.setScalar(1); return b }
function bebeEn(i, pos, ry = 0, acostado = 1) { const b = BEBES[i % BEBES.length]; return enMundo(b, [pos[0], pos[1] + (acostado ? .17 : .3), pos[2]], ry, -acostado * Math.PI / 2) }
// el trigo en la mano: un manojito de espigas doradas (tallos y granos facetados). Aparece en la palma de la mano derecha.
function nuevoTrigo() { const G = new THREE.Group(), lt = [], le = [], r = rng(31);
  for (let i = 0; i < 7; i++) { const a = r() * 6.283, d = r() * .04, inc = .15 + r() * .35, x0 = Math.cos(a) * d, z0 = Math.sin(a) * d, dir = new THREE.Vector3(Math.cos(a) * Math.sin(inc), Math.cos(inc), Math.sin(a) * Math.sin(inc)), L = .16 + r() * .08;
    const tg = new THREE.CylinderGeometry(.006, .008, L, 4); tg.translate(0, L / 2, 0); lt.push([tg, MZ(new THREE.Vector3(x0, 0, z0), dir, new THREE.Vector3(1, 1, 1))]);
    const top = new THREE.Vector3(x0, 0, z0).addScaledVector(dir, L); for (let j = 0; j < 6; j++) { const eg = new THREE.OctahedronGeometry(.018, 0); eg.scale(.8, 1.6, .8); for (const s of [-1, 1]) lt.length && le.push([eg, MZ(top.clone().addScaledVector(dir, j * .022).add(new THREE.Vector3(s * .012, 0, 0)), dir.clone().add(new THREE.Vector3(s * .3, 0, 0)), new THREE.Vector3(1, 1, 1))]) } }
  part(mergeG(lt), new THREE.MeshStandardMaterial({ color: "#c9a24a", roughness: .7, flatShading: true }), 0, 0, 0, G, 0); part(mergeG(le), new THREE.MeshStandardMaterial({ color: "#e8c25a", roughness: .55, flatShading: true, emissive: "#3a2a00", emissiveIntensity: .25 }), 0, 0, 0, G, 0); return G }
function trigoMano(k, visible = true, mano = "R") { const w = k.trigo ||= PROP(nuevoTrigo()); w.visible = visible; if (visible) { attach(w, k, mano, [0, -.06, .26]); w.rotation.set(Math.PI / 2, 0, 0) } return w }
// ---------- cuerdas (hilo de los barriletes): tubo de pocas caras que se rehace cada cuadro entre puntos del mundo
const M_HILO_V = new THREE.MeshStandardMaterial({ color: "#f2eee4", roughness: .8 });
function cuerdaNueva(r, mat, TS = 18, RS = 4) { const N = (TS + 1) * (RS + 1), geo = new THREE.BufferGeometry(), idx = [];
  for (let i = 0; i < TS; i++) for (let j = 0; j < RS; j++) { const a = i * (RS + 1) + j, b = a + RS + 1; idx.push(a, b, a + 1, b, b + 1, a + 1) }
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3)); geo.setIndex(idx);
  const m = new THREE.Mesh(geo, mat); m.frustumCulled = false; PROP(m); scene.add(m);
  const P0 = new THREE.Vector3(), P1 = new THREE.Vector3(), P2 = new THREE.Vector3(), c = new THREE.Vector3(), T = new THREE.Vector3(), Nn = new THREE.Vector3(), B = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  m.poner = (a, b, d) => { P0.copy(a); P1.copy(b); P2.copy(d); const p = geo.attributes.position;
    for (let i = 0; i <= TS; i++) { const u = i / TS, v = 1 - u; c.set(0, 0, 0).addScaledVector(P0, v * v).addScaledVector(P1, 2 * u * v).addScaledVector(P2, u * u); T.set(0, 0, 0).addScaledVector(P0, -2 * v).addScaledVector(P1, 2 * v - 2 * u).addScaledVector(P2, 2 * u).normalize();
      Nn.crossVectors(T, up); if (Nn.lengthSq() < 1e-6) Nn.set(1, 0, 0); Nn.normalize(); B.crossVectors(T, Nn);
      for (let j = 0; j <= RS; j++) { const an = j / RS * 6.283, q = i * (RS + 1) + j; p.setXYZ(q, c.x + (Nn.x * Math.cos(an) + B.x * Math.sin(an)) * r, c.y + (Nn.y * Math.cos(an) + B.y * Math.sin(an)) * r, c.z + (Nn.z * Math.cos(an) + B.z * Math.sin(an)) * r) } }
    p.needsUpdate = true; geo.computeVertexNormals(); m.visible = true; return m };
  return m }
// el barrilete de la Loma: rombo de papel en cuatro colores, varillas y una cola con moños (uno por personaje, se crea la primera vez)
const BARRI_COLS = [["#f2c230", "#d63a2c"], ["#3a7ac0", "#f4efe4"], ["#5aa04a", "#f2c230"], ["#e07a2c", "#7a3a8a"], ["#d63a6a", "#f4efe4"]];
function nuevoBarrilete(i) { const [a, b] = BARRI_COLS[i % BARRI_COLS.length], G = new THREE.Group();
  const t = tex(256, 320, (g, w, h) => { const cx = 128, cy = 112; [[a, 0, 0, cx, cy], [b, cx, 0, w, cy], [b, 0, cy, cx, h], [a, cx, cy, w, h]].forEach(([c, x0, y0, x2, y2]) => { g.fillStyle = c; g.fillRect(x0, y0, x2 - x0, y2 - y0) });
    g.strokeStyle = "#5a3a22"; g.lineWidth = 7; g.beginPath(); g.moveTo(cx, 0); g.lineTo(cx, h); g.moveTo(0, cy); g.lineTo(w, cy); g.stroke() }), sh = new THREE.Shape(); sh.moveTo(0, .55); sh.lineTo(.38, .15); sh.lineTo(0, -.65); sh.lineTo(-.38, .15); sh.closePath();
  const geo = new THREE.ShapeGeometry(sh), p = geo.attributes.position, uv = geo.attributes.uv; for (let j = 0; j < p.count; j++) uv.setXY(j, (p.getX(j) + .38) / .76, (p.getY(j) + .65) / 1.2);
  part(geo, new THREE.MeshStandardMaterial({ map: t, roughness: .7, side: THREE.DoubleSide }), 0, 0, 0, G, 0); G.userData.cola = [];
  for (let j = 0; j < 5; j++) { const mo = new THREE.Group(); G.add(mo); for (const s of [-1, 1]) { const c = part(new THREE.ConeGeometry(.06, .13, 3), accMat(j % 2 ? a : b, { side: THREE.DoubleSide }), s * .06, 0, 0, mo, 0); c.rotation.z = s * Math.PI / 2; c.scale.z = .3 } G.userData.cola.push(mo) }
  G.userData.hilo = cuerdaNueva(.008, M_HILO_V, 16, 3); G.userData.colaC = cuerdaNueva(.007, M_HILO_V, 12, 3); return PROP(G) }
// barrilete(k, t, pos): pone el barrilete de k en pos (mundo), mirando a k, con la cola ondeando; devuelve el punto del hilo
function barrilete(k, t, pos) { const C = k.barri ||= nuevoBarrilete(k.idx); if (C.parent !== scene) scene.add(C); C.visible = true; C.position.set(...pos); C.lookAt(k.g.getWorldPosition(_v1)); C.rotateZ(.25 * Math.sin(t * 1.1 + k.idx) + .1); C.rotateX(-.35 + .06 * Math.sin(t * 2.1));
  C.updateMatrixWorld(true); const cola = [], base = C.localToWorld(new THREE.Vector3(0, -.65, 0)); for (let i = 1; i <= 5; i++) { const q = i / 5; cola.push(base.clone().add(_v1.set(.5 * q * Math.sin(t * 2 + i), -q * 1.3, Math.sin(t * 3 - i * 1.3) * .2 * q))) }
  C.userData.cola.forEach((mo, i) => { C.worldToLocal(mo.position.copy(cola[i])); mo.rotation.set(0, 0, Math.sin(t * 6 + i) * .4) }); C.userData.colaC.poner(base, cola[1], cola[4]); return C.localToWorld(new THREE.Vector3(0, -.05, .02)) }
function utileriaReset() { PROPS_C.forEach(o => o.visible = false) }

// ================= ANIMACIÓN (se llaman DESPUÉS de pose(); dejan al personaje listo) =================
// pose() del motor queda envuelta: limpia lo que estas funciones tocan (nada queda pegado de un cuadro al otro) y esconde la utilería una vez por cuadro.
{ const pose0 = pose; let tUlt = -1e9;
  pose = (k, t, o = {}) => { if (t !== tUlt) { tUlt = t; utileriaReset() } k._t = t; k.body.quaternion.identity(); k.body.position.set(0, 0, 0); _MIEM(k).forEach(m => m.quaternion.identity()); pose0(k, t, o) } }
// quiebre de cadera (el torso gira en la cadera y las piernas siguen rectas; sin codos ni rodillas). lean = inclinación del torso (+ adelante); psi = ángulo de las piernas
function cadera(k, lean, psi = 0) { const b = k.body, L0 = b.rotation.x, s = b.scale.y, d = lean - L0;
  b.rotation.x = lean; k.legL.rotation.x += psi - d; k.legR.rotation.x += psi - d; b.position.z -= H_CAD * s * ((Math.sin(lean) - Math.sin(L0)) - Math.sin(psi)); b.position.y -= H_CAD * s * ((Math.cos(lean) - Math.cos(L0)) - (Math.cos(psi) - 1)) }
const _fase = k => (k.idx || 0) * 1.7;
const _respira = (k, t) => .012 * Math.sin(t * 2.2 + (k.idx || 0));
// quieto(k, t, { mira }): parado derecho, brazos en «A», respira
function quieto(k, t, { mira = 0 } = {}) { const A = A_BRAZO; k._t = t;
  k.legL.rotation.set(0, 0, 0); k.legR.rotation.set(0, 0, 0); k.armL.rotation.set(0, 0, -A - _respira(k, t)); k.armR.rotation.set(0, 0, A + _respira(k, t)); k.head.rotation.set(_respira(k, t), mira, 0); k.body.rotation.set(0, 0, 0); k.body.position.set(0, 0, 0);
  if (k.encorvado) { cadera(k, k.encorvado); k.head.rotation.x = -k.encorvado * .75; k.armL.rotation.x = k.encorvado * .8; k.armR.rotation.x = k.encorvado * .8 }
  bastonAlPiso(k); parpadeo(k, t) }
// caminata: ciclo de 0,5 s; piernas ±27,5°, brazos ±7° en «A», balanceo ±5°. vel < 0 = hacia atrás
function andar(k, t, { vel = 1 } = {}) { const f = t * vel / .5 * Math.PI * 2 + _fase(k), sw = Math.sin(f), amp = k.pasoMax ?? .48, A = A_BRAZO, s = k.body.scale.y; k._t = t;
  k.body.rotation.set(0, 0, sw * .087); k.body.position.set(0, -H_CAD * s * (1 - Math.cos(amp * sw)), 0);
  k.legL.rotation.set(sw * amp, 0, 0); k.legR.rotation.set(-sw * amp, 0, 0); k.armL.rotation.set(-sw * .12, 0, -A); k.armR.rotation.set(sw * .12, 0, A); k.head.rotation.set(0, 0, -sw * .04);
  if (k.encorvado) { cadera(k, k.encorvado); k.head.rotation.x = -k.encorvado * .75 }
  bastonAlPiso(k); parpadeo(k, t) }
// corrida: ciclo de 0,5 s; torso 20° adelante; fuerte = 1: brazos que bombean
function correrV(k, t, { fuerte = 0 } = {}) { const f = t / .5 * Math.PI * 2 + _fase(k), sw = Math.sin(f), amp = k.zancMax ?? .87, A = A_BRAZO, lean = .35, s = k.body.scale.y; k._t = t;
  k.body.rotation.set(0, 0, 0); k.body.position.set(0, Math.abs(sw) * .13 * s, 0); k.legL.rotation.set(sw * amp, 0, 0); k.legR.rotation.set(-sw * amp, 0, 0); cadera(k, lean);
  const b0 = lerp(.38, -1.2, fuerte), ba = lerp(.06, .55, fuerte), bz = lerp(A * .7, .12, fuerte); k.armL.rotation.set(b0 - sw * ba, 0, -bz); k.armR.rotation.set(b0 + sw * ba, 0, bz); k.head.rotation.set(-lean * .7, 0, 0); parpadeo(k, t) }

// ---------- LA MANIVELA. manivela(k, t, { fase, fuerza }): empuja la barra caminando: inclinado ~30°, brazos al frente con las manos juntas en la barra,
// pasos cortos y pesados. fase = ciclo de pasos (1 = un paso completo de cada pie; manivelaGrupo la calcula con el arco recorrido para que los pies no patinen).
// Las manos quedan ≈ 1,2·s adelante de los pies y a ≈ 1,5·s de alto (s = escala; 1,35/1,5 para un adulto): ahí va la barra.
const MANIVELA_MANO = { adelante: 1.2, alto: 1.5 };
function manivela(k, t, { fase = t * 1.2, fuerza = 1 } = {}) { const f = fase * Math.PI * 2 + _fase(k), sw = Math.sin(f), amp = .3, s = k.body.scale.y, L = .38 + .16 * fuerza, j = fuerza * .025 * Math.sin(t * 23 + (k.idx || 0)); k._t = t;
  k.body.rotation.set(0, 0, sw * .05); k.body.position.set(0, -H_CAD * s * (1 - Math.cos(amp * sw)) - .03 * s * Math.abs(Math.cos(f)), 0);
  k.legL.rotation.set(sw * amp + .12, 0, 0); k.legR.rotation.set(-sw * amp + .12, 0, 0); cadera(k, L);
  const ax = -Math.PI / 2 - L + .2; k.armL.rotation.set(ax + j, 0, .2); k.armR.rotation.set(ax - j, 0, -.2); k.head.rotation.set(-L * .75 + .05, 0, -sw * .04); parpadeo(k, t) }
// manivelaGrupo(lista, centro, radio, ang, { brazos, t, sentido, fuerza, suelo, paso }): pone a la lista empujando los rayos de una manivela de eje vertical en
// centro = [x, z] (o [x, y, z]); el rayo 0 está en el ángulo `ang` (radianes, x = cos, z = sin); hay `brazos` rayos (por defecto uno por persona: si hay más gente que
// rayos, los que sobran van en el mismo rayo, más cerca del eje). La escena gira `ang` con el tiempo; sentido = +1 (ang crece) o −1. Cada uno camina detrás de su
// rayo mirando hacia donde avanza, con las manos en el rayo a `radio`. suelo(x, z) da la altura del piso (por defecto ALT_C).
function manivelaGrupo(lista, centro, radio, ang, { brazos = lista.length, t = 0, sentido = 1, fuerza = 1, suelo = null, paso = .75 } = {}) { const cx = centro[0], cz = centro.length > 2 ? centro[2] : centro[1], Y = suelo || ALT_C;
  lista.forEach((k, i) => { const a = ang + 6.2832 * (i % brazos) / brazos, r = radio - Math.floor(i / brazos) * 1.0, s = k.body.scale.y, re = MANIVELA_MANO.adelante * s;
    const hx = cx + Math.cos(a) * r, hz = cz + Math.sin(a) * r, dx = -Math.sin(a) * sentido, dz = Math.cos(a) * sentido, px = hx - dx * re, pz = hz - dz * re;
    k.g.visible = true; k.g.position.set(px, Y(px, pz), pz); k.g.rotation.set(0, Math.atan2(dx, dz), 0); manivela(k, t, { fase: ang * sentido * r / paso + i * .37, fuerza }) }) }

// ---------- EL POSTE. Convención: k.g a ≈ .45·s de la cara del poste, mirando al poste (+z local hacia el poste); los peldaños sobresalen ≈ .3.
// trepar(k, t, { h, vel }): trepa (brazos y piernas alternados, sube a tirones). h = cuánto subió (se suma al alto de k.g: la escena puede usar h o mover k.g).
function trepar(k, t, { h = 0, vel = 1 } = {}) { const c = t * vel * 1.1 + _fase(k) * .1, sw = Math.sin(c * Math.PI * 2), s = k.body.scale.y; k._t = t;
  k.body.rotation.set(.06, 0, sw * .05); k.body.position.set(0, h + .1 * s * (1 - Math.cos(c * Math.PI * 4)) * .5, 0);
  k.armL.rotation.set(-2.72 - .32 * sw, 0, .12); k.armR.rotation.set(-2.72 + .32 * sw, 0, -.12);
  k.legL.rotation.set(-.08 - .62 * Math.max(0, -sw), 0, -.05); k.legR.rotation.set(-.08 - .62 * Math.max(0, sw), 0, .05); k.head.rotation.set(-.32, .1 * sw, 0); parpadeo(k, t) }
// engrasar(k, t, { cuchillo, balde }): colgado de un peldaño con la izquierda, un pie en otro peldaño, untando el tornillo con la espátula (derecha, círculos)
// a la altura del pecho, ≈ .7·s adelante. Con cuchillo/balde = true (por defecto) muestra el cuchillo en la mano y el balde colgado de la cadera.
function engrasar(k, t, { cuchillo = true, balde = true } = {}) { const w = t * 5.2 + _fase(k), s = k.body.scale.y; k._t = t;
  k.body.rotation.set(-.04, .12, .03 * Math.sin(w * .5)); k.body.position.set(0, 0, 0);
  k.armL.rotation.set(-2.92, 0, .18); k.armR.rotation.set(-1.42 + .17 * Math.sin(w), 0, -.12 + .12 * Math.cos(w));
  k.legL.rotation.set(-.42, 0, -.06); k.legR.rotation.set(.12 + .05 * Math.sin(t * 1.3), 0, .1); k.head.rotation.set(.18, -.1, 0);
  if (cuchillo) cuchilloGrasa(k, true, "R"); if (balde) baldeGrasa(k, true, "cinto"); parpadeo(k, t) }
// cortarArriba(k, t, u): arriba del poste, la izquierda agarrada al peldaño de arriba y la derecha CLAVANDO el cuchillo en la tapa (golpes secos ~2 por s).
// u: 0 = las dos manos agarradas, 1 = golpeando. Mira arriba. Muestra el cuchillo.
function cortarArriba(k, t, u = 1, { cuchillo = true } = {}) { const q = _frac(t * 2.1 + .3), g = q < .22 ? _suave(q / .22) : 1 - _suave((q - .22) / .78), s = k.body.scale.y; k._t = t;
  k.body.rotation.set(-.08 - .04 * g * u, 0, .04 * g * u); k.body.position.set(0, -.03 * s * g * u, 0);
  k.armL.rotation.set(-2.85, 0, .16); k.armR.rotation.set(lerp(-2.85, lerp(-2.25, -3.08, g), u), 0, lerp(-.16, -.05, u));
  k.legL.rotation.set(-.46, 0, -.06); k.legR.rotation.set(-.06, 0, .06); k.head.rotation.set(-.55 + .06 * g * u, 0, 0);
  if (cuchillo) cuchilloGrasa(k, true, "R"); if (u > .5 && q < .08) TEMBLOR_GOLPE = .5; parpadeo(k, t) }
let TEMBLOR_GOLPE = 0;   // (las escenas pueden leerlo para sacudir la cámara en cada golpe; se pone en .5 en el cuadro del golpe)
// cabezaAfuera(k, t, u, { grosor }): asoma la cabeza por un agujero de arriba. k.g = el CENTRO DEL AGUJERO a la altura de la cara de ARRIBA de la tapa.
// u = 0: está todo abajo (la cabeza justo debajo de la cara de abajo, `grosor` más abajo); u = 1: cabeza y hombros afuera, los brazos levantados apoyados en el borde.
function cabezaAfuera(k, t, u = 1, { grosor = (typeof LID_T !== "undefined" ? LID_T + .4 : 1.7), mira = 0 } = {}) { const s = k.body.scale.y, e = _suave(u); k._t = t;
  const yTop = lerp(-grosor - .06, .16, e) - 2.06 * s; k.body.rotation.set(0, 0, 0); k.body.position.set(0, yTop, 0);
  const ab = _suave((u - .55) / .45); k.armL.rotation.set(lerp(-3.05, -.35, ab), 0, lerp(.12, -1.62, ab)); k.armR.rotation.set(lerp(-3.05, -.35, ab), 0, lerp(-.12, 1.62, ab));
  k.legL.rotation.set(0, 0, 0); k.legR.rotation.set(.1, 0, 0); k.head.rotation.set(lerp(-.4, .02, e), mira + .25 * Math.sin(t * .7) * ab, 0); parpadeo(k, t) }

// ---------- OLLIE EN LOS HOMBROS. hombros(k, chico, t, { senala, andar }): el chico sentado sobre los hombros de k (detrás de la cabeza, piernas abiertas que
// bajan por delante de los hombros a los lados del cuello), k le sostiene las canillas. senala 0→1: el chico levanta el brazo derecho y señala derecho arriba.
// Llamar después de poner a k (ponerP); k queda quieto (o caminando con andar = 1). El chico se pone solo (no hace falta ponerlo).
function hombros(k, chico, t, { senala = 0, andar: an = 0, mira = 0 } = {}) { if (an) andar(k, t, { vel: .8 }); else quieto(k, t);
  k.armL.rotation.set(0, 0, 0); k.armR.rotation.set(0, 0, 0); k.head.rotation.x = -.04; const c = chico, sc = c.body.scale.y; c._t = t; c.g.visible = true;
  // la cadera del chico: arriba de los hombros de k, detrás de la cabeza (coords del body de k, sin escala)
  k.g.updateMatrixWorld(true); const P = k.body.localToWorld(new THREE.Vector3(0, 2.5, -.6)); c.g.parent.worldToLocal(P); c.g.position.copy(P);
  k.body.getWorldQuaternion(_q1); c.g.parent.getWorldQuaternion(_q2); c.g.quaternion.copy(_q2.invert().multiply(_q1)); c.g.rotation.setFromQuaternion(c.g.quaternion);
  const bob = .03 * Math.sin(t * 2.6 + .5); c.body.quaternion.identity(); c.body.rotation.set(.12 + bob, 0, .03 * Math.sin(t * 1.7)); c.body.position.set(0, -H_CAD * sc, 0); _v1.set(0, H_CAD * sc, 0).applyEuler(c.body.rotation); c.body.position.set(-_v1.x, -_v1.y + .0, -_v1.z);
  const pat = .08 * Math.sin(t * 3.1); c.legL.rotation.set(-.45 + pat, 0, -1.3); c.legR.rotation.set(-.45 - pat, 0, 1.3);
  // manos en la gorra de k (izquierda siempre; derecha hasta que señala)
  c.armL.rotation.set(-1.3, 0, .12); const sn = _suave(senala); c.armR.rotation.set(lerp(-1.3, -3.05, sn), 0, lerp(-.12, -.1, sn)); c.head.rotation.set(lerp(.05, -.42, sn) + .03 * Math.sin(t * 2), mira * (1 - sn), 0);
  // k le agarra las canillas
  c.g.updateMatrixWorld(true); for (const [arm, leg] of [[k.armL, c.legL], [k.armR, c.legR]]) apuntar(k, arm, leg.localToWorld(_v2.set(0, -.7, .1)).add(_v3.set(0, -.12, 0)));
  parpadeo(c, t); parpadeo(k, t) }

// ---------- MIRAR / SEÑALAR ARRIBA (u 0→1 desde quieto). La cabeza sube con el torso un poco hacia atrás: desde una cámara baja se ve la cara, no la nuca.
function mirarArriba(k, t, u = 1) { const e = _suave(u); quieto(k, t); cadera(k, -.14 * e); k.head.rotation.x = -.5 * e + _respira(k, t); k.armL.rotation.x = .12 * e; k.armR.rotation.x = .12 * e; parpadeo(k, t) }
function senalarArriba(k, t, u = 1, { mano = "R" } = {}) { const e = _suave(u); mirarArriba(k, t, u); const a = mano === "R" ? k.armR : k.armL, sg = mano === "R" ? 1 : -1; a.rotation.set(lerp(0, -2.75, e) + .03 * Math.sin(t * 3), 0, sg * lerp(A_BRAZO, .05, e)); parpadeo(k, t) }
// retroceder(k, t, u): camina HACIA ATRÁS (la escena mueve k.g hacia −z local) mirando arriba, brazos un poco adelante como para atajarse. u = cuánto mira arriba.
function retroceder(k, t, u = 1) { const e = _suave(u); andar(k, t, { vel: -.85 }); cadera(k, -.1 * e); k.head.rotation.x = -.45 * e; k.armL.rotation.x -= .5 * e; k.armR.rotation.x -= .5 * e; k.armL.rotation.z -= .2 * e; k.armR.rotation.z += .2 * e; parpadeo(k, t) }
// cargarBebe(k, t): sostiene al bebé contra el pecho con los dos brazos y lo acuna (muestra el bebé de k)
function cargarBebe(k, t, { andar: an = 0 } = {}) { if (an) andar(k, t, { vel: .7 }); else quieto(k, t); const m = .05 * Math.sin(t * 2.4 + (k.idx || 0));
  k.armL.rotation.set(-.78 + m, 0, .5); k.armR.rotation.set(-.88 - m, 0, -.5); k.head.rotation.set(.24, 0, -.08); const b = bebe(k, true); b.rotation.z = -1.15 + m * 1.2; parpadeo(k, t); return b }
// KELL. bastonQuieto(k, t): parado derecho con el mentón alto, el bastón en la derecha apoyado en el piso, la izquierda en la espalda
function bastonQuieto(k, t) { quieto(k, t); k.head.rotation.x = -.08 + _respira(k, t); k.armR.rotation.set(-.3, 0, .16); k.armL.rotation.set(.42, 0, -.16); baston(k, true, "R"); parpadeo(k, t) }
// apuntarDedo(k, t, { u }): señala al narrador con el brazo derecho estirado (un pequeño empujón al llegar), el bastón en la izquierda. u 0→1 sube el brazo.
function apuntarDedo(k, t, { u = 1 } = {}) { const e = _suave(u); quieto(k, t); k.head.rotation.x = .06; k.body.rotation.x = .04 * e; k.armR.rotation.set(lerp(0, -1.5, e) - .04 * Math.sin(t * 5) * e, 0, lerp(A_BRAZO, .04, e)); k.armL.rotation.set(-.25, 0, -.18); baston(k, true, "L"); parpadeo(k, t) }
// ---------- los hombres de Kell. palear(k, t): carga tierra con la pala y la tira adelante (ciclo de 1,8 s). La pala va entre las manos; la tierra en la hoja
// se ve mientras la carga. sinPala = true para no mostrarla.
function palear(k, t, { sinPala = false } = {}) { const q = _frac(t / 1.8 + (k.idx || 0) * .23), s = k.body.scale.y; k._t = t;
  const tramo = q < .42 ? _suave(q / .42) : q < .62 ? 1 + _suave((q - .42) / .2) : 2 + _suave((q - .62) / .38);   // 0→1 carga, 1→2 tira, 2→3 vuelve
  const K = [[.62, .05, .52, .62, .28, .98, .55], [.18, -.32, .52, 1.25, .55, 1.6, .9], [.1, .25, .3, 1.5, .45, 1.15, .62], [.62, .05, .52, .62, .28, .98, .55]];   // [lean, giro, manoAbajo.x, .y, .z(adelante), manoArriba.y, .z]
  const i = Math.min(2, Math.floor(tramo)), f = tramo - i, A = K[i], B = K[i + 1], M = A.map((a, j) => lerp(a, B[j], f));
  quieto(k, t); cadera(k, M[0]); k.body.rotation.y = M[1]; k.legL.rotation.x += .25; k.legR.rotation.x -= .2; k.head.rotation.set(-M[0] * .6 + .2, -M[1] * .5, 0);
  apuntar(k, k.armR, gW(k, M[2] * s * .5, M[3] * s, M[4] * s)); apuntar(k, k.armL, gW(k, -.1 * s, M[5] * s, M[6] * s * .5));
  if (!sinPala) { const p = entreManos(pala(k, true), k, "L", "R"); p.userData.tierra.visible = q > .3 && q < .55 } parpadeo(k, t) }
// serruchar(k, t): el del serrucho corta para adelante y atrás (derecha), la izquierda apoyada en lo que corta
function serruchar(k, t) { const w = Math.sin(t * 7 + (k.idx || 0)); quieto(k, t); cadera(k, .35); k.armR.rotation.set(-1.25 + .28 * w, 0, -.05); k.armL.rotation.set(-1.4, 0, .35); k.head.rotation.x = .1; serrucho(k, true, "R"); parpadeo(k, t) }
// empujarCarretilla(k, t, { vel }): camina empujando la carretilla llena de tierra (la escena mueve k.g hacia +z local)
function empujarCarretilla(k, t, { vel = .8 } = {}) { andar(k, t, { vel }); cadera(k, .2); const s = k.body.scale.y, c = carretilla(k, true); if (c.parent !== scene) scene.add(c);
  k.g.updateMatrixWorld(true); c.position.copy(gW(k, 0, .92 * s, .62 * s)); c.quaternion.copy(k.g.getWorldQuaternion(_q1)); c.scale.setScalar(s);
  for (const [arm, sx] of [[k.armL, -.3], [k.armR, .3]]) apuntar(k, arm, c.localToWorld(_v2.set(sx, 0, .02))); parpadeo(k, t) }
// remontarBarrilete(k, t, { pos, tiron }): con el hilo en las dos manos, mirando arriba; pos = dónde está el barrilete (mundo; por defecto 9 arriba y 7 adelante)
function remontarBarrilete(k, t, { pos = null, tiron = 1 } = {}) { const s = k.body.scale.y, tir = tiron * Math.pow(Math.max(0, Math.sin(t * 2.2 + (k.idx || 0))), 6); quieto(k, t); cadera(k, -.1 - .08 * tir); k.legL.rotation.x += .16; k.legR.rotation.x -= .1;
  const P = pos ? _v4.set(...pos) : gW(k, .5 * Math.sin(t * .4 + k.idx), 9 + .5 * Math.sin(t * .9), 7, _v4); const C = barrilete(k, t, P.toArray()); k.g.updateMatrixWorld(true);
  const P0 = k.head.getWorldPosition(new THREE.Vector3()), d = C.clone().sub(P0).normalize(); for (const [arm, dx] of [[k.armL, -.06], [k.armR, .06]]) apuntar(k, arm, _v2.copy(P0).addScaledVector(d, 2).add(_v1.set(dx, -.45 + tir * .5, 0)));
  k.head.rotation.x = -.45; k.g.updateMatrixWorld(true); const m = k.handL.getWorldPosition(new THREE.Vector3()).add(k.handR.getWorldPosition(_v1)).multiplyScalar(.5), mid = m.clone().lerp(C, .5); mid.y -= .06 * m.distanceTo(C) * (1 - tir);
  k.barri.userData.hilo.poner(m, mid, C); parpadeo(k, t) }
// abrirMano(k, t, u): adelanta el brazo derecho con la palma para arriba y muestra el TRIGO (aparece a partir de u = .35); mira la mano
function abrirMano(k, t, u = 1) { const e = _suave(u); quieto(k, t); k.armR.rotation.set(lerp(0, -1.32, e) + .02 * Math.sin(t * 3), lerp(0, -.25, e), lerp(A_BRAZO, .02, e)); k.head.rotation.set(.18 * e, -.12 * e, 0); trigoMano(k, u > .35); parpadeo(k, t) }
// boda(novio, novia, t): los dos de frente (la escena los pone a ≈ 1,3 de distancia mirándose) tomados de las dos manos, meciéndose apenas
function boda(a, b, t) { quieto(a, t); quieto(b, t); [a, b].forEach((k, i) => { k.body.rotation.z = .03 * Math.sin(t * 1.6 + i * Math.PI); k.head.rotation.x = .06 }); a.g.updateMatrixWorld(true); b.g.updateMatrixWorld(true);
  const pa = a.g.getWorldPosition(new THREE.Vector3()), pb = b.g.getWorldPosition(new THREE.Vector3()), mid = pa.clone().lerp(pb, .5), d = pb.clone().sub(pa).setY(0).normalize(), lat = _v3.set(d.z, 0, -d.x), y = 1.25 * Math.min(a.body.scale.y, b.body.scale.y);
  for (const [k, sg] of [[a, 1], [b, -1]]) { apuntar(k, k.armL, mid.clone().addScaledVector(lat, -.28 * sg).setY(mid.y + y)); apuntar(k, k.armR, mid.clone().addScaledVector(lat, .28 * sg).setY(mid.y + y)) } parpadeo(a, t); parpadeo(b, t) }

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
// lugares (cambio de lugar = corte duro): la calle de hoy, la Loma, el recuerdo de Tanner, arriba de la tapa
const LUGAR = L => (L >= I.skipped && L <= I.cut) ? "recuerdo" : (L === I.kell || L === I.decides || L === I.moved) ? "loma" : (L >= I.through && L <= I.never) ? "arriba" : "calle";
const PISO = (x, z) => SUELO(x, z);
const ponerP = (k, x, z, ry = 0) => { k.g.visible = true; k.g.position.set(x, PISO(x, z), z); k.g.rotation.set(0, ry, 0) };
const enAire = (k, p, ry = 0) => { k.g.visible = true; k.g.position.set(p[0], p[1], p[2]); k.g.rotation.set(0, ry, 0) };
// orientación: el personaje mira a +z local; mirarA da el ry para que mire hacia (tx, tz)
const ryA = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);


// ---------- planos: cada frase tiene una lista de tomas; cada toma empieza en una palabra (w) y la cámara se mueve todo el tiempo (p→p1, l→l1)
// barrido de 0,2 s entre tomas del mismo lugar; corte seco cuando cambia el lugar. f = fov (gran angular en los primeros planos)
const sh = (w, p, p1, l, l1, f = 55, o = {}) => ({ w, p, p1: p1 || p, l, l1: l1 || l, f, ...o });
const add = (a, b) => a.map((v, i) => v + b[i]);
// primeros planos a partir de la cara: la cámara se pone delante de la cabeza (ang gira alrededor, dy sube) y se acerca de d0 a d1
const headW = k => { k.g.updateMatrixWorld(true); const q = k.head.getWorldQuaternion(new THREE.Quaternion()); return k.head.getWorldPosition(new THREE.Vector3()).addScaledVector(new THREE.Vector3(0, 1, 0).applyQuaternion(q), .38 * k.body.scale.y * k.g.scale.y) };
const fwdW = (k, ang) => new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang)).applyQuaternion(k.head.getWorldQuaternion(new THREE.Quaternion()));
const shF = (w, k, d0, d1, ang = 0, dy = 0, f = 62, ldy = 0, o = {}) => { const P = d => () => { const h = headW(k), v = fwdW(k, ang); return [h.x + v.x * d, h.y + v.y * d + dy, h.z + v.z * d] }, Lk = () => { const h = headW(k); return [h.x, h.y + ldy, h.z] }; return sh(w, P(d0), P(d1), Lk, Lk, f, o) };
const G = (x, dy, z) => () => [x, SUELO(x, z) + dy, z];
const KW = (k, o) => () => add(k.g.getWorldPosition(new THREE.Vector3()).toArray(), o);
const HD = (k, o) => () => { const h = headW(k); return [h.x + o[0], h.y + o[1], h.z + o[2]] };
const VZ = VECINOS;
// puntos fijos de la calle (z = 0 a lo largo de x; el poste en el origen; los peldaños del lado +x)
const PM = POSTE_MIO, CY = CIELO_Y0;
const CRK = (o = [0, 0, 0]) => () => add(POSTE_BASE(POSTE_MI), o);
const TOP = (o = [0, 0, 0]) => () => add(POSTE_TOP(POSTE_MI), o);
const AGW = (o = [0, 0, 0]) => () => add(AGUJERO_W(), o);
const ARR = (o = [0, 0, 0]) => () => { const [x, , z] = AGUJERO_W(); return [x + o[0], ARRIBA_Y(x, z) + o[1], z + o[2]] };
const CAS = () => CASILLAS[POSTE_MI];
const P9 = [POSTE_NUEVE[0], 0, POSTE_NUEVE[1]], P9L = POSTE_NUEVE_LOMA;
const SOLP = [SOL_PINTADO[0], CIELO(...SOL_PINTADO), SOL_PINTADO[1]];
// dónde está la gente al final (al este del panel que cae, mirando al oeste)
const FIN = [31, 0];
let t_ = 0;   // el tiempo del cuadro
const SHOTS = {
  [I.open]: [sh(0, [-14, 2.2, 1.5], [-13, 2.4, 1.2], [-9, CY - 3.3, -3], null, 60),
    sh(4, KW(ME, [3, 1.6, 3.4]), KW(ME, [2.7, 1.7, 3.1]), KW(ME, [0, 2.6, 0]), null, 62, { tr: "barrido" })],
  [I.rule]: [sh(0, [42, 8, .5], [37, 8.3, .3], [0, 6.5, -1], null, 56),
    sh(5, [5.5, .9, -3.4], [5, 1.1, -3], [0, 9.5, 0], null, 64, { tr: "barrido" })],
  [I.cost]: [sh(0, [-43, 1.6, 25], [-41, 1.8, 25.6], [-6, 2.5, 26], null, 58)],
  [I.nobody]: [sh(0, [-20, 1.5, 1], [-18.6, 1.6, .8], [0, CY, -4], null, 64)],
  [I.hard]: [sh(0, [-.5, 1.5, 6.5], [-.8, 1.6, 6.1], [-3, 2.4, 2], null, 60),
    sh(10, [3, 6.5, 6], [2.6, 7.2, 5.4], [0, CY, -4], null, 56, { tr: "barrido" })],
  [I.forty]: [sh(0, [-25, 1.6, -1], [-23, 2, -1.2], [-8, 7.5, 5], null, 60)],
  [I.pole]: [sh(0, [6, .8, 6], [5.4, 1, 5.4], [0, 7, 0], null, 66),
    sh(11, CRK([4.2, .8, 4.2]), CRK([3.7, .9, 3.7]), CRK([0, 0, 0]), null, 58, { tr: "barrido" })],
  [I.bell]: [sh(0, [CAMPANA_P[0] + 3.4, 2.2, CAMPANA_P[1] + 4], [CAMPANA_P[0] + 3, 2.4, CAMPANA_P[1] + 3.5], [CAMPANA_P[0], 3.2, CAMPANA_P[1]], null, 56),
    sh(5, [5.6, 4.8, 8.6], [5, 5, 8.2], CRK([0, -.5, 0]), null, 56),
    sh(12, CRK([5.6, 2.4, 4.4]), CRK([5.2, 2.5, 4]), CRK([0, .3, 0]), null, 60, { tr: "barrido" })],
  [I.wed]: [sh(0, [4.2, 1.8, 8], [3.8, 1.9, 7.6], [2.8, 1.5, 3.4], null, 58)],
  [I.babies]: [sh(0, () => add(CAS().puerta, [0, 1, 3.4]), () => add(CAS().puerta, [0, 1.05, 3]), () => add(CAS().puerta, [0, .3, -1.8]), null, 58),
    sh(6, () => add(CAS().puerta, [1.6, 1.4, 3]), () => add(CAS().puerta, [1.4, 1.45, 2.7]), () => add(CAS().puerta, [0, .2, -1.6]), null, 56, { tr: "barrido" })],
  [I.school]: [sh(0, CRK([-2, 1.4, 5.6]), CRK([-1.8, 1.5, 5.2]), CRK([0, .3, 0]), null, 60)],
  [I.sun]: [sh(0, G(12, 1.8, -47.5), G(12.6, 1.9, -47), [15, 8, -46], null, 64), sh(9, G(16, 1.7, -51), G(16.4, 1.8, -50.6), SOLP, null, 50, { tr: "barrido" })],
  [I.sign]: [sh(0, [-7, 3.6, 2.6], [-6.4, 4, 2.2], [0, 5.6, 0], null, 50), sh(9, [-6, 4.5, 2], [-5.7, 4.6, 1.8], [0, 5.6, 0], null, 50, { tr: "barrido" })],
  [I.greaser]: [sh(0, KW(ME, [.6, 1.2, 3.4]), KW(ME, [.5, 1.3, 3.1]), KW(ME, [0, 1.2, 0]), null, 58),
    sh(4, KW(ME, [.3, -1.2, 3.6]), KW(ME, [.2, -1, 3.3]), KW(ME, [-.2, 1, 0]), null, 64, { tr: "barrido" })],
  [I.slip]: [sh(0, CRK([3, 1.2, 2.6]), CRK([2.7, 1.25, 2.3]), CRK([0, .3, 0]), null, 52)],
  [I.ollie]: [sh(0, KW(ME, [3.4, 1.6, 1]), KW(ME, [3.2, 1.7, .9]), KW(ME, [0, 2.2, 0]), null, 58)],
  [I.higher]: [sh(0, KW(ME, [1.6, .5, 2.2]), KW(ME, [1.4, .4, 1.9]), KW(ME, [0, 3.2, 0]), null, 70),
    sh(7, KW(ME, [2, .7, 3]), KW(ME, [1.8, .6, 2.8]), [0, 9, -1], null, 68, { tr: "barrido" })],
  [I.oneday]: [sh(0, KW(ME, [2.8, 1.6, 3.2]), KW(ME, [2.6, 1.65, 3]), KW(ME, [0, 2.4, 0]), null, 60)],
  [I.kell]: [sh(0, G(-4, 7.5, -66), G(-2, 7.8, -66.6), [4, LOMA_H + 12, -96], null, 60),
    sh(6, KW(KELL, [-2.6, 1.2, 4.4]), KW(KELL, [-2.4, 1.3, 4.1]), KW(KELL, [0, 1.9, 0]), null, 56, { tr: "barrido" }),
    sh(13, G(-8, 1.6, -66), G(-8.5, 1.8, -66.6), G(-12, 18, -92), null, 64, { tr: "barrido" })],
  [I.decides]: [sh(0, KW(KELL, [3, 1.5, 3.6]), KW(KELL, [2.8, 1.6, 3.3]), KW(KELL, [-1.5, 1.8, 0]), null, 58)],
  [I.sinks]: [sh(0, [-14, 1.8, 1], [-13, 1.9, .8], [0, CY - 2, -2], null, 62)],
  [I.takes]: [sh(0, G(2, 6, -68), G(3, 6.3, -68.5), [0, 16, -96], null, 60),
    sh(11, KW(HOMBRES_KELL[2], [4.5, 1.6, 1.4]), KW(HOMBRES_KELL[2], [4.2, 1.7, 1.3]), KW(HOMBRES_KELL[2], [0, 1.6, 0]), null, 58)],
  [I.three]: [sh(0, [26, 3, 3], [23, 3.4, 2.6], [0, 5, 0], null, 54)],
  [I.skipped]: [sh(0, KW(ME, [6.5, 1.5, 1.6]), KW(ME, [6.3, 1.55, 1.5]), KW(ME, [0, 1.4, .8]), null, 58),
    sh(8, KW(OLLIE, [4.8, 1.6, 2]), KW(OLLIE, [4.5, 1.65, 1.8]), KW(OLLIE, [-1, 1, 0]), null, 58, { tr: "barrido" })],
  [I.night]: [sh(0, [-7.3, 2.3, 28.2], [-7.4, 2.4, 28.5], [-8, 2.6, 26], null, 40)],
  [I.tanner]: [sh(0, [-32, 2, 26], [-30, 2.2, 26.2], [0, 5, 27], null, 62)],
  [I.flat]: [sh(0, [42, 3.2, 26.5], [40, 3.4, 26], [0, .8, 26], null, 56)],
  [I.blame]: [sh(0, KW(KELL, [4, 1.3, 2.4]), KW(KELL, [3.7, 1.35, 2.2]), KW(KELL, [0, 1.6, 0]), null, 56),
    sh(12, [-46, 2, 20.4], [-45.8, 2.05, 20.6], KW(KELL, [0, 1.6, 0]), null, 56, { tr: "barrido" })],
  [I.looked]: [sh(0, HD(ME, [.45, .05, .22]), HD(ME, [.5, .05, .25]), [-39.5, 1.5, 25], null, 56)],
  [I.cut]: [sh(0, [-10, 1.8, 29.5], [-9.8, 1.85, 29.3], [-7.4, 1.1, 27.6], null, 56),
    sh(12, [-10, 2.2, 29], [-9.8, 2.2, 28.7], [-8, 2.1, 26], null, 38, { tr: "barrido" })],
  [I.moved]: [sh(0, [P9L[0] - 4.5, LOMA_H + 3, P9L[1] + 9], [P9L[0] - 3.5, LOMA_H + 3.4, P9L[1] + 8], [P9L[0], LOMA_H + 5, P9L[1]], null, 56)],
  [I.spare]: [sh(0, [-20, 2.2, 1.8], [-18, 2.4, 1.6], KW(HOMBRES_KELL[2], [0, 1.2, 0]), null, 56)],
  [I.chimneys]: [sh(0, [14, 5, 2], [13, 5.2, 1.7], [-4, CY - 2.6, -4.5], null, 60, { shake: .05 })],
  [I.snap]: [sh(0, CRK([0, 4.2, 6]), CRK([-.4, 4.3, 5.6]), CRK([0, 0, 0]), null, 58),
    sh(6, [-5, 1.4, 5.5], [-4.4, 1.6, 5], [-8, 7.4, -2], null, 64, { tr: "barrido", shake: .06 })],
  [I.climb]: [sh(0, [-3.8, 1.7, -.9], [-4, 1.8, -.8], KW(VZ[4], [0, 1.5, 0]), null, 52),
    sh(11, KW(ME, [.5, -.6, 3.4]), KW(ME, [.4, -.3, 3.1]), KW(ME, [0, 1.6, 0]), null, 64, { tr: "barrido" })],
  [I.top]: [sh(0, KW(ME, [.4, 1.6, 3.2]), KW(ME, [.35, 1.7, 2.9]), KW(ME, [-.2, 1.8, 0]), null, 60)],
  [I.drop]: [sh(0, KW(ME, [.5, 1.4, 3]), KW(ME, [.45, 1.5, 2.7]), HD(ME, [0, .1, 0]), null, 58)],
  [I.wood]: [sh(0, KW(ME, [.5, 1, 3]), KW(ME, [.45, 1.1, 2.7]), KW(ME, [-.2, 2.1, 0]), null, 60),
    sh(8, AGW([-2.4, -1.6, -1.8]), AGW([-2.2, -1.55, -1.65]), AGW([.2, 0, .2]), null, 60, { tr: "barrido" })],
  [I.count]: [sh(0, KW(ME, [1.4, .4, .9]), KW(ME, [1.6, .2, 1.1]), [6, 0, 4], null, 70, { shake: .08 }),
    sh(5, [-9, 1.6, -2.2], [-8.4, 1.7, -2], [0, CY - 4.2, -1], null, 62, { tr: "barrido", shake: .06 })],
  [I.through]: [sh(0, ARR([3.2, 2.4, 3]), ARR([2.9, 2.3, 2.7]), ARR([0, .6, 0]), null, 54)],
  [I.fields]: [sh(0, ARR([0, .32, 0]), ARR([.2, .45, -.3]), ARR([-30, 1.8, -9]), null, 56),
    sh(4, ARR([-3, 3, 4]), ARR([-5, 4, 5]), ARR([-60, 2, -20]), null, 54, { tr: "barrido" })],
  [I.farm]: [sh(0, ARR([10, 9, 12]), ARR([14, 16, 16]), ARR([-10, 0, -6]), null, 52)],
  [I.dirt]: [sh(0, ARR([7, 4.5, -8]), ARR([6, 4.6, -7]), [ESCALERA_KELL[0], ARRIBA_Y(...ESCALERA_KELL) + 1.5, ESCALERA_KELL[1]], null, 50),
    sh(6, KW(HOMBRES_KELL[1], [3, 1.6, 3]), KW(HOMBRES_KELL[1], [2.6, 1.7, 2.6]), KW(HOMBRES_KELL[1], [0, .9, 0]), null, 56, { tr: "barrido" })],
  [I.heavier]: [sh(0, ARR([-6, 2.6, 5]), ARR([-4, 2.7, 4]), ARR([-6, 0, -6]), null, 56)],
  [I.never]: [sh(0, ARR([-3.2, 1.7, -2.6]), ARR([-3, 1.65, -2.4]), ARR([0, .6, 0]), null, 58)],
  [I.told]: [sh(0, KW(ME, [-3, 1.8, 1.6]), KW(ME, [-2.6, 1.9, 1.4]), KW(ME, [0, 1.4, 0]), null, 58),
    sh(12, KW(ME, [-2.2, 1.6, 2.1]), KW(ME, [-2, 1.55, 1.9]), KW(ME, [-.3, 1.3, .3]), null, 50, { tr: "barrido" })],
  [I.letgo]: [sh(0, CRK([6.4, 2.2, 5]), CRK([5.6, 2.5, 4.4]), CRK([0, .2, 0]), null, 58)],
  [I.out]: [sh(0, () => add(CAS().puerta, [12, 1.2, 4]), () => add(CAS().puerta, [11, 1.3, 3.8]), () => add(CAS().puerta, [2, 1, 2]), null, 56),
    sh(6, [FIN[0] + 8, 1.8, FIN[1] + 1], [FIN[0] + 7, 2, FIN[1] + .8], [FIN[0] - 4, 1.4, FIN[1]], null, 58, { tr: "barrido" })],
  [I.fall]: [sh(0, [38, 4.5, 1.2], [37, 4.6, 1], [0, 7, -1], null, 62, { shake: .06 })],
  [I.gold]: [sh(0, [38, 4.6, 1.6], [37.4, 4.7, 1.4], [10, 14, -2], null, 64),
    sh(8, [40, 6, 1.6], [38, 6.3, 1.4], [8, 6, 0], null, 58, { tr: "barrido" })],
  [I.kellup]: [sh(0, () => add(KELL_BORDE, [2, -3, 6]), () => add(KELL_BORDE, [1.8, -2.8, 5.6]), () => add(KELL_BORDE, [0, 2, 0]), null, 56),
    sh(4, () => add(KELL_BORDE, [3.4, 1.2, 4.8]), () => add(KELL_BORDE, [3.1, 1.25, 4.4]), () => add(KELL_BORDE, [-.5, .8, -2]), null, 58, { tr: "barrido" })],
  [I.lost]: [sh(0, [38, 7, -1.5], [37, 7.1, -1.3], [-6, 2, 1], null, 58)],
  [I.shoulders]: [sh(0, KW(ME, [-2.8, 1.9, .6]), KW(ME, [-2.5, 2, .5]), KW(ME, [0, 2.4, 0]), null, 58),
    sh(11, KW(ME, [-2.6, .6, 1.2]), KW(ME, [-2.4, .55, 1.1]), KW(ME, [0, 3.2, 0]), null, 66, { tr: "barrido" })],
  [I.end]: [sh(0, KW(ME, [-2.2, .5, .6]), KW(ME, [-2.5, .4, .7]), KW(ME, [0, 2.6, 0]), null, 66)],
};
Object.values(SHOTS).forEach(L => L.forEach(x => { x.tr = x.tr || "barrido"; x.lat = x.lat ?? .45 }));   // órbita lateral chica: las calles son angostas

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
  const side = V_(v.z, 0, -v.x), sg = (TOMAS.indexOf(T) % 2 ? 1 : -1) * (T.s.lado ?? 1), dur = Math.max(.3, T.b - T.a), k = (T.s.lat != null ? T.s.lat * dur : Math.min(D * .19 * dur, D * .5)) * (q - .5);
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


// ---------- la escena en cada instante
const QS = new URLSearchParams(location.search), VISTA = QS.get("vista") ? QS.get("vista").split(",").map(Number) : null;
let ENV_OK = false;
window.MAPA = () => RECTS.map(R => [R.x, R.z, R.w, R.d, R.ry || 0]);
function setScene(t) {
  t_ = t;
  const L = lineAt(t), lt = t - s(L), len = (S[L + 1] ?? DUR) - s(L), k = P(lt, 0, len), Wd = kk => wt(L, kk), T0 = s(L), dW = kk => Wd(kk) - T0;
  POST = { flash: 0, sepia: 0 };
  if (!ENV_OK) { Object.assign(ENV, ENV_LEJOS, ENV_CIELO_PUEBLO); ENV_OK = true }
  mundoReset(); utileriaReset(); lejosReset(true);
  ALL.forEach(c => { if (c.polvo) c.polvo.forEach(q => q.visible = false); c.g.visible = false; c.body.rotation.set(0, 0, 0); c.body.position.y = 0; c.head.rotation.set(0, 0, 0); power(c, null, 0); c.aura.visible = false; setFace(c, "neutral"); pose(c, t, {}); quieto(c, t) });
  [PALA, REGLA, TELESC, HOYO].forEach(o => o.visible = false);
  sinBestia(); tortuga(t, { paso: 0 }); LUCES.forEach(l => l.visible = false);
  TEMBLOR = 0;
  const REC = LUGAR(L) === "recuerdo", ARRIBA_ = LUGAR(L) === "arriba", CAIDO = L >= I.fall;
  // ---- la tapa: cuánto se hundió sobre nuestra calle, el agujero, la caída
  const hund = L === I.open ? 3.3 + .15 * k : L === I.sinks ? .2 + .3 * k : L === I.chimneys ? 2.4 + .9 * eIO(k) : L === I.snap ? 3.3 + .3 * k : (L >= I.climb && L <= I.wood) ? 3.6 : L === I.count ? 3.6 + .6 * eIO(P(lt, dW(3), len)) : (L >= I.through && L <= I.out) ? 4.2 : 0;
  tapaHundir(hund, { polvo: hund > 0 ? (L === I.count || L === I.snap || L === I.chimneys ? .7 : .3) : false });
  posteBaja(POSTE_MI, hund);
  const agu = L === I.wood ? .3 * P(lt, dW(1), len) : L === I.count ? .3 + .05 * k : L === I.through ? .35 + .65 * eIO(P(lt, dW(1), dW(4))) : (L > I.through && L < I.fall) ? 1 : 0;
  if (agu > 0) tapaAgujero(agu);
  if (L === I.drop) tapaGotea(t, .9, { en: [AGUJERO[0] + .4, AGUJERO[1]], r: .5 });
  // la caída: el panel baja hasta apoyarse en los techos (≈ 7 m) con su campo encima; queda ahí
  const cae = L === I.fall ? .45 * eIO(P(lt, dW(1) - .1, dW(6))) : L > I.fall ? .45 : 0;
  if (cae > 0) { tapaCae(cae); tapaAgujero(0) }
  if (L >= I.gold) lluviaTrigo(t, L === I.gold ? P(lt, 0, 1.2) : L <= I.lost ? .8 : .5);
  // Tanner: en pie en el recuerdo (antes de «tanner»), la tapa bajando en «tanner», aplastada después
  const tan = (L === I.skipped || L === I.night) ? 0 : L === I.tanner ? eIO(P(lt, dW(1), dW(13) + .3)) : 1;
  tannerEstado(tan); tanerCae(tan);
  poste9Corte(L === I.cut || L === I.moved);
  if (L === I.night) posteBaja(POSTE_9T, .5 * eIO(P(lt, dW(2), len)));
  montonesTierra(true); escaleraArriba(L === I.dirt || L === I.heavier || L === I.kellup);
  escaleraKell(true);
  // ---- la manivela: gira una vuelta por campanada; se parte en «snap»
  const giroB = L === I.bell ? (lt > dW(9) ? Math.PI * 2 * eIO(P(lt, dW(9), dW(13))) : 0) : L === I.snap ? 1.4 * P(lt, 0, dW(5)) : L === I.letgo ? -Math.PI * 3 * eIO(P(lt, dW(8), len)) : L === I.school ? .9 * k : L === I.pole || L === I.slip ? .25 * k : 0;
  manivelaGiro(POSTE_MI, giroB);
  if (L >= I.snap && L < I.fall) manivelaRota(POSTE_MI, L === I.snap ? P(lt, dW(5) - .05, dW(5) + .6) : 1);
  posteGrasa(POSTE_MI, 1);
  campana(L === I.bell ? .35 * Math.sin(lt * 6) * Math.exp(-lt * .6) * (lt > dW(3) - .1 ? 1 : 0) : 0);
  techosRajan(L === I.open ? .35 : L === I.chimneys ? .2 + .3 * k : L === I.snap ? (lt > dW(6) ? .5 + .4 * P(lt, dW(6), len) : .5) : (L > I.snap && L < I.fall) ? .9 : L >= I.fall ? 1 : 0);
  callePolvo(L === I.open || L === I.chimneys || L === I.snap || L === I.count ? .7 : (L >= I.climb && L <= I.wood) ? .3 : L >= I.fall && L <= I.gold ? 1 : 0);
  barriletes(t, LUGAR(L) === "loma" || L === I.takes);
  // ---- luz
  setEnv(QS.get("env") || (REC ? "recuerdo" : ARRIBA_ ? "arriba" : CAIDO ? "luzReal" : "bajo")); ambiente(t);
  if (REC) POST.sepia = .55;
  // ---- gente
  const V = VECINOS, HK = HOMBRES_KELL;
  const parado = (c, x, z, ry, cara = "neutral") => { ponerP(c, x, z, ry); setFace(c, cara); quieto(c, t) };
  const mirando = (c, x, z, tx, tz, cara = "neutral") => parado(c, x, z, ryA(x, z, tx, tz), cara);
  const arriba = (c, x, z, tx, tz, cara = "scared", u = 1) => { ponerP(c, x, z, ryA(x, z, tx, tz)); setFace(c, cara); mirarArriba(c, t, u) };
  const enHombros = (x, z, ry, o = {}) => { ponerP(ME, x, z, ry); if (o.andar) andar(ME, t, { vel: .8 }); hombros(ME, OLLIE, t, { senala: o.senala || 0, andar: o.andar ? 1 : 0, mira: o.mira || 0 }) };
  // la gente de la calle alrededor del poste (cuando no empujan)
  const gentio = (cara = "scared", u = 1) => [[V[0], -4.6, 3.2], [V[1], -2.4, 4.6], [V[2], 3.6, 4.2], [V[3], 5.2, 2.2], [V[4], -6.4, 1], [V[5], 6.6, -1.2], [V[7], 1.4, 5.6], [V[8], -1.2, 6.2], [V[9], 4.8, 5.8]].forEach(([c, x, z], i) => arriba(c, x, z, 0, 0, i % 2 ? cara : "worried", u));
  // la manivela de nuestra calle con su gente
  const empujan = (lista, o = {}) => { const P_ = POSTES[POSTE_MI]; manivelaGrupo(lista, [P_.x, P_.z], 3.3, -(P_.ang || 0), { brazos: 4, t, suelo: PISO, sentido: -1, fuerza: o.fuerza ?? 1 }); lista.forEach(c => setFace(c, o.cara || "aguanta")) };
  // el narrador colgado del poste a la altura h (peldaños del lado +x, mira hacia −x)
  const enPoste = (h, fn) => { const p = postePeldano(POSTE_MI, h); enAire(ME, [p[0] + .1, p[1] - 1.1, p[2]], -Math.PI / 2); fn() };
  const topH = () => POSTE_TOP(POSTE_MI)[1] - SUELO(...PM) - 2.1;
  switch (L) {
    case I.open: enHombros(-5.5, 3, ryA(-5.5, 3, -14, 7)); setFace(ME, "scared"); setFace(OLLIE, "worried"); ME.head.rotation.x = -.35; mirando(V[1], -8, 1.5, -3, -2, "scared"); arriba(V[8], -1, 1, -3, 0, "terrified"); break;
    case I.rule: gentio("neutral", .6); empujan([V[10], V[11], HK[3], V[6]], { cara: "neutral" }); break;
    case I.cost: break;
    case I.nobody: arriba(V[6], 3.4, -11.4, SOLP[0], SOLP[2], "curious"); arriba(V[7], 4.6, -10, SOLP[0], SOLP[2], "neutral", .8); break;
    case I.hard: ponerP(V[6], -3, 2, ryA(-3, 2, 2, 6)); setFace(V[6], "happy"); senalarArriba(V[6], t, P(lt, 0, .8)); parado(V[7], -1.6, 2.6, ryA(-1.6, 2.6, 3, 7), "laugh"); break;
    case I.forty: mirando(V[0], -14, 3, -20, -1, "neutral"); mirando(V[3], -12.4, 2, -20, -1, "neutral"); break;
    case I.pole: empujan([V[0], V[2], V[3], V[9]], { cara: "neutral", fuerza: .4 }); break;
    case I.bell: case I.school: { const L_ = L === I.school ? [V[6], V[7], V[11], OLLIE] : [V[0], V[2], V[3], V[9], V[4], V[5], V[10], V[11]];
      empujan(L_, { cara: L === I.school ? "happy" : "aguanta" }); if (L === I.school) setFace(OLLIE, "laugh"); break }
    case I.wed: { const x = 2.8, z = 3.4; ponerP(NOVIO, x - .68, z, Math.PI / 2); ponerP(NOVIA, x + .68, z, -Math.PI / 2); boda(NOVIO, NOVIA, t); setFace(NOVIO, "happy"); setFace(NOVIA, "warm");
      mirando(V[4], x - 2.6, z + 1.6, x, z, "warm"); mirando(V[5], x + 2.8, z + 1.2, x, z, "happy"); mirando(V[10], x - 2.2, z + 2, x, z, "laugh"); break }
    case I.babies: { const C = CAS(); ponerP(MADRES[0], C.puerta[0] + .6, C.puerta[2] - 1.1, ryA(C.puerta[0] + .6, C.puerta[2] - 1.1, C.puerta[0] + .6, C.puerta[2] + 3)); cargarBebe(MADRES[0], t); setFace(MADRES[0], "warm"); break }
    case I.sun: arriba(V[6], 3.4, -10.6, SOLP[0], SOLP[2], "neutral", .9); break;
    case I.sign: break;
    case I.greaser: enPoste(5 + .8 * k, () => { if (lt < dW(3)) { engrasar(ME, t) } else trepar(ME, t, {}); setFace(ME, "neutral") }); baldeGrasa(ME, true, "cinto"); ponerP(OLLIE, 4.6, 2.2, ryA(4.6, 2.2, 0, 0)); senalarArriba(OLLIE, t, .5); setFace(OLLIE, "happy"); break;
    case I.slip: break;
    case I.ollie: enHombros(-12 + 2.2 * lt, .8, Math.PI / 2, { andar: 1 }); setFace(ME, "warm"); setFace(OLLIE, "laugh"); baldeGrasa(ME, true, "L"); break;
    case I.higher: case I.oneday: enHombros(1.8, 2.4, ryA(1.8, 2.4, 6, 6), { senala: L === I.higher ? eIO(P(lt, dW(3), dW(5))) : .3, mira: 0 }); setFace(ME, L === I.oneday ? "warm" : "happy"); setFace(OLLIE, "wow"); if (L === I.higher) ME.head.rotation.x = -.25; break;
    case I.kell: { const x = -1, z = -78; ponerP(KELL, x, z, ryA(x, z, -12, -60)); bastonQuieto(KELL, t); setFace(KELL, "frio");
      [[V[6], -10, -72], [V[7], -6, -70], [V[11], -13, -74]].forEach(([c, xx, zz], i) => { ponerP(c, xx, zz, ryA(xx, zz, -12, -96)); remontarBarrilete(c, t + i); setFace(c, "happy") }); break }
    case I.decides: ponerP(KELL, -1, -78, ryA(-1, -78, 1, -74)); apuntarDedo(KELL, t, { u: P(lt, 0, .6) }); setFace(KELL, "desprecio"); break;
    case I.sinks: gentio("worried", .8); break;
    case I.takes: { if (lt > dW(11)) { const x = -10 + 1.4 * (lt - dW(11)), z = 1; ponerP(HK[2], x, z, Math.PI / 2); empujarCarretilla(HK[2], t); setFace(HK[2], "squint"); ponerP(HK[0], x - 2, z - 1.6, Math.PI / 2); andar(HK[0], t); serrucho(HK[0], true, "R"); setFace(HK[0], "suspicious");
        arriba(V[4], -12, 4.6, x, z, "sad", 0); arriba(V[0], -8, -3.6, x, z, "worried", 0) } break }
    case I.three: gentio("sad", .4); break;
    case I.skipped: { const x = -27 + 3.4 * lt, z = 23.6; ponerP(ME, x, z, Math.PI / 2); correrV(ME, t); setFace(ME, "laugh"); ponerP(OLLIE, x + 2.2, z + .8, Math.PI / 2); correrV(OLLIE, t + .2); setFace(OLLIE, "laugh"); baldeGrasa(ME, true, "L"); break }
    case I.night: break;
    case I.tanner: [[V[0], -24, 14], [V[1], -21, 13.4], [V[3], -18, 14.6]].forEach(([c, x, z]) => arriba(c, x, z, -6, 26, "terrified", .8)); break;
    case I.flat: break;
    case I.blame: { ponerP(KELL, -39, 25, Math.PI / 2); if (lt > dW(11)) { apuntarDedo(KELL, t, { u: P(lt, dW(11), dW(12)) }); KELL.g.rotation.y = ryA(-39, 25, -43.5, 23) } else bastonQuieto(KELL, t); setFace(KELL, "frio");
      parado(ME, -43.5, 23, ryA(-43.5, 23, -39, 25), "worried"); [[V[0], -42, 27.6], [V[2], -44, 26.6], [V[5], -41.6, 21.4]].forEach(([c, x, z]) => parado(c, x, z, ryA(x, z, -39, 25), "sad")); break }
    case I.looked: { parado(ME, -43.5, 23, ryA(-43.5, 23, -39, 25), "sad"); [[V[0], -41, 27.4], [V[2], -39.4, 27], [V[5], -40.2, 21.6], [V[3], -38.4, 23], [KELL, -39, 25]].forEach(([c, x, z]) => parado(c, x, z, ryA(x, z, -43.5, 23), c === KELL ? "frio" : "suspicious")); break }
    case I.cut: { ponerP(ME, -7.4, 27.6, ryA(-7.4, 27.6, -8, 26)); quieto(ME, t); setFace(ME, lt > dW(15) ? "shock" : "squint"); ME.body.position.y = -.25; break }
    case I.moved: [[V[6], P9L[0] - 4, P9L[1] + 4], [V[7], P9L[0] - 7, P9L[1] + 6]].forEach(([c, x, z], i) => { ponerP(c, x, z, ryA(x, z, -12, -96)); remontarBarrilete(c, t + i); setFace(c, "happy") }); break;
    case I.spare: { const x = -12 - 1.3 * lt, z = 1; ponerP(HK[2], x, z, -Math.PI / 2); empujarCarretilla(HK[2], t); setFace(HK[2], "squint"); ponerP(HK[1], x + 1.8, z - 1.4, -Math.PI / 2); andar(HK[1], t); setFace(HK[1], "neutral"); arriba(ME, -6, 3, x, z, "worried", 0); break }
    case I.chimneys: gentio("terrified", 1); enHombros(-8, 4.6, ryA(-8, 4.6, 14, 7)); setFace(ME, "scared"); setFace(OLLIE, "scared"); ME.head.rotation.x = -.3; break;
    case I.snap: { empujan([V[0], V[2], V[3], V[9], V[4], V[5], V[10], ME], { cara: lt > dW(5) ? "shock" : "esfuerzo", fuerza: 1 }); if (lt > dW(6)) TEMBLOR = .03; break }
    case I.climb: { gentio("terrified", .5); if (lt < dW(11)) { arriba(ME, 4.6, 1.2, 0, 0, "determined", .7) } else enPoste(1.8 + 2.4 * P(lt, dW(11), len), () => { trepar(ME, t, {}); setFace(ME, "determined") }); break }
    case I.top: enPoste(topH() - .5 + .5 * eIO(k), () => { trepar(ME, t, { vel: .5 }); setFace(ME, "aguanta"); ME.head.rotation.x = -.4 }); break;
    case I.drop: enPoste(topH(), () => { quieto(ME, t); setFace(ME, lt > dW(2) ? "squint" : "aguanta"); ME.head.rotation.x = -.45 }); break;
    case I.wood: enPoste(topH(), () => { cortarArriba(ME, t, P(lt, dW(1), dW(3))); cuchilloGrasa(ME, true, "R"); setFace(ME, lt > dW(11) ? "shock" : "esfuerzo") }); break;
    case I.count: { enPoste(topH(), () => { cortarArriba(ME, t, 1); cuchilloGrasa(ME, true, "R"); setFace(ME, "esfuerzo") }); gentio("terrified", .8); TEMBLOR = lt > dW(3) ? .04 : 0; break }
    case I.through: case I.fields: case I.farm: case I.dirt: case I.heavier: case I.never: { const [x, , z] = AGUJERO_W(); enAire(ME, [x, ARRIBA_Y(x, z), z], L === I.dirt ? Math.PI * .75 : -Math.PI * .6);
      cabezaAfuera(ME, t, L === I.through ? eIO(P(lt, dW(4), len)) : 1); setFace(ME, L === I.fields ? "wow" : L === I.never ? "determined" : L === I.farm ? "shock" : L === I.through ? "esfuerzo" : "squint");
      if (L === I.dirt || L === I.heavier) { const B = [-3, -6]; [[HK[1], B[0], B[1]], [HK[3], B[0] + 2.2, B[1] - 1.4]].forEach(([c, xx, zz]) => { enAire(c, [xx, ARRIBA_Y(xx, zz), zz], ryA(xx, zz, 0, 0)); palear(c, t); setFace(c, "neutral") });
        const xx = 1.5 - 1.2 * lt, zz = -8; enAire(HK[2], [xx, ARRIBA_Y(xx, zz), zz], -Math.PI / 2); empujarCarretilla(HK[2], t); setFace(HK[2], "squint") } break }
    case I.told: { parado(ME, 4.6, 1.6, ryA(4.6, 1.6, 0, 6), "determined"); if (lt > dW(11)) { abrirMano(ME, t, P(lt, dW(11), dW(14))) }
      [[V[0], 1.6, 5.4], [V[2], 3.2, 6.6], [V[3], 5.6, 6.4], [V[9], 7.2, 4.6], [V[4], .2, 3.8]].forEach(([c, x, z]) => parado(c, x, z, ryA(x, z, 4.6, 1.6), lt > dW(15) ? "shock" : "suspicious")); break }
    case I.letgo: { const e = P(lt, dW(8), len); if (e <= 0) empujan([V[0], V[2], V[3], V[9]], { cara: "determined", fuerza: .4 });
      else [[V[0], 4.6, 2.8], [V[2], -3.6, 3.6], [V[3], 3.2, -4.4], [V[9], -4.4, -2.6]].forEach(([c, x, z]) => { ponerP(c, x * (1 + e * .6), z * (1 + e * .6), ryA(x, z, 0, 0)); retroceder(c, t, e); setFace(c, "determined") }); break }
    case I.out: { const C = CAS(), q = P(lt, 0, dW(6)); [[MADRES[0], 0], [MADRES[1], 1]].forEach(([c, i]) => { const x = C.puerta[0] + 2 + q * 14 + i * 1.6, z = C.puerta[2] + 2 + i * 1.2; ponerP(c, x, z, Math.PI / 2); cargarBebe(c, t, { andar: 1 }); setFace(c, "worried") });
      if (lt > dW(6)) [[V[0], FIN[0] - 2, FIN[1] - 2], [V[2], FIN[0] - 1, FIN[1] + 1], [V[3], FIN[0] - 2.6, FIN[1] + 2.2], [V[9], FIN[0] - .6, FIN[1] - 1.4], [ME, FIN[0] - 1.8, FIN[1] + .2]].forEach(([c, x, z]) => { ponerP(c, x + P(lt, dW(6), len) * 2, z, ryA(x, z, 0, 0)); retroceder(c, t, 1); setFace(c, "determined") }); break }
    case I.fall: case I.gold: case I.lost: { [[V[0], FIN[0] + 1, FIN[1] - 2], [V[2], FIN[0] + 2.4, FIN[1] + 1.2], [V[3], FIN[0] + .4, FIN[1] + 2.2], [V[9], FIN[0] + 2.6, FIN[1] - 1.2], [MADRES[0], FIN[0] + 3.8, FIN[1] + 2], [MADRES[1], FIN[0] + 4.2, FIN[1] - 2], [V[4], FIN[0] + 5, FIN[1] + .4]].forEach(([c, x, z], i) => { const cara = L === I.fall ? "terrified" : L === I.gold ? "wow" : "sad"; if (c === MADRES[0] || c === MADRES[1]) { ponerP(c, x, z, ryA(x, z, 0, 0)); cargarBebe(c, t); setFace(c, cara) } else arriba(c, x, z, 0, 0, cara, L === I.lost ? .2 : .8) });
      enHombros(FIN[0] + 1.4, FIN[1] - .2, ryA(FIN[0] + 1.4, FIN[1] - .2, 0, 0), { mira: 0 }); setFace(ME, L === I.lost ? "sad" : L === I.gold ? "wow" : "scared"); setFace(OLLIE, L === I.gold ? "wow" : L === I.lost ? "sad" : "terrified"); break }
    case I.kellup: { enAire(KELL, KELL_BORDE, 0); bastonQuieto(KELL, t); setFace(KELL, lt > dW(8) ? "shock" : "frio"); KELL.head.rotation.x = .5; break }
    case I.shoulders: case I.end: { enHombros(FIN[0] - 1, FIN[1] + .6, ryA(FIN[0] - 1, FIN[1] + .6, 0, -1), { senala: L === I.shoulders ? eIO(P(lt, dW(5), dW(9))) : 1 }); setFace(ME, L === I.end ? "warm" : "relieved"); setFace(OLLIE, "wow"); ME.head.rotation.x = -.3;
      if (L === I.end) { const e = eIO(P(lt, 0, dW(3))); OLLIE.g.position.y += .5 * e; ME.armL.rotation.x = -2.6 * e; ME.armR.rotation.x = -2.6 * e }
      [[V[2], FIN[0] + 1.6, FIN[1] + 2], [V[9], FIN[0] + 2.2, FIN[1] - 1.6]].forEach(([c, x, z]) => arriba(c, x, z, 0, 0, "relieved", .6)); break }
  }
  lejos(t);
  if (VISTA) { cam.position.set(VISTA[0], VISTA[1], VISTA[2]); cam.lookAt(VISTA[3], VISTA[4], VISTA[5]); cam.fov = VISTA[6] || 50; cam.updateProjectionMatrix(); lights([]); POST.tapa = null; return }
  lights([]); camara(t);
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