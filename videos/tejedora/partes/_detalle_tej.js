// ================= «NOBODY HEARS THE BELL»: el detalle de Underbell (utilería, velas, mercado, faroles, ropa tendida, banderines, puentes colgantes,
// el adentro de la tienda de Sallow, la casa de Nell, la escuela, el altar, el risco con su escalera), la atmósfera (humo, polvo, niebla baja,
// estrellas, luna, polillas) y los CLIMAS DE LUZ (ENV_CAMPANA_CIUDAD) =================
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

// ================= LA CIUDAD LLENA: mercado (toldos rayados, puestos con panales y bloques de cera), faroles de hierro, barandas, ropa tendida,
// banderines, puentes colgantes de madera entre las casas, macetas, cosas en las puertas; adentro de la casa de Nell; la escuela; el altar
// de las bodas; el risco con su escalera tallada; árboles, pasto y piedras; afuera, chacras con pircas y parvas.
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

// ---------- adentro de la casa de Nell: la mesa bajo la ventana con velas, dos sillas, una muñeca de trapo, el aparador, la alfombra, un cuadro
{ const at = CASA_NELL_B.at, fz = CASA_NELL_B.fz, vc = CASA_NELL_B.vc, L = PB, M0 = at(0, 0, 0);
  const P = (x, y, z, ...a) => at(x, y, z, ...a);
  L.add("madera", new THREE.BoxGeometry(1.5, .06, .8), P(vc, 1.08, fz - 1.0)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) L.add("madera", new THREE.BoxGeometry(.06, .76, .06), P(vc + sx * .68, .65, fz - 1.0 + sz * .33));
  L.add("mantel", new THREE.BoxGeometry(1.56, .01, .86), P(vc, 1.115, fz - 1.0)); for (const sx of [-1, 1]) L.add("mantel", new THREE.BoxGeometry(.01, .25, .86), P(vc + sx * .78, .99, fz - 1.0));
  [[-.5, .2, .3], [-.25, .3, .2], [.05, .25, .26], [.35, .22, .18], [.55, .28, .14]].forEach(([dx, dz, h]) => VELAS_B.push({ p: new THREE.Vector3(vc + dx, 1.12, fz - 1.0 + dz - .2).applyMatrix4(M0).toArray(), h, g: 3 }));
  L.add("piedraC", new THREE.CylinderGeometry(.14, .12, .02, 14), P(vc + .2, 1.125, fz - 1.15));
  for (const [sx, ry] of [[-1, Math.PI / 2], [1, -Math.PI / 2]]) { const x = vc + sx * 1.05, z = fz - 1.05; L.add("madera", new THREE.BoxGeometry(.44, .05, .44), P(x, .72, z)); for (const a of [-1, 1]) for (const b of [-1, 1]) L.add("madera", new THREE.BoxGeometry(.04, .45, .04), P(x + a * .19, .49, z + b * .19)); L.add("madera", new THREE.BoxGeometry(.04, .55, .44), P(x + sx * .2, 1.0, z)) }
  // la muñeca de trapo sentada en la silla de la derecha
  { const x = vc + 1.05, z = fz - 1.05; L.add("muneca", new THREE.SphereGeometry(.09, 8, 6), P(x, .84, z, 0, 0, 0, 1, 1.3, .8)); L.add("mantel", new THREE.SphereGeometry(.07, 8, 6), P(x, 1.0, z)); for (const s of [-1, 1]) L.add("muneca", new THREE.CapsuleGeometry(.025, .14, 2, 5), P(x - .1, .78, z + s * .05, 0, 0, Math.PI / 2)) }
  L.add("maderaN", new THREE.BoxGeometry(.5, 1.9, 1.3), P(2.35, 1.22, fz - 2.8)); for (let k = 0; k < 3; k++) L.add("piedraC", new THREE.CylinderGeometry(.11, .09, .03, 12), P(2.05, 2.2, fz - 3.2 + k * .35, 0, 0, Math.PI / 2));
  L.add("tela", new THREE.BoxGeometry(2.4, .01, 1.6), P(vc + .4, .33, fz - 2.2)); L.add("maderaN", new THREE.BoxGeometry(.6, .45, .04), P(-2.65 + .03, 1.9, fz - 2.4, 0, Math.PI / 2, 0)); L.add("papel", new THREE.PlaneGeometry(.5, .36), P(-2.62 + .03, 1.9, fz - 2.4, 0, Math.PI / 2, 0));
  // afuera: velas en el alféizar y una maceta
  for (let k = 0; k < 4; k++) VELAS_B.push({ p: new THREE.Vector3(CASA_NELL_B.VEN[0] + .2 + k * .45, .95, fz + .14).applyMatrix4(M0).toArray(), h: .08 + k % 2 * .1, g: 3 });
  LUCES_PUNTOS.push([...new THREE.Vector3(vc, 1.6, fz - 1.0).applyMatrix4(M0).toArray(), 3.5, "#ffb060", 7]) }
const CASA_NELL_V = (() => { const M0 = CASA_NELL_B.at(0, 0, 0), W = (x, y, z) => new THREE.Vector3(x, y, z).applyMatrix4(M0).toArray(); return { ventana: W(CASA_NELL_B.vc, 1.6, CASA_NELL_B.fz + .2), afuera: W(CASA_NELL_B.vc, 0, CASA_NELL_B.fz + 2.2), mesa: W(CASA_NELL_B.vc, 1.12, CASA_NELL_B.fz - 1.0), puerta: W(1.275, 0, CASA_NELL_B.fz + .7), adentro: W(CASA_NELL_B.vc + .2, .3, CASA_NELL_B.fz - 2.4) } })();

// ---------- la escuela: el pizarrón con los labios dibujados (A · E · O · M · «read the lips»), bancos y el banquito de la maestra
const T_PIZARRON_B = tex(1024, 512, (g, w, h) => { const r = rng(7720); g.fillStyle = "#24302a"; g.fillRect(0, 0, w, h); for (let k = 0; k < 400; k++) { g.fillStyle = `rgba(220,230,220,${r() * .05})`; g.fillRect(r() * w, r() * h, 20 + r() * 120, 6 + r() * 30) }
  g.strokeStyle = "rgba(240,240,230,.9)"; g.fillStyle = "rgba(240,240,230,.9)"; g.lineWidth = 6; g.lineCap = "round";
  const boca = (cx, cy, ab, an, letra) => { g.beginPath(); g.ellipse(cx, cy, an, ab + 12, 0, 0, 7); g.stroke(); g.beginPath(); g.moveTo(cx - an, cy); g.quadraticCurveTo(cx, cy - ab * .4 - 18, cx + an, cy); g.stroke(); if (ab > 6) { g.fillStyle = "rgba(20,26,22,1)"; g.beginPath(); g.ellipse(cx, cy + 2, an * .62, ab * .55, 0, 0, 7); g.fill(); g.fillStyle = "rgba(240,240,230,.9)" }
    g.beginPath(); g.moveTo(cx - an * .5, cy - ab * .2); g.lineTo(cx + an * .5, cy - ab * .2); g.lineWidth = 3; g.stroke(); g.lineWidth = 6; g.font = "bold 64px Georgia, serif"; g.textAlign = "center"; g.fillText(letra, cx, cy + 120) };
  boca(150, 200, 40, 70, "A"); boca(380, 200, 18, 82, "E"); boca(610, 200, 42, 46, "O"); boca(840, 200, 2, 72, "M");
  g.font = "italic 46px Georgia, serif"; g.textAlign = "left"; g.fillText("Read the lips. Never the bell.", 60, 440); for (let k = 0; k < 30; k++) { g.fillStyle = `rgba(230,230,220,${r() * .3})`; g.fillRect(r() * w, h - 30 + r() * 20, 8 + r() * 20, 3) } });
{ PB_M.pizarra.map = T_PIZARRON_B; const M = ESCUELA_B.pizarra, L = PB; L.add("pizarra", new THREE.BoxGeometry(2.6, 1.3, .04), M.clone().multiply(TM(0, 1.55, .05))); L.add("maderaN", new THREE.BoxGeometry(2.75, .08, .07), M.clone().multiply(TM(0, 2.22, .06))); L.add("maderaN", new THREE.BoxGeometry(2.75, .06, .14), M.clone().multiply(TM(0, .88, .1)));
  for (const s of [-1, 1]) L.add("maderaN", new THREE.BoxGeometry(.07, 1.42, .07), M.clone().multiply(TM(s * 1.34, 1.55, .06))); for (let k = 0; k < 4; k++) L.add("blanco", new THREE.CylinderGeometry(.008, .008, .06, 5), M.clone().multiply(TM(-.8 + k * .3, .92, .12, 0, 0, Math.PI / 2)));
  for (let f = 0; f < 3; f++) banco(L, M.clone().multiply(TM((f - 1) * 1.7 + 1.2, 0, 1.9 + (f % 2) * .2, 0, Math.PI, 0)));
  L.add("madera", new THREE.CylinderGeometry(.2, .2, .05, 10), M.clone().multiply(TM(-1.9, .6, .8))); for (let k = 0; k < 3; k++) L.add("madera", new THREE.CylinderGeometry(.025, .03, .6, 5), M.clone().multiply(TM(-1.9 + Math.cos(k * 2.1) * .14, .3, .8 + Math.sin(k * 2.1) * .14))) }
PB_M.blanco = M_BLANCO_P;

// ---------- el ALTAR de las bodas (en la plaza, al sur, sobre la avenida del mercado): tarima de piedra de tres escalones, arco de madera con
// flores y cintas, dos atriles con velas gordas, y velas en los escalones
const ALTAR = (() => { const a = 100 * Math.PI / 180, rr = 10.6, x = Math.cos(a) * rr, z = Math.sin(a) * rr, ry = ryHacia(a), M = TM(x, pf(x, z), z, 0, ry, 0), at = (...q) => M.clone().multiply(TM(...q)), L = PB, r = rng(7730);
  for (let k = 0; k < 3; k++) L.add("corona", RB1(4.2 - k * .7, .16, 2.6 - k * .5, .03), at(0, .08 + k * .16, 0));
  for (const s of [-1, 1]) { L.add("madera", new THREE.BoxGeometry(.16, 2.9, .16), at(s * 1.25, .48 + 1.45, -.4)); for (let k = 0; k < 10; k++) { const y = .6 + k * .27; L.add("flor" + (k % 5), new THREE.SphereGeometry(.07, 6, 4), at(s * 1.25 + (r() - .5) * .14, y, -.32)); L.add("verde", new THREE.SphereGeometry(.06, 5, 4), at(s * 1.25 - .08, y + .1, -.32)) } }
  { const g = new THREE.TorusGeometry(1.25, .08, 6, 20, Math.PI); L.add("madera", g, at(0, 3.38, -.4)); for (let k = 0; k <= 16; k++) { const q = k / 16 * Math.PI; L.add("flor" + (k % 5), new THREE.SphereGeometry(.09, 6, 4), at(Math.cos(q) * 1.25, 3.38 + Math.sin(q) * 1.25, -.3)); L.add("verde", new THREE.SphereGeometry(.07, 5, 4), at(Math.cos(q + .1) * 1.32, 3.38 + Math.sin(q + .1) * 1.32, -.32)) } }
  for (let k = 0; k < 6; k++) { const [g, m] = cilEntre([-.8 + k * .32, 4.5, -.38], [-.8 + k * .32 + (r() - .5) * .2, 3.6 - r() * .8, -.33], .012, 4); L.add("tela", g, M.clone().multiply(m)) }
  for (const s of [-1, 1]) { L.add("hierroN", new THREE.CylinderGeometry(.04, .05, 1.2, 6), at(s * 1.8, .48 + .6, .5)); L.add("hierroN", new THREE.CylinderGeometry(.14, .06, .1, 8), at(s * 1.8, 1.7, .5)); VELAS_B.push({ p: new THREE.Vector3(s * 1.8, 1.75, .5).applyMatrix4(M).toArray(), h: .35, g: 5, gorda: true }) }
  for (let k = 0; k < 26; k++) { const u = r(), x0 = (u - .5) * 4, z0 = .95 + r() * .3; VELAS_B.push({ p: new THREE.Vector3(x0, .16 + .01, z0).applyMatrix4(M).toArray(), h: .06 + r() * .2, g: 5, gorda: r() < .4 }) }
  rectAdd({ x, z, ry, w: 4.4, d: 2.8, altar: 1 }); LUCES_PUNTOS.push([...new THREE.Vector3(0, 2, .6).applyMatrix4(M).toArray(), 3, "#ffb868", 8]);
  const W = (lx, lz) => new THREE.Vector3(lx, 0, lz).applyMatrix4(M).toArray().filter((_, i) => i !== 1);
  return { M, centro: [x, pf(x, z) + .48, z], novio: W(-.45, -.1), novia: W(.45, -.1), invitados: [...Array(14)].map((_, i) => W(((i % 7) - 3) * .9, 2.4 + (i / 7 | 0) * 1.1)) } })();

// ---------- EL MERCADO: puestos con toldos rayados alrededor del oeste de la plaza y sobre la calle A (al sudoeste)
const PUESTOS = [];
function puesto(M, r, k) { const L = PB, at = (...q) => M.clone().multiply(TM(...q)), an = 2.5 + r() * .5, toldo = "toldo" + (k % TOLDOS_C.length);
  for (const sx of [-1, 1]) for (const [sz, h] of [[.55, 2.25], [-.6, 2.6]]) L.add("madera", new THREE.BoxGeometry(.09, h, .09), at(sx * an / 2, h / 2, sz));
  L.add("maderaN", new THREE.BoxGeometry(an - .1, .08, 1.0), at(0, .88, .05)); L.add("madera", new THREE.BoxGeometry(an - .1, .78, .05), at(0, .45, .52)); L.add("madera", new THREE.BoxGeometry(an, .08, .08), at(0, 2.25, .55)); L.add("madera", new THREE.BoxGeometry(an, .08, .08), at(0, 2.6, -.6));
  { const g = new THREE.PlaneGeometry(an + .4, 1.75, 4, 3); g.rotateX(-Math.PI / 2 + .3); PBV.add(toldo, g, at(0, 2.47, .1)); const v = new THREE.PlaneGeometry(an + .4, .32, 8, 1), p = v.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) < 0) p.setY(i, p.getY(i) + .12 * Math.abs(Math.sin(p.getX(i) * 5.5))); PBV.add(toldo, v, at(0, 2.08, .94)) }
  const goods = k % 4; for (let x = -an / 2 + .3; x < an / 2 - .2; x += .42) { const z = (r() - .5) * .5, q = (goods + Math.floor(r() * 2)) % 4;
    if (q === 0) { for (let j = 0; j < 2; j++) L.add("panal", RB1(.36, .04, .26, .01), at(x, .945 + j * .04, z, 0, r() * .3, 0)); L.add("madera", new THREE.BoxGeometry(.4, .02, .3), at(x, .93, z)) }
    else if (q === 1) for (let j = 0; j < 3; j++) L.add(r() < .5 ? "cera" : "ceraV", RB1(.2, .1, .13, .015), at(x + (j % 2) * .05, .97 + j * .1, z, 0, r() * .5, 0));
    else if (q === 2) { L.add("miel", new THREE.CylinderGeometry(.06, .06, .14, 10), at(x - .07, .99, z)); L.add("miel", new THREE.CylinderGeometry(.05, .05, .12, 10), at(x + .08, .98, z + .08)); L.add("tela", new THREE.CylinderGeometry(.065, .065, .02, 10), at(x - .07, 1.07, z)) }
    else { L.add("cesta", new THREE.CylinderGeometry(.16, .12, .18, 10, 1, true), at(x, 1.01, z)); for (let j = 0; j < 7; j++) L.add(r() < .5 ? "cera" : "ceraV", new THREE.CylinderGeometry(.018, .018, .3, 6), at(x + (r() - .5) * .14, 1.08, z + (r() - .5) * .14, (r() - .5) * .5, 0, (r() - .5) * .5)) } }
  for (let j = 0; j < 7; j++) L.add(r() < .5 ? "cera" : "ceraV", new THREE.CylinderGeometry(.02, .022, .34, 6), at(-an / 2 + .3 + j * .1, 1.95, .5));
  L.add("cuerda" in PB_M ? "soga" : "soga", new THREE.CylinderGeometry(.006, .006, an - .4, 3), at(0, 2.14, .5, 0, 0, Math.PI / 2));
  if (r() < .6) cajon(L, at(-an / 2 - .45, 0, -.2, 0, r(), 0)); if (r() < .6) saco(L, at(an / 2 + .35, 0, .1, 0, r() * 6, 0)); if (r() < .4) barril(L, at(an / 2 + .2, 0, -.7));
  VELAS_B.push({ p: new THREE.Vector3((r() - .5) * an * .6, .93, .3).applyMatrix4(M).toArray(), h: .12 + r() * .15, g: 5, gorda: true }) }
{ const r = rng(7740);
  for (let a = 128; a <= 214; a += 14.5) { const ar = a * Math.PI / 180, rr = 12.0, x = Math.cos(ar) * rr, z = Math.sin(ar) * rr; if (enRadial(x, z, 1.6)) continue; const ry = ryHacia(ar); puesto(TM(x, pf(x, z), z, 0, ry, 0), r, PUESTOS.length); PUESTOS.push({ x, z, ry, frente: [x - Math.cos(ar) * 1.8, z - Math.sin(ar) * 1.8] }); rectAdd({ x, z, ry, w: 3.3, d: 1.6, puesto: 1 }) }
  for (let a = 104; a <= 206; a += 8.5) { const ar = a * Math.PI / 180, rr = 27.9, x = Math.cos(ar) * rr, z = Math.sin(ar) * rr; if (enRadial(x, z, 1.8)) continue; const ry = ryAfuera(ar); puesto(TM(x, pf(x, z), z, 0, ry, 0), r, PUESTOS.length); PUESTOS.push({ x, z, ry, frente: [x + Math.cos(ar) * 1.9, z + Math.sin(ar) * 1.9] }); rectAdd({ x, z, ry, w: 3.3, d: 1.6, puesto: 1 }) } }

// ---------- FAROLES DE HIERRO (con llama adentro): alrededor de la plaza, a lo largo de las calles anulares (del lado del muro) y de las radiales
const FAROLES = [];
const farolB = (x, z, alto = 3.4) => { farol(PB, x, z, alto); rectAdd({ x, z, ry: 0, w: .6, d: .6, farol: 1 }); const y = pf(x, z); VELAS_B.push({ p: [x, y + alto + .12, z], g: 4 }); FAROLES.push([x, y + alto + .3, z]) };
{ for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2 + .1, x = Math.cos(a) * 14.0, z = Math.sin(a) * 14.0; if (Math.abs(angD(a, A_TIENDA)) < .5 || enRadial(x, z, .8) || PUESTOS.some(p => Math.hypot(p.x - x, p.z - z) < 2.6) || Math.hypot(x - ALTAR.centro[0], z - ALTAR.centro[2]) < 3.2) continue; farolB(x, z, 3.6) }
  ANILLOS.forEach(([r0, r1, nm]) => { if (nm === "callejon") return; const rr = r0 + .55, n = Math.floor(Math.PI * 2 * rr / (nm === "A" ? 13 : 16)); for (let k = 0; k < n; k++) { const a = (k + .5) / n * Math.PI * 2, x = Math.cos(a) * rr, z = Math.sin(a) * rr; if (enRadial(x, z, 1.0) || riscoH(x, z) > 1.2 || !libreEn(x, z, .4, { zona: 1 })) continue; farolB(x, z) } });
  CALLES_RAD.forEach(c => { for (let rr = 20; rr < c.rMax - 2; rr += 11) { if (TERR_B.some(b => rr > b - 6.5 && rr < b + 1)) continue; const [x, z] = radPunto(c, rr, (c.an / 2 - .45) * (c.i % 2 ? 1 : -1)); if (!libreEn(x, z, .4, { zona: 1 })) continue; farolB(x, z) } });
  FAROLES.filter((_, i) => i % 2 === 0).forEach(p => LUCES_PUNTOS.push([p[0], p[1] - .2, p[2], 4.0, "#ffb460", 12])) }
// faroles chicos de pared a los lados de las escaleras (arriba)
ESCALERAS_B.forEach((E, i) => { if (i % 2) return; const M = TM(E.cx, 0, E.cz, 0, E.ry, 0); const p = new THREE.Vector3((E.W / 2 + .21) * (i % 4 ? 1 : -1), E.y1 + .9, E.L / 2 - .2).applyMatrix4(M); PB.add("hierroN", new THREE.CylinderGeometry(.11, .08, .05, 6), TM(p.x, p.y + .02, p.z)); PB.add("luz", new THREE.CylinderGeometry(.08, .06, .2, 6), TM(p.x, p.y + .14, p.z)); PB.add("hierroN", new THREE.ConeGeometry(.13, .12, 6), TM(p.x, p.y + .3, p.z)); VELAS_B.push({ p: [p.x, p.y + .06, p.z], h: .05, g: 0 }) });
// barandas de hierro de las escaleras
BARANDAS.forEach(P => { for (let k = 0; k < P.length; k++) { const [x, y, z] = P[k]; PB.add("hierroN", new THREE.CylinderGeometry(.022, .022, .95, 6), TM(x, y + .47, z)); if (k) cuerda(PB, [P[k - 1][0], P[k - 1][1] + .95, P[k - 1][2]], [x, y + .95, z], .025) } });
PB_M.escalon = M_ESCALON;

// ---------- cosas en las puertas y frentes (casas de las filas cercanas): bancos, barriles, cajones, bolsas, macetas, velas en el escalón
{ const r = rng(7750); CASAS_P.forEach(C => { if (C.fila === undefined || C.fila > 6 || !C.F) return; const F = C.HM.clone().multiply(C.F), side = C.px > 0 ? -1 : 1;
  for (let k = 0; k < 2 + (r() * 3 | 0); k++) VELAS_B.push({ p: new THREE.Vector3((r() - .5) * .9, .1, .42 + r() * .12).applyMatrix4(F).toArray(), h: .06 + r() * .2, g: 0, gorda: r() < .3 });
  const M = (dx, dz, ry = 0) => F.clone().multiply(TM(side * dx, 0, dz, 0, ry, 0)), q = r();
  if (q < .22) banco(PB, M(1.7, .45)); else if (q < .38) { barril(PB, M(1.2, .5)); if (r() < .5) barril(PB, M(1.9, .45)) } else if (q < .5) { cajon(PB, M(1.3, .45, r())); cajon(PB, M(1.4, .45, r()).multiply(TM(0, .44, 0)), .8) } else if (q < .6) { saco(PB, M(1.2, .45, r() * 6)); saco(PB, M(1.6, .5, r() * 6)) }
  for (let k = 0; k < (r() < .5 ? 2 : 0); k++) { const p = new THREE.Vector3(side * (.95 + k * .32), .02, .38).applyMatrix4(F); MACETAS_B.push([p.x, p.y, p.z, 1.3 + r() * .8, r() * 6]) } }) }
// macetas y velas sobre los muretes de las escaleras
ESCALERAS_B.forEach((E, i) => { const M = TM(E.cx, 0, E.cz, 0, E.ry, 0), r = rng(7760 + i); for (let k = 0; k < E.n; k += 3) { if (r() < .4) continue; const s = r() < .5 ? 1 : -1, u = -E.L / 2 + (k + .5) * E.L / E.n, y = E.y0 + (k + 1) * (E.y1 - E.y0) / E.n + .95, p = new THREE.Vector3(s * (E.W / 2 + .21), y, u).applyMatrix4(M);
  if (r() < .55) MACETAS_B.push([p.x, p.y, p.z, 1.1 + r() * .6, r() * 6]); else VELAS_B.push({ p: [p.x, p.y, p.z], h: .08 + r() * .2, g: 0, gorda: r() < .5 }) } });

// ---------- ROPA TENDIDA entre dos puntos (soga con caída, ropa colgada en el plano de la soga)
function tendederoAB(A, B, r, sag = .5) { const pt = q => [lerp(A[0], B[0], q), lerp(A[1], B[1], q) - Math.sin(q * Math.PI) * sag, lerp(A[2], B[2], q)], Lr = Math.hypot(B[0] - A[0], B[2] - A[2]), ang = Math.atan2(B[0] - A[0], B[2] - A[2]);
  for (const P of [A, B]) PB.add("hierro", new THREE.TorusGeometry(.06, .012, 4, 10), TM(P[0], P[1], P[2], 0, ang, 0));
  const N = 12; for (let k = 0; k < N; k++) cuerda(PB, pt(k / N), pt((k + 1) / N), .011);
  let q = .06 + r() * .05; while (q < .92) { const k = r() * M_ROPA.length | 0, forma = ROPA_F[k % ROPA_F.length], an = forma === "sabana" ? .9 + r() * .5 : forma === "medias" ? .35 : .55 + r() * .25, al = forma === "sabana" ? 1.0 + r() * .5 : forma === "pantalon" ? .9 : forma === "medias" ? .4 : .65 + r() * .15;
    const P = pt(q + an / Lr / 2), g = new THREE.PlaneGeometry(al, an, 3, 4); g.rotateZ(-Math.PI / 2); g.translate(0, -al / 2, 0); g.rotateY(Math.PI / 2); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setX(i, p.getX(i) + Math.sin((p.getZ(i) / an + .5) * Math.PI) * .03);
    PBV.add("ropa" + k, g, TM(P[0], P[1] - .01, P[2], 0, ang, 0)); q += an / Lr + .03 + r() * .06 } }
const hayCasa = (x, z) => RECTS.some(R => R.casa && Math.abs(R.x - x) < 12 && Math.abs(R.z - z) < 12 && enRect(R, x, z, .4));
{ const r = rng(7770);
  CALLES_RAD.forEach(c => FILAS.forEach((F, fi) => { if (fi > 6 || F.galpon || r() < .35) return; const rr = lerp(F.r0, F.r1, .3 + r() * .4), A2 = radPunto(c, rr, -c.an / 2 - .08), B2 = radPunto(c, rr + (r() - .5) * 1.5, c.an / 2 + .08);
    if (!hayCasa(...radPunto(c, rr, -c.an / 2 - .6)) || !hayCasa(...radPunto(c, rr, c.an / 2 + .6))) return; const y = Math.max(pf(...A2), pf(...B2)) + 3.6 + r() * 1.6; tendederoAB([A2[0], y, A2[1]], [B2[0], y + (r() - .5) * .5, B2[1]], r, .4 + r() * .3) }));
  ANILLOS.forEach(([r0, r1, nm]) => { if (nm !== "callejon") return; const n = Math.floor(Math.PI * 2 * r0 / 7); for (let k = 0; k < n; k++) { if (r() < .4) continue; const a = (k + r() * .5) / n * Math.PI * 2, A2 = [Math.cos(a) * (r0 - .1), Math.sin(a) * (r0 - .1)], B2 = [Math.cos(a + .02) * (r1 + .1), Math.sin(a + .02) * (r1 + .1)];
    if (riscoH(...A2) > 1 || enRadial(...A2, 1)) continue; const y = pf(...A2) + 2.9 + r() * 1.2; tendederoAB([A2[0], y, A2[1]], [B2[0], y, B2[1]], r, .3) } }) }

// ---------- BANDERINES (triángulos de colores en cuerdas): cruzando la plaza, la avenida del mercado y la calle A
const BAND_L = [];
function banderines(A, B, sag = .8) { const pt = q => [lerp(A[0], B[0], q), lerp(A[1], B[1], q) - Math.sin(q * Math.PI) * sag, lerp(A[2], B[2], q)], L = Math.hypot(B[0] - A[0], B[1] - A[1], B[2] - A[2]), n = Math.floor(L / .36), ang = Math.atan2(B[0] - A[0], B[2] - A[2]);
  for (let k = 0; k < 14; k++) cuerda(PB, pt(k / 14), pt((k + 1) / 14), .008); for (let k = 1; k < n; k++) { const p = pt(k / n); BAND_L.push([p[0], p[1], p[2], ang]) } }
{ const r = rng(7780), fachada = (a, h) => { const x = Math.cos(a) * 15.7, z = Math.sin(a) * 15.7; return [x, pf(x, z) + h, z] };
  for (const [a0, a1] of [[-150, 20], [-30, 160], [70, 230], [120, -60], [-100, 80], [10, 190]]) { const A = fachada(a0 * Math.PI / 180, 7.4), B = fachada(a1 * Math.PI / 180, 7.4); if (!hayCasa(A[0] * 1.06, A[2] * 1.06) || !hayCasa(B[0] * 1.06, B[2] * 1.06)) continue; banderines(A, B, .9) }
  for (const c of CALLES_RAD) for (let rr = 18; rr < 60; rr += 7) { if (r() < .5 || TERR_B.some(b => rr > b - 7 && rr < b + 1)) continue; const A2 = radPunto(c, rr, -c.an / 2 - .1), B2 = radPunto(c, rr + 1, c.an / 2 + .1); if (!hayCasa(...radPunto(c, rr, -c.an / 2 - .6)) || !hayCasa(...radPunto(c, rr + 1, c.an / 2 + .6))) continue; const y = pf(...A2) + 5.2 + r(); banderines([A2[0], y, A2[1]], [B2[0], y, B2[1]], .45) }
  const BM = new THREE.InstancedMesh((() => { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute([-.13, 0, 0, .13, 0, 0, 0, -.3, 0], 3)); g.computeVertexNormals(); return g })(), new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .9, side: THREE.DoubleSide }), BAND_L.length), cc = new THREE.Color(), COLS = ["#c83a2e", "#e8b838", "#3a7ac0", "#efe6d0", "#4a9a4a", "#d86a2a", "#8a4ab0"];
  BAND_L.forEach(([x, y, z, ang], i) => { dummy.position.set(x, y, z); dummy.rotation.set((r() - .5) * .3, ang + Math.PI / 2, 0); dummy.scale.setScalar(1); dummy.updateMatrix(); BM.setMatrixAt(i, dummy.matrix); BM.setColorAt(i, cc.set(COLS[i % COLS.length])) }); BM.castShadow = true; scene.add(BM) }

// ---------- PUENTES COLGANTES DE MADERA entre las casas de los dos lados de las calles radiales (a la altura del segundo piso)
const PUENTES = [];
{ const r = rng(7790);
  CALLES_RAD.forEach(c => [3, 4, 5, 6].forEach(fi => { const F = FILAS[fi]; if (r() < .45) return; const rr = lerp(F.r0, F.r1, .45), A2 = radPunto(c, rr, -c.an / 2 - .05), B2 = radPunto(c, rr, c.an / 2 + .05);
    if (!hayCasa(...radPunto(c, rr, -c.an / 2 - .7)) || !hayCasa(...radPunto(c, rr, c.an / 2 + .7))) return; const y = Math.max(pf(...A2), pf(...B2)) + 5.3, A = [A2[0], y, A2[1]], B = [B2[0], y, B2[1]], ang = Math.atan2(B[0] - A[0], B[2] - A[2]), Lp = Math.hypot(B[0] - A[0], B[2] - A[2]), pt = q => [lerp(A[0], B[0], q), y - Math.sin(q * Math.PI) * .45, lerp(A[2], B[2], q)];
    const n = Math.round(Lp / .2); for (let k = 0; k < n; k++) { const q = (k + .5) / n, p = pt(q), dy = Math.cos(q * Math.PI) * .45 * Math.PI / Lp; PB.add(k % 5 ? "madera" : "maderaV", new THREE.BoxGeometry(1.05 + (r() - .5) * .08, .05, .17), TM(p[0], p[1], p[2], 0, ang, 0).multiply(TM(0, 0, 0, Math.atan(dy), 0, 0))) }
    for (const s of [-1, 1]) { const off = (q, h) => { const p = pt(q); return [p[0] + Math.cos(ang) * s * .52, p[1] + h, p[2] - Math.sin(ang) * s * .52] };
      for (let k = 0; k < 10; k++) { cuerda(PB, off(k / 10, .95), off((k + 1) / 10, .95), .02); cuerda(PB, off(k / 10, -.04), off((k + 1) / 10, -.04), .018); cuerda(PB, off(k / 10, -.02), off(k / 10, .95), .01) }
      for (const q of [0, 1]) { const p = off(q, 0); PB.add("viga", new THREE.BoxGeometry(.12, 1.3, .12), TM(p[0], p[1] + .5, p[2])) } }
    for (const P of [A, B]) PB.add("oscuro", new THREE.PlaneGeometry(.9, 1.9), TM(P[0], P[1] + .95, P[2], 0, ang + (P === A ? 0 : Math.PI), 0).multiply(TM(0, 0, -.06)));
    PUENTES.push({ A, B }); VELAS_B.push({ p: pt(.5).map((v, i) => i === 1 ? v + .03 : v), h: .1, g: 0 }) })) }

// ---------- EL RISCO DEL ESTE: escalera tallada que sube en zigzag desde el final de la calle D hasta la cima (el «primer eslabón»),
// con baranda de hierro del lado del barranco, faroles, velas; arriba un descanso de piedra con el anclaje de hierro. RISCO_CIMA = [x, y, z]
const suaveB = (x, z) => SUELO(x, z) - Math.floor(sstB(20, 110, Math.hypot(x, z)) * 5) * 3.2;
const RISCO = (() => { const D = CALLES_RAD.find(c => c.n === "D"), [sx, sz] = radPunto(D, D.rMax + .5), cima = [RISCO_E[0] - 3.5, RISCO_E[1]], pts = [[sx, sz]], r = rng(7800);
  let p = [sx, sz], lado = 1, tramo = 0;
  for (let it = 0; it < 400; it++) { const dx = cima[0] - p[0], dz = cima[1] - p[1], dist = Math.hypot(dx, dz); if (dist < 2.5) break; const base = Math.atan2(dz, dx); let mejor = null;
    for (let k = 0; k <= 16; k++) { const a = base + lado * k / 16 * 1.45, q = [p[0] + Math.cos(a) * .8, p[1] + Math.sin(a) * .8], s = (suaveB(...q) - suaveB(...p)) / .8, cost = Math.abs(Math.min(s, 3) - .55) + k * .012; if (!mejor || cost < mejor[0]) mejor = [cost, q] }
    p = mejor[1]; pts.push(p); tramo += .8; if (tramo > 11 + r() * 4 && dist > 8) { lado = -lado; tramo = 0 } }
  pts.push(cima);
  // remuestreo cada 0,34 m y perfil con «mirada adelante»: nunca debajo del piso y con pendiente ≤ 0,75 (en el muro de 3,2 la escalera se levanta antes)
  const S = [[...pts[0], 0]]; for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]); for (let u = .34; u <= L; u += .34) S.push([lerp(a[0], b[0], u / L), lerp(a[1], b[1], u / L)]) }
  const G = S.map(q => SUELO(q[0], q[1]) + .05), Y = G.map(() => 0); for (let i = S.length - 1; i >= 0; i--) Y[i] = Math.max(G[i], i + 1 < S.length ? Y[i + 1] - .26 : G[i]);
  const L = PB, ESC = []; for (let i = 1; i < S.length; i++) { const a = S[i - 1], b = S[i], ry = Math.atan2(b[0] - a[0], b[1] - a[1]), cx = (a[0] + b[0]) / 2, cz = (a[1] + b[1]) / 2, top = Y[i], gnd = Math.min(G[i - 1], G[i]) - .6, hh = top - gnd;
    L.add("escalon", RB1(1.8, hh, .4, .05), TM(cx, gnd + hh / 2, cz, 0, ry, 0)); ESC.push({ cx, cz, ry, top });
    ESCALERAS_B.push({ cx, cz, ry, L: .36, W: 1.8, y0: top - .2, y1: top, n: 1 });
    if (i % 3 === 0) { // baranda del lado de abajo (el más bajo de los dos costados)
      const o = [Math.cos(ry), -Math.sin(ry)], l1 = SUELO(cx + o[0] * 1.6, cz + o[1] * 1.6), l2 = SUELO(cx - o[0] * 1.6, cz - o[1] * 1.6), sg = l1 < l2 ? 1 : -1, px = cx + o[0] * .82 * sg, pz = cz + o[1] * .82 * sg;
      L.add("hierroN", new THREE.CylinderGeometry(.03, .035, 1.0, 6), TM(px, top + .5, pz)); ESC[ESC.length - 1].poste = [px, top + 1.0, pz] }
    if (i % 26 === 13) { const o = [Math.cos(ry), -Math.sin(ry)]; farolB(cx - o[0] * 1.3, cz - o[1] * 1.3, 3.0) }
    if (r() < .12) VELAS_B.push({ p: [cx + (r() - .5) * 1.2, top, cz], h: .06 + r() * .2, g: 6, gorda: r() < .5 }) }
  const postes = ESC.filter(e => e.poste).map(e => e.poste); for (let k = 1; k < postes.length; k++) if (Math.hypot(postes[k][0] - postes[k - 1][0], postes[k][2] - postes[k - 1][2]) < 3) { cuerda(PB, postes[k - 1], postes[k], .022); cuerda(PB, [postes[k - 1][0], postes[k - 1][1] - .45, postes[k - 1][2]], [postes[k][0], postes[k][1] - .45, postes[k][2]], .015) }
  // el descanso de la cima, el anclaje (aro de hierro gigante en un bloque) y bolardos con cadena
  const yc = Math.max(Y[Y.length - 1], SUELO(...cima) + .05), C = TM(cima[0], yc, cima[1]);
  L.add("escalon", RB1(6, 1.4, 6, .08), C.clone().multiply(TM(0, -.7, 0))); for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; if (Math.abs(Math.sin(a)) < .3 && Math.cos(a) < 0) continue; const bx = Math.cos(a) * 2.8, bz = Math.sin(a) * 2.8; L.add("corona", RB1(.36, .8, .36, .06), C.clone().multiply(TM(bx, .4, bz))); const a2 = (k + 1) / 10 * Math.PI * 2; cuerda(PB, new THREE.Vector3(bx, .7, bz).applyMatrix4(C).toArray(), new THREE.Vector3(Math.cos(a2) * 2.8, .7, Math.sin(a2) * 2.8).applyMatrix4(C).toArray(), .03) }
  L.add("corona", RB1(1.8, 1.0, 1.8, .1), C.clone().multiply(TM(1.2, .5, 0))); L.add("hierroN", new THREE.TorusGeometry(.9, .16, 10, 24), C.clone().multiply(TM(1.2, 1.55, 0, 0, Math.PI / 2 + .2, 0)));
  for (const s of [-1, 1]) farolB(cima[0] - 2.2, cima[1] + s * 2.2, 2.6);
  for (let k = 0; k < 18; k++) { const a = r() * 6.28, d = 1 + r() * 1.6; VELAS_B.push({ p: [cima[0] + Math.cos(a) * d, yc, cima[1] + Math.sin(a) * d], h: .08 + r() * .25, g: 6, gorda: r() < .5 }) }
  // rocas grandes del risco y piedras sueltas
  { const P = []; for (let k = 0; k < 6000 && P.length < 520; k++) { const x = RISCO_E[0] + (r() - .5) * 80, z = RISCO_E[1] + (r() - .5) * 100, h = riscoH(x, z); if (h < 2 || S.some(q => Math.hypot(q[0] - x, q[1] - z) < 2.6) || Math.hypot(x - cima[0], z - cima[1]) < 4.5 || enCalle(x, z, 1) || !libreEn(x, z, 1, { zona: 1 })) continue; const s = P.length < 140 ? 2.5 + r() * 4.5 : .5 + r() * r() * 3.2; P.push([x, SUELO(x, z) - s * .3, z, s]) }
    const ms = GEO_PIEDRAS.map(g => { const m = new THREE.InstancedMesh(g, M_ROCA_G, P.length); m.count = 0; m.castShadow = m.receiveShadow = true; scene.add(m); return m }), cc = new THREE.Color();
    P.forEach(([x, y, z, s], i) => { const m = ms[i % 3], n = m.count++; dummy.position.set(x, y, z); dummy.rotation.set((r() - .5) * .5, r() * 6, (r() - .5) * .5); dummy.scale.set(s * (1 + r() * .6), s * (.45 + r() * .5), s); dummy.updateMatrix(); m.setMatrixAt(n, dummy.matrix); m.setColorAt(n, cc.set(["#9a958c", "#857f76", "#aaa59a", "#726e66", "#8e8a80"][r() * 5 | 0])) }) }
  return { pie: [sx, pf(sx, sz), sz], cima: [cima[0], yc, cima[1]], anclaje: new THREE.Vector3(1.2, 1.55, 0).applyMatrix4(C).toArray(), camino: S.map((q, i) => [q[0], Y[i], q[1]]) } })();
const RISCO_CIMA = RISCO.cima;

// ---------- árboles (patios de atrás, alrededor del risco y en las chacras de afuera), pasto en matas, piedras sueltas
const ARBOLES_B = [];
{ const r = rng(7810), A = ARBOLES_B;
  for (let k = 0; k < 9000 && A.length < 520; k++) { const ang = r() * 6.283, rr = 20 + Math.sqrt(r()) * 180, x = Math.cos(ang) * rr, z = Math.sin(ang) * rr; if (rr < 125 && !(rr > 42 && rr < 46) && r() < .85) continue;
    if (enCalle(x, z, 1.5) || !libreEn(x, z, 1.6, { zona: 1 }) || TERR_B.some(b => Math.abs(rr - b) < 1.6) || A.some(([a, b]) => Math.hypot(a - x, b - z) < 4.5) || Math.hypot(x - RISCO.cima[0], z - RISCO.cima[2]) < 6) continue; A.push([x, z, (rr > 125 ? 1.3 : .9) + r() * .9]); ocupa(x, z, 1.4); rectAdd({ x, z, ry: 0, w: 1.0, d: 1.0, arbol: 1 }) }
  const GA = [0, 1, 2].map(v => { const rr = rng(4710 + v), T = [], C = [], Hh = 2.6 + rr() * 1.2; T.push([tubo([[0, -.2, 0], [(rr() - .5) * .3, Hh * .4, (rr() - .5) * .3], [(rr() - .5) * .5, Hh * .8, (rr() - .5) * .5], [(rr() - .5) * .4, Hh, (rr() - .5) * .4]], .2, .08), TM()]);
    for (let k = 0; k < 4; k++) { const a = k / 4 * 6.283 + rr(), L = .8 + rr() * .7; T.push([tubo([[0, Hh * .7, 0], [Math.cos(a) * L * .5, Hh * .85, Math.sin(a) * L * .5], [Math.cos(a) * L, Hh + .3, Math.sin(a) * L]], .07, .03, 5, 5), TM()]) }
    for (let j = 0; j < 9; j++) { const a = rr() * 6.283, d = rr() * 1.1, s = .7 + rr() * .5; C.push([geoPiedra(4720 + v * 31 + j, 1, .8), TM(Math.cos(a) * d, Hh + .3 + rr() * .9, Math.sin(a) * d, 0, rr() * 6, 0, s, s * .85, s)]) }
    const gc = mergeG(C), pc = gc.attributes.position, uc = gc.attributes.uv; for (let i = 0; i < pc.count; i++) uc.setXY(i, pc.getX(i) / 1.4, (pc.getY(i) + pc.getZ(i)) / 1.4); return [mergeG(T), gc] });
  const ims = GA.map(([gt, gc]) => { const a = new THREE.InstancedMesh(gt, M_CORTEZA, A.length), b = new THREE.InstancedMesh(gc, M_COPA, A.length); a.count = b.count = 0; [a, b].forEach(m => { m.castShadow = m.receiveShadow = true; scene.add(m) }); return [a, b] }), cc = new THREE.Color();
  A.forEach(([x, z, s], i) => { const [a, b] = ims[i % 3], n = a.count++; b.count++; dummy.position.set(x, SUELO(x, z) - .05, z); dummy.rotation.set(0, r() * 6, 0); dummy.scale.set(s, s * (.9 + r() * .3), s); dummy.updateMatrix(); a.setMatrixAt(n, dummy.matrix); b.setMatrixAt(n, dummy.matrix); b.setColorAt(n, cc.set(["#7a9a4a", "#6a8a40", "#8aa656", "#5e8038", "#9aa458"][r() * 5 | 0])) }) }
const GEO_MATA_B = (() => { const r = rng(5001), pos = [], uv = [], idx = []; for (let b = 0; b < 6; b++) { const a = r() * 6.283, d = r() * .14, bx = Math.cos(a) * d, bz = Math.sin(a) * d, Hh = .22 + r() * .26, lean = (r() - .5) * .3, fa = r() * 6.283, wv = .028 + r() * .015, o = pos.length / 3;
    for (let k = 0; k <= 3; k++) { const s = k / 3, x = bx + s * s * lean * Hh * Math.cos(fa), y = s * Hh, z = bz + s * s * lean * Hh * Math.sin(fa), wd = wv * (1 - s * .85); pos.push(x - Math.sin(fa) * wd, y, z + Math.cos(fa) * wd, x + Math.sin(fa) * wd, y, z - Math.cos(fa) * wd); uv.push(0, s, 1, s) }
    for (let k = 0; k < 3; k++) { const i = o + k * 2; idx.push(i, i + 1, i + 2, i + 1, i + 3, i + 2) } }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const n = g.attributes.normal; for (let i = 0; i < n.count; i++) n.setXYZ(i, n.getX(i) * .3, 1, n.getZ(i) * .3); n.needsUpdate = true; g.normalizeNormals(); return g })();
const PASTO_B = (() => { const N = 22000, m = new THREE.InstancedMesh(GEO_MATA_B, new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .9, side: THREE.DoubleSide }), N), r = rng(7820), cc = new THREE.Color(); m.receiveShadow = true; m.castShadow = false; let n = 0;
  for (let k = 0; k < N * 5 && n < N; k++) { const ang = r() * 6.283, rr = 15 + Math.sqrt(r()) * 190, x = Math.cos(ang) * rr, z = Math.sin(ang) * rr; if (calleKB(x, z) > .05 || !libreEn(x, z, .25, { mc: -.4, zona: 1 }) || RISCO.camino.some(q => Math.abs(q[0] - x) < 1.4 && Math.abs(q[2] - z) < 1.4)) continue;
    const c0 = colorSueloB(x, z); if (rr < 124 && c0[1] < c0[0] * .95 && r() < .7) continue; const s = .55 + r() * .6; dummy.position.set(x, SUELO(x, z) - .02, z); dummy.rotation.set(0, r() * 6, 0); dummy.scale.set(s, s * (.7 + r() * .7), s); dummy.updateMatrix(); m.setMatrixAt(n, dummy.matrix);
    cc.setRGB(c0[0] * (.8 + r() * .25), c0[1] * (.9 + r() * .25), c0[2] * (.6 + r() * .2)); m.setColorAt(n, cc); n++ }
  m.count = n; scene.add(m); return m })();
const PASTO = PASTO_B;
{ const r = rng(7830), P = [], cc = new THREE.Color();
  for (let k = 0; k < 6000 && P.length < 1400; k++) { const ang = r() * 6.283, rr = 15 + Math.sqrt(r()) * 150, x = Math.cos(ang) * rr, z = Math.sin(ang) * rr, enc = calleKB(x, z); if (!libreEn(x, z, .3, { mc: -.3, zona: 1 }) || (enc > .3 && r() < .85)) continue; const s = .05 + r() * r() * (enc > .3 ? .1 : .3); P.push([x, SUELO(x, z) + s * .2, z, s * (1 + r() * .5), s * (.55 + r() * .3), s]) }
  const ms = GEO_PIEDRAS.map(g => { const m = new THREE.InstancedMesh(g, M_ROCA, Math.ceil(P.length / 3) + 2); m.castShadow = m.receiveShadow = true; m.count = 0; scene.add(m); return m });
  P.forEach(([x, y, z, sx, sy, sz], i) => { const m = ms[i % 3], n = m.count++; dummy.position.set(x, y, z); dummy.rotation.set((r() - .5) * .3, r() * 6, (r() - .5) * .3); dummy.scale.set(sx, sy, sz); dummy.updateMatrix(); m.setMatrixAt(n, dummy.matrix); m.setColorAt(n, cc.set(["#9a968a", "#86837a", "#aaa598", "#7a776e", "#a29a88"][r() * 5 | 0])) }) }
// ---------- afuera: pircas (muros bajos de piedra seca) entre las chacras y parvas de heno
{ const r = rng(7840), L = PB, pirca = (x0, z0, x1, z1) => { const Lw = Math.hypot(x1 - x0, z1 - z0), n = Math.ceil(Lw / 2.2); for (let k = 0; k < n; k++) { const x = lerp(x0, x1, (k + .5) / n), z = lerp(z0, z1, (k + .5) / n); if (riscoH(x, z) > 2) continue; L.add("muroT", uvMuro(new THREE.BoxGeometry(Lw / n + .05, .8 + r() * .2, .55), 3.2, r(), r()), TM(x, SUELO(x, z) + .3, z, 0, Math.atan2(x1 - x0, z1 - z0) + Math.PI / 2, 0)) } };
  for (const rr of [131, 150, 172, 196]) { const n = Math.ceil(Math.PI * 2 * rr / 6); for (let k = 0; k < n; k++) { if (r() < .12) continue; const a0 = k / n * Math.PI * 2, a1 = (k + 1) / n * Math.PI * 2; pirca(Math.cos(a0) * rr, Math.sin(a0) * rr, Math.cos(a1) * rr, Math.sin(a1) * rr) } }
  for (let k = 0; k < 44; k++) { const a = k / 44 * Math.PI * 2 + .03; if (r() < .25) continue; pirca(Math.cos(a) * 131, Math.sin(a) * 131, Math.cos(a) * 205, Math.sin(a) * 205) }
  for (let k = 0; k < 70; k++) { const a = r() * 6.283, rr = 135 + r() * 70, x = Math.cos(a) * rr, z = Math.sin(a) * rr; if (riscoH(x, z) > 2 || !libreEn(x, z, 2, { zona: 1 })) continue; const y = SUELO(x, z); L.add("saco", new THREE.CylinderGeometry(1.1, 1.3, 1.6, 12), TM(x, y + .8, z)); L.add("saco", new THREE.ConeGeometry(1.15, 1.2, 12), TM(x, y + 2.2, z)); ocupa(x, z, 1.5) } }
// ---------- las macetas (instanciadas): maceta de barro, mata verde y flores
{ const N = MACETAS_B.length, pot = new THREE.InstancedMesh(new THREE.LatheGeometry([[0, 0], [.07, 0], [.09, .14], [.1, .15], [.1, .17], [0, .17]].map(q => new THREE.Vector2(q[0], q[1])), 10), M_TERRACOTA, N), mata = new THREE.InstancedMesh(geoPiedra(7850, 1, .9).scale(.12, .1, .12).translate(0, .22, 0), new THREE.MeshStandardMaterial({ map: T_FOLLAJE.c, bumpMap: T_FOLLAJE.z, bumpScale: 4, roughness: .85 }), N),
    flor = new THREE.InstancedMesh(mergeG([0, 1, 2, 3, 4, 5].map(k => [new THREE.SphereGeometry(.028, 6, 4), TM(Math.cos(k * 1.05) * .07, .29 + (k % 2) * .03, Math.sin(k * 1.05) * .07)])), new THREE.MeshStandardMaterial({ roughness: .6 }), N), cc = new THREE.Color(), r = rng(7860);
  MACETAS_B.forEach(([x, y, z, s, ry], i) => { dummy.position.set(x, y, z); dummy.rotation.set(0, ry, 0); dummy.scale.setScalar(s); dummy.updateMatrix(); pot.setMatrixAt(i, dummy.matrix); mata.setMatrixAt(i, dummy.matrix); flor.setMatrixAt(i, dummy.matrix); mata.setColorAt(i, cc.set(["#6a9a48", "#5a8a40", "#7aa656"][r() * 3 | 0])); flor.setColorAt(i, cc.set(["#d83a4a", "#f0e0e8", "#e8b838", "#8a5ac0", "#f07a3a", "#ffffff"][r() * 6 | 0])) });
  [pot, mata, flor].forEach(m => { m.castShadow = true; m.receiveShadow = true; scene.add(m) }) }

// ---------- LUGARES PARA LA GENTE (las multitudes): [x, z] en el piso (sueloB da la altura)
const LUGARES_GENTE = (() => { const r = rng(7870), anillo = (r0, r1, n, evita = () => false) => { const L = []; for (let k = 0; k < n * 6 && L.length < n; k++) { const a = r() * 6.283, rr = r0 + r() * (r1 - r0), x = Math.cos(a) * rr, z = Math.sin(a) * rr; if (evita(x, z) || !libreEn(x, z, .35, { zona: 1 }) || L.some(([p, q]) => Math.hypot(p - x, q - z) < .8)) continue; L.push([+x.toFixed(2), +z.toFixed(2)]) } return L };
  const fueraAltar = (x, z) => Math.hypot(x - ALTAR.centro[0], z - ALTAR.centro[2]) < 3.4 || PUESTOS.some(p => Math.hypot(p.x - x, p.z - z) < 2.2);
  return { plaza: anillo(5.9, 13.6, 70, fueraAltar), mercado: PUESTOS.map(p => [+p.frente[0].toFixed(2), +p.frente[1].toFixed(2)]), puestos: PUESTOS.map(p => [+p.x.toFixed(2), +p.z.toFixed(2)]),
    altar: { centro: [ALTAR.centro[0], ALTAR.centro[2]], novio: ALTAR.novio, novia: ALTAR.novia, invitados: ALTAR.invitados },
    escuela: { pizarron: ESCUELA_B.pizarra.clone().multiply(TM(0, 1.55, .1)).elements.slice(12, 15), alumnos: [...Array(9)].map((_, i) => new THREE.Vector3((i % 3 - 1) * 1.7 + 1.2 + (i / 3 | 0) * .1, 0, 1.6 + (i / 3 | 0) * .75).applyMatrix4(ESCUELA_B.pizarra).toArray().filter((_, j) => j !== 1)), maestra: new THREE.Vector3(-1.9, 0, .8).applyMatrix4(ESCUELA_B.pizarra).toArray().filter((_, j) => j !== 1) },
    calleAncha: (() => { const L = []; for (let k = 0; k < 40; k++) { const a = -Math.PI / 2 + (k - 20) * .02, rr = TERR_B[0] + 3.2; L.push([+(Math.cos(a) * rr).toFixed(2), +(Math.sin(a) * rr).toFixed(2)]) } return L })(),
    tienda: [TI.P.puerta[0], TI.P.puerta[2]], trastienda: [[-1.6, -5.5], [.8, -5.5], [-1.6, -7.1], [.8, -7.1], [2.6, -6.4], [2.6, -8.4], [-2.6, -8.3]].map(([x, z]) => TI.W(x, 0, z)).map(p => [+p[0].toFixed(2), +p[2].toFixed(2)]),
    nell: [CASA_NELL_V.afuera[0], CASA_NELL_V.afuera[2]], risco: { pie: [RISCO.pie[0], RISCO.pie[2]], cima: [RISCO.cima[0], RISCO.cima[2]] } } })();

// ================= ADENTRO DE LA TIENDA DE SALLOW (local y trastienda). Coordenadas locales de la tienda (TI.at): origen al pie del frente,
// +z hacia la plaza; el local va de z = −0,3 a −3,45 (x ±2,5) y la trastienda de z = −3,9 a −10,2 (x ±4,3), alto 4,6.
// ---------- texturas: el libro (renglones de nombres a mano), el cartel, ladrillo refractario, brasas, cera derretida, telarañas
const T_LIBRO = tex(1024, 640, (g, w, h) => { const r = rng(7400); g.fillStyle = "#d8c8a0"; g.fillRect(0, 0, w, h); for (let k = 0; k < 40; k++) { const x = r() * w, y = r() * h, s = 20 + r() * 90, gr = g.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, "rgba(140,100,50,.25)"); gr.addColorStop(1, "rgba(140,100,50,0)"); g.fillStyle = gr; g.fillRect(x - s, y - s, 2 * s, 2 * s) }
  const sombra = g.createLinearGradient(w / 2 - 60, 0, w / 2 + 60, 0); sombra.addColorStop(0, "rgba(60,40,20,0)"); sombra.addColorStop(.5, "rgba(60,40,20,.55)"); sombra.addColorStop(1, "rgba(60,40,20,0)"); g.fillStyle = sombra; g.fillRect(w / 2 - 60, 0, 120, h);
  const N = ["Ada Merrow", "Tobias Fenn", "Lila Quarle", "Oswin Hale", "Bess Thornby", "Ivo Kettle", "Maud Penrose", "Silas Dunne", "Nell Ashby", "Corin Vale", "Edda Brisk", "Jory Lamb", "Hester Moss", "Pim Rowan", "Agnes Tull", "Wendel Crane", "Rosa Mill", "Aldo Finch", "Greta Hollis", "Tam Oakes", "Una Pell", "Basil Thorne"];
  g.strokeStyle = "rgba(120,140,170,.45)"; g.lineWidth = 1.5; for (const x0 of [40, w / 2 + 40]) for (let y = 70; y < h - 30; y += 26) { g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + w / 2 - 90, y); g.stroke() }
  g.strokeStyle = "rgba(170,60,50,.5)"; for (const x0 of [92, w / 2 + 92]) { g.beginPath(); g.moveTo(x0, 40); g.lineTo(x0, h - 20); g.stroke() }
  g.font = "italic 21px Georgia, serif"; g.fillStyle = "rgba(40,26,14,.88)"; let k = 0; for (const x0 of [40, w / 2 + 40]) for (let y = 66; y < h - 30; y += 26) { const n = N[(k * 7 + 3) % N.length]; g.fillText(String(1 + k).padStart(3, "0"), x0 + 4, y - 5); g.fillText(n, x0 + 60, y - 5); g.fillText(["— Mother's laugh", "— his wife", "— little brother", "— the dog Bram", "— first kiss", "— her father", "— the sea", "— sister"][k % 8], x0 + 250, y - 5);
    if (k % 3 === 1) { g.strokeStyle = "rgba(40,26,14,.7)"; g.beginPath(); g.moveTo(x0 + 58, y - 11); g.lineTo(x0 + 220, y - 9); g.stroke() } k++ }
  g.font = "bold 30px Georgia, serif"; g.fillStyle = "rgba(60,20,14,.9)"; g.fillText("RECEIVED", 70, 44); g.fillText("OWED", w / 2 + 70, 44) });
const T_CARTEL_S = tex(1024, 560, (g, w, h) => { const r = rng(7410); g.fillStyle = "#1e2420"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 70) { g.fillStyle = "rgba(0,0,0,.4)"; g.fillRect(0, y, w, 3) }
  for (let k = 0; k < 600; k++) { g.fillStyle = r() < .5 ? "rgba(0,0,0,.25)" : "rgba(180,170,140,.08)"; g.fillRect(r() * w, r() * h, 2 + r() * 30, 1 + r() * 2) }
  g.strokeStyle = "#8a7440"; g.lineWidth = 10; g.strokeRect(26, 26, w - 52, h - 52); g.font = "bold 190px Georgia, serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#b89a58"; g.fillText("SALLOW", w / 2, h * .38, w - 120);
  g.font = "bold 110px Georgia, serif"; g.fillText("· WAX ·", w / 2, h * .74); g.globalCompositeOperation = "destination-out"; for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(0,0,0,${.3 + r() * .5})`; g.beginPath(); g.arc(r() * w, r() * h, 1 + r() * 6, 0, 7); g.fill() } g.globalCompositeOperation = "destination-over"; g.fillStyle = "#1e2420"; g.fillRect(0, 0, w, h) });
const T_TELA_ARANA = tex(256, 256, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = "rgba(230,230,220,.55)"; g.lineWidth = 1.2; for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI / 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 250, Math.sin(a) * 250); g.stroke() } for (let rr = 20; rr < 250; rr += 18 + rr * .1) { g.beginPath(); for (let k = 0; k <= 9; k++) { const a = k / 9 * Math.PI / 2, q = rr * (1 - .08 * Math.sin(k * 2)); k ? g.lineTo(Math.cos(a) * q, Math.sin(a) * q) : g.moveTo(Math.cos(a) * q, Math.sin(a) * q) } g.stroke() } });
const T_BRASA = tex(256, 256, (g, w, h) => { const r = rng(7420); g.fillStyle = "#1a0602"; g.fillRect(0, 0, w, h); for (let k = 0; k < 160; k++) { const x = r() * w, y = r() * h, s = 6 + r() * 20, gr = g.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, r() < .5 ? "#ffd070" : "#ff7a20"); gr.addColorStop(.6, "rgba(200,50,10,.6)"); gr.addColorStop(1, "rgba(60,10,2,0)"); g.fillStyle = gr; g.fillRect(x - s, y - s, 2 * s, 2 * s) } });
const T_CERA_OLLA = tex(256, 256, (g, w, h) => { const r = rng(7430); g.fillStyle = "#c89a40"; g.fillRect(0, 0, w, h); for (let k = 0; k < 50; k++) { const x = r() * w, y = r() * h, s = 8 + r() * 26; g.strokeStyle = "rgba(255,230,160,.6)"; g.lineWidth = 2; g.beginPath(); g.arc(x, y, s, 0, 7); g.stroke(); g.fillStyle = "rgba(120,70,20,.3)"; g.beginPath(); g.arc(x + 2, y + 2, s * .8, 0, 7); g.fill() } });
const TIENDA_MATS = { madera: M_MADERA, maderaV: M_MADERA_V, hollin: M_HOLLIN, maderaN: M_MADERA_N, viga: M_VIGA, piz1: M_PIZ[1], vidrioC: M_VIDRIO_C, vidrio: M_VIDRIO, oscuro: M_OSCURO, hierro: M_HIERRO, hierroN: M_HIERRO_N, laton: M_LATON, piedraC: M_PIEDRA_C, cera: M_CERA, ceraV: M_CERA_V,
  lad: M_LAD[2], brasa: new THREE.MeshBasicMaterial({ map: T_BRASA, color: new THREE.Color().setRGB(2.2, 1.3, .8) }), ceraOlla: new THREE.MeshStandardMaterial({ map: T_CERA_OLLA, emissive: "#ff9030", emissiveMap: T_CERA_OLLA, emissiveIntensity: .55, roughness: .15, metalness: .1 }),
  libro: new THREE.MeshStandardMaterial({ map: T_LIBRO, roughness: .9 }), cuero: SM("#3a1e14", { roughness: .7 }), cartel: new THREE.MeshStandardMaterial({ map: T_CARTEL_S, roughness: .8, metalness: .1 }), tela: SM("#8a8070", { roughness: 1 }), soga: M_SOGA, saco: new THREE.MeshStandardMaterial({ color: "#a89878", bumpMap: T_TRAMA_D, bumpScale: 3, roughness: 1 }),
  barril: M_BARRIL, arana: new THREE.MeshBasicMaterial({ map: T_TELA_ARANA, transparent: true, depthWrite: false, side: THREE.DoubleSide, opacity: .8 }), hollinNegro: SM("#141210", { roughness: 1 }), papel: SM("#d8c8a8", { roughness: .95 }), tinta: SM("#101014", { roughness: .3 }) };
// ---------- FRASCOS (los recuerdos: un brillo pálido adentro) y TAPONES de cera, instanciados. FRASCOS_B: matrices; TAPONES_B / TAPONES_AG: matrices
const FRASCOS_B = [], TAPONES_B = [], TAPONES_AG = [];
const frasco = (M, h = .18, rr = .06) => FRASCOS_B.push(M.clone().multiply(TM(0, 0, 0, 0, hash2(FRASCOS_B.length, 3) * 6, 0, rr * 2, h, rr * 2)));
const tapon = (M, ag = false) => (ag ? TAPONES_AG : TAPONES_B).push(M.clone().multiply(TM(0, 0, 0, (hash2(TAPONES_B.length, 1) - .5) * .5, hash2(TAPONES_B.length, 2) * 6, (hash2(TAPONES_B.length, 4) - .5) * .5)));
const montonTapones = (M, n, rad = .08, ag = false) => { const r = rng(7440 + n + TAPONES_B.length); for (let k = 0; k < n; k++) { const a = r() * 6.283, d = Math.sqrt(r()) * rad, y = .012 + (1 - d / rad) * rad * .5 * r(); tapon(M.clone().multiply(TM(Math.cos(a) * d, y, Math.sin(a) * d, r() * 3, 0, r() * 3)), ag) } };
{ const L = L_TIENDA, at = TI.at, r = rng(7450), vel = (x, y, z, h = .2, gorda = false) => VELAS_B.push({ p: TI.W(x, y, z), h, g: 1, gorda });
  // chorreaduras de cera por todos lados: gotas largas que bajan de los alféizares, los estantes y la mesa
  const chorro = (x, y, z, largo, ry = 0) => { const g = new THREE.CapsuleGeometry(.012 + r() * .012, largo, 2, 5); L.add(r() < .5 ? "cera" : "ceraV", g, at(x, y - largo / 2, z, 0, ry, 0)); L.add("ceraV", new THREE.SphereGeometry(.025, 6, 4), at(x, y - largo - .01, z, 0, 0, 0, 1, 1.4, 1)) };
  const charco = (x, y, z, s = .3) => L.add(r() < .5 ? "cera" : "ceraV", new THREE.CylinderGeometry(s, s * 1.05, .012, 10), at(x, y + .006, z, 0, r() * 6, 0, 1, 1, .6 + r() * .5));
  // --- la vidriera: tres gradas con frascos y platitos de tapones
  const [vx0, vx1] = TI.VID; for (let k = 0; k < 3; k++) { const y = .75 + .05 + k * .52 + .03, z = -.45 - k * .12; for (let x = vx0 + .12; x < vx1 - .08; x += .15 + r() * .05) { if (r() < .2) { L.add("ceraV", new THREE.CylinderGeometry(.06, .05, .02, 10), at(x, y, z)); montonTapones(at(x, y + .02, z), 7, .05) } else frasco(at(x, y, z + (r() - .5) * .06), .14 + r() * .1, .045 + r() * .025) } }
  for (let k = 0; k < 10; k++) chorro(vx0 + r() * (vx1 - vx0), .74, .2, .1 + r() * .45);
  // --- el local: mostrador, estantes en las paredes (frascos, cajitas de tapones), velas colgadas, telarañas
  L.add("maderaN", new THREE.BoxGeometry(1.8, .95, .6), at(-.9, .2 + .475, -2.5)); L.add("maderaN", new THREE.BoxGeometry(1.95, .06, .72), at(-.9, 1.18, -2.5)); for (let k = 0; k < 4; k++) chorro(-1.7 + k * .45 + r() * .2, 1.15, -2.17, .2 + r() * .5);
  L.add("laton", new THREE.CylinderGeometry(.16, .16, .02, 16), at(-1.45, 1.22, -2.5)); L.add("laton", new THREE.CylinderGeometry(.015, .015, .4, 6), at(-1.45, 1.42, -2.5)); L.add("laton", new THREE.BoxGeometry(.5, .02, .02), at(-1.45, 1.62, -2.5)); for (const s of [-1, 1]) L.add("laton", new THREE.CylinderGeometry(.08, .06, .03, 10), at(-1.45 + s * .24, 1.5, -2.5));
  montonTapones(at(-.75, 1.21, -2.45), 26, .12); vel(-.25, 1.21, -2.6, .25, true); vel(-1.75, 1.21, -2.35, .12); charco(-.25, 1.21, -2.6, .1);
  const estante = (x0, x1, z, ry, y0, n, prof = .3) => { for (let k = 0; k < n; k++) { const y = y0 + k * .5, cx = (x0 + x1) / 2, Mx = at(0, 0, 0, 0, ry, 0); const P = (x, yy, zz) => at(0, 0, 0, 0, ry, 0).multiply(TM(x, yy, zz));
      L.add("maderaN", new THREE.BoxGeometry(x1 - x0, .04, prof), P(cx, y, z)); for (let x = x0 + .1; x < x1 - .06; x += .13 + r() * .06) { const q = r(); if (q < .45) frasco(P(x, y + .02, z + (r() - .5) * .08), .12 + r() * .12, .04 + r() * .025); else if (q < .7) { L.add("maderaN", RB1(.12, .07, .12, .01), P(x, y + .055, z)); montonTapones(P(x, y + .09, z), 4, .04) } else if (q < .8) { vel(...new THREE.Vector3(x, y + .02, z).applyMatrix4(new THREE.Matrix4().makeRotationY(ry)).toArray(), .06 + r() * .12) } }
      if (r() < .6) chorro(...new THREE.Vector3(x0 + r() * (x1 - x0), y, z + prof / 2).applyMatrix4(new THREE.Matrix4().makeRotationY(ry)).toArray(), .1 + r() * .3, ry) }
    for (const x of [x0 + .03, x1 - .03]) L.add("maderaN", new THREE.BoxGeometry(.05, n * .5 + .1, prof), at(0, 0, 0, 0, ry, 0).multiply(TM(x, y0 + n * .25 - .2, z))) };
  estante(.6, 3.3, -2.3, Math.PI / 2, .7, 5); estante(-3.3, -.4, -2.3, -Math.PI / 2, .7, 5);   // paredes del local (este y oeste)
  estante(-2.3, -.8, -3.4, 0, .9, 4, .24); estante(.8, 2.3, -3.4, 0, .9, 4, .24);           // a los lados de la puerta de atrás
  for (let k = 0; k < 6; k++) { const x = -1.8 + k * .7, z = -1.2 - (k % 2) * .9; for (let j = 0; j < 5; j++) { const xx = x + (j - 2) * .05, l = .5 + r() * .4; L.add("soga", new THREE.CylinderGeometry(.004, .004, l, 3), at(xx, HSt() - l / 2, z)); L.add(r() < .6 ? "cera" : "ceraV", new THREE.CylinderGeometry(.018, .02, .32, 6), at(xx, HSt() - l - .16, z)) } }
  function HSt() { return TI.HS - .02 }
  for (const [x, y, z, ry] of [[-2.45, 3.5, -.35, 0], [2.45, 3.5, -3.4, Math.PI], [-4.25, 4.5, -9.95, Math.PI / 2], [4.25, 4.5, -4.1, -Math.PI / 2], [-4.25, 4.5, -4.1, 0]]) L.add("arana", new THREE.PlaneGeometry(.9, .9), at(x, y - .3, z, 0, ry + Math.PI / 4, Math.PI / 4));
  // --- LA TRASTIENDA
  const ZB = TI.ZB, HT = TI.HT;
  // el fogón de ladrillo contra el fondo, con tres bocas de fuego y la campana de humo encima
  L.add("lad", uvMuro(new THREE.BoxGeometry(5.6, .8, 1.3), 1.6), at(-1.4, .6, ZB + .95)); L.add("piedraC", RB1(5.8, .1, 1.4, .02), at(-1.4, 1.03, ZB + .95));
  for (const x of [-3.1, -1.4, .3]) { L.add("oscuro", new THREE.PlaneGeometry(.7, .42), at(x, .55, ZB + 1.61)); L.add("brasa", new THREE.PlaneGeometry(.62, .3), at(x, .5, ZB + 1.6)); for (let k = 0; k < 6; k++) L.add("brasa", new THREE.DodecahedronGeometry(.06 + r() * .04, 0), at(x + (r() - .5) * .5, .32, ZB + 1.45 + r() * .1)); L.add("hierro", new THREE.BoxGeometry(.8, .05, .05), at(x, .79, ZB + 1.62)) }
  { const g = new THREE.CylinderGeometry(.7, 2.1, 1.6, 4, 1, true); g.rotateY(Math.PI / 4); L.add("hollin", uvMuro(g, 2), at(-1.4, 3.0, ZB + .9, 0, 0, 0, 1.55, 1, .62)); L.add("hollin", uvMuro(new THREE.BoxGeometry(1.4, 1.0, .9), 2), at(-1.4, 4.1, ZB + .75)) }
  // las ollas de hierro (cera hirviendo, con burbujas y cucharones)
  const OLLAS = [-3.1, -1.4, .3].map((x, i) => { const R = .5 - i * .04, H = .62; L.add("hierroN", new THREE.LatheGeometry([[0, 0], [R * .75, .02], [R, .2], [R * 1.02, H * .8], [R * .96, H], [R * 1.04, H + .03], [R * .9, H + .03], [R * .9, H - .05]].map(q => new THREE.Vector2(q[0], q[1])), 20), at(x, 1.08, ZB + .95));
    for (const s of [-1, 1]) L.add("hierroN", new THREE.TorusGeometry(.08, .018, 5, 10), at(x + s * (R + .05), 1.08 + H * .8, ZB + .95, 0, Math.PI / 2, 0));
    L.add("ceraOlla", new THREE.CircleGeometry(R * .9, 20), at(x, 1.08 + H - .1, ZB + .95, -Math.PI / 2)); for (let k = 0; k < 3; k++) chorro(x + (r() - .5) * R, 1.08 + H, ZB + .95 + R * .9, .15 + r() * .4);
    if (i !== 1) { const [g, m] = cilEntre([x + .1, 1.08 + H - .2, ZB + .95], [x + .5, 1.08 + H + .55, ZB + 1.35], .015, 5); L.add("maderaN", g, TI.MT.clone().multiply(m)); L.add("hierro", new THREE.SphereGeometry(.07, 8, 6, 0, 6.3, Math.PI / 2, Math.PI / 2), at(x + .1, 1.08 + H - .2, ZB + .95)) }
    return TI.W(x, 1.08 + H - .1, ZB + .95) });
  // chimenea del fogón: sale por el techo de la trastienda (humo)
  L.add("hollin", uvMuro(new THREE.BoxGeometry(1.0, 2.6, .8), 2.4), at(-1.4, HT + 1.1, ZB + .55)); for (const s of [-1, 1]) L.add("hierroN", new THREE.CylinderGeometry(.12, .14, .5, 10, 1, true), at(-1.4 + s * .22, HT + 2.6, ZB + .55)); HUMOS.push(new THREE.Vector3(...TI.W(-1.4, HT + 3.0, ZB + .55)));
  // mesas largas de trabajo (moldes, bloques de cera, cucharones, cuchillos, tapones)
  const mesa = (cx, cz, la, an, ry) => { const P = (x, y, z) => at(cx, 0, cz, 0, ry, 0).multiply(TM(x, y, z)); L.add("maderaN", new THREE.BoxGeometry(la, .09, an), P(0, .92, 0)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) L.add("maderaN", new THREE.BoxGeometry(.1, .88, .1), P(sx * (la / 2 - .12), .44, sz * (an / 2 - .1)));
    for (const sx of [-1, 1]) L.add("maderaN", new THREE.BoxGeometry(.06, .06, an - .2), P(sx * (la / 2 - .12), .2, 0)); L.add("maderaN", new THREE.BoxGeometry(la - .3, .06, .06), P(0, .2, 0));
    for (let x = -la / 2 + .4; x < la / 2 - .3; x += .55 + r() * .3) { const q = r(), zz = (r() - .5) * (an - .3);
      if (q < .3) { L.add("maderaN", new THREE.BoxGeometry(.5, .06, .32), P(x, .99, zz)); for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) { L.add("oscuro", new THREE.CircleGeometry(.022, 8), P(x - .2 + i * .08, 1.022, zz - .08 + j * .08, -Math.PI / 2)); if (r() < .5) tapon(P(x - .2 + i * .08, 1.03, zz - .08 + j * .08)) } }
      else if (q < .55) { for (let k = 0; k < 2 + r() * 4; k++) L.add(r() < .5 ? "cera" : "ceraV", RB1(.24, .1, .14, .02), P(x + (r() - .5) * .2, 1.01 + k * .1, zz, 0, r() * .4, 0)) }
      else if (q < .7) montonTapones(P(x, .965, zz), 30, .14);
      else if (q < .8) { L.add("hierro", new THREE.BoxGeometry(.28, .01, .04), P(x, .975, zz, 0, r(), 0)); L.add("maderaN", new THREE.BoxGeometry(.12, .025, .03), P(x + .18, .975, zz, 0, 0, 0)) }
      else if (q < .9) frasco(P(x, .965, zz), .2, .07);
      else { const p = new THREE.Vector3(x, .965, zz).applyMatrix4(at(cx, 0, cz, 0, ry, 0)); VELAS_B.push({ p: p.toArray(), h: .1 + r() * .25, g: 1, gorda: r() < .5 }) } }
    for (let k = 0; k < 6; k++) { const p = new THREE.Vector3(-la / 2 + r() * la, .92, an / 2).applyMatrix4(at(cx, 0, cz, 0, ry, 0)), [lx, , lz] = [p.x, p.y, p.z]; L.add("ceraV", new THREE.CapsuleGeometry(.014, .2 + r() * .4, 2, 5), new THREE.Matrix4().makeTranslation(p.x, p.y - .2, p.z)) } };
  mesa(-.4, -6.3, 5.0, 1.1, 0); mesa(3.45, -7.3, 4.2, .9, Math.PI / 2);
  // el escritorio de Sallow (contra la pared oeste): el cajón abierto con EL LIBRO y los tapones con agujerito
  { const P = (x, y, z, ...a) => at(-3.75, 0, -5.0).multiply(TM(x, y, z, ...a)); L.add("maderaN", new THREE.BoxGeometry(.75, .06, 1.5), P(0, .78, 0)); L.add("maderaN", new THREE.BoxGeometry(.7, .7, .45), P(0, .42, -.5)); for (const s of [-1, 1]) L.add("maderaN", new THREE.BoxGeometry(.08, .75, .08), P(-.3, .375, s * .68));
    L.add("maderaN", new THREE.BoxGeometry(.04, .74, 1.4), P(-.34, .4, 0));
    // el cajón (sale .42 hacia el este), con separadores
    const C = (x, y, z, ...a) => P(.42, .62, .25).multiply(TM(x, y, z, ...a)); L.add("maderaN", new THREE.BoxGeometry(.62, .02, .7), C(0, 0, 0)); for (const s of [-1, 1]) L.add("maderaN", new THREE.BoxGeometry(.62, .13, .02), C(0, .065, s * .34)); L.add("maderaN", new THREE.BoxGeometry(.02, .15, .7), C(.31, .065, 0)); L.add("maderaN", new THREE.BoxGeometry(.02, .13, .7), C(-.31, .065, 0)); L.add("laton", new THREE.TorusGeometry(.03, .006, 4, 10), C(.33, .07, 0, 0, Math.PI / 2, 0));
        // el libro abierto (tapas de cuero, páginas con renglones de nombres) en la mitad de atrás del cajón
    L.add("cuero", new THREE.BoxGeometry(.46, .025, .29), C(-.1, .02, 0)); { const g = new THREE.PlaneGeometry(.44, .27, 16, 2); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, .018 * Math.sin(Math.min(1, Math.abs(p.getX(i)) / .22) * Math.PI)); g.computeVertexNormals(); L.add("libro", g, C(-.1, .036, 0, -Math.PI / 2, 0, 0)) }
    // tapones con agujerito (de aguja) en los compartimientos de adelante
    for (let k = 0; k < 3; k++) montonTapones(C(.2, .012, -.24 + k * .24), 8, .05, true);
    L.add("hierro", new THREE.CylinderGeometry(.002, .002, .09, 4), C(.2, .03, .3, 0, 0, Math.PI / 2 - .2));   // la aguja
    // arriba del escritorio: tintero, pluma, papeles, una vela gorda
    L.add("tinta", new THREE.CylinderGeometry(.04, .045, .06, 10), P(.05, .84, -.45)); { const [g, m] = cilEntre([.05, .86, -.45], [.12, 1.08, -.3], .004, 4); L.add("papel", g, P(0, 0, 0).multiply(m)) }
    for (let k = 0; k < 4; k++) L.add("papel", new THREE.BoxGeometry(.21, .003, .3), P(.1 + (r() - .5) * .1, .812 + k * .003, .3 + (r() - .5) * .1, 0, (r() - .5) * .5, 0));
    VELAS_B.push({ p: new THREE.Vector3(.15, .81, -.1).applyMatrix4(P(0, 0, 0)).toArray(), h: .14, g: 1, gorda: true }); LUCES_PUNTOS.push([...new THREE.Vector3(.3, 1.3, 0).applyMatrix4(P(0, 0, 0)).toArray(), 2.5, "#ffb060", 5]);
    TI.P.cajon = new THREE.Vector3(0, .1, 0).applyMatrix4(C(0, 0, 0)).toArray(); TI.P.libro = new THREE.Vector3(0, .05, 0).applyMatrix4(C(-.1, 0, 0)).toArray(); TI.P.mesa = TI.W(-.4, .97, -6.3) }
  // estantes de frascos en la pared este de la trastienda (arriba de la mesa 2) y en la oeste
  estante(5.0, 9.6, -4.12, Math.PI / 2, 1.5, 5, .3); estante(-9.2, -5.6, -4.12, -Math.PI / 2, 1.3, 5, .3);
  // barriles de sebo, bolsas, cajones, moldes apilados, bloques de cera, baldes
  for (const [x, z] of [[3.6, -4.3], [-3.9, -8.3], [3.75, -9.75], [2.05, -9.75]]) barril(L, at(x, .2, z, 0, r() * 6, 0));
  for (let k = 0; k < 5; k++) L.add(r() < .5 ? "cera" : "ceraV", RB1(.36, .2, .26, .02), at(2.5 + (k % 3) * .4, .3 + (k / 3 | 0) * .2, -8.85, 0, r() * .3, 0));
  for (let k = 0; k < 4; k++) L.add("maderaN", new THREE.BoxGeometry(.6, .06, .36), at(-2.6, .23 + k * .07, -8.2, 0, (r() - .5) * .3, 0));
  for (let k = 0; k < 14; k++) charco(-4 + r() * 8, .2, -4.2 - r() * 5.6, .1 + r() * .35);
  // vigas con velas colgadas por la mecha y trapos, ganchos
  for (let b = 0; b < 4; b++) for (let k = 0; k < 9; k++) { const x = -3.6 + k * .9 + (r() - .5) * .2, z = -4.5 - b * 1.1 * 1 - .0, l = .3 + r() * .5; L.add("soga", new THREE.CylinderGeometry(.004, .004, l, 3), at(x, HT - .26 - l / 2, z)); L.add(r() < .5 ? "cera" : "ceraV", new THREE.CylinderGeometry(.02, .022, .36, 6), at(x, HT - .26 - l - .18, z)) }
  // ventanita alta del oeste (rayo de luna) y los puntos de la trastienda
  L.add("vidrio", new THREE.PlaneGeometry(1.0, .9), at(-4.42, 3.35, -6.4, 0, Math.PI / 2, 0)); for (const yy of [2.9, 3.8]) L.add("maderaN", new THREE.BoxGeometry(.3, .08, 1.08), at(-4.45, yy, -6.4));
  TI.P.olla = OLLAS[1]; TI.OLLAS = OLLAS;
  // afuera: velas derretidas por todo el frente, chorreaduras en la fachada debajo de cada ventana, el cartel
  for (let k = 0; k < 16; k++) chorro(-2.6 + r() * 5.2, .75 + r() * 2, .02, .2 + r() * .7);
  L.add("cartel", new THREE.BoxGeometry(1.15, .62, .05), TI.CARTEL); L.add("maderaN", new THREE.BoxGeometry(1.25, .08, .07), TI.CARTEL.clone().multiply(TM(0, .35, 0)));
  for (let k = 0; k < 8; k++) { const x = -2.4 + r() * 1.1; VELAS_B.push({ p: TI.W(x, .12, .4 + r() * .6), h: .05 + r() * .25, g: 1, gorda: r() < .4 }) }
  // luces puntuales sugeridas (el fuego del fogón, las velas del local, el cartel)
  LUCES_PUNTOS.push([...TI.W(-1.4, 1.0, ZB + 2.0), 8, "#ff8a3a", 9], [...TI.W(-.4, 1.6, -6.3), 3.5, "#ffb060", 7], [...TI.W(-1.0, 2.0, -2.0), 3, "#ffb060", 6], [...TI.W(0, 1.2, 1.0), 2, "#ffb060", 6]);
}
// ---------- los frascos y los tapones (instanciados)
const FRASCOS_M = (() => { const N = FRASCOS_B.length, g = new THREE.LatheGeometry([[0, 0], [.42, 0], [.5, .06], [.5, .78], [.38, .86], [.3, .9], [.3, .98], [0, .98]].map(q => new THREE.Vector2(q[0], q[1])), 12),
    vid = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({ color: "#a8bcb4", roughness: .08, metalness: .15, transparent: true, opacity: .38, depthWrite: false }), N),
    tapa = new THREE.InstancedMesh(new THREE.CylinderGeometry(.33, .33, .1, 10).translate(0, 1.0, 0), new THREE.MeshStandardMaterial({ color: "#c8b078", roughness: .6 }), N),
    luz = new THREE.InstancedMesh(new THREE.SphereGeometry(.26, 10, 8).translate(0, .42, 0), new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(1.5, 1.75, 1.6), transparent: true, opacity: .65, depthWrite: false }), N);
  const halo = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), M_HALO_B("#c8f0e0", .5), N), cc = new THREE.Color();
  FRASCOS_B.forEach((M, i) => { vid.setMatrixAt(i, M); tapa.setMatrixAt(i, M); luz.setMatrixAt(i, M); const p = new THREE.Vector3(0, .42, 0).applyMatrix4(M); dummy.position.copy(p); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(.22); dummy.updateMatrix(); halo.setMatrixAt(i, dummy.matrix); luz.setColorAt(i, cc.setHSL(.38 + hash2(i, 9) * .14, .35, .55 + hash2(i, 8) * .2)) });
  vid.renderOrder = 3; luz.renderOrder = 2; halo.renderOrder = 6; [vid, tapa, luz, halo].forEach(m => { m.castShadow = false; m.frustumCulled = false; scene.add(m) }); return { vid, tapa, luz, halo } })();
const TAPONES_M = (() => { const geo = ag => { const g = mergeG([[new THREE.CylinderGeometry(.5, .42, .9, 8), TM(0, .45, 0)], [new THREE.SphereGeometry(.5, 8, 4, 0, 6.3, 0, Math.PI / 2), TM(0, .9, 0, 0, 0, 0, 1, .6, 1)]]), p = g.attributes.position, c = new Float32Array(p.count * 3);
      for (let i = 0; i < p.count; i++) { const hole = ag && p.getY(i) > 1.1 && Math.hypot(p.getX(i), p.getZ(i)) < .2; c[i * 3] = hole ? .05 : 1; c[i * 3 + 1] = hole ? .04 : 1; c[i * 3 + 2] = hole ? .03 : 1 } g.setAttribute("color", new THREE.BufferAttribute(c, 3)); return g };
  const mat = new THREE.MeshStandardMaterial({ color: "#efe0b0", roughness: .45, vertexColors: true, emissive: "#3a2808", emissiveIntensity: .2 }), out = [];
  for (const [L, ag] of [[TAPONES_B, false], [TAPONES_AG, true]]) { const m = new THREE.InstancedMesh(geo(ag), mat, Math.max(1, L.length)); m.count = L.length; L.forEach((M, i) => { m.setMatrixAt(i, M.clone().multiply(TM(0, 0, 0, 0, 0, 0, ag ? .026 : .018, ag ? .03 : .02, ag ? .026 : .018))) }); m.castShadow = true; m.frustumCulled = false; scene.add(m); out.push(m) } return out })();
// ---------- vapor de las ollas y rayo de luna por la ventanita (los anima ollaVapor y el clima)
const RAYO_TIENDA = (() => { const g = new THREE.CylinderGeometry(.5, 1.4, 5, 4, 1, true); g.translate(0, -2.5, 0); g.rotateY(Math.PI / 4); const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: "#7a9ad0", transparent: true, opacity: .07, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  m.applyMatrix4(TI.at(-4.3, 3.35, -6.4, 0, 0, -.75)); scene.add(m); return m })();

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
// vapor de las ollas de la trastienda (ollaVapor)
const VAPOR = crearHumo(TI.OLLAS.flatMap(p => [0, 1, 2, 3].map(k => [p[0] + (k % 2 - .5) * .3, p[1] + .05, p[2] + ((k >> 1) - .5) * .3])), { per: 14, sube: 1.9, tam: .7, vel: .32, op: .2, col: "#e8e4d8", map: GLOW }); VAPOR.U.uViento.value.set(0, .15);
// ollaVapor(t, u): vapor de las ollas (u = cuánto: 0 nada, 1 normal, 2 mucho) y burbujas en la cera
function ollaVapor(t, u = 1) { VAPOR.U.uT.value = t; VAPOR.U.uOp.value = .4 * u; VAPOR.m.visible = u > 0; TIENDA_MATS.ceraOlla.emissiveIntensity = .5 + .12 * Math.sin(t * 5) + .08 * Math.sin(t * 13.7); if (TIENDA_MATS.ceraOlla.map) TIENDA_MATS.ceraOlla.map.offset.set(Math.sin(t * .3) * .05, t * .02) }
// polvo en el aire: motas alrededor de la cámara (caja de 28 m que se repite), brillan contra la luz
const POLVO_B = (() => { const N = 5000, r = rng(7600), pos = new Float32Array(N * 3); for (let i = 0; i < N * 3; i++) pos[i] = r() * 28;
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); const U = { uT: { value: 0 }, uCam: { value: new THREE.Vector3() }, uI: { value: .5 }, uCol: { value: new THREE.Color("#fff0d0") }, uH: { value: H * .5 }, map: { value: GLOW } };
  const m = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `uniform float uT, uH; uniform vec3 uCam; varying float vA; void main(){ vec3 b = position + vec3(sin(uT * .13 + position.y) * 1.5 + uT * .12, sin(uT * .09 + position.x) * 1.2 - uT * .05, cos(uT * .11 + position.z) * 1.5);
      vec3 p = uCam + mod(b - uCam + 14., 28.) - 14.; vec4 mv = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mv; float d = max(.2, -mv.z); gl_PointSize = clamp(.012 * projectionMatrix[1][1] * uH / d, 1., 4.);
      vA = smoothstep(14., 6., length(p - uCam)) * smoothstep(.3, 1.2, d) * (.5 + .5 * sin(uT * 2. + position.x * 7.)); }`,
    fragmentShader: `uniform sampler2D map; uniform vec3 uCol; uniform float uI; varying float vA; void main(){ float a = texture2D(map, gl_PointCoord).a; gl_FragColor = vec4(uCol * a * vA * uI, 1.); }` }));
  m.frustumCulled = false; m.renderOrder = 7; scene.add(m); return { m, U } })();
// niebla baja (clima sallow): bancos de niebla a ras del piso alrededor de la tienda y la plaza, que se mueven despacio
const NIEBLA_B = (() => { const N = 420, r = rng(7610), m = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({ uniforms: { map: { value: GLOW }, uT: VELA_U.uT, uCol: { value: new THREE.Color() }, uOp: { value: 0 }, uFogD: VELA_U.uFogD }, transparent: true, depthWrite: false,
    vertexShader: `uniform float uT; varying vec2 vUv; varying float vA; void main(){ vUv = uv; vec4 c = modelMatrix * instanceMatrix * vec4(0., 0., 0., 1.); float s = length(instanceMatrix[0].xyz); float ph = c.x * .37 + c.z * .21;
      c.x += sin(uT * .05 + ph) * 3.; c.z += cos(uT * .04 + ph) * 2.; vec4 mv = viewMatrix * c; mv.xy += position.xy * vec2(s, s * .45); gl_Position = projectionMatrix * mv; float d = -mv.z; vA = smoothstep(1.5, 7., d); }`,
    fragmentShader: `uniform sampler2D map; uniform vec3 uCol; uniform float uOp; varying vec2 vUv; varying float vA; void main(){ float a = texture2D(map, vUv).a; gl_FragColor = vec4(uCol, a * a * uOp * vA); }` }), N);
  for (let i = 0; i < N; i++) { const a = r() * 6.283, d = Math.sqrt(r()) * 70, x = Math.cos(a) * d * .9, z = TIENDA[1] * .5 + Math.sin(a) * d, s = 5 + r() * 9; dummy.position.set(x, sueloB(x, z) + .5 + r() * 1.3, z); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(s); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix) }
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
const LUNA_B = (() => { const G = new THREE.Group(), d = new THREE.Mesh(new THREE.CircleGeometry(11, 32), new THREE.MeshBasicMaterial({ map: T_LUNA, fog: false, color: new THREE.Color().setRGB(1.6, 1.65, 1.8) })), h = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#8aa8e8", transparent: true, opacity: .55, fog: false, depthWrite: false, blending: THREE.AdditiveBlending }));
  h.scale.setScalar(110); G.add(h, d); G.visible = false; G.renderOrder = -.4; scene.add(G); return { G, d, h } })();
const SOL_DISCO = (() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#fff0d0", transparent: true, opacity: 1, fog: false, depthWrite: false, blending: THREE.AdditiveBlending })); s.visible = false; scene.add(s); return s })();
// polillas alrededor de las velas de la tienda y de algunos faroles; moscas en el clima sallow (en CPU: pocas)
const POLILLAS = (() => { const N = 140, geo = mergeG([[new THREE.PlaneGeometry(.035, .028), TM(.018, 0, 0, 0, 0, .3)], [new THREE.PlaneGeometry(.035, .028), TM(-.018, 0, 0, 0, 0, -.3)]]), m = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color: "#c8b89a", roughness: 1, side: THREE.DoubleSide, emissive: "#3a2a10", emissiveIntensity: .4 }), N);
  const r = rng(7640), C = VELAS_B.filter(v => v.g === 1 || v.g === 4).filter((_, i) => i % 2 === 0), P = Array.from({ length: N }, (_, i) => { const v = C[(r() * C.length) | 0] || { p: [0, 1, 0] }; return { c: [v.p[0], v.p[1] + .25 + r() * .3, v.p[2]], rad: .15 + r() * .5, w: (r() < .5 ? -1 : 1) * (2 + r() * 3), ph: r() * 6.28, mosca: i > 90 } });
  m.frustumCulled = false; m.castShadow = false; scene.add(m); return { m, P } })();
function atmosfera(t, A) { const cp = cam.position;
  CASA_MATS.luz.emissiveIntensity = .25 + 1.3 * Math.min(1.2, A.ventanas ?? .5);
  HUMO_CH.U.uT.value = t; HUMO_CH.U.uCol.value.set(A.humo || "#aaaaaa"); HUMO_CH.U.uOp.value = A.niebla ? .3 : .45;
  POLVO_B.U.uT.value = t; POLVO_B.U.uCam.value.copy(cp); POLVO_B.U.uI.value = (A.polvo ?? .5) * (A.cielo === 2 ? .35 : A.cielo === 3 ? .45 : .9); POLVO_B.U.uCol.value.set(A.cielo === 2 ? "#a8b8e0" : A.cielo === 3 ? "#c8d0c0" : "#fff0d0");
  NIEBLA_B.visible = (A.niebla || 0) > 0; NIEBLA_B.material.uniforms.uOp.value = .42 * (A.niebla || 0); NIEBLA_B.material.uniforms.uCol.value.copy(scene.fog.color).multiplyScalar(1.05);
  ESTRELLAS_B.visible = (A.estrellas || 0) > 0; ESTRELLAS_B.position.copy(cp);
  const d = SOL.dir || A.sol || [0, 1, 0], l = Math.hypot(...d); LUNA_B.G.visible = (A.luna || 0) > 0; if (LUNA_B.G.visible) { LUNA_B.G.position.set(cp.x + d[0] / l * 400, cp.y + d[1] / l * 400, cp.z + d[2] / l * 400); LUNA_B.d.lookAt(cp) }
  SOL_DISCO.visible = A.cielo === 0 || A.cielo === 1; if (SOL_DISCO.visible) { SOL_DISCO.position.set(cp.x + d[0] / l * 400, cp.y + d[1] / l * 400, cp.z + d[2] / l * 400); SOL_DISCO.scale.setScalar(A.cielo === 1 ? 160 : 70); SOL_DISCO.material.color.set(A.cielo === 1 ? "#ffb070" : "#fff4e0") }
  RAYO_TIENDA.visible = A.cielo === 2 || A.cielo === 3; RAYO_TIENDA.material.opacity = A.cielo === 2 ? .09 : .05;
  const mos = A.niebla > 0; POLILLAS.P.forEach((q, i) => { const a = t * q.w + q.ph, rr = q.rad * (1 + .3 * Math.sin(t * 1.7 + q.ph)), on = !q.mosca || mos;
    dummy.position.set(q.c[0] + Math.cos(a) * rr, q.c[1] + Math.sin(t * 2.3 + q.ph) * .15 + (q.mosca ? -.3 : 0), q.c[2] + Math.sin(a) * rr); dummy.rotation.set(0, -a, 0); const f = .4 + .6 * Math.abs(Math.sin(t * 40 + i)); dummy.scale.set(on ? (q.mosca ? .4 : 1) * f + .2 : 0, on ? 1 : 0, on ? (q.mosca ? .5 : 1) : 0); dummy.updateMatrix(); POLILLAS.m.setMatrixAt(i, dummy.matrix) });
  POLILLAS.m.instanceMatrix.needsUpdate = true; POLILLAS.m.material.color.set(mos ? "#2a2622" : "#c8b89a") }

// ================= todo junto
PB.fin(scene, PB_M); { const ms = PBV.fin(scene, PBV_M); Object.values(ms).forEach(m => { m.castShadow = true }) }
const TIENDA_M = L_TIENDA.fin(scene, TIENDA_MATS); ["vidrioC", "vidrio", "oscuro", "brasa", "ceraOlla", "frascoLuz"].forEach(k => { if (TIENDA_M[k]) TIENDA_M[k].castShadow = false });
velasArmar();

// ================= LOS CLIMAS DE LUZ. Las escenas hacen una vez Object.assign(ENV, ENV_CAMPANA_CIUDAD) y después setEnv(nombre).
// Además de lo del motor (top, hor, fog, hemi, hemiG, sun, sunCol, exp, grade) cada clima trae: sol (dirección hacia el sol o la luna),
// sombra (radio de la caja de sombras), velas (brillo de las llamas y halos), ventanas (brillo de las ventanas con vela), tiembla (cuánto
// tiemblan las llamas), estrellas, luna, niebla (niebla baja espesa), polvo (motas en el aire), humo (color del humo), luces (luces puntuales)
const ENV_CAMPANA_CIUDAD = {
  // sol alto y duro (≈ 48°), cielo azul con bruma; sombras duras y largas hacia el noreste
  mediodia: { top: "#3f7cc8", hor: "#c6d6e0", fog: .0034, hemi: 1.05, hemiG: "#7a6a52", sun: 3.9, sunCol: "#fff3de", exp: 1.12, grade: ["#fff4e0", .03], sol: [-.55, .8, .5], sombra: 95,
    velas: .35, ventanas: .1, tiembla: .8, estrellas: 0, luna: 0, niebla: 0, polvo: .55, humo: "#b8b4aa", luces: .15, cielo: 0 },
  // sol bajo naranja del oeste, cielo dorado-rosa, bruma cálida, sombras larguísimas
  atardecer: { top: "#4e5a92", hor: "#f2a878", fog: .0045, hemi: .8, hemiG: "#5a3a28", sun: 3.4, sunCol: "#ff9a52", exp: 1.22, grade: ["#ff9850", .09], sol: [-1, .2, .32], sombra: 120,
    velas: .75, ventanas: .65, tiembla: .9, estrellas: 0, luna: 0, niebla: 0, polvo: .9, humo: "#b89a8a", luces: .55, cielo: 1 },
  // luna fría azul, cielo oscuro estrellado; miles de velas cálidas en las ventanas y faroles
  noche: { top: "#04081a", hor: "#18223c", fog: .0062, hemi: .32, hemiG: "#120e0a", sun: .7, sunCol: "#8eaaf0", exp: 1.55, grade: ["#3a5aa0", .07], sol: [.42, .78, -.46], sombra: 95,
    velas: 1.5, ventanas: 1.6, tiembla: 1, estrellas: 1, luna: 1, niebla: 0, polvo: .3, humo: "#4a5266", luces: 1.6, cielo: 2 },
  // sombrío (cerca de Sallow y su tienda): luz fría verdosa-gris, casi sin sol, niebla baja espesa, velas que tiemblan, moscas
  sallow: { top: "#2e3834", hor: "#56605a", fog: .021, hemi: .5, hemiG: "#22241e", sun: .28, sunCol: "#b0c4b4", exp: 1.3, grade: ["#5a8a6a", .12], sol: [-.25, 1, .35], sombra: 60,
    velas: 1.0, ventanas: .35, tiembla: 2.2, estrellas: 0, luna: 0, niebla: 1, polvo: 1, humo: "#6a706a", luces: .8, cielo: 3 } };
const ENV_CIELO_PUEBLO = ENV_CAMPANA_CIUDAD;   // compatibilidad con escenas viejas
// el «sol» (luz direccional): las escenas pueden mover el centro de las sombras (SOL.x, SOL.z, SOL.r) y la dirección (SOL.dir = [x, y, z] hacia la luz)
const SOL = { x: 0, z: 0, r: null, dir: null };
const AMB = { t: 0, cam: [0, 0, 0] };
function ambiente(t) { const A = ENV[ENVNOW] || {}, d = SOL.dir || A.sol || [-.4, 1, .4], l = Math.hypot(d[0], d[1], d[2]), cy = SUELO(SOL.x, SOL.z), R0 = SOL.r || A.sombra || 90; AMB.t = t; AMB.cam = [cam.position.x, cam.position.y, cam.position.z];
  sun.position.set(SOL.x + d[0] / l * 160, cy + d[1] / l * 160, SOL.z + d[2] / l * 160); sun.target.position.set(SOL.x, cy, SOL.z); sun.target.updateMatrixWorld();
  { const c = sun.shadow.camera; if (c.right !== R0 || c.far !== 360) { c.left = -R0; c.right = R0; c.top = R0; c.bottom = -R0; c.near = 1; c.far = 360; c.updateProjectionMatrix() } }
  VIENTO.value = t; VELA_U.uT.value = t; VELA_U.uTiem.value = A.tiembla ?? 1; VELA_U.uHalo.value = (A.velas ?? 1) ** 2 * .42; VELA_U.uFogD.value = scene.fog.density;
  M_LLAMA.color.setRGB(3.2, 2.1, .9).multiplyScalar(.45 + .55 * Math.min(1.4, A.velas ?? 1));
  M_VENTANA.emissiveIntensity = (A.ventanas ?? .3) * (1 + .05 * Math.sin(t * 7.3) + .03 * Math.sin(t * 13.1));
  if (typeof atmosfera === "function") atmosfera(t, A) }
// deja todo en reposo (llamar al empezar cada cuadro, antes de ambiente): velas derechas, sol en el centro
function mundoReset() { velasHacia(null); SOL.x = 0; SOL.z = 0; SOL.r = null; SOL.dir = null }
mundoReset();

// ================= API para las escenas
// tiendaInterior() → puntos útiles de la tienda de Sallow ([x, y, z] de mundo): puerta (afuera, al pie del escalón), vidriera (afuera, frente al
// vidrio), local (centro del local), interior (centro de la trastienda, al piso), olla (boca de la olla del medio), cajon (el cajón abierto),
// libro (el libro abierto adentro del cajón), mesa (mesa larga, arriba), frascos (estante de frascos de la trastienda), cartel
const tiendaInterior = () => ({ ...TI.P });

// ---------- compatibilidad con las escenas y el elenco viejos (el pueblo del cielo): no hacen nada
const POSTES = [], POSTE_MI = 0, POSTE_9T = 0, POSTE_9L = 0, CASILLAS = [{ x: 0, z: 0, puerta: [0, 0, 0], cunas: [] }];
const POSTE_TOP = () => [0, 0, 0], POSTE_BASE = () => [0, 0, 0], postePeldano = () => [0, 0, 0];
const posteBaja = () => { }, posteGrasa = () => { }, manivelaGiro = () => { }, manivelaRota = () => { }, techosRajan = () => { }, tannerEstado = () => { }, tannerAltura = () => 0, poste9Corte = () => { },
  callePolvo = () => { }, escaleraKell = () => { }, campana = () => { }, barriletes = () => { }, puebloTapaPrueba = () => { }, veleta = () => { }, cadenasRotas = () => { }, techoPanaderia = () => { }, humoInclinacion = () => { }, tormenta = () => { };
function vientoFuerza(f) { RAFAGA.value = .35 * Math.max(0, f) }
const VELETA_W = () => [0, 0, 0], TECHO_W = () => [0, 0, 0], CASAS_V = CASAS_P, MI_CASA = CASA_NELL_B.C, KITE_MANOS = [], ESCALERA_TOP = [0, 0, 0], ENV_VIENTO = ENV_CAMPANA_CIUDAD;
const PUNTOS = { sopa: [0, 0], boda: [0, 0], bebe: [0, 0, 0] };
