// ================= GUSTHOLLOW: detalle (utilería de pueblo de montaña, lugares de las frases), efectos de viento, tormenta y luz =================
// ---------- texturas y materiales de la utilería
const T_TRAMA_D = tex(256, 256, (g, w, h) => { g.fillStyle = "#808080"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 4) { g.fillStyle = y % 8 ? "rgba(255,255,255,.2)" : "rgba(0,0,0,.22)"; g.fillRect(0, y, w, 2) } for (let x = 0; x < w; x += 4) { g.fillStyle = x % 8 ? "rgba(255,255,255,.14)" : "rgba(0,0,0,.16)"; g.fillRect(x, 0, 2, h) } }, [6, 6]);
// telas: lisas, a rayas y a cuadros, pintadas con desgaste (la ropa tendida, el toldo, los banderines)
const T_TELA_V = (seed, base, tipo, alt) => tex(256, 256, (g, w, h) => { const r = rng(seed); g.fillStyle = base; g.fillRect(0, 0, w, h);
  if (tipo === 1) for (let x = 0; x < w; x += 32) { g.fillStyle = alt; g.fillRect(x, 0, 12 + r() * 4, h) }
  if (tipo === 2) { g.globalAlpha = .55; for (let x = 0; x < w; x += 42) { g.fillStyle = alt; g.fillRect(x, 0, 18, h); g.fillRect(0, x, w, 18) } g.globalAlpha = 1 }
  for (let k = 0; k < 700; k++) { g.fillStyle = r() < .5 ? "rgba(255,255,250,.08)" : "rgba(40,30,20,.08)"; g.fillRect(r() * w, r() * h, 2 + r() * 20, 1.5) }
  const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, "rgba(40,30,20,.15)"); gr.addColorStop(.15, "rgba(40,30,20,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h) });
const ROPA_P = [["#efe9da", 0], ["#3e5a88", 0], ["#a8402e", 1, "#efe9da"], ["#d8a83a", 0], ["#5a7a44", 2, "#2e4a2a"], ["#e8d6c0", 1, "#7a5a8a"], ["#8a3a3a", 2, "#3a2a2a"], ["#6a8ab0", 1, "#e8e8f0"], ["#c8bca4", 0], ["#d86a3a", 0]];
const M_ROPA = ROPA_P.map(([b, t, a], i) => conViento(new THREE.MeshStandardMaterial({ map: T_TELA_V(5100 + i, b, t, a), bumpMap: T_TRAMA_D, bumpScale: 1.5, roughness: .95 }), "tela", .085));
const M_BANDERIN = ["#c8402e", "#e8c040", "#3a6aa8", "#efe9da", "#4a8a4a", "#d86a2a"].map(c => conViento(new THREE.MeshStandardMaterial({ color: c, bumpMap: T_TRAMA_D, bumpScale: 1, roughness: .9 }), "tela", .035));
const T_RAYAS_T = tex(512, 512, (g, w, h) => { const r = rng(5120); for (let x = 0; x < w; x += 64) { g.fillStyle = (x / 64) % 2 ? "#efe6d0" : "#b8402e"; g.fillRect(x, 0, 64, h) } for (let q = 0; q < 900; q++) { g.fillStyle = r() < .5 ? "rgba(255,245,225,.12)" : "rgba(60,40,26,.14)"; g.fillRect(r() * w, r() * h, 2 + r() * 30, 2) } });
const M_TOLDO = conViento(new THREE.MeshStandardMaterial({ map: T_RAYAS_T, bumpMap: T_TRAMA_D, bumpScale: 1.5, roughness: .95 }), "toldo", .14);
const T_MANGA = tex(256, 64, (g, w, h) => { for (let x = 0; x < w; x += 51.2) { g.fillStyle = (x / 51.2 | 0) % 2 ? "#f0ece0" : "#d8462e"; g.fillRect(x, 0, 52, h) } });
const M_MANGA = conViento(new THREE.MeshStandardMaterial({ map: T_MANGA, bumpMap: T_TRAMA_D, bumpScale: 1, roughness: .9 }), "tela", .06);
const T_CERAM = (base, banda) => tex(256, 128, (g, w, h) => { const r = rng(5130 + base.length); g.fillStyle = base; g.fillRect(0, 0, w, h); g.fillStyle = banda; g.fillRect(0, h * .2, w, 8); g.fillRect(0, h * .32, w, 3); for (let k = 0; k < 200; k++) { g.fillStyle = r() < .5 ? "rgba(60,30,16,.12)" : "rgba(255,240,220,.14)"; g.beginPath(); g.ellipse(r() * w, r() * h, 2 + r() * 10, 1 + r() * 5, 0, 0, 7); g.fill() } });
const M_TAZA = [["#e8dcc0", "#3a5a8a"], ["#b8603a", "#efe3c8"], ["#4a6a8a", "#efe3c8"], ["#d8c070", "#8a3a2a"], ["#6a8a5a", "#efe3c8"]].map(([b, c]) => new THREE.MeshStandardMaterial({ map: T_CERAM(b, c), roughness: .4 }));
const M_BARRIL = (() => { const [c, z] = pintarDoble(256, 256, (c, z, w, h) => { const r = rng(5140); let x = 0; z.fillStyle = "#808080"; z.fillRect(0, 0, w, h); while (x < w) { const pw = 22 + r() * 10; c.fillStyle = rgbj("#8a6440", r, 26); c.fillRect(x, 0, pw, h); for (let k = 0; k < 10; k++) { c.strokeStyle = "rgba(50,34,20,.3)"; c.lineWidth = 1; const xx = x + r() * pw; c.beginPath(); c.moveTo(xx, 0); c.lineTo(xx + (r() - .5) * 4, h); c.stroke() } c.fillStyle = "rgba(30,20,12,.7)"; c.fillRect(x + pw - 2, 0, 2, h); z.fillStyle = "#202020"; z.fillRect(x + pw - 3, 0, 3, h); x += pw } }); return new THREE.MeshStandardMaterial({ map: c, bumpMap: z, bumpScale: 2.5, roughness: .9 }) })();
const M_BRASA = new THREE.MeshStandardMaterial({ color: "#3a1a0a", emissive: "#ff5a1a", emissiveIntensity: 1.2, roughness: 1 });
const M_HIERRO_N = new THREE.MeshStandardMaterial({ color: "#232120", roughness: .55, metalness: .7 });
const M_PAN = new THREE.MeshStandardMaterial({ color: "#c08040", roughness: .75, bumpMap: T_TRAMA_D, bumpScale: 1 });
const M_PASTO_SECO = new THREE.MeshStandardMaterial({ color: "#c8b468", roughness: 1 });
const PB = lote(), PBV = lote(), PROP_CAD = [], PROP_HUMO = [];
const PB_M = { madera: M_MADERA, maderaV: M_MADERA_V, viga: M_VIGA, hierro: M_HIERRO, hierroO: M_HIERRO_O, hierroN: M_HIERRO_N, soga: M_SOGA, piedra: M_ROCA_G, piedraC: M_PIEDRA_C, zocalo: M_ZOCALO, barril: M_BARRIL, brasa: M_BRASA, oscuro: M_OSCURO, pan: M_PAN, terracota: M_TERRACOTA, paja: M_PASTO_SECO, blanco: SM("#efe9dc", { roughness: .8 }), verde: SM("#4e7032", { roughness: .8 }), cuero: SM("#5a3e2a", { roughness: .85 }), saco: new THREE.MeshStandardMaterial({ color: "#d6c8a8", bumpMap: T_TRAMA_D, bumpScale: 3, roughness: 1 }) };
M_TAZA.forEach((m, i) => PB_M["taza" + i] = m); M_PUERTA.forEach((m, i) => PB_M["col" + i] = m); ["#f4f0e0", "#e8c838", "#8a6ab8", "#d84a6a", "#f0a040"].forEach((c, i) => PB_M["flor" + i] = SM(c, { roughness: .6 }));
const PBV_M = { toldo: M_TOLDO, manga: M_MANGA }; M_ROPA.forEach((m, i) => PBV_M["ropa" + i] = m); M_BANDERIN.forEach((m, i) => PBV_M["ban" + i] = m);

// ---------- piezas sueltas (cada función agrega geometría a un lote con la matriz del lugar)
const barril = (L, M) => { const g = new THREE.CylinderGeometry(.34, .34, .9, 14, 4), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const k = 1 + .16 * Math.cos(p.getY(i) / .45 * 1.57); p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k) } g.computeVertexNormals(); L.add("barril", g, M.clone().multiply(TM(0, .45, 0))); for (const y of [.14, .45, .76]) L.add("hierroN", new THREE.TorusGeometry(y === .45 ? .395 : .365, .018, 4, 18), M.clone().multiply(TM(0, y, 0, Math.PI / 2))); L.add("madera", new THREE.CylinderGeometry(.33, .33, .03, 14), M.clone().multiply(TM(0, .9, 0))) };
const cuerda = (L, a, b, r = .018) => { const [g, m] = cilEntre(a, b, r, 4); L.add("soga", g, m) };
// botas de hierro (el par): suela gruesa, caña con remaches, puntera redonda, hebilla; s = escala (las de bebé son chicas)
const GEO_BOTA = (() => { const L = []; L.push([RB1(.15, .07, .32, .02), TM(0, .035, .02)], [RB1(.13, .3, .14, .03), TM(0, .2, -.05)], [new THREE.SphereGeometry(.075, 10, 6, 0, 6.283, 0, Math.PI / 2), TM(0, .065, .11, 0, 0, 0, 1, 1.1, 1.3)], [new THREE.TorusGeometry(.075, .012, 4, 12), TM(0, .34, -.05, Math.PI / 2, 0, 0, 1, 1.05, 1)]);
  for (const y of [.12, .22, .3]) for (const s of [-1, 1]) L.push([new THREE.SphereGeometry(.012, 5, 4), TM(s * .066, y, -.02)]); return mergeG(L) })();
const parBotas = (L, M, s = 1) => { L.add("hierroN", GEO_BOTA, M.clone().multiply(TM(-.1 * s, 0, 0, 0, .1, 0, s))); L.add("hierroN", GEO_BOTA, M.clone().multiply(TM(.1 * s, 0, .03 * s, 0, -.06, 0, s))) };
// pesa de piedra colgada de una soga (en las puertas y en los aleros)
const pesa = (L, P, largo = .55, s = .2) => { cuerda(L, P, [P[0], P[1] - largo, P[2]], .014); L.add("piedra", GEO_PIEDRAS[1], TM(P[0], P[1] - largo - s * .6, P[2], 0, 0, 0, s, s * .9, s)); L.add("soga", new THREE.TorusGeometry(s * .9, .016, 4, 12), TM(P[0], P[1] - largo - s * .45, P[2], Math.PI / 2)) };
const banco = (L, M) => { L.add("madera", new THREE.BoxGeometry(1.6, .08, .38), M.clone().multiply(TM(0, .46, 0))); for (const s of [-1, 1]) L.add("maderaV", new THREE.BoxGeometry(.08, .44, .34), M.clone().multiply(TM(s * .66, .22, 0))) };
// leña apilada con un techito de tablas y piedras encima, atada con soga
function lena(L, M, r, an = 1.6) { for (let f = 0; f < 5; f++) for (let k = 0; k < Math.round(an / .2) - (f % 2); k++) L.add(k % 3 ? "madera" : "maderaV", new THREE.CylinderGeometry(.085 + r() * .02, .09, .52, 7), M.clone().multiply(TM(-an / 2 + .1 + k * .2 + (f % 2) * .1, .09 + f * .165, 0, Math.PI / 2, 0, 0)));
  L.add("maderaV", new THREE.BoxGeometry(an + .3, .05, .8), M.clone().multiply(TM(0, .95, 0, .08, 0, 0))); for (let k = 0; k < 3; k++) L.add("piedra", GEO_PIEDRAS[k % 3], M.clone().multiply(TM(-an / 2 + .3 + k * an / 2.6, 1.07, (r() - .5) * .3, 0, r() * 6, 0, .17)));
  for (const x of [-an * .3, an * .3]) L.add("soga", new THREE.TorusGeometry(.5, .015, 4, 16, Math.PI), M.clone().multiply(TM(x, .5, 0, 0, Math.PI / 2, 0, 1, 1, .62))) }
const rueda = (L, M, R = .55) => { L.add("maderaV", new THREE.TorusGeometry(R, .055, 6, 20), M); L.add("hierroN", new THREE.TorusGeometry(R + .045, .022, 4, 20), M); L.add("madera", new THREE.CylinderGeometry(.1, .1, .2, 10), M.clone().multiply(TM(0, 0, 0, Math.PI / 2))); for (let k = 0; k < 8; k++) L.add("maderaV", new THREE.CylinderGeometry(.028, .032, R * 2, 5), M.clone().multiply(TM(0, 0, 0, 0, 0, k / 8 * Math.PI))) };
// carro con cuñas en las ruedas y atado a una estaca (si no, se va solo)
function carro(L, M, r, carga = 0) { const an = 1.25, la = 2.3; L.add("maderaV", new THREE.BoxGeometry(an, .08, la), M.clone().multiply(TM(0, .72, 0))); for (const s of [-1, 1]) { L.add("maderaV", new THREE.BoxGeometry(.06, .4, la), M.clone().multiply(TM(s * an / 2, .94, 0))); rueda(L, M.clone().multiply(TM(s * (an / 2 + .14), .6, .1, 0, Math.PI / 2, 0))); L.add("madera", new THREE.CylinderGeometry(.04, .045, 2.2, 6), M.clone().multiply(TM(s * .4, .45, 2.1, 1.33, 0, 0)));
    for (const dz of [-.62, .82]) L.add("madera", new THREE.BoxGeometry(.14, .2, .3), M.clone().multiply(TM(s * (an / 2 + .14), .08, .1 + dz, dz > 0 ? -.5 : .5, 0, 0))) }
  L.add("maderaV", new THREE.BoxGeometry(an, .4, .06), M.clone().multiply(TM(0, .94, -la / 2))); L.add("madera", new THREE.CylinderGeometry(.05, .05, an + .4, 7), M.clone().multiply(TM(0, .6, .1, 0, 0, Math.PI / 2)));
  if (carga === 0) { for (let k = 0; k < 4; k++) { const s = new THREE.SphereGeometry(.3, 10, 7); s.scale(1, .62, 1.4); L.add("cuero", s, M.clone().multiply(TM((k % 2 - .5) * .55, .95, -.5 + (k >> 1) * .75, 0, r() * .5, 0))) } }
  else for (let k = 0; k < 8; k++) L.add(k % 3 ? "madera" : "maderaV", new THREE.CylinderGeometry(.09, .1, 1.9, 7), M.clone().multiply(TM(-.4 + (k % 4) * .27, .85 + (k >> 2) * .18, 0, Math.PI / 2, 0, 0)));
  // dos sogas cruzadas sobre la carga, a argollas del costado
  for (const s of [-1, 1]) { const a = new THREE.Vector3(-an / 2, .8, s * .7).applyMatrix4(M).toArray(), b = new THREE.Vector3(an / 2, .8, -s * .5).applyMatrix4(M).toArray(); a[1] += .35; b[1] += .35; cuerda(L, a, b, .016) } }
// tendedero: dos postes en T con su viento de soga, la soga a lo largo de z y la ropa volando horizontal hacia +x
function tendedero(x, z, L2, r, alto = 2.3) { const y0 = SUELO(x, z - L2 / 2), y1 = SUELO(x, z + L2 / 2), A = [x, y0 + alto, z - L2 / 2], B = [x, y1 + alto, z + L2 / 2];
  for (const [p, y] of [[A, y0], [B, y1]]) { PB.add("maderaV", new THREE.CylinderGeometry(.05, .065, alto + .5, 7), TM(p[0], y + (alto + .5) / 2 - .3, p[2], 0, 0, (r() - .5) * .05)); PB.add("maderaV", new THREE.BoxGeometry(.08, .08, .5), TM(p[0], p[1] + .08, p[2]));
    cuerda(PB, [p[0], p[1], p[2]], [p[0] - 1.6, SUELO(p[0] - 1.6, p[2]) + .05, p[2]], .012); PB.add("hierroO", new THREE.CylinderGeometry(.03, .03, .3, 5), TM(p[0] - 1.6, SUELO(p[0] - 1.6, p[2]) + .1, p[2], 0, 0, .4)) }
  const N = 8, pt = q => [x, lerp(A[1], B[1], q) - Math.sin(q * Math.PI) * .12, lerp(A[2], B[2], q)]; for (let k = 0; k < N; k++) cuerda(PB, pt(k / N), pt((k + 1) / N), .012);
  let q = .06; while (q < .92) { const an = .45 + r() * .55, la = .55 + r() * .75, g = new THREE.PlaneGeometry(la, an, 7, 3); g.rotateX(-Math.PI / 2); g.translate(la / 2, 0, 0); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) - (p.getX(i) / la) ** 2 * .1);
    const P = pt(q + an / L2 / 2); PBV.add("ropa" + (r() * M_ROPA.length | 0), g, TM(P[0] + .01, P[1] - .02, P[2], 0, 0, -.32 - r() * .2)); for (const dz of [-an / 2 + .06, an / 2 - .06]) PB.add("maderaV", new THREE.BoxGeometry(.03, .09, .025), TM(P[0], P[1], P[2] + dz)); q += an / L2 + .03 + r() * .06 } ocupa(x + .6, z, L2 / 2 + .4) }
// banderines: soga de A a B con triángulos de tela que vuelan horizontales hacia +x
function banderines(A, B, r, sag = .5) { const L2 = Math.hypot(B[0] - A[0], B[1] - A[1], B[2] - A[2]), N = Math.max(4, Math.round(L2 / .45)), pt = q => [lerp(A[0], B[0], q), lerp(A[1], B[1], q) - Math.sin(q * Math.PI) * sag, lerp(A[2], B[2], q)];
  for (let k = 0; k < 10; k++) cuerda(PB, pt(k / 10), pt((k + 1) / 10), .011);
  for (let k = 1; k < N; k++) { const P = pt(k / N), b = .3, la = .42, g = new THREE.PlaneGeometry(la, b, 4, 1); g.rotateX(-Math.PI / 2); g.translate(la / 2, 0, 0); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, p.getZ(i) * (1 - p.getX(i) / la)); PBV.add("ban" + k % 6, g, TM(P[0], P[1] - .02, P[2], 0, (r() - .5) * .3, 0)) } }
// manga de viento a rayas, siempre estirada hacia +x
function mangaViento(x, z, alto = 4.2) { const y = SUELO(x, z); PB.add("maderaV", new THREE.CylinderGeometry(.06, .08, alto, 7), TM(x, y + alto / 2, z)); PB.add("hierro", new THREE.TorusGeometry(.2, .02, 5, 14), TM(x + .1, y + alto - .05, z, 0, Math.PI / 2, 0)); PB.add("hierro", new THREE.CylinderGeometry(.015, .015, .3, 4), TM(x + .05, y + alto - .05, z, 0, 0, Math.PI / 2));
  const g = new THREE.CylinderGeometry(.1, .2, 1.7, 12, 6, true); g.rotateZ(-Math.PI / 2); g.translate(.85, 0, 0); const p = g.attributes.position, u = g.attributes.uv; for (let i = 0; i < p.count; i++) { u.setXY(i, p.getX(i) / 1.7, u.getX(i)); p.setY(i, p.getY(i) - (p.getX(i) / 1.7) ** 2 * .08) } PBV.add("manga", g, TM(x + .12, y + alto - .05, z)); ocupa(x, z, .5) }
const flores3D = (L, M, n, r, an = .8, prof = .2) => { for (let k = 0; k < n; k++) { const x = (r() - .5) * an, z = (r() - .5) * prof, h = .12 + r() * .14; L.add("verde", new THREE.CylinderGeometry(.008, .01, h, 4), M.clone().multiply(TM(x, h / 2, z, 0, 0, .25))); const c = "flor" + (r() * 5 | 0); for (let p = 0; p < 5; p++) { const a = p / 5 * 6.283; L.add(c, new THREE.SphereGeometry(.026, 5, 3), M.clone().multiply(TM(x + h * .12 + Math.cos(a) * .028, h, z + Math.sin(a) * .028, 0, -a, 0, 1.3, .35, .8))) } L.add("flor1", new THREE.SphereGeometry(.015, 5, 3), M.clone().multiply(TM(x + h * .12, h + .01, z))) } };

// ---------- cada casa con lo suyo: pesa en la puerta, botas de hierro en el escalón, macetero, leña, barril atado, banco, carro, tendedero
CASAS_V.forEach((C, ci) => { const r = rng(5200 + ci * 13), R0 = RECTS.find(R => R.casa === C), at = (...a) => C.HM.clone().multiply(TM(...a)), W = (x, y, z) => new THREE.Vector3(x, y, z).applyMatrix4(C.HM), fr = C.d / 2, { w, d, h } = C;
  const lib = (lx, lz, rad) => { const p = W(lx, 0, lz); return libreEn(p.x, p.z, rad, { salvo: R0, zona: 1 }) && !(Math.hypot(p.x, p.z) < 11.5 && C !== PANAD_C) }, gy = (lx, lz) => { const p = W(lx, 0, lz); return SUELO(p.x, p.z) - C.y0 };
  // pesa de piedra colgada del aro de la puerta
  pesa(PB, W(C.px + C.dw / 2 - .2, C.dh * .48 - .06, fr + .13).toArray(), .5, .14 + r() * .05);
  // botas de hierro en el escalón (las de la familia), a veces un par chiquito
  const nb = 1 + (r() * 2.4 | 0); for (let k = 0; k < nb; k++) { const s = k === 2 ? .62 : 1, sx = (k % 2 ? 1 : -1) * (C.dw / 2 + .32 + (k >> 1) * .42); parBotas(PB, at(C.px + sx, .1, fr + .38, 0, (r() - .5) * .6, 0), s) }
  // macetero con flores bajo una ventana del frente
  if (r() < .45 || C === MI_CASA) { const vx = C.px + (r() < .5 ? -1 : 1) * (C.dw / 2 + 1.05); if (Math.abs(vx) + .6 < w / 2) { const y = (C.dos ? 1.05 : 1.15) - .12; PB.add("madera", new THREE.BoxGeometry(1.05, .2, .24), at(vx, y - .02, fr + .2)); PB.add("oscuro", new THREE.BoxGeometry(.96, .02, .18), at(vx, y + .07, fr + .2)); flores3D(PB, at(vx, y + .06, fr + .2), 9, r, .9, .14) } }
  // leña contra un frontón (a sotavento, +x local o −x)
  if (r() < .4) { const s = r() < .5 ? 1 : -1, z0 = (r() - .5) * (d - 2.4); if (lib(s * (w / 2 + .45), z0, .9)) { ocupa(W(s * (w / 2 + .45), 0, z0).x, W(s * (w / 2 + .45), 0, z0).z, .9); lena(PB, at(s * (w / 2 + .42), gy(s * (w / 2 + .42), z0), z0, 0, s * Math.PI / 2, 0), r, 1.4 + r() * .6) } }
  // barril atado a una argolla del muro
  if (r() < .45) { const x0 = (r() - .5) * (w - 1.6), z0 = -fr - .45; if (lib(x0, z0, .5)) { const p = W(x0, 0, z0); ocupa(p.x, p.z, .5); barril(PB, at(x0, gy(x0, z0), z0, 0, r() * 6, 0)); PB.add("hierro", new THREE.TorusGeometry(.06, .014, 4, 10), at(x0, .75, -fr - .02)); for (const y of [.3, .62]) PB.add("soga", new THREE.TorusGeometry(.4, .016, 4, 18), at(x0, gy(x0, z0) + y, z0 + .02, Math.PI / 2, 0, 0, 1, 1.08, 1)) } }
  // banco al lado de la puerta
  if (r() < .35 && C !== PANAD_C) { const s = C.px > 0 ? -1 : 1, x0 = C.px + s * (C.dw / 2 + 1.4); if (Math.abs(x0) + .8 < w / 2 && lib(x0, fr + .4, .7)) banco(PB, at(x0, gy(x0, fr + .4), fr + .38)) }
  // carro con cuñas, atado a una estaca
  if (r() < .16) { const s = r() < .5 ? 1 : -1, x0 = s * (w / 2 + 2.6), z0 = (r() - .5) * 2; if (lib(x0, z0, 1.9) && lib(x0, z0 + 2, 1.2)) { const p = W(x0, 0, z0); ocupa(p.x, p.z, 2); ocupa(W(x0, 0, z0 + 2).x, W(x0, 0, z0 + 2).z, 1.3); const M = at(x0, gy(x0, z0), z0, 0, (r() - .5) * .4, 0); carro(PB, M, r, r() < .5 ? 0 : 1);
    const e = new THREE.Vector3(-1.3, 0, -1.6).applyMatrix4(M), ey = SUELO(e.x, e.z); PB.add("hierroO", new THREE.CylinderGeometry(.04, .05, .5, 6), TM(e.x, ey + .2, e.z, .2, 0, .2)); cuerda(PB, new THREE.Vector3(-.62, .9, -1).applyMatrix4(M).toArray(), [e.x, ey + .42, e.z], .016) } }
  // pesas extra colgando de las esquinas del alero de algunas casas
  if (r() < .3) for (const an of C.anclas.slice(0, 2)) pesa(PB, [an.a[0], an.a[1] - .05, an.a[2]], .8 + r() * .4, .2) });
// tendederos (la soga a lo largo de z; la ropa vuela hacia +x): al lado de las casas más cercanas a la plaza, donde haya lugar
const TENDEDEROS = []; { const r = rng(5300), cand = CASAS_V.slice().sort((a, b) => Math.hypot(a.x, a.z) - Math.hypot(b.x, b.z));
  const ok = (x, z, L2) => Math.hypot(x, z) > 12.5 && sendaK(x, z) < .3 && [-.5, -.25, 0, .25, .5].every(q => libreEn(x, z + q * L2, .3, { zona: 1, mc: -.3 }) && libreEn(x + 1.1, z + q * L2, .3, { zona: 1, mc: -.3 }));
  for (const C of cand) { if (TENDEDEROS.length >= 14) break; if (C === PANAD_C) continue; const L2 = 3.4 + r() * 1.4; let hecho = false;
    for (const [dx, dz] of [[C.w / 2 + 4, 0], [-C.w / 2 - 4, 0], [0, -C.d / 2 - 4], [C.w / 2 + 5.5, 2], [-C.w / 2 - 5.5, -2], [0, C.d / 2 + 5.5]]) { const p = new THREE.Vector3(dx, 0, dz).applyMatrix4(C.HM); if (ok(p.x, p.z, L2)) { tendedero(p.x, p.z, L2, r); TENDEDEROS.push([+p.x.toFixed(1), +p.z.toFixed(1)]); hecho = true; break } }
    if (!hecho) continue } }
// ---------- LOS LUGARES DE LAS FRASES
// el puesto de sopa de la vieja Marta: mostrador de tablas, toldo a rayas atado tirante a estacas, olla de hierro sobre brasas, tazas con tapa
const SOPA_HUMO = []; { const r = rng(5400), [x, z] = PUNTOS.sopa, y = SUELO(x, z), M = TM(x, y, z, 0, -Math.PI / 2, 0), at = (...a) => M.clone().multiply(TM(...a));
  // mostrador (frente hacia la plaza = +z local = oeste)
  PB.add("maderaV", new THREE.BoxGeometry(2.6, .95, .7), at(0, .48, .4)); PB.add("madera", new THREE.BoxGeometry(2.85, .08, .92), at(0, .99, .45)); for (let k = 0; k < 6; k++) PB.add("madera", new THREE.BoxGeometry(.06, .9, .02), at(-1.1 + k * .44, .46, .76));
  // postes y toldo inclinado (tela atada: se mueve en el medio, no en las orillas)
  for (const [sx, sz, hh] of [[-1, 1, 2.45], [1, 1, 2.45], [-1, -1, 2.05], [1, -1, 2.05]]) PB.add("madera", new THREE.CylinderGeometry(.05, .06, hh, 7), at(sx * 1.4, hh / 2, sz * .7 + .2));
  { const g = new THREE.PlaneGeometry(3.2, 1.9, 10, 6), p = g.attributes.position, u = g.attributes.uv; for (let i = 0; i < p.count; i++) { const U = u.getX(i), V = u.getY(i); p.setZ(i, p.getZ(i) - Math.sin(U * Math.PI) * Math.sin(V * Math.PI) * .12) } g.rotateX(-Math.PI / 2 + .21); PBV.add("toldo", g, at(0, 2.3, .2)) }
  for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) { const a = [sx * 1.58, sz > 0 ? 2.5 : 2.1, sz * .95 + .2], e = [sx * 2.4, 0, sz * 1.9 + .2]; const Aw = new THREE.Vector3(...a).applyMatrix4(M).toArray(), Ew = new THREE.Vector3(...e).applyMatrix4(M); Ew.y = SUELO(Ew.x, Ew.z); cuerda(PB, Aw, [Ew.x, Ew.y + .25, Ew.z], .014); PB.add("hierroO", new THREE.CylinderGeometry(.03, .04, .4, 5), TM(Ew.x, Ew.y + .14, Ew.z, .2 * sz, 0, .2 * sx)); PB.add("piedra", GEO_PIEDRAS[0], TM(Ew.x + .12, Ew.y + .06, Ew.z, 0, r() * 6, 0, .2)) }
  // la olla grande sobre un aro de piedras con brasas, tapa entreabierta y cucharón; vapor que sale de costado
  { const O = at(-1.95, 0, .5); for (let k = 0; k < 9; k++) { const a = k / 9 * 6.283; PB.add("piedra", GEO_PIEDRAS[k % 3], O.clone().multiply(TM(Math.cos(a) * .55, .12, Math.sin(a) * .55, 0, r() * 6, 0, .2))) } PB.add("oscuro", new THREE.CylinderGeometry(.46, .48, .06, 12), O.clone().multiply(TM(0, .04, 0))); for (let k = 0; k < 7; k++) PB.add("brasa", GEO_PIEDRAS[k % 3], O.clone().multiply(TM((r() - .5) * .5, .1, (r() - .5) * .5, 0, r() * 6, 0, .09)));
    for (let k = 0; k < 3; k++) { const a = k / 3 * 6.283; PB.add("hierroN", new THREE.CylinderGeometry(.02, .02, .55, 4), O.clone().multiply(TM(Math.cos(a) * .4, .27, Math.sin(a) * .4, 0, -a, .25))) }
    const og = new THREE.LatheGeometry([[0, 0], [.3, .02], [.42, .14], [.46, .34], [.44, .52], [.4, .56], [.38, .55]].map(q => new THREE.Vector2(q[0], q[1])), 18); PB.add("hierroN", og, O.clone().multiply(TM(0, .5, 0))); PB.add("brasa", new THREE.CircleGeometry(.37, 14), O.clone().multiply(TM(0, .98, 0, -Math.PI / 2)));
    PB.add("hierroN", new THREE.CylinderGeometry(.4, .4, .03, 16), O.clone().multiply(TM(.1, 1.08, -.05, .35, 0, .1))); PB.add("hierroN", new THREE.SphereGeometry(.05, 8, 6), O.clone().multiply(TM(.1, 1.12, -.05))); PB.add("madera", new THREE.CylinderGeometry(.02, .02, .9, 5), O.clone().multiply(TM(-.15, 1.2, .1, .3, 0, .5)));
    for (const s of [-1, 1]) PB.add("hierroN", new THREE.TorusGeometry(.08, .015, 4, 10), O.clone().multiply(TM(s * .46, .95, 0, 0, Math.PI / 2, 0))); SOPA_HUMO.push(new THREE.Vector3(0, 1.1, 0).applyMatrix4(O)) }
  // las tazas con tapa: en fila sobre el mostrador y apiladas en una bandeja
  const taza = (Mt, k) => { PB.add("taza" + k % 5, new THREE.CylinderGeometry(.075, .062, .13, 12), Mt.clone().multiply(TM(0, .065, 0))); PB.add("taza" + (k + 2) % 5, new THREE.CylinderGeometry(.082, .082, .02, 12), Mt.clone().multiply(TM(0, .14, 0))); PB.add("taza" + (k + 2) % 5, new THREE.SphereGeometry(.024, 6, 4), Mt.clone().multiply(TM(0, .16, 0))); PB.add("taza" + k % 5, new THREE.TorusGeometry(.04, .012, 4, 8, Math.PI * 1.2), Mt.clone().multiply(TM(.08, .07, 0, 0, 0, -Math.PI * .6))) };
  for (let k = 0; k < 9; k++) taza(at(-1.1 + k * .2, 1.03, .62 + (k % 2) * .06, 0, r() * 6, 0), k);
  PB.add("madera", new THREE.BoxGeometry(.6, .03, .42), at(.85, 1.045, .3)); for (let k = 0; k < 6; k++) taza(at(.65 + (k % 3) * .19, 1.06 + (k > 2 ? .17 : 0), .22 + (k % 2) * .14, 0, r() * 6, 0), k + 3);
  // tablero de tiza «SOUP» atado con cadena, banquito, barril y leña para el fuego
  { const T = tex(256, 192, (g, w, h) => { g.fillStyle = "#26302a"; g.fillRect(0, 0, w, h); g.strokeStyle = "#8a6a44"; g.lineWidth = 14; g.strokeRect(0, 0, w, h); g.fillStyle = "rgba(240,236,220,.92)"; g.font = "bold 74px 'Comic Sans MS', 'Segoe Print', sans-serif"; g.textAlign = "center"; g.fillText("SOUP", w / 2, 92); g.font = "bold 34px 'Comic Sans MS', sans-serif"; g.fillText("hot  ·  lids on", w / 2, 150); const r2 = rng(5410); for (let k = 0; k < 400; k++) { g.fillStyle = "rgba(255,255,255,.06)"; g.fillRect(r2() * w, r2() * h, 6, 2) } });
    const tb = new THREE.Mesh(new THREE.PlaneGeometry(.9, .68), new THREE.MeshStandardMaterial({ map: T, roughness: .9 })); tb.position.copy(new THREE.Vector3(1.75, .62, 1.25).applyMatrix4(M)); tb.rotation.set(-.2, -Math.PI / 2 + .4, 0, "YXZ"); tb.castShadow = true; scene.add(tb);
    for (const s of [-1, 1]) PB.add("madera", new THREE.BoxGeometry(.05, 1.2, .05), at(1.75 + s * .38 * Math.cos(.4), .55, 1.25 + s * .38 * Math.sin(.4) - .12, -.2, .4, 0)); PB.add("piedra", GEO_PIEDRAS[2], at(1.75, .1, 1.05, 0, 0, 0, .25)) }
  PB.add("maderaV", new THREE.CylinderGeometry(.2, .2, .45, 10), at(-.6, .23, -.5)); barril(PB, at(1.4, 0, -.6)); lena(PB, at(-2.6, 0, -.9, 0, .3, 0), r, 1);
  PROP_CAD.push([new THREE.Vector3(-1.3, .4, .76).applyMatrix4(M).toArray(), new THREE.Vector3(-1.9, 0, 1.6).applyMatrix4(M).toArray()], [new THREE.Vector3(1.3, .4, .76).applyMatrix4(M).toArray(), new THREE.Vector3(1.9, 0, 1.6).applyMatrix4(M).toArray()]);
  banderines(new THREE.Vector3(-1.4, 2.4, .9).applyMatrix4(M).toArray(), new THREE.Vector3(1.4, 2.4, .9).applyMatrix4(M).toArray(), r, .15) }
// la boda: arco de piedra y madera con guirnalda de flores y cintas al viento, altar de piedra, dos argollas en el piso para atar a los novios, bancos encadenados
{ const r = rng(5500), [x, z] = PUNTOS.boda, y = SUELO(x, z), M = TM(x, y, z, 0, 0, 0), at = (...a) => M.clone().multiply(TM(...a));
  for (const s of [-1, 1]) { PB.add("zocalo", uvMuro(new THREE.BoxGeometry(.62, 2.5, .62), 2.4), at(s * 1.35, 1.25, 0)); PB.add("piedraC", RB1(.8, .16, .8, .04), at(s * 1.35, 2.58, 0)); PB.add("piedraC", RB1(.8, .2, .8, .04), at(s * 1.35, .1, 0)) }
  { const g = new THREE.TorusGeometry(1.35, .11, 8, 24, Math.PI); PB.add("viga", g, at(0, 2.66, 0)); const g2 = new THREE.TorusGeometry(1.35, .07, 6, 24, Math.PI); PB.add("madera", g2, at(0, 2.66, .14)) }
  // guirnalda: flores en 3D a lo largo del arco y hojas
  for (let k = 0; k < 46; k++) { const a = k / 45 * Math.PI, R = 1.35 + (r() - .5) * .1, P = at(Math.cos(a) * R, 2.66 + Math.sin(a) * R, .16 + (r() - .5) * .1); if (k % 2) PB.add("verde", new THREE.SphereGeometry(.07, 6, 4), P.clone().multiply(TM(0, 0, 0, 0, 0, 0, 1.4, .7, .5))); const c = "flor" + (k % 5); for (let p = 0; p < 5; p++) { const b = p / 5 * 6.283; PB.add(c, new THREE.SphereGeometry(.035, 5, 3), P.clone().multiply(TM(Math.cos(b) * .04, Math.sin(b) * .04, .04, 0, 0, 0, 1, 1, .4))) } }
  // cintas: tiras largas desde el arco, volando hacia +x
  for (let k = 0; k < 7; k++) { const a = .3 + k / 6 * (Math.PI - .6), P = new THREE.Vector3(Math.cos(a) * 1.4, 2.66 + Math.sin(a) * 1.4, .1).applyMatrix4(M), la = 1.2 + r() * .9, g = new THREE.PlaneGeometry(la, .07, 8, 1); g.rotateX(-Math.PI / 2); g.translate(la / 2, 0, 0); PBV.add("ban" + [3, 0, 1, 3, 4, 2, 3][k], g, TM(P.x, P.y - .05, P.z, 0, (r() - .5) * .3, 0)) }
  // altar (al norte del arco), florero, argollas en el piso y soga enrollada (para atar a la novia al novio)
  PB.add("piedraC", RB1(1.5, .95, .75, .06), at(0, .48, -1.2)); PB.add("zocalo", RB1(1.7, .14, .9, .04), at(0, .07, -1.2)); PB.add("terracota", new THREE.LatheGeometry([[0, 0], [.1, 0], [.14, .1], [.1, .24], [.12, .3]].map(q => new THREE.Vector2(q[0], q[1])), 12), at(.45, .96, -1.2)); flores3D(PB, at(.45, 1.2, -1.2), 7, r, .2, .2);
  for (const s of [-1, 1]) { PB.add("hierroO", new THREE.TorusGeometry(.11, .028, 6, 14), at(s * .45, .04, .6, Math.PI / 2 - .3, 0, 0)); PB.add("piedraC", RB1(.36, .06, .36, .02), at(s * .45, .02, .6)) } for (let k = 0; k < 4; k++) PB.add("soga", new THREE.TorusGeometry(.22 - k * .01, .025, 5, 16), at(.9, .97 + k * .045, -1.3, Math.PI / 2));
  // bancos para los invitados, encadenados al piso
  for (const [bx, bz] of [[-1.3, 2.4], [1.3, 2.4], [-1.3, 3.9], [1.3, 3.9]]) { banco(PB, at(bx, 0, bz)); PROP_CAD.push([new THREE.Vector3(bx - .66, .25, bz).applyMatrix4(M).toArray(), new THREE.Vector3(bx - 1.05, 0, bz + .3).applyMatrix4(M).toArray()]); const e = new THREE.Vector3(bx - 1.05, 0, bz + .3).applyMatrix4(M); PB.add("hierroO", new THREE.TorusGeometry(.07, .02, 5, 10), TM(e.x, SUELO(e.x, e.z) + .04, e.z, Math.PI / 2 - .3, 0, 0)) } }
// el rincón de la mamá: banco, cuna de madera encadenada a una laja con argollas, ropita de bebé tendida, botitas de hierro (el primer par), tina y canasto
const CUNA = new THREE.Group(); { const r = rng(5600), [x, z] = PUNTOS.bebe, y = SUELO(x, z), ry = Math.PI * .9, M = TM(x, y, z, 0, ry, 0), at = (...a) => M.clone().multiply(TM(...a));
  banco(PB, at(-.9, 0, -.3)); PB.add("zocalo", RB1(1.6, .1, 1, .03), at(.7, .03, .2));
  CUNA.position.copy(new THREE.Vector3(.7, .08, .2).applyMatrix4(M)); CUNA.rotation.y = ry; scene.add(CUNA);
  { const L = lote(); L.add("madera", new THREE.BoxGeometry(.9, .08, .5), TM(0, .22, 0)); for (const s of [-1, 1]) { L.add("madera", new THREE.BoxGeometry(.9, .3, .05), TM(0, .38, s * .23)); L.add("madera", new THREE.BoxGeometry(.05, .45, .5), TM(s * .45, .42, 0)); L.add("maderaV", new THREE.TorusGeometry(.5, .035, 5, 16, Math.PI * .45), TM(0, .52, s * .2, 0, 0, Math.PI * 1.275)) }
    const m = new THREE.SphereGeometry(.3, 10, 6); m.scale(1.3, .35, .7); L.add("tela", m, TM(-.05, .48, 0)); L.add("blanco", new THREE.SphereGeometry(.1, 8, 6), TM(.28, .5, 0, 0, 0, 0, 1, .7, 1)); L.fin(CUNA, { madera: M_MADERA, maderaV: M_MADERA_V, tela: M_ROPA[5], blanco: PB_M.blanco }) }
  for (const s of [-1, 1]) { PB.add("hierroO", new THREE.TorusGeometry(.06, .018, 5, 10), at(.7 + s * .7, .1, .2, Math.PI / 2)); PROP_CAD.push([new THREE.Vector3(.7 + s * .45, .3, .2).applyMatrix4(M).toArray(), new THREE.Vector3(.7 + s * .7, .1, .2).applyMatrix4(M).toArray()]) }
  parBotas(PB, at(-1.2, .5, -.3, 0, .3, 0), .45); parBotas(PB, at(-.6, .5, -.25, 0, -.2, 0), .45);
  PB.add("maderaV", new THREE.CylinderGeometry(.42, .36, .34, 14, 1, true), at(1.5, .17, -.9)); PB.add("oscuro", new THREE.CircleGeometry(.4, 14), at(1.5, .28, -.9, -Math.PI / 2)); for (const yy of [.06, .28]) PB.add("hierroN", new THREE.TorusGeometry(yy > .1 ? .415 : .37, .014, 4, 16), at(1.5, yy, -.9, Math.PI / 2));
  PB.add("paja", new THREE.LatheGeometry([[0, 0], [.2, 0], [.28, .16], [.3, .22]].map(q => new THREE.Vector2(q[0], q[1])), 12), at(-1.8, 0, .4));
  // ropita tendida en una soga corta entre dos palos
  { const A = new THREE.Vector3(-1.6, 0, 1.2).applyMatrix4(M), B = new THREE.Vector3(.4, 0, 1.3).applyMatrix4(M); for (const p of [A, B]) PB.add("maderaV", new THREE.CylinderGeometry(.035, .045, 1.8, 6), TM(p.x, SUELO(p.x, p.z) + .8, p.z)); const ya = SUELO(A.x, A.z) + 1.65, yb = SUELO(B.x, B.z) + 1.65; cuerda(PB, [A.x, ya, A.z], [B.x, yb, B.z], .01);
    for (let k = 0; k < 5; k++) { const q = .15 + k * .17, P = [lerp(A.x, B.x, q), lerp(ya, yb, q) - .03, lerp(A.z, B.z, q)], la = .3 + r() * .15, g = new THREE.PlaneGeometry(la, .24, 4, 2); g.rotateX(-Math.PI / 2); g.translate(la / 2, 0, 0); PBV.add("ropa" + [0, 5, 7, 0, 3][k], g, TM(...P)) } }
  ocupa(x, z, 2.6) }
// plaza: bancos de piedra encadenados, postes con banderines desde la torre, mangas de viento (en la plaza y arriba de la loma de Pip), un pozo con tapa
{ const r = rng(5700), ty = TORRE_Y;
  for (const [bx, bz] of [[-9.5, 6], [6.5, 6.8]]) { const yb = SUELO(bx, bz); PB.add("zocalo", RB1(1.9, .45, .5, .06), TM(bx, yb + .22, bz, 0, Math.atan2(-bx, -bz), 0)); PB.add("piedraC", RB1(2.1, .1, .62, .03), TM(bx, yb + .48, bz, 0, Math.atan2(-bx, -bz), 0)) }
  const postes = [[-8, 9.4], [8.8, 8.4]]; postes.forEach(([px, pz]) => { const yb = SUELO(px, pz); PB.add("viga", new THREE.CylinderGeometry(.08, .11, 6.4, 8), TM(px, yb + 3.1, pz)); PB.add("zocalo", RB1(.6, .4, .6, .05), TM(px, yb + .15, pz)); cuerda(PB, [px, yb + 6.1, pz], [px - 2.2, SUELO(px - 2.2, pz + 1.5) + .1, pz + 1.5], .014); PB.add("hierroO", new THREE.CylinderGeometry(.04, .04, .4, 5), TM(px - 2.2, SUELO(px - 2.2, pz + 1.5) + .1, pz + 1.5, .3, 0, .3)); ocupa(px, pz, .5) });
  for (const [s, P] of [[-1, postes[0]], [1, postes[1]]]) { const a = [TORRE[0] + s * 1.9, ty + 8.6, TORRE[1] + torreA(8.6) + .05]; PB.add("hierro", new THREE.TorusGeometry(.07, .02, 5, 10), TM(a[0], a[1], a[2] - .02)); banderines(a, [P[0], SUELO(P[0], P[1]) + 6.1, P[1]], r, .9) }
  banderines([postes[0][0], SUELO(...postes[0]) + 5.4, postes[0][1]], [postes[1][0], SUELO(...postes[1]) + 5.4, postes[1][1]], r, .7);
  mangaViento(11.5, 9.8, 4.6); mangaViento(COLINA[0] + 2, COLINA[1] - 1, 3.6); mangaViento(-36, -1.5, 4) }
// barriles atados y cajones en la plaza y en las calles, carros con cuñas a la entrada del pueblo
{ const r = rng(5800); for (const [bx, bz] of [[11.5, 3.5], [11.8, 4.4], [-10.8, -6.5], [-12.2, 10.8], [14, -9.5]]) { if (!libreEn(bx, bz, .45, { zona: 1 })) continue; ocupa(bx, bz, .45); const yb = SUELO(bx, bz); barril(PB, TM(bx, yb, bz, 0, r() * 6, 0)); const e = [bx + .7, SUELO(bx + .7, bz + .4), bz + .4]; PB.add("hierroO", new THREE.CylinderGeometry(.03, .04, .4, 5), TM(e[0], e[1] + .12, e[2], .2, 0, .2)); cuerda(PB, [bx + .35, yb + .55, bz + .1], [e[0], e[1] + .28, e[2]], .015); PB.add("soga", new THREE.TorusGeometry(.4, .016, 4, 18), TM(bx, yb + .55, bz, Math.PI / 2)) }
  for (const [cx, cz, a] of [[-24, 10.5, .2], [28, 1.5, -.1], [24, -6.5, 3.2]]) { if (!libreEn(cx, cz, 1.6, { zona: 1 })) continue; ocupa(cx, cz, 1.8); carro(PB, TM(cx, SUELO(cx, cz), cz, 0, a + Math.PI / 2, 0), r, (cx > 0) | 0) } }

// ---------- la panadería: cartel grande con un pan pintado sobre la puerta, cartelito colgante que se sacude, panes en el alféizar
const CARTEL_PAN = new THREE.Group(); { const C = PANAD_C, r = rng(5900), at = (...a) => C.HM.clone().multiply(TM(...a)), fr = C.d / 2;
  const T = tex(1024, 384, (g, w, h) => { const r2 = rng(5901); g.fillStyle = "#6a4a2e"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 64) { g.fillStyle = rgbj("#7a5636", r2, 20); g.fillRect(0, y, w, 60); g.fillStyle = "rgba(30,18,10,.6)"; g.fillRect(0, y + 60, w, 4) }
    g.fillStyle = "#e8d8b0"; g.strokeStyle = "#2a1a10"; g.lineWidth = 10; g.beginPath(); g.ellipse(250, 192, 170, 100, -.08, 0, 7); g.fill(); g.stroke();
    const gr = g.createRadialGradient(220, 150, 20, 250, 192, 180); gr.addColorStop(0, "#f0b860"); gr.addColorStop(1, "#a8602a"); g.fillStyle = gr; g.beginPath(); g.ellipse(250, 192, 160, 90, -.08, 0, 7); g.fill();
    g.strokeStyle = "#f4e2b8"; g.lineWidth = 12; g.lineCap = "round"; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(250 + k * 55 - 20, 140); g.quadraticCurveTo(250 + k * 55 + 10, 192, 250 + k * 55 - 5, 244); g.stroke() }
    g.fillStyle = "#f2e6c8"; g.font = "900 150px Georgia, serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("BREAD", 690, 200);
    g.globalCompositeOperation = "destination-out"; for (let k = 0; k < 600; k++) { g.fillStyle = `rgba(0,0,0,${.2 + r2() * .5})`; g.fillRect(r2() * w, r2() * h, 2 + r2() * 20, 1 + r2() * 3) } g.globalCompositeOperation = "source-over" });
  const m = new THREE.Mesh(new THREE.BoxGeometry(2.6, .95, .06), [M_MADERA, M_MADERA, M_MADERA, M_MADERA, new THREE.MeshStandardMaterial({ map: T, roughness: .85 }), M_MADERA]); m.applyMatrix4(at(C.px + .2, C.h - .65, fr + .08)); m.castShadow = true; scene.add(m);
  for (const s of [-1, 1]) PB.add("hierro", new THREE.BoxGeometry(.05, .3, .12), at(C.px + .2 + s * 1.15, C.h - .65, fr + .06));
  // cartelito colgante: brazo de hierro y tabla con una hogaza
  const Pb = new THREE.Vector3(C.px - C.dw / 2 - .8, 2.75, fr + .02).applyMatrix4(C.HM); PB.add("hierro", new THREE.BoxGeometry(.05, .05, 1.0), at(C.px - C.dw / 2 - .8, 2.75, fr + .5)); PB.add("hierro", ...(() => { const [g, mm] = cilEntre([C.px - C.dw / 2 - .8, 2.2, fr], [C.px - C.dw / 2 - .8, 2.73, fr + .7], .02, 4); return [g, C.HM.clone().multiply(mm)] })());
  CARTEL_PAN.position.copy(new THREE.Vector3(C.px - C.dw / 2 - .8, 2.72, fr + .7).applyMatrix4(C.HM)); CARTEL_PAN.rotation.y = C.ry; scene.add(CARTEL_PAN);
  { const L = lote(); for (const s of [-1, 1]) L.add("hierro", new THREE.CylinderGeometry(.008, .008, .25, 4), TM(0, -.12, s * .25)); L.add("madera", new THREE.BoxGeometry(.04, .42, .62), TM(0, -.45, 0)); const p = new THREE.SphereGeometry(.2, 12, 8); p.scale(.35, .55, 1.05); L.add("pan", p, TM(.05, -.45, 0)); L.add("pan", p, TM(-.05, -.45, 0)); L.fin(CARTEL_PAN, { hierro: M_HIERRO, madera: M_MADERA, pan: M_PAN }) }
  // panes en un estante bajo la ventana del frente y bolsas de harina contra la pared
  const vx = C.px + C.dw / 2 + 1.0; PB.add("madera", new THREE.BoxGeometry(1.2, .06, .4), at(vx, 1.02, fr + .22)); for (let k = 0; k < 6; k++) { const p = new THREE.SphereGeometry(.12, 10, 7); p.scale(1.4, .65, .8); PB.add("pan", p, at(vx - .45 + k * .18, 1.11, fr + .22 + (k % 2) * .06, 0, r() * .4, 0)) }
  for (let k = 0; k < 3; k++) { const s = new THREE.CylinderGeometry(.24, .3, .62, 10, 3), q = s.attributes.position; for (let i = 0; i < q.count; i++) { const y = q.getY(i), f = 1 + .12 * Math.cos(y * 4); q.setX(i, q.getX(i) * f); q.setZ(i, q.getZ(i) * f * .75) } s.computeVertexNormals(); const Ms = at(-C.w / 2 + .6 + k * .62, .31, fr + .4, 0, r() * .5, (r() - .5) * .15); PB.add("saco", s, Ms); PB.add("soga", new THREE.TorusGeometry(.1, .02, 4, 10), Ms.clone().multiply(TM(0, .28, 0, Math.PI / 2))); PB.add("saco", new THREE.ConeGeometry(.12, .16, 8), Ms.clone().multiply(TM(0, .4, 0, Math.PI))) } }

// ---------- todo junto (y las cadenas de la utilería)
PB.fin(scene, PB_M); { const ms = PBV.fin(scene, PBV_M, { sombra: true }); Object.values(ms).forEach(m => { m.castShadow = true }) }
const CADENAS_U = (() => { const im = new THREE.InstancedMesh(GEO_ESLABON, M_HIERRO_O, PROP_CAD.length * 20); let n = 0; PROP_CAD.forEach(([a, b]) => { b = [b[0], SUELO(b[0], b[2]) + .08, b[2]]; n += ponEslabones(im, n, a, b, .15) }); im.count = n; im.castShadow = true; im.instanceMatrix.needsUpdate = true; scene.add(im); return im })();

// ---------- EFECTOS DE VIENTO: partículas calculadas en el sombreador (rayas de viento, hojas, briznas, polvo) que corren hacia +x
// alrededor de la cámara. Su matriz de instancia es cero (así el pase de oclusión no las dibuja en el origen).
const VF = { f: 1 }, AMB = { t: 0, cam: [0, 0, 0] };
const T_RAYA = tex(256, 32, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(.25, "rgba(255,255,255,.9)"); gr.addColorStop(.7, "rgba(255,255,255,.6)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); const g3 = g.createLinearGradient(0, 0, 0, h); g3.addColorStop(0, "rgba(0,0,0,1)"); g3.addColorStop(.5, "rgba(0,0,0,0)"); g3.addColorStop(1, "rgba(0,0,0,1)"); g.globalCompositeOperation = "destination-out"; g.fillStyle = g3; g.fillRect(0, 0, w, h) });
const T_HOJA = tex(64, 64, (g, w, h) => { g.fillStyle = "#ffffff"; g.beginPath(); g.moveTo(4, 32); g.quadraticCurveTo(28, 4, 60, 30); g.quadraticCurveTo(30, 60, 4, 32); g.fill(); g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 2; g.beginPath(); g.moveTo(6, 32); g.lineTo(56, 30); g.stroke() });
const T_BRIZNA = tex(64, 16, (g, w, h) => { g.fillStyle = "#ffffff"; g.beginPath(); g.moveTo(0, 8); g.lineTo(64, 6); g.lineTo(64, 10); g.closePath(); g.fill() });
const PART_VS = `uniform float uT, uF, uLen, uWid, uVel, uSpin, uCnt, uAlto; uniform vec3 uBox; attribute vec4 aS; attribute vec4 aR; varying vec2 vUv; varying float vA; varying float vTono;
#include <fog_pars_vertex>
void main() { vUv = uv; vTono = aR.y;
  float sp = uVel * (.6 + aS.w * .8) * (.2 + .8 * uF);
  vec3 p = aS.xyz * uBox; p.x += uT * sp; p.y += sin(uT * (1.1 + aR.x * 2.) + aR.y * 30.) * .8 + sin(uT * (3. + aR.z * 4.) + aR.x * 9.) * .25 * uSpin; p.z += sin(uT * .6 + aR.x * 40.) * 1.5;
  vec3 c = cameraPosition + vec3(0., uAlto, 0.); vec3 q = mod(p - c + uBox * .5, uBox) - uBox * .5; p = c + q;
  vec3 e = abs(q) / (uBox * .5); vA = 1. - smoothstep(.55, 1., max(e.x, max(e.y, e.z))); vA *= step(aR.w, uCnt);
  vec4 mv = viewMatrix * vec4(p, 1.); vec2 d2 = (viewMatrix * vec4(1., 0., 0., 0.)).xy; float l = length(d2); d2 = l > .05 ? d2 / l : vec2(1., 0.); vA *= mix(1., l, step(uSpin, .5));
  vec2 lp = position.xy * vec2(uLen * (.6 + aS.w * .8), uWid * (.7 + aR.z * .6));
  if (uSpin > .5) { float an = uT * (3. + aR.x * 8.) + aR.y * 6.283, cs = cos(an), sn = sin(an); lp = vec2(lp.x * cs - lp.y * sn, lp.x * sn + lp.y * cs) * vec2(1., .4 + .6 * abs(sin(an * .7))); mv.xy += lp; }
  else mv.xy += d2 * lp.x + vec2(-d2.y, d2.x) * lp.y;
  vec4 mvPosition = mv; gl_Position = projectionMatrix * mv;
  #include <fog_vertex>
}`;
const PART_FS = `uniform vec3 uCol, uCol2; uniform float uOp; uniform sampler2D uMap; varying vec2 vUv; varying float vA; varying float vTono;
#include <fog_pars_fragment>
void main() { vec4 t = texture2D(uMap, vUv); gl_FragColor = vec4(mix(uCol, uCol2, vTono) * t.rgb, t.a * uOp * vA); if (gl_FragColor.a < .01) discard;
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}`;
function particulas(N, o) { const g = new THREE.PlaneGeometry(1, 1), r = rng(o.seed), aS = new Float32Array(N * 4), aR = new Float32Array(N * 4); for (let k = 0; k < N; k++) { aS.set([r(), r(), r(), r()], k * 4); aR.set([r(), r(), r(), r()], k * 4) }
  g.setAttribute("aS", new THREE.InstancedBufferAttribute(aS, 4)); g.setAttribute("aR", new THREE.InstancedBufferAttribute(aR, 4));
  const mat = new THREE.ShaderMaterial({ uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uT: { value: 0 }, uF: { value: 1 }, uLen: { value: o.len }, uWid: { value: o.wid }, uVel: { value: o.vel }, uSpin: { value: o.spin ? 1 : 0 }, uCnt: { value: 1 }, uAlto: { value: o.alto || 0 }, uBox: { value: new THREE.Vector3(...o.box) }, uCol: { value: new THREE.Color(o.col) }, uCol2: { value: new THREE.Color(o.col2 || o.col) }, uOp: { value: o.op }, uMap: { value: o.map } }]),
    vertexShader: PART_VS, fragmentShader: PART_FS, transparent: true, depthWrite: false, fog: true, side: THREE.DoubleSide });
  const m = new THREE.InstancedMesh(g, mat, N), Z = new THREE.Matrix4().makeScale(0, 0, 0); for (let k = 0; k < N; k++) m.setMatrixAt(k, Z); m.frustumCulled = false; m.castShadow = m.receiveShadow = false; m.renderOrder = 3; scene.add(m); m.userData = o; return m }
const PART = { rayas: particulas(240, { seed: 6001, len: 5, wid: .05, vel: 30, box: [80, 26, 80], col: "#ffffff", op: .32, map: T_RAYA }),
  hojas: particulas(420, { seed: 6002, len: .14, wid: .1, vel: 13, spin: 1, box: [46, 14, 46], alto: -3, col: "#6a8a3a", col2: "#c8a848", op: .95, map: T_HOJA }),
  briznas: particulas(700, { seed: 6003, len: .3, wid: .025, vel: 16, box: [40, 10, 40], alto: -3, col: "#d8c880", col2: "#a8a060", op: .85, map: T_BRIZNA }),
  polvo: particulas(1400, { seed: 6004, len: 1.1, wid: .7, vel: 24, spin: 1, box: [44, 14, 44], alto: -2, col: "#b8a888", col2: "#8a8070", op: .42, map: GLOW }) };
// ---------- humo de las chimeneas (de costado: humoInclinacion(1); derecho: 0) y vapor de la olla de Marta
const HUMO_D = [...HUMOS.map((p, i) => [p, i, 0]).sort((a, b) => Math.hypot(a[0].x, a[0].z) - Math.hypot(b[0].x, b[0].z)).slice(0, 22), ...SOPA_HUMO.map((p, i) => [p, i + 99, 1])].map(([p, i, vapor]) => Array.from({ length: 4 }, (_, k) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: vapor ? "#f4f2ee" : "#d8d2c8", transparent: true, opacity: 0, depthWrite: false })); scene.add(s); return { s, p, f: k / 4 + i * .37, vapor } })).flat();
const HUMO_E = { inc: 1 };
function humoUpd() { const t = AMB.t, f = VF.f, inc = HUMO_E.inc, tor = cl(f - 1); HUMO_D.forEach(({ s, p, f: ph, vapor }) => { const q = (t * (.35 + .25 * f) + ph) % 1, lado = inc * (3 + 6 * f) * q * (vapor ? .4 : 1), sube = lerp(4.5, 1.1, inc) * q * (vapor ? .4 : 1);
    s.position.set(p.x + lado + Math.sin(t * 1.3 + ph * 9) * .12 * (1 - inc), p.y + sube + Math.sin(q * 6 + ph) * .1, p.z + Math.sin(t * .9 + ph * 7) * .3 * q); s.scale.set((.45 + q * (vapor ? .8 : 1.8)) * (1 + inc * .6), .45 + q * (vapor ? .7 : 1.5), 1); s.material.opacity = (vapor ? .4 : .36) * Math.sin(q * Math.PI) * (1 - q * .4) * (1 - tor * .6) * (f > .02 ? 1 : 1) }) }
function humoInclinacion(v) { HUMO_E.inc = cl(v); humoUpd() }
// ---------- nubes pintadas que corren hacia +x (cúmulos de altura); en la tormenta, grises y bajas
const NUBES_V = (() => { const pinta = seed => tex(1024, 512, (g, w, h) => { const r = rng(seed); g.clearRect(0, 0, w, h);
    const bl = (x, y, s, col) => { const gr = g.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, col); gr.addColorStop(.55, col.replace(/[\d.]+\)$/, ".5)")); gr.addColorStop(1, col.replace(/[\d.]+\)$/, "0)")); g.fillStyle = gr; g.fillRect(x - s, y - s, s * 2, s * 2) };
    const N = 2 + (r() * 3 | 0); for (let n = 0; n < N; n++) { const cx = w * (.25 + r() * .5), base = h * (.62 + r() * .1), an = 140 + r() * 160;
      for (let k = 0; k < 60; k++) { const u = r() * 2 - 1, x = cx + u * an, top = (1 - u * u) * (90 + r() * 80), y = base - r() * top, s = 30 + r() * 60 * (1 - Math.abs(u) * .5); bl(x, y, s, "rgba(255,255,255,.55)") }
      for (let k = 0; k < 24; k++) { const u = r() * 2 - 1; bl(cx + u * an * .9, base + 6 + r() * 14, 26 + r() * 40, "rgba(150,160,185,.3)") }
      for (let k = 0; k < 26; k++) { const u = r() * 2 - 1, top = (1 - u * u) * 120; bl(cx + u * an * .8 - 14, base - top * (.5 + r() * .5), 18 + r() * 34, "rgba(255,255,255,.75)") } } });
  const ts = [pinta(6101), pinta(6102), pinta(6103), pinta(6104)], r = rng(6110), L = [];
  for (let k = 0; k < 34; k++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: ts[k % 4], color: "#ffffff", transparent: true, depthWrite: false, fog: false })); s.renderOrder = -.5; const an = 110 + r() * 150; s.scale.set(an, an * .5, 1); scene.add(s); L.push({ s, x0: r() * 1400, y: 95 + r() * 110, z: (r() - .5) * 1000, v: 2.2 + r() * 2 }) } return L })();
function nubesUpd(t, A) { const col = (A.nube || ["#ffffff", 1]); NUBES_V.forEach((n, k) => { const x = ((n.x0 + t * n.v * 3) % 1400 + 1400) % 1400 - 700; n.s.position.set(x, n.y * (ENVNOW === "tormenta" ? .62 : 1), n.z); n.s.material.color.set(col[0]); n.s.material.opacity = col[1] * (1 - sst(560, 700, Math.abs(x))) * (k < 22 || ENVNOW === "tormenta" ? 1 : 0); n.s.visible = col[1] > 0 }) }
// ---------- tormenta: velos grises de polvo que pasan frente a la cámara (crecen con vientoFuerza > 1)
const VELOS = Array.from({ length: 14 }, (_, i) => { const r = rng(6200 + i), s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: i % 2 ? "#9a948a" : "#b0a898", transparent: true, opacity: 0, depthWrite: false })); s.visible = false; scene.add(s); return { s, d: [r() * 44, r() * 9, r() * 44, 9 + r() * 14, .5 + r() * .8] } });
function velosUpd() { const t = AMB.t, c = AMB.cam, f = cl(VF.f - 1); VELOS.forEach(({ s, d }, k) => { s.visible = f > .01; if (!s.visible) return; s.position.set(c[0] - 22 + modp(d[0] + t * 18 * d[4] - c[0], 44), c[1] - 3 + d[1], c[2] - 22 + modp(d[2] + t * 3 - c[2], 44)); s.scale.set(d[3] * 1.8, d[3], 1); s.material.opacity = .26 * f * (.6 + .4 * Math.sin(t * 1.3 + k)) }) }
const modp = (v, m) => ((v % m) + m) % m;
// ---------- la fuerza del viento: 1 = normal, 2 = el viento duplicado de la tormenta, 0 = calma (sin rayas, sin hojas, pasto quieto, humo derecho no: eso es humoInclinacion)
function vientoFuerza(f) { VF.f = Math.max(0, f); RAFAGA.value = VF.f; Object.values(PART).forEach(m => { m.material.uniforms.uF.value = VF.f }); PART.rayas.material.uniforms.uCnt.value = cl(VF.f * .5); PART.hojas.material.uniforms.uCnt.value = cl(VF.f * .5); PART.briznas.material.uniforms.uCnt.value = cl(VF.f * .5); PART.polvo.material.uniforms.uCnt.value = cl(VF.f - 1); PART.rayas.material.uniforms.uOp.value = .32 + .18 * cl(VF.f - 1); humoUpd(); velosUpd() }
// ---------- cadenas que se cortan: cadenasRotas(u) para 3 casas cerca de la plaza (se cortan una tras otra: u ≈ 0, 0,28, 0,56) — la cadena suelta latiguea colgada del alero
const CAD_U = { rotas: 0, techo: 0 };
function cadenasD() { const t = AMB.t; let n = 0; ROTAS.forEach(c => { const pan = c.casa === PANAD_C, b = pan ? cl(CAD_U.techo / .03) : cl((CAD_U.rotas - c.ub) / .06);
    if (b <= 0) n += ponEslabones(CADENAS_D, n, c.a, c.b); else if (pan) n += ponCadenaSuelta(CADENAS_D, n, c.b, c.L * .9, t, c.fase, "piso", .4 + .6 * b);
    else { n += ponCadenaSuelta(CADENAS_D, n, c.a, c.L * .58, t, c.fase, "techo", .4 + .6 * b); const B = new THREE.Vector3(...c.b), A = new THREE.Vector3(...c.a); n += ponEslabones(CADENAS_D, n, c.b, B.clone().lerp(A, .12).toArray(), 0) } });
  CADENAS_D.count = n; CADENAS_D.instanceMatrix.needsUpdate = true }
function cadenasRotas(u) { CAD_U.rotas = cl(u); cadenasD() }
// ---------- el techo de la panadería: techoPanaderia(u) — 0 en su lugar; se levanta del lado del viento, se suelta y vuela hacia +x girando como un sombrero; 1 = lejos, del otro lado de la sierra
function techoPanaderia(u) { u = cl(u); CAD_U.techo = u; const p0 = TECHO_P.userData.p0, C = PANAD_C, lev = sst(0, .1, u), vu = Math.max(0, u - .08) / .92, t = AMB.t;
  const tiem = u > 0 && u < .1 ? Math.sin(t * 50) * .03 * (1 - lev) + .02 * Math.sin(t * 31) : 0;
  TECHO_P.position.set(p0.x + 340 * Math.pow(vu, 1.5) + lev * .6, p0.y + lev * 1.2 + 135 * Math.pow(vu, 1.15) + Math.sin(vu * 9) * 4 * vu, p0.z + 10 * Math.sin(vu * 4.5) * vu);
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.sin(vu * 11) * .6 * vu + tiem, vu * 13, -lev * .55 - vu * 4.2 + tiem, "YXZ")), q0 = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, C.ry, 0));
  TECHO_P.quaternion.copy(q.multiply(q0)); TECHO_P.scale.setScalar(1); cadenasD() }
const TECHO_W = () => { TECHO_P.updateMatrixWorld(true); return new THREE.Vector3(0, PANAD_C.rh * .45, 0).applyMatrix4(TECHO_P.matrixWorld).toArray() };
function tormenta(t, camPos, u = 0) { if (u > 0) vientoFuerza(1 + cl(u)) }   // compatibilidad con el armado viejo

// ---------- la luz de cada momento. El motor declara ENV después de este archivo: las escenas hacen una vez `Object.assign(ENV, ENV_VIENTO)`
// y después setEnv("ventoso" | "tormenta" | "recuerdo") (al recuerdo se le pone sepia aparte, con POST.sepia).
const ENV_VIENTO = {
  ventoso: { top: "#4a8ede", hor: "#d4e4f0", fog: .0024, hemi: 1.15, hemiG: "#7a7454", sun: 3.9, sunCol: "#ffe4bc", exp: 1.16, grade: ["#ffffff", 0], sol: [-.55, .42, .72], nube: ["#ffffff", 1] },
  tormenta: { top: "#56606c", hor: "#9c9a94", fog: .011, hemi: 1.45, hemiG: "#5a5648", sun: 1.25, sunCol: "#dcd6c8", exp: 1.18, grade: ["#8a8478", .08], sol: [-.6, .5, .62], nube: ["#a4a8ae", .95] },
  recuerdo: { top: "#6a9ed6", hor: "#ece0c4", fog: .0028, hemi: 1.2, hemiG: "#8a7a58", sun: 3.5, sunCol: "#ffd8a0", exp: 1.15, grade: ["#ffd9a0", .06], sol: [-.62, .38, .68], nube: ["#fff4e0", .9] } };
// el sol: las escenas pueden mover el centro de las sombras (SOL.x, SOL.z, SOL.r) y la dirección (SOL.dir = [x, y, z] hacia el sol)
const SOL = { x: 0, z: 0, r: 62, dir: null };
function ambiente(t) { const A = ENV[ENVNOW] || {}, d = SOL.dir || A.sol || [-.55, .42, .72], l = Math.hypot(d[0], d[1], d[2]), cy = SUELO(SOL.x, SOL.z); AMB.t = t; AMB.cam = [cam.position.x, cam.position.y, cam.position.z];
  sun.position.set(SOL.x + d[0] / l * 140, cy + d[1] / l * 140, SOL.z + d[2] / l * 140); sun.target.position.set(SOL.x, cy, SOL.z); sun.target.updateMatrixWorld();
  { const c = sun.shadow.camera; if (c.right !== SOL.r) { c.left = -SOL.r; c.right = SOL.r; c.top = SOL.r; c.bottom = -SOL.r; c.near = 1; c.far = 330; c.updateProjectionMatrix() } }
  if (ENVNOW === "tormenta" && VF.f < 2) VF.f = 2;
  VIENTO.value = t; Object.values(PART).forEach(m => { m.material.uniforms.uT.value = t }); vientoFuerza(VF.f); nubesUpd(t, A);
  veleta(t, {}); CARTEL_PAN.rotation.set(0, PANAD_C.ry, 0); CARTEL_PAN.rotateX(0); CARTEL_PAN.rotation.z = (Math.sin(t * 7.3) * .08 + Math.sin(t * 13) * .04) * VF.f; CARTEL_PAN.rotation.x = (.18 + Math.sin(t * 5.1) * .05) * VF.f * 0;
  CUNA.rotation.z = Math.sin(t * 2.2) * .04 * VF.f; cadenasD() }
// deja todo lo animado del mundo en su estado de reposo (llamar al empezar cada cuadro, antes de ambiente)
function mundoReset() { VF.f = 1; RAFAGA.value = 1; HUMO_E.inc = 1; veleta(0, {}); CAD_U.rotas = 0; techoPanaderia(0) }
mundoReset();
