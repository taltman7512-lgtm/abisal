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
