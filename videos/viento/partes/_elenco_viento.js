// ================= ELENCO DE GUSTHOLLOW («Keep Your Boots On»): personajes, botas de hierro, utilería y animaciones de viento =================
// Va DESPUÉS de _volze_personajes.js (usa caraV, CARAS_CAT, pincel, peloV, panueloV, anteojosV, accMat, trozo, bloque, gema, estampa,
// sombra2D). Mismo estilo que el cuerno: seis bloques de plástico mate con bisel chico, ropa PINTADA (calcomanía plana, un color por
// prenda con un estampado simple), cabeza recta, caras del catálogo clásico dibujadas por nosotros; en 3D solo el pelo, los gorros, la
// barba y las BOTAS DE HIERRO (lo único «calzado en 3D», porque la historia las justifica).
// Quién es quién (instancias del motor reutilizadas):
//   ME = el narrador (13) · PIP = ME6, la hermanita (7, escala .72) · TOBB = GARROW, el viejo · TOBB_CHICO = PIM (11, el recuerdo)
//   MARTA = QUILL · NOVIO = FOLK[0] · NOVIA = FOLK[1] · MAMA = FOLK[2] (con BEBE_V) · VECINOS = 10 vecinos (FOLK[3..5], EXT[0..3], PESCADOR y 2 nuevos)
// Convenciones de las poses: todas son (k, t, opciones) y se llaman DESPUÉS de poner al personaje (placeW/ponerP) y de pose() del motor.
// El viento sopla hacia +x (VDIR). k.g es el punto de referencia (los pies, salvo donde se dice otra cosa).
const H_CAD = 1.02, A_BRAZO = .42, F30 = 1 / 30;
const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3(), _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _q3 = new THREE.Quaternion();
const _ABAJO = new THREE.Vector3(0, -1, 0), _mb = new THREE.Matrix4(), _ax = new THREE.Vector3(), _ay = new THREE.Vector3(), _az = new THREE.Vector3();
const _frac = x => x - Math.floor(x), _suave = q => { q = cl(q); return q * q * (3 - 2 * q) };
function caraDz(kind, cerr = false) { return caraV(kind, cerr) }   // la reasigna _volze_personajes.js: la declaración tiene que existir

// ---------- caras nuevas (mismo trazo de pincel del catálogo): «wow» (asombro feliz), «aguanta» (contra el viento), «esfuerzo» (tirar de la bota)
CARAS_CAT.wow = g => { [-1, 1].forEach(s => { const x = 256 + s * EX; ojoBlanco(g, x, 44, 0, -6, 19); g.fillStyle = "#fff"; g.beginPath(); g.arc(x - 7, EY - 13, 6, 0, 7); g.fill(); ceja(g, x, s, "alta") }); bocaAbierta(g, 118, 96, true, false) };
CARAS_CAT.aguanta = g => { [-1, 1].forEach(s => { ojoNegro(g, 256 + s * EX, 20, 34); ceja(g, 256 + s * EX, s, "enojo") }); bocaDientes(g, 120, 46) };
CARAS_CAT.esfuerzo = g => { [-1, 1].forEach(s => ojoApret(g, 256 + s * EX, s)); bocaDientes(g, 130, 52) };
const SIN_PARPADEO = new Set(["relieved", "paz", "cerrados", "sopla", "esfuerzo", "happyD"]);
// UN parpadeo de 4 cuadros (a 30 fps) cada 1,2–1,6 s, desfasado por personaje
function parpadeo(k, t) { const T = 1.2 + .4 * _frac(k.idx * .618 + .31), ph = (t + T * _frac(k.idx * .377 + .15)) % T;
  if (ph < 4 * F30 && k.cara && !SIN_PARPADEO.has(k.cara)) { const m = caraV(k.cara, true); if (k.decal.material.map !== m) { k.decal.material.map = m; k.decal.material.needsUpdate = true } return true } return false }

// ---------- ROPA PINTADA de pueblo de montaña (lana, abrigos, bufandas, delantales): texturas planas con sombreado suave
const ROPAG = {};
function estampaG(g, w, h, kind, alt) { g.fillStyle = alt; g.strokeStyle = alt;
  if (kind === "nordico") { g.fillRect(0, 96, w, 14); g.fillRect(0, 196, w, 14); for (let x = 0; x < w + 40; x += 64) { g.beginPath(); g.moveTo(x, 126); g.lineTo(x + 22, 153); g.lineTo(x, 180); g.lineTo(x - 22, 153); g.closePath(); g.fill() } for (let x = 32; x < w; x += 64) { g.beginPath(); g.arc(x, 153, 7, 0, 7); g.fill() } return }
  if (kind === "trenza") { g.lineWidth = 11; for (const x of [110, 256, 402]) { for (let y = -20; y < h; y += 64) { g.beginPath(); g.ellipse(x, y + 32, 22, 30, 0, 0, 7); g.stroke() } g.fillRect(x - 46, 0, 6, h); g.fillRect(x + 40, 0, 6, h) } return }
  if (kind === "cuadros") { g.globalAlpha = .55; for (let x = 20; x < w; x += 128) g.fillRect(x, 0, 52, h); for (let y = 20; y < h; y += 128) g.fillRect(0, y, w, 52); g.globalAlpha = 1; g.fillStyle = "rgba(0,0,0,.25)"; for (let x = 44; x < w; x += 128) g.fillRect(x, 0, 6, h); for (let y = 44; y < h; y += 128) g.fillRect(0, y, w, 6); return }
  estampa(g, w, h, kind, null, alt) }
// frente/espalda del torso. o: { col, kind, alt, abrigo: [solapa|null, botones], bufanda: [col, raya], delantal: [col, borde], bolsillos: col, traje: [camisa, moño, flor],
//   encaje: col, faja: [col, vivo], chal: [col, guarda], chaleco: [col] }
function torsoG(o, back = false) { const key = "t" + JSON.stringify(o) + back; return ROPAG[key] ||= tex(512, 512, (g, w, h) => {
  g.fillStyle = o.col; g.fillRect(0, 0, w, h); if (o.kind) estampaG(g, w, h, o.kind, o.alt || "#efe6d2");
  if (o.chaleco) { g.fillStyle = o.chaleco[0]; if (back) g.fillRect(0, 0, w, h); else { g.fillRect(0, 0, 176, h); g.fillRect(w - 176, 0, 176, h) } }
  if (o.chal) { const V = (d, lw, c) => { g.strokeStyle = c; g.lineWidth = lw; g.lineJoin = "miter"; g.beginPath(); g.moveTo(-10, 250 - d); g.lineTo(256, 470 - d); g.lineTo(522, 250 - d); g.stroke() };
    g.fillStyle = o.chal[0]; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w, 250); g.lineTo(256, 470); g.lineTo(0, 250); g.closePath(); g.fill(); if (o.chal[1]) V(40, 18, o.chal[1]) }
  if (o.traje && !back) { const [cam, mo, flor] = o.traje; g.fillStyle = cam; g.beginPath(); g.moveTo(186, 0); g.lineTo(326, 0); g.lineTo(256, 230); g.closePath(); g.fill();
    g.fillStyle = "rgba(0,0,0,.35)"; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(256 + s * 70, 0); g.lineTo(256 + s * 96, 0); g.lineTo(256 + s * 8, 250); g.lineTo(256, 236); g.closePath(); g.fill() }
    g.fillStyle = mo; g.beginPath(); g.moveTo(256, 44); g.lineTo(222, 26); g.lineTo(222, 64); g.closePath(); g.fill(); g.beginPath(); g.moveTo(256, 44); g.lineTo(290, 26); g.lineTo(290, 64); g.closePath(); g.fill(); g.fillRect(248, 36, 16, 16);
    g.fillStyle = "rgba(0,0,0,.4)"; for (const y of [300, 380]) { g.beginPath(); g.arc(256, y, 11, 0, 7); g.fill() }
    if (flor) { for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283; g.fillStyle = "#f6f2ea"; g.beginPath(); g.arc(140 + Math.cos(a) * 15, 110 + Math.sin(a) * 15, 11, 0, 7); g.fill() } g.fillStyle = flor; g.beginPath(); g.arc(140, 110, 9, 0, 7); g.fill() } }
  if (o.abrigo) { const [sol, bot] = o.abrigo; if (!back) { g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(250, 0, 9, h);
      if (sol) { g.fillStyle = sol; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(256, 0); g.lineTo(256 + s * 150, 0); g.lineTo(256 + s * 120, 70); g.lineTo(256 + s * 6, 150); g.closePath(); g.fill() } }
      if (bot) for (let k = 0; k < 4; k++) { const y = 186 + k * 80; g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(216, y + 3, 82, 5); g.fillStyle = bot; g.beginPath(); g.roundRect(232, y - 9, 48, 18, 9); g.fill() } }
    else { g.fillStyle = "rgba(0,0,0,.18)"; g.fillRect(250, 300, 8, h - 300) } }
  if (o.delantal) { const [dc, db] = o.delantal; g.fillStyle = dc; g.fillRect(0, 196, w, 22); if (!back) { g.fillRect(150, 40, 212, 170); g.fillRect(96, 206, 320, h - 206); g.fillRect(156, 0, 18, 44); g.fillRect(338, 0, 18, 44);
      g.strokeStyle = db; g.lineWidth = 8; g.strokeRect(186, 330, 140, 80); g.fillStyle = db; g.fillRect(96, h - 30, 320, 12); g.fillRect(150, 40, 212, 8) } }
  if (o.bolsillos && !back) { const bc = o.bolsillos, osc = "#" + new THREE.Color(bc).multiplyScalar(.62).getHexString();
    for (const x0 of [52, 312]) { const r = rng(x0); for (let i = 0; i < 4; i++) { const cx = x0 + 22 + i * 34 + r() * 8, cy = 300 + r() * 6, rr = 16 + r() * 8; g.fillStyle = ["#9a968e", "#7d7a74", "#b0aca2", "#8a867e"][i]; g.beginPath(); for (let j = 0; j < 6; j++) { const a = j / 6 * 6.283 + r() * .3; g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * .85) } g.closePath(); g.fill() }   // piedritas que asoman
      g.fillStyle = bc; g.beginPath(); g.roundRect(x0, 300, 148, 170, [6, 6, 34, 34]); g.fill(); const gr = g.createRadialGradient(x0 + 60, 360, 6, x0 + 74, 390, 110); gr.addColorStop(0, "rgba(255,255,255,.28)"); gr.addColorStop(.6, "rgba(255,255,255,0)"); gr.addColorStop(1, "rgba(0,0,0,.3)"); g.fillStyle = gr; g.fill();   // abultado
      g.strokeStyle = osc; g.lineWidth = 9; g.stroke(); g.setLineDash([12, 9]); g.lineWidth = 4; g.strokeStyle = "rgba(255,240,200,.55)"; g.beginPath(); g.moveTo(x0 + 12, 322); g.lineTo(x0 + 136, 322); g.stroke(); g.setLineDash([]) } }
  if (o.faja) { g.fillStyle = o.faja[0]; g.fillRect(0, h - 104, w, 54); if (o.faja[1]) { g.fillStyle = o.faja[1]; g.fillRect(0, h - 84, w, 12) } }
  if (o.encaje) { g.fillStyle = o.encaje; for (let x = 0; x < w + 32; x += 40) { g.beginPath(); g.arc(x, 0, 22, 0, Math.PI); g.fill(); g.beginPath(); g.arc(x + 20, h - 78, 14, 0, Math.PI); g.fill() } g.fillRect(0, h - 96, w, 18) }
  if (o.bufanda) { const [bc, br] = o.bufanda; g.fillStyle = bc; g.fillRect(0, 0, w, 62); if (br) { g.fillStyle = br; g.fillRect(0, 22, w, 14) }
    if (!back) { g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(300, 56, 84, 8); g.fillStyle = bc; g.fillRect(304, 40, 76, 250); if (br) { g.fillStyle = br; for (let y = 90; y < 270; y += 62) g.fillRect(304, y, 76, 20) }
      g.fillStyle = bc; for (let x = 308; x < 380; x += 14) g.fillRect(x, 288, 7, 26) } }   // la punta que cuelga, con flecos
  sombra2D(g, w, h, .12) }) }
const torsoLado = o => ROPAG["l" + JSON.stringify(o)] ||= tex(64, 64, (g, w, h) => { g.fillStyle = o.chaleco ? o.chaleco[0] : o.chal ? o.chal[0] : o.col; g.fillRect(0, 0, w, h);
  if (o.delantal) { g.fillStyle = o.delantal[0]; g.fillRect(0, 24, w, 3) } if (o.faja) { g.fillStyle = o.faja[0]; g.fillRect(0, h - 13, w, 7) } if (o.bufanda) { g.fillStyle = o.bufanda[0]; g.fillRect(0, 0, w, 8) } sombra2D(g, w, h, .12) });
// brazo: manga (lana) hasta `manga`, puño, rayas opcionales, mitones opcionales; el resto es la mano color piel
const brazoG = o => ROPAG["b" + JSON.stringify(o)] ||= tex(128, 256, (g, w, h) => { const y = h * (o.manga ?? .82); g.fillStyle = o.skin; g.fillRect(0, 0, w, h); g.fillStyle = o.col; g.fillRect(0, 0, w, y);
  if (o.rayas) { g.fillStyle = o.rayas; for (let yy = 34; yy < y - 34; yy += 54) g.fillRect(0, yy, w, 16) } if (o.puno) { g.fillStyle = o.puno; g.fillRect(0, y - 26, w, 20) }
  if (o.guante) { g.fillStyle = o.guante; g.fillRect(0, y, w, h - y); g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(0, y + 6, w, 8) }
  g.fillStyle = "rgba(0,0,0,.16)"; g.fillRect(0, y, w, 4); sombra2D(g, w, h, .1) });
// pierna: pantalón (o medias de lana) hasta `largo`, pollera/abrigo largo pintado arriba hasta `falda`; debajo, la MEDIA pintada (la tapa la bota)
const piernaG = (o, descalzo = false) => ROPAG["p" + JSON.stringify(o) + descalzo] ||= tex(128, 256, (g, w, h) => { const L = h * (o.largo ?? .8);
  g.fillStyle = o.col; g.fillRect(0, 0, w, L); if (!o.falda) { g.fillStyle = "rgba(0,0,0,.1)"; g.fillRect(w / 2 - 2, 0, 4, L * .9) }
  if (o.falda) { const yf = h * o.falda; g.fillStyle = o.faldaCol || o.col; g.fillRect(0, 0, w, yf); if (o.ruedo) { g.fillStyle = o.ruedo; g.fillRect(0, yf - 24, w, 14) } g.fillStyle = "rgba(0,0,0,.2)"; g.fillRect(0, yf, w, 5) }
  if (descalzo) { g.fillStyle = o.skin; g.fillRect(0, L, w, h - L); g.fillStyle = "rgba(0,0,0,.12)"; g.fillRect(0, h - 8, w, 8) }
  else { g.fillStyle = o.media || "#e9e1cf"; g.fillRect(0, L, w, h - L); g.fillStyle = o.mediaRaya || "#b8463a"; g.fillRect(0, L + 12, w, 13); g.fillRect(0, L + 33, w, 6); g.fillStyle = "rgba(0,0,0,.1)"; g.fillRect(0, h - 16, w, 16) }
  g.fillStyle = "rgba(0,0,0,.2)"; g.fillRect(0, L, w, 4); sombra2D(g, w, h, .1) });

// ---------- BOTAS DE HIERRO: un bloque de hierro oscuro (pocas caras) con remaches y una correa de cuero pintados, sobre una suela gruesa.
// Reemplaza la franja de zapato: tapa la media pintada. Es un poco más ancha que la pierna (.58 contra .5). Geometrías y materiales compartidos.
const BOTA = (() => { const pinta = front => pintarDoble(256, 256, (c, z, w, h) => { const r = rng(9090 + front); c.fillStyle = "#3e4146"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
    for (let k = 0; k < 60; k++) { c.fillStyle = `rgba(${r() < .5 ? "0,0,0" : "255,255,255"},${.03 + r() * .05})`; c.beginPath(); c.ellipse(r() * w, r() * h, 8 + r() * 22, 6 + r() * 16, r() * 3, 0, 7); c.fill() }   // hierro martillado
    c.fillStyle = "rgba(255,255,255,.16)"; c.fillRect(0, 0, w, 10); c.fillStyle = "rgba(0,0,0,.28)"; c.fillRect(0, h - 12, w, 12);
    c.fillStyle = "#6a4022"; c.fillRect(0, 104, w, 48); c.fillStyle = "rgba(0,0,0,.3)"; c.fillRect(0, 148, w, 4); z.fillStyle = "rgba(255,255,255,.5)"; z.fillRect(0, 104, w, 48);   // la correa de cuero
    c.setLineDash([9, 7]); c.strokeStyle = "rgba(255,226,180,.5)"; c.lineWidth = 3; for (const y of [111, 144]) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke() } c.setLineDash([]);
    for (const y of [36, 216]) for (let x = 21; x < w; x += 43) { c.fillStyle = "#1c1e21"; c.beginPath(); c.arc(x, y, 11, 0, 7); c.fill(); c.fillStyle = "#80858d"; c.beginPath(); c.arc(x, y, 7.5, 0, 7); c.fill(); c.fillStyle = "rgba(255,255,255,.7)"; c.beginPath(); c.arc(x - 2.5, y - 2.5, 2.6, 0, 7); c.fill(); z.fillStyle = "#ffffff"; z.beginPath(); z.arc(x, y, 8, 0, 7); z.fill() }   // remaches
    if (front) { c.strokeStyle = "#8f846c"; c.lineWidth = 7; c.strokeRect(108, 106, 40, 44); c.fillStyle = "#8f846c"; c.fillRect(125, 106, 6, 44); z.strokeStyle = "#ffffff"; z.lineWidth = 8; z.strokeRect(108, 106, 40, 44) } });   // hebilla
  const [c0, z0] = pinta(0), [c1, z1] = pinta(1), M = (map, bumpMap) => new THREE.MeshStandardMaterial({ map, bumpMap, bumpScale: 2.2, roughness: .5, metalness: .4 }), lado = M(c0, z0);
  return { geoB: RB(.56, .22, .6, .025, 2), geoS: RB(.6, .06, .67, .02, 2), mats: boxMats(lado, M(c1, z1), lado), suela: new THREE.MeshStandardMaterial({ color: "#232427", roughness: .45, metalness: .5 }) } })();
// una bota: grupo con el origen en la base de la suela (centro); esc = escala (las de Tobb son las más grandes del pueblo)
function botaNueva(esc = 1) { const G = new THREE.Group(); part(BOTA.geoS, BOTA.suela, 0, .03, .06, G, 0); part(BOTA.geoB, BOTA.mats, 0, .165, .05, G, 0); G.scale.set(esc, Math.pow(esc, .7), esc); G.userData.esc = esc; return G }
// botas(k, { izq, der, descalzo }): 1 = puesta, 0 = sacada (se ve la media pintada; descalzo: 1 → el pie color piel). izq = legL (x−), der = legR (x+).
// Se resetea en cada cuadro (todos con las dos botas puestas): llamala en cada cuadro en que haga falta.
function botas(k, { izq = 1, der = 1, descalzo = 0 } = {}) { [izq, der].forEach((on, i) => { const b = k.botaG[i]; b.visible = !!on; const m = k.matPierna[i], map = !on && descalzo ? k.texPierna[1] : k.texPierna[0]; if (m.map !== map) { m.map = map; m.needsUpdate = true } }) }
// botaSuelta(k, lado) → la bota suelta de ese personaje (lado "izq"|"der"), visible, para ponerla en la mano (attach / enMano) o en el piso (botaEnPiso).
// Se esconde sola en cada cuadro (utileriaReset). No esconde la de la pierna: para eso, botas(k, { izq: 0 }).
const BOTAS_SUELTAS = [];
function botaSuelta(k, lado = "der") { const i = lado === "izq" || lado === 0 ? 0 : 1; k.botaS ||= []; let b = k.botaS[i]; if (!b) { b = k.botaS[i] = botaNueva(k.botaG[i].userData.esc); b.scale.multiplyScalar(k.body.scale.y); b.userData.prop = 1; BOTAS_SUELTAS.push(b) } b.visible = true; return b }
// botaEnPiso(b, x, z, { ry, volcada }): la bota en el piso del mundo (ALT); volcada 0→1 la acuesta de costado
function botaEnPiso(b, x, z, { ry = 0, volcada = 0, y = null } = {}) { const par = ME.g.parent; if (b.parent !== par) par.add(b); b.visible = true; b.rotation.set(0, ry, volcada * Math.PI / 2); b.position.set(x, (y ?? ALT(x, z)) + volcada * .3 * b.scale.x, z); return b }

// ---------- accesorios de cabeza propios (pocos polígonos, color liso): gorro de lana con pompón, gorra plana, colitas, velo
function gorroLana(k, { col, banda = null, pompon = null, orejeras = false } = {}) { const h = k.head, m = accMat(col), mb = accMat(banda || oscV(col, .8));
  part(new THREE.CylinderGeometry(.46, .5, .14, 8), mb, 0, .69, -.01, h, 0).userData.pelo = 1;                              // el doblez
  const d = part(new THREE.CylinderGeometry(.24, .46, .3, 8), m, 0, .9, -.03, h, 0); d.userData.pelo = 1;                  // la copa
  part(new THREE.CylinderGeometry(.25, .25, .04, 8), m, 0, 1.06, -.03, h, 0).userData.pelo = 1;
  if (pompon) gema(h, accMat(pompon), .13, 0, 1.13, -.03);
  if (orejeras) for (const s of [-1, 1]) bloque(h, mb, .1, .3, .3, s * .41, .5, -.02) }
function gorraPlana(k, { col }) { const h = k.head, m = accMat(col), md = accMat(oscV(col, .8)); const c = part(new THREE.CylinderGeometry(.46, .5, .2, 8), m, 0, .8, .02, h, 0); c.userData.pelo = 1; c.rotation.x = .14; c.scale.z = 1.04;
  const t = part(new THREE.CylinderGeometry(.3, .46, .07, 8), m, 0, .93, .04, h, 0); t.userData.pelo = 1; t.rotation.x = .14; bloque(h, md, .62, .05, .28, 0, .72, .46, .3) }
// colitas de Pip: dos mechones gruesos que salen debajo del gorro y FLAMEAN con el viento (pivote en la raíz)
function colitas(k, col, atado) { const m = accMat(col), md = accMat(oscV(col, .8)), ma = accMat(atado); k.flamea ||= [];
  for (const s of [-1, 1]) { const G = new THREE.Group(); G.position.set(s * .42, .5, -.1); k.head.add(G); trozo(G, m, [0, 0, 0], [s * .34, -.16, -.06], .12); trozo(G, md, [s * .02, -.03, 0], [s * .26, -.22, .04], .085); gema(G, ma, .065, s * .02, 0, 0);
    k.flamea.push({ g: G, rest: new THREE.Vector3(s, -.5, 0).normalize(), max: .9, fase: s }) } }
function velo(k, col = "#e9e2d4") { const G = new THREE.Group(); G.position.set(0, .74, -.22); k.head.add(G); const geo = new THREE.BoxGeometry(.66, .86, .02); geo.translate(0, -.43, -.05);
  part(geo, new THREE.MeshStandardMaterial({ color: col, roughness: .8, transparent: true, opacity: .88, flatShading: true }), 0, 0, 0, G, 0).castShadow = false;
  k.flamea ||= []; k.flamea.push({ g: G, rest: new THREE.Vector3(0, -1, -.25).normalize(), max: 1.25, fase: .7 }) }
// barba de pocos bloques, en su propio grupo (pivote en el mentón): con viento se inclina hacia +x
function barbaG(k, col) { const G = new THREE.Group(); G.position.set(0, .12, .3); k.head.add(G); const m = accMat(col), md = accMat(oscV(col, .86));
  bloque(G, m, .66, .24, .16, 0, -.08, 0); bloque(G, md, .5, .2, .14, 0, -.24, -.02); trozo(G, m, [0, -.2, 0], [0, -.5, 0], .14); for (const s of [-1, 1]) bloque(G, m, .12, .36, .42, s * .37, .08, -.2);
  k.flamea ||= []; k.flamea.push({ g: G, rest: new THREE.Vector3(0, -1, .2).normalize(), max: .4, fase: 2 }) }

// ---------- vestir: reconstruye al personaje con seis bloques + ropa pintada + botas de hierro + pelo en un grupo (para el viento)
// o: { skin, torso: {…torsoG}, brazo: {col, manga, puno, rayas, guante}, pierna: {col, largo, falda, faldaCol, ruedo, media, mediaRaya},
//      pelo: [estilo, col], gorro: {…gorroLana}, gorra: {col}, panuelo: [col, pelo], anteojos, barba: col, extra: (k) => {}, escala, bota: escala de bota, encorvado, liviana }
const MANO_INVIS = new THREE.MeshBasicMaterial({ visible: false });
function vestirG(k, o) { const skin = o.skin; k.skin = skin; k.r6 = true; delete k.falda; delete k.pasoMax; delete k.zancMax; k.encorvado = o.encorvado || 0; k.liviana = o.liviana || 0; k.flamea = [];
  [k.body, k.armL, k.armR, k.legL, k.legR].forEach(gr => [...gr.children].forEach(c => { if (c.isMesh || c.userData.pelo || c.userData.bota) gr.remove(c) })); [...k.head.children].forEach(c => { if (c !== k.decal) k.head.remove(c) });
  const plast = map => new THREE.MeshStandardMaterial({ map, roughness: .62 }), t = o.torso;
  part(RB(1.04, 1.04, .52, .05), boxMats(plast(torsoLado(t)), plast(torsoG(t)), plast(torsoG(t, true))), 0, 1.54, 0, k.body, 0);
  [k.armL, k.armR].forEach((a, i) => { part(RB(.5, 1.04, .5, .05), plast(brazoG({ skin, ...o.brazo })), 0, -.44, 0, a, 0); a.position.x = (i ? 1 : -1) * .77;
    const hd = i ? k.handR : k.handL; a.add(hd); hd.position.set(0, -.86, 0); hd.rotation.set(0, 0, 0); hd.material = MANO_INVIS; hd.castShadow = hd.receiveShadow = false });   // la mano: un ancla invisible para la utilería
  k.texPierna = [piernaG({ skin, ...o.pierna }), piernaG({ skin, ...o.pierna }, true)]; k.matPierna = [];
  k.botaG = [k.legL, k.legR].map((l, i) => { const m = plast(k.texPierna[0]); k.matPierna.push(m); part(RB(.5, 1.02, .5, .05), m, 0, -.5, 0, l, 0); l.position.x = (i ? 1 : -1) * .26;
    const b = botaNueva(o.bota || 1); b.position.set((i ? 1 : -1) * .018 * (o.bota || 1), -1.02, 0); b.userData.x0 = b.position.x; b.userData.bota = 1; l.add(b); return b });
  part(RB(.74, .66, .7, .075, 4), new THREE.MeshStandardMaterial({ color: skin, roughness: .55 }), 0, .38, 0, k.head, 0);
  k.decal.geometry = new THREE.PlaneGeometry(.74, .555); k.decal.position.set(0, .4, .3515); k.decal.material.transparent = true; k.decal.material.needsUpdate = true;
  // pelo y gorros: se arman en un grupo aparte y se FUNDEN en pocas mallas (una por color) dentro de k.peloG (lo inclina vientoPelo)
  const tmp = new THREE.Group(), fk = { head: tmp }; if (o.pelo) peloV(tmp, ...o.pelo); if (o.gorro) gorroLana(fk, o.gorro); if (o.gorra) gorraPlana(fk, o.gorra); if (o.panuelo) panueloV(fk, ...o.panuelo); if (o.coronita) o.coronita(tmp);
  tmp.updateMatrixWorld(true); const porCol = new Map(); tmp.traverse(m => { if (!m.isMesh) return; const key = m.material.color.getHexString() + (m.material.side || 0); if (!porCol.has(key)) porCol.set(key, [m.material, []]); porCol.get(key)[1].push([m.geometry, m.matrixWorld.clone()]) });
  k.peloG = new THREE.Group(); k.peloG.matrixAutoUpdate = false; k.head.add(k.peloG); porCol.forEach(([mat, list]) => { const me = part(mergeG(list), mat, 0, 0, 0, k.peloG, 0); me.userData.pelo = 1 });
  if (o.anteojos) anteojosV(k); if (o.barba) barbaG(k, o.barba); if (o.extra) o.extra(k);
  k.body.scale.setScalar(o.escala || 1); k.arrugas = 0; k._arena = null; setFace(k, "neutral"); return k }

// ---------- EL ELENCO
const PIP = ME6, TOBB = GARROW, TOBB_CHICO = PIM, MARTA = QUILL, NOVIO = FOLK[0], NOVIA = FOLK[1], MAMA = FOLK[2];
const VECINOS = [FOLK[3], FOLK[4], FOLK[5], EXT[0], EXT[1], EXT[2], EXT[3], PESCADOR];
for (const [sk, sh] of [["#e2b48e", "#5a7f8c"], ["#9a6444", "#d9ccb0"]]) { const k = kid({ skin: sk, shirt: sh, cloth: "plain", pants: "#3a3a3a", shoes: "#2a2420", hair: "#2b211b", style: "corto" }); TURT.add(k.g); ALL.push(k); VECINOS.push(k) }
const MEDIA_COL = "#ece4d2";
// el narrador (13): silueta de TRES colores planos — abrigo azul, bufanda mostaza, pantalón carbón — y pelo en puntas castaño oscuro
vestirG(ME, { skin: "#eebd94", torso: { col: "#2d64ad", abrigo: [null, "#1d4378"], bufanda: ["#f0ac22", null] }, brazo: { col: "#2d64ad", manga: .84, puno: "#1d4378" }, pierna: { col: "#38373c", media: MEDIA_COL, mediaRaya: "#2d64ad" }, pelo: ["puntas", "#3a2416"], escala: .9 });
// Pip (7, «la más liviana»): abrigo rojo con BOLSILLOS ABULTADOS llenos de piedras, gorro amarillo con pompón rojo (como sus cometas), colitas cobrizas, mitones amarillos
vestirG(PIP, { skin: "#f4cba6", torso: { col: "#d63a2c", bolsillos: "#d63a2c", abrigo: [null, "#f2c230"] }, brazo: { col: "#d63a2c", manga: .78, guante: "#f2c230" }, pierna: { col: "#3d4462", falda: .3, faldaCol: "#d63a2c", ruedo: "#f2c230", largo: .8, media: "#f4efe4", mediaRaya: "#d63a2c" },
  gorro: { col: "#f2c230", banda: "#e8a81e", pompon: "#d63a2c" }, escala: .72, liviana: 1,
  extra: k => { colitas(k, "#b8572a", "#d63a2c"); const piedras = [], r = rng(707); for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { const g = new THREE.IcosahedronGeometry(.045 + r() * .03, 0); g.scale(1, .8 + r() * .3, .9); piedras.push([g, new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(r() * 3, r() * 3, r() * 3)).setPosition(s * .264 + (i - 1.5) * .062, 1.46 + r() * .03, .262 + r() * .02)]) }
    part(mergeG(piedras), accMat("#8f8b84"), 0, 0, 0, k.body, 0) } });   // las piedras que asoman de los bolsillos (pocos polígonos)
// el viejo Tobb: abrigo largo verde con botones de palito, bufanda óxido a rayas crema (el color de su suéter de chico), gorra plana, pelo y barba blancos, encorvado, LAS BOTAS MÁS GRANDES
vestirG(TOBB, { skin: "#d8a882", torso: { col: "#4e6a48", abrigo: ["#3e5639", "#e2d6b8"], bufanda: ["#b3532e", "#efe2c4"] }, brazo: { col: "#4e6a48", manga: .84, puno: "#3e5639" }, pierna: { col: "#5a5048", falda: .32, largo: .8, ruedo: "#3e5639", faldaCol: "#4e6a48", media: MEDIA_COL, mediaRaya: "#b3532e" },
  pelo: ["bajo", "#d9d5cc"], gorra: { col: "#6b5e50" }, barba: "#dedad1", bota: 1.32, encorvado: .25 });
// Tobb de chico (11, el recuerdo): suéter óxido con guarda nórdica crema, pantalón marrón, pelo negro; sostiene UNA MEDIA (MEDIA_TOBB)
vestirG(TOBB_CHICO, { skin: "#e2ad86", torso: { col: "#b3532e", kind: "nordico", alt: "#efe2c4" }, brazo: { col: "#b3532e", manga: .8, puno: "#efe2c4" }, pierna: { col: "#6a5644", media: MEDIA_COL, mediaRaya: "#b3532e" }, pelo: ["corto", "#1e1a18"], escala: .82 });
// la vieja Marta: vestido azul oscuro, delantal crema con bolsillo, pañuelo bordó, pelo gris; lleva la TAZA CON TAPA
vestirG(MARTA, { skin: "#e0b394", torso: { col: "#3c4f7a", delantal: ["#efe6d2", "#c0503a"] }, brazo: { col: "#3c4f7a", manga: .82, puno: "#efe6d2" }, pierna: { col: "#2e3240", falda: .86, faldaCol: "#3c4f7a", ruedo: "#efe6d2", largo: .8, media: "#5a5a62", mediaRaya: "#3c4f7a" },
  panuelo: ["#8a3a4a", "#cfcac2"], anteojos: 1, encorvado: .12 });
// el novio: traje carbón pintado con camisa blanca, moño bordó y flor en la solapa
vestirG(NOVIO, { skin: "#c48a62", torso: { col: "#3a3a44", traje: ["#f4f0e8", "#8a2a34", "#f2c230"] }, brazo: { col: "#3a3a44", manga: .86, puno: "#f4f0e8" }, pierna: { col: "#33333c", media: "#3a3a44", mediaRaya: "#55555f" }, pelo: ["corto", "#241c18"] });
// la novia: vestido crema con encaje y faja dorada, coronita de flores y velo corto (flamea)
vestirG(NOVIA, { skin: "#f0c7a4", torso: { col: "#d6c9b0", encaje: "#ebe3d4", faja: ["#c09048"] }, brazo: { col: "#d6c9b0", manga: .5 }, pierna: { col: "#d6c9b0", falda: .88, faldaCol: "#d6c9b0", ruedo: "#c9a256", largo: .8, media: "#f2ece0", mediaRaya: "#c9a256" },
  pelo: ["rodete", "#6b4430"], coronita: h => { const cols = ["#f6f2ea", "#f2c230", "#e08a9a"]; for (let j = 0; j < 7; j++) { const a = (j / 6 - .5) * 2.4; gema(h, accMat(cols[j % 3]), .07, Math.sin(a) * .4, .8, Math.cos(a) * .32 - .02) } }, extra: k => velo(k) });
// la mamá: suéter ciruela con guarda nórdica, pollera larga gris pintada, rodete; lleva al BEBE_V en brazos
vestirG(MAMA, { skin: "#d9a07a", torso: { col: "#7a4a6a", kind: "nordico", alt: "#efe2d2" }, brazo: { col: "#7a4a6a", manga: .82 }, pierna: { col: "#3a3a40", falda: .84, faldaCol: "#5a5a62", ruedo: "#7a4a6a", largo: .8, media: "#3a3a40", mediaRaya: "#7a4a6a" }, pelo: ["rodete", "#3a2418"] });
// vecinos (chicos, adultos y viejos): lana de colores de montaña, un estampado cada uno, gorros, gorras y pañuelos
const VC = (k, o) => vestirG(k, { ...o, pierna: { media: MEDIA_COL, mediaRaya: "#7a6a5a", ...o.pierna } });
VC(VECINOS[0], { skin: "#d9b08c", torso: { col: "#7a5a3a", abrigo: ["#5e4429", "#d8ccb0"] }, brazo: { col: "#7a5a3a", manga: .84 }, pierna: { col: "#4a443e" }, pelo: ["bajo", "#d8d4cc"], gorro: { col: "#6f7378" }, barba: "#d8d4cc", encorvado: .18 });           // viejo
VC(VECINOS[1], { skin: "#c48a62", torso: { col: "#a33a2e", kind: "cuadros", alt: "#2a2626" }, brazo: { col: "#a33a2e", manga: .84, rayas: "#6e2620" }, pierna: { col: "#3b4a5e" }, pelo: ["bajo", "#1d1a17"], gorro: { col: "#2e3a59" } });   // leñador
VC(VECINOS[2], { skin: "#e8b48c", torso: { col: "#c9952e", abrigo: [null, "#6a4a22"], bufanda: ["#4f7a4a", "#efe2c4"] }, brazo: { col: "#c9952e", manga: .82, guante: "#4f7a4a" }, pierna: { col: "#4a3f36", falda: .7, faldaCol: "#c9952e", ruedo: "#6a4a22" }, panuelo: ["#4f7a4a", "#5a3a22"] });
VC(VECINOS[3], { skin: "#f2cfae", torso: { col: "#4f8a5a", kind: "franjas", alt: "#e9e2cc", bufanda: ["#c0392b", null] }, brazo: { col: "#4f8a5a", manga: .8, rayas: "#e9e2cc" }, pierna: { col: "#5a4a3c" }, pelo: ["puntas", "#d9b060"], escala: .76 });   // chico
VC(VECINOS[4], { skin: "#c98e64", torso: { col: "#6a4a8a", abrigo: [null, "#efe2d2"], kind: "lunares", alt: "#8a6aaa" }, brazo: { col: "#6a4a8a", manga: .8, guante: "#e08aa0" }, pierna: { col: "#3a3646", falda: .36, faldaCol: "#6a4a8a", ruedo: "#efe2d2" }, pelo: ["rulos", "#2b1d16"], gorro: { col: "#e08aa0", pompon: "#f4efe4" }, escala: .8 });   // chica
VC(VECINOS[5], { skin: "#e6c0a0", torso: { col: "#2e2e36", chal: ["#8a8478", "#c9b48a"] }, brazo: { col: "#8a8478", manga: .84 }, pierna: { col: "#2e2e36", falda: .86, faldaCol: "#2e2e36", ruedo: "#8a8478" }, panuelo: ["#5a3a4a", "#d8d4cc"], anteojos: 1, encorvado: .2 });   // vieja con chal
VC(VECINOS[6], { skin: "#a86c48", torso: { col: "#2f3f5e", abrigo: ["#24304a", "#c9a24a"] }, brazo: { col: "#2f3f5e", manga: .84, puno: "#24304a" }, pierna: { col: "#4a4038" }, gorra: { col: "#5a4a3a" }, pelo: ["bajo", "#3a2416"], barba: "#4a2e1c" });
VC(VECINOS[7], { skin: "#f0c6a0", torso: { col: "#e6dcc4", kind: "trenza", alt: "#cfc3a6", chaleco: ["#8a5a32"] }, brazo: { col: "#e6dcc4", manga: .82 }, pierna: { col: "#3a4a3a" }, pelo: ["corto", "#a8502a"] });
VC(VECINOS[8], { skin: "#e2b48e", torso: { col: "#3f7f7a", kind: "rayas", alt: "#2f625e", bufanda: ["#f4efe4", "#c0392b"] }, brazo: { col: "#3f7f7a", manga: .82 }, pierna: { col: "#2e2e36", falda: .34, faldaCol: "#3f7f7a", ruedo: "#2f625e" }, pelo: ["rodete", "#5a3a22"], escala: .88 });   // muchacha
VC(VECINOS[9], { skin: "#9a6444", torso: { col: "#d9ccb0", kind: "trenza", alt: "#bfb08e" }, brazo: { col: "#d9ccb0", manga: .84 }, pierna: { col: "#4a4038" }, gorro: { col: "#b8382c", banda: "#8a2a20" }, pelo: ["bajo", "#1d1a17"], barba: "#1d1a17" });
const ELENCO_V = [ME, PIP, TOBB, TOBB_CHICO, MARTA, NOVIA, NOVIO, MAMA, ...VECINOS];
const ELENCO_N = { ME, PIP, TOBB, TOBB_CHICO, MARTA, NOVIA, NOVIO, MAMA, ...Object.fromEntries(VECINOS.map((k, i) => ["V" + i, k])) };
ALL.forEach((k, i) => { k.idx = i; setFace(k, "neutral") });

// ---------- VIENTO EN EL PELO: vientoPelo(k, f, { t, dir }) — f = 0 (valle, quieto) … 1 (Gusthollow) … 1.5 (tormenta)
// El pelo y los gorros se inclinan (cizalla desde la altura de las orejas) hacia donde sopla (dir, en el MUNDO; por defecto VDIR = +x) y
// se sacuden; las colitas de Pip, el velo y las barbas FLAMEAN desde su raíz. Las poses de este archivo ya lo llaman.
function vientoPelo(k, f = 1, o = {}) { if (!k.peloG) return; const t = o.t ?? k._t ?? 0;
  if (!f) { k.peloG.matrix.identity(); k.peloG.matrixWorldNeedsUpdate = true; k.flamea.forEach(F => F.g.quaternion.identity()); return }
  k.g.updateMatrixWorld(true); k.head.getWorldQuaternion(_q1).invert(); const d = o.dir || VDIR, w = _v1.set(d[0] ?? d.x, d[1] ?? d.y, d[2] ?? d.z).normalize().applyQuaternion(_q1);
  const ph = (k.idx || 0) * 1.3, s = f * (.34 + .08 * Math.sin(t * 21 + ph) + .05 * Math.sin(t * 34 + ph * 2)), y0 = .42;
  k.peloG.matrix.set(1, w.x * s, 0, -w.x * s * y0, 0, 1, 0, 0, 0, w.z * s, 1, -w.z * s * y0, 0, 0, 0, 1); k.peloG.matrixWorldNeedsUpdate = true;
  k.flamea.forEach(F => { _v2.crossVectors(F.rest, w); const L = _v2.length(); if (L < 1e-4) { F.g.quaternion.identity(); return } const ang = Math.min(Math.acos(cl(F.rest.dot(w), -1, 1)), f * F.max) + f * .14 * Math.sin(t * 19 + F.fase * 3 + ph); F.g.quaternion.setFromAxisAngle(_v2.multiplyScalar(1 / L), ang) }) }

// ---------- helpers de pose (cuerpo entero con cuaterniones; brazos y piernas que apuntan a un punto del mundo)
// qMundo(k, arriba, frente): orientación del body (en coords de k.g) para que su cabeza apunte a `arriba` y su pecho a `frente` (vectores del MUNDO)
function qMundo(k, arriba, frente, out = new THREE.Quaternion()) { _ay.set(...arriba).normalize(); _az.set(...frente); _az.addScaledVector(_ay, -_az.dot(_ay)); if (_az.lengthSq() < 1e-6) _az.set(1, 0, 0).addScaledVector(_ay, -_ay.x);
  _az.normalize(); _ax.crossVectors(_ay, _az); _mb.makeBasis(_ax, _ay, _az); out.setFromRotationMatrix(_mb); k.g.updateWorldMatrix(true, false); k.g.getWorldQuaternion(_q2); return out.premultiply(_q2.invert()) }
// cuerpoQ(k, q, pivL, pivG): el body toma la orientación q y el punto pivL (coords del body, sin escala) queda en pivG (coords de k.g)
function cuerpoQ(k, q, pivL, pivG) { const b = k.body, s = b.scale.y; b.quaternion.copy(q); _v3.set(...pivL).multiplyScalar(s).applyQuaternion(q); b.position.set(pivG[0] - _v3.x, pivG[1] - _v3.y, pivG[2] - _v3.z) }
// apuntar(k, miembro, p): el brazo/pierna (k.armL, k.armR, k.legL, k.legR) apunta con su punta al punto p del MUNDO (Vector3)
function apuntar(k, m, p) { k.g.updateMatrixWorld(true); _v1.copy(p); m.parent.worldToLocal(_v1); _v1.sub(m.position); if (_v1.lengthSq() < 1e-8) return; m.quaternion.setFromUnitVectors(_ABAJO, _v1.normalize()) }
// inclinarViento(k, ang): inclina el cuerpo entero (desde los pies) `ang` radianes CONTRA el viento (hacia −x del mundo), mire hacia donde mire
function inclinarViento(k, ang, lado = 0) { k.g.updateWorldMatrix(true, false); k.g.getWorldQuaternion(_q1); const fw = _v1.set(0, 0, 1).applyQuaternion(_q1), rw = _v2.set(1, 0, 0).applyQuaternion(_q1);
  const lz = -VDIR[0] * fw.x - VDIR[2] * fw.z, lx = -VDIR[0] * rw.x - VDIR[2] * rw.z; k.body.rotation.set(ang * lz - lado * lx, 0, -ang * lx - lado * lz) }
// mezclaPoses(k, fA, fB, u): arma la pose A (callback), después la B, y deja la mezcla (u = 0 → A, 1 → B). Sirve para transiciones.
const _MIEM = k => [k.armL, k.armR, k.legL, k.legR, k.head];
function fotoPose(k) { return { bq: k.body.quaternion.clone(), bp: k.body.position.clone(), m: _MIEM(k).map(o => o.quaternion.clone()) } }
function mezclaPoses(k, fA, fB, u) { fA(); const A = fotoPose(k); fB(); const B = fotoPose(k); k.body.quaternion.slerpQuaternions(A.bq, B.bq, u); k.body.position.lerpVectors(A.bp, B.bp, u); _MIEM(k).forEach((o, i) => o.quaternion.slerpQuaternions(A.m[i], B.m[i], u)) }

// ---------- UTILERÍA (escondida por defecto en cada cuadro). attach(obj, k, "R"|"L", [x, y, z]) del motor o enMano(…), que además la deja derecha.
function tuboAf(pts, r0, r1, RS = 8, TS = 16, plano = 1) { const cu = new THREE.CatmullRomCurve3(pts.map(q => new THREE.Vector3(...q))), geo = new THREE.TubeGeometry(cu, TS, 1, RS, false), p = geo.attributes.position, v = new THREE.Vector3(), fr = cu.computeFrenetFrames(TS, false);
  for (let i = 0; i <= TS; i++) { const c = cu.getPointAt(i / TS), rad = lerp(r0, r1, i / TS); for (let j = 0; j <= RS; j++) { const q = i * (RS + 1) + j; v.fromBufferAttribute(p, q).sub(c); const a = v.dot(fr.normals[i]), b = v.dot(fr.binormals[i]); v.copy(fr.normals[i]).multiplyScalar(a * rad).addScaledVector(fr.binormals[i], b * rad * plano).add(c); p.setXYZ(q, v.x, v.y, v.z) } }
  geo.computeVertexNormals(); return geo }
const M_MADERA_U = new THREE.MeshStandardMaterial({ color: "#8a6238", roughness: .75, flatShading: true });
const PROP = g => { g.visible = false; g.userData.prop = 1; return g };
// enMano(obj, k, mano, { off, derecho, viento }): en la mano; derecho = queda vertical en el mundo (taza, media colgando) aunque el brazo esté inclinado;
// viento f > 0: lo que cuelga se inclina hacia +x y flamea. Llamar DESPUÉS de posar los brazos.
function enMano(obj, k, mano = "R", { off = [0, -.12, .12], derecho = true, viento = 0 } = {}) { attach(obj, k, mano, off); if (!derecho) return obj; const h = mano === "R" ? k.handR : k.handL, t = k._t || 0;
  k.g.updateMatrixWorld(true); h.getWorldQuaternion(_q1); k.g.getWorldQuaternion(_q2); _q3.setFromAxisAngle(_v1.set(0, 0, 1), viento * (1.15 + .18 * Math.sin(t * 15 + k.idx) + .08 * Math.sin(t * 31)));
  obj.quaternion.copy(_q1.invert().multiply(_q3).multiply(_q2)); return obj }
// el bastón del viejo Tobb (si está en su mano, quieto()/andar() lo dejan vertical y apoyado en el piso)
const BASTON = PROP(new THREE.Group());
{ const v = part(new THREE.CylinderGeometry(.034, .026, 1, 7), M_MADERA_U, 0, -.5, 0, BASTON, 0); BASTON.userData.vara = new THREE.Group(); BASTON.add(BASTON.userData.vara); BASTON.userData.vara.add(v);
  part(tuboAf([[0, -.02, 0], [0, .1, 0], [0, .17, .05], [0, .17, .15], [0, .1, .2]], .036, .03, 6, 10), M_MADERA_U, 0, 0, 0, BASTON, 0); part(new THREE.CylinderGeometry(.034, .04, .07, 7), BOTA.suela, 0, -.98, 0, BASTON.userData.vara, 0) }
function bastonAlPiso(k) { if (!BASTON.visible || (BASTON.parent !== k.handR && BASTON.parent !== k.handL)) return; k.g.updateMatrixWorld(true); const h = BASTON.parent; h.getWorldQuaternion(_q1); k.g.getWorldQuaternion(_q2); BASTON.quaternion.copy(_q1.invert().multiply(_q2));
  BASTON.getWorldPosition(_v1); k.g.getWorldPosition(_v2); BASTON.userData.vara.scale.y = Math.max(.2, _v1.y - _v2.y) }
// la taza con tapa de Marta: loza azul esmaltada con guarda blanca, tapa con perilla, asa
const TAZA_TAPA = PROP(new THREE.Group());
{ const m = new THREE.MeshStandardMaterial({ color: "#3d6aa8", roughness: .32, flatShading: true }), b = new THREE.MeshStandardMaterial({ color: "#f2ede2", roughness: .35, flatShading: true });
  part(new THREE.CylinderGeometry(.12, .105, .24, 10), m, 0, .12, 0, TAZA_TAPA, 0); part(new THREE.CylinderGeometry(.122, .122, .035, 10), b, 0, .17, 0, TAZA_TAPA, 0);
  part(new THREE.CylinderGeometry(.13, .13, .03, 10), m, 0, .255, 0, TAZA_TAPA, 0); part(new THREE.IcosahedronGeometry(.035, 0), b, 0, .285, 0, TAZA_TAPA, 0);
  const a = part(new THREE.TorusGeometry(.065, .018, 5, 8, Math.PI), m, .125, .13, 0, TAZA_TAPA, 0); a.rotation.z = -Math.PI / 2 }
// la media de Tobb chico: lana crema con la raya óxido (la misma media pintada de sus piernas); cuelga desde arriba
const MEDIA_TOBB = PROP(new THREE.Group());
{ const t = tex(64, 128, (g, w, h) => { g.fillStyle = MEDIA_COL; g.fillRect(0, 0, w, h); g.fillStyle = "#b3532e"; g.fillRect(0, 10, w, 12); g.fillRect(0, 28, w, 5); g.fillStyle = "rgba(0,0,0,.12)"; g.fillRect(0, h - 20, w, 20) }), m = new THREE.MeshStandardMaterial({ map: t, roughness: .8 });
  part(RB(.17, .36, .1, .03, 1), m, 0, -.2, 0, MEDIA_TOBB, 0); part(RB(.17, .11, .24, .04, 1), m, 0, -.34, .08, MEDIA_TOBB, 0) }
// el bebé: bulto en una manta tejida amarilla a rayas, carita dormida, gorrito, y DOS BOTITAS DE HIERRO chiquitas que asoman abajo
const BEBE_V = PROP(new THREE.Group());
{ const t = tex(128, 128, (g, w, h) => { g.fillStyle = "#f2d27a"; g.fillRect(0, 0, w, h); g.fillStyle = "#e9e2cc"; for (let y = 10; y < h; y += 32) g.fillRect(0, y, w, 12); sombra2D(g, w, h, .1) }), m = new THREE.MeshStandardMaterial({ map: t, roughness: .7 });
  part(RB(.38, .56, .32, .06, 2), m, 0, 0, 0, BEBE_V, 0); part(RB(.27, .25, .25, .03, 2), new THREE.MeshStandardMaterial({ color: "#f0c7a4", roughness: .55 }), 0, .38, .02, BEBE_V, 0);
  const go = part(new THREE.CylinderGeometry(.13, .17, .14, 8), accMat("#e9e2cc"), 0, .5, 0, BEBE_V, 0); go.rotation.x = -.15;
  const cara = tex(256, 192, g => { g.strokeStyle = TINTA; g.lineCap = "round"; g.lineWidth = 11; for (const x of [84, 172]) { g.beginPath(); g.moveTo(x - 20, 82); g.quadraticCurveTo(x, 100, x + 20, 82); g.stroke() } g.fillStyle = BORDO; g.beginPath(); g.ellipse(128, 138, 10, 9, 0, 0, 7); g.fill() });
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(.25, .19), new THREE.MeshStandardMaterial({ map: cara, transparent: true, roughness: .8, depthWrite: false })); pl.position.set(0, .38, .148); BEBE_V.add(pl);
  for (const s of [-1, 1]) { const b = botaNueva(.32); b.position.set(s * .09, -.36, .02); BEBE_V.add(b) } }
// acunar(k, obj): la mamá sostiene al bebé contra el pecho con los dos brazos (llamar después de quieto/andar/quietoViento)
function acunar(k, obj = BEBE_V) { if (obj.parent !== k.body) k.body.add(obj); obj.visible = true; obj.position.set(-.08, 1.62, .48); obj.rotation.set(.3, 0, -1.15); obj.scale.setScalar(1);
  k.armL.rotation.set(-.75, 0, .5); k.armR.rotation.set(-.85, 0, -.5); k.head.rotation.x = .22; k.head.rotation.z = -.08 }
// la cometa nueva de Pip: rombo con cuadrantes amarillo/rojo, varillas, y una cola con moños que flamea hacia +x
const COMETA_PIP = PROP(new THREE.Group());
{ const t = tex(256, 320, (g, w, h) => { const cx = 128, cy = 112; [["#f2c230", 0, 0, cx, cy], ["#d63a2c", cx, 0, w, cy], ["#d63a2c", 0, cy, cx, h], ["#f2c230", cx, cy, w, h]].forEach(([c, a, b, x2, y2]) => { g.fillStyle = c; g.fillRect(a, b, x2 - a, y2 - b) });
    g.strokeStyle = "#5a3a22"; g.lineWidth = 7; g.beginPath(); g.moveTo(cx, 0); g.lineTo(cx, h); g.moveTo(0, cy); g.lineTo(w, cy); g.stroke() }), sh = new THREE.Shape(); sh.moveTo(0, .55); sh.lineTo(.38, .15); sh.lineTo(0, -.65); sh.lineTo(-.38, .15); sh.closePath();
  const geo = new THREE.ShapeGeometry(sh), p = geo.attributes.position, uv = geo.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + .38) / .76, (p.getY(i) + .65) / 1.2);
  part(geo, new THREE.MeshStandardMaterial({ map: t, roughness: .7, side: THREE.DoubleSide }), 0, 0, 0, COMETA_PIP, 0); COMETA_PIP.userData.cola = [];
  for (let i = 0; i < 5; i++) { const mo = new THREE.Group(); COMETA_PIP.add(mo); for (const s of [-1, 1]) { const c = part(new THREE.ConeGeometry(.06, .13, 3), accMat(i % 2 ? "#f2c230" : "#d63a2c", { side: THREE.DoubleSide }), s * .06, 0, 0, mo, 0); c.rotation.z = s * Math.PI / 2; c.scale.z = .3 } COMETA_PIP.userData.cola.push(mo) } }
// ---------- cuerdas (soga de los novios, hilo de la cometa, cola de la cometa): tubo de pocas caras que se rehace cada cuadro entre puntos del mundo
const T_SOGA_V = tex(64, 16, (g, w, h) => { g.fillStyle = "#b8975e"; g.fillRect(0, 0, w, h); g.strokeStyle = "#7a5e34"; g.lineWidth = 4; for (let x = -16; x < w + 16; x += 12) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + 10, 0); g.stroke() } }); T_SOGA_V.wrapS = T_SOGA_V.wrapT = THREE.RepeatWrapping;
const M_SOGA_V = new THREE.MeshStandardMaterial({ map: T_SOGA_V, roughness: .85 }), M_HILO_V = new THREE.MeshStandardMaterial({ color: "#f2eee4", roughness: .8 });
function cuerdaNueva(r, mat, TS = 18, RS = 5, rep = 14) { const N = (TS + 1) * (RS + 1), geo = new THREE.BufferGeometry(), idx = [], uv = new Float32Array(N * 2);
  for (let i = 0; i < TS; i++) for (let j = 0; j < RS; j++) { const a = i * (RS + 1) + j, b = a + RS + 1; idx.push(a, b, a + 1, b, b + 1, a + 1) }
  for (let i = 0; i <= TS; i++) for (let j = 0; j <= RS; j++) { uv[(i * (RS + 1) + j) * 2] = i / TS * rep; uv[(i * (RS + 1) + j) * 2 + 1] = j / RS }
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3)); geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); geo.setIndex(idx);
  const m = new THREE.Mesh(geo, mat); m.frustumCulled = false; m.castShadow = true; m.userData.prop = 1; m.visible = false; scene.add(m);
  const P0 = new THREE.Vector3(), P1 = new THREE.Vector3(), P2 = new THREE.Vector3(), c = new THREE.Vector3(), T = new THREE.Vector3(), Nn = new THREE.Vector3(), B = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  m.poner = (a, b, d) => { P0.copy(a); P1.copy(b); P2.copy(d); const p = geo.attributes.position;
    for (let i = 0; i <= TS; i++) { const u = i / TS, v = 1 - u; c.set(0, 0, 0).addScaledVector(P0, v * v).addScaledVector(P1, 2 * u * v).addScaledVector(P2, u * u); T.set(0, 0, 0).addScaledVector(P0, -2 * v).addScaledVector(P1, 2 * v - 2 * u).addScaledVector(P2, 2 * u).normalize();
      Nn.crossVectors(T, up); if (Nn.lengthSq() < 1e-6) Nn.set(1, 0, 0); Nn.normalize(); B.crossVectors(T, Nn);
      for (let j = 0; j <= RS; j++) { const an = j / RS * 6.283, q = i * (RS + 1) + j; p.setXYZ(q, c.x + (Nn.x * Math.cos(an) + B.x * Math.sin(an)) * r, c.y + (Nn.y * Math.cos(an) + B.y * Math.sin(an)) * r, c.z + (Nn.z * Math.cos(an) + B.z * Math.sin(an)) * r) } }
    p.needsUpdate = true; geo.computeVertexNormals(); m.visible = true; return m };
  return m }
const SOGA_N = cuerdaNueva(.035, M_SOGA_V), HILO_C = cuerdaNueva(.008, M_HILO_V, 16, 3, 1), COLA_C = cuerdaNueva(.007, M_HILO_V, 12, 3, 1);
// anillo de soga atado a la cintura (rectángulo redondeado alrededor del torso); uno por novio, se crea la primera vez
function anilloSoga(k) { if (k.anillo) return k.anillo; const pts = [], a = .575, b = .315, r = .1; for (let i = 0; i < 16; i++) { const an = i / 16 * 6.283, cx = Math.sign(Math.cos(an)) * (a - r), cz = Math.sign(Math.sin(an)) * (b - r); pts.push(new THREE.Vector3(cx + Math.cos(an) * r * 1.4, 0, cz + Math.sin(an) * r * 1.4)) }
  k.anillo = PROP(part(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 40, .036, 5, true), M_SOGA_V, 0, 1.12, 0, k.body, 0)); return k.anillo }
// sogaNovios(a, b, t, { comba, viento }): la soga que une a los novios por la cintura (anillo en cada uno + el tramo que cuelga entre los dos)
function sogaNovios(a = NOVIA, b = NOVIO, t = 0, { comba = .35, viento = 1 } = {}) { [a, b].forEach(k => anilloSoga(k).visible = true); a.g.updateMatrixWorld(true); b.g.updateMatrixWorld(true);
  const A = a.body.localToWorld(new THREE.Vector3(0, 1.12, 0)), B = b.body.localToWorld(new THREE.Vector3(0, 1.12, 0)), d = B.clone().sub(A), L = d.length(); d.normalize();
  const pa = A.clone().addScaledVector(d, .56 * a.body.scale.y), pb = B.clone().addScaledVector(d, -.56 * b.body.scale.y), mid = pa.clone().add(pb).multiplyScalar(.5);
  mid.y -= comba * Math.max(.2, L - 1.1); mid.x += viento * (.22 + .06 * Math.sin(t * 9)) * Math.max(.3, L - 1); SOGA_N.poner(pa, mid, pb) }
// cometaPip(t, pos, { mira, f }): pone la cometa de Pip en pos (mundo) mirando hacia `mira` (por ej. Pip), con la cola flameando hacia +x; devuelve el punto del hilo
function cometaPip(t, pos, { mira = null, f = 1 } = {}) { const C = COMETA_PIP; if (C.parent !== scene) scene.add(C); C.visible = true; C.position.set(...pos); if (mira) C.lookAt(_v1.set(...mira)); C.rotateZ(.25 + .12 * Math.sin(t * 2.3)); C.rotateX(-.35 + .06 * Math.sin(t * 3.1));
  C.updateMatrixWorld(true); const cola = [], base = C.localToWorld(new THREE.Vector3(0, -.65, 0)); for (let i = 1; i <= 5; i++) { const q = i / 5; cola.push(base.clone().add(_v1.set(f * q * 1.6, -q * 1.1 + Math.sin(t * 7 - i) * .12, Math.sin(t * 5 - i * 1.3) * .15 * q))) }
  C.userData.cola.forEach((mo, i) => { C.worldToLocal(mo.position.copy(cola[i])); mo.rotation.set(0, 0, Math.sin(t * 9 + i) * .4) }); COLA_C.poner(base, cola[1], cola[4]);
  return C.localToWorld(new THREE.Vector3(0, -.05, .02)) }
function utileriaReset() { [BASTON, TAZA_TAPA, MEDIA_TOBB, BEBE_V, COMETA_PIP, SOGA_N, HILO_C, COLA_C, ...BOTAS_SUELTAS].forEach(o => o.visible = false); [NOVIA, NOVIO].forEach(k => { if (k.anillo) k.anillo.visible = false }) }

// ================= ANIMACIÓN (se llaman DESPUÉS de pose(); dejan al personaje listo) =================
// pose() del motor queda envuelta: limpia lo que estas funciones tocan (nada queda pegado de un cuadro al otro): botas puestas, pelo sin viento,
// utilería escondida una vez por cuadro.
{ const pose0 = pose; let tUlt = -1e9;
  pose = (k, t, o = {}) => { if (t !== tUlt) { tUlt = t; utileriaReset() } k._t = t; k.body.position.x = 0; k.body.position.z = 0; k.body.rotation.y = 0; k.body.rotation.z = 0; k.armL.rotation.y = 0; k.armR.rotation.y = 0; k.legL.rotation.y = 0; k.legR.rotation.y = 0; k.legL.rotation.z = 0; k.legR.rotation.z = 0;
    if (k.botaG) { botas(k); k.botaG.forEach(b => b.position.set(b.userData.x0, -1.02, 0)) } if (k.peloG) vientoPelo(k, 0); pose0(k, t, o) } }
// quiebre de cadera (el torso gira en la cadera y las piernas siguen rectas; sin codos ni rodillas). lean = inclinación del torso; psi = ángulo de las piernas
function cadera(k, lean, psi = 0) { const b = k.body, L0 = b.rotation.x, s = b.scale.y, d = lean - L0;
  b.rotation.x = lean; k.legL.rotation.x += psi - d; k.legR.rotation.x += psi - d; b.position.z -= H_CAD * s * ((Math.sin(lean) - Math.sin(L0)) - Math.sin(psi)); b.position.y -= H_CAD * s * ((Math.cos(lean) - Math.cos(L0)) - (Math.cos(psi) - 1)) }
const _fase = k => (k.idx || 0) * 1.7;
// quieto(k, t, { mira, viento }): parado derecho, brazos en «A». viento = cuánto se mueve el pelo (0 en el valle)
function quieto(k, t, { mira = 0, viento = 0 } = {}) { const A = A_BRAZO; k._t = t;
  k.legL.rotation.set(0, 0, 0); k.legR.rotation.set(0, 0, 0); k.armL.rotation.set(0, 0, -A); k.armR.rotation.set(0, 0, A); k.head.rotation.set(0, mira, 0); k.body.rotation.set(0, 0, 0); k.body.position.set(0, 0, 0);
  if (k.encorvado) { cadera(k, k.encorvado); k.head.rotation.x = -k.encorvado * .75; k.armL.rotation.x = k.encorvado * .8; k.armR.rotation.x = k.encorvado * .8; if (BASTON.visible && BASTON.parent === k.handR) k.armR.rotation.set(-.45, 0, .12) }
  bastonAlPiso(k); vientoPelo(k, viento, { t }); parpadeo(k, t) }
// caminata normal (valle): ciclo de 0,5 s; piernas ±27,5°, brazos ±7° en «A», balanceo ±5°
function andar(k, t, { vel = 1, viento = 0 } = {}) { const f = t * vel / .5 * Math.PI * 2 + _fase(k), sw = Math.sin(f), amp = k.pasoMax ?? .48, A = A_BRAZO, s = k.body.scale.y; k._t = t;
  k.body.rotation.set(0, 0, sw * .087); k.body.position.set(0, -H_CAD * s * (1 - Math.cos(amp * sw)), 0);
  k.legL.rotation.set(sw * amp, 0, 0); k.legR.rotation.set(-sw * amp, 0, 0); k.armL.rotation.set(-sw * .12, 0, -A); k.armR.rotation.set(sw * .12, 0, A); k.head.rotation.set(0, 0, -sw * .04);
  if (k.encorvado) { cadera(k, k.encorvado); k.head.rotation.x = -k.encorvado * .75; if (BASTON.visible && BASTON.parent === k.handR) k.armR.rotation.set(-.55 - k.encorvado + sw * .25, 0, .12) }
  bastonAlPiso(k); vientoPelo(k, viento, { t }); parpadeo(k, t) }
// corrida: ciclo de 0,5 s; torso 20° adelante; fuerte = 1: brazos que bombean
function correrV(k, t, { fuerte = 0, viento = 0 } = {}) { const f = t / .5 * Math.PI * 2 + _fase(k), sw = Math.sin(f), amp = k.zancMax ?? .87, A = A_BRAZO, lean = .35, s = k.body.scale.y; k._t = t;
  k.body.rotation.set(0, 0, 0); k.body.position.set(0, Math.abs(sw) * .13 * s, 0); k.legL.rotation.set(sw * amp, 0, 0); k.legR.rotation.set(-sw * amp, 0, 0); cadera(k, lean);
  const b0 = lerp(.38, -1.2, fuerte), ba = lerp(.06, .55, fuerte), bz = lerp(A * .7, .12, fuerte); k.armL.rotation.set(b0 - sw * ba, 0, -bz); k.armR.rotation.set(b0 + sw * ba, 0, bz); k.head.rotation.set(-lean * .7, 0, 0);
  vientoPelo(k, viento, { t }); parpadeo(k, t) }
// bambolea(k, t, q): Pip, la más liviana, se tambalea (suma encima de cualquier pose de viento): balanceo grande, un pie que se levanta, brazos que buscan equilibrio
function bambolea(k, t, q = 1) { if (!q) return; const ph = k.idx * .9, a = Math.sin(t * 3.3 + ph), b = Math.sin(t * 5.1 + ph * 2);
  k.body.rotation.z += q * (.08 * a + .03 * b); k.body.rotation.x += q * .05 * Math.sin(t * 4.3 + ph); k.legL.rotation.x -= q * .3 * Math.max(0, a); k.legR.rotation.x -= q * .3 * Math.max(0, -a);
  k.armL.rotation.z -= q * (.5 + .4 * Math.max(0, a)); k.armR.rotation.z += q * (.5 + .4 * Math.max(0, -a)); k.head.rotation.z -= q * .08 * a }
// quietoViento(k, t, { lean, brazos, bambolea }): parado AGUANTANDO el viento: todo el cuerpo inclinado contra el viento (~18°, hacia −x del mundo, mire
// hacia donde mire), piernas abiertas, tambaleo leve. brazos: "abajo" (empujados hacia atrás), "cubre" (se tapa la cara), "abiertos" (equilibrio)
function quietoViento(k, t, { lean = .32, brazos = "abajo", bambolea: bb = k.liviana, viento = 1 } = {}) { const ph = (k.idx || 0) * 1.1, s = k.body.scale.y; k._t = t;
  const L = lean * (1 + .1 * Math.sin(t * 2.1 + ph) + .06 * Math.sin(t * 5.3 + ph)); inclinarViento(k, L, .03 * Math.sin(t * 1.7 + ph)); k.body.position.set(0, 0, 0);
  k.legL.rotation.set(0, 0, -.09); k.legR.rotation.set(0, 0, .09); k.head.rotation.set(.12, 0, .03 * Math.sin(t * 3 + ph));
  const fl = .06 * Math.sin(t * 11 + ph);
  if (brazos === "cubre") { k.armL.rotation.set(-2.2 + fl, 0, .62); k.armR.rotation.set(-2.2 - fl, 0, -.62); k.head.rotation.x = .25 }
  else if (brazos === "abiertos") { k.armL.rotation.set(.1 + fl, 0, -1.05 + fl); k.armR.rotation.set(.1 - fl, 0, 1.05 - fl) }
  else { k.armL.rotation.set(.32 + fl, 0, -.38); k.armR.rotation.set(.32 - fl, 0, .38) }
  if (BASTON.visible && BASTON.parent === k.handR) k.armR.rotation.set(-.5, 0, .14);
  bambolea(k, t, bb); bastonAlPiso(k); vientoPelo(k, viento, { t }); parpadeo(k, t) }
// andarViento(k, t, { vel, lean, bambolea }): caminar INCLINADO contra el viento: cuerpo ~20° hacia −x (si camina hacia −x se ve inclinado hacia
// adelante; si camina hacia +x, hacia atrás), pasos cortos y pesados (ciclo de 0,8 s, piernas ±16°), golpe de bota en cada paso, brazos firmes adelante
function andarViento(k, t, { vel = 1, lean = .35, bambolea: bb = k.liviana, viento = 1 } = {}) { const f = t * vel / .8 * Math.PI * 2 + _fase(k), sw = Math.sin(f), amp = .28, s = k.body.scale.y; k._t = t;
  inclinarViento(k, lean, sw * .06); k.body.position.set(0, -H_CAD * s * (1 - Math.cos(amp * sw)) - .035 * s * (1 - Math.abs(Math.cos(f))), 0);
  k.legL.rotation.set(sw * amp, 0, -.05); k.legR.rotation.set(-sw * amp, 0, .05); k.armL.rotation.set(-.38 - sw * .16, 0, -.3); k.armR.rotation.set(-.38 + sw * .16, 0, .3); k.head.rotation.set(.16, 0, -sw * .05);
  if (BASTON.visible && BASTON.parent === k.handR) k.armR.rotation.set(-.6 + sw * .22, 0, .14);
  bambolea(k, t, bb * .7); bastonAlPiso(k); vientoPelo(k, viento, { t }); parpadeo(k, t) }
// aplastado(k, t, { mira, sacude }): tirado BOCA ABAJO agarrándose del piso (el viento lo aplasta), sacudiéndose. k.g en los pies; el cuerpo queda tendido
// hacia el frente (+z local): para que la cabeza quede contra el viento, ry = −π/2 (mirando a −x). mira = cuánto levanta la cabeza
function aplastado(k, t, { mira = .9, sacude = 1, viento = 1.2 } = {}) { const s = k.body.scale.y, ph = k.idx * 1.3; k._t = t;
  k.body.rotation.set(Math.PI / 2, 0, sacude * .025 * Math.sin(t * 27 + ph)); k.body.position.set(sacude * .01 * Math.sin(t * 31 + ph), .27 * s, 0);
  k.armL.rotation.set(-Math.PI + .12 + sacude * .04 * Math.sin(t * 23 + ph), 0, -.28); k.armR.rotation.set(-Math.PI + .12 + sacude * .04 * Math.sin(t * 21 + ph + 1), 0, .28);
  k.legL.rotation.set(sacude * (.18 + .12 * Math.sin(t * 13 + ph)), 0, -.12); k.legR.rotation.set(sacude * (.18 + .12 * Math.sin(t * 13 + ph + 2.2)), 0, .12);
  k.head.rotation.set(-mira, 0, sacude * .03 * Math.sin(t * 19 + ph)); vientoPelo(k, viento, { t }); parpadeo(k, t) }
// sentadoDesata(k, t, { lado, lean }): sentado en el piso con las piernas adelante, inclinado, desatando la correa de la bota de `lado` ("izq"|"der").
// k.g queda en la cola (el cuerpo apoyado); las piernas van hacia +z local
function sentadoDesata(k, t, { lado = "der", lean = .72, tirando = 0, viento = 1 } = {}) { const s = k.body.scale.y, i = lado === "izq" ? 0 : 1, leg = i ? k.legR : k.legL, sg = i ? 1 : -1; k._t = t;
  const rx = lean - tirando * .3; k.body.rotation.set(rx, sg * .14, -sg * .05); _v1.set(0, H_CAD, 0).multiplyScalar(s).applyEuler(k.body.rotation); k.body.position.set(-_v1.x, .27 * s - _v1.y, -_v1.z);
  k.legL.rotation.set(-Math.PI / 2 - rx + .04, 0, -.07); k.legR.rotation.set(-Math.PI / 2 - rx + .04, 0, .07); leg.rotation.x -= .1;
  k.head.rotation.set(.38, sg * .1, 0); k.g.updateMatrixWorld(true);
  const j = .03 * Math.sin(t * 15) * (1 - tirando), bota = k.botaG[i]; for (const [arm, dx] of [[k.armL, -.09], [k.armR, .09]]) apuntar(k, arm, bota.localToWorld(_v2.set(dx / bota.scale.x, .3 + j * 3, .25 + j)));
  vientoPelo(k, viento, { t }); parpadeo(k, t) }
// sacaBota(k, t, lado, q): sentado, con q 0→1 tira de la bota y la saca (la bota se desliza por la pierna); con q ≥ 1 la bota queda en sus manos
// (la de la pierna se esconde y se ve la media). Devuelve la bota suelta cuando q ≥ 1 (si no, null).
function sacaBota(k, t, lado = "der", q = 0, o = {}) { const i = lado === "izq" ? 0 : 1; q = cl(q); sentadoDesata(k, t, { ...o, lado, tirando: Math.min(1, q * 1.4) });
  if (q < 1) { const b = k.botaG[i]; b.position.y = -1.02 - _suave(q) * .55; b.position.z = .02 * Math.sin(t * 13) * (1 - q); k.g.updateMatrixWorld(true); for (const [arm, dx] of [[k.armL, -.09], [k.armR, .09]]) apuntar(k, arm, b.localToWorld(_v2.set(dx, .3, .2))); return null }
  botas(k, i ? { der: 0 } : { izq: 0 }); k.armL.rotation.set(-1.15, 0, .38); k.armR.rotation.set(-1.15, 0, -.38); const b = botaSuelta(k, lado); attach(b, k, "R", [-.3, -.05, .08]); b.rotation.set(-.4, 0, 1.3); return b }
// volar(k, t, { alto, dir, frente, rollo, giro, flameo }): llevado por el viento: cuerpo casi horizontal, girando un poco, brazos y piernas sacudidos.
// k.g.position = el pecho (si alto = 0). dir = hacia dónde apunta la CABEZA en el mundo (por defecto contra el viento y un poco arriba: va de espaldas,
// con los pies hacia +x); frente = hacia dónde mira el pecho (por defecto +z, hacia la cámara de frente); rollo gira el cuerpo sobre su eje
function volar(k, t, { alto = 0, dir = [-1, .3, 0], frente = [0, 0, 1], rollo = 0, giro = 1, flameo = 1, viento = 1.3 } = {}) { const ph = (k.idx || 0) * 1.7; k._t = t;
  const d = _v1.set(...dir).normalize(), fr = _v2.set(...frente).applyAxisAngle(d, rollo + giro * (.3 * Math.sin(t * 1.3 + ph) + .08 * Math.sin(t * 3.7))); d.x += giro * .08 * Math.sin(t * 1.9 + ph); d.y += giro * .06 * Math.sin(t * 2.3);
  cuerpoQ(k, qMundo(k, d.toArray(), fr.toArray(), _q3), [0, 1.45, 0], [0, alto, 0]);
  k.armL.rotation.set(-.5 + .55 * flameo * Math.sin(t * 8.3 + ph), 0, -(1.65 + .5 * flameo * Math.sin(t * 12.1 + ph))); k.armR.rotation.set(-.5 + .55 * flameo * Math.sin(t * 7.7 + ph + 1.5), 0, 1.65 + .5 * flameo * Math.sin(t * 11.3 + ph + .7));
  k.legL.rotation.set(.35 * flameo * Math.sin(t * 9.7 + ph), 0, -.14 - .1 * flameo * Math.sin(t * 13 + ph)); k.legR.rotation.set(-.35 * flameo * Math.sin(t * 9.7 + ph) + .1, 0, .14 + .1 * flameo * Math.sin(t * 14 + ph));
  k.head.rotation.set(-.15 + .06 * Math.sin(t * 17 + ph), 0, .05 * Math.sin(t * 13)); vientoPelo(k, viento, { t }); parpadeo(k, t) }
// volarHacia(k, t, { alto, dir, frente, objetivo }): vuela DE CABEZA hacia dir con los dos brazos estirados adelante (para ir a agarrar algo);
// objetivo (Vector3 del mundo, opcional): los brazos apuntan ahí. El pelo va hacia atrás (contra el avance)
function volarHacia(k, t, { alto = 0, dir = [1, .15, 0], frente = [0, 0, 1], rollo = 0, objetivo = null, giro = .5 } = {}) { const ph = (k.idx || 0) * 1.7; k._t = t;
  const d = _v1.set(...dir).normalize(), fr = _v2.set(...frente).applyAxisAngle(d, rollo + giro * .15 * Math.sin(t * 1.6 + ph)); const D = d.toArray();
  cuerpoQ(k, qMundo(k, D, fr.toArray(), _q3), [0, 1.45, 0], [0, alto, 0]);
  const j = .05 * Math.sin(t * 15 + ph); k.armL.rotation.set(-Math.PI + .1 + j, 0, -.13); k.armR.rotation.set(-Math.PI + .1 - j, 0, .13);
  k.legL.rotation.set(.12 * Math.sin(t * 10 + ph), 0, -.04); k.legR.rotation.set(-.12 * Math.sin(t * 10 + ph), 0, .04); k.head.rotation.set(-.55, 0, 0);
  if (objetivo) { k.g.updateMatrixWorld(true); const ob = objetivo.isVector3 ? objetivo : _v3.set(...objetivo); for (const [arm, dx] of [[k.armL, -.15], [k.armR, .15]]) { _v2.set(dx, 0, 0).applyQuaternion(k.body.getWorldQuaternion(_q1)).add(ob); apuntar(k, arm, _v2) } }
  vientoPelo(k, 1.3, { t, dir: [-D[0], -D[1], -D[2]] }); parpadeo(k, t) }
// despega(k, t, q, { alto, … }): q 0 → parado aguantando el viento; q 1 → volando (como volar con alto = 1.6): los pies dejan el piso primero
function despega(k, t, q, o = {}) { const u = _suave(q); mezclaPoses(k, () => quietoViento(k, t, o), () => volar(k, t, { alto: 1.6, ...o, flameo: u }), u); vientoPelo(k, 1 + .3 * u, { t }) }
// colgado(k, t, { fuerza, frente }): colgado de algo con los dos brazos arriba; el viento lo deja casi horizontal con las piernas flameando hacia +x.
// k.g.position = el punto donde se agarra (las manos). frente = hacia dónde mira el pecho (mundo)
function colgado(k, t, { fuerza = 1, frente = [0, 0, 1], viento = 1.4 } = {}) { const ph = (k.idx || 0) * 1.3, th = fuerza * (1.22 + .13 * Math.sin(t * 7.3 + ph) + .06 * Math.sin(t * 17 + ph)); k._t = t;
  cuerpoQ(k, qMundo(k, [-Math.sin(th), Math.cos(th), 0], frente, _q3), [0, 2.76, 0], [0, 0, 0]); k.g.updateMatrixWorld(true);
  const g0 = k.g.getWorldPosition(new THREE.Vector3()); k.body.getWorldQuaternion(_q1); for (const [arm, dx] of [[k.armL, -.26], [k.armR, .26]]) apuntar(k, arm, _v2.set(dx, 0, 0).applyQuaternion(_q1).add(g0));
  k.legL.rotation.set(.3 * Math.sin(t * 12 + ph), 0, -.1 - .08 * Math.sin(t * 15)); k.legR.rotation.set(.3 * Math.sin(t * 12 + ph + 2.5), 0, .1 + .08 * Math.sin(t * 16)); k.head.rotation.set(-.1, 0, .06 * Math.sin(t * 9));
  vientoPelo(k, viento, { t }); parpadeo(k, t) }
// abrazoVuelo(a, b, t, { pos, ry, dir, giro }): los dos hermanos ABRAZADOS volando juntos (pecho con pecho; b, Pip, un poco más arriba).
// pos = punto medio en coords del padre de k.g (si falta, usa a.g.position); dir = hacia dónde apuntan las cabezas (mundo); ry gira la pareja sobre su eje
function abrazoVuelo(a, b, t, { pos = null, ry = 0, dir = [1, .2, 0], giro = 1, viento = 1.3 } = {}) { a._t = b._t = t; const P = pos ? new THREE.Vector3(...pos) : a.g.position.clone();
  const up = new THREE.Vector3(...dir).normalize(), fr = new THREE.Vector3(0, 0, 1).applyAxisAngle(up, ry + giro * .35 * Math.sin(t * .9)); fr.addScaledVector(up, -fr.dot(up)).normalize();
  _mb.makeBasis(new THREE.Vector3().crossVectors(up, fr), up, fr); const Fw = new THREE.Quaternion().setFromRotationMatrix(_mb); a.g.parent.getWorldQuaternion(_q2); const F = _q2.clone().invert().multiply(Fw);
  [[a, 0, 0], [b, Math.PI, .1]].forEach(([k, yaw, dy]) => { const s = k.body.scale.y; k.g.visible = true; k.g.position.copy(P); k.g.quaternion.copy(F).multiply(_q1.setFromAxisAngle(_v1.set(0, 1, 0), yaw)); cuerpoQ(k, _q2.identity(), [0, 1.48, 0], [0, dy, -(.26 * s + .015)]) });
  a.armL.rotation.set(-1.32, 0, .5); a.armR.rotation.set(-1.32, 0, -.5); b.armL.rotation.set(-2.15, 0, .55); b.armR.rotation.set(-2.15, 0, -.55);
  [a, b].forEach((k, i) => { const ph = i * 2; k.legL.rotation.set(.3 * Math.sin(t * 9 + ph), 0, -.1); k.legR.rotation.set(-.3 * Math.sin(t * 9 + ph), 0, .1); k.head.rotation.set(-.1, i ? .35 : -.35, 0); vientoPelo(k, viento, { t, dir: [-up.x, -up.y, -up.z] }); parpadeo(k, t) }) }
// acostadoEspaldas(k, t, { sentar, brazos }): de espaldas en el pasto, brazos abiertos, mirando al cielo; sentar 0→1 se sienta (apoyado en las manos).
// k.g en los talones; la cabeza queda hacia −z local
function acostadoEspaldas(k, t, { sentar = 0, brazos = 1, viento = 0 } = {}) { const s = k.body.scale.y, u = _suave(sentar), rx = lerp(-Math.PI / 2, -.12, u); k._t = t;
  k.body.rotation.set(rx, 0, 0); _v1.set(0, H_CAD, 0).multiplyScalar(s).applyEuler(k.body.rotation); k.body.position.set(-_v1.x, .29 * s - _v1.y, -H_CAD * s - _v1.z);
  k.legL.rotation.set(-Math.PI / 2 - rx, 0, -.1); k.legR.rotation.set(-Math.PI / 2 - rx, 0, .1);
  k.armL.rotation.set(lerp(0, .55, u), 0, -lerp(1.35 * brazos, .3, u)); k.armR.rotation.set(lerp(0, .55, u), 0, lerp(1.35 * brazos, .3, u)); k.head.rotation.set(lerp(0, .05, u), 0, 0);
  vientoPelo(k, viento, { t }); parpadeo(k, t) }
// sostieneCometa(k, t, { cometa, tiron }): con el hilo de una cometa en las dos manos, tironeado (se inclina hacia atrás; cada tanto un tirón).
// cometa = [x, y, z] del mundo donde está (la pone y dibuja el hilo); si falta, solo brazos arriba-adelante
function sostieneCometa(k, t, { cometa = null, tiron = 1, viento = 1 } = {}) { const ph = (k.idx || 0) * 1.3, tir = tiron * Math.pow(Math.max(0, Math.sin(t * 2.6 + ph)), 6); k._t = t;
  quietoViento(k, t, { lean: .12 - .1 * tir, bambolea: 0, viento }); k.body.rotation.x -= .12 * tiron - .22 * tir; k.legL.rotation.x = .18; k.legR.rotation.x = -.12;
  if (!cometa) { k.armL.rotation.set(-2.3 - tir * .3, 0, .2); k.armR.rotation.set(-2.3 - tir * .3, 0, -.2) }
  else { const C = cometaPip(t, cometa, { mira: k.g.getWorldPosition(_v3).toArray() }); k.g.updateMatrixWorld(true); const P0 = k.head.getWorldPosition(new THREE.Vector3()); const dirK = C.clone().sub(P0).normalize();
    for (const [arm, dx] of [[k.armL, -.05], [k.armR, .05]]) apuntar(k, arm, _v2.copy(P0).addScaledVector(dirK, 2).add(_v1.set(dx, -.3 + tir * .4, 0)));
    k.g.updateMatrixWorld(true); const m = k.handL.getWorldPosition(new THREE.Vector3()).add(k.handR.getWorldPosition(_v1)).multiplyScalar(.5); m.addScaledVector(dirK, .15);
    const mid = m.clone().lerp(C, .5); mid.y -= .25 * m.distanceTo(C) * .12 * (1 - tir); HILO_C.poner(m, mid, C) }
  bambolea(k, t, k.liviana * .5); parpadeo(k, t) }
// agarraBrazo(a, b, t, { mano, de, tira }): a (Tobb) agarra del brazo a b (el narrador): la mano de a va al brazo `de` de b y lo tironea hacia sí
function agarraBrazo(a, b, t, { mano = "R", de = "L", tira = .3 } = {}) { const am = mano === "R" ? a.armR : a.armL, bm = de === "R" ? b.armR : b.armL; a.g.updateMatrixWorld(true); b.g.updateMatrixWorld(true);
  const hombroA = am.getWorldPosition(new THREE.Vector3()), manoB = bm.localToWorld(new THREE.Vector3(0, -.86, 0)); apuntar(b, bm, manoB.lerp(hombroA, tira));
  b.g.updateMatrixWorld(true); apuntar(a, am, bm.localToWorld(new THREE.Vector3(0, -.5, 0))) }
// gestos LINEALES (dur = 0,4 s), se quedan en la pose; `fin`: tiempo en que vuelve. tipos: senala, cubre, brazos, alza, abraza, sopla, tira, grita, escucha, agita
const GESTOS = {
  senala: { R: [-1.5, 0], lean: 0 }, alza: { R: [-3.0, .1] }, escucha: { R: [0, 2.95], hz: -.14, hy: -.18 }, para: { R: [-1.6, -.2], hx: -.06 },
  cubre: { L: [-2.2, .62], R: [-2.2, -.62], hx: .16, lean: .1 }, brazos: { L: [0, -.94], R: [0, .94], hx: -.06, lean: -.07 }, abraza: { L: [-1.2, .42], R: [-1.2, -.42] },
  sopla: { L: [-2.05, .45], R: [-2.05, -.45], lean: .32, hx: -.22 }, tira: { L: [-1.25, .14], R: [-1.25, -.14], lean: -.3, hx: .12 }, grita: { L: [-2.0, -.14], R: [-2.0, .14], lean: .26, hx: -.2 },
  agita: { R: [-1.6, .1] }, manosCabeza: { L: [-2.7, .9], R: [-2.7, -.9], hx: .1 } };
function gesto(k, t, t0, tipo, { dur = .4, fin = null, mano = "R", alto = 0 } = {}) { const G = GESTOS[tipo]; if (!G) return 0; let u = P(t, t0, t0 + dur); if (fin != null) u *= 1 - P(t, fin, fin + dur); if (u <= 0) return 0;
  const esp = mano === "L" && !G.L, ap = (a, [x, z], sg) => { a.rotation.x = lerp(a.rotation.x, x, u); a.rotation.z = lerp(a.rotation.z, z * sg, u) };
  if (G.L) ap(k.armL, G.L, 1); if (G.R) { const [x, z] = G.R, xx = tipo === "senala" ? x - alto : x; esp ? ap(k.armL, [xx, z], -1) : ap(k.armR, [xx, z], 1) }
  if (G.lean) cadera(k, lerp(k.body.rotation.x, k.body.rotation.x + G.lean, u));
  if (G.hx) k.head.rotation.x += G.hx * u; if (G.hz) k.head.rotation.z += G.hz * u * (esp ? -1 : 1); if (G.hy) k.head.rotation.y += G.hy * u * (esp ? -1 : 1);
  if (u >= 1 && tipo === "agita") { const q = ((t - t0 - dur) / (16 * F30)) % 1, tri = q < .5 ? q * 4 - 1 : 3 - q * 4, a = esp ? k.armL : k.armR; a.rotation.x = -1.6 + tri * .38 }
  return u }
// caída: el cuerpo tieso vuelca en 16 cuadros (dir = 1 de cara, −1 de espaldas) y queda acostado
function caer(k, t, t0, { dir = -1, dur = 16 * F30 } = {}) { const u = P(t, t0, t0 + dur); if (u <= 0) return 0; const a = u * u * Math.PI / 2, s = k.body.scale.y; k.body.rotation.x = dir * a; k.body.position.y = Math.sin(a) * .3 * s; k.body.position.z = -dir * Math.sin(a) * .3 * s; k.head.rotation.set(0, 0, 0); return u }
// salto: se agacha 8 cuadros, salta tieso y cae (14 cuadros en el aire); devuelve la altura
function saltar(k, t, t0, { alto = .9, aire = 14 * F30 } = {}) { const ta = 8 * F30, s = k.body.scale.y; if (t <= t0 || t >= t0 + ta + aire) return 0;
  if (t < t0 + ta) { const c = (t - t0) / ta; cadera(k, .5 * c, -.42 * c); k.armL.rotation.x = .5 * c; k.armR.rotation.x = .5 * c; k.head.rotation.x -= .3 * c; return 0 }
  const v = (t - t0 - ta) / aire, y = alto * 4 * v * (1 - v) * s; k.body.position.y += y; k.armL.rotation.z = -A_BRAZO - .25; k.armR.rotation.z = A_BRAZO + .25; return y }
