// ================= GUSTHOLLOW: el mundo (valle alto ventoso, pueblo de piedra encadenado, torre con veleta, árboles torcidos, pasto peinado) =================
// Norte = −z. El viento sopla SIEMPRE hacia +x. Todo lo de la tortuga y del mar del motor se esconde: el piso es una malla propia (SUELO).
// Zona de este archivo: x de −460 a 100 (la malla termina en x = 100 con un faldón que baja hasta x = 104), z de −460 a 460.
// Desde x = 88 al este SUELO = ALT exacto (ahí empalma la cordillera del otro archivo).
TURT.children.forEach(o => o.visible = false);
CABEZA.visible = false; ALETAS.forEach(a => a.piv.visible = false); COLA.visible = false; COSTA.visible = false; FOAM.visible = false; FONDO.visible = false; HONDA.visible = false;
BOTES.forEach(b => b.visible = false); GAVIOTAS.forEach(g => g.visible = false); LUCES.forEach(l => l.visible = false); ESPUMA.forEach(s => s.visible = false); SALPI.forEach(s => s.visible = false);
NUBE.forEach(s => s.visible = false); ROPA3.forEach(m => m.visible = false); GALLINAS.forEach(g => g.visible = false); NUBES.forEach(g => g.visible = false);
HOUSES.forEach(H => H.g.visible = false);

// ---------- ayudantes
const sst = (a, b, x) => { const q = cl((x - a) / (b - a)); return q * q * (3 - 2 * q) };
const hash2 = (i, j) => { let n = (Math.imul(i | 0, 374761393) + Math.imul(j | 0, 668265263)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296 };
const ruido2 = (x, z) => { const i = Math.floor(x), j = Math.floor(z), u = x - i, v = z - j, a = u * u * (3 - 2 * u), b = v * v * (3 - 2 * v); return lerp(lerp(hash2(i, j), hash2(i + 1, j), a), lerp(hash2(i, j + 1), hash2(i + 1, j + 1), a), b) };
const fbm2 = (x, z, o = 4) => { let s = 0, a = .5, f = 1, n = 0; for (let k = 0; k < o; k++) { s += a * ruido2(x * f + k * 17.3, z * f - k * 9.1); n += a; a *= .5; f *= 2.03 } return s / n };
const TM = (x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, "YXZ")), new THREE.Vector3(sx, sy, sz));
// lote: junta piezas por material y las une en una sola malla por material (pocas llamadas de dibujo)
const lote = () => { const L = {}; return { L, add(k, geo, m) { (L[k] ||= []).push([geo, m || new THREE.Matrix4()]); return this },
  fin(par, mats, o = {}) { const out = {}; for (const k in L) { if (!mats[k]) throw new Error("lote sin material: " + k); const me = new THREE.Mesh(mergeG(L[k]), mats[k]); me.castShadow = o.sombra !== false; me.receiveShadow = true; par.add(me); out[k] = me } return out } } };
const linC = h => { const c = new THREE.Color(h); return [c.r, c.g, c.b] };
const mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const envuelto = (g, w, h, fn) => { for (const dx of [-w, 0, w]) for (const dy of [-h, 0, h]) { g.save(); g.translate(dx, dy); fn(); g.restore() } };
const geoPiedra = (seed, det = 1, ach = .7) => { const g = new THREE.IcosahedronGeometry(1, det), p = g.attributes.position, r = rng(seed), fx = r() * 9, fy = r() * 9; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = .72 + .5 * ruido2(x * 1.7 + fx + y, z * 1.7 + fy - y); p.setXYZ(i, x * k, y * k * ach, z * k) } g.computeVertexNormals(); return g };
const geoUV = (g, fu, fv) => { const p = g.attributes.position, u = g.attributes.uv; for (let i = 0; i < p.count; i++) u.setXY(i, fu(p.getX(i), p.getY(i), p.getZ(i)), fv(p.getX(i), p.getY(i), p.getZ(i))); return g };
// uv de muro en metros según la cara (s = metros que cubre la textura)
const uvMuro = (g, s = 3.2, ox = 0, oy = 0) => { const p = g.attributes.position, n = g.attributes.normal, u = g.attributes.uv; for (let i = 0; i < p.count; i++) { const nx = n.getX(i), ny = n.getY(i), nz = n.getZ(i); let U, V;
    if (Math.abs(ny) > .75) { U = p.getX(i) / s; V = p.getZ(i) / s } else if (Math.abs(nx) > Math.abs(nz)) { U = -p.getZ(i) / s * Math.sign(nx); V = p.getY(i) / s } else { U = p.getX(i) / s * Math.sign(nz); V = p.getY(i) / s } u.setXY(i, U + ox, V + oy) } return g };
const cilEntre = (a, b, r, seg = 7, r2 = r) => { const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b), d = Bv.clone().sub(A); return [new THREE.CylinderGeometry(r2, r, 1, seg), MZ(A.clone().add(Bv).multiplyScalar(.5), d, new THREE.Vector3(1, d.length(), 1))] };
// esquinas redondeadas para pintar piedras (polígono con curvas en cada vértice)
const redondo = (g, P, rad) => { const n = P.length; g.beginPath(); for (let i = 0; i <= n; i++) { const a = P[i % n], pv = P[(i + n - 1) % n], nx = P[(i + 1) % n], d1 = Math.hypot(pv[0] - a[0], pv[1] - a[1]) || 1, d2 = Math.hypot(nx[0] - a[0], nx[1] - a[1]) || 1, r1 = Math.min(rad, d1 / 2) / d1, r2 = Math.min(rad, d2 / 2) / d2;
    const p1 = [a[0] + (pv[0] - a[0]) * r1, a[1] + (pv[1] - a[1]) * r1], p2 = [a[0] + (nx[0] - a[0]) * r2, a[1] + (nx[1] - a[1]) * r2]; if (i === 0) g.moveTo(p2[0], p2[1]); else { g.lineTo(p1[0], p1[1]); g.quadraticCurveTo(a[0], a[1], p2[0], p2[1]) } } g.closePath() };

// ---------- el viento: uniformes que mueven pasto, copas, telas, banderines (el detalle los reutiliza)
const VIENTO = { value: 0 }, RAFAGA = { value: 1 };   // VIENTO = t; RAFAGA = fuerza (1 normal, 2 tormenta, 0 calma)
// modo "tela": uv.x = distancia al borde atado (0 → 1); "pasto": uv.y = altura (0 → 1), se dobla hacia +x; "copa": según la altura local
const conViento = (m, modo = "tela", amp = .12) => { if (modo === "tela" || modo === "toldo") m.side = THREE.DoubleSide; m.onBeforeCompile = sh => { sh.uniforms.uVt = VIENTO; sh.uniforms.uVa = RAFAGA;
  const cuerpo = modo === "tela" || modo === "toldo" ? `float w = ${modo === "toldo" ? "sin(uv.x * 3.1416) * sin(uv.y * 3.1416) * .7" : "uv.x"}; float f = sin(uVt * 12. - uv.x * 4.2 + wp.z * 1.3 + wp.x * .3) + .4 * sin(uVt * 19. - uv.x * 7.5 + wp.z * 2.3) + .18 * sin(uVt * 29. + uv.y * 5.);
      transformed += normal * f * w * ${amp.toFixed(3)} * (.25 + .75 * uVa); transformed.x -= w * w * .05 * abs(f) * uVa;`
    : modo === "pasto" ? `float hh = uv.y * uv.y; float ola = .55 + .45 * sin(uVt * 3.4 - wp.x * .32 + wp.z * .11) + .25 * sin(uVt * 7.9 - wp.x * .9 + wp.z * .7);
      transformed.x += hh * ${amp.toFixed(3)} * (.35 * min(uVa, 1.) + uVa * ola * .9); transformed.y -= hh * ${amp.toFixed(3)} * .35 * uVa * ola;`
    : `float hh = clamp(position.y * .22, 0., 1.); float f = sin(uVt * 2.7 - wp.x * .28 + wp.z * .1) + .45 * sin(uVt * 6.3 + wp.z * .8 - wp.x * .5);
      transformed += vec3(1., .25, .35) * f * hh * ${amp.toFixed(3)} * uVa; transformed.x += hh * ${amp.toFixed(3)} * .6 * uVa;`;
  sh.vertexShader = "uniform float uVt; uniform float uVa;\n" + sh.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>
  { vec4 wp = vec4(position, 1.);
  #ifdef USE_INSTANCING
    wp = instanceMatrix * wp;
  #endif
    wp = modelMatrix * wp; ${cuerpo} }`) }; m.customProgramCacheKey = () => "vientoG" + modo + amp; return m };

// ---------- altura real del piso: ALT (fuente común) + ondulaciones propias que se apagan hacia el borde de la zona y en el pueblo
const MASK_Z = (x, z) => (1 - sst(70, 88, x)) * (1 - sst(100, 128, -x)) * (1 - sst(100, 128, Math.abs(z)));
const detH = (x, z) => { const pu = 1 - sst(24, 58, Math.hypot(x, z - 3)); return (fbm2(x * .026 + 3, z * .026 + 8, 4) - .5) * 4.4 * (1 - pu * .85) + (fbm2(x * .13 + 1, z * .13 + 5, 2) - .5) * .5 * (1 - pu * .6) };
const PLAZA_Y = ALT(0, 0) + detH(0, 0);
function SUELO(x, z) { const m = MASK_Z(x, z); if (m <= 0) return ALT(x, z); let h = ALT(x, z) + detH(x, z) * m; const rp = Math.hypot(x, z); if (rp < 15) h = lerp(PLAZA_Y, h, sst(10.5, 15, rp)); return h }
const sueloN = (x, z, e = .6) => { const nx = SUELO(x - e, z) - SUELO(x + e, z), nz = SUELO(x, z - e) - SUELO(x, z + e), l = Math.hypot(nx, 2 * e, nz); return [nx / l, 2 * e / l, nz / l] };

// ---------- sendas de tierra (camino principal este–oeste con huellas de carro, calle al sur, senderos a la loma y a los campos)
const SENDAS = [[-110, 9, -11, 6, 3.4], [11, -1.5, 92, -4, 3.4], [1, 10, 7, 46, 2.6], [-7, 7, -21, 14, 1.5], [-21, 14, -26, 17, 1.2], [8, -9, 30, -34, 1.9], [-8, -8, -26, -36, 1.9], [26, -3, 34, 26, 1.6], [-40, 8, -52, -22, 1.5], [52, -3, 60, -30, 1.4], [-60, 9, -70, 34, 1.4], [40, -3, 48, 38, 1.4]];
const sendaK = (x, z) => { let k = 0; for (const [x0, z0, x1, z1, an] of SENDAS) { const dx = x1 - x0, dz = z1 - z0, t = cl(((x - x0) * dx + (z - z0) * dz) / (dx * dx + dz * dz)), d = Math.hypot(x - x0 - dx * t, z - z0 - dz * t) + (fbm2(x * .4, z * .4, 2) - .5) * 1.4; k = Math.max(k, 1 - sst(an * .45, an, d)) } return k };
// huellas de carro del camino principal (dos surcos)
const huellaK = (x, z) => { if (Math.abs(x) < 11 || x < -110 || x > 92) return 0; const zc = x < 0 ? lerp(9, 6, (x + 110) / 99) : lerp(-1.5, -4, (x - 11) / 81), d = Math.abs(z - zc); return Math.max(1 - sst(.12, .35, Math.abs(d - .8)), 0) };

// ---------- color del suelo por vértice: pasto ralo verde-amarillento con manchas secas, tierra en las sendas, roca gris en las pendientes, nieve no (eso es de la sierra)
const C_PASTO = linC("#93a456"), C_PASTO2 = linC("#7d9446"), C_SECO = linC("#c0b46e"), C_SECO2 = linC("#a8a060"), C_TIERRA = linC("#8a7356"), C_TIERRA2 = linC("#6e5a44"), C_ROCA = linC("#8a877c"), C_ROCA2 = linC("#a09c90"), C_PISADO = linC("#9a9068"), C_NIEVE = linC("#eef2f6");
function colorSuelo(x, z) { const n = fbm2(x * .045 + 11, z * .045 + 2, 4), n2 = fbm2(x * .27 + 5, z * .27 + 8, 2), n3 = fbm2(x * .012 + 40, z * .012 - 7, 3), nor = sueloN(x, z, 1.2), pend = 1 - nor[1];
  let c = mix3(C_PASTO, C_PASTO2, sst(.35, .7, n)); c = mix3(c, mix3(C_SECO, C_SECO2, n2), sst(.42, .68, n3) * .85);
  // vetas claras peinadas por el viento (alargadas en x)
  c = mix3(c, C_SECO, sst(.6, .8, fbm2(x * .05, z * .5, 2)) * .35);
  const pu = 1 - sst(20, 46, Math.hypot(x, z - 3)); c = mix3(c, C_PISADO, pu * (.25 + .35 * n2));
  const sk = sendaK(x, z); c = mix3(c, mix3(C_TIERRA, C_TIERRA2, n2), sk * .9); c = mix3(c, C_TIERRA2, huellaK(x, z) * .6);
  const alt = ALT(x, z); if (pend > .05) c = mix3(c, mix3(C_ROCA, C_ROCA2, n2), sst(.12, .4, pend) * .95);
  if (alt > 24) c = mix3(c, C_ROCA2, sst(24, 46, alt) * .55); if (alt > 88) c = mix3(c, C_NIEVE, sst(88, 115, alt) * (.5 + .5 * n2) * (1 - sst(.35, .6, pend) * .6));
  const s = .9 + .2 * n2; return [c[0] * s, c[1] * s, c[2] * s] }

// ---------- pasto: textura de detalle con briznas inclinadas hacia +x (u = x), matas, piedritas y tierra; el color grande viene por vértice
const T_PASTO_D = (() => { const [c, z] = pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(4101); c.fillStyle = "#e9ead8"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
    for (let k = 0; k < 220; k++) { const x = r() * w, y = r() * h, s = 30 + r() * 120, col = r() < .5 ? "rgba(120,130,70,.18)" : "rgba(255,250,220,.2)"; envuelto(c, w, h, () => { const gr = c.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, col); gr.addColorStop(1, "rgba(230,230,210,0)"); c.fillStyle = gr; c.fillRect(x - s, y - s, s * 2, s * 2) }) }
    // tierra que asoma entre las matas
    for (let k = 0; k < 90; k++) { const x = r() * w, y = r() * h, s = 10 + r() * 30; envuelto(c, w, h, () => { c.fillStyle = "rgba(120,96,66,.28)"; c.beginPath(); c.ellipse(x, y, s * 1.6, s * .7, 0, 0, 7); c.fill() }) }
    // briznas: todas acostadas hacia +u (el viento), con la base abajo; claras y oscuras
    for (let k = 0; k < 16000; k++) { const x = r() * w, y = r() * h, L = 8 + r() * 22, a = -.25 - r() * .45, cl2 = r(); const col = cl2 < .45 ? `rgba(70,90,30,${.12 + r() * .18})` : cl2 < .8 ? `rgba(255,250,200,${.1 + r() * .16})` : `rgba(200,180,90,${.14 + r() * .18})`;
      c.strokeStyle = col; c.lineWidth = 1.2 + r() * 1.6; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + L * .5, y + Math.sin(a) * L * .5, x + L * Math.cos(a * .6), y + Math.sin(a) * L); c.stroke();
      z.strokeStyle = cl2 < .45 ? "rgba(60,60,60,.35)" : "rgba(210,210,210,.35)"; z.lineWidth = 2; z.beginPath(); z.moveTo(x, y); z.lineTo(x + L * Math.cos(a * .6), y + Math.sin(a) * L); z.stroke() }
    for (let k = 0; k < 160; k++) { const x = r() * w, y = r() * h, s = 2 + r() * 5, a = r() * 3; envuelto(c, w, h, () => { c.fillStyle = "rgba(40,36,30,.14)"; c.beginPath(); c.ellipse(x + 2, y + 2, s, s * .7, a, 0, 7); c.fill(); c.fillStyle = rgbj(["#c8c2b6", "#aaa69a", "#d8d2c4", "#9a9488"][r() * 4 | 0], r, 20); c.beginPath(); c.ellipse(x, y, s, s * .7, a, 0, 7); c.fill() });
      envuelto(z, w, h, () => { z.fillStyle = "rgba(250,250,250,.9)"; z.beginPath(); z.ellipse(x, y, s, s * .7, a, 0, 7); z.fill() }) } });
  [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
const M_PASTO_S = new THREE.MeshStandardMaterial({ map: T_PASTO_D.c, bumpMap: T_PASTO_D.z, bumpScale: 2.6, roughness: .97, vertexColors: true });
AGUA.material = new THREE.MeshStandardMaterial({ color: "#7d9446", roughness: 1 }); AGUA.position.y = -6; AGUA.castShadow = false;

// ---------- la malla del terreno: fina en el pueblo (≈ 0,7 m) y gruesa lejos; termina en x = 100 (+ faldón a 104) para empalmar con la cordillera
const TERRENO = (() => { const N = 330, geo = new THREE.PlaneGeometry(2, 2, N, N); geo.rotateX(-Math.PI / 2); const p = geo.attributes.position, uv = geo.attributes.uv, col = new Float32Array(p.count * 3);
  const mx = u => u >= 0 ? 104 * (.55 * u + .45 * u * u) : -460 * (.22 * -u + .78 * u * u * -u), mz = u => 460 * (.22 * u + .78 * u * u * u) * 1;
  for (let i = 0; i < p.count; i++) { const x = mx(p.getX(i)), z = mz(p.getZ(i)); let y = SUELO(x, z); if (x > 100) y -= (x - 100) * .2; p.setXYZ(i, x, y, z); uv.setXY(i, x / 7, z / 7); const c = colorSuelo(x, z); col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2] }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals(); const m = new THREE.Mesh(geo, M_PASTO_S); m.receiveShadow = true; m.castShadow = true; scene.add(m); return m })();

// ---------- texturas pintadas: piedra de muro (hiladas desparejas), pizarra, tejas, revoque, madera, piedra de roca
const repT = q => { for (const t of (Array.isArray(q) ? q : [q.c, q.z])) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.needsUpdate = true } return q };
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
  // grano, líquenes (amarillos, blancos) y chorreaduras oscuras
  for (let k = 0; k < 14000; k++) { const x = r() * w, y2 = r() * h; c.fillStyle = r() < .5 ? "rgba(40,34,26,.16)" : "rgba(255,250,235,.14)"; c.fillRect(x, y2, 1 + r() * 2, 1 + r() * 2) }
  for (let k = 0; k < (o.liquen ?? 40); k++) { const x = r() * w, y2 = r() * h, n = 6 + r() * 16, col = ["rgba(196,180,90,.55)", "rgba(230,228,210,.5)", "rgba(170,150,70,.5)", "rgba(120,140,80,.45)"][r() * 4 | 0]; for (let q = 0; q < n; q++) envuelto(c, w, h, () => { c.fillStyle = col; c.beginPath(); c.arc(x + (r() - .5) * 26, y2 + (r() - .5) * 18, 1.5 + r() * 5, 0, 7); c.fill() }) }
  for (let k = 0; k < 26; k++) { const x = r() * w, y2 = r() * h, L = 60 + r() * 260, an = 4 + r() * 14, gr = c.createLinearGradient(0, y2, 0, y2 + L); gr.addColorStop(0, "rgba(40,36,30,.22)"); gr.addColorStop(1, "rgba(40,36,30,0)"); c.fillStyle = gr; c.fillRect(x - an / 2, y2, an, L) }
  if (o.musgo) { for (let k = 0; k < 700; k++) { const x = r() * w, y2 = r() * h; c.fillStyle = `rgba(${70 + r() * 30 | 0},${96 + r() * 30 | 0},${40 + r() * 20 | 0},${.25 + r() * .3})`; c.beginPath(); c.arc(x, y2, 2 + r() * 7, 0, 7); c.fill() } } }));
const MURO_P = [["#8e877a", "#7a7366", "#a39b8c", "#6e675c", "#9a8e7a", "#857d70"], ["#a0927c", "#8c7e68", "#b4a68e", "#7a6e5c", "#9c8a70"], ["#7c7a76", "#686660", "#8e8a84", "#5e5c58", "#9a948a"], ["#a8987e", "#94846c", "#bcae94", "#857560", "#a08c72"], ["#8a8274", "#77706a", "#9c9484", "#a69a84", "#6a645c"], ["#968a78", "#827868", "#aa9e8a", "#70685c"]];
const M_MURO = MURO_P.map((p, i) => { const [t, z] = T_MURO(4200 + i, p, { mortero: ["#5c564c", "#625a4c", "#52504c", "#665c4c", "#58544c", "#5e564c"][i] }); return new THREE.MeshStandardMaterial({ map: t, bumpMap: z, bumpScale: 4.5, roughness: .93 }) });
const M_ZOCALO = (() => { const [t, z] = T_MURO(4210, ["#6e685e", "#5e584e", "#7a7468", "#666052"], { mortero: "#4e4a42", musgo: 1, escala: 1.25 }); return new THREE.MeshStandardMaterial({ map: t, bumpMap: z, bumpScale: 5, roughness: .96 }) })();
const T_SILLAR = T_MURO(4220, ["#9a9282", "#8a8272", "#aaa290", "#7e776a", "#a49a86"], { sillar: 1, mortero: "#6a645a", liquen: 70 });
const M_TORRE_P = new THREE.MeshStandardMaterial({ map: T_SILLAR[0], bumpMap: T_SILLAR[1], bumpScale: 5.5, roughness: .93, color: "#c8c0b2" });
// pizarra: filas que se pisan (las de abajo tapan la parte de arriba de las de arriba), cada laja distinta, musgo y líquenes, alguna rota
const T_PIZARRA = (seed, pal) => repT(pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(seed); c.fillStyle = "#1a1d20"; c.fillRect(0, 0, w, h); z.fillStyle = "#1a1a1a"; z.fillRect(0, 0, w, h);
  const nf = 15, fh = h / nf; for (let f = -1; f <= nf; f++) { const y0 = f * fh; let x = -r() * 50; while (x < w) { const sw = 54 + r() * 44, col = rgbj(pal[r() * pal.length | 0], r, 20), v = 120 + r() * 70 | 0, rot = r() < .04;
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
  // revoque caído (asoma la piedra) y grietas
  for (let k = 0; k < 7; k++) { const cx = r() * w, cy = r() * h, s = 30 + r() * 60, P = Array.from({ length: 9 }, (_, i) => { const a = i / 9 * 6.283, d = s * (.55 + r() * .6); return [cx + Math.cos(a) * d * 1.3, cy + Math.sin(a) * d] });
    redondo(c, P, 10); c.fillStyle = "#8e8474"; c.fill(); c.save(); c.clip(); for (let q = 0; q < 20; q++) { c.fillStyle = rgbj(["#a09482", "#7e7466", "#968a78"][r() * 3 | 0], r, 20); c.beginPath(); c.ellipse(cx + (r() - .5) * s * 2.4, cy + (r() - .5) * s * 1.8, 14 + r() * 16, 9 + r() * 8, 0, 0, 7); c.fill() } c.restore(); c.strokeStyle = "rgba(90,80,64,.7)"; c.lineWidth = 3; c.stroke(); redondo(z, P, 10); z.fillStyle = "#505050"; z.fill() }
  for (let k = 0; k < 14; k++) { let x = r() * w, y = r() * h; const n = 8 + r() * 16 | 0; c.strokeStyle = "rgba(80,70,56,.55)"; c.lineWidth = 1.5; z.strokeStyle = "#202020"; z.lineWidth = 3; c.beginPath(); z.beginPath(); c.moveTo(x, y); z.moveTo(x, y); for (let q = 0; q < n; q++) { x += (r() - .5) * 26; y += 6 + r() * 18; c.lineTo(x, y); z.lineTo(x, y) } c.stroke(); z.stroke() }
  for (let k = 0; k < 10000; k++) { c.fillStyle = r() < .5 ? "rgba(90,80,60,.12)" : "rgba(255,255,255,.12)"; c.fillRect(r() * w, r() * h, 2, 2) } }));
const M_REVOQUE = new THREE.MeshStandardMaterial({ map: T_REVOQUE[0], bumpMap: T_REVOQUE[1], bumpScale: 3.5, roughness: .95 });
// madera clara neutra (se tiñe): tablas con veta, nudos, clavos y pintura gastada
const T_TABLA_N = (() => { const [c, z] = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(4330); let x = 0; z.fillStyle = "#909090"; z.fillRect(0, 0, w, h); while (x < w) { const pw = 64 + r() * 50; c.fillStyle = rgbj("#e2dcd2", r, 22); c.fillRect(x, 0, pw, h); for (let k = 0; k < 40; k++) { const xx = x + r() * pw; c.strokeStyle = r() < .5 ? "rgba(90,74,60,.25)" : "rgba(255,255,255,.3)"; c.lineWidth = 1 + r() * 2; c.beginPath(); c.moveTo(xx, 0); for (let y = 0; y <= h; y += 40) c.lineTo(xx + (r() - .5) * 6, y); c.stroke(); z.strokeStyle = "rgba(60,60,60,.3)"; z.lineWidth = 2; z.beginPath(); z.moveTo(xx, 0); z.lineTo(xx, h); z.stroke() }
      for (let k = 0; k < 5; k++) { const px = x + r() * pw, py = r() * h, s = 6 + r() * 20; c.fillStyle = "rgba(120,96,70,.7)"; c.beginPath(); c.ellipse(px, py, s * .6, s, r(), 0, 7); c.fill(); z.fillStyle = "rgba(40,40,40,.6)"; z.beginPath(); z.ellipse(px, py, s * .6, s, 0, 0, 7); z.fill() }
      for (const yy of [30, h - 30]) { c.fillStyle = "#3a3430"; c.beginPath(); c.arc(x + pw / 2, yy, 4, 0, 7); c.fill() }
      c.fillStyle = "rgba(40,28,20,.8)"; c.fillRect(x + pw - 4, 0, 4, h); z.fillStyle = "#000"; z.fillRect(x + pw - 5, 0, 6, h); x += pw } }); return { c, z } })();
const PUERTA_C = ["#4a6a52", "#8a3a2c", "#3e5a78", "#a07a3a", "#5a4a3a", "#6a7a6a", "#7a4a3a", "#2e4e4a", "#9a8a6a"];
const M_PUERTA = PUERTA_C.map(c => new THREE.MeshStandardMaterial({ map: T_TABLA_N.c, bumpMap: T_TABLA_N.z, bumpScale: 3, roughness: .8, color: c }));
const M_MADERA = new THREE.MeshStandardMaterial({ map: T_TABLA_N.c, bumpMap: T_TABLA_N.z, bumpScale: 3.5, roughness: .9, color: "#6e5038" });
const M_MADERA_V = new THREE.MeshStandardMaterial({ map: T_TABLA_N.c, bumpMap: T_TABLA_N.z, bumpScale: 3.5, roughness: .95, color: "#9a8e7e" });
const M_VIGA = new THREE.MeshStandardMaterial({ map: T_TABLA_N.c, bumpMap: T_TABLA_N.z, bumpScale: 3, roughness: .9, color: "#4a3426" });
const M_VIDRIO = new THREE.MeshStandardMaterial({ color: "#1e2a30", roughness: .12, metalness: .55 });
const M_OSCURO = new THREE.MeshBasicMaterial({ color: "#120d0a" });
const M_HIERRO = new THREE.MeshStandardMaterial({ color: "#3a3532", roughness: .5, metalness: .75 });
const M_HIERRO_O = new THREE.MeshStandardMaterial({ color: "#5a4030", roughness: .7, metalness: .5 });   // hierro con óxido (estacas, cadenas)
const M_TERRACOTA = new THREE.MeshStandardMaterial({ color: "#a65a3a", roughness: .8 });
const T_SOGA = tex(64, 64, (g, w, h) => { g.fillStyle = "#b89a6a"; g.fillRect(0, 0, w, h); for (let k = -8; k < 16; k++) { g.strokeStyle = k % 2 ? "rgba(70,50,28,.7)" : "rgba(240,220,170,.5)"; g.lineWidth = 4; g.beginPath(); g.moveTo(k * 8, 0); g.lineTo(k * 8 + 32, h); g.stroke() } }, [1, 6]);
const M_SOGA = new THREE.MeshStandardMaterial({ map: T_SOGA, bumpMap: T_SOGA, bumpScale: 2, roughness: 1 });
const T_ROCA = (() => { const [c, z] = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(4340); c.fillStyle = "#cfcac0"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
    for (let k = 0; k < 300; k++) { const x = r() * w, y = r() * h, s = 10 + r() * 60; envuelto(c, w, h, () => { c.fillStyle = r() < .5 ? "rgba(90,86,76,.14)" : "rgba(255,255,250,.14)"; c.beginPath(); c.ellipse(x, y, s, s * .6, r() * 3, 0, 7); c.fill() }); envuelto(z, w, h, () => { z.fillStyle = r() < .5 ? "rgba(50,50,50,.25)" : "rgba(210,210,210,.25)"; z.beginPath(); z.ellipse(x, y, s, s * .6, 0, 0, 7); z.fill() }) }
    for (let k = 0; k < 40; k++) { let x = r() * w, y = r() * h; c.strokeStyle = "rgba(40,36,30,.6)"; c.lineWidth = 1.5 + r() * 2; z.strokeStyle = "#000"; z.lineWidth = 4; c.beginPath(); z.beginPath(); c.moveTo(x, y); z.moveTo(x, y); for (let q = 0; q < 7; q++) { x += (r() - .5) * 50; y += (r() - .5) * 50; c.lineTo(x, y); z.lineTo(x, y) } c.stroke(); z.stroke() }
    for (let k = 0; k < 90; k++) { const x = r() * w, y = r() * h, n = 6 + r() * 14, col = ["rgba(200,190,90,.6)", "rgba(240,240,225,.6)", "rgba(210,140,60,.5)", "rgba(110,130,70,.5)"][r() * 4 | 0]; for (let q = 0; q < n; q++) { c.fillStyle = col; c.beginPath(); c.arc(x + (r() - .5) * 20, y + (r() - .5) * 20, 1.5 + r() * 4, 0, 7); c.fill() } } });
  [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
const M_ROCA = new THREE.MeshStandardMaterial({ map: T_ROCA.c, bumpMap: T_ROCA.z, bumpScale: 4, roughness: .95, color: "#ffffff" });
const M_ROCA_G = new THREE.MeshStandardMaterial({ map: T_ROCA.c, bumpMap: T_ROCA.z, bumpScale: 4, roughness: .95, color: "#8e8a80" });   // piedras sueltas sin color de instancia
const M_PIEDRA_C = new THREE.MeshStandardMaterial({ color: "#b4ab98", roughness: .9, bumpMap: T_ROCA.z, bumpScale: 2.5 });   // dinteles, alféizares, escalones
const GEO_PIEDRAS = [geoPiedra(31, 1, .62), geoPiedra(32, 1, .8), geoPiedra(33, 1, .5)];
const RB1 = (w, h, d, r = .04) => RB(w, h, d, r, 1);   // caja con bisel de un segmento (liviana)

// ---------- la plaza empedrada (anillos de piedra gris con pasto en las juntas del borde) — calcomanía sobre el terreno
const T_PLAZA = (() => { const [c, z] = pintarDoble(2048, 2048, (c, z, w, h) => { const r = rng(4400), C = w / 2, px = w / 27; z.fillStyle = "#606060"; z.fillRect(0, 0, w, h);
    c.fillStyle = "#5e5a4e"; c.beginPath(); for (let i = 0; i <= 200; i++) { const a = i / 200 * 6.283, rr = (12.3 + Math.sin(a * 7) * .25 + Math.sin(a * 13 + 1) * .2) * px; i ? c.lineTo(C + Math.cos(a) * rr, C + Math.sin(a) * rr) : c.moveTo(C + Math.cos(a) * rr, C + Math.sin(a) * rr) } c.fill();
    const losa = (r0, r1, a0, a1, col) => { const m = .028 * px, ma0 = a0 + m / r1, ma1 = a1 - m / r1; if (ma1 <= ma0) return; const j = () => (r() - .5) * .06 * px, pts = [[r0 + m, ma0], [r1 - m, ma0], [r1 - m, (ma0 + ma1) / 2], [r1 - m, ma1], [r0 + m, ma1], [r0 + m, (ma0 + ma1) / 2]].map(([rr, a]) => [C + Math.cos(a) * rr + j(), C + Math.sin(a) * rr + j()]);
      const v = 180 + r() * 70 | 0; redondo(c, pts, .07 * px); c.fillStyle = col; c.fill(); redondo(z, pts, .07 * px); z.fillStyle = `rgb(${v},${v},${v})`; z.fill();
      const mx = C + Math.cos((a0 + a1) / 2) * (r0 + r1) / 2, my = C + Math.sin((a0 + a1) / 2) * (r0 + r1) / 2, s = (r1 - r0) * .6; redondo(c, pts, .07 * px); const gr = c.createRadialGradient(mx - s * .3, my - s * .3, 0, mx, my, s * 1.4); gr.addColorStop(0, "rgba(255,250,235,.18)"); gr.addColorStop(1, "rgba(30,26,20,.2)"); c.fillStyle = gr; c.fill() };
    const grises = ["#9a968c", "#8a867c", "#a8a296", "#7c786e", "#949082", "#b0aa9c", "#868070", "#a09884"];
    losa(0, .7 * px, 0, 6.283, "#7c786e"); for (let k = 0; k < 8; k++) losa(.7 * px, 1.4 * px, k / 8 * 6.283, (k + 1) / 8 * 6.283, grises[k % 8]);
    let rr = 1.4; while (rr < 12.1) { const an = .2 + r() * .12, r1 = Math.min(12.3, rr + an); let a = r() * 6.283; const fin = a + 6.283; while (a < fin - .02) { const da = Math.min(fin - a, (.22 + r() * .22) / rr); if (r() > .02) losa(rr * px, r1 * px, a, a + da, rgbj(grises[r() * 8 | 0], r, 22)); a += da } rr = r1 }
    for (let k = 0; k < 220; k++) { const a = r() * 6.283, d = Math.sqrt(r()) * 12 * px, s = 20 + r() * 90, X0 = C + Math.cos(a) * d, Y0 = C + Math.sin(a) * d, gr = c.createRadialGradient(X0, Y0, 0, X0, Y0, s), cl2 = r() < .6 ? "180,170,140" : "50,46,38"; gr.addColorStop(0, `rgba(${cl2},.22)`); gr.addColorStop(1, `rgba(${cl2},0)`); c.fillStyle = gr; c.fillRect(X0 - s, Y0 - s, s * 2, s * 2) }
    // pasto en las juntas hacia el borde
    for (let k = 0; k < 2500; k++) { const a = r() * 6.283, d = (8.5 + r() * 3.8) * px, x = C + Math.cos(a) * d, y = C + Math.sin(a) * d, L = 4 + r() * 10; c.strokeStyle = `rgba(${90 + r() * 50 | 0},${110 + r() * 40 | 0},50,${.4 + r() * .4})`; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + L, y - L * .5); c.stroke() }
    c.globalCompositeOperation = "destination-out"; for (let k = 0; k < 500; k++) { const a = r() * 6.283, d = (11.4 + r() * 1.6) * px, s = 14 + r() * 60, X0 = C + Math.cos(a) * d, Y0 = C + Math.sin(a) * d, gr = c.createRadialGradient(X0, Y0, 0, X0, Y0, s); gr.addColorStop(0, "rgba(0,0,0,.9)"); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(X0 - s, Y0 - s, s * 2, s * 2) } c.globalCompositeOperation = "source-over" }); return { c, z } })();
const geoSobreSuelo = (x0, x1, z0, z1, nx, nz, dy = .02) => { const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, nz); g.rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, 0, (z0 + z1) / 2); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, SUELO(p.getX(i), p.getZ(i)) + dy); g.computeVertexNormals(); return g };
const PLAZA_M = (() => { const m = new THREE.Mesh(geoSobreSuelo(-13.5, 13.5, -13.5, 13.5, 40, 40), new THREE.MeshStandardMaterial({ map: T_PLAZA.c, bumpMap: T_PLAZA.z, bumpScale: 5, roughness: .85, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -6 })); m.receiveShadow = true; m.renderOrder = -.3; scene.add(m); return m })();

// ---------- registro de lo ocupado (para que nada se pise) y los lugares de las frases
const OCUP = [], RECTS = [];
const enRect = (R, x, z, m = 0) => { const c = Math.cos(R.ry), s = Math.sin(R.ry), dx = x - R.x, dz = z - R.z, lx = dx * c - dz * s, lz = dx * s + dz * c; return Math.abs(lx) < R.w / 2 + m && Math.abs(lz) < R.d / 2 + m };
const zonaLibre = (x, z, r = 0) => Math.hypot(x, z) < 11 + r || Math.hypot(x - TORRE[0], z - TORRE[1]) < 4 + r;
const libreEn = (x, z, r = .5, o = {}) => { if (!o.zona && zonaLibre(x, z, r)) return false; for (const R of RECTS) if (R !== o.salvo && enRect(R, x, z, r + (o.mc ?? .1))) return false; for (const q of OCUP) if (Math.hypot(x - q.x, z - q.z) < r + q.r) return false; return true };
const ocupa = (x, z, r) => { OCUP.push({ x, z, r }); return true };
// el puesto de sopa de Marta, el altar de la boda (en la plaza), el rincón de la mamá con el bebé
const PUNTOS = { sopa: [8.5, -3.5], boda: [-5.5, 2.5], bebe: [19, 6.5] };
const PUNTOS_R = { sopa: 3.4, boda: 4.6, bebe: 3.2 };

// ---------- LAS CASAS_V: piedra (o piedra abajo y revoque con vigas arriba), techo a dos aguas de pizarra o tejas, chimenea,
// y CUATRO CADENAS gruesas de las esquinas del alero a estacas de hierro en el piso. Todas van a un solo lote.
const L_CASA = lote(), CASAS_V = [], CADENAS = [], HUMOS = [];
const CASA_MATS = { zocalo: M_ZOCALO, revoque: M_REVOQUE, piedraC: M_PIEDRA_C, madera: M_MADERA, maderaV: M_MADERA_V, viga: M_VIGA, vidrio: M_VIDRIO, oscuro: M_OSCURO, hierro: M_HIERRO, hierroO: M_HIERRO_O, terracota: M_TERRACOTA, roca: M_ROCA_G, soga: M_SOGA };
M_MURO.forEach((m, i) => CASA_MATS["muro" + i] = m); M_PIZ.forEach((m, i) => CASA_MATS["piz" + i] = m); M_TEJA.forEach((m, i) => CASA_MATS["teja" + i] = m); M_PUERTA.forEach((m, i) => CASA_MATS["col" + i] = m);
const ventanaPiezas = (add, M, an, al, r, col, o = {}) => {   // M = matriz en la cara (origen al pie de la ventana, +z hacia afuera)
  add("vidrio", new THREE.PlaneGeometry(an, al), M.clone().multiply(TM(0, al / 2, .02)));
  for (const s of [-1, 1]) add("madera", new THREE.BoxGeometry(.08, al + .08, .1), M.clone().multiply(TM(s * (an / 2 + .02), al / 2, .04)));
  for (const yy of [0, al]) add("madera", new THREE.BoxGeometry(an + .12, .08, .1), M.clone().multiply(TM(0, yy, .04)));
  add("madera", new THREE.BoxGeometry(.05, al, .05), M.clone().multiply(TM(0, al / 2, .05))); add("madera", new THREE.BoxGeometry(an, .05, .05), M.clone().multiply(TM(0, al * .55, .05)));
  add("piedraC", RB1(an + .36, .1, .26, .03), M.clone().multiply(TM(0, -.06, .1))); add("piedraC", RB1(an + .4, .2, .14, .03), M.clone().multiply(TM(0, al + .14, .05)));
  // postigos: abiertos contra la pared y trabados con un gancho (si no, el viento los arranca), o cerrados
  const ce = o.cerrado ?? r() < .22; for (const s of [-1, 1]) { const ang = ce ? 0 : s * (Math.PI - .12), hm = M.clone().multiply(TM(s * (an / 2 + .06), al / 2, .09, 0, ang, 0)); add(col, new THREE.BoxGeometry(an / 2 + .02, al + .04, .05), hm.clone().multiply(TM(-s * (an / 4 + .01), 0, 0)));
    for (const yy of [-al * .32, al * .32]) add("madera", new THREE.BoxGeometry(an / 2 - .04, .07, .03), hm.clone().multiply(TM(-s * (an / 4), yy, ce ? .04 : -.04)));
    if (!ce) add("hierro", new THREE.CylinderGeometry(.012, .012, .3, 4), M.clone().multiply(TM(s * (an + .2), al * .5, .06, 0, 0, Math.PI / 2))) } };
function casaV(x, z, ry, w, d, h, seed, o = {}) { const r = rng(seed), cs = Math.cos(ry), sn = Math.sin(ry);
  const y0 = Math.min(SUELO(x, z), ...[[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([a, b]) => SUELO(x + (a * w / 2) * cs + (b * d / 2) * sn, z - (a * w / 2) * sn + (b * d / 2) * cs))) - .06;
  const HM = TM(x, y0, z, 0, ry, 0), Lr = o.techoL || null, add = (k, g, m) => L_CASA.add(k, g, HM.clone().multiply(m)), W = (lx, ly, lz) => new THREE.Vector3(lx, ly, lz).applyMatrix4(HM);
  const mu = "muro" + (o.muro ?? (seed % M_MURO.length)), dos = o.dos ?? r() < .32, hs = dos ? 2.9 : h; if (dos) h = Math.max(h, 5.3 + r() * .4); const techo = o.techo ?? (r() < .55 ? "piz" + (r() * 3 | 0) : "teja" + (r() * 3 | 0)), col = "col" + (o.color ?? (r() * M_PUERTA.length | 0));
  // zócalo (entra en el piso) y muros
  add("zocalo", uvMuro(new THREE.BoxGeometry(w + .26, 1.7, d + .26), 3.2), TM(0, -.6, 0));
  add(mu, uvMuro(new THREE.BoxGeometry(w, hs, d), 3.2, r(), r()), TM(0, hs / 2, 0));
  if (dos) { const hu = h - hs; add("revoque", uvMuro(new THREE.BoxGeometry(w + .2, hu, d + .2), 3.4, r(), r()), TM(0, hs + hu / 2, 0));
    // entramado de vigas sobre el revoque: soleras, postes y cruces
    const cara = (L2, M) => { add("viga", new THREE.BoxGeometry(L2 + .1, .16, .1), M.clone().multiply(TM(0, .08, 0))); add("viga", new THREE.BoxGeometry(L2 + .1, .16, .1), M.clone().multiply(TM(0, hu - .08, 0))); const n = Math.max(2, Math.round(L2 / 1.25));
      for (let k = 0; k <= n; k++) { const xx = lerp(-L2 / 2 + .06, L2 / 2 - .06, k / n); add("viga", new THREE.BoxGeometry(.15, hu, .1), M.clone().multiply(TM(xx, hu / 2, 0))); if (k < n && k % 2 === 0) { const x2 = lerp(-L2 / 2 + .06, L2 / 2 - .06, (k + 1) / n), [g, m] = cilEntre([xx, .1, 0], [x2, hu - .1, 0], .06, 4); add("viga", g, M.clone().multiply(m)) } } };
    cara(w + .2, TM(0, hs, d / 2 + .15)); cara(w + .2, TM(0, hs, -d / 2 - .15, 0, Math.PI, 0)); cara(d + .2, TM(w / 2 + .15, hs, 0, 0, Math.PI / 2, 0)); cara(d + .2, TM(-w / 2 - .15, hs, 0, 0, -Math.PI / 2, 0)) }
  // piedras esquineras (más claras, alternadas)
  if (!o.sinEsq) for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) for (let yy = .25, k = 0; yy < hs - .2; yy += .44, k++) { const la = k % 2 ? .62 : .38; add("piedraC", RB1(.1 + la * (k % 2 ? 1 : .1), .38, .1 + la * (k % 2 ? .1 : 1), .04), TM(sx * (w / 2 + .015) - sx * la * (k % 2 ? .5 : 0), yy, sz * (d / 2 + .015) - sz * la * (k % 2 ? 0 : .5))) }
  // el techo: frontón de piedra (o tablas en la panadería), dos faldones, cumbrera, tablas de borde, piedras de peso
  const ang = (o.pendiente ?? (36 + r() * 9)) * Math.PI / 180, ovx = .45, ovz = .52, rh = d / 2 * Math.tan(ang), ye = h - ovz * Math.tan(ang), S = (d / 2 + ovz) / Math.cos(ang), Lt = w + 2 * ovx;
  const sh = new THREE.Shape(); sh.moveTo(-d / 2, 0); sh.lineTo(d / 2, 0); sh.lineTo(0, rh); sh.closePath();
  if (!o.panaderia) { const gp = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false }); gp.rotateY(Math.PI / 2); gp.translate(-w / 2, 0, 0); add(dos ? "revoque" : mu, uvMuro(gp, 3.2, r(), .3), TM(0, h, 0)) }
  else for (const s of [-1, 1]) { const gp = new THREE.ExtrudeGeometry(sh, { depth: .3, bevelEnabled: false }); gp.rotateY(Math.PI / 2); gp.translate(s > 0 ? w / 2 - .3 : -w / 2, 0, 0); add(mu, uvMuro(gp, 3.2, r(), .3), TM(0, h, 0)) }
  const tL = Lr || L_CASA, tadd = Lr ? (k, g, m) => Lr.add(k, g, TM(0, -h, 0).multiply(m)) : add;
  for (const s of [1, -1]) { const ts = techo.startsWith("piz") ? 4.4 : 3.4, g = new THREE.BoxGeometry(Lt, .17, S); geoUV(g, px => px / ts, (px, py, pz) => -pz / ts);
    const ym = h + rh + .1 - (d / 2 + ovz) * Math.tan(ang) / 2, zm = s * (d / 2 + ovz) / 2; tadd(techo, g, TM(0, ym, zm, ang, s > 0 ? 0 : Math.PI, 0)); if (o.panaderia) tadd("maderaV", new THREE.BoxGeometry(Lt - .3, .05, S - .2), TM(0, ym, zm, ang, s > 0 ? 0 : Math.PI, 0).multiply(TM(0, -.12, 0)));
    // tablas de borde (en los frontones) y canaleta de madera
    for (const sx of [-1, 1]) tadd("madera", new THREE.BoxGeometry(.06, .3, S + .04), TM(sx * (Lt / 2 + .02), ym - .06, zm, ang, s > 0 ? 0 : Math.PI, 0));
    // piedras de peso sobre el techo (en un valle ventoso, se usan)
    const np = o.panaderia ? 2 : (r() * 3 | 0); for (let k = 0; k < np; k++) { const u = .25 + r() * .55, xx = (r() - .5) * (w - 1.2), sp = .18 + r() * .14; tadd("roca", GEO_PIEDRAS[k % 3], TM(xx, h + rh + .18 - u * (d / 2 + ovz) * Math.tan(ang) + sp * .45, s * u * (d / 2 + ovz), ang * s, r() * 6, 0, sp * 1.3, sp, sp * 1.1)) } }
  tadd(techo === "teja0" || techo === "teja1" || techo === "teja2" ? "terracota" : "zocalo", new THREE.CylinderGeometry(.16, .16, Lt + .1, 8), TM(0, h + rh + .16, 0, 0, 0, Math.PI / 2));
  if (o.panaderia) { // vigas del techo (se van con él) y el piso del desván que queda a la vista
    for (let k = 0; k < 6; k++) { const xx = lerp(-w / 2 + .5, w / 2 - .5, k / 5); for (const s of [1, -1]) { const [g, m] = cilEntre([xx, h, s * (d / 2 - .1)], [xx, h + rh - .05, 0], .07, 5); tadd("viga", g, m) } }
    add("maderaV", new THREE.BoxGeometry(w - .2, .12, d - .2), TM(0, h - .02, 0)); for (let k = 0; k < 5; k++) add("viga", new THREE.BoxGeometry(.18, .2, d - .1), TM(lerp(-w / 2 + .4, w / 2 - .4, k / 4), h - .14, 0)) }
  // chimenea de piedra en un frontón, con remate y dos cañones de barro
  const sxc = o.chimX ?? (r() < .5 ? 1 : -1), cx = sxc * (w / 2 - .55), cz = -d * .12, ctop = h + rh + .95 + r() * .4;
  add(mu, uvMuro(new THREE.BoxGeometry(.8, ctop - h + .3, .8), 2.4), TM(cx, (h - .3 + ctop) / 2, cz)); add("piedraC", RB1(1, .12, 1, .03), TM(cx, ctop + .06, cz));
  for (const s of [-1, 1]) { add("terracota", new THREE.CylinderGeometry(.11, .13, .38, 10, 1, true), TM(cx + s * .18, ctop + .31, cz)); add("oscuro", new THREE.CircleGeometry(.1, 10), TM(cx + s * .18, ctop + .49, cz, -Math.PI / 2)) }
  HUMOS.push(W(cx + .18, ctop + .5, cz));
  // puerta: jambas y dintel de piedra, hoja de tablas con herrajes, escalón
  const px = o.puertaX ?? (r() - .5) * Math.max(0, w - 3.6), dw = 1.12, dh = 2.15; const F = TM(px, 0, d / 2);
  add("piedraC", RB1(dw + .56, .28, .2, .03), F.clone().multiply(TM(0, dh + .14, .06))); for (const s of [-1, 1]) add("piedraC", RB1(.24, dh, .16, .03), F.clone().multiply(TM(s * (dw / 2 + .12), dh / 2, .05)));
  add("oscuro", new THREE.PlaneGeometry(dw, dh), F.clone().multiply(TM(0, dh / 2, .01))); add(col, new THREE.BoxGeometry(dw - .04, dh - .03, .06), F.clone().multiply(TM(0, dh / 2, .04)));
  for (const yy of [.35, dh - .4]) add("hierro", new THREE.BoxGeometry(dw * .75, .06, .02), F.clone().multiply(TM(-dw * .1, yy, .08)));
  add("hierro", new THREE.TorusGeometry(.075, .015, 6, 12), F.clone().multiply(TM(dw / 2 - .2, dh * .48, .1))); add("piedraC", RB1(dw + .7, .16, .62, .05), F.clone().multiply(TM(0, .02, .3)));
  // ventanas: al frente (a los lados de la puerta), atrás y en los frontones; arriba también si tiene dos pisos
  const vents = []; const vy = dos ? 1.05 : 1.15, va = .95, vh = 1.05;
  for (const s of [-1, 1]) { const vx = px + s * (dw / 2 + .9 + r() * .4); if (Math.abs(vx) + va / 2 + .35 < w / 2) vents.push([TM(vx, vy, d / 2), va]) }
  if (r() < .8) vents.push([TM((r() - .5) * (w - 2.4), vy, -d / 2, 0, Math.PI, 0), va]);
  for (const s of [-1, 1]) if (d > 4.6 && r() < .7) vents.push([TM(s * w / 2, vy, (r() - .5) * (d - 2.6), 0, s * Math.PI / 2, 0), .8]);
  if (dos) { const hu = h - hs; for (const xx of [-w * .25, w * .25]) vents.push([TM(xx, hs + (hu - vh) * .5, d / 2 + .1), va]); vents.push([TM(0, hs + (hu - vh) * .5, -d / 2 - .1, 0, Math.PI, 0), va]) }
  vents.forEach(([M, an]) => ventanaPiezas(add, M, an, vh, r, col));
  // las anclas: placa con argolla en cada esquina del alero, y la estaca de hierro con su bloque de piedra en el piso
  const anclas = [], esq = [[1, 1], [-1, 1], [1, -1], [-1, -1]];
  esq.forEach(([sx, sz]) => { const ax = sx * (w / 2 + ovx - .18), az = sz * (d / 2 + ovz - .14), ay = ye - .02; tadd("hierro", new THREE.BoxGeometry(.3, .06, .3), TM(ax, ay + .06, az)); tadd("hierro", new THREE.TorusGeometry(.09, .025, 6, 12), TM(ax, ay - .04, az, 0, Math.PI / 4 * sx * sz, 0));
    const ex = sx * (w / 2 + (o.estX ?? 1.55)), ez = sz * (d / 2 + (o.estZ ?? 1.25)), pw = W(ex, 0, ez), gy = SUELO(pw.x, pw.z) - y0;
    add("zocalo", RB1(.58, .36, .58, .06), TM(ex, gy + .02, ez, 0, r(), 0)); add("hierroO", new THREE.CylinderGeometry(.045, .055, .62, 7), TM(ex, gy + .3, ez, sz * .25, 0, -sx * .25)); add("hierroO", new THREE.TorusGeometry(.085, .024, 6, 12), TM(ex + sx * .07, gy + .62, ez + sz * .07, 0, Math.PI / 4 * sx * sz, 0));
    const A = W(ax, ay - .12, az), B = W(ex + sx * .1, gy + .6, ez + sz * .1); anclas.push({ a: A.toArray(), b: B.toArray(), sx, sz }) });
  const C = { x, z, ry, w, d, h, y0, HM, px, rh, ye, dos, hs, col, techo, mu, anclas, chim: [cx, ctop, cz], r, seed, F, dw, dh };
  anclas.forEach((an, i) => CADENAS.push({ casa: C, i, a: an.a, b: an.b, sx: an.sx, sz: an.sz }));
  CASAS_V.push(C); RECTS.push({ x, z, ry, w: w + 2 * (o.estX ?? 1.55) + .8, d: d + 2 * (o.estZ ?? 1.25) + .8, casa: C }); return C }

// ---------- el pueblo: la casa del narrador, la panadería (su techo es un grupo aparte que vuela), y ≈ 30 casas en anillos y calles
Object.keys(PUNTOS).forEach(k => ocupa(PUNTOS[k][0], PUNTOS[k][1], PUNTOS_R[k]));
const MI_CASA = casaV(CASA_MIA[0], CASA_MIA[1], -Math.PI / 2, 6.4, 5.2, 3.6, 4501, { dos: true, muro: 1, techo: "piz0", color: 0, puertaX: -.9 });
const TECHO_P = new THREE.Group(); scene.add(TECHO_P); const L_TECHO_P = lote();
const PANAD_C = casaV(PANAD[0], PANAD[1], Math.PI / 2, 7.2, 5.6, 3.5, 4502, { dos: false, muro: 3, techo: "teja0", color: 3, puertaX: -1.2, panaderia: true, techoL: L_TECHO_P, chimX: -1 });
{ const C = PANAD_C; TECHO_P.position.copy(new THREE.Vector3(0, C.h, 0).applyMatrix4(C.HM)); TECHO_P.rotation.y = C.ry; L_TECHO_P.fin(TECHO_P, CASA_MATS); TECHO_P.userData.p0 = TECHO_P.position.clone() }
{ const r = rng(4510), cerca = (x, z, R) => CASAS_V.every(c => Math.hypot(c.x - x, c.z - z) > R + Math.hypot(c.w, c.d) / 2 + 1.1);
  const pon = (x, z, ry, o = {}) => { const w = 5.6 + r() * 2.2, d = 4.6 + r() * 1.2, h = 3.3 + r() * .6, R = Math.hypot(w, d) / 2 + .9;
    if (CASAS_V.length >= 48 || !cerca(x, z, R) || zonaLibre(x, z, R + .5) || Math.hypot(x - COLINA[0], z - COLINA[1]) < 16 + R || OCUP.some(q => Math.hypot(q.x - x, q.z - z) < q.r + R) || sendaK(x, z) > .3 || x > 84) return false;
    casaV(x, z, ry, w, d, h, 4520 + CASAS_V.length * 7, o); return true };
  const mira = (x, z) => Math.atan2(-x, -z);
  // anillo de la plaza (mirando al centro)
  for (let k = 0; k < 15; k++) { const a = k / 15 * 6.283 + .15, x = Math.cos(a) * 20.5, z = Math.sin(a) * 19.5; pon(x, z, mira(x, z)) }
  // calle principal (frentes al camino) y calle del sur
  for (let x = 24; x < 84; x += 10 + r() * 3) { pon(x, -11 - r(), 0); pon(x + 4, 6 + r(), Math.PI) }
  for (let x = -24; x > -100; x -= 10 + r() * 3) { pon(x, -2 - r(), 0); if (x < -46) pon(x - 4, 17 + r(), Math.PI) }
  for (let z = 24; z < 50; z += 9 + r() * 2) { pon(-5 - r(), z, Math.PI / 2); pon(15 + r(), z + 3, -Math.PI / 2) }
  for (let k = 0; k < 20; k++) { const a = k / 20 * 6.283 + .4, x = Math.cos(a) * 31, z = Math.sin(a) * 30; pon(x, z, mira(x, z) + (r() - .5) * .3) }
  for (let k = 0; k < 3000 && CASAS_V.length < 48; k++) { const a = r() * 6.283, d = 26 + r() * 42, x = Math.cos(a) * d, z = Math.sin(a) * d; pon(x, z, mira(x, z) + (r() - .5) * .6) } }
const CASAS_M = L_CASA.fin(scene, CASA_MATS); CASAS_M.oscuro.castShadow = false; CASAS_M.vidrio.castShadow = false;

// ---------- LAS CADENAS: eslabones gruesos instanciados (las de 3 casas cerca de la plaza y las de la panadería pueden cortarse: van aparte)
const GEO_ESLABON = (() => { const g = new THREE.TorusGeometry(.085, .027, 5, 9); g.scale(1.4, 1, 1); return g })();
const ESL_PASO = .19;
const ponEslabones = (im, n0, A, B, sag = .05) => { const a = new THREE.Vector3(...A), b = new THREE.Vector3(...B), L = a.distanceTo(b), n = Math.max(2, Math.floor(L / ESL_PASO)), q = new THREE.Quaternion(), X = new THREE.Vector3(1, 0, 0), roll = new THREE.Quaternion(), p = new THREE.Vector3(), p2 = new THREE.Vector3(), dir = new THREE.Vector3();
  const pt = (u, o) => o.lerpVectors(a, b, u).add(new THREE.Vector3(0, -Math.sin(u * Math.PI) * sag * L / 5, 0));
  for (let k = 0; k < n; k++) { const u = (k + .5) / n; pt(u, p); pt(Math.min(1, u + .01), p2); dir.subVectors(p2, p).normalize(); q.setFromUnitVectors(X, dir); roll.setFromAxisAngle(dir, k % 2 ? Math.PI / 2 : 0); dummy.position.copy(p); dummy.quaternion.copy(roll.multiply(q)); dummy.scale.setScalar(1); dummy.updateMatrix(); im.setMatrixAt(n0 + k, dummy.matrix) } return n };
const ROTAS_CASAS = (() => { const cand = CASAS_V.filter(c => c !== MI_CASA && c !== PANAD_C).sort((a, b) => Math.hypot(a.x - 4, a.z - 2) - Math.hypot(b.x - 4, b.z - 2)); return cand.slice(0, 3) })();
// en cada casa que se corta, las dos cadenas del lado de +x (sueltas, el viento las tira hacia afuera); en la panadería, las cuatro
const ROTAS = CADENAS.filter(c => (ROTAS_CASAS.includes(c.casa) && new THREE.Vector3(c.b[0] - c.casa.x, 0, c.b[2] - c.casa.z).x > 0) || c.casa === PANAD_C);
const CADENAS_M = (() => { const fijas = CADENAS.filter(c => !ROTAS.includes(c)); const im = new THREE.InstancedMesh(GEO_ESLABON, M_HIERRO_O, fijas.length * 60); let n = 0; fijas.forEach(c => { n += ponEslabones(im, n, c.a, c.b) }); im.count = n; im.castShadow = true; im.receiveShadow = true; im.instanceMatrix.needsUpdate = true; scene.add(im); return im })();
const CADENAS_D = (() => { const im = new THREE.InstancedMesh(GEO_ESLABON, M_HIERRO_O, ROTAS.length * 60); im.castShadow = true; im.frustumCulled = false; scene.add(im); return im })();
ROTAS.forEach((c, i) => { c.L = new THREE.Vector3(...c.a).distanceTo(new THREE.Vector3(...c.b)); c.fase = i * 1.7; c.ub = c.casa === PANAD_C ? .02 : ROTAS_CASAS.indexOf(c.casa) * .28 + (c.sz > 0 ? 0 : .06) });
// cadena suelta que latiguea: anclada en P0, larga L, tira hacia +x; modo "techo" (cuelga del alero) o "piso" (anclada a la estaca, a ras)
function ponCadenaSuelta(im, n0, P0, L, t, fase, modo, fz = 1) { const n = Math.floor(L / ESL_PASO), q = new THREE.Quaternion(), X = new THREE.Vector3(1, 0, 0), roll = new THREE.Quaternion(), dir = new THREE.Vector3(), pts = []; let p = new THREE.Vector3(...P0); pts.push(p.clone());
  for (let k = 1; k <= n; k++) { const s = k / n, base = modo === "techo" ? -.55 + .25 * Math.sin(t * 2.1 + fase) * fz - s * .25 : .12 + .1 * Math.sin(t * 2.6 + fase), ola = (.75 * Math.sin(s * 5.5 - t * 15 * fz + fase) + .3 * Math.sin(s * 11 - t * 23 + fase * 2)) * s * fz, a = base + ola * .9;
    dir.set(Math.cos(a), Math.sin(a), .25 * Math.sin(t * 3.3 + s * 4 + fase) * s).normalize(); p = p.clone().addScaledVector(dir, ESL_PASO); if (modo === "piso") p.y = Math.max(p.y, SUELO(p.x, p.z) + .06); pts.push(p) }
  for (let k = 0; k < n; k++) { const a2 = pts[k], b2 = pts[k + 1]; dir.subVectors(b2, a2).normalize(); q.setFromUnitVectors(X, dir); roll.setFromAxisAngle(dir, k % 2 ? Math.PI / 2 : 0); dummy.position.lerpVectors(a2, b2, .5); dummy.quaternion.copy(roll.multiply(q)); dummy.scale.setScalar(1); dummy.updateMatrix(); im.setMatrixAt(n0 + k, dummy.matrix) } return n }

// ---------- LA TORRE: piedra en sillares, cuadrada (5,2 abajo → 4,6 arriba), 14 de alto, puerta al sur, troneras, peldaños de hierro
// al oeste (de nada sirven con este viento), cornisa, techo de pizarra en punta y la VELETA. «BOOTS ON. ALWAYS.» pintado al sur (+z).
const TORRE_A0 = 2.6, TORRE_A1 = 2.3, torreA = y => lerp(TORRE_A0, TORRE_A1, cl(y / TORRE_H));   // medio ancho a cada altura
const TORRE_Y = SUELO(TORRE[0], TORRE[1]) - .05;
const TORRE_G = new THREE.Group(); TORRE_G.position.set(TORRE[0], TORRE_Y, TORRE[1]); scene.add(TORRE_G);
const T_LETRERO = (() => { const t = tex(1024, 1280, (g, w, h) => { const r = rng(4601); g.clearRect(0, 0, w, h); g.textAlign = "center"; g.textBaseline = "middle";
    const linea = (txt, y, size) => { g.font = `900 ${size}px Impact, 'Arial Black', sans-serif`; const m = g.measureText(txt).width, sx = Math.min(1.12, 940 / m);
      for (const [col, dx, dy] of [["rgba(40,30,20,.45)", 8, 10], ["#e2dccd", 0, 0]]) { g.save(); g.translate(w / 2 + dx, y + dy); g.scale(sx, 1); g.fillStyle = col; g.fillText(txt, 0, 0); g.restore() }
      // chorreaduras de cal debajo de cada letra
      for (let k = 0; k < 16; k++) { const x = w / 2 + (r() - .5) * m * sx * .92, L = 20 + r() * 90; g.strokeStyle = "rgba(239,233,220,.85)"; g.lineWidth = 3 + r() * 7; g.lineCap = "round"; g.beginPath(); g.moveTo(x, y + size * .36); g.lineTo(x + (r() - .5) * 3, y + size * .36 + L); g.stroke() } };
    linea("BOOTS", 230, 330); linea("ON.", 560, 330); linea("ALWAYS.", 950, 300);
    // pincel gastado: raspones, piedra que asoma, lavado del viento (todo corrido hacia +x)
    g.globalCompositeOperation = "destination-out"; for (let k = 0; k < 1500; k++) { g.fillStyle = `rgba(0,0,0,${.2 + r() * .5})`; g.fillRect(r() * w, r() * h, 3 + r() * 30, 1 + r() * 3) }
    for (let k = 0; k < 140; k++) { g.fillStyle = "rgba(0,0,0,.85)"; g.beginPath(); g.ellipse(r() * w, r() * h, 4 + r() * 18, 2 + r() * 9, r() * 3, 0, 7); g.fill() } g.globalCompositeOperation = "source-over" }); return t })();
{ const r = rng(4610), L = lote(), H = TORRE_H;
  // cuerpo: caja que se angosta hacia arriba
  { const g = new THREE.BoxGeometry(2 * TORRE_A0, H, 2 * TORRE_A0, 1, 6, 1), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i) + H / 2, k = torreA(y) / TORRE_A0; p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k) } g.computeVertexNormals(); g.translate(0, H / 2, 0); L.add("torre", uvMuro(g, 4.2)) }
  L.add("zocalo", uvMuro(new THREE.BoxGeometry(2 * TORRE_A0 + .7, 1.6, 2 * TORRE_A0 + .7), 3), TM(0, -.4, 0)); L.add("piedraC", RB1(2 * TORRE_A0 + .9, .22, 2 * TORRE_A0 + .9, .05), TM(0, .42, 0));
  // esquineras salientes
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) for (let y = .8, k = 0; y < H - .6; y += .62, k++) { const a = torreA(y), la = k % 2 ? .9 : .5; L.add("piedraC", RB1(k % 2 ? la : .32, .56, k % 2 ? .32 : la, .05), TM(sx * (a + .06) - sx * (k % 2 ? la / 2 - .16 : 0), y, sz * (a + .06) - sz * (k % 2 ? 0 : la / 2 - .16))) }
  // cinta de piedra a media altura y la cornisa con ménsulas
  for (const y of [4.6, 11.4]) { const a = torreA(y); L.add("piedraC", RB1(2 * a + .28, .22, 2 * a + .28, .05), TM(0, y, 0)) }
  { const a = torreA(H); L.add("piedraC", RB1(2 * a + .7, .3, 2 * a + .7, .06), TM(0, H - .05, 0)); for (let s = 0; s < 4; s++) for (let k = 0; k < 6; k++) { const u = lerp(-a + .35, a - .35, k / 5), M = TM(0, 0, 0, 0, s * Math.PI / 2, 0); L.add("piedraC", RB1(.26, .38, .34, .04), M.clone().multiply(TM(u, H - .38, a + .12))) } }
  // puerta al sur con arco de dovelas y escalones
  { const M = TM(0, 0, torreA(1.3) + .02); L.add("oscuro", new THREE.PlaneGeometry(1.4, 2.5), M.clone().multiply(TM(0, 1.25, .01))); L.add("puerta", new THREE.BoxGeometry(1.32, 2.4, .08), M.clone().multiply(TM(0, 1.2, .03)));
    for (let k = 0; k < 9; k++) { const a = k / 8 * Math.PI; L.add("piedraC", RB1(.3, .42, .24, .04), M.clone().multiply(TM(Math.cos(a) * .86, 2.4 + Math.sin(a) * .5, .06, 0, 0, a - Math.PI / 2))) }
    for (const s of [-1, 1]) L.add("piedraC", RB1(.3, 2.4, .22, .04), M.clone().multiply(TM(s * .86, 1.2, .05))); for (const yy of [.5, 1.9]) L.add("hierro", new THREE.BoxGeometry(1.2, .08, .03), M.clone().multiply(TM(0, yy, .09)));
    for (let k = 0; k < 3; k++) L.add("piedraC", RB1(2.2 - k * .3, .18, .5, .04), M.clone().multiply(TM(0, .09 + k * .18 - .18, .55 - k * .25))) }
  // troneras (oscuras con su marco)
  for (const [s, y, u] of [[1, 6.5, .6], [1, 10.4, -.5], [2, 7.4, -.3], [3, 9.2, .4], [3, 4, 0], [2, 12.6, 0], [0, 12.7, -.9], [0, 12.7, .9]]) { const a = torreA(y), M = TM(0, 0, 0, 0, s * Math.PI / 2, 0).multiply(TM(u, y, a + .01)); L.add("oscuro", new THREE.PlaneGeometry(.3, 1.1), M.clone().multiply(TM(0, 0, .015))); L.add("piedraC", RB1(.62, .16, .2, .03), M.clone().multiply(TM(0, .63, .05))); L.add("piedraC", RB1(.62, .14, .24, .03), M.clone().multiply(TM(0, -.62, .06))) }
  // peldaños de hierro en la cara oeste (−x): de 1,6 a 13,6
  for (let y = 1.6; y < H - .3; y += .36) { const a = torreA(y), M = TM(-a - .01, y, .9, 0, -Math.PI / 2, 0); L.add("hierroO", new THREE.CylinderGeometry(.022, .022, .5, 5), M.clone().multiply(TM(0, 0, .2, 0, 0, Math.PI / 2))); for (const s of [-1, 1]) L.add("hierroO", new THREE.CylinderGeometry(.02, .02, .22, 4), M.clone().multiply(TM(s * .24, 0, .1, Math.PI / 2, 0, 0))) }
  // techo de pizarra en punta (pirámide de 4 caras) con alero, y el remate donde nace la veleta
  { const a = torreA(H) + .5, hh = 1.55, g = new THREE.ConeGeometry(a * Math.SQRT2, hh, 4, 1, true); g.rotateY(Math.PI / 4); geoUV(g, (x, y, z) => (Math.abs(x) > Math.abs(z) ? z : x) / 2.4, (x, y) => -y / 2.4); L.add("piz", g, TM(0, H + .1 + hh / 2, 0));
    L.add("oscuro", new THREE.BoxGeometry(2 * a - .2, .05, 2 * a - .2), TM(0, H + .12, 0)); L.add("hierro", new THREE.CylinderGeometry(.12, .16, .4, 10), TM(0, H + 1.55, 0)) }
  // las cuerdas de banderines salen de dos argollas de la cara sur (las pone el detalle)
  const ms = L.fin(TORRE_G, { torre: M_TORRE_P, zocalo: M_ZOCALO, piedraC: M_PIEDRA_C, oscuro: M_OSCURO, puerta: M_PUERTA[7], hierro: M_HIERRO, hierroO: M_HIERRO_O, piz: M_PIZ[1] }); ms.oscuro.castShadow = false;
  // el letrero pintado: calcomanía sobre la cara sur (y de 5 a 11), un poco inclinada como el muro
  const y0 = 5, y1 = 11.2, ym = (y0 + y1) / 2, inc = Math.atan((TORRE_A0 - TORRE_A1) / H), pl = new THREE.Mesh(new THREE.PlaneGeometry(4.1, (y1 - y0) / Math.cos(inc)), new THREE.MeshStandardMaterial({ map: T_LETRERO, bumpMap: T_SILLAR[1], bumpScale: 3, roughness: .9, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }));
  pl.position.set(0, ym, torreA(ym) + .012); pl.rotation.x = -inc; pl.receiveShadow = true; TORRE_G.add(pl) }
ocupa(TORRE[0], TORRE[1], 4.2);

// ---------- LA VELETA de hierro: gallo sobre una flecha grande (cabeza al oeste, de donde viene el viento; cola ancha al este), cruz con N S E W.
// veleta(t, { doblez: 0..1, rota: 0..1, pos, rot }) — doblez la inclina hacia +x (el peso de Pip); rota la arranca: en rota = 1 la pieza queda suelta
// (VELETA_PIEZA, en la escena) y se puede mover con pos = [x, y, z] y rot = [rx, ry, rz]. VELETA_W() = punto donde se cuelga alguien [x, y, z].
const M_VELETA = new THREE.MeshStandardMaterial({ color: "#2a2624", roughness: .45, metalness: .7 });
const VEL_BASE_Y = TORRE_H + 1.75;   // donde nace el mástil (encima del remate del techo)
const VEL_BASE = new THREE.Group(); VEL_BASE.position.set(TORRE[0], TORRE_Y + VEL_BASE_Y, TORRE[1]); scene.add(VEL_BASE);
const VEL_DOBLA = new THREE.Group(); VEL_DOBLA.position.y = .05; VEL_BASE.add(VEL_DOBLA);
const VELETA_PIEZA = new THREE.Group(); VELETA_PIEZA.position.y = TORRE_Y + VELETA_Y - (TORRE_Y + VEL_BASE_Y) - .05; VEL_DOBLA.add(VELETA_PIEZA);
const VEL_GIRO = new THREE.Group(); VELETA_PIEZA.add(VEL_GIRO);
const VEL_COLGAR = new THREE.Vector3(.95, -.06, 0);   // en VEL_GIRO: sobre la varilla, del lado de la cola (+x)
{ const L = lote(), Lp = lote(), Lg = lote(), h0 = VELETA_PIEZA.position.y;   // h0 = altura del eje sobre el doblez (≈ 0,4)
  // mástil (parte fija y parte que se dobla), con anillos
  L.add("v", new THREE.CylinderGeometry(.05, .07, .4, 10), TM(0, -.15, 0)); Lp.add("v", new THREE.CylinderGeometry(.045, .05, h0 + .02, 10), TM(0, h0 / 2 - .02, 0));
  // la cruz de los puntos cardinales con sus letras (debajo del eje, sobre el tramo que se dobla)
  const yc = h0 * .35; Lp.add("v", new THREE.CylinderGeometry(.025, .025, 1.5, 6), TM(0, yc, 0, 0, 0, Math.PI / 2)); Lp.add("v", new THREE.CylinderGeometry(.025, .025, 1.5, 6), TM(0, yc, 0, Math.PI / 2, 0, 0)); Lp.add("v", new THREE.SphereGeometry(.08, 10, 8), TM(0, yc, 0));
  const barra = (L2, x0, y0, x1, y1, M) => { const [g, m] = cilEntre([x0, y0, 0], [x1, y1, 0], .022, 5); L2.add("v", g, M.clone().multiply(m)) };
  const letra = (ch, M) => { const s = .26; if (ch === "N") { barra(Lp, -s / 2, 0, -s / 2, s, M); barra(Lp, -s / 2, s, s / 2, 0, M); barra(Lp, s / 2, 0, s / 2, s, M) }
    if (ch === "E") { barra(Lp, -s / 2, 0, -s / 2, s, M); for (const y of [0, s / 2, s]) barra(Lp, -s / 2, y, s / 2 * (y === s / 2 ? .6 : 1), y, M) }
    if (ch === "W") { barra(Lp, -s / 2, s, -s / 4, 0, M); barra(Lp, -s / 4, 0, 0, s * .7, M); barra(Lp, 0, s * .7, s / 4, 0, M); barra(Lp, s / 4, 0, s / 2, s, M) }
    if (ch === "S") { for (const [yy, rot] of [[s * .75, Math.PI / 2], [s * .25, -Math.PI / 2]]) Lp.add("v", new THREE.TorusGeometry(s / 4, .022, 5, 10, Math.PI * 1.25), M.clone().multiply(TM(0, yy, 0, 0, 0, rot))) } };
  [["N", 0, -.82, 0], ["S", 0, .82, Math.PI], ["E", .82, 0, -Math.PI / 2], ["W", -.82, 0, Math.PI / 2]].forEach(([ch, x, z, ry]) => letra(ch, TM(x, yc + .05, z, 0, ry + Math.PI, 0)));
  // la pieza que gira: varilla, cabeza de flecha (al oeste), cola ancha calada (al este), y el gallo encima, con su ruedita de giro
  Lg.add("v", new THREE.CylinderGeometry(.04, .04, 3.1, 8), TM(.1, 0, 0, 0, 0, Math.PI / 2)); Lg.add("v", new THREE.CylinderGeometry(.07, .07, .22, 10), TM(0, 0, 0));
  const ext = (sh, dep, M) => { const g = new THREE.ExtrudeGeometry(sh, { depth: dep, bevelEnabled: true, bevelThickness: .01, bevelSize: .01, bevelSegments: 1 }); g.translate(0, 0, -dep / 2); Lg.add("v", g, M) };
  { const s = new THREE.Shape(); s.moveTo(-1.85, 0); s.lineTo(-1.35, .3); s.lineTo(-1.42, .08); s.lineTo(-1.3, 0); s.lineTo(-1.42, -.08); s.lineTo(-1.35, -.3); s.closePath(); ext(s, .05, TM()) }
  { const s = new THREE.Shape(); s.moveTo(1.0, .05); s.lineTo(1.25, .52); s.lineTo(1.82, .58); s.lineTo(1.6, .05); s.lineTo(1.6, -.05); s.lineTo(1.82, -.58); s.lineTo(1.25, -.52); s.lineTo(1.0, -.05); s.closePath();
    const hu = new THREE.Path(); hu.moveTo(1.3, .2); hu.lineTo(1.5, .38); hu.lineTo(1.45, .12); hu.closePath(); s.holes.push(hu); const hu2 = new THREE.Path(); hu2.moveTo(1.3, -.2); hu2.lineTo(1.45, -.12); hu2.lineTo(1.5, -.38); hu2.closePath(); s.holes.push(hu2); ext(s, .05, TM()) }
  // el gallo (silueta calada, mirando al oeste como la flecha)
  { const s = new THREE.Shape(), P = [[.55, 0], [.62, .18], [.5, .34], [.3, .38], [.1, .42], [-.08, .5], [-.16, .66], [-.24, .78], [-.2, .9], [-.3, .98], [-.36, .92], [-.42, 1.0], [-.48, .9], [-.42, .84], [-.5, .8], [-.58, .74], [-.48, .7], [-.42, .62], [-.36, .52], [-.32, .36], [-.24, .22], [-.18, .1], [-.1, 0]];
    s.moveTo(P[0][0], P[0][1]); P.slice(1).forEach(([x, y]) => s.lineTo(x, y)); s.closePath();
    // cola de plumas grandes hacia el este
    const c = new THREE.Shape(); c.moveTo(.4, .12); c.quadraticCurveTo(.75, .6, .62, 1.05); c.quadraticCurveTo(.9, .7, .96, .9); c.quadraticCurveTo(1.0, .5, .86, .34); c.quadraticCurveTo(1.05, .45, 1.08, .6); c.quadraticCurveTo(1.0, .2, .55, .08); c.closePath();
    const ojo = new THREE.Path(); ojo.absarc(-.34, .84, .03, 0, 6.283, true); s.holes.push(ojo); ext(s, .045, TM(-.15, .04, 0)); ext(c, .045, TM(-.15, .04, 0));
    for (const xx of [-.05, .14]) Lg.add("v", new THREE.CylinderGeometry(.018, .018, .1, 4), TM(xx - .15, .02, 0)) }
  L.fin(VEL_BASE, { v: M_VELETA }); Lp.fin(VEL_DOBLA, { v: M_VELETA }); Lg.fin(VEL_GIRO, { v: M_VELETA }) }
// lo que queda en el mástil cuando la veleta se arranca: un muñón doblado
const VEL_MUNON = (() => { const m = new THREE.Mesh(mergeG([[new THREE.CylinderGeometry(.045, .05, .22, 8), TM(0, .11, 0)], [new THREE.ConeGeometry(.05, .12, 6), TM(.02, .26, 0, 0, 0, -.4)]]), M_VELETA); m.visible = false; VEL_DOBLA.add(m); return m })();
const VEL_ESTADO = { t: 0, doblez: 0, rota: 0 };
function veleta(t, o = {}) { const db = cl(o.doblez ?? 0), ro = cl(o.rota ?? 0), f = RAFAGA.value; VEL_ESTADO.t = t; VEL_ESTADO.doblez = db; VEL_ESTADO.rota = ro;
  // el viento la sostiene apuntando al oeste: oscila un poco, y tiembla (más con más viento y con el peso)
  const osc = Math.sin(t * 1.3) * .07 * f + Math.sin(t * 3.7 + 1) * .04 * f, tiem = (Math.sin(t * 41) * .012 + Math.sin(t * 57 + 2) * .008) * (f + db * 2 + ro * 3);
  VEL_DOBLA.rotation.set(tiem * .5, 0, -db * 1.05 - ro * .25 - Math.max(0, f - 1) * .03 + tiem);
  if (ro < 1) { if (VELETA_PIEZA.parent !== VEL_DOBLA) { VEL_DOBLA.add(VELETA_PIEZA) } VELETA_PIEZA.position.set(0, TORRE_Y + VELETA_Y - (TORRE_Y + VEL_BASE_Y) - .05, 0); VELETA_PIEZA.rotation.set(0, 0, -ro * .35 + tiem * 2 * ro); VEL_GIRO.rotation.set(tiem * (1 + db * 3), osc + db * .05, tiem * db * 2); VEL_MUNON.visible = false; VELETA_PIEZA.visible = true }
  else { // suelta: queda donde se rompió (o donde la ponga la escena)
    if (VELETA_PIEZA.parent !== scene) { VEL_DOBLA.updateMatrixWorld(true); VELETA_PIEZA.position.set(0, TORRE_Y + VELETA_Y - (TORRE_Y + VEL_BASE_Y) - .05, 0); VELETA_PIEZA.rotation.set(0, 0, -.35); VELETA_PIEZA.updateMatrix(); const M = VEL_DOBLA.matrixWorld.clone().multiply(VELETA_PIEZA.matrix); scene.add(VELETA_PIEZA); M.decompose(VELETA_PIEZA.position, VELETA_PIEZA.quaternion, VELETA_PIEZA.scale) }
    if (o.pos) VELETA_PIEZA.position.set(...o.pos); if (o.rot) VELETA_PIEZA.rotation.set(...o.rot); VEL_GIRO.rotation.set(0, 0, 0); VEL_MUNON.visible = true } }
const VELETA_W = () => { VEL_GIRO.updateMatrixWorld(true); return VEL_COLGAR.clone().applyMatrix4(VEL_GIRO.matrixWorld).toArray() };

// ---------- ÁRBOLES TORCIDOS («krummholz»): tronco que crece acostado hacia +x, ramas solo del lado del viento, copas aplastadas y estiradas
const T_CORTEZA = (() => { const [c, z] = pintarDoble(256, 512, (c, z, w, h) => { const r = rng(4701); c.fillStyle = "#6a5e50"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
    for (let k = 0; k < 260; k++) { const x = r() * w, y = r() * h, L = 30 + r() * 140; c.strokeStyle = r() < .5 ? `rgba(40,32,24,${.3 + r() * .4})` : `rgba(170,160,140,${.2 + r() * .3})`; c.lineWidth = 2 + r() * 5; c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + (r() - .5) * 20, y + L / 3, x + (r() - .5) * 20, y + L * .66, x + (r() - .5) * 10, y + L); c.stroke(); z.strokeStyle = "rgba(20,20,20,.6)"; z.lineWidth = 3; z.beginPath(); z.moveTo(x, y); z.lineTo(x, y + L); z.stroke() }
    for (let k = 0; k < 60; k++) { c.fillStyle = r() < .5 ? "rgba(150,160,90,.4)" : "rgba(220,215,190,.4)"; c.beginPath(); c.arc(r() * w, r() * h, 2 + r() * 6, 0, 7); c.fill() } });
  [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
const T_FOLLAJE = (() => { const [c, z] = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(4702); c.fillStyle = "#8a9a6a"; c.fillRect(0, 0, w, h); z.fillStyle = "#606060"; z.fillRect(0, 0, w, h);
    for (let k = 0; k < 5000; k++) { const x = r() * w, y = r() * h, L = 6 + r() * 12, a = -.3 + (r() - .5) * .8, v = r(); c.strokeStyle = v < .4 ? "rgba(40,56,26,.6)" : v < .8 ? "rgba(140,160,96,.5)" : "rgba(200,210,150,.5)"; c.lineWidth = 1.5 + r() * 1.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); c.stroke(); z.strokeStyle = v < .4 ? "rgba(20,20,20,.5)" : "rgba(220,220,220,.5)"; z.lineWidth = 2; z.beginPath(); z.moveTo(x, y); z.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); z.stroke() } });
  [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
const M_CORTEZA = new THREE.MeshStandardMaterial({ map: T_CORTEZA.c, bumpMap: T_CORTEZA.z, bumpScale: 4, roughness: .95 });
const M_COPA = conViento(new THREE.MeshStandardMaterial({ map: T_FOLLAJE.c, bumpMap: T_FOLLAJE.z, bumpScale: 5, roughness: .85, color: "#ffffff" }), "copa", .07);
const tubo = (pts, r0, r1, seg = 7, ts = 10) => { const cu = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), g = new THREE.TubeGeometry(cu, ts, 1, seg, false), p = g.attributes.position, uv = g.attributes.uv, P = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { const u = uv.getX(i), c2 = cu.getPointAt(u); P.set(p.getX(i), p.getY(i), p.getZ(i)).sub(c2).multiplyScalar(lerp(r0, r1, u)).add(c2); p.setXYZ(i, P.x, P.y, P.z); uv.setXY(i, uv.getY(i) * 2, u * cu.getLength() / 2) } g.computeVertexNormals(); return g };
const GEO_ARBOL = [0, 1, 2, 3].map(v => { const r = rng(4710 + v), T = [], C = [], H = 3.2 + r() * 1.4, inc = .55 + r() * .3;
  const tr = [[0, -.2, 0], [.15, H * .3, 0], [H * inc * .45, H * .62, (r() - .5) * .3], [H * inc * .95, H * .85, (r() - .5) * .4], [H * inc * 1.5, H * .95, (r() - .5) * .5]]; T.push([tubo(tr, .26 + r() * .08, .07), TM()]);
  // raíces que se agarran del piso del lado del viento
  for (let k = 0; k < 4; k++) { const a = Math.PI + (r() - .5) * 2.2; T.push([tubo([[0, .3, 0], [Math.cos(a) * .5, .05, Math.sin(a) * .5], [Math.cos(a) * 1.1, -.1, Math.sin(a) * 1.1]], .12, .03, 5, 5), TM()]) }
  const cu = new THREE.CatmullRomCurve3(tr.map(p => new THREE.Vector3(...p)));
  for (let k = 0; k < 7; k++) { const u = .35 + k / 7 * .6, p = cu.getPointAt(u), L = 1.4 + r() * 1.8 * (1 - u * .3), zs = (r() - .5) * 2.2, yb = (r() - .2) * .6, q = [p.toArray(), [p.x + L * .45, p.y + yb * .5, p.z + zs * .4], [p.x + L, p.y + yb, p.z + zs]];
    T.push([tubo(q, .09 - u * .04, .025, 5, 5), TM()]);
    // copa: almohadones aplastados a lo largo de la rama, estirados hacia +x
    for (let j = 0; j < 4; j++) { const s = .38 + r() * .34, g = geoPiedra(4720 + v * 31 + k * 5 + j, 1, .62); C.push([g, TM(p.x + L * (.3 + j * .25) + (r() - .5) * .3, p.y + yb * (.4 + j * .2) + .1 + (r() - .3) * .35, p.z + zs * (.4 + j * .2) + (r() - .5) * .4, 0, (r() - .5) * .4, 0, s * 1.6, s * .85, s * 1.15)]) } }
  for (let j = 0; j < 3; j++) { const p = cu.getPointAt(1), s = .7 + r() * .4; C.push([geoPiedra(4790 + v * 7 + j, 1, .5), TM(p.x + .3 + j * .6, p.y + .2 + (r() - .5) * .3, p.z + (r() - .5) * .8, 0, 0, 0, s * 1.8, s * .7, s * 1.2)]) }
  const gc = mergeG(C), pc = gc.attributes.position, uc = gc.attributes.uv; for (let i = 0; i < pc.count; i++) uc.setXY(i, pc.getX(i) / 1.6, (pc.getY(i) + pc.getZ(i)) / 1.6);
  return [mergeG(T), gc] });
const ARBOLES = [];
{ const r = rng(4800), lugares = [[22, 24, 1.15], [-17, -22, 1.05], [27, -24, 1.2], [-34, -8, 1.1], [32, 12, .95]];
  for (let k = 0; k < 900 && lugares.length < 95; k++) { const a = r() * 6.283, d = 26 + r() * 95, x = Math.cos(a) * d, z = Math.sin(a) * d * .9; if (x > 86 || Math.hypot(x - COLINA[0], z - COLINA[1]) < 13 || sendaK(x, z) > .2 || !libreEn(x, z, 2.5)) continue; if (lugares.some(([x2, z2]) => Math.hypot(x2 - x, z2 - z) < 5)) continue; lugares.push([x, z, .8 + r() * .6]) }
  lugares.forEach(([x, z, s]) => { ocupa(x, z, 1.4 * s); ARBOLES.push([x, z, s]) });
  const ims = GEO_ARBOL.map(([gt, gc]) => { const a = new THREE.InstancedMesh(gt, M_CORTEZA, ARBOLES.length), b = new THREE.InstancedMesh(gc, M_COPA, ARBOLES.length); a.count = b.count = 0; [a, b].forEach(m => { m.castShadow = m.receiveShadow = true; scene.add(m) }); return [a, b] }), cc = new THREE.Color();
  ARBOLES.forEach(([x, z, s], i) => { const [a, b] = ims[i % 4], n = a.count++; b.count++; dummy.position.set(x, SUELO(x, z) - .05, z); dummy.rotation.set(0, (r() - .5) * .45, 0); dummy.scale.set(s, s * (.9 + r() * .2), s); dummy.updateMatrix(); a.setMatrixAt(n, dummy.matrix); b.setMatrixAt(n, dummy.matrix); b.setColorAt(n, cc.set(["#8aa05a", "#7a9250", "#98a862", "#86984e", "#a0aa66"][r() * 5 | 0])) }) }

// ---------- arbustos achaparrados (también estirados a sotavento), piedras sueltas, cercas de piedra seca y flores chicas en 3D
const GEO_ARBUSTO = [0, 1, 2].map(v => { const r = rng(4850 + v), L = []; for (let k = 0; k < 7; k++) { const s = .2 + r() * .16, x = k * .16 + (r() - .5) * .3; L.push([geoPiedra(4860 + v * 13 + k, 1, .8), TM(x, s * .5 + (r() - .3) * .1, (r() - .5) * .4, r(), r() * 6, r(), s * 1.25, s * (.95 - x * .3), s)]) } const g = mergeG(L), p = g.attributes.position, u = g.attributes.uv; for (let i = 0; i < p.count; i++) u.setXY(i, p.getX(i) / .45, (p.getY(i) + p.getZ(i)) / .45); return g });
// cercas de piedra seca: a lo largo del camino del oeste, alrededor de los campos y en las lomas
const CERCAS = [[[-112, 13], [-62, 11.5], [-48, 12.5]], [[-112, 3], [-30, 2.6]], [[30, -8], [84, -9]], [[30, 3.5], [56, 2.5], [84, 4]], [[-60, -30], [-34, -42], [-6, -48], [24, -46], [50, -36]], [[-72, 26], [-60, 48], [-30, 60], [0, 62], [30, 58]], [[44, 14], [62, 40], [80, 52]], [[-90, -20], [-80, -60], [-50, -78]], [[-12, 30], [-24, 44], [-40, 46]]];
{ const r = rng(4900), P = [], cc = new THREE.Color();
  CERCAS.forEach(pl => { for (let i = 0; i < pl.length - 1; i++) { const [x0, z0] = pl[i], [x1, z1] = pl[i + 1], L = Math.hypot(x1 - x0, z1 - z0), ang = Math.atan2(z1 - z0, x1 - x0); for (let s = 0; s < L; s += .42 + r() * .12) { const x = lerp(x0, x1, s / L) + (r() - .5) * .08, z = lerp(z0, z1, s / L) + (r() - .5) * .08; if (!libreEn(x, z, .4, { mc: 0 }) || sendaK(x, z) > .55) continue; const y = SUELO(x, z);
      for (let f = 0; f < 3; f++) { const sx = .26 + r() * .1, sy = .16 + r() * .06; P.push([x + (r() - .5) * .06, y + .1 + f * .26 + sy * .3, z + (r() - .5) * .1, sx, sy, .2 + r() * .06, ang + (r() - .5) * .3, f]) }
      if (r() < .7) P.push([x, y + .86, z, .2, .14, .18, ang + 1.57, 3]) } } });
  // piedras sueltas por el campo y algunas grandes (más en la loma y en las laderas)
  for (let k = 0; k < 900; k++) { const a = r() * 6.283, d = 12 + r() * r() * 110, x = Math.cos(a) * d, z = Math.sin(a) * d; if (x > 88 || !libreEn(x, z, .6) || sendaK(x, z) > .4) continue; const s = r() < .08 ? .7 + r() * 1.1 : .12 + r() * r() * .5; P.push([x, SUELO(x, z) + s * .15, z, s * (1 + r() * .5), s * (.6 + r() * .4), s, r() * 6.283, 9]) }
  const ms = GEO_PIEDRAS.map(g => { const m = new THREE.InstancedMesh(g, M_ROCA, Math.ceil(P.length / 3) + 2); m.castShadow = m.receiveShadow = true; m.count = 0; scene.add(m); return m });
  P.forEach(([x, y, z, sx, sy, sz, a, f], i) => { const m = ms[i % 3], n = m.count++; dummy.position.set(x, y, z); dummy.rotation.set((r() - .5) * .3, -a, (r() - .5) * .3); dummy.scale.set(sx, sy, sz); dummy.updateMatrix(); m.setMatrixAt(n, dummy.matrix); m.setColorAt(n, cc.set(["#9a968a", "#86837a", "#aaa598", "#7a776e", "#a29a88", "#8e8a7c"][r() * 6 | 0])) }) }
{ const r = rng(4950), M_ARB = conViento(new THREE.MeshStandardMaterial({ map: T_FOLLAJE.c, bumpMap: T_FOLLAJE.z, bumpScale: 5, roughness: 1 }), "copa", .05), cc = new THREE.Color(), ims = GEO_ARBUSTO.map(g => { const m = new THREE.InstancedMesh(g, M_ARB, 200); m.count = 0; m.castShadow = m.receiveShadow = true; scene.add(m); return m });
  for (let k = 0; k < 2000 && ims.reduce((a, m) => a + m.count, 0) < 520; k++) { const a = r() * 6.283, d = 13 + r() * 100, x = Math.cos(a) * d, z = Math.sin(a) * d; if (x > 88 || !libreEn(x, z, .9) || sendaK(x, z) > .3 || Math.hypot(x - COLINA[0], z - COLINA[1]) < 8) continue; const m = ims[k % 3]; if (m.count >= 200) continue; const n = m.count++, s = .6 + r() * .8;
    dummy.position.set(x, SUELO(x, z) - .05, z); dummy.rotation.set(0, (r() - .5) * .5, 0); dummy.scale.set(s, s * (.8 + r() * .4), s); dummy.updateMatrix(); m.setMatrixAt(n, dummy.matrix); m.setColorAt(n, cc.set(["#7a8a48", "#6e7e42", "#8a8a50", "#96864e", "#647440"][r() * 5 | 0])) } }

// ---------- PASTO en matas: briznas acostadas hacia +x que ondean (olas de viento que corren hacia +x por el valle)
const GEO_MATA = (() => { const r = rng(5001), pos = [], uv = [], idx = []; for (let b = 0; b < 6; b++) { const a = r() * 6.283, d = r() * .14, bx = Math.cos(a) * d, bz = Math.sin(a) * d, H = .28 + r() * .32, lean = .25 + r() * .3, fa = r() * 6.283, wv = .028 + r() * .015, o = pos.length / 3;
    for (let k = 0; k <= 3; k++) { const s = k / 3, x = bx + s * s * lean * H, y = s * H, z = bz + Math.sin(fa) * s * .04, wd = wv * (1 - s * .85); pos.push(x - Math.sin(fa) * wd, y, z + Math.cos(fa) * wd, x + Math.sin(fa) * wd, y, z - Math.cos(fa) * wd); uv.push(0, s, 1, s) }
    for (let k = 0; k < 3; k++) { const i = o + k * 2; idx.push(i, i + 1, i + 2, i + 1, i + 3, i + 2) } }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const n = g.attributes.normal; for (let i = 0; i < n.count; i++) n.setXYZ(i, n.getX(i) * .3, 1, n.getZ(i) * .3); n.needsUpdate = true; g.normalizeNormals(); return g })();
const M_MATA = conViento(new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .9, side: THREE.DoubleSide }), "pasto", .22);
const PASTO = (() => { const N = 17000, m = new THREE.InstancedMesh(GEO_MATA, M_MATA, N), r = rng(5010), cc = new THREE.Color(); m.receiveShadow = true; m.castShadow = false; let n = 0;
  for (let k = 0; k < N * 3 && n < N; k++) { const a = r() * 6.283, d = k % 4 === 3 ? 60 + r() * 50 : 6 + Math.pow(r(), .8) * 62, x = Math.cos(a) * d, z = Math.sin(a) * d; if (x > 90 || Math.hypot(x, z) < 11.6 || !libreEn(x, z, .25, { mc: -.6, zona: 1 }) || Math.hypot(x - TORRE[0], z - TORRE[1]) < 3.6 || sendaK(x, z) > .3) continue;
    const s = .5 + r() * .45; dummy.position.set(x, SUELO(x, z) - .02, z); dummy.rotation.set(0, (r() - .5) * .5, 0); dummy.scale.set(s, s * (.7 + r() * .6), s); dummy.updateMatrix(); m.setMatrixAt(n, dummy.matrix);
    const c0 = colorSuelo(x, z); cc.setRGB(c0[0] * (.72 + r() * .25), c0[1] * (.8 + r() * .25), c0[2] * (.6 + r() * .2)); m.setColorAt(n, cc); n++ }
  m.count = n; scene.add(m); return m })();
// flores alpinas chicas (tallo, cinco pétalos, centro) — en 3D, sueltas entre el pasto y al pie de las casas
const FLORES = (() => { const r = rng(5050), tal = mergeG([[new THREE.CylinderGeometry(.008, .01, .26, 4), TM(.03, .13, 0, 0, 0, -.2)], [new THREE.SphereGeometry(.03, 5, 4), TM(.02, .05, .03, 0, 0, 0, 1.4, .3, .8)]]), pet = [];
  for (let k = 0; k < 5; k++) { const a = k / 5 * 6.283; pet.push([new THREE.SphereGeometry(.028, 5, 3), TM(.06 + Math.cos(a) * .035, .265, Math.sin(a) * .035, 0, -a, 0, 1.3, .35, .8)]) } const gp = mergeG(pet), gc = new THREE.SphereGeometry(.018, 6, 4); gc.translate(.06, .275, 0);
  const N = 700, a = new THREE.InstancedMesh(tal, conViento(new THREE.MeshStandardMaterial({ color: "#5a7a34", roughness: .8 }), "copa", .2), N), b = new THREE.InstancedMesh(gp, new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .6 }), N), c = new THREE.InstancedMesh(gc, SM("#e0b030"), N), cc = new THREE.Color(); let n = 0;
  for (let k = 0; k < N * 4 && n < N; k++) { const ca = CASAS_V[k % CASAS_V.length], cerca = k % 3 === 0, an = r() * 6.283, d = cerca ? Math.hypot(ca.w, ca.d) / 2 + .3 + r() * 1.2 : 12 + r() * 60, x = cerca ? ca.x + Math.cos(an) * d : Math.cos(an) * d, z = cerca ? ca.z + Math.sin(an) * d : Math.sin(an) * d;
    if (!libreEn(x, z, .1, { mc: -.4 }) || sendaK(x, z) > .3) continue; const s = .8 + r() * .6, col = ["#f4f0e0", "#e8c838", "#8a6ab8", "#e8e4f0", "#d84a6a", "#f0d050"][r() * 6 | 0];
    for (let j = 0; j < 3 && n < N; j++) { const xx = x + (r() - .5) * .5, zz = z + (r() - .5) * .5; dummy.position.set(xx, SUELO(xx, zz) - .01, zz); dummy.rotation.set(0, (r() - .5) * .6, 0); dummy.scale.setScalar(s * (.8 + r() * .4)); dummy.updateMatrix(); a.setMatrixAt(n, dummy.matrix); b.setMatrixAt(n, dummy.matrix); c.setMatrixAt(n, dummy.matrix); b.setColorAt(n, cc.set(col)); n++ } }
  [a, b, c].forEach(m => { m.count = n; m.castShadow = false; m.receiveShadow = true; scene.add(m) }); return { a, b, c } })();
