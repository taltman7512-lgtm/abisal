// ================= «WE PAY THE MOUNTAIN IN TEETH»: LA MONTAÑA CON BOCA (al norte de Hollowmere, detrás de la iglesia) =================
// Una montaña de roca cálida (gris-ocre) de ≈ 172 m con nieve arriba, pasto y pinos en las laderas, y en el frente (mirando al pueblo, +z)
// una CARA tallada: dos ojos con párpados de piedra y musgo, nariz, pómulos, cejas, y una BOCA de ≈ 66 m de ancho con labios de roca gruesos,
// dientes de piedra casi blancos y gastados (falta uno), encías rosadas-terrosas, una lengua de piedra y el interior bien oscuro.
// Abajo, en el talud del frente: postes con sogas de collares de dientes de leche y banderines (las ofrendas del pueblo). Tres cascadas chicas.
// Todo pintado en canvas, nada descargado. Ejes: norte = −z. El grupo MONTE.G tiene el origen en el centro de la base (x 0, z −260).
// API (u y t de 0 a 1 o en segundos; el estado se limpia solo cada cuadro desde mundoReset, así que cada escena llama lo que necesita):
//   MONTE.boca(u)            0 cerrada … 1 abierta (la mandíbula baja ≈ 26 m y avanza; nunca se mete bajo el piso)
//   MONTE.inclinar(u)        0 derecha … 1 inclinada sobre el pueblo (la cara baja ≈ 37 m y avanza ≈ 60 m hacia la calle)
//   MONTE.masticar(t, u)     mastica (u = fuerza); pisa a boca()
//   MONTE.ojos(u)            0 cerrados … 1 abiertos (por defecto .12: entreabiertos, dormidos)   · MONTE.mirar([x,y,z], u) gira los ojos hacia un punto
//   MONTE.sonreir(u)         las comisuras suben ≈ 10 m (abajo) y ≈ 5 m (arriba) (la sonrisa del final; queda mejor con boca ≤ .35)
//   MONTE.escupirOro(t, u)   monedas de oro que salen de la boca y caen (u = avance de la escupida, 0 … 1 ≈ 4,5 s). Llamarla DESPUÉS de boca/inclinar
//   MONTE.temblor(t)         cuánto tiembla la cámara (unidades del mundo, para TEMBLOR) según lo que hizo la montaña este cuadro
//   cámara: MONTE.bocaW() centro de la boca abierta · MONTE.labioW(dx) punto ARRIBA del labio inferior (para parar un personaje de 2 m; dx −25 … 25)
//           MONTE.ojoW(lado) frente del ojo (lado −1 oeste, +1 este) · MONTE.caraCam(d, ang, dy) [x,y,z] a d m delante de la cara (ang gira, dy sube)
//           MONTE.caraW() centro de la cara (entre la nariz y los ojos) · MONTE.pieW() pie del frente, sobre el piso · MONTE.alto() ≈ 172
// Además: ENV "dia" (sol de mañana dorado, cielo azul saturado, niebla muy leve, sombras largas) y nubes blancas de día en lejos().
const MONTE = (() => {
  const CX = 0, CZ = -260, Y0 = ALT_T(CX, CZ) - 1.5, H = 172, YM = 52, RF0 = 85, MW = 33, MB = 29.5, YC0 = YM + (1.5 - MB) / 2, HH = (MB + 1.5) / 2;
  const G = new THREE.Group(); G.position.set(CX, Y0, CZ); scene.add(G);
  const ex = Math.exp, sst = sstH, V3 = (x, y, z) => new THREE.Vector3(x, y, z), lerpN = (a, b, k) => a + (b - a) * k;
  // ---------- ruido 3D de valor + fbm (propio: el del motor es 2D)
  const h3 = (i, j, k) => { let n = (Math.imul(i | 0, 374761393) + Math.imul(j | 0, 668265263) + Math.imul(k | 0, 1440662683)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296 };
  const n3 = (x, y, z) => { const i = Math.floor(x), j = Math.floor(y), k = Math.floor(z), u = x - i, v = y - j, w = z - k, a = u * u * (3 - 2 * u), b = v * v * (3 - 2 * v), c = w * w * (3 - 2 * w), L = lerpN;
    return L(L(L(h3(i, j, k), h3(i + 1, j, k), a), L(h3(i, j + 1, k), h3(i + 1, j + 1, k), a), b), L(L(h3(i, j, k + 1), h3(i + 1, j, k + 1), a), L(h3(i, j + 1, k + 1), h3(i + 1, j + 1, k + 1), a), b), c) };
  const f3 = (x, y, z, o = 4) => { let s = 0, A = .5, F = 1, N = 0; for (let q = 0; q < o; q++) { s += A * n3(x * F + q * 31.7, y * F - q * 17.1, z * F + q * 7.3); N += A; A *= .5; F *= 2.07 } return s / N };
  // ---------- la forma: un torno (radio según ángulo φ y alto y). φ = 0 mira al pueblo (+z). Al frente, un acantilado casi vertical (la cara)
  const rS0 = y => y < 0 ? 151 - y * .4 : 151 * Math.pow(Math.max(0, 1 - Math.pow(y / H, 1.6)), .9);
  const rF0 = y => y < 20 ? 86.4 + (20 - y) * 1.5 : 84 - .08 * (y - 50);
  const wCara = phi => ex(-Math.pow(phi / .78, 4)), copa = y => 1 - sst(128, 160, y);
  const g2 = (a, b) => ex(-(a * a + b * b));
  // relieve de la cara (X = ancho en metros desde el centro, y = alto local): hocico, nariz, fosas, pómulos, cuencas, cejas, frente
  const relieve = (X, y) => { const ax = Math.abs(X);
    let d = 7 * ex(-Math.pow(X / 44, 4)) * sst(14, 28, y) * (1 - sst(64, 78, y));
    d += 10 * ex(-((X / 7.5) ** 2)) * sst(70, 82, y) * (1 - sst(98, 107, y)) + 4.5 * g2(X / 7.5, (y - 75) / 5.5);
    d -= 4.5 * g2((ax - 5) / 2.3, (y - 71.6) / 2.1);
    d += 6.5 * g2((ax - 39) / 12, (y - 80) / 13);
    d -= 9.5 * ex(-((ax - 25) ** 2 + (y - 112) ** 2) / 100);
    d += 7.5 * ex(-(((y - 124 + .06 * (ax - 24) ** 2 * .1) / 4.6) ** 2)) * ex(-(((ax - 23) / 15) ** 2));
    d += 3 * g2(X / 18, (y - 138) / 9);
    d -= 2.2 * g2((ax - 40) / 2.4, (y - 54) / 12);   // pliegues de las comisuras (marioneta)
    return d };
  const grieta = (x, y, z) => { const v = 1 - Math.abs(2 * n3(x * .045, y * .03, z * .045) - 1); return sst(.93, .985, v) };
  const rBase = (phi, y, conRelieve = true) => { const s = Math.sin(phi), c = Math.cos(phi), px = s * 100, pz = c * 100, w = wCara(phi) * copa(y), rs0 = rS0(y), kk = Math.min(1, rs0 / 25);
    let rs = rs0 * (1 + .26 * (f3(px * .012, y * .012, pz * .012, 4) - .5)) + kk * 9 * (f3(px * .05, y * .05, pz * .05, 3) - .5);
    rs += kk * 7 * Math.pow(Math.abs(Math.sin(phi * 5 + 2 * f3(px * .01, y * .008, pz * .01, 2))), 3) * sst(10, 60, y) * (1 - sst(120, 170, y));
    const rf = rF0(y) + 3.5 * (f3(px * .07, y * .07, pz * .07, 3) - .5) + 1.4 * (f3(px * .3, y * .3, pz * .3, 2) - .5);
    let r = rs + (rf - rs) * w;
    if (conRelieve) r += relieve(phi * RF0, y) * ex(-Math.pow(phi / .62, 4)) * sst(10, 20, y) - .9 * grieta(px, y, pz) * (.4 + .6 * w);
    return Math.max(0, r) };
  const radial = phi => V3(Math.sin(phi), 0, Math.cos(phi));
  const S = (phi, y, rel = true) => { const r = rBase(phi, y, rel); return V3(Math.sin(phi) * r, y, Math.cos(phi) * r) };
  const SX = (X, y, rel = true) => S(X / RF0, y, rel);
  const nrm = (phi, y) => { const e = .003, r = rBase(phi, y), rp = (rBase(phi + e, y) - rBase(phi - e, y)) / (2 * e), ry = (rBase(phi, y + .6) - rBase(phi, y - .6)) / 1.2, s = Math.sin(phi), c = Math.cos(phi);
    const n = new THREE.Vector3().crossVectors(V3(c * r + s * rp, 0, -s * r + c * rp), V3(s * ry, 1, c * ry)).normalize(); if (n.x * s + n.z * c < 0) n.negate(); return n };
  const enAgujero = (X, y) => Math.pow(Math.abs(X) / MW, 4) + Math.pow(Math.abs(y - YC0) / HH, 4) < 1;
  // ---------- texturas pintadas: roca (estratos, grietas, motas) con su relieve; agua; ojo
  const [T_ROCA, T_ROCA_B] = pintarDoble(1024, 1024, (c, z, w, h) => { const q = rng(9101);
    c.fillStyle = "#d2cbc0"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
    for (let k = 0; k < 900; k++) { const x = q() * w, y = q() * h, s = 10 + q() * 70, v = q(); c.fillStyle = v < .5 ? `rgba(120,104,86,${.05 + q() * .1})` : `rgba(240,232,218,${.05 + q() * .1})`; c.beginPath(); c.ellipse(x, y, s, s * (.3 + q() * .5), q() * .4, 0, 7); c.fill();
      z.fillStyle = v < .5 ? `rgba(40,40,40,${.08 + q() * .1})` : `rgba(220,220,220,${.08 + q() * .1})`; z.beginPath(); z.ellipse(x, y, s, s * .5, 0, 0, 7); z.fill() }
    for (let y0 = 0; y0 < h; y0 += 18 + q() * 40) { const a = q() * 6, A = 3 + q() * 8; c.strokeStyle = `rgba(90,76,60,${.18 + q() * .2})`; z.strokeStyle = "rgba(30,30,30,.45)"; c.lineWidth = z.lineWidth = 1 + q() * 3;
      for (const g of [c, z]) { g.beginPath(); for (let x = -10; x <= w + 10; x += 16) g.lineTo(x, y0 + Math.sin(x * .01 + a) * A + Math.sin(x * .043 + a * 2) * A * .4); g.stroke() } }
    for (let k = 0; k < 140; k++) { let x = q() * w, y = q() * h, a = q() * 6.283; const n = 8 + q() * 30, lw = .8 + q() * 2.6; const P = [[x, y]]; for (let i = 0; i < n; i++) { a += (q() - .5) * 1.1; x += Math.cos(a) * 7; y += Math.sin(a) * 7; P.push([x, y]) }
      c.strokeStyle = "rgba(255,248,236,.35)"; c.lineWidth = lw + 1.5; c.beginPath(); P.forEach(([x, y]) => c.lineTo(x + 1.2, y + 1.2)); c.stroke();
      c.strokeStyle = `rgba(38,30,24,${.55 + q() * .3})`; c.lineWidth = lw; c.beginPath(); P.forEach(([x, y]) => c.lineTo(x, y)); c.stroke();
      z.strokeStyle = "#000"; z.lineWidth = lw + 1; z.beginPath(); P.forEach(([x, y]) => z.lineTo(x, y)); z.stroke() }
    for (let k = 0; k < 9000; k++) { const x = q() * w, y = q() * h, v = q(); c.fillStyle = v < .5 ? "rgba(60,50,40,.35)" : "rgba(255,250,240,.3)"; c.fillRect(x, y, 1 + q() * 2, 1 + q() * 2) } });
  [T_ROCA, T_ROCA_B].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping });
  const T_AGUA = tex(64, 256, (g, w, h) => { const q = rng(9102); g.clearRect(0, 0, w, h); for (let k = 0; k < 140; k++) { const x = q() * w, y = q() * h, L = 20 + q() * 90; const gr = g.createLinearGradient(0, y, 0, y + L); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(.5, `rgba(${200 + q() * 55 | 0},${230 + q() * 25 | 0},255,${.35 + q() * .5})`); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(x - 1 - q() * 3, y, 2 + q() * 6, L); g.fillRect(x - 1 - q() * 3, y - h, 2 + q() * 6, L) } }, [1, 5]);
  const T_OJO = tex(512, 256, (g, w, h) => { const q = rng(9103); g.fillStyle = "#ece4d0"; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 400; k++) { g.fillStyle = `rgba(${150 + q() * 60 | 0},${140 + q() * 50 | 0},${120 + q() * 40 | 0},${.1 + q() * .2})`; g.beginPath(); g.arc(q() * w, q() * h, 2 + q() * 9, 0, 7); g.fill() }
    for (let k = 0; k < 40; k++) { g.strokeStyle = "rgba(120,90,70,.35)"; g.lineWidth = 1 + q(); g.beginPath(); let x = q() * w, y = q() * h; g.moveTo(x, y); for (let i = 0; i < 6; i++) { x += (q() - .5) * 30; y += (q() - .5) * 30; g.lineTo(x, y) } g.stroke() }
    const cx = w * .25, cy = h * .5, R = 44, gr = g.createRadialGradient(cx, cy, 6, cx, cy, R); gr.addColorStop(0, "#ffe27a"); gr.addColorStop(.45, "#f0a420"); gr.addColorStop(.85, "#b45a10"); gr.addColorStop(1, "#3a1a08");
    g.fillStyle = gr; g.beginPath(); g.ellipse(cx, cy, R, R, 0, 0, 7); g.fill();
    for (let k = 0; k < 90; k++) { const a = q() * 6.283; g.strokeStyle = q() < .5 ? "rgba(120,50,0,.5)" : "rgba(255,240,160,.45)"; g.lineWidth = 1 + q() * 1.5; g.beginPath(); g.moveTo(cx + Math.cos(a) * 14, cy + Math.sin(a) * 14); g.lineTo(cx + Math.cos(a) * (R - 3), cy + Math.sin(a) * (R - 3)); g.stroke() }
    g.strokeStyle = "#2a1006"; g.lineWidth = 5; g.beginPath(); g.ellipse(cx, cy, R, R, 0, 0, 7); g.stroke();
    g.fillStyle = "#0a0604"; g.beginPath(); g.ellipse(cx, cy, 15, 17, 0, 0, 7); g.fill();
    g.fillStyle = "rgba(255,255,255,.9)"; g.beginPath(); g.ellipse(cx - 12, cy - 13, 7, 5, -.5, 0, 7); g.fill() });
  // ---------- materiales
  const M_ROCA = new THREE.MeshStandardMaterial({ vertexColors: true, map: T_ROCA, bumpMap: T_ROCA_B, bumpScale: 2.5, roughness: .95 });
  const M_LABIO = new THREE.MeshStandardMaterial({ vertexColors: true, map: T_ROCA, bumpMap: T_ROCA_B, bumpScale: 1.5, roughness: .8 });
  const M_BOCA = new THREE.MeshStandardMaterial({ vertexColors: true, map: T_ROCA, bumpMap: T_ROCA_B, bumpScale: 1, roughness: .75 });
  const M_DIENTE = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .38, bumpMap: T_ROCA_B, bumpScale: .4 });
  const M_OJO = new THREE.MeshStandardMaterial({ map: T_OJO, roughness: .25, emissive: "#3a2408", emissiveIntensity: .15 });
  // geometría con color por vértice, unir varias (mergeG no lleva color)
  const geoC = (pos, col, idx, uv) => { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv || new Array(pos.length / 3 * 2).fill(0), 2)); if (idx) g.setIndex(idx); g.computeVertexNormals(); return g };
  // da vuelta los triángulos si las normales apuntan al revés (prueba: un vértice y una dirección «afuera» conocida)
  const orientar = (g, i, afuera) => { const n = g.attributes.normal; if (n.getX(i) * afuera.x + n.getY(i) * afuera.y + n.getZ(i) * afuera.z < 0) { const ix = g.index.array; for (let k = 0; k < ix.length; k += 3) { const t = ix[k + 1]; ix[k + 1] = ix[k + 2]; ix[k + 2] = t } g.index.needsUpdate = true; g.computeVertexNormals() } return g };
  const unirC = list => { const gs = list.map(([g, m]) => { const q = g.index ? g.toNonIndexed() : g.clone(); if (m) q.applyMatrix4(m); if (!q.attributes.color) { const n = q.attributes.position.count, c = new Float32Array(n * 3).fill(1); q.setAttribute("color", new THREE.BufferAttribute(c, 3)) } if (!q.attributes.uv) q.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(q.attributes.position.count * 2), 2)); return q });
    const n = gs.reduce((a, q) => a + q.attributes.position.count, 0), pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3), uv = new Float32Array(n * 2); let o = 0;
    gs.forEach(q => { pos.set(q.attributes.position.array, o * 3); nor.set(q.attributes.normal.array, o * 3); col.set(q.attributes.color.array, o * 3); uv.set(q.attributes.uv.array, o * 2); o += q.attributes.position.count });
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); g.setAttribute("color", new THREE.BufferAttribute(col, 3)); g.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); return g };
  const pintar = (g, fn) => { const p = g.attributes.position, c = new Float32Array(p.count * 3), C = new THREE.Color(); for (let i = 0; i < p.count; i++) { fn(C, p.getX(i), p.getY(i), p.getZ(i), i); c[i * 3] = C.r; c[i * 3 + 1] = C.g; c[i * 3 + 2] = C.b } g.setAttribute("color", new THREE.BufferAttribute(c, 3)); return g };
  const col = h => new THREE.Color(h);
  const C = { roca1: col("#957a5c"), roca2: col("#c4a078"), rocaO: col("#56402e"), pasto: col("#5f9a2c"), pasto2: col("#93b443"), musgo: col("#4f8a26"), nieve: col("#f7f9fd"), tierra: col("#76563a"),
    labio: col("#a2584a"), labioO: col("#6a3428"), encia: col("#d27f72"), enciaO: col("#9a4a44"), garganta: col("#1a0806"), negro: col("#070202"), diente: col("#f1eadb"), raiz: col("#cdb88c"), lengua: col("#b9736a") };
  const tmpC = new THREE.Color();

  // ================= EL CUERPO (≈ 82 mil vértices; en el frente, cada ≈ 0,7 m)
  const PHI = []; { for (let p = -.85; p < .85; p += .0085) PHI.push(p); for (let p = .85; p < 2 * Math.PI - .85 - .01; p += .028) PHI.push(p); PHI.push(2 * Math.PI - .85) }
  const YS = []; { for (let y = -60; y < 10; y += 3.5) YS.push(y); for (let y = 10; y < 148; y += .75) YS.push(y); for (let y = 148; y < H; y += 1.5) YS.push(y); YS.push(H) }
  const cuerpo = (() => { const NC = PHI.length, NR = YS.length, pos = new Float32Array(NC * NR * 3), uv = new Float32Array(NC * NR * 2), idx = [];
    for (let i = 0; i < NR; i++) for (let j = 0; j < NC; j++) { let ph = PHI[j]; if (ph > Math.PI) ph -= 2 * Math.PI; const y = YS[i], r = i === NR - 1 ? 0 : rBase(ph, y), k = i * NC + j;
      pos[k * 3] = Math.sin(ph) * r; pos[k * 3 + 1] = y; pos[k * 3 + 2] = Math.cos(ph) * r; uv[k * 2] = PHI[j] * RF0 / 22; uv[k * 2 + 1] = y / 22 }
    for (let i = 0; i < NR - 1; i++) for (let j = 0; j < NC - 1; j++) { const pc = (PHI[j] + PHI[j + 1]) / 2, yc = (YS[i] + YS[i + 1]) / 2; if (Math.abs(pc) < .5 && enAgujero(pc * RF0, yc)) continue;
      const a = i * NC + j, b = a + NC; idx.push(a, b, a + 1, a + 1, b, b + 1) }
    // tapa de abajo (por si al inclinarse se ve la base: tierra)
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    const iF = Math.round(NR / 2) * NC + PHI.findIndex(p => p > 0); orientar(g, iF, V3(0, 0, 1));
    const nn = g.attributes.normal; pintar(g, (c, x, y, z, i) => { let ph = Math.atan2(x, z); const ny = nn.getY(i), w = wCara(ph) * copa(y), n1 = f3(x * .03, y * .03, z * .03, 3), n2 = f3(x * .11, y * .11, z * .11, 2), X = ph * RF0;
      c.copy(C.roca1).lerp(C.roca2, n1 * 1.3 - .15);
      const rel = Math.abs(ph) < .7 ? relieve(X, y) : 0; if (rel < -2) c.lerp(C.rocaO, Math.min(.5, (-rel - 2) * .07));
      if (grieta(Math.sin(ph) * 100, y, Math.cos(ph) * 100) > .3) c.lerp(C.rocaO, .75);
      const pa = sst(.5, .72, ny + (n2 - .5) * .35) * (1 - sst(108, 132, y + (n1 - .5) * 30)) * (1 - .55 * w); c.lerp(n2 > .5 ? C.pasto2 : C.pasto, pa);
      const mu = w * sst(.22, .45, ny + (n2 - .5) * .4) * sst(.45, .6, n1 + .1); c.lerp(C.musgo, mu * .85);
      const ni = sst(128, 146, y + (n1 - .5) * 28) * sst(.1, .4, ny + .1); c.lerp(C.nieve, ni);
      if (y < -1) c.lerp(C.tierra, sst(-1, -6, y)) });
    const m = new THREE.Mesh(g, M_ROCA); m.receiveShadow = true; m.castShadow = true; G.add(m);
    // tapa de abajo
    const tb = new THREE.CircleGeometry(185, 48); tb.rotateX(Math.PI / 2); tb.translate(0, -59, 0); const mb = new THREE.Mesh(tb, new THREE.MeshStandardMaterial({ color: "#5a4030", roughness: 1 })); G.add(mb);
    return m })();

  // ================= CUMBRES de atrás: la cara queda en el frente de una montaña con picos nevados (se inclinan con ella)
  const PICOS = [[-128, -66, 205, 92, 3], [132, -58, 188, 88, 7], [-28, -112, 272, 122, 11]];
  const colorRoca = (c, x, y, z, ny, alto) => { const n1 = f3(x * .03, y * .03, z * .03, 3), n2 = f3(x * .11, y * .11, z * .11, 2);
    c.copy(C.roca1).lerp(C.roca2, n1 * 1.3 - .15); if (grieta(x, y, z) > .3) c.lerp(C.rocaO, .7);
    c.lerp(n2 > .5 ? C.pasto2 : C.pasto, sst(.5, .72, ny + (n2 - .5) * .35) * (1 - sst(alto * .55, alto * .72, y + (n1 - .5) * 30)));
    c.lerp(C.nieve, sst(alto * .66, alto * .76, y + (n1 - .5) * 34) * sst(.05, .35, ny + .1)); if (y < -1) c.lerp(C.tierra, sst(-1, -6, y)) };
  PICOS.forEach(([cx, cz, h, R, sd]) => { const NA = 110, NY = 80, pos = [], uv = [], idx = [];
    for (let i = 0; i <= NY; i++) { const y = -40 + (h + 40) * i / NY; for (let j = 0; j <= NA; j++) { const a = j / NA * 6.283, px = Math.cos(a) * 100, pz = Math.sin(a) * 100, t = Math.max(0, y) / h;
      const r0 = i === NY ? 0 : (y < 0 ? R - y * .3 : R * Math.pow(Math.max(0, 1 - Math.pow(t, 1.2)), 1.15)), kk = Math.min(1, r0 / 18);
      const r = Math.max(0, r0 * (1 + .34 * (f3(px * .015 + sd, y * .015, pz * .015, 4) - .5)) + kk * 11 * (f3(px * .06, y * .05, pz * .06 + sd, 3) - .5) + kk * 10 * Math.pow(Math.abs(Math.sin(a * 4 + sd + y * .012)), 3));
      pos.push(cx + Math.cos(a) * r, y, cz + Math.sin(a) * r); uv.push(a * 100 / 22, y / 22) } }
    for (let i = 0; i < NY; i++) for (let j = 0; j < NA; j++) { const a = i * (NA + 1) + j, b = a + NA + 1; idx.push(a, b, a + 1, a + 1, b, b + 1) }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    orientar(g, (NY >> 1) * (NA + 1), V3(1, 0, 0)); const nn = g.attributes.normal; pintar(g, (c, x, y, z, i) => colorRoca(c, x, y, z, nn.getY(i), h));
    const m = new THREE.Mesh(g, M_ROCA); m.castShadow = m.receiveShadow = true; G.add(m) });

  // ================= LA BOCA
  const O = SX(0, YM);                                  // marco de la cara: origen en el centro de la ranura, sobre la roca
  const rel = p => p.sub(O);
  const UG = new THREE.Group(); UG.position.copy(O); G.add(UG);   // lo de arriba (fijo): labio superior, encía y dientes de arriba
  const J = new THREE.Group(); J.position.copy(O); G.add(J);      // la MANDÍBULA: placa del mentón, piso, labio inferior, dientes de abajo, lengua
  const DOBLAR = [], LENGUA = {};   // mallas que se doblan con la sonrisa: { g, y0: Float32Array, bx, bw }
  const doblable = (g, bxF, bwF, kS = 1) => { const p = g.attributes.position, n = p.count, y0 = new Float32Array(n), bx = new Float32Array(n), bw = new Float32Array(n); for (let i = 0; i < n; i++) { y0[i] = p.getY(i); bx[i] = bxF(p.getX(i), p.getY(i), p.getZ(i), i); bw[i] = bwF(p.getX(i), p.getY(i), p.getZ(i), i) } for (let i = 0; i < n; i++) bw[i] *= kS; DOBLAR.push({ g, y0, bx, bw }); return g };
  // tubo de sección elíptica (labios, encías) por puntos del marco de la cara: rv vertical, rh hacia afuera; colorF(t, ángulo) → Color
  const tubo = (xs, centro, rad, colorF, M = 18, rugo = .14) => { const pos = [], cols = [], idx = [], uv = [], N = xs.length;
    for (let i = 0; i < N; i++) { const X = xs[i], p = centro(X), n = radial(X / RF0), [rv, rh] = rad(i / (N - 1));
      for (let j = 0; j <= M; j++) { const a = j / M * 6.283, ru = 1 + rugo * (n3(X * .35, a * 1.6, 7.7) - .5) * 2 + rugo * .5 * (n3(X * 1.1, a * 3, 3.1) - .5), q = p.clone().addScaledVector(V3(0, 1, 0), Math.sin(a) * rv * ru).addScaledVector(n, Math.cos(a) * rh * ru); pos.push(q.x, q.y, q.z); const c = colorF(i / (N - 1), a); cols.push(c.r, c.g, c.b); uv.push(X / 8, j / M) } }
    for (let i = 0; i < N - 1; i++) for (let j = 0; j < M; j++) { const a = i * (M + 1) + j, b = a + M + 1; idx.push(a, b, a + 1, a + 1, b, b + 1) }
    const g = geoC(pos, cols, idx, uv); return orientar(g, Math.floor(N / 2) * (M + 1), V3(0, 0, 1)) };
  const rango = (a, b, n) => Array.from({ length: n }, (_, i) => a + (b - a) * i / (n - 1));
  const campana = (t, k = .55) => Math.pow(Math.max(0, 1 - (2 * t - 1) ** 2), k);
  const colLabio = (t, a) => tmpC.copy(C.labio).lerp(C.labioO, Math.max(0, -Math.sin(a)) * .55).lerp(C.musgo, Math.max(0, Math.sin(a) - .75) * 1.2 * (Math.sin(t * 40) > .2 ? 1 : 0));
  // labio superior (grueso, con un poco de musgo arriba) y labio inferior (en la mandíbula)
  const gLabioS = tubo(rango(-35, 35, 70), X => rel(SX(X, YM + 2.6 + .9 * ex(-((X / 5) ** 2)), false).addScaledVector(radial(X / RF0), 2.4 + rBase(X / RF0, YM, true) - rBase(X / RF0, YM, false))), t => { const b = campana(t); return [1.4 + 2.9 * b, (1.4 + 2.9 * b) * 1.35] }, colLabio);
  const gLabioI = tubo(rango(-32, 32, 64), X => rel(SX(X, YM - 3.1, false).addScaledVector(radial(X / RF0), 2.6 + rBase(X / RF0, YM, true) - rBase(X / RF0, YM, false))), t => { const b = campana(t); return [1.5 + 3.1 * b, (1.5 + 3.1 * b) * 1.3] }, colLabio);
  const LABIO_I = { y: YM - 3.1, rv: 4.6, out: 2.6 };
  // encías (rosado terroso, gruesas)
  const colEncia = (t, a) => tmpC.copy(C.encia).lerp(C.enciaO, .5 + .5 * Math.sin(a * 3 + t * 30) * .5);
  const gEnciaS = tubo(rango(-31, 31, 50), X => rel(SX(X, YM + .2, false)).addScaledVector(radial(X / RF0), -2.2), () => [3.4, 2.6], colEncia, 14, .1);
  const gEnciaI = tubo(rango(-29, 29, 50), X => rel(SX(X, YM - 3.6, false)).addScaledVector(radial(X / RF0), -5.6), () => [3, 2.4], colEncia, 14, .1);
  // un diente de piedra: superelipsoide gastado (borde de mordida plano y mellado), raíz amarillenta, punta casi blanca
  const geoDiente = (w, h, t, seed, mella) => { const g = new THREE.SphereGeometry(1, 18, 14), p = g.attributes.position, q = rng(seed);
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = 3.4, L = Math.pow(Math.abs(x) ** k + Math.abs(y) ** k + Math.abs(z) ** k, 1 / k);
      let X = x / L, Y = y / L, Z = z / L; const tp = 1 - .1 * (Y + 1) / 2; X *= tp; Z *= tp;
      if (Y < -.86) Y = -.86 - (Y + .86) * .15; Y += mella * ex(-(((X - .4) / .3) ** 2)) * (Y < -.5 ? .35 : 0);
      const nn = (n3(X * 3 + seed, Y * 3, Z * 3) - .5) * .09; p.setXYZ(i, X * w / 2 * (1 + nn), Y * h / 2 * (1 + nn * .5), Z * t / 2 * (1 + nn)) }
    g.computeVertexNormals(); pintar(g, (c, x, y, z) => { const v = (y / (h / 2) + 1) / 2; c.copy(C.diente).lerp(C.raiz, sst(.45, 1, v) * .8); if (n3(x * 1.3 + seed, y * 1.3, z * 1.3) > .72) c.lerp(C.raiz, .35) }); return g };
  // dientes de arriba: cuelgan de la encía; falta uno (X = 15) y uno está partido (X = −21)
  const DS = [], DI = [];
  { const q = rng(9110), L = []; [-27, -21, -15, -9, -3, 3, 9, 21, 27].forEach((X, i) => { const h = (X === -21 ? 6.2 : 9.6 + q() * 1.6) * (Math.abs(X) > 24 ? .85 : 1), w = Math.abs(X) > 24 ? 4.6 : 5.5, t = 3.2, g = geoDiente(w, h, t, 9120 + i, X === -21 ? .6 : q() * .25);
      const ph = X / RF0, c = rel(SX(X, YM + 1.6 - h / 2, false)).addScaledVector(radial(ph), -3.4); L.push([g, TM(c.x, c.y, c.z, (q() - .5) * .06, ph, (q() - .5) * .08)]); DS.push(X) });
    const g = unirC(L); doblable(g, x => DS.reduce((a, X) => Math.abs(x - X) < Math.abs(x - a) ? X : a, 999), () => 1, .5);
    const m = new THREE.Mesh(g, M_DIENTE); m.castShadow = m.receiveShadow = true; UG.add(m) }
  { const q = rng(9111), L = []; [-24, -18, -12, -6, 0, 6, 12, 18, 24].forEach((X, i) => { const h = (11 + q() * 1.6) * (Math.abs(X) > 20 ? .85 : 1), w = 5.1, t = 3, g = geoDiente(w, h, t, 9140 + i, q() * .3); g.rotateZ(Math.PI);
      const ph = X / RF0, c = rel(SX(X, YM - 5.6 + h / 2, false)).addScaledVector(radial(ph), -6.9); L.push([g, TM(c.x, c.y, c.z, (q() - .5) * .08, ph, (q() - .5) * .1)]); DI.push(X) });
    const g = unirC(L); doblable(g, x => DI.reduce((a, X) => Math.abs(x - X) < Math.abs(x - a) ? X : a, 999), () => 1);
    const m = new THREE.Mesh(g, M_DIENTE); m.castShadow = m.receiveShadow = true; J.add(m) }
  // labios + encías (dos mallas: arriba fija, abajo en la mandíbula)
  { const g = unirC([[gLabioS], [gEnciaS]]); doblable(g, x => x, () => 1, .55); const m = new THREE.Mesh(g, M_LABIO); m.castShadow = m.receiveShadow = true; UG.add(m) }
  // la mandíbula: placa del mentón (copia de la roca, 0,8 m afuera) con paredes hacia adentro, piso de la boca, labio inferior, encía, lengua
  { const L = [], NX = 64, NY = 44, X0 = -37, X1 = 37, YA = YM - 48, YB = YM - 1, pos = [], cs = [], uv = [], idx = [];
    for (let i = 0; i <= NY; i++) for (let j = 0; j <= NX; j++) { const X = lerpN(X0, X1, j / NX), y = lerpN(YA, YB, i / NY), p = rel(SX(X, y).addScaledVector(radial(X / RF0), .8)); pos.push(p.x, p.y, p.z); uv.push(X / 22, y / 22);
      const n1 = f3(X * .05, y * .05, 3, 3); tmpC.copy(C.roca1).lerp(C.roca2, n1 * 1.3 - .15); if (grieta(X * 1.2, y, 80) > .3) tmpC.lerp(C.rocaO, .7); cs.push(tmpC.r, tmpC.g, tmpC.b) }
    for (let i = 0; i < NY; i++) for (let j = 0; j < NX; j++) { const a = i * (NX + 1) + j, b = a + NX + 1; idx.push(a, b, a + 1, a + 1, b, b + 1) }
    L.push([orientar(geoC(pos, cs, idx, uv), Math.floor(NY / 2) * (NX + 1) + NX / 2, V3(0, 0, 1))]);
    // paredes (borde izquierdo, derecho y de abajo, 14 m hacia adentro): se ven cuando la mandíbula baja y avanza
    const borde = []; for (let i = NY; i >= 0; i--) borde.push([X0, lerpN(YA, YB, i / NY)]); for (let j = 1; j <= NX; j++) borde.push([lerpN(X0, X1, j / NX), YA]); for (let i = 1; i <= NY; i++) borde.push([X1, lerpN(YA, YB, i / NY)]);
    { const pos = [], cs = [], uv = [], idx = []; borde.forEach(([X, y], k) => { for (const d of [.8, -14]) { const p = rel(SX(X, y).addScaledVector(radial(X / RF0), d)); pos.push(p.x, p.y, p.z); uv.push(k / 6, d / 22); tmpC.copy(C.roca1).lerp(C.rocaO, d < 0 ? .5 : .15); cs.push(tmpC.r, tmpC.g, tmpC.b) } });
      for (let k = 0; k < borde.length - 1; k++) { const a = k * 2; idx.push(a, a + 1, a + 2, a + 2, a + 1, a + 3) } L.push([orientar(geoC(pos, cs, idx, uv), 2, V3(-1, 0, 0))]) }
    // piso de la boca: de la placa hacia adentro (encía cerca del labio → oscuro al fondo)
    { const pos = [], cs = [], uv = [], idx = [], NX2 = 40, ND = 16; for (let i = 0; i <= ND; i++) for (let j = 0; j <= NX2; j++) { const X = lerpN(-35, 35, j / NX2), d = lerpN(.5, -20, i / ND), p = rel(SX(X, YM - 3.8, false)).addScaledVector(radial(X / RF0), d); p.y -= .04 * X * X / 35 * 0;
        pos.push(p.x, p.y, p.z); uv.push(X / 10, d / 10); tmpC.copy(C.encia).lerp(C.enciaO, sst(0, -6, d)).lerp(C.garganta, sst(-5, -14, d)); cs.push(tmpC.r, tmpC.g, tmpC.b) }
      for (let i = 0; i < ND; i++) for (let j = 0; j < NX2; j++) { const a = i * (NX2 + 1) + j, b = a + NX2 + 1; idx.push(a, b, a + 1, a + 1, b, b + 1) }
      L.push([orientar(geoC(pos, cs, idx, uv), 4 * (NX2 + 1) + 20, V3(0, 1, 0))]) }
    L.push([gLabioI], [gEnciaI]);
    const g = unirC(L); doblable(g, x => x, (x, y) => sst(-30, -2, y));
    const m = new THREE.Mesh(g, M_BOCA); m.castShadow = m.receiveShadow = true; J.add(m);
    // lengua de piedra (rosada gris, con surco al medio), sobre el piso, detrás de los dientes
    const gl = new THREE.SphereGeometry(1, 40, 20), p = gl.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), sur = y > 0 ? -.35 * ex(-((x / .12) ** 2)) * y : 0, nn = (n3(x * 4, y * 4, z * 4) - .5) * .1; p.setXYZ(i, x * 16 * (1 + nn), (y + sur) * 5.4 * (1 + nn), z * 11 * (1 + nn)) }
    gl.computeVertexNormals(); pintar(gl, (c, x, y, z) => c.copy(C.lengua).lerp(C.enciaO, sst(1, -3, y) * .6 + (n3(x * .5, y * .5, z * .5) - .5) * .5).lerp(C.garganta, sst(-2, -10, z) * .6));
    const ml = new THREE.Mesh(gl, M_BOCA); const lc = rel(SX(0, YM - 4.2, false)).addScaledVector(radial(0), -15.5); ml.position.copy(lc); LENGUA.m = ml; LENGUA.p = lc.clone(); ml.castShadow = ml.receiveShadow = true; J.add(ml) }
  // el interior: una bolsa que sale del borde del agujero y se cierra a 32 m (labio → encía → garganta negra)
  { const NT = 128, RINGS = [[1.1, -.9], [1.03, 0], [.99, 1.2], [.975, 2.4], [.97, 3.6]]; for (let k = 1; k <= 11; k++) { const d = 3.6 + k * 2.6; RINGS.push([.97 * Math.sqrt(Math.max(.04, 1 - ((d - 3.6) / 31) ** 2)), d]) }
    const pos = [], cs = [], uv = [], idx = [], ring = (s, d) => { for (let j = 0; j <= NT; j++) { const th = j / NT * 6.283 - Math.PI / 2, cx = Math.cos(th), sy = Math.sin(th), X = MW * Math.sign(cx) * Math.sqrt(Math.abs(cx)) * s, y = YC0 + HH * Math.sign(sy) * Math.sqrt(Math.abs(sy)) * s;
        const p = rel(SX(X, y).addScaledVector(radial(X / RF0), -d)); pos.push(p.x, p.y, p.z); uv.push(j / 8, d / 12);
        tmpC.copy(d < .5 ? C.labio : d < 3 ? C.encia : C.enciaO).lerp(C.garganta, sst(5, 13, d)).lerp(C.negro, sst(13, 24, d)); if (d < 1) tmpC.lerp(C.labioO, .3); cs.push(tmpC.r, tmpC.g, tmpC.b) } };
    RINGS.forEach(([s, d]) => ring(s, d)); for (let k = 0; k < RINGS.length - 1; k++) for (let j = 0; j < NT; j++) { const a = k * (NT + 1) + j, b = a + NT + 1; idx.push(a, b, a + 1, a + 1, b, b + 1) }
    const ic = pos.length / 3, pc = rel(SX(0, YC0).addScaledVector(radial(0), -36)); pos.push(pc.x, pc.y, pc.z); uv.push(0, 0); cs.push(C.negro.r, C.negro.g, C.negro.b); const lk = (RINGS.length - 1) * (NT + 1); for (let j = 0; j < NT; j++) idx.push(lk + j, ic, lk + j + 1);
    const g = orientar(geoC(pos, cs, idx, uv), ic, V3(0, 0, 1)); doblable(g, x => x, (x, y, z, i) => { const k = Math.floor(i / (NT + 1)); return k >= RINGS.length ? 0 : 1 - sst(2, 9, RINGS[k][1]) }, .75);
    const m = new THREE.Mesh(g, M_BOCA); m.receiveShadow = true; UG.add(m) }

  // ================= LOS OJOS: globo de piedra pálida con iris ámbar, párpados de roca (borde grueso) con musgo encima
  const OJOS = [-1, 1].map(lado => { const ph = lado * 25 / RF0, c = S(ph, 112, false).addScaledVector(radial(ph), -4.5), E = new THREE.Group(); E.position.copy(c); E.rotation.set(.06, ph, 0, "YXZ"); G.add(E);
    const bola = new THREE.Mesh(new THREE.SphereGeometry(9, 48, 32), M_OJO); bola.rotation.y = -Math.PI / 2 + Math.PI; E.add(bola);
    const parpado = (arriba) => { const g = new THREE.SphereGeometry(9.9, 48, 16, 0, 2 * Math.PI, arriba ? 0 : Math.PI / 2, Math.PI / 2), t = new THREE.TorusGeometry(9.9, 1.25, 10, 64); t.rotateX(Math.PI / 2);
      const gg = unirC([[g], [t]]); pintar(gg, (cc, x, y, z) => { const n1 = f3(x * .2, y * .2, z * .2, 2); cc.copy(C.roca1).lerp(C.roca2, n1); if (Math.abs(y) < 1.4) cc.lerp(C.rocaO, .55); if (arriba && y > 5.5 + (n1 - .5) * 5) cc.lerp(C.musgo, .9); if (!arriba && y < -7) cc.lerp(C.musgo, .5) });
      const m = new THREE.Mesh(gg, M_LABIO), P = new THREE.Group(); P.add(m); m.castShadow = m.receiveShadow = true; E.add(P); return P };
    return { E, bola, sup: parpado(true), inf: parpado(false), lado } });
  // la textura del ojo tiene el iris en u = .25 (dirección +z de la esfera después del giro): se acomoda acá
  OJOS.forEach(o => { o.bola.rotation.set(0, 0, 0) });

  // ================= PINOS en las laderas (los mismos del bosque de lejos), pasto y nieve ya están en los colores
  { const q = rng(9150), P = []; for (let k = 0; k < 9000 && P.length < 760; k++) { const ph = (q() * 2 - 1) * Math.PI, y = -3 + Math.pow(q(), 1.25) * 128; if (Math.abs(ph) < .95 && y > 12) continue; if (Math.abs(ph) < .62) continue;
      const n = nrm(ph, y); if (n.y < .5 + q() * .15) continue; if (q() > 1 - sst(100, 128, y)) continue; const p = S(ph, y); P.push([p, 6 + q() * 8 * (1 - y / 200), k % 3]) }
    const ims = LEJOS_T.pinos.map(src => { const m = new THREE.InstancedMesh(src.geometry, src.material, P.length); m.count = 0; m.castShadow = true; m.receiveShadow = true; G.add(m); return m }), cc = new THREE.Color();
    P.forEach(([p, s, v]) => { const m = ims[v], i = m.count++; dummy.position.set(p.x, p.y - .6, p.z); dummy.rotation.set((q() - .5) * .08, q() * 6, (q() - .5) * .08); dummy.scale.set(s * (.8 + q() * .3), s, s * (.8 + q() * .3)); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); const v2 = .6 + q() * .4; m.setColorAt(i, cc.setRGB(v2 * .85, v2, v2 * .8)) }) }
  // los pinos del bosque de lejos que quedaban adentro de la montaña (o donde se inclina la cara) se esconden
  { const m4 = new THREE.Matrix4(), p = V3(0, 0, 0); LEJOS_T.pinos.forEach(m => { for (let i = 0; i < m.count; i++) { m.getMatrixAt(i, m4); p.setFromMatrixPosition(m4); const dx = p.x - CX, dz = p.z - CZ, ph = Math.atan2(dx, dz), rr = Math.hypot(dx, dz);
    if (rr < rBase(ph, Math.max(0, p.y - Y0) + 2, false) + 12 || (Math.abs(p.x) < 62 && p.z < -127) || PICOS.some(([x, z, h, R]) => Math.hypot(dx - x, dz - z) < R * 1.2 + 10)) { m4.scale(V3(0, 0, 0)); m.setMatrixAt(i, m4) } } m.instanceMatrix.needsUpdate = true }) }

  // ================= OFRENDAS: postes en el talud del frente con sogas de collares de dientes de leche y banderines de colores
  { const q = rng(9160), POST = [], SOG = [];
    for (const [yy, x0, x1, paso] of [[5, -66, 66, 7.5], [11.5, -52, 52, 6.5], [-.5, -74, 74, 8.5]]) { const fila = []; for (let X = x0; X <= x1 + .01; X += paso) { const ph = (X + (q() - .5) * 2) / 104, p = S(ph, yy, false); fila.push([p, 2.6 + q() * .9]) } POST.push(...fila); for (let i = 0; i < fila.length - 1; i++) SOG.push([fila[i], fila[i + 1]]) }
    const L = []; POST.forEach(([p, h]) => { const g = new THREE.CylinderGeometry(.13, .17, h + .6, 7); g.translate(0, (h + .6) / 2 - .6, 0); L.push([g, TM(p.x, p.y, p.z, (q() - .5) * .1, 0, (q() - .5) * .1)]); const tp = new THREE.ConeGeometry(.2, .3, 7); tp.translate(0, h + .15, 0); L.push([tp, TM(p.x, p.y, p.z)]) });
    const ms = new THREE.Mesh(mergeG(L), new THREE.MeshStandardMaterial({ color: "#5a3a22", roughness: .9 })); ms.castShadow = ms.receiveShadow = true; G.add(ms);
    // sogas (catenarias) + dientes colgando + banderines
    const cuerda = [], dientes = [], band = []; SOG.forEach(([[a, ha], [b, hb]]) => { const A = a.clone().add(V3(0, ha, 0)), B = b.clone().add(V3(0, hb, 0)), N = 26, sag = .7 + A.distanceTo(B) * .07, pts = [];
      for (let i = 0; i <= N; i++) { const t = i / N, p = A.clone().lerp(B, t); p.y -= sag * 4 * t * (1 - t); pts.push(p) }
      cuerda.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, .04, 5, false));
      const len = A.distanceTo(B); for (let s = .18; s < len - .1; s += .2) { const t = s / len, p = A.clone().lerp(B, t); p.y -= sag * 4 * t * (1 - t); dientes.push([p.x, p.y - .12, p.z, q() * 6, .8 + q() * .5]);
        if (q() < .14) { const n = 3 + (q() * 5 | 0); for (let k = 1; k <= n; k++) dientes.push([p.x + (q() - .5) * .04, p.y - .12 - k * .2, p.z + (q() - .5) * .04, q() * 6, .8 + q() * .5]) } }
      for (let s = .5; s < len - .3; s += .95) { const t = s / len, p = A.clone().lerp(B, t); p.y -= sag * 4 * t * (1 - t); band.push([p, Math.atan2(B.x - A.x, B.z - A.z)]) } });
    const mc = new THREE.Mesh(mergeG(cuerda.map(g => [g, new THREE.Matrix4()])), new THREE.MeshStandardMaterial({ color: "#c9a878", roughness: 1 })); G.add(mc);
    const gD = new THREE.SphereGeometry(1, 8, 6), pd = gD.attributes.position; for (let i = 0; i < pd.count; i++) { const y = pd.getY(i); pd.setXYZ(i, pd.getX(i) * .07 * (y < 0 ? .7 : 1), y * .1 + (y < -.5 ? -.03 : 0), pd.getZ(i) * .06) } gD.computeVertexNormals();
    const iD = new THREE.InstancedMesh(gD, new THREE.MeshStandardMaterial({ color: "#fbf8ee", roughness: .35 }), dientes.length); dientes.forEach(([x, y, z, r, s], i) => { dummy.position.set(x, y, z); dummy.rotation.set((q() - .5) * .6, r, (q() - .5) * .6); dummy.scale.setScalar(s); dummy.updateMatrix(); iD.setMatrixAt(i, dummy.matrix) }); G.add(iD);
    const gB = new THREE.BufferGeometry(); gB.setAttribute("position", new THREE.Float32BufferAttribute([-.32, 0, 0, .32, 0, 0, 0, -.75, 0], 3)); gB.setAttribute("normal", new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 0, 0, 1], 3));
    const iB = new THREE.InstancedMesh(gB, new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .8, side: THREE.DoubleSide }), band.length), BC = ["#e8322a", "#ffc21a", "#2a7ae8", "#34b04a", "#ff7a1a", "#d040c0"].map(h => new THREE.Color(h));
    band.forEach(([p, ry], i) => { dummy.position.copy(p); dummy.rotation.set((q() - .5) * .3, ry + Math.PI / 2, (q() - .5) * .2); dummy.scale.setScalar(1); dummy.updateMatrix(); iB.setMatrixAt(i, dummy.matrix); iB.setColorAt(i, BC[i % BC.length]) }); G.add(iB) }

  // ================= CASCADAS chicas (agua que corre, espuma abajo)
  const CASC = []; { const L = []; for (const [X0, ya, yb, ph0] of [[-52, 98, 20, null], [50, 92, 22, null], [0, 124, 6, -1.12]]) { const pos = [], uv = [], idx = [], N = 40; for (let i = 0; i <= N; i++) { const y = lerpN(ya, yb, i / N), ph = ph0 ?? X0 / RF0, phw = ph + .012 * Math.sin(y * .15), n = nrm(phw, y), p = S(phw, y).addScaledVector(n, .5), tg = V3(Math.cos(phw), 0, -Math.sin(phw)), w = 1.4 + .9 * i / N;
        for (const s of [-1, 1]) { const q2 = p.clone().addScaledVector(tg, s * w); pos.push(q2.x, q2.y, q2.z); uv.push(s < 0 ? 0 : 1, (ya - y) / 30) } }
      for (let i = 0; i < N; i++) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3) } const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); L.push([g, null]);
      const ph = ph0 ?? X0 / RF0, pb = S(ph, yb).addScaledVector(nrm(ph, yb), 1.2); CASC.push(pb) }
    const mA = new THREE.MeshStandardMaterial({ map: T_AGUA, transparent: true, depthWrite: false, roughness: .15, color: "#e8f6ff", emissive: "#8fd0ff", emissiveIntensity: .35, side: THREE.DoubleSide });
    const ma = new THREE.Mesh(mergeG(L.map(([g]) => [g, new THREE.Matrix4()])), mA); ma.renderOrder = 2; ma.onBeforeRender = () => { T_AGUA.offset.y = -(AMB.t || 0) * .55 }; G.add(ma);
    CASC.forEach(p => { for (let k = 0; k < 3; k++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#ffffff", transparent: true, opacity: .55, depthWrite: false })); s.position.copy(p).add(V3((k - 1) * 1.8, k * .8, 0)); s.scale.setScalar(6 + k * 2); G.add(s) } }) }

  // ================= POLVO al inclinarse (en el pie del frente, en el mundo) y MONEDAS DE ORO (en el mundo)
  const POLVO = []; { const q = rng(9170); for (let k = 0; k < 26; k++) { const ph = (q() - .5) * 1.6, p = S(ph, -2, false), s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#d8c09a", transparent: true, opacity: 0, depthWrite: false, fog: true })); s.position.set(p.x + CX, ALT_T(p.x + CX, p.z + CZ) + 6 + q() * 10, p.z + CZ + 6); s.scale.setScalar(26 + q() * 26); s.visible = false; scene.add(s); POLVO.push(s) } }
  const NORO = 340, ORO = new THREE.InstancedMesh(new THREE.CylinderGeometry(.62, .62, .14, 20), new THREE.MeshStandardMaterial({ color: "#ffc63a", metalness: .85, roughness: .28, emissive: "#7a4a00", emissiveIntensity: .45 }), NORO);
  ORO.count = 0; ORO.frustumCulled = false; ORO.castShadow = true; scene.add(ORO);
  const ORO_P = (() => { const q = rng(9180); return Array.from({ length: NORO }, () => ({ b: Math.pow(q(), 1.3) * 2.6, x: (q() - .5) * 34, vf: 5 + q() * 9, vu: -1 + q() * 6, vl: (q() - .5) * 5, sp: 4 + q() * 10, ax: q() * 6, ry: q() * 6 })) })();
  rectAdd({ x: CX, z: CZ - 10, ry: 0, w: 300, d: 280, monte: 1 });

  // ================= ESTADO Y API
  const st = { boca: 0, ojos: .12, sonr: 0, incl: 0, mast: 0, tem: 0, mira: null, miraU: 0, D: 0 };
  let sonrHecha = -1;
  const PIV = V3(0, -60, 0), ANG = .38, ADEL = 8;
  const mundo = p => G.localToWorld(p.clone());
  const dirMundo = d => d.clone().applyQuaternion(G.quaternion);
  const aplicarG = () => { const e = st.incl * st.incl * (3 - 2 * st.incl), a = ANG * e; G.rotation.set(a, 0, 0); const pv = PIV.clone().applyAxisAngle(V3(1, 0, 0), a); G.position.set(CX, Y0 + PIV.y - pv.y, CZ + ADEL * e + PIV.z - pv.z); G.updateMatrixWorld(true);
    POLVO.forEach((s, k) => { const o = Math.sin(Math.PI * Math.min(1, st.incl)) * .55 * (st.incl > 0 && st.incl < 1 ? 1 : 0); s.visible = o > .01; s.material.opacity = o }) };
  const aplicarJ = () => { // la mandíbula: baja D y avanza .3 D; no se mete bajo el piso (si la montaña está inclinada, se apoya en la calle)
    let D = 26 * st.boca; const fw = V3(0, -1, .3); if (D > 0) { const p0 = mundo(O.clone().add(V3(0, LABIO_I.y - YM - LABIO_I.rv, LABIO_I.out))), dw = dirMundo(fw), gy = ALT_T(p0.x, p0.z) + 1.2; if (dw.y < 0) D = Math.min(D, Math.max(0, (p0.y - gy) / -dw.y)) }
    st.D = D; J.position.copy(O).addScaledVector(fw, D); LENGUA.m.position.copy(LENGUA.p).add(V3(0, .32 * D, -.1 * D)); J.rotation.set(.05 * D / 26, st.mast ? .025 * Math.sin(st.mastF) * st.mast : 0, 0); J.updateMatrixWorld(true) };
  const aplicarSonrisa = () => { const S0 = st.sonr; if (S0 === sonrHecha) return; sonrHecha = S0; DOBLAR.forEach(({ g, y0, bx, bw }) => { const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, y0[i] + S0 * 10 * Math.min(1.4, (bx[i] / 32) ** 2) * bw[i]); p.needsUpdate = true }) };
  const aplicarOjos = () => { const u = st.ojos, a = lerpN(.36, -.55, u), b = lerpN(.3, .62, u); OJOS.forEach(o => { o.sup.rotation.set(a, 0, 0); o.inf.rotation.set(b, 0, 0);
      if (st.mira) { const tl = o.E.worldToLocal(V3(...st.mira)).normalize(), ang = Math.min(.45, Math.acos(Math.max(-1, Math.min(1, tl.z)))), ax = V3(-tl.y, tl.x, 0); if (ax.lengthSq() > 1e-6) o.bola.quaternion.setFromAxisAngle(ax.normalize(), ang * st.miraU); else o.bola.quaternion.identity() } else o.bola.quaternion.identity() }) };
  const API = {
    G, Y0, CX, CZ, alto: () => H,
    reset() { st.boca = 0; st.ojos = .12; st.sonr = 0; st.incl = 0; st.mast = 0; st.tem = 0; st.mira = null; st.miraU = 0; ORO.count = 0; aplicarG(); aplicarJ(); aplicarSonrisa(); aplicarOjos() },
    boca(u) { st.boca = Math.max(0, Math.min(1, u)); aplicarJ() },
    inclinar(u) { st.incl = Math.max(0, Math.min(1, u)); aplicarG(); aplicarJ(); aplicarOjos(); st.tem = Math.max(st.tem, .045 * Math.sin(Math.PI * st.incl) * (st.incl < 1 ? 1 : 0)) },
    masticar(t, u) { st.mast = Math.max(0, Math.min(1, u)); st.mastF = t * 2 * Math.PI * .75; const c = .5 - .5 * Math.cos(st.mastF); st.boca = st.mast * (.08 + .34 * c); aplicarJ(); st.tem = Math.max(st.tem, .025 * st.mast * Math.pow(1 - c, 6)) },
    ojos(u) { st.ojos = Math.max(0, Math.min(1, u)); aplicarOjos() },
    mirar(p, u = 1) { st.mira = p; st.miraU = u; aplicarOjos() },
    sonreir(u) { st.sonr = Math.round(Math.max(0, Math.min(1, u)) * 200) / 200; aplicarSonrisa() },
    escupirOro(t, u) { const tau = Math.max(0, u) * 4.5, g = 9.8, fw = dirMundo(V3(0, -.12, 1)).normalize(), lat = dirMundo(V3(1, 0, 0)), inv = new THREE.Matrix4().copy(G.matrixWorld).invert(), lp = V3(0, 0, 0); let n = 0;
      const base = mundo(O.clone().add(V3(0, -st.D - 1.5, 3 + .3 * st.D)));
      for (let i = 0; i < NORO; i++) { const c = ORO_P[i]; let age = tau - c.b; if (age <= 0) continue; const p0 = base.clone().addScaledVector(lat, c.x * (.4 + .6 * Math.min(1, st.boca + .3))),
          v = fw.clone().multiplyScalar(c.vf).addScaledVector(lat, c.vl); v.y += c.vu; let x = p0.x, y = p0.y, z = p0.z, vx = v.x, vy = v.y, vz = v.z, quieto = false; const dt = 1 / 16;
        for (let s = 0; s < age; s += dt) { const h = Math.min(dt, age - s); x += vx * h; y += vy * h - g * h * h / 2; z += vz * h; vy -= g * h; const gy = ALT_T(x, z) + .07; if (y <= gy) { y = gy; quieto = true; break }
          lp.set(x, y, z).applyMatrix4(inv); const ph = Math.atan2(lp.x, lp.z); if (lp.y < 40 && Math.hypot(lp.x, lp.z) < lerpN(rS0(lp.y), rF0(lp.y), wCara(ph)) - .5 && !(Math.abs(ph) < .45 && lp.y > YM - 40)) { quieto = true; break } }
        dummy.position.set(x, y, z); if (quieto) dummy.rotation.set(0, c.ry, 0); else dummy.rotation.set(c.ax + age * c.sp, c.ry, age * c.sp * .7); dummy.scale.setScalar(1); dummy.updateMatrix(); ORO.setMatrixAt(n++, dummy.matrix) }
      ORO.count = n; ORO.instanceMatrix.needsUpdate = true; st.tem = Math.max(st.tem, .008 * Math.min(1, u * 4)) },
    temblor(t) { return st.tem },
    bocaW() { return mundo(O.clone().add(V3(0, -st.D / 2 - 1, 1 + .3 * st.D))).toArray() },
    labioW(dx = 0) { const sb = st.sonr * 10 * Math.min(1.4, (dx / 32) ** 2), rv = 1.5 + 3.1 * Math.pow(Math.max(0, 1 - (dx / 32) ** 2), .55), ph = dx / RF0;
      const pl = SX(dx, LABIO_I.y, false).addScaledVector(radial(ph), LABIO_I.out + rBase(ph, YM, true) - rBase(ph, YM, false) - .6); pl.y += sb; const w = J.localToWorld(pl.sub(O)); w.y += rv; return w.toArray() },
    ojoW(lado = 1) { const o = OJOS[lado < 0 ? 0 : 1]; return o.E.localToWorld(V3(0, 0, 9.5)).toArray() },
    caraW() { return mundo(SX(0, 90)).toArray() },
    pieW() { const p = mundo(S(0, 0, false)); p.y = ALT_T(p.x, p.z); return p.toArray() },
    caraCam(d = 60, ang = 0, dy = 0) { const c = mundo(SX(0, 88)), n = dirMundo(V3(Math.sin(ang), 0, Math.cos(ang))); return c.addScaledVector(n, d).add(V3(0, dy, 0)).toArray() },
    rBase, S, O, YM
  };
  API.reset(); window.MONTE = API; return API })();
// el estado de la montaña se limpia en cada cuadro (los cuadros se renderizan desordenados): se cuelga de mundoReset
{ const _mr0 = mundoReset; mundoReset = function () { _mr0(); MONTE.reset() } }

// ================= CLIMA «dia»: mañana dorada (sol bajo del sudeste: sombras largas hacia el noroeste), cielo azul saturado, niebla muy leve
ENV_HOLLOW.dia = { top: "#1f6fd8", hor: "#b4dcf6", fog: .0011, hemi: 1.15, hemiG: "#8a6a40", sun: 3.5, sunCol: "#ffd496", exp: 1.02, grade: ["#ffb060", .05], sol: [.7, .4, .6], sombra: 90,
  velas: 0, ventanas: 0, tiembla: .3, estrellas: 0, luna: 0, niebla: 0, polvo: .35, humo: "#e0d8d0", luces: 0, cielo: 0, nubes: .75 };
// de día: nubes blancas (no duraznas), siluetas lejanas verdes-azuladas que se aclaran con la distancia; y el gancho de prueba de la montaña
{ const _lejos0 = lejos, QSM = new URLSearchParams(location.search);
  lejos = function (t) { _lejos0(t);
    if (ENVNOW === "dia") { const U = LEJOS_T.nub.material.uniforms; U.uLit.value.set("#ffffff"); U.uDark.value.set("#c4d4ea"); U.uOp.value = .9;
      LEJOS_T.BANDAS.forEach(({ U }, k) => { U.uCol.value.set(["#4f7446", "#6f92ae", "#9cb9d6"][k]); U.uHor.value.set(["#8fb0a0", "#a9c8e0", "#b8d8f2"][k]); U.uFog.value = [.08, .2, .35][k]; U.uRim.value.set("#000000") }) }
    // prueba (solo con ?mt): …&mt=1&mb=boca&mo=ojos&ms=sonrisa&mi=inclinar&mm=masticar&mg=oro&mp=1 (Toby/ME parado en el labio)&msol=1 (sombras en la cara)
    if (QSM.has("mt")) { const f = k => +(QSM.get(k) || 0);
      MONTE.inclinar(f("mi")); MONTE.boca(f("mb")); if (QSM.has("mm")) MONTE.masticar(t, f("mm")); MONTE.ojos(QSM.has("mo") ? f("mo") : .12); MONTE.sonreir(f("ms")); if (QSM.has("mmira")) MONTE.mirar(cam.position.toArray(), 1);
      if (QSM.has("mg")) MONTE.escupirOro(t, f("mg"));
      if (QSM.has("mp")) { const p = MONTE.labioW(+(QSM.get("mpx") || 6)); enAire(ME, p, 0); setFace(ME, "terror") }
      if (QSM.has("msol")) { const b = MONTE.bocaW(); SOL.x = b[0]; SOL.z = b[2]; SOL.r = 70; ambiente(t) }
      R.toneMappingExposure *= 1.18 } } }
