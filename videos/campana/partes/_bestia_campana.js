// ================= LA CAMPANA DE UNDERBELL: el bronce gigante, su corona, las cuatro cadenas, el interior (plataforma de Sallow, gancho roto, rayo de luna, polvo, cera) y la SOMBRA =================
// Medidas de _comun_campana.js (CAMPANA_C, CAMPANA_Y, CAMPANA_R, CAMPANA_H, CORONA, MONTES, RISCO_E). Norte = −z; ángulos en planta: x = cos a, z = sin a (a = 0 → este).
// El cuerpo de la campana mide HB (134,2 m) del labio a la tapa de arriba; encima la corona (dos argollas cruzadas) llega a CORONA (y = 300), donde se enganchan las cadenas.
// La SOMBRA es analítica: se parchea el shader de luces de three (ShaderChunk) para que TODA luz direccional (el sol / la luna) quede tapada por la campana y por las
// cadenas, en cualquier material, a cualquier distancia (no depende de la caja de sombras del sol, que la ciudad usa para lo chico). Va siempre prendida.
// Al final: API (cadenaPunto, cadenaTangente, cadenaMarco, PRIMER_ESLABON, interior, zumbido, ceraEnLabio, golpe, sombraCampana) y los stubs del video viejo.
const CBX = (() => {
  const G = new THREE.Group(); G.name = "CAMPANA"; scene.add(G);
  const CX = CAMPANA_C[0], CZ = CAMPANA_C[1], Y0 = CAMPANA_Y, HB = 134.2, TAU = Math.PI * 2;
  const sst = (a, b, v) => { const q = cl((v - a) / (b - a)); return q * q * (3 - 2 * q) };
  const hsh = (i, j) => { let n = (Math.imul(i | 0, 374761393) + Math.imul(j | 0, 668265263)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296 };
  const rd = (x, z) => { const i = Math.floor(x), j = Math.floor(z), u = x - i, v = z - j, a = u * u * (3 - 2 * u), b = v * v * (3 - 2 * v); return lerp(lerp(hsh(i, j), hsh(i + 1, j), a), lerp(hsh(i, j + 1), hsh(i + 1, j + 1), a), b) };
  const fbm = (x, z, o = 4) => { let s = 0, a = .5, f = 1, n = 0; for (let k = 0; k < o; k++) { s += a * rd(x * f + k * 17.3, z * f - k * 9.1); n += a; a *= .5; f *= 2.03 } return s / n };
  const TMx = (x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, "YXZ")), new THREE.Vector3(sx, sy, sz));
  const polar = (r, h, a) => [CX + r * Math.cos(a), Y0 + h, CZ + r * Math.sin(a)];
  const G_ = v => { const q = Math.round(cl(v) * 255); return `rgb(${q},${q},${q})` };
  const mergeGeo = list => { let n = 0; const qs = list.map(([g, m]) => { const q = g.index ? g.toNonIndexed() : g.clone(); if (m) q.applyMatrix4(m); if (!q.attributes.uv) q.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(q.attributes.position.count * 2), 2)); if (!q.attributes.normal) q.computeVertexNormals(); n += q.attributes.position.count; return q }), hayC = qs.some(q => q.attributes.color);
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2), co = hayC ? new Float32Array(n * 3).fill(1) : null; let o = 0;
    qs.forEach(q => { const k = q.attributes.position.count; pos.set(q.attributes.position.array, o * 3); nor.set(q.attributes.normal.array, o * 3); uv.set(q.attributes.uv.array, o * 2); if (co && q.attributes.color) co.set(q.attributes.color.array, o * 3); o += k });
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); g.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); if (co) g.setAttribute("color", new THREE.BufferAttribute(co, 3)); g.computeBoundingSphere(); return g };
  const lote = () => { const B = new Map(); return { add(mat, g, m) { (B.get(mat) || B.set(mat, []).get(mat)).push([g, m]) }, fin(par) { const out = []; for (const [mat, L] of B) { const me = new THREE.Mesh(mergeGeo(L), mat); par.add(me); out.push(me) } return out } } };
  const A_CAD_E = Math.atan2(RISCO_E[1] - CZ, RISCO_E[0] - CX);   // hacia el risco: por ahí baja la cadena del este
  const A_ENT = A_CAD_E + .075;                                    // la GRIETA de entrada (al lado de la cadena) y la plataforma de adentro
  const HUECO = [CX - 14, CZ], R_HUECO = 3.4;                      // el agujero de la tapa de arriba (al oeste de la corona) por donde entra la luna
  const GRIETA = { hc: 11.5, hw: 1.75, hh: 3.7 };                  // la grieta: centro a 11,5 m del labio, 3,5 × 7,4 m, bordes dentados
  const jag = a => 1 + .16 * Math.sin(3 * a + 1.3) + .1 * Math.sin(7 * a + .4) + .06 * Math.sin(13 * a + 2.1);

  // ======================= PERFIL (r, h) =======================
  // afuera: empieza adentro del labio por abajo (cara de abajo del labio), sube por el arco sonoro, la cintura, el hombro y la tapa hasta el agujero del centro
  const PEXT = [[85.6, 0], [86.4, -.3], [88, -.5], [91, -.45], [93.2, 0], [94.6, .5], [95.6, 1.8], [95.9, 3.2], [95.4, 4.6], [94.3, 6.2], [93.4, 8], [92.2, 11], [90.2, 15], [87.5, 20], [84.2, 26], [80.6, 33], [77.2, 41], [74.3, 50], [71.9, 60], [70, 70],
    [68.4, 80], [67.1, 90], [66, 99], [64.9, 106], [63.4, 112], [61, 117.5], [57.6, 122.5], [52.8, 126.6], [46.4, 129.8], [38.5, 132], [29, 133.3], [18, 134], [8, 134.2], [3.6, 134.2]];
  const curvaE = new THREE.SplineCurve(PEXT.map(([r, h]) => new THREE.Vector2(r, h))), ARC_E = curvaE.getLength();
  const perfil = (S, adentro) => S.map((p, i) => { const a = S[Math.max(0, i - 1)], b = S[Math.min(S.length - 1, i + 1)], tr = b.x - a.x, th = b.y - a.y, l = Math.hypot(tr, th) || 1; return { r: p.x, h: p.y, v: i / (S.length - 1), nr: adentro ? -th / l : th / l, nh: adentro ? tr / l : -tr / l } });
  const PE = perfil(curvaE.getSpacedPoints(400), false);
  const I_FLANCO = PE.findIndex(p => p.r > 93);                    // donde empieza el flanco (después de la cara de abajo)
  const RT = new Float32Array(137); PE.forEach(p => { if (p.h < 0) return; const k = Math.min(136, Math.floor(p.h)); RT[k] = Math.max(RT[k], p.r) }); for (let k = 1; k < 137; k++) if (!RT[k]) RT[k] = RT[k - 1];
  const rOut = h => { if (h <= 0) return RT[0]; if (h >= 135) return RT[135]; const k = Math.floor(h); return lerp(RT[k], RT[k + 1], h - k) };   // radio de afuera a la altura h
  const vDe = (P, i0, h) => { for (let i = i0; i < P.length - 1; i++) if (P[i + 1].h >= h) { const a = P[i], b = P[i + 1]; return lerp(a.v, b.v, cl((h - a.h) / Math.max(1e-6, b.h - a.h))) } return 1 };
  // altura de la superficie de arriba (tapa / hombro) en el radio r (para apoyar cosas encima)
  const hArriba = r => { for (let i = PE.length - 1; i > I_FLANCO; i--) if (PE[i - 1].r >= r) { const a = PE[i - 1], b = PE[i]; return lerp(b.h, a.h, cl((r - b.r) / Math.max(1e-6, a.r - b.r))) } return 0 };
  // adentro: el labio por dentro (con la CANALETA entre el reborde y la pared, donde va la cera) y la pared con su espesor
  const grosor = h => h < 8 ? 6.5 : h < 20 ? lerp(6.5, 4.6, (h - 8) / 12) : h < 45 ? lerp(4.6, 3.4, (h - 20) / 25) : lerp(3.4, 3.0, sst(45, 130, h));
  const LABIO_IN = [[85.6, 0], [84.7, 1.2], [84.35, 3.4], [84.6, 5.6], [85.1, 6.5], [85.6, 6.15], [85.9, 4.9], [86.3, 4.3], [86.8, 4.4], [87.1, 5.3], [87.05, 7.0]];
  const OFFS = PE.slice(I_FLANCO).map(p => { const g = grosor(p.h); return [p.r - p.nr * g, p.h - p.nh * g] }).filter(q => q[1] > 7.8 && q[0] > 3.4);
  const curvaI = new THREE.SplineCurve([...LABIO_IN, ...OFFS].map(([r, h]) => new THREE.Vector2(r, h))), ARC_I = curvaI.getLength();
  const PI_ = perfil(curvaI.getSpacedPoints(300), true);
  const I_PARED = PI_.findIndex(p => p.h > 7.6);
  const rIn = h => { for (let i = I_PARED; i < PI_.length - 1; i++) if (PI_[i + 1].h >= h) return lerp(PI_[i].r, PI_[i + 1].r, cl((h - PI_[i].h) / Math.max(1e-6, PI_[i + 1].h - PI_[i].h))); return 3.6 };
  const H_TECHO = PI_[PI_.length - 1].h;                            // altura del techo de adentro (≈ 131)

  // torno: superficie de revolución con normales exactas (sin costura). flip = cara hacia adentro
  const torno = (P, NR, rep, flip = false, a0 = 0, a1 = TAU) => {
    const NP = P.length, n = NP * (NR + 1), pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2), idx = new Uint32Array((NP - 1) * NR * 6); let k = 0, q = 0;
    for (let i = 0; i < NP; i++) for (let j = 0; j <= NR; j++) { const a = a0 + (a1 - a0) * j / NR, c = Math.cos(a), s = Math.sin(a), p = P[i];
      pos[k * 3] = CX + p.r * c; pos[k * 3 + 1] = Y0 + p.h; pos[k * 3 + 2] = CZ + p.r * s; nor[k * 3] = p.nr * c; nor[k * 3 + 1] = p.nh; nor[k * 3 + 2] = p.nr * s; uv[k * 2] = (flip ? 1 : -1) * (a - a0) / TAU * rep; /* afuera: u crece hacia la derecha mirando desde afuera (letras derechas) */ uv[k * 2 + 1] = p.v; k++ }
    for (let i = 0; i < NP - 1; i++) for (let j = 0; j < NR; j++) { const a = i * (NR + 1) + j, b = a + NR + 1; if (!flip) { idx[q++] = a; idx[q++] = b; idx[q++] = a + 1; idx[q++] = a + 1; idx[q++] = b; idx[q++] = b + 1 } else { idx[q++] = a; idx[q++] = a + 1; idx[q++] = b; idx[q++] = a + 1; idx[q++] = b + 1; idx[q++] = b } }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); g.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); g.setIndex(new THREE.BufferAttribute(idx, 1)); g.computeBoundingSphere(); return g };

  // ======================= TEXTURAS PINTADAS DEL BRONCE =======================
  // sello: dibuja en un lienzo chico (con desenfoques baratos) y lo pega en el grande (source-over: lo transparente no toca nada)
  const sello = (g, x, y, w, h, fn, W = 0) => { const c = mk(Math.max(1, Math.ceil(w)), Math.max(1, Math.ceil(h))), t = c.getContext("2d"); fn(t, c.width, c.height); g.drawImage(c, x, y); if (W) { if (x + w > W) g.drawImage(c, x - W, y); if (x < 0) g.drawImage(c, x + W, y) } };
  // relieve en capas: la misma forma con desenfoque grande y bajo, y cada vez más nítida y más alta → bulto redondeado
  const capas = (t, forma, base, alto, bl = 5) => { [[bl, base], [bl * .5, lerp(base, alto, .6)], [bl * .2, alto]].forEach(([b, v], i) => { t.save(); t.filter = `blur(${b.toFixed(1)}px)`; t.fillStyle = t.strokeStyle = G_(v); forma(t, i); t.restore() }) };
  // hornea: altura (lienzo H) + máscaras (lienzo M: R = verdín, G = mugre, B = hierro) → color (en M) y datos (en H: R altura, G aspereza, B metal)
  function hornear(cH, cM, pal) { const W = cH.width, Hh = cH.height, gH = cH.getContext("2d", { willReadFrequently: true }), gM = cM.getContext("2d", { willReadFrequently: true });
    const W4 = W >> 2, H4 = Hh >> 2, cB = mk(W4, H4), gB = cB.getContext("2d", { willReadFrequently: true }); gB.filter = "blur(4px)"; gB.drawImage(cH, 0, 0, W4, H4);
    const dH = gH.getImageData(0, 0, W, Hh), dM = gM.getImageData(0, 0, W, Hh), dB = gB.getImageData(0, 0, W4, H4).data, h = dH.data, m = dM.data;
    const NZ = 48, nz = new Float32Array(NZ * NZ), r = rng(pal.seed); for (let i = 0; i < nz.length; i++) nz[i] = r();
    const ruido = (x, y) => { const fx = x / W * NZ, fy = y / Hh * NZ, i = Math.floor(fx), j = Math.floor(fy), u = fx - i, v = fy - j, i0 = i % NZ, i1 = (i + 1) % NZ, j1 = Math.min(NZ - 1, j + 1); return lerp(lerp(nz[j * NZ + i0], nz[j * NZ + i1], u), lerp(nz[j1 * NZ + i0], nz[j1 * NZ + i1], u), v) };
    const [b0, b1, pu0, pu1, ve0, ve1, fe0, fe1] = pal.c;
    for (let y = 0; y < Hh; y++) { const by = Math.min(H4 - 1, y >> 2);
      for (let x = 0; x < W; x++) { const i = (y * W + x) * 4, hv = h[i] / 255, hb = dB[(by * W4 + (x >> 2)) * 4] / 255, rel = hv - hb, n = ruido(x, y), n2 = ruido((x * 3.1) % W, (y * 2.7) % Hh);
        const ver = m[i] / 255, mug = m[i + 1] / 255, fer = m[i + 2] / 255;
        let R = lerp(b0[0], b1[0], n), Gc = lerp(b0[1], b1[1], n), B = lerp(b0[2], b1[2], n), rough = pal.rb, met = pal.mb;
        const pul = cl(rel * pal.kp - .03) * (1 - cl(ver * 1.4)) * pal.pul;                               // lo saliente, frotado por el viento y las manos: cobre
        R = lerp(R, lerp(pu0[0], pu1[0], n2), pul); Gc = lerp(Gc, lerp(pu0[1], pu1[1], n2), pul); B = lerp(B, lerp(pu0[2], pu1[2], n2), pul); rough = lerp(rough, .24, pul); met = lerp(met, 1, pul);
        const vv = cl((ver + Math.max(-rel, 0) * pal.kv) * pal.ver), vc = lerp(.15, 1, n2);                // verdín: en los huecos y chorreado
        R = lerp(R, lerp(ve0[0], ve1[0], vc), vv); Gc = lerp(Gc, lerp(ve0[1], ve1[1], vc), vv); B = lerp(B, lerp(ve0[2], ve1[2], vc), vv); rough = lerp(rough, .9, vv); met = lerp(met, .04, vv);
        if (fer > .02) { const f = cl(fer); R = lerp(R, lerp(fe0[0], fe1[0], n2), f); Gc = lerp(Gc, lerp(fe0[1], fe1[1], n2), f); B = lerp(B, lerp(fe0[2], fe1[2], n2), f); rough = lerp(rough, .78, f); met = lerp(met, .5, f) }
        const k = 1 - .62 * cl(mug); R *= k; Gc *= k; B *= k; rough = lerp(rough, .95, cl(mug) * .5);
        m[i] = R; m[i + 1] = Gc; m[i + 2] = B; m[i + 3] = 255; h[i + 1] = rough * 255; h[i + 2] = met * 255; h[i + 3] = 255 } }
    gH.putImageData(dH, 0, 0); gM.putImageData(dM, 0, 0);
    const tc = new THREE.CanvasTexture(cM); tc.colorSpace = THREE.SRGBColorSpace; const td = new THREE.CanvasTexture(cH); td.colorSpace = THREE.NoColorSpace;
    [tc, td].forEach(t => { t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.ClampToEdgeWrapping; t.anisotropy = 8 }); return { c: tc, d: td } }

  // figura de bulto (gente tapándose los oídos): en metros, origen en los pies, y hacia abajo positiva. tipo: 0 de pie, 1 de rodillas, 2 madre con chico, 3 grita, 4 cabeza gacha
  const figura = (t, tipo, r) => { const kn = tipo === 1 ? 2.3 : 0, hx = tipo === 4 ? .25 : 0, hy = -9.05 + kn + (tipo === 4 ? .55 : 0), w = .9 + r() * .25, ao = [(r() - .5) * .3, (r() - .5) * .3];
    const sil = (g, i) => { const s = i === 2 ? .94 : 1; g.save(); g.translate(0, -4.5); g.scale(s, s); g.translate(0, 4.5);
      g.beginPath(); g.moveTo(-1.55 * w, 0); g.quadraticCurveTo(-1.7 * w, -2, -1.15, -5.2 + kn); g.quadraticCurveTo(-1.4, -7.5 + kn, -.95, -7.95 + kn); g.lineTo(-.35, -8.1 + kn); g.lineTo(.35, -8.1 + kn); g.lineTo(.95, -7.95 + kn); g.quadraticCurveTo(1.4, -7.5 + kn, 1.15, -5.2 + kn); g.quadraticCurveTo(1.7 * w, -2, 1.55 * w, 0); g.closePath(); g.fill();
      if (tipo === 1) { g.beginPath(); g.ellipse(0, -.55, 2.1 * w, .7, 0, 0, TAU); g.fill() }
      g.beginPath(); g.ellipse(hx, hy, .74, .92, 0, 0, TAU); g.fill();
      g.lineWidth = .6; g.lineCap = g.lineJoin = "round"; [-1, 1].forEach((s2, q) => { g.beginPath(); g.moveTo(s2 * .95, -7.7 + kn); g.lineTo(s2 * 1.95, -8.2 + kn + ao[q]); g.lineTo(s2 * .9 + hx, hy + .08); g.stroke(); g.beginPath(); g.ellipse(s2 * .86 + hx, hy + .02, .3, .44, 0, 0, TAU); g.fill() });
      if (tipo === 2) { g.beginPath(); g.ellipse(1.6, -2.9, .95, 1.6, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(1.6, -4.85, .52, .6, 0, 0, TAU); g.fill(); g.lineWidth = .4; g.beginPath(); g.moveTo(1.1, -3.8); g.lineTo(1.14, -4.9); g.stroke(); g.beginPath(); g.moveTo(2.1, -3.8); g.lineTo(2.08, -4.9); g.stroke() }
      g.restore() };
    capas(t, sil, .5, .74, 5);
    t.save(); t.lineCap = "round";
    for (let k = 0; k < 7; k++) { const x0 = (k - 3) * .38 + (r() - .5) * .2, c1 = (r() - .5) * .4; t.strokeStyle = G_(.5); t.lineWidth = .09; t.beginPath(); t.moveTo(x0 * .7, -5 + kn); t.quadraticCurveTo(x0 * 1.1 + c1, -2.5 + kn * .5, x0 * 1.45, -.15); t.stroke(); t.strokeStyle = G_(.78); t.lineWidth = .05; t.beginPath(); t.moveTo(x0 * .7 + .12, -5 + kn); t.quadraticCurveTo(x0 * 1.1 + c1 + .1, -2.5 + kn * .5, x0 * 1.45 + .14, -.15); t.stroke() }
    t.strokeStyle = G_(.36); t.lineWidth = .1; for (const s2 of [-1, 1]) { t.beginPath(); t.arc(hx + s2 * .28, hy - .1, .16, .2, Math.PI - .2); t.stroke(); t.beginPath(); t.moveTo(hx + s2 * .1, hy - .32); t.lineTo(hx + s2 * .46, hy - .4 + (tipo === 3 ? .1 : 0)); t.stroke() }
    if (tipo === 3) { t.fillStyle = G_(.2); t.beginPath(); t.ellipse(hx, hy + .45, .2, .3, 0, 0, TAU); t.fill() } else { t.beginPath(); t.moveTo(hx - .18, hy + .45); t.lineTo(hx + .18, hy + .45); t.stroke() }
    t.strokeStyle = G_(.8); t.lineWidth = .06; for (let k = 0; k < 8; k++) { const a = Math.PI + k / 7 * Math.PI; t.beginPath(); t.arc(hx, hy, .8, a, a + .25); t.stroke() }
    t.strokeStyle = G_(.5); t.lineWidth = .05; for (const s2 of [-1, 1]) for (let k = 0; k < 3; k++) { t.beginPath(); t.moveTo(hx + s2 * (.72 + k * .1), hy - .3); t.lineTo(hx + s2 * (.74 + k * .1), hy + .3); t.stroke() }
    t.restore() };
  // rostro grande de medallón (radio ≈ 16 m): ojos apretados, boca abierta en un grito mudo, manos tapando las orejas, lágrimas, cuentas en el borde
  const rostro = (t, r, grita = true) => {
    t.fillStyle = G_(.39); t.beginPath(); t.arc(0, 0, 16.2, 0, TAU); t.fill();
    capas(t, (g) => { g.lineWidth = 1.5; g.beginPath(); g.arc(0, 0, 15.3, 0, TAU); g.stroke() }, .5, .72, 4);
    for (let k = 0; k < 40; k++) { const a = k / 40 * TAU; capas(t, (g) => { g.beginPath(); g.ellipse(Math.cos(a) * 13.7, Math.sin(a) * 13.7, .75, .42, a + Math.PI / 2, 0, TAU); g.fill() }, .46, .7, 2) }
    capas(t, (g) => { g.beginPath(); g.ellipse(0, .6, 6.4, 8.2, 0, 0, TAU); g.fill() }, .5, .66, 8);
    capas(t, (g) => { g.beginPath(); g.ellipse(0, -2.2, 5.6, 4.6, 0, Math.PI, TAU); g.fill() }, .55, .7, 4);
    t.save(); t.lineCap = "round";
    for (let k = 0; k < 22; k++) { const a = Math.PI * 1.05 + k / 21 * Math.PI * .9; t.strokeStyle = G_(.76); t.lineWidth = .3; t.beginPath(); t.moveTo(Math.cos(a) * 5.4, -1 + Math.sin(a) * 7.2); t.quadraticCurveTo(Math.cos(a) * 7.4, -1 + Math.sin(a) * 8.6, Math.cos(a + .1) * 7.8, -1 + Math.sin(a + .1) * 9.4); t.stroke() }
    for (const s of [-1, 1]) { capas(t, (g) => { g.lineWidth = .55; g.beginPath(); g.moveTo(s * .6, -2.6); g.quadraticCurveTo(s * 2.4, -3.8, s * 3.9, -2.9); g.stroke() }, .62, .8, 2);
      t.strokeStyle = G_(.24); t.lineWidth = .32; t.beginPath(); t.arc(s * 2.3, -1.2, 1.05, .25, Math.PI - .25); t.stroke();
      t.strokeStyle = G_(.42); t.lineWidth = .14; for (let q = 0; q < 3; q++) { t.beginPath(); t.moveTo(s * 3.4, -1.5 + q * .5); t.lineTo(s * 4.3, -1.8 + q * .7); t.stroke() }
      t.strokeStyle = G_(.32); t.lineWidth = .18; t.beginPath(); t.moveTo(s * 2.2, -.2); t.quadraticCurveTo(s * 2.5, 2.2, s * 2.1 + (r() - .5), 4.6 + r() * 1.5); t.stroke();
      capas(t, (g) => { g.beginPath(); g.ellipse(s * 7.1, -.3, 1.8, 2.8, s * .15, 0, TAU); g.fill() }, .55, .78, 4);
      t.strokeStyle = G_(.45); t.lineWidth = .16; for (let q = 0; q < 4; q++) { t.beginPath(); t.moveTo(s * (6.1 + q * .5), -2.6); t.lineTo(s * (6.2 + q * .55), .9); t.stroke() } }
    capas(t, (g) => { g.lineWidth = .8; g.beginPath(); g.moveTo(0, -1.8); g.lineTo(-.4, 1.9); g.lineTo(.5, 2.2); g.stroke() }, .62, .82, 2);
    if (grita) { capas(t, (g) => { g.lineWidth = .7; g.beginPath(); g.ellipse(0, 4.7, 1.7, 2.3, 0, 0, TAU); g.stroke() }, .58, .76, 2); t.fillStyle = G_(.12); t.beginPath(); t.ellipse(0, 4.7, 1.3, 1.95, 0, 0, TAU); t.fill() }
    else { t.strokeStyle = G_(.25); t.lineWidth = .35; t.beginPath(); t.moveTo(-1.6, 4.6); t.quadraticCurveTo(0, 4.1, 1.6, 4.6); t.stroke() }
    t.restore() };
  // la oreja tachada (emblema fundido entre los medallones)
  const orejaTachada = (t) => { capas(t, (g) => { g.lineWidth = .9; g.beginPath(); g.arc(0, 0, 5.6, 0, TAU); g.stroke() }, .52, .74, 3);
    capas(t, (g) => { g.lineWidth = 1.1; g.lineCap = "round"; g.beginPath(); g.moveTo(1.4, 3.2); g.bezierCurveTo(-2.8, 3.6, -2.6, -3.6, .2, -3.4); g.bezierCurveTo(2.6, -3.2, 2.4, -.4, .6, .4); g.bezierCurveTo(-.4, .8, .2, 1.8, -.6, 2); g.stroke() }, .52, .78, 3);
    capas(t, (g) => { g.lineWidth = .95; g.lineCap = "round"; g.beginPath(); g.moveTo(-4, 4); g.lineTo(4, -4); g.stroke() }, .55, .82, 2) };
  // máscara chica (fila del hombro)
  const mascara = (t, r) => { capas(t, (g) => { g.beginPath(); g.ellipse(0, 0, 1.9, 2.5, 0, 0, TAU); g.fill() }, .5, .7, 4);
    for (const s of [-1, 1]) { capas(t, (g) => { g.beginPath(); g.ellipse(s * 2.2, 0, .55, .9, 0, 0, TAU); g.fill() }, .52, .74, 2); t.strokeStyle = G_(.28); t.lineWidth = .16; t.beginPath(); t.arc(s * .7, -.4, .38, .3, Math.PI - .3); t.stroke() }
    t.fillStyle = G_(.15); t.beginPath(); t.ellipse(0, 1.1, .45 + r() * .2, .55 + r() * .3, 0, 0, TAU); t.fill() };

  const T_EXT = (() => { const W = 4096, Hh = 4096, REP = 2, r = rng(9101);
    const cH = mk(W, Hh), gH = cH.getContext("2d", { willReadFrequently: true }), cM = mk(W, Hh), gM = cM.getContext("2d", { willReadFrequently: true });
    gH.fillStyle = G_(.42); gH.fillRect(0, 0, W, Hh); gM.fillStyle = "#000"; gM.fillRect(0, 0, W, Hh); gM.globalCompositeOperation = "lighter";
    const Y = h => (1 - vDe(PE, I_FLANCO, h)) * Hh, ky = Hh / ARC_E, kx = h => W * REP / (TAU * rOut(h));
    const GOT = [];                                                    // de dónde chorrea el verdín: [x, y, ancho]
    for (let k = 0; k < 500; k++) { const x = r() * W, y = r() * Hh, R0 = 30 + r() * 260, gr = gH.createRadialGradient(x, y, 0, x, y, R0), v = (r() < .5 ? .4 : .445) * 255 | 0; gr.addColorStop(0, `rgba(${v},${v},${v},.35)`); gr.addColorStop(1, `rgba(${v},${v},${v},0)`); gH.fillStyle = gr; gH.fillRect(x - R0, y - R0, R0 * 2, R0 * 2) }
    for (let k = 0; k < 45000; k++) { gH.fillStyle = G_(.3 + r() * .08); gH.beginPath(); gH.arc(r() * W, r() * Hh, .6 + r() * 1.8, 0, TAU); gH.fill() }
    // molduras (anillos en relieve)
    const moldura = (h, alto, amp = .3) => { const y0 = Y(h + alto / 2), y1 = Y(h - alto / 2), gr = gH.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, G_(.42)); gr.addColorStop(.3, G_(.42 + amp)); gr.addColorStop(.55, G_(.42 + amp * .85)); gr.addColorStop(1, G_(.4)); gH.fillStyle = gr; gH.fillRect(0, y0, W, y1 - y0);
      for (let x = r() * 30; x < W; x += 14 + r() * 50) GOT.push([x, y1, 3 + r() * 9]) };
    [[2.2, .7, .32], [3.9, .6, .3], [7.3, .9, .34], [22.6, .9, .34], [24.3, .7, .28], [25.7, .6, .24], [35.2, .8, .32], [36.7, .6, .26], [88.5, .9, .32], [90, .6, .26], [101.6, .8, .3], [103.1, .6, .26], [112.2, .8, .3], [113.6, .6, .24], [120.4, .9, .3], [127, 1.1, .3], [131, .8, .28]].forEach(([h, a, p]) => moldura(h, a, p));
    // ARCADA del arco sonoro: nichos con gente tapándose los oídos (h 8,9 → 21,2)
    { const hb = 8.9, ht = 21.2, kxx = kx(15), N = 46, paso = W / N, alto = (ht - hb) * ky, yb = Y(hb);
      for (let i = 0; i < N; i++) { const x0 = i * paso, tipo = [0, 1, 0, 3, 2, 0, 4, 1, 3, 0][(i * 7 + (i >> 2)) % 10], rr = rng(9200 + i);
        sello(gH, x0, yb - alto, paso, alto, (t, w, h) => { t.translate(w / 2, h); t.scale(kxx, ky);
          const nw = paso / kxx * .74, nh = (ht - hb) - .9; t.fillStyle = G_(.33); t.beginPath(); t.moveTo(-nw / 2, -.25); t.lineTo(-nw / 2, -nh + nw / 2); t.arc(0, -nh + nw / 2, nw / 2, Math.PI, TAU); t.lineTo(nw / 2, -.25); t.closePath(); t.fill();
          t.strokeStyle = G_(.27); t.lineWidth = .18; t.stroke();
          t.save(); t.translate(0, -.35); figura(t, tipo, rr); t.restore();
          for (const s of [-1, 1]) { const cx = s * paso / kxx / 2; capas(t, (g) => { g.fillRect(cx - .38, -nh + .5, .76, nh - .5); g.fillRect(cx - .62, -nh - .1, 1.24, .7); g.fillRect(cx - .6, -.7, 1.2, .6) }, .5, .7, 2) } }, W);
        GOT.push([x0 + paso / 2, yb, 30], [x0 + paso * .3, yb, 12], [x0 + paso * .7, yb, 12]) } }
    // INSCRIPCIÓN fundida (letras antiguas)
    const inscripcion = (texto, hc, alto_m, semilla, fondo = .38) => { const rr = rng(semilla), y0 = Y(hc + alto_m * .72), y1 = Y(hc - alto_m * .72), hp = y1 - y0, kxx = kx(hc), fs = alto_m * ky;
      gH.fillStyle = G_(fondo); gH.fillRect(0, y0, W, hp);
      sello(gH, 0, y0, W, hp, (t, w, h) => { t.font = `bold ${fs.toFixed(0)}px "Times New Roman", Times, serif`; t.textBaseline = "middle"; t.textAlign = "center";
        const sx = kxx / ky, ch = [...texto], ws = ch.map(c => t.measureText(c).width * sx * 1.08), tot = ws.reduce((a, b) => a + b, 0), extra = (w - tot) / ch.length; let x = extra / 2;
        ch.forEach((c, i) => { const cx = x + ws[i] / 2; x += ws[i] + extra; if (c === " ") return;
          const rot = (rr() - .5) * .05, sc = .94 + rr() * .1, alto = .72 + rr() * .06;
          capas(t, (g) => { g.save(); g.translate(cx, h / 2); g.rotate(rot); g.scale(sx * sc, sc); g.fillText(c, 0, 0); g.restore() }, .5, alto, 3.5);
          GOT.push([cx, y1, 6 + rr() * 6]) }) }) };
    inscripcion("+ PLVG · YOVR · EARS + REMEMBER + NEMO · ME · AVDIAT + VOCO · OBLIVIONEM +", 30.5, 5.4, 9301);
    inscripcion("FVSA · SVM · ANNO · MDCCXII + QVI · ME · AVDIT · OBLIVISCITVR + SALLOW · FECIT", 107.3, 4.1, 9302);
    // MEDALLONES con rostros (cintura, h ≈ 66) y orejas tachadas entre medio
    { const hc = 66, kxx = kx(hc), N = 3;
      for (let i = 0; i < N; i++) { const xc = (i + .5) / N * W, rr = rng(9400 + i), wpx = 34 * kxx, hpx = 34 * ky;
        sello(gH, xc - wpx / 2, Y(hc) - hpx / 2, wpx, hpx, (t, w, h) => { t.translate(w / 2, h / 2); t.scale(kxx, ky); rostro(t, rr, i !== 1) }, W);
        for (let q = 0; q < 26; q++) GOT.push([xc + (rr() - .5) * 26 * kxx, Y(hc - 15 + rr() * 6), 8 + rr() * 26]);
        const xo = xc + W / N / 2, w2 = 13 * kxx, h2 = 13 * ky;
        sello(gH, xo - w2 / 2, Y(hc) - h2 / 2, w2, h2, (t, w, h) => { t.translate(w / 2, h / 2); t.scale(kxx, ky); orejaTachada(t) }, W);
        GOT.push([xo, Y(hc - 6), 20]);
        for (const dh of [-16, 16]) { const w3 = 5 * kxx, h3 = 5 * ky; sello(gH, xo - w3 / 2, Y(hc + dh) - h3 / 2, w3, h3, (t, w, h) => { t.translate(w / 2, h / 2); t.scale(kxx, ky); for (let k = 0; k < 8; k++) capas(t, (g) => { g.beginPath(); g.ellipse(Math.cos(k / 8 * TAU) * 1.3, Math.sin(k / 8 * TAU) * 1.3, 1, .45, k / 8 * TAU, 0, TAU); g.fill() }, .48, .7, 2); capas(t, (g) => { g.beginPath(); g.arc(0, 0, .8, 0, TAU); g.fill() }, .55, .78, 2) }, W) } } }
    // fila de máscaras con las manos en las orejas (h 91 → 99,5)
    { const hc = 95.3, kxx = kx(hc), N = 24;
      for (let i = 0; i < N; i++) { const xc = (i + .5) / N * W, rr = rng(9500 + i), wpx = 7.5 * kxx, hpx = 7 * ky;
        sello(gH, xc - wpx / 2, Y(hc) - hpx / 2, wpx, hpx, (t, w, h) => { t.translate(w / 2, h / 2); t.scale(kxx, ky); mascara(t, rr) }, W); GOT.push([xc, Y(hc - 3), 14]);
        const xs = xc + W / N / 2, w2 = 3 * kxx, h2 = 3 * ky; sello(gH, xs - w2 / 2, Y(hc) - h2 / 2, w2, h2, (t, w, h) => { t.translate(w / 2, h / 2); t.scale(kxx, ky); capas(t, (g) => { g.beginPath(); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU, q = k % 2 ? .5 : 1.3; g.lineTo(Math.cos(a) * q, Math.sin(a) * q) } g.closePath(); g.fill() }, .5, .74, 2) }, W) } }
    // hojas de acanto en el hombro (h 114 → 120) y nervios + remaches en la tapa
    { const hb = 114.3, kxx = kx(117), N = 70; for (let i = 0; i < N; i++) { const xc = (i + .5) / N * W, wpx = 4 * kxx, hpx = 6.4 * ky; sello(gH, xc - wpx / 2, Y(hb + 6.2), wpx, hpx, (t, w, h) => { t.translate(w / 2, h); t.scale(kxx, ky); capas(t, (g) => { g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(-1.9, -1.5, -1.2, -4.6, 0, -6); g.bezierCurveTo(1.2, -4.6, 1.9, -1.5, 0, 0); g.fill() }, .48, .7, 2); t.strokeStyle = G_(.4); t.lineWidth = .12; t.beginPath(); t.moveTo(0, -.2); t.lineTo(0, -5.4); t.stroke() }, W) } }
    { const y0 = Y(HB), y1 = Y(128); for (let i = 0; i < 64; i++) { const x = (i + .5) / 64 * W, gr = gH.createLinearGradient(x - 10, 0, x + 10, 0); gr.addColorStop(0, G_(.42)); gr.addColorStop(.5, G_(.66)); gr.addColorStop(1, G_(.42)); gH.fillStyle = gr; gH.fillRect(x - 10, y0, 20, y1 - y0) }
      for (const hh of [124, 129.5]) for (let i = 0; i < 160; i++) { const x = (i + .5) / 160 * W, y = Y(hh); gH.fillStyle = G_(.82); gH.beginPath(); gH.arc(x, y, 5, 0, TAU); gH.fill(); GOT.push([x, y + 5, 3]) } }
    // GRIETAS que suben del labio (algunas con parches de hierro remachados encima)
    for (let k = 0; k < 9; k++) { let x = r() * W, h = .8, ang = 0; const top = 26 + r() * 50, pts = [[x, Y(h)]];
      while (h < top) { h += .6 + r() * 1.6; ang += (r() - .5) * .9; ang = cl(ang, -1.1, 1.1); x += Math.sin(ang) * 12 * r(); pts.push([x, Y(h)]); if (r() < .12) { let bx = x, bh = h; gH.strokeStyle = G_(.12); gH.lineWidth = 2; gH.beginPath(); gH.moveTo(bx, Y(bh)); for (let q = 0; q < 5; q++) { bh += .5 + r(); bx += (r() - .5) * 18; gH.lineTo(bx, Y(bh)) } gH.stroke() } }
      for (const [lw, c] of [[7, .2], [3.5, .06]]) { gH.strokeStyle = G_(c); gH.lineWidth = lw; gH.beginPath(); pts.forEach(([px, py], i) => i ? gH.lineTo(px, py) : gH.moveTo(px, py)); gH.stroke() }
      gM.strokeStyle = "rgba(0,255,0,.55)"; gM.lineWidth = 10; gM.beginPath(); pts.forEach(([px, py], i) => i ? gM.lineTo(px, py) : gM.moveTo(px, py)); gM.stroke();
      gM.strokeStyle = "rgba(255,0,0,.35)"; gM.lineWidth = 22; gM.stroke();
      pts.forEach(([px, py], i) => { if (i % 3 === 0) GOT.push([px, py, 10]) });
      if (k % 2 === 0) { const [px, py] = pts[(pts.length * .45) | 0], pw = 4.2 * kx(30), ph = 7 * ky, rot = (r() - .5) * .2;
        sello(gH, px - pw, py - ph, pw * 2, ph * 2, (t, w, h) => { t.translate(w / 2, h / 2); t.rotate(rot); capas(t, (g) => g.fillRect(-pw / 2, -ph / 2, pw, ph), .52, .6, 2); for (let i = 0; i < 6; i++) for (const s of [-1, 1]) { t.fillStyle = G_(.84); t.beginPath(); t.arc(s * (pw / 2 - 8), -ph / 2 + 10 + i * (ph - 20) / 5, 5, 0, TAU); t.fill(); t.beginPath(); t.arc(-pw / 2 + 10 + i * (pw - 20) / 5, s * (ph / 2 - 8), 5, 0, TAU); t.fill() } }, W);
        gM.save(); gM.translate(px, py); gM.rotate(rot); gM.fillStyle = "rgba(0,0,255,1)"; gM.fillRect(-pw / 2, -ph / 2, pw, ph); gM.fillStyle = "rgba(0,90,0,1)"; gM.fillRect(-pw / 2, ph / 2 - 6, pw, 6); gM.restore();
        for (let q = 0; q < 6; q++) GOT.push([px - pw / 2 + r() * pw, py + ph / 2, 8]) } }
    // VERDÍN chorreado (R) desde todo lo que sobresale, y mugre de lluvia (G)
    GOT.forEach(([x, y, w]) => { if (r() < .25) return; const L = 30 + r() * r() * 900, a = .18 + r() * .5, x2 = x + (r() - .5) * 10, gr = gM.createLinearGradient(0, y, 0, y + L); gr.addColorStop(0, `rgba(255,0,0,${a})`); gr.addColorStop(.25, `rgba(255,0,0,${a * .7})`); gr.addColorStop(1, "rgba(255,0,0,0)");
      gM.strokeStyle = gr; gM.lineWidth = w * (.4 + r() * .8); gM.lineCap = "round"; gM.beginPath(); gM.moveTo(x, y); gM.quadraticCurveTo(x + (r() - .5) * 8, y + L * .5, x2, y + L); gM.stroke();
      if (r() < .3) { const gr2 = gM.createLinearGradient(0, y, 0, y + L * .7); gr2.addColorStop(0, `rgba(0,255,0,${a * .5})`); gr2.addColorStop(1, "rgba(0,255,0,0)"); gM.strokeStyle = gr2; gM.lineWidth = w * .5; gM.beginPath(); gM.moveTo(x + 3, y); gM.lineTo(x2 + 3, y + L * .7); gM.stroke() } });
    for (let k = 0; k < 220; k++) { const x = r() * W, y = Y(lerp(98, HB, r() ** .6)), R0 = 40 + r() * 240, gr = gM.createRadialGradient(x, y, 0, x, y, R0); gr.addColorStop(0, `rgba(255,0,0,${.12 + r() * .22})`); gr.addColorStop(1, "rgba(255,0,0,0)"); gM.fillStyle = gr; gM.fillRect(x - R0, y - R0, R0 * 2, R0 * 2) }
    for (let k = 0; k < 900; k++) { const x = r() * W, y = r() * Hh, L = 60 + r() * 500, gr = gM.createLinearGradient(0, y, 0, y + L); gr.addColorStop(0, `rgba(0,255,0,${.05 + r() * .14})`); gr.addColorStop(1, "rgba(0,255,0,0)"); gM.strokeStyle = gr; gM.lineWidth = 4 + r() * 30; gM.beginPath(); gM.moveTo(x, y); gM.lineTo(x + (r() - .5) * 12, y + L); gM.stroke() }
    { const y0 = Y(9), y1 = Hh, gr = gM.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, "rgba(0,255,0,0)"); gr.addColorStop(1, "rgba(0,255,0,.45)"); gM.fillStyle = gr; gM.fillRect(0, y0, W, y1 - y0) }   // el labio sucio de abajo
    return hornear(cH, cM, { seed: 9102, c: [[62, 44, 27], [96, 66, 38], [168, 98, 52], [222, 150, 92], [44, 104, 86], [124, 190, 162], [52, 46, 42], [118, 60, 30]], rb: .5, mb: .9, kp: 7, pul: 1, kv: 5, ver: 1 }) })();

  // por DENTRO: bronce oscuro con hollín, costuras de fundición, las letras y figuras al revés (relieves invertidos, hundidos)
  const T_INT = (() => { const W = 2048, Hh = 2048, REP = 2, r = rng(9601);
    const cH = mk(W, Hh), gH = cH.getContext("2d", { willReadFrequently: true }), cM = mk(W, Hh), gM = cM.getContext("2d", { willReadFrequently: true });
    gH.fillStyle = G_(.45); gH.fillRect(0, 0, W, Hh); gM.fillStyle = "#000"; gM.fillRect(0, 0, W, Hh); gM.globalCompositeOperation = "lighter";
    const Y = h => (1 - vDe(PI_, I_PARED, h)) * Hh, ky = Hh / ARC_I, kx = h => W * REP / (TAU * rIn(h));
    for (let k = 0; k < 300; k++) { const x = r() * W, y = r() * Hh, R0 = 20 + r() * 160, gr = gH.createRadialGradient(x, y, 0, x, y, R0), v = r() < .5 ? 100 : 130; gr.addColorStop(0, `rgba(${v},${v},${v},.3)`); gr.addColorStop(1, `rgba(${v},${v},${v},0)`); gH.fillStyle = gr; gH.fillRect(x - R0, y - R0, R0 * 2, R0 * 2) }
    for (let k = 0; k < 16000; k++) { gH.fillStyle = G_(.3 + r() * .1); gH.beginPath(); gH.arc(r() * W, r() * Hh, .5 + r() * 1.4, 0, TAU); gH.fill() }
    for (const h of [9, 23, 36, 52, 70, 88, 104, 118]) { const y = Y(h); gH.fillStyle = G_(.58); gH.fillRect(0, y - 2, W, 4); gH.fillStyle = G_(.36); gH.fillRect(0, y + 2, W, 2) }
    for (let i = 0; i < 6; i++) { const x = (i + .3) / 6 * W; gH.strokeStyle = G_(.6); gH.lineWidth = 3; gH.beginPath(); gH.moveTo(x, Y(8)); for (let h = 8; h < H_TECHO; h += 4) gH.lineTo(x + Math.sin(h * .3 + i) * 3, Y(h)); gH.stroke() }
    // letras al revés, hundidas
    { const hc = 30.5, alto = 5.4, y0 = Y(hc + alto * .72), y1 = Y(hc - alto * .72), kxx = kx(hc), fs = alto * ky, texto = "+ PLVG · YOVR · EARS + REMEMBER + NEMO · ME · AVDIAT + VOCO · OBLIVIONEM +";
      sello(gH, 0, y0, W, y1 - y0, (t, w, h) => { t.font = `bold ${fs.toFixed(0)}px "Times New Roman", Times, serif`; t.textBaseline = "middle"; t.textAlign = "center"; const sx = kxx / ky, ch = [...texto].reverse(), ws = ch.map(c => t.measureText(c).width * sx * 1.08), tot = ws.reduce((a, b) => a + b, 0), extra = (w - tot) / ch.length; let x = extra / 2;
        ch.forEach((c, i) => { const cx = x + ws[i] / 2; x += ws[i] + extra; if (c === " ") return; for (const [b, v] of [[3, .4], [1.4, .32], [.5, .26]]) { t.save(); t.filter = `blur(${b}px)`; t.fillStyle = G_(v); t.translate(cx, h / 2); t.scale(-sx, 1); t.fillText(c, 0, 0); t.restore() } }) }) }
    // siluetas hundidas de la arcada (las figuras al revés)
    { const hb = 9.6, ht = 20.6, kxx = kx(15), N = 46, paso = W / N; for (let i = 0; i < N; i++) { sello(gH, i * paso, Y(ht), paso, (ht - hb) * ky, (t, w, h) => { t.translate(w / 2, h); t.scale(-kxx, ky); t.globalAlpha = .55; t.filter = "blur(2px)"; t.fillStyle = t.strokeStyle = G_(.33); t.beginPath(); t.ellipse(0, -9, .8, .95, 0, 0, TAU); t.fill(); t.beginPath(); t.moveTo(-1.5, 0); t.lineTo(-1.1, -7.9); t.lineTo(1.1, -7.9); t.lineTo(1.5, 0); t.fill(); t.lineWidth = .6; for (const s of [-1, 1]) { t.beginPath(); t.moveTo(s, -7.7); t.lineTo(s * 1.9, -8.3); t.lineTo(s * .9, -9); t.stroke() } }, W) } }
    // hollín de abajo, chorreaduras de humedad y un poco de verdín
    { const gr = gM.createLinearGradient(0, Y(40), 0, Hh); gr.addColorStop(0, "rgba(0,255,0,0)"); gr.addColorStop(1, "rgba(0,255,0,.6)"); gM.fillStyle = gr; gM.fillRect(0, Y(40), W, Hh - Y(40)) }
    for (let k = 0; k < 700; k++) { const x = r() * W, y = r() * Hh, L = 40 + r() * 400, gr = gM.createLinearGradient(0, y, 0, y + L), a = .08 + r() * .3; gr.addColorStop(0, r() < .3 ? `rgba(255,0,0,${a})` : `rgba(0,255,0,${a})`); gr.addColorStop(1, "rgba(0,0,0,0)"); gM.strokeStyle = gr; gM.lineWidth = 2 + r() * 12; gM.beginPath(); gM.moveTo(x, y); gM.lineTo(x + (r() - .5) * 6, y + L); gM.stroke() }
    return hornear(cH, cM, { seed: 9602, c: [[38, 28, 19], [60, 43, 27], [120, 74, 42], [160, 104, 62], [36, 66, 54], [70, 112, 92], [44, 40, 36], [90, 50, 26]], rb: .58, mb: .75, kp: 5, pul: .5, kv: 3, ver: .45 }) })();

  // ======================= MATERIALES =======================
  const U = { uT: { value: 0 }, uRim: { value: new THREE.Color(0, 0, 0) }, uBrillo: { value: 0 }, uSolW: { value: new THREE.Vector3(0, 1, 0) }, uPat: { value: .55 },
    uOndaH: { value: -100 }, uOndaA: { value: 0 }, uBajo: { value: new THREE.Color(0, 0, 0) } };
  const GLSL_COMUN = `
varying vec3 vCbW;
uniform float uT, uBrillo, uPat, uOndaH, uOndaA; uniform vec3 uRim, uSolW, uBajo;
float cbH(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float cbN(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(cbH(i), cbH(i + vec2(1., 0.)), f.x), mix(cbH(i + vec2(0., 1.)), cbH(i + vec2(1., 1.)), f.x), f.y); }
float cbJag(float a){ return 1. + .16 * sin(3. * a + 1.3) + .1 * sin(7. * a + .4) + .06 * sin(13. * a + 2.1); }
bool cbHueco(vec3 w){ vec2 d = w.xz - vec2(${CX.toFixed(2)}, ${CZ.toFixed(2)}); float h = w.y - ${Y0.toFixed(2)};
  if (h > 120. && length(w.xz - vec2(${HUECO[0].toFixed(2)}, ${HUECO[1].toFixed(2)})) < ${R_HUECO.toFixed(2)}) return true;
  float rr = length(d); if (rr < 78. || h > 18.) return false;
  float a = atan(d.y, d.x) - ${A_ENT.toFixed(5)}; a -= 6.2831853 * floor((a + 3.1415927) / 6.2831853);
  vec2 q = vec2(a * rr / ${GRIETA.hw.toFixed(2)}, (h - ${GRIETA.hc.toFixed(2)}) / ${GRIETA.hh.toFixed(2)}); return length(q) < cbJag(atan(q.y, q.x)); }`;
  const parche = (mat, o) => { mat.onBeforeCompile = sh => { Object.assign(sh.uniforms, U); const VT = o.desplaza ? "#include <displacementmap_vertex>" : "#include <begin_vertex>";
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vCbW;").replace(VT, VT + "\n  vCbW = (modelMatrix * vec4(transformed, 1.)).xyz;");
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\n" + GLSL_COMUN + "\nfloat gCbPat = 0.;").replace("#include <clipping_planes_fragment>", "#include <clipping_planes_fragment>\n  if (cbHueco(vCbW)) discard;");
      if (o.patina) sh.fragmentShader = sh.fragmentShader.replace("#include <map_fragment>", `#include <map_fragment>
  { float n = cbN(vec2(vCbW.x / 16. + vCbW.y / 41., vCbW.z / 16. - vCbW.y / 33.)) * .65 + cbN(vec2(vCbW.x / 5.3 - vCbW.y / 9., vCbW.z / 5.3 + vCbW.y / 13.)) * .35;
    float hh = vCbW.y - ${Y0.toFixed(1)}; gCbPat = smoothstep(.56, .8, n + .14 * smoothstep(90., 134., hh)) * uPat;
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.1, .3, .24) * (.75 + .5 * n), gCbPat * .8); }`)
        .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\n  roughnessFactor = mix(roughnessFactor, .88, gCbPat);").replace("#include <metalnessmap_fragment>", "#include <metalnessmap_fragment>\n  metalnessFactor = mix(metalnessFactor, .06, gCbPat);");
      sh.fragmentShader = sh.fragmentShader.replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
  { vec3 nW = normalize((vec4(normal, 0.) * viewMatrix).xyz), vV = normalize(cameraPosition - vCbW); float hh = vCbW.y - ${Y0.toFixed(1)};
    float fr = pow(1. - max(dot(nW, vV), 0.), 3.), ls = max(dot(nW, uSolW), 0.);
    totalEmissiveRadiance += uRim * fr * (.3 + .7 * ls) * ${o.onda ? "0." : "1."};
    totalEmissiveRadiance += diffuseColor.rgb * uBrillo * pow(ls, 1.6) * (1. - gCbPat);
    totalEmissiveRadiance += uBajo * diffuseColor.rgb * (.3 + .7 * (1. - smoothstep(0., 70., hh))) * 2.5;
    totalEmissiveRadiance += vec3(1., .6, .28) * uOndaA * exp(-pow((hh - uOndaH) / 5., 2.)) * ${o.onda ? "1." : "0."}; }`) };
    mat.customProgramCacheKey = () => "cb" + o.k; return mat };
  const M_BRONCE = parche(new THREE.MeshStandardMaterial({ map: T_EXT.c, bumpMap: T_EXT.d, bumpScale: 2.2, roughnessMap: T_EXT.d, metalnessMap: T_EXT.d, displacementMap: T_EXT.d, displacementScale: 1.9, displacementBias: -.42 * 1.9, roughness: 1, metalness: 1, envMapIntensity: 1 }), { k: "ext", desplaza: true, patina: true });
  const M_BRONCE_IN = parche(new THREE.MeshStandardMaterial({ map: T_INT.c, bumpMap: T_INT.d, bumpScale: 2.6, roughnessMap: T_INT.d, metalnessMap: T_INT.d, roughness: 1, metalness: 1, envMapIntensity: .5 }), { k: "int", onda: true });
  const T_LISO = T_EXT.c.clone(); T_LISO.repeat.set(3, 3); T_LISO.wrapT = THREE.RepeatWrapping; T_LISO.needsUpdate = true;
  const M_BRONCE_L = new THREE.MeshStandardMaterial({ map: T_LISO, color: "#d0c4b0", roughness: .45, metalness: .85, envMapIntensity: 1 });
  // hierro oxidado (cadenas, gancho, anclas)
  const T_OX = (() => { const [c, z] = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(9801); c.fillStyle = "#33281f"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
      for (let k = 0; k < 2600; k++) { const x = r() * w, y = r() * h, R0 = 1 + r() * 12, t = r(); c.fillStyle = t < .4 ? `rgba(${92 + r() * 40 | 0},${46 + r() * 18 | 0},${24 + r() * 10 | 0},${.2 + r() * .4})` : t < .75 ? `rgba(28,24,22,${.25 + r() * .5})` : `rgba(${112 + r() * 30 | 0},${72 + r() * 18 | 0},44,${.12 + r() * .25})`;
        c.beginPath(); c.ellipse(x, y, R0, R0 * (.4 + r() * .6), r() * 3, 0, TAU); c.fill(); z.fillStyle = G_(r() < .5 ? .3 + r() * .2 : .6 + r() * .4); z.beginPath(); z.ellipse(x, y, R0 * .8, R0 * .5, 0, 0, TAU); z.fill() }
      for (let k = 0; k < 300; k++) { const x = r() * w, y = r() * h; c.strokeStyle = `rgba(110,56,26,${.15 + r() * .25})`; c.lineWidth = 1 + r() * 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - .5) * 20, y + 10 + r() * 40); c.stroke() } });
    [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
  const M_HIERRO = new THREE.MeshStandardMaterial({ map: T_OX.c, bumpMap: T_OX.z, bumpScale: 3, roughness: .8, metalness: .55, envMapIntensity: .5 });
  const M_HIERRO_N = new THREE.MeshStandardMaterial({ color: "#5a504a", map: T_OX.c, bumpMap: T_OX.z, bumpScale: 2, roughness: .6, metalness: .75, envMapIntensity: .6 });
  const M_BRONCE_ROTO = new THREE.MeshStandardMaterial({ color: "#5a3c22", roughness: .6, metalness: .8, bumpMap: T_OX.z, bumpScale: 5, envMapIntensity: .35, side: THREE.DoubleSide });
  // eslabones: musgo arriba (según la normal del mundo); los de la cadena del este con las PISADAS pulidas (gastadas, brillantes)
  const matCadena = gastada => { const m = new THREE.MeshStandardMaterial({ map: T_OX.c, bumpMap: T_OX.z, bumpScale: 3.5, roughness: .82, metalness: .55, envMapIntensity: .55 });
    m.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vCbW; varying vec3 vCbN;").replace("#include <begin_vertex>", `#include <begin_vertex>
  #ifdef USE_INSTANCING
  vCbW = (modelMatrix * instanceMatrix * vec4(transformed, 1.)).xyz; vCbN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * objectNormal);
  #else
  vCbW = (modelMatrix * vec4(transformed, 1.)).xyz; vCbN = normalize(mat3(modelMatrix) * objectNormal);
  #endif`);
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", `#include <common>
varying vec3 vCbW; varying vec3 vCbN; float gM = 0., gP = 0.;
float cbH(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float cbN(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(cbH(i), cbH(i + vec2(1., 0.)), f.x), mix(cbH(i + vec2(0., 1.)), cbH(i + vec2(1., 1.)), f.x), f.y); }`).replace("#include <map_fragment>", `#include <map_fragment>
  { float n = cbN(vCbW.xz * .55 + vCbW.y * .37) * .6 + cbN(vCbW.xz * 2.1 - vCbW.y * 1.3) * .4; float up = vCbN.y;
    gM = smoothstep(.15, .7, up) * smoothstep(.38, .62, n) + smoothstep(-.2, -.6, up) * smoothstep(.6, .8, n) * .5;
    ${gastada ? `gP = smoothstep(.45, .85, up) * (1. - smoothstep(.62, .8, cbN(vCbW.xz * 1.7 + vCbW.y * .9))); gM *= 1. - smoothstep(0., .3, gP) * .9;
    float hu = smoothstep(.35, .5, cbN(vec2(vCbW.x * 3. + vCbW.y * 2.2, vCbW.z * 6.))) * gP;
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.78, .74, .68) * (.85 + .3 * hu), gP);` : ""}
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.13, .21, .06) * (.6 + .8 * n), gM * .92); }`)
        .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\n  roughnessFactor = mix(mix(roughnessFactor, 1., gM), .14, gP);").replace("#include <metalnessmap_fragment>", "#include <metalnessmap_fragment>\n  metalnessFactor = mix(mix(metalnessFactor, 0., gM), 1., gP);") };
    m.customProgramCacheKey = () => "cad" + gastada; return m };
  const M_CAD = matCadena(false), M_CAD_E = matCadena(true);
  const M_MADERA = (() => { const [c, z] = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(9811); c.fillStyle = "#5a4430"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
      for (let k = 0; k < 400; k++) { const y = r() * h; c.strokeStyle = r() < .5 ? `rgba(30,20,12,${.15 + r() * .3})` : `rgba(150,120,90,${.1 + r() * .2})`; c.lineWidth = .5 + r() * 2.5; c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= w; x += 32) c.lineTo(x, y + Math.sin(x * .02 + k) * 3); c.stroke(); z.strokeStyle = G_(.3 + r() * .5); z.lineWidth = 1 + r() * 2; z.beginPath(); z.moveTo(0, y); z.lineTo(w, y); z.stroke() }
      for (let k = 0; k < 14; k++) { const x = r() * w, y = r() * h; for (let a = 0; a < 5; a++) { c.strokeStyle = `rgba(30,18,10,${.5 - a * .08})`; c.lineWidth = 1.5; c.beginPath(); c.ellipse(x, y, 6 + a * 5, 3 + a * 2, 0, 0, TAU); c.stroke() } }
      for (let k = 0; k < 60; k++) { c.fillStyle = `rgba(220,190,120,${.2 + r() * .35})`; c.beginPath(); c.ellipse(r() * w, r() * h, 2 + r() * 9, 2 + r() * 6, r() * 3, 0, TAU); c.fill() } });   // gotas de cera vieja
    [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return new THREE.MeshStandardMaterial({ map: c, bumpMap: z, bumpScale: 2, roughness: .88 }) })();
  const M_CERA_V = new THREE.MeshStandardMaterial({ color: "#b89a5a", roughness: .42, metalness: 0, emissive: "#2a1a08", emissiveIntensity: .2 });   // cera vieja (carámbanos, velas)

  // ======================= EL CUERPO =======================
  const EXT = new THREE.Mesh(torno(PE, 1024, 2, false), M_BRONCE); EXT.name = "CAMPANA_EXT"; G.add(EXT);
  const INT = new THREE.Mesh(torno(PI_, 512, 2, true), M_BRONCE_IN); INT.name = "CAMPANA_INT"; G.add(INT);
  [EXT, INT].forEach(m => { m.castShadow = false; m.receiveShadow = false; m.frustumCulled = false });
  // el borde del agujero de la luna (un caño corto entre la tapa de afuera y el techo de adentro)
  { const g = new THREE.CylinderGeometry(R_HUECO, R_HUECO, 6, 32, 1, true); g.translate(HUECO[0], Y0 + H_TECHO + 1.6, HUECO[1]); G.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: "#3a2a1a", roughness: .7, metalness: .6, side: THREE.DoubleSide }))) }
  // las paredes de la GRIETA (de la cara de afuera a la de adentro, bordes rotos brillantes)
  { const NQ = 96, pos = [], idx = [];
    for (let k = 0; k <= NQ; k++) { const th = k / NQ * TAU, q = jag(th), dh = Math.sin(th) * GRIETA.hh * q, h = GRIETA.hc + dh, ro = rOut(h) + .9, ri = rIn(h) - .3, s = Math.cos(th) * GRIETA.hw * q;
      for (const rr of [ro, ri]) { const a = A_ENT + s / rr; pos.push(CX + rr * Math.cos(a), Y0 + h, CZ + rr * Math.sin(a)) }
      if (k) { const a = (k - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2) } }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    const uv = new Float32Array(pos.length / 3 * 2); for (let i = 0; i < uv.length / 2; i++) { uv[i * 2] = (i >> 1) / NQ * 4; uv[i * 2 + 1] = i & 1 } g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    G.add(new THREE.Mesh(g, M_BRONCE_ROTO)) }

  // ======================= LA CORONA: base fundida, dos argollas cruzadas y el grillete donde se enganchan las cuatro cadenas =======================
  const CORONA_G = new THREE.Group(); G.add(CORONA_G);
  { const L = lote(), yT = Y0 + HB;
    L.add(M_BRONCE_L, new THREE.CylinderGeometry(9.5, 12, 3.2, 64), TMx(CX, yT + 1.2, CZ)); L.add(M_BRONCE_L, new THREE.TorusGeometry(10.8, .7, 10, 64), TMx(CX, yT + .6, CZ, Math.PI / 2)); L.add(M_BRONCE_L, new THREE.TorusGeometry(9.3, .55, 10, 64), TMx(CX, yT + 2.8, CZ, Math.PI / 2));
    for (const a of [Math.PI / 4, -Math.PI / 4]) { L.add(M_BRONCE_L, new THREE.TorusGeometry(7.6, 2.1, 20, 64), TMx(CX, yT + 9.2, CZ, 0, a)); for (const s of [-1, 1]) L.add(M_BRONCE_L, new THREE.CylinderGeometry(2.6, 3.4, 3, 24), TMx(CX + s * 7.6 * Math.cos(a), yT + 3.5, CZ - s * 7.6 * Math.sin(a))) }
    L.add(M_HIERRO_N, new THREE.IcosahedronGeometry(3.4, 2), TMx(CX, CORONA[1] - .5, CZ, 0, 0, 0, 1, .8, 1)); L.add(M_HIERRO_N, new THREE.CylinderGeometry(.9, .9, 10, 16), TMx(CX, CORONA[1] - .5, CZ, 0, 0, Math.PI / 2));
    for (let k = 0; k < 24; k++) { const a = k / 24 * TAU; L.add(M_HIERRO_N, new THREE.CylinderGeometry(.42, .42, .5, 8), TMx(CX + Math.cos(a) * 10.6, yT + 2.85, CZ + Math.sin(a) * 10.6)) }
    L.fin(CORONA_G) }

  // ======================= LAS CUATRO CADENAS =======================
  // cada cadena es una polilínea de abajo (u = 0: la montaña / el risco) a arriba (u = 1: el grillete de la corona)
  const CAD = {};
  const hacerPoli = pts => { const P = pts.map(p => new THREE.Vector3(p[0], p[1], p[2])), L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + P[i].distanceTo(P[i - 1])); return { P, L, tot: L[L.length - 1] } };
  const enPoli = (C, s) => { s = cl(s, 0, C.tot); let i = 1; while (i < C.L.length - 1 && C.L[i] < s) i++; const a = C.P[i - 1], b = C.P[i], k = (s - C.L[i - 1]) / Math.max(1e-6, C.L[i] - C.L[i - 1]); return a.clone().lerp(b, cl(k)) };
  const tanPoli = (C, s) => { const a = enPoli(C, s - 1.5), b = enPoli(C, s + 1.5); return b.sub(a).normalize() };
  const SAG = 18;
  ["norte", "sur", "oeste"].forEach(n => { const M = MONTES[n], dx = M[0] - CX, dz = M[2] - CZ, dl = Math.hypot(dx, dz), top = [CX + dx / dl * 3.5, CORONA[1], CZ + dz / dl * 3.5], bot = [M[0] - dx / dl * 3, M[1] + 4, M[2] - dz / dl * 3], pts = [];
    for (let i = 0; i <= 240; i++) { const s = i / 240; pts.push([lerp(top[0], bot[0], s), lerp(top[1], bot[1], s) - 4 * SAG * s * (1 - s), lerp(top[2], bot[2], s)]) }
    CAD[n] = hacerPoli(pts.reverse()) });
  { // la del ESTE: del risco sube en curva hasta el labio, se apoya en el flanco (cuerda tensa por fuera de la cintura) y sobre el hombro hasta el grillete
    const e = [Math.cos(A_CAD_E), Math.sin(A_CAD_E)], W_ = (r, y) => [CX + e[0] * r, y, CZ + e[1] * r];
    const rA = Math.hypot(RISCO_E[0] - CX, RISCO_E[1] - CZ), yA = ALT_B(RISCO_E[0], RISCO_E[1]) + 4.2;
    const pts = [[rA, yA], [rA - 1.2, yA + 14], [rA - 3.2, yA + 38], [rA - 6.4, yA + 64], [rA - 11.6, yA + 88], [rOut(3.2) + 3.6, Y0 + 3.4]];
    const hS = 112, pS = PE.slice(I_FLANCO).find(p => p.h >= hS), cuer = [pS.r + pS.nr * 3.6, Y0 + pS.h + pS.nh * 3.6];
    for (let k = 1; k <= 6; k++) pts.push([lerp(rOut(3.2) + 3.6, cuer[0], k / 6), lerp(Y0 + 3.4, cuer[1], k / 6)]);
    PE.slice(I_FLANCO).filter(p => p.h > hS + 2 && p.r > 12).forEach((p, i) => { if (i % 4 === 0) pts.push([p.r + p.nr * 3.6, Y0 + p.h + p.nh * 3.6]) });
    pts.push([6, Y0 + HB + 6.5], [3.5, CORONA[1]]);
    const cu = new THREE.CatmullRomCurve3(pts.map(([r, y]) => new THREE.Vector3(...W_(r, y))), false, "centripetal");
    CAD.este = hacerPoli(cu.getSpacedPoints(600).map(v => [v.x, v.y, v.z])) }
  const U_LABIO_E = (() => { const C = CAD.este; for (let i = 0; i < C.P.length; i++) if (C.P[i].y >= Y0 + 3.4) return C.L[i] / C.tot; return .37 })();
  // cuánto le sobra a cada cadena lejana por encima del hombro (debug)
  const CLARO = {}; ["norte", "sur", "oeste"].forEach(n => { let mn = 1e9; CAD[n].P.forEach(p => { const d = Math.hypot(p.x - CX, p.z - CZ); if (d > 12 && d < 64) mn = Math.min(mn, p.y - (Y0 + hArriba(d))) }); CLARO[n] = +mn.toFixed(2) });
  // eslabón: estadio (dos rectas y dos medias vueltas) barrido con un círculo picado por el óxido. Largo total ≈ 10,6 m, ancho 5,8 m, barra de 0,95 m de radio.
  const ESL = { a: 2.4, b: 2.0, rb: .95, paso: 7.0 };
  const geoEslabon = (() => { const { a, b, rb } = ESL, NS = 64, NR = 14, Lp = 4 * a + TAU * b, pos = [], uv = [], idx = [], r = rng(9901);
    const cen = s => { s = ((s % Lp) + Lp) % Lp; if (s < 2 * a) return [b, -a + s, 1, 0]; s -= 2 * a; if (s < Math.PI * b) { const t = s / b; return [b * Math.cos(t), a + b * Math.sin(t), Math.cos(t), Math.sin(t)] } s -= Math.PI * b; if (s < 2 * a) return [-b, a - s, -1, 0]; s -= 2 * a; const t = Math.PI + s / b; return [b * Math.cos(t), -a + b * Math.sin(t), Math.cos(t), Math.sin(t)] };
    const pit = Array.from({ length: NS * NR }, () => 1 - (r() < .25 ? r() * .12 : 0));
    for (let i = 0; i <= NS; i++) { const [cx, cy, nx, ny] = cen(i / NS * Lp); for (let j = 0; j <= NR; j++) { const t = j / NR * TAU, k = pit[(i % NS) * NR + (j % NR)] * (1 + .04 * Math.sin(i * .7 + j)), ct = Math.cos(t), st = Math.sin(t);
        pos.push(cx + nx * ct * rb * k, cy + ny * ct * rb * k, st * rb * k); uv.push(i / NS * 11, j / NR * 3) } }
    for (let i = 0; i < NS; i++) for (let j = 0; j < NR; j++) { const p = i * (NR + 1) + j, q = p + NR + 1; idx.push(p, q, p + 1, p + 1, q, q + 1) }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g })();
  const ESLABONES = {};
  const _up = new THREE.Vector3(0, 1, 0), _m4 = new THREE.Matrix4();
  const marco = (C, s) => { const p = enPoli(C, s), T = tanPoli(C, s); let S = new THREE.Vector3().crossVectors(T, _up); if (S.lengthSq() < 1e-4) S.set(1, 0, 0); S.normalize(); const N = new THREE.Vector3().crossVectors(S, T).normalize(); return { p, T, S, N } };
  Object.entries(CAD).forEach(([n, C]) => { const L = [], r = rng(9910 + n.length); for (let s = ESL.paso * .55, i = 0; s < C.tot - 2; s += ESL.paso, i++) L.push([s, i]);
    const im = new THREE.InstancedMesh(geoEslabon, n === "este" ? M_CAD_E : M_CAD, L.length); im.name = "CADENA_" + n;
    const datos = L.map(([s, i]) => { const { p, T, S, N } = marco(C, s), rol = (i % 2 ? Math.PI / 2 : 0) + (r() - .5) * .12; const X = S.clone().multiplyScalar(Math.cos(rol)).addScaledVector(N, Math.sin(rol)), Z = new THREE.Vector3().crossVectors(X, T);
      _m4.makeBasis(X, T, Z).setPosition(p); return { s, i, m: _m4.clone(), p, T, plano: i % 2 } });
    datos.forEach((d, i) => im.setMatrixAt(i, d.m)); im.computeBoundingSphere(); im.frustumCulled = false; G.add(im); ESLABONES[n] = datos });
  const cadenaMarco = (n, u) => { const C = CAD[n]; if (!C) return null; const f = marco(C, cl(u) * C.tot); return { p: f.p.toArray(), t: f.T.toArray(), lado: f.S.toArray(), n: f.N.toArray() } };
  const PRIMER = ESLABONES.este[0].p.toArray();

  // anclas: el ojo de hierro abulonado en el risco del este y en las tres cimas
  { const L = lote(); const ancla = (n, esc = 1) => { const C = CAD[n], p = C.P[0], T = tanPoli(C, 0), ry = Math.atan2(T.x, T.z), y0 = n === "este" ? ALT_B(RISCO_E[0], RISCO_E[1]) : p.y - 5, cr = Math.cos(ry), sr = Math.sin(ry);
      L.add(M_HIERRO, new THREE.BoxGeometry(9 * esc, 2.2, 9 * esc), TMx(p.x, y0 + .6, p.z, 0, ry)); L.add(M_HIERRO_N, new THREE.BoxGeometry(4.5, p.y - y0 + 2.5, 2.4), TMx(p.x, (p.y + y0) / 2, p.z, 0, ry));
      L.add(M_HIERRO_N, new THREE.TorusGeometry(2.6, 1.05, 12, 32), TMx(p.x, p.y + .4, p.z, 0, ry + Math.PI / 2));
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if (i % 3 === 0 || j % 3 === 0) { const lx = (i - 1.5) * 2.4 * esc, lz = (j - 1.5) * 2.4 * esc; L.add(M_HIERRO_N, new THREE.CylinderGeometry(.35, .45, .7, 8), TMx(p.x + lx * cr + lz * sr, y0 + 1.9, p.z - lx * sr + lz * cr)) }
      if (n === "este") rectAdd({ x: p.x, z: p.z, w: 9.5, d: 9.5, ry }) };
    ["este", "norte", "sur", "oeste"].forEach(n => ancla(n, n === "este" ? 1 : 1.6)); L.fin(G).forEach(m => { m.castShadow = m.receiveShadow = true }) }
  // la tabla (puente de Sallow) de la cadena a la grieta, con soga de baranda
  { const L = lote(), C = CAD.este, s0 = (() => { for (let i = 0; i < C.P.length; i++) if (C.P[i].y >= Y0 + 9.5) return C.L[i]; return 0 })(), pc = enPoli(C, s0), pg = new THREE.Vector3(...polar(rOut(8.2) + .4, 8.2, A_ENT));
    pc.y = Y0 + 8.2; const d = pg.clone().sub(pc), len = d.length(), mid = pc.clone().add(pg).multiplyScalar(.5), ry = Math.atan2(d.x, d.z);
    L.add(M_MADERA, new THREE.BoxGeometry(.9, .16, len + 1.2), TMx(mid.x, mid.y, mid.z, 0, ry)); for (let k = 0; k < 6; k++) L.add(M_MADERA, new THREE.BoxGeometry(1, .08, .14), TMx(lerp(pc.x, pg.x, k / 5), mid.y - .12, lerp(pc.z, pg.z, k / 5), 0, ry));
    const sog = new THREE.MeshStandardMaterial({ color: "#7a6448", roughness: .95 }); for (const s of [-1, 1]) { const ox = Math.cos(ry) * .5 * s, oz = -Math.sin(ry) * .5 * s; L.add(sog, new THREE.CylinderGeometry(.035, .035, len, 6), TMx(mid.x + ox, mid.y + 1.05, mid.z + oz, Math.PI / 2, ry)); for (const k of [0, 1]) L.add(M_MADERA, new THREE.BoxGeometry(.08, 1.1, .08), TMx(lerp(pc.x, pg.x, k) + ox, mid.y + .5, lerp(pc.z, pg.z, k) + oz)) }
    L.fin(G) }

  // ======================= EL INTERIOR =======================
  const IN = new THREE.Group(); IN.name = "CAMPANA_DENTRO"; G.add(IN);
  // costillas de fundición (32 meridianos) y anillos
  { const L = []; for (let k = 0; k < 32; k++) { const a = k / 32 * TAU, pts = []; for (let h = 9; h <= H_TECHO - 8; h += 3) pts.push(new THREE.Vector3(...polar(rIn(h) - .25, h, a))); L.push([new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, .55, 6, false), null]) }
    for (const h of [30, 60, 90, 115]) { const g = new THREE.TorusGeometry(rIn(h) - .3, .6, 6, 256); g.rotateX(Math.PI / 2); g.translate(CX, Y0 + h, CZ); L.push([g, null]) }
    IN.add(new THREE.Mesh(mergeGeo(L), new THREE.MeshStandardMaterial({ color: "#4a3420", map: T_LISO, roughness: .55, metalness: .8, envMapIntensity: .4 }))) }
  // el GANCHO del badajo: roto y vacío (no hay badajo)
  const GANCHO = (() => { const yT = Y0 + H_TECHO, L = lote();
    L.add(M_HIERRO_N, new THREE.CylinderGeometry(3.2, 4.2, 2.2, 24), TMx(CX, yT - 1, CZ)); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; L.add(M_HIERRO_N, new THREE.CylinderGeometry(.35, .35, .6, 8), TMx(CX + Math.cos(a) * 3.5, yT - 2.2, CZ + Math.sin(a) * 3.5)) }
    const pts = [[0, -1.5], [0, -5], [0, -7.5]]; for (let k = 0; k <= 10; k++) { const t = Math.PI + k / 10 * Math.PI * .78; pts.push([2.4 + Math.cos(t) * 2.4, -7.5 - Math.sin(t) * 2.4]) }
    const cu = new THREE.CatmullRomCurve3(pts.map(([x, y]) => new THREE.Vector3(CX + x, yT + y, CZ)));
    L.add(M_HIERRO_N, new THREE.TubeGeometry(cu, 50, .85, 12, false), null);
    // la punta partida (dentada) y un pedazo de la anilla del badajo, retorcido; un jirón de cuero
    const fin = cu.getPoint(1), ft = cu.getTangent(1), shard = new THREE.ConeGeometry(.95, 1.4, 7, 1); shard.translate(0, .5, 0);
    L.add(M_HIERRO_N, shard, new THREE.Matrix4().compose(fin, new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), ft), new THREE.Vector3(1, .6, 1.2)));
    L.add(M_HIERRO_N, new THREE.TorusGeometry(1.6, .45, 8, 20, Math.PI * 1.1), TMx(CX + 2.8, yT - 11.6, CZ + .5, .9, .4, 2.1));
    L.add(new THREE.MeshStandardMaterial({ color: "#3a2a1c", roughness: .9 }), new THREE.BoxGeometry(.5, 4.5, .12), TMx(CX - .4, yT - 9.6, CZ + .3, .1, .3, .15));
    L.fin(IN); return [CX + 2.4, yT - 9.9, CZ] })();
  // la PLATAFORMA de madera colgada cerca del labio (local: x = radial hacia la pared, z = a lo largo del borde)
  const PLAT = new THREE.Group(); PLAT.name = "PLATAFORMA"; IN.add(PLAT);
  const P_H = 7.0;
  { const p = polar(80.5, P_H, A_ENT); PLAT.position.set(p[0], p[1], p[2]); PLAT.rotation.y = -A_ENT }
  { const L = lote(), r = rng(9931), sog = new THREE.MeshStandardMaterial({ color: "#6a5640", roughness: .95 });
    for (let z = -4.8; z < 4.8; z += .3) { const x0 = -6.5 + r() * .25, x1 = 6.3 - r() * .2; L.add(M_MADERA, new THREE.BoxGeometry(x1 - x0, .1, .27), TMx((x0 + x1) / 2, .2 + (r() - .5) * .02, z + .15, (r() - .5) * .01, (r() - .5) * .02)) }
    for (const x of [-6, -3, 0, 3, 6]) L.add(M_MADERA, new THREE.BoxGeometry(.28, .32, 10), TMx(x, 0, 0));
    L.add(M_MADERA, new THREE.BoxGeometry(.4, .9, 10.4), TMx(4.6, -.55, 0));
    for (const z of [-4.9, 4.9]) L.add(M_MADERA, new THREE.BoxGeometry(13, .3, .3), TMx(-.1, 0, z));
    for (let z = -4.6; z <= 4.7; z += 1.55) { const roto = z > 1 && z < 2.6; L.add(M_MADERA, new THREE.BoxGeometry(.14, 1.15, .14), TMx(-6.35, .8, z, 0, 0, roto ? .5 : 0)) }
    L.add(M_MADERA, new THREE.BoxGeometry(.12, .12, 6), TMx(-6.35, 1.35, -1.8)); L.add(M_MADERA, new THREE.BoxGeometry(.12, .12, 2.4), TMx(-6.35, 1.35, 3.6, .2));
    // tirantes: cadenas chicas desde pernos en la pared (que se inclina encima) a las esquinas de adentro
    const pern = [[1.4, 17, -4.4], [1.4, 17, 4.4]], esq = [[-6.2, .25, -4.4], [-6.2, .25, 4.4]];
    pern.forEach((pp, i) => { const a = new THREE.Vector3(...pp), b = new THREE.Vector3(...esq[i]), d = b.clone().sub(a), n = Math.floor(d.length() / .62), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
      for (let k = 0; k <= n; k++) { const c = a.clone().lerp(b, k / n), qq = q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), k % 2 ? Math.PI / 2 : 0)); L.add(M_HIERRO_N, new THREE.TorusGeometry(.26, .07, 6, 12).scale(1, 1.6, 1), new THREE.Matrix4().compose(c, qq, new THREE.Vector3(1, 1, 1))) }
      L.add(M_HIERRO_N, new THREE.CylinderGeometry(.18, .18, 2.2, 8), TMx(pp[0] + .9, pp[1], pp[2], 0, 0, Math.PI / 2)); L.add(M_HIERRO_N, new THREE.BoxGeometry(.2, 1.2, 1.2), TMx(pp[0] + 1.9, pp[1], pp[2])) });
    // cosas de Sallow: cajón, rollo de soga, balde, banquito, farol apagado, cabos de vela con charcos de cera
    L.add(M_MADERA, new THREE.BoxGeometry(1.3, .8, .9), TMx(3.6, .65, -3.6, 0, .2)); L.add(M_MADERA, new THREE.BoxGeometry(1.36, .08, .96), TMx(3.6, 1.06, -3.6, 0, .2));
    for (let k = 0; k < 5; k++) L.add(sog, new THREE.TorusGeometry(.5 - k * .03, .07, 6, 18), TMx(4.2, .32 + k * .1, 3.4, Math.PI / 2));
    L.add(M_HIERRO_N, new THREE.CylinderGeometry(.32, .26, .55, 12, 1, true), TMx(2.6, .52, 3.9)); L.add(M_MADERA, new THREE.CylinderGeometry(.3, .3, .06, 12), TMx(-1.5, .7, -4)); for (let k = 0; k < 3; k++) L.add(M_MADERA, new THREE.BoxGeometry(.06, .5, .06), TMx(-1.5 + Math.cos(k * 2.1) * .22, .45, -4 + Math.sin(k * 2.1) * .22));
    L.add(M_HIERRO_N, new THREE.BoxGeometry(.4, .55, .4), TMx(1.6, 4.3, -4.4)); L.add(new THREE.MeshStandardMaterial({ color: "#1a1612", roughness: .2, metalness: .2 }), new THREE.BoxGeometry(.32, .4, .32), TMx(1.6, 4.3, -4.4)); L.add(M_HIERRO_N, new THREE.CylinderGeometry(.03, .03, 1.2, 4), TMx(1.6, 5.1, -4.4));
    for (let k = 0; k < 9; k++) { const x = 1 + r() * 4.5, z = -4.4 + r() * 8.6, hv = .15 + r() * .35; L.add(M_CERA_V, new THREE.CylinderGeometry(.07, .08, hv, 8), TMx(x, .25 + hv / 2, z)); L.add(M_CERA_V, new THREE.CylinderGeometry(.18 + r() * .2, .2 + r() * .22, .03, 10), TMx(x, .26, z)) }
    L.fin(PLAT).forEach(m => { m.castShadow = m.receiveShadow = true }) }
  // polvo suspendido (brilla en el rayo de luna; vibra con el zumbido; salta con el golpe)
  const HUECO_W = [HUECO[0], Y0 + H_TECHO + 1, HUECO[1]], PLAT_W = polar(80.5, P_H + .25, A_ENT);
  const RAYO = { a: new THREE.Vector3(...HUECO_W), b: new THREE.Vector3(...polar(79.5, P_H, A_ENT)), r0: R_HUECO * .95, r1: 5.2 };
  const PU = { uT: { value: 0 }, uZ: { value: 0 }, uG: { value: 0 }, uGt: { value: 10 }, uA: { value: 1 }, uScale: { value: 1000 }, uBA: { value: RAYO.a }, uBB: { value: RAYO.b }, uR0: { value: RAYO.r0 }, uR1: { value: RAYO.r1 }, uCol: { value: new THREE.Color("#ffe8c8") }, uRay: { value: 1 } };
  const POLVO = (() => { const N = 14000, r = rng(9941), pos = new Float32Array(N * 3), aR = new Float32Array(N * 4);
    for (let i = 0; i < N; i++) { let p; if (i < 5000) { const s = r(), q = RAYO.a.clone().lerp(RAYO.b, s), rr = lerp(RAYO.r0, RAYO.r1, s) * Math.sqrt(r()) * 1.2, a = r() * TAU; p = [q.x + Math.cos(a) * rr, q.y + (r() - .5) * 2, q.z + Math.sin(a) * rr] }
      else { const h = lerp(2, H_TECHO - 4, Math.pow(r(), 1.4)), rr = rIn(h) * Math.sqrt(r()) * .96, a = r() * TAU; p = polar(rr, h, a) }
      pos.set(p, i * 3); aR.set([r(), r(), r(), r()], i * 4) }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("aR", new THREE.BufferAttribute(aR, 4));
    const m = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms: PU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute vec4 aR; uniform float uT, uZ, uG, uGt, uA, uScale, uR0, uR1, uRay; uniform vec3 uBA, uBB; varying float vB;
void main(){ vec3 p = position;
  p += vec3(sin(uT * .13 + aR.x * 30.), sin(uT * .09 + aR.y * 20.) * .6, cos(uT * .11 + aR.z * 25.)) * (.6 + aR.w * 1.6);
  p += vec3(sin(uT * 61. + aR.x * 90.), sin(uT * 53. + aR.y * 70.), sin(uT * 67. + aR.z * 80.)) * uZ * (.04 + .12 * aR.w);
  float gk = uG * exp(-uGt * 1.3) * (1. - exp(-uGt * 14.)); vec2 ax = p.xz - vec2(${CX.toFixed(2)}, ${CZ.toFixed(2)}); p.y += gk * (1.5 + 5. * aR.x); p.xz -= normalize(ax + 1e-3) * gk * (1. + 3. * aR.y);
  vec4 mv = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mv;
  vec3 ab = uBB - uBA; float s = clamp(dot(p - uBA, ab) / dot(ab, ab), 0., 1.); float d = length(p - (uBA + ab * s)), rb = mix(uR0, uR1, s);
  float inB = (1. - smoothstep(rb * .55, rb * 1.05, d)) * uRay;
  vB = (.012 + inB * (1.2 + .6 * sin(uT * 1.7 + aR.x * 40.)) + gk * .3 + uZ * .02) * uA;
  gl_PointSize = clamp(uScale * (.018 + .04 * aR.w) / -mv.z, 1., 9.); }`,
      fragmentShader: `uniform vec3 uCol; varying float vB; void main(){ vec2 q = gl_PointCoord - .5; float a = 1. - smoothstep(.15, .5, length(q)); gl_FragColor = vec4(uCol * vB * a, 1.); }` }));
    m.frustumCulled = false; IN.add(m); return m })();
  // el RAYO de luna (cono de luz con motas) y su luz
  const HAZ = (() => { const len = RAYO.a.distanceTo(RAYO.b) + 2, g = new THREE.CylinderGeometry(RAYO.r0, RAYO.r1 * 1.05, len, 48, 24, true); g.translate(0, -len / 2, 0);
    const m = new THREE.Mesh(g, new THREE.ShaderMaterial({ uniforms: { uA: { value: .5 }, uT: PU.uT, uCol: { value: new THREE.Color("#cfe0ff") } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      vertexShader: `varying vec3 vN, vV; varying float vY; varying vec2 vUv; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.); vV = -mv.xyz; vN = normalMatrix * normal; vY = uv.y; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform float uA, uT; uniform vec3 uCol; varying vec3 vN, vV; varying float vY; varying vec2 vUv;
void main(){ float f = abs(dot(normalize(vN), normalize(vV))); float st = .7 + .3 * sin(vUv.x * 60. + sin(vUv.x * 17.) * 3.) * sin(vUv.y * 9. - uT * .3);
  float a = pow(f, 1.6) * st * smoothstep(0., .15, vY) * (.35 + .65 * vY) * uA; gl_FragColor = vec4(uCol * a, 1.); }` }));
    m.position.copy(RAYO.a); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), RAYO.b.clone().sub(RAYO.a).normalize()); m.frustumCulled = false; IN.add(m); return m })();
  const LUNA_SPOT = new THREE.SpotLight("#b8ccff", 0, 0, Math.atan(RAYO.r1 / RAYO.a.distanceTo(RAYO.b)) * 1.25, .55, 0); LUNA_SPOT.position.copy(RAYO.a); LUNA_SPOT.target.position.copy(RAYO.b); scene.add(LUNA_SPOT, LUNA_SPOT.target);
  // la CERA: anillo que llena la canaleta del labio desde el punto donde se vuelca (u 0 → 1 da toda la vuelta), el chorro y el vapor
  const A_VUELCA = A_ENT + 5.6 / 86;                                   // al costado de la plataforma
  const CU = { uFill: { value: 0 }, uA0: { value: A_VUELCA }, uCalor: { value: 1 }, uT: PU.uT };
  const CERA = (() => { const sec = [[85.42, 6.02], [85.65, 5.3], [85.92, 4.62], [86.3, 4.26], [86.8, 4.36], [87.02, 5.2], [87.12, 6.06], [86.7, 6.24], [86.1, 6.24], [85.42, 6.02]], P = sec.map(([r, h], i) => { const a = sec[(i + sec.length - 2) % (sec.length - 1)], b = sec[(i + 1) % (sec.length - 1)], tr = b[0] - a[0], th = b[1] - a[1], l = Math.hypot(tr, th) || 1; return { r, h, v: i / (sec.length - 1), nr: th / l, nh: -tr / l } });
    const m = new THREE.Mesh(torno(P, 720, 40, false), new THREE.MeshStandardMaterial({ color: "#d9a040", roughness: .22, metalness: 0, emissive: "#ff7a1a", emissiveIntensity: 1, side: THREE.DoubleSide }));
    m.material.onBeforeCompile = sh => { Object.assign(sh.uniforms, CU); sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nuniform float uFill, uA0; varying float vDa; varying float vHh;").replace("#include <begin_vertex>", `#include <begin_vertex>
  { vec2 d = transformed.xz - vec2(${CX.toFixed(2)}, ${CZ.toFixed(2)}); float a = atan(d.y, d.x) - uA0; a -= 6.2831853 * floor((a + 3.1415927) / 6.2831853); vDa = abs(a) / 3.1415927;
    float fr = uFill - vDa, k = smoothstep(-.002, .06, fr); transformed.y = ${(Y0 + 4.3).toFixed(2)} + (transformed.y - ${(Y0 + 4.3).toFixed(2)}) * k; vHh = transformed.y - ${Y0.toFixed(2)}; }`);
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nuniform float uFill, uCalor, uT; varying float vDa; varying float vHh;").replace("#include <clipping_planes_fragment>", "#include <clipping_planes_fragment>\n  if (vDa > uFill + .001) discard;")
        .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
  { float fr = uFill - vDa; float hot = uCalor * (.35 + .65 * (1. - smoothstep(0., .25, fr))) * (.85 + .15 * sin(uT * 3. + vDa * 60.)); totalEmissiveRadiance *= hot; diffuseColor.rgb *= .8 + .4 * smoothstep(5.6, 6.2, vHh); }`) };
    m.material.customProgramCacheKey = () => "cera"; m.visible = false; m.frustumCulled = false; IN.add(m); return m })();
  const CHORRO = (() => { const top = new THREE.Vector3(...polar(84.6, P_H + 2.1, A_VUELCA - .012)), bot = new THREE.Vector3(...polar(86.2, 5.4, A_VUELCA + .004));
    const cu = new THREE.QuadraticBezierCurve3(top, top.clone().lerp(bot, .5).add(new THREE.Vector3(0, .5, 0)), bot), g = new THREE.TubeGeometry(cu, 24, .16, 10, false);
    const tx = tex(64, 256, (g2, w, h) => { const r = rng(9951); g2.fillStyle = "#c08030"; g2.fillRect(0, 0, w, h); for (let k = 0; k < 60; k++) { g2.fillStyle = `rgba(255,${200 + r() * 55 | 0},120,${.3 + r() * .5})`; g2.fillRect(r() * w, r() * h, 2 + r() * 8, 10 + r() * 50) } }); tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: "#e0a848", emissive: "#ff9a30", emissiveMap: tx, map: tx, emissiveIntensity: 1.6, roughness: .2 })); m.visible = false; IN.add(m); return { m, tx, top } })();
  const VAPOR = (() => { const N = 2600, r = rng(9961), aR = new Float32Array(N * 4), pos = new Float32Array(N * 3); for (let i = 0; i < N; i++) aR.set([r(), r(), r(), r()], i * 4);
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("aR", new THREE.BufferAttribute(aR, 4));
    const m = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms: Object.assign({ uScale: PU.uScale, uCol: { value: new THREE.Color("#e8dccb") } }, CU), transparent: true, depthWrite: false,
      vertexShader: `attribute vec4 aR; uniform float uFill, uA0, uCalor, uT, uScale; varying float vA;
void main(){ float side = aR.x < .5 ? -1. : 1.; float a = uA0 + side * aR.y * uFill * 3.1415927; float life = fract(uT * (.18 + .2 * aR.z) + aR.w); float rr = 86.2 - life * 3. * aR.z;
  vec3 p = vec3(${CX.toFixed(2)} + cos(a) * rr, ${(Y0 + 6.1).toFixed(2)} + life * (4. + 7. * aR.w), ${CZ.toFixed(2)} + sin(a) * rr); p.x += sin(uT * .7 + aR.x * 20.) * life * 1.2; p.z += cos(uT * .6 + aR.y * 20.) * life * 1.2;
  vec4 mv = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mv; vA = uCalor * step(.001, uFill) * sin(3.1415927 * life) * .045 * (.4 + .6 * (1. - aR.y));
  gl_PointSize = clamp(uScale * (.25 + .9 * life) / -mv.z, 1., 60.); }`,
      fragmentShader: `uniform vec3 uCol; varying float vA; void main(){ float d = length(gl_PointCoord - .5); float a = (1. - smoothstep(.1, .5, d)) * vA; gl_FragColor = vec4(uCol, a); }` }));
    m.frustumCulled = false; m.visible = false; IN.add(m); return m })();

  // ======================= MUSGO COLGANDO DEL LABIO, CARÁMBANOS DE CERA VIEJA, NIDOS Y PÁJAROS =======================
  const T_MUSGO = tex(128, 512, (g, w, h) => { const r = rng(9971); g.clearRect(0, 0, w, h); for (let k = 0; k < 34; k++) { let x = r() * w, y = 0; const L = h * (.3 + r() * .7); g.strokeStyle = `rgb(${40 + r() * 40 | 0},${55 + r() * 45 | 0},${20 + r() * 20 | 0})`; g.lineWidth = 1 + r() * 2.2; g.beginPath(); g.moveTo(x, y); while (y < L) { y += 8 + r() * 14; x += (r() - .5) * 7; g.lineTo(x, y) } g.stroke() } g.fillStyle = "rgb(50,62,26)"; g.fillRect(0, 0, w, 6) });
  const M_MUSGO = new THREE.MeshStandardMaterial({ map: T_MUSGO, alphaTest: .4, side: THREE.DoubleSide, roughness: .95 });
  const geoMechon = (() => { const a = new THREE.PlaneGeometry(1, 1); a.translate(0, -.5, 0); const b = a.clone(); b.rotateY(Math.PI / 2); return mergeGeo([[a, null], [b, null]]) })();
  const MUSGO = (() => { const L = [], r = rng(9972);
    for (let k = 0; k < 2600; k++) { const a = r() * TAU; if (fbm(Math.cos(a) * 3 + 5, Math.sin(a) * 3, 3) < .42 && r() < .7) continue; const lado = r() < .75, rr = lado ? lerp(93.6, 95.7, r()) : lerp(84.8, 86.4, r()), hh = lado ? lerp(.2, 2.6, r()) : lerp(-.3, .8, r()); L.push([polar(rr, hh, a), a, .5 + r() * 1.6, 1 + r() * r() * 7]) }
    Object.values(ESLABONES).forEach(D => D.forEach(d => { if (r() < .5) { const nq = 1 + (r() * 3 | 0); for (let q = 0; q < nq; q++) L.push([[d.p.x + (r() - .5) * 3, d.p.y - 1.8 - r(), d.p.z + (r() - .5) * 3], r() * TAU, .5 + r(), 1 + r() * 4]) } }));
    const m = new THREE.InstancedMesh(geoMechon, M_MUSGO, L.length); L.forEach(([p, a, w, hh], i) => { dummy.position.set(...p); dummy.rotation.set((r() - .5) * .1, a, (r() - .5) * .1); dummy.scale.set(w, hh, w); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix) }); m.frustumCulled = false; G.add(m); return m })();
  const CARAMBANOS = (() => { const pts = []; for (let k = 0; k <= 8; k++) { const t = k / 8; pts.push(new THREE.Vector2(.5 * Math.pow(1 - t, 1.4) * (1 + .15 * Math.sin(t * 19)) + .001, -t)) } const g = new THREE.LatheGeometry(pts, 7);
    const L = [], r = rng(9973); for (let k = 0; k < 1300; k++) { const a = r() * TAU, este = Math.cos(a - A_CAD_E), dens = .25 + .75 * sst(-.2, .9, este) + .4 * fbm(Math.cos(a) * 4, Math.sin(a) * 4, 2); if (r() > dens) continue;
      const fuera = r() < .55, rr = fuera ? lerp(92.6, 95.3, r()) : lerp(84.9, 86.3, r()), hh = fuera ? (rr > 94 ? .6 : -.25) : -.2; L.push([polar(rr, hh, a), .22 + r() * .7, .4 + r() * r() * 4]) }
    const m = new THREE.InstancedMesh(g, M_CERA_V, L.length); L.forEach(([p, w, l], i) => { dummy.position.set(...p); dummy.rotation.set((r() - .5) * .08, r() * 6, (r() - .5) * .08); dummy.scale.set(w, l, w); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix) }); m.frustumCulled = false; G.add(m); return m })();
  const NIDOS = (() => { const r = rng(9974), L = [];
    for (let k = 0; k < 70; k++) { const a = r() * Math.PI * 1.1, lo = .55 + r() * .35, hi = .6 + r() * .5; L.push([new THREE.CylinderGeometry(.03, .04, 1, 3), TMx(Math.cos(a * 6 + k) * lo, .25 + r() * .3, Math.sin(a * 6 + k) * lo, (r() - .5) * .7 + Math.PI / 2, a * 6 + k, 0, 1, hi, 1)]) }
    L.push([new THREE.CylinderGeometry(.75, .45, .3, 10), TMx(0, .2, 0)]); for (let k = 0; k < 3; k++) L.push([new THREE.SphereGeometry(.12, 8, 6).scale(1, 1.3, 1), TMx((r() - .5) * .4, .42, (r() - .5) * .4)]);
    const g = mergeGeo(L), P = g.attributes.position, col = new Float32Array(P.count * 3); for (let i = 0; i < P.count; i++) { const egg = P.getY(i) > .3 && Math.hypot(P.getX(i), P.getZ(i)) < .35; col.set(egg ? [.85, .84, .78] : [.32 + r() * .14, .24 + r() * .1, .14 + r() * .06], i * 3) } g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const pos = []; for (let k = 0; k < 22; k++) { const rr = lerp(16, 46, r()), a = r() * TAU; pos.push([...polar(rr, hArriba(rr) + .2, a), 1.4 + r() * 1.4]) }
    for (let k = 0; k < 16; k++) { const a = r() * TAU, hh = [101.6, 112.2, 120.4, 88.5][k % 4]; pos.push([...polar(rOut(hh) + 1.1, hh + .35, a), 1.2 + r()]) }
    ["norte", "sur", "oeste"].forEach(n => ESLABONES[n].slice(-9, -1).forEach(d => { if (r() < .55) pos.push([d.p.x, d.p.y + 1.3, d.p.z, 1.3 + r()]) }));
    const m = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .95 }), pos.length); pos.forEach(([x, y, z, s], i) => { dummy.position.set(x, y, z); dummy.rotation.set(0, r() * 6, 0); dummy.scale.setScalar(s); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix) }); m.frustumCulled = false; G.add(m); return { m, pos } })();
  const AVES = (() => { const N = 90, r = rng(9975), L = [];
    for (let i = 0; i < N; i++) { const bajo = i < 22; L.push({ rr: bajo ? lerp(104, 150, r()) : lerp(78, 170, r()), h: bajo ? lerp(-25, 25, r()) : lerp(95, 175, r()), w: (.08 + r() * .14) * (r() < .5 ? 1 : -1), f: r() * TAU, b: r() * TAU, s: .8 + r() * .6 }) }
    const body = new THREE.ConeGeometry(.14, .9, 5); body.rotateX(Math.PI / 2); const ala = new THREE.BufferGeometry(); ala.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, .25, 0, 0, -.2, .75, 0, -.05, 0, 0, .25, -.75, 0, -.05, 0, 0, -.2], 3)); ala.computeVertexNormals();
    const g = mergeGeo([[body, null], [ala, null]]), ph = new Float32Array(N); L.forEach((b, i) => ph[i] = b.f); g.setAttribute("aF", new THREE.InstancedBufferAttribute(ph, 1));
    const mat = new THREE.MeshStandardMaterial({ color: "#16161a", roughness: .8, side: THREE.DoubleSide }); mat.onBeforeCompile = sh => { sh.uniforms.uT = U.uT; sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nattribute float aF; uniform float uT;").replace("#include <begin_vertex>", "#include <begin_vertex>\n  { float ax = abs(transformed.x); transformed.y += sin(uT * 7. + aF) * ax * ax * 1.1; }") }; mat.customProgramCacheKey = () => "ave";
    const m = new THREE.InstancedMesh(g, mat, N); m.frustumCulled = false; G.add(m); return { m, L } })();
  const aves = t => { const { m, L } = AVES; L.forEach((b, i) => { const a = b.b + t * b.w, x = CX + Math.cos(a) * b.rr, z = CZ + Math.sin(a) * b.rr, y = Y0 + b.h + Math.sin(t * .5 + b.f) * 4;
      dummy.position.set(x, y, z); dummy.rotation.set(Math.sin(t * .8 + b.f) * .1, b.w > 0 ? -a : Math.PI - a, (b.w > 0 ? -1 : 1) * .35, "YXZ"); dummy.scale.setScalar(b.s * 1.8); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix) }); m.instanceMatrix.needsUpdate = true };

  // ======================= LA SOMBRA: la campana y las cadenas tapan al sol (o a la luna) en TODOS los materiales =======================
  { const N = 32, arr = []; for (let i = 0; i <= N; i++) arr.push(rOut(i / N * HB).toFixed(2));
    const segs = []; ["norte", "sur", "oeste"].forEach(n => { const C = CAD[n]; for (let k = 0; k < 6; k++) segs.push([enPoli(C, C.tot * k / 6), enPoli(C, C.tot * (k + 1) / 6)]) });
    { const C = CAD.este, sL = U_LABIO_E * C.tot; for (let k = 0; k < 3; k++) segs.push([enPoli(C, sL * k / 3), enPoli(C, sL * (k + 1) / 3)]) }
    const v3 = v => `vec3(${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)})`;
    const GL = `
const float CB_R[33] = float[33](${arr.join(", ")});
float cbRad(float h){ float x = clamp(h / ${HB.toFixed(2)}, 0., 1.) * 32.; float fi = min(floor(x), 31.); int i = int(fi); return mix(CB_R[i], CB_R[i + 1], x - fi); }
float cbSeg(vec3 p, vec3 d, vec3 a, vec3 b, float r){ vec3 u = b - a, w = p - a; float uu = dot(u, u), ud = dot(u, d), uw = dot(u, w), dw = dot(d, w);
  float s = clamp((uw - dw * ud) / max(uu - ud * ud, 1e-3), 0., 1.); float t = max(s * ud - dw, 0.); s = clamp(dot(w + d * t, u) / uu, 0., 1.);
  float dist = length(w + d * t - u * s); float pen = .5 + t * .006; return (1. - smoothstep(r - pen, r + pen, dist)) * step(.5, t); }
float cbSombra(vec3 pv, vec3 dv){ mat3 iv = transpose(mat3(viewMatrix)); vec3 p = cameraPosition + iv * pv, d = normalize(iv * dv); if (d.y < .015) return 1.;
  float occ = 0.; vec2 o = p.xz - vec2(${CX.toFixed(2)}, ${CZ.toFixed(2)}), dh = d.xz; float t0 = max((${Y0.toFixed(2)} - p.y) / d.y, 0.), t1 = (${(Y0 + HB).toFixed(2)} - p.y) / d.y;
  float A = dot(dh, dh), B = dot(o, dh), Cc = dot(o, o) - ${((CAMPANA_R + 3) ** 2).toFixed(1)};
  if (A > 1e-5) { float D = B * B - A * Cc; if (D < 0.) t1 = -1.; else { float sq = sqrt(D); t0 = max(t0, (-B - sq) / A); t1 = min(t1, (-B + sq) / A); } } else if (Cc > 0.) t1 = -1.;
  if (t1 > t0) { for (int i = 0; i < 22; i++) { float t = mix(t0, t1, (float(i) + .5) / 22.); vec3 q = p + d * t; float r = cbRad(q.y - ${Y0.toFixed(2)}) - .9, dist = length(q.xz - vec2(${CX.toFixed(2)}, ${CZ.toFixed(2)})), pen = .7 + t * .0045; occ = max(occ, 1. - smoothstep(r - pen, r + pen, dist)); } }
  ${segs.map(([a, b]) => `occ = max(occ, cbSeg(p, d, ${v3(a)}, ${v3(b)}, 2.3));`).join("\n  ")}
  return 1. - occ * .97; }
`;
    THREE.ShaderChunk.lights_pars_begin = THREE.ShaderChunk.lights_pars_begin + GL;
    const A0 = "getDirectionalLightInfo( directionalLight, directLight );";
    if (THREE.ShaderChunk.lights_fragment_begin.includes(A0)) THREE.ShaderChunk.lights_fragment_begin = THREE.ShaderChunk.lights_fragment_begin.replace(A0, A0 + "\n\t\tdirectLight.color *= cbSombra( - vViewPosition, directionalLight.direction );");
    else console.error("campana: no encontré la luz direccional en el shader (la sombra de la campana no va a andar)") }

  // ======================= ESTADO, CLIMA Y POR CUADRO =======================
  const ST = { cera: 0, calor: 1, golpe: null, zumb: 0, nubes: false, temblor: 0, solDir: null };
  const reset = () => { ST.cera = 0; ST.calor = 1; ST.golpe = null; ST.zumb = 0; ST.nubes = false; ST.temblor = 0 };
  // mapas de entorno por clima (para que el metal tenga qué reflejar)
  const ENVMAPS = {};
  const envMapa = (k, top, hor, gnd, sol, solCol, solI) => { if (ENVMAPS[k]) return ENVMAPS[k]; const es = new THREE.Scene();
    es.add(new THREE.Mesh(new THREE.SphereGeometry(50, 48, 24), new THREE.ShaderMaterial({ side: THREE.BackSide, uniforms: { t: { value: new THREE.Color(top) }, h: { value: new THREE.Color(hor) }, g: { value: new THREE.Color(gnd) }, s: { value: new THREE.Vector3(...sol).normalize() }, sc: { value: new THREE.Color(solCol) }, si: { value: solI } },
      vertexShader: "varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",
      fragmentShader: "uniform vec3 t, h, g, s, sc; uniform float si; varying vec3 vD; void main(){ float y = vD.y; vec3 c = y > 0. ? mix(h, t, pow(smoothstep(0., .8, y), .6)) : mix(h, g, smoothstep(0., -.25, y)); float d = max(dot(vD, s), 0.); c += sc * si * (pow(d, 24.) * 2. + pow(d, 4.) * .3); gl_FragColor = vec4(c, 1.); }" })));
    const pm = new THREE.PMREMGenerator(R), rt = pm.fromScene(es, 0, .1, 100); pm.dispose(); return ENVMAPS[k] = rt.texture };
  const MATS_ENV = [[M_BRONCE, 1], [M_BRONCE_IN, .4], [M_BRONCE_L, 1], [M_BRONCE_ROTO, .7], [M_HIERRO, .5], [M_HIERRO_N, .6], [M_CAD, .55], [M_CAD_E, .9]];
  // valores por clima de lo mío (las claves cb* de ENV los pisan)
  const CLIMAS_CB = {
    dia: { env: ["#4a86d8", "#c8dcec", "#6a6250", [-.3, .9, .35], "#fff4e0", 1.2], rim: ["#000000", 0], brillo: .05, bajo: ["#d8c0a0", .22], rayo: 0, polvo: .25 },
    tarde: { env: ["#3a4c8a", "#f2a060", "#4a3020", [-.9, .2, .15], "#ffb060", 2.4], rim: ["#ff9a50", .25], brillo: .55, bajo: ["#e0a070", .16], rayo: 0, polvo: .3 },
    noche: { env: ["#0a1024", "#26304e", "#0a0c10", [.1, .62, -.78], "#9ab0e0", .9], envI: .4, rim: ["#9ab8ff", .9], brillo: 0, bajo: ["#1a2030", .25], rayo: 0, polvo: .2 },
    dentro: { env: ["#06080e", "#121624", "#0a0806", [-.55, .8, .1], "#8aa0d8", .6], envI: .7, rim: ["#000000", 0], brillo: 0, bajo: ["#3a3444", .28], rayo: 1, polvo: 1 } };
  let envK = null;
  function clima(A) { const k = A.cbEnv || "dia", D = CLIMAS_CB[k] || CLIMAS_CB.dia;
    if (envK !== k) { envK = k; const em = envMapa(k, ...D.env); MATS_ENV.forEach(([m, i]) => { m.envMap = em; m.envMapIntensity = i * (D.envI ?? 1); m.needsUpdate = true }) }
    const sd = ST.solDir || A.cbSol || A.sol || [-.3, .9, .3], l = Math.hypot(...sd); U.uSolW.value.set(sd[0] / l, sd[1] / l, sd[2] / l);
    U.uRim.value.set(A.cbRim ? A.cbRim[0] : D.rim[0]).multiplyScalar(A.cbRim ? A.cbRim[1] : D.rim[1]); U.uBrillo.value = A.cbBrillo ?? D.brillo; U.uPat.value = A.cbPatina ?? .42;
    U.uBajo.value.set(A.cbBajo ? A.cbBajo[0] : D.bajo[0]).multiplyScalar(A.cbBajo ? A.cbBajo[1] : D.bajo[1]);
    const rayo = A.cbRayo ?? D.rayo; HAZ.visible = rayo > 0; HAZ.material.uniforms.uA.value = .4 * rayo; PU.uRay.value = rayo; LUNA_SPOT.intensity = 9 * rayo; LUNA_SPOT.visible = rayo > 0; PU.uA.value = A.cbPolvo ?? D.polvo; POLVO.visible = PU.uA.value > 0 }
  function porCuadro(t) { U.uT.value = t; PU.uT.value = t; PU.uScale.value = (typeof H !== "undefined" ? H : 1920) / (2 * Math.tan(cam.fov * Math.PI / 360));
    const A = (typeof ENV !== "undefined" && ENV[ENVNOW]) || {}; clima(A);
    CU.uFill.value = ST.cera; CU.uCalor.value = ST.calor; CERA.visible = ST.cera > 0; VAPOR.visible = ST.cera > 0 && ST.calor > .05;
    CHORRO.m.visible = ST.cera > 0 && ST.cera < .995; CHORRO.tx.offset.y = -t * 1.6;
    PU.uZ.value = ST.zumb;
    if (ST.golpe) { const dt = ST.golpe.dt, amp = ST.cera >= .98 ? .14 : 1; PU.uG.value = amp; PU.uGt.value = dt; U.uOndaH.value = 6 + dt * 55; U.uOndaA.value = amp * 1.1 * Math.exp(-dt * 1.1) * (dt < 5 ? 1 : 0); ST.temblor = amp * .6 * Math.exp(-dt * 5) }
    else { PU.uG.value = 0; PU.uGt.value = 10; U.uOndaA.value = 0; ST.temblor = 0 }
    aves(t) }

  return { G, IN, PLAT, CAD, ESLABONES, ST, U, PU, CU, reset, porCuadro, cadenaMarco, enPoli, tanPoli, rOut, rIn, hArriba, polar, U_LABIO_E, PRIMER, GANCHO, PLAT_W, HUECO_W, RAYO, A_ENT, A_CAD_E, A_VUELCA, H_TECHO, HB, P_H, GRIETA, ESL, CLARO,
    sst, fbm, rd, hsh, mergeGeo, TMx, lote, M_MADERA, M_HIERRO, M_HIERRO_N, envMapa, CLIMAS_CB, POLVO, HAZ, VAPOR, MUSGO, CARAMBANOS, NIDOS, AVES, CERA, CHORRO, LUNA_SPOT, T_EXT, T_INT };
})();

// ======================= API DE LA CAMPANA =======================
// cadenaPunto(nombre, u): [x, y, z] en el EJE de la cadena ("norte" | "sur" | "oeste" | "este"); u 0 = abajo (cima / risco), 1 = la corona.
// cadenaTangente(nombre, u): dirección (unitaria) hacia arriba de la cadena. cadenaMarco(nombre, u): { p, t, lado (horizontal), n (normal «hacia afuera/arriba») }.
// El narrador trepando: ponelo en cadenaPunto + n · 3 (los eslabones miden 10,6 × 5,8 m; barra de 0,95 m de radio).
const cadenaPunto = (n, u) => CBX.cadenaMarco(n, u).p, cadenaTangente = (n, u) => CBX.cadenaMarco(n, u).t, cadenaMarco = (n, u) => CBX.cadenaMarco(n, u);
const PRIMER_ESLABON = CBX.PRIMER;                       // centro del primer eslabón (el que está sobre el ancla del risco del este)
const CADENA_U_LABIO = CBX.U_LABIO_E;                    // u de la cadena del este donde llega al labio de la campana (abajo de eso cuelga libre, entre las nubes)
// interior(): puntos de adentro. plataforma = centro del piso de tablas (Sallow con su martillo); labio = el reborde de adentro del labio al lado de la plataforma;
// gancho = la punta de abajo del gancho roto del badajo; entrada = la grieta del flanco (por afuera), donde llega la tabla desde la cadena del este
const interior = () => ({ plataforma: CBX.PLAT_W.slice(), labio: CBX.polar(84.85, 6.5, CBX.A_ENT + .1), gancho: CBX.GANCHO.slice(), entrada: CBX.polar(CBX.rOut(CBX.GRIETA.hc) + 1, CBX.GRIETA.hc, CBX.A_ENT), hueco: CBX.HUECO_W.slice(), vuelca: CBX.polar(84.6, CBX.P_H + 2.1, CBX.A_VUELCA - .012), ryPlataforma: -CBX.A_ENT });
// punto en coordenadas de la plataforma (x: hacia la pared de afuera −6,5…6,3; y: arriba del piso; z: a lo largo del borde −4,8…4,8) → mundo
const plataformaW = (x, y, z) => { CBX.PLAT.updateMatrixWorld(true); return CBX.PLAT.localToWorld(new THREE.Vector3(x, y + .25, z)).toArray() };
const zumbido = (t, u = 1) => { CBX.ST.zumb = cl(u, 0, 3) };                       // vibración del polvo y del aire de adentro (0 quieto … 1 zumbando … 3 temblando)
const ceraEnLabio = (u, calor = 1) => { CBX.ST.cera = cl(u); CBX.ST.calor = cl(calor, 0, 2) };   // u 0 → 1: la cera dorada humeante llena el labio de adentro desde el punto de la plataforma
const golpe = (t0, t) => { if (t >= t0) CBX.ST.golpe = { dt: t - t0 } };            // el martillo pega en t0 (polvo que salta, onda que sube por la pared; con cera: «thud»)
const golpeTemblor = () => CBX.ST.temblor;                                          // cuánto sacudir la cámara este cuadro (0 … .6)
const sombraCampana = dirSol => { CBX.ST.solDir = dirSol || null; if (dirSol && typeof SOL !== "undefined") SOL.dir = dirSol };   // la sombra sigue SIEMPRE a la luz direccional; esto además mueve el sol
// ---------- stubs de la tapa del video viejo (las escenas viejas siguen armando)
const TAPA_Y = (x, z) => CIELO(x, z), AGUJERO_W = () => [AGUJERO[0], CIELO(...AGUJERO), AGUJERO[1]], KELL_BORDE = [0, CIELO(0, 0) + LID_T, 0], tapaCaeY = u => CIELO(0, 0);
const tapaReset = () => { }, tapa = () => { }, tapaHundir = () => { }, tapaGotea = () => { }, tapaAgujero = () => { }, tapaCae = () => { }, lluviaTrigo = () => { }, tanerCae = () => { };
function sinBestia() { }
