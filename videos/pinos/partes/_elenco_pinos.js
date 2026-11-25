// v3 (pedido del dueño): ropa como la de Volze: bloques lisos con un estampado claro que se lee de lejos (rayas, lunares,
// guarda nórdica, cuadros), sin botones ni bolsillos 3D encima
{ const ct0 = clothTex, CT = {}; clothTex = (kind, base, alt = "#ffffff", back = false) => { if (kind !== "nordico" && kind !== "lunares") return ct0(kind, base, alt, back); const key = [kind, base, alt, back].join(); return CT[key] ||= tex(256, 256, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h);
    if (kind === "lunares") { g.fillStyle = alt; for (let y = 18, f = 0; y < h; y += 42, f++) for (let x = f % 2 ? 40 : 18; x < w; x += 46) { g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill() } }
    if (kind === "nordico") { g.fillStyle = alt; g.fillRect(0, 64, w, 10); g.fillRect(0, 150, w, 10); for (let x = 0; x < w; x += 32) { g.beginPath(); g.moveTo(x + 16, 84); g.lineTo(x + 30, 112); g.lineTo(x + 16, 140); g.lineTo(x + 2, 112); g.closePath(); g.fill(); g.fillStyle = base; g.fillRect(x + 13, 109, 6, 6); g.fillStyle = alt } for (let x = 8; x < w; x += 16) { g.fillRect(x, 44, 6, 6); g.fillRect(x + 8, 172, 6, 6) } g.fillRect(0, 236, w, 20) } }) } }
// ---------- elenco nuevo de Hollowpine (diseños propios, ropa de invierno): el narrador (campera roja, gorro tejido azul con
// pompón, bufanda amarilla), Mila (campera verde, gorro blanco, trenzas), la abuela Ilse (pañuelo en la cabeza, chal violeta,
// anteojos), Brask el leñador (barba castaña, camisa escocesa roja y negra, gorro oscuro) y vecinos con gorros de piel
robloxify(ME, { skin: "#f0c8a0", shirt: "#b8302a", cloth: "nordico", alt: "#f4ecdc", pants: "#2e3a4a", shoes: "#3a2418", pelo: ["liso", "#6a4024"] });
robloxify(ME6, { skin: "#f2d0b0", shirt: "#3f7a4a", cloth: "lunares", alt: "#f6f2e6", pants: "#5a4a6a", shoes: "#5a3018", pelo: ["trenzas", "#c98a3a"] });
robloxify(GARROW, { skin: "#e8c0a0", shirt: "#7a4a8a", cloth: "cardigan", alt: "#c9b48a", pants: "#3a3236", pelo: ["rodete", "#d8d4cc"] });
robloxify(PIM, { skin: "#d8a880", shirt: "#a8282a", cloth: "plaid", alt: "#1a1a1a", pants: "#3a3a42", pelo: ["corto", "#5a3a20"] });
robloxify(QUILL, { skin: "#f0c6a0", shirt: "#4a4a5a", pants: "#2e2e3a", pelo: ["corto", "#9a9a9a"] });
FOLK.forEach((k, i) => robloxify(k, { skin: ["#c98e64", "#f2cfae", "#e8b48c", "#efc8a8", "#8a5a3c", "#f2cfae"][i], shirt: ["#5a4a3a", "#2e5a7a", "#7a3a2a", "#4a5a3a", "#8a6a3a", "#3a3a5a"][i], cloth: ["stripes", "hoodie", "plaid", "jacket", "twotone", "stripes"][i], alt: ["#e8dcc0", "#d9c7a0", "#1a1a1a", "#f2c41e", "#c9a040", "#f4f4f4"][i], pants: ["#3a3236", "#3a3f4a", "#3a2f28", "#3a3236", "#2e3a59", "#2a2420"][i], pelo: [["corto", "#2b211b"], ["melena", "#6b3f22"], ["liso", "#c9a06a"], ["rodete", "#9a9a9a"], ["rulos", "#1d1a17"], ["puntas", "#7a4a2a"]][i] }));
EXT.forEach((k, i) => robloxify(k, { skin: ["#efc8a8", "#8a5a3c", "#f2cfae", "#c98e64"][i], shirt: ["#6a2a3a", "#3a6a5a", "#a87a2a", "#3a4a6a"][i], cloth: ["lunares", "stripes", "hoodie", "jacket"][i], alt: "#f2ece0", pants: ["#3a3f4a", "#3a2f28", "#2e3a59", "#2a2420"][i], pelo: [["liso", "#3a2416"], ["rulos", "#1d1a17"], ["trenzas", "#8a5a2a"], ["corto", "#5a3a22"]][i] }));
// (telaReal sacado en v3: los botones y bolsillos 3D recargaban la ropa)
// gorros tejidos con pompón, de piel, bufandas, pañuelo, chal y anteojos
const gorroTejido = (k, col, pom = "#f2ece0") => { const m = SM(col, { roughness: 1, bumpMap: T_TRAMA, bumpScale: 4 }); [...k.head.children].forEach(c => { if (c.userData.pelo && c.position.y > .55) k.head.remove(c) });
  part(new THREE.CylinderGeometry(.42, .44, .3, 24), m, 0, .66, 0, k.head, 0); const cop = part(new THREE.SphereGeometry(.42, 24, 12, 0, 6.283, 0, Math.PI / 2), m, 0, .8, 0, k.head, 0); cop.scale.y = .8;
  part(new THREE.TorusGeometry(.43, .07, 8, 28), m, 0, .55, 0, k.head, 0).rotation.x = Math.PI / 2; part(new THREE.SphereGeometry(.15, 14, 10), SM(pom, { roughness: 1, bumpMap: T_TRAMA, bumpScale: 6 }), 0, 1.16, 0, k.head, 0) };
const gorroPiel = (k, col) => { const m = SM(col, { roughness: 1, bumpMap: T_PELO_C.z, bumpScale: 5 }); [...k.head.children].forEach(c => { if (c.userData.pelo && c.position.y > .55) k.head.remove(c) }); part(new THREE.CylinderGeometry(.46, .46, .42, 24), m, 0, .8, 0, k.head, 0); for (const s of [-1, 1]) { const o = part(RB(.12, .4, .4, .05), m, s * .4, .45, 0, k.head, 0) } };
const bufanda = (k, col) => { const m = SM(col, { roughness: 1, bumpMap: T_TRAMA, bumpScale: 4 }); part(RB(1.12, .22, .62, .08), m, 0, 2.06, 0, k.body, 0); const c = part(RB(.26, .7, .08, .03), m, .25, 1.75, .3, k.body, 0); c.rotation.z = .12 };
gorroTejido(ME, "#2a4a8a"); bufanda(ME, "#e8b42a"); gorroTejido(ME6, "#f2ece0", "#d84a6a"); bufanda(ME6, "#d84a6a");
{ const m = SM("#7a2a3a", { roughness: 1, bumpMap: T_TRAMA, bumpScale: 3 }); [...GARROW.head.children].forEach(c => { if (c.userData.pelo && c.position.y > .5) GARROW.head.remove(c) }); const pa = part(new THREE.SphereGeometry(.44, 24, 16, 0, 6.283, 0, 1.45), m, 0, .6, -.07, GARROW.head, 0); pa.scale.set(1.04, 1, 1.06); part(new THREE.ConeGeometry(.12, .3, 6), m, 0, .14, -.38, GARROW.head, 0).rotation.x = 2.6;
  const chal = part(RB(1.2, .5, .7, .15), SM("#c9b48a", { roughness: 1, bumpMap: T_TRAMA, bumpScale: 5 }), 0, 1.95, 0, GARROW.body, 0);
  for (const s of [-1, 1]) part(new THREE.TorusGeometry(.09, .018, 6, 18), SM("#3a2a1a", { metalness: .5 }), s * .14, .44, .34, GARROW.head, 0) }
barbaSensei(PIM, "#5a3a20"); gorroTejido(PIM, "#2a2a2e", "#2a2a2e");
FOLK.forEach((k, i) => i % 2 ? gorroTejido(k, ["#8a3a2a", "#3a5a7a", "#5a7a3a"][i % 3], "#f2ece0") : gorroPiel(k, ["#6a4a30", "#4a3a2a", "#8a6a4a"][i % 3]));
EXT.forEach((k, i) => i % 2 ? gorroPiel(k, "#5a4030") : gorroTejido(k, ["#c9a040", "#7a3a6a"][i % 2], "#ffffff"));
// farolito de mano
const LINTERNA = new THREE.Group(); { part(RB(.26, .34, .26, .03), new THREE.MeshStandardMaterial({ color: "#ffe0a0", emissive: "#ffb050", emissiveIntensity: 2 }), 0, -.4, .1, LINTERNA, 0); part(new THREE.TorusGeometry(.1, .015, 6, 12), SM("#2a2a2a"), 0, -.18, .1, LINTERNA, 0) }
const LINT_GL = glowSprite("#ffb060", 2); LINT_GL.visible = false;

// la abuela con arrugas (frente, patas de gallo, surcos al lado de la boca) sobre su cara de bloque
const ARR = {}; const caraArrugas = kind => ARR[kind] ||= tex(512, 384, (g, w, h) => { g.drawImage(caraR6(kind).image, 0, 0, w, h); g.strokeStyle = "rgba(90,50,40,.55)"; g.lineCap = "round"; g.lineWidth = 6;
  for (const y of [42, 60]) { g.beginPath(); g.moveTo(170, y); g.quadraticCurveTo(256, y - 10, 342, y); g.stroke() }
  for (const [x, s] of [[118, -1], [394, 1]]) for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(x, 150 + k * 16); g.lineTo(x + s * 26, 140 + k * 20); g.stroke() }
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(256 + s * 70, 240); g.quadraticCurveTo(256 + s * 86, 280, 256 + s * 70, 318); g.stroke() } });
{ const sf0 = setFace; setFace = (k, f) => { if (k !== GARROW) return sf0(k, f); const t = caraArrugas(f); if (k.decal.material.map !== t) { k.decal.material.map = t; k.decal.material.needsUpdate = true } } }
