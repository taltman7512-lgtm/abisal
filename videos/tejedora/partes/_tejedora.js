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

// ================= «NOBODY ANSWERS THE KNOCK»: lo común (el MAPA de Hollowmere) — lo usan el pueblo, la Tejedora, el elenco y las escenas =================
// Norte = −z, este = +x. Unidades: metros (los personajes de bloques miden ≈ 2; la Tejedora ≈ 22).
// Hollowmere: pueblo de madera y piedra en un valle con bosque de pinos y montes alrededor, de noche, con niebla baja.
// La CALLE PRINCIPAL («Hollow Lane») corre de sur a norte por x = 0 (empedrada, 10 m de ancho; las fachadas en x = ±6,5) y desemboca
// en la PLAZA de la iglesia (al norte). Una calle transversal (z = −20) va al este, hacia el sendero de LA COLINA (el poste de los abrigos).
// Ningún cable ni soga cruza la calle principal ni la plaza (la Tejedora camina por ahí).
const sstH = (a, b, v) => { const q = Math.max(0, Math.min(1, (v - a) / (b - a))); return q * q * (3 - 2 * q) };
const CALLE_T = { x: 0, an: 10, fachada: 6.5, z0: -41, z1: 80 };        // calle principal: empedrado |x| < 5; veredas hasta las fachadas |x| = 6,5
const CRUCE_T = { z: -20, an: 6, x0: -46, x1: 66 };                      // calle transversal (z −23 … −17); al este sigue el sendero a la colina
const PLAZA_T = { x: 0, z: -56, w: 40, d: 30 };                          // plaza de la iglesia: x −20 … 20, z −41 … −71 (la boda va acá)
const IGLESIA_T = { x: 0, z: -88, w: 11, d: 26, frente: -75, alto: 5.6 }; // nave de piedra (x −5,5 … 5,5; z −75 … −101); se entra por la torre, desde la plaza
const TORRE_T = { x: 0, z: -73.6, lado: 5.4, alto: 14.0, punta: 21.0 }; // campanario (al frente de la nave, puerta al sur); la aguja llega a 21 m (< Tejedora)
const CAMPANA_T = [0, 12.7, -73.6];                                      // la campana de la iglesia (centro de giro: el yugo); la cuerda baja al piso de la torre
const ARCO_BODA = [0, -59];                                              // el arco de flores de la boda (en la plaza, frente a la iglesia; la pareja mira al norte)
const CASA_CRANE = { x: 16.8, z: -80, w: 9, d: 10, ry: 0 };             // la casa de Father Crane: junto a la iglesia (al este), su puerta mira al sur (z = −75)
const CASA_FAM = { x: -10.5, z: 14, w: 7, d: 8, ry: Math.PI / 2 };       // la casa del narrador y Tib: lado oeste de la calle, la puerta mira al este (x = −6,5)
const TALLER_T = { x: 11, z: 1, w: 9, d: 9, ry: -Math.PI / 2 };          // el taller del sastre: lado este, la vidriera y la puerta miran al oeste (x = 6,5)
const CASA_MARGA = { x: -10, z: -31, w: 6.2, d: 7, ry: Math.PI / 2 };    // la casa de Marga (vieja, torcida): lado oeste, cerca de la plaza
const COLINA_T = [86, -30], COLINA_H = 20;                               // la colina al este del pueblo; cima redonda a 20 m; el poste-percha en la cima
const CAIDA_ROJO = [-2.2, 15.5];                                         // donde cae el abrigo rojo: en la calle, frente a la casa de la familia
// altura del piso: el pueblo plano (≈ 0), afuera sube de a poco al bosque, la colina al este y los montes lejos (r > 260)
const ALT_T = (x, z) => {
  const dc = Math.hypot((x - COLINA_T[0]) / 36, (z - COLINA_T[1]) / 31), colina = (COLINA_H - 3.5) * (1 - sstH(0, 1, dc)) + 3.5 * (1 - sstH(.6, 1.7, dc));
  const r = Math.hypot(x * .92, (z + 12) * 1.05), a = Math.atan2(z + 12, x);
  const afuera = sstH(62, 170, r) * (7 + 3 * Math.sin(a * 3 + 1.2) + 2 * Math.sin(a * 7 + .4));
  const montes = sstH(240, 620, r) * (150 + 70 * Math.sin(a * 3 + .6) + 35 * Math.sin(a * 8 + 2.1) + 18 * Math.sin(a * 17 + r * .01));
  const ond = (.35 * Math.sin(x * .07 + 1) * Math.sin(z * .055) + .2 * Math.sin(x * .19 - z * .13)) * sstH(48, 80, r);
  return Math.max(colina, afuera) + montes + ond };
// los climas de luz (los define _detalle_tej.js en ENV_HOLLOW y ya están cargados en ENV): "noche" (la principal), "nocheNiebla",
// "interior" (velas), "amanecer" (la mañana final), "tejedora" (sombrío, frío, niebla espesa cerca de la criatura)

// ---------- ayudantes generales (los usa también el elenco)
const ALT = (x, z) => ALT_T(x, z);
const placeW = (k, x, z, ry = 0) => { k.g.visible = true; k.g.position.set(x, ALT_T(x, z), z); k.g.rotation.set(0, ry, 0) };
const mergeG = list => { const gs = list.map(([g, m]) => { const q = g.index ? g.toNonIndexed() : g.clone(); q.applyMatrix4(m); return q }); const n = gs.reduce((a, q) => a + q.attributes.position.count, 0);
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2); let o = 0; gs.forEach(q => { if (!q.attributes.normal) q.computeVertexNormals(); pos.set(q.attributes.position.array, o * 3); nor.set(q.attributes.normal.array, o * 3); if (q.attributes.uv) uv.set(q.attributes.uv.array, o * 2); o += q.attributes.position.count });
  const G = new THREE.BufferGeometry(); G.setAttribute("position", new THREE.BufferAttribute(pos, 3)); G.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); G.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); return G };
const MZ = (p, dir, s) => new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize()), s);

// ================= «NOBODY ANSWERS THE KNOCK»: HOLLOWMERE, el pueblo de madera y piedra (piso, empedrado, veredas, casas apretadas de
// 2–3 pisos con puertas SIN picaporte, la casa de la familia y el taller del sastre por dentro, la casa de Marga, la de Father Crane con
// el único picaporte, la iglesia con su campanario) =================
// Medidas de _comun_tej.js (CALLE_T, PLAZA_T, IGLESIA_T, TORRE_T, CASA_FAM, TALLER_T, CASA_MARGA, CASA_CRANE, ALT_T). Norte = −z.
// La utilería, los muebles, las puertas que se abren, los abrigos, el poste de la colina, las velas y los climas van en _detalle_tej.js;
// el fondo lejano (bosque, montes, cielo, luna, nubes) en _lejos_tej.js. Técnica del video anterior: texturas pintadas en canvas con relieve,
// lotes (merge por material), instancing, rectAdd para el mapa de ocupación.
TURT.children.forEach(o => o.visible = false);
CABEZA.visible = false; ALETAS.forEach(a => a.piv.visible = false); COLA.visible = false; COSTA.visible = false; FOAM.visible = false; FONDO.visible = false; HONDA.visible = false;
BOTES.forEach(b => b.visible = false); GAVIOTAS.forEach(g => g.visible = false); LUCES.forEach(l => l.visible = false); ESPUMA.forEach(s => s.visible = false); SALPI.forEach(s => s.visible = false);
NUBE.forEach(s => s.visible = false); ROPA3.forEach(m => m.visible = false); GALLINAS.forEach(g => g.visible = false); NUBES.forEach(g => g.visible = false);
HOUSES.forEach(H => H.g.visible = false);
// ---------- ayudantes (mismas firmas que en el video del viento)
const sst = (a, b, x) => { const q = cl((x - a) / (b - a)); return q * q * (3 - 2 * q) };
const hash2 = (i, j) => { let n = (Math.imul(i | 0, 374761393) + Math.imul(j | 0, 668265263)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296 };
const ruido2 = (x, z) => { const i = Math.floor(x), j = Math.floor(z), u = x - i, v = z - j, a = u * u * (3 - 2 * u), b = v * v * (3 - 2 * v); return lerp(lerp(hash2(i, j), hash2(i + 1, j), a), lerp(hash2(i, j + 1), hash2(i + 1, j + 1), a), b) };
const fbm2 = (x, z, o = 4) => { let s = 0, a = .5, f = 1, n = 0; for (let k = 0; k < o; k++) { s += a * ruido2(x * f + k * 17.3, z * f - k * 9.1); n += a; a *= .5; f *= 2.03 } return s / n };
const TM = (x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, "YXZ")), new THREE.Vector3(sx, sy, sz));
const lote = () => { const L = {}; return { L, add(k, geo, m) { (L[k] ||= []).push([geo, m || new THREE.Matrix4()]); return this },
  fin(par, mats, o = {}) { const out = {}; for (const k in L) { if (!mats[k]) throw new Error("lote sin material: " + k); const me = new THREE.Mesh(mergeG(L[k]), mats[k]); me.castShadow = o.sombra !== false; me.receiveShadow = true; par.add(me); out[k] = me } return out } } };
const linC = h => { const c = new THREE.Color(h); return [c.r, c.g, c.b] };
const mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const envuelto = (g, w, h, fn) => { for (const dx of [-w, 0, w]) for (const dy of [-h, 0, h]) { g.save(); g.translate(dx, dy); fn(); g.restore() } };
const geoPiedra = (seed, det = 1, ach = .7) => { const g = new THREE.IcosahedronGeometry(1, det), p = g.attributes.position, r = rng(seed), fx = r() * 9, fy = r() * 9; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = .72 + .5 * ruido2(x * 1.7 + fx + y, z * 1.7 + fy - y); p.setXYZ(i, x * k, y * k * ach, z * k) } g.computeVertexNormals(); return g };
const geoUV = (g, fu, fv) => { const p = g.attributes.position, u = g.attributes.uv; for (let i = 0; i < p.count; i++) u.setXY(i, fu(p.getX(i), p.getY(i), p.getZ(i)), fv(p.getX(i), p.getY(i), p.getZ(i))); return g };
const uvMuro = (g, s = 3.2, ox = 0, oy = 0) => { const p = g.attributes.position, n = g.attributes.normal, u = g.attributes.uv; for (let i = 0; i < p.count; i++) { const nx = n.getX(i), ny = n.getY(i), nz = n.getZ(i); let U, V;
    if (Math.abs(ny) > .75) { U = p.getX(i) / s; V = p.getZ(i) / s } else if (Math.abs(nx) > Math.abs(nz)) { U = -p.getZ(i) / s * Math.sign(nx); V = p.getY(i) / s } else { U = p.getX(i) / s * Math.sign(nz); V = p.getY(i) / s } u.setXY(i, U + ox, V + oy) } return g };
const cilEntre = (a, b, r, seg = 7, r2 = r) => { const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b), d = Bv.clone().sub(A); return [new THREE.CylinderGeometry(r2, r, 1, seg), MZ(A.clone().add(Bv).multiplyScalar(.5), d, new THREE.Vector3(1, d.length(), 1))] };
const redondo = (g, P, rad) => { const n = P.length; g.beginPath(); for (let i = 0; i <= n; i++) { const a = P[i % n], pv = P[(i + n - 1) % n], nx = P[(i + 1) % n], d1 = Math.hypot(pv[0] - a[0], pv[1] - a[1]) || 1, d2 = Math.hypot(nx[0] - a[0], nx[1] - a[1]) || 1, r1 = Math.min(rad, d1 / 2) / d1, r2 = Math.min(rad, d2 / 2) / d2;
    const p1 = [a[0] + (pv[0] - a[0]) * r1, a[1] + (pv[1] - a[1]) * r1], p2 = [a[0] + (nx[0] - a[0]) * r2, a[1] + (nx[1] - a[1]) * r2]; if (i === 0) g.moveTo(p2[0], p2[1]); else { g.lineTo(p1[0], p1[1]); g.quadraticCurveTo(a[0], a[1], p2[0], p2[1]) } } g.closePath() };
const repT = q => { for (const t of (Array.isArray(q) ? q : [q.c, q.z])) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.needsUpdate = true } return q };
const RB1 = (w, h, d, r = .04) => RB(w, h, d, r, 1);
const tubo = (pts, r0, r1, seg = 7, ts = 10) => { const cu = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), g = new THREE.TubeGeometry(cu, ts, 1, seg, false), p = g.attributes.position, uv = g.attributes.uv, P = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { const u = uv.getX(i), c2 = cu.getPointAt(u); P.set(p.getX(i), p.getY(i), p.getZ(i)).sub(c2).multiplyScalar(lerp(r0, r1, u)).add(c2); p.setXYZ(i, P.x, P.y, P.z); uv.setXY(i, uv.getY(i) * 2, u * cu.getLength() / 2) } g.computeVertexNormals(); return g };
// compatibilidad: uniformes de «viento» (acá solo una brisa leve: ropa tendida y barriletes)
const VIENTO = { value: 0 }, RAFAGA = { value: .35 };
const conViento = (m, modo = "tela", amp = .12) => { if (modo === "tela" || modo === "toldo") m.side = THREE.DoubleSide; m.onBeforeCompile = sh => { sh.uniforms.uVt = VIENTO; sh.uniforms.uVa = RAFAGA;
  const cuerpo = modo === "tela" || modo === "toldo" ? `float w = ${modo === "toldo" ? "sin(uv.x * 3.1416) * sin(uv.y * 3.1416) * .7" : "uv.x"}; float f = sin(uVt * 3.1 - uv.x * 2.2 + wp.z * 1.3 + wp.x * .7) + .4 * sin(uVt * 5.3 - uv.x * 4.5 + wp.z * 2.3) + .18 * sin(uVt * 9. + uv.y * 5.);
      transformed += normal * f * w * ${amp.toFixed(3)} * (.25 + .75 * uVa);`
    : `float hh = clamp(position.y * .22, 0., 1.); float f = sin(uVt * 1.7 - wp.x * .28 + wp.z * .1) + .45 * sin(uVt * 3.3 + wp.z * .8 - wp.x * .5);
      transformed += vec3(1., .25, .35) * f * hh * ${amp.toFixed(3)} * uVa;`;
  sh.vertexShader = "uniform float uVt; uniform float uVa;\n" + sh.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>
  { vec4 wp = vec4(position, 1.);
  #ifdef USE_INSTANCING
    wp = instanceMatrix * wp;
  #endif
    wp = modelMatrix * wp; ${cuerpo} }`) }; m.customProgramCacheKey = () => "brisaP" + modo + amp; return m };

// ---------- el piso de Hollowmere: ALT_T exacto (los personajes y la Tejedora usan la misma altura)
const SUELO = (x, z) => ALT_T(x, z);
const sueloT = (x, z) => ALT_T(x, z), sueloB = sueloT;   // sueloB: nombre viejo (lo usan escenas y elenco viejos)
const sueloN = (x, z, e = .6) => { const nx = SUELO(x - e, z) - SUELO(x + e, z), nz = SUELO(x, z - e) - SUELO(x, z + e), l = Math.hypot(nx, 2 * e, nz); return [nx / l, 2 * e / l, nz / l] };
// callejones de atrás (detrás de las filas de la calle principal: ahí da la ventana de atrás de la familia)
const CALLEJONES_T = [{ x0: -18.6, x1: -15.2, z0: -40, z1: 79 }, { x0: 15.8, x1: 19.2, z0: -37, z1: 79 }];
// sendero de tierra de la calle transversal a la cima de la colina (polilínea en planta)
const SENDERO_T = [[64, -20], [70, -19], [75, -22.5], [79, -27], [82.5, -29.2], [86, -30]];
const distSeg = (x, z, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz, u = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / L2)); return Math.hypot(x - a[0] - u * dx, z - a[1] - u * dz) };
const distSendero = (x, z) => { let d = 1e9; for (let i = 0; i < SENDERO_T.length - 1; i++) d = Math.min(d, distSeg(x, z, SENDERO_T[i], SENDERO_T[i + 1])); return d };
const enCalleP = (x, z, m = 0) => Math.abs(x - CALLE_T.x) < CALLE_T.fachada + m && z > CALLE_T.z0 - m && z < CALLE_T.z1 + m;
const enEmpedrado = (x, z, m = 0) => Math.abs(x - CALLE_T.x) < CALLE_T.an / 2 + m && z > CALLE_T.z0 - m && z < CALLE_T.z1 + m;
const enCruce = (x, z, m = 0) => Math.abs(z - CRUCE_T.z) < CRUCE_T.an / 2 + m && x > CRUCE_T.x0 - m && x < CRUCE_T.x1 + m;
const enPlaza = (x, z, m = 0) => Math.abs(x - PLAZA_T.x) < PLAZA_T.w / 2 + m && Math.abs(z - PLAZA_T.z) < PLAZA_T.d / 2 + m;
const enCallejon = (x, z, m = 0) => CALLEJONES_T.some(C => x > C.x0 - m && x < C.x1 + m && z > C.z0 - m && z < C.z1 + m);
const enCalle = (x, z, m = 0) => enCalleP(x, z, m) || enCruce(x, z, m) || enPlaza(x, z, m) || enCallejon(x, z, m);
// cuánto «empedrado» es el punto (0–1, borde suave con ruido): para el color del piso
const calleKT = (x, z) => { const n = (fbm2(x * .7, z * .7, 2) - .5) * .5, ax = Math.abs(x);
  let k = (1 - sst(CALLE_T.fachada - .2, CALLE_T.fachada + .3, ax + n)) * sst(CALLE_T.z0 - 1, CALLE_T.z0 + .2, z + n) * (1 - sst(CALLE_T.z1 - 1, CALLE_T.z1 + 2, z + n));
  k = Math.max(k, (1 - sst(CRUCE_T.an / 2 - .2, CRUCE_T.an / 2 + .3, Math.abs(z - CRUCE_T.z) + n)) * sst(CRUCE_T.x0 - 1, CRUCE_T.x0 + .5, x) * (1 - sst(CRUCE_T.x1 - 2, CRUCE_T.x1 + 1, x)));
  k = Math.max(k, (1 - sst(PLAZA_T.w / 2 - .2, PLAZA_T.w / 2 + .4, Math.abs(x - PLAZA_T.x) + n)) * (1 - sst(PLAZA_T.d / 2 - .2, PLAZA_T.d / 2 + .4, Math.abs(z - PLAZA_T.z) + n)));
  CALLEJONES_T.forEach(C => { k = Math.max(k, .7 * sst(C.x0 - .3, C.x0 + .3, x + n) * (1 - sst(C.x1 - .3, C.x1 + .3, x + n)) * sst(C.z0, C.z0 + 1, z) * (1 - sst(C.z1 - 1, C.z1, z))) }); return k };

// ---------- texturas pintadas: piedra de muro, ladrillo, pizarra, tejas, revoque, madera, roca (las de piedra y techo, como en el video del viento)
const T_MURO = (seed, pal, o = {}) => repT(pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(seed), S = o.escala || 1;
  c.fillStyle = o.mortero || "#5c564c"; c.fillRect(0, 0, w, h); z.fillStyle = "#2c2c2c"; z.fillRect(0, 0, w, h);
  for (let k = 0; k < 6000; k++) { c.fillStyle = r() < .5 ? "rgba(40,34,28,.3)" : "rgba(220,210,190,.2)"; c.fillRect(r() * w, r() * h, 2, 2) }
  const fil = []; let sum = 0; while (sum < h) { const fh = (o.sillar ? 110 + r() * 30 : 62 + r() * 40) * S; fil.push(fh); sum += fh } const k0 = h / sum; let y = 0;
  const piedra = (x0, y0, sw, fh) => { const m = o.sillar ? 3.5 : 5 + r() * 4, j = () => (r() - .5) * (o.sillar ? 3 : 10), rad = o.sillar ? 5 : 9 + r() * 16;
    const P = [[x0 + m + j(), y0 + m + j()], [x0 + sw * (.3 + r() * .4), y0 + m * .6 + j()], [x0 + sw - m + j(), y0 + m + j()], [x0 + sw - m * .6 + j(), y0 + fh * .5 + j()], [x0 + sw - m + j(), y0 + fh - m + j()], [x0 + sw * (.3 + r() * .4), y0 + fh - m * .5 + j()], [x0 + m + j(), y0 + fh - m + j()], [x0 + m * .6 + j(), y0 + fh * .5 + j()]];
    const col = rgbj(pal[r() * pal.length | 0], r, 26), v = 150 + r() * 90 | 0, dk = .18 + r() * .2;
    for (const dx of [-w, 0, w]) { const Q = P.map(([a, b]) => [a + dx, b]);
      redondo(c, Q, rad); c.fillStyle = col; c.fill(); const gr = c.createLinearGradient(x0 + dx, y0, x0 + dx + sw * .6, y0 + fh); gr.addColorStop(0, "rgba(255,250,235,.22)"); gr.addColorStop(.55, "rgba(255,250,235,0)"); gr.addColorStop(1, `rgba(30,24,18,${dk})`); c.fillStyle = gr; c.fill();
      c.strokeStyle = "rgba(30,26,22,.4)"; c.lineWidth = 2.5; c.stroke();
      redondo(z, Q, rad); z.fillStyle = `rgb(${v},${v},${v})`; z.fill(); z.strokeStyle = `rgba(40,40,40,.7)`; z.lineWidth = 7; z.stroke(); z.strokeStyle = `rgba(${v - 30},${v - 30},${v - 30},.8)`; z.lineWidth = 3; z.stroke() } };
  fil.forEach(fh0 => { const fh = fh0 * k0, an = []; let s2 = 0; while (s2 < w) { const sw = (o.sillar ? 170 + r() * 110 : 80 + r() * 120) * S; an.push(sw); s2 += sw } const k1 = w / s2, off = r() * w; let x = 0;
    an.forEach(sw0 => { const sw = sw0 * k1; piedra((x + off) % w, y, sw, fh); x += sw }); y += fh });
  for (let k = 0; k < 14000; k++) { const x = r() * w, y2 = r() * h; c.fillStyle = r() < .5 ? "rgba(40,34,26,.16)" : "rgba(255,250,235,.14)"; c.fillRect(x, y2, 1 + r() * 2, 1 + r() * 2) }
  for (let k = 0; k < (o.liquen ?? 30); k++) { const x = r() * w, y2 = r() * h, n = 6 + r() * 16, col = ["rgba(196,180,90,.5)", "rgba(230,228,210,.45)", "rgba(170,150,70,.45)", "rgba(120,140,80,.4)"][r() * 4 | 0]; for (let q = 0; q < n; q++) envuelto(c, w, h, () => { c.fillStyle = col; c.beginPath(); c.arc(x + (r() - .5) * 26, y2 + (r() - .5) * 18, 1.5 + r() * 5, 0, 7); c.fill() }) }
  // hollín y chorreaduras oscuras (pueblo con chimeneas bajo una tapa: todo un poco tiznado)
  for (let k = 0; k < (o.hollin ?? 30); k++) { const x = r() * w, y2 = r() * h, L = 60 + r() * 300, an = 4 + r() * 16, gr = c.createLinearGradient(0, y2, 0, y2 + L); gr.addColorStop(0, "rgba(34,30,26,.26)"); gr.addColorStop(1, "rgba(34,30,26,0)"); c.fillStyle = gr; c.fillRect(x - an / 2, y2, an, L) }
  if (o.musgo) { for (let k = 0; k < 700; k++) { const x = r() * w, y2 = r() * h; c.fillStyle = `rgba(${70 + r() * 30 | 0},${96 + r() * 30 | 0},${40 + r() * 20 | 0},${.25 + r() * .3})`; c.beginPath(); c.arc(x, y2, 2 + r() * 7, 0, 7); c.fill() } } }));
const MURO_P = [["#8e877a", "#7a7366", "#a39b8c", "#6e675c", "#9a8e7a", "#857d70"], ["#a0927c", "#8c7e68", "#b4a68e", "#7a6e5c", "#9c8a70"], ["#7c7a76", "#686660", "#8e8a84", "#5e5c58", "#9a948a"], ["#a8987e", "#94846c", "#bcae94", "#857560", "#a08c72"], ["#8a8274", "#77706a", "#9c9484", "#a69a84", "#6a645c"], ["#968a78", "#827868", "#aa9e8a", "#70685c"]];
const M_MURO = MURO_P.map((p, i) => { const [t, z] = T_MURO(4200 + i, p, { mortero: ["#5c564c", "#625a4c", "#52504c", "#665c4c", "#58544c", "#5e564c"][i] }); return new THREE.MeshStandardMaterial({ map: t, bumpMap: z, bumpScale: 4.5, roughness: .93 }) });
const M_ZOCALO = (() => { const [t, z] = T_MURO(4210, ["#6e685e", "#5e584e", "#7a7468", "#666052"], { mortero: "#4e4a42", musgo: 1, escala: 1.25 }); return new THREE.MeshStandardMaterial({ map: t, bumpMap: z, bumpScale: 5, roughness: .96 }) })();
const T_SILLAR = T_MURO(4220, ["#9a9282", "#8a8272", "#aaa290", "#7e776a", "#a49a86"], { sillar: 1, mortero: "#6a645a", liquen: 70 });
// piedra clara de las mansiones de la Loma (sillares limpios, sin hollín)
const T_SILLAR_C = T_MURO(4221, ["#e2dac8", "#d6ccb6", "#ece4d2", "#cfc4ac", "#e8dcc4"], { sillar: 1, mortero: "#b8ae98", liquen: 8, hollin: 0 });
const M_SILLAR_C = new THREE.MeshStandardMaterial({ map: T_SILLAR_C[0], bumpMap: T_SILLAR_C[1], bumpScale: 3.5, roughness: .8 });
// ladrillo: hiladas de soga, ladrillos quemados y rotos, parches, hollín
const T_LADRILLO = (seed, pal, mort) => repT(pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(seed), bh = 23, bw = 72; c.fillStyle = mort; c.fillRect(0, 0, w, h); z.fillStyle = "#303030"; z.fillRect(0, 0, w, h);
  for (let k = 0; k < 5000; k++) { c.fillStyle = r() < .5 ? "rgba(40,34,28,.25)" : "rgba(220,210,190,.18)"; c.fillRect(r() * w, r() * h, 2, 2) }
  for (let f = 0; f * bh < h; f++) { const off = (f % 2) * bw / 2 + (r() - .5) * 6; for (let x = -bw; x < w + bw; x += bw) { if (r() < .015) continue; const x0 = x + off + 2, y0 = f * bh + 2, ww = bw - 4 + (r() - .5) * 3, hh = bh - 4, col = rgbj(pal[r() * pal.length | 0], r, 28), v = 150 + r() * 80 | 0;
      for (const dx of [-w, 0, w]) { redondo(c, [[x0 + dx, y0], [x0 + dx + ww, y0], [x0 + dx + ww, y0 + hh], [x0 + dx, y0 + hh]], 3); c.fillStyle = col; c.fill(); const gr = c.createLinearGradient(0, y0, 0, y0 + hh); gr.addColorStop(0, "rgba(255,230,210,.14)"); gr.addColorStop(1, "rgba(30,14,8,.22)"); c.fillStyle = gr; c.fill();
        if (r() < .08) { c.fillStyle = "rgba(30,20,16,.35)"; c.beginPath(); c.arc(x0 + dx + r() * ww, y0 + r() * hh, 3 + r() * 5, 0, 7); c.fill() }
        redondo(z, [[x0 + dx, y0], [x0 + dx + ww, y0], [x0 + dx + ww, y0 + hh], [x0 + dx, y0 + hh]], 3); z.fillStyle = `rgb(${v},${v},${v})`; z.fill() } } }
  for (let k = 0; k < 8000; k++) { c.fillStyle = r() < .5 ? "rgba(40,24,18,.16)" : "rgba(255,240,225,.1)"; c.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2) }
  for (let k = 0; k < 30; k++) { const x = r() * w, y2 = r() * h, L = 80 + r() * 300, an = 6 + r() * 20, gr = c.createLinearGradient(0, y2, 0, y2 + L); gr.addColorStop(0, "rgba(30,24,20,.3)"); gr.addColorStop(1, "rgba(30,24,20,0)"); c.fillStyle = gr; c.fillRect(x - an / 2, y2, an, L) }
  for (let k = 0; k < 8; k++) { const x = r() * w, y2 = r() * h, s = 40 + r() * 90, gr = c.createRadialGradient(x, y2, 0, x, y2, s); gr.addColorStop(0, "rgba(220,210,190,.35)"); gr.addColorStop(1, "rgba(220,210,190,0)"); c.fillStyle = gr; c.fillRect(x - s, y2 - s, 2 * s, 2 * s) } }));
const M_LAD = [[["#9a4a34", "#8a3e2c", "#a85a3e", "#7a3826", "#b0644a", "#6e3022"], "#8a7e6e"], [["#a86a48", "#94583c", "#b87a56", "#80503a", "#c08a62"], "#9a9080"], [["#7a3a2c", "#6a3226", "#8a4a36", "#5a2a20", "#944e3a"], "#6e665c"]].map(([p, m], i) => { const [t, z] = T_LADRILLO(4230 + i, p, m); return new THREE.MeshStandardMaterial({ map: t, bumpMap: z, bumpScale: 4, roughness: .92 }) });
const T_PIZARRA = (seed, pal) => repT(pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(seed); c.fillStyle = "#1a1d20"; c.fillRect(0, 0, w, h); z.fillStyle = "#1a1a1a"; z.fillRect(0, 0, w, h);
  const nf = 15, fh = h / nf; for (let f = -1; f <= nf; f++) { const y0 = f * fh; let x = -r() * 50; while (x < w) { const sw = 54 + r() * 44, col = rgbj(pal[r() * pal.length | 0], r, 20), v = 120 + r() * 70 | 0, rot = r() < .05;
      for (const dx of [-w, 0, w]) { const x0 = x + dx + 2, x1 = x + dx + sw - 2, ya = y0 - fh * .55, yb = y0 + fh + (r() - .5) * 5, Q = [[x0, ya], [x1, ya], [x1 + (r() - .5) * 3, yb], [x0 + (r() - .5) * 3, yb]];
        redondo(c, Q, 6); c.fillStyle = rot ? "#0e1012" : col; c.fill(); const gr = c.createLinearGradient(0, ya, 0, yb); gr.addColorStop(0, "rgba(0,0,0,.35)"); gr.addColorStop(.75, "rgba(255,255,255,0)"); gr.addColorStop(1, "rgba(230,235,240,.16)"); c.fillStyle = gr; c.fill(); c.strokeStyle = "rgba(10,12,14,.55)"; c.lineWidth = 2; c.stroke();
        redondo(z, Q, 6); const gz = z.createLinearGradient(0, ya, 0, yb); gz.addColorStop(0, "#202020"); gz.addColorStop(1, `rgb(${v},${v},${v})`); z.fillStyle = gz; z.fill() } x += sw } }
  for (let k = 0; k < 9000; k++) { c.fillStyle = r() < .5 ? "rgba(0,0,0,.15)" : "rgba(220,225,230,.1)"; c.fillRect(r() * w, r() * h, 1 + r() * 2, 1) }
  for (let k = 0; k < 60; k++) { const x = r() * w, y = r() * h, n = 5 + r() * 18, col = r() < .6 ? "rgba(140,150,70,.55)" : r() < .5 ? "rgba(210,205,170,.5)" : "rgba(200,150,60,.5)"; for (let q = 0; q < n; q++) envuelto(c, w, h, () => { c.fillStyle = col; c.beginPath(); c.arc(x + (r() - .5) * 30, y + (r() - .5) * 14, 1.5 + r() * 4.5, 0, 7); c.fill() }) } }));
const T_TEJA_V = (seed, pal) => repT(pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(seed); c.fillStyle = "#3a2216"; c.fillRect(0, 0, w, h); z.fillStyle = "#202020"; z.fillRect(0, 0, w, h);
  const nf = 12, fh = h / nf, cols = Math.round(w / 64), tw = w / cols; for (let f = -1; f <= nf; f++) { const y0 = f * fh; for (let i = 0; i < cols; i++) { const x0 = i * tw + (r() - .5) * 3, col = rgbj(pal[r() * pal.length | 0], r, 24), v = 140 + r() * 60 | 0, ya = y0 - fh * .5, yb = y0 + fh + (r() - .5) * 6;
      for (const dx of [-w, 0, w]) { const Q = [[x0 + dx + 3, ya], [x0 + dx + tw - 3, ya], [x0 + dx + tw - 2, yb], [x0 + dx + 2, yb]]; redondo(c, Q, 14); c.fillStyle = col; c.fill();
        const gr = c.createLinearGradient(x0 + dx, 0, x0 + dx + tw, 0); gr.addColorStop(0, "rgba(30,14,8,.5)"); gr.addColorStop(.35, "rgba(255,230,200,.18)"); gr.addColorStop(.6, "rgba(255,230,200,0)"); gr.addColorStop(1, "rgba(30,14,8,.55)"); c.fillStyle = gr; c.fill();
        const g2 = c.createLinearGradient(0, ya, 0, yb); g2.addColorStop(0, "rgba(0,0,0,.3)"); g2.addColorStop(.3, "rgba(0,0,0,0)"); c.fillStyle = g2; c.fill(); c.strokeStyle = "rgba(40,18,10,.5)"; c.lineWidth = 2; c.stroke();
        redondo(z, Q, 14); const gz = z.createLinearGradient(x0 + dx, 0, x0 + dx + tw, 0); gz.addColorStop(0, "#303030"); gz.addColorStop(.45, `rgb(${v},${v},${v})`); gz.addColorStop(1, "#303030"); z.fillStyle = gz; z.fill() } } }
  for (let k = 0; k < 9000; k++) { c.fillStyle = r() < .5 ? "rgba(40,20,10,.15)" : "rgba(255,230,200,.1)"; c.fillRect(r() * w, r() * h, 1 + r() * 2, 1) }
  for (let k = 0; k < 70; k++) { const x = r() * w, y = r() * h, n = 5 + r() * 22, col = r() < .6 ? "rgba(110,120,60,.6)" : "rgba(220,210,170,.5)"; for (let q = 0; q < n; q++) envuelto(c, w, h, () => { c.fillStyle = col; c.beginPath(); c.arc(x + (r() - .5) * 34, y + (r() - .5) * 16, 1.5 + r() * 5, 0, 7); c.fill() }) } }));
const M_PIZ = [["#4a525a", "#3e454c", "#565e66", "#5a5a60", "#444a52"], ["#3c4048", "#484c56", "#33373e", "#545860"], ["#5a5e5e", "#4c5050", "#646866", "#42484a"]].map((p, i) => { const [t, z] = T_PIZARRA(4300 + i, p); return new THREE.MeshStandardMaterial({ map: t, bumpMap: z, bumpScale: 4, roughness: .7 }) });
const M_TEJA = [["#a4583a", "#8e4a30", "#b8683e", "#7a4028", "#a86048"], ["#8a5040", "#9c5c44", "#704030", "#a8705a"], ["#b0704a", "#9a5e3c", "#c08058", "#865032"]].map((p, i) => { const [t, z] = T_TEJA_V(4310 + i, p); return new THREE.MeshStandardMaterial({ map: t, bumpMap: z, bumpScale: 4, roughness: .85 }) });
const T_REVOQUE = repT(pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(4320); c.fillStyle = "#d2c8b2"; c.fillRect(0, 0, w, h); z.fillStyle = "#909090"; z.fillRect(0, 0, w, h);
  for (let k = 0; k < 160; k++) { const x = r() * w, y = r() * h, s = 30 + r() * 150, cl2 = r() < .55 ? "120,104,80" : "255,252,240", gr = c.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, `rgba(${cl2},${.06 + r() * .1})`); gr.addColorStop(1, `rgba(${cl2},0)`); c.fillStyle = gr; c.fillRect(x - s, y - s, s * 2, s * 2) }
  for (let k = 0; k < 400; k++) { const x = r() * w, y = r() * h, L = 30 + r() * 110, a = (r() - .5) * .8; c.strokeStyle = r() < .5 ? "rgba(140,120,90,.06)" : "rgba(255,255,250,.1)"; c.lineWidth = 6 + r() * 14; c.lineCap = "round"; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); c.stroke(); z.strokeStyle = r() < .5 ? "rgba(70,70,70,.2)" : "rgba(200,200,200,.2)"; z.lineWidth = 8; z.beginPath(); z.moveTo(x, y); z.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); z.stroke() }
  for (let k = 0; k < 7; k++) { const cx = r() * w, cy = r() * h, s = 30 + r() * 60, P = Array.from({ length: 9 }, (_, i) => { const a = i / 9 * 6.283, d = s * (.55 + r() * .6); return [cx + Math.cos(a) * d * 1.3, cy + Math.sin(a) * d] });
    redondo(c, P, 10); c.fillStyle = "#8e8474"; c.fill(); c.save(); c.clip(); for (let q = 0; q < 20; q++) { c.fillStyle = rgbj(["#a05a44", "#8a4a36", "#7e7466"][r() * 3 | 0], r, 20); c.fillRect(cx - s * 1.4 + (q % 5) * s * .58 + ((q / 5 | 0) % 2) * s * .29, cy - s + (q / 5 | 0) * s * .42, s * .52, s * .36) } c.restore(); c.strokeStyle = "rgba(90,80,64,.7)"; c.lineWidth = 3; c.stroke(); redondo(z, P, 10); z.fillStyle = "#505050"; z.fill() }
  for (let k = 0; k < 14; k++) { let x = r() * w, y = r() * h; const n = 8 + r() * 16 | 0; c.strokeStyle = "rgba(80,70,56,.55)"; c.lineWidth = 1.5; z.strokeStyle = "#202020"; z.lineWidth = 3; c.beginPath(); z.beginPath(); c.moveTo(x, y); z.moveTo(x, y); for (let q = 0; q < n; q++) { x += (r() - .5) * 26; y += 6 + r() * 18; c.lineTo(x, y); z.lineTo(x, y) } c.stroke(); z.stroke() }
  for (let k = 0; k < 24; k++) { const x = r() * w, y2 = r() * h, L = 80 + r() * 300, an = 8 + r() * 20, gr = c.createLinearGradient(0, y2, 0, y2 + L); gr.addColorStop(0, "rgba(60,52,40,.2)"); gr.addColorStop(1, "rgba(60,52,40,0)"); c.fillStyle = gr; c.fillRect(x - an / 2, y2, an, L) }
  for (let k = 0; k < 10000; k++) { c.fillStyle = r() < .5 ? "rgba(90,80,60,.12)" : "rgba(255,255,255,.12)"; c.fillRect(r() * w, r() * h, 2, 2) } }));
const M_REVOQUE = new THREE.MeshStandardMaterial({ map: T_REVOQUE[0], bumpMap: T_REVOQUE[1], bumpScale: 3.5, roughness: .95 });
const REV_C = ["#e8d8b8", "#d8c0a0", "#c8d0c0", "#e0c8a8", "#d0b898", "#c8b8a8"];
const M_REV = REV_C.map(c => new THREE.MeshStandardMaterial({ map: T_REVOQUE[0], bumpMap: T_REVOQUE[1], bumpScale: 3.5, roughness: .95, color: c }));
const T_TABLA_N = (() => { const [c, z] = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(4330); let x = 0; z.fillStyle = "#909090"; z.fillRect(0, 0, w, h); while (x < w) { const pw = 64 + r() * 50; c.fillStyle = rgbj("#e2dcd2", r, 22); c.fillRect(x, 0, pw, h); for (let k = 0; k < 40; k++) { const xx = x + r() * pw; c.strokeStyle = r() < .5 ? "rgba(90,74,60,.25)" : "rgba(255,255,255,.3)"; c.lineWidth = 1 + r() * 2; c.beginPath(); c.moveTo(xx, 0); for (let y = 0; y <= h; y += 40) c.lineTo(xx + (r() - .5) * 6, y); c.stroke(); z.strokeStyle = "rgba(60,60,60,.3)"; z.lineWidth = 2; z.beginPath(); z.moveTo(xx, 0); z.lineTo(xx, h); z.stroke() }
      for (let k = 0; k < 5; k++) { const px = x + r() * pw, py = r() * h, s = 6 + r() * 20; c.fillStyle = "rgba(120,96,70,.7)"; c.beginPath(); c.ellipse(px, py, s * .6, s, r(), 0, 7); c.fill(); z.fillStyle = "rgba(40,40,40,.6)"; z.beginPath(); z.ellipse(px, py, s * .6, s, 0, 0, 7); z.fill() }
      for (const yy of [30, h - 30]) { c.fillStyle = "#3a3430"; c.beginPath(); c.arc(x + pw / 2, yy, 4, 0, 7); c.fill() }
      c.fillStyle = "rgba(40,28,20,.8)"; c.fillRect(x + pw - 4, 0, 4, h); z.fillStyle = "#000"; z.fillRect(x + pw - 5, 0, 6, h); x += pw } }); [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
const PUERTA_C = ["#3a4a3c", "#5a2a22", "#2e3e52", "#6a5232", "#3a3028", "#4a524a", "#4e3026", "#22343a", "#5e5446"];
const M_PUERTA = PUERTA_C.map(c => new THREE.MeshStandardMaterial({ map: T_TABLA_N.c, bumpMap: T_TABLA_N.z, bumpScale: 3, roughness: .8, color: c }));
const M_MADERA = new THREE.MeshStandardMaterial({ map: T_TABLA_N.c, bumpMap: T_TABLA_N.z, bumpScale: 3.5, roughness: .9, color: "#6e5038" });
const M_MADERA_V = new THREE.MeshStandardMaterial({ map: T_TABLA_N.c, bumpMap: T_TABLA_N.z, bumpScale: 3.5, roughness: .95, color: "#9a8e7e" });
const M_VIGA = new THREE.MeshStandardMaterial({ map: T_TABLA_N.c, bumpMap: T_TABLA_N.z, bumpScale: 3, roughness: .9, color: "#4a3426" });
const M_VIDRIO = new THREE.MeshStandardMaterial({ color: "#1e2a30", roughness: .12, metalness: .55 });
const M_OSCURO = new THREE.MeshBasicMaterial({ color: "#120d0a" });
const M_HIERRO = new THREE.MeshStandardMaterial({ color: "#3a3532", roughness: .5, metalness: .75 });
const M_HIERRO_O = new THREE.MeshStandardMaterial({ color: "#5a4030", roughness: .7, metalness: .5 });
const M_TERRACOTA = new THREE.MeshStandardMaterial({ color: "#a65a3a", roughness: .8 });
const M_BLANCO_P = new THREE.MeshStandardMaterial({ map: T_TABLA_N.c, bumpMap: T_TABLA_N.z, bumpScale: 1.5, color: "#f0ece2", roughness: .6 });   // carpintería blanca (Loma)
const T_SOGA = tex(64, 64, (g, w, h) => { g.fillStyle = "#b89a6a"; g.fillRect(0, 0, w, h); for (let k = -8; k < 16; k++) { g.strokeStyle = k % 2 ? "rgba(70,50,28,.7)" : "rgba(240,220,170,.5)"; g.lineWidth = 4; g.beginPath(); g.moveTo(k * 8, 0); g.lineTo(k * 8 + 32, h); g.stroke() } }, [1, 6]);
const M_SOGA = new THREE.MeshStandardMaterial({ map: T_SOGA, bumpMap: T_SOGA, bumpScale: 2, roughness: 1 });
const T_ROCA = (() => { const [c, z] = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(4340); c.fillStyle = "#cfcac0"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
    for (let k = 0; k < 300; k++) { const x = r() * w, y = r() * h, s = 10 + r() * 60; envuelto(c, w, h, () => { c.fillStyle = r() < .5 ? "rgba(90,86,76,.14)" : "rgba(255,255,250,.14)"; c.beginPath(); c.ellipse(x, y, s, s * .6, r() * 3, 0, 7); c.fill() }); envuelto(z, w, h, () => { z.fillStyle = r() < .5 ? "rgba(50,50,50,.25)" : "rgba(210,210,210,.25)"; z.beginPath(); z.ellipse(x, y, s, s * .6, 0, 0, 7); z.fill() }) }
    for (let k = 0; k < 40; k++) { let x = r() * w, y = r() * h; c.strokeStyle = "rgba(40,36,30,.6)"; c.lineWidth = 1.5 + r() * 2; z.strokeStyle = "#000"; z.lineWidth = 4; c.beginPath(); z.beginPath(); c.moveTo(x, y); z.moveTo(x, y); for (let q = 0; q < 7; q++) { x += (r() - .5) * 50; y += (r() - .5) * 50; c.lineTo(x, y); z.lineTo(x, y) } c.stroke(); z.stroke() }
    for (let k = 0; k < 90; k++) { const x = r() * w, y = r() * h, n = 6 + r() * 14, col = ["rgba(200,190,90,.6)", "rgba(240,240,225,.6)", "rgba(210,140,60,.5)", "rgba(110,130,70,.5)"][r() * 4 | 0]; for (let q = 0; q < n; q++) { c.fillStyle = col; c.beginPath(); c.arc(x + (r() - .5) * 20, y + (r() - .5) * 20, 1.5 + r() * 4, 0, 7); c.fill() } } });
  [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
const M_ROCA = new THREE.MeshStandardMaterial({ map: T_ROCA.c, bumpMap: T_ROCA.z, bumpScale: 4, roughness: .95, color: "#ffffff" });
const M_ROCA_G = new THREE.MeshStandardMaterial({ map: T_ROCA.c, bumpMap: T_ROCA.z, bumpScale: 4, roughness: .95, color: "#8e8a80" });
const M_PIEDRA_C = new THREE.MeshStandardMaterial({ color: "#b4ab98", roughness: .9, bumpMap: T_ROCA.z, bumpScale: 2.5 });
const GEO_PIEDRAS = [geoPiedra(31, 1, .62), geoPiedra(32, 1, .8), geoPiedra(33, 1, .5)];
// chapa ondulada con óxido (parches de techo, galpones)
const T_CHAPA = repT(pintarDoble(512, 512, (c, z, w, h) => { const r = rng(4350); for (let x = 0; x < w; x += 16) { const gr = c.createLinearGradient(x, 0, x + 16, 0); gr.addColorStop(0, "#5a5e60"); gr.addColorStop(.5, "#9aa0a2"); gr.addColorStop(1, "#5a5e60"); c.fillStyle = gr; c.fillRect(x, 0, 16, h); const gz = z.createLinearGradient(x, 0, x + 16, 0); gz.addColorStop(0, "#202020"); gz.addColorStop(.5, "#e0e0e0"); gz.addColorStop(1, "#202020"); z.fillStyle = gz; z.fillRect(x, 0, 16, h) }
  for (let k = 0; k < 70; k++) { const x = r() * w, y = r() * h, s = 10 + r() * 70, gr = c.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, `rgba(${140 + r() * 40 | 0},${70 + r() * 20 | 0},30,.75)`); gr.addColorStop(1, "rgba(140,70,30,0)"); c.fillStyle = gr; c.fillRect(x - s, y - s, 2 * s, 2 * s) }
  for (let k = 0; k < 30; k++) { const x = r() * w, y2 = r() * h, L = 40 + r() * 200, gr = c.createLinearGradient(0, y2, 0, y2 + L); gr.addColorStop(0, "rgba(120,60,24,.5)"); gr.addColorStop(1, "rgba(120,60,24,0)"); c.fillStyle = gr; c.fillRect(x, y2, 3 + r() * 6, L) } }));
const M_CHAPA = new THREE.MeshStandardMaterial({ map: T_CHAPA[0], bumpMap: T_CHAPA[1], bumpScale: 3, roughness: .6, metalness: .35 });

// ---------- metal con reflejos: un cielo chiquito pintado (celeste parejo arriba, piso gris abajo, una franja clara) para la grasa, el hierro y el oro
const ENV_METAL_P = (() => { const es = new THREE.Scene(); es.add(new THREE.Mesh(new THREE.SphereGeometry(50, 48, 24), new THREE.ShaderMaterial({ side: THREE.BackSide,
    vertexShader: "varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
    fragmentShader: "varying vec3 vD; void main(){ float h = vD.y; vec3 c = mix(vec3(.62,.72,.84), vec3(.55,.7,.92), smoothstep(0., .7, h)); c = mix(c, vec3(.3,.27,.24), smoothstep(.02, -.3, h)); c += vec3(1.1,1.08,1.) * smoothstep(.93, .99, h) * .9 + vec3(.9,.92,.95) * pow(max(dot(vD, normalize(vec3(.6,.35,.5))), 0.), 40.) * .8; gl_FragColor = vec4(c, 1.); }" })));
  const pm = new THREE.PMREMGenerator(R), rt = pm.fromScene(es, 0, .1, 100); pm.dispose(); return rt.texture })();
M_HIERRO.envMap = ENV_METAL_P; M_HIERRO.envMapIntensity = .6; M_HIERRO_O.envMap = ENV_METAL_P; M_HIERRO_O.envMapIntensity = .35; M_CHAPA.envMap = ENV_METAL_P; M_CHAPA.envMapIntensity = .5;
const M_HIERRO_G = new THREE.MeshStandardMaterial({ color: "#2e2c2a", roughness: .55, metalness: .7, envMap: ENV_METAL_P, envMapIntensity: .55, bumpMap: T_ROCA.z, bumpScale: 1.2 });   // fundición del gato
const M_LATON = new THREE.MeshStandardMaterial({ color: "#c8a050", roughness: .28, metalness: .95, envMap: ENV_METAL_P, envMapIntensity: 1.1 });                                    // bronce/latón de la Loma
// ---------- textura de detalle del piso (tierra apisonada, piedritas, grietas, matitas); el color grande va por vértice
const T_TIERRA_D = (() => { const [c, z] = pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(4101); c.fillStyle = "#e4ddcc"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
    for (let k = 0; k < 260; k++) { const x = r() * w, y = r() * h, s = 30 + r() * 120, col = r() < .5 ? "rgba(120,104,80,.16)" : "rgba(255,250,235,.18)"; envuelto(c, w, h, () => { const gr = c.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, col); gr.addColorStop(1, "rgba(230,230,210,0)"); c.fillStyle = gr; c.fillRect(x - s, y - s, s * 2, s * 2) });
      envuelto(z, w, h, () => { const gr = z.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, r() < .5 ? "rgba(40,40,40,.25)" : "rgba(220,220,220,.25)"); gr.addColorStop(1, "rgba(128,128,128,0)"); z.fillStyle = gr; z.fillRect(x - s, y - s, s * 2, s * 2) }) }
    // grietas de barro seco
    for (let k = 0; k < 50; k++) { let x = r() * w, y = r() * h; c.strokeStyle = "rgba(70,56,40,.4)"; c.lineWidth = 1.5 + r() * 1.5; z.strokeStyle = "rgba(0,0,0,.8)"; z.lineWidth = 3; c.beginPath(); z.beginPath(); c.moveTo(x, y); z.moveTo(x, y); for (let q = 0; q < 6; q++) { x += (r() - .5) * 60; y += (r() - .5) * 60; c.lineTo(x, y); z.lineTo(x, y) } c.stroke(); z.stroke() }
    // matitas paradas (sin viento: acá no sopla)
    for (let k = 0; k < 7000; k++) { const x = r() * w, y = r() * h, L = 5 + r() * 14, a = -Math.PI / 2 + (r() - .5) * 1.2, cl2 = r(); c.strokeStyle = cl2 < .5 ? `rgba(70,90,30,${.12 + r() * .16})` : cl2 < .8 ? `rgba(160,170,90,${.12 + r() * .14})` : `rgba(200,180,110,${.12 + r() * .16})`;
      c.lineWidth = 1 + r() * 1.4; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); c.stroke() }
    for (let k = 0; k < 520; k++) { const x = r() * w, y = r() * h, s = 2 + r() * 6, a = r() * 3; envuelto(c, w, h, () => { c.fillStyle = "rgba(40,36,30,.18)"; c.beginPath(); c.ellipse(x + 2, y + 2, s, s * .7, a, 0, 7); c.fill(); c.fillStyle = rgbj(["#c8c2b6", "#aaa69a", "#d8d2c4", "#9a9488", "#b8a890"][r() * 5 | 0], r, 20); c.beginPath(); c.ellipse(x, y, s, s * .7, a, 0, 7); c.fill() });
      envuelto(z, w, h, () => { z.fillStyle = "rgba(250,250,250,.9)"; z.beginPath(); z.ellipse(x, y, s, s * .7, a, 0, 7); z.fill() }) } });
  [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
const M_TIERRA = new THREE.MeshStandardMaterial({ map: T_TIERRA_D.c, bumpMap: T_TIERRA_D.z, bumpScale: 3, roughness: .97, vertexColors: true });

// ---------- ventanas con vela adentro: vidrio oscuro con el brillo cálido del cuarto (cortina, marco, la llama). La intensidad la pone el clima
const T_VENT = tex(256, 256, (g, w, h) => { const r = rng(4380); const gr = g.createRadialGradient(w * .5, h * .78, 4, w * .5, h * .6, h * .75); gr.addColorStop(0, "#fff0c0"); gr.addColorStop(.25, "#ffb050"); gr.addColorStop(.7, "#7a3a10"); gr.addColorStop(1, "#2a1206"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = "rgba(30,12,4,.75)"; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(w * .22, h * .5, w * .12, h); g.lineTo(0, h); g.fill(); g.beginPath(); g.moveTo(w, 0); g.quadraticCurveTo(w * .8, h * .45, w * .9, h); g.lineTo(w, h); g.fill();
  for (let k = 0; k < 30; k++) { g.strokeStyle = "rgba(20,8,2,.18)"; g.lineWidth = 2; const x = r() * w * .2; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (r() - .5) * 20, h); g.stroke(); g.beginPath(); g.moveTo(w - x, 0); g.lineTo(w - x + (r() - .5) * 20, h); g.stroke() }
  g.fillStyle = "rgba(255,250,220,.9)"; g.beginPath(); g.ellipse(w * .5, h * .74, 7, 16, 0, 0, 7); g.fill() });
const M_VENTANA = new THREE.MeshStandardMaterial({ color: "#1c1610", roughness: .18, metalness: .35, emissive: "#ffffff", emissiveMap: T_VENT, emissiveIntensity: .25 });
const M_VIDRIO_C = new THREE.MeshStandardMaterial({ color: "#c8d4d0", roughness: .05, metalness: .1, transparent: true, opacity: .14, depthWrite: false });
// piedra tiznada de la tienda de Sallow: casi negra, chorreaduras de hollín y de cera amarillenta
const M_HOLLIN = (() => { const [t, z] = T_MURO(4250, ["#3a3632", "#2e2a28", "#46403a", "#262422", "#4a4238"], { mortero: "#1a1816", liquen: 8, hollin: 160, escala: 1.1 }); return new THREE.MeshStandardMaterial({ map: t, bumpMap: z, bumpScale: 5, roughness: .97, color: "#8c847c" }) })();
// madera vieja negra (marcos, vigas y muebles de la tienda) y cera
const M_MADERA_N = new THREE.MeshStandardMaterial({ map: T_TABLA_N.c, bumpMap: T_TABLA_N.z, bumpScale: 3.5, roughness: .85, color: "#3a2c22" });
const M_CERA = new THREE.MeshStandardMaterial({ color: "#e8d49a", roughness: .42, emissive: "#3a2808", emissiveIntensity: .25 });
const M_CERA_V = new THREE.MeshStandardMaterial({ color: "#c8a85a", roughness: .5, emissive: "#2a1a04", emissiveIntensity: .2 });   // cera vieja, amarillenta
// papel de pared (adentro de la casa de Nell): flores chiquitas desteñidas
const T_PAPEL = tex(512, 512, (g, w, h) => { const r = rng(4390); g.fillStyle = "#c8b48c"; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 64) { g.fillStyle = "rgba(150,110,70,.18)"; g.fillRect(x, 0, 6, h) }
  for (let y = 16; y < h; y += 64) for (let x = 16 + (y / 64 % 2) * 32; x < w; x += 64) { g.fillStyle = "rgba(160,70,60,.55)"; for (let p = 0; p < 5; p++) { const a = p / 5 * 6.28; g.beginPath(); g.arc(x + Math.cos(a) * 5, y + Math.sin(a) * 5, 4, 0, 7); g.fill() } g.fillStyle = "rgba(90,110,60,.5)"; g.fillRect(x - 1, y + 6, 2, 12) }
  for (let k = 0; k < 3000; k++) { g.fillStyle = r() < .5 ? "rgba(60,40,20,.06)" : "rgba(255,250,230,.06)"; g.fillRect(r() * w, r() * h, 3, 3) } const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(60,40,20,.25)"); gr.addColorStop(.3, "rgba(60,40,20,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h) }, [2, 1]);
const M_PAPEL = new THREE.MeshStandardMaterial({ map: T_PAPEL, roughness: .95 });
const T_CORTINA = tex(256, 256, (g, w, h) => { const r = rng(4392); g.fillStyle = "#d8c8a0"; g.fillRect(0, 0, w, h); for (let k = 0; k < 90; k++) { const x = r() * w, y = r() * h; g.fillStyle = ["rgba(170,60,60,.6)", "rgba(80,110,150,.55)", "rgba(200,150,60,.6)"][k % 3]; for (let p = 0; p < 5; p++) { const a = p / 5 * 6.28; g.beginPath(); g.arc(x + Math.cos(a) * 4, y + Math.sin(a) * 4, 3.5, 0, 7); g.fill() } } for (let x = 0; x < w; x += 10) { g.fillStyle = "rgba(60,40,20,.12)"; g.fillRect(x, 0, 4, h) } });
const M_CORTINA = new THREE.MeshStandardMaterial({ map: T_CORTINA, roughness: 1 });
const T_ADOQUIN = (() => { const [c, z] = pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(4410), px = w / 3; c.fillStyle = "#3e3830"; c.fillRect(0, 0, w, h); z.fillStyle = "#101010"; z.fillRect(0, 0, w, h);
    const fh = .3 * px; for (let f = 0; f * fh < h; f++) { let x = -r() * .2 * px; while (x < w) { const sw = (.2 + r() * .1) * px, x0 = x + 3, y0 = f * fh + 3, P = [[x0, y0], [x0 + sw - 6, y0 + (r() - .5) * 4], [x0 + sw - 6 + (r() - .5) * 4, y0 + fh - 6], [x0 + (r() - .5) * 4, y0 + fh - 6]], col = rgbj(["#8a8478", "#7a746a", "#9a9488", "#6e685e", "#8e8270", "#a09a8c"][r() * 6 | 0], r, 20), v = 170 + r() * 70 | 0;
        for (const dx of [-w, 0, w]) { const Q = P.map(([a, b]) => [a + dx, b]); redondo(c, Q, 12); c.fillStyle = col; c.fill(); const gr = c.createRadialGradient(x0 + dx + sw * .35, y0 + fh * .3, 2, x0 + dx + sw / 2, y0 + fh / 2, sw * .7); gr.addColorStop(0, "rgba(255,250,235,.25)"); gr.addColorStop(1, "rgba(30,26,20,.3)"); c.fillStyle = gr; c.fill();
          redondo(z, Q, 12); const gz = z.createRadialGradient(x0 + dx + sw / 2, y0 + fh / 2, 2, x0 + dx + sw / 2, y0 + fh / 2, sw * .7); gz.addColorStop(0, `rgb(${v},${v},${v})`); gz.addColorStop(1, "#404040"); z.fillStyle = gz; z.fill() } x += sw } }
    for (let k = 0; k < 9000; k++) { c.fillStyle = r() < .5 ? "rgba(30,26,20,.16)" : "rgba(255,250,235,.1)"; c.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2) }
    for (let k = 0; k < 120; k++) { const x = r() * w, y = r() * h, s = 30 + r() * 110, gr = c.createRadialGradient(x, y, 0, x, y, s), cl2 = r() < .5 ? "40,34,26" : "200,190,170"; gr.addColorStop(0, `rgba(${cl2},.2)`); gr.addColorStop(1, `rgba(${cl2},0)`); c.fillStyle = gr; c.fillRect(x - s, y - s, 2 * s, 2 * s) } });
  [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
const geoSobreSuelo = (x0, x1, z0, z1, nx, nz, dy = .02) => { const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, nz); g.rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, 0, (z0 + z1) / 2); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, SUELO(p.getX(i), p.getZ(i)) + dy); g.computeVertexNormals(); return g };
const M_ADOQ_D = new THREE.MeshStandardMaterial({ map: T_ADOQUIN.c, bumpMap: T_ADOQUIN.z, bumpScale: 6, roughness: .88, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
const GEO_ADOQ = (() => { const r = rng(4420), pos = [], nor = [], col = [], idx = []; const P = ["#8a8478", "#7a746a", "#9a9488", "#6e685e", "#8e8270", "#a09a8c", "#857a6a", "#968e80"].map(linC);
  const piedra = (cx, cz, a, b, hh) => { const o = pos.length / 3, c = P[r() * P.length | 0], k = .82 + r() * .3, cc = [c[0] * k, c[1] * k, c[2] * k], ry = (r() - .5) * .12, cs = Math.cos(ry), sn = Math.sin(ry);
    // 3 × 3 vértices arriba (el centro más alto) + 8 de la pollera que entra al piso
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const lx = i * a * (Math.abs(j) ? .82 : 1) * (Math.abs(i) && Math.abs(j) ? .92 : 1), lz = j * b * (Math.abs(i) ? .86 : 1), y = hh * (1 - .55 * (i * i + j * j) / 2) + (r() - .5) * .008;
      pos.push(cx + lx * cs - lz * sn, y, cz + lx * sn + lz * cs); const nx = i * .55, nz = j * .55, l = Math.hypot(nx, 1, nz); nor.push(nx / l, 1 / l, nz / l); col.push(...cc) }
    const ring = [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]];
    ring.forEach(([i, j]) => { const lx = i * a * 1.05, lz = j * b * 1.05; pos.push(cx + lx * cs - lz * sn, -.03, cz + lx * sn + lz * cs); const l = Math.hypot(i, .2, j); nor.push(i / l, .2 / l, j / l); col.push(cc[0] * .6, cc[1] * .6, cc[2] * .6) });
    const T = (i, j) => o + (j + 1) * 3 + (i + 1); for (const [a1, b1, c1, d1] of [[T(-1, -1), T(0, -1), T(0, 0), T(-1, 0)], [T(0, -1), T(1, -1), T(1, 0), T(0, 0)], [T(-1, 0), T(0, 0), T(0, 1), T(-1, 1)], [T(0, 0), T(1, 0), T(1, 1), T(0, 1)]]) idx.push(a1, d1, b1, b1, d1, c1);
    for (let q = 0; q < 8; q++) { const A = T(...ring[q]), B = T(...ring[(q + 1) % 8]), A2 = o + 9 + q, B2 = o + 9 + (q + 1) % 8; idx.push(A, A2, B, B, A2, B2) } };
  // filas a lo largo de z (cruzan la calle), piedras de 0,2–0,3 m, trabadas
  const fw = .25; for (let fx = 0; fx < 8; fx++) { const x = -1 + (fx + .5) * fw; let z = -1 - (fx % 2) * .14; while (z < 1) { const L = .2 + r() * .1, zz = z + L / 2; if (zz > -1 && zz < 1) piedra(x + (r() - .5) * .02, zz, fw / 2 - .018, L / 2 - .016, .06 + r() * .03); z += L } }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(pos.filter((_, i) => i % 3 !== 1).map(v => v * 1.3), 2)); g.setIndex(idx); return g })();
const M_ADOQ = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .82, map: T_ROCA.c, bumpMap: T_ROCA.z, bumpScale: 2.5 });

// ---------- piedra de los muros de contención: bloques grandes, oscuros abajo (humedad, musgo), líquenes
const M_MURO_T = (() => { const [t, z] = T_MURO(4240, ["#8a8276", "#76706a", "#9a9284", "#6a645c", "#a39a88", "#5e5a54", "#847866"], { mortero: "#46423c", escala: 1.7, musgo: 1, liquen: 90 }); return new THREE.MeshStandardMaterial({ map: t, bumpMap: z, bumpScale: 5, roughness: .95 }) })();
const M_ESCALON = new THREE.MeshStandardMaterial({ map: T_ROCA.c, bumpMap: T_ROCA.z, bumpScale: 3, roughness: .9, color: "#b2a894" });
const M_CORONA = new THREE.MeshStandardMaterial({ map: T_ROCA.c, bumpMap: T_ROCA.z, bumpScale: 3, roughness: .88, color: "#c8bea8" });

// ================= HOLLOWMERE: texturas nuevas (tablas de madera, puertas sin picaporte, rasguños de percha), reflejo nocturno, el piso
// ---------- tablas de madera solapadas (paredes de madera): tablas horizontales de ≈ 23 cm, sombra bajo cada solape, clavos, nudos,
// vetas, pintura descascarada, la parte de abajo podrida y verdosa
const T_TABLAS_H = (seed, pal, o = {}) => repT(pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(seed), nb = 14, bh = h / nb;
  c.fillStyle = "#2a2018"; c.fillRect(0, 0, w, h); z.fillStyle = "#404040"; z.fillRect(0, 0, w, h);
  for (let b = 0; b < nb; b++) { const y0 = b * bh; let x = -r() * 200; while (x < w) { const L = 260 + r() * 520, col = rgbj(pal[r() * pal.length | 0], r, 22);
      for (const dx of [-w, 0, w]) { const x0 = x + dx; c.fillStyle = col; c.fillRect(x0, y0, L - 2, bh);
        const gr = c.createLinearGradient(0, y0, 0, y0 + bh); gr.addColorStop(0, "rgba(0,0,0,.55)"); gr.addColorStop(.16, "rgba(0,0,0,.08)"); gr.addColorStop(.7, "rgba(255,240,220,.06)"); gr.addColorStop(.97, "rgba(255,240,220,.14)"); gr.addColorStop(1, "rgba(0,0,0,.4)"); c.fillStyle = gr; c.fillRect(x0, y0, L - 2, bh);
        const gz = z.createLinearGradient(0, y0, 0, y0 + bh); gz.addColorStop(0, "#303030"); gz.addColorStop(.2, "#8a8a8a"); gz.addColorStop(1, "#c8c8c8"); z.fillStyle = gz; z.fillRect(x0, y0, L - 2, bh);
        // vetas largas
        for (let k = 0; k < 7; k++) { const yy = y0 + 6 + r() * (bh - 10); c.strokeStyle = r() < .5 ? "rgba(30,20,12,.28)" : "rgba(255,235,200,.1)"; c.lineWidth = 1 + r() * 1.6; c.beginPath(); c.moveTo(x0, yy); for (let q = 0; q <= 1; q += .1) c.lineTo(x0 + q * L, yy + Math.sin(q * 9 + k) * 2.5); c.stroke() }
        if (r() < .35) { const kx = x0 + r() * L, ky = y0 + bh * (.3 + r() * .5); c.fillStyle = "rgba(40,24,14,.7)"; c.beginPath(); c.ellipse(kx, ky, 9 + r() * 8, 5 + r() * 3, 0, 0, 7); c.fill(); z.fillStyle = "#202020"; z.beginPath(); z.ellipse(kx, ky, 8, 4, 0, 0, 7); z.fill() }
        // clavos a cada extremo y en el medio (con chorrito de óxido)
        for (const q of [.02, .5, .98]) { const nx = x0 + q * L, ny = y0 + bh * .55; c.fillStyle = "#1a1612"; c.beginPath(); c.arc(nx, ny, 3, 0, 7); c.fill(); const g2 = c.createLinearGradient(0, ny, 0, ny + 40); g2.addColorStop(0, "rgba(110,50,20,.45)"); g2.addColorStop(1, "rgba(110,50,20,0)"); c.fillStyle = g2; c.fillRect(nx - 2, ny, 4, 40) }
        c.fillStyle = "rgba(10,6,4,.85)"; c.fillRect(x0 + L - 3, y0, 3, bh); z.fillStyle = "#101010"; z.fillRect(x0 + L - 4, y0, 4, bh) } x += L } }
  // pintura vieja descascarada (manchones de otro color que se salen)
  if (o.pintura) for (let k = 0; k < 120; k++) { const x = r() * w, y = r() * h, s = 10 + r() * 60; envuelto(c, w, h, () => { c.fillStyle = o.pintura; c.globalAlpha = .55 + r() * .3; c.beginPath(); for (let a = 0; a < 6.28; a += .5) { const d = s * (.5 + r() * .6); a ? c.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d * .5) : c.moveTo(x + d, y) } c.fill(); c.globalAlpha = 1 }) }
  for (let k = 0; k < 9000; k++) { c.fillStyle = r() < .5 ? "rgba(20,12,6,.14)" : "rgba(255,240,220,.07)"; c.fillRect(r() * w, r() * h, 1 + r() * 2, 1) }
  // chorreaduras de agua y hollín desde arriba, musgo abajo
  for (let k = 0; k < 26; k++) { const x = r() * w, y2 = r() * h * .5, L = 120 + r() * 400, an = 6 + r() * 26, gr = c.createLinearGradient(0, y2, 0, y2 + L); gr.addColorStop(0, "rgba(20,16,12,.32)"); gr.addColorStop(1, "rgba(20,16,12,0)"); c.fillStyle = gr; c.fillRect(x - an / 2, y2, an, L) }
  for (let k = 0; k < 500; k++) { const x = r() * w, y2 = h - Math.pow(r(), 2) * h * .3; c.fillStyle = `rgba(${50 + r() * 30 | 0},${70 + r() * 30 | 0},${34 + r() * 20 | 0},${.2 + r() * .3})`; c.beginPath(); c.arc(x, y2, 2 + r() * 6, 0, 7); c.fill() } }));
const TABLAS_P_H = [[["#4a3a2c", "#56442f", "#3e3024", "#5e4a36", "#4e3e30"], "#6a5a48"], [["#3a3a36", "#46443e", "#32302c", "#4e4a42"], "#5a6058"], [["#5a4636", "#6a5440", "#4a3a2c", "#725a44"], "#7a2e22"], [["#2e3436", "#3a4044", "#283034", "#444a4c"], "#4a5a6a"], [["#6a5a48", "#7a6852", "#5a4c3c", "#84705a"], "#8a8270"]];
const M_TABLAS_H = TABLAS_P_H.map(([p, pin], i) => { const [t, z] = T_TABLAS_H(4600 + i, p, { pintura: pin }); return new THREE.MeshStandardMaterial({ map: t, bumpMap: z, bumpScale: 5, roughness: .92 }) });
// ---------- la marca del picaporte arrancado (calcomanía transparente del tamaño de la hoja de la puerta): la sombra clara donde estaba la
// chapa, cuatro agujeros de tornillo (dos tornillos torcidos que quedaron), el agujero del vástago, astillas arrancadas, y a veces los
// RASGUÑOS largos de las perchas (tres o cuatro surcos paralelos que cruzan la hoja en diagonal, madera cruda adentro)
const T_MARCA_PUERTA = k => tex(256, 512, (g, w, h) => { const r = rng(4700 + k); g.clearRect(0, 0, w, h);
  const hx = w * .8, hy = h * .53, pw = 34, ph = 92;
  // la chapa que ya no está: madera más clara (sin sol ni mugre) con borde de mugre
  g.fillStyle = "rgba(190,160,120,.55)"; g.fillRect(hx - pw / 2, hy - ph / 2, pw, ph); g.strokeStyle = "rgba(20,12,6,.6)"; g.lineWidth = 3; g.strokeRect(hx - pw / 2, hy - ph / 2, pw, ph);
  for (const [dx, dy] of [[-.32, -.4], [.32, -.4], [-.32, .4], [.32, .4]]) { g.fillStyle = "#0a0604"; g.beginPath(); g.arc(hx + dx * pw, hy + dy * ph, 3.2, 0, 7); g.fill(); g.strokeStyle = "rgba(230,200,150,.6)"; g.lineWidth = 1.2; g.beginPath(); g.arc(hx + dx * pw, hy + dy * ph, 5, 0, 7); g.stroke() }
  // astillas arrancadas alrededor del agujero (madera cruda)
  for (let q = 0; q < 9; q++) { const a = r() * 6.283, L = 10 + r() * 22; g.fillStyle = "rgba(220,186,130,.85)"; g.beginPath(); g.moveTo(hx + Math.cos(a) * 9, hy + Math.sin(a) * 9); g.lineTo(hx + Math.cos(a + .18) * (9 + L), hy + Math.sin(a + .18) * (9 + L)); g.lineTo(hx + Math.cos(a - .1) * (8 + L * .7), hy + Math.sin(a - .1) * (8 + L * .7)); g.fill() }
  g.fillStyle = "#000"; g.beginPath(); for (let a = 0; a <= 6.3; a += .5) { const d = 8 + r() * 3; a ? g.lineTo(hx + Math.cos(a) * d, hy + Math.sin(a) * d) : g.moveTo(hx + d, hy) } g.fill();
  // el ojo de la cerradura (vacío) más abajo
  g.fillStyle = "#050302"; g.beginPath(); g.arc(hx, hy + 30, 3.5, 0, 7); g.fill(); g.fillRect(hx - 1.5, hy + 30, 3, 9);
  // golpes de martillo y marcas de palanca
  for (let q = 0; q < 6; q++) { g.strokeStyle = "rgba(30,18,10,.6)"; g.lineWidth = 2; const x = hx + (r() - .5) * 60, y = hy + (r() - .5) * 120; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 14, y + (r() - .5) * 6); g.stroke() }
  // rasguños de percha (tres de cada cuatro puertas)
  if (k % 4 !== 3) { const n = 3 + (k % 2), x0 = w * (.12 + r() * .25), y0 = h * (.12 + r() * .2), L = h * (.55 + r() * .3);
    for (let q = 0; q < n; q++) { const ox = q * 13, oy = q * 5; g.lineCap = "round";
      const P = t => [x0 + ox + t * L * (.1 + (k % 3) * .06), y0 + oy + t * L];
      g.strokeStyle = "rgba(10,6,3,.9)"; g.lineWidth = 6; g.beginPath(); for (let t = 0; t <= 1; t += .05) { const [x, y] = P(t); const jit = Math.sin(t * 40 + q) * 1.2; t ? g.lineTo(x + jit, y) : g.moveTo(x, y) } g.stroke();
      g.strokeStyle = "rgba(226,196,150,.9)"; g.lineWidth = 2.2; g.beginPath(); for (let t = .03; t <= .97; t += .05) { const [x, y] = P(t); t > .04 ? g.lineTo(x + .6, y - .6) : g.moveTo(x + .6, y - .6) } g.stroke() } } });
const M_MARCA_PUERTA = [0, 1, 2, 3, 4, 5].map(k => new THREE.MeshStandardMaterial({ map: T_MARCA_PUERTA(k), transparent: true, alphaTest: .02, roughness: .85, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
// ---------- reflejo nocturno (charcos, adoquines mojados, vidrios): cielo azul oscuro, la luna (oeste-noroeste) y puntitos cálidos de ventanas abajo
const LUNA_DIR = new THREE.Vector3(-.6, .38, -.25).normalize();
const ENV_NOCHE_P = (() => { const es = new THREE.Scene(); es.add(new THREE.Mesh(new THREE.SphereGeometry(50, 64, 32), new THREE.ShaderMaterial({ side: THREE.BackSide, uniforms: { uL: { value: LUNA_DIR } },
    vertexShader: "varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
    fragmentShader: `uniform vec3 uL; varying vec3 vD; float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main(){ float y = vD.y; vec3 c = mix(vec3(.16,.2,.32), vec3(.012,.02,.05), smoothstep(0., .5, y)); c = mix(c, vec3(.02,.018,.016), smoothstep(.0, -.25, y));
        float m = max(dot(vD, uL), 0.); c += vec3(.75,.82,1.) * (pow(m, 900.) * 18. + pow(m, 40.) * .35 + pow(m, 6.) * .05);
        vec2 q = vec2(atan(vD.z, vD.x) * 40., y * 90.); float w = step(.86, h(floor(q))) * smoothstep(.14, .0, abs(y - .03)); c += vec3(1., .55, .18) * w * 3.; gl_FragColor = vec4(c, 1.); }` })));
  const pm = new THREE.PMREMGenerator(R), rt = pm.fromScene(es, 0, .1, 100); pm.dispose(); return rt.texture })();
M_VIDRIO.envMap = ENV_NOCHE_P; M_VIDRIO.envMapIntensity = 1.2; M_VENTANA.envMap = ENV_NOCHE_P; M_VENTANA.envMapIntensity = .8;
// ---------- color del piso por vértice: barro oscuro y tierra apisonada en el pueblo, pasto ralo en los patios, pasto alto y oscuro afuera y en
// la colina, el sendero pelado, juntas oscuras bajo el empedrado
const C_BARRO = linC("#4a3e30"), C_BARRO2 = linC("#3a3026"), C_JUNTA = linC("#2a2622"), C_RALO = linC("#55603a"), C_RALO2 = linC("#6c6c44"), C_PASTO = linC("#3e5430"), C_PASTO2 = linC("#56683a"),
  C_SECO = linC("#7a7048"), C_SENDERO = linC("#6a5a44"), C_MUSGO = linC("#38482a");
function colorSueloT(x, z) { const n = fbm2(x * .045 + 11, z * .045 + 2, 4), n2 = fbm2(x * .27 + 5, z * .27 + 8, 2), n3 = fbm2(x * .09 - 3, z * .09 + 7, 3), r = Math.hypot(x * .92, (z + 12) * 1.05);
  let c = mix3(C_BARRO, C_BARRO2, sst(.35, .7, n));
  c = mix3(c, mix3(C_RALO, C_RALO2, n2), sst(.42, .62, n3) * .85);
  const af = Math.max(sst(34, 62, r), 1 - sst(30, 48, Math.hypot(x - COLINA_T[0], z - COLINA_T[1]))); if (af > 0) c = mix3(c, mix3(mix3(C_PASTO, C_PASTO2, n2), C_SECO, sst(.55, .8, n3) * .6), af);
  const ds = distSendero(x, z); c = mix3(c, C_SENDERO, (1 - sst(.8, 1.8, ds + (n2 - .5) * .8)) * .9);
  c = mix3(c, C_JUNTA, calleKT(x, z) * .9);
  const s = .86 + .24 * n2; return [c[0] * s, c[1] * s, c[2] * s] }
// ---------- la malla del piso: grilla de 1 m en el pueblo y la colina, más gruesa afuera (lejos sigue con _lejos_tej.js desde r ≈ 240)
const TERRENO = (() => { const xs = [], zs = []; for (let x = -250; x < -84; x += 4) xs.push(x); for (let x = -84; x <= 128; x += 1) xs.push(x); for (let x = 132; x <= 250; x += 4) xs.push(x);
  for (let z = -250; z < -122; z += 4) zs.push(z); for (let z = -122; z <= 96; z += 1) zs.push(z); for (let z = 100; z <= 250; z += 4) zs.push(z);
  const nx = xs.length, nz = zs.length, n = nx * nz, pos = new Float32Array(n * 3), uv = new Float32Array(n * 2), col = new Float32Array(n * 3), idx = [];
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const x = xs[i], z = zs[j], k = j * nx + i, c = colorSueloT(x, z); pos[k * 3] = x; pos[k * 3 + 1] = SUELO(x, z) - .01; pos[k * 3 + 2] = z; uv[k * 2] = x / 6; uv[k * 2 + 1] = z / 6; col[k * 3] = c[0]; col[k * 3 + 1] = c[1]; col[k * 3 + 2] = c[2] }
  for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) { const a = j * nx + i, b = a + nx; idx.push(a, b, a + 1, a + 1, b, b + 1) }
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); geo.setAttribute("color", new THREE.BufferAttribute(col, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, M_TIERRA); m.receiveShadow = true; scene.add(m); return m })();
if (typeof AGUA !== "undefined") AGUA.visible = false;
// ---------- el empedrado: calcomanía (calle principal, calle transversal, plaza) + ADOQUINES EN 3D (parches de 2 × 2 m instanciados), mojados
M_ADOQ.envMap = ENV_NOCHE_P; M_ADOQ.envMapIntensity = .55; M_ADOQ.roughness = .42; M_ADOQ_D.envMap = ENV_NOCHE_P; M_ADOQ_D.envMapIntensity = .35; M_ADOQ_D.roughness = .55;
const planoSuelo = (x0, x1, z0, z1, paso, dy, mat, ro = -.2, uvS = 3) => { const nx = Math.max(1, Math.round((x1 - x0) / paso)), nz = Math.max(1, Math.round((z1 - z0) / paso)), g = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, nz); g.rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
  const p = g.attributes.position, u = g.attributes.uv; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, SUELO(x, z) + dy); u.setXY(i, x / uvS, z / uvS) } g.computeVertexNormals(); const m = new THREE.Mesh(g, mat); m.receiveShadow = true; m.renderOrder = ro; scene.add(m); return m };
planoSuelo(-CALLE_T.an / 2, CALLE_T.an / 2, CALLE_T.z0, CALLE_T.z1, 1, .015, M_ADOQ_D);
planoSuelo(CRUCE_T.x0, -CALLE_T.fachada, CRUCE_T.z - CRUCE_T.an / 2, CRUCE_T.z + CRUCE_T.an / 2, 1, .016, M_ADOQ_D); planoSuelo(CALLE_T.fachada, CRUCE_T.x1, CRUCE_T.z - CRUCE_T.an / 2, CRUCE_T.z + CRUCE_T.an / 2, 1, .016, M_ADOQ_D);
planoSuelo(PLAZA_T.x - PLAZA_T.w / 2, PLAZA_T.x + PLAZA_T.w / 2, PLAZA_T.z - PLAZA_T.d / 2, PLAZA_T.z + PLAZA_T.d / 2, 1, .017, M_ADOQ_D);
// veredas de losas de piedra entre el cordón y las fachadas
const T_LOSAS = (() => { const [c, z] = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(4720); c.fillStyle = "#2a2622"; c.fillRect(0, 0, w, h); z.fillStyle = "#101010"; z.fillRect(0, 0, w, h); let y = 0;
    while (y < h) { const fh = 110 + r() * 60; let x = -r() * 80; while (x < w + 80) { const sw = 120 + r() * 140, col = rgbj(["#6e685e", "#5e5850", "#7a746a", "#66605a", "#58534c"][r() * 5 | 0], r, 18), v = 150 + r() * 70 | 0, P = [[x + 3, y + 3], [x + sw - 3, y + 2 + (r() - .5) * 4], [x + sw - 3, y + fh - 3], [x + 4, y + fh - 3]];
        for (const dx of [-w, 0, w]) { const Q = P.map(([a, b]) => [a + dx, b]); redondo(c, Q, 8); c.fillStyle = col; c.fill(); redondo(z, Q, 8); z.fillStyle = `rgb(${v},${v},${v})`; z.fill() }
        if (r() < .25) { c.strokeStyle = "rgba(20,16,12,.7)"; c.lineWidth = 2; c.beginPath(); c.moveTo(x + r() * sw, y); c.lineTo(x + r() * sw, y + fh); c.stroke() } x += sw } y += fh }
    for (let k = 0; k < 5000; k++) { c.fillStyle = r() < .5 ? "rgba(20,16,12,.18)" : "rgba(230,220,200,.08)"; c.fillRect(r() * w, r() * h, 2, 2) }
    for (let k = 0; k < 80; k++) { c.fillStyle = `rgba(${60 + r() * 20 | 0},${80 + r() * 20 | 0},40,.35)`; c.beginPath(); c.arc(r() * w, r() * h, 2 + r() * 5, 0, 7); c.fill() } });
  [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
const M_LOSAS = new THREE.MeshStandardMaterial({ map: T_LOSAS.c, bumpMap: T_LOSAS.z, bumpScale: 4, roughness: .6, envMap: ENV_NOCHE_P, envMapIntensity: .35, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
for (const s of [-1, 1]) { const a = s * CALLE_T.an / 2 + s * .28, b = s * (CALLE_T.fachada + .2); planoSuelo(Math.min(a, b), Math.max(a, b), CALLE_T.z0 + 1, CALLE_T.z1, 1, .1, M_LOSAS, -.2, 2.2) }
const ADOQUINES = []; { const L = [], cc = new THREE.Color();
  for (let z = CALLE_T.z0 + 1; z < CALLE_T.z1 - .5; z += 2) for (let x = -CALLE_T.an / 2 + 1.25; x < CALLE_T.an / 2 - .6; x += 2) L.push([x, z, Math.PI / 2]);
  for (let x = PLAZA_T.x - PLAZA_T.w / 2 + 1; x < PLAZA_T.x + PLAZA_T.w / 2 - .5; x += 2) for (let z = PLAZA_T.z - PLAZA_T.d / 2 + 1; z < PLAZA_T.z + PLAZA_T.d / 2 - .5; z += 2) { if (enEmpedrado(x, z, .5)) continue; L.push([x, z, 0]) }
  for (let x = CRUCE_T.x0 + 1; x < CRUCE_T.x1 - 2; x += 2) { if (Math.abs(x) < CALLE_T.fachada + .9) continue; for (let z = CRUCE_T.z - CRUCE_T.an / 2 + 1; z < CRUCE_T.z + CRUCE_T.an / 2 - .5; z += 2) L.push([x, z, 0]) }
  const m = new THREE.InstancedMesh(GEO_ADOQ, M_ADOQ, L.length); L.forEach(([x, z, ry], i) => { const n = sueloN(x, z, 1); dummy.position.set(x, SUELO(x, z) + .005, z); dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...n)); dummy.rotateY(ry + (i % 2) * Math.PI); dummy.scale.set(1, .9 + hash2(x * 7, z * 3) * .25, 1); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); const v = .62 + hash2(x, z) * .22; m.setColorAt(i, cc.setRGB(v, v * .98, v * .97)) });
  m.receiveShadow = true; m.castShadow = false; scene.add(m); ADOQUINES.push(m) }
// cordones de piedra a lo largo de la calle (bloques largos irregulares) y canaleta
const L_PIEDRA = lote();
{ const r = rng(4730); for (const s of [-1, 1]) { let z = CALLE_T.z0 + 1; while (z < CALLE_T.z1 - .3) { const L = .8 + r() * .9; if (!(Math.abs(z + L / 2 - CRUCE_T.z) < CRUCE_T.an / 2)) L_PIEDRA.add("corona", RB1(.3, .26, L - .03, .04), TM(s * (CALLE_T.an / 2 + .14), SUELO(s * 5.1, z) + .02, z + L / 2, 0, (r() - .5) * .03, (r() - .5) * .04)); z += L } } }

// ---------- registro de lo ocupado (para que la utilería no se pise con las casas)
const OCUP = [], RECTS = [], GRILLA_O = new Map(), CELDA_O = 6, PAD_O = 2.5;   // grilla espacial (las búsquedas miran solo su celda)
const enRect = (R, x, z, m = 0) => { const c = Math.cos(R.ry), s = Math.sin(R.ry), dx = x - R.x, dz = z - R.z, lx = dx * c - dz * s, lz = dx * s + dz * c; return Math.abs(lx) < R.w / 2 + m && Math.abs(lz) < R.d / 2 + m };
const enGrilla = (it, x, z, rr) => { const a = Math.floor((x - rr) / CELDA_O), b = Math.floor((x + rr) / CELDA_O), c = Math.floor((z - rr) / CELDA_O), d = Math.floor((z + rr) / CELDA_O); for (let i = a; i <= b; i++) for (let j = c; j <= d; j++) { const k = i * 100003 + j; (GRILLA_O.get(k) || GRILLA_O.set(k, []).get(k)).push(it) } };
const rectAdd = R => { RECTS.push(R); R.rect = 1; enGrilla(R, R.x, R.z, Math.hypot(R.w, R.d) / 2 + PAD_O) };
const zonaLibre = (x, z, r = 0) => enCalle(x, z, r - .3);   // calles, plaza y fuente (la utilería suelta no va ahí salvo o.zona)
const libreEn = (x, z, r = .5, o = {}) => { if (!o.zona && zonaLibre(x, z, r)) return false; const L = GRILLA_O.get(Math.floor(x / CELDA_O) * 100003 + Math.floor(z / CELDA_O)); if (!L) return true;
  for (const q of L) { if (q.rect) { if (q !== o.salvo && enRect(q, x, z, r + (o.mc ?? .1))) return false } else if (Math.hypot(x - q.x, z - q.z) < r + q.r) return false } return true };
const ocupa = (x, z, r) => { const q = { x, z, r }; OCUP.push(q); enGrilla(q, x, z, r + PAD_O); return true };
// ---------- LAS CASAS: piedra, ladrillo o revoque (a veces piso de arriba con entramado), techo a dos aguas de pizarra o tejas (cumbrera a lo largo
// de la calle o con el frontón a la calle), chimenea con cañones de barro, canaletas y caños de lata, puerta con escalón, ventanas con postigos.
// `simple`: casas lejanas (solo volúmenes, techo, chimenea, huecos oscuros). Todo va a lotes (pocas llamadas de dibujo).
const L_CASA = lote(), L_LEJOS = lote(), CASAS_P = [], HUMOS = [], VELAS_B = [], MACETAS_B = [];   // VELAS_B: { p: [x, y, z], h, g (grupo: 0 ventanas, 1 tienda, 2 plaza/fuente, 3 casa de Nell, 4 faroles) }
const CASA_MATS = { zocalo: M_ZOCALO, revoque: M_REVOQUE, piedraC: M_PIEDRA_C, madera: M_MADERA, maderaV: M_MADERA_V, viga: M_VIGA, vidrio: M_VIDRIO, oscuro: M_OSCURO, hierro: M_HIERRO, hierroO: M_HIERRO_O, terracota: M_TERRACOTA, roca: M_ROCA_G, soga: M_SOGA, chapa: M_CHAPA, sillarC: M_SILLAR_C, blanco: M_BLANCO_P, laton: M_LATON,
  luz: new THREE.MeshStandardMaterial({ color: "#ffe0a0", emissive: "#ffb850", emissiveIntensity: 1.3, roughness: .4 }), ventana: M_VENTANA, vidrioC: M_VIDRIO_C, hollin: M_HOLLIN, muroT: M_MURO_T, corona: M_CORONA };
M_MURO.forEach((m, i) => CASA_MATS["muro" + i] = m); M_LAD.forEach((m, i) => CASA_MATS["lad" + i] = m); M_REV.forEach((m, i) => CASA_MATS["rev" + i] = m); M_PIZ.forEach((m, i) => CASA_MATS["piz" + i] = m); M_TEJA.forEach((m, i) => CASA_MATS["teja" + i] = m); M_PUERTA.forEach((m, i) => CASA_MATS["col" + i] = m);
const ventanaPiezas = (add, M, an, al, r, col, o = {}) => {   // M = matriz en la cara (origen al pie de la ventana, +z hacia afuera)
  add(o.vidrio || "ventana", new THREE.PlaneGeometry(an, al), M.clone().multiply(TM(0, al / 2, .02)));
  if (o.simple) { add("piedraC", RB1(an + .3, .1, .2, .03), M.clone().multiply(TM(0, -.05, .06))); return }
  const mk2 = o.blanco ? "blanco" : "madera";
  for (const s of [-1, 1]) add(mk2, new THREE.BoxGeometry(.08, al + .08, .1), M.clone().multiply(TM(s * (an / 2 + .02), al / 2, .04)));
  for (const yy of [0, al]) add(mk2, new THREE.BoxGeometry(an + .12, .08, .1), M.clone().multiply(TM(0, yy, .04)));
  add(mk2, new THREE.BoxGeometry(.05, al, .05), M.clone().multiply(TM(0, al / 2, .05))); add(mk2, new THREE.BoxGeometry(an, .05, .05), M.clone().multiply(TM(0, al * .55, .05)));
  add("piedraC", RB1(an + .36, .1, .26, .03), M.clone().multiply(TM(0, -.06, .1))); add("piedraC", RB1(an + .4, .2, .14, .03), M.clone().multiply(TM(0, al + .14, .05)));
  if (o.sinPostigo) return;
  const ce = o.cerrado ?? r() < .2; for (const s of [-1, 1]) { const ang = ce ? 0 : s * (Math.PI - .12), hm = M.clone().multiply(TM(s * (an / 2 + .06), al / 2, .09, 0, ang, 0)); add(col, new THREE.BoxGeometry(an / 2 + .02, al + .04, .05), hm.clone().multiply(TM(-s * (an / 4 + .01), 0, 0)));
    for (const yy of [-al * .32, al * .32]) add("madera", new THREE.BoxGeometry(an / 2 - .04, .07, .03), hm.clone().multiply(TM(-s * (an / 4), yy, ce ? .04 : -.04))) } };
// casaP(x, z, ry, w, d, h, seed, o): frente hacia +z local (ry = 0 mira al sur, ry = π mira al norte); h = altura del alero
// o: { muro: "muro0".."lad2".."rev5"|"sillarC", techo: "piz0".."teja2", frontal (frontón a la calle), dos (entramado arriba), simple, L (lote), chimMax, chimSep, pendiente, mansion, puertaX, color }
function casaP(x, z, ry, w, d, h, seed, o = {}) { const r = rng(seed), cs = Math.cos(ry), sn = Math.sin(ry), simple = !!o.simple, L = o.L || (simple ? L_LEJOS : L_CASA);
  const y0 = o.y0 ?? Math.min(SUELO(x, z), ...[[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([a, b]) => SUELO(x + (a * w / 2) * cs + (b * d / 2) * sn, z - (a * w / 2) * sn + (b * d / 2) * cs))) - .06;
  const HM = o.HM || TM(x, y0, z, 0, ry, 0), add = (k, g, m) => L.add(k, g, m ? HM.clone().multiply(m) : HM.clone()), W = (lx, ly, lz) => new THREE.Vector3(lx, ly, lz).applyMatrix4(HM);
  const mu = o.muro ?? (r() < .42 ? "muro" + (r() * M_MURO.length | 0) : r() < .72 ? "tabla" + (r() * M_TABLAS_H.length | 0) : r() < .6 ? "lad" + (r() * M_LAD.length | 0) : "rev" + (r() * M_REV.length | 0)), dos = !simple && (o.dos ?? (mu.startsWith("muro") && r() < .6)), hs = dos ? 2.9 : h;
  const techo = o.techo ?? (r() < .78 ? "piz" + (r() * 3 | 0) : "teja" + (r() * 3 | 0)), col = "col" + (o.color ?? (r() * M_PUERTA.length | 0)), frontal = !!o.frontal;
  // zócalo y muros
  if (!o.sinZocalo) add("zocalo", uvMuro(new THREE.BoxGeometry(w + .2, 1.4, d + .2), 3.2), TM(0, -.45, 0));
  if (o.hueco) { if (hs - o.hueco > .01) add(mu, uvMuro(new THREE.BoxGeometry(w, hs - o.hueco, d), 3.2, r(), r()), TM(0, o.hueco + (hs - o.hueco) / 2, 0)) }
  else add(mu, uvMuro(new THREE.BoxGeometry(w, hs, d), 3.2, r(), r()), TM(0, hs / 2, 0));
  if (dos) { const hu = h - hs, rv = r() < .65 ? "tabla" + (r() * M_TABLAS_H.length | 0) : "rev" + (r() * M_REV.length | 0); add(rv, uvMuro(new THREE.BoxGeometry(w + .2, hu, d + .2), 3.4, r(), r()), TM(0, hs + hu / 2, 0));
    const cara = (L2, M) => { add("viga", new THREE.BoxGeometry(L2 + .1, .16, .1), M.clone().multiply(TM(0, .08, 0))); add("viga", new THREE.BoxGeometry(L2 + .1, .16, .1), M.clone().multiply(TM(0, hu - .08, 0))); const n = Math.max(2, Math.round(L2 / 1.25));
      for (let k = 0; k <= n; k++) { const xx = lerp(-L2 / 2 + .06, L2 / 2 - .06, k / n); add("viga", new THREE.BoxGeometry(.15, hu, .1), M.clone().multiply(TM(xx, hu / 2, 0))); if (k < n && k % 2 === 0) { const x2 = lerp(-L2 / 2 + .06, L2 / 2 - .06, (k + 1) / n), [g, m] = cilEntre([xx, .1, 0], [x2, hu - .1, 0], .06, 4); add("viga", g, M.clone().multiply(m)) } } };
    cara(w + .2, TM(0, hs, d / 2 + .15)); cara(w + .2, TM(0, hs, -d / 2 - .15, 0, Math.PI, 0)); cara(d + .2, TM(w / 2 + .15, hs, 0, 0, Math.PI / 2, 0)); cara(d + .2, TM(-w / 2 - .15, hs, 0, 0, -Math.PI / 2, 0)) }
  if (!simple) {
    // esquineras (piedra clara) y cornisa entre pisos
    if (mu.startsWith("tabla") && !o.sinEsquinas) for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) add("viga", new THREE.BoxGeometry(.16, hs, .16), TM(sx * (w / 2 + .02), hs / 2, sz * (d / 2 + .02)));
    if ((!mu.startsWith("rev") && !mu.startsWith("tabla") || o.mansion) && !o.sinEsquinas) for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) for (let yy = .25, k = 0; yy < hs - .2; yy += .44, k++) { const la = k % 2 ? .62 : .38; add(o.mansion ? "blanco" : "piedraC", RB1(.1 + la * (k % 2 ? 1 : .1), .38, .1 + la * (k % 2 ? .1 : 1), .04), TM(sx * (w / 2 + .015) - sx * la * (k % 2 ? .5 : 0), yy, sz * (d / 2 + .015) - sz * la * (k % 2 ? 0 : .5))) }
    for (let yy = 2.95; yy < h - 1; yy += 2.9) add(o.mansion ? "blanco" : (o.sinEsquinas || mu.startsWith("tabla")) ? "viga" : "piedraC", RB1(w + .16, .16, d + .16, .03), TM(0, yy, 0));
  }
  // ---- el techo (en el «marco del techo» la cumbrera va a lo largo de X y el ancho a lo largo de Z; frontal: girado 90°)
  const span = frontal ? w : d, len = frontal ? d : w, RM = frontal ? TM(0, 0, 0, 0, Math.PI / 2, 0) : new THREE.Matrix4(), addR = (k, g, m) => add(k, g, RM.clone().multiply(m || new THREE.Matrix4()));
  const ang = (o.pendiente ?? (40 + r() * 12)) * Math.PI / 180, ovx = .35, ovz = .45, rh = span / 2 * Math.tan(ang), ye = h - ovz * Math.tan(ang), S = (span / 2 + ovz) / Math.cos(ang), Lt = len + 2 * ovx;
  { const sh = new THREE.Shape(); sh.moveTo(-span / 2, 0); sh.lineTo(span / 2, 0); sh.lineTo(0, rh); sh.closePath(); const gp = new THREE.ExtrudeGeometry(sh, { depth: len, bevelEnabled: false }); gp.rotateY(Math.PI / 2); gp.translate(-len / 2, 0, 0); addR(dos ? "rev" + (seed % M_REV.length) : mu, uvMuro(gp, 3.2, r(), .3), TM(0, h, 0)) }
  const tk = techo.startsWith("piz") ? 4.4 : 3.4;
  for (const s of [1, -1]) { const g = new THREE.BoxGeometry(Lt, .17, S); geoUV(g, px => px / tk, (px, py, pz) => -pz / tk); const ym = h + rh + .1 - (span / 2 + ovz) * Math.tan(ang) / 2, zm = s * (span / 2 + ovz) / 2;
    addR(techo, g, TM(0, ym, zm, ang, s > 0 ? 0 : Math.PI, 0));
    if (!simple) { for (const sx of [-1, 1]) addR("madera", new THREE.BoxGeometry(.06, .3, S + .04), TM(sx * (Lt / 2 + .02), ym - .06, zm, ang, s > 0 ? 0 : Math.PI, 0));
      // canaleta de lata y caño de bajada
      addR("hierroO", new THREE.CylinderGeometry(.08, .08, Lt - .1, 8, 1, true, 0, Math.PI), TM(0, ye - .06, s * (span / 2 + ovz - .02), Math.PI / 2, 0, Math.PI / 2));
      if (r() < .7) { const xp = (r() < .5 ? -1 : 1) * (len / 2 - .25); addR("hierroO", new THREE.CylinderGeometry(.05, .05, ye - .1, 6), TM(xp, (ye - .1) / 2, s * (span / 2 + .08))); addR("hierroO", new THREE.CylinderGeometry(.05, .05, .5, 6), TM(xp, ye - .2, s * (span / 2 + .25), Math.PI / 4 * s, 0, 0)) }
      // parches: chapa clavada sobre las tejas rotas (casas pobres), o una fila de tejas nuevas
      if (o.parches && r() < .55) { const pw = .9 + r() * 1.4, pl = .8 + r() * 1.2, u = .25 + r() * .5, xx = (r() - .5) * (len - pw - .6); addR(r() < .7 ? "chapa" : techo === "piz0" ? "piz1" : "piz0", new THREE.BoxGeometry(pw, .03, pl), TM(0, ym, zm, ang, s > 0 ? 0 : Math.PI, 0).multiply(TM(xx, .1, (u - .5) * S))) } } }
  addR(techo.startsWith("teja") ? "terracota" : "zocalo", new THREE.CylinderGeometry(.15, .15, Lt + .1, 8), TM(0, h + rh + .15, 0, 0, 0, Math.PI / 2));
  // buhardilla (mansiones y algunas casas de dos pisos): ventanita con techito sobre el faldón del frente
  if (!simple && (o.mansion || (!frontal && w > 5.4 && r() < .35))) { const nb = o.mansion ? Math.max(2, Math.floor(len / 3.6)) : 1; for (let k = 0; k < nb; k++) { const xx = nb > 1 ? lerp(-len / 2 + 1.6, len / 2 - 1.6, k / (nb - 1)) : (r() - .5) * (len - 2.4), u = .42, zz = span / 2 * (1 - u) * 1, yb = h + rh * u;
      addR(mu.startsWith("rev") || o.mansion ? (o.mansion ? "sillarC" : mu) : "revoque", uvMuro(new THREE.BoxGeometry(1.2, 1.3, 1.4), 2.4), TM(xx, yb + .45, zz + .1)); ventanaPiezas(addR, TM(xx, yb + .15, zz + .82), .66, .78, r, col, { sinPostigo: 1, blanco: o.mansion });
      for (const s2 of [-1, 1]) addR(techo, new THREE.BoxGeometry(.95, .08, 1.75), TM(xx + s2 * .38, yb + 1.33, zz + .15, 0, 0, s2 * -.62)) } }
  // ---- la chimenea (en un extremo de la cumbrera); chimSep = va aparte para poder inclinarla (techosRajan)
  const sxc = o.chimX ?? (r() < .5 ? 1 : -1), cxr = sxc * (len / 2 - .6), czr = (r() - .5) * span * .15, ytop0 = h + rh + .9 + r() * .7, chMax = o.chimMax ?? 99, ctop = Math.min(ytop0, chMax), chW = .72 + r() * .2;
  const chimeneaPartes = (A, M0) => { A(mu.startsWith("rev") || mu.startsWith("tabla") ? "muro" + (seed % M_MURO.length) : mu, uvMuro(new THREE.BoxGeometry(chW, ctop - h + .3, chW * .9), 2.4), M0.clone().multiply(TM(0, (ctop - h + .3) / 2, 0)));
    if (simple) return; A("piedraC", RB1(chW + .18, .12, chW * .9 + .18, .03), M0.clone().multiply(TM(0, ctop - h + .36, 0)));
    for (const s of [-1, 1]) { A("terracota", new THREE.CylinderGeometry(.1, .12, .36, 10, 1, true), M0.clone().multiply(TM(s * chW * .24, ctop - h + .6, 0))); A("oscuro", new THREE.CircleGeometry(.09, 10), M0.clone().multiply(TM(s * chW * .24, ctop - h + .77, 0, -Math.PI / 2))) } };
  const chM = RM.clone().multiply(TM(cxr, h - .3, czr));   // base de la chimenea (dentro del ático), en coordenadas de la casa
  let chimG = null;
  if (o.chimSep) { const CL = lote(), base = W(...new THREE.Vector3(cxr, h + rh * (1 - Math.abs(czr) / (span / 2)) - .15, czr).applyMatrix4(RM).toArray()), Minv = new THREE.Matrix4().makeTranslation(-base.x, -base.y, -base.z);
    chimeneaPartes((k, g, m) => CL.add(k, g, Minv.clone().multiply(HM).multiply(m)), chM); chimG = { L: CL, base, ry } }
  else chimeneaPartes(add, chM);
  const chimTop = W(...new THREE.Vector3(cxr, ctop + .75, czr).applyMatrix4(RM).toArray()); HUMOS.push(chimTop);
  // ---- la puerta (al frente), con jambas, dintel y escalón; mansiones: puerta doble con pórtico de columnas
  const px = o.puertaX ?? (r() - .5) * Math.max(0, w - 3.4), dw = o.mansion ? 1.8 : 1.05, dh = o.mansion ? 2.7 : 2.1; const F = TM(px, 0, d / 2);
  if (o.sinPuerta) { }
  else if (simple) add("oscuro", new THREE.PlaneGeometry(dw, dh), F.clone().multiply(TM(0, dh / 2, .02)));
  else { add("piedraC", RB1(dw + .5, .26, .2, .03), F.clone().multiply(TM(0, dh + .13, .06))); for (const s of [-1, 1]) add("piedraC", RB1(.22, dh, .16, .03), F.clone().multiply(TM(s * (dw / 2 + .11), dh / 2, .05)));
    add("oscuro", new THREE.PlaneGeometry(dw, dh), F.clone().multiply(TM(0, dh / 2, .01)));
    // la hoja: SIN picaporte (marca de la chapa arrancada, tornillos, agujero, rasguños de percha; a veces tablas clavadas); o.picaporte = la de Crane; o.sinHoja = la pone el detalle (se abre)
    if (!o.sinHoja) { if (o.mansion) for (const s of [-1, 1]) add(col, new THREE.BoxGeometry(dw / 2 - .03, dh - .03, .07), F.clone().multiply(TM(s * dw / 4, dh / 2, .04)));
      else hojaSinPicaporte({ add: (k, g, m) => add(k, g, m) }, F.clone().multiply(TM(0, 0, .04)), dw, dh, col, seed, { tablas: o.tablas ?? r() < .12 });
      if (o.picaporte) picaportePiezas(add, F.clone().multiply(TM(dw / 2 - .2, dh * .47, .08))) }
    add("piedraC", RB1(dw + .7, .16, .62, .05), F.clone().multiply(TM(0, .02, .3)));
    if (o.mansion) { for (let k = 0; k < 3; k++) add("blanco", RB1(dw + 2.4 - k * .4, .18, 1.6 - k * .4, .03), F.clone().multiply(TM(0, .09 + k * .18 - .1, 1.1 - k * .2)));
      for (const s of [-1, 1]) for (const s2 of [.6, 1.4]) { add("blanco", new THREE.CylinderGeometry(.16, .19, dh + .9, 14), F.clone().multiply(TM(s * (dw / 2 + s2), (dh + .9) / 2 + .2, 1.25))); add("blanco", RB1(.5, .18, .5, .03), F.clone().multiply(TM(s * (dw / 2 + s2), dh + 1.15, 1.25))) }
      add("blanco", RB1(dw + 4, .35, 1.9, .04), F.clone().multiply(TM(0, dh + 1.42, .95))); const sh = new THREE.Shape(); sh.moveTo(-(dw / 2 + 2.05), 0); sh.lineTo(dw / 2 + 2.05, 0); sh.lineTo(0, 1.1); sh.closePath(); const gp = new THREE.ExtrudeGeometry(sh, { depth: 1.9, bevelEnabled: false }); add("blanco", gp, F.clone().multiply(TM(0, dh + 1.6, 0))) } }
  // ---- ventanas: por piso, al frente y atrás; en los costados si la casa es exenta; en el frontón si es frontal
  const pisos = []; for (let yy = 0; yy + 2.4 < h; yy += 2.9) pisos.push(yy);
  const vents = [], va = o.mansion ? 1.05 : .92, vh = o.mansion ? 1.6 : 1.1;
  pisos.forEach((yy, pi) => { const vy = yy + (pi === 0 ? 1.0 : .85); const n = Math.max(1, Math.floor((w - .6) / (o.mansion ? 2.1 : 1.8)));
    for (let k = 0; k < n; k++) { const vx = n === 1 ? (pi === 0 ? px + (px > 0 ? -1 : 1) * (dw / 2 + .9) : 0) : lerp(-w / 2 + w / (2 * n), w / 2 - w / (2 * n), k / (n - 1));
      if (pi === 0 && Math.abs(vx - px) < dw / 2 + .65) continue; if (Math.abs(vx) + va / 2 + .25 > w / 2) continue; vents.push([TM(vx, vy, d / 2 + (dos && yy >= hs - .1 ? .1 : 0)), va]);
      if (r() < .75) vents.push([TM(-vx + (r() - .5) * .3, vy, -d / 2 - (dos && yy >= hs - .1 ? .1 : 0), 0, Math.PI, 0), va]) }
    if (o.exenta) for (const s of [-1, 1]) for (let k = 0; k < Math.floor(d / 2.4); k++) vents.push([TM(s * w / 2, vy, lerp(-d / 2 + 1.3, d / 2 - 1.3, Math.floor(d / 2.4) > 1 ? k / (Math.floor(d / 2.4) - 1) : .5), 0, s * Math.PI / 2, 0), va]) });
  if (frontal) vents.push([TM(0, h + .35, d / 2), .7]);
  vents.forEach(([M, an], vi) => { const piso = Math.round((M.elements[13] - .9) / 2.9), frente = M.elements[14] > 0, balcon = !simple && !o.sinBalcon && piso >= 1 && frente && r() < (o.balcones ?? .28);
    if (o.sinPiso0 && piso === 0) return;
    ventanaPiezas(add, M, an, vh, r, col, { simple, blanco: o.mansion, sinPostigo: o.mansion || balcon, vidrio: o.vidrio });
    if (balcon) { const B = M.clone().multiply(TM(0, -.82, 0)), bw = an + 1.1; add("piedraC", RB1(bw, .14, .78, .03), B.clone().multiply(TM(0, 0, .36)));
      for (const s2 of [-1, 1]) for (let q = 0; q < 3; q++) add("piedraC", RB1(.14, .16, .62 - q * .17, .02), B.clone().multiply(TM(s2 * (bw / 2 - .22), -.14 - q * .14, .38 - q * .085)));
      add("hierro", new THREE.BoxGeometry(bw, .04, .04), B.clone().multiply(TM(0, .95, .72))); add("hierro", new THREE.BoxGeometry(bw, .03, .03), B.clone().multiply(TM(0, .14, .72)));
      for (const s2 of [-1, 1]) { add("hierro", new THREE.BoxGeometry(.04, .04, .7), B.clone().multiply(TM(s2 * bw / 2, .95, .37))); add("hierro", new THREE.BoxGeometry(.03, .81, .03), B.clone().multiply(TM(s2 * bw / 2, .55, .72))) }
      for (let xb = -bw / 2 + .12; xb < bw / 2 - .05; xb += .13) add("hierro", new THREE.BoxGeometry(.018, .8, .018), B.clone().multiply(TM(xb, .55, .72)));
      const Wb = HM.clone().multiply(B); for (const s2 of [-1, 1]) if (r() < .8) { const q = new THREE.Vector3(s2 * (bw / 2 - .28), .07, .5).applyMatrix4(Wb); MACETAS_B.push([q.x, q.y, q.z, .9 + r() * .5, r() * 6]) }
      if (r() < .6) { const q = new THREE.Vector3((r() - .5) * .6, .07, .58).applyMatrix4(Wb); VELAS_B.push({ p: q.toArray(), h: .14 + r() * .14, g: 0 }) } }
    // velas en el alféizar (todas las ventanas) y alguna maceta
    const Wm = HM.clone().multiply(M), zs = simple ? .07 : .14, nv = simple ? 1 : 1 + (r() < .45) + (r() < .15);
    for (let q = 0; q < nv; q++) { const p = new THREE.Vector3((q - (nv - 1) / 2) * .2 + (r() - .5) * .06, simple ? 0 : -.01, zs + (r() - .5) * .04).applyMatrix4(Wm); VELAS_B.push({ p: p.toArray(), h: .1 + r() * .16, g: 0 }) }
    if (!simple && !balcon && r() < .22) { const p = new THREE.Vector3((r() < .5 ? -1 : 1) * (an / 2 - .02), -.01, .14).applyMatrix4(Wm); MACETAS_B.push([p.x, p.y, p.z, .7 + r() * .3, r() * 6]) } });
  if (o.puertaAtras && !simple) { const B = TM(-px * .6, 0, -d / 2, 0, Math.PI, 0); add("oscuro", new THREE.PlaneGeometry(dw, dh), B.clone().multiply(TM(0, dh / 2, .01))); hojaSinPicaporte({ add: (k, g, m) => add(k, g, m) }, B.clone().multiply(TM(0, 0, .04)), dw, dh, col, seed + 3, { tablas: r() < .2 }); add("piedraC", RB1(dw + .5, .26, .2, .03), B.clone().multiply(TM(0, dh + .13, .06))); add("piedraC", RB1(dw + .7, .16, .62, .05), B.clone().multiply(TM(0, .02, .3))) }
  // ---- farolito de pared junto a la puerta (algunas casas)
  if (!simple && (o.farol ?? r() < .3)) { const lx = px + (px > 0 ? -1 : 1) * (dw / 2 + .45); add("hierro", new THREE.BoxGeometry(.04, .04, .32), F.clone().multiply(TM(lx, 2.55, .16))); add("hierro", new THREE.CylinderGeometry(.13, .1, .05, 6), F.clone().multiply(TM(lx, 2.66, .34)));
    add("luz", new THREE.CylinderGeometry(.09, .07, .22, 6), F.clone().multiply(TM(lx, 2.52, .34))); add("hierro", new THREE.ConeGeometry(.14, .14, 6), F.clone().multiply(TM(lx, 2.75, .34))) }
  const C = { x, z, ry, w, d, h, y0, HM, px, mu, o, rh, ye, dos, hs, col, techo, mu, frontal, span, len, ang, chimTop, ctop, chimG, r, seed, F, dw, dh, ridge: h + rh + .15 };
  CASAS_P.push(C); rectAdd({ x, z, ry, w: w + .6, d: d + .6, casa: C }); return C }

// ---------- ayudantes de obra: muro con huecos (puertas/ventanas) y prisma (relleno entre casas)
// muroHuecos: muro de ancho w (x de −w/2 a w/2), alto h (y de 0 a h), espesor t, centrado en z = 0 de M; huecos = [[x0, x1, y0, y1] …]
function muroHuecos(L, key, M, w, h, t, huecos, s = 3.2) { const xs = [-w / 2, w / 2]; huecos.forEach(q => xs.push(q[0], q[1])); xs.sort((a, b) => a - b);
  for (let i = 0; i < xs.length - 1; i++) { const xa = xs[i], xb = xs[i + 1]; if (xb - xa < .005) continue; const xm = (xa + xb) / 2, hs = huecos.filter(q => q[0] < xm && q[1] > xm).map(q => [q[2], q[3]]).sort((a, b) => a[0] - b[0]);
    let y = 0; for (const [ya, yb] of [...hs, [h, h]]) { if (ya - y > .005) L.add(key, uvMuro(new THREE.BoxGeometry(xb - xa, ya - y, t), s, xm / s, (y + ya) / 2 / s), M.clone().multiply(TM(xm, (y + ya) / 2, 0))); y = Math.max(y, yb) } } }
function prisma(P, y0, y1) { let A = 0; for (let i = 0; i < P.length; i++) { const [ax, az] = P[i], [bx, bz] = P[(i + 1) % P.length]; A += ax * bz - bx * az } if (A > 0) P = [...P].reverse();
  const pos = [], n = P.length; for (let i = 0; i < n; i++) { const [ax, az] = P[i], [bx, bz] = P[(i + 1) % n]; pos.push(ax, y0, az, bx, y0, bz, bx, y1, bz, ax, y0, az, bx, y1, bz, ax, y1, az) }
  for (let i = 1; i < n - 1; i++) pos.push(P[0][0], y1, P[0][1], P[i][0], y1, P[i][1], P[i + 1][0], y1, P[i + 1][1]);
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(pos.length / 3 * 2), 2)); g.computeVertexNormals();
  const nr = g.attributes.normal; if (n > 2 && nr.getY(pos.length / 3 - 1) < 0) { const p = g.attributes.position; for (let i = n * 6; i < p.count; i += 3) { for (let c = 0; c < 3; c++) { const t = p.getComponent(i + 1, c); p.setComponent(i + 1, c, p.getComponent(i + 2, c)); p.setComponent(i + 2, c, t) } } g.computeVertexNormals() }
  return g }
const esquinaW = (C, lx, lz) => [C.x + lx * Math.cos(C.ry) + lz * Math.sin(C.ry), C.z - lx * Math.sin(C.ry) + lz * Math.cos(C.ry)];

// ================= HOLLOWMERE: las casas =================
M_TEJA.forEach(m => m.color.set("#8e8078"));
const M_PICAPORTE = new THREE.MeshStandardMaterial({ color: "#f0c060", roughness: .14, metalness: 1, envMap: ENV_METAL_P, envMapIntensity: 2.4, emissive: "#5a3608", emissiveIntensity: .55 });
Object.assign(CASA_MATS, { picaporte: M_PICAPORTE, losas: M_LOSAS, cortina: M_CORTINA });
M_TABLAS_H.forEach((m, i) => CASA_MATS["tabla" + i] = m); M_MARCA_PUERTA.forEach((m, i) => CASA_MATS["marca" + i] = m);
// el picaporte de bronce (la ÚNICA puerta del pueblo que tiene): roseta, cuello, pomo, bocallave. M en la cara de la hoja (+z afuera), origen en el pomo
function picaportePiezas(add, M) {
  add("picaporte", new THREE.CylinderGeometry(.075, .085, .025, 24), M.clone().multiply(TM(0, 0, .012, Math.PI / 2)));
  add("picaporte", new THREE.TorusGeometry(.07, .008, 6, 24), M.clone().multiply(TM(0, 0, .024)));
  add("picaporte", new THREE.CylinderGeometry(.018, .024, .07, 12), M.clone().multiply(TM(0, 0, .058, Math.PI / 2)));
  add("picaporte", new THREE.SphereGeometry(.056, 20, 14), M.clone().multiply(TM(0, 0, .11, 0, 0, 0, 1, 1, .8)));
  add("picaporte", RB1(.075, .22, .016, .01), M.clone().multiply(TM(0, -.21, .008)));
  add("oscuro", new THREE.CircleGeometry(.013, 12), M.clone().multiply(TM(0, -.19, .018))); add("oscuro", new THREE.PlaneGeometry(.009, .035), M.clone().multiply(TM(0, -.215, .018))) }
// la hoja de una puerta SIN picaporte (para las puertas sueltas que abre la escena): tablas, bisagras de hierro, la marca del picaporte
// arrancado (y rasguños), el agujero del vástago. L = lote, M = matriz en el centro de abajo de la hoja (+z afuera), k = variante 0–5
function hojaSinPicaporte(L, M, dw, dh, col, k, o = {}) {
  L.add(col, new THREE.BoxGeometry(dw - .04, dh - .03, .06), M.clone().multiply(TM(0, dh / 2, 0)));
  for (let q = 0; q < Math.round(dw / .16); q++) L.add("viga", new THREE.BoxGeometry(.012, dh - .05, .02), M.clone().multiply(TM(-dw / 2 + .02 + (q + 1) * (dw - .04) / (Math.round(dw / .16) + 1), dh / 2, .03)));
  for (const yy of [.35, dh - .4]) { L.add("hierro", new THREE.BoxGeometry(dw * .75, .06, .02), M.clone().multiply(TM(-dw * .12, yy, .035))); L.add("hierro", new THREE.CylinderGeometry(.028, .028, .14, 8), M.clone().multiply(TM(-dw / 2 + .01, yy, .02))) }
  L.add("marca" + (k % 6), new THREE.PlaneGeometry(dw - .04, dh - .03), M.clone().multiply(TM(0, dh / 2, .032)));
  L.add("oscuro", new THREE.CylinderGeometry(.024, .024, .02, 10), M.clone().multiply(TM(.3 * (dw - .04), dh / 2 - .03 * (dh - .03), .03, Math.PI / 2)));
  if (o.tablas) { const r = rng(9100 + k); for (let q = 0; q < 3; q++) { const y = dh * (.22 + q * .3) + (r() - .5) * .1, a = (r() - .5) * .35; L.add("maderaV", RB1(dw + .34, .19 + r() * .05, .05, .01), M.clone().multiply(TM((r() - .5) * .06, y, .075, 0, 0, a)));
      for (const s of [-1, 1]) for (const dy of [-.05, .05]) L.add("hierro", new THREE.CylinderGeometry(.012, .012, .03, 5), M.clone().multiply(TM(s * (dw / 2 + .08) * Math.cos(a), y + s * (dw / 2 + .08) * Math.sin(a) + dy, .105, Math.PI / 2))) } } }
// filas de casas a lo largo de z: xFrente = x de la fachada; lado −1 = la casa queda al oeste (mira al este), +1 al este (mira al oeste)
const tramosLibres = (z0, z1, res) => { let L = [[z0, z1]]; res.forEach(([a, b]) => { L = L.flatMap(([u, v]) => b <= u || a >= v ? [[u, v]] : [[u, a], [b, v]].filter(([p, q]) => q - p > .5)) }); return L };
function filaCasas(xFrente, lado, z0, z1, res, seed, o = {}) { const r = rng(seed), ry = lado < 0 ? Math.PI / 2 : -Math.PI / 2, out = [];
  tramosLibres(z0, z1, res).forEach(([a, b]) => { let z = a; while (b - z > 2.8) { let w = (o.wMin ?? 4.4) + r() * (o.wVar ?? 2.4); if (b - z - w < 3.2) w = b - z;
      const d = (o.dMin ?? 7.2) + r() * (o.dVar ?? 1.4), pisos = (o.pisos ?? 2) + (r() < (o.p3 ?? .45) ? 1 : 0), h = pisos * 2.9 + .25 + r() * .4, zc = z + w / 2, xc = xFrente + lado * d / 2;
      const C = casaP(xc, zc, ry, w - .04, d, h, seed + 7 + out.length * 13, { frontal: w < 5.4 && r() < .55, pendiente: 46 + r() * 12, parches: r() < .3, puertaAtras: r() < .4, balcones: .2, farol: r() < .3, tablas: r() < .15, ...(o.casa || {}) });
      C.fila = o.nombre; out.push(C); z += w } }); return out }
const CRUCE_R = [CRUCE_T.z - CRUCE_T.an / 2, CRUCE_T.z + CRUCE_T.an / 2];
const resDe = (B, m = .02) => [B.z - B.w / 2 - m, B.z + B.w / 2 + m];
const FILAS_T = {
  oeste: filaCasas(-CALLE_T.fachada, -1, CALLE_T.z0 + .5, CALLE_T.z1 - .5, [CRUCE_R, resDe(CASA_FAM), resDe(CASA_MARGA)], 5100, { nombre: "oeste" }),
  este: filaCasas(CALLE_T.fachada, 1, CALLE_T.z0 + .5, CALLE_T.z1 - .5, [CRUCE_R, resDe(TALLER_T)], 5300, { nombre: "este" }),
  oesteAtras: filaCasas(CALLEJONES_T[0].x0, -1, -38, 78, [CRUCE_R], 5500, { nombre: "oesteAtras", p3: .2, dMin: 6.4, dVar: 1.6 }),
  esteAtras: filaCasas(CALLEJONES_T[1].x1, 1, -35.5, 78, [CRUCE_R], 5700, { nombre: "esteAtras", p3: .2, dMin: 6.4, dVar: 1.6 }),
  plazaO: filaCasas(PLAZA_T.x - PLAZA_T.w / 2, -1, -71.5, -42, [], 5900, { nombre: "plazaO", p3: .6, wMin: 5, dMin: 7.5 }),
  plazaE: filaCasas(PLAZA_T.x + PLAZA_T.w / 2, 1, -71.5, -42, [], 6100, { nombre: "plazaE", p3: .6, wMin: 5, dMin: 7.5 }) };
// casas sueltas en las afueras (miran al pueblo), con sus galpones
const AFUERAS_T = [[-38, 12, Math.PI / 2, 7, 6, 1], [-36, 44, Math.PI / 2, 6, 6.5, 2], [-41, -12, Math.PI / 2, 6.5, 6, 1], [-35, 64, Math.PI / 2, 7.5, 6, 2], [-33, -52, Math.PI / 2, 6, 7, 2],
  [36, 32, -Math.PI / 2, 7, 6, 2], [40, 6, -Math.PI / 2, 6, 6, 1], [33, 58, -Math.PI / 2, 7, 6.5, 2], [38, -50, -Math.PI / 2, 6.5, 6, 1], [-18, 95, Math.PI, 7, 6, 2], [16, 96, Math.PI, 6.5, 6, 1], [50, -6, -Math.PI / 2, 6, 5.5, 1]]
  .map(([x, z, ry, w, d, p], i) => casaP(x, z, ry, w, d, p * 2.9 + .3, 6200 + i * 11, { pendiente: 50 + (i % 3) * 4, parches: true, exenta: true, muro: i % 3 ? "tabla" + (i % 5) : "muro" + (i % 6), tablas: i % 4 === 1, farol: i % 2 === 0 }));
// la casa del sacristán, al oeste de la iglesia (mira a la plaza)
const CASA_SACRISTAN = casaP(-14.5, -81, 0, 9, 8, 6.2, 6290, { muro: "muro1", techo: "piz0", pendiente: 52, exenta: true, farol: true });

// ---------- LA CASA DE LA FAMILIA (la del narrador y Tib), lado oeste de la calle: planta baja = UN cuarto de verdad (6,4 × 7,4 × 3 m):
// la puerta al frente (sin picaporte; el ropero contra ella), la ventana del frente, la VENTANA DE ATRÁS (al callejón, se abre), la mesa,
// las camas, el hogar. Coordenadas locales: x a lo largo de la calle (+x = norte), z hacia la calle (+z = frente). Los muebles van en el detalle.
const CASA_FAM_B = (() => { const { x, z, ry, w, d } = CASA_FAM, H = 3.0, t = .3, mu = "muro2", fz = d / 2;
  const C = casaP(x, z, ry, w, d, 6.4, 6301, { muro: mu, techo: "piz0", dos: true, pendiente: 52, sinPuerta: true, sinPiso0: true, hueco: H, farol: false, balcones: 0, puertaX: 1.15 });
  const M = C.HM, at = (...a) => M.clone().multiply(TM(...a)), L = L_CASA;
  const PUE = [.6, 1.7, .26, 2.36], VEN = [-2.7, -1.3, 1.0, 2.1], VAT = [-.65, .65, 1.0, 2.1];
  muroHuecos(L, mu, at(0, 0, fz - t / 2), w, H, t, [VEN, PUE]);
  for (const s of [-1, 1]) L.add(mu, uvMuro(new THREE.BoxGeometry(t, H, d - 2 * t), 3.2), at(s * (w / 2 - t / 2), H / 2, 0));
  muroHuecos(L, mu, at(0, 0, -fz + t / 2), w, H, t, [VAT]);
  // forro de tablas por dentro (con los mismos huecos), piso de tablas, vigas del techo
  muroHuecos(L, "tabla4", at(0, 0, fz - t - .02), w - 2 * t, H, .04, [VEN, PUE]); muroHuecos(L, "tabla4", at(0, 0, -fz + t + .02), w - 2 * t, H, .04, [VAT]);
  for (const s of [-1, 1]) L.add("tabla4", uvMuro(new THREE.BoxGeometry(.04, H, d - 2 * t - .08), 3.2), at(s * (w / 2 - t - .02), H / 2, 0));
  L.add("madera", uvMuro(new THREE.BoxGeometry(w - .5, .1, d - .5), 1.4), at(0, .22, 0));
  for (let k = 0; k < 6; k++) L.add("viga", new THREE.BoxGeometry(w - .5, .2, .2), at(0, H - .12, fz - .75 - k * 1.3));
  L.add("viga", new THREE.BoxGeometry(.24, .26, d - .6), at(0, H - .26, 0)); for (const s of [-1, 1]) L.add("viga", new THREE.BoxGeometry(.2, H - .3, .2), at(s * 1.6, (H - .3) / 2 + .27, -.4));
  // la ventana del frente (vidrio, marco, parteluz, alféizar) y el marco de la puerta
  const marcoVentana = (V, zf, sale) => { const [x0, x1, y0, y1] = V, vw = x1 - x0, vh = y1 - y0, vc = (x0 + x1) / 2;
    for (const xx of [x0, x1]) L.add("madera", new THREE.BoxGeometry(.1, vh + .1, t + .06), at(xx + (xx === x0 ? .05 : -.05), y0 + vh / 2, zf)); for (const yy of [y0, y1]) L.add("madera", new THREE.BoxGeometry(vw, .1, t + .06), at(vc, yy + (yy === y0 ? .05 : -.05), zf));
    L.add("piedraC", RB1(vw + .36, .1, .34, .03), at(vc, y0 - .05, zf + sale * (t / 2 + .08))); L.add("piedraC", RB1(vw + .4, .2, .16, .03), at(vc, y1 + .12, zf + sale * (t / 2 + .02))) };
  marcoVentana(VEN, fz - t / 2, 1); { const [x0, x1, y0, y1] = VEN, vc = (x0 + x1) / 2; L.add("vidrioC", new THREE.PlaneGeometry(x1 - x0, y1 - y0), at(vc, (y0 + y1) / 2, fz - .1)); L.add("madera", new THREE.BoxGeometry(.05, y1 - y0, .06), at(vc, (y0 + y1) / 2, fz - .1)); L.add("madera", new THREE.BoxGeometry(x1 - x0, .05, .06), at(vc, (y0 + y1) / 2 + .1, fz - .1));
    for (const s of [-1, 1]) L.add("cortina", new THREE.BoxGeometry(.3, y1 - y0 + .3, .05), at(vc + s * ((x1 - x0) / 2 - .1), (y0 + y1) / 2 + .1, fz - t - .1)) }
  marcoVentana(VAT, -fz + t / 2, -1);
  { const [x0, x1, y0, y1] = PUE; L.add("piedraC", RB1(x1 - x0 + .5, .26, .2, .03), at((x0 + x1) / 2, y1 + .13, fz + .04)); for (const xx of [x0 - .06, x1 + .06]) L.add("madera", new THREE.BoxGeometry(.12, y1 - y0 + .06, t + .08), at(xx, (y0 + y1) / 2, fz - t / 2));
    L.add("piedraC", RB1(x1 - x0 + .7, .16, .62, .05), at((x0 + x1) / 2, .02, fz + .3)) }
  return { C, M, at, fz, t, H, PUE, VEN, VAT, w, d } })();

// ---------- EL TALLER DEL SASTRE (lado este, frente al oeste): planta baja = el taller (8,4 × 8,4 × 3,4 m): vidriera grande a la calle, puerta,
// ventanita atrás y una al costado. Coordenadas locales como la casa de la familia (+z = hacia la calle). Los muebles van en el detalle.
const TALLER_B = (() => { const { x, z, ry, w, d } = TALLER_T, H = 3.4, t = .3, mu = "tabla2", fz = d / 2;
  const C = casaP(x, z, ry, w, d, 9.2, 6401, { muro: mu, techo: "piz2", dos: false, pendiente: 50, frontal: true, sinPuerta: true, sinPiso0: true, hueco: H, farol: false, balcones: .5, puertaX: 1.3 });
  const M = C.HM, at = (...a) => M.clone().multiply(TM(...a)), L = L_CASA;
  const VID = [-3.8, -.5, .7, 2.8], PUE = [.7, 1.9, .26, 2.62], VAT = [-1.4, .2, 1.3, 2.4], VCO = [-1.6, -.2, 1.2, 2.4];
  muroHuecos(L, "muro3", at(0, 0, fz - t / 2), w, H, t, [VID, PUE]);   // el frente: piedra (la vidriera con marco de madera pintada)
  L.add(mu, uvMuro(new THREE.BoxGeometry(t, H, d - 2 * t), 3.2), at(-(w / 2 - t / 2), H / 2, 0));
  { const M2 = at(w / 2 - t / 2, 0, 0).multiply(TM(0, 0, 0, 0, Math.PI / 2, 0)); muroHuecos(L, mu, M2, d - 2 * t, H, t, [VCO]) }
  muroHuecos(L, mu, at(0, 0, -fz + t / 2), w, H, t, [VAT]);
  muroHuecos(L, "tabla4", at(0, 0, fz - t - .02), w - 2 * t, H, .04, [VID, PUE]); muroHuecos(L, "tabla4", at(0, 0, -fz + t + .02), w - 2 * t, H, .04, [VAT]);
  L.add("tabla4", uvMuro(new THREE.BoxGeometry(.04, H, d - 2 * t - .08), 3.2), at(-(w / 2 - t - .02), H / 2, 0)); { const M2 = at(w / 2 - t - .02, 0, 0).multiply(TM(0, 0, 0, 0, Math.PI / 2, 0)); muroHuecos(L, "tabla4", M2, d - 2 * t - .08, H, .04, [VCO]) }
  L.add("madera", uvMuro(new THREE.BoxGeometry(w - .5, .1, d - .5), 1.4), at(0, .22, 0));
  for (let k = 0; k < 7; k++) L.add("viga", new THREE.BoxGeometry(w - .5, .2, .2), at(0, H - .12, fz - .7 - k * 1.25)); L.add("viga", new THREE.BoxGeometry(.26, .28, d - .6), at(0, H - .3, 0));
  // la vidriera: marco grueso pintado de verde oscuro, vidrios chicos (grilla), zócalo de madera, alero/cornisa con el nombre
  { const [x0, x1, y0, y1] = VID, vw = x1 - x0, vh = y1 - y0, vc = (x0 + x1) / 2, zf = fz - t / 2; L.add("vidrioC", new THREE.PlaneGeometry(vw, vh), at(vc, y0 + vh / 2, fz - .12));
    for (let k = 0; k <= 5; k++) L.add("col0", new THREE.BoxGeometry(.06, vh, .08), at(x0 + k * vw / 5, y0 + vh / 2, fz - .12)); for (let k = 0; k <= 3; k++) L.add("col0", new THREE.BoxGeometry(vw, .06, .08), at(vc, y0 + k * vh / 3, fz - .12));
    for (const xx of [x0 - .08, x1 + .08]) L.add("col0", new THREE.BoxGeometry(.18, vh + .3, t + .12), at(xx, y0 + vh / 2, zf)); L.add("col0", new THREE.BoxGeometry(vw + .5, .2, t + .16), at(vc, y1 + .1, zf)); L.add("col0", new THREE.BoxGeometry(vw + .5, .14, t + .26), at(vc, y0 - .07, zf));
    L.add("col0", new THREE.BoxGeometry(vw + .4, .5, .08), at(vc, .45, fz + .02)); L.add("col0", new THREE.BoxGeometry(w + .1, .5, .22), at(0, H - .1, fz + .12)) }
  { const [x0, x1, y0, y1] = PUE; for (const xx of [x0 - .07, x1 + .07]) L.add("col0", new THREE.BoxGeometry(.14, y1 - y0 + .1, t + .1), at(xx, (y0 + y1) / 2, fz - t / 2)); L.add("col0", new THREE.BoxGeometry(x1 - x0 + .3, .16, t + .1), at((x0 + x1) / 2, y1 + .08, fz - t / 2));
    L.add("vidrioC", new THREE.PlaneGeometry(x1 - x0 - .1, .5), at((x0 + x1) / 2, y1 + .45, fz - .1)); L.add("piedraC", RB1(x1 - x0 + .7, .16, .62, .05), at((x0 + x1) / 2, .02, fz + .3)) }
  for (const [V, Mv] of [[VAT, at(0, 0, -fz + t / 2, 0, Math.PI, 0)], [VCO, at(w / 2 - t / 2, 0, 0, 0, Math.PI / 2, 0)]]) { const [x0, x1, y0, y1] = V, vc = (x0 + x1) / 2, xx = Mv === undefined ? 0 : 1;
    L.add("vidrioC", new THREE.PlaneGeometry(x1 - x0, y1 - y0), Mv.clone().multiply(TM(V === VAT ? -vc : vc, (y0 + y1) / 2, 0))); L.add("piedraC", RB1(x1 - x0 + .3, .1, .3, .03), Mv.clone().multiply(TM(V === VAT ? -vc : vc, y0 - .05, .2))) }
  return { C, M, at, fz, t, H, VID, PUE, VAT, VCO, w, d } })();

// ---------- LA CASA DE MARGA (vieja, torcida, de tablas grises): la ventana de abajo al frente es la de los hilos y los ovillos (en el detalle)
const CASA_MARGA_B = (() => { const { x, z, ry, w, d } = CASA_MARGA, y0 = SUELO(x, z) - .06;
  const C = casaP(x, z, ry, w, d, 5.9, 6450, { muro: "tabla1", techo: "piz2", pendiente: 56, puertaX: 1.45, sinHoja: true, sinPiso0: true, parches: true, farol: false, balcones: 0, HM: TM(x, y0, z, 0, ry, .025), y0 });
  const M = C.HM, at = (...a) => M.clone().multiply(TM(...a)), L = L_CASA, fz = d / 2, V = [-1.15, 1.05, 1.35, 1.2];   // [x, y, ancho, alto]
  ventanaPiezas((k, g, m) => L.add(k, g, M.clone().multiply(m)), TM(V[0], V[1], fz), V[2], V[3], rng(6451), "col4", { cerrado: false });
  L.add("madera", new THREE.BoxGeometry(V[2] + .5, .07, .42), at(V[0], V[1] - .1, fz + .26)); for (const s of [-1, 1]) L.add("madera", new THREE.BoxGeometry(.05, .3, .34), at(V[0] + s * (V[2] / 2 + .15), V[1] - .28, fz + .22, -.6, 0, 0));
  // ventana atrás y una de costado, chiquitas
  ventanaPiezas((k, g, m) => L.add(k, g, M.clone().multiply(m)), TM(.8, 1.1, -fz, 0, Math.PI, 0), .8, .9, rng(6452), "col4", { cerrado: true });
  return { C, M, at, fz, V, w, d } })();

// ---------- LA CASA DE FATHER CRANE (junto a la iglesia, al este): piedra clara de sillares, tres pisos, balcones, la puerta al sur con
// escalinata, la ÚNICA puerta con picaporte (la hoja va en el detalle) y al lado el gancho con su abrigo negro
const CASA_CRANE_B = (() => { const { x, z, ry, w, d } = CASA_CRANE;
  const C = casaP(x, z, ry, w, d, 9.1, 6501, { muro: "sillarC", techo: "piz1", puertaX: 0, sinHoja: true, farol: false, balcones: .75, pendiente: 50, exenta: true, color: 2 });
  const M = C.HM, at = (...a) => M.clone().multiply(TM(...a)), L = L_CASA, fz = d / 2;
  // escalinata de tres escalones, dos faroles de pared, molduras de la puerta más ricas (frontón chico de piedra)
  for (let k = 0; k < 3; k++) L.add("sillarC", RB1(2.6 - k * .3, .17, 1.4 - k * .35, .02), at(0, .08 + k * .17 - .1, fz + .75 - k * .17));
  L.add("sillarC", RB1(1.9, .14, .34, .02), at(0, C.dh + .38, fz + .12)); { const sh = new THREE.Shape(); sh.moveTo(-1.05, 0); sh.lineTo(1.05, 0); sh.lineTo(0, .55); sh.closePath(); L.add("sillarC", new THREE.ExtrudeGeometry(sh, { depth: .26, bevelEnabled: false }), at(0, C.dh + .45, fz)) }
  for (const s of [-1, 1]) { L.add("sillarC", RB1(.26, C.dh + .2, .2, .02), at(s * (C.dw / 2 + .3), (C.dh + .2) / 2, fz + .08)) }
  return { C, M, at, fz, w, d } })();


// ================= LA IGLESIA: nave de piedra gris (hueca, se puede entrar), contrafuertes, ventanas ojivales con vitrales que brillan,
// techo de pizarra empinado, y al frente el CAMPANARIO: base hueca con la puerta a la plaza (adentro cuelga la cuerda), el campanario con
// arcos abiertos (la campana se ve), cornisa, y la aguja octogonal de pizarra con la cruz de hierro (punta a 21 m, más baja que la Tejedora)
const M_SILLAR = new THREE.MeshStandardMaterial({ map: T_SILLAR[0], bumpMap: T_SILLAR[1], bumpScale: 4, roughness: .9, color: "#a8a49c" });
const M_SILLAR_O = new THREE.MeshStandardMaterial({ map: T_SILLAR[0], bumpMap: T_SILLAR[1], bumpScale: 4, roughness: .9, color: "#77736c" });
// vitral: una ojiva con plomos y vidrios de colores (afuera: oscuro con reflejo; la luz de las velas de adentro lo hace brillar);
// las esquinas fuera del arco van pintadas de piedra
const T_VITRAL = (seed, ancho = 1) => tex(256, 512, (g, w, h) => { const r = rng(seed); g.fillStyle = "#5a5650"; g.fillRect(0, 0, w, h);
  for (let k = 0; k < 2000; k++) { g.fillStyle = r() < .5 ? "rgba(30,28,24,.3)" : "rgba(200,195,185,.15)"; g.fillRect(r() * w, r() * h, 2, 2) }
  g.save(); g.beginPath(); g.moveTo(8, h); g.lineTo(8, h * .3); g.quadraticCurveTo(8, 10, w / 2, 6); g.quadraticCurveTo(w - 8, 10, w - 8, h * .3); g.lineTo(w - 8, h); g.closePath(); g.clip();
  const C = ["#8a1a1a", "#1a3a8a", "#c8a020", "#2a6a3a", "#6a2a7a", "#c86a1a", "#2a5a9a", "#a02a2a"]; for (let y = 0; y < h; y += 34 + r() * 20) for (let x = 0; x < w; x += 30 + r() * 26) { g.fillStyle = C[r() * C.length | 0]; g.fillRect(x, y, 60, 60) }
  g.strokeStyle = "#0e0c0a"; g.lineWidth = 4; for (let k = 0; k < 40; k++) { g.beginPath(); const x = r() * w, y = r() * h; g.moveTo(x, y); g.lineTo(x + (r() - .5) * 140, y + (r() - .5) * 140); g.stroke() }
  for (let y = 0; y < h; y += 46) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + (r() - .5) * 10); g.stroke() } g.lineWidth = 6; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
  // una figura (un santo con aureola) en el medio, en siluetas de color
  g.fillStyle = "#e8d090"; g.beginPath(); g.arc(w / 2, h * .3, 26, 0, 7); g.fill(); g.fillStyle = "#d8b080"; g.beginPath(); g.arc(w / 2, h * .3, 14, 0, 7); g.fill(); g.fillStyle = "#3a2a6a"; g.beginPath(); g.moveTo(w / 2 - 30, h * .9); g.lineTo(w / 2 - 16, h * .36); g.lineTo(w / 2 + 16, h * .36); g.lineTo(w / 2 + 30, h * .9); g.fill(); g.stroke();
  const gr = g.createRadialGradient(w / 2, h * .5, 10, w / 2, h * .5, h * .7); gr.addColorStop(0, "rgba(255,230,180,.2)"); gr.addColorStop(1, "rgba(0,0,0,.35)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.restore();
  g.strokeStyle = "#2a2622"; g.lineWidth = 10; g.beginPath(); g.moveTo(8, h); g.lineTo(8, h * .3); g.quadraticCurveTo(8, 10, w / 2, 6); g.quadraticCurveTo(w - 8, 10, w - 8, h * .3); g.lineTo(w - 8, h); g.stroke() });
const M_VITRAL = [1, 2, 3].map(k => { const t = T_VITRAL(4800 + k); return new THREE.MeshStandardMaterial({ map: t, emissive: "#ffffff", emissiveMap: t, emissiveIntensity: .55, roughness: .2, metalness: .2, envMap: ENV_NOCHE_P, envMapIntensity: .6 }) });
const IGLESIA_B = (() => { const L = L_PIEDRA, { x: cx, z: cz, w, d, alto: Hn } = IGLESIA_T, z0 = cz + d / 2, z1 = cz - d / 2, t = .8, y0 = SUELO(cx, cz) - .05, at = (...a) => TM(cx, y0, 0).multiply(TM(...a));
  const VENT_Z = [-79.5, -84.5, -89.5, -94.5], VW = .9, VY = [1.9, 4.6];
  // muros de la nave (huecos de las ventanas ojivales); el frente: hueco grande que da a la base de la torre; el fondo: la ventana del altar
  for (const s of [-1, 1]) { const M = at(s * (w / 2 - t / 2), 0, cz, 0, s * Math.PI / 2, 0); muroHuecos(L, "sillar", M, d, Hn, t, VENT_Z.map(vz => { const lx = s > 0 ? -(vz - cz) : (vz - cz); return [lx - VW / 2, lx + VW / 2, VY[0], VY[1]] }), 3.2) }
  muroHuecos(L, "sillar", at(0, 0, z0 - t / 2), w - 2 * t + .02, Hn, t, [[-1.1, 1.1, 0, 3.0]], 3.2);
  muroHuecos(L, "sillar", at(0, 0, z1 + t / 2, 0, Math.PI, 0), w - 2 * t + .02, Hn, t, [[-.85, .85, 2.0, 5.0]], 3.2);
  // zócalo más oscuro (humedad) y cornisa
  L.add("sillarO", uvMuro(new THREE.BoxGeometry(w + .3, .8, d + .3), 3.2), at(0, .2, cz)); L.add("corona", RB1(w + .5, .25, d + .5, .04), at(0, Hn + .05, cz));
  // contrafuertes escalonados entre las ventanas
  for (const s of [-1, 1]) for (const bz of [-77, -82, -87, -92, -97, -100.4]) { L.add("sillar", uvMuro(new THREE.BoxGeometry(.9, Hn - 1.2, 1), 3.2), at(s * (w / 2 + .4), (Hn - 1.2) / 2, bz)); L.add("sillar", uvMuro(new THREE.BoxGeometry(.55, 1.6, .9), 3.2), at(s * (w / 2 + .3), Hn - .4, bz));
    L.add("corona", RB1(1.0, .14, 1.1, .03), at(s * (w / 2 + .42), Hn - 1.18, bz, 0, 0, s * .5)); L.add("corona", RB1(.66, .12, 1.0, .03), at(s * (w / 2 + .3), Hn + .42, bz, 0, 0, s * .5)) }
  // vitrales (por afuera y por adentro) con su marco de piedra
  const vit = (M, vw, vh, k) => { L.add("vitral" + k, new THREE.PlaneGeometry(vw, vh), M.clone().multiply(TM(0, vh / 2, 0))); L.add("vitral" + k, new THREE.PlaneGeometry(vw, vh), M.clone().multiply(TM(0, vh / 2, -t + .02, 0, Math.PI, 0)));
    for (const sx of [-1, 1]) L.add("corona", RB1(.14, vh + .1, .2, .03), M.clone().multiply(TM(sx * (vw / 2 + .05), vh / 2, .06))); L.add("corona", RB1(vw + .3, .12, .3, .03), M.clone().multiply(TM(0, -.06, .1))) };
  for (const s of [-1, 1]) VENT_Z.forEach((vz, i) => vit(at(s * (w / 2 + .01), VY[0], vz, 0, s * Math.PI / 2, 0), VW, VY[1] - VY[0], i % 3));
  vit(at(0, 2.0, z1 - .01, 0, Math.PI, 0), 1.7, 3.0, 0);
  // el techo de pizarra (empinado) y los hastiales de piedra
  { const ang = 50 * Math.PI / 180, span = w, rh = span / 2 * Math.tan(ang), ovz = .5, S = (span / 2 + ovz) / Math.cos(ang), Lt = d + .8;
    for (const s of [1, -1]) { const g = new THREE.BoxGeometry(S, .2, Lt); geoUV(g, (px, py, pz) => px / 4.4, (px, py, pz) => pz / 4.4); const ym = Hn + rh - (span / 2 + ovz) * Math.tan(ang) / 2 + .12, xm = s * (span / 2 + ovz) / 2; L.add("piz", g, at(xm, ym, cz, 0, 0, -s * ang)) }
    const sh = new THREE.Shape(); sh.moveTo(-span / 2, 0); sh.lineTo(span / 2, 0); sh.lineTo(0, rh); sh.closePath(); for (const zz of [z0 - t, z1]) L.add("sillar", uvMuro(new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false }), 3.2), at(0, Hn, zz));
    L.add("corona", new THREE.CylinderGeometry(.16, .16, Lt + .1, 8), at(0, Hn + rh + .14, cz, Math.PI / 2, 0, 0));
    // cruz de piedra en la punta del hastial de atrás
    L.add("corona", RB1(.2, 1.2, .2, .03), at(0, Hn + rh + .7, z1 + .3)); L.add("corona", RB1(.8, .2, .2, .03), at(0, Hn + rh + .95, z1 + .3)) }
  // piso de losas y adentro: el techo de madera (vigas y tablas a la vista)
  L.add("losas", new THREE.BoxGeometry(w - 2 * t, .1, d - 2 * t), at(0, .05, cz)); for (let k = 0; k < 12; k++) L.add("madera", new THREE.BoxGeometry(w - 2 * t, .22, .22), at(0, Hn - .2, z0 - 1.6 - k * 2));
  L.add("madera", new THREE.BoxGeometry(w - 2 * t, .06, d - 2 * t), at(0, Hn + .02, cz));
  // ---- el campanario
  const T = TORRE_T, tl = T.lado, tt = .7, tz = T.z, TB = 3.6, CB0 = 10.6, CB1 = 13.6, AT = (...a) => TM(T.x, y0, 0).multiply(TM(...a));
  // base hueca: puerta al sur (a la plaza), abertura al norte (a la nave)
  muroHuecos(L, "sillar", AT(0, 0, tz + tl / 2 - tt / 2), tl, TB, tt, [[-.9, .9, 0, 2.9]], 3.2); muroHuecos(L, "sillar", AT(0, 0, tz - tl / 2 + tt / 2), tl, TB, tt, [[-1.1, 1.1, 0, 3.0]], 3.2);
  for (const s of [-1, 1]) L.add("sillar", uvMuro(new THREE.BoxGeometry(tt, TB, tl - 2 * tt), 3.2), AT(s * (tl / 2 - tt / 2), TB / 2, tz));
  L.add("sillar", uvMuro(new THREE.BoxGeometry(tl, CB0 - TB, tl), 3.2), AT(0, TB + (CB0 - TB) / 2, tz)); L.add("losas", new THREE.BoxGeometry(tl - 2 * tt, .1, tl - 2 * tt), AT(0, .05, tz));
  L.add("sillarO", uvMuro(new THREE.BoxGeometry(tl + .3, .9, tl + .3), 3.2), AT(0, .25, tz));
  for (const yy of [TB, 7.2, CB0]) L.add("corona", RB1(tl + .3, .22, tl + .3, .04), AT(0, yy, tz));
  // ventanitas (saeteras) de la torre y un óculo con reloj parado
  for (const yy of [5.0, 8.4]) L.add("oscuro", new THREE.PlaneGeometry(.22, .9), AT(0, yy, tz + tl / 2 + .01));
  L.add("corona", new THREE.TorusGeometry(.62, .1, 8, 24), AT(0, 9.3, tz + tl / 2 + .04)); L.add("blanco", new THREE.CircleGeometry(.56, 24), AT(0, 9.3, tz + tl / 2 + .02)); L.add("hierro", new THREE.BoxGeometry(.04, .42, .02), AT(0, 9.44, tz + tl / 2 + .05, 0, 0, .9)); L.add("hierro", new THREE.BoxGeometry(.04, .3, .02), AT(0, 9.38, tz + tl / 2 + .06, 0, 0, -.4));
  // el campanario abierto: pilares en las esquinas y un parteluz en cada cara, arcos arriba
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) L.add("sillar", uvMuro(new THREE.BoxGeometry(.9, CB1 - CB0, .9), 3.2), AT(sx * (tl / 2 - .45), CB0 + (CB1 - CB0) / 2, tz + sz * (tl / 2 - .45)));
  for (const [ax, az, ry] of [[0, tl / 2, 0], [0, -tl / 2, Math.PI], [tl / 2, 0, Math.PI / 2], [-tl / 2, 0, -Math.PI / 2]]) { const M = AT(ax, 0, tz + az, 0, ry, 0);
    L.add("sillar", uvMuro(new THREE.BoxGeometry(.4, CB1 - CB0, .5), 3.2), M.clone().multiply(TM(0, CB0 + (CB1 - CB0) / 2, -.25))); L.add("corona", RB1(tl - 1.6, .3, .6, .03), M.clone().multiply(TM(0, CB0 + .15, -.25)));
    for (const s of [-1, 1]) { const sh = new THREE.Shape(), aw = (tl - 2.2) / 2; sh.moveTo(-aw / 2, 0); sh.lineTo(-aw / 2, .9); sh.lineTo(aw / 2, .9); sh.lineTo(aw / 2, 0); sh.quadraticCurveTo(aw / 2, .62, 0, .84); sh.quadraticCurveTo(-aw / 2, .62, -aw / 2, 0); sh.closePath();
      L.add("sillar", new THREE.ExtrudeGeometry(sh, { depth: .5, bevelEnabled: false }), M.clone().multiply(TM(s * (aw / 2 + .2), CB1 - .9, -.5))) }
    // barandita de hierro en cada arco
    for (let q = 0; q < 9; q++) L.add("hierro", new THREE.CylinderGeometry(.02, .02, .8, 5), M.clone().multiply(TM(-tl / 2 + 1.1 + q * (tl - 2.2) / 8, CB0 + .7, -.1))); L.add("hierro", new THREE.BoxGeometry(tl - 2.2, .04, .04), M.clone().multiply(TM(0, CB0 + 1.1, -.1))) }
  L.add("sillar", uvMuro(new THREE.BoxGeometry(tl + .2, .45, tl + .2), 3.2), AT(0, CB1 + .22, tz)); L.add("corona", RB1(tl + .6, .2, tl + .6, .04), AT(0, CB1 + .5, tz));
  // pináculos en las esquinas y la aguja octogonal de pizarra con la cruz y el gallo de hierro
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { L.add("corona", RB1(.4, .8, .4, .03), AT(sx * (tl / 2), CB1 + 1, tz + sz * (tl / 2))); L.add("piz", new THREE.ConeGeometry(.3, 1.3, 4), AT(sx * (tl / 2), CB1 + 2.05, tz + sz * (tl / 2), 0, Math.PI / 4, 0)) }
  { const hA = T.punta - 1.1 - (CB1 + .6), g = new THREE.ConeGeometry(tl / 2 - .15, hA, 8, 6); geoUV(g, (px, py, pz) => (Math.atan2(pz, px) + Math.PI) * 1.2, (px, py) => py / 2.2); L.add("piz", g, AT(0, CB1 + .6 + hA / 2, tz, 0, Math.PI / 8, 0));
    L.add("hierro", new THREE.CylinderGeometry(.05, .06, 1.3, 6), AT(0, T.punta - .65, tz)); L.add("hierro", new THREE.BoxGeometry(.7, .07, .07), AT(0, T.punta - .35, tz)); L.add("hierro", new THREE.SphereGeometry(.1, 8, 6), AT(0, T.punta - 1.05, tz));
    // gallo de la veleta (silueta de chapa)
    const sg = new THREE.Shape(); [[0, 0], [.25, .05], [.32, .2], [.28, .35], [.18, .32], [.12, .18], [-.1, .16], [-.28, .32], [-.3, .12], [-.15, 0]].forEach(([a, b], i) => i ? sg.lineTo(a, b) : sg.moveTo(a, b)); sg.closePath();
    L.add("hierro", new THREE.ExtrudeGeometry(sg, { depth: .02, bevelEnabled: false }), AT(0, T.punta - .2, tz, 0, .6, 0)) }
  rectAdd({ x: cx, z: cz, w: w + 1.8, d: d + .4, ry: 0, iglesia: 1 }); rectAdd({ x: T.x, z: tz, w: tl + .3, d: tl + .3, ry: 0, torre: 1 });
  const W = (x, y, z) => [x, y0 + y, z];
  return { y0, Hn, t, TB, CB0, CB1, puerta: W(0, 0, tz + tl / 2 + .6), puertaAdentro: W(0, 0, tz), nave: W(0, 0, cz), altar: W(0, 0, z1 + 2.4), cuerda: W(.7, 0, tz), VENT_Z } })();


// ---------- se cierran los lotes de casas y de piedra
const CASAS_M = L_CASA.fin(scene, CASA_MATS); ["oscuro", "vidrio", "ventana", "vidrioC", "luz", "marca0", "marca1", "marca2", "marca3", "marca4", "marca5"].forEach(k => { if (CASAS_M[k]) CASAS_M[k].castShadow = false });
const CASAS_LEJOS_M = L_LEJOS.fin(scene, CASA_MATS); ["oscuro", "ventana"].forEach(k => { if (CASAS_LEJOS_M[k]) CASAS_LEJOS_M[k].castShadow = false });
const PIEDRA_M = L_PIEDRA.fin(scene, { corona: M_CORONA, sillar: M_SILLAR, sillarO: M_SILLAR_O, piz: M_PIZ[0], vitral0: M_VITRAL[0], vitral1: M_VITRAL[1], vitral2: M_VITRAL[2], oscuro: M_OSCURO, hierro: M_HIERRO, madera: M_MADERA, losas: M_LOSAS, blanco: M_BLANCO_P });
["vitral0", "vitral1", "vitral2", "oscuro"].forEach(k => { if (PIEDRA_M[k]) PIEDRA_M[k].castShadow = false });

// ================= LA TEJEDORA (the Weaver) — «Nobody Answers The Knock» =================
// Criatura de ≈ 22 m, flaca y encorvada, hecha de ABRIGOS VIEJOS COSIDOS entre sí: paños de lana gris, tweed, paño negro, verde,
// cuadros, pana… (textura pintada en canvas: tejido, costuras en zigzag con hilo claro, agujeros de polilla, zurcidos), capas de
// abrigos superpuestas como tejas (los ruedos sirven de escalón), botones de todos los tamaños (InstancedMesh), puntadas 3D gruesas
// (InstancedMesh), bolsillos, cuellos parados, mangas VACÍAS que cuelgan y se mueven, flecos e hilos sueltos. Piernas larguísimas de
// mangas enrolladas. Brazos de PERCHAS DE ALAMBRE oxidadas, colgadas de un travesaño de madera que le cruza los hombros (espantapájaros):
// cada tramo es una percha estirada cuyo gancho se engancha en la barra de la anterior; los «dedos» son cuatro ganchos de percha.
// Cara = UN botón gigante de cuatro agujeros (hueso/carey, rajado, con una mella), cosido con hilo grueso en cruz; los agujeros negros.
// Debajo del botón, la BOCA es un bolsillo cosido que se descose para gritar. En el pecho, el ABRIGO ROJO cosido con 18 puntadas.
// Todo procedural (lofts, tubos sobre curvas, extrusión con agujeros); texturas pintadas en canvas. Mira a +z local (como el elenco).
//
// API (por cuadro, en este orden: poner → quieto|caminar → modificadores → mirar → aura; las funciones de cámara al final):
//   TEJEDORA.poner(x, y, z, ry)         la muestra parada en ese punto (y = piso) en la pose de reposo (borra lo del cuadro anterior)
//   TEJEDORA.ocultar()                  la esconde (con su aura y el abrigo rojo suelto); llamarlo en el reset de cada cuadro
//   TEJEDORA.quieto(t)                  respira, la tela se mueve con el viento, los ganchos se mecen, las mangas vacías se balancean
//   TEJEDORA.caminar(t, vel = 2.6)      pasos lentos y pesados (ciclo de dos pasos = TEJEDORA.PASO m); el cuerpo se balancea, las mangas
//                                       cuelgan con retraso. El que llama avanza la raíz a `vel` m/s en la dirección ry (los pies no patinan)
//   TEJEDORA.agacharse(u, p)            se agacha (u 0..1); si p = [x, y, z] gira el torso hacia p
//   TEJEDORA.golpear(t, u, p)           se agacha hacia la puerta y golpea con el gancho del medio en p ([x, y, z] del mundo; por defecto
//                                       5,5 m adelante a 1,9 m de alto): 0–.3 se agacha y estira el brazo, tres golpes en u = GOLPES_U
//                                       (.42, .57, .72), queda apoyado. TEJEDORA.golpeFuerza(u) → 0..1 (pico en cada golpe: sonido/temblor)
//   TEJEDORA.abrirPuerta(u, p, d)       mete el gancho en p (el borde de la puerta) y tira hacia d ([dx, dz], por defecto hacia ella);
//                                       devuelve cuánto está abierta la puerta (0..1) para que la escena gire la hoja
//   TEJEDORA.gritar(t, u)               se arquea hacia atrás, tiembla, los brazos se abren, la tela se infla, la boca-bolsillo se descose
//   TEJEDORA.mirar([x, y, z], u = 1)    la cara (el botón) mira ese punto (gira cuello y un poco el torso)
//   TEJEDORA.cortarPuntos(u)            0..1: corta las puntadas del abrigo rojo una por una (quedan los cabos); el abrigo se despega
//   TEJEDORA.abrigoRojoCae(u, dest)     0..1: el abrigo rojo se suelta del pecho y cae revoloteando hasta dest ([x, y, z] del piso;
//                                       por defecto debajo del pecho, 3 m adelante). Devuelve el THREE.Group del abrigo
//   TEJEDORA.abrigoRojoEn(x, y, z, ry, u = 1)  el abrigo rojo tirado en el piso (sin la criatura); u < 1 lo va levantando del piso
//                                       (u = 0 colgando a 1,1 m, como si alguien lo sostuviera de los hombros)
//   TEJEDORA.trepaPunto(u)              { p, n, arriba } u 0 = cintura … 1 = al lado del abrigo rojo: punto de agarre en la superficie,
//                                       normal hacia afuera y «arriba» a lo largo del cuerpo (poner al narrador en p + n · 0,45)
//   TEJEDORA.puntoW(i) / siguientePuntoW(u)  [x, y, z] de la puntada i (0..PUNTOS_N−1) / de la que se corta en u (planos de las tijeras)
//   TEJEDORA.aura(on, k = 1)            niebla que se arrastra a sus pies, hilos sueltos que flotan, pelusa en el aire, polvo en cada
//                                       pisada, luz fría desde abajo; inclina las velas (velasHacia) y deja TEJEDORA.frio = {p, r, k}
//   TEJEDORA.luzFria(lista)             recibe la lista de luces de la escena ([[p], I, color, dist] de lucesCerca) y enfría/apaga las
//                                       que están cerca de ella (usarla con lights(TEJEDORA.luzFria(LX)))
//   TEJEDORA.climas()                   agrega el clima "tejedora" (y "noche" si falta) a ENV
//   cámara: cabezaW() centro del botón-cara · pechoW() centro del abrigo rojo · ganchoW() punta del gancho que golpea ·
//           caraCam(d, ang, dy) [x, y, z] a d m delante de la cara (ang gira alrededor, dy sube) · pieW(lado) · alto() ≈ 22
//   TEJEDORA.g el grupo raíz · TEJEDORA.ROJO el grupo del abrigo rojo · PASO · ALTO
const TEJEDORA = (() => {
  const T3 = THREE, PI = Math.PI, TAU = PI * 2;
  const S_ = (a, b, v) => { const q = Math.max(0, Math.min(1, (v - a) / (b - a))); return q * q * (3 - 2 * q) };
  const c01 = v => Math.max(0, Math.min(1, v)), mix = (a, b, k) => a + (b - a) * k, eIO = k => k * k * (3 - 2 * k), ex2 = a => Math.exp(-a);
  const fr = x => x - Math.floor(x);
  const rnd = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 };
  const hsh = (i, j, k) => { let n = (Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(k, 1274126177)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296 };
  const nz3 = (x, y, z) => { const i = Math.floor(x), j = Math.floor(y), k = Math.floor(z), fx = x - i, fy = y - j, fz = z - k, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), w = fz * fz * (3 - 2 * fz);
    return mix(mix(mix(hsh(i, j, k), hsh(i + 1, j, k), u), mix(hsh(i, j + 1, k), hsh(i + 1, j + 1, k), u), v), mix(mix(hsh(i, j, k + 1), hsh(i + 1, j, k + 1), u), mix(hsh(i, j + 1, k + 1), hsh(i + 1, j + 1, k + 1), u), v), w) };
  const fbm = (x, y, z) => nz3(x, y, z) * .5 + nz3(x * 2.03 + 7, y * 2.03, z * 2.03) * .3 + nz3(x * 4.1, y * 4.1 + 3, z * 4.1) * .2;
  const V3 = (a, b, c) => Array.isArray(a) ? new T3.Vector3(a[0], a[1], a[2]) : new T3.Vector3(a, b, c);
  const v1 = new T3.Vector3(), v2 = new T3.Vector3(), v3 = new T3.Vector3(), v4 = new T3.Vector3(), q1 = new T3.Quaternion(), q2 = new T3.Quaternion(), ABAJO = new T3.Vector3(0, -1, 0), Y_ = new T3.Vector3(0, 1, 0);

  // ---------- geometría: loft de anillos (u alrededor, v a lo largo; y baja con v → caras hacia afuera), costura sin marca
  function costura(g) { g.computeVertexNormals(); const p = g.attributes.position, n = g.attributes.normal, M = new Map();
    for (let i = 0; i < p.count; i++) { const k = Math.round(p.getX(i) * 2e3) + "," + Math.round(p.getY(i) * 2e3) + "," + Math.round(p.getZ(i) * 2e3); let L = M.get(k); if (!L) M.set(k, L = []); L.push(i) }
    M.forEach(L => { if (L.length < 2) return; let x = 0, y = 0, z = 0; L.forEach(i => { x += n.getX(i); y += n.getY(i); z += n.getZ(i) }); const l = Math.hypot(x, y, z) || 1; L.forEach(i => n.setXYZ(i, x / l, y / l, z / l)) }); return g }
  function loft(nU, nV, fn, o = {}) { const P = [], UV = [], I = [];
    for (let j = 0; j <= nV; j++) for (let i = 0; i <= nU; i++) { const u = i / nU, v = j / nV, q = fn(u, v); P.push(q[0], q[1], q[2]); UV.push(u * (o.ru || 1) + (o.ou || 0), (1 - v) * (o.rv || 1) + (o.ov || 0)) }
    for (let j = 0; j < nV; j++) for (let i = 0; i < nU; i++) { const a = j * (nU + 1) + i, b = a + 1, c = a + nU + 1, d = c + 1; I.push(a, c, b, b, c, d) }
    const g = new T3.BufferGeometry(); g.setAttribute("position", new T3.Float32BufferAttribute(P, 3)); g.setAttribute("uv", new T3.Float32BufferAttribute(UV, 2)); g.setIndex(I); return costura(g) }
  const tubo = (y0, len, nU, nV, fn, o) => loft(nU, nV, (u, v) => { const th = u * TAU, r = fn(v, th); return [Math.sin(th) * r[0] + (r[3] || 0), y0 - v * len + (r[4] || 0), Math.cos(th) * r[1] + (r[2] || 0)] }, o);
  function tuboCurva(pts, nU, nV, rad, o) { const cv = new T3.CatmullRomCurve3(pts), F = cv.computeFrenetFrames(nV, false);
    return loft(nU, nV, (u, v) => { const j = Math.round(v * nV), p = cv.getPointAt(v), th = u * TAU, r = rad(v, th), N = F.normals[j], B = F.binormals[j], c = Math.cos(th), s = Math.sin(th);
      return [p.x + r * (c * N.x + s * B.x), p.y + r * (c * N.y + s * B.y), p.z + r * (c * N.z + s * B.z)] }, o) }
  function fusionar(L) { const P = [], N = [], UV = [], C = [], I = []; let o = 0; const hayC = L.some(g => g.attributes.color);
    L.forEach(g => { if (!g.index) { const n = g.attributes.position.count; g.setIndex([...Array(n).keys()]) } const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv, co = g.attributes.color;
      for (let i = 0; i < p.count; i++) { P.push(p.getX(i), p.getY(i), p.getZ(i)); N.push(n.getX(i), n.getY(i), n.getZ(i)); UV.push(uv ? uv.getX(i) : 0, uv ? uv.getY(i) : 0); if (hayC) co ? C.push(co.getX(i), co.getY(i), co.getZ(i)) : C.push(1, 1, 1) }
      const ix = g.index.array; for (let i = 0; i < ix.length; i++) I.push(ix[i] + o); o += p.count });
    const g = new T3.BufferGeometry(); g.setAttribute("position", new T3.Float32BufferAttribute(P, 3)); g.setAttribute("normal", new T3.Float32BufferAttribute(N, 3)); g.setAttribute("uv", new T3.Float32BufferAttribute(UV, 2));
    if (hayC) g.setAttribute("color", new T3.Float32BufferAttribute(C, 3)); g.setIndex(I); return g }
  const mover = (geo, m) => { geo.applyMatrix4(m); return geo };
  const MX = (x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) => new T3.Matrix4().compose(new T3.Vector3(x, y, z), new T3.Quaternion().setFromEuler(new T3.Euler(rx, ry, rz, "YXZ")), new T3.Vector3(sx, sy, sz));

  // ======================= TEXTURAS (canvas) =======================
  // paños de abrigo: [tipo, color base]
  const PAL = [["lana", "#5f5e5a"], ["lana", "#706c64"], ["lana", "#45464a"], ["tweed", "#5c4834"], ["tweed", "#6a5a44"], ["negro", "#1f1e21"], ["negro", "#2a272b"], ["verde", "#38452f"], ["verde", "#4a523a"],
    ["cuadros", "#4b3b2d"], ["cuadros", "#3d4339"], ["cuadros", "#57524b"], ["pana", "#4f3c2b"], ["marino", "#252c3c"], ["mostaza", "#6c5d35"], ["vino", "#422828"], ["camel", "#7b6749"], ["lana", "#57534c"], ["tweed", "#4c4a40"]];
  const varia = (hex, r) => { const c = new T3.Color(hex), hsl = {}; c.getHSL(hsl); c.setHSL(hsl.h + (r() - .5) * .03, hsl.s * (.75 + r() * .4), hsl.l * (.82 + r() * .3)); return "#" + c.getHexString() };
  function tela(c, r, tipo, base, x0, y0, w, h) {
    c.fillStyle = base; c.fillRect(x0, y0, w, h); const A = w * h;
    const lin = (x, y, x2, y2, col, lw) => { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2); c.stroke() };
    const mancha = (x, y, rr, col) => { const gr = c.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, col); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(x - rr, y - rr, 2 * rr, 2 * rr) };
    if (tipo === "tweed") { const bw = 12 + r() * 7 | 0; for (let x = x0; x < x0 + w; x += bw) { const d = ((x - x0) / bw | 0) % 2 ? 1 : -1; for (let y = y0 - bw; y < y0 + h + bw; y += 4) lin(x, y, x + bw, y + d * bw * .9, ((y - y0) / 4 | 0) % 2 ? "rgba(235,215,180,.1)" : "rgba(0,0,0,.2)", 2) }
      const FL = ["rgba(170,96,52,.55)", "rgba(220,206,170,.5)", "rgba(96,118,74,.5)", "rgba(20,14,8,.5)", "rgba(140,140,150,.45)"]; for (let i = 0; i < A / 80; i++) { c.fillStyle = FL[r() * FL.length | 0]; c.fillRect(x0 + r() * w, y0 + r() * h, 1.5 + r() * 2.5, 1 + r()) } }
    else if (tipo === "cuadros") { const p = 56 + r() * 70, ox = r() * p, oy = r() * p, ac = ["rgba(130,40,30,.22)", "rgba(60,80,110,.24)", "rgba(170,150,70,.2)", "rgba(40,70,40,.22)"][r() * 4 | 0];
      for (let k = x0 - ox; k < x0 + w; k += p) { c.fillStyle = "rgba(0,0,0,.26)"; c.fillRect(k, y0, p * .3, h); c.fillStyle = "rgba(215,195,150,.11)"; c.fillRect(k + p * .52, y0, p * .07, h); c.fillStyle = ac; c.fillRect(k + p * .78, y0, 3, h) }
      for (let k = y0 - oy; k < y0 + h; k += p) { c.fillStyle = "rgba(0,0,0,.22)"; c.fillRect(x0, k, w, p * .3); c.fillStyle = "rgba(215,195,150,.1)"; c.fillRect(x0, k + p * .52, w, p * .07); c.fillStyle = ac; c.fillRect(x0, k + p * .78, w, 3) }
      for (let k = -h; k < w; k += 3) lin(x0 + k, y0, x0 + k + h, y0 + h, "rgba(0,0,0,.07)", 1) }
    else if (tipo === "pana") { for (let x = x0; x < x0 + w; x += 7) { lin(x, y0, x, y0 + h, "rgba(0,0,0,.3)", 2); lin(x + 3.5, y0, x + 3.5, y0 + h, "rgba(220,190,150,.1)", 2.5) }
      for (let i = 0; i < 8; i++) mancha(x0 + r() * w, y0 + r() * h, 40 + r() * 90, "rgba(200,170,130,.12)") }
    else if (tipo === "negro" || tipo === "marino") { for (let k = -h; k < w; k += 3) lin(x0 + k, y0, x0 + k + h, y0 + h, (k / 3 | 0) % 2 ? "rgba(255,255,255,.035)" : "rgba(0,0,0,.18)", 1.3);
      for (let i = 0; i < A / 900; i++) { c.fillStyle = "rgba(190,184,170,.25)"; c.fillRect(x0 + r() * w, y0 + r() * h, 1 + r() * 3, 1) } }
    else { for (let i = 0; i < A / 2200; i++) mancha(x0 + r() * w, y0 + r() * h, 10 + r() * 40, r() < .5 ? "rgba(0,0,0,.12)" : "rgba(255,245,220,.07)");
      if (tipo === "verde" || tipo === "camel") for (let y = y0; y < y0 + h; y += 5) lin(x0, y, x0 + w, y + (r() - .5) * 2, "rgba(0,0,0,.1)", 1.5) }
    // fibras, bolitas, gastado, manchas
    for (let i = 0; i < A / 55; i++) { const x = x0 + r() * w, y = y0 + r() * h, a = r() * 6.3, l = 2 + r() * 6; lin(x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, r() < .5 ? "rgba(255,245,225,.07)" : "rgba(0,0,0,.1)", 1) }
    for (let i = 0; i < A / 650; i++) { c.fillStyle = "rgba(230,222,205,.2)"; c.beginPath(); c.arc(x0 + r() * w, y0 + r() * h, .8 + r() * 1.6, 0, 7); c.fill() }
    for (let i = 0; i < 3 + r() * 5; i++) mancha(x0 + r() * w, y0 + r() * h, 30 + r() * 150, r() < .5 ? "rgba(214,204,184,.13)" : "rgba(8,5,2,.32)");
    for (let i = 0; i < r() * 3; i++) { const x = x0 + r() * w, y = y0 + r() * h, rr = 8 + r() * 30; for (let k = 0; k < 5; k++) mancha(x + (r() - .5) * rr, y + (r() - .5) * rr + k * 6, rr * .6, "rgba(40,30,15,.18)") }   // manchas de agua/barro chorreadas
    // agujeros de polilla con borde deshilachado
    for (let i = 0; i < (r() * 4 | 0); i++) { const x = x0 + r() * w, y = y0 + r() * h, rr = 4 + r() * 13;
      for (let k = 0; k < 18; k++) { const a = r() * 6.3; lin(x, y, x + Math.cos(a) * rr * 1.5, y + Math.sin(a) * rr * 1.4, "rgba(200,190,165,.3)", 1) }
      c.fillStyle = "#070504"; c.beginPath(); c.ellipse(x, y, rr, rr * (.5 + r() * .5), r() * 3, 0, 7); c.fill() }
    // zurcido (trama de hilo)
    if (r() < .4) { const x = x0 + r() * (w - 60), y = y0 + r() * (h - 60), s = 26 + r() * 34, col = r() < .5 ? "rgba(214,204,176,.75)" : "rgba(150,140,120,.7)";
      for (let k = 0; k < s; k += 4) { lin(x + k, y, x + k + (r() - .5) * 2, y + s, col, 1.6); lin(x, y + k, x + s, y + k + (r() - .5) * 2, col, 1.6) } }
  }
  // hilo: costura en zigzag (o cruz o recta) sobre la línea (x1,y1)→(x2,y2)
  function costuraTex(c, r, x1, y1, x2, y2, est) { const L = Math.hypot(x2 - x1, y2 - y1); if (L < 10) return; const dx = (x2 - x1) / L, dy = (y2 - y1) / L, nx = -dy, ny = dx;
    const P = (s, o) => [x1 + dx * s + nx * o, y1 + dy * s + ny * o];
    c.lineCap = "round"; c.strokeStyle = "rgba(0,0,0,.62)"; c.lineWidth = 7; c.beginPath(); c.moveTo(...P(0, 0)); c.lineTo(...P(L, 0)); c.stroke();
    const paso = est === "recto" ? 15 : 19 + r() * 4, A = 8 + r() * 5, col = ["#d8cfb4", "#cfc8b8", "#e2d6b0", "#bdb5a2", "#c9b99a"][r() * 5 | 0];
    const hilo = (a, b) => { c.strokeStyle = "rgba(0,0,0,.55)"; c.lineWidth = 4.6; c.beginPath(); c.moveTo(a[0] + 2, a[1] + 2); c.lineTo(b[0] + 2, b[1] + 2); c.stroke();
      c.strokeStyle = col; c.lineWidth = 3.4; c.beginPath(); c.moveTo(...a); c.lineTo(...b); c.stroke(); c.strokeStyle = "rgba(255,255,240,.35)"; c.lineWidth = 1.1; c.beginPath(); c.moveTo(a[0] - .6, a[1] - .6); c.lineTo(b[0] - .6, b[1] - .6); c.stroke();
      c.fillStyle = "rgba(0,0,0,.7)"; for (const q of [a, b]) { c.beginPath(); c.arc(q[0], q[1], 1.8, 0, 7); c.fill() } };
    for (let s = 5; s < L - 5; s += paso) { if (r() < .03) continue; const j = (r() - .5) * 3;
      if (est === "zigzag") { hilo(P(s, -A + j), P(s + paso / 2, A + j)); hilo(P(s + paso / 2, A + j), P(s + paso, -A + j)) }
      else if (est === "cruz") { hilo(P(s, -A), P(s + paso * .8, A)); hilo(P(s, A), P(s + paso * .8, -A)) }
      else hilo(P(s, j * .3), P(s + paso * .6, j * .3)) } }
  function parches(W, H, seed) {
    const T = tex(W, H, (c, w, h) => { const r = rnd(seed); c.fillStyle = "#100e0d"; c.fillRect(0, 0, w, h);
      const P = []; let y = 0; while (y < h) { let rh = 170 + r() * 270; if (h - y - rh < 150) rh = h - y; let x = 0; while (x < w) { let rw = 140 + r() * 330; if (w - x - rw < 120) rw = w - x; P.push([x, y, rw, rh]); x += rw } y += rh }
      P.forEach(([x, y, pw, ph]) => { const [tipo, base] = PAL[r() * PAL.length | 0]; c.save(); c.beginPath();
        const borde = (ax, ay, bx, by, first) => { const n = Math.max(2, Math.hypot(bx - ax, by - ay) / 22 | 0); for (let k = first ? 0 : 1; k <= n; k++) { const f = k / n, px = mix(ax, bx, f) + (k && k < n ? (r() - .5) * 5 : 0), py = mix(ay, by, f) + (k && k < n ? (r() - .5) * 5 : 0); k ? c.lineTo(px, py) : c.moveTo(px, py) } };
        const i = 2; borde(x + i, y + i, x + pw - i, y + i, true); borde(x + pw - i, y + i, x + pw - i, y + ph - i); borde(x + pw - i, y + ph - i, x + i, y + ph - i); borde(x + i, y + ph - i, x + i, y + i); c.closePath(); c.clip();
        tela(c, r, tipo, varia(base, r), x - 4, y - 4, pw + 8, ph + 8);
        c.lineWidth = 16; c.strokeStyle = "rgba(0,0,0,.28)"; c.stroke(); c.lineWidth = 5; c.strokeStyle = "rgba(255,240,220,.05)"; c.stroke(); c.restore();
        // a veces un paño tiene un bolsillo/ojal pintado o una etiqueta vieja
        if (r() < .2) { const ex = x + 20 + r() * (pw - 80), ey = y + 20 + r() * (ph - 50); c.fillStyle = "rgba(220,210,180,.55)"; c.fillRect(ex, ey, 36, 18); c.strokeStyle = "rgba(60,50,30,.6)"; c.lineWidth = 1; c.strokeRect(ex + 3, ey + 3, 30, 12); for (let k = 0; k < 3; k++) { c.fillStyle = "rgba(60,40,30,.5)"; c.fillRect(ex + 6, ey + 6 + k * 3, 22 * r(), 1.2) } }
        if (r() < .3) { const ex = x + 20 + r() * (pw - 60), ey = y + 20 + r() * (ph - 40); c.fillStyle = "#0b0807"; c.beginPath(); c.ellipse(ex, ey, 11, 3.4, 0, 0, 7); c.fill(); c.strokeStyle = "rgba(200,190,160,.5)"; c.lineWidth = 2; c.stroke() } });
      // costuras: arriba e izquierda de cada paño (los de los bordes se cosen al dar la vuelta)
      P.forEach(([x, y, pw, ph]) => { const est = () => { const q = r(); return q < .62 ? "zigzag" : q < .85 ? "cruz" : "recto" };
        costuraTex(c, r, x, y, x + pw, y, est()); costuraTex(c, r, x, y, x, y + ph, est());
        // flecos en algunos bordes
        if (r() < .35) for (let k = 0; k < pw / 6; k++) { const fx = x + k * 6 + r() * 3; c.strokeStyle = r() < .5 ? "rgba(190,180,160,.45)" : "rgba(10,8,6,.5)"; c.lineWidth = 1.2; c.beginPath(); c.moveTo(fx, y + 4); c.lineTo(fx + (r() - .5) * 4, y + 9 + r() * 10); c.stroke() } });
      for (let i = 0; i < 900; i++) { c.strokeStyle = "rgba(225,215,190,.16)"; c.lineWidth = 1; const x = r() * w, yy = r() * h; c.beginPath(); c.moveTo(x, yy); c.bezierCurveTo(x + (r() - .5) * 30, yy + (r() - .5) * 30, x + (r() - .5) * 40, yy + (r() - .5) * 40, x + (r() - .5) * 50, yy + (r() - .5) * 50); c.stroke() }   // pelusa e hilos sueltos pintados
    }, [1, 1]); return T }
  const bumpDe = (T, k = 1.45, b = 30, rep = [1, 1]) => tex(T.image.width, T.image.height, (c, w, h) => { const s = T.image.getContext("2d").getImageData(0, 0, w, h).data, d = c.createImageData(w, h);
    for (let i = 0; i < w * h; i++) { const l = s[i * 4] * .3 + s[i * 4 + 1] * .59 + s[i * 4 + 2] * .11, v = Math.min(255, b + l * k); d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255 } c.putImageData(d, 0, 0) }, rep);
  const T_PAR = parches(2048, 2048, 4101), T_PAR_B = bumpDe(T_PAR);
  const T_PAR2 = parches(1024, 2048, 4202), T_PAR2_B = bumpDe(T_PAR2);
  // el abrigo ROJO (de la madre): paño rojo hervido, gastado en los bordes, polvo
  const T_ROJO = tex(1024, 1024, (c, w, h) => { const r = rnd(4303); c.fillStyle = "#9a1f19"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) { const x = r() * w, y = r() * h, rr = 20 + r() * 110, gr = c.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, r() < .5 ? "rgba(70,8,6,.28)" : "rgba(196,70,50,.18)"); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(x - rr, y - rr, 2 * rr, 2 * rr) }
    for (let k = -h; k < w; k += 3) { c.strokeStyle = (k / 3 | 0) % 2 ? "rgba(255,200,180,.04)" : "rgba(0,0,0,.12)"; c.lineWidth = 1.2; c.beginPath(); c.moveTo(k, 0); c.lineTo(k + h, h); c.stroke() }
    for (let i = 0; i < 26000; i++) { const x = r() * w, y = r() * h, a = r() * 6.3, l = 2 + r() * 5; c.strokeStyle = r() < .5 ? "rgba(255,170,150,.08)" : "rgba(30,0,0,.12)"; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke() }
    for (let i = 0; i < 1400; i++) { c.fillStyle = "rgba(240,190,170,.18)"; c.beginPath(); c.arc(r() * w, r() * h, .8 + r() * 1.4, 0, 7); c.fill() }
    for (let i = 0; i < 12; i++) { const x = r() * w, y = r() * h, rr = 30 + r() * 120, gr = c.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, "rgba(40,30,20,.25)"); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(x - rr, y - rr, 2 * rr, 2 * rr) } }, [1, 1]);
  const T_ROJO_B = bumpDe(T_ROJO, 2, 0);
  // el BOTÓN-cara: hueso con vetas de carey, anillos del torno, mugre en los agujeros, rajaduras con borde claro, rayones
  const BH = [[-.36, .36], [.36, .36], [.36, -.36], [-.36, -.36]], RB = 1.2, RH = .2;   // agujeros (en m del botón) y radios
  const T_HUESO = tex(1024, 1024, (c, w, h) => { const r = rnd(4404), U = x => (x / (2 * RB) + .5) * w, Vv = y => (.5 - y / (2 * RB)) * h; c.fillStyle = "#d6c9a8"; c.fillRect(0, 0, w, h);
    const blob = (x, y, rx, ry, a, col) => { c.save(); c.translate(x, y); c.rotate(a); c.scale(1, ry / rx); const gr = c.createRadialGradient(0, 0, 0, 0, 0, rx); gr.addColorStop(0, col); gr.addColorStop(.6, col.replace(/[\d.]+\)$/, m => (parseFloat(m) * .6).toFixed(2) + ")")); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(-rx, -rx, 2 * rx, 2 * rx); c.restore() };
    for (let i = 0; i < 140; i++) blob(r() * w, r() * h, 20 + r() * 110, 10 + r() * 60, r() * 3, ["rgba(160,104,44,.45)", "rgba(70,40,18,.55)", "rgba(196,150,82,.35)", "rgba(110,62,26,.5)", "rgba(235,222,190,.35)"][r() * 5 | 0]);
    for (let i = 0; i < 40; i++) blob(r() * w, r() * h, 6 + r() * 20, 4 + r() * 10, r() * 3, "rgba(40,22,10,.6)");
    for (let rr = 20; rr < w / 2; rr += 7 + r() * 5) { c.strokeStyle = r() < .5 ? "rgba(60,40,20,.07)" : "rgba(255,245,220,.07)"; c.lineWidth = 1.5 + r() * 2; c.beginPath(); c.arc(w / 2, h / 2, rr, 0, 7); c.stroke() }
    { const gr = c.createRadialGradient(w / 2, h / 2, w * .38, w / 2, h / 2, w * .5); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(.75, "rgba(40,26,12,.35)"); gr.addColorStop(1, "rgba(20,12,6,.7)"); c.fillStyle = gr; c.fillRect(0, 0, w, h) }
    BH.forEach(([x, y]) => { const px = U(x), py = Vv(y), gr = c.createRadialGradient(px, py, RH / (2 * RB) * w * .9, px, py, RH / (2 * RB) * w * 2.1); gr.addColorStop(0, "rgba(16,10,4,.85)"); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(px - 150, py - 150, 300, 300) });
    // hilo gastó un surco claro entre agujeros
    [[0, 2], [1, 3]].forEach(([a, b]) => { c.strokeStyle = "rgba(240,230,200,.18)"; c.lineWidth = 26; c.beginPath(); c.moveTo(U(BH[a][0]), Vv(BH[a][1])); c.lineTo(U(BH[b][0]), Vv(BH[b][1])); c.stroke() });
    const grieta = (x, y, a, len, wd, d) => { const P = [[x, y]]; for (let i = 0; i < len; i++) { a += (r() - .5) * .7; x += Math.cos(a) * 6; y += Math.sin(a) * 6; P.push([x, y]); if (d < 3 && r() < .045) grieta(x, y, a + (r() < .5 ? -1 : 1) * (.5 + r() * .8), len * .45 | 0, wd * .6, d + 1) }
      c.lineCap = "round"; c.lineJoin = "round"; c.strokeStyle = "rgba(255,244,214,.35)"; c.lineWidth = wd + 3; c.beginPath(); P.forEach((p, i) => i ? c.lineTo(p[0] + 1.5, p[1] + 1.5) : c.moveTo(p[0] + 1.5, p[1] + 1.5)); c.stroke();
      c.strokeStyle = "rgba(14,8,3,.92)"; c.lineWidth = wd; c.beginPath(); P.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke() };
    grieta(U(-1.05), Vv(.55), -.35, 80, 6, 0); grieta(U(.95), Vv(-.75), 2.6, 70, 5, 0); grieta(U(.15), Vv(1.15), 1.75, 60, 4.5, 0); grieta(U(-.7), Vv(-.95), -1.2, 40, 3.5, 1); grieta(U(1.1), Vv(.35), 3.3, 45, 3.5, 1);
    for (let i = 0; i < 90; i++) { c.strokeStyle = "rgba(30,20,10,.22)"; c.lineWidth = 1; let x = r() * w, y = r() * h, a = r() * 6.3; c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 8; k++) { a += (r() - .5) * 1.2; x += Math.cos(a) * 9; y += Math.sin(a) * 9; c.lineTo(x, y) } c.stroke() }   // craquelado
    for (let i = 0; i < 160; i++) { c.strokeStyle = r() < .5 ? "rgba(255,250,235,.22)" : "rgba(40,26,12,.25)"; c.lineWidth = .8 + r(); const x = r() * w, y = r() * h, a = r() * 6.3, l = 10 + r() * 50; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke() }
    for (let i = 0; i < 3000; i++) { c.fillStyle = r() < .5 ? "rgba(40,26,10,.12)" : "rgba(255,250,230,.1)"; c.fillRect(r() * w, r() * h, 2, 2) } });
  const T_HUESO_B = bumpDe(T_HUESO, 1.3, 20);
  // alambre oxidado
  const T_OXIDO = tex(256, 1024, (c, w, h) => { const r = rnd(4505); c.fillStyle = "#38332f"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { const x = r() * w, y = r() * h, rr = 6 + r() * 50, gr = c.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, ["rgba(122,62,26,.7)", "rgba(160,82,30,.6)", "rgba(90,46,20,.7)", "rgba(20,16,14,.5)", "rgba(110,100,90,.35)"][r() * 5 | 0]); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(x - rr, y - rr, 2 * rr, 2 * rr) }
    for (let i = 0; i < 5000; i++) { c.fillStyle = r() < .5 ? "rgba(0,0,0,.4)" : "rgba(190,110,50,.3)"; c.fillRect(r() * w, r() * h, 1.5 + r() * 2, 1.5 + r() * 2) }
    for (let i = 0; i < 60; i++) { c.strokeStyle = "rgba(120,60,24,.35)"; c.lineWidth = 2 + r() * 4; const x = r() * w, y = r() * h; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - .5) * 8, y + 30 + r() * 120); c.stroke() } }, [1, 1]);
  const T_OXIDO_B = bumpDe(T_OXIDO, 1.6, 10);
  // botón chico (cuatro agujeros, sobre el que tiñe el color de cada instancia)
  const T_BOTON = tex(256, 256, (c, w, h) => { const r = rnd(4606); c.fillStyle = "#c8c8c8"; c.fillRect(0, 0, w, h);
    const ring = (rr, col, lw) => { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.arc(128, 128, rr, 0, 7); c.stroke() };
    ring(118, "rgba(0,0,0,.5)", 12); ring(104, "rgba(255,255,255,.35)", 6); ring(92, "rgba(0,0,0,.25)", 6);
    for (let i = 0; i < 400; i++) { c.fillStyle = r() < .5 ? "rgba(0,0,0,.12)" : "rgba(255,255,255,.12)"; c.fillRect(r() * w, r() * h, 2, 2) }
    const H4 = [[-30, -30], [30, -30], [30, 30], [-30, 30]]; c.strokeStyle = "rgba(240,236,220,.9)"; c.lineWidth = 9; c.beginPath(); c.moveTo(128 + H4[0][0], 128 + H4[0][1]); c.lineTo(128 + H4[2][0], 128 + H4[2][1]); c.moveTo(128 + H4[1][0], 128 + H4[1][1]); c.lineTo(128 + H4[3][0], 128 + H4[3][1]); c.stroke();
    H4.forEach(([x, y]) => { c.fillStyle = "#0a0908"; c.beginPath(); c.arc(128 + x, 128 + y, 12, 0, 7); c.fill() }) });
  const T_MADERA = tex(256, 1024, (c, w, h) => { const r = rnd(4707); c.fillStyle = "#3d2c1e"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) { c.strokeStyle = r() < .5 ? "rgba(16,10,5,.4)" : "rgba(120,90,60,.22)"; c.lineWidth = 1 + r() * 3; const x = r() * w; c.beginPath(); c.moveTo(x, 0); for (let y = 0; y < h; y += 16) c.lineTo(x + Math.sin(y * .02 + i) * 4, y); c.stroke() }
    for (let i = 0; i < 9; i++) { c.fillStyle = "rgba(10,6,3,.7)"; c.fillRect(r() * w, r() * h, 2 + r() * 3, 40 + r() * 140) } }, [1, 1]);
  const T_NIEBLA = tex(256, 256, (c, w, h) => { const r = rnd(4808); c.clearRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) { const x = w / 2 + (r() - .5) * w * .62, y = h / 2 + (r() - .5) * h * .42, rr = 18 + r() * 60, gr = c.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, "rgba(255,255,255,.15)"); gr.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = gr; c.fillRect(0, 0, w, h) } });
  const T_PUNTO = tex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(.4, "rgba(255,255,255,.45)"); gr.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = gr; c.fillRect(0, 0, w, h) });

  // ======================= MATERIALES =======================
  const telaM = (map, bump, o = {}) => new T3.MeshPhysicalMaterial({ color: "#ffffff", map, bumpMap: bump, bumpScale: 2.4, roughness: .97, sheen: .85, sheenColor: new T3.Color("#6d6c78"), sheenRoughness: .7, side: T3.DoubleSide, ...o });
  const M_TELA = telaM(T_PAR, T_PAR_B), M_TELA2 = telaM(T_PAR2, T_PAR2_B, { color: "#e8e4dc" });
  const M_ROJO = new T3.MeshPhysicalMaterial({ color: "#ffffff", map: T_ROJO, bumpMap: T_ROJO_B, bumpScale: 2, roughness: .9, sheen: .7, sheenColor: new T3.Color("#d46048"), sheenRoughness: .6, emissive: "#3a0503", emissiveIntensity: .35, side: T3.DoubleSide });
  const M_HUESO = new T3.MeshPhysicalMaterial({ color: "#ffffff", map: T_HUESO, bumpMap: T_HUESO_B, bumpScale: 3, roughness: .5, clearcoat: .4, clearcoatRoughness: .45, emissive: "#14100a", emissiveIntensity: .4 });
  const M_HUECO = new T3.MeshBasicMaterial({ color: "#000000" });
  const M_OXIDO = new T3.MeshStandardMaterial({ color: "#ffffff", map: T_OXIDO, bumpMap: T_OXIDO_B, bumpScale: 2.5, roughness: .72, metalness: .5 });
  const M_HILO = new T3.MeshStandardMaterial({ color: "#958d78", roughness: .92 });
  const M_HILO_R = new T3.MeshStandardMaterial({ color: "#e4dcc0", roughness: .9, emissive: "#2a261c", emissiveIntensity: .5 });
  const M_HILO_N = new T3.MeshStandardMaterial({ color: "#1c1612", roughness: .8 });
  const M_BOTON = new T3.MeshPhysicalMaterial({ color: "#ffffff", map: T_BOTON, roughness: .45, clearcoat: .5, clearcoatRoughness: .4 });
  const M_MADERA = new T3.MeshStandardMaterial({ color: "#ffffff", map: T_MADERA, bumpMap: T_MADERA, bumpScale: 2, roughness: .85 });
  const M_CUERO = new T3.MeshStandardMaterial({ color: "#3a2a1e", roughness: .62, bumpMap: T_OXIDO_B, bumpScale: 1, side: T3.DoubleSide });
  const M_LATON = new T3.MeshStandardMaterial({ color: "#8a744a", roughness: .42, metalness: .75, bumpMap: T_OXIDO_B, bumpScale: 1 });
  const M_OSCURO = new T3.MeshStandardMaterial({ color: "#0b0908", roughness: 1, side: T3.DoubleSide });

  // ======================= MEDIDAS (m). Los de bloques miden ≈ 2 =======================
  const LT = 6.0, LS = 5.7, LA = .55, HIP = LT + LS + LA;            // muslo, canilla, tobillo → cadera a 11,45
  const A_PASO = .3, PASO = 4 * (LT + LS) * Math.sin(A_PASO);         // m por ciclo de dos pasos (≈ 12,9)
  const UA = 5.2, FA = 5.0;                                           // percha del brazo y del antebrazo
  const LF = [1.55, 1.95, 2.2, 1.7], DEDO = 2;                         // largo de los cuatro ganchos-dedo; el que golpea es el 2
  const pieza = (geo, mat, par, x = 0, y = 0, z = 0, sombra = true) => { const m = new T3.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = sombra; m.receiveShadow = true; par.add(m); return m };
  const grupo = (par, x = 0, y = 0, z = 0) => { const g = new T3.Group(); g.position.set(x, y, z); par.add(g); return g };

  const g = new T3.Group(); g.name = "tejedora"; g.visible = false; scene.add(g);
  const cuerpo = grupo(g), caderas = grupo(cuerpo, 0, HIP, 0), pelvis = grupo(caderas), faldaG = grupo(caderas);
  const col1 = grupo(pelvis, 0, .2, 0), T1G = grupo(col1), col2 = grupo(col1, 0, 4.0, 0), T2G = grupo(col2);
  const cuello = grupo(col2, 0, 4.45, .4), cabeza = grupo(cuello, 0, 1.6, .2);
  const J = { muslo: [], rodilla: [], tobillo: [], hombro: [], codo: [], muneca: [], dedos: [[], []] };

  // ======================= TORSO: capas de abrigos como tejas (cada ruedo es un escalón) =======================
  const HEM1 = [{ y: .7, a: .16, f: 3, p: .3 }, { y: 2.1, a: .2, f: 2, p: 1.7 }, { y: 3.35, a: .12, f: 4, p: 2.5 }];
  const HEM2 = [{ y: .1, a: .14, f: 3, p: 4.1 }, { y: 1.45, a: .1, f: 2, p: .6 }, { y: 2.75, a: .16, f: 3, p: 5.2 }];
  const hemY = (H, th) => H.y + H.a * Math.sin(th * H.f + H.p) + .07 * Math.sin(th * 7 + H.p * 3);
  const tejas = (L, th, y) => { let d = 0; for (const H of L) { const s = y - hemY(H, th); d += .17 * S_(-.07, 0, s) * (1 - .45 * S_(0, .9, s)) } return d };
  const bulto = (th, y, sd) => { const x = Math.sin(th), z = Math.cos(th); return (fbm(x * 1.6 + sd, y * .55, z * 1.6) - .5) * .5 + .05 * Math.sin(th * 11 + 1.5 * Math.sin(y * .9 + sd)) + .025 * Math.sin(th * 23 + y * 2.1) };
  function sup1(th, y) { const k = S_(-.2, 4.2, y), c = Math.cos(th), s = Math.sin(th); let rx = mix(1.3, 1.62, k), rz = mix(1.0, 1.25, k);
    const d = bulto(th, y, 1) + tejas(HEM1, th, y), cierre = Math.sqrt(Math.max(0, 1 - (Math.min(0, y + .3) / .75) ** 2));
    return [s * (rx + d) * cierre, y, (c * (rz + d) - .06 * k) * cierre] }
  function sup2(th, y) { const c = Math.cos(th), s = Math.sin(th), k = S_(-.8, 1.4, y), dh = Math.min(Math.abs(th - PI / 2), Math.abs(th + PI / 2), Math.abs(th - 1.5 * PI));
    let rx = mix(1.62, 1.78, k) + .22 * ex2(((y - 3.2) / .55) ** 2), rz = mix(1.25, 1.35, k); const cierre = S_(3.4, 4.9, y); rx *= 1 - .6 * cierre; rz *= 1 - .48 * cierre;
    const joroba = c < 0 ? .62 * ex2(((y - 2.6) / 1.1) ** 2) * c * c : 0, hombro = .34 * ex2((dh / .32) ** 2 + ((y - 3.35) / .38) ** 2);
    const d = bulto(th, y, 4) + tejas(HEM2, th, y) * (1 - cierre) + hombro;
    return [s * (rx + d), y, c * (rz + d + joroba) - .05] }
  const nrm = (f, th, y) => { const e = .01, a = f(th, y), b = f(th + e, y), cc = f(th, y + e); return new T3.Vector3().crossVectors(V3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), V3(cc[0] - a[0], cc[1] - a[1], cc[2] - a[2])).normalize() };
  pieza(loft(128, 80, (u, v) => sup1(u * TAU, 4.5 - v * 5.55), { ru: 2.2, rv: 1.6 }), M_TELA, T1G);
  pieza(loft(140, 96, (u, v) => sup2(u * TAU, 5.0 - v * 5.9), { ru: 2.4, rv: 1.9, ou: .37, ov: .21 }), M_TELA, T2G);

  // ---------- puntadas 3D (hilo grueso claro, en zigzag) sobre las costuras de un cuerpo: InstancedMesh por grupo
  const G_PUNTADA = new T3.CylinderGeometry(.034, .034, 1, 6, 1); G_PUNTADA.translate(0, .5, 0);
  const matPuntada = (a, b, n, grosor = 1) => { const d = V3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), L = d.length(); q1.setFromUnitVectors(Y_, d.normalize()); return new T3.Matrix4().compose(V3(a[0], a[1], a[2]), q1.clone(), new T3.Vector3(grosor, L, grosor)) };
  function puntadas(sup, curva, s0, s1, paso, A, out, off = .05) { let sg = 1;
    for (let s = s0; s < s1 - paso * .5; s += paso) { const [t0, y0] = curva(s), [t1, y1] = curva(s + paso), a = V3(sup(t0, y0)), b = V3(sup(t1, y1)), n = nrm(sup, t0, y0), tg = b.clone().sub(a).normalize(), bn = new T3.Vector3().crossVectors(n, tg).normalize();
      const p0 = a.clone().addScaledVector(bn, -A * sg).addScaledVector(n, off), p1 = b.clone().addScaledVector(bn, A * sg).addScaledVector(n, off); out.push(matPuntada(p0.toArray(), p1.toArray())); sg = -sg } }
  const instanciar = (geo, mat, L, par, colores) => { const m = new T3.InstancedMesh(geo, mat, Math.max(1, L.length)); L.forEach((M, i) => m.setMatrixAt(i, M)); m.count = L.length; if (colores) { const c = new T3.Color(); colores.forEach((h, i) => m.setColorAt(i, c.set(h))) } m.castShadow = true; m.receiveShadow = true; par.add(m); return m };
  { const L1 = [], L2 = [];
    HEM1.forEach(H => puntadas(sup1, s => [s, hemY(H, s) + .08], 0, TAU, .085, .05, L1, .03));
    [.9, 2.4, 3.6, 5.1].forEach((th, i) => puntadas(sup1, s => [th + .05 * Math.sin(s * 2 + i), s], -.1, 4.2, .17, .07, L1, .03));
    HEM2.forEach(H => puntadas(sup2, s => [s, hemY(H, s) + .08], 0, TAU, .085, .05, L2, .03));
    [1.2, 2.2, 3.4, 4.3, 5.3].forEach((th, i) => puntadas(sup2, s => [th + .06 * Math.sin(s * 1.7 + i), s], -.5, 3.9, .17, .07, L2, .03));
    puntadas(sup2, s => [s, 3.85 + .1 * Math.sin(s * 3)], 0, TAU, .09, .06, L2, .03);
    instanciar(G_PUNTADA, M_HILO, L1, T1G); instanciar(G_PUNTADA, M_HILO, L2, T2G) }

  // ---------- botones de todos los tamaños (lathe con la cara en xy, mirando a +z): InstancedMesh por grupo
  const G_BOTON = (() => { const P = [[0, .2], [.6, .22], [.82, .3], [.98, .26], [1, .12], [.9, 0], [0, 0]].map(([x, y]) => new T3.Vector2(Math.max(.001, x), y)), geo = new T3.LatheGeometry(P, 22);
    geo.rotateX(PI / 2); const p = geo.attributes.position, uv = geo.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) * .5 + .5, p.getY(i) * .5 + .5); geo.computeVertexNormals(); return geo })();
  const COL_BOT = ["#c4b9a2", "#1b1917", "#5a3a22", "#8a6a3a", "#3c3b40", "#a8915e", "#cbbb9b", "#2e2a24", "#6e2c22", "#a89e88"];
  function botones(sup, n, zona, seed, out, cols, tam = [.08, .3]) { const r = rnd(seed);
    for (let i = 0; i < n; i++) { const th = zona.th0 + r() * (zona.th1 - zona.th0), y = zona.y0 + r() * (zona.y1 - zona.y0); if (zona.evita && zona.evita(th, y)) continue;
      const p = V3(sup(th, y)), nn = nrm(sup, th, y), s = r() < .08 ? tam[1] * 1.3 : tam[0] + r() ** 2 * (tam[1] - tam[0]), suelto = r() < .06;
      q1.setFromUnitVectors(new T3.Vector3(0, 0, 1), nn); if (suelto) q1.multiply(new T3.Quaternion().setFromEuler(new T3.Euler(1.3, 0, 0)));
      q1.multiply(new T3.Quaternion().setFromEuler(new T3.Euler((r() - .5) * .3, (r() - .5) * .3, r() * TAU)));
      p.addScaledVector(nn, suelto ? .05 : .02); if (suelto) p.y -= s * .9;
      out.push(new T3.Matrix4().compose(p, q1.clone(), new T3.Vector3(s, s, s * .9))); cols.push(COL_BOT[r() * COL_BOT.length | 0]) } }
  // la franja por donde se trepa (izquierda, th ≈ .55–.95) y la del abrigo rojo (centro) quedan con botones grandes y correas aparte
  const TREPA_TH = (u) => mix(.9, .62, u);
  const enRojo = (th, y) => { const t = th > PI ? th - TAU : th; return Math.abs(t) < .34 && y > .55 && y < 2.35 };

  // ======================= FALDÓN: colas de abrigo que cuelgan de la cintura (dos capas), ruedo comido y jirones =======================
  const FALDA_L = 5.4, FALDA2_L = 6.6;
  const gFaldon = (L, gap0, gapK, R0, R1, seed, ou) => { const r = rnd(seed), FR = Array.from({ length: 141 }, () => .03 + .9 * r() ** 2.4);
    const body = loft(140, 64, (u, v) => { const gap = gap0 + gapK * v, th = gap + u * (TAU - 2 * gap), y = 1.3 - v * L, c = Math.cos(th), sn = Math.sin(th);
      const Rx = mix(R0[0], R1[0], S_(0, 1, v)), Rz = mix(R0[1], R1[1], S_(0, 1, v)), A = .02 + .24 * S_(.04, 1, v),
        plie = A * (Math.sin(th * 7 + 1.3 + v * .8) * .7 + Math.sin(th * 13 + .4) * .3) + .08 * (fbm(sn * 2 + seed, v * 3, c * 2) - .5) + .12 * ex2(((v - .35) / .03) ** 2) * S_(.2, -.2, c) * 0,
        capa = .1 * S_(.2, .24, v) * (1 - S_(.24, .5, v)), deshi = S_(.92, 1, v) * FR[Math.round(u * 140)];
      return [sn * (Rx + plie + capa), y - deshi, c * (Rz + plie + capa) - .1] }, { ru: 2.5, rv: 3, ou });
    const tiras = []; for (let i = 0; i < 40; i++) { const gap = gap0 + gapK, th = gap + r() * (TAU - 2 * gap), Lt = .4 + r() * 1.8, wd = .1 + r() * .3, x0 = Math.sin(th) * (R1[0] + .05), z0 = Math.cos(th) * (R1[1] + .05) - .1, y0 = 1.3 - L - .05;
      tiras.push(loft(2, 10, (u, v) => { const tw = (u - .5) * wd * (1 - .6 * v), tx = Math.cos(th), tz = -Math.sin(th); return [x0 + tx * tw + Math.sin(th) * .06 * v, y0 - v * Lt, z0 + tz * tw + Math.cos(th) * .06 * v + .05 * Math.sin(v * 5 + i)] }, { ru: .2, rv: .4, ou: r(), ov: r() })) }
    return fusionar([body, ...tiras]) };
  const gF1 = gFaldon(FALDA_L, .5, .55, [1.5, 1.2], [2.15, 1.8], 51, 0), gF2 = gFaldon(FALDA2_L, 1.45, .2, [1.4, 1.12], [1.95, 1.65], 52, .5);
  const FALDA = pieza(gF1, M_TELA, faldaG), FALDA_B = Float32Array.from(gF1.attributes.position.array);
  const FALDA2 = pieza(gF2, M_TELA2, faldaG), FALDA2_B = Float32Array.from(gF2.attributes.position.array);
  const RUEDO = []; for (let i = 0; i <= 140; i += 4) RUEDO.push(64 * 141 + i);   // vértices del ruedo de la capa de afuera (para colgarles hilos)

  // ======================= PIERNAS: mangas enrolladas, rodilla abultada, pie de trapo =======================
  const rollo = (y, ph, k = .11) => k * ex2(((fr(y / .85 + ph) - .5) / .13) ** 2);
  const gMuslo = tubo(.6, LT + .95, 44, 72, (v, th) => { const y = .6 - v * (LT + .95), r = .64 - .14 * v + rollo(y, .08 * Math.sin(th * 2)) + .035 * Math.sin(th * 5 + y * 2.3) + .07 * (fbm(Math.sin(th) * 1.5, y * .6, Math.cos(th) * 1.5) - .5); return [r, r * 1.05, 0] }, { ru: .6, rv: 1.4, ou: .13 });
  const gCanilla = tubo(.35, LS + .5, 40, 66, (v, th) => { const y = .35 - v * (LS + .5), r = .5 - .1 * v + rollo(y, .3 + .1 * Math.sin(th * 3), .1 + .1 * S_(.7, 1, v)) + .2 * S_(.86, 1, v) + .03 * Math.sin(th * 6 + y * 3) + .06 * (fbm(Math.sin(th) * 1.5 + 4, y * .6, Math.cos(th) * 1.5) - .5); return [r, r * 1.05, 0] }, { ru: .55, rv: 1.3, ou: .61 });
  const gRodilla = loft(30, 22, (u, v) => { const th = u * TAU, ph = v * PI, d = .7 + .14 * (fbm(Math.sin(th) * 2 + 9, Math.cos(ph) * 2, Math.cos(th) * 2) - .5) + .04 * Math.sin(th * 7 + ph * 5); return [Math.sin(ph) * Math.sin(th) * d, Math.cos(ph) * d * .85, Math.sin(ph) * Math.cos(th) * d * 1.05 + .06] }, { ru: .5, rv: .5, ou: .3 });
  const gPie = loft(36, 46, (u, v) => { const th = u * TAU, z = -.75 + v * 2.7, e = Math.pow(Math.sin(PI * Math.min(1, .03 + v * .97)), .32), w = (.62 + .1 * Math.sin(PI * v * .8) - .2 * S_(.6, 1, v)) * e, hh = (.95 - .55 * S_(0, .5, v)) * e,
    c = Math.cos(th), sy = c < 0 ? c * .2 : c, lump = .06 * (fbm(Math.sin(th) * 2, z * 1.3, c * 2) - .5) + .03 * Math.sin(z * 9 + th * 3); return [Math.sin(th) * (w + lump), -LA + .02 + hh * .5 * (sy + 1) * .9 + lump * .5, z] }, { ru: .5, rv: .9, ou: .8 });
  const gPuno = tubo(.15, .5, 36, 10, (v, th) => { const r = .62 + .06 * Math.sin(th * 9) + .05 * Math.sin(v * PI) - .04 * v; return [r, r * 1.05, .05] }, { ru: .5, rv: .1 });
  for (const s of [0, 1]) { const sg = s ? -1 : 1, M = grupo(caderas, sg * 1.2, 0, 0), R = grupo(M, 0, -LT, 0), T = grupo(R, 0, -LS, 0);
    pieza(gMuslo, s ? M_TELA2 : M_TELA, M); pieza(gCanilla, s ? M_TELA : M_TELA2, R); pieza(gRodilla, M_TELA2, R); pieza(gPie, M_TELA, T); pieza(gPuno, M_TELA2, T);
    const Lm = [], Lc = [], Bm = [], Bc = [], cm = [], cc = [];
    const supM = (th, y) => { const v = (.6 - y) / (LT + .95), r = .64 - .14 * v + rollo(y, .08 * Math.sin(th * 2)) + .035 * Math.sin(th * 5 + y * 2.3); return [Math.sin(th) * r, y, Math.cos(th) * r * 1.05] };
    const supC = (th, y) => { const v = (.35 - y) / (LS + .5), r = .5 - .1 * v + .2 * S_(.86, 1, v); return [Math.sin(th) * r, y, Math.cos(th) * r * 1.05] };
    puntadas(supM, q => [q * .55 + s, -q], .3, LT - .2, .22, .09, Lm, .1); puntadas(supC, q => [-q * .5 + 2 + s, -q], .2, LS - .4, .22, .09, Lc, .09);
    botones(supM, 14, { th0: 0, th1: TAU, y0: -LT + .5, y1: .2 }, 60 + s, Bm, cm); botones(supC, 10, { th0: 0, th1: TAU, y0: -LS + .6, y1: -.3 }, 62 + s, Bc, cc, [.07, .22]);
    instanciar(G_PUNTADA, M_HILO, Lm, M); instanciar(G_PUNTADA, M_HILO, Lc, R); instanciar(G_BOTON, M_BOTON, Bm, M, cm); instanciar(G_BOTON, M_BOTON, Bc, R, cc);
    J.muslo.push(M); J.rodilla.push(R); J.tobillo.push(T) }

  // ======================= BRAZOS: perchas de alambre colgadas de un travesaño de madera =======================
  const RW = .1;
  function percha(L, W, hookR = .32) { const parts = [];
    // gancho alrededor del pivote (la barra de la percha anterior o el travesaño), en el plano y-z
    const G = []; for (let i = 0; i <= 18; i++) { const a = -PI / 2 + i / 18 * 1.72 * PI; G.push(V3(0, hookR * Math.sin(a), hookR * Math.cos(a))) }
    G.unshift(V3(0, -hookR - .28, 0)); parts.push(tuboCurva(G, 10, 40, v => RW * (v > .93 ? mix(1, .45, (v - .93) / .07) : 1), { ru: .1, rv: 1 }));
    // cuello retorcido: dos alambres en hélice
    const y0 = -hookR - .2, y1 = y0 - .7; for (const k of [0, 1]) { const P = []; for (let i = 0; i <= 24; i++) { const f = i / 24, y = mix(y0, y1, f), a = k * PI + f * TAU * 3.2; P.push(V3(Math.cos(a) * .085, y, Math.sin(a) * .085)) } parts.push(tuboCurva(P, 8, 60, () => RW * .82, { ru: .1, rv: 1.2 })) }
    // el triángulo estirado
    const Pt = [[0, y1 + .05, .03], [-.12, y1 - .3, .03], [-W * .42, -L + .7, .01], [-W * .5, -L + .13, 0], [-W * .42, -L - .02, 0], [0, -L - .02, 0], [W * .42, -L - .02, 0], [W * .5, -L + .13, 0], [W * .42, -L + .7, -.01], [.12, y1 - .3, -.03], [0, y1 + .05, -.03]].map(p => V3(...p));
    parts.push(tuboCurva(Pt, 10, 160, (v, th) => RW * (1 + .08 * Math.sin(v * 90)), { ru: .1, rv: 4 }));
    return fusionar(parts) }
  function ganchoDedo(L) { const parts = [], rb = .15;
    const G = []; for (let i = 0; i <= 14; i++) { const a = -PI / 2 + i / 14 * 1.8 * PI; G.push(V3(0, rb * Math.sin(a), rb * Math.cos(a))) } G.unshift(V3(0, -rb - .2, 0)); parts.push(tuboCurva(G, 8, 30, v => RW * .9 * (v > .92 ? mix(1, .5, (v - .92) / .08) : 1)));
    const yb = -L + .32, P = [[0, -rb - .2, 0], [0, -L * .4, .02], [0, yb + .15, 0], [0, yb - .1, .04], [0, yb - .27, .18], [0, yb - .3, .36], [0, yb - .18, .54], [0, yb + .05, .62], [0, yb + .3, .58], [0, yb + .46, .46]].map(p => V3(...p));
    parts.push(tuboCurva(P, 10, 70, v => RW * 1.05 * (v > .86 ? mix(1, .25, (v - .86) / .14) : 1)));
    return fusionar(parts) }
  const PUNTA_DEDO = L => [0, -L + .32 - .3, .36];   // el lomo del gancho: lo que golpea
  // travesaño (palo de escoba viejo) que cruza los hombros y asoma a los costados, con trapos atados
  const HOMBRO_X = 2.55, HOMBRO_Y = 3.25, HOMBRO_Z = -.1;
  pieza(mover(new T3.CylinderGeometry(.17, .19, 2 * HOMBRO_X + .7, 14, 6), MX(0, HOMBRO_Y + .2, HOMBRO_Z, 0, 0, PI / 2)), M_MADERA, col2);
  for (const s of [0, 1]) { const sg = s ? -1 : 1; for (let k = 0; k < 3; k++) pieza(mover(new T3.TorusGeometry(.24 + k * .02, .08, 8, 18), MX(sg * (HOMBRO_X - .55 - k * .17), HOMBRO_Y + .2, HOMBRO_Z, 0, PI / 2 + (k - 1) * .25, 0)), k % 2 ? M_TELA : M_TELA2, col2);
    pieza(loft(2, 10, (u, v) => [sg * (HOMBRO_X - .7) + (u - .5) * .25, HOMBRO_Y + .1 - v * 1.5, HOMBRO_Z + .2 + .1 * Math.sin(v * 4)], { ru: .1, rv: .5, ou: .4 * s }), M_TELA, col2) }
  const gPerchaA = percha(UA, 1.15), gPerchaB = percha(FA, .95, .3), gDedos = LF.map(ganchoDedo);
  for (const s of [0, 1]) { const sg = s ? -1 : 1, H = grupo(col2, sg * HOMBRO_X, HOMBRO_Y + .2, HOMBRO_Z), C = grupo(H, 0, -UA, 0), W = grupo(C, 0, -FA, 0);
    pieza(gPerchaA, M_OXIDO, H); pieza(gPerchaB, M_OXIDO, C);
    // trapo anudado en el codo
    pieza(mover(new T3.TorusGeometry(.2, .09, 8, 16), MX(.15, 0, 0, 0, PI / 2, 0)), M_TELA2, C); pieza(loft(2, 10, (u, v) => [.25 + (u - .5) * .2, -v * 1.1, .1 * Math.sin(v * 5)], { ru: .1, rv: .4, ou: .7 }), M_TELA2, C);
    const F = LF.map((L, i) => { const G_ = grupo(W, (i - 1.5) * .26 * (s ? -1 : 1), 0, 0); pieza(gDedos[i], M_OXIDO, G_); return G_ });
    J.hombro.push(H); J.codo.push(C); J.muneca.push(W); J.dedos[s] = F }

  // ======================= CUELLO (bufanda enroscada), CABEZA de trapo, BOTÓN-cara, BOCA-bolsillo =======================
  pieza(tubo(1.45, 2.1, 40, 40, (v, th) => { const y = 1.45 - v * 2.1, r = .92 - .1 * v + .1 * ex2(((fr(y * 1.15 + th / TAU) - .5) / .2) ** 2) + .05 * (fbm(Math.sin(th) * 2, y, Math.cos(th) * 2) - .5); return [r, r, 0] }, { ru: .7, rv: .8, ou: .2 }), M_TELA2, cuello);
  const HC = [0, .55, -.15], HR = [1.38, 1.8, 1.18];
  const gCab = (() => { const geo = new T3.SphereGeometry(1, 96, 72), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { let dx = p.getX(i), dy = p.getY(i), dz = p.getZ(i); const lon = Math.atan2(dx, dz);
      let sx = HR[0], sy = HR[1], sz = HR[2]; const pin = S_(.62, 1, dy); sx *= 1 - .55 * pin; sz *= 1 - .55 * pin;
      let d = .14 * (fbm(dx * 1.8 + 3, dy * 1.8, dz * 1.8) - .5) + .05 * Math.sin(lon * 14) * S_(.45, 1, dy) + .035 * Math.sin(lon * 9 + dy * 6);
      let x = dx * (sx + d), y = dy * (sy + d), z = dz * (sz + d); if (dz > .25) z = Math.min(z, .62 + (z - .62) * .2) * 1 + 0;   // de frente: aplastado donde va el botón
      p.setXYZ(i, HC[0] + x, HC[1] + y + (dy > .9 ? .25 * S_(.9, 1, dy) : 0), HC[2] + z) }
    geo.computeVertexNormals(); return geo })();
  pieza(gCab, M_TELA, cabeza);
  // nudo arriba (la bolsa atada) y puntadas que la cierran
  pieza(mover(new T3.TorusKnotGeometry(.3, .13, 64, 10, 2, 3), MX(0, HC[1] + HR[1] + .05, HC[2], .3, 0, .2)), M_TELA2, cabeza);
  { const L = [], sc = (th, y) => { const dy = (y - HC[1]) / HR[1], k = Math.sqrt(Math.max(0, 1 - dy * dy)), pin = 1 - .55 * S_(.62, 1, dy); return [Math.sin(th) * HR[0] * k * pin, y, HC[2] + Math.min(Math.cos(th) * HR[2] * k * pin, .62)] };
    [1.3, 2.4, 3.9, 5.0].forEach(th => puntadas(sc, q => [th, q], HC[1] - 1.5, HC[1] + 1.55, .2, .08, L, .06)); instanciar(G_PUNTADA, M_HILO, L, cabeza) }
  const BOTON = grupo(cabeza, 0, .95, .8); BOTON.rotation.x = -.12;
  // el BOTÓN: malla polar densa (cara cóncava suave, borde levantado y redondeado, mella), cuatro agujeros de verdad con labio y pared
  const ROUT = a => RB - .16 * ex2(((a - 2.25) / .07) ** 2) - .06 * ex2(((a - 2.42) / .035) ** 2) - .04 * ex2(((a - 5.4) / .05) ** 2) + .006 * Math.sin(a * 37);
  const ZF = r => { const q = r / RB; return .24 + .08 * ex2(((q - .87) / .07) ** 2) - .11 * Math.max(0, 1 - (q / .8) ** 2) - .2 * S_(.94, 1, q) ** 1.5 };
  const gBoton = (() => { const NR = 70, NA = 200, P = [], UV = [], I = [], idx = new Int32Array((NR + 1) * (NA + 1)).fill(-1);
    for (let i = 0; i <= NR; i++) for (let j = 0; j <= NA; j++) { const a = j / NA * TAU, q = i / NR, r = q * ROUT(a), x = Math.cos(a) * r, y = Math.sin(a) * r;
      idx[i * (NA + 1) + j] = P.length / 3; P.push(x, y, ZF(q * RB)); UV.push(x / (2 * RB) + .5, y / (2 * RB) + .5) }
    const enHueco = (x, y) => BH.some(([hx, hy]) => Math.hypot(x - hx, y - hy) < RH);
    for (let i = 0; i < NR; i++) for (let j = 0; j < NA; j++) { const a = idx[i * (NA + 1) + j], b = idx[i * (NA + 1) + j + 1], c = idx[(i + 1) * (NA + 1) + j], d = idx[(i + 1) * (NA + 1) + j + 1];
      const cx = (P[a * 3] + P[d * 3]) / 2, cy = (P[a * 3 + 1] + P[d * 3 + 1]) / 2; if (enHueco(cx, cy)) continue; I.push(a, c, b, b, c, d) }
    const face = new T3.BufferGeometry(); face.setAttribute("position", new T3.Float32BufferAttribute(P, 3)); face.setAttribute("uv", new T3.Float32BufferAttribute(UV, 2)); face.setIndex(I); face.computeVertexNormals();
    const lado = loft(NA, 6, (u, v) => { const a = u * TAU, r = ROUT(a) * (1 - .02 * Math.sin(v * PI)); const z = mix(ZF(RB), -.06, v); return [Math.cos(a) * r, Math.sin(a) * r, z] }, { ru: 3, rv: .1 });
    const atras = new T3.CircleGeometry(RB, 64); atras.rotateY(PI); atras.translate(0, 0, -.06);
    const L = [face, lado, atras.toNonIndexed()];
    BH.forEach(([hx, hy]) => { const z0 = ZF(Math.hypot(hx, hy));
      const pared = new T3.CylinderGeometry(RH, RH, z0 + .1, 28, 1, true); pared.rotateX(PI / 2); pared.translate(hx, hy, (z0 - .1) / 2); const n = pared.attributes.normal; for (let i = 0; i < n.count; i++) n.setXYZ(i, -n.getX(i), -n.getY(i), -n.getZ(i)); const ix = pared.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i]; ix[i] = ix[i + 2]; ix[i + 2] = t }
      const labio = new T3.TorusGeometry(RH + .01, .035, 10, 32); labio.translate(hx, hy, z0 - .005); L.push(pared, labio) });
    L.forEach(q => { if (!q.attributes.uv) q.setAttribute("uv", new T3.Float32BufferAttribute(new Float32Array(q.attributes.position.count * 2), 2)) });
    const pp = L.map(q => q.index ? q : q);
    const out = fusionar(pp); const pa = out.attributes.position, uv = out.attributes.uv; for (let i = 0; i < pa.count; i++) uv.setXY(i, pa.getX(i) / (2 * RB) + .5, pa.getY(i) / (2 * RB) + .5); return out })();
  pieza(gBoton, M_HUESO, BOTON);
  BH.forEach(([x, y]) => { pieza(new T3.CircleGeometry(RH + .05, 24), M_HUECO, BOTON, x, y, -.08, false) });   // el fondo negro de cada agujero
  // hilo grueso en cruz pasando por los agujeros (tres hebras retorcidas por diagonal) y dos cabos que cuelgan
  { const parts = []; [[0, 2], [1, 3]].forEach(([a, b], k) => { for (let h = 0; h < 2; h++) { const ph = h / 2 * TAU, A = BH[a], B = BH[b], P = [];
      for (let i = 0; i <= 20; i++) { const f = i / 20, x = mix(A[0], B[0], f), y = mix(A[1], B[1], f), z = -.05 + .36 * Math.sin(PI * Math.min(1, Math.max(0, (f - .02) / .96))) ** .5 + k * .06, tw = .04;
        const nx = -(B[1] - A[1]), ny = B[0] - A[0], nl = Math.hypot(nx, ny); P.push(V3(x + nx / nl * tw * Math.cos(ph + f * 9), y + ny / nl * tw * Math.cos(ph + f * 9), z + tw * Math.sin(ph + f * 9))) }
      parts.push(tuboCurva(P, 7, 60, () => .04)) } }); pieza(fusionar(parts), M_HILO_R, BOTON) }
  const CABOS = grupo(BOTON, BH[3][0], BH[3][1], .25);
  { const parts = []; for (let h = 0; h < 2; h++) { const P = []; for (let i = 0; i <= 10; i++) { const f = i / 10; P.push(V3(.06 * h + .05 * Math.sin(f * 7 + h), -f * (1.5 + h * .5), .12 * Math.sin(f * 3 + h) + .1 * f)) } parts.push(tuboCurva(P, 6, 30, v => .045 * (1 - .4 * v))) } pieza(fusionar(parts), M_HILO_R, CABOS) }
  // BOCA: un bolsillo de ribete cosido; al gritar los labios se separan, las puntadas se cortan, adentro negro
  const BOCA = grupo(cabeza, 0, -.5, .9); BOCA.rotation.x = .3;
  const gLabio = tuboCurva([V3(-.82, 0, -.12), V3(-.4, .03, .0), V3(0, 0, .04), V3(.4, .03, .0), V3(.82, 0, -.12)], 12, 60, v => .12 + .035 * Math.sin(v * 31) + .025 * Math.sin(v * 73) - .06 * S_(.85, 1, Math.abs(v - .5) * 2));
  const LABIO_A = pieza(gLabio, M_TELA2, BOCA), LABIO_B = pieza(gLabio, M_TELA2, BOCA);
  const HUECO_BOCA = pieza(new T3.SphereGeometry(1, 24, 16), M_HUECO, BOCA, 0, 0, -.2, false);
  const PUNTOS_BOCA = Array.from({ length: 9 }, (_, i) => pieza(new T3.CylinderGeometry(.03, .03, 1, 5), M_HILO, BOCA, (i - 4) * .17, 0, .06, false));

  // ======================= CUELLOS DE ABRIGO parados alrededor de la nuca =======================
  const CUELLOS = [{ a: PI, w: 1.0, h: 3.1 }, { a: PI - .95, w: .8, h: 2.3 }, { a: PI + .95, w: .8, h: 2.5 }, { a: 1.75, w: .65, h: 1.7 }, { a: -1.75, w: .65, h: 1.5 }, { a: .75, w: .5, h: 1.15 }, { a: -.75, w: .5, h: 1.05 }].map((C, i) => {
    const P = grupo(col2, Math.sin(C.a) * 1.15, 4.05, Math.cos(C.a) * 1.0 - .05); P.rotation.y = C.a; const r = rnd(90 + i), Fr = Array.from({ length: 31 }, () => r() ** 2 * .35);
    pieza(loft(30, 22, (u, v) => { const th = (u - .5) * C.w, R = .2 + .55 * v * v, y = v * C.h - (v > .93 ? Fr[Math.round(u * 30)] : 0) - .3 * (2 * u - 1) ** 2 * v; return [Math.sin(th) * (1.15 + R), y, Math.cos(th) * (1.0 + R) - 1.0 + .1 * Math.sin(u * 9) * v] }, { ru: .5, rv: .6, ou: r(), ov: r() }), i % 2 ? M_TELA2 : M_TELA, P);
    P.userData.rest = 0; return P });

  // ======================= MANGAS VACÍAS que cuelgan (cadenas de tres tramos) =======================
  const gTramo = (L, r0, r1, puno, ou) => tubo(.2, L + .2, 22, 16, (v, th) => { const r = mix(r0, r1, v) + .04 * Math.sin(th * 4 + v * 9) + (puno ? .08 * S_(.75, .9, v) * (1 - S_(.95, 1, v)) : 0); return [r * .62, r, 0] }, { ru: .4, rv: .5, ou });
  const MANGAS = [{ G: T2G, sup: sup2, th: 1.78, y: 1.2, L: 4.6 }, { G: T2G, sup: sup2, th: TAU - 1.72, y: .95, L: 4.4 }, { G: T2G, sup: sup2, th: PI - .62, y: 2.25, L: 3.6 }, { G: T2G, sup: sup2, th: PI + .8, y: 2.6, L: 4.1 },
    { G: T1G, sup: sup1, th: 1.5, y: 2.8, L: 4.3 }, { G: T1G, sup: sup1, th: TAU - 1.38, y: 2.0, L: 3.9 }, { G: T1G, sup: sup1, th: PI + .1, y: 3.4, L: 5.2 }, { G: T2G, sup: sup2, th: TAU - .95, y: -.1, L: 3.1 }].map((M, i) => {
    const p = V3(M.sup(M.th, M.y)), n = nrm(M.sup, M.th, M.y), R = grupo(M.G, ...p.addScaledVector(n, .12).toArray()); const segL = M.L / 3, S = [];
    pieza(new T3.SphereGeometry(.42, 16, 12), i % 2 ? M_TELA : M_TELA2, R).scale.set(1, .8, .7);
    let par = R; for (let k = 0; k < 3; k++) { const G_ = grupo(par, 0, k ? -segL : 0, 0); pieza(gTramo(segL, .4 - k * .03, .37 - k * .03, k === 2, (i * .37 + k * .23) % 1),(i + k) % 2 ? M_TELA2 : M_TELA, G_);
      if (k === 2) pieza(new T3.CircleGeometry(.3, 14), M_OSCURO, G_, 0, -segL - .15, 0, false).rotation.x = PI / 2; S.push(G_); par = G_ }
    return { R, S, n: n.clone(), f: .5 + (i * .37 % 1) * .5, ph: i * 1.9 } });

  // ======================= BOLSILLOS, CORREAS (la escalera para trepar) y botones del torso =======================
  function bolsillo(sup, th, y, w, h, r, parts, partsF) { const th0 = th - w / 2, y1 = y + h;
    parts.push(loft(10, 10, (u, v) => { const t = th0 + u * w, yy = y1 - v * h, p = sup(t, yy), n = nrm(sup, t, yy), b = .05 + .08 * Math.sin(PI * u) * Math.sin(PI * v); return [p[0] + n.x * b, p[1] + n.y * b, p[2] + n.z * b] }, { ru: .3, rv: .3, ou: r(), ov: r() }));
    if (r() < .75) partsF.push(loft(10, 6, (u, v) => { const t = th0 - .02 + u * (w + .04), yy = y1 + .05 - v * h * .38, p = sup(t, yy), n = nrm(sup, t, yy), b = .16 + .04 * v - (v > .9 ? .03 * Math.sin(u * 30) : 0); return [p[0] + n.x * b, p[1] + n.y * b, p[2] + n.z * b] }, { ru: .3, rv: .2, ou: r(), ov: r() }));
    else partsF.push(loft(8, 2, (u, v) => { const t = th0 + .04 + u * (w - .08), yy = y1 - .06 - v * .08, p = sup(t, yy), n = nrm(sup, t, yy); return [p[0] + n.x * .14, p[1] + n.y * .14, p[2] + n.z * .14] })) }
  function correa(sup, thc, y, w, parts, hebillas, G) { parts.push(loft(18, 3, (u, v) => { const t = thc - w / 2 + u * w, yy = y + .14 - v * .28, p = sup(t, yy), n = nrm(sup, t, yy), b = .1 + .02 * Math.sin(PI * u); return [p[0] + n.x * b, p[1] + n.y * b, p[2] + n.z * b] }, { ru: 1, rv: .1 }));
    const p = V3(sup(thc + w * .18, y)), n = nrm(sup, thc + w * .18, y); q1.setFromUnitVectors(new T3.Vector3(0, 0, 1), n); hebillas.push(new T3.Matrix4().compose(p.addScaledVector(n, .17), q1.clone(), new T3.Vector3(1, 1, 1))) }
  const G_HEBILLA = (() => { const sh = new T3.Shape(); sh.moveTo(-.2, -.24); sh.lineTo(.2, -.24); sh.lineTo(.2, .24); sh.lineTo(-.2, .24); sh.closePath(); const h = new T3.Path(); h.moveTo(-.13, -.17); h.lineTo(-.13, .17); h.lineTo(.13, .17); h.lineTo(.13, -.17); h.closePath(); sh.holes.push(h);
    const geo = new T3.ExtrudeGeometry(sh, { depth: .05, bevelEnabled: true, bevelThickness: .02, bevelSize: .02, bevelSegments: 2 }); return fusionar([geo.toNonIndexed(), new T3.CylinderGeometry(.025, .025, .34, 6).rotateZ(0).translate(0, 0, .06).toNonIndexed()].map(q => { q.computeVertexNormals(); return q })) })();
  { const r = rnd(77), B1 = [], C1 = [], B2 = [], C2 = [], P1 = [], P1f = [], P2 = [], P2f = [], K1 = [], K2 = [], H1 = [], H2 = [];
    const evita1 = (th, y) => Math.abs(th - TREPA_TH(y / 6.5)) < .2, evita2 = (th, y) => enRojo(th, y) || Math.abs(th - TREPA_TH(.6 + y / 4.5)) < .18;
    botones(sup1, 70, { th0: 0, th1: TAU, y0: -.2, y1: 4.1, evita: evita1 }, 71, B1, C1); botones(sup2, 95, { th0: 0, th1: TAU, y0: -.6, y1: 4.3, evita: evita2 }, 72, B2, C2);
    // en la franja de trepar: botones grandes como apoyos de pie
    for (let k = 0; k < 9; k++) { const u = (k + .5) / 9, onT1 = u < .6, sup = onT1 ? sup1 : sup2, y = onT1 ? mix(.05, 3.9, u / .6) : mix(-.35, 1.6, (u - .6) / .4), th = TREPA_TH(u) + (k % 2 ? .13 : -.13), p = V3(sup(th, y)), n = nrm(sup, th, y);
      q1.setFromUnitVectors(new T3.Vector3(0, 0, 1), n); (onT1 ? B1 : B2).push(new T3.Matrix4().compose(p.addScaledVector(n, .03), q1.clone(), new T3.Vector3(.34, .34, .3))); (onT1 ? C1 : C2).push(COL_BOT[k % 3 ? 0 : 3]) }
    [[1.6, .5], [2.75, 1.4], [3.7, .4], [4.6, 1.7], [5.5, .9], [1.3, 2.6]].forEach(([th, y]) => bolsillo(sup1, th, y, .5 + r() * .25, .75 + r() * .3, r, P1, P1f));
    [[1.55, .3], [4.75, .6], [2.4, 1.7], [3.9, 1.9], [5.6, 2.2]].forEach(([th, y]) => bolsillo(sup2, th, y, .45 + r() * .2, .7 + r() * .25, r, P2, P2f));
    [.15, 1.0, 1.85, 2.7, 3.55].forEach((y, k) => correa(sup1, TREPA_TH(y / 6.5), y + .3, .6, K1, H1));
    [-.2, .55].forEach(y => correa(sup2, TREPA_TH(.6 + y / 4.5) + .03, y + .3, .52, K2, H2));
    instanciar(G_BOTON, M_BOTON, B1, T1G, C1); instanciar(G_BOTON, M_BOTON, B2, T2G, C2);
    pieza(fusionar([...P1, ...P1f]), M_TELA2, T1G); pieza(fusionar([...P2, ...P2f]), M_TELA2, T2G);
    pieza(fusionar(K1), M_CUERO, T1G); pieza(fusionar(K2), M_CUERO, T2G); instanciar(G_HEBILLA, M_LATON, H1, T1G); instanciar(G_HEBILLA, M_LATON, H2, T2G) }

  // ======================= EL ABRIGO ROJO cosido en el pecho =======================
  const RJ = { y0: .78, y1: 2.2 }, RJ_C = V3(sup2(0, 1.5)).add(new T3.Vector3(0, 0, .15));
  const anchoR = y => { const k = (y - RJ.y0) / (RJ.y1 - RJ.y0); return k > .84 ? mix(.27, .12, eIO((k - .84) / .16)) : mix(.28, .25, k) + .015 * Math.sin(k * 20) };
  const radial = th => V3(Math.sin(th), 0, Math.cos(th));
  const enPecho = (th, y, off) => { const p = V3(sup2(th, y)); return p.addScaledVector(radial(th), off) };
  const ROJO = new T3.Group(); ROJO.name = "abrigoRojo"; T2G.add(ROJO); ROJO.position.copy(RJ_C);
  const ROJO_REST = { p: RJ_C.clone() };
  { const parts = [], dark = [], r = rnd(88), c0 = RJ_C;
    const rel = p => [p.x - c0.x, p.y - c0.y, p.z - c0.z];
    parts.push(loft(40, 44, (u, v) => { const y = RJ.y1 - v * (RJ.y1 - RJ.y0) - (v > .95 ? .05 * hsh(Math.round(u * 40), 3, 9) : 0), w = anchoR(y), th = (u - .5) * 2 * w, off = .1 + .07 * Math.sin(PI * u) * (.5 + .5 * v) + .025 * Math.sin(u * 26 + v * 3) * v + .03 * (u > .47 && u < .53 ? -1 : 0);
      return rel(enPecho(th, y, off)) }, { ru: .9, rv: .9 }));
    // solapas
    for (const s of [-1, 1]) parts.push(loft(8, 12, (u, v) => { const y = RJ.y1 - .05 - v * .65, th = s * (.02 + u * (.17 - .1 * v)), off = .2 + .04 * u - .02 * v; return rel(enPecho(th, y, off)) }, { ru: .2, rv: .3, ou: .5 }));
    // cuello
    parts.push(loft(16, 4, (u, v) => { const th = (u - .5) * .3, y = RJ.y1 + .1 - v * .2, off = .17 + .1 * (1 - v); return rel(enPecho(th, y, off)) }, { ru: .3, rv: .1 }));
    // mangas plegadas sobre el pecho (como abrazándose)
    for (const s of [-1, 1]) { const P = [enPecho(s * .25, 2.02, .2), enPecho(s * .3, 1.7, .23), enPecho(s * .31, 1.3, .22), enPecho(s * .29, .98, .21), enPecho(s * .26, .82, .2)].map(p => V3(...rel(p)));
      parts.push(tuboCurva(P, 12, 30, v => .085 + .015 * Math.sin(v * 14) + .02 * S_(.85, 1, v) * (1 - S_(.97, 1, v)), { ru: .3, rv: .5 })) }
    // bolsillos
    for (const s of [-1, 1]) parts.push(loft(6, 2, (u, v) => rel(enPecho(s * (.08 + u * .13), 1.05 - v * .07, .2)), { ru: .1, rv: .05 }));
    // botones oscuros al medio
    [1.85, 1.55, 1.25].forEach(y => { const p = enPecho(.015, y, .2), geo = G_BOTON.clone(); geo.applyMatrix4(new T3.Matrix4().compose(V3(...rel(p)), new T3.Quaternion().setFromUnitVectors(new T3.Vector3(0, 0, 1), radial(.015)), new T3.Vector3(.07, .07, .07))); dark.push(geo.toNonIndexed()) });
    pieza(fusionar(parts), M_ROJO, ROJO); pieza(fusionar(dark.map(q => { q.computeVertexNormals(); return q })), new T3.MeshStandardMaterial({ color: "#151110", roughness: .85 }), ROJO) }
  // las 18 PUNTADAS que lo sujetan: bajan por la izquierda, cruzan el ruedo y suben por la derecha (orden del corte)
  const PUNTOS_N = 18, PUNTOS_P = [];
  { const L = []; for (let i = 0; i < PUNTOS_N; i++) { const f = i / (PUNTOS_N - 1); let th, y, inw;
      if (f < .38) { y = mix(RJ.y1 - .15, RJ.y0 + .08, f / .38); th = -anchoR(y); inw = 1 } else if (f < .62) { y = RJ.y0 + .02; th = mix(-.22, .22, (f - .38) / .24); inw = 2 } else { y = mix(RJ.y0 + .08, RJ.y1 - .15, (f - .62) / .38); th = anchoR(y); inw = 3 }
      const a = inw === 2 ? enPecho(th, y + .07, .15) : enPecho(th - Math.sign(th) * .035, y, .13), b = inw === 2 ? enPecho(th, y - .1, .05) : enPecho(th + Math.sign(th) * .05, y + .04, .07);
      L.push(matPuntada(a.toArray(), b.toArray(), null, 1.4)); PUNTOS_P.push([a, b]) }
    var PUNTOS = instanciar(G_PUNTADA, M_HILO_N, L, T2G) }
  const G_CABO = new T3.CylinderGeometry(.06, .02, 1, 5, 1); G_CABO.translate(0, .5, 0);
  const CABOS_R = new T3.InstancedMesh(G_CABO, M_HILO_N, PUNTOS_N * 2); CABOS_R.count = 0; T2G.add(CABOS_R);
  const PUNTOS_M = []; for (let i = 0; i < PUNTOS_N; i++) { const m = new T3.Matrix4(); PUNTOS.getMatrixAt(i, m); PUNTOS_M.push(m) }

  // ======================= AURA: niebla a los pies, hilos que flotan, pelusa, polvo de las pisadas, luz fría =======================
  const AURA = grupo(g); AURA.visible = false;
  const NIEBLA = Array.from({ length: 26 }, (_, i) => { const s = new T3.Sprite(new T3.SpriteMaterial({ map: T_NIEBLA, color: "#76838f", transparent: true, opacity: .3, depthWrite: false, fog: true }));
    s.userData = { a: i * 2.4, r: 2 + (i * .37 % 1) * 14, sp: .02 + (i * .61 % 1) * .04, y: .5 + (i * .29 % 1) * 1.8, sc: 9 + (i * .43 % 1) * 9 }; AURA.add(s); return s });
  const G_HEBRA = tuboCurva(Array.from({ length: 9 }, (_, i) => V3(.08 * Math.sin(i * 1.3), -i * .16, .06 * Math.cos(i * 1.7))), 4, 24, v => .016);
  const HEBRAS_N = 70, HEBRAS = new T3.InstancedMesh(G_HEBRA, M_HILO_R, HEBRAS_N); HEBRAS.frustumCulled = false; AURA.add(HEBRAS);
  const PELUSA = (() => { const N = 900, p = new Float32Array(N * 3); const geo = new T3.BufferGeometry(); geo.setAttribute("position", new T3.BufferAttribute(p, 3));
    const m = new T3.Points(geo, new T3.PointsMaterial({ map: T_PUNTO, color: "#c8ccd0", size: .1, transparent: true, opacity: .5, depthWrite: false, blending: T3.AdditiveBlending })); m.frustumCulled = false; AURA.add(m); return m })();
  const PUFFS = Array.from({ length: 16 }, (_, i) => { const s = new T3.Sprite(new T3.SpriteMaterial({ map: T_NIEBLA, color: "#8c867a", transparent: true, opacity: 0, depthWrite: false, fog: true })); scene.add(s); s.visible = false; return s });
  // hilos que cuelgan de los ruedos (siempre, no solo con el aura): del faldón, de los puños de las mangas vacías y del botón
  const COLG_N = RUEDO.length + MANGAS.length * 3, COLGANTES = new T3.InstancedMesh(G_HEBRA, M_HILO, COLG_N); COLGANTES.frustumCulled = false; g.add(COLGANTES);
  const LUZ_FRIA = new T3.PointLight("#9cb6e4", 0, 46, 1.4); LUZ_FRIA.position.set(0, 9, 7); g.add(LUZ_FRIA);
  const LUZ_PIES = new T3.PointLight("#6f8db8", 0, 26, 1.5); LUZ_PIES.position.set(0, 1.2, 4.5); g.add(LUZ_PIES);
  const _m4 = new T3.Matrix4(), _q = new T3.Quaternion(), _s = new T3.Vector3();
  function auraTick(t, k) { NIEBLA.forEach((s, i) => { const d = s.userData, a = d.a + t * d.sp * (i % 2 ? 1 : -1), rr = d.r + 1.2 * Math.sin(t * .15 + i); s.position.set(Math.cos(a) * rr, d.y + .2 * Math.sin(t * .4 + i), Math.sin(a) * rr + 1.5); s.scale.set(d.sc * 1.7, d.sc * .4, 1); s.material.rotation = .15 * Math.sin(t * .1 + i); s.material.opacity = .34 * k * (.7 + .3 * Math.sin(t * .3 + i * 1.7)) });
    for (let i = 0; i < HEBRAS_N; i++) { const a = i * 2.399 + t * (.03 + (i % 5) * .008), rr = 3 + (i * .618 % 1) * 9, h = ((i * .377 % 1) * 21 + t * (.12 + (i % 4) * .05)) % 21;
      _q.setFromEuler(new T3.Euler(Math.sin(t * .5 + i) * 1.2, t * .3 + i, Math.cos(t * .4 + i * 1.3) * 1.2)); _m4.compose(_s.set(Math.cos(a) * rr, h, Math.sin(a) * rr + 1), _q, v1.set(1, 1 + (i % 3) * .6, 1)); HEBRAS.setMatrixAt(i, _m4) } HEBRAS.instanceMatrix.needsUpdate = true;
    const P = PELUSA.geometry.attributes.position; for (let i = 0; i < P.count; i++) { const a = i * 2.399, rr = 1 + (i * .618 % 1) * 13, h = ((i * .377 % 1) * 22 + t * (.05 + (i % 5) * .02)) % 22;
      P.setXYZ(i, Math.cos(a + t * .02) * rr + .3 * Math.sin(t * .3 + i), h, Math.sin(a + t * .02) * rr + 1 + .3 * Math.cos(t * .27 + i)) } P.needsUpdate = true; PELUSA.material.opacity = .5 * k;
    // polvo en cada pisada (cuando camina): nubecitas que se abren y se apagan en 2 s
    PUFFS.forEach(s => s.visible = false);
    if (ST.andando) for (const s of [0, 1]) { const p = (ST.fase + s * PI) % TAU, desde = ((p - PI / 2) % TAU + TAU) % TAU, edad = desde / TAU * ST.ciclo; if (edad > 2.2) continue;
      J.tobillo[s].updateWorldMatrix(true, false); const fw = J.tobillo[s].getWorldPosition(v2), u = edad / 2.2;
      for (let k2 = 0; k2 < 8; k2++) { const sp = PUFFS[s * 8 + k2], a = k2 / 8 * TAU + s; sp.visible = true; sp.position.set(fw.x + Math.cos(a) * (.6 + 2.4 * Math.sqrt(u)), g.position.y + .25 + .5 * u, fw.z + Math.sin(a) * (.6 + 2.4 * Math.sqrt(u)) + .6); const sc = 1.5 + 3 * Math.sqrt(u); sp.scale.set(sc * 1.4, sc * .6, 1); sp.material.opacity = .45 * k * S_(0, .08, u) * (1 - u) } } }

  // ======================= POSE =======================
  const CABEZA_ROLL = .24;   // la cabeza torcida hacia un lado, siempre
  const ST = { t: 0, aura: false, inflar: 0, boca: 0, andando: false, fase: 0, ciclo: 5, viento: 1, grito: 0, rojoCae: 0 };
  function REST() { cuerpo.position.set(0, 0, 0); cuerpo.rotation.set(0, 0, 0); caderas.position.set(0, HIP, 0); caderas.rotation.set(0, 0, 0); pelvis.rotation.set(.06, 0, 0); faldaG.rotation.set(0, 0, 0);
    col1.rotation.set(.16, 0, 0); col2.rotation.set(.84, 0, .07); cuello.rotation.set(-.18, 0, 0); cabeza.rotation.set(0, 0, 0); T1G.scale.set(1, 1, 1); T2G.scale.set(1, 1, 1);
    for (const s of [0, 1]) { J.muslo[s].rotation.set(-.02, 0, s ? .03 : -.03); J.rodilla[s].rotation.set(.06, 0, 0); J.tobillo[s].rotation.set(0, 0, 0); J.tobillo[s].userData.extra = 0; J.hombro[s].rotation.set(0, 0, 0); J.codo[s].rotation.set(0, 0, 0); J.muneca[s].rotation.set(0, 0, 0) }
    ST.inflar = 0; ST.boca = 0; ST.andando = false; ST.grito = 0; ST.yaw = 0; ROJO_reset() }
  function apuntarW(G, dir) { G.parent.updateWorldMatrix(true, false); G.parent.getWorldQuaternion(q1).invert(); v1.copy(dir).normalize().applyQuaternion(q1); G.quaternion.setFromUnitVectors(ABAJO, v1) }
  function ik2(s, T, pole) { const H = J.hombro[s], C = J.codo[s]; H.updateWorldMatrix(true, false); const S0 = H.getWorldPosition(v2), d = v3.copy(T).sub(S0), D = Math.min(d.length(), (UA + FA) * .999), dn = d.normalize();
    const a = Math.acos(Math.max(-1, Math.min(1, (UA * UA + D * D - FA * FA) / (2 * UA * D)))), ax = v4.crossVectors(dn, pole).normalize(), up = dn.clone().applyAxisAngle(ax, a);
    apuntarW(H, up); C.rotation.set(0, 0, 0); C.updateWorldMatrix(true, false); const E = C.getWorldPosition(new T3.Vector3()); apuntarW(C, v1.copy(T).sub(E)) }
  const aMundo = (x, y, z) => new T3.Vector3(x, y, z).applyQuaternion(g.quaternion);
  function cabezaNivel(pitch, roll = 0, yaw = 0) { g.updateMatrixWorld(true); g.getWorldQuaternion(q2); q2.multiply(new T3.Quaternion().setFromEuler(new T3.Euler(pitch, yaw, roll, "YXZ")));
    cabeza.parent.getWorldQuaternion(q1).invert(); cabeza.quaternion.copy(q1.multiply(q2)) }
  // brazos colgando del travesaño (las perchas pesan): dirección en el marco de la raíz + vaivén; los ganchos-dedo cuelgan por su peso
  function brazosColgando(t, abre = .2, balanceo = [0, 0], soloLado = null) {
    for (const s of [0, 1]) { if (soloLado !== null && s !== soloLado) continue; const sg = s ? -1 : 1, w = ST.viento;
      apuntarW(J.hombro[s], aMundo(sg * abre + .02 * Math.sin(t * .4 + s), -1, .3 + (s ? .08 : 0) + balanceo[s] + .03 * w * Math.sin(t * .31 + s * 2)));
      J.codo[s].rotation.set(-.1 - .05 * Math.sin(t * .27 + s), 0, sg * .03); J.muneca[s].rotation.set(0, 0, 0); dedosColgando(t, s) } }
  function dedosColgando(t, s, extra = null) { J.dedos[s].forEach((F, i) => { if (extra && extra(F, i)) return; F.rotation.set(0, 0, 0); apuntarW(F, aMundo(.06 * Math.sin(t * .7 + i * 1.3 + s), -1, .1 + .07 * Math.sin(t * .53 + i * 2.1 + s * 3) * ST.viento)) }) }
  const piesPlanos = () => { for (const s of [0, 1]) J.tobillo[s].rotation.x = -(caderas.rotation.x + J.muslo[s].rotation.x + J.rodilla[s].rotation.x) + (J.tobillo[s].userData.extra || 0) };
  const extLeg = (f, k) => LT * Math.cos(f) + LS * Math.cos(f - k) + LA;
  const avLeg = (f, k) => LT * Math.sin(f) + LS * Math.sin(f - k);
  // el faldón sigue a las piernas, se mece con el viento y se infla al gritar
  function faldaDeforma(t) { const fL = -J.muslo[0].rotation.x, fR = -J.muslo[1].rotation.x, kL = J.rodilla[0].rotation.x, kR = J.rodilla[1].rotation.x, inf = ST.inflar, w = ST.viento;
    faldaG.rotation.x = pelvis.rotation.x * .3 - .02;
    const def = (geo, B, L) => { const P = geo.attributes.position.array; for (let i = 0; i < P.length; i += 3) { const x = B[i], y = B[i + 1], z = B[i + 2], dep = Math.max(0, -y + .6), wL = S_(-.9, .9, x), wR = 1 - wL;
        const f = wL * fL + wR * fR, k = wL * kL + wR * kR, pie = Math.min(dep, LT), canilla = Math.max(0, dep - LT); let dz = Math.sin(f) * pie + Math.sin(f - k) * canilla; dz = (dz > 0 ? (z > 0 ? 1.05 : .5) : (z < 0 ? 1 : .5)) * dz * .9;
        const q = dep / L, sway = (.25 * Math.sin(t * .9 + x * .5 + y * .2) + .12 * Math.sin(t * 2.1 + x * 1.3 - y * .4)) * q * w, rr = Math.hypot(x, z) || 1, fl = inf * q * (1.1 + .4 * Math.sin(t * 13 + x * 3 + y));
        P[i] = x + x / rr * fl + .08 * q * w * Math.sin(t * 1.3 + y * .3); P[i + 1] = y + Math.min(1.5, dep * (1 - Math.cos(f)) * .5) + fl * .3; P[i + 2] = z + dz + sway + z / rr * fl } geo.attributes.position.needsUpdate = true; geo.computeVertexNormals() };
    def(FALDA.geometry, FALDA_B, FALDA_L); def(FALDA2.geometry, FALDA2_B, FALDA2_L) }
  // mangas vacías, cuellos y bocas: lo que el viento y el grito mueven
  function telaTick(t) { const inf = ST.inflar, w = ST.viento; g.updateMatrixWorld(true);
    MANGAS.forEach((M, i) => { const out = M.n.clone().transformDirection(M.R.parent.matrixWorld); out.y = 0; out.normalize();
      const sw = .22 * w * Math.sin(t * M.f + M.ph) + .1 * w * Math.sin(t * M.f * 2.3 + M.ph * 2), lag = ST.andando ? .18 * Math.sin(ST.fase - .9 + i) : 0;
      const dir = new T3.Vector3(0, -1, 0).addScaledVector(out, .2 + sw + inf * (1.3 + .5 * Math.sin(t * 9 + i))).add(aMundo(lag * .5, 0, .12 * w * Math.sin(t * .6 + i) - lag)); dir.y += inf * .6;
      apuntarW(M.S[0], dir); M.S[1].rotation.set(.15 * Math.sin(t * M.f * 1.4 + M.ph + 1) * (w + inf * 2) + .1, 0, .12 * Math.sin(t * M.f * 1.1 + M.ph) * (w + inf * 2)); M.S[2].rotation.set(.2 * Math.sin(t * M.f * 1.9 + M.ph + 2) * (w + inf * 3) + .1, 0, .15 * Math.sin(t * M.f * 1.6 + M.ph + 1) * (w + inf * 3)) });
    CUELLOS.forEach((P, i) => { P.rotation.x = -.05 * Math.sin(t * 1.1 + i * 1.7) * w - .5 * inf * (1 + .3 * Math.sin(t * 11 + i)) - .08 });
    CABOS.rotation.set(.25 * Math.sin(t * .8) * w + inf * .8 * Math.sin(t * 12), 0, .2 * Math.sin(t * .6 + 1) * w);
    // boca
    const b = ST.boca; LABIO_A.position.y = .06 + .32 * b; LABIO_B.position.y = -.06 - .62 * b; LABIO_A.scale.x = LABIO_B.scale.x = 1 + .18 * b; LABIO_B.position.z = .06 * b;
    HUECO_BOCA.scale.set(.66 + .1 * b, .03 + .44 * b, .3 * Math.min(1, b * 4)); HUECO_BOCA.position.set(0, -.15 * b, -.24); HUECO_BOCA.visible = b > .01;
    PUNTOS_BOCA.forEach((P, i) => { const roto = b > .12 + (i * .37 % 1) * .4, gap = LABIO_A.position.y - LABIO_B.position.y, x = (i - 4) * .17 * LABIO_A.scale.x; P.position.x = x;
      if (roto) { const L = .18 + (i * .53 % 1) * .3; P.scale.set(1, L, 1); P.position.y = LABIO_A.position.y - .08 - L / 2; P.rotation.z = .3 * Math.sin(ST.t * 9 + i) * b } else { P.scale.set(1, gap + .06, 1); P.position.y = (LABIO_A.position.y + LABIO_B.position.y) / 2; P.rotation.z = 0 } });
    // inflarse: la tela del torso se hincha (y tiembla)
    T1G.scale.set(1 + .1 * inf + .015 * inf * Math.sin(t * 17), 1, 1 + .12 * inf + .015 * inf * Math.sin(t * 19)); T2G.scale.set(1 + .12 * inf + .02 * inf * Math.sin(t * 15), 1 + .02 * inf, 1 + .15 * inf + .02 * inf * Math.sin(t * 21));
    faldaDeforma(t); colgantes(t) }
  function colgantes(t) { g.updateMatrixWorld(true); const gi = new T3.Matrix4().copy(g.matrixWorld).invert(), P = FALDA.geometry.attributes.position, w = ST.viento, inf = ST.inflar; let n = 0;
    const put = (wp, len, i) => { const p = wp.applyMatrix4(gi); _q.setFromEuler(new T3.Euler(.25 * Math.sin(t * 1.3 + i) * w + inf * 1.2 * Math.sin(t * 11 + i), i, .25 * Math.sin(t * 1.1 + i * 2) * w)); _m4.compose(p, _q, v1.set(1.6, len, 1.6)); COLGANTES.setMatrixAt(n++, _m4) };
    FALDA.updateWorldMatrix(true, false); RUEDO.forEach((ix, i) => put(V3(P.getX(ix), P.getY(ix), P.getZ(ix)).applyMatrix4(FALDA.matrixWorld), 1.4 + (i * .37 % 1) * 2.2, i));
    MANGAS.forEach((M, i) => { const G_ = M.S[2]; G_.updateWorldMatrix(true, false); for (let k = 0; k < 3; k++) put(V3((k - 1) * .2, -M.L / 3 - .2, 0).applyMatrix4(G_.matrixWorld), .8 + k * .5, i * 3 + k + 100) });
    COLGANTES.count = n; COLGANTES.instanceMatrix.needsUpdate = true }

  // ======================= ABRIGO ROJO: corte de puntadas y caída =======================
  function ROJO_reset() { if (ROJO.parent !== T2G) { T2G.add(ROJO) } ROJO.position.copy(ROJO_REST.p); ROJO.rotation.set(0, 0, 0); ROJO.scale.set(1, 1, 1); ROJO.visible = true;
    PUNTOS.count = PUNTOS_N; for (let i = 0; i < PUNTOS_N; i++) PUNTOS.setMatrixAt(i, PUNTOS_M[i]); PUNTOS.instanceMatrix.needsUpdate = true; CABOS_R.count = 0; ST.corte = 0 }
  function cortarPuntos(u) { u = c01(u); ST.corte = u; const n = Math.round(u * PUNTOS_N), r = rnd(5);
    let k = 0; for (let i = 0; i < PUNTOS_N; i++) { if (i < n) { const [a, b] = PUNTOS_P[i]; for (const [p, q] of [[a, b], [b, a]]) { const d = q.clone().sub(p).normalize(); d.x += (r() - .5) * 1.2; d.y += r() * .6 - .1; d.z += .5;
          q1.setFromUnitVectors(Y_, d.normalize()); CABOS_R.setMatrixAt(k++, new T3.Matrix4().compose(p, q1.clone(), new T3.Vector3(1, .14 + r() * .12, 1))) } PUNTOS.setMatrixAt(i, new T3.Matrix4().makeScale(0, 0, 0)) } else PUNTOS.setMatrixAt(i, PUNTOS_M[i]) }
    PUNTOS.instanceMatrix.needsUpdate = true; CABOS_R.count = k; CABOS_R.instanceMatrix.needsUpdate = true;
    // se despega: primero el costado izquierdo, después abajo y la derecha
    const iz = S_(.05, .4, u), ab = S_(.35, .65, u), de = S_(.6, 1, u);
    ROJO.position.copy(ROJO_REST.p).add(new T3.Vector3(0, -.04 * ab, .05 * iz + .12 * ab + .1 * de)); ROJO.rotation.set(-.12 * ab - .06 * de, .14 * iz - .1 * de, -.05 * iz + .04 * de) }
  function abrigoRojoCae(u, dest) { u = c01(u); if (u <= 0) return ROJO; cortarPuntos(1); ROJO.updateWorldMatrix(true, false);
    const p0 = ROJO.getWorldPosition(new T3.Vector3()), q0 = ROJO.getWorldQuaternion(new T3.Quaternion()), fw = aMundo(0, 0, 1);
    const p1 = dest ? V3(dest) : new T3.Vector3(p0.x + fw.x * 3, g.position.y, p0.z + fw.z * 3); p1.y += .1;
    scene.attach(ROJO); const e = u ** 1.5, side = aMundo(1, 0, 0);
    ROJO.position.copy(p0).lerp(p1, e).addScaledVector(side, 1.6 * Math.sin(u * PI * 2.6) * (1 - u)).add(new T3.Vector3(0, .9 * Math.sin(PI * Math.min(1, u * 1.1)) * (1 - u), 0));
    const yaw = Math.atan2(fw.x, fw.z) + .6, q1_ = new T3.Quaternion().setFromEuler(new T3.Euler(-PI / 2, yaw, 0, "YXZ")), wob = new T3.Quaternion().setFromEuler(new T3.Euler(.7 * Math.sin(u * 11) * (1 - u), .9 * Math.sin(u * 7) * (1 - u), .6 * Math.sin(u * 9 + 1) * (1 - u)));
    ROJO.quaternion.copy(q0).slerp(q1_, S_(.1, .95, u)).multiply(wob); const fl = S_(.85, 1, u); ROJO.scale.set(1 + .1 * fl, 1 + .05 * fl, 1 - .55 * fl); return ROJO }
  function abrigoRojoEn(x, y, z, ry = 0, u = 1) { ROJO_reset(); scene.attach(ROJO); ROJO.visible = true; u = c01(u);
    ROJO.position.set(x, y + mix(1.1, .1, u), z); ROJO.quaternion.setFromEuler(new T3.Euler(-PI / 2 * eIO(u) + .1 * (1 - u), ry, 0, "YXZ")); ROJO.scale.set(1, 1, 1 - .55 * u); return ROJO }

  // ======================= API =======================
  const tr = (t, i, f = 1) => (Math.sin(t * 31 * f + i * 1.7) + .6 * Math.sin(t * 47 * f + i * 3.1)) * .5;
  const GOLPES_U = [.42, .57, .72];
  const golpeFuerza = u => Math.max(...GOLPES_U.map(k => u >= k - .004 ? ex2(((u - k) / .02) ** 2) : 0));
  const tirar = u => Math.max(...GOLPES_U.map(k => S_(k - .11, k - .035, u) * (1 - S_(k - .014, k, u))));
  const API = { g, J, PASO, ALTO: 22, ROJO, PUNTOS_N, GOLPES_U, frio: { p: null, r: 34, k: 0 },
    climas() { if (typeof ENV === "undefined") return; const E = {
        tejedora: { top: "#04070d", hor: "#161e2b", fog: .016, hemi: .34, hemiG: "#0d0f13", sun: .6, sunCol: "#9db6dc", exp: 1.45, grade: ["#5f82a8", .13], sol: [.35, .8, -.5], sombra: 90,
          velas: .55, ventanas: .45, tiembla: 2.6, estrellas: .4, luna: 1, niebla: 1, polvo: 1, humo: "#3c4554", luces: .6, cielo: 2 },
        noche: { top: "#060a16", hor: "#18203a", fog: .012, hemi: .5, hemiG: "#18140e", sun: .85, sunCol: "#a8bce6", exp: 1.35, grade: ["#9ab0d0", .06], sol: [-.4, 1, .25], sombra: 80,
          velas: 1.5, ventanas: 1.6, tiembla: 1, estrellas: 1, luna: 1, niebla: 0, polvo: .3, humo: "#4a5266", luces: 1.6, cielo: 2 } };
      if (ENV.noche) E.tejedora = Object.assign({}, ENV.noche, E.tejedora); for (const k in E) if (!ENV[k]) ENV[k] = E[k] },
    ocultar() { g.visible = false; AURA.visible = false; LUZ_FRIA.intensity = LUZ_PIES.intensity = 0; PUFFS.forEach(s => s.visible = false); ST.aura = false; API.frio.p = null; API.frio.k = 0; ROJO_reset() },
    poner(x, y, z, ry = 0) { g.visible = true; g.position.set(x, y, z); g.rotation.set(0, ry, 0); REST(); AURA.visible = false; LUZ_FRIA.intensity = LUZ_PIES.intensity = 0; ST.t = 0; ST.viento = 1;
      caderas.position.y = extLeg(.02, .06); piesPlanos(); brazosColgando(0); cabezaNivel(.32, CABEZA_ROLL); telaTick(0) },
    quieto(t) { ST.t = t; const b = Math.sin(t * .55) * .012, b2 = Math.sin(t * .23);
      caderas.position.y = extLeg(.02, .06) + b * .4; col1.rotation.x = .16 + b * .3; col2.rotation.x = .84 + b; cuello.rotation.x = -.18 - b * .6; col2.rotation.z = .07 + .015 * b2; T2G.scale.set(1 + b * .6, 1, 1 + b);
      piesPlanos(); brazosColgando(t); cabezaNivel(.32 + .03 * Math.sin(t * .19), CABEZA_ROLL + .05 * Math.sin(t * .13), .08 * Math.sin(t * .09)); telaTick(t) },
    caminar(t, vel = 2.6) { ST.t = t; ST.andando = true; const ph = t * vel / PASO * TAU; ST.fase = ph; ST.ciclo = PASO / Math.max(.01, vel);
      for (const s of [0, 1]) { const p = ph + s * PI, f = A_PASO * Math.sin(p), sw = Math.max(0, Math.cos(p)), k = .08 + 1.05 * sw ** 1.6 * S_(-.2, .3, Math.sin(p) + .3);
        J.muslo[s].rotation.x = -f; J.rodilla[s].rotation.x = k; J.tobillo[s].userData.extra = sw > .2 ? .3 * sw : 0 }
      caderas.position.y = Math.max(...[0, 1].map(s => extLeg(-J.muslo[s].rotation.x, J.rodilla[s].rotation.x))) - .15 * Math.abs(Math.sin(ph));
      caderas.rotation.y = .06 * Math.sin(ph); caderas.rotation.z = .04 * Math.sin(ph); pelvis.rotation.y = -.04 * Math.sin(ph); col2.rotation.z = -.05 * Math.sin(ph); col1.rotation.x = .16 + .04 * Math.abs(Math.cos(ph)); col2.rotation.x = .86;
      piesPlanos(); for (const s of [0, 1]) J.tobillo[s].userData.extra = 0;
      brazosColgando(t, .12, [.2 * Math.sin(ph - .8), .2 * Math.sin(ph + PI - .8)]); cabezaNivel(.3 + .03 * Math.sin(ph * 2), CABEZA_ROLL + .04 * Math.sin(ph)); telaTick(t) },
    agacharse(u, p) { u = eIO(c01(u)); if (!(u > 0)) return; let yaw = 0; if (p) { g.updateMatrixWorld(true); const l = g.worldToLocal(V3(p)); yaw = Math.max(-.7, Math.min(.7, Math.atan2(l.x, l.z))) }
      const f = .02 + .78 * u, k = .06 + 1.5 * u; for (const s of [0, 1]) { J.muslo[s].rotation.x = -f; J.rodilla[s].rotation.x = k }
      caderas.position.y = extLeg(f, k); caderas.position.z = -avLeg(f, k); pelvis.rotation.set(.06 + .6 * u, yaw * .5 * u, 0); col1.rotation.x = .16 + .2 * u; col2.rotation.x = .84 + .05 * u; col2.rotation.y = yaw * .3 * u; cuello.rotation.x = -.18 - .3 * u;
      piesPlanos(); brazosColgando(ST.t, .14 + .1 * u, [.3 * u, .3 * u]); cabezaNivel(.32 + .1 * u, CABEZA_ROLL * (1 - .5 * u), yaw * .4); ST.yaw = yaw; telaTick(ST.t) },
    golpear(t, u, p) { ST.t = t; u = c01(u); g.updateMatrixWorld(true); const P = p ? V3(p) : g.localToWorld(new T3.Vector3(0, 1.9, 5.5)).setY(g.position.y + 1.9);
      API.agacharse(.9 * S_(0, .32, u), P.toArray()); const s = 1, H = J.hombro[s]; H.updateWorldMatrix(true, false); const S0 = H.getWorldPosition(new T3.Vector3());
      const dir = P.clone().sub(S0).normalize(), up = new T3.Vector3(0, 1, 0), lado = aMundo(-1, 0, 0), Lf = LF[DEDO];
      const pull = tirar(u), hit = golpeFuerza(u), alcanza = eIO(S_(.05, .33, u));
      const Wt = P.clone().addScaledVector(dir, -Lf * .78).addScaledVector(up, Lf * .3).addScaledVector(dir, -pull * 1.1).addScaledVector(up, pull * .55);
      J.muneca[s].updateWorldMatrix(true, false); const W0 = J.muneca[s].getWorldPosition(new T3.Vector3()); Wt.lerpVectors(W0, Wt, alcanza);
      ik2(s, Wt, lado.clone().add(new T3.Vector3(0, -.6, 0)).normalize()); J.muneca[s].rotation.set(0, 0, 0);
      J.muneca[s].updateWorldMatrix(true, false); const Wp = J.muneca[s].getWorldPosition(new T3.Vector3()), dd = P.clone().sub(Wp).normalize();
      dedosColgando(t, s, (F, i) => { if (alcanza < .05) return false; if (i === DEDO) { apuntarW(F, dd.clone().addScaledVector(up, pull * .5 - .02 * hit * Math.sin(t * 60)).lerp(aMundo(0, -1, .1), 1 - alcanza)); F.rotateX(-.5 * alcanza); return true }
        apuntarW(F, dd.clone().addScaledVector(up, 1.1 * alcanza).addScaledVector(lado, (i - 1.5) * .45).lerp(aMundo(0, -1, .1), 1 - alcanza)); return true });
      API.mirar(P.toArray(), .9 * alcanza); telaTick(t) },
    golpeFuerza,
    abrirPuerta(u, p, d) { u = c01(u); const t = ST.t; g.updateMatrixWorld(true); const P = V3(p); API.agacharse(.95 * S_(0, .3, u), p);
      const s = 1, H = J.hombro[s]; H.updateWorldMatrix(true, false); const S0 = H.getWorldPosition(new T3.Vector3()), up = new T3.Vector3(0, 1, 0), lado = aMundo(-1, 0, 0), Lf = LF[DEDO];
      const hacia = d ? new T3.Vector3(d[0], 0, d[1]).normalize() : S0.clone().sub(P).setY(0).normalize(), abre = eIO(S_(.45, 1, u)), Q = P.clone().addScaledVector(hacia, 1.7 * abre), dir = Q.clone().sub(S0).normalize();
      const alcanza = eIO(S_(.05, .35, u)), Wt = Q.clone().addScaledVector(dir, -Lf * .8).addScaledVector(up, Lf * .25 + .3 * (1 - S_(.35, .45, u)));
      J.muneca[s].updateWorldMatrix(true, false); Wt.lerpVectors(J.muneca[s].getWorldPosition(new T3.Vector3()), Wt, alcanza);
      ik2(s, Wt, lado.clone().add(new T3.Vector3(0, -.6, 0)).normalize()); J.muneca[s].updateWorldMatrix(true, false); const Wp = J.muneca[s].getWorldPosition(new T3.Vector3()), dd = Q.clone().sub(Wp).normalize(), engancha = S_(.35, .45, u);
      dedosColgando(t, s, (F, i) => { if (alcanza < .05) return false; if (i === DEDO) { apuntarW(F, dd.clone().lerp(aMundo(0, -1, .1), 1 - alcanza)); F.rotateX(-.6 * alcanza - .5 * engancha); return true } apuntarW(F, dd.clone().addScaledVector(up, 1.2 * alcanza).addScaledVector(lado, (i - 1.5) * .45).lerp(aMundo(0, -1, .1), 1 - alcanza)); return true });
      API.mirar(P.toArray(), alcanza); telaTick(t); return abre },
    gritar(t, u) { ST.t = t; u = c01(u); if (!(u > 0)) return; ST.grito = u; const e = eIO(S_(0, .45, u)), T = e * (.4 + .6 * S_(.2, .6, u));
      col1.rotation.x = .16 - .34 * e + .02 * T * tr(t, 1); col2.rotation.x = .84 - 1.2 * e + .03 * T * tr(t, 2); cuello.rotation.x = -.18 - .25 * e + .03 * T * tr(t, 3); col2.rotation.z = .03 * T * tr(t, 4, .7);
      cuerpo.position.set(.06 * T * tr(t, 5, .5), 0, .05 * T * tr(t, 6, .5)); for (const s of [0, 1]) J.rodilla[s].rotation.x = .06 + .25 * e; caderas.position.y = extLeg(.02, .06 + .25 * e); piesPlanos();
      for (const s of [0, 1]) { const sg = s ? -1 : 1; apuntarW(J.hombro[s], aMundo(sg * (.14 + 1.35 * e) + .1 * T * tr(t, 7 + s), -1 + 1.2 * e + .1 * T * tr(t, 9 + s), .2 - .35 * e));
        J.codo[s].rotation.set(-.15 - .45 * e + .1 * T * tr(t, 11 + s), 0, sg * .3 * e); J.dedos[s].forEach((F, i) => { F.rotation.set(0, 0, 0); apuntarW(F, aMundo(sg * (.3 + .4 * e) * (i - 1.5) * .6, -1 + .4 * e, .3 * e + .3 * T * tr(t, 13 + i + s * 4, .6))) }) }
      cabezaNivel(.32 - 1.15 * e + .05 * T * tr(t, 20), CABEZA_ROLL * (1 - e) + .12 * T * tr(t, 21, .4), 0); ST.inflar = e * (.85 + .15 * Math.sin(t * 7)); ST.boca = eIO(S_(.08, .5, u)); telaTick(t) },
    mirar(p, u = 1) { if (!p || !(u > 0)) return; g.updateMatrixWorld(true); BOTON.updateWorldMatrix(true, false); const hc = BOTON.getWorldPosition(new T3.Vector3()), d = V3(p).sub(hc).applyQuaternion(g.getWorldQuaternion(q2).invert());
      const yaw = Math.max(-1.2, Math.min(1.2, Math.atan2(d.x, d.z))) * u, pitch = Math.max(-.9, Math.min(1.1, Math.atan2(-d.y, Math.hypot(d.x, d.z)))), cur = cabeza.getWorldQuaternion(new T3.Quaternion());
      col2.rotation.y += yaw * .2; cabezaNivel(pitch, 0, yaw * .85); const nq = cabeza.quaternion.clone(); cabeza.parent.updateWorldMatrix(true, false); cabeza.parent.getWorldQuaternion(q1).invert(); cabeza.quaternion.copy(q1.multiply(cur)).slerp(nq, u) },
    cortarPuntos, abrigoRojoCae, abrigoRojoEn,
    puntoW(i) { const [a, b] = PUNTOS_P[Math.max(0, Math.min(PUNTOS_N - 1, i | 0))]; T2G.updateWorldMatrix(true, false); return a.clone().lerp(b, .5).applyMatrix4(T2G.matrixWorld).toArray() },
    siguientePuntoW(u) { return API.puntoW(Math.min(PUNTOS_N - 1, Math.floor(c01(u) * PUNTOS_N))) },
    trepaPunto(u) { u = c01(u); const onT1 = u < .6, sup = onT1 ? sup1 : sup2, G = onT1 ? T1G : T2G, y = onT1 ? mix(.05, 3.9, u / .6) : mix(-.35, 1.6, (u - .6) / .4), th = TREPA_TH(u);
      G.updateWorldMatrix(true, false); const p = V3(sup(th, y)), n = nrm(sup, th, y), a = V3(sup(th, y + .1)).sub(p).normalize();
      return { p: p.applyMatrix4(G.matrixWorld).toArray(), n: n.transformDirection(G.matrixWorld).toArray(), arriba: a.transformDirection(G.matrixWorld).toArray() } },
    aura(on, k = 1) { ST.aura = !!on; AURA.visible = !!on; LUZ_FRIA.intensity = on ? 22 * k : 0; LUZ_PIES.intensity = on ? 10 * k : 0; if (!on) { API.frio.p = null; API.frio.k = 0; return } auraTick(ST.t, k);
      const c = API.pechoW(); API.frio.p = c; API.frio.k = k; if (typeof velasHacia === "function") velasHacia(c, .7 * k, API.frio.r) },
    luzFria(L) { const F = API.frio; if (!F.p || !L) return L; const fria = new T3.Color("#a6c0ff"), c = new T3.Color();
      return L.map(l => { const d = Math.hypot(l[0][0] - F.p[0], l[0][2] - F.p[2]), k = F.k * (1 - S_(F.r * .4, F.r, d)); if (k <= 0) return l; c.set(l[2] || "#ffb060").lerp(fria, .85 * k);
        return [l[0], l[1] * (1 - .55 * k) * (1 - .25 * k * Math.max(0, Math.sin(ST.t * 23 + l[0][0]))), "#" + c.getHexString(), l[3]] }) },
    cabezaW() { BOTON.updateWorldMatrix(true, false); return BOTON.localToWorld(new T3.Vector3(0, 0, .3)).toArray() },
    pechoW() { ROJO.updateWorldMatrix(true, false); return ROJO.getWorldPosition(new T3.Vector3()).toArray() },
    ganchoW(s = 1) { const F = J.dedos[s][DEDO]; F.updateWorldMatrix(true, false); return F.localToWorld(V3(PUNTA_DEDO(LF[DEDO]))).toArray() },
    pechoCam(d = 4, ang = 0, dy = 0) { ROJO.updateWorldMatrix(true, false); const h = ROJO.getWorldPosition(new T3.Vector3()), q = ROJO.getWorldQuaternion(new T3.Quaternion()), f = new T3.Vector3(Math.sin(ang), 0, Math.cos(ang)).applyQuaternion(q); return [h.x + f.x * d, h.y + f.y * d + dy, h.z + f.z * d] },
    pieW(s = 0) { J.tobillo[s].updateWorldMatrix(true, false); return J.tobillo[s].getWorldPosition(new T3.Vector3()).setY(g.position.y).toArray() },
    caraCam(d = 4, ang = 0, dy = 0) { BOTON.updateWorldMatrix(true, false); const h = BOTON.localToWorld(new T3.Vector3(0, 0, .3)), q = BOTON.getWorldQuaternion(new T3.Quaternion()), f = new T3.Vector3(Math.sin(ang), 0, Math.cos(ang)).applyQuaternion(q); return [h.x + f.x * d, h.y + f.y * d + dy, h.z + f.z * d] },
    alto() { g.updateMatrixWorld(true); const b = new T3.Box3().setFromObject(cuerpo); return b.max.y - g.position.y },
    // para rectAdd: la huella en planta (pies y faldón) en la pose actual
    huella() { const b = new T3.Box3().setFromObject(cuerpo); return { x: (b.min.x + b.max.x) / 2, z: (b.min.z + b.max.z) / 2, w: b.max.x - b.min.x, d: b.max.z - b.min.z } } };
  return API;
})();

// ======================= COMPATIBILIDAD: la campana del video anterior ya no existe (stubs para que las partes viejas sigan armando) =======================
const CBX = (() => {
  const sst = (a, b, v) => { const q = cl((v - a) / (b - a)); return q * q * (3 - 2 * q) };
  const hsh = (i, j) => { let n = (Math.imul(i | 0, 374761393) + Math.imul(j | 0, 668265263)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296 };
  const rd = (x, z) => { const i = Math.floor(x), j = Math.floor(z), u = x - i, v = z - j, a = u * u * (3 - 2 * u), b = v * v * (3 - 2 * v); return lerp(lerp(hsh(i, j), hsh(i + 1, j), a), lerp(hsh(i, j + 1), hsh(i + 1, j + 1), a), b) };
  const fbm = (x, z, o = 4) => { let s = 0, a = .5, f = 1, n = 0; for (let k = 0; k < o; k++) { s += a * rd(x * f + k * 17.3, z * f - k * 9.1); n += a; a *= .5; f *= 2.03 } return s / n };
  const TMx = (x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, "YXZ")), new THREE.Vector3(sx, sy, sz));
  const mergeGeo = list => { let n = 0; const qs = list.map(([g, m]) => { const q = g.index ? g.toNonIndexed() : g.clone(); if (m) q.applyMatrix4(m); if (!q.attributes.uv) q.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(q.attributes.position.count * 2), 2)); if (!q.attributes.normal) q.computeVertexNormals(); n += q.attributes.position.count; return q }), hayC = qs.some(q => q.attributes.color);
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2), co = hayC ? new Float32Array(n * 3).fill(1) : null; let o = 0;
    qs.forEach(q => { const k = q.attributes.position.count; pos.set(q.attributes.position.array, o * 3); nor.set(q.attributes.normal.array, o * 3); uv.set(q.attributes.uv.array, o * 2); if (co && q.attributes.color) co.set(q.attributes.color.array, o * 3); o += k });
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); g.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); if (co) g.setAttribute("color", new THREE.BufferAttribute(co, 3)); g.computeBoundingSphere(); return g };
  const lote = () => { const B = new Map(); return { add(mat, g, m) { (B.get(mat) || B.set(mat, []).get(mat)).push([g, m]) }, fin(par) { const out = []; for (const [mat, L] of B) { const me = new THREE.Mesh(mergeGeo(L), mat); par.add(me); out.push(me) } return out } } };
  const O = () => { const o = new THREE.Object3D(); o.visible = false; scene.add(o); return o };
  const PLAT = new THREE.Object3D(); PLAT.position.set(0, 2, -10); scene.add(PLAT);
  const polar = (r, h, a) => [r * Math.cos(a), h, r * Math.sin(a)];
  const cadenaMarco = (n, u) => ({ p: [0, 4 + u * 30, -60], t: [0, 1, 0], lado: [1, 0, 0], n: [0, 0, 1] });
  return { G: new THREE.Group(), ST: { nubes: false, solDir: null, temblor: 0, zumb: 0, cera: 0, calor: 0, golpe: null }, sst, fbm, rd, hsh, mergeGeo, TMx, lote, polar, A_ENT: 0, A_CAD_E: 0, A_VUELCA: 0, P_H: 6, HB: 1, H_TECHO: 1,
    rOut: h => 10, rIn: h => 9, hArriba: r => 0, cadenaMarco, PRIMER: [0, 4, -60], U_LABIO_E: .8, GANCHO: [0, 10, -10], PLAT_W: [0, 2, -10], HUECO_W: [0, 20, -10], PLAT, POLVO: O(), HAZ: O(), VAPOR: O(), reset() { }, porCuadro() { } } })();
const cadenaPunto = (n, u) => CBX.cadenaMarco(n, u).p, cadenaTangente = (n, u) => CBX.cadenaMarco(n, u).t, cadenaMarco = (n, u) => CBX.cadenaMarco(n, u);
const PRIMER_ESLABON = CBX.PRIMER, CADENA_U_LABIO = CBX.U_LABIO_E;
const interior = () => ({ plataforma: CBX.PLAT_W.slice(), labio: [0, 2, -10], gancho: CBX.GANCHO.slice(), entrada: [0, 2, -10], hueco: CBX.HUECO_W.slice(), vuelca: [0, 2, -9], ryPlataforma: 0 });
const plataformaW = (x, y, z) => { CBX.PLAT.updateMatrixWorld(true); return CBX.PLAT.localToWorld(new THREE.Vector3(x, y + .25, z)).toArray() };
const zumbido = () => { }, ceraEnLabio = () => { }, golpe = () => { }, golpeTemblor = () => 0, sombraCampana = dirSol => { if (dirSol && typeof SOL !== "undefined") SOL.dir = dirSol };
const TAPA_Y = (x, z) => 60, AGUJERO_W = () => [0, 60, 0], KELL_BORDE = [0, 60, 0], tapaCaeY = u => 60;
const tapaReset = () => { }, tapa = () => { }, tapaHundir = () => { }, tapaGotea = () => { }, tapaAgujero = () => { }, tapaCae = () => { }, lluviaTrigo = () => { }, tanerCae = () => { };
function sinBestia() { }

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

// ---------- caras ESTILO VOLZE v2 (pedido del dueño, 27-nov-2026: «las de él son más complejas»). Calcomanía plana negra #111 sobre
// la cabeza, pero con las capas que usa Volze: boca en MEDIALUNA rellena (a veces con franja de dientes), cejas y párpados de trazo
// que se afina en las puntas, rayitas de ojeras bajo los ojos en preocupación/miedo, un labio bajo la boca triste, brillo blanco en
// los ojos asustados. Medidas en px sobre 512 (= ancho de la cabeza).
const CARAV = {};
const TINTA = "#111111", BORDO = TINTA, LENGUA = TINTA;
const FW = 512, LW = 12;
const EX = 76, EY = 172, MY = 270;
const ERX = 20, ERY = 34;
// trazo que se afina en las puntas (como pincel): curva cuadrática o cúbica rellena con grosor variable
function trazoC(g, pts, W, { ini = .25, fin = .25, col = TINTA } = {}) { const N = 32, P = [];
  const at = t => { const u = 1 - t; if (pts.length === 3) return [u * u * pts[0][0] + 2 * u * t * pts[1][0] + t * t * pts[2][0], u * u * pts[0][1] + 2 * u * t * pts[1][1] + t * t * pts[2][1]];
    return [u * u * u * pts[0][0] + 3 * u * u * t * pts[1][0] + 3 * u * t * t * pts[2][0] + t * t * t * pts[3][0], u * u * u * pts[0][1] + 3 * u * u * t * pts[1][1] + 3 * u * t * t * pts[2][1] + t * t * t * pts[3][1]] };
  for (let i = 0; i <= N; i++) P.push(at(i / N)); const L = [], R = [];
  for (let i = 0; i <= N; i++) { const t = i / N, a = P[Math.max(0, i - 1)], b = P[Math.min(N, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
    const w = W / 2 * (t < .5 ? ini + (1 - ini) * Math.sin(t / .5 * Math.PI / 2) : fin + (1 - fin) * Math.sin((1 - t) / .5 * Math.PI / 2)); L.push([P[i][0] + nx * w, P[i][1] + ny * w]); R.push([P[i][0] - nx * w, P[i][1] - ny * w]) }
  g.fillStyle = col; g.beginPath(); L.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); R.reverse().forEach(p => g.lineTo(...p)); g.closePath(); g.fill() }
function pincel(g, pts, W = LW, o = {}) { trazoC(g, pts.length === 2 ? [pts[0], [(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2], pts[1]] : pts.slice(0, 4), Math.max(W, LW), o) }
const linea = (g, pts) => pincel(g, pts, LW);
// --- ojos
const ojoSolido = (g, x, k = 1, { brillo = false, dy = 0 } = {}) => { g.fillStyle = TINTA; g.beginPath(); g.ellipse(x, EY + dy, ERX * k, ERY * k, 0, 0, 7); g.fill();
  if (brillo) { g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(x + ERX * .28 * k, EY + dy - ERY * .38 * k, ERX * .3 * k, ERY * .2 * k, 0, 0, 7); g.fill() } };
const ojoAnillo = (g, x, k = 1.1) => { g.save(); g.strokeStyle = TINTA; g.lineWidth = 10; g.beginPath(); g.ellipse(x, EY, ERX * k, ERY * k, 0, 0, 7); g.stroke(); g.restore(); g.fillStyle = TINTA; g.beginPath(); g.ellipse(x, EY + 4, ERX * .38 * k, ERY * .32 * k, 0, 0, 7); g.fill() };
const ojoMedio = (g, x, s = 1) => { g.save(); g.beginPath(); g.rect(x - ERX * 1.3, EY - ERY * .15, ERX * 2.6, ERY * 1.4); g.clip(); ojoSolido(g, x); g.restore(); trazoC(g, [[x - ERX * 1.4, EY - ERY * .1 + s * 2], [x, EY - ERY * .22], [x + ERX * 1.4, EY - ERY * .1 - s * 2]], 10, { ini: .4, fin: .4 }) };
const ojoArco = (g, x, arriba = true) => trazoC(g, arriba ? [[x - 24, EY + 8], [x, EY - 20], [x + 24, EY + 8]] : [[x - 24, EY - 4], [x, EY + 20], [x + 24, EY - 4]], 13, { ini: .35, fin: .35 });
const ojoApret = (g, x, s) => trazoC(g, [[x - s * 20, EY - 20], [x + s * 18, EY], [x - s * 20, EY + 20]], 13, { ini: .4, fin: .4 });
const ojoNegro = (g, x) => ojoSolido(g, x), ojoGota = (g, x) => ojoSolido(g, x), ojoBlanco = (g, x) => ojoAnillo(g, x), ojoPunto = (g, x) => ojoSolido(g, x, .72), ojoChill = (g, x, s) => ojoMedio(g, x, s);
// --- párpados (arco sobre el ojo), ojeras (rayitas abajo)
const parpado = (g, x, s, tipo = "alto") => { const y = EY - ERY - 10;
  if (tipo === "alto") trazoC(g, [[x - 26, y + 10], [x - s * 2, y - 10], [x + 26, y + 8]], 9, { ini: .2, fin: .2 });
  if (tipo === "pena") trazoC(g, [[x - s * 26, y + 12], [x + s * 6, y - 4], [x + s * 26, y - 6]], 9, { ini: .2, fin: .3 }) };
const ojeras = (g, x, s, n = 2) => { for (let i = 0; i < n; i++) trazoC(g, [[x - 16 + i * 4, EY + ERY + 10 + i * 9], [x + s * 2, EY + ERY + 15 + i * 9], [x + 16 - i * 4, EY + ERY + 10 + i * 9]], 6, { ini: .15, fin: .15 }) };
// --- cejas: trazo que se afina (Volze: en V para enojo, /\ para pena/preocupación, arco alto para sorpresa)
const ceja = (g, x, s, tipo) => { const y = EY - ERY - 28;
  if (tipo === "enojo") trazoC(g, [[x + s * 32, y - 14], [x + s * 4, y - 2], [x - s * 26, y + 16]], 15, { ini: .3, fin: .55 });
  if (tipo === "pena") trazoC(g, [[x - s * 28, y - 12], [x + s * 4, y - 4], [x + s * 32, y + 10]], 14, { ini: .55, fin: .3 });
  if (tipo === "alta") trazoC(g, [[x - 28, y + 2], [x, y - 22], [x + 28, y + 2]], 13, { ini: .3, fin: .3 });
  if (tipo === "duda") trazoC(g, s < 0 ? [[x - 28, y - 2], [x, y - 20], [x + 28, y - 6]] : [[x - 28, y + 4], [x, y + 2], [x + 28, y - 2]], 13, { ini: .3, fin: .3 }) };
// --- bocas
// medialuna rellena: borde de arriba casi recto (o curvo) y abajo redondo; dientes = franja blanca arriba
const medialuna = (g, w = 120, h = 54, { dientes = false, curva = 10, dy = 0 } = {}) => { const x0 = 256 - w / 2, x1 = 256 + w / 2, y0 = MY - h * .35 + dy;
  const camino = () => { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(256, y0 + curva, x1, y0); g.bezierCurveTo(x1 - w * .05, y0 + h * .9, 256 + w * .25, y0 + h, 256, y0 + h); g.bezierCurveTo(256 - w * .25, y0 + h, x0 + w * .05, y0 + h * .9, x0, y0); g.closePath() };
  camino(); g.fillStyle = TINTA; g.fill(); if (dientes) { g.save(); camino(); g.clip(); g.fillStyle = "#ffffff"; g.fillRect(x0, y0 - 4, w, h * .26 + curva * .5); g.restore() } };
// boca abierta de susto: trapecio redondeado relleno (ancho abajo), con dientes arriba
const bocaSusto = (g, w = 74, h = 70) => { const y0 = MY - h * .4; g.beginPath(); g.moveTo(256 - w * .32, y0); g.lineTo(256 + w * .32, y0); g.quadraticCurveTo(256 + w * .62, y0 + h * .95, 256 + w * .38, y0 + h); g.lineTo(256 - w * .38, y0 + h); g.quadraticCurveTo(256 - w * .62, y0 + h * .95, 256 - w * .32, y0); g.closePath(); g.fillStyle = TINTA; g.fill();
  g.save(); g.clip(); g.fillStyle = "#ffffff"; g.fillRect(256 - w * .4, y0, w * .8, h * .2); g.restore() };
// sonrisa: U de trazo que se afina; tristeza: arco invertido de trazo + labio abajo
const bocaU = (g, ancho = .3, prof = 40) => { const w = FW * ancho / 2; trazoC(g, [[256 - w, MY - prof * .3], [256, MY + prof], [256 + w, MY - prof * .3]], 14, { ini: .3, fin: .3 }) };
const bocaArcoInv = (g, ancho = .16, alto = 18, labio = true) => { const w = FW * ancho / 2; trazoC(g, [[256 - w, MY + alto * .55], [256, MY - alto], [256 + w, MY + alto * .55]], 14, { ini: .3, fin: .3 });
  if (labio) trazoC(g, [[256 - 12, MY + 22], [256, MY + 27], [256 + 12, MY + 22]], 7, { ini: .3, fin: .3 }) };
const bocaRecta = (g, ancho = .14, ladeo = 0) => { const w = FW * ancho / 2; trazoC(g, [[256 - w, MY + ladeo], [256, MY + 2], [256 + w, MY - ladeo]], 13, { ini: .35, fin: .35 }) };
const bocaO = (g, rx = 16, ry = 22) => { g.fillStyle = TINTA; g.beginPath(); g.ellipse(256, MY + 4, rx, ry, 0, 0, 7); g.fill() };
const bocaAbierta = (g, w = 150) => medialuna(g, Math.min(w, 150) * .8, 56, { dientes: true });
const bocaDientes = g => { medialuna(g, 110, 40, { dientes: true, curva: -6 }) };
const bocaZig = g => trazoC(g, [[256 - 40, MY + 6], [256 - 14, MY - 10], [256 + 14, MY + 8], [256 + 40, MY - 6]], 12, { ini: .3, fin: .3 });
const bocaD = g => medialuna(g, 130, 60, { dientes: true });
const dos = (g, f) => [-1, 1].forEach(s => f(256 + s * EX, s));
const CARAS_CAT = {
  neutral: g => { dos(g, x => ojoSolido(g, x)); bocaRecta(g, .12) },
  happy: g => { dos(g, x => ojoSolido(g, x)); medialuna(g, 150, 58, { dientes: true }) },
  warm: g => { dos(g, x => ojoSolido(g, x)); bocaU(g, .26, 34) },
  hopeful: g => { dos(g, (x, s) => { ojoSolido(g, x); parpado(g, x, s, "pena") }); bocaU(g, .2, 24) },
  relieved: g => { dos(g, (x, s) => { ojoArco(g, x); ceja(g, x, s, "pena") }); bocaU(g, .28, 34) },
  paz: g => { dos(g, x => ojoArco(g, x, false)); bocaU(g, .22, 26) },
  laugh: g => { dos(g, x => ojoArco(g, x)); medialuna(g, 170, 72, { dientes: true }) },
  excited: g => { dos(g, (x, s) => { ojoSolido(g, x, 1.1, { brillo: true }); ceja(g, x, s, "alta") }); medialuna(g, 160, 68, { dientes: true }) },
  starstruck: g => { dos(g, (x, s) => { ojoSolido(g, x, 1.15, { brillo: true }); ceja(g, x, s, "alta") }); medialuna(g, 150, 64, { dientes: true }) },
  sad: g => { dos(g, (x, s) => { ojoSolido(g, x, .95, { dy: 4 }); ceja(g, x, s, "pena"); ojeras(g, x, s, 1) }); bocaArcoInv(g, .16, 16) },
  worried: g => { dos(g, (x, s) => { ojoSolido(g, x); ceja(g, x, s, "pena"); ojeras(g, x, s, 2) }); bocaArcoInv(g, .14, 12, false) },
  pleading: g => { dos(g, (x, s) => { ojoSolido(g, x, 1.15, { brillo: true }); ceja(g, x, s, "pena") }); bocaArcoInv(g, .12, 12) },
  gloomy: g => { dos(g, (x, s) => { ojoMedio(g, x, s); ojeras(g, x, s, 2) }); bocaArcoInv(g, .12, 8, false) },
  squint: g => { dos(g, (x, s) => ojoMedio(g, x, s)); bocaRecta(g, .13) },
  suspicious: g => { dos(g, (x, s) => { ojoMedio(g, x, s); ceja(g, x, s, s < 0 ? "enojo" : "duda") }); bocaRecta(g, .14, 6) },
  determined: g => { dos(g, (x, s) => { ojoSolido(g, x); ceja(g, x, s, "enojo") }); bocaRecta(g, .15) },
  brave: g => { dos(g, (x, s) => { ojoSolido(g, x); ceja(g, x, s, "duda") }); trazoC(g, [[212, MY - 4], [256, MY + 16], [302, MY - 12]], 14, { ini: .3, fin: .3 }) },
  angry: g => { dos(g, (x, s) => { ojoSolido(g, x, .9); ceja(g, x, s, "enojo") }); bocaArcoInv(g, .16, 16) },
  grito: g => { dos(g, (x, s) => { ojoSolido(g, x, .9); ceja(g, x, s, "enojo") }); medialuna(g, 120, 64, { dientes: true, curva: -14 }) },
  scared: g => { dos(g, (x, s) => { ojoSolido(g, x, 1.05, { brillo: true }); parpado(g, x, s, "alto"); ojeras(g, x, s, 1) }); bocaSusto(g, 70, 62) },
  terrified: g => { dos(g, (x, s) => { ojoSolido(g, x, 1.2, { brillo: true }); ceja(g, x, s, "pena"); ojeras(g, x, s, 2) }); bocaSusto(g, 84, 80) },
  horrified: g => { dos(g, (x, s) => { ojoAnillo(g, x, 1.25); ceja(g, x, s, "alta"); ojeras(g, x, s, 2) }); bocaSusto(g, 80, 86) },
  panic: g => { dos(g, (x, s) => { ojoSolido(g, x, 1.1, { brillo: true }); ceja(g, x, s, "pena"); ojeras(g, x, s, 1) }); bocaSusto(g, 76, 70) },
  shock: g => { dos(g, (x, s) => { ojoAnillo(g, x, 1.15); ceja(g, x, s, "alta") }); bocaO(g, 18, 24) },
  gasp: g => { dos(g, (x, s) => { ojoSolido(g, x, 1.1, { brillo: true }); ceja(g, x, s, "alta") }); bocaO(g, 13, 17) },
  curious: g => { dos(g, (x, s) => { ojoSolido(g, x); ceja(g, x, s, "duda") }); bocaO(g, 9, 11) },
  listen: g => { dos(g, (x, s) => { ojoSolido(g, x); parpado(g, x, s, "alto") }); bocaRecta(g, .08) },
  susurra: g => { dos(g, (x, s) => { ojoSolido(g, x); ceja(g, x, s, "pena") }); bocaO(g, 8, 10) },
  sopla: g => { dos(g, (x, s) => ojoApret(g, x, s)); bocaO(g, 12, 14) },
  cerrados: g => { dos(g, x => ojoArco(g, x, false)); bocaRecta(g, .11) },
  happyD: g => { dos(g, x => ojoSolido(g, x)); medialuna(g, 130, 60, { dientes: true }) },
};
// el parpadeo: los mismos rasgos con los ojos como un arco cerrado
function caraV(kind, cerr = false) { const key = kind + (cerr ? "_c" : ""); if (CARAV[key]) return CARAV[key];
  return CARAV[key] = tex(512, 384, (g, w, h) => { g.lineCap = "round"; g.lineJoin = "round"; const f = CARAS_CAT[kind] || CARAS_CAT.neutral;
    if (!cerr) return f(g);
    const c2 = mk(512, 384), g2 = c2.getContext("2d"); f(g2); g2.clearRect(0, EY - ERY - 6, 512, ERY * 2 + 12); g.drawImage(c2, 0, 0); dos(g, x => ojoArco(g, x, false)) }) }
// piel: beige claro (la piel que pase el elenco se lleva hacia el pastel)
const pielPastel = c => "#" + new THREE.Color(c).lerp(new THREE.Color("#f6e3cc"), .4).getHexString();
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
function volze(k, o) { const skin = pielPastel(o.skin); k.skin = skin; k.r6 = true; delete k.falda; delete k.pasoMax; delete k.zancMax;
  [k.body, k.armL, k.armR, k.legL, k.legR].forEach(quitarMallas); [...k.head.children].forEach(c => { if (c !== k.decal) k.head.remove(c) });
  const plast = map => new THREE.MeshStandardMaterial({ map, roughness: .62 });
  // torso 1,04 × 1,04 × .52; brazos y piernas .5 × 1,04 × .5 (la mitad del torso), pegados; bisel chico
  const t = o.torso, lado = plast(tex(64, 64, (g, w, h) => { g.fillStyle = t.chaleco ? t.chaleco[0] : t.col; g.fillRect(0, 0, w, h); if (t.faja) { g.fillStyle = t.faja[0]; g.fillRect(0, h * .77, w, h * .14) } sombra2D(g, w, h, .12) }));
  part(RB(1.04, 1.04, .52, .05), boxMats(lado, plast(torsoV(t)), plast(torsoV(t, true))), 0, 1.54, 0, k.body, 0);
  [k.armL, k.armR].forEach((a, i) => { part(RB(.5, 1.04, .5, .05), plast(brazoV({ skin, ...o.brazo })), 0, -.44, 0, a, 0); a.position.x = (i ? 1 : -1) * .77 });
  [k.legL, k.legR].forEach((l, i) => { part(RB(.5, 1.02, .5, .05), plast(piernaV({ skin, ...o.pierna })), 0, -.5, 0, l, 0); l.position.x = (i ? 1 : -1) * .26 });
  // cabeza de Roblox: bloque ancho con las aristas verticales bien redondeadas, sin cuello; la cara pegada al frente
  part(RB(.74, .66, .7, .075, 4), new THREE.MeshStandardMaterial({ color: skin, roughness: .6, emissive: skin, emissiveIntensity: .28 }), 0, .38, 0, k.head, 0);   // luz pareja en la cara
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

// ================= ELENCO DE «NOBODY ANSWERS THE KNOCK»: personajes, caras, utilería y poses =================
// Va DESPUÉS de _volze_personajes.js (usa caraV, CARAS_CAT, trazoC, ojo*, ceja, ojeras, parpado, medialuna, boca*, estampa, sombra2D,
// anteojosV, accMat, bloque, gema). Estilo: bloques de plástico mate con bisel chico, ropa PINTADA (calcomanía), cabeza recta, caras v2.
// En 3D solo pelo (con textura de hebras y trenzas de eslabones), gorras, anteojos, y los accesorios que cuentan algo:
// la cinta métrica y las tijeras del sastre, el muñeco de Tib, los hilos de Marga, el llavero de Crane, los abrigos.
//
// QUIÉN ES QUIÉN (instancias del motor reutilizadas + 6 nuevas)
//   ME     = el narrador, sastre adolescente (escala .9): camisa blanca, chaleco azul marino con alfileres, cinta métrica al cuello,
//            tijeras grandes colgando del cinto, pelo castaño despeinado.
//   TIB    = el hermano chico (escala .74): pijama celeste con estrellitas, pelo rubio revuelto, muñeco de trapo en la mano izquierda.
//   MAMA   = muda, ojos tristes (cara de reposo «tristeMudo»): vestido lavanda floreado, trenza negra larga. abrigoRojo(MAMA, true) al final.
//   PAPA   = cansado (cara de reposo «cansado»): camisa a cuadros verde, overol de jean, gorra roja.
//   MARGA  = vieja (escala .9, encorvada): chal rosa, rodete gris, anteojos, hilos de colores al cuello.
//   CRANE  = Father Crane: ≈ 1,3 × más alto que un adulto, flaco, sotana negra con botonera, cuello clerical blanco, pelo gris
//            engominado, llavero en el cinto; cara de reposo «crane» (sonrisa de costado, no parpadea). abrigoPuesto(CRANE, "crane").
//   VECINOS[0..9] (abrigados, colores distintos) · NOVIO · NOVIA (velo) · CORO[0..3] (túnicas bordó con esclavina blanca)
//   ELENCO_V = todos en orden · ELENCO_N = { ME, TIB, MAMA, PAPA, MARGA, CRANE, NOVIO, NOVIA, V0..V9, C0..C3 }
//
// CONVENCIONES: las poses se llaman DESPUÉS de ponerP/enAire y de pose() del motor (que limpia todo y esconde la utilería por cuadro).
// k.g es el punto de los pies; el personaje mira a +z local. t = segundos (para ciclos), u = 0..1 (avance de una acción).
// setFace(k, "neutral") pone la cara de reposo del personaje (k.caraBase: Crane «crane», Mamá «tristeMudo», Papá «cansado»).
//
// API (todas devuelven algo útil o nada):
//   caras nuevas: crane, sonrisaFalsa, ternura, tristeMudo, llora, tapada, tos, habla, cansado, concentrado, canta, miedo, tristeza,
//     alivio, susto, enojo (+ todas las del catálogo v2: happy, warm, sad, worried, scared, terrified, horrified, shock, relieved,
//     determined, suspicious, gloomy, listen, frio, desprecio, aguanta, esfuerzo, terror, grito…)
//   quieto(k,t) · andar(k,t,{vel}) · correrV(k,t,{fuerte}) · mirarArriba(k,t,u) · senalar(k,t,u,{alto,mano}) · retroceder(k,t,u)
//   abrazarse(k,t) · boda(novio,novia,t) · ladear(k,t,u,{lado}) · caerAtras(k,t,u) · gesto(k,t,t0,tipo) · caer · saltar
//   taparBoca(a,b,u,{colocar=true,cara="tapada"})   A (a la derecha de B, de costado) le tapa la boca a B con la mano; el otro brazo
//                                                   por la espalda. colocar = pone a A junto a B (B ya puesto). B se agarra del brazo.
//   hablarManos(k,t,{vel=1})                        lengua de señas: las dos manos cambian de seña cada ≈ .45 s, golpecitos y giros
//   coser(k,t,{punto=null, tela=true})              aguja con hilo: tira el hilo en lazos; tela = retazo en la mano izquierda;
//                                                   punto = Vector3 del mundo donde entra la aguja (p. ej. un abrigo de la escena)
//   cortarTijera(k,t,{a=null, sobre=false, vel=1})  las tijeras grandes en la mano derecha, abren y cierran; a = punto a cortar (mundo);
//                                                   sobre = true: solo mueve el brazo derecho (llamarla después de trepar). Devuelve la
//                                                   punta (Vector3 mundo).
//   trepar(k,t,{h=0, vel=1})                        trepa la tela (la cara a +z, pegada a la pared de abrigos ≈ .45·s adelante)
//   levantarAbrigo(k,u,{tipo="rojo"})               se agacha y levanta el abrigo del piso (estaba 0,9·s adelante) hasta el pecho
//   toser(k,t,{cara="tos"})                         tose con el puño en la boca, sacudones
//   llorarMudo(k,t,{cara="llora"})                  llora sin ruido: cabeza gacha, hombros que tiemblan, lágrimas 3D que caen
//   asentir(k,t,{vel=1, fuerza=1})                  asiente («sí» sin voz, las bodas)
//   empujarRopero(k,u,{pasos=3})                    empuja con las dos manos (la cara de atrás del ropero a ≈ .95·s adelante);
//                                                   la escena mueve k.g y el ropero con u
//   tocarCampana(k,t,{periodo=2.4, cuerda=true, alto=8})  tira de la cuerda (dibuja la cuerda hasta `alto` m arriba). Devuelve el tirón 0..1
//   colgarAbrigo(k,u,{tipo="tib", gancho=null})     lleva el abrigo en la mano derecha hasta el gancho (Vector3 mundo; por defecto
//                                                   ≈ 2,5·s arriba y .9·s adelante) y lo deja colgado desde u = .75
//   abrigoEnMano(k, tipo|null, {mano="R", doblado=true})   tipo: "tib" (chico, azul) · "crane" (negro largo) · "rojo"
//   abrigoPuesto(k, tipo|null, on=true)             se lo pone (cáscara pintada sobre torso, mangas y faldón). Persistente.
//   abrigoRojo(k, on)                               = abrigoPuesto(k, "rojo", on)
//   abrigoColgado(tipo, pos, ry=0)                  el abrigo colgado en un gancho del mundo (pos = el gancho; cuelga hacia abajo)
//   abrigoEnPiso(tipo, pos, ry=0)                   el abrigo tirado en el piso (la calle)
//   lista(k, on, {leer=true})                       el papel con nombres y deudas en las dos manos, leyendo (cabeza gacha)
//   listaEn(pos, ry, rx)                            el papel solo en el mundo (planos de detalle)
//   saludarBuenasNoches(k,t,{hablar=true})          saludo chiquito con la mano, cabeza ladeada, boca que habla
//   escuchar(k,t)                                   la oreja contra la puerta (la puerta ≈ .5·s adelante), manos apoyadas
//   asustado(k,t,{u=1, cara="terror"})              encogido, manos en el pecho, tiembla
//   salirVentana(k,u,{alto=1, fondo=.55})           sale por la ventana (alféizar a `alto` m, `fondo` adelante): pierna arriba, se
//                                                   sube agachado, pasa y cae del otro lado. Termina parado ≈ 1,5·s adelante.
//   muneco(k, modo)                                 Tib: "mano" (por defecto, colgando de la mano izq.) · "abrazo" · null (sin muñeco)
//   tijeraCuelga(k, on)                             las tijeras colgadas del cinto del sastre (se esconden solas mientras corta)
//   ojosW(k) → [Vector3, Vector3] · bocaW(k) → Vector3   (centros de los ojos y de la boca en el mundo, para la cámara)
const H_CAD = 1.02, A_BRAZO = .42, F30 = 1 / 30;
const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3(), _v4 = new THREE.Vector3(), _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _q3 = new THREE.Quaternion();
const _ABAJO = new THREE.Vector3(0, -1, 0), _mb = new THREE.Matrix4(), _ax = new THREE.Vector3(), _ay = new THREE.Vector3(), _az = new THREE.Vector3();
const _frac = x => x - Math.floor(x), _suave = q => { q = cl(q); return q * q * (3 - 2 * q) };
const HC = k => k.hcad ?? H_CAD, AB = k => k.brazoA ?? A_BRAZO;   // alto de la cadera y ángulo de los brazos en «A» de cada uno (Sallow los tiene distintos)
function caraDz(kind, cerr = false) { return caraV(kind, cerr) }   // la reasigna _volze_personajes.js: la declaración tiene que existir

// ================= CARAS EXTRA del elenco: con las piezas de la v2 del integrador (_volze_personajes.js: trazoC, ojoSolido, ojoAnillo, ojoMedio,
// parpado, ojeras, ceja, medialuna, bocaSusto, bocaU, bocaArcoInv, bocaRecta, bocaO; EX, EY, MY, ERX, ERY). Misma complejidad que el catálogo:
// cejas que se afinan, ojeras en miedo/cansancio, medialuna rellena en risa/grito, labio bajo la boca triste, brillo en ojos asustados.
// dientes apretados: rectángulo redondeado negro con la fila de dientes blanca al medio y una raya
const dientesApret = (g, w = 100, h = 30) => { g.fillStyle = TINTA; g.beginPath(); g.roundRect(256 - w / 2, MY - h / 2, w, h, h * .35); g.fill(); g.fillStyle = "#ffffff"; g.beginPath(); g.roundRect(256 - w / 2 + 7, MY - h / 2 + 6, w - 14, h - 12, 5); g.fill(); g.fillStyle = TINTA; g.fillRect(256 - w / 2 + 7, MY - 1.5, w - 14, 3) };
const dosE = (g, f) => [-1, 1].forEach(s => f(256 + s * EX, s));
// «frio»: mirada fija con cejas rectas y bajas, boca recta finita
CARAS_CAT.frio = g => { dosE(g, (x, s) => { ojoSolido(g, x, .85); trazoC(g, [[x - 28, EY - ERY - 16], [x, EY - ERY - 18], [x + 28, EY - ERY - 16 + s * 3]], 12, { ini: .35, fin: .35 }) }); bocaRecta(g, .11) };
// «desprecio»: un ojo entornado, una ceja alzada, media sonrisa torcida
CARAS_CAT.desprecio = g => { dosE(g, (x, s) => { if (s < 0) ojoMedio(g, x, s); else { ojoSolido(g, x); ceja(g, x, s, "duda") } }); trazoC(g, [[256 - 34, MY + 6], [256 + 6, MY + 6], [256 + 40, MY - 12]], 13, { ini: .35, fin: .3 }) };
// «aguanta»: cejas de enojo, dientes apretados (medialuna chata con dientes)
CARAS_CAT.aguanta = g => { dosE(g, (x, s) => { ojoSolido(g, x, .9); ceja(g, x, s, "enojo") }); dientesApret(g, 100, 30) };
// «esfuerzo»: ojos apretados, cejas de enojo, dientes apretados más anchos, ojeras de cansancio
CARAS_CAT.esfuerzo = g => { dosE(g, (x, s) => { ojoApret(g, x, s); ceja(g, x, s, "enojo"); ojeras(g, x, s, 1) }); dientesApret(g, 120, 36) };
// «wow»: asombro feliz, ojos grandes con brillo, cejas altas, medialuna con dientes
CARAS_CAT.wow = g => { dosE(g, (x, s) => { ojoSolido(g, x, 1.2, { brillo: true }); ceja(g, x, s, "alta") }); medialuna(g, 130, 64, { dientes: true }) };
// «mira»: mirando algo arriba, ojos con brillo, cejas altas, «o» chica
CARAS_CAT.mira = g => { dosE(g, (x, s) => { ojoSolido(g, x, 1.05, { brillo: true, dy: -4 }); ceja(g, x, s, "alta") }); bocaO(g, 10, 13) };
// «furia»: cejas de enojo bien marcadas, ojos chicos, grito con dientes (boca hacia abajo)
CARAS_CAT.furia = g => { dosE(g, (x, s) => { ojoSolido(g, x, .85); ceja(g, x, s, "enojo") }); bocaSusto(g, 78, 58) };
// «grito» (pisa la del catálogo: es NELL llamando «Say my name»): ojos apretados, cejas de pena, boca enorme abierta con dientes
CARAS_CAT.grito = g => { dosE(g, (x, s) => { ojoApret(g, x, s); ceja(g, x, s, "pena") }); bocaSusto(g, 92, 92) };
// «terror»: ojos enormes con brillo, párpado alto, cejas de pena, doble ojera, boca de susto con dientes
CARAS_CAT.terror = g => { dosE(g, (x, s) => { ojoSolido(g, x, 1.25, { brillo: true }); ceja(g, x, s, "pena"); ojeras(g, x, s, 2) }); bocaSusto(g, 86, 88) };
// «educada»: Nell mirando a un extraño: ojos un poco chicos sin cejas, una sonrisita chata de compromiso
CARAS_CAT.educada = g => { dosE(g, x => ojoSolido(g, x, .88)); bocaU(g, .13, 10) };
// «vacia»: los olvidados. Sin rasgos.
CARAS_CAT.vacia = g => { };
// «sallow» (no se usa: hay un Sallow nuevo): ojos chiquitos fijos con ojeras, sin cejas, una U finísima demasiado ancha
CARAS_CAT.sallow = g => { dosE(g, (x, s) => { ojoSolido(g, x - s * 14, .5); ojeras(g, x - s * 14, s, 2) }); trazoC(g, [[256 - 150, MY - 50], [256 - 130, MY + 60], [256 + 130, MY + 60], [256 + 150, MY - 50]], 9, { ini: .2, fin: .2 }) };
// ---------- caras de «Nobody Answers The Knock»
// «crane»: la cara de reposo de Father Crane: ojos chicos y quietos (los ojos NO sonríen), párpado bajo, una sonrisa de costado que sube
// solo del lado derecho, con un hoyuelo en la punta
CARAS_CAT.crane = g => { dosE(g, (x, s) => { ojoSolido(g, x, .78); trazoC(g, [[x - 26, EY - ERY * .55], [x, EY - ERY * .75], [x + 26, EY - ERY * .55]], 9, { ini: .3, fin: .3 }) });
  trazoC(g, [[256 - 72, MY + 6], [256 - 10, MY + 16], [256 + 50, MY + 4], [256 + 84, MY - 24]], 13, { ini: .3, fin: .45 }); trazoC(g, [[256 + 80, MY - 34], [256 + 92, MY - 22], [256 + 88, MY - 10]], 6, { ini: .2, fin: .2 }) };
// «sonrisaFalsa»: Crane sonriendo a alguien: medialuna torcida (más alta a la derecha), ojos medio cerrados sin brillo, una ceja alzada
CARAS_CAT.sonrisaFalsa = g => { dosE(g, (x, s) => { ojoMedio(g, x, s); if (s > 0) ceja(g, x, s, "duda") });
  g.save(); g.translate(256, MY); g.rotate(-.16); g.translate(-256, -MY); medialuna(g, 150, 46, { dientes: true, curva: 8 }); g.restore() };
// «ternura»: ojos cerrados contentos (arcos), cejas apenas de pena, sonrisa chica
CARAS_CAT.ternura = g => { dosE(g, (x, s) => { ojoArco(g, x, true); trazoC(g, [[x - s * 24, EY - ERY - 22], [x + s * 4, EY - ERY - 30], [x + s * 26, EY - ERY - 24]], 10, { ini: .4, fin: .3 }) }); bocaU(g, .2, 26) };
// «tristeMudo»: la madre: párpados caídos de pena, doble ojera, boca cerrada en arco chato (sin labio: no habla)
CARAS_CAT.tristeMudo = g => { dosE(g, (x, s) => { ojoSolido(g, x, .9, { dy: 5 }); parpado(g, x, s, "pena"); ojeras(g, x, s, 2) }); bocaArcoInv(g, .12, 8, false) };
// «llora»: ojos apretados, cejas de pena, ojeras, boca temblando en arco con labio (las lágrimas son 3D: llorarMudo)
CARAS_CAT.llora = g => { dosE(g, (x, s) => { ojoApret(g, x, -s); ceja(g, x, s, "pena"); ojeras(g, x, s, 2) }); bocaArcoInv(g, .18, 20) };
// «tapada»: le taparon la boca: ojos enormes con brillo, cejas de pena, sin boca (la tapa la mano)
CARAS_CAT.tapada = g => { dosE(g, (x, s) => { ojoSolido(g, x, 1.25, { brillo: true }); ceja(g, x, s, "pena"); ojeras(g, x, s, 1) }) };
// «tos»: ojos apretados, boca «o» abierta
CARAS_CAT.tos = g => { dosE(g, (x, s) => { ojoApret(g, x, s); ceja(g, x, s, "pena") }); bocaO(g, 20, 26) };
// «habla»: hablando bajito (Tib: «goodnight»): ojos normales, medialuna chica abierta
CARAS_CAT.habla = g => { dosE(g, x => ojoSolido(g, x)); medialuna(g, 70, 34, { curva: 4 }) };
// «cansado»: el padre: ojos a media asta, ojeras dobles, boca recta un poco caída a un lado
CARAS_CAT.cansado = g => { dosE(g, (x, s) => { ojoMedio(g, x, s); ojeras(g, x, s, 2) }); bocaRecta(g, .13, -5) };
// «concentrado»: cosiendo: mirada abajo, una ceja de duda, boca corta torcida
CARAS_CAT.concentrado = g => { dosE(g, (x, s) => { ojoSolido(g, x, .9, { dy: 9 }); if (s < 0) ceja(g, x, s, "duda") }); bocaRecta(g, .08, 6) };
// «canta»: el coro: ojos cerrados para arriba, boca abierta redonda grande
CARAS_CAT.canta = g => { dosE(g, (x, s) => { ojoArco(g, x, false); ceja(g, x, s, "alta") }); bocaO(g, 24, 32) };
// alias en castellano (los nombres que usa el guion)
Object.assign(CARAS_CAT, { miedo: CARAS_CAT.scared, tristeza: CARAS_CAT.sad, alivio: CARAS_CAT.relieved, susto: CARAS_CAT.horrified, enojo: CARAS_CAT.angry, alegre: CARAS_CAT.happy });
const SIN_PARPADEO = new Set(["relieved", "alivio", "paz", "cerrados", "sopla", "esfuerzo", "happyD", "grito", "sallow", "vacia", "vuelve", "terror", "ternura", "llora", "tos", "canta"]);
// UN parpadeo de 4 cuadros (a 30 fps) cada 1,2–1,6 s, desfasado por personaje (Crane no parpadea nunca: k.sinParpadeo)
function parpadeo(k, t) { if (k.caraFija || k.sinParpadeo) return false; const T = 1.2 + .4 * _frac(k.idx * .618 + .31), ph = (t + T * _frac(k.idx * .377 + .15)) % T;
  if (ph < 4 * F30 && k.cara && !SIN_PARPADEO.has(k.cara)) { const m = caraV(k.cara, true); if (k.decal.material.map !== m) { k.decal.material.map = m; k.decal.material.needsUpdate = true } return true } return false }
// setFace: Sallow siempre con su sonrisa (k.caraFija); los olvidados (k.sinCara) quedan «vacia» cuando la escena pide «neutral»
{ const sf0 = setFace; setFace = (k, f) => sf0(k, k.caraFija || (f === "neutral" && k.caraBase ? k.caraBase : k.sinCara && f === "neutral" ? "vacia" : f)) }
// caraVuelve(k, u, cara): la cara de un olvidado vuelve: u = 0 lisa («vacia») … 1 la cara pedida (por defecto «neutral»). 11 pasos cacheados.
const CARA_VUELVE = {};
function caraVuelve(k, u, cara = "neutral") { const q = Math.round(cl(u) * 10) / 10, m = k.decal.material; let t;
  if (q <= 0) t = caraV("vacia"); else if (q >= 1) t = caraV(cara);
  else t = CARA_VUELVE[cara + q] ||= tex(512, 384, g => { g.globalAlpha = 1 - q; g.drawImage(caraV("vacia").image, 0, 0); g.globalAlpha = q; g.drawImage(caraV(cara).image, 0, 0); g.globalAlpha = 1 });
  k.cara = q >= 1 ? cara : "vuelve"; if (m.map !== t) { m.map = t; m.needsUpdate = true } return t }

// ================= ROPA PINTADA (texturas planas con sombreado suave): estampados de colores, cera, quemaduras =================
const ROPAC = {};
// manchas de grasa/hollín: gotas negras irregulares con un brillo chico (sembradas: siempre las mismas)
function manchasG(g, w, h, n, seed, y0 = 0) { const r = rng(seed); for (let i = 0; i < n; i++) { const x = r() * w, y = y0 + r() * (h - y0), R = 8 + r() * 16; g.fillStyle = "rgba(22,18,14,.86)"; g.beginPath();
    for (let j = 0; j < 9; j++) { const a = j / 9 * 6.283, rr = R * (.65 + r() * .55); g.lineTo(x + Math.cos(a) * rr * 1.7, y + Math.sin(a) * rr * .6) } g.closePath(); g.fill();
    g.fillStyle = "rgba(255,255,255,.22)"; g.beginPath(); g.ellipse(x - R * .25, y - R * .25, R * .22, R * .12, -.5, 0, 7); g.fill() } }
// chorreadas de CERA: gota de cera clara con un hilo que cae y termina en una bolita, brillo arriba
function manchasCera(g, w, h, n, seed, y0 = 0, col = "rgba(222,200,140,.8)") { const r = rng(seed); for (let i = 0; i < n; i++) { const x = r() * w, y = y0 + r() * (h - y0) * .85, R = 4 + r() * 9;
    g.fillStyle = col; g.beginPath(); for (let j = 0; j < 11; j++) { const a = j / 11 * 6.283, rr = R * (.55 + r() * .7); g.lineTo(x + Math.cos(a) * rr * 1.3, y + Math.sin(a) * rr * .8) } g.closePath(); g.fill();   // salpicón irregular
    for (let d = 0, nd = 1 + (r() * 2 | 0); d < nd; d++) { const xd = x + (r() - .5) * R * 1.4, L = R * (1 + r() * 3.2), wd = R * (.18 + r() * .2); g.beginPath(); g.moveTo(xd - wd, y); g.lineTo(xd + wd, y); g.lineTo(xd + wd * .7, y + L); g.arc(xd, y + L, wd * 1.25, 0, Math.PI); g.closePath(); g.fill() }   // chorritos que caen
    for (let d = 0; d < 4; d++) { g.beginPath(); g.arc(x + (r() - .5) * R * 4, y + (r() - .5) * R * 3, 1 + r() * 2.5, 0, 7); g.fill() }   // gotitas sueltas
    g.fillStyle = "rgba(255,250,230,.35)"; g.beginPath(); g.ellipse(x - R * .3, y - R * .2, R * .3, R * .16, 0, 0, 7); g.fill() } }
// quemaduras de cera en la piel: manchas rojizas con el centro rosado y una ampollita
function quemadurasG(g, x0, y0, w, h, n, seed) { const r = rng(seed); for (let i = 0; i < n; i++) { const x = x0 + r() * w, y = y0 + r() * h, R = 4 + r() * 7;
    g.fillStyle = "rgba(170,70,58,.45)"; g.beginPath(); for (let j = 0; j < 9; j++) { const a = j / 9 * 6.283, rr = R * (.6 + r() * .7); g.lineTo(x + Math.cos(a) * rr * 1.4, y + Math.sin(a) * rr) } g.closePath(); g.fill();
    g.fillStyle = "rgba(226,140,120,.55)"; g.beginPath(); g.ellipse(x + R * .2, y, R * .6, R * .4, r() * 3, 0, 7); g.fill(); if (r() < .5) { g.fillStyle = "rgba(255,236,214,.6)"; g.beginPath(); g.arc(x - R * .2, y - R * .1, R * .22, 0, 7); g.fill() } } }
// remiendo: un parche de otro color con puntadas
function remiendoG(g, x, y, w, h, col) { g.fillStyle = col; g.fillRect(x, y, w, h); g.fillStyle = "rgba(0,0,0,.12)"; g.fillRect(x, y + h - 6, w, 6); g.setLineDash([10, 8]); g.strokeStyle = "rgba(240,230,210,.75)"; g.lineWidth = 4; g.strokeRect(x + 7, y + 7, w - 14, h - 14); g.setLineDash([]) }
// estampados nuevos (además de los de estampa(): rayas, franjas, rombos, zigzag, guarda, lunares):
//   floreado (flores grandes de 5 pétalos con hojitas) · florecitas (chiquitas, sin hojas) · cuadros (vichy) · rayitas (finas)
// esc = escala del dibujo (.5 en brazos y piernas, que tienen la mitad de píxeles por metro que el torso)
function estampaC(g, w, h, kind, base, alt, alt2, esc = 1) { g.save(); if (esc !== 1) g.scale(esc, esc); const W = w / esc, H = h / esc;
  if (kind === "floreado" || kind === "florecitas") { const big = kind === "floreado", R = big ? 30 : 15, paso = big ? 118 : 64, r = rng(big ? 77 : 31);
    for (let y = paso * .45, f = 0; y < H + R; y += paso * .78, f++) for (let x = (f % 2) * paso / 2 + paso * .2; x < W + R; x += paso) { const xx = x + (r() - .5) * paso * .25, yy = y + (r() - .5) * paso * .25, rot = r() * 6;
      if (big) { g.fillStyle = "#5e8a52"; for (const a of [rot + 2.2, rot + 4.1]) { g.beginPath(); g.ellipse(xx + Math.cos(a) * R * 1.05, yy + Math.sin(a) * R * 1.05, R * .5, R * .22, a, 0, 7); g.fill() } }
      g.fillStyle = alt; for (let p = 0; p < 5; p++) { const a = rot + p / 5 * 6.283; g.beginPath(); g.ellipse(xx + Math.cos(a) * R * .55, yy + Math.sin(a) * R * .55, R * .45, R * .32, a, 0, 7); g.fill() }
      g.fillStyle = alt2 || "#f2c230"; g.beginPath(); g.arc(xx, yy, R * .27, 0, 7); g.fill() } }
  else if (kind === "cuadros") { g.fillStyle = alt; g.globalAlpha = .55; for (let x = 0; x < W; x += 56) g.fillRect(x, 0, 26, H); for (let y = 0; y < H; y += 56) g.fillRect(0, y, W, 26); g.globalAlpha = 1 }
  else if (kind === "rayitas") { g.fillStyle = alt; for (let x = 10; x < W; x += 34) g.fillRect(x, 0, 9, H) }
  else if (kind === "estrellitas") { const r = rng(404), estrella = (x, y, R, a) => { g.beginPath(); for (let i = 0; i < 10; i++) { const q = a + i * Math.PI / 5, rr = i % 2 ? R * .45 : R; g.lineTo(x + Math.cos(q) * rr, y + Math.sin(q) * rr) } g.closePath(); g.fill() };
    for (let y = 40, f = 0; y < H + 30; y += 92, f++) for (let x = (f % 2) * 60 + 30; x < W + 30; x += 120) { const xx = x + (r() - .5) * 40, yy = y + (r() - .5) * 30;
      if (r() < .7) { g.fillStyle = r() < .5 ? alt : (alt2 || "#f4e27a"); estrella(xx, yy, 13 + r() * 6, r() * 6) } else { g.fillStyle = alt2 || "#f4e27a"; g.beginPath(); g.arc(xx, yy, 14, 0, 7); g.fill(); g.fillStyle = base; g.beginPath(); g.arc(xx + 7, yy - 4, 12, 0, 7); g.fill() } } }
  else estampa(g, W, H, kind, base, alt);
  g.restore() }
const patronC = (g, w, h, o, base) => { g.save(); g.beginPath(); g.rect(0, 0, w, h); g.clip(); estampaC(g, w, h, o.kind, base, o.alt || "#efe6d2", o.alt2, .5); g.restore() };
// frente/espalda del torso. o: { col, kind, alt, alt2, levita: [col, chaleco, camisa, corbata], cadena: col, chaleco: [col, botón], panuelo: col, cuello: col,
//   botones: col, delantal: [col, borde, "cuero"?], chal: [col, guarda], traje: [camisa, moño, flor], encaje: col, faja: [col, vivo], tirantes: col,
//   remiendos: [col, …], manchas: n (grasa), cera: n (chorreadas de cera), seed }
function torsoC(o, back = false) { const key = "t" + JSON.stringify(o) + back; return ROPAC[key] ||= tex(512, 512, (g, w, h) => {
  g.fillStyle = o.col; g.fillRect(0, 0, w, h); if (o.kind) estampaC(g, w, h, o.kind, o.col, o.alt || "#efe6d2", o.alt2);
  if (o.tejido) { const [c1, c2] = o.tejido; g.fillStyle = c1; for (let y = 70; y < h; y += 150) g.fillRect(0, y, w, 26); g.fillStyle = c2; for (let y = 130, f = 0; y < h; y += 150, f++) for (let x = (f % 2) * 30 + 15; x < w; x += 60) { g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill() }
    g.strokeStyle = "rgba(0,0,0,.12)"; g.lineWidth = 2; for (let y = 8; y < h; y += 16) for (let x = 0; x < w; x += 16) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 8, y + 8); g.lineTo(x + 16, y); g.stroke() } }
  if (o.cuelloR && !back) { g.strokeStyle = o.cuelloR; g.lineWidth = 22; g.beginPath(); g.arc(256, -30, 120, .25, Math.PI - .25); g.stroke() }
  if (o.overol) { g.fillStyle = o.overol; g.fillRect(0, 300, w, h - 300); if (!back) { g.fillRect(150, 190, 212, 120); g.fillRect(150, 0, 40, 200); g.fillRect(322, 0, 40, 200); g.fillStyle = "#f2d060"; for (const x of [170, 342]) { g.beginPath(); g.arc(x, 200, 11, 0, 7); g.fill() } g.strokeStyle = "rgba(255,255,255,.5)"; g.setLineDash([8, 6]); g.lineWidth = 3; g.strokeRect(160, 200, 192, 100); g.setLineDash([]) } else { g.save(); g.lineWidth = 40; g.strokeStyle = o.overol; g.beginPath(); g.moveTo(120, 0); g.lineTo(380, 310); g.moveTo(392, 0); g.lineTo(132, 310); g.stroke(); g.restore() } }
  if (o.escudo && !back) { const [c1, c2] = o.escudo, x = 256, y = 250; g.fillStyle = c1; g.beginPath(); g.moveTo(x - 60, y - 60); g.lineTo(x + 60, y - 60); g.lineTo(x + 60, y + 10); g.quadraticCurveTo(x + 50, y + 60, x, y + 80); g.quadraticCurveTo(x - 50, y + 60, x - 60, y + 10); g.closePath(); g.fill(); g.fillStyle = c2; g.font = "bold 80px sans-serif"; g.textAlign = "center"; g.fillText("7", x, y + 38) }
  if (o.cuello && !back) { g.fillStyle = o.cuello; g.beginPath(); g.moveTo(160, 0); g.lineTo(256, 110); g.lineTo(352, 0); g.closePath(); g.fill() }
  if (o.chaleco) { g.fillStyle = o.chaleco[0]; if (back) g.fillRect(0, 0, w, h); else { g.beginPath(); g.moveTo(0, 0); g.lineTo(196, 0); g.lineTo(256, 150); g.lineTo(256, h); g.lineTo(0, h); g.closePath(); g.fill(); g.beginPath(); g.moveTo(w, 0); g.lineTo(316, 0); g.lineTo(256, 150); g.lineTo(256, h); g.lineTo(w, h); g.closePath(); g.fill();
      g.fillStyle = "rgba(0,0,0,.3)"; g.fillRect(253, 150, 6, h - 150); if (o.chaleco[1]) { g.fillStyle = o.chaleco[1]; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(276, 200 + i * 80, 12, 0, 7); g.fill() } } } }
  if (o.levita) { const [lc, ch, cam, cor] = o.levita; g.fillStyle = lc; if (back) { g.fillRect(0, 0, w, h); g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(250, 300, 10, h - 300); for (const x of [200, 312]) { g.fillStyle = "#4a4440"; g.beginPath(); g.arc(x, 410, 11, 0, 7); g.fill() } }
    else { g.fillStyle = ch; g.fillRect(150, 0, 212, h); g.fillStyle = cam; g.beginPath(); g.moveTo(186, 0); g.lineTo(256, 120); g.lineTo(326, 0); g.closePath(); g.fill(); g.fillStyle = cor; g.beginPath(); g.moveTo(232, 14); g.lineTo(280, 14); g.lineTo(268, 112); g.lineTo(256, 126); g.lineTo(244, 112); g.closePath(); g.fill();
      g.fillStyle = "rgba(255,255,255,.18)"; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(256, 180 + i * 78, 10, 0, 7); g.fill() }
      g.fillStyle = lc; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(256 + s * 256, 0); g.lineTo(256 + s * 66, 0); g.lineTo(256 + s * 150, 210); g.lineTo(256 + s * 106, 260); g.lineTo(256 + s * 106, h); g.lineTo(256 + s * 256, h); g.closePath(); g.fill() }
      g.fillStyle = "rgba(255,255,255,.08)"; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(256 + s * 66, 0); g.lineTo(256 + s * 150, 210); g.lineTo(256 + s * 120, 236); g.lineTo(256 + s * 96, 0); g.closePath(); g.fill() } }
    // gastada: brillos de uso y deshilachado en los bordes
    g.fillStyle = "rgba(160,150,140,.10)"; const r = rng(91 + (back ? 1 : 0)); for (let i = 0; i < 26; i++) g.fillRect(r() * w, r() * h, 6 + r() * 30, 2 + r() * 4) }
  if (o.cadena && !back) { g.strokeStyle = o.cadena; g.lineWidth = 9; g.setLineDash([12, 6]); g.beginPath(); g.moveTo(262, 260); g.quadraticCurveTo(300, 330, 352, 300); g.stroke(); g.setLineDash([]) }
  if (o.tirantes) { g.fillStyle = o.tirantes; g.fillRect(130, 0, 34, h); g.fillRect(348, 0, 34, h) }
  if (o.chal) { const V = (d, lw, c) => { g.strokeStyle = c; g.lineWidth = lw; g.lineJoin = "miter"; g.beginPath(); g.moveTo(-10, 250 - d); g.lineTo(256, 470 - d); g.lineTo(522, 250 - d); g.stroke() };
    g.fillStyle = o.chal[0]; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w, 250); g.lineTo(256, 470); g.lineTo(0, 250); g.closePath(); g.fill(); estampa(g, w, 250, "rombos", o.chal[0], oscV(o.chal[0], .82)); if (o.chal[1]) V(40, 18, o.chal[1]) }
  if (o.traje && !back) { const [cam, mo, flor] = o.traje; g.fillStyle = cam; g.beginPath(); g.moveTo(186, 0); g.lineTo(326, 0); g.lineTo(256, 230); g.closePath(); g.fill();
    g.fillStyle = "rgba(0,0,0,.35)"; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(256 + s * 70, 0); g.lineTo(256 + s * 96, 0); g.lineTo(256 + s * 8, 250); g.lineTo(256, 236); g.closePath(); g.fill() }
    g.fillStyle = mo; g.beginPath(); g.moveTo(256, 44); g.lineTo(222, 26); g.lineTo(222, 64); g.closePath(); g.fill(); g.beginPath(); g.moveTo(256, 44); g.lineTo(290, 26); g.lineTo(290, 64); g.closePath(); g.fill(); g.fillRect(248, 36, 16, 16);
    if (flor) { for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283; g.fillStyle = "#f6f2ea"; g.beginPath(); g.arc(140 + Math.cos(a) * 15, 110 + Math.sin(a) * 15, 11, 0, 7); g.fill() } g.fillStyle = flor; g.beginPath(); g.arc(140, 110, 9, 0, 7); g.fill() } }
  if (o.delantal) { const [dc, db, tipo] = o.delantal; g.fillStyle = dc; g.fillRect(0, 226, w, 22); if (!back) { g.fillRect(150, 60, 212, 180); g.fillRect(96, 236, 320, h - 236); g.fillRect(156, 0, 18, 64); g.fillRect(338, 0, 18, 64);
      g.strokeStyle = db; g.lineWidth = 8; g.strokeRect(186, 340, 140, 80); g.fillStyle = db; g.fillRect(96, h - 30, 320, 12);
      if (tipo === "cuero") { g.setLineDash([9, 7]); g.strokeStyle = "rgba(240,220,180,.6)"; g.lineWidth = 3; g.strokeRect(160, 70, 192, 160); g.strokeRect(106, 246, 300, h - 290); g.setLineDash([]);
        g.fillStyle = "rgba(0,0,0,.18)"; for (const [x, y, ww, hh] of [[110, 300, 60, 6], [330, 380, 70, 5], [200, 450, 90, 6]]) g.fillRect(x, y, ww, hh);   // marcas y rayones del cuero
        g.fillStyle = "rgba(255,240,210,.14)"; g.fillRect(150, 60, 212, 14) } } }
  if (o.encaje) { g.fillStyle = o.encaje; for (let x = 0; x < w + 32; x += 40) { g.beginPath(); g.arc(x, 0, 22, 0, Math.PI); g.fill() } }
  if (o.faja) { g.fillStyle = o.faja[0]; g.fillRect(0, h - 104, w, 54); if (o.faja[1]) { g.fillStyle = o.faja[1]; g.fillRect(0, h - 84, w, 12) } }
  if (o.panuelo) { g.fillStyle = o.panuelo; g.fillRect(96, 0, 320, 40); if (!back) { g.beginPath(); g.moveTo(150, 24); g.lineTo(256, 190); g.lineTo(362, 24); g.closePath(); g.fill(); g.fillStyle = "rgba(255,255,255,.55)"; for (const [x, y] of [[210, 60], [300, 60], [256, 120], [236, 90], [276, 90]]) { g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill() } g.fillStyle = "rgba(0,0,0,.2)"; g.fillRect(96, 36, 320, 6) } }
  if (o.corazon && !back) { const x = 330, y = 300, r = 34; g.fillStyle = o.corazon; g.beginPath(); g.moveTo(x, y + r * 1.4); g.bezierCurveTo(x - r * 2.2, y + r * .2, x - r * 1.1, y - r * 1.4, x, y - r * .35); g.bezierCurveTo(x + r * 1.1, y - r * 1.4, x + r * 2.2, y + r * .2, x, y + r * 1.4); g.fill() }
  if (o.bufanda) { const [b1, b2] = o.bufanda; for (let x = 0; x < w; x += 64) { g.fillStyle = (x / 64) % 2 ? b2 : b1; g.fillRect(x, 0, 64, 70) } if (!back) for (let y = 70; y < 330; y += 52) { g.fillStyle = ((y - 70) / 52) % 2 ? b2 : b1; g.fillRect(320, y, 74, 52) } }
  // sotana: botonera larga de botoncitos al medio (y la costura)
  if (!back && o.botonera) { g.fillStyle = "rgba(255,255,255,.06)"; g.fillRect(250, 0, 12, h); for (let i = 0; i < 11; i++) { const y = 70 + i * 42; g.fillStyle = o.botonera; g.beginPath(); g.arc(256, y, 8, 0, 7); g.fill(); g.fillStyle = "rgba(255,255,255,.35)"; g.beginPath(); g.arc(253, y - 3, 3, 0, 7); g.fill() } }
  // cuello clerical: banda blanca arriba con la lengüeta cuadrada al medio
  if (o.clerical) { g.fillStyle = o.clerical; g.fillRect(150, 0, 212, 22); if (!back) { g.fillRect(232, 0, 48, 52); g.fillStyle = "rgba(0,0,0,.18)"; g.fillRect(232, 48, 48, 4) } }
  // esclavina del coro: capa corta blanca sobre los hombros con el borde en ondas y un ribete
  if (o.esclavina) { const [c1, c2] = o.esclavina, yb = back ? 150 : 175; g.fillStyle = c1; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w, yb - 40);
    for (let x = w; x >= 0; x -= 32) g.quadraticCurveTo(x - 16, yb + 26 - Math.abs(x - 256) * .12, x - 32, yb - 40 + (back ? 0 : 0)); g.closePath(); g.fill();
    if (c2) { g.strokeStyle = c2; g.lineWidth = 8; g.beginPath(); g.moveTo(0, yb - 58); g.lineTo(w, yb - 58); g.stroke() } if (!back && o.cruz) { g.fillStyle = o.cruz; g.fillRect(250, 60, 12, 60); g.fillRect(234, 78, 44, 12) } }
  // alfileres clavados en el pecho (cabezas de colores con la aguja plateada), y un carretel de hilo pintado en el bolsillo
  if (!back && o.alfileres) { const r = rng(o.seed || 31), cols = ["#e8403a", "#f2d040", "#4a8ae0", "#f4f4f4", "#5ab05a", "#e870b0"];
    for (let i = 0; i < o.alfileres; i++) { const x = 330 + r() * 120, y = 120 + r() * 120, a = -.6 + r() * 1.2, L = 34 + r() * 14;
      g.strokeStyle = "#d8dce2"; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.sin(a) * L, y + Math.cos(a) * L); g.stroke(); g.fillStyle = cols[i % cols.length]; g.beginPath(); g.arc(x, y, 8, 0, 7); g.fill(); g.fillStyle = "rgba(255,255,255,.5)"; g.beginPath(); g.arc(x - 3, y - 3, 2.5, 0, 7); g.fill() }
    g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(70, 300, 110, 6); g.fillStyle = "#c9a26a"; g.fillRect(96, 262, 20, 44); g.fillStyle = "#d8403a"; g.fillRect(100, 270, 12, 28); g.fillStyle = "#8a6238"; g.fillRect(92, 260, 28, 6); g.fillRect(92, 302, 28, 6) }
  if (!back && o.botones) { g.fillStyle = o.botones; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(256, 150 + k * 82, 11, 0, 7); g.fill() } }
  if (o.remiendos) o.remiendos.forEach((c, i) => back ? remiendoG(g, i ? 300 : 70, i ? 120 : 300, 120, 100, c) : remiendoG(g, i ? 70 : 340, i ? 330 : 380, 110, 96, c));
  if (o.manchas) manchasG(g, w, h, o.manchas, (o.seed || 7) + (back ? 50 : 0), 120);
  if (o.cera) manchasCera(g, w, h, back ? Math.ceil(o.cera / 3) : o.cera, (o.seed || 7) + (back ? 60 : 0), back ? 120 : 190);
  { const gp = (x, y, r, a) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r) };   // pliegues pintados
    gp(0, 140, 150, .16); gp(w, 140, 150, .16); gp(256, h, 220, .12); g.strokeStyle = "rgba(0,0,0,.06)"; g.lineWidth = 14; g.lineCap = "round"; for (const [x0, y0, x1, y1] of [[60, 200, 180, 330], [452, 210, 340, 340], [200, 420, 300, 460]]) { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2 + 20, (y0 + y1) / 2, x1, y1); g.stroke() }
    const br = g.createRadialGradient(200, 160, 0, 200, 160, 200); br.addColorStop(0, "rgba(255,255,255,.10)"); br.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = br; g.fillRect(0, 0, w, h) }
  sombra2D(g, w, h, .12) }) }
const torsoLadoC = o => ROPAC["l" + JSON.stringify(o)] ||= tex(64, 64, (g, w, h) => { g.fillStyle = o.levita ? o.levita[0] : o.chaleco ? o.chaleco[0] : o.chal ? o.chal[0] : o.col; g.fillRect(0, 0, w, h);
  if (o.kind && !o.levita && !o.chaleco && !o.chal) estampaC(g, w, h, o.kind, o.col, o.alt || "#efe6d2", o.alt2, .125);
  if (o.delantal) { g.fillStyle = o.delantal[0]; g.fillRect(0, 28, w, 3) } if (o.faja) { g.fillStyle = o.faja[0]; g.fillRect(0, h - 13, w, 7) } if (o.panuelo) { g.fillStyle = o.panuelo; g.fillRect(0, 0, w, 5) } sombra2D(g, w, h, .12) });
// brazo: manga hasta `manga` (0 sin manga … 1 larga) con estampado (kind/alt/alt2), puño (punoH = alto: arremangado grueso), rayas, guante (y guanteDesde),
// manchas, cera, quemaduras (n, en la piel), remiendo; el resto es la mano color piel
// manos con color de piel (pedido del dueño, 28-nov-2026): la manga nunca llega a la punta; queda un 24 % de mano
const brazoC = o => ROPAC["b" + JSON.stringify(o)] ||= tex(128, 256, (g, w, h) => { const y = h * Math.min(o.manga ?? .82, .76); g.fillStyle = o.skin; g.fillRect(0, 0, w, h); g.fillStyle = o.col; g.fillRect(0, 0, w, y);
  if (o.kind) patronC(g, w, y, o, o.col);
  if (o.rayas) { g.fillStyle = o.rayas; for (let yy = 34; yy < y - 34; yy += 54) g.fillRect(0, yy, w, 16) }
  if (o.puno) { const ph = o.punoH || 20; g.fillStyle = o.puno; g.fillRect(0, y - ph - 6, w, ph); if (o.punoH) { g.fillStyle = "rgba(0,0,0,.18)"; g.fillRect(0, y - ph / 2 - 6, w, 3) } }
  if (o.remiendo) remiendoG(g, 18, h * .3, 92, 60, o.remiendo);
  if (o.alfiletero) { const yy = y - 46; g.fillStyle = "#6a4a2a"; g.fillRect(0, yy - 4, w, 10); g.fillStyle = o.alfiletero; g.beginPath(); g.ellipse(64, yy - 16, 30, 24, 0, 0, 7); g.fill(); g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = 2; for (const a of [-.8, 0, .8]) { g.beginPath(); g.moveTo(64, yy - 40); g.quadraticCurveTo(64 + a * 40, yy - 16, 64, yy + 8); g.stroke() }
    const cols = ["#f2d040", "#f4f4f4", "#4a8ae0", "#5ab05a"]; [[50, -30], [76, -34], [60, -22], [84, -18]].forEach(([x, dy], i) => { g.strokeStyle = "#d8dce2"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, yy + dy); g.lineTo(x - 6, yy + dy - 22); g.stroke(); g.fillStyle = cols[i]; g.beginPath(); g.arc(x - 6, yy + dy - 22, 5, 0, 7); g.fill() }) }
  if (o.manchas) manchasG(g, w, y, o.manchas, o.seed || 3);
  if (o.cera) manchasCera(g, w, y, o.cera, (o.seed || 3) + 20, 10);
  g.fillStyle = "rgba(0,0,0,.16)"; g.fillRect(0, y, w, 4);
  if (o.quemaduras) quemadurasG(g, 10, y + 16, w - 20, h * .95 - y - 16, o.quemaduras, (o.seed || 3) + 40);
  if (o.guante) { const yg = h * (o.guanteDesde ?? .76); g.fillStyle = o.guante; g.fillRect(0, yg, w, h - yg); g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(0, yg + 6, w, 7); g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(0, yg, w, 5) }
  sombra2D(g, w, h, .1) });
// pierna: pantalón hasta `largo` (debajo, media o piel) con estampado, pollera/levita pintada arriba hasta `falda` (con estampado si hay kind);
// zapato = franja oscura abajo (cana = alto), gastado = raspones; frente = 1 → la cara de adelante (delantalP: el delantal sigue hasta la rodilla; cera)
const piernaC = o => ROPAC["p" + JSON.stringify(o)] ||= tex(128, 256, (g, w, h) => { const L = h * (o.largo ?? .87);
  g.fillStyle = o.media || o.skin; g.fillRect(0, 0, w, h); g.fillStyle = o.col; g.fillRect(0, 0, w, L);
  if (o.rayado) { g.fillStyle = o.rayado; for (let x = 10; x < w; x += 26) g.fillRect(x, 0, 6, L) }
  if (o.kind && !o.falda) patronC(g, w, L, o, o.col);
  if (o.denim) { const r = rng(o.seed || 5); for (let i = 0; i < 900; i++) { g.fillStyle = r() < .5 ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.08)"; g.fillRect(r() * w, r() * L, 1 + r() * 3, 1) }
    const kn = g.createRadialGradient(w / 2, L * .5, 4, w / 2, L * .5, 60); kn.addColorStop(0, "rgba(255,255,255,.12)"); kn.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = kn; g.fillRect(0, 0, w, L);
    g.strokeStyle = "rgba(230,190,110,.35)"; g.setLineDash([5, 4]); g.lineWidth = 2; g.beginPath(); g.moveTo(8, 0); g.lineTo(8, L); g.stroke(); g.setLineDash([]); g.fillStyle = "rgba(0,0,0,.15)"; g.fillRect(0, L - 16, w, 5) }
  if (!o.falda) { g.fillStyle = "rgba(0,0,0,.1)"; g.fillRect(w / 2 - 2, 0, 4, L * .9) }
  if (o.remiendo) remiendoG(g, 20, h * .42, 86, 56, o.remiendo);
  if (o.manchas) manchasG(g, w, L, o.manchas, o.seed || 5, 20);
  if (o.falda) { const yf = h * o.falda; g.fillStyle = o.faldaCol || o.col; g.fillRect(0, 0, w, yf); if (o.kind) patronC(g, w, yf, o, o.faldaCol || o.col); if (o.ruedo) { g.fillStyle = o.ruedo; g.fillRect(0, yf - 24, w, 14) } if (o.remiendoF) remiendoG(g, 24, yf * .35, 80, 50, o.remiendoF); g.fillStyle = "rgba(0,0,0,.2)"; g.fillRect(0, yf, w, 5) }
  if (o.frente && o.delantalP) { const yd = h * .5; g.fillStyle = o.delantalP; g.fillRect(0, 0, w, yd); g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(0, yd - 6, w, 6) }
  if (o.frente && o.cera) manchasCera(g, w, L, o.cera, (o.seed || 5) + 9, 10);
  if (L < h * .86) { g.fillStyle = "rgba(0,0,0,.2)"; g.fillRect(0, L, w, 4) }
  const zb = h * (1 - (o.cana ?? .13)); g.fillStyle = o.zapato || "#2a2220"; g.fillRect(0, zb, w, h - zb); g.fillStyle = "rgba(255,255,255,.12)"; g.fillRect(0, zb, w, 4);
  if (o.gastado) { g.fillStyle = "rgba(200,190,170,.3)"; for (let i = 0; i < 8; i++) g.fillRect(6 + (i * 37) % (w - 30), zb + 8 + (i * 13) % Math.max(4, h - zb - 14), 12 + (i * 7) % 16, 3) }
  sombra2D(g, w, h, .1) });

// ================= PELO COMO EL DE VOLZE: pieza esculpida con mechones, surcos y textura de hebras =================
// Base: un casco continuo (caja redondeada alrededor de la cabeza) que cubre arriba, costados y nuca hasta la línea de cada estilo y se hunde
// en la cabeza debajo de esa línea. Encima: surcos irregulares entre mechones grandes (desplazamiento + oclusión en el color de vértice: crestas
// claras, surcos oscuros), ruido de volumen asimétrico, mechones sueltos en lágrima (flequillo de 3–5, puntas que salen), trenzas de eslabones
// alternados, rodete de vueltas. Material: textura de hebras finas a lo largo del peinado (mapa de color) + bump con los surcos (1024 px).
// Estilos: "despeinado" · "trenzas" · "coletas" · "atras" · "melena" · "rodete" · "coleta" · "jopo" · "corto" · "rulos" · "calvo". Colores PELO_COL.
const PELO_COL = { rubio: "#e6b340", choco: "#5b3a24", castano: "#8a5a34", rojo: "#b2502a", gris: "#cfcfd3", negro: "#2a2422", blanco: "#ecebe6" };
const _sst = (a, b, v) => { const q = cl((v - a) / (b - a)); return q * q * (3 - 2 * q) };
// hebras: líneas finas onduladas a lo largo de v (mapa de color) y, en el bump, surcos más anchos cada tanto
const [T_HEBRAS_C, T_HEBRAS_B] = (() => { const W = 1024, H = 1024, r = rng(90210), c = mk(W, H), b = mk(W, H), g = c.getContext("2d"), z = b.getContext("2d");
  g.fillStyle = "#e8e8e8"; g.fillRect(0, 0, W, H); z.fillStyle = "#808080"; z.fillRect(0, 0, W, H);
  for (let i = 0; i < 700; i++) { const x = r() * W, a = 4 + r() * 10, ph = r() * 6, dark = r() < .55, lw = .7 + r() * 2.2;
    g.strokeStyle = dark ? `rgba(0,0,0,${.08 + r() * .16})` : `rgba(255,255,255,${.2 + r() * .35})`; z.strokeStyle = dark ? `rgba(0,0,0,${.15 + r() * .2})` : `rgba(255,255,255,${.15 + r() * .2})`;
    g.lineWidth = z.lineWidth = lw; g.beginPath(); z.beginPath(); for (let y = 0; y <= H; y += 32) { const xx = x + a * Math.sin(y / H * 6.283 * 1.5 + ph); y ? (g.lineTo(xx, y), z.lineTo(xx, y)) : (g.moveTo(xx, y), z.moveTo(xx, y)) } g.stroke(); z.stroke() }
  for (let x = 0; x < W;) { const w = 10 + r() * 16, ph = r() * 6; for (const [ctx, col] of [[g, "rgba(0,0,0,.14)"], [z, "rgba(0,0,0,.55)"]]) { ctx.strokeStyle = col; ctx.lineWidth = w * (ctx === z ? .5 : .35); ctx.beginPath(); for (let y = 0; y <= H; y += 32) { const xx = x + 6 * Math.sin(y / H * 9 + ph); y ? ctx.lineTo(xx, y) : ctx.moveTo(xx, y) } ctx.stroke() } x += 40 + r() * 60 }
  return [c, b].map(cv => { const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t }) })();
T_HEBRAS_C.colorSpace = THREE.SRGBColorSpace;
const M_PELO2 = {}; const matPelo = (col, rep = 3, brillo = 0) => M_PELO2[col + rep + (brillo ? "b" : "")] ||= (() => { const m = new THREE.MeshStandardMaterial({ color: col, roughness: brillo ? .2 : .42, metalness: brillo ? .15 : 0, vertexColors: true, map: T_HEBRAS_C.clone(), bumpMap: T_HEBRAS_B.clone(), bumpScale: 2.2, side: THREE.DoubleSide });
  [m.map, m.bumpMap].forEach(t => { t.repeat.set(rep, 1); t.needsUpdate = true }); return m })();
// color de vértice: degradé suave por alto × oclusión (ao 0 = cresta, 1 = surco)
const _colorPelo = (G, ao = null, y0 = .1, y1 = 1) => { const P = G.attributes.position, c = new Float32Array(P.count * 3); for (let i = 0; i < P.count; i++) { const s = (.82 + .18 * _sst(y0, y1, P.getY(i))) * (1 - .55 * (ao ? ao[i] : 0)); c[i * 3] = c[i * 3 + 1] = c[i * 3 + 2] = s } G.setAttribute("color", new THREE.BufferAttribute(c, 3)); return G };
// mechón suelto: lágrima aplastada contra el cráneo (la textura de hebras corre a lo largo)
const GEO_MECHON = (() => { const pr = [[.001, 0], [.62, .06], [.86, .26], [.8, .52], [.5, .8], [.18, .95], [.001, 1]].map(([x, y]) => new THREE.Vector2(x, y)); return new THREE.LatheGeometry(pr, 12) })();
const _CEN_P = new THREE.Vector3(0, .5, -.05);
function mechonG(b, d, L, r, ap = .42) { const B = new THREE.Vector3(...b), Y = new THREE.Vector3(...d).normalize(), Z = B.clone().sub(_CEN_P).normalize(); Z.addScaledVector(Y, -Z.dot(Y)).normalize(); const X = new THREE.Vector3().crossVectors(Y, Z);
  const g = GEO_MECHON.clone(); g.applyMatrix4(new THREE.Matrix4().makeBasis(X.multiplyScalar(r), Y.multiplyScalar(L), Z.multiplyScalar(r * ap)).setPosition(B)); return _colorPelo(g, null, -.3, 1) }
// cfg: frente/lado/nuca = borde del pelo (coords de la cabeza: .05 mentón … .71 coronilla) · fleqBaja: [x, ancho, cuánto] · largo: estira costados y nuca
// surcos: { n, prof, modo: "a" (alrededor) | "x" (peinado atrás), seed } · raya: x de la raya (surco hondo de adelante a atrás) · vol, asim (ruido de volumen)
// bultos: [[azimut, alto, ancho, cuánto]] · mechones: [[base, dir, largo, grosor]] · trenzas: { r, n } · rodete: [x, y, z, r] · cola: [base, dir, r, largo]
function cascoPeloV(cfg) { const G = new THREE.SphereGeometry(1, 80, 56), P = G.attributes.position, C = new THREE.Vector3(0, .41, -.02), E = [.43, .42 + (cfg.alto || 0), .42], v = new THREE.Vector3(), ao = new Float32Array(P.count);
  const S = cfg.surcos || { n: 0 }, r = rng(S.seed || 7), L = cfg.largo || 1, fl = cfg.fleqBaja;
  const surcos = Array.from({ length: S.n || 0 }, (_, i) => [(i + .5 + (r() - .5) * .6) / S.n, .25 + r() * .5, .6 + r() * .8]);   // [posición 0..1, ancho relativo, hondura relativa]
  const ph = [r() * 6, r() * 6, r() * 6, r() * 6];
  for (let i = 0; i < P.count; i++) { v.set(P.getX(i), P.getY(i), P.getZ(i)); const a = Math.atan2(v.x, v.z), t = Math.abs(a) / Math.PI;
    const q = [v.x, v.y, v.z].map((u, j) => Math.sign(u) * Math.pow(Math.abs(u), .36) * E[j]); let x = q[0], y = q[1], z = q[2];
    if (L > 1 && y < 0 && t > .22) y *= lerp(1, L, _sst(.22, .45, t));
    const Y = C.y + y;
    let yB = t < .5 ? lerp(cfg.frente, cfg.lado, _sst(.12, .5, t)) : lerp(cfg.lado, cfg.nuca, _sst(.5, .88, t));
    if (fl && t < .3) yB -= fl[2] * Math.exp(-(((x - fl[0]) / fl[1]) ** 2)) * (1 - _sst(.15, .3, t));
    yB += .025 * Math.sin(a * 7 + ph[0]) + .015 * Math.sin(a * 13 + ph[1]);   // borde despar
    const vis = _sst(yB - .03, yB + .03, Y), arriba = _sst(.45, .75, Y);
    let f = 1 + (cfg.vol || 0) * arriba + (cfg.asim ?? .03) * (Math.sin(a * 2 + ph[2]) * .7 + Math.sin(a * 5 + ph[3]) * .3) * arriba, dip = 0;
    if (surcos.length) { const u = S.modo === "x" ? (x / E[0] + 1) / 2 : (a / Math.PI + 1) / 2; for (const [p, w, h] of surcos) { const d = Math.abs(u - p), dd = Math.min(d, 1 - d) * S.n; dip += h * Math.exp(-((dd / (w * .35)) ** 2)) } dip = Math.min(1, dip) * _sst(.45, .7, Y) }
    if (cfg.raya != null) { const dr = (x - cfg.raya) / .03; const rr = Math.exp(-dr * dr) * _sst(.6, .8, Y) * (z > -.1 ? 1 : _sst(-.4, -.1, z)); dip = Math.max(dip, rr) }
    f -= (S.prof || .04) * dip; (cfg.bultos || []).forEach(([ba, by, bw, bk]) => { const da = Math.atan2(Math.sin(a - ba), Math.cos(a - ba)); f += bk * Math.exp(-((da / bw) ** 2) - (((Y - by) / (bw * .5)) ** 2)) });
    ao[i] = dip * vis; f = lerp(.76, f, vis); P.setXYZ(i, C.x + x * f, C.y + y * f, C.z + z * f) }
  G.computeVertexNormals(); return _colorPelo(G, ao) }
const ESTILOS_PELO = {
  despeinado: { frente: .68, lado: .4, nuca: .26, vol: .05, asim: .05, surcos: { n: 9, prof: .05, modo: "a", seed: 3 }, bultos: [[.5, .86, .5, .07], [-.7, .82, .4, .04], [2.6, .8, .6, .05]],
    mechones: [[[-.26, .8, .3], [.3, -.6, .5], .24, .12], [[-.08, .82, .31], [.45, -.6, .45], .27, .13], [[.12, .8, .3], [.55, -.5, .4], .22, .11], [[.27, .78, .28], [.6, -.35, .3], .2, .1],
      [[.1, .9, -.05], [.7, .3, .6], .22, .12], [[-.2, .89, .02], [-.6, .25, .7], .2, .11], [[.43, .62, -.1], [.3, -.8, -.2], .2, .09], [[-.15, .7, -.44], [-.3, -.8, -.4], .2, .1]] },
  trenzas: { frente: .62, lado: .42, nuca: .3, raya: 0, surcos: { n: 10, prof: .035, modo: "x", seed: 11 },
    mechones: [[[-.2, .82, .3], [-.25, -.7, .55], .2, .12], [[-.05, .84, .31], [-.1, -.7, .55], .19, .11], [[.07, .84, .31], [.12, -.7, .55], .19, .11], [[.21, .82, .3], [.28, -.7, .5], .2, .12]],
    trenzas: { r: .085, n: 7, base: [.42, .5, -.1] } },
  coletas: { frente: .62, lado: .42, nuca: .3, raya: 0, surcos: { n: 8, prof: .035, modo: "x", seed: 5 }, cola2: 1 },
  atras: { frente: .75, lado: .42, nuca: .28, vol: .04, asim: .02, surcos: { n: 11, prof: .055, modo: "x", seed: 21 }, bultos: [[0, .84, .5, .04], [.9, .7, .4, .03]],
    mechones: [[[.4, .5, .16], [0, -1, .05], .14, .06], [[-.4, .5, .16], [0, -1, .05], .14, .06], [[.1, .9, -.38], [.1, -.4, -1], .18, .1]] },
  melena: { frente: .64, lado: -.18, nuca: -.2, largo: 1.75, fleqBaja: [-.16, .2, .08], raya: .12, surcos: { n: 8, prof: .045, modo: "a", seed: 13 }, bultos: [[1.3, .2, .6, .05], [-1.3, .15, .6, .07]],
    mechones: [[[-.26, .78, .29], [-.5, -.6, .4], .26, .12], [[-.08, .8, .31], [-.3, -.7, .5], .24, .11], [[.43, .1, .05], [.15, -1, .1], .22, .1], [[-.44, .05, -.05], [-.2, -1, 0], .24, .1]] },
  rodete: { frente: .66, lado: .42, nuca: .32, raya: -.08, surcos: { n: 10, prof: .04, modo: "x", seed: 17 }, rodete: [0, .9, -.24, .17],
    mechones: [[[.2, .8, .29], [.5, -.6, .4], .2, .1], [[.33, .74, .25], [.4, -.8, .2], .2, .08], [[-.42, .58, .05], [-.1, -1, .1], .16, .07]] },
  coleta: { frente: .66, lado: .42, nuca: .32, raya: .1, surcos: { n: 9, prof: .04, modo: "x", seed: 19 }, cola: [[0, .76, -.42], [0, -.85, -.5], .12, .42],
    mechones: [[[-.18, .8, .3], [-.4, -.6, .45], .22, .11], [[0, .82, .31], [-.2, -.7, .5], .2, .1]] },
  jopo: { frente: .72, lado: .44, nuca: .3, surcos: { n: 8, prof: .045, modo: "x", seed: 23 }, bultos: [[0, .82, .55, .14]],
    mechones: [[[-.12, .86, .26], [.1, .4, .9], .22, .13], [[.1, .87, .24], [.2, .45, .85], .2, .12], [[.3, .62, .1], [0, -1, .1], .14, .07], [[-.3, .62, .1], [0, -1, .1], .14, .07]] },
  corto: { frente: .7, lado: .44, nuca: .32, asim: .03, surcos: { n: 10, prof: .035, modo: "a", seed: 29 }, bultos: [[.4, .84, .5, .04]],
    mechones: [[[-.22, .82, .29], [.7, -.4, .4], .2, .1], [[-.05, .84, .3], [.75, -.35, .35], .2, .1], [[.13, .82, .29], [.8, -.3, .3], .18, .09]] },
  rulos: { frente: .68, lado: .4, nuca: .3, vol: .06, surcos: { n: 14, prof: .07, modo: "a", seed: 31 }, rulos: 1 },
  // ---- estilos de «Nobody Answers The Knock»
  // revuelto (Tib, recién levantado): casco con bultos desparejos y mechones que salen PARA ARRIBA y a los costados (remolino atrás)
  revuelto: { frente: .66, lado: .4, nuca: .28, vol: .07, asim: .07, surcos: { n: 11, prof: .06, modo: "a", seed: 41 }, bultos: [[.3, .88, .45, .08], [-1.1, .84, .5, .06], [2.8, .82, .5, .07]],
    mechones: [[[-.2, .84, .26], [-.3, .25, .9], .2, .11], [[.02, .87, .26], [.15, .3, .9], .22, .12], [[.22, .83, .24], [.6, .1, .7], .2, .1], [[-.05, .91, -.12], [-.15, .5, -.8], .2, .11],
      [[.18, .88, -.22], [.5, .35, -.7], .18, .1], [[-.32, .8, -.1], [-.9, .25, -.2], .18, .09], [[.4, .68, -.05], [.9, .05, -.1], .17, .08], [[-.08, .78, -.4], [-.2, .1, -1], .18, .09], [[.3, .78, .24], [.5, -.4, .6], .16, .08]] },
  // engominado (Crane): peinado para atrás, pegado y brillante, surcos de peine parejos, raya al costado y un rulito de frente que se le escapa
  engominado: { frente: .76, lado: .46, nuca: .3, vol: .01, asim: .01, raya: -.15, brillo: 1, surcos: { n: 18, prof: .045, modo: "x", seed: 43 }, bultos: [[0, .86, .5, .03]],
    mechones: [[[.06, .78, .3], [.4, -.7, .2], .14, .06]] },
  // trenzaLarga (la madre): raya al medio, pelo tirante a los costados y UNA trenza larga de eslabones que cae por la espalda
  trenzaLarga: { frente: .64, lado: .4, nuca: .26, raya: 0, surcos: { n: 12, prof: .04, modo: "x", seed: 47 },
    mechones: [[[-.2, .8, .3], [-.5, -.55, .3], .2, .1], [[.2, .8, .3], [.5, -.55, .3], .2, .1]],
    trenzas: { r: .095, n: 13, base: [0, .42, -.36], lados: [1], dir: [.05, -1, -.18] } } };
// peloC(estilo, col, { lazo }): devuelve un Group (casco + mechones + trenzas/rodete/cola) para k.peloG. lazo = color del moño (trenzas/coletas)
function peloC(estilo, col, op = {}) { if (estilo === "calvo") return null; const cfg = ESTILOS_PELO[estilo] || ESTILOS_PELO.corto, G = new THREE.Group(), m = matPelo(col, 3, cfg.brillo), mS = matPelo(col, 1, cfg.brillo);
  const add = (geo, mat = m) => { const me = new THREE.Mesh(geo, mat); me.castShadow = me.receiveShadow = true; me.userData.pelo = 1; G.add(me); return me };
  add(cascoPeloV(cfg)); const extra = [];
  (cfg.mechones || []).forEach(([b, d, L, r]) => extra.push(mechonG(b, d, L, r)));
  if (cfg.rulos) { const rr = rng(5); for (let i = 0; i < 26; i++) { const u = i / 26, a = i * 2.4, R = .12 + Math.sqrt(u) * .3; extra.push(mechonG([Math.cos(a) * R, .92 - u * .3, Math.sin(a) * R - .04], [Math.cos(a) * .3, .4 + rr() * .4, Math.sin(a) * .3], .12 + rr() * .05, .09)) } }
  if (cfg.rodete) { const [x, y, z, R] = cfg.rodete; for (let i = 0; i < 3; i++) { const tg = new THREE.TorusGeometry(R * (1 - i * .3), R * .42 * (1 - i * .15), 12, 28); tg.rotateX(-Math.PI / 2 + .5); tg.translate(x, y + i * R * .45, z + i * .02); extra.push(_colorPelo(tg, null, .6, 1.2)) } const s = new THREE.SphereGeometry(R * .4, 14, 10); s.translate(x, y + R * 1.2, z + .04); extra.push(_colorPelo(s)) }
  if (cfg.cola) { const [b, d, r, Lc] = cfg.cola; for (let i = 0; i < 3; i++) extra.push(mechonG([b[0] + (i - 1) * .05, b[1], b[2]], [d[0] + (i - 1) * .2, d[1], d[2]], Lc * (1 - i * .1 + (i === 1 ? .1 : 0)), r * .9, .8)) }
  if (cfg.cola2) for (const s of [-1, 1]) for (let i = 0; i < 3; i++) extra.push(mechonG([s * .44, .56, -.1], [s * (.8 - i * .15), -.7 - i * .1, -.15 + i * .1], .36 + i * .03, .12, .8));
  if (cfg.trenzas) { const { r: R, n, base, lados = [-1, 1], dir: dd = [.22, -1, .18] } = cfg.trenzas; for (const s of lados) { let p = new THREE.Vector3(s * base[0], base[1], base[2]); const dir = new THREE.Vector3(s * dd[0], dd[1], dd[2]).normalize(), seg = R * 1.45;
      for (let i = 0; i < n; i++) { const g = new THREE.SphereGeometry(1, 14, 10), lado = i % 2 ? 1 : -1, rr = R * (1 - i * .035); g.scale(rr * 1.05, seg * .78, rr * .8); g.rotateZ(lado * .55); g.translate(lado * rr * .3, 0, 0);
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().negate()); g.applyQuaternion(q); g.translate(p.x, p.y, p.z); extra.push(_colorPelo(g, null, -.6, .8)); p = p.clone().addScaledVector(dir, seg * .62) }
      if (op.lazo) { const k = new THREE.Group(); k.position.copy(p).addScaledVector(dir, -.02); G.add(k); monoCinta(k, op.lazo, 0, 0, .02, .75) }
      const pun = mechonG([p.x, p.y + .03, p.z], [dir.x * .4, -1, dir.z], .12, .07, .9); extra.push(pun) } }
  if (extra.length) add(mergeG(extra.map(g => [g, new THREE.Matrix4()])).setAttribute("color", new THREE.BufferAttribute(new Float32Array(extra.reduce((a, g) => (a.push(...(g.index ? g.toNonIndexed() : g).attributes.color.array), a), [])), 3)), mS);
  G.userData.pelo = 1; return G }
// barbaC(k, col): perilla lisa de UNA pieza debajo de la boca, con un patrón tejido IMPRESO (filas de V) como las barbas de Volze
const T_TEJIDO = tex(128, 128, (g, w, h) => { g.fillStyle = "#ffffff"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(0,0,0,.22)"; g.lineWidth = 3; for (let y = 4; y < h; y += 12) for (let x = 0; x < w; x += 12) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 6, y + 7); g.lineTo(x + 12, y); g.stroke() } }, [2, 2]);
function barbaC(k, col) { const m = new THREE.MeshStandardMaterial({ color: col, map: T_TEJIDO, roughness: .6 });
  const g = new THREE.CapsuleGeometry(.1, .2, 6, 16); g.rotateZ(Math.PI / 2); g.scale(1, 1.05, .55); const b = part(g, m, 0, .13, .355, k.head, 0); b.userData.pelo = 1;
  for (const s of [-1, 1]) { const p = part(new THREE.CapsuleGeometry(.04, .1, 4, 10), m, s * .17, .19, .35, k.head, 0); p.rotation.z = s * .5; p.scale.z = .55; p.userData.pelo = 1 } }
// sombreros y moños: piezas lisas de plástico
const M_PELO = {}; const peloMat = col => M_PELO[col] ||= new THREE.MeshStandardMaterial({ color: col, roughness: .45 });
const pzP = (h, geo, col, x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const m = part(geo, peloMat(col), x, y, z, h, 0); m.rotation.set(rx, ry, rz); m.scale.set(sx, sy, sz); m.userData.pelo = 1; return m };
const esfP = r => new THREE.SphereGeometry(r, 18, 12);
function gorraLisa(h, col) { pzP(h, new THREE.SphereGeometry(.45, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), col, 0, .6, -.01, 0, 0, 0, 1, .7, 1); pzP(h, RB(.6, .04, .34, .02, 2), col, 0, .63, .44, .12) }
const gorraTela = gorraLisa, gorraChata = gorraLisa;
function panueloC(h, col) { pzP(h, new THREE.SphereGeometry(.42, 24, 14, 0, Math.PI * 2, 0, Math.PI * .58), col, 0, .5, -.03, 0, 0, 0, 1, .95, .96); pzP(h, esfP(.1), col, 0, .34, -.42) }
function monoCinta(h, col, x = .22, y = .88, z = -.06, tam = 1) { for (const q of [-1, 1]) pzP(h, new THREE.ConeGeometry(.11 * tam, .22 * tam, 14), col, x + q * .12 * tam, y, z, 0, 0, q * Math.PI / 2); pzP(h, esfP(.06 * tam), col, x, y, z) }
function velo(k, col = "#f4f4f4") { const geo = new THREE.BoxGeometry(.68, .9, .02); geo.translate(0, -.45, -.05); const v = part(geo, new THREE.MeshStandardMaterial({ color: col, roughness: .5, transparent: true, opacity: .9 }), 0, .86, -.34, k.head, 0); v.rotation.x = .22; v.castShadow = false; v.userData.pelo = 1 }
// ================= VESTIR: reconstruye al personaje con seis bloques + ropa pintada; pelo y sombreros FUNDIDOS en pocas mallas (una por color) =================
// o: { skin (pasa por pielPastel salvo sinPastel), torso: {…torsoC}, brazo: {…brazoC}, pierna: {…piernaC}, pelo: [estilo, col] (peloC), gorra: col, panuelo: col,
//      peloExtra: h => {} (más pelo/moños, se funde con el resto), anteojos, barba: col, bigote: col, extra: k => {}, escala, encorvado,
//      forma: { torso: [w, h, d], brazo: [w, largo, d], pierna: [w, largo, d], cabeza: [w, h, d], sepPierna, cuello, cabezaZ, dedos: colorGuante }, cabezaMat }
const MANO_INVIS = new THREE.MeshBasicMaterial({ visible: false });
const FORMA0 = { torso: [1.04, 1.04, .52], brazo: [.5, 1.04, .5], pierna: [.5, 1.02, .5], cabeza: [.74, .66, .7], sepPierna: .26, cuello: 0, cabezaZ: 0, dedos: null };
function vestirC(k, o) { const skin = (typeof pielPastel === "function" && !o.sinPastel) ? pielPastel(o.skin) : o.skin, F = { ...FORMA0, ...(o.forma || {}) }; k.skin = skin; k.r6 = true; delete k.falda; delete k.pasoMax; delete k.zancMax; k.encorvado = o.encorvado || 0; k.flamea = [];
  [k.body, k.armL, k.armR, k.legL, k.legR].forEach(gr => [...gr.children].forEach(c => { if (c.isMesh || c.userData.pelo || c.userData.bota || c.userData.dedo) gr.remove(c) })); [...k.head.children].forEach(c => { if (c !== k.decal) k.head.remove(c) });
  const [tw, th, td] = F.torso, [bw, bl, bd] = F.brazo, [pw, pl, pd] = F.pierna, [cw, ch, cd] = F.cabeza, yS = pl + th - .08, yH = pl + th + F.cuello;
  k.hcad = pl; k._p0 = { armY: yS, armX: tw / 2 + bw / 2, armL: bl }; k._forma = F; delete k.abrigos;
  const plast = map => new THREE.MeshStandardMaterial({ map, roughness: .5 }), t = o.torso;
  part(RB(tw, th, td, .05), boxMats(plast(torsoLadoC(t)), plast(torsoC(t)), plast(torsoC(t, true))), 0, pl + th / 2, 0, k.body, 0);
  [k.armL, k.armR].forEach((a, i) => { part(RB(bw, bl, bd, .05), plast(brazoC({ skin, ...o.brazo, seed: (o.brazo.seed || 3) + i })), 0, .08 - bl / 2, 0, a, 0); part(RB(bw * 1.03, bl * .2, bd * 1.03, .05), new THREE.MeshStandardMaterial({ color: skin, roughness: .5 }), 0, .08 - bl * .9, 0, a, 0);   // la mano, color piel (también la punta) a.position.set((i ? 1 : -1) * k._p0.armX, yS, 0);
    const hd = i ? k.handR : k.handL; a.add(hd); hd.position.set(0, .18 - bl, 0); hd.rotation.set(0, 0, 0); hd.material = MANO_INVIS; hd.castShadow = hd.receiveShadow = false });   // la mano: ancla invisible para la utilería
  [k.legL, k.legR].forEach((l, i) => { const po = { skin, ...o.pierna, seed: (o.pierna.seed || 5) + i }, lado = plast(piernaC(po)); part(RB(pw, pl, pd, .05), boxMats(lado, plast(piernaC({ ...po, frente: 1 })), lado), 0, .01 - pl / 2, 0, l, 0); l.position.set((i ? 1 : -1) * F.sepPierna, pl, 0) });
  const mCab = o.cabezaMat || new THREE.MeshStandardMaterial({ color: skin, roughness: .6, emissive: skin, emissiveIntensity: .28 });
  k.head.position.set(0, yH, F.cabezaZ); part(RB(cw, ch, cd, .075, 4), mCab, 0, .05 + ch / 2, 0, k.head, 0);
  if (F.cuello) part(new THREE.CylinderGeometry(.1, .13, F.cuello + .12, 8), mCab, 0, yH - F.cuello / 2 + .02, F.cabezaZ * .6, k.body, 0);
  k.decal.geometry = new THREE.PlaneGeometry(cw, ch * .84); k.decal.position.set(0, .07 + ch / 2, cd / 2 + .0015); k.decal.material.transparent = true; k.decal.material.needsUpdate = true;
  // dedos largos (Sallow): cuatro bloques finos y un pulgar en la punta de cada brazo, con pivote (se curvan: dedosSallow)
  k.dedos = []; if (F.dedos) { const md = accMat(F.dedos, { roughness: .55 }); [k.armL, k.armR].forEach(a => { [[-.105, 0, .3], [-.035, 0, .35], [.035, 0, .35], [.105, 0, .31], [0, .12, .2]].forEach(([x, z, L]) => {
      const pv = new THREE.Group(); pv.position.set(x * bw / .32, .1 - bl, z * bd / .34); pv.userData.dedo = 1; a.add(pv); const geo = new THREE.BoxGeometry(.055, L, .06); geo.translate(0, -L / 2, 0); part(geo, md, 0, 0, 0, pv, 0); k.dedos.push(pv) }) }) }
  const tmp = new THREE.Group(); if (o.gorra) gorraLisa(tmp, o.gorra); if (o.panuelo) panueloC(tmp, o.panuelo); if (o.peloExtra) o.peloExtra(tmp);
  tmp.updateMatrixWorld(true); const porCol = new Map(); tmp.traverse(m => { if (!m.isMesh) return; const key = m.material.color.getHexString() + (m.material.roughness) + (m.material.side || 0); if (!porCol.has(key)) porCol.set(key, [m.material, []]); porCol.get(key)[1].push([m.geometry, m.matrixWorld.clone()]) });
  k.peloG = new THREE.Group(); k.head.add(k.peloG); porCol.forEach(([mat, list]) => { const me = part(mergeG(list), mat, 0, 0, 0, k.peloG, 0); me.userData.pelo = 1 });
  if (o.pelo) { const hm = peloC(...o.pelo); if (hm) { k.peloG.add(hm); hm.scale.set(cw / .74, ch / .66, cd / .7) } }   // el pelo se ajusta a la cabeza (Crane la tiene angosta y alta)
  if (o.anteojos) anteojosV(k); if (o.barba) barbaC(k, o.barba); if (o.bigote) { const m = accMat(o.bigote); for (const s of [-1, 1]) { bloque(k.head, m, .19, .06, .05, s * .1, .345, .37, 0, 0, s * -.15) } } if (o.extra) o.extra(k);
  k.body.scale.setScalar(o.escala || 1); k.arrugas = 0; k._arena = null; setFace(k, "neutral"); return k }

// ================= ACCESORIOS PERSISTENTES (parte del personaje, no utilería) =================
const EL_ACERO = new THREE.MeshStandardMaterial({ color: "#e4e8ee", roughness: .32, metalness: .55, emissive: "#3a3e44", emissiveIntensity: .35 }), EL_ACERO_O = new THREE.MeshStandardMaterial({ color: "#9aa0a8", roughness: .35, metalness: .5 });
const EL_MANGO = new THREE.MeshStandardMaterial({ color: "#1c1c1e", roughness: .35 }), EL_LATON = new THREE.MeshStandardMaterial({ color: "#caa24c", roughness: .28, metalness: .85 });
const EL_HIERRO = new THREE.MeshStandardMaterial({ color: "#5a5c62", roughness: .45, metalness: .7 });
// ---------- las TIJERAS grandes de sastre: dos mitades (hoja de acero afinada + mango negro con ojo), tornillo de bronce. Origen = el tornillo,
// las hojas hacia +z (≈ .62), los ojos hacia −z. abrir(a) abre las hojas a radianes (0 cerradas).
function nuevaTijera() { const G = new THREE.Group(), mit = [];
  for (const s of [-1, 1]) { const M = new THREE.Group(); G.add(M); mit.push(M);
    const hg = new THREE.BoxGeometry(.085, .022, .64, 1, 1, 8); hg.translate(0, 0, .32); const p = hg.attributes.position;
    for (let i = 0; i < p.count; i++) { const z = p.getZ(i), f = 1 - .88 * Math.pow(z / .64, 1.3); p.setX(i, s * .036 + p.getX(i) * f); p.setY(i, p.getY(i) + s * .012) }
    hg.computeVertexNormals(); part(hg, EL_ACERO, 0, 0, 0, M, 0);
    part(new THREE.BoxGeometry(.03, .024, .62), EL_ACERO_O, s * .012, s * .012, .31, M, 0);   // filo (el lomo más oscuro)
    const sk = part(new THREE.BoxGeometry(.05, .03, .16), EL_MANGO, -s * .045, s * .012, -.09, M, 0); sk.rotation.y = s * .25;
    const ojo = part(new THREE.TorusGeometry(s < 0 ? .075 : .06, .022, 8, 20), EL_MANGO, -s * .085, s * .012, -.22, M, 0); ojo.rotation.x = Math.PI / 2; ojo.scale.set(1, s < 0 ? 1.3 : 1, 1) }
  const tor = part(new THREE.CylinderGeometry(.022, .022, .07, 10), EL_LATON, 0, 0, 0, G, 0);
  G.userData.abrir = a => { mit[0].rotation.y = -a / 2; mit[1].rotation.y = a / 2 }; return G }
// tijeraCuelga(k, on): las tijeras cuelgan del cinto (adelante, a la izquierda), con un cordón. La pose de corte las esconde en ese cuadro.
function armarTijeraCuelga(k) { const F = k._forma, pl = F.pierna[1], td = F.torso[2], G = new THREE.Group(); G.name = "tijeraCuelga"; k.body.add(G);
  const T = nuevaTijera(); T.rotation.x = Math.PI / 2; T.position.set(0, -.26, 0); G.add(T); T.userData.abrir(.06);
  part(new THREE.CylinderGeometry(.012, .012, .16, 6), accMat("#8a2a2a"), 0, -.06, 0, G, 0);   // el cordón
  G.position.set(-.3, pl + .06, td / 2 + .035); G.rotation.z = .12; k.tijeraC = G; k.conTijera = true; return G }
function tijeraCuelga(k, on = true) { k.conTijera = on; if (k.tijeraC) k.tijeraC.visible = on }
// ---------- la CINTA MÉTRICA amarilla colgada del cuello (dos tiras que bajan por adelante, una más larga), con rayitas y números
const EL_T_CINTA = tex(64, 512, (g, w, h) => { g.fillStyle = "#f2c830"; g.fillRect(0, 0, w, h); g.fillStyle = "#1a1a1a"; for (let y = 0; y < h; y += 8) g.fillRect(0, y, y % 40 ? 14 : 26, 2);
  g.font = "bold 14px sans-serif"; g.textAlign = "right"; for (let y = 40, n = 1; y < h; y += 40, n++) g.fillText(String(n), w - 4, y + 5); g.fillStyle = "rgba(0,0,0,.12)"; g.fillRect(0, 0, w, 3); g.fillRect(0, h - 3, w, 3) });
function cintaMetrica(k) { const F = k._forma, [tw, th, td] = F.torso, top = F.pierna[1] + th, m = new THREE.MeshStandardMaterial({ map: EL_T_CINTA, roughness: .45 });
  const tira = (x, y0, L, z, rz = 0, rx = 0) => { const geo = new THREE.BoxGeometry(.1, L, .012); geo.translate(0, -L / 2, 0); const me = part(geo, m, x, y0, z, k.body, 0); me.rotation.set(rx, 0, rz); return me };
  tira(-.19, top + .006, .82, td / 2 + .012, .04); tira(.17, top + .006, .56, td / 2 + .012, -.06);                 // las dos puntas adelante
  for (const x of [-.19, .17]) tira(x, top + .008, td + .03, td / 2 + .012, 0, Math.PI / 2);   // por arriba de los hombros
  { const geo = new THREE.BoxGeometry(.38, .1, .012); const me = part(geo, m, -.01, top - .04, -td / 2 - .008, k.body, 0); me.rotation.z = Math.PI / 2 * 0 }   // la vuelta por la nuca
  // la chapita de metal de la punta larga
  part(new THREE.BoxGeometry(.11, .04, .02), EL_LATON, -.19 + .033, top - .82, td / 2 + .014, k.body, 0) }
// ---------- los HILOS de Marga: tres hebras gruesas de colores colgadas del cuello (le pasan por la nuca y caen adelante)
function hilosCuello(k) { const F = k._forma, [tw, th, td] = F.torso, top = F.pierna[1] + th;
  [["#d8403a", 0, .5], ["#3a7ad8", .04, .62], ["#f0c838", -.035, .42]].forEach(([col, dx, L]) => { const P = [[-.2 + dx, top - L, td / 2 + .03], [-.23 + dx, top - .12, td / 2 + .03], [-.25 + dx, top + .022, .14], [-.12 + dx, top + .026, -td / 2 + .02],
      [.12 + dx, top + .026, -td / 2 + .02], [.25 + dx, top + .022, .14], [.22 + dx, top - .14, td / 2 + .03], [.18 + dx, top - L * .8, td / 2 + .03]].map(q => new THREE.Vector3(...q));
    const me = part(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P), 40, .017, 6), new THREE.MeshStandardMaterial({ color: col, roughness: .7 }), 0, 0, 0, k.body, 0); me.castShadow = false;
    // la aguja enhebrada en la punta del hilo rojo
    if (col === "#d8403a") part(new THREE.CylinderGeometry(.006, .006, .14, 5), EL_ACERO, P[0].x, P[0].y - .06, P[0].z, k.body, 0) }) }
// ---------- el LLAVERO de Crane: argolla de bronce en el cinto con seis llaves viejas (una grande de bronce)
function llaveG(L, m) { const G = new THREE.Group(); const ojo = part(new THREE.TorusGeometry(.03, .009, 6, 14), m, 0, -.03, 0, G, 0);
  part(new THREE.CylinderGeometry(.008, .008, L, 6), m, 0, -.06 - L / 2, 0, G, 0); part(new THREE.BoxGeometry(.012, .045, .03), m, 0, -.06 - L + .03, .02, G, 0); part(new THREE.BoxGeometry(.012, .02, .02), m, 0, -.06 - L + .07, .015, G, 0); return G }
function llavero(k) { const F = k._forma, pl = F.pierna[1], td = F.torso[2], G = new THREE.Group(); G.position.set(.26, pl + .1, td / 2 + .03); k.body.add(G);
  const ar = part(new THREE.TorusGeometry(.06, .009, 8, 22), EL_LATON, 0, 0, 0, G, 0);
  [[.16, EL_HIERRO, -.5], [.22, EL_LATON, -.2], [.13, EL_HIERRO, .05], [.18, EL_HIERRO, .3], [.11, EL_LATON, .55], [.15, EL_HIERRO, .8]].forEach(([L, m, a]) => { const l = llaveG(L, m); l.position.set(Math.sin(a) * .06, -Math.cos(a) * .06 + .02, 0); l.rotation.z = a * .5; l.rotation.y = a; G.add(l) });
  k.llaveroG = G; return G }

// ================= EL ELENCO =================
const EL_NUEVOS = Array.from({ length: 6 }, () => { const k = kid({ skin: "#f2dec8", shirt: "#7a6a5a", cloth: "plain", pants: "#3a3a3a", shoes: "#2a2420", hair: "#2b211b", style: "corto" }); TURT.add(k.g); ALL.push(k); return k });
const TIB = ME6, MAMA = QUILL, PAPA = PIM, CRANE = GARROW, MARGA = PESCADOR;
const VECINOS = [...FOLK, ...EXT], NOVIO = EL_NUEVOS[0], NOVIA = EL_NUEVOS[1], CORO = EL_NUEVOS.slice(2, 6);
const ORO = "#d9a84a";
const COL_EL = { rojo: "#d8483a", azul: "#3d8fd6", celeste: "#5aa7e0", amarillo: "#e0c040", verde: "#6aa04a", rosa: "#e88ab0", naranja: "#e8843a", violeta: "#8a5ab8",
  marino: "#1e2f5a", crema: "#efe4cf", blanco: "#f4f4f2", jean: "#2c2f36", jeanClaro: "#8fb4da", caqui: "#b8a07a", negro: "#26262a", gris: "#6a6a74", lavanda: "#ab92d6", bordo: "#8e1f3a" };
const PIEL = { clara: "#eab890", durazno: "#dfa478", trigueña: "#c98d62", morena: "#a06a46", oscura: "#7e5034" };
const JEAN = (col = COL_EL.jean, o = {}) => ({ col, denim: 1, zapato: "#2a2420", ...o });
// ---------- ME, el sastre (≈ 15): camisa blanca arremangada, chaleco azul marino con alfileres, alfiletero rojo en la muñeca, pantalón gris,
// cinta métrica amarilla al cuello, tijeras grandes colgando del cinto, pelo castaño despeinado
vestirC(ME, { skin: PIEL.durazno, torso: { col: "#f4f2ec", cuello: "#ffffff", chaleco: ["#24346a", "#d8c890"], alfileres: 9, seed: 31 },
  brazo: { col: "#f4f2ec", manga: .6, puno: "#e2ded4", punoH: 26, alfiletero: "#d83a3a" }, pierna: { col: "#5c616e", zapato: "#3a2a20", gastado: 1 }, pelo: ["despeinado", PELO_COL.castano], escala: .9,
  extra: k => { cintaMetrica(k); armarTijeraCuelga(k) } });
// ---------- TIB (≈ 6): pijama celeste con estrellitas y lunas, cuello y botones blancos, pantuflas violeta, pelo rubio revuelto, el muñeco de trapo
const EL_PIJ = { col: "#8cc2ec", kind: "estrellitas", alt: "#ffffff", alt2: "#f6e27a" };
vestirC(TIB, { skin: PIEL.clara, torso: { ...EL_PIJ, cuelloR: "#ffffff", botones: "#ffffff" }, brazo: { ...EL_PIJ, manga: .92, puno: "#ffffff" }, pierna: { ...EL_PIJ, largo: .9, zapato: "#8a5ab0", cana: .1 },
  pelo: ["revuelto", PELO_COL.rubio], escala: .74 });
// ---------- MAMÁ (muda): vestido lavanda floreado con cuello blanco, trenza negra larga; la cara de reposo es la triste
vestirC(MAMA, { skin: PIEL.trigueña, torso: { col: COL_EL.lavanda, kind: "floreado", alt: "#f4ecfa", alt2: "#f2c84a", cuello: "#ffffff" }, brazo: { col: COL_EL.lavanda, manga: .88, puno: "#ffffff" },
  pierna: { col: COL_EL.lavanda, falda: .9, kind: "floreado", alt: "#f4ecfa", alt2: "#f2c84a", zapato: "#3a2a2a" }, pelo: ["trenzaLarga", PELO_COL.negro] });
MAMA.caraBase = "tristeMudo";
// ---------- PAPÁ (cansado): camisa a cuadros verde, overol de jean con manchas de grasa, gorra roja, bigote
vestirC(PAPA, { skin: PIEL.morena, torso: { col: "#3f8a4a", kind: "cuadros", alt: "#1c4a26", overol: "#3a5f9a", manchas: 2, seed: 17 }, brazo: { col: "#3f8a4a", kind: "cuadros", alt: "#1c4a26", manga: .86, puno: "#2a5a32" },
  pierna: JEAN("#3a5f9a", { zapato: "#3a2418", gastado: 1, manchas: 2, seed: 18 }), pelo: ["corto", PELO_COL.choco], gorra: "#c83a32", bigote: PELO_COL.choco, escala: 1.04 });
PAPA.caraBase = "cansado";
// ---------- MARGA (vieja): vestido gris, chal rosa con guarda, rodete gris, anteojos, hilos de colores al cuello (con una aguja)
vestirC(MARGA, { skin: PIEL.clara, torso: { col: "#77777f", chal: ["#e87aa8", "#f8e2ee"] }, brazo: { col: "#77777f", manga: .9, puno: "#e87aa8" }, pierna: { col: "#5a5a64", falda: .92, zapato: "#2a2420" },
  pelo: ["rodete", PELO_COL.gris], anteojos: 1, encorvado: .18, escala: .9, extra: k => hilosCuello(k) });
// ---------- FATHER CRANE: altísimo y flaco (≈ 1,3 × un adulto), sotana negra con botonera, cuello clerical, pelo gris engominado, llavero, no parpadea
const EL_PIEL_CRANE = "#d2cbb6";   // piel de cera, un poco gris: la cabeza con poco brillo propio (no se lava como la de los demás)
vestirC(CRANE, { skin: EL_PIEL_CRANE, sinPastel: 1, cabezaMat: new THREE.MeshStandardMaterial({ color: EL_PIEL_CRANE, roughness: .6, emissive: EL_PIEL_CRANE, emissiveIntensity: .04 }), forma: { torso: [.8, 1.22, .42], brazo: [.32, 1.42, .34], pierna: [.36, 1.42, .4], cabeza: [.6, .8, .62], sepPierna: .2, cuello: .12, cabezaZ: .04 },
  torso: { col: "#141418", botonera: "#2e2e36", clerical: "#f6f6f2" }, brazo: { col: "#141418", manga: .9, puno: "#1e1e24" }, pierna: { col: "#141418", falda: .97, faldaCol: "#141418", zapato: "#08080a", cana: .07 },
  pelo: ["engominado", "#b9b9be"], extra: k => llavero(k) });
CRANE.caraBase = "crane"; CRANE.sinParpadeo = true; CRANE.brazoA = .16;
// ---------- LOS NOVIOS
vestirC(NOVIO, { skin: PIEL.durazno, torso: { col: COL_EL.marino, traje: [COL_EL.blanco, COL_EL.rojo, COL_EL.blanco] }, brazo: { col: COL_EL.marino, manga: .88, puno: COL_EL.blanco }, pierna: { col: COL_EL.marino, zapato: "#141418" }, pelo: ["jopo", PELO_COL.negro] });
vestirC(NOVIA, { skin: PIEL.clara, torso: { col: COL_EL.blanco, encaje: "#ffffff", faja: ["#e8d8c8"] }, brazo: { col: COL_EL.blanco, manga: .82 }, pierna: { col: COL_EL.blanco, falda: .94, zapato: COL_EL.blanco }, pelo: ["rodete", PELO_COL.castano], extra: k => velo(k) });
// ---------- EL CORO: túnica bordó larga con esclavina blanca y cruz dorada
const EL_CORO_T = { col: COL_EL.bordo, esclavina: ["#f6f4ee", ORO], cruz: ORO }, EL_CORO_B = { col: COL_EL.bordo, manga: .94, puno: "#f6f4ee" }, EL_CORO_P = { col: COL_EL.bordo, falda: .97, zapato: "#141418" };
[[PIEL.durazno, ["corto", PELO_COL.castano], 1], [PIEL.clara, ["rodete", PELO_COL.rubio], .96], [PIEL.morena, ["calvo"], 1.04, PELO_COL.gris], [PIEL.trigueña, ["rulos", PELO_COL.negro], .94]].forEach(([skin, pelo, esc, barba], i) =>
  vestirC(CORO[i], { skin, torso: EL_CORO_T, brazo: EL_CORO_B, pierna: EL_CORO_P, pelo, escala: esc, barba }));
// ---------- LOS VECINOS (de noche: abrigados, un color dominante distinto cada uno)
const VV = VECINOS;
vestirC(VV[0], { skin: PIEL.clara, torso: { col: COL_EL.azul, cuelloR: "#2a6ab0", bufanda: [COL_EL.rojo, COL_EL.blanco] }, brazo: { col: COL_EL.azul, manga: .9, puno: "#2a6ab0" }, pierna: JEAN(), pelo: ["corto", PELO_COL.negro] });   // hombre: suéter azul, bufanda rayada
vestirC(VV[1], { skin: PIEL.trigueña, torso: { col: COL_EL.amarillo, cuelloR: COL_EL.celeste, corazon: COL_EL.rojo }, brazo: { col: COL_EL.amarillo, manga: .9, puno: COL_EL.celeste }, pierna: { col: COL_EL.marino, falda: .86, zapato: "#2a2420" }, pelo: ["coleta", PELO_COL.castano] });   // mujer: suéter amarillo
vestirC(VV[2], { skin: PIEL.durazno, torso: { col: COL_EL.marino, cuelloR: "#14203f" }, brazo: { col: COL_EL.marino, manga: .9, puno: "#14203f" }, pierna: { col: "#7a7a82", zapato: "#2a2420" }, pelo: ["atras", PELO_COL.gris], barba: PELO_COL.gris, encorvado: .2 });   // viejo
vestirC(VV[3], { skin: PIEL.clara, torso: { col: COL_EL.rosa, kind: "florecitas", alt: "#fbe6ee", alt2: COL_EL.amarillo, cuello: COL_EL.blanco }, brazo: { col: COL_EL.rosa, manga: .88 }, pierna: { col: COL_EL.rosa, falda: .88, kind: "florecitas", alt: "#fbe6ee", zapato: "#7a2030" }, pelo: ["melena", PELO_COL.rubio] });   // muchacha
vestirC(VV[4], { skin: PIEL.oscura, torso: { col: COL_EL.naranja, tirantes: "#3a2418", cuello: "#f0e0c8" }, brazo: { col: COL_EL.naranja, manga: .88 }, pierna: { col: "#4a4a52", zapato: "#2a2420" }, pelo: ["jopo", PELO_COL.negro] });   // muchacho: camisa naranja con tiradores
vestirC(VV[5], { skin: PIEL.morena, torso: { col: COL_EL.verde, tejido: ["#e8f0d8", "#f2c84a"] }, brazo: { col: COL_EL.verde, manga: .9, puno: "#e8f0d8" }, pierna: { col: "#5a5a64", falda: .9, zapato: "#2a2420" }, pelo: ["rulos", PELO_COL.negro] });   // mujer: suéter tejido verde
vestirC(VV[6], { skin: PIEL.clara, torso: { col: COL_EL.rojo, kind: "franjas", alt: COL_EL.blanco, cuelloR: COL_EL.blanco }, brazo: { col: COL_EL.rojo, manga: .36 }, pierna: JEAN(COL_EL.jean, { largo: .55, media: COL_EL.blanco }), gorra: COL_EL.azul, pelo: ["corto", PELO_COL.castano], escala: .72 });   // chico
vestirC(VV[7], { skin: PIEL.durazno, torso: { col: COL_EL.amarillo, overol: COL_EL.jeanClaro }, brazo: { col: COL_EL.amarillo, manga: .34 }, pierna: JEAN(COL_EL.jeanClaro, { zapato: "#d84a3a" }), pelo: ["coletas", PELO_COL.rojo], peloExtra: h => monoCinta(h, COL_EL.rosa, .3, .72, -.2, .8), escala: .7 });   // chica
vestirC(VV[8], { skin: PIEL.durazno, torso: { col: COL_EL.blanco, delantal: ["#ffffff", "#dcdcdc"], manchas: 0 }, brazo: { col: COL_EL.blanco, manga: .6, puno: "#e6e6e6", punoH: 24 }, pierna: { col: "#3a3a44", zapato: "#2a2420", delantalP: "#ffffff" }, pelo: ["corto", PELO_COL.negro], bigote: PELO_COL.negro, escala: 1.06 });   // panadero
vestirC(VV[9], { skin: PIEL.trigueña, torso: { col: COL_EL.violeta, botones: "#f2d060", cuelloR: "#6a4098" }, brazo: { col: COL_EL.violeta, manga: .9, puno: "#6a4098" }, pierna: { col: "#3a3044", falda: .9, zapato: "#2a2420" }, panuelo: COL_EL.naranja });   // mujer: tapado violeta, pañuelo naranja
const ELENCO_V = [ME, TIB, MAMA, PAPA, MARGA, CRANE, NOVIO, NOVIA, ...VECINOS, ...CORO];
const ELENCO_N = { ME, TIB, MAMA, PAPA, MARGA, CRANE, NOVIO, NOVIA, ...Object.fromEntries(VECINOS.map((k, i) => ["V" + i, k])), ...Object.fromEntries(CORO.map((k, i) => ["C" + i, k])) };
ALL.forEach((k, i) => { k.idx = i; setFace(k, "neutral") });
function vientoPelo() { }   // (legado: acá no sopla)

// ---------- helpers de pose (cuerpo entero con cuaterniones; brazos que apuntan a un punto del mundo)
function qMundo(k, arriba, frente, out = new THREE.Quaternion()) { _ay.set(...arriba).normalize(); _az.set(...frente); _az.addScaledVector(_ay, -_az.dot(_ay)); if (_az.lengthSq() < 1e-6) _az.set(1, 0, 0).addScaledVector(_ay, -_ay.x);
  _az.normalize(); _ax.crossVectors(_ay, _az); _mb.makeBasis(_ax, _ay, _az); out.setFromRotationMatrix(_mb); k.g.updateWorldMatrix(true, false); k.g.getWorldQuaternion(_q2); return out.premultiply(_q2.invert()) }
function cuerpoQ(k, q, pivL, pivG) { const b = k.body, s = b.scale.y; b.quaternion.copy(q); _v3.set(...pivL).multiplyScalar(s).applyQuaternion(q); b.position.set(pivG[0] - _v3.x, pivG[1] - _v3.y, pivG[2] - _v3.z) }
// apuntar(k, miembro, p): el brazo/pierna apunta con su punta al punto p del MUNDO (Vector3). Los brazos no doblan: la mano queda a un largo de brazo del hombro.
function apuntar(k, m, p) { k.g.updateMatrixWorld(true); _v1.copy(p); m.parent.worldToLocal(_v1); _v1.sub(m.position); if (_v1.lengthSq() < 1e-8) return; m.quaternion.setFromUnitVectors(_ABAJO, _v1.normalize()) }
const gW = (k, x, y, z, out = new THREE.Vector3()) => { k.g.updateMatrixWorld(true); return k.g.localToWorld(out.set(x, y, z)) };
// punto del cuerpo (coordenadas del cuerpo SIN escala, como las medidas de la forma) → mundo, con la pose actual
const bW = (k, x, y, z, out = new THREE.Vector3()) => { k.g.updateMatrixWorld(true); return k.body.localToWorld(out.set(x, y, z)) };
const _MIEM = k => [k.armL, k.armR, k.legL, k.legR, k.head];
function fotoPose(k) { return { bq: k.body.quaternion.clone(), bp: k.body.position.clone(), m: _MIEM(k).map(o => o.quaternion.clone()) } }
function mezclaPoses(k, fA, fB, u) { fA(); const A = fotoPose(k); fB(); const B = fotoPose(k); k.body.quaternion.slerpQuaternions(A.bq, B.bq, u); k.body.position.lerpVectors(A.bp, B.bp, u); _MIEM(k).forEach((o, i) => o.quaternion.slerpQuaternions(A.m[i], B.m[i], u)) }
// medidas de la cara (coordenadas de la cabeza): centro de cada ojo y de la boca, sobre la calcomanía
function _cara(k) { const [cw, ch, cd] = k._forma.cabeza, yc = .07 + ch / 2, hD = ch * .84; return { cw, ch, cd, yc, hD, ey: yc + (.5 - EY / 384) * hD, my: yc + (.5 - MY / 384) * hD, ex: EX / 512 * cw } }
function ojosW(k) { const c = _cara(k); k.g.updateMatrixWorld(true); return [-1, 1].map(s => k.head.localToWorld(new THREE.Vector3(s * c.ex, c.ey, c.cd / 2 + .01))) }
function bocaW(k, adelante = .01) { const c = _cara(k); k.g.updateMatrixWorld(true); return k.head.localToWorld(new THREE.Vector3(0, c.my, c.cd / 2 + adelante)) }
const _hombro = k => k._p0.armY, _sc = k => k.body.scale.y;

// ================= UTILERÍA (escondida en cada cuadro: se muestra al pedirla) =================
const PROPS_C = [];
const PROP = g => { g.visible = false; g.userData.prop = 1; PROPS_C.push(g); return g };
// enMano(obj, k, mano, { off, derecho }): en la mano; derecho = queda vertical en el mundo (mirando para donde mira el personaje). Llamar DESPUÉS de posar los brazos.
function enMano(obj, k, mano = "R", { off = [0, -.12, 0], derecho = false } = {}) { attach(obj, k, mano, off); obj.quaternion.identity(); if (!derecho) return obj; const h = mano === "R" ? k.handR : k.handL;
  k.g.updateMatrixWorld(true); h.getWorldQuaternion(_q1); k.g.getWorldQuaternion(_q2); obj.quaternion.copy(_q1.invert().multiply(_q2)); return obj }
function enMundo(obj, pos, ry = 0, rx = 0, rz = 0) { if (obj.parent !== scene) scene.add(obj); obj.visible = true; obj.position.set(...(pos.isVector3 ? pos.toArray() : pos)); obj.rotation.set(rx, ry, rz); obj.scale.setScalar(obj.userData.esc || 1); return obj }
function utileriaReset() { PROPS_C.forEach(o => o.visible = false) }
const glowEl = (col, sz, op = 1) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false })); s.scale.setScalar(sz); return s };
// estira un cilindro de largo 1 (que cuelga hacia −y desde su origen) entre a y b (mundo)
function estirarEl(obj, a, b) { if (obj.parent !== scene) scene.add(obj); obj.visible = true; obj.position.copy(a); _v4.copy(b).sub(a); const L = _v4.length(); obj.quaternion.setFromUnitVectors(_ABAJO, _v4.normalize()); obj.scale.set(1, Math.max(L, .001), 1); return obj }
const cilindroEl = (r, mat) => { const geo = new THREE.CylinderGeometry(r, r, 1, 6, 1, true); geo.translate(0, -.5, 0); const G = new THREE.Group(); const m = part(geo, mat, 0, 0, 0, G, 0); m.castShadow = false; return G };

// ---------- el MUÑECO DE TRAPO de Tib: tela cruda remendada, ojos de botón, boca cosida en X, pelo de lana naranja, vestidito a cuadros rojos.
// Origen = la manito del muñeco (Tib lo lleva agarrado de un brazo, colgando).
const EL_T_TRAPO = tex(256, 256, (g, w, h) => { const r = rng(808); g.fillStyle = "#e6d6b8"; g.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { g.fillStyle = r() < .5 ? "rgba(120,90,50,.08)" : "rgba(255,255,255,.08)"; g.fillRect(r() * w, r() * h, 2, 1 + r() * 4) }
  remiendoG(g, 150, 30, 70, 60, "#9ab8d8"); g.strokeStyle = "rgba(90,60,30,.5)"; g.setLineDash([6, 5]); g.lineWidth = 2; g.strokeRect(4, 4, w - 8, h - 8); g.setLineDash([]) });
const EL_T_TRAPO_CARA = tex(256, 256, (g, w, h) => { g.drawImage(EL_T_TRAPO.image, 0, 0); for (const x of [86, 170]) { g.fillStyle = "#1a1a1a"; g.beginPath(); g.arc(x, 110, 22, 0, 7); g.fill(); g.fillStyle = "#e6d6b8"; for (const [dx, dy] of [[-6, -6], [6, -6], [-6, 6], [6, 6]]) { g.beginPath(); g.arc(x + dx, 110 + dy, 3.5, 0, 7); g.fill() } }
  g.strokeStyle = "#8a2a2a"; g.lineWidth = 5; for (let x = 90; x <= 166; x += 19) { g.beginPath(); g.moveTo(x, 168); g.lineTo(x + 12, 184); g.moveTo(x + 12, 168); g.lineTo(x, 184); g.stroke() } g.fillStyle = "rgba(230,120,120,.4)"; for (const x of [58, 198]) { g.beginPath(); g.arc(x, 150, 16, 0, 7); g.fill() } });
const EL_T_TRAPO_VEST = tex(128, 128, (g, w, h) => { g.fillStyle = "#c83a3a"; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(255,255,255,.45)"; for (let x = 0; x < w; x += 24) g.fillRect(x, 0, 10, h); for (let y = 0; y < h; y += 24) g.fillRect(0, y, w, 10); sombra2D(g, w, h, .15) });
function nuevoMuneco() { const G = new THREE.Group(), mT = new THREE.MeshStandardMaterial({ map: EL_T_TRAPO, roughness: .9 }), mV = new THREE.MeshStandardMaterial({ map: EL_T_TRAPO_VEST, roughness: .85 });
  const B = new THREE.Group(); G.add(B); B.rotation.z = -.25;   // el cuerpo cuelga un poco torcido del brazo
  part(RB(.06, .2, .06, .025), mT, 0, -.1, 0, B, 0);                                                 // el brazo agarrado (para arriba)
  part(RB(.24, .26, .12, .04), boxMats(mV, mV, mV), .1, -.32, 0, B, 0);                              // el cuerpo con el vestidito
  part(RB(.22, .2, .15, .05), boxMats(mT, mT, mT, mT, new THREE.MeshStandardMaterial({ map: EL_T_TRAPO_CARA, roughness: .9 }), mT), .1, -.08, 0, B, 0);   // la cabeza
  const lana = new THREE.MeshStandardMaterial({ color: "#e0782a", roughness: .8 }); [[-.02, .02], [.05, .04], [.12, .045], [.19, .03], [.24, -.02]].forEach(([x, y], i) => { const l = part(new THREE.CapsuleGeometry(.025, .09, 4, 8), lana, x, y, -.02, B, 0); l.rotation.z = (i - 2) * .5 });
  const bz = part(RB(.06, .18, .06, .025), mT, .25, -.32, 0, B, 0); bz.rotation.z = .5;                 // el otro brazo, flojo
  for (const x of [.05, .15]) { const p = part(RB(.07, .22, .07, .03), new THREE.MeshStandardMaterial({ color: "#ece4d4", map: EL_T_TRAPO_VEST, roughness: .9 }), x, -.55, 0, B, 0); p.rotation.z = (x - .1) * 2 }
  G.scale.setScalar(1.2); return G }
// muneco(k, modo): "mano" (cuelga de la mano izquierda: lo pone solo en cada cuadro), "abrazo" (contra el pecho: mueve los brazos; llamar después de la pose), null = sin muñeco
function muneco(k, modo = "mano") { k.modoMuneco = modo; if (!k.munecoP) { k.munecoP = nuevoMuneco(); scene.add(k.munecoP) } const M = k.munecoP; M.visible = !!modo; if (!modo) return M;
  if (modo === "abrazo") { const s = _sc(k), Y = _hombro(k), td = k._forma.torso[2]; if (M.parent !== k.body) k.body.add(M); M.position.set(-.1, Y - .1, td / 2 + .1); M.rotation.set(0, 0, .25); M.scale.setScalar(1.05);
    apuntar(k, k.armL, bW(k, .25, Y - .55, td / 2 + .45)); apuntar(k, k.armR, bW(k, -.25, Y - .45, td / 2 + .45)); return M }
  attach(M, k, "L", [0, -.03, .02]); M.quaternion.identity(); M.rotation.z = AB(k) * .8; M.scale.setScalar(1.2); return M }
muneco(TIB, "mano");

// ---------- utilería de las poses: tijeras en la mano, aguja, hilo, retazo de tela, cuerda de la campana, lágrimas, la lista
const EL_TIJERA = PROP(nuevaTijera());
const EL_AGUJA = PROP((() => { const G = new THREE.Group(); const a = part(new THREE.CylinderGeometry(.007, .004, .16, 6), EL_ACERO, 0, 0, 0, G, 0); a.rotation.x = Math.PI / 2; part(new THREE.TorusGeometry(.012, .003, 4, 10), EL_ACERO, 0, 0, -.075, G, 0); return G })());
const EL_M_HILO = new THREE.MeshStandardMaterial({ color: "#d8403a", roughness: .6 });
const EL_HILO = PROP(cilindroEl(.012, EL_M_HILO));
const EL_RETAZO = PROP((() => { const G = new THREE.Group(); const t = tex(128, 128, (g, w, h) => { g.fillStyle = "#3a6fc8"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(255,255,255,.6)"; g.setLineDash([8, 6]); g.lineWidth = 3; g.beginPath(); g.moveTo(10, 64); g.lineTo(80, 64); g.stroke(); g.setLineDash([]); g.fillStyle = "rgba(0,0,0,.6)"; g.beginPath(); g.ellipse(96, 60, 14, 9, .3, 0, 7); g.fill() });
  const m = part(new THREE.BoxGeometry(.34, .26, .02), new THREE.MeshStandardMaterial({ map: t, roughness: .9 }), 0, 0, 0, G, 0); return G })());
const EL_T_SOGA = tex(32, 128, (g, w, h) => { g.fillStyle = "#c8ac7a"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(60,40,20,.45)"; g.lineWidth = 3; for (let y = -w; y < h; y += 10) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + w); g.stroke() } }, [1, 30]);
const EL_CUERDA = PROP(cilindroEl(.035, new THREE.MeshStandardMaterial({ map: EL_T_SOGA, roughness: .85 })));
// la EL_LISTA: papel viejo con nombres y deudas escritos a mano (en inglés, como el video), una mancha, nombres tachados y uno marcado
const EL_T_LISTA = tex(360, 470, (g, w, h) => { const r = rng(1212); g.fillStyle = "#efe4c8"; g.fillRect(0, 0, w, h); for (let i = 0; i < 1400; i++) { g.fillStyle = r() < .5 ? "rgba(120,90,40,.05)" : "rgba(255,255,255,.06)"; g.fillRect(r() * w, r() * h, 2, 2) }
  const gr = g.createRadialGradient(w * .8, h * .85, 4, w * .8, h * .85, 80); gr.addColorStop(0, "rgba(140,100,40,.35)"); gr.addColorStop(1, "rgba(140,100,40,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = "rgba(90,110,150,.25)"; g.lineWidth = 1.5; for (let y = 78; y < h - 10; y += 38) { g.beginPath(); g.moveTo(16, y); g.lineTo(w - 16, y); g.stroke() }
  g.fillStyle = "#2a1c12"; g.font = "italic bold 30px Georgia, serif"; g.fillText("Owed —", 22, 52);
  const L = [["Widow Hale", "9"], ["Old Fenn", "22"], ["the Brack boys", "14"], ["Tanner's girl", "5"], ["Marga Wick", "40"], ["the Tailor", "30"], ["Ostler", "11"], ["Pell & wife", "18"], ["Dory", "7"], ["Mott", "26"]];
  g.font = "italic 25px Georgia, serif"; L.forEach(([n, d], i) => { const y = 108 + i * 38 - 6 + (r() - .5) * 3; g.fillText(n, 24 + (r() - .5) * 4, y); g.fillText(d, w - 60, y); g.strokeStyle = "rgba(42,28,18,.5)"; g.setLineDash([2, 6]); g.beginPath(); g.moveTo(24 + g.measureText(n).width + 34, y - 6); g.lineTo(w - 70, y - 6); g.stroke(); g.setLineDash([]);
    if (i === 1 || i === 3 || i === 8) { g.strokeStyle = "#2a1c12"; g.lineWidth = 3; g.beginPath(); g.moveTo(18, y - 8); g.lineTo(w - 24, y - 10); g.stroke(); g.lineWidth = 1.5 }
    if (i === 5) { g.strokeStyle = "#8a1a1a"; g.lineWidth = 3; g.beginPath(); g.ellipse(80, y - 8, 76, 20, -.03, 0, 7); g.stroke(); g.lineWidth = 1.5 } });
  g.fillStyle = "rgba(30,20,10,.85)"; g.font = "italic 22px Georgia, serif"; g.fillText("— F. C.", w - 100, h - 22);
  g.strokeStyle = "rgba(120,90,40,.35)"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, h * .5); g.lineTo(w, h * .52); g.stroke() });   // el doblez
const EL_T_LISTA_DORSO = tex(64, 84, (g, w, h) => { g.fillStyle = "#e6dabc"; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(60,40,20,.08)"; for (let y = 18; y < h; y += 7) g.fillRect(8 + (y * 7) % 9, y, 30 + (y * 13) % 18, 2) });
function nuevaLista() { const G = new THREE.Group(); const geo = new THREE.PlaneGeometry(.5, .66, 4, 4); const p = geo.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, .015 * Math.sin(p.getY(i) * 9) + .01 * Math.cos(p.getX(i) * 12)); geo.computeVertexNormals();
  const f = part(geo, new THREE.MeshStandardMaterial({ map: EL_T_LISTA, roughness: .85, side: THREE.FrontSide }), 0, 0, 0, G, 0); const b = part(geo.clone(), new THREE.MeshStandardMaterial({ map: EL_T_LISTA_DORSO, roughness: .9, side: THREE.BackSide }), 0, 0, 0, G, 0); return G }
const EL_LISTA = PROP(nuevaLista()), EL_LISTA_MUNDO = PROP(nuevaLista());
// listaEn(pos, ry, rx): el papel solo, en el mundo (la cara escrita mira a +z rotado por ry/rx)
function listaEn(pos, ry = 0, rx = 0) { return enMundo(EL_LISTA_MUNDO, pos, ry, rx) }
// lágrimas 3D (dos gotas que bajan desde los ojos + la estela mojada brillante), una por personaje
const EL_M_LAGRIMA = new THREE.MeshStandardMaterial({ color: "#cfe8ff", roughness: .05, metalness: .1, emissive: "#6a9ad0", emissiveIntensity: .45, transparent: true, opacity: .9 });
const EL_M_ESTELA = new THREE.MeshBasicMaterial({ color: "#bfe0ff", transparent: true, opacity: .55, depthWrite: false });
function lagrimas(k, t) { const c = _cara(k); if (!k.lagr) { k.lagr = [-1, 1].map(s => { const G = PROP(new THREE.Group()); k.head.add(G); const d = part(new THREE.SphereGeometry(.028, 10, 8), EL_M_LAGRIMA, 0, 0, .012, G, 0); d.scale.set(.8, 1.3, .6); d.castShadow = false;
      const e = new THREE.Mesh(new THREE.PlaneGeometry(.022, 1), EL_M_ESTELA); e.geometry.translate(0, -.5, 0); G.add(e); G.userData = { d, e, s, prop: 1 }; return G }) }
  k.lagr.forEach((G, i) => { const s = G.userData.s, y0 = c.ey - ERY / 384 * c.hD * 1.1, y1 = c.my - .1, ph = (t * .55 + i * .43) % 1, y = lerp(y0, y1, ph * ph);
    G.visible = true; G.position.set(s * (c.ex + .02), 0, c.cd / 2 + .004); G.userData.d.position.y = y; G.userData.d.visible = ph < .92; G.userData.e.position.set(0, y0, .004); G.userData.e.scale.y = Math.max(.02, (y0 - y)) }) }

// ---------- LOS ABRIGOS: tres tipos. Puestos = cáscara pintada sobre los bloques (torso, mangas, faldón en cada pierna); en la mano / colgados /
// en el piso = una pieza de abrigo colgando (cuerpo, mangas que cuelgan, cuello) con la misma tela pintada.
const EL_ABR = {
  rojo: { col: "#c4262e", osc: "#8e1a20", bot: "#1a1a1a", solapa: "#a61e26", largo: .62, cinto: "#8e1a20", doble: 1, L: 1.34, W: .92 },
  crane: { col: "#141417", osc: "#08080a", bot: "#2e2e34", solapa: "#24242a", largo: .95, L: 1.8, W: 1.0, terciopelo: 1 },
  tib: { col: "#2f6fd0", osc: "#22549e", bot: "#eadcb4", solapa: "#22549e", largo: .3, L: .8, W: .64, remiendos: ["#e8b840", "#d24a3a"], palillos: 1 } };
const _elLana = (g, w, h, seed, a = .07) => { const r = rng(seed); for (let i = 0; i < w * h / 90; i++) { g.fillStyle = r() < .5 ? `rgba(0,0,0,${a})` : `rgba(255,255,255,${a * .8})`; g.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 2) } };
const EL_TEX_ABR = {};
function texAbrigo(tipo, parte) { const C = EL_ABR[tipo], key = tipo + parte; if (EL_TEX_ABR[key]) return EL_TEX_ABR[key];
  const W = parte === "frente" || parte === "espalda" ? 512 : parte === "lado" ? 64 : 128, H = parte === "frente" || parte === "espalda" ? 512 : parte === "lado" ? 64 : 256;
  return EL_TEX_ABR[key] = tex(W, H, (g, w, h) => { g.fillStyle = C.col; g.fillRect(0, 0, w, h); _elLana(g, w, h, tipo.length * 31 + parte.length);
    if (parte === "frente") {
      // solapas en V (y el cuello de terciopelo en el de Crane), costura del cierre, botones, bolsillos con tapa, cinturón
      g.fillStyle = C.solapa; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(256 + s * 40, 0); g.lineTo(256 + s * 150, 0); g.lineTo(256 + s * 120, 150); g.lineTo(256 + s * 30, 250); g.lineTo(256 + s * 6, 250); g.closePath(); g.fill() }
      g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 4; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(256 + s * 150, 0); g.lineTo(256 + s * 120, 150); g.lineTo(256 + s * 30, 250); g.stroke() }
      g.fillStyle = C.osc; g.fillRect(250, 240, 12, h - 240);
      if (C.terciopelo) { g.fillStyle = "#26262c"; g.fillRect(150, 0, 212, 26) }
      const bot = (x, y, r = 13) => { g.fillStyle = C.bot; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = "rgba(255,255,255,.25)"; g.beginPath(); g.arc(x - 4, y - 4, r * .3, 0, 7); g.fill(); g.fillStyle = "rgba(0,0,0,.5)"; for (const [dx, dy] of [[-3, -3], [3, 3]]) { g.beginPath(); g.arc(x + dx, y + dy, 2, 0, 7); g.fill() } };
      if (C.palillos) for (let i = 0; i < 3; i++) { const y = 270 + i * 70; g.fillStyle = C.bot; g.beginPath(); g.roundRect(226, y - 8, 60, 16, 8); g.fill(); g.strokeStyle = "#5a3a20"; g.lineWidth = 4; g.beginPath(); g.moveTo(256, y - 8); g.lineTo(290, y - 22); g.stroke() }
      else if (C.doble) for (let i = 0; i < 3; i++) { bot(212, 280 + i * 70); bot(300, 280 + i * 70) } else for (let i = 0; i < 5; i++) bot(276, 270 + i * 50, 10);
      for (const s of [-1, 1]) { g.fillStyle = C.osc; g.fillRect(256 + s * 170 - 60, 400, 120, 22); g.strokeStyle = "rgba(0,0,0,.3)"; g.lineWidth = 2; g.strokeRect(256 + s * 170 - 60, 400, 120, 22) }
      if (C.cinto) { g.fillStyle = C.cinto; g.fillRect(0, 360, w, 30); g.fillStyle = "#d8c070"; g.fillRect(236, 356, 40, 38); g.fillStyle = C.cinto; g.fillRect(246, 364, 20, 22) }
      if (C.remiendos) { remiendoG(g, 330, 140, 100, 80, C.remiendos[0]); remiendoG(g, 70, 300, 90, 70, C.remiendos[1]) } }
    else if (parte === "espalda") { g.fillStyle = C.osc; g.fillRect(252, 0, 8, h); if (C.cinto) { g.fillStyle = C.cinto; g.fillRect(150, 360, 212, 30); for (const x of [170, 342]) { g.fillStyle = C.bot; g.beginPath(); g.arc(x, 375, 9, 0, 7); g.fill() } }
      if (C.terciopelo) { g.fillStyle = "#26262c"; g.fillRect(140, 0, 232, 40) } if (C.remiendos) remiendoG(g, 280, 220, 110, 90, C.remiendos[0]) }
    else if (parte === "manga") { g.fillStyle = C.osc; g.fillRect(0, h - 40, w, 26); g.fillStyle = C.bot; g.beginPath(); g.arc(w * .7, h - 27, 7, 0, 7); g.fill(); g.fillStyle = "rgba(0,0,0,.14)"; g.fillRect(w / 2 - 2, 0, 4, h - 40) }
    else if (parte === "falda") { g.fillStyle = C.osc; g.fillRect(0, h - 22, w, 14); g.fillStyle = "rgba(0,0,0,.12)"; g.fillRect(w / 2 - 2, 0, 4, h) }
    sombra2D(g, w, h, .14) }) }
const EL_M_ABR = {}; const matAbr = (tipo, parte) => EL_M_ABR[tipo + parte] ||= new THREE.MeshStandardMaterial({ map: texAbrigo(tipo, parte), roughness: tipo === "crane" ? .55 : .8 });
// abrigoPuesto(k, tipo, on): la cáscara del abrigo sobre el personaje (persistente). Pone uno solo por vez.
function armarAbrigoPuesto(k, tipo) { const C = EL_ABR[tipo], F = k._forma, [tw, th, td] = F.torso, [bw, bl, bd] = F.brazo, [pw, pl, pd] = F.pierna, L = [], lado = matAbr(tipo, "lado");
  L.push(part(RB(tw + .07, th + .03, td + .08, .05), boxMats(lado, matAbr(tipo, "frente"), matAbr(tipo, "espalda")), 0, pl + th / 2 + .01, 0, k.body, 0));
  const lm = bl * .84; [k.armL, k.armR].forEach(a => L.push(part(RB(bw + .055, lm, bd + .055, .05), matAbr(tipo, "manga"), 0, .1 - lm / 2, 0, a, 0)));
  const lf = pl * C.largo; [k.legL, k.legR].forEach(l => L.push(part(RB(pw + .06, lf, pd + .06, .04), matAbr(tipo, "falda"), 0, .02 - lf / 2, 0, l, 0)));
  if (C.terciopelo || C.doble) { const cu = part(RB(tw * .7, .14, td + .14, .05), matAbr(tipo, "lado"), 0, pl + th + .01, -.02, k.body, 0); L.push(cu) }   // cuello alto del tapado
  return L }
function abrigoPuesto(k, tipo, on = true) { k.abrigos ||= {}; for (const n in k.abrigos) if (n !== tipo || !on) k.abrigos[n].forEach(m => m.visible = false); if (!tipo || !on) { k.abrigoActual = null; return }
  (k.abrigos[tipo] ||= armarAbrigoPuesto(k, tipo)).forEach(m => m.visible = true); k.abrigoActual = tipo }
const abrigoRojo = (k, on = true) => abrigoPuesto(k, "rojo", on);
// el abrigo suelto: origen = el cuello (de donde cuelga); cuelga hacia −y, la cara de adelante a +z
function nuevoAbrigoSuelto(tipo) { const C = EL_ABR[tipo], G = new THREE.Group(), W = C.W, L = C.L, lado = matAbr(tipo, "lado");
  const cuerpo = new THREE.BoxGeometry(W, L, .16, 3, 6, 1); const p = cuerpo.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i), v = (y + L / 2) / L; p.setX(i, p.getX(i) * (.82 + .18 * (1 - v)) * (v > .9 ? lerp(1, .78, (v - .9) / .1) : 1)); p.setZ(i, p.getZ(i) + .03 * Math.sin(p.getX(i) * 7 + y * 3)) }   // se abre hacia abajo, hombros caídos, pliegues
  cuerpo.computeVertexNormals(); cuerpo.translate(0, -L / 2 - .06, 0); part(cuerpo, boxMats(lado, matAbr(tipo, "frente"), matAbr(tipo, "espalda")), 0, 0, 0, G, 0);
  for (const s of [-1, 1]) { const lm = L * .62, m = part(RB(W * .24, lm, .15, .04), matAbr(tipo, "manga"), s * (W * .46), -.1 - lm / 2, -.01, G, 0); m.rotation.z = s * .07 }   // las mangas que cuelgan a los costados
  part(RB(W * .62, .12, .2, .05), lado, 0, -.06, -.01, G, 0);                                    // el cuello
  const presilla = part(new THREE.TorusGeometry(.04, .01, 5, 12), lado, 0, .0, -.04, G, 0);          // la presilla de colgar
  G.userData.tipo = tipo; return G }
const EL_ABR_MANO = {}, EL_ABR_MUNDO = {};
const abrigoProp = (tipo, donde = "mundo") => { const D = donde === "mano" ? EL_ABR_MANO : EL_ABR_MUNDO; return D[tipo] ||= PROP(nuevoAbrigoSuelto(tipo)) };
// abrigoColgado(tipo, pos, ry): colgado del gancho pos (mundo) · abrigoEnPiso(tipo, pos, ry): tirado en el piso, un poco arrugado
function abrigoColgado(tipo, pos, ry = 0) { const A = enMundo(abrigoProp(tipo), pos, ry); A.scale.set(1, 1, 1); return A }
function abrigoEnPiso(tipo, pos, ry = 0) { const P = pos.isVector3 ? pos.toArray() : pos, A = enMundo(abrigoProp(tipo), [P[0], P[1] + .09, P[2]], ry, -Math.PI / 2 + .04, .12); A.scale.set(1, .8, .55);
  A.position.add(new THREE.Vector3(0, 0, EL_ABR[tipo].L * .4).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry)); return A }
// abrigoEnMano(k, tipo, { mano, doblado }): lo lleva colgando de la mano (doblado = a la mitad, sobre el antebrazo). tipo null = nada.
function abrigoEnMano(k, tipo, { mano = "R", doblado = true } = {}) { if (!tipo) return null; const A = abrigoProp(tipo, "mano"); A.visible = true; enMano(A, k, mano, { off: [0, -.06, .06], derecho: true });
  A.scale.set(1, doblado ? .5 : 1, doblado ? 1.8 : 1); return A }

// ================= ANIMACIÓN (se llaman DESPUÉS de pose(); dejan al personaje listo) =================
// pose() del motor queda envuelta: limpia lo que estas funciones tocan (nada queda pegado de un cuadro al otro), esconde la utilería una vez
// por cuadro, vuelve a colgar las tijeras del sastre y el muñeco de Tib.
{ const pose0 = pose; let tUlt = -1e9;
  pose = (k, t, o = {}) => { if (t !== tUlt) { tUlt = t; utileriaReset() } k._t = t; k.body.quaternion.identity(); k.body.position.set(0, 0, 0); _MIEM(k).forEach(m => m.quaternion.identity()); if (k._p0) { k.armL.position.y = k.armR.position.y = k._p0.armY; k.head.position.x = 0 }
    if (k.tijeraC) k.tijeraC.visible = k.conTijera !== false; if (k.munecoP && k.modoMuneco === "abrazo") k.modoMuneco = "mano"; pose0(k, t, o); if (k.munecoP) muneco(k, k.modoMuneco) } }
// quiebre de cadera (el torso gira en la cadera y las piernas siguen rectas; sin codos ni rodillas). lean = inclinación del torso (+ adelante); psi = ángulo de las piernas
function cadera(k, lean, psi = 0) { const b = k.body, L0 = b.rotation.x, s = b.scale.y, d = lean - L0, H = HC(k);
  b.rotation.x = lean; k.legL.rotation.x += psi - d; k.legR.rotation.x += psi - d; b.position.z -= H * s * ((Math.sin(lean) - Math.sin(L0)) - Math.sin(psi)); b.position.y -= H * s * ((Math.cos(lean) - Math.cos(L0)) - (Math.cos(psi) - 1)) }
const _fase = k => (k.idx || 0) * 1.7;
const _respira = (k, t) => k.quietoTotal ? 0 : .012 * Math.sin(t * 2.2 + (k.idx || 0));
function dedosSallow() { }   // (legado)
// quieto(k, t, { mira }): parado derecho, brazos en «A», respira
function quieto(k, t, { mira = 0 } = {}) { const A = AB(k); k._t = t;
  k.legL.rotation.set(0, 0, 0); k.legR.rotation.set(0, 0, 0); k.armL.rotation.set(0, 0, -A - _respira(k, t)); k.armR.rotation.set(0, 0, A + _respira(k, t)); k.head.rotation.set(_respira(k, t), mira, 0); k.body.rotation.set(0, 0, 0); k.body.position.set(0, 0, 0);
  if (k.encorvado) { cadera(k, k.encorvado); k.head.rotation.x = -k.encorvado * .75; k.armL.rotation.x = k.encorvado * .8; k.armR.rotation.x = k.encorvado * .8 }
  parpadeo(k, t) }
// caminata: ciclo de 0,5 s; piernas ±27,5°, brazos ±7° en «A», balanceo ±5°. vel < 0 = hacia atrás
function andar(k, t, { vel = 1 } = {}) { const f = t * vel / .5 * Math.PI * 2 + _fase(k), sw = Math.sin(f), amp = k.pasoMax ?? .48, A = AB(k), s = k.body.scale.y; k._t = t;
  k.body.rotation.set(0, 0, sw * .087); k.body.position.set(0, -HC(k) * s * (1 - Math.cos(amp * sw)), 0);
  k.legL.rotation.set(sw * amp, 0, 0); k.legR.rotation.set(-sw * amp, 0, 0); k.armL.rotation.set(-sw * .12, 0, -A); k.armR.rotation.set(sw * .12, 0, A); k.head.rotation.set(0, 0, -sw * .04);
  if (k.encorvado) { cadera(k, k.encorvado); k.head.rotation.x = -k.encorvado * .75 }
  parpadeo(k, t) }
// corrida: ciclo de 0,5 s; torso 20° adelante; fuerte = 1: brazos que bombean
function correrV(k, t, { fuerte = 0 } = {}) { const f = t / .5 * Math.PI * 2 + _fase(k), sw = Math.sin(f), amp = k.zancMax ?? .87, A = AB(k), lean = .35, s = k.body.scale.y; k._t = t;
  k.body.rotation.set(0, 0, 0); k.body.position.set(0, Math.abs(sw) * .13 * s, 0); k.legL.rotation.set(sw * amp, 0, 0); k.legR.rotation.set(-sw * amp, 0, 0); cadera(k, lean);
  const b0 = lerp(.38, -1.2, fuerte), ba = lerp(.06, .55, fuerte), bz = lerp(A * .7, .12, fuerte); k.armL.rotation.set(b0 - sw * ba, 0, -bz); k.armR.rotation.set(b0 + sw * ba, 0, bz); k.head.rotation.set(-lean * .7, 0, 0); parpadeo(k, t) }
function mirarArriba(k, t, u = 1) { const e = _suave(u); quieto(k, t); cadera(k, (k.encorvado || 0) - .14 * e); k.head.rotation.x = -.5 * e + _respira(k, t); k.armL.rotation.x = .12 * e; k.armR.rotation.x = .12 * e; parpadeo(k, t) }
function senalarArriba(k, t, u = 1, { mano = "R" } = {}) { const e = _suave(u); mirarArriba(k, t, u); const a = mano === "R" ? k.armR : k.armL, sg = mano === "R" ? 1 : -1; a.rotation.set(lerp(0, -2.75, e) + .03 * Math.sin(t * 3), 0, sg * lerp(AB(k), .05, e)); parpadeo(k, t) }
// senalar(k, t, u, { alto, mano }): señala adelante con el brazo estirado (alto = cuánto más arriba, rad)
function senalar(k, t, u = 1, { alto = 0, mano = "R" } = {}) { const e = _suave(u); quieto(k, t); const a = mano === "R" ? k.armR : k.armL, sg = mano === "R" ? 1 : -1; a.rotation.set(lerp(0, -1.5 - alto, e) + .02 * Math.sin(t * 4), 0, sg * lerp(AB(k), .03, e)); k.head.rotation.x = -alto * .4 * e; parpadeo(k, t) }
// retroceder(k, t, u): camina HACIA ATRÁS (la escena mueve k.g hacia −z local) mirando arriba, brazos un poco adelante
function retroceder(k, t, u = 1) { const e = _suave(u); andar(k, t, { vel: -.85 }); cadera(k, -.1 * e); k.head.rotation.x = -.45 * e; k.armL.rotation.x -= .5 * e; k.armR.rotation.x -= .5 * e; k.armL.rotation.z -= .2 * e; k.armR.rotation.z += .2 * e; parpadeo(k, t) }
// abrazarse(k, t, { tiembla }): se abraza a sí mismo (brazos cruzados sobre el pecho), encogido, tiritando
function abrazarse(k, t, { tiembla = 1 } = {}) { quieto(k, t); const s = k.body.scale.y, j = tiembla * .02 * Math.sin(t * 37 + (k.idx || 0)); cadera(k, (k.encorvado || 0) + .1); k.head.rotation.x = .12;
  apuntar(k, k.armL, gW(k, (.5 + j) * s, 1.72 * s, .72 * s)); apuntar(k, k.armR, gW(k, (-.5 - j) * s, 1.56 * s, .68 * s)); k.body.rotation.z += j; parpadeo(k, t) }
// boda(novio, novia, t): de frente (≈ 1,3 de distancia) tomados de las dos manos, meciéndose apenas
function boda(a, b, t) { quieto(a, t); quieto(b, t); [a, b].forEach((k, i) => { k.body.rotation.z = .03 * Math.sin(t * 1.6 + i * Math.PI); k.head.rotation.x = .06 }); a.g.updateMatrixWorld(true); b.g.updateMatrixWorld(true);
  const pa = a.g.getWorldPosition(new THREE.Vector3()), pb = b.g.getWorldPosition(new THREE.Vector3()), mid = pa.clone().lerp(pb, .5), d = pb.clone().sub(pa).setY(0).normalize(), lat = _v3.set(d.z, 0, -d.x), y = 1.25 * Math.min(a.body.scale.y, b.body.scale.y);
  for (const [k, sg] of [[a, 1], [b, -1]]) { apuntar(k, k.armL, mid.clone().addScaledVector(lat, -.28 * sg).setY(mid.y + y)); apuntar(k, k.armR, mid.clone().addScaledVector(lat, .28 * sg).setY(mid.y + y)) } parpadeo(a, t); parpadeo(b, t) }
// ladear(k, t, u, { lado }): inclina la cabeza de costado DEMASIADO (≈ 47°), despacio (Crane). Se llama después de la pose de base.
function ladear(k, t, u = 1, { lado = 1 } = {}) { const e = _suave(u); k.head.rotation.z += lado * .82 * e; k.head.rotation.x += .05 * e; k.head.position.x = lado * -.05 * e; k.body.rotation.z += -lado * .03 * e; return e }
// caerAtras(k, t, u): da un paso atrás (u 0→.3) y cae de espaldas TIESO (u .3→1, acelerando); queda acostado. Devuelve cuánto cayó (0..1).
function caerAtras(k, t, u = 1) { const s = k.body.scale.y; quieto(k, t); const p = _suave(u / .3), f = cl((u - .3) / .7), a = f * f * Math.PI / 2, paso = .38 * s * p;
  if (f <= 0) { k.legR.rotation.x = .4 * Math.sin(p * Math.PI); k.body.position.z -= paso; cadera(k, (k.encorvado || 0) - .08 * p) }
  else { cuerpoQ(k, _q3.setFromAxisAngle(_ax.set(1, 0, 0), -a - .08 * (1 - f)), [0, 0, -.22], [0, 0, -paso - .22 * s]); k.legL.rotation.set(0, 0, 0); k.legR.rotation.set(0, 0, 0); k.head.rotation.set(0, 0, 0) }
  k.armL.rotation.set(0, 0, -AB(k)); k.armR.rotation.set(0, 0, AB(k)); return f }
// gestos LINEALES (dur = 0,4 s), se quedan en la pose; `fin`: tiempo en que vuelve. tipos: senala, cubre, brazos, alza, abraza, tira, grita, agita, manosCabeza
const GESTOS = {
  senala: { R: [-1.5, 0] }, alza: { R: [-3.0, .1] }, para: { R: [-1.6, -.2], hx: -.06 },
  cubre: { L: [-2.2, .62], R: [-2.2, -.62], hx: .16, lean: .1 }, brazos: { L: [0, -.94], R: [0, .94], hx: -.06, lean: -.07 }, abraza: { L: [-1.2, .42], R: [-1.2, -.42] },
  tira: { L: [-1.25, .14], R: [-1.25, -.14], lean: -.3, hx: .12 }, grita: { L: [-2.0, -.14], R: [-2.0, .14], lean: .26, hx: -.2 },
  agita: { R: [-1.6, .1] }, manosCabeza: { L: [-2.7, .9], R: [-2.7, -.9], hx: .1 } };
function gesto(k, t, t0, tipo, { dur = .4, fin = null, mano = "R", alto = 0 } = {}) { const G = GESTOS[tipo]; if (!G) return 0; let u = P(t, t0, t0 + dur); if (fin != null) u *= 1 - P(t, fin, fin + dur); if (u <= 0) return 0;
  const esp = mano === "L" && !G.L, ap = (a, [x, z], sg) => { a.rotation.x = lerp(a.rotation.x, x, u); a.rotation.z = lerp(a.rotation.z, z * sg, u) };
  if (G.L) ap(k.armL, G.L, 1); if (G.R) { const [x, z] = G.R, xx = tipo === "senala" ? x - alto : x; esp ? ap(k.armL, [xx, z], -1) : ap(k.armR, [xx, z], 1) }
  if (G.lean) cadera(k, lerp(k.body.rotation.x, k.body.rotation.x + G.lean, u));
  if (G.hx) k.head.rotation.x += G.hx * u;
  if (u >= 1 && tipo === "agita") { const q = ((t - t0 - dur) / (16 * F30)) % 1, tri = q < .5 ? q * 4 - 1 : 3 - q * 4, a = esp ? k.armL : k.armR; a.rotation.x = -1.6 + tri * .38 }
  return u }
// caída: el cuerpo tieso vuelca en 16 cuadros (dir = 1 de cara, −1 de espaldas) y queda acostado
function caer(k, t, t0, { dir = -1, dur = 16 * F30 } = {}) { const u = P(t, t0, t0 + dur); if (u <= 0) return 0; const a = u * u * Math.PI / 2, s = k.body.scale.y; k.body.rotation.x = dir * a; k.body.position.y = Math.sin(a) * .3 * s; k.body.position.z = -dir * Math.sin(a) * .3 * s; k.head.rotation.set(0, 0, 0); return u }
// salto: se agacha 8 cuadros, salta tieso y cae (14 cuadros en el aire); devuelve la altura
function saltar(k, t, t0, { alto = .9, aire = 14 * F30 } = {}) { const ta = 8 * F30, s = k.body.scale.y; if (t <= t0 || t >= t0 + ta + aire) return 0;
  if (t < t0 + ta) { const c = (t - t0) / ta; cadera(k, .5 * c, -.42 * c); k.armL.rotation.x = .5 * c; k.armR.rotation.x = .5 * c; k.head.rotation.x -= .3 * c; return 0 }
  const v = (t - t0 - ta) / aire, y = alto * 4 * v * (1 - v) * s; k.body.position.y += y; k.armL.rotation.z = -A_BRAZO - .25; k.armR.rotation.z = A_BRAZO + .25; return y }
// taparOidos(k, t, u, { cara }): se tapa las orejas con las manos, encogido, tiembla (genérico de miedo)
function taparOidos(k, t, u = 1, { cara = "terror" } = {}) { const e = _suave(u), tr = .035 * Math.sin(t * 31 + (k.idx || 0)) * e; quieto(k, t);
  cadera(k, (k.encorvado || 0) + .1 * e); k.head.rotation.x += .08 * e; k.head.rotation.z = tr * .5;
  for (const [a, sg] of [[k.armL, -1], [k.armR, 1]]) { a.rotation.set(lerp(a.rotation.x, -2.98, e) + tr, 0, sg * lerp(AB(k), -.21, e)); a.position.y = k._p0.armY - .22 * e }
  if (cara && u > .3) setFace(k, cara); parpadeo(k, t) }

// ================= LAS ACCIONES DE ESTA HISTORIA =================
// taparBoca(a, b, u, { colocar, cara }): A, parado delante de B y corrido a la derecha de B (su hombro derecho justo frente a la cara de B),
// le pone la mano derecha en la boca (el brazo derecho estirado hacia la cara, la mano tapa boca y mentón, los ojos de B quedan a la vista)
// y le agarra el hombro con la izquierda; la cabeza de A gira hacia B. B se echa para atrás, se agarra del brazo de A con las dos manos y pone
// cara «tapada». u 0→1 desde quietos. colocar = true: pone a A (B tiene que estar puesto antes); si no, la escena pone a A en ese lugar.
// Cámara que se lee bien: del lado izquierdo de B, a 45° (se ven la cara de B de tres cuartos y A de perfil).
function taparBoca(a, b, u = 1, { colocar = true, cara = "tapada" } = {}) { const e = _suave(u), t = a._t ?? 0, sa = _sc(a), sb = _sc(b);
  quieto(b, t); cadera(b, -.08 * e); b.head.rotation.x = -.12 * e; b.head.rotation.z = .02 * Math.sin(t * 29) * e; b.body.rotation.z += .012 * Math.sin(t * 23) * e;
  b.g.updateMatrixWorld(true); const xB = new THREE.Vector3(1, 0, 0).transformDirection(b.g.matrixWorld), zB = new THREE.Vector3(0, 0, 1).transformDirection(b.g.matrixWorld);
  const T = bocaW(b, .06).add(new THREE.Vector3(0, -.2 * sb, 0));   // donde termina la mano: sobre la boca, un poco abajo (los ojos quedan libres)
  if (colocar) { const R = (a._p0.armL - .1) * sa, dy = a._p0.armY * sa + b.g.position.y - T.y, hz = Math.sqrt(Math.max(.01, R * R - dy * dy));
    const S = T.clone().addScaledVector(zB, hz); a.g.visible = true; a.g.position.set(S.x, b.g.position.y, S.z).addScaledVector(xB, a._p0.armX * sa); a.g.rotation.set(0, b.g.rotation.y + Math.PI, 0) }
  quieto(a, t); cadera(a, .03 * e); a.head.rotation.set(.12 * e, .6 * e, 0);
  apuntar(a, a.armR, gW(a, (a._p0.armX + .15) * sa, 0, .1 * sa).lerp(T, e));
  apuntar(a, a.armL, gW(a, -(a._p0.armX + .15) * sa, 0, 0).lerp(bW(b, -.42, _hombro(b) - .05, .1), e));
  // B se agarra del antebrazo de A, por debajo
  a.g.updateMatrixWorld(true); const brazo = a.handR.getWorldPosition(new THREE.Vector3()).addScaledVector(zB, .3 * sb).add(new THREE.Vector3(0, -.2 * sb, 0));
  for (const [arm, sx] of [[b.armL, -1], [b.armR, 1]]) apuntar(b, arm, gW(b, sx * b._p0.armX * sb, .2 * sb, 0).lerp(brazo.clone().addScaledVector(xB, sx * .1 * sb), e));
  if (cara && u > .3) setFace(b, cara); parpadeo(a, t) }
// hablarManos(k, t, { vel }): lengua de señas: los dos brazos adelante cambian de seña cada ≈ .45 s (alto, apertura y giro de cada mano, sin cruzarse),
// golpecitos en cada seña, la cabeza acompaña. Cada seña = [[x izq, z izq, giro izq], [x der, z der, giro der]] (rotaciones del hombro, z + = hacia adentro).
const EL_SENAS = [[[-1.3, .1, .4], [-1.65, .15, -.6]], [[-1.75, .22, 0], [-1.75, .22, 0]], [[-1.05, .02, 1.1], [-1.95, .28, -.3]], [[-1.55, .3, -.5], [-1.2, .05, .8]],
  [[-1.95, .12, .3], [-1.4, .32, 1.2]], [[-1.25, -.12, -.9], [-1.5, -.1, .9]], [[-2.1, .26, .6], [-1.15, .1, -.2]], [[-1.45, .3, 1.4], [-1.85, .05, -1.4]]];
function hablarManos(k, t, { vel = 1 } = {}) { quieto(k, t); const q = t * vel / .45 + _fase(k), i = Math.floor(q), f = q - i, n = EL_SENAS.length, ex = k.encorvado || 0;
  const A = EL_SENAS[((i % n) + n) % n], B = EL_SENAS[(((i + 1) % n) + n) % n], m = _suave((f - .6) / .4), tap = .07 * Math.max(0, Math.sin(f * Math.PI * 4)) * (1 - m);
  cadera(k, ex + .04); k.head.rotation.x = -ex * .6 + .04 + .05 * Math.sin(q * Math.PI); k.head.rotation.y = .1 * Math.sin(q * .9); k.head.rotation.z = .05 * Math.sin(q * 1.3);
  [[k.armL, 0, -1], [k.armR, 1, 1]].forEach(([arm, j, sg]) => { const a = A[j], b = B[j]; arm.rotation.set(lerp(a[0], b[0], m) + ex * .5 + (j ? -tap : tap * .6), lerp(a[2], b[2], m), -sg * lerp(a[1], b[1], m)) });
  parpadeo(k, t) }
// coser(k, t, { punto, tela }): cose con aguja e hilo rojo, sin ruido: la mano izquierda sostiene la tela, la derecha tira el hilo en lazos largos
// (entra, tira para arriba y afuera, vuelve). punto = Vector3 del mundo donde cose (la mano izquierda va al lado); tela = retazo en la mano izquierda.
function coser(k, t, { punto = null, tela = true } = {}) { quieto(k, t); const s = _sc(k), Y = _hombro(k), c = (t * .7 + _fase(k) * .1) % 1; cadera(k, (k.encorvado || 0) + .14); k.head.rotation.x = .42 - (k.encorvado || 0) * .5;
  const PT = punto ? punto.clone() : gW(k, -.3 * s, (Y - .62) * s, .72 * s); apuntar(k, k.armL, PT.clone().add(gW(k, -.12 * s, -.02 * s, 0).sub(gW(k, 0, 0, 0))));
  const tira = c < .2 ? 0 : c < .7 ? _suave((c - .2) / .5) : 1 - _suave((c - .7) / .3), arco = Math.sin(tira * Math.PI);
  apuntar(k, k.armR, PT.clone().add(gW(k, (.5 + .4 * tira) * s, (.05 + .5 * tira + .15 * arco) * s, (.02 - .15 * tira) * s).sub(gW(k, 0, 0, 0))));
  k.g.updateMatrixWorld(true); if (tela && !punto) { enMano(EL_RETAZO, k, "L", { off: [0, -.2, .05] }); EL_RETAZO.rotation.set(-.3, 0, 0); EL_RETAZO.scale.setScalar(1.5) }
  enMano(EL_AGUJA, k, "R", { off: [0, -.17, .08] }); EL_AGUJA.rotation.set(.4, 0, 0); EL_AGUJA.scale.setScalar(2); k.g.updateMatrixWorld(true);
  const ojo = EL_AGUJA.localToWorld(new THREE.Vector3(0, 0, -.075)), dest = punto ? PT : EL_RETAZO.getWorldPosition(new THREE.Vector3()); estirarEl(EL_HILO, ojo, dest); parpadeo(k, t) }
// cortarTijera(k, t, { a, sobre, vel }): las tijeras grandes en la mano derecha abriendo y cerrando, apuntando a `a` (Vector3 del mundo; por defecto
// adelante y arriba). sobre = true: no toca el resto del cuerpo (llamarla DESPUÉS de trepar para cortar colgado). Devuelve la punta de las hojas (mundo).
function cortarTijera(k, t, { a = null, sobre = false, vel = 1 } = {}) { const s = _sc(k), Y = _hombro(k); if (!sobre) { quieto(k, t); cadera(k, (k.encorvado || 0) + .06) }
  apuntar(k, k.armR, a ? a.clone() : gW(k, .2 * s, (Y + .35) * s, 1.3 * s)); if (k.tijeraC) k.tijeraC.visible = false;
  enMano(EL_TIJERA, k, "R", { off: [0, -.02, .02] }); EL_TIJERA.rotation.set(Math.PI / 2, 0, 0); EL_TIJERA.position.y -= .2; const ab = .1 + .55 * (.5 + .5 * Math.sin(t * vel * Math.PI * 2 * 1.4)); EL_TIJERA.userData.abrir(ab);
  if (!sobre) { k.head.rotation.x = -.15; apuntar(k, k.armL, gW(k, -.2 * s, (Y - .3) * s, .7 * s)) } k.g.updateMatrixWorld(true); return EL_TIJERA.localToWorld(new THREE.Vector3(0, 0, .5)) }
// trepar(k, t, { h, vel }): trepa la tela de abrigos: la cara a +z, pegado a la pared (≈ .45·s adelante); brazos que se alternan arriba
// agarrando, piernas que empujan, el cuerpo se balancea. h = cuánto subió (se suma al body).
function trepar(k, t, { h = 0, vel = 1 } = {}) { const c = t * vel * 1.1 + _fase(k) * .1, sw = Math.sin(c * Math.PI * 2), s = k.body.scale.y; k._t = t;
  k.body.rotation.set(.12, 0, sw * .06); k.body.position.set(0, h + .12 * s * (1 - Math.cos(c * Math.PI * 4)) * .5, .02 * s);
  k.armL.rotation.set(-2.55 - .5 * sw, 0, .12 + .1 * Math.max(0, sw)); k.armR.rotation.set(-2.55 + .5 * sw, 0, -.12 - .1 * Math.max(0, -sw));
  k.legL.rotation.set(-.1 - .7 * Math.max(0, -sw), 0, -.08); k.legR.rotation.set(-.1 - .7 * Math.max(0, sw), 0, .08); k.head.rotation.set(-.35, .12 * sw, 0); parpadeo(k, t) }
// levantarAbrigo(k, u, { tipo }): el abrigo está tirado ≈ .9·s adelante; se agacha (u 0→.45), lo agarra y se endereza con el abrigo contra el pecho (u .45→1).
// El abrigo tirado/levantado es el de abrigoProp(tipo) (el mismo que abrigoEnPiso).
function levantarAbrigo(k, u = 1, { tipo = "rojo" } = {}) { const t = k._t ?? 0, s = _sc(k), Y = _hombro(k), e1 = _suave(u / .45), e2 = _suave((u - .45) / .55); quieto(k, t);
  const lean = 1.25 * (u < .45 ? e1 : 1 - e2), psi = .45 * (u < .45 ? e1 : 1 - e2); cadera(k, lean, psi); k.head.rotation.x = .25 - lean * .35;
  const piso = gW(k, 0, .05, .95 * s), pecho = (sx) => bW(k, sx * .16, Y - .3, k._forma.torso[2] / 2 + .45);
  for (const [arm, sx] of [[k.armL, -1], [k.armR, 1]]) { const abajo = piso.clone().add(gW(k, sx * .2 * s, 0, 0).sub(gW(k, 0, 0, 0))), rest = gW(k, sx * (k._p0.armX + .2) * s, .3 * s, .1 * s);
    apuntar(k, arm, u < .45 ? rest.lerp(abajo, e1) : abajo.lerp(pecho(sx), e2)) }
  const A = abrigoProp(tipo); k.g.updateMatrixWorld(true); const ry = k.g.rotation.y;
  if (u < .45) abrigoEnPiso(tipo, gW(k, 0, 0, .55 * s), ry);
  else { const m = k.handL.getWorldPosition(new THREE.Vector3()).add(k.handR.getWorldPosition(new THREE.Vector3())).multiplyScalar(.5), q = _suave(e2 / .5); enMundo(A, m, ry, lerp(-Math.PI / 2 + .3, 0, q)); A.scale.set(1, lerp(.8, 1, q), lerp(.55, 1, q)) }
  parpadeo(k, t); return A }
// toser(k, t, { cara }): tose con el puño en la boca: sacudones hacia adelante cada ≈ .8 s, la otra mano en el pecho
function toser(k, t, { cara = "tos" } = {}) { quieto(k, t); const s = _sc(k), Y = _hombro(k), p = Math.pow(Math.max(0, Math.sin(t * Math.PI * 2 / .8)), 6);
  cadera(k, (k.encorvado || 0) + .1 + .22 * p); k.head.rotation.x = .08 + .22 * p; k.body.position.y -= .03 * p * s;
  apuntar(k, k.armR, bocaW(k, .2).add(new THREE.Vector3(0, -.16 * s, 0)).add(gW(k, .12 * s, 0, 0).sub(gW(k, 0, 0, 0)))); apuntar(k, k.armL, bW(k, .05, Y - .62, k._forma.torso[2] / 2 + .25)); if (cara) setFace(k, cara); parpadeo(k, t) }
// llorarMudo(k, t, { cara }): llora sin ruido: cabeza gacha, hombros que tiemblan, una mano en la boca y la otra en la cintura; lágrimas 3D que caen
function llorarMudo(k, t, { cara = "llora" } = {}) { quieto(k, t); const s = _sc(k), Y = _hombro(k), j = Math.sin(t * 19 + (k.idx || 0)) * .5 + Math.sin(t * 7.3) * .5;
  cadera(k, (k.encorvado || 0) + .12); k.head.rotation.x = .32 - (k.encorvado || 0) * .4 + .03 * j; k.body.rotation.z += .015 * j; k.armL.position.y = k._p0.armY + .02 * j; k.armR.position.y = k._p0.armY - .02 * j;
  apuntar(k, k.armR, bocaW(k, .2).add(new THREE.Vector3(0, -.15 * s, 0))); apuntar(k, k.armL, bW(k, .2, Y - .75, k._forma.torso[2] / 2 + .2));
  if (cara) setFace(k, cara); lagrimas(k, t) }
// asentir(k, t, { vel, fuerza }): asiente con la cabeza («sí» sin decirlo)
function asentir(k, t, { vel = 1, fuerza = 1 } = {}) { quieto(k, t); const n = Math.max(0, Math.sin(t * vel * Math.PI * 2 * .9)); k.head.rotation.x += .06 + fuerza * .3 * n; k.body.position.y -= .01 * n * _sc(k); parpadeo(k, t) }
// empujarRopero(k, u, { pasos }): empuja con las dos manos estiradas (la cara de atrás del ropero a ≈ .95·s adelante del k.g), muy inclinado,
// pasitos cortos (pasos = cuántos pasos en todo u). La escena corre k.g y el ropero juntos.
function empujarRopero(k, u = 1, { pasos = 3 } = {}) { const t = k._t ?? 0, s = _sc(k), Y = _hombro(k), f = u * pasos * Math.PI * 2, sw = Math.sin(f); quieto(k, t);
  cadera(k, .5 + .03 * Math.sin(f * 2), .12); k.legL.rotation.x += .32 * sw + .1; k.legR.rotation.x += -.32 * sw + .1; k.body.position.y -= .03 * s * Math.abs(sw);
  for (const [arm, sx] of [[k.armL, -1], [k.armR, 1]]) apuntar(k, arm, bW(k, sx * .3, Y + .6, 1.3)); k.head.rotation.x = -.35; parpadeo(k, t) }
// tocarCampana(k, t, { periodo, cuerda, alto }): tira de la cuerda de la campana con las dos manos (una arriba de la otra): baja de golpe (agachándose)
// y deja que la cuerda lo levante. Dibuja la cuerda (de .7 m debajo de las manos hasta `alto` m arriba). Devuelve el tirón 0..1 (1 = abajo del todo).
function tocarCampana(k, t, { periodo = 2.4, cuerda = true, alto = 8 } = {}) { quieto(k, t); const s = _sc(k), Y = _hombro(k), c = ((t / periodo) % 1 + 1) % 1, p = c < .35 ? _suave(c / .35) : 1 - _suave((c - .35) / .65);
  cadera(k, .12 * p, -.18 * p); const hy = lerp(Y + .95, Y + .05, p); apuntar(k, k.armR, gW(k, .02 * s, (hy + .2) * s, .55 * s)); apuntar(k, k.armL, gW(k, -.02 * s, (hy - .05) * s, .57 * s));
  k.head.rotation.x = -.45 + .3 * p; k.g.updateMatrixWorld(true);
  if (cuerda) { const a = k.handR.getWorldPosition(new THREE.Vector3()), b = k.handL.getWorldPosition(new THREE.Vector3()), m = a.clone().lerp(b, .5); estirarEl(EL_CUERDA, m.clone().add(new THREE.Vector3(0, alto, 0)), m.clone().add(new THREE.Vector3(.03 * Math.sin(t * 3), -.7 * s, 0))) }
  parpadeo(k, t); return p }
// colgarAbrigo(k, u, { tipo, gancho }): levanta el abrigo (desplegado, colgando de la mano derecha) hasta el gancho y lo deja; desde u = .75 queda
// colgado (abrigoColgado) y el brazo baja. gancho = Vector3 del mundo (por defecto, adelante y arriba al alcance de la mano).
function colgarAbrigo(k, u = 1, { tipo = "tib", gancho = null } = {}) { const t = k._t ?? 0, s = _sc(k), Y = _hombro(k); quieto(k, t);
  const G = gancho ? gancho.clone() : gW(k, .3 * s, (Y + .72) * s, .42 * s), rest = gW(k, (k._p0.armX + .25) * s, .2 * s, .25 * s), a = _suave(u / .6), b = _suave((u - .75) / .25);
  apuntar(k, k.armR, u < .75 ? rest.clone().lerp(G, a) : G.clone().lerp(rest, b)); k.head.rotation.x = -.35 * (u < .75 ? a : 1 - b); cadera(k, -.05 * a);
  k.g.updateMatrixWorld(true);
  if (u < .75) { const A = abrigoProp(tipo, "mano"), hm = k.handR.getWorldPosition(new THREE.Vector3()); enMundo(A, hm.lerp(G, _suave((u - .5) / .25)), k.g.rotation.y); A.scale.setScalar(1) }
  else abrigoColgado(tipo, G, k.g.rotation.y);
  parpadeo(k, t) }
// lista(k, on, { leer }): el papel con los nombres en las dos manos, delante del pecho; leer = cabeza gacha leyendo (el texto mira al personaje:
// se lee por encima del hombro; de frente se ve el dorso).
function lista(k, on = true, { leer = true } = {}) { if (!on) return null; const s = _sc(k), Y = _hombro(k), td = k._forma.torso[2];
  if (EL_LISTA.parent !== k.body) k.body.add(EL_LISTA); EL_LISTA.visible = true; EL_LISTA.position.set(0, Y - .3, td / 2 + .5); EL_LISTA.rotation.set(-2.6, 0, Math.PI); EL_LISTA.scale.setScalar(1);
  for (const [arm, sx] of [[k.armL, -1], [k.armR, 1]]) apuntar(k, arm, bW(k, sx * .3, Y - .62, td / 2 + .4)); if (leer) { k.head.rotation.x = .42; k.head.rotation.y = 0 } return EL_LISTA }
// saludarBuenasNoches(k, t, { hablar }): Tib dice «goodnight»: la mano derecha saluda chiquito a la altura de la cara, cabeza ladeada,
// la boca alterna «habla» / «warm» (hablar = false: no toca la cara)
function saludarBuenasNoches(k, t, { hablar = true } = {}) { quieto(k, t); const w = Math.sin(t * Math.PI * 2 * 2.2);
  k.armR.rotation.set(-2.35, 0, .35 + .28 * w); k.head.rotation.z = .14 + .03 * w; k.head.rotation.x = .05; k.body.rotation.z = -.02 * w;
  if (hablar) setFace(k, Math.floor(t / .38) % 2 ? "warm" : "habla"); parpadeo(k, t) }
// escuchar(k, t): la oreja contra la puerta (la puerta es un plano ≈ .5·s adelante del k.g): inclinado, la cabeza girada de costado,
// las dos manos apoyadas en la puerta arriba; respira cortito
function escuchar(k, t) { quieto(k, t); const s = _sc(k), Y = _hombro(k), r = .01 * Math.sin(t * 4.2);
  cadera(k, .2 + r); k.head.rotation.set(.05, 1.25, .12); k.head.position.x = -.08;
  for (const [arm, sx] of [[k.armL, -1], [k.armR, 1]]) apuntar(k, arm, gW(k, sx * (k._p0.armX + .45) * s, (Y + .55) * s, .55 * s)); parpadeo(k, t) }
// asustado(k, t, { u, cara }): encogido de miedo: hombros arriba, las manos juntas en el pecho/mentón, un paso atrás, tiembla
function asustado(k, t, { u = 1, cara = "terror" } = {}) { quieto(k, t); const e = _suave(u), s = _sc(k), Y = _hombro(k), j = .02 * Math.sin(t * 33 + (k.idx || 0)) * e;
  cadera(k, (k.encorvado || 0) + .1 * e); k.legL.rotation.x += -.25 * e; k.legR.rotation.x += .15 * e; k.head.rotation.x += .1 * e; k.head.rotation.z = j;
  k.armL.position.y = k.armR.position.y = k._p0.armY + .06 * e; for (const [arm, sx] of [[k.armL, -1], [k.armR, 1]]) apuntar(k, arm, gW(k, (sx * k._p0.armX * (1 - e) + sx * .12 * e + j) * s, lerp(0, Y + .1, e) * s, .55 * e * s));
  if (cara && u > .25) setFace(k, cara); parpadeo(k, t) }
// salirVentana(k, u, { alto, fondo }): sale por la ventana de atrás. El alféizar está a `alto` m del piso y `fondo` m adelante (mundo, sin escala).
// u 0→.3 sube la pierna derecha al alféizar con las manos apoyadas · .3→.6 se sube agachado · .6→1 pasa y cae del otro lado (parado, ≈ 1,5·s adelante).
function salirVentana(k, u = 1, { alto = 1, fondo = .55 } = {}) { const t = k._t ?? 0, s = _sc(k), Y = _hombro(k), pl = HC(k); quieto(k, t);
  const a = _suave(u / .3), b = _suave((u - .3) / .3), c = _suave((u - .6) / .4);
  if (u < .3) { cadera(k, .25 * a); k.legR.rotation.x = -1.45 * a; k.body.position.y += .05 * a * s;
    for (const [arm, sx] of [[k.armL, -1], [k.armR, 1]]) apuntar(k, arm, gW(k, sx * (k._p0.armX + .2 * a) * s, lerp(.3 * s, alto, a), lerp(.1 * s, fondo, a))) }
  else if (u < .6) { const y0 = alto - .64 * pl * s, z0 = fondo - .6 * pl * s; cadera(k, lerp(.25, .7, b)); k.legL.rotation.x += lerp(0, -1.3, b); k.legR.rotation.x += lerp(-1.45, -1.3, b);
    k.body.position.y += lerp(.05 * s, y0, b); k.body.position.z += lerp(0, z0, b); for (const [arm, sx] of [[k.armL, -1], [k.armR, 1]]) apuntar(k, arm, gW(k, sx * (k._p0.armX + .2) * s, alto, fondo + .05)) }
  else { const y0 = alto - .64 * pl * s, z0 = fondo - .6 * pl * s, zF = fondo + .9 * s; cadera(k, lerp(.7, 0, c)); k.legL.rotation.x += lerp(-1.3, 0, c); k.legR.rotation.x += lerp(-1.3, 0, c);
    k.body.position.y += lerp(y0, 0, c) + .25 * s * Math.sin(Math.PI * c); k.body.position.z += lerp(z0, zF, c);
    k.armL.rotation.set(-1.4 * (1 - c) - .3, 0, -AB(k) - .5 * Math.sin(Math.PI * c)); k.armR.rotation.set(-1.4 * (1 - c) - .3, 0, AB(k) + .5 * Math.sin(Math.PI * c)) }
  k.head.rotation.x = u < .6 ? .2 : .1; parpadeo(k, t) }

// ================= (vacío) El Mister Sallow «realista» del video anterior ya no existe: Father Crane es un personaje de bloques del elenco
// (CRANE en _elenco_tej.js). Queda este stub `sallowR` con los mismos métodos, vacíos, para que las escenas viejas sigan armando.
const sallowR = (() => { const g = new THREE.Group(); g.name = "sallowR"; g.visible = false; scene.add(g); const nada = () => { };
  return { g, PASO: 1, poner: nada, ocultar: nada, quieto: nada, andar: nada, ladear: nada, inclinarse: nada, frasco: nada, martillo: nada, golpe: nada, caer: nada, aura: nada, climas: nada,
    headW: () => g.position.clone(), ojoW: () => g.position.clone(), ojoCam: () => g.position.toArray(), caraCam: () => g.position.toArray() } })();

//@@LUGAR
// «Nobody Answers The Knock» — escenas. La cámara son RUTAS (skill «Cámara con movimientos reales»): cada ruta es un viaje
// con paradas que se acerca a lo que se nombra y sigue; entre rutas hay corte (cambio de lugar).
const LUGAR = L => RUTA_DE[L] ?? 0;
const PISO = (x, z) => sueloT(x, z);
const ponerP = (k, x, z, ry = 0) => { k.g.visible = true; k.g.position.set(x, PISO(x, z), z); k.g.rotation.set(0, ry, 0) };
const adentro = (k, x, z, ry = 0) => { ponerP(k, x, z, ry); k.g.position.y = .21 };
const enAire = (k, p, ry = 0) => { k.g.visible = true; k.g.position.set(p[0], p[1], p[2]); k.g.rotation.set(0, ry, 0) };
const ryA = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);
const P2 = a => a.length === 3 ? [a[0], a[2]] : a;

//@@SHOTS
let t_ = 0;
// ---- puntos del mundo (de los informes del pueblo y de la criatura)
const FAMP = { puerta: [-6.45, 1.9, 12.85], afuera: [-5.3, 0, 12.85], ropero: [-7.15, 12.85], ventana: [-13.5, 14], callejon: [-15.9, 0, 14], mesa: [-10.2, 14.3], cama: [-13.1, 16.55], hogar: [-9.9, 11.5] };
const TJ_FAM = [-.6, 12.85, -Math.PI / 2];                       // la Tejedora frente a la puerta de la familia, mirando al oeste
const TALL = { mesa: [11.6, 1.2], perchero: [11.9, -2.8], ME: [11.6, 2.95] };
const CRN = { puerta: [16.8, .5, -75], picaporte: [17.1, 1.0, -74.9], gancho: [17.9, 1.86, -74.8] };
const MRG = { puerta: [-6.45, 1.9, -32.45] };
const IGL = { cuerda: [.7, -74.5], campana: [0, 12.7, -73.6] };
const POSTE = [86, 20, -30];
const CAIDA = [-2.2, 15.5];
const HD = (k, dy = -.2) => () => add(headW(k).toArray(), [0, dy, 0]);
// frente de la cara de k: a d m, girado ang alrededor, dy arriba
const FRC = (k, d = 2.2, ang = 0, dy = .1) => () => { const h = headW(k), a = k.g.rotation.y + ang; return [h.x + Math.sin(a) * d, h.y + dy, h.z + Math.cos(a) * d] };
const TCAB = (o = [0, 0, 0]) => () => add(TEJEDORA.cabezaW(), o);
const TPECHO = (o = [0, 0, 0]) => () => add(TEJEDORA.pechoW(), o);
const TW = (n, w = 0) => () => w ? wt(I[n], w) - .15 : S[I[n]] + .001;
const PA = (n, w, p, l, f = 55, o = {}) => ({ t: TW(n, w), p, l, f, _n: n, ...o });
// ---- las rutas (una por lugar; dentro de cada una, paradas en las palabras)
const RUTAS = [
  // 1 · la puerta de la familia esta noche: la Tejedora agachada golpea
  [PA("open", 0, [4, 1.2, 34], TCAB([0, -7, 0]), 62), PA("open", 4, [4, 1.5, 22], [-4, 5, 13], 62, { h: .5 }), PA("open", 8, [2, 1.5, 20], [-5.4, 3.5, 12.85], 60, { h: .6 })],
  // 2 · del cielo al pueblo, baja hasta el botón y después recorre las puertas de la calle
  [PA("rule", 0, [0, 30, 70], [0, 2, 0], 52), PA("rule", 5, [6, 26, 52], [0, 6, 0], 52), PA("cost", 0, [10, 21, 30], TCAB(), 46, { h: .4 }), PA("cost", 5, TJ_C(9), TCAB(), 40, { h: .5 }),
   PA("mystery", 0, [-2.6, 2.4, 34], [-6.5, 1.3, 30], 52), PA("mystery", 5, [-3, 1.6, 24.5], [-6.5, 1.2, 20], 50, { h: .5 })],
  // 3 · la plaza: más alta que la iglesia; los brazos de percha; el botón
  [PA("tall", 0, [-6, 1.3, -32], TCAB([0, -10, 0]), 64), PA("tall", 4, [-1, 1.4, -37], TCAB([0, -8, 0]), 62), PA("arms", 0, () => add(TEJEDORA.ganchoW(), [5, -3, 9]), () => TEJEDORA.ganchoW(), 52, { h: .5 }), PA("arms", 6, TJ_C(10), TCAB(), 44, { h: .6 })],
  // 4 · golpea la puerta de Marga
  [PA("voices", 0, [4.5, 1.5, -14], TCAB([0, -8, 0]), 62), PA("voices", 5, [1.5, 2.2, -26], [-6.4, 1.9, -32.45], 54, { h: .5 }), PA("voices", 13, [3.5, 1.5, -24], [-5.4, 4, -32.45], 60, { h: .6 })],
  // 5 · los picaportes arrancados
  [PA("handles", 0, [-2.6, 1.4, 16.2], [-6.45, 1.1, 12.85], 46), PA("handles", 5, [-4.5, 1.2, 13.9], [-6.45, 1.05, 12.85], 38, { h: .6 })],
  // 6 · el ropero contra la puerta
  [PA("wardrobe", 0, [-8.8, 2.2, 16.4], [-7.8, 1.5, 12.9], 60), PA("wardrobe", 6, [-8.6, 2.1, 15.8], [-7.7, 1.6, 12.9], 56, { h: .5 })],
  // 7 · la boda: asienten
  [PA("wed", 0, [4, 2.4, -47], [0, 1.6, -59], 54), PA("wed", 8, [3.2, 2.2, -52], [0, 1.5, -58.8], 52, { h: .6 })],
  // 8 · Tib y el coro; las buenas noches
  [PA("choir", 0, [-10.5, 1.7, 16.5], () => add(headW(TIB).toArray(), [0, -.3, 0]), 52), PA("choir", 8, FRC2("TIB", 1.6, .5, .2), HD2("TIB"), 46, { h: .5 }),
   PA("goodnight", 0, [-9.6, 2.1, 14.2], HD2("TIB"), 54), PA("goodnight", 7, [-9.2, 1.9, 14.2], HD2("TIB"), 52, { h: .5 })],
  // 9 · el taller: cose; los agujeros
  [PA("tailor", 0, [14.6, 1.9, -2.6], [10, 1.1, 1.6], 58), PA("tailor", 3, FRC2("ME", 2.8, .9, .4), HD2("ME"), 52, { h: .4 }), PA("sew", 0, () => add(TALL_MESA(), [.9, .7, -1]), TALL_MESA, 42, { h: .6 }), PA("sew", 7, () => add(headW(ME).toArray(), [.9, 1.0, 1.1]), TALL_MESA, 50)],
  // 10 · la colina: se lleva el abrigo
  [PA("anyway", 0, [94, 21.2, -21], TCAB([0, -8, 0]), 60), PA("anyway", 4, [92, 21.4, -24], () => add(POSTE, [0, 2.7, 0]), 50, { h: .5 })],
  // 11 · Marga en su puerta
  [PA("marga", 0, [-1.2, 1.8, -27], HD2("MARGA"), 52), PA("marga", 8, FRC2("MARGA", 1.8, .4, .1), HD2("MARGA"), 46, { h: .5 })],
  // 12 · Marga le enseña a coser con las manos
  [PA("hands", 0, [14, 1.9, -1.4], () => add(headW(MARGA).toArray(), [-.6, -.4, 0]), 54), PA("hands", 6, FRC2("MARGA", 2.6, -.5, -.3), HD2("MARGA", -.6), 52, { h: .5 })],
  // 13 · Crane toca la campana (sube por la cuerda hasta la campana)
  [PA("crane", 0, [3.4, 1.6, -63.4], HD2("CRANE"), 54), PA("crane", 6, [3.6, 5, -62.6], [0, 8, -70], 58), PA("crane", 9, [3.2, 9.4, -63], IGL.campana, 50, { h: .6 })],
  // 14 · la única puerta con picaporte; Crane sonríe
  [PA("handle", 0, [16.8, 1.8, -63.5], [16.8, 1.3, -75], 52), PA("handle", 5, [16.6, 1.3, -72.4], CRN.picaporte, 44), PA("sinners", 0, FRC2("CRANE", 3.4, .3, -.5), HD2("CRANE", -.45), 50), PA("sinners", 5, FRC2("CRANE", 3.0, .1, -.3), HD2("CRANE", -.45), 46, { h: .4 })],
  // 15 · el bolsillo y la lista
  [PA("pocket", 0, FRC2("ME", 2.6, .6, .3), HD2("ME", -.5), 56), PA("pocket", 11, FRC2("ME", 2.2, .4, .4), LISTA_W, 50, { h: .6 }), PA("names", 0, () => add(LISTA_W(), [.25, .45, .35]), LISTA_W, 40), PA("owed", 0, () => add(LISTA_W(), [-.3, .4, .4]), LISTA_W, 38, { h: .6 }), PA("owed", 7, FRC2("ME", 2.4, .4, .1), HD2("ME"), 48)],
  // 16 · Crane cobra
  [PA("collect", 0, FRC2("CRANE", 3.6, -.5, -.8), HD2("CRANE", -.45), 52), PA("collect", 4, FRC2("CRANE", 3.2, -.3, -.4), HD2("CRANE", -.45), 48, { h: .5 })],
  // 17 · sigue el abrigo hasta la casa (la Tejedora camina por la calle)
  [PA("smell", 0, [4, 1.2, 24], TCAB([0, -6, 0]), 60), PA("smell", 7, [3.5, 1.4, 21], TCAB([0, -10, 0]), 62, { h: .5 })],
  // 18 · el abrigo rojo de la madre, hace dos años (recuerdo)
  [PA("red", 0, [91.5, 21.4, -32], () => add(POSTE, [0, 2.4, 0]), 52), PA("red", 8, FRC2("MAMA", 2.2, .5, .1), HD2("MAMA"), 46, { h: .5 })],
  // 19 · muda desde entonces
  [PA("mute", 0, FRC2("MAMA", 2.6, .3, -.1), HD2("MAMA", -.25), 50), PA("mute", 5, FRC2("MAMA", 2.2, .2, -.1), HD2("MAMA", -.25), 48, { h: .5 })],
  // 20 · el abrigo chico de Tib
  [PA("small", 0, FRC2("ME", 2.2, -.5, -.2), () => add(headW(ME).toArray(), [0, -.9, -.3]), 48), PA("small", 6, FRC2("ME", 2.6, -.3, -.3), () => add(headW(ME).toArray(), [0, -.8, -.3]), 50, { h: .5 })],
  // 21 · la deuda: el padre y Tib que tose
  [PA("medicine", 0, [-7.6, 1.9, 15.2], HD2("PAPA"), 56), PA("medicine", 6, FRC2("TIB", 1.7, .5, .2), HD2("TIB"), 48, { h: .5 })],
  // 22 · los cambia
  [PA("stole", 0, FRC2("ME", 2.8, -.6, .3), HD2("ME"), 50), PA("stole", 6, FRC2("ME", 2.3, -.3, .1), HD2("ME"), 46, { h: .4 })],
  // 23 · roba el abrigo de Crane del gancho
  [PA("hook", 0, [16.8, 1.8, -63.5], CRN.gancho, 52), PA("hook", 4, [17.4, 1.8, -71.9], CRN.gancho, 46, { h: .5 }), PA("hook", 9, [14.6, 1.8, -70.6], HD2("ME"), 50)],
  // 24 · la campana suena y la Tejedora camina
  [PA("bell", 0, [6, 3, -50], [0, 13, -73.6], 50), PA("bell", 3, [4, 8, -62], IGL.campana, 46, { h: .5 })],
  // 25 · no fue a lo de Crane: vino a casa
  [PA("notcrane", 0, [-9, 15, 24], [.5, 4, 2], 56), PA("notcrane", 7, [-8, 12, 20], [-1, 6, 10], 58, { h: .5 })],
  // 26 · adentro: el olor, tres golpes, «open the door», la madre, Tib
  [PA("carried", 0, [-8.5, 1.7, 13.4], HD2("ME"), 52), PA("three", 0, [-7.5, 1.9, 16.6], [-7, 1.5, 12.9], 58), PA("three", 3, [-7.4, 1.8, 15.6], FAMP.puerta, 54, { h: .6 }),
   PA("love", 0, [-7.6, 1.65, 14.4], () => add(headW(MAMA).toArray(), [0, -.35, 0]), 54), PA("beside", 2, [-7.8, 1.6, 14.2], HD2("MAMA", -.3), 50, { h: .5 }), PA("beside", 8, [-8, 1.6, 14.3], HD2("MAMA", -.3), 48)],
  [PA("tibup", 0, [-10.0, 2.1, 12.4], HD2("TIB", -.2), 60), PA("tibup", 5, [-10.2, 2, 12.9], HD2("TIB", -.2), 56, { h: .5 })],
  // 27 · sale por la ventana de atrás
  [PA("window", 0, [-17, .9, 17], [-14.2, 1.6, 14], 58), PA("window", 6, [-17.2, .8, 16.6], [-14.6, 1.8, 14], 60, { h: .5 })],
  // 28 · trepa la Tejedora, el abrigo rojo, corta los puntos, grita
  [PA("ladder", 0, () => TREPA_CAM(.15, 0), () => ME.g.getWorldPosition(new THREE.Vector3()).toArray(), 58), PA("ladder", 6, () => TREPA_CAM(.45, 0), () => ME.g.getWorldPosition(new THREE.Vector3()).toArray(), 58),
   PA("chest", 0, () => TREPA_CAM(.85, 0), TPECHO(), 52), PA("chest", 7, TPECHO_C(3.8), TPECHO(), 50, { h: .6 }),
   PA("cut", 0, TPECHO_C(3.6), TPECHO(), 50), PA("cut", 5, TPECHO_C(4), () => add(TEJEDORA.pechoW(), [0, .3, 0]), 52, { h: .5 }),
   PA("scream", 0, [4, 2, 34], TCAB([0, -5, 0]), 64), PA("scream", 4, [3.4, 1.6, 27], TCAB([0, -2, 0]), 60, { h: .4 })],
  // 29 · el abrigo rojo cae a la calle; la madre lo levanta y tose
  [PA("fell", 0, [3, 4, 21], () => ROJO_W(), 54), PA("fell", 7, () => add([CAIDA[0], 0, CAIDA[1]], [-2.2, 1.7, -2]), () => add(headW(MAMA).toArray(), [0, -.3, 0]), 54, { h: .6 })],
  // 30 · camina hasta la única puerta con picaporte
  [PA("walked", 0, [3, 1.3, 30], TCAB([0, -8, 0]), 60), PA("walked", 6, [2.5, 1.6, 22], TCAB([0, -6, 0]), 62, { h: .4 })],
  // 31 · no necesitó golpear
  [PA("noknock", 0, [8, 4, -56], [16.8, 3, -73], 52), PA("noknock", 3, [10, 3, -60], [16.8, 1.6, -74], 48, { h: .6 }), PA("noknock", 5, [10.5, 3.4, -59], [14, 60, -100], 60, { h: .2 })],
  // 32 · a la mañana, la puerta de Crane abierta
  [PA("morning", 0, [10.5, 3.4, -59], [14, 60, -100], 60), PA("morning", 2, [10, 2.4, -60], [16.8, 1.4, -75], 52), PA("morning", 7, [16.8, 2.2, -62], [16.8, 1.3, -75.5], 50, { h: .5 })],
  // 33 · ahora golpea con la voz de Crane, leyendo nombres
  [PA("readnames", 0, [14, 22, 30], TCAB([0, -14, 0]), 50), PA("readnames", 7, [3, 1.6, 6], TCAB([0, -8, 0]), 62, { h: .4 })],
  // 34 · esta noche: buenas noches cinco veces, y alguien contesta
  [PA("tonightend", 0, [-10.6, 1.8, 16.8], HD2("TIB"), 54), PA("tonightend", 5, FRC2("TIB", 1.7, .5, .2), HD2("TIB"), 46, { h: .4 }),
   PA("end", 0, [-11.6, 2.05, 12.5], [-12.2, 2.0, 15.9], 60), PA("end", 5, [-11.7, 2.0, 13.1], [-12.1, 2.0, 15.8], 56, { h: .5 })],
];
function TJ_C(d) { return () => TEJEDORA.caraCam(d, .35, -1.5) }
function TPECHO_C(d) { return () => TEJEDORA.pechoCam(d, .45, .2) }
function TALL_MESA() { return [TALL.mesa[0], 1.2, TALL.mesa[1]] }
function LISTA_W() { return add(headW(ME).toArray(), [-.05, -.75, -.45]) }
function ROJO_W() { return TEJEDORA.ROJO.getWorldPosition(new THREE.Vector3()).toArray() }
function TREPA_CAM(u, d) { const q = TEJEDORA.trepaPunto(u); return [q.p[0] + q.n[0] * 5 - 3, q.p[1] - 1.5, q.p[2] + q.n[2] * 5 + 5] }
function FRC2(nom, d, ang, dy) { return () => FRC(EL[nom], d, ang, dy)() }
function HD2(nom, dy = -.2) { return () => HD(EL[nom], dy)() }
const EL = { ME, TIB, MAMA, PAPA, MARGA, CRANE };
// ruta de cada frase (para el corte entre lugares y para la hoja de tomas)
const RUTA_DE = {};
ORDEN.forEach((n, L) => { RUTAS.forEach((R, i) => { if (R.some(p => p._n === n)) RUTA_DE[L] = i }) });
// una toma por frase (la hoja de tomas saca un cuadro del medio de cada frase; la cámara real la dan las rutas)
const SHOTS = Object.fromEntries(ORDEN.map((n, i) => [i, [sh(0, [0, 10, 40], [0, 10, 40], [0, 0, 0], null, 50)]]));

//@@ESCENA
const QS = new URLSearchParams(location.search), VISTA = QS.get("vista") ? QS.get("vista").split(",").map(Number) : null;
let ENV_OK = false;
window.MAPA = () => RECTS.map(R => [R.x, R.z, R.w, R.d, R.ry || 0]);
const LUG = {
  open: "calle", rule: "calle", cost: "calle", mystery: "calle", tall: "calle", arms: "calle", voices: "calle", handles: "niebla", wardrobe: "casa", wed: "calleSin",
  choir: "casa", goodnight: "casa", tailor: "casa", sew: "casa", anyway: "calle", marga: "niebla", hands: "casa", crane: "casa", handle: "niebla", sinners: "niebla",
  pocket: "casa", names: "casa", owed: "casa", collect: "niebla", smell: "calle", red: "recuerdo", mute: "casa", small: "casa", medicine: "casa", stole: "casa",
  hook: "niebla", bell: "calleSin", notcrane: "calle", carried: "casa", three: "casa", love: "casa", beside: "casa", tibup: "casa", window: "calle", ladder: "calle",
  chest: "calle", cut: "calle", scream: "calle", fell: "calle", walked: "calle", noknock: "calle", morning: "dia", readnames: "calle", tonightend: "casa", end: "casa" };
function setScene(t) {
  t_ = t; POST = { flash: 0, sepia: 0 };
  if (!ENV_OK) { Object.assign(ENV, ENV_HOLLOW); TEJEDORA.climas(); ENV_OK = true }
  const L = lineAt(t), N = ORDEN[L], lt = t - s(L), len = (S[L + 1] ?? DUR) - s(L), k = P(lt, 0, len), dW = kk => wt(L, kk) - s(L);
  mundoReset(); utileriaReset(); lejosReset(); TEJEDORA.ocultar(); if (typeof sallowR !== "undefined") sallowR.ocultar(); TEMBLOR = 0;
  ALL.forEach(c => { c.g.visible = false; pose(c, t, {}); quieto(c, t); setFace(c, "neutral") });
  abrigoRojo(MAMA, false); abrigoPuesto(CRANE, null); abrigoEnMano(ME, null); lista(ME, false); muneco(TIB, null);   // lo persistente se limpia cada cuadro (los cuadros se renderizan desordenados)
  const lug = LUG[N] || "calle";
  if (!ENV.interiorLuz) ENV.interiorLuz = { ...ENV.interior, hemi: .55, hemiG: "#4a3220", exp: 2.45 };
  const MIEDO_IN = ["carried", "three", "love", "beside", "tibup"].includes(N);
  let envN = QS.get("env") || ({ calle: "tejedora", calleSin: "noche", niebla: "nocheNiebla", casa: MIEDO_IN ? "interior" : "interiorLuz", recuerdo: "noche", dia: "amanecer" })[lug];
  if (N === "morning" && lt < 1.6) { const u = eIO(P(lt, .2, 1.5)), A = ENV.noche, B = ENV.amanecer, M = {}; for (const kk in B) { const a = A[kk], b = B[kk]; M[kk] = typeof b === "number" && typeof a === "number" ? lerp(a, b, u) : typeof b === "string" && typeof a === "string" && b[0] === "#" ? "#" + new THREE.Color(a).lerp(new THREE.Color(b), u).getHexString() : Array.isArray(b) && Array.isArray(a) && typeof b[0] === "number" ? b.map((v, i) => lerp(a[i], v, u)) : u < .5 ? a ?? b : b } ENV._mezcla = M; envN = "_mezcla" }
  setEnv(envN); ambiente(t);
  if (lug === "recuerdo") POST.sepia = .55;
  const V = VECINOS, mira = (c, x, z, tx, tz, cara) => { ponerP(c, x, z, ryA(x, z, tx, tz)); if (cara) setFace(c, cara) };
  const den = (c, x, z, tx, tz, cara) => { adentro(c, x, z, ryA(x, z, tx, tz)); if (cara) setFace(c, cara) };
  const teje = (x, z, ry) => { TEJEDORA.poner(x, PISO(x, z), z, ry); TEJEDORA.quieto(t) };
  const tejeFam = () => teje(TJ_FAM[0], TJ_FAM[1], TJ_FAM[2]);
  const camina = (x, z0, vel, ry) => { const z = z0 + vel * lt * (Math.abs(ry) > 1.5 ? -1 : 1); TEJEDORA.poner(x, PISO(x, z), z, ry); TEJEDORA.caminar(t, vel) };
  const familia = (cara) => { den(ME, -10.2, 12.6, -6.6, 12.9, cara || "terror"); den(MAMA, -9.9, 14.5, -6.6, 12.9, "tristeMudo"); den(TIB, -10.9, 13.9, -6.6, 12.9, "miedo"); den(PAPA, -10.8, 15.6, -6.6, 12.9, "terror") };
  const taller = (cara = "concentrado") => { ponerP(ME, TALL.ME[0], TALL.ME[1], Math.PI); setFace(ME, cara) };
  switch (N) {
    case "open": tejeFam(); TEJEDORA.golpear(t, P(lt, .2, len), FAMP.puerta); TEMBLOR = .02 * TEJEDORA.golpeFuerza(P(lt, .2, len)); break;
    case "rule": case "cost": case "mystery": tejeFam(); if (N === "cost") TEJEDORA.mirar(cam.position.toArray(), .8); break;
    case "tall": case "arms": teje(7, -60, -.3); TEJEDORA.mirar([-5, 1.5, -36], .6); V.slice(0, 4).forEach((c, i) => mira(c, -5 + i * 1.4, -41 - (i % 2), 7, -60, "terror")); break;
    case "voices": teje(-.6, -32.45, -Math.PI / 2); TEJEDORA.golpear(t, P(lt, .1, len), MRG.puerta); break;
    case "handles": break;
    case "wardrobe": { const u = P(lt, 0, dW(6) + .4); roperoMover(1 - u); den(PAPA, -8.2, 12.9, -6.6, 12.9, "cansado"); empujarRopero(PAPA, u); break }
    case "wed": bodaVisible(true); { const [a0, b0] = BODA_V.novios, a = [a0[0] - .35, a0[1]], b = [b0[0] + .35, b0[1]]; mira(NOVIO, a[0], a[1], b[0], b[1], "ternura"); mira(NOVIA, b[0], b[1], a[0], a[1], "happy"); asentir(NOVIO, t); asentir(NOVIA, t + .3);
      mira(CRANE, BODA_V.cura[0], BODA_V.cura[1], 0, -50, "sonrisaFalsa"); [[-6, -56], [-4.6, -55.2], [-6.2, -57.6], [5.2, -56.4], [6.4, -57.8], [4.6, -54.8]].forEach(([x, z], i) => mira(V[i], x, z, 0, -59, "warm")) } break;
    case "choir": den(TIB, -12.4, 15.9, -9.4, 15.6, "habla"); muneco(TIB, "mano"); break;
    case "goodnight": den(TIB, -12.4, 15.9, -9.4, 14.4, "ternura"); saludarBuenasNoches(TIB, t); muneco(TIB, "abrazo"); den(MAMA, -13.3, 14.3, -12.4, 15.9, "tristeMudo"); break;
    case "tailor": taller(); break;
    case "sew": taller(); coser(ME, t); break;
    case "anyway": { abrigoEnPoste(lt < dW(4) ? "gris" : null); teje(POSTE[0] - 5, POSTE[2] - 4, ryA(POSTE[0] - 5, POSTE[2] - 4, POSTE[0], POSTE[2])); TEJEDORA.agacharse(.4, add(POSTE, [0, 2.7, 0])); break }
    case "marga": mira(MARGA, -5, -32.2, 0, -27, "sad"); break;
    case "hands": taller(); coser(ME, t); ponerP(MARGA, 9.6, 2, ryA(9.6, 2, TALL.ME[0], TALL.ME[1])); setFace(MARGA, "ternura"); hablarManos(MARGA, t); break;
    case "crane": ponerP(CRANE, .9, -68.4, Math.PI * .1); setFace(CRANE, "crane"); campanaToca(.8 * tocarCampana(CRANE, t, { alto: 9 }) - .4); break;
    case "handle": mira(CRANE, 16.8, -73.6, 16.8, -60, "sonrisaFalsa"); CRANE.g.visible = false; break;   // escondido: la ruta ya apunta a su cara para la frase siguiente
    case "sinners": { const u = N === "sinners" ? P(lt, 0, 1.3) : 1; puertaAbrir("crane", Math.min(1, u * 1.6)); const z = -75.8 + 2.2 * eIO(P(u, .3, 1)); mira(CRANE, 16.8, z, 16.8, -60, "sonrisaFalsa"); if (u < 1) andar(CRANE, t); break }
    case "collect": puertaAbrir("crane", 1); mira(CRANE, 16.8, -73.6, 16.8, -60, "desprecio"); break;
    case "pocket": case "names": case "owed": taller(N === "owed" ? "horrified" : "concentrado"); lista(ME, true); break;
    case "smell": camina(.5, -12, 2.6, 0); break;
    case "red": abrigoEnPoste("rojo"); mira(MAMA, POSTE[0] + 3, POSTE[2] + 3.4, POSTE[0], POSTE[2], "tristeMudo"); break;
    case "mute": den(MAMA, -11.6, 15.6, -9.6, 14, "tristeMudo"); break;
    case "small": taller("horrified"); abrigoEnMano(ME, "tib", { doblado: false }); break;
    case "medicine": den(PAPA, -9.4, 13.4, -12.4, 15.9, "cansado"); den(TIB, -12.4, 15.9, -9.4, 13.4, "tos"); toser(TIB, t); break;
    case "stole": taller("determined"); cortarTijera(ME, t); break;
    case "hook": { abrigoEnGancho(lt < dW(4)); ponerP(ME, 15.8, -73.4, ryA(15.8, -73.4, 17.9, -74.8)); setFace(ME, "scared"); if (lt > dW(4)) abrigoEnMano(ME, "crane") } break;
    case "bell": campanaToca(.9 * Math.sin(t * 2.6)); break;
    case "notcrane": camina(.5, -6, 2.6, 0); break;
    case "carried": familia("horrified"); break;
    case "three": { familia(); const f = Math.max(...[.2, .55, .9].map(g => Math.exp(-(((k - g) / .04) ** 2)))); TEMBLOR = .015 * f; roperoMover(0); break }
    case "love": case "beside": familia(); setFace(MAMA, N === "beside" || lt > dW(3) ? "llora" : "tristeMudo"); break;
    case "tibup": den(TIB, -11.6, 15.2, -10, 12.4, "miedo"); den(ME, -10.2, 12.6, -6.6, 12.9, "terror"); taparBoca(ME, TIB, P(lt, dW(5) - .3, dW(7))); den(MAMA, -11.8, 16.2, -6.6, 12.9, "llora"); break;
    case "window": { puertaAbrir("ventanaAtras", 1); adentro(ME, FAMP.ventana[0] - .3, FAMP.ventana[1], -Math.PI / 2); salirVentana(ME, P(lt, 0, dW(6))); setFace(ME, "determined"); tejeFam(); break }
    case "ladder": case "chest": case "cut": case "scream": { tejeFam(); const PAS = .9, tirones = kk => { const n = Math.floor(kk), f = kk - n; return n + eIO(P(f, .45, 1)) };   // agarra, tira, apoya: sube a tirones
      const u = N === "ladder" ? .1 + .5 * tirones(lt / PAS) / Math.max(1, len / PAS) : N === "chest" ? .6 + .4 * tirones(lt / PAS) / Math.max(1, len / PAS) : 1; const q = TEJEDORA.trepaPunto(Math.min(1, u));
      enAire(ME, [q.p[0] + q.n[0] * .8, q.p[1] - 1.2, q.p[2] + q.n[2] * .8], Math.atan2(-q.n[0], -q.n[2])); trepar(ME, t, { vel: N === "cut" || N === "scream" ? 0 : 1 / PAS });
      setFace(ME, N === "cut" ? "determined" : N === "scream" ? "terror" : "esfuerzo");
      if (N === "cut") { cortarTijera(ME, t, { sobre: true }); TEJEDORA.cortarPuntos(P(lt, 0, len)) } else if (N === "scream") { TEJEDORA.cortarPuntos(1); TEJEDORA.gritar(t, P(lt, 0, .6)); TEMBLOR = .03 } break }
    case "fell": { tejeFam(); TEJEDORA.gritar(t, 1 - P(lt, 0, 1)); const u = P(lt, 0, dW(6)); if (u < 1) TEJEDORA.abrigoRojoCae(u, [CAIDA[0], PISO(...CAIDA), CAIDA[1]]); else { TEJEDORA.ROJO.visible = false; levantarAbrigo(MAMA, P(lt, dW(6), dW(9)), { tipo: "rojo" }) }
      mira(MAMA, CAIDA[0] + .9, CAIDA[1] + .5, CAIDA[0], CAIDA[1], lt > dW(11) ? "tos" : "llora"); if (lt > dW(11)) toser(MAMA, t); break }
    case "walked": camina(.5, 10, 2.6, Math.PI); break;
    case "noknock": { setEnv("noche"); ambiente(t); teje(16.8, -67.4, Math.PI); const a = TEJEDORA.abrirPuerta(P(lt, .1, len), CRN.picaporte); puertaAbrir("crane", a); break }
    case "morning": puertaAbrir("crane", 1); abrigoEnGancho(false); [[13.6, -70], [15.4, -70.4], [18.4, -70], [20, -69.6]].forEach(([x, z], i) => mira(V[i], x, z, 16.8, -75, i % 2 ? "scared" : "worried")); break;
    case "readnames": teje(-.6, -10, -Math.PI / 2); TEJEDORA.golpear(t, P(lt, 0, len), [-6.45, 1.9, -10]); break;
    case "tonightend": den(TIB, -12.6, 16.2, -9.4, 15.4, "ternura"); saludarBuenasNoches(TIB, t); den(MAMA, -10.2, 15.6, -12.6, 16.2, "tristeMudo"); abrigoRojo(MAMA, true); break;
    case "end": den(TIB, -12.7, 16.3, -11.6, 12.4, lt > dW(4) ? "happy" : "ternura"); den(MAMA, -11.7, 15.6, -11.6, 12.4, lt > dW(4) ? "habla" : "ternura"); abrigoRojo(MAMA, true); break;
  }
  const hayTeje = ["open", "rule", "cost", "mystery", "tall", "arms", "voices", "anyway", "smell", "notcrane", "window", "ladder", "chest", "cut", "scream", "fell", "walked", "noknock", "readnames"].includes(N);
  if (hayTeje) TEJEDORA.aura(true, 1);
  lejos(t);
  if (VISTA) { cam.position.set(VISTA[0], VISTA[1], VISTA[2]); cam.lookAt(VISTA[3], VISTA[4], VISTA[5]); cam.fov = VISTA[6] || 50; cam.updateProjectionMatrix(); lights(lucesCerca(cam.position.toArray(), 6)); POST.tapa = null; return }
  camara(t); let LX = lucesCerca(cam.position.toArray(), 6);
  if (cam.position.x > 6 && cam.position.x < 16 && cam.position.z > -4 && cam.position.z < 6) LX = LX.map(l => [l[0], l[1] * .3, l[2], l[3]]);   // el taller: la lámpara quemaba las caras
    const MIEDO_CASA = ["carried", "three", "love", "beside", "tibup"].includes(N);
  if (lug === "casa" && cam.position.x < -6) { LX = LX.slice(0, 4); const fl = 1 + .12 * Math.sin(t * 9.3) + .08 * Math.sin(t * 23.1);
    LX.push([[-9.9, .9, 12.1], (MIEDO_CASA ? 1.6 : 3.2) * fl, "#ff9a48", 9], [[-10.2, 1.55, 14.3], MIEDO_CASA ? .8 : 2, "#ffc27a", 6], [[-12.9, 1.2, 16.1], MIEDO_CASA ? .6 : 1.6, "#ffcf8a", 5]) }   // hogar, lámpara de la mesa, vela de la cama
  if (lug === "casa" && cam.position.x > 6) LX.push([[9, 2.6, 3.4], 1.8, "#ffd29a", 8], [[14.6, 2.4, -1], 1.4, "#ffc27a", 7]);   // taller: lámparas de pared
  if (N === "window") LX.push([[-15.4, 2.6, 15], 8, "#ffc480", 14], [[-13, 1.8, 14], 4, "#ffc480", 7]);
  if (lug !== "casa") R.toneMappingExposure *= 1.18;   // revisor: 10 % de negros lights(hayTeje ? TEJEDORA.luzFria(LX) : LX);
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

