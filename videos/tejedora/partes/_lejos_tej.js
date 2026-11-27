// ================= «NOBODY ANSWERS THE KNOCK»: lo de LEJOS alrededor de Hollowmere — el BOSQUE de pinos (3D, instanciado, hasta r ≈ 320),
// el piso de afuera (anillo hasta r ≈ 340), tres capas de SILUETAS (lomas con pinos, montes, cordillera lejana: sin niebla, el color lo pone
// el clima: cada capa un poco más clara, como en las ilustraciones) y las NUBES nocturnas iluminadas por la luna (la luna, las estrellas y
// el cielo degradé ya están: LUNA_B, ESTRELLAS_B en el detalle, SKY en el motor).
// API: lejos(t) (cada cuadro, después de setEnv/ambiente), lejosReset(). Usa ALT_T, CALLE_T, COLINA_T, LUNA_DIR, ENV, ENVNOW.
const LEJOS_T = (() => {
  // (todo queda adentro de r ≈ 480: la cámara del motor ve hasta 500 m y el GTAO se rompe con distancias más grandes)
  const r = rng(6600), G = new THREE.Group(); scene.add(G);
  // ---------- los pinos: tronco + seis pisos de ramas (conos caídos con borde dentado), textura de agujas pintada; tres variantes
  const T_PINO = (() => { const [c, z] = pintarDoble(256, 256, (c, z, w, h) => { const q = rng(6601); c.fillStyle = "#1e2a1e"; c.fillRect(0, 0, w, h); z.fillStyle = "#606060"; z.fillRect(0, 0, w, h);
      for (let k = 0; k < 2600; k++) { const x = q() * w, y = q() * h, L = 6 + q() * 12, a = Math.PI / 2 + (q() - .5) * 1.2; c.strokeStyle = q() < .5 ? `rgba(${40 + q() * 30 | 0},${70 + q() * 40 | 0},${40 + q() * 20 | 0},.7)` : "rgba(8,12,8,.6)"; c.lineWidth = 1 + q(); c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); c.stroke();
        z.strokeStyle = q() < .5 ? "#c0c0c0" : "#202020"; z.lineWidth = 1.5; z.beginPath(); z.moveTo(x, y); z.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); z.stroke() } });
    [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
  const geoPino = seed => { const q = rng(seed), L = [], tr = new THREE.CylinderGeometry(.015, .03, .35, 6); tr.translate(0, .17, 0); L.push([tr, new THREE.Matrix4()]);
    const n = 6; for (let k = 0; k < n; k++) { const y0 = .14 + k * .13, hh = .26 - k * .012, rr = (.2 - k * .028) * (.9 + q() * .2), g = new THREE.ConeGeometry(rr, hh, 9, 2, true), p = g.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), zz = p.getZ(i), d = Math.hypot(x, zz); if (y < -hh / 2 + .001) { const a = Math.atan2(zz, x), j = 1 + .25 * Math.sin(a * 9 + k + seed) * (q() * .6 + .4); p.setXYZ(i, x * j, y - .03 * j, zz * j) } } g.computeVertexNormals(); g.translate(0, y0 + hh / 2, 0); L.push([g, new THREE.Matrix4()]) }
    const top = new THREE.ConeGeometry(.04, .14, 6); top.translate(0, .14 + n * .13 + .05, 0); L.push([top, new THREE.Matrix4()]); return mergeG(L) };
  const GP = [geoPino(6610), geoPino(6611), geoPino(6612)], MP = new THREE.MeshStandardMaterial({ map: T_PINO.c, bumpMap: T_PINO.z, bumpScale: 3, roughness: .9, color: "#ffffff", side: THREE.DoubleSide });
  const P = []; for (let k = 0; k < 60000 && P.length < 5200; k++) { const a = r() * 6.283, rr = 52 + Math.pow(r(), .7) * 270, x = Math.cos(a) * rr / .92, z = Math.sin(a) * rr / 1.05 - 12;
    if (r() > sstH(50, 140, rr) * .95 + .05) continue; if (Math.hypot(x - COLINA_T[0], z - COLINA_T[1]) < 34 + (r() < .5 ? 0 : 8)) continue; if (enCalle(x, z, 4) || distSendero(x, z) < 4 || (Math.abs(x) < 20 && z < -100 && z > -128)) continue;
    if (rr < 120 && typeof libreEn === "function" && !libreEn(x, z, 2.5, { zona: 1 })) continue; P.push([x, z, (8 + r() * 10) * (rr > 200 ? 1.2 : 1), k % 3]) }
  const ims = GP.map(g => { const m = new THREE.InstancedMesh(g, MP, P.length); m.count = 0; m.castShadow = true; m.receiveShadow = true; G.add(m); return m }), cc = new THREE.Color();
  P.forEach(([x, z, s, v]) => { const m = ims[v], i = m.count++; dummy.position.set(x, ALT_T(x, z) - .3, z); dummy.rotation.set((r() - .5) * .06, r() * 6, (r() - .5) * .06); dummy.scale.set(s * (.8 + r() * .3), s, s * (.8 + r() * .3)); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); const v2 = .55 + r() * .4; m.setColorAt(i, cc.setRGB(v2 * .85, v2, v2 * .85)) });
  // ---------- el piso de afuera: anillo polar de r = 244 a 345 (empalma con la grilla del pueblo, que llega a ±250)
  { const RS = []; for (let q = 236; q <= 345; q += 4) RS.push(q); const NA = 360, pos = [], col = [], idx = [], C1 = new THREE.Color("#2a3622"), C2 = new THREE.Color("#3a4430");
    RS.forEach(rr => { for (let j = 0; j <= NA; j++) { const a = j / NA * 6.283, x = Math.cos(a) * rr, z = Math.sin(a) * rr, n = fbm2(x * .02, z * .02, 3); pos.push(x, ALT_T(x, z) - .05, z); const c = C1.clone().lerp(C2, n); col.push(c.r, c.g, c.b) } });
    for (let i = 0; i < RS.length - 1; i++) for (let j = 0; j < NA; j++) { const a = i * (NA + 1) + j, b = a + NA + 1; idx.push(a, b, a + 1, a + 1, b, b + 1) }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals(); if (g.attributes.normal.getY(0) < 0) { const ix = g.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t } g.computeVertexNormals() }
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 })); m.receiveShadow = true; G.add(m) }
  // ---------- las SILUETAS: tres bandas cilíndricas sin niebla (lomas con dientes de pinos · montes · cordillera)
  const banda = (R, NA, alto, k) => { const pos = [], tt = [], idx = []; for (let j = 0; j <= NA; j++) { const a = j / NA * 6.283, h = alto(a); pos.push(Math.cos(a) * R, -60, Math.sin(a) * R - 12, Math.cos(a) * R, h, Math.sin(a) * R - 12); tt.push(0, 1) }
    for (let j = 0; j < NA; j++) { const a = j * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3) }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("tt", new THREE.Float32BufferAttribute(tt, 1)); g.setIndex(idx);
    const U = { uFog: { value: 0 }, uR: { value: R }, uCol: { value: new THREE.Color() }, uHor: { value: new THREE.Color() }, uRim: { value: new THREE.Color() }, uL: { value: LUNA_DIR.clone() }, uH: { value: alto(0) } };
    const m = new THREE.Mesh(g, new THREE.ShaderMaterial({ uniforms: U, side: THREE.DoubleSide, fog: false, depthWrite: false, transparent: true,
      vertexShader: `attribute float tt; varying float vT; varying vec3 vW; void main(){ vT = tt; vW = (modelMatrix * vec4(position, 1.)).xyz; gl_Position = projectionMatrix * viewMatrix * vec4(vW, 1.); }`,
      fragmentShader: `uniform vec3 uCol, uHor, uRim, uL; uniform float uFog; varying float vT; varying vec3 vW; void main(){ float y = vW.y; vec3 d = normalize(vec3(vW.x, 0., vW.z)); float lm = max(0., dot(d, normalize(vec3(uL.x, 0., uL.z))));
        vec3 c = mix(uHor, uCol, smoothstep(-30., 60., y) * .85 + .15); c += uRim * pow(lm, 6.) * .25; c = mix(c, uHor, uFog); gl_FragColor = vec4(c, 1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }` }));
    m.renderOrder = -.3 + k * -.01; m.frustumCulled = false; G.add(m); return { m, U } };
  const diente = (a, R, alto) => { const s = a * R / 4.2, f = s - Math.floor(s), hh = hash2(Math.floor(s), 7); return (1 - Math.abs(f - .5) * 2) * (3 + hh * 7) };
  const BANDAS = [banda(335, 3200, a => 26 + 14 * Math.sin(a * 3 + 1) + 7 * Math.sin(a * 7 + .4) + 4 * Math.sin(a * 17) + diente(a, 335), 0),
    banda(410, 900, a => .64 * (95 + 45 * Math.sin(a * 2 + .3) + 45 * Math.abs(Math.sin(a * 5 + 1)) + 14 * Math.sin(a * 13 + 2) + 6 * Math.sin(a * 31)), 1),
    banda(470, 700, a => .45 * (200 + 120 * Math.abs(Math.sin(a * 3 + 2)) + 60 * Math.abs(Math.sin(a * 7 + .6)) + 20 * Math.sin(a * 19)), 2)];
  // ---------- las NUBES: jirones largos (carteles mirando a la cámara) a 150–420 m de alto; bordes plateados del lado de la luna
  const T_NUBE = tex(512, 256, (g, w, h) => { const q = rng(6620); g.clearRect(0, 0, w, h); for (let k = 0; k < 70; k++) { const x = w * (.12 + q() * .76), y = h * (.35 + q() * .35) - Math.sin((x / w) * Math.PI) * h * .12, s = 26 + q() * 60, gr = g.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, `rgba(255,255,255,${.25 + q() * .2})`); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(x - s, y - s, 2 * s, 2 * s) } });
  const NN = 70, gN = new THREE.PlaneGeometry(1, 1), nub = new THREE.InstancedMesh(gN, new THREE.ShaderMaterial({ uniforms: { map: { value: T_NUBE }, uT: { value: 0 }, uLit: { value: new THREE.Color() }, uDark: { value: new THREE.Color() }, uL: { value: LUNA_DIR.clone() }, uOp: { value: .6 } }, transparent: true, depthWrite: false, fog: false,
    vertexShader: `uniform float uT; varying vec2 vUv; varying float vM; varying float vY; void main(){ vUv = uv; vec4 c = modelMatrix * instanceMatrix * vec4(0., 0., 0., 1.); float sx = length(instanceMatrix[0].xyz), sy = length(instanceMatrix[1].xyz);
      float a = uT * .004 * (1. + fract(c.x * .013)); float cs = cos(a), sn = sin(a); c.xz = mat2(cs, -sn, sn, cs) * c.xz; vec3 dir = normalize(c.xyz - cameraPosition);
      vM = 0.; vY = position.y + .5; vec4 mv = viewMatrix * c; mv.xy += position.xy * vec2(sx, sy); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform sampler2D map; uniform vec3 uLit, uDark, uL; uniform float uOp; varying vec2 vUv; varying float vY; void main(){ vec4 t = texture2D(map, vUv); float a = t.a; vec3 c = mix(uDark, uLit, smoothstep(.2, .9, vY) * .7 + .15);
      gl_FragColor = vec4(c, a * uOp);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }` }), NN);
  for (let i = 0; i < NN; i++) { const a = r() * 6.283, rr = 380 + r() * 90, sx = 70 + r() * 150; dummy.position.set(Math.cos(a) * rr, 70 + r() * 120, Math.sin(a) * rr); dummy.rotation.set(0, 0, 0); dummy.scale.set(sx, sx * (.18 + r() * .12), 1); dummy.updateMatrix(); nub.setMatrixAt(i, dummy.matrix) }
  nub.frustumCulled = false; nub.renderOrder = -.4; G.add(nub);
  return { G, BANDAS, nub, pinos: ims, P } })();
const ALT_LEJOS = ALT_T, SUELO_LEJOS = ALT_T;
const QS_L = new URLSearchParams(location.search);
function lejosReset() { }
// lejos(t): colores de las siluetas y de las nubes según el clima de este cuadro (ENVNOW); las nubes se corren despacio
function lejos(t) { const A = ENV[ENVNOW] || {}, hor = new THREE.Color(A.hor || "#141c2e"), top = new THREE.Color(A.top || "#02040c"), dia = A.cielo === 0 || A.cielo === 1;
  LEJOS_T.BANDAS.forEach(({ U }, k) => { U.uHor.value.copy(hor).multiplyScalar(+(QS_L.get("hk") || 1)); U.uCol.value.copy(hor).lerp(top, [.72, .5, .3][k]).multiplyScalar([.45, .62, .8][k]); U.uFog.value = 1 - Math.exp(-Math.pow((A.fog || 0) * [640, 900, 1300][k] * .2, 2)); U.uRim.value.set(dia ? "#ffb080" : "#8aa4d8").multiplyScalar(A.luna ?? (dia ? .6 : 0)) });
  const U = LEJOS_T.nub.material.uniforms; U.uT.value = t; U.uOp.value = (A.nubes ?? .5) * (dia ? .8 : .55); U.uDark.value.copy(hor).lerp(top, .5).multiplyScalar(dia ? 1 : .8); U.uLit.value.set(dia ? "#f0c0a0" : "#5a6a8a").lerp(hor, .3) }
// compatibilidad con escenas viejas
const CAMS_CAMPANA = {}, CAMS_VALLE = {}, ENV_LEJOS = {}, nubesTrepada = () => { }, envCampana = E => E;
