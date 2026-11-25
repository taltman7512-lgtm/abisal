// ================= DUSTMERE: el mundo (valle de desierto, pueblo de adobe, torre del cuerno, estanques y ruinas) =================
// Norte = −z. Todo lo de la tortuga y del mar del motor se esconde: acá el piso es una malla de terreno propia (SUELO).
TURT.children.forEach(o => o.visible = false);
CABEZA.visible = false; ALETAS.forEach(a => a.piv.visible = false); COLA.visible = false; COSTA.visible = false; FOAM.visible = false; FONDO.visible = false; HONDA.visible = false;
BOTES.forEach(b => b.visible = false); GAVIOTAS.forEach(g => g.visible = false); LUCES.forEach(l => l.visible = false); ESPUMA.forEach(s => s.visible = false); SALPI.forEach(s => s.visible = false);
NUBE.forEach(s => s.visible = false); ROPA3.forEach(m => m.visible = false); GALLINAS.forEach(g => g.visible = false);
HOUSES.forEach(H => H.g.visible = false);

// ---------- ayudantes
const sst = (a, b, x) => { const q = cl((x - a) / (b - a)); return q * q * (3 - 2 * q) };
const hash2 = (i, j) => { let n = (Math.imul(i | 0, 374761393) + Math.imul(j | 0, 668265263)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296 };
const ruido2 = (x, z) => { const i = Math.floor(x), j = Math.floor(z), u = x - i, v = z - j, a = u * u * (3 - 2 * u), b = v * v * (3 - 2 * v); return lerp(lerp(hash2(i, j), hash2(i + 1, j), a), lerp(hash2(i, j + 1), hash2(i + 1, j + 1), a), b) };
const fbm2 = (x, z, o = 4) => { let s = 0, a = .5, f = 1, n = 0; for (let k = 0; k < o; k++) { s += a * ruido2(x * f + k * 17.3, z * f - k * 9.1); n += a; a *= .5; f *= 2.03 } return s / n };
const TM = (x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, "YXZ")), new THREE.Vector3(sx, sy, sz));
// lote: junta muchas piezas por material y las une en una sola malla por material (pocas llamadas de dibujo)
const lote = () => { const L = {}; return { L, add(k, geo, m) { (L[k] ||= []).push([geo, m || new THREE.Matrix4()]); return this },
  fin(par, mats, o = {}) { const out = {}; for (const k in L) { if (!mats[k]) throw new Error("lote sin material: " + k); const me = new THREE.Mesh(mergeG(L[k]), mats[k]); me.castShadow = o.sombra !== false; me.receiveShadow = true; par.add(me); out[k] = me } return out } } };
const linC = h => { const c = new THREE.Color(h); return [c.r, c.g, c.b] };
const mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
// dibuja con envoltura (para texturas que se repiten sin costura)
const envuelto = (g, w, h, fn) => { for (const dx of [-w, 0, w]) for (const dy of [-h, 0, h]) { g.save(); g.translate(dx, dy); fn(); g.restore() } };
// deforma una esfera/icosaedro en piedra irregular
const geoPiedra = (seed, det = 1, ach = .7) => { const g = new THREE.IcosahedronGeometry(1, det), p = g.attributes.position, r = rng(seed), fx = r() * 9, fy = r() * 9; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = .72 + .5 * ruido2(x * 1.7 + fx + y, z * 1.7 + fy - y); p.setXYZ(i, x * k, y * k * ach, z * k) } g.computeVertexNormals(); return g };

// ---------- los estanques: 11 pisadas de Onetusk (disco + 5 dedos hacia el sur, +z)
const pisadaSD = (dx, dz) => { let d = Math.hypot(dx, dz * 1.06) - 3.85; for (let k = 0; k < 5; k++) { const a = (k - 2) * .43, q = Math.abs(k - 2), d2 = Math.hypot(dx - Math.sin(a) * 4.05, dz - Math.cos(a) * 3.75) - (1.08 - q * .09); if (d2 < d) d = d2 } return d };
const EST = ESTANQUES.map(([x, z], i) => { const yF = Math.min(ALT(x, z + 5.2), ALT(x, z)) - .8; return { x, z, i, yF, yW: yF + .52 } });
// ---------- altura real del terreno (ALT + cresta que cae al norte + dunas + terrazas de roca + pisadas hundidas)
const dunasH = (x, z) => { const w = fbm2(x * .006 + 3, z * .006 + 7, 3), a = x * .021 + z * .011 + w * 7, b = -x * .009 + z * .027 + w * 5; return Math.pow(1 - Math.abs(Math.sin(a)), 1.7) * 6.5 + Math.pow(1 - Math.abs(Math.sin(b)), 2.2) * 3 + fbm2(x * .02, z * .02, 3) * 2.2 };
const dunasM = (x, z) => { const d = Math.hypot(x, (z - 6) / 1.12), m1 = sst(64, 135, d), mc = lerp(sst(24, 64, Math.abs(x)), 1, sst(-34, 24, z)), mb = 1 - sst(380, 425, Math.max(Math.abs(x), Math.abs(z))); return m1 * mc * mb };
function sueloBase(x, z) { const caida = 1 - sst(190, 248, -z); let h = ALT(x, z) * caida;
  const ax = Math.abs(x); if (h > .4 && ax > 15) { const k = sst(15, 34, ax) * .9, n = fbm2(x * .035 + 9, z * .035 + 4, 3), t = h / 4.2 + n * .9, fl = Math.floor(t), hs = (fl + sst(.5, .93, t - fl) - n * .9) * 4.2; h = lerp(h, Math.max(0, hs), k * caida) }
  const m = dunasM(x, z); if (m > 0) h += dunasH(x, z) * m; return h }
function SUELO(x, z) { let h = sueloBase(x, z); if (Math.abs(x) < 17 && z < -12 && z > -158) for (const e of EST) { const dz = z - e.z; if (Math.abs(dz) > 11) continue; const sd = pisadaSD(x - e.x, dz); if (sd > 6) continue;
    const W = .8 + .42 * Math.max(0, h - e.yF); if (sd <= 0) return e.yF - .38 * sst(0, 2.4, -sd) + .05 * Math.sin((x - e.x) * 2.1) * Math.sin(dz * 1.7);
    if (sd < W) return lerp(e.yF, h + .3, sst(0, W, sd)); return h + .3 * (1 - sst(W, W + 2.3, sd)) } return h }
const sueloN = (x, z, e = .6) => { const nx = SUELO(x - e, z) - SUELO(x + e, z), nz = SUELO(x, z - e) - SUELO(x, z + e), l = Math.hypot(nx, 2 * e, nz); return [nx / l, 2 * e / l, nz / l] };
// qué tan cerca del borde de un estanque (para hundir la malla gruesa debajo del parche fino)
const cercaEst = (x, z) => { if (Math.abs(x) > 18 || z > -10 || z < -160) return null; for (const e of EST) { const dz = z - e.z; if (Math.abs(dz) > 12) continue; const sd = pisadaSD(x - e.x, dz); if (sd < 7) return [e, sd] } return null };

// ---------- color del suelo por vértice (arena clara/oscura, tierra pisada del pueblo, roca roja en las pendientes, barro en los estanques)
const C_ARENA = linC("#d2b48a"), C_ARENA2 = linC("#bb9a6e"), C_DUNA = linC("#d49c64"), C_TIERRA = linC("#a98a66"), C_ROCA = linC("#a65a3c"), C_ROCA2 = linC("#c98a5e"), C_BARRO = linC("#5e4a38"), C_BARRO2 = linC("#8a7458"), C_SENDA = linC("#9c7f5e");
// sendas pisadas: de la plaza a cada lugar
const SENDAS = [[0, 8, 0, 52, 3.4], [-9, 0, -38, -2, 2.2], [9, 0, 40, 2, 2.2], [0, -17, 0, -108, 5], [-12, 10, -24, 30, 1.6], [12, 6, 30, -16, 1.6], [-10, -6, -30, -15, 1.5], [10, 14, 22, 24, 1.4], [-20, 30, -20, 50, 1.6], [22, 30, 24, 50, 1.6]];
const sendaK = (x, z) => { let k = 0; for (const [x0, z0, x1, z1, an] of SENDAS) { const dx = x1 - x0, dz = z1 - z0, t = cl(((x - x0) * dx + (z - z0) * dz) / (dx * dx + dz * dz)), d = Math.hypot(x - x0 - dx * t, z - z0 - dz * t) + (fbm2(x * .4, z * .4, 2) - .5) * 1.6; k = Math.max(k, 1 - sst(an * .5, an, d)) } return k };
function colorSuelo(x, z) { const n = fbm2(x * .05 + 11, z * .05 + 2, 4), n2 = fbm2(x * .31 + 5, z * .31 + 8, 2), nor = sueloN(x, z, 1.2), pend = 1 - nor[1];
  let c = mix3(C_ARENA, C_ARENA2, sst(.3, .7, n)); const dm = dunasM(x, z); c = mix3(c, C_DUNA, dm * (.35 + .4 * n2));
  const dp = Math.hypot(x, (z - 6) / 1.12); c = mix3(c, C_TIERRA, (1 - sst(40, 66, dp)) * (.35 + .4 * n2)); c = mix3(c, C_SENDA, sendaK(x, z) * .6);
  const alt = sueloBase(x, z); if (alt > .5 || pend > .05) { const banda = .5 + .5 * Math.sin(alt * 1.9 + n * 5); c = mix3(c, mix3(C_ROCA, C_ROCA2, banda), sst(.1, .36, pend) * .9) }
  const ce = cercaEst(x, z); if (ce) { const sd = ce[1]; c = mix3(c, C_BARRO2, (1 - sst(.6, 3.4, sd)) * .75); c = mix3(c, C_BARRO, 1 - sst(-.3, .9, sd)) }
  const s = .9 + .2 * n2; return [c[0] * s, c[1] * s, c[2] * s] }

// ---------- arena: textura de detalle (granos, ondas del viento, piedritas) con relieve; el color grande viene por vértice
const T_ARENA_D = (() => { const [c, z] = pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(2701); c.fillStyle = "#efe6d6"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
    for (let k = 0; k < 260; k++) { const x = r() * w, y = r() * h, s = 30 + r() * 110, col = r() < .5 ? "rgba(190,160,120,.16)" : "rgba(255,250,238,.2)"; envuelto(c, w, h, () => { const gr = c.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, col); gr.addColorStop(1, "rgba(230,215,190,0)"); c.fillStyle = gr; c.fillRect(x - s, y - s, s * 2, s * 2) });
      const gz = r() < .5 ? "rgba(70,70,70,.3)" : "rgba(190,190,190,.3)"; envuelto(z, w, h, () => { const gr = z.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, gz); gr.addColorStop(1, "rgba(128,128,128,0)"); z.fillStyle = gr; z.fillRect(x - s, y - s, s * 2, s * 2) }) }
    // ondas del viento: crestas claras con sombra del otro lado (corren a lo largo de y, se bifurcan)
    for (let k = 0; k < 64; k++) { const x0 = k * 16 + r() * 8, f1 = 1 + (r() * 3 | 0), ph = r() * 6.3, am = 5 + r() * 9, y0 = r() * h, len = h * (.35 + r() * .65);
      const tr = (g, dx, col, lw) => envuelto(g, w, h, () => { g.strokeStyle = col; g.lineWidth = lw; g.lineCap = "round"; g.beginPath(); for (let q = 0; q <= 1.001; q += .02) { const y = y0 + q * len, x = x0 + dx + Math.sin(y / h * 6.283 * f1 + ph) * am + Math.sin(y / h * 6.283 * 5 + ph * 2) * 2; q ? g.lineTo(x, y) : g.moveTo(x, y) } g.stroke() });
      tr(z, 0, "rgba(225,225,225,.34)", 6); tr(z, 7, "rgba(50,50,50,.3)", 5); tr(c, 0, "rgba(255,248,232,.16)", 5); tr(c, 7, "rgba(150,120,85,.1)", 5) }
    for (let k = 0; k < 26000; k++) { const x = r() * w, y = r() * h, v = r(); c.fillStyle = v < .5 ? `rgba(120,96,66,${.1 + r() * .22})` : `rgba(255,252,240,${.1 + r() * .25})`; c.fillRect(x, y, 1 + r() * 2, 1 + r() * 2); z.fillStyle = v < .5 ? "rgba(60,60,60,.35)" : "rgba(210,210,210,.35)"; z.fillRect(x, y, 2, 2) }
    for (let k = 0; k < 150; k++) { const x = r() * w, y = r() * h, s = 2.5 + r() * 6, a = r() * 3; envuelto(c, w, h, () => { c.fillStyle = "rgba(60,44,30,.35)"; c.beginPath(); c.ellipse(x + 2, y + 2, s, s * .7, a, 0, 7); c.fill(); c.fillStyle = rgbj(["#a08a70", "#8a7660", "#b8a68c", "#7a5a44"][r() * 4 | 0], r, 24); c.beginPath(); c.ellipse(x, y, s, s * .7, a, 0, 7); c.fill() });
      envuelto(z, w, h, () => { z.fillStyle = "rgba(20,20,20,.7)"; z.beginPath(); z.ellipse(x + 1.5, y + 1.5, s + 1.5, s * .7 + 1.5, a, 0, 7); z.fill(); z.fillStyle = "rgba(250,250,250,.9)"; z.beginPath(); z.ellipse(x, y, s, s * .7, a, 0, 7); z.fill() }) } });
  [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); z.repeat.set(1.31, 1.31); z.rotation = .23; return { c, z } })();
const M_ARENA = new THREE.MeshStandardMaterial({ map: T_ARENA_D.c, bumpMap: T_ARENA_D.z, bumpScale: 3.2, roughness: .96, vertexColors: true });
AGUA.material = new THREE.MeshStandardMaterial({ color: "#c9a274", roughness: 1 }); AGUA.position.y = -3; AGUA.castShadow = false;

// ---------- la malla del terreno: fina en el pueblo (≈ 0,7 m) y gruesa lejos (≈ 7 m), hasta ±430
const TERRENO = (() => { const N = 320, E = 430, geo = new THREE.PlaneGeometry(2, 2, N, N); geo.rotateX(-Math.PI / 2); const p = geo.attributes.position, uv = geo.attributes.uv, col = new Float32Array(p.count * 3), mp = u => E * (.2 * u + .8 * u * u * u);
  for (let i = 0; i < p.count; i++) { const x = mp(p.getX(i)), z = mp(p.getZ(i)) - 10; let y = SUELO(x, z); const ce = cercaEst(x, z); if (ce) { const e = ce[0], W = .8 + .42 * Math.max(0, sueloBase(x, z) - e.yF); y -= .7 * (1 - sst(W + .3, W + 1.5, ce[1])) }
    p.setXYZ(i, x, y, z); uv.setXY(i, x / 8.5, z / 8.5); const c = colorSuelo(x, z); col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2] }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals(); const m = new THREE.Mesh(geo, M_ARENA); m.receiveShadow = true; m.castShadow = true; scene.add(m); return m })();

// ---------- roca estratificada: mesetas, cerros rojos y la cresta (bandas de color con relieve, cornisas y surcos)
const T_ESTRATO = (() => { const [c, z] = pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(2710); c.fillStyle = "#a5512f"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
    const cols = ["#a5512f", "#bb6a3e", "#8f4226", "#cf9060", "#dcb88c", "#9a4a34", "#7c3a26", "#c47a4a", "#b05a34", "#e0c49c"]; let y = h * .86, k = 0;
    while (y > -40) { const bh = 14 + r() * 62, col = cols[(k * 3 + (r() * 3 | 0)) % cols.length], f = 1 + (r() * 3 | 0), ph = r() * 6.3, am = 2 + r() * 7; c.fillStyle = col; c.beginPath(); c.moveTo(0, y + 2); for (let x = 0; x <= w; x += 16) c.lineTo(x, y - bh + Math.sin(x / w * 6.283 * f + ph) * am); c.lineTo(w, y + 2); c.fill();
      z.strokeStyle = "rgba(20,20,20,.85)"; z.lineWidth = 3 + r() * 5; z.beginPath(); for (let x = 0; x <= w; x += 16) { const yy = y - bh + Math.sin(x / w * 6.283 * f + ph) * am; x ? z.lineTo(x, yy) : z.moveTo(x, yy) } z.stroke(); z.strokeStyle = "rgba(230,230,230,.6)"; z.lineWidth = 3; z.beginPath(); for (let x = 0; x <= w; x += 16) { const yy = y - bh + 6 + Math.sin(x / w * 6.283 * f + ph) * am; x ? z.lineTo(x, yy) : z.moveTo(x, yy) } z.stroke();
      c.strokeStyle = "rgba(60,26,14,.4)"; c.lineWidth = 2; c.beginPath(); for (let x = 0; x <= w; x += 16) { const yy = y - bh + Math.sin(x / w * 6.283 * f + ph) * am; x ? c.lineTo(x, yy) : c.moveTo(x, yy) } c.stroke(); y -= bh; k++ }
    // surcos verticales de erosión y manchas de barniz del desierto
    for (let q = 0; q < 240; q++) { const x = r() * w, y0 = r() * h * .86, len = 30 + r() * 220, osc = r() < .6; envuelto(c, w, h, () => { c.strokeStyle = osc ? `rgba(50,22,12,${.18 + r() * .25})` : `rgba(245,215,180,${.12 + r() * .16})`; c.lineWidth = 1.5 + r() * 5; c.beginPath(); c.moveTo(x, y0); for (let t = 0; t <= len; t += 20) c.lineTo(x + Math.sin(t * .05 + q) * 4, y0 + t); c.stroke() });
      envuelto(z, w, h, () => { z.strokeStyle = osc ? "rgba(25,25,25,.5)" : "rgba(215,215,215,.4)"; z.lineWidth = 3 + r() * 6; z.beginPath(); z.moveTo(x, y0); z.lineTo(x, y0 + len); z.stroke() }) }
    for (let q = 0; q < 70; q++) { const x = r() * w, yy = r() * h * .8, s = 30 + r() * 90; envuelto(c, w, h, () => { const gr = c.createRadialGradient(x, yy, 0, x, yy, s); gr.addColorStop(0, "rgba(46,22,16,.3)"); gr.addColorStop(1, "rgba(46,22,16,0)"); c.fillStyle = gr; c.fillRect(x - s, yy - s, s * 2, s * 2) }) }
    // el talud de abajo: arena y cascajo
    const gr = c.createLinearGradient(0, h * .8, 0, h); gr.addColorStop(0, "rgba(200,160,112,0)"); gr.addColorStop(.3, "rgba(200,160,112,1)"); gr.addColorStop(1, "#cfa878"); c.fillStyle = gr; c.fillRect(0, h * .8, w, h * .2); z.fillStyle = "#808080"; z.fillRect(0, h * .87, w, h * .13);
    for (let q = 0; q < 1400; q++) { const x = r() * w, yy = h * (.82 + r() * .18), s = 1.5 + r() * 6; c.fillStyle = rgbj(r() < .5 ? "#9a5a3c" : "#b88a62", r, 30, .8); c.beginPath(); c.ellipse(x, yy, s, s * .7, r() * 3, 0, 7); c.fill(); z.fillStyle = "rgba(235,235,235,.7)"; z.beginPath(); z.ellipse(x, yy, s, s * .7, 0, 0, 7); z.fill() } });
  [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
const M_ROCA = new THREE.MeshStandardMaterial({ map: T_ESTRATO.c, bumpMap: T_ESTRATO.z, bumpScale: 7, roughness: .95, flatShading: true });
function geoMesa(R, H, seed, o = {}) { const r = rng(seed), NA = o.na || 46, capas = o.capas || Math.max(3, Math.round(H / 5.5)), tal = (o.talud ?? .26) * H, falda = o.falda ?? 1.75, prof = [[falda, 0, -1], [lerp(falda, 1.06, .62), tal * .5, -1], [1.07, tal, -1]];
  let f = 1.04; for (let k = 0; k < capas; k++) { const y0 = lerp(tal, H, k / capas), y1 = lerp(tal, H, (k + 1) / capas); prof.push([f, y0 + (y1 - y0) * .06, k]); const f2 = f - r() * .025; prof.push([f2, y1 - (y1 - y0) * .1, k]); f = f2 - (.02 + r() * .075) * Math.min(1, 5 / capas) }
  prof.push([f * .97, H, capas], [f * .55, H * 1.012 + .1, capas], [0, H * 1.02 + .15, capas]);
  const ks = Array.from({ length: 6 }, (_, k) => [k + 2, r() * 6.283, (.2 / (k + 1.4)) * (.45 + r())]), pos = [], uv = [], idx = [], ru = Math.max(1, Math.round(R * 6.283 / 46)), s0 = seed * 13 | 0;
  prof.forEach(([pf, py, capa], j) => { for (let i = 0; i <= NA; i++) { const a = i / NA * 6.283; let out = 1; ks.forEach(([k, ph, am]) => out += am * Math.sin(k * a + ph)); if (capa >= 0) out *= 1 + (hash2(i % NA + s0, capa * 7 + s0) - .5) * .13 + (hash2((i >> 1) % (NA >> 1) + s0, capa * 3 + 91) - .5) * .1;
      pos.push(Math.cos(a) * R * pf * out, py, Math.sin(a) * R * pf * out); uv.push(i / NA * ru + (capa >= 0 ? hash2(capa, s0) * .3 : 0), py < tal ? .02 + (py / tal) * .12 : .14 + (py - tal) / (o.vh || 64) + (seed % 7) * .11) } });
  for (let j = 0; j < prof.length - 1; j++) for (let i = 0; i < NA; i++) { const a = j * (NA + 1) + i, b = a + NA + 1; idx.push(a, b, a + 1, b, b + 1, a + 1) }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g }
// las mesetas: un anillo lejano de cerros rojos, mesetas medianas sueltas y la cresta (una fila de paredones a los dos lados del paso de Onetusk)
const MESAS = (() => { const r = rng(2720), L = [], lista = [];
  const pon = (x, z, R, H, o = {}) => { const y = Math.min(SUELO(x, z), SUELO(x + R * .7, z), SUELO(x - R * .7, z), SUELO(x, z + R * .7), SUELO(x, z - R * .7)) - .6; L.push([geoMesa(R, H, 100 + lista.length * 7 + (r() * 50 | 0), o), TM(x, y, z, 0, r() * 6.283, 0, o.ex || 1, 1, 1)]); lista.push([x, z, R * (o.falda ?? 1.75) * (o.ex || 1), H]) };
  for (let k = 0; k < 30; k++) { const a = k / 30 * 6.283 + (r() - .5) * .12, d = 265 + r() * 110, R = 26 + r() * 46, H = 34 + r() * 58; pon(Math.cos(a) * d, Math.sin(a) * d * .98 - 20, R, H, { ex: 1 + r() * .7 }) }
  for (let k = 0; k < 16; k++) { const a = k / 16 * 6.283 + r() * .3, d = 150 + r() * 80, x = Math.cos(a) * d, z = Math.sin(a) * d * 1.05; if (Math.abs(x) < 60 && z < 0) continue; pon(x, z, 9 + r() * 14, 12 + r() * 22, { ex: 1 + r() * .5, capas: 4 + (r() * 3 | 0) }) }
  // la cresta: paredones de 8 a 22 de alto sobre la loma, a los dos lados (queda libre el paso, |x| < 14)
  for (const s of [-1, 1]) { pon(s * 21.5, -168, 5.2, 13 + r() * 3, { falda: 1.3, talud: .16, capas: 4 }); pon(s * 31, -176, 8, 9 + r() * 5, { falda: 1.35, talud: .2, ex: 1.3 }); pon(s * 24, -150, 3.4, 5.5, { falda: 1.35, talud: .2, capas: 3 });
    for (let x = 44; x < 215; x += 15 + r() * 9) pon(s * x, -171 + (r() - .5) * 14, 9 + r() * 8, 8 + r() * 15, { falda: 1.4, talud: .22, ex: 1.2 + r() * .5 });
    for (let k = 0; k < 9; k++) { const x = s * (19 + r() * 60), z = -112 - r() * 34; pon(x, z, 2.2 + r() * 4, 2.5 + r() * 5, { falda: 1.4, talud: .2, capas: 3, na: 24 }) } }
  const m = new THREE.Mesh(mergeG(L), M_ROCA); m.castShadow = m.receiveShadow = true; scene.add(m); return lista })();

// ---------- cielo: nubes pintadas (cúmulos de base plana y cirros) sobre una cúpula; se dibujan después del cielo y antes de todo
const NUBES_D = (() => { const pinta = (seed, cirro) => tex(1024, 512, (g, w, h) => { const r = rng(seed); g.clearRect(0, 0, w, h);
    if (cirro) { for (let k = 0; k < 90; k++) { const x = r() * w, y = h * (.25 + r() * .5), L = 120 + r() * 380; const gr = g.createLinearGradient(x, 0, x + L, 0); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(.5, `rgba(255,255,255,${.1 + r() * .16})`); gr.addColorStop(1, "rgba(255,255,255,0)"); g.strokeStyle = gr; g.lineWidth = 3 + r() * 12; g.lineCap = "round"; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + L / 2, y - 18 - r() * 30, x + L, y + (r() - .5) * 20); g.stroke() } return }
    const bl = (x, y, s, col) => { const gr = g.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, col); gr.addColorStop(.55, col.replace(/[\d.]+\)$/, ".5)")); gr.addColorStop(1, col.replace(/[\d.]+\)$/, "0)")); g.fillStyle = gr; g.fillRect(x - s, y - s, s * 2, s * 2) };
    const N = 3 + (r() * 3 | 0); for (let n = 0; n < N; n++) { const cx = w * (.2 + r() * .6), base = h * (.62 + r() * .1), an = 130 + r() * 170;
      for (let k = 0; k < 60; k++) { const u = r() * 2 - 1, x = cx + u * an, top = (1 - u * u) * (90 + r() * 80), y = base - r() * top, s = 30 + r() * 60 * (1 - Math.abs(u) * .5); bl(x, y, s, "rgba(255,255,255,.55)") }
      for (let k = 0; k < 24; k++) { const u = r() * 2 - 1; bl(cx + u * an * .9, base + 6 + r() * 14, 26 + r() * 40, "rgba(150,160,185,.3)") }
      for (let k = 0; k < 26; k++) { const u = r() * 2 - 1, top = (1 - u * u) * 120; bl(cx + u * an * .8 - 14, base - top * (.5 + r() * .5), 18 + r() * 34, "rgba(255,255,255,.75)") } }
    g.globalCompositeOperation = "destination-in"; const m = g.createLinearGradient(0, 0, w, 0); m.addColorStop(0, "rgba(0,0,0,0)"); m.addColorStop(.12, "#000"); m.addColorStop(.88, "#000"); m.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = m; g.fillRect(0, 0, w, h); g.globalCompositeOperation = "source-over" });
  const ts = [pinta(2731), pinta(2732), pinta(2733), pinta(2734, true)], G = new THREE.Group(); scene.add(G); const r = rng(2735), ms = ts.map(t => new THREE.MeshBasicMaterial({ map: t, fog: false, depthTest: false, depthWrite: false, transparent: false, blending: THREE.CustomBlending, blendSrc: THREE.SrcAlphaFactor, blendDst: THREE.OneMinusSrcAlphaFactor, side: THREE.DoubleSide }));
  for (let k = 0; k < 22; k++) { const ci = k % 5 === 4, a = k / 22 * 6.283 + r() * .2, el = ci ? .5 + r() * .5 : .07 + r() * .34, d = 372, an = ci ? 330 : 120 + r() * 150, m = new THREE.Mesh(new THREE.PlaneGeometry(an, an * .5), ms[ci ? 3 : k % 3]); m.position.set(Math.cos(a) * Math.cos(el) * d, Math.sin(el) * d, Math.sin(a) * Math.cos(el) * d); m.lookAt(0, 0, 0); m.renderOrder = -.5; G.add(m) }
  return { G, ms } })();

// ---------- la luz de cada momento. OJO: el motor declara ENV después de este archivo, así que las escenas hacen una vez
// `Object.assign(ENV, ENV_DUSTMERE)` antes de usar setEnv("desierto" | "tormenta" | "incendio" | "despues").
const ENV_DUSTMERE = {
  desierto: { top: "#3c86d2", hor: "#ead9c0", fog: .0021, hemi: .95, hemiG: "#9a7a58", sun: 4.1, sunCol: "#ffd7a6", exp: 1.22, grade: ["#ffffff", 0], sol: [-.5, .4, .77], nube: ["#ffffff", 1] },
  tormenta: { top: "#b5662a", hor: "#cf8a46", fog: .07, hemi: 1.5, hemiG: "#8a5a30", sun: .9, sunCol: "#ffb060", exp: 1.0, grade: ["#d8862e", .1], sol: [-.5, .4, .77], nube: ["#e0a060", 0] },
  incendio: { top: "#0c1226", hor: "#3a2420", fog: .006, hemi: .55, hemiG: "#3a1c10", sun: .75, sunCol: "#8a9ac8", exp: 1.9, grade: ["#d0762e", .08], sol: [.45, .6, -.66], nube: ["#5a4050", .35] },
  despues: { top: "#5f8fc8", hor: "#f2c688", fog: .0048, hemi: 1.05, hemiG: "#a07a50", sun: 3.7, sunCol: "#ffc27a", exp: 1.05, grade: ["#ffd9a0", .05], sol: [-.72, .3, .62], nube: ["#ffe2b8", .95] } };
// el sol: las escenas pueden mover el centro de las sombras (SOL.x, SOL.z, SOL.r) y la dirección (SOL.dir = [x, y, z] hacia el sol); lo aplica ambiente(t)
const SOL = { x: 0, z: 0, r: 62, dir: null };

// ---------- el parche fino de cada pisada (barro agrietado con relieve, orilla levantada), el agua, los juncos y las piedras
const T_BARRO = (() => { const [c, z] = pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(2740); c.fillStyle = "#e9dfd0"; c.fillRect(0, 0, w, h); z.fillStyle = "#9a9a9a"; z.fillRect(0, 0, w, h);
    for (let k = 0; k < 500; k++) { const x = r() * w, y = r() * h, s = 14 + r() * 60; envuelto(c, w, h, () => { c.fillStyle = r() < .5 ? "rgba(120,96,70,.12)" : "rgba(255,250,240,.14)"; c.beginPath(); c.ellipse(x, y, s, s * .7, r() * 3, 0, 7); c.fill() }) }
    // grietas de barro seco: celdas (puntos al azar y bordes entre los dos más cercanos)
    const P = Array.from({ length: 170 }, () => [r() * w, r() * h]);
    for (let y = 0; y < h; y += 4) for (let x = 0; x < w; x += 4) { let d1 = 1e9, d2 = 1e9; for (const [px, py] of P) { let dx = Math.abs(x - px), dy = Math.abs(y - py); if (dx > w / 2) dx = w - dx; if (dy > h / 2) dy = h - dy; const d = dx * dx + dy * dy; if (d < d1) { d2 = d1; d1 = d } else if (d < d2) d2 = d }
      const e = Math.sqrt(d2) - Math.sqrt(d1); if (e < 7) { const a = 1 - e / 7; c.fillStyle = `rgba(52,36,24,${a * .85})`; c.fillRect(x, y, 4, 4); z.fillStyle = `rgba(0,0,0,${a})`; z.fillRect(x, y, 4, 4) } else if (e < 16) { z.fillStyle = `rgba(230,230,230,${(1 - (e - 7) / 9) * .5})`; z.fillRect(x, y, 4, 4) } }
    for (let k = 0; k < 9000; k++) { c.fillStyle = r() < .5 ? "rgba(90,70,50,.2)" : "rgba(255,250,240,.2)"; c.fillRect(r() * w, r() * h, 2, 2) } });
  [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
const M_BARRO = new THREE.MeshStandardMaterial({ map: T_BARRO.c, bumpMap: T_BARRO.z, bumpScale: 5, roughness: .9, vertexColors: true, transparent: true, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -6 });
// el cielo pintado que reflejan los estanques (equirectangular: azul arriba, bruma clara al horizonte, nubes)
const T_REFLEJO = (() => { const t = tex(1024, 512, (g, w, h) => { const r = rng(2745), gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#3f86d0"); gr.addColorStop(.38, "#8fc0ea"); gr.addColorStop(.5, "#f4e6cc"); gr.addColorStop(.52, "#b89468"); gr.addColorStop(1, "#8a6a48"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 150; k++) { const x = r() * w, y = h * (.08 + r() * .36), s = 14 + r() * 50; const q = g.createRadialGradient(x, y, 0, x, y, s); q.addColorStop(0, "rgba(255,255,255,.8)"); q.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = q; g.fillRect(x - s, y - s, s * 2, s * 2) } }); t.mapping = THREE.EquirectangularReflectionMapping; return t })();
const T_ONDAS = tex(512, 512, (g, w, h) => { const r = rng(2746); g.fillStyle = "#808080"; g.fillRect(0, 0, w, h); for (let k = 0; k < 260; k++) { const x = r() * w, y = r() * h, s = 10 + r() * 34, cl2 = r() < .5 ? "rgba(255,255,255,.3)" : "rgba(0,0,0,.3)"; envuelto(g, w, h, () => { const q = g.createRadialGradient(x, y, 0, x, y, s); q.addColorStop(0, cl2); q.addColorStop(1, "rgba(128,128,128,0)"); g.fillStyle = q; g.beginPath(); g.ellipse(x, y, s * 1.8, s * .6, 0, 0, 7); g.fill() }) } }, [3, 3]);
const M_ESTANQUE = new THREE.MeshStandardMaterial({ color: "#86aabf", metalness: 1, roughness: .07, envMap: T_REFLEJO, envMapIntensity: .8, bumpMap: T_ONDAS, bumpScale: .6, transparent: true, opacity: .93 });
const GEO_JUNCO = (() => { const r = rng(2750), hoja = new THREE.ConeGeometry(.035, 1, 4, 3), L = [], C = []; { const p = hoja.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i) + .5; p.setX(i, p.getX(i) + y * y * .22) } hoja.computeVertexNormals() }
  for (let k = 0; k < 13; k++) { const a = r() * 6.283, d = r() * .32, H = 1.3 + r() * 1.3; L.push([hoja, TM(Math.cos(a) * d, H / 2, Math.sin(a) * d, (r() - .5) * .12, r() * 6.283, (r() - .5) * .12, 1.3, H, 1.3)]) }
  for (let k = 0; k < 3; k++) { const a = r() * 6.283, d = r() * .22, H = 1.9 + r() * .7; L.push([new THREE.CylinderGeometry(.018, .022, H, 5), TM(Math.cos(a) * d, H / 2, Math.sin(a) * d)]); C.push([new THREE.CapsuleGeometry(.06, .3, 3, 7), TM(Math.cos(a) * d, H - .1, Math.sin(a) * d)]); C.push([new THREE.CylinderGeometry(.008, .012, .22, 4), TM(Math.cos(a) * d, H + .2, Math.sin(a) * d)]) }
  return [mergeG(L), mergeG(C)] })();
const GEO_PIEDRAS = [geoPiedra(31, 1, .62), geoPiedra(32, 1, .8), geoPiedra(33, 2, .5)];
const M_PIEDRA = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .95, bumpMap: T_ARENA_D.z, bumpScale: 2 });
const ESTANQUES_G = new THREE.Group(); scene.add(ESTANQUES_G);   // agua + juncos (se esconden con estanquesVisibles(false): quedan las pisadas secas)
{ const NR = 46, NA = 132, r = rng(2755), cc = new THREE.Color(), nj = 16, np = 26;
  const jun = new THREE.InstancedMesh(GEO_JUNCO[0], new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .8, side: THREE.DoubleSide }), EST.length * nj), cab = new THREE.InstancedMesh(GEO_JUNCO[1], SM("#5a3a22", { roughness: .9 }), EST.length * nj);
  const pie = GEO_PIEDRAS.map(g => new THREE.InstancedMesh(g, M_PIEDRA, EST.length * np)); [jun, cab, ...pie].forEach(m => { m.castShadow = m.receiveShadow = true }); ESTANQUES_G.add(jun, cab); pie.forEach(m => scene.add(m)); let ij = 0; const ip = [0, 0, 0];
  EST.forEach(e => { // parche
    const pos = [], col = [], uv = [], idx = []; for (let j = 0; j <= NR; j++) { const rr = 11.8 * Math.pow(j / NR, .85); for (let i = 0; i <= NA; i++) { const a = i / NA * 6.283, x = e.x + Math.cos(a) * rr, z = e.z + Math.sin(a) * rr, sd = pisadaSD(x - e.x, z - e.z), hb = sueloBase(x, z), W = .8 + .42 * Math.max(0, hb - e.yF);
        pos.push(x, SUELO(x, z) + .015, z); uv.push(x / 3.4, z / 3.4); const c = colorSuelo(x, z), n = fbm2(x * .9, z * .9, 2), moj = 1 - sst(-.5, .5, sd), k = moj * .35; col.push(c[0] * (1 - k) * (.9 + n * .2), c[1] * (1 - k) * (.9 + n * .2), c[2] * (1 - k * .8) * (.9 + n * .2), j === NR ? 0 : 1 - sst(W + 1.5, W + 2.3, sd)) } }
    for (let j = 0; j < NR; j++) for (let i = 0; i < NA; i++) { const a = j * (NA + 1) + i, b = a + NA + 1; idx.push(a, a + 1, b, b, a + 1, b + 1) }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 4)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, M_BARRO); m.receiveShadow = true; m.castShadow = true; m.renderOrder = 1; scene.add(m); e.parche = m;
    // agua: la silueta de la pisada, un poco más grande (el barro la tapa en la orilla)
    const sh = new THREE.Shape(); for (let i = 0; i <= 96; i++) { const a = i / 96 * 6.283; let rr = 2; while (rr < 8 && pisadaSD(Math.cos(a) * rr, Math.sin(a) * rr) < .75) rr += .05; i ? sh.lineTo(Math.cos(a) * rr, -Math.sin(a) * rr) : sh.moveTo(Math.cos(a) * rr, -Math.sin(a) * rr) }
    const ga = new THREE.ShapeGeometry(sh, 4); ga.rotateX(-Math.PI / 2); { const p = ga.attributes.position, u = ga.attributes.uv; for (let i = 0; i < p.count; i++) u.setXY(i, p.getX(i) / 6, p.getZ(i) / 6) }
    const ag = new THREE.Mesh(ga, M_ESTANQUE); ag.position.set(e.x, e.yW, e.z); ag.renderOrder = 2; ag.receiveShadow = true; ESTANQUES_G.add(ag); e.agua = ag;
    // juncos en la orilla (del lado del talón y a los costados) y piedras en el borde
    for (let k = 0; k < nj; k++) { let a, x, z, t = 0; do { a = -Math.PI / 2 + (r() - .5) * 4.4; const rr = 3.2 + r() * 1.3; x = e.x + Math.cos(a) * rr; z = e.z + Math.sin(a) * rr } while (Math.abs(pisadaSD(x - e.x, z - e.z) + .1) > .35 && ++t < 40);
      const s = .75 + r() * .7; dummy.position.set(x, Math.min(SUELO(x, z), e.yW) - .08, z); dummy.rotation.set(0, r() * 6.283, 0); dummy.scale.set(s, s * (.8 + r() * .5), s); dummy.updateMatrix(); jun.setMatrixAt(ij, dummy.matrix); cab.setMatrixAt(ij, dummy.matrix); jun.setColorAt(ij, cc.set(["#6f8a3c", "#8a9a48", "#5a7a34", "#a8a45a", "#7a8440"][r() * 5 | 0])); ij++ }
    for (let k = 0; k < np; k++) { const a = r() * 6.283, rr = 3.6 + r() * 2.6, x = e.x + Math.cos(a) * rr, z = e.z + Math.sin(a) * rr, sd = pisadaSD(x - e.x, z - e.z); if (sd < -.2 || sd > 2.6) continue; const v = r() * 3 | 0, s = .16 + r() * r() * .6;
      dummy.position.set(x, SUELO(x, z) + s * .12, z); dummy.rotation.set(r() * .5, r() * 6.283, r() * .5); dummy.scale.set(s * (1 + r() * .6), s, s); dummy.updateMatrix(); pie[v].setMatrixAt(ip[v], dummy.matrix); pie[v].setColorAt(ip[v], cc.set(["#8a7a68", "#a08a70", "#6e5e50", "#b09880", "#7c6a5a"][r() * 5 | 0])); ip[v]++ } });
  jun.count = cab.count = ij; pie.forEach((m, v) => { m.count = ip[v] }) }
// gotas que saltan de cada estanque (salpicar)
const GOTAS = (() => { const N = 64, m = new THREE.InstancedMesh(new THREE.SphereGeometry(.09, 8, 6), new THREE.MeshStandardMaterial({ color: "#dff0fa", roughness: .1, metalness: .3, emissive: "#6a8a9a", emissiveIntensity: .35 }), EST.length * N); m.frustumCulled = false; m.castShadow = true; scene.add(m); const r = rng(2760), d = []; for (let k = 0; k < EST.length * N; k++) { const a = r() * 6.283; d.push([Math.cos(a), Math.sin(a), r() * 3.6, 2.2 + r() * 5.5, 5 + r() * 9, .5 + r() * 1.3, r() * .25]); dummy.position.set(0, -50, 0); dummy.scale.setScalar(0); dummy.updateMatrix(); m.setMatrixAt(k, dummy.matrix) } return { m, d, N, q: EST.map(() => 0) } })();
function salpicar(i, q) { const e = EST[i]; if (!e || (GOTAS.q[i] === q)) return; GOTAS.q[i] = q; const T = 1.5 * q; for (let k = 0; k < GOTAS.N; k++) { const n = i * GOTAS.N + k, [ca, sa, r0, vr, vy, s, t0] = GOTAS.d[n], tt = (T - t0) * 1.25, y = vy * tt - 9.8 * tt * tt / 2, on = q > 0 && q < 1 && tt > 0 && y > -.3;
    if (on) { const rr = r0 + vr * tt; dummy.position.set(e.x + ca * rr, e.yW + y, e.z + sa * rr * .9); dummy.rotation.set(0, 0, 0); dummy.scale.set(s, s * (1 + Math.abs(vy - 9.8 * tt) * .12), s) } else { dummy.position.set(0, -50, 0); dummy.scale.setScalar(0) } dummy.updateMatrix(); GOTAS.m.setMatrixAt(n, dummy.matrix) }
  GOTAS.m.instanceMatrix.needsUpdate = true; e.agua.position.y = e.yW - .3 * Math.sin(cl(q) * Math.PI) + (q > 0 && q < 1 ? Math.sin(q * 40) * .04 * (1 - q) : 0) }
function estanquesVisibles(b) { ESTANQUES_G.visible = b; GOTAS.m.visible = b }

// ---------- la plaza empedrada (losas en anillos con un sol de piedra roja en el medio) y la calle principal de tierra pisada con lajas
const T_PLAZA = (() => { const [c, z] = pintarDoble(2048, 2048, (c, z, w, h) => { const r = rng(2770), C = w / 2, px = w / 27; z.fillStyle = "#606060"; z.fillRect(0, 0, w, h);
    c.fillStyle = "#6e5a44"; c.beginPath(); for (let i = 0; i <= 200; i++) { const a = i / 200 * 6.283, rr = (12.2 + Math.sin(a * 7) * .25 + Math.sin(a * 13 + 1) * .2) * px; i ? c.lineTo(C + Math.cos(a) * rr, C + Math.sin(a) * rr) : c.moveTo(C + Math.cos(a) * rr, C + Math.sin(a) * rr) } c.fill();
    const losa = (r0, r1, a0, a1, col) => { const m = .035 * px, ma0 = a0 + m / r1, ma1 = a1 - m / r1; if (ma1 <= ma0) return; const j = () => (r() - .5) * .05 * px, pts = [[r0 + m, ma0], [r1 - m, ma0], [r1 - m, (ma0 + ma1) / 2], [r1 - m, ma1], [r0 + m, ma1], [r0 + m, (ma0 + ma1) / 2]].map(([rr, a]) => [C + Math.cos(a) * rr + j(), C + Math.sin(a) * rr + j()]);
      for (const [g, f] of [[c, col], [z, `rgb(${200 + r() * 50 | 0},${200 + r() * 50 | 0},${200 + r() * 50 | 0})`]]) { g.fillStyle = f; g.beginPath(); g.moveTo((pts[0][0] + pts[5][0]) / 2, (pts[0][1] + pts[5][1]) / 2); for (let k = 0; k < 6; k++) { const p = pts[k], n = pts[(k + 1) % 6]; g.quadraticCurveTo(p[0], p[1], (p[0] + n[0]) / 2, (p[1] + n[1]) / 2) } g.fill() }
      const mx = C + Math.cos((a0 + a1) / 2) * (r0 + r1) / 2, my = C + Math.sin((a0 + a1) / 2) * (r0 + r1) / 2, s = (r1 - r0) * .6; c.save(); c.globalCompositeOperation = "source-atop"; const gr = c.createRadialGradient(mx - s * .3, my - s * .3, 0, mx, my, s * 1.4); gr.addColorStop(0, "rgba(255,245,225,.16)"); gr.addColorStop(1, "rgba(40,28,18,.16)"); c.fillStyle = gr; c.fillRect(mx - s * 2, my - s * 2, s * 4, s * 4); c.restore();
      if (r() < .18) { c.strokeStyle = "rgba(40,28,20,.6)"; c.lineWidth = 2; z.strokeStyle = "rgba(0,0,0,.8)"; z.lineWidth = 3; let x = mx + (r() - .5) * s, y = my + (r() - .5) * s; c.beginPath(); z.beginPath(); c.moveTo(x, y); z.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (r() - .5) * s * .7; y += (r() - .5) * s * .7; c.lineTo(x, y); z.lineTo(x, y) } c.stroke(); z.stroke() } };
    const grises = ["#a89880", "#9a8a74", "#b4a48c", "#8c7c68", "#a39078", "#bcae98", "#96846e", "#ad9d86"], rojos = ["#a4583c", "#8f4a32", "#b0684a"];
    losa(0, .55 * px, 0, 6.283, rojos[0]); for (let k = 0; k < 8; k++) losa(.55 * px, 1.25 * px, k / 8 * 6.283, (k + 1) / 8 * 6.283, k % 2 ? rojos[1] : grises[3]); for (let k = 0; k < 16; k++) losa(1.25 * px, 2.05 * px, k / 16 * 6.283, (k + 1) / 16 * 6.283, k % 2 ? grises[5] : rojos[2]);
    let rr = 2.05; while (rr < 12.1) { const an = .5 + r() * .5, r1 = Math.min(12.3, rr + an), roja = Math.abs(rr - 6.2) < .35 || Math.abs(rr - 9.4) < .3; let a = r() * 6.283; const fin = a + 6.283; while (a < fin - .02) { const da = Math.min(fin - a, (.55 + r() * .9) / rr); if (r() > .035 || roja) losa(rr * px, r1 * px, a, a + da, roja ? rojos[r() * 3 | 0] : rgbj(grises[r() * 8 | 0], r, 18)); a += da } rr = r1 }
    c.globalCompositeOperation = "source-atop"; for (let k = 0; k < 260; k++) { const a = r() * 6.283, d = Math.sqrt(r()) * 12.2 * px, s = 20 + r() * 90, X0 = C + Math.cos(a) * d, Y0 = C + Math.sin(a) * d; const gr = c.createRadialGradient(X0, Y0, 0, X0, Y0, s); const cl2 = r() < .6 ? "210,180,138" : "70,52,38"; gr.addColorStop(0, `rgba(${cl2},.28)`); gr.addColorStop(1, `rgba(${cl2},0)`); c.fillStyle = gr; c.fillRect(X0 - s, Y0 - s, s * 2, s * 2) }
    for (let k = 0; k < 12000; k++) { const a = r() * 6.283, d = Math.sqrt(r()) * 12.2 * px; c.fillStyle = r() < .5 ? "rgba(60,44,30,.25)" : "rgba(240,225,200,.25)"; c.fillRect(C + Math.cos(a) * d, C + Math.sin(a) * d, 2, 2) }
    c.globalCompositeOperation = "destination-out"; for (let k = 0; k < 500; k++) { const a = r() * 6.283, d = (11.2 + r() * 1.6) * px, s = 14 + r() * 60, X0 = C + Math.cos(a) * d, Y0 = C + Math.sin(a) * d; const gr = c.createRadialGradient(X0, Y0, 0, X0, Y0, s); gr.addColorStop(0, "rgba(0,0,0,.9)"); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(X0 - s, Y0 - s, s * 2, s * 2) } c.globalCompositeOperation = "source-over" }); return { c, z } })();
const M_SUELO_DECAL = (t, bs) => new THREE.MeshStandardMaterial({ map: t.c, bumpMap: t.z, bumpScale: bs, roughness: .88, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -6 });
const geoSobreSuelo = (x0, x1, z0, z1, nx, nz, dy = .02) => { const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, nz); g.rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, 0, (z0 + z1) / 2); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, SUELO(p.getX(i), p.getZ(i)) + dy); g.computeVertexNormals(); return g };
const PLAZA_M = (() => { const m = new THREE.Mesh(geoSobreSuelo(-13.5, 13.5, -13.5, 13.5, 40, 40), M_SUELO_DECAL(T_PLAZA, 5)); m.receiveShadow = true; m.renderOrder = -.3; scene.add(m); return m })();
const T_CALLE = (() => { const [c, z] = pintarDoble(512, 2048, (c, z, w, h) => { const r = rng(2780); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
    for (let k = 0; k < 2600; k++) { const y = r() * h, x = w / 2 + (r() + r() + r() - 1.5) * w * .42, s = 16 + r() * 50, e = Math.min(1, y / 160, (h - y) / 160); c.fillStyle = `rgba(${150 + r() * 26 | 0},${122 + r() * 22 | 0},${92 + r() * 18 | 0},${.22 * e})`; c.beginPath(); c.ellipse(x, y, s, s * 1.3, 0, 0, 7); c.fill() }
    for (const dx of [-70, 70]) for (const [g, col, lw] of [[c, "rgba(90,68,48,.5)", 16], [z, "rgba(30,30,30,.7)", 18], [z, "rgba(215,215,215,.5)", 5]]) { g.strokeStyle = col; g.lineWidth = lw; g.lineCap = "round"; g.beginPath(); for (let y = 60; y < h - 60; y += 20) { const x = w / 2 + dx + Math.sin(y * .006) * 22 + Math.sin(y * .021) * 6 + (lw === 5 ? 11 : 0); y > 60 ? g.lineTo(x, y) : g.moveTo(x, y) } g.stroke() }
    for (let k = 0; k < 120; k++) { const x = w * (.12 + r() * .76), y = 80 + r() * (h - 160), s = 14 + r() * 26, a = r() * 3, n = 5 + (r() * 4 | 0), pts = Array.from({ length: n }, (_, i) => { const q = (i + (r() - .5) * .7) / n * 6.283 + a, d = s * (.6 + r() * .7); return [x + Math.cos(q) * d, y + Math.sin(q) * d * .8] });
      for (const [g, f, o] of [[c, "rgba(50,36,24,.5)", 3], [c, rgbj(["#a89880", "#9a8a74", "#b4a48c", "#8c7c68"][r() * 4 | 0], r, 20), 0], [z, "rgba(20,20,20,.8)", 3], [z, "rgba(240,240,240,.9)", 0]]) { g.fillStyle = f; g.beginPath(); pts.forEach(([px, py], i) => i ? g.lineTo(px + o, py + o) : g.moveTo(px + o, py + o)); g.fill() } }
    for (let k = 0; k < 420; k++) { const x = w * (.15 + r() * .7), y = 60 + r() * (h - 120), a = (r() - .5) * .5; for (const g of [c, z]) { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = g === c ? "rgba(84,62,44,.35)" : "rgba(40,40,40,.5)"; g.beginPath(); g.ellipse(0, 0, 5, 9, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(0, 13, 4, 4, 0, 0, 7); g.fill(); g.restore() } }
    for (let k = 0; k < 700; k++) { const x = r() * w, y = r() * h, a = r() * 6.3; c.strokeStyle = "rgba(226,200,130,.5)"; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 12, y + Math.sin(a) * 12); c.stroke() }
    c.globalCompositeOperation = "destination-in"; const m = c.createLinearGradient(0, 0, w, 0); m.addColorStop(0, "rgba(0,0,0,0)"); m.addColorStop(.2, "#000"); m.addColorStop(.8, "#000"); m.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = m; c.fillRect(0, 0, w, h); c.globalCompositeOperation = "source-over" }); return { c, z } })();
const CALLE_M = (() => { const m = new THREE.Mesh(geoSobreSuelo(-4.4, 4.4, 6, 54, 8, 40, .025), M_SUELO_DECAL(T_CALLE, 4)); m.receiveShadow = true; m.renderOrder = -.2; scene.add(m); return m })();

// ---------- adobe: revoque de barro pintado entero (manchas, pasadas de llana, paja, chorreaduras, base mojada, revoque caído con ladrillos de adobe, grietas)
const T_ADOBE = (seed, base, o = {}) => pintarDoble(o.w || 1024, o.h || 1024, (c, z, w, h) => { const r = rng(seed), A = w * h / 1048576; c.fillStyle = base; c.fillRect(0, 0, w, h); z.fillStyle = "#8c8c8c"; z.fillRect(0, 0, w, h);
  for (let k = 0; k < 170 * A; k++) { const x = r() * w, y = r() * h, s = 40 + r() * 170, cl2 = r() < .5 ? "70,44,24" : "255,240,214", gr = c.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, `rgba(${cl2},${.07 + r() * .1})`); gr.addColorStop(1, `rgba(${cl2},0)`); c.fillStyle = gr; c.fillRect(x - s, y - s, s * 2, s * 2);
    const gz = z.createRadialGradient(x, y, 0, x, y, s); gz.addColorStop(0, r() < .5 ? "rgba(60,60,60,.3)" : "rgba(200,200,200,.3)"); gz.addColorStop(1, "rgba(128,128,128,0)"); z.fillStyle = gz; z.fillRect(x - s, y - s, s * 2, s * 2) }
  for (let k = 0; k < 520 * A; k++) { const x = r() * w, y = r() * h, L = 30 + r() * 120, a = (r() - .5) * .9, cv = (r() - .5) * 40; for (const [g, col] of [[c, r() < .5 ? `rgba(80,52,30,${.05 + r() * .09})` : `rgba(255,244,222,${.05 + r() * .1})`], [z, r() < .5 ? "rgba(50,50,50,.22)" : "rgba(215,215,215,.22)"]]) { g.strokeStyle = col; g.lineWidth = 5 + r() * 14; g.lineCap = "round"; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * L / 2, y + Math.sin(a) * L / 2 + cv, x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke() } }
  for (let k = 0; k < 3200 * A; k++) { const x = r() * w, y = r() * h, a = r() * 6.3, L = 4 + r() * 9; c.strokeStyle = r() < .7 ? `rgba(236,214,150,${.25 + r() * .3})` : "rgba(70,46,26,.3)"; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); c.stroke(); z.strokeStyle = "rgba(225,225,225,.35)"; z.lineWidth = 1.5; z.beginPath(); z.moveTo(x, y); z.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); z.stroke() }
  // sol arriba, chorreaduras de lluvia desde el pretil y la base oscura y gastada
  { const gr = c.createLinearGradient(0, 0, 0, h * .16); gr.addColorStop(0, "rgba(255,246,226,.3)"); gr.addColorStop(1, "rgba(255,246,226,0)"); c.fillStyle = gr; c.fillRect(0, 0, w, h * .16) }
  for (let k = 0; k < 46 * w / 1024; k++) { const x = r() * w, L = 90 + r() * 420, an = 5 + r() * 22, gr = c.createLinearGradient(0, 20, 0, 20 + L); gr.addColorStop(0, `rgba(64,40,24,${.2 + r() * .22})`); gr.addColorStop(1, "rgba(64,40,24,0)"); c.fillStyle = gr; c.beginPath(); c.moveTo(x - an, 16); c.lineTo(x + an, 16); c.lineTo(x + an * .3 + (r() - .5) * 10, 20 + L); c.lineTo(x - an * .3, 20 + L); c.fill() }
  { const gr = c.createLinearGradient(0, h * .8, 0, h); gr.addColorStop(0, "rgba(58,38,24,0)"); gr.addColorStop(1, "rgba(58,38,24,.5)"); c.fillStyle = gr; c.fillRect(0, h * .8, w, h * .2) }
  // revoque caído: se ven los ladrillos de adobe (más hundidos)
  const parche = (cx, cy, s) => { const pts = Array.from({ length: 11 }, (_, i) => { const a = i / 11 * 6.283, d = s * (.55 + r() * .6); return [cx + Math.cos(a) * d * 1.3, cy + Math.sin(a) * d] }); for (const g of [c, z]) { g.save(); g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.clip();
      g.fillStyle = g === c ? "#6a4a30" : "#303030"; g.fillRect(cx - s * 2, cy - s * 2, s * 4, s * 4); for (let y = cy - s * 2, f = 0; y < cy + s * 2; y += 30, f++) for (let x = cx - s * 2 - (f % 2) * 34; x < cx + s * 2; x += 68) { g.fillStyle = g === c ? rgbj(["#a8794e", "#96683f", "#b48558", "#8a5e3a"][r() * 4 | 0], r, 20) : `rgb(${90 + r() * 40 | 0},${90 + r() * 40 | 0},${90 + r() * 40 | 0})`; g.fillRect(x + 3, y + 3, 62, 24) } g.restore();
      g.strokeStyle = g === c ? "rgba(60,38,22,.7)" : "rgba(240,240,240,.8)"; g.lineWidth = g === c ? 3 : 5; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.stroke() } };
  const np = o.parches ?? 6; for (let k = 0; k < np; k++) parche(r() * w, k < np * .6 ? h * (.86 + r() * .12) : h * (.1 + r() * .7), 40 + r() * 80);
  for (let k = 0; k < 12 * A; k++) { let x = r() * w, y = r() < .5 ? 0 : r() * h; const n = 10 + r() * 22 | 0; c.strokeStyle = `rgba(46,28,16,${.5 + r() * .4})`; c.lineWidth = 1.5 + r() * 2.5; z.strokeStyle = "rgba(0,0,0,.9)"; z.lineWidth = 4 + r() * 4; c.beginPath(); z.beginPath(); c.moveTo(x, y); z.moveTo(x, y); for (let q = 0; q < n; q++) { x += (r() - .5) * 30; y += 8 + r() * 26; c.lineTo(x, y); z.lineTo(x, y) } c.stroke(); z.stroke() }
  if (o.hollin) { const gr = c.createRadialGradient(w / 2, h * .5, 0, w / 2, h * .5, w * .5); gr.addColorStop(0, "rgba(20,14,10,.75)"); gr.addColorStop(1, "rgba(20,14,10,0)"); c.fillStyle = gr; c.fillRect(0, 0, w, h) } if (o.extra) o.extra(c, z, w, h, r) });
const ADOBE_C = ["#c9a27a", "#b98c64", "#d8ba94", "#c08e68", "#e4d6bc", "#aa7e58", "#d2a884", "#c4b090"];
const M_ADOBE = ADOBE_C.map((c, i) => { const [t, z] = T_ADOBE(2800 + i, c, { parches: 4 + i % 4 }); return new THREE.MeshStandardMaterial({ map: t, bumpMap: z, bumpScale: 4.5, roughness: .96 }) });
// madera clara neutra (se tiñe con el color de cada puerta): tablas verticales con veta, clavos y pintura saltada
const T_TABLA_N = (() => { const [c, z] = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(2830); let x = 0; z.fillStyle = "#909090"; z.fillRect(0, 0, w, h); while (x < w) { const pw = 70 + r() * 50; c.fillStyle = rgbj("#e6e0d6", r, 22); c.fillRect(x, 0, pw, h); for (let k = 0; k < 40; k++) { const xx = x + r() * pw; c.strokeStyle = r() < .5 ? "rgba(90,74,60,.25)" : "rgba(255,255,255,.3)"; c.lineWidth = 1 + r() * 2; c.beginPath(); c.moveTo(xx, 0); for (let y = 0; y <= h; y += 40) c.lineTo(xx + (r() - .5) * 6, y); c.stroke(); z.strokeStyle = "rgba(60,60,60,.3)"; z.lineWidth = 2; z.beginPath(); z.moveTo(xx, 0); z.lineTo(xx, h); z.stroke() }
      for (let k = 0; k < 7; k++) { const px = x + r() * pw, py = r() * h, s = 6 + r() * 26; c.fillStyle = "rgba(150,120,90,.75)"; c.beginPath(); c.ellipse(px, py, s * .6, s, r(), 0, 7); c.fill(); z.fillStyle = "rgba(40,40,40,.6)"; z.beginPath(); z.ellipse(px, py, s * .6, s, 0, 0, 7); z.fill() }
      c.fillStyle = "rgba(40,28,20,.8)"; c.fillRect(x + pw - 4, 0, 4, h); z.fillStyle = "#000"; z.fillRect(x + pw - 5, 0, 6, h); x += pw } }); return { c, z } })();
const PUERTA_C = ["#2f9a94", "#c0452c", "#dba322", "#3d62a8", "#5d8f3c", "#8d4d82", "#d6744c", "#e9e2d0", "#27706e"];
const M_PUERTA = PUERTA_C.map(c => new THREE.MeshStandardMaterial({ map: T_TABLA_N.c, bumpMap: T_TABLA_N.z, bumpScale: 3, roughness: .78, color: c }));
const M_MADERA = new THREE.MeshStandardMaterial({ map: T_TABLA_N.c, bumpMap: T_TABLA_N.z, bumpScale: 3.5, roughness: .9, color: "#8a6444" });
const M_MADERA_V = new THREE.MeshStandardMaterial({ map: T_TABLA_N.c, bumpMap: T_TABLA_N.z, bumpScale: 3.5, roughness: .95, color: "#b09a80" });   // madera vieja, gris
const M_OSCURO = new THREE.MeshBasicMaterial({ color: "#150e0a" });
const M_HIERRO = new THREE.MeshStandardMaterial({ color: "#3a3430", roughness: .55, metalness: .7 });
const T_TECHO_B = (() => { const [c, z] = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(2840); c.fillStyle = "#b39472"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h); for (let k = 0; k < 500; k++) { const x = r() * w, y = r() * h, s = 8 + r() * 46; c.fillStyle = r() < .5 ? "rgba(90,66,44,.14)" : "rgba(240,220,190,.14)"; c.beginPath(); c.ellipse(x, y, s, s * .7, r() * 3, 0, 7); c.fill(); z.fillStyle = r() < .5 ? "rgba(60,60,60,.25)" : "rgba(200,200,200,.25)"; z.beginPath(); z.ellipse(x, y, s, s * .7, 0, 0, 7); z.fill() }
    for (let k = 0; k < 30; k++) { let x = r() * w, y = r() * h; c.strokeStyle = "rgba(60,40,26,.6)"; c.lineWidth = 2; z.strokeStyle = "#000"; z.lineWidth = 4; c.beginPath(); z.beginPath(); c.moveTo(x, y); z.moveTo(x, y); for (let q = 0; q < 8; q++) { x += (r() - .5) * 60; y += (r() - .5) * 60; c.lineTo(x, y); z.lineTo(x, y) } c.stroke(); z.stroke() } }); return { c, z } })();
const M_TECHO_B = new THREE.MeshStandardMaterial({ map: T_TECHO_B.c, bumpMap: T_TECHO_B.z, bumpScale: 4, roughness: 1 });
const M_LAJA = new THREE.MeshStandardMaterial({ color: "#9c8c78", roughness: .9, bumpMap: T_ARENA_D.z, bumpScale: 3 });
const geoUV = (g, fu, fv) => { const p = g.attributes.position, u = g.attributes.uv; for (let i = 0; i < p.count; i++) u.setXY(i, fu(p.getX(i), p.getY(i), p.getZ(i)), fv(p.getX(i), p.getY(i), p.getZ(i))); return g };

// ---------- zonas: lo que queda libre para personajes y cámara, y el registro de lo ocupado (para que nada se superponga)
const zonaLibre = (x, z, r = 0) => Math.hypot(x, z) < 9.6 + r || (Math.abs(x) < 3.3 + r && z > 7 - r && z < 47 + r) || (Math.abs(x) < 12.3 + r && z < -17 + r && z > -153) || Math.hypot(x, z + 160) < 4.3 + r || Math.hypot(x - TORRE[0], z - TORRE[1]) < 7.6 + r;
const OCUP = [], RECTS = [];
const enRect = (R, x, z, m = 0) => { const c = Math.cos(R.ry), s = Math.sin(R.ry), dx = x - R.x, dz = z - R.z, lx = dx * c - dz * s, lz = dx * s + dz * c; return Math.abs(lx) < R.w / 2 + m && Math.abs(lz) < R.d / 2 + m };
const libreEn = (x, z, r = .5, o = {}) => { if (!o.zona && zonaLibre(x, z, r)) return false; for (const R of RECTS) if (R !== o.salvo && enRect(R, x, z, r + (o.mc ?? .15))) return false; for (const q of OCUP) if (Math.hypot(x - q.x, z - q.z) < r + q.r) return false; return true };
const ocupa = (x, z, r) => { OCUP.push({ x, z, r }); return true };
// los lugares de las frases (se reservan antes de repartir las casas)
const PUNTOS = { boda: [-13, 12], bebe: [-20, 28], escuela: [29, -15], gallos: [-28, -14], corral: [20, 21], pozo: [-13, -4], mercado: [15, 3] };
const PUNTOS_R = { boda: 5.6, bebe: 3.6, escuela: 7.5, gallos: 4.8, corral: 5.2, pozo: 2.6, mercado: 5.6 };

// ---------- la casa de adobe: muros gruesos con hueco real en puertas y ventanas, esquinas redondas, pretil, vigas que asoman
const CASA_T = .44, CASA_R = .55;
function muroAdobe(L, W, H, ab, M, uvo) { const T = CASA_T, xs = ab.slice().sort((a, b) => a.x0 - b.x0); let x = -W / 2;
  const caja = (x0, x1, y0, y1) => { if (x1 - x0 < .02 || y1 - y0 < .02) return; const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, T); g.translate((x0 + x1) / 2, (y0 + y1) / 2, -T / 2); geoUV(g, px => uvo.inv ? 1 - (.03 + (px + W / 2) / W * .94) : .03 + (px + W / 2) / W * .94, (px, py) => (uvo.y0 + py) / uvo.H); L.add("pared", g, M) };
  xs.forEach(a => { caja(x, a.x0, 0, H); caja(a.x0, a.x1, a.y1, H); caja(a.x0, a.x1, 0, a.y0); x = a.x1 }); caja(x, W / 2, 0, H) }
// un cuerpo (planta baja o piso de arriba). B = matriz base. aberturas: lista por muro [frente, derecha, fondo, izquierda]
function cuerpoAdobe(L, B, w, d, h, o, r) { const T = CASA_T, R = CASA_R, Hp = h + (o.pretil ?? .55), uvo = { y0: o.y0 || 0, H: o.Htot || Hp };
  const MU = [TM(0, 0, d / 2), TM(w / 2, 0, 0, 0, Math.PI / 2), TM(0, 0, -d / 2, 0, Math.PI), TM(-w / 2, 0, 0, 0, -Math.PI / 2)], LW = [w - 2 * R, d - 2 * R, w - 2 * R, d - 2 * R], add = (k, g, m) => L.add(k, g, B.clone().multiply(m));
  const LB = { add: (k, g, m) => add(k, g, m) };
  for (let s = 0; s < 4; s++) { const ab = o.ab[s] || [], M = MU[s]; muroAdobe({ add: (k, g, m) => add(k, g, m) }, LW[s], Hp, ab, M, { ...uvo, inv: s % 2 === 1 });
    // la tapa redondeada del pretil (un poco despareja)
    add("pared", geoUV(RB(LW[s] + .1, .3, T + .1, .14), px => .5 + px * .1, (px, py) => .97 + py * .05), M.clone().multiply(TM(0, Hp + .03, -T / 2)));
    ab.forEach(a => { const cx = (a.x0 + a.x1) / 2, an = a.x1 - a.x0, al = a.y1 - a.y0;
      // dintel de madera (asoma), y adentro lo oscuro de la casa
      add("madera", new THREE.BoxGeometry(an + .5, .2, T + .1), M.clone().multiply(TM(cx, a.y1 + .1, -T / 2 + .03)));
      add("oscuro", new THREE.PlaneGeometry(an + .04, al + .04), M.clone().multiply(TM(cx, a.y0 + al / 2, -T - .02)));
      if (a.puerta) { const ang = a.abre || 0; // marco, hoja de tablas con travesaños, argolla, umbral de piedra
        for (const sx of [-1, 1]) add("madera", new THREE.BoxGeometry(.1, al, T * .7), M.clone().multiply(TM(cx + sx * (an / 2 - .05), al / 2, -T * .5)));
        const hoja = M.clone().multiply(TM(cx - an / 2 + .1, 0, -T + .14, 0, -ang, 0)); add("color", new THREE.BoxGeometry(an - .2, al - .04, .07), hoja.clone().multiply(TM((an - .2) / 2, al / 2, 0)));
        for (const yy of [.45, al / 2, al - .45]) add("madera", new THREE.BoxGeometry(an - .26, .16, .04), hoja.clone().multiply(TM((an - .2) / 2, yy, .05)));
        add("hierro", new THREE.TorusGeometry(.09, .018, 6, 14), hoja.clone().multiply(TM(an - .45, al * .48, .09))); add("hierro", new THREE.CylinderGeometry(.03, .03, .05, 8), hoja.clone().multiply(TM(an - .45, al * .48 + .09, .07, Math.PI / 2)));
        add("laja", RB(an + .7, .16, .8, .06), M.clone().multiply(TM(cx, .02, .2))) }
      else { // ventana: alféizar, marco, rejas de palo y postigos de color (abiertos contra la pared, a medio abrir o cerrados)
        add("pared", RB(an + .36, .14, T + .3, .05), M.clone().multiply(TM(cx, a.y0 - .05, -T / 2 + .1)));
        for (const sx of [-1, 1]) add("madera", new THREE.BoxGeometry(.08, al, .1), M.clone().multiply(TM(cx + sx * (an / 2 - .04), a.y0 + al / 2, -.08)));
        if (a.reja) for (let k = 1; k <= 3; k++) add("madera", new THREE.CylinderGeometry(.028, .028, al, 6), M.clone().multiply(TM(a.x0 + an * k / 4, a.y0 + al / 2, -T * .5)));
        const pa = a.post ?? 0; if (pa >= 0) for (const sx of [-1, 1]) { const hm = M.clone().multiply(TM(cx + sx * an / 2, a.y0 + al / 2, .02, 0, sx * (Math.PI - pa * 2.6), 0)); add("color", new THREE.BoxGeometry(an / 2 - .02, al, .05), hm.clone().multiply(TM(-sx * (an / 4), 0, 0)));
          for (const yy of [-al * .3, al * .3]) for (const zz of [-.035, .035]) add("madera", new THREE.BoxGeometry(an / 2 - .08, .08, .03), hm.clone().multiply(TM(-sx * (an / 4), yy, zz))) } } }) }
  // esquinas redondas (un poco más anchas abajo) con su remate
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, -1], [-1, 1]]) { const g = new THREE.CylinderGeometry(R, R * (o.y0 ? 1 : 1.1), Hp, 14, 1, true); g.translate(0, Hp / 2, 0); geoUV(g, (x, y, z) => .1 + (Math.atan2(z, x) / 6.283 + .5) * .5, (x, y) => (uvo.y0 + y) / uvo.H); add("pared", g, TM(sx * (w / 2 - R), 0, sz * (d / 2 - R)));
    const cap = new THREE.SphereGeometry(R * 1.04, 14, 8, 0, 6.283, 0, Math.PI / 2); cap.scale(1, .42 + r() * .5, 1); geoUV(cap, x => .5 + x * .2, (x, y) => .96 + y * .05); add("pared", cap, TM(sx * (w / 2 - R), Hp, sz * (d / 2 - R))) }
  // el techo de barro (cierra arriba), el piso de adentro y las vigas que asoman adelante y atrás
  add("techo", new THREE.BoxGeometry(w - T, .3, d - T), TM(0, h - .05, 0));
  const nv = Math.max(3, Math.round((w - 1.4) / .78)); for (let k = 0; k < nv; k++) { const x = lerp(-(w / 2 - R - .25), w / 2 - R - .25, k / (nv - 1)), sal = .42 + r() * .3, g = new THREE.CylinderGeometry(.1 + r() * .025, .11, d + sal * 2, 9); add("madera", g, TM(x, h - .32, (r() - .5) * .1, Math.PI / 2, 0, 0)) }
  // gárgola de madera (canal de desagüe) en un costado
  if (o.canal !== false) { const s = r() < .5 ? 1 : -1; add("madera", new THREE.BoxGeometry(.75, .06, .22), TM(s * (w / 2 + .28), h + .12, (r() - .5) * d * .5, 0, 0, -s * .12)); for (const q of [-1, 1]) add("madera", new THREE.BoxGeometry(.75, .1, .03), TM(s * (w / 2 + .28), h + .17, (r() - .5) * .01 + q * .11, 0, 0, -s * .12)) }
  return { Hp } }
const escaleraMano = (L, M, alto, k = "madera") => { const an = .62, L2 = alto + .5; for (const s of [-1, 1]) L.add(k, new THREE.CylinderGeometry(.045, .055, L2, 7), M.clone().multiply(TM(s * an / 2, L2 / 2, 0))); for (let y = .4; y < L2 - .15; y += .42) L.add(k, new THREE.CylinderGeometry(.032, .032, an + .14, 6), M.clone().multiply(TM(0, y, 0, 0, 0, Math.PI / 2))) };
const CASAS_A = [];
function casaAdobe(x, z, ry, w, d, h, seed, o = {}) { const r = rng(seed), g = new THREE.Group(); g.position.set(x, SUELO(x, z) - .04, z); g.rotation.y = ry; scene.add(g); const L = lote(), I = new THREE.Matrix4();
  const dos = o.dos ?? r() < .36, h2 = 3.9 + r() * .5, w2 = Math.max(3.9, w * (.5 + r() * .14)), d2 = d - .5, lado = r() < .5 ? -1 : 1, Htot = dos ? h + h2 + 1 : h + .6;
  // aberturas de la planta baja: puerta al frente (corrida a un lado), una o dos ventanas al frente, ventanas a los costados y atrás
  const px = (o.puertaX ?? (r() - .5) * (w - 4.6)), wd = 1.6, hd = 3.15, F = [{ x0: px - wd / 2, x1: px + wd / 2, y0: 0, y1: hd, puerta: 1, abre: o.abre ?? (r() < .3 ? .5 + r() * .7 : 0) }], LW = w - 2 * CASA_R;
  const vent = (cx, an = 1.05, al = 1.15, y0 = 1.75) => ({ x0: cx - an / 2, x1: cx + an / 2, y0, y1: y0 + al, reja: r() < .55, post: o.sinPostigos ? -1 : (r() < .25 ? -1 : r() < .5 ? 0 : r() * .6) });
  for (const s of [-1, 1]) { const cx = px + s * (wd / 2 + 1.25 + r() * .5); if (Math.abs(cx) + .7 < LW / 2 && (o.ventF ?? r() < .8)) F.push(vent(cx)) }
  const lat = () => r() < .7 ? [vent((r() - .5) * (d - 3.4), .9 + r() * .3, 1 + r() * .3)] : [], atras = r() < .6 ? [vent((r() - .5) * (w - 3.6))] : [];
  cuerpoAdobe(L, I, w, d, h, { ab: [F, lat(), atras, lat()], Htot, pretil: dos ? .5 : .5 + r() * .25 }, r);
  if (dos) { const B2 = TM(lado * ((w - w2) / 2 - .13), h + .12, -((d - d2) / 2 - .13)); cuerpoAdobe(L, B2, w2, d2, h2, { ab: [[], [], r() < .5 ? [vent(0, .9, 1)] : [], [], ].map((a, i) => i === (lado > 0 ? 3 : 1) ? [{ x0: -.7, x1: .7, y0: 0, y1: 2.95, puerta: 1, abre: r() < .4 ? .8 : 0 }] : i === 0 ? [vent((r() - .5) * (w2 - 3), .95, 1.05, 1.5)] : a), y0: h + .12, Htot, pretil: .45 + r() * .2, canal: r() < .5 }, r);
    // escalera de mano de la terraza al techo de arriba, y otra del piso a la terraza
    escaleraMano(L, B2.clone().multiply(TM(-lado * (w2 / 2 + .98), 0, d2 / 2 - 1.1, 0, lado * Math.PI / 2, 0)).multiply(TM(0, 0, 0, .2, 0, 0)), h2 + .6) }
  // interior oscuro (para que por los huecos no se vea el otro lado)
  L.add("oscuro", new THREE.BoxGeometry(w - 2 * CASA_T - .1, h - .3, d - 2 * CASA_T - .1), TM(0, h / 2 - .1, 0));
  // zócalo desparejo: barro acumulado al pie del muro
  for (let k = 0; k < 7; k++) { const s = k % 4, t = (r() - .5) * .8, an = 1.2 + r() * 1.8, gg = new THREE.SphereGeometry(1, 10, 6, 0, 6.283, 0, Math.PI / 2); gg.scale(an / 2, .25 + r() * .35, .32); geoUV(gg, px => .5 + px * .2, (px, py) => .02 + py * .1);
    const P = s === 0 ? TM(t * (w - 2), 0, d / 2) : s === 1 ? TM(w / 2, 0, t * (d - 2), 0, Math.PI / 2) : s === 2 ? TM(t * (w - 2), 0, -d / 2) : TM(-w / 2, 0, t * (d - 2), 0, Math.PI / 2); if (s === 0 && Math.abs(t * (w - 2) - px) < 1.6) continue; L.add("pared", gg, P) }
  const mats = { pared: M_ADOBE[o.adobe ?? (seed % M_ADOBE.length)], madera: r() < .5 ? M_MADERA : M_MADERA_V, color: M_PUERTA[o.color ?? (r() * M_PUERTA.length | 0)], oscuro: M_OSCURO, techo: M_TECHO_B, hierro: M_HIERRO, laja: M_LAJA };
  const ms = L.fin(g, mats); ms.oscuro.castShadow = false; const C = { g, x, z, ry, w, d, h, F, dos, h2, w2, d2, lado, px, seed, mats, Hp: h + .5, r }; CASAS_A.push(C); RECTS.push(C); return C }

// ---------- el pueblo: la casa del narrador, dos filas sobre la calle principal y el resto alrededor de la plaza (48 casas)
Object.keys(PUNTOS).forEach(k => ocupa(PUNTOS[k][0], PUNTOS[k][1], PUNTOS_R[k]));
const MI_CASA = casaAdobe(CASA_MIA[0], CASA_MIA[1], -Math.PI / 2, 6.6, 5.2, 4.6, 2901, { dos: false, adobe: 2, color: 0, puertaX: -1.2, abre: 0, ventF: true });
{ const r = rng(2905), lejos = (x, z, m = 9.4) => CASAS_A.every(c => Math.hypot(c.x - x, c.z - z) > m);
  const pon = (x, z, ry) => { const w = 5.6 + r() * 2.6, d = 4.8 + r() * 1.3, R = Math.hypot(w, d) / 2 + .3; if (!lejos(x, z, 4.4 + R) || zonaLibre(x, z, R - .6) || OCUP.some(q => Math.hypot(q.x - x, q.z - z) < q.r + R - .8)) return false; casaAdobe(x, z, ry, w, d, 4.3 + r() * .8, 2910 + CASAS_A.length * 3); return true };
  for (const z of [25.6, 35, 44.6]) pon(9.4 + r() * .6, z, -Math.PI / 2); for (const z of [22.5, 31.8, 41.2, 50.4]) pon(-9.4 - r() * .6, z, Math.PI / 2);
  // primer anillo, mirando a la plaza
  for (let k = 0; k < 16; k++) { const a = k / 16 * 6.283 + .2, x = Math.cos(a) * 22.5, z = Math.sin(a) * 21.5; pon(x, z, Math.atan2(-x, -z)) }
  for (let k = 0; k < 4000 && CASAS_A.length < 48; k++) { const a = r() * 6.283, d = 26 + r() * 30, x = Math.cos(a) * d, z = Math.sin(a) * d * 1.04 + 5; if (z < -40) continue; const ry = (Math.abs(x) < 30 && z > 12) ? (x > 0 ? -1 : 1) * Math.PI / 2 + (r() < .3 ? Math.PI : 0) : Math.atan2(-x, -z) + (r() - .5) * .5; pon(x, z, ry) } }

// ---------- LA TORRE: base de piedra, cuerpo de adobe con NEVER pintado al sur, escalera exterior en espiral de 92 escalones, plataforma de tablas
const cilEntre = (a, b, r, seg = 7, r2 = r) => { const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b), d = Bv.clone().sub(A); return [new THREE.CylinderGeometry(r2, r, 1, seg), MZ(A.clone().add(Bv).multiplyScalar(.5), d, new THREE.Vector3(1, d.length(), 1))] };
const T_SOGA = tex(64, 64, (g, w, h) => { g.fillStyle = "#b89a6a"; g.fillRect(0, 0, w, h); for (let k = -8; k < 16; k++) { g.strokeStyle = k % 2 ? "rgba(70,50,28,.7)" : "rgba(240,220,170,.5)"; g.lineWidth = 4; g.beginPath(); g.moveTo(k * 8, 0); g.lineTo(k * 8 + 32, h); g.stroke() } }, [1, 6]);
const M_SOGA = new THREE.MeshStandardMaterial({ map: T_SOGA, bumpMap: T_SOGA, bumpScale: 2, roughness: 1 });
const TORRE_RW = y => y < 3 ? 4.32 : lerp(4.2, 3.5, (y - 3) / 13);   // radio del muro a cada altura
const ESC_N = 92, ESC_D = 2.5 * 6.283 / ESC_N, ESC_T0 = -.25, ESC_ANG = k => ESC_T0 - k * ESC_D, ESC_Y = k => (k + 1) * TORRE_H / ESC_N;
// posición (mundo) del escalón k (0…91) para parar o hacer subir a un personaje: [x, y, z]; el 92 es la plataforma
const ESCALON_W = k => { const kk = cl(k, 0, ESC_N - 1), a = ESC_ANG(kk), y = ESC_Y(kk), R = TORRE_RW(y) + .68; return [TORRE[0] + Math.sin(a) * R, y, TORRE[1] + Math.cos(a) * R] };
const T_TORRE = T_ADOBE(2850, "#c49a70", { w: 2048, h: 2048, parches: 16, extra(c, z, w, h, r) {
  // hileras de mechinales (huecos de andamio) y una guarda pintada arriba
  for (const v of [.93, .9]) { c.fillStyle = v > .92 ? "rgba(150,62,40,.75)" : "rgba(236,226,200,.7)"; for (let x = 0; x < w; x += 64) { c.beginPath(); c.moveTo(x, h * (1 - v)); c.lineTo(x + 32, h * (1 - v) - 34); c.lineTo(x + 64, h * (1 - v)); c.lineTo(x + 32, h * (1 - v) + 10); c.fill() } }
  c.fillStyle = "rgba(150,62,40,.6)"; c.fillRect(0, h * .125, w, 12); c.fillRect(0, h * .04, w, 10);
  // NEVER: pintado a brocha con cal, chorreado y gastado (centro en u = .5 → sur)
  const T = mk(760, 470), g = T.getContext("2d"), yC = h * (1 - (9.4 - 3) / 13), an = .8 / 6.283 * w * 2; g.textAlign = "center"; g.textBaseline = "middle"; g.font = "900 380px Impact, 'Arial Black', sans-serif"; const m = g.measureText("NEVER").width, sx = Math.min(1.15, 700 / m);
  const dib = (col, dx, dy) => { g.save(); g.translate(380 + dx, 215 + dy); g.scale(sx, 1); g.fillStyle = col; g.fillText("NEVER", 0, 0); g.restore() }; dib("rgba(70,30,18,.75)", 7, 8); dib("#ddd2b8", 0, 0);
  for (let k = 0; k < 22; k++) { const x = 60 + r() * 640, L = 30 + r() * 90; g.strokeStyle = "rgba(221,210,184,.9)"; g.lineWidth = 4 + r() * 7; g.lineCap = "round"; g.beginPath(); g.moveTo(x, 330 + r() * 20); g.lineTo(x + (r() - .5) * 4, 360 + L); g.stroke() }
  g.globalCompositeOperation = "destination-out"; for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(0,0,0,${.3 + r() * .6})`; const x = r() * 760, y = r() * 470; g.fillRect(x, y, 2 + r() * 26, 1 + r() * 3) } for (let k = 0; k < 60; k++) { g.fillStyle = "rgba(0,0,0,.8)"; g.beginPath(); g.ellipse(r() * 760, 60 + r() * 380, 3 + r() * 12, 2 + r() * 8, r() * 3, 0, 7); g.fill() }
  const W2 = an, H2 = 470 * (2.2 / 13 * h) / 300; c.drawImage(T, w / 2 - W2 / 2, yC - H2 / 2, W2, H2); z.globalAlpha = .35; z.filter = "brightness(3)"; z.drawImage(T, w / 2 - W2 / 2, yC - H2 / 2, W2, H2); z.filter = "none"; z.globalAlpha = 1 } });
const M_TORRE = new THREE.MeshStandardMaterial({ map: T_TORRE[0], bumpMap: T_TORRE[1], bumpScale: 6, roughness: .96 });
const M_SILLAR = ["#8d7b66", "#7a6a58", "#9c8a74", "#85705c"].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: .92, bumpMap: T_ARENA_D.z, bumpScale: 3 }));
const TORRE_G = new THREE.Group(); TORRE_G.position.set(TORRE[0], 0, TORRE[1]); scene.add(TORRE_G);
{ const r = rng(2860), L = lote(), H = TORRE_H;
  // cuerpo de adobe (un poco desparejo, hecho a mano)
  { const g = new THREE.CylinderGeometry(3.5, 4.2, 13, 80, 30, true), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), zz = p.getZ(i), a = Math.atan2(x, zz), k = 1 + (fbm2(Math.cos(a) * 2.2 + 5, y * .4 + Math.sin(a) * 2.2, 3) - .5) * .05; p.setX(i, x * k); p.setZ(i, zz * k) } g.computeVertexNormals(); g.rotateY(Math.PI); const m = new THREE.Mesh(g, M_TORRE); m.position.y = 9.5; m.castShadow = m.receiveShadow = true; TORRE_G.add(m) }
  // base de piedra: núcleo y sillares en hiladas (cada uno distinto, salidos del plomo)
  L.add("s1", new THREE.CylinderGeometry(4.22, 4.3, 3.7, 40, 1, true), TM(0, 1.25, 0)); L.add("s1", new THREE.TorusGeometry(4.27, .14, 8, 48), TM(0, 3.08, 0, Math.PI / 2));
  for (let f = 0; f < 7; f++) { const y = -.35 + f * .5; let a = r() * 6.283; const fin = a + 6.283; while (a < fin - .05) { const da = Math.min(fin - a, .2 + r() * .22), an = da * 4.3 - .05, rr = 4.3 + r() * .1; L.add("s" + (r() * 4 | 0), RB(an, .44, .5, .07), TM(Math.sin(a + da / 2) * rr, y + .25, Math.cos(a + da / 2) * rr, (r() - .5) * .04, a + da / 2, 0)); a += da } }
  // contrafuertes de piedra y la puertita del depósito (al sudoeste)
  for (const a of [.9, 2.5, 3.9, 5.4]) for (let k = 0; k < 5; k++) L.add("s" + (k % 4), RB(1.2 - k * .1, .56, 1.5 - k * .26, .08), TM(Math.sin(a) * (4.7 - k * .13), .1 + k * .55, Math.cos(a) * (4.7 - k * .13), 0, a, 0));
  { const a = -.95, M = TM(Math.sin(a) * 4.34, 0, Math.cos(a) * 4.34, 0, a, 0); L.add("oscuro", new THREE.BoxGeometry(1.3, 2.5, .2), M.clone().multiply(TM(0, 1.25, 0))); L.add("puerta", new THREE.BoxGeometry(1.2, 2.4, .08), M.clone().multiply(TM(0, 1.2, .1))); L.add("madera", new THREE.BoxGeometry(1.7, .24, .4), M.clone().multiply(TM(0, 2.62, .1))); for (const s of [-1, 1]) L.add("madera", new THREE.BoxGeometry(.18, 2.5, .36), M.clone().multiply(TM(s * .74, 1.25, .1))); for (const yy of [.5, 1.9]) L.add("hierro", new THREE.BoxGeometry(1.16, .1, .03), M.clone().multiply(TM(0, yy, .15))); L.add("hierro", new THREE.TorusGeometry(.1, .02, 6, 12), M.clone().multiply(TM(.38, 1.2, .16))) }
  // mechinales con sus palos (salen del muro en dos hileras) y aspilleras
  for (const [yy, n, f0] of [[13.9, 11, .3], [5.2, 9, 1.1]]) for (let k = 0; k < n; k++) { const a = f0 + k / n * 6.283, R = TORRE_RW(yy); L.add("madera", new THREE.CylinderGeometry(.07, .08, .9, 7), TM(Math.sin(a) * (R + .2), yy, Math.cos(a) * (R + .2), Math.PI / 2, a, 0)) }
  for (const [a, yy] of [[2.2, 8.3], [4.3, 11.5], [1.2, 12.6], [5.3, 6.4]]) { const R = TORRE_RW(yy), M = TM(Math.sin(a) * (R - .02), yy, Math.cos(a) * (R - .02), 0, a, 0); L.add("oscuro", new THREE.BoxGeometry(.34, 1.1, .12), M); L.add("madera", new THREE.BoxGeometry(.6, .12, .3), M.clone().multiply(TM(0, .62, .05))); L.add("s2", RB(.6, .12, .34, .04), M.clone().multiply(TM(0, -.6, .08))) }
  // la escalera: 92 escalones de laja sobre ménsulas de madera, con jabalcones, postes y baranda de soga del lado de afuera
  let ant = null; for (let k = 0; k < ESC_N; k++) { const a = ESC_ANG(k), y = ESC_Y(k), R = TORRE_RW(y), s = Math.sin(a), c = Math.cos(a), M = TM(s * (R + .68), y - .085, c * (R + .68), 0, a, 0);
    L.add("s" + (k % 4), RB(.82 + r() * .08, .14, 1.36, .04), M.clone().multiply(TM(0, 0, 0, (r() - .5) * .02, (r() - .5) * .05, 0))); L.add("madera", new THREE.CylinderGeometry(.075, .085, 1.7, 7), TM(s * (R + .55), y - .22, c * (R + .55), Math.PI / 2, a, 0));
    if (k % 2 === 0) L.add("madera", ...cilEntre([s * (R + 1.2), y - .28, c * (R + 1.2)], [s * (R - .05), y - 1.3, c * (R - .05)], .055));
    if (k % 3 === 0 || k === ESC_N - 1) { const p = [s * (R + 1.28), y + 1.12, c * (R + 1.28)]; L.add("madera", ...cilEntre([p[0], y - .2, p[2]], p, .05, 6, .04)); L.add("soga", new THREE.TorusGeometry(.07, .025, 5, 10), TM(p[0], p[1] - .12, p[2], Math.PI / 2)); if (ant) { const mid = [(ant[0] + p[0]) / 2 * 1.012, (ant[1] + p[1]) / 2 - .14, (ant[2] + p[2]) / 2 * 1.012]; L.add("soga", ...cilEntre([ant[0], ant[1] - .1, ant[2]], mid, .03, 5)); L.add("soga", ...cilEntre(mid, [p[0], p[1] - .1, p[2]], .03, 5)) } ant = p } }
  // arriba: cornisa, vigas en abanico y plataforma de tablas
  L.add("s1", new THREE.TorusGeometry(3.52, .2, 8, 48), TM(0, H - .5, 0, Math.PI / 2)); for (let k = 0; k < 16; k++) { const a = k / 16 * 6.283 + .1; L.add("madera", new THREE.CylinderGeometry(.1, .11, 1.5, 8), TM(Math.sin(a) * 3.5, H - .27, Math.cos(a) * 3.5, Math.PI / 2, a, 0)) }
  L.add("tablas", new THREE.CylinderGeometry(4.0, 4.0, .2, 48), TM(0, H - .1, 0));
  // baranda de la plataforma (postes y dos sogas), abierta al este (pasarela) y donde llega la escalera
  { const aF = ESC_ANG(ESC_N - 1); let an2 = null; for (let k = 0; k < 22; k++) { const a = k / 22 * 6.283, da = Math.atan2(Math.sin(a - aF), Math.cos(a - aF)), dE = Math.atan2(Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2)); if (Math.abs(da) < .34 || Math.abs(dE) < .3) { an2 = null; continue } const p = [Math.sin(a) * 3.85, H + 1.15, Math.cos(a) * 3.85]; L.add("madera", ...cilEntre([p[0], H, p[2]], p, .055, 6, .045)); if (an2) for (const dy of [-.08, -.6]) L.add("soga", ...cilEntre([an2[0], an2[1] + dy, an2[2]], [p[0], p[1] + dy, p[2]], .028, 5)); an2 = p } }
  const ms = L.fin(TORRE_G, { s0: M_SILLAR[0], s1: M_SILLAR[1], s2: M_SILLAR[2], s3: M_SILLAR[3], madera: M_MADERA, soga: M_SOGA, oscuro: M_OSCURO, puerta: M_PUERTA[8], hierro: M_HIERRO, tablas: M_MADERA_V }); TORRE_G.userData.ms = ms }
[[TORRE[0], TORRE[1], 5.4]].forEach(q => ocupa(...q));

// ---------- EL CUERNO sobre la torre (acostado a lo largo de x, la base serruchada al oeste y en alto, la punta con la boquilla al este)
const CUERNO = new THREE.Group(); CUERNO.position.set(TORRE[0], TORRE_H, TORRE[1]); scene.add(CUERNO);          // se mueve con cuernoCae
const CUNA = new THREE.Group(); CUNA.position.copy(CUERNO.position); scene.add(CUNA);                             // la cuna queda en la torre
const CUERNO_POSE = new THREE.Matrix4().makeTranslation(-2.5, 2.05, 0).multiply(new THREE.Matrix4().makeRotationZ(-.5)).multiply(new THREE.Matrix4().makeRotationY(Math.PI / 2)).multiply(new THREE.Matrix4().makeTranslation(0, 2.7, -10.5));
const CUERNO_CURVA = colmilloCurva(COLMILLO_L), cuernoR = u => 1.5 * (.1 + .9 * Math.pow(1 - u, .75));
const cuernoEn = x => { let b = null, bd = 1e9; for (let i = 0; i <= 200; i++) { const p = CUERNO_CURVA.getPointAt(i / 200).applyMatrix4(CUERNO_POSE), d = Math.abs(p.x - x); if (d < bd) { bd = d; b = { p, u: i / 200, r: cuernoR(i / 200) } } } return b };
const M_MARFIL_IN = new THREE.MeshStandardMaterial({ color: "#3a2a1c", roughness: 1, side: THREE.BackSide });
{ const cu = new THREE.Mesh(geoColmillo(COLMILLO_L, 1.5, { hueco: true }), M_MARFIL); cu.applyMatrix4(CUERNO_POSE); cu.castShadow = cu.receiveShadow = true; CUERNO.add(cu); CUERNO.userData.malla = cu;
  const p0 = CUERNO_CURVA.getPointAt(0), tg = CUERNO_CURVA.getTangentAt(0), L = lote(), base = CUERNO_POSE.clone().multiply(MZ(p0, tg, new THREE.Vector3(1, 1, 1)));   // en `base`, +y va hacia adentro del cuerno
  // el corte: anillo de dentina con sus anillos de crecimiento, el canto, y el hueco oscuro que se pierde adentro
  { const an = new THREE.RingGeometry(.86, 1.56, 48, 3); const p = an.attributes.position, u = an.attributes.uv; for (let i = 0; i < p.count; i++) u.setXY(i, .5 + p.getX(i) / 3.2, .5 + p.getY(i) / 3.2); L.add("corte", an, base.clone().multiply(TM(0, .01, 0, Math.PI / 2, 0, 0))) }
  L.add("dentro", new THREE.CylinderGeometry(.5, .86, 5, 28, 1, true), base.clone().multiply(TM(0, 2.5, 0))); L.add("fondo", new THREE.CircleGeometry(.5, 16), base.clone().multiply(TM(0, 5, 0, Math.PI / 2, 0, 0)));
  // zunchos de hierro viejo y anillos tallados cerca de la punta; la boquilla: una copa de marfil tallado con aro de bronce
  for (const u of [.04, .3, .62]) { const p = CUERNO_CURVA.getPointAt(u), t = CUERNO_CURVA.getTangentAt(u); L.add("hierro", new THREE.TorusGeometry(cuernoR(u) * 1.035 + .02, .05, 6, 40), CUERNO_POSE.clone().multiply(MZ(p, t, new THREE.Vector3(1, 1, 1))).multiply(TM(0, 0, 0, Math.PI / 2, 0, 0))) }
  for (const u of [.86, .9, .935, .96]) { const p = CUERNO_CURVA.getPointAt(u), t = CUERNO_CURVA.getTangentAt(u); L.add("marfil", new THREE.TorusGeometry(cuernoR(u) + .015, .035, 6, 24), CUERNO_POSE.clone().multiply(MZ(p, t, new THREE.Vector3(1, 1, 1))).multiply(TM(0, 0, 0, Math.PI / 2, 0, 0))) }
  const p1 = CUERNO_CURVA.getPointAt(1), t1 = CUERNO_CURVA.getTangentAt(1), punta = CUERNO_POSE.clone().multiply(MZ(p1, t1, new THREE.Vector3(1, 1, 1)));
  L.add("marfil", new THREE.LatheGeometry([[.15, -.1], [.17, .05], [.13, .14], [.12, .22], [.2, .3], [.25, .4], [.26, .46], [.21, .47], [.12, .36]].map(q => new THREE.Vector2(q[0], q[1])), 20), punta); L.add("bronce", new THREE.TorusGeometry(.245, .03, 6, 22), punta.clone().multiply(TM(0, .45, 0, Math.PI / 2, 0, 0))); L.add("bronce", new THREE.TorusGeometry(.135, .025, 6, 18), punta.clone().multiply(TM(0, .18, 0, Math.PI / 2, 0, 0)));
  L.fin(CUERNO, { corte: M_CORTE_MARFIL, dentro: M_MARFIL_IN, fondo: new THREE.MeshBasicMaterial({ color: "#0c0806", side: THREE.DoubleSide }), hierro: M_HIERRO, marfil: M_MARFIL, bronce: new THREE.MeshStandardMaterial({ color: "#b08a3a", roughness: .35, metalness: .85 }) });
  CUERNO.userData.punta = new THREE.Vector3(0, .5, 0).applyMatrix4(punta); CUERNO.userData.base = new THREE.Vector3(0, 0, 0).applyMatrix4(base); CUERNO.userData.baseDir = new THREE.Vector3(0, -1, 0).transformDirection(base) }
const BOQUILLA_W = () => { CUERNO.updateMatrixWorld(true); return CUERNO.userData.punta.clone().applyMatrix4(CUERNO.matrixWorld).toArray() };
const CUERNO_BASE_W = () => { CUERNO.updateMatrixWorld(true); return CUERNO.userData.base.clone().applyMatrix4(CUERNO.matrixWorld).toArray() };   // centro del corte (por donde lo agarra Onetusk)
const BALCON_Y = TORRE_H + CUERNO.userData.punta.y - 2.42;                 // piso de la pasarela: la boquilla queda a la altura de la boca
const BOCA_W = () => [TORRE[0] + CUERNO.userData.punta.x + .62, BALCON_Y, TORRE[1]];   // el narrador se para acá, mirando al oeste (ry = −π/2)
// la cuna: dos caballetes en X con solera, largueros y riostras, atados con soga; dos zunchos de hierro la cierran, con 4 pernos
const PERNOS = [], ZUNCHOS = [];
{ const L = lote(), r = rng(2870), sil = [-3.1, 1.5].map(x => ({ x, ...cuernoEn(x) }));
  sil.forEach((S, j) => { const hc = S.p.y, rh = S.r * 1.03, b = .7, yc = hc - rh / Math.sin(b), top = hc + rh * .35, zt = (top - yc) * Math.tan(b), zb = yc * Math.tan(b) + .25;
    for (const s of [-1, 1]) { L.add("madera", ...cilEntre([S.x, .05, -s * zb], [S.x + s * .14, top, s * zt], .15, 8)); L.add("madera", ...cilEntre([S.x, .1, s * (zb + .2)], [S.x + (j ? -1 : 1) * 2.1, .1, s * (zb + .2)], .1)); L.add("madera", ...cilEntre([S.x + (j ? -1.6 : 1.6), .12, s * zb * .9], [S.x + s * .14 * 0, top * .72, s * zt * .66], .075)) }
    L.add("madera", new THREE.BoxGeometry(.34, .26, zb * 2 + 1), TM(S.x, .13, 0)); for (const s of [-1, 0, 1]) L.add("soga", new THREE.TorusGeometry(.2, .04, 6, 14), TM(S.x + .07 * s, s ? .2 : yc, s * zb, s ? 0 : Math.PI / 2, s ? 0 : 0, s ? Math.PI / 2 : 0));
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) L.add("soga", new THREE.TorusGeometry(.19, .035, 5, 12), MZ(new THREE.Vector3(S.x + s * .14 * .55, lerp(yc, top, .5) + (k - 1) * .09, s * zt * .5 + (k - 1) * .09 * Math.tan(b) * s), new THREE.Vector3(0, Math.cos(b), s * Math.sin(b)), new THREE.Vector3(1, 1, 1)).multiply(TM(0, 0, 0, Math.PI / 2)));
    // el zuncho: media vuelta de hierro sobre el cuerno, con ojales; gira sobre el extremo norte cuando salen los pernos
    const zg = new THREE.Group(); zg.position.set(S.x, hc, -(rh + .06)); CUNA.add(zg); const arco = new THREE.Mesh(new THREE.TorusGeometry(rh + .06, .055, 6, 30, Math.PI), M_HIERRO); arco.rotation.y = Math.PI / 2; arco.position.z = rh + .06; arco.castShadow = true; zg.add(arco);
    for (const s of [0, 1]) { const oj = new THREE.Mesh(new THREE.TorusGeometry(.13, .045, 6, 14), M_HIERRO); oj.position.set(0, -.1, s * 2 * (rh + .06)); oj.rotation.y = Math.PI / 2; zg.add(oj) } ZUNCHOS.push(zg);
    // los pernos: barra de hierro con cabeza de argolla y chaveta, atraviesan el ojal y la punta del caballete
    for (const s of [1, -1]) { const pg = new THREE.Group(), pm = new THREE.Mesh(mergeG([[new THREE.CylinderGeometry(.065, .055, 1.25, 10), TM(0, 0, 0, 0, 0, Math.PI / 2)], [new THREE.TorusGeometry(.17, .05, 8, 18), TM(.78, 0, 0)], [new THREE.CylinderGeometry(.1, .1, .08, 10), TM(.6, 0, 0, 0, 0, Math.PI / 2)], [new THREE.BoxGeometry(.05, .3, .05), TM(-.5, 0, 0)]]), M_HIERRO); pm.castShadow = true; pg.add(pm); pg.position.set(S.x, hc - .1, s * (rh + .06)); CUNA.add(pg); pg.userData = { p0: pg.position.clone(), s, j }; PERNOS.push(pm) } });
  // rollo de soga, cuñas y un mazo sobre la plataforma
  for (let k = 0; k < 5; k++) L.add("soga", new THREE.TorusGeometry(.42 - k * .02, .05, 6, 20), TM(-.9, .08 + k * .085, 2.5, Math.PI / 2, 0, 0)); for (const [x, z2, a] of [[-3.5, -1.9, .3], [1.9, 1.8, 2], [1.2, -2, 1]]) L.add("madera", new THREE.BoxGeometry(.5, .22, .28), TM(x, .11, z2, 0, a, .2));
  L.add("madera", new THREE.CylinderGeometry(.045, .045, 1.1, 7), TM(.6, .42, 2.9, 0, .5, 1.2)); L.add("hierro", new THREE.BoxGeometry(.24, .3, .24), TM(.14, .14, 3.15, 0, .5, 0));
  // la pasarela al este, hasta debajo de la boquilla: largueros, tablas, jabalcones al muro y baranda de soga
  const x1 = CUERNO.userData.punta.x + 1.7, yb = BALCON_Y - TORRE_H; for (const s of [-1, 1]) { L.add("madera", ...cilEntre([2.2, yb - .16, s * .62], [x1, yb - .16, s * .62], .1, 8)); L.add("madera", ...cilEntre([3.3, -4.6, s * .55], [x1 - .5, yb - .22, s * .62], .085)); L.add("madera", ...cilEntre([3.45, -2.2, s * .5], [x1 - 2.6, yb - .22, s * .62], .07));
    let an = null; for (const x of [4.1, 5.5, x1 - .9, x1 - .1]) { const p = [x, yb + 1.15, s * .8]; L.add("madera", ...cilEntre([x, yb - .2, s * .8], p, .05, 6)); if (an) for (const dy of [-.08, -.6]) L.add("soga", ...cilEntre([an[0], an[1] + dy, an[2]], [p[0], p[1] + dy, p[2]], .028, 5)); an = p } }
  for (const dy of [-.08, -.6]) L.add("soga", ...cilEntre([x1 - .1, yb + 1.15 + dy, -.8], [x1 - .1, yb + 1.15 + dy, .8], .028, 5));
  for (let x = 3.75; x < x1; x += .34) L.add("tablas", new THREE.BoxGeometry(.3, .07, 1.72 + r() * .12), TM(x + .15, yb - .035, (r() - .5) * .05, 0, (r() - .5) * .03, 0));
  if (yb > .12) for (let k = 1; k * .19 < yb; k++) L.add("tablas", new THREE.BoxGeometry(.4, .19, 1.5), TM(3.72 - k * .4, k * .19 - .095 + .1, 0));
  L.fin(CUNA, { madera: M_MADERA, soga: M_SOGA, hierro: M_HIERRO, tablas: M_MADERA_V }) }
// q 0→1: los pernos salen de a uno (hacia el este), caen a la plataforma y los zunchos se abren
function pernosFuera(q) { PERNOS.forEach((pm, i) => { const g = pm.parent, u = P(q, i * .17, i * .17 + .42), sal = eOut(cl(u * 2.2)) * 1.45, t = Math.max(0, u - .45) * 2.4, piso = .12 - g.userData.p0.y; let y = -4.9 * t * t * 1.6, rz = 0; if (y < piso) { const t2 = t - Math.sqrt(-piso / 7.84), b = Math.max(0, .5 * Math.sin(Math.min(t2 * 9, Math.PI)) * (1 - t2)); y = piso + b; rz = 1.57 } else rz = t * 3;
    g.position.set(g.userData.p0.x + sal + t * .6, g.userData.p0.y + y, g.userData.p0.z + g.userData.s * t * .5); g.rotation.set(0, t * 1.3 * g.userData.s, -rz) });
  ZUNCHOS.forEach((zg, j) => { zg.rotation.x = -eOut(P(q, .5 + j * .17, .86 + j * .14)) * 2.1 }) }
// q 0→1: sin pernos, el cuerno resbala de la cuna hacia el oeste, la base baja y gira al norte; en q = 1 queda asomando de la torre
function cuernoCae(q) { const e = eIO(cl(q)), tiem = Math.sin(cl(q * 6) * Math.PI) * .02 * (1 - e), piv = new THREE.Vector3(-3.6, 1.1, 0);
  const M = new THREE.Matrix4().makeTranslation(piv.x, piv.y, piv.z).multiply(new THREE.Matrix4().makeRotationY(-.62 * e)).multiply(new THREE.Matrix4().makeRotationZ(.86 * e + tiem)).multiply(new THREE.Matrix4().makeTranslation(-5.4 * e * e, -.25 * e, 0)).multiply(new THREE.Matrix4().makeTranslation(-piv.x, -piv.y, -piv.z));
  CUERNO.matrix.copy(new THREE.Matrix4().makeTranslation(TORRE[0], TORRE_H, TORRE[1]).multiply(M)); CUERNO.matrixAutoUpdate = false; CUERNO.matrixWorldNeedsUpdate = true }

// ---------- rajaduras de la torre (grietasTorre): tajos oscuros con labio levantado, que avanzan con q, y piedritas que caen
const GRIETAS = (() => { const r = rng(2880), G = new THREE.Group(); TORRE_G.add(G); const mo = new THREE.MeshStandardMaterial({ color: "#120b07", roughness: 1 }), ml = new THREE.MeshStandardMaterial({ color: "#d9b88e", roughness: 1 }), lista = [], pied = [];
  const en = (a, y, d) => { const R = TORRE_RW(y) + d; return [Math.sin(a) * R, y, Math.cos(a) * R] };
  const una = (a0, y0, dir, n, t0, an0) => { const pos = [], pl = [], idx = [], il = []; let a = a0, y = y0; const pts = []; for (let k = 0; k <= n; k++) { pts.push([a, y, an0 * (1 - k / n * .8) * (.6 + r() * .8)]); a += (r() - .5) * .16 + dir[0] * .05; y += dir[1] * (.22 + r() * .3) + (r() - .5) * .12 }
    pts.forEach(([a, y, an], k) => { const sa = an / TORRE_RW(y); pos.push(...en(a - sa, y, .035), ...en(a + sa, y, .035)); pl.push(...en(a - sa * 2.3, y, .02), ...en(a - sa, y, .11), ...en(a + sa, y, .11), ...en(a + sa * 2.3, y, .02)); if (k) { const i = (k - 1) * 2; idx.push(i, i + 1, i + 2, i + 1, i + 3, i + 2); const j = (k - 1) * 4; il.push(j, j + 1, j + 4, j + 1, j + 5, j + 4, j + 2, j + 3, j + 6, j + 3, j + 7, j + 6) }
      if (k % 2 === 0) pied.push({ p: en(a, y, .2), t0: t0 + (k / n) * .3, a }) });
    const mk2 = (p, i, m) => { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3)); g.setIndex(i); g.computeVertexNormals(); const me = new THREE.Mesh(g, m); me.material.side = THREE.DoubleSide; G.add(me); return me };
    lista.push({ o: mk2(pos, idx, mo), l: mk2(pl, il, ml), n, t0 }) };
  // un cinturón de rajaduras donde aprieta la trompa (alturas 6 a 13), sobre todo al sur y al este, que se ven desde la plaza
  for (let k = 0; k < 13; k++) { const a = (k < 8 ? -1.1 + k * .32 : r() * 6.283) + (r() - .5) * .2, y0 = 6 + r() * 5; una(a, y0, [r() - .5, r() < .5 ? 1 : -1], 9 + (r() * 7 | 0), k / 13 * .55, .1 + r() * .09); if (r() < .7) una(a + .05, y0 + .5, [(r() - .5) * 3, .4], 5 + (r() * 4 | 0), k / 13 * .55 + .2, .06) }
  const pm = new THREE.InstancedMesh(GEO_PIEDRAS[0], new THREE.MeshStandardMaterial({ color: "#b89468", roughness: 1 }), pied.length); pm.castShadow = true; pm.frustumCulled = false; G.add(pm); pied.forEach(q => { q.s = .06 + r() * .16; q.v = .6 + r() * 1.6; q.rot = r() * 6 });
  return { G, lista, pied, pm } })();
function grietasTorre(q) { GRIETAS.G.visible = q > 0; GRIETAS.lista.forEach(c => { const u = P(q, c.t0, c.t0 + .4), k = Math.ceil(u * c.n); c.o.geometry.setDrawRange(0, k * 6); c.l.geometry.setDrawRange(0, k * 12); c.o.visible = c.l.visible = k > 0 });
  GRIETAS.pied.forEach((d, i) => { const t = Math.max(0, q - d.t0) * 3.2, on = q > d.t0, yf = d.p[1] - 4.9 * t * t, R = 1 + d.v * t / Math.hypot(d.p[0], d.p[2]); dummy.position.set(d.p[0] * R, Math.max(.12, yf), d.p[2] * R); dummy.rotation.set(d.rot + t * 5, d.rot, t * 3); dummy.scale.setScalar(on ? d.s : 0); dummy.updateMatrix(); GRIETAS.pm.setMatrixAt(i, dummy.matrix) }); GRIETAS.pm.instanceMatrix.needsUpdate = true }
grietasTorre(0);

M_MARFIL.side = THREE.DoubleSide;   // geoColmillo arma las caras mirando hacia adentro: con doble cara se ve bien por fuera y por el hueco
// ---------- LAS 9 RUINAS a los costados del corredor de las pisadas (lo que Onetusk aplastó hace 60 años)
const M_ARENA_M = new THREE.MeshStandardMaterial({ map: T_ARENA_D.c, bumpMap: T_ARENA_D.z, bumpScale: 3.2, roughness: .96, color: "#d2b48a" });
const geoMonton = (seed, sx, sy, sz, seg = 22) => { const g = new THREE.SphereGeometry(1, seg, 12, 0, 6.283, 0, Math.PI / 2), p = g.attributes.position, u = g.attributes.uv, r = rng(seed), f = r() * 9; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = .72 + .5 * fbm2(x * 1.6 + f, z * 1.6 - f, 3); p.setXYZ(i, x * sx * k, y * sy * (.55 + .7 * fbm2(x * 2.3 - f, z * 2.3 + f, 2)), z * sz * k); u.setXY(i, x * sx * k / 5 + .5, z * sz * k / 5 + .5) } g.computeVertexNormals(); return g };
const RUINAS = [[19.5, -55], [-19, -48], [20.5, -69], [-20.5, -62], [19, -83], [-19.5, -76], [20.5, -97], [-20, -90], [-19.5, -103.5]].map(([x, z], i) => { const r = rng(2950 + i * 5), ry = (x > 0 ? -1 : 1) * Math.PI / 2 + (r() - .5) * .5, w = 5.8 + r() * 2, d = 4.9 + r() * 1, h = 4.3 + r() * .5;
  const antes = CASAS_A.length, C = casaAdobe(x, z, ry, w, d, h, 2960 + i * 7, { dos: i % 4 === 1, abre: 0 }); CASAS_A.length = antes;   // la casa entera (como era): no cuenta entre las casas vivas
  const g = new THREE.Group(); g.position.copy(C.g.position); g.rotation.y = ry; scene.add(g); const L = lote(), T = CASA_T;
  // el montón de adobe derretido por 60 años de lluvia y la arena que se le arrimó
  L.add("pared", geoMonton(i * 3 + 1, w * .62, 1.15 + r() * .5, d * .62), TM((r() - .5) * .8, -.05, (r() - .5) * .6)); L.add("pared", geoMonton(i * 3 + 2, w * .3, .8, d * .34, 14), TM(w * .28 * (r() < .5 ? 1 : -1), -.05, d * .3));
  L.add("arena", geoMonton(i * 3 + 3, w * .7, .75, 2.2), TM(-w * .1, -.06, -d / 2 - .9)); L.add("arena", geoMonton(i * 3 + 4, 2, .5, d * .5, 14), TM(-w / 2 - .7, -.06, 0));
  // munones de muro con el borde roto (pedazos de distinto alto), sobre el fondo y un costado; la esquina es lo más alto que quedó
  const munon = (M, largo, h0, h1, f) => { let x = -largo / 2; while (x < largo / 2 - .05) { const an = Math.min(largo / 2 - x, .3 + r() * .4), q = (x + largo / 2) / largo, hh = Math.max(.25, lerp(h0, h1, q) * (.75 + r() * .45) + Math.sin(q * 9 + f) * .3), gg = new THREE.BoxGeometry(an, hh, T * (.85 + r() * .25)); gg.translate(x + an / 2, hh / 2, -T / 2); geoUV(gg, px => .05 + (px + largo / 2) / largo * .9, (px, py) => py / 5.2); L.add("pared", gg, M.clone().multiply(TM(0, 0, 0, (r() - .5) * .05, 0, (r() - .5) * .04))); x += an } };
  const lw = w - 2 * CASA_R, ld = d - 2 * CASA_R, es = r() < .5 ? 1 : -1; munon(TM(0, 0, -d / 2, 0, Math.PI), lw, es > 0 ? .5 : 2.9, es > 0 ? 2.9 : .5, i); munon(TM(-es * w / 2, 0, 0, 0, -es * Math.PI / 2), ld, es > 0 ? .4 : 2.6, es > 0 ? 2.6 : .4, i + 3); munon(TM(es * w / 2, 0, d * .12, 0, es * Math.PI / 2), ld * .5, .9, .3, i + 5);
  { const gg = new THREE.CylinderGeometry(CASA_R * .95, CASA_R * 1.12, 3.3, 12); gg.translate(0, 1.65, 0); geoUV(gg, (x2, y2, z2) => .1 + (Math.atan2(z2, x2) / 6.283 + .5) * .4, (x2, y2) => y2 / 5.2); L.add("pared", gg, TM(-es * (w / 2 - CASA_R), 0, -(d / 2 - CASA_R), .03, 0, .04)); L.add("pared", geoMonton(i + 40, .62, .5, .62, 10), TM(-es * (w / 2 - CASA_R), 3.25, -(d / 2 - CASA_R))) }
  // la puerta, todavía en pie: jambas, dintel torcido y la hoja colgando de una bisagra
  { const M = TM(C.px, 0, d / 2 - .2, 0, 0, .03); for (const s of [-1, 1]) L.add("madera", new THREE.BoxGeometry(.2, 3.2, .34), M.clone().multiply(TM(s * .9, 1.6, 0, 0, 0, s * .02))); L.add("madera", new THREE.BoxGeometry(2.3, .24, .4), M.clone().multiply(TM(0, 3.28, 0, 0, 0, -.06))); const hoja = M.clone().multiply(TM(-.78, .12, 0, 0, -1.1 - r() * .6, .09)); L.add("color", new THREE.BoxGeometry(1.5, 2.9, .07), hoja.clone().multiply(TM(.75, 1.5, 0))); for (const yy of [.5, 1.5, 2.5]) L.add("madera", new THREE.BoxGeometry(1.44, .15, .04), hoja.clone().multiply(TM(.75, yy, .05)));
    L.add("pared", geoMonton(i + 50, 1.3, .55, .8, 12), TM(C.px + 1.4, -.04, d / 2 - .1)); L.add("laja", RB(2.2, .16, .8, .06), TM(C.px, .0, d / 2 + .25, 0, .05, 0)) }
  // vigas rotas: clavadas en el montón, cruzadas, una apoyada en el muñón
  for (let k = 0; k < 9; k++) { const a = r() * 6.283, d0 = r() * w * .32, len = 1.8 + r() * 2.6, x0 = Math.cos(a) * d0, z0 = Math.sin(a) * d0 * .8, inc = .25 + r() * 1.1, b = r() * 6.283; L.add("madera", ...cilEntre([x0, .2 + r() * .5, z0], [x0 + Math.cos(b) * len * Math.cos(inc), .5 + len * Math.sin(inc), z0 + Math.sin(b) * len * Math.cos(inc)], .1 + r() * .03, 8, .095)) }
  L.add("madera", ...cilEntre([-w * .1, .5, d * .1], [-es * (w / 2 - .5), 2.2, -d / 2 + .3], .11, 8));
  // ladrillos de adobe sueltos, tejuelas del techo, una vasija rota y matas secas que crecieron encima
  for (let k = 0; k < 70; k++) { const a = r() * 6.283, dd = 1 + Math.sqrt(r()) * (w * .75), x2 = Math.cos(a) * dd, z2 = Math.sin(a) * dd * .85, cerca = Math.hypot(x2 / (w * .6), z2 / (d * .6)); const y2 = cerca < 1 ? (1 - cerca) * 1.0 + .08 : .06; const gg = new THREE.BoxGeometry(.42, .13, .21); geoUV(gg, () => .3 + r() * .4, () => .85 + r() * .1); L.add("pared", gg, TM(x2, y2, z2, (r() - .5) * .7, r() * 6.283, (r() - .5) * .7)) }
  for (let k = 0; k < 8; k++) { const a = r() * 6.283, dd = 1 + r() * w * .6; L.add("techo", new THREE.BoxGeometry(.5 + r() * .7, .1, .4 + r() * .5), TM(Math.cos(a) * dd, .12 + r() * .6, Math.sin(a) * dd * .8, (r() - .5) * .9, r() * 6, (r() - .5) * .9)) }
  for (let k = 0; k < 16; k++) { const a = r() * 6.283, dd = .5 + r() * w * .7, hh = .4 + r() * .7; for (let j = 0; j < 5; j++) L.add("mata", new THREE.ConeGeometry(.035, hh, 4), TM(Math.cos(a) * dd + (r() - .5) * .2, hh / 2 + .1 + (dd < w * .4 ? .5 : 0), Math.sin(a) * dd * .8 + (r() - .5) * .2, (r() - .5) * .7, 0, (r() - .5) * .7)) }
  const ms = L.fin(g, { pared: C.mats.pared, arena: M_ARENA_M, madera: M_MADERA_V, color: C.mats.color, laja: M_LAJA, techo: M_TECHO_B, mata: SM("#b8a060", { roughness: 1 }) });
  const R = { g, x, z, ry, w, d, entera: C.g, i }; C.g.visible = false; ocupa(x, z, Math.hypot(w, d) / 2 + 1.6); return R });
// 0 = la casa entera (como era hace 60 años); 1 = aplastada (hoy). Entre medio, la casa se hunde y el escombro aparece.
function ruinaEstado(i, q) { const R = RUINAS[i]; if (!R) return; const e = eIO(cl(q)); R.entera.visible = q < 1; R.entera.scale.set(1 + e * .18, lerp(1, .06, e), 1 + e * .18); R.g.visible = q > 0; R.g.scale.set(lerp(.8, 1, e), Math.max(.01, eOut(cl(q * 1.1))), lerp(.8, 1, e)) }

// ---------- la cresta: montículos de arena que se juntaron en 60 años alrededor de las patas (fuera del círculo de radio 4)
{ const r = rng(2990), L = lote(); for (let k = 0; k < 9; k++) { const a = k / 9 * 6.283 + r() * .4, dd = 6.4 + r() * 2.6, x = CRESTA[0] + Math.cos(a) * dd, z = CRESTA[1] + Math.sin(a) * dd * .9; L.add("arena", geoMonton(70 + k, 1.6 + r() * 1.4, .5 + r() * .7, 1.2 + r() * 1, 16), TM(x, SUELO(x, z) - .08, z, 0, a + 1.57, 0)) }
  L.fin(scene, { arena: M_ARENA_M }) }
