// ================= ARRIBA DE LA TAPA: la tierra, los campos de trigo hasta el borde del mundo, la granja de Kell, la escalera, los montones de tierra nueva y el cielo DE VERDAD =================
// Usa TAPA (_bestia_cielo.js): todo lo de acá se hunde con la misma membrana (sagify) y lo del panel cae con el panel (TAPA.PAN_ARR).
// Al final: ENV_CIELO_TAPA (ambientes arriba / luzReal / bajoTapa), ARRIBA_Y, CAMS_TAPA y los stubs del video viejo (lejos, lejosReset…).
const ARRIBA = (() => {
  const T = TAPA, G = new THREE.Group(); G.name = "ARRIBA"; scene.add(G);
  const FINO = new THREE.Group(); G.add(FINO);                     // trigo de cerca (se apaga con la cámara lejos)
  const { sst, fbm, rd, hsh, sagify, depthDe, mergeGeo, coords, grilla, fueraPanel, lienzo, gris, envuelto, PAN_ARR } = T;
  const P0 = PANEL_MIO, AG = AGUJERO, ESC = ESCALERA_KELL;
  const TMx = (x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, "YXZ")), new THREE.Vector3(sx, sy, sz));
  const lin = h => { const c = new THREE.Color(h); return [c.r, c.g, c.b] }, mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  const SOMBRA = [];                                               // mallas de arriba que hacen sombra (se apagan con la cámara abajo)
  const sombra = (m, on = true) => { m.castShadow = on; m.receiveShadow = true; if (on) SOMBRA.push(m); return m };

  // ---------------- EL PISO DE ARRIBA ----------------
  const relieve = (x, z) => (fbm(x * .045, z * .045, 3) - .5) * .32 + (fbm(x * .4, z * .4, 2) - .5) * .05;
  const ARR0 = (x, z) => CIELO(x, z) + LID_T + relieve(x, z);       // en reposo (sin hundir)
  // caminos: de la trampa de la escalera hasta nuestro panel (y a la granja), y la huella larga de este a oeste
  const GRANJA = [-38, -50];
  const CAMINOS = [[[ESC[0], ESC[1]], [5, -66], [2, -50], [-1, -38], [1, -24], [3.5, -15], [4, -10.2]], [[2, -50], [-12, -51], [-24, -50], [GRANJA[0] + 6, GRANJA[1] + 1]]];
  const RUTA_Z = x => -30 + 5 * Math.sin(x * .006) + 2 * Math.sin(x * .021);
  const segD = (x, z, L) => { let d = 1e9; for (let i = 0; i < L.length - 1; i++) { const [x0, z0] = L[i], [x1, z1] = L[i + 1], dx = x1 - x0, dz = z1 - z0, t = cl(((x - x0) * dx + (z - z0) * dz) / (dx * dx + dz * dz)); d = Math.min(d, Math.hypot(x - x0 - dx * t, z - z0 - dz * t)) } return d };
  const caminoD = (x, z) => Math.min(...CAMINOS.map(L => segD(x, z, L)), Math.abs(z - RUTA_Z(x)) * (Math.abs(x) < 1600 ? 1 : 9));
  // parcelas (manchones de cultivo, como un tablero torcido): 0 trigo maduro, 1 trigo pálido, 2 arado, 3 rastrojo con fardos
  const parcela = (x, z) => { const u = x + 9 * Math.sin(z * .013), v = z + 7 * Math.sin(x * .011), i = Math.floor(u / 74), j = Math.floor(v / 48), fu = u / 74 - i, fv = v / 48 - j;
    const borde = Math.min(fu, 1 - fu) * 74, bordeV = Math.min(fv, 1 - fv) * 48, h = hsh(i + 300, j - 700);
    let tipo = h < .7 ? 0 : h < .84 ? 1 : h < .93 ? 2 : 3; if (x > -75 && x < 75 && z > -100 && z < 40) tipo = (Math.abs(x - GRANJA[0]) < 22 && Math.abs(z - GRANJA[1] + 14) < 8) ? 3 : 0;
    return { tipo, linde: Math.min(borde, bordeV), id: h } };
  const MONTONES_P = [[-6, -6.5, 2.4, .9], [-12.5, -4, 2.8, 1.1], [8.5, -6.8, 2.2, .8], [14.5, -3.5, 3, 1.2], [-1.5, -8.4, 1.8, .7], [20.5, -7, 2.4, .9], [-19.5, -6, 2.6, 1], [-8, 4.5, 2, .7], [11, 6, 2.3, .85]];
  const GRANJA_R = (x, z) => Math.abs(x - GRANJA[0]) < 22 && Math.abs(z - GRANJA[1]) < 14;
  const C_ORO = lin("#c7993f"), C_PALIDO = lin("#d5b56a"), C_ARADO = lin("#4e3826"), C_RASTROJO = lin("#b39a5e"), C_LINDE = lin("#7c7836"), C_CAMINO = lin("#9c8460"), C_PATIO = lin("#8f7a56");
  const colorArr = (x, z) => { const p = parcela(x, z), d = caminoD(x, z); let c = [C_ORO, C_PALIDO, C_ARADO, C_RASTROJO][p.tipo];
    c = mix3(c, [c[0] * .85, c[1] * .82, c[2] * .8], fbm(x * .03, z * .03, 3));
    if (p.linde < 1.4) c = mix3(C_LINDE, c, sst(.6, 1.4, p.linde));
    if (GRANJA_R(x, z)) c = C_PATIO;
    if (T.enPanel(x, z)) for (const [mx, mz, R] of MONTONES_P) { const dm = Math.hypot(x - mx, (z - mz) / .9) / R; if (dm < 2.1) c = mix3(mix3(C_ARADO, C_CAMINO, .35), c, sst(1.2, 2.1, dm)) }
    const tr = Math.hypot(x - ESC[0], z - ESC[1]); if (tr < 4) c = mix3(C_CAMINO, c, sst(2.5, 4, tr));
    return mix3(C_CAMINO, c, sst(1.1, 2, d)) };
  const T_ARR = (() => { const [c, z] = pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(7801); c.fillStyle = "#d8cfc0"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
      for (let k = 0; k < 2600; k++) { const x = r() * w, y = r() * h, R = 2 + r() * 9; c.fillStyle = r() < .5 ? `rgba(90,70,50,${.15 + r() * .3})` : `rgba(255,245,220,${.1 + r() * .25})`; envuelto(c, w, h, () => { c.beginPath(); c.ellipse(x, y, R, R * .7, r() * 3, 0, 7); c.fill() }); z.fillStyle = gris(.2 + r() * .8); z.beginPath(); z.ellipse(x, y, R * .8, R * .6, 0, 0, 7); z.fill() }
      for (let k = 0; k < 1400; k++) { const x = r() * w, y = r() * h, a = r() * 6.283, L = 10 + r() * 30; c.strokeStyle = `rgba(${200 + r() * 55 | 0},${170 + r() * 50 | 0},${90 + r() * 40 | 0},${.35 + r() * .4})`; c.lineWidth = 1.5 + r() * 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); c.stroke(); z.strokeStyle = "rgba(255,255,255,.6)"; z.lineWidth = 2; z.beginPath(); z.moveTo(x, y); z.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); z.stroke() }
      for (let y = 0; y < h; y += 64) { c.fillStyle = "rgba(60,40,20,.12)"; c.fillRect(0, y, w, 18); z.fillStyle = "rgba(0,0,0,.35)"; z.fillRect(0, y, w, 18) } });   // surcos
    [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
  const sueloMat = panel => sagify(new THREE.MeshStandardMaterial({ map: T_ARR.c, bumpMap: T_ARR.z, bumpScale: 2.5, vertexColors: true, roughness: .95 }), { panel, hole: panel, esc: !panel, key: "suelo" });
  const SUELO_A = sombra(new THREE.Mesh(grilla(coords(-50, 50, .5, 1700, 1.06), coords(-90, 45, .5, 1700, 1.06), ARR0, { skip: fueraPanel, uvs: 4, fc: colorArr }), sueloMat(false)), false); SUELO_A.frustumCulled = false; G.add(SUELO_A);
  const PXS = coords(P0.x0, P0.x1, .5, 0, 1).filter(v => v >= P0.x0 && v <= P0.x1), PZS = coords(P0.z0, P0.z1, .5, 0, 1).filter(v => v >= P0.z0 && v <= P0.z1);
  const SUELO_P = sombra(new THREE.Mesh(grilla(PXS, PZS, ARR0, { uvs: 4, fc: colorArr }), sueloMat(true)), false); PAN_ARR.add(SUELO_P);

  // ---------------- MONTONES DE TIERRA NUEVA sobre nuestro panel (y palas, carretillas) ----------------
  const T_TNUEVA = (() => { const [c, z] = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(7802); c.fillStyle = "#2b1f15"; c.fillRect(0, 0, w, h); z.fillStyle = "#606060"; z.fillRect(0, 0, w, h);
      for (let k = 0; k < 1500; k++) { const x = r() * w, y = r() * h, R = 2 + r() * 10; c.fillStyle = r() < .6 ? `rgba(14,9,5,${.3 + r() * .5})` : `rgba(90,66,44,${.2 + r() * .4})`; envuelto(c, w, h, () => { c.beginPath(); c.ellipse(x, y, R, R * .8, r() * 3, 0, 7); c.fill() }); z.fillStyle = gris(.3 + r() * .7); z.beginPath(); z.arc(x, y, R * .8, 0, 7); z.fill() } });
    [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3) }); return { c, z } })();
  const M_TNUEVA = sagify(new THREE.MeshStandardMaterial({ map: T_TNUEVA.c, bumpMap: T_TNUEVA.z, bumpScale: 4, roughness: .9, color: "#d0c4b8" }), { panel: true, key: "tn" });
  const MONTONES = new THREE.Group(); PAN_ARR.add(MONTONES);
  const montonG = seed => { const g = new THREE.IcosahedronGeometry(1, 4), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const v = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i)).normalize(), k = 1 + (fbm(v.x * 2.2 + seed, v.z * 2.2 - seed + v.y, 3) - .5) * .5; p.setXYZ(i, v.x * k, Math.max(v.y * k, -.05) , v.z * k) } g.computeVertexNormals(); return g };
  MONTONES_P.forEach(([x, z, R, H], i) => { const m = sombra(new THREE.Mesh(montonG(i * 3.7 + 1), M_TNUEVA)); m.position.set(x, ARR0(x, z) - .08, z); m.scale.set(R, H, R * (.75 + hsh(i, 3) * .4)); m.rotation.y = i; MONTONES.add(m) });
  { const r = rng(7803), L = []; MONTONES_P.forEach(([x, z, R]) => { for (let k = 0; k < 40; k++) { const a = r() * 6.283, d = R * (.9 + r() * .9); L.push([x + Math.cos(a) * d, z + Math.sin(a) * d * .9]) } });
    const m = sombra(new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.09, 0), M_TNUEVA, L.length)); L.forEach(([x, z], i) => { dummy.position.set(x, ARR0(x, z) + .02, z); dummy.rotation.set(r() * 3, r() * 3, 0); dummy.scale.set(.6 + r() * 1.4, .5 + r() * .8, .6 + r() * 1.4); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix) }); MONTONES.add(m) }
  // utilería de campo (merge por material)
  const M_MAD = new THREE.MeshStandardMaterial({ color: "#7a5636", roughness: .85 }), M_MADC = new THREE.MeshStandardMaterial({ color: "#a07a4e", roughness: .85 }), M_FIE = new THREE.MeshStandardMaterial({ color: "#3a3632", roughness: .5, metalness: .6 });
  const lote = () => { const B = new Map(); return { add(mat, g, m) { (B.get(mat) || B.set(mat, []).get(mat)).push([g, m]) }, fin(par, { panel = null, sh = true } = {}) { for (const [mat, L] of B) { const mm = panel === null ? mat : sagify(mat.clone(), { panel, key: "u" + panel }); const me = new THREE.Mesh(mergeGeo(L), mm); sombra(me, sh); par.add(me) } } } };
  const pala = (Lt, M) => { Lt.add(M_MADC, new THREE.CylinderGeometry(.02, .02, 1.1, 6), M.clone().multiply(TMx(0, .55, 0))); Lt.add(M_FIE, new THREE.BoxGeometry(.22, .28, .02), M.clone().multiply(TMx(0, -.12, 0))); Lt.add(M_MADC, new THREE.BoxGeometry(.14, .03, .03), M.clone().multiply(TMx(0, 1.1, 0))) };
  const carretilla = (Lt, M, llena = true) => { const q = (...a) => M.clone().multiply(TMx(...a));
    Lt.add(M_MAD, new THREE.BoxGeometry(.7, .05, .9), q(0, .42, 0)); for (const s of [-1, 1]) { Lt.add(M_MAD, new THREE.BoxGeometry(.05, .32, .95), q(s * .37, .56, 0, 0, 0, s * .2)); Lt.add(M_MADC, new THREE.CylinderGeometry(.025, .025, 1.7, 6), q(s * .28, .4, -.2, Math.PI / 2 - .12)); Lt.add(M_MAD, new THREE.BoxGeometry(.04, .4, .04), q(s * .25, .2, -.35)) }
    Lt.add(M_MAD, new THREE.BoxGeometry(.8, .3, .05), q(0, .56, .46, -.25)); Lt.add(M_MAD, new THREE.BoxGeometry(.8, .3, .05), q(0, .56, -.46, .2));
    Lt.add(M_FIE, new THREE.CylinderGeometry(.2, .2, .07, 14), q(0, .2, .72, 0, 0, Math.PI / 2)); if (llena) Lt.add(M_TNUEVA, new THREE.SphereGeometry(.42, 10, 6, 0, 6.283, 0, 1.4), q(0, .55, 0, 0, 0, 0, 1, .55, 1.1)) };
  { const Lt = lote(); const en = (x, z, ry, rx = 0, rz = 0) => TMx(x, ARR0(x, z), z, rx, ry, rz);
    pala(Lt, en(-5, -5, .3, .35, .2).multiply(TMx(0, .7, 0))); pala(Lt, en(-11.5, -2.6, 1.2, -.4).multiply(TMx(0, .8, 0))); pala(Lt, en(9.4, -5.8, -.6, .3, -.3).multiply(TMx(0, .6, 0))); pala(Lt, en(14, -1.8, 2, .2).multiply(TMx(0, .9, 0)));
    carretilla(Lt, en(-3.2, -7.5, 2.4)); carretilla(Lt, en(5.5, -8.2, -2.8)); carretilla(Lt, en(17.5, -5.2, 1.1), false); carretilla(Lt, en(-15.5, -7.6, .5));
    Lt.fin(MONTONES, { panel: true }) }

  // ---------------- TRIGO ----------------
  const trigoOk = (x, z, enPan) => { const p = parcela(x, z); if (p.tipo > 1 || p.linde < 1.1) return null; if (caminoD(x, z) < 1.5) return null; if (GRANJA_R(x, z)) return null; if (Math.hypot(x - ESC[0], z - ESC[1]) < 3.6) return null;
    if (Math.hypot(x - AG[0], z - AG[1]) < .62) return null; if (enPan) { for (const [mx, mz, R] of MONTONES_P) if (Math.hypot(x - mx, (z - mz) / .9) < R * 1.9) return null } return p.tipo };
  // mata de 8 tallos con espiga (cerca): ≈ 270 triángulos
  const MATA = (() => { const r = rng(7804), pos = [], col = [], nor = [];
    const tri = (a, b, c, ca, cb, cc) => { pos.push(...a, ...b, ...c); col.push(...ca, ...cb, ...cc); const n = new THREE.Vector3(...b).sub(new THREE.Vector3(...a)).cross(new THREE.Vector3(...c).sub(new THREE.Vector3(...a))).normalize(); if (n.y < 0) n.negate(); n.lerp(new THREE.Vector3(0, 1, 0), .55).normalize(); for (let k = 0; k < 3; k++) nor.push(n.x, n.y, n.z) };
    const quad = (a, b, c, d, ca, cb) => { tri(a, b, c, ca, ca, cb); tri(b, d, c, ca, cb, cb) };
    const cTB = lin("#6c6a30"), cTA = lin("#c9a14a"), cE1 = lin("#dcae54"), cE2 = lin("#a87d34"), cBa = lin("#f2d790"), cH = lin("#8a8a3c");
    for (let k = 0; k < 8; k++) { const a0 = r() * 6.283, d0 = Math.sqrt(r()) * .15, bx = Math.cos(a0) * d0, bz = Math.sin(a0) * d0, h = .92 + r() * .32, la = r() * 6.283, lv = .04 + r() * .16;
      const p0 = [bx, 0, bz], p1 = [bx + Math.cos(la) * lv * .25, h * .55, bz + Math.sin(la) * lv * .25], p2 = [bx + Math.cos(la) * lv, h, bz + Math.sin(la) * lv];
      const wa = la + Math.PI / 2, w = .0045, wx = Math.cos(wa) * w, wz = Math.sin(wa) * w;
      const L = (p, s) => [p[0] + wx * s, p[1], p[2] + wz * s];
      quad(L(p0, -1), L(p0, 1), L(p1, -1), L(p1, 1), cTB, mix3(cTB, cTA, .6)); quad(L(p1, -1), L(p1, 1), L(p2, -1), L(p2, 1), mix3(cTB, cTA, .6), cTA);
      // espiga: huso de 4 lados en la dirección del tallo
      const ax = new THREE.Vector3(...p2).sub(new THREE.Vector3(...p1)).normalize(), u = new THREE.Vector3(1, 0, 0).cross(ax).normalize(), v = ax.clone().cross(u), L0 = .075 + r() * .03, rot = r();
      const RR = [[0, .002], [.15, .009], [.5, .012], [.82, .009], [1, .002]], ring = RR.map(([t, rr]) => Array.from({ length: 4 }, (_, j) => { const an = (j + rot) / 4 * 6.283, q = new THREE.Vector3(...p2).addScaledVector(ax, t * L0).addScaledVector(u, Math.cos(an) * rr * 1.25).addScaledVector(v, Math.sin(an) * rr); return [q.x, q.y, q.z] }));
      for (let s = 0; s < RR.length - 1; s++) for (let j = 0; j < 4; j++) { const c0 = s % 2 ? cE1 : cE2, c1 = s % 2 ? cE2 : cE1; quad(ring[s][j], ring[s][(j + 1) % 4], ring[s + 1][j], ring[s + 1][(j + 1) % 4], c0, c1) }
      for (let q = 0; q < 3; q++) { const t = .35 + q * .3, b0 = new THREE.Vector3(...p2).addScaledVector(ax, t * L0), dir = ax.clone().multiplyScalar(.8).addScaledVector(u, (q - 1) * .5).normalize(), b1 = b0.clone().addScaledVector(dir, .07 + r() * .03); tri([b0.x - wx * .4, b0.y, b0.z - wz * .4], [b0.x + wx * .4, b0.y, b0.z + wz * .4], [b1.x, b1.y, b1.z], cBa, cBa, cBa) } }
    for (let k = 0; k < 3; k++) { const a = r() * 6.283, l = .25 + r() * .2, y0 = .05 + r() * .25, P = s => [Math.cos(a) * l * s, y0 + Math.sin(s * 2.2) * .18 * l * 2, Math.sin(a) * l * s], w = .012, wx = Math.cos(a + 1.57) * w, wz = Math.sin(a + 1.57) * w;
      for (let s = 0; s < 3; s++) { const A = P(s / 3), B = P((s + 1) / 3), f = 1 - s / 3; quad([A[0] - wx * f, A[1], A[2] - wz * f], [A[0] + wx * f, A[1], A[2] + wz * f], [B[0] - wx * f * .6, B[1], B[2] - wz * f * .6], [B[0] + wx * f * .6, B[1], B[2] + wz * f * .6], cH, cH) } }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); g.computeBoundingSphere(); return g })();
  // tarjetas cruzadas con trigo pintado (medio y lejos)
  const T_TARJ = tex(512, 512, (g, w, h) => { const r = rng(7805); g.clearRect(0, 0, w, h);
    for (let k = 0; k < 90; k++) { const x = 6 + r() * (w - 12), top = h * (.04 + r() * .2), lean = (r() - .5) * 26; g.strokeStyle = `rgb(${150 + r() * 50 | 0},${120 + r() * 40 | 0},${50 + r() * 30 | 0})`; g.lineWidth = 1.6 + r() * 1.4; g.beginPath(); g.moveTo(x, h); g.quadraticCurveTo(x + lean * .3, (h + top) / 2, x + lean, top + 34); g.stroke() }
    for (let k = 0; k < 70; k++) { const x = 10 + r() * (w - 20), y = h * (.05 + r() * .22), a = (r() - .5) * .4, L = 30 + r() * 16; g.save(); g.translate(x, y); g.rotate(a);
      g.strokeStyle = "rgba(245,220,150,.85)"; g.lineWidth = 1; for (let q = 0; q < 5; q++) { g.beginPath(); g.moveTo(0, -L * .3 + q * 5); g.lineTo((q - 2) * 5, -L * .3 + q * 5 - 22); g.stroke() }
      for (let q = 0; q < 6; q++) { g.fillStyle = q % 2 ? "#dcae54" : "#b08236"; g.beginPath(); g.ellipse(q % 2 ? 2.5 : -2.5, -L * .3 + q * L / 6, 4.2, 5.5, 0, 0, 7); g.fill() } g.restore() }
    for (let k = 0; k < 40; k++) { const x = r() * w; g.strokeStyle = "rgba(110,108,50,.9)"; g.lineWidth = 3; g.beginPath(); g.moveTo(x, h); g.quadraticCurveTo(x + (r() - .5) * 40, h * .75, x + (r() - .5) * 70, h * (.6 + r() * .2)); g.stroke() } });
  const TARJ = (() => { const L = []; for (let k = 0; k < 3; k++) { const p = new THREE.PlaneGeometry(1.15, 1.2); p.translate(0, .6, 0); p.rotateY(k * Math.PI / 3); const n = p.attributes.normal; for (let i = 0; i < n.count; i++) n.setXYZ(i, n.getX(i) * .35, .94, n.getZ(i) * .35); L.push([p, null]) } return mergeGeo(L) })();
  const trigoMat = (panel, tarj) => sagify(new THREE.MeshStandardMaterial(tarj ? { map: T_TARJ, alphaTest: .42, side: THREE.DoubleSide, roughness: .8 } : { vertexColors: true, side: THREE.DoubleSide, roughness: .75 }), { panel, wind: true, glow: true, key: "trigo" + (tarj ? "t" : "m") });
  const M_MATA = trigoMat(false, false), M_MATA_P = trigoMat(true, false), M_TARJ = trigoMat(false, true), M_TARJ_P = trigoMat(true, true);
  const D_MATA = depthDe({ wind: true }), D_MATA_P = depthDe({ wind: true, panel: true });
  const tinte = (tipo, x, z) => { const v = fbm(x * .05, z * .05, 2); return tipo === 1 ? [1.05, 1.02, .86] : [.92 + v * .16, .9 + v * .14, .86 + v * .1] };
  // instancias repartidas en celdas (la cámara y las sombras descartan lo que no ven)
  const instancias = (geo, mat, Lq, par, { celda = 16, sh = false, depth = null } = {}) => { const B = new Map(); Lq.forEach(q => { const k = Math.floor(q[0] / celda) + "_" + Math.floor(q[2] / celda); (B.get(k) || B.set(k, []).get(k)).push(q) }); const out = [], cc = new THREE.Color();
    for (const L of B.values()) { const m = new THREE.InstancedMesh(geo, mat, L.length); L.forEach((q, i) => { dummy.position.set(q[0], q[1], q[2]); dummy.rotation.set(q[4] || 0, q[3], q[5] || 0, "YXZ"); dummy.scale.setScalar(q[6]); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); m.setColorAt(i, cc.setRGB(...q[7])) }); m.computeBoundingSphere(); if (depth) m.customDepthMaterial = depth; sh ? sombra(m) : (m.receiveShadow = true); par.add(m); out.push(m) } return out };
  const MATAS = [], TARJS = [];
  { const r = rng(7806), hi = [], hiP = [], mid = [], midP = [];
    // cerca (matas 3D): alrededor del agujero, todo el panel y una banda de 7 m alrededor del panel
    const zonaHi = (x, z) => Math.hypot(x - AG[0], z - AG[1]) < 10 || (x > P0.x0 - 7 && x < P0.x1 + 7 && z > P0.z0 - 7 && z < P0.z1 + 7);
    for (let x = P0.x0 - 7; x < P0.x1 + 7; x += .34) for (let z = P0.z0 - 7; z < P0.z1 + 7; z += .34) { const d = Math.hypot(x - AG[0], z - AG[1]); if (d > 10 && r() < .42) continue;
      const px = x + (r() - .5) * .3, pz = z + (r() - .5) * .3, enPan = T.enPanel(px, pz), tp = trigoOk(px, pz, enPan); if (tp === null) continue;
      (enPan ? hiP : hi).push([px, ARR0(px, pz) - .03, pz, r() * 6.283, (r() - .5) * .12, (r() - .5) * .12, .9 + r() * .25, tinte(tp, px, pz)]) }
    // medio (tarjetas): hasta 70 m cada 0,95 m, hasta 190 m cada 1,6 m (más grandes)
    const cx = 0, cz = -20;
    for (let x = cx - 190; x < cx + 190; x += .95) for (let z = cz - 190; z < cz + 190; z += .95) { const R = Math.hypot(x - cx, z - cz); if (R > 190) continue; if (R > 70 && (Math.floor(x / .95) % 2 || Math.floor(z / .95) % 2)) continue;
      const px = x + (r() - .5) * .8, pz = z + (r() - .5) * .8; if (zonaHi(px, pz)) continue; const enPan = T.enPanel(px, pz), tp = trigoOk(px, pz, enPan); if (tp === null) continue;
      (enPan ? midP : mid).push([px, ARR0(px, pz) - .05, pz, r() * 6.283, 0, 0, R > 70 ? 1.75 + r() * .3 : .95 + r() * .2, tinte(tp, px, pz)]) }
    MATAS.push(...instancias(MATA, M_MATA, hi, FINO, { celda: 10, sh: true, depth: D_MATA }), ...instancias(MATA, M_MATA_P, hiP, PAN_ARR, { celda: 10, sh: true, depth: D_MATA_P }));
    TARJS.push(...instancias(TARJ, M_TARJ, mid, G, { celda: 24 }), ...instancias(TARJ, M_TARJ_P, midP, PAN_ARR, { celda: 24 }));
    T.ST.nTrigo = [hi.length, hiP.length, mid.length, midP.length] }

  // ---------------- CERCAS, ESPANTAPÁJAROS, FARDOS ----------------
  { const Lt = lote(), r = rng(7807), poste = (x, z, h = 1.25) => Lt.add(M_MAD, new THREE.BoxGeometry(.12, h, .12), TMx(x, ARR0(x, z) + h / 2 - .15, z, (r() - .5) * .08, r(), (r() - .5) * .08));
    const cerca = (L, paso = 2.4) => { for (let i = 0; i < L.length - 1; i++) { const [x0, z0] = L[i], [x1, z1] = L[i + 1], d = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(d / paso));
      for (let k = 0; k <= n; k++) { const x = lerp(x0, x1, k / n), z = lerp(z0, z1, k / n); poste(x, z); if (k < n) { const xa = lerp(x0, x1, (k + .5) / n), za = lerp(z0, z1, (k + .5) / n), ry = Math.atan2(x1 - x0, z1 - z0); for (const hy of [.45, .9]) Lt.add(M_MADC, new THREE.BoxGeometry(.06, .1, d / n + .1), TMx(xa, ARR0(xa, za) + hy - (r() - .5) * .05, za, 0, ry, (r() - .5) * .05)) } } } };
    cerca([[1.2, -12.5], [-1.5, -24], [-3, -36], [0, -48]]); cerca([[6.6, -13], [5.8, -24], [3.5, -36], [5, -48]]);
    cerca([[GRANJA[0] - 20, GRANJA[1] - 13], [GRANJA[0] + 20, GRANJA[1] - 13], [GRANJA[0] + 20, GRANJA[1] + 13], [GRANJA[0] + 7, GRANJA[1] + 13]]); cerca([[GRANJA[0] + 3, GRANJA[1] + 13], [GRANJA[0] - 20, GRANJA[1] + 13], [GRANJA[0] - 20, GRANJA[1] - 13]]);
    cerca([[-60, -18], [-30, -16], [-12, -14]], 3); cerca([[30, -16], [60, -19], [95, -22]], 3);
    // espantapájaros
    { const x = 12, z = -16, y = ARR0(x, z); Lt.add(M_MAD, new THREE.CylinderGeometry(.05, .06, 2.4, 6), TMx(x, y + 1, z)); Lt.add(M_MAD, new THREE.CylinderGeometry(.04, .04, 1.7, 6), TMx(x, y + 1.6, z, 0, .4, Math.PI / 2));
      Lt.add(new THREE.MeshStandardMaterial({ color: "#5a6a7a", roughness: 1 }), new THREE.BoxGeometry(.6, .8, .3), TMx(x, y + 1.3, z, 0, .4)); Lt.add(new THREE.MeshStandardMaterial({ color: "#d8c49a", roughness: 1 }), new THREE.SphereGeometry(.2, 10, 8), TMx(x, y + 2, z));
      Lt.add(new THREE.MeshStandardMaterial({ color: "#6a4a28", roughness: 1 }), new THREE.CylinderGeometry(.42, .42, .03, 14), TMx(x, y + 2.15, z)); Lt.add(new THREE.MeshStandardMaterial({ color: "#6a4a28", roughness: 1 }), new THREE.CylinderGeometry(.18, .22, .22, 12), TMx(x, y + 2.27, z)) }
    Lt.fin(G, { panel: false }) }
  // fardos redondos en los rastrojos
  const T_PAJA = (() => { const [c, z] = pintarDoble(512, 256, (c, z, w, h) => { const r = rng(7808); c.fillStyle = "#c8a65c"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h); for (let k = 0; k < 1800; k++) { const x = r() * w, y = r() * h, L = 8 + r() * 30; c.strokeStyle = r() < .5 ? `rgba(120,90,40,${.3 + r() * .4})` : `rgba(250,225,150,${.3 + r() * .4})`; c.lineWidth = 1 + r() * 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + L, y + (r() - .5) * 6); c.stroke(); z.strokeStyle = r() < .5 ? "#000" : "#fff"; z.lineWidth = 2; z.beginPath(); z.moveTo(x, y); z.lineTo(x + L, y); z.stroke() } }); [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
  const M_PAJA = new THREE.MeshStandardMaterial({ map: T_PAJA.c, bumpMap: T_PAJA.z, bumpScale: 3, roughness: 1 });
  { const r = rng(7809), L = []; for (let k = 0; k < 400 && L.length < 60; k++) { const x = -400 + r() * 800, z = -400 + r() * 700; if (parcela(x, z).tipo === 3 && caminoD(x, z) > 3 && !GRANJA_R(x, z)) L.push([x, z]) }
    for (const [x, z] of [[GRANJA[0] - 8, GRANJA[1] - 18], [GRANJA[0] - 4, GRANJA[1] - 17], [GRANJA[0] + 4, GRANJA[1] - 19], [GRANJA[0] + 10, GRANJA[1] - 17.5]]) L.push([x, z]);
    const g = new THREE.CylinderGeometry(.75, .75, 1.3, 20); g.rotateZ(Math.PI / 2); const m = sombra(new THREE.InstancedMesh(g, M_PAJA, L.length)); L.forEach(([x, z], i) => { dummy.position.set(x, ARR0(x, z) + .7, z); dummy.rotation.set(0, r() * 6.28, 0); dummy.scale.setScalar(.9 + r() * .2); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix) }); m.computeBoundingSphere(); G.add(m) }

  // ---------------- LA GRANJA DE KELL: casa de piedra clara, granero, silo, pozo, carro ----------------
  const T_PIEDRA_C = (() => { const [c, z] = pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(7810); c.fillStyle = "#a89a84"; c.fillRect(0, 0, w, h); z.fillStyle = "#303030"; z.fillRect(0, 0, w, h); const RH = 1024 / 6;   // 3 m de alto → hiladas de 0,5 m
      for (let y = 0; y < h; y += RH) { let x = -r() * 200; while (x < w) { const L = 180 + r() * 260, v = 200 + r() * 30 | 0; c.fillStyle = `rgb(${v},${v - 8 - r() * 8 | 0},${v - 26 - r() * 10 | 0})`; c.fillRect(x + 4, y + 4, L - 8, RH - 8); z.fillStyle = gris(.75 + r() * .2); z.fillRect(x + 5, y + 5, L - 10, RH - 10);
          for (let k = 0; k < 30; k++) { c.fillStyle = `rgba(${r() < .5 ? "120,110,90" : "250,245,230"},${.1 + r() * .2})`; c.beginPath(); c.arc(x + r() * L, y + r() * RH, 2 + r() * 8, 0, 7); c.fill() } x += L } }
      for (let k = 0; k < 40; k++) { const x = r() * w, y = r() * h, gr = c.createRadialGradient(x, y, 0, x, y, 40 + r() * 80); gr.addColorStop(0, "rgba(140,130,100,.25)"); gr.addColorStop(1, "rgba(140,130,100,0)"); c.fillStyle = gr; c.fillRect(0, 0, w, h) } }); [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
  const T_TEJA_R = (() => { const [c, z] = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(7811); c.fillStyle = "#5a2418"; c.fillRect(0, 0, w, h); z.fillStyle = "#000"; z.fillRect(0, 0, w, h);
      for (let y = h; y > -40; y -= 32) for (let x = (y / 32 % 2) * 20 - 20; x < w + 40; x += 40) { const v = r(); c.fillStyle = `rgb(${150 + v * 50 | 0},${60 + v * 25 | 0},${40 + v * 15 | 0})`; c.beginPath(); c.ellipse(x, y, 19, 30, 0, Math.PI, 0); c.fill(); const g = z.createRadialGradient(x, y - 8, 2, x, y, 30); g.addColorStop(0, "#fff"); g.addColorStop(1, "#202020"); z.fillStyle = g; z.beginPath(); z.ellipse(x, y, 19, 30, 0, Math.PI, 0); z.fill();
        if (r() < .08) { c.fillStyle = `rgba(90,110,50,${.3 + r() * .3})`; c.beginPath(); c.arc(x + (r() - .5) * 20, y - 10, 5 + r() * 8, 0, 7); c.fill() } } }); [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
  const T_TABLA_R = (() => { const [c, z] = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(7812); c.fillStyle = "#1e0e08"; c.fillRect(0, 0, w, h); z.fillStyle = "#000"; z.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 42) { const v = r(); c.fillStyle = `rgb(${110 + v * 30 | 0},${44 + v * 14 | 0},${30 + v * 10 | 0})`; c.fillRect(x + 2, 0, 38, h); z.fillStyle = "#c0c0c0"; z.fillRect(x + 2, 0, 38, h); for (let k = 0; k < 12; k++) { c.strokeStyle = `rgba(40,16,8,${.2 + r() * .3})`; c.lineWidth = 1; const xx = x + 4 + r() * 34; c.beginPath(); c.moveTo(xx, 0); c.lineTo(xx + (r() - .5) * 6, h); c.stroke() } for (const yy of [60, 300]) { c.fillStyle = "#222"; c.beginPath(); c.arc(x + 12, yy, 3, 0, 7); c.arc(x + 30, yy, 3, 0, 7); c.fill() } } }); [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
  const M_PIEDRA_C = new THREE.MeshStandardMaterial({ map: T_PIEDRA_C.c, bumpMap: T_PIEDRA_C.z, bumpScale: 3, roughness: .85 }), M_TEJA_R = new THREE.MeshStandardMaterial({ map: T_TEJA_R.c, bumpMap: T_TEJA_R.z, bumpScale: 4, roughness: .8 }), M_TABLA_R = new THREE.MeshStandardMaterial({ map: T_TABLA_R.c, bumpMap: T_TABLA_R.z, bumpScale: 2, roughness: .85 });
  const M_BLANCO = new THREE.MeshStandardMaterial({ color: "#ece6da", roughness: .7 }), M_VIDRIO = new THREE.MeshStandardMaterial({ color: "#20303a", roughness: .12, metalness: .7 }), M_POSTIGO = new THREE.MeshStandardMaterial({ color: "#3f6a4e", roughness: .7 }), M_PUERTA = new THREE.MeshStandardMaterial({ color: "#5a3420", roughness: .7 });
  // caja con uv por metro (tile = metros que cubre la textura)
  const caja = (w, h, d, tile = 3) => { const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]]; for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / tile, uv.getY(i) * dims[f][1] / tile) } return g };
  // techo a dos aguas sobre un rectángulo w × d (cumbrera a lo largo de x), alto hr, alero `al`
  const techo = (Lt, M, w, d, hr, al = .45, mat = M_TEJA_R) => { const s = Math.hypot(d / 2 + al, hr * (1 + al / (d / 2))), a = Math.atan2(hr, d / 2);
    for (const sg of [-1, 1]) Lt.add(mat, caja(w + al * 2, .14, s, 2.5), M.clone().multiply(TMx(0, hr / 2 - al * Math.tan(a) / 2, sg * (d / 4 + al / 2), sg * a, 0, 0)));
    Lt.add(mat, new THREE.CylinderGeometry(.14, .14, w + al * 2, 8), M.clone().multiply(TMx(0, hr + .06, 0, 0, 0, Math.PI / 2))) };
  const hastial = (Lt, M, d, hr, mat, tile = 3) => { const sh = new THREE.Shape([[-d / 2, 0], [d / 2, 0], [0, hr]].map(p => new THREE.Vector2(...p))), g = new THREE.ShapeGeometry(sh), p = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / tile, p.getY(i) / tile); Lt.add(mat, g, M) };
  const ventana = (Lt, M) => { const q = (...a) => M.clone().multiply(TMx(...a)); Lt.add(M_BLANCO, new THREE.BoxGeometry(1, 1.45, .16), q(0, 0, .02)); Lt.add(M_VIDRIO, new THREE.BoxGeometry(.8, 1.25, .1), q(0, 0, .06)); Lt.add(M_BLANCO, new THREE.BoxGeometry(.06, 1.25, .14), q(0, 0, .07)); Lt.add(M_BLANCO, new THREE.BoxGeometry(.8, .06, .14), q(0, .1, .07)); Lt.add(M_BLANCO, new THREE.BoxGeometry(1.2, .1, .3), q(0, -.78, .1));
    for (const s of [-1, 1]) { Lt.add(M_POSTIGO, new THREE.BoxGeometry(.5, 1.4, .05), q(s * .78, 0, .1)); for (let k = 0; k < 5; k++) Lt.add(M_POSTIGO, new THREE.BoxGeometry(.42, .04, .07), q(s * .78, -.5 + k * .25, .12, .4)) } };
  const piso = (x0, x1, z0, z1) => { let m = -1e9; for (let i = 0; i <= 4; i++) for (let j = 0; j <= 4; j++) m = Math.max(m, ARR0(lerp(x0, x1, i / 4), lerp(z0, z1, j / 4))); return m };
  const GRANJA_G = new THREE.Group(); G.add(GRANJA_G);
  { const Lt = lote(), [gx, gz] = GRANJA;
    // casa: 12 × 8, dos pisos (6,4 m), frente hacia +z (al campo y al pueblo); ala de un piso al este
    { const W = 12, D = 8, H = 6.4, x = gx + 2, z = gz + 2, y = piso(x - W / 2, x + W / 2, z - D / 2, z + D / 2), M = TMx(x, y, z), q = (...a) => M.clone().multiply(TMx(...a));
      Lt.add(M_PIEDRA_C, caja(W + .4, 1.6, D + .4), q(0, -.4, 0)); Lt.add(M_PIEDRA_C, caja(W, H, D), q(0, H / 2, 0)); Lt.add(M_BLANCO, caja(W + .2, .22, D + .2, 1), q(0, 3.2, 0)); Lt.add(M_BLANCO, caja(W + .3, .25, D + .3, 1), q(0, H, 0));
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (let k = 0; k < 9; k++) Lt.add(M_PIEDRA_C, caja(k % 2 ? .5 : .75, .34, k % 2 ? .75 : .5, 1.5), q(sx * (W / 2 - .15), .3 + k * .7, sz * (D / 2 - .15)));
      techo(Lt, q(0, H, 0), W, D, 3.4); for (const s of [-1, 1]) hastial(Lt, q(s * W / 2, H, 0, 0, s * Math.PI / 2), D, 3.4, M_PIEDRA_C);
      for (const cx of [-3.6, 3.6]) { Lt.add(M_PIEDRA_C, caja(1, 3.4, 1, 1.5), q(cx, H + 2.6, -1)); Lt.add(M_BLANCO, caja(1.25, .2, 1.25, 1), q(cx, H + 4.3, -1)) }
      for (const fx of [-4.3, -1.6, 1.6, 4.3]) { ventana(Lt, q(fx, 4.8, D / 2)); if (Math.abs(fx) > 2) ventana(Lt, q(fx, 1.75, D / 2)) }
      for (const fx of [-3, 3]) { ventana(Lt, q(fx, 4.8, -D / 2, 0, Math.PI)); ventana(Lt, q(fx, 1.75, -D / 2, 0, Math.PI)) } ventana(Lt, q(W / 2, 4.8, 0, 0, Math.PI / 2)); ventana(Lt, q(-W / 2, 4.8, 0, 0, -Math.PI / 2));
      Lt.add(M_PUERTA, new THREE.BoxGeometry(1.3, 2.4, .2), q(0, 1.2, D / 2)); Lt.add(M_BLANCO, new THREE.BoxGeometry(1.7, 2.8, .14), q(0, 1.35, D / 2 - .02)); Lt.add(M_FIE, new THREE.SphereGeometry(.05, 8, 6), q(.45, 1.2, D / 2 + .12));
      for (const s of [-1, 1]) Lt.add(M_BLANCO, new THREE.CylinderGeometry(.16, .2, 2.8, 12), q(s * 1.3, 1.4, D / 2 + 1.6)); techo(Lt, q(0, 2.85, D / 2 + 1.1, 0, Math.PI / 2), 2.4, 3.4, .7, .15);
      for (let k = 0; k < 3; k++) Lt.add(M_PIEDRA_C, caja(3.4, .2, .5, 1.5), q(0, -.1 - k * .2, D / 2 + .5 + k * .45));
      // ala este
      Lt.add(M_PIEDRA_C, caja(6, 3.6, 6.5), q(W / 2 + 3, 1.8, -.5)); techo(Lt, q(W / 2 + 3, 3.6, -.5, 0, Math.PI / 2), 6.5, 6, 2.2); ventana(Lt, q(W / 2 + 3, 1.8, 2.75)); ventana(Lt, q(W / 2 + 6, 1.8, -.5, 0, Math.PI / 2));
      for (let k = 0; k < 6; k++) Lt.add(new THREE.MeshStandardMaterial({ color: ["#c0392b", "#e8c040", "#e07a9a", "#f0f0e0"][k % 4], roughness: .8 }), new THREE.SphereGeometry(.13, 6, 5), q(-4.3 + (k % 3) * .3 - .3, 1.05, D / 2 + .25)) }
    // granero: 15 × 10, tablas rojas sobre zócalo de piedra, portón, pajar
    { const W = 15, D = 10, H = 5.6, x = gx - 12, z = gz - 4, y = piso(x - D / 2, x + D / 2, z - W / 2, z + W / 2), M = TMx(x, y, z, 0, Math.PI / 2), q = (...a) => M.clone().multiply(TMx(...a));
      Lt.add(M_PIEDRA_C, caja(W + .3, 2.4, D + .3), q(0, .2, 0)); Lt.add(M_TABLA_R, caja(W, H - 1.4, D, 3), q(0, 1.4 + (H - 1.4) / 2, 0)); techo(Lt, q(0, H, 0), W, D, 4.6, .6, new THREE.MeshStandardMaterial({ color: "#5a5a58", roughness: .8, map: T_TEJA_R.c }));
      for (const s of [-1, 1]) { hastial(Lt, q(s * W / 2, H, 0, 0, s * Math.PI / 2), D, 4.6, M_TABLA_R); Lt.add(M_PUERTA, new THREE.BoxGeometry(.2, 3.6, 4.4), q(s * (W / 2 + .05), 1.8, 0)); Lt.add(M_BLANCO, new THREE.BoxGeometry(.24, .2, 4.6), q(s * (W / 2 + .07), 3.6, 0)); for (const d of [-1, 1]) Lt.add(M_BLANCO, new THREE.BoxGeometry(.24, 4.4, .16), q(s * (W / 2 + .07), 1.8, 0, Math.atan2(4.4, 3.6) * d, 0, 0)); Lt.add(M_PUERTA, new THREE.BoxGeometry(.2, 1.5, 1.6), q(s * (W / 2 + .05), 6.3, 0)); Lt.add(M_PAJA, new THREE.BoxGeometry(.1, 1.2, 1.3), q(s * (W / 2 + .14), 6.25, 0)) }
      for (let k = -2; k <= 2; k++) ventana(Lt, q(k * 2.8, 3.2, D / 2, 0, 0, 0, .7)) }
    // silo y pozo
    { const x = gx - 22, z = gz + 6, y = piso(x - 2.5, x + 2.5, z - 2.5, z + 2.5); const g = new THREE.CylinderGeometry(2.4, 2.6, 10, 28, 1, true), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 15 / 3, uv.getY(i) * 10 / 3); Lt.add(M_PIEDRA_C, g, TMx(x, y + 4.4, z)); Lt.add(M_TEJA_R, new THREE.ConeGeometry(2.9, 2.6, 28), TMx(x, y + 10.7, z)); Lt.add(M_BLANCO, new THREE.TorusGeometry(2.45, .1, 6, 28), TMx(x, y + 9.4, z, Math.PI / 2)) }
    { const x = gx + 8, z = gz + 10, y = ARR0(x, z); Lt.add(M_PIEDRA_C, new THREE.CylinderGeometry(.9, .95, .9, 18), TMx(x, y + .4, z)); for (const s of [-1, 1]) Lt.add(M_MAD, new THREE.BoxGeometry(.12, 1.8, .12), TMx(x + s * .8, y + 1.3, z)); techo(Lt, TMx(x, y + 2.1, z), 2, 1.6, .6, .2) }
    // carro de tierra junto al camino (dos ruedas)
    { const x = -4, z = -44, y = ARR0(x, z), M = TMx(x, y, z, 0, .3), q = (...a) => M.clone().multiply(TMx(...a)); Lt.add(M_MAD, caja(1.8, .5, 3, 1.5), q(0, 1, 0)); Lt.add(M_TNUEVA, new THREE.SphereGeometry(1, 12, 8, 0, 6.283, 0, 1.3), q(0, 1.15, 0, 0, 0, 0, .85, .45, 1.4));
      for (const s of [-1, 1]) Lt.add(M_MAD, new THREE.TorusGeometry(.6, .07, 6, 18), q(s * 1, .6, 0, 0, Math.PI / 2)); Lt.add(M_MAD, new THREE.BoxGeometry(.1, .1, 2.4), q(-.3, .8, 2.4)); Lt.add(M_MAD, new THREE.BoxGeometry(.1, .1, 2.4), q(.3, .8, 2.4)) }
    Lt.fin(GRANJA_G) }
  // árboles (robles): copas de bultos, troncos; cerca de la granja, en lindes y aislados
  const ARBOL = (() => { const r = rng(7813), cop = [], tr = []; const bul = (s) => { const g = new THREE.IcosahedronGeometry(1, 2), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const v = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i)), k = 1 + (fbm(v.x * 1.6 + s, v.z * 1.6 - s + v.y, 3) - .5) * .6; p.setXYZ(i, v.x * k, v.y * k * .85, v.z * k) } g.computeVertexNormals(); return g };
    tr.push([new THREE.CylinderGeometry(.28, .45, 4.4, 8), TMx(0, 2.2, 0)]); for (let k = 0; k < 3; k++) tr.push([new THREE.CylinderGeometry(.12, .2, 2.6, 6), TMx(Math.cos(k * 2.1) * .7, 4.2, Math.sin(k * 2.1) * .7, Math.sin(k * 2.1) * .6, 0, -Math.cos(k * 2.1) * .6)]);
    for (let k = 0; k < 9; k++) { const a = r() * 6.283, d = r() * 2.4; cop.push([bul(k), TMx(Math.cos(a) * d, 5.6 + r() * 2.2, Math.sin(a) * d, 0, 0, 0, 1.6 + r() * 1)]) }
    const gc = mergeGeo(cop), c = gc.attributes.position, col = new Float32Array(c.count * 3); for (let i = 0; i < c.count; i++) { const v = .55 + .45 * cl((c.getY(i) - 4) / 5), q = fbm(c.getX(i) * .9, c.getZ(i) * .9 + c.getY(i), 2); col.set([.26 * v + q * .08, .38 * v + q * .08, .14 * v], i * 3) } gc.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return { gc, gt: mergeGeo(tr) } })();
  { const r = rng(7814), L = [[GRANJA[0] - 22, GRANJA[1] - 8], [GRANJA[0] - 24, GRANJA[1] + 1], [GRANJA[0] + 16, GRANJA[1] - 10], [GRANJA[0] + 14, GRANJA[1] + 12], [GRANJA[0] - 6, GRANJA[1] - 15], [26, -42], [-24, -22], [48, -12]];
    for (let k = 0; k < 160 && L.length < 70; k++) { const x = -700 + r() * 1400, z = -700 + r() * 1200, p = parcela(x, z); if (p.linde < 1.2 && Math.hypot(x, z) > 60) L.push([x, z]) }
    const mc = new THREE.InstancedMesh(ARBOL.gc, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .85 }), L.length), mt = new THREE.InstancedMesh(ARBOL.gt, new THREE.MeshStandardMaterial({ color: "#4a3626", roughness: .9 }), L.length);
    L.forEach(([x, z], i) => { dummy.position.set(x, ARR0(x, z) - .2, z); dummy.rotation.set(0, r() * 6.28, 0); dummy.scale.setScalar(.8 + r() * .5); dummy.updateMatrix(); mc.setMatrixAt(i, dummy.matrix); mt.setMatrixAt(i, dummy.matrix) }); [mc, mt].forEach(m => { m.computeBoundingSphere(); sombra(m); G.add(m) }) }

  // ---------------- LA ESCALERA DE KELL: trampa con tapa abierta y la escalera larga que baja a la Loma ----------------
  const ESCALERA = new THREE.Group(); scene.add(ESCALERA);
  { const Lt = lote(), [x, z] = ESC, yb = CIELO(x, z), yt = ARR0(x, z), yp = ALT_C(x, z), H = .7;
    for (const [dx, dz, w, d] of [[0, -H - .08, 1.7, .16], [0, H + .08, 1.7, .16], [-H - .08, 0, .16, 1.4], [H + .08, 0, .16, 1.4]]) Lt.add(M_MAD, new THREE.BoxGeometry(w, .3, d), TMx(x + dx, yt + .08, z + dz));
    Lt.add(M_MAD, new THREE.BoxGeometry(1.4, .08, 1.4), TMx(x, yt + .7, z - H - .35, -1.25)); Lt.add(M_FIE, new THREE.BoxGeometry(.5, .04, .06), TMx(x, yt + .75, z - H - .3, -1.25));
    for (const s of [-1, 1]) { Lt.add(M_MADC, new THREE.BoxGeometry(.08, yt + 1.1 - yp, .1), TMx(x + s * .32, (yt + 1.1 + yp) / 2, z + .4)); }
    const n = Math.floor((yt + 1 - yp) / .32); for (let k = 0; k < n; k++) Lt.add(M_MADC, new THREE.CylinderGeometry(.025, .025, .64, 6), TMx(x, yp + .3 + k * .32, z + .4, 0, 0, Math.PI / 2));
    // la boca en el corte de la tapa (cuatro paredes de tablón y tierra)
    for (const [dx, dz, ry] of [[0, -H, 0], [0, H, Math.PI], [-H, 0, Math.PI / 2], [H, 0, -Math.PI / 2]]) Lt.add(new THREE.MeshStandardMaterial({ map: T.CORTE.c, bumpMap: T.CORTE.z, bumpScale: 3, roughness: .95, side: THREE.DoubleSide }), new THREE.PlaneGeometry(1.44, LID_T), TMx(x + dx, yb + LID_T / 2, z + dz, 0, ry));
    // farol colgado
    Lt.add(M_MAD, new THREE.BoxGeometry(.1, 2, .1), TMx(x + 1.3, yt + 1, z + 1.2)); Lt.add(M_MAD, new THREE.BoxGeometry(.6, .08, .08), TMx(x + 1.05, yt + 1.95, z + 1.2)); Lt.add(M_FIE, new THREE.BoxGeometry(.22, .3, .22), TMx(x + .8, yt + 1.7, z + 1.2));
    Lt.fin(ESCALERA) }

  // ---------------- EL CIELO DE VERDAD: sol dorado bajo y nubes con volumen ----------------
  const SOL_G = new THREE.Group(); scene.add(SOL_G);
  const T_DISCO = tex(256, 256, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, "rgba(255,250,230,1)"); gr.addColorStop(.42, "rgba(255,240,200,1)"); gr.addColorStop(.5, "rgba(255,214,140,.55)"); gr.addColorStop(1, "rgba(255,190,110,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h) });
  const SOL_D = new THREE.Sprite(new THREE.SpriteMaterial({ map: T_DISCO, fog: false, depthWrite: false, toneMapped: false, color: "#ffffff" })), SOL_H = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#ffc070", fog: false, depthWrite: false, transparent: true, opacity: .55, blending: THREE.AdditiveBlending }));
  SOL_D.scale.setScalar(22); SOL_H.scale.setScalar(150); SOL_G.add(SOL_H, SOL_D);
  const T_COPO = tex(256, 256, (g, w, h) => { const r = rng(7815); g.clearRect(0, 0, w, h); for (let k = 0; k < 26; k++) { const a = r() * 6.283, d = r() * 60, x = w / 2 + Math.cos(a) * d, y = h / 2 + Math.sin(a) * d * .8, R = 30 + r() * 40, gr = g.createRadialGradient(x - R * .2, y - R * .3, 0, x, y, R); gr.addColorStop(0, "rgba(255,255,255,.55)"); gr.addColorStop(.6, "rgba(235,238,245,.3)"); gr.addColorStop(1, "rgba(220,225,235,0)"); g.fillStyle = gr; g.beginPath(); g.arc(x, y, R, 0, 7); g.fill() } });
  const NUBES_R = (() => { const r = rng(7816), Cq = []; for (let k = 0; k < 30; k++) { const a = r() * 6.283, d = 280 + r() * 700, cx = Math.cos(a) * d, cz = Math.sin(a) * d - 40, cy = 120 + r() * 140, R0 = 26 + r() * 30, n = 14 + r() * 12 | 0;
      for (let q = 0; q < n; q++) { const u = r() * 2 - 1, v = r(), R = R0 * (.4 + r() * .4) * (1 - Math.abs(u) * .45), y = cy + v * R0 * .6 * (1 - u * u); Cq.push([cx + u * R0 * 1.9, y, cz + (r() - .5) * R0 * .9, R * 2.2, v, r() * 6.28]) } }
    const m = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: T_COPO, transparent: true, depthWrite: false, fog: true }), Cq.length); m.frustumCulled = false; m.renderOrder = 1; scene.add(m);
    Cq.forEach((_, i) => m.setColorAt(i, new THREE.Color(1, 1, 1))); return { m, Cq } })();

  // ---------------- AMBIENTES ----------------
  const ENV_T = {
    arriba: { top: "#2a6cd0", hor: "#f2d9a8", fog: .0012, hemi: .85, hemiG: "#8a6a30", sun: 4.6, sunCol: "#ffcf8c", exp: 1.05, grade: ["#ffcf8a", .06], sol: T.SOL_REAL, nube: ["#fff2dc", 1], tapaEmi: .9, trigoGlow: .5 },
    luzReal: { top: "#9cc4ea", hor: "#a6c8e6", fog: .005, hemi: 1.0, hemiG: "#7a6a50", sun: 1.4, sunCol: "#dfe8f4", exp: 1.12, grade: ["#ffd9a0", .04], sol: [-.3, .9, .3], nube: ["#ffffff", 1], tapaEmi: .7, trigoGlow: .7 },
    bajoTapa: { top: "#9cc4ea", hor: "#b4d3ee", fog: .0035, hemi: 1.3, hemiG: "#8a7a5c", sun: 2.8, sunCol: "#fff0da", exp: 1.12, grade: ["#ffffff", 0], sol: [-.35, .85, .4], nube: ["#ffffff", 1], tapaEmi: .95, trigoGlow: .35 } };

  // ---------------- por cuadro (lo llama tapa()) ----------------
  const AR = { montones: true, escalera: false };
  function tapaArriba(t, ST) { MONTONES.visible = ST.montones; ESCALERA.visible = ST.escalera; T.U.uEsc.value = ST.escalera ? 1 : 0 }
  // ---------------- antes de dibujar: qué se ve según la cámara, el sol, el cielo ----------------
  const _d = new THREE.Vector3(), _q2 = new THREE.Quaternion(), _Z = new THREE.Vector3(0, 0, 1), _c = new THREE.Color(), _sv = new THREE.Vector3();
  const sombraOn = []; let ultAbajo = null;
  function arribaCam(c, s0) { if (!c || !c.isPerspectiveCamera) return;
    if (c.far < 2999) { c.far = 3000; c.updateProjectionMatrix() }
    try { SKY.position.copy(c.position); SKY.updateMatrixWorld() } catch (e) { }
    const ST = T.ST, A = (typeof ENV !== "undefined" && ENV[ENVNOW]) || {}, cp = c.position;
    const abajo = cp.y < (ST.cae > 0 && T.enPanel(cp.x, cp.z) ? CIELO(cp.x, cp.z) : TAPA_Y(cp.x, cp.z)) - .02;
    const abierto = ST.agu > .3 || ST.cae > 0 || ST.escalera;
    const ver = !abajo || abierto;
    T.SPOT.intensity = abajo ? (ST.spotI || 0) : 0;   // el haz solo ilumina abajo (arriba ya pega el sol)
    G.visible = SOL_G.visible = NUBES_R.m.visible = ver; PAN_ARR.visible = ver || ST.cae > 0;
    FINO.visible = ver && Math.hypot(cp.x - T.PC[0], (cp.z - T.PC[1]) * 1.4) < 70;
    if (abajo !== ultAbajo) { ultAbajo = abajo; SOMBRA.forEach(m => m.castShadow = !abajo) }
    if (ST.cae > .3) PAN_ARR.traverse(o => { if (o.isMesh) o.castShadow = true });
    T.U.uEmi.value = A.tapaEmi ?? .9; T.U.uGlow.value = A.trigoGlow ?? .35; T.PSCALE.value = (typeof H !== "undefined" ? H : 1920) / (2 * Math.tan(c.fov * Math.PI / 360));
    _sv.set(...T.SOL_REAL).transformDirection(c.matrixWorldInverse); T.U.uSunV.value.copy(_sv);
    if (s0 && s0.overrideMaterial) return;
    if (!ver) return;
    // sol y nubes de verdad
    SOL_G.position.set(cp.x + T.SOL_REAL[0] * 380, cp.y + T.SOL_REAL[1] * 380, cp.z + T.SOL_REAL[2] * 380);
    { const M = NUBES_R.m; NUBES_R.Cq.forEach(([x, y, z, sc, v, rot], i) => { dummy.position.set(x, y, z); _q2.setFromAxisAngle(_Z, rot); dummy.quaternion.copy(c.quaternion).multiply(_q2); dummy.scale.set(sc, sc * .8, 1); dummy.updateMatrix(); M.setMatrixAt(i, dummy.matrix);
        _d.set(x - cp.x, y - cp.y, z - cp.z).normalize(); const al = Math.max(0, _d.dot(new THREE.Vector3(...T.SOL_REAL))), b = .72 + .28 * v; M.setColorAt(i, _c.setRGB(b + al * .25, b * .97 + al * .15, b * .93)) }); M.instanceMatrix.needsUpdate = true; M.instanceColor.needsUpdate = true }
    // el sol de arriba: la caja de sombras se centra donde mira la cámara (sobre el piso de arriba)
    if (!abajo && typeof sun !== "undefined") { c.getWorldDirection(_d); let hit = null; for (let s = 2; s < 900; s *= 1.06) { const x = cp.x + _d.x * s, y = cp.y + _d.y * s, z = cp.z + _d.z * s; if (y < ARR0(x, z)) { hit = [x, z, s]; break } }
      if (!hit) hit = [cp.x + _d.x * 120, cp.z + _d.z * 120, 120]; const sd = T.SOL_REAL, cy = ARR0(hit[0], hit[1]), Rr = cl(hit[2] * .7, 14, 140);
      sun.position.set(hit[0] + sd[0] * 300, cy + sd[1] * 300, hit[1] + sd[2] * 300); sun.target.position.set(hit[0], cy, hit[1]); sun.updateMatrixWorld(); sun.target.updateMatrixWorld();
      const sc = sun.shadow.camera; if (sc.right !== Rr || sc.far !== 700) { sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 100; sc.far = 700; sc.updateProjectionMatrix() } } }
  { const prev = scene.onBeforeRender; scene.onBeforeRender = function (r, s, c, rt) { if (prev) prev.call(this, r, s, c, rt); arribaCam(c, s) } }
  // los puntos (polvo, motas, briznas) no entran a las pasadas con material forzado (GTAO, normales): ahí salían como cuadrados negros
  const PUNTOS = [T.POLVO, T.MOTAS, T.LLUVIA.mb];
  { const prev = scene.onBeforeRender; scene.onBeforeRender = function (r, s, c, rt) { if (prev) prev.call(this, r, s, c, rt); if (s && s.overrideMaterial) PUNTOS.forEach(p => { p.userData.ov = p.visible; p.visible = false }) } }
  { const prev = scene.onAfterRender; scene.onAfterRender = function (r, s, c, rt) { if (prev) prev.call(this, r, s, c, rt); PUNTOS.forEach(p => { if (p.userData.ov !== undefined) { p.visible = p.userData.ov; delete p.userData.ov } }) } }

  // ---------------- coordenadas para la cámara ----------------
  const AGY = CIELO(...AG);
  const CAMS = {
    calleArriba: { p: [0, 1.7, 8], l: [0, 12, -20], f: 60, env: "bajoTapa", nota: "desde la calle mirando arriba: tiene que parecer cielo (sol pintado arriba a la derecha si se mira al noreste)" },
    calleSol: { p: [6, 1.7, -22], l: [SOL_PINTADO[0], CIELO(...SOL_PINTADO), SOL_PINTADO[1]], f: 50, env: "bajoTapa", nota: "el sol pintado (círculo blanco) con el halo y nubes alrededor" },
    bajoTapa: { p: [AG[0] - .7, AGY - .8, AG[1] + 1.1], l: [AG[0] + .4, AGY, AG[1] - .4], f: 55, env: "bajoTapa", nota: "a 0,8 m de la tapa junto al agujero: madera pintada (tablones, vetas, clavos, descascarado)" },
    cuchillo: { p: [AG[0] - .35, AGY - .45, AG[1] + .45], l: [AG[0], AGY, AG[1]], f: 50, env: "bajoTapa", nota: "plano detalle del tajo (tapaAgujero 0 → .35)" },
    cabezaAgujero: { p: [AG[0], AGY + LID_T + .32, AG[1]], l: [AG[0] - 30, AGY + LID_T + 1.8, AG[1] - 9], f: 55, env: "arriba", nota: "la cabeza asomada por el agujero mirando al oeste: trigo enorme, campo hasta el horizonte, el sol dorado" },
    cabezaGranja: { p: [AG[0], AGY + LID_T + .32, AG[1]], l: [GRANJA[0], ARR0(...GRANJA) + 3, GRANJA[1]], f: 50, env: "arriba", nota: "desde el agujero hacia la granja de Kell y la loma de trigo" },
    montones: { p: [AG[0] + .2, AGY + LID_T + 1.05, AG[1] + .3], l: [-4, AGY + LID_T + .3, -8], f: 52, env: "arriba", nota: "desde el agujero hacia los montones de tierra nueva, carretillas y palas (escena «dirt»)" },
    escalera: { p: [ESC[0] + 7, ARR0(ESC[0] + 7, ESC[1] + 10) + 4.5, ESC[1] + 10], l: [ESC[0], ARR0(...ESC) + .5, ESC[1]], f: 50, env: "arriba", nota: "la boca de la escalera de Kell en la trampa (escaleraArriba(true))" },
    aereoHueco: { p: [34, 58, 48], l: [0, 8, 0], f: 45, env: "arriba", nota: "aéreo con el hueco (tapaCae 1): se ve la calle abajo con el panel caído" },
    kellMira: { p: [KELL_BORDE[0] + 3, KELL_BORDE[1] + 5.5, KELL_BORDE[2] - 5], l: [KELL_BORDE[0] - 1.5, KELL_BORDE[1] - 9, KELL_BORDE[2] + 8], f: 50, env: "arriba", nota: "detrás de Kell parado en el borde del hueco, mirando abajo" },
    calleHueco: { p: [8, 1.6, 16], l: [0, 12, -2], f: 55, env: "luzReal", nota: "desde la calle: el hueco con el cielo de verdad, el haz y la lluvia de oro (tapaCae 1, lluviaTrigo)" },
    calleHaz: { p: [9, 1.6, 9], l: [3, 4, 2], f: 55, env: "luzReal", nota: "el haz del agujero cayendo en la calle con polvo (tapaAgujero 1)" } };

  return { G, FINO, ARR0, relieve, parcela, caminoD, CAMINOS, GRANJA, ENV_T, CAMS, AR, MONTONES, ESCALERA, SOL_G, NUBES_R, GRANJA_G, MATAS, TARJS, tapaArriba };
})();
// ---------------- API de ARRIBA ----------------
function tapaArriba(t, ST) { ARRIBA.tapaArriba(t, ST) }
const ENV_CIELO_TAPA = ARRIBA.ENV_T, CAMS_TAPA = ARRIBA.CAMS;
const TAPA_OBJS = [TAPA.G, TAPA.PAN, ARRIBA.G, ARRIBA.ESCALERA, ARRIBA.SOL_G, ARRIBA.NUBES_R.m, TAPA.SPOT, TAPA.SPOT.target];   // todo lo de esta parte que cuelga de scene
// piso de arriba (tierra, con relieve) en (x, z), con el hundimiento actual
const ARRIBA_Y = (x, z) => TAPA_Y(x, z) + LID_T + ARRIBA.relieve(x, z);
const montonesTierra = (v = true) => { TAPA.ST.montones = !!v };
const escaleraArriba = (v = true) => { TAPA.ST.escalera = !!v };
// ---------------- stubs del video viejo (la cordillera y el valle ya no existen): las escenas viejas siguen armando ----------------
const SUELO_LEJOS = (x, z) => ALT_C(x, z), nubesValle = () => { }, jironesNube = () => { }, cometaGeo = () => new THREE.BufferGeometry(), nuevaCometa = () => new THREE.Group(), cometaCola = () => { }, cometaHilo = () => { };
function lejosReset() { tapaReset() }
function lejos(t) { tapa(t) }
const ATERRIZA = [0, 0, 0], COMETAS_PIP = [0, 0, 0], MEDIA_PASTO = [0, 0, 0], VUELO_PTS = [[0, 16, -10], [10, 20, -10], [20, 24, -10]];
const CAMS_VALLE = Object.fromEntries(["aereoValle", "aterrizaPicado", "pastoPersona", "cometasPip", "haciaCordillera", "humoDerecho", "cresta", "marDeNubes"].map(k => [k, { p: [0, 6, 30], l: [0, 4, 0], f: 50 }]));
const ENV_LEJOS = ENV_CIELO_TAPA, LEJOS_G = ARRIBA.G, LEJOS_CFG = {};
window.TAPA_DBG = { TAPA, ARRIBA };
