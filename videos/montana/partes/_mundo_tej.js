// ================= «NOBODY ANSWERS THE KNOCK»: HOLLOWMERE, el pueblo de madera y piedra (piso, empedrado, veredas, casas apretadas de
// 2–3 pisos con puertas SIN picaporte, la casa de la familia y el taller del sastre por dentro, la casa de Marga, la de Father Crane con
// el único picaporte, la iglesia con su campanario) =================
// Medidas de _comun_tej.js (CALLE_T, PLAZA_T, IGLESIA_T, TORRE_T, CASA_FAM, TALLER_T, CASA_MARGA, CASA_CRANE, ALT_T). Norte = −z.
// La utilería, los muebles, las puertas que se abren, los abrigos, el poste de la colina, las velas y los climas van en _detalle_tej.js;
// el fondo lejano (bosque, montes, cielo, luna, nubes) en _lejos_tej.js. Técnica del video anterior: texturas pintadas en canvas con relieve,
// lotes (merge por material), instancing, rectAdd para el mapa de ocupación.
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

// ---------- el piso de Hollowmere: ALT_T exacto (los personajes y la Tejedora usan la misma altura)
const SUELO = (x, z) => ALT_T(x, z);
const sueloT = (x, z) => ALT_T(x, z), sueloB = sueloT;   // sueloB: nombre viejo (lo usan escenas y elenco viejos)
const sueloN = (x, z, e = .6) => { const nx = SUELO(x - e, z) - SUELO(x + e, z), nz = SUELO(x, z - e) - SUELO(x, z + e), l = Math.hypot(nx, 2 * e, nz); return [nx / l, 2 * e / l, nz / l] };
// callejones de atrás (detrás de las filas de la calle principal: ahí da la ventana de atrás de la familia)
const CALLEJONES_T = [{ x0: -18.6, x1: -15.2, z0: -40, z1: 79 }, { x0: 15.8, x1: 19.2, z0: -37, z1: 79 }];
// sendero de tierra de la calle transversal a la cima de la colina (polilínea en planta)
const SENDERO_T = [[64, -20], [70, -19], [75, -22.5], [79, -27], [82.5, -29.2], [86, -30]];
const distSeg = (x, z, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz, u = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / L2)); return Math.hypot(x - a[0] - u * dx, z - a[1] - u * dz) };
const distSendero = (x, z) => { let d = 1e9; for (let i = 0; i < SENDERO_T.length - 1; i++) d = Math.min(d, distSeg(x, z, SENDERO_T[i], SENDERO_T[i + 1])); return d };
const enCalleP = (x, z, m = 0) => Math.abs(x - CALLE_T.x) < CALLE_T.fachada + m && z > CALLE_T.z0 - m && z < CALLE_T.z1 + m;
const enEmpedrado = (x, z, m = 0) => Math.abs(x - CALLE_T.x) < CALLE_T.an / 2 + m && z > CALLE_T.z0 - m && z < CALLE_T.z1 + m;
const enCruce = (x, z, m = 0) => Math.abs(z - CRUCE_T.z) < CRUCE_T.an / 2 + m && x > CRUCE_T.x0 - m && x < CRUCE_T.x1 + m;
const enPlaza = (x, z, m = 0) => Math.abs(x - PLAZA_T.x) < PLAZA_T.w / 2 + m && Math.abs(z - PLAZA_T.z) < PLAZA_T.d / 2 + m;
const enCallejon = (x, z, m = 0) => CALLEJONES_T.some(C => x > C.x0 - m && x < C.x1 + m && z > C.z0 - m && z < C.z1 + m);
const enCalle = (x, z, m = 0) => enCalleP(x, z, m) || enCruce(x, z, m) || enPlaza(x, z, m) || enCallejon(x, z, m);
// cuánto «empedrado» es el punto (0–1, borde suave con ruido): para el color del piso
const calleKT = (x, z) => { const n = (fbm2(x * .7, z * .7, 2) - .5) * .5, ax = Math.abs(x);
  let k = (1 - sst(CALLE_T.fachada - .2, CALLE_T.fachada + .3, ax + n)) * sst(CALLE_T.z0 - 1, CALLE_T.z0 + .2, z + n) * (1 - sst(CALLE_T.z1 - 1, CALLE_T.z1 + 2, z + n));
  k = Math.max(k, (1 - sst(CRUCE_T.an / 2 - .2, CRUCE_T.an / 2 + .3, Math.abs(z - CRUCE_T.z) + n)) * sst(CRUCE_T.x0 - 1, CRUCE_T.x0 + .5, x) * (1 - sst(CRUCE_T.x1 - 2, CRUCE_T.x1 + 1, x)));
  k = Math.max(k, (1 - sst(PLAZA_T.w / 2 - .2, PLAZA_T.w / 2 + .4, Math.abs(x - PLAZA_T.x) + n)) * (1 - sst(PLAZA_T.d / 2 - .2, PLAZA_T.d / 2 + .4, Math.abs(z - PLAZA_T.z) + n)));
  CALLEJONES_T.forEach(C => { k = Math.max(k, .7 * sst(C.x0 - .3, C.x0 + .3, x + n) * (1 - sst(C.x1 - .3, C.x1 + .3, x + n)) * sst(C.z0, C.z0 + 1, z) * (1 - sst(C.z1 - 1, C.z1, z))) }); return k };

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
const PUERTA_C = ["#3a4a3c", "#5a2a22", "#2e3e52", "#6a5232", "#3a3028", "#4a524a", "#4e3026", "#22343a", "#5e5446"];
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

// ---------- piedra de los muros de contención: bloques grandes, oscuros abajo (humedad, musgo), líquenes
const M_MURO_T = (() => { const [t, z] = T_MURO(4240, ["#8a8276", "#76706a", "#9a9284", "#6a645c", "#a39a88", "#5e5a54", "#847866"], { mortero: "#46423c", escala: 1.7, musgo: 1, liquen: 90 }); return new THREE.MeshStandardMaterial({ map: t, bumpMap: z, bumpScale: 5, roughness: .95 }) })();
const M_ESCALON = new THREE.MeshStandardMaterial({ map: T_ROCA.c, bumpMap: T_ROCA.z, bumpScale: 3, roughness: .9, color: "#b2a894" });
const M_CORONA = new THREE.MeshStandardMaterial({ map: T_ROCA.c, bumpMap: T_ROCA.z, bumpScale: 3, roughness: .88, color: "#c8bea8" });

// ================= HOLLOWMERE: texturas nuevas (tablas de madera, puertas sin picaporte, rasguños de percha), reflejo nocturno, el piso
// ---------- tablas de madera solapadas (paredes de madera): tablas horizontales de ≈ 23 cm, sombra bajo cada solape, clavos, nudos,
// vetas, pintura descascarada, la parte de abajo podrida y verdosa
const T_TABLAS_H = (seed, pal, o = {}) => repT(pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(seed), nb = 14, bh = h / nb;
  c.fillStyle = "#2a2018"; c.fillRect(0, 0, w, h); z.fillStyle = "#404040"; z.fillRect(0, 0, w, h);
  for (let b = 0; b < nb; b++) { const y0 = b * bh; let x = -r() * 200; while (x < w) { const L = 260 + r() * 520, col = rgbj(pal[r() * pal.length | 0], r, 22);
      for (const dx of [-w, 0, w]) { const x0 = x + dx; c.fillStyle = col; c.fillRect(x0, y0, L - 2, bh);
        const gr = c.createLinearGradient(0, y0, 0, y0 + bh); gr.addColorStop(0, "rgba(0,0,0,.55)"); gr.addColorStop(.16, "rgba(0,0,0,.08)"); gr.addColorStop(.7, "rgba(255,240,220,.06)"); gr.addColorStop(.97, "rgba(255,240,220,.14)"); gr.addColorStop(1, "rgba(0,0,0,.4)"); c.fillStyle = gr; c.fillRect(x0, y0, L - 2, bh);
        const gz = z.createLinearGradient(0, y0, 0, y0 + bh); gz.addColorStop(0, "#303030"); gz.addColorStop(.2, "#8a8a8a"); gz.addColorStop(1, "#c8c8c8"); z.fillStyle = gz; z.fillRect(x0, y0, L - 2, bh);
        // vetas largas
        for (let k = 0; k < 7; k++) { const yy = y0 + 6 + r() * (bh - 10); c.strokeStyle = r() < .5 ? "rgba(30,20,12,.28)" : "rgba(255,235,200,.1)"; c.lineWidth = 1 + r() * 1.6; c.beginPath(); c.moveTo(x0, yy); for (let q = 0; q <= 1; q += .1) c.lineTo(x0 + q * L, yy + Math.sin(q * 9 + k) * 2.5); c.stroke() }
        if (r() < .35) { const kx = x0 + r() * L, ky = y0 + bh * (.3 + r() * .5); c.fillStyle = "rgba(40,24,14,.7)"; c.beginPath(); c.ellipse(kx, ky, 9 + r() * 8, 5 + r() * 3, 0, 0, 7); c.fill(); z.fillStyle = "#202020"; z.beginPath(); z.ellipse(kx, ky, 8, 4, 0, 0, 7); z.fill() }
        // clavos a cada extremo y en el medio (con chorrito de óxido)
        for (const q of [.02, .5, .98]) { const nx = x0 + q * L, ny = y0 + bh * .55; c.fillStyle = "#1a1612"; c.beginPath(); c.arc(nx, ny, 3, 0, 7); c.fill(); const g2 = c.createLinearGradient(0, ny, 0, ny + 40); g2.addColorStop(0, "rgba(110,50,20,.45)"); g2.addColorStop(1, "rgba(110,50,20,0)"); c.fillStyle = g2; c.fillRect(nx - 2, ny, 4, 40) }
        c.fillStyle = "rgba(10,6,4,.85)"; c.fillRect(x0 + L - 3, y0, 3, bh); z.fillStyle = "#101010"; z.fillRect(x0 + L - 4, y0, 4, bh) } x += L } }
  // pintura vieja descascarada (manchones de otro color que se salen)
  if (o.pintura) for (let k = 0; k < 120; k++) { const x = r() * w, y = r() * h, s = 10 + r() * 60; envuelto(c, w, h, () => { c.fillStyle = o.pintura; c.globalAlpha = .55 + r() * .3; c.beginPath(); for (let a = 0; a < 6.28; a += .5) { const d = s * (.5 + r() * .6); a ? c.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d * .5) : c.moveTo(x + d, y) } c.fill(); c.globalAlpha = 1 }) }
  for (let k = 0; k < 9000; k++) { c.fillStyle = r() < .5 ? "rgba(20,12,6,.14)" : "rgba(255,240,220,.07)"; c.fillRect(r() * w, r() * h, 1 + r() * 2, 1) }
  // chorreaduras de agua y hollín desde arriba, musgo abajo
  for (let k = 0; k < 26; k++) { const x = r() * w, y2 = r() * h * .5, L = 120 + r() * 400, an = 6 + r() * 26, gr = c.createLinearGradient(0, y2, 0, y2 + L); gr.addColorStop(0, "rgba(20,16,12,.32)"); gr.addColorStop(1, "rgba(20,16,12,0)"); c.fillStyle = gr; c.fillRect(x - an / 2, y2, an, L) }
  for (let k = 0; k < 500; k++) { const x = r() * w, y2 = h - Math.pow(r(), 2) * h * .3; c.fillStyle = `rgba(${50 + r() * 30 | 0},${70 + r() * 30 | 0},${34 + r() * 20 | 0},${.2 + r() * .3})`; c.beginPath(); c.arc(x, y2, 2 + r() * 6, 0, 7); c.fill() } }));
const TABLAS_P_H = [[["#4a3a2c", "#56442f", "#3e3024", "#5e4a36", "#4e3e30"], "#6a5a48"], [["#3a3a36", "#46443e", "#32302c", "#4e4a42"], "#5a6058"], [["#5a4636", "#6a5440", "#4a3a2c", "#725a44"], "#7a2e22"], [["#2e3436", "#3a4044", "#283034", "#444a4c"], "#4a5a6a"], [["#6a5a48", "#7a6852", "#5a4c3c", "#84705a"], "#8a8270"]];
const M_TABLAS_H = TABLAS_P_H.map(([p, pin], i) => { const [t, z] = T_TABLAS_H(4600 + i, p, { pintura: pin }); return new THREE.MeshStandardMaterial({ map: t, bumpMap: z, bumpScale: 5, roughness: .92 }) });
// ---------- la marca del picaporte arrancado (calcomanía transparente del tamaño de la hoja de la puerta): la sombra clara donde estaba la
// chapa, cuatro agujeros de tornillo (dos tornillos torcidos que quedaron), el agujero del vástago, astillas arrancadas, y a veces los
// RASGUÑOS largos de las perchas (tres o cuatro surcos paralelos que cruzan la hoja en diagonal, madera cruda adentro)
const T_MARCA_PUERTA = k => tex(256, 512, (g, w, h) => { const r = rng(4700 + k); g.clearRect(0, 0, w, h);
  const hx = w * .8, hy = h * .53, pw = 34, ph = 92;
  // la chapa que ya no está: madera más clara (sin sol ni mugre) con borde de mugre
  g.fillStyle = "rgba(190,160,120,.55)"; g.fillRect(hx - pw / 2, hy - ph / 2, pw, ph); g.strokeStyle = "rgba(20,12,6,.6)"; g.lineWidth = 3; g.strokeRect(hx - pw / 2, hy - ph / 2, pw, ph);
  for (const [dx, dy] of [[-.32, -.4], [.32, -.4], [-.32, .4], [.32, .4]]) { g.fillStyle = "#0a0604"; g.beginPath(); g.arc(hx + dx * pw, hy + dy * ph, 3.2, 0, 7); g.fill(); g.strokeStyle = "rgba(230,200,150,.6)"; g.lineWidth = 1.2; g.beginPath(); g.arc(hx + dx * pw, hy + dy * ph, 5, 0, 7); g.stroke() }
  // astillas arrancadas alrededor del agujero (madera cruda)
  for (let q = 0; q < 9; q++) { const a = r() * 6.283, L = 10 + r() * 22; g.fillStyle = "rgba(220,186,130,.85)"; g.beginPath(); g.moveTo(hx + Math.cos(a) * 9, hy + Math.sin(a) * 9); g.lineTo(hx + Math.cos(a + .18) * (9 + L), hy + Math.sin(a + .18) * (9 + L)); g.lineTo(hx + Math.cos(a - .1) * (8 + L * .7), hy + Math.sin(a - .1) * (8 + L * .7)); g.fill() }
  g.fillStyle = "#000"; g.beginPath(); for (let a = 0; a <= 6.3; a += .5) { const d = 8 + r() * 3; a ? g.lineTo(hx + Math.cos(a) * d, hy + Math.sin(a) * d) : g.moveTo(hx + d, hy) } g.fill();
  // el ojo de la cerradura (vacío) más abajo
  g.fillStyle = "#050302"; g.beginPath(); g.arc(hx, hy + 30, 3.5, 0, 7); g.fill(); g.fillRect(hx - 1.5, hy + 30, 3, 9);
  // golpes de martillo y marcas de palanca
  for (let q = 0; q < 6; q++) { g.strokeStyle = "rgba(30,18,10,.6)"; g.lineWidth = 2; const x = hx + (r() - .5) * 60, y = hy + (r() - .5) * 120; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 14, y + (r() - .5) * 6); g.stroke() }
  // rasguños de percha (tres de cada cuatro puertas)
  if (k % 4 !== 3) { const n = 3 + (k % 2), x0 = w * (.12 + r() * .25), y0 = h * (.12 + r() * .2), L = h * (.55 + r() * .3);
    for (let q = 0; q < n; q++) { const ox = q * 13, oy = q * 5; g.lineCap = "round";
      const P = t => [x0 + ox + t * L * (.1 + (k % 3) * .06), y0 + oy + t * L];
      g.strokeStyle = "rgba(10,6,3,.9)"; g.lineWidth = 6; g.beginPath(); for (let t = 0; t <= 1; t += .05) { const [x, y] = P(t); const jit = Math.sin(t * 40 + q) * 1.2; t ? g.lineTo(x + jit, y) : g.moveTo(x, y) } g.stroke();
      g.strokeStyle = "rgba(226,196,150,.9)"; g.lineWidth = 2.2; g.beginPath(); for (let t = .03; t <= .97; t += .05) { const [x, y] = P(t); t > .04 ? g.lineTo(x + .6, y - .6) : g.moveTo(x + .6, y - .6) } g.stroke() } } });
const M_MARCA_PUERTA = [0, 1, 2, 3, 4, 5].map(k => new THREE.MeshStandardMaterial({ map: T_MARCA_PUERTA(k), transparent: true, alphaTest: .02, roughness: .85, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
// ---------- reflejo nocturno (charcos, adoquines mojados, vidrios): cielo azul oscuro, la luna (oeste-noroeste) y puntitos cálidos de ventanas abajo
const LUNA_DIR = new THREE.Vector3(-.6, .38, -.25).normalize();
const ENV_NOCHE_P = (() => { const es = new THREE.Scene(); es.add(new THREE.Mesh(new THREE.SphereGeometry(50, 64, 32), new THREE.ShaderMaterial({ side: THREE.BackSide, uniforms: { uL: { value: LUNA_DIR } },
    vertexShader: "varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
    fragmentShader: `uniform vec3 uL; varying vec3 vD; float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main(){ float y = vD.y; vec3 c = mix(vec3(.16,.2,.32), vec3(.012,.02,.05), smoothstep(0., .5, y)); c = mix(c, vec3(.02,.018,.016), smoothstep(.0, -.25, y));
        float m = max(dot(vD, uL), 0.); c += vec3(.75,.82,1.) * (pow(m, 900.) * 18. + pow(m, 40.) * .35 + pow(m, 6.) * .05);
        vec2 q = vec2(atan(vD.z, vD.x) * 40., y * 90.); float w = step(.86, h(floor(q))) * smoothstep(.14, .0, abs(y - .03)); c += vec3(1., .55, .18) * w * 3.; gl_FragColor = vec4(c, 1.); }` })));
  const pm = new THREE.PMREMGenerator(R), rt = pm.fromScene(es, 0, .1, 100); pm.dispose(); return rt.texture })();
M_VIDRIO.envMap = ENV_NOCHE_P; M_VIDRIO.envMapIntensity = 1.2; M_VENTANA.envMap = ENV_NOCHE_P; M_VENTANA.envMapIntensity = .8;
// ---------- color del piso por vértice: barro oscuro y tierra apisonada en el pueblo, pasto ralo en los patios, pasto alto y oscuro afuera y en
// la colina, el sendero pelado, juntas oscuras bajo el empedrado
const C_BARRO = linC("#4a3e30"), C_BARRO2 = linC("#3a3026"), C_JUNTA = linC("#2a2622"), C_RALO = linC("#55603a"), C_RALO2 = linC("#6c6c44"), C_PASTO = linC("#3e5430"), C_PASTO2 = linC("#56683a"),
  C_SECO = linC("#7a7048"), C_SENDERO = linC("#6a5a44"), C_MUSGO = linC("#38482a");
function colorSueloT(x, z) { const n = fbm2(x * .045 + 11, z * .045 + 2, 4), n2 = fbm2(x * .27 + 5, z * .27 + 8, 2), n3 = fbm2(x * .09 - 3, z * .09 + 7, 3), r = Math.hypot(x * .92, (z + 12) * 1.05);
  let c = mix3(C_BARRO, C_BARRO2, sst(.35, .7, n));
  c = mix3(c, mix3(C_RALO, C_RALO2, n2), sst(.42, .62, n3) * .85);
  const af = Math.max(sst(34, 62, r), 1 - sst(30, 48, Math.hypot(x - COLINA_T[0], z - COLINA_T[1]))); if (af > 0) c = mix3(c, mix3(mix3(C_PASTO, C_PASTO2, n2), C_SECO, sst(.55, .8, n3) * .6), af);
  const ds = distSendero(x, z); c = mix3(c, C_SENDERO, (1 - sst(.8, 1.8, ds + (n2 - .5) * .8)) * .9);
  c = mix3(c, C_JUNTA, calleKT(x, z) * .9);
  const s = .86 + .24 * n2; return [c[0] * s, c[1] * s, c[2] * s] }
// ---------- la malla del piso: grilla de 1 m en el pueblo y la colina, más gruesa afuera (lejos sigue con _lejos_tej.js desde r ≈ 240)
const TERRENO = (() => { const xs = [], zs = []; for (let x = -250; x < -84; x += 4) xs.push(x); for (let x = -84; x <= 128; x += 1) xs.push(x); for (let x = 132; x <= 250; x += 4) xs.push(x);
  for (let z = -250; z < -122; z += 4) zs.push(z); for (let z = -122; z <= 96; z += 1) zs.push(z); for (let z = 100; z <= 250; z += 4) zs.push(z);
  const nx = xs.length, nz = zs.length, n = nx * nz, pos = new Float32Array(n * 3), uv = new Float32Array(n * 2), col = new Float32Array(n * 3), idx = [];
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const x = xs[i], z = zs[j], k = j * nx + i, c = colorSueloT(x, z); pos[k * 3] = x; pos[k * 3 + 1] = SUELO(x, z) - .01; pos[k * 3 + 2] = z; uv[k * 2] = x / 6; uv[k * 2 + 1] = z / 6; col[k * 3] = c[0]; col[k * 3 + 1] = c[1]; col[k * 3 + 2] = c[2] }
  for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) { const a = j * nx + i, b = a + nx; idx.push(a, b, a + 1, a + 1, b, b + 1) }
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); geo.setAttribute("color", new THREE.BufferAttribute(col, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, M_TIERRA); m.receiveShadow = true; scene.add(m); return m })();
if (typeof AGUA !== "undefined") AGUA.visible = false;
// ---------- el empedrado: calcomanía (calle principal, calle transversal, plaza) + ADOQUINES EN 3D (parches de 2 × 2 m instanciados), mojados
M_ADOQ.envMap = ENV_NOCHE_P; M_ADOQ.envMapIntensity = .55; M_ADOQ.roughness = .42; M_ADOQ_D.envMap = ENV_NOCHE_P; M_ADOQ_D.envMapIntensity = .35; M_ADOQ_D.roughness = .55;
const planoSuelo = (x0, x1, z0, z1, paso, dy, mat, ro = -.2, uvS = 3) => { const nx = Math.max(1, Math.round((x1 - x0) / paso)), nz = Math.max(1, Math.round((z1 - z0) / paso)), g = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, nz); g.rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
  const p = g.attributes.position, u = g.attributes.uv; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, SUELO(x, z) + dy); u.setXY(i, x / uvS, z / uvS) } g.computeVertexNormals(); const m = new THREE.Mesh(g, mat); m.receiveShadow = true; m.renderOrder = ro; scene.add(m); return m };
planoSuelo(-CALLE_T.an / 2, CALLE_T.an / 2, CALLE_T.z0, CALLE_T.z1, 1, .015, M_ADOQ_D);
planoSuelo(CRUCE_T.x0, -CALLE_T.fachada, CRUCE_T.z - CRUCE_T.an / 2, CRUCE_T.z + CRUCE_T.an / 2, 1, .016, M_ADOQ_D); planoSuelo(CALLE_T.fachada, CRUCE_T.x1, CRUCE_T.z - CRUCE_T.an / 2, CRUCE_T.z + CRUCE_T.an / 2, 1, .016, M_ADOQ_D);
planoSuelo(PLAZA_T.x - PLAZA_T.w / 2, PLAZA_T.x + PLAZA_T.w / 2, PLAZA_T.z - PLAZA_T.d / 2, PLAZA_T.z + PLAZA_T.d / 2, 1, .017, M_ADOQ_D);
// veredas de losas de piedra entre el cordón y las fachadas
const T_LOSAS = (() => { const [c, z] = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(4720); c.fillStyle = "#2a2622"; c.fillRect(0, 0, w, h); z.fillStyle = "#101010"; z.fillRect(0, 0, w, h); let y = 0;
    while (y < h) { const fh = 110 + r() * 60; let x = -r() * 80; while (x < w + 80) { const sw = 120 + r() * 140, col = rgbj(["#6e685e", "#5e5850", "#7a746a", "#66605a", "#58534c"][r() * 5 | 0], r, 18), v = 150 + r() * 70 | 0, P = [[x + 3, y + 3], [x + sw - 3, y + 2 + (r() - .5) * 4], [x + sw - 3, y + fh - 3], [x + 4, y + fh - 3]];
        for (const dx of [-w, 0, w]) { const Q = P.map(([a, b]) => [a + dx, b]); redondo(c, Q, 8); c.fillStyle = col; c.fill(); redondo(z, Q, 8); z.fillStyle = `rgb(${v},${v},${v})`; z.fill() }
        if (r() < .25) { c.strokeStyle = "rgba(20,16,12,.7)"; c.lineWidth = 2; c.beginPath(); c.moveTo(x + r() * sw, y); c.lineTo(x + r() * sw, y + fh); c.stroke() } x += sw } y += fh }
    for (let k = 0; k < 5000; k++) { c.fillStyle = r() < .5 ? "rgba(20,16,12,.18)" : "rgba(230,220,200,.08)"; c.fillRect(r() * w, r() * h, 2, 2) }
    for (let k = 0; k < 80; k++) { c.fillStyle = `rgba(${60 + r() * 20 | 0},${80 + r() * 20 | 0},40,.35)`; c.beginPath(); c.arc(r() * w, r() * h, 2 + r() * 5, 0, 7); c.fill() } });
  [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
const M_LOSAS = new THREE.MeshStandardMaterial({ map: T_LOSAS.c, bumpMap: T_LOSAS.z, bumpScale: 4, roughness: .6, envMap: ENV_NOCHE_P, envMapIntensity: .35, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
for (const s of [-1, 1]) { const a = s * CALLE_T.an / 2 + s * .28, b = s * (CALLE_T.fachada + .2); planoSuelo(Math.min(a, b), Math.max(a, b), CALLE_T.z0 + 1, CALLE_T.z1, 1, .1, M_LOSAS, -.2, 2.2) }
const ADOQUINES = []; { const L = [], cc = new THREE.Color();
  for (let z = CALLE_T.z0 + 1; z < CALLE_T.z1 - .5; z += 2) for (let x = -CALLE_T.an / 2 + 1.25; x < CALLE_T.an / 2 - .6; x += 2) L.push([x, z, Math.PI / 2]);
  for (let x = PLAZA_T.x - PLAZA_T.w / 2 + 1; x < PLAZA_T.x + PLAZA_T.w / 2 - .5; x += 2) for (let z = PLAZA_T.z - PLAZA_T.d / 2 + 1; z < PLAZA_T.z + PLAZA_T.d / 2 - .5; z += 2) { if (enEmpedrado(x, z, .5)) continue; L.push([x, z, 0]) }
  for (let x = CRUCE_T.x0 + 1; x < CRUCE_T.x1 - 2; x += 2) { if (Math.abs(x) < CALLE_T.fachada + .9) continue; for (let z = CRUCE_T.z - CRUCE_T.an / 2 + 1; z < CRUCE_T.z + CRUCE_T.an / 2 - .5; z += 2) L.push([x, z, 0]) }
  const m = new THREE.InstancedMesh(GEO_ADOQ, M_ADOQ, L.length); L.forEach(([x, z, ry], i) => { const n = sueloN(x, z, 1); dummy.position.set(x, SUELO(x, z) + .005, z); dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...n)); dummy.rotateY(ry + (i % 2) * Math.PI); dummy.scale.set(1, .9 + hash2(x * 7, z * 3) * .25, 1); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); const v = .62 + hash2(x, z) * .22; m.setColorAt(i, cc.setRGB(v, v * .98, v * .97)) });
  m.receiveShadow = true; m.castShadow = false; scene.add(m); ADOQUINES.push(m) }
// cordones de piedra a lo largo de la calle (bloques largos irregulares) y canaleta
const L_PIEDRA = lote();
{ const r = rng(4730); for (const s of [-1, 1]) { let z = CALLE_T.z0 + 1; while (z < CALLE_T.z1 - .3) { const L = .8 + r() * .9; if (!(Math.abs(z + L / 2 - CRUCE_T.z) < CRUCE_T.an / 2)) L_PIEDRA.add("corona", RB1(.3, .26, L - .03, .04), TM(s * (CALLE_T.an / 2 + .14), SUELO(s * 5.1, z) + .02, z + L / 2, 0, (r() - .5) * .03, (r() - .5) * .04)); z += L } } }

// ---------- registro de lo ocupado (para que la utilería no se pise con las casas)
const OCUP = [], RECTS = [], GRILLA_O = new Map(), CELDA_O = 6, PAD_O = 2.5;   // grilla espacial (las búsquedas miran solo su celda)
const enRect = (R, x, z, m = 0) => { const c = Math.cos(R.ry), s = Math.sin(R.ry), dx = x - R.x, dz = z - R.z, lx = dx * c - dz * s, lz = dx * s + dz * c; return Math.abs(lx) < R.w / 2 + m && Math.abs(lz) < R.d / 2 + m };
const enGrilla = (it, x, z, rr) => { const a = Math.floor((x - rr) / CELDA_O), b = Math.floor((x + rr) / CELDA_O), c = Math.floor((z - rr) / CELDA_O), d = Math.floor((z + rr) / CELDA_O); for (let i = a; i <= b; i++) for (let j = c; j <= d; j++) { const k = i * 100003 + j; (GRILLA_O.get(k) || GRILLA_O.set(k, []).get(k)).push(it) } };
const rectAdd = R => { RECTS.push(R); R.rect = 1; enGrilla(R, R.x, R.z, Math.hypot(R.w, R.d) / 2 + PAD_O) };
const zonaLibre = (x, z, r = 0) => enCalle(x, z, r - .3);   // calles, plaza y fuente (la utilería suelta no va ahí salvo o.zona)
const libreEn = (x, z, r = .5, o = {}) => { if (!o.zona && zonaLibre(x, z, r)) return false; const L = GRILLA_O.get(Math.floor(x / CELDA_O) * 100003 + Math.floor(z / CELDA_O)); if (!L) return true;
  for (const q of L) { if (q.rect) { if (q !== o.salvo && enRect(q, x, z, r + (o.mc ?? .1))) return false } else if (Math.hypot(x - q.x, z - q.z) < r + q.r) return false } return true };
const ocupa = (x, z, r) => { const q = { x, z, r }; OCUP.push(q); enGrilla(q, x, z, r + PAD_O); return true };
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
  const mu = o.muro ?? (r() < .42 ? "muro" + (r() * M_MURO.length | 0) : r() < .72 ? "tabla" + (r() * M_TABLAS_H.length | 0) : r() < .6 ? "lad" + (r() * M_LAD.length | 0) : "rev" + (r() * M_REV.length | 0)), dos = !simple && (o.dos ?? (mu.startsWith("muro") && r() < .6)), hs = dos ? 2.9 : h;
  const techo = o.techo ?? (r() < .78 ? "piz" + (r() * 3 | 0) : "teja" + (r() * 3 | 0)), col = "col" + (o.color ?? (r() * M_PUERTA.length | 0)), frontal = !!o.frontal;
  // zócalo y muros
  if (!o.sinZocalo) add("zocalo", uvMuro(new THREE.BoxGeometry(w + .2, 1.4, d + .2), 3.2), TM(0, -.45, 0));
  if (o.hueco) { if (hs - o.hueco > .01) add(mu, uvMuro(new THREE.BoxGeometry(w, hs - o.hueco, d), 3.2, r(), r()), TM(0, o.hueco + (hs - o.hueco) / 2, 0)) }
  else add(mu, uvMuro(new THREE.BoxGeometry(w, hs, d), 3.2, r(), r()), TM(0, hs / 2, 0));
  if (dos) { const hu = h - hs, rv = r() < .65 ? "tabla" + (r() * M_TABLAS_H.length | 0) : "rev" + (r() * M_REV.length | 0); add(rv, uvMuro(new THREE.BoxGeometry(w + .2, hu, d + .2), 3.4, r(), r()), TM(0, hs + hu / 2, 0));
    const cara = (L2, M) => { add("viga", new THREE.BoxGeometry(L2 + .1, .16, .1), M.clone().multiply(TM(0, .08, 0))); add("viga", new THREE.BoxGeometry(L2 + .1, .16, .1), M.clone().multiply(TM(0, hu - .08, 0))); const n = Math.max(2, Math.round(L2 / 1.25));
      for (let k = 0; k <= n; k++) { const xx = lerp(-L2 / 2 + .06, L2 / 2 - .06, k / n); add("viga", new THREE.BoxGeometry(.15, hu, .1), M.clone().multiply(TM(xx, hu / 2, 0))); if (k < n && k % 2 === 0) { const x2 = lerp(-L2 / 2 + .06, L2 / 2 - .06, (k + 1) / n), [g, m] = cilEntre([xx, .1, 0], [x2, hu - .1, 0], .06, 4); add("viga", g, M.clone().multiply(m)) } } };
    cara(w + .2, TM(0, hs, d / 2 + .15)); cara(w + .2, TM(0, hs, -d / 2 - .15, 0, Math.PI, 0)); cara(d + .2, TM(w / 2 + .15, hs, 0, 0, Math.PI / 2, 0)); cara(d + .2, TM(-w / 2 - .15, hs, 0, 0, -Math.PI / 2, 0)) }
  if (!simple) {
    // esquineras (piedra clara) y cornisa entre pisos
    if (mu.startsWith("tabla") && !o.sinEsquinas) for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) add("viga", new THREE.BoxGeometry(.16, hs, .16), TM(sx * (w / 2 + .02), hs / 2, sz * (d / 2 + .02)));
    if ((!mu.startsWith("rev") && !mu.startsWith("tabla") || o.mansion) && !o.sinEsquinas) for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) for (let yy = .25, k = 0; yy < hs - .2; yy += .44, k++) { const la = k % 2 ? .62 : .38; add(o.mansion ? "blanco" : "piedraC", RB1(.1 + la * (k % 2 ? 1 : .1), .38, .1 + la * (k % 2 ? .1 : 1), .04), TM(sx * (w / 2 + .015) - sx * la * (k % 2 ? .5 : 0), yy, sz * (d / 2 + .015) - sz * la * (k % 2 ? 0 : .5))) }
    for (let yy = 2.95; yy < h - 1; yy += 2.9) add(o.mansion ? "blanco" : (o.sinEsquinas || mu.startsWith("tabla")) ? "viga" : "piedraC", RB1(w + .16, .16, d + .16, .03), TM(0, yy, 0));
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
  const chimeneaPartes = (A, M0) => { A(mu.startsWith("rev") || mu.startsWith("tabla") ? "muro" + (seed % M_MURO.length) : mu, uvMuro(new THREE.BoxGeometry(chW, ctop - h + .3, chW * .9), 2.4), M0.clone().multiply(TM(0, (ctop - h + .3) / 2, 0)));
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
    // la hoja: SIN picaporte (marca de la chapa arrancada, tornillos, agujero, rasguños de percha; a veces tablas clavadas); o.picaporte = la de Crane; o.sinHoja = la pone el detalle (se abre)
    if (!o.sinHoja) { if (o.mansion) for (const s of [-1, 1]) add(col, new THREE.BoxGeometry(dw / 2 - .03, dh - .03, .07), F.clone().multiply(TM(s * dw / 4, dh / 2, .04)));
      else hojaSinPicaporte({ add: (k, g, m) => add(k, g, m) }, F.clone().multiply(TM(0, 0, .04)), dw, dh, col, seed, { tablas: o.tablas ?? r() < .12 });
      if (o.picaporte) picaportePiezas(add, F.clone().multiply(TM(dw / 2 - .2, dh * .47, .08))) }
    add("piedraC", RB1(dw + .7, .16, .62, .05), F.clone().multiply(TM(0, .02, .3)));
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
  if (o.puertaAtras && !simple) { const B = TM(-px * .6, 0, -d / 2, 0, Math.PI, 0); add("oscuro", new THREE.PlaneGeometry(dw, dh), B.clone().multiply(TM(0, dh / 2, .01))); hojaSinPicaporte({ add: (k, g, m) => add(k, g, m) }, B.clone().multiply(TM(0, 0, .04)), dw, dh, col, seed + 3, { tablas: r() < .2 }); add("piedraC", RB1(dw + .5, .26, .2, .03), B.clone().multiply(TM(0, dh + .13, .06))); add("piedraC", RB1(dw + .7, .16, .62, .05), B.clone().multiply(TM(0, .02, .3))) }
  // ---- farolito de pared junto a la puerta (algunas casas)
  if (!simple && (o.farol ?? r() < .3)) { const lx = px + (px > 0 ? -1 : 1) * (dw / 2 + .45); add("hierro", new THREE.BoxGeometry(.04, .04, .32), F.clone().multiply(TM(lx, 2.55, .16))); add("hierro", new THREE.CylinderGeometry(.13, .1, .05, 6), F.clone().multiply(TM(lx, 2.66, .34)));
    add("luz", new THREE.CylinderGeometry(.09, .07, .22, 6), F.clone().multiply(TM(lx, 2.52, .34))); add("hierro", new THREE.ConeGeometry(.14, .14, 6), F.clone().multiply(TM(lx, 2.75, .34))) }
  const C = { x, z, ry, w, d, h, y0, HM, px, mu, o, rh, ye, dos, hs, col, techo, mu, frontal, span, len, ang, chimTop, ctop, chimG, r, seed, F, dw, dh, ridge: h + rh + .15 };
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

// ================= HOLLOWMERE: las casas =================
M_TEJA.forEach(m => m.color.set("#8e8078"));
const M_PICAPORTE = new THREE.MeshStandardMaterial({ color: "#f0c060", roughness: .14, metalness: 1, envMap: ENV_METAL_P, envMapIntensity: 2.4, emissive: "#5a3608", emissiveIntensity: .55 });
Object.assign(CASA_MATS, { picaporte: M_PICAPORTE, losas: M_LOSAS, cortina: M_CORTINA });
M_TABLAS_H.forEach((m, i) => CASA_MATS["tabla" + i] = m); M_MARCA_PUERTA.forEach((m, i) => CASA_MATS["marca" + i] = m);
// el picaporte de bronce (la ÚNICA puerta del pueblo que tiene): roseta, cuello, pomo, bocallave. M en la cara de la hoja (+z afuera), origen en el pomo
function picaportePiezas(add, M) {
  add("picaporte", new THREE.CylinderGeometry(.075, .085, .025, 24), M.clone().multiply(TM(0, 0, .012, Math.PI / 2)));
  add("picaporte", new THREE.TorusGeometry(.07, .008, 6, 24), M.clone().multiply(TM(0, 0, .024)));
  add("picaporte", new THREE.CylinderGeometry(.018, .024, .07, 12), M.clone().multiply(TM(0, 0, .058, Math.PI / 2)));
  add("picaporte", new THREE.SphereGeometry(.056, 20, 14), M.clone().multiply(TM(0, 0, .11, 0, 0, 0, 1, 1, .8)));
  add("picaporte", RB1(.075, .22, .016, .01), M.clone().multiply(TM(0, -.21, .008)));
  add("oscuro", new THREE.CircleGeometry(.013, 12), M.clone().multiply(TM(0, -.19, .018))); add("oscuro", new THREE.PlaneGeometry(.009, .035), M.clone().multiply(TM(0, -.215, .018))) }
// la hoja de una puerta SIN picaporte (para las puertas sueltas que abre la escena): tablas, bisagras de hierro, la marca del picaporte
// arrancado (y rasguños), el agujero del vástago. L = lote, M = matriz en el centro de abajo de la hoja (+z afuera), k = variante 0–5
function hojaSinPicaporte(L, M, dw, dh, col, k, o = {}) {
  L.add(col, new THREE.BoxGeometry(dw - .04, dh - .03, .06), M.clone().multiply(TM(0, dh / 2, 0)));
  for (let q = 0; q < Math.round(dw / .16); q++) L.add("viga", new THREE.BoxGeometry(.012, dh - .05, .02), M.clone().multiply(TM(-dw / 2 + .02 + (q + 1) * (dw - .04) / (Math.round(dw / .16) + 1), dh / 2, .03)));
  for (const yy of [.35, dh - .4]) { L.add("hierro", new THREE.BoxGeometry(dw * .75, .06, .02), M.clone().multiply(TM(-dw * .12, yy, .035))); L.add("hierro", new THREE.CylinderGeometry(.028, .028, .14, 8), M.clone().multiply(TM(-dw / 2 + .01, yy, .02))) }
  L.add("marca" + (k % 6), new THREE.PlaneGeometry(dw - .04, dh - .03), M.clone().multiply(TM(0, dh / 2, .032)));
  L.add("oscuro", new THREE.CylinderGeometry(.024, .024, .02, 10), M.clone().multiply(TM(.3 * (dw - .04), dh / 2 - .03 * (dh - .03), .03, Math.PI / 2)));
  if (o.tablas) { const r = rng(9100 + k); for (let q = 0; q < 3; q++) { const y = dh * (.22 + q * .3) + (r() - .5) * .1, a = (r() - .5) * .35; L.add("maderaV", RB1(dw + .34, .19 + r() * .05, .05, .01), M.clone().multiply(TM((r() - .5) * .06, y, .075, 0, 0, a)));
      for (const s of [-1, 1]) for (const dy of [-.05, .05]) L.add("hierro", new THREE.CylinderGeometry(.012, .012, .03, 5), M.clone().multiply(TM(s * (dw / 2 + .08) * Math.cos(a), y + s * (dw / 2 + .08) * Math.sin(a) + dy, .105, Math.PI / 2))) } } }
// filas de casas a lo largo de z: xFrente = x de la fachada; lado −1 = la casa queda al oeste (mira al este), +1 al este (mira al oeste)
const tramosLibres = (z0, z1, res) => { let L = [[z0, z1]]; res.forEach(([a, b]) => { L = L.flatMap(([u, v]) => b <= u || a >= v ? [[u, v]] : [[u, a], [b, v]].filter(([p, q]) => q - p > .5)) }); return L };
function filaCasas(xFrente, lado, z0, z1, res, seed, o = {}) { const r = rng(seed), ry = lado < 0 ? Math.PI / 2 : -Math.PI / 2, out = [];
  tramosLibres(z0, z1, res).forEach(([a, b]) => { let z = a; while (b - z > 2.8) { let w = (o.wMin ?? 4.4) + r() * (o.wVar ?? 2.4); if (b - z - w < 3.2) w = b - z;
      const d = (o.dMin ?? 7.2) + r() * (o.dVar ?? 1.4), pisos = (o.pisos ?? 2) + (r() < (o.p3 ?? .45) ? 1 : 0), h = pisos * 2.9 + .25 + r() * .4, zc = z + w / 2, xc = xFrente + lado * d / 2;
      const C = casaP(xc, zc, ry, w - .04, d, h, seed + 7 + out.length * 13, { frontal: w < 5.4 && r() < .55, pendiente: 46 + r() * 12, parches: r() < .3, puertaAtras: r() < .4, balcones: .2, farol: r() < .3, tablas: r() < .15, ...(o.casa || {}) });
      C.fila = o.nombre; out.push(C); z += w } }); return out }
const CRUCE_R = [CRUCE_T.z - CRUCE_T.an / 2, CRUCE_T.z + CRUCE_T.an / 2];
const resDe = (B, m = .02) => [B.z - B.w / 2 - m, B.z + B.w / 2 + m];
const FILAS_T = {
  oeste: filaCasas(-CALLE_T.fachada, -1, CALLE_T.z0 + .5, CALLE_T.z1 - .5, [CRUCE_R, resDe(CASA_FAM), resDe(CASA_MARGA)], 5100, { nombre: "oeste" }),
  este: filaCasas(CALLE_T.fachada, 1, CALLE_T.z0 + .5, CALLE_T.z1 - .5, [CRUCE_R, resDe(TALLER_T)], 5300, { nombre: "este" }),
  oesteAtras: filaCasas(CALLEJONES_T[0].x0, -1, -38, 78, [CRUCE_R], 5500, { nombre: "oesteAtras", p3: .2, dMin: 6.4, dVar: 1.6 }),
  esteAtras: filaCasas(CALLEJONES_T[1].x1, 1, -35.5, 78, [CRUCE_R], 5700, { nombre: "esteAtras", p3: .2, dMin: 6.4, dVar: 1.6 }),
  plazaO: filaCasas(PLAZA_T.x - PLAZA_T.w / 2, -1, -71.5, -42, [], 5900, { nombre: "plazaO", p3: .6, wMin: 5, dMin: 7.5 }),
  plazaE: filaCasas(PLAZA_T.x + PLAZA_T.w / 2, 1, -71.5, -42, [], 6100, { nombre: "plazaE", p3: .6, wMin: 5, dMin: 7.5 }) };
// casas sueltas en las afueras (miran al pueblo), con sus galpones
const AFUERAS_T = [[-38, 12, Math.PI / 2, 7, 6, 1], [-36, 44, Math.PI / 2, 6, 6.5, 2], [-41, -12, Math.PI / 2, 6.5, 6, 1], [-35, 64, Math.PI / 2, 7.5, 6, 2], [-33, -52, Math.PI / 2, 6, 7, 2],
  [36, 32, -Math.PI / 2, 7, 6, 2], [40, 6, -Math.PI / 2, 6, 6, 1], [33, 58, -Math.PI / 2, 7, 6.5, 2], [38, -50, -Math.PI / 2, 6.5, 6, 1], [-18, 95, Math.PI, 7, 6, 2], [16, 96, Math.PI, 6.5, 6, 1], [50, -6, -Math.PI / 2, 6, 5.5, 1]]
  .map(([x, z, ry, w, d, p], i) => casaP(x, z, ry, w, d, p * 2.9 + .3, 6200 + i * 11, { pendiente: 50 + (i % 3) * 4, parches: true, exenta: true, muro: i % 3 ? "tabla" + (i % 5) : "muro" + (i % 6), tablas: i % 4 === 1, farol: i % 2 === 0 }));
// la casa del sacristán, al oeste de la iglesia (mira a la plaza)
const CASA_SACRISTAN = casaP(-14.5, -81, 0, 9, 8, 6.2, 6290, { muro: "muro1", techo: "piz0", pendiente: 52, exenta: true, farol: true });

// ---------- LA CASA DE LA FAMILIA (la del narrador y Tib), lado oeste de la calle: planta baja = UN cuarto de verdad (6,4 × 7,4 × 3 m):
// la puerta al frente (sin picaporte; el ropero contra ella), la ventana del frente, la VENTANA DE ATRÁS (al callejón, se abre), la mesa,
// las camas, el hogar. Coordenadas locales: x a lo largo de la calle (+x = norte), z hacia la calle (+z = frente). Los muebles van en el detalle.
const CASA_FAM_B = (() => { const { x, z, ry, w, d } = CASA_FAM, H = 4.2, t = .3, mu = "muro2", fz = d / 2;
  const C = casaP(x, z, ry, w, d, 6.4, 6301, { muro: mu, techo: "piz0", dos: true, pendiente: 52, sinPuerta: true, sinPiso0: true, hueco: H, farol: false, balcones: 0, puertaX: 1.15 });
  const M = C.HM, at = (...a) => M.clone().multiply(TM(...a)), L = L_CASA;
  const PUE = [.6, 1.7, .26, 2.36], VEN = [-2.7, -1.3, 1.0, 2.1], VAT = [-.65, .65, 1.0, 2.1];
  muroHuecos(L, mu, at(0, 0, fz - t / 2), w, H, t, [VEN, PUE]);
  for (const s of [-1, 1]) L.add(mu, uvMuro(new THREE.BoxGeometry(t, H, d - 2 * t), 3.2), at(s * (w / 2 - t / 2), H / 2, 0));
  muroHuecos(L, mu, at(0, 0, -fz + t / 2), w, H, t, [VAT]);
  // forro de tablas por dentro (con los mismos huecos), piso de tablas, vigas del techo
  muroHuecos(L, "tabla4", at(0, 0, fz - t - .02), w - 2 * t, H, .04, [VEN, PUE]); muroHuecos(L, "tabla4", at(0, 0, -fz + t + .02), w - 2 * t, H, .04, [VAT]);
  for (const s of [-1, 1]) L.add("tabla4", uvMuro(new THREE.BoxGeometry(.04, H, d - 2 * t - .08), 3.2), at(s * (w / 2 - t - .02), H / 2, 0));
  L.add("madera", uvMuro(new THREE.BoxGeometry(w - .5, .1, d - .5), 1.4), at(0, .22, 0));
  for (let k = 0; k < 6; k++) L.add("viga", new THREE.BoxGeometry(w - .5, .2, .2), at(0, H - .12, fz - .75 - k * 1.3));
  L.add("viga", new THREE.BoxGeometry(.24, .26, d - .6), at(0, H - .26, 0)); for (const s of [-1, 1]) L.add("viga", new THREE.BoxGeometry(.2, H - .3, .2), at(s * 1.6, (H - .3) / 2 + .27, -.4));
  // la ventana del frente (vidrio, marco, parteluz, alféizar) y el marco de la puerta
  const marcoVentana = (V, zf, sale) => { const [x0, x1, y0, y1] = V, vw = x1 - x0, vh = y1 - y0, vc = (x0 + x1) / 2;
    for (const xx of [x0, x1]) L.add("madera", new THREE.BoxGeometry(.1, vh + .1, t + .06), at(xx + (xx === x0 ? .05 : -.05), y0 + vh / 2, zf)); for (const yy of [y0, y1]) L.add("madera", new THREE.BoxGeometry(vw, .1, t + .06), at(vc, yy + (yy === y0 ? .05 : -.05), zf));
    L.add("piedraC", RB1(vw + .36, .1, .34, .03), at(vc, y0 - .05, zf + sale * (t / 2 + .08))); L.add("piedraC", RB1(vw + .4, .2, .16, .03), at(vc, y1 + .12, zf + sale * (t / 2 + .02))) };
  marcoVentana(VEN, fz - t / 2, 1); { const [x0, x1, y0, y1] = VEN, vc = (x0 + x1) / 2; L.add("vidrioC", new THREE.PlaneGeometry(x1 - x0, y1 - y0), at(vc, (y0 + y1) / 2, fz - .1)); L.add("madera", new THREE.BoxGeometry(.05, y1 - y0, .06), at(vc, (y0 + y1) / 2, fz - .1)); L.add("madera", new THREE.BoxGeometry(x1 - x0, .05, .06), at(vc, (y0 + y1) / 2 + .1, fz - .1));
    for (const s of [-1, 1]) L.add("cortina", new THREE.BoxGeometry(.3, y1 - y0 + .3, .05), at(vc + s * ((x1 - x0) / 2 - .1), (y0 + y1) / 2 + .1, fz - t - .1)) }
  marcoVentana(VAT, -fz + t / 2, -1);
  { const [x0, x1, y0, y1] = PUE; L.add("piedraC", RB1(x1 - x0 + .5, .26, .2, .03), at((x0 + x1) / 2, y1 + .13, fz + .04)); for (const xx of [x0 - .06, x1 + .06]) L.add("madera", new THREE.BoxGeometry(.12, y1 - y0 + .06, t + .08), at(xx, (y0 + y1) / 2, fz - t / 2));
    L.add("piedraC", RB1(x1 - x0 + .7, .16, .62, .05), at((x0 + x1) / 2, .02, fz + .3)) }
  return { C, M, at, fz, t, H, PUE, VEN, VAT, w, d } })();

// ---------- EL TALLER DEL SASTRE (lado este, frente al oeste): planta baja = el taller (8,4 × 8,4 × 3,4 m): vidriera grande a la calle, puerta,
// ventanita atrás y una al costado. Coordenadas locales como la casa de la familia (+z = hacia la calle). Los muebles van en el detalle.
const TALLER_B = (() => { const { x, z, ry, w, d } = TALLER_T, H = 4.4, t = .3, mu = "tabla2", fz = d / 2;
  const C = casaP(x, z, ry, w, d, 9.2, 6401, { muro: mu, techo: "piz2", dos: false, pendiente: 50, frontal: true, sinPuerta: true, sinPiso0: true, hueco: H, farol: false, balcones: .5, puertaX: 1.3 });
  const M = C.HM, at = (...a) => M.clone().multiply(TM(...a)), L = L_CASA;
  const VID = [-3.8, -.5, .7, 2.8], PUE = [.7, 1.9, .26, 2.62], VAT = [-1.4, .2, 1.3, 2.4], VCO = [-1.6, -.2, 1.2, 2.4];
  muroHuecos(L, "muro3", at(0, 0, fz - t / 2), w, H, t, [VID, PUE]);   // el frente: piedra (la vidriera con marco de madera pintada)
  L.add(mu, uvMuro(new THREE.BoxGeometry(t, H, d - 2 * t), 3.2), at(-(w / 2 - t / 2), H / 2, 0));
  { const M2 = at(w / 2 - t / 2, 0, 0).multiply(TM(0, 0, 0, 0, Math.PI / 2, 0)); muroHuecos(L, mu, M2, d - 2 * t, H, t, [VCO]) }
  muroHuecos(L, mu, at(0, 0, -fz + t / 2), w, H, t, [VAT]);
  muroHuecos(L, "tabla4", at(0, 0, fz - t - .02), w - 2 * t, H, .04, [VID, PUE]); muroHuecos(L, "tabla4", at(0, 0, -fz + t + .02), w - 2 * t, H, .04, [VAT]);
  L.add("tabla4", uvMuro(new THREE.BoxGeometry(.04, H, d - 2 * t - .08), 3.2), at(-(w / 2 - t - .02), H / 2, 0)); { const M2 = at(w / 2 - t - .02, 0, 0).multiply(TM(0, 0, 0, 0, Math.PI / 2, 0)); muroHuecos(L, "tabla4", M2, d - 2 * t - .08, H, .04, [VCO]) }
  L.add("madera", uvMuro(new THREE.BoxGeometry(w - .5, .1, d - .5), 1.4), at(0, .22, 0));
  for (let k = 0; k < 7; k++) L.add("viga", new THREE.BoxGeometry(w - .5, .2, .2), at(0, H - .12, fz - .7 - k * 1.25)); L.add("viga", new THREE.BoxGeometry(.26, .28, d - .6), at(0, H - .3, 0));
  // la vidriera: marco grueso pintado de verde oscuro, vidrios chicos (grilla), zócalo de madera, alero/cornisa con el nombre
  { const [x0, x1, y0, y1] = VID, vw = x1 - x0, vh = y1 - y0, vc = (x0 + x1) / 2, zf = fz - t / 2; L.add("vidrioC", new THREE.PlaneGeometry(vw, vh), at(vc, y0 + vh / 2, fz - .12));
    for (let k = 0; k <= 5; k++) L.add("col0", new THREE.BoxGeometry(.06, vh, .08), at(x0 + k * vw / 5, y0 + vh / 2, fz - .12)); for (let k = 0; k <= 3; k++) L.add("col0", new THREE.BoxGeometry(vw, .06, .08), at(vc, y0 + k * vh / 3, fz - .12));
    for (const xx of [x0 - .08, x1 + .08]) L.add("col0", new THREE.BoxGeometry(.18, vh + .3, t + .12), at(xx, y0 + vh / 2, zf)); L.add("col0", new THREE.BoxGeometry(vw + .5, .2, t + .16), at(vc, y1 + .1, zf)); L.add("col0", new THREE.BoxGeometry(vw + .5, .14, t + .26), at(vc, y0 - .07, zf));
    L.add("col0", new THREE.BoxGeometry(vw + .4, .5, .08), at(vc, .45, fz + .02)); L.add("col0", new THREE.BoxGeometry(w + .1, .5, .22), at(0, H - .1, fz + .12)) }
  { const [x0, x1, y0, y1] = PUE; for (const xx of [x0 - .07, x1 + .07]) L.add("col0", new THREE.BoxGeometry(.14, y1 - y0 + .1, t + .1), at(xx, (y0 + y1) / 2, fz - t / 2)); L.add("col0", new THREE.BoxGeometry(x1 - x0 + .3, .16, t + .1), at((x0 + x1) / 2, y1 + .08, fz - t / 2));
    L.add("vidrioC", new THREE.PlaneGeometry(x1 - x0 - .1, .5), at((x0 + x1) / 2, y1 + .45, fz - .1)); L.add("piedraC", RB1(x1 - x0 + .7, .16, .62, .05), at((x0 + x1) / 2, .02, fz + .3)) }
  for (const [V, Mv] of [[VAT, at(0, 0, -fz + t / 2, 0, Math.PI, 0)], [VCO, at(w / 2 - t / 2, 0, 0, 0, Math.PI / 2, 0)]]) { const [x0, x1, y0, y1] = V, vc = (x0 + x1) / 2, xx = Mv === undefined ? 0 : 1;
    L.add("vidrioC", new THREE.PlaneGeometry(x1 - x0, y1 - y0), Mv.clone().multiply(TM(V === VAT ? -vc : vc, (y0 + y1) / 2, 0))); L.add("piedraC", RB1(x1 - x0 + .3, .1, .3, .03), Mv.clone().multiply(TM(V === VAT ? -vc : vc, y0 - .05, .2))) }
  return { C, M, at, fz, t, H, VID, PUE, VAT, VCO, w, d } })();

// ---------- LA CASA DE MARGA (vieja, torcida, de tablas grises): la ventana de abajo al frente es la de los hilos y los ovillos (en el detalle)
const CASA_MARGA_B = (() => { const { x, z, ry, w, d } = CASA_MARGA, y0 = SUELO(x, z) - .06;
  const C = casaP(x, z, ry, w, d, 5.9, 6450, { muro: "tabla1", techo: "piz2", pendiente: 56, puertaX: 1.45, sinHoja: true, sinPiso0: true, parches: true, farol: false, balcones: 0, HM: TM(x, y0, z, 0, ry, .025), y0 });
  const M = C.HM, at = (...a) => M.clone().multiply(TM(...a)), L = L_CASA, fz = d / 2, V = [-1.15, 1.05, 1.35, 1.2];   // [x, y, ancho, alto]
  ventanaPiezas((k, g, m) => L.add(k, g, M.clone().multiply(m)), TM(V[0], V[1], fz), V[2], V[3], rng(6451), "col4", { cerrado: false });
  L.add("madera", new THREE.BoxGeometry(V[2] + .5, .07, .42), at(V[0], V[1] - .1, fz + .26)); for (const s of [-1, 1]) L.add("madera", new THREE.BoxGeometry(.05, .3, .34), at(V[0] + s * (V[2] / 2 + .15), V[1] - .28, fz + .22, -.6, 0, 0));
  // ventana atrás y una de costado, chiquitas
  ventanaPiezas((k, g, m) => L.add(k, g, M.clone().multiply(m)), TM(.8, 1.1, -fz, 0, Math.PI, 0), .8, .9, rng(6452), "col4", { cerrado: true });
  return { C, M, at, fz, V, w, d } })();

// ---------- LA CASA DE FATHER CRANE (junto a la iglesia, al este): piedra clara de sillares, tres pisos, balcones, la puerta al sur con
// escalinata, la ÚNICA puerta con picaporte (la hoja va en el detalle) y al lado el gancho con su abrigo negro
const CASA_CRANE_B = (() => { const { x, z, ry, w, d } = CASA_CRANE;
  const C = casaP(x, z, ry, w, d, 9.1, 6501, { muro: "sillarC", techo: "piz1", puertaX: 0, sinHoja: true, farol: false, balcones: .75, pendiente: 50, exenta: true, color: 2 });
  const M = C.HM, at = (...a) => M.clone().multiply(TM(...a)), L = L_CASA, fz = d / 2;
  // escalinata de tres escalones, dos faroles de pared, molduras de la puerta más ricas (frontón chico de piedra)
  for (let k = 0; k < 3; k++) L.add("sillarC", RB1(2.6 - k * .3, .17, 1.4 - k * .35, .02), at(0, .08 + k * .17 - .1, fz + .75 - k * .17));
  L.add("sillarC", RB1(1.9, .14, .34, .02), at(0, C.dh + .38, fz + .12)); { const sh = new THREE.Shape(); sh.moveTo(-1.05, 0); sh.lineTo(1.05, 0); sh.lineTo(0, .55); sh.closePath(); L.add("sillarC", new THREE.ExtrudeGeometry(sh, { depth: .26, bevelEnabled: false }), at(0, C.dh + .45, fz)) }
  for (const s of [-1, 1]) { L.add("sillarC", RB1(.26, C.dh + .2, .2, .02), at(s * (C.dw / 2 + .3), (C.dh + .2) / 2, fz + .08)) }
  return { C, M, at, fz, w, d } })();


// ================= LA IGLESIA: nave de piedra gris (hueca, se puede entrar), contrafuertes, ventanas ojivales con vitrales que brillan,
// techo de pizarra empinado, y al frente el CAMPANARIO: base hueca con la puerta a la plaza (adentro cuelga la cuerda), el campanario con
// arcos abiertos (la campana se ve), cornisa, y la aguja octogonal de pizarra con la cruz de hierro (punta a 21 m, más baja que la Tejedora)
const M_SILLAR = new THREE.MeshStandardMaterial({ map: T_SILLAR[0], bumpMap: T_SILLAR[1], bumpScale: 4, roughness: .9, color: "#a8a49c" });
const M_SILLAR_O = new THREE.MeshStandardMaterial({ map: T_SILLAR[0], bumpMap: T_SILLAR[1], bumpScale: 4, roughness: .9, color: "#77736c" });
// vitral: una ojiva con plomos y vidrios de colores (afuera: oscuro con reflejo; la luz de las velas de adentro lo hace brillar);
// las esquinas fuera del arco van pintadas de piedra
const T_VITRAL = (seed, ancho = 1) => tex(256, 512, (g, w, h) => { const r = rng(seed); g.fillStyle = "#5a5650"; g.fillRect(0, 0, w, h);
  for (let k = 0; k < 2000; k++) { g.fillStyle = r() < .5 ? "rgba(30,28,24,.3)" : "rgba(200,195,185,.15)"; g.fillRect(r() * w, r() * h, 2, 2) }
  g.save(); g.beginPath(); g.moveTo(8, h); g.lineTo(8, h * .3); g.quadraticCurveTo(8, 10, w / 2, 6); g.quadraticCurveTo(w - 8, 10, w - 8, h * .3); g.lineTo(w - 8, h); g.closePath(); g.clip();
  const C = ["#8a1a1a", "#1a3a8a", "#c8a020", "#2a6a3a", "#6a2a7a", "#c86a1a", "#2a5a9a", "#a02a2a"]; for (let y = 0; y < h; y += 34 + r() * 20) for (let x = 0; x < w; x += 30 + r() * 26) { g.fillStyle = C[r() * C.length | 0]; g.fillRect(x, y, 60, 60) }
  g.strokeStyle = "#0e0c0a"; g.lineWidth = 4; for (let k = 0; k < 40; k++) { g.beginPath(); const x = r() * w, y = r() * h; g.moveTo(x, y); g.lineTo(x + (r() - .5) * 140, y + (r() - .5) * 140); g.stroke() }
  for (let y = 0; y < h; y += 46) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + (r() - .5) * 10); g.stroke() } g.lineWidth = 6; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
  // una figura (un santo con aureola) en el medio, en siluetas de color
  g.fillStyle = "#e8d090"; g.beginPath(); g.arc(w / 2, h * .3, 26, 0, 7); g.fill(); g.fillStyle = "#d8b080"; g.beginPath(); g.arc(w / 2, h * .3, 14, 0, 7); g.fill(); g.fillStyle = "#3a2a6a"; g.beginPath(); g.moveTo(w / 2 - 30, h * .9); g.lineTo(w / 2 - 16, h * .36); g.lineTo(w / 2 + 16, h * .36); g.lineTo(w / 2 + 30, h * .9); g.fill(); g.stroke();
  const gr = g.createRadialGradient(w / 2, h * .5, 10, w / 2, h * .5, h * .7); gr.addColorStop(0, "rgba(255,230,180,.2)"); gr.addColorStop(1, "rgba(0,0,0,.35)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.restore();
  g.strokeStyle = "#2a2622"; g.lineWidth = 10; g.beginPath(); g.moveTo(8, h); g.lineTo(8, h * .3); g.quadraticCurveTo(8, 10, w / 2, 6); g.quadraticCurveTo(w - 8, 10, w - 8, h * .3); g.lineTo(w - 8, h); g.stroke() });
const M_VITRAL = [1, 2, 3].map(k => { const t = T_VITRAL(4800 + k); return new THREE.MeshStandardMaterial({ map: t, emissive: "#ffffff", emissiveMap: t, emissiveIntensity: .55, roughness: .2, metalness: .2, envMap: ENV_NOCHE_P, envMapIntensity: .6 }) });
const IGLESIA_B = (() => { const L = L_PIEDRA, { x: cx, z: cz, w, d, alto: Hn } = IGLESIA_T, z0 = cz + d / 2, z1 = cz - d / 2, t = .8, y0 = SUELO(cx, cz) - .05, at = (...a) => TM(cx, y0, 0).multiply(TM(...a));
  const VENT_Z = [-79.5, -84.5, -89.5, -94.5], VW = .9, VY = [1.9, 4.6];
  // muros de la nave (huecos de las ventanas ojivales); el frente: hueco grande que da a la base de la torre; el fondo: la ventana del altar
  for (const s of [-1, 1]) { const M = at(s * (w / 2 - t / 2), 0, cz, 0, s * Math.PI / 2, 0); muroHuecos(L, "sillar", M, d, Hn, t, VENT_Z.map(vz => { const lx = s > 0 ? -(vz - cz) : (vz - cz); return [lx - VW / 2, lx + VW / 2, VY[0], VY[1]] }), 3.2) }
  muroHuecos(L, "sillar", at(0, 0, z0 - t / 2), w - 2 * t + .02, Hn, t, [[-1.1, 1.1, 0, 3.0]], 3.2);
  muroHuecos(L, "sillar", at(0, 0, z1 + t / 2, 0, Math.PI, 0), w - 2 * t + .02, Hn, t, [[-.85, .85, 2.0, 5.0]], 3.2);
  // zócalo más oscuro (humedad) y cornisa
  L.add("sillarO", uvMuro(new THREE.BoxGeometry(w + .3, .8, d + .3), 3.2), at(0, .2, cz)); L.add("corona", RB1(w + .5, .25, d + .5, .04), at(0, Hn + .05, cz));
  // contrafuertes escalonados entre las ventanas
  for (const s of [-1, 1]) for (const bz of [-77, -82, -87, -92, -97, -100.4]) { L.add("sillar", uvMuro(new THREE.BoxGeometry(.9, Hn - 1.2, 1), 3.2), at(s * (w / 2 + .4), (Hn - 1.2) / 2, bz)); L.add("sillar", uvMuro(new THREE.BoxGeometry(.55, 1.6, .9), 3.2), at(s * (w / 2 + .3), Hn - .4, bz));
    L.add("corona", RB1(1.0, .14, 1.1, .03), at(s * (w / 2 + .42), Hn - 1.18, bz, 0, 0, s * .5)); L.add("corona", RB1(.66, .12, 1.0, .03), at(s * (w / 2 + .3), Hn + .42, bz, 0, 0, s * .5)) }
  // vitrales (por afuera y por adentro) con su marco de piedra
  const vit = (M, vw, vh, k) => { L.add("vitral" + k, new THREE.PlaneGeometry(vw, vh), M.clone().multiply(TM(0, vh / 2, 0))); L.add("vitral" + k, new THREE.PlaneGeometry(vw, vh), M.clone().multiply(TM(0, vh / 2, -t + .02, 0, Math.PI, 0)));
    for (const sx of [-1, 1]) L.add("corona", RB1(.14, vh + .1, .2, .03), M.clone().multiply(TM(sx * (vw / 2 + .05), vh / 2, .06))); L.add("corona", RB1(vw + .3, .12, .3, .03), M.clone().multiply(TM(0, -.06, .1))) };
  for (const s of [-1, 1]) VENT_Z.forEach((vz, i) => vit(at(s * (w / 2 + .01), VY[0], vz, 0, s * Math.PI / 2, 0), VW, VY[1] - VY[0], i % 3));
  vit(at(0, 2.0, z1 - .01, 0, Math.PI, 0), 1.7, 3.0, 0);
  // el techo de pizarra (empinado) y los hastiales de piedra
  { const ang = 50 * Math.PI / 180, span = w, rh = span / 2 * Math.tan(ang), ovz = .5, S = (span / 2 + ovz) / Math.cos(ang), Lt = d + .8;
    for (const s of [1, -1]) { const g = new THREE.BoxGeometry(S, .2, Lt); geoUV(g, (px, py, pz) => px / 4.4, (px, py, pz) => pz / 4.4); const ym = Hn + rh - (span / 2 + ovz) * Math.tan(ang) / 2 + .12, xm = s * (span / 2 + ovz) / 2; L.add("piz", g, at(xm, ym, cz, 0, 0, -s * ang)) }
    const sh = new THREE.Shape(); sh.moveTo(-span / 2, 0); sh.lineTo(span / 2, 0); sh.lineTo(0, rh); sh.closePath(); for (const zz of [z0 - t, z1]) L.add("sillar", uvMuro(new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false }), 3.2), at(0, Hn, zz));
    L.add("corona", new THREE.CylinderGeometry(.16, .16, Lt + .1, 8), at(0, Hn + rh + .14, cz, Math.PI / 2, 0, 0));
    // cruz de piedra en la punta del hastial de atrás
    L.add("corona", RB1(.2, 1.2, .2, .03), at(0, Hn + rh + .7, z1 + .3)); L.add("corona", RB1(.8, .2, .2, .03), at(0, Hn + rh + .95, z1 + .3)) }
  // piso de losas y adentro: el techo de madera (vigas y tablas a la vista)
  L.add("losas", new THREE.BoxGeometry(w - 2 * t, .1, d - 2 * t), at(0, .05, cz)); for (let k = 0; k < 12; k++) L.add("madera", new THREE.BoxGeometry(w - 2 * t, .22, .22), at(0, Hn - .2, z0 - 1.6 - k * 2));
  L.add("madera", new THREE.BoxGeometry(w - 2 * t, .06, d - 2 * t), at(0, Hn + .02, cz));
  // ---- el campanario
  const T = TORRE_T, tl = T.lado, tt = .7, tz = T.z, TB = 3.6, CB0 = 10.6, CB1 = 13.6, AT = (...a) => TM(T.x, y0, 0).multiply(TM(...a));
  // base hueca: puerta al sur (a la plaza), abertura al norte (a la nave)
  muroHuecos(L, "sillar", AT(0, 0, tz + tl / 2 - tt / 2), tl, TB, tt, [[-.9, .9, 0, 2.9]], 3.2); muroHuecos(L, "sillar", AT(0, 0, tz - tl / 2 + tt / 2), tl, TB, tt, [[-1.1, 1.1, 0, 3.0]], 3.2);
  for (const s of [-1, 1]) L.add("sillar", uvMuro(new THREE.BoxGeometry(tt, TB, tl - 2 * tt), 3.2), AT(s * (tl / 2 - tt / 2), TB / 2, tz));
  L.add("sillar", uvMuro(new THREE.BoxGeometry(tl, CB0 - TB, tl), 3.2), AT(0, TB + (CB0 - TB) / 2, tz)); L.add("losas", new THREE.BoxGeometry(tl - 2 * tt, .1, tl - 2 * tt), AT(0, .05, tz));
  L.add("sillarO", uvMuro(new THREE.BoxGeometry(tl + .3, .9, tl + .3), 3.2), AT(0, .25, tz));
  for (const yy of [TB, 7.2, CB0]) L.add("corona", RB1(tl + .3, .22, tl + .3, .04), AT(0, yy, tz));
  // ventanitas (saeteras) de la torre y un óculo con reloj parado
  for (const yy of [5.0, 8.4]) L.add("oscuro", new THREE.PlaneGeometry(.22, .9), AT(0, yy, tz + tl / 2 + .01));
  L.add("corona", new THREE.TorusGeometry(.62, .1, 8, 24), AT(0, 9.3, tz + tl / 2 + .04)); L.add("blanco", new THREE.CircleGeometry(.56, 24), AT(0, 9.3, tz + tl / 2 + .02)); L.add("hierro", new THREE.BoxGeometry(.04, .42, .02), AT(0, 9.44, tz + tl / 2 + .05, 0, 0, .9)); L.add("hierro", new THREE.BoxGeometry(.04, .3, .02), AT(0, 9.38, tz + tl / 2 + .06, 0, 0, -.4));
  // el campanario abierto: pilares en las esquinas y un parteluz en cada cara, arcos arriba
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) L.add("sillar", uvMuro(new THREE.BoxGeometry(.9, CB1 - CB0, .9), 3.2), AT(sx * (tl / 2 - .45), CB0 + (CB1 - CB0) / 2, tz + sz * (tl / 2 - .45)));
  for (const [ax, az, ry] of [[0, tl / 2, 0], [0, -tl / 2, Math.PI], [tl / 2, 0, Math.PI / 2], [-tl / 2, 0, -Math.PI / 2]]) { const M = AT(ax, 0, tz + az, 0, ry, 0);
    L.add("sillar", uvMuro(new THREE.BoxGeometry(.4, CB1 - CB0, .5), 3.2), M.clone().multiply(TM(0, CB0 + (CB1 - CB0) / 2, -.25))); L.add("corona", RB1(tl - 1.6, .3, .6, .03), M.clone().multiply(TM(0, CB0 + .15, -.25)));
    for (const s of [-1, 1]) { const sh = new THREE.Shape(), aw = (tl - 2.2) / 2; sh.moveTo(-aw / 2, 0); sh.lineTo(-aw / 2, .9); sh.lineTo(aw / 2, .9); sh.lineTo(aw / 2, 0); sh.quadraticCurveTo(aw / 2, .62, 0, .84); sh.quadraticCurveTo(-aw / 2, .62, -aw / 2, 0); sh.closePath();
      L.add("sillar", new THREE.ExtrudeGeometry(sh, { depth: .5, bevelEnabled: false }), M.clone().multiply(TM(s * (aw / 2 + .2), CB1 - .9, -.5))) }
    // barandita de hierro en cada arco
    for (let q = 0; q < 9; q++) L.add("hierro", new THREE.CylinderGeometry(.02, .02, .8, 5), M.clone().multiply(TM(-tl / 2 + 1.1 + q * (tl - 2.2) / 8, CB0 + .7, -.1))); L.add("hierro", new THREE.BoxGeometry(tl - 2.2, .04, .04), M.clone().multiply(TM(0, CB0 + 1.1, -.1))) }
  L.add("sillar", uvMuro(new THREE.BoxGeometry(tl + .2, .45, tl + .2), 3.2), AT(0, CB1 + .22, tz)); L.add("corona", RB1(tl + .6, .2, tl + .6, .04), AT(0, CB1 + .5, tz));
  // pináculos en las esquinas y la aguja octogonal de pizarra con la cruz y el gallo de hierro
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { L.add("corona", RB1(.4, .8, .4, .03), AT(sx * (tl / 2), CB1 + 1, tz + sz * (tl / 2))); L.add("piz", new THREE.ConeGeometry(.3, 1.3, 4), AT(sx * (tl / 2), CB1 + 2.05, tz + sz * (tl / 2), 0, Math.PI / 4, 0)) }
  { const hA = T.punta - 1.1 - (CB1 + .6), g = new THREE.ConeGeometry(tl / 2 - .15, hA, 8, 6); geoUV(g, (px, py, pz) => (Math.atan2(pz, px) + Math.PI) * 1.2, (px, py) => py / 2.2); L.add("piz", g, AT(0, CB1 + .6 + hA / 2, tz, 0, Math.PI / 8, 0));
    L.add("hierro", new THREE.CylinderGeometry(.05, .06, 1.3, 6), AT(0, T.punta - .65, tz)); L.add("hierro", new THREE.BoxGeometry(.7, .07, .07), AT(0, T.punta - .35, tz)); L.add("hierro", new THREE.SphereGeometry(.1, 8, 6), AT(0, T.punta - 1.05, tz));
    // gallo de la veleta (silueta de chapa)
    const sg = new THREE.Shape(); [[0, 0], [.25, .05], [.32, .2], [.28, .35], [.18, .32], [.12, .18], [-.1, .16], [-.28, .32], [-.3, .12], [-.15, 0]].forEach(([a, b], i) => i ? sg.lineTo(a, b) : sg.moveTo(a, b)); sg.closePath();
    L.add("hierro", new THREE.ExtrudeGeometry(sg, { depth: .02, bevelEnabled: false }), AT(0, T.punta - .2, tz, 0, .6, 0)) }
  rectAdd({ x: cx, z: cz, w: w + 1.8, d: d + .4, ry: 0, iglesia: 1 }); rectAdd({ x: T.x, z: tz, w: tl + .3, d: tl + .3, ry: 0, torre: 1 });
  const W = (x, y, z) => [x, y0 + y, z];
  return { y0, Hn, t, TB, CB0, CB1, puerta: W(0, 0, tz + tl / 2 + .6), puertaAdentro: W(0, 0, tz), nave: W(0, 0, cz), altar: W(0, 0, z1 + 2.4), cuerda: W(.7, 0, tz), VENT_Z } })();


// ---------- se cierran los lotes de casas y de piedra
const CASAS_M = L_CASA.fin(scene, CASA_MATS); ["oscuro", "vidrio", "ventana", "vidrioC", "luz", "marca0", "marca1", "marca2", "marca3", "marca4", "marca5"].forEach(k => { if (CASAS_M[k]) CASAS_M[k].castShadow = false });
const CASAS_LEJOS_M = L_LEJOS.fin(scene, CASA_MATS); ["oscuro", "ventana"].forEach(k => { if (CASAS_LEJOS_M[k]) CASAS_LEJOS_M[k].castShadow = false });
const PIEDRA_M = L_PIEDRA.fin(scene, { corona: M_CORONA, sillar: M_SILLAR, sillarO: M_SILLAR_O, piz: M_PIZ[0], vitral0: M_VITRAL[0], vitral1: M_VITRAL[1], vitral2: M_VITRAL[2], oscuro: M_OSCURO, hierro: M_HIERRO, madera: M_MADERA, losas: M_LOSAS, blanco: M_BLANCO_P });
["vitral0", "vitral1", "vitral2", "oscuro"].forEach(k => { if (PIEDRA_M[k]) PIEDRA_M[k].castShadow = false });
