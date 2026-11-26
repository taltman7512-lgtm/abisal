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
