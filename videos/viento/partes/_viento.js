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

// ================= GUSTHOLLOW: lo común (medidas del mundo) — lo usan el mundo, el detalle, el elenco y las escenas =================
// Norte = −z. El viento sopla SIEMPRE hacia +x (viene del oeste, −x, y se va al este, +x), hace 300 años: todo lo torcido se tuerce hacia +x.
// Al este (+x) está la cordillera que hay que cruzar volando; detrás, lejos, el valle verde sin viento.
const VDIR = [1, 0, 0];                                         // hacia dónde sopla el viento (todo se inclina/flamea hacia acá)
const PLAZA = [0, 0], TORRE = [0, -10], TORRE_H = 14;           // torre de piedra de 14 de alto, cuadrada; arriba la VELETA
const VELETA_Y = TORRE_H + 2.2;                                 // altura del eje de la veleta (Pip se cuelga de ahí)
const COLINA = [-26, 18], COLINA_H = 7;                          // la loma pelada al oeste de la torre, donde Pip remonta la cometa
const CASA_MIA = [10, 14];                                      // la casa del narrador y Pip
const PANAD = [-12, -3];                                        // la panadería (su techo sale volando hacia +x)
const SIERRA_X = 150, SIERRA_H = 70;                            // la cordillera del este: cresta en x ≈ 150, picos de ≈ 70 con nieve arriba de 45
const VALLE = [520, 0], VALLE_Y = 2;                            // el valle verde sin viento (centro), del otro lado; plano a la altura 2
// altura del piso: valle de pasto ralo casi plano en el pueblo, la loma de Pip, sierras bajas al norte/sur/oeste y la cordillera al este;
// después de la cordillera baja al valle verde (plano)
const ALT = (x, z) => {
  const sst = (a, b, v) => { const q = cl((v - a) / (b - a)); return q * q * (3 - 2 * q) };
  const loma = COLINA_H * Math.exp(-(((x - COLINA[0]) / 13) ** 2 + ((z - COLINA[1]) / 11) ** 2));
  // las lomas y los montes que rodean el valle (norte, sur y oeste): una loma pareja hasta r ≈ 140 y después montes con picos (se apagan hacia el este)
  const r = Math.hypot(x * .8, z), an = Math.atan2(z, x * .8), montes = sst(115, 235, r) * (40 + 22 * Math.sin(an * 5 + 1.3) + 13 * Math.sin(an * 11 + .4) + 8 * Math.sin(an * 23 + r * .03)) * (.72 + .28 * Math.sin(r * .043 + an * 3));
  const anillo = (34 * sst(70, 140, r) * (1 + .12 * Math.sin(an * 7 + 2)) + montes) * (1 - sst(150, 260, x));
  const sierra = SIERRA_H * Math.exp(-(((x - SIERRA_X) / 38) ** 2)) * (.75 + .25 * Math.sin(z * .021 + 1.3));
  const valle = VALLE_Y * sst(220, 330, x);
  return loma + anillo + sierra * (1 - sst(240, 330, x) * 0) + valle;
};
const placeW = (k, x, z, ry = 0) => { k.g.visible = true; k.g.position.set(x, ALT(x, z), z); k.g.rotation.set(0, ry, 0) };
const mergeG = list => { const gs = list.map(([g, m]) => { const q = g.index ? g.toNonIndexed() : g.clone(); q.applyMatrix4(m); return q }); const n = gs.reduce((a, q) => a + q.attributes.position.count, 0);
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2); let o = 0; gs.forEach(q => { pos.set(q.attributes.position.array, o * 3); nor.set(q.attributes.normal.array, o * 3); if (q.attributes.uv) uv.set(q.attributes.uv.array, o * 2); o += q.attributes.position.count });
  const G = new THREE.BufferGeometry(); G.setAttribute("position", new THREE.BufferAttribute(pos, 3)); G.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); G.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); return G };
const MZ = (p, dir, s) => new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize()), s);

// ---------- LEGADO de Dustmere (solo para que lo viejo siga armando mientras se reemplaza; BORRAR cuando nadie lo use)
const CRESTA = [0, -160], CRESTA_H = 24;                        // donde está parado Onetusk hace 60 años (sobre la cresta, a 24 de alto)
const COLMILLO_L = 20;                                          // largo del colmillo y del cuerno (el mismo: «long as three houses»)
const ESTANQUES = Array.from({ length: 11 }, (_, i) => [(i % 2 ? 1 : -1) * 6, lerp(-146, -24, i / 10)]);
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


// ================= GUSTHOLLOW: el mundo (valle alto ventoso, pueblo de piedra encadenado, torre con veleta, árboles torcidos, pasto peinado) =================
// Norte = −z. El viento sopla SIEMPRE hacia +x. Todo lo de la tortuga y del mar del motor se esconde: el piso es una malla propia (SUELO).
// Zona de este archivo: x de −460 a 100 (la malla termina en x = 100 con un faldón que baja hasta x = 104), z de −460 a 460.
// Desde x = 88 al este SUELO = ALT exacto (ahí empalma la cordillera del otro archivo).
TURT.children.forEach(o => o.visible = false);
CABEZA.visible = false; ALETAS.forEach(a => a.piv.visible = false); COLA.visible = false; COSTA.visible = false; FOAM.visible = false; FONDO.visible = false; HONDA.visible = false;
BOTES.forEach(b => b.visible = false); GAVIOTAS.forEach(g => g.visible = false); LUCES.forEach(l => l.visible = false); ESPUMA.forEach(s => s.visible = false); SALPI.forEach(s => s.visible = false);
NUBE.forEach(s => s.visible = false); ROPA3.forEach(m => m.visible = false); GALLINAS.forEach(g => g.visible = false); NUBES.forEach(g => g.visible = false);
HOUSES.forEach(H => H.g.visible = false);

// ---------- ayudantes
const sst = (a, b, x) => { const q = cl((x - a) / (b - a)); return q * q * (3 - 2 * q) };
const hash2 = (i, j) => { let n = (Math.imul(i | 0, 374761393) + Math.imul(j | 0, 668265263)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296 };
const ruido2 = (x, z) => { const i = Math.floor(x), j = Math.floor(z), u = x - i, v = z - j, a = u * u * (3 - 2 * u), b = v * v * (3 - 2 * v); return lerp(lerp(hash2(i, j), hash2(i + 1, j), a), lerp(hash2(i, j + 1), hash2(i + 1, j + 1), a), b) };
const fbm2 = (x, z, o = 4) => { let s = 0, a = .5, f = 1, n = 0; for (let k = 0; k < o; k++) { s += a * ruido2(x * f + k * 17.3, z * f - k * 9.1); n += a; a *= .5; f *= 2.03 } return s / n };
const TM = (x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, "YXZ")), new THREE.Vector3(sx, sy, sz));
// lote: junta piezas por material y las une en una sola malla por material (pocas llamadas de dibujo)
const lote = () => { const L = {}; return { L, add(k, geo, m) { (L[k] ||= []).push([geo, m || new THREE.Matrix4()]); return this },
  fin(par, mats, o = {}) { const out = {}; for (const k in L) { if (!mats[k]) throw new Error("lote sin material: " + k); const me = new THREE.Mesh(mergeG(L[k]), mats[k]); me.castShadow = o.sombra !== false; me.receiveShadow = true; par.add(me); out[k] = me } return out } } };
const linC = h => { const c = new THREE.Color(h); return [c.r, c.g, c.b] };
const mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const envuelto = (g, w, h, fn) => { for (const dx of [-w, 0, w]) for (const dy of [-h, 0, h]) { g.save(); g.translate(dx, dy); fn(); g.restore() } };
const geoPiedra = (seed, det = 1, ach = .7) => { const g = new THREE.IcosahedronGeometry(1, det), p = g.attributes.position, r = rng(seed), fx = r() * 9, fy = r() * 9; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = .72 + .5 * ruido2(x * 1.7 + fx + y, z * 1.7 + fy - y); p.setXYZ(i, x * k, y * k * ach, z * k) } g.computeVertexNormals(); return g };
const geoUV = (g, fu, fv) => { const p = g.attributes.position, u = g.attributes.uv; for (let i = 0; i < p.count; i++) u.setXY(i, fu(p.getX(i), p.getY(i), p.getZ(i)), fv(p.getX(i), p.getY(i), p.getZ(i))); return g };
// uv de muro en metros según la cara (s = metros que cubre la textura)
const uvMuro = (g, s = 3.2, ox = 0, oy = 0) => { const p = g.attributes.position, n = g.attributes.normal, u = g.attributes.uv; for (let i = 0; i < p.count; i++) { const nx = n.getX(i), ny = n.getY(i), nz = n.getZ(i); let U, V;
    if (Math.abs(ny) > .75) { U = p.getX(i) / s; V = p.getZ(i) / s } else if (Math.abs(nx) > Math.abs(nz)) { U = -p.getZ(i) / s * Math.sign(nx); V = p.getY(i) / s } else { U = p.getX(i) / s * Math.sign(nz); V = p.getY(i) / s } u.setXY(i, U + ox, V + oy) } return g };
const cilEntre = (a, b, r, seg = 7, r2 = r) => { const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b), d = Bv.clone().sub(A); return [new THREE.CylinderGeometry(r2, r, 1, seg), MZ(A.clone().add(Bv).multiplyScalar(.5), d, new THREE.Vector3(1, d.length(), 1))] };
// esquinas redondeadas para pintar piedras (polígono con curvas en cada vértice)
const redondo = (g, P, rad) => { const n = P.length; g.beginPath(); for (let i = 0; i <= n; i++) { const a = P[i % n], pv = P[(i + n - 1) % n], nx = P[(i + 1) % n], d1 = Math.hypot(pv[0] - a[0], pv[1] - a[1]) || 1, d2 = Math.hypot(nx[0] - a[0], nx[1] - a[1]) || 1, r1 = Math.min(rad, d1 / 2) / d1, r2 = Math.min(rad, d2 / 2) / d2;
    const p1 = [a[0] + (pv[0] - a[0]) * r1, a[1] + (pv[1] - a[1]) * r1], p2 = [a[0] + (nx[0] - a[0]) * r2, a[1] + (nx[1] - a[1]) * r2]; if (i === 0) g.moveTo(p2[0], p2[1]); else { g.lineTo(p1[0], p1[1]); g.quadraticCurveTo(a[0], a[1], p2[0], p2[1]) } } g.closePath() };

// ---------- el viento: uniformes que mueven pasto, copas, telas, banderines (el detalle los reutiliza)
const VIENTO = { value: 0 }, RAFAGA = { value: 1 };   // VIENTO = t; RAFAGA = fuerza (1 normal, 2 tormenta, 0 calma)
// modo "tela": uv.x = distancia al borde atado (0 → 1); "pasto": uv.y = altura (0 → 1), se dobla hacia +x; "copa": según la altura local
const conViento = (m, modo = "tela", amp = .12) => { if (modo === "tela" || modo === "toldo") m.side = THREE.DoubleSide; m.onBeforeCompile = sh => { sh.uniforms.uVt = VIENTO; sh.uniforms.uVa = RAFAGA;
  const cuerpo = modo === "tela" || modo === "toldo" ? `float w = ${modo === "toldo" ? "sin(uv.x * 3.1416) * sin(uv.y * 3.1416) * .7" : "uv.x"}; float f = sin(uVt * 12. - uv.x * 4.2 + wp.z * 1.3 + wp.x * .3) + .4 * sin(uVt * 19. - uv.x * 7.5 + wp.z * 2.3) + .18 * sin(uVt * 29. + uv.y * 5.);
      transformed += normal * f * w * ${amp.toFixed(3)} * (.25 + .75 * uVa); transformed.x -= w * w * .05 * abs(f) * uVa;`
    : modo === "pasto" ? `float hh = uv.y * uv.y; float ola = .55 + .45 * sin(uVt * 3.4 - wp.x * .32 + wp.z * .11) + .25 * sin(uVt * 7.9 - wp.x * .9 + wp.z * .7);
      transformed.x += hh * ${amp.toFixed(3)} * (.35 * min(uVa, 1.) + uVa * ola * .9); transformed.y -= hh * ${amp.toFixed(3)} * .35 * uVa * ola;`
    : `float hh = clamp(position.y * .22, 0., 1.); float f = sin(uVt * 2.7 - wp.x * .28 + wp.z * .1) + .45 * sin(uVt * 6.3 + wp.z * .8 - wp.x * .5);
      transformed += vec3(1., .25, .35) * f * hh * ${amp.toFixed(3)} * uVa; transformed.x += hh * ${amp.toFixed(3)} * .6 * uVa;`;
  sh.vertexShader = "uniform float uVt; uniform float uVa;\n" + sh.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>
  { vec4 wp = vec4(position, 1.);
  #ifdef USE_INSTANCING
    wp = instanceMatrix * wp;
  #endif
    wp = modelMatrix * wp; ${cuerpo} }`) }; m.customProgramCacheKey = () => "vientoG" + modo + amp; return m };

// ---------- altura real del piso: ALT (fuente común) + ondulaciones propias que se apagan hacia el borde de la zona y en el pueblo
const MASK_Z = (x, z) => (1 - sst(70, 88, x)) * (1 - sst(100, 128, -x)) * (1 - sst(100, 128, Math.abs(z)));
const detH = (x, z) => { const pu = 1 - sst(24, 58, Math.hypot(x, z - 3)); return (fbm2(x * .026 + 3, z * .026 + 8, 4) - .5) * 4.4 * (1 - pu * .85) + (fbm2(x * .13 + 1, z * .13 + 5, 2) - .5) * .5 * (1 - pu * .6) };
const PLAZA_Y = ALT(0, 0) + detH(0, 0);
function SUELO(x, z) { const m = MASK_Z(x, z); if (m <= 0) return ALT(x, z); let h = ALT(x, z) + detH(x, z) * m; const rp = Math.hypot(x, z); if (rp < 15) h = lerp(PLAZA_Y, h, sst(10.5, 15, rp)); return h }
const sueloN = (x, z, e = .6) => { const nx = SUELO(x - e, z) - SUELO(x + e, z), nz = SUELO(x, z - e) - SUELO(x, z + e), l = Math.hypot(nx, 2 * e, nz); return [nx / l, 2 * e / l, nz / l] };

// ---------- sendas de tierra (camino principal este–oeste con huellas de carro, calle al sur, senderos a la loma y a los campos)
const SENDAS = [[-110, 9, -11, 6, 3.4], [11, -1.5, 92, -4, 3.4], [1, 10, 7, 46, 2.6], [-7, 7, -21, 14, 1.5], [-21, 14, -26, 17, 1.2], [8, -9, 30, -34, 1.9], [-8, -8, -26, -36, 1.9], [26, -3, 34, 26, 1.6], [-40, 8, -52, -22, 1.5], [52, -3, 60, -30, 1.4], [-60, 9, -70, 34, 1.4], [40, -3, 48, 38, 1.4]];
const sendaK = (x, z) => { let k = 0; for (const [x0, z0, x1, z1, an] of SENDAS) { const dx = x1 - x0, dz = z1 - z0, t = cl(((x - x0) * dx + (z - z0) * dz) / (dx * dx + dz * dz)), d = Math.hypot(x - x0 - dx * t, z - z0 - dz * t) + (fbm2(x * .4, z * .4, 2) - .5) * 1.4; k = Math.max(k, 1 - sst(an * .45, an, d)) } return k };
// huellas de carro del camino principal (dos surcos)
const huellaK = (x, z) => { if (Math.abs(x) < 11 || x < -110 || x > 92) return 0; const zc = x < 0 ? lerp(9, 6, (x + 110) / 99) : lerp(-1.5, -4, (x - 11) / 81), d = Math.abs(z - zc); return Math.max(1 - sst(.12, .35, Math.abs(d - .8)), 0) };

// ---------- color del suelo por vértice: pasto ralo verde-amarillento con manchas secas, tierra en las sendas, roca gris en las pendientes, nieve no (eso es de la sierra)
const C_PASTO = linC("#93a456"), C_PASTO2 = linC("#7d9446"), C_SECO = linC("#c0b46e"), C_SECO2 = linC("#a8a060"), C_TIERRA = linC("#8a7356"), C_TIERRA2 = linC("#6e5a44"), C_ROCA = linC("#8a877c"), C_ROCA2 = linC("#a09c90"), C_PISADO = linC("#9a9068"), C_NIEVE = linC("#eef2f6");
function colorSuelo(x, z) { const n = fbm2(x * .045 + 11, z * .045 + 2, 4), n2 = fbm2(x * .27 + 5, z * .27 + 8, 2), n3 = fbm2(x * .012 + 40, z * .012 - 7, 3), nor = sueloN(x, z, 1.2), pend = 1 - nor[1];
  let c = mix3(C_PASTO, C_PASTO2, sst(.35, .7, n)); c = mix3(c, mix3(C_SECO, C_SECO2, n2), sst(.42, .68, n3) * .85);
  // vetas claras peinadas por el viento (alargadas en x)
  c = mix3(c, C_SECO, sst(.6, .8, fbm2(x * .05, z * .5, 2)) * .35);
  const pu = 1 - sst(20, 46, Math.hypot(x, z - 3)); c = mix3(c, C_PISADO, pu * (.25 + .35 * n2));
  const sk = sendaK(x, z); c = mix3(c, mix3(C_TIERRA, C_TIERRA2, n2), sk * .9); c = mix3(c, C_TIERRA2, huellaK(x, z) * .6);
  const alt = ALT(x, z); if (pend > .05) c = mix3(c, mix3(C_ROCA, C_ROCA2, n2), sst(.12, .4, pend) * .95);
  if (alt > 24) c = mix3(c, C_ROCA2, sst(24, 46, alt) * .55); if (alt > 88) c = mix3(c, C_NIEVE, sst(88, 115, alt) * (.5 + .5 * n2) * (1 - sst(.35, .6, pend) * .6));
  const s = .9 + .2 * n2; return [c[0] * s, c[1] * s, c[2] * s] }

// ---------- pasto: textura de detalle con briznas inclinadas hacia +x (u = x), matas, piedritas y tierra; el color grande viene por vértice
const T_PASTO_D = (() => { const [c, z] = pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(4101); c.fillStyle = "#e9ead8"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
    for (let k = 0; k < 220; k++) { const x = r() * w, y = r() * h, s = 30 + r() * 120, col = r() < .5 ? "rgba(120,130,70,.18)" : "rgba(255,250,220,.2)"; envuelto(c, w, h, () => { const gr = c.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, col); gr.addColorStop(1, "rgba(230,230,210,0)"); c.fillStyle = gr; c.fillRect(x - s, y - s, s * 2, s * 2) }) }
    // tierra que asoma entre las matas
    for (let k = 0; k < 90; k++) { const x = r() * w, y = r() * h, s = 10 + r() * 30; envuelto(c, w, h, () => { c.fillStyle = "rgba(120,96,66,.28)"; c.beginPath(); c.ellipse(x, y, s * 1.6, s * .7, 0, 0, 7); c.fill() }) }
    // briznas: todas acostadas hacia +u (el viento), con la base abajo; claras y oscuras
    for (let k = 0; k < 16000; k++) { const x = r() * w, y = r() * h, L = 8 + r() * 22, a = -.25 - r() * .45, cl2 = r(); const col = cl2 < .45 ? `rgba(70,90,30,${.12 + r() * .18})` : cl2 < .8 ? `rgba(255,250,200,${.1 + r() * .16})` : `rgba(200,180,90,${.14 + r() * .18})`;
      c.strokeStyle = col; c.lineWidth = 1.2 + r() * 1.6; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + L * .5, y + Math.sin(a) * L * .5, x + L * Math.cos(a * .6), y + Math.sin(a) * L); c.stroke();
      z.strokeStyle = cl2 < .45 ? "rgba(60,60,60,.35)" : "rgba(210,210,210,.35)"; z.lineWidth = 2; z.beginPath(); z.moveTo(x, y); z.lineTo(x + L * Math.cos(a * .6), y + Math.sin(a) * L); z.stroke() }
    for (let k = 0; k < 160; k++) { const x = r() * w, y = r() * h, s = 2 + r() * 5, a = r() * 3; envuelto(c, w, h, () => { c.fillStyle = "rgba(40,36,30,.14)"; c.beginPath(); c.ellipse(x + 2, y + 2, s, s * .7, a, 0, 7); c.fill(); c.fillStyle = rgbj(["#c8c2b6", "#aaa69a", "#d8d2c4", "#9a9488"][r() * 4 | 0], r, 20); c.beginPath(); c.ellipse(x, y, s, s * .7, a, 0, 7); c.fill() });
      envuelto(z, w, h, () => { z.fillStyle = "rgba(250,250,250,.9)"; z.beginPath(); z.ellipse(x, y, s, s * .7, a, 0, 7); z.fill() }) } });
  [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
const M_PASTO_S = new THREE.MeshStandardMaterial({ map: T_PASTO_D.c, bumpMap: T_PASTO_D.z, bumpScale: 2.6, roughness: .97, vertexColors: true });
AGUA.material = new THREE.MeshStandardMaterial({ color: "#7d9446", roughness: 1 }); AGUA.position.y = -6; AGUA.castShadow = false;

// ---------- la malla del terreno: fina en el pueblo (≈ 0,7 m) y gruesa lejos; termina en x = 100 (+ faldón a 104) para empalmar con la cordillera
const TERRENO = (() => { const N = 330, geo = new THREE.PlaneGeometry(2, 2, N, N); geo.rotateX(-Math.PI / 2); const p = geo.attributes.position, uv = geo.attributes.uv, col = new Float32Array(p.count * 3);
  const mx = u => u >= 0 ? 104 * (.55 * u + .45 * u * u) : -460 * (.22 * -u + .78 * u * u * -u), mz = u => 460 * (.22 * u + .78 * u * u * u) * 1;
  for (let i = 0; i < p.count; i++) { const x = mx(p.getX(i)), z = mz(p.getZ(i)); let y = SUELO(x, z); if (x > 100) y -= (x - 100) * .2; p.setXYZ(i, x, y, z); uv.setXY(i, x / 7, z / 7); const c = colorSuelo(x, z); col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2] }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals(); const m = new THREE.Mesh(geo, M_PASTO_S); m.receiveShadow = true; m.castShadow = true; scene.add(m); return m })();

// ---------- texturas pintadas: piedra de muro (hiladas desparejas), pizarra, tejas, revoque, madera, piedra de roca
const repT = q => { for (const t of (Array.isArray(q) ? q : [q.c, q.z])) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.needsUpdate = true } return q };
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
  // grano, líquenes (amarillos, blancos) y chorreaduras oscuras
  for (let k = 0; k < 14000; k++) { const x = r() * w, y2 = r() * h; c.fillStyle = r() < .5 ? "rgba(40,34,26,.16)" : "rgba(255,250,235,.14)"; c.fillRect(x, y2, 1 + r() * 2, 1 + r() * 2) }
  for (let k = 0; k < (o.liquen ?? 40); k++) { const x = r() * w, y2 = r() * h, n = 6 + r() * 16, col = ["rgba(196,180,90,.55)", "rgba(230,228,210,.5)", "rgba(170,150,70,.5)", "rgba(120,140,80,.45)"][r() * 4 | 0]; for (let q = 0; q < n; q++) envuelto(c, w, h, () => { c.fillStyle = col; c.beginPath(); c.arc(x + (r() - .5) * 26, y2 + (r() - .5) * 18, 1.5 + r() * 5, 0, 7); c.fill() }) }
  for (let k = 0; k < 26; k++) { const x = r() * w, y2 = r() * h, L = 60 + r() * 260, an = 4 + r() * 14, gr = c.createLinearGradient(0, y2, 0, y2 + L); gr.addColorStop(0, "rgba(40,36,30,.22)"); gr.addColorStop(1, "rgba(40,36,30,0)"); c.fillStyle = gr; c.fillRect(x - an / 2, y2, an, L) }
  if (o.musgo) { for (let k = 0; k < 700; k++) { const x = r() * w, y2 = r() * h; c.fillStyle = `rgba(${70 + r() * 30 | 0},${96 + r() * 30 | 0},${40 + r() * 20 | 0},${.25 + r() * .3})`; c.beginPath(); c.arc(x, y2, 2 + r() * 7, 0, 7); c.fill() } } }));
const MURO_P = [["#8e877a", "#7a7366", "#a39b8c", "#6e675c", "#9a8e7a", "#857d70"], ["#a0927c", "#8c7e68", "#b4a68e", "#7a6e5c", "#9c8a70"], ["#7c7a76", "#686660", "#8e8a84", "#5e5c58", "#9a948a"], ["#a8987e", "#94846c", "#bcae94", "#857560", "#a08c72"], ["#8a8274", "#77706a", "#9c9484", "#a69a84", "#6a645c"], ["#968a78", "#827868", "#aa9e8a", "#70685c"]];
const M_MURO = MURO_P.map((p, i) => { const [t, z] = T_MURO(4200 + i, p, { mortero: ["#5c564c", "#625a4c", "#52504c", "#665c4c", "#58544c", "#5e564c"][i] }); return new THREE.MeshStandardMaterial({ map: t, bumpMap: z, bumpScale: 4.5, roughness: .93 }) });
const M_ZOCALO = (() => { const [t, z] = T_MURO(4210, ["#6e685e", "#5e584e", "#7a7468", "#666052"], { mortero: "#4e4a42", musgo: 1, escala: 1.25 }); return new THREE.MeshStandardMaterial({ map: t, bumpMap: z, bumpScale: 5, roughness: .96 }) })();
const T_SILLAR = T_MURO(4220, ["#9a9282", "#8a8272", "#aaa290", "#7e776a", "#a49a86"], { sillar: 1, mortero: "#6a645a", liquen: 70 });
const M_TORRE_P = new THREE.MeshStandardMaterial({ map: T_SILLAR[0], bumpMap: T_SILLAR[1], bumpScale: 5.5, roughness: .93, color: "#c8c0b2" });
// pizarra: filas que se pisan (las de abajo tapan la parte de arriba de las de arriba), cada laja distinta, musgo y líquenes, alguna rota
const T_PIZARRA = (seed, pal) => repT(pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(seed); c.fillStyle = "#1a1d20"; c.fillRect(0, 0, w, h); z.fillStyle = "#1a1a1a"; z.fillRect(0, 0, w, h);
  const nf = 15, fh = h / nf; for (let f = -1; f <= nf; f++) { const y0 = f * fh; let x = -r() * 50; while (x < w) { const sw = 54 + r() * 44, col = rgbj(pal[r() * pal.length | 0], r, 20), v = 120 + r() * 70 | 0, rot = r() < .04;
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
  // revoque caído (asoma la piedra) y grietas
  for (let k = 0; k < 7; k++) { const cx = r() * w, cy = r() * h, s = 30 + r() * 60, P = Array.from({ length: 9 }, (_, i) => { const a = i / 9 * 6.283, d = s * (.55 + r() * .6); return [cx + Math.cos(a) * d * 1.3, cy + Math.sin(a) * d] });
    redondo(c, P, 10); c.fillStyle = "#8e8474"; c.fill(); c.save(); c.clip(); for (let q = 0; q < 20; q++) { c.fillStyle = rgbj(["#a09482", "#7e7466", "#968a78"][r() * 3 | 0], r, 20); c.beginPath(); c.ellipse(cx + (r() - .5) * s * 2.4, cy + (r() - .5) * s * 1.8, 14 + r() * 16, 9 + r() * 8, 0, 0, 7); c.fill() } c.restore(); c.strokeStyle = "rgba(90,80,64,.7)"; c.lineWidth = 3; c.stroke(); redondo(z, P, 10); z.fillStyle = "#505050"; z.fill() }
  for (let k = 0; k < 14; k++) { let x = r() * w, y = r() * h; const n = 8 + r() * 16 | 0; c.strokeStyle = "rgba(80,70,56,.55)"; c.lineWidth = 1.5; z.strokeStyle = "#202020"; z.lineWidth = 3; c.beginPath(); z.beginPath(); c.moveTo(x, y); z.moveTo(x, y); for (let q = 0; q < n; q++) { x += (r() - .5) * 26; y += 6 + r() * 18; c.lineTo(x, y); z.lineTo(x, y) } c.stroke(); z.stroke() }
  for (let k = 0; k < 10000; k++) { c.fillStyle = r() < .5 ? "rgba(90,80,60,.12)" : "rgba(255,255,255,.12)"; c.fillRect(r() * w, r() * h, 2, 2) } }));
const M_REVOQUE = new THREE.MeshStandardMaterial({ map: T_REVOQUE[0], bumpMap: T_REVOQUE[1], bumpScale: 3.5, roughness: .95 });
// madera clara neutra (se tiñe): tablas con veta, nudos, clavos y pintura gastada
const T_TABLA_N = (() => { const [c, z] = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(4330); let x = 0; z.fillStyle = "#909090"; z.fillRect(0, 0, w, h); while (x < w) { const pw = 64 + r() * 50; c.fillStyle = rgbj("#e2dcd2", r, 22); c.fillRect(x, 0, pw, h); for (let k = 0; k < 40; k++) { const xx = x + r() * pw; c.strokeStyle = r() < .5 ? "rgba(90,74,60,.25)" : "rgba(255,255,255,.3)"; c.lineWidth = 1 + r() * 2; c.beginPath(); c.moveTo(xx, 0); for (let y = 0; y <= h; y += 40) c.lineTo(xx + (r() - .5) * 6, y); c.stroke(); z.strokeStyle = "rgba(60,60,60,.3)"; z.lineWidth = 2; z.beginPath(); z.moveTo(xx, 0); z.lineTo(xx, h); z.stroke() }
      for (let k = 0; k < 5; k++) { const px = x + r() * pw, py = r() * h, s = 6 + r() * 20; c.fillStyle = "rgba(120,96,70,.7)"; c.beginPath(); c.ellipse(px, py, s * .6, s, r(), 0, 7); c.fill(); z.fillStyle = "rgba(40,40,40,.6)"; z.beginPath(); z.ellipse(px, py, s * .6, s, 0, 0, 7); z.fill() }
      for (const yy of [30, h - 30]) { c.fillStyle = "#3a3430"; c.beginPath(); c.arc(x + pw / 2, yy, 4, 0, 7); c.fill() }
      c.fillStyle = "rgba(40,28,20,.8)"; c.fillRect(x + pw - 4, 0, 4, h); z.fillStyle = "#000"; z.fillRect(x + pw - 5, 0, 6, h); x += pw } }); return { c, z } })();
const PUERTA_C = ["#4a6a52", "#8a3a2c", "#3e5a78", "#a07a3a", "#5a4a3a", "#6a7a6a", "#7a4a3a", "#2e4e4a", "#9a8a6a"];
const M_PUERTA = PUERTA_C.map(c => new THREE.MeshStandardMaterial({ map: T_TABLA_N.c, bumpMap: T_TABLA_N.z, bumpScale: 3, roughness: .8, color: c }));
const M_MADERA = new THREE.MeshStandardMaterial({ map: T_TABLA_N.c, bumpMap: T_TABLA_N.z, bumpScale: 3.5, roughness: .9, color: "#6e5038" });
const M_MADERA_V = new THREE.MeshStandardMaterial({ map: T_TABLA_N.c, bumpMap: T_TABLA_N.z, bumpScale: 3.5, roughness: .95, color: "#9a8e7e" });
const M_VIGA = new THREE.MeshStandardMaterial({ map: T_TABLA_N.c, bumpMap: T_TABLA_N.z, bumpScale: 3, roughness: .9, color: "#4a3426" });
const M_VIDRIO = new THREE.MeshStandardMaterial({ color: "#1e2a30", roughness: .12, metalness: .55 });
const M_OSCURO = new THREE.MeshBasicMaterial({ color: "#120d0a" });
const M_HIERRO = new THREE.MeshStandardMaterial({ color: "#3a3532", roughness: .5, metalness: .75 });
const M_HIERRO_O = new THREE.MeshStandardMaterial({ color: "#5a4030", roughness: .7, metalness: .5 });   // hierro con óxido (estacas, cadenas)
const M_TERRACOTA = new THREE.MeshStandardMaterial({ color: "#a65a3a", roughness: .8 });
const T_SOGA = tex(64, 64, (g, w, h) => { g.fillStyle = "#b89a6a"; g.fillRect(0, 0, w, h); for (let k = -8; k < 16; k++) { g.strokeStyle = k % 2 ? "rgba(70,50,28,.7)" : "rgba(240,220,170,.5)"; g.lineWidth = 4; g.beginPath(); g.moveTo(k * 8, 0); g.lineTo(k * 8 + 32, h); g.stroke() } }, [1, 6]);
const M_SOGA = new THREE.MeshStandardMaterial({ map: T_SOGA, bumpMap: T_SOGA, bumpScale: 2, roughness: 1 });
const T_ROCA = (() => { const [c, z] = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(4340); c.fillStyle = "#cfcac0"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
    for (let k = 0; k < 300; k++) { const x = r() * w, y = r() * h, s = 10 + r() * 60; envuelto(c, w, h, () => { c.fillStyle = r() < .5 ? "rgba(90,86,76,.14)" : "rgba(255,255,250,.14)"; c.beginPath(); c.ellipse(x, y, s, s * .6, r() * 3, 0, 7); c.fill() }); envuelto(z, w, h, () => { z.fillStyle = r() < .5 ? "rgba(50,50,50,.25)" : "rgba(210,210,210,.25)"; z.beginPath(); z.ellipse(x, y, s, s * .6, 0, 0, 7); z.fill() }) }
    for (let k = 0; k < 40; k++) { let x = r() * w, y = r() * h; c.strokeStyle = "rgba(40,36,30,.6)"; c.lineWidth = 1.5 + r() * 2; z.strokeStyle = "#000"; z.lineWidth = 4; c.beginPath(); z.beginPath(); c.moveTo(x, y); z.moveTo(x, y); for (let q = 0; q < 7; q++) { x += (r() - .5) * 50; y += (r() - .5) * 50; c.lineTo(x, y); z.lineTo(x, y) } c.stroke(); z.stroke() }
    for (let k = 0; k < 90; k++) { const x = r() * w, y = r() * h, n = 6 + r() * 14, col = ["rgba(200,190,90,.6)", "rgba(240,240,225,.6)", "rgba(210,140,60,.5)", "rgba(110,130,70,.5)"][r() * 4 | 0]; for (let q = 0; q < n; q++) { c.fillStyle = col; c.beginPath(); c.arc(x + (r() - .5) * 20, y + (r() - .5) * 20, 1.5 + r() * 4, 0, 7); c.fill() } } });
  [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
const M_ROCA = new THREE.MeshStandardMaterial({ map: T_ROCA.c, bumpMap: T_ROCA.z, bumpScale: 4, roughness: .95, color: "#ffffff" });
const M_ROCA_G = new THREE.MeshStandardMaterial({ map: T_ROCA.c, bumpMap: T_ROCA.z, bumpScale: 4, roughness: .95, color: "#8e8a80" });   // piedras sueltas sin color de instancia
const M_PIEDRA_C = new THREE.MeshStandardMaterial({ color: "#b4ab98", roughness: .9, bumpMap: T_ROCA.z, bumpScale: 2.5 });   // dinteles, alféizares, escalones
const GEO_PIEDRAS = [geoPiedra(31, 1, .62), geoPiedra(32, 1, .8), geoPiedra(33, 1, .5)];
const RB1 = (w, h, d, r = .04) => RB(w, h, d, r, 1);   // caja con bisel de un segmento (liviana)

// ---------- la plaza empedrada (anillos de piedra gris con pasto en las juntas del borde) — calcomanía sobre el terreno
const T_PLAZA = (() => { const [c, z] = pintarDoble(2048, 2048, (c, z, w, h) => { const r = rng(4400), C = w / 2, px = w / 27; z.fillStyle = "#606060"; z.fillRect(0, 0, w, h);
    c.fillStyle = "#5e5a4e"; c.beginPath(); for (let i = 0; i <= 200; i++) { const a = i / 200 * 6.283, rr = (12.3 + Math.sin(a * 7) * .25 + Math.sin(a * 13 + 1) * .2) * px; i ? c.lineTo(C + Math.cos(a) * rr, C + Math.sin(a) * rr) : c.moveTo(C + Math.cos(a) * rr, C + Math.sin(a) * rr) } c.fill();
    const losa = (r0, r1, a0, a1, col) => { const m = .028 * px, ma0 = a0 + m / r1, ma1 = a1 - m / r1; if (ma1 <= ma0) return; const j = () => (r() - .5) * .06 * px, pts = [[r0 + m, ma0], [r1 - m, ma0], [r1 - m, (ma0 + ma1) / 2], [r1 - m, ma1], [r0 + m, ma1], [r0 + m, (ma0 + ma1) / 2]].map(([rr, a]) => [C + Math.cos(a) * rr + j(), C + Math.sin(a) * rr + j()]);
      const v = 180 + r() * 70 | 0; redondo(c, pts, .07 * px); c.fillStyle = col; c.fill(); redondo(z, pts, .07 * px); z.fillStyle = `rgb(${v},${v},${v})`; z.fill();
      const mx = C + Math.cos((a0 + a1) / 2) * (r0 + r1) / 2, my = C + Math.sin((a0 + a1) / 2) * (r0 + r1) / 2, s = (r1 - r0) * .6; redondo(c, pts, .07 * px); const gr = c.createRadialGradient(mx - s * .3, my - s * .3, 0, mx, my, s * 1.4); gr.addColorStop(0, "rgba(255,250,235,.18)"); gr.addColorStop(1, "rgba(30,26,20,.2)"); c.fillStyle = gr; c.fill() };
    const grises = ["#9a968c", "#8a867c", "#a8a296", "#7c786e", "#949082", "#b0aa9c", "#868070", "#a09884"];
    losa(0, .7 * px, 0, 6.283, "#7c786e"); for (let k = 0; k < 8; k++) losa(.7 * px, 1.4 * px, k / 8 * 6.283, (k + 1) / 8 * 6.283, grises[k % 8]);
    let rr = 1.4; while (rr < 12.1) { const an = .2 + r() * .12, r1 = Math.min(12.3, rr + an); let a = r() * 6.283; const fin = a + 6.283; while (a < fin - .02) { const da = Math.min(fin - a, (.22 + r() * .22) / rr); if (r() > .02) losa(rr * px, r1 * px, a, a + da, rgbj(grises[r() * 8 | 0], r, 22)); a += da } rr = r1 }
    for (let k = 0; k < 220; k++) { const a = r() * 6.283, d = Math.sqrt(r()) * 12 * px, s = 20 + r() * 90, X0 = C + Math.cos(a) * d, Y0 = C + Math.sin(a) * d, gr = c.createRadialGradient(X0, Y0, 0, X0, Y0, s), cl2 = r() < .6 ? "180,170,140" : "50,46,38"; gr.addColorStop(0, `rgba(${cl2},.22)`); gr.addColorStop(1, `rgba(${cl2},0)`); c.fillStyle = gr; c.fillRect(X0 - s, Y0 - s, s * 2, s * 2) }
    // pasto en las juntas hacia el borde
    for (let k = 0; k < 2500; k++) { const a = r() * 6.283, d = (8.5 + r() * 3.8) * px, x = C + Math.cos(a) * d, y = C + Math.sin(a) * d, L = 4 + r() * 10; c.strokeStyle = `rgba(${90 + r() * 50 | 0},${110 + r() * 40 | 0},50,${.4 + r() * .4})`; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + L, y - L * .5); c.stroke() }
    c.globalCompositeOperation = "destination-out"; for (let k = 0; k < 500; k++) { const a = r() * 6.283, d = (11.4 + r() * 1.6) * px, s = 14 + r() * 60, X0 = C + Math.cos(a) * d, Y0 = C + Math.sin(a) * d, gr = c.createRadialGradient(X0, Y0, 0, X0, Y0, s); gr.addColorStop(0, "rgba(0,0,0,.9)"); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(X0 - s, Y0 - s, s * 2, s * 2) } c.globalCompositeOperation = "source-over" }); return { c, z } })();
const geoSobreSuelo = (x0, x1, z0, z1, nx, nz, dy = .02) => { const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, nz); g.rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, 0, (z0 + z1) / 2); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, SUELO(p.getX(i), p.getZ(i)) + dy); g.computeVertexNormals(); return g };
const PLAZA_M = (() => { const m = new THREE.Mesh(geoSobreSuelo(-13.5, 13.5, -13.5, 13.5, 40, 40), new THREE.MeshStandardMaterial({ map: T_PLAZA.c, bumpMap: T_PLAZA.z, bumpScale: 5, roughness: .85, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -6 })); m.receiveShadow = true; m.renderOrder = -.3; scene.add(m); return m })();

// ---------- registro de lo ocupado (para que nada se pise) y los lugares de las frases
const OCUP = [], RECTS = [];
const enRect = (R, x, z, m = 0) => { const c = Math.cos(R.ry), s = Math.sin(R.ry), dx = x - R.x, dz = z - R.z, lx = dx * c - dz * s, lz = dx * s + dz * c; return Math.abs(lx) < R.w / 2 + m && Math.abs(lz) < R.d / 2 + m };
const zonaLibre = (x, z, r = 0) => Math.hypot(x, z) < 11 + r || Math.hypot(x - TORRE[0], z - TORRE[1]) < 4 + r;
const libreEn = (x, z, r = .5, o = {}) => { if (!o.zona && zonaLibre(x, z, r)) return false; for (const R of RECTS) if (R !== o.salvo && enRect(R, x, z, r + (o.mc ?? .1))) return false; for (const q of OCUP) if (Math.hypot(x - q.x, z - q.z) < r + q.r) return false; return true };
const ocupa = (x, z, r) => { OCUP.push({ x, z, r }); return true };
// el puesto de sopa de Marta, el altar de la boda (en la plaza), el rincón de la mamá con el bebé
const PUNTOS = { sopa: [8.5, -3.5], boda: [-5.5, 2.5], bebe: [19, 6.5] };
const PUNTOS_R = { sopa: 3.4, boda: 4.6, bebe: 3.2 };

// ---------- LAS CASAS_V: piedra (o piedra abajo y revoque con vigas arriba), techo a dos aguas de pizarra o tejas, chimenea,
// y CUATRO CADENAS gruesas de las esquinas del alero a estacas de hierro en el piso. Todas van a un solo lote.
const L_CASA = lote(), CASAS_V = [], CADENAS = [], HUMOS = [];
const CASA_MATS = { zocalo: M_ZOCALO, revoque: M_REVOQUE, piedraC: M_PIEDRA_C, madera: M_MADERA, maderaV: M_MADERA_V, viga: M_VIGA, vidrio: M_VIDRIO, oscuro: M_OSCURO, hierro: M_HIERRO, hierroO: M_HIERRO_O, terracota: M_TERRACOTA, roca: M_ROCA_G, soga: M_SOGA };
M_MURO.forEach((m, i) => CASA_MATS["muro" + i] = m); M_PIZ.forEach((m, i) => CASA_MATS["piz" + i] = m); M_TEJA.forEach((m, i) => CASA_MATS["teja" + i] = m); M_PUERTA.forEach((m, i) => CASA_MATS["col" + i] = m);
const ventanaPiezas = (add, M, an, al, r, col, o = {}) => {   // M = matriz en la cara (origen al pie de la ventana, +z hacia afuera)
  add("vidrio", new THREE.PlaneGeometry(an, al), M.clone().multiply(TM(0, al / 2, .02)));
  for (const s of [-1, 1]) add("madera", new THREE.BoxGeometry(.08, al + .08, .1), M.clone().multiply(TM(s * (an / 2 + .02), al / 2, .04)));
  for (const yy of [0, al]) add("madera", new THREE.BoxGeometry(an + .12, .08, .1), M.clone().multiply(TM(0, yy, .04)));
  add("madera", new THREE.BoxGeometry(.05, al, .05), M.clone().multiply(TM(0, al / 2, .05))); add("madera", new THREE.BoxGeometry(an, .05, .05), M.clone().multiply(TM(0, al * .55, .05)));
  add("piedraC", RB1(an + .36, .1, .26, .03), M.clone().multiply(TM(0, -.06, .1))); add("piedraC", RB1(an + .4, .2, .14, .03), M.clone().multiply(TM(0, al + .14, .05)));
  // postigos: abiertos contra la pared y trabados con un gancho (si no, el viento los arranca), o cerrados
  const ce = o.cerrado ?? r() < .22; for (const s of [-1, 1]) { const ang = ce ? 0 : s * (Math.PI - .12), hm = M.clone().multiply(TM(s * (an / 2 + .06), al / 2, .09, 0, ang, 0)); add(col, new THREE.BoxGeometry(an / 2 + .02, al + .04, .05), hm.clone().multiply(TM(-s * (an / 4 + .01), 0, 0)));
    for (const yy of [-al * .32, al * .32]) add("madera", new THREE.BoxGeometry(an / 2 - .04, .07, .03), hm.clone().multiply(TM(-s * (an / 4), yy, ce ? .04 : -.04)));
    if (!ce) add("hierro", new THREE.CylinderGeometry(.012, .012, .3, 4), M.clone().multiply(TM(s * (an + .2), al * .5, .06, 0, 0, Math.PI / 2))) } };
function casaV(x, z, ry, w, d, h, seed, o = {}) { const r = rng(seed), cs = Math.cos(ry), sn = Math.sin(ry);
  const y0 = Math.min(SUELO(x, z), ...[[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([a, b]) => SUELO(x + (a * w / 2) * cs + (b * d / 2) * sn, z - (a * w / 2) * sn + (b * d / 2) * cs))) - .06;
  const HM = TM(x, y0, z, 0, ry, 0), Lr = o.techoL || null, add = (k, g, m) => L_CASA.add(k, g, HM.clone().multiply(m)), W = (lx, ly, lz) => new THREE.Vector3(lx, ly, lz).applyMatrix4(HM);
  const mu = "muro" + (o.muro ?? (seed % M_MURO.length)), dos = o.dos ?? r() < .32, hs = dos ? 2.9 : h; if (dos) h = Math.max(h, 5.3 + r() * .4); const techo = o.techo ?? (r() < .55 ? "piz" + (r() * 3 | 0) : "teja" + (r() * 3 | 0)), col = "col" + (o.color ?? (r() * M_PUERTA.length | 0));
  // zócalo (entra en el piso) y muros
  add("zocalo", uvMuro(new THREE.BoxGeometry(w + .26, 1.7, d + .26), 3.2), TM(0, -.6, 0));
  add(mu, uvMuro(new THREE.BoxGeometry(w, hs, d), 3.2, r(), r()), TM(0, hs / 2, 0));
  if (dos) { const hu = h - hs; add("revoque", uvMuro(new THREE.BoxGeometry(w + .2, hu, d + .2), 3.4, r(), r()), TM(0, hs + hu / 2, 0));
    // entramado de vigas sobre el revoque: soleras, postes y cruces
    const cara = (L2, M) => { add("viga", new THREE.BoxGeometry(L2 + .1, .16, .1), M.clone().multiply(TM(0, .08, 0))); add("viga", new THREE.BoxGeometry(L2 + .1, .16, .1), M.clone().multiply(TM(0, hu - .08, 0))); const n = Math.max(2, Math.round(L2 / 1.25));
      for (let k = 0; k <= n; k++) { const xx = lerp(-L2 / 2 + .06, L2 / 2 - .06, k / n); add("viga", new THREE.BoxGeometry(.15, hu, .1), M.clone().multiply(TM(xx, hu / 2, 0))); if (k < n && k % 2 === 0) { const x2 = lerp(-L2 / 2 + .06, L2 / 2 - .06, (k + 1) / n), [g, m] = cilEntre([xx, .1, 0], [x2, hu - .1, 0], .06, 4); add("viga", g, M.clone().multiply(m)) } } };
    cara(w + .2, TM(0, hs, d / 2 + .15)); cara(w + .2, TM(0, hs, -d / 2 - .15, 0, Math.PI, 0)); cara(d + .2, TM(w / 2 + .15, hs, 0, 0, Math.PI / 2, 0)); cara(d + .2, TM(-w / 2 - .15, hs, 0, 0, -Math.PI / 2, 0)) }
  // piedras esquineras (más claras, alternadas)
  if (!o.sinEsq) for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) for (let yy = .25, k = 0; yy < hs - .2; yy += .44, k++) { const la = k % 2 ? .62 : .38; add("piedraC", RB1(.1 + la * (k % 2 ? 1 : .1), .38, .1 + la * (k % 2 ? .1 : 1), .04), TM(sx * (w / 2 + .015) - sx * la * (k % 2 ? .5 : 0), yy, sz * (d / 2 + .015) - sz * la * (k % 2 ? 0 : .5))) }
  // el techo: frontón de piedra (o tablas en la panadería), dos faldones, cumbrera, tablas de borde, piedras de peso
  const ang = (o.pendiente ?? (36 + r() * 9)) * Math.PI / 180, ovx = .45, ovz = .52, rh = d / 2 * Math.tan(ang), ye = h - ovz * Math.tan(ang), S = (d / 2 + ovz) / Math.cos(ang), Lt = w + 2 * ovx;
  const sh = new THREE.Shape(); sh.moveTo(-d / 2, 0); sh.lineTo(d / 2, 0); sh.lineTo(0, rh); sh.closePath();
  if (!o.panaderia) { const gp = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false }); gp.rotateY(Math.PI / 2); gp.translate(-w / 2, 0, 0); add(dos ? "revoque" : mu, uvMuro(gp, 3.2, r(), .3), TM(0, h, 0)) }
  else for (const s of [-1, 1]) { const gp = new THREE.ExtrudeGeometry(sh, { depth: .3, bevelEnabled: false }); gp.rotateY(Math.PI / 2); gp.translate(s > 0 ? w / 2 - .3 : -w / 2, 0, 0); add(mu, uvMuro(gp, 3.2, r(), .3), TM(0, h, 0)) }
  const tL = Lr || L_CASA, tadd = Lr ? (k, g, m) => Lr.add(k, g, TM(0, -h, 0).multiply(m)) : add;
  for (const s of [1, -1]) { const ts = techo.startsWith("piz") ? 4.4 : 3.4, g = new THREE.BoxGeometry(Lt, .17, S); geoUV(g, px => px / ts, (px, py, pz) => -pz / ts);
    const ym = h + rh + .1 - (d / 2 + ovz) * Math.tan(ang) / 2, zm = s * (d / 2 + ovz) / 2; tadd(techo, g, TM(0, ym, zm, ang, s > 0 ? 0 : Math.PI, 0)); if (o.panaderia) tadd("maderaV", new THREE.BoxGeometry(Lt - .3, .05, S - .2), TM(0, ym, zm, ang, s > 0 ? 0 : Math.PI, 0).multiply(TM(0, -.12, 0)));
    // tablas de borde (en los frontones) y canaleta de madera
    for (const sx of [-1, 1]) tadd("madera", new THREE.BoxGeometry(.06, .3, S + .04), TM(sx * (Lt / 2 + .02), ym - .06, zm, ang, s > 0 ? 0 : Math.PI, 0));
    // piedras de peso sobre el techo (en un valle ventoso, se usan)
    const np = o.panaderia ? 2 : (r() * 3 | 0); for (let k = 0; k < np; k++) { const u = .25 + r() * .55, xx = (r() - .5) * (w - 1.2), sp = .18 + r() * .14; tadd("roca", GEO_PIEDRAS[k % 3], TM(xx, h + rh + .18 - u * (d / 2 + ovz) * Math.tan(ang) + sp * .45, s * u * (d / 2 + ovz), ang * s, r() * 6, 0, sp * 1.3, sp, sp * 1.1)) } }
  tadd(techo === "teja0" || techo === "teja1" || techo === "teja2" ? "terracota" : "zocalo", new THREE.CylinderGeometry(.16, .16, Lt + .1, 8), TM(0, h + rh + .16, 0, 0, 0, Math.PI / 2));
  if (o.panaderia) { // vigas del techo (se van con él) y el piso del desván que queda a la vista
    for (let k = 0; k < 6; k++) { const xx = lerp(-w / 2 + .5, w / 2 - .5, k / 5); for (const s of [1, -1]) { const [g, m] = cilEntre([xx, h, s * (d / 2 - .1)], [xx, h + rh - .05, 0], .07, 5); tadd("viga", g, m) } }
    add("maderaV", new THREE.BoxGeometry(w - .2, .12, d - .2), TM(0, h - .02, 0)); for (let k = 0; k < 5; k++) add("viga", new THREE.BoxGeometry(.18, .2, d - .1), TM(lerp(-w / 2 + .4, w / 2 - .4, k / 4), h - .14, 0)) }
  // chimenea de piedra en un frontón, con remate y dos cañones de barro
  const sxc = o.chimX ?? (r() < .5 ? 1 : -1), cx = sxc * (w / 2 - .55), cz = -d * .12, ctop = h + rh + .95 + r() * .4;
  add(mu, uvMuro(new THREE.BoxGeometry(.8, ctop - h + .3, .8), 2.4), TM(cx, (h - .3 + ctop) / 2, cz)); add("piedraC", RB1(1, .12, 1, .03), TM(cx, ctop + .06, cz));
  for (const s of [-1, 1]) { add("terracota", new THREE.CylinderGeometry(.11, .13, .38, 10, 1, true), TM(cx + s * .18, ctop + .31, cz)); add("oscuro", new THREE.CircleGeometry(.1, 10), TM(cx + s * .18, ctop + .49, cz, -Math.PI / 2)) }
  HUMOS.push(W(cx + .18, ctop + .5, cz));
  // puerta: jambas y dintel de piedra, hoja de tablas con herrajes, escalón
  const px = o.puertaX ?? (r() - .5) * Math.max(0, w - 3.6), dw = 1.12, dh = 2.15; const F = TM(px, 0, d / 2);
  add("piedraC", RB1(dw + .56, .28, .2, .03), F.clone().multiply(TM(0, dh + .14, .06))); for (const s of [-1, 1]) add("piedraC", RB1(.24, dh, .16, .03), F.clone().multiply(TM(s * (dw / 2 + .12), dh / 2, .05)));
  add("oscuro", new THREE.PlaneGeometry(dw, dh), F.clone().multiply(TM(0, dh / 2, .01))); add(col, new THREE.BoxGeometry(dw - .04, dh - .03, .06), F.clone().multiply(TM(0, dh / 2, .04)));
  for (const yy of [.35, dh - .4]) add("hierro", new THREE.BoxGeometry(dw * .75, .06, .02), F.clone().multiply(TM(-dw * .1, yy, .08)));
  add("hierro", new THREE.TorusGeometry(.075, .015, 6, 12), F.clone().multiply(TM(dw / 2 - .2, dh * .48, .1))); add("piedraC", RB1(dw + .7, .16, .62, .05), F.clone().multiply(TM(0, .02, .3)));
  // ventanas: al frente (a los lados de la puerta), atrás y en los frontones; arriba también si tiene dos pisos
  const vents = []; const vy = dos ? 1.05 : 1.15, va = .95, vh = 1.05;
  for (const s of [-1, 1]) { const vx = px + s * (dw / 2 + .9 + r() * .4); if (Math.abs(vx) + va / 2 + .35 < w / 2) vents.push([TM(vx, vy, d / 2), va]) }
  if (r() < .8) vents.push([TM((r() - .5) * (w - 2.4), vy, -d / 2, 0, Math.PI, 0), va]);
  for (const s of [-1, 1]) if (d > 4.6 && r() < .7) vents.push([TM(s * w / 2, vy, (r() - .5) * (d - 2.6), 0, s * Math.PI / 2, 0), .8]);
  if (dos) { const hu = h - hs; for (const xx of [-w * .25, w * .25]) vents.push([TM(xx, hs + (hu - vh) * .5, d / 2 + .1), va]); vents.push([TM(0, hs + (hu - vh) * .5, -d / 2 - .1, 0, Math.PI, 0), va]) }
  vents.forEach(([M, an]) => ventanaPiezas(add, M, an, vh, r, col));
  // las anclas: placa con argolla en cada esquina del alero, y la estaca de hierro con su bloque de piedra en el piso
  const anclas = [], esq = [[1, 1], [-1, 1], [1, -1], [-1, -1]];
  esq.forEach(([sx, sz]) => { const ax = sx * (w / 2 + ovx - .18), az = sz * (d / 2 + ovz - .14), ay = ye - .02; tadd("hierro", new THREE.BoxGeometry(.3, .06, .3), TM(ax, ay + .06, az)); tadd("hierro", new THREE.TorusGeometry(.09, .025, 6, 12), TM(ax, ay - .04, az, 0, Math.PI / 4 * sx * sz, 0));
    const ex = sx * (w / 2 + (o.estX ?? 1.55)), ez = sz * (d / 2 + (o.estZ ?? 1.25)), pw = W(ex, 0, ez), gy = SUELO(pw.x, pw.z) - y0;
    add("zocalo", RB1(.58, .36, .58, .06), TM(ex, gy + .02, ez, 0, r(), 0)); add("hierroO", new THREE.CylinderGeometry(.045, .055, .62, 7), TM(ex, gy + .3, ez, sz * .25, 0, -sx * .25)); add("hierroO", new THREE.TorusGeometry(.085, .024, 6, 12), TM(ex + sx * .07, gy + .62, ez + sz * .07, 0, Math.PI / 4 * sx * sz, 0));
    const A = W(ax, ay - .12, az), B = W(ex + sx * .1, gy + .6, ez + sz * .1); anclas.push({ a: A.toArray(), b: B.toArray(), sx, sz }) });
  const C = { x, z, ry, w, d, h, y0, HM, px, rh, ye, dos, hs, col, techo, mu, anclas, chim: [cx, ctop, cz], r, seed, F, dw, dh };
  anclas.forEach((an, i) => CADENAS.push({ casa: C, i, a: an.a, b: an.b, sx: an.sx, sz: an.sz }));
  CASAS_V.push(C); RECTS.push({ x, z, ry, w: w + 2 * (o.estX ?? 1.55) + .8, d: d + 2 * (o.estZ ?? 1.25) + .8, casa: C }); return C }

// ---------- el pueblo: la casa del narrador, la panadería (su techo es un grupo aparte que vuela), y ≈ 30 casas en anillos y calles
Object.keys(PUNTOS).forEach(k => ocupa(PUNTOS[k][0], PUNTOS[k][1], PUNTOS_R[k]));
const MI_CASA = casaV(CASA_MIA[0], CASA_MIA[1], -Math.PI / 2, 6.4, 5.2, 3.6, 4501, { dos: true, muro: 1, techo: "piz0", color: 0, puertaX: -.9 });
const TECHO_P = new THREE.Group(); scene.add(TECHO_P); const L_TECHO_P = lote();
const PANAD_C = casaV(PANAD[0], PANAD[1], Math.PI / 2, 7.2, 5.6, 3.5, 4502, { dos: false, muro: 3, techo: "teja0", color: 3, puertaX: -1.2, panaderia: true, techoL: L_TECHO_P, chimX: -1 });
{ const C = PANAD_C; TECHO_P.position.copy(new THREE.Vector3(0, C.h, 0).applyMatrix4(C.HM)); TECHO_P.rotation.y = C.ry; L_TECHO_P.fin(TECHO_P, CASA_MATS); TECHO_P.userData.p0 = TECHO_P.position.clone() }
{ const r = rng(4510), cerca = (x, z, R) => CASAS_V.every(c => Math.hypot(c.x - x, c.z - z) > R + Math.hypot(c.w, c.d) / 2 + 1.1);
  const pon = (x, z, ry, o = {}) => { const w = 5.6 + r() * 2.2, d = 4.6 + r() * 1.2, h = 3.3 + r() * .6, R = Math.hypot(w, d) / 2 + .9;
    if (CASAS_V.length >= 48 || !cerca(x, z, R) || zonaLibre(x, z, R + .5) || Math.hypot(x - COLINA[0], z - COLINA[1]) < 16 + R || OCUP.some(q => Math.hypot(q.x - x, q.z - z) < q.r + R) || sendaK(x, z) > .3 || x > 84) return false;
    casaV(x, z, ry, w, d, h, 4520 + CASAS_V.length * 7, o); return true };
  const mira = (x, z) => Math.atan2(-x, -z);
  // anillo de la plaza (mirando al centro)
  for (let k = 0; k < 15; k++) { const a = k / 15 * 6.283 + .15, x = Math.cos(a) * 20.5, z = Math.sin(a) * 19.5; pon(x, z, mira(x, z)) }
  // calle principal (frentes al camino) y calle del sur
  for (let x = 24; x < 84; x += 10 + r() * 3) { pon(x, -11 - r(), 0); pon(x + 4, 6 + r(), Math.PI) }
  for (let x = -24; x > -100; x -= 10 + r() * 3) { pon(x, -2 - r(), 0); if (x < -46) pon(x - 4, 17 + r(), Math.PI) }
  for (let z = 24; z < 50; z += 9 + r() * 2) { pon(-5 - r(), z, Math.PI / 2); pon(15 + r(), z + 3, -Math.PI / 2) }
  for (let k = 0; k < 20; k++) { const a = k / 20 * 6.283 + .4, x = Math.cos(a) * 31, z = Math.sin(a) * 30; pon(x, z, mira(x, z) + (r() - .5) * .3) }
  for (let k = 0; k < 3000 && CASAS_V.length < 48; k++) { const a = r() * 6.283, d = 26 + r() * 42, x = Math.cos(a) * d, z = Math.sin(a) * d; pon(x, z, mira(x, z) + (r() - .5) * .6) } }
const CASAS_M = L_CASA.fin(scene, CASA_MATS); CASAS_M.oscuro.castShadow = false; CASAS_M.vidrio.castShadow = false;

// ---------- LAS CADENAS: eslabones gruesos instanciados (las de 3 casas cerca de la plaza y las de la panadería pueden cortarse: van aparte)
const GEO_ESLABON = (() => { const g = new THREE.TorusGeometry(.085, .027, 5, 9); g.scale(1.4, 1, 1); return g })();
const ESL_PASO = .19;
const ponEslabones = (im, n0, A, B, sag = .05) => { const a = new THREE.Vector3(...A), b = new THREE.Vector3(...B), L = a.distanceTo(b), n = Math.max(2, Math.floor(L / ESL_PASO)), q = new THREE.Quaternion(), X = new THREE.Vector3(1, 0, 0), roll = new THREE.Quaternion(), p = new THREE.Vector3(), p2 = new THREE.Vector3(), dir = new THREE.Vector3();
  const pt = (u, o) => o.lerpVectors(a, b, u).add(new THREE.Vector3(0, -Math.sin(u * Math.PI) * sag * L / 5, 0));
  for (let k = 0; k < n; k++) { const u = (k + .5) / n; pt(u, p); pt(Math.min(1, u + .01), p2); dir.subVectors(p2, p).normalize(); q.setFromUnitVectors(X, dir); roll.setFromAxisAngle(dir, k % 2 ? Math.PI / 2 : 0); dummy.position.copy(p); dummy.quaternion.copy(roll.multiply(q)); dummy.scale.setScalar(1); dummy.updateMatrix(); im.setMatrixAt(n0 + k, dummy.matrix) } return n };
const ROTAS_CASAS = (() => { const cand = CASAS_V.filter(c => c !== MI_CASA && c !== PANAD_C).sort((a, b) => Math.hypot(a.x - 4, a.z - 2) - Math.hypot(b.x - 4, b.z - 2)); return cand.slice(0, 3) })();
// en cada casa que se corta, las dos cadenas del lado de +x (sueltas, el viento las tira hacia afuera); en la panadería, las cuatro
const ROTAS = CADENAS.filter(c => (ROTAS_CASAS.includes(c.casa) && new THREE.Vector3(c.b[0] - c.casa.x, 0, c.b[2] - c.casa.z).x > 0) || c.casa === PANAD_C);
const CADENAS_M = (() => { const fijas = CADENAS.filter(c => !ROTAS.includes(c)); const im = new THREE.InstancedMesh(GEO_ESLABON, M_HIERRO_O, fijas.length * 60); let n = 0; fijas.forEach(c => { n += ponEslabones(im, n, c.a, c.b) }); im.count = n; im.castShadow = true; im.receiveShadow = true; im.instanceMatrix.needsUpdate = true; scene.add(im); return im })();
const CADENAS_D = (() => { const im = new THREE.InstancedMesh(GEO_ESLABON, M_HIERRO_O, ROTAS.length * 60); im.castShadow = true; im.frustumCulled = false; scene.add(im); return im })();
ROTAS.forEach((c, i) => { c.L = new THREE.Vector3(...c.a).distanceTo(new THREE.Vector3(...c.b)); c.fase = i * 1.7; c.ub = c.casa === PANAD_C ? .02 : ROTAS_CASAS.indexOf(c.casa) * .28 + (c.sz > 0 ? 0 : .06) });
// cadena suelta que latiguea: anclada en P0, larga L, tira hacia +x; modo "techo" (cuelga del alero) o "piso" (anclada a la estaca, a ras)
function ponCadenaSuelta(im, n0, P0, L, t, fase, modo, fz = 1) { const n = Math.floor(L / ESL_PASO), q = new THREE.Quaternion(), X = new THREE.Vector3(1, 0, 0), roll = new THREE.Quaternion(), dir = new THREE.Vector3(), pts = []; let p = new THREE.Vector3(...P0); pts.push(p.clone());
  for (let k = 1; k <= n; k++) { const s = k / n, base = modo === "techo" ? -.55 + .25 * Math.sin(t * 2.1 + fase) * fz - s * .25 : .12 + .1 * Math.sin(t * 2.6 + fase), ola = (.75 * Math.sin(s * 5.5 - t * 15 * fz + fase) + .3 * Math.sin(s * 11 - t * 23 + fase * 2)) * s * fz, a = base + ola * .9;
    dir.set(Math.cos(a), Math.sin(a), .25 * Math.sin(t * 3.3 + s * 4 + fase) * s).normalize(); p = p.clone().addScaledVector(dir, ESL_PASO); if (modo === "piso") p.y = Math.max(p.y, SUELO(p.x, p.z) + .06); pts.push(p) }
  for (let k = 0; k < n; k++) { const a2 = pts[k], b2 = pts[k + 1]; dir.subVectors(b2, a2).normalize(); q.setFromUnitVectors(X, dir); roll.setFromAxisAngle(dir, k % 2 ? Math.PI / 2 : 0); dummy.position.lerpVectors(a2, b2, .5); dummy.quaternion.copy(roll.multiply(q)); dummy.scale.setScalar(1); dummy.updateMatrix(); im.setMatrixAt(n0 + k, dummy.matrix) } return n }

// ---------- LA TORRE: piedra en sillares, cuadrada (5,2 abajo → 4,6 arriba), 14 de alto, puerta al sur, troneras, peldaños de hierro
// al oeste (de nada sirven con este viento), cornisa, techo de pizarra en punta y la VELETA. «BOOTS ON. ALWAYS.» pintado al sur (+z).
const TORRE_A0 = 2.6, TORRE_A1 = 2.3, torreA = y => lerp(TORRE_A0, TORRE_A1, cl(y / TORRE_H));   // medio ancho a cada altura
const TORRE_Y = SUELO(TORRE[0], TORRE[1]) - .05;
const TORRE_G = new THREE.Group(); TORRE_G.position.set(TORRE[0], TORRE_Y, TORRE[1]); scene.add(TORRE_G);
const T_LETRERO = (() => { const t = tex(1024, 1280, (g, w, h) => { const r = rng(4601); g.clearRect(0, 0, w, h); g.textAlign = "center"; g.textBaseline = "middle";
    const linea = (txt, y, size) => { g.font = `900 ${size}px Impact, 'Arial Black', sans-serif`; const m = g.measureText(txt).width, sx = Math.min(1.12, 940 / m);
      for (const [col, dx, dy] of [["rgba(40,30,20,.45)", 8, 10], ["#e2dccd", 0, 0]]) { g.save(); g.translate(w / 2 + dx, y + dy); g.scale(sx, 1); g.fillStyle = col; g.fillText(txt, 0, 0); g.restore() }
      // chorreaduras de cal debajo de cada letra
      for (let k = 0; k < 16; k++) { const x = w / 2 + (r() - .5) * m * sx * .92, L = 20 + r() * 90; g.strokeStyle = "rgba(239,233,220,.85)"; g.lineWidth = 3 + r() * 7; g.lineCap = "round"; g.beginPath(); g.moveTo(x, y + size * .36); g.lineTo(x + (r() - .5) * 3, y + size * .36 + L); g.stroke() } };
    linea("BOOTS", 230, 330); linea("ON.", 560, 330); linea("ALWAYS.", 950, 300);
    // pincel gastado: raspones, piedra que asoma, lavado del viento (todo corrido hacia +x)
    g.globalCompositeOperation = "destination-out"; for (let k = 0; k < 1500; k++) { g.fillStyle = `rgba(0,0,0,${.2 + r() * .5})`; g.fillRect(r() * w, r() * h, 3 + r() * 30, 1 + r() * 3) }
    for (let k = 0; k < 140; k++) { g.fillStyle = "rgba(0,0,0,.85)"; g.beginPath(); g.ellipse(r() * w, r() * h, 4 + r() * 18, 2 + r() * 9, r() * 3, 0, 7); g.fill() } g.globalCompositeOperation = "source-over" }); return t })();
{ const r = rng(4610), L = lote(), H = TORRE_H;
  // cuerpo: caja que se angosta hacia arriba
  { const g = new THREE.BoxGeometry(2 * TORRE_A0, H, 2 * TORRE_A0, 1, 6, 1), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i) + H / 2, k = torreA(y) / TORRE_A0; p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k) } g.computeVertexNormals(); g.translate(0, H / 2, 0); L.add("torre", uvMuro(g, 4.2)) }
  L.add("zocalo", uvMuro(new THREE.BoxGeometry(2 * TORRE_A0 + .7, 1.6, 2 * TORRE_A0 + .7), 3), TM(0, -.4, 0)); L.add("piedraC", RB1(2 * TORRE_A0 + .9, .22, 2 * TORRE_A0 + .9, .05), TM(0, .42, 0));
  // esquineras salientes
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) for (let y = .8, k = 0; y < H - .6; y += .62, k++) { const a = torreA(y), la = k % 2 ? .9 : .5; L.add("piedraC", RB1(k % 2 ? la : .32, .56, k % 2 ? .32 : la, .05), TM(sx * (a + .06) - sx * (k % 2 ? la / 2 - .16 : 0), y, sz * (a + .06) - sz * (k % 2 ? 0 : la / 2 - .16))) }
  // cinta de piedra a media altura y la cornisa con ménsulas
  for (const y of [4.6, 11.4]) { const a = torreA(y); L.add("piedraC", RB1(2 * a + .28, .22, 2 * a + .28, .05), TM(0, y, 0)) }
  { const a = torreA(H); L.add("piedraC", RB1(2 * a + .7, .3, 2 * a + .7, .06), TM(0, H - .05, 0)); for (let s = 0; s < 4; s++) for (let k = 0; k < 6; k++) { const u = lerp(-a + .35, a - .35, k / 5), M = TM(0, 0, 0, 0, s * Math.PI / 2, 0); L.add("piedraC", RB1(.26, .38, .34, .04), M.clone().multiply(TM(u, H - .38, a + .12))) } }
  // puerta al sur con arco de dovelas y escalones
  { const M = TM(0, 0, torreA(1.3) + .02); L.add("oscuro", new THREE.PlaneGeometry(1.4, 2.5), M.clone().multiply(TM(0, 1.25, .01))); L.add("puerta", new THREE.BoxGeometry(1.32, 2.4, .08), M.clone().multiply(TM(0, 1.2, .03)));
    for (let k = 0; k < 9; k++) { const a = k / 8 * Math.PI; L.add("piedraC", RB1(.3, .42, .24, .04), M.clone().multiply(TM(Math.cos(a) * .86, 2.4 + Math.sin(a) * .5, .06, 0, 0, a - Math.PI / 2))) }
    for (const s of [-1, 1]) L.add("piedraC", RB1(.3, 2.4, .22, .04), M.clone().multiply(TM(s * .86, 1.2, .05))); for (const yy of [.5, 1.9]) L.add("hierro", new THREE.BoxGeometry(1.2, .08, .03), M.clone().multiply(TM(0, yy, .09)));
    for (let k = 0; k < 3; k++) L.add("piedraC", RB1(2.2 - k * .3, .18, .5, .04), M.clone().multiply(TM(0, .09 + k * .18 - .18, .55 - k * .25))) }
  // troneras (oscuras con su marco)
  for (const [s, y, u] of [[1, 6.5, .6], [1, 10.4, -.5], [2, 7.4, -.3], [3, 9.2, .4], [3, 4, 0], [2, 12.6, 0], [0, 12.7, -.9], [0, 12.7, .9]]) { const a = torreA(y), M = TM(0, 0, 0, 0, s * Math.PI / 2, 0).multiply(TM(u, y, a + .01)); L.add("oscuro", new THREE.PlaneGeometry(.3, 1.1), M.clone().multiply(TM(0, 0, .015))); L.add("piedraC", RB1(.62, .16, .2, .03), M.clone().multiply(TM(0, .63, .05))); L.add("piedraC", RB1(.62, .14, .24, .03), M.clone().multiply(TM(0, -.62, .06))) }
  // peldaños de hierro en la cara oeste (−x): de 1,6 a 13,6
  for (let y = 1.6; y < H - .3; y += .36) { const a = torreA(y), M = TM(-a - .01, y, .9, 0, -Math.PI / 2, 0); L.add("hierroO", new THREE.CylinderGeometry(.022, .022, .5, 5), M.clone().multiply(TM(0, 0, .2, 0, 0, Math.PI / 2))); for (const s of [-1, 1]) L.add("hierroO", new THREE.CylinderGeometry(.02, .02, .22, 4), M.clone().multiply(TM(s * .24, 0, .1, Math.PI / 2, 0, 0))) }
  // techo de pizarra en punta (pirámide de 4 caras) con alero, y el remate donde nace la veleta
  { const a = torreA(H) + .5, hh = 1.55, g = new THREE.ConeGeometry(a * Math.SQRT2, hh, 4, 1, true); g.rotateY(Math.PI / 4); geoUV(g, (x, y, z) => (Math.abs(x) > Math.abs(z) ? z : x) / 2.4, (x, y) => -y / 2.4); L.add("piz", g, TM(0, H + .1 + hh / 2, 0));
    L.add("oscuro", new THREE.BoxGeometry(2 * a - .2, .05, 2 * a - .2), TM(0, H + .12, 0)); L.add("hierro", new THREE.CylinderGeometry(.12, .16, .4, 10), TM(0, H + 1.55, 0)) }
  // las cuerdas de banderines salen de dos argollas de la cara sur (las pone el detalle)
  const ms = L.fin(TORRE_G, { torre: M_TORRE_P, zocalo: M_ZOCALO, piedraC: M_PIEDRA_C, oscuro: M_OSCURO, puerta: M_PUERTA[7], hierro: M_HIERRO, hierroO: M_HIERRO_O, piz: M_PIZ[1] }); ms.oscuro.castShadow = false;
  // el letrero pintado: calcomanía sobre la cara sur (y de 5 a 11), un poco inclinada como el muro
  const y0 = 5, y1 = 11.2, ym = (y0 + y1) / 2, inc = Math.atan((TORRE_A0 - TORRE_A1) / H), pl = new THREE.Mesh(new THREE.PlaneGeometry(4.1, (y1 - y0) / Math.cos(inc)), new THREE.MeshStandardMaterial({ map: T_LETRERO, bumpMap: T_SILLAR[1], bumpScale: 3, roughness: .9, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }));
  pl.position.set(0, ym, torreA(ym) + .012); pl.rotation.x = -inc; pl.receiveShadow = true; TORRE_G.add(pl) }
ocupa(TORRE[0], TORRE[1], 4.2);

// ---------- LA VELETA de hierro: gallo sobre una flecha grande (cabeza al oeste, de donde viene el viento; cola ancha al este), cruz con N S E W.
// veleta(t, { doblez: 0..1, rota: 0..1, pos, rot }) — doblez la inclina hacia +x (el peso de Pip); rota la arranca: en rota = 1 la pieza queda suelta
// (VELETA_PIEZA, en la escena) y se puede mover con pos = [x, y, z] y rot = [rx, ry, rz]. VELETA_W() = punto donde se cuelga alguien [x, y, z].
const M_VELETA = new THREE.MeshStandardMaterial({ color: "#2a2624", roughness: .45, metalness: .7 });
const VEL_BASE_Y = TORRE_H + 1.75;   // donde nace el mástil (encima del remate del techo)
const VEL_BASE = new THREE.Group(); VEL_BASE.position.set(TORRE[0], TORRE_Y + VEL_BASE_Y, TORRE[1]); scene.add(VEL_BASE);
const VEL_DOBLA = new THREE.Group(); VEL_DOBLA.position.y = .05; VEL_BASE.add(VEL_DOBLA);
const VELETA_PIEZA = new THREE.Group(); VELETA_PIEZA.position.y = TORRE_Y + VELETA_Y - (TORRE_Y + VEL_BASE_Y) - .05; VEL_DOBLA.add(VELETA_PIEZA);
const VEL_GIRO = new THREE.Group(); VELETA_PIEZA.add(VEL_GIRO);
const VEL_COLGAR = new THREE.Vector3(.95, -.06, 0);   // en VEL_GIRO: sobre la varilla, del lado de la cola (+x)
{ const L = lote(), Lp = lote(), Lg = lote(), h0 = VELETA_PIEZA.position.y;   // h0 = altura del eje sobre el doblez (≈ 0,4)
  // mástil (parte fija y parte que se dobla), con anillos
  L.add("v", new THREE.CylinderGeometry(.05, .07, .4, 10), TM(0, -.15, 0)); Lp.add("v", new THREE.CylinderGeometry(.045, .05, h0 + .02, 10), TM(0, h0 / 2 - .02, 0));
  // la cruz de los puntos cardinales con sus letras (debajo del eje, sobre el tramo que se dobla)
  const yc = h0 * .35; Lp.add("v", new THREE.CylinderGeometry(.025, .025, 1.5, 6), TM(0, yc, 0, 0, 0, Math.PI / 2)); Lp.add("v", new THREE.CylinderGeometry(.025, .025, 1.5, 6), TM(0, yc, 0, Math.PI / 2, 0, 0)); Lp.add("v", new THREE.SphereGeometry(.08, 10, 8), TM(0, yc, 0));
  const barra = (L2, x0, y0, x1, y1, M) => { const [g, m] = cilEntre([x0, y0, 0], [x1, y1, 0], .022, 5); L2.add("v", g, M.clone().multiply(m)) };
  const letra = (ch, M) => { const s = .26; if (ch === "N") { barra(Lp, -s / 2, 0, -s / 2, s, M); barra(Lp, -s / 2, s, s / 2, 0, M); barra(Lp, s / 2, 0, s / 2, s, M) }
    if (ch === "E") { barra(Lp, -s / 2, 0, -s / 2, s, M); for (const y of [0, s / 2, s]) barra(Lp, -s / 2, y, s / 2 * (y === s / 2 ? .6 : 1), y, M) }
    if (ch === "W") { barra(Lp, -s / 2, s, -s / 4, 0, M); barra(Lp, -s / 4, 0, 0, s * .7, M); barra(Lp, 0, s * .7, s / 4, 0, M); barra(Lp, s / 4, 0, s / 2, s, M) }
    if (ch === "S") { for (const [yy, rot] of [[s * .75, Math.PI / 2], [s * .25, -Math.PI / 2]]) Lp.add("v", new THREE.TorusGeometry(s / 4, .022, 5, 10, Math.PI * 1.25), M.clone().multiply(TM(0, yy, 0, 0, 0, rot))) } };
  [["N", 0, -.82, 0], ["S", 0, .82, Math.PI], ["E", .82, 0, -Math.PI / 2], ["W", -.82, 0, Math.PI / 2]].forEach(([ch, x, z, ry]) => letra(ch, TM(x, yc + .05, z, 0, ry + Math.PI, 0)));
  // la pieza que gira: varilla, cabeza de flecha (al oeste), cola ancha calada (al este), y el gallo encima, con su ruedita de giro
  Lg.add("v", new THREE.CylinderGeometry(.04, .04, 3.1, 8), TM(.1, 0, 0, 0, 0, Math.PI / 2)); Lg.add("v", new THREE.CylinderGeometry(.07, .07, .22, 10), TM(0, 0, 0));
  const ext = (sh, dep, M) => { const g = new THREE.ExtrudeGeometry(sh, { depth: dep, bevelEnabled: true, bevelThickness: .01, bevelSize: .01, bevelSegments: 1 }); g.translate(0, 0, -dep / 2); Lg.add("v", g, M) };
  { const s = new THREE.Shape(); s.moveTo(-1.85, 0); s.lineTo(-1.35, .3); s.lineTo(-1.42, .08); s.lineTo(-1.3, 0); s.lineTo(-1.42, -.08); s.lineTo(-1.35, -.3); s.closePath(); ext(s, .05, TM()) }
  { const s = new THREE.Shape(); s.moveTo(1.0, .05); s.lineTo(1.25, .52); s.lineTo(1.82, .58); s.lineTo(1.6, .05); s.lineTo(1.6, -.05); s.lineTo(1.82, -.58); s.lineTo(1.25, -.52); s.lineTo(1.0, -.05); s.closePath();
    const hu = new THREE.Path(); hu.moveTo(1.3, .2); hu.lineTo(1.5, .38); hu.lineTo(1.45, .12); hu.closePath(); s.holes.push(hu); const hu2 = new THREE.Path(); hu2.moveTo(1.3, -.2); hu2.lineTo(1.45, -.12); hu2.lineTo(1.5, -.38); hu2.closePath(); s.holes.push(hu2); ext(s, .05, TM()) }
  // el gallo (silueta calada, mirando al oeste como la flecha)
  { const s = new THREE.Shape(), P = [[.55, 0], [.62, .18], [.5, .34], [.3, .38], [.1, .42], [-.08, .5], [-.16, .66], [-.24, .78], [-.2, .9], [-.3, .98], [-.36, .92], [-.42, 1.0], [-.48, .9], [-.42, .84], [-.5, .8], [-.58, .74], [-.48, .7], [-.42, .62], [-.36, .52], [-.32, .36], [-.24, .22], [-.18, .1], [-.1, 0]];
    s.moveTo(P[0][0], P[0][1]); P.slice(1).forEach(([x, y]) => s.lineTo(x, y)); s.closePath();
    // cola de plumas grandes hacia el este
    const c = new THREE.Shape(); c.moveTo(.4, .12); c.quadraticCurveTo(.75, .6, .62, 1.05); c.quadraticCurveTo(.9, .7, .96, .9); c.quadraticCurveTo(1.0, .5, .86, .34); c.quadraticCurveTo(1.05, .45, 1.08, .6); c.quadraticCurveTo(1.0, .2, .55, .08); c.closePath();
    const ojo = new THREE.Path(); ojo.absarc(-.34, .84, .03, 0, 6.283, true); s.holes.push(ojo); ext(s, .045, TM(-.15, .04, 0)); ext(c, .045, TM(-.15, .04, 0));
    for (const xx of [-.05, .14]) Lg.add("v", new THREE.CylinderGeometry(.018, .018, .1, 4), TM(xx - .15, .02, 0)) }
  L.fin(VEL_BASE, { v: M_VELETA }); Lp.fin(VEL_DOBLA, { v: M_VELETA }); Lg.fin(VEL_GIRO, { v: M_VELETA }) }
// lo que queda en el mástil cuando la veleta se arranca: un muñón doblado
const VEL_MUNON = (() => { const m = new THREE.Mesh(mergeG([[new THREE.CylinderGeometry(.045, .05, .22, 8), TM(0, .11, 0)], [new THREE.ConeGeometry(.05, .12, 6), TM(.02, .26, 0, 0, 0, -.4)]]), M_VELETA); m.visible = false; VEL_DOBLA.add(m); return m })();
const VEL_ESTADO = { t: 0, doblez: 0, rota: 0 };
function veleta(t, o = {}) { const db = cl(o.doblez ?? 0), ro = cl(o.rota ?? 0), f = RAFAGA.value; VEL_ESTADO.t = t; VEL_ESTADO.doblez = db; VEL_ESTADO.rota = ro;
  // el viento la sostiene apuntando al oeste: oscila un poco, y tiembla (más con más viento y con el peso)
  const osc = Math.sin(t * 1.3) * .07 * f + Math.sin(t * 3.7 + 1) * .04 * f, tiem = (Math.sin(t * 41) * .012 + Math.sin(t * 57 + 2) * .008) * (f + db * 2 + ro * 3);
  VEL_DOBLA.rotation.set(tiem * .5, 0, -db * 1.05 - ro * .25 - Math.max(0, f - 1) * .03 + tiem);
  if (ro < 1) { if (VELETA_PIEZA.parent !== VEL_DOBLA) { VEL_DOBLA.add(VELETA_PIEZA) } VELETA_PIEZA.position.set(0, TORRE_Y + VELETA_Y - (TORRE_Y + VEL_BASE_Y) - .05, 0); VELETA_PIEZA.rotation.set(0, 0, -ro * .35 + tiem * 2 * ro); VEL_GIRO.rotation.set(tiem * (1 + db * 3), osc + db * .05, tiem * db * 2); VEL_MUNON.visible = false; VELETA_PIEZA.visible = true }
  else { // suelta: queda donde se rompió (o donde la ponga la escena)
    if (VELETA_PIEZA.parent !== scene) { VEL_DOBLA.updateMatrixWorld(true); VELETA_PIEZA.position.set(0, TORRE_Y + VELETA_Y - (TORRE_Y + VEL_BASE_Y) - .05, 0); VELETA_PIEZA.rotation.set(0, 0, -.35); VELETA_PIEZA.updateMatrix(); const M = VEL_DOBLA.matrixWorld.clone().multiply(VELETA_PIEZA.matrix); scene.add(VELETA_PIEZA); M.decompose(VELETA_PIEZA.position, VELETA_PIEZA.quaternion, VELETA_PIEZA.scale) }
    if (o.pos) VELETA_PIEZA.position.set(...o.pos); if (o.rot) VELETA_PIEZA.rotation.set(...o.rot); VEL_GIRO.rotation.set(0, 0, 0); VEL_MUNON.visible = true } }
const VELETA_W = () => { VEL_GIRO.updateMatrixWorld(true); return VEL_COLGAR.clone().applyMatrix4(VEL_GIRO.matrixWorld).toArray() };

// ---------- ÁRBOLES TORCIDOS («krummholz»): tronco que crece acostado hacia +x, ramas solo del lado del viento, copas aplastadas y estiradas
const T_CORTEZA = (() => { const [c, z] = pintarDoble(256, 512, (c, z, w, h) => { const r = rng(4701); c.fillStyle = "#6a5e50"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
    for (let k = 0; k < 260; k++) { const x = r() * w, y = r() * h, L = 30 + r() * 140; c.strokeStyle = r() < .5 ? `rgba(40,32,24,${.3 + r() * .4})` : `rgba(170,160,140,${.2 + r() * .3})`; c.lineWidth = 2 + r() * 5; c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + (r() - .5) * 20, y + L / 3, x + (r() - .5) * 20, y + L * .66, x + (r() - .5) * 10, y + L); c.stroke(); z.strokeStyle = "rgba(20,20,20,.6)"; z.lineWidth = 3; z.beginPath(); z.moveTo(x, y); z.lineTo(x, y + L); z.stroke() }
    for (let k = 0; k < 60; k++) { c.fillStyle = r() < .5 ? "rgba(150,160,90,.4)" : "rgba(220,215,190,.4)"; c.beginPath(); c.arc(r() * w, r() * h, 2 + r() * 6, 0, 7); c.fill() } });
  [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
const T_FOLLAJE = (() => { const [c, z] = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(4702); c.fillStyle = "#8a9a6a"; c.fillRect(0, 0, w, h); z.fillStyle = "#606060"; z.fillRect(0, 0, w, h);
    for (let k = 0; k < 5000; k++) { const x = r() * w, y = r() * h, L = 6 + r() * 12, a = -.3 + (r() - .5) * .8, v = r(); c.strokeStyle = v < .4 ? "rgba(40,56,26,.6)" : v < .8 ? "rgba(140,160,96,.5)" : "rgba(200,210,150,.5)"; c.lineWidth = 1.5 + r() * 1.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); c.stroke(); z.strokeStyle = v < .4 ? "rgba(20,20,20,.5)" : "rgba(220,220,220,.5)"; z.lineWidth = 2; z.beginPath(); z.moveTo(x, y); z.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); z.stroke() } });
  [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
const M_CORTEZA = new THREE.MeshStandardMaterial({ map: T_CORTEZA.c, bumpMap: T_CORTEZA.z, bumpScale: 4, roughness: .95 });
const M_COPA = conViento(new THREE.MeshStandardMaterial({ map: T_FOLLAJE.c, bumpMap: T_FOLLAJE.z, bumpScale: 5, roughness: .85, color: "#ffffff" }), "copa", .07);
const tubo = (pts, r0, r1, seg = 7, ts = 10) => { const cu = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), g = new THREE.TubeGeometry(cu, ts, 1, seg, false), p = g.attributes.position, uv = g.attributes.uv, P = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { const u = uv.getX(i), c2 = cu.getPointAt(u); P.set(p.getX(i), p.getY(i), p.getZ(i)).sub(c2).multiplyScalar(lerp(r0, r1, u)).add(c2); p.setXYZ(i, P.x, P.y, P.z); uv.setXY(i, uv.getY(i) * 2, u * cu.getLength() / 2) } g.computeVertexNormals(); return g };
const GEO_ARBOL = [0, 1, 2, 3].map(v => { const r = rng(4710 + v), T = [], C = [], H = 3.2 + r() * 1.4, inc = .55 + r() * .3;
  const tr = [[0, -.2, 0], [.15, H * .3, 0], [H * inc * .45, H * .62, (r() - .5) * .3], [H * inc * .95, H * .85, (r() - .5) * .4], [H * inc * 1.5, H * .95, (r() - .5) * .5]]; T.push([tubo(tr, .26 + r() * .08, .07), TM()]);
  // raíces que se agarran del piso del lado del viento
  for (let k = 0; k < 4; k++) { const a = Math.PI + (r() - .5) * 2.2; T.push([tubo([[0, .3, 0], [Math.cos(a) * .5, .05, Math.sin(a) * .5], [Math.cos(a) * 1.1, -.1, Math.sin(a) * 1.1]], .12, .03, 5, 5), TM()]) }
  const cu = new THREE.CatmullRomCurve3(tr.map(p => new THREE.Vector3(...p)));
  for (let k = 0; k < 7; k++) { const u = .35 + k / 7 * .6, p = cu.getPointAt(u), L = 1.4 + r() * 1.8 * (1 - u * .3), zs = (r() - .5) * 2.2, yb = (r() - .2) * .6, q = [p.toArray(), [p.x + L * .45, p.y + yb * .5, p.z + zs * .4], [p.x + L, p.y + yb, p.z + zs]];
    T.push([tubo(q, .09 - u * .04, .025, 5, 5), TM()]);
    // copa: almohadones aplastados a lo largo de la rama, estirados hacia +x
    for (let j = 0; j < 4; j++) { const s = .38 + r() * .34, g = geoPiedra(4720 + v * 31 + k * 5 + j, 1, .62); C.push([g, TM(p.x + L * (.3 + j * .25) + (r() - .5) * .3, p.y + yb * (.4 + j * .2) + .1 + (r() - .3) * .35, p.z + zs * (.4 + j * .2) + (r() - .5) * .4, 0, (r() - .5) * .4, 0, s * 1.6, s * .85, s * 1.15)]) } }
  for (let j = 0; j < 3; j++) { const p = cu.getPointAt(1), s = .7 + r() * .4; C.push([geoPiedra(4790 + v * 7 + j, 1, .5), TM(p.x + .3 + j * .6, p.y + .2 + (r() - .5) * .3, p.z + (r() - .5) * .8, 0, 0, 0, s * 1.8, s * .7, s * 1.2)]) }
  const gc = mergeG(C), pc = gc.attributes.position, uc = gc.attributes.uv; for (let i = 0; i < pc.count; i++) uc.setXY(i, pc.getX(i) / 1.6, (pc.getY(i) + pc.getZ(i)) / 1.6);
  return [mergeG(T), gc] });
const ARBOLES = [];
{ const r = rng(4800), lugares = [[22, 24, 1.15], [-17, -22, 1.05], [27, -24, 1.2], [-34, -8, 1.1], [32, 12, .95]];
  for (let k = 0; k < 900 && lugares.length < 95; k++) { const a = r() * 6.283, d = 26 + r() * 95, x = Math.cos(a) * d, z = Math.sin(a) * d * .9; if (x > 86 || Math.hypot(x - COLINA[0], z - COLINA[1]) < 13 || sendaK(x, z) > .2 || !libreEn(x, z, 2.5)) continue; if (lugares.some(([x2, z2]) => Math.hypot(x2 - x, z2 - z) < 5)) continue; lugares.push([x, z, .8 + r() * .6]) }
  lugares.forEach(([x, z, s]) => { ocupa(x, z, 1.4 * s); ARBOLES.push([x, z, s]) });
  const ims = GEO_ARBOL.map(([gt, gc]) => { const a = new THREE.InstancedMesh(gt, M_CORTEZA, ARBOLES.length), b = new THREE.InstancedMesh(gc, M_COPA, ARBOLES.length); a.count = b.count = 0; [a, b].forEach(m => { m.castShadow = m.receiveShadow = true; scene.add(m) }); return [a, b] }), cc = new THREE.Color();
  ARBOLES.forEach(([x, z, s], i) => { const [a, b] = ims[i % 4], n = a.count++; b.count++; dummy.position.set(x, SUELO(x, z) - .05, z); dummy.rotation.set(0, (r() - .5) * .45, 0); dummy.scale.set(s, s * (.9 + r() * .2), s); dummy.updateMatrix(); a.setMatrixAt(n, dummy.matrix); b.setMatrixAt(n, dummy.matrix); b.setColorAt(n, cc.set(["#8aa05a", "#7a9250", "#98a862", "#86984e", "#a0aa66"][r() * 5 | 0])) }) }

// ---------- arbustos achaparrados (también estirados a sotavento), piedras sueltas, cercas de piedra seca y flores chicas en 3D
const GEO_ARBUSTO = [0, 1, 2].map(v => { const r = rng(4850 + v), L = []; for (let k = 0; k < 7; k++) { const s = .2 + r() * .16, x = k * .16 + (r() - .5) * .3; L.push([geoPiedra(4860 + v * 13 + k, 1, .8), TM(x, s * .5 + (r() - .3) * .1, (r() - .5) * .4, r(), r() * 6, r(), s * 1.25, s * (.95 - x * .3), s)]) } const g = mergeG(L), p = g.attributes.position, u = g.attributes.uv; for (let i = 0; i < p.count; i++) u.setXY(i, p.getX(i) / .45, (p.getY(i) + p.getZ(i)) / .45); return g });
// cercas de piedra seca: a lo largo del camino del oeste, alrededor de los campos y en las lomas
const CERCAS = [[[-112, 13], [-62, 11.5], [-48, 12.5]], [[-112, 3], [-30, 2.6]], [[30, -8], [84, -9]], [[30, 3.5], [56, 2.5], [84, 4]], [[-60, -30], [-34, -42], [-6, -48], [24, -46], [50, -36]], [[-72, 26], [-60, 48], [-30, 60], [0, 62], [30, 58]], [[44, 14], [62, 40], [80, 52]], [[-90, -20], [-80, -60], [-50, -78]], [[-12, 30], [-24, 44], [-40, 46]]];
{ const r = rng(4900), P = [], cc = new THREE.Color();
  CERCAS.forEach(pl => { for (let i = 0; i < pl.length - 1; i++) { const [x0, z0] = pl[i], [x1, z1] = pl[i + 1], L = Math.hypot(x1 - x0, z1 - z0), ang = Math.atan2(z1 - z0, x1 - x0); for (let s = 0; s < L; s += .42 + r() * .12) { const x = lerp(x0, x1, s / L) + (r() - .5) * .08, z = lerp(z0, z1, s / L) + (r() - .5) * .08; if (!libreEn(x, z, .4, { mc: 0 }) || sendaK(x, z) > .55) continue; const y = SUELO(x, z);
      for (let f = 0; f < 3; f++) { const sx = .26 + r() * .1, sy = .16 + r() * .06; P.push([x + (r() - .5) * .06, y + .1 + f * .26 + sy * .3, z + (r() - .5) * .1, sx, sy, .2 + r() * .06, ang + (r() - .5) * .3, f]) }
      if (r() < .7) P.push([x, y + .86, z, .2, .14, .18, ang + 1.57, 3]) } } });
  // piedras sueltas por el campo y algunas grandes (más en la loma y en las laderas)
  for (let k = 0; k < 900; k++) { const a = r() * 6.283, d = 12 + r() * r() * 110, x = Math.cos(a) * d, z = Math.sin(a) * d; if (x > 88 || !libreEn(x, z, .6) || sendaK(x, z) > .4) continue; const s = r() < .08 ? .7 + r() * 1.1 : .12 + r() * r() * .5; P.push([x, SUELO(x, z) + s * .15, z, s * (1 + r() * .5), s * (.6 + r() * .4), s, r() * 6.283, 9]) }
  const ms = GEO_PIEDRAS.map(g => { const m = new THREE.InstancedMesh(g, M_ROCA, Math.ceil(P.length / 3) + 2); m.castShadow = m.receiveShadow = true; m.count = 0; scene.add(m); return m });
  P.forEach(([x, y, z, sx, sy, sz, a, f], i) => { const m = ms[i % 3], n = m.count++; dummy.position.set(x, y, z); dummy.rotation.set((r() - .5) * .3, -a, (r() - .5) * .3); dummy.scale.set(sx, sy, sz); dummy.updateMatrix(); m.setMatrixAt(n, dummy.matrix); m.setColorAt(n, cc.set(["#9a968a", "#86837a", "#aaa598", "#7a776e", "#a29a88", "#8e8a7c"][r() * 6 | 0])) }) }
{ const r = rng(4950), M_ARB = conViento(new THREE.MeshStandardMaterial({ map: T_FOLLAJE.c, bumpMap: T_FOLLAJE.z, bumpScale: 5, roughness: 1 }), "copa", .05), cc = new THREE.Color(), ims = GEO_ARBUSTO.map(g => { const m = new THREE.InstancedMesh(g, M_ARB, 200); m.count = 0; m.castShadow = m.receiveShadow = true; scene.add(m); return m });
  for (let k = 0; k < 2000 && ims.reduce((a, m) => a + m.count, 0) < 520; k++) { const a = r() * 6.283, d = 13 + r() * 100, x = Math.cos(a) * d, z = Math.sin(a) * d; if (x > 88 || !libreEn(x, z, .9) || sendaK(x, z) > .3 || Math.hypot(x - COLINA[0], z - COLINA[1]) < 8) continue; const m = ims[k % 3]; if (m.count >= 200) continue; const n = m.count++, s = .6 + r() * .8;
    dummy.position.set(x, SUELO(x, z) - .05, z); dummy.rotation.set(0, (r() - .5) * .5, 0); dummy.scale.set(s, s * (.8 + r() * .4), s); dummy.updateMatrix(); m.setMatrixAt(n, dummy.matrix); m.setColorAt(n, cc.set(["#7a8a48", "#6e7e42", "#8a8a50", "#96864e", "#647440"][r() * 5 | 0])) } }

// ---------- PASTO en matas: briznas acostadas hacia +x que ondean (olas de viento que corren hacia +x por el valle)
const GEO_MATA = (() => { const r = rng(5001), pos = [], uv = [], idx = []; for (let b = 0; b < 6; b++) { const a = r() * 6.283, d = r() * .14, bx = Math.cos(a) * d, bz = Math.sin(a) * d, H = .28 + r() * .32, lean = .25 + r() * .3, fa = r() * 6.283, wv = .028 + r() * .015, o = pos.length / 3;
    for (let k = 0; k <= 3; k++) { const s = k / 3, x = bx + s * s * lean * H, y = s * H, z = bz + Math.sin(fa) * s * .04, wd = wv * (1 - s * .85); pos.push(x - Math.sin(fa) * wd, y, z + Math.cos(fa) * wd, x + Math.sin(fa) * wd, y, z - Math.cos(fa) * wd); uv.push(0, s, 1, s) }
    for (let k = 0; k < 3; k++) { const i = o + k * 2; idx.push(i, i + 1, i + 2, i + 1, i + 3, i + 2) } }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const n = g.attributes.normal; for (let i = 0; i < n.count; i++) n.setXYZ(i, n.getX(i) * .3, 1, n.getZ(i) * .3); n.needsUpdate = true; g.normalizeNormals(); return g })();
const M_MATA = conViento(new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .9, side: THREE.DoubleSide }), "pasto", .22);
const PASTO = (() => { const N = 17000, m = new THREE.InstancedMesh(GEO_MATA, M_MATA, N), r = rng(5010), cc = new THREE.Color(); m.receiveShadow = true; m.castShadow = false; let n = 0;
  for (let k = 0; k < N * 3 && n < N; k++) { const a = r() * 6.283, d = k % 4 === 3 ? 60 + r() * 50 : 6 + Math.pow(r(), .8) * 62, x = Math.cos(a) * d, z = Math.sin(a) * d; if (x > 90 || Math.hypot(x, z) < 11.6 || !libreEn(x, z, .25, { mc: -.6, zona: 1 }) || Math.hypot(x - TORRE[0], z - TORRE[1]) < 3.6 || sendaK(x, z) > .3) continue;
    const s = .5 + r() * .45; dummy.position.set(x, SUELO(x, z) - .02, z); dummy.rotation.set(0, (r() - .5) * .5, 0); dummy.scale.set(s, s * (.7 + r() * .6), s); dummy.updateMatrix(); m.setMatrixAt(n, dummy.matrix);
    const c0 = colorSuelo(x, z); cc.setRGB(c0[0] * (.72 + r() * .25), c0[1] * (.8 + r() * .25), c0[2] * (.6 + r() * .2)); m.setColorAt(n, cc); n++ }
  m.count = n; scene.add(m); return m })();
// flores alpinas chicas (tallo, cinco pétalos, centro) — en 3D, sueltas entre el pasto y al pie de las casas
const FLORES = (() => { const r = rng(5050), tal = mergeG([[new THREE.CylinderGeometry(.008, .01, .26, 4), TM(.03, .13, 0, 0, 0, -.2)], [new THREE.SphereGeometry(.03, 5, 4), TM(.02, .05, .03, 0, 0, 0, 1.4, .3, .8)]]), pet = [];
  for (let k = 0; k < 5; k++) { const a = k / 5 * 6.283; pet.push([new THREE.SphereGeometry(.028, 5, 3), TM(.06 + Math.cos(a) * .035, .265, Math.sin(a) * .035, 0, -a, 0, 1.3, .35, .8)]) } const gp = mergeG(pet), gc = new THREE.SphereGeometry(.018, 6, 4); gc.translate(.06, .275, 0);
  const N = 700, a = new THREE.InstancedMesh(tal, conViento(new THREE.MeshStandardMaterial({ color: "#5a7a34", roughness: .8 }), "copa", .2), N), b = new THREE.InstancedMesh(gp, new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .6 }), N), c = new THREE.InstancedMesh(gc, SM("#e0b030"), N), cc = new THREE.Color(); let n = 0;
  for (let k = 0; k < N * 4 && n < N; k++) { const ca = CASAS_V[k % CASAS_V.length], cerca = k % 3 === 0, an = r() * 6.283, d = cerca ? Math.hypot(ca.w, ca.d) / 2 + .3 + r() * 1.2 : 12 + r() * 60, x = cerca ? ca.x + Math.cos(an) * d : Math.cos(an) * d, z = cerca ? ca.z + Math.sin(an) * d : Math.sin(an) * d;
    if (!libreEn(x, z, .1, { mc: -.4 }) || sendaK(x, z) > .3) continue; const s = .8 + r() * .6, col = ["#f4f0e0", "#e8c838", "#8a6ab8", "#e8e4f0", "#d84a6a", "#f0d050"][r() * 6 | 0];
    for (let j = 0; j < 3 && n < N; j++) { const xx = x + (r() - .5) * .5, zz = z + (r() - .5) * .5; dummy.position.set(xx, SUELO(xx, zz) - .01, zz); dummy.rotation.set(0, (r() - .5) * .6, 0); dummy.scale.setScalar(s * (.8 + r() * .4)); dummy.updateMatrix(); a.setMatrixAt(n, dummy.matrix); b.setMatrixAt(n, dummy.matrix); c.setMatrixAt(n, dummy.matrix); b.setColorAt(n, cc.set(col)); n++ } }
  [a, b, c].forEach(m => { m.count = n; m.castShadow = false; m.receiveShadow = true; scene.add(m) }); return { a, b, c } })();

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
    // Onetusk es ciego (idea del dueño, 25-nov-2026): cataratas lechosas sobre la pupila y el iris, para que se vea de cerca
    { const c = T_IRIS_O.image, g = c.getContext("2d"), w = c.width, h = c.height, yI = h * .21, r = rng(2719); const gr = g.createLinearGradient(0, 0, 0, yI * 1.15); gr.addColorStop(0, "rgba(214,222,226,.93)"); gr.addColorStop(.55, "rgba(196,206,212,.82)"); gr.addColorStop(1, "rgba(170,176,176,.25)"); g.fillStyle = gr; g.fillRect(0, 0, w, yI * 1.15);
      for (let k = 0; k < 260; k++) { const x = r() * w, y = r() * yI * 1.05; g.strokeStyle = `rgba(${r() < .5 ? "255,255,255" : "150,160,168"},${.15 + r() * .3})`; g.lineWidth = 1 + r() * 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 30, y + 10 + r() * 30); g.stroke() } T_IRIS_O.needsUpdate = true }
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
  const cierre = ojos < 0 ? 0 : Math.max(cl(ojos), ojos > .5 ? 0 : _bParp(t)); O.ojos.forEach(o => { o.sup.rotation.x = lerp(-.42, .47, cierre); o.infP.rotation.x = lerp(.62, .43, cierre) });
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

// ---------- caras de Roblox (calcomanía 512 × 384 sobre el frente de la cabeza)
// ---------- caras con el estilo del catálogo clásico de caras de Roblox (pedido del dueño, 25-nov-2026: mandó capturas del catálogo).
// Dibujadas por nosotros, no copiadas: trazos negros que se afinan en las puntas (como pincel), ojos de óvalo negro con un
// puntito de brillo, ojos blancos con contorno y pupila cuando hay sorpresa o risa, párpados de «chill», boca abierta bordó con
// lengua rosa y dientes blancos. Calcomanía de 512 × 384 que cubre el frente de la cabeza.
const CARAV = {};
const TINTA = "#111012", BORDO = "#6e1830", LENGUA = "#ef9cb4";
// trazo de pincel: curva (puntos de control) rellena con un ancho que crece al medio y se afina en las dos puntas
function pincel(g, pts, W, { col = TINTA } = {}) { g.save(); g.strokeStyle = col; g.lineWidth = W * 1.25; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); g.moveTo(...pts[0]);
  if (pts.length === 3) g.quadraticCurveTo(...pts[1], ...pts[2]); else g.bezierCurveTo(...pts[1], ...pts[2], ...pts[3]); g.stroke(); g.restore() }
const EX = 80, EY = 142, MY = 262;   // ojos a ±80 del centro; boca más arriba para que las bocas abiertas entren enteras
// --- ojos
const ojoNegro = (g, x, rx = 24, ry = 44, brillo = false) => { g.fillStyle = TINTA; g.beginPath(); g.ellipse(x, EY, rx, ry, 0, 0, 7); g.fill(); if (brillo) { g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(x - rx * .32, EY - ry * .42, rx * .26, ry * .2, 0, 0, 7); g.fill() } };
const ojoGota = (g, x, s) => { g.fillStyle = TINTA; g.beginPath(); g.moveTo(x - s * 4, EY - 46); g.bezierCurveTo(x + s * 34, EY - 30, x + s * 30, EY + 40, x, EY + 40); g.bezierCurveTo(x - s * 30, EY + 40, x - s * 30, EY - 20, x - s * 4, EY - 46); g.fill(); };
const ojoBlanco = (g, x, r = 40, px = 0, py = 0, rp = 15) => { g.fillStyle = "#ece6dc"; g.beginPath(); g.ellipse(x, EY, r * .86, r, 0, 0, 7); g.fill(); g.lineWidth = 9; g.strokeStyle = TINTA; g.stroke(); g.fillStyle = TINTA; g.beginPath(); g.arc(x + px, EY + py, rp, 0, 7); g.fill() };
const ojoChill = (g, x, s) => { g.fillStyle = TINTA; g.fillRect(x - 32, EY - 6, 64, 22); pincel(g, [[x - 44, EY - 8], [x, EY - 14], [x + 44, EY - 8]], 10); pincel(g, [[x - 40, EY + 24], [x, EY + 30], [x + 40, EY + 24]], 8); pincel(g, s < 0 ? [[x - 34, EY - 40], [x, EY - 62], [x + 34, EY - 40]] : [[x - 34, EY - 56], [x, EY - 36], [x + 34, EY - 56]], 12) };
const ojoArco = (g, x, arriba = true) => pincel(g, arriba ? [[x - 34, EY + 12], [x, EY - 30], [x + 34, EY + 12]] : [[x - 34, EY - 6], [x, EY + 30], [x + 34, EY - 6]], 15);
const ojoApret = (g, x, s) => pincel(g, [[x - s * 30, EY - 30], [x + s * 26, EY], [x - s * 30, EY + 30]], 14, { ini: .3, fin: .3 });
const ojoPunto = (g, x) => { g.fillStyle = TINTA; g.beginPath(); g.ellipse(x, EY, 17, 21, 0, 0, 7); g.fill() };
// --- cejas (pincel)
const ceja = (g, x, s, tipo) => { const y = EY - 66;
  if (tipo === "pena") pincel(g, [[x - s * 38, y - 4], [x + s * 6, y - 16], [x + s * 36, y + 12]], 13);
  if (tipo === "enojo") pincel(g, [[x - s * 38, y - 14], [x, y - 4], [x + s * 34, y + 18]], 15);
  if (tipo === "alta") pincel(g, [[x - 36, y - 12], [x, y - 34], [x + 36, y - 12]], 12);
  if (tipo === "duda") pincel(g, s < 0 ? [[x - 36, y - 18], [x - 4, y - 44], [x + 34, y - 26], [x + 44, y - 8]] : [[x - 36, y + 4], [x, y + 2], [x + 36, y - 2]], 13) };
// --- bocas
const bocaAbierta = (g, w = 150, h = 110, lengua = true, dientes = false, y0 = MY - 30) => { const camino = () => { g.beginPath(); g.moveTo(256 - w / 2, y0); g.lineTo(256 + w / 2, y0); g.bezierCurveTo(256 + w / 2, y0 + h * .75, 256 + w * .3, y0 + h, 256, y0 + h); g.bezierCurveTo(256 - w * .3, y0 + h, 256 - w / 2, y0 + h * .75, 256 - w / 2, y0); g.closePath() };
  camino(); g.fillStyle = BORDO; g.fill(); g.save(); g.clip(); if (lengua) { g.fillStyle = LENGUA; g.beginPath(); g.ellipse(256, y0 + h * .98, w * .3, h * .36, 0, 0, 7); g.fill() } if (dientes) { g.fillStyle = "#fff"; g.fillRect(256 - w / 2, y0, w, h * .2) } g.restore(); camino(); g.lineWidth = 11; g.strokeStyle = TINTA; g.stroke() };
const bocaO = (g, rx = 24, ry = 30) => { g.beginPath(); g.ellipse(256, MY, rx, ry, 0, 0, 7); g.fillStyle = BORDO; g.fill(); g.lineWidth = 9; g.strokeStyle = TINTA; g.stroke() };
const bocaDientes = (g, w = 130, h = 54) => { g.fillStyle = "#fff"; g.beginPath(); g.roundRect(256 - w / 2, MY - h / 2, w, h, 16); g.fill(); g.lineWidth = 9; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = 6; g.beginPath(); g.moveTo(256 - w / 2 + 4, MY); g.lineTo(256 + w / 2 - 4, MY); for (let i = 1; i < 5; i++) { const x = 256 - w / 2 + i * w / 5; g.moveTo(x, MY - h / 2 + 3); g.lineTo(x, MY + h / 2 - 3) } g.stroke() };
const bocaZig = (g, w = 150) => { g.lineWidth = 11; g.strokeStyle = TINTA; g.lineJoin = "round"; g.lineCap = "round"; g.beginPath(); for (let i = 0; i <= 6; i++) g.lineTo(256 - w / 2 + i * w / 6, MY + (i % 2 ? -14 : 12)); g.stroke() };
const bocaD = g => { g.beginPath(); g.moveTo(206, MY - 34); g.lineTo(306, MY - 34); g.bezierCurveTo(306, MY + 30, 270, MY + 46, 256, MY + 46); g.bezierCurveTo(242, MY + 46, 206, MY + 30, 206, MY - 34); g.closePath(); g.lineWidth = 15; g.strokeStyle = TINTA; g.stroke() };
// cada cara: ojos, cejas y boca
const CARAS_CAT = {
  neutral: g => { [-1, 1].forEach(s => ojoNegro(g, 256 + s * EX)); pincel(g, [[218, MY], [256, MY + 4], [296, MY - 2]], 13) },
  happy: g => { [-1, 1].forEach(s => ojoNegro(g, 256 + s * EX)); pincel(g, [[180, MY - 20], [256, MY + 50], [332, MY - 20]], 16) },
  warm: g => { [-1, 1].forEach(s => ojoNegro(g, 256 + s * EX, 22, 40)); pincel(g, [[214, MY - 12], [256, MY + 22], [298, MY - 12]], 14) },
  hopeful: g => { [-1, 1].forEach(s => { ojoNegro(g, 256 + s * EX); ceja(g, 256 + s * EX, s, "pena") }); pincel(g, [[218, MY - 8], [256, MY + 16], [294, MY - 8]], 13) },
  relieved: g => { [-1, 1].forEach(s => { ojoArco(g, 256 + s * EX); ceja(g, 256 + s * EX, s, "pena") }); pincel(g, [[204, MY - 16], [256, MY + 30], [308, MY - 16]], 15) },
  paz: g => { [-1, 1].forEach(s => ojoArco(g, 256 + s * EX)); pincel(g, [[214, MY - 10], [256, MY + 22], [298, MY - 10]], 14) },
  laugh: g => { [-1, 1].forEach(s => ojoBlanco(g, 256 + s * EX, 40, 6, -14)); bocaAbierta(g, 170, 120) },
  excited: g => { [-1, 1].forEach(s => ojoBlanco(g, 256 + s * EX, 42, 0, -4, 17)); bocaAbierta(g, 160, 110, true, true) },
  starstruck: g => { [-1, 1].forEach(s => ojoBlanco(g, 256 + s * EX, 42, 0, 0, 20)); bocaAbierta(g, 160, 110, true, true) },
  sad: g => { [-1, 1].forEach(s => { ojoGota(g, 256 + s * EX, s); ceja(g, 256 + s * EX, s, "pena") }); pincel(g, [[206, MY + 18], [232, MY - 6], [270, MY - 14], [306, MY + 14]], 13) },
  worried: g => { [-1, 1].forEach(s => { ojoGota(g, 256 + s * EX, s); ceja(g, 256 + s * EX, s, "pena") }); pincel(g, [[214, MY + 8], [240, MY - 4], [268, MY + 6], [298, MY - 2]], 12) },
  pleading: g => { [-1, 1].forEach(s => { ojoNegro(g, 256 + s * EX, 28, 48); ceja(g, 256 + s * EX, s, "pena") }); pincel(g, [[220, MY + 12], [256, MY - 10], [292, MY + 12]], 12) },
  gloomy: g => { [-1, 1].forEach(s => ojoChill(g, 256 + s * EX, s)); pincel(g, [[220, MY + 6], [256, MY - 2], [292, MY + 8]], 12) },
  squint: g => { [-1, 1].forEach(s => ojoChill(g, 256 + s * EX, s)); pincel(g, [[214, MY], [256, MY + 2], [298, MY - 2]], 13) },
  suspicious: g => { [-1, 1].forEach(s => ojoChill(g, 256 + s * EX, s)); pincel(g, [[214, MY + 2], [262, MY - 8], [300, MY - 2]], 13); pincel(g, [[282, MY + 6], [292, MY + 14], [298, MY + 6]], 6) },
  determined: g => { [-1, 1].forEach(s => { ojoNegro(g, 256 + s * EX, 22, 40); ceja(g, 256 + s * EX, s, s < 0 ? "duda" : "enojo") }); pincel(g, [[214, MY + 4], [262, MY + 10], [302, MY - 12]], 13) },
  brave: g => { [-1, 1].forEach(s => { ojoNegro(g, 256 + s * EX, 22, 40); ceja(g, 256 + s * EX, s, "duda") }); pincel(g, [[206, MY - 4], [252, MY + 28], [304, MY - 18]], 14) },
  angry: g => { [-1, 1].forEach(s => { ojoNegro(g, 256 + s * EX, 22, 38); ceja(g, 256 + s * EX, s, "enojo") }); bocaDientes(g) },
  grito: g => { [-1, 1].forEach(s => { ojoNegro(g, 256 + s * EX, 20, 36); ceja(g, 256 + s * EX, s, "enojo") }); bocaAbierta(g, 150, 120, true, true) },
  scared: g => { [-1, 1].forEach(s => { ojoBlanco(g, 256 + s * EX, 38, 0, 6, 12); ceja(g, 256 + s * EX, s, "pena") }); bocaZig(g) },
  terrified: g => { [-1, 1].forEach(s => { ojoBlanco(g, 256 + s * EX, 42, 0, 0, 10); ceja(g, 256 + s * EX, s, "pena") }); bocaAbierta(g, 120, 120, false, true) },
  horrified: g => { [-1, 1].forEach(s => { ojoBlanco(g, 256 + s * EX, 44, 0, 0, 9); ceja(g, 256 + s * EX, s, "alta") }); bocaZig(g, 170) },
  panic: g => { [-1, 1].forEach(s => { ojoBlanco(g, 256 + s * EX, 42, s * -6, 0, 11); ceja(g, 256 + s * EX, s, "pena") }); bocaAbierta(g, 130, 110, true, true) },
  shock: g => { [-1, 1].forEach(s => { ojoBlanco(g, 256 + s * EX, 42, 0, 0, 12); ceja(g, 256 + s * EX, s, "alta") }); bocaO(g) },
  gasp: g => { [-1, 1].forEach(s => { ojoBlanco(g, 256 + s * EX, 40, 0, 2, 13); ceja(g, 256 + s * EX, s, "alta") }); bocaO(g, 20, 26) },
  curious: g => { [-1, 1].forEach(s => { ojoNegro(g, 256 + s * EX); ceja(g, 256 + s * EX, s, "duda") }); bocaO(g, 14, 16) },
  listen: g => { [-1, 1].forEach(s => { ojoBlanco(g, 256 + s * EX, 40, s * 12, -4, 15); ceja(g, 256 + s * EX, s, "alta") }); bocaO(g, 13, 15) },
  susurra: g => { [-1, 1].forEach(s => { ojoNegro(g, 256 + s * EX, 22, 40); ceja(g, 256 + s * EX, s, "pena") }); bocaO(g, 11, 13) },
  sopla: g => { [-1, 1].forEach(s => ojoApret(g, 256 + s * EX, s)); bocaO(g, 22, 26) },
  cerrados: g => { [-1, 1].forEach(s => ojoArco(g, 256 + s * EX, false)); pincel(g, [[220, MY], [256, MY + 4], [292, MY - 2]], 12) },
  happyD: g => { [-1, 1].forEach(s => ojoPunto(g, 256 + s * EX * .7)); bocaD(g) },
};
// el parpadeo: los mismos rasgos con los ojos como un arco cerrado
function caraV(kind, cerr = false) { const key = kind + (cerr ? "_c" : ""); if (CARAV[key]) return CARAV[key];
  return CARAV[key] = tex(512, 384, (g, w, h) => { g.lineCap = "round"; g.lineJoin = "round"; const f0 = CARAS_CAT[kind] || CARAS_CAT.neutral, f = gg => { gg.save(); gg.translate(256, 222); gg.scale(1.15, 1.15); gg.translate(-256, -222); f0(gg); gg.restore() };
    if (!cerr) return f(g);
    // dibuja la cara en otro lienzo, borra la franja de los ojos y pone los párpados cerrados (las cejas y la boca quedan)
    const c2 = mk(512, 384), g2 = c2.getContext("2d"); g2.lineCap = "round"; g2.lineJoin = "round"; f(g2); const y0 = 222 + (EY - 222) * 1.15; g2.clearRect(0, y0 - 64, 512, 126); g.drawImage(c2, 0, 0); g.save(); g.translate(256, 222); g.scale(1.15, 1.15); g.translate(-256, -222); [-1, 1].forEach(s => ojoArco(g, 256 + s * EX, false)); g.restore() }) }
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

// ================= ELENCO DE GUSTHOLLOW («Keep Your Boots On»): personajes, botas de hierro, utilería y animaciones de viento =================
// Va DESPUÉS de _volze_personajes.js (usa caraV, CARAS_CAT, pincel, peloV, panueloV, anteojosV, accMat, trozo, bloque, gema, estampa,
// sombra2D). Mismo estilo que el cuerno: seis bloques de plástico mate con bisel chico, ropa PINTADA (calcomanía plana, un color por
// prenda con un estampado simple), cabeza recta, caras del catálogo clásico dibujadas por nosotros; en 3D solo el pelo, los gorros, la
// barba y las BOTAS DE HIERRO (lo único «calzado en 3D», porque la historia las justifica).
// Quién es quién (instancias del motor reutilizadas):
//   ME = el narrador (13) · PIP = ME6, la hermanita (7, escala .72) · TOBB = GARROW, el viejo · TOBB_CHICO = PIM (11, el recuerdo)
//   MARTA = QUILL · NOVIO = FOLK[0] · NOVIA = FOLK[1] · MAMA = FOLK[2] (con BEBE_V) · VECINOS = 10 vecinos (FOLK[3..5], EXT[0..3], PESCADOR y 2 nuevos)
// Convenciones de las poses: todas son (k, t, opciones) y se llaman DESPUÉS de poner al personaje (placeW/ponerP) y de pose() del motor.
// El viento sopla hacia +x (VDIR). k.g es el punto de referencia (los pies, salvo donde se dice otra cosa).
const H_CAD = 1.02, A_BRAZO = .42, F30 = 1 / 30;
const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3(), _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _q3 = new THREE.Quaternion();
const _ABAJO = new THREE.Vector3(0, -1, 0), _mb = new THREE.Matrix4(), _ax = new THREE.Vector3(), _ay = new THREE.Vector3(), _az = new THREE.Vector3();
const _frac = x => x - Math.floor(x), _suave = q => { q = cl(q); return q * q * (3 - 2 * q) };
function caraDz(kind, cerr = false) { return caraV(kind, cerr) }   // la reasigna _volze_personajes.js: la declaración tiene que existir

// ---------- caras nuevas (mismo trazo de pincel del catálogo): «wow» (asombro feliz), «aguanta» (contra el viento), «esfuerzo» (tirar de la bota)
CARAS_CAT.wow = g => { [-1, 1].forEach(s => { const x = 256 + s * EX; ojoBlanco(g, x, 44, 0, -6, 19); g.fillStyle = "#fff"; g.beginPath(); g.arc(x - 7, EY - 13, 6, 0, 7); g.fill(); ceja(g, x, s, "alta") }); bocaAbierta(g, 118, 96, true, false) };
CARAS_CAT.aguanta = g => { [-1, 1].forEach(s => { ojoNegro(g, 256 + s * EX, 20, 34); ceja(g, 256 + s * EX, s, "enojo") }); bocaDientes(g, 120, 46) };
CARAS_CAT.esfuerzo = g => { [-1, 1].forEach(s => ojoApret(g, 256 + s * EX, s)); bocaDientes(g, 130, 52) };
const SIN_PARPADEO = new Set(["relieved", "paz", "cerrados", "sopla", "esfuerzo", "happyD"]);
// UN parpadeo de 4 cuadros (a 30 fps) cada 1,2–1,6 s, desfasado por personaje
function parpadeo(k, t) { const T = 1.2 + .4 * _frac(k.idx * .618 + .31), ph = (t + T * _frac(k.idx * .377 + .15)) % T;
  if (ph < 4 * F30 && k.cara && !SIN_PARPADEO.has(k.cara)) { const m = caraV(k.cara, true); if (k.decal.material.map !== m) { k.decal.material.map = m; k.decal.material.needsUpdate = true } return true } return false }

// ---------- ROPA PINTADA de pueblo de montaña (lana, abrigos, bufandas, delantales): texturas planas con sombreado suave
const ROPAG = {};
function estampaG(g, w, h, kind, alt) { g.fillStyle = alt; g.strokeStyle = alt;
  if (kind === "nordico") { g.fillRect(0, 96, w, 14); g.fillRect(0, 196, w, 14); for (let x = 0; x < w + 40; x += 64) { g.beginPath(); g.moveTo(x, 126); g.lineTo(x + 22, 153); g.lineTo(x, 180); g.lineTo(x - 22, 153); g.closePath(); g.fill() } for (let x = 32; x < w; x += 64) { g.beginPath(); g.arc(x, 153, 7, 0, 7); g.fill() } return }
  if (kind === "trenza") { g.lineWidth = 11; for (const x of [110, 256, 402]) { for (let y = -20; y < h; y += 64) { g.beginPath(); g.ellipse(x, y + 32, 22, 30, 0, 0, 7); g.stroke() } g.fillRect(x - 46, 0, 6, h); g.fillRect(x + 40, 0, 6, h) } return }
  if (kind === "cuadros") { g.globalAlpha = .55; for (let x = 20; x < w; x += 128) g.fillRect(x, 0, 52, h); for (let y = 20; y < h; y += 128) g.fillRect(0, y, w, 52); g.globalAlpha = 1; g.fillStyle = "rgba(0,0,0,.25)"; for (let x = 44; x < w; x += 128) g.fillRect(x, 0, 6, h); for (let y = 44; y < h; y += 128) g.fillRect(0, y, w, 6); return }
  estampa(g, w, h, kind, null, alt) }
// frente/espalda del torso. o: { col, kind, alt, abrigo: [solapa|null, botones], bufanda: [col, raya], delantal: [col, borde], bolsillos: col, traje: [camisa, moño, flor],
//   encaje: col, faja: [col, vivo], chal: [col, guarda], chaleco: [col] }
function torsoG(o, back = false) { const key = "t" + JSON.stringify(o) + back; return ROPAG[key] ||= tex(512, 512, (g, w, h) => {
  g.fillStyle = o.col; g.fillRect(0, 0, w, h); if (o.kind) estampaG(g, w, h, o.kind, o.alt || "#efe6d2");
  if (o.chaleco) { g.fillStyle = o.chaleco[0]; if (back) g.fillRect(0, 0, w, h); else { g.fillRect(0, 0, 176, h); g.fillRect(w - 176, 0, 176, h) } }
  if (o.chal) { const V = (d, lw, c) => { g.strokeStyle = c; g.lineWidth = lw; g.lineJoin = "miter"; g.beginPath(); g.moveTo(-10, 250 - d); g.lineTo(256, 470 - d); g.lineTo(522, 250 - d); g.stroke() };
    g.fillStyle = o.chal[0]; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w, 250); g.lineTo(256, 470); g.lineTo(0, 250); g.closePath(); g.fill(); if (o.chal[1]) V(40, 18, o.chal[1]) }
  if (o.traje && !back) { const [cam, mo, flor] = o.traje; g.fillStyle = cam; g.beginPath(); g.moveTo(186, 0); g.lineTo(326, 0); g.lineTo(256, 230); g.closePath(); g.fill();
    g.fillStyle = "rgba(0,0,0,.35)"; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(256 + s * 70, 0); g.lineTo(256 + s * 96, 0); g.lineTo(256 + s * 8, 250); g.lineTo(256, 236); g.closePath(); g.fill() }
    g.fillStyle = mo; g.beginPath(); g.moveTo(256, 44); g.lineTo(222, 26); g.lineTo(222, 64); g.closePath(); g.fill(); g.beginPath(); g.moveTo(256, 44); g.lineTo(290, 26); g.lineTo(290, 64); g.closePath(); g.fill(); g.fillRect(248, 36, 16, 16);
    g.fillStyle = "rgba(0,0,0,.4)"; for (const y of [300, 380]) { g.beginPath(); g.arc(256, y, 11, 0, 7); g.fill() }
    if (flor) { for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283; g.fillStyle = "#f6f2ea"; g.beginPath(); g.arc(140 + Math.cos(a) * 15, 110 + Math.sin(a) * 15, 11, 0, 7); g.fill() } g.fillStyle = flor; g.beginPath(); g.arc(140, 110, 9, 0, 7); g.fill() } }
  if (o.abrigo) { const [sol, bot] = o.abrigo; if (!back) { g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(250, 0, 9, h);
      if (sol) { g.fillStyle = sol; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(256, 0); g.lineTo(256 + s * 150, 0); g.lineTo(256 + s * 120, 70); g.lineTo(256 + s * 6, 150); g.closePath(); g.fill() } }
      if (bot) for (let k = 0; k < 4; k++) { const y = 186 + k * 80; g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(216, y + 3, 82, 5); g.fillStyle = bot; g.beginPath(); g.roundRect(232, y - 9, 48, 18, 9); g.fill() } }
    else { g.fillStyle = "rgba(0,0,0,.18)"; g.fillRect(250, 300, 8, h - 300) } }
  if (o.delantal) { const [dc, db] = o.delantal; g.fillStyle = dc; g.fillRect(0, 196, w, 22); if (!back) { g.fillRect(150, 40, 212, 170); g.fillRect(96, 206, 320, h - 206); g.fillRect(156, 0, 18, 44); g.fillRect(338, 0, 18, 44);
      g.strokeStyle = db; g.lineWidth = 8; g.strokeRect(186, 330, 140, 80); g.fillStyle = db; g.fillRect(96, h - 30, 320, 12); g.fillRect(150, 40, 212, 8) } }
  if (o.bolsillos && !back) { const bc = o.bolsillos, osc = "#" + new THREE.Color(bc).multiplyScalar(.62).getHexString();
    for (const x0 of [52, 312]) { const r = rng(x0); for (let i = 0; i < 4; i++) { const cx = x0 + 22 + i * 34 + r() * 8, cy = 300 + r() * 6, rr = 16 + r() * 8; g.fillStyle = ["#9a968e", "#7d7a74", "#b0aca2", "#8a867e"][i]; g.beginPath(); for (let j = 0; j < 6; j++) { const a = j / 6 * 6.283 + r() * .3; g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * .85) } g.closePath(); g.fill() }   // piedritas que asoman
      g.fillStyle = bc; g.beginPath(); g.roundRect(x0, 300, 148, 170, [6, 6, 34, 34]); g.fill(); const gr = g.createRadialGradient(x0 + 60, 360, 6, x0 + 74, 390, 110); gr.addColorStop(0, "rgba(255,255,255,.28)"); gr.addColorStop(.6, "rgba(255,255,255,0)"); gr.addColorStop(1, "rgba(0,0,0,.3)"); g.fillStyle = gr; g.fill();   // abultado
      g.strokeStyle = osc; g.lineWidth = 9; g.stroke(); g.setLineDash([12, 9]); g.lineWidth = 4; g.strokeStyle = "rgba(255,240,200,.55)"; g.beginPath(); g.moveTo(x0 + 12, 322); g.lineTo(x0 + 136, 322); g.stroke(); g.setLineDash([]) } }
  if (o.faja) { g.fillStyle = o.faja[0]; g.fillRect(0, h - 104, w, 54); if (o.faja[1]) { g.fillStyle = o.faja[1]; g.fillRect(0, h - 84, w, 12) } }
  if (o.encaje) { g.fillStyle = o.encaje; for (let x = 0; x < w + 32; x += 40) { g.beginPath(); g.arc(x, 0, 22, 0, Math.PI); g.fill(); g.beginPath(); g.arc(x + 20, h - 78, 14, 0, Math.PI); g.fill() } g.fillRect(0, h - 96, w, 18) }
  if (o.bufanda) { const [bc, br] = o.bufanda; g.fillStyle = bc; g.fillRect(0, 0, w, 62); if (br) { g.fillStyle = br; g.fillRect(0, 22, w, 14) }
    if (!back) { g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(300, 56, 84, 8); g.fillStyle = bc; g.fillRect(304, 40, 76, 250); if (br) { g.fillStyle = br; for (let y = 90; y < 270; y += 62) g.fillRect(304, y, 76, 20) }
      g.fillStyle = bc; for (let x = 308; x < 380; x += 14) g.fillRect(x, 288, 7, 26) } }   // la punta que cuelga, con flecos
  sombra2D(g, w, h, .12) }) }
const torsoLado = o => ROPAG["l" + JSON.stringify(o)] ||= tex(64, 64, (g, w, h) => { g.fillStyle = o.chaleco ? o.chaleco[0] : o.chal ? o.chal[0] : o.col; g.fillRect(0, 0, w, h);
  if (o.delantal) { g.fillStyle = o.delantal[0]; g.fillRect(0, 24, w, 3) } if (o.faja) { g.fillStyle = o.faja[0]; g.fillRect(0, h - 13, w, 7) } if (o.bufanda) { g.fillStyle = o.bufanda[0]; g.fillRect(0, 0, w, 8) } sombra2D(g, w, h, .12) });
// brazo: manga (lana) hasta `manga`, puño, rayas opcionales, mitones opcionales; el resto es la mano color piel
const brazoG = o => ROPAG["b" + JSON.stringify(o)] ||= tex(128, 256, (g, w, h) => { const y = h * (o.manga ?? .82); g.fillStyle = o.skin; g.fillRect(0, 0, w, h); g.fillStyle = o.col; g.fillRect(0, 0, w, y);
  if (o.rayas) { g.fillStyle = o.rayas; for (let yy = 34; yy < y - 34; yy += 54) g.fillRect(0, yy, w, 16) } if (o.puno) { g.fillStyle = o.puno; g.fillRect(0, y - 26, w, 20) }
  if (o.guante) { g.fillStyle = o.guante; g.fillRect(0, y, w, h - y); g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(0, y + 6, w, 8) }
  g.fillStyle = "rgba(0,0,0,.16)"; g.fillRect(0, y, w, 4); sombra2D(g, w, h, .1) });
// pierna: pantalón (o medias de lana) hasta `largo`, pollera/abrigo largo pintado arriba hasta `falda`; debajo, la MEDIA pintada (la tapa la bota)
const piernaG = (o, descalzo = false) => ROPAG["p" + JSON.stringify(o) + descalzo] ||= tex(128, 256, (g, w, h) => { const L = h * (o.largo ?? .8);
  g.fillStyle = o.col; g.fillRect(0, 0, w, L); if (!o.falda) { g.fillStyle = "rgba(0,0,0,.1)"; g.fillRect(w / 2 - 2, 0, 4, L * .9) }
  if (o.falda) { const yf = h * o.falda; g.fillStyle = o.faldaCol || o.col; g.fillRect(0, 0, w, yf); if (o.ruedo) { g.fillStyle = o.ruedo; g.fillRect(0, yf - 24, w, 14) } g.fillStyle = "rgba(0,0,0,.2)"; g.fillRect(0, yf, w, 5) }
  if (descalzo) { g.fillStyle = o.skin; g.fillRect(0, L, w, h - L); g.fillStyle = "rgba(0,0,0,.12)"; g.fillRect(0, h - 8, w, 8) }
  else { g.fillStyle = o.media || "#e9e1cf"; g.fillRect(0, L, w, h - L); g.fillStyle = o.mediaRaya || "#b8463a"; g.fillRect(0, L + 12, w, 13); g.fillRect(0, L + 33, w, 6); g.fillStyle = "rgba(0,0,0,.1)"; g.fillRect(0, h - 16, w, 16) }
  g.fillStyle = "rgba(0,0,0,.2)"; g.fillRect(0, L, w, 4); sombra2D(g, w, h, .1) });

// ---------- BOTAS DE HIERRO: un bloque de hierro oscuro (pocas caras) con remaches y una correa de cuero pintados, sobre una suela gruesa.
// Reemplaza la franja de zapato: tapa la media pintada. Es un poco más ancha que la pierna (.58 contra .5). Geometrías y materiales compartidos.
const BOTA = (() => { const pinta = front => pintarDoble(256, 256, (c, z, w, h) => { const r = rng(9090 + front); c.fillStyle = "#3e4146"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
    for (let k = 0; k < 60; k++) { c.fillStyle = `rgba(${r() < .5 ? "0,0,0" : "255,255,255"},${.03 + r() * .05})`; c.beginPath(); c.ellipse(r() * w, r() * h, 8 + r() * 22, 6 + r() * 16, r() * 3, 0, 7); c.fill() }   // hierro martillado
    c.fillStyle = "rgba(255,255,255,.16)"; c.fillRect(0, 0, w, 10); c.fillStyle = "rgba(0,0,0,.28)"; c.fillRect(0, h - 12, w, 12);
    c.fillStyle = "#6a4022"; c.fillRect(0, 104, w, 48); c.fillStyle = "rgba(0,0,0,.3)"; c.fillRect(0, 148, w, 4); z.fillStyle = "rgba(255,255,255,.5)"; z.fillRect(0, 104, w, 48);   // la correa de cuero
    c.setLineDash([9, 7]); c.strokeStyle = "rgba(255,226,180,.5)"; c.lineWidth = 3; for (const y of [111, 144]) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke() } c.setLineDash([]);
    for (const y of [36, 216]) for (let x = 21; x < w; x += 43) { c.fillStyle = "#1c1e21"; c.beginPath(); c.arc(x, y, 11, 0, 7); c.fill(); c.fillStyle = "#80858d"; c.beginPath(); c.arc(x, y, 7.5, 0, 7); c.fill(); c.fillStyle = "rgba(255,255,255,.7)"; c.beginPath(); c.arc(x - 2.5, y - 2.5, 2.6, 0, 7); c.fill(); z.fillStyle = "#ffffff"; z.beginPath(); z.arc(x, y, 8, 0, 7); z.fill() }   // remaches
    if (front) { c.strokeStyle = "#8f846c"; c.lineWidth = 7; c.strokeRect(108, 106, 40, 44); c.fillStyle = "#8f846c"; c.fillRect(125, 106, 6, 44); z.strokeStyle = "#ffffff"; z.lineWidth = 8; z.strokeRect(108, 106, 40, 44) } });   // hebilla
  const [c0, z0] = pinta(0), [c1, z1] = pinta(1), M = (map, bumpMap) => new THREE.MeshStandardMaterial({ map, bumpMap, bumpScale: 2.2, roughness: .5, metalness: .4 }), lado = M(c0, z0);
  return { geoB: RB(.56, .22, .6, .025, 2), geoS: RB(.6, .06, .67, .02, 2), mats: boxMats(lado, M(c1, z1), lado), suela: new THREE.MeshStandardMaterial({ color: "#232427", roughness: .45, metalness: .5 }) } })();
// una bota: grupo con el origen en la base de la suela (centro); esc = escala (las de Tobb son las más grandes del pueblo)
function botaNueva(esc = 1) { const G = new THREE.Group(); part(BOTA.geoS, BOTA.suela, 0, .03, .06, G, 0); part(BOTA.geoB, BOTA.mats, 0, .165, .05, G, 0); G.scale.set(esc, Math.pow(esc, .7), esc); G.userData.esc = esc; return G }
// botas(k, { izq, der, descalzo }): 1 = puesta, 0 = sacada (se ve la media pintada; descalzo: 1 → el pie color piel). izq = legL (x−), der = legR (x+).
// Se resetea en cada cuadro (todos con las dos botas puestas): llamala en cada cuadro en que haga falta.
function botas(k, { izq = 1, der = 1, descalzo = 0 } = {}) { [izq, der].forEach((on, i) => { const b = k.botaG[i]; b.visible = !!on; const m = k.matPierna[i], map = !on && descalzo ? k.texPierna[1] : k.texPierna[0]; if (m.map !== map) { m.map = map; m.needsUpdate = true } }) }
// botaSuelta(k, lado) → la bota suelta de ese personaje (lado "izq"|"der"), visible, para ponerla en la mano (attach / enMano) o en el piso (botaEnPiso).
// Se esconde sola en cada cuadro (utileriaReset). No esconde la de la pierna: para eso, botas(k, { izq: 0 }).
const BOTAS_SUELTAS = [];
function botaSuelta(k, lado = "der") { const i = lado === "izq" || lado === 0 ? 0 : 1; k.botaS ||= []; let b = k.botaS[i]; if (!b) { b = k.botaS[i] = botaNueva(k.botaG[i].userData.esc); b.scale.multiplyScalar(k.body.scale.y); b.userData.prop = 1; BOTAS_SUELTAS.push(b) } b.visible = true; return b }
// botaEnPiso(b, x, z, { ry, volcada }): la bota en el piso del mundo (ALT); volcada 0→1 la acuesta de costado
function botaEnPiso(b, x, z, { ry = 0, volcada = 0, y = null } = {}) { const par = ME.g.parent; if (b.parent !== par) par.add(b); b.visible = true; b.rotation.set(0, ry, volcada * Math.PI / 2); b.position.set(x, (y ?? ALT(x, z)) + volcada * .3 * b.scale.x, z); return b }

// ---------- accesorios de cabeza propios (pocos polígonos, color liso): gorro de lana con pompón, gorra plana, colitas, velo
function gorroLana(k, { col, banda = null, pompon = null, orejeras = false } = {}) { const h = k.head, m = accMat(col), mb = accMat(banda || oscV(col, .8));
  part(new THREE.CylinderGeometry(.46, .5, .14, 8), mb, 0, .69, -.01, h, 0).userData.pelo = 1;                              // el doblez
  const d = part(new THREE.CylinderGeometry(.24, .46, .3, 8), m, 0, .9, -.03, h, 0); d.userData.pelo = 1;                  // la copa
  part(new THREE.CylinderGeometry(.25, .25, .04, 8), m, 0, 1.06, -.03, h, 0).userData.pelo = 1;
  if (pompon) gema(h, accMat(pompon), .13, 0, 1.13, -.03);
  if (orejeras) for (const s of [-1, 1]) bloque(h, mb, .1, .3, .3, s * .41, .5, -.02) }
function gorraPlana(k, { col }) { const h = k.head, m = accMat(col), md = accMat(oscV(col, .8)); const c = part(new THREE.CylinderGeometry(.46, .5, .2, 8), m, 0, .8, .02, h, 0); c.userData.pelo = 1; c.rotation.x = .14; c.scale.z = 1.04;
  const t = part(new THREE.CylinderGeometry(.3, .46, .07, 8), m, 0, .93, .04, h, 0); t.userData.pelo = 1; t.rotation.x = .14; bloque(h, md, .62, .05, .28, 0, .72, .46, .3) }
// colitas de Pip: dos mechones gruesos que salen debajo del gorro y FLAMEAN con el viento (pivote en la raíz)
function colitas(k, col, atado) { const m = accMat(col), md = accMat(oscV(col, .8)), ma = accMat(atado); k.flamea ||= [];
  for (const s of [-1, 1]) { const G = new THREE.Group(); G.position.set(s * .42, .5, -.1); k.head.add(G); trozo(G, m, [0, 0, 0], [s * .34, -.16, -.06], .12); trozo(G, md, [s * .02, -.03, 0], [s * .26, -.22, .04], .085); gema(G, ma, .065, s * .02, 0, 0);
    k.flamea.push({ g: G, rest: new THREE.Vector3(s, -.5, 0).normalize(), max: .9, fase: s }) } }
function velo(k, col = "#e9e2d4") { const G = new THREE.Group(); G.position.set(0, .74, -.22); k.head.add(G); const geo = new THREE.BoxGeometry(.66, .86, .02); geo.translate(0, -.43, -.05);
  part(geo, new THREE.MeshStandardMaterial({ color: col, roughness: .8, transparent: true, opacity: .88, flatShading: true }), 0, 0, 0, G, 0).castShadow = false;
  k.flamea ||= []; k.flamea.push({ g: G, rest: new THREE.Vector3(0, -1, -.25).normalize(), max: 1.25, fase: .7 }) }
// barba de pocos bloques, en su propio grupo (pivote en el mentón): con viento se inclina hacia +x
function barbaG(k, col) { const G = new THREE.Group(); G.position.set(0, .12, .3); k.head.add(G); const m = accMat(col), md = accMat(oscV(col, .86));
  bloque(G, m, .66, .24, .16, 0, -.08, 0); bloque(G, md, .5, .2, .14, 0, -.24, -.02); trozo(G, m, [0, -.2, 0], [0, -.5, 0], .14); for (const s of [-1, 1]) bloque(G, m, .12, .36, .42, s * .37, .08, -.2);
  k.flamea ||= []; k.flamea.push({ g: G, rest: new THREE.Vector3(0, -1, .2).normalize(), max: .4, fase: 2 }) }

// ---------- vestir: reconstruye al personaje con seis bloques + ropa pintada + botas de hierro + pelo en un grupo (para el viento)
// o: { skin, torso: {…torsoG}, brazo: {col, manga, puno, rayas, guante}, pierna: {col, largo, falda, faldaCol, ruedo, media, mediaRaya},
//      pelo: [estilo, col], gorro: {…gorroLana}, gorra: {col}, panuelo: [col, pelo], anteojos, barba: col, extra: (k) => {}, escala, bota: escala de bota, encorvado, liviana }
const MANO_INVIS = new THREE.MeshBasicMaterial({ visible: false });
function vestirG(k, o) { const skin = o.skin; k.skin = skin; k.r6 = true; delete k.falda; delete k.pasoMax; delete k.zancMax; k.encorvado = o.encorvado || 0; k.liviana = o.liviana || 0; k.flamea = [];
  [k.body, k.armL, k.armR, k.legL, k.legR].forEach(gr => [...gr.children].forEach(c => { if (c.isMesh || c.userData.pelo || c.userData.bota) gr.remove(c) })); [...k.head.children].forEach(c => { if (c !== k.decal) k.head.remove(c) });
  const plast = map => new THREE.MeshStandardMaterial({ map, roughness: .62 }), t = o.torso;
  part(RB(1.04, 1.04, .52, .05), boxMats(plast(torsoLado(t)), plast(torsoG(t)), plast(torsoG(t, true))), 0, 1.54, 0, k.body, 0);
  [k.armL, k.armR].forEach((a, i) => { part(RB(.5, 1.04, .5, .05), plast(brazoG({ skin, ...o.brazo })), 0, -.44, 0, a, 0); a.position.x = (i ? 1 : -1) * .77;
    const hd = i ? k.handR : k.handL; a.add(hd); hd.position.set(0, -.86, 0); hd.rotation.set(0, 0, 0); hd.material = MANO_INVIS; hd.castShadow = hd.receiveShadow = false });   // la mano: un ancla invisible para la utilería
  k.texPierna = [piernaG({ skin, ...o.pierna }), piernaG({ skin, ...o.pierna }, true)]; k.matPierna = [];
  k.botaG = [k.legL, k.legR].map((l, i) => { const m = plast(k.texPierna[0]); k.matPierna.push(m); part(RB(.5, 1.02, .5, .05), m, 0, -.5, 0, l, 0); l.position.x = (i ? 1 : -1) * .26;
    const b = botaNueva(o.bota || 1); b.position.set((i ? 1 : -1) * .018 * (o.bota || 1), -1.02, 0); b.userData.x0 = b.position.x; b.userData.bota = 1; l.add(b); return b });
  part(RB(.74, .66, .7, .075, 4), new THREE.MeshStandardMaterial({ color: skin, roughness: .55 }), 0, .38, 0, k.head, 0);
  k.decal.geometry = new THREE.PlaneGeometry(.74, .555); k.decal.position.set(0, .4, .3515); k.decal.material.transparent = true; k.decal.material.needsUpdate = true;
  // pelo y gorros: se arman en un grupo aparte y se FUNDEN en pocas mallas (una por color) dentro de k.peloG (lo inclina vientoPelo)
  const tmp = new THREE.Group(), fk = { head: tmp }; if (o.pelo) peloV(tmp, ...o.pelo); if (o.gorro) gorroLana(fk, o.gorro); if (o.gorra) gorraPlana(fk, o.gorra); if (o.panuelo) panueloV(fk, ...o.panuelo); if (o.coronita) o.coronita(tmp);
  tmp.updateMatrixWorld(true); const porCol = new Map(); tmp.traverse(m => { if (!m.isMesh) return; const key = m.material.color.getHexString() + (m.material.side || 0); if (!porCol.has(key)) porCol.set(key, [m.material, []]); porCol.get(key)[1].push([m.geometry, m.matrixWorld.clone()]) });
  k.peloG = new THREE.Group(); k.peloG.matrixAutoUpdate = false; k.head.add(k.peloG); porCol.forEach(([mat, list]) => { const me = part(mergeG(list), mat, 0, 0, 0, k.peloG, 0); me.userData.pelo = 1 });
  if (o.anteojos) anteojosV(k); if (o.barba) barbaG(k, o.barba); if (o.extra) o.extra(k);
  k.body.scale.setScalar(o.escala || 1); k.arrugas = 0; k._arena = null; setFace(k, "neutral"); return k }

// ---------- EL ELENCO
const PIP = ME6, TOBB = GARROW, TOBB_CHICO = PIM, MARTA = QUILL, NOVIO = FOLK[0], NOVIA = FOLK[1], MAMA = FOLK[2];
const VECINOS = [FOLK[3], FOLK[4], FOLK[5], EXT[0], EXT[1], EXT[2], EXT[3], PESCADOR];
for (const [sk, sh] of [["#e2b48e", "#5a7f8c"], ["#9a6444", "#d9ccb0"]]) { const k = kid({ skin: sk, shirt: sh, cloth: "plain", pants: "#3a3a3a", shoes: "#2a2420", hair: "#2b211b", style: "corto" }); TURT.add(k.g); ALL.push(k); VECINOS.push(k) }
const MEDIA_COL = "#ece4d2";
// el narrador (13): silueta de TRES colores planos — abrigo azul, bufanda mostaza, pantalón carbón — y pelo en puntas castaño oscuro
vestirG(ME, { skin: "#eebd94", torso: { col: "#2d64ad", abrigo: [null, "#1d4378"], bufanda: ["#f0ac22", null] }, brazo: { col: "#2d64ad", manga: .84, puno: "#1d4378" }, pierna: { col: "#38373c", media: MEDIA_COL, mediaRaya: "#2d64ad" }, pelo: ["puntas", "#3a2416"], escala: .9 });
// Pip (7, «la más liviana»): abrigo rojo con BOLSILLOS ABULTADOS llenos de piedras, gorro amarillo con pompón rojo (como sus cometas), colitas cobrizas, mitones amarillos
vestirG(PIP, { skin: "#f4cba6", torso: { col: "#d63a2c", bolsillos: "#d63a2c", abrigo: [null, "#f2c230"] }, brazo: { col: "#d63a2c", manga: .78, guante: "#f2c230" }, pierna: { col: "#3d4462", falda: .3, faldaCol: "#d63a2c", ruedo: "#f2c230", largo: .8, media: "#f4efe4", mediaRaya: "#d63a2c" },
  gorro: { col: "#f2c230", banda: "#e8a81e", pompon: "#d63a2c" }, escala: .72, liviana: 1,
  extra: k => { colitas(k, "#b8572a", "#d63a2c"); const piedras = [], r = rng(707); for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { const g = new THREE.IcosahedronGeometry(.045 + r() * .03, 0); g.scale(1, .8 + r() * .3, .9); piedras.push([g, new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(r() * 3, r() * 3, r() * 3)).setPosition(s * .264 + (i - 1.5) * .062, 1.46 + r() * .03, .262 + r() * .02)]) }
    part(mergeG(piedras), accMat("#8f8b84"), 0, 0, 0, k.body, 0) } });   // las piedras que asoman de los bolsillos (pocos polígonos)
// el viejo Tobb: abrigo largo verde con botones de palito, bufanda óxido a rayas crema (el color de su suéter de chico), gorra plana, pelo y barba blancos, encorvado, LAS BOTAS MÁS GRANDES
vestirG(TOBB, { skin: "#d8a882", torso: { col: "#4e6a48", abrigo: ["#3e5639", "#e2d6b8"], bufanda: ["#b3532e", "#efe2c4"] }, brazo: { col: "#4e6a48", manga: .84, puno: "#3e5639" }, pierna: { col: "#5a5048", falda: .32, largo: .8, ruedo: "#3e5639", faldaCol: "#4e6a48", media: MEDIA_COL, mediaRaya: "#b3532e" },
  pelo: ["bajo", "#d9d5cc"], gorra: { col: "#6b5e50" }, barba: "#dedad1", bota: 1.32, encorvado: .25 });
// Tobb de chico (11, el recuerdo): suéter óxido con guarda nórdica crema, pantalón marrón, pelo negro; sostiene UNA MEDIA (MEDIA_TOBB)
vestirG(TOBB_CHICO, { skin: "#e2ad86", torso: { col: "#b3532e", kind: "nordico", alt: "#efe2c4" }, brazo: { col: "#b3532e", manga: .8, puno: "#efe2c4" }, pierna: { col: "#6a5644", media: MEDIA_COL, mediaRaya: "#b3532e" }, pelo: ["corto", "#1e1a18"], escala: .82 });
// la vieja Marta: vestido azul oscuro, delantal crema con bolsillo, pañuelo bordó, pelo gris; lleva la TAZA CON TAPA
vestirG(MARTA, { skin: "#e0b394", torso: { col: "#3c4f7a", delantal: ["#efe6d2", "#c0503a"] }, brazo: { col: "#3c4f7a", manga: .82, puno: "#efe6d2" }, pierna: { col: "#2e3240", falda: .86, faldaCol: "#3c4f7a", ruedo: "#efe6d2", largo: .8, media: "#5a5a62", mediaRaya: "#3c4f7a" },
  panuelo: ["#8a3a4a", "#cfcac2"], anteojos: 1, encorvado: .12 });
// el novio: traje carbón pintado con camisa blanca, moño bordó y flor en la solapa
vestirG(NOVIO, { skin: "#c48a62", torso: { col: "#3a3a44", traje: ["#f4f0e8", "#8a2a34", "#f2c230"] }, brazo: { col: "#3a3a44", manga: .86, puno: "#f4f0e8" }, pierna: { col: "#33333c", media: "#3a3a44", mediaRaya: "#55555f" }, pelo: ["corto", "#241c18"] });
// la novia: vestido crema con encaje y faja dorada, coronita de flores y velo corto (flamea)
vestirG(NOVIA, { skin: "#f0c7a4", torso: { col: "#d6c9b0", encaje: "#ebe3d4", faja: ["#c09048"] }, brazo: { col: "#d6c9b0", manga: .5 }, pierna: { col: "#d6c9b0", falda: .88, faldaCol: "#d6c9b0", ruedo: "#c9a256", largo: .8, media: "#f2ece0", mediaRaya: "#c9a256" },
  pelo: ["rodete", "#6b4430"], coronita: h => { const cols = ["#f6f2ea", "#f2c230", "#e08a9a"]; for (let j = 0; j < 7; j++) { const a = (j / 6 - .5) * 2.4; gema(h, accMat(cols[j % 3]), .07, Math.sin(a) * .4, .8, Math.cos(a) * .32 - .02) } }, extra: k => velo(k) });
// la mamá: suéter ciruela con guarda nórdica, pollera larga gris pintada, rodete; lleva al BEBE_V en brazos
vestirG(MAMA, { skin: "#d9a07a", torso: { col: "#7a4a6a", kind: "nordico", alt: "#efe2d2" }, brazo: { col: "#7a4a6a", manga: .82 }, pierna: { col: "#3a3a40", falda: .84, faldaCol: "#5a5a62", ruedo: "#7a4a6a", largo: .8, media: "#3a3a40", mediaRaya: "#7a4a6a" }, pelo: ["rodete", "#3a2418"] });
// vecinos (chicos, adultos y viejos): lana de colores de montaña, un estampado cada uno, gorros, gorras y pañuelos
const VC = (k, o) => vestirG(k, { ...o, pierna: { media: MEDIA_COL, mediaRaya: "#7a6a5a", ...o.pierna } });
VC(VECINOS[0], { skin: "#d9b08c", torso: { col: "#7a5a3a", abrigo: ["#5e4429", "#d8ccb0"] }, brazo: { col: "#7a5a3a", manga: .84 }, pierna: { col: "#4a443e" }, pelo: ["bajo", "#d8d4cc"], gorro: { col: "#6f7378" }, barba: "#d8d4cc", encorvado: .18 });           // viejo
VC(VECINOS[1], { skin: "#c48a62", torso: { col: "#a33a2e", kind: "cuadros", alt: "#2a2626" }, brazo: { col: "#a33a2e", manga: .84, rayas: "#6e2620" }, pierna: { col: "#3b4a5e" }, pelo: ["bajo", "#1d1a17"], gorro: { col: "#2e3a59" } });   // leñador
VC(VECINOS[2], { skin: "#e8b48c", torso: { col: "#c9952e", abrigo: [null, "#6a4a22"], bufanda: ["#4f7a4a", "#efe2c4"] }, brazo: { col: "#c9952e", manga: .82, guante: "#4f7a4a" }, pierna: { col: "#4a3f36", falda: .7, faldaCol: "#c9952e", ruedo: "#6a4a22" }, panuelo: ["#4f7a4a", "#5a3a22"] });
VC(VECINOS[3], { skin: "#f2cfae", torso: { col: "#4f8a5a", kind: "franjas", alt: "#e9e2cc", bufanda: ["#c0392b", null] }, brazo: { col: "#4f8a5a", manga: .8, rayas: "#e9e2cc" }, pierna: { col: "#5a4a3c" }, pelo: ["puntas", "#d9b060"], escala: .76 });   // chico
VC(VECINOS[4], { skin: "#c98e64", torso: { col: "#6a4a8a", abrigo: [null, "#efe2d2"], kind: "lunares", alt: "#8a6aaa" }, brazo: { col: "#6a4a8a", manga: .8, guante: "#e08aa0" }, pierna: { col: "#3a3646", falda: .36, faldaCol: "#6a4a8a", ruedo: "#efe2d2" }, pelo: ["rulos", "#2b1d16"], gorro: { col: "#e08aa0", pompon: "#f4efe4" }, escala: .8 });   // chica
VC(VECINOS[5], { skin: "#e6c0a0", torso: { col: "#2e2e36", chal: ["#8a8478", "#c9b48a"] }, brazo: { col: "#8a8478", manga: .84 }, pierna: { col: "#2e2e36", falda: .86, faldaCol: "#2e2e36", ruedo: "#8a8478" }, panuelo: ["#5a3a4a", "#d8d4cc"], anteojos: 1, encorvado: .2 });   // vieja con chal
VC(VECINOS[6], { skin: "#a86c48", torso: { col: "#2f3f5e", abrigo: ["#24304a", "#c9a24a"] }, brazo: { col: "#2f3f5e", manga: .84, puno: "#24304a" }, pierna: { col: "#4a4038" }, gorra: { col: "#5a4a3a" }, pelo: ["bajo", "#3a2416"], barba: "#4a2e1c" });
VC(VECINOS[7], { skin: "#f0c6a0", torso: { col: "#e6dcc4", kind: "trenza", alt: "#cfc3a6", chaleco: ["#8a5a32"] }, brazo: { col: "#e6dcc4", manga: .82 }, pierna: { col: "#3a4a3a" }, pelo: ["corto", "#a8502a"] });
VC(VECINOS[8], { skin: "#e2b48e", torso: { col: "#3f7f7a", kind: "rayas", alt: "#2f625e", bufanda: ["#f4efe4", "#c0392b"] }, brazo: { col: "#3f7f7a", manga: .82 }, pierna: { col: "#2e2e36", falda: .34, faldaCol: "#3f7f7a", ruedo: "#2f625e" }, pelo: ["rodete", "#5a3a22"], escala: .88 });   // muchacha
VC(VECINOS[9], { skin: "#9a6444", torso: { col: "#d9ccb0", kind: "trenza", alt: "#bfb08e" }, brazo: { col: "#d9ccb0", manga: .84 }, pierna: { col: "#4a4038" }, gorro: { col: "#b8382c", banda: "#8a2a20" }, pelo: ["bajo", "#1d1a17"], barba: "#1d1a17" });
const ELENCO_V = [ME, PIP, TOBB, TOBB_CHICO, MARTA, NOVIA, NOVIO, MAMA, ...VECINOS];
const ELENCO_N = { ME, PIP, TOBB, TOBB_CHICO, MARTA, NOVIA, NOVIO, MAMA, ...Object.fromEntries(VECINOS.map((k, i) => ["V" + i, k])) };
ALL.forEach((k, i) => { k.idx = i; setFace(k, "neutral") });

// ---------- VIENTO EN EL PELO: vientoPelo(k, f, { t, dir }) — f = 0 (valle, quieto) … 1 (Gusthollow) … 1.5 (tormenta)
// El pelo y los gorros se inclinan (cizalla desde la altura de las orejas) hacia donde sopla (dir, en el MUNDO; por defecto VDIR = +x) y
// se sacuden; las colitas de Pip, el velo y las barbas FLAMEAN desde su raíz. Las poses de este archivo ya lo llaman.
function vientoPelo(k, f = 1, o = {}) { if (!k.peloG) return; const t = o.t ?? k._t ?? 0;
  if (!f) { k.peloG.matrix.identity(); k.peloG.matrixWorldNeedsUpdate = true; k.flamea.forEach(F => F.g.quaternion.identity()); return }
  k.g.updateMatrixWorld(true); k.head.getWorldQuaternion(_q1).invert(); const d = o.dir || VDIR, w = _v1.set(d[0] ?? d.x, d[1] ?? d.y, d[2] ?? d.z).normalize().applyQuaternion(_q1);
  const ph = (k.idx || 0) * 1.3, s = f * (.34 + .08 * Math.sin(t * 21 + ph) + .05 * Math.sin(t * 34 + ph * 2)), y0 = .42;
  k.peloG.matrix.set(1, w.x * s, 0, -w.x * s * y0, 0, 1, 0, 0, 0, w.z * s, 1, -w.z * s * y0, 0, 0, 0, 1); k.peloG.matrixWorldNeedsUpdate = true;
  k.flamea.forEach(F => { _v2.crossVectors(F.rest, w); const L = _v2.length(); if (L < 1e-4) { F.g.quaternion.identity(); return } const ang = Math.min(Math.acos(cl(F.rest.dot(w), -1, 1)), f * F.max) + f * .14 * Math.sin(t * 19 + F.fase * 3 + ph); F.g.quaternion.setFromAxisAngle(_v2.multiplyScalar(1 / L), ang) }) }

// ---------- helpers de pose (cuerpo entero con cuaterniones; brazos y piernas que apuntan a un punto del mundo)
// qMundo(k, arriba, frente): orientación del body (en coords de k.g) para que su cabeza apunte a `arriba` y su pecho a `frente` (vectores del MUNDO)
function qMundo(k, arriba, frente, out = new THREE.Quaternion()) { _ay.set(...arriba).normalize(); _az.set(...frente); _az.addScaledVector(_ay, -_az.dot(_ay)); if (_az.lengthSq() < 1e-6) _az.set(1, 0, 0).addScaledVector(_ay, -_ay.x);
  _az.normalize(); _ax.crossVectors(_ay, _az); _mb.makeBasis(_ax, _ay, _az); out.setFromRotationMatrix(_mb); k.g.updateWorldMatrix(true, false); k.g.getWorldQuaternion(_q2); return out.premultiply(_q2.invert()) }
// cuerpoQ(k, q, pivL, pivG): el body toma la orientación q y el punto pivL (coords del body, sin escala) queda en pivG (coords de k.g)
function cuerpoQ(k, q, pivL, pivG) { const b = k.body, s = b.scale.y; b.quaternion.copy(q); _v3.set(...pivL).multiplyScalar(s).applyQuaternion(q); b.position.set(pivG[0] - _v3.x, pivG[1] - _v3.y, pivG[2] - _v3.z) }
// apuntar(k, miembro, p): el brazo/pierna (k.armL, k.armR, k.legL, k.legR) apunta con su punta al punto p del MUNDO (Vector3)
function apuntar(k, m, p) { k.g.updateMatrixWorld(true); _v1.copy(p); m.parent.worldToLocal(_v1); _v1.sub(m.position); if (_v1.lengthSq() < 1e-8) return; m.quaternion.setFromUnitVectors(_ABAJO, _v1.normalize()) }
// inclinarViento(k, ang): inclina el cuerpo entero (desde los pies) `ang` radianes CONTRA el viento (hacia −x del mundo), mire hacia donde mire
function inclinarViento(k, ang, lado = 0) { k.g.updateWorldMatrix(true, false); k.g.getWorldQuaternion(_q1); const fw = _v1.set(0, 0, 1).applyQuaternion(_q1), rw = _v2.set(1, 0, 0).applyQuaternion(_q1);
  const lz = -VDIR[0] * fw.x - VDIR[2] * fw.z, lx = -VDIR[0] * rw.x - VDIR[2] * rw.z; k.body.rotation.set(ang * lz - lado * lx, 0, -ang * lx - lado * lz) }
// mezclaPoses(k, fA, fB, u): arma la pose A (callback), después la B, y deja la mezcla (u = 0 → A, 1 → B). Sirve para transiciones.
const _MIEM = k => [k.armL, k.armR, k.legL, k.legR, k.head];
function fotoPose(k) { return { bq: k.body.quaternion.clone(), bp: k.body.position.clone(), m: _MIEM(k).map(o => o.quaternion.clone()) } }
function mezclaPoses(k, fA, fB, u) { fA(); const A = fotoPose(k); fB(); const B = fotoPose(k); k.body.quaternion.slerpQuaternions(A.bq, B.bq, u); k.body.position.lerpVectors(A.bp, B.bp, u); _MIEM(k).forEach((o, i) => o.quaternion.slerpQuaternions(A.m[i], B.m[i], u)) }

// ---------- UTILERÍA (escondida por defecto en cada cuadro). attach(obj, k, "R"|"L", [x, y, z]) del motor o enMano(…), que además la deja derecha.
function tuboAf(pts, r0, r1, RS = 8, TS = 16, plano = 1) { const cu = new THREE.CatmullRomCurve3(pts.map(q => new THREE.Vector3(...q))), geo = new THREE.TubeGeometry(cu, TS, 1, RS, false), p = geo.attributes.position, v = new THREE.Vector3(), fr = cu.computeFrenetFrames(TS, false);
  for (let i = 0; i <= TS; i++) { const c = cu.getPointAt(i / TS), rad = lerp(r0, r1, i / TS); for (let j = 0; j <= RS; j++) { const q = i * (RS + 1) + j; v.fromBufferAttribute(p, q).sub(c); const a = v.dot(fr.normals[i]), b = v.dot(fr.binormals[i]); v.copy(fr.normals[i]).multiplyScalar(a * rad).addScaledVector(fr.binormals[i], b * rad * plano).add(c); p.setXYZ(q, v.x, v.y, v.z) } }
  geo.computeVertexNormals(); return geo }
const M_MADERA_U = new THREE.MeshStandardMaterial({ color: "#8a6238", roughness: .75, flatShading: true });
const PROP = g => { g.visible = false; g.userData.prop = 1; return g };
// enMano(obj, k, mano, { off, derecho, viento }): en la mano; derecho = queda vertical en el mundo (taza, media colgando) aunque el brazo esté inclinado;
// viento f > 0: lo que cuelga se inclina hacia +x y flamea. Llamar DESPUÉS de posar los brazos.
function enMano(obj, k, mano = "R", { off = [0, -.12, .12], derecho = true, viento = 0 } = {}) { attach(obj, k, mano, off); if (!derecho) return obj; const h = mano === "R" ? k.handR : k.handL, t = k._t || 0;
  k.g.updateMatrixWorld(true); h.getWorldQuaternion(_q1); k.g.getWorldQuaternion(_q2); _q3.setFromAxisAngle(_v1.set(0, 0, 1), viento * (1.15 + .18 * Math.sin(t * 15 + k.idx) + .08 * Math.sin(t * 31)));
  obj.quaternion.copy(_q1.invert().multiply(_q3).multiply(_q2)); return obj }
// el bastón del viejo Tobb (si está en su mano, quieto()/andar() lo dejan vertical y apoyado en el piso)
const BASTON = PROP(new THREE.Group());
{ const v = part(new THREE.CylinderGeometry(.034, .026, 1, 7), M_MADERA_U, 0, -.5, 0, BASTON, 0); BASTON.userData.vara = new THREE.Group(); BASTON.add(BASTON.userData.vara); BASTON.userData.vara.add(v);
  part(tuboAf([[0, -.02, 0], [0, .1, 0], [0, .17, .05], [0, .17, .15], [0, .1, .2]], .036, .03, 6, 10), M_MADERA_U, 0, 0, 0, BASTON, 0); part(new THREE.CylinderGeometry(.034, .04, .07, 7), BOTA.suela, 0, -.98, 0, BASTON.userData.vara, 0) }
function bastonAlPiso(k) { if (!BASTON.visible || (BASTON.parent !== k.handR && BASTON.parent !== k.handL)) return; k.g.updateMatrixWorld(true); const h = BASTON.parent; h.getWorldQuaternion(_q1); k.g.getWorldQuaternion(_q2); BASTON.quaternion.copy(_q1.invert().multiply(_q2));
  BASTON.getWorldPosition(_v1); k.g.getWorldPosition(_v2); BASTON.userData.vara.scale.y = Math.max(.2, _v1.y - _v2.y) }
// la taza con tapa de Marta: loza azul esmaltada con guarda blanca, tapa con perilla, asa
const TAZA_TAPA = PROP(new THREE.Group());
{ const m = new THREE.MeshStandardMaterial({ color: "#3d6aa8", roughness: .32, flatShading: true }), b = new THREE.MeshStandardMaterial({ color: "#f2ede2", roughness: .35, flatShading: true });
  part(new THREE.CylinderGeometry(.12, .105, .24, 10), m, 0, .12, 0, TAZA_TAPA, 0); part(new THREE.CylinderGeometry(.122, .122, .035, 10), b, 0, .17, 0, TAZA_TAPA, 0);
  part(new THREE.CylinderGeometry(.13, .13, .03, 10), m, 0, .255, 0, TAZA_TAPA, 0); part(new THREE.IcosahedronGeometry(.035, 0), b, 0, .285, 0, TAZA_TAPA, 0);
  const a = part(new THREE.TorusGeometry(.065, .018, 5, 8, Math.PI), m, .125, .13, 0, TAZA_TAPA, 0); a.rotation.z = -Math.PI / 2 }
// la media de Tobb chico: lana crema con la raya óxido (la misma media pintada de sus piernas); cuelga desde arriba
const MEDIA_TOBB = PROP(new THREE.Group());
{ const t = tex(64, 128, (g, w, h) => { g.fillStyle = MEDIA_COL; g.fillRect(0, 0, w, h); g.fillStyle = "#b3532e"; g.fillRect(0, 10, w, 12); g.fillRect(0, 28, w, 5); g.fillStyle = "rgba(0,0,0,.12)"; g.fillRect(0, h - 20, w, 20) }), m = new THREE.MeshStandardMaterial({ map: t, roughness: .8 });
  part(RB(.17, .36, .1, .03, 1), m, 0, -.2, 0, MEDIA_TOBB, 0); part(RB(.17, .11, .24, .04, 1), m, 0, -.34, .08, MEDIA_TOBB, 0) }
// el bebé: bulto en una manta tejida amarilla a rayas, carita dormida, gorrito, y DOS BOTITAS DE HIERRO chiquitas que asoman abajo
const BEBE_V = PROP(new THREE.Group());
{ const t = tex(128, 128, (g, w, h) => { g.fillStyle = "#f2d27a"; g.fillRect(0, 0, w, h); g.fillStyle = "#e9e2cc"; for (let y = 10; y < h; y += 32) g.fillRect(0, y, w, 12); sombra2D(g, w, h, .1) }), m = new THREE.MeshStandardMaterial({ map: t, roughness: .7 });
  part(RB(.38, .56, .32, .06, 2), m, 0, 0, 0, BEBE_V, 0); part(RB(.27, .25, .25, .03, 2), new THREE.MeshStandardMaterial({ color: "#f0c7a4", roughness: .55 }), 0, .38, .02, BEBE_V, 0);
  const go = part(new THREE.CylinderGeometry(.13, .17, .14, 8), accMat("#e9e2cc"), 0, .5, 0, BEBE_V, 0); go.rotation.x = -.15;
  const cara = tex(256, 192, g => { g.strokeStyle = TINTA; g.lineCap = "round"; g.lineWidth = 11; for (const x of [84, 172]) { g.beginPath(); g.moveTo(x - 20, 82); g.quadraticCurveTo(x, 100, x + 20, 82); g.stroke() } g.fillStyle = BORDO; g.beginPath(); g.ellipse(128, 138, 10, 9, 0, 0, 7); g.fill() });
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(.25, .19), new THREE.MeshStandardMaterial({ map: cara, transparent: true, roughness: .8, depthWrite: false })); pl.position.set(0, .38, .148); BEBE_V.add(pl);
  for (const s of [-1, 1]) { const b = botaNueva(.32); b.position.set(s * .09, -.36, .02); BEBE_V.add(b) } }
// acunar(k, obj): la mamá sostiene al bebé contra el pecho con los dos brazos (llamar después de quieto/andar/quietoViento)
function acunar(k, obj = BEBE_V) { if (obj.parent !== k.body) k.body.add(obj); obj.visible = true; obj.position.set(-.08, 1.62, .48); obj.rotation.set(.3, 0, -1.15); obj.scale.setScalar(1);
  k.armL.rotation.set(-.75, 0, .5); k.armR.rotation.set(-.85, 0, -.5); k.head.rotation.x = .22; k.head.rotation.z = -.08 }
// la cometa nueva de Pip: rombo con cuadrantes amarillo/rojo, varillas, y una cola con moños que flamea hacia +x
const COMETA_PIP = PROP(new THREE.Group());
{ const t = tex(256, 320, (g, w, h) => { const cx = 128, cy = 112; [["#f2c230", 0, 0, cx, cy], ["#d63a2c", cx, 0, w, cy], ["#d63a2c", 0, cy, cx, h], ["#f2c230", cx, cy, w, h]].forEach(([c, a, b, x2, y2]) => { g.fillStyle = c; g.fillRect(a, b, x2 - a, y2 - b) });
    g.strokeStyle = "#5a3a22"; g.lineWidth = 7; g.beginPath(); g.moveTo(cx, 0); g.lineTo(cx, h); g.moveTo(0, cy); g.lineTo(w, cy); g.stroke() }), sh = new THREE.Shape(); sh.moveTo(0, .55); sh.lineTo(.38, .15); sh.lineTo(0, -.65); sh.lineTo(-.38, .15); sh.closePath();
  const geo = new THREE.ShapeGeometry(sh), p = geo.attributes.position, uv = geo.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + .38) / .76, (p.getY(i) + .65) / 1.2);
  part(geo, new THREE.MeshStandardMaterial({ map: t, roughness: .7, side: THREE.DoubleSide }), 0, 0, 0, COMETA_PIP, 0); COMETA_PIP.userData.cola = [];
  for (let i = 0; i < 5; i++) { const mo = new THREE.Group(); COMETA_PIP.add(mo); for (const s of [-1, 1]) { const c = part(new THREE.ConeGeometry(.06, .13, 3), accMat(i % 2 ? "#f2c230" : "#d63a2c", { side: THREE.DoubleSide }), s * .06, 0, 0, mo, 0); c.rotation.z = s * Math.PI / 2; c.scale.z = .3 } COMETA_PIP.userData.cola.push(mo) } }
// ---------- cuerdas (soga de los novios, hilo de la cometa, cola de la cometa): tubo de pocas caras que se rehace cada cuadro entre puntos del mundo
const T_SOGA_V = tex(64, 16, (g, w, h) => { g.fillStyle = "#b8975e"; g.fillRect(0, 0, w, h); g.strokeStyle = "#7a5e34"; g.lineWidth = 4; for (let x = -16; x < w + 16; x += 12) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + 10, 0); g.stroke() } }); T_SOGA_V.wrapS = T_SOGA_V.wrapT = THREE.RepeatWrapping;
const M_SOGA_V = new THREE.MeshStandardMaterial({ map: T_SOGA_V, roughness: .85 }), M_HILO_V = new THREE.MeshStandardMaterial({ color: "#f2eee4", roughness: .8 });
function cuerdaNueva(r, mat, TS = 18, RS = 5, rep = 14) { const N = (TS + 1) * (RS + 1), geo = new THREE.BufferGeometry(), idx = [], uv = new Float32Array(N * 2);
  for (let i = 0; i < TS; i++) for (let j = 0; j < RS; j++) { const a = i * (RS + 1) + j, b = a + RS + 1; idx.push(a, b, a + 1, b, b + 1, a + 1) }
  for (let i = 0; i <= TS; i++) for (let j = 0; j <= RS; j++) { uv[(i * (RS + 1) + j) * 2] = i / TS * rep; uv[(i * (RS + 1) + j) * 2 + 1] = j / RS }
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3)); geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); geo.setIndex(idx);
  const m = new THREE.Mesh(geo, mat); m.frustumCulled = false; m.castShadow = true; m.userData.prop = 1; m.visible = false; scene.add(m);
  const P0 = new THREE.Vector3(), P1 = new THREE.Vector3(), P2 = new THREE.Vector3(), c = new THREE.Vector3(), T = new THREE.Vector3(), Nn = new THREE.Vector3(), B = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  m.poner = (a, b, d) => { P0.copy(a); P1.copy(b); P2.copy(d); const p = geo.attributes.position;
    for (let i = 0; i <= TS; i++) { const u = i / TS, v = 1 - u; c.set(0, 0, 0).addScaledVector(P0, v * v).addScaledVector(P1, 2 * u * v).addScaledVector(P2, u * u); T.set(0, 0, 0).addScaledVector(P0, -2 * v).addScaledVector(P1, 2 * v - 2 * u).addScaledVector(P2, 2 * u).normalize();
      Nn.crossVectors(T, up); if (Nn.lengthSq() < 1e-6) Nn.set(1, 0, 0); Nn.normalize(); B.crossVectors(T, Nn);
      for (let j = 0; j <= RS; j++) { const an = j / RS * 6.283, q = i * (RS + 1) + j; p.setXYZ(q, c.x + (Nn.x * Math.cos(an) + B.x * Math.sin(an)) * r, c.y + (Nn.y * Math.cos(an) + B.y * Math.sin(an)) * r, c.z + (Nn.z * Math.cos(an) + B.z * Math.sin(an)) * r) } }
    p.needsUpdate = true; geo.computeVertexNormals(); m.visible = true; return m };
  return m }
const SOGA_N = cuerdaNueva(.035, M_SOGA_V), HILO_C = cuerdaNueva(.008, M_HILO_V, 16, 3, 1), COLA_C = cuerdaNueva(.007, M_HILO_V, 12, 3, 1);
// anillo de soga atado a la cintura (rectángulo redondeado alrededor del torso); uno por novio, se crea la primera vez
function anilloSoga(k) { if (k.anillo) return k.anillo; const pts = [], a = .575, b = .315, r = .1; for (let i = 0; i < 16; i++) { const an = i / 16 * 6.283, cx = Math.sign(Math.cos(an)) * (a - r), cz = Math.sign(Math.sin(an)) * (b - r); pts.push(new THREE.Vector3(cx + Math.cos(an) * r * 1.4, 0, cz + Math.sin(an) * r * 1.4)) }
  k.anillo = PROP(part(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 40, .036, 5, true), M_SOGA_V, 0, 1.12, 0, k.body, 0)); return k.anillo }
// sogaNovios(a, b, t, { comba, viento }): la soga que une a los novios por la cintura (anillo en cada uno + el tramo que cuelga entre los dos)
function sogaNovios(a = NOVIA, b = NOVIO, t = 0, { comba = .35, viento = 1 } = {}) { [a, b].forEach(k => anilloSoga(k).visible = true); a.g.updateMatrixWorld(true); b.g.updateMatrixWorld(true);
  const A = a.body.localToWorld(new THREE.Vector3(0, 1.12, 0)), B = b.body.localToWorld(new THREE.Vector3(0, 1.12, 0)), d = B.clone().sub(A), L = d.length(); d.normalize();
  const pa = A.clone().addScaledVector(d, .56 * a.body.scale.y), pb = B.clone().addScaledVector(d, -.56 * b.body.scale.y), mid = pa.clone().add(pb).multiplyScalar(.5);
  mid.y -= comba * Math.max(.2, L - 1.1); mid.x += viento * (.22 + .06 * Math.sin(t * 9)) * Math.max(.3, L - 1); SOGA_N.poner(pa, mid, pb) }
// cometaPip(t, pos, { mira, f }): pone la cometa de Pip en pos (mundo) mirando hacia `mira` (por ej. Pip), con la cola flameando hacia +x; devuelve el punto del hilo
function cometaPip(t, pos, { mira = null, f = 1 } = {}) { const C = COMETA_PIP; if (C.parent !== scene) scene.add(C); C.visible = true; C.position.set(...pos); if (mira) C.lookAt(_v1.set(...mira)); C.rotateZ(.25 + .12 * Math.sin(t * 2.3)); C.rotateX(-.35 + .06 * Math.sin(t * 3.1));
  C.updateMatrixWorld(true); const cola = [], base = C.localToWorld(new THREE.Vector3(0, -.65, 0)); for (let i = 1; i <= 5; i++) { const q = i / 5; cola.push(base.clone().add(_v1.set(f * q * 1.6, -q * 1.1 + Math.sin(t * 7 - i) * .12, Math.sin(t * 5 - i * 1.3) * .15 * q))) }
  C.userData.cola.forEach((mo, i) => { C.worldToLocal(mo.position.copy(cola[i])); mo.rotation.set(0, 0, Math.sin(t * 9 + i) * .4) }); COLA_C.poner(base, cola[1], cola[4]);
  return C.localToWorld(new THREE.Vector3(0, -.05, .02)) }
function utileriaReset() { [BASTON, TAZA_TAPA, MEDIA_TOBB, BEBE_V, COMETA_PIP, SOGA_N, HILO_C, COLA_C, ...BOTAS_SUELTAS].forEach(o => o.visible = false); [NOVIA, NOVIO].forEach(k => { if (k.anillo) k.anillo.visible = false }) }

// ================= ANIMACIÓN (se llaman DESPUÉS de pose(); dejan al personaje listo) =================
// pose() del motor queda envuelta: limpia lo que estas funciones tocan (nada queda pegado de un cuadro al otro): botas puestas, pelo sin viento,
// utilería escondida una vez por cuadro.
{ const pose0 = pose; let tUlt = -1e9;
  pose = (k, t, o = {}) => { if (t !== tUlt) { tUlt = t; utileriaReset() } k._t = t; k.body.position.x = 0; k.body.position.z = 0; k.body.rotation.y = 0; k.body.rotation.z = 0; k.armL.rotation.y = 0; k.armR.rotation.y = 0; k.legL.rotation.y = 0; k.legR.rotation.y = 0; k.legL.rotation.z = 0; k.legR.rotation.z = 0;
    if (k.botaG) { botas(k); k.botaG.forEach(b => b.position.set(b.userData.x0, -1.02, 0)) } if (k.peloG) vientoPelo(k, 0); pose0(k, t, o) } }
// quiebre de cadera (el torso gira en la cadera y las piernas siguen rectas; sin codos ni rodillas). lean = inclinación del torso; psi = ángulo de las piernas
function cadera(k, lean, psi = 0) { const b = k.body, L0 = b.rotation.x, s = b.scale.y, d = lean - L0;
  b.rotation.x = lean; k.legL.rotation.x += psi - d; k.legR.rotation.x += psi - d; b.position.z -= H_CAD * s * ((Math.sin(lean) - Math.sin(L0)) - Math.sin(psi)); b.position.y -= H_CAD * s * ((Math.cos(lean) - Math.cos(L0)) - (Math.cos(psi) - 1)) }
const _fase = k => (k.idx || 0) * 1.7;
// quieto(k, t, { mira, viento }): parado derecho, brazos en «A». viento = cuánto se mueve el pelo (0 en el valle)
function quieto(k, t, { mira = 0, viento = 0 } = {}) { const A = A_BRAZO; k._t = t;
  k.legL.rotation.set(0, 0, 0); k.legR.rotation.set(0, 0, 0); k.armL.rotation.set(0, 0, -A); k.armR.rotation.set(0, 0, A); k.head.rotation.set(0, mira, 0); k.body.rotation.set(0, 0, 0); k.body.position.set(0, 0, 0);
  if (k.encorvado) { cadera(k, k.encorvado); k.head.rotation.x = -k.encorvado * .75; k.armL.rotation.x = k.encorvado * .8; k.armR.rotation.x = k.encorvado * .8; if (BASTON.visible && BASTON.parent === k.handR) k.armR.rotation.set(-.45, 0, .12) }
  bastonAlPiso(k); vientoPelo(k, viento, { t }); parpadeo(k, t) }
// caminata normal (valle): ciclo de 0,5 s; piernas ±27,5°, brazos ±7° en «A», balanceo ±5°
function andar(k, t, { vel = 1, viento = 0 } = {}) { const f = t * vel / .5 * Math.PI * 2 + _fase(k), sw = Math.sin(f), amp = k.pasoMax ?? .48, A = A_BRAZO, s = k.body.scale.y; k._t = t;
  k.body.rotation.set(0, 0, sw * .087); k.body.position.set(0, -H_CAD * s * (1 - Math.cos(amp * sw)), 0);
  k.legL.rotation.set(sw * amp, 0, 0); k.legR.rotation.set(-sw * amp, 0, 0); k.armL.rotation.set(-sw * .12, 0, -A); k.armR.rotation.set(sw * .12, 0, A); k.head.rotation.set(0, 0, -sw * .04);
  if (k.encorvado) { cadera(k, k.encorvado); k.head.rotation.x = -k.encorvado * .75; if (BASTON.visible && BASTON.parent === k.handR) k.armR.rotation.set(-.55 - k.encorvado + sw * .25, 0, .12) }
  bastonAlPiso(k); vientoPelo(k, viento, { t }); parpadeo(k, t) }
// corrida: ciclo de 0,5 s; torso 20° adelante; fuerte = 1: brazos que bombean
function correrV(k, t, { fuerte = 0, viento = 0 } = {}) { const f = t / .5 * Math.PI * 2 + _fase(k), sw = Math.sin(f), amp = k.zancMax ?? .87, A = A_BRAZO, lean = .35, s = k.body.scale.y; k._t = t;
  k.body.rotation.set(0, 0, 0); k.body.position.set(0, Math.abs(sw) * .13 * s, 0); k.legL.rotation.set(sw * amp, 0, 0); k.legR.rotation.set(-sw * amp, 0, 0); cadera(k, lean);
  const b0 = lerp(.38, -1.2, fuerte), ba = lerp(.06, .55, fuerte), bz = lerp(A * .7, .12, fuerte); k.armL.rotation.set(b0 - sw * ba, 0, -bz); k.armR.rotation.set(b0 + sw * ba, 0, bz); k.head.rotation.set(-lean * .7, 0, 0);
  vientoPelo(k, viento, { t }); parpadeo(k, t) }
// bambolea(k, t, q): Pip, la más liviana, se tambalea (suma encima de cualquier pose de viento): balanceo grande, un pie que se levanta, brazos que buscan equilibrio
function bambolea(k, t, q = 1) { if (!q) return; const ph = k.idx * .9, a = Math.sin(t * 3.3 + ph), b = Math.sin(t * 5.1 + ph * 2);
  k.body.rotation.z += q * (.08 * a + .03 * b); k.body.rotation.x += q * .05 * Math.sin(t * 4.3 + ph); k.legL.rotation.x -= q * .3 * Math.max(0, a); k.legR.rotation.x -= q * .3 * Math.max(0, -a);
  k.armL.rotation.z -= q * (.5 + .4 * Math.max(0, a)); k.armR.rotation.z += q * (.5 + .4 * Math.max(0, -a)); k.head.rotation.z -= q * .08 * a }
// quietoViento(k, t, { lean, brazos, bambolea }): parado AGUANTANDO el viento: todo el cuerpo inclinado contra el viento (~18°, hacia −x del mundo, mire
// hacia donde mire), piernas abiertas, tambaleo leve. brazos: "abajo" (empujados hacia atrás), "cubre" (se tapa la cara), "abiertos" (equilibrio)
function quietoViento(k, t, { lean = .32, brazos = "abajo", bambolea: bb = k.liviana, viento = 1 } = {}) { const ph = (k.idx || 0) * 1.1, s = k.body.scale.y; k._t = t;
  const L = lean * (1 + .1 * Math.sin(t * 2.1 + ph) + .06 * Math.sin(t * 5.3 + ph)); inclinarViento(k, L, .03 * Math.sin(t * 1.7 + ph)); k.body.position.set(0, 0, 0);
  k.legL.rotation.set(0, 0, -.09); k.legR.rotation.set(0, 0, .09); k.head.rotation.set(.12, 0, .03 * Math.sin(t * 3 + ph));
  const fl = .06 * Math.sin(t * 11 + ph);
  if (brazos === "cubre") { k.armL.rotation.set(-2.2 + fl, 0, .62); k.armR.rotation.set(-2.2 - fl, 0, -.62); k.head.rotation.x = .25 }
  else if (brazos === "abiertos") { k.armL.rotation.set(.1 + fl, 0, -1.05 + fl); k.armR.rotation.set(.1 - fl, 0, 1.05 - fl) }
  else { k.armL.rotation.set(.32 + fl, 0, -.38); k.armR.rotation.set(.32 - fl, 0, .38) }
  if (BASTON.visible && BASTON.parent === k.handR) k.armR.rotation.set(-.5, 0, .14);
  bambolea(k, t, bb); bastonAlPiso(k); vientoPelo(k, viento, { t }); parpadeo(k, t) }
// andarViento(k, t, { vel, lean, bambolea }): caminar INCLINADO contra el viento: cuerpo ~20° hacia −x (si camina hacia −x se ve inclinado hacia
// adelante; si camina hacia +x, hacia atrás), pasos cortos y pesados (ciclo de 0,8 s, piernas ±16°), golpe de bota en cada paso, brazos firmes adelante
function andarViento(k, t, { vel = 1, lean = .35, bambolea: bb = k.liviana, viento = 1 } = {}) { const f = t * vel / .8 * Math.PI * 2 + _fase(k), sw = Math.sin(f), amp = .28, s = k.body.scale.y; k._t = t;
  inclinarViento(k, lean, sw * .06); k.body.position.set(0, -H_CAD * s * (1 - Math.cos(amp * sw)) - .035 * s * (1 - Math.abs(Math.cos(f))), 0);
  k.legL.rotation.set(sw * amp, 0, -.05); k.legR.rotation.set(-sw * amp, 0, .05); k.armL.rotation.set(-.38 - sw * .16, 0, -.3); k.armR.rotation.set(-.38 + sw * .16, 0, .3); k.head.rotation.set(.16, 0, -sw * .05);
  if (BASTON.visible && BASTON.parent === k.handR) k.armR.rotation.set(-.6 + sw * .22, 0, .14);
  bambolea(k, t, bb * .7); bastonAlPiso(k); vientoPelo(k, viento, { t }); parpadeo(k, t) }
// aplastado(k, t, { mira, sacude }): tirado BOCA ABAJO agarrándose del piso (el viento lo aplasta), sacudiéndose. k.g en los pies; el cuerpo queda tendido
// hacia el frente (+z local): para que la cabeza quede contra el viento, ry = −π/2 (mirando a −x). mira = cuánto levanta la cabeza
function aplastado(k, t, { mira = .9, sacude = 1, viento = 1.2 } = {}) { const s = k.body.scale.y, ph = k.idx * 1.3; k._t = t;
  k.body.rotation.set(Math.PI / 2, 0, sacude * .025 * Math.sin(t * 27 + ph)); k.body.position.set(sacude * .01 * Math.sin(t * 31 + ph), .27 * s, 0);
  k.armL.rotation.set(-Math.PI + .12 + sacude * .04 * Math.sin(t * 23 + ph), 0, -.28); k.armR.rotation.set(-Math.PI + .12 + sacude * .04 * Math.sin(t * 21 + ph + 1), 0, .28);
  k.legL.rotation.set(sacude * (.18 + .12 * Math.sin(t * 13 + ph)), 0, -.12); k.legR.rotation.set(sacude * (.18 + .12 * Math.sin(t * 13 + ph + 2.2)), 0, .12);
  k.head.rotation.set(-mira, 0, sacude * .03 * Math.sin(t * 19 + ph)); vientoPelo(k, viento, { t }); parpadeo(k, t) }
// sentadoDesata(k, t, { lado, lean }): sentado en el piso con las piernas adelante, inclinado, desatando la correa de la bota de `lado` ("izq"|"der").
// k.g queda en la cola (el cuerpo apoyado); las piernas van hacia +z local
function sentadoDesata(k, t, { lado = "der", lean = .72, tirando = 0, viento = 1 } = {}) { const s = k.body.scale.y, i = lado === "izq" ? 0 : 1, leg = i ? k.legR : k.legL, sg = i ? 1 : -1; k._t = t;
  const rx = lean - tirando * .3; k.body.rotation.set(rx, sg * .14, -sg * .05); _v1.set(0, H_CAD, 0).multiplyScalar(s).applyEuler(k.body.rotation); k.body.position.set(-_v1.x, .27 * s - _v1.y, -_v1.z);
  k.legL.rotation.set(-Math.PI / 2 - rx + .04, 0, -.07); k.legR.rotation.set(-Math.PI / 2 - rx + .04, 0, .07); leg.rotation.x -= .1;
  k.head.rotation.set(.38, sg * .1, 0); k.g.updateMatrixWorld(true);
  const j = .03 * Math.sin(t * 15) * (1 - tirando), bota = k.botaG[i]; for (const [arm, dx] of [[k.armL, -.09], [k.armR, .09]]) apuntar(k, arm, bota.localToWorld(_v2.set(dx / bota.scale.x, .3 + j * 3, .25 + j)));
  vientoPelo(k, viento, { t }); parpadeo(k, t) }
// sacaBota(k, t, lado, q): sentado, con q 0→1 tira de la bota y la saca (la bota se desliza por la pierna); con q ≥ 1 la bota queda en sus manos
// (la de la pierna se esconde y se ve la media). Devuelve la bota suelta cuando q ≥ 1 (si no, null).
function sacaBota(k, t, lado = "der", q = 0, o = {}) { const i = lado === "izq" ? 0 : 1; q = cl(q); sentadoDesata(k, t, { ...o, lado, tirando: Math.min(1, q * 1.4) });
  if (q < 1) { const b = k.botaG[i]; b.position.y = -1.02 - _suave(q) * .55; b.position.z = .02 * Math.sin(t * 13) * (1 - q); k.g.updateMatrixWorld(true); for (const [arm, dx] of [[k.armL, -.09], [k.armR, .09]]) apuntar(k, arm, b.localToWorld(_v2.set(dx, .3, .2))); return null }
  botas(k, i ? { der: 0 } : { izq: 0 }); k.armL.rotation.set(-1.15, 0, .38); k.armR.rotation.set(-1.15, 0, -.38); const b = botaSuelta(k, lado); attach(b, k, "R", [-.3, -.05, .08]); b.rotation.set(-.4, 0, 1.3); return b }
// volar(k, t, { alto, dir, frente, rollo, giro, flameo }): llevado por el viento: cuerpo casi horizontal, girando un poco, brazos y piernas sacudidos.
// k.g.position = el pecho (si alto = 0). dir = hacia dónde apunta la CABEZA en el mundo (por defecto contra el viento y un poco arriba: va de espaldas,
// con los pies hacia +x); frente = hacia dónde mira el pecho (por defecto +z, hacia la cámara de frente); rollo gira el cuerpo sobre su eje
function volar(k, t, { alto = 0, dir = [-1, .3, 0], frente = [0, 0, 1], rollo = 0, giro = 1, flameo = 1, viento = 1.3 } = {}) { const ph = (k.idx || 0) * 1.7; k._t = t;
  const d = _v1.set(...dir).normalize(), fr = _v2.set(...frente).applyAxisAngle(d, rollo + giro * (.3 * Math.sin(t * 1.3 + ph) + .08 * Math.sin(t * 3.7))); d.x += giro * .08 * Math.sin(t * 1.9 + ph); d.y += giro * .06 * Math.sin(t * 2.3);
  cuerpoQ(k, qMundo(k, d.toArray(), fr.toArray(), _q3), [0, 1.45, 0], [0, alto, 0]);
  k.armL.rotation.set(-.5 + .55 * flameo * Math.sin(t * 8.3 + ph), 0, -(1.65 + .5 * flameo * Math.sin(t * 12.1 + ph))); k.armR.rotation.set(-.5 + .55 * flameo * Math.sin(t * 7.7 + ph + 1.5), 0, 1.65 + .5 * flameo * Math.sin(t * 11.3 + ph + .7));
  k.legL.rotation.set(.35 * flameo * Math.sin(t * 9.7 + ph), 0, -.14 - .1 * flameo * Math.sin(t * 13 + ph)); k.legR.rotation.set(-.35 * flameo * Math.sin(t * 9.7 + ph) + .1, 0, .14 + .1 * flameo * Math.sin(t * 14 + ph));
  k.head.rotation.set(-.15 + .06 * Math.sin(t * 17 + ph), 0, .05 * Math.sin(t * 13)); vientoPelo(k, viento, { t }); parpadeo(k, t) }
// volarHacia(k, t, { alto, dir, frente, objetivo }): vuela DE CABEZA hacia dir con los dos brazos estirados adelante (para ir a agarrar algo);
// objetivo (Vector3 del mundo, opcional): los brazos apuntan ahí. El pelo va hacia atrás (contra el avance)
function volarHacia(k, t, { alto = 0, dir = [1, .15, 0], frente = [0, 0, 1], rollo = 0, objetivo = null, giro = .5 } = {}) { const ph = (k.idx || 0) * 1.7; k._t = t;
  const d = _v1.set(...dir).normalize(), fr = _v2.set(...frente).applyAxisAngle(d, rollo + giro * .15 * Math.sin(t * 1.6 + ph)); const D = d.toArray();
  cuerpoQ(k, qMundo(k, D, fr.toArray(), _q3), [0, 1.45, 0], [0, alto, 0]);
  const j = .05 * Math.sin(t * 15 + ph); k.armL.rotation.set(-Math.PI + .1 + j, 0, -.13); k.armR.rotation.set(-Math.PI + .1 - j, 0, .13);
  k.legL.rotation.set(.12 * Math.sin(t * 10 + ph), 0, -.04); k.legR.rotation.set(-.12 * Math.sin(t * 10 + ph), 0, .04); k.head.rotation.set(-.55, 0, 0);
  if (objetivo) { k.g.updateMatrixWorld(true); const ob = objetivo.isVector3 ? objetivo : _v3.set(...objetivo); for (const [arm, dx] of [[k.armL, -.15], [k.armR, .15]]) { _v2.set(dx, 0, 0).applyQuaternion(k.body.getWorldQuaternion(_q1)).add(ob); apuntar(k, arm, _v2) } }
  vientoPelo(k, 1.3, { t, dir: [-D[0], -D[1], -D[2]] }); parpadeo(k, t) }
// despega(k, t, q, { alto, … }): q 0 → parado aguantando el viento; q 1 → volando (como volar con alto = 1.6): los pies dejan el piso primero
function despega(k, t, q, o = {}) { const u = _suave(q); mezclaPoses(k, () => quietoViento(k, t, o), () => volar(k, t, { alto: 1.6, ...o, flameo: u }), u); vientoPelo(k, 1 + .3 * u, { t }) }
// colgado(k, t, { fuerza, frente }): colgado de algo con los dos brazos arriba; el viento lo deja casi horizontal con las piernas flameando hacia +x.
// k.g.position = el punto donde se agarra (las manos). frente = hacia dónde mira el pecho (mundo)
function colgado(k, t, { fuerza = 1, frente = [0, 0, 1], viento = 1.4 } = {}) { const ph = (k.idx || 0) * 1.3, th = fuerza * (1.22 + .13 * Math.sin(t * 7.3 + ph) + .06 * Math.sin(t * 17 + ph)); k._t = t;
  cuerpoQ(k, qMundo(k, [-Math.sin(th), Math.cos(th), 0], frente, _q3), [0, 2.76, 0], [0, 0, 0]); k.g.updateMatrixWorld(true);
  const g0 = k.g.getWorldPosition(new THREE.Vector3()); k.body.getWorldQuaternion(_q1); for (const [arm, dx] of [[k.armL, -.26], [k.armR, .26]]) apuntar(k, arm, _v2.set(dx, 0, 0).applyQuaternion(_q1).add(g0));
  k.legL.rotation.set(.3 * Math.sin(t * 12 + ph), 0, -.1 - .08 * Math.sin(t * 15)); k.legR.rotation.set(.3 * Math.sin(t * 12 + ph + 2.5), 0, .1 + .08 * Math.sin(t * 16)); k.head.rotation.set(-.1, 0, .06 * Math.sin(t * 9));
  vientoPelo(k, viento, { t }); parpadeo(k, t) }
// abrazoVuelo(a, b, t, { pos, ry, dir, giro }): los dos hermanos ABRAZADOS volando juntos (pecho con pecho; b, Pip, un poco más arriba).
// pos = punto medio en coords del padre de k.g (si falta, usa a.g.position); dir = hacia dónde apuntan las cabezas (mundo); ry gira la pareja sobre su eje
function abrazoVuelo(a, b, t, { pos = null, ry = 0, dir = [1, .2, 0], giro = 1, viento = 1.3 } = {}) { a._t = b._t = t; const P = pos ? new THREE.Vector3(...pos) : a.g.position.clone();
  const up = new THREE.Vector3(...dir).normalize(), fr = new THREE.Vector3(0, 0, 1).applyAxisAngle(up, ry + giro * .35 * Math.sin(t * .9)); fr.addScaledVector(up, -fr.dot(up)).normalize();
  _mb.makeBasis(new THREE.Vector3().crossVectors(up, fr), up, fr); const Fw = new THREE.Quaternion().setFromRotationMatrix(_mb); a.g.parent.getWorldQuaternion(_q2); const F = _q2.clone().invert().multiply(Fw);
  [[a, 0, 0], [b, Math.PI, .1]].forEach(([k, yaw, dy]) => { const s = k.body.scale.y; k.g.visible = true; k.g.position.copy(P); k.g.quaternion.copy(F).multiply(_q1.setFromAxisAngle(_v1.set(0, 1, 0), yaw)); cuerpoQ(k, _q2.identity(), [0, 1.48, 0], [0, dy, -(.26 * s + .015)]) });
  a.armL.rotation.set(-1.32, 0, .5); a.armR.rotation.set(-1.32, 0, -.5); b.armL.rotation.set(-2.15, 0, .55); b.armR.rotation.set(-2.15, 0, -.55);
  [a, b].forEach((k, i) => { const ph = i * 2; k.legL.rotation.set(.3 * Math.sin(t * 9 + ph), 0, -.1); k.legR.rotation.set(-.3 * Math.sin(t * 9 + ph), 0, .1); k.head.rotation.set(-.1, i ? .35 : -.35, 0); vientoPelo(k, viento, { t, dir: [-up.x, -up.y, -up.z] }); parpadeo(k, t) }) }
// acostadoEspaldas(k, t, { sentar, brazos }): de espaldas en el pasto, brazos abiertos, mirando al cielo; sentar 0→1 se sienta (apoyado en las manos).
// k.g en los talones; la cabeza queda hacia −z local
function acostadoEspaldas(k, t, { sentar = 0, brazos = 1, viento = 0 } = {}) { const s = k.body.scale.y, u = _suave(sentar), rx = lerp(-Math.PI / 2, -.12, u); k._t = t;
  k.body.rotation.set(rx, 0, 0); _v1.set(0, H_CAD, 0).multiplyScalar(s).applyEuler(k.body.rotation); k.body.position.set(-_v1.x, .29 * s - _v1.y, -H_CAD * s - _v1.z);
  k.legL.rotation.set(-Math.PI / 2 - rx, 0, -.1); k.legR.rotation.set(-Math.PI / 2 - rx, 0, .1);
  k.armL.rotation.set(lerp(0, .55, u), 0, -lerp(1.35 * brazos, .3, u)); k.armR.rotation.set(lerp(0, .55, u), 0, lerp(1.35 * brazos, .3, u)); k.head.rotation.set(lerp(0, .05, u), 0, 0);
  vientoPelo(k, viento, { t }); parpadeo(k, t) }
// sostieneCometa(k, t, { cometa, tiron }): con el hilo de una cometa en las dos manos, tironeado (se inclina hacia atrás; cada tanto un tirón).
// cometa = [x, y, z] del mundo donde está (la pone y dibuja el hilo); si falta, solo brazos arriba-adelante
function sostieneCometa(k, t, { cometa = null, tiron = 1, viento = 1 } = {}) { const ph = (k.idx || 0) * 1.3, tir = tiron * Math.pow(Math.max(0, Math.sin(t * 2.6 + ph)), 6); k._t = t;
  quietoViento(k, t, { lean: .12 - .1 * tir, bambolea: 0, viento }); k.body.rotation.x -= .12 * tiron - .22 * tir; k.legL.rotation.x = .18; k.legR.rotation.x = -.12;
  if (!cometa) { k.armL.rotation.set(-2.3 - tir * .3, 0, .2); k.armR.rotation.set(-2.3 - tir * .3, 0, -.2) }
  else { const C = cometaPip(t, cometa, { mira: k.g.getWorldPosition(_v3).toArray() }); k.g.updateMatrixWorld(true); const P0 = k.head.getWorldPosition(new THREE.Vector3()); const dirK = C.clone().sub(P0).normalize();
    for (const [arm, dx] of [[k.armL, -.05], [k.armR, .05]]) apuntar(k, arm, _v2.copy(P0).addScaledVector(dirK, 2).add(_v1.set(dx, -.3 + tir * .4, 0)));
    k.g.updateMatrixWorld(true); const m = k.handL.getWorldPosition(new THREE.Vector3()).add(k.handR.getWorldPosition(_v1)).multiplyScalar(.5); m.addScaledVector(dirK, .15);
    const mid = m.clone().lerp(C, .5); mid.y -= .25 * m.distanceTo(C) * .12 * (1 - tir); HILO_C.poner(m, mid, C) }
  bambolea(k, t, k.liviana * .5); parpadeo(k, t) }
// agarraBrazo(a, b, t, { mano, de, tira }): a (Tobb) agarra del brazo a b (el narrador): la mano de a va al brazo `de` de b y lo tironea hacia sí
function agarraBrazo(a, b, t, { mano = "R", de = "L", tira = .3 } = {}) { const am = mano === "R" ? a.armR : a.armL, bm = de === "R" ? b.armR : b.armL; a.g.updateMatrixWorld(true); b.g.updateMatrixWorld(true);
  const hombroA = am.getWorldPosition(new THREE.Vector3()), manoB = bm.localToWorld(new THREE.Vector3(0, -.86, 0)); apuntar(b, bm, manoB.lerp(hombroA, tira));
  b.g.updateMatrixWorld(true); apuntar(a, am, bm.localToWorld(new THREE.Vector3(0, -.5, 0))) }
// gestos LINEALES (dur = 0,4 s), se quedan en la pose; `fin`: tiempo en que vuelve. tipos: senala, cubre, brazos, alza, abraza, sopla, tira, grita, escucha, agita
const GESTOS = {
  senala: { R: [-1.5, 0], lean: 0 }, alza: { R: [-3.0, .1] }, escucha: { R: [0, 2.95], hz: -.14, hy: -.18 }, para: { R: [-1.6, -.2], hx: -.06 },
  cubre: { L: [-2.2, .62], R: [-2.2, -.62], hx: .16, lean: .1 }, brazos: { L: [0, -.94], R: [0, .94], hx: -.06, lean: -.07 }, abraza: { L: [-1.2, .42], R: [-1.2, -.42] },
  sopla: { L: [-2.05, .45], R: [-2.05, -.45], lean: .32, hx: -.22 }, tira: { L: [-1.25, .14], R: [-1.25, -.14], lean: -.3, hx: .12 }, grita: { L: [-2.0, -.14], R: [-2.0, .14], lean: .26, hx: -.2 },
  agita: { R: [-1.6, .1] }, manosCabeza: { L: [-2.7, .9], R: [-2.7, -.9], hx: .1 } };
function gesto(k, t, t0, tipo, { dur = .4, fin = null, mano = "R", alto = 0 } = {}) { const G = GESTOS[tipo]; if (!G) return 0; let u = P(t, t0, t0 + dur); if (fin != null) u *= 1 - P(t, fin, fin + dur); if (u <= 0) return 0;
  const esp = mano === "L" && !G.L, ap = (a, [x, z], sg) => { a.rotation.x = lerp(a.rotation.x, x, u); a.rotation.z = lerp(a.rotation.z, z * sg, u) };
  if (G.L) ap(k.armL, G.L, 1); if (G.R) { const [x, z] = G.R, xx = tipo === "senala" ? x - alto : x; esp ? ap(k.armL, [xx, z], -1) : ap(k.armR, [xx, z], 1) }
  if (G.lean) cadera(k, lerp(k.body.rotation.x, k.body.rotation.x + G.lean, u));
  if (G.hx) k.head.rotation.x += G.hx * u; if (G.hz) k.head.rotation.z += G.hz * u * (esp ? -1 : 1); if (G.hy) k.head.rotation.y += G.hy * u * (esp ? -1 : 1);
  if (u >= 1 && tipo === "agita") { const q = ((t - t0 - dur) / (16 * F30)) % 1, tri = q < .5 ? q * 4 - 1 : 3 - q * 4, a = esp ? k.armL : k.armR; a.rotation.x = -1.6 + tri * .38 }
  return u }
// caída: el cuerpo tieso vuelca en 16 cuadros (dir = 1 de cara, −1 de espaldas) y queda acostado
function caer(k, t, t0, { dir = -1, dur = 16 * F30 } = {}) { const u = P(t, t0, t0 + dur); if (u <= 0) return 0; const a = u * u * Math.PI / 2, s = k.body.scale.y; k.body.rotation.x = dir * a; k.body.position.y = Math.sin(a) * .3 * s; k.body.position.z = -dir * Math.sin(a) * .3 * s; k.head.rotation.set(0, 0, 0); return u }
// salto: se agacha 8 cuadros, salta tieso y cae (14 cuadros en el aire); devuelve la altura
function saltar(k, t, t0, { alto = .9, aire = 14 * F30 } = {}) { const ta = 8 * F30, s = k.body.scale.y; if (t <= t0 || t >= t0 + ta + aire) return 0;
  if (t < t0 + ta) { const c = (t - t0) / ta; cadera(k, .5 * c, -.42 * c); k.armL.rotation.x = .5 * c; k.armR.rotation.x = .5 * c; k.head.rotation.x -= .3 * c; return 0 }
  const v = (t - t0 - ta) / aire, y = alto * 4 * v * (1 - v) * s; k.body.position.y += y; k.armL.rotation.z = -A_BRAZO - .25; k.armR.rotation.z = A_BRAZO + .25; return y }

//@@LUGAR
const LUGAR = L => "pueblo";
const PISO = (x, z) => x > 95 ? SUELO_LEJOS(x, z) : SUELO(x, z);
const ponerP = (k, x, z, ry = 0) => { k.g.visible = true; k.g.position.set(x, PISO(x, z), z); k.g.rotation.set(0, ry, 0) };
const enAire = (k, p, ry = 0) => { k.g.visible = true; k.g.position.set(p[0], p[1], p[2]); k.g.rotation.set(0, ry, 0) };

// dónde está la gente en la plaza durante la tormenta (lado sur de la torre)
const YO_T = [2.6, -3.4], TOBB_T = [1.1, -3.2];
// camino de Pip de la loma a la veleta y del narrador de la plaza a la veleta
const curva = (a, b, h, u) => { const e = eIO(cl(u)); return [lerp(a[0], b[0], e), lerp(a[1], b[1], e) + h * Math.sin(Math.PI * e), lerp(a[2], b[2], e)] };

//@@SHOTS
const G = (x, dy, z) => () => [x, SUELO(x, z) + dy, z];
const KW = (k, o) => () => add(k.g.getWorldPosition(new THREE.Vector3()).toArray(), o);
const VW = (o = [0, 0, 0]) => () => add(VELETA_W(), o);
const TW_ = (o = [0, 0, 0]) => () => add(TECHO_W(), o);
const TOR = (dx, y, dz) => [TORRE[0] + dx, y, TORRE[1] + dz];
const VP = (u, o = [0, 0, 0]) => () => add(vueloP(u), o);
const C_SEPIA = "#b08a5a", C_POLVO = "#9a9080", C_NUBE = "#e8eef4";
const VZ = VECINOS, HD = (k, o) => () => { const h = headW(k); return [h.x + o[0], h.y + o[1], h.z + o[2]] };
const SHOTS = {
  // arranque como Volze: primero el suceso (el narrador se suelta del piso), después la regla
  [I.open]: [sh(0, () => [YO_T[0] + 3.2, SUELO(...YO_T) + .5, YO_T[1] + 2.6], () => [YO_T[0] + 2.9, SUELO(...YO_T) + .7, YO_T[1] + 3.0], KW(ME, [0, 1.1, 0]), null, 64),
    sh(3, () => [YO_T[0] + 5.2, SUELO(...YO_T) + .6, YO_T[1] + 3.6], () => [YO_T[0] + 5.6, SUELO(...YO_T) + 1.0, YO_T[1] + 4.4], KW(ME, [0, 1.3, 0]), KW(ME, [0, 1.6, 0]), 60, { tr: "barrido" })],
  [I.rule]: [sh(0, G(-14, 1.1, 7.5), G(-11, 1.3, 7.8), G(-4, 1.5, 4), G(-3, 1.6, 4), 62), sh(4, KW(VZ[0], [-5.6, 1.4, 3]), KW(VZ[0], [-5, 1.3, 3.2]), KW(VZ[0], [0, 1.1, 0]), null, 50, { tr: "barrido" })],
  [I.cost]: [sh(0, KW(VZ[5], [-10, -2, 12]), KW(VZ[5], [-12, -3, 13]), KW(VZ[5], [0, 0, 0]), null, 46), sh(5, KW(VZ[5], [-14, -3, 16]), KW(VZ[5], [-16, -3, 18]), KW(VZ[5], [8, 0, 0]), null, 50, { lat: 2 })],
  [I.today]: [sh(0, KW(ME, [4.2, 1.8, 2.4]), KW(ME, [3.4, 1.6, 2]), KW(ME, [0, 1.2, 0]), null, 54, { tr: "barrido" })],
  [I.never]: [sh(0, [-60, 34, 50], [-40, 30, 46], [0, 4, -4], [6, 4, -6], 52, { tr: "barrido" }), sh(5, G(-20, .5, 30), G(-16, .55, 30.5), G(-6, 1.2, 26), G(-4, 1.4, 26), 64)],
  [I.sideways]: [sh(0, () => { const a = arbolCerca(-30, 30); return [a[0] - 12, SUELO(a[0], a[1]) + 3.4, a[1] + 11] }, () => { const a = arbolCerca(-30, 30); return [a[0] - 9, SUELO(a[0], a[1]) + 3.6, a[1] + 12] }, () => { const a = arbolCerca(-30, 30); return [a[0] + 2, SUELO(a[0], a[1]) + 2.4, a[1]] }, null, 52), sh(4, () => add(humoCerca(6, 4), [-5, 1.6, 7]), () => add(humoCerca(6, 4), [-3.6, 2, 7]), () => add(humoCerca(6, 4), [3, 1.2, 0]), null, 50)],
  [I.laundry]: [sh(0, () => { const p = tendCerca(-14, 14); return [p[0] - 1.6, SUELO(p[0], p[1]) + 1.4, p[1] + 4.5] }, () => { const p = tendCerca(-14, 14); return [p[0] - .6, SUELO(p[0], p[1]) + 1.5, p[1] + 4.1] }, () => { const p = tendCerca(-14, 14); return [p[0] + .4, SUELO(p[0], p[1]) + 1.9, p[1]] }, null, 54)],
  [I.chains]: [sh(0, [1, 4.6, 26], [2.4, 4.8, 25.4], [10, 2.8, 14], null, 50, { tr: "barrido" }), sh(7, () => estacaW(MI_CASA, 0, [-2.4, 1.2, 2.2]), () => estacaW(MI_CASA, 0, [-1.6, 1, 2]), () => estacaW(MI_CASA, 0, [0, 1.2, 0]), null, 54)],
  [I.iron]: [sh(0, KW(ME, [-3.2, 1, 3.6]), KW(ME, [-2.6, .9, 3.4]), KW(ME, [0, .8, 0]), null, 50), sh(4, G(-2, 1.4, 11.5), G(-1, 1.3, 11.6), KW(VZ[2], [0, .9, 0]), null, 56, { tr: "barrido" })],
  [I.babies]: [sh(0, () => [PUNTOS.bebe[0] - 3.6, SUELO(...PUNTOS.bebe) + 1.8, PUNTOS.bebe[1] + 4], () => [PUNTOS.bebe[0] - 3, SUELO(...PUNTOS.bebe) + 1.7, PUNTOS.bebe[1] + 3.4], KW(MAMA, [0, 1.3, 0]), null, 50)],
  [I.wed]: [sh(0, () => [PUNTOS.boda[0] - .6, SUELO(...PUNTOS.boda) + 2.3, PUNTOS.boda[1] + 6.8], () => [PUNTOS.boda[0] + .6, SUELO(...PUNTOS.boda) + 2.1, PUNTOS.boda[1] + 5.6], () => [PUNTOS.boda[0], SUELO(...PUNTOS.boda) + 1.6, PUNTOS.boda[1] - .6], null, 50), sh(9, () => [PUNTOS.boda[0] + 7, SUELO(...PUNTOS.boda) + 4.4, PUNTOS.boda[1] + 9], () => [PUNTOS.boda[0] + 5, SUELO(...PUNTOS.boda) + 4, PUNTOS.boda[1] + 10], () => [PUNTOS.boda[0], SUELO(...PUNTOS.boda) + 1.4, PUNTOS.boda[1] - .6], null, 52)],
  [I.lean]: [sh(0, KW(VZ[1], [1.4, 2.4, 10]), KW(VZ[1], [-.4, 2.4, 10]), KW(VZ[1], [0, 1.4, 0]), null, 50, { fijo: 1 }), sh(5, KW(VZ[1], [-2, 5, 7]), KW(VZ[1], [-1.4, 4.6, 6.6]), KW(VZ[1], [0, 1.6, 0]), null, 50)],
  [I.soup]: [sh(0, () => [PUNTOS.sopa[0] - 4.6, SUELO(...PUNTOS.sopa) + 2.4, PUNTOS.sopa[1] + 1.2], () => [PUNTOS.sopa[0] - 3.8, SUELO(...PUNTOS.sopa) + 2.2, PUNTOS.sopa[1] + .6], KW(MARTA, [0, 1.9, 0]), null, 50), sh(4, () => [PUNTOS.sopa[0] - 3.4, SUELO(...PUNTOS.sopa) + 1.6, PUNTOS.sopa[1] + 1.8], () => [PUNTOS.sopa[0] - 3, SUELO(...PUNTOS.sopa) + 1.5, PUNTOS.sopa[1] + 1.4], KW(MARTA, [0, 1.6, 0]), null, 48)],
  [I.sign]: [sh(0, G(-3, 1.6, 14), G(-1, 2.2, 11), TOR(0, 10, 0), TOR(0, 12, 0), 46), sh(7, TOR(-3, 7, 15), TOR(-1.6, 7.4, 14), TOR(0, 8, 0), null, 42)],
  [I.pip]: [sh(0, KW(PIP, [-2.6, 1.6, 3.4]), KW(PIP, [-1.6, 1.5, 2.8]), KW(PIP, [0, 1.3, 0]), null, 52), sh(6, KW(PIP, [3.4, 2.2, 5.2]), KW(PIP, [2.4, 2.2, 4.8]), KW(PIP, [0, 1, 0]), null, 54)],
  [I.rocks]: [sh(0, KW(PIP, [-2.4, 1.3, 3.8]), KW(PIP, [-2, 1.25, 3.4]), KW(PIP, [0, .9, 0]), null, 50), sh(7, KW(PIP, [2.6, 1.6, 3.6]), KW(PIP, [1.8, 1.6, 3.4]), KW(PIP, [0, 1, 0]), null, 54, { tr: "barrido" })],
  [I.kites]: [sh(0, () => [COLINA[0] - 6, SUELO(...COLINA) + 2.4, COLINA[1] + 6], () => [COLINA[0] - 4.4, SUELO(...COLINA) + 2.2, COLINA[1] + 5], () => [COLINA[0] + 1.6, SUELO(...COLINA) + 2.6, COLINA[1]], null, 54), sh(4, () => add(cometaV(t_), [-4, -1.5, 5]), null, () => cometaV(t_), null, 52, { tr: "sigue" })],
  [I.where]: [sh(0, () => [COLINA[0] + 2.4, SUELO(...COLINA) + 1.8, COLINA[1] + 2.6], () => [COLINA[0] + 2, SUELO(...COLINA) + 1.9, COLINA[1] + 2.2], KW(PIP, [0, 1.4, 0]), null, 50), sh(6, () => [COLINA[0] - 3.2, SUELO(...COLINA) + 2.4, COLINA[1] + 1.2], () => [COLINA[0] - 3.8, SUELO(...COLINA) + 2.8, COLINA[1] + 1.4], [SIERRA_X, 50, 10], null, 48, { lat: .6 })],
  [I.tobb]: [sh(0, G(-21, 2.6, -11), G(-22, 2.4, -12), KW(TOBB_CHICO, [0, .8, 0]), null, 48, { tr: "tapa", col: C_SEPIA }), sh(7, KW(TOBB_CHICO, [2.2, 1.4, 5.2]), KW(TOBB_CHICO, [1.8, 1.3, 4.8]), KW(TOBB_CHICO, [0, .6, .6]), null, 46)],
  [I.second]: [sh(0, KW(TOBB_CHICO, [3.2, 1, 1.4]), KW(TOBB_CHICO, [2.8, .9, 1.6]), KW(TOBB_CHICO, [0, .4, .8]), null, 46)],
  [I.leaf]: [sh(0, G(-21, 2.6, -11), G(-22, 3.6, -12), KW(TOBB_CHICO, [0, 0, 0]), null, 52, { tr: "barrido" })],
  [I.sock]: [sh(0, G(-8, 1.6, 10), G(-7, 1.7, 10.4), KW(TOBB_CHICO, [0, 0, 0]), null, 50), sh(7, KW(TOBB_CHICO, [2.6, 1, 3]), KW(TOBB_CHICO, [2, .8, 2.6]), KW(TOBB_CHICO, [0, 0, 0]), null, 46)],
  [I.walked]: [sh(0, () => add(tobbVuelta(), [-5, 2.4, 8]), () => add(tobbVuelta(), [-4.2, 2.2, 7.4]), () => add(tobbVuelta(), [0, 1.3, 0]), null, 46, { tr: "barrido" })],
  [I.green]: [sh(0, G(-4, 2.2, 8), G(-3, 2.1, 7), KW(TOBB_CHICO, [0, 1.6, 0]), null, 54), sh(7, G(4.4, 2.4, 9), G(3.6, 2.3, 8.4), G(1.2, 1.5, 3), null, 54)],
  [I.old]: [sh(0, KW(TOBB, [-3.2, 2.2, 4.6]), KW(TOBB, [-2.6, 2.1, 4]), KW(TOBB, [0, 1.6, 0]), null, 46, { tr: "barrido" }), sh(5, KW(TOBB, [3.4, 1.4, 4.2]), KW(TOBB, [3, 1.3, 3.8]), KW(TOBB, [0, 1.2, 0]), null, 50)],
  [I.doubled]: [sh(0, [-40, 26, 40], [-30, 22, 34], [0, 4, -4], null, 52, { tr: "barrido" }), sh(3, G(-12, 1.5, 10), G(-10.6, 1.4, 9.4), G(-3, 1.4, 4.4), null, 56, { shake: .1 })],
  [I.snapped]: [sh(0, () => { const c = CASAS_ROTAS[0]; return [c[0] - 7, SUELO(c[0], c[1]) + 3.4, c[1] + 7] }, null, () => { const c = CASAS_ROTAS[0]; return [c[0] + 1.5, SUELO(c[0], c[1]) + 3, c[1]] }, null, 54, { shake: .15 }), sh(2, () => [PANAD[0] - 12, SUELO(...PANAD) + 4, PANAD[1] + 10], () => [PANAD[0] - 8, SUELO(...PANAD) + 6, PANAD[1] + 11], TW_(), null, 54)],
  [I.hill]: [sh(0, () => [COLINA[0] + 7, SUELO(...COLINA) + 3.2, COLINA[1] + 8], () => [COLINA[0] + 5, SUELO(...COLINA) + 2.8, COLINA[1] + 6.6], KW(PIP, [0, 1.8, 0]), null, 52, { tr: "barrido" }), sh(8, KW(PIP, [3.4, 1.8, 4.4]), KW(PIP, [2.8, 1.8, 4]), KW(PIP, [1.2, 2, -.4]), null, 54)],
  [I.pulled]: [sh(0, KW(PIP, [-3, 2.6, 3.4]), KW(PIP, [-2.4, 2.8, 3]), () => cometaV(t_), null, 54), sh(3, KW(PIP, [2, 1, 2.4]), KW(PIP, [1.7, .95, 2.1]), KW(PIP, [0, .7, 0]), null, 52, { tr: "barrido" })],
  [I.boots2]: [sh(0, KW(PIP, [2.6, 1, 3]), KW(PIP, [2.2, 1, 2.6]), KW(PIP, [0, .6, 0]), null, 54)],
  [I.up]: [sh(0, () => [COLINA[0] + 6, SUELO(...COLINA) + 2, COLINA[1] + 9], () => [COLINA[0] + 9, SUELO(...COLINA) + 3, COLINA[1] + 8], KW(PIP, [0, 0, 0]), null, 56)],
  [I.vane]: [sh(0, VW([-6, -1.4, 6]), VW([-4.4, -.6, 5]), VW([.6, -.6, 0]), null, 50), sh(8, TOR(-14, 4, 16), TOR(-11, 5, 14), VW([0, -2, 0]), null, 50)],
  [I.climb]: [sh(0, G(-3, .8, 5.5), G(-2.4, .75, 5.2), G(1, .4, 1), null, 56, { shake: .1 }), sh(4, G(8, 5, 6), G(6, 4, 5), G(1, .4, -1), null, 56)],
  [I.bend]: [sh(0, VW([-4.4, 1.2, 4]), VW([-3.4, 1, 3.4]), VW([.6, -.8, 0]), null, 50, { shake: .08 })],
  [I.oneway]: [sh(0, KW(ME, [-5.4, 1.4, -.4]), KW(ME, [-5, 1.3, 0]), KW(ME, [0, 1.6, 0]), null, 46)],
  [I.laces]: [sh(0, KW(ME, [1.8, 1.8, 7.2]), KW(ME, [1.6, 1.7, 6.6]), KW(ME, [0, 1, .4]), null, 46), sh(3, KW(ME, [-3.6, 1.2, 4.4]), KW(ME, [-3.2, 1.1, 4]), KW(ME, [0, .9, .4]), null, 46)],
  [I.dont]: [sh(0, () => add(mitad(TOBB, ME), [-.5, 2.6, 7]), () => add(mitad(TOBB, ME), [0, 2.5, 6.4]), () => add(mitad(TOBB, ME), [0, 1.2, 0]), null, 44), sh(5, KW(ME, [.2, 2.4, 4.6]), KW(ME, [.6, 2.4, 4.2]), KW(TOBB, [0, 2, 0]), null, 42)],
  [I.left]: [sh(0, KW(ME, [1.4, 1.6, 6]), KW(ME, [1.2, 1.5, 5.5]), KW(ME, [0, .9, .5]), null, 46), sh(6, KW(ME, [-3.6, 1.2, 4.4]), KW(ME, [-3.2, 1.1, 4]), KW(ME, [0, .8, .5]), null, 46, { tr: "barrido" })],
  [I.letgo]: [sh(0, () => [YO_T[0] - 4, SUELO(...YO_T) + 1, YO_T[1] + 4.5], () => [YO_T[0] - 4.4, SUELO(...YO_T) + 1.6, YO_T[1] + 4.9], KW(ME, [0, .8, 0]), null, 56)],
  [I.flew]: [sh(0, KW(ME, [1.5, 1.6, 4.5]), KW(ME, [1.2, 1.4, 4]), KW(ME, [0, 0, 0]), null, 54, { tr: "sigue" }), sh(2, KW(ME, [-3, 2.4, 9]), KW(ME, [-1, 2.6, 9]), TW_(), null, 54)],
  [I.grab]: [sh(0, VW([-7, 1, 7]), VW([-5.4, 1.2, 6]), VW([-1, -.4, 0]), null, 52, { shake: .12 }), sh(8, VW([-4.4, 2.2, 6]), VW([-3.8, 2, 5.4]), VW([.4, -.8, 0]), null, 50)],
  [I.broke]: [sh(0, KW(ME, [5, .5, 5]), KW(ME, [4.4, .3, 4.6]), KW(ME, [0, 0, 0]), null, 48, { shake: .15 })],
  [I.over]: [sh(0, KW(ME, [-6, 3, 7]), KW(ME, [-7, 3.4, 8]), KW(ME, [0, 0, 0]), null, 50, { tr: "barrido" })],
  [I.tight]: [sh(0, KW(ME, [3.4, 1.4, 4.4]), KW(ME, [3, 1.3, 4]), KW(ME, [0, .4, 0]), null, 50)],
  [I.clouds]: [sh(0, KW(ME, [-3, 3, 5]), KW(ME, [-2.6, 2.8, 4.6]), KW(ME, [4, -12, 0]), null, 56), sh(3, KW(ME, [-6, 3, 8]), KW(ME, [-5, 2.6, 7]), KW(ME, [0, 0, 0]), null, 52)],
  [I.then]: [sh(0, KW(ME, [-3.2, 2, 3.2]), KW(ME, [-2.8, 1.8, 3]), KW(ME, [10, -10, 0]), null, 56, { tr: "barrido" })],
  [I.calm]: [sh(0, () => add(vueloP(.78), [-30, 24, 30]), () => add(vueloP(.82), [-24, 20, 26]), () => [VALLE[0], VALLE_Y, VALLE[1]], null, 52)],
  [I.straight]: [sh(0, () => valleCam(0), () => valleCam(.3), () => valleMira(0), null, 50), sh(4, () => valleCam(1), () => valleCam(1.3), () => valleMira(1), null, 50)],
  [I.fields]: [sh(0, () => add(vueloP(.9), [-6, 3, 8]), () => add(vueloP(.93), [-5, 2.6, 7]), () => add(ATERRIZA, [6, 0, -4]), null, 52), sh(2, () => add(ATERRIZA, [-14, 4, 12]), () => add(ATERRIZA, [-10, 3, 12]), () => add(ATERRIZA, [0, 0, 0]), null, 54)],
  [I.hers]: [sh(0, () => add(COMETAS_PIP, [-3.6, 2.2, 3.2]), () => add(COMETAS_PIP, [-2.6, 1.8, 2.6]), () => add(COMETAS_PIP, [0, .2, 0]), null, 50)],
  [I.landed]: [sh(0, () => add(ATERRIZA, [-7, 3, 7]), () => add(ATERRIZA, [-5.4, 2.4, 6]), () => add(ATERRIZA, [0, .8, 0]), null, 52), sh(4, () => add(ATERRIZA, [0, 7.4, .6]), () => add(ATERRIZA, [0, 6.2, .5]), () => add(ATERRIZA, [0, 0, 0]), null, 50)],
  [I.told]: [sh(0, HD(PIP, [.8, 4.2, 1.6]), HD(PIP, [.6, 3.4, 1.3]), HD(PIP, [0, 0, 0]), null, 50)],
  [I.rightall]: [sh(0, KW(ME, [-4, 3, 5]), KW(ME, [-3.4, 2.8, 4.6]), KW(ME, [1, .3, 0]), null, 46)],
  [I.life]: [sh(0, KW(ME, [-3.4, 4.4, -1.4]), KW(ME, [-3, 4.2, -1.2]), KW(ME, [.4, .4, .4]), null, 48)],
  [I.tomorrow]: [sh(0, KW(ME, [-3.6, 2.2, 3.6]), KW(ME, [-3, 2.1, 3]), KW(ME, [0, 1.9, 0]), null, 48), sh(4, KW(ME, [3, 2.2, 4.4]), KW(ME, [4, 2.8, 6]), KW(ME, [-.4, 1.5, .4]), null, 52)],
};
// el vuelo de los hermanos: curva suave por VUELO_PTS (de la veleta al pasto del valle), u = 0..1
const VUELO_C = new THREE.CatmullRomCurve3(VUELO_PTS.map(q => new THREE.Vector3(...q)), false, "centripetal");
const vueloP = u => VUELO_C.getPointAt(cl(u)).toArray();
const valleCam = i => { const c = i < 1 ? CAMS_VALLE.pastoPersona : CAMS_VALLE.humoDerecho, f = i % 1; return add(c.p, [f * 6, f * .4, -f * 2]) };
const valleMira = i => (i < 1 ? CAMS_VALLE.pastoPersona : CAMS_VALLE.humoDerecho).l;
let t_ = 0;   // el tiempo del cuadro, para las cámaras que siguen algo que se mueve
const mitad = (a, b) => { const p = a.g.getWorldPosition(new THREE.Vector3()), q = b.g.getWorldPosition(new THREE.Vector3()); return [(p.x + q.x) / 2, (p.y + q.y) / 2, (p.z + q.z) / 2] };
const cerca = (list, x, z) => list.reduce((m, p) => Math.hypot(p[0] - x, p[1] - z) < Math.hypot(m[0] - x, m[1] - z) ? p : m);
const arbolCerca = (x, z) => cerca(ARBOLES, x, z);
const tendCerca = (x, z) => cerca(TENDEDEROS, x, z);
const humoCerca = (x, z) => { const h = HUMOS.map(v => [v.x, v.z, v.y]); const c = cerca(h, x, z); return [c[0], c[2], c[1]] };
const estacaW = (C, i, o) => { const a = C.anclas[i].b; const p = a.isVector3 ? a.toArray() : a; return add(p, o) };
const CASAS_ROTAS = [[15.8, -12.4], [.9, -19.5], [-5.2, 24]];

//@@ESCENA
// ---------- la escena en cada instante
const QS = new URLSearchParams(location.search), VISTA = QS.get("vista") ? QS.get("vista").split(",").map(Number) : null;
let ENV_OK = false; const FILA = QS.has("fila");
// la cometa de Pip (la nueva): vuela atada al hilo; en «kites» (la de antes) se corta y se va
const cometaV = t => { const L = lineAt(t), lt = t - s(L), b = [COLINA[0], SUELO(...COLINA), COLINA[1]];
  if (L === I.kites && lt > wt(L, 4) - s(L)) { const u = lt - (wt(L, 4) - s(L)); return [b[0] + 4 + u * 9, b[1] + 7 + u * 4, b[2] - 2 + Math.sin(u * 3) * .8] }
  const tir = L === I.pulled ? 1.6 : 1; return [b[0] + 4.2 * tir, b[1] + 6.4 + Math.sin(t * 2.3) * .5, b[2] - 1.6 + Math.sin(t * 1.7) * .6] };
// el viejo Tobb de chico volviendo a pie por la sierra (recuerdo)
const tobbVuelta = () => { const x = 60, z = -20; return [x, PISO(x, z), z] };
function setScene(t) {
  t_ = t;
  const L = lineAt(t), lt = t - s(L), len = (S[L + 1] ?? DUR) - s(L), k = P(lt, 0, len), Wd = kk => wt(L, kk), T0 = s(L), dW = kk => Wd(kk) - T0;
  POST = { flash: 0, sepia: 0 };
  if (!ENV_OK) { Object.assign(ENV, ENV_VIENTO, typeof ENV_LEJOS !== "undefined" ? ENV_LEJOS : {}); ENV_OK = true }
  mundoReset(); utileriaReset(); lejosReset(true);
  ALL.forEach(c => { if (c.polvo) c.polvo.forEach(q => q.visible = false); c.g.visible = false; c.body.rotation.set(0, 0, 0); c.body.position.y = 0; c.head.rotation.set(0, 0, 0); power(c, null, 0); c.aura.visible = false; setFace(c, "neutral"); pose(c, t, {}); quieto(c, t) });
  [PALA, REGLA, TELESC, HOYO].forEach(o => o.visible = false);
  // ---- ambiente según el tramo
  const RECUERDO = L >= I.tobb && L <= I.green, TORM = (L >= I.doubled && L <= I.over) || L === I.today || L === I.open, VALLE_ = L >= I.then, CUMBRE = L >= I.over && L < I.then;
  setEnv(QS.get("env") || (RECUERDO ? "recuerdo" : VALLE_ ? "valle" : CUMBRE ? "cumbre" : TORM ? "tormenta" : "ventoso")); SOL.z = 0;
  ambiente(t); sinBestia();
  lejos(t, { nubes: L === I.clouds ? (lt > dW(5) - .1 ? 0 : null) : L === I.then ? eIO(k) : null, jirones: L === I.clouds ? (lt > dW(5) ? .15 : 0) : L === I.then ? .6 : 0, nieve: 1, pajaros: VALLE_ ? 1 : 0 }); tortuga(t, { paso: 0 }); LUCES.forEach(l => l.visible = false);
  vientoFuerza(VALLE_ ? 0 : TORM ? 2 : CUMBRE ? 1.4 : 1); humoInclinacion(1);
  if (RECUERDO) POST.sepia = .55;
  TEMBLOR = 0;
  // ---- la tormenta: cadenas, techo, veleta
  cadenasRotas(L < I.snapped ? (L === I.today || L === I.open ? 1 : 0) : L === I.snapped ? eIO(P(lt, 0, dW(2))) : 1);
  techoPanaderia(L < I.snapped ? 0 : L === I.snapped ? (lt < dW(2) - .1 ? .05 : .1 + .7 * P(lt, dW(2) - .1, len + 1.5)) : L === I.flew ? .18 + .08 * k : 1);
  const vel = L < I.vane ? { doblez: 0 } : L <= I.climb ? { doblez: .15 } : L === I.bend ? { doblez: .15 + .3 * eIO(P(lt, dW(3), len)) } : L < I.broke ? { doblez: .45 + .05 * Math.sin(t * 9) } : L === I.broke ? { doblez: .6, rota: eOut(P(lt, dW(1), dW(2) + .1)) } : L > I.broke && L <= I.over ? { rota: 1, pos: add(VELETA_W(), [99, 0, 0]) } : {};
  if (L >= I.over && typeof VELETA_PIEZA !== "undefined") vel.rota = 1;
  veleta(t, vel);
  // ---- helpers de gente
  const vi = VALLE_ ? 0 : TORM ? 1.5 : 1;
  const parado = (k, x, z, ry, cara = "neutral", o = {}) => { ponerP(k, x, z, ry); setFace(k, cara); quietoViento(k, t, o); vientoPelo(k, vi, { t }) };
  const camina = (k, x0, z, vx, cara = "aguanta", ph = 0) => { ponerP(k, x0 + vx * lt, z, vx < 0 ? -Math.PI / 2 : Math.PI / 2); setFace(k, cara); andarViento(k, t + ph); vientoPelo(k, vi, { t }) };
  const tirado = (k, x, z, cara = "aguanta", ph = 0) => { ponerP(k, x, z, -Math.PI / 2 + Math.sin(x * 3) * .3); setFace(k, cara); aplastado(k, t + ph); vientoPelo(k, vi, { t }) };
  const bota0 = k => botas(k, { izq: 0, der: 0 });
  const V = VECINOS;
  switch (L) {
    case I.rule: camina(V[0], -2, 4, -1.1, "aguanta"); camina(V[1], 1, 4.8, -1, "neutral", .3); camina(V[2], -5, 3.6, -1.05, "aguanta", .5); camina(V[3], 3, 3.2, -1.1, "neutral", .2); parado(ME, -1, 2.4, .9, "neutral"); break;
    case I.cost: { const f = 6 + lt * 22; enAire(V[5], [f, 8 + lt * 9, -2]); volar(V[5], t, {}); bota0(V[5]); setFace(V[5], "terrified"); vientoPelo(V[5], 1.5, { t }); break }
    case I.open: ponerP(ME, YO_T[0], YO_T[1], Math.PI / 2 + .2); bota0(ME); setFace(ME, lt < dW(3) ? "determined" : "shock"); despega(ME, t, eIO(P(lt, dW(3), len + .2))); vientoPelo(ME, 1.5, { t }); botaEnPiso(botaSuelta(ME, "izq"), YO_T[0] - .8, YO_T[1] + .8, { ry: .6, volcada: 1 }); botaEnPiso(botaSuelta(ME, "der"), YO_T[0] - .4, YO_T[1] + 1.3, { ry: -.4 }); break;
    case I.today: ponerP(ME, YO_T[0], YO_T[1], Math.PI / 2 + .2); bota0(ME); setFace(ME, "determined"); despega(ME, t, .15 + .3 * k); vientoPelo(ME, 1.5, { t }); botaEnPiso(botaSuelta(ME, "izq"), YO_T[0] - .8, YO_T[1] + .8, { ry: .6, volcada: 1 }); botaEnPiso(botaSuelta(ME, "der"), YO_T[0] - .4, YO_T[1] + 1.3, { ry: -.4 }); break;
    case I.never: case I.sideways: case I.laundry: camina(V[4], -4, 26, -1, "neutral"); break;
    case I.chains: parado(V[6], CASA_MIA[0] - 6, CASA_MIA[1] + 6, -1.2, "neutral"); break;
    case I.iron: parado(ME, -1, 5, .6, "neutral"); camina(V[0], 1, 2.6, -1.2, "aguanta"); camina(V[2], 3, 3, -1.1, "neutral", .4); camina(V[7], -1, 1.8, -1.1, "aguanta", .2); break;
    case I.babies: parado(MAMA, PUNTOS.bebe[0], PUNTOS.bebe[1], -.6, "warm"); acunar(MAMA); break;
    case I.wed: { const [x, z] = PUNTOS.boda, y = SUELO(x, z); parado(NOVIA, x - .7, z, Math.PI * .15, "happy", { lean: .2 }); parado(NOVIO, x + .7, z, -Math.PI * .15, "happy", { lean: .2 }); sogaNovios(NOVIA, NOVIO, t, { viento: 1 });
      parado(V[1], x - 3.2, z + 1.4, Math.PI * .7, "happy"); parado(V[3], x + 3, z + 1.6, -Math.PI * .7, "laugh"); parado(V[8], x + 2.2, z - .6, -Math.PI * .5, "warm"); break }
    case I.lean: [[V[0], 0, 6.6], [V[1], 2.4, 7], [V[2], 4.6, 6.2], [ME, 1.2, 5.6], [V[3], 6.4, 6.8], [V[7], 3.4, 5.2]].forEach(([c, x, z], i) => camina(c, x, z, -1.6, i % 2 ? "aguanta" : "neutral", i * .27)); break;
    case I.soup: { const [x, z] = PUNTOS.sopa; parado(MARTA, x + 1.1, z, -Math.PI / 2, "happy", { lean: .15 }); MARTA.armR.rotation.set(-.85, 0, .1); enMano(TAZA_TAPA, MARTA, "R", { off: [0, -.06, .14] }); parado(V[9], x - 1.3, z - 1.4, Math.PI / 2 - .4, "neutral"); break }
    case I.sign: camina(V[2], 3, 3, -1, "neutral"); parado(TOBB, -2, 2.2, Math.PI, "worried"); attach(BASTON, TOBB, "R", [0, -.2, .1]); break;
    case I.pip: parado(PIP, -3, 8, .5, lt > dW(8) ? "happy" : "neutral"); bambolea(PIP, t, 1); parado(ME, -1.6, 7.4, -.4, "warm"); break;
    case I.rocks: parado(PIP, -3, 8, .5, lt > dW(7) ? "scared" : "happy"); bambolea(PIP, t, lt > dW(7) ? 2 : 1); break;
    case I.kites: case I.where: { const b = COLINA; parado(PIP, b[0], b[1], L === I.where ? Math.PI / 2 + .3 : .9, L === I.where ? "wow" : lt > dW(4) ? "sad" : "happy"); bambolea(PIP, t, 1);
      if (L === I.kites) { if (lt <= dW(4)) sostieneCometa(PIP, t, { cometa: cometaV(t) }); else cometaPip(t, cometaV(t), {}) } break }
    case I.tobb: case I.second: { const x = -24, z = -19; ponerP(TOBB_CHICO, x, z, .4); sentadoDesata(TOBB_CHICO, t, { lado: "der" }); setFace(TOBB_CHICO, "happy"); vientoPelo(TOBB_CHICO, 1, { t });
      if (L === I.second) { botas(TOBB_CHICO, { izq: 0, der: 0, descalzo: 1 }); botaEnPiso(botaSuelta(TOBB_CHICO, "izq"), x + .9, z + .4, { ry: .5 }); botaEnPiso(botaSuelta(TOBB_CHICO, "der"), x + 1.3, z - .2, { ry: -.3, volcada: 1 }); enMano(MEDIA_TOBB, TOBB_CHICO, "R", { off: [0, -.1, .1], viento: 1 }); TOBB_CHICO.armR.rotation.set(-1.4, 0, .3) }
      else if (lt > dW(10)) { botas(TOBB_CHICO, { izq: 0, der: 1 }); botaEnPiso(botaSuelta(TOBB_CHICO, "izq"), x + .9, z + .4, { ry: .5 }) } break }
    case I.leaf: { const x = -24, z = -19, q = eIO(P(lt, 0, len)); if (q < .3) { ponerP(TOBB_CHICO, x, z, .4); despega(TOBB_CHICO, t, q / .3) } else { enAire(TOBB_CHICO, [x + (q - .3) * 14, SUELO(x, z) + 1.4 + (q - .3) * 9, z]); volar(TOBB_CHICO, t, {}) }
      botas(TOBB_CHICO, { izq: 0, der: 0, descalzo: 1 }); setFace(TOBB_CHICO, "terrified"); enMano(MEDIA_TOBB, TOBB_CHICO, "R", { off: [0, -.1, .1], viento: 1 }); vientoPelo(TOBB_CHICO, 1.5, { t }); botaEnPiso(botaSuelta(TOBB_CHICO, "izq"), x + .9, z + .4, { ry: .5 }); botaEnPiso(botaSuelta(TOBB_CHICO, "der"), x + 1.3, z - .2, { ry: -.3, volcada: 1 }); break }
    case I.sock: { const q = eIO(k), y0 = SUELO(-14, -19) + 8; enAire(TOBB_CHICO, [lerp(-14, 60, q), lerp(y0, 45, q), lerp(-19, -10, q)]); volar(TOBB_CHICO, t, {}); botas(TOBB_CHICO, { izq: 0, der: 0, descalzo: 1 }); setFace(TOBB_CHICO, lt > dW(7) ? "scared" : "terrified"); enMano(MEDIA_TOBB, TOBB_CHICO, "R", { off: [0, -.1, .1], viento: 1.5 }); vientoPelo(TOBB_CHICO, 1.5, { t }); [[V[0], -3.4, 5.2], [V[3], -4.6, 4.6], [V[8], -2.6, 4.4]].forEach(([c, x, z]) => parado(c, x, z, Math.PI / 2 - .3, "shock")); break }
    case I.walked: { const p = tobbVuelta(); ponerP(TOBB_CHICO, p[0] - lt * .9, p[2], -Math.PI / 2); andarViento(TOBB_CHICO, t); botas(TOBB_CHICO, { izq: 0, der: 0, descalzo: 1 }); setFace(TOBB_CHICO, "determined"); vientoPelo(TOBB_CHICO, 1, { t }); break }
    case I.green: parado(TOBB_CHICO, 0, 4.4, Math.PI * .9, "happy"); gesto(TOBB_CHICO, t, T0 + .2, "brazos", { dur: .3, fin: dW(7) + T0 });
      [[V[0], -2, 1.6, .5], [V[1], 1.6, 1.2, -.3], [V[3], 3.2, 2.6, -.9], [V[7], -3.4, 3, 1]].forEach(([c, x, z, ry]) => { parado(c, x, z, ry, lt > dW(7) ? "laugh" : "suspicious") }); break;
    case I.old: parado(TOBB, -3, 6, .3, "worried"); attach(BASTON, TOBB, "R", [0, -.2, .1]); break;
    case I.doubled: [[V[0], -5, 4.4], [V[2], -2.4, 6], [V[3], 1, 4.8]].forEach(([c, x, z], i) => { parado(c, x, z, -1.4, "aguanta", { brazos: "cubre" }) }); tirado(V[7], 0, 7.4, "terrified"); break;
    case I.snapped: break;
    case I.hill: case I.pulled: case I.boots2: { const b = COLINA; parado(PIP, b[0], b[1], .9, L === I.hill ? "happy" : L === I.pulled ? "scared" : "terrified"); bambolea(PIP, t, 2); sostieneCometa(PIP, t, { cometa: cometaV(t), tiron: L === I.hill ? .5 : 1.5 });
      if (L === I.boots2) { botas(PIP, { izq: lt > dW(1) ? 0 : 1, der: lt > dW(5) ? 0 : 1 }); if (lt > dW(1)) botaEnPiso(botaSuelta(PIP, "izq"), b[0] + .8 + 2 * P(lt, dW(1), dW(1) + .4), b[1] + .3, { ry: .4 + lt * 3, volcada: 1 }); if (lt > dW(5)) botaEnPiso(botaSuelta(PIP, "der"), b[0] + .6 + 1.5 * P(lt, dW(5), dW(5) + .4), b[1] - .4, { ry: -.6 + lt * 2, volcada: 1 }); despega(PIP, t, .2 * P(lt, dW(5), len)) }
      break }
    case I.up: { const a = [COLINA[0], SUELO(...COLINA) + 1, COLINA[1]], q = eIO(k); enAire(PIP, curva(a, add(VELETA_W(), [-3, -1, 2]), 6, q * .7)); volar(PIP, t, {}); bota0(PIP); setFace(PIP, "terrified"); vientoPelo(PIP, 1.5, { t }); break }
    case I.vane: case I.climb: case I.bend: case I.oneway: case I.laces: case I.dont: case I.left: case I.letgo: case I.flew: case I.grab: {
      const pv = VELETA_W(); enAire(PIP, pv); colgado(PIP, t, { fuerza: L >= I.bend ? 1.5 : 1 }); bota0(PIP); setFace(PIP, L === I.vane ? "terrified" : "scared"); vientoPelo(PIP, 1.5, { t });
      if (L >= I.climb && L <= I.oneway) { [[V[0], -4, 1], [V[2], -1.4, 2.6], [V[3], 4.6, 1.4], [V[7], -6, -1.2], [V[1], 6.6, 3.2], [TOBB, TOBB_T[0] - 1, TOBB_T[1] + 1.6]].forEach(([c, x, z], i) => tirado(c, x, z, i % 2 ? "terrified" : "aguanta", i * .3)); if (L === I.oneway) { parado(ME, YO_T[0], YO_T[1], -Math.PI / 2 - .5, "determined", { lean: .5 }); ME.head.rotation.x = -.35 } else tirado(ME, YO_T[0], YO_T[1], "aguanta") }
      if (L >= I.laces && L <= I.left) { [[V[0], -4, 1], [V[2], -1.4, 2.6], [V[3], 4.6, 1.4], [V[7], -6.4, 3.4]].forEach(([c, x, z], i) => tirado(c, x, z, "aguanta", i * .3));
        ponerP(ME, YO_T[0], YO_T[1], -.3); vientoPelo(ME, 1.5, { t });
        if (L === I.laces) { sentadoDesata(ME, t, { lado: lt > dW(3) ? "der" : "izq" }); ME.head.rotation.x -= .45; setFace(ME, "determined") }
        else if (L === I.dont) { sentadoDesata(ME, t, { lado: "der" }); setFace(ME, lt > dW(5) ? "sad" : "shock"); ponerP(TOBB, TOBB_T[0], TOBB_T[1], Math.PI / 2 - .2); quietoViento(TOBB, t, { lean: .5 }); agarraBrazo(TOBB, ME, t, { mano: "R", de: "L" }); setFace(TOBB, lt > dW(5) ? "terrified" : "worried"); vientoPelo(TOBB, 1.5, { t }) }
        else { ME.head.rotation.x -= .4; const q1 = P(lt, dW(1), dW(5) + .1), q2 = P(lt, dW(6), len); if (q1 < 1) sacaBota(ME, t, "izq", q1); else { botas(ME, { izq: 0, der: 1 }); botaEnPiso(botaSuelta(ME, "izq"), YO_T[0] - .9, YO_T[1] + .9, { ry: .6, volcada: 1 }); sacaBota(ME, t, "der", q2) } setFace(ME, "esfuerzo") } }
      if (L === I.letgo) { ponerP(ME, YO_T[0], YO_T[1], Math.PI / 2); bota0(ME); despega(ME, t, eIO(P(lt, dW(2), len))); setFace(ME, "shock"); vientoPelo(ME, 1.5, { t });
        [[V[0], -4, 1], [V[2], -1.4, 2.6], [TOBB, TOBB_T[0] - .8, TOBB_T[1] + 1.4]].forEach(([c, x, z], i) => tirado(c, x, z, "terrified", i * .3)) }
      if (L === I.letgo || L === I.left || L === I.flew || L === I.grab) { botaEnPiso(botaSuelta(ME, "izq"), YO_T[0] - .9, YO_T[1] + .9, { ry: .6, volcada: 1 }); if (L !== I.left) botaEnPiso(botaSuelta(ME, "der"), YO_T[0] - .3, YO_T[1] + 1.4, { ry: -.4 }) }
      if (L === I.flew) { const a = [YO_T[0], SUELO(...YO_T) + 2.4, YO_T[1]], q = eIO(k); enAire(ME, curva(a, add(pv, [-2.6, -.6, 1.6]), 4, q * .85)); volarHacia(ME, t, { objetivo: new THREE.Vector3(...pv) }); bota0(ME); setFace(ME, "determined"); vientoPelo(ME, 1.5, { t }) }
      if (L === I.grab) { if (lt < dW(8)) { const q = eIO(P(lt, 0, dW(3))); enAire(ME, curva(add(pv, [-2.6, -.6, 1.6]), add(pv, [-.6, -.4, .4]), .3, q)); volarHacia(ME, t, { objetivo: new THREE.Vector3(...pv) }); bota0(ME); setFace(ME, lt > dW(4) ? "esfuerzo" : "determined"); vientoPelo(ME, 1.5, { t }); if (lt > dW(1)) TEMBLOR = .06 * (1 - P(lt, dW(1), dW(1) + .4)) }
        else { PIP.g.visible = false; abrazoVuelo(ME, PIP, t, { pos: add(pv, [.4, -.9, 0]), ry: .3 + Math.PI, dir: [1, .1, 0] }); bota0(ME); bota0(PIP); setFace(ME, "esfuerzo"); setFace(PIP, "relieved") } }
      break }
    case I.broke: { const pv = VELETA_W(), u = P(lt, dW(2), len); abrazoVuelo(ME, PIP, t, { pos: add(pv, [.4 + u * 3, -.9 + u * .6, 0]), ry: .3 + Math.PI, dir: [1, .1, 0] }); bota0(ME); bota0(PIP); setFace(ME, "shock"); setFace(PIP, "terrified"); break }
    case I.over: case I.tight: case I.clouds: case I.then: case I.calm: { const u = L === I.over ? .02 + .1 * k : L === I.tight ? .13 + .08 * k : L === I.clouds ? .28 + .3 * k : L === I.then ? .62 + .1 * k : .75 + .1 * k;
      if (L === I.tight) { const p = vueloP(u); enAire(ME, p); volar(ME, t, {}); enAire(PIP, add(p, [.5, .5, -.9])); volar(PIP, t + .7, { rollo: .3 }); vientoPelo(ME, 1.5, { t }); vientoPelo(PIP, 1.5, { t }) } else abrazoVuelo(ME, PIP, t, { pos: vueloP(u), ry: .3 + Math.PI, dir: [1, -.1, 0] }); bota0(ME); bota0(PIP); setFace(ME, L === I.tight ? "worried" : L >= I.then ? "wow" : "scared"); setFace(PIP, L >= I.then ? "wow" : "scared");
      break }
    case I.straight: break;
    case I.fields: { const u = .88 + .1 * k; abrazoVuelo(ME, PIP, t, { pos: vueloP(u), ry: .3 + Math.PI, dir: [1, -.3, 0] }); bota0(ME); bota0(PIP); setFace(ME, "wow"); setFace(PIP, "happy"); break }
    case I.hers: break;
    case I.landed: case I.told: case I.rightall: case I.life: { const a = ATERRIZA;
      if (L === I.landed && lt < dW(1) + .2) { const q = P(lt, 0, dW(1) + .2); abrazoVuelo(ME, PIP, t, { pos: add(a, [-6 * (1 - q), 2.5 * (1 - q) + .6, 0]), ry: .3 + Math.PI, dir: [1, -.4, 0] }) }
      else { ponerP(ME, a[0] - .9, a[2], Math.PI / 2 + .3); acostadoEspaldas(ME, t, { sentar: L === I.life ? eIO(P(lt, dW(3), len)) * .8 : 0 }); setFace(ME, L === I.told ? "laugh" : L === I.rightall ? "wow" : L === I.life ? "relieved" : "shock");
        ponerP(PIP, a[0] + 1, a[2] + .6, Math.PI / 2 - .2); acostadoEspaldas(PIP, t); setFace(PIP, L === I.told ? "laugh" : "happy") }
      bota0(ME); bota0(PIP); vientoPelo(ME, 0, { t }); vientoPelo(PIP, 0, { t }); break }
    case I.tomorrow: { const a = ATERRIZA; ponerP(ME, a[0] - .6, a[2] + .4, -Math.PI / 2 + .25); quieto(ME, t); setFace(ME, "determined"); bota0(ME); ponerP(PIP, a[0] + .2, a[2] + .9, -Math.PI / 2 + .1); quieto(PIP, t); setFace(PIP, "happy"); bota0(PIP); vientoPelo(ME, 0, { t }); vientoPelo(PIP, 0, { t }); break }
  }
  if (FILA) { ALL.forEach(c => c.g.visible = false); [ME, PIP, TOBB, TOBB_CHICO, MARTA, NOVIA, NOVIO, MAMA].forEach((c, i) => { ponerP(c, -8 + i * 2.3, 3, 0); quietoViento(c, t) }); cam.position.set(0, 3.2, 20); cam.lookAt(0, 1.4, 2); cam.fov = 44; cam.updateProjectionMatrix(); lights([]); return }
  if (VISTA) { cam.position.set(VISTA[0], VISTA[1], VISTA[2]); cam.lookAt(VISTA[3], VISTA[4], VISTA[5]); cam.fov = VISTA[6] || 50; cam.updateProjectionMatrix(); lights([]); POST.tapa = null; return }
  lights([]); camara(t);
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

