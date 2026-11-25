//@@MUNDO
// ---------- luz más cuidada: sombras más finas, luz de contorno fría del lado opuesto al sol
sun.shadow.mapSize.set(4096, 4096); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null } sun.shadow.bias = -.0003; sun.shadow.normalBias = .03;
const CONTRA = new THREE.DirectionalLight("#cfe0ff", 1.7); CONTRA.position.set(60, 30, 70); scene.add(CONTRA);

// ---------- el mar poco profundo, el agua honda y la costa (modo día)
const T_AGUA = tex(2048, 2048, (g, w, h) => { const r = rng(91); g.fillStyle = "#2fa3b4"; g.fillRect(0, 0, w, h);
  for (let k = 0; k < 9000; k++) { const x = r() * w, y = r() * h, l = 20 + r() * 60; g.strokeStyle = r() < .55 ? "rgba(255,255,255,.16)" : "rgba(10,70,90,.18)"; g.lineWidth = 2 + r() * 3; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 6, x + l, y); g.stroke() } }, [8, 8]);
// mapa de normales de olas (alturas = suma de ondas con frecuencias enteras → se repite sin costura)
const T_OLAS = (() => { const N = 512, c = document.createElement("canvas"); c.width = c.height = N; const g = c.getContext("2d"), im = g.createImageData(N, N), hgt = new Float32Array(N * N), r = rng(77);
  const ondas = Array.from({ length: 26 }, () => { const a = r() * 6.283, f = 1 + (r() * 9 | 0); return [Math.round(Math.cos(a) * f), Math.round(Math.sin(a) * f), r() * 6.283, 1 / Math.pow(f, 1.1)] });
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { let v = 0; for (const [kx, ky, ph, am] of ondas) { const q = Math.sin((kx * x + ky * y) / N * 6.283 + ph); v += am * (.55 * q + .45 * (1 - Math.abs(q))) } hgt[y * N + x] = v }
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const H = (i, j) => hgt[((j + N) % N) * N + (i + N) % N], dx = (H(x + 1, y) - H(x - 1, y)) * 3.2, dy = (H(x, y + 1) - H(x, y - 1)) * 3.2, l = Math.hypot(dx, dy, 1), o = (y * N + x) * 4;
    im.data[o] = (-dx / l * .5 + .5) * 255; im.data[o + 1] = (dy / l * .5 + .5) * 255; im.data[o + 2] = (1 / l * .5 + .5) * 255; im.data[o + 3] = 255 }
  g.putImageData(im, 0, 0); const T = new THREE.CanvasTexture(c); T.wrapS = T.wrapT = THREE.RepeatWrapping; T.colorSpace = THREE.NoColorSpace; T.anisotropy = 16; T.repeat.set(140, 140); return T })();
// el cielo que refleja el agua (mismo degradé del cielo de día + el sol) prefiltrado para el material físico
const ENV_AGUA = (() => { const es = new THREE.Scene(); es.add(new THREE.Mesh(new THREE.SphereGeometry(50, 64, 32), new THREE.ShaderMaterial({ side: THREE.BackSide,
    uniforms: { top: { value: new THREE.Color("#3f86d6") }, hor: { value: new THREE.Color("#d8ecf8") }, sd: { value: new THREE.Vector3(-56, 36, -40).normalize() } },
    vertexShader: "varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
    fragmentShader: "uniform vec3 top; uniform vec3 hor; uniform vec3 sd; varying vec3 vD; void main(){ float h = vD.y; vec3 c = mix(hor, top, smoothstep(-.02, .5, h)); c = mix(c, vec3(.42,.5,.52), smoothstep(.0, -.25, h)); c += vec3(1.,.9,.75) * (pow(max(dot(vD, sd), 0.), 900.) * 2.5 + pow(max(dot(vD, sd), 0.), 12.) * .35); gl_FragColor = vec4(c, 1.); }" })));
  const pm = new THREE.PMREMGenerator(R), rt = pm.fromScene(es, 0, .1, 100); pm.dispose(); return rt.texture })();
const M_AGUA = new THREE.MeshPhysicalMaterial({ color: "#13697e", roughness: .1, metalness: 0, ior: 1.33, specularIntensity: .35,
  normalMap: T_OLAS, normalScale: new THREE.Vector2(.6, .6), envMap: ENV_AGUA, envMapIntensity: 1.05, transparent: true, opacity: .9 });
const AGUA_T = { value: 0 };
M_AGUA.onBeforeCompile = sh => { sh.uniforms.uT = AGUA_T; sh.fragmentShader = "uniform float uT;\n" + sh.fragmentShader.replace("vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;",
  "vec3 n1 = texture2D( normalMap, vNormalMapUv * .37 + uT * vec2( .0021, .0013 ) ).xyz * 2. - 1.; vec3 n2 = texture2D( normalMap, vNormalMapUv * 1.0 + uT * vec2( -.0047, .0031 ) ).xyz * 2. - 1.; vec3 n3 = texture2D( normalMap, vNormalMapUv * 3.1 + uT * vec2( .0083, -.0069 ) ).xyz * 2. - 1.; vec3 mapN = normalize( vec3( n1.xy * 1.1 + n2.xy + n3.xy * .55, 1. ) );") };
const AGUA = part(new THREE.PlaneGeometry(3000, 3000), M_AGUA, 0, 0, 0, scene, 0); AGUA.rotation.x = -Math.PI / 2; AGUA.receiveShadow = true;
const T_ARENA = tex(2048, 2048, (g, w, h) => { const r = rng(92); g.fillStyle = "#c8b48a"; g.fillRect(0, 0, w, h); for (let k = 0; k < 30000; k++) { g.fillStyle = r() < .5 ? "rgba(120,100,70,.18)" : "rgba(255,240,210,.18)"; g.fillRect(r() * w, r() * h, 3, 3) } }, [12, 12]);
const FONDO = part(new THREE.PlaneGeometry(3000, 3000), SMt(T_ARENA, { roughness: 1 }), 0, -3, 0, scene, 0); FONDO.rotation.x = -Math.PI / 2;
// el agua honda: una mancha azul oscuro hacia +x (adonde quiere ir la tortuga)
const HONDA = part(new THREE.CircleGeometry(260, 48), new THREE.MeshStandardMaterial({ color: "#0b3a63", roughness: .2, metalness: .3, transparent: true, opacity: .9 }), 330, .02, -40, scene, 0); HONDA.rotation.x = -Math.PI / 2;
// la costa hacia −x: playa, pasto y colinas
const T_PASTO = tex(1024, 1024, (g, w, h) => { const r = rng(93); g.fillStyle = "#6f9a45"; g.fillRect(0, 0, w, h); for (let k = 0; k < 6000; k++) { const v = r(); g.strokeStyle = v < .4 ? "rgba(60,95,35,.55)" : v < .75 ? "rgba(150,185,80,.45)" : "rgba(200,170,80,.35)"; g.lineWidth = 2; const x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 6, y - 8 - r() * 10); g.stroke() } }, [30, 30]);
const COSTA = new THREE.Group(); scene.add(COSTA); COSTA.position.set(-110, 0, 0);
{ const pl = part(new THREE.PlaneGeometry(60, 700), SMt(T_ARENA), 30, .25, 0, COSTA, 0); pl.rotation.x = -Math.PI / 2; const ps = part(new THREE.PlaneGeometry(400, 700), SMt(T_PASTO), -170, .6, 0, COSTA, 0); ps.rotation.x = -Math.PI / 2;
  const r = rng(94); for (let k = 0; k < 14; k++) { const c = part(new THREE.SphereGeometry(30 + r() * 30, 18, 12), SMt(T_PASTO), -60 - r() * 180, -10, -300 + k * 46, COSTA, 0); c.scale.y = .45 + r() * .3 }
  for (let k = 0; k < 9; k++) { const x = -20 - r() * 40, z = -200 + k * 50; part(RB(6, 5, 6, .2), M_WALL[k % 5], x, 2.8, z, COSTA, 0); const t = part(new THREE.ConeGeometry(5, 3.4, 4), M_SHING, x, 7, z, COSTA, 0); t.rotation.y = Math.PI / 4 } }

// ---------- la tortuga (todo cuelga de TURT: si se inclina, se hunde o gira, el pueblo va con ella)
const TURT = new THREE.Group(); scene.add(TURT);
const SA = 34, SB = 27, SH = .3, RIM = .06;                                   // caparazón: semiejes en z y x, alto, altura del borde sobre el agua
const SY = (x, z) => { const q = 1 - (x / SB) ** 2 - (z / SA) ** 2; return RIM + SH * Math.pow(Math.max(0, q), .62) };   // altura del caparazón en (x, z)
// caparazón pintado a mano: escudos irregulares (celdas con borde torcido), anillos de crecimiento, rayones, liquen,
// algas y percebes hacia el borde; arriba, el pueblo con tierra, matas de pasto y calles de piedras sueltas (cada una distinta)
const T_CAPA = tex(2048, 2048, (g, w, h) => { const r = rng(95), X = x => (x / (2 * SB) + .5) * w, Z = z => (z / (2 * SA) + .5) * h;
  g.fillStyle = "#2a2416"; g.fillRect(0, 0, w, h);
  const S = []; for (let k = 0; k < 5; k++) S.push([(r() - .5) * 2, -24 + k * 12 + (r() - .5) * 2]);
  for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) S.push([sx * (12 + r() * 2), -18 + k * 12 + (r() - .5) * 3]);
  for (let k = 0; k < 26; k++) { const a = k / 26 * 6.28 + r() * .08; S.push([Math.cos(a) * SB * .9, Math.sin(a) * SA * .92]) }
  const P = S.map(([x, z]) => [X(x), Z(z)]), cerca = (x, y) => { let b = 0, bd = 1e12; P.forEach(([px, py], i) => { const d = (x - px) ** 2 + (y - py) ** 2; if (d < bd) { bd = d; b = i } }); return b };
  const fuera = (x, y) => ((x / w - .5) / .5) ** 2 + ((y / h - .5) / .5) ** 2 > 1.04;
  P.forEach(([px, py], i) => { const pts = []; for (let k = 0; k < 40; k++) { const a = k / 40 * 6.28; let d = 4; while (d < 700) { const x = px + Math.cos(a) * d, y = py + Math.sin(a) * d; if (cerca(x, y) !== i || fuera(x, y)) break; d += 6 } pts.push([px + Math.cos(a) * Math.max(4, d - 8), py + Math.sin(a) * Math.max(4, d - 8)]) }
    const tono = ["#6e5e36", "#5e5030", "#7a6838", "#54482a", "#68583a", "#73623c"][r() * 6 | 0];
    aMano(g, pts, r, 14); const gr = g.createRadialGradient(px - 20, py - 20, 10, px, py, 260); gr.addColorStop(0, rgbj("#8a7a4a", r, 26)); gr.addColorStop(1, rgbj(tono, r, 20)); g.fillStyle = gr; g.fill();
    for (let q = .9; q > .15; q -= .07 + r() * .06) { aMano(g, pts.map(([x, y]) => [px + (x - px) * q + (r() - .5) * 6, py + (y - py) * q + (r() - .5) * 6]), r, 10); g.strokeStyle = r() < .5 ? "rgba(30,22,10,.32)" : "rgba(220,200,150,.14)"; g.lineWidth = 1.5 + r() * 3; g.stroke() }
    aMano(g, pts, r, 14); g.strokeStyle = "#1e1810"; g.lineWidth = 9 + r() * 6; g.stroke(); g.strokeStyle = "rgba(230,210,160,.18)"; g.lineWidth = 2; g.stroke() });
  grietas(g, r, 140, w, h, "rgba(20,14,8,.45)");
  for (let k = 0; k < 260; k++) { const x = r() * w, y = r() * h, a = r() * 6.28, L = 10 + r() * 60; g.strokeStyle = "rgba(235,220,180,.25)"; g.lineWidth = 1 + r() * 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke() }
  for (let k = 0; k < 70; k++) { const cx = r() * w, cy = r() * h, n = 6 + r() * 20; for (let s = 0; s < n; s++) { g.fillStyle = `rgba(${150 + r() * 50 | 0},${160 + r() * 40 | 0},${120 + r() * 30 | 0},${.25 + r() * .35})`; g.beginPath(); g.arc(cx + (r() - .5) * 60, cy + (r() - .5) * 60, 2 + r() * 9, 0, 7); g.fill() } }
  for (let k = 0; k < 3000; k++) { const a = r() * 6.28, q = .78 + Math.pow(r(), .5) * .24, x = w / 2 + Math.cos(a) * w / 2 * q, y = h / 2 + Math.sin(a) * h / 2 * q;
    if (r() < .8) { g.fillStyle = `rgba(${50 + r() * 30 | 0},${90 + r() * 40 | 0},${40 + r() * 20 | 0},${.2 + r() * .4})`; g.beginPath(); g.ellipse(x, y, 3 + r() * 12, 2 + r() * 6, a, 0, 7); g.fill() }
    else { g.fillStyle = "rgba(30,26,18,.35)"; g.beginPath(); g.arc(x, y, 2 + r() * 6, 0, 7); g.fill() } }
  g.save(); const tp = Array.from({ length: 30 }, (_, i) => { const a = i / 30 * 6.28; return [w / 2 + Math.cos(a) * w * .4 * (.95 + r() * .08), h / 2 + Math.sin(a) * h * .42 * (.95 + r() * .08)] }); aMano(g, tp, r, 40); g.clip();
  g.fillStyle = "#86704f"; g.fillRect(0, 0, w, h); manchas(g, r, 120, w, h, "#5a4a32", 40, 220, .1, .3); manchas(g, r, 90, w, h, "#c8b48a", 40, 200, .06, .18); manchas(g, r, 90, w, h, "#5a7a34", 30, 180, .15, .4);
  for (let k = 0; k < 2600; k++) { const x = r() * w, y = r() * h; g.strokeStyle = `rgba(${60 + r() * 50 | 0},${100 + r() * 50 | 0},${30 + r() * 30 | 0},${.4 + r() * .4})`; g.lineWidth = 1.5 + r() * 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 10, y - 8 - r() * 14); g.stroke() }
  for (let k = 0; k < 1500; k++) { g.fillStyle = rgbj(r() < .5 ? "#9a8a72" : "#5a4a38", r, 40, .8); g.beginPath(); g.ellipse(r() * w, r() * h, 2 + r() * 5, 1.5 + r() * 4, r() * 3, 0, 7); g.fill() }
  const calle = (x0, z0, x1, z1, an) => { for (let q = 0; q <= 1; q += .0025) { const x = X(lerp(x0, x1, q)) + Math.sin(q * 9) * 10, y = Z(lerp(z0, z1, q)); for (let k = 0; k < 3; k++) { if (r() < .12) continue; const px = x + (r() - .5) * an, py = y + (r() - .5) * an, sz = 7 + r() * 10, pts = Array.from({ length: 6 }, (_, i) => { const a = i / 6 * 6.28 + r() * .5; return [px + Math.cos(a) * sz * (.7 + r() * .4), py + Math.sin(a) * sz * (.6 + r() * .4)] });
      aMano(g, pts, r, 4); g.fillStyle = rgbj(["#9a9082", "#8a8274", "#a89c88", "#7e7466"][r() * 4 | 0], r, 30); g.fill(); g.strokeStyle = "rgba(40,30,20,.5)"; g.lineWidth = 2; g.stroke(); g.fillStyle = "rgba(255,250,235,.15)"; g.beginPath(); g.arc(px - sz * .25, py - sz * .25, sz * .3, 0, 7); g.fill() } } };
  calle(0, -28, 0, 28, 120); calle(-24, 0, 24, 0, 96); g.restore() });
// ---------- percebes de verdad (conos huecos con la boca arriba), en el borde del caparazón y en el costado
const GEO_PERCEBE = new THREE.LatheGeometry([[0.05, .16], [.08, .3], [.115, .31], [.2, .17], [.3, 0]].map(([x, y]) => new THREE.Vector2(x, y)), 12);
const M_PERCEBE = new THREE.MeshStandardMaterial({ color: "#7e8070", roughness: .95, side: THREE.DoubleSide });
{ const r = rng(161), N = 2200, pm = new THREE.InstancedMesh(GEO_PERCEBE, M_PERCEBE, N); pm.castShadow = pm.receiveShadow = true; TURT.add(pm); const cc = new THREE.Color(); let n = 0;
  for (let c = 0; c < 150 && n < N; c++) { const a0 = r() * 6.28, f0 = .91 + r() * .08, cnt = 6 + (r() * 14 | 0);
    for (let k = 0; k < cnt && n < N; k++) { const a = a0 + (r() - .5) * .08, f = f0 + (r() - .5) * .04, x = Math.cos(a) * SB * f, z = Math.sin(a) * SA * f, y = SY(x, z);
      dummy.position.set(x, y - .02, z); dummy.rotation.set((r() - .5) * .5, r() * 6, (r() - .5) * .5); dummy.scale.setScalar(.4 + r() * .9); dummy.updateMatrix(); pm.setMatrixAt(n, dummy.matrix); pm.setColorAt(n, cc.set(["#7e8070", "#6e7262", "#8a8a76", "#6a6a5a"][r() * 4 | 0])); n++ } }
  pm.count = n; pm.visible = false }

const M_CAPA = SMt(T_CAPA, { roughness: .85, bumpMap: T_CAPA, bumpScale: 2.5 });
// ---------- flores de verdad (tallo, pétalos, centro y hojas, con relieve y sombra) en matas, y pasto 3D, sobre el anillo verde del caparazón
{ const r = rng(160), N = 1100, evitar = [[-14, 24], [-3, 25], [18.5, 3], [-18, -14], [16, 16], [-16, 14], [15, -14], [-9, 2], [-12, -11.5]];
  const tallo = new THREE.InstancedMesh(new THREE.CylinderGeometry(.012, .018, 1, 5), SM("#4f7a32"), N), cen = new THREE.InstancedMesh(new THREE.SphereGeometry(.045, 10, 8), new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .8 }), N),
    pet = new THREE.InstancedMesh(new THREE.SphereGeometry(.06, 10, 6), new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .7 }), N * 6), hoj = new THREE.InstancedMesh(new THREE.SphereGeometry(.05, 8, 6), SM("#3f6a2a", { roughness: .8 }), N * 2);
  [tallo, cen, pet, hoj].forEach(m => { m.castShadow = m.receiveShadow = true; TURT.add(m) });
  const COL = [["#f4f2ea", "#f2c41e"], ["#f2d23a", "#c98a1a"], ["#e889a8", "#f2d23a"], ["#9a6ad0", "#f2e06a"], ["#7aa0e8", "#f4f2ea"], ["#ffffff", "#e0a020"], ["#e05a4a", "#2a1a10"]], cc = new THREE.Color();
  let n = 0, np = 0, nh = 0;
  for (let c = 0; c < 130 && n < N; c++) { const a0 = r() * 6.28, f0 = .8 + r() * .1, [pc, ccn] = COL[r() * COL.length | 0], cnt = 5 + (r() * 12 | 0);
    for (let k = 0; k < cnt && n < N; k++) { const a = a0 + (r() - .5) * .1, f = f0 + (r() - .5) * .05, x = Math.cos(a) * SB * f, z = Math.sin(a) * SA * f;
      if (evitar.some(([ex, ez]) => (ex - x) ** 2 + (ez - z) ** 2 < 20)) continue;
      const y = SY(x, z), hgt = .22 + r() * .35, sz = .8 + r() * .55, tilt = (r() - .5) * .5;
      dummy.position.set(x, y + hgt / 2, z); dummy.rotation.set((r() - .5) * .3, 0, (r() - .5) * .3); dummy.scale.set(1, hgt, 1); dummy.updateMatrix(); tallo.setMatrixAt(n, dummy.matrix);
      dummy.position.set(x, y + hgt, z); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(sz); dummy.updateMatrix(); cen.setMatrixAt(n, dummy.matrix); cen.setColorAt(n, cc.set(ccn));
      const npet = 5 + (r() * 2 | 0); for (let p = 0; p < 6; p++) { if (p >= npet) dummy.scale.setScalar(0); else { const b = p / npet * 6.28 + r() * .2; dummy.position.set(x + Math.cos(b) * .075 * sz, y + hgt + .005, z + Math.sin(b) * .075 * sz); dummy.rotation.set(0, -b, .25 + tilt); dummy.scale.set(sz * 1.15, sz * .3, sz * .6) } dummy.updateMatrix(); pet.setMatrixAt(np, dummy.matrix); pet.setColorAt(np, cc.set(pc)); np++ }
      for (let q = 0; q < 2; q++) { const b = r() * 6.28; dummy.position.set(x + Math.cos(b) * .06, y + hgt * (.2 + r() * .3), z + Math.sin(b) * .06); dummy.rotation.set(0, -b, .6); dummy.scale.set(2, .3, .8); dummy.updateMatrix(); hoj.setMatrixAt(nh++, dummy.matrix) } n++ } }
  tallo.count = cen.count = n; pet.count = np; hoj.count = nh;
  // pasto 3D en matas
  const P = 9000, pa = new THREE.InstancedMesh(new THREE.ConeGeometry(.035, 1, 3), new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .85 }), P); pa.receiveShadow = true; TURT.add(pa); let m = 0;
  for (let c = 0; c < 600 && m < P; c++) { const a0 = r() * 6.28, f0 = .78 + r() * .16; if (evitar.some(([ex, ez]) => (ex - Math.cos(a0) * SB * f0) ** 2 + (ez - Math.sin(a0) * SA * f0) ** 2 < 16)) continue;
    for (let k = 0; k < 15 && m < P; k++) { const a = a0 + (r() - .5) * .03, f = f0 + (r() - .5) * .015, x = Math.cos(a) * SB * f, z = Math.sin(a) * SA * f, hg = .2 + r() * .45;
      dummy.position.set(x, SY(x, z) + hg / 2, z); dummy.rotation.set((r() - .5) * .6, r() * 6, (r() - .5) * .6); dummy.scale.set(1, hg, 1); dummy.updateMatrix(); pa.setMatrixAt(m, dummy.matrix); pa.setColorAt(m, cc.set(["#4f7a32", "#6a9a3a", "#3f6a2a", "#8aa84a", "#7a8a3a"][r() * 5 | 0])); m++ } }
  pa.count = m }

// el costado del caparazón: costuras de los escudos, chorreado de sal, flecos de algas y racimos de percebes
const T_LADO = tex(2048, 512, (g, w, h) => { const r = rng(99), gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#5a4c2e"); gr.addColorStop(.55, "#3a3220"); gr.addColorStop(1, "#1e2a1c"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  let x = 0; while (x < w) { x += 50 + r() * 40; g.strokeStyle = "#1a140c"; g.lineWidth = 5 + r() * 4; g.beginPath(); g.moveTo(x, 0); for (let y = 0; y < h; y += 30) g.lineTo(x + (r() - .5) * 10, y); g.stroke() }
  manchas(g, r, 80, w, h, "#2a4a2a", 20, 120, .15, .4);
  for (let k = 0; k < 500; k++) { const x0 = r() * w, y0 = r() * h * .5, L = 30 + r() * 200; g.strokeStyle = r() < .5 ? "rgba(230,230,215,.18)" : "rgba(10,20,10,.25)"; g.lineWidth = 1 + r() * 3; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + (r() - .5) * 6, y0 + L); g.stroke() }
  for (let k = 0; k < 900; k++) { const x0 = r() * w, y0 = h * (.45 + r() * .55); g.strokeStyle = `rgba(${40 + r() * 30 | 0},${100 + r() * 50 | 0},${40 + r() * 20 | 0},${.4 + r() * .4})`; g.lineWidth = 2 + r() * 3; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 + (r() - .5) * 20, y0 + 20, x0 + (r() - .5) * 14, y0 + 30 + r() * 50); g.stroke() }
  for (let k = 0; k < 60; k++) { g.fillStyle = "rgba(20,16,10,.3)"; g.beginPath(); g.ellipse(r() * w, h * (.3 + r() * .5), 10 + r() * 30, 6 + r() * 14, 0, 0, 7); g.fill() } });

{ const geo = new THREE.PlaneGeometry(2 * SB, 2 * SA, 200, 250); geo.rotateX(-Math.PI / 2); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setY(i, SY(p.getX(i), p.getZ(i)));
  // solo el óvalo del caparazón: las esquinas del plano quedaban como una placa cuadrada oscura vista desde arriba (pedido del dueño)
  { const ix = geo.index.array, keep = [], dentro = i => (p.getX(i) / SB) ** 2 + (p.getZ(i) / SA) ** 2 < 1; for (let k = 0; k < ix.length; k += 3) if (dentro(ix[k]) && dentro(ix[k + 1]) && dentro(ix[k + 2])) keep.push(ix[k], ix[k + 1], ix[k + 2]); geo.setIndex(keep) }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, M_CAPA); m.castShadow = m.receiveShadow = true; TURT.add(m);
  // el costado del caparazón hasta el agua, con el borde aserrado y percebes
  { const tapa = new THREE.Mesh(new THREE.RingGeometry(.985, 1.06, 96, 1), SMt(T_LADO, { roughness: .9 })); tapa.rotation.x = -Math.PI / 2; tapa.scale.set(SB, SA, 1); tapa.position.y = RIM + .02; tapa.receiveShadow = true; TURT.add(tapa) }   // el borde, entre el óvalo y el costado
  const lado = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.08, 9, 64, 1, true), SMt(T_LADO, { roughness: .9, bumpMap: T_LADO, bumpScale: 2 })); lado.scale.set(SB, 1, SA); lado.position.y = RIM - 4.4; lado.castShadow = true; TURT.add(lado);
  const bor = new THREE.InstancedMesh(new THREE.ConeGeometry(1.4, 2.4, 4), SM("#3a3220", { roughness: 1 }), 48); TURT.add(bor); for (let k = 0; k < 48; k++) { const a = k / 48 * Math.PI * 2; dummy.position.set(Math.cos(a) * SB * 1.04, RIM - .4, Math.sin(a) * SA * 1.04); dummy.rotation.set(Math.PI / 2 + .3, 0, -a + Math.PI / 2); dummy.scale.setScalar(1); dummy.updateMatrix(); dummy.lookAt(Math.cos(a) * 99, RIM - 2, Math.sin(a) * 99); dummy.updateMatrix(); bor.setMatrixAt(k, dummy.matrix) }
  const perc = new THREE.InstancedMesh(GEO_PERCEBE, M_PERCEBE, 420); TURT.add(perc); const r = rng(96); for (let k = 0; k < 420; k++) { const a = r() * Math.PI * 2, y = RIM - 1 - r() * 7; dummy.position.set(Math.cos(a) * SB * (1.02 + (RIM - y) * .008), y, Math.sin(a) * SA * (1.02 + (RIM - y) * .008)); dummy.rotation.set(0, 0, 0); dummy.lookAt(dummy.position.x * 2, y, dummy.position.z * 2); dummy.rotateX(Math.PI / 2 + (r() - .5) * .4); dummy.scale.setScalar(.8 + r() * 1.6); dummy.updateMatrix(); perc.setMatrixAt(k, dummy.matrix) } }
// ---------- relieve de verdad en el piso (pedido del dueño: nada dibujado plano): empedrado 3D en las calles, piedritas y
// terrones sueltos en la tierra. Cada piedra es un canto irregular distinto (geometría deformada), con su color y su sombra.
const PISO_LIBRE = [[-9, 2, 2.6], [-12, -11.5, 2.6], [2.4, -2.5, 1.2], [-9, -2.6, 1.6], [13.2, 2, 2], [13, -6, 2.2]];
{ const r = rng(321), libre = (x, z) => PISO_LIBRE.every(([a, b, rr]) => (a - x) ** 2 + (b - z) ** 2 > rr * rr) && (x / SB) ** 2 + (z / SA) ** 2 < .8;
  const canto = s => { const g = new THREE.IcosahedronGeometry(1, 2), p = g.attributes.position, q = rng(s), v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const k = 1 + Math.sin(v.x * 3.1 + s) * .12 + Math.sin(v.z * 2.7 + s * 2) * .12 + (q() - .5) * .05; p.setXYZ(i, v.x * k, Math.max(-.2, v.y) * k, v.z * k) } g.computeVertexNormals(); return g };
  const piedraM = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .92, bumpMap: T_CAPA, bumpScale: 1.2 }), cc = new THREE.Color();
  const geos = [canto(1), canto(2), canto(3)], N = 2400, mallas = geos.map(g => { const m = new THREE.InstancedMesh(g, piedraM, N); m.castShadow = m.receiveShadow = true; TURT.add(m); m.count = 0; return m });
  const poner = (x, z, sx, sy, sz, col) => { const m = mallas[r() * 3 | 0]; if (m.count >= N) return; const y = SY(x, z); dummy.position.set(x, y - sy * .25, z); dummy.rotation.set((r() - .5) * .15, r() * 6.28, (r() - .5) * .15); dummy.scale.set(sx, sy, sz); dummy.updateMatrix(); m.setMatrixAt(m.count, dummy.matrix); m.setColorAt(m.count, cc.set(col).multiplyScalar(.8 + r() * .35)); m.count++ };
  const PIED = ["#9a9082", "#8a8274", "#a89c88", "#7e7466", "#b0a690", "#857a6a"];
  // calles: la principal (a lo largo, z) y la que la cruza (x), con el mismo vaivén que la textura
  for (let z = -27; z <= 27; z += .3) { const cx = Math.sin((z + 28) / 56 * 9) * .27; for (let x = -1.55; x <= 1.55; x += .34) { const px = cx + x + (r() - .5) * .12, pz = z + (r() - .5) * .1; if (r() < .1 || !libre(px, pz)) continue; poner(px, pz, .13 + r() * .06, .05 + r() * .04, .12 + r() * .05, PIED[r() * PIED.length | 0]) } }
  for (let x = -23; x <= 23; x += .3) { for (let z = -1.5; z <= 1.5; z += .34) { const px = x + (r() - .5) * .1, pz = z + (r() - .5) * .12; if (Math.abs(px) < 1.8 || r() < .1 || !libre(px, pz)) continue; poner(px, pz, .13 + r() * .06, .05 + r() * .04, .12 + r() * .05, PIED[r() * PIED.length | 0]) } }
  // piedritas y terrones en la tierra del pueblo
  for (let k = 0; k < 2600; k++) { const a = r() * 6.28, f = Math.sqrt(r()) * .8, x = Math.cos(a) * SB * f, z = Math.sin(a) * SA * f; if (Math.abs(x) < 1.8 || Math.abs(z) < 1.7 || !libre(x, z)) continue; const s = .03 + Math.pow(r(), 3) * .16; poner(x, z, s * (1 + r()), s * (.6 + r() * .5), s * (1 + r()), r() < .6 ? PIED[r() * PIED.length | 0] : ["#6a5238", "#5a4630", "#7a6044"][r() * 3 | 0]) }
  mallas.forEach(m => { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true }) }
// piel de la tortuga pintada escama por escama (cabeza, cuello con pliegues, aletas) y pico gastado
function escamas(g, r, w, h, n, tam, base, borde = "rgba(25,28,18,.55)") { const puestas = [];
  for (let k = 0; k < n * 6 && puestas.length < n; k++) { const x = r() * w, y = r() * h, s = tam(x, y) * (.7 + r() * .6); if (puestas.some(([px, py, ps]) => (px - x) ** 2 + (py - y) ** 2 < ((ps + s) * .82) ** 2)) continue; puestas.push([x, y, s]) }
  puestas.forEach(([x, y, s]) => { const nv = 5 + (r() * 4 | 0), pts = Array.from({ length: nv }, (_, i) => { const a = i / nv * 6.28 + r() * .4; return [x + Math.cos(a) * s * (.75 + r() * .3), y + Math.sin(a) * s * (.75 + r() * .3)] });
    aMano(g, pts, r, s * .3); const gr = g.createRadialGradient(x - s * .3, y - s * .3, s * .1, x, y, s * 1.1); gr.addColorStop(0, rgbj(base, r, 30)); gr.addColorStop(1, rgbj("#4a4a34", r, 20)); g.fillStyle = gr; g.fill(); g.strokeStyle = borde; g.lineWidth = Math.max(1.5, s * .12); g.stroke() });
  return puestas }
const T_CAB = tex(2048, 1024, (g, w, h) => { const r = rng(97); g.fillStyle = "#3e4030"; g.fillRect(0, 0, w, h);
  escamas(g, r, w, h, 900, (x, y) => 14 + 34 * Math.sin(Math.PI * y / h) ** 2 * (y < h * .5 ? 1.3 : .6), "#8a8a68");
  for (let k = 0; k < 7; k++) { const y0 = h * (.35 + r() * .3), x0 = r() * w; g.strokeStyle = `rgba(220,200,120,${.3 + r() * .25})`; g.lineWidth = 8 + r() * 14; g.lineCap = "round"; g.beginPath(); g.moveTo(x0, y0); g.bezierCurveTo(x0 + 80, y0 + (r() - .5) * 60, x0 + 160, y0 + (r() - .5) * 60, x0 + 240 + r() * 160, y0 + (r() - .5) * 80); g.stroke() }
  manchas(g, r, 60, w, h, "#2a2a1c", 30, 140, .1, .3); manchas(g, r, 40, w, h, "#d8d0a8", 30, 120, .05, .15);
  for (let k = 0; k < 400; k++) { const x = r() * w, y = r() * h; g.strokeStyle = "rgba(25,25,15,.35)"; g.lineWidth = 1 + r() * 1.5; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 10, y + (r() - .5) * 10, x + 20 + r() * 30, y + (r() - .5) * 8); g.stroke() } });
const PLIEGUES = (() => { const r = rng(171), a = []; let y = .04; while (y < .96) { a.push(y); y += .05 + r() * .09 } return a })();
const T_CUELLO = tex(2048, 1024, (g, w, h) => { const r = rng(98); g.fillStyle = "#4a4a36"; g.fillRect(0, 0, w, h);
  escamas(g, r, w, h, 1400, () => 9 + r() * 10, "#8e8c6c");
  PLIEGUES.forEach(py => { const y0 = py * h, amp = 6 + r() * 14, f = 1 + (r() * 3 | 0), ph = r() * 6; for (const [dy, col, lw] of [[0, "rgba(20,20,12,.7)", 7 + r() * 5], [9, "rgba(225,215,170,.25)", 4], [-8, "rgba(20,20,12,.25)", 10]]) { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); for (let x = 0; x <= w; x += 16) { const y = y0 + dy + Math.sin(x / w * 6.283 * f + ph) * amp + (r() - .5) * 3; x ? g.lineTo(x, y) : g.moveTo(x, y) } g.stroke() } });
  for (let k = 0; k < 6; k++) { const x0 = r() * w; g.strokeStyle = `rgba(215,195,110,${.25 + r() * .2})`; g.lineWidth = 10 + r() * 16; g.beginPath(); g.moveTo(x0, 0); for (let y = 0; y <= h; y += 40) g.lineTo(x0 + Math.sin(y * .01 + k) * 30 + (r() - .5) * 8, y); g.stroke() }
  manchas(g, r, 50, w, h, "#24241a", 30, 140, .1, .3) });
const T_ALETA = tex(2048, 1024, (g, w, h) => { const r = rng(197); g.fillStyle = "#3e4030"; g.fillRect(0, 0, w, h); escamas(g, r, w, h, 700, (x) => 10 + 40 * Math.abs(Math.sin(x / w * 6.283)), "#8a8a68"); manchas(g, r, 60, w, h, "#2a2a1c", 30, 160, .1, .3);
  for (let k = 0; k < 40; k++) { g.fillStyle = "rgba(220,215,200,.5)"; g.beginPath(); g.arc(r() * w, r() * h, 3 + r() * 8, 0, 7); g.fill() } });
const T_PICO = tex(1024, 512, (g, w, h) => { const r = rng(198), gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#5a5642"); gr.addColorStop(.5, "#3a382a"); gr.addColorStop(1, "#24231a"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (let k = 0; k < 500; k++) { const x = r() * w, y = r() * h, L = 10 + r() * 50; g.strokeStyle = r() < .5 ? "rgba(255,245,210,.12)" : "rgba(0,0,0,.25)"; g.lineWidth = 1 + r() * 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + L, y + (r() - .5) * 8); g.stroke() } manchas(g, r, 30, w, h, "#c8c0a0", 20, 90, .05, .15) });
const T_PARPADO = tex(1024, 512, (g, w, h) => { const r = rng(200); g.fillStyle = "#5e5248"; g.fillRect(0, 0, w, h); manchas(g, r, 40, w, h, "#3a3a28", 20, 100, .15, .35);
  for (let k = 0; k < 26; k++) { const y0 = r() * h; g.strokeStyle = "rgba(25,25,15,.55)"; g.lineWidth = 2 + r() * 3; g.beginPath(); for (let x = 0; x <= w; x += 20) { const y = y0 + Math.sin(x * .02 + k) * 6 + (r() - .5) * 3; x ? g.lineTo(x, y) : g.moveTo(x, y) } g.stroke(); g.strokeStyle = "rgba(220,210,170,.2)"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, y0 + 5); g.lineTo(w, y0 + 5 + (r() - .5) * 8); g.stroke() } });
// el ojo: globo oscuro y húmedo con venitas, iris dorado con fibras radiales, pecas, anillo oscuro y pupila redonda
const T_IRIS = tex(2048, 1024, (g, w, h) => { const r = rng(199), cx = w * .25, cy = h * .5, R = 310;
  g.fillStyle = "#2a1e14"; g.fillRect(0, 0, w, h); manchas(g, r, 30, w, h, "#4a3022", 40, 200, .2, .5);
  for (let k = 0; k < 40; k++) { let x = cx + (r() - .5) * 900, y = cy + (r() - .5) * 700; g.strokeStyle = "rgba(140,40,30,.4)"; g.lineWidth = 1 + r() * 2; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 8; s++) { x += (r() - .5) * 40; y += (r() - .5) * 40; g.lineTo(x, y) } g.stroke() }
  const gr = g.createRadialGradient(cx, cy, 20, cx, cy, R); gr.addColorStop(0, "#1a0c04"); gr.addColorStop(.3, "#5a3010"); gr.addColorStop(.6, "#8a5a1e"); gr.addColorStop(.85, "#6a4214"); gr.addColorStop(1, "#1e1208"); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
  for (let k = 0; k < 700; k++) { const a = r() * 6.283, r0 = R * (.22 + r() * .2), r1 = R * (.6 + r() * .38); g.strokeStyle = r() < .5 ? `rgba(255,${200 + r() * 55 | 0},${110 + r() * 60 | 0},${.15 + r() * .3})` : `rgba(80,${30 + r() * 30 | 0},5,${.15 + r() * .3})`; g.lineWidth = 1 + r() * 3; g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); g.quadraticCurveTo(cx + Math.cos(a + .05) * (r0 + r1) / 2, cy + Math.sin(a + .05) * (r0 + r1) / 2, cx + Math.cos(a + (r() - .5) * .1) * r1, cy + Math.sin(a) * r1); g.stroke() }
  for (let k = 0; k < 30; k++) { const a = r() * 6.283, rr = R * (.45 + r() * .4); g.fillStyle = "rgba(60,25,5,.4)"; g.beginPath(); g.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 4 + r() * 12, 0, 7); g.fill() }
  g.strokeStyle = "rgba(20,10,4,.85)"; g.lineWidth = 26; g.beginPath(); g.arc(cx, cy, R - 10, 0, 7); g.stroke();
  g.fillStyle = "#050302"; g.beginPath(); g.arc(cx, cy, R * .3, 0, 7); g.fill() });
const T_PIEL = T_CAB;
const M_PIEL = SMt(T_CAB, { roughness: .7, bumpMap: T_CAB, bumpScale: 3 }), M_CUELLO = SMt(T_CUELLO, { roughness: .72, bumpMap: T_CUELLO, bumpScale: 3.5 }), M_ALETA = SMt(T_ALETA, { roughness: .85, bumpMap: T_ALETA, bumpScale: 2, emissive: "#2a2a1e", emissiveIntensity: .6 });
const M_PICO = SMt(T_PICO, { roughness: .45, bumpMap: T_PICO, bumpScale: 1 }), M_PARPADO = SMt(T_PARPADO, { roughness: .7, bumpMap: T_PARPADO, bumpScale: 2.5, side: THREE.DoubleSide });
// el cuello con pliegues de verdad (la geometría se arruga donde la textura tiene los pliegues)
const GEO_CUELLO = (() => { const geo = new THREE.CylinderGeometry(4.6, 6, 14, 192, 192, true), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), v = (y + 7) / 14, a = Math.atan2(z, x);
    let k = 1 + Math.sin(a * 3 + v * 5) * .02; PLIEGUES.forEach(py => { k -= .055 * Math.exp(-(((v - (1 - py)) / .018) ** 2)) * (1 + .4 * Math.sin(a * 2 + py * 20)) }); k += .02 * Math.sin(v * 40 + a * 1.5);
    p.setX(i, x * k); p.setZ(i, z * k) } geo.computeVertexNormals(); return geo })();
const OJOS = [];
function ojoTortuga(s, pos, nrm) { const G = new THREE.Group(); CABEZA.add(G); G.position.copy(pos); G.scale.setScalar(.85); G.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), nrm);
  G.add(new THREE.Mesh(new THREE.SphereGeometry(1.9, 64, 40), new THREE.MeshStandardMaterial({ map: T_IRIS, roughness: .25 })));
  G.add(new THREE.Mesh(new THREE.SphereGeometry(1.97, 48, 32), new THREE.MeshPhysicalMaterial({ color: "#ffffff", transparent: true, opacity: .14, roughness: .02, clearcoat: 1, clearcoatRoughness: 0, depthWrite: false })));
  for (const [dx, dy, rr] of [[-.55, .75, .36], [.4, -.25, .13], [-.15, .95, .1]]) { const b = new THREE.Mesh(new THREE.SphereGeometry(rr, 12, 8), new THREE.MeshBasicMaterial({ color: "#fffdf5" })); b.position.set(dx * s, dy, 1.72); G.add(b) }
  const sup = new THREE.Mesh(new THREE.SphereGeometry(2.18, 48, 24, 0, Math.PI * 2, 0, Math.PI * .3), M_PARPADO); sup.rotation.x = .22; sup.castShadow = true; G.add(sup);
  const inf = new THREE.Mesh(new THREE.SphereGeometry(2.12, 48, 24, 0, Math.PI * 2, Math.PI * .74, Math.PI * .26), M_PARPADO); inf.rotation.x = -.2; G.add(inf);
  
  // borde del párpado: labio húmedo y oscuro que abraza el globo, con un brillo fino (el ojo «se lee» desde lejos)
  const labio = new THREE.MeshPhysicalMaterial({ color: "#4a3e34", roughness: .45, clearcoat: .6, clearcoatRoughness: .3 });
  { const a = new THREE.Mesh(new THREE.TorusGeometry(2.18 * Math.sin(Math.PI * .3), .08, 10, 72), labio); a.position.y = 2.18 * Math.cos(Math.PI * .3); a.rotation.x = Math.PI / 2; sup.add(a);
    const b = new THREE.Mesh(new THREE.TorusGeometry(2.12 * Math.sin(Math.PI * .74), .07, 10, 72), labio); b.position.y = 2.12 * Math.cos(Math.PI * .74); b.rotation.x = Math.PI / 2; inf.add(b) }
  // lagrimal y humedad en el ángulo de adelante
  { const l = new THREE.Mesh(new THREE.SphereGeometry(.28, 16, 12), new THREE.MeshPhysicalMaterial({ color: "#6a3a30", roughness: .2, clearcoat: 1 })); l.position.set(-1.55 * s, -.2, 1.0); G.add(l) }
  G.userData.sup = sup; OJOS.push(G);
  return G }
// ---------- cabeza ultradetallada (pedido del dueño, con una foto de tortuga gigante de referencia): hocico chato con narinas
// hundidas, boca de cuerno con labio grueso, ojos hundidos con párpados pesados, piel de cuero rajada en miles de placas,
// costras de barro seco, arrugas y papada. Relieve de verdad: la geometría se deforma y además lleva un mapa de desplazamiento pintado.
function pintarDoble(w, h, fn) { const a = mk(w, h), b = mk(w, h); fn(a.getContext("2d"), b.getContext("2d"), w, h); const ta = new THREE.CanvasTexture(a), tb = new THREE.CanvasTexture(b); ta.colorSpace = THREE.SRGBColorSpace; ta.anisotropy = tb.anisotropy = 8; return [ta, tb] }
const fijo = (r, pts, amp) => pts.map(([x, y], i) => { const [x2, y2] = pts[(i + 1) % pts.length]; return [x, y, (x + x2) / 2 + (r() - .5) * amp, (y + y2) / 2 + (r() - .5) * amp, x2, y2] });
const trazo = (g, segs) => { g.beginPath(); segs.forEach(([x, y, cx, cy, x2, y2], i) => { if (!i) g.moveTo(x, y); g.quadraticCurveTo(cx, cy, x2, y2) }); g.closePath() };
// placas de cuero rajado (en los dos lienzos a la vez: color y relieve), tiradas al azar sin encimarse, con grilla para que sea rápido
function placas(c, z, r, w, h, n, tam, estira, colores, luz = "#a09484", relieve = 70) { const celdas = [], G = 40, grid = new Map(), K = (i, j) => i + "," + j;
  for (let k = 0; k < n * 12 && celdas.length < n; k++) { const x = r() * w, y = r() * h, s = tam(x, y) * (.75 + r() * .5), gi = x / G | 0, gj = y / G | 0; let ok = true;
    for (let i = -3; i <= 3 && ok; i++) for (let j = -3; j <= 3 && ok; j++) { const b = grid.get(K(gi + i, gj + j)); if (b) for (const [px, py, ps] of b) if ((px - x) ** 2 + (py - y) ** 2 < ((ps + s) * .78) ** 2) { ok = false; break } }
    if (!ok) continue; const it = [x, y, s]; celdas.push(it); if (!grid.has(K(gi, gj))) grid.set(K(gi, gj), []); grid.get(K(gi, gj)).push(it) }
  celdas.forEach(([x, y, s]) => { const nv = 5 + (r() * 4 | 0), e = estira(x, y), pts = Array.from({ length: nv }, (_, i) => { const a = i / nv * 6.28 + r() * .5; return [x + Math.cos(a) * s * e * (.72 + r() * .35), y + Math.sin(a) * s * (.72 + r() * .35)] }), segs = fijo(r, pts, s * .35);
    trazo(c, segs); const g1 = c.createRadialGradient(x - s * .3, y - s * .3, 1, x, y, s * 1.2); g1.addColorStop(0, rgbj(luz, r, 18)); g1.addColorStop(1, rgbj(colores[r() * colores.length | 0], r, 16)); c.fillStyle = g1; c.fill();
    trazo(z, segs); const hv = 150 + r() * 80 | 0, g2 = z.createRadialGradient(x, y, 1, x, y, s * 1.1); g2.addColorStop(0, `rgb(${hv},${hv},${hv})`); g2.addColorStop(1, `rgb(${hv - relieve},${hv - relieve},${hv - relieve})`); z.fillStyle = g2; z.fill() }) }
const RXc = 7.6, RYc = 6.2, RZc = 13, OJO_D = s => new THREE.Vector3(s * .72, .3, .62).normalize(), NAR_D = s => new THREE.Vector3(s * .11, .24, .96).normalize(), gss = (d, s) => Math.exp(-(d / s) * (d / s));
function formaCab(v) { let k = 1;
  for (const s of [-1, 1]) { k -= .17 * gss(v.distanceTo(OJO_D(s)), .15); k += .08 * gss(v.distanceTo(OJO_D(s).clone().add(new THREE.Vector3(0, .2, -.06)).normalize()), .13); k -= .06 * gss(v.distanceTo(NAR_D(s)), .035) }
  const fr = THREE.MathUtils.smoothstep(v.z, .15, .55), dy = v.y + .16 + (1 - v.z) * .25;
  k -= .075 * gss(dy, .035) * fr; k += .04 * gss(dy - .075, .05) * fr + .035 * gss(dy + .085, .06) * fr;
  if (v.y < -.3) k += .035 * Math.sin(v.z * 30 + v.x * 6) * THREE.MathUtils.smoothstep(-v.y, .3, .8);
  let x = v.x * k, y = v.y * k, z = v.z * k; if (z > .62) z = .62 + (z - .62) * .35; const af = 1 - .34 * Math.max(0, z); if (y > .55) y = .55 + (y - .55) * .5;
  return new THREE.Vector3(x * RXc * af, y * RYc * af, z * RZc) }
const [T_CABC, T_CABH] = pintarDoble(4096, 2048, (c, z, w, h) => { const r = rng(301), Y = new THREE.Vector3(0, 1, 0);
  const uvp = d => { const o = d.clone().normalize().applyAxisAngle(Y, Math.PI / 2); let ph = Math.atan2(o.z, -o.x); if (ph < 0) ph += Math.PI * 2; return [ph / (Math.PI * 2) * w, Math.acos(Math.max(-1, Math.min(1, o.y))) / Math.PI * h] };
  c.fillStyle = "#3a3129"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
  placas(c, z, r, w, h, 4500, (x, y) => { const v = y / h; return v < .3 ? 50 + 40 * (1 - v / .3) : v < .56 ? 26 + 20 * r() : 12 + 10 * r() }, (x, y) => y / h > .58 ? 2 : 1, ["#4a4038", "#5c5044", "#3e352e", "#66594c", "#504539", "#45403a"], "#76685a", 62);
  // costras de barro seco (claras, un poco más altas), sobre todo arriba y en el hocico
  for (let k = 0; k < 220; k++) { const x = r() * w, y = Math.pow(r(), 1.5) * h * .62, rad = 30 + r() * 140, g1 = c.createRadialGradient(x, y, 0, x, y, rad); g1.addColorStop(0, `rgba(138,126,110,${.12 + r() * .16})`); g1.addColorStop(1, "rgba(138,126,110,0)"); c.fillStyle = g1; c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    const g2 = z.createRadialGradient(x, y, 0, x, y, rad); g2.addColorStop(0, "rgba(255,255,255,.08)"); g2.addColorStop(1, "rgba(255,255,255,0)"); z.fillStyle = g2; z.fillRect(x - rad, y - rad, rad * 2, rad * 2) }
  // hocico: más claro y moteado, como gastado
  { const [x, y] = uvp(new THREE.Vector3(0, .12, 1)), g1 = c.createRadialGradient(x, y, 0, x, y, 260); g1.addColorStop(0, "rgba(120,110,98,.35)"); g1.addColorStop(1, "rgba(120,110,98,0)"); c.fillStyle = g1; c.fillRect(x - 260, y - 260, 520, 520) }
  // ojos: piel oscura y húmeda alrededor, con arrugas concéntricas
  for (const s of [-1, 1]) { const [x, y] = uvp(OJO_D(s)); const g1 = c.createRadialGradient(x, y, 0, x, y, 200); g1.addColorStop(0, "rgba(14,10,8,.85)"); g1.addColorStop(.5, "rgba(30,22,18,.45)"); g1.addColorStop(1, "rgba(30,22,18,0)"); c.fillStyle = g1; c.fillRect(x - 200, y - 200, 400, 400);
    for (let q = 70; q < 300; q += 14 + r() * 16) { const pts = Array.from({ length: 14 }, (_, i) => { const a = i / 14 * 6.28; return [x + Math.cos(a) * q * 1.35 * (.9 + r() * .2), y + Math.sin(a) * q * (.9 + r() * .2)] }), segs = fijo(r, pts, 14);
      trazo(c, segs); c.strokeStyle = `rgba(16,12,9,${.5 - q / 900})`; c.lineWidth = 3 + r() * 4; c.stroke(); trazo(z, segs); z.strokeStyle = "rgba(10,10,10,.7)"; z.lineWidth = 6 + r() * 4; z.stroke() } }
  // narinas: agujeros negros profundos
  for (const s of [-1, 1]) { const [x, y] = uvp(NAR_D(s)); c.fillStyle = "#050403"; c.beginPath(); c.ellipse(x, y, 26, 34, 0, 0, 7); c.fill(); z.fillStyle = "#000"; z.beginPath(); z.ellipse(x, y, 30, 38, 0, 0, 7); z.fill();
    c.strokeStyle = "rgba(150,140,125,.5)"; c.lineWidth = 6; c.beginPath(); c.ellipse(x, y, 34, 42, 0, 0, 7); c.stroke() }
  // la boca: surco muy oscuro y dos labios de cuerno gastado con rayas verticales
  const boca = []; for (let a = -1.25; a <= 1.25; a += .01) { const vz = Math.cos(a), d = new THREE.Vector3(Math.sin(a), -.16 - (1 - vz) * .25, vz); boca.push(uvp(d)) }
  for (const [dy, col, hc, lw] of [[-26, "rgba(156,148,132,.6)", "rgba(220,220,220,.35)", 40], [30, "rgba(140,132,118,.55)", "rgba(210,210,210,.3)", 44], [0, "#0b0806", "#000", 16]]) {
    c.strokeStyle = col; z.strokeStyle = hc; c.lineWidth = lw; z.lineWidth = lw + 4; for (const g of [c, z]) { g.beginPath(); boca.forEach(([x, y], i) => i ? g.lineTo(x, y + dy + (r() - .5) * 3) : g.moveTo(x, y + dy)); g.stroke() } }
  for (let k = 0; k < 900; k++) { const [x, y] = boca[r() * boca.length | 0], side = r() < .5 ? -1 : 1; c.strokeStyle = r() < .5 ? "rgba(40,32,26,.45)" : "rgba(200,192,176,.3)"; c.lineWidth = 1 + r() * 2; c.beginPath(); c.moveTo(x + (r() - .5) * 6, y + side * 8); c.lineTo(x + (r() - .5) * 8, y + side * (20 + r() * 26)); c.stroke() }
  // pastito seco pegado en la comisura (como en la foto)
  for (const s of [-1, 1]) { const [x, y] = boca[s < 0 ? 40 : boca.length - 40]; for (let k = 0; k < 14; k++) { c.strokeStyle = `rgba(${200 + r() * 40 | 0},${180 + r() * 40 | 0},${110 + r() * 30 | 0},.8)`; c.lineWidth = 2 + r() * 2; c.beginPath(); c.moveTo(x + (r() - .5) * 30, y + (r() - .5) * 20); c.quadraticCurveTo(x + (r() - .5) * 80, y + 30 + r() * 40, x + (r() - .5) * 120, y + 40 + r() * 70); c.stroke() } }
  // papada y garganta: arrugas horizontales finas y onduladas
  for (let k = 0; k < 520; k++) { const y0 = h * (.6 + r() * .38), x0 = r() * w, L = 60 + r() * 260; for (const [g, col, lw] of [[c, "rgba(14,10,8,.6)", 2 + r() * 3], [z, "rgba(0,0,0,.6)", 5]]) { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); for (let x = 0; x <= L; x += 12) { const y = y0 + Math.sin((x0 + x) * .02 + k) * 5; x ? g.lineTo(x0 + x, y) : g.moveTo(x0, y) } g.stroke() } }
  // motas finas de tierra
  for (let k = 0; k < 6000; k++) { c.fillStyle = r() < .5 ? "rgba(150,140,125,.15)" : "rgba(20,14,10,.25)"; c.beginPath(); c.arc(r() * w, r() * h, .8 + r() * 2.4, 0, 7); c.fill() }
  for (const [y0, y1] of [[0, h * .1], [h, h * .9]]) { const gc = c.createLinearGradient(0, y0, 0, y1); gc.addColorStop(0, "rgba(60,51,43,1)"); gc.addColorStop(.6, "rgba(60,51,43,.85)"); gc.addColorStop(1, "rgba(60,51,43,0)"); c.fillStyle = gc; c.fillRect(0, Math.min(y0, y1), w, Math.abs(y1 - y0)); const gz = z.createLinearGradient(0, y0, 0, y1); gz.addColorStop(0, "rgba(150,150,150,1)"); gz.addColorStop(.6, "rgba(150,150,150,.85)"); gz.addColorStop(1, "rgba(150,150,150,0)"); z.fillStyle = gz; z.fillRect(0, Math.min(y0, y1), w, Math.abs(y1 - y0)) }
  for (let k = 0; k < 400; k++) { c.fillStyle = r() < .5 ? "rgba(90,80,68,.4)" : "rgba(30,24,20,.4)"; c.beginPath(); c.ellipse(r() * w, r() * h * .1, 4 + r() * 20, 3 + r() * 6, 0, 0, 7); c.fill() } });
const M_CAB = new THREE.MeshStandardMaterial({ map: T_CABC, displacementMap: T_CABH, displacementScale: .32, displacementBias: -.17, bumpMap: T_CABH, bumpScale: 3.4, roughness: .84 });
// cuello: el mismo cuero rajado, con pliegues hondos que dan la vuelta (coinciden con los pliegues de la geometría)
const [T_CUEC, T_CUEH] = pintarDoble(4096, 2048, (c, z, w, h) => { const r = rng(302); c.fillStyle = "#1e1813"; c.fillRect(0, 0, w, h); z.fillStyle = "#262626"; z.fillRect(0, 0, w, h);
  placas(c, z, r, w, h, 9000, () => 9 + 12 * r(), () => 1.7, ["#4e443c", "#564a40", "#5a4e44", "#4a4038", "#52473e"], "#6e6256", 80);
  PLIEGUES.forEach(py => { const y0 = py * h, amp = 10 + r() * 20, f = 1 + (r() * 3 | 0), ph = r() * 6; for (const [dy, col, hc, lw] of [[-14, "rgba(150,140,125,.35)", "rgba(255,255,255,.25)", 18], [0, "rgba(8,6,4,.9)", "#000", 14 + r() * 8]]) { c.strokeStyle = col; z.strokeStyle = hc; c.lineWidth = lw; z.lineWidth = lw + 6; for (const g of [c, z]) { g.beginPath(); for (let x = 0; x <= w; x += 16) { const y = y0 + dy + Math.sin(x / w * 6.283 * f + ph) * amp; x ? g.lineTo(x, y) : g.moveTo(x, y) } g.stroke() } } });
  for (let k = 0; k < 160; k++) { const x = r() * w, y = r() * h, rad = 40 + r() * 160, g1 = c.createRadialGradient(x, y, 0, x, y, rad); g1.addColorStop(0, `rgba(140,128,112,${.1 + r() * .15})`); g1.addColorStop(1, "rgba(140,128,112,0)"); c.fillStyle = g1; c.fillRect(x - rad, y - rad, rad * 2, rad * 2) }
  for (let k = 0; k < 5000; k++) { c.fillStyle = r() < .5 ? "rgba(200,188,168,.3)" : "rgba(20,14,10,.3)"; c.beginPath(); c.arc(r() * w, r() * h, .8 + r() * 2.4, 0, 7); c.fill() } });
const M_CUELLO2 = new THREE.MeshStandardMaterial({ map: T_CUEC, displacementMap: T_CUEH, displacementScale: .4, displacementBias: -.22, bumpMap: T_CUEH, bumpScale: 3.5, roughness: .86 });
const CABEZA = new THREE.Group(); TURT.add(CABEZA); CABEZA.position.set(0, 7.5, SA + 4);
{ const cu = new THREE.Mesh(GEO_CUELLO, M_CUELLO2); cu.position.set(0, 0, 3); cu.rotation.x = Math.PI / 2 - .35; cu.castShadow = true; CABEZA.add(cu);
  const geo = new THREE.SphereGeometry(1, 384, 256); geo.rotateY(-Math.PI / 2); const p = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).normalize(); const q = formaCab(v); p.setXYZ(i, q.x, q.y, q.z) } geo.computeVertexNormals();
  const cab = new THREE.Mesh(geo, M_CAB); cab.position.set(0, 4, 13); cab.castShadow = cab.receiveShadow = true; CABEZA.add(cab);
  for (const s of [-1, 1]) { const n = OJO_D(s), sup = formaCab(n); ojoTortuga(s, sup.add(new THREE.Vector3(0, 4, 13)).addScaledVector(n, -.35), n) }
  const r4 = rng(410), C0 = new THREE.Vector3(0, 4, 13);
  [[.2, .9, .3], [-.25, .85, .4], [.05, .95, .1], [.35, .8, .45], [-.1, .9, .25], [.15, .82, .55], [-.35, .78, .2], [.28, .86, .12]].forEach(([x, y, z2], i) => { const d = new THREE.Vector3(x, y, z2).normalize(), b = new THREE.Mesh(GEO_PERCEBE, M_PERCEBE); b.position.copy(formaCab(d).add(C0)); b.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d); b.scale.setScalar(1.6 + (i % 3) * .6); b.castShadow = true; CABEZA.add(b) });
  const alga = new THREE.MeshStandardMaterial({ color: "#3a6a2a", roughness: .6, side: THREE.DoubleSide });
  for (let k = 0; k < 9; k++) { const a = -.9 + k / 8 * 1.8, d = new THREE.Vector3(Math.sin(a) * .8, -.55, .45 + Math.cos(a) * .3).normalize(), L = 1.2 + r4() * 1.6, g = new THREE.PlaneGeometry(.35, L, 1, 6); g.translate(0, -L / 2, 0); const pp = g.attributes.position; for (let i = 0; i < pp.count; i++) { pp.setZ(i, Math.sin(pp.getY(i) * 3.1 + k) * .32 + Math.sin(pp.getY(i) * 7 + k * 2) * .06); pp.setX(i, pp.getX(i) * (.6 + .5 * Math.abs(Math.sin(pp.getY(i) * 2 + k)))) }; const m = new THREE.Mesh(g, alga); m.position.copy(formaCab(d).add(C0)); m.rotation.y = a; CABEZA.add(m) } }

const CABL = new THREE.Object3D(); CABEZA.add(CABL); CABL.position.set(0, 11, 12);   // arriba de la cabeza (donde se para Garrow)
const ALETAS = [[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sz]) => { const piv = new THREE.Group(); TURT.add(piv); piv.position.set(sx * SB * .78, 1.1, sz * SA * .55); const gA = new THREE.SphereGeometry(1, 40, 20).rotateZ(Math.PI / 2), pA = gA.attributes.position; for (let i = 0; i < pA.count; i++) { const u = (pA.getX(i) * sx + 1) / 2; pA.setZ(i, pA.getZ(i) * (1.15 - .75 * u * u) + u * u * .35 * sz); pA.setY(i, pA.getY(i) * (1.1 - .6 * u)) } gA.computeVertexNormals(); const f = part(gA, M_ALETA, sx * 9, -1.6, 0, piv, 0); f.scale.set(sz > 0 ? 14 : 9, 1.6, sz > 0 ? 6 : 5); f.rotation.y = sx * sz * .35; return { piv, sx, sz } });
const COLA = new THREE.Group(); TURT.add(COLA); COLA.position.set(0, 2.5, -SA + 1); { const c = part(new THREE.ConeGeometry(3, 10, 16), M_PIEL, 0, 0, -4, COLA, 0); c.rotation.x = -Math.PI / 2 - .2 }
// aliento: nube tibia que sale de las narinas · espuma alrededor del cuerpo
const NUBE = Array.from({ length: 18 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#f2f2ee", transparent: true, opacity: 0, depthWrite: false })); scene.add(s); return s });
function aliento(t, k) { CABEZA.updateMatrixWorld(true); const o = new THREE.Vector3(0, 5.5, 22.2).applyMatrix4(CABEZA.matrixWorld); NUBE.forEach((s, i) => { const q = ((t * .35 + i / 18) % 1); s.visible = k > 0; s.position.set(o.x + Math.sin(i * 2.3) * q * 8, o.y + q * 9, o.z + q * 14); s.scale.setScalar(4 + q * 16); s.material.opacity = (1 - q) * .17 * k }) }
const ESPUMA = Array.from({ length: 30 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#ffffff", transparent: true, opacity: .5, depthWrite: false })); TURT.add(s); const a = i / 30 * Math.PI * 2; s.position.set(Math.cos(a) * SB * 1.12, .3, Math.sin(a) * SA * 1.12); s.scale.set(7, 1.6, 1); return s });
function tortuga(t, { paso = 1, bajo = 0, giro = 0, incl = 0, flinch = 0 } = {}) {
  // camina como una tortuga marina (pedido del dueño): las aletas van en diagonal (adelante izquierda con atrás derecha),
  // cada una barre hacia atrás apoyada y vuelve levantada; el cuerpo se balancea hacia el lado que apoya, sube con cada
  // empujón y cabecea apenas; el cuello se estira y se encoge con el paso, la cabeza mira alrededor, parpadea, y la cola acompaña.
  const ph = t * .9 * paso;
  ALETAS.forEach(({ piv, sx, sz }) => { const f = ph + (sx * sz > 0 ? 0 : Math.PI), s = Math.sin(f), c = Math.cos(f), arriba = Math.max(0, c);
    piv.rotation.set(sz * arriba * .12 * paso, sx * s * .5 * paso, sx * (.12 + arriba * .38 * paso - Math.max(0, -c) * .06 * paso)) });
  const sway = Math.sin(ph) * paso, push = Math.max(0, -Math.cos(ph * 2)) * paso;
  TURT.position.y = -bajo + push * .35 - .1 * paso + flinch * Math.sin(t * 40) * .4;
  TURT.rotation.set(incl * .6 + Math.sin(ph * 2 + 1) * .012 * paso + flinch * .03 * Math.sin(t * 33), giro + sway * .018, incl + sway * .022 + flinch * .04 * Math.sin(t * 29));
  CABEZA.position.set(0, 7.5 + Math.sin(ph * 2 + .8) * .35 * paso, SA + 4 + push * .9 - flinch * 3.5);
  CABEZA.rotation.set(Math.sin(t * .4) * .05 + Math.sin(ph * 2) * .035 * paso - flinch * .2, Math.sin(t * .23) * .16 + Math.sin(t * .61) * .04, -sway * .05);
  COLA.rotation.set(.05 * Math.sin(ph * 2), Math.sin(ph) * .25 * paso, 0);
  OJOS.forEach(G => { const b = (t % 5.3) / 5.3, cierra = b > .96 ? Math.sin((b - .96) / .04 * Math.PI) : 0; G.userData.sup.rotation.x = .22 + Math.max(cierra * 1.05, Math.min(1, flinch * 2) * 1.15) });
  T_AGUA.offset.set(t * .004 * paso, t * .012 * paso); AGUA_T.value = t * 6; ESPUMA.forEach(s => s.visible = false);
}

// ---------- Shellbrook arriba del caparazón (todo hijo de TURT)
const enConcha = (o, x, z, ry = 0, dy = 0) => { if (o.parent !== TURT) TURT.add(o); o.position.set(x, SY(x, z) + dy, z); o.rotation.y = ry; return o };
const casa = (x, z, ry, op = {}) => { const H = house(0, 0, 1, op); H.g.removeFromParent(); enConcha(H.g, x, z, ry, -.3); part(new THREE.BoxGeometry((op.w ?? 7) + .4, 9, 6.6), M_STONE, 0, -4.4, 0, H.g, 0); /* zócalo hondo: la casa nunca queda flotando en la pendiente */ H.lx = x; H.lz = z; return H };
// calle principal de atrás (−z) hacia la cabeza (+z), casas a los dos lados mirando a la calle
const CASAS = [];
[[-6.8, -18, 1], [6.8, -18, -1], [-6.8, -9, 1], [6.8, -9, -1], [-6.8, 9, 1], [6.8, 9, -1], [-6.8, 18, 1], [-15, -2, 0], [15, -14, 0], [-16, 14, 0], [16, 16, 0]].forEach(([x, z, s], i) => CASAS.push(casa(x, z, s ? s * Math.PI / 2 : (x < 0 ? Math.PI / 2 : -Math.PI / 2), { v: i, h: 4.6 + (i % 3) * .5, w: 6.4 })));
const NUESTRA = casa(6.8, 18, -Math.PI / 2, { v: 12, h: 5, w: 6.4 });
const PANADERIA = casa(18.5, 3, -Math.PI / 2, { v: 13, h: 4.6, w: 6.2 });          // la de Pim (se cae al mar en el recuerdo)
const ESCUELA = casa(-18, -14, Math.PI / 2, { v: 14, h: 5.4, w: 7 });
// reglas amarillas colgadas junto a cada puerta
const T_REGLA = tex(64, 512, (g, w, h) => { g.fillStyle = "#f2c41e"; g.fillRect(0, 0, w, h); g.fillStyle = "#2a2416"; for (let y = 8; y < h; y += 16) g.fillRect(0, y, y % 64 === 8 ? 30 : 16, 3) });
const M_REGLA = SMt(T_REGLA, { roughness: .5 });

// carteles de oficio
const cartelito = (H, txt, bg = "#3a2618") => { const m = part(new THREE.PlaneGeometry(2.4, .6), SMt(tex(512, 128, (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = "#d9c08a"; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12); g.font = "800 72px 'Special Elite'"; g.fillStyle = "#f2e6c4"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, w / 2, h / 2 + 4) })), 0, 3.6, 3.08, H.walls[0], 0); return m };
cartelito(PANADERIA, "BAKERY"); cartelito(ESCUELA, "SCHOOL", "#2a3a5a"); cartelito(CASAS[3], "POTS", "#5a4a1a");
// la iglesia arriba de todo, con el campanario de Garrow
const IGLESIA = new THREE.Group(); enConcha(IGLESIA, 0, -14, Math.PI, -.4);
{ part(new THREE.BoxGeometry(7.6, 8, 11.6), M_STONE, 0, -3.8, 0, IGLESIA, 0); part(new THREE.BoxGeometry(3.8, 8, 3.8), M_STONE, 0, -3.8, 6, IGLESIA, 0); part(new THREE.BoxGeometry(7, 7, 11), M_STONE, 0, 3.5, 0, IGLESIA, 0); const half = 4.0, rh = 3.4, sl = Math.hypot(half, rh), a = Math.atan2(rh, half); for (const s of [-1, 1]) { const m = part(new THREE.BoxGeometry(sl, .25, 11.6), M_SHING, s * half / 2, 7 + rh / 2, 0, IGLESIA, 0); m.rotation.z = -s * a }
  const tw = new THREE.Group(); tw.position.set(0, 0, 6); IGLESIA.add(tw); part(new THREE.BoxGeometry(3.2, 10, 3.2), M_STONE, 0, 5, 0, tw, 0); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) part(new THREE.BoxGeometry(.35, 3, .35), M_BEAM, a * 1.4, 11.5, b * 1.4, tw, 0); part(new THREE.BoxGeometry(3.6, .3, 3.6), M_BEAM, 0, 13.1, 0, tw, 0); part(new THREE.ConeGeometry(2.4, 6, 4), M_SHING, 0, 16, 0, tw, 0).rotation.y = Math.PI / 4;
  part(new THREE.BoxGeometry(1.6, 2.8, .2), M_PLANK, 0, 1.4, 1.62, tw, 0); 
  const campana = part(new THREE.CylinderGeometry(.5, .9, 1.3, 18, 1, true), SM("#b8893a", { metalness: .8, roughness: .3, side: THREE.DoubleSide }), 0, 11.5, 0, tw, 0); IGLESIA.userData.campana = campana; IGLESIA.userData.torre = tw;
  for (const s of [-1, 1]) part(new THREE.BoxGeometry(.6, 1.2, .2), M_PLANK, s * 2.3, 4.2, 5.52, IGLESIA, 0) }
const ESCALONES = []; for (let k = 0; k < 3; k++) ESCALONES.push(part(new THREE.BoxGeometry(3.4 - k * .4, .3, 1), M_STONE, 0, .15 + k * .3, 8.1 - k * .5, IGLESIA, 0));
// la plaza con el cartel de la regla
const CARTEL = new THREE.Group(); enConcha(CARTEL, 3.2, 3.5, -.4); CARTEL.visible = false;
{ for (const s of [-1, 1]) part(new THREE.BoxGeometry(.2, 3.2, .2), M_BEAM, s * 1.4, 1.6, 0, CARTEL, 0);
  part(new THREE.PlaneGeometry(3.2, 1.6), SMt(tex(640, 320, (g, w, h) => { g.fillStyle = "#e8dcc0"; g.fillRect(0, 0, w, h); g.strokeStyle = "#3a2618"; g.lineWidth = 16; g.strokeRect(8, 8, w - 16, h - 16); g.font = "800 92px 'Special Elite'"; g.fillStyle = "#7a1e16"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("ONE SHOVEL.", w / 2, 115); g.fillText("NO MORE.", w / 2, 220) })), 0, 2.7, .12, CARTEL, 0) }
// huertas de una pala de tierra (zanahorias) y ropa tendida del lado de la cabeza
// zanahorias de verdad (pedido del dueño): raíz que se afina con anillos y raicitas, hombro verde asomando de la tierra,
// penacho de hojas plumosas con tallos y foliolos; surcos con terrones y una o dos ya cosechadas sobre la tierra
const T_ZANA = (() => { const [c, z] = pintarDoble(128, 512, (c, z, w, h) => { const r = rng(55), gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#6a8a2a"); gr.addColorStop(.06, "#d8782a"); gr.addColorStop(.5, "#ee8a2e"); gr.addColorStop(1, "#d06a22"); c.fillStyle = gr; c.fillRect(0, 0, w, h); z.fillStyle = "#909090"; z.fillRect(0, 0, w, h);
    for (let y = 20; y < h; y += 8 + r() * 14) { const x0 = r() * w * .5, L = w * (.3 + r() * .7); c.strokeStyle = "rgba(120,50,10,.5)"; c.lineWidth = 1.5 + r() * 2; c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + L, y + (r() - .5) * 3); c.stroke(); z.strokeStyle = "rgba(0,0,0,.7)"; z.lineWidth = 3; z.beginPath(); z.moveTo(x0, y); z.lineTo(x0 + L, y); z.stroke() }
    for (let k = 0; k < 60; k++) { c.fillStyle = "rgba(90,60,35,.35)"; c.beginPath(); c.arc(r() * w, r() * h, 1 + r() * 3, 0, 7); c.fill() } }); return [c, z] })();
const GEO_ZANA = new THREE.LatheGeometry([[0, -.8], [.01, -.72], [.026, -.56], [.044, -.36], [.06, -.16], [.072, 0], [.078, .12], [.07, .18], [.03, .2], [0, .2]].map(([x, y]) => new THREE.Vector2(x, y)), 16);
const M_ZANA = new THREE.MeshStandardMaterial({ map: T_ZANA[0], bumpMap: T_ZANA[1], bumpScale: 2, roughness: .6 }), M_HOJA = new THREE.MeshStandardMaterial({ color: "#4f8a32", roughness: .7, side: THREE.DoubleSide }), M_TALLO = SM("#5f9a3a");
const GEO_FOL = new THREE.PlaneGeometry(.06, .035); GEO_FOL.translate(.03, 0, 0);
function zanahoria(g, x, y, z, ry = 0, acostada = false, r = Math.random) { const c = new THREE.Group(); c.position.set(x, y, z); c.rotation.y = ry; if (acostada) c.rotation.z = Math.PI / 2 - .15; g.add(c);
  const raiz = new THREE.Mesh(GEO_ZANA, M_ZANA); raiz.castShadow = true; c.add(raiz);
  for (let k = 0; k < 4; k++) { const pe = part(new THREE.CylinderGeometry(.002, .004, .1, 4), SM("#c8a070"), Math.cos(k * 1.7) * .05, -.2 - k * .08, Math.sin(k * 1.7) * .05, c, 0); pe.rotation.z = (k % 2 ? 1 : -1) * 1.1 }
  const nf = 5 + (r() * 3 | 0); for (let k = 0; k < nf; k++) { const a = k / nf * 6.28 + r() * .4, L = .32 + r() * .22, inc = .25 + r() * .35, f = new THREE.Group(); f.position.y = .18; f.rotation.set(0, a, inc); c.add(f);
    part(new THREE.CylinderGeometry(.006, .01, L, 5), M_TALLO, 0, L / 2, 0, f, 0);
    for (let q = 1; q <= 5; q++) for (const s of [-1, 1]) { const fo = new THREE.Mesh(GEO_FOL, M_HOJA); fo.position.set(0, L * (.35 + q * .12), 0); fo.rotation.set((r() - .5) * .4, s > 0 ? 0 : Math.PI, .5 + q * .08); fo.scale.setScalar(1.2 - q * .12); f.add(fo) } } return c }
const HUERTAS = [[-9, 2], [-12, -11.5]].map(([x, z], hi) => { const g = new THREE.Group(), r = rng(500 + hi); enConcha(g, x, z, 0, -.1);
  part(new THREE.BoxGeometry(3.2, .5, 2.2), SMt(T_DIRT, { bumpMap: T_DIRT, bumpScale: 2 }), 0, .05, 0, g, 0);
  for (const zz of [-.5, .5]) { const surco = part(new THREE.CylinderGeometry(.3, .3, 2.8, 12, 1, false, 0, Math.PI), SMt(T_DIRT, { bumpMap: T_DIRT, bumpScale: 2 }), 0, .3, zz, g, 0); surco.rotation.set(0, 0, Math.PI / 2); surco.scale.set(1, 1, .55) }
  for (let k = 0; k < 40; k++) { const t = part(new THREE.IcosahedronGeometry(.04 + r() * .05, 0), SM(["#5a4630", "#6a5238", "#4a3a28"][k % 3], { roughness: 1 }), (r() - .5) * 3, .32 + r() * .06, (r() - .5) * 2, g, 0); t.rotation.set(r() * 3, r() * 3, r() * 3) }
  for (let k = 0; k < 8; k++) zanahoria(g, -1.1 + (k % 4) * .73 + (r() - .5) * .08, .56 + r() * .05, -.5 + Math.floor(k / 4) * 1, r() * 6, false, r);
  zanahoria(g, 1.75, .32, .95, .4, true, r); if (!hi) zanahoria(g, 1.85, .32, .6, -.3, true, r);
  return g });
const TENDEDERO = new THREE.Group(); enConcha(TENDEDERO, -3, 25, 0, 0);
{ for (const s of [-1, 1]) part(new THREE.BoxGeometry(.18, 3.2, .18), M_BEAM, s * 5, 1.6, 0, TENDEDERO, 0); part(new THREE.CylinderGeometry(.02, .02, 10, 4), SM("#ddd"), 0, 3, 0, TENDEDERO, 0).rotation.z = Math.PI / 2;
  TENDEDERO.userData.ropa = ["#e05a4a", "#f2e6c4", "#4a7ab8", "#f2c41e", "#ffffff"].map((c, i) => { const m = part(new THREE.PlaneGeometry(1.3, 1.6), new THREE.MeshStandardMaterial({ color: c, side: THREE.DoubleSide, roughness: .9 }), -3.6 + i * 1.8, 2.2, 0, TENDEDERO, 0); return m }) }
// el mercado de pescado en el borde de adelante a la izquierda
const MERCADO = new THREE.Group(); enConcha(MERCADO, -14, 24, .6, -.2);
{ for (let k = 0; k < 3; k++) { const g = new THREE.Group(); g.position.set(-4 + k * 4, 0, 0); MERCADO.add(g); part(new THREE.BoxGeometry(3, 1, 1.6), M_PLANK, 0, .5, 0, g, 0); for (const s of [-1, 1]) part(new THREE.BoxGeometry(.12, 2.6, .12), M_BEAM, s * 1.4, 1.3, -.7, g, 0);
    const tol = part(new THREE.BoxGeometry(3.4, .08, 2.2), SM(["#c94b4b", "#e8dcc0", "#3f6a8a"][k]), 0, 2.6, 0, g, 0); tol.rotation.x = .25; for (let j = 0; j < 4; j++) { const p = part(new THREE.SphereGeometry(.18, 10, 8), SM("#9ab0b8", { metalness: .4, roughness: .3 }), -1 + j * .65, 1.1, .2, g, 0); p.scale.set(2.6, .7, 1) } } }
// utilería suelta: barriles, cajones, sacos (instanciados sobre el caparazón)
{ const r = rng(98), bar = new THREE.InstancedMesh(new THREE.CylinderGeometry(.42, .38, 1.1, 14), M_PLANK, 26), cra = new THREE.InstancedMesh(new THREE.BoxGeometry(.9, .8, .9), M_PLANK, 26); [bar, cra].forEach(m => { m.castShadow = m.receiveShadow = true; TURT.add(m) });
  for (let k = 0; k < 26; k++) { const x = (r() < .5 ? -1 : 1) * (3.6 + r() * 1.2), z = -24 + r() * 46; dummy.position.set(x, SY(x, z) + .55, z); dummy.rotation.set(0, r() * 6, 0); dummy.scale.setScalar(1); dummy.updateMatrix(); bar.setMatrixAt(k, dummy.matrix);
    const x2 = (r() < .5 ? -1 : 1) * (9 + r() * 6), z2 = -22 + r() * 44; dummy.position.set(x2, SY(x2, z2) + .4, z2); dummy.rotation.set(0, r() * 6, 0); dummy.updateMatrix(); cra.setMatrixAt(k, dummy.matrix) } }
// el pozo de la panadería (recuerdo), el pozo del chico (final) y la tierra que saca
const HOYO = (() => { const g = new THREE.Group(); const m = part(new THREE.CircleGeometry(1, 24), SMt(tex(256, 256, (q, w, h) => { const gr = q.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, "#120a06"); gr.addColorStop(.6, "#3a2414"); gr.addColorStop(1, "#5a3a22"); q.fillStyle = gr; q.fillRect(0, 0, w, h) }), { roughness: 1 }), 0, .12, 0, g, 0); m.rotation.x = -Math.PI / 2; const borde = part(new THREE.TorusGeometry(1.05, .22, 8, 28), SMt(T_DIRT, { bumpMap: T_DIRT, bumpScale: 3 }), 0, .06, 0, g, 0); borde.rotation.x = Math.PI / 2; borde.scale.z = .4; const piel = part(new THREE.CircleGeometry(.6, 20), SMt(T_PIEL, { color: "#d8b0a0", emissive: "#6a2a1a", emissiveIntensity: .25 }), 0, .14, 0, g, 0); piel.rotation.x = -Math.PI / 2; g.userData.piel = piel;
  const mont = part(new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), SMt(T_DIRT), 1.6, 0, .4, g, 0); g.userData.mont = mont; return g })();
const PALA = new THREE.Group(); part(new THREE.CylinderGeometry(.045, .045, 2.0, 8), SM("#8a5a30"), 0, -.6, .1, PALA, 0); { const b = part(new THREE.BoxGeometry(.42, .5, .05), SM("#8a8a90", { metalness: .7, roughness: .35 }), 0, -1.8, .14, PALA, 0) } part(new THREE.BoxGeometry(.4, .07, .07), SM("#8a5a30"), 0, .42, .1, PALA, 0);
const REGLA = new THREE.Group(); part(new THREE.BoxGeometry(.12, 1.2, .03), M_REGLA, 0, -.5, .12, REGLA, 0);
const TELESC = new THREE.Group(); { const tb = part(new THREE.CylinderGeometry(.09, .13, 1.1, 12), SM("#b8893a", { metalness: .8, roughness: .3 }), 0, -.1, .3, TELESC, 0); tb.rotation.x = Math.PI / 2 }
const TAZAS = new THREE.Group(); { const mesa = part(new THREE.BoxGeometry(2, .12, 1.2), M_PLANK, 0, 1.4, 0, TAZAS, 0); for (const [x, z] of [[-.9, -.5], [.9, -.5], [-.9, .5], [.9, .5]]) part(new THREE.BoxGeometry(.1, 1.4, .1), M_BEAM, x, .7, z, TAZAS, 0);
  TAZAS.userData.tazas = [[-.5, .1], [0, -.2], [.55, .15]].map(([x, z], i) => { const c = new THREE.Group(); c.position.set(x, 1.46, z); TAZAS.add(c); part(new THREE.CylinderGeometry(.13, .1, .22, 14), SM(["#e8dcc0", "#c94b4b", "#3f6a8a"][i]), 0, .11, 0, c, 0); part(new THREE.TorusGeometry(.07, .02, 6, 12), SM(["#e8dcc0", "#c94b4b", "#3f6a8a"][i]), .14, .12, 0, c, 0); return c }) }
enConcha(TAZAS, 2.6, 13.5, -Math.PI / 2, -.1); TAZAS.visible = false;
const PECERA = new THREE.Group(); { part(new THREE.SphereGeometry(.5, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), SMt(T_DIRT), 0, 0, 0, PECERA, 0); part(new THREE.BoxGeometry(.06, .7, .06), M_BEAM, 0, .5, 0, PECERA, 0); part(new THREE.BoxGeometry(.4, .06, .06), M_BEAM, 0, .65, 0, PECERA, 0) }
enConcha(PECERA, 2.4, -2.5, 0, -.05); PECERA.visible = false;


// ---------- más detalle (pedido del dueño): faroles, cercas, macetas, leña, algas y piedras en el borde, gaviotas
{ const r = rng(120), poste = SM("#2a2420", { metalness: .5, roughness: .5 }), vid = new THREE.MeshStandardMaterial({ color: "#fff1c8", emissive: "#ffd68a", emissiveIntensity: .2, roughness: .2 });
  [[-3.2, 12], [-3.2, 7], [-3.2, -4], [3.2, -12], [9, 4.5], [-12, 4.5], [3.2, 18], [-3.2, -20]].forEach(([x, z]) => { const g = new THREE.Group(); enConcha(g, x, z); part(new THREE.CylinderGeometry(.07, .1, 3, 8), poste, 0, 1.5, 0, g, 0); part(new THREE.BoxGeometry(.36, .5, .36), vid, 0, 3.15, 0, g, 0); part(new THREE.ConeGeometry(.32, .3, 4), poste, 0, 3.55, 0, g, 0).rotation.y = Math.PI / 4 });
  const est = new THREE.InstancedMesh(new THREE.BoxGeometry(.1, .7, .06), M_PLANK, 120); est.castShadow = true; TURT.add(est); let n = 0;
  [[-9, 2], [-12, -11.5]].forEach(([cx, cz]) => { for (let k = 0; k < 22 && n < 120; k++) { const a = k / 22 * Math.PI * 2, x = cx + Math.cos(a) * 2.1, z = cz + Math.sin(a) * 1.5; dummy.position.set(x, SY(x, z) + .3, z); dummy.rotation.set(0, -a, (r() - .5) * .15); dummy.scale.setScalar(1); dummy.updateMatrix(); est.setMatrixAt(n++, dummy.matrix) } }); est.count = n;
  const mac = new THREE.InstancedMesh(new THREE.CylinderGeometry(.22, .16, .3, 10), SM("#a8553a"), 60), flo = new THREE.InstancedMesh(new THREE.SphereGeometry(.2, 8, 6), SM("#e05a7a"), 60), flo2 = new THREE.InstancedMesh(new THREE.SphereGeometry(.16, 8, 6), SM("#f2d23a"), 60), lena = new THREE.InstancedMesh(new THREE.CylinderGeometry(.09, .09, 1, 6), SM("#7a5030"), 160);
  [mac, flo, flo2, lena].forEach(m => { m.castShadow = true; TURT.add(m) });
  let nm = 0; for (let k = 0; k < 200 && nm < 60; k++) { const sx = r() < .5 ? -1 : 1, x = sx * (3.55 + r() * .15), z = -21 + r() * 42; if (Math.abs(z) < 6) continue; const y = SY(x, z);
    dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(1); dummy.position.set(x, y + .15, z); dummy.updateMatrix(); mac.setMatrixAt(nm, dummy.matrix); dummy.position.set(x, y + .4, z); dummy.updateMatrix(); flo.setMatrixAt(nm, dummy.matrix); dummy.position.set(x + .1, y + .5, z + .1); dummy.updateMatrix(); flo2.setMatrixAt(nm, dummy.matrix); nm++ }
  mac.count = flo.count = flo2.count = nm;
  for (let k = 0; k < 160; k++) { const pila = k / 20 | 0, sx = pila % 2 ? 1 : -1, z0 = -19 + pila * 5.2, x = sx * 3.6, z = z0 + (k % 5) * .2 - .4, y = SY(x, z) + .1 + ((k % 20) / 5 | 0) * .18; dummy.position.set(x, y, z); dummy.rotation.set(Math.PI / 2, 0, 0); dummy.scale.setScalar(1); dummy.updateMatrix(); lena.setMatrixAt(k, dummy.matrix) }
  const alga = new THREE.InstancedMesh(new THREE.ConeGeometry(.25, 1.6, 5), SM("#3a6a3a", { roughness: .9 }), 260), pie = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.5, 0), SM("#8a8478", { roughness: 1 }), 140); [alga, pie].forEach(m => { m.castShadow = true; TURT.add(m) });
  for (let k = 0; k < 260; k++) { const a = r() * Math.PI * 2, f = .86 + r() * .13, x = Math.cos(a) * SB * f, z = Math.sin(a) * SA * f; dummy.position.set(x, SY(x, z) + .4, z); dummy.rotation.set((r() - .5) * .6, r() * 6, (r() - .5) * .6); dummy.scale.set(1, .6 + r(), 1); dummy.updateMatrix(); alga.setMatrixAt(k, dummy.matrix) }
  for (let k = 0; k < 140; k++) { const a = r() * Math.PI * 2, f = .7 + r() * .28, x = Math.cos(a) * SB * f, z = Math.sin(a) * SA * f; dummy.position.set(x, SY(x, z) + .1, z); dummy.rotation.set(r() * 3, r() * 3, r() * 3); dummy.scale.setScalar(.4 + r() * .9); dummy.updateMatrix(); pie.setMatrixAt(k, dummy.matrix) } }
const GAVIOTAS = Array.from({ length: 22 }, (_, i) => { const g = new THREE.Group(); scene.add(g); const m = SM("#f4f4f0"); const c = part(new THREE.CapsuleGeometry(.18, .6, 4, 8), m, 0, 0, 0, g, 0); c.rotation.x = Math.PI / 2;
  const alas = [-1, 1].map(sx => { const a = new THREE.Group(); a.position.x = sx * .12; g.add(a); part(new THREE.BoxGeometry(1.1, .04, .35), m, sx * .55, 0, 0, a, 0); part(new THREE.BoxGeometry(.3, .045, .36), SM("#2a2a2a"), sx * 1.0, 0, 0, a, 0); return a });
  g.userData = { alas, r: 22 + (i % 11) * 6, h: 14 + (i % 5) * 5, v: .25 + (i % 4) * .05, ph: i * 1.7 }; return g });
function gaviotas(t) { TURT.updateMatrixWorld(true); const c = TURT.getWorldPosition(new THREE.Vector3()); GAVIOTAS.forEach(g => { const u = g.userData, a = t * u.v + u.ph; g.position.set(c.x + Math.cos(a) * u.r, u.h + Math.sin(t * .7 + u.ph) * 2, c.z + Math.sin(a) * u.r); g.rotation.set(0, -a, Math.sin(t * .5 + u.ph) * .2); u.alas.forEach((al, i) => al.rotation.z = (i ? -1 : 1) * Math.sin(t * 6 + u.ph) * .5) }) }

// nubes con forma y un muelle con botes en la costa
const NUBES = Array.from({ length: 16 }, (_, i) => { const r = rng(300 + i), g = new THREE.Group(); scene.add(g); const a = r() * Math.PI * 2, d = 160 + r() * 160; g.position.set(Math.cos(a) * d, 70 + r() * 50, Math.sin(a) * d);
  for (let k = 0; k < 10; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: k < 6 ? "#ffffff" : "#c3c9d6", transparent: true, opacity: .85, depthWrite: false, fog: false })); sp.position.set((r() - .5) * 40, k < 6 ? (r() - .1) * 8 : -3 - r() * 3, (r() - .5) * 20); sp.scale.set(30 + r() * 30, 16 + r() * 12, 1); g.add(sp) } return g });
{ const mu = new THREE.Group(); COSTA.add(mu); mu.position.set(40, 0, 10); for (let k = 0; k < 10; k++) part(new THREE.BoxGeometry(2, .25, 1), M_PLANK, k * 2, 1.2, 0, mu, 0); for (let k = 0; k < 6; k++) part(new THREE.CylinderGeometry(.18, .18, 3, 8), M_BEAM, k * 4, 0, .6, mu, 0);
  [["#c94b4b", 6, 5], ["#3f6a8a", 14, -5], ["#e8dcc0", 24, 6]].forEach(([c, x, z]) => { const b = part(new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), SM(c), x, .6, z, mu, 0); b.scale.set(1.2, .7, 3) }) }

// ---------- todavía más detalle: hiedra en las paredes, chimeneas con humo, un pozo de agua, bancos, cajones de pescado y sogas
const HUMO_PTS = [], HUMO = [];
{ const r = rng(140), hoja = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.17, 0), SM("#3f6a2e", { roughness: .8 }), 2400), hoja2 = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.14, 0), SM("#5a8a3a", { roughness: .8 }), 2400); [hoja, hoja2].forEach(m => { m.castShadow = true; TURT.add(m) }); let n = 0;
  const v = new THREE.Vector3();
  [...CASAS, NUESTRA, ESCUELA].forEach(H => { if (r() < .35) return; H.g.updateMatrix(); const sx = r() < .5 ? -1 : 1, x0 = sx * ((H.Wd ?? 6.4) / 2 - .3), top = 2 + r() * 2.2;
    for (let k = 0; k < 220 && n < 2400; k++) { const y = Math.pow(r(), .8) * top, x = x0 - sx * r() * (1.6 * (1 - y / (top + .5))) ; v.set(x, y, 3.12 + r() * .08).applyMatrix4(H.g.matrix); dummy.position.copy(v); dummy.rotation.set(r() * 3, r() * 3, r() * 3); dummy.scale.setScalar(.7 + r() * .7); dummy.updateMatrix(); (k % 2 ? hoja2 : hoja).setMatrixAt(n >> 0, dummy.matrix); if (k % 2) n++ } });
  hoja.count = hoja2.count = n;
  // chimeneas de piedra con humo
  [...CASAS, NUESTRA, ESCUELA].forEach((H, i) => { const c = part(new THREE.BoxGeometry(.8, 2.4, .8), M_STONE, (H.Wd ?? 6.4) / 2 - 1.3, (H.Hh ?? 5) + 1.6, -1, H.g, 0); c.castShadow = true; part(new THREE.BoxGeometry(1, .2, 1), M_STONE, 0, 1.25, 0, c, 0); HUMO_PTS.push(c) });
  // el pozo de agua de la plaza
  const pozo = new THREE.Group(); enConcha(pozo, -2.8, 1, .3); part(new THREE.CylinderGeometry(.9, .95, .9, 20, 1, true), (() => { const m = M_STONE.clone(); m.side = THREE.DoubleSide; return m })(), 0, .45, 0, pozo, 0); part(new THREE.CircleGeometry(.85, 20), SM("#0e1a1c", { roughness: .1 }), 0, .5, 0, pozo, 0).rotation.x = -Math.PI / 2;
  for (const s of [-1, 1]) part(new THREE.BoxGeometry(.14, 1.8, .14), M_BEAM, s * .85, 1.3, 0, pozo, 0); part(new THREE.CylinderGeometry(.08, .08, 1.9, 8), M_BEAM, 0, 1.9, 0, pozo, 0).rotation.z = Math.PI / 2; const te = part(new THREE.ConeGeometry(1.3, .8, 4), M_SHING, 0, 2.55, 0, pozo, 0); te.rotation.y = Math.PI / 4;
  const balde = part(new THREE.CylinderGeometry(.2, .16, .3, 12), M_PLANK, .3, 1.15, 0, pozo, 0); part(new THREE.CylinderGeometry(.01, .01, .7, 4), SM("#c9b48a"), .3, 1.5, 0, pozo, 0);
  // bancos contra las casas
  [[3.3, 11.5, -Math.PI / 2], [-3.3, -10.5, Math.PI / 2], [3.3, -16, -Math.PI / 2], [-3.3, 15, Math.PI / 2]].forEach(([x, z, ry]) => { const b = new THREE.Group(); enConcha(b, x, z, ry); part(new THREE.BoxGeometry(1.8, .1, .45), M_PLANK, 0, .5, 0, b, 0); for (const s of [-1, 1]) part(new THREE.BoxGeometry(.1, .5, .4), M_BEAM, s * .75, .25, 0, b, 0); part(new THREE.BoxGeometry(1.8, .35, .06), M_PLANK, 0, .85, -.2, b, 0) });
  // cajones de pescado y rollos de soga junto al mercado
  const pez = SM("#9ab0b8", { metalness: .4, roughness: .3 });
  [[-10.5, 21.5], [-12, 26.5], [-16.5, 21], [-9.5, 24.5]].forEach(([x, z], i) => { const c = new THREE.Group(); enConcha(c, x, z, r() * 3); part(new THREE.BoxGeometry(1, .45, .7), M_PLANK, 0, .22, 0, c, 0); for (let k = 0; k < 5; k++) { const f = part(new THREE.SphereGeometry(.12, 10, 6), pez, -.3 + k * .15, .5, (r() - .5) * .3, c, 0); f.scale.set(2.2, .6, .9); f.rotation.y = (r() - .5) * .6 }
    if (i % 2) { const s = part(new THREE.TorusGeometry(.3, .06, 8, 20), SM("#c9b48a", { roughness: 1 }), .9, .07, .2, c, 0); s.rotation.x = Math.PI / 2; part(new THREE.TorusGeometry(.22, .06, 8, 20), SM("#c9b48a", { roughness: 1 }), .9, .18, .2, c, 0).rotation.x = Math.PI / 2 } }) }
HUMO_PTS.forEach(() => { for (let k = 0; k < 4; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#e8e4dc", transparent: true, opacity: 0, depthWrite: false })); scene.add(sp); HUMO.push(sp) } });
function humo(t) { HUMO_PTS.forEach((c, i) => { c.updateMatrixWorld(true); const o = new THREE.Vector3(0, 1.4, 0).applyMatrix4(c.matrixWorld); for (let k = 0; k < 4; k++) { const s = HUMO[i * 4 + k], q = (t * .25 + k / 4 + i * .13) % 1; s.position.set(o.x + Math.sin(q * 5 + i) * .6 + q * 1.5, o.y + q * 4, o.z + q * .8); s.scale.setScalar(.8 + q * 2.6); s.material.opacity = (1 - q) * .35 } }) }

const ROPA3 = [], GALLINAS = [], BOTES = [];
// ---------- ultradetalle (revisión cuadro a cuadro, 24-nov-2026)
const R3 = rng(400), V3 = new THREE.Vector3();
// espuma alrededor de la tortuga, en la línea de agua real (se achica cuando el caparazón se hunde) y salpicaduras de cada remada
const T_ESPUMA = tex(1024, 1024, (g, w, h) => { const r = rng(401); g.clearRect(0, 0, w, h); const cx = w / 2, cy = h / 2, R0 = w / 2;
  // espuma de verdad: encaje de vetas finas que siguen la orilla + burbujas chiquitas, más densa contra el cuerpo y deshilachada hacia afuera
  for (let k = 0; k < 4200; k++) { const q = .62 + Math.pow(r(), 2.2) * .38, a0 = r() * 6.283, L = .02 + r() * .09, fade = 1 - (q - .62) / .38; g.strokeStyle = `rgba(255,255,255,${(.06 + r() * .3) * fade})`; g.lineWidth = .8 + r() * 2.6 * fade; g.beginPath();
    for (let j = 0; j <= 8; j++) { const a = a0 + L * j / 8, qq = q + Math.sin(a * 37 + k) * .006 + (r() - .5) * .004; const x = cx + Math.cos(a) * R0 * qq, y = cy + Math.sin(a) * R0 * qq; j ? g.lineTo(x, y) : g.moveTo(x, y) } g.stroke() }
  for (let k = 0; k < 16000; k++) { const q = .62 + Math.pow(r(), 1.8) * .38, a = r() * 6.283, fade = 1 - (q - .62) / .38, x = cx + Math.cos(a) * R0 * q, y = cy + Math.sin(a) * R0 * q; g.fillStyle = `rgba(255,255,255,${(.15 + r() * .45) * fade})`; g.beginPath(); g.arc(x, y, .5 + r() * 1.8, 0, 7); g.fill() } });
const FOAM = new THREE.Mesh(new THREE.RingGeometry(.9, 1.15, 128, 1), new THREE.MeshStandardMaterial({ map: T_ESPUMA, transparent: true, depthWrite: false, roughness: .6 })); FOAM.rotation.order = "XYZ"; scene.add(FOAM);
const SALPI = Array.from({ length: 48 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#dfe8ea", transparent: true, opacity: 0, depthWrite: false })); scene.add(s); return s });
function espuma(t, tort) { const b = tort.bajo || 0, f = b <= RIM ? 1.04 : Math.sqrt(Math.max(.02, 1 - Math.pow(Math.min(1, (b - RIM) / SH), 1 / .62)));
  FOAM.position.set(TURT.position.x, .07, TURT.position.z); FOAM.rotation.set(-Math.PI / 2, 0, TURT.rotation.y); FOAM.scale.set(SB * f, SA * f, 1); FOAM.material.opacity = .85;
  ALETAS.forEach(({ piv, sx, sz }, i) => { piv.updateMatrixWorld(true); const o = V3.set(sx * 9, -1, 0).applyMatrix4(piv.matrixWorld), ph = t * .9 * (tort.paso ?? 1) * 1 + (sx * sz > 0 ? 0 : Math.PI), fuerza = Math.max(0, Math.cos(ph)) * (tort.paso ?? 1);
    for (let k = 0; k < 12; k++) { const s = SALPI[i * 12 + k], q = (t * 1.3 + k / 12) % 1; s.position.set(o.x + Math.sin(k * 2.1) * (3 + q * 4), Math.max(.1, q * 2.4 - q * q * 2.2), o.z + Math.cos(k * 1.7) * (3 + q * 4)); s.scale.setScalar(.6 + q * 1.4); s.material.opacity = o.y < 1.5 ? fuerza * (1 - q) * .28 : 0 } }) }
// algas colgando del borde del caparazón, escalera de soga y una red de pesca secándose
{ const al = new THREE.InstancedMesh(new THREE.BoxGeometry(.18, 1, .03), new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .7, side: THREE.DoubleSide }), 260), cc = new THREE.Color(); al.castShadow = true; TURT.add(al);
  for (let k = 0; k < 260; k++) { const a = k / 260 * 6.283 + R3() * .02, x = Math.cos(a) * SB * 1.045, z = Math.sin(a) * SA * 1.045, L = .6 + R3() * 1.6; dummy.position.set(x, RIM - .3 - L / 2, z); dummy.rotation.set(0, -a, (R3() - .5) * .25); dummy.scale.set(1, L, 1); dummy.updateMatrix(); al.setMatrixAt(k, dummy.matrix); al.setColorAt(k, cc.set(["#3f6a2e", "#2e5a26", "#5a7a2a", "#6a6a2a"][R3() * 4 | 0])) }
  const esc = new THREE.Group(); TURT.add(esc); esc.position.set(-SB * 1.05, 0, 10); esc.rotation.y = Math.PI / 2; const soga = SM("#b8a07a", { roughness: 1 });
  for (const s of [-1, 1]) part(new THREE.CylinderGeometry(.04, .04, 6, 6), soga, s * .45, RIM - 2.6, 0, esc, 0); for (let k = 0; k < 10; k++) part(new THREE.CylinderGeometry(.05, .05, .95, 6), M_PLANK, 0, RIM - 5.3 + k * .56, 0, esc, 0).rotation.z = Math.PI / 2;
  const T_RED = tex(512, 512, (g, w, h) => { const r = rng(402); g.clearRect(0, 0, w, h); g.strokeStyle = "rgba(200,190,160,.95)"; g.lineWidth = 3; for (let k = 0; k < 26; k++) { g.beginPath(); for (let y = 0; y <= h; y += 20) g.lineTo(k * 20 + Math.sin(y * .03 + k) * 5 + (r() - .5) * 4, y); g.stroke(); g.beginPath(); for (let x = 0; x <= w; x += 20) g.lineTo(x, k * 20 + Math.sin(x * .025 + k) * 6 + (r() - .5) * 4); g.stroke() } for (let k = 0; k < 30; k++) { g.fillStyle = "#c94b4b"; g.beginPath(); g.arc(r() * w, r() * 40, 7, 0, 7); g.fill() } });
  const red = new THREE.Group(); enConcha(red, -9.5, 27.5, .4); for (const s of [-1, 1]) part(new THREE.CylinderGeometry(.08, .1, 3, 8), M_BEAM, s * 1.6, 1.5, 0, red, 0);
  const rm = part(new THREE.PlaneGeometry(3.2, 2.2, 12, 8), new THREE.MeshStandardMaterial({ map: T_RED, transparent: true, alphaTest: .3, side: THREE.DoubleSide, roughness: 1 }), 0, 1.8, 0, red, 0); const pp = rm.geometry.attributes.position; for (let i = 0; i < pp.count; i++) pp.setZ(i, Math.sin(pp.getX(i) * 1.3) * .2 - (1 - Math.abs(pp.getX(i)) / 1.6) * .25 * (1.1 - pp.getY(i) / 1.1)); rm.geometry.computeVertexNormals() }
// utilería en la vereda de cada casa: barriles, cajones, baldes, bolsas y palas apoyadas, con pasto 3D al pie de las paredes
{ const bar = new THREE.InstancedMesh(new THREE.CylinderGeometry(.36, .32, .95, 14), M_PLANK, 120), caj = new THREE.InstancedMesh(new THREE.BoxGeometry(.75, .6, .75), M_PLANK, 120), bal = new THREE.InstancedMesh(new THREE.CylinderGeometry(.18, .14, .3, 12), SM("#8a8a90", { metalness: .6, roughness: .4 }), 80), bol = new THREE.InstancedMesh(new THREE.SphereGeometry(.35, 12, 8), SM("#b8a27a", { roughness: 1 }), 80), pal = new THREE.InstancedMesh(new THREE.BoxGeometry(.06, 1.8, .06), SM("#7a5030"), 50), pas = new THREE.InstancedMesh(new THREE.ConeGeometry(.04, 1, 3), new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .85 }), 5000);
  [bar, caj, bal, bol, pal, pas].forEach(m => { m.castShadow = m.receiveShadow = true; TURT.add(m); m.count = 0 }); const cc = new THREE.Color();
  const pon = (m, lx, ly, lz, H, ry = 0, sc = [1, 1, 1], rx = 0) => { V3.set(lx, 0, lz).applyMatrix4(H.g.matrix); dummy.position.set(V3.x, SY(V3.x, V3.z) + ly, V3.z); dummy.rotation.set(rx, ry, 0); dummy.scale.set(...sc); dummy.updateMatrix(); m.setMatrixAt(m.count++, dummy.matrix) };
  [...CASAS, NUESTRA, ESCUELA, PANADERIA].forEach(H => { H.g.updateMatrix(); const Wd = H.Wd ?? 6.4;
    for (const s of [-1, 1]) { const x0 = s * (Wd / 2 - .5); const t = R3();
      if (t < .3) { pon(bar, x0, .48, 3.6, H, R3()); pon(bar, x0 - s * .75, .48, 3.55, H, R3()); pon(caj, x0 - s * .3, 1.25, 3.6, H, R3() * .5) }
      else if (t < .55) { pon(caj, x0, .3, 3.6, H, R3()); pon(caj, x0, .9, 3.6, H, R3()); pon(bal, x0 - s * .8, .15, 3.5, H) }
      else if (t < .8) { pon(bol, x0, .3, 3.55, H, 0, [1, .8, 1]); pon(bol, x0 - s * .55, .28, 3.6, H, 0, [.9, .75, .9]); pon(pal, x0 - s * .9, .85, 3.25, H, 0, [1, 1, 1], -.25) }
      else { pon(bar, x0, .48, 3.6, H, R3()); pon(bal, x0 - s * .6, .15, 3.55, H) } }
    for (let k = 0; k < 140 && pas.count < 5000; k++) { const x = (R3() - .5) * Wd, hg = .15 + R3() * .35; pon(pas, x, hg / 2, 3.15 + R3() * .25, H, R3() * 6, [1, hg, 1], (R3() - .5) * .5); pas.setColorAt(pas.count - 1, cc.set(["#4f7a32", "#6a9a3a", "#3f6a2a", "#8aa84a"][R3() * 4 | 0])) } });
  // charcos que reflejan en las calles
  const ch = new THREE.MeshStandardMaterial({ color: "#5a6a70", roughness: .05, metalness: .6, transparent: true, opacity: .85 });
  [[1.2, 7], [-1.5, -3], [.8, 14.5], [-.6, 20], [10, 1], [-15, 1.5], [1.6, -18]].forEach(([x, z], i) => { const c = part(new THREE.CircleGeometry(.6 + (i % 3) * .3, 20), ch, x, SY(x, z) + .04, z, TURT, 0); c.rotation.x = -Math.PI / 2; c.scale.set(1.4, 1, 1) }) }
// ropa tendida entre casas sobre la calle principal
{ [].forEach(([z, y], j) => { const yy = SY(0, z) + y, cu = part(new THREE.CylinderGeometry(.015, .015, 7.6, 4), SM("#ddd"), 0, yy, z, TURT, 0); cu.rotation.z = Math.PI / 2;
    for (let k = 0; k < 6; k++) { const c = ["#e05a4a", "#f2e6c4", "#4a7ab8", "#f2c41e", "#ffffff", "#5a8a4a", "#c98ac9"][(k + j * 2) % 7], m = part(new THREE.PlaneGeometry(.6 + R3() * .4, .7 + R3() * .5), new THREE.MeshStandardMaterial({ color: c, side: THREE.DoubleSide, roughness: .9 }), -3 + k * 1.15 + R3() * .3, yy - .45, z, TURT, 0); ROPA3.push(m) } }) }
// gallinas y gatos (de bloques)
{ const blanco = SM("#f4f0e6"), rojo = SM("#c9302a"), ama = SM("#e8a020");
  [[-1.8, 2.6], [-.8, 3.4], [2.2, 1.2], [-11, 4.4], [11.4, -1.8]].forEach(([x, z], i) => { const g = new THREE.Group(); enConcha(g, x, z, R3() * 6); part(RB(.34, .3, .44, .06), blanco, 0, .3, 0, g, 0); part(RB(.18, .2, .18, .04), blanco, 0, .55, .2, g, 0); part(new THREE.BoxGeometry(.05, .08, .1), rojo, 0, .7, .2, g, 0); part(new THREE.ConeGeometry(.04, .1, 4), ama, 0, .55, .33, g, 0).rotation.x = Math.PI / 2; for (const s of [-1, 1]) part(new THREE.BoxGeometry(.03, .16, .03), ama, s * .08, .08, 0, g, 0); GALLINAS.push(g) });
  [[3.6, 9.2, "#e08a3a"], [-3.6, -14, "#3a3a3a"]].forEach(([x, z, c]) => { const g = new THREE.Group(); enConcha(g, x, z, x > 0 ? -1.57 : 1.57); const m = SM(c); part(RB(.25, .25, .6, .06), m, 0, .25, 0, g, 0); part(RB(.25, .22, .22, .05), m, 0, .45, .3, g, 0); for (const s of [-1, 1]) part(new THREE.ConeGeometry(.05, .1, 4), m, s * .08, .6, .3, g, 0); const co = part(new THREE.CylinderGeometry(.03, .03, .5, 6), m, 0, .45, -.4, g, 0); co.rotation.x = .8 }) }
// botes de pesca a media distancia y más casas y un muelle en la costa
{ const vela = new THREE.MeshStandardMaterial({ color: "#f0e8d8", side: THREE.DoubleSide, roughness: .9 });
  [[70, 30, "#c94b4b"], [-60, 70, "#3f6a8a"], [90, -50, "#e8dcc0"], [-70, -60, "#5a7a3a"]].forEach(([x, z, c]) => { const b = new THREE.Group(); scene.add(b); b.position.set(x, .2, z); b.rotation.y = R3() * 6; const cas = part(new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), SM(c), 0, .5, 0, b, 0); cas.scale.set(1.3, .8, 3.6); part(new THREE.CylinderGeometry(.07, .07, 5, 6), M_BEAM, 0, 2.8, .4, b, 0); const v = part(new THREE.PlaneGeometry(2.2, 3.2), vela, .05, 3, -.4, b, 0); v.rotation.y = Math.PI / 2; BOTES.push(b) });
  for (let k = 0; k < 14; k++) { const x = -15 - R3() * 30, z = -260 + k * 38 + R3() * 10; part(RB(5 + R3() * 3, 4 + R3() * 2, 5, .2), M_WALL[(k + 3) % M_WALL.length], x, 2.5, z, COSTA, 0); const t2 = part(new THREE.ConeGeometry(4.5, 3, 4), M_SHING, x, 6, z, COSTA, 0); t2.rotation.y = Math.PI / 4 } }
// el pozo: terrones sueltos y piedritas alrededor
{ const ter = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.14, 0), SMt(T_DIRT, { roughness: 1 }), 40); ter.castShadow = true; HOYO.add(ter); for (let k = 0; k < 40; k++) { const a = R3() * 6.283, d = 1.2 + R3() * 1.1; dummy.position.set(Math.cos(a) * d, .1, Math.sin(a) * d); dummy.rotation.set(R3() * 3, R3() * 3, 0); dummy.scale.setScalar(.6 + R3() * 1.4); dummy.updateMatrix(); ter.setMatrixAt(k, dummy.matrix) } }
// noche: estrellas en el cielo y luciérnagas alrededor de los faroles
const ESTRELLAS = (() => { const n = 700, p = new Float32Array(n * 3); for (let k = 0; k < n; k++) { const a = R3() * 6.283, e = .15 + R3() * 1.3; p[k * 3] = Math.cos(a) * Math.cos(e) * 360; p[k * 3 + 1] = Math.sin(e) * 360; p[k * 3 + 2] = Math.sin(a) * Math.cos(e) * 360 } const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3)); const m = new THREE.Points(g, new THREE.PointsMaterial({ color: "#fff6e0", size: 1.6, sizeAttenuation: false, fog: false, transparent: true, opacity: .9 })); scene.add(m); return m })();
const LUCES = Array.from({ length: 30 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#e8ff9a", transparent: true, opacity: .9, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(.25); TURT.add(s); s.userData = { x: [-3.2, -3.2, 3.2, -3.2][i % 4], z: [12, 7, 18, -4][i % 4], ph: i * 1.7 }; return s });
function noche(t, si) { M_AGUA.envMapIntensity = si ? .12 : 1.05; ESTRELLAS.visible = si; LUCES.forEach(s => { s.visible = si; const u = s.userData; s.position.set(u.x + Math.sin(t * .7 + u.ph) * 1.2, SY(u.x, u.z) + 2.5 + Math.sin(t * 1.1 + u.ph * 2) * 1, u.z + Math.cos(t * .6 + u.ph) * 1.2); s.material.opacity = .5 + .5 * Math.sin(t * 5 + u.ph) }) }
function vida(t) { ROPA3.forEach((m, i) => m.rotation.x = Math.sin(t * 2.2 + i) * .25); GALLINAS.forEach((g, i) => { g.children[1].position.z = .2 + Math.max(0, Math.sin(t * 6 + i * 2)) * .06 }); BOTES.forEach((b, i) => { b.position.y = .2 + Math.sin(t * 1.2 + i) * .15; b.rotation.z = Math.sin(t * .9 + i) * .05 }) }

// ================= DUSTMERE: lo común (medidas del mundo y el colmillo) — lo usan el mundo, la bestia y las escenas =================
// Norte = −z. La plaza está en el origen; la torre del cuerno en su borde norte; la cresta de Onetusk, lejos al norte.
const PLAZA = [0, 0], TORRE = [0, -10], TORRE_H = 16;          // la torre mide 16 de alto; el cuerno va acostado arriba, a lo largo de x
const CRESTA = [0, -160], CRESTA_H = 24;                        // donde está parado Onetusk hace 60 años (sobre la cresta, a 24 de alto)
const CASA_MIA = [9, 16];                                       // la casa del narrador
const COLMILLO_L = 20;                                          // largo del colmillo y del cuerno (el mismo: «long as three houses»)
// las 11 pisadas-estanque: de la cresta a la plaza, alternando pata izquierda y derecha
const ESTANQUES = Array.from({ length: 11 }, (_, i) => [(i % 2 ? 1 : -1) * 6, lerp(-146, -24, i / 10)]);
// altura del piso: plano en el pueblo, y sube hacia la cresta (una rampa de arena y roca desde z = −110)
const ALT = (x, z) => { const q = cl((-z - 110) / 46, 0, 1); return CRESTA_H * q * q * (3 - 2 * q) * Math.exp(-((x / 150) ** 4)) + (((x / SB) ** 2 + (z / SA) ** 2 < 1) ? SY(x, z) : 0) };
const placeW = (k, x, z, ry = 0) => { k.g.visible = true; k.g.position.set(x, ALT(x, z), z); k.g.rotation.set(0, ry, 0) };
const mergeG = list => { const gs = list.map(([g, m]) => { const q = g.index ? g.toNonIndexed() : g.clone(); q.applyMatrix4(m); return q }); const n = gs.reduce((a, q) => a + q.attributes.position.count, 0);
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2); let o = 0; gs.forEach(q => { pos.set(q.attributes.position.array, o * 3); nor.set(q.attributes.normal.array, o * 3); if (q.attributes.uv) uv.set(q.attributes.uv.array, o * 2); o += q.attributes.position.count });
  const G = new THREE.BufferGeometry(); G.setAttribute("position", new THREE.BufferAttribute(pos, 3)); G.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); G.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); return G };
const MZ = (p, dir, s) => new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize()), s);
// ---------- el colmillo: la MISMA curva, las mismas grietas y el mismo blanco para el cuerno de la torre y el de Onetusk
const COLMILLO_PTS = [[0, 0, 0], [0, -2.2, 5], [0, -2.7, 10.5], [0, -.9, 15.6], [0, 3, 19.2]];
const colmilloCurva = (L = COLMILLO_L) => new THREE.CatmullRomCurve3(COLMILLO_PTS.map(q => new THREE.Vector3(q[0], q[1], q[2]).multiplyScalar(L / 20)));
// tubo que se afina de r0 (la base) a la punta; `desde` y `hasta` recortan el colmillo (0 = base, 1 = punta); `hueco` deja la base abierta
function geoColmillo(L = COLMILLO_L, r0 = 1.5, { desde = 0, hasta = 1, hueco = false } = {}) {
  const cu = colmilloCurva(L), TS = 72, RS = 28, pos = [], uv = [], idx = [], fr = cu.computeFrenetFrames(TS, false);
  for (let i = 0; i <= TS; i++) { const u = lerp(desde, hasta, i / TS), p = cu.getPointAt(u), k = Math.min(TS, Math.round(u * TS)), N = fr.normals[k], B = fr.binormals[k], r = r0 * (.1 + .9 * Math.pow(1 - u, .75)) * (1 + .03 * Math.sin(u * 40));
    for (let j = 0; j <= RS; j++) { const a = j / RS * Math.PI * 2, c = Math.cos(a), s = Math.sin(a), rr = r * (1 + .025 * Math.sin(a * 3 + u * 9)); pos.push(p.x + (N.x * c + B.x * s) * rr, p.y + (N.y * c + B.y * s) * rr, p.z + (N.z * c + B.z * s) * rr); uv.push(u, j / RS) } }
  for (let i = 0; i < TS; i++) for (let j = 0; j < RS; j++) { const a = i * (RS + 1) + j, b = a + RS + 1; idx.push(a, b, a + 1, b, b + 1, a + 1) }
  if (!hueco) { const c = pos.length / 3, p = cu.getPointAt(desde); pos.push(p.x, p.y, p.z); uv.push(desde, .5); for (let j = 0; j < RS; j++) idx.push(c, j, j + 1) }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g }
// marfil viejo pintado a mano: vetas a lo largo, grietas oscuras, manchas de té en la base y anillos de crecimiento
const T_MARFIL = (() => { const [c, z] = pintarDoble(2048, 1024, (c, z, w, h) => { const r = rng(2601); c.fillStyle = "#efe6d0"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
    const gr = c.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, "rgba(150,110,60,.55)"); gr.addColorStop(.18, "rgba(190,160,110,.25)"); gr.addColorStop(.6, "rgba(255,250,235,0)"); gr.addColorStop(1, "rgba(255,255,250,.35)"); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    for (let k = 0; k < 260; k++) { const y = r() * h, x0 = r() * w, len = 80 + r() * 700; c.strokeStyle = r() < .5 ? `rgba(120,90,50,${.08 + r() * .14})` : `rgba(255,255,245,${.1 + r() * .2})`; c.lineWidth = 1 + r() * 3; c.beginPath(); c.moveTo(x0, y); for (let q = 0; q <= 1; q += .1) c.lineTo(x0 + len * q, y + Math.sin(q * 6 + k) * 5); c.stroke() }
    for (let x = 0; x < w; x += 46 + r() * 60) { c.strokeStyle = `rgba(130,100,60,${.1 + r() * .12})`; c.lineWidth = 2 + r() * 4; c.beginPath(); c.moveTo(x, 0); for (let y = 0; y <= h; y += 40) c.lineTo(x + Math.sin(y * .02 + x) * 6, y); c.stroke(); z.strokeStyle = "rgba(70,70,70,.5)"; z.lineWidth = 3; z.beginPath(); z.moveTo(x, 0); z.lineTo(x, h); z.stroke() }
    for (let k = 0; k < 46; k++) { let x = r() * w, y = r() * h; const n = 14 + r() * 30 | 0; c.strokeStyle = `rgba(50,32,16,${.55 + r() * .35})`; c.lineWidth = 1.5 + r() * 3.5; z.strokeStyle = "rgba(0,0,0,.9)"; z.lineWidth = 4 + r() * 5; c.beginPath(); z.beginPath(); c.moveTo(x, y); z.moveTo(x, y); for (let q = 0; q < n; q++) { x += 10 + r() * 26; y += (r() - .5) * 16; c.lineTo(x, y); z.lineTo(x, y) } c.stroke(); z.stroke() }
    for (let k = 0; k < 500; k++) { c.fillStyle = `rgba(110,80,40,${r() * .25})`; c.beginPath(); c.arc(r() * w, r() * h, 1 + r() * 5, 0, 7); c.fill() } });
  return { c, z } })();
const M_MARFIL = new THREE.MeshStandardMaterial({ map: T_MARFIL.c, bumpMap: T_MARFIL.z, bumpScale: 5, roughness: .42, metalness: 0, color: "#ffffff" });
// el corte: donde el colmillo fue serruchado (anillos de dentina y un corazón oscuro); va en la base del cuerno y en el muñón de Onetusk
const T_CORTE_MARFIL = (() => { const [c, z] = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(2602); c.fillStyle = "#e6d8b8"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
    for (let k = 0; k < 44; k++) { const rr = 250 - k * 5.6; c.strokeStyle = k % 3 ? `rgba(150,120,70,${.25 + r() * .25})` : `rgba(250,244,225,${.5})`; c.lineWidth = 1.5 + r() * 2.5; c.beginPath(); for (let a = 0; a <= 6.3; a += .1) { const q = rr * (1 + .02 * Math.sin(a * 5 + k)); a ? c.lineTo(256 + Math.cos(a) * q, 256 + Math.sin(a) * q) : c.moveTo(256 + q, 256) } c.stroke() }
    c.fillStyle = "#5a3a22"; c.beginPath(); c.arc(256, 256, 26, 0, 7); c.fill(); z.fillStyle = "#202020"; z.beginPath(); z.arc(256, 256, 26, 0, 7); z.fill();
    for (let k = 0; k < 9; k++) { const a = r() * 6.3; c.strokeStyle = "rgba(60,36,18,.8)"; c.lineWidth = 2 + r() * 3; z.strokeStyle = "rgba(0,0,0,.9)"; z.lineWidth = 5; c.beginPath(); z.beginPath(); c.moveTo(256, 256); z.moveTo(256, 256); let x = 256, y = 256; for (let q = 0; q < 10; q++) { x += Math.cos(a + (r() - .5) * .6) * 24; y += Math.sin(a + (r() - .5) * .6) * 24; c.lineTo(x, y); z.lineTo(x, y) } c.stroke(); z.stroke() }
    for (let k = 0; k < 60; k++) { const a = r() * 6.3, q = 30 + r() * 210; c.strokeStyle = "rgba(90,70,40,.35)"; c.lineWidth = 1; c.beginPath(); c.moveTo(256 + Math.cos(a) * q, 256 + Math.sin(a) * q); c.lineTo(256 + Math.cos(a + .15) * (q + 14), 256 + Math.sin(a + .15) * (q + 14)); c.stroke() } });
  return { c, z } })();
const M_CORTE_MARFIL = new THREE.MeshStandardMaterial({ map: T_CORTE_MARFIL.c, bumpMap: T_CORTE_MARFIL.z, bumpScale: 3, roughness: .7 });

// ================= DUSTMERE: el mundo (valle de desierto, pueblo de adobe, torre del cuerno, estanques y ruinas) =================
// Norte = −z. Todo lo de la tortuga y del mar del motor se esconde: acá el piso es una malla de terreno propia (SUELO).
TURT.children.forEach(o => o.visible = false);
CABEZA.visible = false; ALETAS.forEach(a => a.piv.visible = false); COLA.visible = false; COSTA.visible = false; FOAM.visible = false; FONDO.visible = false; HONDA.visible = false;
BOTES.forEach(b => b.visible = false); GAVIOTAS.forEach(g => g.visible = false); LUCES.forEach(l => l.visible = false); ESPUMA.forEach(s => s.visible = false); SALPI.forEach(s => s.visible = false);
NUBE.forEach(s => s.visible = false); ROPA3.forEach(m => m.visible = false); GALLINAS.forEach(g => g.visible = false);
HOUSES.forEach(H => H.g.visible = false);

// ---------- ayudantes
const sst = (a, b, x) => { const q = cl((x - a) / (b - a)); return q * q * (3 - 2 * q) };
const hash2 = (i, j) => { let n = (Math.imul(i | 0, 374761393) + Math.imul(j | 0, 668265263)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296 };
const ruido2 = (x, z) => { const i = Math.floor(x), j = Math.floor(z), u = x - i, v = z - j, a = u * u * (3 - 2 * u), b = v * v * (3 - 2 * v); return lerp(lerp(hash2(i, j), hash2(i + 1, j), a), lerp(hash2(i, j + 1), hash2(i + 1, j + 1), a), b) };
const fbm2 = (x, z, o = 4) => { let s = 0, a = .5, f = 1, n = 0; for (let k = 0; k < o; k++) { s += a * ruido2(x * f + k * 17.3, z * f - k * 9.1); n += a; a *= .5; f *= 2.03 } return s / n };
const TM = (x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, "YXZ")), new THREE.Vector3(sx, sy, sz));
// lote: junta muchas piezas por material y las une en una sola malla por material (pocas llamadas de dibujo)
const lote = () => { const L = {}; return { L, add(k, geo, m) { (L[k] ||= []).push([geo, m || new THREE.Matrix4()]); return this },
  fin(par, mats, o = {}) { const out = {}; for (const k in L) { if (!mats[k]) throw new Error("lote sin material: " + k); const me = new THREE.Mesh(mergeG(L[k]), mats[k]); me.castShadow = o.sombra !== false; me.receiveShadow = true; par.add(me); out[k] = me } return out } } };
const linC = h => { const c = new THREE.Color(h); return [c.r, c.g, c.b] };
const mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
// dibuja con envoltura (para texturas que se repiten sin costura)
const envuelto = (g, w, h, fn) => { for (const dx of [-w, 0, w]) for (const dy of [-h, 0, h]) { g.save(); g.translate(dx, dy); fn(); g.restore() } };
// deforma una esfera/icosaedro en piedra irregular
const geoPiedra = (seed, det = 1, ach = .7) => { const g = new THREE.IcosahedronGeometry(1, det), p = g.attributes.position, r = rng(seed), fx = r() * 9, fy = r() * 9; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = .72 + .5 * ruido2(x * 1.7 + fx + y, z * 1.7 + fy - y); p.setXYZ(i, x * k, y * k * ach, z * k) } g.computeVertexNormals(); return g };

// ---------- los estanques: 11 pisadas de Onetusk (disco + 5 dedos hacia el sur, +z)
const pisadaSD = (dx, dz) => { let d = Math.hypot(dx, dz * 1.06) - 3.85; for (let k = 0; k < 5; k++) { const a = (k - 2) * .43, q = Math.abs(k - 2), d2 = Math.hypot(dx - Math.sin(a) * 4.05, dz - Math.cos(a) * 3.75) - (1.08 - q * .09); if (d2 < d) d = d2 } return d };
const EST = ESTANQUES.map(([x, z], i) => { const yF = Math.min(ALT(x, z + 5.2), ALT(x, z)) - .8; return { x, z, i, yF, yW: yF + .52 } });
// ---------- altura real del terreno (ALT + cresta que cae al norte + dunas + terrazas de roca + pisadas hundidas)
const dunasH = (x, z) => { const w = fbm2(x * .006 + 3, z * .006 + 7, 3), a = x * .021 + z * .011 + w * 7, b = -x * .009 + z * .027 + w * 5; return Math.pow(1 - Math.abs(Math.sin(a)), 1.7) * 6.5 + Math.pow(1 - Math.abs(Math.sin(b)), 2.2) * 3 + fbm2(x * .02, z * .02, 3) * 2.2 };
const dunasM = (x, z) => { const d = Math.hypot(x, (z - 6) / 1.12), m1 = sst(64, 135, d), mc = lerp(sst(24, 64, Math.abs(x)), 1, sst(-34, 24, z)), mb = 1 - sst(380, 425, Math.max(Math.abs(x), Math.abs(z))); return m1 * mc * mb };
function sueloBase(x, z) { const caida = 1 - sst(190, 248, -z); let h = ALT(x, z) * caida;
  const ax = Math.abs(x); if (h > .4 && ax > 15) { const k = sst(15, 34, ax) * .9, n = fbm2(x * .035 + 9, z * .035 + 4, 3), t = h / 4.2 + n * .9, fl = Math.floor(t), hs = (fl + sst(.5, .93, t - fl) - n * .9) * 4.2; h = lerp(h, Math.max(0, hs), k * caida) }
  const m = dunasM(x, z); if (m > 0) h += dunasH(x, z) * m; return h }
function SUELO(x, z) { let h = sueloBase(x, z); if (Math.abs(x) < 17 && z < -12 && z > -158) for (const e of EST) { const dz = z - e.z; if (Math.abs(dz) > 11) continue; const sd = pisadaSD(x - e.x, dz); if (sd > 6) continue;
    const W = .8 + .42 * Math.max(0, h - e.yF); if (sd <= 0) return e.yF - .38 * sst(0, 2.4, -sd) + .05 * Math.sin((x - e.x) * 2.1) * Math.sin(dz * 1.7);
    if (sd < W) return lerp(e.yF, h + .3, sst(0, W, sd)); return h + .3 * (1 - sst(W, W + 2.3, sd)) } return h }
const sueloN = (x, z, e = .6) => { const nx = SUELO(x - e, z) - SUELO(x + e, z), nz = SUELO(x, z - e) - SUELO(x, z + e), l = Math.hypot(nx, 2 * e, nz); return [nx / l, 2 * e / l, nz / l] };
// qué tan cerca del borde de un estanque (para hundir la malla gruesa debajo del parche fino)
const cercaEst = (x, z) => { if (Math.abs(x) > 18 || z > -10 || z < -160) return null; for (const e of EST) { const dz = z - e.z; if (Math.abs(dz) > 12) continue; const sd = pisadaSD(x - e.x, dz); if (sd < 7) return [e, sd] } return null };

// ---------- color del suelo por vértice (arena clara/oscura, tierra pisada del pueblo, roca roja en las pendientes, barro en los estanques)
const C_ARENA = linC("#d2b48a"), C_ARENA2 = linC("#bb9a6e"), C_DUNA = linC("#d49c64"), C_TIERRA = linC("#a98a66"), C_ROCA = linC("#a65a3c"), C_ROCA2 = linC("#c98a5e"), C_BARRO = linC("#5e4a38"), C_BARRO2 = linC("#8a7458"), C_SENDA = linC("#9c7f5e");
// sendas pisadas: de la plaza a cada lugar
const SENDAS = [[0, 8, 0, 52, 3.4], [-9, 0, -38, -2, 2.2], [9, 0, 40, 2, 2.2], [0, -17, 0, -108, 5], [-12, 10, -24, 30, 1.6], [12, 6, 30, -16, 1.6], [-10, -6, -30, -15, 1.5], [10, 14, 22, 24, 1.4], [-20, 30, -20, 50, 1.6], [22, 30, 24, 50, 1.6]];
const sendaK = (x, z) => { let k = 0; for (const [x0, z0, x1, z1, an] of SENDAS) { const dx = x1 - x0, dz = z1 - z0, t = cl(((x - x0) * dx + (z - z0) * dz) / (dx * dx + dz * dz)), d = Math.hypot(x - x0 - dx * t, z - z0 - dz * t) + (fbm2(x * .4, z * .4, 2) - .5) * 1.6; k = Math.max(k, 1 - sst(an * .5, an, d)) } return k };
function colorSuelo(x, z) { const n = fbm2(x * .05 + 11, z * .05 + 2, 4), n2 = fbm2(x * .31 + 5, z * .31 + 8, 2), nor = sueloN(x, z, 1.2), pend = 1 - nor[1];
  let c = mix3(C_ARENA, C_ARENA2, sst(.3, .7, n)); const dm = dunasM(x, z); c = mix3(c, C_DUNA, dm * (.35 + .4 * n2));
  const dp = Math.hypot(x, (z - 6) / 1.12); c = mix3(c, C_TIERRA, (1 - sst(40, 66, dp)) * (.35 + .4 * n2)); c = mix3(c, C_SENDA, sendaK(x, z) * .6);
  const alt = sueloBase(x, z); if (alt > .5 || pend > .05) { const banda = .5 + .5 * Math.sin(alt * 1.9 + n * 5); c = mix3(c, mix3(C_ROCA, C_ROCA2, banda), sst(.1, .36, pend) * .9) }
  const ce = cercaEst(x, z); if (ce) { const sd = ce[1]; c = mix3(c, C_BARRO2, (1 - sst(.6, 3.4, sd)) * .75); c = mix3(c, C_BARRO, 1 - sst(-.3, .9, sd)) }
  const s = .9 + .2 * n2; return [c[0] * s, c[1] * s, c[2] * s] }

// ---------- arena: textura de detalle (granos, ondas del viento, piedritas) con relieve; el color grande viene por vértice
const T_ARENA_D = (() => { const [c, z] = pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(2701); c.fillStyle = "#efe6d6"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
    for (let k = 0; k < 260; k++) { const x = r() * w, y = r() * h, s = 30 + r() * 110, col = r() < .5 ? "rgba(190,160,120,.16)" : "rgba(255,250,238,.2)"; envuelto(c, w, h, () => { const gr = c.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, col); gr.addColorStop(1, "rgba(230,215,190,0)"); c.fillStyle = gr; c.fillRect(x - s, y - s, s * 2, s * 2) });
      const gz = r() < .5 ? "rgba(70,70,70,.3)" : "rgba(190,190,190,.3)"; envuelto(z, w, h, () => { const gr = z.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, gz); gr.addColorStop(1, "rgba(128,128,128,0)"); z.fillStyle = gr; z.fillRect(x - s, y - s, s * 2, s * 2) }) }
    // ondas del viento: crestas claras con sombra del otro lado (corren a lo largo de y, se bifurcan)
    for (let k = 0; k < 64; k++) { const x0 = k * 16 + r() * 8, f1 = 1 + (r() * 3 | 0), ph = r() * 6.3, am = 5 + r() * 9, y0 = r() * h, len = h * (.35 + r() * .65);
      const tr = (g, dx, col, lw) => envuelto(g, w, h, () => { g.strokeStyle = col; g.lineWidth = lw; g.lineCap = "round"; g.beginPath(); for (let q = 0; q <= 1.001; q += .02) { const y = y0 + q * len, x = x0 + dx + Math.sin(y / h * 6.283 * f1 + ph) * am + Math.sin(y / h * 6.283 * 5 + ph * 2) * 2; q ? g.lineTo(x, y) : g.moveTo(x, y) } g.stroke() });
      tr(z, 0, "rgba(225,225,225,.34)", 6); tr(z, 7, "rgba(50,50,50,.3)", 5); tr(c, 0, "rgba(255,248,232,.16)", 5); tr(c, 7, "rgba(150,120,85,.1)", 5) }
    for (let k = 0; k < 26000; k++) { const x = r() * w, y = r() * h, v = r(); c.fillStyle = v < .5 ? `rgba(120,96,66,${.1 + r() * .22})` : `rgba(255,252,240,${.1 + r() * .25})`; c.fillRect(x, y, 1 + r() * 2, 1 + r() * 2); z.fillStyle = v < .5 ? "rgba(60,60,60,.35)" : "rgba(210,210,210,.35)"; z.fillRect(x, y, 2, 2) }
    for (let k = 0; k < 150; k++) { const x = r() * w, y = r() * h, s = 2.5 + r() * 6, a = r() * 3; envuelto(c, w, h, () => { c.fillStyle = "rgba(60,44,30,.35)"; c.beginPath(); c.ellipse(x + 2, y + 2, s, s * .7, a, 0, 7); c.fill(); c.fillStyle = rgbj(["#a08a70", "#8a7660", "#b8a68c", "#7a5a44"][r() * 4 | 0], r, 24); c.beginPath(); c.ellipse(x, y, s, s * .7, a, 0, 7); c.fill() });
      envuelto(z, w, h, () => { z.fillStyle = "rgba(20,20,20,.7)"; z.beginPath(); z.ellipse(x + 1.5, y + 1.5, s + 1.5, s * .7 + 1.5, a, 0, 7); z.fill(); z.fillStyle = "rgba(250,250,250,.9)"; z.beginPath(); z.ellipse(x, y, s, s * .7, a, 0, 7); z.fill() }) } });
  [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); z.repeat.set(1.31, 1.31); z.rotation = .23; return { c, z } })();
const M_ARENA = new THREE.MeshStandardMaterial({ map: T_ARENA_D.c, bumpMap: T_ARENA_D.z, bumpScale: 3.2, roughness: .96, vertexColors: true });
AGUA.material = new THREE.MeshStandardMaterial({ color: "#c9a274", roughness: 1 }); AGUA.position.y = -3; AGUA.castShadow = false;

// ---------- la malla del terreno: fina en el pueblo (≈ 0,7 m) y gruesa lejos (≈ 7 m), hasta ±430
const TERRENO = (() => { const N = 320, E = 430, geo = new THREE.PlaneGeometry(2, 2, N, N); geo.rotateX(-Math.PI / 2); const p = geo.attributes.position, uv = geo.attributes.uv, col = new Float32Array(p.count * 3), mp = u => E * (.2 * u + .8 * u * u * u);
  for (let i = 0; i < p.count; i++) { const x = mp(p.getX(i)), z = mp(p.getZ(i)) - 10; let y = SUELO(x, z); const ce = cercaEst(x, z); if (ce) { const e = ce[0], W = .8 + .42 * Math.max(0, sueloBase(x, z) - e.yF); y -= .7 * (1 - sst(W + .3, W + 1.5, ce[1])) }
    p.setXYZ(i, x, y, z); uv.setXY(i, x / 8.5, z / 8.5); const c = colorSuelo(x, z); col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2] }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals(); const m = new THREE.Mesh(geo, M_ARENA); m.receiveShadow = true; m.castShadow = true; scene.add(m); return m })();

// ---------- roca estratificada: mesetas, cerros rojos y la cresta (bandas de color con relieve, cornisas y surcos)
const T_ESTRATO = (() => { const [c, z] = pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(2710); c.fillStyle = "#a5512f"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
    const cols = ["#a5512f", "#bb6a3e", "#8f4226", "#cf9060", "#dcb88c", "#9a4a34", "#7c3a26", "#c47a4a", "#b05a34", "#e0c49c"]; let y = h * .86, k = 0;
    while (y > -40) { const bh = 14 + r() * 62, col = cols[(k * 3 + (r() * 3 | 0)) % cols.length], f = 1 + (r() * 3 | 0), ph = r() * 6.3, am = 2 + r() * 7; c.fillStyle = col; c.beginPath(); c.moveTo(0, y + 2); for (let x = 0; x <= w; x += 16) c.lineTo(x, y - bh + Math.sin(x / w * 6.283 * f + ph) * am); c.lineTo(w, y + 2); c.fill();
      z.strokeStyle = "rgba(20,20,20,.85)"; z.lineWidth = 3 + r() * 5; z.beginPath(); for (let x = 0; x <= w; x += 16) { const yy = y - bh + Math.sin(x / w * 6.283 * f + ph) * am; x ? z.lineTo(x, yy) : z.moveTo(x, yy) } z.stroke(); z.strokeStyle = "rgba(230,230,230,.6)"; z.lineWidth = 3; z.beginPath(); for (let x = 0; x <= w; x += 16) { const yy = y - bh + 6 + Math.sin(x / w * 6.283 * f + ph) * am; x ? z.lineTo(x, yy) : z.moveTo(x, yy) } z.stroke();
      c.strokeStyle = "rgba(60,26,14,.4)"; c.lineWidth = 2; c.beginPath(); for (let x = 0; x <= w; x += 16) { const yy = y - bh + Math.sin(x / w * 6.283 * f + ph) * am; x ? c.lineTo(x, yy) : c.moveTo(x, yy) } c.stroke(); y -= bh; k++ }
    // surcos verticales de erosión y manchas de barniz del desierto
    for (let q = 0; q < 240; q++) { const x = r() * w, y0 = r() * h * .86, len = 30 + r() * 220, osc = r() < .6; envuelto(c, w, h, () => { c.strokeStyle = osc ? `rgba(50,22,12,${.18 + r() * .25})` : `rgba(245,215,180,${.12 + r() * .16})`; c.lineWidth = 1.5 + r() * 5; c.beginPath(); c.moveTo(x, y0); for (let t = 0; t <= len; t += 20) c.lineTo(x + Math.sin(t * .05 + q) * 4, y0 + t); c.stroke() });
      envuelto(z, w, h, () => { z.strokeStyle = osc ? "rgba(25,25,25,.5)" : "rgba(215,215,215,.4)"; z.lineWidth = 3 + r() * 6; z.beginPath(); z.moveTo(x, y0); z.lineTo(x, y0 + len); z.stroke() }) }
    for (let q = 0; q < 70; q++) { const x = r() * w, yy = r() * h * .8, s = 30 + r() * 90; envuelto(c, w, h, () => { const gr = c.createRadialGradient(x, yy, 0, x, yy, s); gr.addColorStop(0, "rgba(46,22,16,.3)"); gr.addColorStop(1, "rgba(46,22,16,0)"); c.fillStyle = gr; c.fillRect(x - s, yy - s, s * 2, s * 2) }) }
    // el talud de abajo: arena y cascajo
    const gr = c.createLinearGradient(0, h * .8, 0, h); gr.addColorStop(0, "rgba(200,160,112,0)"); gr.addColorStop(.3, "rgba(200,160,112,1)"); gr.addColorStop(1, "#cfa878"); c.fillStyle = gr; c.fillRect(0, h * .8, w, h * .2); z.fillStyle = "#808080"; z.fillRect(0, h * .87, w, h * .13);
    for (let q = 0; q < 1400; q++) { const x = r() * w, yy = h * (.82 + r() * .18), s = 1.5 + r() * 6; c.fillStyle = rgbj(r() < .5 ? "#9a5a3c" : "#b88a62", r, 30, .8); c.beginPath(); c.ellipse(x, yy, s, s * .7, r() * 3, 0, 7); c.fill(); z.fillStyle = "rgba(235,235,235,.7)"; z.beginPath(); z.ellipse(x, yy, s, s * .7, 0, 0, 7); z.fill() } });
  [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
const M_ROCA = new THREE.MeshStandardMaterial({ map: T_ESTRATO.c, bumpMap: T_ESTRATO.z, bumpScale: 7, roughness: .95, flatShading: true });
function geoMesa(R, H, seed, o = {}) { const r = rng(seed), NA = o.na || 46, capas = o.capas || Math.max(3, Math.round(H / 5.5)), tal = (o.talud ?? .26) * H, falda = o.falda ?? 1.75, prof = [[falda, 0, -1], [lerp(falda, 1.06, .62), tal * .5, -1], [1.07, tal, -1]];
  let f = 1.04; for (let k = 0; k < capas; k++) { const y0 = lerp(tal, H, k / capas), y1 = lerp(tal, H, (k + 1) / capas); prof.push([f, y0 + (y1 - y0) * .06, k]); const f2 = f - r() * .025; prof.push([f2, y1 - (y1 - y0) * .1, k]); f = f2 - (.02 + r() * .075) * Math.min(1, 5 / capas) }
  prof.push([f * .97, H, capas], [f * .55, H * 1.012 + .1, capas], [0, H * 1.02 + .15, capas]);
  const ks = Array.from({ length: 6 }, (_, k) => [k + 2, r() * 6.283, (.2 / (k + 1.4)) * (.45 + r())]), pos = [], uv = [], idx = [], ru = Math.max(1, Math.round(R * 6.283 / 46)), s0 = seed * 13 | 0;
  prof.forEach(([pf, py, capa], j) => { for (let i = 0; i <= NA; i++) { const a = i / NA * 6.283; let out = 1; ks.forEach(([k, ph, am]) => out += am * Math.sin(k * a + ph)); if (capa >= 0) out *= 1 + (hash2(i % NA + s0, capa * 7 + s0) - .5) * .13 + (hash2((i >> 1) % (NA >> 1) + s0, capa * 3 + 91) - .5) * .1;
      pos.push(Math.cos(a) * R * pf * out, py, Math.sin(a) * R * pf * out); uv.push(i / NA * ru + (capa >= 0 ? hash2(capa, s0) * .3 : 0), py < tal ? .02 + (py / tal) * .12 : .14 + (py - tal) / (o.vh || 64) + (seed % 7) * .11) } });
  for (let j = 0; j < prof.length - 1; j++) for (let i = 0; i < NA; i++) { const a = j * (NA + 1) + i, b = a + NA + 1; idx.push(a, b, a + 1, b, b + 1, a + 1) }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g }
// las mesetas: un anillo lejano de cerros rojos, mesetas medianas sueltas y la cresta (una fila de paredones a los dos lados del paso de Onetusk)
const MESAS = (() => { const r = rng(2720), L = [], lista = [];
  const pon = (x, z, R, H, o = {}) => { const y = Math.min(SUELO(x, z), SUELO(x + R * .7, z), SUELO(x - R * .7, z), SUELO(x, z + R * .7), SUELO(x, z - R * .7)) - .6; L.push([geoMesa(R, H, 100 + lista.length * 7 + (r() * 50 | 0), o), TM(x, y, z, 0, r() * 6.283, 0, o.ex || 1, 1, 1)]); lista.push([x, z, R * (o.falda ?? 1.75) * (o.ex || 1), H]) };
  for (let k = 0; k < 30; k++) { const a = k / 30 * 6.283 + (r() - .5) * .12, d = 265 + r() * 110, R = 26 + r() * 46, H = 34 + r() * 58; pon(Math.cos(a) * d, Math.sin(a) * d * .98 - 20, R, H, { ex: 1 + r() * .7 }) }
  for (let k = 0; k < 16; k++) { const a = k / 16 * 6.283 + r() * .3, d = 150 + r() * 80, x = Math.cos(a) * d, z = Math.sin(a) * d * 1.05; if (Math.abs(x) < 60 && z < 0) continue; pon(x, z, 9 + r() * 14, 12 + r() * 22, { ex: 1 + r() * .5, capas: 4 + (r() * 3 | 0) }) }
  // la cresta: paredones de 8 a 22 de alto sobre la loma, a los dos lados (queda libre el paso, |x| < 14)
  for (const s of [-1, 1]) { pon(s * 21.5, -168, 5.2, 13 + r() * 3, { falda: 1.3, talud: .16, capas: 4 }); pon(s * 31, -176, 8, 9 + r() * 5, { falda: 1.35, talud: .2, ex: 1.3 }); pon(s * 24, -150, 3.4, 5.5, { falda: 1.35, talud: .2, capas: 3 });
    for (let x = 44; x < 215; x += 15 + r() * 9) pon(s * x, -171 + (r() - .5) * 14, 9 + r() * 8, 8 + r() * 15, { falda: 1.4, talud: .22, ex: 1.2 + r() * .5 });
    for (let k = 0; k < 9; k++) { const x = s * (19 + r() * 60), z = -112 - r() * 34; pon(x, z, 2.2 + r() * 4, 2.5 + r() * 5, { falda: 1.4, talud: .2, capas: 3, na: 24 }) } }
  const m = new THREE.Mesh(mergeG(L), M_ROCA); m.castShadow = m.receiveShadow = true; scene.add(m); return lista })();

// ---------- cielo: nubes pintadas (cúmulos de base plana y cirros) sobre una cúpula; se dibujan después del cielo y antes de todo
const NUBES_D = (() => { const pinta = (seed, cirro) => tex(1024, 512, (g, w, h) => { const r = rng(seed); g.clearRect(0, 0, w, h);
    if (cirro) { for (let k = 0; k < 90; k++) { const x = r() * w, y = h * (.25 + r() * .5), L = 120 + r() * 380; const gr = g.createLinearGradient(x, 0, x + L, 0); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(.5, `rgba(255,255,255,${.1 + r() * .16})`); gr.addColorStop(1, "rgba(255,255,255,0)"); g.strokeStyle = gr; g.lineWidth = 3 + r() * 12; g.lineCap = "round"; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + L / 2, y - 18 - r() * 30, x + L, y + (r() - .5) * 20); g.stroke() } return }
    const bl = (x, y, s, col) => { const gr = g.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, col); gr.addColorStop(.55, col.replace(/[\d.]+\)$/, ".5)")); gr.addColorStop(1, col.replace(/[\d.]+\)$/, "0)")); g.fillStyle = gr; g.fillRect(x - s, y - s, s * 2, s * 2) };
    const N = 3 + (r() * 3 | 0); for (let n = 0; n < N; n++) { const cx = w * (.2 + r() * .6), base = h * (.62 + r() * .1), an = 130 + r() * 170;
      for (let k = 0; k < 60; k++) { const u = r() * 2 - 1, x = cx + u * an, top = (1 - u * u) * (90 + r() * 80), y = base - r() * top, s = 30 + r() * 60 * (1 - Math.abs(u) * .5); bl(x, y, s, "rgba(255,255,255,.55)") }
      for (let k = 0; k < 24; k++) { const u = r() * 2 - 1; bl(cx + u * an * .9, base + 6 + r() * 14, 26 + r() * 40, "rgba(150,160,185,.3)") }
      for (let k = 0; k < 26; k++) { const u = r() * 2 - 1, top = (1 - u * u) * 120; bl(cx + u * an * .8 - 14, base - top * (.5 + r() * .5), 18 + r() * 34, "rgba(255,255,255,.75)") } }
    g.globalCompositeOperation = "destination-in"; const m = g.createLinearGradient(0, 0, w, 0); m.addColorStop(0, "rgba(0,0,0,0)"); m.addColorStop(.12, "#000"); m.addColorStop(.88, "#000"); m.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = m; g.fillRect(0, 0, w, h); g.globalCompositeOperation = "source-over" });
  const ts = [pinta(2731), pinta(2732), pinta(2733), pinta(2734, true)], G = new THREE.Group(); scene.add(G); const r = rng(2735), ms = ts.map(t => new THREE.MeshBasicMaterial({ map: t, fog: false, depthTest: false, depthWrite: false, transparent: false, blending: THREE.CustomBlending, blendSrc: THREE.SrcAlphaFactor, blendDst: THREE.OneMinusSrcAlphaFactor, side: THREE.DoubleSide }));
  for (let k = 0; k < 22; k++) { const ci = k % 5 === 4, a = k / 22 * 6.283 + r() * .2, el = ci ? .5 + r() * .5 : .07 + r() * .34, d = 372, an = ci ? 330 : 120 + r() * 150, m = new THREE.Mesh(new THREE.PlaneGeometry(an, an * .5), ms[ci ? 3 : k % 3]); m.position.set(Math.cos(a) * Math.cos(el) * d, Math.sin(el) * d, Math.sin(a) * Math.cos(el) * d); m.lookAt(0, 0, 0); m.renderOrder = -.5; G.add(m) }
  return { G, ms } })();

// ---------- la luz de cada momento. OJO: el motor declara ENV después de este archivo, así que las escenas hacen una vez
// `Object.assign(ENV, ENV_DUSTMERE)` antes de usar setEnv("desierto" | "tormenta" | "incendio" | "despues").
const ENV_DUSTMERE = {
  desierto: { top: "#3c86d2", hor: "#ead9c0", fog: .0021, hemi: .95, hemiG: "#9a7a58", sun: 4.1, sunCol: "#ffd7a6", exp: 1.22, grade: ["#ffffff", 0], sol: [-.5, .4, .77], nube: ["#ffffff", 1] },
  tormenta: { top: "#b5662a", hor: "#cf8a46", fog: .07, hemi: 1.5, hemiG: "#8a5a30", sun: .9, sunCol: "#ffb060", exp: 1.0, grade: ["#d8862e", .1], sol: [-.5, .4, .77], nube: ["#e0a060", 0] },
  incendio: { top: "#0c1226", hor: "#3a2420", fog: .006, hemi: .55, hemiG: "#3a1c10", sun: .75, sunCol: "#8a9ac8", exp: 1.9, grade: ["#d0762e", .08], sol: [.45, .6, -.66], nube: ["#5a4050", .35] },
  despues: { top: "#5f8fc8", hor: "#f2c688", fog: .0048, hemi: 1.05, hemiG: "#a07a50", sun: 3.7, sunCol: "#ffc27a", exp: 1.05, grade: ["#ffd9a0", .05], sol: [-.72, .3, .62], nube: ["#ffe2b8", .95] } };
// el sol: las escenas pueden mover el centro de las sombras (SOL.x, SOL.z, SOL.r) y la dirección (SOL.dir = [x, y, z] hacia el sol); lo aplica ambiente(t)
const SOL = { x: 0, z: 0, r: 62, dir: null };

// ---------- el parche fino de cada pisada (barro agrietado con relieve, orilla levantada), el agua, los juncos y las piedras
const T_BARRO = (() => { const [c, z] = pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(2740); c.fillStyle = "#e9dfd0"; c.fillRect(0, 0, w, h); z.fillStyle = "#9a9a9a"; z.fillRect(0, 0, w, h);
    for (let k = 0; k < 500; k++) { const x = r() * w, y = r() * h, s = 14 + r() * 60; envuelto(c, w, h, () => { c.fillStyle = r() < .5 ? "rgba(120,96,70,.12)" : "rgba(255,250,240,.14)"; c.beginPath(); c.ellipse(x, y, s, s * .7, r() * 3, 0, 7); c.fill() }) }
    // grietas de barro seco: celdas (puntos al azar y bordes entre los dos más cercanos)
    const P = Array.from({ length: 170 }, () => [r() * w, r() * h]);
    for (let y = 0; y < h; y += 4) for (let x = 0; x < w; x += 4) { let d1 = 1e9, d2 = 1e9; for (const [px, py] of P) { let dx = Math.abs(x - px), dy = Math.abs(y - py); if (dx > w / 2) dx = w - dx; if (dy > h / 2) dy = h - dy; const d = dx * dx + dy * dy; if (d < d1) { d2 = d1; d1 = d } else if (d < d2) d2 = d }
      const e = Math.sqrt(d2) - Math.sqrt(d1); if (e < 7) { const a = 1 - e / 7; c.fillStyle = `rgba(52,36,24,${a * .85})`; c.fillRect(x, y, 4, 4); z.fillStyle = `rgba(0,0,0,${a})`; z.fillRect(x, y, 4, 4) } else if (e < 16) { z.fillStyle = `rgba(230,230,230,${(1 - (e - 7) / 9) * .5})`; z.fillRect(x, y, 4, 4) } }
    for (let k = 0; k < 9000; k++) { c.fillStyle = r() < .5 ? "rgba(90,70,50,.2)" : "rgba(255,250,240,.2)"; c.fillRect(r() * w, r() * h, 2, 2) } });
  [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
const M_BARRO = new THREE.MeshStandardMaterial({ map: T_BARRO.c, bumpMap: T_BARRO.z, bumpScale: 5, roughness: .9, vertexColors: true, transparent: true, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -6 });
// el cielo pintado que reflejan los estanques (equirectangular: azul arriba, bruma clara al horizonte, nubes)
const T_REFLEJO = (() => { const t = tex(1024, 512, (g, w, h) => { const r = rng(2745), gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#3f86d0"); gr.addColorStop(.38, "#8fc0ea"); gr.addColorStop(.5, "#f4e6cc"); gr.addColorStop(.52, "#b89468"); gr.addColorStop(1, "#8a6a48"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 150; k++) { const x = r() * w, y = h * (.08 + r() * .36), s = 14 + r() * 50; const q = g.createRadialGradient(x, y, 0, x, y, s); q.addColorStop(0, "rgba(255,255,255,.8)"); q.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = q; g.fillRect(x - s, y - s, s * 2, s * 2) } }); t.mapping = THREE.EquirectangularReflectionMapping; return t })();
const T_ONDAS = tex(512, 512, (g, w, h) => { const r = rng(2746); g.fillStyle = "#808080"; g.fillRect(0, 0, w, h); for (let k = 0; k < 260; k++) { const x = r() * w, y = r() * h, s = 10 + r() * 34, cl2 = r() < .5 ? "rgba(255,255,255,.3)" : "rgba(0,0,0,.3)"; envuelto(g, w, h, () => { const q = g.createRadialGradient(x, y, 0, x, y, s); q.addColorStop(0, cl2); q.addColorStop(1, "rgba(128,128,128,0)"); g.fillStyle = q; g.beginPath(); g.ellipse(x, y, s * 1.8, s * .6, 0, 0, 7); g.fill() }) } }, [3, 3]);
const M_ESTANQUE = new THREE.MeshStandardMaterial({ color: "#86aabf", metalness: 1, roughness: .07, envMap: T_REFLEJO, envMapIntensity: .8, bumpMap: T_ONDAS, bumpScale: .6, transparent: true, opacity: .93 });
const GEO_JUNCO = (() => { const r = rng(2750), hoja = new THREE.ConeGeometry(.035, 1, 4, 3), L = [], C = []; { const p = hoja.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i) + .5; p.setX(i, p.getX(i) + y * y * .22) } hoja.computeVertexNormals() }
  for (let k = 0; k < 13; k++) { const a = r() * 6.283, d = r() * .32, H = 1.3 + r() * 1.3; L.push([hoja, TM(Math.cos(a) * d, H / 2, Math.sin(a) * d, (r() - .5) * .12, r() * 6.283, (r() - .5) * .12, 1.3, H, 1.3)]) }
  for (let k = 0; k < 3; k++) { const a = r() * 6.283, d = r() * .22, H = 1.9 + r() * .7; L.push([new THREE.CylinderGeometry(.018, .022, H, 5), TM(Math.cos(a) * d, H / 2, Math.sin(a) * d)]); C.push([new THREE.CapsuleGeometry(.06, .3, 3, 7), TM(Math.cos(a) * d, H - .1, Math.sin(a) * d)]); C.push([new THREE.CylinderGeometry(.008, .012, .22, 4), TM(Math.cos(a) * d, H + .2, Math.sin(a) * d)]) }
  return [mergeG(L), mergeG(C)] })();
const GEO_PIEDRAS = [geoPiedra(31, 1, .62), geoPiedra(32, 1, .8), geoPiedra(33, 2, .5)];
const M_PIEDRA = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .95, bumpMap: T_ARENA_D.z, bumpScale: 2 });
const ESTANQUES_G = new THREE.Group(); scene.add(ESTANQUES_G);   // agua + juncos (se esconden con estanquesVisibles(false): quedan las pisadas secas)
{ const NR = 46, NA = 132, r = rng(2755), cc = new THREE.Color(), nj = 16, np = 26;
  const jun = new THREE.InstancedMesh(GEO_JUNCO[0], new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .8, side: THREE.DoubleSide }), EST.length * nj), cab = new THREE.InstancedMesh(GEO_JUNCO[1], SM("#5a3a22", { roughness: .9 }), EST.length * nj);
  const pie = GEO_PIEDRAS.map(g => new THREE.InstancedMesh(g, M_PIEDRA, EST.length * np)); [jun, cab, ...pie].forEach(m => { m.castShadow = m.receiveShadow = true }); ESTANQUES_G.add(jun, cab); pie.forEach(m => scene.add(m)); let ij = 0; const ip = [0, 0, 0];
  EST.forEach(e => { // parche
    const pos = [], col = [], uv = [], idx = []; for (let j = 0; j <= NR; j++) { const rr = 11.8 * Math.pow(j / NR, .85); for (let i = 0; i <= NA; i++) { const a = i / NA * 6.283, x = e.x + Math.cos(a) * rr, z = e.z + Math.sin(a) * rr, sd = pisadaSD(x - e.x, z - e.z), hb = sueloBase(x, z), W = .8 + .42 * Math.max(0, hb - e.yF);
        pos.push(x, SUELO(x, z) + .015, z); uv.push(x / 3.4, z / 3.4); const c = colorSuelo(x, z), n = fbm2(x * .9, z * .9, 2), moj = 1 - sst(-.5, .5, sd), k = moj * .35; col.push(c[0] * (1 - k) * (.9 + n * .2), c[1] * (1 - k) * (.9 + n * .2), c[2] * (1 - k * .8) * (.9 + n * .2), j === NR ? 0 : 1 - sst(W + 1.5, W + 2.3, sd)) } }
    for (let j = 0; j < NR; j++) for (let i = 0; i < NA; i++) { const a = j * (NA + 1) + i, b = a + NA + 1; idx.push(a, a + 1, b, b, a + 1, b + 1) }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 4)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, M_BARRO); m.receiveShadow = true; m.castShadow = true; m.renderOrder = 1; scene.add(m); e.parche = m;
    // agua: la silueta de la pisada, un poco más grande (el barro la tapa en la orilla)
    const sh = new THREE.Shape(); for (let i = 0; i <= 96; i++) { const a = i / 96 * 6.283; let rr = 2; while (rr < 8 && pisadaSD(Math.cos(a) * rr, Math.sin(a) * rr) < .75) rr += .05; i ? sh.lineTo(Math.cos(a) * rr, -Math.sin(a) * rr) : sh.moveTo(Math.cos(a) * rr, -Math.sin(a) * rr) }
    const ga = new THREE.ShapeGeometry(sh, 4); ga.rotateX(-Math.PI / 2); { const p = ga.attributes.position, u = ga.attributes.uv; for (let i = 0; i < p.count; i++) u.setXY(i, p.getX(i) / 6, p.getZ(i) / 6) }
    const ag = new THREE.Mesh(ga, M_ESTANQUE); ag.position.set(e.x, e.yW, e.z); ag.renderOrder = 2; ag.receiveShadow = true; ESTANQUES_G.add(ag); e.agua = ag;
    // juncos en la orilla (del lado del talón y a los costados) y piedras en el borde
    for (let k = 0; k < nj; k++) { let a, x, z, t = 0; do { a = -Math.PI / 2 + (r() - .5) * 4.4; const rr = 3.2 + r() * 1.3; x = e.x + Math.cos(a) * rr; z = e.z + Math.sin(a) * rr } while (Math.abs(pisadaSD(x - e.x, z - e.z) + .1) > .35 && ++t < 40);
      const s = .75 + r() * .7; dummy.position.set(x, Math.min(SUELO(x, z), e.yW) - .08, z); dummy.rotation.set(0, r() * 6.283, 0); dummy.scale.set(s, s * (.8 + r() * .5), s); dummy.updateMatrix(); jun.setMatrixAt(ij, dummy.matrix); cab.setMatrixAt(ij, dummy.matrix); jun.setColorAt(ij, cc.set(["#6f8a3c", "#8a9a48", "#5a7a34", "#a8a45a", "#7a8440"][r() * 5 | 0])); ij++ }
    for (let k = 0; k < np; k++) { const a = r() * 6.283, rr = 3.6 + r() * 2.6, x = e.x + Math.cos(a) * rr, z = e.z + Math.sin(a) * rr, sd = pisadaSD(x - e.x, z - e.z); if (sd < -.2 || sd > 2.6) continue; const v = r() * 3 | 0, s = .16 + r() * r() * .6;
      dummy.position.set(x, SUELO(x, z) + s * .12, z); dummy.rotation.set(r() * .5, r() * 6.283, r() * .5); dummy.scale.set(s * (1 + r() * .6), s, s); dummy.updateMatrix(); pie[v].setMatrixAt(ip[v], dummy.matrix); pie[v].setColorAt(ip[v], cc.set(["#8a7a68", "#a08a70", "#6e5e50", "#b09880", "#7c6a5a"][r() * 5 | 0])); ip[v]++ } });
  jun.count = cab.count = ij; pie.forEach((m, v) => { m.count = ip[v] }) }
// gotas que saltan de cada estanque (salpicar)
const GOTAS = (() => { const N = 64, m = new THREE.InstancedMesh(new THREE.SphereGeometry(.09, 8, 6), new THREE.MeshStandardMaterial({ color: "#dff0fa", roughness: .1, metalness: .3, emissive: "#6a8a9a", emissiveIntensity: .35 }), EST.length * N); m.frustumCulled = false; m.castShadow = true; scene.add(m); const r = rng(2760), d = []; for (let k = 0; k < EST.length * N; k++) { const a = r() * 6.283; d.push([Math.cos(a), Math.sin(a), r() * 3.6, 2.2 + r() * 5.5, 5 + r() * 9, .5 + r() * 1.3, r() * .25]); dummy.position.set(0, -50, 0); dummy.scale.setScalar(0); dummy.updateMatrix(); m.setMatrixAt(k, dummy.matrix) } return { m, d, N, q: EST.map(() => 0) } })();
function salpicar(i, q) { const e = EST[i]; if (!e || (GOTAS.q[i] === q)) return; GOTAS.q[i] = q; const T = 1.5 * q; for (let k = 0; k < GOTAS.N; k++) { const n = i * GOTAS.N + k, [ca, sa, r0, vr, vy, s, t0] = GOTAS.d[n], tt = (T - t0) * 1.25, y = vy * tt - 9.8 * tt * tt / 2, on = q > 0 && q < 1 && tt > 0 && y > -.3;
    if (on) { const rr = r0 + vr * tt; dummy.position.set(e.x + ca * rr, e.yW + y, e.z + sa * rr * .9); dummy.rotation.set(0, 0, 0); dummy.scale.set(s, s * (1 + Math.abs(vy - 9.8 * tt) * .12), s) } else { dummy.position.set(0, -50, 0); dummy.scale.setScalar(0) } dummy.updateMatrix(); GOTAS.m.setMatrixAt(n, dummy.matrix) }
  GOTAS.m.instanceMatrix.needsUpdate = true; e.agua.position.y = e.yW - .3 * Math.sin(cl(q) * Math.PI) + (q > 0 && q < 1 ? Math.sin(q * 40) * .04 * (1 - q) : 0) }
function estanquesVisibles(b) { ESTANQUES_G.visible = b; GOTAS.m.visible = b }

// ---------- la plaza empedrada (losas en anillos con un sol de piedra roja en el medio) y la calle principal de tierra pisada con lajas
const T_PLAZA = (() => { const [c, z] = pintarDoble(2048, 2048, (c, z, w, h) => { const r = rng(2770), C = w / 2, px = w / 27; z.fillStyle = "#606060"; z.fillRect(0, 0, w, h);
    c.fillStyle = "#6e5a44"; c.beginPath(); for (let i = 0; i <= 200; i++) { const a = i / 200 * 6.283, rr = (12.2 + Math.sin(a * 7) * .25 + Math.sin(a * 13 + 1) * .2) * px; i ? c.lineTo(C + Math.cos(a) * rr, C + Math.sin(a) * rr) : c.moveTo(C + Math.cos(a) * rr, C + Math.sin(a) * rr) } c.fill();
    const losa = (r0, r1, a0, a1, col) => { const m = .035 * px, ma0 = a0 + m / r1, ma1 = a1 - m / r1; if (ma1 <= ma0) return; const j = () => (r() - .5) * .05 * px, pts = [[r0 + m, ma0], [r1 - m, ma0], [r1 - m, (ma0 + ma1) / 2], [r1 - m, ma1], [r0 + m, ma1], [r0 + m, (ma0 + ma1) / 2]].map(([rr, a]) => [C + Math.cos(a) * rr + j(), C + Math.sin(a) * rr + j()]);
      for (const [g, f] of [[c, col], [z, `rgb(${200 + r() * 50 | 0},${200 + r() * 50 | 0},${200 + r() * 50 | 0})`]]) { g.fillStyle = f; g.beginPath(); g.moveTo((pts[0][0] + pts[5][0]) / 2, (pts[0][1] + pts[5][1]) / 2); for (let k = 0; k < 6; k++) { const p = pts[k], n = pts[(k + 1) % 6]; g.quadraticCurveTo(p[0], p[1], (p[0] + n[0]) / 2, (p[1] + n[1]) / 2) } g.fill() }
      const mx = C + Math.cos((a0 + a1) / 2) * (r0 + r1) / 2, my = C + Math.sin((a0 + a1) / 2) * (r0 + r1) / 2, s = (r1 - r0) * .6; c.save(); c.globalCompositeOperation = "source-atop"; const gr = c.createRadialGradient(mx - s * .3, my - s * .3, 0, mx, my, s * 1.4); gr.addColorStop(0, "rgba(255,245,225,.16)"); gr.addColorStop(1, "rgba(40,28,18,.16)"); c.fillStyle = gr; c.fillRect(mx - s * 2, my - s * 2, s * 4, s * 4); c.restore();
      if (r() < .18) { c.strokeStyle = "rgba(40,28,20,.6)"; c.lineWidth = 2; z.strokeStyle = "rgba(0,0,0,.8)"; z.lineWidth = 3; let x = mx + (r() - .5) * s, y = my + (r() - .5) * s; c.beginPath(); z.beginPath(); c.moveTo(x, y); z.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (r() - .5) * s * .7; y += (r() - .5) * s * .7; c.lineTo(x, y); z.lineTo(x, y) } c.stroke(); z.stroke() } };
    const grises = ["#a89880", "#9a8a74", "#b4a48c", "#8c7c68", "#a39078", "#bcae98", "#96846e", "#ad9d86"], rojos = ["#a4583c", "#8f4a32", "#b0684a"];
    losa(0, .55 * px, 0, 6.283, rojos[0]); for (let k = 0; k < 8; k++) losa(.55 * px, 1.25 * px, k / 8 * 6.283, (k + 1) / 8 * 6.283, k % 2 ? rojos[1] : grises[3]); for (let k = 0; k < 16; k++) losa(1.25 * px, 2.05 * px, k / 16 * 6.283, (k + 1) / 16 * 6.283, k % 2 ? grises[5] : rojos[2]);
    let rr = 2.05; while (rr < 12.1) { const an = .5 + r() * .5, r1 = Math.min(12.3, rr + an), roja = Math.abs(rr - 6.2) < .35 || Math.abs(rr - 9.4) < .3; let a = r() * 6.283; const fin = a + 6.283; while (a < fin - .02) { const da = Math.min(fin - a, (.55 + r() * .9) / rr); if (r() > .035 || roja) losa(rr * px, r1 * px, a, a + da, roja ? rojos[r() * 3 | 0] : rgbj(grises[r() * 8 | 0], r, 18)); a += da } rr = r1 }
    c.globalCompositeOperation = "source-atop"; for (let k = 0; k < 260; k++) { const a = r() * 6.283, d = Math.sqrt(r()) * 12.2 * px, s = 20 + r() * 90, X0 = C + Math.cos(a) * d, Y0 = C + Math.sin(a) * d; const gr = c.createRadialGradient(X0, Y0, 0, X0, Y0, s); const cl2 = r() < .6 ? "210,180,138" : "70,52,38"; gr.addColorStop(0, `rgba(${cl2},.28)`); gr.addColorStop(1, `rgba(${cl2},0)`); c.fillStyle = gr; c.fillRect(X0 - s, Y0 - s, s * 2, s * 2) }
    for (let k = 0; k < 12000; k++) { const a = r() * 6.283, d = Math.sqrt(r()) * 12.2 * px; c.fillStyle = r() < .5 ? "rgba(60,44,30,.25)" : "rgba(240,225,200,.25)"; c.fillRect(C + Math.cos(a) * d, C + Math.sin(a) * d, 2, 2) }
    c.globalCompositeOperation = "destination-out"; for (let k = 0; k < 500; k++) { const a = r() * 6.283, d = (11.2 + r() * 1.6) * px, s = 14 + r() * 60, X0 = C + Math.cos(a) * d, Y0 = C + Math.sin(a) * d; const gr = c.createRadialGradient(X0, Y0, 0, X0, Y0, s); gr.addColorStop(0, "rgba(0,0,0,.9)"); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(X0 - s, Y0 - s, s * 2, s * 2) } c.globalCompositeOperation = "source-over" }); return { c, z } })();
const M_SUELO_DECAL = (t, bs) => new THREE.MeshStandardMaterial({ map: t.c, bumpMap: t.z, bumpScale: bs, roughness: .88, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -6 });
const geoSobreSuelo = (x0, x1, z0, z1, nx, nz, dy = .02) => { const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, nz); g.rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, 0, (z0 + z1) / 2); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, SUELO(p.getX(i), p.getZ(i)) + dy); g.computeVertexNormals(); return g };
const PLAZA_M = (() => { const m = new THREE.Mesh(geoSobreSuelo(-13.5, 13.5, -13.5, 13.5, 40, 40), M_SUELO_DECAL(T_PLAZA, 5)); m.receiveShadow = true; m.renderOrder = -.3; scene.add(m); return m })();
const T_CALLE = (() => { const [c, z] = pintarDoble(512, 2048, (c, z, w, h) => { const r = rng(2780); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
    for (let k = 0; k < 2600; k++) { const y = r() * h, x = w / 2 + (r() + r() + r() - 1.5) * w * .42, s = 16 + r() * 50, e = Math.min(1, y / 160, (h - y) / 160); c.fillStyle = `rgba(${150 + r() * 26 | 0},${122 + r() * 22 | 0},${92 + r() * 18 | 0},${.22 * e})`; c.beginPath(); c.ellipse(x, y, s, s * 1.3, 0, 0, 7); c.fill() }
    for (const dx of [-70, 70]) for (const [g, col, lw] of [[c, "rgba(90,68,48,.5)", 16], [z, "rgba(30,30,30,.7)", 18], [z, "rgba(215,215,215,.5)", 5]]) { g.strokeStyle = col; g.lineWidth = lw; g.lineCap = "round"; g.beginPath(); for (let y = 60; y < h - 60; y += 20) { const x = w / 2 + dx + Math.sin(y * .006) * 22 + Math.sin(y * .021) * 6 + (lw === 5 ? 11 : 0); y > 60 ? g.lineTo(x, y) : g.moveTo(x, y) } g.stroke() }
    for (let k = 0; k < 120; k++) { const x = w * (.12 + r() * .76), y = 80 + r() * (h - 160), s = 14 + r() * 26, a = r() * 3, n = 5 + (r() * 4 | 0), pts = Array.from({ length: n }, (_, i) => { const q = (i + (r() - .5) * .7) / n * 6.283 + a, d = s * (.6 + r() * .7); return [x + Math.cos(q) * d, y + Math.sin(q) * d * .8] });
      for (const [g, f, o] of [[c, "rgba(50,36,24,.5)", 3], [c, rgbj(["#a89880", "#9a8a74", "#b4a48c", "#8c7c68"][r() * 4 | 0], r, 20), 0], [z, "rgba(20,20,20,.8)", 3], [z, "rgba(240,240,240,.9)", 0]]) { g.fillStyle = f; g.beginPath(); pts.forEach(([px, py], i) => i ? g.lineTo(px + o, py + o) : g.moveTo(px + o, py + o)); g.fill() } }
    for (let k = 0; k < 420; k++) { const x = w * (.15 + r() * .7), y = 60 + r() * (h - 120), a = (r() - .5) * .5; for (const g of [c, z]) { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = g === c ? "rgba(84,62,44,.35)" : "rgba(40,40,40,.5)"; g.beginPath(); g.ellipse(0, 0, 5, 9, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(0, 13, 4, 4, 0, 0, 7); g.fill(); g.restore() } }
    for (let k = 0; k < 700; k++) { const x = r() * w, y = r() * h, a = r() * 6.3; c.strokeStyle = "rgba(226,200,130,.5)"; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 12, y + Math.sin(a) * 12); c.stroke() }
    c.globalCompositeOperation = "destination-in"; const m = c.createLinearGradient(0, 0, w, 0); m.addColorStop(0, "rgba(0,0,0,0)"); m.addColorStop(.2, "#000"); m.addColorStop(.8, "#000"); m.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = m; c.fillRect(0, 0, w, h); c.globalCompositeOperation = "source-over" }); return { c, z } })();
const CALLE_M = (() => { const m = new THREE.Mesh(geoSobreSuelo(-4.4, 4.4, 6, 54, 8, 40, .025), M_SUELO_DECAL(T_CALLE, 4)); m.receiveShadow = true; m.renderOrder = -.2; scene.add(m); return m })();

// ---------- adobe: revoque de barro pintado entero (manchas, pasadas de llana, paja, chorreaduras, base mojada, revoque caído con ladrillos de adobe, grietas)
const T_ADOBE = (seed, base, o = {}) => pintarDoble(o.w || 1024, o.h || 1024, (c, z, w, h) => { const r = rng(seed), A = w * h / 1048576; c.fillStyle = base; c.fillRect(0, 0, w, h); z.fillStyle = "#8c8c8c"; z.fillRect(0, 0, w, h);
  for (let k = 0; k < 170 * A; k++) { const x = r() * w, y = r() * h, s = 40 + r() * 170, cl2 = r() < .5 ? "70,44,24" : "255,240,214", gr = c.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, `rgba(${cl2},${.07 + r() * .1})`); gr.addColorStop(1, `rgba(${cl2},0)`); c.fillStyle = gr; c.fillRect(x - s, y - s, s * 2, s * 2);
    const gz = z.createRadialGradient(x, y, 0, x, y, s); gz.addColorStop(0, r() < .5 ? "rgba(60,60,60,.3)" : "rgba(200,200,200,.3)"); gz.addColorStop(1, "rgba(128,128,128,0)"); z.fillStyle = gz; z.fillRect(x - s, y - s, s * 2, s * 2) }
  for (let k = 0; k < 520 * A; k++) { const x = r() * w, y = r() * h, L = 30 + r() * 120, a = (r() - .5) * .9, cv = (r() - .5) * 40; for (const [g, col] of [[c, r() < .5 ? `rgba(80,52,30,${.05 + r() * .09})` : `rgba(255,244,222,${.05 + r() * .1})`], [z, r() < .5 ? "rgba(50,50,50,.22)" : "rgba(215,215,215,.22)"]]) { g.strokeStyle = col; g.lineWidth = 5 + r() * 14; g.lineCap = "round"; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * L / 2, y + Math.sin(a) * L / 2 + cv, x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke() } }
  for (let k = 0; k < 3200 * A; k++) { const x = r() * w, y = r() * h, a = r() * 6.3, L = 4 + r() * 9; c.strokeStyle = r() < .7 ? `rgba(236,214,150,${.25 + r() * .3})` : "rgba(70,46,26,.3)"; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); c.stroke(); z.strokeStyle = "rgba(225,225,225,.35)"; z.lineWidth = 1.5; z.beginPath(); z.moveTo(x, y); z.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); z.stroke() }
  // sol arriba, chorreaduras de lluvia desde el pretil y la base oscura y gastada
  { const gr = c.createLinearGradient(0, 0, 0, h * .16); gr.addColorStop(0, "rgba(255,246,226,.3)"); gr.addColorStop(1, "rgba(255,246,226,0)"); c.fillStyle = gr; c.fillRect(0, 0, w, h * .16) }
  for (let k = 0; k < 46 * w / 1024; k++) { const x = r() * w, L = 90 + r() * 420, an = 5 + r() * 22, gr = c.createLinearGradient(0, 20, 0, 20 + L); gr.addColorStop(0, `rgba(64,40,24,${.2 + r() * .22})`); gr.addColorStop(1, "rgba(64,40,24,0)"); c.fillStyle = gr; c.beginPath(); c.moveTo(x - an, 16); c.lineTo(x + an, 16); c.lineTo(x + an * .3 + (r() - .5) * 10, 20 + L); c.lineTo(x - an * .3, 20 + L); c.fill() }
  { const gr = c.createLinearGradient(0, h * .8, 0, h); gr.addColorStop(0, "rgba(58,38,24,0)"); gr.addColorStop(1, "rgba(58,38,24,.5)"); c.fillStyle = gr; c.fillRect(0, h * .8, w, h * .2) }
  // revoque caído: se ven los ladrillos de adobe (más hundidos)
  const parche = (cx, cy, s) => { const pts = Array.from({ length: 11 }, (_, i) => { const a = i / 11 * 6.283, d = s * (.55 + r() * .6); return [cx + Math.cos(a) * d * 1.3, cy + Math.sin(a) * d] }); for (const g of [c, z]) { g.save(); g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.clip();
      g.fillStyle = g === c ? "#6a4a30" : "#303030"; g.fillRect(cx - s * 2, cy - s * 2, s * 4, s * 4); for (let y = cy - s * 2, f = 0; y < cy + s * 2; y += 30, f++) for (let x = cx - s * 2 - (f % 2) * 34; x < cx + s * 2; x += 68) { g.fillStyle = g === c ? rgbj(["#a8794e", "#96683f", "#b48558", "#8a5e3a"][r() * 4 | 0], r, 20) : `rgb(${90 + r() * 40 | 0},${90 + r() * 40 | 0},${90 + r() * 40 | 0})`; g.fillRect(x + 3, y + 3, 62, 24) } g.restore();
      g.strokeStyle = g === c ? "rgba(60,38,22,.7)" : "rgba(240,240,240,.8)"; g.lineWidth = g === c ? 3 : 5; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.stroke() } };
  const np = o.parches ?? 6; for (let k = 0; k < np; k++) parche(r() * w, k < np * .6 ? h * (.86 + r() * .12) : h * (.1 + r() * .7), 40 + r() * 80);
  for (let k = 0; k < 12 * A; k++) { let x = r() * w, y = r() < .5 ? 0 : r() * h; const n = 10 + r() * 22 | 0; c.strokeStyle = `rgba(46,28,16,${.5 + r() * .4})`; c.lineWidth = 1.5 + r() * 2.5; z.strokeStyle = "rgba(0,0,0,.9)"; z.lineWidth = 4 + r() * 4; c.beginPath(); z.beginPath(); c.moveTo(x, y); z.moveTo(x, y); for (let q = 0; q < n; q++) { x += (r() - .5) * 30; y += 8 + r() * 26; c.lineTo(x, y); z.lineTo(x, y) } c.stroke(); z.stroke() }
  if (o.hollin) { const gr = c.createRadialGradient(w / 2, h * .5, 0, w / 2, h * .5, w * .5); gr.addColorStop(0, "rgba(20,14,10,.75)"); gr.addColorStop(1, "rgba(20,14,10,0)"); c.fillStyle = gr; c.fillRect(0, 0, w, h) } if (o.extra) o.extra(c, z, w, h, r) });
const ADOBE_C = ["#c9a27a", "#b98c64", "#d8ba94", "#c08e68", "#e4d6bc", "#aa7e58", "#d2a884", "#c4b090"];
const M_ADOBE = ADOBE_C.map((c, i) => { const [t, z] = T_ADOBE(2800 + i, c, { parches: 4 + i % 4 }); return new THREE.MeshStandardMaterial({ map: t, bumpMap: z, bumpScale: 4.5, roughness: .96 }) });
// madera clara neutra (se tiñe con el color de cada puerta): tablas verticales con veta, clavos y pintura saltada
const T_TABLA_N = (() => { const [c, z] = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(2830); let x = 0; z.fillStyle = "#909090"; z.fillRect(0, 0, w, h); while (x < w) { const pw = 70 + r() * 50; c.fillStyle = rgbj("#e6e0d6", r, 22); c.fillRect(x, 0, pw, h); for (let k = 0; k < 40; k++) { const xx = x + r() * pw; c.strokeStyle = r() < .5 ? "rgba(90,74,60,.25)" : "rgba(255,255,255,.3)"; c.lineWidth = 1 + r() * 2; c.beginPath(); c.moveTo(xx, 0); for (let y = 0; y <= h; y += 40) c.lineTo(xx + (r() - .5) * 6, y); c.stroke(); z.strokeStyle = "rgba(60,60,60,.3)"; z.lineWidth = 2; z.beginPath(); z.moveTo(xx, 0); z.lineTo(xx, h); z.stroke() }
      for (let k = 0; k < 7; k++) { const px = x + r() * pw, py = r() * h, s = 6 + r() * 26; c.fillStyle = "rgba(150,120,90,.75)"; c.beginPath(); c.ellipse(px, py, s * .6, s, r(), 0, 7); c.fill(); z.fillStyle = "rgba(40,40,40,.6)"; z.beginPath(); z.ellipse(px, py, s * .6, s, 0, 0, 7); z.fill() }
      c.fillStyle = "rgba(40,28,20,.8)"; c.fillRect(x + pw - 4, 0, 4, h); z.fillStyle = "#000"; z.fillRect(x + pw - 5, 0, 6, h); x += pw } }); return { c, z } })();
const PUERTA_C = ["#2f9a94", "#c0452c", "#dba322", "#3d62a8", "#5d8f3c", "#8d4d82", "#d6744c", "#e9e2d0", "#27706e"];
const M_PUERTA = PUERTA_C.map(c => new THREE.MeshStandardMaterial({ map: T_TABLA_N.c, bumpMap: T_TABLA_N.z, bumpScale: 3, roughness: .78, color: c }));
const M_MADERA = new THREE.MeshStandardMaterial({ map: T_TABLA_N.c, bumpMap: T_TABLA_N.z, bumpScale: 3.5, roughness: .9, color: "#8a6444" });
const M_MADERA_V = new THREE.MeshStandardMaterial({ map: T_TABLA_N.c, bumpMap: T_TABLA_N.z, bumpScale: 3.5, roughness: .95, color: "#b09a80" });   // madera vieja, gris
const M_OSCURO = new THREE.MeshBasicMaterial({ color: "#150e0a" });
const M_HIERRO = new THREE.MeshStandardMaterial({ color: "#3a3430", roughness: .55, metalness: .7 });
const T_TECHO_B = (() => { const [c, z] = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(2840); c.fillStyle = "#b39472"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h); for (let k = 0; k < 500; k++) { const x = r() * w, y = r() * h, s = 8 + r() * 46; c.fillStyle = r() < .5 ? "rgba(90,66,44,.14)" : "rgba(240,220,190,.14)"; c.beginPath(); c.ellipse(x, y, s, s * .7, r() * 3, 0, 7); c.fill(); z.fillStyle = r() < .5 ? "rgba(60,60,60,.25)" : "rgba(200,200,200,.25)"; z.beginPath(); z.ellipse(x, y, s, s * .7, 0, 0, 7); z.fill() }
    for (let k = 0; k < 30; k++) { let x = r() * w, y = r() * h; c.strokeStyle = "rgba(60,40,26,.6)"; c.lineWidth = 2; z.strokeStyle = "#000"; z.lineWidth = 4; c.beginPath(); z.beginPath(); c.moveTo(x, y); z.moveTo(x, y); for (let q = 0; q < 8; q++) { x += (r() - .5) * 60; y += (r() - .5) * 60; c.lineTo(x, y); z.lineTo(x, y) } c.stroke(); z.stroke() } }); return { c, z } })();
const M_TECHO_B = new THREE.MeshStandardMaterial({ map: T_TECHO_B.c, bumpMap: T_TECHO_B.z, bumpScale: 4, roughness: 1 });
const M_LAJA = new THREE.MeshStandardMaterial({ color: "#9c8c78", roughness: .9, bumpMap: T_ARENA_D.z, bumpScale: 3 });
const geoUV = (g, fu, fv) => { const p = g.attributes.position, u = g.attributes.uv; for (let i = 0; i < p.count; i++) u.setXY(i, fu(p.getX(i), p.getY(i), p.getZ(i)), fv(p.getX(i), p.getY(i), p.getZ(i))); return g };

// ---------- zonas: lo que queda libre para personajes y cámara, y el registro de lo ocupado (para que nada se superponga)
const zonaLibre = (x, z, r = 0) => Math.hypot(x, z) < 9.6 + r || (Math.abs(x) < 3.3 + r && z > 7 - r && z < 47 + r) || (Math.abs(x) < 12.3 + r && z < -17 + r && z > -153) || Math.hypot(x, z + 160) < 4.3 + r || Math.hypot(x - TORRE[0], z - TORRE[1]) < 7.6 + r;
const OCUP = [], RECTS = [];
const enRect = (R, x, z, m = 0) => { const c = Math.cos(R.ry), s = Math.sin(R.ry), dx = x - R.x, dz = z - R.z, lx = dx * c - dz * s, lz = dx * s + dz * c; return Math.abs(lx) < R.w / 2 + m && Math.abs(lz) < R.d / 2 + m };
const libreEn = (x, z, r = .5, o = {}) => { if (!o.zona && zonaLibre(x, z, r)) return false; for (const R of RECTS) if (R !== o.salvo && enRect(R, x, z, r + (o.mc ?? .15))) return false; for (const q of OCUP) if (Math.hypot(x - q.x, z - q.z) < r + q.r) return false; return true };
const ocupa = (x, z, r) => { OCUP.push({ x, z, r }); return true };
// los lugares de las frases (se reservan antes de repartir las casas)
const PUNTOS = { boda: [-13, 12], bebe: [-20, 28], escuela: [29, -15], gallos: [-28, -14], corral: [20, 21], pozo: [-13, -4], mercado: [15, 3] };
const PUNTOS_R = { boda: 5.6, bebe: 3.6, escuela: 7.5, gallos: 4.8, corral: 5.2, pozo: 2.6, mercado: 5.6 };

// ---------- la casa de adobe: muros gruesos con hueco real en puertas y ventanas, esquinas redondas, pretil, vigas que asoman
const CASA_T = .44, CASA_R = .55;
function muroAdobe(L, W, H, ab, M, uvo) { const T = CASA_T, xs = ab.slice().sort((a, b) => a.x0 - b.x0); let x = -W / 2;
  const caja = (x0, x1, y0, y1) => { if (x1 - x0 < .02 || y1 - y0 < .02) return; const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, T); g.translate((x0 + x1) / 2, (y0 + y1) / 2, -T / 2); geoUV(g, px => uvo.inv ? 1 - (.03 + (px + W / 2) / W * .94) : .03 + (px + W / 2) / W * .94, (px, py) => (uvo.y0 + py) / uvo.H); L.add("pared", g, M) };
  xs.forEach(a => { caja(x, a.x0, 0, H); caja(a.x0, a.x1, a.y1, H); caja(a.x0, a.x1, 0, a.y0); x = a.x1 }); caja(x, W / 2, 0, H) }
// un cuerpo (planta baja o piso de arriba). B = matriz base. aberturas: lista por muro [frente, derecha, fondo, izquierda]
function cuerpoAdobe(L, B, w, d, h, o, r) { const T = CASA_T, R = CASA_R, Hp = h + (o.pretil ?? .55), uvo = { y0: o.y0 || 0, H: o.Htot || Hp };
  const MU = [TM(0, 0, d / 2), TM(w / 2, 0, 0, 0, Math.PI / 2), TM(0, 0, -d / 2, 0, Math.PI), TM(-w / 2, 0, 0, 0, -Math.PI / 2)], LW = [w - 2 * R, d - 2 * R, w - 2 * R, d - 2 * R], add = (k, g, m) => L.add(k, g, B.clone().multiply(m));
  const LB = { add: (k, g, m) => add(k, g, m) };
  for (let s = 0; s < 4; s++) { const ab = o.ab[s] || [], M = MU[s]; muroAdobe({ add: (k, g, m) => add(k, g, m) }, LW[s], Hp, ab, M, { ...uvo, inv: s % 2 === 1 });
    // la tapa redondeada del pretil (un poco despareja)
    add("pared", geoUV(RB(LW[s] + .1, .3, T + .1, .14), px => .5 + px * .1, (px, py) => .97 + py * .05), M.clone().multiply(TM(0, Hp + .03, -T / 2)));
    ab.forEach(a => { const cx = (a.x0 + a.x1) / 2, an = a.x1 - a.x0, al = a.y1 - a.y0;
      // dintel de madera (asoma), y adentro lo oscuro de la casa
      add("madera", new THREE.BoxGeometry(an + .5, .2, T + .1), M.clone().multiply(TM(cx, a.y1 + .1, -T / 2 + .03)));
      add("oscuro", new THREE.PlaneGeometry(an + .04, al + .04), M.clone().multiply(TM(cx, a.y0 + al / 2, -T - .02)));
      if (a.puerta) { const ang = a.abre || 0; // marco, hoja de tablas con travesaños, argolla, umbral de piedra
        for (const sx of [-1, 1]) add("madera", new THREE.BoxGeometry(.1, al, T * .7), M.clone().multiply(TM(cx + sx * (an / 2 - .05), al / 2, -T * .5)));
        const hoja = M.clone().multiply(TM(cx - an / 2 + .1, 0, -T + .14, 0, -ang, 0)); add("color", new THREE.BoxGeometry(an - .2, al - .04, .07), hoja.clone().multiply(TM((an - .2) / 2, al / 2, 0)));
        for (const yy of [.45, al / 2, al - .45]) add("madera", new THREE.BoxGeometry(an - .26, .16, .04), hoja.clone().multiply(TM((an - .2) / 2, yy, .05)));
        add("hierro", new THREE.TorusGeometry(.09, .018, 6, 14), hoja.clone().multiply(TM(an - .45, al * .48, .09))); add("hierro", new THREE.CylinderGeometry(.03, .03, .05, 8), hoja.clone().multiply(TM(an - .45, al * .48 + .09, .07, Math.PI / 2)));
        add("laja", RB(an + .7, .16, .8, .06), M.clone().multiply(TM(cx, .02, .2))) }
      else { // ventana: alféizar, marco, rejas de palo y postigos de color (abiertos contra la pared, a medio abrir o cerrados)
        add("pared", RB(an + .36, .14, T + .3, .05), M.clone().multiply(TM(cx, a.y0 - .05, -T / 2 + .1)));
        for (const sx of [-1, 1]) add("madera", new THREE.BoxGeometry(.08, al, .1), M.clone().multiply(TM(cx + sx * (an / 2 - .04), a.y0 + al / 2, -.08)));
        if (a.reja) for (let k = 1; k <= 3; k++) add("madera", new THREE.CylinderGeometry(.028, .028, al, 6), M.clone().multiply(TM(a.x0 + an * k / 4, a.y0 + al / 2, -T * .5)));
        const pa = a.post ?? 0; if (pa >= 0) for (const sx of [-1, 1]) { const hm = M.clone().multiply(TM(cx + sx * an / 2, a.y0 + al / 2, .02, 0, sx * (Math.PI - pa * 2.6), 0)); add("color", new THREE.BoxGeometry(an / 2 - .02, al, .05), hm.clone().multiply(TM(-sx * (an / 4), 0, 0)));
          for (const yy of [-al * .3, al * .3]) for (const zz of [-.035, .035]) add("madera", new THREE.BoxGeometry(an / 2 - .08, .08, .03), hm.clone().multiply(TM(-sx * (an / 4), yy, zz))) } } }) }
  // esquinas redondas (un poco más anchas abajo) con su remate
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, -1], [-1, 1]]) { const g = new THREE.CylinderGeometry(R, R * (o.y0 ? 1 : 1.1), Hp, 14, 1, true); g.translate(0, Hp / 2, 0); geoUV(g, (x, y, z) => .1 + (Math.atan2(z, x) / 6.283 + .5) * .5, (x, y) => (uvo.y0 + y) / uvo.H); add("pared", g, TM(sx * (w / 2 - R), 0, sz * (d / 2 - R)));
    const cap = new THREE.SphereGeometry(R * 1.04, 14, 8, 0, 6.283, 0, Math.PI / 2); cap.scale(1, .42 + r() * .5, 1); geoUV(cap, x => .5 + x * .2, (x, y) => .96 + y * .05); add("pared", cap, TM(sx * (w / 2 - R), Hp, sz * (d / 2 - R))) }
  // el techo de barro (cierra arriba), el piso de adentro y las vigas que asoman adelante y atrás
  add("techo", new THREE.BoxGeometry(w - T, .3, d - T), TM(0, h - .05, 0));
  const nv = Math.max(3, Math.round((w - 1.4) / .78)); for (let k = 0; k < nv; k++) { const x = lerp(-(w / 2 - R - .25), w / 2 - R - .25, k / (nv - 1)), sal = .42 + r() * .3, g = new THREE.CylinderGeometry(.1 + r() * .025, .11, d + sal * 2, 9); add("madera", g, TM(x, h - .32, (r() - .5) * .1, Math.PI / 2, 0, 0)) }
  // gárgola de madera (canal de desagüe) en un costado
  if (o.canal !== false) { const s = r() < .5 ? 1 : -1; add("madera", new THREE.BoxGeometry(.75, .06, .22), TM(s * (w / 2 + .28), h + .12, (r() - .5) * d * .5, 0, 0, -s * .12)); for (const q of [-1, 1]) add("madera", new THREE.BoxGeometry(.75, .1, .03), TM(s * (w / 2 + .28), h + .17, (r() - .5) * .01 + q * .11, 0, 0, -s * .12)) }
  return { Hp } }
const escaleraMano = (L, M, alto, k = "madera") => { const an = .62, L2 = alto + .5; for (const s of [-1, 1]) L.add(k, new THREE.CylinderGeometry(.045, .055, L2, 7), M.clone().multiply(TM(s * an / 2, L2 / 2, 0))); for (let y = .4; y < L2 - .15; y += .42) L.add(k, new THREE.CylinderGeometry(.032, .032, an + .14, 6), M.clone().multiply(TM(0, y, 0, 0, 0, Math.PI / 2))) };
const CASAS_A = [];
function casaAdobe(x, z, ry, w, d, h, seed, o = {}) { const r = rng(seed), g = new THREE.Group(); g.position.set(x, SUELO(x, z) - .04, z); g.rotation.y = ry; scene.add(g); const L = lote(), I = new THREE.Matrix4();
  const dos = o.dos ?? r() < .36, h2 = 3.9 + r() * .5, w2 = Math.max(3.9, w * (.5 + r() * .14)), d2 = d - .5, lado = r() < .5 ? -1 : 1, Htot = dos ? h + h2 + 1 : h + .6;
  // aberturas de la planta baja: puerta al frente (corrida a un lado), una o dos ventanas al frente, ventanas a los costados y atrás
  const px = (o.puertaX ?? (r() - .5) * (w - 4.6)), wd = 1.6, hd = 3.15, F = [{ x0: px - wd / 2, x1: px + wd / 2, y0: 0, y1: hd, puerta: 1, abre: o.abre ?? (r() < .3 ? .5 + r() * .7 : 0) }], LW = w - 2 * CASA_R;
  const vent = (cx, an = 1.05, al = 1.15, y0 = 1.75) => ({ x0: cx - an / 2, x1: cx + an / 2, y0, y1: y0 + al, reja: r() < .55, post: o.sinPostigos ? -1 : (r() < .25 ? -1 : r() < .5 ? 0 : r() * .6) });
  for (const s of [-1, 1]) { const cx = px + s * (wd / 2 + 1.25 + r() * .5); if (Math.abs(cx) + .7 < LW / 2 && (o.ventF ?? r() < .8)) F.push(vent(cx)) }
  const lat = () => r() < .7 ? [vent((r() - .5) * (d - 3.4), .9 + r() * .3, 1 + r() * .3)] : [], atras = r() < .6 ? [vent((r() - .5) * (w - 3.6))] : [];
  cuerpoAdobe(L, I, w, d, h, { ab: [F, lat(), atras, lat()], Htot, pretil: dos ? .5 : .5 + r() * .25 }, r);
  if (dos) { const B2 = TM(lado * ((w - w2) / 2 - .13), h + .12, -((d - d2) / 2 - .13)); cuerpoAdobe(L, B2, w2, d2, h2, { ab: [[], [], r() < .5 ? [vent(0, .9, 1)] : [], [], ].map((a, i) => i === (lado > 0 ? 3 : 1) ? [{ x0: -.7, x1: .7, y0: 0, y1: 2.95, puerta: 1, abre: r() < .4 ? .8 : 0 }] : i === 0 ? [vent((r() - .5) * (w2 - 3), .95, 1.05, 1.5)] : a), y0: h + .12, Htot, pretil: .45 + r() * .2, canal: r() < .5 }, r);
    // escalera de mano de la terraza al techo de arriba, y otra del piso a la terraza
    escaleraMano(L, B2.clone().multiply(TM(-lado * (w2 / 2 + .98), 0, d2 / 2 - 1.1, 0, lado * Math.PI / 2, 0)).multiply(TM(0, 0, 0, .2, 0, 0)), h2 + .6) }
  // interior oscuro (para que por los huecos no se vea el otro lado)
  L.add("oscuro", new THREE.BoxGeometry(w - 2 * CASA_T - .1, h - .3, d - 2 * CASA_T - .1), TM(0, h / 2 - .1, 0));
  // zócalo desparejo: barro acumulado al pie del muro
  for (let k = 0; k < 7; k++) { const s = k % 4, t = (r() - .5) * .8, an = 1.2 + r() * 1.8, gg = new THREE.SphereGeometry(1, 10, 6, 0, 6.283, 0, Math.PI / 2); gg.scale(an / 2, .25 + r() * .35, .32); geoUV(gg, px => .5 + px * .2, (px, py) => .02 + py * .1);
    const P = s === 0 ? TM(t * (w - 2), 0, d / 2) : s === 1 ? TM(w / 2, 0, t * (d - 2), 0, Math.PI / 2) : s === 2 ? TM(t * (w - 2), 0, -d / 2) : TM(-w / 2, 0, t * (d - 2), 0, Math.PI / 2); if (s === 0 && Math.abs(t * (w - 2) - px) < 1.6) continue; L.add("pared", gg, P) }
  const mats = { pared: M_ADOBE[o.adobe ?? (seed % M_ADOBE.length)], madera: r() < .5 ? M_MADERA : M_MADERA_V, color: M_PUERTA[o.color ?? (r() * M_PUERTA.length | 0)], oscuro: M_OSCURO, techo: M_TECHO_B, hierro: M_HIERRO, laja: M_LAJA };
  const ms = L.fin(g, mats); ms.oscuro.castShadow = false; const C = { g, x, z, ry, w, d, h, F, dos, h2, w2, d2, lado, px, seed, mats, Hp: h + .5, r }; CASAS_A.push(C); RECTS.push(C); return C }

// ---------- el pueblo: la casa del narrador, dos filas sobre la calle principal y el resto alrededor de la plaza (48 casas)
Object.keys(PUNTOS).forEach(k => ocupa(PUNTOS[k][0], PUNTOS[k][1], PUNTOS_R[k]));
const MI_CASA = casaAdobe(CASA_MIA[0], CASA_MIA[1], -Math.PI / 2, 6.6, 5.2, 4.6, 2901, { dos: false, adobe: 2, color: 0, puertaX: -1.2, abre: 0, ventF: true });
{ const r = rng(2905), lejos = (x, z, m = 9.4) => CASAS_A.every(c => Math.hypot(c.x - x, c.z - z) > m);
  const pon = (x, z, ry) => { const w = 5.6 + r() * 2.6, d = 4.8 + r() * 1.3, R = Math.hypot(w, d) / 2 + .3; if (!lejos(x, z, 4.4 + R) || zonaLibre(x, z, R - .6) || OCUP.some(q => Math.hypot(q.x - x, q.z - z) < q.r + R - .8)) return false; casaAdobe(x, z, ry, w, d, 4.3 + r() * .8, 2910 + CASAS_A.length * 3); return true };
  for (const z of [25.6, 35, 44.6]) pon(9.4 + r() * .6, z, -Math.PI / 2); for (const z of [22.5, 31.8, 41.2, 50.4]) pon(-9.4 - r() * .6, z, Math.PI / 2);
  // primer anillo, mirando a la plaza
  for (let k = 0; k < 16; k++) { const a = k / 16 * 6.283 + .2, x = Math.cos(a) * 22.5, z = Math.sin(a) * 21.5; pon(x, z, Math.atan2(-x, -z)) }
  for (let k = 0; k < 4000 && CASAS_A.length < 48; k++) { const a = r() * 6.283, d = 26 + r() * 30, x = Math.cos(a) * d, z = Math.sin(a) * d * 1.04 + 5; if (z < -40) continue; const ry = (Math.abs(x) < 30 && z > 12) ? (x > 0 ? -1 : 1) * Math.PI / 2 + (r() < .3 ? Math.PI : 0) : Math.atan2(-x, -z) + (r() - .5) * .5; pon(x, z, ry) } }

// ---------- LA TORRE: base de piedra, cuerpo de adobe con NEVER pintado al sur, escalera exterior en espiral de 92 escalones, plataforma de tablas
const cilEntre = (a, b, r, seg = 7, r2 = r) => { const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b), d = Bv.clone().sub(A); return [new THREE.CylinderGeometry(r2, r, 1, seg), MZ(A.clone().add(Bv).multiplyScalar(.5), d, new THREE.Vector3(1, d.length(), 1))] };
const T_SOGA = tex(64, 64, (g, w, h) => { g.fillStyle = "#b89a6a"; g.fillRect(0, 0, w, h); for (let k = -8; k < 16; k++) { g.strokeStyle = k % 2 ? "rgba(70,50,28,.7)" : "rgba(240,220,170,.5)"; g.lineWidth = 4; g.beginPath(); g.moveTo(k * 8, 0); g.lineTo(k * 8 + 32, h); g.stroke() } }, [1, 6]);
const M_SOGA = new THREE.MeshStandardMaterial({ map: T_SOGA, bumpMap: T_SOGA, bumpScale: 2, roughness: 1 });
const TORRE_RW = y => y < 3 ? 4.32 : lerp(4.2, 3.5, (y - 3) / 13);   // radio del muro a cada altura
const ESC_N = 92, ESC_D = 2.5 * 6.283 / ESC_N, ESC_T0 = -.25, ESC_ANG = k => ESC_T0 - k * ESC_D, ESC_Y = k => (k + 1) * TORRE_H / ESC_N;
// posición (mundo) del escalón k (0…91) para parar o hacer subir a un personaje: [x, y, z]; el 92 es la plataforma
const ESCALON_W = k => { const kk = cl(k, 0, ESC_N - 1), a = ESC_ANG(kk), y = ESC_Y(kk), R = TORRE_RW(y) + .68; return [TORRE[0] + Math.sin(a) * R, y, TORRE[1] + Math.cos(a) * R] };
const T_TORRE = T_ADOBE(2850, "#c49a70", { w: 2048, h: 2048, parches: 16, extra(c, z, w, h, r) {
  // hileras de mechinales (huecos de andamio) y una guarda pintada arriba
  for (const v of [.93, .9]) { c.fillStyle = v > .92 ? "rgba(150,62,40,.75)" : "rgba(236,226,200,.7)"; for (let x = 0; x < w; x += 64) { c.beginPath(); c.moveTo(x, h * (1 - v)); c.lineTo(x + 32, h * (1 - v) - 34); c.lineTo(x + 64, h * (1 - v)); c.lineTo(x + 32, h * (1 - v) + 10); c.fill() } }
  c.fillStyle = "rgba(150,62,40,.6)"; c.fillRect(0, h * .125, w, 12); c.fillRect(0, h * .04, w, 10);
  // NEVER: pintado a brocha con cal, chorreado y gastado (centro en u = .5 → sur)
  const T = mk(760, 470), g = T.getContext("2d"), yC = h * (1 - (9.4 - 3) / 13), an = .8 / 6.283 * w * 2; g.textAlign = "center"; g.textBaseline = "middle"; g.font = "900 380px Impact, 'Arial Black', sans-serif"; const m = g.measureText("NEVER").width, sx = Math.min(1.15, 700 / m);
  const dib = (col, dx, dy) => { g.save(); g.translate(380 + dx, 215 + dy); g.scale(sx, 1); g.fillStyle = col; g.fillText("NEVER", 0, 0); g.restore() }; dib("rgba(70,30,18,.75)", 7, 8); dib("#ddd2b8", 0, 0);
  for (let k = 0; k < 22; k++) { const x = 60 + r() * 640, L = 30 + r() * 90; g.strokeStyle = "rgba(221,210,184,.9)"; g.lineWidth = 4 + r() * 7; g.lineCap = "round"; g.beginPath(); g.moveTo(x, 330 + r() * 20); g.lineTo(x + (r() - .5) * 4, 360 + L); g.stroke() }
  g.globalCompositeOperation = "destination-out"; for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(0,0,0,${.3 + r() * .6})`; const x = r() * 760, y = r() * 470; g.fillRect(x, y, 2 + r() * 26, 1 + r() * 3) } for (let k = 0; k < 60; k++) { g.fillStyle = "rgba(0,0,0,.8)"; g.beginPath(); g.ellipse(r() * 760, 60 + r() * 380, 3 + r() * 12, 2 + r() * 8, r() * 3, 0, 7); g.fill() }
  const W2 = an, H2 = 470 * (2.2 / 13 * h) / 300; c.drawImage(T, w / 2 - W2 / 2, yC - H2 / 2, W2, H2); z.globalAlpha = .35; z.filter = "brightness(3)"; z.drawImage(T, w / 2 - W2 / 2, yC - H2 / 2, W2, H2); z.filter = "none"; z.globalAlpha = 1 } });
const M_TORRE = new THREE.MeshStandardMaterial({ map: T_TORRE[0], bumpMap: T_TORRE[1], bumpScale: 6, roughness: .96 });
const M_SILLAR = ["#8d7b66", "#7a6a58", "#9c8a74", "#85705c"].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: .92, bumpMap: T_ARENA_D.z, bumpScale: 3 }));
const TORRE_G = new THREE.Group(); TORRE_G.position.set(TORRE[0], 0, TORRE[1]); scene.add(TORRE_G);
{ const r = rng(2860), L = lote(), H = TORRE_H;
  // cuerpo de adobe (un poco desparejo, hecho a mano)
  { const g = new THREE.CylinderGeometry(3.5, 4.2, 13, 80, 30, true), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), zz = p.getZ(i), a = Math.atan2(x, zz), k = 1 + (fbm2(Math.cos(a) * 2.2 + 5, y * .4 + Math.sin(a) * 2.2, 3) - .5) * .05; p.setX(i, x * k); p.setZ(i, zz * k) } g.computeVertexNormals(); g.rotateY(Math.PI); const m = new THREE.Mesh(g, M_TORRE); m.position.y = 9.5; m.castShadow = m.receiveShadow = true; TORRE_G.add(m) }
  // base de piedra: núcleo y sillares en hiladas (cada uno distinto, salidos del plomo)
  L.add("s1", new THREE.CylinderGeometry(4.22, 4.3, 3.7, 40, 1, true), TM(0, 1.25, 0)); L.add("s1", new THREE.TorusGeometry(4.27, .14, 8, 48), TM(0, 3.08, 0, Math.PI / 2));
  for (let f = 0; f < 7; f++) { const y = -.35 + f * .5; let a = r() * 6.283; const fin = a + 6.283; while (a < fin - .05) { const da = Math.min(fin - a, .2 + r() * .22), an = da * 4.3 - .05, rr = 4.3 + r() * .1; L.add("s" + (r() * 4 | 0), RB(an, .44, .5, .07), TM(Math.sin(a + da / 2) * rr, y + .25, Math.cos(a + da / 2) * rr, (r() - .5) * .04, a + da / 2, 0)); a += da } }
  // contrafuertes de piedra y la puertita del depósito (al sudoeste)
  for (const a of [.9, 2.5, 3.9, 5.4]) for (let k = 0; k < 5; k++) L.add("s" + (k % 4), RB(1.2 - k * .1, .56, 1.5 - k * .26, .08), TM(Math.sin(a) * (4.7 - k * .13), .1 + k * .55, Math.cos(a) * (4.7 - k * .13), 0, a, 0));
  { const a = -.95, M = TM(Math.sin(a) * 4.34, 0, Math.cos(a) * 4.34, 0, a, 0); L.add("oscuro", new THREE.BoxGeometry(1.3, 2.5, .2), M.clone().multiply(TM(0, 1.25, 0))); L.add("puerta", new THREE.BoxGeometry(1.2, 2.4, .08), M.clone().multiply(TM(0, 1.2, .1))); L.add("madera", new THREE.BoxGeometry(1.7, .24, .4), M.clone().multiply(TM(0, 2.62, .1))); for (const s of [-1, 1]) L.add("madera", new THREE.BoxGeometry(.18, 2.5, .36), M.clone().multiply(TM(s * .74, 1.25, .1))); for (const yy of [.5, 1.9]) L.add("hierro", new THREE.BoxGeometry(1.16, .1, .03), M.clone().multiply(TM(0, yy, .15))); L.add("hierro", new THREE.TorusGeometry(.1, .02, 6, 12), M.clone().multiply(TM(.38, 1.2, .16))) }
  // mechinales con sus palos (salen del muro en dos hileras) y aspilleras
  for (const [yy, n, f0] of [[13.9, 11, .3], [5.2, 9, 1.1]]) for (let k = 0; k < n; k++) { const a = f0 + k / n * 6.283, R = TORRE_RW(yy); L.add("madera", new THREE.CylinderGeometry(.07, .08, .9, 7), TM(Math.sin(a) * (R + .2), yy, Math.cos(a) * (R + .2), Math.PI / 2, a, 0)) }
  for (const [a, yy] of [[2.2, 8.3], [4.3, 11.5], [1.2, 12.6], [5.3, 6.4]]) { const R = TORRE_RW(yy), M = TM(Math.sin(a) * (R - .02), yy, Math.cos(a) * (R - .02), 0, a, 0); L.add("oscuro", new THREE.BoxGeometry(.34, 1.1, .12), M); L.add("madera", new THREE.BoxGeometry(.6, .12, .3), M.clone().multiply(TM(0, .62, .05))); L.add("s2", RB(.6, .12, .34, .04), M.clone().multiply(TM(0, -.6, .08))) }
  // la escalera: 92 escalones de laja sobre ménsulas de madera, con jabalcones, postes y baranda de soga del lado de afuera
  let ant = null; for (let k = 0; k < ESC_N; k++) { const a = ESC_ANG(k), y = ESC_Y(k), R = TORRE_RW(y), s = Math.sin(a), c = Math.cos(a), M = TM(s * (R + .68), y - .085, c * (R + .68), 0, a, 0);
    L.add("s" + (k % 4), RB(.82 + r() * .08, .14, 1.36, .04), M.clone().multiply(TM(0, 0, 0, (r() - .5) * .02, (r() - .5) * .05, 0))); L.add("madera", new THREE.CylinderGeometry(.075, .085, 1.7, 7), TM(s * (R + .55), y - .22, c * (R + .55), Math.PI / 2, a, 0));
    if (k % 2 === 0) L.add("madera", ...cilEntre([s * (R + 1.2), y - .28, c * (R + 1.2)], [s * (R - .05), y - 1.3, c * (R - .05)], .055));
    if (k % 3 === 0 || k === ESC_N - 1) { const p = [s * (R + 1.28), y + 1.12, c * (R + 1.28)]; L.add("madera", ...cilEntre([p[0], y - .2, p[2]], p, .05, 6, .04)); L.add("soga", new THREE.TorusGeometry(.07, .025, 5, 10), TM(p[0], p[1] - .12, p[2], Math.PI / 2)); if (ant) { const mid = [(ant[0] + p[0]) / 2 * 1.012, (ant[1] + p[1]) / 2 - .14, (ant[2] + p[2]) / 2 * 1.012]; L.add("soga", ...cilEntre([ant[0], ant[1] - .1, ant[2]], mid, .03, 5)); L.add("soga", ...cilEntre(mid, [p[0], p[1] - .1, p[2]], .03, 5)) } ant = p } }
  // arriba: cornisa, vigas en abanico y plataforma de tablas
  L.add("s1", new THREE.TorusGeometry(3.52, .2, 8, 48), TM(0, H - .5, 0, Math.PI / 2)); for (let k = 0; k < 16; k++) { const a = k / 16 * 6.283 + .1; L.add("madera", new THREE.CylinderGeometry(.1, .11, 1.5, 8), TM(Math.sin(a) * 3.5, H - .27, Math.cos(a) * 3.5, Math.PI / 2, a, 0)) }
  L.add("tablas", new THREE.CylinderGeometry(4.0, 4.0, .2, 48), TM(0, H - .1, 0));
  // baranda de la plataforma (postes y dos sogas), abierta al este (pasarela) y donde llega la escalera
  { const aF = ESC_ANG(ESC_N - 1); let an2 = null; for (let k = 0; k < 22; k++) { const a = k / 22 * 6.283, da = Math.atan2(Math.sin(a - aF), Math.cos(a - aF)), dE = Math.atan2(Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2)); if (Math.abs(da) < .34 || Math.abs(dE) < .3) { an2 = null; continue } const p = [Math.sin(a) * 3.85, H + 1.15, Math.cos(a) * 3.85]; L.add("madera", ...cilEntre([p[0], H, p[2]], p, .055, 6, .045)); if (an2) for (const dy of [-.08, -.6]) L.add("soga", ...cilEntre([an2[0], an2[1] + dy, an2[2]], [p[0], p[1] + dy, p[2]], .028, 5)); an2 = p } }
  const ms = L.fin(TORRE_G, { s0: M_SILLAR[0], s1: M_SILLAR[1], s2: M_SILLAR[2], s3: M_SILLAR[3], madera: M_MADERA, soga: M_SOGA, oscuro: M_OSCURO, puerta: M_PUERTA[8], hierro: M_HIERRO, tablas: M_MADERA_V }); TORRE_G.userData.ms = ms }
[[TORRE[0], TORRE[1], 5.4]].forEach(q => ocupa(...q));

// ---------- EL CUERNO sobre la torre (acostado a lo largo de x, la base serruchada al oeste y en alto, la punta con la boquilla al este)
const CUERNO = new THREE.Group(); CUERNO.position.set(TORRE[0], TORRE_H, TORRE[1]); scene.add(CUERNO);          // se mueve con cuernoCae
const CUNA = new THREE.Group(); CUNA.position.copy(CUERNO.position); scene.add(CUNA);                             // la cuna queda en la torre
const CUERNO_POSE = new THREE.Matrix4().makeTranslation(-2.5, 2.05, 0).multiply(new THREE.Matrix4().makeRotationZ(-.5)).multiply(new THREE.Matrix4().makeRotationY(Math.PI / 2)).multiply(new THREE.Matrix4().makeTranslation(0, 2.7, -10.5));
const CUERNO_CURVA = colmilloCurva(COLMILLO_L), cuernoR = u => 1.5 * (.1 + .9 * Math.pow(1 - u, .75));
const cuernoEn = x => { let b = null, bd = 1e9; for (let i = 0; i <= 200; i++) { const p = CUERNO_CURVA.getPointAt(i / 200).applyMatrix4(CUERNO_POSE), d = Math.abs(p.x - x); if (d < bd) { bd = d; b = { p, u: i / 200, r: cuernoR(i / 200) } } } return b };
const M_MARFIL_IN = new THREE.MeshStandardMaterial({ color: "#3a2a1c", roughness: 1, side: THREE.BackSide });
{ const cu = new THREE.Mesh(geoColmillo(COLMILLO_L, 1.5, { hueco: true }), M_MARFIL); cu.applyMatrix4(CUERNO_POSE); cu.castShadow = cu.receiveShadow = true; CUERNO.add(cu); CUERNO.userData.malla = cu;
  const p0 = CUERNO_CURVA.getPointAt(0), tg = CUERNO_CURVA.getTangentAt(0), L = lote(), base = CUERNO_POSE.clone().multiply(MZ(p0, tg, new THREE.Vector3(1, 1, 1)));   // en `base`, +y va hacia adentro del cuerno
  // el corte: anillo de dentina con sus anillos de crecimiento, el canto, y el hueco oscuro que se pierde adentro
  { const an = new THREE.RingGeometry(.86, 1.56, 48, 3); const p = an.attributes.position, u = an.attributes.uv; for (let i = 0; i < p.count; i++) u.setXY(i, .5 + p.getX(i) / 3.2, .5 + p.getY(i) / 3.2); L.add("corte", an, base.clone().multiply(TM(0, .01, 0, Math.PI / 2, 0, 0))) }
  L.add("dentro", new THREE.CylinderGeometry(.5, .86, 5, 28, 1, true), base.clone().multiply(TM(0, 2.5, 0))); L.add("fondo", new THREE.CircleGeometry(.5, 16), base.clone().multiply(TM(0, 5, 0, Math.PI / 2, 0, 0)));
  // zunchos de hierro viejo y anillos tallados cerca de la punta; la boquilla: una copa de marfil tallado con aro de bronce
  for (const u of [.04, .3, .62]) { const p = CUERNO_CURVA.getPointAt(u), t = CUERNO_CURVA.getTangentAt(u); L.add("hierro", new THREE.TorusGeometry(cuernoR(u) * 1.035 + .02, .05, 6, 40), CUERNO_POSE.clone().multiply(MZ(p, t, new THREE.Vector3(1, 1, 1))).multiply(TM(0, 0, 0, Math.PI / 2, 0, 0))) }
  for (const u of [.86, .9, .935, .96]) { const p = CUERNO_CURVA.getPointAt(u), t = CUERNO_CURVA.getTangentAt(u); L.add("marfil", new THREE.TorusGeometry(cuernoR(u) + .015, .035, 6, 24), CUERNO_POSE.clone().multiply(MZ(p, t, new THREE.Vector3(1, 1, 1))).multiply(TM(0, 0, 0, Math.PI / 2, 0, 0))) }
  const p1 = CUERNO_CURVA.getPointAt(1), t1 = CUERNO_CURVA.getTangentAt(1), punta = CUERNO_POSE.clone().multiply(MZ(p1, t1, new THREE.Vector3(1, 1, 1)));
  L.add("marfil", new THREE.LatheGeometry([[.15, -.1], [.17, .05], [.13, .14], [.12, .22], [.2, .3], [.25, .4], [.26, .46], [.21, .47], [.12, .36]].map(q => new THREE.Vector2(q[0], q[1])), 20), punta); L.add("bronce", new THREE.TorusGeometry(.245, .03, 6, 22), punta.clone().multiply(TM(0, .45, 0, Math.PI / 2, 0, 0))); L.add("bronce", new THREE.TorusGeometry(.135, .025, 6, 18), punta.clone().multiply(TM(0, .18, 0, Math.PI / 2, 0, 0)));
  L.fin(CUERNO, { corte: M_CORTE_MARFIL, dentro: M_MARFIL_IN, fondo: new THREE.MeshBasicMaterial({ color: "#0c0806", side: THREE.DoubleSide }), hierro: M_HIERRO, marfil: M_MARFIL, bronce: new THREE.MeshStandardMaterial({ color: "#b08a3a", roughness: .35, metalness: .85 }) });
  CUERNO.userData.punta = new THREE.Vector3(0, .5, 0).applyMatrix4(punta); CUERNO.userData.base = new THREE.Vector3(0, 0, 0).applyMatrix4(base); CUERNO.userData.baseDir = new THREE.Vector3(0, -1, 0).transformDirection(base) }
const BOQUILLA_W = () => { CUERNO.updateMatrixWorld(true); return CUERNO.userData.punta.clone().applyMatrix4(CUERNO.matrixWorld).toArray() };
const CUERNO_BASE_W = () => { CUERNO.updateMatrixWorld(true); return CUERNO.userData.base.clone().applyMatrix4(CUERNO.matrixWorld).toArray() };   // centro del corte (por donde lo agarra Onetusk)
const BALCON_Y = TORRE_H + CUERNO.userData.punta.y - 2.42;                 // piso de la pasarela: la boquilla queda a la altura de la boca
const BOCA_W = () => [TORRE[0] + CUERNO.userData.punta.x + .62, BALCON_Y, TORRE[1]];   // el narrador se para acá, mirando al oeste (ry = −π/2)
// la cuna: dos caballetes en X con solera, largueros y riostras, atados con soga; dos zunchos de hierro la cierran, con 4 pernos
const PERNOS = [], ZUNCHOS = [];
{ const L = lote(), r = rng(2870), sil = [-3.1, 1.5].map(x => ({ x, ...cuernoEn(x) }));
  sil.forEach((S, j) => { const hc = S.p.y, rh = S.r * 1.03, b = .7, yc = hc - rh / Math.sin(b), top = hc + rh * .35, zt = (top - yc) * Math.tan(b), zb = yc * Math.tan(b) + .25;
    for (const s of [-1, 1]) { L.add("madera", ...cilEntre([S.x, .05, -s * zb], [S.x + s * .14, top, s * zt], .15, 8)); L.add("madera", ...cilEntre([S.x, .1, s * (zb + .2)], [S.x + (j ? -1 : 1) * 2.1, .1, s * (zb + .2)], .1)); L.add("madera", ...cilEntre([S.x + (j ? -1.6 : 1.6), .12, s * zb * .9], [S.x + s * .14 * 0, top * .72, s * zt * .66], .075)) }
    L.add("madera", new THREE.BoxGeometry(.34, .26, zb * 2 + 1), TM(S.x, .13, 0)); for (const s of [-1, 0, 1]) L.add("soga", new THREE.TorusGeometry(.2, .04, 6, 14), TM(S.x + .07 * s, s ? .2 : yc, s * zb, s ? 0 : Math.PI / 2, s ? 0 : 0, s ? Math.PI / 2 : 0));
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) L.add("soga", new THREE.TorusGeometry(.19, .035, 5, 12), MZ(new THREE.Vector3(S.x + s * .14 * .55, lerp(yc, top, .5) + (k - 1) * .09, s * zt * .5 + (k - 1) * .09 * Math.tan(b) * s), new THREE.Vector3(0, Math.cos(b), s * Math.sin(b)), new THREE.Vector3(1, 1, 1)).multiply(TM(0, 0, 0, Math.PI / 2)));
    // el zuncho: media vuelta de hierro sobre el cuerno, con ojales; gira sobre el extremo norte cuando salen los pernos
    const zg = new THREE.Group(); zg.position.set(S.x, hc, -(rh + .06)); CUNA.add(zg); const arco = new THREE.Mesh(new THREE.TorusGeometry(rh + .06, .055, 6, 30, Math.PI), M_HIERRO); arco.rotation.y = Math.PI / 2; arco.position.z = rh + .06; arco.castShadow = true; zg.add(arco);
    for (const s of [0, 1]) { const oj = new THREE.Mesh(new THREE.TorusGeometry(.13, .045, 6, 14), M_HIERRO); oj.position.set(0, -.1, s * 2 * (rh + .06)); oj.rotation.y = Math.PI / 2; zg.add(oj) } ZUNCHOS.push(zg);
    // los pernos: barra de hierro con cabeza de argolla y chaveta, atraviesan el ojal y la punta del caballete
    for (const s of [1, -1]) { const pg = new THREE.Group(), pm = new THREE.Mesh(mergeG([[new THREE.CylinderGeometry(.065, .055, 1.25, 10), TM(0, 0, 0, 0, 0, Math.PI / 2)], [new THREE.TorusGeometry(.17, .05, 8, 18), TM(.78, 0, 0)], [new THREE.CylinderGeometry(.1, .1, .08, 10), TM(.6, 0, 0, 0, 0, Math.PI / 2)], [new THREE.BoxGeometry(.05, .3, .05), TM(-.5, 0, 0)]]), M_HIERRO); pm.castShadow = true; pg.add(pm); pg.position.set(S.x, hc - .1, s * (rh + .06)); CUNA.add(pg); pg.userData = { p0: pg.position.clone(), s, j }; PERNOS.push(pm) } });
  // rollo de soga, cuñas y un mazo sobre la plataforma
  for (let k = 0; k < 5; k++) L.add("soga", new THREE.TorusGeometry(.42 - k * .02, .05, 6, 20), TM(-.9, .08 + k * .085, 2.5, Math.PI / 2, 0, 0)); for (const [x, z2, a] of [[-3.5, -1.9, .3], [1.9, 1.8, 2], [1.2, -2, 1]]) L.add("madera", new THREE.BoxGeometry(.5, .22, .28), TM(x, .11, z2, 0, a, .2));
  L.add("madera", new THREE.CylinderGeometry(.045, .045, 1.1, 7), TM(.6, .42, 2.9, 0, .5, 1.2)); L.add("hierro", new THREE.BoxGeometry(.24, .3, .24), TM(.14, .14, 3.15, 0, .5, 0));
  // la pasarela al este, hasta debajo de la boquilla: largueros, tablas, jabalcones al muro y baranda de soga
  const x1 = CUERNO.userData.punta.x + 1.7, yb = BALCON_Y - TORRE_H; for (const s of [-1, 1]) { L.add("madera", ...cilEntre([2.2, yb - .16, s * .62], [x1, yb - .16, s * .62], .1, 8)); L.add("madera", ...cilEntre([3.3, -4.6, s * .55], [x1 - .5, yb - .22, s * .62], .085)); L.add("madera", ...cilEntre([3.45, -2.2, s * .5], [x1 - 2.6, yb - .22, s * .62], .07));
    let an = null; for (const x of [4.1, 5.5, x1 - .9, x1 - .1]) { const p = [x, yb + 1.15, s * .8]; L.add("madera", ...cilEntre([x, yb - .2, s * .8], p, .05, 6)); if (an) for (const dy of [-.08, -.6]) L.add("soga", ...cilEntre([an[0], an[1] + dy, an[2]], [p[0], p[1] + dy, p[2]], .028, 5)); an = p } }
  for (const dy of [-.08, -.6]) L.add("soga", ...cilEntre([x1 - .1, yb + 1.15 + dy, -.8], [x1 - .1, yb + 1.15 + dy, .8], .028, 5));
  for (let x = 3.75; x < x1; x += .34) L.add("tablas", new THREE.BoxGeometry(.3, .07, 1.72 + r() * .12), TM(x + .15, yb - .035, (r() - .5) * .05, 0, (r() - .5) * .03, 0));
  if (yb > .12) for (let k = 1; k * .19 < yb; k++) L.add("tablas", new THREE.BoxGeometry(.4, .19, 1.5), TM(3.72 - k * .4, k * .19 - .095 + .1, 0));
  L.fin(CUNA, { madera: M_MADERA, soga: M_SOGA, hierro: M_HIERRO, tablas: M_MADERA_V }) }
// q 0→1: los pernos salen de a uno (hacia el este), caen a la plataforma y los zunchos se abren
function pernosFuera(q) { PERNOS.forEach((pm, i) => { const g = pm.parent, u = P(q, i * .17, i * .17 + .42), sal = eOut(cl(u * 2.2)) * 1.45, t = Math.max(0, u - .45) * 2.4, piso = .12 - g.userData.p0.y; let y = -4.9 * t * t * 1.6, rz = 0; if (y < piso) { const t2 = t - Math.sqrt(-piso / 7.84), b = Math.max(0, .5 * Math.sin(Math.min(t2 * 9, Math.PI)) * (1 - t2)); y = piso + b; rz = 1.57 } else rz = t * 3;
    g.position.set(g.userData.p0.x + sal + t * .6, g.userData.p0.y + y, g.userData.p0.z + g.userData.s * t * .5); g.rotation.set(0, t * 1.3 * g.userData.s, -rz) });
  ZUNCHOS.forEach((zg, j) => { zg.rotation.x = -eOut(P(q, .5 + j * .17, .86 + j * .14)) * 2.1 }) }
// q 0→1: sin pernos, el cuerno resbala de la cuna hacia el oeste, la base baja y gira al norte; en q = 1 queda asomando de la torre
function cuernoCae(q) { const e = eIO(cl(q)), tiem = Math.sin(cl(q * 6) * Math.PI) * .02 * (1 - e), piv = new THREE.Vector3(-3.6, 1.1, 0);
  const M = new THREE.Matrix4().makeTranslation(piv.x, piv.y, piv.z).multiply(new THREE.Matrix4().makeRotationY(-.62 * e)).multiply(new THREE.Matrix4().makeRotationZ(.86 * e + tiem)).multiply(new THREE.Matrix4().makeTranslation(-5.4 * e * e, -.25 * e, 0)).multiply(new THREE.Matrix4().makeTranslation(-piv.x, -piv.y, -piv.z));
  CUERNO.matrix.copy(new THREE.Matrix4().makeTranslation(TORRE[0], TORRE_H, TORRE[1]).multiply(M)); CUERNO.matrixAutoUpdate = false; CUERNO.matrixWorldNeedsUpdate = true }

// ---------- rajaduras de la torre (grietasTorre): tajos oscuros con labio levantado, que avanzan con q, y piedritas que caen
const GRIETAS = (() => { const r = rng(2880), G = new THREE.Group(); TORRE_G.add(G); const mo = new THREE.MeshStandardMaterial({ color: "#120b07", roughness: 1 }), ml = new THREE.MeshStandardMaterial({ color: "#d9b88e", roughness: 1 }), lista = [], pied = [];
  const en = (a, y, d) => { const R = TORRE_RW(y) + d; return [Math.sin(a) * R, y, Math.cos(a) * R] };
  const una = (a0, y0, dir, n, t0, an0) => { const pos = [], pl = [], idx = [], il = []; let a = a0, y = y0; const pts = []; for (let k = 0; k <= n; k++) { pts.push([a, y, an0 * (1 - k / n * .8) * (.6 + r() * .8)]); a += (r() - .5) * .16 + dir[0] * .05; y += dir[1] * (.22 + r() * .3) + (r() - .5) * .12 }
    pts.forEach(([a, y, an], k) => { const sa = an / TORRE_RW(y); pos.push(...en(a - sa, y, .035), ...en(a + sa, y, .035)); pl.push(...en(a - sa * 2.3, y, .02), ...en(a - sa, y, .11), ...en(a + sa, y, .11), ...en(a + sa * 2.3, y, .02)); if (k) { const i = (k - 1) * 2; idx.push(i, i + 1, i + 2, i + 1, i + 3, i + 2); const j = (k - 1) * 4; il.push(j, j + 1, j + 4, j + 1, j + 5, j + 4, j + 2, j + 3, j + 6, j + 3, j + 7, j + 6) }
      if (k % 2 === 0) pied.push({ p: en(a, y, .2), t0: t0 + (k / n) * .3, a }) });
    const mk2 = (p, i, m) => { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3)); g.setIndex(i); g.computeVertexNormals(); const me = new THREE.Mesh(g, m); me.material.side = THREE.DoubleSide; G.add(me); return me };
    lista.push({ o: mk2(pos, idx, mo), l: mk2(pl, il, ml), n, t0 }) };
  // un cinturón de rajaduras donde aprieta la trompa (alturas 6 a 13), sobre todo al sur y al este, que se ven desde la plaza
  for (let k = 0; k < 13; k++) { const a = (k < 8 ? -1.1 + k * .32 : r() * 6.283) + (r() - .5) * .2, y0 = 6 + r() * 5; una(a, y0, [r() - .5, r() < .5 ? 1 : -1], 9 + (r() * 7 | 0), k / 13 * .55, .1 + r() * .09); if (r() < .7) una(a + .05, y0 + .5, [(r() - .5) * 3, .4], 5 + (r() * 4 | 0), k / 13 * .55 + .2, .06) }
  const pm = new THREE.InstancedMesh(GEO_PIEDRAS[0], new THREE.MeshStandardMaterial({ color: "#b89468", roughness: 1 }), pied.length); pm.castShadow = true; pm.frustumCulled = false; G.add(pm); pied.forEach(q => { q.s = .06 + r() * .16; q.v = .6 + r() * 1.6; q.rot = r() * 6 });
  return { G, lista, pied, pm } })();
function grietasTorre(q) { GRIETAS.G.visible = q > 0; GRIETAS.lista.forEach(c => { const u = P(q, c.t0, c.t0 + .4), k = Math.ceil(u * c.n); c.o.geometry.setDrawRange(0, k * 6); c.l.geometry.setDrawRange(0, k * 12); c.o.visible = c.l.visible = k > 0 });
  GRIETAS.pied.forEach((d, i) => { const t = Math.max(0, q - d.t0) * 3.2, on = q > d.t0, yf = d.p[1] - 4.9 * t * t, R = 1 + d.v * t / Math.hypot(d.p[0], d.p[2]); dummy.position.set(d.p[0] * R, Math.max(.12, yf), d.p[2] * R); dummy.rotation.set(d.rot + t * 5, d.rot, t * 3); dummy.scale.setScalar(on ? d.s : 0); dummy.updateMatrix(); GRIETAS.pm.setMatrixAt(i, dummy.matrix) }); GRIETAS.pm.instanceMatrix.needsUpdate = true }
grietasTorre(0);

M_MARFIL.side = THREE.DoubleSide;   // geoColmillo arma las caras mirando hacia adentro: con doble cara se ve bien por fuera y por el hueco
// ---------- LAS 9 RUINAS a los costados del corredor de las pisadas (lo que Onetusk aplastó hace 60 años)
const M_ARENA_M = new THREE.MeshStandardMaterial({ map: T_ARENA_D.c, bumpMap: T_ARENA_D.z, bumpScale: 3.2, roughness: .96, color: "#d2b48a" });
const geoMonton = (seed, sx, sy, sz, seg = 22) => { const g = new THREE.SphereGeometry(1, seg, 12, 0, 6.283, 0, Math.PI / 2), p = g.attributes.position, u = g.attributes.uv, r = rng(seed), f = r() * 9; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = .72 + .5 * fbm2(x * 1.6 + f, z * 1.6 - f, 3); p.setXYZ(i, x * sx * k, y * sy * (.55 + .7 * fbm2(x * 2.3 - f, z * 2.3 + f, 2)), z * sz * k); u.setXY(i, x * sx * k / 5 + .5, z * sz * k / 5 + .5) } g.computeVertexNormals(); return g };
const RUINAS = [[19.5, -55], [-19, -48], [20.5, -69], [-20.5, -62], [19, -83], [-19.5, -76], [20.5, -97], [-20, -90], [-19.5, -103.5]].map(([x, z], i) => { const r = rng(2950 + i * 5), ry = (x > 0 ? -1 : 1) * Math.PI / 2 + (r() - .5) * .5, w = 5.8 + r() * 2, d = 4.9 + r() * 1, h = 4.3 + r() * .5;
  const antes = CASAS_A.length, C = casaAdobe(x, z, ry, w, d, h, 2960 + i * 7, { dos: i % 4 === 1, abre: 0 }); CASAS_A.length = antes;   // la casa entera (como era): no cuenta entre las casas vivas
  const g = new THREE.Group(); g.position.copy(C.g.position); g.rotation.y = ry; scene.add(g); const L = lote(), T = CASA_T;
  // el montón de adobe derretido por 60 años de lluvia y la arena que se le arrimó
  L.add("pared", geoMonton(i * 3 + 1, w * .62, 1.15 + r() * .5, d * .62), TM((r() - .5) * .8, -.05, (r() - .5) * .6)); L.add("pared", geoMonton(i * 3 + 2, w * .3, .8, d * .34, 14), TM(w * .28 * (r() < .5 ? 1 : -1), -.05, d * .3));
  L.add("arena", geoMonton(i * 3 + 3, w * .7, .75, 2.2), TM(-w * .1, -.06, -d / 2 - .9)); L.add("arena", geoMonton(i * 3 + 4, 2, .5, d * .5, 14), TM(-w / 2 - .7, -.06, 0));
  // munones de muro con el borde roto (pedazos de distinto alto), sobre el fondo y un costado; la esquina es lo más alto que quedó
  const munon = (M, largo, h0, h1, f) => { let x = -largo / 2; while (x < largo / 2 - .05) { const an = Math.min(largo / 2 - x, .3 + r() * .4), q = (x + largo / 2) / largo, hh = Math.max(.25, lerp(h0, h1, q) * (.75 + r() * .45) + Math.sin(q * 9 + f) * .3), gg = new THREE.BoxGeometry(an, hh, T * (.85 + r() * .25)); gg.translate(x + an / 2, hh / 2, -T / 2); geoUV(gg, px => .05 + (px + largo / 2) / largo * .9, (px, py) => py / 5.2); L.add("pared", gg, M.clone().multiply(TM(0, 0, 0, (r() - .5) * .05, 0, (r() - .5) * .04))); x += an } };
  const lw = w - 2 * CASA_R, ld = d - 2 * CASA_R, es = r() < .5 ? 1 : -1; munon(TM(0, 0, -d / 2, 0, Math.PI), lw, es > 0 ? .5 : 2.9, es > 0 ? 2.9 : .5, i); munon(TM(-es * w / 2, 0, 0, 0, -es * Math.PI / 2), ld, es > 0 ? .4 : 2.6, es > 0 ? 2.6 : .4, i + 3); munon(TM(es * w / 2, 0, d * .12, 0, es * Math.PI / 2), ld * .5, .9, .3, i + 5);
  { const gg = new THREE.CylinderGeometry(CASA_R * .95, CASA_R * 1.12, 3.3, 12); gg.translate(0, 1.65, 0); geoUV(gg, (x2, y2, z2) => .1 + (Math.atan2(z2, x2) / 6.283 + .5) * .4, (x2, y2) => y2 / 5.2); L.add("pared", gg, TM(-es * (w / 2 - CASA_R), 0, -(d / 2 - CASA_R), .03, 0, .04)); L.add("pared", geoMonton(i + 40, .62, .5, .62, 10), TM(-es * (w / 2 - CASA_R), 3.25, -(d / 2 - CASA_R))) }
  // la puerta, todavía en pie: jambas, dintel torcido y la hoja colgando de una bisagra
  { const M = TM(C.px, 0, d / 2 - .2, 0, 0, .03); for (const s of [-1, 1]) L.add("madera", new THREE.BoxGeometry(.2, 3.2, .34), M.clone().multiply(TM(s * .9, 1.6, 0, 0, 0, s * .02))); L.add("madera", new THREE.BoxGeometry(2.3, .24, .4), M.clone().multiply(TM(0, 3.28, 0, 0, 0, -.06))); const hoja = M.clone().multiply(TM(-.78, .12, 0, 0, -1.1 - r() * .6, .09)); L.add("color", new THREE.BoxGeometry(1.5, 2.9, .07), hoja.clone().multiply(TM(.75, 1.5, 0))); for (const yy of [.5, 1.5, 2.5]) L.add("madera", new THREE.BoxGeometry(1.44, .15, .04), hoja.clone().multiply(TM(.75, yy, .05)));
    L.add("pared", geoMonton(i + 50, 1.3, .55, .8, 12), TM(C.px + 1.4, -.04, d / 2 - .1)); L.add("laja", RB(2.2, .16, .8, .06), TM(C.px, .0, d / 2 + .25, 0, .05, 0)) }
  // vigas rotas: clavadas en el montón, cruzadas, una apoyada en el muñón
  for (let k = 0; k < 9; k++) { const a = r() * 6.283, d0 = r() * w * .32, len = 1.8 + r() * 2.6, x0 = Math.cos(a) * d0, z0 = Math.sin(a) * d0 * .8, inc = .25 + r() * 1.1, b = r() * 6.283; L.add("madera", ...cilEntre([x0, .2 + r() * .5, z0], [x0 + Math.cos(b) * len * Math.cos(inc), .5 + len * Math.sin(inc), z0 + Math.sin(b) * len * Math.cos(inc)], .1 + r() * .03, 8, .095)) }
  L.add("madera", ...cilEntre([-w * .1, .5, d * .1], [-es * (w / 2 - .5), 2.2, -d / 2 + .3], .11, 8));
  // ladrillos de adobe sueltos, tejuelas del techo, una vasija rota y matas secas que crecieron encima
  for (let k = 0; k < 70; k++) { const a = r() * 6.283, dd = 1 + Math.sqrt(r()) * (w * .75), x2 = Math.cos(a) * dd, z2 = Math.sin(a) * dd * .85, cerca = Math.hypot(x2 / (w * .6), z2 / (d * .6)); const y2 = cerca < 1 ? (1 - cerca) * 1.0 + .08 : .06; const gg = new THREE.BoxGeometry(.42, .13, .21); geoUV(gg, () => .3 + r() * .4, () => .85 + r() * .1); L.add("pared", gg, TM(x2, y2, z2, (r() - .5) * .7, r() * 6.283, (r() - .5) * .7)) }
  for (let k = 0; k < 8; k++) { const a = r() * 6.283, dd = 1 + r() * w * .6; L.add("techo", new THREE.BoxGeometry(.5 + r() * .7, .1, .4 + r() * .5), TM(Math.cos(a) * dd, .12 + r() * .6, Math.sin(a) * dd * .8, (r() - .5) * .9, r() * 6, (r() - .5) * .9)) }
  for (let k = 0; k < 16; k++) { const a = r() * 6.283, dd = .5 + r() * w * .7, hh = .4 + r() * .7; for (let j = 0; j < 5; j++) L.add("mata", new THREE.ConeGeometry(.035, hh, 4), TM(Math.cos(a) * dd + (r() - .5) * .2, hh / 2 + .1 + (dd < w * .4 ? .5 : 0), Math.sin(a) * dd * .8 + (r() - .5) * .2, (r() - .5) * .7, 0, (r() - .5) * .7)) }
  const ms = L.fin(g, { pared: C.mats.pared, arena: M_ARENA_M, madera: M_MADERA_V, color: C.mats.color, laja: M_LAJA, techo: M_TECHO_B, mata: SM("#b8a060", { roughness: 1 }) });
  const R = { g, x, z, ry, w, d, entera: C.g, i }; C.g.visible = false; ocupa(x, z, Math.hypot(w, d) / 2 + 1.6); return R });
// 0 = la casa entera (como era hace 60 años); 1 = aplastada (hoy). Entre medio, la casa se hunde y el escombro aparece.
function ruinaEstado(i, q) { const R = RUINAS[i]; if (!R) return; const e = eIO(cl(q)); R.entera.visible = q < 1; R.entera.scale.set(1 + e * .18, lerp(1, .06, e), 1 + e * .18); R.g.visible = q > 0; R.g.scale.set(lerp(.8, 1, e), Math.max(.01, eOut(cl(q * 1.1))), lerp(.8, 1, e)) }

// ---------- la cresta: montículos de arena que se juntaron en 60 años alrededor de las patas (fuera del círculo de radio 4)
{ const r = rng(2990), L = lote(); for (let k = 0; k < 9; k++) { const a = k / 9 * 6.283 + r() * .4, dd = 6.4 + r() * 2.6, x = CRESTA[0] + Math.cos(a) * dd, z = CRESTA[1] + Math.sin(a) * dd * .9; L.add("arena", geoMonton(70 + k, 1.6 + r() * 1.4, .5 + r() * .7, 1.2 + r() * 1, 16), TM(x, SUELO(x, z) - .08, z, 0, a + 1.57, 0)) }
  L.fin(scene, { arena: M_ARENA_M }) }

// ================= ONETUSK: la bestia colosal de un solo colmillo (mamut del desierto, de barro seco y arenisca) =================
// Mira hacia +z (al sur, al pueblo) con ry = 0. Su izquierda es +x: ahí está el MUÑÓN; el colmillo entero va a su derecha (−x).
// Medidas (parada): lomo ≈ 29,5 · cabeza ≈ 32 · ojo ≈ 25,5 · muñón ≈ 19 · patas de radio ≈ 3,6 con pie de 4,5 · trocha 12 · hombro–cadera 18,3.
// Marcha: cada +1 de `paso` es el apoyo de UNA pata (≈ 0,9 s: BESTIA_SEG_PASO). Apoyos: delantera derecha en paso 2, 6, 10…; trasera
// izquierda 3, 7…; delantera izquierda 4, 8…; trasera derecha 5, 9… (las traseras pisan la huella de la delantera de su lado).
// El cuerpo avanza bestiaAvance(paso, pasoFin): arranca despacio y en régimen hace ZANCADA (6,1) por paso; quien llama pone x, z con eso.
const BESTIA_SEG_PASO = .9, ZANCADA = 6.1;
const BAJADA = { pasos: 25.53, dist: 127 };   // de la cresta a la plaza pisando los 11 estanques: paso 0 → 25,53 (pasoFin), z = CRESTA[1] + bestiaAvance(paso, 25.53)
function bestiaAvance(p, pF = null) { const a = .648, p1 = 4.705, c = 14.35, base = q => q < p1 ? a * q * q : ZANCADA * q - c; p = Math.max(0, p); if (pF == null) return base(p);
  p = Math.min(p, pF); if (pF >= 2 * p1) return p <= pF - p1 ? base(p) : ZANCADA * pF - 2 * c - a * (pF - p) ** 2; const m = pF / 2; return p < m ? a * p * p : 2 * a * m * m - a * (pF - p) ** 2 }
const ONETUSK = (() => {
  const v3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), gs = (d, s) => Math.exp(-(d / s) * (d / s)), sst = (x, a, b) => { const q = cl((x - a) / (b - a)); return q * q * (3 - 2 * q) };
  const hsh = (x, y, z) => { const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return n - Math.floor(n) };
  const rui = (x, y, z) => { const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), f = q => q * q * (3 - 2 * q), fx = f(x - xi), fy = f(y - yi), fz = f(z - zi), L = (a, b, q) => a + (b - a) * q;
    return L(L(L(hsh(xi, yi, zi), hsh(xi + 1, yi, zi), fx), L(hsh(xi, yi + 1, zi), hsh(xi + 1, yi + 1, zi), fx), fy), L(L(hsh(xi, yi, zi + 1), hsh(xi + 1, yi, zi + 1), fx), L(hsh(xi, yi + 1, zi + 1), hsh(xi + 1, yi + 1, zi + 1), fx), fy), fz) };
  const fbm = (x, y, z) => rui(x, y, z) * .57 + rui(x * 2.1 + 7, y * 2.1 + 3, z * 2.1 + 5) * .29 + rui(x * 4.3 + 1, y * 4.3 + 9, z * 4.3 + 4) * .14 - .5;
  const malla = (geo, mat, par, sombra = true) => { const m = new THREE.Mesh(geo, mat); m.castShadow = sombra; m.receiveShadow = true; par.add(m); return m };
  // superficie paramétrica (u da la vuelta, v va a lo largo) con uv y normales sin costura
  function sup(nu, nv, fn, { cierra = true, uv = (u, v) => [u, 1 - v] } = {}) { const n = (nu + 1) * (nv + 1), pos = new Float32Array(n * 3), uvs = new Float32Array(n * 2), idx = [], p = v3();
    for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) { const k = j * (nu + 1) + i; fn(i / nu, j / nv, p); pos[k * 3] = p.x; pos[k * 3 + 1] = p.y; pos[k * 3 + 2] = p.z; const q = uv(i / nu, j / nv); uvs[k * 2] = q[0]; uvs[k * 2 + 1] = q[1] }
    for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { const a = j * (nu + 1) + i, b = a + 1, c = a + nu + 1, d = c + 1; idx.push(a, c, b, b, c, d) }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.BufferAttribute(uvs, 2)); g.setIndex(idx); g.computeVertexNormals();
    { g.computeBoundingSphere(); const c = g.boundingSphere.center, k = (nv >> 1) * (nu + 1) + (nu >> 2), nr = g.attributes.normal;   // que las caras miren hacia afuera
      if ((pos[k * 3] - c.x) * nr.getX(k) + (pos[k * 3 + 1] - c.y) * nr.getY(k) + (pos[k * 3 + 2] - c.z) * nr.getZ(k) < 0) { for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t } g.setIndex(idx); g.computeVertexNormals() } }
    if (cierra) { const nr = g.attributes.normal; for (let j = 0; j <= nv; j++) { const a = j * (nu + 1), b = a + nu, x = nr.getX(a) + nr.getX(b), y = nr.getY(a) + nr.getY(b), z = nr.getZ(a) + nr.getZ(b), l = Math.hypot(x, y, z) || 1; nr.setXYZ(a, x / l, y / l, z / l); nr.setXYZ(b, x / l, y / l, z / l) } }
    return g }

  // ---------- barro seco: placas poligonales que encajan (celdas de Voronoi recortadas), con grietas hondas entre ellas. Pinta color y relieve.
  const esquinas = (g, p) => { const n = p.length; g.beginPath(); for (let i = 0; i < n; i++) { const a = p[i], b = p[(i + 1) % n], c = p[(i + 2) % n], x1 = a[0] + (b[0] - a[0]) * .72, y1 = a[1] + (b[1] - a[1]) * .72, x2 = b[0] + (c[0] - b[0]) * .28, y2 = b[1] + (c[1] - b[1]) * .28; i ? g.lineTo(x1, y1) : g.moveTo(x1, y1); g.quadraticCurveTo(b[0], b[1], x2, y2) } g.closePath() };
  function barro(c, z, r, w, h, tam, pal, luz, gr = 1, alto = 85, mask = null, G = 80) { const grid = new Map(), S = [], K = (i, j) => i * 8192 + j;
    for (let fall = 0, tot = 0; fall < 2600 && tot < 400000; tot++) { const x = r() * w, y = r() * h; if (mask && mask(x, y) < .22 + r() * .5) continue; const s = tam(x, y) * (.55 + r() * 1.05), gi = x / G | 0, gj = y / G | 0, Rg = Math.min(6, Math.ceil(s * 1.6 / G)); let ok = true;
      for (let i = -Rg; i <= Rg && ok; i++) for (let j = -Rg; j <= Rg && ok; j++) { const b = grid.get(K(gi + i, gj + j)); if (b) for (const q of b) if ((q[0] - x) ** 2 + (q[1] - y) ** 2 < ((q[2] + s) * .5) ** 2) { ok = false; break } }
      if (!ok) { fall++; continue } fall = 0; const it = [x, y, s]; S.push(it); const k = K(gi, gj); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(it) }
    if (mask) for (const [x, y, s] of S) { const rad = s * 1.25, g = c.createRadialGradient(x, y, s * .3, x, y, rad); g.addColorStop(0, "rgba(150,128,100,.5)"); g.addColorStop(1, "rgba(150,128,100,0)"); c.fillStyle = g; c.fillRect(x - rad, y - rad, rad * 2, rad * 2) }   // el barro se funde con el cuero alrededor
    for (const it of S) { const [x, y, s] = it, a0 = r() * 6; let poly = Array.from({ length: 9 }, (_, i) => { const a = a0 + i / 9 * 6.2832 + r() * .4, d = s * (.6 + r() * .34); return [x + Math.cos(a) * d, y + Math.sin(a) * d] }); const gi = x / G | 0, gj = y / G | 0, R = Math.min(9, Math.ceil(s * 2.4 / G));
      for (let i = -R; i <= R; i++) for (let j = -R; j <= R; j++) { const b = grid.get(K(gi + i, gj + j)); if (!b) continue; for (const q of b) { if (q === it) continue; const nx = q[0] - x, ny = q[1] - y; if (nx * nx + ny * ny > (s * 2.6) ** 2) continue;
        const f = s / (s + q[2]), mx = x + nx * f, my = y + ny * f, out = []; for (let k = 0; k < poly.length; k++) { const a = poly[k], b2 = poly[(k + 1) % poly.length], da = (a[0] - mx) * nx + (a[1] - my) * ny, db = (b2[0] - mx) * nx + (b2[1] - my) * ny; if (da <= 0) out.push(a); if ((da < 0) !== (db < 0) && da !== db) { const t = da / (da - db); out.push([a[0] + (b2[0] - a[0]) * t, a[1] + (b2[1] - a[1]) * t]) } } poly = out; if (poly.length < 3) break } if (poly.length < 3) break }
      if (poly.length < 3) continue; let cx = 0, cy = 0; poly.forEach(q => { cx += q[0]; cy += q[1] }); cx /= poly.length; cy /= poly.length;
      for (const [g, col] of [[c, "rgba(58,43,30,.9)"], [z, "#2a2a2a"]]) { g.fillStyle = col; g.beginPath(); poly.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); g.fill() }   // la grieta: el fondo oscuro y hondo debajo de cada placa
      const gw = gr * (.5 + r() * 1.2 + Math.min(3, s * .02)), pts = poly.map(([px, py]) => { const dx = px - cx, dy = py - cy, d = Math.hypot(dx, dy) || 1, f = Math.max(.25, (d - gw * 1.25) / d); return [cx + dx * f + (r() - .5) * s * .08, cy + dy * f + (r() - .5) * s * .08] }), rad = s * .95;
      esquinas(c, pts); c.fillStyle = rgbj(pal[r() * pal.length | 0], r, 30); c.fill(); const g1 = c.createRadialGradient(cx - s * .2, cy - s * .25, 1, cx, cy, rad); g1.addColorStop(0, rgbj(luz, r, 16, .15 + r() * .3)); g1.addColorStop(.6, rgbj(luz, r, 16, 0)); g1.addColorStop(1, `rgba(52,36,22,${.12 + r() * .2})`); c.fillStyle = g1; c.fill();
      if (s > 70) { c.save(); esquinas(c, pts); c.clip(); for (let q = 0, n = 3 + s / 30; q < n; q++) { const bx = cx + (r() - .5) * s * 1.4, by = cy + (r() - .5) * s * 1.4, br = s * (.15 + r() * .4), gb = c.createRadialGradient(bx, by, 0, bx, by, br), cc = r() < .5 ? "96,70,46" : "236,220,188"; gb.addColorStop(0, `rgba(${cc},${.1 + r() * .2})`); gb.addColorStop(1, `rgba(${cc},0)`); c.fillStyle = gb; c.fillRect(bx - br, by - br, br * 2, br * 2) } c.restore() }
      esquinas(z, pts); const hv = 175 + r() * 70 | 0, lo = hv - alto * (.5 + r() * .5) | 0, g2 = z.createRadialGradient(cx, cy, rad * .3, cx, cy, rad); g2.addColorStop(0, `rgb(${hv},${hv},${hv})`); g2.addColorStop(.75, `rgb(${hv - 10},${hv - 10},${hv - 10})`); g2.addColorStop(1, `rgb(${lo},${lo},${lo})`); z.fillStyle = g2; z.fill();
      for (let q = 0, n = s > 60 ? 1 + (s / 36 | 0) : (s > 28 && r() < .5 ? 1 : 0); q < n; q++) { let px = cx + (r() - .5) * s * 1.3, py = cy + (r() - .5) * s * 1.3, a = r() * 6.28; const st = 6 + r() * 10; c.strokeStyle = `rgba(48,33,20,${.4 + r() * .35})`; c.lineWidth = .8 + r() * 1.6; z.strokeStyle = "rgba(0,0,0,.5)"; z.lineWidth = 2.4; c.beginPath(); z.beginPath(); c.moveTo(px, py); z.moveTo(px, py); for (let k = 0, m = 4 + s / 14; k < m; k++) { a += (r() - .5) * 1.2; px += Math.cos(a) * st; py += Math.sin(a) * st; if ((px - cx) ** 2 + (py - cy) ** 2 > (s * .5) ** 2) break; c.lineTo(px, py); z.lineTo(px, py) } c.stroke(); z.stroke() } } }
  // cuero viejo: fondo con manchas grandes de tono distinto y poros
  const cuero = (c, z, r, w, h, t) => { c.fillStyle = t[0]; c.fillRect(0, 0, w, h); z.fillStyle = "#6c6c6c"; z.fillRect(0, 0, w, h); const A = w * h / (2048 * 2048);
    manchas(c, r, 70 * A | 0, w, h, t[1], 120, 520, .15, .45); manchas(c, r, 70 * A | 0, w, h, t[2], 100, 460, .12, .4); manchas(c, r, 50 * A | 0, w, h, t[3], 80, 380, .1, .35); manchas(c, r, 240 * A | 0, w, h, t[1], 20, 110, .08, .25); manchas(c, r, 200 * A | 0, w, h, t[2], 20, 100, .06, .22);
    manchas(z, r, 160 * A | 0, w, h, "#ffffff", 30, 200, .03, .1); manchas(z, r, 160 * A | 0, w, h, "#000000", 30, 200, .03, .1);
    for (let k = 0, n = 26000 * A; k < n; k++) { const x = r() * w, y = r() * h, q = r() < .5; c.fillStyle = q ? "rgba(24,16,10,.22)" : "rgba(206,188,160,.16)"; c.fillRect(x, y, 1 + r() * 2, 1 + r() * 2); z.fillStyle = q ? "rgba(0,0,0,.25)" : "rgba(255,255,255,.15)"; z.fillRect(x, y, 2, 2) } };
  // arrugas: trazos largos a mano que siguen un campo de direcciones ang(x, y); surco oscuro y hondo con un filo claro al lado
  const arrugas = (c, z, r, w, h, n, ang, { L0 = 8, L1 = 40, paso = 12, a0 = .25, a1 = .6, g0 = 1, g1 = 3.5, dens = null, tuerce = .25, luz = .3 } = {}) => { c.lineCap = z.lineCap = "round"; c.lineJoin = z.lineJoin = "round";
    for (let k = 0; k < n; k++) { let x = r() * w, y = r() * h; if (dens && r() > dens(x, y)) continue; const N = L0 + r() * (L1 - L0) | 0, lw = g0 + Math.pow(r(), 2) * (g1 - g0), al = a0 + r() * (a1 - a0), pts = [[x, y]]; let wob = (r() - .5) * .6;
      for (let i = 0; i < N; i++) { wob += (r() - .5) * tuerce; wob *= .9; const a = ang(x, y) + wob; x += Math.cos(a) * paso; y += Math.sin(a) * paso; pts.push([x, y]) }
      const tr = (g, dx, dy) => { g.beginPath(); pts.forEach((q, i) => i ? g.lineTo(q[0] + dx, q[1] + dy) : g.moveTo(q[0] + dx, q[1] + dy)); g.stroke() };
      if (luz) { c.strokeStyle = `rgba(216,198,170,${al * luz})`; c.lineWidth = lw * .8 + .6; tr(c, -lw * .5 - .8, -lw * .8 - 1); z.strokeStyle = "rgba(255,255,255,.1)"; z.lineWidth = lw * 2 + 3; tr(z, -lw, -lw * 1.6 - 1.5) }
      c.strokeStyle = `rgba(30,21,14,${al})`; c.lineWidth = lw; tr(c, 0, 0); z.strokeStyle = `rgba(0,0,0,${.3 + al * .6})`; z.lineWidth = lw * 1.7 + 1.2; tr(z, 0, 0) } };
  const gastado = (c, z, r, x, y, rad) => { for (const [g, col] of [[c, `rgba(${126 + r() * 22 | 0},${106 + r() * 16 | 0},86,`], [z, "rgba(112,112,112,"]]) { const gr2 = g.createRadialGradient(x, y, 0, x, y, rad); gr2.addColorStop(0, col + (.3 + r() * .3) + ")"); gr2.addColorStop(1, col + "0)"); g.fillStyle = gr2; g.fillRect(x - rad, y - rad, rad * 2, rad * 2) } };
  const CUERO_T = ["#77675a", "#4c4036", "#94806a", "#86664c"];
  const onda = (gs2, w, y0, amp, f, ph, r, x0 = 0, x1 = w) => { for (const [g, col, lw, dy] of gs2) { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); for (let x = x0; x <= x1; x += 14) { const y = y0 + dy + Math.sin(x / w * 6.283 * f + ph) * amp + Math.sin(x * .031 + ph * 3) * amp * .3; x > x0 ? g.lineTo(x, y) : g.moveTo(x, y) } g.stroke() } };
  const motas = (c, r, n, w, h) => { for (let k = 0; k < n; k++) { c.fillStyle = r() < .5 ? `rgba(236,220,188,${.1 + r() * .22})` : `rgba(40,26,14,${.1 + r() * .25})`; c.beginPath(); c.arc(r() * w, r() * h, .7 + r() * 2.2, 0, 7); c.fill() } };
  const bordes = (z, w, h, mx, my) => { for (const [x0, x1] of [[0, mx], [w, w - mx]]) { const g = z.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, "rgba(96,96,96,1)"); g.addColorStop(.4, "rgba(96,96,96,.9)"); g.addColorStop(1, "rgba(96,96,96,0)"); z.fillStyle = g; z.fillRect(Math.min(x0, x1), 0, mx, h) }
    for (const [y0, y1] of [[0, my], [h, h - my]]) { const g = z.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, "rgba(96,96,96,1)"); g.addColorStop(.4, "rgba(96,96,96,.9)"); g.addColorStop(1, "rgba(96,96,96,0)"); z.fillStyle = g; z.fillRect(0, Math.min(y0, y1), w, my) } };
  const liquen = (c, z, r, x, y, tam2) => { const col = [[201, 146, 46], [186, 164, 60], [160, 170, 140], [216, 208, 172], [150, 120, 50]][r() * 5 | 0], n = 14 + r() * 40 | 0; for (let k = 0; k < n; k++) { const a = r() * 6.28, d = Math.pow(r(), .7) * tam2, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d * .8, rr = 2 + r() * (tam2 * .16);
    c.fillStyle = `rgba(${col[0] * .55 | 0},${col[1] * .55 | 0},${col[2] * .5 | 0},.55)`; c.beginPath(); c.arc(px, py, rr + 1.4, 0, 7); c.fill(); c.fillStyle = `rgba(${col[0] + (r() - .5) * 30 | 0},${col[1] + (r() - .5) * 30 | 0},${col[2]},${.6 + r() * .35})`; c.beginPath(); c.arc(px, py, rr, 0, 7); c.fill(); z.fillStyle = "rgba(255,255,255,.22)"; z.beginPath(); z.arc(px, py, rr, 0, 7); z.fill() } };
  const PIEL = ["#9c866a", "#8e7a5e", "#a89274", "#84705a", "#998468", "#ab9678", "#8a745a", "#a08a6c"], LUZ = "#c2ac88", FONDO_G = "#34261a";

  // ================= el cuerpo =================
  const CY0 = 19, LZ = 15.8, HOMBRO = 9.15, TROCHA = 6, PLG_Z = [5.6, 4.3, -4.6, -6, 12, -12.5];
  function cuerpoPt(u, v, o) { const a = u * 6.2832, th = v * Math.PI, zn = Math.cos(th), ro = Math.pow(Math.max(0, Math.sin(th)), .6), sa = Math.sin(a), ca = -Math.cos(a), z = zn * LZ - .2;
    const top = 26.9 + 2.9 * gs(zn - .36, .36) + .5 * gs(zn + .55, .2) - 1.7 * sst(-zn, .5, 1), bot = 12.7 + 1.1 * Math.max(0, zn) ** 2 + 3.4 * Math.pow(Math.max(0, -zn), 2.5);
    const cyc = (top + bot) / 2, hy = (top - bot) / 2, hw = 8.6 - 1.0 * zn * zn, sx = Math.sign(sa) * Math.pow(Math.abs(sa), .88), sy = Math.sign(ca) * Math.pow(Math.abs(ca), .88);
    let x = hw * ro * sx * (1 + .07 * Math.max(0, -ca)), y = cyc + hy * ro * sy; const lado = Math.sign(sa), as = Math.abs(sa);
    for (const zc of [HOMBRO, -HOMBRO]) x += lado * 1.25 * gs(z - zc, 5.2) * gs(ca + .25, .62) * as;                // hombros y caderas
    x -= lado * .6 * gs(z + 2.2, 2.6) * gs(ca - .3, .4) * as; x += lado * .13 * Math.sin(z * 1.7 + .5) * gs(z - 1, 5) * gs(ca, .5) * as;   // hueco del flanco y costillas
    if (ca > 0) y += gs(sa, .16) * (.3 + .2 * Math.sin(z * 2.3)) * ro;                                                 // espinazo con vértebras
    y -= .5 * gs(sa, .5) * gs(z, 6) * (ca < 0 ? 1 : 0);                                                                // panza que cuelga
    let k = 1; for (const zf of PLG_Z) k -= .034 * gs(z - zf - .6 * Math.sin(a * 2 + zf), .45);                       // pliegues que dan la vuelta
    k += fbm(x * .2, y * .2, z * .2) * .09 + fbm(x * .55 + 9, y * .55, z * .55) * .03;
    return o.set(x * k, cyc + (y - cyc) * k, z) }
  const cuerpoSup = (u, v, alto = 0) => { const p = cuerpoPt(u, v, v3()), a = cuerpoPt(u + .004, v, v3()).sub(p), b = cuerpoPt(u, v + .004, v3()).sub(p), n = a.cross(b).normalize(); if (n.y < 0 && u > .25 && u < .75) n.negate(); return { p: p.addScaledVector(n, alto), n } };
  const [T_CU_C, T_CU_H] = pintarDoble(4096, 2048, (c, z, w, h) => { const r = rng(2711), arr = x => 1 - Math.abs(x / w - .5) * 2, PLG = PLG_Z.map(zf => Math.acos(cl((zf + .2) / LZ, -1, 1)) / Math.PI * h);
    const yHom = Math.acos((HOMBRO + .2) / LZ) / Math.PI * h, yCad = Math.acos((-HOMBRO + .2) / LZ) / Math.PI * h;
    cuero(c, z, r, w, h, CUERO_T);
    const dir = (x, y) => (1 - sst(arr(x), .16, .36)) * Math.PI / 2 + fbm(x * .0022, y * .0022, 2) * 1.5;   // en la panza las arrugas corren a lo largo (cuelgan); en los costados caen de arriba abajo
    arrugas(c, z, r, w, h, 5600, dir, { L0: 12, L1: 66, g0: 1.2, g1: 4.6, a0: .3, a1: .7 });
    arrugas(c, z, r, w, h, 28000, (x, y) => dir(x, y) + (r() < .5 ? 1.05 : -1.05), { L0: 2, L1: 9, g0: .8, g1: 1.8, a0: .18, a1: .42, luz: 0 });
    for (let k = 0; k < 80; k++) gastado(c, z, r, w * (.5 + (r() < .5 ? -1 : 1) * (.17 + r() * .16)), h * (.18 + r() * .64), 60 + r() * 210);   // zonas lisas gastadas en los costados
    const zona = (x, y) => { const a = arr(x), n = fbm(x * .003, y * .003, 1); return sst(a + n * .7, .5, .72) + (n > -.12 ? .9 : 0) * gs(a - .4, .13) * Math.max(gs(y - yHom, 190), gs(y - yCad, 170)) };
    barro(c, z, r, w, h, (x, y) => 32 * Math.pow(9, cl(fbm(x * .0032, y * .0032, 9) * 1.1 + .55)), PIEL, LUZ, 1, 85, zona);   // barro rajado solo en lomo, hombros y caderas: placas de 0,3 a 4 unidades
    for (let x = 0; x < w; x += 30 + r() * 90) { const bw = 20 + r() * 80; c.fillStyle = r() < .5 ? `rgba(150,84,44,${.05 + r() * .09})` : `rgba(238,222,190,${.04 + r() * .08})`; c.beginPath(); c.moveTo(x, 0); for (let y = 0; y <= h; y += 64) c.lineTo(x + Math.sin(y * .004 + x) * 26, y); for (let y = h; y >= 0; y -= 64) c.lineTo(x + bw + Math.sin(y * .005 + x * 2) * 26, y); c.fill() }   // vetas de arenisca
    manchas(c, r, 110, w, h, "#6e4f32", 60, 320, .05, .18); manchas(c, r, 80, w, h, "#ecd9b0", 60, 300, .04, .14);
    for (const [x0, x1] of [[0, w * .22], [w, w * .78]]) { const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, "rgba(26,17,10,.85)"); g.addColorStop(.55, "rgba(30,20,12,.4)"); g.addColorStop(1, "rgba(34,22,12,0)"); c.fillStyle = g; c.fillRect(Math.min(x0, x1), 0, w * .22, h) }
    PLG.forEach(py => { const amp = 12 + r() * 16, f = 2, ph = r() * 6; onda([[c, "rgba(226,206,170,.18)", 12, -10], [z, "rgba(255,255,255,.18)", 16, -10], [c, "rgba(30,20,12,.7)", 6 + r() * 5, 0], [z, "#000", 14, 0]], w, py, amp, f, ph, r) });
    for (let k = 0; k < 560; k++) { const y0 = r() < .6 ? PLG[r() * PLG.length | 0] + (r() - .5) * 260 : r() * h, x0 = r() * w, L = 70 + r() * 320, ph = r() * 9; onda([[c, "rgba(36,24,14,.5)", 1.5 + r() * 3, 0], [z, "rgba(0,0,0,.5)", 4 + r() * 3, 0], [c, "rgba(230,212,176,.2)", 2, -4]], w, y0, 3 + r() * 5, 6 + r() * 6, ph, r, x0, x0 + L) }
    // 60 años quieto: arena acumulada en el lomo, que chorrea por los costados
    for (let k = 0; k < 420; k++) { const x = w * .5 + (r() + r() + r() - 1.5) * w * .2, y = h * (.06 + r() * .88), rad = 30 + r() * 150, al = .12 + r() * .3; const g = c.createRadialGradient(x, y, 0, x, y, rad); g.addColorStop(0, `rgba(228,208,168,${al})`); g.addColorStop(1, "rgba(228,208,168,0)"); c.fillStyle = g; c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
      const g2 = z.createRadialGradient(x, y, 0, x, y, rad); g2.addColorStop(0, "rgba(215,215,215,.16)"); g2.addColorStop(1, "rgba(215,215,215,0)"); z.fillStyle = g2; z.fillRect(x - rad, y - rad, rad * 2, rad * 2) }
    for (let k = 0; k < 230; k++) { const d = r() < .5 ? -1 : 1, y0 = h * (.05 + r() * .9); let x = w * .5 + d * r() * w * .12, y = y0; const L = 260 + r() * 1000; c.strokeStyle = r() < .75 ? `rgba(232,214,176,${.06 + r() * .13})` : `rgba(50,34,20,${.06 + r() * .1})`; c.lineWidth = 4 + r() * 22; c.lineCap = "round"; c.beginPath(); c.moveTo(x, y); for (let q = 0; q < L; q += 40) { x += d * 40; y += (r() - .5) * 14; c.lineTo(x, y) } c.stroke() }
    for (let k = 0; k < 9000; k++) { const x = w * .5 + (r() + r() - 1) * w * .22, y = r() * h; c.fillStyle = `rgba(240,224,190,${.15 + r() * .3})`; c.beginPath(); c.arc(x, y, .8 + r() * 2.2, 0, 7); c.fill() }
    for (let k = 0; k < 95; k++) { const a = r() < .5 ? -1 : 1; liquen(c, z, r, w * .5 + a * w * (.06 + r() * .2), h * (.08 + r() * .84), 18 + r() * 46) }
    motas(c, r, 14000, w, h); bordes(z, w, h, 70, 90) });
  const M_CUERPO = new THREE.MeshStandardMaterial({ map: T_CU_C, displacementMap: T_CU_H, displacementScale: .26, displacementBias: -.15, bumpMap: T_CU_H, bumpScale: 5.5, roughness: .95 });

  // ================= la cabeza (con el cuello adentro del cuerpo) =================
  const A3 = v3(0, -.5, .866), E1 = v3(0, -.866, -.5), E2 = v3(1, 0, 0), RXc = 5.3, RYc = 6.3, RZc = 5.5;
  const cabDir = (u, v, o) => { const th = v * Math.PI, ph = u * 6.2832, s = Math.sin(th); return o.set(0, 0, 0).addScaledVector(E1, s * Math.cos(ph)).addScaledVector(E2, s * Math.sin(ph)).addScaledVector(A3, Math.cos(th)) };
  const cabUV = d => { const th = Math.acos(cl(d.dot(A3), -1, 1)); let ph = Math.atan2(d.dot(E2), d.dot(E1)); if (ph < 0) ph += 6.2832; return [ph / 6.2832, th / Math.PI] };
  const OJO_DB = s => v3(s * .80, .12, .585).normalize(), NU = (x, y, z) => { const l = Math.hypot(x, y, z); return [x / l, y / l, z / l] };
  const F_DOMO = NU(0, .92, .38), F_DOMO2 = NU(.38, .86, .33), F_FRENTE = NU(0, .45, .89), F_SIEN = NU(.86, .42, .28), F_CEJA = NU(.74, .38, .56), F_BOLSA = NU(.8, -.12, .585), F_POMULO = NU(.9, -.25, .36), F_OJO = OJO_DB(1).toArray();
  function cabPt(d, o) { const ax = Math.abs(d.x), D = f => Math.hypot(ax - f[0], d.y - f[1], d.z - f[2]); let k = 1;
    k += .13 * gs(D(F_DOMO), .55) + .05 * gs(D(F_DOMO2), .22) + .1 * gs(D(F_FRENTE), .4) - .075 * gs(D(F_SIEN), .24);
    k -= .085 * gs(D(F_OJO), .105); k += .07 * gs(D(F_CEJA), .14) + .035 * gs(D(F_BOLSA), .12) + .06 * gs(D(F_POMULO), .3);
    k += .62 * gs(Math.hypot(d.x, d.y + .5, d.z - .866), .42);                                                         // arranque de la trompa
    const nz = Math.max(0, -d.z); if (nz > .15) k -= .028 * (.5 + .5 * Math.sin(nz * 26 + d.x * 2)) * sst(nz, .15, .4);  // pliegues del cuello
    k += fbm(d.x * 2.3 + 3, d.y * 2.3, d.z * 2.3) * .06;
    return o.set(d.x * RXc * k * (1 + .34 * nz), d.y * RYc * k * (1 - .12 * nz) - 1.6 * nz, d.z * RZc * k * (1 + 1.1 * nz)) }
  const [T_CA_C, T_CA_H] = pintarDoble(4096, 2048, (c, z, w, h) => { const r = rng(2712), uvp = d => { const q = cabUV(d.clone().normalize()); return [q[0] * w, q[1] * h] }, OJ = [-1, 1].map(s => uvp(OJO_DB(s)));
    const dv = v3(), OR = [-1, 1].map(s => uvp(v3(s * .85, .3, -.25)));
    cuero(c, z, r, w, h, CUERO_T);
    const dir = (x, y) => { for (const [ox, oy] of OJ) if (Math.hypot(x - ox, y - oy) < 340) return Math.atan2(y - oy, x - ox) + fbm(x * .01, y * .01, 3) * .5; for (const [ox, oy] of OR) if (Math.hypot(x - ox, y - oy) < 400) return Math.atan2(y - oy, x - ox) + fbm(x * .008, y * .008, 3) * .7; return (y < h * .27 || y > h * .6) ? fbm(x * .003, y * .003, 4) * .6 : fbm(x * .002, y * .002, 5) * 3 };   // radiales en el ojo y en la base de la oreja; anillos en la trompa y el cuello
    arrugas(c, z, r, w, h, 5600, dir, { L0: 8, L1: 46, g0: 1.2, g1: 4.2, a0: .3, a1: .7 });
    arrugas(c, z, r, w, h, 24000, (x, y) => dir(x, y) + (r() < .5 ? 1.05 : -1.05), { L0: 2, L1: 8, g0: .8, g1: 1.8, a0: .18, a1: .42, luz: 0 });
    for (let k = 0; k < 30; k++) { const [x, y] = uvp(v3((r() < .5 ? -1 : 1) * (.7 + r() * .3), -.5 + r() * .5, .1 + r() * .5)); gastado(c, z, r, x, y, 60 + r() * 160) }
    const zona = (x, y) => { const d = cabDir(x / w, y / h, dv); return Math.min(...OJ.map(([ox, oy]) => Math.hypot(x - ox, y - oy))) < 270 ? 0 : sst(d.y + fbm(x * .003, y * .003, 6) * .6 - Math.max(0, -d.z) * .5, .28, .6) };
    barro(c, z, r, w, h, (x, y) => 30 * Math.pow(8, cl(fbm(x * .004, y * .004, 8) * 1.1 + .55)), PIEL, LUZ, 1, 85, zona);
    manchas(c, r, 80, w, h, "#6e4f32", 50, 260, .05, .18); manchas(c, r, 60, w, h, "#ecd9b0", 50, 260, .04, .14);
    for (let y = 26; y < h * .23; y += 20 + r() * 26) onda([[c, "rgba(226,206,170,.28)", 9, -8], [z, "rgba(255,255,255,.2)", 12, -8], [c, "rgba(30,20,12,.8)", 6 + r() * 5, 0], [z, "#000", 12, 0]], w, y, 4 + r() * 6, 3 + (r() * 3 | 0), r() * 6, r);      // anillos del arranque de la trompa
    for (let y = h * .64; y < h * .97; y += 34 + r() * 50) onda([[c, "rgba(226,206,170,.25)", 14, -11], [z, "rgba(255,255,255,.2)", 18, -11], [c, "rgba(30,20,12,.85)", 9 + r() * 7, 0], [z, "#000", 16, 0]], w, y, 10 + r() * 14, 2 + (r() * 2 | 0), r() * 6, r);   // pliegues del cuello
    for (let k = 0; k < 420; k++) { const y0 = r() * h, x0 = r() * w, L = 50 + r() * 220; onda([[c, "rgba(36,24,14,.5)", 1.5 + r() * 2.5, 0], [z, "rgba(0,0,0,.5)", 4, 0]], w, y0, 3 + r() * 4, 8 + r() * 8, r() * 9, r, x0, x0 + L) }
    OJ.forEach(([x, y]) => { const g1 = c.createRadialGradient(x, y, 0, x, y, 250); g1.addColorStop(0, "rgba(26,16,10,.9)"); g1.addColorStop(.4, "rgba(44,30,20,.55)"); g1.addColorStop(1, "rgba(44,30,20,0)"); c.fillStyle = g1; c.fillRect(x - 250, y - 250, 500, 500);
      for (let q = 62; q < 118; q += 16 + r() * 10) { const pts = Array.from({ length: 16 }, (_, i) => { const a = i / 16 * 6.28; return [x + Math.cos(a) * q * 1.3 * (.9 + r() * .2), y + Math.sin(a) * q * (.9 + r() * .2)] }); for (const [g, col, lw] of [[c, `rgba(22,14,8,${.6 - q / 700})`, 2.5 + r() * 4], [z, "rgba(0,0,0,.7)", 6 + r() * 4]]) { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); pts.forEach((p, i) => { const b = pts[(i + 1) % 16]; i ? 0 : g.moveTo((p[0] + b[0]) / 2, (p[1] + b[1]) / 2); const n = pts[(i + 2) % 16]; g.quadraticCurveTo(b[0], b[1], (b[0] + n[0]) / 2, (b[1] + n[1]) / 2) }); g.stroke() } }
      for (let k = 0; k < 9; k++) { let px = x + (r() - .5) * 90, py = y + 80 + r() * 40; c.strokeStyle = `rgba(24,14,8,${.25 + r() * .3})`; c.lineWidth = 6 + r() * 16; c.lineCap = "round"; c.beginPath(); c.moveTo(px, py); for (let q = 0; q < 9; q++) { px += (r() - .5) * 26; py += 22 + r() * 22; c.lineTo(px, py) } c.stroke() } });   // lagrimal: mancha oscura que baja
    { const [x, y] = uvp(v3(0, .95, .3)); for (let k = 0; k < 160; k++) { const px = x + (r() + r() - 1) * 700, py = y + (r() + r() - 1) * 330, rad = 30 + r() * 120, g = c.createRadialGradient(px, py, 0, px, py, rad); g.addColorStop(0, `rgba(214,194,156,${.06 + r() * .14})`); g.addColorStop(1, "rgba(214,194,156,0)"); c.fillStyle = g; c.fillRect(px - rad, py - rad, rad * 2, rad * 2) }
      for (let k = 0; k < 26; k++) liquen(c, z, r, x + (r() + r() - 1) * 900, y + (r() + r() - 1) * 380, 14 + r() * 34) }
    motas(c, r, 12000, w, h); bordes(z, w, h, 60, 70) });
  const M_CABEZA = new THREE.MeshStandardMaterial({ map: T_CA_C, displacementMap: T_CA_H, displacementScale: .14, displacementBias: -.08, bumpMap: T_CA_H, bumpScale: 5, roughness: .95 });

  // ================= patas (4 franjas de la misma tela: muslo y caña, delanteras y traseras) =================
  const [T_PA_C, T_PA_H] = pintarDoble(2048, 4096, (c, z, w, h) => { const r = rng(2713), B = h / 4, fr = y => (y % B) / B, bd = y => y / B | 0, arruga = y => { const q = fr(y), b = bd(y) % 2; return b ? Math.max(gs(q - .06, .16), gs(q - .9, .12)) : gs(q - .86, .16) };
    cuero(c, z, r, w, h, CUERO_T); const dir = (x, y) => fbm(x * .003, y * .004, 2) * .55;
    arrugas(c, z, r, w, h, 12000, dir, { L0: 10, L1: 70, g0: 1.2, g1: 4.4, a0: .3, a1: .7, dens: (x, y) => .3 + .7 * arruga(y) });
    arrugas(c, z, r, w, h, 24000, (x, y) => dir(x, y) + (r() < .5 ? 1.1 : -1.1), { L0: 2, L1: 8, g0: .8, g1: 1.7, a0: .18, a1: .4, luz: 0 });
    for (let b = 0; b < 4; b++) for (let k = 0; k < 9; k++) gastado(c, z, r, w * (.75 + (r() - .5) * .2), b * B + (b % 2 ? B * (.02 + r() * .12) : B * (.86 + r() * .12)), 80 + r() * 150);   // rodillas lisas, gastadas
    const zona = (x, y) => { const n = fbm(x * .004, y * .004, 3); return bd(y) % 2 ? sst(n, .3, .46) * .5 : sst(n, .14, .36) * .9 };
    barro(c, z, r, w, h, (x, y) => 28 * Math.pow(7, cl(fbm(x * .005, y * .005, 8) * 1.1 + .55)), PIEL, LUZ, 1, 85, zona);
    manchas(c, r, 50, w, h, "#6e4f32", 40, 200, .05, .18); manchas(c, r, 40, w, h, "#ecd9b0", 40, 200, .04, .14);
    for (let y = 0; y < h; y += 8 + r() * 16) { const a = arruga(y); if (r() > a * 1.2 + .06) continue; const x0 = r() * w, L = 160 + r() * 800; onda([[c, "rgba(226,206,170,.14)", 5, -5], [z, "rgba(255,255,255,.16)", 7, -5], [c, "rgba(30,20,12,.55)", 1.5 + a * 3 + r() * 2, 0], [z, "rgba(0,0,0,.8)", 5 + a * 4, 0]], w, y, 3 + r() * 6, 2 + (r() * 4 | 0), r() * 6, r, x0, x0 + L) }
    for (const b of [1, 3]) { const g = c.createLinearGradient(0, b * B + B * .45, 0, b * B + B); g.addColorStop(0, "rgba(228,208,168,0)"); g.addColorStop(1, "rgba(228,208,168,.5)"); c.fillStyle = g; c.fillRect(0, b * B + B * .45, w, B * .55) }
    for (const b of [0, 2]) { const g = c.createLinearGradient(0, b * B, 0, b * B + B * .5); g.addColorStop(0, "rgba(34,22,12,.5)"); g.addColorStop(1, "rgba(34,22,12,0)"); c.fillStyle = g; c.fillRect(0, b * B, w, B * .5) }
    for (let k = 0; k < 20; k++) liquen(c, z, r, r() * w, r() * h, 10 + r() * 22); motas(c, r, 7000, w, h); bordes(z, w, h, 40, 1) });
  const M_PATA = new THREE.MeshStandardMaterial({ map: T_PA_C, displacementMap: T_PA_H, displacementScale: .14, displacementBias: -.08, bumpMap: T_PA_H, bumpScale: 5, roughness: .95 });
  const M_PATA_L = new THREE.MeshStandardMaterial({ map: T_PA_C, bumpMap: T_PA_H, bumpScale: 3.6, roughness: .95 });
  const [T_PIE_C, T_PIE_H] = pintarDoble(1024, 256, (c, z, w, h) => { const r = rng(2714); cuero(c, z, r, w, h, CUERO_T); arrugas(c, z, r, w, h, 900, (x, y) => fbm(x * .01, y * .01, 1) * .5, { L0: 6, L1: 30 });
    for (let k = 0; k < 90; k++) { let x = r() * w, y = h * (.3 + r() * .3); for (const [g, col, lw] of [[c, "rgba(30,20,12,.7)", 1.5 + r() * 2.5], [z, "rgba(0,0,0,.7)", 4]]) { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.moveTo(x, y); let px = x, py = y; for (let q = 0; q < 7; q++) { px += (r() - .5) * 12; py += 14 + r() * 12; g.lineTo(px, py) } g.stroke() } }
    const g = c.createLinearGradient(0, h * .2, 0, h); g.addColorStop(0, "rgba(228,208,168,.1)"); g.addColorStop(1, "rgba(232,214,178,.7)"); c.fillStyle = g; c.fillRect(0, 0, w, h); motas(c, r, 2500, w, h); bordes(z, w, h, 30, 1) });
  const M_PIE = new THREE.MeshStandardMaterial({ map: T_PIE_C, bumpMap: T_PIE_H, bumpScale: 3.4, roughness: 1 });
  const T_UNA = tex(256, 256, (g, w, h) => { const r = rng(2715), gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#8a7350"); gr.addColorStop(.25, "#d6c59c"); gr.addColorStop(1, "#b9a57a"); g.fillStyle = gr; g.fillRect(0, 0, w, h); for (let k = 0; k < 150; k++) { const x = r() * w; g.strokeStyle = r() < .5 ? "rgba(70,50,30,.35)" : "rgba(255,246,220,.3)"; g.lineWidth = 1 + r() * 2.5; g.beginPath(); g.moveTo(x, r() * h * .4); g.lineTo(x + (r() - .5) * 14, h); g.stroke() } for (let k = 0; k < 8; k++) { g.strokeStyle = "rgba(50,34,20,.7)"; g.lineWidth = 2; let x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); for (let q = 0; q < 5; q++) { x += (r() - .5) * 20; y += 12 + r() * 16; g.lineTo(x, y) } g.stroke() } });
  const M_UNA = new THREE.MeshStandardMaterial({ map: T_UNA, bumpMap: T_UNA, bumpScale: 1.5, roughness: .5 }), M_PLANTA = SM("#3a2c20", { roughness: 1 });
  const L1 = 8.3, L2 = 7.4, TOB = 1.9, LMAX = L1 + L2 - .15, CAD_Y = 17.2;
  const geoMuslo = (b, esp, del) => sup(56, 40, (u, v, o) => { const a = (esp ? 1 - u : u) * 6.2832 + (esp ? 0 : Math.PI), y = lerp(3.4, -L1 - .4, v); let rr = lerp(4.7, 3.82, sst(-y, -2, L1)); if (y > 0) rr *= Math.sqrt(Math.max(0, 1 - (y / 3.5) ** 2));
    rr *= 1 + .028 * Math.sin(y * 4.6 + 1.2 * Math.sin(a * 2 + b)) * sst(-y, 3.5, 7) + fbm(Math.cos(a) * 1.3 + b * 7, y * .35, Math.sin(a) * 1.3) * .1; const bz = del ? 0 : .5 * gs(y + 2.5, 3);
    return o.set(Math.cos(a) * rr, y, Math.sin(a) * rr * 1.1 - bz * (Math.sin(a) < 0 ? 1.4 : .2)) }, { uv: (u, v) => [u, 1 - (b + v) / 4] });
  const geoCana = (b, esp, del) => sup(56, 40, (u, v, o) => { const a = (esp ? 1 - u : u) * 6.2832 + (esp ? 0 : Math.PI), y = lerp(3.0, -L2 - .5, v); let rr = 3.88 - .42 * sst(-y, .5, 3.8) + .46 * sst(-y, 4.4, L2 + .4); if (y > 0) rr *= Math.sqrt(Math.max(0, 1 - (y / 3.05) ** 2));
    rr *= 1 + .03 * Math.sin(y * 5 + 1.3 * Math.sin(a * 2 + b)) * (gs(y + 1.4, 1.5) + gs(y + L2 - .6, 1.4)) + fbm(Math.cos(a) * 1.3 + b * 5, y * .35, Math.sin(a) * 1.3) * .09;
    return o.set(Math.cos(a) * rr, y, Math.sin(a) * rr + .55 * gs(y, 1.7) * Math.max(0, Math.sin(a))) }, { uv: (u, v) => [u, 1 - (b + v) / 4] });
  const geoPie = (b) => sup(64, 14, (u, v, o) => { const a = u * 6.2832 - Math.PI / 2, y = lerp(.9, -TOB, v), q = sst(-y, -.9, TOB); let rr = lerp(3.86, 4.5, Math.pow(q, .8)) * (1 + .02 * Math.sin(a * 5 + b)); if (v > .93) rr *= .97;
    return o.set(Math.cos(a) * rr, y, Math.sin(a) * rr * 1.04 + .35 * q) });
  const GEO_UNA = (() => { const g = new THREE.SphereGeometry(1, 20, 14, 0, Math.PI * 2, 0, Math.PI * .62); g.scale(.95, 1.5, .5); return g })();

  // ================= trompa: tubo anillado que se recalcula en cada cuadro siguiendo una cadena de puntos =================
  const [T_TR_C, T_TR_H] = pintarDoble(1024, 2048, (c, z, w, h) => { const r = rng(2716); cuero(c, z, r, w, h, CUERO_T); const dir = (x, y) => fbm(x * .004, y * .004, 2) * .35;
    arrugas(c, z, r, w, h, 5200, dir, { L0: 8, L1: 50, g0: 1, g1: 3.6, a0: .3, a1: .65 }); arrugas(c, z, r, w, h, 9000, (x, y) => dir(x, y) + (r() < .5 ? 1.2 : -1.2), { L0: 2, L1: 6, g0: .7, g1: 1.5, a0: .18, a1: .4, luz: 0 });
    barro(c, z, r, w, h, (x, y) => 12 * Math.pow(8, cl(fbm(x * .006, y * .006, 8) * 1.5 + .5)), PIEL, LUZ, .8, 70, (x, y) => sst(fbm(x * .005, y * .003, 5) - y / h * .25, .12, .32) * (Math.abs(x / w - .5) < .3 ? 1 : 0));
    for (const [x0, x1] of [[0, w * .16], [w, w * .84]]) { const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, "rgba(222,196,160,.6)"); g.addColorStop(1, "rgba(222,196,160,0)"); c.fillStyle = g; c.fillRect(Math.min(x0, x1), 0, w * .16, h) }
    for (let y = 8; y < h; y += lerp(40, 22, y / h) * (.6 + r() * .8)) { const parc = r() < .3, x0 = parc ? r() * w : 0, L = parc ? 200 + r() * 500 : w; onda([[c, "rgba(230,210,176,.2)", 6, -6], [z, "rgba(255,255,255,.3)", 10, -7], [c, "rgba(28,18,10,.6)", 2.5 + r() * 3.5, 0], [z, "#000", 9 + r() * 4, 0]], w, y, 2 + r() * 4, 2 + (r() * 3 | 0), r() * 6, r, x0, x0 + L) }
    for (let k = 0; k < 700; k++) { const x = r() < .5 ? r() * w * .16 : w - r() * w * .16, y = r() * h; c.strokeStyle = "rgba(60,40,26,.5)"; c.lineWidth = 1.5 + r() * 2; z.strokeStyle = "rgba(0,0,0,.5)"; z.lineWidth = 3; for (const g of [c, z]) { g.beginPath(); g.moveTo(x - 30 - r() * 40, y); g.lineTo(x + 30 + r() * 40, y + (r() - .5) * 6); g.stroke() } }
    const g = c.createLinearGradient(0, h * .9, 0, h); g.addColorStop(0, "rgba(150,110,96,0)"); g.addColorStop(1, "rgba(150,110,96,.55)"); c.fillStyle = g; c.fillRect(0, h * .9, w, h * .1); motas(c, r, 6000, w, h) });
  const M_TROMPA = new THREE.MeshStandardMaterial({ map: T_TR_C, bumpMap: T_TR_H, bumpScale: 4.5, roughness: .93 });
  const TN = 56, TRS = 26, TNS = 168, TR_L = 23, TR0 = v3(0, -4.0, 6.0), TRD = v3(0, -.62, .78).normalize(), TRU = v3(0, -.78, -.62).normalize();
  const radT = s => lerp(2.42, .9, Math.pow(s, .82)) * (1 + .034 * Math.sin(s * 178 + 1.3 * Math.sin(s * 41))) * (1 + .04 * gs(s - .985, .02));

  // ================= orejas: una hoja con el borde rasgado (transparencia), venas y bordes despigmentados =================
  const [T_OR_C, T_OR_H] = pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(2717); c.clearRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
    const lienzo = mk(w, h), c2 = lienzo.getContext("2d"), z2 = mk(w, h).getContext("2d"); cuero(c2, z2, r, w, h, CUERO_T); { const rad = (x, y) => Math.atan2(y - 440, x + 60) + fbm(x * .006, y * .006, 2) * .5; arrugas(c2, z2, r, w, h, 1700, rad, { L0: 8, L1: 40, g0: 1, g1: 3.4 }); arrugas(c2, z2, r, w, h, 5000, (x, y) => rad(x, y) + (r() < .5 ? 1.1 : -1.1), { L0: 2, L1: 7, g0: .7, g1: 1.5, a0: .18, a1: .4, luz: 0 }); barro(c2, z2, r, w, h, (x, y) => 12 * Math.pow(7, cl(fbm(x * .006, y * .006, 8) * 1.5 + .5)), PIEL, LUZ, .7, 60, (x, y) => sst(fbm(x * .005, y * .005, 4), .12, .3) * sst(x, 80, 380) * .8) } z.globalAlpha = .6; z.drawImage(z2.canvas, 0, 0); z.globalAlpha = 1;
    const cont = [[30, 150], [150, 60], [330, 22], [540, 30], [740, 90], [900, 210], [985, 380], [990, 560], [930, 720], [820, 850], [690, 950], [560, 1000], [450, 985], [360, 900], [260, 800], [150, 740], [40, 700]], pts = [];
    cont.forEach((a, i) => { const b = cont[(i + 1) % cont.length], libre = i >= 1 && i <= 14; for (let q = 0; q < 1; q += .125) { const jx = libre ? (r() - .5) * 46 : 0, jy = libre ? (r() - .5) * 46 : 0; pts.push([a[0] + (b[0] - a[0]) * q + jx, a[1] + (b[1] - a[1]) * q + jy]) } });
    c.fillStyle = "#000"; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); c.fill();
    c.globalCompositeOperation = "destination-out";   // rasgaduras en V, muescas y agujeros
    for (const [i, prof, an] of [[30, 150, 26], [44, 90, 20], [58, 200, 30], [70, 120, 22], [84, 170, 26], [96, 80, 18], [22, 70, 16], [108, 60, 16], [37, 60, 12], [51, 110, 14], [64, 70, 12], [77, 90, 16], [90, 130, 14], [102, 50, 12], [15, 50, 12]]) { const p = pts[i], dx = 470 - p[0], dy = 470 - p[1], d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d; c.beginPath(); c.moveTo(p[0] - uy * an - ux * 30, p[1] + ux * an - uy * 30); c.quadraticCurveTo(p[0] + ux * prof * .5 + uy * 6, p[1] + uy * prof * .5 - ux * 6, p[0] + ux * prof, p[1] + uy * prof); c.quadraticCurveTo(p[0] + ux * prof * .4 - uy * 4, p[1] + uy * prof * .4 + ux * 4, p[0] + uy * an - ux * 30, p[1] - ux * an - uy * 30); c.closePath(); c.fill() }
    for (const [x, y, a, b] of [[760, 420, 26, 40], [620, 800, 30, 20], [820, 640, 14, 18], [480, 150, 16, 12]]) { c.beginPath(); c.ellipse(x, y, a, b, r() * 3, 0, 7); c.fill() }
    c.globalCompositeOperation = "source-in"; c.drawImage(lienzo, 0, 0); c.globalCompositeOperation = "source-atop";
    manchas(c, r, 40, w, h, "#6e4f32", 40, 200, .08, .25);
    for (let k = 0; k < 260; k++) { const p = pts[8 + (r() * 104 | 0)], d = r() * 110, dx = 470 - p[0], dy = 470 - p[1], l = Math.hypot(dx, dy), x = p[0] + dx / l * d, y = p[1] + dy / l * d, rad = 14 + r() * 46, g = c.createRadialGradient(x, y, 0, x, y, rad); g.addColorStop(0, `rgba(216,168,140,${.25 + r() * .35})`); g.addColorStop(1, "rgba(216,168,140,0)"); c.fillStyle = g; c.fillRect(x - rad, y - rad, rad * 2, rad * 2) }   // borde despigmentado
    const vena = (x, y, a, L, wd, n) => { for (const [g, col, lw] of [[c, `rgba(58,30,22,${.35 + wd * .05})`, wd], [z, "rgba(255,255,255,.95)", wd * 1.5 + 3]]) { g.strokeStyle = col; g.lineWidth = lw; g.lineCap = "round" } c.beginPath(); z.beginPath(); c.moveTo(x, y); z.moveTo(x, y); const hijos = []; for (let q = 0; q < 8; q++) { a += (r() - .5) * .35; x += Math.cos(a) * L / 8; y += Math.sin(a) * L / 8; c.lineTo(x, y); z.lineTo(x, y); if (n > 0 && q > 1 && r() < .55) hijos.push([x, y, a + (r() < .5 ? -1 : 1) * (.4 + r() * .5)]) } c.stroke(); z.stroke(); hijos.forEach(([hx2, hy2, ha]) => vena(hx2, hy2, ha, L * .6, wd * .62, n - 1)) };
    for (let k = 0; k < 9; k++) vena(40 + r() * 30, 180 + k * 62, -.75 + k * .2 + (r() - .5) * .2, 520 + r() * 260, 9, 3);
    for (let k = 0; k < 60; k++) { const y0 = 100 + r() * 800, x0 = r() * 200; onda([[c, "rgba(30,20,12,.4)", 2 + r() * 3, 0], [z, "rgba(0,0,0,.5)", 5, 0]], w, y0, 6, 3, r() * 6, r, x0, x0 + 100 + r() * 300) }
    motas(c, r, 3000, w, h); c.globalCompositeOperation = "source-over" });
  const M_OREJA = new THREE.MeshStandardMaterial({ map: T_OR_C, bumpMap: T_OR_H, bumpScale: 6, roughness: .92, side: THREE.DoubleSide, alphaTest: .5 });
  const OR_W = 12.6, OR_H = 17.4;

  // ================= ojos =================
  const T_IRIS_O = tex(1024, 512, (g, w, h) => { const r = rng(2718), yP = h * .07, yI = h * .21; g.fillStyle = "#3a2218"; g.fillRect(0, 0, w, h); manchas(g, r, 40, w, h, "#5a3424", 30, 160, .2, .5); manchas(g, r, 20, w, h, "#1a0e08", 30, 160, .2, .4);
    for (let k = 0; k < 70; k++) { let x = r() * w, y = yI + 10 + r() * h * .5; g.strokeStyle = `rgba(120,30,24,${.25 + r() * .3})`; g.lineWidth = 1 + r() * 2; g.beginPath(); g.moveTo(x, y); for (let q = 0; q < 8; q++) { x += (r() - .5) * 30; y += (r() - .3) * 26; g.lineTo(x, y) } g.stroke() }
    const gr = g.createLinearGradient(0, yP, 0, yI); gr.addColorStop(0, "#3a1c08"); gr.addColorStop(.25, "#8a5216"); gr.addColorStop(.6, "#b9802a"); gr.addColorStop(.86, "#7a4c16"); gr.addColorStop(1, "#1e1008"); g.fillStyle = gr; g.fillRect(0, yP - 4, w, yI - yP + 4);
    for (let k = 0; k < 900; k++) { const x = r() * w, y0 = yP + r() * (yI - yP) * .35, y1 = y0 + (yI - yP) * (.3 + r() * .6); g.strokeStyle = r() < .55 ? `rgba(255,${196 + r() * 50 | 0},${96 + r() * 70 | 0},${.14 + r() * .32})` : `rgba(70,${30 + r() * 24 | 0},6,${.16 + r() * .32})`; g.lineWidth = 1 + r() * 3.2; g.beginPath(); g.moveTo(x, y0); g.quadraticCurveTo(x + (r() - .5) * 14, (y0 + y1) / 2, x + (r() - .5) * 10, Math.min(yI - 3, y1)); g.stroke() }
    for (let k = 0; k < 46; k++) { g.fillStyle = "rgba(56,24,6,.45)"; g.beginPath(); g.ellipse(r() * w, yP + (yI - yP) * (.35 + r() * .5), 4 + r() * 12, 2 + r() * 4, 0, 0, 7); g.fill() }
    for (let k = 0; k < 120; k++) { const x = r() * w; g.strokeStyle = "rgba(255,226,150,.5)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, yP + 2); g.lineTo(x + (r() - .5) * 8, yP + 8 + r() * 12); g.stroke() }
    g.fillStyle = "rgba(14,8,4,.9)"; g.fillRect(0, yI - 7, w, 12); g.fillStyle = "#040302"; g.fillRect(0, 0, w, yP) });
  const T_PARP = tex(1024, 512, (g, w, h) => { const r = rng(2719); g.fillStyle = "#9c8060"; g.fillRect(0, 0, w, h); manchas(g, r, 50, w, h, "#4a3424", 20, 120, .12, .32); manchas(g, r, 30, w, h, "#c6aa84", 20, 100, .1, .25);
    for (let y = 6; y < h; y += 7 + r() * 13) { g.strokeStyle = `rgba(28,18,10,${.45 + r() * .35})`; g.lineWidth = 1.5 + r() * 3.5; g.beginPath(); for (let x = 0; x <= w; x += 16) { const yy = y + Math.sin(x * .02 + y) * 5 + (r() - .5) * 3; x ? g.lineTo(x, yy) : g.moveTo(x, yy) } g.stroke(); g.strokeStyle = "rgba(228,206,170,.22)"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, y + 4); g.lineTo(w, y + 4 + (r() - .5) * 6); g.stroke() }
    const gr = g.createLinearGradient(0, h * .72, 0, h); gr.addColorStop(0, "rgba(26,14,8,0)"); gr.addColorStop(1, "rgba(26,14,8,.75)"); g.fillStyle = gr; g.fillRect(0, h * .72, w, h * .28) });
  const M_PARP = new THREE.MeshStandardMaterial({ map: T_PARP, bumpMap: T_PARP, bumpScale: 2.6, roughness: .8, side: THREE.DoubleSide });
  const OJO_R = 1.0;
  function hacerOjo(par, s, pos, nrm) { const G = new THREE.Group(); par.add(G); G.position.copy(pos); const zA = nrm.clone().normalize(), xA = v3(0, 1, 0).cross(zA).normalize(), yA = zA.clone().cross(xA); G.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xA, yA, zA));
    const gb = new THREE.SphereGeometry(OJO_R, 56, 36); gb.rotateX(Math.PI / 2); malla(gb, new THREE.MeshStandardMaterial({ map: T_IRIS_O, roughness: .22 }), G, false);
    const co = new THREE.Mesh(new THREE.SphereGeometry(OJO_R * 1.035, 40, 28), new THREE.MeshPhysicalMaterial({ color: "#ffffff", transparent: true, opacity: .15, roughness: .02, clearcoat: 1, clearcoatRoughness: 0, depthWrite: false })); G.add(co);
    for (const [dx, dy, rr] of [[-.3, .34, .15], [.2, -.12, .055], [-.1, .46, .045]]) { const b = new THREE.Mesh(new THREE.SphereGeometry(rr, 12, 8), new THREE.MeshBasicMaterial({ color: "#fffdf2" })); b.position.set(dx * s, dy, Math.sqrt(Math.max(.01, 1.04 - dx * dx - dy * dy)) * OJO_R); b.scale.z = .35; G.add(b) }
    const gl = new THREE.SphereGeometry(OJO_R * 1.1, 48, 20, 0, Math.PI * 2, 0, Math.PI / 2), sup2 = malla(gl, M_PARP, G, false), infP = new THREE.Group(), inf = malla(new THREE.SphereGeometry(OJO_R * 1.075, 48, 20, 0, Math.PI * 2, 0, Math.PI / 2), M_PARP, infP, false); inf.rotation.z = Math.PI; G.add(infP);
    const labio = new THREE.MeshPhysicalMaterial({ color: "#3a2a20", roughness: .45, clearcoat: .6, clearcoatRoughness: .3 });
    { const a = new THREE.Mesh(new THREE.TorusGeometry(OJO_R * 1.1, .075, 10, 72), labio); a.rotation.x = Math.PI / 2; sup2.add(a); const b = new THREE.Mesh(new THREE.TorusGeometry(OJO_R * 1.075, .06, 10, 72), labio); b.rotation.x = Math.PI / 2; inf.add(b) }
    const r = rng(2720 + s), pes = [], mp = SM("#1c120c", { roughness: .6 });   // pestañas largas
    for (let k = 0; k < 22; k++) { const a = Math.PI * (.14 + .72 * (k + r() * .5) / 22), L = .5 + r() * .42, g = new THREE.ConeGeometry(.028, L, 4); g.translate(0, L / 2, 0); const d = v3(Math.cos(a) * .55, -.5 - r() * .2, Math.sin(a) * .9 + .2); pes.push([g, MZ(v3(Math.cos(a) * OJO_R * 1.1, -.02, Math.sin(a) * OJO_R * 1.1), d, v3(1, 1, 1))]) }
    malla(mergeG(pes), mp, sup2, false);
    const orb = sup(64, 20, (u, v, o) => { const a = u * 6.2832, b = v * 6.2832, k = 1 + .07 * Math.sin(a * 9 + s) * Math.sin(b) + .05 * Math.sin(a * 23), rr = .46 * k; return o.set(Math.cos(a) * (1.22 + Math.cos(b) * rr), Math.sin(a) * (1.0 + Math.cos(b) * rr * .96) + (Math.sin(a) > 0 ? .08 * Math.sin(a) : 0), -.02 + Math.sin(b) * .4 + (Math.sin(a) > 0 ? .14 * Math.sin(a) : 0) - .22 * Math.max(0, Math.cos(a) * s) ) }, { uv: (u, v) => [u * 2, v] }); T_PARP.wrapS = T_PARP.wrapT = THREE.RepeatWrapping; const om = malla(orb, M_PARP, G, false); om.scale.x = s;
    const lag = new THREE.Mesh(new THREE.SphereGeometry(.2, 14, 10), new THREE.MeshPhysicalMaterial({ color: "#5a3028", roughness: .2, clearcoat: 1 })); lag.position.set(-.8 * s, -.2, .58); G.add(lag);
    return { G, sup: sup2, infP } }

  // ================= armado =================
  const G = new THREE.Group(); scene.add(G); G.visible = false;
  const cuerpo = new THREE.Group(); G.add(cuerpo); cuerpo.position.y = CY0; const cu0 = new THREE.Group(); cu0.position.y = -CY0; cuerpo.add(cu0);
  malla(sup(288, 176, cuerpoPt), M_CUERPO, cu0);
  // --- patas
  const CADERAS = [[TROCHA, HOMBRO], [-TROCHA, HOMBRO], [TROCHA, -HOMBRO], [-TROCHA, -HOMBRO]];   // 0 del. izq · 1 del. der · 2 tras. izq · 3 tras. der
  const patas = CADERAS.map(([x, z], i) => { const del = z > 0, esp = x < 0, b = del ? 0 : 2, mus = new THREE.Group(), can = new THREE.Group(), pie = new THREE.Group(); G.add(mus, can, pie);
    malla(geoMuslo(b, esp, del), M_PATA, mus); malla(geoCana(b + 1, esp, del), M_PATA, can); malla(geoPie(i), M_PIE, pie); const pl = malla(new THREE.CircleGeometry(4.4, 40), M_PLANTA, pie, false); pl.rotation.x = Math.PI / 2; pl.position.set(0, -TOB + .02, .35);
    const n = del ? 5 : 4; for (let k = 0; k < n; k++) { const a = Math.PI / 2 + (k - (n - 1) / 2) * (del ? .44 : .5), u = malla(GEO_UNA, M_UNA, pie); u.position.set(Math.cos(a) * 4.22, -TOB + .05, Math.sin(a) * 4.22 * 1.04 + .35); u.rotation.set(0, Math.PI / 2 - a, 0); u.rotateX(.2); u.scale.setScalar(.92 + .12 * Math.cos((k - (n - 1) / 2) * 1.2)) }
    return { mus, can, pie, cad: v3(x, CAD_Y, z), del, lado: Math.sign(x), suelo: v3() } });
  // --- cuello y cabeza
  const cuello = new THREE.Group(); cuello.position.set(0, 23.5, 12.5); cu0.add(cuello); const cabeza = new THREE.Group(); cabeza.position.set(0, 1.5, 6.5); cuello.add(cabeza);
  { const d = v3(); malla(sup(224, 144, (u, v, o) => cabPt(cabDir(u, v, d), o)), M_CABEZA, cabeza) }
  const ojos = [1, -1].map(s => { const n = OJO_DB(s), p = cabPt(n, v3()); return hacerOjo(cabeza, s, p.addScaledVector(n, -.42), v3(n.x, n.y + .02, n.z + .12)) });   // ojos[0] = el del lado del muñón (+x)
  // --- boca: labio de abajo en punta, debajo del arranque de la trompa
  { const g = sup(40, 24, (u, v, o) => { const a = u * 6.2832, th = v * Math.PI, s = Math.sin(th), q = Math.cos(th); return o.set(Math.cos(a) * s * 2.0 * (1 - .35 * Math.max(0, q)), Math.sin(a) * s * 1.25 + .3 * q * q, q * 2.9) }, { uv: (u, v) => [.2 + u * .25, .3 + v * .12] });
    const m = malla(g, M_PATA_L, cabeza); m.position.set(0, -6.15, 2.5); m.rotation.x = .78; const bo = malla(new THREE.SphereGeometry(1, 24, 16), SM("#2a1612", { roughness: .6 }), cabeza, false); bo.scale.set(1.7, .5, 1.9); bo.position.set(0, -5.45, 3.0); bo.rotation.x = .78 }
  // --- colmillos: el entero a su derecha (−x), el muñón a su izquierda (+x); los dos salen de una vaina de piel
  const CU = colmilloCurva(COLMILLO_L), TAN0 = CU.getTangentAt(0), U_M = .08, P_M = CU.getPointAt(U_M), TAN_M = CU.getTangentAt(U_M), dip = t => Math.atan2(-t.y, t.z);
  const montura = s => { const g = new THREE.Group(); g.rotation.order = "YXZ"; g.position.set(s * 3.75, -4.3, 4.0); g.rotation.set(.35, s * .17, 0); cabeza.add(g);
    const nA = v3(1, 0, 0), bA = TAN0.clone().cross(nA).normalize(); malla(sup(40, 14, (u, v, o) => { const a = u * 6.2832, q = lerp(-2.6, .55, v), rr = lerp(2.25, 1.74, sst(v, 0, 1)) * (1 + .05 * gs(v - .93, .06) + .03 * Math.sin(v * 22 + Math.sin(a * 3))) * (v > .985 ? .93 : 1); return o.copy(TAN0).multiplyScalar(q).addScaledVector(nA, Math.cos(a) * rr).addScaledVector(bA, Math.sin(a) * rr) }, { uv: (u, v) => [u, 1 - (1.02 + v * .2) / 4] }), M_PATA_L, g); return g };
  const monD = montura(-1), monI = montura(1); const GEO_COL = geoColmillo(COLMILLO_L, 1.5); malla(GEO_COL, M_MARFIL, monD);
  malla(geoColmillo(COLMILLO_L, 1.5, { hasta: U_M }), M_MARFIL, monI);
  const corte = malla(new THREE.CircleGeometry(1.435, 48), M_CORTE_MARFIL, monI, false); corte.position.copy(P_M).addScaledVector(TAN_M, .012); corte.quaternion.setFromUnitVectors(v3(0, 0, 1), TAN_M);
  { const an = malla(new THREE.TorusGeometry(1.42, .045, 8, 48), SM("#6a4a2c", { roughness: .9 }), monI, false); an.position.copy(P_M); an.quaternion.copy(corte.quaternion) }
  const col2 = new THREE.Group(); monI.add(col2); malla(GEO_COL, M_MARFIL, col2); col2.visible = false; { const cb = malla(new THREE.CircleGeometry(1.5, 48), M_CORTE_MARFIL, col2, false); cb.quaternion.setFromUnitVectors(v3(0, 0, 1), TAN0.clone().negate()); cb.position.addScaledVector(TAN0, -.004) }
  // --- orejas
  const GEO_OREJA = sup(40, 44, (u, v, o) => { const X = u * OR_W, Y = lerp(4.4, 4.4 - OR_H, v); return o.set(X, Y, -1.5 * Math.sin(u * 2.6) * (.6 + .4 * v) + .35 * Math.sin(Y * .9 + X * .7) * u + .25 * Math.sin(X * 1.7 + Y * .4) * u * u) }, { cierra: false, uv: (u, v) => [u, 1 - v] });
  const orejas = [1, -1].map(s => { const piv = new THREE.Group(); piv.position.set(s * 4.5, 2.3, -1.5); cabeza.add(piv); const esp = new THREE.Group(); esp.scale.x = s; piv.add(esp); const giro = new THREE.Group(); esp.add(giro); const ga = GEO_OREJA.clone(), gb = GEO_OREJA.clone(), ma = malla(ga, M_OREJA, giro), mb = malla(gb, M_OREJA, giro); ma.frustumCulled = mb.frustumCulled = false; return { giro, s, ga, gb, base: GEO_OREJA.attributes.position.array } });
  const doblarOreja = (o, b1, b2, b3) => { const B = o.base, pa = o.ga.attributes.position, pb = o.gb.attributes.position, m = (X, X1) => X < X1 ? 0 : (X - X1) ** 2 / (X - X1 + 1.4); for (let i = 0; i < pa.count; i++) { const X = B[i * 3], Y = B[i * 3 + 1], u = X / OR_W, zz = B[i * 3 + 2] - b1 * m(X, 3.2) - b2 * m(X, 7.4) - b3 * m(-Y, 3.5) * u, gr = .08 + .34 * Math.pow(Math.max(0, 1 - u), .8) * (1 - .5 * Math.abs(Y + 4) / 13); pa.setXYZ(i, X, Y, zz); pb.setXYZ(i, X - .04, Y, zz - gr) } pa.needsUpdate = pb.needsUpdate = true; o.ga.computeVertexNormals(); o.gb.computeVertexNormals() };
  // --- trompa
  const trompaG = new THREE.BufferGeometry(); { const n = (TNS + 1) * (TRS + 1), uv = new Float32Array(n * 2), idx = []; for (let i = 0; i <= TNS; i++) for (let j = 0; j <= TRS; j++) { const k = i * (TRS + 1) + j; uv[k * 2] = j / TRS; uv[k * 2 + 1] = 1 - i / TNS }
    for (let i = 0; i < TNS; i++) for (let j = 0; j < TRS; j++) { const a = i * (TRS + 1) + j, b = a + TRS + 1; idx.push(a, a + 1, b, b, a + 1, b + 1) }
    trompaG.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3)); trompaG.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(n * 3), 3)); trompaG.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); trompaG.setIndex(idx) }
  const trompaM = malla(trompaG, M_TROMPA, G); trompaM.frustumCulled = false;
  const punta = (() => { const NU2 = 32, NV2 = 18, ad = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b))), largo = a => .5 + .95 * gs(ad(a, Math.PI / 2), .5) + .42 * gs(ad(a, -Math.PI / 2), .6), col = [];
    const g = sup(NU2, NV2, (u, v, o) => { const a = u * 6.2832, Lg = largo(a), dedo = gs(ad(a, Math.PI / 2), .5); if (v < .45) { const q = v / .45, rr = 1 - (.16 + .2 * dedo) * q * q; return o.set(Math.cos(a) * rr, Math.sin(a) * rr + .12 * dedo * q, Lg * q) }
      const q = cl((v - .45) / .55), rr = (1 - (.16 + .2 * dedo)) * (1 - q) * .96, x = Math.cos(a) * rr, y = Math.sin(a) * rr + .12 * dedo * (1 - q); return o.set(x, y, Lg * Math.pow(1 - q, 1.6) - .5 * q - .55 * q * (gs(Math.hypot(x - .3, y + .05), .2) + gs(Math.hypot(x + .3, y + .05), .2))) }, { uv: (u, v) => [u, .03 + .02 * (1 - v)] });
    for (let j = 0; j <= NV2; j++) for (let i = 0; i <= NU2; i++) { const v = j / NV2, q = cl((v - .45) / .55), p = g.attributes.position, k = j * (NU2 + 1) + i, x = p.getX(k), y = p.getY(k), nar = gs(Math.hypot(x - .3, y + .05), .2) + gs(Math.hypot(x + .3, y + .05), .2), c0 = (v < .45 ? 1 : lerp(.95, .62, q)) * (1 - .8 * Math.min(1, nar) * q); col.push(c0, c0 * (v < .45 ? 1 : .86), c0 * (v < .45 ? 1 : .8)) }
    g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); const mt = M_TROMPA.clone(); mt.vertexColors = true; mt.side = THREE.DoubleSide; const m = malla(g, mt, G, false); m.matrixAutoUpdate = false; m.frustumCulled = false; return m })();
  const polvoCh = [];
  // --- cola
  const colaP = new THREE.Group(); colaP.position.set(0, 23.6, -15.2); cu0.add(colaP); { const g = sup(16, 24, (u, v, o) => { const a = u * 6.2832, rr = lerp(.95, .28, Math.pow(v, .7)) * (1 + .05 * Math.sin(v * 50)); return o.set(Math.cos(a) * rr, -v * 11, Math.sin(a) * rr - .9 * Math.sin(v * 1.5)) }, { uv: (u, v) => [u * .3, 1 - (1.1 + v * .6) / 4] }); malla(g, M_PATA_L, colaP);
    const r = rng(2722), pel = []; for (let k = 0; k < 60; k++) { const L = 1.2 + r() * 1.8, g2 = new THREE.ConeGeometry(.05, L, 4); g2.translate(0, L / 2, 0); pel.push([g2, MZ(v3((r() - .5) * .4, -10.2 - r() * .9, -.9 + (r() - .5) * .4), v3((r() - .5) * .7, -1, (r() - .5) * .7), v3(1, 1, 1))]) } malla(mergeG(pel), SM("#2a1e14", { roughness: 1 }), colaP) }

  // ================= 60 años quieto: arena, piedras, matas secas, arbolitos muertos y nidos sobre el lomo =================
  const lomo = new THREE.Group(); cu0.add(lomo);
  const T_AR = (() => { const [c, z] = pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(2723); c.fillStyle = "#dcc59a"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h); manchas(c, r, 60, w, h, "#b89868", 40, 200, .08, .25); manchas(c, r, 50, w, h, "#f2e2bc", 40, 200, .08, .22);
      for (let y = 0; y < h; y += 9 + r() * 12) onda([[c, "rgba(150,120,80,.35)", 3 + r() * 3, 0], [z, "rgba(40,40,40,.5)", 6, 0], [c, "rgba(255,244,214,.35)", 3, -5], [z, "rgba(230,230,230,.5)", 5, -5]], w, y, 6 + r() * 8, 2 + (r() * 3 | 0), r() * 6, r);
      for (let k = 0; k < 9000; k++) { c.fillStyle = r() < .5 ? "rgba(120,96,60,.35)" : "rgba(255,246,220,.4)"; c.fillRect(r() * w, r() * h, 1.5, 1.5) } for (let k = 0; k < 120; k++) { c.fillStyle = rgbj("#8a7458", r, 30); c.beginPath(); c.ellipse(r() * w, r() * h, 2 + r() * 5, 2 + r() * 4, r() * 3, 0, 7); c.fill() } }); return { c, z } })();
  const M_ARENA = new THREE.MeshStandardMaterial({ color: "#ddd0b4", map: T_AR.c, bumpMap: T_AR.z, bumpScale: 3, roughness: 1 });
  const AR_NU = 96, AR_NV = 84, arenaBase = new Float32Array((AR_NU + 1) * (AR_NV + 1) * 3), arenaNor = new Float32Array((AR_NU + 1) * (AR_NV + 1) * 3), arenaAlt = new Float32Array((AR_NU + 1) * (AR_NV + 1));
  const altoArena = (u, v) => { const du = (u - .5) / .2, dv = (v - .5) / .36, borde = 1 - Math.pow(du * du + dv * dv, 1.1) + fbm(u * 26, v * 14, 3) * 1.0 + fbm(u * 80, v * 44, 5) * .5; return sst(borde, 0, .8) * (.45 + 1.25 * (.5 + fbm(u * 15 + 4, v * 9, 7)) + .9 * gs(v - .56, .1) * gs(du, .7)) * (1 - .55 * gs(v - .39, .06)) };
  const arenaGeo = sup(AR_NU, AR_NV, (u, v, o) => { const U = lerp(.29, .71, u), Vv = lerp(.12, .88, v), s = cuerpoSup(U, Vv), k = (Math.round(v * AR_NV)) * (AR_NU + 1) + Math.round(u * AR_NU), al = altoArena(U, Vv); arenaBase.set([s.p.x, s.p.y, s.p.z], k * 3); arenaNor.set([s.n.x * .5, s.n.y * .5 + .5, s.n.z * .5], k * 3); arenaAlt[k] = al; return o.copy(s.p) }, { cierra: false, uv: (u, v) => [u * 2, v * 3] });
  T_AR.c.wrapS = T_AR.c.wrapT = T_AR.z.wrapS = T_AR.z.wrapT = THREE.RepeatWrapping; const arenaM = malla(arenaGeo, M_ARENA, lomo); let arenaK = -1;
  function ponerArena(k) { if (Math.abs(k - arenaK) < .004) return; arenaK = k; const p = arenaGeo.attributes.position; for (let i = 0; i < arenaAlt.length; i++) { const a = arenaAlt[i] * k, h = a > .012 ? a + .2 : -.5; p.setXYZ(i, arenaBase[i * 3] + arenaNor[i * 3] * h, arenaBase[i * 3 + 1] + arenaNor[i * 3 + 1] * h, arenaBase[i * 3 + 2] + arenaNor[i * 3 + 2] * h) } p.needsUpdate = true; arenaGeo.computeVertexNormals() }
  ponerArena(1);
  { const r = rng(2724), enLomo = (u, v, hund = .15) => { const s = cuerpoSup(u, v); return s.p.addScaledVector(s.n, altoArena(u, v) * .9 + .25 - hund) };
    // piedras
    const T_PI = tex(512, 512, (g, w, h) => { const r2 = rng(2725); g.fillStyle = "#a08a6c"; g.fillRect(0, 0, w, h); manchas(g, r2, 60, w, h, "#6a5640", 20, 110, .15, .4); manchas(g, r2, 50, w, h, "#d2bc94", 20, 100, .12, .35); grietas(g, r2, 26, w, h, "rgba(40,28,18,.6)"); for (let k = 0; k < 14; k++) { const x = r2() * w, y = r2() * h; for (let q = 0; q < 26; q++) { g.fillStyle = r2() < .5 ? "rgba(201,146,46,.8)" : "rgba(170,180,150,.8)"; g.beginPath(); g.arc(x + (r2() - .5) * 60, y + (r2() - .5) * 50, 2 + r2() * 7, 0, 7); g.fill() } } });
    const pied = []; for (let k = 0; k < 22; k++) { const u = .5 + (r() - .5) * .3, v = .16 + r() * .68, s = .35 + Math.pow(r(), 2) * 1.5, g = new THREE.SphereGeometry(1, 14, 10), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), q = 1 + fbm(x * 1.3 + k * 9, y * 1.3, z * 1.3) * .7; p.setXYZ(i, x * q, Math.max(-.45, y * q * .75), z * q) } g.computeVertexNormals(); pied.push([g, new THREE.Matrix4().compose(enLomo(u, v, .1), new THREE.Quaternion().setFromEuler(new THREE.Euler(r() * .5, r() * 6, r() * .5)), v3(s * (1 + r() * .5), s, s * (1 + r() * .4)))]) }
    malla(mergeG(pied), new THREE.MeshStandardMaterial({ map: T_PI, bumpMap: T_PI, bumpScale: 2.5, roughness: 1 }), lomo);
    // matas secas (dos tonos de paja)
    const paja = [[], []]; for (let k = 0; k < 46; k++) { const u = .5 + (r() - .5) * .34, v = .14 + r() * .74, base = enLomo(u, v, .2), n = 10 + r() * 14 | 0, alto = .9 + r() * 1.6; for (let q = 0; q < n; q++) { const L = alto * (.5 + r() * .7), g = new THREE.ConeGeometry(.045 + r() * .03, L, 4, 3); g.translate(0, L / 2, 0); const p = g.attributes.position, cur = (r() - .5) * .9; for (let i = 0; i < p.count; i++) p.setX(i, p.getX(i) + cur * (p.getY(i) / L) ** 2 * L * .4); const d = v3((r() - .5) * 1.5, 1, (r() - .5) * 1.5); paja[q % 2].push([g, MZ(base.clone().add(v3((r() - .5) * .35, 0, (r() - .5) * .35)), d, v3(1, 1, 1))]) } }
    malla(mergeG(paja[0]), SM("#c9ae6a", { roughness: 1 }), lomo); malla(mergeG(paja[1]), SM("#9c8450", { roughness: 1 }), lomo);
    // arbolitos muertos
    const T_MAD = tex(256, 512, (g, w, h) => { const r2 = rng(2726); g.fillStyle = "#8f7f6a"; g.fillRect(0, 0, w, h); for (let k = 0; k < 260; k++) { const x = r2() * w; g.strokeStyle = r2() < .5 ? "rgba(50,40,30,.45)" : "rgba(230,220,200,.35)"; g.lineWidth = 1 + r2() * 3; g.beginPath(); g.moveTo(x, r2() * h); g.bezierCurveTo(x + 8, h * .3, x - 8, h * .6, x + (r2() - .5) * 20, h); g.stroke() } manchas(g, r2, 20, w, h, "#3a2e22", 10, 60, .2, .5) });
    const M_MAD = new THREE.MeshStandardMaterial({ map: T_MAD, bumpMap: T_MAD, bumpScale: 2, roughness: .95 }), ram = [];
    const rama = (p0, dir, L, r0, d) => { const N = 5; let p = p0.clone(), v = dir.clone().normalize(); for (let k = 0; k < N; k++) { const q0 = k / N, q1 = (k + 1) / N, seg = L / N, g = new THREE.CylinderGeometry(r0 * (1 - q1 * .6), r0 * (1 - q0 * .6), seg * 1.06, d < 2 ? 9 : 6, 1); g.translate(0, seg / 2, 0); ram.push([g, MZ(p, v, v3(1, 1, 1))]); p = p.clone().addScaledVector(v, seg); v = v.clone().add(v3((r() - .5) * .5, (r() - .3) * .25, (r() - .5) * .5)).normalize();
        if (d < 3 && k >= 1 && r() < (d ? .6 : .85)) rama(p, v.clone().add(v3((r() - .5) * 2, .5 + r() * .5, (r() - .5) * 2)).normalize(), L * (.45 + r() * .25), r0 * (1 - q1 * .6) * .65, d + 1) } };
    const ARB = [[.485, .37, 7.2, .42, v3(.12, 1, -.1)], [.53, .64, 4.8, .3, v3(-.2, 1, .15)]]; ARB.forEach(([u, v, L, r0, d]) => rama(enLomo(u, v, .5), d, L, r0, 0)); malla(mergeG(ram), M_MAD, lomo);
    // nidos: uno en el lomo, otro en la horqueta del árbol grande
    const nid = [], hue = []; const nido = (c, R) => { for (let k = 0; k < 150; k++) { const a = r() * 6.283, rr = R * (.55 + r() * .5), L = .5 + r() * .9, g = new THREE.CylinderGeometry(.03, .04, L, 4); nid.push([g, MZ(c.clone().add(v3(Math.cos(a) * rr, (r() - .2) * .4 * (rr / R), Math.sin(a) * rr)), v3(-Math.sin(a) + (r() - .5) * .8, (r() - .5) * .7, Math.cos(a) + (r() - .5) * .8), v3(1, 1, 1))]) }
      for (let k = 0; k < 3; k++) { const g = new THREE.SphereGeometry(.2, 14, 10); g.scale(1, 1.3, 1); hue.push([g, new THREE.Matrix4().compose(c.clone().add(v3(Math.cos(k * 2.1) * .2, .05, Math.sin(k * 2.1) * .2)), new THREE.Quaternion().setFromEuler(new THREE.Euler(1.2, k, .4)), v3(1, 1, 1))]) } };
    nido(enLomo(.47, .52, 0).add(v3(0, .15, 0)), .95); nido(enLomo(ARB[0][0], ARB[0][1], .5).add(v3(.5, 3.3, -.3)), .7); malla(mergeG(nid), SM("#6e5a3c", { roughness: 1 }), lomo); malla(mergeG(hue), SM("#e8e2d0", { roughness: .5 }), lomo) }

  // ================= efectos: polvo de las pisadas y arena que cae del lomo =================
  const FX = new THREE.Group(); scene.add(FX); FX.visible = false;
  const T_NUBE = (() => { const c = mk(256, 256), g = c.getContext("2d"), r = rng(2727); for (let k = 0; k < 46; k++) { const a = r() * 6.28, d = Math.pow(r(), .8) * 62, x = 128 + Math.cos(a) * d, y = 128 + Math.sin(a) * d, rad = 22 + r() * 44, gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, `rgba(255,255,255,${.1 + r() * .16})`); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2) } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t })();
  const NPUF = 9, NEV = 2, pufs = Array.from({ length: 4 * NEV * NPUF }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: T_NUBE, color: i % 3 ? "#d8c29a" : "#c4aa80", transparent: true, opacity: 0, depthWrite: false })); s.visible = false; FX.add(s); return s });
  const NGR = 70, granosG = new THREE.BufferGeometry(); granosG.setAttribute("position", new THREE.BufferAttribute(new Float32Array(4 * NEV * NGR * 3), 3)); const granos = new THREE.Points(granosG, new THREE.PointsMaterial({ map: GLOW, color: "#cdb48a", size: .55, transparent: true, opacity: .9, depthWrite: false, sizeAttenuation: true })); granos.frustumCulled = false; FX.add(granos);
  // arena del lomo: chorros en los bordes (granos que caen en bucle) y velos
  const CH = (() => { const r = rng(2728), L = []; for (let k = 0; k < 18; k++) { const lado = k % 2 ? 1 : -1, v = .2 + r() * .62, s = cuerpoSup(.5 + lado * (.19 + r() * .04), v, .3); L.push({ p: s.p, lado, t0: .12 + r() * 1.5, dur: 2.3 + r() * 1.2, an: 1.6 + r() * 3.2, f: .6 + r() * .6 }) } return L })();
  const NCH = 300, chorG = new THREE.BufferGeometry(); chorG.setAttribute("position", new THREE.BufferAttribute(new Float32Array(CH.length * NCH * 3), 3)); const chorros = new THREE.Points(chorG, new THREE.PointsMaterial({ map: GLOW, color: "#f4e2b8", size: 1.05, transparent: true, opacity: .95, depthWrite: false, sizeAttenuation: true })); chorros.frustumCulled = false; G.add(chorros);
  const velos = CH.map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: T_NUBE, color: "#e0caa0", transparent: true, opacity: 0, depthWrite: false })); s.visible = false; G.add(s); return s });
  CH.forEach(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: T_NUBE, color: "#dcc8a0", transparent: true, opacity: 0, depthWrite: false })); s.visible = false; G.add(s); polvoCh.push(s) });
  const RCH = (() => { const r = rng(2729); return Float32Array.from({ length: CH.length * NCH * 3 }, () => r()) })();

  return { G, cuerpo, cu0, cuello, cabeza, patas, ojos, orejas, doblarOreja, polvoCh, monD, monI, col2, corte, trompaG, trompaM, punta, colaP, lomo, arenaM, ponerArena, FX, pufs, granos, granosG, NPUF, NEV, NGR, CH, NCH, chorros, chorG, velos, RCH,
    CY0, HOMBRO, TROCHA, L1, L2, TOB, LMAX, TN, TRS, TNS, TR_L, TR0, TRD, TRU, radT, CU, TAN0, P_M, TAN_M, dip, v3, gs, sst, cuerpoSup, est: { paso: 0, pasoFin: null, golpes: [] } } })();

// ---------- arena del lomo y colmillo suelto (el cuerno devuelto), para las escenas
const ARENA_LOMO = { malla: ONETUSK.arenaM, chorros: ONETUSK.chorros, velos: ONETUSK.velos, poner: ONETUSK.ponerArena };
const COLMILLO_SUELTO = (() => { const g = new THREE.Group(), O = ONETUSK, m = new THREE.Mesh(O.col2.children[0].geometry, M_MARFIL); m.castShadow = m.receiveShadow = true; g.add(m);
  const c = new THREE.Mesh(new THREE.CircleGeometry(1.5, 48), M_CORTE_MARFIL); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), O.TAN0.clone().negate()); c.position.addScaledVector(O.TAN0, -.004); g.add(c); g.visible = false; scene.add(g); return g })();

// ---------- la marcha: dónde está cada pata en función de `paso` (sin memoria: cualquier cuadro se puede pedir suelto)
const B_SW = 1.6, B_P0 = [4, 2, 3, 5], B_AH = 7.8;
function _bApoyo(i, n, pF) { const O = ONETUSK, pL = B_P0[i] + 4 * n, hz = i < 2 ? O.HOMBRO : -O.HOMBRO, dL = bestiaAvance(pL, pF), cad = dL + hz;
  if (pF != null && pL + 4 > pF) return Math.min(bestiaAvance(pF, pF) + hz, cad + B_AH);            // último apoyo de esa pata: debajo de la cadera final
  const k = i === 1 ? 2 * n : i === 0 ? 2 * n + 1 : i === 2 ? 2 * n - 1 : 2 * n, g = 14 + 12.2 * k; if (g - cad >= .8 && g - cad <= B_AH) return g;   // la grilla de huellas (los estanques)
  return cad + .478 * (bestiaAvance(pL + 2.4, pF) - dL) }
function _bPata(i, p, pF) { const O = ONETUSK, hz = i < 2 ? O.HOMBRO : -O.HOMBRO, pg = Math.max(0, pF == null ? p : Math.min(p, pF)), n = Math.max(-1, Math.floor((pg - B_P0[i]) / 4));
  const ant = n < 0 ? hz : _bApoyo(i, n, pF), pN = B_P0[i] + 4 * (n + 1), d = bestiaAvance(pg, pF), tau = n < 0 ? 99 : p - (B_P0[i] + 4 * n);
  if ((pF != null && pN > pF) || pg < pN - B_SW) return { z: ant - d, h: 0, s: 0, cab: 0, b: 0, tau, ult: n };
  const s = (pg - (pN - B_SW)) / B_SW, sig = _bApoyo(i, n + 1, pF), del = i < 2, e = O.sst(Math.pow(s, del ? .8 : 1.3), 0, 1), H = (del ? 1.8 : 1.55) * cl(Math.abs(sig - ant) / 13 + .22);
  return { z: lerp(ant, sig, e) - d, h: H * (O.sst(s, 0, .28) - O.sst(s, .87, 1)) * (1 + .1 * Math.sin(s * Math.PI)), s, cab: .36 * Math.sin(Math.PI * Math.min(1, s / .6)) - .13 * O.gs(s - .84, .09), b: Math.sin(Math.PI * s), tau, ult: n } }
function _bSenal(p, pF) { const F = [0, 1, 2, 3].map(i => _bPata(i, p, pF)), pul = f => f.tau < 0 || f.tau > 4 ? 0 : (f.tau < .16 ? ONETUSK.sst(f.tau, 0, .16) : Math.exp(-(f.tau - .16) / .5));
  return { F, bal: .5 * ((F[1].b + F[3].b) - (F[0].b + F[2].b)), dipF: pul(F[0]) + pul(F[1]), dipH: pul(F[2]) + pul(F[3]), gui: F[1].b - F[0].b - F[3].b + F[2].b } }
const _bHash = (a, b, c) => { const n = Math.sin(a * 12.9898 + b * 78.233 + c * 37.719) * 43758.5453; return n - Math.floor(n) };
const _bParp = t => { const T = 5.3, k = Math.floor(t / T), q = t - (k * T + 1 + 3 * _bHash(k, 3, 7)); return q < 0 ? 0 : q < .133 ? q / .133 : q < .467 ? 1 : q < .6 ? 1 - (q - .467) / .133 : 0 };
// trompa que se enrosca en un cilindro de eje A que pasa por C (en coordenadas de la bestia): tramo de llegada + hélice
function _bEnrosque(p0, d0, C, A, R0, radFn, ang, avance, N, Lmin, Lmax, prefer) { const rel = p0.clone().sub(C), r2 = rel.clone().addScaledVector(A, -rel.dot(A)), D = Math.max(r2.length(), 1e-3), e1 = r2.clone().multiplyScalar(1 / D), e2 = A.clone().cross(e1), rc0 = R0 + radFn(.45);
  const cand = [1, -1].map(sg => { const ph = sg * Math.acos(cl(rc0 / D, -1, 1)); return { sg, ph, T: C.clone().addScaledVector(e1, rc0 * Math.cos(ph)).addScaledVector(e2, rc0 * Math.sin(ph)) } }), el = prefer(cand[0].T) >= prefer(cand[1].T) ? cand[0] : cand[1], sg = el.sg;
  const tT = e1.clone().multiplyScalar(-Math.sin(el.ph) * sg).addScaledVector(e2, Math.cos(el.ph) * sg), kb = el.T.distanceTo(p0) * .42, B1 = p0.clone().addScaledVector(d0, kb), B2 = el.T.clone().addScaledVector(tT, -kb), poly = [];
  for (let i = 0; i <= 20; i++) { const q = i / 20, u = 1 - q; poly.push(p0.clone().multiplyScalar(u * u * u).addScaledVector(B1, 3 * u * u * q).addScaledVector(B2, 3 * u * q * q).addScaledVector(el.T, q * q * q)) }
  let lb = 0; for (let i = 1; i <= 20; i++) lb += poly[i].distanceTo(poly[i - 1]); const Lw = cl(lb + rc0 * ang, Lmin, Lmax);
  for (let th = .1, len = lb; len < Lw + 1 && th < 30; th += .1) { const rr = lerp(rc0, R0 + radFn(cl(len / Lw)) * .97, ONETUSK.sst(th, 0, 1.4)), a = el.ph + sg * th, p = C.clone().addScaledVector(e1, rr * Math.cos(a)).addScaledVector(e2, rr * Math.sin(a)).addScaledVector(A, avance * th / 6.2832); len += p.distanceTo(poly[poly.length - 1]); poly.push(p) }
  const P = [poly[0].clone()]; let k = 1, ac = 0; for (let i = 1; i <= N; i++) { const obj = Lw * i / N; while (k < poly.length - 1 && ac + poly[k].distanceTo(poly[k - 1]) < obj) { ac += poly[k].distanceTo(poly[k - 1]); k++ } const sg2 = poly[k].distanceTo(poly[k - 1]) || 1; P.push(poly[k - 1].clone().lerp(poly[k], cl((obj - ac) / sg2))) }
  return P }

function bestiaPose(t, { x = CRESTA[0], z = CRESTA[1], y = null, ry = 0, paso = 0, pisada = null, pasoFin = null, gira = 0, baja = 0, trompa = "cuelga", trompaDe = "cuelga", trompaEn = null, trompaR = 3.2, trompaQ = 1, ojos = 0, orejas = 0, conColmillo = 0, polvo = 1 } = {}) {
  const O = ONETUSK, v3 = O.v3, sst = O.sst, gs = O.gs, N = O.TN; if (pisada != null) paso = 2 * pisada; O.est.paso = paso; O.est.pasoFin = pasoFin;
  const G = O.G, gy = y == null ? ALT(x, z) : y, cs = Math.cos(ry), sn = Math.sin(ry), suelo = (lx, lz) => y == null ? ALT(x + lx * cs + lz * sn, z - lx * sn + lz * cs) - gy : 0;
  G.visible = true; G.position.set(x, gy, z); G.rotation.set(0, ry, 0);
  const S = _bSenal(paso, pasoFin), S2 = _bSenal(paso - .38, pasoFin), S3 = _bSenal(paso - .8, pasoFin), anda = sst(paso, 0, 1.5) * (pasoFin == null ? 1 : 1 - sst(paso, pasoFin - .4, pasoFin + 1.2)), resp = Math.sin(t * 1.15), resp2 = Math.sin(t * 1.15 - .9);
  // --- cuerpo: sigue la pendiente, se hunde con cada apoyo (hombros y cadera por separado), se balancea hacia el lado que apoya
  const gF = suelo(0, O.HOMBRO), gH = suelo(0, -O.HOMBRO), pend = Math.atan2(gH - gF, 2 * O.HOMBRO) * .85, dF = S.dipF * .38 + baja * 1.3 + anda * .12, dH = S.dipH * .42 + anda * .12;
  O.cuerpo.position.set(S.bal * .95, O.CY0 + (gF + gH) / 2 + .2 - (dF + dH) / 2 + resp * .05, 0); O.cuerpo.rotation.set(pend + (dF - dH) / (2 * O.HOMBRO) + baja * .05, S.gui * .018, -S.bal * .035); O.cuerpo.scale.set(1 + resp * .006, 1 + resp * .004, 1); O.cuerpo.updateMatrix();
  // --- patas: cinemática inversa de dos huesos (la rodilla dobla hacia adelante); el pie queda plantado donde apoyó
  const ABAJO = v3(0, -1, 0);
  O.patas.forEach((pt, i) => { const f = S.F[i], H = pt.cad.clone(); H.y -= O.CY0; H.applyMatrix4(O.cuerpo.matrix); const fx = pt.lado * O.TROCHA, fz = f.z, g0 = suelo(fx, fz); let A = v3(fx, g0 + O.TOB + f.h, fz), cab = f.cab + Math.atan2(suelo(fx, fz - 1.5) - suelo(fx, fz + 1.5), 3) * (1 - f.b);
    let d = A.clone().sub(H), L = d.length(); if (L > O.LMAX) { A = H.clone().addScaledVector(d, O.LMAX / L); cab += Math.sign(H.z - A.z) * Math.asin(cl((A.y - (g0 + O.TOB + f.h)) / 3.4, 0, .6)); d = A.clone().sub(H); L = O.LMAX }
    const dn = d.clone().multiplyScalar(1 / L), a = (O.L1 ** 2 - O.L2 ** 2 + L * L) / (2 * L), hh = Math.sqrt(Math.max(0, O.L1 ** 2 - a * a)), fw = v3(0, 0, 1); fw.addScaledVector(dn, -fw.dot(dn)).normalize(); const K = H.clone().addScaledVector(dn, a).addScaledVector(fw, hh);
    pt.mus.position.copy(H); pt.mus.quaternion.setFromUnitVectors(ABAJO, K.clone().sub(H).normalize()); pt.can.position.copy(K); pt.can.quaternion.setFromUnitVectors(ABAJO, A.clone().sub(K).normalize()); pt.pie.position.copy(A); pt.pie.rotation.set(cab, 0, 0); pt.suelo.set(fx, g0, fz) });
  // --- cabeza, orejas, ojos, cola (con retraso respecto del paso)
  O.cuello.rotation.order = "YXZ"; O.cuello.rotation.set(-.04 + baja * .46 + S2.dipF * .05 + resp2 * .006, gira, S2.bal * .025); O.cabeza.rotation.set(Math.sin(t * .37) * .008, Math.sin(t * .23 + 1) * .012, 0);
  O.orejas.forEach(({ giro, s }, k) => { giro.rotation.y = lerp(1.06, .1, cl(orejas)) + Math.sin(t * .8 + k * 1.7) * .03 * (1 + orejas) + Math.sin(t * 2.3 + k) * .008 - S2.dipF * .13 + S2.bal * s * .06; giro.rotation.x = S2.dipF * .03;
    const w1 = Math.sin(t * .8 + k * 1.7 - .7), w2 = Math.sin(t * .8 + k * 1.7 - 1.5); O.doblarOreja(O.orejas[k], .05 + w1 * .05 * (1 + orejas) + S2.dipF * .22 - orejas * .1, .08 + w2 * .08 * (1 + orejas) + S3.dipF * .34 + S3.bal * s * .12, .1 + S3.dipF * .3 + w2 * .05) });
  const cierre = Math.max(cl(ojos), ojos > .5 ? 0 : _bParp(t)); O.ojos.forEach(o => { o.sup.rotation.x = lerp(-.42, .47, cierre); o.infP.rotation.x = lerp(.62, .43, cierre) });
  O.colaP.rotation.set(.12 + S2.dipH * .1, 0, S2.bal * .35 + Math.sin(t * .6) * .04);
  // --- el colmillo devuelto, contra el muñón
  { const c = cl(conColmillo), e = 1 - c, k2 = O.col2; k2.visible = c > 0; k2.position.copy(O.P_M).addScaledVector(O.TAN_M, .03 + 3.2 * e); k2.position.y -= 1.2 * e; k2.position.x += .8 * e; k2.rotation.set(O.dip(O.TAN_M) - O.dip(O.TAN0) + .22 * e, .25 * e, 0) }
  G.updateMatrixWorld(true);
  // --- trompa: cadena de puntos en coordenadas de la bestia
  const Mh = new THREE.Matrix4().copy(G.matrixWorld).invert().multiply(O.cabeza.matrixWorld), raiz = O.TR0.clone().applyMatrix4(Mh), d0 = O.TRD.clone().transformDirection(Mh), u0 = O.TRU.clone().transformDirection(Mh);
  const fH = v3(d0.x, 0, d0.z); if (fH.lengthSq() < .01) fH.set(0, 0, 1).transformDirection(Mh).setY(0); fH.normalize(); const lat = v3(fH.z, 0, -fH.x), a0 = Math.atan2(d0.dot(fH), -d0.y), gT = suelo(raiz.x, raiz.z);
  const cadena = (af, bf, L) => { const P = [raiz.clone()], seg = L / N; let p = raiz; for (let i = 0; i < N; i++) { const s = (i + .5) / N, a = af(s), b = bf(s), cb = Math.cos(b); p = p.clone().add(v3(0, -Math.cos(a) * cb, 0).addScaledVector(fH, Math.sin(a) * cb).addScaledVector(lat, Math.sin(b)).multiplyScalar(seg)); P.push(p) } return P };
  const mecer = S2.bal * .32 + Math.sin(t * .5) * .025, vaiven = S2.dipF * .1 + Math.sin(t * .41 + 2) * .012;
  const poses = { cuelga: () => { const hacer = kp => cadena(s => a0 * (1 - sst(s, 0, .42)) - .1 * gs(s - .5, .22) + lerp(.5, 1.55, kp) * 2.4 * Math.pow(sst(s, lerp(.62, .16, kp), 1), 1.4) + vaiven * s, s => mecer * Math.pow(s, 1.3), O.TR_L), bajo = P => Math.min(...P.map(q => q.y)) - gT - 1.5;
      let P = hacer(0); if (bajo(P) >= 0) return P; let lo = 0, hi = 1; for (let k = 0; k < 7; k++) { const m = (lo + hi) / 2; bajo(hacer(m)) >= 0 ? hi = m : lo = m } return hacer(hi) },
    alza: () => cadena(s => a0 + (2.72 - a0) * sst(s, 0, .74) - 1.05 * sst(s, .72, 1) + Math.sin(t * .9) * .03 * s, s => Math.sin(t * .7) * .04 * s, O.TR_L),
    enrosca: w => { const C = trompaEn ? G.worldToLocal(v3(...trompaEn)) : v3(8, 12, 30); return _bEnrosque(raiz, d0, C, v3(0, 1, 0), trompaR, O.radT, lerp(.7, 6.2832 * 1.12, w), -2.6, N, O.TR_L * .9, 33, T => -T.distanceTo(raiz.clone().addScaledVector(d0, 6))) },
    sostiene: w => { const Mc = new THREE.Matrix4().copy(G.matrixWorld).invert().multiply(O.col2.matrixWorld), uC = .3, C = O.CU.getPointAt(uC).applyMatrix4(Mc), A = O.CU.getTangentAt(uC).transformDirection(Mc); return _bEnrosque(raiz, d0, C, A, 1.22, s => O.radT(s) * .9, lerp(.9, 6.2832 * 1.2, w), 2.3, N, O.TR_L * .85, 28, T => -T.y) } };
  const hacerPose = (n, w) => (poses[n] || poses.cuelga)(w); let PT;
  if (trompa === trompaDe || trompaQ <= 0) PT = hacerPose(trompaQ <= 0 ? trompaDe : trompa, 1);
  else { const env = trompa === "enrosca" || trompa === "sostiene", e = eIO(cl(env ? trompaQ / .42 : trompaQ)), A = hacerPose(trompaDe, 1), B = hacerPose(trompa, env ? sst(trompaQ, .3, 1) : 1); PT = e >= 1 ? B : A.map((p, i) => p.lerp(B[i], e)) }
  { const NS = O.TNS, RS = O.TRS, pos = O.trompaG.attributes.position, nor = O.trompaG.attributes.normal, C = [], cr = (a, b, c, d2, q) => { const q2 = q * q, q3 = q2 * q; return .5 * ((2 * b) + (-a + c) * q + (2 * a - 5 * b + 4 * c - d2) * q2 + (-a + 3 * b - 3 * c + d2) * q3) };
    let largo = 0; for (let i = 1; i <= N; i++) largo += PT[i].distanceTo(PT[i - 1]); const fino = Math.pow(O.TR_L / Math.max(O.TR_L, largo), .35);
    for (let i = 0; i <= NS; i++) { const f = i / NS * N, k = Math.min(N - 1, Math.floor(f)), q = f - k, p0 = PT[Math.max(0, k - 1)], p1 = PT[k], p2 = PT[k + 1], p3 = PT[Math.min(N, k + 2)]; C.push(v3(cr(p0.x, p1.x, p2.x, p3.x, q), cr(p0.y, p1.y, p2.y, p3.y, q), cr(p0.z, p1.z, p2.z, p3.z, q))) }
    let Nn = u0.clone(); const Tn = v3(), Bn = v3();
    for (let i = 0; i <= NS; i++) { Tn.copy(C[Math.min(NS, i + 1)]).sub(C[Math.max(0, i - 1)]).normalize(); Nn.addScaledVector(Tn, -Nn.dot(Tn)).normalize(); Bn.crossVectors(Tn, Nn); const s = i / NS, rr = O.radT(s) * lerp(1, fino, cl(s * 3)), c = C[i];
      for (let j = 0; j <= RS; j++) { const a = j / RS * 6.2832, ca = Math.cos(a), sa = Math.sin(a), kx = ca > 0 ? .88 : 1, nx = Nn.x * ca * kx + Bn.x * sa, ny = Nn.y * ca * kx + Bn.y * sa, nz = Nn.z * ca * kx + Bn.z * sa, k = i * (RS + 1) + j; pos.setXYZ(k, c.x + nx * rr, c.y + ny * rr, c.z + nz * rr); nor.setXYZ(k, Nn.x * ca + Bn.x * sa, Nn.y * ca + Bn.y * sa, Nn.z * ca + Bn.z * sa) } }
    pos.needsUpdate = nor.needsUpdate = true; { const rp = O.radT(1) * fino; O.punta.matrix.makeBasis(Bn.clone().multiplyScalar(rp), Nn.clone().multiplyScalar(-rp), Tn.clone().multiplyScalar(rp)).setPosition(C[NS]); O.punta.matrixWorldNeedsUpdate = true } O.est.punta = C[NS].clone() }
  // --- arena que cae del lomo cuando empieza a andar
  { O.ponerArena(1 - .62 * sst(paso, .1, 3.8)); const on = paso > 0 && paso < 6.5, p = O.chorG.attributes.position, R = O.RCH, by = O.cuerpo.position.y - O.CY0, golpe = .55 + .45 * Math.min(1, S.dipF + S.dipH); O.chorros.visible = on;
    O.CH.forEach((ch, c) => { const env = on ? sst(paso, ch.t0, ch.t0 + .3) * (1 - sst(paso, ch.t0 + ch.dur - .9, ch.t0 + ch.dur)) * golpe : 0, H = ch.p.y + by, vl = O.velos[c]; vl.visible = env > .01; if (vl.visible) { vl.position.set(ch.p.x + ch.lado * .9, H * .52, ch.p.z); vl.scale.set(ch.an * 1.7, H * 1.05, 1); vl.material.opacity = Math.min(1, env * .95) } const pc = O.polvoCh[c]; pc.visible = env > .01; if (pc.visible) { const q = (t * .45 + c * .37) % 1; pc.position.set(ch.p.x + ch.lado * (1.2 + q * 2.5), 1.2 + q * 2.2, ch.p.z + Math.sin(c * 5.1) * 1.5); pc.scale.set(4 + ch.an + q * 6, 3 + q * 4, 1); pc.material.opacity = env * .6 * (1 - q) }
      if (on) for (let k = 0; k < O.NCH; k++) { const q = (c * O.NCH + k) * 3, iv = c * O.NCH + k; if (R[q] > env) { p.setXYZ(iv, 0, -999, 0); continue } const tau = (t * ch.f * .62 + R[q + 1] * 7.3) % 1, cae = Math.pow(tau, 1.8); p.setXYZ(iv, ch.p.x + S.bal + ch.lado * (.2 + R[q + 2] * 1.6) * tau + Math.sin(k * 3.1) * .15, H - .4 - cae * (H - .3), ch.p.z + (R[q + 2] - .5) * ch.an + Math.sin(k * 1.7 + tau * 3) * .12) } }); p.needsUpdate = true }
  // --- polvo de las pisadas: aparece 5 cuadros después del apoyo, crece y se disipa (0,9–2,5 s); granos que saltan
  { O.FX.visible = true; const gp = O.granosG.attributes.position, dAct = bestiaAvance(pasoFin == null ? paso : Math.min(paso, pasoFin), pasoFin);
    for (let i = 0; i < 4; i++) for (let ev = 0; ev < O.NEV; ev++) { const n = S.F[i].ult - ev, b0 = (i * O.NEV + ev) * O.NPUF, g0 = (i * O.NEV + ev) * O.NGR, edad = n < 0 ? -1 : (paso - (B_P0[i] + 4 * n)) * BESTIA_SEG_PASO - .17, vivo = edad >= 0 && edad < 2.6 && polvo > 0;
      if (!vivo) { for (let k = 0; k < O.NPUF; k++) O.pufs[b0 + k].visible = false; for (let k = 0; k < O.NGR; k++) gp.setXYZ(g0 + k, 0, -999, 0); continue }
      const lx = O.patas[i].lado * O.TROCHA, lz = _bApoyo(i, n, pasoFin) - dAct, wx = x + lx * cs + lz * sn, wz = z - lx * sn + lz * cs, wy = y == null ? ALT(wx, wz) : gy, fu = polvo * (i < 2 ? 1 : .8);
      for (let k = 0; k < O.NPUF; k++) { const s = O.pufs[b0 + k], h1 = _bHash(i, n, k), h2 = _bHash(k, i + 5, n), h3 = _bHash(n, k + 9, i), vida = .9 + h2 * 1.6, q = edad / vida; if (q >= 1) { s.visible = false; continue } const an = k / (O.NPUF - 1) * 6.2832 + h1 * .9, e = eOut(q), dist = k ? 3.4 + (4 + h3 * 5.5) * e : 0, esc = (k ? 3.6 + h1 * 3 : 6) + (7 + h3 * 7) * e;
        s.visible = true; s.position.set(wx + Math.cos(an) * dist, wy + .7 + (1 + h2 * 4.2) * q + esc * .12, wz + Math.sin(an) * dist); s.scale.set(esc * (1.1 + h3 * .3), esc * (.78 + h1 * .2), 1); s.material.opacity = fu * .7 * sst(q, 0, .09) * Math.pow(1 - q, 1.35); s.material.rotation = h1 * 6 + q * (h2 - .5) }
      for (let k = 0; k < O.NGR; k++) { const h1 = _bHash(k, n + 3, i), h2 = _bHash(i, k, n + 11), an = h1 * 6.2832, vh = 3 + h2 * 9, vv = 4 + _bHash(k, i, n) * 9, yy = .3 + vv * edad - 11 * edad * edad; if (yy < 0 || h2 > fu) { gp.setXYZ(g0 + k, 0, -999, 0); continue } const rr = 4.3 + vh * edad; gp.setXYZ(g0 + k, wx + Math.cos(an) * rr, wy + yy, wz + Math.sin(an) * rr) } }
    gp.needsUpdate = true } }
function sinBestia() { ONETUSK.G.visible = false; ONETUSK.FX.visible = false }
const cabezaW = (o = [0, 0, 0]) => { ONETUSK.G.updateMatrixWorld(true); return ONETUSK.cabeza.localToWorld(new THREE.Vector3(...o)).toArray() };
const ojoW = (lado = 1) => { ONETUSK.G.updateMatrixWorld(true); return ONETUSK.ojos[lado > 0 ? 0 : 1].G.localToWorld(new THREE.Vector3(0, 0, .9)).toArray() };
const munonW = () => { ONETUSK.G.updateMatrixWorld(true); return ONETUSK.corte.getWorldPosition(new THREE.Vector3()).toArray() };
const pieW = i => { ONETUSK.G.updateMatrixWorld(true); return ONETUSK.G.localToWorld(ONETUSK.patas[i].suelo.clone()).toArray() };
const trompaW = () => { ONETUSK.G.updateMatrixWorld(true); return ONETUSK.G.localToWorld((ONETUSK.est.punta || new THREE.Vector3()).clone()).toArray() };
// pico breve (0…1) cuando una pata acaba de apoyar: 1 las delanteras (las que hacen estanque), 0,7 las traseras
function pisadaGolpe(t, paso = ONETUSK.est.paso, pasoFin = ONETUSK.est.pasoFin) { let g = 0; for (let i = 0; i < 4; i++) { const f = _bPata(i, paso, pasoFin), ts = f.tau * BESTIA_SEG_PASO; if (f.tau < 0 || f.tau > 3) continue; g = Math.max(g, (i < 2 ? 1 : .7) * (ts < .033 ? ts / .033 : Math.exp(-(ts - .033) / .14))) } return g }
// la bajada completa de la cresta a la plaza: q = 0…1 → dónde va y con qué paso (las delanteras pisan los 11 ESTANQUES)
const bestiaBajada = q => { const paso = cl(q) * BAJADA.pasos; return { x: CRESTA[0], z: CRESTA[1] + bestiaAvance(paso, BAJADA.pasos), paso, pasoFin: BAJADA.pasos } };

// ================= DUSTMERE: detalle (utilería del pueblo, lugares de las frases, plantas, piedras), efectos y lo que se mueve =================
// ---------- viento: las telas, la ropa, los banderines y las palmeras se mueven en el sombreador (uv.y = cuánto se mueve cada punto)
const VIENTO = { value: 0 }, RAFAGA = { value: 1 };
const conViento = (m, modo = 0, amp = .12) => { m.side = THREE.DoubleSide; m.onBeforeCompile = sh => { sh.uniforms.uVt = VIENTO; sh.uniforms.uVa = RAFAGA; sh.vertexShader = "uniform float uVt; uniform float uVa;\n" + sh.vertexShader.replace("#include <begin_vertex>",
  `#include <begin_vertex>\n{ float w = ${modo === 1 ? "sin(uv.y * 3.1416)" : "(1. - uv.y)"}; vec4 wp = modelMatrix * vec4(position, 1.); float f = sin(uVt * 2.3 + wp.x * .9 + wp.z * .7) + .5 * sin(uVt * 5.1 + wp.x * 2.3 + wp.y * 1.7) + .25 * sin(uVt * 9.7 + wp.z * 3.1);\n transformed += ${modo === 1 ? "vec3(0., 1., 0.)" : modo === 2 ? "vec3(.8, -.25, .5)" : "normal"} * f * w * w * uVa * ${amp.toFixed(3)}; }`) }; m.customProgramCacheKey = () => "viento" + modo + amp; return m };
// ---------- texturas y materiales de la utilería
const T_TRAMA_D = tex(256, 256, (g, w, h) => { g.fillStyle = "#808080"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 4) { g.fillStyle = y % 8 ? "rgba(255,255,255,.2)" : "rgba(0,0,0,.22)"; g.fillRect(0, y, w, 2) } for (let x = 0; x < w; x += 4) { g.fillStyle = x % 8 ? "rgba(255,255,255,.14)" : "rgba(0,0,0,.16)"; g.fillRect(x, 0, 2, h) } }, [6, 6]);
const T_RAYAS = (seed, cols) => tex(512, 512, (g, w, h) => { const r = rng(seed); let x = 0, k = 0; while (x < w) { const an = 22 + r() * 60; g.fillStyle = cols[k++ % cols.length]; g.fillRect(x, 0, an + 1, h); x += an } for (let q = 0; q < 900; q++) { g.fillStyle = r() < .5 ? "rgba(255,245,225,.12)" : "rgba(60,40,26,.12)"; g.fillRect(r() * w, r() * h, 2 + r() * 30, 2) } const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(255,240,210,.22)"); gr.addColorStop(1, "rgba(70,50,34,.2)"); g.fillStyle = gr; g.fillRect(0, 0, w, h) });
const TELA_P = [["#c9482e", "#efe3c8"], ["#2f8f8a", "#efe3c8", "#d9a12a"], ["#d9a12a", "#b8452c", "#efe3c8"], ["#3d62a8", "#efe3c8"], ["#8d4d82", "#e8c06a", "#efe3c8"], ["#efe3c8", "#c9482e", "#27706e", "#efe3c8"]];
const M_TOLDO = TELA_P.map((p, i) => conViento(new THREE.MeshStandardMaterial({ map: T_RAYAS(3001 + i, p), bumpMap: T_TRAMA_D, bumpScale: 1.5, roughness: .95 }), 1, .07));
const M_ROPA = ["#f0e8d6", "#3d62a8", "#c9482e", "#d9a12a", "#5d8f3c", "#e9b8a0", "#7a4a8a"].map(c => conViento(new THREE.MeshStandardMaterial({ color: c, bumpMap: T_TRAMA_D, bumpScale: 1.5, roughness: .95 }), 0, .16));
const T_ALF = (seed, pal) => tex(256, 512, (g, w, h) => { const r = rng(seed); g.fillStyle = pal[0]; g.fillRect(0, 0, w, h); let y = 16; while (y < h - 16) { const bh = 14 + r() * 44, c = pal[1 + (r() * (pal.length - 1) | 0)], t = r() * 3 | 0; g.fillStyle = c; if (t === 0) g.fillRect(8, y, w - 16, bh * .6); else if (t === 1) { for (let x = 8; x < w - 8; x += bh) { g.beginPath(); g.moveTo(x, y + bh / 2); g.lineTo(x + bh / 2, y); g.lineTo(x + bh, y + bh / 2); g.lineTo(x + bh / 2, y + bh); g.fill() } } else { g.strokeStyle = c; g.lineWidth = 5; g.beginPath(); for (let x = 8; x <= w - 8; x += 16) g.lineTo(x, y + ((x / 16 | 0) % 2 ? bh * .8 : 4)); g.stroke() } y += bh + 6 }
  g.strokeStyle = pal[1]; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12); for (let x = 2; x < w; x += 7) { g.fillStyle = "#e9dcc0"; g.fillRect(x, 0, 3, 9); g.fillRect(x, h - 9, 3, 9) } for (let q = 0; q < 1200; q++) { g.fillStyle = r() < .5 ? "rgba(255,240,215,.14)" : "rgba(50,30,20,.14)"; g.fillRect(r() * w, r() * h, 3, 1.5) } });
const ALF_P = [["#a83a2a", "#e8d8b0", "#2a4a6a", "#d9a12a"], ["#2f6f72", "#efe3c8", "#c9482e", "#1e2a3a"], ["#d9c9a8", "#8a3a2a", "#3a3a3a", "#c98a2a"], ["#7a2a3a", "#e8c06a", "#efe3c8", "#27504e"]];
const M_ALF = ALF_P.map((p, i) => new THREE.MeshStandardMaterial({ map: T_ALF(3020 + i, p), bumpMap: T_TRAMA_D, bumpScale: 2.5, roughness: 1, side: THREE.DoubleSide }));
const M_ALF_V = ALF_P.map((p, i) => conViento(new THREE.MeshStandardMaterial({ map: M_ALF[i].map, bumpMap: T_TRAMA_D, bumpScale: 2.5, roughness: 1 }), 0, .05));
const T_CERAM = (seed, base, pinta) => tex(512, 256, (g, w, h) => { const r = rng(seed); g.fillStyle = base; g.fillRect(0, 0, w, h); for (let k = 0; k < 300; k++) { g.fillStyle = r() < .5 ? "rgba(60,30,16,.14)" : "rgba(255,220,180,.14)"; g.beginPath(); g.ellipse(r() * w, r() * h, 4 + r() * 30, 3 + r() * 10, 0, 0, 7); g.fill() }
  for (const [y0, t] of [[h * .28, 0], [h * .42, 1], [h * .62, 2]]) { g.fillStyle = g.strokeStyle = pinta[t % pinta.length]; if (t === 0) { g.fillRect(0, y0, w, 7); g.fillRect(0, y0 + 12, w, 3) } else if (t === 1) { g.lineWidth = 5; g.beginPath(); for (let x = 0; x <= w; x += 16) g.lineTo(x, y0 + ((x / 16) % 2 ? 22 : 0)); g.stroke() } else for (let x = 8; x < w; x += 32) { g.beginPath(); g.arc(x, y0, 6, 0, 7); g.fill() } }
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(40,24,14,.5)"); gr.addColorStop(.18, "rgba(40,24,14,0)"); gr.addColorStop(.85, "rgba(200,170,130,0)"); gr.addColorStop(1, "rgba(200,170,130,.5)"); g.fillStyle = gr; g.fillRect(0, 0, w, h) });
const M_CERAM = [["#b5653c", ["#2a1a12", "#efe3c8"]], ["#c98a5a", ["#7a2a1a", "#2a1a12"]], ["#8a4a30", ["#efe3c8", "#d9a12a"]], ["#d8c4a0", ["#a83a2a", "#27504e"]]].map(([b, p], i) => new THREE.MeshStandardMaterial({ map: T_CERAM(3040 + i, b, p), roughness: .7, bumpMap: T_ARENA_D.z, bumpScale: .6, side: THREE.DoubleSide }));
const M_AJI = [new THREE.MeshStandardMaterial({ color: "#c2241a", roughness: .35 }), new THREE.MeshStandardMaterial({ color: "#8a1a14", roughness: .4 }), new THREE.MeshStandardMaterial({ color: "#e0701e", roughness: .4 })];
const T_PAJA = tex(256, 256, (g, w, h) => { const r = rng(3050); g.fillStyle = "#c9a85a"; g.fillRect(0, 0, w, h); for (let k = 0; k < 2600; k++) { const x = r() * w, y = r() * h, a = (r() - .5) * 1.2 + 1.57; g.strokeStyle = rgbj(["#e2c878", "#a8863e", "#d8b866", "#8a6a30"][r() * 4 | 0], r, 20); g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 26, y + Math.sin(a) * 26); g.stroke() } }, [1, 1]);
const M_PAJA = new THREE.MeshStandardMaterial({ map: T_PAJA, bumpMap: T_PAJA, bumpScale: 3, roughness: 1, side: THREE.DoubleSide });
const M_SACO = new THREE.MeshStandardMaterial({ color: "#b89a6c", bumpMap: T_TRAMA_D, bumpScale: 3, roughness: 1 });
const T_CESTA = tex(256, 128, (g, w, h) => { g.fillStyle = "#a87c44"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 10) for (let x = (y / 10 % 2) * 8; x < w; x += 16) { g.fillStyle = (x + y) % 3 ? "#c79a58" : "#8a6232"; g.fillRect(x, y, 14, 8); g.fillStyle = "rgba(40,24,10,.5)"; g.fillRect(x, y + 8, 16, 2) } }, [3, 1]);
const M_CESTA = new THREE.MeshStandardMaterial({ map: T_CESTA, bumpMap: T_CESTA, bumpScale: 3, roughness: 1, side: THREE.DoubleSide });
const M_FRUTA = ["#d9772a", "#b8281e", "#d8c040", "#6a9a3a", "#7a3a6a", "#e8d8a0"].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: .5 }));
const M_HORNO = (() => { const [t, z] = T_ADOBE(3060, "#b88c64", { parches: 2 }); return new THREE.MeshStandardMaterial({ map: t, bumpMap: z, bumpScale: 4, roughness: 1 }) })();
const M_HOLLIN = new THREE.MeshStandardMaterial({ color: "#1c1410", roughness: 1 });
const T_CACTUS = tex(256, 256, (g, w, h) => { const r = rng(3070); g.fillStyle = "#6a8a50"; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 32) { const gr = g.createLinearGradient(x, 0, x + 32, 0); gr.addColorStop(0, "rgba(30,50,24,.6)"); gr.addColorStop(.5, "rgba(150,180,110,.35)"); gr.addColorStop(1, "rgba(30,50,24,.6)"); g.fillStyle = gr; g.fillRect(x, 0, 32, h); for (let y = 6; y < h; y += 18) { g.strokeStyle = "rgba(240,235,200,.8)"; g.lineWidth = 1; for (let q = 0; q < 5; q++) { const a = q / 5 * 6.283 + r(); g.beginPath(); g.moveTo(x + 16, y); g.lineTo(x + 16 + Math.cos(a) * 6, y + Math.sin(a) * 6); g.stroke() } } }
  for (let k = 0; k < 60; k++) { g.fillStyle = "rgba(160,140,90,.3)"; g.beginPath(); g.ellipse(r() * w, r() * h, 3 + r() * 10, 2 + r() * 6, 0, 0, 7); g.fill() } }, [1, 2]);
const M_CACTUS = new THREE.MeshStandardMaterial({ map: T_CACTUS, bumpMap: T_CACTUS, bumpScale: 2, roughness: .8 });
const M_NOPAL = new THREE.MeshStandardMaterial({ color: "#7a9a58", roughness: .8, bumpMap: T_ARENA_D.z, bumpScale: 1.5 });
const M_AGAVE = new THREE.MeshStandardMaterial({ color: "#7f9a8a", roughness: .7, flatShading: true });
const T_PALMA = tex(128, 512, (g, w, h) => { const r = rng(3080); g.fillStyle = "#8a6a48"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 26) { g.fillStyle = "rgba(40,26,14,.7)"; g.fillRect(0, y, w, 5); for (let x = 0; x < w; x += 22) { g.fillStyle = rgbj("#a8845a", r, 30); g.beginPath(); g.moveTo(x, y + 26); g.lineTo(x + 11, y + 6); g.lineTo(x + 22, y + 26); g.fill() } } }, [3, 1]);
const M_PALMA_T = new THREE.MeshStandardMaterial({ map: T_PALMA, bumpMap: T_PALMA, bumpScale: 5, roughness: 1 });
const M_FRONDA = conViento(new THREE.MeshStandardMaterial({ color: "#6f8f3c", roughness: .75 }), 2, .22), M_FRONDA_S = conViento(new THREE.MeshStandardMaterial({ color: "#a88a50", roughness: 1 }), 2, .1);
const M_MATA = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 1 });
// ---------- piezas sueltas (cada función agrega geometría a un lote, con la matriz del lugar)
const PB = lote(), HUMOS = [], PB_M = { madera: M_MADERA, maderaV: M_MADERA_V, hierro: M_HIERRO, soga: M_SOGA, oscuro: M_HOLLIN, paja: M_PAJA, saco: M_SACO, cesta: M_CESTA, horno: M_HORNO, laja: M_LAJA, adobe: M_ADOBE[1], adobe2: M_ADOBE[5], cactus: M_CACTUS, nopal: M_NOPAL, agave: M_AGAVE, tronco: M_PALMA_T, fronda: M_FRONDA, frondaS: M_FRONDA_S, tablas: M_PLANK, piedra: M_SILLAR[0], piedra2: M_SILLAR[2], blanco: SM("#efe6d2", { roughness: .8 }), cuero: SM("#6a4630", { roughness: .9 }), agua: new THREE.MeshStandardMaterial({ color: "#3a5a66", roughness: .1, metalness: .6 }), bronce: new THREE.MeshStandardMaterial({ color: "#b08a3a", roughness: .4, metalness: .8 }), verde: SM("#5a8a3a", { roughness: .8 }) };
M_CERAM.forEach((m, i) => PB_M["cer" + i] = m); M_AJI.forEach((m, i) => PB_M["aji" + i] = m); M_TOLDO.forEach((m, i) => PB_M["toldo" + i] = m); M_ROPA.forEach((m, i) => PB_M["ropa" + i] = m); M_ALF.forEach((m, i) => { PB_M["alf" + i] = m; PB_M["alfv" + i] = M_ALF_V[i] }); M_FRUTA.forEach((m, i) => PB_M["fru" + i] = m); M_PUERTA.forEach((m, i) => PB_M["col" + i] = m);
const GEO_VASIJA = { olla: [[.0, 0], [.2, 0], [.34, .1], [.41, .28], [.38, .46], [.26, .58], [.23, .64], [.28, .71], [.26, .72], [.2, .64]], cantaro: [[0, 0], [.14, 0], [.27, .14], [.31, .4], [.24, .66], [.12, .82], [.1, .98], [.16, 1.06], [.14, 1.07], [.08, .98]], tinaja: [[0, 0], [.26, 0], [.48, .2], [.58, .55], [.52, .92], [.36, 1.1], [.33, 1.16], [.38, 1.22], [.35, 1.23], [.3, 1.14]], cuenco: [[0, 0], [.14, 0], [.3, .1], [.36, .2], [.34, .21], [.27, .11], [.12, .04], [0, .04]] };
Object.keys(GEO_VASIJA).forEach(k => { GEO_VASIJA[k] = new THREE.LatheGeometry(GEO_VASIJA[k].map(q => new THREE.Vector2(q[0], q[1])), 18) });
const vasija = (L, M, tipo = "olla", s = 1, k = 0) => { L.add("cer" + k % 4, GEO_VASIJA[tipo], M.clone().multiply(TM(0, 0, 0, 0, 0, 0, s))); if (tipo !== "cuenco") L.add("oscuro", new THREE.CircleGeometry(tipo === "tinaja" ? .3 : tipo === "olla" ? .2 : .08, 10), M.clone().multiply(TM(0, (tipo === "tinaja" ? 1.12 : tipo === "olla" ? .62 : .96) * s, 0, -Math.PI / 2, 0, 0, s))) };
const GEO_RISTRA = (() => { const r = rng(3090), A = [], B = [], S = [], aj = new THREE.ConeGeometry(.045, .27, 6); { const p = aj.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setX(i, p.getX(i) + (y - .13) * (y - .13) * 1.2) } aj.computeVertexNormals() } S.push([new THREE.CylinderGeometry(.012, .012, 1.25, 4), TM(0, -.6, 0)]); for (let k = 0; k < 26; k++) { const a = k * 2.4, y = -.12 - k * .042; (k % 5 === 4 ? B : A).push([aj, TM(Math.cos(a) * .05, y, Math.sin(a) * .05, Math.PI + .5 + r() * .4, a, 0, .8 + r() * .5)]) } return [mergeG(A), mergeG(B), mergeG(S)] })();
const ristra = (L, M, k = 0) => { L.add("aji" + k % 3, GEO_RISTRA[0], M); L.add("aji" + (k + 1) % 3, GEO_RISTRA[1], M); L.add("soga", GEO_RISTRA[2], M) };
function horno(L, M, r) { const dom = new THREE.SphereGeometry(1.15, 22, 12, 0, 6.283, 0, Math.PI / 2); dom.scale(1, 1.08, 1); geoUV(dom, (x, y, z) => .5 + Math.atan2(x, z) / 6.283 * .9, (x, y) => .15 + y * .6); L.add("horno", dom, M.clone().multiply(TM(0, .5, 0))); const bas = new THREE.CylinderGeometry(1.24, 1.34, .56, 22); geoUV(bas, (x, y, z) => .5 + Math.atan2(x, z) / 6.283 * .9, (x, y) => .05 + y * .1); L.add("horno", bas, M.clone().multiply(TM(0, .26, 0)));
  // la boca: arco con reborde de barro, adentro negro de hollín; arriba, el agujero del humo con su aro
  L.add("oscuro", new THREE.CylinderGeometry(.42, .42, .5, 16, 1, false, 0, Math.PI), M.clone().multiply(TM(0, .56, .86, Math.PI / 2, 0, Math.PI / 2))); L.add("horno", new THREE.TorusGeometry(.44, .09, 8, 18, Math.PI), M.clone().multiply(TM(0, .56, 1.1))); L.add("laja", RB(1.1, .1, .5, .04), M.clone().multiply(TM(0, .56, 1.25)));
  L.add("horno", new THREE.TorusGeometry(.2, .07, 6, 14), M.clone().multiply(TM(0, 1.72, -.25, Math.PI / 2))); L.add("oscuro", new THREE.CircleGeometry(.19, 12), M.clone().multiply(TM(0, 1.745, -.25, -Math.PI / 2)));
  // leña apilada al costado, la pala de madera y una tapa de piedra apoyada
  for (let k = 0; k < 9; k++) { const f = k < 4 ? 0 : k < 7 ? 1 : 2; L.add("madera", new THREE.CylinderGeometry(.09 + r() * .03, .1, 1 + r() * .2, 7), M.clone().multiply(TM(1.75 + (r() - .5) * .05, .11 + f * .19, -.3 + ((k - [0, 4, 7][f]) - [1.5, 1, .5][f]) * .21, Math.PI / 2, 1.57, 0))) }
  L.add("maderaV", new THREE.CylinderGeometry(.03, .03, 1.9, 6), M.clone().multiply(TM(-1.25, .95, .55, .12, 0, -.22))); L.add("maderaV", new THREE.BoxGeometry(.34, .5, .03), M.clone().multiply(TM(-1.06, 1.95, .43, .12, 0, -.22))); L.add("laja", new THREE.CylinderGeometry(.4, .4, .06, 12), M.clone().multiply(TM(-.75, .42, 1.2, 1.2, .4, 0)));
  HUMOS.push(new THREE.Vector3(0, 1.8, -.25).applyMatrix4(M)) }
function toldo(L, M, an, prof, k, r, alto = 2.95) { const g = new THREE.PlaneGeometry(1, 1, 10, 7), p = g.attributes.position, u = g.attributes.uv; for (let i = 0; i < p.count; i++) { const uu = u.getX(i), v = 1 - u.getY(i); p.setXYZ(i, (uu - .5) * an, lerp(alto, alto - .5, v) - .2 * Math.sin(v * Math.PI) * (1 - .4 * Math.abs(uu * 2 - 1)) - (v > .99 ? .0 : 0), v * prof); u.setXY(i, uu, v) } g.computeVertexNormals(); L.add("toldo" + k % 6, g, M);
  // el faldón del frente (flecos) y los dos palos con sus vientos de soga
  const f = new THREE.PlaneGeometry(an, .28, 10, 1), fp = f.attributes.position, fu = f.attributes.uv; for (let i = 0; i < fp.count; i++) { fu.setY(i, .5); if (fp.getY(i) < 0) fp.setY(i, fp.getY(i) - ((Math.round((fp.getX(i) / an + .5) * 10)) % 2) * .1) } L.add("toldo" + k % 6, f, M.clone().multiply(TM(0, alto - .64, prof)));
  for (const s of [-1, 1]) { L.add("madera", new THREE.CylinderGeometry(.045, .055, alto - .4, 7), M.clone().multiply(TM(s * (an / 2 - .05), (alto - .4) / 2, prof, 0, 0, s * .03))); L.add("soga", ...(() => { const [gg, mm] = cilEntre([s * (an / 2 - .05), alto - .5, prof], [s * (an / 2 + .5), .05, prof + .7], .014, 4); return [gg, M.clone().multiply(mm)] })()); L.add("madera", new THREE.CylinderGeometry(.03, .03, .3, 5), M.clone().multiply(TM(s * (an / 2 + .5), .1, prof + .7, .3, 0, 0))) } }
function tendedero(L, a, b, r, alto = 2.5) { const d = Math.hypot(b[0] - a[0], b[2] - a[2]), ry = Math.atan2(b[0] - a[0], b[2] - a[2]); for (const p of [a, b]) L.add("maderaV", new THREE.CylinderGeometry(.05, .065, alto + .2, 7), TM(p[0], p[1] + alto / 2, p[2], (r() - .5) * .06, 0, (r() - .5) * .06));
  const N = 8, pt = q => [lerp(a[0], b[0], q), lerp(a[1], b[1], q) + alto - Math.sin(q * Math.PI) * .22, lerp(a[2], b[2], q)]; for (let k = 0; k < N; k++) L.add("soga", ...cilEntre(pt(k / N), pt((k + 1) / N), .014, 4));
  let q = .1; while (q < .9) { const an = .45 + r() * .5, al = .55 + r() * .6, g = new THREE.PlaneGeometry(an, al, 3, 5); g.translate(0, -al / 2, 0); const p = pt(q + an / d / 2); L.add("ropa" + (r() * 7 | 0), g, TM(p[0], p[1] + .02, p[2], 0, ry + Math.PI / 2, 0)); q += an / d + .04 + r() * .08 } }
const alfColgada = (L, M, k, an = 1, al = 1.5) => { const g = new THREE.PlaneGeometry(an, al, 4, 6); g.translate(0, -al / 2, 0); L.add("alfv" + k % 4, g, M); const t = new THREE.PlaneGeometry(an, .5); geoUV(t, x => x / an + .5, () => .98); L.add("alf" + k % 4, t, M.clone().multiply(TM(0, .01, -.25, -Math.PI / 2 + .03, 0, 0))) };
const alfPiso = (L, x, z, ry, k, an = 1.6, al = 2.6) => { const g = geoSobreSuelo(-an / 2, an / 2, -al / 2, al / 2, 3, 5, .035); const m4 = TM(x, 0, z, 0, ry, 0), p = g.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.set(p.getX(i), 0, p.getZ(i)).applyMatrix4(m4); p.setXYZ(i, v.x, SUELO(v.x, v.z) + .035 + Math.sin(i * 1.7) * .008, v.z) } g.computeVertexNormals(); L.add("alf" + k % 4, g) };
const rueda = (L, M, R = .62) => { L.add("maderaV", new THREE.TorusGeometry(R, .06, 6, 22), M); L.add("hierro", new THREE.TorusGeometry(R + .05, .025, 4, 22), M); L.add("madera", new THREE.CylinderGeometry(.11, .11, .22, 10), M.clone().multiply(TM(0, 0, 0, Math.PI / 2))); for (let k = 0; k < 8; k++) L.add("maderaV", new THREE.CylinderGeometry(.03, .035, R * 2, 5), M.clone().multiply(TM(0, 0, 0, 0, 0, k / 8 * Math.PI))) };
function carro(L, M, r, carga = 0) { const an = 1.3, la = 2.4; L.add("tablas", new THREE.BoxGeometry(an, .08, la), M.clone().multiply(TM(0, .78, 0))); for (const s of [-1, 1]) { L.add("tablas", new THREE.BoxGeometry(.06, .42, la), M.clone().multiply(TM(s * an / 2, 1.02, 0, 0, 0, -s * .12))); rueda(L, M.clone().multiply(TM(s * (an / 2 + .16), .66, .1, 0, Math.PI / 2, 0))); L.add("madera", new THREE.CylinderGeometry(.04, .045, 2.3, 6), M.clone().multiply(TM(s * .42, .5, 2.2, 1.32, 0, 0))) }
  L.add("tablas", new THREE.BoxGeometry(an, .42, .06), M.clone().multiply(TM(0, 1.02, -la / 2))); L.add("madera", new THREE.CylinderGeometry(.05, .05, an + .5, 7), M.clone().multiply(TM(0, .66, .1, 0, 0, Math.PI / 2))); L.add("madera", new THREE.CylinderGeometry(.04, .04, .9, 6), M.clone().multiply(TM(0, .24, 3.28, 0, 0, Math.PI / 2)));
  if (carga === 0) { const h = new THREE.SphereGeometry(1, 12, 8); h.scale(.62, .5, 1.1); L.add("paja", h, M.clone().multiply(TM(0, 1.1, -.05))) } else if (carga === 1) { for (let k = 0; k < 5; k++) { const s = new THREE.SphereGeometry(.3, 10, 7); s.scale(1, .62, 1.5); L.add("saco", s, M.clone().multiply(TM((k % 2 - .5) * .56, .98 + (k > 3 ? .3 : 0), -.8 + (k >> 1) * .7, 0, r() * .5, 0))) } } else for (let k = 0; k < 5; k++) vasija(L, M.clone().multiply(TM((k % 2 - .5) * .6, .82, -.85 + (k >> 1) * .7)), k % 2 ? "cantaro" : "olla", .75 + r() * .2, k) }
const barril = (L, M) => { const g = new THREE.CylinderGeometry(.34, .34, .9, 14, 4), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const k = 1 + .16 * Math.cos(p.getY(i) / .45 * 1.57); p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k) } g.computeVertexNormals(); L.add("tablas", g, M.clone().multiply(TM(0, .45, 0))); for (const y of [.14, .45, .76]) L.add("hierro", new THREE.TorusGeometry(y === .45 ? .395 : .365, .018, 4, 18), M.clone().multiply(TM(0, y, 0, Math.PI / 2))) };
const cajon = (L, M, s = .7, fr = -1, r) => { for (const [x, z, a, b] of [[0, s / 2, s, .04], [0, -s / 2, s, .04], [s / 2, 0, .04, s], [-s / 2, 0, .04, s]]) for (let k = 0; k < 3; k++) L.add("tablas", new THREE.BoxGeometry(a, s * .2, b), M.clone().multiply(TM(x, s * (.1 + k * .22), z))); L.add("tablas", new THREE.BoxGeometry(s, .04, s), M.clone().multiply(TM(0, .03, 0)));
  if (fr >= 0) for (let k = 0; k < 11; k++) { const a = k * 2.4, d = (k < 7 ? .22 : .08) * s / .7; L.add("fru" + fr % 6, new THREE.SphereGeometry(.11 * s / .7 * (.85 + r() * .3), 9, 7), M.clone().multiply(TM(Math.cos(a) * d, s * (.52 + (k < 7 ? 0 : .13)), Math.sin(a) * d))) } };
const cesta = (L, M, fr = -1, r, s = 1) => { L.add("cesta", new THREE.LatheGeometry([[0, 0], [.24, 0], [.34, .18], [.38, .36], [.4, .38]].map(q => new THREE.Vector2(q[0] * s, q[1] * s)), 14), M); L.add("cesta", new THREE.TorusGeometry(.39 * s, .03 * s, 5, 16), M.clone().multiply(TM(0, .38 * s, 0, Math.PI / 2))); if (fr >= 0) for (let k = 0; k < 9; k++) { const a = k * 2.4, d = (k < 6 ? .2 : .07) * s; L.add("fru" + fr % 6, new THREE.SphereGeometry(.1 * s * (.85 + r() * .3), 8, 6), M.clone().multiply(TM(Math.cos(a) * d, s * (.34 + (k < 6 ? 0 : .1)), Math.sin(a) * d))) } };
const saco = (L, M, r) => { const s = new THREE.SphereGeometry(.34, 10, 8); s.scale(1, 1.25, .8); L.add("saco", s, M.clone().multiply(TM(0, .38, 0, 0, 0, (r() - .5) * .3))); L.add("soga", new THREE.TorusGeometry(.1, .025, 4, 10), M.clone().multiply(TM(0, .74, 0, Math.PI / 2))); L.add("saco", new THREE.ConeGeometry(.12, .16, 8), M.clone().multiply(TM(0, .84, 0, Math.PI))) };
const banco = (L, M, an = 1.9) => { const g = RB(an, .5, .62, .16); geoUV(g, x => .5 + x / 6, (x, y) => .1 + y * .15); L.add("adobe", g, M.clone().multiply(TM(0, .23, 0))) };
// cerca de palos (corral, gallinero): palos desparejos clavados, dos varas atadas y ramas entretejidas
function cercaPalos(L, pts, r, alto = 1.25, puerta = -1) { for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], d = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(2, Math.round(d / .34)); if (i === puerta) { const ya = SUELO(a[0], a[1]), yb = SUELO(b[0], b[1]); for (const [p, y] of [[a, ya], [b, yb]]) L.add("madera", new THREE.CylinderGeometry(.07, .08, alto + .5, 7), TM(p[0], y + (alto + .5) / 2 - .1, p[1])); const mx = lerp(a[0], b[0], .35), mz = lerp(a[1], b[1], .35) + .5; for (const yy of [.3, .75, 1.1]) L.add("maderaV", ...cilEntre([a[0], ya + yy, a[1]], [mx, ya + yy, mz], .035, 5)); L.add("maderaV", ...cilEntre([a[0], ya + .25, a[1]], [mx, ya + 1.15, mz], .03, 5)); continue }
    for (let k = 0; k < n; k++) { const q = k / n, x = lerp(a[0], b[0], q) + (r() - .5) * .05, z = lerp(a[1], b[1], q) + (r() - .5) * .05, hh = alto * (.8 + r() * .4); L.add(k % 4 ? "maderaV" : "madera", new THREE.CylinderGeometry(.028 + r() * .02, .04 + r() * .015, hh, 5), TM(x, SUELO(x, z) + hh / 2 - .08, z, (r() - .5) * .14, r() * 3, (r() - .5) * .14)) }
    for (const yy of [.35, alto * .8]) L.add("madera", ...cilEntre([a[0], SUELO(a[0], a[1]) + yy, a[1]], [b[0], SUELO(b[0], b[1]) + yy + (r() - .5) * .08, b[1]], .03, 5)) } }

// ---------- plantas: se juntan en listas y al final se instancian
const PLANTAS = { saguaro: [], nopal: [], agave: [], palma: [], mata: [], arbusto: [], flor: [] };
const planta = (t, x, z, s = 1, rad = .5) => { PLANTAS[t].push([x, z, s]); if (rad) ocupa(x, z, rad) };
// ---------- cada casa con lo suyo: ristras de ajíes en las vigas, vasijas, banco, escalera de mano, horno, toldo, alfombra, leña, cosas en el techo, tendedero
const TAZAS_E = [];   // las tazas del estante de afuera de la casa del narrador (el motor ya usa el nombre TAZAS para otra cosa)
CASAS_A.forEach((C, ci) => { const r = rng(3100 + ci * 11), HM = TM(C.x, C.g.position.y + .04, C.z, 0, C.ry, 0), { w, d, h } = C, fr = d / 2, mia = C === MI_CASA, Hp = h + .5;
  const W = (x, y, z) => new THREE.Vector3(x, y, z).applyMatrix4(HM), lib = (lx, lz, rad) => { const p = W(lx, 0, lz); return libreEn(p.x, p.z, rad, { salvo: C }) }, oc = (lx, lz, rad) => { const p = W(lx, 0, lz); ocupa(p.x, p.z, rad) }, at = (...a) => HM.clone().multiply(TM(...a));
  const vent = C.F.filter(a => !a.puerta), nv = Math.max(3, Math.round((w - 1.4) / .78));
  for (let k = 0; k < nv; k++) { const x = lerp(-(w / 2 - CASA_R - .25), w / 2 - CASA_R - .25, k / (nv - 1)); if (Math.abs(x - C.px) > 1.2 && r() < (mia ? .5 : .34)) ristra(PB, at(x, h - .43, fr + .36, 0, r() * 6), k + ci) }
  // vasijas al lado de la puerta
  for (const s of [-1, 1]) { const n = r() * 3 | 0; for (let j = 0; j < n; j++) { const x = C.px + s * (1.35 + j * .7), z = fr + .5 + r() * .25; if (Math.abs(x) > w / 2 - .3 || !lib(x, z, .42)) continue; if (mia && vent.some(a => Math.abs((a.x0 + a.x1) / 2 - x) < 1.3)) continue; oc(x, z, .42); vasija(PB, at(x, 0, z, 0, r() * 6), ["olla", "cantaro", "tinaja"][r() * 3 | 0], .8 + r() * .35, ci + j) } }
  // banco de adobe bajo la ventana (con un cuenco o un gato de barro arriba)
  if (!mia && vent.length && r() < .55) { const a = vent[0], x = (a.x0 + a.x1) / 2, z = fr + .34; if (lib(x, z, .9)) { oc(x, z, .95); banco(PB, at(x, 0, z)); vasija(PB, at(x + (r() - .5) * .9, .48, z), r() < .5 ? "cuenco" : "olla", .7, ci + 2); if (r() < .5) alfPisoBanco(at(x - .3, .49, z)) } }
  // escalera de mano al techo (o a la terraza, si tiene piso de arriba)
  if (C.dos || r() < .45) { const sx = C.dos ? -C.lado : (r() < .5 ? 1 : -1), x = sx * (w / 2 + .98), z = C.dos ? fr - 1.4 : (r() - .5) * (d - 2.6); if (lib(x, z, .5)) { oc(x, z, .55); escaleraMano(PB, at(x, 0, z, 0, -sx * Math.PI / 2, 0).multiply(TM(0, 0, 0, .19, 0, 0)), Hp + .5, r() < .5 ? "madera" : "maderaV") } }
  // horno de barro en el patio del costado
  if (ci % 5 < 2 || mia) { const sx = mia ? 1 : r() < .5 ? 1 : -1; for (const s of [sx, -sx]) { const x = s * (w / 2 + 2.3), z = (r() - .5) * 1.6 + .6; if (lib(x, z, 1.9) && lib(x, z + 1.6, .9)) { oc(x, z, 2); horno(PB, at(x, 0, z, 0, (r() - .5) * .5, 0), r); break } } }
  // toldo de tela sobre la puerta
  if (!mia && r() < .34 && lib(C.px, fr + 1.5, 1.25)) { oc(C.px, fr + 1.9, .9); toldo(PB, at(C.px, 0, fr + .03), 2.7, 2, ci, r, 3.5) }
  // alfombra colgada del pretil, a un costado
  if (r() < .42) { const sx = r() < .5 ? 1 : -1; if (!C.dos || sx === -C.lado) alfColgada(PB, at(sx * (w / 2 + .06), Hp + .19, (r() - .5) * (d - 3), 0, sx * Math.PI / 2, 0), ci, .9 + r() * .3, 1.2 + r() * .4) }
  // leña contra el fondo
  if (r() < .4) { const x = (r() - .5) * (w - 3), z = -fr - .36; if (lib(x, z, .8)) { oc(x, z, .85); for (let k = 0; k < 14; k++) { const f = k < 6 ? 0 : k < 11 ? 1 : 2, j = k - [0, 6, 11][f]; PB.add(k % 3 ? "madera" : "maderaV", new THREE.CylinderGeometry(.08 + r() * .03, .09, .5 + r() * .12, 7), at(x + (j - [2.5, 2, 1][f]) * .2, .1 + f * .17, z, Math.PI / 2, 0, 0)) } } }
  // arriba del techo: vasijas, cajones, una estera con ajíes secándose
  { const n = 1 + (r() * 3 | 0); for (let k = 0; k < n; k++) { const x = C.dos ? -C.lado * (.5 + r() * (w / 2 - 1.6)) : (r() - .5) * (w - 2.4), z = (r() - .5) * (d - 2.4), t = r(); if (t < .5) vasija(PB, at(x, h + .1, z, 0, r() * 6), ["olla", "cantaro", "tinaja"][r() * 3 | 0], .7 + r() * .3, ci + k); else if (t < .75) cajon(PB, at(x, h + .1, z, 0, r() * 3), .6, -1, r); else { PB.add("paja", new THREE.BoxGeometry(1.1, .03, .8), at(x, h + .12, z, 0, r() * 3)); for (let j = 0; j < 14; j++) PB.add("aji" + j % 3, new THREE.ConeGeometry(.04, .24, 5), at(x + (r() - .5) * .9, h + .17, z + (r() - .5) * .6, Math.PI / 2, r() * 6, 0)) } } }
  // tendedero desde una esquina del fondo
  if (r() < .26) { const sx = r() < .5 ? 1 : -1, a = W(sx * (w / 2 + .5), 0, -fr + .4), b = W(sx * (w / 2 + 4.4), 0, -fr + .4 + (r() - .5) * 2.4), ok = [.15, .5, .85, 1].every(q => libreEn(lerp(a.x, b.x, q), lerp(a.z, b.z, q), .6, { salvo: C })); if (ok) { [.2, .6, 1].forEach(q => ocupa(lerp(a.x, b.x, q), lerp(a.z, b.z, q), .7)); tendedero(PB, [a.x, SUELO(a.x, a.z), a.z], [b.x, SUELO(b.x, b.z), b.z], r) } }
  // un agave, un nopal o un cactus en una esquina
  for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) if (r() < .3) { const p = W(sx * (w / 2 + .9), 0, sz * (d / 2 + .8)); if (libreEn(p.x, p.z, .7, { salvo: C })) planta(["agave", "nopal", "saguaro", "agave"][r() * 4 | 0], p.x, p.z, .7 + r() * .5, .75) }
  // LA CASA DEL NARRADOR: la repisa de afuera con las tazas (bajo la ventana), y un banco con tinaja
  if (mia) { const a = vent[0], cx = a ? (a.x0 + a.x1) / 2 : C.px + 2.3, y = 1.36, z = fr + .17; PB.add("tablas", new THREE.BoxGeometry(1.9, .06, .34), at(cx, y, z)); for (const s of [-1, 1]) { PB.add("madera", new THREE.BoxGeometry(.07, .3, .3), at(cx + s * .8, y - .17, z - .01)); PB.add("madera", new THREE.BoxGeometry(.06, .34, .05), at(cx + s * .8, y - .2, z + .02, .75, 0, 0)) }
    const cols = ["#e8dcc0", "#c94a3a", "#3a6ea8", "#e0b040", "#5a9a6a", "#f0f0f0", "#8a5a9a", "#d98a5a"]; for (let k = 0; k < 8; k++) { const geo = mergeG([[new THREE.CylinderGeometry(.115, .095, .2, 14, 1, true), TM(0, .1, 0)], [new THREE.CylinderGeometry(.095, .095, .02, 14), TM(0, .01, 0)], [new THREE.TorusGeometry(.065, .02, 6, 12, Math.PI * 1.3), TM(.12, .1, 0, 0, 0, -Math.PI * .65)], [new THREE.TorusGeometry(.115, .012, 5, 14), TM(0, .2, 0, Math.PI / 2)]]);
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: cols[k], roughness: .35, side: THREE.DoubleSide })); m.castShadow = m.receiveShadow = true; scene.add(m); const p = W(cx - .78 + k * .222, y + .035, z + (k % 2 ? .04 : -.03)); m.position.copy(p); m.rotation.y = C.ry + r() * 6; m.userData = { p0: p.clone(), ry: m.rotation.y, piso: SUELO(p.x, p.z) + .02, v: [-(2.2 + r() * 1.6), 2.6 + r() * 1.6, (r() - .5) * 2.2], w: 4 + r() * 6, t0: k * .035 + r() * .05 }; TAZAS_E.push(m) }
    banco(PB, at(C.px - 2.3 < -w / 2 + 1 ? cx + 2.2 : C.px - 2.3, 0, fr + .34), 1.4) } });
function alfPisoBanco(M) { const g = new THREE.BoxGeometry(.7, .04, .58); PB.add("alf1", g, M) }
// q 0→1: las tazas saltan del estante (hacia la calle), caen y rebotan en el piso
function tazasSaltan(q) { TAZAS_E.forEach(m => { const u = m.userData, T = Math.max(0, q * 1.7 - u.t0); if (q <= 0 || T <= 0) { m.position.copy(u.p0); m.rotation.set(0, u.ry, 0); return } let x = u.p0.x, y = u.p0.y, z = u.p0.z, vx = u.v[0], vy = u.v[1], vz = u.v[2], rot = 0, w = u.w, quieta = false; const dt = 1 / 120;
    for (let t = 0; t < T && !quieta; t += dt) { vy -= 9.8 * dt; x += vx * dt; y += vy * dt; z += vz * dt; rot += w * dt; if (y < u.piso + .08) { y = u.piso + .08; if (Math.abs(vy) < .9) { quieta = true; rot = Math.round(rot / Math.PI) * Math.PI + Math.PI / 2 } vy = -vy * .42; vx *= .62; vz *= .62; w *= .6 } }
    m.position.set(x, y, z); m.rotation.set(rot, u.ry, rot * .4 * (quieta ? 0 : 1)) }) }

// ---------- LOS LUGARES DE LAS FRASES
// el pozo: brocal de piedra, techito de paja, rodillo con manivela, soga y balde; al lado, un bebedero de piedra
{ const r = rng(3200), [x, z] = PUNTOS.pozo, y = SUELO(x, z), M = TM(x, y, z, 0, .4, 0), at = (...a) => M.clone().multiply(TM(...a)); PB.add("piedra", new THREE.CylinderGeometry(1.12, 1.2, 1, 22, 1, true), at(0, .5, 0)); PB.add("oscuro", new THREE.CylinderGeometry(.92, .92, 1, 20, 1, true), at(0, .52, 0)); PB.add("agua", new THREE.CircleGeometry(.92, 20), at(0, .42, 0, -Math.PI / 2));
  for (let f = 0; f < 3; f++) for (let k = 0; k < 13; k++) { const a = (k + f * .5) / 13 * 6.283; PB.add(["piedra", "piedra2", "laja"][(k + f) % 3], RB(.5 + r() * .06, .3, .34, .08), at(Math.sin(a) * 1.12, .16 + f * .32, Math.cos(a) * 1.12, (r() - .5) * .08, a, 0)) }
  for (let k = 0; k < 11; k++) { const a = k / 11 * 6.283; PB.add("laja", RB(.6, .1, .5, .04), at(Math.sin(a) * 1.08, 1.06, Math.cos(a) * 1.08, 0, a, (r() - .5) * .06)) }
  for (const s of [-1, 1]) { PB.add("madera", new THREE.CylinderGeometry(.08, .1, 2.9, 8), at(s * 1.35, 1.45, 0)); PB.add("paja", new THREE.BoxGeometry(3.3, .09, 1.25), at(0, 3.02, s * .5, s * .62, 0, 0)); PB.add("madera", new THREE.CylinderGeometry(.05, .05, 3.2, 6), at(0, 2.72, s * 1, 0, 0, Math.PI / 2)) }
  PB.add("madera", new THREE.CylinderGeometry(.06, .06, 3.3, 6), at(0, 3.36, 0, 0, 0, Math.PI / 2)); PB.add("maderaV", new THREE.CylinderGeometry(.13, .13, 2.3, 10), at(0, 2.2, 0, 0, 0, Math.PI / 2)); PB.add("hierro", new THREE.CylinderGeometry(.025, .025, .5, 5), at(1.6, 2.0, 0)); PB.add("hierro", new THREE.CylinderGeometry(.025, .025, .4, 5), at(1.6, 1.78, .18, Math.PI / 2)); PB.add("hierro", new THREE.CylinderGeometry(.025, .025, .3, 5), at(1.48, 2.2, 0, 0, 0, Math.PI / 2));
  for (let k = 0; k < 6; k++) PB.add("soga", new THREE.TorusGeometry(.15, .025, 5, 12), at(-.3 + k * .06, 2.2, 0, 0, Math.PI / 2, 0)); PB.add("soga", new THREE.CylinderGeometry(.02, .02, 1, 5), at(.1, 1.7, .14)); barril(PB, at(.1, 1.1, .5, 0, 0, 0, .55)); PB.add("hierro", new THREE.TorusGeometry(.2, .012, 4, 12, Math.PI), at(.1, 1.58, .5));
  const B = at(2.6, 0, .4, 0, .3, 0); PB.add("piedra2", RB(1.9, .5, .8, .1), B.clone().multiply(TM(0, .25, 0))); PB.add("agua", new THREE.PlaneGeometry(1.6, .54), B.clone().multiply(TM(0, .505, 0, -Math.PI / 2))); vasija(PB, at(-1.9, 0, .9), "cantaro", 1, 1); vasija(PB, at(-2.3, 0, .3), "olla", .9, 2); vasija(PB, at(-1.7, 0, -1.2), "tinaja", .8, 0) }
// el mercado: tres puestos con toldo de rayas (loza, fruta y tejidos), un carro con vasijas, barriles y bolsas
{ const r = rng(3210), [px, pz] = PUNTOS.mercado;
  [[-.6, -4.4, -1.42, 0], [.7, 0, -1.6, 1], [-.5, 4.4, -1.78, 2]].forEach(([dx, dz, ry, tipo], i) => { const x = px + dx, z = pz + dz, M = TM(x, SUELO(x, z), z, 0, ry, 0), at = (...a) => M.clone().multiply(TM(...a));
    PB.add("tablas", new THREE.BoxGeometry(2.7, .08, 1), at(0, 1.08, .9)); for (const sx of [-1, 1]) for (const sz of [.5, 1.3]) PB.add("madera", new THREE.CylinderGeometry(.05, .06, 1.06, 6), at(sx * 1.2, .53, sz)); PB.add("tablas", new THREE.BoxGeometry(2.6, .5, .04), at(0, .78, 1.38));
    for (const sx of [-1, 1]) PB.add("madera", new THREE.CylinderGeometry(.05, .06, 3.4, 7), at(sx * 1.45, 1.7, 0)); PB.add("madera", new THREE.CylinderGeometry(.04, .04, 3, 6), at(0, 3.36, 0, 0, 0, Math.PI / 2)); toldo(PB, at(0, 0, 0), 3.1, 2.3, i * 2 + 1, r, 3.38);
    if (tipo === 0) { for (let k = 0; k < 6; k++) vasija(PB, at(-1.05 + k * .42, 1.12, .9 + (k % 2 ? .18 : -.15), 0, r() * 6), ["olla", "cantaro", "cuenco"][k % 3], .5 + r() * .2, k); for (let k = 0; k < 5; k++) vasija(PB, at(-1.7 + k * .85, 0, 2 + (k % 2) * .35, 0, r() * 6), ["tinaja", "olla", "cantaro"][k % 3], .9 + r() * .3, k + 1); for (let k = 0; k < 4; k++) ristra(PB, at(-1.2 + k * .8, 2.9, 2.28, 0, k), k) }
    else if (tipo === 1) { for (let k = 0; k < 3; k++) cajon(PB, at(-.9 + k * .9, 1.12, .9, 0, (r() - .5) * .3), .7, k, r); for (let k = 0; k < 4; k++) cesta(PB, at(-1.5 + k * 1, 0, 2 + (k % 2) * .3), k + 3, r, 1.1); cajon(PB, at(1.9, 0, 1, 0, .4), .8, 4, r); saco(PB, at(-2, 0, .8), r); saco(PB, at(-2.2, 0, 1.5), r); for (let k = 0; k < 3; k++) ristra(PB, at(-.8 + k * .8, 2.9, 2.28, 0, k), k + 1) }
    else { for (let k = 0; k < 4; k++) PB.add("alf" + k, new THREE.BoxGeometry(.8, .1, .56), at(-.7 + (k % 2) * 1.3, 1.17 + (k >> 1) * .1, .9, 0, (r() - .5) * .3)); for (let k = 0; k < 3; k++) alfColgada(PB, at(-1 + k * 1, 3.3, -.05, 0, Math.PI, 0), k + 1, .9, 1.9); PB.add("ropa2", new THREE.BoxGeometry(.6, .34, .5), at(1.6, .2, 2)); PB.add("ropa1", new THREE.BoxGeometry(.56, .3, .46), at(1.62, .5, 2.02, 0, .3)); cesta(PB, at(-1.7, 0, 2.1), -1, r, 1.2); for (let k = 0; k < 5; k++) PB.add("ropa" + (k + 2) % 7, new THREE.SphereGeometry(.13, 8, 6), at(-1.7 + Math.cos(k * 2) * .16, .42, 2.1 + Math.sin(k * 2) * .16)) } });
  carro(PB, TM(px + 4.2, SUELO(px + 4.2, pz - 2), pz - 2, 0, 2.2, 0), r, 2); barril(PB, TM(px + 2.9, SUELO(px + 2.9, pz + 2.4), pz + 2.4)); barril(PB, TM(px + 3.6, SUELO(px + 3.6, pz + 2.9), pz + 2.9)); saco(PB, TM(px + 3, SUELO(px + 3, pz + 3.6), pz + 3.6), r); alfPiso(PB, px - 2.6, pz + 1.2, -1.5, 2, 1.5, 2.4) }
// la boda: mesa larga con mantel, tazas con su cuchara, platos, jarra y flores; bancos; cuatro postes con guirnaldas de flores y banderines
const BANDERINES = [];   // [ [x,y,z] de un extremo, [x,y,z] del otro ] para colgar banderines (se arman más abajo)
{ const r = rng(3220), [x, z] = PUNTOS.boda, M = TM(x, SUELO(x, z), z, 0, .12, 0), at = (...a) => M.clone().multiply(TM(...a)); alfPiso(PB, x, z, .12 + Math.PI / 2, 0, 3, 5.4);
  PB.add("tablas", new THREE.BoxGeometry(4.3, .08, 1.2), at(0, 1.12, 0)); for (const sx of [-1.8, 0, 1.8]) for (const sz of [-.45, .45]) PB.add("madera", new THREE.CylinderGeometry(.06, .07, 1.1, 7), at(sx, .55, sz));
  PB.add("blanco", new THREE.BoxGeometry(4.5, .03, 1.34), at(0, 1.175, 0)); for (const s of [-1, 1]) { const g = new THREE.PlaneGeometry(4.5, .5, 18, 1), p = g.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) < 0) { p.setZ(i, Math.sin(p.getX(i) * 7) * .05); p.setY(i, p.getY(i) + Math.sin(p.getX(i) * 3.3) * .05) } g.computeVertexNormals(); PB.add("blanco", g, at(0, .93, s * .67, 0, s > 0 ? 0 : Math.PI, 0)) }
  PB.add("alf3", new THREE.BoxGeometry(4.4, .012, .44), at(0, 1.196, 0));
  for (let k = 0; k < 10; k++) { const sx = -1.8 + (k >> 1) * .9, sz = (k % 2 ? 1 : -1) * .38, ck = "cer" + k % 4; PB.add(ck, new THREE.CylinderGeometry(.085, .07, .15, 12, 1, true), at(sx, 1.275, sz)); PB.add(ck, new THREE.CircleGeometry(.07, 10), at(sx, 1.21, sz, -Math.PI / 2)); PB.add(ck, new THREE.TorusGeometry(.05, .016, 5, 10, 4), at(sx + .09, 1.275, sz, 0, 0, -2)); PB.add("bronce", new THREE.CylinderGeometry(.008, .008, .2, 4), at(sx + .02, 1.33, sz, 0, k, .5)); PB.add("bronce", new THREE.SphereGeometry(.022, 6, 4), at(sx + .02 - .05, 1.24, sz));
    vasija(PB, at(sx + .3, 1.19, sz * .95), "cuenco", .42, k + 1) }
  vasija(PB, at(-.4, 1.19, 0), "cantaro", .5, 3); vasija(PB, at(1.3, 1.19, .05), "cantaro", .45, 1); for (const fx of [-1.4, .5]) { vasija(PB, at(fx, 1.19, 0), "olla", .36, 0); for (let k = 0; k < 9; k++) { const a = k * 2.4; PB.add("verde", new THREE.CylinderGeometry(.008, .008, .3, 4), at(fx + Math.cos(a) * .04, 1.52, Math.sin(a) * .04, Math.cos(a) * .3, 0, Math.sin(a) * .3)); PB.add("fru" + [0, 1, 2, 5, 4][k % 5], new THREE.SphereGeometry(.05, 7, 5), at(fx + Math.cos(a) * .1, 1.68 + (k % 3) * .03, Math.sin(a) * .1)) } }
  for (const s of [-1, 1]) { PB.add("tablas", new THREE.BoxGeometry(4, .08, .4), at(0, .62, s * 1.15)); for (const sx of [-1.6, 1.6]) PB.add("madera", new THREE.CylinderGeometry(.16, .18, .6, 9), at(sx, .3, s * 1.15)) }
  // postes y guirnaldas: soga combada con flores y hojas; entre los postes, banderines
  const post = [[-2.9, -2], [2.9, -2], [2.9, 2], [-2.9, 2]].map(([a, b]) => new THREE.Vector3(a, 3.5, b).applyMatrix4(M)); post.forEach(p => { PB.add("madera", new THREE.CylinderGeometry(.06, .08, 3.6, 7), TM(p.x, p.y - 1.75, p.z)); for (let k = 0; k < 6; k++) PB.add("fru" + [0, 5, 1, 2][k % 4], new THREE.SphereGeometry(.07, 7, 5), TM(p.x + Math.cos(k * 1.05) * .1, p.y - .05 - (k >> 1) * .09, p.z + Math.sin(k * 1.05) * .1)) });
  for (let i = 0; i < 4; i++) { const a = post[i], b = post[(i + 1) % 4], N = 14; for (let k = 0; k < N; k++) { const pt = q => [lerp(a.x, b.x, q), a.y - .08 - Math.sin(q * Math.PI) * .55, lerp(a.z, b.z, q)]; PB.add("soga", ...cilEntre(pt(k / N), pt((k + 1) / N), .014, 4)); const p = pt((k + .5) / N); PB.add("fru" + [0, 5, 1, 2, 4][k % 5], new THREE.SphereGeometry(.075, 7, 5), TM(p[0], p[1] - .02, p[2])); PB.add("verde", new THREE.ConeGeometry(.045, .22, 4), TM(p[0], p[1] - .14, p[2], Math.PI + (r() - .5), 0, (r() - .5))) } }
  BANDERINES.push([post[0].toArray(), post[2].toArray()], [post[1].toArray(), post[3].toArray()]);
  vasija(PB, at(-3.3, 0, .6), "tinaja", 1, 3); cesta(PB, at(3.3, 0, -.5), 0, r, 1.1); barril(PB, at(3.4, 0, .9)) }
// el bebé: una ramada de palos y paja; a la sombra, la cuna mecedora con su manta, un móvil de plumas y cuentas, una alfombra y un banquito
const CUNA_BEBE = new THREE.Group(); scene.add(CUNA_BEBE);   // la cuna se puede mecer: CUNA_BEBE.rotation.z
{ const r = rng(3230), [x, z] = PUNTOS.bebe, y = SUELO(x, z), M = TM(x, y, z, 0, -.5, 0), at = (...a) => M.clone().multiply(TM(...a)); alfPiso(PB, x, z, -.5, 1, 2.2, 3);
  for (const [sx, sz] of [[-1.6, -1.5], [1.6, -1.5], [1.6, 1.5], [-1.6, 1.5]]) PB.add("madera", new THREE.CylinderGeometry(.07, .09, 2.9 + sz * .1, 7), at(sx, 1.45 + sz * .05, sz)); for (const sz of [-1.5, 1.5]) PB.add("madera", new THREE.CylinderGeometry(.05, .05, 3.7, 6), at(0, 2.9 + sz * .1, sz, 0, 0, Math.PI / 2));
  for (let k = 0; k < 9; k++) PB.add("maderaV", new THREE.CylinderGeometry(.035, .035, 3.6, 5), at(-1.6 + k * .4, 2.97, 0, Math.PI / 2 - .1, 0, 0)); PB.add("paja", new THREE.BoxGeometry(3.8, .1, 3.7), at(0, 3.05, 0, -.1, 0, 0)); for (let k = 0; k < 16; k++) PB.add("paja", new THREE.ConeGeometry(.06, .6, 4), at(-1.8 + k * .24, 2.75 + .15, 1.9, Math.PI + .2, 0, (r() - .5) * .4));
  { const g = new THREE.PlaneGeometry(2.6, 1.9, 6, 6); g.translate(0, -.95, 0); PB.add("ropa0", g, at(-1.62, 2.85, 0, 0, Math.PI / 2, 0)) }
  CUNA_BEBE.position.set(x, y, z); CUNA_BEBE.rotation.y = -.5; const L = lote(); for (const s of [-1, 1]) { L.add("madera", new THREE.TorusGeometry(.75, .04, 6, 18, 1.5), TM(s * .5, .78, 0, 0, Math.PI / 2, -Math.PI / 2 - .75)); L.add("tablas", new THREE.BoxGeometry(.05, .42, .78), TM(s * .58, .46, 0)); L.add("tablas", new THREE.BoxGeometry(1.2, .36, .04), TM(0, .43, s * .38, s * -.14, 0, 0)) }
  L.add("tablas", new THREE.BoxGeometry(1.16, .05, .7), TM(0, .24, 0)); L.add("blanco", RB(1.05, .16, .62, .07), TM(0, .36, 0)); L.add("ropa2", RB(.7, .12, .66, .05), TM(.16, .45, 0)); L.add("blanco", RB(.3, .1, .4, .05), TM(-.36, .47, 0)); L.add("tablas", new THREE.BoxGeometry(.05, .7, .8), TM(-.6, .62, 0)); L.fin(CUNA_BEBE, PB_M);
  // móvil: dos palitos en cruz con hilos, cuentas y plumas
  PB.add("madera", new THREE.CylinderGeometry(.012, .012, .7, 4), at(0, 2.3, 0, 0, 0, Math.PI / 2)); PB.add("madera", new THREE.CylinderGeometry(.012, .012, .7, 4), at(0, 2.3, 0, Math.PI / 2, 0, 0)); PB.add("soga", new THREE.CylinderGeometry(.008, .008, .62, 4), at(0, 2.62, 0)); for (let k = 0; k < 5; k++) { const [dx, dz] = [[.33, 0], [-.33, 0], [0, .33], [0, -.33], [0, 0]][k], L2 = .25 + r() * .25; PB.add("soga", new THREE.CylinderGeometry(.005, .005, L2, 3), at(dx, 2.3 - L2 / 2, dz)); PB.add("fru" + k, new THREE.SphereGeometry(.045, 7, 5), at(dx, 2.3 - L2, dz)); PB.add("ropa" + (k + 1), new THREE.ConeGeometry(.03, .16, 4), at(dx, 2.3 - L2 - .1, dz, Math.PI, 0, .2)) }
  PB.add("tablas", new THREE.CylinderGeometry(.22, .22, .06, 10), at(1, .42, .6)); for (let k = 0; k < 3; k++) PB.add("madera", new THREE.CylinderGeometry(.025, .03, .42, 5), at(1 + Math.cos(k * 2.1) * .15, .2, .6 + Math.sin(k * 2.1) * .15)); vasija(PB, at(1.2, 0, -.9), "cantaro", .8, 2); cesta(PB, at(-.9, 0, 1), -1, r, .9); PB.add("ropa0", RB(.5, .2, .4, .08), at(-.9, .34, 1)) }
// la escuela: el aula de adobe, y afuera seis pupitres con sus pizarras, el pizarrón en su caballete y el mástil con su banderola
const ESCUELA_A = casaAdobe(PUNTOS.escuela[0] + 4.4, PUNTOS.escuela[1], -Math.PI / 2, 8.2, 5.4, 4.8, 3240, { dos: false, adobe: 4, color: 3, puertaX: 0, abre: .9 });
const BANDERA = (() => { const g = new THREE.PlaneGeometry(1.7, 1, 10, 6), p = g.attributes.position, u = g.attributes.uv; for (let i = 0; i < p.count; i++) { u.setY(i, 1 - (p.getX(i) + .85) / 1.7); if (p.getX(i) > .84) p.setY(i, p.getY(i) * .2) } g.translate(.85, 0, 0); return g })();
{ const r = rng(3241), [x, z] = PUNTOS.escuela, y = SUELO(x, z), at = (...a) => TM(x, y, z).multiply(TM(...a));
  for (let k = 0; k < 6; k++) { const dx = -1.2 - (k >> 1 > 0 ? (k >> 1) * 1.9 : 0), dz = ((k % 2) - .5) * 2.6 + (k >> 1) * .15 - .2, M = at(dx, 0, dz, 0, Math.PI / 2 + (r() - .5) * .16, 0); PB.add("tablas", new THREE.BoxGeometry(1.1, .06, .55), M.clone().multiply(TM(0, 1.12, .32, -.16, 0, 0))); for (const s of [-1, 1]) { PB.add("madera", new THREE.BoxGeometry(.07, 1.1, .07), M.clone().multiply(TM(s * .48, .55, .5))); PB.add("madera", new THREE.BoxGeometry(.07, .62, .07), M.clone().multiply(TM(s * .48, .31, -.45))); PB.add("madera", new THREE.BoxGeometry(.06, .06, 1), M.clone().multiply(TM(s * .48, .2, .02))) }
    PB.add("tablas", new THREE.BoxGeometry(1.1, .06, .36), M.clone().multiply(TM(0, .64, -.45))); PB.add("oscuro", new THREE.BoxGeometry(.34, .02, .26), M.clone().multiply(TM(-.15 + r() * .3, 1.165, .3, -.16, r() * .4, 0))); PB.add("blanco", new THREE.CylinderGeometry(.012, .012, .12, 4), M.clone().multiply(TM(.3, 1.16, .34, -.16, 1, Math.PI / 2))) }
  const P = at(1.25, 0, -2.6, 0, -Math.PI / 2 - .35, 0); PB.add("oscuro", new THREE.BoxGeometry(1.9, 1.25, .05), P.clone().multiply(TM(0, 2.0, 0, -.14, 0, 0))); PB.add("madera", new THREE.BoxGeometry(2.05, .09, .08), P.clone().multiply(TM(0, 2.66, .1, -.14, 0, 0))); PB.add("madera", new THREE.BoxGeometry(2.05, .09, .12), P.clone().multiply(TM(0, 1.34, -.08, -.14, 0, 0))); for (const s of [-1, 1]) { PB.add("madera", new THREE.CylinderGeometry(.04, .045, 3, 6), P.clone().multiply(TM(s * .85, 1.45, .05, -.14, 0, 0))); PB.add("blanco", new THREE.BoxGeometry(.5, .012, .03), P.clone().multiply(TM(s * .3, 2.2 - s * .1, -.03, -.14, 0, .1 * s))) } PB.add("madera", new THREE.CylinderGeometry(.04, .045, 3, 6), P.clone().multiply(TM(0, 1.42, .75, .36, 0, 0)));
  // mástil: base de piedra escalonada, palo alto, driza y banderola
  const mx = x - 3.4, mz = z - 4.6, my = SUELO(mx, mz); for (let k = 0; k < 3; k++) PB.add(k % 2 ? "piedra" : "piedra2", new THREE.CylinderGeometry(.9 - k * .22, .98 - k * .22, .26, 10), TM(mx, my + .13 + k * .26, mz, 0, k)); PB.add("maderaV", new THREE.CylinderGeometry(.05, .085, 7.2, 8), TM(mx, my + 4.2, mz)); PB.add("bronce", new THREE.SphereGeometry(.11, 10, 8), TM(mx, my + 7.85, mz)); PB.add("soga", new THREE.CylinderGeometry(.01, .01, 6.6, 3), TM(mx + .09, my + 4.3, mz));
  const bm = new THREE.Mesh(BANDERA, conViento(new THREE.MeshStandardMaterial({ color: "#2f9a94", bumpMap: T_TRAMA_D, bumpScale: 1.5, roughness: .9 }), 0, .2)); bm.position.set(mx + .06, my + 7.15, mz); bm.rotation.y = -.5; bm.castShadow = true; scene.add(bm); ocupa(mx, mz, 1.1);
  banco(PB, at(1.4, 0, 2.6, 0, Math.PI / 2, 0), 2.2); vasija(PB, at(1.3, 0, 4.2), "tinaja", 1, 1); vasija(PB, at(1.35, .48, 2.2), "cuenco", .6, 2) }
// el gallinero: casilla sobre patas con rampa y techo de paja, nidales, comedero, cerca de palos y tres gallos callados en el palo
{ const r = rng(3250), [x, z] = PUNTOS.gallos, y = SUELO(x, z), at = (...a) => TM(x, y, z, 0, .7, 0).multiply(TM(...a)), n = 11; cercaPalos(PB, Array.from({ length: n + 1 }, (_, k) => [x + Math.cos(k / n * 6.283 + .3) * 3.7, z + Math.sin(k / n * 6.283 + .3) * 3.5]), r, 1.3, 0);
  for (const [sx, sz] of [[-1, -.75], [1, -.75], [1, .75], [-1, .75]]) PB.add("madera", new THREE.CylinderGeometry(.06, .07, .9, 6), at(sx * .9, .45, sz - .9)); PB.add("tablas", new THREE.BoxGeometry(2.1, .08, 1.7), at(0, .9, -.9));
  for (const [dx, dz, an, pr] of [[0, -1.72, 2.1, .06], [-1.02, -.9, .06, 1.7], [1.02, -.9, .06, 1.7]]) PB.add("tablas", new THREE.BoxGeometry(an, 1.2, pr), at(dx, 1.54, dz)); PB.add("tablas", new THREE.BoxGeometry(.7, 1.2, .06), at(-.7, 1.54, -.08)); PB.add("tablas", new THREE.BoxGeometry(.7, 1.2, .06), at(.7, 1.54, -.08)); PB.add("tablas", new THREE.BoxGeometry(.7, .5, .06), at(0, 1.89, -.08)); PB.add("oscuro", new THREE.PlaneGeometry(.7, .7), at(0, 1.29, -.12));
  for (const s of [-1, 1]) PB.add("paja", new THREE.BoxGeometry(2.6, .12, 1.3), at(0, 2.42, -.9 + s * .5, s * .6, 0, 0)); PB.add("tablas", new THREE.BoxGeometry(.5, .05, 1.5), at(0, .5, .6, .62, 0, 0)); for (let k = 0; k < 5; k++) PB.add("madera", new THREE.BoxGeometry(.5, .04, .05), at(0, .16 + k * .17, 1.1 - k * .24, .62, 0, 0));
  for (let k = 0; k < 3; k++) { cajon(PB, at(-2.1, 0, -1.4 + k * .75, 0, 1.57), .62, -1, r); const h2 = new THREE.SphereGeometry(.28, 9, 6); h2.scale(1, .4, 1); PB.add("paja", h2, at(-2.1, .34, -1.4 + k * .75)); for (let j = 0; j < 2 + k % 2; j++) PB.add("blanco", new THREE.SphereGeometry(.07, 8, 6), at(-2.1 + (j - .8) * .13, .46, -1.4 + k * .75 + (j % 2) * .08, 0, 0, 0, 1, 1.25, 1)) }
  PB.add("maderaV", new THREE.CylinderGeometry(.2, .2, 1.3, 9, 1, false, 0, Math.PI), at(1.6, .2, .9, 0, .4, -Math.PI / 2)); PB.add("paja", new THREE.BoxGeometry(1.1, .05, .26), at(1.6, .2, .9, 0, .4, 0)); vasija(PB, at(.9, 0, 1.9), "cuenco", 1, 0); PB.add("agua", new THREE.CircleGeometry(.3, 12), at(.9, .17, 1.9, -Math.PI / 2));
  // el palo y los gallos
  for (const s of [-1, 1]) PB.add("madera", new THREE.CylinderGeometry(.05, .06, 1.5, 6), at(1.9 + s * 1.05 * .5, .75, -1.2 + s * .9)); PB.add("madera", ...(() => { const [g, m] = cilEntre([1.9 - .52, 1.45, -2.1], [1.9 + .52, 1.45, -.3], .04, 6); return [g, at(0, 0, 0).multiply(m)] })());
  [["#b0482a", "#1e3a2a"], ["#e8e0d0", "#3a3a3a"], ["#3a2a22", "#a8301e"]].forEach(([cu, co], k) => { const G = at(1.9 - .3 + k * .32, 1.49, -1.72 + k * .56, 0, 1 + k * .9, 0), mc = SM(cu, { roughness: .8 }), mt = SM(co, { roughness: .6 }), kk = "gal" + k; PB_M[kk] = mc; PB_M[kk + "t"] = mt; const b = new THREE.SphereGeometry(.2, 10, 8); b.scale(1, 1, 1.35); PB.add(kk, b, G.clone().multiply(TM(0, .2, 0, -.25, 0, 0))); PB.add(kk, new THREE.CylinderGeometry(.07, .11, .26, 8), G.clone().multiply(TM(0, .42, .2, .3, 0, 0))); PB.add(kk, new THREE.SphereGeometry(.09, 9, 7), G.clone().multiply(TM(0, .57, .25)));
    PB.add("fru2", new THREE.ConeGeometry(.03, .1, 5), G.clone().multiply(TM(0, .56, .36, Math.PI / 2, 0, 0))); for (let j = 0; j < 3; j++) PB.add("aji0", new THREE.SphereGeometry(.035, 6, 5), G.clone().multiply(TM(0, .66, .2 + j * .045))); PB.add("aji0", new THREE.SphereGeometry(.03, 6, 5), G.clone().multiply(TM(0, .49, .33, 0, 0, 0, 1, 1.6, 1)));
    for (let j = 0; j < 6; j++) { const t = new THREE.ConeGeometry(.045, .5, 5); t.translate(0, .25, 0); PB.add(kk + "t", t, G.clone().multiply(TM((j - 2.5) * .03, .28, -.24, -1.9 + j * .16 + (j % 2) * .1, 0, (j - 2.5) * .1))) } for (const s of [-1, 1]) { PB.add("fru2", new THREE.CylinderGeometry(.012, .012, .2, 4), G.clone().multiply(TM(s * .07, .02, .02))); const al = new THREE.SphereGeometry(.14, 8, 6); al.scale(.35, .8, 1.2); PB.add(kk + "t", al, G.clone().multiply(TM(s * .19, .22, -.02, -.25, 0, 0))) } }) }
// el corral de la cabra: cerca redonda con tranquera, cobertizo de paja, pesebre con pasto, batea de agua y un balde
{ const r = rng(3260), [x, z] = PUNTOS.corral, y = SUELO(x, z), at = (...a) => TM(x, y, z, 0, -.4, 0).multiply(TM(...a)), n = 12; cercaPalos(PB, Array.from({ length: n + 1 }, (_, k) => [x + Math.cos(k / n * 6.283 + 2.9) * 4.1, z + Math.sin(k / n * 6.283 + 2.9) * 3.8]), r, 1.5, 0);
  for (const [sx, sz, hh] of [[-1.4, -2.9, 2.2], [1.4, -2.9, 2.2], [1.4, -1.2, 2.7], [-1.4, -1.2, 2.7]]) PB.add("madera", new THREE.CylinderGeometry(.07, .09, hh, 7), at(sx, hh / 2, sz)); PB.add("paja", new THREE.BoxGeometry(3.4, .14, 2.3), at(0, 2.52, -2.05, .28, 0, 0)); for (let k = 0; k < 7; k++) PB.add("maderaV", new THREE.CylinderGeometry(.03, .03, 2.3, 5), at(-1.5 + k * .5, 2.42, -2.05, Math.PI / 2 + .28, 0, 0));
  { const h2 = new THREE.SphereGeometry(1, 12, 8, 0, 6.283, 0, 1.57); h2.scale(1.1, .7, .8); PB.add("paja", h2, at(.4, 0, -2.2)) } for (const s of [-1, 1]) { PB.add("madera", ...(() => { const [g, m] = cilEntre([-1.9, .05, 1.1 + s * .35], [-1.9 + s * .0, 1, 1.1 - s * .35], .04, 5); return [g, at(0, 0, 0).multiply(m)] })()); PB.add("madera", ...(() => { const [g, m] = cilEntre([-.5, .05, 1.1 + s * .35], [-.5, 1, 1.1 - s * .35], .04, 5); return [g, at(0, 0, 0).multiply(m)] })()) }
  { const h2 = new THREE.SphereGeometry(1, 10, 6); h2.scale(.85, .3, .34); PB.add("paja", h2, at(-1.2, .92, 1.1)) } PB.add("maderaV", new THREE.CylinderGeometry(.26, .26, 1.5, 10, 1, false, 0, Math.PI), at(1.7, .26, .7, 0, .3, -Math.PI / 2)); PB.add("agua", new THREE.PlaneGeometry(1.4, .44), at(1.7, .25, .7, -Math.PI / 2, 0, -.3 + Math.PI / 2 * 0));
  barril(PB, at(2.3, 0, -1.8, 0, 0, 0, .6)); PB.add("madera", new THREE.CylinderGeometry(.2, .22, .5, 9), at(-2.4, .25, -.6)); PB.add("soga", new THREE.TorusGeometry(.22, .035, 5, 14), at(-2.4, .54, -.6, Math.PI / 2)); planta("palma", x + 5.6, z - 3.2, 1.1, .8) }

// ---------- alrededor de la plaza (fuera del radio 9): carros, bancos de tabla, barriles, palos con banderines desde la torre
{ const r = rng(3300); [[-12.4, -8.2, .9, 0], [12.2, 10.6, -2.2, 1], [-11.5, 5.2, 2.6, 0]].forEach(([x, z, ry, c]) => { if (libreEn(x, z, 1.9)) { ocupa(x, z, 2.1); carro(PB, TM(x, SUELO(x, z), z, 0, ry, 0), r, c) } });
  for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283 + .26, x = Math.sin(a) * 11.4, z = Math.cos(a) * 11.4; if (!libreEn(x, z, 1.1)) continue; ocupa(x, z, 1.15); const M = TM(x, SUELO(x, z), z, 0, a, 0), t = k % 3;
    if (t === 0) { PB.add("tablas", new THREE.BoxGeometry(1.9, .08, .42), M.clone().multiply(TM(0, .6, 0))); for (const s of [-1, 1]) PB.add("piedra2", RB(.34, .56, .44, .08), M.clone().multiply(TM(s * .7, .28, 0))) } else if (t === 1) { barril(PB, M.clone().multiply(TM(-.4, 0, 0))); barril(PB, M.clone().multiply(TM(.42, 0, .1, 0, 1, 0, .85))); saco(PB, M.clone().multiply(TM(0, 0, .7)), r) } else { vasija(PB, M.clone().multiply(TM(-.4, 0, 0)), "tinaja", 1, k); vasija(PB, M.clone().multiply(TM(.45, 0, .2)), "cantaro", 1, k + 1); cesta(PB, M.clone().multiply(TM(0, 0, .8)), k, r, 1) } }
  // cuatro tiras de banderines: de los postes de la escalera de la torre a palos altos en el borde de la plaza
  for (const [a, px, pz] of [[1.15, 12.6, 2.6], [-1.15, -12.6, 2.2], [2.3, 10.5, -17.5], [-2.3, -11, -17]]) { if (!libreEn(px, pz, .5, { zona: 1 })) continue; ocupa(px, pz, .6); const y = SUELO(px, pz); PB.add("maderaV", new THREE.CylinderGeometry(.06, .09, 5.4, 7), TM(px, y + 2.7, pz)); PB.add("bronce", new THREE.SphereGeometry(.09, 8, 6), TM(px, y + 5.45, pz)); BANDERINES.push([[TORRE[0] + Math.sin(a) * 4.5, 12.6, TORRE[1] + Math.cos(a) * 4.5], [px, y + 5.3, pz]]) }
  BANDERINES.forEach(([a, b], i) => { const d = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), N = Math.max(6, Math.round(d / .55)), comba = Math.min(1.6, d * .07), ry = Math.atan2(b[0] - a[0], b[2] - a[2]), pt = q => [lerp(a[0], b[0], q), lerp(a[1], b[1], q) - Math.sin(q * Math.PI) * comba, lerp(a[2], b[2], q)];
    for (let k = 0; k < N; k++) { PB.add("soga", ...cilEntre(pt(k / N), pt((k + 1) / N), .012, 4)); const g = new THREE.PlaneGeometry(.34, .46, 1, 2), p = g.attributes.position; for (let j = 0; j < p.count; j++) { const yy = p.getY(j); p.setX(j, p.getX(j) * (yy > .2 ? 1 : yy > -.1 ? .5 : 0)); p.setY(j, yy - .23) } const c = pt((k + .5) / N); PB.add("ropa" + (k + i) % 7, g, TM(c[0], c[1], c[2], 0, ry + Math.PI / 2, 0)) } }) }
// ---------- palmeras (tronco anillado que se curva, copa de frondas con sus folíolos, pollera de hojas secas, racimos de dátiles)
const GEO_FRONDA = (() => { const L = [], N = 18, pt = q => new THREE.Vector3(0, .95 * q - 1.75 * q * q, q * 3.5), hoja = (len, w0) => { const g = new THREE.PlaneGeometry(1, 1, 1, 1); g.translate(0, .5, 0); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setX(i, p.getX(i) * (p.getY(i) > .5 ? .15 : 1)); g.scale(w0, len, 1); return g };
  for (let k = 0; k < N; k++) { const q = k / N, a = pt(q), b = pt(q + 1 / N), g = new THREE.CylinderGeometry(.03 * (1 - q) + .008, .035 * (1 - q) + .008, 1, 4); geoUV(g, () => 0, () => 1 - q); L.push([g, MZ(a.clone().add(b).multiplyScalar(.5), b.clone().sub(a), new THREE.Vector3(1, a.distanceTo(b), 1))]);
    if (k > 1) for (const s of [-1, 1]) { const len = .95 * Math.sin(Math.min(1, q * 1.15) * Math.PI) + .22, h = hoja(len, .13); geoUV(h, () => 0, (x, y) => 1 - Math.min(1, q + y / len * .25)); L.push([h, MZ(a, new THREE.Vector3(s * 1, -.55 - q * .5, .55), new THREE.Vector3(1, 1, 1))]) } }
  return mergeG(L) })();
function palma(L, x, z, s, r) { const y = SUELO(x, z) - .1, H = (6.2 + r() * 3.4) * s, la = r() * 6.283, lean = (.5 + r() * 1.6) * s, n = 13, top = new THREE.Vector3(); L.add("tronco", new THREE.SphereGeometry(.5 * s, 10, 6, 0, 6.283, 0, 1.57), TM(x, y, z, 0, 0, 0, 1, .7, 1));
  for (let k = 0; k < n; k++) { const q = k / n, q1 = (k + 1) / n, c = qq => new THREE.Vector3(x + Math.cos(la) * lean * qq * qq, y + H * qq, z + Math.sin(la) * lean * qq * qq), a = c(q), b = c(q1); L.add("tronco", new THREE.CylinderGeometry((.25 - .09 * q) * s, (.31 - .09 * q) * s, 1, 9), MZ(a.clone().add(b).multiplyScalar(.5), b.clone().sub(a), new THREE.Vector3(1, a.distanceTo(b) * 1.04, 1))); top.copy(b) }
  const nf = 15; for (let k = 0; k < nf; k++) L.add("fronda", GEO_FRONDA, TM(top.x, top.y + .1, top.z, -.75 + (k % 5) * .28 + r() * .12, k / nf * 6.283 * 2.01 + r() * .2, 0, s * (.85 + r() * .3)));
  for (let k = 0; k < 7; k++) L.add("frondaS", GEO_FRONDA, TM(top.x, top.y - .1, top.z, 1.05 + r() * .25, k / 7 * 6.283 + r() * .4, 0, s * (.6 + r() * .2)));
  for (let k = 0; k < 3; k++) { const a = k * 2.2 + r(); for (let j = 0; j < 14; j++) L.add("fru0", new THREE.SphereGeometry(.07 * s, 6, 5), TM(top.x + Math.cos(a) * (.35 + (j % 3) * .06) * s, top.y - .35 * s - (j / 3 | 0) * .1 * s, top.z + Math.sin(a) * (.35 + ((j + 1) % 3) * .06) * s)) } }
// ---------- cactus, nopales, agaves, matas secas, arbustos secos, flores y piedras (instanciados)
const geoSaguaro = seed => { const r = rng(seed), L = [], col = (rad, H, M) => { const g = new THREE.CylinderGeometry(rad * .92, rad, H, 14, 5), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const a = Math.atan2(p.getZ(i), p.getX(i)), k = 1 + .1 * Math.cos(a * 8); p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k) } g.translate(0, H / 2, 0); g.computeVertexNormals(); L.push([g, M]); const t = new THREE.SphereGeometry(rad * .95, 14, 7, 0, 6.283, 0, 1.57); L.push([t, M.clone().multiply(TM(0, H, 0))]) };
  const H = 3.4 + r() * 2; col(.34, H, new THREE.Matrix4()); const nb = 1 + (r() * 3 | 0); for (let k = 0; k < nb; k++) { const a = r() * 6.283 + k * 2.2, y0 = H * (.3 + r() * .3), sal = .7 + r() * .3, hb = 1 + r() * 1.5; const M = TM(Math.cos(a) * .2, y0, Math.sin(a) * .2, 0, -a, 0); L.push([new THREE.CylinderGeometry(.2, .22, sal, 10), M.clone().multiply(TM(sal / 2, 0, 0, 0, 0, Math.PI / 2))]); L.push([new THREE.SphereGeometry(.23, 10, 8), M.clone().multiply(TM(sal, 0, 0))]); col(.21, hb, M.clone().multiply(TM(sal, 0, 0))) }
  return mergeG(L) };
const geoNopal = seed => { const r = rng(seed), A = [], B = [], pala = (M, n) => { const g = new THREE.SphereGeometry(.42, 10, 8); g.scale(.82, 1, .16); g.translate(0, .4, 0); A.push([g, M]); if (n > 0) { const h = 1 + (r() * 2.5 | 0); for (let k = 0; k < h; k++) pala(M.clone().multiply(TM((r() - .5) * .5, .7, 0, (r() - .5) * .5, r() * 1.5, (r() - .5) * 1.3, .72 + r() * .2)), n - 1) } else for (let k = 0; k < 3; k++) if (r() < .6) B.push([new THREE.SphereGeometry(.075, 7, 5), M.clone().multiply(TM((k - 1) * .2, .82 - Math.abs(k - 1) * .06, 0, 0, 0, 0, 1, 1.4, 1))]) };
  for (let k = 0; k < 3; k++) pala(TM((r() - .5) * .5, -.05, (r() - .5) * .5, (r() - .5) * .3, r() * 3, (r() - .5) * .5), 2); return [mergeG(A), B.length ? mergeG(B) : new THREE.SphereGeometry(.01)] };
const geoAgave = seed => { const r = rng(seed), L = [], n = 17; for (let k = 0; k < n; k++) { const q = k / n, len = .8 + q * .9 + r() * .2, g = new THREE.ConeGeometry(.17, len, 4, 3); g.scale(1, 1, .3); g.translate(0, len / 2, 0); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i) / len; p.setZ(i, p.getZ(i) - y * y * (.15 + q * .5)) } g.computeVertexNormals(); L.push([g, TM(0, 0, 0, .25 + q * 1.0, k * 2.4, 0)]) } if (seed % 2) { L.push([new THREE.CylinderGeometry(.04, .07, 3.4, 6), TM(0, 1.7, 0)]); for (let k = 0; k < 9; k++) L.push([new THREE.SphereGeometry(.13, 6, 5), TM(Math.cos(k * 2.4) * (.3 - k * .02), 2.3 + k * .13, Math.sin(k * 2.4) * (.3 - k * .02))]) } return mergeG(L) };
const geoMata = seed => { const r = rng(seed), L = []; for (let k = 0; k < 11; k++) { const h = .35 + r() * .5; L.push([new THREE.ConeGeometry(.022, h, 3), TM((r() - .5) * .2, h / 2 * .9, (r() - .5) * .2, (r() - .5) * 1, r() * 6, (r() - .5) * 1)]) } return mergeG(L) };
const geoArbusto = seed => { const r = rng(seed), L = [], rama = (p, d, len, n) => { const b = p.clone().addScaledVector(d, len); L.push([new THREE.CylinderGeometry(.008 + n * .006, .012 + n * .008, 1, 4), MZ(p.clone().add(b).multiplyScalar(.5), d, new THREE.Vector3(1, len, 1))]); if (n > 0) for (let k = 0; k < 3; k++) rama(b, d.clone().add(new THREE.Vector3(r() - .5, r() * .5, r() - .5).multiplyScalar(1.3)).normalize(), len * .68, n - 1) }; for (let k = 0; k < 6; k++) rama(new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(k * 1.05), .5 + r() * .8, Math.sin(k * 1.05)).normalize(), .34 + r() * .15, 3); return mergeG(L) };
const GEO_FLOR = (() => { const r = rng(3330), A = [], B = [], C = []; for (let k = 0; k < 7; k++) { const x = (r() - .5) * .5, z = (r() - .5) * .5, h = .18 + r() * .22; A.push([new THREE.CylinderGeometry(.008, .01, h, 3), TM(x, h / 2, z)]); A.push([new THREE.ConeGeometry(.04, .12, 3), TM(x + .04, h * .4, z, 0, r() * 6, 1)]); for (let j = 0; j < 5; j++) { const a = j / 5 * 6.283, pg = new THREE.SphereGeometry(.035, 5, 4); pg.scale(1, .3, .6); B.push([pg, TM(x + Math.cos(a) * .04, h + .01, z + Math.sin(a) * .04, 0, -a, .35)]) } C.push([new THREE.SphereGeometry(.022, 5, 4), TM(x, h + .015, z)]) } return [mergeG(A), mergeG(B), mergeG(C)] })();
{ const r = rng(3340), cc = new THREE.Color();
  // dónde va cada cosa
  for (let k = 0, z = -27; z > -108; z -= 7.5 + r() * 4, k++) { const x = (k % 2 ? 1 : -1) * (14.3 + r() * 1.4); if (libreEn(x, z, 1)) planta("palma", x, z, .9 + r() * .3, 1) }
  for (let k = 0; k < 60 && PLANTAS.palma.length < 26; k++) { const a = r() * 6.283, d = k < 20 ? 14.5 + r() * 3.5 : 40 + r() * 34, x = Math.cos(a) * d, z = Math.sin(a) * d + (k < 20 ? 0 : 6); if (libreEn(x, z, 1.5)) planta("palma", x, z, .85 + r() * .4, 1.2) }
  for (const e of EST) for (let k = 0; k < 3; k++) { const a = r() * 6.283, x = e.x + Math.cos(a) * 6.6, z = e.z + Math.sin(a) * 6.6; if (Math.abs(x) > 12.6 && libreEn(x, z, .4)) planta("flor", x, z, 1 + r(), 0) }
  const esparce = (t, n, d0, d1, rad, s0, s1, extra) => { for (let k = 0, m = 0; k < n * 6 && m < n; k++) { const a = r() * 6.283, d = d0 + Math.pow(r(), .8) * (d1 - d0), x = Math.cos(a) * d, z = Math.sin(a) * d * 1.05 - (extra ? 30 : 0); if (z < -205 || !libreEn(x, z, rad)) continue; if (sueloN(x, z, 1)[1] < .86) continue; planta(t, x, z, s0 + r() * (s1 - s0), rad * (t === "mata" || t === "flor" ? 0 : 1)); m++ } };
  esparce("saguaro", 70, 28, 150, .7, .7, 1.4); esparce("saguaro", 26, 20, 110, .7, .8, 1.5, 1); esparce("nopal", 60, 24, 130, .8, .7, 1.4); esparce("agave", 80, 22, 140, .7, .6, 1.3); esparce("agave", 22, 20, 100, .7, .7, 1.3, 1);
  esparce("arbusto", 240, 16, 170, .5, .8, 2); esparce("mata", 1500, 11, 180, .2, .7, 1.9); esparce("mata", 300, 14, 120, .2, .7, 1.6, 1); esparce("flor", 240, 12, 70, .25, .8, 1.8);
  PLANTAS.palma.forEach(([x, z, s]) => palma(PB, x, z, s, r));
  const inst = (geos, mat, lista, fy = 0, col = null, tilt = .12) => { const ms = geos.map(g => { const m = new THREE.InstancedMesh(g, mat, lista.length); m.castShadow = m.receiveShadow = true; m.count = 0; scene.add(m); return m }); lista.forEach(([x, z, s], i) => { const m = ms[i % ms.length], n = m.count++; dummy.position.set(x, SUELO(x, z) + fy * s, z); dummy.rotation.set((r() - .5) * tilt, r() * 6.283, (r() - .5) * tilt); dummy.scale.setScalar(s); dummy.updateMatrix(); m.setMatrixAt(n, dummy.matrix); if (col) m.setColorAt(n, cc.set(col[r() * col.length | 0])) }); return ms };
  inst([geoSaguaro(1), geoSaguaro(2), geoSaguaro(3), geoSaguaro(4)], M_CACTUS, PLANTAS.saguaro, -.05, ["#ffffff", "#e8f0d8", "#d8e8c8", "#f0e8c8"]);
  { const g = [geoNopal(1), geoNopal(2), geoNopal(3)]; const a = inst(g.map(q => q[0]), M_NOPAL, PLANTAS.nopal, 0, ["#ffffff", "#e0f0d0", "#f0f0c8"], 0), b = g.map((q, i) => { const m = new THREE.InstancedMesh(q[1], M_AJI[1], a[i].count); for (let k = 0; k < a[i].count; k++) { a[i].getMatrixAt(k, dummy.matrix); m.setMatrixAt(k, dummy.matrix) } m.castShadow = true; scene.add(m); return m }) }
  inst([geoAgave(2), geoAgave(3), geoAgave(4)], M_AGAVE, PLANTAS.agave, 0, ["#ffffff", "#d8e8e0", "#e8f0c8", "#c8d8d8"]);
  inst([geoMata(1), geoMata(2), geoMata(3)], M_MATA, PLANTAS.mata, 0, ["#c9b06a", "#b8a058", "#d8c07a", "#a89a5a", "#9aa05a"], .2);
  inst([geoArbusto(1), geoArbusto(2), geoArbusto(3)], SM("#8a6a48", { roughness: 1 }), PLANTAS.arbusto, 0, null, .2);
  { const a = inst([GEO_FLOR[0]], SM("#6a8a3a", { roughness: .9 }), PLANTAS.flor, 0, null, 0)[0]; for (const [g, m, col] of [[GEO_FLOR[1], new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .6 }), ["#f0c020", "#c060c0", "#f0f0e8", "#f08030", "#e04060"]], [GEO_FLOR[2], SM("#5a3a1a"), null]]) { const b = new THREE.InstancedMesh(g, m, a.count); for (let k = 0; k < a.count; k++) { a.getMatrixAt(k, dummy.matrix); b.setMatrixAt(k, dummy.matrix); if (col) b.setColorAt(k, cc.set(col[(k * 7 + (k >> 2)) % col.length])) } scene.add(b) } }
  // piedras: grandes en las afueras y en la loma, medianas por todos lados, guijarros hasta en la calle (son más chicos que un pie)
  const P = []; const piedras = (n, d0, d1, s0, s1, rad, corr) => { for (let k = 0, m = 0; k < n * 5 && m < n; k++) { const a = r() * 6.283, d = d0 + r() * (d1 - d0), x = Math.cos(a) * d, z = Math.sin(a) * d * 1.1 - (corr ? 40 : 0); if (z < -215) continue; if (rad ? !libreEn(x, z, rad) : (Math.hypot(x, z) < 12.5 || (Math.abs(x) < 4 && z > 6 && z < 54) || !libreEn(x, z, .05, { zona: 1 }))) continue; const s = s0 + r() * r() * (s1 - s0); P.push([x, z, s]); if (rad) ocupa(x, z, s * .9); m++ } };
  piedras(120, 34, 190, .6, 2.4, 1.2); piedras(60, 30, 130, .6, 2.6, 1.2, 1); piedras(520, 13, 170, .16, .55, .4); piedras(2600, 3, 150, .04, .12, 0); piedras(700, 10, 110, .04, .13, 0, 1);
  const ms = GEO_PIEDRAS.map(g => { const m = new THREE.InstancedMesh(g, M_PIEDRA, Math.ceil(P.length / 3) + 1); m.castShadow = m.receiveShadow = true; m.count = 0; scene.add(m); return m }); P.forEach(([x, z, s], i) => { const m = ms[i % 3], n = m.count++; dummy.position.set(x, SUELO(x, z) + s * .18, z); dummy.rotation.set(r() * .6, r() * 6.283, r() * .6); dummy.scale.set(s * (1 + r() * .5), s * (.7 + r() * .5), s); dummy.updateMatrix(); m.setMatrixAt(n, dummy.matrix); m.setColorAt(n, cc.set(["#a8927a", "#8f7a66", "#b8a488", "#9a6a50", "#c0a080", "#7e6c5c"][r() * 6 | 0])) }) }
PB.fin(scene, PB_M);

// ---------- EFECTOS
// tormenta de arena alrededor de la cámara: granos que vuelan, vetas horizontales rápidas y velos que pasan
const TORM = (() => { const N = 3600, pos = new Float32Array(N * 3), b = new Float32Array(N * 4), r = rng(3400); for (let k = 0; k < N; k++) { b[k * 4] = r() * 70; b[k * 4 + 1] = r() * 26; b[k * 4 + 2] = r() * 70; b[k * 4 + 3] = .6 + r() * .9 }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); const pts = new THREE.Points(g, new THREE.PointsMaterial({ map: GLOW, color: "#f0c080", size: .34, transparent: true, opacity: .8, depthWrite: false, sizeAttenuation: true })); pts.frustumCulled = false; pts.visible = false; scene.add(pts);
  const T_VETA = tex(256, 16, (g2, w, h) => { const gr = g2.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(.5, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g2.fillStyle = gr; g2.fillRect(0, 0, w, h); const g3 = g2.createLinearGradient(0, 0, 0, h); g3.addColorStop(0, "rgba(0,0,0,1)"); g3.addColorStop(.5, "rgba(0,0,0,0)"); g3.addColorStop(1, "rgba(0,0,0,1)"); g2.globalCompositeOperation = "destination-out"; g2.fillStyle = g3; g2.fillRect(0, 0, w, h) });
  const NV = 150, vg = new THREE.PlaneGeometry(1, 1), vetas = new THREE.InstancedMesh(vg, new THREE.MeshBasicMaterial({ map: T_VETA, color: "#ffd9a0", transparent: true, opacity: .5, depthWrite: false, side: THREE.DoubleSide, fog: false }), NV); vetas.frustumCulled = false; vetas.visible = false; scene.add(vetas); const vb = Array.from({ length: NV }, () => [r() * 50, r() * 16, r() * 50, 4 + r() * 9, .05 + r() * .22, .7 + r() * .8, r() < .5]);
  const velos = Array.from({ length: 16 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: i % 2 ? "#d89a58" : "#e8b070", transparent: true, opacity: 0, depthWrite: false })); s.visible = false; scene.add(s); return { s, d: [r() * 44, r() * 9, r() * 44, 9 + r() * 14, .5 + r() * .8] } });
  return { pts, pos, b, N, vetas, vb, velos } })();
const modp = (v, m) => ((v % m) + m) % m;
function tormenta(t, camPos, fuerza = 1) { const c = Array.isArray(camPos) ? camPos : [camPos.x, camPos.y, camPos.z], f = cl(fuerza), on = f > .001; TORM.pts.visible = TORM.vetas.visible = on; TORM.velos.forEach(v => v.s.visible = on); RAFAGA.value = 1 + f * 3; if (!on) return;
  const { pos, b, N } = TORM, vx = 34, n = Math.round(N * (.25 + .75 * f)); for (let k = 0; k < n; k++) { const v = b[k * 4 + 3]; pos[k * 3] = c[0] - 35 + modp(b[k * 4] + t * vx * v - c[0], 70); pos[k * 3 + 1] = c[1] - 9 + modp(b[k * 4 + 1] + Math.sin(t * 1.7 + k) * .8 + t * 1.5 * (v - 1) - c[1], 26); pos[k * 3 + 2] = c[2] - 35 + modp(b[k * 4 + 2] + t * 7 * v + Math.sin(t * .9 + k * .3) * 1.5 - c[2], 70) }
  TORM.pts.geometry.setDrawRange(0, n); TORM.pts.geometry.attributes.position.needsUpdate = true; TORM.pts.material.opacity = .45 + .4 * f;
  TORM.vb.forEach(([x, y, z, L, an, v, vert], k) => { dummy.position.set(c[0] - 25 + modp(x + t * 58 * v - c[0], 50), c[1] - 6 + modp(y + Math.sin(t * .8 + k) * .6 - c[1], 16), c[2] - 25 + modp(z + t * 12 * v - c[2], 50)); dummy.rotation.set(vert ? 0 : -Math.PI / 2, .2, 0); dummy.scale.set(L * (.6 + f), an, 1); dummy.updateMatrix(); TORM.vetas.setMatrixAt(k, dummy.matrix) }); TORM.vetas.instanceMatrix.needsUpdate = true; TORM.vetas.material.opacity = .42 * f; TORM.vetas.count = Math.round(150 * f);
  TORM.velos.forEach(({ s, d }, k) => { s.position.set(c[0] - 22 + modp(d[0] + t * 15 * d[4] - c[0], 44), c[1] - 3 + d[1], c[2] - 22 + modp(d[2] + t * 3 - c[2], 44)); s.scale.set(d[3] * 1.6, d[3], 1); s.material.opacity = .2 * f * (.6 + .4 * Math.sin(t * 1.3 + k)) }) }
// el incendio de hace 60 años: una casa del borde oeste en llamas (llamas, brasas que suben, humo negro)
const T_LLAMA_D = tex(128, 256, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h * .72, 4, w / 2, h * .62, h * .55); gr.addColorStop(0, "rgba(255,250,220,1)"); gr.addColorStop(.25, "rgba(255,200,80,.95)"); gr.addColorStop(.55, "rgba(255,110,20,.6)"); gr.addColorStop(1, "rgba(160,30,0,0)"); g.fillStyle = gr; g.beginPath(); g.moveTo(w / 2, 0); g.bezierCurveTo(w * 1.05, h * .45, w, h, w / 2, h); g.bezierCurveTo(0, h, -w * .05, h * .45, w / 2, 0); g.fill() });
const FUEGO_CASA = CASAS_A.filter(c => c !== MI_CASA && c !== ESCUELA_A).reduce((a, c) => Math.hypot(c.x + 24, c.z - 8) < Math.hypot(a.x + 24, a.z - 8) ? c : a);
const FUEGO_POS = [FUEGO_CASA.x, FUEGO_CASA.g.position.y + FUEGO_CASA.h + 1.2, FUEGO_CASA.z];
const FUEGO = (() => { const r = rng(3410), C = FUEGO_CASA, G = new THREE.Group(); G.position.copy(C.g.position); G.rotation.y = C.ry; scene.add(G); G.visible = false; const ll = [], hu = [];
  for (let k = 0; k < 30; k++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: T_LLAMA_D, color: "#ffffff", transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); s.center.set(.5, .1); const t = k % 3; ll.push({ s, p: t === 0 ? [(r() - .5) * (C.w - 1), C.h + .2, (r() - .5) * (C.d - 1)] : t === 1 ? [(r() - .5) * C.w, 1.6 + r() * 2, C.d / 2 + .2] : [(r() < .5 ? -1 : 1) * (C.w / 2 + .2), 1.4 + r() * 2.4, (r() - .5) * C.d], e: 1 + r() * 1.5, f: r() * 6 }); G.add(s) }
  for (let k = 0; k < 12; k++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#1a1412", transparent: true, depthWrite: false, opacity: .5 })); hu.push({ s, f: k / 12, x: (r() - .5) * 3 }); G.add(s) }
  const NB = 160, bp = new Float32Array(NB * 3), bg = new THREE.BufferGeometry(); bg.setAttribute("position", new THREE.BufferAttribute(bp, 3)); const br = new THREE.Points(bg, new THREE.PointsMaterial({ map: GLOW, color: "#ffb050", size: .22, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); br.frustumCulled = false; G.add(br); const bd = Array.from({ length: NB }, () => [(r() - .5) * C.w, r(), (r() - .5) * C.d, .5 + r(), r() * 6]);
  const resp = glowSprite("#ff7a2a", 16, false); resp.visible = false; return { G, ll, hu, br, bp, bd, resp } })();
function fuegoViejo(t, on = true) { FUEGO.G.visible = FUEGO.resp.visible = !!on; if (!on) return; const C = FUEGO_CASA; FUEGO.ll.forEach(({ s, p, e, f }) => { const k = .75 + .25 * Math.sin(t * 11 + f) + .15 * Math.sin(t * 23 + f * 2); s.position.set(p[0] + Math.sin(t * 7 + f) * .12, p[1], p[2]); s.scale.set(e * (.8 + .2 * Math.sin(t * 9 + f)), e * 1.9 * k, 1); s.material.opacity = .6 });
  FUEGO.hu.forEach(({ s, f, x }) => { const q = (t * .14 + f) % 1; s.position.set(x + q * 7, C.h + 1 + q * 16, q * 3); s.scale.setScalar(3 + q * 9); s.material.opacity = .55 * Math.sin(q * Math.PI) });
  FUEGO.bd.forEach(([x, f, z, v, ph], k) => { const q = (t * .22 * v + f) % 1; FUEGO.bp[k * 3] = x + Math.sin(t * 2 + ph) * .6 + q * 3; FUEGO.bp[k * 3 + 1] = C.h * .6 + q * 11; FUEGO.bp[k * 3 + 2] = z + Math.cos(t * 1.7 + ph) * .6 }); FUEGO.br.geometry.attributes.position.needsUpdate = true;
  FUEGO.resp.position.set(...FUEGO_POS); FUEGO.resp.material.opacity = .5 + .12 * Math.sin(t * 13) }

// ---------- lo que se mueve siempre: humo de los hornos, polvo a ras del piso, buitres sobre la cresta, arbustos que ruedan, agua, nubes, viento
const HUMO_D = HUMOS.slice(0, 12).map((p, i) => Array.from({ length: 5 }, (_, k) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#cfc4b4", transparent: true, opacity: 0, depthWrite: false })); scene.add(s); return { s, p, f: k / 5 + i * .37 } })).flat();
const POLVO_D = (() => { const r = rng(3420); return Array.from({ length: 44 }, (_, k) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#e8cfa4", transparent: true, opacity: 0, depthWrite: false })); scene.add(s); return { s, x: r() * 150, z: (r() - .5) * 150 + (k % 4 === 0 ? -80 : 0), v: 2.2 + r() * 3.5, e: 2.5 + r() * 4, f: r() * 6 } }) })();
const BUITRES = (() => { const ala = new THREE.Shape(); ala.moveTo(0, -.22); ala.lineTo(1.5, -.3); ala.lineTo(1.75, -.42); ala.lineTo(1.72, -.2); ala.lineTo(1.95, -.24); ala.lineTo(1.85, -.04); ala.lineTo(2.05, .0); ala.lineTo(1.85, .14); ala.lineTo(1, .26); ala.lineTo(0, .22); const ga = new THREE.ShapeGeometry(ala); ga.rotateX(-Math.PI / 2); const mo = new THREE.MeshStandardMaterial({ color: "#2a2420", roughness: .9, side: THREE.DoubleSide });
  return [0, 1, 2].map(i => { const g = new THREE.Group(); scene.add(g); const c = part(new THREE.SphereGeometry(.26, 10, 8), mo, 0, 0, 0, g, 0); c.scale.set(1, .8, 2.3); part(new THREE.SphereGeometry(.12, 8, 6), SM("#b8685a"), 0, .06, .66, g, 0); const co = part(new THREE.ConeGeometry(.3, .55, 5), mo, 0, 0, -.72, g, 0); co.rotation.x = -Math.PI / 2; co.scale.set(1, 1, .25); const al = [-1, 1].map(s => { const piv = new THREE.Group(); g.add(piv); const m = new THREE.Mesh(ga, mo); m.scale.x = s; m.castShadow = true; piv.add(m); return piv }); g.scale.setScalar(1.5); return { g, al, i } }) })();
const RODANTES = [0, 1].map(i => { const m = new THREE.Mesh(geoArbusto(7 + i), SM("#9a7a52", { roughness: 1 })); const m2 = new THREE.Mesh(geoArbusto(11 + i), m.material); m2.rotation.x = Math.PI; m.add(m2); m.castShadow = true; m.scale.setScalar(1.5); scene.add(m); return m });
function ambiente(t) { const A = ENV[ENVNOW] || {}, d = SOL.dir || A.sol || [-.5, .4, .77], l = Math.hypot(d[0], d[1], d[2]), cy = SUELO(SOL.x, SOL.z);
  sun.position.set(SOL.x + d[0] / l * 140, cy + d[1] / l * 140, SOL.z + d[2] / l * 140); sun.target.position.set(SOL.x, cy, SOL.z); sun.target.updateMatrixWorld();
  { const c = sun.shadow.camera; if (c.right !== SOL.r) { c.left = -SOL.r; c.right = SOL.r; c.top = SOL.r; c.bottom = -SOL.r; c.near = 1; c.far = 330; c.updateProjectionMatrix() } }
  if (A.nube) NUBES_D.ms.forEach(m => { m.color.set(A.nube[0]); m.opacity = A.nube[1]; m.visible = A.nube[1] > 0 }); NUBES_D.G.rotation.y = t * .0016; NUBES.forEach(g => g.visible = !A.nube || A.nube[1] > .5);
  VIENTO.value = t; T_ONDAS.offset.set(t * .012, t * .007); M_ESTANQUE.color.set(A.agua || "#86aabf"); const tor = ENVNOW === "tormenta", noche = ENVNOW === "incendio";
  HUMO_D.forEach(({ s, p, f }) => { const q = (t * .22 + f) % 1; s.position.set(p.x + q * q * 2.6 + Math.sin(t * 1.3 + f * 9) * .12, p.y + q * 3.4, p.z + q * .8); s.scale.setScalar(.45 + q * 1.9); s.material.opacity = (tor ? 0 : .34) * Math.sin(q * Math.PI) * (1 - q * .4); s.material.color.set(noche ? "#3a3432" : "#cfc4b4") });
  POLVO_D.forEach(p => { const x = modp(p.x + t * p.v, 150) - 75, z = p.z, y = SUELO(x, z) + .35 + .15 * Math.sin(t * .7 + p.f); p.s.position.set(x, y, z); p.s.scale.set(p.e * 2.2, p.e * .5, 1); p.s.material.opacity = (tor ? .3 : noche ? 0 : .13) * (.6 + .4 * Math.sin(t * .5 + p.f)) * Math.sin(modp(p.x + t * p.v, 150) / 150 * Math.PI) });
  BUITRES.forEach(({ g, al, i }) => { const a = t * (.11 + i * .02) * (i % 2 ? -1 : 1) + i * 2.1, R = 24 + i * 11; g.position.set(CRESTA[0] + (i - 1) * 16 + Math.cos(a) * R, CRESTA_H + 30 + i * 7 + Math.sin(t * .2 + i) * 2, CRESTA[1] - 6 + Math.sin(a) * R); g.rotation.set(0, -a + (i % 2 ? Math.PI : 0), (i % 2 ? 1 : -1) * .28, "YXZ"); const fl = Math.sin(t * .9 + i * 2) > .8 ? Math.sin(t * 7) * .35 : Math.sin(t * .6 + i) * .06; al.forEach((p, k) => p.rotation.z = (k ? 1 : -1) * (.12 + fl)); g.visible = !tor });
  RODANTES.forEach((m, i) => { const u = modp(t * (3.4 + i) + i * 61, 150) - 75, x = i ? 58 + Math.sin(u * .1) * 3 : u, z = i ? u : 59 + Math.sin(u * .08) * 4; m.position.set(x, SUELO(x, z) + .65 + Math.abs(Math.sin(t * 3.1 + i)) * .35, z); m.rotation.set(i ? t * 3 : 0, t * .4, i ? 0 : -t * 3) }) }
// deja todo lo animado del mundo en su estado de reposo (llamar al empezar cada cuadro)
function mundoReset() { cuernoCae(0); pernosFuera(0); grietasTorre(0); tazasSaltan(0); RUINAS.forEach((_, i) => ruinaEstado(i, 1)); estanquesVisibles(true); EST.forEach((_, i) => salpicar(i, 0)); tormenta(0, [0, 0, 0], 0); fuegoViejo(0, false); CUNA_BEBE.rotation.z = 0 }
mundoReset();

//@@ELENCO
// ---------- elenco: diseños propios de bloques (nada del protagonista de Volze ni marcas)
const ME = kid({ skin: "#e8b48c", shirt: "#d1872e", cloth: "plain", pants: "#3a4a5a", shoes: "#4a3020", hair: "#3a2416", style: "despeinado" });
const ME6 = kid({ skin: "#e8b48c", shirt: "#d1872e", cloth: "plain", pants: "#3a4a5a", shoes: "#4a3020", hair: "#3a2416", style: "despeinado" }); ME6.body.scale.setScalar(.7);
const QUILL = kid({ skin: "#f0c6a0", shirt: "#2e2e4a", cloth: "suit", alt: "#a82a2a", pants: "#2e2e4a", shoes: "#111", hair: "#9a9a9a", style: "corto" });
const PIM = kid({ skin: "#c98e64", shirt: "#f2ece0", cloth: "plain", pants: "#5a4632", shoes: "#2a2420", hair: "#2b211b", style: "corto" });
const GARROW = kid({ skin: "#d9b08c", shirt: "#3a5a4a", cloth: "sweater", alt: "#c9b48a", pants: "#3a3236", shoes: "#2a2420", hair: "#e9e4dc", style: "corto" });
const FOLK = [["#7a3a2a", "plaid", "#3a3236", "#2b211b", "corto", "#c98e64"], ["#3f6a8a", "sweater", "#3a3f4a", "#6b3f22", "melena", "#f2cfae"], ["#5a7a3a", "plain", "#3a2f28", "#c9a06a", "liso", "#e8b48c"], ["#8a5a8a", "sweater", "#3a3236", "#9a9a9a", "rodete", "#efc8a8"], ["#c9a23a", "plain", "#2e3a59", "#1d1a17", "rulos", "#8a5a3c"], ["#3a4a5a", "plain", "#2a2420", "#7a4a2a", "puntas", "#f2cfae"]].map(([sh, c, p, h, st, sk]) => { const k = kid({ skin: sk, shirt: sh, cloth: c, alt: "#d9c7a0", pants: p, shoes: "#2a2420", hair: h, style: "corto" }); k.peloR6 = [st, h]; return k });
const EXT = [["#b85a3a", "#3a3f4a", "#efc8a8"], ["#4a8a6a", "#3a2f28", "#8a5a3c"], ["#e0c060", "#2e3a59", "#f2cfae"], ["#7a4a8a", "#2a2420", "#c98e64"]].map(([sh, p, sk]) => kid({ skin: sk, shirt: sh, cloth: "plain", pants: p, shoes: "#2a2420", hair: "#2b211b", style: "corto" }));
const PESCADOR = kid({ skin: "#c98e64", shirt: "#e8c040", cloth: "plain", pants: "#3a4a5a", shoes: "#2a2420", hair: "#5a3a22", style: "corto" });
const ALL = [ME, ME6, QUILL, PIM, GARROW, ...FOLK, ...EXT, PESCADOR];
ALL.forEach(k => TURT.add(k.g));   // todos viven arriba de la tortuga
const handW = (k, h = "R") => { k.g.updateMatrixWorld(true); return (h === "R" ? k.handR : k.handL).getWorldPosition(new THREE.Vector3()) };
const attach = (obj, k, h = "R", o = [0, -.15, .1]) => { const hand = h === "R" ? k.handR : k.handL; if (obj.parent !== hand) hand.add(obj); obj.position.set(...o); obj.visible = true };
// en la concha: los personajes se paran sobre la superficie del caparazón
const placeC = (k, x, z, ry = 0) => { k.g.visible = true; k.g.position.set(x, SY(x, z), z); k.g.rotation.set(0, ry, 0) };
const faceToC = (k, x, z) => k.g.rotation.y = Math.atan2(x - k.g.position.x, z - k.g.position.z);

//@@ROBLOX
// ---------- pelo como el del canal (pedido del dueño, 24-nov-2026): casco liso que abraza la cabeza y mechones curvos que se
// afinan en la punta, pintado a mano con mechas y brillo. Nada de cubos ni facetas.
const PELOT = {};
function peloTex(color, seed, giro = false) { const key = color + seed + giro; if (PELOT[key]) return PELOT[key];
  const t = tex(1024, 1024, (g, w, h) => { const r = rng(seed), [R0, G0, B0] = hx(color), c = (k, a = 1) => `rgba(${Math.min(255, R0 * k + (k > 1 ? (k - 1) * 120 : 0)) | 0},${Math.min(255, G0 * k + (k > 1 ? (k - 1) * 110 : 0)) | 0},${Math.min(255, B0 * k + (k > 1 ? (k - 1) * 90 : 0)) | 0},${a})`;
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, c(.7)); gr.addColorStop(.45, c(1)); gr.addColorStop(1, c(.92)); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 1400; k++) { const x = r() * w, y0 = -50 + r() * h * .5, L = 250 + r() * 800, sw = (r() - .5) * 50; g.strokeStyle = c(.5 + r() * .75, .12 + r() * .3); g.lineWidth = 1 + r() * 4; g.beginPath(); g.moveTo(x, y0); g.bezierCurveTo(x + sw, y0 + L * .33, x - sw, y0 + L * .66, x + sw * .4, y0 + L); g.stroke() }
    for (let k = 0; k < 320; k++) { const x = r() * w, y = h * (.3 + .06 * Math.sin(x / w * 12.57 + seed)) + (r() - .5) * 50, L = 30 + r() * 90; g.strokeStyle = c(1.5 + r() * .3, .15 + r() * .3); g.lineWidth = 2 + r() * 5; g.beginPath(); g.moveTo(x, y - L / 2); g.lineTo(x + (r() - .5) * 10, y + L / 2); g.stroke() } });
  if (giro) { t.center.set(.5, .5); t.rotation = -Math.PI / 2 } return PELOT[key] = t }
function cascoPelo(head, mat, { frente = .6, lado = .42, nuca = .22, vol = 1, ondas = 7 } = {}) {
  const geo = new THREE.SphereGeometry(1, 64, 40), p = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = 4, ax = .39, ay = .35, az = .375;
    const s = Math.pow(Math.abs(v.x / ax) ** n + Math.abs(v.y / ay) ** n + Math.abs(v.z / az) ** n, -1 / n);
    let x = v.x * s, y = v.y * s + .38, z = v.z * s; const an = Math.atan2(v.x, v.z), ond = 1 + Math.sin(an * ondas + v.y * 4) * .018 + Math.sin(an * 13) * .006;
    x *= ond; z *= ond; if (v.y > 0) y += v.y * v.y * .07 * vol;
    const lim = v.z > 0 ? lerp(lado, frente, Math.min(1, v.z / .55) ** .8) : lerp(lado, nuca, Math.min(1, -v.z / .6));
    if (y < lim) { y = lim - Math.min(.03, (lim - y) * .2); x *= .84; z *= .84 }
    p.setXYZ(i, x, y, z) }
  geo.computeVertexNormals(); const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.userData.pelo = 1; head.add(m); return m }
function mechon(head, mat, pts, r0, r1 = .012, plano = 1.3) { const cu = new THREE.CatmullRomCurve3(pts.map(q => new THREE.Vector3(...q))), TS = 28, RS = 12, geo = new THREE.TubeGeometry(cu, TS, 1, RS, false), p = geo.attributes.position, v = new THREE.Vector3(), fr = cu.computeFrenetFrames(TS, false);
  for (let i = 0; i <= TS; i++) { const t = i / TS, c = cu.getPointAt(t), rad = lerp(r0, r1, Math.pow(t, 1.3)) * (1 + Math.sin(t * Math.PI) * .15); for (let j = 0; j <= RS; j++) { const k = i * (RS + 1) + j; v.fromBufferAttribute(p, k).sub(c); const a = v.dot(fr.normals[i]), b = v.dot(fr.binormals[i]); v.copy(fr.normals[i]).multiplyScalar(a * rad).addScaledVector(fr.binormals[i], b * rad * plano).add(c); p.setXYZ(k, v.x, v.y, v.z) } }
  geo.computeVertexNormals(); const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.userData.pelo = 1; head.add(m); return m }
function peloVolze(head, estilo, color) { const seed = [...color].reduce((a, ch) => a + ch.charCodeAt(0), 0) + estilo.length * 31;
  const mc = new THREE.MeshStandardMaterial({ map: peloTex(color, seed), roughness: .42 }), ml = new THREE.MeshStandardMaterial({ map: peloTex(color, seed + 1, true), roughness: .42 }), r = rng(seed);
  const M = (pts, r0, r1) => mechon(head, ml, pts, r0, r1);
  const bola = (rad, x, y, z, sx = 1, sy = 1, sz = 1) => { const m = part(new THREE.SphereGeometry(rad, 32, 20), mc, x, y, z, head, 0); m.scale.set(sx, sy, sz); m.userData.pelo = 1; return m };
  if (estilo === "puntas") { cascoPelo(head, mc, { frente: .6, lado: .44, nuca: .26, vol: 1.6 });
    [[-.2, .1, -.5], [0, .16, 0], [.2, .1, .5], [-.12, -.08, -.3], [.13, -.06, .35], [0, -.2, .05], [-.27, -.14, -.8], [.27, -.16, .8]].forEach(([x, z, a]) => { const L = .17 + r() * .1; M([[x * .9, .7, z], [x * 1.08 + a * .05, .8 + L * .35, z - .08], [x * 1.3 + a * .12, .8 + L * .75, z - .24 - r() * .08]], .11, .025) });
    [-.17, .02, .2].forEach(x => M([[x - .05, .74, .12], [x, .72, .3], [x + .06, .62, .37], [x + .1, .56, .36]], .075, .018)) }
  if (estilo === "corto") { cascoPelo(head, mc, { frente: .62, lado: .46, nuca: .3, vol: .7 });
    M([[-.22, .74, .1], [-.06, .73, .3], [.12, .66, .37], [.26, .6, .36]], .08, .02); M([[-.05, .76, .05], [.08, .74, .26], [.22, .67, .35]], .07, .02) }
  if (estilo === "liso") { cascoPelo(head, mc, { frente: .58, lado: .3, nuca: .14, vol: .9 });
    M([[-.18, .78, .05], [0, .76, .28], [.2, .66, .37], [.36, .52, .3], [.4, .4, .2]], .11, .03);
    for (let k = 0; k < 6; k++) { const a = Math.PI * (.6 + k * .16), x = Math.sin(a) * .36, z = Math.cos(a) * .34; M([[x, .62, z], [x * 1.08, .4, z * 1.08], [x * 1.05, .18, z * 1.02]], .09, .03) } }
  if (estilo === "melena" || estilo === "largo") { const L = estilo === "largo" ? -.45 : .02; cascoPelo(head, mc, { frente: .6, lado: .3, nuca: .1, vol: 1 });
    for (let k = 0; k < 13; k++) { const a = Math.PI * (.42 + k / 12 * 1.16), x = Math.sin(a) * .37, z = Math.cos(a) * .35, f = 1.12 + r() * .06; M([[x, .62, z], [x * f, .38, z * f], [x * (f + .05), (L + .38) / 2 - .06, z * (f + .05)], [x * .98, L, z * .98 + .02]], .1, .035) }
    [-.2, -.06, .08, .22].forEach(x => M([[x - .03, .74, .14], [x, .7, .32], [x + .03, .6, .37]], .07, .02)) }
  if (estilo === "trenzas") { cascoPelo(head, mc, { frente: .6, lado: .36, nuca: .2, vol: .8 });
    for (const s of [-1, 1]) { for (let k = 0; k < 6; k++) bola(.09 - k * .006, s * .38 + s * k * .005, .42 - k * .13, -.04 - k * .01, 1, 1.25, 1).rotation.z = s * (k % 2 ? .3 : -.3); part(new THREE.TorusGeometry(.05, .02, 8, 16), SM("#c94b4b"), s * .41, -.36, -.1, head, 0).rotation.x = Math.PI / 2 }
    [-.15, .05].forEach(x => M([[x, .74, .12], [x + .05, .7, .3], [x + .1, .62, .37]], .07, .02)) }
  if (estilo === "rodete") { cascoPelo(head, mc, { frente: .6, lado: .4, nuca: .3, vol: .6 });
    bola(.17, 0, .86, -.24, 1, .9, 1); for (let k = 0; k < 5; k++) { const a = k / 5 * 6.28; M([[Math.cos(a) * .1, .84, -.24 + Math.sin(a) * .1], [Math.cos(a + 1) * .18, .9, -.24 + Math.sin(a + 1) * .18], [Math.cos(a + 2) * .12, .97, -.24 + Math.sin(a + 2) * .12]], .06, .02) }
    M([[-.2, .72, .2], [-.3, .6, .3], [-.33, .48, .28]], .04, .012) }
  if (estilo === "rulos") { cascoPelo(head, mc, { frente: .62, lado: .4, nuca: .2, vol: 1.8, ondas: 11 });
    for (let k = 0; k < 26; k++) { const a = r() * 6.28, rr = .1 + r() * .24, cx = Math.cos(a) * rr, cz = Math.sin(a) * rr * .9 - .05, cy = .78 + (.34 - rr) * .25, pts = []; for (let q = 0; q <= 8; q++) { const b = q / 8 * Math.PI * 2.2; pts.push([cx + Math.cos(b) * .06, cy + q * .012, cz + Math.sin(b) * .06]) } M(pts, .045, .03) } }
}


// ---------- pelo como los accesorios de pelo de Roblox (el dueño mandó «Pelo de colega», un flequillo rubio en capas y un pelo
// castaño de mechones): una masa de mechones gruesos y algo facetados que nacen de la coronilla, caen sobre la frente, las
// orejas y la nuca y terminan en punta; degradé (raíz oscura, punta clara) y mechas pintadas a lo largo de cada mechón.
const MECHT = {};
function mechTex(color, seed) { const key = color + seed; if (MECHT[key]) return MECHT[key];
  return MECHT[key] = tex(1024, 256, (g, w, h) => { const r = rng(seed), [R0, G0, B0] = hx(color), c = (k, a = 1) => `rgba(${Math.min(255, R0 * k + Math.max(0, k - 1) * 90) | 0},${Math.min(255, G0 * k + Math.max(0, k - 1) * 80) | 0},${Math.min(255, B0 * k + Math.max(0, k - 1) * 60) | 0},${a})`;
    const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, c(.55)); gr.addColorStop(.35, c(.92)); gr.addColorStop(.8, c(1.08)); gr.addColorStop(1, c(1.15)); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 260; k++) { const y = r() * h, x0 = r() * w * .3, L = w * (.4 + r() * .7); g.strokeStyle = c(.55 + r() * .8, .18 + r() * .35); g.lineWidth = 1.5 + r() * 5; g.beginPath(); g.moveTo(x0, y); g.bezierCurveTo(x0 + L * .3, y + (r() - .5) * 18, x0 + L * .6, y + (r() - .5) * 18, x0 + L, y + (r() - .5) * 10); g.stroke() }
    const br = g.createLinearGradient(0, 0, 0, h); br.addColorStop(0, "rgba(255,255,255,0)"); br.addColorStop(.28, "rgba(255,250,235,.22)"); br.addColorStop(.38, "rgba(255,255,255,0)"); g.fillStyle = br; g.fillRect(w * .25, 0, w * .6, h) }) }
function mechR(head, mat, pts, r0, r1 = .006, plano = 2.1) { const cu = new THREE.CatmullRomCurve3(pts.map(q => new THREE.Vector3(...q))), TS = 18, RS = 6, geo = new THREE.TubeGeometry(cu, TS, 1, RS, false), p = geo.attributes.position, v = new THREE.Vector3(), fr = cu.computeFrenetFrames(TS, false), up = new THREE.Vector3();
  for (let i = 0; i <= TS; i++) { const t = i / TS, c = cu.getPointAt(t), rad = lerp(r0, r1, Math.pow(t, 1.6)) * (1 + Math.sin(t * Math.PI) * .25);
    // el lado ancho del mechón queda pegado a la cabeza (normal = dirección desde el centro de la cabeza)
    const tg = cu.getTangentAt(t), out = up.set(c.x, c.y - .38, c.z).normalize(), nA = out.clone().sub(tg.clone().multiplyScalar(out.dot(tg))).normalize(), nB = new THREE.Vector3().crossVectors(tg, nA);
    for (let j = 0; j <= RS; j++) { const k = i * (RS + 1) + j; v.fromBufferAttribute(p, k).sub(c); const a = v.dot(fr.normals[i]), b = v.dot(fr.binormals[i]), ang = Math.atan2(b, a); v.copy(nA).multiplyScalar(Math.cos(ang) * rad).addScaledVector(nB, Math.sin(ang) * rad * plano).add(c); p.setXYZ(k, v.x, v.y, v.z) } }
  geo.computeVertexNormals(); const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.userData.pelo = 1; head.add(m); return m }
function peloRoblox(head, estilo, color) { const seed = [...color].reduce((a, ch) => a + ch.charCodeAt(0), 0) + estilo.length * 31, r = rng(seed);
  const mt = new THREE.MeshStandardMaterial({ map: mechTex(color, seed), roughness: .5, flatShading: true }), mc = new THREE.MeshStandardMaterial({ map: peloTex(color, seed), color: "#b0b0b0", roughness: .6 });
  // punto sobre el casco (misma superficie que cascoPelo), un poco afuera
  const S = (a, ph, out = 1.06) => { const d = [Math.sin(ph) * Math.sin(a), Math.cos(ph), Math.sin(ph) * Math.cos(a)], s = Math.pow(Math.abs(d[0] / .39) ** 4 + Math.abs(d[1] / .35) ** 4 + Math.abs(d[2] / .375) ** 4, -.25); return [d[0] * s * out, d[1] * s * out + .38, d[2] * s * out] };
  // hasta dónde baja el pelo según el lado: adelante se corta arriba de los ojos, al costado tapa la oreja, atrás llega a la nuca
  const fin = (a, largo) => { const f = Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) / Math.PI; return f < .3 ? .92 : f < .55 ? lerp(.92, 1.45 + largo * .5, (f - .3) / .25) : 1.45 + largo * .5 + (f - .55) * (.6 + largo) };
  const lock = (a, ph1, r0, caida, ext = .07, ph0 = .05) => { const pts = []; for (let q = 0; q <= 4; q++) pts.push(S(a + (r() - .5) * .05, lerp(ph0, ph1, q / 4), 1.05 + q * .012)); const e = pts[4]; pts.push([e[0] * (1 + ext), e[1] - caida, e[2] * (1 + ext)]); return mechR(head, mt, pts, r0) };
  const largo = { largo: 1.2, melena: .7, liso: .45, corto: 0, puntas: .1, rodete: -.2, trenzas: 0, rulos: .1 }[estilo] ?? 0;
  cascoPelo(head, mc, { frente: .62, lado: .44, nuca: .26, vol: estilo === "puntas" ? 1.4 : 1 });
  if (estilo === "rulos") { for (let k = 0; k < 34; k++) { const a = r() * 6.28, ph = .15 + r() * 1.05, [cx, cy, cz] = S(a, ph, 1.08), pts = []; for (let q = 0; q <= 8; q++) { const b = q / 8 * Math.PI * 2.4; pts.push([cx + Math.cos(b) * .055, cy - q * .014, cz + Math.sin(b) * .055]) } mechR(head, mt, pts, .05, .03, 1.2) } return }
  if (estilo === "rodete") { const n = 22; for (let k = 0; k < n; k++) { const a = k / n * 6.28 + r() * .1; mechR(head, mt, [S(a, fin(a, 0) - .15, 1.05), S(a, .6, 1.07), S(a, .2, 1.07), [0, .86, -.2]], .12, .04, 1.6) }
    const bo = part(new THREE.SphereGeometry(.18, 14, 10), mt, 0, .9, -.24, head, 0); bo.userData.pelo = 1; for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28; mechR(head, mt, [[Math.cos(a) * .12, .86, -.24 + Math.sin(a) * .12], [Math.cos(a + 1) * .2, .93, -.24 + Math.sin(a + 1) * .2], [Math.cos(a + 2) * .1, 1.02, -.24 + Math.sin(a + 2) * .1]], .06, .02) } return }
  // capa de mechones que cubre todo el casco desde la coronilla
  const n = estilo === "corto" ? 18 : 22; for (let k = 0; k < n; k++) { const a = k / n * 6.28 + (r() - .5) * .2, ff = fin(a, largo); lock(a, ff + (r() - .5) * .08, .1 + r() * .035, .04 + r() * .06 + Math.max(0, largo) * .2 * (ff > 1.2 ? 1 : 0)) }
  // segunda capa más corta, encima, para dar volumen y que se vean los mechones separados
  for (let k = 0; k < 10; k++) { const a = r() * 6.28; lock(a, fin(a, largo) * .75, .085 + r() * .03, .03, .1) }
  // flequillo: mechones que caen sobre la frente con las puntas separadas
  const fl = estilo === "liso" || estilo === "melena" || estilo === "largo" ? 6 : 4; for (let k = 0; k < fl; k++) { const a = -.55 + k / (fl - 1) * 1.1 + (r() - .5) * .1, e = S(a, .95, 1.13); mechR(head, mt, [S(a * .3, .1), S(a * .7, .55, 1.08), S(a, .86, 1.1), [e[0] + a * .05, .6 + r() * .03, e[2]]], .08 + r() * .02) }
  // puntas para arriba y para atrás (como «Pelo de colega»)
  if (estilo === "puntas") for (let k = 0; k < 9; k++) { const a = Math.PI + (k / 8 - .5) * 2.2 + (r() - .5) * .15, b = S(a, .35 + r() * .25, 1.03), up = .22 + r() * .14; mechR(head, mt, [S(a, .08, 1.02), b, [b[0] * 1.25, b[1] + up * .6, b[2] * 1.25 - .04], [b[0] * 1.45, b[1] + up, b[2] * 1.45 - .1]], .1, .004, 1.5) }
  if (estilo === "trenzas") for (const s of [-1, 1]) { for (let k = 0; k < 6; k++) { const bo = part(new THREE.SphereGeometry(.09 - k * .006, 10, 8), mt, s * .4 + s * k * .005, .42 - k * .13, -.06 - k * .01, head, 0); bo.scale.set(1, 1.25, 1); bo.userData.pelo = 1 } part(new THREE.TorusGeometry(.05, .02, 8, 16), SM("#c94b4b"), s * .41, -.36, -.1, head, 0).rotation.x = Math.PI / 2 }
}
// ---------- ropa con tela de verdad (pedido del dueño): relieve de trama, costuras y pliegues en el bump, y piezas en 3D
// (cuello, botones, bolsillos, cinturón con hebilla, puños, punteras de zapato). Nada de dibujos impresos en la ropa.
const T_TELA = (() => { const [c, z] = pintarDoble(512, 1024, (c, z, w, h) => { const r = rng(777); c.fillStyle = "#808080"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 3) { z.fillStyle = y % 6 ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.12)"; z.fillRect(0, y, w, 1) } for (let x = 0; x < w; x += 3) { z.fillStyle = x % 6 ? "rgba(0,0,0,.1)" : "rgba(255,255,255,.1)"; z.fillRect(x, 0, 1, h) }
    for (let k = 0; k < 70; k++) { const x = r() * w, y = r() * h, L = 40 + r() * 140, a = (r() - .5) * 1.2 + (r() < .5 ? 0 : Math.PI / 2), cx = (r() - .5) * 30, cy = (r() - .5) * 30, lw = 6 + r() * 6; for (const [col, ww, d] of [["rgba(0,0,0,.35)", lw, 0], ["rgba(255,255,255,.28)", 5, 5]]) { z.strokeStyle = col; z.lineWidth = ww; z.beginPath(); z.moveTo(x + d, y + d); z.quadraticCurveTo(x + Math.cos(a) * L / 2 + cx + d, y + Math.sin(a) * L / 2 + cy + d, x + Math.cos(a) * L + d, y + Math.sin(a) * L + d); z.stroke() } }
    for (const x of [6, w - 6]) { z.strokeStyle = "rgba(0,0,0,.5)"; z.lineWidth = 4; z.setLineDash([10, 7]); z.beginPath(); z.moveTo(x, 0); z.lineTo(x, h); z.stroke() } z.setLineDash([]) }); return z })();
function telaReal(k, { shirt, pants, shoes = "#2a2420", botones = true, bolsillo = true, cinto = true } = {}) {
  const osc = (col, f = .72) => "#" + new THREE.Color(col).multiplyScalar(f).getHexString();
  const vestir = grp => grp.children.forEach(m => { if (!m.isMesh || m.userData.pelo) return; (Array.isArray(m.material) ? m.material : [m.material]).forEach(q => { q.bumpMap = T_TELA; q.bumpScale = 1.4; q.roughness = .88; q.needsUpdate = true }) });
  [k.body, k.armL, k.armR, k.legL, k.legR].forEach(vestir);
  const ms = SM(osc(shirt), { roughness: .85, bumpMap: T_TELA, bumpScale: 1 });
  part(RB(.62, .1, .58, .04), ms, 0, 2.03, 0, k.body, 0);                                      // cuello de la remera / camisa
  if (botones) for (let j = 0; j < 4; j++) { const b = part(new THREE.CylinderGeometry(.03, .03, .025, 10), SM("#e8e0cc", { roughness: .4 }), 0, 1.86 - j * .2, .27, k.body, 0); b.rotation.x = Math.PI / 2 }
  if (bolsillo) { part(RB(.22, .2, .025, .01), ms, .25, 1.72, .265, k.body, 0); part(RB(.23, .05, .03, .01), SM(osc(shirt, .6)), .25, 1.81, .27, k.body, 0) }
  if (cinto && pants) { part(RB(1.07, .09, .55, .02), SM("#3a2618", { roughness: .5 }), 0, 1.07, 0, k.body, 0); part(RB(.13, .1, .02, .01), SM("#c8b070", { metalness: .7, roughness: .35 }), 0, 1.07, .28, k.body, 0) }
  [k.armL, k.armR].forEach(a => part(RB(.53, .06, .53, .02), ms, 0, -.74, 0, a, 0));        // puño de la manga
  if (pants) [k.legL, k.legR].forEach((l, i) => { part(RB(.53, .06, .53, .02), SM(osc(pants)), 0, -.82, 0, l, 0); part(RB(.16, .18, .02, .01), SM(osc(pants, .8)), (i ? 1 : -1) * .1, -.28, .255, l, 0);
    part(RB(.5, .1, .14, .04), SM(osc(shoes, .9), { roughness: .6 }), 0, -.97, .3, l, 0); part(RB(.54, .04, .66, .02), SM("#e8e0d0", { roughness: .7 }), 0, -1.02, .04, l, 0) }) }
// ---------- corridas como en los videos de Volze: cuerpo inclinado, brazos y piernas que se abren mucho, rebote y polvo en los pies
function correr(c, t, a = 1) { const f = t * 13, sw = Math.sin(f);
  c.legL.rotation.x = sw * 1.05 * a; c.legR.rotation.x = -sw * 1.05 * a; c.armL.rotation.x = -sw * 1.25 * a; c.armR.rotation.x = sw * 1.25 * a; c.armL.rotation.z = -.12; c.armR.rotation.z = .12;
  c.body.rotation.x = .42 * a; c.body.position.y = Math.abs(Math.cos(f)) * .17 * a; c.head.rotation.x = -.22 * a;
  if (!c.polvo) c.polvo = Array.from({ length: 4 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#d9c8a4", transparent: true, opacity: 0, depthWrite: false })); scene.add(s); return s });
  c.g.updateMatrixWorld(true); c.polvo.forEach((s, i) => { const q = (t * 2.2 + i / 4) % 1; s.visible = true; s.position.copy(c.g.localToWorld(new THREE.Vector3((i % 2 ? .25 : -.25), .1 + q * .35, -.3 - q * 1.3))); s.scale.setScalar(.35 + q * .9); s.material.opacity = (1 - q) * .4 * a }) }
// ---------- la barba de maestro sensei de Garrow: bigote largo que cae a los costados, barba blanca hasta el pecho que termina
// en punta, y cejas largas y caídas (mechones de pelo de verdad, no bloques)
function barbaSensei(k, color) { const mt = new THREE.MeshStandardMaterial({ map: mechTex(color, 91), roughness: .55, flatShading: true }), h = k.head, M = (pts, r0, r1 = .006, pl = 1.6) => mechR(h, mt, pts, r0, r1, pl);
  for (const s of [-1, 1]) { M([[s * .03, .27, .345], [s * .14, .25, .36], [s * .25, .17, .37], [s * .3, -.05, .36], [s * .31, -.32, .34]], .045, .006, 1.3);       // bigote
    M([[s * .06, .56, .345], [s * .17, .58, .36], [s * .3, .52, .36], [s * .38, .42, .34]], .04, .006, 1.3) }                                                    // cejas
  for (let j = 0; j < 7; j++) { const x = (j / 6 - .5) * .44, L = .75 - Math.abs(x) * .9; M([[x, .2, .34], [x * .95, .08, .37], [x * .7, -.15, .4], [x * .35, -.15 - L * .6, .42], [x * .1, -.2 - L, .41]], .07, .006, 1.8) } }
// ---------- el cocinero: gorro alto plisado con copa inflada, chaqueta cruzada con dos filas de botones, cuello alto, pañuelo
// rojo y delantal con bolsillo y tiras
function cocinero(k) { const bl = SM("#f6f3ec", { roughness: .8, bumpMap: T_TELA, bumpScale: 1 }), bl2 = SM("#e4dfd2", { roughness: .8, bumpMap: T_TELA, bumpScale: 1 }), h = k.head, b = k.body;
  part(new THREE.CylinderGeometry(.38, .38, .16, 28), bl2, 0, .76, 0, h, 0);
  { const g = new THREE.CylinderGeometry(.37, .34, .42, 48, 4, true), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const a = Math.atan2(p.getZ(i), p.getX(i)), f = 1 + Math.cos(a * 14) * .05; p.setX(i, p.getX(i) * f); p.setZ(i, p.getZ(i) * f) } g.computeVertexNormals(); part(g, bl, 0, 1.03, 0, h, 0) }
  part(new THREE.SphereGeometry(.3, 20, 14), bl, 0, 1.3, 0, h, 0).scale.set(1.35, .75, 1.35); for (let j = 0; j < 7; j++) { const a = j / 7 * 6.28; part(new THREE.SphereGeometry(.17, 14, 10), bl, Math.cos(a) * .3, 1.27, Math.sin(a) * .3, h, 0) }
  part(RB(.66, .14, .6, .04), bl2, 0, 2.04, 0, b, 0);                                                                    // cuello alto
  part(new THREE.ConeGeometry(.12, .22, 4), SM("#c0302a", { roughness: .7 }), 0, 1.9, .3, b, 0).rotation.x = Math.PI;   // pañuelo
  part(RB(.06, .9, .02, .01), bl2, .1, 1.55, .265, b, 0);                                                                // solapa cruzada
  for (const x of [-.22, .22]) for (let j = 0; j < 3; j++) { const bt = part(new THREE.SphereGeometry(.04, 10, 8), SM("#b8b0a0", { roughness: .4 }), x, 1.84 - j * .22, .27, b, 0); bt.scale.z = .6 }
  part(RB(.94, .6, .04, .03), SM("#e9e2d2", { roughness: .85, bumpMap: T_TELA, bumpScale: 1.4 }), 0, 1.3, .285, b, 0);      // delantal
  part(RB(.3, .18, .02, .01), SM("#d9d0bc"), .12, 1.22, .31, b, 0); part(RB(1.08, .05, .56, .01), SM("#d9d0bc"), 0, 1.58, 0, b, 0) }

// ================= ELENCO DE DUSTMERE (diseños propios, estilo de bloques) + utilería + animales + animación medida =================
// Todo personaje nuevo: ropa de desierto (ponchos, lino, chalecos, pañuelos, fajas, sandalias, sombreros de paja), un color por
// prenda con UN estampado que se lee de lejos, tela con trama y relieve. Paleta: vecinos apagados, el narrador (verde jade) y
// Bee (amarillo con franjas) los únicos colores fuertes.
const ARENA_C = "#c9b28c", H_CAD = 1.02, A_BRAZO = .42, F30 = 1 / 30;
const _osc = (c, f = .75) => "#" + new THREE.Color(c).multiplyScalar(f).getHexString();
const _mix = (a, b, q) => "#" + new THREE.Color(a).lerp(new THREE.Color(b), q).getHexString();

// ---------- telas: trama pintada + estampado único (512 px) y relieve (T_TELA del motor)
const TELAS = {};
function tramaG(g, w, h, seed, f = 1) { const r = rng(seed); for (let y = 0; y < h; y += 4) { g.fillStyle = `rgba(0,0,0,${(.035 + r() * .05) * f})`; g.fillRect(0, y, w, 1); g.fillStyle = `rgba(255,255,255,${(.03 + r() * .04) * f})`; g.fillRect(0, y + 2, w, 1) }
  for (let x = 0; x < w; x += 4) { g.fillStyle = `rgba(0,0,0,${(.025 + r() * .04) * f})`; g.fillRect(x, 0, 1, h) }
  for (let k = 0; k < 90; k++) { g.fillStyle = `rgba(${r() < .5 ? "0,0,0" : "255,255,255"},${.03 + r() * .05})`; g.fillRect(r() * w, r() * h, 6 + r() * 40, 2) }
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(255,255,255,.07)"); gr.addColorStop(1, "rgba(0,0,0,.13)"); g.fillStyle = gr; g.fillRect(0, 0, w, h) }
function telaTex(kind, base, alt = "#efe6d0", back = false) { const key = [kind, base, alt, back].join(); return TELAS[key] ||= tex(512, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h); g.fillStyle = alt; g.strokeStyle = alt; g.lineJoin = "miter";
    if (kind === "rayas") for (let x = 34; x < w; x += 86) g.fillRect(x, 0, 30, h);
    if (kind === "franjas") for (let y = 70; y < h; y += 150) g.fillRect(0, y, w, 62);
    if (kind === "guarda") { g.fillRect(0, 196, w, 14); g.fillRect(0, 330, w, 14); for (let x = 0; x < w; x += 64) { g.beginPath(); g.moveTo(x + 32, 222); g.lineTo(x + 60, 270); g.lineTo(x + 32, 318); g.lineTo(x + 4, 270); g.closePath(); g.fill() } }
    if (kind === "rombos") { for (let i = 0; i < 3; i++) { const x = 86 + i * 170; g.beginPath(); g.moveTo(x, 150); g.lineTo(x + 62, 262); g.lineTo(x, 374); g.lineTo(x - 62, 262); g.closePath(); g.fill(); g.fillStyle = base; g.beginPath(); g.moveTo(x, 214); g.lineTo(x + 26, 262); g.lineTo(x, 310); g.lineTo(x - 26, 262); g.closePath(); g.fill(); g.fillStyle = alt } }
    if (kind === "zigzag") { g.lineWidth = 26; for (const y0 of [200, 300]) { g.beginPath(); for (let i = -1; i <= 9; i++) g.lineTo(i * 64, y0 + (i % 2 ? -34 : 34)); g.stroke() } }
    if (kind === "lunares") for (let y = 50, f = 0; y < h; y += 104, f++) for (let x = f % 2 ? 100 : 36; x < w; x += 128) { g.beginPath(); g.arc(x, y, 24, 0, 7); g.fill() }
    if (kind === "lino" && !back) { g.fillStyle = _osc(base, .8); g.fillRect(250, 0, 12, 250) }
    tramaG(g, w, h, 300 + kind.length * 7 + (back ? 1 : 0)) }) }
const brazoD = (shirt, skin, manga, banda) => TELAS["b" + [shirt, skin, manga, banda]] ||= tex(128, 256, (g, w, h) => { const y = h * manga; g.fillStyle = shirt; g.fillRect(0, 0, w, y); if (banda) { g.fillStyle = banda; g.fillRect(0, y - 44, w, 14); g.fillRect(0, y - 20, w, 8) } tramaG(g, w, y, 41);
  g.fillStyle = skin; g.fillRect(0, y, w, h - y); g.fillStyle = "rgba(0,0,0,.2)"; g.fillRect(0, y, w, 7) });
const piernaD = (pants, skin, largo, sand, ruedo) => TELAS["p" + [pants, skin, largo, sand, ruedo]] ||= tex(128, 256, (g, w, h) => { const y = h * largo; g.fillStyle = skin; g.fillRect(0, 0, w, h);
  if (pants) { g.fillStyle = pants; g.fillRect(0, 0, w, y); if (ruedo) { g.fillStyle = ruedo; g.fillRect(0, y - 22, w, 12) } g.fillStyle = "rgba(0,0,0,.14)"; g.fillRect(w / 2 - 2, 0, 4, y * .9); tramaG(g, w, y, 43); g.fillStyle = "rgba(0,0,0,.22)"; g.fillRect(0, y, w, 6) }
  g.fillStyle = sand; g.fillRect(0, h * .875, w, 12); g.fillRect(0, h * .95, w, h * .05) });
const mTela = map => new THREE.MeshStandardMaterial({ map, roughness: .88, bumpMap: T_TELA, bumpScale: 1.4 });
const mLisa = (col, o = {}) => new THREE.MeshStandardMaterial({ color: col, roughness: .88, bumpMap: T_TELA, bumpScale: 1.4, ...o });

// ---------- vestir: robloxify + telas propias; brazos a 0,42 del ancho del torso (medido en la referencia)
function vestir(k, { skin, shirt, cloth = "lino", alt = "#efe6d0", pants = "#5a4e42", manga = .82, banda = null, largo = .8, ruedo = null, sand = "#5a3a22", pelo = null, escala = 1 }) {
  robloxify(k, { skin, shirt, alt, cloth: "plain", pants: pants || skin, shoes: sand, manga, pelo });
  const torso = k.body.children.find(c => c.isMesh && Math.abs(c.position.y - 1.54) < .01); const lado = mTela(telaTex("liso", shirt, alt));
  torso.material = boxMats(lado, mTela(telaTex(cloth, shirt, alt)), mTela(telaTex(cloth, shirt, alt, true)));
  [k.armL, k.armR].forEach((a, i) => { const m = a.children.find(c => c.isMesh); m.material = mTela(brazoD(shirt, skin, manga, banda)); m.scale.x = .88; a.position.x = (i ? 1 : -1) * .745 });
  [k.legL, k.legR].forEach(l => { const m = l.children.find(c => c.isMesh); m.material = mTela(piernaD(pants, skin, largo, sand, ruedo));
    part(RB(.54, .05, .62, .02), SM(_osc(sand, .8), { roughness: .8 }), 0, -1.0, .04, l, 0); part(RB(.525, .05, .525, .02), SM(sand, { roughness: .7 }), 0, -.895, 0, l, 0); part(RB(.14, .06, .3, .02), SM(sand, { roughness: .7 }), 0, -.95, .13, l, 0) });   // sandalia: suela, tira del tobillo y tira del empeine
  if (escala !== 1) k.body.scale.setScalar(escala); k.ropa = { skin, shirt, alt, pants }; return k }

// ---------- prendas en 3D (sin atravesar brazos: los paños del poncho quedan dentro del ancho del torso y las hombreras van en el brazo)
const PONCHOT = {};
function ponchoTex(col, alt, alt2) { return PONCHOT[col + alt + alt2] ||= tex(512, 512, (g, w, h) => { g.fillStyle = col; g.fillRect(0, 0, w, h); const V = (d, lw, c) => { g.strokeStyle = c; g.lineWidth = lw; g.lineJoin = "miter"; g.beginPath(); g.moveTo(-10, 276 - d - 5); g.lineTo(256, 500 - d); g.lineTo(522, 276 - d - 5); g.stroke() };
    V(40, 18, alt); V(128, 18, alt); for (let i = 0; i < 9; i++) { const u = (i + .5) / 9, x = u * w, yv = (x < 256 ? lerp(271, 500, x / 256) : lerp(500, 271, (x - 256) / 256)) - 84; g.fillStyle = alt2; g.beginPath(); g.moveTo(x, yv - 26); g.lineTo(x + 20, yv); g.lineTo(x, yv + 26); g.lineTo(x - 20, yv); g.closePath(); g.fill() }
    g.strokeStyle = _osc(col, .6); g.lineWidth = 3; for (let x = 8; x < w; x += 14) { const yv = x < 256 ? lerp(271, 500, x / 256) : lerp(500, 271, (x - 256) / 256); g.beginPath(); g.moveTo(x, yv - 2); g.lineTo(x, yv + 16); g.stroke() }
    tramaG(g, w, h, 77, 1.3) }) }
function poncho(k, col, alt = "#efe6d0", alt2 = alt) { const m = mTela(ponchoTex(col, alt, alt2)), b = k.body;
  for (const s of [1, -1]) { const sh = new THREE.Shape(); sh.moveTo(-.535, 2.085); sh.lineTo(.535, 2.085); sh.lineTo(.535, 1.56); sh.lineTo(0, 1.1); sh.lineTo(-.535, 1.56); sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: .035, bevelEnabled: true, bevelSize: .012, bevelThickness: .012, bevelSegments: 2 }), p = geo.attributes.position, uv = geo.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + .535) / 1.07, (p.getY(i) - 1.1) / .985);
    const me = part(geo, m, 0, 0, s > 0 ? .262 : -.262, b, 0); if (s < 0) me.rotation.y = Math.PI }
  part(RB(1.07, .06, .6, .02), mLisa(col), 0, 2.07, 0, b, 0); part(RB(.56, .05, .5, .02), mLisa(_osc(col, .62)), 0, 2.085, 0, b, 0);                       // hombros y abertura del cuello
  [k.armL, k.armR].forEach(a => { part(RB(.5, .5, .56, .04), mLisa(col), 0, -.13, 0, a, 0); part(RB(.51, .07, .57, .02), mLisa(alt), 0, -.3, 0, a, 0) }) }   // hombrera del poncho, con su guarda (se mueve con el brazo)
function chaleco(k, col, vivo = null) { const m = mLisa(col), b = k.body; for (const s of [-1, 1]) { part(RB(.35, 1.0, .04, .015), m, s * .345, 1.545, .262, b, 0); if (vivo) part(RB(.04, 1.0, .045, .01), mLisa(vivo), s * .18, 1.545, .264, b, 0) }
  part(RB(1.045, 1.0, .04, .015), m, 0, 1.545, -.262, b, 0); part(RB(1.06, .05, .56, .02), m, 0, 2.065, 0, b, 0) }
function faja(k, col, alt = null) { const m = mLisa(col), b = k.body; part(RB(1.09, .2, .57, .04), m, 0, 1.13, 0, b, 0); if (alt) part(RB(1.1, .05, .58, .02), mLisa(alt), 0, 1.13, 0, b, 0);
  part(RB(.17, .2, .09, .04), m, .3, 1.13, .29, b, 0); part(RB(.05, .34, .2, .02), m, .565, .93, .02, b, 0) }
function panueloCuello(k, col) { const m = mLisa(col), b = k.body; part(RB(.78, .13, .62, .05), m, 0, 2.03, 0, b, 0); const t = part(new THREE.ConeGeometry(.24, .34, 4), m, 0, 1.83, .268, b, 0); t.rotation.set(Math.PI, Math.PI / 4, 0); t.scale.z = .22; part(RB(.12, .1, .1, .04), m, 0, 2.0, -.3, b, 0) }
function cuello(k, col) { part(RB(.7, .09, .58, .03), mLisa(col), 0, 2.035, 0, k.body, 0); for (const s of [-1, 1]) { const t = part(new THREE.ConeGeometry(.13, .2, 4), mLisa(col), s * .14, 1.95, .268, k.body, 0); t.rotation.set(Math.PI, Math.PI / 4, 0); t.scale.z = .2 } }
// pollera / vestido: un bloque que se abre hacia abajo (las piernas dan pasos más cortos adentro: k.pasoMax)
function falda(k, col, { hasta = .55, alt = null, kind = "liso" } = {}) { const h = 1.06 - hasta, geo = new THREE.BoxGeometry(1, 1, 1, 6, 6, 6), p = geo.attributes.position, wb = 1.06 + h * .42, db = .56 + h * .62;
  for (let i = 0; i < p.count; i++) { const f = .5 - p.getY(i), e = Math.pow(f, .8); p.setXYZ(i, p.getX(i) * lerp(1.07, wb, e), p.getY(i) * h, p.getZ(i) * lerp(.56, db, e)) } geo.computeVertexNormals();
  const t = tex(512, 512, (g, w, hh) => { g.fillStyle = col; g.fillRect(0, 0, w, hh); if (alt) { g.fillStyle = alt; if (kind === "franjas") for (let y = 150; y < hh; y += 170) g.fillRect(0, y, w, 70); else { g.fillRect(0, hh - 96, w, 30); g.fillRect(0, hh - 46, w, 14) } } tramaG(g, w, hh, 91, 1.2); g.fillStyle = "rgba(0,0,0,.1)"; for (let x = 40; x < w; x += 102) g.fillRect(x, 0, 8, hh) });
  part(geo, mTela(t), 0, 1.06 - h / 2, 0, k.body, 0); k.falda = hasta; k.pasoMax = hasta < .4 ? .2 : .34; k.zancMax = hasta < .4 ? .3 : .5 }

// ---------- sombrero de paja de ala ancha (echado hacia atrás: los ojos siempre a la vista), pañuelo en la cabeza, pelo bajo el sombrero
const T_PAJA_EL = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(4411); c.fillStyle = "#d8b973"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 14) { c.fillStyle = `rgba(110,78,30,${.3 + r() * .2})`; c.fillRect(0, y, w, 3); z.fillStyle = "rgba(0,0,0,.6)"; z.fillRect(0, y, w, 4); z.fillStyle = "rgba(255,255,255,.35)"; z.fillRect(0, y + 6, w, 4);
    for (let x = (y / 14 % 2) * 8; x < w; x += 16) { c.fillStyle = `rgba(${r() < .5 ? "255,236,170" : "140,100,40"},${.18 + r() * .25})`; c.fillRect(x, y + 3, 8, 11); z.fillStyle = "rgba(0,0,0,.4)"; z.fillRect(x + 7, y + 3, 2, 11) } } });
const M_PAJA_EL = new THREE.MeshStandardMaterial({ map: T_PAJA_EL[0], bumpMap: T_PAJA_EL[1], bumpScale: 2.5, roughness: .95, side: THREE.DoubleSide });
function peloBajo(k, col, largo = 0) { const mt = new THREE.MeshStandardMaterial({ map: mechTex(col, 7), roughness: .5, flatShading: true });
  for (const s of [-1, 1]) for (let j = 0; j < 3; j++) mechR(k.head, mt, [[s * .36, .68, -.02 - j * .12], [s * .4, .5, -.05 - j * .12], [s * .385, .3 - largo, -.03 - j * .1]], .075, .02, 1.5);
  for (let j = 0; j < 5; j++) mechR(k.head, mt, [[-.28 + j * .14, .68, -.34], [-.28 + j * .14, .46, -.395], [-.26 + j * .13, .26 - largo, -.37]], .08, .02, 1.5) }
function sombrero(k, { cinta = "#a8553a", tilt = -.2, ala = .8, pelo = null } = {}) { if (pelo) peloBajo(k, pelo); const G = new THREE.Group(); G.position.set(0, .7, -.02); G.rotation.x = tilt; k.head.add(G); G.userData.pelo = 1;
  const pr = [[.37, .0], [.5, -.012], [ala * .8, -.045], [ala, -.075], [ala + .012, -.09], [ala * .8, -.068], [.5, -.04], [.37, -.03]].map(([a, b]) => new THREE.Vector2(a, b)), ge = new THREE.LatheGeometry(pr, 56), p = ge.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), rr = Math.hypot(x, z), a = Math.atan2(x, z), q = cl((rr - .37) / (ala - .37)); p.setY(i, p.getY(i) + q * q * (Math.sin(a * 3 + 1) * .03 + Math.sin(a * 7) * .012)); const e = 1 + q * q * q * Math.sin(a * 23) * .012; p.setX(i, x * e); p.setZ(i, z * e) } ge.computeVertexNormals(); part(ge, M_PAJA_EL, 0, 0, 0, G, 0);
  const co = [[.385, -.01], [.375, .12], [.35, .25], [.3, .32], [.2, .35], [.001, .355]].map(([a, b]) => new THREE.Vector2(a, b)); part(new THREE.LatheGeometry(co, 40), M_PAJA_EL, 0, 0, 0, G, 0);
  part(new THREE.CylinderGeometry(.385, .392, .075, 40, 1, true), mLisa(cinta, { side: THREE.DoubleSide }), 0, .045, 0, G, 0); return G }
function panueloCabeza(k, col, pelo = null) { const m = mLisa(col); cascoPelo(k.head, m, { frente: .63, lado: .4, nuca: .2, vol: .5, ondas: 5 }).scale.set(1.035, 1.03, 1.035);
  const n = part(RB(.16, .12, .1, .04), m, 0, .3, -.4, k.head, 0); for (const s of [-1, 1]) { const c = part(new THREE.ConeGeometry(.07, .3, 4), m, s * .09, .14, -.42, k.head, 0); c.rotation.set(Math.PI - .25, 0, s * .3); c.scale.z = .4 }
  if (pelo) { const mt = new THREE.MeshStandardMaterial({ map: mechTex(pelo, 9), roughness: .5, flatShading: true }); for (const s of [-1, 1]) { mechR(k.head, mt, [[s * .05, .66, .335], [s * .2, .63, .35], [s * .34, .52, .33]], .05, .012, 1.4); mechR(k.head, mt, [[s * .37, .6, .12], [s * .385, .44, .14], [s * .375, .28, .1]], .05, .012, 1.4) } } }
function anteojos(k) { const m = SM("#3a2a1e", { metalness: .4, roughness: .4 }), v = new THREE.MeshStandardMaterial({ color: "#dfe8ea", transparent: true, opacity: .22, roughness: .1 });
  for (const s of [-1, 1]) { part(new THREE.TorusGeometry(.092, .013, 8, 28), m, s * .105, .425, .345, k.head, 0); part(new THREE.CircleGeometry(.09, 24), v, s * .105, .425, .344, k.head, 0); part(RB(.02, .02, .3, .005), m, s * .2, .43, .2, k.head, 0) } part(RB(.05, .016, .016, .005), m, 0, .44, .345, k.head, 0) }
// barba blanca corta y tupida de Old Dez (deja la boca y los ojos a la vista), bigote y cejas pobladas
function barbaVieja(k, col) { const mt = new THREE.MeshStandardMaterial({ map: mechTex(col, 23), roughness: .6, flatShading: true }), h = k.head, M = (pts, r0, r1 = .008, pl = 1.7) => mechR(h, mt, pts, r0, r1, pl);
  for (let j = 0; j < 9; j++) { const u = j / 8 - .5, x = u * .66, L = .34 - Math.abs(u) * .3; M([[x, .2, .34], [x * 1.02, .1, .365], [x * .9, -.02, .375], [x * .7, -.02 - L, .36]], .062, .008, 1.8) }
  for (const s of [-1, 1]) { for (let j = 0; j < 3; j++) M([[s * .36, .46 - j * .03, .22 - j * .13], [s * .385, .26, .22 - j * .13], [s * .36, .06, .2 - j * .12], [s * .3, -.08 - j * .03, .2 - j * .1]], .06, .01, 1.6);
    M([[s * .02, .335, .345], [s * .1, .33, .36], [s * .2, .27, .36], [s * .25, .17, .35]], .034, .006, 1.3); M([[s * .04, .6, .345], [s * .12, .625, .36], [s * .2, .6, .36], [s * .27, .55, .35]], .032, .008, 1.3) } }
function florCorona(k, cols) { for (let j = 0; j < 16; j++) { const a = j / 16 * 6.283, x = Math.sin(a) * .43, z = Math.cos(a) * .41 - .02; const f = part(new THREE.IcosahedronGeometry(.07, 1), SM(cols[j % cols.length], { roughness: .8 }), x, .73 + (j % 2) * .015, z, k.head, 0); f.scale.y = .7; f.userData.pelo = 1; if (j % 2) part(new THREE.ConeGeometry(.04, .12, 4), SM("#6a7a48"), x * 1.08, .7, z * 1.08, k.head, 0).rotation.set(Math.cos(a) * 1.3, 0, -Math.sin(a) * 1.3) } }

// ---------- EL ELENCO
// el narrador (12 años): la cabeza más clara y el único verde jade del pueblo: poncho con guarda crema, pelo castaño claro
vestir(ME, { skin: "#f4cba6", shirt: "#0fa97c", cloth: "liso", alt: "#f6efdc", pants: "#44403c", banda: "#f6efdc", largo: .72, ruedo: "#2e2a28", sand: "#6a4426", pelo: ["corto", "#b26a2e"], escala: .9 });
poncho(ME, "#0fa97c", "#f6efdc", "#f6efdc");
// Bee (6): rulos, vestido amarillo con franjas marrones (una abejita), pollera corta, moño
vestir(ME6, { skin: "#f4cba6", shirt: "#f7c20a", cloth: "franjas", alt: "#4a3020", pants: null, manga: .3, sand: "#6a4426", pelo: ["rulos", "#b26a2e"], escala: .7 });
falda(ME6, "#f7c20a", { hasta: .52, alt: "#4a3020", kind: "franjas" }); cuello(ME6, "#fff6dc");
{ const m = SM("#f7c20a", { roughness: .7 }); for (const s of [-1, 1]) { const c = part(new THREE.ConeGeometry(.12, .2, 4), m, s * .13, .86, -.3, ME6.head, 0); c.rotation.z = s * Math.PI / 2; c.scale.z = .5 } part(RB(.08, .08, .08, .02), m, 0, .86, -.3, ME6.head, 0) }
// Miss Ode, la maestra: rodete, anteojos redondos, vestido pizarra sobrio con cuello y ruedo crema
vestir(QUILL, { skin: "#c9936a", shirt: "#544a4e", cloth: "lino", alt: "#e6dcc6", pants: null, sand: "#3a2a22", pelo: ["rodete", "#6e5a4e"] });
falda(QUILL, "#544a4e", { hasta: .22, alt: "#e6dcc6" }); cuello(QUILL, "#e6dcc6"); anteojos(QUILL);
// Dez de chico (recuerdo, hace 60 años): pelo negro en mechones, camisa ocre a rayas, pañuelo terracota al cuello
vestir(PIM, { skin: "#b87a52", shirt: "#c2913a", cloth: "rayas", alt: "#efe2c0", pants: "#82705A", manga: .45, largo: .62, sand: "#4a3020", pelo: ["puntas", "#211c1a"], escala: .8 });
panueloCuello(PIM, "#b0452c");
// Old Dez (hoy): el mismo pañuelo terracota y el mismo ocre, ahora en un poncho; sombrero de paja, barba blanca, bastón, encorvado, arrugas
vestir(GARROW, { skin: "#b07a58", shirt: "#c2913a", cloth: "liso", alt: "#b0452c", pants: "#6a5c4c", banda: "#b0452c", sand: "#4a3020", pelo: null });
poncho(GARROW, "#c2913a", "#b0452c", "#efe2c0"); panueloCuello(GARROW, "#b0452c"); sombrero(GARROW, { cinta: "#b0452c", pelo: "#ece8e0" }); barbaVieja(GARROW, "#f0ece4");
GARROW.arrugas = 2; GARROW.encorvado = .32;
// vecinos (colores apagados): 0 = el novio, 1 = la novia, 2 = la madre del bebé, 3 = una vieja, 4 y 5 = vecinos
vestir(FOLK[0], { skin: "#a86c48", shirt: "#d8ccb4", cloth: "lino", pants: "#5a4e42", sand: "#3a2a22", pelo: null }); chaleco(FOLK[0], "#4a4038", "#b88a3e"); faja(FOLK[0], "#a8553a"); sombrero(FOLK[0], { cinta: "#efe6d0", pelo: "#2b211b", tilt: -.24 });
vestir(FOLK[1], { skin: "#c98e64", shirt: "#e6dcc6", cloth: "guarda", alt: "#a8553a", pants: null, sand: "#6a4a30", pelo: ["largo", "#3a2418"] }); falda(FOLK[1], "#e6dcc6", { hasta: .2, alt: "#a8553a" }); florCorona(FOLK[1], ["#f4ecd8", "#d9a441", "#c2603c"]);
vestir(FOLK[2], { skin: "#b87a52", shirt: "#7a8258", cloth: "rombos", alt: "#e6dcc6", pants: null, sand: "#4a3020", pelo: null }); falda(FOLK[2], "#7a8258", { hasta: .24, alt: "#e6dcc6" }); panueloCabeza(FOLK[2], "#a8553a", "#2b211b");
vestir(FOLK[3], { skin: "#c49a78", shirt: "#A2A497", cloth: "zigzag", alt: "#7a4a4a", pants: null, sand: "#3a2a22", pelo: null }); falda(FOLK[3], "#A2A497", { hasta: .22, alt: "#7a4a4a" }); panueloCabeza(FOLK[3], "#7a4a4a", "#d8d4cc"); FOLK[3].arrugas = 1;
vestir(FOLK[4], { skin: "#8a5a3c", shirt: "#a8553a", cloth: "liso", alt: "#e6dcc6", pants: "#576371", banda: "#e6dcc6", sand: "#3a2a22", pelo: null }); poncho(FOLK[4], "#a8553a", "#e6dcc6", "#576371"); sombrero(FOLK[4], { cinta: "#576371", pelo: "#1d1a17" });
vestir(FOLK[5], { skin: "#c98e64", shirt: "#A2A497", cloth: "rayas", alt: "#82705A", pants: "#4a4038", manga: .45, sand: "#4a3020", pelo: ["rulos", "#1d1a17"] }); chaleco(FOLK[5], "#576371"); faja(FOLK[5], "#b88a3e");
vestir(EXT[0], { skin: "#d9a67c", shirt: "#82705A", cloth: "rayas", alt: "#d8ccb4", pants: null, sand: "#3a2a22", pelo: null }); falda(EXT[0], "#82705A", { hasta: .3, alt: "#d8ccb4" }); panueloCabeza(EXT[0], "#b88a3e", "#5a3a22");
vestir(EXT[1], { skin: "#b08060", shirt: "#A2A497", cloth: "lino", pants: "#6a5a48", sand: "#3a2a22", pelo: null }); chaleco(EXT[1], "#7a8258", "#e6dcc6"); sombrero(EXT[1], { cinta: "#7a8258", pelo: "#b8b2a8", tilt: -.16 }); EXT[1].arrugas = 1;
vestir(EXT[2], { skin: "#c98e64", shirt: "#a8553a", cloth: "zigzag", alt: "#e6dcc6", pants: null, manga: .45, sand: "#4a3020", pelo: ["melena", "#5a3a22"] }); falda(EXT[2], "#82705A", { hasta: .45, alt: "#e6dcc6" });
vestir(EXT[3], { skin: "#8a5a3c", shirt: "#576371", cloth: "liso", alt: "#b88a3e", pants: "#82705A", banda: "#b88a3e", sand: "#3a2a22", pelo: ["corto", "#1d1a17"] }); poncho(EXT[3], "#576371", "#b88a3e", "#d8ccb4");
vestir(PESCADOR, { skin: "#a86c48", shirt: "#82705A", cloth: "rombos", alt: "#b88a3e", pants: "#4a4038", manga: .45, sand: "#3a2a22", pelo: null }); panueloCuello(PESCADOR, "#7a8258"); sombrero(PESCADOR, { cinta: "#82705A", pelo: "#3a2416", tilt: -.28 });

// ---------- CARAS: las del motor + «listen», «grito», «sopla», «susurra», «cerrados», «paz»; cualquiera con los ojos cerrados (parpadeo) y con arrugas
const CARAS_DZ = {};
const CARA_K = { neutral: [1, 0, "flat"], worried: [1, 1, "frown"], gloomy: [.8, 1, "flat"], pleading: [1, 1, "frown"], sad: [1, 1, "frown"], scared: [1.35, 1.2, "o"], terrified: [1.5, 1.4, "scream"], horrified: [1.45, 1.3, "scream"], panic: [1.4, 1.3, "scream"],
  shock: [1.35, -1, "o"], gasp: [1.35, -1, "o"], happy: [1, 0, "smile"], warm: [.9, 0, "smile"], laugh: [.95, -.5, "open"], excited: [1.15, -.6, "open"], starstruck: [1.2, -.8, "open"], hopeful: [1.1, .6, "smile"],
  relieved: [.9, .8, "smile"], squint: [.6, -1.2, "flat"], suspicious: [.7, -1.4, "smirk"], determined: [.85, -1.4, "smirk"], brave: [.9, -1.2, "flat"], angry: [.9, -1.6, "frown"], curious: [1.15, -.4, "o"],
  listen: [1.3, 0, "mini", "alta"], grito: [1, -1, "scream", "", "apret"], sopla: [1, -1, "o", "", "apret"], susurra: [.9, 0, "mini"], cerrados: [1, 0, "flat", "", "cerr"], paz: [1, 0, "smile", "", "cerr"] };
const CARAS_LISTA = Object.keys(CARA_K);
function caraDz(kind, cerr = false, arr = 0) { const key = kind + (cerr ? "_c" : "") + arr; if (CARAS_DZ[key]) return CARAS_DZ[key];
  return CARAS_DZ[key] = tex(512, 384, (g, w, h) => { const ink = "#141014", ex = [176, 336], ey = 165, [es, bro, boca, ceja = "", ojo = ""] = CARA_K[kind] || CARA_K.neutral, modo = ojo || (cerr ? "cerr" : "");
    g.lineCap = "round"; g.lineJoin = "round";
    ex.forEach((x, i) => { const s = i ? 1 : -1, E = Math.min(1.25, es); g.fillStyle = ink; g.strokeStyle = ink;
      if (modo === "cerr") { g.lineWidth = 17; g.beginPath(); g.moveTo(x - 30, ey + 2); g.quadraticCurveTo(x, ey + 26, x + 30, ey + 2); g.stroke() }
      else if (modo === "apret") { g.lineWidth = 17; g.beginPath(); g.moveTo(x - s * 28, ey - 24); g.lineTo(x + s * 22, ey); g.lineTo(x - s * 28, ey + 24); g.stroke() }
      else { g.beginPath(); g.ellipse(x, ey, 26 * Math.min(1.2, es), 46 * E, 0, 0, 7); g.fill(); g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(x - 8, ey - 18 * E, 8, 11, 0, 0, 7); g.fill() }
      g.strokeStyle = ink; g.lineWidth = 18; const yb = ey - 10 - 66 * E - (bro < 0 && boca === "o" ? 14 : 0) - (ceja === "alta" ? 10 : 0); g.beginPath(); g.moveTo(x - s * 36, yb + (bro > 0 ? 8 : bro < 0 ? -12 : 0)); g.lineTo(x + s * 26, yb + (bro > 0 ? -14 : bro < 0 ? 12 : 0)); g.stroke() });
    g.fillStyle = ink; g.strokeStyle = ink; g.lineWidth = 18; const my = 290;
    if (boca === "flat") { g.beginPath(); g.moveTo(222, my); g.lineTo(290, my); g.stroke() }
    if (boca === "frown") { g.beginPath(); g.moveTo(214, my + 16); g.quadraticCurveTo(256, my - 22, 298, my + 16); g.stroke() }
    if (boca === "smile") { g.beginPath(); g.moveTo(206, my - 14); g.quadraticCurveTo(256, my + 34, 306, my - 14); g.stroke() }
    if (boca === "smirk") { g.beginPath(); g.moveTo(220, my + 6); g.quadraticCurveTo(268, my + 10, 300, my - 14); g.stroke() }
    if (boca === "o") { g.beginPath(); g.ellipse(256, my, 22, 28, 0, 0, 7); g.fill() }
    if (boca === "mini") { g.beginPath(); g.ellipse(256, my, 13, 13, 0, 0, 7); g.fill() }
    if (boca === "open") { g.beginPath(); g.moveTo(196, my - 22); g.quadraticCurveTo(256, my + 62, 316, my - 22); g.closePath(); g.fill(); g.fillStyle = "#c94b5a"; g.beginPath(); g.ellipse(256, my + 18, 26, 10, 0, 0, 7); g.fill() }
    if (boca === "scream") { g.beginPath(); g.moveTo(214, my - 26); g.quadraticCurveTo(256, my - 44, 298, my - 26); g.lineTo(306, my + 40); g.quadraticCurveTo(256, my + 58, 206, my + 40); g.closePath(); g.fill(); g.fillStyle = "#ffffff"; g.fillRect(224, my - 30, 64, 12) }
    if (kind === "sopla") { g.fillStyle = "rgba(200,80,70,.4)"; for (const x of [150, 362]) { g.beginPath(); g.ellipse(x, my - 14, 34, 28, 0, 0, 7); g.fill() } }
    if (arr) { g.strokeStyle = "rgba(84,44,34,.6)"; g.lineWidth = 6; const Q = (a, b, c, d, e, f) => { g.beginPath(); g.moveTo(a, b); g.quadraticCurveTo(c, d, e, f); g.stroke() };
      for (const y of arr > 1 ? [26, 42, 58] : [34, 54]) Q(160, y, 256, y - 9, 352, y);
      for (const [x, s] of [[122, -1], [390, 1]]) for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(x, 150 + k * 16); g.lineTo(x + s * 28, 140 + k * 21); g.stroke() }
      for (const s of [-1, 1]) { Q(256 + s * 72, 236, 256 + s * 90, 280, 256 + s * 72, 322); if (arr > 1) { Q(256 + s * 46, 222, 256 + s * 82, 236, 256 + s * 116, 218); Q(256 + s * 112, 262, 256 + s * 128, 290, 256 + s * 110, 322); Q(256 + s * 30, 340, 256 + s * 50, 350, 256 + s * 64, 338) } } } }) }
setFace = (k, f) => { k.cara = f; const t = caraDz(f, false, k.arrugas || 0); if (k.decal.material.map !== t) { k.decal.material.map = t; k.decal.material.needsUpdate = true } };
ALL.forEach((k, i) => { k.idx = i; setFace(k, "neutral") });
// UN parpadeo de 4 cuadros (a 30 fps) cada 1,2–1,6 s, desfasado por personaje
const _frac = x => x - Math.floor(x);
function parpadeo(k, t) { const T = 1.2 + .4 * _frac(k.idx * .618 + .31), ph = (t + T * _frac(k.idx * .377 + .15)) % T; if (ph < 4 * F30 && k.cara && !CARA_K[k.cara]?.[4]) { const m = caraDz(k.cara, true, k.arrugas || 0); if (k.decal.material.map !== m) { k.decal.material.map = m; k.decal.material.needsUpdate = true } return true } return false }

// ---------- UTILERÍA (escondida por defecto en cada cuadro: se muestra con attach(obj, k, "R"|"L", [x, y, z]) o ubicándola)
// Convención: los objetos de mano están armados para un brazo estirado HACIA ADELANTE (gestos "agita" y "golpea"): ahí quedan derechos.
function tuboAf(pts, r0, r1, RS = 8, TS = 16, plano = 1) { const cu = new THREE.CatmullRomCurve3(pts.map(q => new THREE.Vector3(...q))), geo = new THREE.TubeGeometry(cu, TS, 1, RS, false), p = geo.attributes.position, v = new THREE.Vector3(), fr = cu.computeFrenetFrames(TS, false);
  for (let i = 0; i <= TS; i++) { const c = cu.getPointAt(i / TS), rad = lerp(r0, r1, i / TS); for (let j = 0; j <= RS; j++) { const q = i * (RS + 1) + j; v.fromBufferAttribute(p, q).sub(c); const a = v.dot(fr.normals[i]), b = v.dot(fr.binormals[i]); v.copy(fr.normals[i]).multiplyScalar(a * rad).addScaledVector(fr.binormals[i], b * rad * plano).add(c); p.setXYZ(q, v.x, v.y, v.z) } }
  geo.computeVertexNormals(); return geo }
const T_MADERA_U = pintarDoble(256, 256, (c, z, w, h) => { const r = rng(5150); c.fillStyle = "#8a6238"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h); for (let k = 0; k < 90; k++) { const x = r() * w; c.strokeStyle = `rgba(${r() < .5 ? "50,30,12" : "190,150,96"},${.2 + r() * .3})`; c.lineWidth = 1 + r() * 3; c.beginPath(); c.moveTo(x, 0); c.bezierCurveTo(x + 8, h * .3, x - 8, h * .6, x + 4, h); c.stroke(); z.strokeStyle = "rgba(0,0,0,.4)"; z.lineWidth = 2; z.beginPath(); z.moveTo(x, 0); z.lineTo(x + 4, h); z.stroke() } });
const M_MADERA_U = new THREE.MeshStandardMaterial({ map: T_MADERA_U[0], bumpMap: T_MADERA_U[1], bumpScale: 1.5, roughness: .7 });
const PROP = g => { g.visible = false; g.userData.prop = 1; return g };
// la bandera roja de Miss Ode: palo de madera con remate y paño que flamea
const BANDERA_ROJA = PROP(new THREE.Group()); let BANDERA_GEO;
{ const G = new THREE.Group(); G.rotation.x = Math.PI / 2; BANDERA_ROJA.add(G); part(new THREE.CylinderGeometry(.03, .034, 2.0, 12), M_MADERA_U, 0, .72, 0, G, 0); part(new THREE.SphereGeometry(.055, 14, 10), SM("#c8a850", { metalness: .7, roughness: .35 }), 0, 1.75, 0, G, 0);
  const t = pintarDoble(512, 512, (c, z, w, h) => { c.fillStyle = "#cf1f1a"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h); tramaG(c, w, h, 61, 1.4); for (let y = 0; y < h; y += 5) { z.fillStyle = y % 10 ? "rgba(255,255,255,.2)" : "rgba(0,0,0,.2)"; z.fillRect(0, y, w, 2) }
    c.strokeStyle = "#8a1210"; c.lineWidth = 10; c.strokeRect(9, 9, w - 18, h - 18); c.setLineDash([14, 10]); c.strokeStyle = "#f08a7a"; c.lineWidth = 3; c.strokeRect(22, 22, w - 44, h - 44); z.strokeStyle = "rgba(0,0,0,.6)"; z.lineWidth = 8; z.strokeRect(9, 9, w - 18, h - 18) });
  BANDERA_GEO = new THREE.PlaneGeometry(1.15, .72, 28, 12); BANDERA_GEO.translate(.575 + .03, 0, 0); BANDERA_GEO.userData.p0 = BANDERA_GEO.attributes.position.array.slice();
  const pa = part(BANDERA_GEO, new THREE.MeshStandardMaterial({ map: t[0], bumpMap: t[1], bumpScale: 1.2, roughness: .85, side: THREE.DoubleSide }), 0, 1.32, 0, G, 0); for (const y of [1.62, 1.02]) part(new THREE.TorusGeometry(.04, .012, 6, 14), SM("#e8dcc0"), 0, y, 0, G, 0).rotation.x = Math.PI / 2 }
function banderaFlamea(t) { const p = BANDERA_GEO.attributes.position, p0 = BANDERA_GEO.userData.p0; for (let i = 0; i < p.count; i++) { const x = p0[i * 3], y = p0[i * 3 + 1], q = x / 1.18; p.setXYZ(i, x - q * q * .05, y - q * q * .07 + Math.sin(x * 4 - t * 8) * .025 * q, Math.sin(x * 5.5 - t * 10) * .12 * q + Math.sin(x * 11 - t * 15 + y * 4) * .035 * q) } p.needsUpdate = true; BANDERA_GEO.computeVertexNormals() }
banderaFlamea(0);
// taza de loza esmaltada (×2) y cuchara de metal (×2) para el brindis
const TAZA_M = [0, 1].map(i => { const R = PROP(new THREE.Group()), G = new THREE.Group(); G.rotation.x = 1.2; G.position.set(0, .05, .12); R.add(G); const col = ["#e9e2d0", "#d9cdb4"][i], m = new THREE.MeshStandardMaterial({ color: col, roughness: .35, side: THREE.DoubleSide });
  const pr = [[.001, .0], [.105, .0], [.13, .02], [.145, .22], [.15, .26], [.135, .26], [.125, .04], [.001, .03]].map(([a, b]) => new THREE.Vector2(a, b)); part(new THREE.LatheGeometry(pr, 28), m, 0, -.1, 0, G, 0);
  part(new THREE.TorusGeometry(.148, .012, 6, 28), SM(["#a8553a", "#576371"][i], { roughness: .4 }), 0, .15, 0, G, 0).rotation.x = Math.PI / 2; part(new THREE.CylinderGeometry(.125, .125, .01, 24), SM("#6a4a2a", { roughness: .2 }), 0, .1, 0, G, 0);
  const a = part(new THREE.TorusGeometry(.075, .02, 8, 18, Math.PI), m, .14, .03, 0, G, 0); a.rotation.z = -Math.PI / 2; return R });
const CUCHARA_M = [0, 1].map(() => { const R = PROP(new THREE.Group()), G = new THREE.Group(); G.rotation.x = 1.0; G.position.set(0, .0, .1); R.add(G); const m = SM("#c9c4b8", { metalness: .85, roughness: .3 });
  part(RB(.035, .42, .018, .008), m, 0, .12, 0, G, 0); const c = part(new THREE.SphereGeometry(.07, 16, 10), m, 0, .38, 0, G, 0); c.scale.set(.8, 1.15, .28); return R });
// el bebé: un bulto envuelto en una manta a rayas, con carita dormida, capucha de la manta y un mechón
const BEBE = PROP(new THREE.Group());
{ const t = tex(256, 256, (g, w, h) => { g.fillStyle = "#e6dcc6"; g.fillRect(0, 0, w, h); g.fillStyle = "#b88a3e"; for (let y = 20; y < h; y += 64) g.fillRect(0, y, w, 22); g.fillStyle = "#a8553a"; for (let y = 50; y < h; y += 64) g.fillRect(0, y, w, 6); tramaG(g, w, h, 19, 1.5) }), m = mTela(t);
  part(RB(.36, .62, .32, .15, 5), m, 0, 0, 0, BEBE, 0); const d = part(RB(.37, .16, .33, .05), m, 0, .02, .005, BEBE, 0); d.rotation.z = .5; part(RB(.3, .3, .3, .12, 5), m, 0, .4, -.02, BEBE, 0);
  part(RB(.25, .22, .22, .09, 5), SM("#e2b08a", { roughness: .6 }), 0, .4, .05, BEBE, 0);
  const cara = tex(256, 192, g => { g.strokeStyle = "#141014"; g.lineCap = "round"; g.lineWidth = 11; for (const x of [84, 172]) { g.beginPath(); g.moveTo(x - 20, 82); g.quadraticCurveTo(x, 100, x + 20, 82); g.stroke() } g.fillStyle = "#141014"; g.beginPath(); g.ellipse(128, 138, 9, 8, 0, 0, 7); g.fill(); g.fillStyle = "rgba(220,110,90,.45)"; for (const x of [52, 204]) { g.beginPath(); g.ellipse(x, 122, 20, 14, 0, 0, 7); g.fill() } });
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(.22, .165), new THREE.MeshStandardMaterial({ map: cara, transparent: true, roughness: .8, depthWrite: false })); pl.position.set(0, .4, .162); BEBE.add(pl);
  mechR(BEBE, new THREE.MeshStandardMaterial({ map: mechTex("#3a2418", 5), roughness: .5, flatShading: true }), [[0, .5, .13], [.03, .5, .17], [.06, .46, .175]], .03, .006, 1.4) }
// acunar: la madre sostiene al bebé contra el pecho con los dos brazos (llamar después de quieto/andar)
function acunar(k, obj = BEBE) { if (obj.parent !== k.body) k.body.add(obj); obj.visible = true; obj.position.set(-.1, 1.66, .5); obj.rotation.set(.35, 0, -1.2); obj.scale.setScalar(1);
  k.armL.rotation.set(-.72, 0, .5); k.armR.rotation.set(-.82, 0, -.5); k.head.rotation.x = .22; k.head.rotation.z = -.08 }
// el bastón de Old Dez: vara nudosa con mango curvo y regatón; si está en su mano, quieto()/andar() lo dejan vertical y apoyado en el piso
const BASTON = PROP(new THREE.Group());
{ const v = part(new THREE.CylinderGeometry(.034, .026, 1, 10), M_MADERA_U, 0, -.5, 0, BASTON, 0); BASTON.userData.vara = new THREE.Group(); BASTON.add(BASTON.userData.vara); BASTON.userData.vara.add(v);
  part(tuboAf([[0, -.02, 0], [0, .1, 0], [0, .17, .05], [0, .17, .15], [0, .1, .2]], .036, .03, 10, 18), M_MADERA_U, 0, 0, 0, BASTON, 0); const rg = part(new THREE.CylinderGeometry(.03, .034, .06, 10), SM("#2a2420"), 0, -.98, 0, BASTON.userData.vara, 0);
  for (const y of [-.3, -.62]) part(new THREE.SphereGeometry(.04, 8, 6), M_MADERA_U, .012, y, 0, BASTON.userData.vara, 0).scale.y = .7 }
const _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3();
function bastonAlPiso(k) { if (!BASTON.visible || (BASTON.parent !== k.handR && BASTON.parent !== k.handL)) return; k.g.updateMatrixWorld(true); const h = BASTON.parent; h.getWorldQuaternion(_q1); k.g.getWorldQuaternion(_q2); BASTON.quaternion.copy(_q1.invert().multiply(_q2));
  BASTON.getWorldPosition(_v1); k.g.getWorldPosition(_v2); const s = k.body.scale.y; BASTON.userData.vara.scale.y = Math.max(.2, (_v1.y - _v2.y) / s) }

// ---------- LA CABRA de la familia: bloques con pelaje pintado, cuernitos curvos, barba, orejas, collar y cencerro
const T_PELAJE = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(808); c.fillStyle = "#ece4d2"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
  for (let k = 0; k < 7; k++) { c.fillStyle = `rgba(122,84,52,${.75 + r() * .2})`; c.beginPath(); c.ellipse(r() * w, r() * h, 40 + r() * 70, 30 + r() * 50, r() * 3, 0, 7); c.fill() }
  for (let k = 0; k < 1500; k++) { const x = r() * w, y = r() * h, L = 8 + r() * 18; c.strokeStyle = `rgba(${r() < .5 ? "255,255,250" : "90,70,50"},${.1 + r() * .2})`; c.lineWidth = 1 + r() * 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - .5) * 5, y + L); c.stroke(); z.strokeStyle = r() < .5 ? "rgba(0,0,0,.35)" : "rgba(255,255,255,.3)"; z.lineWidth = 2; z.beginPath(); z.moveTo(x, y); z.lineTo(x, y + L); z.stroke() } });
const M_PELAJE = new THREE.MeshStandardMaterial({ map: T_PELAJE[0], bumpMap: T_PELAJE[1], bumpScale: 2, roughness: .95 });
const CABRA = PROP(new THREE.Group()); CABRA.g = CABRA; CABRA.userData.prop = 0; const CABRA_S = .8;
{ const C = new THREE.Group(); CABRA.add(C); CABRA.cu = C; const cl2 = SM("#f1ead9", { roughness: .9, bumpMap: T_PELAJE[1], bumpScale: 2 }), osc = SM("#6a4a30", { roughness: .9, bumpMap: T_PELAJE[1], bumpScale: 2 }), pez = SM("#2a2220", { roughness: .5 }), cuer = new THREE.MeshStandardMaterial({ map: T_MADERA_U[0], color: "#b8a888", bumpMap: T_MADERA_U[1], bumpScale: 2, roughness: .6 });
  part(RB(.48, .46, .94, .1, 4), M_PELAJE, 0, .68, 0, C, 0); part(RB(.44, .12, .7, .05), cl2, 0, .47, 0, C, 0);                                    // cuerpo y panza
  const cab = new THREE.Group(); cab.position.set(0, .86, .4); C.add(cab); CABRA.cab = cab;
  const nk = part(RB(.26, .44, .26, .08), M_PELAJE, 0, .12, .06, cab, 0); nk.rotation.x = .5;
  part(RB(.32, .3, .36, .08, 4), M_PELAJE, 0, .36, .22, cab, 0); part(RB(.23, .2, .24, .07, 4), cl2, 0, .3, .46, cab, 0); part(RB(.13, .07, .04, .02), SM("#3a2a28"), 0, .35, .585, cab, 0); part(RB(.1, .02, .02, .008), SM("#3a2a28"), 0, .26, .582, cab, 0);
  for (const s of [-1, 1]) { const e = part(new THREE.SphereGeometry(.05, 14, 10), SM("#141014", { roughness: .25 }), s * .163, .4, .3, cab, 0); e.scale.set(.3, 1.25, .9); part(new THREE.SphereGeometry(.014, 8, 6), SM("#ffffff", { emissive: "#ffffff", emissiveIntensity: .4 }), s * .178, .43, .31, cab, 0);
    const o = part(RB(.2, .06, .12, .03), osc, s * .25, .42, .08, cab, 0); o.rotation.z = -s * .45; o.rotation.y = s * .3;
    part(tuboAf([[s * .09, .48, .16], [s * .11, .62, .12], [s * .14, .72, .0], [s * .16, .74, -.12]], .05, .012, 8, 14), cuer, 0, 0, 0, cab, 0) }
  part(tuboAf([[0, .2, .44], [0, .1, .46], [0, -.02, .43]], .055, .008, 6, 8, .7), osc, 0, 0, 0, cab, 0);                                           // barba
  const col = part(new THREE.TorusGeometry(.17, .03, 8, 20), SM("#b0452c", { roughness: .7 }), 0, .1, .06, cab, 0); col.rotation.x = Math.PI / 2 + .5;
  part(new THREE.CylinderGeometry(.04, .07, .11, 12), SM("#c8a850", { metalness: .8, roughness: .3 }), 0, -.05, .2, cab, 0); part(new THREE.SphereGeometry(.022, 8, 6), SM("#6a5020", { metalness: .6 }), 0, -.11, .2, cab, 0);   // cencerro
  CABRA.patas = [[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sz]) => { const p = new THREE.Group(); p.position.set(sx * .16, .48, sz * .34); C.add(p); part(RB(.13, .42, .13, .03), sz > 0 ? cl2 : M_PELAJE, 0, -.2, 0, p, 0); part(RB(.145, .09, .155, .03), pez, 0, -.435, .005, p, 0); return p });
  const co = new THREE.Group(); co.position.set(0, .86, -.46); C.add(co); CABRA.cola = co; part(RB(.1, .1, .22, .04), cl2, 0, .04, -.08, co, 0).rotation.x = -.7 }
function cabraPose(t, { x = 0, z = 0, y = null, ry = 0, corre = 0, enBrazos = null } = {}) { CABRA.visible = true; const f = t / .4 * Math.PI * 2, s = Math.sin(f);
  CABRA.cola.rotation.y = Math.sin(t * 11) * .35; CABRA.cab.rotation.set(0, 0, 0);
  if (enBrazos) { const k = enBrazos, sc = CABRA_S / k.body.scale.y; if (CABRA.parent !== k.body) k.body.add(CABRA); CABRA.scale.setScalar(sc); CABRA.rotation.set(-.95, 0, 0); CABRA.position.set(0, 1.02, .62); CABRA.cu.position.set(0, -.68, 0); CABRA.cu.rotation.set(0, 0, 0);
    CABRA.patas.forEach((p, i) => p.rotation.set(i < 2 ? .5 : .9, 0, 0)); CABRA.cab.rotation.x = .6; k.armL.rotation.set(-.8, 0, .3); k.armR.rotation.set(-.8, 0, -.3); return }
  if (CABRA.parent !== TURT) TURT.add(CABRA); CABRA.scale.setScalar(CABRA_S); CABRA.position.set(x, y ?? ALT(x, z), z); CABRA.rotation.set(0, ry, 0);
  CABRA.cu.position.set(0, Math.abs(s) * .1 * corre, 0); CABRA.cu.rotation.set(-Math.cos(f) * .09 * corre, 0, 0); CABRA.patas.forEach((p, i) => p.rotation.set((i < 2 ? s : -s) * .75 * corre, 0, 0)); CABRA.cab.rotation.x = -.12 * corre }

// ---------- LOS DOS GALLOS (callados: pico siempre cerrado; picotean el piso)
const T_PLUMA = pintarDoble(256, 256, (c, z, w, h) => { c.fillStyle = "#ffffff"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h); for (let y = 0, f = 0; y < h + 20; y += 22, f++) for (let x = (f % 2) * 16; x < w + 32; x += 32) { c.strokeStyle = "rgba(0,0,0,.28)"; c.lineWidth = 3; c.beginPath(); c.arc(x, y, 16, .2, Math.PI - .2); c.stroke(); z.strokeStyle = "rgba(0,0,0,.6)"; z.lineWidth = 4; z.beginPath(); z.arc(x, y, 16, .2, Math.PI - .2); z.stroke() } });
const GALLOS = [0, 1].map(i => { const R = PROP(new THREE.Group()), U = new THREE.Group(); R.userData.prop = 0; U.position.y = .3; R.add(U); R.cu = U; TURT.add(R);
  const P = (col, o = {}) => new THREE.MeshStandardMaterial({ color: col, map: T_PLUMA[0], bumpMap: T_PLUMA[1], bumpScale: 1.5, roughness: .8, ...o }), cu = P(["#a8502a", "#e9e2d2"][i]), pe = P(["#d9a441", "#f4efe2"][i]), al = P(["#5a2a1a", "#a8a296"][i]), rojo = SM("#c8201c", { roughness: .5 }), am = SM("#e0a030", { roughness: .5 });
  const b = part(RB(.3, .3, .44, .1, 4), cu, 0, .12, 0, U, 0); b.rotation.x = -.25; part(RB(.26, .2, .2, .08), pe, 0, .16, .2, U, 0); for (const s of [-1, 1]) part(RB(.04, .2, .3, .02), al, s * .16, .13, -.02, U, 0).rotation.x = -.25;
  const cab = new THREE.Group(); cab.position.set(0, .26, .2); U.add(cab); R.cab = cab; part(RB(.16, .3, .16, .06), pe, 0, .12, 0, cab, 0); part(RB(.18, .17, .2, .06, 4), cu, 0, .32, .02, cab, 0);
  const pk = part(new THREE.ConeGeometry(.05, .13, 4), am, 0, .31, .17, cab, 0); pk.rotation.x = Math.PI / 2; pk.scale.x = .7;
  [[.1, .44, .08], [.13, .47, .0], [.1, .44, -.07]].forEach(([r, y, z]) => part(RB(.05, r, .09, .025), rojo, 0, y, z, cab, 0)); part(RB(.05, .12, .06, .025), rojo, 0, .2, .12, cab, 0);
  for (const s of [-1, 1]) { part(new THREE.SphereGeometry(.022, 10, 8), SM("#141014", { roughness: .2 }), s * .092, .34, .07, cab, 0); part(RB(.01, .07, .06, .004), SM("#f4efe2"), s * .092, .27, 0, cab, 0) }
  const colT = [["#1f3a32", "#223a4a", "#2a2a2a", "#3a5a3a", "#1f2a2a"], ["#8a8478", "#6a665e", "#a8a296", "#5a5650", "#8a8478"]][i]; for (let j = 0; j < 5; j++) { const a = (j - 2) * .3; part(tuboAf([[a * .1, .2, -.2], [a * .2, .46 + (2 - Math.abs(j - 2)) * .05, -.3], [a * .3, .5 + (2 - Math.abs(j - 2)) * .08, -.46], [a * .34, .34, -.6]], .05, .012, 6, 12, 2.6), P(colT[j], { side: THREE.DoubleSide }), 0, 0, 0, U, 0) }
  R.patas = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * .08, .02, 0); U.add(p); part(RB(.03, .3, .03, .01), am, 0, -.15, 0, p, 0); for (const a of [-.5, 0, .5]) { const d = part(RB(.025, .02, .12, .008), am, Math.sin(a) * .05, -.3, .05 * Math.cos(a), p, 0); d.rotation.y = a } return p }); return R });
function galloPose(i, t, { x = 0, z = 0, y = null, ry = 0, picotea = 1 } = {}) { const R = GALLOS[i]; R.visible = true; R.position.set(x, y ?? ALT(x, z), z); R.rotation.set(0, ry, 0); R.scale.setScalar(1.05 - i * .1);
  const T = 1.0 + i * .27, ph = (t + i * .43) % T, q = picotea * (ph < .1 ? ph / .1 : ph < .2 ? 1 : ph < .3 ? 1 - (ph - .2) / .1 : 0), paso = Math.floor((t + i * .43) / T);
  R.cu.rotation.x = q * .75; R.cab.rotation.set(q * .55, q ? 0 : [0, .7, -.5, .3][paso % 4], 0); R.patas.forEach(p => p.rotation.x = -q * .75) }

function utileriaReset() { [BANDERA_ROJA, ...TAZA_M, ...CUCHARA_M, BEBE, BASTON, CABRA, ...GALLOS].forEach(o => o.visible = false) }

// ---------- ARENA ENCIMA: 0→1, ropa, pelo y piel teñidos de arena + montoncitos en la cabeza y los hombros
const T_ARENA_U = pintarDoble(256, 256, (c, z, w, h) => { const r = rng(3131); c.fillStyle = ARENA_C; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h); for (let k = 0; k < 2600; k++) { const x = r() * w, y = r() * h, v = r(); c.fillStyle = `rgba(${v < .5 ? "120,96,60" : "250,236,200"},${.2 + r() * .4})`; c.fillRect(x, y, 2, 2); z.fillStyle = v < .5 ? "rgba(0,0,0,.6)" : "rgba(255,255,255,.6)"; z.fillRect(x, y, 2, 2) } });
const M_ARENA_U = new THREE.MeshStandardMaterial({ map: T_ARENA_U[0], bumpMap: T_ARENA_U[1], bumpScale: 2.5, roughness: 1 });
const GEO_MONTON = (() => { const g = new THREE.SphereGeometry(1, 20, 10, 0, 6.283, 0, Math.PI / 2), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), n = 1 + Math.sin(x * 5 + z * 3) * .1 + Math.sin(z * 7 - x * 2) * .07; p.setXYZ(i, x * n, Math.pow(y, 1.4) * n, z * n) } g.computeVertexNormals(); return g })();
function arenaEncima(k, q) { q = cl(q); if (!k._arena) { if (q <= 0) return; const A = k._arena = { mats: [], mont: [], q: 0 }, mapa = new Map(), col = new THREE.Color(ARENA_C);
    const rec = o => { if (o.userData.prop || o.isSprite || o === k.decal) return; if (o.isMesh) { const cam = m => { if (!m.color) return m; if (!mapa.has(m)) { const c = m.clone(); mapa.set(m, c); A.mats.push({ m: c, c0: c.color.clone(), e0: c.emissive ? c.emissive.clone() : null, i0: c.emissiveIntensity }) } return mapa.get(m) }; o.material = Array.isArray(o.material) ? o.material.map(cam) : cam(o.material) } o.children.forEach(rec) }; rec(k.g);
    const mo = (par, x, y, z, sx, sy, sz) => { const m = new THREE.Mesh(GEO_MONTON, M_ARENA_U); m.position.set(x, y, z); m.userData.s = [sx, sy, sz]; m.userData.prop = 1; m.castShadow = true; par.add(m); A.mont.push(m) };
    if (k.head) { mo(k.head, .02, .76, -.02, .3, .16, .27); mo(k.head, -.2, .72, .12, .14, .09, .12); [k.armL, k.armR].forEach((a, i) => mo(a, (i ? 1 : -1) * .02, .07, 0, .2, .1, .22)); mo(k.body, 0, 2.08, -.2, .3, .06, .1) } else mo(k.cu || k.g, 0, .9, -.05, .2, .1, .34) }
  const A = k._arena; if (A.q === q) return; A.q = q; const sc = new THREE.Color(ARENA_C);
  A.mats.forEach(({ m, c0, e0, i0 }) => { m.color.copy(c0).lerp(sc, q * .72); if (e0) { m.emissive.copy(e0).lerp(sc, q); m.emissiveIntensity = lerp(i0, .22, q) } });
  A.mont.forEach(m => { const [a, b, c] = m.userData.s; m.visible = q > .02; m.scale.set(a * (.5 + .5 * q), b * q, c * (.5 + .5 * q)) }) }

// ================= ANIMACIÓN CON LAS MEDIDAS DE LA REFERENCIA (se llaman DESPUÉS de pose(); dejan al personaje listo) =================
// pose() del motor queda envuelta: limpia lo que estas funciones tocan (para que nada quede pegado de un cuadro al otro),
// esconde la utilería una vez por cuadro y saca la arena.
{ const pose0 = pose; let tUlt = -1e9;
  pose = (k, t, o = {}) => { if (t !== tUlt) { tUlt = t; utileriaReset() } k.body.position.x = 0; k.body.position.z = 0; k.body.rotation.y = 0; k.body.rotation.z = 0; k.armL.rotation.y = 0; k.armR.rotation.y = 0; k.legL.rotation.y = 0; k.legR.rotation.y = 0; k.legL.rotation.z = 0; k.legR.rotation.z = 0;
    if (k._arena && k._arena.q) arenaEncima(k, 0); pose0(k, t, o) } }
// quiebre de cadera (lo único que se dobla: el torso gira en la cadera y las piernas siguen rectas; sin codos ni rodillas).
// lean = inclinación del torso; psi = ángulo medio de las piernas respecto de la vertical. Los pies quedan en su lugar.
function cadera(k, lean, psi = 0) { const b = k.body, L0 = b.rotation.x, s = b.scale.y, d = lean - L0;
  if (k.falda != null) { b.rotation.x = lean * .6; return }                       // con pollera se inclina el cuerpo entero (menos), para que las piernas no asomen
  b.rotation.x = lean; k.legL.rotation.x += psi - d; k.legR.rotation.x += psi - d; b.position.z -= H_CAD * s * ((Math.sin(lean) - Math.sin(L0)) - Math.sin(psi)); b.position.y -= H_CAD * s * ((Math.cos(lean) - Math.cos(L0)) - (Math.cos(psi) - 1)) }
const _fase = k => (k.idx || 0) * 1.7;
function quieto(k, t, { mira = 0 } = {}) { const A = A_BRAZO;
  k.legL.rotation.set(0, 0, 0); k.legR.rotation.set(0, 0, 0); k.armL.rotation.set(0, 0, -A); k.armR.rotation.set(0, 0, A); k.head.rotation.set(0, mira, 0); k.body.rotation.set(0, 0, 0); k.body.position.set(0, 0, 0);
  if (k.encorvado) { cadera(k, k.encorvado); k.head.rotation.x = -k.encorvado * .75; if (BASTON.visible && BASTON.parent === k.handR) k.armR.rotation.set(-.55 - k.encorvado, 0, .12) }
  bastonAlPiso(k); parpadeo(k, t) }
// caminata: ciclo de 15 cuadros a 30 fps (0,5 s); piernas ±27,5°, brazos ±7° en «A», balanceo lateral ±5°, rebote chico, sin inclinarse
function andar(k, t, { vel = 1 } = {}) { const f = t * vel / .5 * Math.PI * 2 + _fase(k), sw = Math.sin(f), amp = k.pasoMax ?? .48, A = A_BRAZO, s = k.body.scale.y;
  k.body.rotation.set(0, 0, sw * .087); k.body.position.set(0, -H_CAD * s * (1 - Math.cos(amp * sw)), 0);
  k.legL.rotation.set(sw * amp, 0, 0); k.legR.rotation.set(-sw * amp, 0, 0); k.armL.rotation.set(-sw * .12, 0, -A); k.armR.rotation.set(sw * .12, 0, A); k.head.rotation.set(0, 0, -sw * .04);
  if (k.encorvado) { cadera(k, k.encorvado); k.head.rotation.x = -k.encorvado * .75; if (BASTON.visible && BASTON.parent === k.handR) k.armR.rotation.set(-.55 - k.encorvado + sw * .25, 0, .12) }
  bastonAlPiso(k); parpadeo(k, t) }
// corrida: ciclo de 15 cuadros (0,5 s); torso 20° hacia adelante, brazos rígidos apenas hacia atrás (fuerte = 1: bombean a 90° del torso), rebote, polvo suave
function correrV(k, t, { fuerte = 0 } = {}) { const f = t / .5 * Math.PI * 2 + _fase(k), sw = Math.sin(f), amp = k.zancMax ?? .87, A = A_BRAZO, lean = .35, s = k.body.scale.y;
  k.body.rotation.set(0, 0, 0); k.body.position.set(0, Math.abs(sw) * .13 * s, 0); k.legL.rotation.set(sw * amp, 0, 0); k.legR.rotation.set(-sw * amp, 0, 0); cadera(k, lean);
  const b0 = lerp(.38, -1.2, fuerte), ba = lerp(.06, .55, fuerte), bz = lerp(A * .7, .12, fuerte); k.armL.rotation.set(b0 - sw * ba, 0, -bz); k.armR.rotation.set(b0 + sw * ba, 0, bz); k.head.rotation.set(-lean * .7, 0, 0);
  if (!k.polvo) k.polvo = Array.from({ length: 4 }, () => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#d9c8a4", transparent: true, opacity: 0, depthWrite: false })); scene.add(sp); return sp });
  k.g.updateMatrixWorld(true); k.polvo.forEach((sp, i) => { const q = (t * 2 + i / 4) % 1; sp.visible = k.g.visible; sp.position.copy(k.g.localToWorld(_v1.set((i % 2 ? .22 : -.22), .08 + q * .3, -.35 - q * 1.1))); sp.scale.setScalar((.3 + q * .8) * s); sp.material.opacity = (1 - q) * .2 });
  parpadeo(k, t) }
// gestos LINEALES (dur = 0,4 s = 12 cuadros), sin rebote ni anticipación; se quedan en la pose. `fin`: tiempo en que vuelve (también lineal).
// tipos: senala, cubre, brazos, alza, abraza, sopla, tira, grita + escucha (mano a la oreja), agita (la bandera), golpea (cuchara en la taza)
const GESTOS = {
  senala: { R: [-1.5, 0], lean: 0 }, alza: { R: [-3.0, .1] }, escucha: { R: [0, 2.95], hz: -.14, hy: -.18 },
  cubre: { L: [-2.2, .62], R: [-2.2, -.62], hx: .16, lean: .1 }, brazos: { L: [0, -.94], R: [0, .94], hx: -.06, lean: -.07 }, abraza: { L: [-1.2, .42], R: [-1.2, -.42] },
  sopla: { L: [-2.05, .45], R: [-2.05, -.45], lean: .32, hx: -.22 }, tira: { L: [-1.25, .14], R: [-1.25, -.14], lean: -.3, hx: .12 }, grita: { L: [-2.0, -.14], R: [-2.0, .14], lean: .26, hx: -.2 },
  agita: { R: [-1.6, .1] }, golpea: { L: [-1.15, .34], R: [-1.3, -.3] } };
function gesto(k, t, t0, tipo, { dur = .4, fin = null, mano = "R", alto = 0 } = {}) { const G = GESTOS[tipo]; if (!G) return 0; let u = P(t, t0, t0 + dur); if (fin != null) u *= 1 - P(t, fin, fin + dur); if (u <= 0) return 0;
  const esp = mano === "L" && !G.L, ap = (a, [x, z], sg) => { a.rotation.x = lerp(a.rotation.x, x, u); a.rotation.z = lerp(a.rotation.z, z * sg, u) };
  if (G.L) ap(k.armL, G.L, 1); if (G.R) { const [x, z] = G.R, xx = tipo === "senala" ? x - alto : x; esp ? ap(k.armL, [xx, z], -1) : ap(k.armR, [xx, z], 1) }
  if (G.lean) cadera(k, lerp(k.body.rotation.x, k.body.rotation.x + G.lean, u));
  if (G.hx) k.head.rotation.x += G.hx * u; if (G.hz) k.head.rotation.z += G.hz * u * (esp ? -1 : 1); if (G.hy) k.head.rotation.y += G.hy * u * (esp ? -1 : 1);
  if (u >= 1) { const tri = (per, fa = 0) => { const q = ((t - t0 - dur) / per + fa) % 1; return q < .5 ? q * 4 - 1 : 3 - q * 4 };   // vaivén lineal (onda triangular)
    if (tipo === "agita") { const a = esp ? k.armL : k.armR; a.rotation.x = -1.6 + tri(16 * F30) * .38; a.rotation.z = (esp ? -1 : 1) * (.1 + tri(16 * F30, .25) * .3) }
    if (tipo === "golpea") k.armR.rotation.x = -1.3 + Math.max(0, tri(8 * F30)) * .28 }
  return u }
// caída: el cuerpo tieso vuelca en 16 cuadros (dir = 1 de cara, −1 de espaldas) y queda acostado
function caer(k, t, t0, { dir = -1, dur = 16 * F30 } = {}) { const u = P(t, t0, t0 + dur); if (u <= 0) return 0; const a = u * u * Math.PI / 2, s = k.body.scale.y; k.body.rotation.x = dir * a; k.body.position.y = Math.sin(a) * .3 * s; k.body.position.z = -dir * Math.sin(a) * .3 * s; k.head.rotation.set(0, 0, 0); return u }
// salto: se agacha 8 cuadros (anticipación, quiebre de cadera), salta tieso y cae (14 cuadros en el aire); devuelve la altura
function saltar(k, t, t0, { alto = .9, aire = 14 * F30 } = {}) { const ta = 8 * F30, s = k.body.scale.y; if (t <= t0 || t >= t0 + ta + aire) return 0;
  if (t < t0 + ta) { const c = (t - t0) / ta; cadera(k, .5 * c, -.42 * c); k.armL.rotation.x = .5 * c; k.armR.rotation.x = .5 * c; k.head.rotation.x -= .3 * c; return 0 }
  const v = (t - t0 - ta) / aire, y = alto * 4 * v * (1 - v) * s; k.body.position.y += y; k.armL.rotation.z = -A_BRAZO - .25; k.armR.rotation.z = A_BRAZO + .25; return y }

// ================= PERSONAJES Y CARAS COMO LOS DE VOLZE (pedido del dueño, 25-nov-2026: «menos detalle, un brazo rectangular,
// no dos figuras; las caras son muy Playmobil y no Roblox»). Descripción completa en skills/shorts-volze/referencia/personajes-volze.md.
// Resumen: seis bloques (cabeza, torso, dos brazos, dos piernas), cada uno UNA sola pieza de plástico mate con bisel chico; la ropa
// es una CALCOMANÍA plana pintada sobre los bloques (manga, puños, zapatos, chaleco, poncho, pollera: todo pintado, nada en 3D);
// lo único en 3D son el pelo, los sombreros, los pañuelos de cabeza, los anteojos y la barba, de pocos polígonos y color liso.
// La cara es una calcomanía de Roblox: ojos de óvalo negro SIN brillo, cejas de trazo fino solo cuando expresan algo, boca de
// línea fina (o boca abierta negra, dientes apretados o zigzag de miedo).

// ---------- ropa pintada (2D, como la ropa de Roblox): colores planos, un estampado limpio, sombreado suave de arriba hacia abajo
const ROPAV = {};
const sombra2D = (g, w, h, a = .1) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(255,255,255,.05)"); gr.addColorStop(1, `rgba(0,0,0,${a})`); g.fillStyle = gr; g.fillRect(0, 0, w, h) };
function estampa(g, w, h, kind, base, alt, x0 = 0, y0 = 0, ww = w, hh = h) { g.fillStyle = alt; g.strokeStyle = alt;
  if (kind === "rayas") for (let x = x0 + 30; x < x0 + ww; x += 84) g.fillRect(x, y0, 26, hh);
  if (kind === "franjas") for (let y = y0 + 60; y < y0 + hh; y += 140) g.fillRect(x0, y, ww, 56);
  if (kind === "rombos") for (let i = 0; i < 3; i++) { const x = x0 + ww * (i + .5) / 3, y = y0 + hh * .55; g.beginPath(); g.moveTo(x, y - 46); g.lineTo(x + 34, y); g.lineTo(x, y + 46); g.lineTo(x - 34, y); g.closePath(); g.fill() }
  if (kind === "zigzag") { g.lineWidth = 20; g.lineJoin = "miter"; for (const yy of [.42, .66]) { g.beginPath(); for (let i = -1; i <= 9; i++) g.lineTo(x0 + i * ww / 8, y0 + hh * yy + (i % 2 ? -26 : 26)); g.stroke() } }
  if (kind === "guarda") { g.fillRect(x0, y0 + hh * .62, ww, 16); g.fillRect(x0, y0 + hh * .62 + 40, ww, 10) }
  if (kind === "lunares") for (let y = y0 + 50, f = 0; y < y0 + hh; y += 100, f++) for (let x = x0 + (f % 2 ? 90 : 36); x < x0 + ww; x += 120) { g.beginPath(); g.arc(x, y, 18, 0, 7); g.fill() } }
// el frente/espalda del torso. o: { col, kind, alt, cuello, poncho: [guarda, guarda2], chaleco: [col, vivo], faja: [col, vivo], panuelo, botones, vestido }
function torsoV(o, back = false) { const key = JSON.stringify(o) + back; return ROPAV[key] ||= tex(512, 512, (g, w, h) => {
  g.fillStyle = o.col; g.fillRect(0, 0, w, h); if (o.kind) estampa(g, w, h, o.kind, o.col, o.alt);
  if (o.chaleco) { g.fillStyle = o.chaleco[0]; if (back) g.fillRect(0, 0, w, h); else { g.fillRect(0, 0, 170, h); g.fillRect(w - 170, 0, 170, h) } if (o.chaleco[1] && !back) { g.fillStyle = o.chaleco[1]; g.fillRect(162, 0, 10, h); g.fillRect(w - 172, 0, 10, h) } }
  if (o.poncho) { const V = (d, lw, c) => { g.strokeStyle = c; g.lineWidth = lw; g.lineJoin = "miter"; g.beginPath(); g.moveTo(-10, 250 - d); g.lineTo(256, 470 - d); g.lineTo(522, 250 - d); g.stroke() }; V(30, 22, o.poncho[0]); V(100, 14, o.poncho[1] || o.poncho[0]) }
  if (o.faja) { g.fillStyle = o.faja[0]; g.fillRect(0, h - 120, w, 70); if (o.faja[1]) { g.fillStyle = o.faja[1]; g.fillRect(0, h - 92, w, 12) } }
  if (!back && o.cuello) { g.fillStyle = o.cuello; g.beginPath(); g.moveTo(170, 0); g.lineTo(256, 92); g.lineTo(342, 0); g.closePath(); g.fill(); g.fillStyle = o.col; g.beginPath(); g.moveTo(200, 0); g.lineTo(256, 58); g.lineTo(312, 0); g.closePath(); g.fill() }
  if (!back && o.panuelo) { g.fillStyle = o.panuelo; g.fillRect(120, 0, 272, 34); g.beginPath(); g.moveTo(170, 20); g.lineTo(256, 150); g.lineTo(342, 20); g.closePath(); g.fill() }
  if (back && o.panuelo) { g.fillStyle = o.panuelo; g.fillRect(120, 0, 272, 34) }
  if (!back && o.botones) { g.fillStyle = o.botones; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(256, 130 + k * 82, 11, 0, 7); g.fill() } }
  if (!back && o.cuello === undefined && !o.panuelo && !o.poncho) { g.fillStyle = "rgba(0,0,0,.18)"; g.beginPath(); g.moveTo(196, 0); g.lineTo(256, 50); g.lineTo(316, 0); g.closePath(); g.fill() }   // escote en V apenas marcado
  sombra2D(g, w, h, .12) }) }
// brazo: manga de color hasta `manga` (0 = sin manga, 1 = manga larga sin mano a la vista), puño pintado, mano color piel
const brazoV = (o) => ROPAV["b" + JSON.stringify(o)] ||= tex(128, 256, (g, w, h) => { const y = h * o.manga; g.fillStyle = o.skin; g.fillRect(0, 0, w, h); g.fillStyle = o.col; g.fillRect(0, 0, w, y);
  if (o.puno) { g.fillStyle = o.puno; g.fillRect(0, y - 22, w, 16) } if (o.guarda) { g.fillStyle = o.guarda; g.fillRect(0, y * .55, w, 12) } g.fillStyle = "rgba(0,0,0,.16)"; g.fillRect(0, y, w, 4); sombra2D(g, w, h, .1) });
// pierna: pantalón (o pollera pintada hasta `falda`), piel, y el zapato como una franja oscura abajo
const piernaV = (o) => ROPAV["p" + JSON.stringify(o)] ||= tex(128, 256, (g, w, h) => { g.fillStyle = o.skin; g.fillRect(0, 0, w, h);
  const y = h * (o.falda ?? .87); g.fillStyle = o.col; g.fillRect(0, 0, w, y); if (o.alt) { g.fillStyle = o.alt; g.fillRect(0, y - 26, w, 14) }
  g.fillStyle = o.zapato; g.fillRect(0, h * .87, w, h * .13); g.fillStyle = "rgba(255,255,255,.12)"; g.fillRect(0, h * .87, w, 4); sombra2D(g, w, h, .1) });

// ---------- caras de Roblox (calcomanía 512 × 384 sobre el frente de la cabeza)
const CARAV = {};
const CARA_V = {   // [tamaño de ojos, cejas, boca, modo de ojos]   cejas: 0 ninguna, 1 preocupadas (adentro arriba), -1 enojadas, 2 altas (sorpresa), 3 una levantada
  neutral: [1, 0, "flat"], worried: [1, 1, "frown"], gloomy: [.85, 0, "flat", "medio"], pleading: [1.1, 1, "frown"], sad: [1, 1, "frown"],
  scared: [1.12, 1, "zigzag"], terrified: [1.22, 1, "scream"], horrified: [1.2, 1, "zigzagG"], panic: [1.2, 1, "scream"],
  shock: [1.18, 2, "o"], gasp: [1.18, 2, "o"], happy: [1, 0, "smile"], warm: [1, 0, "smileS"], laugh: [1, 0, "open", "feliz"], excited: [1.1, 2, "open"], starstruck: [1.15, 2, "open"],
  hopeful: [1.05, 1, "smileS"], relieved: [1, 1, "smile", "feliz"], squint: [1, 0, "flat", "raya"], suspicious: [1, 3, "smirk", "uno"], determined: [1, -1, "flat"], brave: [1, -1, "smileS"],
  angry: [1, -1, "dientes"], curious: [1.1, 3, "oS"], listen: [1.2, 2, "oS"], grito: [1, -1, "scream"], sopla: [1, 0, "o", "apret"], susurra: [.95, 1, "oS"], cerrados: [1, 0, "flat", "cerr"], paz: [1, 0, "smileS", "feliz"] };
function caraV(kind, cerr = false) { const key = kind + (cerr ? "_c" : ""); if (CARAV[key]) return CARAV[key];
  return CARAV[key] = tex(512, 384, (g, w, h) => { const ink = "#121014", [es, ceja, boca, ojo0 = ""] = CARA_V[kind] || CARA_V.neutral, ojo = cerr && !["apret", "cerr", "feliz"].includes(ojo0) ? "cerr" : ojo0, LW = 15, EY = 145;
    g.fillStyle = ink; g.strokeStyle = ink; g.lineCap = "round"; g.lineJoin = "round"; g.lineWidth = LW;
    [-1, 1].forEach(s => { const x = 256 + s * 74, rx = 30 * es, ry = 40 * es;
      if (ojo === "cerr") { g.beginPath(); g.moveTo(x - 34, EY + 2); g.quadraticCurveTo(x, EY + 26, x + 34, EY + 2); g.stroke() }
      else if (ojo === "feliz") { g.beginPath(); g.moveTo(x - 34, EY + 12); g.quadraticCurveTo(x, EY - 24, x + 34, EY + 12); g.stroke() }
      else if (ojo === "apret") { g.beginPath(); g.moveTo(x - s * 30, EY - 26); g.lineTo(x + s * 24, EY); g.lineTo(x - s * 30, EY + 26); g.stroke() }
      else if (ojo === "raya" || (ojo === "uno" && s > 0)) { g.fillRect(x - 34, EY - 8, 68, 16) }
      else if (ojo === "medio") { g.beginPath(); g.ellipse(x, EY + 6, rx, ry * .7, 0, 0, Math.PI); g.fill(); g.fillRect(x - rx, EY + 4, rx * 2, 6) }
      else { g.beginPath(); g.ellipse(x, EY, rx, ry, 0, 0, 7); g.fill() }
      // cejas: trazo fino y corto, pegado arriba del ojo
      const yb = EY - ry - 24; g.lineWidth = 14;
      if (ceja === 1) { g.beginPath(); g.moveTo(x + s * 30, yb + 8); g.lineTo(x - s * 26, yb - 10); g.stroke() }
      if (ceja === -1) { g.beginPath(); g.moveTo(x + s * 30, yb - 10); g.lineTo(x - s * 26, yb + 12); g.stroke() }
      if (ceja === 2) { g.beginPath(); g.moveTo(x - 28, yb - 8); g.quadraticCurveTo(x, yb - 26, x + 28, yb - 8); g.stroke() }
      if (ceja === 3) { g.beginPath(); if (s < 0) { g.moveTo(x - 28, yb - 6); g.quadraticCurveTo(x, yb - 26, x + 28, yb - 10) } else { g.moveTo(x - 28, yb + 4); g.lineTo(x + 28, yb + 4) } g.stroke() }
      g.lineWidth = LW });
    const MY = 300; g.save(); g.translate(256, MY); g.scale(1.7, 1.4); g.translate(-256, -MY); g.lineWidth = LW / 1.5;
    if (boca === "flat") { g.beginPath(); g.moveTo(226, MY); g.lineTo(286, MY); g.stroke() }
    if (boca === "frown") { g.beginPath(); g.moveTo(218, MY + 12); g.quadraticCurveTo(256, MY - 16, 294, MY + 12); g.stroke() }
    if (boca === "smile") { g.beginPath(); g.moveTo(206, MY - 12); g.quadraticCurveTo(256, MY + 30, 306, MY - 12); g.stroke() }
    if (boca === "smileS") { g.beginPath(); g.moveTo(222, MY - 6); g.quadraticCurveTo(256, MY + 16, 290, MY - 6); g.stroke() }
    if (boca === "smirk") { g.beginPath(); g.moveTo(222, MY + 4); g.quadraticCurveTo(262, MY + 8, 292, MY - 12); g.stroke() }
    if (boca === "o") { g.beginPath(); g.ellipse(256, MY, 18, 23, 0, 0, 7); g.fill() }
    if (boca === "oS") { g.beginPath(); g.ellipse(256, MY, 11, 13, 0, 0, 7); g.fill() }
    if (boca === "zigzag" || boca === "zigzagG") { const W = boca === "zigzag" ? 120 : 160, n = boca === "zigzag" ? 6 : 8; g.beginPath(); for (let i = 0; i <= n; i++) g.lineTo(256 - W / 2 + i * W / n, MY + (i % 2 ? -14 : 12)); g.stroke() }
    if (boca === "open") { g.beginPath(); g.moveTo(200, MY - 22); g.lineTo(312, MY - 22); g.quadraticCurveTo(310, MY + 46, 256, MY + 48); g.quadraticCurveTo(202, MY + 46, 200, MY - 22); g.closePath(); g.fill(); g.fillStyle = "#ffffff"; g.fillRect(212, MY - 16, 88, 14) }
    if (boca === "scream") { g.beginPath(); g.ellipse(256, MY + 8, 46, 40, 0, 0, 7); g.fill(); g.fillStyle = "#ffffff"; g.fillRect(226, MY - 28, 60, 12) }
    if (boca === "dientes") { g.fillStyle = "#ffffff"; g.beginPath(); g.roundRect(196, MY - 26, 120, 52, 14); g.fill(); g.lineWidth = 9; g.stroke(); g.lineWidth = 6; g.beginPath(); g.moveTo(198, MY); g.lineTo(314, MY); for (const x of [226, 256, 286]) { g.moveTo(x, MY - 24); g.lineTo(x, MY + 24) } g.stroke() } g.restore() }) }
caraDz = (kind, cerr = false) => caraV(kind, cerr);
setFace = (k, f) => { k.cara = f; const t = caraV(f); if (k.decal.material.map !== t) { k.decal.material.map = t; k.decal.material.needsUpdate = true } };

// ---------- pelo, sombreros, pañuelos, anteojos y barba: accesorios de Roblox de pocos polígonos, color liso, caras planas
function accMat(col, o = {}) { return new THREE.MeshStandardMaterial({ color: col, roughness: .5, flatShading: true, ...o }) }
const oscV = (c, f) => "#" + new THREE.Color(c).multiplyScalar(f).getHexString();
// trozo de pelo: un poliedro estirado (de 5 lados) que nace en `a` y termina en punta en `b`
function trozo(par, m, a, b, r) { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), L = A.distanceTo(B), geo = new THREE.ConeGeometry(r, L, 5, 1); geo.translate(0, L / 2, 0);
  const me = new THREE.Mesh(geo, m); me.position.copy(A); me.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize()); me.castShadow = true; me.userData.pelo = 1; par.add(me); return me }
function bloque(par, m, w, h, d, x, y, z, rx = 0, ry = 0, rz = 0) { const me = part(new THREE.BoxGeometry(w, h, d), m, x, y, z, par, 0); me.rotation.set(rx, ry, rz); me.userData.pelo = 1; return me }
function gema(par, m, r, x, y, z, sx = 1, sy = 1, sz = 1, det = 0) { const me = part(new THREE.IcosahedronGeometry(r, det), m, x, y, z, par, 0); me.scale.set(sx, sy, sz); me.userData.pelo = 1; return me }
// la cabeza mide .74 × .66 × .70 (de y = .05 a .71); el pelo va ENCIMA y por fuera, más grande que la cabeza, como un accesorio
function peloV(h, estilo, col) { const m = accMat(col), md = accMat(oscV(col, .78));
  if (estilo === "bajo") { bloque(h, md, .8, .44, .14, 0, .5, -.36); for (const s of [-1, 1]) bloque(h, md, .1, .3, .44, s * .395, .55, -.12); return }
  // casquete facetado: tapa arriba, atrás y los costados
  gema(h, m, .5, 0, .66, -.03, .86, .4, .82, 1);
  bloque(h, md, .78, .46, .16, 0, .5, -.34); for (const s of [-1, 1]) bloque(h, md, .1, .28, .5, s * .39, .58, -.06);
  if (estilo === "corto") { [[-.26, .74, .2, -.42, .82, .44], [-.1, .8, .22, .06, .82, .48], [.08, .8, .2, .32, .74, .44], [.24, .76, .14, .44, .62, .32], [-.3, .76, -.06, -.5, .7, .1], [.3, .78, -.1, .5, .72, .02], [0, .86, -.1, -.08, 1.02, .08], [.14, .86, -.16, .26, .98, -.02]].forEach(([a, b, c, d, e, f], i) => trozo(h, i % 3 ? m : md, [a, b, c], [d, e, f], .15)) }
  if (estilo === "puntas") { [[-.22, .1, -.5], [0, .14, 0], [.22, .1, .5], [-.12, -.12, -.3], [.14, -.12, .3], [0, -.26, 0], [-.3, -.2, -.8], [.3, -.2, .8]].forEach(([x, z, a], i) => trozo(h, i % 2 ? m : md, [x, .78, z], [x * 1.4 + a * .1, 1.12, z * 1.2 - .1], .14));
    [-.2, .02, .22].forEach(x => trozo(h, m, [x, .76, .16], [x + .08, .6, .44], .12)) }
  if (estilo === "rulos") { for (let k = 0; k < 22; k++) { const a = k / 22 * 6.283 * 2.3, rr = k < 9 ? .36 : k < 17 ? .24 : .08, y = k < 9 ? .62 : k < 17 ? .82 : .92; gema(h, k % 3 ? m : md, .15, Math.cos(a) * rr, y, Math.sin(a) * rr * .95 - .04) } }
  if (estilo === "rodete") { gema(h, m, .2, 0, .88, -.26, 1, .9, 1); [[-.26, .74, .2, -.36, .62, .4], [.26, .74, .2, .36, .62, .4], [0, .8, .22, .04, .7, .44]].forEach(([a, b, c, d, e, f]) => trozo(h, m, [a, b, c], [d, e, f], .14)) }
  if (estilo === "largo" || estilo === "melena") { const L = estilo === "largo" ? -.32 : .1; bloque(h, md, .84, .6 - L, .18, 0, (.62 + L) / 2, -.36); for (const s of [-1, 1]) bloque(h, m, .14, .58 - L, .4, s * .41, (.66 + L) / 2, -.12, 0, 0, s * .06);
    [[-.24, .76, .2, -.4, .6, .42], [0, .8, .22, .1, .7, .46], [.24, .76, .2, .4, .6, .42]].forEach(([a, b, c, d, e, f]) => trozo(h, m, [a, b, c], [d, e, f], .15)) } }
function sombreroV(k, { col = "#d6b36a", cinta = "#a8553a", tilt = -.18, ala = .78, pelo = null } = {}) { const G = new THREE.Group(); G.position.set(0, .7, -.02); G.rotation.x = tilt; k.head.add(G); G.userData.pelo = 1; const m = accMat(col, { side: THREE.DoubleSide });
  part(new THREE.CylinderGeometry(ala, ala, .05, 12), m, 0, -.04, 0, G, 0); part(new THREE.CylinderGeometry(.33, .4, .36, 12), m, 0, .14, 0, G, 0); part(new THREE.CylinderGeometry(.405, .405, .09, 12), accMat(cinta), 0, .02, 0, G, 0);
  if (pelo) peloV(k.head, "bajo", pelo); return G }
function panueloV(k, col, pelo = null) { const m = accMat(col); gema(k.head, m, .5, 0, .64, -.05, .88, .46, .84, 1); bloque(k.head, m, .82, .5, .16, 0, .46, -.34); for (const s of [-1, 1]) bloque(k.head, m, .1, .34, .52, s * .4, .54, -.06);
  gema(k.head, accMat(oscV(col, .8)), .12, 0, .3, -.46); if (pelo) { const mp = accMat(pelo); for (const s of [-1, 1]) bloque(k.head, mp, .14, .1, .1, s * .26, .64, .34) } }
function anteojosV(k) { const m = accMat("#1e1a18", { flatShading: false }); for (const s of [-1, 1]) part(new THREE.TorusGeometry(.085, .014, 6, 18), m, s * .133, .45, .362, k.head, 0); part(new THREE.BoxGeometry(.1, .016, .016), m, 0, .46, .362, k.head, 0) }
function barbaV(k, col) { const m = accMat(col), md = accMat(oscV(col, .86)); bloque(k.head, m, .66, .24, .16, 0, .04, .3); bloque(k.head, md, .5, .2, .14, 0, -.12, .28); trozo(k.head, m, [0, -.08, .3], [0, -.36, .3], .14);
  for (const s of [-1, 1]) bloque(k.head, m, .12, .36, .42, s * .37, .2, .1) }   // la barba arranca debajo de la boca pintada

// ---------- reconstruir a cada personaje con seis bloques y la ropa pintada
const quitarMallas = grp => [...grp.children].forEach(c => { if (c.isMesh || c.userData.pelo) grp.remove(c) });
function volze(k, o) { const skin = o.skin; k.skin = skin; k.r6 = true; delete k.falda; delete k.pasoMax; delete k.zancMax;
  [k.body, k.armL, k.armR, k.legL, k.legR].forEach(quitarMallas); [...k.head.children].forEach(c => { if (c !== k.decal) k.head.remove(c) });
  const plast = map => new THREE.MeshStandardMaterial({ map, roughness: .62 });
  // torso 1,04 × 1,04 × .52; brazos y piernas .5 × 1,04 × .5 (la mitad del torso), pegados; bisel chico
  const t = o.torso, lado = plast(tex(64, 64, (g, w, h) => { g.fillStyle = t.chaleco ? t.chaleco[0] : t.col; g.fillRect(0, 0, w, h); if (t.faja) { g.fillStyle = t.faja[0]; g.fillRect(0, h * .77, w, h * .14) } sombra2D(g, w, h, .12) }));
  part(RB(1.04, 1.04, .52, .05), boxMats(lado, plast(torsoV(t)), plast(torsoV(t, true))), 0, 1.54, 0, k.body, 0);
  [k.armL, k.armR].forEach((a, i) => { part(RB(.5, 1.04, .5, .05), plast(brazoV({ skin, ...o.brazo })), 0, -.44, 0, a, 0); a.position.x = (i ? 1 : -1) * .77 });
  [k.legL, k.legR].forEach((l, i) => { part(RB(.5, 1.02, .5, .05), plast(piernaV({ skin, ...o.pierna })), 0, -.5, 0, l, 0); l.position.x = (i ? 1 : -1) * .26 });
  // cabeza de Roblox: bloque ancho con las aristas verticales bien redondeadas, sin cuello; la cara pegada al frente
  part(RB(.74, .66, .7, .075, 4), new THREE.MeshStandardMaterial({ color: skin, roughness: .55 }), 0, .38, 0, k.head, 0);
  k.decal.geometry = new THREE.PlaneGeometry(.74, .555); k.decal.position.set(0, .4, .3515); k.decal.material.transparent = true; k.decal.material.needsUpdate = true;
  if (o.pelo) peloV(k.head, ...o.pelo); if (o.sombrero) sombreroV(k, o.sombrero); if (o.panuelo) panueloV(k, ...o.panuelo); if (o.anteojos) anteojosV(k); if (o.barba) barbaV(k, o.barba);
  if (o.escala) k.body.scale.setScalar(o.escala); k.arrugas = 0; k._arena = null; setFace(k, "neutral") }

// ---------- el elenco con la ropa pintada (mismos colores e identidad que antes; ponchos, chalecos, fajas, polleras y pañuelos ahora son calcomanía)
const L_ = (col, skin, manga = 1, puno = null) => ({ col, manga, puno });
volze(ME, { skin: "#eebd94", torso: { col: "#0fa97c", poncho: ["#f6efdc", "#f6efdc"] }, brazo: { col: "#0fa97c", manga: .8, puno: "#f6efdc" }, pierna: { col: "#44403c", zapato: "#2e2420" }, pelo: ["corto", "#8a4f22"], escala: .9 });
volze(ME6, { skin: "#f4cba6", torso: { col: "#f7c20a", kind: "franjas", alt: "#4a3020", cuello: "#fff6dc" }, brazo: { col: "#f7c20a", manga: .32 }, pierna: { col: "#f7c20a", falda: .42, alt: "#4a3020", zapato: "#6a4426" }, pelo: ["rulos", "#a85e26"], escala: .7 });
{ const m = accMat("#e0402e"); for (const s of [-1, 1]) trozo(ME6.head, m, [0, .9, -.22], [s * .2, .92, -.26], .09); gema(ME6.head, m, .06, 0, .9, -.22) }   // moño
volze(QUILL, { skin: "#c9936a", torso: { col: "#544a4e", cuello: "#e6dcc6", botones: "#e6dcc6" }, brazo: { col: "#544a4e", manga: .82, puno: "#e6dcc6" }, pierna: { col: "#544a4e", falda: .8, alt: "#e6dcc6", zapato: "#2a2220" }, pelo: ["rodete", "#5e4a3e"], anteojos: 1 });
volze(PIM, { skin: "#b87a52", torso: { col: "#c2913a", kind: "rayas", alt: "#efe2c0", panuelo: "#b0452c" }, brazo: { col: "#c2913a", manga: .42 }, pierna: { col: "#82705A", zapato: "#3a2a1e" }, pelo: ["puntas", "#1c1816"], escala: .8 });
volze(GARROW, { skin: "#b07a58", torso: { col: "#c2913a", poncho: ["#b0452c", "#efe2c0"], panuelo: "#b0452c" }, brazo: { col: "#c2913a", manga: .8, puno: "#b0452c" }, pierna: { col: "#6a5c4c", zapato: "#3a2a1e" }, sombrero: { cinta: "#b0452c", pelo: "#e8e4dc" }, barba: "#eeeae2" });
volze(FOLK[0], { skin: "#a86c48", torso: { col: "#d8ccb4", chaleco: ["#4a4038", "#b88a3e"], faja: ["#a8553a"] }, brazo: { col: "#d8ccb4", manga: .82 }, pierna: { col: "#5a4e42", zapato: "#2a2220" }, sombrero: { cinta: "#efe6d0", pelo: "#1e1a17", tilt: -.22 } });
volze(FOLK[1], { skin: "#c98e64", torso: { col: "#e6dcc6", kind: "guarda", alt: "#a8553a" }, brazo: { col: "#e6dcc6", manga: .5 }, pierna: { col: "#e6dcc6", falda: .82, alt: "#a8553a", zapato: "#6a4a30" }, pelo: ["largo", "#3a2418"] });
{ const cols = ["#f4ecd8", "#d9a441", "#c2603c"]; for (let j = 0; j < 7; j++) { const a = (j / 6 - .5) * 2.4; gema(FOLK[1].head, accMat(cols[j % 3]), .07, Math.sin(a) * .4, .8, Math.cos(a) * .32 - .02) } }   // corona de flores (pocas, de pocos polígonos)
volze(FOLK[2], { skin: "#b87a52", torso: { col: "#7a8258", kind: "rombos", alt: "#e6dcc6" }, brazo: { col: "#7a8258", manga: .8 }, pierna: { col: "#7a8258", falda: .82, alt: "#e6dcc6", zapato: "#3a2a1e" }, panuelo: ["#a8553a", "#1e1a17"] });
volze(FOLK[3], { skin: "#c49a78", torso: { col: "#A2A497", kind: "zigzag", alt: "#7a4a4a" }, brazo: { col: "#A2A497", manga: .82 }, pierna: { col: "#A2A497", falda: .84, alt: "#7a4a4a", zapato: "#2a2220" }, panuelo: ["#7a4a4a", "#d8d4cc"] });
volze(FOLK[4], { skin: "#8a5a3c", torso: { col: "#a8553a", poncho: ["#e6dcc6", "#576371"] }, brazo: { col: "#a8553a", manga: .8, puno: "#e6dcc6" }, pierna: { col: "#576371", zapato: "#2a2220" }, sombrero: { cinta: "#576371", pelo: "#1d1a17" } });
volze(FOLK[5], { skin: "#c98e64", torso: { col: "#A2A497", kind: "rayas", alt: "#82705A", chaleco: ["#576371"], faja: ["#b88a3e"] }, brazo: { col: "#A2A497", manga: .42 }, pierna: { col: "#4a4038", zapato: "#2a2220" }, pelo: ["rulos", "#1d1a17"] });
volze(EXT[0], { skin: "#d9a67c", torso: { col: "#82705A", kind: "rayas", alt: "#d8ccb4" }, brazo: { col: "#82705A", manga: .8 }, pierna: { col: "#82705A", falda: .78, alt: "#d8ccb4", zapato: "#2a2220" }, panuelo: ["#b88a3e", "#5a3a22"] });
volze(EXT[1], { skin: "#b08060", torso: { col: "#A2A497", chaleco: ["#7a8258", "#e6dcc6"] }, brazo: { col: "#A2A497", manga: .82 }, pierna: { col: "#6a5a48", zapato: "#2a2220" }, sombrero: { cinta: "#7a8258", pelo: "#b8b2a8", tilt: -.14 } });
volze(EXT[2], { skin: "#c98e64", torso: { col: "#a8553a", kind: "zigzag", alt: "#e6dcc6" }, brazo: { col: "#a8553a", manga: .42 }, pierna: { col: "#82705A", falda: .6, alt: "#e6dcc6", zapato: "#3a2a1e" }, pelo: ["melena", "#5a3a22"] });
volze(EXT[3], { skin: "#8a5a3c", torso: { col: "#576371", poncho: ["#b88a3e", "#d8ccb4"] }, brazo: { col: "#576371", manga: .8, puno: "#b88a3e" }, pierna: { col: "#82705A", zapato: "#2a2220" }, pelo: ["corto", "#1d1a17"] });
volze(PESCADOR, { skin: "#a86c48", torso: { col: "#82705A", kind: "rombos", alt: "#b88a3e", panuelo: "#7a8258" }, brazo: { col: "#82705A", manga: .42 }, pierna: { col: "#4a4038", zapato: "#2a2220" }, sombrero: { cinta: "#82705A", pelo: "#3a2416", tilt: -.26 } });
GARROW.encorvado = .32;

//@@LUGAR
const LUGAR = L => "pueblo";
// dónde termina Onetusk la bajada: un poco al oeste, para que la torre le quede del lado del muñón (su izquierda)
const BFIN = { x: -8, z: -33 };
let BX = CRESTA[0], BZ = CRESTA[1];   // dónde está parada la bestia en este cuadro (para las cámaras relativas a ella)
const ponerP = (k, x, z, ry = 0) => { k.g.visible = true; k.g.position.set(x, SUELO(x, z), z); k.g.rotation.set(0, ry, 0) };
const enTorre = (k, p, ry) => { k.g.visible = true; k.g.position.set(p[0], p[1], p[2]); k.g.rotation.set(0, ry, 0) };

//@@SHOTS
const G = (x, dy, z) => () => [x, SUELO(x, z) + dy, z];
const KW = (k, o) => () => add(k.g.getWorldPosition(new THREE.Vector3()).toArray(), o);
const OW = (obj, o) => () => { obj.updateMatrixWorld(true); return obj.localToWorld(new THREE.Vector3(...o)).toArray() };
const BR = o => () => [BX + o[0], SUELO(BX, BZ) + o[1], BZ + o[2]];           // relativo a los pies de la bestia
const CB = (o = [0, 0, 0]) => () => cabezaW(o);
const OJ = (o = [0, 0, 0], lado = 1) => () => add(ojoW(lado), o);
const MU = (o = [0, 0, 0]) => () => add(munonW(), o);
const BO = (o = [0, 0, 0]) => () => add(BOCA_W(), o);
const BQ = (o = [0, 0, 0]) => () => add(BOQUILLA_W(), o);
const CBA = (o = [0, 0, 0]) => () => add(CUERNO_BASE_W(), o);
// cámara que acompaña al narrador por la escalera de la torre: afuera de la espiral, a `r` del eje
const ESC = (r, dy) => () => { const p = ME.g.getWorldPosition(new THREE.Vector3()), dx = p.x - TORRE[0], dz = p.z - TORRE[1], d = Math.hypot(dx, dz) || 1; return [p.x + dx / d * r, p.y + dy, p.z + dz / d * r] };
const ARENA = "#c9925a", MARFIL = "#e8dcc0", NOCHE = "#2a1a14", PIEL = "#8a7458";
const SHOTS = {
  [I.rule]: [sh(0, CB([9, -3, 15]), [16, 44, -92], CB([0, -3, 6]), CB([0, -8, 0]), 42), sh(3, [2.6, 2.4, 23], [1.6, 3, 17], [0, 12, -10], [0, 14, -10], 58, { lat: 1 })],
  [I.cost]: [sh(0, [10, 23, 3], [5, 20.6, -3], [0, 18, -10], null, 50), sh(3, [-17, 21, 12], [-14, 26, 0], [0, 46, -160], [0, 50, -160], 30, { lat: 2 })],
  [I.today]: [sh(0, BO([-3.4, 2.8, 5.6]), BO([-2, 2.2, 3.8]), BO([-.6, 1.5, 0]), null, 50, { tr: "tapa", col: ARENA })],
  [I.horn]: [sh(0, [-24, 27, 12], [-12, 24, 20], [0, 16, -10], null, 50, { tr: "tapa", col: ARENA, dir: -1 }), sh(6, [22, 9, 24], [10, 11, 22], [0, 14, -10], null, 55), sh(10, [-10, 20.2, -6], [3, 19.8, -6.6], [6, 18.4, -10], [12, 18, -10], 45)],
  [I.wed]: [sh(0, [-3, 4.4, 3], [-7.4, 3.4, 6.6], [-13, 1.8, 12], null, 55), sh(6, [-12.4, 3.3, 5.6], [-12.8, 3, 7.6], [-13, 1.7, 12], null, 50)],
  [I.babies]: [sh(0, [-16.6, 4.4, 36.4], [-18.6, 3.2, 33], [-20, 1.6, 28], null, 46), sh(6, [-18.2, 3, 34.2], [-19, 2.7, 32.8], [-20, 1.5, 28], null, 48)],
  [I.school]: [sh(0, [20, 5.4, -8], [25, 3.6, -12.2], [29, 2.2, -15], null, 60), sh(5, [22.6, 3, -17.4], [24.4, 2.8, -15.6], KW(QUILL, [0, 1.9, 0]), null, 52)],
  [I.roost]: [sh(0, [-20, 5, -7], [-24.6, 2.6, -11.4], [-28, .8, -14], null, 55), sh(5, [-20.6, 2.7, -11.4], [-22.2, 2.5, -12.8], KW(FOLK[3], [0, 1.8, 0]), null, 52)],
  [I.ridge]: [sh(0, [-15, 2.4, 8], [-12.6, 3, 1], [0, 40, -160], [0, 48, -160], 24, { lat: 1.2 }), sh(5, G(12, 3, -106), G(7, 3.6, -117), [0, 42, -152], [0, 48, -156], 52)],
  [I.tall]: [sh(0, [-17, 3, 34], [-14.4, 4, 26], [-4, 26, -120], [-4, 31, -120], 34, { lat: 1.5 }), sh(6, G(30, 9, -134), G(20, 7, -144), [-2, 38, -160], [-2, 44, -160], 62, { lat: 3 })],
  [I.tusk]: [sh(0, [-27, 45, -98], [-18, 43.4, -106], CB([-3, -9, 14]), null, 36), sh(4, [24, 47, -104], [16, 45, -114], MU(), null, 32)],
  [I.sixty]: [sh(0, [-62, 42, -88], [-48, 38, -102], [0, 44, -160], null, 40)],
  [I.bee]: [sh(0, [-2, 2.6, 9], [.8, 2.1, 11.4], KW(ME6, [0, 1.3, 0]), null, 52), sh(6, [-.4, 2, 15.4], [.8, 1.8, 14.4], KW(ME6, [0, 1.3, 0]), null, 50)],
  [I.listen1]: [sh(0, KW(ME6, [2.8, 1.8, 5.4]), KW(ME6, [1, 1.7, 4.8]), KW(ME6, [.6, 1.3, 0]), null, 50), sh(3, KW(ME6, [-2.4, 1, 4.2]), KW(ME6, [-1.2, .9, 3.6]), KW(ME6, [0, .9, 0]), null, 52), sh(7, KW(ME6, [1.2, .9, 4.6]), KW(ME6, [2.4, .8, 3.6]), KW(ME6, [-1, 5, -6]), null, 60)],
  [I.listen2]: [sh(0, [-7.4, 2.2, 15.4], [-7.8, 2.4, 13.4], [-7, 3.6, -30], [-7, 5, -30], 50, { lat: 1 }), sh(8, [-12, 30, -56], [-8, 36, -78], CB([0, 0, 4]), null, 30)],
  [I.nobody]: [sh(0, KW(ME, [3.4, 1.8, -6.4]), KW(ME, [1.6, 1.8, -5.6]), KW(ME, [-.6, 1.4, 0]), null, 52)],
  [I.dez]: [sh(0, [34, 28, 40], [22, 22, 28], () => FUEGO_POS, null, 50, { tr: "tapa", col: NOCHE }), sh(4, BO([-3.6, 2.8, 5.8]), BO([-2, 2.2, 3.8]), BO([-.6, 1.4, 0]), null, 50), sh(10, [-14, 25, -17], [-10, 23, -14], () => FUEGO_POS, null, 52)],
  [I.note]: [sh(0, [-22, 31, 8], [-16, 27, 0], BO([-7, 0, 0]), null, 55)],
  [I.eleven]: [sh(0, BR([26, 4, 52]), BR([20, 3.4, 44]), CB([0, -10, 0]), null, 56, { shake: .2 }), sh(5, BR([-46, 62, 60]), BR([-36, 54, 46]), BR([0, 14, 10]), null, 50)],
  [I.nine]: [sh(0, BR([40, 6, 40]), BR([29, 5, 31]), BR([6, 8, 14]), null, 60, { shake: .3 }), sh(4, BR([22, 10, 60]), BR([16, 9, 52]), CB([0, -4, 4]), null, 50)],
  [I.night]: [sh(0, [27, 4, -15], [20, 5.6, -12], [-4, 24, -24], null, 62), sh(8, [-12, 12, -24], [-11, 15.4, -32], BR([0, 20, 0]), null, 50, { tr: "tapa", col: "#d8a070", lat: 1 })],
  [I.ponds]: [sh(0, [0, 70, 40], [0, 56, 14], [0, 2, -70], [0, 2, -88], 55, { tr: "tapa", col: ARENA }), sh(6, [-1, 5.4, -11], [-3, 3.6, -16.4], [-6, .4, -24], null, 52)],
  [I.sign]: [sh(0, [0, 3, 23], [0, 3.8, 15], [0, 10, -10], null, 50), sh(7, [1.6, 6, 9], [1, 7.4, 3.6], [0, 10.6, -10], null, 40)],
  [I.storm]: [sh(0, [64, 42, 92], [46, 33, 72], [0, 10, -34], null, 50), sh(3, [0, 2.6, 41], [0, 2.7, 32], [0, 4.5, 0], null, 55)],
  [I.orange]: [sh(0, [3.4, 2, 27], [3, 2.2, 22], [0, 12, -10], [0, 15, -10], 55), sh(4, KW(ME, [-2.6, 1.8, 5.8]), KW(ME, [-1.4, 1.8, 4.6]), KW(ME, [0, 1.4, 0]), null, 50)],
  [I.goat]: [sh(0, [7, 2.4, -44], [5.6, 2.2, -50], KW(ME6, [0, 1, -3]), null, 58, { lat: 1 }), sh(3, [9, 2, -42.6], [9, 2.1, -45], [0, 1.2, -43], [0, 1.2, -45], 62, { fijo: 1 })],
  [I.scream]: [sh(0, [3.8, 2.2, -32.8], [2.6, 2.2, -31], KW(ME, [0, 1.5, 0]), null, 50), sh(4, [11, 3.2, -31], [8.4, 3, -29.6], [0, 2, -28], null, 54)],
  [I.forty]: [sh(0, [-13, 2.6, -33], [-4, 2.6, -32], [3, 2, -26], [8, 2, -26], 52), sh(3, [9, 10.5, -38], [5.4, 8, -35], [0, 1.5, -26], null, 54)],
  [I.louder]: [sh(0, [2.8, 3, -16], [2.2, 2.6, -20], KW(ME, [0, 1.5, 0]), null, 52), sh(5, [4, 3, -31], [5.4, 7, -27], [0, 17, -10], [0, 18.4, -10], 50)],
  [I.climb]: [sh(0, ESC(8, 2.6), ESC(7, 2.2), KW(ME, [0, 1.2, 0]), null, 56), sh(4, [.5, 36, -9], [0, 30, -9.6], [0, 0, -10], null, 50)],
  [I.mouth]: [sh(0, BO([-3.2, 2.5, 5]), BO([-1.8, 2.1, 3.4]), BO([-.7, 1.5, 0]), null, 46)],
  [I.blew]: [sh(0, BO([-3.6, 1.5, -4.2]), BO([-2.4, 1.5, -3.2]), BO([-.6, 1.6, 0]), null, 50), sh(3, [15, 24, -9], [20, 28, -8], [0, 18, -10], null, 55)],
  [I.rolling]: [sh(0, [15, 23, 3], [-4, 32, -104], BO([-4, 1, -8]), [0, 46, -160], 50)],
  [I.turned]: [sh(0, [-18, 51, -110], [-12, 50.5, -119], CB([0, 0, 4]), null, 30), sh(3, [15, 50.4, -122], [11.4, 50.2, -126.4], OJ(), null, 26)],
  [I.one]: [sh(0, G(22, 3, -116), G(15, 3.4, -127), [0, 36, -156], [0, 40, -152], 62, { shake: .25 }), sh(2, [-7, 5.2, 15], [-3, 3.6, 15.5], [7, 1.6, 16], null, 60)],
  [I.five]: [sh(0, BR([44, 10, 58]), BR([34, 8, 40]), BR([0, 18, 6]), null, 54, { shake: .2 }), sh(2, [-1, 5.4, -11], [-3, 3.8, -16.4], [-6, .4, -24], null, 52)],
  [I.shadow]: [sh(0, [7, 1.9, 12], [5, 2.5, 5], CB([0, -8, 0]), null, 62, { shake: .25 }), sh(3, [2, 30, 26], [0, 22, 17], [0, 6, -14], null, 56)],
  [I.stayed]: [sh(0, [0, 2.4, 33], [0, 2.4, 41], [0, 2.2, 12], null, 54), sh(2, BO([.6, 1.6, 5]), BO([-.6, 1.6, 3.8]), BO([-.4, 1.7, 0]), null, 52)],
  [I.trunk]: [sh(0, [16, 9, 8], [12, 12, 3], [0, 10, -10], null, 60, { shake: .15 }), sh(6, [11, 6.6, 3], [7.6, 8, -1.6], [2, 9, -8], null, 46)],
  [I.face]: [sh(0, BO([5.4, 2.6, 3.4]), BO([4.2, 2.3, 2.4]), OJ(), null, 52), sh(5, [6.4, 20.4, 8], [5, 19.4, 5], () => { const a = BOCA_W(), b = ojoW(1); return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + .8, (a[2] + b[2]) / 2] }, null, 54)],
  [I.stump]: [sh(0, BR([26, 31, 60]), BR([21, 29, 52]), MU(), null, 34)],
  [I.same]: [sh(0, [-4, 21.4, 8], [3, 21, 6], [2, 18.6, -10], null, 50), sh(3, [-4, 19.9, -8], [-1.2, 19.6, -8.2], [0, 18.6, -10], null, 30), sh(6, BR([15, 27, 47]), BR([13, 26, 43]), MU(), null, 30)],
  [I.built]: [sh(0, BO([-5.6, 2.2, 2.8]), BO([-4.4, 2, 2.1]), BO([0, 1.5, 0]), null, 50)],
  [I.cut]: [sh(0, BR([25, 26, 57]), BR([19, 25, 48]), MU([0, -2, 0]), null, 44)],
  [I.pins]: [sh(0, [7, 21.6, -1], [4.4, 20.2, -4.6], OW(PERNOS[0], [0, 0, 0]), null, 40), sh(4, [21, 21, 11], [16, 19.6, 6], [1, 18, -10], [0, 16.6, -11], 54)],
  [I.caught]: [sh(0, BR([27, 27, 60]), BR([20, 25.6, 50]), MU([0, -1.5, 0]), null, 42, { tr: "tapa", col: MARFIL }), sh(3, BR([30, 24, 62]), BR([23, 23, 52]), MU([0, -3, 2]), null, 46)],
  [I.eyes]: [sh(0, OJ([9, .4, 12]), OJ([6.4, .2, 9.4]), OJ(), null, 28)],
  [I.small]: [sh(0, [7, 9, -10], [3.6, 4, -17], KW(ME6, [0, 1, 0]), null, 54), sh(5, KW(ME6, [4, 1.7, 4.4]), KW(ME6, [2.6, 1.5, 3.2]), KW(ME6, [0, 1.1, 0]), null, 50)],
  [I.found]: [sh(0, KW(ME6, [-3, 1.7, 5.2]), KW(ME6, [-1.8, 1.6, 4.4]), KW(ME6, [0, 1.1, 0]), null, 50, { lat: .6 }), sh(4, KW(ME6, [-4.4, 2.4, 7.6]), KW(ME6, [-3, 2, 5.8]), KW(ME6, [1, 1.1, .4]), null, 56, { tr: "sigue", lat: .6 })],
  [I.followed]: [sh(0, KW(ME6, [-4, 1.6, 5.6]), KW(ME6, [-2.8, 1.5, 4.4]), KW(ME6, [.9, 1.2, 0]), null, 52, { tr: "sigue", lat: .6 })],
  [I.back]: [sh(0, [9, 2.4, -21], [7, 2.9, -23.4], BR([0, 22, 0]), null, 56), sh(5, BR([54, 16, 14]), BR([44, 14, 4]), CB([0, -6, 6]), null, 32)],
  [I.life]: [sh(0, [9, 23, 2], [5, 21, -3.4], [0, 18, -10], null, 50), sh(3, [-44, 42, 54], [-30, 34, 40], [0, 10, -10], null, 50)],
  [I.ours]: [sh(0, KW(ME, [2.8, 1.9, -6]), KW(ME, [1.4, 1.9, -4.8]), KW(ME, [-.7, 1.4, 0]), null, 52)],
  [I.listen3]: [sh(0, KW(ME6, [-2.6, 1.7, -5.4]), KW(ME6, [-1.2, 1.6, -4.4]), KW(ME6, [.7, 1.3, 0]), null, 50)],
  [I.heard]: [sh(0, [-9.4, 3.2, 9.4], [-9.4, 3.8, 11.6], [0, 20, -160], [0, 23, -160], 34, { lat: .4 })],
};

//@@ESCENA
// ---------- la escena en cada instante
let ENV_OK = false; const FILA = new URLSearchParams(location.search).has("fila");
function setScene(t) {
  const L = lineAt(t), lt = t - s(L), len = (S[L + 1] ?? DUR) - s(L), k = P(lt, 0, len), Wd = kk => wt(L, kk), T0 = s(L);
  POST = { flash: 0, sepia: 0 };
  if (!ENV_OK) { Object.assign(ENV, ENV_DUSTMERE); ENV_OK = true; M_ESTANQUE.bumpScale = 1.3; M_ESTANQUE.envMapIntensity = .55; ENV.desierto.agua = "#3f6f88"; ENV.despues.agua = "#4f7f98"; ENV.tormenta.agua = "#7a6a4a"; ENV.incendio.agua = "#1a2a3a" }
  mundoReset(); utileriaReset();
  ALL.forEach(c => { if (c.polvo) c.polvo.forEach(q => q.visible = false); c.g.visible = false; c.body.rotation.set(0, 0, 0); c.body.position.y = 0; c.head.rotation.set(0, 0, 0); power(c, null, 0); c.aura.visible = false; setFace(c, "neutral"); pose(c, t, {}); quieto(c, t) });
  [PALA, REGLA, TELESC, HOYO].forEach(o => o.visible = false);
  // ---- la luz según el momento: mañana clara, recuerdo de noche con incendio, tormenta naranja, y la tormenta que se abre
  const RECUERDO = L >= I.dez && L <= I.night, ALBA = L === I.night && lt >= Wd(8) - T0 - .06;
  const TORM = L === I.today || (L >= I.storm && L <= I.eyes), DESPUES = L >= I.small;
  const fuerza = L === I.today ? .8 : L === I.storm ? .15 + .85 * eIO(k) : (L > I.storm && L <= I.rolling) ? 1 : (L >= I.turned && L <= I.shadow) ? .55 : (L >= I.stayed && L <= I.cut) ? .5 : (L >= I.pins && L <= I.eyes) ? .5 - .3 * ((L - I.pins) + k) / 3 : 0;
  setEnv(RECUERDO ? (ALBA ? "despues" : "incendio") : TORM ? "tormenta" : DESPUES ? "despues" : "desierto");
  if (TORM) { const A = ENV.tormenta, B = ENV.desierto, f = cl(fuerza); scene.fog.density = lerp(B.fog * 2.5, A.fog * (L >= I.trunk ? .16 : L >= I.turned ? .26 : L === I.rolling ? .13 : (L === I.orange || L === I.storm) ? .26 : .42), f) }
  if (L >= I.life) scene.fog.density *= .45;
  SOL.z = (L === I.ridge || L === I.tall || L === I.tusk || L === I.sixty || L === I.turned || (L === I.one && lt < Wd(2) - T0) || L === I.heard || L === I.listen2) ? -150 : 0;
  ambiente(t); tormenta(t, cam.position, TORM ? fuerza : 0); tortuga(t, { paso: 0 }); LUCES.forEach(l => l.visible = false);
  estanquesVisibles(!RECUERDO || ALBA); RUINAS.forEach((r, i) => ruinaEstado(i, !RECUERDO ? 1 : L < I.nine ? 0 : L === I.nine ? eIO(P(k, i * .09, i * .09 + .22)) : 1));
  fuegoViejo(t, RECUERDO && !ALBA);
  let LL = []; if (RECUERDO && !ALBA) LL.push([FUEGO_POS, 5, "#ff8a3a", 60], [[0, 20, -6], 2.2, "#ffb070", 40]);
  TEMBLOR = 0; grietasTorre(L < I.trunk ? 0 : L === I.trunk ? eIO(P(lt, Wd(6) - T0 - .3, Wd(6) - T0 + .5)) : (L <= I.back && !RECUERDO) ? 1 : (L > I.back ? 1 : 0));
  // ---- el cuerno: en la torre hasta que el narrador saca los pernos; después lo tiene Onetusk
  const SIN_CUERNO = L > I.pins; PERNOS.forEach(q => q.visible = L <= I.pins); pernosFuera(L < I.pins ? 0 : L === I.pins ? eOut(P(k, .05, .42)) : 1); cuernoCae(L < I.pins ? 0 : L === I.pins ? eIO(P(lt, Wd(4) - T0 - .1, len)) : 1); CUERNO.visible = !SIN_CUERNO;
  // ---- Onetusk según la frase
  const SEG = BESTIA_SEG_PASO, baj = p => { const pp = Math.min(p, BAJADA.pasos); return { x: BFIN.x * eIO(P(pp, 17, BAJADA.pasos)), z: CRESTA[1] + bestiaAvance(pp, BAJADA.pasos), paso: p, pasoFin: BAJADA.pasos } };
  let B = { x: CRESTA[0], z: CRESTA[1] };   // por defecto: quieta en la cresta
  const QUIETA = { gira: Math.sin(t * .23) * .04, orejas: .05 };
  if (L === I.turned) B = { ...B, gira: -.5 * eIO(P(k, .05, .8)), orejas: .5 * eIO(P(k, .3, .9)) };
  else if (L === I.one) B = { ...baj(lt / SEG), gira: -.3, orejas: .7 };
  else if (L === I.five) B = { ...baj(9 + lt / SEG), orejas: .8 };
  else if (L === I.shadow) B = { ...baj(21.6 + lt / SEG), orejas: 1, baja: .2 };
  else if (L === I.stayed) B = { ...baj(BAJADA.pasos + 3 + lt / SEG), orejas: 1, baja: .3 * eIO(k) };
  else if (L === I.trunk) B = { ...baj(99), orejas: 1, baja: .3, trompa: "enrosca", trompaEn: [TORRE[0], 9.5, TORRE[1]], trompaR: 4.4, trompaQ: eIO(P(k, 0, .7)) };
  else if (L >= I.face && L <= I.pins) B = { ...baj(99), orejas: .7, baja: L === I.face ? .55 + .25 * eIO(k) : L === I.stump ? lerp(.8, .22, eIO(k)) : .22, gira: L === I.face ? .32 * eIO(k) : L === I.stump ? lerp(.32, .06, eIO(k)) : .06, trompa: "enrosca", trompaEn: [TORRE[0], 9.5, TORRE[1]], trompaR: 4.4, trompaQ: 1 };
  else if (L === I.caught) B = { ...baj(99), orejas: .4, baja: .5, gira: .2, trompa: "sostiene", trompaDe: "enrosca", trompaQ: eIO(P(k, 0, .5)), conColmillo: eIO(P(k, .05, .4)) };
  else if (L >= I.eyes && L <= I.followed) B = { ...baj(99), orejas: .1, baja: .45, gira: .1, trompa: "sostiene", conColmillo: 1, ojos: L === I.eyes ? eIO(P(k, .1, .45)) : L === I.small ? 1 - eIO(P(k, .3, .6)) : 0 };
  else if (L === I.back) { const p = 6 + lt / SEG; B = { x: BFIN.x * (1 - eIO(P(p, 0, 14))), z: BFIN.z - 30 - bestiaAvance(p, 99), ry: Math.PI, paso: p, trompa: "sostiene", conColmillo: 1 } }
  else if (L >= I.life) B = { ...B, trompa: "sostiene", conColmillo: 1, ...QUIETA };
  else if (L === I.eleven) B = { ...baj(7 + lt / SEG), orejas: .9 };
  else if (L === I.nine) B = { ...baj(15 + lt / SEG), orejas: 1, baja: lt >= Wd(4) - T0 ? .5 : .1, gira: Math.sin(t * 1.2) * .35 };
  else if (L === I.night) B = ALBA ? { x: 0, z: -60 - bestiaAvance(4 + (t - Wd(8)) / SEG, 99), ry: Math.PI, paso: 4 + (t - Wd(8)) / SEG } : { ...baj(99), baja: .35, gira: Math.sin(t * .5) * .2, orejas: .6 };
  else B = { ...B, ...QUIETA };
  BX = B.x; BZ = B.z; bestiaPose(t, B);
  { const g = pisadaGolpe(t); if (L === I.one && lt < Wd(2) - T0 || L === I.shadow && lt < Wd(3) - T0 || L === I.nine && lt < Wd(4) - T0) TEMBLOR = g * .22 }
  if (L === I.shadow && lt >= Wd(3) - T0) R.toneMappingExposure *= lerp(1, .55, eIO(P(t, Wd(3), Wd(3) + .5)));
  if (L === I.stayed || L === I.trunk) R.toneMappingExposure *= .7;
  tazasSaltan(L < I.one ? 0 : L === I.one ? eOut(P(lt, Wd(2) - T0 + .1, len)) : 1);
  if (L === I.five) { const q = P(lt, Wd(2) - T0 + .05, len); salpicar(10, q); salpicar(9, cl(q * 1.2 - .15)) }
  // ---- la gente: [personaje, x, z, ry, cara, modo] con modo 0 quieto, 1 camina, 2 corre (avanza al ritmo de las piernas)
  const gente = list => list.forEach(([c, x, z, ry, f = "neutral", modo = 0, ph = 0]) => { let d = 0; if (modo === 1) d = (lt - len / 2) * 2.3; if (modo === 2) d = (lt - len / 2) * 6.4; ponerP(c, x + Math.sin(ry) * d, z + Math.cos(ry) * d, ry); setFace(c, f); if (modo === 1) andar(c, t + ph); else if (modo === 2) correrV(c, t + ph); else quieto(c, t + ph) });
  const BOCA = BOCA_W(), enCuerno = (c, cara, t0g) => { enTorre(c, BOCA, -Math.PI / 2); setFace(c, cara); if (t0g != null) gesto(c, t, t0g, "sopla", { dur: .3 }) };
  const VEC = [FOLK[4], FOLK[5], EXT[0], EXT[1], EXT[2], EXT[3], PESCADOR, FOLK[0], FOLK[1], FOLK[2], FOLK[3], QUILL, GARROW];
  switch (L) {
    case I.rule: gente([[ME, 1.4, 6, 2.5, "worried"], [FOLK[4], -5, 3, 1.2, "neutral", 1], [EXT[0], 6, 1, -1.8, "neutral", 1, .2]]); break;
    case I.cost: gente([[FOLK[5], -4, 2, .6, "neutral", 1], [EXT[1], 5, 5, -2.4, "neutral", 1, .3]]); break;
    case I.today: enCuerno(ME, "sopla", T0 - .3); break;
    case I.horn: gente([[FOLK[4], -6, 4, .8, "neutral", 1], [EXT[2], 5, 8, 3, "neutral", 1, .2], [EXT[3], -2, 16, 0, "neutral", 1, .4], [GARROW, 8, -2, -2.2, "worried"]]); attach(BASTON, GARROW, "R", [0, -.2, .1]); break;
    case I.wed: { const [x, z] = PUNTOS.boda; gente([[FOLK[0], x - .9, z, Math.PI / 2 + .2, "happy"], [FOLK[1], x + .9, z, -Math.PI / 2 - .2, "warm"], [EXT[0], x - 2.6, z + 2.4, 2.6, "happy"], [EXT[1], x + 2.4, z + 2.6, -2.5, "laugh"], [FOLK[4], x + 3.4, z - 1.2, -1.4, "happy"], [PESCADOR, x - 3.6, z - .8, 1.3, "warm"]]);
      [[FOLK[0], 0], [FOLK[1], 1]].forEach(([c, i]) => { attach(TAZA_M[i], c, "L", [0, -.15, .15]); attach(CUCHARA_M[i], c, "R", [0, -.15, .15]); gesto(c, t, T0 + .15 + i * .12 + Math.floor(Math.max(0, lt - .15) / .42) * .42, "golpea", { dur: .2 }) }); break }
    case I.babies: { const [x, z] = PUNTOS.bebe; gente([[FOLK[2], x + .2, z - 1.4, .1, "warm"], [FOLK[3], x + 2, z - .8, -.5, "happy"]]); acunar(FOLK[2], BEBE); setFace(FOLK[2], lt > Wd(6) - T0 ? "susurra" : "warm"); FOLK[2].head.rotation.x = .35 * eIO(P(lt, Wd(6) - T0 - .1, Wd(6) - T0 + .25)); CUNA_BEBE.rotation.z = Math.sin(t * 2.2) * .12; break }
    case I.school: { const [x, z] = PUNTOS.escuela; gente([[QUILL, x - 1.6, z + 2.6, -2.3, "determined"], [EXT[2], x + 2.8, z + 6, -2.6, "happy", 2], [ME6, x + 4.6, z + 7.4, -2.6, "excited", 2, .2], [PIM, x + 1.4, z + 8, -2.7, "happy", 2, .35]]); attach(BANDERA_ROJA, QUILL, "R", [0, -.15, .15]); gesto(QUILL, t, T0 - 1, "agita", { dur: .3, fin: 99 }); banderaFlamea(t); break }
    case I.roost: { const [x, z] = PUNTOS.gallos; galloPose(0, t, { x: x - .8, z: z + .6, ry: 1.2 }); galloPose(1, t, { x: x + 1, z: z - .4, ry: -2 }); gente([[FOLK[3], x + 2.6, z - 1.6, .9, lt > Wd(5) - T0 ? "happy" : "neutral"]]); if (lt > Wd(5) - T0) gesto(FOLK[3], t, Wd(5), "brazos", { dur: .3 }); break }
    case I.ridge: gente([[FOLK[4], -12, -7, -2.9, "worried"], [EXT[3], -10, -9, 2.9, "scared"], [EXT[1], -14.5, -10, -2.8, "worried"]]); break;
    case I.tall: case I.tusk: case I.sixty: break;
    case I.bee: gente([[ME6, 3.6, 13.6, -1.2, "listen"], [ME, 7, 12.4, -1.9, "warm"]]); gesto(ME6, t, T0 + .2, "escucha", { dur: .3, fin: 99 }); cabraPose(t, { x: 1.4, z: 16.4, ry: 2.2 }); break;
    case I.listen1: { const piso = lt >= Wd(3) - T0 - .06 && lt < Wd(7) - T0 - .06, cielo = lt >= Wd(7) - T0 - .06; gente([[ME6, 3.6, 13.6, .4, cielo ? "excited" : "listen"], [ME, 6.4, 12.2, -1.2, "curious"]]); if (piso) ME6.body.rotation.x = .5; if (cielo) gesto(ME6, t, Wd(7) - .1, "senala", { dur: .3, fin: 99, alto: 1 }); else gesto(ME6, t, T0 - 1, "escucha", { dur: .3, fin: 99 }); cabraPose(t, { x: 9, z: 12.4, ry: -2 }); break }
    case I.listen2: gente([[ME6, -8.4, 8, Math.PI - .25, lt > Wd(8) - T0 ? "listen" : "curious"], [ME, -6.4, 8.8, Math.PI - .4, "suspicious"]]); gesto(ME6, t, Wd(3) - .15, "senala", { dur: .4, fin: 99, alto: .6 }); break;
    case I.nobody: gente([[ME6, -8.4, 8, Math.PI + .05, "listen"], [ME, -6.8, 8.6, Math.PI + .1, "worried"], [FOLK[5], -12, 3, 1.5, "neutral", 1], [EXT[0], -2, 4.4, -1.5, "neutral", 1, .25], [EXT[2], -10, -1, 1.6, "neutral", 1, .1]]); gesto(ME6, t, T0 - 1, "escucha", { dur: .3, fin: 99 }); break;
    case I.dez: enCuerno(PIM, "sopla", T0 - 1); gente([[FOLK[4], 14, 20, .6, "panic", 2], [EXT[0], 10, 24, .8, "terrified", 2, .2], [EXT[1], 18, 16, .5, "panic", 2, .4]]); break;
    case I.note: enCuerno(PIM, "sopla", T0 - 1); break;
    case I.eleven: case I.nine: enCuerno(PIM, "terrified"); gente([[FOLK[5], -4, -30, Math.PI * 0, "panic", 2], [EXT[2], 3, -36, .1, "terrified", 2, .3]]); break;
    case I.night: if (!ALBA) { enCuerno(PIM, "horrified"); gesto(PIM, t, T0 - 1, "cubre", { dur: .3, fin: 99 }) } else gente([[PIM, -2, 6, Math.PI, "shock"], [FOLK[5], 2, 7, Math.PI, "scared"], [EXT[2], -5, 8, Math.PI - .2, "worried"]]); break;
    case I.ponds: if (lt >= Wd(6) - T0 - .06) { gente([[ME, -11.8, -22.6, 1.3, "happy"], [ME6, -10.8, -27, 1.5, "laugh"]]); saltar(ME6, t, Wd(6) + .2) } break;
    case I.sign: gente([[GARROW, 3.4, 4, Math.PI, "worried"], [FOLK[2], -3, 7, Math.PI - .3, "neutral"], [EXT[3], -6, 2, 1.4, "neutral", 1]]); attach(BASTON, GARROW, "R", [0, -.2, .1]); gesto(GARROW, t, T0 + .3, "senala", { dur: .45, fin: 99, mano: "L", alto: .8 }); break;
    case I.storm: gente([[FOLK[4], -2, 20, Math.PI, "scared", 2], [EXT[1], 2.4, 14, Math.PI, "panic", 2, .3], [FOLK[1], 0, 26, Math.PI, "terrified", 2, .15], [EXT[0], -2.6, 30, 0, "scared"]]); break;
    case I.orange: gente([[ME, -1.4, 21.4, .2, "scared"]]); gesto(ME, t, Wd(4) - .2, "alza", { dur: .4, fin: 99 }); break;
    case I.goat: { const d = lt * 5.6; ponerP(ME6, 0, -34 - d, Math.PI); setFace(ME6, "determined"); correrV(ME6, t); cabraPose(t, { x: .8, z: -39 - d * 1.05, ry: Math.PI, corre: 1 }); break }
    case I.scream: gente([[ME, 1, -27, Math.PI, "grito"]]); gesto(ME, t, T0 + .1, "grita", { dur: .25, fin: Wd(4) - .1 }); break;
    case I.forty: VEC.forEach((c, i) => { ponerP(c, -10.5 + i * 1.75 + Math.sin(i * 7) * .4, -26 + Math.cos(i * 3.3) * 1.3, Math.PI + Math.sin(i * 2.1) * .2); setFace(c, "grito"); quieto(c, t + i * .13); gesto(c, t, T0 + .05 + (i % 4) * .07, "grita", { dur: .25, fin: Wd(3) - .1 }) }); gente([[ME, 1, -29.6, Math.PI, "grito"]]); break;
    case I.louder: gente([[ME, 1, -27, lerp(Math.PI, .15, eIO(P(k, 0, .35))), "determined"]]); break;
    case I.climb: { const q = lerp(8, 86, k), i0 = Math.floor(q), a = ESCALON_W(i0), b = ESCALON_W(Math.min(91, i0 + 1)), f = q - i0; enTorre(ME, [lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f)], Math.atan2(b[0] - a[0], b[2] - a[2])); setFace(ME, "determined"); correrV(ME, t); break }
    case I.mouth: enCuerno(ME, "determined", T0 + .25); break;
    case I.blew: case I.rolling: enCuerno(ME, "sopla", T0 - 1); break;
    case I.turned: break;
    case I.one: enCuerno(ME, "sopla", T0 - 1); break;
    case I.five: enCuerno(ME, "sopla", T0 - 1); break;
    case I.shadow: enCuerno(ME, "sopla", T0 - 1); gente([[FOLK[4], -3, -2, 0, "panic", 2], [EXT[1], 2.4, -4, .2, "terrified", 2, .3], [FOLK[1], -6, 0, -.2, "panic", 2, .15], [EXT[0], -8, 3, .1, "terrified", 2, .4], [QUILL, 1, 2, 0, "panic", 2, .2]]); break;
    case I.stayed: enCuerno(ME, lt > Wd(2) - T0 ? "sopla" : "terrified", Wd(4) - .1); gente([[FOLK[4], -1.6, 22, 0, "panic", 2], [EXT[1], 1.8, 18, 0, "terrified", 2, .3], [FOLK[1], .2, 27, 0, "panic", 2, .15], [EXT[0], -2.2, 30, 0, "terrified", 2, .4], [QUILL, 2.4, 25, 0, "panic", 2, .2], [GARROW, -2.6, 15, 0, "horrified", 1]]); break;
    case I.trunk: enCuerno(ME, "terrified"); gesto(ME, t, T0 + .1, "brazos", { dur: .3, fin: 99 }); break;
    case I.face: enCuerno(ME, "horrified"); ME.g.rotation.y = lerp(-Math.PI / 2, -Math.PI * .86, eIO(P(k, 0, .4))); break;
    case I.stump: case I.same: enCuerno(ME, "shock"); ME.g.rotation.y = -Math.PI * .86; break;
    case I.built: case I.cut: enCuerno(ME, L === I.cut ? "sad" : "shock"); break;
    case I.pins: enCuerno(ME, "determined"); gesto(ME, t, T0 + .05, "tira", { dur: .3, fin: Wd(4) }); break;
    case I.caught: case I.eyes: enCuerno(ME, L === I.eyes ? "relieved" : "shock"); break;
    case I.small: case I.found: case I.followed: { const p = pieW(0), bx = p[0] + 5.4, bz = p[2] + 3.4, suelta = L === I.small ? eIO(P(lt, Wd(7) - T0 - .1, len)) : 1;
      ponerP(ME6, lerp(p[0] + 4.3, bx, suelta), lerp(p[2] + 2.2, bz, suelta), lerp(Math.atan2(-1, -.5), .5, suelta)); setFace(ME6, L === I.followed ? "warm" : L === I.found ? "hopeful" : "scared"); arenaEncima(ME6, 1); arenaEncima(CABRA, 1); cabraPose(t, { x: 0, z: 0, enBrazos: ME6 }); CABRA.position.y -= .42; CABRA.position.x += .3;
      if (L !== I.small) { const q = L === I.found ? eIO(P(lt, Wd(4) - T0 - .2, len)) : 1; ponerP(ME, lerp(bx + 9, bx + 2.3, q), lerp(bz + 8, bz + .5, q), Math.atan2(-1, -.6)); setFace(ME, L === I.followed ? "relieved" : "gasp"); if (q < 1 && L === I.found) correrV(ME, t); if (L === I.followed) gesto(ME, t, T0 - 1, "abraza", { dur: .3, fin: 99 }) } break }
    case I.back: gente([[ME, 2, -25, Math.PI, "warm"], [ME6, .4, -25.6, Math.PI, "happy"]]); arenaEncima(ME6, .8); arenaEncima(CABRA, .8); cabraPose(t, { x: -1.6, z: -24.4, ry: 2.6 }); break;
    case I.life: gente([[FOLK[4], -6, 4, .4, "hopeful"], [EXT[1], 5, 6, -.5, "relieved"], [GARROW, 3, 9, Math.PI, "relieved"], [QUILL, -3, 10, Math.PI, "warm"], [FOLK[1], 7, 11, -2.8, "hopeful"]]); attach(BASTON, GARROW, "R", [0, -.2, .1]); break;
    case I.ours: case I.listen3: case I.heard: gente([[ME, -8.6, 2.6, Math.PI + .1, L === I.heard ? "listen" : "warm"], [ME6, -10.2, 2, Math.PI + .05, L === I.ours ? "happy" : "listen"]]); arenaEncima(ME6, .6); if (L !== I.ours) gesto(ME6, t, s(I.listen3) + .05, "escucha", { dur: .3, fin: 999 }); if (L === I.heard) gesto(ME, t, T0 + .4, "escucha", { dur: .4, fin: 999 }); cabraPose(t, { x: -12, z: 3.4, ry: 2.6 }); break;
  }
  // banco de pruebas de personajes (QUERY="provisoria&fila"): todos en fila en la plaza, cámara fija; t elige el encuadre y la cara
  if (FILA) { setEnv("desierto"); SOL.z = 0; ambiente(0); tormenta(0, cam.position, 0); estanquesVisibles(true); ALL.forEach(c => c.g.visible = false); sinBestia(); CABRA.visible = false;
    const L0 = [ME, ME6, QUILL, PIM, GARROW, FOLK[0], FOLK[1], FOLK[2], FOLK[3], FOLK[4], FOLK[5], EXT[0], EXT[1], EXT[2], EXT[3], PESCADOR], caras = ["neutral", "happy", "sad", "worried", "scared", "terrified", "horrified", "shock", "angry", "determined", "laugh", "listen", "sopla", "cerrados", "grito", "relieved"];
    const modo = Math.floor(t), sub = t - modo, f = caras[Math.floor(sub * 16)] || "neutral";
    L0.forEach((c, i) => { ponerP(c, -9.1 + (i % 8) * 2.6, 2 - Math.floor(i / 8) * 4, 0); setFace(c, modo >= 2 ? f : "neutral"); quieto(c, 0) });
    const foco = [null, null, ME, GARROW, FOLK[1], ME6, PIM, QUILL][Math.min(modo, 7)];
    if (!foco) { if (modo === 0) { cam.position.set(0, 2.4, 19); cam.lookAt(0, 1.6, 0) } else { cam.position.set(9, 3.2, 14); cam.lookAt(-2, 1.4, 0) } cam.fov = 46 }
    else { const p = foco.g.getWorldPosition(new THREE.Vector3()), hy = foco === ME6 ? 1.95 : foco === PIM ? 2.2 : 2.6; cam.position.set(p.x + .9, p.y + hy + .3, p.z + 4.6); cam.lookAt(p.x, p.y + hy - .25, p.z); cam.fov = 30 }
    cam.updateProjectionMatrix(); lights([]); return }
  lights(LL); camara(t);
}

//@@TEXTURAS
function gableUV(geo, Wd, rh) { const uv = geo.attributes.uv, p = geo.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (p.getX(i) + Wd / 2) / Wd, p.getY(i) / rh); return geo }
// ---------- texturas pintadas a mano (pedido del dueño: nada de patrones repetidos; cada lienzo se dibuja entero, con trazos irregulares)
const hx = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const rgbj = (h, r, j = 22, a = 1) => { const [R0, G0, B0] = hx(h), d = (r() - .5) * j, c = v => Math.max(0, Math.min(255, v + d + (r() - .5) * j * .3)) | 0; return `rgba(${c(R0)},${c(G0)},${c(B0)},${a})` };
function aMano(g, pts, r, amp) { g.beginPath(); pts.forEach(([x, y], i) => { const [x2, y2] = pts[(i + 1) % pts.length]; if (!i) g.moveTo(x, y); g.quadraticCurveTo((x + x2) / 2 + (r() - .5) * amp, (y + y2) / 2 + (r() - .5) * amp, x2, y2) }); g.closePath() }
function manchas(g, r, n, w, h, col, r0, r1, a0, a1) { const [R0, G0, B0] = hx(col); for (let k = 0; k < n; k++) { const x = r() * w, y = r() * h, rad = r0 + r() * (r1 - r0), gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, `rgba(${R0},${G0},${B0},${a0 + r() * (a1 - a0)})`); gr.addColorStop(1, `rgba(${R0},${G0},${B0},0)`); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2) } }
function grietas(g, r, n, w, h, col = "rgba(40,28,18,.55)") { g.strokeStyle = col; for (let k = 0; k < n; k++) { let x = r() * w, y = r() * h, a = r() * 6.28; g.lineWidth = 1 + r() * 2.5; g.beginPath(); g.moveTo(x, y); const L = 6 + r() * 18 | 0; for (let s = 0; s < L; s++) { a += (r() - .5) * 1.2; x += Math.cos(a) * (6 + r() * 10); y += Math.sin(a) * (6 + r() * 10); g.lineTo(x, y) } g.stroke() } }
function vetas(g, r, x0, y0, w, h, base, vertical = true) { g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip(); g.fillStyle = rgbj(base, r, 26); g.fillRect(x0, y0, w, h); const L = vertical ? h : w, A = vertical ? w : h;
  for (let k = 0; k < A / 3; k++) { const o = r() * A, amp = 1 + r() * 4, f = .005 + r() * .02, ph = r() * 6; g.strokeStyle = r() < .5 ? "rgba(30,18,10,.28)" : "rgba(255,230,190,.10)"; g.lineWidth = .8 + r() * 2; g.beginPath();
    for (let s = 0; s <= L; s += 12) { const d = o + Math.sin(s * f + ph) * amp; if (vertical) { s ? g.lineTo(x0 + d, y0 + s) : g.moveTo(x0 + d, y0 + s) } else { s ? g.lineTo(x0 + s, y0 + d) : g.moveTo(x0 + s, y0 + d) } } g.stroke() }
  const nn = r() * 2 | 0; for (let k = 0; k < nn; k++) { const cx = x0 + r() * w, cy = y0 + r() * h; for (let q = 4; q > 0; q--) { g.strokeStyle = `rgba(40,22,10,${.15 + q * .08})`; g.lineWidth = 1.5; g.beginPath(); g.ellipse(cx, cy, q * (vertical ? 3 : 7), q * (vertical ? 7 : 3), 0, 0, 7); g.stroke() } }
  g.restore() }
// paredes: revoque con humedad, barro, revoque caído, grietas y un entramado de vigas distinto en cada casa
const T_PARED = (seed, base) => tex(1024, 1024, (g, w, h) => { const r = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, w, h); manchas(g, r, 40, w, h, "#ffffff", 60, 220, .03, .09); manchas(g, r, 50, w, h, "#3a2a1a", 40, 200, .04, .12);
  const gb = g.createLinearGradient(0, h * .7, 0, h); gb.addColorStop(0, "rgba(50,40,25,0)"); gb.addColorStop(1, "rgba(50,40,25,.45)"); g.fillStyle = gb; g.fillRect(0, h * .7, w, h * .3);
  for (let k = 0; k < 500; k++) { g.fillStyle = `rgba(70,52,32,${.1 + r() * .3})`; g.beginPath(); g.arc(r() * w, h - Math.pow(r(), 2) * h * .18, .8 + r() * 3, 0, 7); g.fill() }
  const np = 2 + (r() * 3 | 0); for (let k = 0; k < np; k++) { const cx = r() * w, cy = h * (.15 + r() * .8), rw = 30 + r() * 70, rh = 20 + r() * 50, pts = Array.from({ length: 9 }, (_, i) => { const a = i / 9 * 6.28; return [cx + Math.cos(a) * rw * (.6 + r() * .5), cy + Math.sin(a) * rh * (.6 + r() * .5)] });
    g.save(); aMano(g, pts, r, 18); g.clip(); g.fillStyle = "#5a4c3e"; g.fillRect(cx - rw * 2, cy - rh * 2, rw * 4, rh * 4); for (let s = 0; s < 14; s++) { g.fillStyle = rgbj("#8a7e70", r, 40); g.beginPath(); g.ellipse(cx + (r() - .5) * rw * 2, cy + (r() - .5) * rh * 2, 10 + r() * 14, 6 + r() * 8, r() * 3, 0, 7); g.fill() } g.restore();
    g.strokeStyle = "rgba(40,30,20,.5)"; g.lineWidth = 2; aMano(g, pts, r, 18); g.stroke() }
  grietas(g, r, 10 + (r() * 10 | 0), w, h);
  const beam = (x0, y0, x1, y1, wd) => { const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L * wd / 2, ny = dx / L * wd / 2, j = () => (r() - .5) * wd * .25;
    const pts = [[x0 + nx + j(), y0 + ny + j()], [x1 + nx + j(), y1 + ny + j()], [x1 - nx + j(), y1 - ny + j()], [x0 - nx + j(), y0 - ny + j()]];
    g.save(); aMano(g, pts, r, wd * .2); g.clip(); vetas(g, r, Math.min(x0, x1) - wd, Math.min(y0, y1) - wd, Math.abs(dx) + wd * 2, Math.abs(dy) + wd * 2, "#3a2618", Math.abs(dy) > Math.abs(dx)); g.restore();
    g.strokeStyle = "rgba(15,8,4,.55)"; g.lineWidth = 2.5; aMano(g, pts, r, wd * .2); g.stroke();
    for (let k = 0; k < L / 120; k++) { const q = r(); g.fillStyle = "rgba(20,14,10,.8)"; g.beginPath(); g.arc(x0 + dx * q, y0 + dy * q, 2.5, 0, 7); g.fill() } };
  const W1 = 34 + r() * 10, mid = h * (.42 + r() * .16);
  beam(W1 / 2, 0, W1 / 2 + (r() - .5) * 6, h, W1); beam(w - W1 / 2, 0, w - W1 / 2 + (r() - .5) * 6, h, W1);
  const nPost = 1 + (r() * 2 | 0), xs = [W1 / 2]; for (let k = 1; k <= nPost; k++) xs.push(w * k / (nPost + 1) + (r() - .5) * 60); xs.push(w - W1 / 2);
  xs.slice(1, -1).forEach(x => beam(x, 0, x + (r() - .5) * 10, h, 26 + r() * 10));
  beam(0, W1 / 2, w, W1 / 2 + (r() - .5) * 8, W1); beam(0, mid, w, mid + (r() - .5) * 14, 26 + r() * 8); beam(0, h - W1 / 2, w, h - W1 / 2 + (r() - .5) * 6, W1 + 6);
  for (let i = 0; i < xs.length - 1; i++) for (const [ya, yb] of [[W1, mid], [mid, h - W1]]) { const t = r(); if (t < .35) continue; const xa = xs[i] + 14, xb = xs[i + 1] - 14;
    if (t < .6) beam(xa, yb, xb, ya, 18); else if (t < .85) beam(xa, ya, xb, yb, 18); else { beam(xa, ya, xb, yb, 16); beam(xa, yb, xb, ya, 16) } }
  for (let k = 0; k < 90; k++) { g.fillStyle = `rgba(${70 + r() * 30 | 0},${95 + r() * 30 | 0},${40 + r() * 20 | 0},${.15 + r() * .3})`; g.beginPath(); g.ellipse(r() * w, h - r() * r() * h * .25, 4 + r() * 16, 2 + r() * 8, r() * 3, 0, 7); g.fill() } });
// tejas: filas de alto distinto, cada teja con su forma, rajaduras, musgo y faltantes (se dibujan de abajo hacia arriba para que se encimen bien)
const T_TEJAS = tex(2048, 2048, (g, w, h) => { const r = rng(9); g.fillStyle = "#1c1814"; g.fillRect(0, 0, w, h); const filas = []; let y = -10; while (y < h) { const rh = 44 + r() * 26; filas.push([y, rh]); y += rh }
  filas.reverse().forEach(([y, rh]) => { let x = -r() * 60; const tono = r();
    while (x < w) { const sw = 46 + r() * 50; if (r() > .03) { const v = 58 + r() * 40 + tono * 14 | 0, wa = (r() - .5) * 6, pts = [[x + 2, y], [x + sw - 2, y + (r() - .5) * 4], [x + sw - 3 + wa, y + rh + 6 + r() * 6], [x + 3 + wa, y + rh + 6 + r() * 6]];
        aMano(g, pts, r, 5); const gr = g.createLinearGradient(0, y, 0, y + rh + 10); gr.addColorStop(0, `rgb(${v - 18},${v - 22},${v - 24})`); gr.addColorStop(1, `rgb(${v + 10},${v + 4},${v - 2})`); g.fillStyle = gr; g.fill(); g.strokeStyle = "rgba(0,0,0,.45)"; g.lineWidth = 2; g.stroke();
        g.fillStyle = "rgba(0,0,0,.3)"; g.fillRect(x + 3, y + rh + 2, sw - 6, 5);
        if (r() < .25) { g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x + sw * r(), y + rh * .3); g.lineTo(x + sw * r(), y + rh); g.stroke() }
        if (r() < .18) { g.fillStyle = `rgba(${80 + r() * 40 | 0},${110 + r() * 30 | 0},${50 + r() * 20 | 0},${.3 + r() * .4})`; g.beginPath(); g.ellipse(x + sw * r(), y + rh * (.5 + r() * .5), 6 + r() * 20, 4 + r() * 10, r() * 3, 0, 7); g.fill() } }
      x += sw + (r() - .3) * 4 } });
  manchas(g, r, 30, w, h, "#d8d0c0", 60, 260, .04, .1); manchas(g, r, 25, w, h, "#203018", 50, 200, .05, .15) });
// piedra: hiladas de alto distinto con piedras irregulares, verdín y grietas
const T_PIEDRA = tex(2048, 2048, (g, w, h) => { const r = rng(13); g.fillStyle = "#3a342c"; g.fillRect(0, 0, w, h);
  let y = 0; while (y < h) { const rh = 50 + r() * 60; let x = -r() * 80; while (x < w) { const sw = 60 + r() * 130, cx = x + sw / 2, cy = y + rh / 2, pts = Array.from({ length: 8 }, (_, i) => { const a = i / 8 * 6.28 + r() * .3; return [cx + Math.cos(a) * (sw / 2 - 4) * (.8 + r() * .22), cy + Math.sin(a) * (rh / 2 - 4) * (.8 + r() * .22)] });
      aMano(g, pts, r, 10); const v = r(), base = v < .3 ? "#8a8478" : v < .6 ? "#9a8e7a" : v < .85 ? "#7a7468" : "#a89a82", gr = g.createLinearGradient(cx - sw / 2, cy - rh / 2, cx + sw / 2, cy + rh / 2); gr.addColorStop(0, rgbj(base, r, 30)); gr.addColorStop(1, rgbj("#4a443c", r, 20)); g.fillStyle = gr; g.fill();
      g.strokeStyle = "rgba(255,250,235,.12)"; g.lineWidth = 3; g.stroke();
      g.save(); g.clip(); for (let k = 0; k < 10; k++) { g.fillStyle = r() < .5 ? "rgba(0,0,0,.12)" : "rgba(255,255,255,.08)"; g.beginPath(); g.arc(cx + (r() - .5) * sw, cy + (r() - .5) * rh, 2 + r() * 8, 0, 7); g.fill() } g.restore();
      x += sw + 3 + r() * 6 } y += rh + 3 + r() * 5 }
  manchas(g, r, 40, w, h, "#20301a", 40, 220, .05, .18); manchas(g, r, 30, w, h, "#ffffff", 60, 240, .03, .08); grietas(g, r, 30, w, h, "rgba(20,16,12,.5)") });
// madera: tablas de ancho distinto con veta, nudos, uniones y clavos
const T_TABLAS = tex(1024, 1024, (g, w, h) => { const r = rng(7); let x = 0; while (x < w) { const pw = 50 + r() * 70; vetas(g, r, x, 0, pw, h, r() < .5 ? "#6a4a30" : "#5a3e28", true); g.fillStyle = "rgba(0,0,0,.5)"; g.fillRect(x + pw - 3, 0, 3, h);
    if (r() < .4) { g.fillStyle = "rgba(0,0,0,.45)"; g.fillRect(x, r() * h, pw, 3) } for (const yy of [h * .08 + r() * 20, h * .92 - r() * 20]) for (const dx of [.25, .75]) { g.fillStyle = "#2a2420"; g.beginPath(); g.arc(x + pw * dx, yy, 3.5, 0, 7); g.fill() } x += pw }
  manchas(g, r, 25, w, h, "#d8c8a8", 40, 200, .04, .12); manchas(g, r, 25, w, h, "#1a120a", 40, 200, .05, .15) });
// tierra: manchas, piedritas y pasto, sin grilla
const T_TIERRA = tex(1024, 1024, (g, w, h) => { const r = rng(17); g.fillStyle = "#7d684e"; g.fillRect(0, 0, w, h); manchas(g, r, 60, w, h, "#4a3a28", 30, 160, .1, .3); manchas(g, r, 40, w, h, "#b8a080", 30, 140, .08, .2);
  for (let k = 0; k < 900; k++) { g.fillStyle = rgbj(r() < .5 ? "#9a8a72" : "#5a4a38", r, 40, .8); g.beginPath(); g.ellipse(r() * w, r() * h, 1.5 + r() * 5, 1 + r() * 4, r() * 3, 0, 7); g.fill() }
  for (let k = 0; k < 300; k++) { const x = r() * w, y = r() * h; g.strokeStyle = `rgba(${70 + r() * 40 | 0},${100 + r() * 40 | 0},40,.6)`; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 8, y - 6 - r() * 10); g.stroke() } });
const T_SHINGLE = T_TEJAS, T_STONE = T_PIEDRA, T_PLANK = T_TABLAS, T_DIRT = T_TIERRA;

