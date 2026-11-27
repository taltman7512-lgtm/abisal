// ================= «NOBODY ANSWERS THE KNOCK»: el detalle de Hollowmere (utilería, velas, faroles, charcos, abrigos, las puertas que se abren,
// el ropero, la casa de la familia y el taller del sastre por dentro, la puerta y el gancho de Crane, la ventana de Marga, la campana y la
// cuerda, la iglesia por dentro, el cementerio, la boda, el poste de la colina, árboles secos, pasto, cuervos), la atmósfera (humo, polvo,
// niebla baja, estrellas, luna, polillas) y los CLIMAS DE LUZ (ENV_HOLLOW) =================
// ---------- texturas y materiales de la utilería
const T_TRAMA_D = tex(256, 256, (g, w, h) => { g.fillStyle = "#808080"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 4) { g.fillStyle = y % 8 ? "rgba(255,255,255,.2)" : "rgba(0,0,0,.22)"; g.fillRect(0, y, w, 2) } for (let x = 0; x < w; x += 4) { g.fillStyle = x % 8 ? "rgba(255,255,255,.14)" : "rgba(0,0,0,.16)"; g.fillRect(x, 0, 2, h) } }, [6, 6]);
// ropa tendida: siluetas recortadas (camisa, pantalón, sábana, vestido, medias) en telas lisas, a rayas o a cuadros, con desgaste
const ROPA_P = [["#efe9da", 0], ["#3e5a88", 0], ["#a8402e", 1, "#efe9da"], ["#d8a83a", 0], ["#5a7a44", 2, "#2e4a2a"], ["#e8d6c0", 1, "#7a5a8a"], ["#8a3a3a", 2, "#3a2a2a"], ["#6a8ab0", 1, "#e8e8f0"], ["#c8bca4", 0], ["#d86a3a", 0]];
const ROPA_F = ["camisa", "pantalon", "sabana", "vestido", "medias", "sabana", "camisa"];
const T_ROPA = (seed, [base, tipo, alt], forma) => tex(256, 256, (g, w, h) => { const r = rng(seed); g.clearRect(0, 0, w, h); g.save(); g.beginPath();
  if (forma === "camisa") { g.moveTo(70, 8); g.lineTo(186, 8); g.lineTo(250, 40); g.lineTo(232, 110); g.lineTo(196, 96); g.lineTo(196, 250); g.lineTo(60, 250); g.lineTo(60, 96); g.lineTo(24, 110); g.lineTo(6, 40); g.closePath() }
  else if (forma === "pantalon") { g.moveTo(40, 6); g.lineTo(216, 6); g.lineTo(236, 250); g.lineTo(146, 250); g.lineTo(128, 90); g.lineTo(110, 250); g.lineTo(20, 250); g.closePath() }
  else if (forma === "vestido") { g.moveTo(80, 6); g.lineTo(176, 6); g.lineTo(190, 80); g.lineTo(246, 250); g.lineTo(10, 250); g.lineTo(66, 80); g.closePath() }
  else if (forma === "medias") { g.moveTo(30, 4); g.lineTo(100, 4); g.lineTo(100, 190); g.quadraticCurveTo(100, 250, 40, 240); g.lineTo(30, 200); g.closePath(); g.moveTo(150, 4); g.lineTo(220, 4); g.lineTo(220, 180); g.quadraticCurveTo(220, 240, 160, 232); g.lineTo(150, 190); g.closePath() }
  else g.rect(4, 4, w - 8, h - 8);
  g.clip(); g.fillStyle = base; g.fillRect(0, 0, w, h);
  if (tipo === 1) for (let x = 0; x < w; x += 32) { g.fillStyle = alt; g.fillRect(x, 0, 12 + r() * 4, h) }
  if (tipo === 2) { g.globalAlpha = .55; for (let x = 0; x < w; x += 42) { g.fillStyle = alt; g.fillRect(x, 0, 18, h); g.fillRect(0, x, w, 18) } g.globalAlpha = 1 }
  for (let k = 0; k < 700; k++) { g.fillStyle = r() < .5 ? "rgba(255,255,250,.08)" : "rgba(40,30,20,.1)"; g.fillRect(r() * w, r() * h, 2 + r() * 20, 1.5) }
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(40,30,20,.2)"); gr.addColorStop(.12, "rgba(40,30,20,0)"); gr.addColorStop(1, "rgba(40,30,20,.12)"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.restore(); g.strokeStyle = "rgba(30,22,14,.35)"; g.lineWidth = 3; g.stroke() });
const M_ROPA = ROPA_P.map((p, i) => conViento(new THREE.MeshStandardMaterial({ map: T_ROPA(5100 + i, p, ROPA_F[i % ROPA_F.length]), bumpMap: T_TRAMA_D, bumpScale: 1.5, roughness: .95, alphaTest: .5 }), "tela", .05));
const M_ROPA_T = ROPA_P.map((p, i) => new THREE.MeshStandardMaterial({ map: M_ROPA[i].map, bumpMap: T_TRAMA_D, bumpScale: 1.5, roughness: .95, alphaTest: .5, side: THREE.DoubleSide }));   // (Tanner: se aplasta, sin brisa)
const M_BARRIL = (() => { const [c, z] = pintarDoble(256, 256, (c, z, w, h) => { const r = rng(5140); let x = 0; z.fillStyle = "#808080"; z.fillRect(0, 0, w, h); while (x < w) { const pw = 22 + r() * 10; c.fillStyle = rgbj("#8a6440", r, 26); c.fillRect(x, 0, pw, h); for (let k = 0; k < 10; k++) { c.strokeStyle = "rgba(50,34,20,.3)"; c.lineWidth = 1; const xx = x + r() * pw; c.beginPath(); c.moveTo(xx, 0); c.lineTo(xx + (r() - .5) * 4, h); c.stroke() } c.fillStyle = "rgba(30,20,12,.7)"; c.fillRect(x + pw - 2, 0, 2, h); z.fillStyle = "#202020"; z.fillRect(x + pw - 3, 0, 3, h); x += pw } }); return new THREE.MeshStandardMaterial({ map: c, bumpMap: z, bumpScale: 2.5, roughness: .9 }) })();
const M_HIERRO_N = new THREE.MeshStandardMaterial({ color: "#232120", roughness: .55, metalness: .7, envMap: ENV_METAL_P, envMapIntensity: .5 });
const M_BRONCE = new THREE.MeshStandardMaterial({ color: "#a07a3a", roughness: .34, metalness: .92, envMap: ENV_METAL_P, envMapIntensity: 1.1 });
const M_GRASA = new THREE.MeshStandardMaterial({ color: "#1e1810", roughness: .2, metalness: .3, envMap: ENV_METAL_P, envMapIntensity: .8 });
const T_FOLLAJE = (() => { const [c, z] = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(4702); c.fillStyle = "#8a9a6a"; c.fillRect(0, 0, w, h); z.fillStyle = "#606060"; z.fillRect(0, 0, w, h);
    for (let k = 0; k < 6000; k++) { const x = r() * w, y = r() * h, L = 5 + r() * 10, a = r() * 6.28, v = r(); c.strokeStyle = v < .4 ? "rgba(40,56,26,.6)" : v < .8 ? "rgba(140,160,96,.5)" : "rgba(200,210,150,.5)"; c.lineWidth = 1.5 + r() * 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); c.stroke(); z.strokeStyle = v < .4 ? "rgba(20,20,20,.5)" : "rgba(220,220,220,.5)"; z.lineWidth = 2; z.beginPath(); z.moveTo(x, y); z.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); z.stroke() } });
  [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
const T_CORTEZA = (() => { const [c, z] = pintarDoble(256, 512, (c, z, w, h) => { const r = rng(4701); c.fillStyle = "#6a5e50"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
    for (let k = 0; k < 260; k++) { const x = r() * w, y = r() * h, L = 30 + r() * 140; c.strokeStyle = r() < .5 ? `rgba(40,32,24,${.3 + r() * .4})` : `rgba(170,160,140,${.2 + r() * .3})`; c.lineWidth = 2 + r() * 5; c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + (r() - .5) * 20, y + L / 3, x + (r() - .5) * 20, y + L * .66, x + (r() - .5) * 10, y + L); c.stroke(); z.strokeStyle = "rgba(20,20,20,.6)"; z.lineWidth = 3; z.beginPath(); z.moveTo(x, y); z.lineTo(x, y + L); z.stroke() } });
  [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
const M_CORTEZA = new THREE.MeshStandardMaterial({ map: T_CORTEZA.c, bumpMap: T_CORTEZA.z, bumpScale: 4, roughness: .95 });
const M_COPA = conViento(new THREE.MeshStandardMaterial({ map: T_FOLLAJE.c, bumpMap: T_FOLLAJE.z, bumpScale: 5, roughness: .85, color: "#ffffff" }), "copa", .03);
const M_SETO = new THREE.MeshStandardMaterial({ map: T_FOLLAJE.c, bumpMap: T_FOLLAJE.z, bumpScale: 6, roughness: .9, color: "#7aa060" });
const M_INTERIOR = new THREE.MeshStandardMaterial({ map: T_TABLA_N.c, bumpMap: T_TABLA_N.z, bumpScale: 2, roughness: .9, color: "#b08a60", emissive: "#5a3418", emissiveIntensity: .55 });   // adentro de la casilla (luz del farolito)
const M_MARMOL = new THREE.MeshStandardMaterial({ map: T_SILLAR_C[0], bumpMap: T_SILLAR_C[1], bumpScale: 2, roughness: .55, color: "#f4f0e8" });
const PB = lote(), PBV = lote();   // utilería fija · ropa tendida y toldos (brisa)
const PB_M = { madera: M_MADERA, maderaV: M_MADERA_V, viga: M_VIGA, hierro: M_HIERRO, hierroO: M_HIERRO_O, hierroN: M_HIERRO_N, soga: M_SOGA, piedra: M_ROCA_G, piedraC: M_PIEDRA_C, zocalo: M_ZOCALO, barril: M_BARRIL, oscuro: M_OSCURO, terracota: M_TERRACOTA, chapa: M_CHAPA, bronce: M_BRONCE, grasa: M_GRASA, laton: M_LATON, marmol: M_MARMOL, seto: M_SETO, interior: M_INTERIOR, blanco: M_BLANCO_P, sillarC: M_SILLAR_C,
  luz: CASA_MATS.luz, tela: SM("#efe9dc", { roughness: .9 }), verde: SM("#4e7032", { roughness: .8 }), cuero: SM("#5a3e2a", { roughness: .85 }), piel: SM("#e8b898", { roughness: .7 }), tierra: SM("#5a4632", { roughness: 1 }), agua: new THREE.MeshStandardMaterial({ color: "#5a7a8a", roughness: .08, metalness: .3, envMap: ENV_METAL_P, envMapIntensity: 1 }),
  saco: new THREE.MeshStandardMaterial({ color: "#c8b898", bumpMap: T_TRAMA_D, bumpScale: 3, roughness: 1 }), cajon: new THREE.MeshStandardMaterial({ map: T_TABLA_N.c, bumpMap: T_TABLA_N.z, bumpScale: 3, roughness: .9, color: "#b89a70" }) };
M_PUERTA.forEach((m, i) => PB_M["col" + i] = m); ["#f4f0e0", "#e8c838", "#8a6ab8", "#d84a6a", "#f0a040"].forEach((c, i) => PB_M["flor" + i] = SM(c, { roughness: .6 }));
const PBV_M = {}; M_ROPA.forEach((m, i) => PBV_M["ropa" + i] = m);

// ---------- piezas sueltas (cada función agrega geometría a un lote con la matriz del lugar)
const barril = (L, M) => { const g = new THREE.CylinderGeometry(.34, .34, .9, 14, 4), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const k = 1 + .16 * Math.cos(p.getY(i) / .45 * 1.57); p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k) } g.computeVertexNormals(); L.add("barril", g, M.clone().multiply(TM(0, .45, 0))); for (const y of [.14, .45, .76]) L.add("hierroN", new THREE.TorusGeometry(y === .45 ? .395 : .365, .018, 4, 18), M.clone().multiply(TM(0, y, 0, Math.PI / 2))); L.add("madera", new THREE.CylinderGeometry(.33, .33, .03, 14), M.clone().multiply(TM(0, .9, 0))) };
const cuerda = (L, a, b, r = .018) => { const [g, m] = cilEntre(a, b, r, 4); L.add("soga", g, m) };
const banco = (L, M) => { L.add("madera", new THREE.BoxGeometry(1.6, .08, .38), M.clone().multiply(TM(0, .46, 0))); for (const s of [-1, 1]) L.add("maderaV", new THREE.BoxGeometry(.08, .44, .34), M.clone().multiply(TM(s * .66, .22, 0))) };
const cajon = (L, M, s = 1) => { L.add("cajon", RB1(.62 * s, .44 * s, .46 * s, .015), M.clone().multiply(TM(0, .22 * s, 0))); for (const yy of [.06, .38]) L.add("madera", new THREE.BoxGeometry(.64 * s, .05 * s, .48 * s), M.clone().multiply(TM(0, yy * s, 0))) };
const saco = (L, M) => { const s = new THREE.CylinderGeometry(.24, .3, .62, 10, 3), q = s.attributes.position; for (let i = 0; i < q.count; i++) { const y = q.getY(i), f = 1 + .12 * Math.cos(y * 4); q.setX(i, q.getX(i) * f); q.setZ(i, q.getZ(i) * f * .75) } s.computeVertexNormals(); L.add("saco", s, M.clone().multiply(TM(0, .31, 0))); L.add("soga", new THREE.TorusGeometry(.1, .02, 4, 10), M.clone().multiply(TM(0, .59, 0, Math.PI / 2))); L.add("saco", new THREE.ConeGeometry(.12, .16, 8), M.clone().multiply(TM(0, .7, 0, Math.PI))) };
const balde = (L, M, grasa = false) => { L.add("hierroO", new THREE.CylinderGeometry(.17, .13, .32, 12, 1, true), M.clone().multiply(TM(0, .16, 0))); L.add("hierroO", new THREE.CircleGeometry(.13, 12), M.clone().multiply(TM(0, .01, 0, -Math.PI / 2))); L.add(grasa ? "grasa" : "oscuro", new THREE.CircleGeometry(.16, 12), M.clone().multiply(TM(0, .27, 0, -Math.PI / 2))); L.add("hierro", new THREE.TorusGeometry(.17, .008, 4, 12, Math.PI), M.clone().multiply(TM(0, .32, 0, 0, 0, 0))) };
const flores3D = (L, M, n, r, an = .8, prof = .2) => { for (let k = 0; k < n; k++) { const x = (r() - .5) * an, z = (r() - .5) * prof, h = .12 + r() * .14; L.add("verde", new THREE.CylinderGeometry(.008, .01, h, 4), M.clone().multiply(TM(x, h / 2, z, 0, 0, .25))); const c = "flor" + (r() * 5 | 0); for (let p = 0; p < 5; p++) { const a = p / 5 * 6.283; L.add(c, new THREE.SphereGeometry(.026, 5, 3), M.clone().multiply(TM(x + h * .12 + Math.cos(a) * .028, h, z + Math.sin(a) * .028, 0, -a, 0, 1.3, .35, .8))) } L.add("flor1", new THREE.SphereGeometry(.015, 5, 3), M.clone().multiply(TM(x + h * .12, h + .01, z))) } };
function lena(L, M, r, an = 1.6) { for (let f = 0; f < 5; f++) for (let k = 0; k < Math.round(an / .2) - (f % 2); k++) L.add(k % 3 ? "madera" : "maderaV", new THREE.CylinderGeometry(.085 + r() * .02, .09, .52, 7), M.clone().multiply(TM(-an / 2 + .1 + k * .2 + (f % 2) * .1, .09 + f * .165, 0, Math.PI / 2, 0, 0)));
  L.add("chapa", new THREE.BoxGeometry(an + .3, .04, .8), M.clone().multiply(TM(0, .95, 0, .08, 0, 0))) }
const rueda = (L, M, R = .55) => { L.add("maderaV", new THREE.TorusGeometry(R, .055, 6, 20), M); L.add("hierroN", new THREE.TorusGeometry(R + .045, .022, 4, 20), M); L.add("madera", new THREE.CylinderGeometry(.1, .1, .2, 10), M.clone().multiply(TM(0, 0, 0, Math.PI / 2))); for (let k = 0; k < 8; k++) L.add("maderaV", new THREE.CylinderGeometry(.028, .032, R * 2, 5), M.clone().multiply(TM(0, 0, 0, 0, 0, k / 8 * Math.PI))) };
function carro(L, M, r) { const an = 1.25, la = 2.3; L.add("maderaV", new THREE.BoxGeometry(an, .08, la), M.clone().multiply(TM(0, .72, 0))); for (const s of [-1, 1]) { L.add("maderaV", new THREE.BoxGeometry(.06, .4, la), M.clone().multiply(TM(s * an / 2, .94, 0))); rueda(L, M.clone().multiply(TM(s * (an / 2 + .14), .6, .1, 0, Math.PI / 2, 0))); L.add("madera", new THREE.CylinderGeometry(.04, .045, 2.2, 6), M.clone().multiply(TM(s * .4, .45, 2.1, 1.33, 0, 0))) }
  L.add("maderaV", new THREE.BoxGeometry(an, .4, .06), M.clone().multiply(TM(0, .94, -la / 2))); for (let k = 0; k < 4; k++) saco(L, M.clone().multiply(TM((k % 2 - .5) * .55, .76, -.5 + (k >> 1) * .75, Math.PI / 2 * .9, r() * .5, 0))) }
const farol = (L, x, z, alto = 3.4) => { const y = SUELO(x, z); L.add("hierroN", new THREE.CylinderGeometry(.2, .26, .3, 8), TM(x, y + .15, z)); L.add("hierroN", new THREE.CylinderGeometry(.05, .07, alto, 8), TM(x, y + alto / 2, z));
  L.add("hierroN", new THREE.CylinderGeometry(.16, .12, .08, 6), TM(x, y + alto + .02, z)); L.add("luz", new THREE.CylinderGeometry(.15, .1, .42, 6), TM(x, y + alto + .27, z)); for (let k = 0; k < 6; k++) { const a = k / 6 * 6.283; L.add("hierroN", new THREE.BoxGeometry(.02, .44, .02), TM(x + Math.cos(a) * .15, y + alto + .27, z + Math.sin(a) * .15)) }
  L.add("hierroN", new THREE.ConeGeometry(.24, .22, 6), TM(x, y + alto + .59, z)); L.add("hierroN", new THREE.SphereGeometry(.04, 6, 4), TM(x, y + alto + .72, z)); L.add("hierroN", new THREE.BoxGeometry(.5, .03, .03), TM(x, y + alto - .25, z)); ocupa(x, z, .4) };
// ropa tendida cruzando la calle (soga de un muro al de enfrente, a la altura del primer piso; la ropa cuelga en el plano de la soga)
function tendedero(L, LV, x, zA, zB, yA, yB, r, sag = .45) { const pt = q => [x, lerp(yA, yB, q) - Math.sin(q * Math.PI) * sag, lerp(zA, zB, q)];
  for (const [zz, yy] of [[zA, yA], [zB, yB]]) { L.add("hierro", new THREE.TorusGeometry(.06, .012, 4, 10), TM(x, yy, zz + Math.sign(zz - (zA + zB) / 2) * .01, 0, Math.PI / 2, 0)); L.add("hierro", new THREE.BoxGeometry(.04, .04, .14), TM(x, yy + .05, zz - Math.sign(zz - (zA + zB) / 2) * .04)) }
  const N = 12; for (let k = 0; k < N; k++) cuerda(L, pt(k / N), pt((k + 1) / N), .011);
  const Lz = Math.abs(zB - zA); let q = .05 + r() * .05; while (q < .93) { const k = r() * M_ROPA.length | 0, forma = ROPA_F[k % ROPA_F.length], an = forma === "sabana" ? .9 + r() * .5 : forma === "medias" ? .35 : .55 + r() * .25, al = forma === "sabana" ? 1.0 + r() * .5 : forma === "pantalon" ? .9 : forma === "medias" ? .4 : .65 + r() * .15;
    const P = pt(q + an / Lz / 2), g = new THREE.PlaneGeometry(al, an, 3, 4); g.rotateZ(-Math.PI / 2); g.translate(0, -al / 2, 0); g.rotateY(Math.PI / 2); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setX(i, p.getX(i) + Math.sin((p.getZ(i) / an + .5) * Math.PI) * .03);
    LV.add("ropa" + k, g, TM(P[0] + (r() - .5) * .02, P[1] - .01, P[2], (r() - .5) * .06, 0, 0)); for (const dz of [-an / 2 + .05, an / 2 - .05]) L.add("maderaV", new THREE.BoxGeometry(.025, .09, .03), TM(P[0], P[1] + .01, P[2] + dz)); q += an / Lz + .02 + r() * .05 } }


// ================= LAS VELAS: miles, instanciadas (cuerpo de cera con chorreaduras y charquito, llama que tiembla, halo). Las llamas se inclinan
// hacia un punto con velasHacia(p, u) (cuando pasa Sallow). Grupos en VELAS_B: 0 ventanas, 1 tienda, 2 plaza y fuente, 3 casa de Nell, 4 faroles,
// 5 altar y mercado, 6 risco
const VELA_U = { uT: { value: 0 }, uP: { value: new THREE.Vector3(0, -999, 0) }, uU: { value: 0 }, uRad: { value: 26 }, uTiem: { value: 1 }, uHalo: { value: .3 }, uFogD: { value: .005 } };
const GEO_VELA = (() => { const r = rng(7300), L = [[new THREE.CylinderGeometry(.5, .53, 1, 8, 1), TM(0, .5, 0)], [new THREE.TorusGeometry(.47, .07, 4, 8), TM(0, .98, 0, Math.PI / 2)], [new THREE.CylinderGeometry(1.15, 1.4, .04, 9), TM(0, .02, 0)]];
  for (let k = 0; k < 4; k++) { const a = r() * 6.283, l = .2 + r() * .55; L.push([new THREE.CapsuleGeometry(.1, l, 2, 5), TM(Math.cos(a) * .5, .98 - l / 2 - .05, Math.sin(a) * .5)]) }
  L.push([new THREE.SphereGeometry(.28, 6, 4), TM(.55, .1, .3, 0, 0, 0, 1.6, .5, 1.3)]); return mergeG(L) })();
const GEO_LLAMA = new THREE.LatheGeometry([[0, 0], [.32, .1], [.42, .3], [.32, .58], [.14, .84], [0, 1]].map(q => new THREE.Vector2(q[0], q[1])), 7);
const M_LLAMA = new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(3.2, 2.1, .9), fog: true });
M_LLAMA.onBeforeCompile = sh => { Object.assign(sh.uniforms, { uT: VELA_U.uT, uP: VELA_U.uP, uU: VELA_U.uU, uRad: VELA_U.uRad, uTiem: VELA_U.uTiem });
  sh.vertexShader = "uniform float uT, uU, uRad, uTiem; uniform vec3 uP;\n" + sh.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>
  { vec3 b0 = (modelMatrix * instanceMatrix * vec4(0., 0., 0., 1.)).xyz; float ph = fract(sin(dot(b0.xz, vec2(12.9898, 78.233))) * 43758.5453) * 6.2831;
    float fl = 1. + uTiem * (.16 * sin(uT * 11. + ph) + .09 * sin(uT * 27.3 + ph * 3.) + .06 * sin(uT * 53. + ph * 7.)); transformed.y *= fl; transformed.xz *= 1. + .1 * uTiem * sin(uT * 17. + ph * 2.);
    vec2 dd = uP.xz - b0.xz; float L = length(dd); float k = uU * (1. - smoothstep(uRad * .25, uRad, L)); vec2 dir = L > .01 ? dd / L : vec2(0.);
    float sw = uTiem * .14 * sin(uT * 3.1 + ph) + uTiem * uTiem * .1 * sin(uT * 19. + ph * 5.);
    transformed.xz += (dir * k * 3.6 + vec2(sw, sw * .7)) * position.y * position.y; transformed.y *= 1. - .3 * k; }`) };
M_LLAMA.customProgramCacheKey = () => "llamaB";
const M_HALO_B = (col, ex = 1) => new THREE.ShaderMaterial({ uniforms: { map: { value: GLOW }, uHalo: VELA_U.uHalo, uT: VELA_U.uT, uTiem: VELA_U.uTiem, uFogD: VELA_U.uFogD, uCol: { value: new THREE.Color(col).multiplyScalar(ex) } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  vertexShader: `uniform float uT, uTiem, uFogD; varying vec2 vUv; varying float vF; void main(){ vUv = uv; vec4 c = modelMatrix * instanceMatrix * vec4(0., 0., 0., 1.); float s = length(instanceMatrix[0].xyz);
    float ph = fract(sin(dot(c.xz, vec2(12.9898, 78.233))) * 43758.5453) * 6.2831; s *= 1. + uTiem * .13 * sin(uT * 9. + ph) + uTiem * .06 * sin(uT * 23. + ph);
    vec4 mv = viewMatrix * c; mv.xy += position.xy * s; gl_Position = projectionMatrix * mv; float d = -mv.z; vF = exp(-uFogD * uFogD * d * d) * smoothstep(.5, 2.5, d); }`,
  fragmentShader: `uniform sampler2D map; uniform float uHalo; uniform vec3 uCol; varying vec2 vUv; varying float vF; void main(){ float a = texture2D(map, vUv).a; gl_FragColor = vec4(uCol * a * a * uHalo * vF, 1.); }` });
const M_VELA = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .45, emissive: "#40280c", emissiveIntensity: .35 });
let VELAS_M = null;
function velasArmar() { const N = VELAS_B.length, cuerpo = new THREE.InstancedMesh(GEO_VELA, M_VELA, N), llama = new THREE.InstancedMesh(GEO_LLAMA, M_LLAMA, N), halo = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), M_HALO_B("#ffb460", 1.0), N), cc = new THREE.Color(), r = rng(7310);
  const COL = ["#f4ecd8", "#efe2c0", "#e8d49a", "#f8f2e4", "#e0c890", "#f2e6cc"];
  VELAS_B.forEach((v, i) => { const farol = v.g === 4, rr = farol ? .025 : v.gorda ? .045 + r() * .025 : .018 + r() * .014, h = v.h ?? .15, [x, y, z] = v.p;
    dummy.position.set(x, y, z); dummy.rotation.set((r() - .5) * .06, r() * 6, (r() - .5) * .06); dummy.scale.set(rr * 2, farol ? .05 : h, rr * 2); dummy.updateMatrix(); cuerpo.setMatrixAt(i, dummy.matrix); cuerpo.setColorAt(i, cc.set(v.col || COL[r() * COL.length | 0]));
    const fw = farol ? .05 : .016 + rr * .3, fh = farol ? .16 : .055 + rr * .6 + r() * .02, yf = y + (farol ? .05 : h) + .004; dummy.position.set(x, yf, z); dummy.rotation.set(0, 0, 0); dummy.scale.set(fw, fh, fw); dummy.updateMatrix(); llama.setMatrixAt(i, dummy.matrix);
    dummy.position.set(x, yf + fh * .4, z); dummy.scale.setScalar(farol ? .9 : v.g === 0 ? .24 : .2 + rr * 2.5); dummy.updateMatrix(); halo.setMatrixAt(i, dummy.matrix) });
  cuerpo.castShadow = false; cuerpo.receiveShadow = true; llama.frustumCulled = halo.frustumCulled = false; cuerpo.frustumCulled = false; halo.renderOrder = 5; [cuerpo, llama, halo].forEach(m => scene.add(m)); VELAS_M = { cuerpo, llama, halo } }
// velasHacia(p, u): las llamas cercanas a p ([x, y, z], radio ≈ 26 m) se inclinan hacia p con fuerza u (0–1; 1 ≈ 50°); velasHacia(null) las endereza
function velasHacia(p, u = 1, radio = 26) { if (!p) { VELA_U.uU.value = 0; return } VELA_U.uP.value.set(p[0], p[1], p[2]); VELA_U.uU.value = u; VELA_U.uRad.value = radio }
// lucesCerca(p, n): las n luces puntuales sugeridas más cercanas a p (para lights() de la escena), con la intensidad del clima
const LUCES_PUNTOS = [];   // [x, y, z, intensidad, color, distancia]
function lucesCerca(p, n = 6) { const A = ENV[ENVNOW] || {}, k = A.luces ?? 1, q = Array.isArray(p) ? p : [p.x, p.y, p.z];
  return LUCES_PUNTOS.map(l => [l, Math.hypot(l[0] - q[0], l[1] - q[1], l[2] - q[2])]).sort((a, b) => a[1] - b[1]).slice(0, n).map(([l]) => [[l[0], l[1], l[2]], l[3] * k, l[4], l[5]]) }

const T_PANAL = tex(256, 256, (g, w, h) => { g.fillStyle = "#7a4a10"; g.fillRect(0, 0, w, h); const R = 9; for (let y = 0, f = 0; y < h + R; y += R * 1.5, f++) for (let x = (f % 2) * R * .866; x < w + R; x += R * 1.732) { g.fillStyle = `rgb(${200 + (x * y % 40)},${140 + (x % 30)},${30 + (y % 20)})`; g.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * 6.283 + Math.PI / 6; g.lineTo(x + Math.cos(a) * (R - 1.5), y + Math.sin(a) * (R - 1.5)) } g.fill() } });
const T_CESTA = tex(128, 128, (g, w, h) => { g.fillStyle = "#8a6a3a"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 8) for (let x = (y / 8 % 2) * 8; x < w; x += 16) { g.fillStyle = "#b8945a"; g.fillRect(x, y, 10, 6) } }, [3, 1]);
const T_TOLDO = (a, b, seed) => tex(256, 256, (g, w, h) => { const r = rng(seed); for (let x = 0; x < w; x += 32) { g.fillStyle = (x / 32) % 2 ? b : a; g.fillRect(x, 0, 32, h) } for (let k = 0; k < 900; k++) { g.fillStyle = r() < .5 ? "rgba(40,30,20,.1)" : "rgba(255,250,240,.08)"; g.fillRect(r() * w, r() * h, 2 + r() * 14, 1.5) }
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(30,20,10,.25)"); gr.addColorStop(.3, "rgba(30,20,10,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h) });
const TOLDOS_C = [["#b03a2e", "#efe6d0"], ["#3e6a48", "#e8dcc0"], ["#2e5a8a", "#f0ece0"], ["#c88a2a", "#f2e8d0"], ["#7a3a6a", "#e8dcc8"], ["#a84a2a", "#2a3a4a"]];
TOLDOS_C.forEach(([a, b], i) => PBV_M["toldo" + i] = conViento(new THREE.MeshStandardMaterial({ map: T_TOLDO(a, b, 7700 + i), roughness: .9 }), "toldo", .05));
Object.assign(PB_M, { cera: M_CERA, ceraV: M_CERA_V, panal: new THREE.MeshStandardMaterial({ map: T_PANAL, bumpMap: T_PANAL, bumpScale: 3, roughness: .35, emissive: "#5a3000", emissiveIntensity: .25 }), miel: new THREE.MeshStandardMaterial({ color: "#c87a10", roughness: .15, transparent: true, opacity: .85 }),
  cesta: new THREE.MeshStandardMaterial({ map: T_CESTA, bumpMap: T_CESTA, bumpScale: 2, roughness: 1 }), pizarra: new THREE.MeshStandardMaterial({ map: null, roughness: .9 }), maderaN: M_MADERA_N, papel: M_PAPEL, cortina: M_CORTINA, muroT: M_MURO_T, corona: M_CORONA, mantel: SM("#e8dcc0", { roughness: 1 }), muneca: SM("#c86a4a", { roughness: 1 }) });
const pf = (x, z) => sueloB(x, z);
const ryAfuera = a => Math.atan2(Math.cos(a), Math.sin(a));   // ry que mira hacia afuera (radial)
const T_BRASA = tex(256, 256, (g, w, h) => { const r = rng(7420); g.fillStyle = "#1a0602"; g.fillRect(0, 0, w, h); for (let k = 0; k < 160; k++) { const x = r() * w, y = r() * h, s = 6 + r() * 20, gr = g.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, r() < .5 ? "#ffd070" : "#ff7a20"); gr.addColorStop(.6, "rgba(200,50,10,.6)"); gr.addColorStop(1, "rgba(60,10,2,0)"); g.fillStyle = gr; g.fillRect(x - s, y - s, 2 * s, 2 * s) } });

// ================= HOLLOWMERE: utilería de las casas (abrigos, puertas que se abren, el ropero, la casa de la familia y el taller por dentro,
// la puerta y el gancho de Crane, la ventana de Marga) =================
const W3 = (M, x, y, z) => new THREE.Vector3(x, y, z).applyMatrix4(M).toArray();
// ---------- FAROLES DE HIERRO (con llama adentro): los pone farolB(x, z, alto); una de cada dos da luz puntual (LUCES_PUNTOS)
const FAROLES = [];
const farolB = (x, z, alto = 3.4) => { farol(PB, x, z, alto); rectAdd({ x, z, ry: 0, w: .6, d: .6, farol: 1 }); const y = pf(x, z); VELAS_B.push({ p: [x, y + alto + .12, z], g: 4 }); FAROLES.push([x, y + alto + .3, z]) };
// ---------- los ABRIGOS (paño de lana pintado: sarga, pelusa, desgaste, remiendos cosidos con puntadas gruesas, costuras)
const T_LANA = (seed, base, o = {}) => { const [c, z] = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(seed); c.fillStyle = base; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 4) for (let x = (y / 4 % 4) * 2; x < w; x += 8) { c.fillStyle = (x + y) % 16 < 8 ? "rgba(0,0,0,.13)" : "rgba(255,255,255,.05)"; c.fillRect(x, y, 4, 3); z.fillStyle = "rgba(170,170,170,.6)"; z.fillRect(x, y, 4, 2) }
    for (let k = 0; k < 9000; k++) { c.fillStyle = r() < .5 ? "rgba(0,0,0,.1)" : "rgba(255,250,240,.07)"; c.fillRect(r() * w, r() * h, 1 + r() * 2, 1) }
    if (o.raya) for (let x = 0; x < w; x += 22) { c.fillStyle = o.raya; c.fillRect(x, 0, 2, h) }
    for (let k = 0; k < 40; k++) { const x = r() * w, y = r() * h, s = 20 + r() * 70, gr = c.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, `rgba(${r() < .5 ? "0,0,0" : "255,240,220"},${.06 + r() * .1})`); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(x - s, y - s, 2 * s, 2 * s) }
    // costuras largas (con puntadas)
    for (const xs of [w * .25, w * .5, w * .75]) { c.strokeStyle = "rgba(0,0,0,.45)"; c.lineWidth = 3; c.beginPath(); c.moveTo(xs, 0); c.lineTo(xs + 4, h); c.stroke(); z.strokeStyle = "#303030"; z.lineWidth = 4; z.beginPath(); z.moveTo(xs, 0); z.lineTo(xs + 4, h); z.stroke() }
    // remiendos: un pedazo de otra tela con puntadas grandes alrededor (los agujeros que cose el sastre)
    for (let k = 0; k < (o.parches ?? 3); k++) { const x = r() * (w - 120), y = r() * (h - 120), pw = 50 + r() * 70, ph = 40 + r() * 60, col = rgbj(o.parcheCol || ["#6a5a44", "#4a4a52", "#7a3a2a", "#3a4a3a", "#8a7a5a"][r() * 5 | 0], r, 20);
      c.save(); c.translate(x + pw / 2, y + ph / 2); c.rotate((r() - .5) * .4); c.fillStyle = col; c.fillRect(-pw / 2, -ph / 2, pw, ph); for (let q = 0; q < 300; q++) { c.fillStyle = r() < .5 ? "rgba(0,0,0,.14)" : "rgba(255,255,255,.07)"; c.fillRect(-pw / 2 + r() * pw, -ph / 2 + r() * ph, 2, 1) }
      c.strokeStyle = o.hilo || "#d8c8a0"; c.lineWidth = 2.5; for (let q = 0; q < 2 * (pw + ph); q += 11) { let px, py; if (q < pw) { px = -pw / 2 + q; py = -ph / 2 } else if (q < pw + ph) { px = pw / 2; py = -ph / 2 + q - pw } else if (q < 2 * pw + ph) { px = pw / 2 - (q - pw - ph); py = ph / 2 } else { px = -pw / 2; py = ph / 2 - (q - 2 * pw - ph) } c.beginPath(); c.moveTo(px - 4, py - 4); c.lineTo(px + 4, py + 4); c.stroke() } c.restore();
      z.fillStyle = "#a8a8a8"; z.fillRect(x, y, pw, ph) }
    // agujeros todavía abiertos (oscuros con hilachas)
    for (let k = 0; k < (o.agujeros ?? 0); k++) { const x = r() * w, y = r() * h, s = 6 + r() * 10; c.fillStyle = "#050404"; c.beginPath(); c.ellipse(x, y, s, s * .7, r() * 3, 0, 7); c.fill(); z.fillStyle = "#000"; z.beginPath(); z.ellipse(x, y, s, s * .7, 0, 0, 7); z.fill() } });
  [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } };
const ABRIGO_TIPOS = { negro: ["#1c1c20", { raya: "rgba(120,120,130,.12)", parches: 0 }, "#d8a840", 1], chico: ["#8a6a34", { parches: 2, parcheCol: "#5a4a30" }, "#5a3a20", .66], rojo: ["#8e1c1c", { parches: 2, parcheCol: "#6a1414", hilo: "#e8d0a0" }, "#2a1a14", .97],
  gris: ["#5a5852", { parches: 5 }, "#2a2620", 1], azul: ["#2c3a52", { parches: 3 }, "#2a2a2a", 1], verde: ["#3a4a32", { parches: 4 }, "#3a2a1a", 1], marron: ["#5a3e2a", { parches: 3, agujeros: 3 }, "#2a1a10", 1], ocre: ["#9a7a3a", { parches: 2 }, "#3a2a10", .95], vino: ["#4a1a26", { parches: 1 }, "#c8a050", 1] };
const M_ABRIGO = {}; Object.entries(ABRIGO_TIPOS).forEach(([k, [col, o, bot]], i) => { const T = T_LANA(4900 + i, col, o); M_ABRIGO[k] = { lana: new THREE.MeshStandardMaterial({ map: T.c, bumpMap: T.z, bumpScale: 3, roughness: .97, side: THREE.DoubleSide }), boton: new THREE.MeshStandardMaterial({ color: bot, roughness: k === "negro" ? .25 : .6, metalness: k === "negro" ? .9 : 0, envMap: ENV_METAL_P, envMapIntensity: k === "negro" ? 1.5 : .2 }), forro: SM("#1a1412", { roughness: 1 }) } });
// abrigoGeo(tipo, o): un abrigo COLGADO (el origen es el punto de donde cuelga, cuelga hacia −y, el frente mira a +z). o.s = escala, o.manga = 0..1 cuánto se abren las mangas
function abrigoGeo(tipo = "gris", o = {}) { const T = ABRIGO_TIPOS[tipo] || ABRIGO_TIPOS.gris, s = o.s ?? T[3], L = lote(), r = rng(4950 + Object.keys(ABRIGO_TIPOS).indexOf(tipo) * 7 + (o.seed || 0)), Lc = 1.08;
  // cuerpo: cilindro deformado (hombros caídos, se ensancha hacia el ruedo, pliegues que crecen abajo, el frente abierto apenas)
  { const g = new THREE.CylinderGeometry(1, 1, 1, 28, 18, true), p = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < p.count; i++) { const a = Math.atan2(p.getZ(i), p.getX(i)), t = .5 - p.getY(i), hw = lerp(.2, .3, Math.pow(t, .7)), hd = lerp(.11, .155, t), pl = 1 + .05 * t * Math.sin(a * 9 + t * 3) + .02 * Math.sin(a * 17);
      let x = Math.cos(a) * hw * pl, zz = Math.sin(a) * hd * pl, y = -t * Lc; if (t < .12) { const k = 1 - t / .12; y -= .07 * k * Math.pow(Math.abs(Math.cos(a)), 2); x *= 1 + .1 * k } if (Math.abs(a - Math.PI / 2) < .06) zz += .012 * t; p.setXYZ(i, x, y + .02, zz); uv.setXY(i, a / Math.PI, t * 1.6) } g.computeVertexNormals(); L.add("lana", g) }
  L.add("lana", new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), TM(0, -.03, 0, 0, 0, 0, .2, .06, .11));   // hombros (tapa)
  // mangas que cuelgan (un poco hacia adelante), con puño doblado
  for (const sx of [-1, 1]) { const ab = o.manga || 0, P = [[sx * .2, -.06, 0], [sx * (.25 + ab * .2), -.32, .03 + ab * .05], [sx * (.24 + ab * .45), -.6, .06 + ab * .1]]; L.add("lana", tubo(P, .075, .062, 10, 8)); L.add("forro", new THREE.CircleGeometry(.055, 10), TM(...P[2], Math.PI / 2, 0, 0)); L.add("lana", new THREE.TorusGeometry(.064, .014, 6, 12), TM(P[2][0], P[2][1] + .03, P[2][2], Math.PI / 2, 0, 0)) }
  // cuello y solapas, botones, bolsillos con tapita, el lazo de colgar
  L.add("lana", new THREE.TorusGeometry(.085, .03, 6, 16, Math.PI * 1.3), TM(0, -.015, -.01, Math.PI / 2 + .25, 0, -Math.PI * .15));
  for (const sx of [-1, 1]) L.add("lana", new THREE.BoxGeometry(.08, .3, .012), TM(sx * .055, -.16, .118, -.08, 0, sx * .28));
  for (let k = 0; k < 4; k++) L.add("boton", new THREE.CylinderGeometry(.016, .016, .01, 10), TM(.025, -.32 - k * .16, .128 + k * .006, Math.PI / 2));
  for (const sx of [-1, 1]) { L.add("lana", new THREE.BoxGeometry(.15, .045, .02), TM(sx * .14, -.66, .14, -.15, 0, 0)); L.add("forro", new THREE.BoxGeometry(.13, .01, .01), TM(sx * .14, -.69, .145)) }
  L.add("forro", new THREE.TorusGeometry(.025, .005, 4, 10), TM(0, .015, -.03));
  const G = new THREE.Group(); L.fin(G, M_ABRIGO[tipo] || M_ABRIGO.gris); G.scale.setScalar(s); G.userData.tipo = tipo; return G }
const abrigoNuevo = (tipo, o) => { const G = abrigoGeo(tipo, o); scene.add(G); return G };   // API: un abrigo suelto para el elenco o la escena (se mueve con G.position / G.rotation)
// ---------- las TIJERAS GRANDES del sastre (≈ 0,48 m): dos hojas de hierro pulido, ojos de bronce, el tornillo. tijerasGrandes(abre 0..1) → Group (origen en el tornillo, punta hacia +x)
const M_TIJERA = new THREE.MeshStandardMaterial({ color: "#b8bcc4", roughness: .18, metalness: 1, envMap: ENV_METAL_P, envMapIntensity: 1.6 });
function tijerasGrandes(abre = .15) { const G = new THREE.Group(), hoja = new THREE.Shape(); hoja.moveTo(0, -.012); hoja.lineTo(.3, -.004); hoja.lineTo(.31, .0); hoja.lineTo(0, .02); hoja.closePath();
  for (const s of [-1, 1]) { const P = new THREE.Group(), gh = new THREE.ExtrudeGeometry(hoja, { depth: .006, bevelEnabled: true, bevelThickness: .002, bevelSize: .002, bevelSegments: 1 }); P.add(new THREE.Mesh(gh, M_TIJERA));
    const brazo = new THREE.Mesh(new THREE.BoxGeometry(.11, .02, .008), M_TIJERA); brazo.position.set(-.055, -.006, .003); P.add(brazo); const ojo = new THREE.Mesh(new THREE.TorusGeometry(.032, .009, 8, 18), M_BRONCE); ojo.position.set(-.14, -.012, .003); ojo.scale.set(1.25, 1, 1); P.add(ojo);
    P.position.z = s * .004; P.rotation.z = s * abre * .25; P.scale.y = s; G.add(P) }
  const tor = new THREE.Mesh(new THREE.CylinderGeometry(.009, .009, .024, 10), M_BRONCE); tor.rotation.x = Math.PI / 2; G.add(tor); G.traverse(m => { if (m.isMesh) m.castShadow = true }); return G }
// ---------- PUERTAS que se abren (hojas sueltas con bisagra): PUERTAS_T[nombre] = { hojas: [{ piv, sg }], ang }
const PUERTAS_T = {};
const M_HOJA_P = { viga: M_VIGA, hierro: M_HIERRO, oscuro: M_OSCURO, maderaV: M_MADERA_V, madera: M_MADERA, picaporte: M_PICAPORTE, vidrioC: M_VIDRIO_C, laton: M_LATON }; M_PUERTA.forEach((m, i) => M_HOJA_P["col" + i] = m); M_MARCA_PUERTA.forEach((m, i) => M_HOJA_P["marca" + i] = m);
// M = matriz del borde de la bisagra (abajo), +x hacia donde se extiende la hoja, +z afuera. sg = signo del giro que abre
function hojaPuerta(nombre, M, dw, dh, col, k, o = {}) { const piv = new THREE.Group(), L = lote(); piv.matrixAutoUpdate = false; const base = M.clone(); scene.add(piv);
  if (o.ventana) { L.add(col, new THREE.BoxGeometry(dw, .07, .05), TM(dw / 2, .035, 0)); L.add(col, new THREE.BoxGeometry(dw, .07, .05), TM(dw / 2, dh - .035, 0)); for (const xx of [.035, dw - .035]) L.add(col, new THREE.BoxGeometry(.07, dh, .05), TM(xx, dh / 2, 0)); L.add(col, new THREE.BoxGeometry(dw - .1, .04, .04), TM(dw / 2, dh / 2, 0)); L.add("vidrioC", new THREE.PlaneGeometry(dw - .1, dh - .1), TM(dw / 2, dh / 2, 0)); L.add("hierro", new THREE.BoxGeometry(.012, .1, .03), TM(dw - .06, dh / 2, .04)) }
  else { hojaSinPicaporte(L, TM(dw / 2, 0, 0), dw, dh, col, k, o); if (o.picaporte) picaportePiezas((kk, g, m) => L.add(kk, g, m), TM(dw - .2, dh * .47, .03)) }
  const ms = L.fin(piv, M_HOJA_P); Object.entries(ms).forEach(([kk, m]) => { m.castShadow = !kk.startsWith("marca") && kk !== "oscuro" && kk !== "vidrioC" });
  const H = { piv, base, sg: o.sg ?? 1 }; (PUERTAS_T[nombre] ||= { hojas: [], ang: o.ang ?? 1.75 }).hojas.push(H); piv.matrix.copy(base); return H }
// puertaAbrir(nombre, u): u = 0 cerrada … 1 abierta del todo (≈ 100°). Nombres: "familia", "taller", "crane", "marga", "iglesia", "ventanaAtras" (la de la familia, dos hojas hacia afuera)
function puertaAbrir(nombre, u = 1) { const P = PUERTAS_T[nombre]; if (!P) return; P.hojas.forEach(H => { H.piv.matrix.copy(H.base).multiply(TM(0, 0, 0, 0, H.sg * cl(u) * P.ang, 0)); H.piv.matrixWorldNeedsUpdate = true }) }
const puertasCerrar = () => Object.keys(PUERTAS_T).forEach(n => puertaAbrir(n, 0));

// ================= LA CASA DE LA FAMILIA por dentro (coordenadas locales de CASA_FAM_B: x a lo largo, +z hacia la calle; piso a y = .27)
const FAM = CASA_FAM_B, FY = .27, FA = (...a) => FAM.at(...a);
// la puerta (hoja sin picaporte, rasguños; abre hacia adentro) y la ventana de atrás (dos hojas que abren hacia el callejón)
hojaPuerta("familia", FA(FAM.PUE[0] + .02, FAM.PUE[2], FAM.fz - FAM.t + .06), FAM.PUE[1] - FAM.PUE[0] - .04, FAM.PUE[3] - FAM.PUE[2] - .02, "col4", 1, { sg: 1 });
{ const [x0, x1, y0, y1] = FAM.VAT, zf = -FAM.fz + .1; hojaPuerta("ventanaAtras", FA(x0 + .02, y0 + .02, zf), (x1 - x0) / 2 - .03, y1 - y0 - .04, "col4", 0, { ventana: 1, sg: 1, ang: 1.9 });
  hojaPuerta("ventanaAtras", FA(x1 - .02, y0 + .02, zf, 0, Math.PI, 0), (x1 - x0) / 2 - .03, y1 - y0 - .04, "col4", 0, { ventana: 1, sg: -1, ang: 1.9 }) }
// el ROPERO (se arrastra: contra la puerta u = 0 … al costado u = 1), con marcas de arrastre en el piso
const T_ROPERO = tex(256, 512, (g, w, h) => { const r = rng(4960); g.fillStyle = "#4a3222"; g.fillRect(0, 0, w, h); for (let k = 0; k < 120; k++) { g.strokeStyle = r() < .5 ? "rgba(20,10,4,.3)" : "rgba(160,110,70,.12)"; g.lineWidth = 1 + r() * 2; const x = r() * w; g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 8, h * .3, x - 8, h * .6, x + 4, h); g.stroke() }
  g.strokeStyle = "#1a0e08"; g.lineWidth = 5; g.strokeRect(14, 14, w / 2 - 20, h - 90); g.strokeRect(w / 2 + 6, 14, w / 2 - 20, h - 90); g.strokeRect(14, h - 66, w - 28, 50); g.fillStyle = "rgba(255,220,170,.08)"; g.fillRect(24, 24, w / 2 - 40, h - 110); g.fillRect(w / 2 + 16, 24, w / 2 - 40, h - 110) });
const ROPERO_T = (() => { const G = new THREE.Group(), L = lote(), w = 1.36, h = 2.05, d = .6;
  L.add("frente", RB1(w, h, d, .02), TM(0, h / 2 + .08, 0)); L.add("madera", RB1(w + .12, .12, d + .1, .02), TM(0, h + .12, 0)); L.add("madera", RB1(w + .06, .1, d + .06, .02), TM(0, .1, 0));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) L.add("madera", new THREE.CylinderGeometry(.04, .05, .1, 8), TM(sx * (w / 2 - .08), .04, sz * (d / 2 - .08)));
  for (const sx of [-1, 1]) L.add("hierro", new THREE.BoxGeometry(.03, .14, .03), TM(sx * .06, 1.2, -d / 2 - .02));   // tiradores (adentro de la casa sí hay: son del ropero)
  L.fin(G, { frente: new THREE.MeshStandardMaterial({ map: T_ROPERO, bumpMap: T_ROPERO, bumpScale: 2, roughness: .75 }), madera: M_MADERA_N, hierro: M_HIERRO });
  G.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true } }); G.matrixAutoUpdate = false; scene.add(G);
  const A = [1.15, FAM.fz - FAM.t - .04 - .31], B = [2.45, A[1] - .05];
  return { G, A, B, w, d } })();
function roperoMover(u = 0) { const q = cl(u), x = lerp(ROPERO_T.A[0], ROPERO_T.B[0], q), z = lerp(ROPERO_T.A[1], ROPERO_T.B[1], q) - Math.sin(q * Math.PI) * .12; ROPERO_T.G.matrix.copy(FA(x, FY, z, 0, Math.PI + Math.sin(q * Math.PI) * .12, 0)); ROPERO_T.G.matrixWorldNeedsUpdate = true }
roperoMover(0);
// marcas de arrastre del ropero en el piso (calcomanía)
{ const t = tex(256, 128, (g, w, h) => { g.clearRect(0, 0, w, h); for (let k = 0; k < 14; k++) { g.strokeStyle = `rgba(${k % 2 ? "200,170,130" : "30,18,10"},${.3 + (k % 3) * .12})`; g.lineWidth = 1 + (k % 3); const y = 20 + (k % 7) * 3 + (k > 6 ? 70 : 0); g.beginPath(); g.moveTo(10, y); g.bezierCurveTo(90, y + 4, 170, y - 4, 246, y + 2); g.stroke() } });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, .8), new THREE.MeshStandardMaterial({ map: t, transparent: true, depthWrite: false, roughness: .8, polygonOffset: true, polygonOffsetFactor: -2 })); m.matrixAutoUpdate = false; m.matrix.copy(FA(1.8, FY + .005, ROPERO_T.A[1], -Math.PI / 2, 0, 0)); scene.add(m) }
// muebles (al lote PB): la mesa con su mantel, bancos, las camas (la de Tib con el acolchado de retazos), el hogar, el estante, la alfombra
const T_ACOLCHADO = tex(256, 256, (g, w, h) => { const r = rng(4970), C = ["#8a3a2a", "#3a5a7a", "#c8a050", "#5a7a4a", "#7a4a6a", "#d8c8a8", "#4a3a2a", "#a86a3a"]; for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) { g.fillStyle = C[r() * C.length | 0]; g.fillRect(x, y, 32, 32); for (let q = 0; q < 30; q++) { g.fillStyle = "rgba(0,0,0,.1)"; g.fillRect(x + r() * 32, y + r() * 32, 2, 2) } }
  g.strokeStyle = "#e8dcc0"; g.lineWidth = 2; g.setLineDash([4, 4]); for (let k = 0; k <= w; k += 32) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k, h); g.stroke(); g.beginPath(); g.moveTo(0, k); g.lineTo(w, k); g.stroke() } });
const T_ALFOMBRA = tex(256, 256, (g, w, h) => { const r = rng(4971); g.fillStyle = "#5a2a22"; g.fillRect(0, 0, w, h); g.strokeStyle = "#c8a060"; g.lineWidth = 6; g.strokeRect(16, 16, w - 32, h - 32); g.strokeStyle = "#2a3a4a"; g.lineWidth = 10; g.strokeRect(36, 36, w - 72, h - 72); for (let k = 0; k < 2400; k++) { g.fillStyle = r() < .5 ? "rgba(0,0,0,.15)" : "rgba(255,230,200,.06)"; g.fillRect(r() * w, r() * h, 2, 2) } });
Object.assign(PB_M, { acolchado: new THREE.MeshStandardMaterial({ map: T_ACOLCHADO, bumpMap: T_TRAMA_D, bumpScale: 2, roughness: 1 }), alfombra: new THREE.MeshStandardMaterial({ map: T_ALFOMBRA, bumpMap: T_TRAMA_D, bumpScale: 3, roughness: 1 }), brasa: new THREE.MeshStandardMaterial({ map: T_BRASA, emissive: "#ffffff", emissiveMap: T_BRASA, emissiveIntensity: 1.4, roughness: 1 }),
  loza: SM("#e8e2d4", { roughness: .3 }), pan: SM("#b8823e", { roughness: .9 }), sillar: M_SILLAR, sillarO: M_SILLAR_O, piz: M_PIZ[0], losas: M_LOSAS, tijera: M_TIJERA, picaporte: M_PICAPORTE, vidrio: M_VIDRIO, vidrioC: M_VIDRIO_C, ventana: M_VENTANA, lino: new THREE.MeshStandardMaterial({ color: "#cdbb98", bumpMap: T_TRAMA_D, bumpScale: 2, roughness: 1 }) });
M_TABLAS_H.forEach((m, i) => PB_M["tabla" + i] = m);
const mesaP = (L, M, w, d, h = .76) => { L.add("madera", RB1(w, .06, d, .01), M.clone().multiply(TM(0, h - .03, 0))); L.add("maderaN", new THREE.BoxGeometry(w - .14, .1, d - .14), M.clone().multiply(TM(0, h - .1, 0))); for (const sx of [-1, 1]) for (const sz of [-1, 1]) L.add("maderaN", new THREE.BoxGeometry(.07, h - .06, .07), M.clone().multiply(TM(sx * (w / 2 - .09), (h - .06) / 2, sz * (d / 2 - .09)))) };
const camaP = (L, M, w, l, mant = "acolchado") => { L.add("maderaN", new THREE.BoxGeometry(w + .06, .3, l + .06), M.clone().multiply(TM(0, .28, 0))); L.add("maderaN", new THREE.BoxGeometry(w + .1, .85, .07), M.clone().multiply(TM(0, .42, -l / 2 - .02))); L.add("maderaN", new THREE.BoxGeometry(w + .1, .5, .07), M.clone().multiply(TM(0, .25, l / 2 + .02)));
  L.add("tela", RB1(w, .14, l, .05), M.clone().multiply(TM(0, .5, 0))); L.add(mant, RB1(w + .08, .07, l * .72, .03), M.clone().multiply(TM(0, .58, l * .13, -.02, 0, 0))); L.add("tela", RB1(w * .7, .12, .34, .05), M.clone().multiply(TM(0, .62, -l / 2 + .24))) };
{ const L = PB, r = rng(4980);
  mesaP(L, FA(-.3, FY, .3), 1.7, .9); for (const s of [-1, 1]) { L.add("madera", RB1(1.5, .05, .3, .01), FA(-.3, FY + .45, .3 + s * .72)); for (const sx of [-1, 1]) L.add("maderaN", new THREE.BoxGeometry(.06, .43, .26), FA(-.3 + sx * .6, FY + .215, .3 + s * .72)) }
  L.add("mantel", new THREE.BoxGeometry(1.2, .01, .6), FA(-.3, FY + .765, .3));
  for (const [x, z] of [[-.75, .45], [-.1, .1], [.25, .45]]) { L.add("loza", new THREE.CylinderGeometry(.11, .07, .03, 14), FA(x, FY + .78, z)); L.add("loza", new THREE.CylinderGeometry(.04, .035, .08, 10), FA(x + .16, FY + .81, z - .1)) }
  L.add("pan", new THREE.SphereGeometry(.12, 10, 6), FA(-.45, FY + .8, .2, 0, 0, 0, 1.3, .6, 1)); L.add("terracota", new THREE.CylinderGeometry(.07, .1, .26, 10), FA(.4, FY + .9, .15));
  [[-.5, .3], [-.3, .38], [-.12, .26]].forEach(([x, z]) => VELAS_B.push({ p: W3(FAM.M, x, FY + .77, z), h: .12 + r() * .1, g: 3, gorda: 1 }));
  L.add("alfombra", new THREE.BoxGeometry(2.6, .015, 1.9), FA(-.3, FY + .01, .3));
  camaP(L, FA(-2.55, FY, -2.6), .85, 1.65); camaP(L, FA(-2.5, FY, -.7), .95, 1.95, "lino"); camaP(L, FA(2.2, FY, -2.55), 1.4, 1.9, "lino");
  L.add("madera", RB1(.4, .45, .4, .02), FA(-2.0, FY + .22, -3.35)); VELAS_B.push({ p: W3(FAM.M, -2.0, FY + .45, -3.35), h: .1, g: 3 });   // banquito junto a la cama de Tib, con su vela
  // el caballito de madera de Tib y un trapo
  L.add("madera", new THREE.BoxGeometry(.3, .12, .1), FA(-1.9, FY + .25, -2.4)); L.add("madera", new THREE.BoxGeometry(.08, .14, .08), FA(-1.77, FY + .35, -2.4)); for (const sx of [-1, 1]) L.add("maderaN", new THREE.BoxGeometry(.03, .2, .03), FA(-1.9 + sx * .1, FY + .1, -2.4));
  // el HOGAR en la pared derecha (+x): piedra, boca con brasas, repisa con velas, la olla colgada, hierbas secas
  { const hx = 3.2; L.add("muroT", uvMuro(new THREE.BoxGeometry(.7, 1.3, 1.7), 2.4), FA(hx - .35, FY + .65, .6)); L.add("oscuro", new THREE.PlaneGeometry(1.0, .75), FA(hx - .705, FY + .45, .6, 0, -Math.PI / 2, 0)); L.add("brasa", new THREE.BoxGeometry(.4, .08, .8), FA(hx - .4, FY + .1, .6));
    for (let k = 0; k < 5; k++) L.add("maderaN", new THREE.CylinderGeometry(.05, .05, .7, 6), FA(hx - .4 + (k % 2) * .08, FY + .18 + (k > 2 ? .07 : 0), .3 + k * .14, Math.PI / 2, 0, .3));
    L.add("madera", RB1(.4, .1, 1.9, .02), FA(hx - .35, FY + 1.35, .6)); L.add("muroT", uvMuro(new THREE.BoxGeometry(.5, 1.6, 1.2), 2.4), FA(hx - .25, FY + 2.15, .6));
    [.0, .45, 1.2].forEach(zz => VELAS_B.push({ p: W3(FAM.M, hx - .35, FY + 1.4, zz), h: .1 + r() * .12, g: 3 }));
    L.add("hierroN", new THREE.CylinderGeometry(.16, .12, .2, 12), FA(hx - .45, FY + .5, .6)); cuerda(L, W3(FAM.M, hx - .45, FY + 1.2, .6), W3(FAM.M, hx - .45, FY + .62, .6), .008);
    for (let k = 0; k < 6; k++) L.add("verde", new THREE.ConeGeometry(.05, .3, 5), FA(hx - .8, FY + 2.3, -.2 + k * .2, Math.PI, 0, 0)); L.add("madera", new THREE.BoxGeometry(.04, .04, 1.4), FA(hx - .8, FY + 2.48, .3));
    LUCES_PUNTOS.push([...W3(FAM.M, hx - 1.1, FY + .7, .6), 3.2, "#ff9a48", 8]) }
  // estante con frascos y platos en la pared de la izquierda, sobre las camas
  L.add("madera", RB1(.28, .05, 2.2, .01), FA(-3.05, FY + 1.9, -.9)); for (let k = 0; k < 9; k++) { const zz = -1.9 + k * .24; if (k % 3 === 0) L.add("loza", new THREE.CylinderGeometry(.1, .1, .02, 12), FA(-3.1, FY + 2.03, zz, 0, 0, Math.PI / 2 - .2)); else L.add(k % 2 ? "terracota" : "loza", new THREE.CylinderGeometry(.05, .06, .14 + (k % 3) * .04, 10), FA(-3.02, FY + 2.0, zz)) }
  VELAS_B.push({ p: W3(FAM.M, -3.02, FY + 1.93, .1), h: .14, g: 3 });
  // alféizares de adentro: velas y un frasco con flores secas
  VELAS_B.push({ p: W3(FAM.M, -2.2, 1.02, FAM.fz - FAM.t - .1), h: .16, g: 3 }, { p: W3(FAM.M, -1.8, 1.02, FAM.fz - FAM.t - .1), h: .09, g: 3 }, { p: W3(FAM.M, .3, 1.02, -FAM.fz + FAM.t + .12), h: .1, g: 3 });
  // un arcón a los pies de la cama de la madre, ropa colgada de un clavo, una escoba
  L.add("maderaN", RB1(1.1, .5, .5, .02), FA(2.2, FY + .25, -1.25)); L.add("hierro", new THREE.BoxGeometry(1.12, .04, .52), FA(2.2, FY + .4, -1.25));
  L.add("madera", new THREE.CylinderGeometry(.015, .015, 1.3, 5), FA(-3.1, FY + .65, 2.3, .1, 0, .08)); L.add("saco", new THREE.ConeGeometry(.12, .35, 8), FA(-3.06, FY + .16, 2.33));
  LUCES_PUNTOS.push([...W3(FAM.M, -.3, FY + 1.6, .3), 2.4, "#ffb468", 7]) }
// posiciones de la casa de la familia ([x, y, z] de mundo; y = piso)
const CASA_FAM_V = (() => { const W = (x, y, z) => W3(FAM.M, x, y, z), cx = (FAM.PUE[0] + FAM.PUE[1]) / 2;
  return { puertaAdentro: W(cx, FY, FAM.fz - 1.3), puertaAfuera: W(cx, 0, FAM.fz + 1.2), puerta: W(cx, FY, FAM.fz - FAM.t / 2), ropero: W(...[ROPERO_T.A[0], FY, ROPERO_T.A[1]]), roperoAparte: W(ROPERO_T.B[0], FY, ROPERO_T.B[1]),
    ventanaAtrasAdentro: W(0, FY, -FAM.fz + 1.0), ventanaAtrasAfuera: W(0, 0, -FAM.fz - 1.4), ventanaAtras: W(0, 1.55, -FAM.fz + FAM.t / 2), mesa: W(-.3, FY, .3), camaTib: W(-2.55, FY, -2.6), cama: W(-2.5, FY, -.7), camaMadre: W(2.2, FY, -2.55), hogar: W(2.5, FY, .6), ventanaFrente: W(-2, 1.55, FAM.fz), centro: W(0, FY, 0), ry: FAM.C.ry } })();
CASA_FAM_V.puertaAfuera[1] = SUELO(CASA_FAM_V.puertaAfuera[0], CASA_FAM_V.puertaAfuera[2]); CASA_FAM_V.ventanaAtrasAfuera[1] = SUELO(CASA_FAM_V.ventanaAtrasAfuera[0], CASA_FAM_V.ventanaAtrasAfuera[2]);

// ================= EL TALLER DEL SASTRE por dentro (coordenadas locales de TALLER_B; piso a y = .27)
const TB_ = TALLER_B, TA = (...a) => TB_.at(...a);
hojaPuerta("taller", TA(TB_.PUE[0] + .02, TB_.PUE[2], TB_.fz - TB_.t + .06), TB_.PUE[1] - TB_.PUE[0] - .04, TB_.PUE[3] - TB_.PUE[2] - .02, "col0", 2, { sg: 1 });
// carreteles (instanciados): madera + hilo de color
const CARRETELES = [];
const M_MANIQUI = new THREE.MeshStandardMaterial({ color: "#cdb994", bumpMap: T_TRAMA_D, bumpScale: 2, roughness: .95 });
const GEO_MANIQUI = (() => { const g = new THREE.LatheGeometry([[0, 0], [.13, 0], [.155, .08], [.14, .2], [.125, .3], [.15, .42], [.175, .52], [.17, .58], [.14, .64], [.07, .68], [.05, .7], [.05, .76], [.03, .78], [0, .79]].map(q => new THREE.Vector2(q[0], q[1])), 20); g.scale(1, 1, .7); g.computeVertexNormals(); return g })();
const PERCHERO_ABRIGOS = [];
{ const L = PB, r = rng(4990);
  // la mesa de corte (larga, gruesa, gastada) con el paño extendido, moldes de papel, tiza, cinta, alfileres, tijeras grandes
  const MX = .2, MZ_ = -.6, MH = .92; L.add("madera", RB1(3.6, .09, 1.3, .015), TA(MX, FY + MH - .045, MZ_)); L.add("maderaN", new THREE.BoxGeometry(3.4, .14, 1.1), TA(MX, FY + MH - .16, MZ_)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) L.add("maderaN", new THREE.BoxGeometry(.1, MH - .1, .1), TA(MX + sx * 1.62, FY + (MH - .1) / 2, MZ_ + sz * .5)); L.add("maderaN", new THREE.BoxGeometry(3.2, .06, .06), TA(MX, FY + .25, MZ_));
  L.add("lino", new THREE.BoxGeometry(2.2, .012, .95), TA(MX - .3, FY + MH + .006, MZ_ + .05, 0, .05, 0)); L.add("papel", new THREE.BoxGeometry(.7, .004, .5), TA(MX + .2, FY + MH + .015, MZ_ - .05, 0, -.3, 0)); L.add("papel", new THREE.BoxGeometry(.45, .004, .6), TA(MX - .9, FY + MH + .015, MZ_ + .1, 0, .4, 0));
  L.add("blanco", new THREE.BoxGeometry(.08, .02, .02), TA(MX + .9, FY + MH + .01, MZ_ + .3)); L.add("flor1", new THREE.BoxGeometry(1.4, .002, .02), TA(MX + .6, FY + MH + .013, MZ_ + .4, 0, .2, 0));
  L.add("tela", new THREE.SphereGeometry(.06, 10, 6), TA(MX + 1.3, FY + MH + .03, MZ_ - .3, 0, 0, 0, 1, .6, 1)); for (let k = 0; k < 9; k++) L.add("hierro", new THREE.CylinderGeometry(.002, .002, .06, 3), TA(MX + 1.3 + (r() - .5) * .08, FY + MH + .07, MZ_ - .3 + (r() - .5) * .08, (r() - .5) * .8, 0, (r() - .5) * .8));
  // rollos de tela apoyados en el rincón y en un estante (pared derecha)
  for (let k = 0; k < 7; k++) L.add(["tela", "lino", "cuero", "flor4", "verde", "acolchado", "maderaV"][k], new THREE.CylinderGeometry(.09, .09, 1.5, 12), TA(3.7 - (k % 4) * .2, FY + .72, -3.7 + (k > 3 ? .25 : 0) + (k % 2) * .05, .1 + (k % 3) * .05, 0, -.12));
  L.add("madera", RB1(.45, 2.4, 2.6, .01), TA(3.95, FY + 1.2, -1.8)); for (let s = 0; s < 4; s++) for (let k = 0; k < 6; k++) L.add(["tela", "lino", "verde", "cuero", "acolchado", "flor0", "flor2"][(s * 3 + k) % 7], RB1(.36, .14 + r() * .08, .36, .03), TA(3.85, FY + .35 + s * .55, -2.85 + k * .42));
  // estantería de carreteles (pared de atrás, a la derecha de la ventana): cinco estantes llenos
  L.add("madera", RB1(3.2, 2.2, .3, .01), TA(2.3, FY + 1.5, -3.98)); for (let s = 0; s < 6; s++) L.add("madera", RB1(3.2, .04, .34, .01), TA(2.3, FY + .45 + s * .4, -3.92));
  for (let s = 0; s < 5; s++) for (let k = 0; k < 18; k++) CARRETELES.push([TA(.85 + k * .17, FY + .47 + s * .4, -3.88 + (k % 2) * .06), r()]);
  for (let k = 0; k < 14; k++) CARRETELES.push([TA(MX - 1.5 + r() * .9, FY + MH, MZ_ - .45 + r() * .2, 0, r() * 6, 0), r()]);
  // la LÁMPARA colgada sobre la mesa (de aceite: tanque de bronce, tubo de vidrio con la llama, pantalla de chapa)
  { const lx = MX, lz = MZ_, ly = FY + 2.15; cuerda(L, W3(TB_.M, lx, TB_.H - .2, lz), W3(TB_.M, lx, ly + .55, lz), .012); L.add("hierroN", new THREE.ConeGeometry(.42, .2, 18, 1, true), TA(lx, ly + .42, lz)); L.add("bronce", new THREE.SphereGeometry(.1, 12, 8), TA(lx, ly + .12, lz, 0, 0, 0, 1, .7, 1)); L.add("vidrioC", new THREE.CylinderGeometry(.05, .06, .24, 12, 1, true), TA(lx, ly + .3, lz));
    VELAS_B.push({ p: W3(TB_.M, lx, ly + .2, lz), g: 4 }); LUCES_PUNTOS.push([...W3(TB_.M, lx, ly + .1, lz), 4.6, "#ffc070", 10]) }
  VELAS_B.push({ p: W3(TB_.M, MX + 1.55, FY + MH, MZ_ + .45), h: .16, g: 3, gorda: 1 }, { p: W3(TB_.M, MX - 1.6, FY + MH, MZ_ - .45), h: .1, g: 3 });
  // silla y banquito, canasto de retazos, retazos en el piso
  L.add("madera", RB1(.42, .05, .42, .01), TA(MX + .3, FY + .46, MZ_ + 1.0)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) L.add("maderaN", new THREE.BoxGeometry(.04, .46, .04), TA(MX + .3 + sx * .18, FY + .23, MZ_ + 1.0 + sz * .18)); L.add("madera", RB1(.42, .5, .04, .01), TA(MX + .3, FY + .74, MZ_ + 1.2));
  L.add("cesta", new THREE.CylinderGeometry(.28, .22, .35, 14, 1, true), TA(-2.6, FY + .17, -2.2)); for (let k = 0; k < 6; k++) L.add(["flor0", "flor3", "tela", "verde", "cuero", "acolchado"][k], new THREE.SphereGeometry(.09, 6, 4), TA(-2.6 + (r() - .5) * .25, FY + .33, -2.2 + (r() - .5) * .25, 0, 0, 0, 1, .5, 1));
  for (let k = 0; k < 16; k++) L.add(["flor0", "flor3", "tela", "verde", "cuero", "lino"][k % 6], new THREE.BoxGeometry(.06 + r() * .14, .004, .04 + r() * .1), TA(MX + (r() - .5) * 3.2, FY + .004, MZ_ + (r() - .5) * 2, 0, r() * 3, 0));
  // espejo alto (pared derecha, adelante), perchas de alambre en un clavo, sombreros en la pared de la puerta
  L.add("maderaN", RB1(.08, 1.9, .8, .01), TA(4.12, FY + 1.15, 2.9)); L.add("vidrio", new THREE.PlaneGeometry(.66, 1.72), TA(4.07, FY + 1.15, 2.9, 0, -Math.PI / 2, 0));
  for (let k = 0; k < 4; k++) { const hx = 3.0 + k * .12; L.add("hierro", new THREE.TorusGeometry(.18, .006, 4, 3), TA(hx, FY + 2.45, 4.05, 0, 0, Math.PI / 2 + Math.PI / 6)) }
  for (let k = 0; k < 3; k++) { L.add("hierro", new THREE.CylinderGeometry(.01, .01, .1, 4), TA(2.4 + k * .4, FY + 1.95, 4.08, Math.PI / 2, 0, 0)); L.add(k === 1 ? "cuero" : "maderaN", new THREE.CylinderGeometry(.11, .14, .12, 12), TA(2.4 + k * .4, FY + 1.97, 4.0)); L.add(k === 1 ? "cuero" : "maderaN", new THREE.CylinderGeometry(.2, .2, .015, 14), TA(2.4 + k * .4, FY + 1.91, 4.0)) }
  // EL PERCHERO: barra de hierro a lo largo de la pared izquierda, con siete abrigos colgados (abrigos de verdad, ver abrigoGeo)
  { const px = -3.8, pz0 = -3.4, pz1 = 1.6, ph = FY + 2.0; for (const zz of [pz0 - .05, pz1 + .05]) { L.add("hierroN", new THREE.CylinderGeometry(.025, .025, ph - FY, 6), TA(px, FY + (ph - FY) / 2, zz)); L.add("hierroN", new THREE.CylinderGeometry(.12, .14, .04, 10), TA(px, FY + .02, zz)) }
    L.add("hierroN", new THREE.CylinderGeometry(.018, .018, pz1 - pz0 + .1, 6), TA(px, ph, (pz0 + pz1) / 2, Math.PI / 2, 0, 0));
    ["gris", "azul", "verde", "marron", "ocre", "vino", "gris"].forEach((t, k) => { const G = abrigoGeo(t, { seed: k }), M = TA(px + .02, ph - .02, pz0 + .25 + k * .72, 0, Math.PI / 2 + (r() - .5) * .25, 0); G.applyMatrix4(M); scene.add(G); G.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true } }); PERCHERO_ABRIGOS.push(G);
      L.add("hierro", new THREE.TorusGeometry(.05, .005, 4, 10, Math.PI), TA(px, ph + .02, pz0 + .25 + k * .72, 0, Math.PI / 2, 0)) }) }
  // los MANIQUÍES junto a la vidriera (miran a la calle); uno con un abrigo a medio hacer (hilvanes blancos)
  [[-3.2, 3.1, .1], [-2.1, 3.35, -.15], [-1.05, 3.05, .2]].forEach(([x, z, a], i) => { L.add("maderaN", new THREE.CylinderGeometry(.02, .02, .95, 6), TA(x, FY + .47, z)); for (let k = 0; k < 3; k++) L.add("maderaN", new THREE.BoxGeometry(.03, .03, .36), TA(x, FY + .03, z, 0, k * 2.09 + a, 0).multiply(TM(0, 0, .16)));
    const M = TA(x, FY + .92, z, 0, a, 0); L.add("lino", GEO_MANIQUI, M); L.add("maderaN", new THREE.SphereGeometry(.04, 8, 6), M.clone().multiply(TM(0, .8, 0)));
    if (i === 1) { const G = abrigoGeo("rojo", { s: .82, seed: 3 }); G.applyMatrix4(M.clone().multiply(TM(0, .74, 0))); scene.add(G); G.traverse(m => { if (m.isMesh) m.castShadow = true }) }
    if (i === 2) for (let k = 0; k < 6; k++) L.add("blanco", new THREE.BoxGeometry(.004, .05, .004), M.clone().multiply(TM(-.1 + k * .04, .45, .13))) });
  // las tijeras grandes, sobre el paño
  { const G = tijerasGrandes(.25); G.applyMatrix4(TA(MX - .5, FY + MH + .02, MZ_ + .15, -Math.PI / 2, .7, 0)); scene.add(G) }
  // ventanita de atrás: una vela
  VELAS_B.push({ p: W3(TB_.M, -.6, 1.32 + .01, -TB_.fz + TB_.t + .12), h: .12, g: 3 }) }
{ const N = CARRETELES.length, gm = mergeG([[new THREE.CylinderGeometry(.032, .032, .012, 12), TM(0, .006, 0)], [new THREE.CylinderGeometry(.032, .032, .012, 12), TM(0, .084, 0)], [new THREE.CylinderGeometry(.011, .011, .09, 8), TM(0, .045, 0)]]), gh = new THREE.CylinderGeometry(.025, .025, .066, 12); gh.translate(0, .045, 0);
  const a = new THREE.InstancedMesh(gm, M_MADERA_V, N), b = new THREE.InstancedMesh(gh, new THREE.MeshStandardMaterial({ roughness: .7, bumpMap: T_TRAMA_D, bumpScale: 1 }), N), cc = new THREE.Color(), COLS = ["#8a1e1e", "#e8dcc0", "#1c1c20", "#2c3a52", "#c8a040", "#3a4a32", "#7a5a8a", "#d86a3a", "#5a5852", "#f0f0e8", "#4a1a26", "#9a7a3a"];
  CARRETELES.forEach(([M, q], i) => { a.setMatrixAt(i, M); b.setMatrixAt(i, M); b.setColorAt(i, cc.set(COLS[(q * COLS.length) | 0])) }); [a, b].forEach(m => { m.castShadow = true; m.receiveShadow = true; scene.add(m) }) }
const TALLER_V = (() => { const W = (x, y, z) => W3(TB_.M, x, y, z), cx = (TB_.PUE[0] + TB_.PUE[1]) / 2;
  return { puertaAdentro: W(cx, FY, TB_.fz - 1.3), puertaAfuera: W(cx, 0, TB_.fz + 1.3), mesa: W(.2, FY, -.6), mesaArriba: W(.2, FY + .92, -.6), perchero: W(-3.8, FY, -.9), lampara: W(.2, FY + 2.3, -.6), maniquies: [W(-3.2, FY, 3.1), W(-2.1, FY, 3.35), W(-1.05, FY, 3.05)],
    tijeras: W(-.3, FY + .94, -.45), vidriera: W(-2.15, 1.7, TB_.fz), centro: W(0, FY, 0), ry: TB_.C.ry } })();
TALLER_V.puertaAfuera[1] = SUELO(TALLER_V.puertaAfuera[0], TALLER_V.puertaAfuera[2]);
// el cartel colgante del taller: soporte de hierro forjado y una tabla con unas tijeras y un carretel pintados (sin letras)
const T_CARTEL_SASTRE = tex(256, 192, (g, w, h) => { const rr = rng(4999); g.fillStyle = "#2a3a2e"; g.fillRect(0, 0, w, h); g.strokeStyle = "#c8a050"; g.lineWidth = 6; g.strokeRect(8, 8, w - 16, h - 16); g.save(); g.translate(w * .42, h / 2); g.rotate(-.5); g.strokeStyle = "#e8e0d0"; g.lineWidth = 9; g.lineCap = "round"; g.beginPath(); g.moveTo(-60, -14); g.lineTo(55, 8); g.moveTo(-60, 14); g.lineTo(55, -8); g.stroke(); g.lineWidth = 6; g.beginPath(); g.arc(-74, -18, 14, 0, 7); g.stroke(); g.beginPath(); g.arc(-74, 18, 14, 0, 7); g.stroke(); g.restore();
  g.fillStyle = "#8a1e1e"; g.fillRect(w * .72, h * .3, 30, 70); g.fillStyle = "#c8a050"; g.fillRect(w * .72 - 6, h * .3 - 6, 42, 10); g.fillRect(w * .72 - 6, h * .3 + 66, 42, 10); for (let k = 0; k < 200; k++) { g.fillStyle = "rgba(0,0,0,.2)"; g.fillRect(rr() * w, rr() * h, 3, 3) } });
{ const L = PB, M = TA(TB_.PUE[1] + .6, 3.0, TB_.fz); L.add("hierroN", new THREE.BoxGeometry(.04, .04, 1.1), M.clone().multiply(TM(0, .3, .55))); L.add("hierroN", tubo([[0, -.2, 0], [0, .1, .4], [0, .3, .9]], .015, .015, 5, 6), M);
  PB_M.cartelSastre = new THREE.MeshStandardMaterial({ map: T_CARTEL_SASTRE, roughness: .8 }); L.add("cartelSastre", RB1(.66, .5, .04, .01), M.clone().multiply(TM(0, -.05, .7, 0, Math.PI / 2, 0)));
  for (const s of [-1, 1]) cuerda(L, W3(M, 0, .28, .7 + s * .28), W3(M, 0, .2, .7 + s * .28), .008) }

// ================= LA PUERTA DE CRANE (la única con picaporte de bronce) y el GANCHO con su abrigo negro
const CR = CASA_CRANE_B, CRA = (...a) => CR.at(...a), CRP = CR.C;
hojaPuerta("crane", CRA(-CRP.dw / 2 + .02, 0, CR.fz + .01), CRP.dw - .04, CRP.dh - .03, "col2", 0, { picaporte: 1, sg: 1 });
const GANCHO_CRANE = { M: CRA(CRP.dw / 2 + .62, 1.86, CR.fz + .02) };
{ const L = PB, M = GANCHO_CRANE.M; L.add("hierroN", RB1(.1, .2, .02, .005), M); L.add("hierroN", tubo([[0, 0, 0], [0, .0, .12], [0, -.06, .16], [0, -.02, .2]], .012, .01, 6, 8), M.clone().multiply(TM(0, -.02, 0)));
  for (const s of [-1, 1]) L.add("bronce", new THREE.SphereGeometry(.012, 6, 4), M.clone().multiply(TM(0, s * .07, .015))) }
const ABRIGO_CRANE = (() => { const G = abrigoGeo("negro"); G.matrixAutoUpdate = false; G.matrix.copy(GANCHO_CRANE.M.clone().multiply(TM(0, -.04, .16, 0, 0, 0, 1, 1, 1))); scene.add(G); G.traverse(m => { if (m.isMesh) m.castShadow = true }); return G })();
// abrigoEnGancho(on): el abrigo negro de Crane colgado de su gancho (true) o no (false: el narrador se lo llevó)
const abrigoEnGancho = (on = true) => { ABRIGO_CRANE.visible = !!on };
// la casa rica: verja de hierro con puntas de lanza, dos faroles a los lados de la escalinata, chapa con el número, macetones
{ const L = PB, z = CASA_CRANE.z + CASA_CRANE.d / 2 + 3.4, x0 = CASA_CRANE.x - CASA_CRANE.w / 2 - .2, x1 = CASA_CRANE.x + CASA_CRANE.w / 2 + .2, y = SUELO(CASA_CRANE.x, z);
  for (let x = x0; x <= x1; x += .14) { if (Math.abs(x - CASA_CRANE.x) < 1.0) continue; L.add("hierroN", new THREE.CylinderGeometry(.013, .013, 1.25, 5), TM(x, y + .62, z)); L.add("hierroN", new THREE.ConeGeometry(.03, .1, 4), TM(x, y + 1.29, z)) }
  for (const yy of [.15, 1.05]) for (const s of [-1, 1]) L.add("hierroN", new THREE.BoxGeometry((x1 - x0) / 2 - 1, .03, .03), TM(CASA_CRANE.x + s * ((x1 - x0) / 4 + .5), y + yy, z));
  for (const x of [x0, x1, CASA_CRANE.x - 1.05, CASA_CRANE.x + 1.05]) { L.add("sillarC", RB1(.36, 1.5, .36, .02), TM(x, y + .75, z)); L.add("sillarC", RB1(.46, .12, .46, .02), TM(x, y + 1.56, z)); L.add("bronce", new THREE.SphereGeometry(.12, 10, 8), TM(x, y + 1.72, z)) }
  for (const s of [-1, 1]) { const p = W3(CR.M, s * 1.45, 0, CR.fz + .4); farolB(p[0], p[2], 2.6) }
  L.add("laton", RB1(.3, .2, .02, .005), CRA(-CRP.dw / 2 - .45, 1.65, CR.fz + .02)) }
const CRANE_V = (() => { const W = (x, y, z) => W3(CR.M, x, y, z);
  return { puerta: W(0, .51, CR.fz), puertaAfuera: [CASA_CRANE.x, SUELO(CASA_CRANE.x, CASA_CRANE.z + CASA_CRANE.d / 2 + 1.8), CASA_CRANE.z + CASA_CRANE.d / 2 + 1.8], puertaAdentro: W(0, .2, CR.fz - 1.2),
    picaporte: W(CRP.dw / 2 - .2, CRP.dh * .47, CR.fz + .12), gancho: W(CRP.dw / 2 + .62, 1.86, CR.fz + .2), verja: [CASA_CRANE.x, SUELO(CASA_CRANE.x, CASA_CRANE.z + CASA_CRANE.d / 2 + 3.4), CASA_CRANE.z + CASA_CRANE.d / 2 + 3.4], ry: 0 } })();
LUCES_PUNTOS.push([CRANE_V.picaporte[0], CRANE_V.picaporte[1] + .4, CRANE_V.picaporte[2] + .9, 1.6, "#ffcf80", 4]);

// ================= LA CASA DE MARGA: la puerta (se abre), y en la ventana del frente los HILOS y los OVILLOS (madejas colgadas, hilos tendidos
// de un clavo a otro, ovillos en el alféizar y en una canasta, agujas de tejer)
const MG = CASA_MARGA_B, MGA = (...a) => MG.at(...a), MGP = MG.C;
hojaPuerta("marga", MGA(MGP.px - MGP.dw / 2 + .02, 0, MG.fz + .01), MGP.dw - .04, MGP.dh - .03, "col4", 4, { sg: 1 });
const T_OVILLO = tex(128, 128, (g, w, h) => { g.fillStyle = "#808080"; g.fillRect(0, 0, w, h); for (let k = 0; k < 90; k++) { g.strokeStyle = k % 2 ? "rgba(0,0,0,.35)" : "rgba(255,255,255,.3)"; g.lineWidth = 2; const a = k * .7; g.beginPath(); g.moveTo(0, (k * 9) % h); g.bezierCurveTo(w * .3, (k * 9 + 30 * Math.sin(a)) % h, w * .6, (k * 9 - 20) % h, w, (k * 9 + 10) % h); g.stroke() } });
PB_M.ovillo = new THREE.MeshStandardMaterial({ color: "#ffffff", map: T_OVILLO, bumpMap: T_OVILLO, bumpScale: 3, roughness: 1 });
const OVILLOS = [];
{ const L = PB, r = rng(5010), [vx, vy, va, vh] = MG.V, fz = MG.fz, COLS = ["#8a1e1e", "#c8a040", "#e8dcc0", "#3a5a7a", "#5a7a4a", "#7a4a6a", "#d86a3a", "#4a3a2a"];
  for (let k = 0; k < 6; k++) OVILLOS.push([MGA(vx - va / 2 + .12 + k * (va - .2) / 5, vy - .02 + .07, fz + .22 + (k % 2) * .1), .06 + r() * .03, COLS[k % COLS.length]]);
  L.add("cesta", new THREE.CylinderGeometry(.18, .14, .16, 12, 1, true), MGA(vx + .45, vy - .02 + .08, fz + .3)); for (let k = 0; k < 4; k++) OVILLOS.push([MGA(vx + .4 + (k % 2) * .1, vy + .14 + (k > 1 ? .05 : 0), fz + .26 + (k % 2 ? .06 : -.02)), .055, COLS[(k + 3) % COLS.length]]);
  for (const s of [-1, 1]) L.add("maderaN", new THREE.CylinderGeometry(.006, .006, .45, 4), MGA(vx + .48 + s * .03, vy + .25, fz + .3, 0, 0, s * .3));
  // la varilla arriba de la ventana con madejas colgando, y hilos tendidos cruzando la ventana (con ovillos colgados de la punta)
  L.add("maderaN", new THREE.CylinderGeometry(.012, .012, va + .6, 6), MGA(vx, vy + vh + .32, fz + .2, 0, 0, Math.PI / 2)); for (const s of [-1, 1]) L.add("hierro", new THREE.BoxGeometry(.02, .02, .22), MGA(vx + s * (va / 2 + .2), vy + vh + .32, fz + .1));
  for (let k = 0; k < 7; k++) { const xx = vx - va / 2 - .15 + k * (va + .3) / 6, col = "flor" + (k % 5); for (let q = 0; q < 6; q++) L.add(["ovilloR", "ovilloA", "ovilloB", "ovilloV", "ovilloM"][k % 5], new THREE.CylinderGeometry(.004, .004, .42 + (q % 3) * .05, 3), MGA(xx + (q - 2.5) * .008, vy + vh + .32 - .22, fz + .2, 0, 0, (q - 2.5) * .02)) }
  for (let k = 0; k < 4; k++) { const y = vy + .2 + k * .24, A = W3(MG.M, vx - va / 2 - .05, y, fz + .16), B = W3(MG.M, vx + va / 2 + .05, y + (r() - .5) * .1, fz + .16), mid = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2 - .06, (A[2] + B[2]) / 2]; cuerda(L, A, mid, .004); cuerda(L, mid, B, .004); OVILLOS.push([TM(mid[0], mid[1] - .1, mid[2]), .045, COLS[(k + 5) % COLS.length]]); cuerda(L, mid, [mid[0], mid[1] - .06, mid[2]], .003) }
  VELAS_B.push({ p: W3(MG.M, vx - .1, vy - .01, fz + .14), h: .1, g: 0 });
  // un banquito y una mecedora vieja junto a la puerta
  L.add("madera", RB1(.5, .05, .4, .01), MGA(MGP.px + 1.2, .45, MG.fz + .5)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) L.add("maderaN", new THREE.BoxGeometry(.04, .45, .04), MGA(MGP.px + 1.2 + sx * .2, .22, MG.fz + .5 + sz * .15)) }
["ovilloR", "ovilloA", "ovilloB", "ovilloV", "ovilloM"].forEach((k, i) => PB_M[k] = SM(["#8a1e1e", "#c8a040", "#e8dcc0", "#3a5a7a", "#7a4a6a"][i], { roughness: 1 }));
{ const m = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 14, 10), PB_M.ovillo, OVILLOS.length), cc = new THREE.Color(); OVILLOS.forEach(([M, s, c], i) => { m.setMatrixAt(i, M.clone().multiply(TM(0, 0, 0, i, i * 2, 0, s, s, s))); m.setColorAt(i, cc.set(c)) }); m.castShadow = true; scene.add(m) }
const MARGA_V = (() => { const W = (x, y, z) => W3(MG.M, x, y, z); return { puerta: W(MGP.px, 0, MG.fz), puertaAfuera: W(MGP.px, 0, MG.fz + 1.3), ventana: W(MG.V[0], MG.V[1] + MG.V[3] / 2, MG.fz), ventanaAfuera: W(MG.V[0], 0, MG.fz + 1.6), ry: MG.C.ry } })();
MARGA_V.puertaAfuera[1] = SUELO(MARGA_V.puertaAfuera[0], MARGA_V.puertaAfuera[2]); MARGA_V.ventanaAfuera[1] = SUELO(MARGA_V.ventanaAfuera[0], MARGA_V.ventanaAfuera[2]);


// ================= LA CALLE, LA PLAZA, LA IGLESIA, EL CEMENTERIO, LA COLINA Y LO DE AFUERA =================
// ---------- faroles: a lo largo de la calle principal (alternados, junto al cordón), en la plaza y en la calle transversal
{ const nombradas = [CASA_FAM_V.puertaAfuera, TALLER_V.puertaAfuera, MARGA_V.puertaAfuera];
  for (const s of [-1, 1]) for (let z = CALLE_T.z0 + 4 + (s > 0 ? 6 : 0); z < CALLE_T.z1 - 2; z += 12) { if (Math.abs(z - CRUCE_T.z) < CRUCE_T.an / 2 + 1) continue; const x = s * (CALLE_T.an / 2 + .5); if (nombradas.some(p => Math.hypot(p[0] - x, p[2] - z) < 2.2)) continue; farolB(x, z, 3.6) }
  for (const [x, z] of [[-19, -42.5], [19, -42.5], [-19, -69.5], [19, -69.5], [-19, -56], [19, -56], [-8, -69.5], [8, -69.5]]) farolB(x, z, 3.8);
  for (const x of [-30, -42, 22, 34, 46, 58]) farolB(x, CRUCE_T.z - CRUCE_T.an / 2 - .4, 3.4);
  FAROLES.filter((_, i) => i % 2 === 0).forEach(p => LUCES_PUNTOS.push([p[0], p[1] - .2, p[2], 4.0, "#ffae58", 13])) }
// ---------- CHARCOS: agua negra que refleja la luna y las ventanas (en el empedrado, la plaza, las veredas y el barro de los callejones)
const M_CHARCO = new THREE.MeshStandardMaterial({ color: "#0e131c", roughness: .04, metalness: .9, envMap: ENV_NOCHE_P, envMapIntensity: 1.7, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -8 });
const CHARCOS = (() => { const r = rng(5200), L = [], pos = [];
  const blob = (x, z, s, dy) => { const n = 16, P = []; for (let k = 0; k < n; k++) { const a = k / n * 6.283, d = s * (.6 + .5 * ruido2(x + Math.cos(a) * 1.3, z + Math.sin(a) * 1.3) + .15 * Math.sin(a * 3 + x)); P.push(new THREE.Vector2(Math.cos(a) * d * 1.5, Math.sin(a) * d)) }
    const g = new THREE.ShapeGeometry(new THREE.Shape(P), 2); g.rotateX(-Math.PI / 2); const ry = r() * 6.283; g.rotateY(ry); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const X = p.getX(i) + x, Z = p.getZ(i) + z; p.setXYZ(i, X, SUELO(X, Z) + dy, Z) } g.computeVertexNormals(); L.push([g, new THREE.Matrix4()]); pos.push([x, z, s]) };
  for (let k = 0; k < 34; k++) blob((r() - .5) * (CALLE_T.an - 1.5), lerp(CALLE_T.z0 + 2, CALLE_T.z1 - 3, r()), .5 + r() * 1.3, .05);
  for (let k = 0; k < 14; k++) blob(PLAZA_T.x + (r() - .5) * (PLAZA_T.w - 3), PLAZA_T.z + (r() - .5) * (PLAZA_T.d - 3), .6 + r() * 1.4, .05);
  for (let k = 0; k < 8; k++) blob(lerp(CALLE_T.fachada + 2, CRUCE_T.x1 - 4, r()) * (r() < .3 ? -.6 : 1), CRUCE_T.z + (r() - .5) * 4, .5 + r(), .05);
  for (let k = 0; k < 10; k++) { const C = CALLEJONES_T[k % 2]; blob((C.x0 + C.x1) / 2 + (r() - .5), lerp(C.z0 + 2, C.z1 - 2, r()), .5 + r() * .8, .03) }
  for (let k = 0; k < 8; k++) blob((r() < .5 ? -1 : 1) * (CALLE_T.an / 2 + .5 + r() * .8), lerp(CALLE_T.z0 + 2, CALLE_T.z1 - 3, r()), .3 + r() * .4, .115);
  const m = new THREE.Mesh(mergeG(L), M_CHARCO); m.receiveShadow = true; m.renderOrder = -.1; scene.add(m); return pos })();
// ---------- cosas contra las fachadas de la calle (barriles, cajones, leña, bolsas, baldes, bancos, escobas, escaleras), sin tapar puertas
{ const r = rng(5210); CASAS_P.forEach(C => { if (!["oeste", "este", "plazaO", "plazaE", "oesteAtras", "esteAtras"].includes(C.fila) || r() < .3) return; const F = C.HM, n = 1 + (r() * 3 | 0);
    for (let k = 0; k < n; k++) { const lx = (r() - .5) * (C.w - 1), lz = C.d / 2 + .38 + r() * .2; if (Math.abs(lx - C.px) < (C.dw || 1) / 2 + .45) continue; const M = F.clone().multiply(TM(lx, 0, lz, 0, (r() - .5) * .5, 0)), q = r(), y0 = C.y0 + .06;
      const Mw = M.clone(); Mw.elements[13] = SUELO(Mw.elements[12], Mw.elements[14]) + (C.fila.endsWith("Atras") ? 0 : .1);
      if (q < .25) { barril(PB, Mw); if (r() < .4) barril(PB, Mw.clone().multiply(TM(.68, 0, 0))) } else if (q < .42) { cajon(PB, Mw); if (r() < .6) cajon(PB, Mw.clone().multiply(TM(0, .44, 0, 0, .3, 0)), .9) } else if (q < .56) lena(PB, Mw.clone().multiply(TM(0, 0, -.05)), r, 1.2 + r() * .8)
      else if (q < .66) saco(PB, Mw); else if (q < .74) balde(PB, Mw); else if (q < .84) banco(PB, Mw.clone().multiply(TM(0, 0, .05)));
      else if (q < .92) { PB.add("maderaV", new THREE.CylinderGeometry(.018, .018, 1.4, 5), Mw.clone().multiply(TM(0, .7, -.12, -.15, 0, 0))); PB.add("saco", new THREE.ConeGeometry(.13, .32, 8), Mw.clone().multiply(TM(0, .14, -.02))) }
      else { for (const s of [-1, 1]) PB.add("maderaV", new THREE.BoxGeometry(.06, 3.2, .06), Mw.clone().multiply(TM(s * .22, 1.55, -.35, -.22, 0, 0))); for (let q2 = 0; q2 < 9; q2++) PB.add("maderaV", new THREE.BoxGeometry(.44, .04, .05), Mw.clone().multiply(TM(0, .25 + q2 * .33, -.36 + q2 * .074, -.22, 0, 0))) } } }) }
// ---------- RASGUÑOS EN LAS FACHADAS (las perchas de la Tejedora raspan las paredes al pasar, a 5–12 m de alto): surcos largos paralelos
const T_RASGUNO = tex(1024, 256, (g, w, h) => { const r = rng(5220); g.clearRect(0, 0, w, h); const n = 4;
  for (let q = 0; q < n; q++) { const y0 = 50 + q * 42 + (r() - .5) * 10, amp = 10 + r() * 10; const P = x => y0 + Math.sin(x * .006 + q) * amp + x * .03;
    g.lineCap = "round"; g.strokeStyle = "rgba(12,8,5,.85)"; g.lineWidth = 15; g.beginPath(); for (let x = 30; x < w - 30; x += 10) x > 30 ? g.lineTo(x, P(x)) : g.moveTo(x, P(x)); g.stroke();
    g.strokeStyle = "rgba(200,180,150,.85)"; g.lineWidth = 5; g.beginPath(); for (let x = 40; x < w - 40; x += 10) x > 40 ? g.lineTo(x, P(x) - 2) : g.moveTo(x, P(x) - 2); g.stroke();
    for (let k = 0; k < 40; k++) { const x = 40 + r() * (w - 80), y = P(x); g.fillStyle = "rgba(190,170,140,.6)"; g.fillRect(x, y + 6 + r() * 14, 2 + r() * 4, 2 + r() * 3) } } });
const M_RASGUNO = new THREE.MeshStandardMaterial({ map: T_RASGUNO, transparent: true, depthWrite: false, roughness: .9, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
{ const r = rng(5230), L = []; CASAS_P.filter(C => C.fila === "oeste" || C.fila === "este" || C.fila === "plazaO" || C.fila === "plazaE").forEach(C => { if (r() < .55 || C.h < 5) return; const an = Math.min(C.w - .3, 2.5 + r() * 3), al = an * .25, y = 4.6 + r() * Math.max(0, C.h - 5.4);
    L.push([new THREE.PlaneGeometry(an, al), C.HM.clone().multiply(TM((r() - .5) * (C.w - an), Math.min(y, C.h - al / 2), C.d / 2 + .03, 0, 0, (r() - .5) * .25))]) });
  const m = new THREE.Mesh(mergeG(L), M_RASGUNO); m.renderOrder = 2; scene.add(m) }
// ---------- LA PLAZA: el pozo con su techito, el árbol seco grande, bancos, el abrevadero, un carro
const ARBOL_SECO_G = (seed, H = 7, ramas = 5) => { const r = rng(seed), T = [];
  const rama = (p, dir, L, r0, nivel) => { const q = [p[0] + dir[0] * L, p[1] + dir[1] * L, p[2] + dir[2] * L], m = [p[0] + dir[0] * L * .5 + (r() - .5) * L * .15, p[1] + dir[1] * L * .5, p[2] + dir[2] * L * .5 + (r() - .5) * L * .15]; T.push([tubo([p, m, q], r0, r0 * .55, 6, 5), TM()]);
    if (nivel < 3) for (let k = 0; k < (nivel ? 3 : ramas); k++) { const a = r() * 6.283, up = .35 + r() * .55, d = [dir[0] * .4 + Math.cos(a) * (1 - up), dir[1] * .4 + up, dir[2] * .4 + Math.sin(a) * (1 - up)], l = Math.hypot(...d); rama(lerp(0, 1, .6 + r() * .4) ? [lerp(p[0], q[0], .55 + r() * .45), lerp(p[1], q[1], .55 + r() * .45), lerp(p[2], q[2], .55 + r() * .45)] : q, d.map(v => v / l), L * (.5 + r() * .25), r0 * .5, nivel + 1) } };
  rama([0, -.3, 0], [0, 1, 0], H * .45, H * .045, 0); return mergeG(T) };
const GEO_ARBOL_SECO = [0, 1, 2].map(k => ARBOL_SECO_G(5240 + k, 6 + k * 1.5, 4 + k));
const ARBOLES_T = [];   // [x, z, escala, variante]
{ const L = PB, r = rng(5250);
  // el pozo (oeste de la plaza)
  { const x = -12, z = -51, y = SUELO(x, z), g = new THREE.LatheGeometry([[.9, 0], [1.05, 0], [1.05, .85], [.95, .95], [.85, .9], [.85, .1]].map(q => new THREE.Vector2(q[0], q[1])), 20); uvMuro(g, 1.4); L.add("muroT", g, TM(x, y, z)); L.add("oscuro", new THREE.CircleGeometry(.86, 20), TM(x, y + .5, z, -Math.PI / 2, 0, 0));
    for (const s of [-1, 1]) L.add("maderaN", new THREE.BoxGeometry(.14, 2.3, .14), TM(x + s * .95, y + 1.15, z)); L.add("maderaN", new THREE.CylinderGeometry(.08, .08, 2.1, 8), TM(x, y + 1.8, z, 0, 0, Math.PI / 2)); for (let k = 0; k < 5; k++) L.add("soga", new THREE.TorusGeometry(.1, .025, 4, 10), TM(x - .3 + k * .1, y + 1.8, z, 0, Math.PI / 2, 0));
    cuerda(L, [x, y + 1.72, z], [x, y + 1.0, z], .015); balde(L, TM(x, y + .7, z)); for (const s of [-1, 1]) L.add("piz", new THREE.BoxGeometry(2.6, .06, 1.1), TM(x, y + 2.55, z + s * .45, s * .75, 0, 0)); ocupa(x, z, 1.3); rectAdd({ x, z, ry: 0, w: 2.4, d: 2.4, pozo: 1 }) }
  // el abrevadero de piedra (este de la plaza) y bancos de piedra contra las casas
  { const x = 15, z = -62, y = SUELO(x, z); L.add("muroT", uvMuro(new THREE.BoxGeometry(2.6, .7, .9), 2.4), TM(x, y + .35, z)); L.add("agua", new THREE.PlaneGeometry(2.3, .6), TM(x, y + .62, z, -Math.PI / 2, 0, 0)); rectAdd({ x, z, ry: 0, w: 2.8, d: 1.1 }) }
  for (const [x, z, ry] of [[-18.6, -47, Math.PI / 2], [-18.6, -64, Math.PI / 2], [18.6, -50, -Math.PI / 2], [-5, -69.2, 0], [5.5, -44, Math.PI]]) { banco(L, TM(x, SUELO(x, z), z, 0, ry, 0)); rectAdd({ x, z, ry, w: 1.7, d: .5 }) }
  { const x = -16.5, z = -61, M = TM(x, SUELO(x, z), z, 0, .4, 0); carro(L, M, r); rectAdd({ x, z, ry: .4, w: 1.6, d: 2.6 }) }
  ARBOLES_T.push([12.5, -47.5, 1.25, 2]); ocupa(12.5, -47.5, 1); rectAdd({ x: 12.5, z: -47.5, ry: 0, w: 1.2, d: 1.2, arbol: 1 });
  L.add("muroT", uvMuro(new THREE.CylinderGeometry(1.5, 1.6, .45, 16), 2.4), TM(12.5, SUELO(12.5, -47.5) + .2, -47.5)) }
// ---------- LA BODA (bodaVisible(on)): el ARCO DE FLORES frente a la iglesia (flores blancas y secas, cintas que cuelgan), bancos para los
// invitados a los dos lados del pasillo, faroles de papel bajos. La pareja se para bajo el arco mirando al norte.
const BODA_G = new THREE.Group(); scene.add(BODA_G);
const BODA_V = { arco: [ARCO_BODA[0], SUELO(...ARCO_BODA), ARCO_BODA[1]], novios: [[ARCO_BODA[0] - .5, ARCO_BODA[1] + .2], [ARCO_BODA[0] + .5, ARCO_BODA[1] + .2]], cura: [ARCO_BODA[0], ARCO_BODA[1] - 1.6], invitados: [] };
{ const L = lote(), r = rng(5260), [ax, az] = ARCO_BODA, y = SUELO(ax, az), RA = 1.35, PH = 2.5, flores = [];
  for (const s of [-1, 1]) { L.add("madera", new THREE.BoxGeometry(.14, PH, .14), TM(ax + s * RA, y + PH / 2, az)); L.add("madera", new THREE.BoxGeometry(.4, .12, .4), TM(ax + s * RA, y + .06, az)) }
  const arcoP = []; for (let k = 0; k <= 16; k++) { const a = k / 16 * Math.PI; arcoP.push([ax + Math.cos(a) * RA, y + PH + Math.sin(a) * RA * .9, az]) } L.add("madera", tubo(arcoP, .07, .07, 6, 24));
  const sobre = []; for (let k = 0; k <= 40; k++) { const u = k / 40; if (u < .25) sobre.push([ax - RA, y + u / .25 * PH, az]); else if (u > .75) sobre.push([ax + RA, y + (1 - u) / .25 * PH, az]); else { const a = Math.PI * (1 - (u - .25) / .5); sobre.push([ax + Math.cos(a) * RA, y + PH + Math.sin(a) * RA * .9, az]) } }
  sobre.forEach(p => { for (let q = 0; q < 6; q++) flores.push([p[0] + (r() - .5) * .3, p[1] + (r() - .5) * .25, p[2] + (r() - .5) * .3, .05 + r() * .06, r()]) });
  for (let k = 0; k < 9; k++) { const p = sobre[10 + k * 2], L2 = .6 + r() * .9; L.add(k % 2 ? "cinta" : "cintaR", new THREE.PlaneGeometry(.05, L2), TM(p[0], p[1] - L2 / 2, p[2] + .12, 0, 0, (r() - .5) * .1)) }
  // bancos de los invitados (al sur, mirando al arco) y faroles de papel en palitos a lo largo del pasillo
  for (let f = 0; f < 5; f++) for (const s of [-1, 1]) { const x = ax + s * 2.4, z = az + 4 + f * 1.6; banco(L, TM(x, SUELO(x, z), z, 0, Math.PI, 0)); BODA_V.invitados.push([x - .4, z], [x + .4, z]) }
  for (let f = 0; f < 6; f++) for (const s of [-1, 1]) { const x = ax + s * 1.05, z = az + 3 + f * 1.6, yy = SUELO(x, z); L.add("maderaN", new THREE.CylinderGeometry(.015, .015, 1.0, 5), TM(x, yy + .5, z)); L.add("farolPapel", new THREE.CylinderGeometry(.09, .09, .2, 10), TM(x, yy + 1.1, z)) }
  L.add("alfombra", new THREE.BoxGeometry(1.2, .015, 11), TM(ax, y + .07, az + 6.5));
  L.fin(BODA_G, { madera: M_MADERA_V, maderaN: M_MADERA_N, maderaV: M_MADERA_V, cinta: SM("#efe8d8", { roughness: .8, side: THREE.DoubleSide }), cintaR: SM("#b08a8a", { roughness: .8, side: THREE.DoubleSide }), farolPapel: new THREE.MeshStandardMaterial({ color: "#f0d8a0", emissive: "#ffb050", emissiveIntensity: 1.6 }), alfombra: PB_M.alfombra });
  const fm = new THREE.InstancedMesh(mergeG([0, 1, 2, 3, 4].map(k => [new THREE.SphereGeometry(.5, 6, 4), TM(Math.cos(k * 1.26) * .5, 0, Math.sin(k * 1.26) * .5, 0, 0, 0, .7, .35, .7)]).concat([[new THREE.SphereGeometry(.35, 6, 4), TM(0, .1, 0)]])), new THREE.MeshStandardMaterial({ roughness: .7 }), flores.length), cc = new THREE.Color();
  flores.forEach(([x, yy, z, s, q], i) => { dummy.position.set(x, yy, z); dummy.rotation.set(r() * 3, r() * 3, 0); dummy.scale.setScalar(s); dummy.updateMatrix(); fm.setMatrixAt(i, dummy.matrix); fm.setColorAt(i, cc.set(q < .45 ? "#f4f0e4" : q < .65 ? "#e8d0c8" : q < .8 ? "#c8b89a" : q < .9 ? "#7a5a40" : "#4a5a32")) }); fm.castShadow = true; BODA_G.add(fm);
  BODA_G.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true } }); BODA_G.visible = false }
const bodaVisible = (on = true) => { BODA_G.visible = !!on };
// ---------- LA CAMPANA de la iglesia (bronce, con su yugo de madera y la rueda), y LA CUERDA que baja hasta la base de la torre.
// campanaToca(a): ángulo de la campana (radianes; ≈ ±.9 cuando la tocan fuerte); la cuerda sube y baja con la rueda
const CAMPANA_G = (() => { const piv = new THREE.Group(), [cx, cy, cz] = CAMPANA_T, y0 = IGLESIA_B.y0; piv.position.set(cx, y0 + cy, cz); scene.add(piv);
  const prof = [[0, -.08], [.18, -.1], [.32, -.2], [.38, -.4], [.42, -.7], [.5, -.95], [.62, -1.12], [.66, -1.18], [.6, -1.2], [.52, -1.14], [.44, -.98], [.36, -.72], [.32, -.42], [.26, -.2], [0, -.16]];
  const L = lote(); L.add("bronce", new THREE.LatheGeometry(prof.map(q => new THREE.Vector2(q[0], q[1])), 32)); L.add("bronce", new THREE.TorusGeometry(.52, .025, 6, 32), TM(0, -1.02, 0, Math.PI / 2, 0, 0)); L.add("bronce", new THREE.TorusGeometry(.4, .02, 6, 32), TM(0, -.55, 0, Math.PI / 2, 0, 0));
  L.add("hierro", new THREE.CylinderGeometry(.04, .04, .9, 6), TM(0, -.6, 0)); L.add("hierro", new THREE.SphereGeometry(.09, 10, 8), TM(0, -1.05, 0));   // el badajo
  L.add("madera", RB1(1.7, .3, .32, .03), TM(0, .08, 0)); for (const s of [-1, 1]) L.add("hierro", new THREE.CylinderGeometry(.05, .05, .4, 8), TM(s * .95, .08, 0, 0, 0, Math.PI / 2));
  L.add("madera", new THREE.TorusGeometry(.9, .05, 6, 28, Math.PI), TM(.72, .08, 0, 0, Math.PI / 2, Math.PI)); for (let k = 0; k < 5; k++) { const a = Math.PI + k / 4 * Math.PI; L.add("madera", new THREE.BoxGeometry(.04, .04, .9), TM(.72, .08 + Math.sin(a) * .45, Math.cos(a) * .45, a, 0, 0)) }
  L.fin(piv, { bronce: M_BRONCE, hierro: M_HIERRO_N, madera: M_MADERA_N });
  // apoyos fijos del yugo
  for (const s of [-1, 1]) PB.add("madera", new THREE.BoxGeometry(.25, 1.1, .5), TM(cx + s * 1.1, y0 + cy - .45, cz));
  // la cuerda: tramo de arriba (de la rueda al piso del campanario) y tramo de abajo (del techo de la base hasta 0,9 m del piso, con la punta enrollada)
  const cu = new THREE.Group(); scene.add(cu); const g1 = new THREE.CylinderGeometry(.018, .018, 1, 6); g1.translate(0, -.5, 0);
  const arriba = new THREE.Mesh(g1, M_SOGA), abajo = new THREE.Mesh(g1, M_SOGA), cola = new THREE.Mesh(new THREE.TorusGeometry(.12, .025, 6, 14), M_SOGA); [arriba, abajo, cola].forEach(m => { m.castShadow = true; cu.add(m) });
  return { piv, cu, arriba, abajo, cola, x: cx + .72, z: cz - .9, y0 } })();
function campanaToca(a = 0) { const C = CAMPANA_G, Y = C.y0; C.piv.rotation.x = a; const dy = a * .9, yr = Y + CAMPANA_T[1] + .08 - .9, xt = C.x, zt = CAMPANA_T[2] + (a > 0 ? .9 * Math.sin(Math.min(a, 1.4)) * 0 : 0) - .0;
  C.arriba.position.set(xt, yr, CAMPANA_T[2] - .0); C.arriba.scale.set(1, Math.max(.1, yr - (Y + IGLESIA_B.CB0)), 1); C.arriba.position.z = CAMPANA_T[2];
  const ab = 1.0 + dy; C.abajo.position.set(xt, Y + IGLESIA_B.TB, CAMPANA_T[2]); C.abajo.scale.set(1, Math.max(.3, IGLESIA_B.TB - ab), 1); C.cola.position.set(xt, Y + ab - .1, CAMPANA_T[2] + .1); C.cola.rotation.set(Math.PI / 2 - .3, 0, 0) }
campanaToca(0);
// adentro de la iglesia: bancos (dos columnas), el altar con mantel y velas, candelabros, el crucifijo de hierro, el atril
{ const L = PB, r = rng(5270), y = IGLESIA_B.y0 + .1, cz = IGLESIA_T.z, z1 = cz - IGLESIA_T.d / 2;
  for (let f = 0; f < 8; f++) for (const s of [-1, 1]) { const z = -79.5 - f * 1.9, x = s * 2.4; L.add("maderaN", RB1(3.0, .06, .42, .01), TM(x, y + .45, z)); L.add("maderaN", RB1(3.0, .6, .05, .01), TM(x, y + .78, z + .22)); for (const sx of [-1, 1]) L.add("maderaN", new THREE.BoxGeometry(.06, .9, .5), TM(x + sx * 1.47, y + .45, z + .05)) }
  L.add("sillarC", RB1(2.2, .95, 1.0, .03), TM(0, y + .47, z1 + 2.2)); L.add("mantel", new THREE.BoxGeometry(2.3, .02, 1.1), TM(0, y + .96, z1 + 2.2)); L.add("mantel", new THREE.BoxGeometry(2.3, .6, .02), TM(0, y + .67, z1 + 2.76));
  for (let k = 0; k < 7; k++) VELAS_B.push({ p: [-.9 + k * .3, y + .97, z1 + 2.05 + (k % 2) * .1], h: .2 + (k % 3) * .1, g: 5, gorda: 1 });
  for (const s of [-1, 1]) { L.add("bronce", new THREE.CylinderGeometry(.03, .12, 1.4, 10), TM(s * 1.6, y + .7, z1 + 2.2)); VELAS_B.push({ p: [s * 1.6, y + 1.42, z1 + 2.2], h: .45, g: 5, gorda: 1 }) }
  L.add("hierroN", new THREE.BoxGeometry(.1, 1.6, .06), TM(0, y + 3.2, z1 + .86)); L.add("hierroN", new THREE.BoxGeometry(.9, .1, .06), TM(0, y + 3.6, z1 + .86));
  L.add("maderaN", new THREE.CylinderGeometry(.06, .2, 1.1, 8), TM(2.4, y + .55, z1 + 4.2)); L.add("maderaN", new THREE.BoxGeometry(.5, .05, .4), TM(2.4, y + 1.15, z1 + 4.2, -.4, 0, 0)); L.add("papel", new THREE.BoxGeometry(.4, .03, .3), TM(2.4, y + 1.19, z1 + 4.2, -.4, 0, 0));
  for (const z of [-80, -86, -92]) for (const s of [-1, 1]) { L.add("hierroN", new THREE.CylinderGeometry(.02, .06, 1.6, 6), TM(s * 4.6, y + .8, z)); for (let k = 0; k < 3; k++) VELAS_B.push({ p: [s * 4.6 + (k - 1) * .09, y + 1.6, z], h: .15 + k * .05, g: 5 }) }
  LUCES_PUNTOS.push([0, y + 2, z1 + 3.4, 4.5, "#ffb060", 14], [0, y + 2.4, -86, 2.4, "#ffa050", 12]) }
const IGLESIA_V = { puerta: [0, SUELO(0, -69.8), -69.8], puertaAdentro: [0, IGLESIA_B.y0 + .1, -73.6], nave: [0, IGLESIA_B.y0 + .1, -86], altar: [0, IGLESIA_B.y0 + .1, IGLESIA_T.z - IGLESIA_T.d / 2 + 3.6],
  cuerda: [CAMPANA_G.x, IGLESIA_B.y0 + .1, CAMPANA_T[2]], campana: [CAMPANA_T[0], IGLESIA_B.y0 + CAMPANA_T[1], CAMPANA_T[2]], punta: [TORRE_T.x, IGLESIA_B.y0 + TORRE_T.punta, TORRE_T.z] };
// la puerta de la iglesia (dos hojas de roble con herrajes, abren hacia adentro)
{ const tz = TORRE_T.z + TORRE_T.lado / 2 - .7 + .08, y = IGLESIA_B.y0; hojaPuerta("iglesia", TM(-.88, y, tz), .87, 2.86, "col3", 3, { sg: 1, ang: 1.6 }); hojaPuerta("iglesia", TM(.88, y, tz, 0, Math.PI, 0), .87, 2.86, "col3", 5, { sg: -1, ang: 1.6 }) }
// ---------- EL CEMENTERIO detrás de la iglesia: lápidas (redondeadas, cruces, obeliscos; torcidas, con musgo), montículos, verja de hierro
{ const L = PB, r = rng(5280), z0 = -104, z1 = -124, x0 = -15, x1 = 15;
  for (let k = 0; k < 64; k++) { const x = lerp(x0 + 1.2, x1 - 1.2, (k % 9 + .5) / 9) + (r() - .5) * .8, z = lerp(z0 - 1.4, z1 + 1.2, ((k / 9 | 0) + .5) / 8) + (r() - .5) * .6; if (r() < .12) continue; const y = SUELO(x, z), M = TM(x, y, z, (r() - .5) * .25, (r() - .5) * .3, (r() - .5) * .25), q = r(), mt = r() < .5 ? "muroT" : "corona";
    if (q < .5) { const h = .7 + r() * .5; L.add(mt, RB1(.6, h, .14, .04), M.clone().multiply(TM(0, h / 2, 0))); L.add(mt, new THREE.CylinderGeometry(.3, .3, .14, 14, 1, false, 0, Math.PI), M.clone().multiply(TM(0, h, 0, Math.PI / 2, 0, Math.PI / 2))) }
    else if (q < .8) { L.add(mt, RB1(.14, 1.2, .12, .02), M.clone().multiply(TM(0, .6, 0))); L.add(mt, RB1(.6, .12, .12, .02), M.clone().multiply(TM(0, .9, 0))) }
    else { L.add(mt, RB1(.4, .3, .4, .02), M.clone().multiply(TM(0, .15, 0))); L.add(mt, new THREE.CylinderGeometry(.06, .16, 1.4, 4), M.clone().multiply(TM(0, 1.0, 0, 0, Math.PI / 4, 0))) }
    if (r() < .6) L.add("tierra", new THREE.SphereGeometry(1, 8, 4, 0, 6.283, 0, Math.PI / 2), TM(x, y - .05, z + 1.0, 0, 0, 0, .45, .2, .9)) }
  const verja = (ax, az, bx, bz) => { const n = Math.ceil(Math.hypot(bx - ax, bz - az) / .16); for (let k = 0; k <= n; k++) { const x = lerp(ax, bx, k / n), z = lerp(az, bz, k / n), y = SUELO(x, z); L.add("hierroN", new THREE.CylinderGeometry(.012, .012, 1.3, 4), TM(x, y + .65, z)); if (k % 2 === 0) L.add("hierroN", new THREE.ConeGeometry(.028, .09, 4), TM(x, y + 1.34, z)) }
    for (const yy of [.2, 1.15]) { const y = SUELO((ax + bx) / 2, (az + bz) / 2); L.add("hierroN", new THREE.BoxGeometry(Math.hypot(bx - ax, bz - az), .025, .025), TM((ax + bx) / 2, y + yy, (az + bz) / 2, 0, -Math.atan2(bz - az, bx - ax), 0)) } };
  verja(x0, z1, x1, z1); verja(x0, z0, x0, z1); verja(x1, z0, x1, z1); verja(x0, z0, -6.5, z0); verja(6.5, z0, x1, z0);
  ARBOLES_T.push([-11, -118, 1.1, 1], [10.5, -108, .9, 0]); rectAdd({ x: 0, z: (z0 + z1) / 2, ry: 0, w: x1 - x0, d: z0 - z1, cementerio: 1 });
  VELAS_B.push({ p: [-3, SUELO(-3, -110) + .3, -110], h: .2, g: 6, gorda: 1 }, { p: [4.2, SUELO(4.2, -115) + .25, -115], h: .15, g: 6 }) }
// ---------- LA COLINA: el POSTE-PERCHA en la cima (poste de madera vieja clavado en un montón de piedras, con hombros tallados como una percha
// gigante y un gancho de hierro arriba), cintas e hilos viejos atados, el piso pelado alrededor
const POSTE_V = (() => { const [x, z] = COLINA_T, y = SUELO(x, z), L = PB, r = rng(5290);
  for (let k = 0; k < 26; k++) { const a = r() * 6.283, d = .3 + r() * .7, s = .18 + r() * .2; L.add("piedra", GEO_PIEDRAS[k % 3], TM(x + Math.cos(a) * d, y + .05 + (1 - d) * .25, z + Math.sin(a) * d, r(), r() * 6, 0, s, s * .8, s)) }
  L.add("maderaV", tubo([[x, y - .3, z], [x + .03, y + 1.2, z - .02], [x - .02, y + 2.6, z + .01], [x, y + 2.78, z]], .13, .1, 8, 8));
  L.add("maderaV", tubo([[x, y + 2.66, z - .62], [x, y + 2.74, z - .3], [x, y + 2.8, z], [x, y + 2.74, z + .3], [x, y + 2.66, z + .62]], .055, .055, 6, 10));
  L.add("hierroN", tubo([[x, y + 2.8, z], [x, y + 3.02, z], [x - .1, y + 3.14, z], [x - .2, y + 3.05, z]], .02, .016, 6, 8));
  for (let k = 0; k < 7; k++) { const yy = y + .9 + r() * 1.4, col = ["cintaR2", "flor0", "tela", "flor4", "cuero"][k % 5], L2 = .3 + r() * .5; L.add("soga", new THREE.TorusGeometry(.12, .012, 4, 12), TM(x, yy, z, Math.PI / 2, 0, 0)); L.add(col, new THREE.BoxGeometry(.03, L2, .005), TM(x - .12, yy - L2 / 2, z + (r() - .5) * .1, 0, 0, (r() - .5) * .3)) }
  { const g = new THREE.CircleGeometry(1.7, 24, 0, 6.283); g.rotateX(-Math.PI / 2); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const X = p.getX(i) + x, Z = p.getZ(i) + z; p.setXYZ(i, X, SUELO(X, Z) + .03, Z) } g.computeVertexNormals(); L.add("tierra", g) }
  rectAdd({ x, z, ry: 0, w: 1.6, d: 1.6, poste: 1 });
  return { base: [x, y, z], gancho: [x, y + 2.8, z], abrigo: [x, y + 2.76, z], vistaPueblo: [x - 4, y + 1.6, z + 3], miraPueblo: [0, 6, -70] } })();
const ABRIGOS_POSTE = {};
// abrigoEnPoste(tipo | null): cuelga del poste de la colina un abrigo ("gris", "chico" (el de Tib), "rojo" (el de la madre), "negro" (el de Crane), …) o ninguno
function abrigoEnPoste(tipo = null) { Object.values(ABRIGOS_POSTE).forEach(G => G.visible = false); if (!tipo) return null;
  if (!ABRIGOS_POSTE[tipo]) { const G = abrigoGeo(tipo); G.position.set(...POSTE_V.abrigo); G.rotation.y = -Math.PI / 2; G.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true } }); scene.add(G); ABRIGOS_POSTE[tipo] = G }
  ABRIGOS_POSTE[tipo].visible = true; return ABRIGOS_POSTE[tipo] }
PB_M.cintaR2 = SM("#8a2a2a", { roughness: .9 });
// ---------- AFUERA: árboles secos (patios, afueras, la ladera de la colina), cercos de madera, leña, galpones; pasto alto y oscuro; piedras
{ const r = rng(5300);
  for (let k = 0; k < 9000 && ARBOLES_T.length < 170; k++) { const x = (r() - .5) * 300, z = -150 + r() * 270, rr = Math.hypot(x * .92, (z + 12) * 1.05); if (rr < 26 || enCalle(x, z, 2) || distSendero(x, z) < 3 || Math.hypot(x - COLINA_T[0], z - COLINA_T[1]) < 9 || !libreEn(x, z, 2.2, { zona: 1 }) || ARBOLES_T.some(([a, b]) => Math.hypot(a - x, b - z) < 6)) continue;
    if (rr > 150) continue; ARBOLES_T.push([x, z, .7 + r() * .7, k % 3]); ocupa(x, z, 1.2); rectAdd({ x, z, ry: 0, w: 1, d: 1, arbol: 1 }) }
  const ms = GEO_ARBOL_SECO.map(g => { const m = new THREE.InstancedMesh(g, M_CORTEZA, ARBOLES_T.length); m.count = 0; m.castShadow = m.receiveShadow = true; scene.add(m); return m });
  ARBOLES_T.forEach(([x, z, s, v]) => { const m = ms[v], n = m.count++; dummy.position.set(x, SUELO(x, z) - .1, z); dummy.rotation.set((r() - .5) * .08, r() * 6, (r() - .5) * .08); dummy.scale.set(s, s * (.9 + r() * .3), s); dummy.updateMatrix(); m.setMatrixAt(n, dummy.matrix) });
  // cercos de estacas frente a las casas de afuera y leña apilada
  AFUERAS_T.forEach((C, i) => { const F = C.HM; for (let k = 0; k < 22; k++) { const lx = -5 + k * .48; if (Math.abs(lx - C.px) < .7) continue; const M = F.clone().multiply(TM(lx, 0, C.d / 2 + 3.2, (r() - .5) * .1, 0, (r() - .5) * .12)); M.elements[13] = SUELO(M.elements[12], M.elements[14]); PB.add("maderaV", RB1(.09, 1.0 + r() * .2, .04, .01), M.clone().multiply(TM(0, .5, 0))); PB.add("maderaV", new THREE.ConeGeometry(.05, .12, 4), M.clone().multiply(TM(0, 1.1, 0))) }
    const M2 = F.clone().multiply(TM(-C.w / 2 + .8, 0, C.d / 2 + .7)); M2.elements[13] = SUELO(M2.elements[12], M2.elements[14]); lena(PB, M2, r, 1.6) }) }
const GEO_MATA_T = (() => { const r = rng(5310), pos = [], uv = [], idx = []; for (let b = 0; b < 7; b++) { const a = r() * 6.283, d = r() * .16, bx = Math.cos(a) * d, bz = Math.sin(a) * d, Hh = .3 + r() * .4, lean = (r() - .5) * .5, fa = r() * 6.283, wv = .03 + r() * .015, o = pos.length / 3;
    for (let k = 0; k <= 3; k++) { const s = k / 3, x = bx + s * s * lean * Hh * Math.cos(fa), y = s * Hh, z = bz + s * s * lean * Hh * Math.sin(fa), wd = wv * (1 - s * .85); pos.push(x - Math.sin(fa) * wd, y, z + Math.cos(fa) * wd, x + Math.sin(fa) * wd, y, z - Math.cos(fa) * wd); uv.push(0, s, 1, s) }
    for (let k = 0; k < 3; k++) { const i = o + k * 2; idx.push(i, i + 1, i + 2, i + 1, i + 3, i + 2) } }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const n = g.attributes.normal; for (let i = 0; i < n.count; i++) n.setXYZ(i, n.getX(i) * .3, 1, n.getZ(i) * .3); n.needsUpdate = true; g.normalizeNormals(); return g })();
const PASTO_T = (() => { const N = 34000, m = new THREE.InstancedMesh(GEO_MATA_T, conViento(new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .9, side: THREE.DoubleSide }), "pasto", .06), N), r = rng(5320), cc = new THREE.Color(); m.receiveShadow = true; m.castShadow = false; let n = 0;
  for (let k = 0; k < N * 6 && n < N; k++) { const hill = r() < .3, x = hill ? COLINA_T[0] + (r() - .5) * 90 : (r() - .5) * 320, z = hill ? COLINA_T[1] + (r() - .5) * 80 : -170 + r() * 300; if (calleKT(x, z) > .05 || distSendero(x, z) < 1.1 || !libreEn(x, z, .25, { mc: -.4, zona: 1 }) || Math.hypot(x - COLINA_T[0], z - COLINA_T[1]) < 2.4) continue;
    const c0 = colorSueloT(x, z), rr = Math.hypot(x * .92, (z + 12) * 1.05); if (rr < 40 && r() < .75) continue; const s = .6 + r() * .8; dummy.position.set(x, SUELO(x, z) - .02, z); dummy.rotation.set(0, r() * 6, 0); dummy.scale.set(s, s * (.7 + r() * .9), s); dummy.updateMatrix(); m.setMatrixAt(n, dummy.matrix);
    cc.setRGB(c0[0] * (.8 + r() * .3), c0[1] * (.9 + r() * .3), c0[2] * (.7 + r() * .2)); m.setColorAt(n, cc); n++ }
  m.count = n; scene.add(m); return m })();
const PASTO = PASTO_T;
{ const r = rng(5330), P = [], cc = new THREE.Color();
  for (let k = 0; k < 8000 && P.length < 1600; k++) { const x = (r() - .5) * 300, z = -170 + r() * 300, enc = calleKT(x, z); if (!libreEn(x, z, .3, { mc: -.3, zona: 1 }) || (enc > .3 && r() < .9)) continue; const s = .06 + r() * r() * (enc > .3 ? .08 : .4); P.push([x, SUELO(x, z) + s * .2, z, s * (1 + r() * .5), s * (.55 + r() * .3), s]) }
  const ms = GEO_PIEDRAS.map(g => { const m = new THREE.InstancedMesh(g, M_ROCA, Math.ceil(P.length / 3) + 2); m.castShadow = m.receiveShadow = true; m.count = 0; scene.add(m); return m });
  P.forEach(([x, y, z, sx, sy, sz], i) => { const m = ms[i % 3], n = m.count++; dummy.position.set(x, y, z); dummy.rotation.set((r() - .5) * .3, r() * 6, (r() - .5) * .3); dummy.scale.set(sx, sy, sz); dummy.updateMatrix(); m.setMatrixAt(n, dummy.matrix); m.setColorAt(n, cc.set(["#6a665e", "#5a574e", "#7a7568", "#4e4b44"][r() * 4 | 0])) }) }
// pircas (muros bajos de piedra seca) en la ladera de la colina y junto al sendero
{ const r = rng(5340), pirca = (x0, z0, x1, z1) => { const Lw = Math.hypot(x1 - x0, z1 - z0), n = Math.ceil(Lw / 2.2); for (let k = 0; k < n; k++) { const x = lerp(x0, x1, (k + .5) / n), z = lerp(z0, z1, (k + .5) / n); if (r() < .1) continue; PB.add("muroT", uvMuro(new THREE.BoxGeometry(Lw / n + .05, .75 + r() * .25, .55), 3.2, r(), r()), TM(x, SUELO(x, z) + .25, z, (r() - .5) * .05, -Math.atan2(z1 - z0, x1 - x0), 0)) } };
  pirca(66, -16, 74, -15); pirca(74, -15, 80, -20); pirca(68, -25, 74, -28); pirca(58, -40, 70, -48); pirca(98, -10, 104, -30); pirca(60, 0, 72, 8) }
// ---------- CUERVOS: negros, en las cumbreras, en el árbol seco de la plaza, en el poste de la colina y en las lápidas
const CUERVOS = (() => { const r = rng(5350), P = [];
  CASAS_P.filter((C, i) => C.fila && i % 5 === 0).forEach(C => { const lx = (r() - .5) * (C.frontal ? .3 : C.w - 1), lz = C.frontal ? (r() - .5) * (C.d - 1) : 0; P.push([...W3(C.HM, C.frontal ? 0 : lx, C.ridge + .02, C.frontal ? lz : 0), r() * 6]) });
  [[12.5, 7.6, -47.5], [13.6, 6.8, -48.2], [11.4, 7.9, -46.6]].forEach(([x, dy, z]) => P.push([x, SUELO(x, z) + dy, z, r() * 6]));
  P.push([POSTE_V.base[0], POSTE_V.base[1] + 2.87, POSTE_V.base[2] - .5, 1.6], [0, IGLESIA_B.y0 + IGLESIA_T.alto + 6.6, -95, .3], [1.2, IGLESIA_B.y0 + 14.7, TORRE_T.z + 2.6, 3.1]);
  const g = mergeG([[new THREE.SphereGeometry(.1, 8, 6), TM(0, .12, 0, 0, 0, 0, 1, .9, 1.7)], [new THREE.SphereGeometry(.065, 8, 6), TM(0, .22, .14)], [new THREE.ConeGeometry(.022, .09, 5), TM(0, .21, .23, Math.PI / 2, 0, 0)], [new THREE.BoxGeometry(.12, .015, .2), TM(0, .1, -.2, -.3, 0, 0)], [new THREE.CylinderGeometry(.008, .008, .08, 4), TM(.04, .03, 0)], [new THREE.CylinderGeometry(.008, .008, .08, 4), TM(-.04, .03, 0)]]);
  const m = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({ color: "#0a0a0c", roughness: .35, metalness: .2, envMap: ENV_NOCHE_P, envMapIntensity: .8 }), P.length); P.forEach(([x, y, z, a], i) => { dummy.position.set(x, y, z); dummy.rotation.set(0, a, 0); dummy.scale.setScalar(1.25); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix) }); m.castShadow = true; scene.add(m); return m })();

// ================= LA ATMÓSFERA: humo de chimeneas, vapor de las ollas, polvo en el aire, niebla baja (Sallow), estrellas, luna, disco del sol,
// polillas alrededor de las velas de la tienda y moscas. Todo lo anima atmosfera(t, clima), que llama ambiente(t)
// humo: puntos que suben y se abren (cada fuente: `per` bocanadas en fila). o: { per, sube, tam, vel, col, op }
const T_PUFF = (() => { const t = tex(128, 128, (g, w, h) => { const r = rng(7590); g.clearRect(0, 0, w, h); for (let k = 0; k < 26; k++) { const a = r() * 6.28, d = r() * 30, x = 64 + Math.cos(a) * d, y = 64 + Math.sin(a) * d, s = 14 + r() * 22, gr = g.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, "rgba(255,255,255,.35)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(x - s, y - s, 2 * s, 2 * s) } }); return t })();
function crearHumo(fuentes, o = {}) { const per = o.per || 6, N = fuentes.length * per, pos = new Float32Array(N * 3), sd = new Float32Array(N);
  fuentes.forEach((p, i) => { for (let k = 0; k < per; k++) { const j = i * per + k; pos[j * 3] = p[0]; pos[j * 3 + 1] = p[1]; pos[j * 3 + 2] = p[2]; sd[j] = (k + hash2(i, k) * .8) / per + hash2(i, 7) } });
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("sd", new THREE.BufferAttribute(sd, 1));
  const U = { uT: { value: 0 }, uCol: { value: new THREE.Color(o.col || "#aaaaaa") }, uMap0: { value: 0 }, uOp: { value: o.op ?? .5 }, uSube: { value: o.sube || 7 }, uTam: { value: o.tam || 3 }, uVel: { value: o.vel || .1 }, uFogD: VELA_U.uFogD, uViento: { value: new THREE.Vector2(.7, .25) }, map: { value: o.map || T_PUFF }, uH: { value: H * .5 } };
  const m = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false,
    vertexShader: `attribute float sd; uniform float uT, uSube, uTam, uVel, uFogD, uH; uniform vec2 uViento; varying float vA; varying float vF; varying float vR;
      void main(){ float ph = fract(uT * uVel + sd); vec3 p = position; float h = ph * uSube; p.y += h; p.xz += uViento * h * h / uSube * .8 + vec2(sin(sd * 40. + uT * .7), cos(sd * 31. + uT * .6)) * h * .14;
        vec4 mv = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mv; float d = max(.3, -mv.z); gl_PointSize = min(900., uTam * (.3 + ph * 1.2) * projectionMatrix[1][1] * uH / d);
        vA = smoothstep(0., .15, ph) * (1. - ph) * smoothstep(.5, 3., d); vF = exp(-uFogD * uFogD * d * d); vR = sd * 37. + uT * .2 * (fract(sd * 9.) - .5); }`,
    fragmentShader: `uniform sampler2D map; uniform vec3 uCol; uniform float uOp; varying float vA; varying float vF; varying float vR; void main(){ vec2 q = gl_PointCoord - .5; float c = cos(vR), s = sin(vR); q = vec2(c * q.x - s * q.y, s * q.x + c * q.y) + .5; float a = texture2D(map, q).a * 1.6; gl_FragColor = vec4(uCol * (.75 + .25 * vF), a * a * vA * uOp * (.35 + .65 * vF)); }` }));
  m.frustumCulled = false; m.renderOrder = 4; scene.add(m); return { m, U } }
// humo de las chimeneas: unas 300 (las más cercanas al centro primero; las demás sin humo)
const HUMO_CH = crearHumo(HUMOS.map(v => [v.x, v.y, v.z]).sort((a, b) => Math.hypot(a[0], a[2]) - Math.hypot(b[0], b[2])).filter((_, i) => i < 90 || i % 4 === 0).slice(0, 200), { per: 16, sube: 12, tam: 3.2, vel: .05, op: .13 });
const POLVO_B = (() => { const N = 5000, r = rng(7600), pos = new Float32Array(N * 3); for (let i = 0; i < N * 3; i++) pos[i] = r() * 28;
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); const U = { uT: { value: 0 }, uCam: { value: new THREE.Vector3() }, uI: { value: .5 }, uCol: { value: new THREE.Color("#fff0d0") }, uH: { value: H * .5 }, map: { value: GLOW } };
  const m = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `uniform float uT, uH; uniform vec3 uCam; varying float vA; void main(){ vec3 b = position + vec3(sin(uT * .13 + position.y) * 1.5 + uT * .12, sin(uT * .09 + position.x) * 1.2 - uT * .05, cos(uT * .11 + position.z) * 1.5);
      vec3 p = uCam + mod(b - uCam + 14., 28.) - 14.; vec4 mv = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mv; float d = max(.2, -mv.z); gl_PointSize = clamp(.012 * projectionMatrix[1][1] * uH / d, 1., 4.);
      vA = smoothstep(14., 6., length(p - uCam)) * smoothstep(.3, 1.2, d) * (.5 + .5 * sin(uT * 2. + position.x * 7.)); }`,
    fragmentShader: `uniform sampler2D map; uniform vec3 uCol; uniform float uI; varying float vA; void main(){ float a = texture2D(map, gl_PointCoord).a; gl_FragColor = vec4(uCol * a * vA * uI, 1.); }` }));
  m.frustumCulled = false; m.renderOrder = 7; scene.add(m); return { m, U } })();
// niebla baja (clima sallow): bancos de niebla a ras del piso alrededor de la tienda y la plaza, que se mueven despacio
const NIEBLA_B = (() => { const N = 1100, r = rng(7610), m = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({ uniforms: { map: { value: GLOW }, uT: VELA_U.uT, uCol: { value: new THREE.Color() }, uOp: { value: 0 }, uFogD: VELA_U.uFogD }, transparent: true, depthWrite: false,
    vertexShader: `uniform float uT; varying vec2 vUv; varying float vA; void main(){ vUv = uv; vec4 c = modelMatrix * instanceMatrix * vec4(0., 0., 0., 1.); float s = length(instanceMatrix[0].xyz); float ph = c.x * .37 + c.z * .21;
      c.x += sin(uT * .05 + ph) * 3.; c.z += cos(uT * .04 + ph) * 2.; vec4 mv = viewMatrix * c; mv.xy += position.xy * vec2(s, s * .45); gl_Position = projectionMatrix * mv; float d = -mv.z; vA = smoothstep(1.5, 7., d); }`,
    fragmentShader: `uniform sampler2D map; uniform vec3 uCol; uniform float uOp; varying vec2 vUv; varying float vA; void main(){ float a = texture2D(map, vUv).a; gl_FragColor = vec4(uCol, a * a * uOp * vA); }` }), N);
  for (let i = 0; i < N; i++) { const hill = i % 5 === 0, x = hill ? COLINA_T[0] + (r() - .5) * 80 : (r() - .5) * 170, z = hill ? COLINA_T[1] + (r() - .5) * 70 : -135 + r() * 235, s = 6 + r() * 12; dummy.position.set(x, sueloB(x, z) + .5 + r() * 1.3, z); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(s); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix) }
  m.frustumCulled = false; m.renderOrder = 8; m.visible = false; scene.add(m); return m })();
// estrellas (muchas, chiquitas, algunas titilan) y la luna (disco con mares y halo), y el disco del sol
const ESTRELLAS_B = (() => { const N = 3200, r = rng(7620), pos = new Float32Array(N * 3), sz = new Float32Array(N); for (let i = 0; i < N; i++) { const u = r(), v = r() * .96 + .04, th = u * 6.283, y = v, rr = Math.sqrt(1 - y * y); pos.set([Math.cos(th) * rr * 430, y * 430, Math.sin(th) * rr * 430], i * 3); sz[i] = r() < .04 ? 3.2 : 1 + r() * 1.4 }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("sz", new THREE.BufferAttribute(sz, 1));
  const m = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms: { uT: VELA_U.uT, uI: { value: 1 } }, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float sz; uniform float uT; varying float vA; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.); gl_Position = projectionMatrix * mv; gl_PointSize = sz * 1.6; vA = (.6 + .4 * sin(uT * (1.5 + sz) + position.x)) * smoothstep(0., .25, position.y / 430.); }`,
    fragmentShader: `uniform float uI; varying float vA; void main(){ float d = length(gl_PointCoord - .5); gl_FragColor = vec4(vec3(.85, .9, 1.) * smoothstep(.5, .1, d) * vA * uI, 1.); }` }));
  m.frustumCulled = false; m.renderOrder = -.5; m.visible = false; scene.add(m); return m })();
const T_LUNA = tex(256, 256, (g, w, h) => { const r = rng(7630); const gr = g.createRadialGradient(110, 110, 10, 128, 128, 120); gr.addColorStop(0, "#f4f2ea"); gr.addColorStop(1, "#c8ccd2"); g.fillStyle = gr; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill();
  for (let k = 0; k < 14; k++) { const a = r() * 6.28, d = r() * 90, s = 8 + r() * 30; g.fillStyle = `rgba(120,128,140,${.2 + r() * .25})`; g.beginPath(); g.arc(128 + Math.cos(a) * d, 128 + Math.sin(a) * d, s, 0, 7); g.fill() } });
const LUNA_B = (() => { const G = new THREE.Group(), d = new THREE.Mesh(new THREE.CircleGeometry(19, 40), new THREE.MeshBasicMaterial({ map: T_LUNA, fog: false, color: new THREE.Color().setRGB(1.6, 1.65, 1.8) })), h = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#8aa8e8", transparent: true, opacity: .55, fog: false, depthWrite: false, blending: THREE.AdditiveBlending }));
  h.scale.setScalar(110); G.add(h, d); G.visible = false; G.renderOrder = -.4; scene.add(G); return { G, d, h } })();
const SOL_DISCO = (() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#fff0d0", transparent: true, opacity: 1, fog: false, depthWrite: false, blending: THREE.AdditiveBlending })); s.visible = false; scene.add(s); return s })();
// polillas alrededor de las velas de la tienda y de algunos faroles; moscas en el clima sallow (en CPU: pocas)
const POLILLAS = (() => { const N = 140, geo = mergeG([[new THREE.PlaneGeometry(.035, .028), TM(.018, 0, 0, 0, 0, .3)], [new THREE.PlaneGeometry(.035, .028), TM(-.018, 0, 0, 0, 0, -.3)]]), m = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color: "#c8b89a", roughness: 1, side: THREE.DoubleSide, emissive: "#3a2a10", emissiveIntensity: .4 }), N);
  const r = rng(7640), C = VELAS_B.filter(v => v.g === 1 || v.g === 4).filter((_, i) => i % 2 === 0), P = Array.from({ length: N }, (_, i) => { const v = C[(r() * C.length) | 0] || { p: [0, 1, 0] }; return { c: [v.p[0], v.p[1] + .25 + r() * .3, v.p[2]], rad: .15 + r() * .5, w: (r() < .5 ? -1 : 1) * (2 + r() * 3), ph: r() * 6.28, mosca: i > 90 } });
  m.frustumCulled = false; m.castShadow = false; scene.add(m); return { m, P } })();
function atmosfera(t, A) { const cp = cam.position;
  CASA_MATS.luz.emissiveIntensity = .25 + 1.3 * Math.min(1.2, A.ventanas ?? .5);
  HUMO_CH.U.uT.value = t; HUMO_CH.U.uCol.value.set(A.humo || "#aaaaaa"); HUMO_CH.U.uOp.value = .07 + .03 * (A.niebla || 0);
  POLVO_B.U.uT.value = t; POLVO_B.U.uCam.value.copy(cp); POLVO_B.U.uI.value = (A.polvo ?? .5) * (A.cielo === 2 ? .35 : A.cielo === 3 ? .45 : .9); POLVO_B.U.uCol.value.set(A.cielo === 2 ? "#a8b8e0" : A.cielo === 3 ? "#c8d0c0" : "#fff0d0");
  NIEBLA_B.visible = (A.niebla || 0) > 0; NIEBLA_B.material.uniforms.uOp.value = .42 * (A.niebla || 0); NIEBLA_B.material.uniforms.uCol.value.copy(scene.fog.color).multiplyScalar(1.05);
  ESTRELLAS_B.visible = (A.estrellas || 0) > 0; ESTRELLAS_B.position.copy(cp);
  const d = SOL.dir || A.sol || [0, 1, 0], l = Math.hypot(...d); LUNA_B.G.visible = (A.luna || 0) > 0; if (LUNA_B.G.visible) { LUNA_B.G.position.set(cp.x + d[0] / l * 400, cp.y + d[1] / l * 400, cp.z + d[2] / l * 400); LUNA_B.d.lookAt(cp) }
  SOL_DISCO.visible = A.cielo === 0 || A.cielo === 1; if (SOL_DISCO.visible) { SOL_DISCO.position.set(cp.x + d[0] / l * 400, cp.y + d[1] / l * 400, cp.z + d[2] / l * 400); SOL_DISCO.scale.setScalar(A.cielo === 1 ? 160 : 70); SOL_DISCO.material.color.set(A.cielo === 1 ? "#ffb070" : "#fff4e0") }
  const mos = A.niebla > 0; POLILLAS.P.forEach((q, i) => { const a = t * q.w + q.ph, rr = q.rad * (1 + .3 * Math.sin(t * 1.7 + q.ph)), on = !q.mosca || mos;
    dummy.position.set(q.c[0] + Math.cos(a) * rr, q.c[1] + Math.sin(t * 2.3 + q.ph) * .15 + (q.mosca ? -.3 : 0), q.c[2] + Math.sin(a) * rr); dummy.rotation.set(0, -a, 0); const f = .4 + .6 * Math.abs(Math.sin(t * 40 + i)); dummy.scale.set(on ? (q.mosca ? .4 : 1) * f + .2 : 0, on ? 1 : 0, on ? (q.mosca ? .5 : 1) : 0); dummy.updateMatrix(); POLILLAS.m.setMatrixAt(i, dummy.matrix) });
  POLILLAS.m.instanceMatrix.needsUpdate = true; POLILLAS.m.material.color.set(mos ? "#2a2622" : "#c8b89a") }

// ================= todo junto
PB.fin(scene, PB_M); { const ms = PBV.fin(scene, PBV_M); Object.values(ms).forEach(m => { m.castShadow = true }) }
velasArmar();

// ================= LOS CLIMAS DE LUZ DE HOLLOWMERE (ENV_HOLLOW): la escena hace una vez Object.assign(ENV, ENV_HOLLOW) y después setEnv(nombre).
// Además de lo del motor (top, hor, fog, hemi, hemiG, sun, sunCol, exp, grade) cada clima trae: sol (dirección hacia la luna o el sol),
// sombra (radio de la caja de sombras), velas (brillo de llamas y halos), ventanas (brillo de las ventanas con vela), tiembla (cuánto
// tiemblan las llamas), estrellas, luna, niebla (bancos de niebla baja), polvo (motas), humo (color del humo), luces (luces puntuales),
// cielo (0 día, 1 sol bajo, 2 noche, 3 sombrío), nubes (cuántas nubes en _lejos_tej.js). exp es la exposición FINAL (no multiplicar).
const ENV_HOLLOW = {
  // la principal: luna fría y baja del oeste-noroeste (sombras largas y duras cruzando la calle), cielo azul tinta con estrellas, niebla baja
  // suelta, velas cálidas en todas las ventanas y faroles
  noche: { top: "#02040c", hor: "#141c2e", fog: .0068, hemi: .5, hemiG: "#120e0a", sun: 1.25, sunCol: "#9ab6f4", exp: 2.2, grade: ["#3a5aa0", .08], sol: [LUNA_DIR.x, LUNA_DIR.y, LUNA_DIR.z], sombra: 70,
    velas: 1.5, ventanas: 1.7, tiembla: 1, estrellas: 1, luna: 1, niebla: .45, polvo: .3, humo: "#4a5266", luces: 1.7, cielo: 2, nubes: .6 },
  // la misma noche tapada de niebla: la luna difusa, todo se pierde a los 40 m, los faroles hacen halos
  nocheNiebla: { top: "#0a0e16", hor: "#283040", fog: .022, hemi: .6, hemiG: "#16120e", sun: .7, sunCol: "#a8bce0", exp: 2.3, grade: ["#4a6a8a", .1], sol: [LUNA_DIR.x, LUNA_DIR.y, LUNA_DIR.z], sombra: 55,
    velas: 1.7, ventanas: 1.5, tiembla: 1.2, estrellas: 0, luna: .5, niebla: 1.1, polvo: .7, humo: "#5a6270", luces: 1.9, cielo: 3, nubes: .9 },
  // adentro (casa de la familia, taller, iglesia): casi nada de luna (entra por las ventanas), velas y el hogar mandan
  interior: { top: "#02040a", hor: "#0e0c10", fog: .003, hemi: .2, hemiG: "#1a120a", sun: .35, sunCol: "#8aa6e0", exp: 2.3, grade: ["#d0902e", .07], sol: [LUNA_DIR.x, LUNA_DIR.y, LUNA_DIR.z], sombra: 40,
    velas: 1.8, ventanas: 1.4, tiembla: .9, estrellas: 1, luna: 1, niebla: 0, polvo: .9, humo: "#4a5266", luces: 2.2, cielo: 2, nubes: .4 },
  // la mañana final: sol bajo del este, rosado-dorado, niebla blanca que se levanta del pasto, velas casi apagadas
  amanecer: { top: "#5a6a8e", hor: "#e0b090", fog: .0085, hemi: .95, hemiG: "#5a4a3a", sun: 2.6, sunCol: "#ffc08a", exp: 1.35, grade: ["#ff9a60", .08], sol: [.85, .17, .3], sombra: 90,
    velas: .4, ventanas: .2, tiembla: .6, estrellas: 0, luna: 0, niebla: .8, polvo: .8, humo: "#b8a8a0", luces: .2, cielo: 1, nubes: .7 },
  // cerca de la Tejedora: más oscuro y frío (azul-verdoso), niebla espesa a ras del piso, las velas tiemblan y se achican
  tejedora: { top: "#010204", hor: "#0c1218", fog: .03, hemi: .38, hemiG: "#0a0c0c", sun: .9, sunCol: "#88a8c8", exp: 2.35, grade: ["#2a5a6a", .14], sol: [LUNA_DIR.x, LUNA_DIR.y + .1, LUNA_DIR.z], sombra: 60,
    velas: .85, ventanas: .9, tiembla: 2.6, estrellas: .4, luna: .7, niebla: 1.4, polvo: .9, humo: "#3a4450", luces: 1.0, cielo: 3, nubes: 1 } };
// (la escena hace UNA vez Object.assign(ENV, ENV_HOLLOW) antes del primer setEnv: ENV del motor se declara después del mundo)
const ENV_CAMPANA_CIUDAD = ENV_HOLLOW, ENV_CIELO_PUEBLO = ENV_HOLLOW;   // nombres viejos
// el «sol» (luz direccional: la luna de noche): las escenas pueden mover el centro de las sombras (SOL.x, SOL.z, SOL.r) y la dirección (SOL.dir)
const SOL = { x: 0, z: 0, r: null, dir: null };
const AMB = { t: 0, cam: [0, 0, 0] };
function ambiente(t) { const A = ENV[ENVNOW] || {}, d = SOL.dir || A.sol || [-.4, 1, .4], l = Math.hypot(d[0], d[1], d[2]), cy = SUELO(SOL.x, SOL.z), R0 = SOL.r || A.sombra || 90; AMB.t = t; AMB.cam = [cam.position.x, cam.position.y, cam.position.z];
  sun.position.set(SOL.x + d[0] / l * 160, cy + d[1] / l * 160, SOL.z + d[2] / l * 160); sun.target.position.set(SOL.x, cy, SOL.z); sun.target.updateMatrixWorld();
  { const c = sun.shadow.camera; if (c.right !== R0 || c.far !== 360) { c.left = -R0; c.right = R0; c.top = R0; c.bottom = -R0; c.near = 1; c.far = 360; c.updateProjectionMatrix() } }
  VIENTO.value = t; VELA_U.uT.value = t; VELA_U.uTiem.value = A.tiembla ?? 1; VELA_U.uHalo.value = (A.velas ?? 1) ** 2 * .42; VELA_U.uFogD.value = scene.fog.density;
  M_LLAMA.color.setRGB(3.2, 2.1, .9).multiplyScalar(.45 + .55 * Math.min(1.4, A.velas ?? 1));
  M_VENTANA.emissiveIntensity = (A.ventanas ?? .3) * (1 + .05 * Math.sin(t * 7.3) + .03 * Math.sin(t * 13.1));
  M_VITRAL.forEach(m => m.emissiveIntensity = .25 + .35 * (A.ventanas ?? .5));
  if (PB_M.brasa) PB_M.brasa.emissiveIntensity = 1.2 + .25 * Math.sin(t * 3.1) + .15 * Math.sin(t * 7.7);
  if (typeof atmosfera === "function") atmosfera(t, A) }
// deja todo en reposo (llamar al empezar cada cuadro, antes de ambiente): velas derechas, sol en el centro, puertas cerradas, ropero contra la
// puerta, ningún abrigo en el poste, el abrigo de Crane en su gancho, la campana quieta, sin boda
function mundoReset() { velasHacia(null); SOL.x = 0; SOL.z = 0; SOL.r = null; SOL.dir = null; puertasCerrar(); roperoMover(0); abrigoEnPoste(null); abrigoEnGancho(true); campanaToca(0); bodaVisible(false) }
mundoReset();

// ================= API para las escenas (resumen; los detalles están junto a cada función)
// puertaAbrir(nombre, u) · roperoMover(u) · abrigoEnPoste(tipo | null) · abrigoEnGancho(on) · campanaToca(ang) · bodaVisible(on) · abrigoNuevo(tipo) · tijerasGrandes(abre)
// posiciones: CASA_FAM_V · TALLER_V · CRANE_V · MARGA_V · IGLESIA_V · POSTE_V · BODA_V · LUGARES_T (y las medidas de _comun_tej.js)
const LUGARES_T = { calleSur: [0, SUELO(0, 60), 60], calleCasa: [0, SUELO(0, 14), 14], calleTaller: [0, SUELO(0, 1), 1], calleNorte: [0, SUELO(0, -30), -30], plaza: [0, SUELO(0, -56), -56], cruce: [0, SUELO(0, -20), -20],
  sendero: [70, SUELO(70, -19), -19], cima: POSTE_V.base, callejonFam: [-16.9, SUELO(-16.9, 14), 14], caidaRojo: [CAIDA_ROJO[0], SUELO(...CAIDA_ROJO), CAIDA_ROJO[1]] };
// ---------- compatibilidad con el elenco y escenas viejos (no hacen nada)
const VAPOR = { U: { uT: { value: 0 }, uOp: { value: 0 }, uViento: { value: new THREE.Vector2() } }, m: { visible: false } };
const frasco = () => { }, tapon = () => { }, montonTapones = () => { }, ollaVapor = () => { }, tiendaInterior = () => ({}), FRASCOS_B = [], TAPONES_B = [], TAPONES_AG = [];
const POSTES = [], POSTE_TOP = () => [0, 0, 0], posteBaja = () => { }, techosRajan = () => { }, campana = () => { }, veleta = () => { };
function vientoFuerza(f) { RAFAGA.value = .35 * Math.max(0, f) }
const PUNTOS = { sopa: [0, 0], boda: ARCO_BODA, bebe: [0, 0, 0] }, LUGARES_GENTE = { plaza: { centro: [0, -56] }, altar: { centro: [ARCO_BODA[0], ARCO_BODA[1]] } };
