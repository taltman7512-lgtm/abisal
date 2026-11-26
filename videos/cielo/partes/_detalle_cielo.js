// ================= «WE HOLD UP THE SKY»: detalle del pueblo (utilería, casillas de la manivela, campana, Tanner aplastada, jardines de la Loma,
// escalera de Kell, barriletes), animaciones (manivela rota, techos que se rajan, polvillo, Tanner que se aplasta) y la luz bajo la tapa =================
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
const PB = lote(), PBV = lote(), PBT = lote();   // utilería fija · ropa tendida (brisa) · utilería de Tanner (se aplasta)
const PB_M = { madera: M_MADERA, maderaV: M_MADERA_V, viga: M_VIGA, hierro: M_HIERRO, hierroO: M_HIERRO_O, hierroN: M_HIERRO_N, soga: M_SOGA, piedra: M_ROCA_G, piedraC: M_PIEDRA_C, zocalo: M_ZOCALO, barril: M_BARRIL, oscuro: M_OSCURO, terracota: M_TERRACOTA, chapa: M_CHAPA, bronce: M_BRONCE, grasa: M_GRASA, laton: M_LATON, marmol: M_MARMOL, seto: M_SETO, interior: M_INTERIOR, blanco: M_BLANCO_P, sillarC: M_SILLAR_C,
  luz: CASA_MATS.luz, tela: SM("#efe9dc", { roughness: .9 }), verde: SM("#4e7032", { roughness: .8 }), cuero: SM("#5a3e2a", { roughness: .85 }), piel: SM("#e8b898", { roughness: .7 }), tierra: SM("#5a4632", { roughness: 1 }), agua: new THREE.MeshStandardMaterial({ color: "#5a7a8a", roughness: .08, metalness: .3, envMap: ENV_METAL_P, envMapIntensity: 1 }),
  saco: new THREE.MeshStandardMaterial({ color: "#c8b898", bumpMap: T_TRAMA_D, bumpScale: 3, roughness: 1 }), cajon: new THREE.MeshStandardMaterial({ map: T_TABLA_N.c, bumpMap: T_TABLA_N.z, bumpScale: 3, roughness: .9, color: "#b89a70" }) };
M_PUERTA.forEach((m, i) => PB_M["col" + i] = m); ["#f4f0e0", "#e8c838", "#8a6ab8", "#d84a6a", "#f0a040"].forEach((c, i) => PB_M["flor" + i] = SM(c, { roughness: .6 }));
const PBV_M = {}; M_ROPA.forEach((m, i) => PBV_M["ropa" + i] = m);
const PBT_M = Object.fromEntries(Object.entries(PB_M).map(([k, m]) => [k, m.isMeshBasicMaterial ? m : aplastable(m)])); M_ROPA_T.forEach((m, i) => PBT_M["ropa" + i] = aplastable(m));

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

// ---------- las chimeneas de nuestra calle (van aparte: techosRajan las inclina)
const CHIMS = TECHOS_MIOS.filter(C => C.chimG).map((C, k) => { const G = new THREE.Group(); G.position.copy(C.chimG.base); scene.add(G); C.chimG.L.fin(G, CASA_MATS); const r = rng(5900 + k);
  // se inclina hacia la calle o hacia un costado, con un poco de giro; empieza a distintas alturas de u
  const lado = new THREE.Vector3(Math.sin(C.ry) * (r() < .6 ? 1 : 0) + (r() - .5), 0, Math.cos(C.ry) * (r() < .6 ? 1 : 0) + (r() - .5)).normalize(), eje = new THREE.Vector3(lado.z, 0, -lado.x);
  return { G, C, eje, max: .16 + r() * .32, d0: r() * .5, sube: r() * .3 } });

// ---------- LA CASILLA DE LA MANIVELA («crank house»): tablas, puerta abierta, adentro tres cunas con bebés envueltos y un farolito (todo cálido).
// Una por calle, al norte del poste mirando al poste. CASILLAS[i] = { x, z, puerta: [x, y, z] (centro del vano), cunas: [[x, y, z] …] }
const T_CARTEL_C = tex(512, 192, (g, w, h) => { const r = rng(5920); g.fillStyle = "#6a4a2e"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 48) { g.fillStyle = rgbj("#7a5636", r, 20); g.fillRect(0, y, w, 45); g.fillStyle = "rgba(30,18,10,.6)"; g.fillRect(0, y + 45, w, 3) }
  g.fillStyle = "#efe6cc"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = "900 62px Georgia, serif"; g.fillText("CRANK HOUSE", w / 2, 66); g.font = "italic 700 46px Georgia, serif"; g.fillText("hush · babies sleeping", w / 2, 140);
  g.globalCompositeOperation = "destination-out"; for (let k = 0; k < 400; k++) { g.fillStyle = `rgba(0,0,0,${.2 + r() * .5})`; g.fillRect(r() * w, r() * h, 2 + r() * 14, 1 + r() * 3) } g.globalCompositeOperation = "source-over" });
const M_CARTEL_C = new THREE.MeshStandardMaterial({ map: T_CARTEL_C, roughness: .85 });
const CASILLAS = [];
function casilla(L, P, seed, cartel = true) { const r = rng(seed), x = P.x, z = P.z - 6.3, y = SUELO(x, z), M = TM(x, y, z, 0, 0, 0), at = (...a) => M.clone().multiply(TM(...a)), W = 3.4, D = 2.8, H = 2.45;
  // patas de piedra, piso, paredes de tablas (forro interior cálido), vano de la puerta
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) L.add("piedra", GEO_PIEDRAS[1], at(sx * (W / 2 - .2), .08, sz * (D / 2 - .2), 0, r() * 6, 0, .3, .2, .3));
  L.add("maderaV", new THREE.BoxGeometry(W, .14, D), at(0, .24, 0)); L.add("interior", new THREE.BoxGeometry(W - .2, .02, D - .2), at(0, .32, 0));
  const pared = (w, hh, M2) => { L.add("maderaV", new THREE.BoxGeometry(w, hh, .07), M2.clone().multiply(TM(0, hh / 2, .035))); L.add("interior", new THREE.BoxGeometry(w - .02, hh - .02, .02), M2.clone().multiply(TM(0, hh / 2, -.01))) };
  pared(W, H, at(0, .3, -D / 2 + .07)); pared(D - .14, H, at(-W / 2 + .07, .3, 0, 0, -Math.PI / 2, 0)); pared(D - .14, H, at(W / 2 - .07, .3, 0, 0, Math.PI / 2, 0));
  pared(1.2, H, at(-1.1, .3, D / 2 - .07, 0, Math.PI, 0)); pared(1.2, H, at(1.1, .3, D / 2 - .07, 0, Math.PI, 0)); pared(1.0, .42, at(0, .3 + 2.03, D / 2 - .07, 0, Math.PI, 0));
  for (const s of [-1, 1]) L.add("viga", new THREE.BoxGeometry(.12, H + .1, .12), at(s * .56, .3 + (H + .1) / 2, D / 2 + .02)); L.add("viga", new THREE.BoxGeometry(1.3, .14, .14), at(0, .3 + 2.06, D / 2 + .03));
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) L.add("viga", new THREE.BoxGeometry(.13, H + .2, .13), at(sx * (W / 2 - .04), .3 + (H + .2) / 2, sz * (D / 2 - .04)));
  // la puerta abierta hacia afuera (bisagra a la izquierda), con el escalón
  L.add("col" + (seed % 9), new THREE.BoxGeometry(.96, 1.98, .05), at(-.5, .32 + .99, D / 2 + .03, 0, -1.9, 0).multiply(TM(.48, 0, 0))); L.add("piedraC", RB1(1.3, .16, .5, .03), at(0, .1, D / 2 + .3));
  // techo a dos aguas de chapa con tablas de borde y frontones de tablas
  const ang = .62, rh = (D / 2) * Math.tan(ang), S = (D / 2 + .35) / Math.cos(ang); for (const s of [1, -1]) { L.add("chapa", new THREE.BoxGeometry(W + .6, .06, S), at(0, .3 + H + rh / 2 - .02, s * (D / 2 + .35) / 2, s * ang, 0, 0)) }
  { const sh = new THREE.Shape(); sh.moveTo(-D / 2, 0); sh.lineTo(D / 2, 0); sh.lineTo(0, rh); sh.closePath(); const gp = new THREE.ExtrudeGeometry(sh, { depth: W - .02, bevelEnabled: false }); gp.rotateY(Math.PI / 2); gp.translate(-(W - .02) / 2, 0, 0); L.add("maderaV", gp, at(0, .3 + H, 0)) }
  // ventanita a cada costado
  for (const s of [-1, 1]) { L.add("vidrioC", new THREE.PlaneGeometry(.6, .5), at(s * (W / 2 + .005), 1.75, -.2, 0, s * Math.PI / 2, 0)); L.add("madera", new THREE.BoxGeometry(.06, .62, .74), at(s * (W / 2 + .02), 1.75, -.2)); L.add("madera", new THREE.BoxGeometry(.06, .06, .74), at(s * (W / 2 + .03), 1.75, -.2)) }
  // las cunas: cajón sobre balancines, colchita, el bebé envuelto (bulto con carita) y la almohada
  const cunas = [];
  for (const [cx, cz, ry] of [[0, -.75, 0], [-1.05, -.05, Math.PI / 2], [1.05, -.05, -Math.PI / 2]]) { const Mc = at(cx, .33, cz, 0, ry, 0), a2 = (...q) => Mc.clone().multiply(TM(...q));
    for (const s of [-1, 1]) L.add("interior", new THREE.TorusGeometry(.5, .03, 5, 12, Math.PI * .5), a2(s * .0, .02, s * .2, 0, 0, Math.PI * 1.25).multiply(TM(0, 0, 0)));
    L.add("interior", new THREE.BoxGeometry(.9, .06, .48), a2(0, .16, 0)); for (const s of [-1, 1]) { L.add("interior", new THREE.BoxGeometry(.9, .26, .04), a2(0, .32, s * .22)); L.add("interior", new THREE.BoxGeometry(.04, .38, .48), a2(s * .45, .36, 0)) }
    const m = new THREE.SphereGeometry(.3, 10, 6); m.scale(1.35, .32, .66); L.add("tela", m, a2(-.02, .24, 0)); const b = new THREE.CapsuleGeometry(.1, .3, 4, 8); b.rotateZ(Math.PI / 2); L.add("col" + ((seed + cunas.length * 3) % 9), b, a2(.02, .32, 0));
    L.add("piel", RB1(.14, .13, .13, .04), a2(.28, .34, 0)); L.add("tela", new THREE.SphereGeometry(.09, 8, 5), a2(.34, .3, 0, 0, 0, 0, .9, .5, 1.3)); cunas.push(new THREE.Vector3(.02, .45, 0).applyMatrix4(Mc).toArray()) }
  // farolito colgado y cartel; baldes de grasa al costado
  L.add("hierro", new THREE.CylinderGeometry(.006, .006, .3, 3), at(0, .3 + H - .15, -.3)); L.add("luz", new THREE.CylinderGeometry(.08, .07, .18, 6), at(0, .3 + H - .38, -.3)); L.add("hierro", new THREE.ConeGeometry(.1, .08, 6), at(0, .3 + H - .26, -.3));
  if (cartel) L.add("cartelC", new THREE.BoxGeometry(1.2, .45, .04), at(0, .3 + H + .36, D / 2 + .05).multiply(TM(0, 0, 0)));
  balde(L, at(W / 2 + .35, 0, .8, 0, .4, 0), true); balde(L, at(W / 2 + .65, 0, .5, 0, 1, 0), true); L.add("madera", new THREE.CylinderGeometry(.02, .02, .9, 5), at(W / 2 + .4, .45, .78, .3, 0, .2));
  rectAdd({ x, z, ry: 0, w: W + .8, d: D + .8 }); const C = { x, z, puerta: new THREE.Vector3(0, 1.3, D / 2).applyMatrix4(M).toArray(), cunas }; return C }
PB_M.vidrioC = M_VIDRIO; PB_M.cartelC = M_CARTEL_C; PBT_M.vidrioC = M_VIDRIO; PBT_M.cartelC = aplastable(M_CARTEL_C);
CALLES.forEach((c, i) => { CASILLAS[i] = casilla(c.aplastada ? PBT : PB, POSTES[i], 5930 + i * 11) });

// ---------- LA CAMPANA de nuestra plazoleta: dos postes gruesos, viga con techito, campana de bronce con badajo y soga (campana(ang) la hamaca)
const CAMPANA = new THREE.Group(); const CAMPANA_P = [POSTE_MIO[0] - 6.2, CALLE_MIA.z - 6.4];
{ const [x, z] = CAMPANA_P, y = SUELO(x, z), M = TM(x, y, z, 0, .15, 0), at = (...a) => M.clone().multiply(TM(...a)), H = 3.6;
  for (const s of [-1, 1]) { PB.add("viga", new THREE.BoxGeometry(.26, H, .26), at(s * .9, H / 2, 0)); PB.add("zocalo", RB1(.6, .3, .6, .04), at(s * .9, .1, 0)); for (const s2 of [-1, 1]) { const [g, m] = cilEntre([s * .9, .1, s2 * .7], [s * .9, 1.3, 0], .07, 5); PB.add("viga", g, at().multiply(m)) } }
  PB.add("viga", new THREE.BoxGeometry(2.3, .26, .3), at(0, H - .05, 0)); for (const s of [1, -1]) PB.add("chapa", new THREE.BoxGeometry(2.6, .05, .75), at(0, H + .3, s * .28, s * .7, 0, 0));
  CAMPANA.position.copy(new THREE.Vector3(0, H - .2, 0).applyMatrix4(M)); CAMPANA.rotation.y = .15; scene.add(CAMPANA);
  const L = lote(), perfil = [[0, -.02], [.12, 0], [.2, -.06], [.27, -.3], [.33, -.58], [.42, -.74], [.44, -.8], [.4, -.8], [.3, -.66], [.24, -.36], [.17, -.1], [0, -.08]];
  L.add("b", new THREE.LatheGeometry(perfil.map(q => new THREE.Vector2(q[0], q[1])), 24)); L.add("b", new THREE.TorusGeometry(.09, .025, 6, 10), TM(0, .03, 0)); L.add("h", new THREE.CylinderGeometry(.012, .012, .62, 4), TM(0, -.36, 0)); L.add("h", new THREE.SphereGeometry(.06, 8, 6), TM(0, -.68, 0));
  L.add("s", new THREE.CylinderGeometry(.015, .015, 2.5, 4), TM(.35, -1.45, 0, 0, 0, .05)); L.fin(CAMPANA, { b: M_BRONCE, h: M_HIERRO_N, s: M_SOGA }); ocupa(x, z, 1.4) }
function campana(ang = 0) { CAMPANA.rotation.set(0, .15, 0); CAMPANA.rotateX(ang) }

// ---------- utilería de las calles: faroles, cajones, barriles, sacos, baldes, bancos, macetas, carros, escaleras apoyadas, ropa tendida cruzando la calle
const TENDEDEROS = [];
{ const r = rng(6000);
  CALLES.forEach((c, ci) => { const tan = !!c.aplastada, L = tan ? PBT : PB, LV = tan ? PBT : PBV, XM = 46;
    // faroles en el cordón, alternados
    for (let x = -XM + 4 + ci * 2.3; x < XM; x += 11 + r() * 3) for (const s of [-1, 1]) { const xx = x + (s > 0 ? 5.5 : 0); if (Math.abs(xx - c.poste) < 9.5) continue; if (tan && Math.abs(xx) > TANNER_X) { farol(PB, xx, c.z + s * 3.45); continue } farol(L, xx, c.z + s * 3.45) }
    // contra los frentes: cosas apiladas (evitando las puertas)
    const puertas = CASAS_P.concat(tan ? TANNER_CASAS : []).filter(C => Math.abs(C.z - c.z) < 12).map(C => new THREE.Vector3(C.px, 0, C.d / 2).applyMatrix4(C.HM));
    for (let x = -XM; x < XM; x += .9 + r() * 2.4) for (const s of [-1, 1]) { if (r() < .45) continue; const z = c.z + s * (VEREDA - .45); if (Math.abs(x - c.poste) < 8.6 || puertas.some(p => Math.abs(p.x - x) < 1.1 && Math.abs(p.z - z) < 2)) continue; if (!libreEn(x, z, .45, { zona: 1, mc: -.5 })) continue;
      const y = SUELO(x, z), M = TM(x, y, z, 0, (r() - .5) * .6, 0), q = r(); ocupa(x, z, .5);
      if (q < .22) { barril(L, M); if (r() < .4) cajon(L, M.clone().multiply(TM(.62, 0, .05)), .9) } else if (q < .45) { cajon(L, M); if (r() < .6) cajon(L, M.clone().multiply(TM(.03, .44, 0, 0, (r() - .5) * .5, 0)), .9); if (r() < .3) cajon(L, M.clone().multiply(TM(.65, 0, 0, 0, .2, 0))) }
      else if (q < .6) { saco(L, M); saco(L, M.clone().multiply(TM(.45, 0, .05, 0, 1, 0))); if (r() < .5) saco(L, M.clone().multiply(TM(.22, .45, 0, Math.PI / 2 * .9, .3, 0))) } else if (q < .7) { balde(L, M); if (r() < .5) balde(L, M.clone().multiply(TM(.36, 0, .1)), r() < .5) }
      else if (q < .8) { banco(L, M.clone().multiply(TM(0, 0, s > 0 ? -.05 : .05, 0, s > 0 ? Math.PI : 0, 0))) } else if (q < .9) { for (let k = 0; k < 3; k++) { L.add("terracota", new THREE.CylinderGeometry(.16, .11, .26, 10), M.clone().multiply(TM(k * .36 - .36, .13, 0))); flores3D(L, M.clone().multiply(TM(k * .36 - .36, .24, 0)), 4, r, .2, .2) } }
      else { const hh = 3.2 + r() * 1.2; for (const s2 of [-1, 1]) L.add("madera", new THREE.BoxGeometry(.06, hh, .08), M.clone().multiply(TM(s2 * .22, hh / 2, -s * .45, s * .16, 0, 0))); for (let k = 0; k < hh / .32; k++) L.add("maderaV", new THREE.CylinderGeometry(.022, .022, .44, 5), M.clone().multiply(TM(0, .2 + k * .32, -s * .45 + s * .16 * (.2 + k * .32) * .16, 0, 0, Math.PI / 2))) } }
    // carros en la calle (calles pobres)
    if (c.tipo !== "buena") for (let k = 0; k < 2; k++) { const x = (r() < .5 ? -1 : 1) * (16 + r() * 24), z = c.z + (r() - .5) * 1.4; if (!libreEn(x, z, 1.8, { zona: 1 })) continue; ocupa(x, z, 1.8); carro(L, TM(x, SUELO(x, z), z, 0, Math.PI / 2 + (r() - .5) * .3, 0), r) }
    // ropa tendida cruzando la calle (calles del sur)
    if (c.z >= -1) for (let x = -44 + r() * 4; x < 44; x += 5.5 + r() * 4) { if (Math.abs(x - c.poste) < 9.5) continue; const yA = 4.4 + r() * 1.1, yB = yA + (r() - .5) * .8; tendedero(L, LV, x, c.z - VEREDA + .06, c.z + VEREDA - .06, yA, yB, r); TENDEDEROS.push([+x.toFixed(1), c.z]) } }) }
// los patios de atrás: galpones de chapa, cercos de tablas, leña, letrinas, baldes, tendederos chicos, arbolitos
const ARBOLES = [];
{ const r = rng(6100);
  for (let k = 0; k < 2600; k++) { const x = (r() - .5) * 110, ci = r() * (CALLES.length - 1) | 0, c = CALLES[ci], c2 = CALLES[ci + 1], z = lerp(c.z + 10.8, c2.z - 10.8, r()); if (z < LOMA_Z + 6 && c.z < -40) continue; if (!libreEn(x, z, 1.4)) continue;
    const tan = (c.aplastada && z < c.z + 12) || (c2.aplastada && z > c2.z - 12), L = tan && Math.abs(x) < TANNER_X ? PBT : PB, y = SUELO(x, z), M = TM(x, y, z, 0, (r() < .5 ? 0 : Math.PI / 2) + (r() - .5) * .2, 0), q = r();
    if (q < .2) { ocupa(x, z, 2); const w = 2.2 + r() * 1.2, d = 1.8 + r(); for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) L.add("viga", new THREE.BoxGeometry(.1, 2, .1), M.clone().multiply(TM(sx * w / 2, 1, sz * d / 2)));
      L.add("maderaV", new THREE.BoxGeometry(w, 1.8, .05), M.clone().multiply(TM(0, .9, -d / 2))); L.add("maderaV", new THREE.BoxGeometry(.05, 1.8, d), M.clone().multiply(TM(-w / 2, .9, 0))); L.add("chapa", new THREE.BoxGeometry(w + .4, .04, d + .5), M.clone().multiply(TM(0, 2.05, 0, .12, 0, 0))); lena(L, M.clone().multiply(TM(.2, 0, -d / 2 + .35)), r, w - .6) }
    else if (q < .32) { ocupa(x, z, 1); L.add("maderaV", RB1(1, 2.1, 1, .02), M.clone().multiply(TM(0, 1.05, 0))); L.add("chapa", new THREE.BoxGeometry(1.3, .04, 1.3), M.clone().multiply(TM(0, 2.17, 0, .15, 0, 0))); L.add("oscuro", new THREE.CircleGeometry(.05, 8), M.clone().multiply(TM(0, 1.7, .51))) }
    else if (q < .55) { ocupa(x, z, .6); barril(L, M); if (r() < .5) balde(L, M.clone().multiply(TM(.5, 0, .1))) }
    else if (q < .75 && !tan) { ocupa(x, z, 2.2); const n = 2 + r() * 2 | 0; ARBOLES.push([x, z, .7 + r() * .4]) }
    else { ocupa(x, z, .8); cajon(L, M); saco(L, M.clone().multiply(TM(.6, 0, 0))) } }
  // cercos de tablas entre los patios (a lo largo de x, en el medio de la franja)
  CALLES.slice(0, -1).forEach((c, ci) => { const zc = (c.z + CALLES[ci + 1].z) / 2; if (zc < LOMA_Z + 6) return; for (let x = -50; x < 50; x += .16) { if (r() < .04) { x += 1.2; continue } const tan = Math.abs(zc - CALLES[3].z) < 14 && Math.abs(x) < TANNER_X, L = tan ? PBT : PB, h = 1.3 + r() * .25; L.add(r() < .5 ? "maderaV" : "madera", new THREE.BoxGeometry(.14, h, .03), TM(x, SUELO(x, zc) + h / 2 - .05, zc + (r() - .5) * .04, 0, 0, (r() - .5) * .04)) }
    for (let x = -50; x < 50; x += 2.4) PB.add("viga", new THREE.BoxGeometry(2.4, .06, .05), TM(x + 1.2, SUELO(x, zc) + .9, zc - .04)) }) }

// ---------- árboles: tronco y copa redonda en bultos (arbolitos de patio en el sur; árboles grandes de jardín y conos recortados en la Loma)
const GEO_ARBOL = [0, 1, 2].map(v => { const r = rng(4710 + v), T = [], C = [], H = 2.6 + r() * 1.2;
  T.push([tubo([[0, -.2, 0], [(r() - .5) * .3, H * .4, (r() - .5) * .3], [(r() - .5) * .5, H * .8, (r() - .5) * .5], [(r() - .5) * .4, H, (r() - .5) * .4]], .2, .08), TM()]);
  for (let k = 0; k < 4; k++) { const a = k / 4 * 6.283 + r(), L = .8 + r() * .7; T.push([tubo([[0, H * .7, 0], [Math.cos(a) * L * .5, H * .85, Math.sin(a) * L * .5], [Math.cos(a) * L, H + .3, Math.sin(a) * L]], .07, .03, 5, 5), TM()]) }
  for (let j = 0; j < 9; j++) { const a = r() * 6.283, d = r() * 1.1, s = .7 + r() * .5; C.push([geoPiedra(4720 + v * 31 + j, 1, .8), TM(Math.cos(a) * d, H + .3 + r() * .9, Math.sin(a) * d, 0, r() * 6, 0, s, s * .85, s)]) }
  const gc = mergeG(C), pc = gc.attributes.position, uc = gc.attributes.uv; for (let i = 0; i < pc.count; i++) uc.setXY(i, pc.getX(i) / 1.4, (pc.getY(i) + pc.getZ(i)) / 1.4); return [mergeG(T), gc] });
{ const r = rng(6150), A = ARBOLES;
  // la Loma: árboles grandes en los jardines (lejos de las mansiones, los caminos y los postes)
  for (let k = 0; k < 3000 && A.length < 120; k++) { const x = (r() - .5) * 150, z = -70 - r() * 70; if (MANSIONES.some(m => Math.hypot(m.x - x, m.z - z) < 10.5) || POSTES.some(p => Math.hypot(p.x - x, p.z - z) < 5.5) || Math.hypot(x - ESCALERA_KELL[0], z - ESCALERA_KELL[1]) < 6 || colorSuelo(x, z)[0] > .5) continue;
    if (LOMA_CAMINOS.some(([x0, z0, x1, z1, an]) => { const dx = x1 - x0, dz = z1 - z0, t = cl(((x - x0) * dx + (z - z0) * dz) / (dx * dx + dz * dz)); return Math.hypot(x - x0 - dx * t, z - z0 - dz * t) < an / 2 + 2 })) continue; if (A.some(([a, b]) => Math.hypot(a - x, b - z) < 6)) continue; A.push([x, z, 1.4 + r() * .8]); ocupa(x, z, 2) }
  const ims = GEO_ARBOL.map(([gt, gc]) => { const a = new THREE.InstancedMesh(gt, M_CORTEZA, A.length), b = new THREE.InstancedMesh(gc, M_COPA, A.length); a.count = b.count = 0; [a, b].forEach(m => { m.castShadow = m.receiveShadow = true; scene.add(m) }); return [a, b] }), cc = new THREE.Color();
  A.forEach(([x, z, s], i) => { const [a, b] = ims[i % 3], n = a.count++; b.count++; dummy.position.set(x, SUELO(x, z) - .05, z); dummy.rotation.set(0, r() * 6, 0); dummy.scale.set(s, s * (.9 + r() * .2), s); dummy.updateMatrix(); a.setMatrixAt(n, dummy.matrix); b.setMatrixAt(n, dummy.matrix); b.setColorAt(n, cc.set(z < LOMA_Z ? ["#6a9a48", "#5a8a40", "#7aa650", "#4e8038"][r() * 4 | 0] : ["#8aa05a", "#7a9250", "#98a862", "#86984e"][r() * 4 | 0])) }) }

// ---------- LA LOMA: reja de hierro con pilares que separa la Loma del pueblo (portón en el camino), setos alrededor de las mansiones, conos recortados,
// canteros con flores, fuentes, bancos, faroles finos, y el camino a la escalera de Kell
{ const r = rng(6200), zr = LOMA_Z - 1.5, barrotes = [], puntas = [];
  for (let x = -96; x < 96; x += .16) { if (Math.abs(x) < 2.4) continue; const y = SUELO(x, zr); barrotes.push([x, y, zr]) }
  for (let x = -96; x <= 96; x += 6.4) { if (Math.abs(x) < 2.4) continue; const y = SUELO(x, zr); PB.add("sillarC", RB1(.6, 2.5, .6, .04), TM(x, y + 1.25, zr)); PB.add("marmol", RB1(.75, .16, .75, .04), TM(x, y + 2.55, zr)); PB.add("laton", new THREE.SphereGeometry(.18, 10, 8), TM(x, y + 2.78, zr)) }
  for (const s of [-1, 1]) { const x = s * 3.2, y = SUELO(x, zr); PB.add("sillarC", RB1(.9, 3.6, .9, .04), TM(x, y + 1.8, zr)); PB.add("laton", new THREE.SphereGeometry(.28, 10, 8), TM(x, y + 3.85, zr)); for (let k = 0; k < 14; k++) PB.add("hierroN", new THREE.CylinderGeometry(.018, .018, 2.6, 5), TM(s * (.2 + k * .17), y + 1.3, zr - .2 + s * 0, 0, 0, 0)) }
  const gb = new THREE.InstancedMesh(new THREE.CylinderGeometry(.016, .016, 2.1, 5), M_HIERRO_N, barrotes.length), gp = new THREE.InstancedMesh(new THREE.ConeGeometry(.04, .14, 5), M_LATON, barrotes.length);
  barrotes.forEach(([x, y, z], k) => { dummy.position.set(x, y + 1.05, z); dummy.rotation.set(0, 0, 0); dummy.scale.set(1, 1, 1); dummy.updateMatrix(); gb.setMatrixAt(k, dummy.matrix); dummy.position.y = y + 2.17; dummy.updateMatrix(); gp.setMatrixAt(k, dummy.matrix) });
  [gb, gp].forEach(m => { m.castShadow = true; m.receiveShadow = true; scene.add(m) });
  for (const yy of [.25, 1.9]) for (let x = -96; x < 96; x += 6.4) { if (Math.abs(x + 3.2) < 5) continue; PB.add("hierroN", new THREE.BoxGeometry(6.4, .05, .04), TM(x + 3.2, SUELO(x + 3.2, zr) + yy, zr)) }
  // setos: rectángulo alrededor de cada mansión (abierto adelante), y canteros con flores al pie del frente
  const setos = []; MANSIONES.forEach(m => { const W2 = m.w / 2 + 3.2, D2 = m.d / 2 + 3.4, at = (...a) => TM(m.x, SUELO(m.x, m.z), m.z, 0, m.ry, 0).multiply(TM(...a));
    for (let k = -W2; k < W2; k += 1.2) { setos.push(at(k + .6, .5, -D2)); if (Math.abs(k + .6) > 2.4) setos.push(at(k + .6, .5, D2)) } for (let k = -D2; k < D2; k += 1.2) for (const s of [-1, 1]) setos.push(at(s * W2, .5, k + .6));
    for (const s of [-1, 1]) { const Mc = at(s * (m.w / 4 + 1.4), 0, m.d / 2 + 1.0); PB.add("sillarC", RB1(m.w / 2 - 3.6, .3, .9, .04), Mc.clone().multiply(TM(0, .15, 0))); PB.add("tierra", new THREE.BoxGeometry(m.w / 2 - 3.8, .04, .7), Mc.clone().multiply(TM(0, .31, 0))); flores3D(PB, Mc.clone().multiply(TM(0, .3, 0)), 22, r, m.w / 2 - 4, .6) }
    // conos recortados a los lados de la entrada
    for (const s of [-1, 1]) { const g = new THREE.ConeGeometry(.7, 2.4, 10, 3), p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) + (fbm2(p.getX(i) * 3, p.getZ(i) * 3) - .5) * .1); g.computeVertexNormals(); PB.add("seto", g, at(s * 2.4, 1.4, D2)); PB.add("terracota", new THREE.CylinderGeometry(.6, .45, .5, 12), at(s * 2.4, .25, D2)) }
    ocupa(m.x, m.z, 1) });
  const gs = new THREE.InstancedMesh(geoUV(RB(1.3, 1.1, 1.0, .25, 2), (x, y, z) => (x + z) * .7, (x, y) => y * .7), M_SETO, setos.length); setos.forEach((M, k) => { M.decompose(dummy.position, dummy.quaternion, dummy.scale); dummy.scale.set(1, .9 + r() * .2, 1); dummy.updateMatrix(); gs.setMatrixAt(k, dummy.matrix) }); gs.castShadow = gs.receiveShadow = true; scene.add(gs);
  // fuentes de mármol con agua quieta
  for (const [x, z] of [[0, -94], [-16, -112]]) { const y = SUELO(x, z), at = (...a) => TM(x, y, z).multiply(TM(...a)); PB.add("marmol", new THREE.CylinderGeometry(3, 3.2, .7, 24), at(0, .35, 0)); PB.add("agua", new THREE.CircleGeometry(2.75, 24), at(0, .62, 0, -Math.PI / 2));
    PB.add("marmol", new THREE.CylinderGeometry(.35, .5, 1.8, 12), at(0, 1.2, 0)); PB.add("marmol", new THREE.CylinderGeometry(1.3, .4, .4, 16), at(0, 2.1, 0)); PB.add("agua", new THREE.CircleGeometry(1.15, 16), at(0, 2.31, 0, -Math.PI / 2)); PB.add("laton", new THREE.SphereGeometry(.22, 10, 8), at(0, 2.6, 0)); ocupa(x, z, 3.6) }
  // faroles finos y bancos a lo largo de los caminos
  LOMA_CAMINOS.forEach(([x0, z0, x1, z1, an]) => { const L2 = Math.hypot(x1 - x0, z1 - z0), nx = -(z1 - z0) / L2, nz = (x1 - x0) / L2; for (let s = 6; s < L2; s += 14) for (const sd of [-1, 1]) { const x = lerp(x0, x1, s / L2) + nx * sd * (an / 2 + .5), z = lerp(z0, z1, s / L2) + nz * sd * (an / 2 + .5); if (z > LOMA_Z - 3 || !libreEn(x, z, .6, { zona: 1 })) continue; if ((s / 14 | 0) % 2) farol(PB, x, z, 3.2); else { ocupa(x, z, 1); banco(PB, TM(x, SUELO(x, z), z, 0, Math.atan2(nx * sd, nz * sd), 0)) } } }) }

// ---------- pasto en matas (patios y canteros del sur, césped de la Loma) y piedras sueltas
const GEO_MATA = (() => { const r = rng(5001), pos = [], uv = [], idx = []; for (let b = 0; b < 6; b++) { const a = r() * 6.283, d = r() * .14, bx = Math.cos(a) * d, bz = Math.sin(a) * d, H = .22 + r() * .26, lean = (r() - .5) * .3, fa = r() * 6.283, wv = .028 + r() * .015, o = pos.length / 3;
    for (let k = 0; k <= 3; k++) { const s = k / 3, x = bx + s * s * lean * H * Math.cos(fa), y = s * H, z = bz + s * s * lean * H * Math.sin(fa), wd = wv * (1 - s * .85); pos.push(x - Math.sin(fa) * wd, y, z + Math.cos(fa) * wd, x + Math.sin(fa) * wd, y, z - Math.cos(fa) * wd); uv.push(0, s, 1, s) }
    for (let k = 0; k < 3; k++) { const i = o + k * 2; idx.push(i, i + 1, i + 2, i + 1, i + 3, i + 2) } }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const n = g.attributes.normal; for (let i = 0; i < n.count; i++) n.setXYZ(i, n.getX(i) * .3, 1, n.getZ(i) * .3); n.needsUpdate = true; g.normalizeNormals(); return g })();
const PASTO = (() => { const N = 14000, m = new THREE.InstancedMesh(GEO_MATA, new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .9, side: THREE.DoubleSide }), N), r = rng(5010), cc = new THREE.Color(); m.receiveShadow = true; m.castShadow = false; let n = 0;
  for (let k = 0; k < N * 4 && n < N; k++) { const loma = k % 3 === 0, x = (r() - .5) * (loma ? 150 : 110), z = loma ? -66 - r() * 70 : -40 + r() * 100; if (!loma && (calleK(x, z) > .05 || plazK(x, z) > .05 || veredaK(x, z) > .6)) continue; if (!libreEn(x, z, .25, { mc: -.4, zona: 1 })) continue;
    if (!loma && r() < .35 && colorSuelo(x, z)[1] < .25) continue; const s = loma ? .6 + r() * .3 : .55 + r() * .5; dummy.position.set(x, SUELO(x, z) - .02, z); dummy.rotation.set(0, r() * 6, 0); dummy.scale.set(s, s * (.7 + r() * .6), s); dummy.updateMatrix(); m.setMatrixAt(n, dummy.matrix);
    const c0 = colorSuelo(x, z); cc.setRGB(c0[0] * (.75 + r() * .25), c0[1] * (.85 + r() * .25), c0[2] * (.6 + r() * .2)); m.setColorAt(n, cc); n++ }
  m.count = n; scene.add(m); return m })();
{ const r = rng(6300), P = [], cc = new THREE.Color();
  for (let k = 0; k < 1800 && P.length < 900; k++) { const x = (r() - .5) * 110, z = -60 + r() * 120, cerca = veredaK(x, z) > .3; if (!libreEn(x, z, .3, { mc: -.3, zona: 1 }) || calleK(x, z) > .3 || plazK(x, z) > .3) continue; const s = .06 + r() * r() * (cerca ? .14 : .32); P.push([x, SUELO(x, z) + s * .2, z, s * (1 + r() * .5), s * (.55 + r() * .3), s]) }
  const ms = GEO_PIEDRAS.map(g => { const m = new THREE.InstancedMesh(g, M_ROCA, Math.ceil(P.length / 3) + 2); m.castShadow = m.receiveShadow = true; m.count = 0; scene.add(m); return m });
  P.forEach(([x, y, z, sx, sy, sz], i) => { const m = ms[i % 3], n = m.count++; dummy.position.set(x, y, z); dummy.rotation.set((r() - .5) * .3, r() * 6, (r() - .5) * .3); dummy.scale.set(sx, sy, sz); dummy.updateMatrix(); m.setMatrixAt(n, dummy.matrix); m.setColorAt(n, cc.set(["#9a968a", "#86837a", "#aaa598", "#7a776e", "#a29a88"][r() * 5 | 0])) }) }

// ---------- junto a cada poste de calle: baldes de grasa, el cuchillo de grasa clavado en un tarro, trapos; en nuestra plazoleta, la bomba de agua y un banco
{ const r = rng(6400); CALLES.forEach((c, i) => { const P = POSTES[i], L = c.aplastada ? PBT : PB, a0 = .9 + i;
    for (let k = 0; k < 3; k++) { const a = a0 + k * .5, x = P.x + Math.cos(a) * 1.95, z = P.z + Math.sin(a) * 1.95; balde(L, TM(x, P.y0 + .3, z, 0, r() * 6, 0), k < 2) }
    L.add("grasa", new THREE.CylinderGeometry(.25, .25, .05, 14), TM(P.x + Math.cos(a0 + .25) * 2.0, P.y0 + .31, P.z + Math.sin(a0 + .25) * 2.0)) });
  const [x, z] = [POSTE_MIO[0] + 6, CALLE_MIA.z - 5.6], y = SUELO(x, z), M = TM(x, y, z, 0, -.4, 0);
  PB.add("hierroN", new THREE.CylinderGeometry(.14, .18, 1.3, 10), M.clone().multiply(TM(0, .65, 0))); PB.add("hierroN", new THREE.CylinderGeometry(.05, .05, .55, 6), M.clone().multiply(TM(.22, 1.15, 0, 0, 0, 1.2))); PB.add("hierroN", new THREE.CylinderGeometry(.04, .05, .3, 6), M.clone().multiply(TM(0, 1.0, .2, Math.PI / 2.4, 0, 0)));
  PB.add("piedraC", RB1(1.1, .2, .8, .03), M.clone().multiply(TM(0, .1, .35))); balde(PB, M.clone().multiply(TM(0, .2, .4))); ocupa(x, z, .9);
  banco(PB, TM(POSTE_MIO[0] - 2.8, SUELO(-2.8, 7.4), CALLE_MIA.z + 7.4, 0, Math.PI, 0)); banco(PB, TM(POSTE_MIO[0] + 3, SUELO(3, 7.4), CALLE_MIA.z + 7.4, 0, Math.PI, 0)) }

// ---------- TANNER: escombros (vigas partidas, tejas, piedras, ladrillos, muebles rotos) que aparecen cuando la calle queda aplastada (tannerEstado ≥ 0,6)
const ESCOMBROS = (() => { const r = rng(6500), G = new THREE.Group(); scene.add(G); const piezas = { viga: [], teja: [], piedra: [], mueble: [] }, c = CALLES[POSTE_9T];
  for (let k = 0; k < 1400; k++) { const x = (r() - .5) * 2 * (TANNER_X + 1), z = c.z + (r() - .5) * 2 * 11.5, calle = Math.abs(z - c.z) < VEREDA; if (calle && r() < .6) continue; if (Math.hypot(x - c.poste, z - c.z) < 4.6) continue;
    const y = SUELO(x, z), q = r(), M = TM(x, y + (calle ? .05 : .2 + r() * .9), z, (r() - .5) * .9, r() * 6, (r() - .5) * .9);
    if (q < .2) piezas.viga.push(M.multiply(TM(0, 0, 0, 0, 0, 0, .9 + r() * 1.8, 1, 1))); else if (q < .62) piezas.teja.push(M); else if (q < .92) piezas.piedra.push(M.multiply(TM(0, 0, 0, 0, 0, 0, .14 + r() * .2))); else piezas.mueble.push(M) }
  const gv = (() => { const g = new THREE.BoxGeometry(1.6, .2, .2, 4, 1, 1), p = g.attributes.position; for (let i = 0; i < p.count; i++) if (Math.abs(p.getX(i)) > .7) { p.setY(i, p.getY(i) * (.4 + Math.random() * .5)); p.setZ(i, p.getZ(i) * (.5 + Math.random() * .4)) } g.computeVertexNormals(); return g })();
  const gt = new THREE.CylinderGeometry(.13, .13, .36, 6, 1, true, 0, Math.PI); gt.rotateZ(Math.PI / 2);
  const gm = mergeG([[RB1(.9, .06, .55), TM(0, .5, 0)], [new THREE.BoxGeometry(.06, .5, .06), TM(.4, .25, .22, .2, 0, 0)], [new THREE.BoxGeometry(.06, .5, .06), TM(-.4, .25, -.22, 0, 0, .5)], [RB1(.45, .05, .45), TM(.9, .25, .2, .4, .3, 0)], [new THREE.BoxGeometry(.04, .55, .04), TM(.75, .45, .4, 0, 0, -.3)], [RB1(.8, .9, .3), TM(-.9, .2, .4, 1.3, .4, 0)]]);
  const ims = [[gv, M_VIGA, piezas.viga], [gt, M_TEJA[0], piezas.teja], [GEO_PIEDRAS[0], M_ROCA_G, piezas.piedra], [gm, M_MADERA, piezas.mueble]].map(([g, m, L]) => { const im = new THREE.InstancedMesh(g, m, L.length); L.forEach((M, k) => im.setMatrixAt(k, M)); im.castShadow = im.receiveShadow = true; G.add(im); return im });
  return { G, ims } })();
// tannerAltura(u) → altura (mundo) de la cara de abajo de la tapa que baja sobre Tanner en u (0 = CIELO, 1 = apoyada sobre los escombros, 1,4 m)
const tannerAltura = u => lerp(CIELO(POSTE_NUEVE[0], TANNER.z), 1.4, cl(u));
// tannerEstado(u): 0 = Tanner en pie (el recuerdo), 1 = aplastada. Las casas se aplastan de arriba hacia abajo siguiendo tannerAltura(u);
// Pole Nine se hunde en el gato (el tornillo se resbaló) y en u = 1 ya no está (solo quedan el gato y el tornillo con el tajo)
const TAN_E = { u: -1 };
function tannerEstado(u = 1) { u = cl(u); if (TAN_E.u === u) return; TAN_E.u = u; const h = tannerAltura(u); TANNER_U.top.value = u <= 0 ? 99 : h;
  const P = POSTES[POSTE_9T], d = Math.max(0, P.top - h - .02); P.g.position.y = -d; P.g.visible = u < .995; const dt = Math.min(d, .35); P.tor.position.y = -dt; if (P.torC) P.torC.position.y = -dt; P.cab.visible = true;
  const s = sst(.55, .95, u); ESCOMBROS.G.visible = s > 0; ESCOMBROS.G.scale.set(1, Math.max(.001, s), 1); ESCOMBROS.G.position.y = (1 - s) * .3 }
// poste9Corte(visible): muestra el tajo fresco de serrucho en el tornillo de Pole Nine (en Tanner y en la Loma), con limaduras brillantes y aserrín
const LIMADURAS = (() => { const r = rng(6600), N = 420, g = new THREE.TetrahedronGeometry(.012, 0), m = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .3, metalness: .6, envMap: ENV_METAL_P, envMapIntensity: 1.2 }), N * 2), cc = new THREE.Color(); let n = 0;
  for (const P of [POSTES[POSTE_9T], POSTES[POSTE_9L]]) for (let k = 0; k < N; k++) { const a = CORTE_A + (r() - .5) * 1.6, en = r(), rr = en < .5 ? .6 + r() * .35 : 1.2 + r() * .5, y = en < .5 ? 1.75 : en < .8 ? 1.16 : .42, wx = P.x + Math.cos(a) * rr, wz = P.z - Math.sin(a) * rr;
    dummy.position.set(wx, P.y0 + y + .006, wz); dummy.rotation.set(r() * 6, r() * 6, r() * 6); dummy.scale.set(1 + r() * 2, .4, 1 + r()); dummy.updateMatrix(); m.setMatrixAt(n, dummy.matrix); m.setColorAt(n, cc.set(r() < .6 ? "#e8eaec" : r() < .6 ? "#c8a878" : "#9a9894")); n++ }
  m.count = n; m.castShadow = false; m.receiveShadow = true; scene.add(m); return m })();
function poste9Corte(v = true) { for (const P of [POSTES[POSTE_9T], POSTES[POSTE_9L]]) { P.torC.visible = !!v; P.tor.visible = !v } LIMADURAS.visible = !!v }

// ---------- la manivela que se parte: manivelaRota(i, u). En u > 0 la barra que apunta a la calle se parte a 2,15 m del eje: el muñón astillado
// queda en la tuerca y el pedazo largo cae y queda tirado en el piso (u = 1). Astillas en las dos puntas.
const GEO_ASTILLAS = (() => { const r = rng(6700), L = []; for (let k = 0; k < 9; k++) { const a = r() * 6.283, rr = r() * .055; L.push([new THREE.ConeGeometry(.018 + r() * .012, .1 + r() * .14, 4), TM(0, Math.cos(a) * rr, Math.sin(a) * rr, 0, 0, -Math.PI / 2 + (r() - .5) * .5)]) } return mergeG(L) })();
function manivelaRota(i, u = 0) { const P = POSTES[i]; if (!P || !P.cab) return; u = cl(u); P.rotaU = u;
  if (!P.rota) { if (u <= 0) return; const st = new THREE.Mesh(GEO_ASTILLAS, M_BARRA); st.position.set(BARRA_ROTA_R, BARRA_Y, 0); P.cab.add(st); const pz = new THREE.Group(), pm = new THREE.Mesh(barraGeo(0, BARRA_R - .1 - BARRA_ROTA_R), M_BARRA), pa = new THREE.Mesh(GEO_ASTILLAS, M_BARRA);
    pa.rotation.y = Math.PI; pm.castShadow = pa.castShadow = true; pz.add(pm, pa); scene.add(pz); P.rota = { st, pz } }
  const R0 = P.rota; P.barras.geometry = u > 0 ? GEO_BARRAS3 : GEO_BARRAS; R0.st.visible = u > 0; R0.pz.visible = u > 0; if (u <= 0) return;
  // dónde estaba la punta rota (con el giro de la manivela) y adónde cae
  const a = P.ang || 0, c = Math.cos(a), s = Math.sin(a), bx = P.x + c * BARRA_ROTA_R, bz = P.z - s * BARRA_ROTA_R, f = sst(.08, 1, u), g = f * f;
  const y = lerp(P.y0 + BARRA_Y, SUELO(bx, bz) + .08, g), tilt = -lerp(0, .06, sst(0, .08, u)) - lerp(0, 0, g), roll = f * 1.2;
  R0.pz.position.set(bx + c * f * .5, y, bz - s * f * .5); R0.pz.rotation.set(0, a + f * .7, 0); R0.pz.rotateZ(tilt - Math.sin(f * Math.PI) * .5); R0.pz.rotateX(roll) }

// ---------- LOS TECHOS DE NUESTRA CALLE SE RAJAN: techosRajan(u) — grietas que se abren en los faldones, tejas que se deslizan y caen a la calle,
// chimeneas que se inclinan (u 0 → 1)
const T_GRIETA = (() => { const t = tex(1024, 512, (g, w, h) => { const r = rng(6800); g.clearRect(0, 0, w, h);
    // el alfa dice CUÁNDO aparece cada parte (1 = primero): alphaTest = 1 − u las va mostrando
    const rama = (x, y, a, L, al, wd, n) => { for (let k = 0; k < n; k++) { const x2 = x + Math.cos(a) * L / n, y2 = y + Math.sin(a) * L / n, a2 = al * (1 - k / n * .7); g.strokeStyle = `rgba(22,14,10,${a2})`; g.lineWidth = wd * (1 - k / n * .6); g.lineCap = "round"; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke();
        if (r() < .18 && wd > 3) rama(x2, y2, a + (r() < .5 ? 1 : -1) * (.5 + r() * .6), L * .45, a2 * .9, wd * .55, 6); x = x2; y = y2; a += (r() - .5) * .7 } };
    for (let k = 0; k < 3; k++) { const x = w * (.2 + k * .3 + (r() - .5) * .1), y = h * (.3 + r() * .4); rama(x, y, r() * 6.3, 420, .98 - k * .1, 14, 18); rama(x, y, r() * 6.3, 300, .95 - k * .1, 11, 14) }
    // huecos de tejas caídas (oscuros, con la madera del entablonado)
    for (let k = 0; k < 16; k++) { const x = r() * w, y = r() * h, s = 14 + r() * 26, al = .2 + r() * .6; g.fillStyle = `rgba(40,26,16,${al})`; g.fillRect(x, y, s * 1.6, s); g.fillStyle = `rgba(110,80,50,${al})`; g.fillRect(x + 3, y + s * .45, s * 1.6 - 6, 4) } }); return t })();
const M_GRIETA = new THREE.MeshStandardMaterial({ map: T_GRIETA, alphaTest: .999, roughness: 1, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -8 });
const TEJAS_C = [];   // tejas que caen: { S (arriba en el faldón), E (alero), n (afuera), d0 (cuándo), sp (giro) }
{ const L = lote(), r = rng(6900);
  TECHOS_MIOS.forEach(C => { const RM = C.frontal ? TM(0, 0, 0, 0, Math.PI / 2, 0) : new THREE.Matrix4(), ovz = .45, S = (C.span / 2 + ovz) / Math.cos(C.ang);
    for (const s of [1, -1]) { const ym = C.h + C.rh + .1 - (C.span / 2 + ovz) * Math.tan(C.ang) / 2, zm = s * (C.span / 2 + ovz) / 2, Mf = C.HM.clone().multiply(RM).multiply(TM(0, ym, zm, C.ang, s > 0 ? 0 : Math.PI, 0)), g = new THREE.PlaneGeometry(Math.min(C.len, 5.5), S * .9);
      g.rotateX(-Math.PI / 2); const uv = g.attributes.uv, o = r(); for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * Math.min(C.len, 5.5) / 5.5 * .9 + o * .1, uv.getY(i)); L.add("g", g, Mf.clone().multiply(TM((r() - .5) * Math.max(0, C.len - 5.5), .1, 0)));
      // tejas sueltas del faldón (más del lado de la calle)
      const nT = s > 0 === (Math.cos(C.ry) > 0) ? 4 : 9; for (let k = 0; k < nT; k++) { const lx = (r() - .5) * (C.len - .8), q = .2 + r() * .6, Sp = new THREE.Vector3(lx, .12, (q - .5) * S).applyMatrix4(Mf), Ep = new THREE.Vector3(lx, .12, .5 * S).applyMatrix4(Mf), n = Ep.clone().sub(Sp).setY(0).normalize();
        TEJAS_C.push({ S: Sp, E: Ep, n, d0: r() * .82, sp: (r() - .5) * 14, ry: Math.atan2(n.x, n.z), mat: C.techo.startsWith("teja") ? 0 : 1 }) } } });
  L.fin(scene, { g: M_GRIETA }) }
const TEJAS_IM = [new THREE.InstancedMesh(new THREE.BoxGeometry(.3, .04, .4), M_TEJA[0], TEJAS_C.length), new THREE.InstancedMesh(new THREE.BoxGeometry(.32, .03, .44), M_PIZ[0], TEJAS_C.length)];
TEJAS_IM.forEach(m => { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; scene.add(m) });
const RAJ = { u: -1 };
function techosRajan(u = 0) { u = cl(u); if (RAJ.u === u) return; RAJ.u = u; M_GRIETA.alphaTest = Math.max(.02, 1 - u * 1.05); M_GRIETA.visible = u > 0;
  CHIMS.forEach(ch => { const k = sst(ch.d0, ch.d0 + .4, u); ch.G.quaternion.setFromAxisAngle(ch.eje, ch.max * k); ch.G.position.copy(ch.C.chimG.base).add(new THREE.Vector3(0, -ch.sube * k, 0)) });
  const n = [0, 0], q = new THREE.Quaternion(), e = new THREE.Euler(); TEJAS_C.forEach(T => { const t = (u - T.d0) / .16; if (t <= 0) return; const im = TEJAS_IM[T.mat], k = n[T.mat]++;
    let p; if (t < .3) p = T.S.clone().lerp(T.E, (t / .3) ** 2); else { const tau = (t - .3) * 1.4, v = 2.2; p = T.E.clone().addScaledVector(T.n, v * tau); p.y -= 4.9 * tau * tau; const gy = SUELO(p.x, p.z) + .03; if (p.y < gy) p.y = gy }
    const giro = t < .3 ? 0 : Math.min((t - .3) * T.sp, p.y < SUELO(p.x, p.z) + .05 ? T.sp * .6 : 99); e.set(t < .3 ? -.7 : -.7 + giro, T.ry, giro * .4, "YXZ"); q.setFromEuler(e); dummy.position.copy(p); dummy.quaternion.copy(q); dummy.scale.setScalar(1); dummy.updateMatrix(); im.setMatrixAt(k, dummy.matrix) });
  TEJAS_IM.forEach((im, j) => { im.count = n[j]; im.instanceMatrix.needsUpdate = true }) }

// ---------- POLVILLO que cae de la tapa sobre nuestra calle: callePolvo(u) — motas que bajan despacio por toda la calle y chorritos finos de tierra
// que caen de las juntas de la tapa (u = 0 nada, 1 mucho). Se dibujan en el sombreador (tiempo = AMB.t).
const AMB = { t: 0, cam: [0, 0, 0] };
const POLVO_U = { uT: { value: 0 }, uD: { value: 0 } };
const POLVO_M = (() => { const N = 2600, g = new THREE.PlaneGeometry(1, 1), r = rng(7000), aS = new Float32Array(N * 4); for (let k = 0; k < N; k++) aS.set([(r() - .5) * 64, r(), (r() - .5) * 22, r()], k * 4); g.setAttribute("aS", new THREE.InstancedBufferAttribute(aS, 4));
  const mat = new THREE.ShaderMaterial({ uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uT: POLVO_U.uT, uD: POLVO_U.uD, uMap: { value: GLOW }, uCol: { value: new THREE.Color("#c8b494") } }]), transparent: true, depthWrite: false, fog: true,
    vertexShader: `uniform float uT, uD; attribute vec4 aS; varying vec2 vUv; varying float vA;
    #include <fog_pars_vertex>
    void main() { vUv = uv; float top = ${CIELO_Y0.toFixed(2)} - .3, f = fract(aS.y - uT * (.05 + aS.w * .07)); vec3 p = vec3(aS.x + sin(uT * .7 + aS.w * 30.) * .4, f * top, aS.z + cos(uT * .6 + aS.y * 20.) * .4);
      vA = step(aS.w, uD) * smoothstep(0., .08, f) * smoothstep(1., .9, f); vec4 mv = viewMatrix * vec4(p, 1.); mv.xy += position.xy * (.035 + aS.w * .05); vec4 mvPosition = mv; gl_Position = projectionMatrix * mv;
      #include <fog_vertex>
    }`, fragmentShader: `uniform sampler2D uMap; uniform vec3 uCol; varying vec2 vUv; varying float vA;
    #include <fog_pars_fragment>
    void main() { float a = texture2D(uMap, vUv).a * vA * .8; if (a < .01) discard; gl_FragColor = vec4(uCol, a);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      #include <fog_fragment>
    }` });
  const m = new THREE.InstancedMesh(g, mat, N), Z = new THREE.Matrix4().makeScale(0, 0, 0); for (let k = 0; k < N; k++) m.setMatrixAt(k, Z); m.frustumCulled = false; m.renderOrder = 3; m.visible = false; scene.add(m); return m })();
const T_CHORRO = tex(64, 512, (g, w, h) => { const r = rng(7010); g.clearRect(0, 0, w, h); for (let k = 0; k < 900; k++) { const x = w / 2 + (r() - .5) * (6 + r() * r() * 50), y = r() * h, s = 1 + r() * 3; g.fillStyle = `rgba(170,140,100,${.25 + r() * .6})`; g.fillRect(x, y, s, s * (1 + r() * 3)) } const gr = g.createLinearGradient(0, 0, 0, h); g.globalCompositeOperation = "destination-in"; gr.addColorStop(0, "rgba(0,0,0,1)"); gr.addColorStop(.8, "rgba(0,0,0,.7)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h) });
T_CHORRO.wrapT = THREE.RepeatWrapping;
const CHORROS = (() => { const r = rng(7020), L = []; for (let k = 0; k < 9; k++) { const x = (r() - .5) * 44, z = CALLE_MIA.z + (r() - .5) * 7, top = CIELO(x, z) - .05, m = new THREE.Mesh(new THREE.PlaneGeometry(.5 + r() * .4, top), new THREE.MeshBasicMaterial({ map: T_CHORRO.clone(), transparent: true, depthWrite: false, opacity: 0, fog: true }));
    m.material.map.wrapT = THREE.RepeatWrapping; m.material.map.repeat.set(1, top / 6); m.material.map.needsUpdate = true; m.position.set(x, top / 2, z); m.userData = { d0: r() * .6, v: .8 + r() * .8 }; m.visible = false; m.renderOrder = 3; scene.add(m); L.push(m) } return L })();
function callePolvo(u = 0) { u = cl(u); POLVO_U.uD.value = u; POLVO_M.visible = u > 0; CHORROS.forEach(m => { const k = sst(m.userData.d0, m.userData.d0 + .3, u); m.visible = k > 0; m.material.opacity = k * .85; m.quaternion.copy(cam.quaternion); m.rotation.set(0, Math.atan2(cam.position.x - m.position.x, cam.position.z - m.position.z), 0); m.material.map.offset.y = AMB.t * m.userData.v }) }

// ---------- LA ESCALERA DE KELL: sube de una tarima de piedra en la Loma (ESCALERA_KELL) hasta 2 m por encima de la tapa (la trampa la hace el otro
// agente), con largueros de madera, peldaños redondos, abrazaderas, cuatro vientos de soga y un torno con sogas, bolsas de tierra y carretillas al pie
const ESCALERA = new THREE.Group(); scene.add(ESCALERA);
const ESC_TOP = CIELO(ESCALERA_KELL[0], ESCALERA_KELL[1]) + LID_T + 2.4;
{ const [x, z] = ESCALERA_KELL, y = SUELO(x, z), L = lote(), H = ESC_TOP - y - .5, r = rng(7100), at = (...a) => TM(x, y, z).multiply(TM(...a));
  L.add("zocalo", uvMuro(new THREE.BoxGeometry(4.2, .5, 4.2), 2.4), at(0, .05, 0)); L.add("madera", new THREE.BoxGeometry(3.6, .1, 3.6), at(0, .35, 0));
  for (const s of [-1, 1]) L.add("madera", new THREE.BoxGeometry(.13, H, .09), at(s * .38, .4 + H / 2, 0)); for (let k = 0; k * .32 < H - .2; k++) L.add("maderaV", new THREE.CylinderGeometry(.03, .03, .76, 6), at(0, .7 + k * .32, 0, 0, 0, Math.PI / 2));
  for (let yy = 2; yy < H; yy += 3) L.add("hierro", new THREE.BoxGeometry(.95, .08, .14), at(0, .4 + yy, 0));
  // pie de apoyo: caballete de vigas
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const [g, m] = cilEntre([sx * 1.5, .35, sz * 1.5], [sx * .4, 4.5, sz * .05], .08, 6); L.add("viga", g, at().multiply(m)) }
  // vientos de soga a estacas
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const ex = sx * 7, ez = sz * 7, ey = SUELO(x + ex, z + ez) - y; const [g, m] = cilEntre([0, H * .62, 0], [ex, ey + .3, ez], .018, 4); L.add("soga", g, at().multiply(m)); L.add("hierroO", new THREE.CylinderGeometry(.04, .05, .5, 6), at(ex, ey + .15, ez, .25 * sz, 0, -.25 * sx)) }
  // el torno (rueda con manija y soga que sube por la escalera), bolsas de tierra apiladas y dos carretillas con tierra
  { const M = at(2.4, .4, .8); L.add("viga", new THREE.BoxGeometry(.12, 1.1, .12), M.clone().multiply(TM(-.5, .55, 0))); L.add("viga", new THREE.BoxGeometry(.12, 1.1, .12), M.clone().multiply(TM(.5, .55, 0))); L.add("madera", new THREE.CylinderGeometry(.18, .18, 1.0, 10), M.clone().multiply(TM(0, 1.0, 0, 0, 0, Math.PI / 2))); L.add("soga", new THREE.CylinderGeometry(.2, .2, .7, 10), M.clone().multiply(TM(0, 1.0, 0, 0, 0, Math.PI / 2)));
    L.add("hierro", new THREE.BoxGeometry(.05, .5, .05), M.clone().multiply(TM(.62, .78, 0))); const [g, m] = cilEntre([2.4, 1.6, .8], [.1, H, -.12], .016, 4); L.add("soga", g, at().multiply(m)) }
  for (let k = 0; k < 14; k++) saco(L, at(-2.4 + (k % 4) * .55, .4 + (k >> 2) * .48 * 0 + (k >= 8 ? .5 : 0), 1.2 + (k % 3) * .12 - (k >> 2) * .1, k >= 8 ? Math.PI / 2 * .95 : 0, r() * .6, 0));
  for (const [dx, dz, ry] of [[-3.8, -1.6, .5], [3.6, -1.9, -.3]]) { const M = at(dx, -.05 + SUELO(x + dx, z + dz) - y, dz, 0, ry, 0); L.add("hierroO", new THREE.CylinderGeometry(.45, .3, .35, 12, 1, true), M.clone().multiply(TM(0, .55, 0))); L.add("tierra", geoPiedra(7110, 1, .5), M.clone().multiply(TM(0, .72, 0, 0, 0, 0, .44, .5, .44)));
    rueda(L, M.clone().multiply(TM(0, .2, .6, 0, Math.PI / 2, 0)), .2); for (const s of [-1, 1]) L.add("madera", new THREE.CylinderGeometry(.03, .03, 1.3, 5), M.clone().multiply(TM(s * .25, .5, -.5, 1.35, 0, 0))) }
  { const g = new THREE.CylinderGeometry(.35, .5, .3, 12); L.add("tierra", geoPiedra(7120, 2, .45), at(-1.2, .4, -2.6, 0, 0, 0, 1.3, .9, 1)) }
  for (const [dx, dz] of [[1.2, -2.2], [1.6, -2.4]]) L.add("madera", new THREE.CylinderGeometry(.025, .025, 1.5, 5), at(dx, 1.1, dz, .15, 0, .1));
  L.fin(ESCALERA, { ...PB_M }); ocupa(x, z, 4.5) }
const ESCALERA_TOP = [ESCALERA_KELL[0], ESC_TOP - .1, ESCALERA_KELL[1]];   // la punta de la escalera (para la cámara / los hombres de Kell)
const escaleraKell = (v = true) => { ESCALERA.visible = !!v };

// ---------- BARRILETES sobre la Loma: rombos de colores con varillas, cola de moñitos y el hilo hasta la mano del que lo remonta.
// barriletes(t) los mueve. KITE_MANOS = [[x, y, z] …]: dónde va la mano de cada uno (para poner a la gente)
const KITE_MANOS = [[-26, 0, -74], [-12, 0, -96], [22, 0, -96], [36, 0, -74], [-42, 0, -92], [4, 0, -116], [46, 0, -114], [-6, 0, -71], [-56, 0, -110]].map(([x, , z]) => [x, SUELO(x, z) + 1.35, z]);
const KITES = (() => { const r = rng(7200), cols = [["#d83a2e", "#f0c838"], ["#2e6ad8", "#f0f0e8"], ["#38a048", "#f0d040"], ["#e86a2a", "#5a2e88"], ["#f0f0e8", "#d83a6a"], ["#2a9ab0", "#f08a2a"]];
  const ts = cols.map(([a, b], k) => tex(256, 256, (g, w, h) => { g.fillStyle = a; g.fillRect(0, 0, w, h); g.fillStyle = b; if (k % 2) { g.fillRect(0, 0, w / 2, h / 2); g.fillRect(w / 2, h / 2, w / 2, h / 2) } else { g.beginPath(); g.arc(w / 2, h / 2, 70, 0, 7); g.fill() } g.strokeStyle = "rgba(40,30,20,.5)"; g.lineWidth = 8; g.strokeRect(0, 0, w, h) }));
  const gk = (() => { const g = new THREE.BufferGeometry(), pos = [0, .9, 0, -.55, .15, -.06, 0, -.75, 0, .55, .15, -.06, 0, .15, .05], uv = [.5, 1, 0, .5, .5, 0, 1, .5, .5, .5]; g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex([0, 1, 4, 1, 2, 4, 2, 3, 4, 3, 0, 4]); g.computeVertexNormals(); return g })();
  const gv = mergeG([[new THREE.CylinderGeometry(.012, .012, 1.65, 4), TM(0, .07, .03)], [new THREE.CylinderGeometry(.012, .012, 1.1, 4), TM(0, .15, .0, 0, 0, Math.PI / 2)]]);
  const L = KITE_MANOS.map((p, k) => { const G = new THREE.Group(); scene.add(G); const m = new THREE.Mesh(gk, new THREE.MeshStandardMaterial({ map: ts[k % ts.length], side: THREE.DoubleSide, roughness: .7 })); m.castShadow = true; G.add(m); const v = new THREE.Mesh(gv, M_MADERA); G.add(v);
    const cielo = CIELO(p[0], p[2]); return { G, p, alto: Math.min(cielo - 4, p[1] + 9 + r() * 8), dx: 5 + r() * 5, dz: (r() - .5) * 6, f: r() * 6.3, s: .9 + r() * .4, col: cols[k % cols.length] } });
  return L })();
const KITE_COLA = new THREE.InstancedMesh(mergeG([[new THREE.ConeGeometry(.09, .14, 3), TM(.07, 0, 0, 0, 0, -Math.PI / 2)], [new THREE.ConeGeometry(.09, .14, 3), TM(-.07, 0, 0, 0, 0, Math.PI / 2)]]), new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .8, side: THREE.DoubleSide }), KITES.length * 12);
const KITE_HILO = new THREE.InstancedMesh(new THREE.CylinderGeometry(.006, .006, 1, 3), new THREE.MeshStandardMaterial({ color: "#efe9da", roughness: 1 }), KITES.length * 24);
[KITE_COLA, KITE_HILO].forEach(m => { m.frustumCulled = false; scene.add(m) }); KITE_COLA.castShadow = true;
{ const cc = new THREE.Color(); KITES.forEach((K, k) => { for (let j = 0; j < 12; j++) KITE_COLA.setColorAt(k * 12 + j, cc.set(K.col[j % 2])) }) }
const KITE_E = { vis: true };
function barriletes(t = 0, vis = KITE_E.vis) { KITE_E.vis = vis; [KITE_COLA, KITE_HILO].forEach(m => m.visible = vis); const up = new THREE.Vector3(0, 1, 0), a = new THREE.Vector3(), b = new THREE.Vector3(), q = new THREE.Quaternion();
  KITES.forEach((K, k) => { K.G.visible = vis; if (!vis) return; const ph = t * .9 + K.f, kp = new THREE.Vector3(K.p[0] + K.dx + Math.sin(ph * .7) * 1.2, K.alto + Math.sin(ph * 1.1) * .6, K.p[2] + K.dz + Math.sin(ph * .5) * 1.4);
    K.G.position.copy(kp); K.G.rotation.set(-.5 + Math.sin(ph * 1.7) * .08, -Math.PI / 2 + .3 + Math.sin(ph * .6) * .25, Math.sin(ph * 1.3) * .22, "YXZ"); K.G.scale.setScalar(K.s);
    // hilo: curva que cuelga un poco, de la mano al barrilete
    const H = new THREE.Vector3(...K.p); for (let j = 0; j < 24; j++) { const u0 = j / 24, u1 = (j + 1) / 24, P = u => H.clone().lerp(kp, u).add(new THREE.Vector3(0, -Math.sin(u * Math.PI) * 1.1, 0)); a.copy(P(u0)); b.copy(P(u1)); const d = b.clone().sub(a); q.setFromUnitVectors(up, d.clone().normalize()); dummy.position.copy(a).add(b).multiplyScalar(.5); dummy.quaternion.copy(q); dummy.scale.set(1, d.length(), 1); dummy.updateMatrix(); KITE_HILO.setMatrixAt(k * 24 + j, dummy.matrix) }
    // cola: cuelga y se va con la brisa hacia +x, ondulando
    const bot = new THREE.Vector3(0, -.75 * K.s, 0).applyQuaternion(K.G.quaternion).add(kp); for (let j = 0; j < 12; j++) { const s = (j + 1) * .32; dummy.position.set(bot.x + s * .55 + Math.sin(ph * 3 - j * .7) * .12 * (j / 12), bot.y - s * .75, bot.z + Math.sin(ph * 2.3 - j * .9) * .25 * (j / 12)); dummy.rotation.set(0, Math.sin(ph * 4 + j) * .6, .4 + Math.sin(ph * 3 - j) * .3); dummy.scale.setScalar(1); dummy.updateMatrix(); KITE_COLA.setMatrixAt(k * 12 + j, dummy.matrix) } });
  KITE_COLA.instanceMatrix.needsUpdate = true; KITE_HILO.instanceMatrix.needsUpdate = true }

// ---------- todo junto
PB.fin(scene, PB_M); { const ms = PBV.fin(scene, PBV_M); Object.values(ms).forEach(m => { m.castShadow = true }) } PBT.fin(scene, PBT_M);

// ---------- TAPA DE PRUEBA (provisoria, apagada): un plano celeste a la altura CIELO(x, z) para ver el pueblo con el techo encima. puebloTapaPrueba(true)
const TAPA_PRUEBA = (() => { const g = new THREE.PlaneGeometry(460, 420, 92, 84); g.rotateX(Math.PI / 2); g.translate(0, 0, -15); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, CIELO(p.getX(i), p.getZ(i))); g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: "#8ab8e8", roughness: .9, side: THREE.DoubleSide, emissive: "#6a98c8", emissiveIntensity: .35 })); m.visible = false; m.receiveShadow = true; scene.add(m); return m })();
const puebloTapaPrueba = (v = false) => { TAPA_PRUEBA.visible = !!v };

// ---------- LA LUZ BAJO LA TAPA. El motor declara ENV después de este archivo: las escenas hacen una vez Object.assign(ENV, ENV_CIELO_PUEBLO)
// y después setEnv("bajo" | "recuerdo") (al recuerdo se le pone sepia aparte, con POST.sepia). «bajo»: de día pero sin sol visible (el sol es pintado):
// luz pareja, un poco fría, que baja casi derecha; sombras suaves; bruma celeste grisácea a lo lejos, por las calles.
const ENV_CIELO_PUEBLO = {
  bajo: { top: "#8fb2d6", hor: "#b4c4d0", fog: .0085, hemi: 2.25, hemiG: "#7e7464", sun: 1.55, sunCol: "#e4ecf8", exp: 1.2, grade: ["#d4e2f0", .05], sol: [-.28, 1, .32], sombra: 84 },
  recuerdo: { top: "#a8b8c8", hor: "#c8c2b2", fog: .008, hemi: 2.15, hemiG: "#8a7a60", sun: 1.75, sunCol: "#fff0d8", exp: 1.2, grade: ["#e8d0a8", .05], sol: [-.32, 1, .3], sombra: 84 } };
const ENV_VIENTO = { ...ENV_CIELO_PUEBLO, ventoso: ENV_CIELO_PUEBLO.bajo, tormenta: ENV_CIELO_PUEBLO.bajo };   // compatibilidad con escenas viejas
// el «sol» (luz direccional): las escenas pueden mover el centro de las sombras (SOL.x, SOL.z, SOL.r) y la dirección (SOL.dir = [x, y, z] hacia la luz)
const SOL = { x: 0, z: 0, r: null, dir: null };
function ambiente(t) { const A = ENV[ENVNOW] || {}, d = SOL.dir || A.sol || [-.28, 1, .32], l = Math.hypot(d[0], d[1], d[2]), cy = SUELO(SOL.x, SOL.z), R0 = SOL.r || A.sombra || 84; AMB.t = t; AMB.cam = [cam.position.x, cam.position.y, cam.position.z];
  sun.position.set(SOL.x + d[0] / l * 140, cy + d[1] / l * 140, SOL.z + d[2] / l * 140); sun.target.position.set(SOL.x, cy, SOL.z); sun.target.updateMatrixWorld();
  { const c = sun.shadow.camera; if (c.right !== R0) { c.left = -R0; c.right = R0; c.top = R0; c.bottom = -R0; c.near = 1; c.far = 330; c.updateProjectionMatrix() } }
  VIENTO.value = t; POLVO_U.uT.value = t; if (POLVO_M.visible) callePolvo(POLVO_U.uD.value); barriletes(t) }
// deja todo lo animado del pueblo en su estado de reposo (llamar al empezar cada cuadro, antes de ambiente): manivelas quietas y enteras, tornillos
// engrasados, techos sanos, sin polvillo, Tanner APLASTADA (el presente), el tajo de Pole Nine a la vista, escalera de Kell puesta, tapa de prueba apagada
function mundoReset() { for (let i = 0; i < POSTES.length; i++) if (POSTES[i].cab) { manivelaRota(i, 0); manivelaGiro(i, 0); posteGrasa(i, 1); if (i !== POSTE_9T) posteBaja(i, 0) }
  techosRajan(0); callePolvo(0); tannerEstado(1); poste9Corte(true); escaleraKell(true); campana(0); puebloTapaPrueba(false); KITE_E.vis = true; SOL.x = 0; SOL.z = 0; SOL.r = null; SOL.dir = null }
mundoReset();

// ---------- compatibilidad con las escenas viejas (Gusthollow): no hacen nada
const veleta = () => { }, VELETA_W = () => POSTE_TOP(POSTE_MI), TECHO_W = () => POSTE_TOP(POSTE_MI), cadenasRotas = () => { }, techoPanaderia = () => { }, humoInclinacion = () => { }, tormenta = () => { };
function vientoFuerza(f) { RAFAGA.value = .35 * Math.max(0, f) }
const CASAS_V = CASAS_P, MI_CASA = CASA_NARRADOR, PUNTOS = { sopa: [6, -5.6], boda: [0, 5.5], bebe: CASILLAS[POSTE_MI].puerta.filter((_, i) => i !== 1) };
