// ================= ELENCO DE DUSTMERE (diseños propios, estilo de bloques) + utilería + animales + animación medida =================
// Todo personaje nuevo: ropa de desierto (ponchos, lino, chalecos, pañuelos, fajas, sandalias, sombreros de paja), un color por
// prenda con UN estampado que se lee de lejos, tela con trama y relieve. Paleta: vecinos apagados, el narrador (verde jade) y
// Bee (amarillo con franjas) los únicos colores fuertes.
const ARENA_C = "#c9b28c", H_CAD = 1.02, A_BRAZO = .42, F30 = 1 / 30;
const _osc = (c, f = .75) => "#" + new THREE.Color(c).multiplyScalar(f).getHexString();
const _mix = (a, b, q) => "#" + new THREE.Color(a).lerp(new THREE.Color(b), q).getHexString();

// ---------- telas: trama pintada + estampado único (512 px) y relieve (T_TELA del motor)
const TELAS = {};
function tramaG(g, w, h, seed, f = 1) { const r = rng(seed); for (let y = 0; y < h; y += 4) { g.fillStyle = `rgba(0,0,0,${(.035 + r() * .05) * f})`; g.fillRect(0, y, w, 1); g.fillStyle = `rgba(255,255,255,${(.03 + r() * .04) * f})`; g.fillRect(0, y + 2, w, 1) }
  for (let x = 0; x < w; x += 4) { g.fillStyle = `rgba(0,0,0,${(.025 + r() * .04) * f})`; g.fillRect(x, 0, 1, h) }
  for (let k = 0; k < 90; k++) { g.fillStyle = `rgba(${r() < .5 ? "0,0,0" : "255,255,255"},${.03 + r() * .05})`; g.fillRect(r() * w, r() * h, 6 + r() * 40, 2) }
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(255,255,255,.07)"); gr.addColorStop(1, "rgba(0,0,0,.13)"); g.fillStyle = gr; g.fillRect(0, 0, w, h) }
function telaTex(kind, base, alt = "#efe6d0", back = false) { const key = [kind, base, alt, back].join(); return TELAS[key] ||= tex(512, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h); g.fillStyle = alt; g.strokeStyle = alt; g.lineJoin = "miter";
    if (kind === "rayas") for (let x = 34; x < w; x += 86) g.fillRect(x, 0, 30, h);
    if (kind === "franjas") for (let y = 70; y < h; y += 150) g.fillRect(0, y, w, 62);
    if (kind === "guarda") { g.fillRect(0, 196, w, 14); g.fillRect(0, 330, w, 14); for (let x = 0; x < w; x += 64) { g.beginPath(); g.moveTo(x + 32, 222); g.lineTo(x + 60, 270); g.lineTo(x + 32, 318); g.lineTo(x + 4, 270); g.closePath(); g.fill() } }
    if (kind === "rombos") { for (let i = 0; i < 3; i++) { const x = 86 + i * 170; g.beginPath(); g.moveTo(x, 150); g.lineTo(x + 62, 262); g.lineTo(x, 374); g.lineTo(x - 62, 262); g.closePath(); g.fill(); g.fillStyle = base; g.beginPath(); g.moveTo(x, 214); g.lineTo(x + 26, 262); g.lineTo(x, 310); g.lineTo(x - 26, 262); g.closePath(); g.fill(); g.fillStyle = alt } }
    if (kind === "zigzag") { g.lineWidth = 26; for (const y0 of [200, 300]) { g.beginPath(); for (let i = -1; i <= 9; i++) g.lineTo(i * 64, y0 + (i % 2 ? -34 : 34)); g.stroke() } }
    if (kind === "lunares") for (let y = 50, f = 0; y < h; y += 104, f++) for (let x = f % 2 ? 100 : 36; x < w; x += 128) { g.beginPath(); g.arc(x, y, 24, 0, 7); g.fill() }
    if (kind === "lino" && !back) { g.fillStyle = _osc(base, .8); g.fillRect(250, 0, 12, 250) }
    tramaG(g, w, h, 300 + kind.length * 7 + (back ? 1 : 0)) }) }
const brazoD = (shirt, skin, manga, banda) => TELAS["b" + [shirt, skin, manga, banda]] ||= tex(128, 256, (g, w, h) => { const y = h * manga; g.fillStyle = shirt; g.fillRect(0, 0, w, y); if (banda) { g.fillStyle = banda; g.fillRect(0, y - 44, w, 14); g.fillRect(0, y - 20, w, 8) } tramaG(g, w, y, 41);
  g.fillStyle = skin; g.fillRect(0, y, w, h - y); g.fillStyle = "rgba(0,0,0,.2)"; g.fillRect(0, y, w, 7) });
const piernaD = (pants, skin, largo, sand, ruedo) => TELAS["p" + [pants, skin, largo, sand, ruedo]] ||= tex(128, 256, (g, w, h) => { const y = h * largo; g.fillStyle = skin; g.fillRect(0, 0, w, h);
  if (pants) { g.fillStyle = pants; g.fillRect(0, 0, w, y); if (ruedo) { g.fillStyle = ruedo; g.fillRect(0, y - 22, w, 12) } g.fillStyle = "rgba(0,0,0,.14)"; g.fillRect(w / 2 - 2, 0, 4, y * .9); tramaG(g, w, y, 43); g.fillStyle = "rgba(0,0,0,.22)"; g.fillRect(0, y, w, 6) }
  g.fillStyle = sand; g.fillRect(0, h * .875, w, 12); g.fillRect(0, h * .95, w, h * .05) });
const mTela = map => new THREE.MeshStandardMaterial({ map, roughness: .88, bumpMap: T_TELA, bumpScale: 1.4 });
const mLisa = (col, o = {}) => new THREE.MeshStandardMaterial({ color: col, roughness: .88, bumpMap: T_TELA, bumpScale: 1.4, ...o });

// ---------- vestir: robloxify + telas propias; brazos a 0,42 del ancho del torso (medido en la referencia)
function vestir(k, { skin, shirt, cloth = "lino", alt = "#efe6d0", pants = "#5a4e42", manga = .82, banda = null, largo = .8, ruedo = null, sand = "#5a3a22", pelo = null, escala = 1 }) {
  robloxify(k, { skin, shirt, alt, cloth: "plain", pants: pants || skin, shoes: sand, manga, pelo });
  const torso = k.body.children.find(c => c.isMesh && Math.abs(c.position.y - 1.54) < .01); const lado = mTela(telaTex("liso", shirt, alt));
  torso.material = boxMats(lado, mTela(telaTex(cloth, shirt, alt)), mTela(telaTex(cloth, shirt, alt, true)));
  [k.armL, k.armR].forEach((a, i) => { const m = a.children.find(c => c.isMesh); m.material = mTela(brazoD(shirt, skin, manga, banda)); m.scale.x = .88; a.position.x = (i ? 1 : -1) * .745 });
  [k.legL, k.legR].forEach(l => { const m = l.children.find(c => c.isMesh); m.material = mTela(piernaD(pants, skin, largo, sand, ruedo));
    part(RB(.54, .05, .62, .02), SM(_osc(sand, .8), { roughness: .8 }), 0, -1.0, .04, l, 0); part(RB(.525, .05, .525, .02), SM(sand, { roughness: .7 }), 0, -.895, 0, l, 0); part(RB(.14, .06, .3, .02), SM(sand, { roughness: .7 }), 0, -.95, .13, l, 0) });   // sandalia: suela, tira del tobillo y tira del empeine
  if (escala !== 1) k.body.scale.setScalar(escala); k.ropa = { skin, shirt, alt, pants }; return k }

// ---------- prendas en 3D (sin atravesar brazos: los paños del poncho quedan dentro del ancho del torso y las hombreras van en el brazo)
const PONCHOT = {};
function ponchoTex(col, alt, alt2) { return PONCHOT[col + alt + alt2] ||= tex(512, 512, (g, w, h) => { g.fillStyle = col; g.fillRect(0, 0, w, h); const V = (d, lw, c) => { g.strokeStyle = c; g.lineWidth = lw; g.lineJoin = "miter"; g.beginPath(); g.moveTo(-10, 276 - d - 5); g.lineTo(256, 500 - d); g.lineTo(522, 276 - d - 5); g.stroke() };
    V(40, 18, alt); V(128, 18, alt); for (let i = 0; i < 9; i++) { const u = (i + .5) / 9, x = u * w, yv = (x < 256 ? lerp(271, 500, x / 256) : lerp(500, 271, (x - 256) / 256)) - 84; g.fillStyle = alt2; g.beginPath(); g.moveTo(x, yv - 26); g.lineTo(x + 20, yv); g.lineTo(x, yv + 26); g.lineTo(x - 20, yv); g.closePath(); g.fill() }
    g.strokeStyle = _osc(col, .6); g.lineWidth = 3; for (let x = 8; x < w; x += 14) { const yv = x < 256 ? lerp(271, 500, x / 256) : lerp(500, 271, (x - 256) / 256); g.beginPath(); g.moveTo(x, yv - 2); g.lineTo(x, yv + 16); g.stroke() }
    tramaG(g, w, h, 77, 1.3) }) }
function poncho(k, col, alt = "#efe6d0", alt2 = alt) { const m = mTela(ponchoTex(col, alt, alt2)), b = k.body;
  for (const s of [1, -1]) { const sh = new THREE.Shape(); sh.moveTo(-.535, 2.085); sh.lineTo(.535, 2.085); sh.lineTo(.535, 1.56); sh.lineTo(0, 1.1); sh.lineTo(-.535, 1.56); sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: .035, bevelEnabled: true, bevelSize: .012, bevelThickness: .012, bevelSegments: 2 }), p = geo.attributes.position, uv = geo.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + .535) / 1.07, (p.getY(i) - 1.1) / .985);
    const me = part(geo, m, 0, 0, s > 0 ? .262 : -.262, b, 0); if (s < 0) me.rotation.y = Math.PI }
  part(RB(1.07, .06, .6, .02), mLisa(col), 0, 2.07, 0, b, 0); part(RB(.56, .05, .5, .02), mLisa(_osc(col, .62)), 0, 2.085, 0, b, 0);                       // hombros y abertura del cuello
  [k.armL, k.armR].forEach(a => { part(RB(.5, .5, .56, .04), mLisa(col), 0, -.13, 0, a, 0); part(RB(.51, .07, .57, .02), mLisa(alt), 0, -.3, 0, a, 0) }) }   // hombrera del poncho, con su guarda (se mueve con el brazo)
function chaleco(k, col, vivo = null) { const m = mLisa(col), b = k.body; for (const s of [-1, 1]) { part(RB(.35, 1.0, .04, .015), m, s * .345, 1.545, .262, b, 0); if (vivo) part(RB(.04, 1.0, .045, .01), mLisa(vivo), s * .18, 1.545, .264, b, 0) }
  part(RB(1.045, 1.0, .04, .015), m, 0, 1.545, -.262, b, 0); part(RB(1.06, .05, .56, .02), m, 0, 2.065, 0, b, 0) }
function faja(k, col, alt = null) { const m = mLisa(col), b = k.body; part(RB(1.09, .2, .57, .04), m, 0, 1.13, 0, b, 0); if (alt) part(RB(1.1, .05, .58, .02), mLisa(alt), 0, 1.13, 0, b, 0);
  part(RB(.17, .2, .09, .04), m, .3, 1.13, .29, b, 0); part(RB(.05, .34, .2, .02), m, .565, .93, .02, b, 0) }
function panueloCuello(k, col) { const m = mLisa(col), b = k.body; part(RB(.78, .13, .62, .05), m, 0, 2.03, 0, b, 0); const t = part(new THREE.ConeGeometry(.24, .34, 4), m, 0, 1.83, .268, b, 0); t.rotation.set(Math.PI, Math.PI / 4, 0); t.scale.z = .22; part(RB(.12, .1, .1, .04), m, 0, 2.0, -.3, b, 0) }
function cuello(k, col) { part(RB(.7, .09, .58, .03), mLisa(col), 0, 2.035, 0, k.body, 0); for (const s of [-1, 1]) { const t = part(new THREE.ConeGeometry(.13, .2, 4), mLisa(col), s * .14, 1.95, .268, k.body, 0); t.rotation.set(Math.PI, Math.PI / 4, 0); t.scale.z = .2 } }
// pollera / vestido: un bloque que se abre hacia abajo (las piernas dan pasos más cortos adentro: k.pasoMax)
function falda(k, col, { hasta = .55, alt = null, kind = "liso" } = {}) { const h = 1.06 - hasta, geo = new THREE.BoxGeometry(1, 1, 1, 6, 6, 6), p = geo.attributes.position, wb = 1.06 + h * .42, db = .56 + h * .62;
  for (let i = 0; i < p.count; i++) { const f = .5 - p.getY(i), e = Math.pow(f, .8); p.setXYZ(i, p.getX(i) * lerp(1.07, wb, e), p.getY(i) * h, p.getZ(i) * lerp(.56, db, e)) } geo.computeVertexNormals();
  const t = tex(512, 512, (g, w, hh) => { g.fillStyle = col; g.fillRect(0, 0, w, hh); if (alt) { g.fillStyle = alt; if (kind === "franjas") for (let y = 150; y < hh; y += 170) g.fillRect(0, y, w, 70); else { g.fillRect(0, hh - 96, w, 30); g.fillRect(0, hh - 46, w, 14) } } tramaG(g, w, hh, 91, 1.2); g.fillStyle = "rgba(0,0,0,.1)"; for (let x = 40; x < w; x += 102) g.fillRect(x, 0, 8, hh) });
  part(geo, mTela(t), 0, 1.06 - h / 2, 0, k.body, 0); k.falda = hasta; k.pasoMax = hasta < .4 ? .2 : .34; k.zancMax = hasta < .4 ? .3 : .5 }

// ---------- sombrero de paja de ala ancha (echado hacia atrás: los ojos siempre a la vista), pañuelo en la cabeza, pelo bajo el sombrero
const T_PAJA_EL = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(4411); c.fillStyle = "#d8b973"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 14) { c.fillStyle = `rgba(110,78,30,${.3 + r() * .2})`; c.fillRect(0, y, w, 3); z.fillStyle = "rgba(0,0,0,.6)"; z.fillRect(0, y, w, 4); z.fillStyle = "rgba(255,255,255,.35)"; z.fillRect(0, y + 6, w, 4);
    for (let x = (y / 14 % 2) * 8; x < w; x += 16) { c.fillStyle = `rgba(${r() < .5 ? "255,236,170" : "140,100,40"},${.18 + r() * .25})`; c.fillRect(x, y + 3, 8, 11); z.fillStyle = "rgba(0,0,0,.4)"; z.fillRect(x + 7, y + 3, 2, 11) } } });
const M_PAJA_EL = new THREE.MeshStandardMaterial({ map: T_PAJA_EL[0], bumpMap: T_PAJA_EL[1], bumpScale: 2.5, roughness: .95, side: THREE.DoubleSide });
function peloBajo(k, col, largo = 0) { const mt = new THREE.MeshStandardMaterial({ map: mechTex(col, 7), roughness: .5, flatShading: true });
  for (const s of [-1, 1]) for (let j = 0; j < 3; j++) mechR(k.head, mt, [[s * .36, .68, -.02 - j * .12], [s * .4, .5, -.05 - j * .12], [s * .385, .3 - largo, -.03 - j * .1]], .075, .02, 1.5);
  for (let j = 0; j < 5; j++) mechR(k.head, mt, [[-.28 + j * .14, .68, -.34], [-.28 + j * .14, .46, -.395], [-.26 + j * .13, .26 - largo, -.37]], .08, .02, 1.5) }
function sombrero(k, { cinta = "#a8553a", tilt = -.2, ala = .8, pelo = null } = {}) { if (pelo) peloBajo(k, pelo); const G = new THREE.Group(); G.position.set(0, .7, -.02); G.rotation.x = tilt; k.head.add(G); G.userData.pelo = 1;
  const pr = [[.37, .0], [.5, -.012], [ala * .8, -.045], [ala, -.075], [ala + .012, -.09], [ala * .8, -.068], [.5, -.04], [.37, -.03]].map(([a, b]) => new THREE.Vector2(a, b)), ge = new THREE.LatheGeometry(pr, 56), p = ge.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), rr = Math.hypot(x, z), a = Math.atan2(x, z), q = cl((rr - .37) / (ala - .37)); p.setY(i, p.getY(i) + q * q * (Math.sin(a * 3 + 1) * .03 + Math.sin(a * 7) * .012)); const e = 1 + q * q * q * Math.sin(a * 23) * .012; p.setX(i, x * e); p.setZ(i, z * e) } ge.computeVertexNormals(); part(ge, M_PAJA_EL, 0, 0, 0, G, 0);
  const co = [[.385, -.01], [.375, .12], [.35, .25], [.3, .32], [.2, .35], [.001, .355]].map(([a, b]) => new THREE.Vector2(a, b)); part(new THREE.LatheGeometry(co, 40), M_PAJA_EL, 0, 0, 0, G, 0);
  part(new THREE.CylinderGeometry(.385, .392, .075, 40, 1, true), mLisa(cinta, { side: THREE.DoubleSide }), 0, .045, 0, G, 0); return G }
function panueloCabeza(k, col, pelo = null) { const m = mLisa(col); cascoPelo(k.head, m, { frente: .63, lado: .4, nuca: .2, vol: .5, ondas: 5 }).scale.set(1.035, 1.03, 1.035);
  const n = part(RB(.16, .12, .1, .04), m, 0, .3, -.4, k.head, 0); for (const s of [-1, 1]) { const c = part(new THREE.ConeGeometry(.07, .3, 4), m, s * .09, .14, -.42, k.head, 0); c.rotation.set(Math.PI - .25, 0, s * .3); c.scale.z = .4 }
  if (pelo) { const mt = new THREE.MeshStandardMaterial({ map: mechTex(pelo, 9), roughness: .5, flatShading: true }); for (const s of [-1, 1]) { mechR(k.head, mt, [[s * .05, .66, .335], [s * .2, .63, .35], [s * .34, .52, .33]], .05, .012, 1.4); mechR(k.head, mt, [[s * .37, .6, .12], [s * .385, .44, .14], [s * .375, .28, .1]], .05, .012, 1.4) } } }
function anteojos(k) { const m = SM("#3a2a1e", { metalness: .4, roughness: .4 }), v = new THREE.MeshStandardMaterial({ color: "#dfe8ea", transparent: true, opacity: .22, roughness: .1 });
  for (const s of [-1, 1]) { part(new THREE.TorusGeometry(.092, .013, 8, 28), m, s * .105, .425, .345, k.head, 0); part(new THREE.CircleGeometry(.09, 24), v, s * .105, .425, .344, k.head, 0); part(RB(.02, .02, .3, .005), m, s * .2, .43, .2, k.head, 0) } part(RB(.05, .016, .016, .005), m, 0, .44, .345, k.head, 0) }
// barba blanca corta y tupida de Old Dez (deja la boca y los ojos a la vista), bigote y cejas pobladas
function barbaVieja(k, col) { const mt = new THREE.MeshStandardMaterial({ map: mechTex(col, 23), roughness: .6, flatShading: true }), h = k.head, M = (pts, r0, r1 = .008, pl = 1.7) => mechR(h, mt, pts, r0, r1, pl);
  for (let j = 0; j < 9; j++) { const u = j / 8 - .5, x = u * .66, L = .34 - Math.abs(u) * .3; M([[x, .2, .34], [x * 1.02, .1, .365], [x * .9, -.02, .375], [x * .7, -.02 - L, .36]], .062, .008, 1.8) }
  for (const s of [-1, 1]) { for (let j = 0; j < 3; j++) M([[s * .36, .46 - j * .03, .22 - j * .13], [s * .385, .26, .22 - j * .13], [s * .36, .06, .2 - j * .12], [s * .3, -.08 - j * .03, .2 - j * .1]], .06, .01, 1.6);
    M([[s * .02, .335, .345], [s * .1, .33, .36], [s * .2, .27, .36], [s * .25, .17, .35]], .034, .006, 1.3); M([[s * .04, .6, .345], [s * .12, .625, .36], [s * .2, .6, .36], [s * .27, .55, .35]], .032, .008, 1.3) } }
function florCorona(k, cols) { for (let j = 0; j < 16; j++) { const a = j / 16 * 6.283, x = Math.sin(a) * .43, z = Math.cos(a) * .41 - .02; const f = part(new THREE.IcosahedronGeometry(.07, 1), SM(cols[j % cols.length], { roughness: .8 }), x, .73 + (j % 2) * .015, z, k.head, 0); f.scale.y = .7; f.userData.pelo = 1; if (j % 2) part(new THREE.ConeGeometry(.04, .12, 4), SM("#6a7a48"), x * 1.08, .7, z * 1.08, k.head, 0).rotation.set(Math.cos(a) * 1.3, 0, -Math.sin(a) * 1.3) } }

// ---------- EL ELENCO
// el narrador (12 años): la cabeza más clara y el único verde jade del pueblo: poncho con guarda crema, pelo castaño claro
vestir(ME, { skin: "#f4cba6", shirt: "#0fa97c", cloth: "liso", alt: "#f6efdc", pants: "#44403c", banda: "#f6efdc", largo: .72, ruedo: "#2e2a28", sand: "#6a4426", pelo: ["corto", "#b26a2e"], escala: .9 });
poncho(ME, "#0fa97c", "#f6efdc", "#f6efdc");
// Bee (6): rulos, vestido amarillo con franjas marrones (una abejita), pollera corta, moño
vestir(ME6, { skin: "#f4cba6", shirt: "#f7c20a", cloth: "franjas", alt: "#4a3020", pants: null, manga: .3, sand: "#6a4426", pelo: ["rulos", "#b26a2e"], escala: .7 });
falda(ME6, "#f7c20a", { hasta: .52, alt: "#4a3020", kind: "franjas" }); cuello(ME6, "#fff6dc");
{ const m = SM("#f7c20a", { roughness: .7 }); for (const s of [-1, 1]) { const c = part(new THREE.ConeGeometry(.12, .2, 4), m, s * .13, .86, -.3, ME6.head, 0); c.rotation.z = s * Math.PI / 2; c.scale.z = .5 } part(RB(.08, .08, .08, .02), m, 0, .86, -.3, ME6.head, 0) }
// Miss Ode, la maestra: rodete, anteojos redondos, vestido pizarra sobrio con cuello y ruedo crema
vestir(QUILL, { skin: "#c9936a", shirt: "#544a4e", cloth: "lino", alt: "#e6dcc6", pants: null, sand: "#3a2a22", pelo: ["rodete", "#6e5a4e"] });
falda(QUILL, "#544a4e", { hasta: .22, alt: "#e6dcc6" }); cuello(QUILL, "#e6dcc6"); anteojos(QUILL);
// Dez de chico (recuerdo, hace 60 años): pelo negro en mechones, camisa ocre a rayas, pañuelo terracota al cuello
vestir(PIM, { skin: "#b87a52", shirt: "#c2913a", cloth: "rayas", alt: "#efe2c0", pants: "#82705A", manga: .45, largo: .62, sand: "#4a3020", pelo: ["puntas", "#211c1a"], escala: .8 });
panueloCuello(PIM, "#b0452c");
// Old Dez (hoy): el mismo pañuelo terracota y el mismo ocre, ahora en un poncho; sombrero de paja, barba blanca, bastón, encorvado, arrugas
vestir(GARROW, { skin: "#b07a58", shirt: "#c2913a", cloth: "liso", alt: "#b0452c", pants: "#6a5c4c", banda: "#b0452c", sand: "#4a3020", pelo: null });
poncho(GARROW, "#c2913a", "#b0452c", "#efe2c0"); panueloCuello(GARROW, "#b0452c"); sombrero(GARROW, { cinta: "#b0452c", pelo: "#ece8e0" }); barbaVieja(GARROW, "#f0ece4");
GARROW.arrugas = 2; GARROW.encorvado = .32;
// vecinos (colores apagados): 0 = el novio, 1 = la novia, 2 = la madre del bebé, 3 = una vieja, 4 y 5 = vecinos
vestir(FOLK[0], { skin: "#a86c48", shirt: "#d8ccb4", cloth: "lino", pants: "#5a4e42", sand: "#3a2a22", pelo: null }); chaleco(FOLK[0], "#4a4038", "#b88a3e"); faja(FOLK[0], "#a8553a"); sombrero(FOLK[0], { cinta: "#efe6d0", pelo: "#2b211b", tilt: -.24 });
vestir(FOLK[1], { skin: "#c98e64", shirt: "#e6dcc6", cloth: "guarda", alt: "#a8553a", pants: null, sand: "#6a4a30", pelo: ["largo", "#3a2418"] }); falda(FOLK[1], "#e6dcc6", { hasta: .2, alt: "#a8553a" }); florCorona(FOLK[1], ["#f4ecd8", "#d9a441", "#c2603c"]);
vestir(FOLK[2], { skin: "#b87a52", shirt: "#7a8258", cloth: "rombos", alt: "#e6dcc6", pants: null, sand: "#4a3020", pelo: null }); falda(FOLK[2], "#7a8258", { hasta: .24, alt: "#e6dcc6" }); panueloCabeza(FOLK[2], "#a8553a", "#2b211b");
vestir(FOLK[3], { skin: "#c49a78", shirt: "#A2A497", cloth: "zigzag", alt: "#7a4a4a", pants: null, sand: "#3a2a22", pelo: null }); falda(FOLK[3], "#A2A497", { hasta: .22, alt: "#7a4a4a" }); panueloCabeza(FOLK[3], "#7a4a4a", "#d8d4cc"); FOLK[3].arrugas = 1;
vestir(FOLK[4], { skin: "#8a5a3c", shirt: "#a8553a", cloth: "liso", alt: "#e6dcc6", pants: "#576371", banda: "#e6dcc6", sand: "#3a2a22", pelo: null }); poncho(FOLK[4], "#a8553a", "#e6dcc6", "#576371"); sombrero(FOLK[4], { cinta: "#576371", pelo: "#1d1a17" });
vestir(FOLK[5], { skin: "#c98e64", shirt: "#A2A497", cloth: "rayas", alt: "#82705A", pants: "#4a4038", manga: .45, sand: "#4a3020", pelo: ["rulos", "#1d1a17"] }); chaleco(FOLK[5], "#576371"); faja(FOLK[5], "#b88a3e");
vestir(EXT[0], { skin: "#d9a67c", shirt: "#82705A", cloth: "rayas", alt: "#d8ccb4", pants: null, sand: "#3a2a22", pelo: null }); falda(EXT[0], "#82705A", { hasta: .3, alt: "#d8ccb4" }); panueloCabeza(EXT[0], "#b88a3e", "#5a3a22");
vestir(EXT[1], { skin: "#b08060", shirt: "#A2A497", cloth: "lino", pants: "#6a5a48", sand: "#3a2a22", pelo: null }); chaleco(EXT[1], "#7a8258", "#e6dcc6"); sombrero(EXT[1], { cinta: "#7a8258", pelo: "#b8b2a8", tilt: -.16 }); EXT[1].arrugas = 1;
vestir(EXT[2], { skin: "#c98e64", shirt: "#a8553a", cloth: "zigzag", alt: "#e6dcc6", pants: null, manga: .45, sand: "#4a3020", pelo: ["melena", "#5a3a22"] }); falda(EXT[2], "#82705A", { hasta: .45, alt: "#e6dcc6" });
vestir(EXT[3], { skin: "#8a5a3c", shirt: "#576371", cloth: "liso", alt: "#b88a3e", pants: "#82705A", banda: "#b88a3e", sand: "#3a2a22", pelo: ["corto", "#1d1a17"] }); poncho(EXT[3], "#576371", "#b88a3e", "#d8ccb4");
vestir(PESCADOR, { skin: "#a86c48", shirt: "#82705A", cloth: "rombos", alt: "#b88a3e", pants: "#4a4038", manga: .45, sand: "#3a2a22", pelo: null }); panueloCuello(PESCADOR, "#7a8258"); sombrero(PESCADOR, { cinta: "#82705A", pelo: "#3a2416", tilt: -.28 });

// ---------- CARAS: las del motor + «listen», «grito», «sopla», «susurra», «cerrados», «paz»; cualquiera con los ojos cerrados (parpadeo) y con arrugas
const CARAS_DZ = {};
const CARA_K = { neutral: [1, 0, "flat"], worried: [1, 1, "frown"], gloomy: [.8, 1, "flat"], pleading: [1, 1, "frown"], sad: [1, 1, "frown"], scared: [1.35, 1.2, "o"], terrified: [1.5, 1.4, "scream"], horrified: [1.45, 1.3, "scream"], panic: [1.4, 1.3, "scream"],
  shock: [1.35, -1, "o"], gasp: [1.35, -1, "o"], happy: [1, 0, "smile"], warm: [.9, 0, "smile"], laugh: [.95, -.5, "open"], excited: [1.15, -.6, "open"], starstruck: [1.2, -.8, "open"], hopeful: [1.1, .6, "smile"],
  relieved: [.9, .8, "smile"], squint: [.6, -1.2, "flat"], suspicious: [.7, -1.4, "smirk"], determined: [.85, -1.4, "smirk"], brave: [.9, -1.2, "flat"], angry: [.9, -1.6, "frown"], curious: [1.15, -.4, "o"],
  listen: [1.3, 0, "mini", "alta"], grito: [1, -1, "scream", "", "apret"], sopla: [1, -1, "o", "", "apret"], susurra: [.9, 0, "mini"], cerrados: [1, 0, "flat", "", "cerr"], paz: [1, 0, "smile", "", "cerr"] };
const CARAS_LISTA = Object.keys(CARA_K);
function caraDz(kind, cerr = false, arr = 0) { const key = kind + (cerr ? "_c" : "") + arr; if (CARAS_DZ[key]) return CARAS_DZ[key];
  return CARAS_DZ[key] = tex(512, 384, (g, w, h) => { const ink = "#141014", ex = [176, 336], ey = 165, [es, bro, boca, ceja = "", ojo = ""] = CARA_K[kind] || CARA_K.neutral, modo = ojo || (cerr ? "cerr" : "");
    g.lineCap = "round"; g.lineJoin = "round";
    ex.forEach((x, i) => { const s = i ? 1 : -1, E = Math.min(1.25, es); g.fillStyle = ink; g.strokeStyle = ink;
      if (modo === "cerr") { g.lineWidth = 17; g.beginPath(); g.moveTo(x - 30, ey + 2); g.quadraticCurveTo(x, ey + 26, x + 30, ey + 2); g.stroke() }
      else if (modo === "apret") { g.lineWidth = 17; g.beginPath(); g.moveTo(x - s * 28, ey - 24); g.lineTo(x + s * 22, ey); g.lineTo(x - s * 28, ey + 24); g.stroke() }
      else { g.beginPath(); g.ellipse(x, ey, 26 * Math.min(1.2, es), 46 * E, 0, 0, 7); g.fill(); g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(x - 8, ey - 18 * E, 8, 11, 0, 0, 7); g.fill() }
      g.strokeStyle = ink; g.lineWidth = 18; const yb = ey - 10 - 66 * E - (bro < 0 && boca === "o" ? 14 : 0) - (ceja === "alta" ? 10 : 0); g.beginPath(); g.moveTo(x - s * 36, yb + (bro > 0 ? 8 : bro < 0 ? -12 : 0)); g.lineTo(x + s * 26, yb + (bro > 0 ? -14 : bro < 0 ? 12 : 0)); g.stroke() });
    g.fillStyle = ink; g.strokeStyle = ink; g.lineWidth = 18; const my = 290;
    if (boca === "flat") { g.beginPath(); g.moveTo(222, my); g.lineTo(290, my); g.stroke() }
    if (boca === "frown") { g.beginPath(); g.moveTo(214, my + 16); g.quadraticCurveTo(256, my - 22, 298, my + 16); g.stroke() }
    if (boca === "smile") { g.beginPath(); g.moveTo(206, my - 14); g.quadraticCurveTo(256, my + 34, 306, my - 14); g.stroke() }
    if (boca === "smirk") { g.beginPath(); g.moveTo(220, my + 6); g.quadraticCurveTo(268, my + 10, 300, my - 14); g.stroke() }
    if (boca === "o") { g.beginPath(); g.ellipse(256, my, 22, 28, 0, 0, 7); g.fill() }
    if (boca === "mini") { g.beginPath(); g.ellipse(256, my, 13, 13, 0, 0, 7); g.fill() }
    if (boca === "open") { g.beginPath(); g.moveTo(196, my - 22); g.quadraticCurveTo(256, my + 62, 316, my - 22); g.closePath(); g.fill(); g.fillStyle = "#c94b5a"; g.beginPath(); g.ellipse(256, my + 18, 26, 10, 0, 0, 7); g.fill() }
    if (boca === "scream") { g.beginPath(); g.moveTo(214, my - 26); g.quadraticCurveTo(256, my - 44, 298, my - 26); g.lineTo(306, my + 40); g.quadraticCurveTo(256, my + 58, 206, my + 40); g.closePath(); g.fill(); g.fillStyle = "#ffffff"; g.fillRect(224, my - 30, 64, 12) }
    if (kind === "sopla") { g.fillStyle = "rgba(200,80,70,.4)"; for (const x of [150, 362]) { g.beginPath(); g.ellipse(x, my - 14, 34, 28, 0, 0, 7); g.fill() } }
    if (arr) { g.strokeStyle = "rgba(84,44,34,.6)"; g.lineWidth = 6; const Q = (a, b, c, d, e, f) => { g.beginPath(); g.moveTo(a, b); g.quadraticCurveTo(c, d, e, f); g.stroke() };
      for (const y of arr > 1 ? [26, 42, 58] : [34, 54]) Q(160, y, 256, y - 9, 352, y);
      for (const [x, s] of [[122, -1], [390, 1]]) for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(x, 150 + k * 16); g.lineTo(x + s * 28, 140 + k * 21); g.stroke() }
      for (const s of [-1, 1]) { Q(256 + s * 72, 236, 256 + s * 90, 280, 256 + s * 72, 322); if (arr > 1) { Q(256 + s * 46, 222, 256 + s * 82, 236, 256 + s * 116, 218); Q(256 + s * 112, 262, 256 + s * 128, 290, 256 + s * 110, 322); Q(256 + s * 30, 340, 256 + s * 50, 350, 256 + s * 64, 338) } } } }) }
setFace = (k, f) => { k.cara = f; const t = caraDz(f, false, k.arrugas || 0); if (k.decal.material.map !== t) { k.decal.material.map = t; k.decal.material.needsUpdate = true } };
ALL.forEach((k, i) => { k.idx = i; setFace(k, "neutral") });
// UN parpadeo de 4 cuadros (a 30 fps) cada 1,2–1,6 s, desfasado por personaje
const _frac = x => x - Math.floor(x);
function parpadeo(k, t) { const T = 1.2 + .4 * _frac(k.idx * .618 + .31), ph = (t + T * _frac(k.idx * .377 + .15)) % T; if (ph < 4 * F30 && k.cara && !CARA_K[k.cara]?.[4]) { const m = caraDz(k.cara, true, k.arrugas || 0); if (k.decal.material.map !== m) { k.decal.material.map = m; k.decal.material.needsUpdate = true } return true } return false }

// ---------- UTILERÍA (escondida por defecto en cada cuadro: se muestra con attach(obj, k, "R"|"L", [x, y, z]) o ubicándola)
// Convención: los objetos de mano están armados para un brazo estirado HACIA ADELANTE (gestos "agita" y "golpea"): ahí quedan derechos.
function tuboAf(pts, r0, r1, RS = 8, TS = 16, plano = 1) { const cu = new THREE.CatmullRomCurve3(pts.map(q => new THREE.Vector3(...q))), geo = new THREE.TubeGeometry(cu, TS, 1, RS, false), p = geo.attributes.position, v = new THREE.Vector3(), fr = cu.computeFrenetFrames(TS, false);
  for (let i = 0; i <= TS; i++) { const c = cu.getPointAt(i / TS), rad = lerp(r0, r1, i / TS); for (let j = 0; j <= RS; j++) { const q = i * (RS + 1) + j; v.fromBufferAttribute(p, q).sub(c); const a = v.dot(fr.normals[i]), b = v.dot(fr.binormals[i]); v.copy(fr.normals[i]).multiplyScalar(a * rad).addScaledVector(fr.binormals[i], b * rad * plano).add(c); p.setXYZ(q, v.x, v.y, v.z) } }
  geo.computeVertexNormals(); return geo }
const T_MADERA_U = pintarDoble(256, 256, (c, z, w, h) => { const r = rng(5150); c.fillStyle = "#8a6238"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h); for (let k = 0; k < 90; k++) { const x = r() * w; c.strokeStyle = `rgba(${r() < .5 ? "50,30,12" : "190,150,96"},${.2 + r() * .3})`; c.lineWidth = 1 + r() * 3; c.beginPath(); c.moveTo(x, 0); c.bezierCurveTo(x + 8, h * .3, x - 8, h * .6, x + 4, h); c.stroke(); z.strokeStyle = "rgba(0,0,0,.4)"; z.lineWidth = 2; z.beginPath(); z.moveTo(x, 0); z.lineTo(x + 4, h); z.stroke() } });
const M_MADERA_U = new THREE.MeshStandardMaterial({ map: T_MADERA_U[0], bumpMap: T_MADERA_U[1], bumpScale: 1.5, roughness: .7 });
const PROP = g => { g.visible = false; g.userData.prop = 1; return g };
// la bandera roja de Miss Ode: palo de madera con remate y paño que flamea
const BANDERA_ROJA = PROP(new THREE.Group()); let BANDERA_GEO;
{ const G = new THREE.Group(); G.rotation.x = Math.PI / 2; BANDERA_ROJA.add(G); part(new THREE.CylinderGeometry(.03, .034, 2.0, 12), M_MADERA_U, 0, .72, 0, G, 0); part(new THREE.SphereGeometry(.055, 14, 10), SM("#c8a850", { metalness: .7, roughness: .35 }), 0, 1.75, 0, G, 0);
  const t = pintarDoble(512, 512, (c, z, w, h) => { c.fillStyle = "#cf1f1a"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h); tramaG(c, w, h, 61, 1.4); for (let y = 0; y < h; y += 5) { z.fillStyle = y % 10 ? "rgba(255,255,255,.2)" : "rgba(0,0,0,.2)"; z.fillRect(0, y, w, 2) }
    c.strokeStyle = "#8a1210"; c.lineWidth = 10; c.strokeRect(9, 9, w - 18, h - 18); c.setLineDash([14, 10]); c.strokeStyle = "#f08a7a"; c.lineWidth = 3; c.strokeRect(22, 22, w - 44, h - 44); z.strokeStyle = "rgba(0,0,0,.6)"; z.lineWidth = 8; z.strokeRect(9, 9, w - 18, h - 18) });
  BANDERA_GEO = new THREE.PlaneGeometry(1.15, .72, 28, 12); BANDERA_GEO.translate(.575 + .03, 0, 0); BANDERA_GEO.userData.p0 = BANDERA_GEO.attributes.position.array.slice();
  const pa = part(BANDERA_GEO, new THREE.MeshStandardMaterial({ map: t[0], bumpMap: t[1], bumpScale: 1.2, roughness: .85, side: THREE.DoubleSide }), 0, 1.32, 0, G, 0); for (const y of [1.62, 1.02]) part(new THREE.TorusGeometry(.04, .012, 6, 14), SM("#e8dcc0"), 0, y, 0, G, 0).rotation.x = Math.PI / 2 }
function banderaFlamea(t) { const p = BANDERA_GEO.attributes.position, p0 = BANDERA_GEO.userData.p0; for (let i = 0; i < p.count; i++) { const x = p0[i * 3], y = p0[i * 3 + 1], q = x / 1.18; p.setXYZ(i, x - q * q * .05, y - q * q * .07 + Math.sin(x * 4 - t * 8) * .025 * q, Math.sin(x * 5.5 - t * 10) * .12 * q + Math.sin(x * 11 - t * 15 + y * 4) * .035 * q) } p.needsUpdate = true; BANDERA_GEO.computeVertexNormals() }
banderaFlamea(0);
// taza de loza esmaltada (×2) y cuchara de metal (×2) para el brindis
const TAZA_M = [0, 1].map(i => { const R = PROP(new THREE.Group()), G = new THREE.Group(); G.rotation.x = 1.2; G.position.set(0, .05, .12); R.add(G); const col = ["#e9e2d0", "#d9cdb4"][i], m = new THREE.MeshStandardMaterial({ color: col, roughness: .35, side: THREE.DoubleSide });
  const pr = [[.001, .0], [.105, .0], [.13, .02], [.145, .22], [.15, .26], [.135, .26], [.125, .04], [.001, .03]].map(([a, b]) => new THREE.Vector2(a, b)); part(new THREE.LatheGeometry(pr, 28), m, 0, -.1, 0, G, 0);
  part(new THREE.TorusGeometry(.148, .012, 6, 28), SM(["#a8553a", "#576371"][i], { roughness: .4 }), 0, .15, 0, G, 0).rotation.x = Math.PI / 2; part(new THREE.CylinderGeometry(.125, .125, .01, 24), SM("#6a4a2a", { roughness: .2 }), 0, .1, 0, G, 0);
  const a = part(new THREE.TorusGeometry(.075, .02, 8, 18, Math.PI), m, .14, .03, 0, G, 0); a.rotation.z = -Math.PI / 2; return R });
const CUCHARA_M = [0, 1].map(() => { const R = PROP(new THREE.Group()), G = new THREE.Group(); G.rotation.x = 1.0; G.position.set(0, .0, .1); R.add(G); const m = SM("#c9c4b8", { metalness: .85, roughness: .3 });
  part(RB(.035, .42, .018, .008), m, 0, .12, 0, G, 0); const c = part(new THREE.SphereGeometry(.07, 16, 10), m, 0, .38, 0, G, 0); c.scale.set(.8, 1.15, .28); return R });
// el bebé: un bulto envuelto en una manta a rayas, con carita dormida, capucha de la manta y un mechón
const BEBE = PROP(new THREE.Group());
{ const t = tex(256, 256, (g, w, h) => { g.fillStyle = "#e6dcc6"; g.fillRect(0, 0, w, h); g.fillStyle = "#b88a3e"; for (let y = 20; y < h; y += 64) g.fillRect(0, y, w, 22); g.fillStyle = "#a8553a"; for (let y = 50; y < h; y += 64) g.fillRect(0, y, w, 6); tramaG(g, w, h, 19, 1.5) }), m = mTela(t);
  part(RB(.36, .62, .32, .15, 5), m, 0, 0, 0, BEBE, 0); const d = part(RB(.37, .16, .33, .05), m, 0, .02, .005, BEBE, 0); d.rotation.z = .5; part(RB(.3, .3, .3, .12, 5), m, 0, .4, -.02, BEBE, 0);
  part(RB(.25, .22, .22, .09, 5), SM("#e2b08a", { roughness: .6 }), 0, .4, .05, BEBE, 0);
  const cara = tex(256, 192, g => { g.strokeStyle = "#141014"; g.lineCap = "round"; g.lineWidth = 11; for (const x of [84, 172]) { g.beginPath(); g.moveTo(x - 20, 82); g.quadraticCurveTo(x, 100, x + 20, 82); g.stroke() } g.fillStyle = "#141014"; g.beginPath(); g.ellipse(128, 138, 9, 8, 0, 0, 7); g.fill(); g.fillStyle = "rgba(220,110,90,.45)"; for (const x of [52, 204]) { g.beginPath(); g.ellipse(x, 122, 20, 14, 0, 0, 7); g.fill() } });
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(.22, .165), new THREE.MeshStandardMaterial({ map: cara, transparent: true, roughness: .8, depthWrite: false })); pl.position.set(0, .4, .162); BEBE.add(pl);
  mechR(BEBE, new THREE.MeshStandardMaterial({ map: mechTex("#3a2418", 5), roughness: .5, flatShading: true }), [[0, .5, .13], [.03, .5, .17], [.06, .46, .175]], .03, .006, 1.4) }
// acunar: la madre sostiene al bebé contra el pecho con los dos brazos (llamar después de quieto/andar)
function acunar(k, obj = BEBE) { if (obj.parent !== k.body) k.body.add(obj); obj.visible = true; obj.position.set(-.1, 1.66, .5); obj.rotation.set(.35, 0, -1.2); obj.scale.setScalar(1);
  k.armL.rotation.set(-.72, 0, .5); k.armR.rotation.set(-.82, 0, -.5); k.head.rotation.x = .22; k.head.rotation.z = -.08 }
// el bastón de Old Dez: vara nudosa con mango curvo y regatón; si está en su mano, quieto()/andar() lo dejan vertical y apoyado en el piso
const BASTON = PROP(new THREE.Group());
{ const v = part(new THREE.CylinderGeometry(.034, .026, 1, 10), M_MADERA_U, 0, -.5, 0, BASTON, 0); BASTON.userData.vara = new THREE.Group(); BASTON.add(BASTON.userData.vara); BASTON.userData.vara.add(v);
  part(tuboAf([[0, -.02, 0], [0, .1, 0], [0, .17, .05], [0, .17, .15], [0, .1, .2]], .036, .03, 10, 18), M_MADERA_U, 0, 0, 0, BASTON, 0); const rg = part(new THREE.CylinderGeometry(.03, .034, .06, 10), SM("#2a2420"), 0, -.98, 0, BASTON.userData.vara, 0);
  for (const y of [-.3, -.62]) part(new THREE.SphereGeometry(.04, 8, 6), M_MADERA_U, .012, y, 0, BASTON.userData.vara, 0).scale.y = .7 }
const _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3();
function bastonAlPiso(k) { if (!BASTON.visible || (BASTON.parent !== k.handR && BASTON.parent !== k.handL)) return; k.g.updateMatrixWorld(true); const h = BASTON.parent; h.getWorldQuaternion(_q1); k.g.getWorldQuaternion(_q2); BASTON.quaternion.copy(_q1.invert().multiply(_q2));
  BASTON.getWorldPosition(_v1); k.g.getWorldPosition(_v2); const s = k.body.scale.y; BASTON.userData.vara.scale.y = Math.max(.2, (_v1.y - _v2.y) / s) }

// ---------- LA CABRA de la familia: bloques con pelaje pintado, cuernitos curvos, barba, orejas, collar y cencerro
const T_PELAJE = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(808); c.fillStyle = "#ece4d2"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
  for (let k = 0; k < 7; k++) { c.fillStyle = `rgba(122,84,52,${.75 + r() * .2})`; c.beginPath(); c.ellipse(r() * w, r() * h, 40 + r() * 70, 30 + r() * 50, r() * 3, 0, 7); c.fill() }
  for (let k = 0; k < 1500; k++) { const x = r() * w, y = r() * h, L = 8 + r() * 18; c.strokeStyle = `rgba(${r() < .5 ? "255,255,250" : "90,70,50"},${.1 + r() * .2})`; c.lineWidth = 1 + r() * 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - .5) * 5, y + L); c.stroke(); z.strokeStyle = r() < .5 ? "rgba(0,0,0,.35)" : "rgba(255,255,255,.3)"; z.lineWidth = 2; z.beginPath(); z.moveTo(x, y); z.lineTo(x, y + L); z.stroke() } });
const M_PELAJE = new THREE.MeshStandardMaterial({ map: T_PELAJE[0], bumpMap: T_PELAJE[1], bumpScale: 2, roughness: .95 });
const CABRA = PROP(new THREE.Group()); CABRA.g = CABRA; CABRA.userData.prop = 0; const CABRA_S = .8;
{ const C = new THREE.Group(); CABRA.add(C); CABRA.cu = C; const cl2 = SM("#f1ead9", { roughness: .9, bumpMap: T_PELAJE[1], bumpScale: 2 }), osc = SM("#6a4a30", { roughness: .9, bumpMap: T_PELAJE[1], bumpScale: 2 }), pez = SM("#2a2220", { roughness: .5 }), cuer = new THREE.MeshStandardMaterial({ map: T_MADERA_U[0], color: "#b8a888", bumpMap: T_MADERA_U[1], bumpScale: 2, roughness: .6 });
  part(RB(.48, .46, .94, .1, 4), M_PELAJE, 0, .68, 0, C, 0); part(RB(.44, .12, .7, .05), cl2, 0, .47, 0, C, 0);                                    // cuerpo y panza
  const cab = new THREE.Group(); cab.position.set(0, .86, .4); C.add(cab); CABRA.cab = cab;
  const nk = part(RB(.26, .44, .26, .08), M_PELAJE, 0, .12, .06, cab, 0); nk.rotation.x = .5;
  part(RB(.32, .3, .36, .08, 4), M_PELAJE, 0, .36, .22, cab, 0); part(RB(.23, .2, .24, .07, 4), cl2, 0, .3, .46, cab, 0); part(RB(.13, .07, .04, .02), SM("#3a2a28"), 0, .35, .585, cab, 0); part(RB(.1, .02, .02, .008), SM("#3a2a28"), 0, .26, .582, cab, 0);
  for (const s of [-1, 1]) { const e = part(new THREE.SphereGeometry(.05, 14, 10), SM("#141014", { roughness: .25 }), s * .163, .4, .3, cab, 0); e.scale.set(.3, 1.25, .9); part(new THREE.SphereGeometry(.014, 8, 6), SM("#ffffff", { emissive: "#ffffff", emissiveIntensity: .4 }), s * .178, .43, .31, cab, 0);
    const o = part(RB(.2, .06, .12, .03), osc, s * .25, .42, .08, cab, 0); o.rotation.z = -s * .45; o.rotation.y = s * .3;
    part(tuboAf([[s * .09, .48, .16], [s * .11, .62, .12], [s * .14, .72, .0], [s * .16, .74, -.12]], .05, .012, 8, 14), cuer, 0, 0, 0, cab, 0) }
  part(tuboAf([[0, .2, .44], [0, .1, .46], [0, -.02, .43]], .055, .008, 6, 8, .7), osc, 0, 0, 0, cab, 0);                                           // barba
  const col = part(new THREE.TorusGeometry(.17, .03, 8, 20), SM("#b0452c", { roughness: .7 }), 0, .1, .06, cab, 0); col.rotation.x = Math.PI / 2 + .5;
  part(new THREE.CylinderGeometry(.04, .07, .11, 12), SM("#c8a850", { metalness: .8, roughness: .3 }), 0, -.05, .2, cab, 0); part(new THREE.SphereGeometry(.022, 8, 6), SM("#6a5020", { metalness: .6 }), 0, -.11, .2, cab, 0);   // cencerro
  CABRA.patas = [[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sz]) => { const p = new THREE.Group(); p.position.set(sx * .16, .48, sz * .34); C.add(p); part(RB(.13, .42, .13, .03), sz > 0 ? cl2 : M_PELAJE, 0, -.2, 0, p, 0); part(RB(.145, .09, .155, .03), pez, 0, -.435, .005, p, 0); return p });
  const co = new THREE.Group(); co.position.set(0, .86, -.46); C.add(co); CABRA.cola = co; part(RB(.1, .1, .22, .04), cl2, 0, .04, -.08, co, 0).rotation.x = -.7 }
function cabraPose(t, { x = 0, z = 0, y = null, ry = 0, corre = 0, enBrazos = null } = {}) { CABRA.visible = true; const f = t / .4 * Math.PI * 2, s = Math.sin(f);
  CABRA.cola.rotation.y = Math.sin(t * 11) * .35; CABRA.cab.rotation.set(0, 0, 0);
  if (enBrazos) { const k = enBrazos, sc = CABRA_S / k.body.scale.y; if (CABRA.parent !== k.body) k.body.add(CABRA); CABRA.scale.setScalar(sc); CABRA.rotation.set(-.95, 0, 0); CABRA.position.set(0, 1.02, .62); CABRA.cu.position.set(0, -.68, 0); CABRA.cu.rotation.set(0, 0, 0);
    CABRA.patas.forEach((p, i) => p.rotation.set(i < 2 ? .5 : .9, 0, 0)); CABRA.cab.rotation.x = .6; k.armL.rotation.set(-.8, 0, .3); k.armR.rotation.set(-.8, 0, -.3); return }
  if (CABRA.parent !== TURT) TURT.add(CABRA); CABRA.scale.setScalar(CABRA_S); CABRA.position.set(x, y ?? ALT(x, z), z); CABRA.rotation.set(0, ry, 0);
  CABRA.cu.position.set(0, Math.abs(s) * .1 * corre, 0); CABRA.cu.rotation.set(-Math.cos(f) * .09 * corre, 0, 0); CABRA.patas.forEach((p, i) => p.rotation.set((i < 2 ? s : -s) * .75 * corre, 0, 0)); CABRA.cab.rotation.x = -.12 * corre }

// ---------- LOS DOS GALLOS (callados: pico siempre cerrado; picotean el piso)
const T_PLUMA = pintarDoble(256, 256, (c, z, w, h) => { c.fillStyle = "#ffffff"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h); for (let y = 0, f = 0; y < h + 20; y += 22, f++) for (let x = (f % 2) * 16; x < w + 32; x += 32) { c.strokeStyle = "rgba(0,0,0,.28)"; c.lineWidth = 3; c.beginPath(); c.arc(x, y, 16, .2, Math.PI - .2); c.stroke(); z.strokeStyle = "rgba(0,0,0,.6)"; z.lineWidth = 4; z.beginPath(); z.arc(x, y, 16, .2, Math.PI - .2); z.stroke() } });
const GALLOS = [0, 1].map(i => { const R = PROP(new THREE.Group()), U = new THREE.Group(); R.userData.prop = 0; U.position.y = .3; R.add(U); R.cu = U; TURT.add(R);
  const P = (col, o = {}) => new THREE.MeshStandardMaterial({ color: col, map: T_PLUMA[0], bumpMap: T_PLUMA[1], bumpScale: 1.5, roughness: .8, ...o }), cu = P(["#a8502a", "#e9e2d2"][i]), pe = P(["#d9a441", "#f4efe2"][i]), al = P(["#5a2a1a", "#a8a296"][i]), rojo = SM("#c8201c", { roughness: .5 }), am = SM("#e0a030", { roughness: .5 });
  const b = part(RB(.3, .3, .44, .1, 4), cu, 0, .12, 0, U, 0); b.rotation.x = -.25; part(RB(.26, .2, .2, .08), pe, 0, .16, .2, U, 0); for (const s of [-1, 1]) part(RB(.04, .2, .3, .02), al, s * .16, .13, -.02, U, 0).rotation.x = -.25;
  const cab = new THREE.Group(); cab.position.set(0, .26, .2); U.add(cab); R.cab = cab; part(RB(.16, .3, .16, .06), pe, 0, .12, 0, cab, 0); part(RB(.18, .17, .2, .06, 4), cu, 0, .32, .02, cab, 0);
  const pk = part(new THREE.ConeGeometry(.05, .13, 4), am, 0, .31, .17, cab, 0); pk.rotation.x = Math.PI / 2; pk.scale.x = .7;
  [[.1, .44, .08], [.13, .47, .0], [.1, .44, -.07]].forEach(([r, y, z]) => part(RB(.05, r, .09, .025), rojo, 0, y, z, cab, 0)); part(RB(.05, .12, .06, .025), rojo, 0, .2, .12, cab, 0);
  for (const s of [-1, 1]) { part(new THREE.SphereGeometry(.022, 10, 8), SM("#141014", { roughness: .2 }), s * .092, .34, .07, cab, 0); part(RB(.01, .07, .06, .004), SM("#f4efe2"), s * .092, .27, 0, cab, 0) }
  const colT = [["#1f3a32", "#223a4a", "#2a2a2a", "#3a5a3a", "#1f2a2a"], ["#8a8478", "#6a665e", "#a8a296", "#5a5650", "#8a8478"]][i]; for (let j = 0; j < 5; j++) { const a = (j - 2) * .3; part(tuboAf([[a * .1, .2, -.2], [a * .2, .46 + (2 - Math.abs(j - 2)) * .05, -.3], [a * .3, .5 + (2 - Math.abs(j - 2)) * .08, -.46], [a * .34, .34, -.6]], .05, .012, 6, 12, 2.6), P(colT[j], { side: THREE.DoubleSide }), 0, 0, 0, U, 0) }
  R.patas = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * .08, .02, 0); U.add(p); part(RB(.03, .3, .03, .01), am, 0, -.15, 0, p, 0); for (const a of [-.5, 0, .5]) { const d = part(RB(.025, .02, .12, .008), am, Math.sin(a) * .05, -.3, .05 * Math.cos(a), p, 0); d.rotation.y = a } return p }); return R });
function galloPose(i, t, { x = 0, z = 0, y = null, ry = 0, picotea = 1 } = {}) { const R = GALLOS[i]; R.visible = true; R.position.set(x, y ?? ALT(x, z), z); R.rotation.set(0, ry, 0); R.scale.setScalar(1.05 - i * .1);
  const T = 1.0 + i * .27, ph = (t + i * .43) % T, q = picotea * (ph < .1 ? ph / .1 : ph < .2 ? 1 : ph < .3 ? 1 - (ph - .2) / .1 : 0), paso = Math.floor((t + i * .43) / T);
  R.cu.rotation.x = q * .75; R.cab.rotation.set(q * .55, q ? 0 : [0, .7, -.5, .3][paso % 4], 0); R.patas.forEach(p => p.rotation.x = -q * .75) }

function utileriaReset() { [BANDERA_ROJA, ...TAZA_M, ...CUCHARA_M, BEBE, BASTON, CABRA, ...GALLOS].forEach(o => o.visible = false) }

// ---------- ARENA ENCIMA: 0→1, ropa, pelo y piel teñidos de arena + montoncitos en la cabeza y los hombros
const T_ARENA_U = pintarDoble(256, 256, (c, z, w, h) => { const r = rng(3131); c.fillStyle = ARENA_C; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h); for (let k = 0; k < 2600; k++) { const x = r() * w, y = r() * h, v = r(); c.fillStyle = `rgba(${v < .5 ? "120,96,60" : "250,236,200"},${.2 + r() * .4})`; c.fillRect(x, y, 2, 2); z.fillStyle = v < .5 ? "rgba(0,0,0,.6)" : "rgba(255,255,255,.6)"; z.fillRect(x, y, 2, 2) } });
const M_ARENA_U = new THREE.MeshStandardMaterial({ map: T_ARENA_U[0], bumpMap: T_ARENA_U[1], bumpScale: 2.5, roughness: 1 });
const GEO_MONTON = (() => { const g = new THREE.SphereGeometry(1, 20, 10, 0, 6.283, 0, Math.PI / 2), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), n = 1 + Math.sin(x * 5 + z * 3) * .1 + Math.sin(z * 7 - x * 2) * .07; p.setXYZ(i, x * n, Math.pow(y, 1.4) * n, z * n) } g.computeVertexNormals(); return g })();
function arenaEncima(k, q) { q = cl(q); if (!k._arena) { if (q <= 0) return; const A = k._arena = { mats: [], mont: [], q: 0 }, mapa = new Map(), col = new THREE.Color(ARENA_C);
    const rec = o => { if (o.userData.prop || o.isSprite || o === k.decal) return; if (o.isMesh) { const cam = m => { if (!m.color) return m; if (!mapa.has(m)) { const c = m.clone(); mapa.set(m, c); A.mats.push({ m: c, c0: c.color.clone(), e0: c.emissive ? c.emissive.clone() : null, i0: c.emissiveIntensity }) } return mapa.get(m) }; o.material = Array.isArray(o.material) ? o.material.map(cam) : cam(o.material) } o.children.forEach(rec) }; rec(k.g);
    const mo = (par, x, y, z, sx, sy, sz) => { const m = new THREE.Mesh(GEO_MONTON, M_ARENA_U); m.position.set(x, y, z); m.userData.s = [sx, sy, sz]; m.userData.prop = 1; m.castShadow = true; par.add(m); A.mont.push(m) };
    if (k.head) { mo(k.head, .02, .76, -.02, .3, .16, .27); mo(k.head, -.2, .72, .12, .14, .09, .12); [k.armL, k.armR].forEach((a, i) => mo(a, (i ? 1 : -1) * .02, .07, 0, .2, .1, .22)); mo(k.body, 0, 2.08, -.2, .3, .06, .1) } else mo(k.cu || k.g, 0, .9, -.05, .2, .1, .34) }
  const A = k._arena; if (A.q === q) return; A.q = q; const sc = new THREE.Color(ARENA_C);
  A.mats.forEach(({ m, c0, e0, i0 }) => { m.color.copy(c0).lerp(sc, q * .72); if (e0) { m.emissive.copy(e0).lerp(sc, q); m.emissiveIntensity = lerp(i0, .22, q) } });
  A.mont.forEach(m => { const [a, b, c] = m.userData.s; m.visible = q > .02; m.scale.set(a * (.5 + .5 * q), b * q, c * (.5 + .5 * q)) }) }

// ================= ANIMACIÓN CON LAS MEDIDAS DE LA REFERENCIA (se llaman DESPUÉS de pose(); dejan al personaje listo) =================
// pose() del motor queda envuelta: limpia lo que estas funciones tocan (para que nada quede pegado de un cuadro al otro),
// esconde la utilería una vez por cuadro y saca la arena.
{ const pose0 = pose; let tUlt = -1e9;
  pose = (k, t, o = {}) => { if (t !== tUlt) { tUlt = t; utileriaReset() } k.body.position.x = 0; k.body.position.z = 0; k.body.rotation.y = 0; k.body.rotation.z = 0; k.armL.rotation.y = 0; k.armR.rotation.y = 0; k.legL.rotation.y = 0; k.legR.rotation.y = 0; k.legL.rotation.z = 0; k.legR.rotation.z = 0;
    if (k._arena && k._arena.q) arenaEncima(k, 0); pose0(k, t, o) } }
// quiebre de cadera (lo único que se dobla: el torso gira en la cadera y las piernas siguen rectas; sin codos ni rodillas).
// lean = inclinación del torso; psi = ángulo medio de las piernas respecto de la vertical. Los pies quedan en su lugar.
function cadera(k, lean, psi = 0) { const b = k.body, L0 = b.rotation.x, s = b.scale.y, d = lean - L0;
  if (k.falda != null) { b.rotation.x = lean * .6; return }                       // con pollera se inclina el cuerpo entero (menos), para que las piernas no asomen
  b.rotation.x = lean; k.legL.rotation.x += psi - d; k.legR.rotation.x += psi - d; b.position.z -= H_CAD * s * ((Math.sin(lean) - Math.sin(L0)) - Math.sin(psi)); b.position.y -= H_CAD * s * ((Math.cos(lean) - Math.cos(L0)) - (Math.cos(psi) - 1)) }
const _fase = k => (k.idx || 0) * 1.7;
function quieto(k, t, { mira = 0 } = {}) { const A = A_BRAZO;
  k.legL.rotation.set(0, 0, 0); k.legR.rotation.set(0, 0, 0); k.armL.rotation.set(0, 0, -A); k.armR.rotation.set(0, 0, A); k.head.rotation.set(0, mira, 0); k.body.rotation.set(0, 0, 0); k.body.position.set(0, 0, 0);
  if (k.encorvado) { cadera(k, k.encorvado); k.head.rotation.x = -k.encorvado * .75; if (BASTON.visible && BASTON.parent === k.handR) k.armR.rotation.set(-.55 - k.encorvado, 0, .12) }
  bastonAlPiso(k); parpadeo(k, t) }
// caminata: ciclo de 15 cuadros a 30 fps (0,5 s); piernas ±27,5°, brazos ±7° en «A», balanceo lateral ±5°, rebote chico, sin inclinarse
function andar(k, t, { vel = 1 } = {}) { const f = t * vel / .5 * Math.PI * 2 + _fase(k), sw = Math.sin(f), amp = k.pasoMax ?? .48, A = A_BRAZO, s = k.body.scale.y;
  k.body.rotation.set(0, 0, sw * .087); k.body.position.set(0, -H_CAD * s * (1 - Math.cos(amp * sw)), 0);
  k.legL.rotation.set(sw * amp, 0, 0); k.legR.rotation.set(-sw * amp, 0, 0); k.armL.rotation.set(-sw * .12, 0, -A); k.armR.rotation.set(sw * .12, 0, A); k.head.rotation.set(0, 0, -sw * .04);
  if (k.encorvado) { cadera(k, k.encorvado); k.head.rotation.x = -k.encorvado * .75; if (BASTON.visible && BASTON.parent === k.handR) k.armR.rotation.set(-.55 - k.encorvado + sw * .25, 0, .12) }
  bastonAlPiso(k); parpadeo(k, t) }
// corrida: ciclo de 15 cuadros (0,5 s); torso 20° hacia adelante, brazos rígidos apenas hacia atrás (fuerte = 1: bombean a 90° del torso), rebote, polvo suave
function correrV(k, t, { fuerte = 0 } = {}) { const f = t / .5 * Math.PI * 2 + _fase(k), sw = Math.sin(f), amp = k.zancMax ?? .87, A = A_BRAZO, lean = .35, s = k.body.scale.y;
  k.body.rotation.set(0, 0, 0); k.body.position.set(0, Math.abs(sw) * .13 * s, 0); k.legL.rotation.set(sw * amp, 0, 0); k.legR.rotation.set(-sw * amp, 0, 0); cadera(k, lean);
  const b0 = lerp(.38, -1.2, fuerte), ba = lerp(.06, .55, fuerte), bz = lerp(A * .7, .12, fuerte); k.armL.rotation.set(b0 - sw * ba, 0, -bz); k.armR.rotation.set(b0 + sw * ba, 0, bz); k.head.rotation.set(-lean * .7, 0, 0);
  if (!k.polvo) k.polvo = Array.from({ length: 4 }, () => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#d9c8a4", transparent: true, opacity: 0, depthWrite: false })); scene.add(sp); return sp });
  k.g.updateMatrixWorld(true); k.polvo.forEach((sp, i) => { const q = (t * 2 + i / 4) % 1; sp.visible = k.g.visible; sp.position.copy(k.g.localToWorld(_v1.set((i % 2 ? .22 : -.22), .08 + q * .3, -.35 - q * 1.1))); sp.scale.setScalar((.3 + q * .8) * s); sp.material.opacity = (1 - q) * .2 });
  parpadeo(k, t) }
// gestos LINEALES (dur = 0,4 s = 12 cuadros), sin rebote ni anticipación; se quedan en la pose. `fin`: tiempo en que vuelve (también lineal).
// tipos: senala, cubre, brazos, alza, abraza, sopla, tira, grita + escucha (mano a la oreja), agita (la bandera), golpea (cuchara en la taza)
const GESTOS = {
  senala: { R: [-1.5, 0], lean: 0 }, alza: { R: [-3.0, .1] }, escucha: { R: [0, 2.95], hz: -.14, hy: -.18 },
  cubre: { L: [-2.2, .62], R: [-2.2, -.62], hx: .16, lean: .1 }, brazos: { L: [0, -.94], R: [0, .94], hx: -.06, lean: -.07 }, abraza: { L: [-1.2, .42], R: [-1.2, -.42] },
  sopla: { L: [-2.05, .45], R: [-2.05, -.45], lean: .32, hx: -.22 }, tira: { L: [-1.25, .14], R: [-1.25, -.14], lean: -.3, hx: .12 }, grita: { L: [-2.0, -.14], R: [-2.0, .14], lean: .26, hx: -.2 },
  agita: { R: [-1.6, .1] }, golpea: { L: [-1.15, .34], R: [-1.3, -.3] } };
function gesto(k, t, t0, tipo, { dur = .4, fin = null, mano = "R", alto = 0 } = {}) { const G = GESTOS[tipo]; if (!G) return 0; let u = P(t, t0, t0 + dur); if (fin != null) u *= 1 - P(t, fin, fin + dur); if (u <= 0) return 0;
  const esp = mano === "L" && !G.L, ap = (a, [x, z], sg) => { a.rotation.x = lerp(a.rotation.x, x, u); a.rotation.z = lerp(a.rotation.z, z * sg, u) };
  if (G.L) ap(k.armL, G.L, 1); if (G.R) { const [x, z] = G.R, xx = tipo === "senala" ? x - alto : x; esp ? ap(k.armL, [xx, z], -1) : ap(k.armR, [xx, z], 1) }
  if (G.lean) cadera(k, lerp(k.body.rotation.x, k.body.rotation.x + G.lean, u));
  if (G.hx) k.head.rotation.x += G.hx * u; if (G.hz) k.head.rotation.z += G.hz * u * (esp ? -1 : 1); if (G.hy) k.head.rotation.y += G.hy * u * (esp ? -1 : 1);
  if (u >= 1) { const tri = (per, fa = 0) => { const q = ((t - t0 - dur) / per + fa) % 1; return q < .5 ? q * 4 - 1 : 3 - q * 4 };   // vaivén lineal (onda triangular)
    if (tipo === "agita") { const a = esp ? k.armL : k.armR; a.rotation.x = -1.6 + tri(16 * F30) * .38; a.rotation.z = (esp ? -1 : 1) * (.1 + tri(16 * F30, .25) * .3) }
    if (tipo === "golpea") k.armR.rotation.x = -1.3 + Math.max(0, tri(8 * F30)) * .28 }
  return u }
// caída: el cuerpo tieso vuelca en 16 cuadros (dir = 1 de cara, −1 de espaldas) y queda acostado
function caer(k, t, t0, { dir = -1, dur = 16 * F30 } = {}) { const u = P(t, t0, t0 + dur); if (u <= 0) return 0; const a = u * u * Math.PI / 2, s = k.body.scale.y; k.body.rotation.x = dir * a; k.body.position.y = Math.sin(a) * .3 * s; k.body.position.z = -dir * Math.sin(a) * .3 * s; k.head.rotation.set(0, 0, 0); return u }
// salto: se agacha 8 cuadros (anticipación, quiebre de cadera), salta tieso y cae (14 cuadros en el aire); devuelve la altura
function saltar(k, t, t0, { alto = .9, aire = 14 * F30 } = {}) { const ta = 8 * F30, s = k.body.scale.y; if (t <= t0 || t >= t0 + ta + aire) return 0;
  if (t < t0 + ta) { const c = (t - t0) / ta; cadera(k, .5 * c, -.42 * c); k.armL.rotation.x = .5 * c; k.armR.rotation.x = .5 * c; k.head.rotation.x -= .3 * c; return 0 }
  const v = (t - t0 - ta) / aire, y = alto * 4 * v * (1 - v) * s; k.body.position.y += y; k.armL.rotation.z = -A_BRAZO - .25; k.armR.rotation.z = A_BRAZO + .25; return y }
