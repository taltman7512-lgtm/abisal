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
  // caras ≈ 35 % más grandes (dueño, 28-nov-2026: «que se lean en el celular»): se dibuja escalado desde el centro de la cara
  const GRANDE = (g, fn) => { g.save(); g.translate(256, 222); g.scale(1.35, 1.35); g.translate(-256, -222); fn(g); g.restore() };
  return CARAV[key] = tex(512, 384, (g, w, h) => { g.lineCap = "round"; g.lineJoin = "round"; const f0 = CARAS_CAT[kind] || CARAS_CAT.neutral, f = gg => GRANDE(gg, f0);
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
