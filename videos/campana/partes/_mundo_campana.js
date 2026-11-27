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
