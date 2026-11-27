// ================= LA TEJEDORA (the Weaver) — «Nobody Answers The Knock» =================
// Criatura de ≈ 22 m, flaca y encorvada, hecha de ABRIGOS VIEJOS COSIDOS entre sí: paños de lana gris, tweed, paño negro, verde,
// cuadros, pana… (textura pintada en canvas: tejido, costuras en zigzag con hilo claro, agujeros de polilla, zurcidos), capas de
// abrigos superpuestas como tejas (los ruedos sirven de escalón), botones de todos los tamaños (InstancedMesh), puntadas 3D gruesas
// (InstancedMesh), bolsillos, cuellos parados, mangas VACÍAS que cuelgan y se mueven, flecos e hilos sueltos. Piernas larguísimas de
// mangas enrolladas. Brazos de PERCHAS DE ALAMBRE oxidadas, colgadas de un travesaño de madera que le cruza los hombros (espantapájaros):
// cada tramo es una percha estirada cuyo gancho se engancha en la barra de la anterior; los «dedos» son cuatro ganchos de percha.
// Cara = UN botón gigante de cuatro agujeros (hueso/carey, rajado, con una mella), cosido con hilo grueso en cruz; los agujeros negros.
// Debajo del botón, la BOCA es un bolsillo cosido que se descose para gritar. En el pecho, el ABRIGO ROJO cosido con 18 puntadas.
// Todo procedural (lofts, tubos sobre curvas, extrusión con agujeros); texturas pintadas en canvas. Mira a +z local (como el elenco).
//
// API (por cuadro, en este orden: poner → quieto|caminar → modificadores → mirar → aura; las funciones de cámara al final):
//   TEJEDORA.poner(x, y, z, ry)         la muestra parada en ese punto (y = piso) en la pose de reposo (borra lo del cuadro anterior)
//   TEJEDORA.ocultar()                  la esconde (con su aura y el abrigo rojo suelto); llamarlo en el reset de cada cuadro
//   TEJEDORA.quieto(t)                  respira, la tela se mueve con el viento, los ganchos se mecen, las mangas vacías se balancean
//   TEJEDORA.caminar(t, vel = 2.6)      pasos lentos y pesados (ciclo de dos pasos = TEJEDORA.PASO m); el cuerpo se balancea, las mangas
//                                       cuelgan con retraso. El que llama avanza la raíz a `vel` m/s en la dirección ry (los pies no patinan)
//   TEJEDORA.agacharse(u, p)            se agacha (u 0..1); si p = [x, y, z] gira el torso hacia p
//   TEJEDORA.golpear(t, u, p)           se agacha hacia la puerta y golpea con el gancho del medio en p ([x, y, z] del mundo; por defecto
//                                       5,5 m adelante a 1,9 m de alto): 0–.3 se agacha y estira el brazo, tres golpes en u = GOLPES_U
//                                       (.42, .57, .72), queda apoyado. TEJEDORA.golpeFuerza(u) → 0..1 (pico en cada golpe: sonido/temblor)
//   TEJEDORA.abrirPuerta(u, p, d)       mete el gancho en p (el borde de la puerta) y tira hacia d ([dx, dz], por defecto hacia ella);
//                                       devuelve cuánto está abierta la puerta (0..1) para que la escena gire la hoja
//   TEJEDORA.gritar(t, u)               se arquea hacia atrás, tiembla, los brazos se abren, la tela se infla, la boca-bolsillo se descose
//   TEJEDORA.mirar([x, y, z], u = 1)    la cara (el botón) mira ese punto (gira cuello y un poco el torso)
//   TEJEDORA.cortarPuntos(u)            0..1: corta las puntadas del abrigo rojo una por una (quedan los cabos); el abrigo se despega
//   TEJEDORA.abrigoRojoCae(u, dest)     0..1: el abrigo rojo se suelta del pecho y cae revoloteando hasta dest ([x, y, z] del piso;
//                                       por defecto debajo del pecho, 3 m adelante). Devuelve el THREE.Group del abrigo
//   TEJEDORA.abrigoRojoEn(x, y, z, ry, u = 1)  el abrigo rojo tirado en el piso (sin la criatura); u < 1 lo va levantando del piso
//                                       (u = 0 colgando a 1,1 m, como si alguien lo sostuviera de los hombros)
//   TEJEDORA.trepaPunto(u)              { p, n, arriba } u 0 = cintura … 1 = al lado del abrigo rojo: punto de agarre en la superficie,
//                                       normal hacia afuera y «arriba» a lo largo del cuerpo (poner al narrador en p + n · 0,45)
//   TEJEDORA.puntoW(i) / siguientePuntoW(u)  [x, y, z] de la puntada i (0..PUNTOS_N−1) / de la que se corta en u (planos de las tijeras)
//   TEJEDORA.aura(on, k = 1)            niebla que se arrastra a sus pies, hilos sueltos que flotan, pelusa en el aire, polvo en cada
//                                       pisada, luz fría desde abajo; inclina las velas (velasHacia) y deja TEJEDORA.frio = {p, r, k}
//   TEJEDORA.luzFria(lista)             recibe la lista de luces de la escena ([[p], I, color, dist] de lucesCerca) y enfría/apaga las
//                                       que están cerca de ella (usarla con lights(TEJEDORA.luzFria(LX)))
//   TEJEDORA.climas()                   agrega el clima "tejedora" (y "noche" si falta) a ENV
//   cámara: cabezaW() centro del botón-cara · pechoW() centro del abrigo rojo · ganchoW() punta del gancho que golpea ·
//           caraCam(d, ang, dy) [x, y, z] a d m delante de la cara (ang gira alrededor, dy sube) · pieW(lado) · alto() ≈ 22
//   TEJEDORA.g el grupo raíz · TEJEDORA.ROJO el grupo del abrigo rojo · PASO · ALTO
const TEJEDORA = (() => {
  const T3 = THREE, PI = Math.PI, TAU = PI * 2;
  const S_ = (a, b, v) => { const q = Math.max(0, Math.min(1, (v - a) / (b - a))); return q * q * (3 - 2 * q) };
  const c01 = v => Math.max(0, Math.min(1, v)), mix = (a, b, k) => a + (b - a) * k, eIO = k => k * k * (3 - 2 * k), ex2 = a => Math.exp(-a);
  const fr = x => x - Math.floor(x);
  const rnd = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 };
  const hsh = (i, j, k) => { let n = (Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(k, 1274126177)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296 };
  const nz3 = (x, y, z) => { const i = Math.floor(x), j = Math.floor(y), k = Math.floor(z), fx = x - i, fy = y - j, fz = z - k, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), w = fz * fz * (3 - 2 * fz);
    return mix(mix(mix(hsh(i, j, k), hsh(i + 1, j, k), u), mix(hsh(i, j + 1, k), hsh(i + 1, j + 1, k), u), v), mix(mix(hsh(i, j, k + 1), hsh(i + 1, j, k + 1), u), mix(hsh(i, j + 1, k + 1), hsh(i + 1, j + 1, k + 1), u), v), w) };
  const fbm = (x, y, z) => nz3(x, y, z) * .5 + nz3(x * 2.03 + 7, y * 2.03, z * 2.03) * .3 + nz3(x * 4.1, y * 4.1 + 3, z * 4.1) * .2;
  const V3 = (a, b, c) => Array.isArray(a) ? new T3.Vector3(a[0], a[1], a[2]) : new T3.Vector3(a, b, c);
  const v1 = new T3.Vector3(), v2 = new T3.Vector3(), v3 = new T3.Vector3(), v4 = new T3.Vector3(), q1 = new T3.Quaternion(), q2 = new T3.Quaternion(), ABAJO = new T3.Vector3(0, -1, 0), Y_ = new T3.Vector3(0, 1, 0);

  // ---------- geometría: loft de anillos (u alrededor, v a lo largo; y baja con v → caras hacia afuera), costura sin marca
  function costura(g) { g.computeVertexNormals(); const p = g.attributes.position, n = g.attributes.normal, M = new Map();
    for (let i = 0; i < p.count; i++) { const k = Math.round(p.getX(i) * 2e3) + "," + Math.round(p.getY(i) * 2e3) + "," + Math.round(p.getZ(i) * 2e3); let L = M.get(k); if (!L) M.set(k, L = []); L.push(i) }
    M.forEach(L => { if (L.length < 2) return; let x = 0, y = 0, z = 0; L.forEach(i => { x += n.getX(i); y += n.getY(i); z += n.getZ(i) }); const l = Math.hypot(x, y, z) || 1; L.forEach(i => n.setXYZ(i, x / l, y / l, z / l)) }); return g }
  function loft(nU, nV, fn, o = {}) { const P = [], UV = [], I = [];
    for (let j = 0; j <= nV; j++) for (let i = 0; i <= nU; i++) { const u = i / nU, v = j / nV, q = fn(u, v); P.push(q[0], q[1], q[2]); UV.push(u * (o.ru || 1) + (o.ou || 0), (1 - v) * (o.rv || 1) + (o.ov || 0)) }
    for (let j = 0; j < nV; j++) for (let i = 0; i < nU; i++) { const a = j * (nU + 1) + i, b = a + 1, c = a + nU + 1, d = c + 1; I.push(a, c, b, b, c, d) }
    const g = new T3.BufferGeometry(); g.setAttribute("position", new T3.Float32BufferAttribute(P, 3)); g.setAttribute("uv", new T3.Float32BufferAttribute(UV, 2)); g.setIndex(I); return costura(g) }
  const tubo = (y0, len, nU, nV, fn, o) => loft(nU, nV, (u, v) => { const th = u * TAU, r = fn(v, th); return [Math.sin(th) * r[0] + (r[3] || 0), y0 - v * len + (r[4] || 0), Math.cos(th) * r[1] + (r[2] || 0)] }, o);
  function tuboCurva(pts, nU, nV, rad, o) { const cv = new T3.CatmullRomCurve3(pts), F = cv.computeFrenetFrames(nV, false);
    return loft(nU, nV, (u, v) => { const j = Math.round(v * nV), p = cv.getPointAt(v), th = u * TAU, r = rad(v, th), N = F.normals[j], B = F.binormals[j], c = Math.cos(th), s = Math.sin(th);
      return [p.x + r * (c * N.x + s * B.x), p.y + r * (c * N.y + s * B.y), p.z + r * (c * N.z + s * B.z)] }, o) }
  function fusionar(L) { const P = [], N = [], UV = [], C = [], I = []; let o = 0; const hayC = L.some(g => g.attributes.color);
    L.forEach(g => { if (!g.index) { const n = g.attributes.position.count; g.setIndex([...Array(n).keys()]) } const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv, co = g.attributes.color;
      for (let i = 0; i < p.count; i++) { P.push(p.getX(i), p.getY(i), p.getZ(i)); N.push(n.getX(i), n.getY(i), n.getZ(i)); UV.push(uv ? uv.getX(i) : 0, uv ? uv.getY(i) : 0); if (hayC) co ? C.push(co.getX(i), co.getY(i), co.getZ(i)) : C.push(1, 1, 1) }
      const ix = g.index.array; for (let i = 0; i < ix.length; i++) I.push(ix[i] + o); o += p.count });
    const g = new T3.BufferGeometry(); g.setAttribute("position", new T3.Float32BufferAttribute(P, 3)); g.setAttribute("normal", new T3.Float32BufferAttribute(N, 3)); g.setAttribute("uv", new T3.Float32BufferAttribute(UV, 2));
    if (hayC) g.setAttribute("color", new T3.Float32BufferAttribute(C, 3)); g.setIndex(I); return g }
  const mover = (geo, m) => { geo.applyMatrix4(m); return geo };
  const MX = (x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) => new T3.Matrix4().compose(new T3.Vector3(x, y, z), new T3.Quaternion().setFromEuler(new T3.Euler(rx, ry, rz, "YXZ")), new T3.Vector3(sx, sy, sz));

  // ======================= TEXTURAS (canvas) =======================
  // paños de abrigo: [tipo, color base]
  const PAL = [["lana", "#5f5e5a"], ["lana", "#706c64"], ["lana", "#45464a"], ["tweed", "#5c4834"], ["tweed", "#6a5a44"], ["negro", "#1f1e21"], ["negro", "#2a272b"], ["verde", "#38452f"], ["verde", "#4a523a"],
    ["cuadros", "#4b3b2d"], ["cuadros", "#3d4339"], ["cuadros", "#57524b"], ["pana", "#4f3c2b"], ["marino", "#252c3c"], ["mostaza", "#6c5d35"], ["vino", "#422828"], ["camel", "#7b6749"], ["lana", "#57534c"], ["tweed", "#4c4a40"]];
  const varia = (hex, r) => { const c = new T3.Color(hex), hsl = {}; c.getHSL(hsl); c.setHSL(hsl.h + (r() - .5) * .03, hsl.s * (.75 + r() * .4), hsl.l * (.82 + r() * .3)); return "#" + c.getHexString() };
  function tela(c, r, tipo, base, x0, y0, w, h) {
    c.fillStyle = base; c.fillRect(x0, y0, w, h); const A = w * h;
    const lin = (x, y, x2, y2, col, lw) => { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2); c.stroke() };
    const mancha = (x, y, rr, col) => { const gr = c.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, col); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(x - rr, y - rr, 2 * rr, 2 * rr) };
    if (tipo === "tweed") { const bw = 12 + r() * 7 | 0; for (let x = x0; x < x0 + w; x += bw) { const d = ((x - x0) / bw | 0) % 2 ? 1 : -1; for (let y = y0 - bw; y < y0 + h + bw; y += 4) lin(x, y, x + bw, y + d * bw * .9, ((y - y0) / 4 | 0) % 2 ? "rgba(235,215,180,.1)" : "rgba(0,0,0,.2)", 2) }
      const FL = ["rgba(170,96,52,.55)", "rgba(220,206,170,.5)", "rgba(96,118,74,.5)", "rgba(20,14,8,.5)", "rgba(140,140,150,.45)"]; for (let i = 0; i < A / 80; i++) { c.fillStyle = FL[r() * FL.length | 0]; c.fillRect(x0 + r() * w, y0 + r() * h, 1.5 + r() * 2.5, 1 + r()) } }
    else if (tipo === "cuadros") { const p = 56 + r() * 70, ox = r() * p, oy = r() * p, ac = ["rgba(130,40,30,.22)", "rgba(60,80,110,.24)", "rgba(170,150,70,.2)", "rgba(40,70,40,.22)"][r() * 4 | 0];
      for (let k = x0 - ox; k < x0 + w; k += p) { c.fillStyle = "rgba(0,0,0,.26)"; c.fillRect(k, y0, p * .3, h); c.fillStyle = "rgba(215,195,150,.11)"; c.fillRect(k + p * .52, y0, p * .07, h); c.fillStyle = ac; c.fillRect(k + p * .78, y0, 3, h) }
      for (let k = y0 - oy; k < y0 + h; k += p) { c.fillStyle = "rgba(0,0,0,.22)"; c.fillRect(x0, k, w, p * .3); c.fillStyle = "rgba(215,195,150,.1)"; c.fillRect(x0, k + p * .52, w, p * .07); c.fillStyle = ac; c.fillRect(x0, k + p * .78, w, 3) }
      for (let k = -h; k < w; k += 3) lin(x0 + k, y0, x0 + k + h, y0 + h, "rgba(0,0,0,.07)", 1) }
    else if (tipo === "pana") { for (let x = x0; x < x0 + w; x += 7) { lin(x, y0, x, y0 + h, "rgba(0,0,0,.3)", 2); lin(x + 3.5, y0, x + 3.5, y0 + h, "rgba(220,190,150,.1)", 2.5) }
      for (let i = 0; i < 8; i++) mancha(x0 + r() * w, y0 + r() * h, 40 + r() * 90, "rgba(200,170,130,.12)") }
    else if (tipo === "negro" || tipo === "marino") { for (let k = -h; k < w; k += 3) lin(x0 + k, y0, x0 + k + h, y0 + h, (k / 3 | 0) % 2 ? "rgba(255,255,255,.035)" : "rgba(0,0,0,.18)", 1.3);
      for (let i = 0; i < A / 900; i++) { c.fillStyle = "rgba(190,184,170,.25)"; c.fillRect(x0 + r() * w, y0 + r() * h, 1 + r() * 3, 1) } }
    else { for (let i = 0; i < A / 2200; i++) mancha(x0 + r() * w, y0 + r() * h, 10 + r() * 40, r() < .5 ? "rgba(0,0,0,.12)" : "rgba(255,245,220,.07)");
      if (tipo === "verde" || tipo === "camel") for (let y = y0; y < y0 + h; y += 5) lin(x0, y, x0 + w, y + (r() - .5) * 2, "rgba(0,0,0,.1)", 1.5) }
    // fibras, bolitas, gastado, manchas
    for (let i = 0; i < A / 55; i++) { const x = x0 + r() * w, y = y0 + r() * h, a = r() * 6.3, l = 2 + r() * 6; lin(x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, r() < .5 ? "rgba(255,245,225,.07)" : "rgba(0,0,0,.1)", 1) }
    for (let i = 0; i < A / 650; i++) { c.fillStyle = "rgba(230,222,205,.2)"; c.beginPath(); c.arc(x0 + r() * w, y0 + r() * h, .8 + r() * 1.6, 0, 7); c.fill() }
    for (let i = 0; i < 3 + r() * 5; i++) mancha(x0 + r() * w, y0 + r() * h, 30 + r() * 150, r() < .5 ? "rgba(214,204,184,.13)" : "rgba(8,5,2,.32)");
    for (let i = 0; i < r() * 3; i++) { const x = x0 + r() * w, y = y0 + r() * h, rr = 8 + r() * 30; for (let k = 0; k < 5; k++) mancha(x + (r() - .5) * rr, y + (r() - .5) * rr + k * 6, rr * .6, "rgba(40,30,15,.18)") }   // manchas de agua/barro chorreadas
    // agujeros de polilla con borde deshilachado
    for (let i = 0; i < (r() * 4 | 0); i++) { const x = x0 + r() * w, y = y0 + r() * h, rr = 4 + r() * 13;
      for (let k = 0; k < 18; k++) { const a = r() * 6.3; lin(x, y, x + Math.cos(a) * rr * 1.5, y + Math.sin(a) * rr * 1.4, "rgba(200,190,165,.3)", 1) }
      c.fillStyle = "#070504"; c.beginPath(); c.ellipse(x, y, rr, rr * (.5 + r() * .5), r() * 3, 0, 7); c.fill() }
    // zurcido (trama de hilo)
    if (r() < .4) { const x = x0 + r() * (w - 60), y = y0 + r() * (h - 60), s = 26 + r() * 34, col = r() < .5 ? "rgba(214,204,176,.75)" : "rgba(150,140,120,.7)";
      for (let k = 0; k < s; k += 4) { lin(x + k, y, x + k + (r() - .5) * 2, y + s, col, 1.6); lin(x, y + k, x + s, y + k + (r() - .5) * 2, col, 1.6) } }
  }
  // hilo: costura en zigzag (o cruz o recta) sobre la línea (x1,y1)→(x2,y2)
  function costuraTex(c, r, x1, y1, x2, y2, est) { const L = Math.hypot(x2 - x1, y2 - y1); if (L < 10) return; const dx = (x2 - x1) / L, dy = (y2 - y1) / L, nx = -dy, ny = dx;
    const P = (s, o) => [x1 + dx * s + nx * o, y1 + dy * s + ny * o];
    c.lineCap = "round"; c.strokeStyle = "rgba(0,0,0,.62)"; c.lineWidth = 7; c.beginPath(); c.moveTo(...P(0, 0)); c.lineTo(...P(L, 0)); c.stroke();
    const paso = est === "recto" ? 15 : 19 + r() * 4, A = 8 + r() * 5, col = ["#d8cfb4", "#cfc8b8", "#e2d6b0", "#bdb5a2", "#c9b99a"][r() * 5 | 0];
    const hilo = (a, b) => { c.strokeStyle = "rgba(0,0,0,.55)"; c.lineWidth = 4.6; c.beginPath(); c.moveTo(a[0] + 2, a[1] + 2); c.lineTo(b[0] + 2, b[1] + 2); c.stroke();
      c.strokeStyle = col; c.lineWidth = 3.4; c.beginPath(); c.moveTo(...a); c.lineTo(...b); c.stroke(); c.strokeStyle = "rgba(255,255,240,.35)"; c.lineWidth = 1.1; c.beginPath(); c.moveTo(a[0] - .6, a[1] - .6); c.lineTo(b[0] - .6, b[1] - .6); c.stroke();
      c.fillStyle = "rgba(0,0,0,.7)"; for (const q of [a, b]) { c.beginPath(); c.arc(q[0], q[1], 1.8, 0, 7); c.fill() } };
    for (let s = 5; s < L - 5; s += paso) { if (r() < .03) continue; const j = (r() - .5) * 3;
      if (est === "zigzag") { hilo(P(s, -A + j), P(s + paso / 2, A + j)); hilo(P(s + paso / 2, A + j), P(s + paso, -A + j)) }
      else if (est === "cruz") { hilo(P(s, -A), P(s + paso * .8, A)); hilo(P(s, A), P(s + paso * .8, -A)) }
      else hilo(P(s, j * .3), P(s + paso * .6, j * .3)) } }
  function parches(W, H, seed) {
    const T = tex(W, H, (c, w, h) => { const r = rnd(seed); c.fillStyle = "#100e0d"; c.fillRect(0, 0, w, h);
      const P = []; let y = 0; while (y < h) { let rh = 170 + r() * 270; if (h - y - rh < 150) rh = h - y; let x = 0; while (x < w) { let rw = 140 + r() * 330; if (w - x - rw < 120) rw = w - x; P.push([x, y, rw, rh]); x += rw } y += rh }
      P.forEach(([x, y, pw, ph]) => { const [tipo, base] = PAL[r() * PAL.length | 0]; c.save(); c.beginPath();
        const borde = (ax, ay, bx, by, first) => { const n = Math.max(2, Math.hypot(bx - ax, by - ay) / 22 | 0); for (let k = first ? 0 : 1; k <= n; k++) { const f = k / n, px = mix(ax, bx, f) + (k && k < n ? (r() - .5) * 5 : 0), py = mix(ay, by, f) + (k && k < n ? (r() - .5) * 5 : 0); k ? c.lineTo(px, py) : c.moveTo(px, py) } };
        const i = 2; borde(x + i, y + i, x + pw - i, y + i, true); borde(x + pw - i, y + i, x + pw - i, y + ph - i); borde(x + pw - i, y + ph - i, x + i, y + ph - i); borde(x + i, y + ph - i, x + i, y + i); c.closePath(); c.clip();
        tela(c, r, tipo, varia(base, r), x - 4, y - 4, pw + 8, ph + 8);
        c.lineWidth = 16; c.strokeStyle = "rgba(0,0,0,.28)"; c.stroke(); c.lineWidth = 5; c.strokeStyle = "rgba(255,240,220,.05)"; c.stroke(); c.restore();
        // a veces un paño tiene un bolsillo/ojal pintado o una etiqueta vieja
        if (r() < .2) { const ex = x + 20 + r() * (pw - 80), ey = y + 20 + r() * (ph - 50); c.fillStyle = "rgba(220,210,180,.55)"; c.fillRect(ex, ey, 36, 18); c.strokeStyle = "rgba(60,50,30,.6)"; c.lineWidth = 1; c.strokeRect(ex + 3, ey + 3, 30, 12); for (let k = 0; k < 3; k++) { c.fillStyle = "rgba(60,40,30,.5)"; c.fillRect(ex + 6, ey + 6 + k * 3, 22 * r(), 1.2) } }
        if (r() < .3) { const ex = x + 20 + r() * (pw - 60), ey = y + 20 + r() * (ph - 40); c.fillStyle = "#0b0807"; c.beginPath(); c.ellipse(ex, ey, 11, 3.4, 0, 0, 7); c.fill(); c.strokeStyle = "rgba(200,190,160,.5)"; c.lineWidth = 2; c.stroke() } });
      // costuras: arriba e izquierda de cada paño (los de los bordes se cosen al dar la vuelta)
      P.forEach(([x, y, pw, ph]) => { const est = () => { const q = r(); return q < .62 ? "zigzag" : q < .85 ? "cruz" : "recto" };
        costuraTex(c, r, x, y, x + pw, y, est()); costuraTex(c, r, x, y, x, y + ph, est());
        // flecos en algunos bordes
        if (r() < .35) for (let k = 0; k < pw / 6; k++) { const fx = x + k * 6 + r() * 3; c.strokeStyle = r() < .5 ? "rgba(190,180,160,.45)" : "rgba(10,8,6,.5)"; c.lineWidth = 1.2; c.beginPath(); c.moveTo(fx, y + 4); c.lineTo(fx + (r() - .5) * 4, y + 9 + r() * 10); c.stroke() } });
      for (let i = 0; i < 900; i++) { c.strokeStyle = "rgba(225,215,190,.16)"; c.lineWidth = 1; const x = r() * w, yy = r() * h; c.beginPath(); c.moveTo(x, yy); c.bezierCurveTo(x + (r() - .5) * 30, yy + (r() - .5) * 30, x + (r() - .5) * 40, yy + (r() - .5) * 40, x + (r() - .5) * 50, yy + (r() - .5) * 50); c.stroke() }   // pelusa e hilos sueltos pintados
    }, [1, 1]); return T }
  const bumpDe = (T, k = 1.45, b = 30, rep = [1, 1]) => tex(T.image.width, T.image.height, (c, w, h) => { const s = T.image.getContext("2d").getImageData(0, 0, w, h).data, d = c.createImageData(w, h);
    for (let i = 0; i < w * h; i++) { const l = s[i * 4] * .3 + s[i * 4 + 1] * .59 + s[i * 4 + 2] * .11, v = Math.min(255, b + l * k); d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255 } c.putImageData(d, 0, 0) }, rep);
  const T_PAR = parches(2048, 2048, 4101), T_PAR_B = bumpDe(T_PAR);
  const T_PAR2 = parches(1024, 2048, 4202), T_PAR2_B = bumpDe(T_PAR2);
  // el abrigo ROJO (de la madre): paño rojo hervido, gastado en los bordes, polvo
  const T_ROJO = tex(1024, 1024, (c, w, h) => { const r = rnd(4303); c.fillStyle = "#9a1f19"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) { const x = r() * w, y = r() * h, rr = 20 + r() * 110, gr = c.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, r() < .5 ? "rgba(70,8,6,.28)" : "rgba(196,70,50,.18)"); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(x - rr, y - rr, 2 * rr, 2 * rr) }
    for (let k = -h; k < w; k += 3) { c.strokeStyle = (k / 3 | 0) % 2 ? "rgba(255,200,180,.04)" : "rgba(0,0,0,.12)"; c.lineWidth = 1.2; c.beginPath(); c.moveTo(k, 0); c.lineTo(k + h, h); c.stroke() }
    for (let i = 0; i < 26000; i++) { const x = r() * w, y = r() * h, a = r() * 6.3, l = 2 + r() * 5; c.strokeStyle = r() < .5 ? "rgba(255,170,150,.08)" : "rgba(30,0,0,.12)"; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke() }
    for (let i = 0; i < 1400; i++) { c.fillStyle = "rgba(240,190,170,.18)"; c.beginPath(); c.arc(r() * w, r() * h, .8 + r() * 1.4, 0, 7); c.fill() }
    for (let i = 0; i < 12; i++) { const x = r() * w, y = r() * h, rr = 30 + r() * 120, gr = c.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, "rgba(40,30,20,.25)"); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(x - rr, y - rr, 2 * rr, 2 * rr) } }, [1, 1]);
  const T_ROJO_B = bumpDe(T_ROJO, 2, 0);
  // el BOTÓN-cara: hueso con vetas de carey, anillos del torno, mugre en los agujeros, rajaduras con borde claro, rayones
  const BH = [[-.36, .36], [.36, .36], [.36, -.36], [-.36, -.36]], RB = 1.2, RH = .2;   // agujeros (en m del botón) y radios
  const T_HUESO = tex(1024, 1024, (c, w, h) => { const r = rnd(4404), U = x => (x / (2 * RB) + .5) * w, Vv = y => (.5 - y / (2 * RB)) * h; c.fillStyle = "#d6c9a8"; c.fillRect(0, 0, w, h);
    const blob = (x, y, rx, ry, a, col) => { c.save(); c.translate(x, y); c.rotate(a); c.scale(1, ry / rx); const gr = c.createRadialGradient(0, 0, 0, 0, 0, rx); gr.addColorStop(0, col); gr.addColorStop(.6, col.replace(/[\d.]+\)$/, m => (parseFloat(m) * .6).toFixed(2) + ")")); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(-rx, -rx, 2 * rx, 2 * rx); c.restore() };
    for (let i = 0; i < 140; i++) blob(r() * w, r() * h, 20 + r() * 110, 10 + r() * 60, r() * 3, ["rgba(160,104,44,.45)", "rgba(70,40,18,.55)", "rgba(196,150,82,.35)", "rgba(110,62,26,.5)", "rgba(235,222,190,.35)"][r() * 5 | 0]);
    for (let i = 0; i < 40; i++) blob(r() * w, r() * h, 6 + r() * 20, 4 + r() * 10, r() * 3, "rgba(40,22,10,.6)");
    for (let rr = 20; rr < w / 2; rr += 7 + r() * 5) { c.strokeStyle = r() < .5 ? "rgba(60,40,20,.07)" : "rgba(255,245,220,.07)"; c.lineWidth = 1.5 + r() * 2; c.beginPath(); c.arc(w / 2, h / 2, rr, 0, 7); c.stroke() }
    { const gr = c.createRadialGradient(w / 2, h / 2, w * .38, w / 2, h / 2, w * .5); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(.75, "rgba(40,26,12,.35)"); gr.addColorStop(1, "rgba(20,12,6,.7)"); c.fillStyle = gr; c.fillRect(0, 0, w, h) }
    BH.forEach(([x, y]) => { const px = U(x), py = Vv(y), gr = c.createRadialGradient(px, py, RH / (2 * RB) * w * .9, px, py, RH / (2 * RB) * w * 2.1); gr.addColorStop(0, "rgba(16,10,4,.85)"); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(px - 150, py - 150, 300, 300) });
    // hilo gastó un surco claro entre agujeros
    [[0, 2], [1, 3]].forEach(([a, b]) => { c.strokeStyle = "rgba(240,230,200,.18)"; c.lineWidth = 26; c.beginPath(); c.moveTo(U(BH[a][0]), Vv(BH[a][1])); c.lineTo(U(BH[b][0]), Vv(BH[b][1])); c.stroke() });
    const grieta = (x, y, a, len, wd, d) => { const P = [[x, y]]; for (let i = 0; i < len; i++) { a += (r() - .5) * .7; x += Math.cos(a) * 6; y += Math.sin(a) * 6; P.push([x, y]); if (d < 3 && r() < .045) grieta(x, y, a + (r() < .5 ? -1 : 1) * (.5 + r() * .8), len * .45 | 0, wd * .6, d + 1) }
      c.lineCap = "round"; c.lineJoin = "round"; c.strokeStyle = "rgba(255,244,214,.35)"; c.lineWidth = wd + 3; c.beginPath(); P.forEach((p, i) => i ? c.lineTo(p[0] + 1.5, p[1] + 1.5) : c.moveTo(p[0] + 1.5, p[1] + 1.5)); c.stroke();
      c.strokeStyle = "rgba(14,8,3,.92)"; c.lineWidth = wd; c.beginPath(); P.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke() };
    grieta(U(-1.05), Vv(.55), -.35, 80, 6, 0); grieta(U(.95), Vv(-.75), 2.6, 70, 5, 0); grieta(U(.15), Vv(1.15), 1.75, 60, 4.5, 0); grieta(U(-.7), Vv(-.95), -1.2, 40, 3.5, 1); grieta(U(1.1), Vv(.35), 3.3, 45, 3.5, 1);
    for (let i = 0; i < 90; i++) { c.strokeStyle = "rgba(30,20,10,.22)"; c.lineWidth = 1; let x = r() * w, y = r() * h, a = r() * 6.3; c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 8; k++) { a += (r() - .5) * 1.2; x += Math.cos(a) * 9; y += Math.sin(a) * 9; c.lineTo(x, y) } c.stroke() }   // craquelado
    for (let i = 0; i < 160; i++) { c.strokeStyle = r() < .5 ? "rgba(255,250,235,.22)" : "rgba(40,26,12,.25)"; c.lineWidth = .8 + r(); const x = r() * w, y = r() * h, a = r() * 6.3, l = 10 + r() * 50; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke() }
    for (let i = 0; i < 3000; i++) { c.fillStyle = r() < .5 ? "rgba(40,26,10,.12)" : "rgba(255,250,230,.1)"; c.fillRect(r() * w, r() * h, 2, 2) } });
  const T_HUESO_B = bumpDe(T_HUESO, 1.3, 20);
  // alambre oxidado
  const T_OXIDO = tex(256, 1024, (c, w, h) => { const r = rnd(4505); c.fillStyle = "#38332f"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { const x = r() * w, y = r() * h, rr = 6 + r() * 50, gr = c.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, ["rgba(122,62,26,.7)", "rgba(160,82,30,.6)", "rgba(90,46,20,.7)", "rgba(20,16,14,.5)", "rgba(110,100,90,.35)"][r() * 5 | 0]); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(x - rr, y - rr, 2 * rr, 2 * rr) }
    for (let i = 0; i < 5000; i++) { c.fillStyle = r() < .5 ? "rgba(0,0,0,.4)" : "rgba(190,110,50,.3)"; c.fillRect(r() * w, r() * h, 1.5 + r() * 2, 1.5 + r() * 2) }
    for (let i = 0; i < 60; i++) { c.strokeStyle = "rgba(120,60,24,.35)"; c.lineWidth = 2 + r() * 4; const x = r() * w, y = r() * h; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - .5) * 8, y + 30 + r() * 120); c.stroke() } }, [1, 1]);
  const T_OXIDO_B = bumpDe(T_OXIDO, 1.6, 10);
  // botón chico (cuatro agujeros, sobre el que tiñe el color de cada instancia)
  const T_BOTON = tex(256, 256, (c, w, h) => { const r = rnd(4606); c.fillStyle = "#c8c8c8"; c.fillRect(0, 0, w, h);
    const ring = (rr, col, lw) => { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.arc(128, 128, rr, 0, 7); c.stroke() };
    ring(118, "rgba(0,0,0,.5)", 12); ring(104, "rgba(255,255,255,.35)", 6); ring(92, "rgba(0,0,0,.25)", 6);
    for (let i = 0; i < 400; i++) { c.fillStyle = r() < .5 ? "rgba(0,0,0,.12)" : "rgba(255,255,255,.12)"; c.fillRect(r() * w, r() * h, 2, 2) }
    const H4 = [[-30, -30], [30, -30], [30, 30], [-30, 30]]; c.strokeStyle = "rgba(240,236,220,.9)"; c.lineWidth = 9; c.beginPath(); c.moveTo(128 + H4[0][0], 128 + H4[0][1]); c.lineTo(128 + H4[2][0], 128 + H4[2][1]); c.moveTo(128 + H4[1][0], 128 + H4[1][1]); c.lineTo(128 + H4[3][0], 128 + H4[3][1]); c.stroke();
    H4.forEach(([x, y]) => { c.fillStyle = "#0a0908"; c.beginPath(); c.arc(128 + x, 128 + y, 12, 0, 7); c.fill() }) });
  const T_MADERA = tex(256, 1024, (c, w, h) => { const r = rnd(4707); c.fillStyle = "#3d2c1e"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) { c.strokeStyle = r() < .5 ? "rgba(16,10,5,.4)" : "rgba(120,90,60,.22)"; c.lineWidth = 1 + r() * 3; const x = r() * w; c.beginPath(); c.moveTo(x, 0); for (let y = 0; y < h; y += 16) c.lineTo(x + Math.sin(y * .02 + i) * 4, y); c.stroke() }
    for (let i = 0; i < 9; i++) { c.fillStyle = "rgba(10,6,3,.7)"; c.fillRect(r() * w, r() * h, 2 + r() * 3, 40 + r() * 140) } }, [1, 1]);
  const T_NIEBLA = tex(256, 256, (c, w, h) => { const r = rnd(4808); c.clearRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) { const x = w / 2 + (r() - .5) * w * .62, y = h / 2 + (r() - .5) * h * .42, rr = 18 + r() * 60, gr = c.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, "rgba(255,255,255,.15)"); gr.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = gr; c.fillRect(0, 0, w, h) } });
  const T_PUNTO = tex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(.4, "rgba(255,255,255,.45)"); gr.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = gr; c.fillRect(0, 0, w, h) });

  // ======================= MATERIALES =======================
  const telaM = (map, bump, o = {}) => new T3.MeshPhysicalMaterial({ color: "#ffffff", map, bumpMap: bump, bumpScale: 2.4, roughness: .97, sheen: .85, sheenColor: new T3.Color("#6d6c78"), sheenRoughness: .7, side: T3.DoubleSide, ...o });
  const M_TELA = telaM(T_PAR, T_PAR_B), M_TELA2 = telaM(T_PAR2, T_PAR2_B, { color: "#e8e4dc" });
  const M_ROJO = new T3.MeshPhysicalMaterial({ color: "#ffffff", map: T_ROJO, bumpMap: T_ROJO_B, bumpScale: 2, roughness: .9, sheen: .7, sheenColor: new T3.Color("#d46048"), sheenRoughness: .6, emissive: "#3a0503", emissiveIntensity: .35, side: T3.DoubleSide });
  const M_HUESO = new T3.MeshPhysicalMaterial({ color: "#ffffff", map: T_HUESO, bumpMap: T_HUESO_B, bumpScale: 3, roughness: .5, clearcoat: .4, clearcoatRoughness: .45, emissive: "#14100a", emissiveIntensity: .4 });
  const M_HUECO = new T3.MeshBasicMaterial({ color: "#000000" });
  const M_OXIDO = new T3.MeshStandardMaterial({ color: "#ffffff", map: T_OXIDO, bumpMap: T_OXIDO_B, bumpScale: 2.5, roughness: .72, metalness: .5 });
  const M_HILO = new T3.MeshStandardMaterial({ color: "#958d78", roughness: .92 });
  const M_HILO_R = new T3.MeshStandardMaterial({ color: "#e4dcc0", roughness: .9, emissive: "#2a261c", emissiveIntensity: .5 });
  const M_HILO_N = new T3.MeshStandardMaterial({ color: "#1c1612", roughness: .8 });
  const M_BOTON = new T3.MeshPhysicalMaterial({ color: "#ffffff", map: T_BOTON, roughness: .45, clearcoat: .5, clearcoatRoughness: .4 });
  const M_MADERA = new T3.MeshStandardMaterial({ color: "#ffffff", map: T_MADERA, bumpMap: T_MADERA, bumpScale: 2, roughness: .85 });
  const M_CUERO = new T3.MeshStandardMaterial({ color: "#3a2a1e", roughness: .62, bumpMap: T_OXIDO_B, bumpScale: 1, side: T3.DoubleSide });
  const M_LATON = new T3.MeshStandardMaterial({ color: "#8a744a", roughness: .42, metalness: .75, bumpMap: T_OXIDO_B, bumpScale: 1 });
  const M_OSCURO = new T3.MeshStandardMaterial({ color: "#0b0908", roughness: 1, side: T3.DoubleSide });

  // ======================= MEDIDAS (m). Los de bloques miden ≈ 2 =======================
  const LT = 6.0, LS = 5.7, LA = .55, HIP = LT + LS + LA;            // muslo, canilla, tobillo → cadera a 11,45
  const A_PASO = .3, PASO = 4 * (LT + LS) * Math.sin(A_PASO);         // m por ciclo de dos pasos (≈ 12,9)
  const UA = 5.2, FA = 5.0;                                           // percha del brazo y del antebrazo
  const LF = [1.55, 1.95, 2.2, 1.7], DEDO = 2;                         // largo de los cuatro ganchos-dedo; el que golpea es el 2
  const pieza = (geo, mat, par, x = 0, y = 0, z = 0, sombra = true) => { const m = new T3.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = sombra; m.receiveShadow = true; par.add(m); return m };
  const grupo = (par, x = 0, y = 0, z = 0) => { const g = new T3.Group(); g.position.set(x, y, z); par.add(g); return g };

  const g = new T3.Group(); g.name = "tejedora"; g.visible = false; scene.add(g);
  const cuerpo = grupo(g), caderas = grupo(cuerpo, 0, HIP, 0), pelvis = grupo(caderas), faldaG = grupo(caderas);
  const col1 = grupo(pelvis, 0, .2, 0), T1G = grupo(col1), col2 = grupo(col1, 0, 4.0, 0), T2G = grupo(col2);
  const cuello = grupo(col2, 0, 4.45, .4), cabeza = grupo(cuello, 0, 1.6, .2);
  const J = { muslo: [], rodilla: [], tobillo: [], hombro: [], codo: [], muneca: [], dedos: [[], []] };

  // ======================= TORSO: capas de abrigos como tejas (cada ruedo es un escalón) =======================
  const HEM1 = [{ y: .7, a: .16, f: 3, p: .3 }, { y: 2.1, a: .2, f: 2, p: 1.7 }, { y: 3.35, a: .12, f: 4, p: 2.5 }];
  const HEM2 = [{ y: .1, a: .14, f: 3, p: 4.1 }, { y: 1.45, a: .1, f: 2, p: .6 }, { y: 2.75, a: .16, f: 3, p: 5.2 }];
  const hemY = (H, th) => H.y + H.a * Math.sin(th * H.f + H.p) + .07 * Math.sin(th * 7 + H.p * 3);
  const tejas = (L, th, y) => { let d = 0; for (const H of L) { const s = y - hemY(H, th); d += .17 * S_(-.07, 0, s) * (1 - .45 * S_(0, .9, s)) } return d };
  const bulto = (th, y, sd) => { const x = Math.sin(th), z = Math.cos(th); return (fbm(x * 1.6 + sd, y * .55, z * 1.6) - .5) * .5 + .05 * Math.sin(th * 11 + 1.5 * Math.sin(y * .9 + sd)) + .025 * Math.sin(th * 23 + y * 2.1) };
  function sup1(th, y) { const k = S_(-.2, 4.2, y), c = Math.cos(th), s = Math.sin(th); let rx = mix(1.3, 1.62, k), rz = mix(1.0, 1.25, k);
    const d = bulto(th, y, 1) + tejas(HEM1, th, y), cierre = Math.sqrt(Math.max(0, 1 - (Math.min(0, y + .3) / .75) ** 2));
    return [s * (rx + d) * cierre, y, (c * (rz + d) - .06 * k) * cierre] }
  function sup2(th, y) { const c = Math.cos(th), s = Math.sin(th), k = S_(-.8, 1.4, y), dh = Math.min(Math.abs(th - PI / 2), Math.abs(th + PI / 2), Math.abs(th - 1.5 * PI));
    let rx = mix(1.62, 1.78, k) + .22 * ex2(((y - 3.2) / .55) ** 2), rz = mix(1.25, 1.35, k); const cierre = S_(3.4, 4.9, y); rx *= 1 - .6 * cierre; rz *= 1 - .48 * cierre;
    const joroba = c < 0 ? .62 * ex2(((y - 2.6) / 1.1) ** 2) * c * c : 0, hombro = .34 * ex2((dh / .32) ** 2 + ((y - 3.35) / .38) ** 2);
    const d = bulto(th, y, 4) + tejas(HEM2, th, y) * (1 - cierre) + hombro;
    return [s * (rx + d), y, c * (rz + d + joroba) - .05] }
  const nrm = (f, th, y) => { const e = .01, a = f(th, y), b = f(th + e, y), cc = f(th, y + e); return new T3.Vector3().crossVectors(V3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), V3(cc[0] - a[0], cc[1] - a[1], cc[2] - a[2])).normalize() };
  pieza(loft(128, 80, (u, v) => sup1(u * TAU, 4.5 - v * 5.55), { ru: 2.2, rv: 1.6 }), M_TELA, T1G);
  pieza(loft(140, 96, (u, v) => sup2(u * TAU, 5.0 - v * 5.9), { ru: 2.4, rv: 1.9, ou: .37, ov: .21 }), M_TELA, T2G);

  // ---------- puntadas 3D (hilo grueso claro, en zigzag) sobre las costuras de un cuerpo: InstancedMesh por grupo
  const G_PUNTADA = new T3.CylinderGeometry(.034, .034, 1, 6, 1); G_PUNTADA.translate(0, .5, 0);
  const matPuntada = (a, b, n, grosor = 1) => { const d = V3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), L = d.length(); q1.setFromUnitVectors(Y_, d.normalize()); return new T3.Matrix4().compose(V3(a[0], a[1], a[2]), q1.clone(), new T3.Vector3(grosor, L, grosor)) };
  function puntadas(sup, curva, s0, s1, paso, A, out, off = .05) { let sg = 1;
    for (let s = s0; s < s1 - paso * .5; s += paso) { const [t0, y0] = curva(s), [t1, y1] = curva(s + paso), a = V3(sup(t0, y0)), b = V3(sup(t1, y1)), n = nrm(sup, t0, y0), tg = b.clone().sub(a).normalize(), bn = new T3.Vector3().crossVectors(n, tg).normalize();
      const p0 = a.clone().addScaledVector(bn, -A * sg).addScaledVector(n, off), p1 = b.clone().addScaledVector(bn, A * sg).addScaledVector(n, off); out.push(matPuntada(p0.toArray(), p1.toArray())); sg = -sg } }
  const instanciar = (geo, mat, L, par, colores) => { const m = new T3.InstancedMesh(geo, mat, Math.max(1, L.length)); L.forEach((M, i) => m.setMatrixAt(i, M)); m.count = L.length; if (colores) { const c = new T3.Color(); colores.forEach((h, i) => m.setColorAt(i, c.set(h))) } m.castShadow = true; m.receiveShadow = true; par.add(m); return m };
  { const L1 = [], L2 = [];
    HEM1.forEach(H => puntadas(sup1, s => [s, hemY(H, s) + .08], 0, TAU, .085, .05, L1, .03));
    [.9, 2.4, 3.6, 5.1].forEach((th, i) => puntadas(sup1, s => [th + .05 * Math.sin(s * 2 + i), s], -.1, 4.2, .17, .07, L1, .03));
    HEM2.forEach(H => puntadas(sup2, s => [s, hemY(H, s) + .08], 0, TAU, .085, .05, L2, .03));
    [1.2, 2.2, 3.4, 4.3, 5.3].forEach((th, i) => puntadas(sup2, s => [th + .06 * Math.sin(s * 1.7 + i), s], -.5, 3.9, .17, .07, L2, .03));
    puntadas(sup2, s => [s, 3.85 + .1 * Math.sin(s * 3)], 0, TAU, .09, .06, L2, .03);
    instanciar(G_PUNTADA, M_HILO, L1, T1G); instanciar(G_PUNTADA, M_HILO, L2, T2G) }

  // ---------- botones de todos los tamaños (lathe con la cara en xy, mirando a +z): InstancedMesh por grupo
  const G_BOTON = (() => { const P = [[0, .2], [.6, .22], [.82, .3], [.98, .26], [1, .12], [.9, 0], [0, 0]].map(([x, y]) => new T3.Vector2(Math.max(.001, x), y)), geo = new T3.LatheGeometry(P, 22);
    geo.rotateX(PI / 2); const p = geo.attributes.position, uv = geo.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) * .5 + .5, p.getY(i) * .5 + .5); geo.computeVertexNormals(); return geo })();
  const COL_BOT = ["#c4b9a2", "#1b1917", "#5a3a22", "#8a6a3a", "#3c3b40", "#a8915e", "#cbbb9b", "#2e2a24", "#6e2c22", "#a89e88"];
  function botones(sup, n, zona, seed, out, cols, tam = [.08, .3]) { const r = rnd(seed);
    for (let i = 0; i < n; i++) { const th = zona.th0 + r() * (zona.th1 - zona.th0), y = zona.y0 + r() * (zona.y1 - zona.y0); if (zona.evita && zona.evita(th, y)) continue;
      const p = V3(sup(th, y)), nn = nrm(sup, th, y), s = r() < .08 ? tam[1] * 1.3 : tam[0] + r() ** 2 * (tam[1] - tam[0]), suelto = r() < .06;
      q1.setFromUnitVectors(new T3.Vector3(0, 0, 1), nn); if (suelto) q1.multiply(new T3.Quaternion().setFromEuler(new T3.Euler(1.3, 0, 0)));
      q1.multiply(new T3.Quaternion().setFromEuler(new T3.Euler((r() - .5) * .3, (r() - .5) * .3, r() * TAU)));
      p.addScaledVector(nn, suelto ? .05 : .02); if (suelto) p.y -= s * .9;
      out.push(new T3.Matrix4().compose(p, q1.clone(), new T3.Vector3(s, s, s * .9))); cols.push(COL_BOT[r() * COL_BOT.length | 0]) } }
  // la franja por donde se trepa (izquierda, th ≈ .55–.95) y la del abrigo rojo (centro) quedan con botones grandes y correas aparte
  const TREPA_TH = (u) => mix(.9, .62, u);
  const enRojo = (th, y) => { const t = th > PI ? th - TAU : th; return Math.abs(t) < .34 && y > .55 && y < 2.35 };

  // ======================= FALDÓN: colas de abrigo que cuelgan de la cintura (dos capas), ruedo comido y jirones =======================
  const FALDA_L = 5.4, FALDA2_L = 6.6;
  const gFaldon = (L, gap0, gapK, R0, R1, seed, ou) => { const r = rnd(seed), FR = Array.from({ length: 141 }, () => .03 + .9 * r() ** 2.4);
    const body = loft(140, 64, (u, v) => { const gap = gap0 + gapK * v, th = gap + u * (TAU - 2 * gap), y = 1.3 - v * L, c = Math.cos(th), sn = Math.sin(th);
      const Rx = mix(R0[0], R1[0], S_(0, 1, v)), Rz = mix(R0[1], R1[1], S_(0, 1, v)), A = .02 + .24 * S_(.04, 1, v),
        plie = A * (Math.sin(th * 7 + 1.3 + v * .8) * .7 + Math.sin(th * 13 + .4) * .3) + .08 * (fbm(sn * 2 + seed, v * 3, c * 2) - .5) + .12 * ex2(((v - .35) / .03) ** 2) * S_(.2, -.2, c) * 0,
        capa = .1 * S_(.2, .24, v) * (1 - S_(.24, .5, v)), deshi = S_(.92, 1, v) * FR[Math.round(u * 140)];
      return [sn * (Rx + plie + capa), y - deshi, c * (Rz + plie + capa) - .1] }, { ru: 2.5, rv: 3, ou });
    const tiras = []; for (let i = 0; i < 40; i++) { const gap = gap0 + gapK, th = gap + r() * (TAU - 2 * gap), Lt = .4 + r() * 1.8, wd = .1 + r() * .3, x0 = Math.sin(th) * (R1[0] + .05), z0 = Math.cos(th) * (R1[1] + .05) - .1, y0 = 1.3 - L - .05;
      tiras.push(loft(2, 10, (u, v) => { const tw = (u - .5) * wd * (1 - .6 * v), tx = Math.cos(th), tz = -Math.sin(th); return [x0 + tx * tw + Math.sin(th) * .06 * v, y0 - v * Lt, z0 + tz * tw + Math.cos(th) * .06 * v + .05 * Math.sin(v * 5 + i)] }, { ru: .2, rv: .4, ou: r(), ov: r() })) }
    return fusionar([body, ...tiras]) };
  const gF1 = gFaldon(FALDA_L, .5, .55, [1.5, 1.2], [2.15, 1.8], 51, 0), gF2 = gFaldon(FALDA2_L, 1.45, .2, [1.4, 1.12], [1.95, 1.65], 52, .5);
  const FALDA = pieza(gF1, M_TELA, faldaG), FALDA_B = Float32Array.from(gF1.attributes.position.array);
  const FALDA2 = pieza(gF2, M_TELA2, faldaG), FALDA2_B = Float32Array.from(gF2.attributes.position.array);
  const RUEDO = []; for (let i = 0; i <= 140; i += 4) RUEDO.push(64 * 141 + i);   // vértices del ruedo de la capa de afuera (para colgarles hilos)

  // ======================= PIERNAS: mangas enrolladas, rodilla abultada, pie de trapo =======================
  const rollo = (y, ph, k = .11) => k * ex2(((fr(y / .85 + ph) - .5) / .13) ** 2);
  const gMuslo = tubo(.6, LT + .95, 44, 72, (v, th) => { const y = .6 - v * (LT + .95), r = .64 - .14 * v + rollo(y, .08 * Math.sin(th * 2)) + .035 * Math.sin(th * 5 + y * 2.3) + .07 * (fbm(Math.sin(th) * 1.5, y * .6, Math.cos(th) * 1.5) - .5); return [r, r * 1.05, 0] }, { ru: .6, rv: 1.4, ou: .13 });
  const gCanilla = tubo(.35, LS + .5, 40, 66, (v, th) => { const y = .35 - v * (LS + .5), r = .5 - .1 * v + rollo(y, .3 + .1 * Math.sin(th * 3), .1 + .1 * S_(.7, 1, v)) + .2 * S_(.86, 1, v) + .03 * Math.sin(th * 6 + y * 3) + .06 * (fbm(Math.sin(th) * 1.5 + 4, y * .6, Math.cos(th) * 1.5) - .5); return [r, r * 1.05, 0] }, { ru: .55, rv: 1.3, ou: .61 });
  const gRodilla = loft(30, 22, (u, v) => { const th = u * TAU, ph = v * PI, d = .7 + .14 * (fbm(Math.sin(th) * 2 + 9, Math.cos(ph) * 2, Math.cos(th) * 2) - .5) + .04 * Math.sin(th * 7 + ph * 5); return [Math.sin(ph) * Math.sin(th) * d, Math.cos(ph) * d * .85, Math.sin(ph) * Math.cos(th) * d * 1.05 + .06] }, { ru: .5, rv: .5, ou: .3 });
  const gPie = loft(36, 46, (u, v) => { const th = u * TAU, z = -.75 + v * 2.7, e = Math.pow(Math.sin(PI * Math.min(1, .03 + v * .97)), .32), w = (.62 + .1 * Math.sin(PI * v * .8) - .2 * S_(.6, 1, v)) * e, hh = (.95 - .55 * S_(0, .5, v)) * e,
    c = Math.cos(th), sy = c < 0 ? c * .2 : c, lump = .06 * (fbm(Math.sin(th) * 2, z * 1.3, c * 2) - .5) + .03 * Math.sin(z * 9 + th * 3); return [Math.sin(th) * (w + lump), -LA + .02 + hh * .5 * (sy + 1) * .9 + lump * .5, z] }, { ru: .5, rv: .9, ou: .8 });
  const gPuno = tubo(.15, .5, 36, 10, (v, th) => { const r = .62 + .06 * Math.sin(th * 9) + .05 * Math.sin(v * PI) - .04 * v; return [r, r * 1.05, .05] }, { ru: .5, rv: .1 });
  for (const s of [0, 1]) { const sg = s ? -1 : 1, M = grupo(caderas, sg * 1.2, 0, 0), R = grupo(M, 0, -LT, 0), T = grupo(R, 0, -LS, 0);
    pieza(gMuslo, s ? M_TELA2 : M_TELA, M); pieza(gCanilla, s ? M_TELA : M_TELA2, R); pieza(gRodilla, M_TELA2, R); pieza(gPie, M_TELA, T); pieza(gPuno, M_TELA2, T);
    const Lm = [], Lc = [], Bm = [], Bc = [], cm = [], cc = [];
    const supM = (th, y) => { const v = (.6 - y) / (LT + .95), r = .64 - .14 * v + rollo(y, .08 * Math.sin(th * 2)) + .035 * Math.sin(th * 5 + y * 2.3); return [Math.sin(th) * r, y, Math.cos(th) * r * 1.05] };
    const supC = (th, y) => { const v = (.35 - y) / (LS + .5), r = .5 - .1 * v + .2 * S_(.86, 1, v); return [Math.sin(th) * r, y, Math.cos(th) * r * 1.05] };
    puntadas(supM, q => [q * .55 + s, -q], .3, LT - .2, .22, .09, Lm, .1); puntadas(supC, q => [-q * .5 + 2 + s, -q], .2, LS - .4, .22, .09, Lc, .09);
    botones(supM, 14, { th0: 0, th1: TAU, y0: -LT + .5, y1: .2 }, 60 + s, Bm, cm); botones(supC, 10, { th0: 0, th1: TAU, y0: -LS + .6, y1: -.3 }, 62 + s, Bc, cc, [.07, .22]);
    instanciar(G_PUNTADA, M_HILO, Lm, M); instanciar(G_PUNTADA, M_HILO, Lc, R); instanciar(G_BOTON, M_BOTON, Bm, M, cm); instanciar(G_BOTON, M_BOTON, Bc, R, cc);
    J.muslo.push(M); J.rodilla.push(R); J.tobillo.push(T) }

  // ======================= BRAZOS: perchas de alambre colgadas de un travesaño de madera =======================
  const RW = .1;
  function percha(L, W, hookR = .32) { const parts = [];
    // gancho alrededor del pivote (la barra de la percha anterior o el travesaño), en el plano y-z
    const G = []; for (let i = 0; i <= 18; i++) { const a = -PI / 2 + i / 18 * 1.72 * PI; G.push(V3(0, hookR * Math.sin(a), hookR * Math.cos(a))) }
    G.unshift(V3(0, -hookR - .28, 0)); parts.push(tuboCurva(G, 10, 40, v => RW * (v > .93 ? mix(1, .45, (v - .93) / .07) : 1), { ru: .1, rv: 1 }));
    // cuello retorcido: dos alambres en hélice
    const y0 = -hookR - .2, y1 = y0 - .7; for (const k of [0, 1]) { const P = []; for (let i = 0; i <= 24; i++) { const f = i / 24, y = mix(y0, y1, f), a = k * PI + f * TAU * 3.2; P.push(V3(Math.cos(a) * .085, y, Math.sin(a) * .085)) } parts.push(tuboCurva(P, 8, 60, () => RW * .82, { ru: .1, rv: 1.2 })) }
    // el triángulo estirado
    const Pt = [[0, y1 + .05, .03], [-.12, y1 - .3, .03], [-W * .42, -L + .7, .01], [-W * .5, -L + .13, 0], [-W * .42, -L - .02, 0], [0, -L - .02, 0], [W * .42, -L - .02, 0], [W * .5, -L + .13, 0], [W * .42, -L + .7, -.01], [.12, y1 - .3, -.03], [0, y1 + .05, -.03]].map(p => V3(...p));
    parts.push(tuboCurva(Pt, 10, 160, (v, th) => RW * (1 + .08 * Math.sin(v * 90)), { ru: .1, rv: 4 }));
    return fusionar(parts) }
  function ganchoDedo(L) { const parts = [], rb = .15;
    const G = []; for (let i = 0; i <= 14; i++) { const a = -PI / 2 + i / 14 * 1.8 * PI; G.push(V3(0, rb * Math.sin(a), rb * Math.cos(a))) } G.unshift(V3(0, -rb - .2, 0)); parts.push(tuboCurva(G, 8, 30, v => RW * .9 * (v > .92 ? mix(1, .5, (v - .92) / .08) : 1)));
    const yb = -L + .32, P = [[0, -rb - .2, 0], [0, -L * .4, .02], [0, yb + .15, 0], [0, yb - .1, .04], [0, yb - .27, .18], [0, yb - .3, .36], [0, yb - .18, .54], [0, yb + .05, .62], [0, yb + .3, .58], [0, yb + .46, .46]].map(p => V3(...p));
    parts.push(tuboCurva(P, 10, 70, v => RW * 1.05 * (v > .86 ? mix(1, .25, (v - .86) / .14) : 1)));
    return fusionar(parts) }
  const PUNTA_DEDO = L => [0, -L + .32 - .3, .36];   // el lomo del gancho: lo que golpea
  // travesaño (palo de escoba viejo) que cruza los hombros y asoma a los costados, con trapos atados
  const HOMBRO_X = 2.55, HOMBRO_Y = 3.25, HOMBRO_Z = -.1;
  pieza(mover(new T3.CylinderGeometry(.17, .19, 2 * HOMBRO_X + .7, 14, 6), MX(0, HOMBRO_Y + .2, HOMBRO_Z, 0, 0, PI / 2)), M_MADERA, col2);
  for (const s of [0, 1]) { const sg = s ? -1 : 1; for (let k = 0; k < 3; k++) pieza(mover(new T3.TorusGeometry(.24 + k * .02, .08, 8, 18), MX(sg * (HOMBRO_X - .55 - k * .17), HOMBRO_Y + .2, HOMBRO_Z, 0, PI / 2 + (k - 1) * .25, 0)), k % 2 ? M_TELA : M_TELA2, col2);
    pieza(loft(2, 10, (u, v) => [sg * (HOMBRO_X - .7) + (u - .5) * .25, HOMBRO_Y + .1 - v * 1.5, HOMBRO_Z + .2 + .1 * Math.sin(v * 4)], { ru: .1, rv: .5, ou: .4 * s }), M_TELA, col2) }
  const gPerchaA = percha(UA, 1.15), gPerchaB = percha(FA, .95, .3), gDedos = LF.map(ganchoDedo);
  for (const s of [0, 1]) { const sg = s ? -1 : 1, H = grupo(col2, sg * HOMBRO_X, HOMBRO_Y + .2, HOMBRO_Z), C = grupo(H, 0, -UA, 0), W = grupo(C, 0, -FA, 0);
    pieza(gPerchaA, M_OXIDO, H); pieza(gPerchaB, M_OXIDO, C);
    // trapo anudado en el codo
    pieza(mover(new T3.TorusGeometry(.2, .09, 8, 16), MX(.15, 0, 0, 0, PI / 2, 0)), M_TELA2, C); pieza(loft(2, 10, (u, v) => [.25 + (u - .5) * .2, -v * 1.1, .1 * Math.sin(v * 5)], { ru: .1, rv: .4, ou: .7 }), M_TELA2, C);
    const F = LF.map((L, i) => { const G_ = grupo(W, (i - 1.5) * .26 * (s ? -1 : 1), 0, 0); pieza(gDedos[i], M_OXIDO, G_); return G_ });
    J.hombro.push(H); J.codo.push(C); J.muneca.push(W); J.dedos[s] = F }

  // ======================= CUELLO (bufanda enroscada), CABEZA de trapo, BOTÓN-cara, BOCA-bolsillo =======================
  pieza(tubo(1.45, 2.1, 40, 40, (v, th) => { const y = 1.45 - v * 2.1, r = .92 - .1 * v + .1 * ex2(((fr(y * 1.15 + th / TAU) - .5) / .2) ** 2) + .05 * (fbm(Math.sin(th) * 2, y, Math.cos(th) * 2) - .5); return [r, r, 0] }, { ru: .7, rv: .8, ou: .2 }), M_TELA2, cuello);
  const HC = [0, .55, -.15], HR = [1.38, 1.8, 1.18];
  const gCab = (() => { const geo = new T3.SphereGeometry(1, 96, 72), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { let dx = p.getX(i), dy = p.getY(i), dz = p.getZ(i); const lon = Math.atan2(dx, dz);
      let sx = HR[0], sy = HR[1], sz = HR[2]; const pin = S_(.62, 1, dy); sx *= 1 - .55 * pin; sz *= 1 - .55 * pin;
      let d = .14 * (fbm(dx * 1.8 + 3, dy * 1.8, dz * 1.8) - .5) + .05 * Math.sin(lon * 14) * S_(.45, 1, dy) + .035 * Math.sin(lon * 9 + dy * 6);
      let x = dx * (sx + d), y = dy * (sy + d), z = dz * (sz + d); if (dz > .25) z = Math.min(z, .62 + (z - .62) * .2) * 1 + 0;   // de frente: aplastado donde va el botón
      p.setXYZ(i, HC[0] + x, HC[1] + y + (dy > .9 ? .25 * S_(.9, 1, dy) : 0), HC[2] + z) }
    geo.computeVertexNormals(); return geo })();
  pieza(gCab, M_TELA, cabeza);
  // nudo arriba (la bolsa atada) y puntadas que la cierran
  pieza(mover(new T3.TorusKnotGeometry(.3, .13, 64, 10, 2, 3), MX(0, HC[1] + HR[1] + .05, HC[2], .3, 0, .2)), M_TELA2, cabeza);
  { const L = [], sc = (th, y) => { const dy = (y - HC[1]) / HR[1], k = Math.sqrt(Math.max(0, 1 - dy * dy)), pin = 1 - .55 * S_(.62, 1, dy); return [Math.sin(th) * HR[0] * k * pin, y, HC[2] + Math.min(Math.cos(th) * HR[2] * k * pin, .62)] };
    [1.3, 2.4, 3.9, 5.0].forEach(th => puntadas(sc, q => [th, q], HC[1] - 1.5, HC[1] + 1.55, .2, .08, L, .06)); instanciar(G_PUNTADA, M_HILO, L, cabeza) }
  const BOTON = grupo(cabeza, 0, .95, .8); BOTON.rotation.x = -.12;
  // el BOTÓN: malla polar densa (cara cóncava suave, borde levantado y redondeado, mella), cuatro agujeros de verdad con labio y pared
  const ROUT = a => RB - .16 * ex2(((a - 2.25) / .07) ** 2) - .06 * ex2(((a - 2.42) / .035) ** 2) - .04 * ex2(((a - 5.4) / .05) ** 2) + .006 * Math.sin(a * 37);
  const ZF = r => { const q = r / RB; return .24 + .08 * ex2(((q - .87) / .07) ** 2) - .11 * Math.max(0, 1 - (q / .8) ** 2) - .2 * S_(.94, 1, q) ** 1.5 };
  const gBoton = (() => { const NR = 70, NA = 200, P = [], UV = [], I = [], idx = new Int32Array((NR + 1) * (NA + 1)).fill(-1);
    for (let i = 0; i <= NR; i++) for (let j = 0; j <= NA; j++) { const a = j / NA * TAU, q = i / NR, r = q * ROUT(a), x = Math.cos(a) * r, y = Math.sin(a) * r;
      idx[i * (NA + 1) + j] = P.length / 3; P.push(x, y, ZF(q * RB)); UV.push(x / (2 * RB) + .5, y / (2 * RB) + .5) }
    const enHueco = (x, y) => BH.some(([hx, hy]) => Math.hypot(x - hx, y - hy) < RH);
    for (let i = 0; i < NR; i++) for (let j = 0; j < NA; j++) { const a = idx[i * (NA + 1) + j], b = idx[i * (NA + 1) + j + 1], c = idx[(i + 1) * (NA + 1) + j], d = idx[(i + 1) * (NA + 1) + j + 1];
      const cx = (P[a * 3] + P[d * 3]) / 2, cy = (P[a * 3 + 1] + P[d * 3 + 1]) / 2; if (enHueco(cx, cy)) continue; I.push(a, c, b, b, c, d) }
    const face = new T3.BufferGeometry(); face.setAttribute("position", new T3.Float32BufferAttribute(P, 3)); face.setAttribute("uv", new T3.Float32BufferAttribute(UV, 2)); face.setIndex(I); face.computeVertexNormals();
    const lado = loft(NA, 6, (u, v) => { const a = u * TAU, r = ROUT(a) * (1 - .02 * Math.sin(v * PI)); const z = mix(ZF(RB), -.06, v); return [Math.cos(a) * r, Math.sin(a) * r, z] }, { ru: 3, rv: .1 });
    const atras = new T3.CircleGeometry(RB, 64); atras.rotateY(PI); atras.translate(0, 0, -.06);
    const L = [face, lado, atras.toNonIndexed()];
    BH.forEach(([hx, hy]) => { const z0 = ZF(Math.hypot(hx, hy));
      const pared = new T3.CylinderGeometry(RH, RH, z0 + .1, 28, 1, true); pared.rotateX(PI / 2); pared.translate(hx, hy, (z0 - .1) / 2); const n = pared.attributes.normal; for (let i = 0; i < n.count; i++) n.setXYZ(i, -n.getX(i), -n.getY(i), -n.getZ(i)); const ix = pared.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i]; ix[i] = ix[i + 2]; ix[i + 2] = t }
      const labio = new T3.TorusGeometry(RH + .01, .035, 10, 32); labio.translate(hx, hy, z0 - .005); L.push(pared, labio) });
    L.forEach(q => { if (!q.attributes.uv) q.setAttribute("uv", new T3.Float32BufferAttribute(new Float32Array(q.attributes.position.count * 2), 2)) });
    const pp = L.map(q => q.index ? q : q);
    const out = fusionar(pp); const pa = out.attributes.position, uv = out.attributes.uv; for (let i = 0; i < pa.count; i++) uv.setXY(i, pa.getX(i) / (2 * RB) + .5, pa.getY(i) / (2 * RB) + .5); return out })();
  pieza(gBoton, M_HUESO, BOTON);
  BH.forEach(([x, y]) => { pieza(new T3.CircleGeometry(RH + .05, 24), M_HUECO, BOTON, x, y, -.08, false) });   // el fondo negro de cada agujero
  // hilo grueso en cruz pasando por los agujeros (tres hebras retorcidas por diagonal) y dos cabos que cuelgan
  { const parts = []; [[0, 2], [1, 3]].forEach(([a, b], k) => { for (let h = 0; h < 2; h++) { const ph = h / 2 * TAU, A = BH[a], B = BH[b], P = [];
      for (let i = 0; i <= 20; i++) { const f = i / 20, x = mix(A[0], B[0], f), y = mix(A[1], B[1], f), z = -.05 + .36 * Math.sin(PI * Math.min(1, Math.max(0, (f - .02) / .96))) ** .5 + k * .06, tw = .04;
        const nx = -(B[1] - A[1]), ny = B[0] - A[0], nl = Math.hypot(nx, ny); P.push(V3(x + nx / nl * tw * Math.cos(ph + f * 9), y + ny / nl * tw * Math.cos(ph + f * 9), z + tw * Math.sin(ph + f * 9))) }
      parts.push(tuboCurva(P, 7, 60, () => .04)) } }); pieza(fusionar(parts), M_HILO_R, BOTON) }
  const CABOS = grupo(BOTON, BH[3][0], BH[3][1], .25);
  { const parts = []; for (let h = 0; h < 2; h++) { const P = []; for (let i = 0; i <= 10; i++) { const f = i / 10; P.push(V3(.06 * h + .05 * Math.sin(f * 7 + h), -f * (1.5 + h * .5), .12 * Math.sin(f * 3 + h) + .1 * f)) } parts.push(tuboCurva(P, 6, 30, v => .045 * (1 - .4 * v))) } pieza(fusionar(parts), M_HILO_R, CABOS) }
  // BOCA: un bolsillo de ribete cosido; al gritar los labios se separan, las puntadas se cortan, adentro negro
  const BOCA = grupo(cabeza, 0, -.5, .9); BOCA.rotation.x = .3;
  const gLabio = tuboCurva([V3(-.82, 0, -.12), V3(-.4, .03, .0), V3(0, 0, .04), V3(.4, .03, .0), V3(.82, 0, -.12)], 12, 60, v => .12 + .035 * Math.sin(v * 31) + .025 * Math.sin(v * 73) - .06 * S_(.85, 1, Math.abs(v - .5) * 2));
  const LABIO_A = pieza(gLabio, M_TELA2, BOCA), LABIO_B = pieza(gLabio, M_TELA2, BOCA);
  const HUECO_BOCA = pieza(new T3.SphereGeometry(1, 24, 16), M_HUECO, BOCA, 0, 0, -.2, false);
  const PUNTOS_BOCA = Array.from({ length: 9 }, (_, i) => pieza(new T3.CylinderGeometry(.03, .03, 1, 5), M_HILO, BOCA, (i - 4) * .17, 0, .06, false));

  // ======================= CUELLOS DE ABRIGO parados alrededor de la nuca =======================
  const CUELLOS = [{ a: PI, w: 1.0, h: 3.1 }, { a: PI - .95, w: .8, h: 2.3 }, { a: PI + .95, w: .8, h: 2.5 }, { a: 1.75, w: .65, h: 1.7 }, { a: -1.75, w: .65, h: 1.5 }, { a: .75, w: .5, h: 1.15 }, { a: -.75, w: .5, h: 1.05 }].map((C, i) => {
    const P = grupo(col2, Math.sin(C.a) * 1.15, 4.05, Math.cos(C.a) * 1.0 - .05); P.rotation.y = C.a; const r = rnd(90 + i), Fr = Array.from({ length: 31 }, () => r() ** 2 * .35);
    pieza(loft(30, 22, (u, v) => { const th = (u - .5) * C.w, R = .2 + .55 * v * v, y = v * C.h - (v > .93 ? Fr[Math.round(u * 30)] : 0) - .3 * (2 * u - 1) ** 2 * v; return [Math.sin(th) * (1.15 + R), y, Math.cos(th) * (1.0 + R) - 1.0 + .1 * Math.sin(u * 9) * v] }, { ru: .5, rv: .6, ou: r(), ov: r() }), i % 2 ? M_TELA2 : M_TELA, P);
    P.userData.rest = 0; return P });

  // ======================= MANGAS VACÍAS que cuelgan (cadenas de tres tramos) =======================
  const gTramo = (L, r0, r1, puno, ou) => tubo(.2, L + .2, 22, 16, (v, th) => { const r = mix(r0, r1, v) + .04 * Math.sin(th * 4 + v * 9) + (puno ? .08 * S_(.75, .9, v) * (1 - S_(.95, 1, v)) : 0); return [r * .62, r, 0] }, { ru: .4, rv: .5, ou });
  const MANGAS = [{ G: T2G, sup: sup2, th: 1.78, y: 1.2, L: 4.6 }, { G: T2G, sup: sup2, th: TAU - 1.72, y: .95, L: 4.4 }, { G: T2G, sup: sup2, th: PI - .62, y: 2.25, L: 3.6 }, { G: T2G, sup: sup2, th: PI + .8, y: 2.6, L: 4.1 },
    { G: T1G, sup: sup1, th: 1.5, y: 2.8, L: 4.3 }, { G: T1G, sup: sup1, th: TAU - 1.38, y: 2.0, L: 3.9 }, { G: T1G, sup: sup1, th: PI + .1, y: 3.4, L: 5.2 }, { G: T2G, sup: sup2, th: TAU - .95, y: -.1, L: 3.1 }].map((M, i) => {
    const p = V3(M.sup(M.th, M.y)), n = nrm(M.sup, M.th, M.y), R = grupo(M.G, ...p.addScaledVector(n, .12).toArray()); const segL = M.L / 3, S = [];
    pieza(new T3.SphereGeometry(.42, 16, 12), i % 2 ? M_TELA : M_TELA2, R).scale.set(1, .8, .7);
    let par = R; for (let k = 0; k < 3; k++) { const G_ = grupo(par, 0, k ? -segL : 0, 0); pieza(gTramo(segL, .4 - k * .03, .37 - k * .03, k === 2, (i * .37 + k * .23) % 1),(i + k) % 2 ? M_TELA2 : M_TELA, G_);
      if (k === 2) pieza(new T3.CircleGeometry(.3, 14), M_OSCURO, G_, 0, -segL - .15, 0, false).rotation.x = PI / 2; S.push(G_); par = G_ }
    return { R, S, n: n.clone(), f: .5 + (i * .37 % 1) * .5, ph: i * 1.9 } });

  // ======================= BOLSILLOS, CORREAS (la escalera para trepar) y botones del torso =======================
  function bolsillo(sup, th, y, w, h, r, parts, partsF) { const th0 = th - w / 2, y1 = y + h;
    parts.push(loft(10, 10, (u, v) => { const t = th0 + u * w, yy = y1 - v * h, p = sup(t, yy), n = nrm(sup, t, yy), b = .05 + .08 * Math.sin(PI * u) * Math.sin(PI * v); return [p[0] + n.x * b, p[1] + n.y * b, p[2] + n.z * b] }, { ru: .3, rv: .3, ou: r(), ov: r() }));
    if (r() < .75) partsF.push(loft(10, 6, (u, v) => { const t = th0 - .02 + u * (w + .04), yy = y1 + .05 - v * h * .38, p = sup(t, yy), n = nrm(sup, t, yy), b = .16 + .04 * v - (v > .9 ? .03 * Math.sin(u * 30) : 0); return [p[0] + n.x * b, p[1] + n.y * b, p[2] + n.z * b] }, { ru: .3, rv: .2, ou: r(), ov: r() }));
    else partsF.push(loft(8, 2, (u, v) => { const t = th0 + .04 + u * (w - .08), yy = y1 - .06 - v * .08, p = sup(t, yy), n = nrm(sup, t, yy); return [p[0] + n.x * .14, p[1] + n.y * .14, p[2] + n.z * .14] })) }
  function correa(sup, thc, y, w, parts, hebillas, G) { parts.push(loft(18, 3, (u, v) => { const t = thc - w / 2 + u * w, yy = y + .14 - v * .28, p = sup(t, yy), n = nrm(sup, t, yy), b = .1 + .02 * Math.sin(PI * u); return [p[0] + n.x * b, p[1] + n.y * b, p[2] + n.z * b] }, { ru: 1, rv: .1 }));
    const p = V3(sup(thc + w * .18, y)), n = nrm(sup, thc + w * .18, y); q1.setFromUnitVectors(new T3.Vector3(0, 0, 1), n); hebillas.push(new T3.Matrix4().compose(p.addScaledVector(n, .17), q1.clone(), new T3.Vector3(1, 1, 1))) }
  const G_HEBILLA = (() => { const sh = new T3.Shape(); sh.moveTo(-.2, -.24); sh.lineTo(.2, -.24); sh.lineTo(.2, .24); sh.lineTo(-.2, .24); sh.closePath(); const h = new T3.Path(); h.moveTo(-.13, -.17); h.lineTo(-.13, .17); h.lineTo(.13, .17); h.lineTo(.13, -.17); h.closePath(); sh.holes.push(h);
    const geo = new T3.ExtrudeGeometry(sh, { depth: .05, bevelEnabled: true, bevelThickness: .02, bevelSize: .02, bevelSegments: 2 }); return fusionar([geo.toNonIndexed(), new T3.CylinderGeometry(.025, .025, .34, 6).rotateZ(0).translate(0, 0, .06).toNonIndexed()].map(q => { q.computeVertexNormals(); return q })) })();
  { const r = rnd(77), B1 = [], C1 = [], B2 = [], C2 = [], P1 = [], P1f = [], P2 = [], P2f = [], K1 = [], K2 = [], H1 = [], H2 = [];
    const evita1 = (th, y) => Math.abs(th - TREPA_TH(y / 6.5)) < .2, evita2 = (th, y) => enRojo(th, y) || Math.abs(th - TREPA_TH(.6 + y / 4.5)) < .18;
    botones(sup1, 70, { th0: 0, th1: TAU, y0: -.2, y1: 4.1, evita: evita1 }, 71, B1, C1); botones(sup2, 95, { th0: 0, th1: TAU, y0: -.6, y1: 4.3, evita: evita2 }, 72, B2, C2);
    // en la franja de trepar: botones grandes como apoyos de pie
    for (let k = 0; k < 9; k++) { const u = (k + .5) / 9, onT1 = u < .6, sup = onT1 ? sup1 : sup2, y = onT1 ? mix(.05, 3.9, u / .6) : mix(-.35, 1.6, (u - .6) / .4), th = TREPA_TH(u) + (k % 2 ? .13 : -.13), p = V3(sup(th, y)), n = nrm(sup, th, y);
      q1.setFromUnitVectors(new T3.Vector3(0, 0, 1), n); (onT1 ? B1 : B2).push(new T3.Matrix4().compose(p.addScaledVector(n, .03), q1.clone(), new T3.Vector3(.34, .34, .3))); (onT1 ? C1 : C2).push(COL_BOT[k % 3 ? 0 : 3]) }
    [[1.6, .5], [2.75, 1.4], [3.7, .4], [4.6, 1.7], [5.5, .9], [1.3, 2.6]].forEach(([th, y]) => bolsillo(sup1, th, y, .5 + r() * .25, .75 + r() * .3, r, P1, P1f));
    [[1.55, .3], [4.75, .6], [2.4, 1.7], [3.9, 1.9], [5.6, 2.2]].forEach(([th, y]) => bolsillo(sup2, th, y, .45 + r() * .2, .7 + r() * .25, r, P2, P2f));
    [.15, 1.0, 1.85, 2.7, 3.55].forEach((y, k) => correa(sup1, TREPA_TH(y / 6.5), y + .3, .6, K1, H1));
    [-.2, .55].forEach(y => correa(sup2, TREPA_TH(.6 + y / 4.5) + .03, y + .3, .52, K2, H2));
    instanciar(G_BOTON, M_BOTON, B1, T1G, C1); instanciar(G_BOTON, M_BOTON, B2, T2G, C2);
    pieza(fusionar([...P1, ...P1f]), M_TELA2, T1G); pieza(fusionar([...P2, ...P2f]), M_TELA2, T2G);
    pieza(fusionar(K1), M_CUERO, T1G); pieza(fusionar(K2), M_CUERO, T2G); instanciar(G_HEBILLA, M_LATON, H1, T1G); instanciar(G_HEBILLA, M_LATON, H2, T2G) }

  // ======================= EL ABRIGO ROJO cosido en el pecho =======================
  const RJ = { y0: .78, y1: 2.2 }, RJ_C = V3(sup2(0, 1.5)).add(new T3.Vector3(0, 0, .15));
  const anchoR = y => { const k = (y - RJ.y0) / (RJ.y1 - RJ.y0); return k > .84 ? mix(.27, .12, eIO((k - .84) / .16)) : mix(.28, .25, k) + .015 * Math.sin(k * 20) };
  const radial = th => V3(Math.sin(th), 0, Math.cos(th));
  const enPecho = (th, y, off) => { const p = V3(sup2(th, y)); return p.addScaledVector(radial(th), off) };
  const ROJO = new T3.Group(); ROJO.name = "abrigoRojo"; T2G.add(ROJO); ROJO.position.copy(RJ_C);
  const ROJO_REST = { p: RJ_C.clone() };
  { const parts = [], dark = [], r = rnd(88), c0 = RJ_C;
    const rel = p => [p.x - c0.x, p.y - c0.y, p.z - c0.z];
    parts.push(loft(40, 44, (u, v) => { const y = RJ.y1 - v * (RJ.y1 - RJ.y0) - (v > .95 ? .05 * hsh(Math.round(u * 40), 3, 9) : 0), w = anchoR(y), th = (u - .5) * 2 * w, off = .1 + .07 * Math.sin(PI * u) * (.5 + .5 * v) + .025 * Math.sin(u * 26 + v * 3) * v + .03 * (u > .47 && u < .53 ? -1 : 0);
      return rel(enPecho(th, y, off)) }, { ru: .9, rv: .9 }));
    // solapas
    for (const s of [-1, 1]) parts.push(loft(8, 12, (u, v) => { const y = RJ.y1 - .05 - v * .65, th = s * (.02 + u * (.17 - .1 * v)), off = .2 + .04 * u - .02 * v; return rel(enPecho(th, y, off)) }, { ru: .2, rv: .3, ou: .5 }));
    // cuello
    parts.push(loft(16, 4, (u, v) => { const th = (u - .5) * .3, y = RJ.y1 + .1 - v * .2, off = .17 + .1 * (1 - v); return rel(enPecho(th, y, off)) }, { ru: .3, rv: .1 }));
    // mangas plegadas sobre el pecho (como abrazándose)
    for (const s of [-1, 1]) { const P = [enPecho(s * .25, 2.02, .2), enPecho(s * .3, 1.7, .23), enPecho(s * .31, 1.3, .22), enPecho(s * .29, .98, .21), enPecho(s * .26, .82, .2)].map(p => V3(...rel(p)));
      parts.push(tuboCurva(P, 12, 30, v => .085 + .015 * Math.sin(v * 14) + .02 * S_(.85, 1, v) * (1 - S_(.97, 1, v)), { ru: .3, rv: .5 })) }
    // bolsillos
    for (const s of [-1, 1]) parts.push(loft(6, 2, (u, v) => rel(enPecho(s * (.08 + u * .13), 1.05 - v * .07, .2)), { ru: .1, rv: .05 }));
    // botones oscuros al medio
    [1.85, 1.55, 1.25].forEach(y => { const p = enPecho(.015, y, .2), geo = G_BOTON.clone(); geo.applyMatrix4(new T3.Matrix4().compose(V3(...rel(p)), new T3.Quaternion().setFromUnitVectors(new T3.Vector3(0, 0, 1), radial(.015)), new T3.Vector3(.07, .07, .07))); dark.push(geo.toNonIndexed()) });
    pieza(fusionar(parts), M_ROJO, ROJO); pieza(fusionar(dark.map(q => { q.computeVertexNormals(); return q })), new T3.MeshStandardMaterial({ color: "#151110", roughness: .85 }), ROJO) }
  // las 18 PUNTADAS que lo sujetan: bajan por la izquierda, cruzan el ruedo y suben por la derecha (orden del corte)
  const PUNTOS_N = 18, PUNTOS_P = [];
  { const L = []; for (let i = 0; i < PUNTOS_N; i++) { const f = i / (PUNTOS_N - 1); let th, y, inw;
      if (f < .38) { y = mix(RJ.y1 - .15, RJ.y0 + .08, f / .38); th = -anchoR(y); inw = 1 } else if (f < .62) { y = RJ.y0 + .02; th = mix(-.22, .22, (f - .38) / .24); inw = 2 } else { y = mix(RJ.y0 + .08, RJ.y1 - .15, (f - .62) / .38); th = anchoR(y); inw = 3 }
      const a = inw === 2 ? enPecho(th, y + .07, .15) : enPecho(th - Math.sign(th) * .035, y, .13), b = inw === 2 ? enPecho(th, y - .1, .05) : enPecho(th + Math.sign(th) * .05, y + .04, .07);
      L.push(matPuntada(a.toArray(), b.toArray(), null, 1.4)); PUNTOS_P.push([a, b]) }
    var PUNTOS = instanciar(G_PUNTADA, M_HILO_N, L, T2G) }
  const G_CABO = new T3.CylinderGeometry(.06, .02, 1, 5, 1); G_CABO.translate(0, .5, 0);
  const CABOS_R = new T3.InstancedMesh(G_CABO, M_HILO_N, PUNTOS_N * 2); CABOS_R.count = 0; T2G.add(CABOS_R);
  const PUNTOS_M = []; for (let i = 0; i < PUNTOS_N; i++) { const m = new T3.Matrix4(); PUNTOS.getMatrixAt(i, m); PUNTOS_M.push(m) }

  // ======================= AURA: niebla a los pies, hilos que flotan, pelusa, polvo de las pisadas, luz fría =======================
  const AURA = grupo(g); AURA.visible = false;
  const NIEBLA = Array.from({ length: 26 }, (_, i) => { const s = new T3.Sprite(new T3.SpriteMaterial({ map: T_NIEBLA, color: "#76838f", transparent: true, opacity: .3, depthWrite: false, fog: true }));
    s.userData = { a: i * 2.4, r: 2 + (i * .37 % 1) * 14, sp: .02 + (i * .61 % 1) * .04, y: .5 + (i * .29 % 1) * 1.8, sc: 9 + (i * .43 % 1) * 9 }; AURA.add(s); return s });
  const G_HEBRA = tuboCurva(Array.from({ length: 9 }, (_, i) => V3(.08 * Math.sin(i * 1.3), -i * .16, .06 * Math.cos(i * 1.7))), 4, 24, v => .016);
  const HEBRAS_N = 70, HEBRAS = new T3.InstancedMesh(G_HEBRA, M_HILO_R, HEBRAS_N); HEBRAS.frustumCulled = false; AURA.add(HEBRAS);
  const PELUSA = (() => { const N = 900, p = new Float32Array(N * 3); const geo = new T3.BufferGeometry(); geo.setAttribute("position", new T3.BufferAttribute(p, 3));
    const m = new T3.Points(geo, new T3.PointsMaterial({ map: T_PUNTO, color: "#c8ccd0", size: .1, transparent: true, opacity: .5, depthWrite: false, blending: T3.AdditiveBlending })); m.frustumCulled = false; AURA.add(m); return m })();
  const PUFFS = Array.from({ length: 16 }, (_, i) => { const s = new T3.Sprite(new T3.SpriteMaterial({ map: T_NIEBLA, color: "#8c867a", transparent: true, opacity: 0, depthWrite: false, fog: true })); scene.add(s); s.visible = false; return s });
  // hilos que cuelgan de los ruedos (siempre, no solo con el aura): del faldón, de los puños de las mangas vacías y del botón
  const COLG_N = RUEDO.length + MANGAS.length * 3, COLGANTES = new T3.InstancedMesh(G_HEBRA, M_HILO, COLG_N); COLGANTES.frustumCulled = false; g.add(COLGANTES);
  const LUZ_FRIA = new T3.PointLight("#9cb6e4", 0, 46, 1.4); LUZ_FRIA.position.set(0, 9, 7); g.add(LUZ_FRIA);
  const LUZ_PIES = new T3.PointLight("#6f8db8", 0, 26, 1.5); LUZ_PIES.position.set(0, 1.2, 4.5); g.add(LUZ_PIES);
  const _m4 = new T3.Matrix4(), _q = new T3.Quaternion(), _s = new T3.Vector3();
  function auraTick(t, k) { NIEBLA.forEach((s, i) => { const d = s.userData, a = d.a + t * d.sp * (i % 2 ? 1 : -1), rr = d.r + 1.2 * Math.sin(t * .15 + i); s.position.set(Math.cos(a) * rr, d.y + .2 * Math.sin(t * .4 + i), Math.sin(a) * rr + 1.5); s.scale.set(d.sc * 1.7, d.sc * .4, 1); s.material.rotation = .15 * Math.sin(t * .1 + i); s.material.opacity = .34 * k * (.7 + .3 * Math.sin(t * .3 + i * 1.7)) });
    for (let i = 0; i < HEBRAS_N; i++) { const a = i * 2.399 + t * (.03 + (i % 5) * .008), rr = 3 + (i * .618 % 1) * 9, h = ((i * .377 % 1) * 21 + t * (.12 + (i % 4) * .05)) % 21;
      _q.setFromEuler(new T3.Euler(Math.sin(t * .5 + i) * 1.2, t * .3 + i, Math.cos(t * .4 + i * 1.3) * 1.2)); _m4.compose(_s.set(Math.cos(a) * rr, h, Math.sin(a) * rr + 1), _q, v1.set(1, 1 + (i % 3) * .6, 1)); HEBRAS.setMatrixAt(i, _m4) } HEBRAS.instanceMatrix.needsUpdate = true;
    const P = PELUSA.geometry.attributes.position; for (let i = 0; i < P.count; i++) { const a = i * 2.399, rr = 1 + (i * .618 % 1) * 13, h = ((i * .377 % 1) * 22 + t * (.05 + (i % 5) * .02)) % 22;
      P.setXYZ(i, Math.cos(a + t * .02) * rr + .3 * Math.sin(t * .3 + i), h, Math.sin(a + t * .02) * rr + 1 + .3 * Math.cos(t * .27 + i)) } P.needsUpdate = true; PELUSA.material.opacity = .5 * k;
    // polvo en cada pisada (cuando camina): nubecitas que se abren y se apagan en 2 s
    PUFFS.forEach(s => s.visible = false);
    if (ST.andando) for (const s of [0, 1]) { const p = (ST.fase + s * PI) % TAU, desde = ((p - PI / 2) % TAU + TAU) % TAU, edad = desde / TAU * ST.ciclo; if (edad > 2.2) continue;
      J.tobillo[s].updateWorldMatrix(true, false); const fw = J.tobillo[s].getWorldPosition(v2), u = edad / 2.2;
      for (let k2 = 0; k2 < 8; k2++) { const sp = PUFFS[s * 8 + k2], a = k2 / 8 * TAU + s; sp.visible = true; sp.position.set(fw.x + Math.cos(a) * (.6 + 2.4 * Math.sqrt(u)), g.position.y + .25 + .5 * u, fw.z + Math.sin(a) * (.6 + 2.4 * Math.sqrt(u)) + .6); const sc = 1.5 + 3 * Math.sqrt(u); sp.scale.set(sc * 1.4, sc * .6, 1); sp.material.opacity = .45 * k * S_(0, .08, u) * (1 - u) } } }

  // ======================= POSE =======================
  const CABEZA_ROLL = .24;   // la cabeza torcida hacia un lado, siempre
  const ST = { t: 0, aura: false, inflar: 0, boca: 0, andando: false, fase: 0, ciclo: 5, viento: 1, grito: 0, rojoCae: 0 };
  function REST() { cuerpo.position.set(0, 0, 0); cuerpo.rotation.set(0, 0, 0); caderas.position.set(0, HIP, 0); caderas.rotation.set(0, 0, 0); pelvis.rotation.set(.06, 0, 0); faldaG.rotation.set(0, 0, 0);
    col1.rotation.set(.16, 0, 0); col2.rotation.set(.84, 0, .07); cuello.rotation.set(-.18, 0, 0); cabeza.rotation.set(0, 0, 0); T1G.scale.set(1, 1, 1); T2G.scale.set(1, 1, 1);
    for (const s of [0, 1]) { J.muslo[s].rotation.set(-.02, 0, s ? .03 : -.03); J.rodilla[s].rotation.set(.06, 0, 0); J.tobillo[s].rotation.set(0, 0, 0); J.tobillo[s].userData.extra = 0; J.hombro[s].rotation.set(0, 0, 0); J.codo[s].rotation.set(0, 0, 0); J.muneca[s].rotation.set(0, 0, 0) }
    ST.inflar = 0; ST.boca = 0; ST.andando = false; ST.grito = 0; ST.yaw = 0; ROJO_reset() }
  function apuntarW(G, dir) { G.parent.updateWorldMatrix(true, false); G.parent.getWorldQuaternion(q1).invert(); v1.copy(dir).normalize().applyQuaternion(q1); G.quaternion.setFromUnitVectors(ABAJO, v1) }
  function ik2(s, T, pole) { const H = J.hombro[s], C = J.codo[s]; H.updateWorldMatrix(true, false); const S0 = H.getWorldPosition(v2), d = v3.copy(T).sub(S0), D = Math.min(d.length(), (UA + FA) * .999), dn = d.normalize();
    const a = Math.acos(Math.max(-1, Math.min(1, (UA * UA + D * D - FA * FA) / (2 * UA * D)))), ax = v4.crossVectors(dn, pole).normalize(), up = dn.clone().applyAxisAngle(ax, a);
    apuntarW(H, up); C.rotation.set(0, 0, 0); C.updateWorldMatrix(true, false); const E = C.getWorldPosition(new T3.Vector3()); apuntarW(C, v1.copy(T).sub(E)) }
  const aMundo = (x, y, z) => new T3.Vector3(x, y, z).applyQuaternion(g.quaternion);
  function cabezaNivel(pitch, roll = 0, yaw = 0) { g.updateMatrixWorld(true); g.getWorldQuaternion(q2); q2.multiply(new T3.Quaternion().setFromEuler(new T3.Euler(pitch, yaw, roll, "YXZ")));
    cabeza.parent.getWorldQuaternion(q1).invert(); cabeza.quaternion.copy(q1.multiply(q2)) }
  // brazos colgando del travesaño (las perchas pesan): dirección en el marco de la raíz + vaivén; los ganchos-dedo cuelgan por su peso
  function brazosColgando(t, abre = .2, balanceo = [0, 0], soloLado = null) {
    for (const s of [0, 1]) { if (soloLado !== null && s !== soloLado) continue; const sg = s ? -1 : 1, w = ST.viento;
      apuntarW(J.hombro[s], aMundo(sg * abre + .02 * Math.sin(t * .4 + s), -1, .3 + (s ? .08 : 0) + balanceo[s] + .03 * w * Math.sin(t * .31 + s * 2)));
      J.codo[s].rotation.set(-.1 - .05 * Math.sin(t * .27 + s), 0, sg * .03); J.muneca[s].rotation.set(0, 0, 0); dedosColgando(t, s) } }
  function dedosColgando(t, s, extra = null) { J.dedos[s].forEach((F, i) => { if (extra && extra(F, i)) return; F.rotation.set(0, 0, 0); apuntarW(F, aMundo(.06 * Math.sin(t * .7 + i * 1.3 + s), -1, .1 + .07 * Math.sin(t * .53 + i * 2.1 + s * 3) * ST.viento)) }) }
  const piesPlanos = () => { for (const s of [0, 1]) J.tobillo[s].rotation.x = -(caderas.rotation.x + J.muslo[s].rotation.x + J.rodilla[s].rotation.x) + (J.tobillo[s].userData.extra || 0) };
  const extLeg = (f, k) => LT * Math.cos(f) + LS * Math.cos(f - k) + LA;
  const avLeg = (f, k) => LT * Math.sin(f) + LS * Math.sin(f - k);
  // el faldón sigue a las piernas, se mece con el viento y se infla al gritar
  function faldaDeforma(t) { const fL = -J.muslo[0].rotation.x, fR = -J.muslo[1].rotation.x, kL = J.rodilla[0].rotation.x, kR = J.rodilla[1].rotation.x, inf = ST.inflar, w = ST.viento;
    faldaG.rotation.x = pelvis.rotation.x * .3 - .02;
    const def = (geo, B, L) => { const P = geo.attributes.position.array; for (let i = 0; i < P.length; i += 3) { const x = B[i], y = B[i + 1], z = B[i + 2], dep = Math.max(0, -y + .6), wL = S_(-.9, .9, x), wR = 1 - wL;
        const f = wL * fL + wR * fR, k = wL * kL + wR * kR, pie = Math.min(dep, LT), canilla = Math.max(0, dep - LT); let dz = Math.sin(f) * pie + Math.sin(f - k) * canilla; dz = (dz > 0 ? (z > 0 ? 1.05 : .5) : (z < 0 ? 1 : .5)) * dz * .9;
        const q = dep / L, sway = (.25 * Math.sin(t * .9 + x * .5 + y * .2) + .12 * Math.sin(t * 2.1 + x * 1.3 - y * .4)) * q * w, rr = Math.hypot(x, z) || 1, fl = inf * q * (1.1 + .4 * Math.sin(t * 13 + x * 3 + y));
        P[i] = x + x / rr * fl + .08 * q * w * Math.sin(t * 1.3 + y * .3); P[i + 1] = y + Math.min(1.5, dep * (1 - Math.cos(f)) * .5) + fl * .3; P[i + 2] = z + dz + sway + z / rr * fl } geo.attributes.position.needsUpdate = true; geo.computeVertexNormals() };
    def(FALDA.geometry, FALDA_B, FALDA_L); def(FALDA2.geometry, FALDA2_B, FALDA2_L) }
  // mangas vacías, cuellos y bocas: lo que el viento y el grito mueven
  function telaTick(t) { const inf = ST.inflar, w = ST.viento; g.updateMatrixWorld(true);
    MANGAS.forEach((M, i) => { const out = M.n.clone().transformDirection(M.R.parent.matrixWorld); out.y = 0; out.normalize();
      const sw = .22 * w * Math.sin(t * M.f + M.ph) + .1 * w * Math.sin(t * M.f * 2.3 + M.ph * 2), lag = ST.andando ? .18 * Math.sin(ST.fase - .9 + i) : 0;
      const dir = new T3.Vector3(0, -1, 0).addScaledVector(out, .2 + sw + inf * (1.3 + .5 * Math.sin(t * 9 + i))).add(aMundo(lag * .5, 0, .12 * w * Math.sin(t * .6 + i) - lag)); dir.y += inf * .6;
      apuntarW(M.S[0], dir); M.S[1].rotation.set(.15 * Math.sin(t * M.f * 1.4 + M.ph + 1) * (w + inf * 2) + .1, 0, .12 * Math.sin(t * M.f * 1.1 + M.ph) * (w + inf * 2)); M.S[2].rotation.set(.2 * Math.sin(t * M.f * 1.9 + M.ph + 2) * (w + inf * 3) + .1, 0, .15 * Math.sin(t * M.f * 1.6 + M.ph + 1) * (w + inf * 3)) });
    CUELLOS.forEach((P, i) => { P.rotation.x = -.05 * Math.sin(t * 1.1 + i * 1.7) * w - .5 * inf * (1 + .3 * Math.sin(t * 11 + i)) - .08 });
    CABOS.rotation.set(.25 * Math.sin(t * .8) * w + inf * .8 * Math.sin(t * 12), 0, .2 * Math.sin(t * .6 + 1) * w);
    // boca
    const b = ST.boca; LABIO_A.position.y = .06 + .32 * b; LABIO_B.position.y = -.06 - .62 * b; LABIO_A.scale.x = LABIO_B.scale.x = 1 + .18 * b; LABIO_B.position.z = .06 * b;
    HUECO_BOCA.scale.set(.66 + .1 * b, .03 + .44 * b, .3 * Math.min(1, b * 4)); HUECO_BOCA.position.set(0, -.15 * b, -.24); HUECO_BOCA.visible = b > .01;
    PUNTOS_BOCA.forEach((P, i) => { const roto = b > .12 + (i * .37 % 1) * .4, gap = LABIO_A.position.y - LABIO_B.position.y, x = (i - 4) * .17 * LABIO_A.scale.x; P.position.x = x;
      if (roto) { const L = .18 + (i * .53 % 1) * .3; P.scale.set(1, L, 1); P.position.y = LABIO_A.position.y - .08 - L / 2; P.rotation.z = .3 * Math.sin(ST.t * 9 + i) * b } else { P.scale.set(1, gap + .06, 1); P.position.y = (LABIO_A.position.y + LABIO_B.position.y) / 2; P.rotation.z = 0 } });
    // inflarse: la tela del torso se hincha (y tiembla)
    T1G.scale.set(1 + .1 * inf + .015 * inf * Math.sin(t * 17), 1, 1 + .12 * inf + .015 * inf * Math.sin(t * 19)); T2G.scale.set(1 + .12 * inf + .02 * inf * Math.sin(t * 15), 1 + .02 * inf, 1 + .15 * inf + .02 * inf * Math.sin(t * 21));
    faldaDeforma(t); colgantes(t) }
  function colgantes(t) { g.updateMatrixWorld(true); const gi = new T3.Matrix4().copy(g.matrixWorld).invert(), P = FALDA.geometry.attributes.position, w = ST.viento, inf = ST.inflar; let n = 0;
    const put = (wp, len, i) => { const p = wp.applyMatrix4(gi); _q.setFromEuler(new T3.Euler(.25 * Math.sin(t * 1.3 + i) * w + inf * 1.2 * Math.sin(t * 11 + i), i, .25 * Math.sin(t * 1.1 + i * 2) * w)); _m4.compose(p, _q, v1.set(1.6, len, 1.6)); COLGANTES.setMatrixAt(n++, _m4) };
    FALDA.updateWorldMatrix(true, false); RUEDO.forEach((ix, i) => put(V3(P.getX(ix), P.getY(ix), P.getZ(ix)).applyMatrix4(FALDA.matrixWorld), 1.4 + (i * .37 % 1) * 2.2, i));
    MANGAS.forEach((M, i) => { const G_ = M.S[2]; G_.updateWorldMatrix(true, false); for (let k = 0; k < 3; k++) put(V3((k - 1) * .2, -M.L / 3 - .2, 0).applyMatrix4(G_.matrixWorld), .8 + k * .5, i * 3 + k + 100) });
    COLGANTES.count = n; COLGANTES.instanceMatrix.needsUpdate = true }

  // ======================= ABRIGO ROJO: corte de puntadas y caída =======================
  function ROJO_reset() { if (ROJO.parent !== T2G) { T2G.add(ROJO) } ROJO.position.copy(ROJO_REST.p); ROJO.rotation.set(0, 0, 0); ROJO.scale.set(1, 1, 1); ROJO.visible = true;
    PUNTOS.count = PUNTOS_N; for (let i = 0; i < PUNTOS_N; i++) PUNTOS.setMatrixAt(i, PUNTOS_M[i]); PUNTOS.instanceMatrix.needsUpdate = true; CABOS_R.count = 0; ST.corte = 0 }
  function cortarPuntos(u) { u = c01(u); ST.corte = u; const n = Math.round(u * PUNTOS_N), r = rnd(5);
    let k = 0; for (let i = 0; i < PUNTOS_N; i++) { if (i < n) { const [a, b] = PUNTOS_P[i]; for (const [p, q] of [[a, b], [b, a]]) { const d = q.clone().sub(p).normalize(); d.x += (r() - .5) * 1.2; d.y += r() * .6 - .1; d.z += .5;
          q1.setFromUnitVectors(Y_, d.normalize()); CABOS_R.setMatrixAt(k++, new T3.Matrix4().compose(p, q1.clone(), new T3.Vector3(1, .14 + r() * .12, 1))) } PUNTOS.setMatrixAt(i, new T3.Matrix4().makeScale(0, 0, 0)) } else PUNTOS.setMatrixAt(i, PUNTOS_M[i]) }
    PUNTOS.instanceMatrix.needsUpdate = true; CABOS_R.count = k; CABOS_R.instanceMatrix.needsUpdate = true;
    // se despega: primero el costado izquierdo, después abajo y la derecha
    const iz = S_(.05, .4, u), ab = S_(.35, .65, u), de = S_(.6, 1, u);
    ROJO.position.copy(ROJO_REST.p).add(new T3.Vector3(0, -.04 * ab, .05 * iz + .12 * ab + .1 * de)); ROJO.rotation.set(-.12 * ab - .06 * de, .14 * iz - .1 * de, -.05 * iz + .04 * de) }
  function abrigoRojoCae(u, dest) { u = c01(u); if (u <= 0) return ROJO; cortarPuntos(1); ROJO.updateWorldMatrix(true, false);
    const p0 = ROJO.getWorldPosition(new T3.Vector3()), q0 = ROJO.getWorldQuaternion(new T3.Quaternion()), fw = aMundo(0, 0, 1);
    const p1 = dest ? V3(dest) : new T3.Vector3(p0.x + fw.x * 3, g.position.y, p0.z + fw.z * 3); p1.y += .1;
    scene.attach(ROJO); const e = u ** 1.5, side = aMundo(1, 0, 0);
    ROJO.position.copy(p0).lerp(p1, e).addScaledVector(side, 1.6 * Math.sin(u * PI * 2.6) * (1 - u)).add(new T3.Vector3(0, .9 * Math.sin(PI * Math.min(1, u * 1.1)) * (1 - u), 0));
    const yaw = Math.atan2(fw.x, fw.z) + .6, q1_ = new T3.Quaternion().setFromEuler(new T3.Euler(-PI / 2, yaw, 0, "YXZ")), wob = new T3.Quaternion().setFromEuler(new T3.Euler(.7 * Math.sin(u * 11) * (1 - u), .9 * Math.sin(u * 7) * (1 - u), .6 * Math.sin(u * 9 + 1) * (1 - u)));
    ROJO.quaternion.copy(q0).slerp(q1_, S_(.1, .95, u)).multiply(wob); const fl = S_(.85, 1, u); ROJO.scale.set(1 + .1 * fl, 1 + .05 * fl, 1 - .55 * fl); return ROJO }
  function abrigoRojoEn(x, y, z, ry = 0, u = 1) { ROJO_reset(); scene.attach(ROJO); ROJO.visible = true; u = c01(u);
    ROJO.position.set(x, y + mix(1.1, .1, u), z); ROJO.quaternion.setFromEuler(new T3.Euler(-PI / 2 * eIO(u) + .1 * (1 - u), ry, 0, "YXZ")); ROJO.scale.set(1, 1, 1 - .55 * u); return ROJO }

  // ======================= API =======================
  const tr = (t, i, f = 1) => (Math.sin(t * 31 * f + i * 1.7) + .6 * Math.sin(t * 47 * f + i * 3.1)) * .5;
  const GOLPES_U = [.42, .57, .72];
  const golpeFuerza = u => Math.max(...GOLPES_U.map(k => u >= k - .004 ? ex2(((u - k) / .02) ** 2) : 0));
  const tirar = u => Math.max(...GOLPES_U.map(k => S_(k - .11, k - .035, u) * (1 - S_(k - .014, k, u))));
  const API = { g, J, PASO, ALTO: 22, ROJO, PUNTOS_N, GOLPES_U, frio: { p: null, r: 34, k: 0 },
    climas() { if (typeof ENV === "undefined") return; const E = {
        tejedora: { top: "#04070d", hor: "#161e2b", fog: .016, hemi: .34, hemiG: "#0d0f13", sun: .6, sunCol: "#9db6dc", exp: 1.45, grade: ["#5f82a8", .13], sol: [.35, .8, -.5], sombra: 90,
          velas: .55, ventanas: .45, tiembla: 2.6, estrellas: .4, luna: 1, niebla: 1, polvo: 1, humo: "#3c4554", luces: .6, cielo: 2 },
        noche: { top: "#060a16", hor: "#18203a", fog: .012, hemi: .5, hemiG: "#18140e", sun: .85, sunCol: "#a8bce6", exp: 1.35, grade: ["#9ab0d0", .06], sol: [-.4, 1, .25], sombra: 80,
          velas: 1.5, ventanas: 1.6, tiembla: 1, estrellas: 1, luna: 1, niebla: 0, polvo: .3, humo: "#4a5266", luces: 1.6, cielo: 2 } };
      if (ENV.noche) E.tejedora = Object.assign({}, ENV.noche, E.tejedora); for (const k in E) if (!ENV[k]) ENV[k] = E[k] },
    ocultar() { g.visible = false; AURA.visible = false; LUZ_FRIA.intensity = LUZ_PIES.intensity = 0; PUFFS.forEach(s => s.visible = false); ST.aura = false; API.frio.p = null; API.frio.k = 0; ROJO_reset() },
    poner(x, y, z, ry = 0) { g.visible = true; g.position.set(x, y, z); g.rotation.set(0, ry, 0); REST(); AURA.visible = false; LUZ_FRIA.intensity = LUZ_PIES.intensity = 0; ST.t = 0; ST.viento = 1;
      caderas.position.y = extLeg(.02, .06); piesPlanos(); brazosColgando(0); cabezaNivel(.32, CABEZA_ROLL); telaTick(0) },
    quieto(t) { ST.t = t; const b = Math.sin(t * .55) * .012, b2 = Math.sin(t * .23);
      caderas.position.y = extLeg(.02, .06) + b * .4; col1.rotation.x = .16 + b * .3; col2.rotation.x = .84 + b; cuello.rotation.x = -.18 - b * .6; col2.rotation.z = .07 + .015 * b2; T2G.scale.set(1 + b * .6, 1, 1 + b);
      piesPlanos(); brazosColgando(t); cabezaNivel(.32 + .03 * Math.sin(t * .19), CABEZA_ROLL + .05 * Math.sin(t * .13), .08 * Math.sin(t * .09)); telaTick(t) },
    caminar(t, vel = 2.6) { ST.t = t; ST.andando = true; const ph = t * vel / PASO * TAU; ST.fase = ph; ST.ciclo = PASO / Math.max(.01, vel);
      for (const s of [0, 1]) { const p = ph + s * PI, f = A_PASO * Math.sin(p), sw = Math.max(0, Math.cos(p)), k = .08 + 1.05 * sw ** 1.6 * S_(-.2, .3, Math.sin(p) + .3);
        J.muslo[s].rotation.x = -f; J.rodilla[s].rotation.x = k; J.tobillo[s].userData.extra = sw > .2 ? .3 * sw : 0 }
      caderas.position.y = Math.max(...[0, 1].map(s => extLeg(-J.muslo[s].rotation.x, J.rodilla[s].rotation.x))) - .15 * Math.abs(Math.sin(ph));
      caderas.rotation.y = .06 * Math.sin(ph); caderas.rotation.z = .04 * Math.sin(ph); pelvis.rotation.y = -.04 * Math.sin(ph); col2.rotation.z = -.05 * Math.sin(ph); col1.rotation.x = .16 + .04 * Math.abs(Math.cos(ph)); col2.rotation.x = .86;
      piesPlanos(); for (const s of [0, 1]) J.tobillo[s].userData.extra = 0;
      brazosColgando(t, .12, [.2 * Math.sin(ph - .8), .2 * Math.sin(ph + PI - .8)]); cabezaNivel(.3 + .03 * Math.sin(ph * 2), CABEZA_ROLL + .04 * Math.sin(ph)); telaTick(t) },
    agacharse(u, p) { u = eIO(c01(u)); if (!(u > 0)) return; let yaw = 0; if (p) { g.updateMatrixWorld(true); const l = g.worldToLocal(V3(p)); yaw = Math.max(-.7, Math.min(.7, Math.atan2(l.x, l.z))) }
      const f = .02 + .78 * u, k = .06 + 1.5 * u; for (const s of [0, 1]) { J.muslo[s].rotation.x = -f; J.rodilla[s].rotation.x = k }
      caderas.position.y = extLeg(f, k); caderas.position.z = -avLeg(f, k); pelvis.rotation.set(.06 + .6 * u, yaw * .5 * u, 0); col1.rotation.x = .16 + .2 * u; col2.rotation.x = .84 + .05 * u; col2.rotation.y = yaw * .3 * u; cuello.rotation.x = -.18 - .3 * u;
      piesPlanos(); brazosColgando(ST.t, .14 + .1 * u, [.3 * u, .3 * u]); cabezaNivel(.32 + .1 * u, CABEZA_ROLL * (1 - .5 * u), yaw * .4); ST.yaw = yaw; telaTick(ST.t) },
    golpear(t, u, p) { ST.t = t; u = c01(u); g.updateMatrixWorld(true); const P = p ? V3(p) : g.localToWorld(new T3.Vector3(0, 1.9, 5.5)).setY(g.position.y + 1.9);
      API.agacharse(.9 * S_(0, .32, u), P.toArray()); const s = 1, H = J.hombro[s]; H.updateWorldMatrix(true, false); const S0 = H.getWorldPosition(new T3.Vector3());
      const dir = P.clone().sub(S0).normalize(), up = new T3.Vector3(0, 1, 0), lado = aMundo(-1, 0, 0), Lf = LF[DEDO];
      const pull = tirar(u), hit = golpeFuerza(u), alcanza = eIO(S_(.05, .33, u));
      const Wt = P.clone().addScaledVector(dir, -Lf * .78).addScaledVector(up, Lf * .3).addScaledVector(dir, -pull * 1.1).addScaledVector(up, pull * .55);
      J.muneca[s].updateWorldMatrix(true, false); const W0 = J.muneca[s].getWorldPosition(new T3.Vector3()); Wt.lerpVectors(W0, Wt, alcanza);
      ik2(s, Wt, lado.clone().add(new T3.Vector3(0, -.6, 0)).normalize()); J.muneca[s].rotation.set(0, 0, 0);
      J.muneca[s].updateWorldMatrix(true, false); const Wp = J.muneca[s].getWorldPosition(new T3.Vector3()), dd = P.clone().sub(Wp).normalize();
      dedosColgando(t, s, (F, i) => { if (alcanza < .05) return false; if (i === DEDO) { apuntarW(F, dd.clone().addScaledVector(up, pull * .5 - .02 * hit * Math.sin(t * 60)).lerp(aMundo(0, -1, .1), 1 - alcanza)); F.rotateX(-.5 * alcanza); return true }
        apuntarW(F, dd.clone().addScaledVector(up, 1.1 * alcanza).addScaledVector(lado, (i - 1.5) * .45).lerp(aMundo(0, -1, .1), 1 - alcanza)); return true });
      API.mirar(P.toArray(), .9 * alcanza); telaTick(t) },
    golpeFuerza,
    abrirPuerta(u, p, d) { u = c01(u); const t = ST.t; g.updateMatrixWorld(true); const P = V3(p); API.agacharse(.95 * S_(0, .3, u), p);
      const s = 1, H = J.hombro[s]; H.updateWorldMatrix(true, false); const S0 = H.getWorldPosition(new T3.Vector3()), up = new T3.Vector3(0, 1, 0), lado = aMundo(-1, 0, 0), Lf = LF[DEDO];
      const hacia = d ? new T3.Vector3(d[0], 0, d[1]).normalize() : S0.clone().sub(P).setY(0).normalize(), abre = eIO(S_(.45, 1, u)), Q = P.clone().addScaledVector(hacia, 1.7 * abre), dir = Q.clone().sub(S0).normalize();
      const alcanza = eIO(S_(.05, .35, u)), Wt = Q.clone().addScaledVector(dir, -Lf * .8).addScaledVector(up, Lf * .25 + .3 * (1 - S_(.35, .45, u)));
      J.muneca[s].updateWorldMatrix(true, false); Wt.lerpVectors(J.muneca[s].getWorldPosition(new T3.Vector3()), Wt, alcanza);
      ik2(s, Wt, lado.clone().add(new T3.Vector3(0, -.6, 0)).normalize()); J.muneca[s].updateWorldMatrix(true, false); const Wp = J.muneca[s].getWorldPosition(new T3.Vector3()), dd = Q.clone().sub(Wp).normalize(), engancha = S_(.35, .45, u);
      dedosColgando(t, s, (F, i) => { if (alcanza < .05) return false; if (i === DEDO) { apuntarW(F, dd.clone().lerp(aMundo(0, -1, .1), 1 - alcanza)); F.rotateX(-.6 * alcanza - .5 * engancha); return true } apuntarW(F, dd.clone().addScaledVector(up, 1.2 * alcanza).addScaledVector(lado, (i - 1.5) * .45).lerp(aMundo(0, -1, .1), 1 - alcanza)); return true });
      API.mirar(P.toArray(), alcanza); telaTick(t); return abre },
    gritar(t, u) { ST.t = t; u = c01(u); if (!(u > 0)) return; ST.grito = u; const e = eIO(S_(0, .45, u)), T = e * (.4 + .6 * S_(.2, .6, u));
      col1.rotation.x = .16 - .34 * e + .02 * T * tr(t, 1); col2.rotation.x = .84 - 1.2 * e + .03 * T * tr(t, 2); cuello.rotation.x = -.18 - .25 * e + .03 * T * tr(t, 3); col2.rotation.z = .03 * T * tr(t, 4, .7);
      cuerpo.position.set(.06 * T * tr(t, 5, .5), 0, .05 * T * tr(t, 6, .5)); for (const s of [0, 1]) J.rodilla[s].rotation.x = .06 + .25 * e; caderas.position.y = extLeg(.02, .06 + .25 * e); piesPlanos();
      for (const s of [0, 1]) { const sg = s ? -1 : 1; apuntarW(J.hombro[s], aMundo(sg * (.14 + 1.35 * e) + .1 * T * tr(t, 7 + s), -1 + 1.2 * e + .1 * T * tr(t, 9 + s), .2 - .35 * e));
        J.codo[s].rotation.set(-.15 - .45 * e + .1 * T * tr(t, 11 + s), 0, sg * .3 * e); J.dedos[s].forEach((F, i) => { F.rotation.set(0, 0, 0); apuntarW(F, aMundo(sg * (.3 + .4 * e) * (i - 1.5) * .6, -1 + .4 * e, .3 * e + .3 * T * tr(t, 13 + i + s * 4, .6))) }) }
      cabezaNivel(.32 - 1.15 * e + .05 * T * tr(t, 20), CABEZA_ROLL * (1 - e) + .12 * T * tr(t, 21, .4), 0); ST.inflar = e * (.85 + .15 * Math.sin(t * 7)); ST.boca = eIO(S_(.08, .5, u)); telaTick(t) },
    mirar(p, u = 1) { if (!p || !(u > 0)) return; g.updateMatrixWorld(true); BOTON.updateWorldMatrix(true, false); const hc = BOTON.getWorldPosition(new T3.Vector3()), d = V3(p).sub(hc).applyQuaternion(g.getWorldQuaternion(q2).invert());
      const yaw = Math.max(-1.2, Math.min(1.2, Math.atan2(d.x, d.z))) * u, pitch = Math.max(-.9, Math.min(1.1, Math.atan2(-d.y, Math.hypot(d.x, d.z)))), cur = cabeza.getWorldQuaternion(new T3.Quaternion());
      col2.rotation.y += yaw * .2; cabezaNivel(pitch, 0, yaw * .85); const nq = cabeza.quaternion.clone(); cabeza.parent.updateWorldMatrix(true, false); cabeza.parent.getWorldQuaternion(q1).invert(); cabeza.quaternion.copy(q1.multiply(cur)).slerp(nq, u) },
    cortarPuntos, abrigoRojoCae, abrigoRojoEn,
    puntoW(i) { const [a, b] = PUNTOS_P[Math.max(0, Math.min(PUNTOS_N - 1, i | 0))]; T2G.updateWorldMatrix(true, false); return a.clone().lerp(b, .5).applyMatrix4(T2G.matrixWorld).toArray() },
    siguientePuntoW(u) { return API.puntoW(Math.min(PUNTOS_N - 1, Math.floor(c01(u) * PUNTOS_N))) },
    trepaPunto(u) { u = c01(u); const onT1 = u < .6, sup = onT1 ? sup1 : sup2, G = onT1 ? T1G : T2G, y = onT1 ? mix(.05, 3.9, u / .6) : mix(-.35, 1.6, (u - .6) / .4), th = TREPA_TH(u);
      G.updateWorldMatrix(true, false); const p = V3(sup(th, y)), n = nrm(sup, th, y), a = V3(sup(th, y + .1)).sub(p).normalize();
      return { p: p.applyMatrix4(G.matrixWorld).toArray(), n: n.transformDirection(G.matrixWorld).toArray(), arriba: a.transformDirection(G.matrixWorld).toArray() } },
    aura(on, k = 1) { ST.aura = !!on; AURA.visible = !!on; LUZ_FRIA.intensity = on ? 22 * k : 0; LUZ_PIES.intensity = on ? 10 * k : 0; if (!on) { API.frio.p = null; API.frio.k = 0; return } auraTick(ST.t, k);
      const c = API.pechoW(); API.frio.p = c; API.frio.k = k; if (typeof velasHacia === "function") velasHacia(c, .7 * k, API.frio.r) },
    luzFria(L) { const F = API.frio; if (!F.p || !L) return L; const fria = new T3.Color("#a6c0ff"), c = new T3.Color();
      return L.map(l => { const d = Math.hypot(l[0][0] - F.p[0], l[0][2] - F.p[2]), k = F.k * (1 - S_(F.r * .4, F.r, d)); if (k <= 0) return l; c.set(l[2] || "#ffb060").lerp(fria, .85 * k);
        return [l[0], l[1] * (1 - .55 * k) * (1 - .25 * k * Math.max(0, Math.sin(ST.t * 23 + l[0][0]))), "#" + c.getHexString(), l[3]] }) },
    cabezaW() { BOTON.updateWorldMatrix(true, false); return BOTON.localToWorld(new T3.Vector3(0, 0, .3)).toArray() },
    pechoW() { ROJO.updateWorldMatrix(true, false); return ROJO.getWorldPosition(new T3.Vector3()).toArray() },
    ganchoW(s = 1) { const F = J.dedos[s][DEDO]; F.updateWorldMatrix(true, false); return F.localToWorld(V3(PUNTA_DEDO(LF[DEDO]))).toArray() },
    pechoCam(d = 4, ang = 0, dy = 0) { ROJO.updateWorldMatrix(true, false); const h = ROJO.getWorldPosition(new T3.Vector3()), q = ROJO.getWorldQuaternion(new T3.Quaternion()), f = new T3.Vector3(Math.sin(ang), 0, Math.cos(ang)).applyQuaternion(q); return [h.x + f.x * d, h.y + f.y * d + dy, h.z + f.z * d] },
    pieW(s = 0) { J.tobillo[s].updateWorldMatrix(true, false); return J.tobillo[s].getWorldPosition(new T3.Vector3()).setY(g.position.y).toArray() },
    caraCam(d = 4, ang = 0, dy = 0) { BOTON.updateWorldMatrix(true, false); const h = BOTON.localToWorld(new T3.Vector3(0, 0, .3)), q = BOTON.getWorldQuaternion(new T3.Quaternion()), f = new T3.Vector3(Math.sin(ang), 0, Math.cos(ang)).applyQuaternion(q); return [h.x + f.x * d, h.y + f.y * d + dy, h.z + f.z * d] },
    alto() { g.updateMatrixWorld(true); const b = new T3.Box3().setFromObject(cuerpo); return b.max.y - g.position.y },
    // para rectAdd: la huella en planta (pies y faldón) en la pose actual
    huella() { const b = new T3.Box3().setFromObject(cuerpo); return { x: (b.min.x + b.max.x) / 2, z: (b.min.z + b.max.z) / 2, w: b.max.x - b.min.x, d: b.max.z - b.min.z } } };
  return API;
})();

// ======================= COMPATIBILIDAD: la campana del video anterior ya no existe (stubs para que las partes viejas sigan armando) =======================
const CBX = (() => {
  const sst = (a, b, v) => { const q = cl((v - a) / (b - a)); return q * q * (3 - 2 * q) };
  const hsh = (i, j) => { let n = (Math.imul(i | 0, 374761393) + Math.imul(j | 0, 668265263)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296 };
  const rd = (x, z) => { const i = Math.floor(x), j = Math.floor(z), u = x - i, v = z - j, a = u * u * (3 - 2 * u), b = v * v * (3 - 2 * v); return lerp(lerp(hsh(i, j), hsh(i + 1, j), a), lerp(hsh(i, j + 1), hsh(i + 1, j + 1), a), b) };
  const fbm = (x, z, o = 4) => { let s = 0, a = .5, f = 1, n = 0; for (let k = 0; k < o; k++) { s += a * rd(x * f + k * 17.3, z * f - k * 9.1); n += a; a *= .5; f *= 2.03 } return s / n };
  const TMx = (x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, "YXZ")), new THREE.Vector3(sx, sy, sz));
  const mergeGeo = list => { let n = 0; const qs = list.map(([g, m]) => { const q = g.index ? g.toNonIndexed() : g.clone(); if (m) q.applyMatrix4(m); if (!q.attributes.uv) q.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(q.attributes.position.count * 2), 2)); if (!q.attributes.normal) q.computeVertexNormals(); n += q.attributes.position.count; return q }), hayC = qs.some(q => q.attributes.color);
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2), co = hayC ? new Float32Array(n * 3).fill(1) : null; let o = 0;
    qs.forEach(q => { const k = q.attributes.position.count; pos.set(q.attributes.position.array, o * 3); nor.set(q.attributes.normal.array, o * 3); uv.set(q.attributes.uv.array, o * 2); if (co && q.attributes.color) co.set(q.attributes.color.array, o * 3); o += k });
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); g.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); if (co) g.setAttribute("color", new THREE.BufferAttribute(co, 3)); g.computeBoundingSphere(); return g };
  const lote = () => { const B = new Map(); return { add(mat, g, m) { (B.get(mat) || B.set(mat, []).get(mat)).push([g, m]) }, fin(par) { const out = []; for (const [mat, L] of B) { const me = new THREE.Mesh(mergeGeo(L), mat); par.add(me); out.push(me) } return out } } };
  const O = () => { const o = new THREE.Object3D(); o.visible = false; scene.add(o); return o };
  const PLAT = new THREE.Object3D(); PLAT.position.set(0, 2, -10); scene.add(PLAT);
  const polar = (r, h, a) => [r * Math.cos(a), h, r * Math.sin(a)];
  const cadenaMarco = (n, u) => ({ p: [0, 4 + u * 30, -60], t: [0, 1, 0], lado: [1, 0, 0], n: [0, 0, 1] });
  return { G: new THREE.Group(), ST: { nubes: false, solDir: null, temblor: 0, zumb: 0, cera: 0, calor: 0, golpe: null }, sst, fbm, rd, hsh, mergeGeo, TMx, lote, polar, A_ENT: 0, A_CAD_E: 0, A_VUELCA: 0, P_H: 6, HB: 1, H_TECHO: 1,
    rOut: h => 10, rIn: h => 9, hArriba: r => 0, cadenaMarco, PRIMER: [0, 4, -60], U_LABIO_E: .8, GANCHO: [0, 10, -10], PLAT_W: [0, 2, -10], HUECO_W: [0, 20, -10], PLAT, POLVO: O(), HAZ: O(), VAPOR: O(), reset() { }, porCuadro() { } } })();
const cadenaPunto = (n, u) => CBX.cadenaMarco(n, u).p, cadenaTangente = (n, u) => CBX.cadenaMarco(n, u).t, cadenaMarco = (n, u) => CBX.cadenaMarco(n, u);
const PRIMER_ESLABON = CBX.PRIMER, CADENA_U_LABIO = CBX.U_LABIO_E;
const interior = () => ({ plataforma: CBX.PLAT_W.slice(), labio: [0, 2, -10], gancho: CBX.GANCHO.slice(), entrada: [0, 2, -10], hueco: CBX.HUECO_W.slice(), vuelca: [0, 2, -9], ryPlataforma: 0 });
const plataformaW = (x, y, z) => { CBX.PLAT.updateMatrixWorld(true); return CBX.PLAT.localToWorld(new THREE.Vector3(x, y + .25, z)).toArray() };
const zumbido = () => { }, ceraEnLabio = () => { }, golpe = () => { }, golpeTemblor = () => 0, sombraCampana = dirSol => { if (dirSol && typeof SOL !== "undefined") SOL.dir = dirSol };
const TAPA_Y = (x, z) => 60, AGUJERO_W = () => [0, 60, 0], KELL_BORDE = [0, 60, 0], tapaCaeY = u => 60;
const tapaReset = () => { }, tapa = () => { }, tapaHundir = () => { }, tapaGotea = () => { }, tapaAgujero = () => { }, tapaCae = () => { }, lluviaTrigo = () => { }, tanerCae = () => { };
function sinBestia() { }
