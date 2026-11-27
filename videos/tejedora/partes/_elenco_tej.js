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
