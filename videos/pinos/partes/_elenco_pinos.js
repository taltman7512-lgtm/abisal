// ---------- elenco nuevo de Hollowpine (diseños propios, ropa de invierno): el narrador (campera roja, gorro tejido azul con
// pompón, bufanda amarilla), Mila (campera verde, gorro blanco, trenzas), la abuela Ilse (pañuelo en la cabeza, chal violeta,
// anteojos), Brask el leñador (barba castaña, camisa escocesa roja y negra, gorro oscuro) y vecinos con gorros de piel
robloxify(ME, { skin: "#f0c8a0", shirt: "#b8302a", pants: "#2e3a4a", shoes: "#3a2418", pelo: ["liso", "#6a4024"] });
robloxify(ME6, { skin: "#f2d0b0", shirt: "#3f7a4a", pants: "#5a4a6a", shoes: "#5a3018", pelo: ["trenzas", "#c98a3a"] });
robloxify(GARROW, { skin: "#e8c0a0", shirt: "#6a3a6a", cloth: "sweater", alt: "#c9b48a", pants: "#3a3236", pelo: ["rodete", "#d8d4cc"] });
robloxify(PIM, { skin: "#d8a880", shirt: "#a8282a", cloth: "plaid", alt: "#1a1a1a", pants: "#3a3a42", pelo: ["corto", "#5a3a20"] });
robloxify(QUILL, { skin: "#f0c6a0", shirt: "#4a4a5a", pants: "#2e2e3a", pelo: ["corto", "#9a9a9a"] });
FOLK.forEach((k, i) => robloxify(k, { skin: ["#c98e64", "#f2cfae", "#e8b48c", "#efc8a8", "#8a5a3c", "#f2cfae"][i], shirt: ["#5a4a3a", "#2e5a7a", "#7a3a2a", "#4a5a3a", "#8a6a3a", "#3a3a5a"][i], cloth: ["plain", "sweater", "plaid", "plain", "sweater", "plain"][i], alt: "#d9c7a0", pants: ["#3a3236", "#3a3f4a", "#3a2f28", "#3a3236", "#2e3a59", "#2a2420"][i], pelo: [["corto", "#2b211b"], ["melena", "#6b3f22"], ["liso", "#c9a06a"], ["rodete", "#9a9a9a"], ["rulos", "#1d1a17"], ["puntas", "#7a4a2a"]][i] }));
EXT.forEach((k, i) => robloxify(k, { skin: ["#efc8a8", "#8a5a3c", "#f2cfae", "#c98e64"][i], shirt: ["#6a2a3a", "#3a6a5a", "#a87a2a", "#3a4a6a"][i], pants: ["#3a3f4a", "#3a2f28", "#2e3a59", "#2a2420"][i], pelo: [["liso", "#3a2416"], ["rulos", "#1d1a17"], ["trenzas", "#8a5a2a"], ["corto", "#5a3a22"]][i] }));
[ME, ME6, GARROW, PIM, QUILL, ...FOLK, ...EXT].forEach(k => telaReal(k, { shirt: k === ME ? "#b8302a" : k === ME6 ? "#3f7a4a" : k === GARROW ? "#6a3a6a" : k === PIM ? "#a8282a" : "#5a4a3a", pants: "#2e3a4a", botones: true, bolsillo: k !== ME6, cinto: k === PIM }));
// gorros tejidos con pompón, de piel, bufandas, pañuelo, chal y anteojos
const gorroTejido = (k, col, pom = "#f2ece0") => { const m = SM(col, { roughness: 1, bumpMap: T_TRAMA, bumpScale: 4 }); [...k.head.children].forEach(c => { if (c.userData.pelo && c.position.y > .55) k.head.remove(c) });
  part(new THREE.CylinderGeometry(.42, .44, .3, 24), m, 0, .66, 0, k.head, 0); const cop = part(new THREE.SphereGeometry(.42, 24, 12, 0, 6.283, 0, Math.PI / 2), m, 0, .8, 0, k.head, 0); cop.scale.y = .8;
  part(new THREE.TorusGeometry(.43, .07, 8, 28), m, 0, .55, 0, k.head, 0).rotation.x = Math.PI / 2; part(new THREE.SphereGeometry(.15, 14, 10), SM(pom, { roughness: 1, bumpMap: T_TRAMA, bumpScale: 6 }), 0, 1.16, 0, k.head, 0) };
const gorroPiel = (k, col) => { const m = SM(col, { roughness: 1, bumpMap: T_PELO_C.z, bumpScale: 5 }); [...k.head.children].forEach(c => { if (c.userData.pelo && c.position.y > .55) k.head.remove(c) }); part(new THREE.CylinderGeometry(.46, .46, .42, 24), m, 0, .8, 0, k.head, 0); for (const s of [-1, 1]) { const o = part(RB(.12, .4, .4, .05), m, s * .4, .45, 0, k.head, 0) } };
const bufanda = (k, col) => { const m = SM(col, { roughness: 1, bumpMap: T_TRAMA, bumpScale: 4 }); part(RB(1.12, .22, .62, .08), m, 0, 2.06, 0, k.body, 0); const c = part(RB(.26, .7, .08, .03), m, .25, 1.75, .3, k.body, 0); c.rotation.z = .12 };
gorroTejido(ME, "#2a4a8a"); bufanda(ME, "#e8b42a"); gorroTejido(ME6, "#f2ece0", "#d84a6a"); bufanda(ME6, "#d84a6a");
{ const m = SM("#7a2a3a", { roughness: 1, bumpMap: T_TRAMA, bumpScale: 3 }); [...GARROW.head.children].forEach(c => { if (c.userData.pelo && c.position.y > .5) GARROW.head.remove(c) }); const pa = part(new THREE.SphereGeometry(.44, 24, 16, 0, 6.283, 0, 1.7), m, 0, .45, -.02, GARROW.head, 0); pa.scale.set(1.02, 1.05, 1.05); part(new THREE.ConeGeometry(.12, .3, 6), m, 0, .14, -.38, GARROW.head, 0).rotation.x = 2.6;
  const chal = part(RB(1.2, .5, .7, .15), SM("#c9b48a", { roughness: 1, bumpMap: T_TRAMA, bumpScale: 5 }), 0, 1.95, 0, GARROW.body, 0);
  for (const s of [-1, 1]) part(new THREE.TorusGeometry(.09, .018, 6, 18), SM("#3a2a1a", { metalness: .5 }), s * .14, .44, .34, GARROW.head, 0) }
barbaSensei(PIM, "#5a3a20"); gorroTejido(PIM, "#2a2a2e", "#2a2a2e");
FOLK.forEach((k, i) => i % 2 ? gorroTejido(k, ["#8a3a2a", "#3a5a7a", "#5a7a3a"][i % 3], "#f2ece0") : gorroPiel(k, ["#6a4a30", "#4a3a2a", "#8a6a4a"][i % 3]));
EXT.forEach((k, i) => i % 2 ? gorroPiel(k, "#5a4030") : gorroTejido(k, ["#c9a040", "#7a3a6a"][i % 2], "#ffffff"));
// farolito de mano
const LINTERNA = new THREE.Group(); { part(RB(.26, .34, .26, .03), new THREE.MeshStandardMaterial({ color: "#ffe0a0", emissive: "#ffb050", emissiveIntensity: 2 }), 0, -.4, .1, LINTERNA, 0); part(new THREE.TorusGeometry(.1, .015, 6, 12), SM("#2a2a2a"), 0, -.18, .1, LINTERNA, 0) }
const LINT_GL = glowSprite("#ffb060", 2); LINT_GL.visible = false;
