// ================= LEJOS: todo lo que está al ESTE del pueblo (x ≈ 100 … 1000): la cordillera, el mar de nubes, el vuelo y el valle verde SIN viento =================
// Medidas de _comun_viento.js (ALT, SIERRA_X, VALLE, VALLE_Y). En x < 103 el piso es exactamente ALT (se toca con la malla del pueblo sin borde).
// Todo lo interno vive dentro de LEJOS; afuera quedan solo los nombres de la API (al final). En el valle NADA se mueve con viento.
const LEJOS = (() => {
  const G = new THREE.Group(); G.name = "LEJOS"; scene.add(G); const FINO = new THREE.Group(); G.add(FINO);   // FINO: pasto, flores, cometas (se apaga con la cámara lejos del valle)
  const sst = (a, b, v) => { const q = cl((v - a) / (b - a)); return q * q * (3 - 2 * q) };
  const hsh = (i, j) => { let n = (Math.imul(i | 0, 374761393) + Math.imul(j | 0, 668265263)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296 };
  const rd = (x, z) => { const i = Math.floor(x), j = Math.floor(z), u = x - i, v = z - j, a = u * u * (3 - 2 * u), b = v * v * (3 - 2 * v); return lerp(lerp(hsh(i, j), hsh(i + 1, j), a), lerp(hsh(i, j + 1), hsh(i + 1, j + 1), a), b) };
  const fbm = (x, z, o = 4) => { let s = 0, a = .5, f = 1, n = 0; for (let k = 0; k < o; k++) { s += a * rd(x * f + k * 17.3, z * f - k * 9.1); n += a; a *= .5; f *= 2.03 } return s / n };
  const ridged = (x, z, o = 5) => { let s = 0, a = .5, f = 1, w = 1, n = 0; for (let k = 0; k < o; k++) { let v = 1 - Math.abs(2 * rd(x * f + k * 31.7, z * f - k * 17.3) - 1); v *= v * w; w = cl(v * 1.8); s += v * a; n += a; a *= .52; f *= 2.1 } return s / n };
  const lin = h => { const c = new THREE.Color(h); return [c.r, c.g, c.b] }, mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  const envuelto = (g, w, h, fn) => { for (const dx of [-w, 0, w]) for (const dy of [-h, 0, h]) { g.save(); g.translate(dx, dy); fn(); g.restore() } };
  const V3 = a => a.isVector3 ? a.clone() : new THREE.Vector3(a[0], a[1], a[2]);
  const TMx = (x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, "YXZ")), new THREE.Vector3(sx, sy, sz));
  const entre = (A, B, r, seg = 5) => { const a = V3(A), b = V3(B), d = b.clone().sub(a), l = d.length(); const g = new THREE.CylinderGeometry(r, r, l, seg); return [g, new THREE.Matrix4().compose(a.add(b).multiplyScalar(.5), new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()), new THREE.Vector3(1, 1, 1))] };
  // une geometrías (posición, normal, uv y color por vértice: c = [r,g,b], función (x,y,z) o nada = blanco)
  const mergeC = list => { let n = 0; const qs = list.map(([g, m, c]) => { const q = g.index ? g.toNonIndexed() : g.clone(); if (m) q.applyMatrix4(m); n += q.attributes.position.count; return [q, c] });
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2), co = new Float32Array(n * 3); let o = 0;
    for (const [q, c] of qs) { const P = q.attributes.position, N = q.attributes.normal, U = q.attributes.uv, C = q.attributes.color, k = P.count; pos.set(P.array, o * 3); if (N) nor.set(N.array, o * 3); if (U) uv.set(U.array, o * 2);
      for (let i = 0; i < k; i++) { const cc = C ? [C.getX(i), C.getY(i), C.getZ(i)] : typeof c === "function" ? c(P.getX(i), P.getY(i), P.getZ(i)) : (c || [1, 1, 1]); co[(o + i) * 3] = cc[0]; co[(o + i) * 3 + 1] = cc[1]; co[(o + i) * 3 + 2] = cc[2] } o += k }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); g.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); g.setAttribute("color", new THREE.BufferAttribute(co, 3)); return g };
  // bulto redondeado deformado (copas, nubes, matas): normales suaves de esfera; base = aplasta la parte de abajo
  const bulto = (seed, det = 2, amp = .18, f = 1.5, base = null) => { const g = new THREE.IcosahedronGeometry(1, det), p = g.attributes.position, nn = new Float32Array(p.count * 3), s = seed * 7.13;
    for (let i = 0; i < p.count; i++) { const v = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i)).normalize(), k = 1 + (fbm(v.x * f + s + v.y * 1.7, v.z * f - s - v.y * 1.3, 3) - .5) * 2 * amp; let y = v.y * k; if (base !== null && y < base) y = base + (y - base) * .18; p.setXYZ(i, v.x * k, y, v.z * k); nn.set([v.x, v.y * (base !== null && v.y < 0 ? .5 : 1), v.z], i * 3) }
    g.setAttribute("normal", new THREE.BufferAttribute(nn, 3)); g.normalizeNormals(); return g };
  const piedraG = (seed, det = 1, ach = .65) => { const g = new THREE.IcosahedronGeometry(1, det), p = g.attributes.position, s = seed * 3.7; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = .7 + .55 * fbm(x * 1.3 + s + y, z * 1.3 - s - y, 2); p.setXYZ(i, x * k, Math.max(y * k * ach, -.25), z * k) } g.computeVertexNormals(); return g };
  const instancias = (geo, mat, L, { sombra = true, recibe = true, par = G, celda = 0 } = {}) => {   // celda > 0: un InstancedMesh por cuadro del mapa (la cámara y las sombras descartan lo que no ven)
    if (celda > 0) { const B = new Map(); L.forEach(q => { const k = Math.floor(q.p[0] / celda) + "_" + Math.floor(q.p[2] / celda); (B.get(k) || B.set(k, []).get(k)).push(q) }); return [...B.values()].map(l => instancias(geo, mat, l, { sombra, recibe, par })) }
    const m = new THREE.InstancedMesh(geo, mat, Math.max(1, L.length)); const cc = new THREE.Color();
    L.forEach((q, i) => { dummy.position.set(q.p[0], q.p[1], q.p[2]); dummy.rotation.set(q.rx || 0, q.ry || 0, q.rz || 0, "YXZ"); const s = q.s ?? 1; Array.isArray(s) ? dummy.scale.set(s[0], s[1], s[2]) : dummy.scale.setScalar(s); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); if (q.c) m.setColorAt(i, cc.setRGB(q.c[0], q.c[1], q.c[2])) });
    m.count = L.length; m.castShadow = sombra; m.receiveShadow = recibe; par.add(m); return m };
  // pintura con ImageData (texturas de detalle sin costura, en canales)
  const ruidoP = (x, y, P) => { const i = Math.floor(x), j = Math.floor(y), u = x - i, v = y - j, a = u * u * (3 - 2 * u), b = v * v * (3 - 2 * v), h = (q, w) => hsh(((q % P) + P) % P, ((w % P) + P) % P); return lerp(lerp(h(i, j), h(i + 1, j), a), lerp(h(i, j + 1), h(i + 1, j + 1), a), b) };

  // ---------------- LUGARES (fuente única de esta zona) ----------------
  const RIO = x => -38 + 20 * Math.sin(x * .0105 + .4) + 7 * Math.sin(x * .029 + 1.7);   // z del centro del arroyo (corre de x ≈ 262 hacia el este)
  const RIO_X0 = 262;
  const ATX = 505, ATZ = 25, CPX = 513, CPZ = 34, MTX = 516.4, MTZ = 37.2;
  const CASAS_P = [[548, -14, .35], [470, -88, -.4], [595, 64, 2.95], [430, 80, 3.5], [622, -98, .15], [674, 24, -1.45]];
  const PUENTE = [486, RIO(486)];
  const SENDAS = [[[430, 80], [452, 62], [478, 50], [521, 58], [560, 46], [595, 64]], [[548, -14], [553, 14], [560, 46]], [[470, -88], [480, -66], [486, -52], [492, -30], [520, -12], [548, -14]], [[560, 46], [610, 38], [674, 24]], [[548, -14], [585, -52], [622, -98]]];
  const sendaD = (x, z) => { let d = 1e9; for (const L of SENDAS) for (let i = 0; i < L.length - 1; i++) { const [x0, z0] = L[i], [x1, z1] = L[i + 1], dx = x1 - x0, dz = z1 - z0, t = cl(((x - x0) * dx + (z - z0) * dz) / (dx * dx + dz * dz)); d = Math.min(d, Math.hypot(x - x0 - dx * t, z - z0 - dz * t)) } return d };

  // ---------------- EL PISO ----------------
  const envS = x => Math.exp(-(((x - SIERRA_X - 4) / 50) ** 2));
  const mCord = x => sst(103, 126, x) * (1 - sst(245, 300, x));
  function altBase(x, z) {
    let h = ALT(x, z); const az = Math.abs(z), mc = mCord(x);
    if (mc > 0) { const wx = x + (fbm(x * .011 + 3, z * .011, 2) - .5) * 46, wz = z + (fbm(x * .011, z * .011 + 7, 2) - .5) * 46;
      const k = mc * envS(x); h += k * ((ridged(wx * .017, wz * .017, 5) - .3) * 46 + (ridged(x * .06 + 5, z * .06, 3) - .3) * 9 + (fbm(x * .09, z * .09, 2) - .5) * 5);
      if (h > 14) { const T = 4.2 + 1.5 * fbm(x * .02, z * .02, 2), q = h / T, fl = Math.floor(q), esc = (fl + sst(.25, .85, q - fl)) * T; h = lerp(h, esc, .4 * k * sst(14, 30, h)) } }
    const mv = sst(215, 300, x);
    if (mv > 0) { const dA = Math.hypot(x - ATX, z - ATZ), dR = Math.abs(z - RIO(x));
      let e = sst(130, 320, az) * (24 + 38 * fbm(x * .008 + 5, z * .008, 3)) + sst(640, 840, x) * (36 + 50 * fbm(x * .006, z * .006 + 9, 3));
      e += (fbm(x * .018 + 1, z * .018 + 4, 3) - .5) * 3.4 * sst(18, 60, dA) * sst(4, 22, dR);
      for (const [cx, cz] of CASAS_P) { const d = Math.hypot(x - cx, z - cz); if (d < 16) e *= sst(6, 16, d) }
      const far = cl(sst(300, 430, az) + sst(790, 900, x));
      if (far > 0) e += far * (ridged(x * .0065 + 9, z * .0065 - 4, 4) * 52 + (ridged(x * .03 + 2, z * .03, 3) - .3) * 16 + fbm(x * .02, z * .02, 3) * 10);
      h += mv * e }
    return h }
  const cauce = x => 2.4 + 1.1 * Math.sin(x * .05) + .6 * Math.sin(x * .13);   // medio ancho del arroyo
  function ljAlt(x, z) { let h = altBase(x, z); if (x > RIO_X0 - 6) { const d = Math.abs(z - RIO(x)), w = cauce(x); h -= 1.15 * (1 - sst(w * .4, w + 1.3, d)) * sst(RIO_X0 - 6, RIO_X0 + 4, x) } return h }
  const aguaY = x => altBase(x, RIO(x)) - .5;

  // textura de detalle (R = fino, G = grueso), sin costura; y las bandas de los estratos
  const T_DET = (() => { const S = 512, c = mk(S, S), g = c.getContext("2d"), im = g.createImageData(S, S), r = rng(7101);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const f = .5 * ruidoP(x / 4, y / 4, S / 4) + .3 * ruidoP(x / 2, y / 2, S / 2) + .2 * ruidoP(x / 1, y / 1, S), gr = .55 * ruidoP(x / 32, y / 32, S / 32) + .3 * ruidoP(x / 16, y / 16, S / 16) + .15 * ruidoP(x / 8, y / 8, S / 8), o = (y * S + x) * 4;
      im.data[o] = 255 * cl(.15 + f * .95); im.data[o + 1] = 255 * gr; im.data[o + 2] = 128; im.data[o + 3] = 255 }
    g.putImageData(im, 0, 0);
    // grietas y briznas (oscuras) pintadas encima en el canal rojo
    g.globalCompositeOperation = "multiply"; for (let k = 0; k < 900; k++) { const x = r() * S, y = r() * S, a = r() * 6.28, l = 3 + r() * 14; envuelto(g, S, S, () => { g.strokeStyle = `rgba(${120 + r() * 80 | 0},255,255,1)`; g.lineWidth = 1 + r() * 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke() }) }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.NoColorSpace; t.anisotropy = 8; return t })();
  const T_EST = (() => { const c = mk(4, 1024), g = c.getContext("2d"), r = rng(7102); let y = 0; while (y < 1024) { const hh = 4 + r() * 34, v = .62 + r() * .38; g.fillStyle = `rgb(${v * 255 | 0},${v * 255 | 0},${v * 255 | 0})`; g.fillRect(0, y, 4, hh); if (r() < .4) { g.fillStyle = "rgb(110,110,110)"; g.fillRect(0, y + hh - 2, 4, 2) } y += hh }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.NoColorSpace; return t })();
  const M_TERR = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .94, metalness: 0, name: "terr" });
  M_TERR.onBeforeCompile = sh => { sh.uniforms.tDet = { value: T_DET }; sh.uniforms.tEst = { value: T_EST };
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nattribute float aRoca; varying float vRoca; varying vec3 vWP; varying vec3 vWN;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvRoca = aRoca; vWP = (modelMatrix * vec4(transformed, 1.)).xyz; vWN = normalize(mat3(modelMatrix) * objectNormal);");
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nuniform sampler2D tDet; uniform sampler2D tEst; varying float vRoca; varying vec3 vWP; varying vec3 vWN;")
      .replace("#include <map_fragment>", `{ vec3 bw = pow(abs(vWN), vec3(4.)); bw /= (bw.x + bw.y + bw.z); vec2 f0, f1, f2;
        if (bw.y > .97) { f0 = texture2D(tDet, vWP.xz * .53).rg; f1 = texture2D(tDet, vWP.xz * .19).rg; f2 = texture2D(tDet, vWP.xz * .031 + .3).rg; } else {
        f1 = texture2D(tDet, vWP.zy * .19).rg * bw.x + texture2D(tDet, vWP.xz * .19).rg * bw.y + texture2D(tDet, vWP.xy * .19).rg * bw.z;
        f2 = texture2D(tDet, vWP.zy * .031 + .3).rg * bw.x + texture2D(tDet, vWP.xz * .031 + .3).rg * bw.y + texture2D(tDet, vWP.xy * .031 + .3).rg * bw.z;
        f0 = texture2D(tDet, vWP.zy * .53).rg * bw.x + texture2D(tDet, vWP.xz * .53).rg * bw.y + texture2D(tDet, vWP.xy * .53).rg * bw.z; }
        vec2 f3 = texture2D(tDet, vWP.xz * .0047 + .7).rg;
        float est = texture2D(tEst, vec2(.5, vWP.y * .045 + (f2.y - .5) * .7 + (f3.y - .5) * 1.4)).r;
        float k = vRoca;
                diffuseColor.rgb *= mix(.7 + .32 * f1.x + .2 * f0.x, (.45 + .55 * f1.x + .25 * f0.x) * (.5 + .75 * est), k) * (.86 + .28 * f2.y) * (.94 + .12 * f3.y); }`) };

  const C = { seco: lin("#9a9258"), seco2: lin("#7e7a46"), alp: lin("#7e8c4a"), alp2: lin("#a09a64"), p1: lin("#4a9a2a"), p2: lin("#74bd3c"), p3: lin("#377e22"), flor: lin("#a9c34a"), r1: lin("#79726a"), r2: lin("#57514b"), r3: lin("#958c80"), ped: lin("#b4aea4"),
    nie: lin("#e9eef5"), nieS: lin("#c3d0e2"), tie: lin("#8a7350"), ori: lin("#33561f"), arena: lin("#9a8a6c") };
  function colorL(x, z, h, ny) {
    const s = 1 - ny, n = fbm(x * .045 + 11, z * .045 + 2, 3), n2 = fbm(x * .21 + 5, z * .21 + 8, 2), n3 = fbm(x * .011, z * .011, 2);
    let c = mix3(mix3(C.p3, C.p1, n), C.p2, n2 * n2 * 1.2); c = mix3(c, C.flor, sst(.6, .78, n3) * .45);
    c = mix3(c, mix3(C.seco2, C.seco, n2), 1 - sst(132, 188, x));                       // del lado del viento: pasto seco y ralo
    c = mix3(c, mix3(C.alp, C.alp2, n2), sst(12, 30, h + (n - .5) * 12) * .85);          // pasto alpino
    let roca = cl(sst(.17, .34, s + (n2 - .5) * .2) * sst(10, 20, h) + sst(.4, .6, s) + sst(34, 46, h + (n - .5) * 14) * .7) * sst(5, 13, h);
    const ped = sst(.2, .3, s) * (1 - sst(.46, .56, s)) * sst(14, 26, h) * sst(.42, .58, n3);   // pedregales
    c = mix3(c, mix3(mix3(C.r2, C.r1, n), C.r3, sst(.6, .8, n2)), roca); c = mix3(c, C.ped, ped * .75); roca = Math.max(roca, ped * .8);
    const ns = h + (n - .5) * 16 + (n2 - .5) * 7 - sst(560, 760, x) * 26 - sst(330, 440, Math.abs(z)) * sst(240, 330, x) * 28; let nv = sst(44, 51, ns) * (1 - sst(.2, .34, s)); nv = Math.max(nv, sst(62, 72, ns) * (1 - sst(.42, .6, s)));
    c = mix3(c, mix3(C.nieS, C.nie, cl(ny * 1.2 - .1)), nv);
    if (x > RIO_X0 - 8) { const d = Math.abs(z - RIO(x)), w = cauce(x); c = mix3(c, C.ori, (1 - sst(w + .5, w + 3.5, d)) * .55); c = mix3(c, C.arena, (1 - sst(w * .5, w + .8, d)) * .7) }
    const sd = sendaD(x, z); if (sd < 2) c = mix3(c, mix3(C.tie, C.arena, n2), (1 - sst(.5, 1.7, sd + (n2 - .5) * .8)) * .85);
    return [c, roca * (1 - nv)] }

  // la malla: grilla de pasos variables (1 m en la cordillera, 1,5 m en el valle cercano, 3,5 m lejos), en bloques para que la cámara descarte lo que no ve
  const TERR = (() => { const xs = [], zs = []; for (let x = 100; x < 300; x += 1) xs.push(x); for (let x = 300; x < 660; x += 1.5) xs.push(x); for (let x = 660; x <= 1000; x += 3.5) xs.push(x);
    for (let z = -470; z < -240; z += 3) zs.push(z); for (let z = -240; z < 240; z += 1.25) zs.push(z); for (let z = 240; z <= 470; z += 3) zs.push(z);
    const NX = xs.length, NZ = zs.length, H = new Float32Array(NX * NZ); for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) H[j * NX + i] = ljAlt(xs[i], zs[j]);
    const hA = (i, j) => H[cl(j, 0, NZ - 1) * NX + cl(i, 0, NX - 1)];
    const BX = 72, BZ = 72, lista = [];
    for (let j0 = 0; j0 < NZ - 1; j0 += BZ) for (let i0 = 0; i0 < NX - 1; i0 += BX) { const i1 = Math.min(NX - 1, i0 + BX), j1 = Math.min(NZ - 1, j0 + BZ), nx = i1 - i0 + 1, nz = j1 - j0 + 1;
      const pos = new Float32Array(nx * nz * 3), nor = new Float32Array(nx * nz * 3), col = new Float32Array(nx * nz * 3), ro = new Float32Array(nx * nz), idx = [];
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const o = (j - j0) * nx + (i - i0), x = xs[i], z = zs[j], h = hA(i, j);
        const dx = xs[Math.min(NX - 1, i + 1)] - xs[Math.max(0, i - 1)], dz = zs[Math.min(NZ - 1, j + 1)] - zs[Math.max(0, j - 1)], gx = (hA(i + 1, j) - hA(i - 1, j)) / dx, gz = (hA(i, j + 1) - hA(i, j - 1)) / dz, l = Math.hypot(gx, 1, gz);
        pos.set([x, h, z], o * 3); nor.set([-gx / l, 1 / l, -gz / l], o * 3); const [c, k] = colorL(x, z, h, 1 / l); col.set(c, o * 3); ro[o] = k }
      for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) { const a = j * nx + i, b = a + nx; idx.push(a, b, a + 1, b, b + 1, a + 1) }
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); g.setAttribute("color", new THREE.BufferAttribute(col, 3)); g.setAttribute("aRoca", new THREE.BufferAttribute(ro, 1)); g.setIndex(idx); g.computeBoundingSphere();
      const m = new THREE.Mesh(g, M_TERR); m.receiveShadow = true; G.add(m); lista.push(m) }
    return lista })();
  const pend = (x, z) => { const e = 1, gx = (ljAlt(x + e, z) - ljAlt(x - e, z)) / 2, gz = (ljAlt(x, z + e) - ljAlt(x, z - e)) / 2; return 1 - 1 / Math.hypot(gx, 1, gz) };

  // ---------------- EL ARROYO (cinta de agua con reflejo, piedras en la orilla y un puentecito de tablas) ----------------
  const T_OLAS_L = T_OLAS.clone(); T_OLAS_L.repeat.set(1, 1); T_OLAS_L.needsUpdate = true;
  const M_AGUA_L = new THREE.MeshStandardMaterial({ color: "#5d97b4", roughness: .08, metalness: .15, normalMap: T_OLAS_L, normalScale: new THREE.Vector2(.25, .25), envMap: ENV_AGUA, envMapIntensity: 1.1, transparent: true, opacity: .9 });
  { const P = [], U = [], I = []; let n = 0; for (let x = RIO_X0; x <= 1000; x += 1) { const z = RIO(x), w = (cauce(x) + .45) * (1 - .45 * sst(640, 800, x)), y = aguaY(x); P.push(x, y, z - w, x, y, z + w); U.push(x / 7, 0, x / 7, w * 2 / 7); if (n) { const a = (n - 1) * 2; I.push(a, a + 1, a + 2, a + 1, a + 3, a + 2) } n++ }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(U, 2)); g.setIndex(I); g.computeVertexNormals(); const m = new THREE.Mesh(g, M_AGUA_L); m.receiveShadow = true; G.add(m) }

  // ---------------- MATERIALES PINTADOS (piedra de las casas, pizarra, paja, madera, corteza, hojas, roca, nubes) ----------------
  const T_PIEDRA_L = pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(7201); c.fillStyle = "#5d574e"; c.fillRect(0, 0, w, h); z.fillStyle = "#202020"; z.fillRect(0, 0, w, h); let y = 0;
    while (y < h) { const rh = 44 + r() * 46; let x = -r() * 60; while (x < w) { const sw = 50 + r() * 110, v = 130 + r() * 70, t = r(); const col = `rgb(${v + t * 26 | 0},${v + 6 - t * 8 | 0},${v - 18 + r() * 20 | 0})`;
        const pts = []; for (let k = 0; k < 9; k++) { const a = k / 9 * 6.283, ex = sw / 2 - 4 - r() * 5, ey = rh / 2 - 3 - r() * 5; pts.push([x + sw / 2 + Math.cos(a) * ex * (1 + (r() - .5) * .15), y + rh / 2 + Math.sin(a) * ey * (1 + (r() - .5) * .2)]) }
        for (const [g2, f] of [[c, col], [z, `rgb(${170 + r() * 70 | 0},${170 + r() * 70 | 0},${170 + r() * 70 | 0})`]]) { g2.fillStyle = f; g2.beginPath(); pts.forEach(([px, py], i) => i ? g2.lineTo(px, py) : g2.moveTo(px, py)); g2.closePath(); g2.fill() }
        c.fillStyle = "rgba(255,245,225,.12)"; c.beginPath(); c.ellipse(x + sw * .4, y + rh * .35, sw * .28, rh * .18, 0, 0, 7); c.fill();
        for (let q = 0; q < 6; q++) { c.fillStyle = r() < .5 ? "rgba(40,36,30,.18)" : "rgba(120,140,80,.16)"; c.beginPath(); c.arc(x + r() * sw, y + r() * rh, 2 + r() * 7, 0, 7); c.fill() } x += sw } y += rh }
    for (let k = 0; k < 160; k++) { c.fillStyle = `rgba(${70 + r() * 30 | 0},${100 + r() * 40 | 0},${40},${.12 + r() * .15})`; c.beginPath(); c.arc(r() * w, h * (.7 + r() * .3), 6 + r() * 22, 0, 7); c.fill() } });
  T_PIEDRA_L.forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping });
  const T_PIZARRA = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(7202); c.fillStyle = "#2c2f34"; c.fillRect(0, 0, w, h); z.fillStyle = "#202020"; z.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 30) { let x = (y / 30 % 2) * -24 - r() * 10; while (x < w) { const sw = 36 + r() * 26, v = 60 + r() * 40 | 0; c.fillStyle = `rgb(${v},${v + 4},${v + 12})`; c.fillRect(x + 1, y, sw - 2, 34); z.fillStyle = "#c0c0c0"; z.fillRect(x + 1, y, sw - 2, 28); z.fillStyle = "#ffffff"; z.fillRect(x + 1, y + 24, sw - 2, 6);
      c.fillStyle = "rgba(0,0,0,.35)"; c.fillRect(x + 1, y + 30, sw - 2, 3); if (r() < .12) { c.fillStyle = `rgba(${90 + r() * 40 | 0},${120 + r() * 30 | 0},50,.55)`; c.beginPath(); c.arc(x + r() * sw, y + r() * 30, 4 + r() * 10, 0, 7); c.fill() } x += sw } } });
  T_PIZARRA.forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping });
  const T_PAJA_L = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(7203); c.fillStyle = "#9c8448"; c.fillRect(0, 0, w, h); z.fillStyle = "#606060"; z.fillRect(0, 0, w, h);
    for (let k = 0; k < 5200; k++) { const x = r() * w, y = r() * h, l = 14 + r() * 36, v = r(); c.strokeStyle = v < .5 ? `rgba(${200 + r() * 40 | 0},${170 + r() * 40 | 0},${90 + r() * 30 | 0},.5)` : `rgba(${90 + r() * 30 | 0},${70 + r() * 20 | 0},${30},.45)`; c.lineWidth = 1 + r() * 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - .5) * 6, y + l); c.stroke(); z.strokeStyle = v < .5 ? "rgba(230,230,230,.6)" : "rgba(30,30,30,.5)"; z.lineWidth = 2; z.beginPath(); z.moveTo(x, y); z.lineTo(x, y + l); z.stroke() }
    for (let y = 0; y < h; y += 64) { c.fillStyle = "rgba(50,36,16,.35)"; c.fillRect(0, y + 56, w, 8); z.fillStyle = "rgba(0,0,0,.6)"; z.fillRect(0, y + 56, w, 8) } });
  T_PAJA_L.forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping });
  const T_MADERA_L = pintarDoble(256, 512, (c, z, w, h) => { const r = rng(7204); c.fillStyle = "#8a6440"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
    for (let k = 0; k < 140; k++) { const x = r() * w; c.strokeStyle = r() < .5 ? "rgba(60,38,20,.35)" : "rgba(200,160,110,.22)"; c.lineWidth = 1 + r() * 3; c.beginPath(); c.moveTo(x, 0); for (let y = 0; y <= h; y += 32) c.lineTo(x + Math.sin(y * .02 + k) * 4, y); c.stroke(); z.strokeStyle = "rgba(40,40,40,.4)"; z.lineWidth = 2; z.beginPath(); z.moveTo(x, 0); z.lineTo(x, h); z.stroke() }
    for (let k = 0; k < 8; k++) { c.fillStyle = "rgba(50,30,14,.6)"; c.beginPath(); c.ellipse(r() * w, r() * h, 5 + r() * 6, 9 + r() * 10, 0, 0, 7); c.fill() } });
  T_MADERA_L.forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping });
  const T_CORTEZA = pintarDoble(256, 512, (c, z, w, h) => { const r = rng(7205); c.fillStyle = "#6a5a4a"; c.fillRect(0, 0, w, h); z.fillStyle = "#909090"; z.fillRect(0, 0, w, h);
    for (let k = 0; k < 260; k++) { const x = r() * w, y = r() * h, l = 30 + r() * 120; c.strokeStyle = r() < .6 ? "rgba(30,24,18,.6)" : "rgba(170,160,140,.3)"; c.lineWidth = 2 + r() * 5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - .5) * 10, y + l); c.stroke(); z.strokeStyle = "rgba(0,0,0,.7)"; z.lineWidth = 4; z.beginPath(); z.moveTo(x, y); z.lineTo(x, y + l); z.stroke() }
    for (let k = 0; k < 40; k++) { c.fillStyle = "rgba(110,140,70,.3)"; c.beginPath(); c.arc(r() * w, r() * h, 4 + r() * 14, 0, 7); c.fill() } });
  T_CORTEZA.forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2) });
  const T_HOJAS = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(7206); c.fillStyle = "#7e906a"; c.fillRect(0, 0, w, h); z.fillStyle = "#303030"; z.fillRect(0, 0, w, h);
    for (let k = 0; k < 5200; k++) { const x = r() * w, y = r() * h, s = 4 + r() * 7, a = r() * 6.28, v = r(); envuelto(c, w, h, () => { c.fillStyle = `rgb(${150 + v * 105 | 0},${170 + v * 85 | 0},${120 + v * 80 | 0})`; c.beginPath(); c.ellipse(x, y, s, s * .5, a, 0, 7); c.fill() });
      envuelto(z, w, h, () => { z.fillStyle = `rgb(${120 + v * 135 | 0},${120 + v * 135 | 0},${120 + v * 135 | 0})`; z.beginPath(); z.ellipse(x, y, s, s * .5, a, 0, 7); z.fill() }) } });
  T_HOJAS.forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 2) });
  const T_ROCA_L = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(7207); c.fillStyle = "#c8c2b8"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
    for (let k = 0; k < 1400; k++) { const x = r() * w, y = r() * h, s = 3 + r() * 30; envuelto(c, w, h, () => { c.fillStyle = r() < .5 ? `rgba(70,64,58,${.08 + r() * .15})` : `rgba(255,252,245,${.08 + r() * .15})`; c.beginPath(); c.arc(x, y, s, 0, 7); c.fill() }) }
    for (let k = 0; k < 60; k++) { let x = r() * w, y = r() * h; c.strokeStyle = "rgba(40,36,30,.55)"; z.strokeStyle = "rgba(0,0,0,.8)"; c.lineWidth = 1.5; z.lineWidth = 4; c.beginPath(); z.beginPath(); c.moveTo(x, y); z.moveTo(x, y); for (let q = 0; q < 8; q++) { x += (r() - .5) * 40; y += r() * 24; c.lineTo(x, y); z.lineTo(x, y) } c.stroke(); z.stroke() }
    for (let k = 0; k < 90; k++) { c.fillStyle = `rgba(${150 + r() * 60 | 0},${160 + r() * 40 | 0},${90},${.2 + r() * .25})`; c.beginPath(); c.arc(r() * w, r() * h, 3 + r() * 12, 0, 7); c.fill() } });
  T_ROCA_L.forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping });
  const T_PUFF = tex(256, 256, (g, w, h) => { const r = rng(7208); g.clearRect(0, 0, w, h);
    for (let k = 0; k < 70; k++) { const a = r() * 6.28, d = r() * r() * 70, x = w / 2 + Math.cos(a) * d, y = h / 2 + Math.sin(a) * d * .7, s = 26 + r() * 46; const q = g.createRadialGradient(x, y, 0, x, y, s); q.addColorStop(0, `rgba(255,255,255,${.22 + r() * .2})`); q.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = q; g.fillRect(x - s, y - s, s * 2, s * 2) } });
  const M_PIEDRA_C = new THREE.MeshStandardMaterial({ map: T_PIEDRA_L[0], bumpMap: T_PIEDRA_L[1], bumpScale: 3, roughness: .95 });
  const M_PIZARRA = new THREE.MeshStandardMaterial({ map: T_PIZARRA[0], bumpMap: T_PIZARRA[1], bumpScale: 2.5, roughness: .7 });
  const M_PAJA_C = new THREE.MeshStandardMaterial({ map: T_PAJA_L[0], bumpMap: T_PAJA_L[1], bumpScale: 4, roughness: 1 });
  const M_MAD = new THREE.MeshStandardMaterial({ map: T_MADERA_L[0], bumpMap: T_MADERA_L[1], bumpScale: 2.5, roughness: .85 });
  const M_VIDRIO_L = new THREE.MeshStandardMaterial({ color: "#1c2630", roughness: .1, metalness: .4, envMap: ENV_AGUA, envMapIntensity: .7 });
  const M_VC = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .75 });
  const M_CORT = new THREE.MeshStandardMaterial({ name: "cort", map: T_CORTEZA[0], bumpMap: T_CORTEZA[1], bumpScale: 4, roughness: .95, vertexColors: true });
  const M_COPA = new THREE.MeshStandardMaterial({ name: "copa", map: T_HOJAS[0], bumpMap: T_HOJAS[1], bumpScale: 4, roughness: .85, vertexColors: true });
  const M_ROCA_I = new THREE.MeshStandardMaterial({ name: "roca", map: T_ROCA_L[0], bumpMap: T_ROCA_L[1], bumpScale: 4, roughness: .95, flatShading: true });

  // ---------------- ÁRBOLES (derechos y frondosos en el valle; pinos en la cordillera, torcidos del lado del viento) ----------------
  const cTronco = lin("#ffffff");
  function arbolGeo(seed, tipo) { const r = rng(seed), T = [], Cp = [];
    const H = [2.6, 3.2, 1.8, 2.2][tipo], cy = [H + 2.3, H + 2.9, H + 3.6, H + 1.4][tipo], rx = [2.7, 2.0, 1.15, 1.7][tipo], ry = [2.1, 2.9, 4.2, 1.5][tipo], nb = [9, 9, 12, 7][tipo];
    const tr = new THREE.CylinderGeometry(.17, .33, cy, 9, 6); { const p = tr.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i), k = 1 + (fbm(p.getX(i) * 3 + seed, y * 2 + p.getZ(i) * 3, 2) - .5) * .3 + (y < -cy / 2 + .5 ? (-cy / 2 + .5 - y) * .7 : 0); p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k) } tr.computeVertexNormals() }
    T.push([tr, TMx(0, cy / 2, 0), cTronco]);
    for (let k = 0; k < 5; k++) { const a = k / 5 * 6.283 + r() * .6, y0 = H * (.75 + r() * .2), L = rx * (.7 + r() * .3), up = ry * (.4 + r() * .5); T.push([...entre([0, y0, 0], [Math.cos(a) * L, y0 + up, Math.sin(a) * L], .07 + r() * .04, 6), cTronco]) }
    const cO = lin("#24501a"), cL = lin("#86c046"), cM = lin("#4f8a2c");
    for (let k = 0; k < nb; k++) { const a = r() * 6.283, u = r() * 2 - 1, rr = Math.sqrt(1 - u * u) * (.55 + r() * .4), x = Math.cos(a) * rr * rx, z = Math.sin(a) * rr * rx, y = cy + u * ry * .62, s = (tipo === 2 ? .7 : 1.05) + r() * .55;
      Cp.push([bulto(seed * 13 + k, 2, .2, 1.8), TMx(x, y, z, r(), r() * 6, r(), s * (tipo === 2 ? 1 : 1.15), s * (tipo === 2 ? 1.2 : .92), s * (tipo === 2 ? 1 : 1.15)), (X, Y, Z) => { const q = cl((Y - (cy - ry)) / (ry * 2)), nn = fbm(X * 1.7 + seed, Z * 1.7 + Y, 2); return mix3(mix3(cO, cM, q * 1.2), cL, cl(q * q * .9 + (nn - .5) * .5)) }]) }
    Cp.push([bulto(seed * 13 + 99, 2, .15, 1.4), TMx(0, cy, 0, 0, 0, 0, rx * .85, ry * .8, rx * .85), (X, Y) => mix3(cO, cM, cl((Y - cy + ry) / (ry * 2)))]);
    return [mergeC(T), mergeC(Cp), cy + ry] }
  function arbolLejos(seed) { const r = rng(seed); return [mergeC([[new THREE.CylinderGeometry(.15, .25, 3, 6), TMx(0, 1.5, 0), cTronco]]), mergeC([[bulto(seed, 1, .22, 1.6), TMx(0, 4.2, 0, 0, r() * 6, 0, 1.9, 2.5, 1.9), (X, Y) => mix3(lin("#28501c"), lin("#6aa83a"), cl((Y - 2) / 4.5))]]), 6.5] }
  function pinoGeo(seed, torcido) { const r = rng(seed), T = [], Cp = [], Ht = 8.5, b = y => torcido ? (y / Ht) ** 2 * 1.6 : 0;
    const tr = new THREE.CylinderGeometry(.1, .26, Ht, 7, 8); { const p = tr.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i) + Ht / 2; p.setX(i, p.getX(i) + b(y)) } tr.computeVertexNormals() } T.push([tr, TMx(0, Ht / 2, 0), cTronco]);
    for (let k = 0; k < 6; k++) { const y = 1.8 + k * 1.05, R = (1.9 - k * .27) * (torcido ? .85 : 1), cn = new THREE.ConeGeometry(R, 1.9, 9, 2, true), p = cn.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), yy = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x), kk = 1 + (fbm(Math.cos(a) * 2 + k, Math.sin(a) * 2 + seed, 2) - .5) * .5; let xx = x * kk, zz = z * kk; if (torcido) { if (xx < 0) xx *= .35; xx += .5 + k * .12 } p.setXYZ(i, xx, yy - (yy < 0 ? .25 * (1 - Math.abs(Math.cos(a * 4))) : 0), zz) }
      cn.computeVertexNormals(); Cp.push([cn, TMx(b(y), y, 0, 0, r() * 6, 0), (X, Y) => mix3(lin("#1d3a20"), lin("#4a7a3c"), cl((Y - y + 1) / 2.2))]) }
    return [mergeC(T), mergeC(Cp), Ht] }
  const AV = [0, 1, 2, 3].map(t => arbolGeo(7300 + t * 11, t)), AL = arbolLejos(7350), PR = pinoGeo(7360, false), PT = pinoGeo(7361, true);
  const ARBOLES = [], ARB_LOD = [];   // { x, y, z, s, v (variante), h (alto de la copa) } de los árboles cercanos (para colgar cometas)
  const libreAt = (x, z, r = 0) => Math.hypot(x - ATX, z - ATZ) > 12 + r && Math.hypot(x - CPX, z - CPZ) > 6 + r && CASAS_P.every(([cx, cz]) => Math.hypot(x - cx, z - cz) > 10 + r) && (x < RIO_X0 - 6 || Math.abs(z - RIO(x)) > cauce(x) + 2.6 + r) && sendaD(x, z) > 1.8 + r && Math.hypot(x - PUENTE[0], z - PUENTE[1]) > 7 && !(x > 370 && x < ATX + 4 && Math.abs(z - ATZ) < 10 + r);   // pasillo libre para la bajada final del vuelo
  { const r = rng(7400), L = [[], [], [], []], LL = [], LP = [], LT = [], ok = (x, z, d) => ARBOLES.every(a => Math.hypot(a.x - x, a.z - z) > d);
    const pon = (x, z, v, s) => { if (!libreAt(x, z) || !ok(x, z, 3.2 * s)) return; const y = ljAlt(x, z) - .15; L[v].push({ p: [x, y, z], ry: r() * 6.283, s: [s, s * (.9 + r() * .2), s], c: mix3([1, 1, 1], lin(["#d8f0a0", "#fff0c0", "#c0e0b0", "#e8f8c8"][r() * 4 | 0]), r() * .6) }); ARBOLES.push({ x, y, z, s, v, h: AV[v][2] * s }) };
    for (let x = RIO_X0 + 8; x < 900; x += 5 + r() * 7) for (const sd of [-1, 1]) if (r() < .55) { const z = RIO(x) + sd * (cauce(x) + 3.5 + r() * 6); pon(x, z, r() < .6 ? 1 : 0, .85 + r() * .4) }
    for (let g = 0; g < 14; g++) { const cx = 300 + r() * 420, cz = (r() - .5) * 250; const n = 6 + r() * 14 | 0; for (let k = 0; k < n; k++) { const a = r() * 6.283, d = r() * 16; pon(cx + Math.cos(a) * d, cz + Math.sin(a) * d * .8, r() < .25 ? 2 : r() < .6 ? 0 : 1, .8 + r() * .5) } }
    for (let k = 0; k < 170; k++) pon(290 + r() * 480, (r() - .5) * 280, r() < .15 ? 2 : r() < .55 ? 0 : 1, .75 + r() * .55);
    CASAS_P.forEach(([cx, cz, ry], i) => { for (let k = 0; k < 7; k++) { const u = (k % 4) - 1.5, w = Math.floor(k / 4); const lx = 11 + w * 5, lz = u * 5; pon(cx + Math.cos(ry) * lx + Math.sin(ry) * lz, cz - Math.sin(ry) * lx + Math.cos(ry) * lz, 3, .7 + r() * .25) } });
    // bosques en las lomas y faldas (árbol simple, lejos)
    for (let k = 0; k < 9000 && LL.length < 2600; k++) { const x = 205 + r() * 790, z = (r() - .5) * 930, h = ljAlt(x, z); if (h < 5 || h > 40 || fbm(x * .02 + 3, z * .02, 2) < .47 || !libreAt(x, z) || pend(x, z) > .45) continue; if (Math.abs(z) < 130 && x < 760 && h < 9) continue; const s = .8 + r() * .6; LL.push({ p: [x, h - .2, z], ry: r() * 6.283, s: [s, s * (.85 + r() * .35), s], c: mix3([1, 1, 1], lin("#b8d890"), r() * .7) }) }
    // pinos: derechos del lado del valle, torcidos (hacia +x) del lado del viento
    for (let k = 0; k < 6000 && LP.length + LT.length < 900; k++) { const x = 104 + r() * 160, z = (r() - .5) * 900, h = ljAlt(x, z); if (h < 6 || h > 34 || pend(x, z) > .5) continue; const w = x < SIERRA_X - 8; if (w && r() < .55) continue; const s = .7 + r() * .55; (w ? LT : LP).push({ p: [x, h - .2, z], ry: w ? (r() - .5) * .3 : r() * 6.283, s: [s, s * (.8 + r() * .4), s], c: mix3([1, 1, 1], lin("#c0d0a0"), r() * .6) }) }
    const conj = (geo, Ls, lod) => { const a = instancias(geo[0], M_CORT, Ls, { celda: 130 }), b = instancias(geo[1], M_COPA, Ls, { celda: 130 }); if (lod) [...a, ...b].forEach(m => { m.computeBoundingSphere(); ARB_LOD.push(m) }) };
    AV.forEach((g, v) => conj(g, L[v], true)); conj(AL, LL); conj(PR, LP); conj(PT, LT) }

  // ---------------- CASITAS DE PIEDRA con humo que sube DERECHO, cercos, leña, huerta, el puentecito ----------------
  const cajaUV = (w, h, d, esc = 2.5) => { const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]]; for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / esc, uv.getY(i) * dims[f][1] / esc) } return g };
  const HUMO_PTS = [];
  { const LP = [], LZ = [], LJ = [], LM = [], LV = [], LC = [], r = rng(7500);
    CASAS_P.forEach(([px, pz, ry], i) => { const W = 5 + r() * 1.6, D = 4 + r() * .8, Hw = 2.6 + r() * .5, rh = 1.7 + r() * .5, paja = i % 2 === 1;
      let y0 = 1e9; for (const [a, b] of [[-W / 2, -D / 2], [W / 2, -D / 2], [-W / 2, D / 2], [W / 2, D / 2], [0, 0]]) y0 = Math.min(y0, ljAlt(px + Math.cos(ry) * a + Math.sin(ry) * b, pz - Math.sin(ry) * a + Math.cos(ry) * b));
      const B = TMx(px, y0 - .1, pz, 0, ry, 0), add = (L, g, m, c) => L.push([g, B.clone().multiply(m), c]), wpt = (x, y, z) => new THREE.Vector3(x, y, z).applyMatrix4(B);
      add(LP, cajaUV(W, Hw, D), TMx(0, Hw / 2, 0)); add(LP, cajaUV(W + .4, .6, D + .4, 1.6), TMx(0, .2, 0));
      for (const s of [-1, 1]) { const sh = new THREE.Shape(); sh.moveTo(-D / 2, 0); sh.lineTo(D / 2, 0); sh.lineTo(0, rh); sh.closePath(); const g = new THREE.ShapeGeometry(sh); const uv = g.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) / 2.5, uv.getY(k) / 2.5); add(LP, g, TMx(s * W / 2, Hw, 0, 0, s * Math.PI / 2, 0)) }
      const ov = .5, a = Math.atan2(rh, D / 2), sl = Math.hypot(D / 2 + ov, rh + ov * Math.tan(a)), th = paja ? .45 : .16;
      for (const s of [-1, 1]) add(paja ? LJ : LZ, cajaUV(W + .8, th, sl, paja ? 2 : 1.6), TMx(0, Hw + rh / 2 - ov * Math.tan(a) / 2 + th / 2, s * (D / 2 + ov) / 2, s * a, 0, 0));
      add(LM, new THREE.CylinderGeometry(.13, .13, W + .9, 8), TMx(0, Hw + rh + th * .8, 0, 0, 0, Math.PI / 2));
      const chx = W / 2 - .75, chz = -D / 4, chH = rh + 1.7; add(LP, cajaUV(.8, chH, .8, 1.4), TMx(chx, Hw - .3 + chH / 2, chz)); add(LP, cajaUV(1, .18, 1, 1.4), TMx(chx, Hw - .3 + chH + .09, chz));
      HUMO_PTS.push(wpt(chx, Hw - .3 + chH + .3, chz));
      const dx = (r() - .5) * 1.4; add(LM, cajaUV(1.05, 2, .14, 1.2), TMx(dx, 1.0 + .15, D / 2 + .04)); add(LP, cajaUV(1.5, .3, .3, 1.2), TMx(dx, 2.3, D / 2 + .08));
      const pc = lin(["#3d6aa8", "#2f8a6a", "#a83a2a", "#d8a83a", "#5a8a3a", "#7a4a8a"][i]);
      for (const wx of [-W / 2 + 1.05, W / 2 - 1.05]) { if (Math.abs(wx - dx) < 1.2) continue; add(LV, new THREE.BoxGeometry(.78, .82, .06), TMx(wx, 1.65, D / 2 + .02));
        for (const [ox, oy, w, h] of [[0, .46, .95, .1], [0, -.46, .95, .1], [-.43, 0, .1, .9], [.43, 0, .1, .9], [0, 0, .05, .82]]) add(LM, new THREE.BoxGeometry(w, h, .1), TMx(wx + ox, 1.65 + oy, D / 2 + .05));
        for (const s of [-1, 1]) add(LC, new THREE.BoxGeometry(.42, .9, .05), TMx(wx + s * .7, 1.65, D / 2 + .1, 0, s * .5, 0), pc);
        add(LM, new THREE.BoxGeometry(.9, .2, .25), TMx(wx, 1.15, D / 2 + .16)); for (let k = 0; k < 6; k++) add(LC, new THREE.IcosahedronGeometry(.07, 0), TMx(wx - .36 + k * .145, 1.3, D / 2 + .17), lin(["#e8423a", "#f4e04a", "#ffffff", "#e86aa8"][(k + i) % 4])) }
      add(LV, new THREE.BoxGeometry(.7, .7, .06), TMx(-W / 4, 1.7, -D / 2 - .02)); add(LV, new THREE.BoxGeometry(.06, .7, .7), TMx(-W / 2 - .02, 1.7, .5));
      // banco, leña, barril
      add(LM, cajaUV(1.4, .08, .4, 1), TMx(dx + 1.6 * (dx > 0 ? -1 : 1), .55, D / 2 + .5)); for (const s of [-1, 1]) add(LM, new THREE.BoxGeometry(.08, .45, .35), TMx(dx + 1.6 * (dx > 0 ? -1 : 1) + s * .55, .28, D / 2 + .5));
      for (let k = 0; k < 14; k++) { const row = Math.floor(k / 5), c = k % 5; add(LM, new THREE.CylinderGeometry(.12, .12, 1.1, 7), TMx(-W / 2 - .45, .12 + row * .22, -D / 2 + .6 + c * .25 + row * .12, Math.PI / 2, 0, 0)) }
      add(LM, new THREE.CylinderGeometry(.3, .27, .8, 10), TMx(W / 2 + .5, .4, D / 2 - .4));
      // cerco de palos y huerta
      const ex = W / 2 + 4.5, ez = D / 2 + 4; const post = (lx, lz) => { const w = wpt(lx, 0, lz); w.y = ljAlt(w.x, w.z); LM.push([new THREE.BoxGeometry(.11, 1.1, .11), TMx(w.x, w.y + .45, w.z, (r() - .5) * .08, ry, (r() - .5) * .08)]); return w };
      const lado = (x0, z0, x1, z1, puerta) => { const n = Math.max(2, Math.round(Math.hypot(x1 - x0, z1 - z0) / 1.8)); let prev = null; for (let k = 0; k <= n; k++) { const u = k / n; if (puerta && Math.abs(u - .5) < .12) { prev = null; continue } const w = post(lerp(x0, x1, u), lerp(z0, z1, u)); if (prev) for (const hy of [.35, .8]) LM.push([...entre([prev.x, prev.y + hy, prev.z], [w.x, w.y + hy, w.z], .035, 4)]); prev = w } };
      lado(-ex, ez, ex, ez, true); lado(ex, ez, ex, -ez); lado(ex, -ez, -ex, -ez); lado(-ex, -ez, -ex, ez);
      for (let k = 0; k < 4; k++) for (let q = 0; q < 7; q++) { const w = wpt(W / 2 + 1.2 + k * .75, 0, -D / 2 + q * .7); w.y = ljAlt(w.x, w.z); LC.push([new THREE.IcosahedronGeometry(.2 + r() * .08, 1), TMx(w.x, w.y + .12, w.z, 0, r() * 6, 0, 1, .7, 1), lin(["#4a8a2a", "#6aa83a", "#3a7424"][r() * 3 | 0])]) } });
    // el puentecito de tablas sobre el arroyo
    { const [bx, bz] = PUENTE, y = aguaY(bx) + .75; for (let k = 0; k < 18; k++) LM.push([cajaUV(1.7, .1, .38, 1), TMx(bx + (r() - .5) * .08, y + Math.sin(k / 17 * Math.PI) * .25, bz - 4.2 + k * .5, 0, (r() - .5) * .06, 0)]);
      for (const s of [-1, 1]) { LM.push([...entre([bx + s * .8, y - .1, bz - 4.4], [bx + s * .8, y + .15, bz + 4.4], .08, 6)]); for (let k = 0; k < 5; k++) { const z = bz - 4 + k * 2; LM.push([...entre([bx + s * .8, y - .6, z], [bx + s * .8, y + .95, z], .06, 6)]) } LM.push([...entre([bx + s * .8, y + .9, bz - 4], [bx + s * .8, y + .9, bz + 4], .045, 5)]) } }
    for (const [L, M] of [[LP, M_PIEDRA_C], [LZ, M_PIZARRA], [LJ, M_PAJA_C], [LM, M_MAD], [LV, M_VIDRIO_L], [LC, M_VC]]) { if (!L.length) continue; const m = new THREE.Mesh(mergeC(L), M); m.castShadow = m.receiveShadow = true; G.add(m) } }
  const HUMO_L = HUMO_PTS.map((p, i) => Array.from({ length: 12 }, (_, k) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: T_PUFF, color: "#efebe4", transparent: true, opacity: 0, depthWrite: false })); G.add(s); return { s, p, f: k / 12 + i * .29 } })).flat();

  // ---------------- PIEDRAS: pedregales y bloques en la cordillera, cantos del arroyo, pircas en el valle ----------------
  { const r = rng(7600), gs = [piedraG(1, 1, .7), piedraG(2, 1, .55), piedraG(3, 2, .8)], L = [[], [], []], col = () => mix3(lin("#9a9288"), lin(["#7a746a", "#b0a898", "#8a8478", "#a09078"][r() * 4 | 0]), r());
    const pon = (x, z, s, ach = 1) => { const v = r() * 3 | 0; L[v].push({ p: [x, ljAlt(x, z) - s * .18, z], rx: (r() - .5) * .5, ry: r() * 6.283, rz: (r() - .5) * .5, s: [s * (1 + r() * .5), s * ach, s], c: col() }) };
    for (let k = 0; k < 26000 && L[0].length + L[1].length + L[2].length < 4200; k++) { const x = 104 + r() * 190, z = (r() - .5) * 900, h = ljAlt(x, z), sp = pend(x, z); if (h < 8 || sp < .16 || sp > .6 || (h > 50 && sp < .3)) continue; pon(x, z, .3 + r() * r() * 1.9) }
    for (let k = 0; k < 260; k++) { const x = 110 + r() * 170, z = (r() - .5) * 800, h = ljAlt(x, z); if (h < 10 || h > 60) continue; pon(x, z, 2 + r() * 2.6, .8) }
    for (let x = RIO_X0; x < 900; x += .9 + r() * 1.6) { const sd = r() < .5 ? -1 : 1, z = RIO(x) + sd * (cauce(x) + .3 + r() * 1.4); if (Math.hypot(x - PUENTE[0], z - PUENTE[1]) < 3) continue; pon(x, z, .2 + r() * .45, .6) }
    for (let k = 0; k < 50; k++) { const x = 300 + r() * 420, z = (r() - .5) * 260; if (!libreAt(x, z, 1)) continue; pon(x, z, .5 + r() * 1.3, .7) }
    for (const [x0, z0, x1, z1] of [[380, 110, 470, 128], [470, 128, 520, 104], [600, 100, 700, 70], [330, -110, 430, -125], [640, -60, 720, -40]]) { const n = Math.hypot(x1 - x0, z1 - z0) / .55 | 0; for (let k = 0; k < n; k++) for (let q = 0; q < 2; q++) { const u = k / n, x = lerp(x0, x1, u) + (r() - .5) * .2, z = lerp(z0, z1, u) + (r() - .5) * .2, s = .32 + r() * .14, v = r() * 3 | 0; L[v].push({ p: [x, ljAlt(x, z) + .15 + q * .42, z], ry: r() * 6.283, rx: (r() - .5) * .3, s: [s * 1.3, s * .8, s], c: col() }) } }
    gs.forEach((g, v) => instancias(g, M_ROCA_I, L[v], { celda: 130 })) }

  // ---------------- PASTO ALTO, FLORES 3D Y MATAS (quieto: aquí no hay viento) ----------------
  function matoGeo(seed, nb = 7) { const r = rng(seed), P = [], Cc = [], I = [], cB = lin("#467a24"), cM = lin("#68aa34"), cT = lin("#c4ec80");
    for (let b = 0; b < nb; b++) { const a = r() * 6.283, d = r() * .12, x0 = Math.cos(a) * d, z0 = Math.sin(a) * d, H = .24 + r() * .3, lean = .05 + r() * .15, ang = a + (r() - .5) * 1.2, wB = .02 + r() * .014, tint = r(), dx = Math.cos(ang), dz = Math.sin(ang), px = -dz, pz = dx, base = P.length / 3;
      [0, .35, .7, 1].forEach((s, k) => { const y = H * s, off = lean * s * s, w = wB * (1 - s) ** .7, cx = x0 + dx * off, cz = z0 + dz * off, cc = mix3(mix3(cB, cM, Math.min(1, s * 1.6)), cT, s * s * (.5 + tint * .5)); if (k < 3) { P.push(cx - px * w, y, cz - pz * w, cx + px * w, y, cz + pz * w); Cc.push(...cc, ...cc) } else { P.push(cx, y, cz); Cc.push(...cc) } });
      for (let k = 0; k < 2; k++) { const o = base + k * 2; I.push(o, o + 1, o + 2, o + 1, o + 3, o + 2) } I.push(base + 4, base + 5, base + 6) }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(Cc, 3)); g.setIndex(I); const N = new Float32Array(P.length); for (let i = 0; i < N.length; i += 3) { N[i] = P[i] * 2; N[i + 1] = 1; N[i + 2] = P[i + 2] * 2 } g.setAttribute("normal", new THREE.BufferAttribute(N, 3)); g.normalizeNormals(); return g }
  function florGeo(H) { const L = [[new THREE.CylinderGeometry(.006, .009, H, 4), TMx(0, H / 2, 0), lin("#3f7a24")], [new THREE.SphereGeometry(.024, 7, 4), TMx(0, H + .005, 0, 0, 0, 0, 1, .6, 1), lin("#f2c21e")]];
    for (const s of [-1, 1]) { const g = new THREE.PlaneGeometry(.035, .11); g.translate(0, .055, 0); L.push([g, TMx(0, H * .35, 0, .9 * s, s > 0 ? 0 : Math.PI, 0), lin("#4a8a2a")]) }
    const P = []; for (let k = 0; k < 7; k++) { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0, .025, 0, .02, .065, 0, 0, .025, 0, -.02], 3)); g.setIndex([0, 1, 2, 0, 2, 3]); g.computeVertexNormals(); g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2)); P.push([g, TMx(0, H, 0, 0, k / 7 * 6.283, -.35)]) }
    return [mergeC(L), mergeC(P)] }
  const KITE_HASH = new Map(), kKey = (x, z) => Math.floor(x / 2) + "_" + Math.floor(z / 2);
  const enCometa = (x, z) => { const i = Math.floor(x / 2), j = Math.floor(z / 2); for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const L = KITE_HASH.get((i + a) + "_" + (j + b)); if (L) for (const [kx, kz, kr] of L) if (Math.hypot(x - kx, z - kz) < kr) return true } return false };
  const ponHuella = (x, z, rr) => { const k = kKey(x, z); (KITE_HASH.get(k) || KITE_HASH.set(k, []).get(k)).push([x, z, rr]) };

  // ---------------- LAS COMETAS (geometría reutilizable, texturas pintadas a mano, cientos tiradas en el pasto) ----------------
  const GEO_K = {};
  function cometaGeo(tipo = "rombo") { if (GEO_K[tipo]) return GEO_K[tipo];
    const P = [], U = [], L = []; let bb, poly, cola = null, ancla, lado = .02, pie = .02;
    const tri = (...pts) => pts.forEach(p => { P.push(p[0], p[1], p[2] || 0); U.push((p[0] - bb[0]) / (bb[2] - bb[0]), .07 + .93 * (p[1] - bb[1]) / (bb[3] - bb[1])) });
    const vara = (a, b, r = .007) => L.push(entre(a, b, r, 5));
    if (tipo === "rombo") { const T = [0, .62, 0], Lf = [-.36, .18, -.05], Rt = [.36, .18, -.05], B = [0, -.38, 0], Cn = [0, .18, .015]; bb = [-.36, -.38, .36, .62]; tri(T, Lf, Cn, T, Cn, Rt, Lf, B, Cn, Cn, B, Rt); vara([0, .62, -.012], [0, -.38, -.012]); vara([-.36, .18, -.06], [.36, .18, -.06]); poly = [T, Rt, B, Lf]; cola = new THREE.Vector3(0, -.38, 0); ancla = new THREE.Vector3(0, .24, .32) }
    else if (tipo === "delta") { const A = [0, .5, 0], Lw = [-.62, -.22, -.04], Rw = [.62, -.22, -.04], N = [0, -.1, 0]; bb = [-.62, -.22, .62, .5]; tri(A, Lw, N, A, N, Rw); const k0 = [0, .28, 0], k1 = [0, -.06, 0], k2 = [0, .06, -.2]; tri(k0, k1, k2); vara([0, .5, -.01], [0, -.1, -.01]); vara(A, Lw, .006); vara(A, Rw, .006); vara([-.31, .14, -.03], [.31, .14, -.03], .006); poly = [A, Rw, N, Lw]; cola = new THREE.Vector3(0, -.1, 0); ancla = new THREE.Vector3(0, .1, .3) }
    else if (tipo === "hexa") { const v = Array.from({ length: 6 }, (_, k) => { const a = Math.PI / 2 + k * Math.PI / 3; return [Math.cos(a) * .42, .05 + Math.sin(a) * .42, k % 3 === 0 ? 0 : -.03] }), c0 = [0, .05, .02]; bb = [-.364, -.37, .364, .47]; for (let k = 0; k < 6; k++) tri(v[k], v[(k + 1) % 6], c0); for (let k = 0; k < 3; k++) vara([v[k][0], v[k][1], -.04], [v[k + 3][0], v[k + 3][1], -.04]); poly = [v[0], v[5], v[4], v[3], v[2], v[1]]; cola = new THREE.Vector3(0, -.37, 0); ancla = new THREE.Vector3(0, .15, .3) }
    else { const a = .16; bb = [0, 0, 1, 1]; for (const [y0, y1] of [[.18, .5], [-.5, -.18]]) { const q = (p0, p1, p2, p3) => { const s = [p0, p1, p2, p3]; const uvq = [[0, .07], [1, .07], [1, 1], [0, 1]]; for (const ix of [0, 1, 2, 0, 2, 3]) { P.push(...s[ix]); U.push(...uvq[ix]) } };
        q([-a, y0, a], [a, y0, a], [a, y1, a], [-a, y1, a]); q([a, y0, a], [a, y0, -a], [a, y1, -a], [a, y1, a]); q([a, y0, -a], [-a, y0, -a], [-a, y1, -a], [a, y1, -a]); q([-a, y0, -a], [-a, y0, a], [-a, y1, a], [-a, y1, -a]) }
      for (const [x, z] of [[-a, -a], [a, -a], [a, a], [-a, a]]) vara([x, -.52, z], [x, .52, z], .008); vara([-a, .34, -a], [a, .34, a], .006); vara([a, .34, -a], [-a, .34, a], .006); vara([-a, -.34, -a], [a, -.34, a], .006); vara([a, -.34, -a], [-a, -.34, a], .006);
      poly = [[0, .07], [1, .07], [1, 1], [0, 1]].map(([u, v]) => [u, v]); ancla = new THREE.Vector3(0, .3, .4); lado = .17; pie = .17 }
    const cara = new THREE.BufferGeometry(); cara.setAttribute("position", new THREE.Float32BufferAttribute(P, 3)); cara.setAttribute("uv", new THREE.Float32BufferAttribute(U, 2)); cara.computeVertexNormals();
    L.forEach(([g]) => { const uv = g.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setXY(k, .5, .03) });
    const geo = mergeC([[cara, null], ...L]);
    const polyUV = tipo === "caja" ? poly : poly.map(p => [(p[0] - bb[0]) / (bb[2] - bb[0]), .07 + .93 * (p[1] - bb[1]) / (bb[3] - bb[1])]);
    const cen = tipo === "rombo" ? [.5, .07 + .93 * .56] : tipo === "delta" ? [.5, .07 + .93 * .45] : tipo === "hexa" ? [.5, .07 + .93 * .5] : [.5, .535];
    return (GEO_K[tipo] = { geo, polyUV, cen, cola, ancla, pie, tipo }) }
  const PALETA = ["#d8322a", "#f2c12e", "#2a6fd0", "#3fa34d", "#f07a22", "#7b3fb0", "#e85a9a", "#f4efe2", "#1fa3a3", "#262626", "#8fd14f", "#ff9ec4", "#c8e0f8", "#ffffff"];
  // pinta la tela de una cometa: dis = cuartos | rayas | ojo | arco | chevron | estrella | cuadros | luna | sol (la de Pip); gast = 0..1 (vieja, sucia, desteñida)
  function pintaCometa(g, S, poly, cen, dis, cols, gast, seed) { const r = rng(seed), H = S * .93, cx = cen[0] * S, cy = (1 - cen[1]) * S, [A, B, Cc, D] = cols;
    g.fillStyle = "#8a6034"; g.fillRect(0, H, S, S - H); for (let k = 0; k < 20; k++) { g.fillStyle = r() < .5 ? "rgba(60,36,16,.4)" : "rgba(200,150,90,.3)"; g.fillRect(r() * S, H + r() * (S - H), 10 + r() * 30, 2) }
    g.save(); g.beginPath(); g.rect(0, 0, S, H); g.clip(); g.fillStyle = A; g.fillRect(0, 0, S, H);
    const estrella = (x, y, R, n = 5) => { g.beginPath(); for (let k = 0; k <= n * 2; k++) { const a = -Math.PI / 2 + k * Math.PI / n, rr = k % 2 ? R * .45 : R; k ? g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : g.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) } g.closePath() };
    if (dis === "cuartos") { g.fillStyle = B; g.fillRect(cx, 0, S, cy); g.fillRect(0, cy, cx, H) }
    else if (dis === "rayas") { let y = 0, k = 0; while (y < H) { const hh = S * (.08 + r() * .14); g.fillStyle = cols[k++ % cols.length]; g.fillRect(0, y, S, hh + 1); y += hh } }
    else if (dis === "ojo") { for (const [c, f] of [[B, .4], [A, .29], [Cc, .18], ["#1a1a1a", .07]]) { g.fillStyle = c; g.beginPath(); g.arc(cx, cy, S * f, 0, 7); g.fill() } }
    else if (dis === "arco") { ["#d8322a", "#f07a22", "#f2c12e", "#3fa34d", "#2a6fd0", "#7b3fb0"].forEach((c, k) => { g.strokeStyle = c; g.lineWidth = S * .055; g.beginPath(); g.arc(cx, cy + S * .3, S * (.5 - k * .055), Math.PI, 0); g.stroke() }) }
    else if (dis === "chevron") { for (let k = -2; k < 8; k++) { g.fillStyle = k % 2 ? B : Cc; g.beginPath(); const y = k * S * .14; g.moveTo(0, y); g.lineTo(cx, y + S * .22); g.lineTo(S, y); g.lineTo(S, y + S * .07); g.lineTo(cx, y + S * .29); g.lineTo(0, y + S * .07); g.closePath(); g.fill() } }
    else if (dis === "estrella") { g.fillStyle = Cc; estrella(cx, cy, S * .34); g.fill(); g.fillStyle = B; estrella(cx, cy, S * .26); g.fill() }
    else if (dis === "cuadros") { const n = 5, q = S / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if ((i + j) % 2) { g.fillStyle = B; g.beginPath(); g.moveTo(i * q + (r() - .5) * 6, j * q + (r() - .5) * 6); g.lineTo((i + 1) * q + (r() - .5) * 6, j * q + (r() - .5) * 6); g.lineTo((i + 1) * q + (r() - .5) * 6, (j + 1) * q + (r() - .5) * 6); g.lineTo(i * q + (r() - .5) * 6, (j + 1) * q + (r() - .5) * 6); g.fill() } }
    else if (dis === "luna") { g.fillStyle = B; g.beginPath(); g.arc(cx, cy, S * .22, 0, 7); g.fill(); g.fillStyle = A; g.beginPath(); g.arc(cx + S * .09, cy - S * .05, S * .19, 0, 7); g.fill(); g.fillStyle = Cc; for (let k = 0; k < 14; k++) { estrella(r() * S, r() * H, 4 + r() * 6); g.fill() } }
    else if (dis === "sol") { // la de Pip: sol con cara, rayos, «PIP» con letra de nena, borde rojo
      g.fillStyle = B; g.beginPath(); for (let k = 0; k < 14; k++) { const a = k / 14 * 6.283 + .1, a2 = a + .2, R1 = S * .17, R2 = S * (.27 + (k % 2) * .04); g.moveTo(cx + Math.cos(a - .12) * R1, cy + Math.sin(a - .12) * R1); g.lineTo(cx + Math.cos(a + .02) * R2, cy + Math.sin(a + .02) * R2); g.lineTo(cx + Math.cos(a2 - .05) * R1, cy + Math.sin(a2 - .05) * R1) } g.fill();
      g.beginPath(); g.arc(cx, cy, S * .16, 0, 7); g.fill(); g.strokeStyle = "#5a1410"; g.lineWidth = S * .012; g.stroke();
      g.fillStyle = "#3a0e0a"; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(cx + s * S * .055, cy - S * .035, S * .016, S * .026, 0, 0, 7); g.fill() } g.strokeStyle = "#3a0e0a"; g.lineWidth = S * .014; g.lineCap = "round"; g.beginPath(); g.arc(cx, cy + S * .0, S * .075, .35, Math.PI - .35); g.stroke();
      g.fillStyle = "rgba(255,150,120,.55)"; for (const s of [-1, 1]) { g.beginPath(); g.arc(cx + s * S * .1, cy + S * .03, S * .022, 0, 7); g.fill() }
      g.fillStyle = B; g.font = `900 ${S * .13 | 0}px "Baloo 2", "Comic Sans MS", sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; ["P", "I", "P"].forEach((ch, k) => { g.save(); g.translate(cx + (k - 1) * S * .1, cy + S * .3); g.rotate((k - 1) * .12 + (r() - .5) * .1); g.fillText(ch, 0, 0); g.restore() });
      g.lineWidth = S * .05; g.strokeStyle = B; g.beginPath(); poly.forEach(([u, v], i) => i ? g.lineTo(u * S, (1 - v) * S) : g.moveTo(u * S, (1 - v) * S)); g.closePath(); g.stroke() }
    // trazo de crayón y tela: rayitas, costura del borde, arrugas; y el paso de los años (desteñido, manchas, pasto)
    for (let k = 0; k < 500; k++) { g.strokeStyle = r() < .5 ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.06)"; g.lineWidth = 1 + r() * 2; const x = r() * S, y = r() * H; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 6 + r() * 14, y + (r() - .5) * 4); g.stroke() }
    g.setLineDash([5, 5]); g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 2; g.beginPath(); poly.forEach(([u, v], i) => { const x = lerp(u * S, cx, .05), y = lerp((1 - v) * S, cy, .05); i ? g.lineTo(x, y) : g.moveTo(x, y) }); g.closePath(); g.stroke(); g.setLineDash([]);
    for (let k = 0; k < 6; k++) { g.strokeStyle = "rgba(255,255,255,.18)"; g.lineWidth = 2; g.beginPath(); const x = r() * S, y = r() * H; g.moveTo(x, y); g.lineTo(x + (r() - .5) * S * .5, y + (r() - .5) * S * .5); g.stroke() }
    if (gast > 0) { g.fillStyle = `rgba(235,228,205,${gast * .42})`; g.fillRect(0, 0, S, H);
      for (let k = 0; k < 40 * gast; k++) { g.fillStyle = r() < .6 ? `rgba(100,76,40,${.1 + r() * .25})` : `rgba(80,120,40,${.1 + r() * .2})`; g.beginPath(); g.ellipse(r() * S, r() * H, 4 + r() * 20, 3 + r() * 12, r() * 3, 0, 7); g.fill() }
      if (gast > .5) { g.strokeStyle = "rgba(40,30,20,.7)"; g.lineWidth = 2; g.beginPath(); let x = r() * S, y = r() * H * .7; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (r() - .3) * 14; y += 6 + r() * 8; g.lineTo(x, y) } g.stroke() } }
    g.restore() }
  const TEX_K = {}, MAT_K = {};
  function texCometa(tipo, dis, cols, gast = 0, seed = 1) { const key = [tipo, dis, cols.join(), gast, seed].join("|"); if (TEX_K[key]) return TEX_K[key]; const kg = cometaGeo(tipo);
    const t = tex(256, 256, (g, w) => pintaCometa(g, w, kg.polyUV, kg.cen, dis, cols, gast, seed)); return (TEX_K[key] = t) }
  const matCometa = t => MAT_K[t.uuid] || (MAT_K[t.uuid] = new THREE.MeshStandardMaterial({ map: t, roughness: .72, side: THREE.DoubleSide }));
  // moño de la cola (dos triángulos y el nudo)
  const GEO_MONO = (() => { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0, -.1, .055, .012, -.1, -.055, -.01, 0, 0, 0, .1, -.05, .012, .1, .06, -.01], 3)); g.computeVertexNormals(); g.setAttribute("uv", new THREE.Float32BufferAttribute(new Array(12).fill(.5), 2)); return mergeC([[g, null], [new THREE.BoxGeometry(.03, .035, .025), null]]) })();
  const M_MONO = new THREE.MeshStandardMaterial({ vertexColors: false, roughness: .8, side: THREE.DoubleSide });
  const M_HILO = new THREE.MeshBasicMaterial({ color: "#efe8d6" });
  // una cometa suelta (la usa el elenco: la cometa nueva de Pip). El frente decorado mira a +z, la punta a +y; el origen es el centro de la tela.
  // userData.ancla = punto (local) donde se ata el hilo; userData.cola = moños que mueve cometaCola()
  function nuevaCometa({ tipo = "rombo", color = "#f2c12e", color2 = "#d8322a", color3 = "#2a6fd0", dibujo = "sol", gastada = 0, cola = true, nCola = 9, escala = 1, seed = 11, colores = null } = {}) {
    const kg = cometaGeo(tipo), t = texCometa(tipo, dibujo, colores || [color, color2, color3, "#ffffff"], gastada, seed), g = new THREE.Group(), m = new THREE.Mesh(kg.geo, matCometa(t)); m.castShadow = true; g.add(m); g.scale.setScalar(escala);
    const C2 = [], cs = [color2, color]; if (cola && kg.cola) for (let k = 0; k < nCola; k++) { const piv = new THREE.Group(), mo = new THREE.Mesh(GEO_MONO, new THREE.MeshStandardMaterial({ color: cs[k % 2], roughness: .8, side: THREE.DoubleSide })); mo.scale.setScalar(.9); mo.castShadow = true; piv.add(mo);
      const cu = part(new THREE.CylinderGeometry(.004, .004, .2, 4), M_HILO, 0, .1, 0, piv, 0); cu.castShadow = false; g.add(piv); C2.push(piv) }
    g.userData = { tipo, ancla: kg.ancla.clone(), colaBase: kg.cola ? kg.cola.clone() : null, cola: C2, malla: m }; if (C2.length) cometaCola(g, 0); return g }
  // mueve la cola: viento = dirección del mundo hacia donde va el aire ([1,0,0] en el pueblo); fuerza 0 = cuelga quieta (valle)
  function cometaCola(k, t, { viento = [1, 0, 0], fuerza = 1 } = {}) { const u = k.userData; if (!u.cola || !u.cola.length) return; k.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(k.matrixWorld).invert(), dW = new THREE.Vector3(...viento).normalize().multiplyScalar(fuerza).add(new THREE.Vector3(0, -1, 0).multiplyScalar(1.1 - fuerza * .6)), d0 = dW.clone().transformDirection(inv);
    let p = u.colaBase.clone(); u.cola.forEach((piv, i) => { const w = Math.sin(t * 6.3 - i * .8) * .42 * fuerza, w2 = Math.cos(t * 4.1 - i * .6) * .25 * fuerza, d = d0.clone().add(new THREE.Vector3(w, 0, w2)).normalize(), q = p.clone().addScaledVector(d, .2 / k.scale.x);
      piv.position.copy(q); piv.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().negate()); p = q }) }
  // hilo con comba entre dos puntos del mundo (desde = null → el ancla de la cometa). Devuelve la malla (se crea la primera vez y se agrega a la escena)
  function cometaHilo(k, desde, hasta, comba = .06) { const u = k.userData, N = 40, RS = 4; if (!u.hilo) { const g = new THREE.BufferGeometry(), pos = new Float32Array(N * RS * 3), idx = []; for (let i = 0; i < N - 1; i++) for (let j = 0; j < RS; j++) { const a = i * RS + j, b = i * RS + (j + 1) % RS; idx.push(a, a + RS, b, b, a + RS, b + RS) } g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setIndex(idx); u.hilo = new THREE.Mesh(g, M_HILO); u.hilo.frustumCulled = false; scene.add(u.hilo) }
    k.updateMatrixWorld(true); const A = desde ? V3(desde) : u.ancla.clone().applyMatrix4(k.matrixWorld), B = V3(hasta), L = A.distanceTo(B), p = u.hilo.geometry.attributes.position, T = B.clone().sub(A).normalize(), S1 = new THREE.Vector3(0, 1, 0).cross(T); if (S1.lengthSq() < 1e-6) S1.set(1, 0, 0); S1.normalize(); const S2 = T.clone().cross(S1).normalize(), rr = .0045;
    for (let i = 0; i < N; i++) { const s = i / (N - 1), c = A.clone().lerp(B, s); c.y -= comba * L * 4 * s * (1 - s); for (let j = 0; j < RS; j++) { const a = j / RS * 6.283; p.setXYZ(i * RS + j, c.x + (S1.x * Math.cos(a) + S2.x * Math.sin(a)) * rr, c.y + (S1.y * Math.cos(a) + S2.y * Math.sin(a)) * rr, c.z + (S1.z * Math.cos(a) + S2.z * Math.sin(a)) * rr) } }
    p.needsUpdate = true; u.hilo.visible = true; return u.hilo }

  // --- las cometas perdidas: cientos, instanciadas por (tipo, dibujo), tiradas en el pasto y enganchadas en los árboles ---
  const DIS = ["cuartos", "rayas", "ojo", "arco", "chevron", "estrella", "cuadros", "luna"], TIPOS = ["rombo", "delta", "hexa", "caja"];
  const COLAS = { monos: [], cuerdas: [] };   // moños instanciados y cuerdas (cinta fina) de todas las colas
  const colaEnPasto = (x0, z0, dx, dz, n, cs, r, colgando = false, y0 = 0) => { const pts = []; let x = x0, z = z0, a = Math.atan2(dz, dx); const ph = r() * 6;
    for (let k = 0; k <= n * 3; k++) { if (colgando) pts.push([x0 + Math.sin(k * .5 + ph) * .04, y0 - k * .075, z0]); else { a += Math.sin(k * .35 + ph) * .16; x += Math.cos(a) * .085; z += Math.sin(a) * .085; pts.push([x, ljAlt(x, z) + .05 + r() * .02, z]) } }
    COLAS.cuerdas.push(pts); for (let k = 1; k <= n; k++) { const q = pts[k * 3], q0 = pts[k * 3 - 1]; COLAS.monos.push({ p: q, rx: colgando ? 0 : -Math.PI / 2 + (r() - .5) * .5, ry: colgando ? r() * 6 : 0, rz: colgando ? Math.PI / 2 + (r() - .5) * .4 : Math.atan2(q[2] - q0[2], q[0] - q0[0]) + Math.PI / 2 + (r() - .5) * .8, s: .9 + r() * .3, c: lin(cs[k % cs.length]) }) } };
  { const r = rng(7700), grupos = {}, ponK = (x, z, s, enArbol = null) => { const tipo = TIPOS[r() < .4 ? 0 : r() < .55 ? 1 : r() < .7 ? 2 : 3], dis = DIS[r() * DIS.length | 0], key = tipo + "|" + dis, kg = cometaGeo(tipo);
      if (!grupos[key]) { const pal = [...PALETA].sort(() => r() - .5); grupos[key] = { tipo, dis, cols: pal.slice(0, 4), L: [] } }
      const gr = grupos[key], fade = r() < .3 ? r() * .45 : 0, tint = mix3([1, 1, 1], lin("#c8c0a8"), fade);
      let rx, ry, rz, y; if (enArbol) { rx = (r() - .5) * .9; ry = r() * 6.283; rz = (r() - .5) * 1.2; y = enArbol[1] } else if (tipo === "caja") { rx = Math.PI / 2; ry = r() * 6.283; rz = 0; y = ljAlt(x, z) + kg.pie * s } else { rx = -Math.PI / 2 + (r() - .5) * .45; ry = r() * 6.283; rz = (r() - .5) * .3; y = ljAlt(x, z) + .08 + r() * .1 }
      gr.L.push({ p: [x, y, z], rx, ry, rz, s, c: tint }); ponHuella(x, z, .55 * s);
      if (kg.cola && r() < (enArbol ? .85 : .7)) { const M = TMx(x, y, z, rx, ry, rz, s), b = kg.cola.clone().applyMatrix4(M), dn = new THREE.Vector3(0, -1, 0).transformDirection(M); const cs = [PALETA[r() * 7 | 0], PALETA[r() * 7 | 0], "#f4efe2"];
        enArbol ? colaEnPasto(b.x, b.z, 0, 0, 5 + r() * 5 | 0, cs, r, true, b.y) : colaEnPasto(b.x, b.z, dn.x, dn.z, 5 + r() * 5 | 0, cs, r) } };
    const libreK = (x, z) => Math.hypot(x - ATX, z - ATZ) > 2.6 && Math.hypot(x - CPX, z - CPZ) > 3.8 && Math.hypot(x - MTX, z - MTZ) > 1.1 && !enCometa(x, z) && (x < RIO_X0 || Math.abs(z - RIO(x)) > cauce(x) + .8) && CASAS_P.every(([cx, cz]) => Math.hypot(x - cx, z - cz) > 6.5) && ARBOLES.every(a => Math.hypot(a.x - x, a.z - z) > 1.2);
    const anillo = (n, r0, r1, cx = ATX, cz = ATZ) => { let k = 0, t = 0; while (k < n && t++ < n * 40) { const a = r() * 6.283, d = Math.sqrt(lerp(r0 * r0, r1 * r1, r())), x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d * .85; if (!libreK(x, z)) continue; ponK(x, z, .95 + r() * .6); k++ } };
    anillo(70, 2.6, 15); anillo(150, 15, 48); anillo(170, 48, 150, 520, 10); anillo(90, 150, 280, 520, 0);
    // enganchadas en las copas de los árboles cercanos (con la cola colgando)
    ARBOLES.filter(a => a.v !== 3 && Math.hypot(a.x - ATX, a.z - ATZ) < 170).sort(() => r() - .5).slice(0, 30).forEach(a => { const an = r() * 6.283, rr = [2.2, 1.7, 1, 1.5][a.v] * a.s; ponK(a.x + Math.cos(an) * rr, a.z + Math.sin(an) * rr, .85 + r() * .4, [0, a.y + a.h * (.55 + r() * .2), 0]) });
    Object.values(grupos).forEach(gr => { const t = texCometa(gr.tipo, gr.dis, gr.cols, 0, gr.L.length * 7 + gr.dis.length); instancias(cometaGeo(gr.tipo).geo, matCometa(t), gr.L, { par: FINO }) }) }

  // --- las cometas de Pip: siete, amarillas y rojas con su sol y su nombre, de años distintos (la más vieja, desteñida y rota) ---
  const PIP_G = new THREE.Group(); FINO.add(PIP_G);
  { const r = rng(7800), dat = [[0, 0, "#f2c12e", "#d8322a", 0], [1.5, .6, "#f2c12e", "#d8322a", .2], [-1.3, .9, "#d8322a", "#f2c12e", .35], [.4, -1.5, "#f2c12e", "#d8322a", .5], [-1.6, -.8, "#f2c12e", "#d8322a", .65], [2.3, -.9, "#d8322a", "#f2c12e", .75], [-.2, 2.1, "#f2c12e", "#d8322a", .9]];
    dat.forEach(([dx, dz, c1, c2, g], i) => { const x = CPX + dx, z = CPZ + dz, k = nuevaCometa({ tipo: i === 3 ? "hexa" : "rombo", color: c1, color2: c2, gastada: g, cola: false, seed: 31 + i, escala: .95 + r() * .2 });
      k.position.set(x, ljAlt(x, z) + .1 + i * .012, z); k.rotation.set(-Math.PI / 2 + (r() - .5) * .35, r() * 6.283, (r() - .5) * .25, "YXZ"); PIP_G.add(k); ponHuella(x, z, .6);
      const M = k.matrix.compose(k.position, k.quaternion, k.scale), kg = cometaGeo(k.userData.tipo), b = kg.cola.clone().applyMatrix4(M), dn = new THREE.Vector3(0, -1, 0).transformDirection(M); colaEnPasto(b.x, b.z, dn.x, dn.z, 6 + (r() * 4 | 0), [c2, c1], r) }) }
  // la media vieja de Tobb (la otra media): lana cruda gastada con dos rayas rojas, el talón zurcido, un agujero en la punta
  const T_MEDIA = tex(256, 128, (g, w, h) => { const r = rng(7810); g.fillStyle = "#cfc4a8"; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 4) for (let y = 0; y < h; y += 6) { g.fillStyle = `rgba(${r() < .5 ? "90,80,60" : "255,250,235"},${.12 + r() * .12})`; g.beginPath(); g.ellipse(x + 2, y + 3, 2, 3, .5, 0, 7); g.fill() }
    for (const x of [w * .06, w * .14]) { g.fillStyle = "#9a3a2a"; g.fillRect(x, 0, w * .045, h) } g.fillStyle = "rgba(120,100,70,.5)"; g.fillRect(w * .55, h * .35, w * .1, h * .4); g.strokeStyle = "#6a5a40"; g.lineWidth = 2; for (let k = 0; k < 8; k++) { g.beginPath(); g.moveTo(w * .55, h * .38 + k * 5); g.lineTo(w * .65, h * .38 + k * 5); g.stroke() }
    g.fillStyle = "#3a3020"; g.beginPath(); g.ellipse(w * .96, h * .5, w * .025, h * .14, 0, 0, 7); g.fill(); for (let k = 0; k < 30; k++) { g.fillStyle = `rgba(90,110,50,${r() * .3})`; g.beginPath(); g.arc(r() * w, r() * h, 3 + r() * 8, 0, 7); g.fill() } });
  const MEDIA_G = (() => { const cu = new THREE.CatmullRomCurve3([[0, 0, 0], [0, 0, .14], [0, 0, .27], [.03, 0, .33], [.1, 0, .36], [.2, 0, .37]].map(p => new THREE.Vector3(...p))), g = new THREE.TubeGeometry(cu, 32, .045, 10, false), p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) * .45); g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: T_MEDIA, roughness: 1, side: THREE.DoubleSide })); m.castShadow = m.receiveShadow = true; const gr = new THREE.Group(); gr.add(m); gr.position.set(MTX, ljAlt(MTX, MTZ) + .07, MTZ); gr.rotation.set(.05, 2.2, .04); FINO.add(gr); ponHuella(MTX, MTZ, .45); return gr })();
  // colas: moños instanciados y cuerdas como una sola malla de cinta
  { const cs = COLAS; instancias(GEO_MONO, M_MONO, cs.monos, { sombra: true, par: FINO });
    const P = [], I = [], w = .007; let n = 0; cs.cuerdas.forEach(pts => { for (let k = 0; k < pts.length; k++) { const a = pts[Math.max(0, k - 1)], b = pts[Math.min(pts.length - 1, k + 1)], dx = b[0] - a[0], dz = b[2] - a[2], l = Math.hypot(dx, dz) || 1, colg = Math.abs(b[1] - a[1]) > .05; const ox = colg ? w : -dz / l * w, oz = colg ? 0 : dx / l * w; P.push(pts[k][0] - ox, pts[k][1], pts[k][2] - oz, pts[k][0] + ox, pts[k][1], pts[k][2] + oz); if (k) { const o = n - 2; I.push(o, o + 1, o + 2, o + 1, o + 3, o + 2) } n += 2 } });
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3)); g.setIndex(I); g.computeVertexNormals(); const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: "#e8e0cc", roughness: .9, side: THREE.DoubleSide })); FINO.add(m) }

  // pasto, flores y matas (después de las cometas: no atraviesan las telas)
  { const r = rng(7900), M1 = [matoGeo(7901, 10), matoGeo(7902, 12), matoGeo(7903, 9)], LG = [[], [], []], LF = [[], []], LB = [], fl = [florGeo(.42), florGeo(.6)];
    const FC = ["#ffffff", "#ffffff", "#f6e04a", "#f6e04a", "#e83a2a", "#6a7ae8", "#c46ad8", "#ff9ac0", "#ffb03a"];
    const ok = (x, z) => (x < RIO_X0 || Math.abs(z - RIO(x)) > cauce(x) + .3) && CASAS_P.every(([cx, cz]) => Math.hypot(x - cx, z - cz) > 5.5) && !enCometa(x, z) && sendaD(x, z) > .9;
    const zona = (cx, cz, R, dens) => { const n = Math.PI * R * R * dens | 0; for (let k = 0; k < n; k++) { const a = r() * 6.283, d = R * Math.sqrt(r()), x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d; if (r() < sst(.45, 1, d / R) || !ok(x, z)) continue; const s = .85 + r() * .4, v = r() * 3 | 0; LG[v].push({ p: [x, ljAlt(x, z) - .03, z], ry: r() * 6.283, s: [s, s * (.8 + r() * .35), s], c: mix3([1, 1, 1], lin(["#d8e890", "#b8d070", "#e8f0b0"][r() * 3 | 0]), r() * .5) }) } };
    zona(ATX, ATZ, 30, 2.6); zona(ATX, ATZ, 55, .7); zona(CPX, CPZ, 8, 3);
    const CAMP = [[470, 40], [540, 60], [560, 0], [452, 10], [600, 30]]; CAMP.forEach(([x, z]) => zona(x, z, 20, 1.4));
    for (let k = 0; k < 9000; k++) { const x = 290 + r() * 460, z = (r() - .5) * 300, h = ljAlt(x, z); if (h > 10 || !ok(x, z)) continue; const s = 1 + r() * .6; LG[r() * 3 | 0].push({ p: [x, h - .03, z], ry: r() * 6.283, s: [s * 1.3, s, s * 1.3], c: mix3([1, 1, 1], lin("#c8d880"), r() * .5) }) }
    // flores en manchones (cada manchón de un color)
    for (let m = 0; m < 260; m++) { const near = m < 150, a = r() * 6.283, d = near ? 3 + r() * 45 : r() * 160, cx = (near ? ATX : 520) + Math.cos(a) * d, cz = (near ? ATZ : 10) + Math.sin(a) * d, col = lin(FC[r() * FC.length | 0]), n = 8 + r() * 30 | 0, R = 1 + r() * 3;
      for (let k = 0; k < n; k++) { const b = r() * 6.283, e = R * Math.sqrt(r()), x = cx + Math.cos(b) * e, z = cz + Math.sin(b) * e; if (!ok(x, z) || ljAlt(x, z) > 8) continue; const s = .8 + r() * .5; LF[r() < .5 ? 0 : 1].push({ p: [x, ljAlt(x, z) - .02, z], ry: r() * 6.283, rx: (r() - .5) * .2, rz: (r() - .5) * .2, s, c: mix3(col, [1, 1, 1], r() * .2) }) } }
    for (let k = 0; k < 420; k++) { const x = RIO_X0 + r() * 600, sd = r() < .5 ? -1 : 1, near = r() < .6, z = near ? RIO(x) + sd * (cauce(x) + 1 + r() * 3) : (r() - .5) * 280; if (!near && !libreAt(x, z)) continue; if (enCometa(x, z)) continue; const s = .5 + r() * .8; LB.push({ p: [x, ljAlt(x, z) - .1, z], ry: r() * 6.283, s: [s * 1.3, s * .8, s * 1.3], c: mix3([1, 1, 1], lin("#c0e0a0"), r()) }) }
    const MPasto = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .9, side: THREE.DoubleSide }); M1.forEach((g, v) => instancias(g, MPasto, LG[v], { sombra: false, par: FINO }));
    const MPet = new THREE.MeshStandardMaterial({ roughness: .6, side: THREE.DoubleSide }); fl.forEach(([b, p], v) => { instancias(b, M_VC, LF[v], { sombra: false, par: FINO }); instancias(p, MPet, LF[v], { sombra: false, par: FINO }) });
    instancias(mergeC([[bulto(7950, 1, .25, 1.6, -.3), null, (X, Y) => mix3(lin("#2a5a1c"), lin("#6aa83a"), cl(Y * .5 + .5))]]), M_COPA, LB) }

  // ---------------- EL MAR DE NUBES del lado este de la cordillera (nubesValle(apertura): 0 = cerrado, 1 = abierto sobre el valle) ----------------
  const NUBV = (() => { const gA = mergeC([[bulto(8001, 3, .17, 1.4, -.22), null]]), gB = mergeC([[bulto(8002, 3, .22, 1.9, -.3), null]]);
    // de cerca se desvanecen (la cámara las atraviesa sin chocar contra una «piedra» blanca; los jirones hacen el resto)
    const mat = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 1, emissive: "#8ea4c2", emissiveIntensity: .16, transparent: true }), r = rng(8003), A = [], B = [];
    mat.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying float vDc;").replace("#include <project_vertex>", "#include <project_vertex>\nvDc = -mvPosition.z;");
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying float vDc;").replace("#include <color_fragment>", "#include <color_fragment>\ndiffuseColor.a *= smoothstep(5., 34., vDc);") };
    for (let x = 190; x < 860; x += 21) for (let z = -460; z < 460; z += 21) { const px = x + (r() - .5) * 16, pz = z + (r() - .5) * 16, R = 13 + r() * 11; A.push({ x: px, y: 37 + (fbm(px * .01, pz * .01, 2) - .5) * 9, z: pz, sx: R * 1.3, sy: R * (.5 + r() * .25), sz: R * 1.3, ry: r() * 6.283 }) }
    for (let k = 0; k < 900; k++) { const px = 190 + r() * 660, pz = (r() - .5) * 900, R = 5 + r() * r() * 11; B.push({ x: px, y: 37 + (fbm(px * .01, pz * .01, 2) - .5) * 9 + R * .3 + 4, z: pz, sx: R, sy: R * .85, sz: R, ry: r() * 6.283 }) }
    const mA = new THREE.InstancedMesh(gA, mat, A.length), mB = new THREE.InstancedMesh(gB, mat, B.length); [mA, mB].forEach((m, j) => { m.castShadow = false; m.receiveShadow = false; m.frustumCulled = false; G.add(m); const cc = new THREE.Color(); for (let i = 0; i < m.count; i++) m.setColorAt(i, cc.setRGB(1, 1, 1).lerp(new THREE.Color("#c9d4e4"), r() * (j ? .25 : .45))) });
    let ult = -9; const poner = ap => { if (ap === null || ap === false) { mA.visible = mB.visible = false; return } mA.visible = mB.visible = true; if (Math.abs(ap - ult) < 1e-4) return; ult = ap;
      for (const [m, L] of [[mA, A], [mB, B]]) L.forEach((q, i) => { const dx = q.x - VALLE[0], dz = q.z - VALLE[1], e = Math.hypot(dx / 235, dz / 150), f = e < 1.66 ? Math.max(1, (1.08 + e * .35) / Math.max(e, .05)) : 1, k = lerp(1, f, ap), sh = 1 - ap * .55 * (1 - sst(.3, 1.1, e));
        dummy.position.set(VALLE[0] + dx * k, q.y + ap * 7 * (1 - sst(.8, 1.7, e)), VALLE[1] + dz * k); dummy.rotation.set(0, q.ry, 0); dummy.scale.set(q.sx * sh, q.sy * sh, q.sz * sh); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix) }), mA.instanceMatrix.needsUpdate = mB.instanceMatrix.needsUpdate = true };
    poner(0);
    // cúmulos altos del cielo de esta zona (reemplazan a las nubes pintadas del pueblo cuando la cámara está al este)
    // cúmulos altos del cielo de esta zona: racimos de copos que miran a la cámara (abajo grisáceos, arriba blancos); reemplazan a las nubes pintadas del pueblo cuando la cámara está al este
    const Cq = [], rc = rng(8010); for (let k = 0; k < 24; k++) { const a = rc() * 6.283, d = 300 + rc() * 520, cx = VALLE[0] - 80 + Math.cos(a) * d, cz = VALLE[1] + Math.sin(a) * d, cy = 135 + rc() * 90, R0 = 22 + rc() * 22, n = 16 + rc() * 10 | 0;
      for (let q = 0; q < n; q++) { const u = rc() * 2 - 1, v = rc(), R = R0 * (.35 + rc() * .35) * (1 - Math.abs(u) * .45), y = cy + v * R0 * .55 * (1 - u * u); Cq.push([cx + u * R0 * 1.8, y, cz + (rc() - .5) * R0 * .9, R * 2.1, .72 + .28 * v, rc() * 6.28]) } }
    const mC = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), null, Cq.length); mC.frustumCulled = false; G.add(mC);
    return { poner, mA, mB, mC, Cq } })();
  const nubesValle = ap => NUBV.poner(ap === null || ap === false || ap === undefined ? null : cl(ap));

  // ---------------- billboards: nieve soplada de los filos, jirones de nube cerca de la cámara ----------------
  const M_BB = (col) => { const m = new THREE.MeshBasicMaterial({ map: T_PUFF, color: col, transparent: true, depthWrite: false }); m.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace("#include <color_fragment>", "#if defined( USE_COLOR )\n diffuseColor.a *= vColor.r; diffuseColor.rgb *= vColor.g;\n#endif") }; return m };
  const PENACHOS = (() => { const src = []; for (let z = -300; z <= 300; z += 17) { let bx = 0, bh = -1; for (let x = 118; x < 200; x += 2) { const h = ljAlt(x, z); if (h > bh) { bh = h; bx = x } } if (bh > 64) src.push([bx, bh, z]) }
    const N = 22, m = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), M_BB("#f4f8ff"), src.length * N), r = rng(8101), d = []; m.frustumCulled = false; for (let i = 0; i < src.length * N; i++) { d.push([r(), r() - .5, r() - .5, .7 + r() * .6, r() * 6.28]); m.setColorAt(i, new THREE.Color(0, 0, 0)) } G.add(m); return { m, src, N, d } })();
  const JIRONES = (() => { const N = 34, m = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), M_BB("#ffffff"), N), r = rng(8102), d = []; m.frustumCulled = false; m.renderOrder = 5;
    for (let i = 0; i < N; i++) { const a = r() * 6.283, rr = 5 + r() * 22; d.push([Math.cos(a) * rr * 1.3, Math.sin(a) * rr * .7 - 3, r(), 9 + r() * 16, r() * 6.28]); m.setColorAt(i, new THREE.Color(0, 0, 0)) } G.add(m); return { m, d, N } })();

  // ---------------- pájaros chicos sobre el valle (bandadas que planean y aletean) ----------------
  const PAJAROS = (() => { const N = 21, mc = SM("#3a332e", { roughness: .8, side: THREE.DoubleSide }), cu = new THREE.InstancedMesh(new THREE.BoxGeometry(.07, .06, .24), mc, N), al = new THREE.ShapeGeometry(new THREE.Shape([[0, -.05], [.2, -.08], [.3, -.02], [.18, .05], [0, .05]].map(p => new THREE.Vector2(...p)))); al.rotateX(-Math.PI / 2);
    const am = new THREE.InstancedMesh(al, mc, N * 2), r = rng(8201), d = []; for (let i = 0; i < N; i++) d.push([i % 3, (r() - .5) * 9, (r() - .5) * 3, (r() - .5) * 9, r() * 6.28]); [cu, am].forEach(m => { m.frustumCulled = false; m.castShadow = true; G.add(m) }); return { cu, am, d, N } })();
  const BANDADA = [[500, 28, 20, 55, .16], [585, 34, -50, 70, -.12], [440, 22, 75, 40, .2]];

  // ---------------- ambientes ----------------
  const ENV_L = {
    cumbre: { top: "#1650a6", hor: "#c2d8ee", fog: .0010, hemi: .8, hemiG: "#6a7284", sun: 3.7, sunCol: "#fff2e2", exp: 1.0, grade: ["#d8ecff", .06], sol: [-.15, .55, .82], nube: ["#ffffff", 1], agua: "#7ea8c8" },
    valle: { top: "#3a8ae2", hor: "#e4e6d8", fog: .0008, hemi: 1.15, hemiG: "#6f8a40", sun: 3.9, sunCol: "#ffdcaa", exp: 1.12, grade: ["#ffe2b0", .07], sol: [-.62, .44, .65], nube: ["#fff6e8", .62], agua: "#86aabf" } };

  // ---------------- estado por cuadro ----------------
  const LJ = { t: 0, jir: 0, nieve: 1, pajaros: 1, sol: true };
  function lejosReset(vis = true) { if (!ENV.cumbre) Object.assign(ENV, ENV_L); G.visible = vis; LJ.jir = 0; LJ.nieve = 1; LJ.pajaros = 1; nubesValle(null) }
  // lejos(t, { nubes: 0..1 | null, jirones: 0..1, nieve: 0..1, pajaros: 0|1 }) — llamar en cada cuadro después de lejosReset()
  function lejos(t, o = {}) { LJ.t = t; if ("jirones" in o) LJ.jir = o.jirones; if ("nieve" in o) LJ.nieve = o.nieve; if ("pajaros" in o) LJ.pajaros = o.pajaros; if ("nubes" in o) nubesValle(o.nubes);
    HUMO_L.forEach(({ s, p, f }) => { const q = (t * .09 + f) % 1; s.position.set(p.x + Math.sin(t * .5 + f * 9) * .12 * q, p.y + q * 15, p.z + Math.cos(t * .4 + f * 7) * .12 * q); s.scale.setScalar(.7 + q * 5.5); s.material.opacity = .5 * Math.sin(Math.min(1, q * 1.4) * Math.PI) * (1 - q * .5) + .0; s.material.rotation = f * 6 });
    { const P = PAJAROS, Q = new THREE.Quaternion(), M = new THREE.Matrix4(), Mw = new THREE.Matrix4(), S1 = new THREE.Vector3(1, 1, 1), Sm = new THREE.Vector3(-1, 1, 1);
      P.cu.visible = P.am.visible = !!LJ.pajaros; for (let i = 0; i < P.N; i++) { const [b, ox, oy, oz, ph] = P.d[i], [cx, cy, cz, R, w] = BANDADA[b], a = t * w + b * 2, x = cx + Math.cos(a) * R + ox + Math.sin(t * .7 + ph) * 1.2, y = cy + oy + Math.sin(t * .9 + ph) * 1.5, z = cz + Math.sin(a) * R + oz;
        const hd = Math.atan2(-Math.sin(a) * Math.sign(w), Math.cos(a) * Math.sign(w)); Q.setFromEuler(new THREE.Euler(0, hd, Math.sign(w) * -.25)); M.compose(new THREE.Vector3(x, y, z), Q, S1); P.cu.setMatrixAt(i, M);
        const fl = Math.sin(t * .6 + ph) > -.2 ? Math.sin(t * 15 + ph) * .65 : .08; for (const s of [-1, 1]) { Mw.compose(new THREE.Vector3(s * .03, 0, 0), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), s * fl), s > 0 ? S1 : Sm); P.am.setMatrixAt(i * 2 + (s > 0 ? 1 : 0), M.clone().multiply(Mw)) } }
      P.cu.instanceMatrix.needsUpdate = P.am.instanceMatrix.needsUpdate = true } }

  // ---------------- antes de dibujar: cielo y nubes del cielo centrados en la cámara, plano lejano, billboards, sol que sigue a la toma ----------------
  const _d = new THREE.Vector3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _Z = new THREE.Vector3(0, 0, 1), _c = new THREE.Color();
  function lejosCam(c, s0) { if (!c || !c.isPerspectiveCamera) return;
    if (c.far < 2999) { c.far = 3000; c.updateProjectionMatrix() }
    try { SKY.position.copy(c.position); SKY.updateMatrixWorld() } catch (e) { }
    if (!G.visible) return; const zona = c.position.x > 95;
    ARB_LOD.forEach(m => { m.visible = m.boundingSphere.center.distanceTo(c.position) < 430 + m.boundingSphere.radius });
    FINO.visible = Math.hypot(Math.max(0, 290 - c.position.x, c.position.x - 760), Math.max(0, Math.abs(c.position.z) - 160), Math.max(0, c.position.y - 60)) < 140;
    if (s0 && s0.overrideMaterial) { PENACHOS.m.visible = JIRONES.m.visible = false; return }
    try { NUBES.forEach(g => { if (g.position.x > 60) g.visible = false }) } catch (e) { }
    try { if (zona) { if (NUBES_D.G.visible) { NUBES_D.G.visible = false; LJ.ocultoND = true } } else if (LJ.ocultoND) { NUBES_D.G.visible = true; LJ.ocultoND = false } } catch (e) { }
    { const M = NUBV.mC; M.visible = zona; if (zona) { if (!M.material) M.material = M_BB("#ffffff"); NUBV.Cq.forEach(([x, y, z, sc, br, rot], i) => { dummy.position.set(x, y, z); _q2.setFromAxisAngle(_Z, rot); dummy.quaternion.copy(c.quaternion).multiply(_q2); dummy.scale.set(sc, sc * .8, 1); dummy.updateMatrix(); M.setMatrixAt(i, dummy.matrix); M.setColorAt(i, _c.setRGB(.95, br, 0)) }); M.instanceMatrix.needsUpdate = true; M.instanceColor.needsUpdate = true } }
    // nieve soplada: sale de los picos hacia +x, crece y se deshace
    { const P = PENACHOS, t = LJ.t; P.m.visible = LJ.nieve > 0; if (P.m.visible) for (let s = 0; s < P.src.length; s++) for (let k = 0; k < P.N; k++) { const i = s * P.N + k, [ph, oy, oz, sc, rot] = P.d[i], q = (t * .22 + ph) % 1, [x, y, z] = P.src[s];
      dummy.position.set(x + 1 + q * 26, y + .5 + q * 4 + oy * 3 * q, z + oz * 8 * q); _q2.setFromAxisAngle(_Z, rot + t * .3); dummy.quaternion.copy(c.quaternion).multiply(_q2); dummy.scale.set((1.6 + q * 8) * sc * 1.6, (1.6 + q * 8) * sc * .7, 1); dummy.updateMatrix(); P.m.setMatrixAt(i, dummy.matrix); P.m.setColorAt(i, _c.setRGB(LJ.nieve * .32 * Math.sin(q * Math.PI) * (1 - q * .5) * sst(12, 45, dummy.position.distanceTo(c.position)), 1, 0)) }
      P.m.instanceMatrix.needsUpdate = true; if (P.m.instanceColor) P.m.instanceColor.needsUpdate = true }
    // jirones: vienen de adelante y pasan al lado de la cámara (se ve la velocidad)
    { const J = JIRONES; J.m.visible = LJ.jir > 0; if (J.m.visible) { c.getWorldDirection(_d); const Rt = new THREE.Vector3().crossVectors(_d, c.up).normalize(), Up = new THREE.Vector3().crossVectors(Rt, _d).normalize();
      for (let i = 0; i < J.N; i++) { const [ax, ay, ph, sc, rot] = J.d[i], D0 = 90, dd = D0 - ((LJ.t * 26 + ph * D0) % D0); dummy.position.copy(c.position).addScaledVector(_d, dd).addScaledVector(Rt, ax).addScaledVector(Up, ay); _q2.setFromAxisAngle(_Z, rot); dummy.quaternion.copy(c.quaternion).multiply(_q2); dummy.scale.set(sc * 1.6, sc, 1); dummy.updateMatrix(); J.m.setMatrixAt(i, dummy.matrix);
        J.m.setColorAt(i, _c.setRGB(LJ.jir * .75 * sst(3, 14, dd) * (1 - sst(60, 88, dd)), 1, 0)) } J.m.instanceMatrix.needsUpdate = true; if (J.m.instanceColor) J.m.instanceColor.needsUpdate = true } }
    // el sol (y su caja de sombras) se centra donde mira la cámara
    if (zona && LJ.sol) { c.getWorldDirection(_d); let hit = null; for (let s = 4; s < 1500; s *= 1.05) { const x = c.position.x + _d.x * s, y = c.position.y + _d.y * s, z = c.position.z + _d.z * s; if (x > 100 && y < ljAlt(x, z)) { hit = [x, z, s]; break } }
      if (!hit) hit = [c.position.x + _d.x * 260, c.position.z + _d.z * 260, 260]; const A = ENV[ENVNOW] || {}, sd = A.sol || [-.5, .45, .7], l = Math.hypot(...sd), cy = ljAlt(hit[0], hit[1]), Rr = cl(hit[2] * .6, 18, 210);
      sun.position.set(hit[0] + sd[0] / l * 700, cy + sd[1] / l * 700, hit[1] + sd[2] / l * 700); sun.target.position.set(hit[0], cy, hit[1]); sun.updateMatrixWorld(); sun.target.updateMatrixWorld();
      const sc = sun.shadow.camera; if (sc.right !== Rr || sc.far !== 1500) { sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 200; sc.far = 1500; sc.updateProjectionMatrix() } } }
  { const prev = scene.onBeforeRender; scene.onBeforeRender = function (r, s, c, rt) { if (prev) prev.call(this, r, s, c, rt); lejosCam(c, s) } }

  // ---------------- coordenadas para la cámara ----------------
  const yS = (x, z) => ljAlt(x, z);
  const ATERRIZA = [ATX, yS(ATX, ATZ), ATZ], COMETAS_PIP = [CPX, yS(CPX, CPZ), CPZ], MEDIA_PASTO = [MTX, yS(MTX, MTZ), MTZ];
  // camino de vuelo sugerido: la torre → sube → cruza la cresta alto → baja entre las nubes → el pasto (ATERRIZA, 0,4 arriba)
  const VUELO_PTS = [[0, 16.2, -10], [30, 34, -8], [70, 62, -4], [110, 96, 0], [150, 128, 4], [196, 114, 8], [246, 90, 12], [300, 62, 16], [348, 44, 20], [396, 28, 23], [446, 14, 25], [484, 5, 25.5], [ATX, ATERRIZA[1] + .4, ATZ]]
    .map(([x, y, z], i, L) => [x, i === 0 || i === L.length - 1 ? y : Math.max(y, (x > 95 ? ljAlt(x, z) : ALT(x, z)) + (x > 95 && x < 270 ? 30 : 4)), z]);
  // planos lindos del valle: p = cámara, l = adónde mira, f = fov
  const CAMS_VALLE = {
    aereoValle: { p: [400, 70, 150], l: [540, 0, -10], f: 50, nota: "el valle entero desde arriba: arroyo, casitas, cometas como confites" },
    aterrizaPicado: { p: [ATX - 7, ATERRIZA[1] + 10, ATZ + 9], l: [ATX, ATERRIZA[1], ATZ], f: 48, nota: "picado sobre el lugar de aterrizaje, cometas alrededor" },
    pastoPersona: { p: [ATX - 14, ATERRIZA[1] + 1.6, ATZ + 7], l: [ATX + 40, ATERRIZA[1] + 5, ATZ - 8], f: 55, nota: "altura de persona mirando al este: pasto, flores, cometas, árboles derechos, casita con humo" },
    cometasPip: { p: [CPX + 2.2, COMETAS_PIP[1] + 1.5, CPZ + 2.6], l: [CPX - .2, COMETAS_PIP[1] + .1, CPZ - .1], f: 50, nota: "detalle de las siete cometas de Pip y la media de Tobb" },
    haciaCordillera: { p: [ATX + 10, ATERRIZA[1] + 1.8, ATZ - 3], l: [230, 55, 5], f: 50, nota: "desde el valle mirando atrás: la cordillera nevada que cruzaron" },
    humoDerecho: { p: [CASAS_P[0][0] - 16, yS(CASAS_P[0][0] - 16, CASAS_P[0][1] + 18) + 2.2, CASAS_P[0][1] + 18], l: [CASAS_P[0][0], yS(CASAS_P[0][0], CASAS_P[0][1]) + 6, CASAS_P[0][1]], f: 50, nota: "casita de piedra con humo que sube derecho y árboles derechos" },
    cresta: { p: [128, 150, 40], l: [175, 70, -10], f: 55, nota: "aéreo de la cordillera: rocas, nieve, filos (env=cumbre)" },
    marDeNubes: { p: [205, 120, 10], l: [420, 30, 0], f: 55, nota: "desde la cresta hacia el este: el mar de nubes (nubesValle 0 → 1)" } };

  return { G, ljAlt, nubesValle, jironesNube: f => { LJ.jir = f }, lejos, lejosReset, cometaGeo, nuevaCometa, cometaCola, cometaHilo, ENV_L, ATERRIZA, COMETAS_PIP, MEDIA_PASTO, VUELO_PTS, CAMS_VALLE, PIP_G, MEDIA_G, LJ, RIO, CASAS: CASAS_P, PUENTE };
})();
// ---------------- API de LEJOS ----------------
const { ljAlt: SUELO_LEJOS, nubesValle, jironesNube, lejos, lejosReset, cometaGeo, nuevaCometa, cometaCola, cometaHilo, ATERRIZA, COMETAS_PIP, MEDIA_PASTO, VUELO_PTS, CAMS_VALLE } = LEJOS;
const ENV_LEJOS = LEJOS.ENV_L, LEJOS_G = LEJOS.G, LEJOS_CFG = LEJOS.LJ;
