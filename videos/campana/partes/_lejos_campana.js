// ================= LO DE LEJOS: el valle, las montañas con nieve (y las cimas donde se anclan las cadenas), las cordilleras en capas, la bruma por capas,
// el CIELO por clima (sol, luna, estrellas), las NUBES con volumen (y la capa de nubes que se atraviesa al trepar), los climas de luz de la campana y los stubs viejos =================
// Usa CBX (_bestia_campana.js). Mi piso empieza en r = 120 (con un faldón 0,2 m abajo de ALT_B hasta r = 160 para no pelearse con el piso de la ciudad) y sigue ALT_B
// exacto hasta r ≈ 230; afuera suma montañas. Las cimas de MONTES norte/sur/oeste son picos de verdad con el ancla arriba.
const LEJOS_CB = (() => {
  const G = new THREE.Group(); G.name = "LEJOS"; scene.add(G);
  const { sst, fbm, rd, hsh, mergeGeo, TMx } = CBX, TAU = Math.PI * 2;
  const lin = h => { const c = new THREE.Color(h); return [c.r, c.g, c.b] }, mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  const smax = (a, b, k) => { const h = cl(.5 + .5 * (b - a) / k); return lerp(a, b, h) + k * h * (1 - h) };
  // ---------------- EL TERRENO ----------------
  const ALT_L = (x, z) => { const r = Math.hypot(x, z); let y = ALT_B(x, z);
    const k1 = sst(230, 440, r), k2 = sst(650, 1500, r);
    if (k1 > 0) { const rid = 1 - Math.abs(rd(x * .011 + 7, z * .011 - 3) * 2 - 1); y += k1 * ((fbm(x * .0042 + 3, z * .0042 - 1, 5) - .45) * 150 + rid * rid * 45 + (fbm(x * .02, z * .02, 3) - .5) * 22) }
    if (k2 > 0) y += k2 * (40 + 230 * fbm(x * .0011 + 9, z * .0011, 4));
    for (const n of ["norte", "sur", "oeste"]) { const M = MONTES[n], d = Math.hypot(x - M[0], z - M[2]); if (d > 420) continue; const top = M[1] - 1.5, pico = top - d * (.62 + .3 * fbm(x * .02 + 1, z * .02, 2)) - (fbm(x * .05, z * .05, 2) - .5) * 6 * sst(10, 60, d);
      y = Math.min(y, top + d * .75); y = smax(y, pico, 18) }
    return y - .2 * (1 - sst(150, 165, r)) };
  const NRM = (x, z, e = 1.5) => { const a = ALT_L(x - e, z), b = ALT_L(x + e, z), c = ALT_L(x, z - e), d = ALT_L(x, z + e), n = [a - b, 2 * e, c - d], l = Math.hypot(...n); return n.map(v => v / l) };
  const C = { prado: lin("#5d7a36"), prado2: lin("#7d8c42"), ocre: lin("#a99350"), arado: lin("#6a5238"), seto: lin("#34482a"), bosque: lin("#2c4226"), bosque2: lin("#3c5430"), roca: lin("#6e665c"), roca2: lin("#8c8274"), roca3: lin("#4e4a46"), nieve: lin("#eef2f8"), nieveS: lin("#b8c6d8"), lejos: lin("#7c8ca4") };
  const colorT = (x, z, y, n) => { const r = Math.hypot(x, z), ny = n[1], f1 = fbm(x * .02, z * .02, 3), f2 = fbm(x * .07 + 4, z * .07, 2); let c;
    // valle: parcelas de cultivo (tablero torcido en coordenadas polares) con setos
    const an = Math.atan2(z, x), pu = an * 38 + Math.sin(r * .02) * .6, pv = r / 26 + Math.sin(an * 7) * .4, i = Math.floor(pu), j = Math.floor(pv), hh = hsh(i + 400, j), bord = Math.min(pu - i, 1 - pu + i, (pv - j), 1 - pv + j);
    const campo = [C.prado, C.prado2, C.ocre, C.arado, C.prado][hh * 5 | 0];
    c = mix3(campo, C.seto, 1 - sst(.04, .12, bord)); c = mix3(c, mix3(c, C.bosque, .5), f2 * .4);
    const kb = sst(.62, .45, ny) * 0 + sst(24, 60, y) * (1 - sst(150, 185, y));     // bosque en las laderas
    c = mix3(c, mix3(C.bosque, C.bosque2, f1), kb * sst(.42, .55, f1 + .1));
    const kr = cl(sst(.82, .6, ny) + sst(150, 210, y) * .7);                           // roca: lo empinado y lo alto
    c = mix3(c, mix3(mix3(C.roca, C.roca2, f2), C.roca3, sst(.5, .7, f1) * .6), kr);
    const sn = 200 + .085 * Math.max(r - 480, 0) + 40 * fbm(x * .006, z * .006, 3) - (1 - ny) * 30, ks = sst(sn - 8, sn + 8, y) * sst(.45, .66, ny) * sst(.3, .5, fbm(x * .035 + 2, z * .035, 3) + sst(sn, sn + 40, y) * .3);
    c = mix3(c, mix3(C.roca3, C.roca2, f2), sst(.55, .75, fbm(x * .09, z * .015, 2)) * kr * .7);   // vetas de roca   // nieve
    c = mix3(c, mix3(C.nieveS, C.nieve, cl(ny * 1.4 - .3)), ks);
    c = mix3(c, C.lejos, sst(900, 1900, r) * .45);
    return c };
  const T_ROCA_L = (() => { const t = tex(512, 512, (g, w, h) => { const r = rng(9601); g.fillStyle = "#808080"; g.fillRect(0, 0, w, h); for (let k = 0; k < 2400; k++) { const v = r() * 255 | 0; g.fillStyle = `rgba(${v},${v},${v},${.15 + r() * .3})`; g.beginPath(); g.ellipse(r() * w, r() * h, 2 + r() * 18, 1 + r() * 8, r() * 3, 0, TAU); g.fill() } for (let k = 0; k < 160; k++) { g.strokeStyle = `rgba(30,30,30,${.3 + r() * .4})`; g.lineWidth = 1 + r() * 2; g.beginPath(); let x = r() * w, y = r() * h; g.moveTo(x, y); for (let q = 0; q < 6; q++) { x += (r() - .5) * 40; y += r() * 20; g.lineTo(x, y) } g.stroke() } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.NoColorSpace; return t })();
  const NIEBLA_U = { uMY0: { value: 30 }, uMY1: { value: 120 }, uMA: { value: .35 }, uMC: { value: new THREE.Color("#c8d6e4") } };
  const M_TERRENO = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .95, bumpMap: T_ROCA_L, bumpScale: 2.5 });
  M_TERRENO.onBeforeCompile = sh => { Object.assign(sh.uniforms, NIEBLA_U); sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vLW;").replace("#include <begin_vertex>", "#include <begin_vertex>\n  vLW = (modelMatrix * vec4(transformed, 1.)).xyz;");
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 vLW; uniform float uMY0, uMY1, uMA; uniform vec3 uMC;").replace("#include <fog_fragment>", `#include <fog_fragment>
  { float d = length(vLW - cameraPosition); float hm = 1. - smoothstep(uMY0, uMY1, vLW.y); float m = hm * smoothstep(90., 900., d) * uMA; gl_FragColor.rgb = mix(gl_FragColor.rgb, uMC, clamp(m, 0., .8)); }`) };
  M_TERRENO.customProgramCacheKey = () => "terrCB";
  const TERRENO = (() => { const rs = []; for (let r = 120; r < 300; r += 2) rs.push(r); { let r = 300, s = 2; while (r < 1950) { rs.push(r); s *= 1.03; r += s } }
    const NA = 900, NR = rs.length, pos = new Float32Array(NR * (NA + 1) * 3), nor = new Float32Array(NR * (NA + 1) * 3), col = new Float32Array(NR * (NA + 1) * 3), uv = new Float32Array(NR * (NA + 1) * 2), idx = new Uint32Array((NR - 1) * NA * 6); let k = 0, q = 0;
    for (let i = 0; i < NR; i++) for (let j = 0; j <= NA; j++) { const a = j / NA * TAU, x = Math.cos(a) * rs[i], z = Math.sin(a) * rs[i], y = ALT_L(x, z), n = NRM(x, z, Math.max(1.5, rs[i] * .006));
      pos.set([x, y, z], k * 3); nor.set(n, k * 3); col.set(colorT(x, z, y, n), k * 3); uv.set([x / 22, z / 22], k * 2); k++ }
    for (let i = 0; i < NR - 1; i++) for (let j = 0; j < NA; j++) { const a = i * (NA + 1) + j, b = a + NA + 1; idx[q++] = a; idx[q++] = a + 1; idx[q++] = b; idx[q++] = a + 1; idx[q++] = b + 1; idx[q++] = b }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); g.setAttribute("color", new THREE.BufferAttribute(col, 3)); g.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); g.setIndex(new THREE.BufferAttribute(idx, 1)); g.computeBoundingSphere();
    const m = new THREE.Mesh(g, M_TERRENO); m.receiveShadow = true; m.frustumCulled = false; G.add(m); return m })();
  // bosques (coníferas) en las laderas y árboles redondos y granjas en el valle
  const ARBOLES = (() => { const r = rng(9611), L = [], LR = [];
    for (let k = 0; k < 26000 && L.length < 9000; k++) { const a = r() * TAU, rr = lerp(170, 760, Math.sqrt(r())), x = Math.cos(a) * rr, z = Math.sin(a) * rr, y = ALT_L(x, z); if (y < 22 || y > 168) continue; const n = NRM(x, z); if (n[1] < .62) continue; if (fbm(x * .02, z * .02, 3) + .1 < .5) continue; L.push([x, y, z, .8 + r() * .9]) }
    for (let k = 0; k < 6000 && LR.length < 1800; k++) { const a = r() * TAU, rr = lerp(125, 300, r()), x = Math.cos(a) * rr, z = Math.sin(a) * rr, y = ALT_L(x, z); if (y > 40) continue; if (fbm(x * .05 + 3, z * .05, 2) < .52) continue; LR.push([x, y, z, .7 + r() * .7]) }
    const con = mergeGeo([[new THREE.ConeGeometry(2.2, 6, 6), TMx(0, 5.2, 0)], [new THREE.ConeGeometry(1.7, 4.5, 6), TMx(0, 7.6, 0)], [new THREE.CylinderGeometry(.25, .35, 2.4, 5), TMx(0, 1.2, 0)]]);
    const red = mergeGeo([[new THREE.IcosahedronGeometry(2.6, 1), TMx(0, 4.6, 0, 0, 0, 0, 1, .85, 1)], [new THREE.CylinderGeometry(.3, .4, 3, 5), TMx(0, 1.5, 0)]]);
    const mk_ = (geo, D, c0, c1) => { const m = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .9 }), D.length), c = new THREE.Color(); D.forEach(([x, y, z, s], i) => { dummy.position.set(x, y - .3, z); dummy.rotation.set(0, r() * 6, 0); dummy.scale.set(s, s * (.85 + r() * .4), s); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); m.setColorAt(i, c.set(c0).lerp(new THREE.Color(c1), r())) }); m.frustumCulled = false; G.add(m); return m };
    return [mk_(con, L, "#1f3420", "#3a5232"), mk_(red, LR, "#3e5a2a", "#6a7a36")] })();
  const GRANJAS = (() => { const r = rng(9612), L = []; for (let k = 0; k < 400 && L.length < 90; k++) { const a = r() * TAU, rr = lerp(160, 290, r()), x = Math.cos(a) * rr, z = Math.sin(a) * rr, y = ALT_L(x, z); if (y > 30 || NRM(x, z)[1] < .9) continue; if (Math.abs(x - RISCO_E[0]) < 50 && Math.abs(z - RISCO_E[1]) < 50) continue; L.push([x, y, z, r() * 6, .8 + r() * .6]) }
    const pared = new THREE.BoxGeometry(6, 3.6, 4.4); pared.translate(0, 1.8, 0); const techo = new THREE.CylinderGeometry(.01, 3.6, 3, 4, 1); techo.rotateY(Math.PI / 4); techo.scale(1.25, 1, .9); techo.translate(0, 5, 0);
    const mP = new THREE.InstancedMesh(pared, new THREE.MeshStandardMaterial({ color: "#b8a888", roughness: .9 }), L.length), mT = new THREE.InstancedMesh(techo, new THREE.MeshStandardMaterial({ color: "#6a3a2a", roughness: .85 }), L.length);
    L.forEach(([x, y, z, ry, s], i) => { dummy.position.set(x, y - .2, z); dummy.rotation.set(0, ry, 0); dummy.scale.setScalar(s); dummy.updateMatrix(); mP.setMatrixAt(i, dummy.matrix); mT.setMatrixAt(i, dummy.matrix) }); [mP, mT].forEach(m => { m.frustumCulled = false; G.add(m) }); return { mP, mT } })();

  // ---------------- CORDILLERAS LEJANAS EN CAPAS (más lejos = más pálidas) ----------------
  const RU = { uHor: { value: new THREE.Color("#bcd4e8") }, uSolV: { value: new THREE.Vector3(0, 1, 0) }, uSolC: { value: new THREE.Color("#ffffff") } };
  const CORDILLERAS = [[2150, 560, .5, "#6a7892"], [2950, 800, .66, "#7c8aa4"], [3900, 1100, .8, "#94a2ba"]].map(([R0, H0, haze, col], li) => {
    const N = 1440, pos = [], uv = [], idx = [], r = rng(9620 + li);
    for (let j = 0; j <= N; j++) { const a = j / N * TAU, x = Math.cos(a), z = Math.sin(a), ridge = 1 - Math.abs(rd(a * 9 + li * 30, li * 7) * 2 - 1), h = H0 * (.35 + .4 * fbm(a * 4 + li * 5, li, 4) + .35 * ridge * ridge) + 60 * (rd(a * 60, li) - .5);
      pos.push(x * R0, -80, z * R0, x * R0, h, z * R0); uv.push(j / N, 0, j / N, 1); if (j) { const b = (j - 1) * 2; idx.push(b, b + 2, b + 1, b + 1, b + 2, b + 3) } }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
    const m = new THREE.Mesh(g, new THREE.ShaderMaterial({ uniforms: Object.assign({ uCol: { value: new THREE.Color(col) }, uHaze: { value: haze }, uTop: { value: H0 } }, RU), side: THREE.DoubleSide, fog: false, depthWrite: true,
      vertexShader: "varying vec3 vW; void main(){ vW = (modelMatrix * vec4(position, 1.)).xyz; gl_Position = projectionMatrix * viewMatrix * vec4(vW, 1.); }",
      fragmentShader: `uniform vec3 uCol, uHor, uSolV, uSolC; uniform float uHaze, uTop; varying vec3 vW;
float h1(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main(){ float y = vW.y; float n = h1(floor(vW.xz / 40.)) * .5 + h1(floor(vW.xz / 13.)) * .5;
  vec3 c = uCol * (.85 + .25 * n); float sn = smoothstep(uTop * .62, uTop * .78, y + n * 40.); c = mix(c, vec3(.92, .95, 1.), sn * .8);
  vec3 d = normalize(vW - cameraPosition); float sl = pow(max(dot(normalize(vec3(d.x, 0., d.z)), normalize(vec3(uSolV.x, 0., uSolV.z))), 0.), 4.);
  c = mix(c, uSolC, sl * .25 * sn);
  float hz = clamp(uHaze + (1. - smoothstep(-60., uTop * .5, y)) * .35, 0., 1.); c = mix(c, uHor, hz);
  gl_FragColor = vec4(c, 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}` }));
    m.frustumCulled = false; m.renderOrder = -2 + li * 0; G.add(m); return m });

  // ---------------- BRUMA POR CAPAS (láminas horizontales de niebla en el valle) ----------------
  const BU = { uT: { value: 0 }, uCol: { value: new THREE.Color("#d4e2ee") }, uA: { value: .35 }, uSolV: RU.uSolV, uSolC: RU.uSolC };
  const BRUMAS = [[26, .9, 1], [48, .7, 2], [82, .55, 3], [140, .35, 4]].map(([y, k, s]) => { const g = new THREE.RingGeometry(140, 2300, 160, 12); g.rotateX(-Math.PI / 2); g.translate(0, y, 0);
    const m = new THREE.Mesh(g, new THREE.ShaderMaterial({ uniforms: Object.assign({ uK: { value: k }, uS: { value: s } }, BU), transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide,
      vertexShader: "varying vec3 vW; void main(){ vW = (modelMatrix * vec4(position, 1.)).xyz; gl_Position = projectionMatrix * viewMatrix * vec4(vW, 1.); }",
      fragmentShader: `uniform vec3 uCol, uSolV, uSolC; uniform float uT, uA, uK, uS; varying vec3 vW;
float h1(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(h1(i), h1(i + vec2(1, 0)), f.x), mix(h1(i + vec2(0, 1)), h1(i + vec2(1, 1)), f.x), f.y); }
void main(){ vec2 p = vW.xz / 260. + vec2(uT * .004 * uS, uT * .002); float n = n2(p) * .55 + n2(p * 2.3 + 7.) * .3 + n2(p * 5.1 - 3.) * .15;
  float r = length(vW.xz), d = length(vW - cameraPosition);
  float a = smoothstep(.38, .75, n) * uA * uK * smoothstep(150., 300., r) * (1. - smoothstep(1700., 2300., r)) * smoothstep(40., 260., d) * pow(1. - abs(normalize(vW - cameraPosition).y), 2.2);
  vec3 vd = normalize(vW - cameraPosition); float fw = pow(max(dot(vd, uSolV), 0.), 5.); vec3 c = mix(uCol, uSolC, fw * .45);
  gl_FragColor = vec4(c, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}` })); m.frustumCulled = false; m.renderOrder = 2; G.add(m); return m });

  // ---------------- EL CIELO (domo que sigue a la cámara): degradé, sol con halo, luna con cráteres, estrellas ----------------
  const SU = { uTop: { value: new THREE.Color() }, uHor: { value: new THREE.Color() }, uSol: { value: new THREE.Vector3(0, 1, 0) }, uSolC: { value: new THREE.Color("#fff4e0") }, uSolI: { value: 1 }, uHalo: { value: new THREE.Color("#ffe0b0") },
    uLuna: { value: new THREE.Vector3(0, 1, 0) }, uLunaI: { value: 0 }, uEst: { value: 0 }, uT: { value: 0 } };
  const DOMO = new THREE.Mesh(new THREE.SphereGeometry(4800, 64, 32), new THREE.ShaderMaterial({ uniforms: SU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: "varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",
    fragmentShader: `uniform vec3 uTop, uHor, uSol, uSolC, uHalo, uLuna; uniform float uSolI, uLunaI, uEst, uT; varying vec3 vD;
float h1(vec3 p){ return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
float n3(vec3 p){ vec3 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(mix(h1(i), h1(i + vec3(1,0,0)), f.x), mix(h1(i + vec3(0,1,0)), h1(i + vec3(1,1,0)), f.x), f.y), mix(mix(h1(i + vec3(0,0,1)), h1(i + vec3(1,0,1)), f.x), mix(h1(i + vec3(0,1,1)), h1(i + vec3(1,1,1)), f.x), f.y), f.z); }
void main(){ vec3 d = normalize(vD); float h = d.y;
  vec3 c = mix(uHor, uTop, pow(smoothstep(-.02, .85, h), .55)); c = mix(c, uHor * .85, smoothstep(0., -.25, h));
  float sd = max(dot(d, uSol), 0.); c += uHalo * uSolI * (pow(sd, 5.) * .28 + pow(sd, 40.) * .55 + pow(sd, 400.) * 1.2);
  c = mix(c, uSolC * 7., smoothstep(.99955, .9998, sd) * uSolI);
  // luna con cráteres y halo frío
  float md = dot(d, uLuna); vec3 lt = normalize(cross(uLuna, vec3(0., 1., 0.))), lb = cross(lt, uLuna); vec2 lp = vec2(dot(d, lt), dot(d, lb)) / .028;
  float disco = smoothstep(1.02, .98, length(lp)) * step(0., md); float cr = n3(vec3(lp * 3.2, 1.)) * .5 + n3(vec3(lp * 8., 4.)) * .3 + n3(vec3(lp * 1.4, 9.)) * .4;
  vec3 lc = vec3(.93, .95, 1.) * (.75 + .35 * cr - .25 * smoothstep(.55, .75, cr)) * (.88 + .12 * sqrt(max(0., 1. - dot(lp, lp))));
  c += vec3(.55, .65, .9) * uLunaI * (pow(max(md, 0.), 60.) * .3 + pow(max(md, 0.), 600.) * .5);
  c = mix(c, lc * 3.2, disco * uLunaI);
  // estrellas (más arriba, más)
  if (uEst > 0. && h > 0.) { vec3 q = d * 420.; vec3 cell = floor(q); float s = h1(cell); if (s > .985) { vec3 cp = cell + .5 + (vec3(h1(cell + 1.), h1(cell + 2.), h1(cell + 3.)) - .5) * .6; float dd = length(q - cp); float tw = .6 + .4 * sin(uT * (2. + s * 9.) + s * 90.);
      c += vec3(1., .96, .9) * uEst * smoothstep(.55, 0., dd) * (s - .985) * 66. * tw * smoothstep(0., .25, h) * (1. - disco); } }
  gl_FragColor = vec4(c, 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}` }));
  DOMO.frustumCulled = false; DOMO.renderOrder = -10; scene.add(DOMO);

  // ---------------- NUBES con volumen (racimos de copos iluminados por el sol) ----------------
  const T_COPO = tex(256, 256, (g, w, h) => { const r = rng(9631); g.clearRect(0, 0, w, h);
    // coliflor: bultos grandes en el medio y cada vez más chicos hacia el borde, base más chata; después se come el borde con agujeritos
    for (let k = 0; k < 90; k++) { const a = r() * TAU, e = Math.pow(r(), .7), x = w / 2 + Math.cos(a) * e * 92, y = h * .55 + Math.sin(a) * e * 62 - (Math.sin(a) < 0 ? e * 10 : 0), R0 = lerp(46, 12, e) * (.7 + r() * .5); if (y > h * .78) continue;
      const gr = g.createRadialGradient(x - R0 * .3, y - R0 * .35, 0, x, y, R0); gr.addColorStop(0, "rgba(255,255,255,.6)"); gr.addColorStop(.5, "rgba(236,236,236,.4)"); gr.addColorStop(1, "rgba(220,220,220,0)"); g.fillStyle = gr; g.beginPath(); g.arc(x, y, R0, 0, TAU); g.fill() }
    g.globalCompositeOperation = "destination-in"; const gm = g.createRadialGradient(w / 2, h * .52, 0, w / 2, h * .52, w * .5); gm.addColorStop(0, "rgba(0,0,0,1)"); gm.addColorStop(.45, "rgba(0,0,0,.9)"); gm.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gm; g.fillRect(0, 0, w, h); g.globalCompositeOperation = "source-over" });
  T_COPO.colorSpace = THREE.NoColorSpace;
  const NU = { uSol: SU.uSol, uLit: { value: new THREE.Color("#ffffff") }, uShade: { value: new THREE.Color("#9aaac4") }, uHor: { value: new THREE.Color("#bcd4e8") }, uHaze: { value: .00035 }, uT: { value: 0 }, uMap: { value: T_COPO }, uGA: { value: new THREE.Vector4(1, 1, 0, 1) } };
  const NUBES = (() => { const r = rng(9632), P = [], Cc = [], Vv = []; const racimo = (cx, cy, cz, ancho, alto, n, s0, s1, grupo, chato = 1) => { for (let q = 0; q < n; q++) { const u = r() * 2 - 1, v = Math.pow(r(), .8), sz = lerp(s0, s1, r()) * (1 - Math.abs(u) * .45);
      const x = cx + u * ancho, y = cy + v * alto * (1 - u * u * .6) * chato, z = cz + (r() - .5) * ancho * .55; P.push(x, y, z, sz); Cc.push(cx, cy - alto * .2, cz); Vv.push(v, r() * TAU, grupo, r()) } };
    for (let k = 0; k < 40; k++) { const a = r() * TAU, d = lerp(900, 2700, r()), w = lerp(180, 520, r()); racimo(Math.cos(a) * d, lerp(330, 720, r()), Math.sin(a) * d, w, w * .45, 16 + (r() * 14 | 0), w * .25, w * .55, 0) }
    for (let k = 0; k < 16; k++) { const a = r() * TAU, d = lerp(480, 900, r()), w = lerp(70, 180, r()); racimo(Math.cos(a) * d, lerp(130, 220, r()), Math.sin(a) * d, w, w * .25, 10 + (r() * 8 | 0), w * .3, w * .6, 1, .6) }
    // la capa que se atraviesa al trepar (alrededor de la cadena del este, y ≈ 88 → 126)
    for (let k = 0; k < 42; k++) { const u = lerp(.02, CADENA_U_LABIO * .92, r()), p = cadenaPunto("este", u), a = r() * TAU, d = lerp(16, 130, Math.pow(r(), .7)), w = lerp(18, 46, r()); racimo(p[0] + Math.cos(a) * d, lerp(86, 120, r()), p[2] + Math.sin(a) * d, w, w * .3, 14 + (r() * 8 | 0), w * .3, w * .62, 2, .7) }
    // anillo de nubes a media altura, siempre (lejos de la ciudad)
    for (let k = 0; k < 30; k++) { const a = r() * TAU, d = lerp(480, 1150, r()), w = lerp(50, 130, r()); racimo(Math.cos(a) * d, lerp(100, 140, r()), Math.sin(a) * d, w, w * .22, 10 + (r() * 6 | 0), w * .35, w * .7, 3, .55) }
    const g = new THREE.InstancedBufferGeometry(); const b = new THREE.PlaneGeometry(1, 1); g.index = b.index; g.setAttribute("position", b.attributes.position); g.setAttribute("uv", b.attributes.uv);
    g.setAttribute("aP", new THREE.InstancedBufferAttribute(new Float32Array(P), 4)); g.setAttribute("aC", new THREE.InstancedBufferAttribute(new Float32Array(Cc), 3)); g.setAttribute("aV", new THREE.InstancedBufferAttribute(new Float32Array(Vv), 4)); g.instanceCount = P.length / 4;
    const m = new THREE.Mesh(g, new THREE.ShaderMaterial({ uniforms: NU, transparent: true, depthWrite: false, fog: false,
      vertexShader: `attribute vec4 aP, aV; attribute vec3 aC; uniform vec3 uSol, uLit, uShade, uHor; uniform float uHaze, uT; uniform vec4 uGA; varying vec2 vUv; varying vec3 vCol; varying float vA; varying vec2 vSs;
void main(){ vSs = normalize((viewMatrix * vec4(uSol, 0.)).xy + 1e-4); vec3 c = aP.xyz + vec3(uT * .6, 0., uT * .25) * (aV.z < 1.5 ? 1. : .3); vec4 mv = viewMatrix * vec4(c, 1.); float ro = aV.y + uT * .01 * (aV.w - .5);
  vec2 q = position.xy; q = vec2(cos(ro) * q.x - sin(ro) * q.y, sin(ro) * q.x + cos(ro) * q.y); mv.xy += q * aP.w; gl_Position = projectionMatrix * mv; vUv = uv;
  float dcam = -mv.z; vec3 off = normalize(aP.xyz - aC + vec3(0., .001, 0.));
  float l = clamp(dot(off, uSol) * .45 + .5 + (aV.x - .45) * .5, 0., 1.); vCol = mix(uShade, uLit, l);
  float hz = 1. - exp(-max(dcam - 60., 0.) * uHaze); vCol = mix(vCol, uHor, clamp(hz, 0., .9));
  float ga = aV.z < .5 ? uGA.x : aV.z < 1.5 ? uGA.y : aV.z < 2.5 ? uGA.z : uGA.w;
  vA = ga * smoothstep(aP.w * .25, aP.w * 1.1, dcam) * step(0., dcam); }`,
      fragmentShader: `uniform sampler2D uMap; varying vec2 vUv; varying vec3 vCol; varying float vA; varying vec2 vSs;
void main(){ vec4 t = texture2D(uMap, vUv); float a = t.a * vA; if (a < .004) discard; float sl = dot(vUv - .5, vSs) * 2.; vec3 c = vCol * (.86 + .14 * t.r + .1 * sl);
  gl_FragColor = vec4(c, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}` }));
    m.frustumCulled = false; m.renderOrder = 3; scene.add(m); return m })();

  // ---------------- CLIMAS de lo mío ----------------
  // ENV_CAMPANA_PRUEBA: el clima completo (para probar en mi copia). ENV_CAMPANA_CIELO: SOLO mis claves cb* (las suma la integración con envCampana(ENV)).
  const PRUEBA = {
    mediodia: { top: "#3d7ad0", hor: "#bcd4e8", fog: .0007, hemi: 1.05, hemiG: "#6a6050", sun: 3.3, sunCol: "#fff2dc", exp: 1.1, grade: ["#ffffff", 0], sol: [-.25, 1, .3], sombra: 90 },
    atardecer: { top: "#2e3f80", hor: "#f0a466", fog: .0008, hemi: .65, hemiG: "#5a3a2a", sun: 4.2, sunCol: "#ffa860", exp: 1.15, grade: ["#ffb070", .08], sol: [-.92, .2, .2], sombra: 90 },
    noche: { top: "#050916", hor: "#1a2440", fog: .0009, hemi: .42, hemiG: "#10141c", sun: .85, sunCol: "#9ab0e0", exp: 1.6, grade: ["#7090d0", .06], sol: [.1, .62, -.78], sombra: 90 },
    dentro: { top: "#05060a", hor: "#0c1018", fog: .0012, hemi: .13, hemiG: "#100c08", sun: .4, sunCol: "#9ab0e0", exp: 1.8, grade: ["#8090c0", .05], sol: [.1, .62, -.78], sombra: 90 },
    sallow: { top: "#5a6270", hor: "#9aa2aa", fog: .0016, hemi: .8, hemiG: "#4a4640", sun: 1.2, sunCol: "#c8ccd4", exp: 1.15, grade: ["#a8b0c0", .06], sol: [-.3, .7, .4], sombra: 90 } };
  const CIELO_CB = {
    mediodia: { cbEnv: "dia", cbNubeLuz: "#ffffff", cbNubeSombra: "#93a4c0", cbBruma: ["#d6e4f0", .32], cbSolI: 1, cbHalo: "#ffe6c0", cbLuna: 0, cbEstrellas: 0, cbNubesA: [1, .8, .75, .7] },
    atardecer: { cbEnv: "tarde", cbNubeLuz: "#ffc08a", cbNubeSombra: "#6a5a84", cbBruma: ["#f2b484", .42], cbSolI: 1.6, cbHalo: "#ffb070", cbLuna: 0, cbEstrellas: 0, cbNubesA: [1, .8, .75, .7] },
    noche: { cbEnv: "noche", cbNubeLuz: "#56648a", cbNubeSombra: "#10141f", cbBruma: ["#2c3a5a", .5], cbSolI: 0, cbHalo: "#000000", cbLuna: 1, cbLunaDir: [.1, .62, -.78], cbEstrellas: 1, cbNubesA: [.8, .8, .9, .7] },
    dentro: { cbEnv: "dentro", cbNubeLuz: "#6a7898", cbNubeSombra: "#10141e", cbBruma: ["#1c2638", .5], cbSolI: 0, cbHalo: "#000000", cbLuna: 1, cbLunaDir: [.1, .62, -.78], cbEstrellas: 1, cbNubesA: [.6, .6, .6, .5] },
    sallow: { cbEnv: "dia", cbPatina: .7, cbNubeLuz: "#c0c4cc", cbNubeSombra: "#5a606c", cbBruma: ["#a4acb6", .62], cbSolI: .15, cbHalo: "#c0c0c0", cbLuna: 0, cbEstrellas: 0, cbNubesA: [1, 1, 1, 1] } };
  const vacio = {};
  function clima(A) { const D = CIELO_CB.mediodia, k = (key, def) => A[key] ?? D[key] ?? def;
    SU.uTop.value.set(A.top || "#3d7ad0"); SU.uHor.value.set(A.hor || "#bcd4e8"); RU.uHor.value.set(A.hor || "#bcd4e8"); NU.uHor.value.set(A.hor || "#bcd4e8");
    const sd = CBX.ST.solDir || A.cbSol || A.sol || [-.3, .9, .3], l = Math.hypot(...sd); SU.uSol.value.set(sd[0] / l, sd[1] / l, sd[2] / l); RU.uSolV.value.copy(SU.uSol.value);
    SU.uSolI.value = k("cbSolI", 1); SU.uSolC.value.set(A.sunCol || "#fff4e0"); SU.uHalo.value.set(k("cbHalo", "#ffe0b0")); RU.uSolC.value.set(A.sunCol || "#ffffff");
    const ld = A.cbLunaDir || sd, ll = Math.hypot(...ld); SU.uLuna.value.set(ld[0] / ll, ld[1] / ll, ld[2] / ll); SU.uLunaI.value = k("cbLuna", 0); SU.uEst.value = k("cbEstrellas", 0);
    NU.uLit.value.set(k("cbNubeLuz", "#ffffff")); NU.uShade.value.set(k("cbNubeSombra", "#9aaac4")); NU.uHaze.value = (A.fog ?? .0012) * .3;
    const na = k("cbNubesA", [1, 1, 1, 1]); NU.uGA.value.set(na[0], na[1], CBX.ST.nubes ? na[2] : 0, na[3]);
    const br = k("cbBruma", ["#d4e2ee", .35]); BU.uCol.value.set(br[0]); BU.uA.value = br[1]; NIEBLA_U.uMC.value.set(br[0]); NIEBLA_U.uMA.value = br[1] * .5 }
  function porCuadro(t) { const A = (typeof ENV !== "undefined" && ENV[ENVNOW]) || vacio; clima(A); SU.uT.value = t; NU.uT.value = t; BU.uT.value = t }

  // ---------------- antes de dibujar: plano lejano, el domo sigue a la cámara, lo transparente no entra a las pasadas con material forzado (GTAO) ----------------
  const TRANSP = [DOMO, NUBES, ...BRUMAS, CBX.POLVO, CBX.HAZ, CBX.VAPOR];
  { const prev = scene.onBeforeRender; scene.onBeforeRender = function (r, s, c, rt) { if (prev) prev.call(this, r, s, c, rt);
      if (c && c.isPerspectiveCamera) { if (c.far < 7000) { c.far = 7000; c.updateProjectionMatrix() } DOMO.position.copy(c.position); DOMO.updateMatrixWorld() }
      try { if (SKY.visible) SKY.visible = false } catch (e) { }
      if (s && s.overrideMaterial) TRANSP.forEach(p => { p.userData.ov = p.visible; p.visible = false }) } }
  { const prev = scene.onAfterRender; scene.onAfterRender = function (r, s, c, rt) { if (prev) prev.call(this, r, s, c, rt); TRANSP.forEach(p => { if (p.userData.ov !== undefined) { p.visible = p.userData.ov; delete p.userData.ov } }) } }

  return { G, ALT_L, NRM, TERRENO, ARBOLES, GRANJAS, CORDILLERAS, BRUMAS, DOMO, NUBES, SU, NU, BU, RU, NIEBLA_U, PRUEBA, CIELO_CB, porCuadro };
})();

// ======================= API DE LO DE LEJOS Y LOS CLIMAS =======================
const ALT_LEJOS = LEJOS_CB.ALT_L;                                   // altura del piso de lo mío (= ALT_B adentro de r ≈ 230; montañas afuera)
const nubesTrepada = (on = true) => { CBX.ST.nubes = !!on };         // la capa de nubes alrededor de la cadena del este (y ≈ 86 → 126) que la cámara atraviesa al trepar
const ENV_CAMPANA_CIELO = LEJOS_CB.CIELO_CB;                         // SOLO mis claves (cb*) por clima: se SUMAN a cada clima de ENV con envCampana(ENV)
const ENV_CAMPANA_PRUEBA = LEJOS_CB.PRUEBA;                          // climas completos de prueba (los usa mi copia; la ciudad define los de verdad)
// junta: a cada clima de ENV le agrega mis claves cb* (y si el clima no existe, lo crea con mis valores de prueba). No pisa ninguna clave de la ciudad.
function envCampana(E) { Object.keys(ENV_CAMPANA_CIELO).forEach(k => { E[k] = Object.assign({}, E[k] ? {} : ENV_CAMPANA_PRUEBA[k], E[k] || {}, ENV_CAMPANA_CIELO[k]) }); return E }
// ---------------- por cuadro ----------------
function lejosReset() { CBX.reset() }
function lejos(t) { CBX.porCuadro(t); LEJOS_CB.porCuadro(t) }
// ---------------- cámaras de prueba (p, l, f, env) ----------------
const CAMS_CAMPANA = (() => { const I_ = interior(), q = (n, u) => cadenaMarco(n, u), C = CAMPANA_C, Y = CAMPANA_Y;
  const tr = q("este", .2), trN = tr.n, trS = tr.lado;
  return {
    plaza: { p: [0, 1.7, 15], l: [0, 120, 110], f: 62, env: "mediodia", nota: "contrapicado desde la plaza: la campana entera encima, el labio con musgo y carámbanos, la cadena del este bajando" },
    plazaNoche: { p: [0, 1.7, 15], l: [0, 118, -130], f: 62, env: "noche", nota: "la misma, de noche: silueta con el borde iluminado por la luna" },
    aerea: { p: [300, 360, 420], l: [0, 130, -40], f: 50, env: "atardecer", nota: "aérea lejana: la ciudad, la campana y las cuatro cadenas a las montañas" },
    aereaDia: { p: [-260, 330, 380], l: [0, 110, -30], f: 50, env: "mediodia", nota: "aérea desde el suroeste al mediodía: la sombra cruzando la ciudad" },
    lejosNoche: { p: [30, 120, 430], l: [0, 215, -10], f: 52, env: "noche", nota: "de lejos de noche: la campana en silueta con el borde de luna, la luna detrás" },
    trepa: { p: [tr.p[0] + trN[0] * 20 + trS[0] * 16, tr.p[1] - 12, tr.p[2] + trN[2] * 20 + trS[2] * 16], l: cadenaPunto("este", CADENA_U_LABIO + .04), f: 60, env: "atardecer", nubes: true, nota: "trepando a mitad de la cadena del este, entre nubes, mirando arriba a la campana" },
    trepaAbajo: { p: [tr.p[0] + trN[0] * 9 + trS[0] * 7, tr.p[1] + 14, tr.p[2] + trN[2] * 9 + trS[2] * 7], l: [10, 15, 0], f: 60, env: "atardecer", nubes: true, nota: "desde la cadena mirando abajo: la ciudad chiquita entre nubes" },
    primerEslabon: { p: [PRIMER_ESLABON[0] - 16, PRIMER_ESLABON[1] - 1, PRIMER_ESLABON[2] + 12], l: [PRIMER_ESLABON[0], PRIMER_ESLABON[1] + 6, PRIMER_ESLABON[2]], f: 55, env: "atardecer", nota: "el primer eslabón sobre el ancla del risco (pisadas pulidas)" },
    dentro: { p: plataformaW(4.6, 1.65, 2.2), l: plataformaW(-14, 9, -3), f: 68, env: "dentro", nota: "adentro desde la plataforma: la caverna de bronce, el rayo de luna, el gancho roto" },
    dentroPlataforma: { p: plataformaW(-27, 15, 15), l: plataformaW(-2, 2.5, 0), f: 56, env: "dentro", nota: "la plataforma de Sallow vista desde el aire de adentro, con el rayo de luna cayendo encima y el labio abajo" },
    dentroGancho: { p: CBX.polar(70, CBX.P_H + 3, CBX.A_ENT + .1), l: I_.gancho, f: 50, env: "dentro", nota: "el gancho vacío y roto arriba, con el rayo de luna" },
    dentroLabio: { p: plataformaW(-6.1, 2.6, -4.5), l: CBX.polar(82, -16, CBX.A_ENT - .62), f: 70, env: "dentro", nota: "por encima del labio de adentro: abajo el vacío y la ciudad" },
    entrada: { p: CBX.polar(CBX.rOut(10) + 14, 13, CBX.A_ENT + .12), l: I_.entrada, f: 50, env: "atardecer", nota: "la grieta de entrada y la tabla desde la cadena del este" } } })();
// ---------------- stubs del video viejo (la tapa y su campo ya no existen) ----------------
const ARRIBA_Y = (x, z) => TAPA_Y(x, z) + LID_T, montonesTierra = () => { }, escaleraArriba = () => { }, tapaArriba = () => { };
const ENV_CIELO_TAPA = {}, CAMS_TAPA = {}, TAPA_OBJS = [];
const SUELO_LEJOS = (x, z) => ALT_LEJOS(x, z), nubesValle = () => { }, jironesNube = () => { }, cometaGeo = () => new THREE.BufferGeometry(), nuevaCometa = () => new THREE.Group(), cometaCola = () => { }, cometaHilo = () => { };
const ATERRIZA = [0, 0, 0], COMETAS_PIP = [0, 0, 0], MEDIA_PASTO = [0, 0, 0], VUELO_PTS = [[0, 16, -10], [10, 20, -10], [20, 24, -10]];
const CAMS_VALLE = Object.fromEntries(["aereoValle", "aterrizaPicado", "pastoPersona", "cometasPip", "haciaCordillera", "humoDerecho", "cresta", "marDeNubes"].map(k => [k, { p: [0, 6, 30], l: [0, 4, 0], f: 50 }]));
const ENV_LEJOS = envCampana(Object.assign({}, ENV_CAMPANA_PRUEBA)), LEJOS_G = LEJOS_CB.G, LEJOS_CFG = {};
window.CAMPANA_DBG = { CBX, LEJOS_CB, CAMS_CAMPANA };
