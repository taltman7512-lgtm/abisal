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
const SA = 34, SB = 27, SH = 11, RIM = 5;                                   // caparazón: semiejes en z y x, alto, altura del borde sobre el agua
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
cartelito(PANADERIA, "BAKERY"); cartelito(ESCUELA, "SCHOOL", "#2a3a5a"); cartelito(CASAS[3], "FURS", "#5a4a1a");
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

// ================= HOLLOWPINE: aldea de cabañas de troncos en un valle de pinos nevados, de noche =================
// el lomo del motor ya no es una tortuga: es una loma nevada en el medio del valle. Se esconde todo lo de la tortuga y del mar.
CABEZA.visible = false; ALETAS.forEach(a => a.piv.visible = false); COLA.visible = false; COSTA.visible = false; FOAM.visible = false; FONDO.visible = false;
BOTES.forEach(b => b.visible = false); GAVIOTAS.forEach(g => g.visible = false); LUCES.forEach(l => l.visible = false); ESPUMA.forEach(s => s.visible = false); SALPI.forEach(s => s.visible = false);
NUBE.forEach(s => s.visible = false); ROPA3.forEach(m => m.visible = false);
// pasto, flores, hiedra y algas no van en invierno (todo lo verde del lomo)
TURT.traverse(o => { if ((o.isInstancedMesh || o.isMesh) && o.material && o.material.color && !o.material.map) { const c = o.material.color; if (c.g > c.r * 1.15 && c.g > c.b) o.visible = false } if (o.isInstancedMesh && o.material && !o.material.map) o.visible = false });
GALLINAS.forEach(g => g.visible = false);
const T_LLAMA = tex(128, 256, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h * .72, 4, w / 2, h * .62, h * .55); gr.addColorStop(0, "rgba(255,250,220,1)"); gr.addColorStop(.25, "rgba(255,200,80,.95)"); gr.addColorStop(.55, "rgba(255,110,20,.6)"); gr.addColorStop(1, "rgba(160,30,0,0)"); g.fillStyle = gr; g.beginPath(); g.moveTo(w / 2, 0); g.bezierCurveTo(w * 1.05, h * .45, w, h, w / 2, h); g.bezierCurveTo(0, h, -w * .05, h * .45, w / 2, 0); g.fill() });
const T_TRAMA = tex(256, 256, (g, w, h) => { g.fillStyle = "#808080"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 4) { g.fillStyle = y % 8 ? "rgba(255,255,255,.18)" : "rgba(0,0,0,.2)"; g.fillRect(0, y, w, 2) } for (let x = 0; x < w; x += 4) { g.fillStyle = x % 8 ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.15)"; g.fillRect(x, 0, 2, h) } }, [4, 4]);
// ---------- nieve: el piso del valle, el lomo pintado de nieve con huellas y senderos, y los techos nevados
const T_NIEVE = (() => { const [c, z] = pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(1201); c.fillStyle = "#e8eef6"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
  for (let k = 0; k < 900; k++) { const x = r() * w, y = r() * h, s = 20 + r() * 90, gr = c.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, r() < .5 ? "rgba(180,196,220,.35)" : "rgba(255,255,255,.5)"); gr.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = gr; c.fillRect(x - s, y - s, s * 2, s * 2);
    const gz = z.createRadialGradient(x, y, 0, x, y, s); gz.addColorStop(0, r() < .5 ? "rgba(60,60,60,.35)" : "rgba(220,220,220,.35)"); gz.addColorStop(1, "rgba(128,128,128,0)"); z.fillStyle = gz; z.fillRect(x - s, y - s, s * 2, s * 2) }
  for (let k = 0; k < 9000; k++) { c.fillStyle = `rgba(255,255,255,${r() * .6})`; c.fillRect(r() * w, r() * h, 1.5, 1.5) } });
  [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(60, 60) }); return { c, z } })();
const M_NIEVE = new THREE.MeshStandardMaterial({ map: T_NIEVE.c, bumpMap: T_NIEVE.z, bumpScale: 4, roughness: .82, color: "#ffffff" });
AGUA.material = M_NIEVE; AGUA.position.y = .02;
// el lomo: nieve con senderos pisados (gris azulado) en las calles
M_CAPA.map = tex(2048, 2048, (g, w, h) => { const r = rng(1202), X = x => (x / (2 * SB) + .5) * w, Z = z => (z / (2 * SA) + .5) * h; g.fillStyle = "#e6ecf4"; g.fillRect(0, 0, w, h);
  for (let k = 0; k < 2500; k++) { const x = r() * w, y = r() * h, s = 10 + r() * 60; g.fillStyle = r() < .5 ? "rgba(170,186,212,.22)" : "rgba(255,255,255,.35)"; g.beginPath(); g.ellipse(x, y, s, s * .6, r() * 3, 0, 7); g.fill() }
  const senda = (x0, z0, x1, z1, an) => { for (let q = 0; q <= 1; q += .002) { const x = X(lerp(x0, x1, q)) + Math.sin(q * 11) * 8, y = Z(lerp(z0, z1, q)); g.fillStyle = `rgba(${120 + r() * 30 | 0},${132 + r() * 30 | 0},${150 + r() * 30 | 0},.22)`; g.beginPath(); g.ellipse(x + (r() - .5) * an, y + (r() - .5) * an, 6 + r() * 14, 4 + r() * 8, r() * 3, 0, 7); g.fill() }
    for (let q = 0; q <= 1; q += .006) { const x = X(lerp(x0, x1, q)) + (r() - .5) * an * .6, y = Z(lerp(z0, z1, q)); g.fillStyle = "rgba(90,100,120,.35)"; g.beginPath(); g.ellipse(x, y, 4, 7, 0, 0, 7); g.fill() } };
  senda(0, -30, 0, 30, 110); senda(-26, 0, 26, 0, 90); senda(0, 1.5, 14, 20, 50) });
M_CAPA.bumpMap = M_CAPA.map; M_CAPA.bumpScale = 1.5; M_CAPA.color.set("#ffffff"); M_CAPA.roughness = .85; M_CAPA.needsUpdate = true;
// el empedrado del motor queda debajo de la nieve: se esconden las piedritas sueltas (todo InstancedMesh gris del lomo)
TURT.children.forEach(o => { if (o.isInstancedMesh && o.material && (o.material.color?.getHex?.() === 0x8a8478 || o.material.map === T_DIRT)) o.visible = false });
// ---------- cabañas de troncos: paredes de troncos redondos con nudos y grietas, techos con nieve gruesa y carámbanos
const T_TRONCOS = seed => tex(1024, 1024, (g, w, h) => { const r = rng(seed); g.fillStyle = "#2a1a10"; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 64) { const gr = g.createLinearGradient(0, y, 0, y + 62); const b = ["#7a5030", "#6a4428", "#845a36", "#5e3c22"][r() * 4 | 0]; gr.addColorStop(0, "#3a2414"); gr.addColorStop(.2, b); gr.addColorStop(.55, rgbj(b, r, 20)); gr.addColorStop(.9, "#2e1c10"); gr.addColorStop(1, "#1a0e06"); g.fillStyle = gr; g.fillRect(0, y + 2, w, 60);
    for (let k = 0; k < 40; k++) { const x = r() * w, L = 30 + r() * 140; g.strokeStyle = r() < .5 ? "rgba(30,16,6,.45)" : "rgba(180,130,80,.18)"; g.lineWidth = 1 + r() * 2; g.beginPath(); g.moveTo(x, y + 8 + r() * 46); g.lineTo(x + L, y + 8 + r() * 46); g.stroke() }
    for (let k = 0; k < 2; k++) { const x = r() * w, yy = y + 20 + r() * 24; g.fillStyle = "#2a160a"; g.beginPath(); g.ellipse(x, yy, 7, 5, 0, 0, 7); g.fill(); g.strokeStyle = "rgba(120,80,40,.6)"; g.lineWidth = 2; g.beginPath(); g.ellipse(x, yy, 11, 8, 0, 0, 7); g.stroke() }
    g.fillStyle = "rgba(240,246,255,.85)"; for (let x = 0; x < w; x += 6) if (r() < .55) g.fillRect(x, y + 2, 6, 2 + r() * 5) } });
M_WALL.forEach((m, i) => { const t = T_TRONCOS(1300 + i); m.map = t; m.bumpMap = t; m.bumpScale = 4; m.color.set("#ffffff"); m.needsUpdate = true });
M_GABLE.forEach((m, i) => { const t = T_TRONCOS(1400 + i); m.map = t; m.bumpMap = t; m.bumpScale = 3; m.color.set("#ffffff"); m.needsUpdate = true });
const T_TECHO_NIEVE = tex(1024, 512, (g, w, h) => { const r = rng(1210); g.fillStyle = "#eef3fa"; g.fillRect(0, 0, w, h); for (let k = 0; k < 600; k++) { const x = r() * w, y = r() * h, s = 10 + r() * 40; g.fillStyle = r() < .5 ? "rgba(180,196,222,.3)" : "rgba(255,255,255,.6)"; g.beginPath(); g.ellipse(x, y, s, s * .5, 0, 0, 7); g.fill() }
  g.fillStyle = "rgba(60,40,30,.5)"; for (let x = 0; x < w; x += 40) if (r() < .25) g.fillRect(x, h - 18 - r() * 30, 26, 16) });
M_SHING.map = T_TECHO_NIEVE; M_SHING.bumpMap = T_TECHO_NIEVE; M_SHING.bumpScale = 3; M_SHING.color.set("#ffffff"); M_SHING.roughness = .8; M_SHING.needsUpdate = true;
M_BEAM.color.set("#3a2414");
// carámbanos y montoncitos de nieve en el alero de cada casa, y el antler tallado en cada puerta
const T_ASTA = tex(256, 256, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = "rgba(30,16,6,.85)"; g.lineWidth = 9; g.lineCap = "round"; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(128, 200); g.quadraticCurveTo(128 + s * 30, 120, 128 + s * 80, 40); g.stroke(); [[.35, 50], [.6, 40], [.85, 30]].forEach(([q, L]) => { const x = 128 + s * (10 + q * 70), y = 200 - q * 160; g.beginPath(); g.moveTo(x, y); g.lineTo(x + s * 10, y - L); g.stroke() }) } g.beginPath(); g.arc(128, 214, 16, 0, 7); g.stroke() });
{ const hielo = new THREE.MeshPhysicalMaterial({ color: "#dff0ff", roughness: .1, transmission: .5, thickness: .3, transparent: true, opacity: .85 }), cono = new THREE.ConeGeometry(.08, 1, 6); const r = rng(1220);
  HOUSES.forEach(H => { if (!H.g.visible) return; const Wd = H.Wd ?? 6.4; for (let k = 0; k < 9; k++) { const L = .3 + r() * .9, ic = part(cono, hielo, -Wd / 2 + .4 + k * (Wd - .8) / 8, (H.Hh ?? 5) - L / 2 + .05, 3.45, H.g, 0); ic.scale.set(1, L, 1); ic.rotation.x = Math.PI }
    const asta = part(new THREE.PlaneGeometry(.9, .9), new THREE.MeshStandardMaterial({ map: T_ASTA, transparent: true, roughness: .9 }), H.door ?? 0, 3.3, 3.32, H.g, 0) }) }
// ---------- pinos de verdad: tronco con corteza, ramas en pisos con nieve encima; un bosque alrededor de la loma hasta el horizonte
const T_CORTEZA = tex(512, 1024, (g, w, h) => { const r = rng(1230); g.fillStyle = "#3a2a1e"; g.fillRect(0, 0, w, h); for (let k = 0; k < 160; k++) { const x = r() * w; g.strokeStyle = r() < .5 ? "rgba(20,12,6,.7)" : "rgba(120,90,60,.35)"; g.lineWidth = 3 + r() * 8; g.beginPath(); g.moveTo(x, 0); for (let y = 0; y <= h; y += 30) g.lineTo(x + (r() - .5) * 14, y); g.stroke() }
  for (let k = 0; k < 40; k++) { g.fillStyle = `rgba(${90 + r() * 40 | 0},${110 + r() * 40 | 0},${70 + r() * 20 | 0},.35)`; g.beginPath(); g.arc(r() * w, r() * h, 6 + r() * 20, 0, 7); g.fill() } }, [1, 3]);
const M_CORTEZA_P = SMt(T_CORTEZA, { bumpMap: T_CORTEZA, bumpScale: 4, roughness: 1 });
const GEO_PISO = (() => { const geo = new THREE.ConeGeometry(1, 1, 18, 4, true), p = geo.attributes.position; const r = rng(1231); for (let i = 0; i < p.count; i++) { const y = p.getY(i), a = Math.atan2(p.getZ(i), p.getX(i)); const k = 1 + Math.sin(a * 9) * .08 + Math.sin(a * 23 + 1) * .05 + (r() - .5) * .04; p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); if (y < -.4) p.setY(i, y - Math.abs(Math.sin(a * 9)) * .12) } geo.computeVertexNormals(); return geo })();
const M_AGUJAS = new THREE.MeshStandardMaterial({ color: "#6a9a78", emissive: "#0e1e16", roughness: .9, side: THREE.DoubleSide, map: tex(256, 256, (g, w, h) => { const r = rng(1232); g.fillStyle = "#2a4a34"; g.fillRect(0, 0, w, h); for (let k = 0; k < 1500; k++) { g.strokeStyle = r() < .5 ? "rgba(10,30,20,.6)" : "rgba(80,120,80,.4)"; g.lineWidth = 1.5; const x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 6, y + 10); g.stroke() } }, [4, 2]) });
const M_NIEVE_P = new THREE.MeshStandardMaterial({ color: "#f2f6fc", roughness: .8, bumpMap: T_NIEVE.z, bumpScale: 2 });
const GEO_CAPNIEVE = (() => { const geo = new THREE.ConeGeometry(1, 1, 18, 3, true), p = geo.attributes.position; const r = rng(1233); for (let i = 0; i < p.count; i++) { const a = Math.atan2(p.getZ(i), p.getX(i)), k = .9 + Math.sin(a * 5 + 2) * .12 + r() * .05; p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k) } geo.computeVertexNormals(); return geo })();
const PINOS = (() => { const N = 1400, tr = new THREE.InstancedMesh(new THREE.CylinderGeometry(.18, .32, 1, 8), M_CORTEZA_P, N), pi = new THREE.InstancedMesh(GEO_PISO, M_AGUJAS, N * 4), ni = new THREE.InstancedMesh(GEO_CAPNIEVE, M_NIEVE_P, N * 4);
  [tr, pi, ni].forEach(m => { m.castShadow = true; m.receiveShadow = true; scene.add(m) }); const r = rng(1240), lista = []; let n = 0, np = 0;
  const pon = (x, z, H) => { const y = 0; dummy.rotation.set(0, r() * 6, 0); dummy.position.set(x, y + H * .2, z); dummy.scale.set(H * .05 + .2, H * .4, H * .05 + .2); dummy.updateMatrix(); tr.setMatrixAt(n, dummy.matrix);
    for (let k = 0; k < 4; k++) { const q = k / 4, rr = H * (.26 - q * .055), hh = H * (.34 - q * .04), yy = y + H * (.22 + q * .2) + hh / 2; dummy.rotation.set((r() - .5) * .06, r() * 6, (r() - .5) * .06); dummy.position.set(x, yy, z); dummy.scale.set(rr, hh, rr); dummy.updateMatrix(); pi.setMatrixAt(np, dummy.matrix);
      dummy.position.set(x, yy + hh * .1, z); dummy.scale.set(rr * .92, hh * .8, rr * .92); dummy.updateMatrix(); ni.setMatrixAt(np, dummy.matrix); np++ } lista.push([x, z, H]); n++ };
  for (let k = 0; k < 6000 && n < N; k++) { const a = r() * 6.283, d = 38 + Math.pow(r(), .7) * 260, x = Math.cos(a) * d * 1.05, z = Math.sin(a) * d * 1.2; if ((x - 12) ** 2 + (z - 37) ** 2 < 100 || (x - 16) ** 2 + (z - 44) ** 2 < 49 || (x - 3) ** 2 + (z - 49) ** 2 < 36 || (x - 4) ** 2 + (z + 38) ** 2 < 64 || (x + 28) ** 2 + (z - 28) ** 2 < 36 || (x - 6) ** 2 + (z - 46) ** 2 < 30) continue; pon(x, z, 9 + r() * 12 + (d > 120 ? 6 : 0)) }
  tr.count = n; pi.count = ni.count = np; return lista })();
// el pino más viejo: gris, hueco, enorme, en el borde del bosque (del lado de nuestra cabaña)
const VIEJO = new THREE.Group(); scene.add(VIEJO); VIEJO.position.set(16, 0, 44);
{ const tg = new THREE.CylinderGeometry(1.6, 2.6, 30, 24, 8, true), p = tg.attributes.position; for (let i = 0; i < p.count; i++) { const a = Math.atan2(p.getZ(i), p.getX(i)), k = 1 + Math.sin(a * 7 + p.getY(i) * .3) * .08; p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k) } tg.computeVertexNormals();
  const mg = SMt(T_CORTEZA, { bumpMap: T_CORTEZA, bumpScale: 6, roughness: 1, color: "#9a948c", side: THREE.DoubleSide }); const tronco = part(tg, mg, 0, 15, 0, VIEJO, 0); VIEJO.userData.tronco = new THREE.Group(); VIEJO.add(VIEJO.userData.tronco); VIEJO.userData.tronco.add(tronco); tronco.position.set(0, 15, 0);
  const hueco = part(new THREE.CircleGeometry(1.5, 20), SM("#120a06"), 0, 1.8, 2.45, VIEJO.userData.tronco, 0); hueco.scale.set(.8, 1.4, 1);
  for (let k = 0; k < 6; k++) { const ra = part(new THREE.CylinderGeometry(.12, .3, 7, 6), mg, 0, 14 + k * 2.4, 0, VIEJO.userData.tronco, 0); ra.rotation.set(0, k * 1.9, 1.1 + (k % 2) * .3); ra.translateY(3) }
  const toc = part(new THREE.CylinderGeometry(2.6, 2.9, 1.2, 24), mg, 0, .6, 0, VIEJO, 0); const tapa = part(new THREE.CircleGeometry(2.55, 24), SM("#c9a878", { roughness: .9 }), 0, 1.22, 0, VIEJO, 0); tapa.rotation.x = -Math.PI / 2; VIEJO.userData.tapa = tapa; tapa.visible = false;
  const nidoMusgo = part(new THREE.SphereGeometry(1.2, 16, 10, 0, 6.283, 0, 1.4), SM("#4a6a3a", { roughness: 1 }), 0, 1.2, 1.2, VIEJO.userData.tronco, 0) }
// el tocón de Brask en la plaza (nadie se sienta)
const TOCON = new THREE.Group(); enConcha(TOCON, -2.6, 2.2, 0, 0); { const mg = SMt(T_CORTEZA, { bumpMap: T_CORTEZA, bumpScale: 4 }); part(new THREE.CylinderGeometry(.9, 1.1, 1.1, 18), mg, 0, .5, 0, TOCON, 0); const an = part(new THREE.CircleGeometry(.88, 18), SMt(tex(256, 256, (g, w, h) => { g.fillStyle = "#c9a878"; g.fillRect(0, 0, w, h); for (let k = 1; k < 14; k++) { g.strokeStyle = "rgba(110,70,30,.6)"; g.lineWidth = 2; g.beginPath(); g.arc(128, 128, k * 9 + Math.sin(k) * 2, 0, 7); g.stroke() } })), 0, 1.06, 0, TOCON, 0); an.rotation.x = -Math.PI / 2;
  const nie = part(new THREE.SphereGeometry(.85, 16, 8, 0, 6.283, 0, 1.2), M_NIEVE_P, 0, .95, 0, TOCON, 0); nie.scale.y = .35 }
// montañas nevadas alrededor del valle
{ const T_MONTE = tex(1024, 1024, (g, w, h) => { const r = rng(1250); g.fillStyle = "#3a4a5e"; g.fillRect(0, 0, w, h); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#f4f8ff"); gr.addColorStop(.45, "#dfe8f4"); gr.addColorStop(.7, "rgba(80,96,120,.6)"); gr.addColorStop(1, "rgba(40,50,64,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 300; k++) { const x = r() * w, y = h * .3 + r() * h * .6; g.strokeStyle = "rgba(40,52,70,.5)"; g.lineWidth = 2 + r() * 6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 60, y + 40 + r() * 120); g.stroke() } });
  const mm = SMt(T_MONTE, { roughness: 1, fog: true }); const r = rng(1251);
  for (let k = 0; k < 16; k++) { const a = k / 16 * 6.283 + r() * .2, d = 420 + r() * 160, H = 160 + r() * 190, geo = new THREE.ConeGeometry(110 + r() * 90, H, 9, 6), p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const kk = 1 + (r() - .5) * .25; p.setX(i, p.getX(i) * kk); p.setZ(i, p.getZ(i) * kk) } geo.computeVertexNormals(); const m = part(geo, mm, Math.cos(a) * d, H / 2 - 20, Math.sin(a) * d, scene, 0); m.castShadow = false } }
// la montaña del Watcher (más cerca, detrás del bosque del norte) con una cornisa donde se para
const CORNISA = new THREE.Vector3(-30, 62, -230);
// ---------- nieve que cae (copos que dependen del tiempo: el render es determinista)
const COPOS = (() => { const n = 5000, p = new Float32Array(n * 3), base = new Float32Array(n * 4), r = rng(1260); for (let k = 0; k < n; k++) { base[k * 4] = (r() - .5) * 120; base[k * 4 + 1] = r() * 60; base[k * 4 + 2] = (r() - .5) * 120; base[k * 4 + 3] = .6 + r() * .9 }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3)); const m = new THREE.Points(g, new THREE.PointsMaterial({ map: GLOW, color: "#ffffff", size: .5, transparent: true, opacity: .85, depthWrite: false, sizeAttenuation: true })); m.frustumCulled = false; scene.add(m); m.userData.base = base; return m })();
function copos(t, c, fuerza = 1) { const p = COPOS.geometry.attributes.position.array, b = COPOS.userData.base; COPOS.visible = fuerza > 0; COPOS.material.opacity = .85 * fuerza;
  const md = (v, m) => ((v % m) + m) % m;
  for (let k = 0; k < b.length / 4; k++) { const v = b[k * 4 + 3]; p[k * 3] = c.x + md(b[k * 4] - c.x + t * 1.2 + Math.sin(t * .7 + k) * 1.5 + 60, 120) - 60; p[k * 3 + 1] = c.y - 25 + md(b[k * 4 + 1] - t * 2.4 * v, 60); p[k * 3 + 2] = c.z + md(b[k * 4 + 2] - c.z + 60, 120) - 60 }
  COPOS.geometry.attributes.position.needsUpdate = true }
// faroles con vela en las calles y ventanas cálidas (de noche)
const FAROLES = [[-3.4, 9], [3.4, -6], [-3.4, -16], [3.4, 11.5], [8, 2.2], [-9, 2.2]].map(([x, z]) => { const g = new THREE.Group(); enConcha(g, x, z); part(new THREE.CylinderGeometry(.07, .1, 3, 8), SM("#1a1a1e", { metalness: .5 }), 0, 1.5, 0, g, 0); const vid = part(RB(.4, .5, .4, .05), new THREE.MeshStandardMaterial({ color: "#ffe0a0", emissive: "#ffb050", emissiveIntensity: 2.2 }), 0, 3.2, 0, g, 0); const gl = glowSprite("#ffb060", 2.2); gl.material.opacity = .55; g.userData.gl = gl; return g });

// ---------- el Watcher: ciervo gigante de corteza y musgo, con cuernos más anchos que el río y ojos pálidos
const T_PELO_C = (() => { const [c, z] = pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(1300); c.fillStyle = "#3a3026"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
  for (let k = 0; k < 2600; k++) { const x = r() * w, y = r() * h, L = 20 + r() * 70; const col = r() < .7 ? `rgba(${70 + r() * 40 | 0},${56 + r() * 30 | 0},${40 + r() * 20 | 0},.7)` : `rgba(${20 + r() * 20 | 0},${16 + r() * 10 | 0},${10},.7)`; c.strokeStyle = col; c.lineWidth = 3 + r() * 5; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + (r() - .5) * 10, y + L / 2, x + (r() - .5) * 14, y + L); c.stroke();
    z.strokeStyle = r() < .5 ? "rgba(30,30,30,.5)" : "rgba(220,220,220,.4)"; z.lineWidth = 3; z.beginPath(); z.moveTo(x, y); z.lineTo(x, y + L); z.stroke() }
  for (let k = 0; k < 70; k++) { const x = r() * w, y = r() * h, s = 20 + r() * 80; for (let j = 0; j < 30; j++) { c.fillStyle = `rgba(${70 + r() * 40 | 0},${100 + r() * 50 | 0},${50 + r() * 20 | 0},${.3 + r() * .4})`; c.beginPath(); c.arc(x + (r() - .5) * s, y + (r() - .5) * s, 3 + r() * 10, 0, 7); c.fill() } } });
  [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
const M_PELO_C = new THREE.MeshStandardMaterial({ map: T_PELO_C.c, bumpMap: T_PELO_C.z, bumpScale: 6, roughness: .95 });
const M_ASTA = new THREE.MeshStandardMaterial({ color: "#cfc4aa", roughness: .7, bumpMap: T_CORTEZA, bumpScale: 2 });
const M_PEZUNA = SM("#1a1410", { roughness: .5 });
function ciervo({ escala = 1, cuernos = true, cria = false } = {}) { const G = new THREE.Group(); scene.add(G); const c = { G, patas: [] }; const pelo = cria ? new THREE.MeshStandardMaterial({ map: T_PELO_C.c, bumpMap: T_PELO_C.z, bumpScale: 3, roughness: .95, color: "#c8a070" }) : M_PELO_C;
  const raiz = new THREE.Group(); G.add(raiz); raiz.scale.setScalar(escala); c.raiz = raiz;
  const cuerpo = new THREE.Group(); cuerpo.position.y = 24; raiz.add(cuerpo); c.cuerpo = cuerpo;
  { const geo = new THREE.SphereGeometry(1, 48, 32), p = geo.attributes.position; for (let i = 0; i < p.count; i++) { let x = p.getX(i), y = p.getY(i), z = p.getZ(i); const pecho = z > .3 ? 1 + (z - .3) * .25 : 1; p.setXYZ(i, x * 5.2 * pecho, y * (y > 0 ? 5.4 : 4.6) + (z > 0 ? z * 1.2 : 0), z * 10.5) } geo.computeVertexNormals(); part(geo, pelo, 0, 0, 0, cuerpo, 0) }
  // flecos de pelo y musgo que cuelgan de la panza, del lomo y del cuello (la «pared de pelo»)
  { const fl = new THREE.InstancedMesh(new THREE.ConeGeometry(.35, 3, 5), pelo, 520), r = rng(1301); fl.castShadow = true; cuerpo.add(fl); const cc = new THREE.Color();
    for (let k = 0; k < 520; k++) { const a = r() * 6.283, z = (r() - .5) * 19, y = Math.sin(a) * 4.8, x = Math.cos(a) * 5.0; dummy.position.set(x * 1.02, y - 1.2, z); dummy.rotation.set(Math.PI + (r() - .5) * .4, r() * 6, Math.cos(a) * .5); dummy.scale.set(1, .6 + r() * 1.2, 1); dummy.updateMatrix(); fl.setMatrixAt(k, dummy.matrix); fl.setColorAt(k, cc.set(r() < .25 ? "#5a7a3a" : r() < .5 ? "#4a3a2a" : "#6a5440")) } }
  const pata = (x, z, del) => { const cad = new THREE.Group(); cad.position.set(x, -2, z); cuerpo.add(cad); part(new THREE.CylinderGeometry(1.7, 1.1, 11, 14), pelo, 0, -5.5, 0, cad, 0); const rod = new THREE.Group(); rod.position.y = -11; cad.add(rod); part(new THREE.CylinderGeometry(.9, .6, 11, 12), pelo, 0, -5.5, 0, rod, 0); part(new THREE.CylinderGeometry(.8, 1, 1.2, 12), M_PEZUNA, 0, -11.4, .2, rod, 0); c.patas.push({ cad, rod, del }); return cad };
  pata(-3.2, 7, 1); pata(3.2, 7, 1); pata(-3.2, -7.5, 0); pata(3.2, -7.5, 0);
  const cuello = new THREE.Group(); cuello.position.set(0, 3, 9); cuerpo.add(cuello); c.cuello = cuello; { const cu = part(new THREE.CylinderGeometry(2.4, 3.6, 12, 18), pelo, 0, 5, 1.5, cuello, 0); cu.rotation.x = .35;
    const fl = new THREE.InstancedMesh(new THREE.ConeGeometry(.4, 3.5, 5), pelo, 90), r = rng(1302); cuello.add(fl); for (let k = 0; k < 90; k++) { const a = r() * 3.14 + 3.14, y = r() * 10; dummy.position.set(Math.cos(a) * 3, y, 2.5 + Math.sin(a) * 1.5 + y * .3); dummy.rotation.set(Math.PI - .4, 0, (r() - .5) * .5); dummy.scale.set(1, .7 + r(), 1); dummy.updateMatrix(); fl.setMatrixAt(k, dummy.matrix) } }
  const cabeza = new THREE.Group(); cabeza.position.set(0, 11, 4.5); cuello.add(cabeza); c.cabeza = cabeza;
  { const geo = new THREE.SphereGeometry(1, 40, 28), p = geo.attributes.position; for (let i = 0; i < p.count; i++) { let x = p.getX(i), y = p.getY(i), z = p.getZ(i); const f = z > 0 ? 1 - .45 * z : 1; p.setXYZ(i, x * 2.4 * f, y * 2.5 * f - (z > 0 ? z * .8 : 0), z * 5 + 2) } geo.computeVertexNormals(); part(geo, pelo, 0, 0, 0, cabeza, 0);
    part(new THREE.SphereGeometry(.55, 20, 14), SM("#2a201a", { roughness: .4 }), 0, -1.6, 6.1, cabeza, 0).scale.set(1.3, .7, .8);
    for (const s of [-1, 1]) { const o = part(new THREE.CylinderGeometry(.9, .3, 4, 10), pelo, s * 2.6, 1.6, .2, cabeza, 0); o.rotation.z = s * -1.1; o.scale.z = .4 } }
  c.ojos = [-1, 1].map(s => { const o = part(new THREE.SphereGeometry(.62, 24, 16), cria ? SM("#0a0806", { roughness: .1 }) : new THREE.MeshStandardMaterial({ color: "#dff4ff", emissive: "#bfe6ff", emissiveIntensity: 2.4 }), s * 1.95, .7, 3.2, cabeza, 0); return o });
  if (!cria) c.brillos = c.ojos.map(o => { const g = glowSprite("#cfeaff", 3); g.material.opacity = .55; return g });
  if (cuernos) { // cuernos que se ramifican (recursivos), color hueso con musgo colgando
    const rama = (par, p0, dir, L, r0, d) => { const pts = []; const v = dir.clone().normalize(); for (let k = 0; k <= 6; k++) { const q = k / 6; pts.push(p0.clone().addScaledVector(v, L * q).add(new THREE.Vector3(0, Math.sin(q * 3) * L * .08, 0))) } const cu = new THREE.CatmullRomCurve3(pts); const m = new THREE.Mesh(new THREE.TubeGeometry(cu, 16, r0, 8), M_ASTA); m.castShadow = true; par.add(m);
      if (d < 3) { [.35, .6, .85].forEach((q, j) => { const p = cu.getPointAt(q); const nd = v.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), (j % 2 ? .7 : -.5)).add(new THREE.Vector3(0, .9, 0)).normalize(); rama(par, p, nd, L * (.55 - d * .08), r0 * .6, d + 1) }) }
      else { const mus = part(new THREE.ConeGeometry(.15, 1.6, 4), SM("#5a7a3a", { roughness: 1 }), 0, 0, 0, par, 0); mus.position.copy(cu.getPointAt(1)); mus.position.y -= .8; mus.rotation.x = Math.PI } };
    for (const s of [-1, 1]) { const g = new THREE.Group(); g.position.set(s * 1.6, 2.2, .5); cabeza.add(g); rama(g, new THREE.Vector3(0, 0, 0), new THREE.Vector3(s * 1, .9, -.3), 11, .55, 0) } }
  return c }
const WATCHER = ciervo({ escala: 1.15 }), CRIA = ciervo({ escala: .055, cuernos: false, cria: true });
if (typeof TENDEDERO !== "undefined") TENDEDERO.visible = false;
WATCHER.G.visible = CRIA.G.visible = false;
const ALIENTO = Array.from({ length: 20 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#e8eef6", transparent: true, opacity: 0, depthWrite: false })); scene.add(s); return s });
// pose: paso (caminar), echado (acostado y enroscado), cabeza (giro y baja), y respiración
function ciervoPose(c, t, { x = 0, y = 0, z = 0, ry = 0, paso = 0, echado = 0, gira = 0, baja = 0, sube = 0, aliento = 0, tiembla = 0 } = {}) { c.G.visible = true; c.G.position.set(x, y, z); c.G.rotation.set(0, ry, 0);
  const ph = t * 1.6; c.patas.forEach((p, i) => { const f = ph + (i === 0 || i === 3 ? 0 : Math.PI), s = Math.sin(f) * paso; p.cad.rotation.x = s * .45 + echado * (p.del ? -1.45 : 1.5); p.rod.rotation.x = (p.del ? Math.max(0, -Math.cos(f)) * .7 * paso : -Math.max(0, Math.cos(f)) * .6 * paso) + echado * (p.del ? 2.6 : -2.6) });
  c.cuerpo.position.y = 24 - echado * 18.5 + Math.abs(Math.sin(ph)) * .6 * paso + Math.sin(t * 1.1) * .25 + Math.sin(t * 40) * tiembla * .2; c.cuerpo.rotation.set(Math.sin(ph * 2) * .02 * paso - echado * .05, 0, Math.sin(ph) * .03 * paso + echado * .12);
  c.cuello.rotation.set(-.15 + baja * .9 - sube * .4 + echado * .5 + Math.sin(ph * 2) * .05 * paso, gira * .7, 0); c.cabeza.rotation.set(baja * .3 - sube * .2, gira * .3 + Math.sin(t * .5) * .05, 0);
  if (c.brillos) { c.G.updateMatrixWorld(true); c.ojos.forEach((o, i) => c.brillos[i].position.copy(o.getWorldPosition(V3))); c.brillos.forEach(b => b.visible = true) }
  if (aliento > 0) { c.G.updateMatrixWorld(true); const o = c.cabeza.localToWorld(new THREE.Vector3(0, -1.4, 7.4)); ALIENTO.forEach((s, i) => { const q = (t * .3 + i / 20) % 1; s.visible = true; s.position.set(o.x + Math.sin(i * 2.3) * q * 6, o.y + q * 5, o.z + q * 4); s.scale.setScalar(2 + q * 10); s.material.opacity = (1 - q) * .35 * aliento }) } }
function sinCiervos() { WATCHER.G.visible = CRIA.G.visible = false; WATCHER.brillos.forEach(b => b.visible = false); ALIENTO.forEach(s => s.visible = false) }

// ---------- adentro de nuestra cabaña (un set aparte, lejos): paredes de troncos, chimenea con fuego, cama de Mila,
// estante con tazas, ventana grande, y un techo que se puede romper
const CASA_IN = new THREE.Group(); scene.add(CASA_IN); CASA_IN.position.set(600, 200, 600);
{ const mw = SMt(T_TRONCOS(1500), { bumpMap: T_TRONCOS(1500), bumpScale: 4 }); const piso = part(new THREE.BoxGeometry(12, .3, 10), SMt(tex(512, 512, (g, w, h) => { const r = rng(1501); for (let x = 0; x < w; x += 64) vetas(g, r, x, 0, 62, h, ["#6a4a2e", "#5a3e26", "#74502e"][r() * 3 | 0], true) }), { roughness: .8 }), 0, -.15, 0, CASA_IN, 0);
  part(new THREE.BoxGeometry(12, 6, .4), mw, 0, 3, -5, CASA_IN, 0); part(new THREE.BoxGeometry(.4, 6, 10), mw, -6, 3, 0, CASA_IN, 0); part(new THREE.BoxGeometry(.4, 6, 10), mw, 6, 3, 0, CASA_IN, 0);
  // pared del frente con una ventana grande (hueco) y marco
  part(new THREE.BoxGeometry(4.5, 6, .4), mw, -3.75, 3, 5, CASA_IN, 0); part(new THREE.BoxGeometry(4.5, 6, .4), mw, 3.75, 3, 5, CASA_IN, 0); part(new THREE.BoxGeometry(3, 1.6, .4), mw, 0, .8, 5, CASA_IN, 0); part(new THREE.BoxGeometry(3, 1.6, .4), mw, 0, 5.2, 5, CASA_IN, 0);
  for (const [x, y, w, h] of [[0, 1.6, 3.2, .2], [0, 4.4, 3.2, .2], [-1.5, 3, .2, 3], [1.5, 3, .2, 3], [0, 3, .12, 2.8]]) part(new THREE.BoxGeometry(w, h, .5), SM("#3a2414"), x, y, 5, CASA_IN, 0);
  const vidrio = part(new THREE.PlaneGeometry(2.9, 2.7), new THREE.MeshPhysicalMaterial({ color: "#a8c0d8", transparent: true, opacity: .18, roughness: .05 }), 0, 3, 4.95, CASA_IN, 0);
  // techo (dos aguas) que se rompe
  const techo = new THREE.Group(); techo.position.y = 6; CASA_IN.add(techo); for (const s of [-1, 1]) { const t = part(new THREE.BoxGeometry(6.8, .3, 10.6), mw, s * 3, 1.6, 0, techo, 0); t.rotation.z = -s * .5 } CASA_IN.userData.techo = techo;
  const agujero = part(new THREE.CircleGeometry(1.6, 14), SM("#0e1626"), 2.6, 7.2, 1, CASA_IN, 0); agujero.rotation.set(Math.PI / 2, 0, .3); agujero.scale.set(1.4, 1, 1); agujero.visible = false; CASA_IN.userData.agujero = agujero;
  // chimenea de piedra con fuego
  part(new THREE.BoxGeometry(3, 6, 1.4), M_STONE, -3, 3, -4.4, CASA_IN, 0); part(new THREE.BoxGeometry(1.8, 1.4, .6), SM("#120a06"), -3, .8, -3.75, CASA_IN, 0);
  for (let k = 0; k < 4; k++) part(new THREE.CylinderGeometry(.12, .14, 1.2, 8), M_CORTEZA_P, -3.4 + k * .25, .35, -3.6, CASA_IN, 0).rotation.z = Math.PI / 2 + (k % 2 ? .3 : -.3);
  CASA_IN.userData.llamas = Array.from({ length: 14 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: T_LLAMA, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(s); return s });
  // cama con frazadas tejidas y almohada
  part(RB(2.4, .7, 4, .1), M_PLANK, 3.6, .45, -2, CASA_IN, 0); part(RB(2.3, .3, 3.9, .12), SM("#b8463a", { bumpMap: T_TRAMA, bumpScale: 3 }), 3.6, .95, -1.8, CASA_IN, 0); part(RB(1.4, .3, .8, .12), SM("#efe8da"), 3.6, 1.05, -3.6, CASA_IN, 0);
  // estante con tazas, mesa, silla rota, alfombra
  part(new THREE.BoxGeometry(2.4, .12, .5), M_PLANK, 4.4, 3.4, -4.6, CASA_IN, 0); CASA_IN.userData.tazas = [0, 1, 2, 3].map(k => { const c = new THREE.Group(); c.position.set(3.6 + k * .5, 3.62, -4.6); CASA_IN.add(c); part(new THREE.CylinderGeometry(.13, .1, .24, 14), SM(["#e8dcc0", "#3f6a8a", "#c94b4b", "#e8dcc0"][k]), 0, 0, 0, c, 0); return c });
  part(RB(1.6, .1, 1, .03), M_PLANK, -.5, 1.2, -1, CASA_IN, 0); for (const [x, z] of [[-1.2, -1.4], [.2, -1.4], [-1.2, -.6], [.2, -.6]]) part(new THREE.BoxGeometry(.1, 1.2, .1), M_BEAM, x, .6, z, CASA_IN, 0);
  part(new THREE.CircleGeometry(2, 24), SM("#6a3a5a", { bumpMap: T_TRAMA, bumpScale: 3 }), -1, .02, 1, CASA_IN, 0).rotation.x = -Math.PI / 2;
  CASA_IN.userData.copos = null }
function fuegoChimenea(t, a) { const u = CASA_IN.userData; u.llamas.forEach((s, k) => { const q = (t * (1.4 + (k % 4) * .2) + k * .37) % 1; s.visible = a > 0; s.position.set(600 - 3 + ((k * .618) % 1 - .5) * 1.2, 200.6 + q * 1.3 * a, 600 - 3.7); const sz = (1 - q * .6) * (.6 + (k % 3) * .25) * a; s.scale.set(sz, sz * 1.8, 1); s.material.opacity = (1 - q) * .9 }) }
// utilería: hacha, trineo con palitos, montaña de ramas en la puerta
const HACHA = new THREE.Group(); { part(new THREE.CylinderGeometry(.05, .06, 1.4, 8), SM("#7a5030"), 0, -.4, .1, HACHA, 0); const h = part(new THREE.BoxGeometry(.06, .35, .5), SM("#8a8e94", { metalness: .8, roughness: .3 }), 0, -1.05, .32, HACHA, 0) }
const TRINEO = new THREE.Group(); { for (const s of [-1, 1]) { const pa = part(new THREE.TorusGeometry(.8, .05, 6, 16, Math.PI / 2), SM("#2a2a2e", { metalness: .6 }), s * .35, .5, .6, TRINEO, 0); pa.rotation.y = Math.PI / 2; part(new THREE.BoxGeometry(.06, .06, 1.6), SM("#2a2a2e", { metalness: .6 }), s * .35, 0, -.2, TRINEO, 0) } part(new THREE.BoxGeometry(.9, .08, 1.7), M_PLANK, 0, .3, -.2, TRINEO, 0);
  for (let k = 0; k < 7; k++) part(new THREE.CylinderGeometry(.04, .05, 1.2, 5), M_CORTEZA_P, (k - 3) * .1, .4 + (k % 2) * .08, -.2, TRINEO, 0).rotation.x = Math.PI / 2 }
const PILA = new THREE.Group(); scene.add(PILA); { const r = rng(1510); for (let k = 0; k < 160; k++) { const L = 2 + r() * 5, m = part(new THREE.CylinderGeometry(.08 + r() * .1, .14 + r() * .12, L, 6), M_CORTEZA_P, (r() - .5) * 5, Math.pow(r(), .6) * 6, (r() - .5) * 4, PILA, 0); m.rotation.set(r() * 3, r() * 3, r() * 3) } } PILA.visible = false;

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

// ---------- elenco nuevo de Hollowpine (diseños propios, ropa de invierno): el narrador (campera roja, gorro tejido azul con
// pompón, bufanda amarilla), Mila (campera verde, gorro blanco, trenzas), la abuela Ilse (pañuelo en la cabeza, chal violeta,
// anteojos), Brask el leñador (barba castaña, camisa escocesa roja y negra, gorro oscuro) y vecinos con gorros de piel
robloxify(ME, { skin: "#f0c8a0", shirt: "#b8302a", pants: "#2e3a4a", shoes: "#3a2418", pelo: ["liso", "#6a4024"] });
robloxify(ME6, { skin: "#f2d0b0", shirt: "#3f7a4a", pants: "#5a4a6a", shoes: "#5a3018", pelo: ["trenzas", "#c98a3a"] });
robloxify(GARROW, { skin: "#e8c0a0", shirt: "#6a3a6a", cloth: "sweater", alt: "#c9b48a", pants: "#3a3236", pelo: ["rodete", "#d8d4cc"] });
robloxify(PIM, { skin: "#d8a880", shirt: "#a8282a", cloth: "plaid", alt: "#1a1a1a", pants: "#3a3a42", pelo: ["corto", "#5a3a20"] });
robloxify(QUILL, { skin: "#f0c6a0", shirt: "#4a4a5a", pants: "#2e2e3a", pelo: ["corto", "#9a9a9a"] });
FOLK.forEach((k, i) => robloxify(k, { skin: ["#c98e64", "#f2cfae", "#e8b48c", "#efc8a8", "#8a5a3c", "#f2cfae"][i], shirt: ["#5a4a3a", "#2e5a7a", "#7a3a2a", "#4a5a3a", "#8a6a3a", "#3a3a5a"][i], cloth: ["plain", "sweater", "plaid", "plain", "sweater", "plain"][i], alt: "#d9c7a0", pants: ["#3a3236", "#3a3f4a", "#3a2f28", "#3a3236", "#2e3a59", "#2a2420"][i], pelo: [["corto", "#2b211b"], ["melena", "#6b3f22"], ["liso", "#c9a06a"], ["rodete", "#9a9a9a"], ["rulos", "#1d1a17"], ["puntas", "#7a4a2a"]][i] }));
EXT.forEach((k, i) => robloxify(k, { skin: ["#efc8a8", "#8a5a3c", "#f2cfae", "#c98e64"][i], shirt: ["#6a2a3a", "#3a6a5a", "#a87a2a", "#3a4a6a"][i], pants: ["#3a3f4a", "#3a2f28", "#2e3a59", "#2a2420"][i], pelo: [["liso", "#3a2416"], ["rulos", "#1d1a17"], ["trenzas", "#8a5a2a"], ["corto", "#5a3a22"]][i] }));
[ME, ME6, GARROW, PIM, QUILL, ...FOLK, ...EXT].forEach(k => telaReal(k, { shirt: k === ME ? "#b8302a" : k === ME6 ? "#3f7a4a" : k === GARROW ? "#6a3a6a" : k === PIM ? "#a8282a" : "#5a4a3a", pants: "#2e3a4a", botones: true, bolsillo: k !== ME6, cinto: k === PIM }));
// gorros tejidos con pompón, de piel, bufandas, pañuelo, chal y anteojos
const gorroTejido = (k, col, pom = "#f2ece0") => { const m = SM(col, { roughness: 1, bumpMap: T_TRAMA, bumpScale: 4 }); [...k.head.children].forEach(c => { if (c.userData.pelo && c.position.y > .55) k.head.remove(c) });
  part(new THREE.CylinderGeometry(.42, .44, .3, 24), m, 0, .66, 0, k.head, 0); const cop = part(new THREE.SphereGeometry(.42, 24, 12, 0, 6.283, 0, Math.PI / 2), m, 0, .8, 0, k.head, 0); cop.scale.y = .8;
  part(new THREE.TorusGeometry(.43, .07, 8, 28), m, 0, .55, 0, k.head, 0).rotation.x = Math.PI / 2; part(new THREE.SphereGeometry(.15, 14, 10), SM(pom, { roughness: 1, bumpMap: T_TRAMA, bumpScale: 6 }), 0, 1.16, 0, k.head, 0) };
const gorroPiel = (k, col) => { const m = SM(col, { roughness: 1, bumpMap: T_PELO_C.z, bumpScale: 5 }); [...k.head.children].forEach(c => { if (c.userData.pelo && c.position.y > .55) k.head.remove(c) }); part(new THREE.CylinderGeometry(.46, .46, .42, 24), m, 0, .8, 0, k.head, 0); for (const s of [-1, 1]) { const o = part(RB(.12, .4, .4, .05), m, s * .4, .45, 0, k.head, 0) } };
const bufanda = (k, col) => { const m = SM(col, { roughness: 1, bumpMap: T_TRAMA, bumpScale: 4 }); part(RB(1.12, .22, .62, .08), m, 0, 2.06, 0, k.body, 0); const c = part(RB(.26, .7, .08, .03), m, .25, 1.75, .3, k.body, 0); c.rotation.z = .12 };
gorroTejido(ME, "#2a4a8a"); bufanda(ME, "#e8b42a"); gorroTejido(ME6, "#f2ece0", "#d84a6a"); bufanda(ME6, "#d84a6a");
{ const m = SM("#7a2a3a", { roughness: 1, bumpMap: T_TRAMA, bumpScale: 3 }); [...GARROW.head.children].forEach(c => { if (c.userData.pelo && c.position.y > .5) GARROW.head.remove(c) }); const pa = part(new THREE.SphereGeometry(.44, 24, 16, 0, 6.283, 0, 1.7), m, 0, .45, -.02, GARROW.head, 0); pa.scale.set(1.02, 1.05, 1.05); part(new THREE.ConeGeometry(.12, .3, 6), m, 0, .14, -.38, GARROW.head, 0).rotation.x = 2.6;
  const chal = part(RB(1.2, .5, .7, .15), SM("#c9b48a", { roughness: 1, bumpMap: T_TRAMA, bumpScale: 5 }), 0, 1.95, 0, GARROW.body, 0);
  for (const s of [-1, 1]) part(new THREE.TorusGeometry(.09, .018, 6, 18), SM("#3a2a1a", { metalness: .5 }), s * .14, .44, .34, GARROW.head, 0) }
barbaSensei(PIM, "#5a3a20"); gorroTejido(PIM, "#2a2a2e", "#2a2a2e");
FOLK.forEach((k, i) => i % 2 ? gorroTejido(k, ["#8a3a2a", "#3a5a7a", "#5a7a3a"][i % 3], "#f2ece0") : gorroPiel(k, ["#6a4a30", "#4a3a2a", "#8a6a4a"][i % 3]));
EXT.forEach((k, i) => i % 2 ? gorroPiel(k, "#5a4030") : gorroTejido(k, ["#c9a040", "#7a3a6a"][i % 2], "#ffffff"));
// farolito de mano
const LINTERNA = new THREE.Group(); { part(RB(.26, .34, .26, .03), new THREE.MeshStandardMaterial({ color: "#ffe0a0", emissive: "#ffb050", emissiveIntensity: 2 }), 0, -.4, .1, LINTERNA, 0); part(new THREE.TorusGeometry(.1, .015, 6, 12), SM("#2a2a2a"), 0, -.18, .1, LINTERNA, 0) }
const LINT_GL = glowSprite("#ffb060", 2); LINT_GL.visible = false;

//@@LUGAR
const ADENTRO_L = () => [I.ilse, I.fences, I.mila, I.badcold, I.out, I.lit, I.shook, I.window, I.roof, I.saw, I.stopped, I.morning];
const LUGAR = L => (L >= I.brask && L <= I.back) ? "recuerdo" : ADENTRO_L().includes(L) ? "adentro" : "pueblo";
const ALT = (x, z) => ((x / SB) ** 2 + (z / SA) ** 2 < 1) ? SY(x, z) : 0;   // altura del piso (loma o valle)
const placeW = (k, x, z, ry = 0) => { k.g.visible = true; k.g.position.set(x, ALT(x, z), z); k.g.rotation.set(0, ry, 0) };
const IN = o => [600 + o[0], 200 + o[1], 600 + o[2]];
const placeIn = (k, x, y, z, ry = 0) => { k.g.visible = true; k.g.position.set(600 + x, 200 + y, 600 + z); k.g.rotation.set(0, ry, 0) };
const PINO = [16, 44], MONTE = [-30, 48, -220], LINDE = [0, 0, -78];
// el monte del Watcher (más cerca que la cordillera): un cono nevado donde está su cornisa
{ const geo = new THREE.ConeGeometry(100, 90, 14, 6), p = geo.attributes.position, r = rng(1600); for (let i = 0; i < p.count; i++) { const kk = 1 + (r() - .5) * .2; p.setX(i, p.getX(i) * kk); p.setZ(i, p.getZ(i) * kk) } geo.computeVertexNormals(); part(geo, new THREE.MeshStandardMaterial({ map: T_NIEVE.c, bumpMap: T_NIEVE.z, bumpScale: 6, roughness: .9 }), -30, 45, -262, scene, 0) }
// el ojo enorme que se asoma por la ventana, y el cuerno que rompe el techo
const OJO = new THREE.Group(); scene.add(OJO); { part(new THREE.SphereGeometry(3.4, 40, 28), M_PELO_C, 0, 0, 1.6, OJO, 0); const o = part(new THREE.SphereGeometry(1.25, 32, 24), new THREE.MeshStandardMaterial({ color: "#a8bcc8", emissive: "#7fa8c8", emissiveIntensity: .5, roughness: .12 }), 0, 0, -1.9, OJO, 0); OJO.userData.ojo = o; part(new THREE.CircleGeometry(.62, 32), SM("#5a7a8a", { roughness: .2 }), 0, 0, -3.155, OJO, 0).rotation.y = Math.PI; part(new THREE.CircleGeometry(.26, 24), SM("#06090c", { roughness: .1 }), 0, 0, -3.16, OJO, 0).rotation.y = Math.PI;
  for (const s of [-1, 1]) { const p = part(new THREE.TorusGeometry(1.35, .35, 10, 30, Math.PI), M_PELO_C, 0, s * .1, -1.9, OJO, 0); p.rotation.set(0, Math.PI, s > 0 ? 0 : Math.PI); OJO.userData[s > 0 ? "sup" : "inf"] = p } } OJO.visible = false;
const ASTA_T = new THREE.Group(); CASA_IN.add(ASTA_T); { const cu = new THREE.CatmullRomCurve3([[6, 14, 4], [4, 10, 2.4], [2.6, 7.4, 1], [1.8, 5.6, .2]].map(q => new THREE.Vector3(...q))); part(new THREE.TubeGeometry(cu, 20, .45, 10), M_ASTA, 0, 0, 0, ASTA_T, 0); const c2 = new THREE.CatmullRomCurve3([[3.4, 9.2, 1.8], [2.4, 9.8, 3.2], [1.6, 9.6, 4]].map(q => new THREE.Vector3(...q))); part(new THREE.TubeGeometry(c2, 10, .25, 8), M_ASTA, 0, 0, 0, ASTA_T, 0) } ASTA_T.visible = false;
// el pino que cortó Brask (en el recuerdo)
const PINO_B = new THREE.Group(); scene.add(PINO_B); PINO_B.position.set(2, 0, -42.5); { part(new THREE.CylinderGeometry(.5, .8, 16, 12), M_CORTEZA_P, 0, 8, 0, PINO_B, 0); for (let k = 0; k < 4; k++) { const rr = 5 - k * 1, hh = 6 - k * .6, y = 5 + k * 3.4; part(GEO_PISO, M_AGUJAS, 0, y, 0, PINO_B, 0).scale.set(rr, hh, rr); part(GEO_CAPNIEVE, M_NIEVE_P, 0, y + hh * .1, 0, PINO_B, 0).scale.set(rr * .92, hh * .8, rr * .92) } }
const ASTILLAS = Array.from({ length: 24 }, () => { const m = part(new THREE.BoxGeometry(.08, .03, .2), SM("#d8b888"), 0, 0, 0, scene, 0); m.visible = false; return m });

//@@SHOTS
const TW = v => () => TURT.localToWorld(new THREE.Vector3(...v)).toArray();
const TS = (x, dy, z) => TW([x, SY(x, z) + dy, z]);
const GW = (x, dy, z) => () => [x, ALT(x, z) + dy, z];
const KW = (k, o) => () => add(k.g.getWorldPosition(new THREE.Vector3()).toArray(), o);
const OW = (obj, o) => () => { obj.updateMatrixWorld(true); return obj.localToWorld(new THREE.Vector3(...o)).toArray() };
const CW = (o = [0, 0, 0]) => () => { WATCHER.G.updateMatrixWorld(true); return WATCHER.cabeza.localToWorld(new THREE.Vector3(...o)).toArray() };
const INF = o => () => IN(o);
const SHOTS = {
  [I.hook]: [sh(0, [-2, 6, 52], [-.5, 5.4, 51], [14, 7, 44], [17, 4, 44.5], 56)],
  [I.stood0]: [sh(0, [-40, 20, -60], [-41, 21, -64], CW([0, -8, 0]), CW([0, -6, 0]), 34)],
  [I.rule]: [sh(0, [-72, 56, 72], [-62, 50, 62], TS(0, 4, 0), TS(0, 4, 0), 50)],
  [I.cost]: [sh(0, [2, 7, -50], [2, 8, -53], CW([0, -6, 0]), CW([0, -4, 0]), 56, { shake: .15 })],
  [I.valley]: [sh(0, [120, 64, 150], [104, 58, 132], [0, 10, 0], [0, 10, 0], 46)],
  [I.burn]: [shF(0, FOLK[2], 2.4, 2.0, .6, .1, 62)],
  [I.sleds]: [sh(0, TS(1.4, 2.4, 30.5), TS(1.0, 2.5, 29.5), TS(0, 1.2, 21), TS(0, 1.2, 23), 58)],
  [I.watch]: [sh(0, TS(-12, 2.5, -24), TS(-12.4, 2.8, -26), [0, 36, -78], [0, 36, -78], 50)],
  [I.antlers]: [sh(0, [-8, 42, -48], [-5, 44, -51], CW([0, 12, 0]), CW([0, 12, 0]), 54)],
  [I.eyes]: [sh(0, [-8, 24, -28], [-8, 25, -31], CW([0, .7, 2]), CW([0, .7, 2]), 24)],
  [I.lantern]: [shF(0, FOLK[1], 2.2, 1.9, -.6, .1, 62)],
  [I.ilse]: [shF(0, GARROW, 2.2, 1.9, .5, .1, 60)],
  [I.brask]: [sh(0, [12, 4, -32], [11.4, 3.8, -33], [4, 4, -40], [4, 4, -40], 58)],
  [I.quiet]: [sh(0, [0, 7, -46], [0, 7.5, -50], [0, 9, -95], [0, 9, -95], 50)],
  [I.shaking]: [sh(0, TS(0, 2.4, 3.5), TS(.3, 2.6, 4.5), TS(-6.8, 4.5, 9), TS(-6.8, 4.5, 9), 58, { shake: .25 })],
  [I.taller]: [sh(0, TS(5, 1.6, -28), TS(4.6, 1.4, -27), [0, 40, -50], [0, 44, -48], 60, { shake: .12 })],
  [I.stepped]: [sh(0, [-14, 26, -40], [-12, 24, -38], TS(6.8, 3, -18), TS(6.8, 2, -18), 52, { shake: .2 })],
  [I.back]: [sh(0, TS(9, 3, -27), TS(9.4, 3.4, -25), [5, 28, -52], [4, 26, -62], 54)],
  [I.stump]: [sh(0, TS(-.4, 2.0, 5.0), TS(-.9, 1.8, 4.2), TS(-2.6, .9, 2.2), TS(-2.6, .9, 2.2), 56)],
  [I.doors]: [sh(0, OW(CASAS[4].g, [1.4, 3.4, 5.6]), OW(CASAS[4].g, [.9, 3.3, 4.8]), OW(CASAS[4].g, [0, 3.3, 3.3]), null, 50)],
  [I.winter]: [sh(0, [-40, 30, 52], [-36, 28, 46], TS(0, 6, 0), TS(0, 6, 0), 54)],
  [I.buried]: [sh(0, [-25.6, 1.7, 26.4], [-26, 1.5, 26.8], [-28, .2, 28.4], null, 56)],
  [I.fences]: [sh(0, INF([1.4, 2.2, 1.4]), INF([.8, 2.0, .6]), INF([-3, .9, -3.7]), null, 58)],
  [I.mila]: [sh(0, INF([1.3, 2.0, -2.0]), INF([1.6, 1.9, -2.4]), INF([3.6, 1.3, -3.0]), null, 52)],
  [I.badcold]: [shF(0, GARROW, 1.8, 1.6, -.4, 0, 64)],
  [I.out]: [sh(0, INF([-1.2, 1.4, -1.2]), INF([-1.8, 1.2, -2.0]), INF([-3, .8, -3.8]), null, 56), sh(4, INF([1.4, 2.0, -1.8]), INF([1.7, 1.9, -2.2]), INF([3.6, 1.3, -3.0]), null, 50)],
  [I.axe]: [shF(0, ME, 2.2, 1.9, .5, .1, 62)],
  [I.oldest]: [sh(0, [8.8, 3.4, 29], [10.2, 3.2, 33], [16, 10, 44], [16, 8, 44], 56)],
  [I.swing]: [sh(0, [12.2, 2.3, 39.6], [12.6, 2.2, 40.0], [14.6, 1.6, 42.2], null, 48)],
  [I.fell]: [sh(0, [7, 4.5, 35], [7.5, 4.0, 36], [16, 10, 44], [22, 2, 46], 56)],
  [I.calf]: [sh(0, [14.2, 2.4, 41.6], [14.7, 2.1, 42.4], [16, 1.3, 44], null, 48)],
  [I.baby]: [shF(0, ME, 1.6, 1.4, .3, 0, 66)],
  [I.stood]: [sh(0, [-70, 52, -180], [-66, 54, -186], CW([0, -8, 0]), CW([0, -4, 0]), 48)],
  [I.home]: [sh(0, TS(14, 3, 25), TS(13.4, 3, 24), KW(ME, [0, 1.4, 0]), null, 58)],
  [I.lit]: [sh(0, INF([0, 2.6, 2.2]), INF([.6, 2.4, 1.2]), INF([2.8, 1.1, -2.2]), null, 58)],
  [I.shook]: [sh(0, INF([2.4, 3.4, -2.4]), INF([2.6, 3.3, -2.8]), INF([4.4, 3.4, -4.6]), null, 56, { shake: .2 })],
  [I.window]: [sh(0, INF([0, 2.6, -2.4]), INF([0, 2.8, -1.4]), INF([0, 3, 5]), null, 58, { shake: .06 })],
  [I.roof]: [sh(0, INF([-2.2, 1.6, 1.6]), INF([-1.8, 1.5, 1.2]), INF([2.2, 6.6, 1]), null, 64, { shake: .15 })],
  [I.saw]: [sh(0, INF([4.8, 2.4, -3.8]), INF([4.4, 2.3, -3.2]), INF([0, 3, 5]), null, 54)],
  [I.stopped]: [sh(0, INF([0, 2.7, -1.6]), INF([0, 2.8, -.8]), INF([0, 3, 7]), null, 44)],
  [I.lay]: [sh(0, [-12, 34, 40], [-10, 30, 36], TS(10, 4, 19), TS(10, 4, 19), 52)],
  [I.breath]: [sh(0, [2, 22, 36], [3, 20, 33], CW([0, -1, 6]), CW([0, 1, 9]), 56)],
  [I.morning]: [sh(0, INF([3.0, 2.2, .6]), INF([3.2, 2.1, .1]), INF([3.6, 1.8, -2.2]), null, 54)],
  [I.gone]: [sh(0, [11, 3.4, 37], [11.6, 3.2, 38], [16, 1, 44], [16, 1, 44], 54)],
  [I.pile]: [sh(0, TS(-4.6, 4, 27.5), TS(-4.2, 4.6, 26.5), TS(2.2, 4, 18), TS(2.2, 6, 18), 58)],
  [I.last]: [sh(0, TS(.4, 2.4, 22.5), [-34, 40, 66], TS(3, 2, 18), TS(3, 2, 18), 54)],
};

//@@ESCENA
// ---------- la escena en cada instante
function setScene(t) {
  const L = lineAt(t), lt = t - s(L), len = (S[L + 1] ?? DUR) - s(L), k = P(lt, 0, len), Wd = kk => wt(L, kk);
  POST = { flash: 0, sepia: 0 };
  if (!ENV.nieve) { ENV.nieve = { top: "#0c1630", hor: "#4a5a7c", fog: .0045, hemi: 1.05, hemiG: "#d0dcf0", sun: 1.7, sunCol: "#b0c4f0", exp: 1.55, grade: ["#ffffff", 0] }; ENV.casa = { top: "#0c1630", hor: "#1a1e2a", fog: .002, hemi: .95, hemiG: "#3a2a20", sun: .2, sunCol: "#a8b8e0", exp: 1.9, grade: ["#ffffff", 0] }; ENV.alba = { top: "#7a9ad0", hor: "#f0d8c8", fog: .004, hemi: 1.3, hemiG: "#d8e0f0", sun: 2.4, sunCol: "#ffd8b0", exp: 1.25, grade: ["#ffffff", 0] } }
  ALL.forEach(c => { if (c.polvo) c.polvo.forEach(q => q.visible = false); c.body.rotation.z = 0; c.head.rotation.z = 0; c.g.visible = false; c.g.scale.set(1, 1, 1); c.body.rotation.set(0, 0, 0); c.body.position.y = 0; c.head.rotation.set(0, 0, 0); power(c, null, 0); c.aura.visible = false; setFace(c, "neutral"); pose(c, t, {}) });
  [PALA, REGLA, TELESC, HOYO, HACHA, TRINEO, LINTERNA].forEach(o => o.visible = false); LINT_GL.visible = false; sinCiervos(); OJO.visible = false; ASTA_T.visible = false; PILA.visible = false; ASTILLAS.forEach(a => a.visible = false);
  const lugar = LUGAR(L), manana = L >= I.morning && L <= I.pile; setEnv(lugar === "adentro" ? "casa" : manana ? "alba" : "nieve"); if (lugar === "recuerdo") POST.sepia = .42;
  HOUSES.forEach(H => { H.panes.forEach(p => p.emissiveIntensity = manana ? 0 : 1.2); H.glows.forEach(g => g.visible = !manana) });
  FAROLES.forEach(f => { f.userData.gl.position.copy(f.localToWorld(new THREE.Vector3(0, 3.2, 0))); f.userData.gl.visible = !manana });
  tortuga(t, { paso: 0 }); noche(t, !manana && lugar !== "adentro"); LUCES.forEach(l => l.visible = false); ESTRELLAS.visible = !manana;
  CASAS[1].g.visible = true; CASAS[1].g.scale.set(1, 1, 1); CASAS[1].g.position.set(CASAS[1].lx, SY(CASAS[1].lx, CASAS[1].lz) - .3, CASAS[1].lz); CASAS[1].g.rotation.set(0, -Math.PI / 2, 0); if (L > I.stepped && L <= I.back) CASAS[1].g.scale.set(1, .15, 1.2);
  // el pino viejo: parado hasta el hook; cae en «hook» y en «fell»; después queda acostado
  { const tr = VIEJO.userData.tronco, cae = L === I.hook ? eIO(P(k, .15, .95)) : L === I.fell ? eIO(P(k, 0, .6)) : (L > I.fell || L === I.stood0) ? 1 : (L >= I.oldest && L <= I.swing) ? 0 : 0; tr.rotation.set(0, 0, -cae * 1.5); tr.position.set(cae * 1.2, 1.2 * (1 - cae), 0); VIEJO.userData.tapa.visible = cae > .05; if ((L === I.swing) && Math.sin(t * 7) > .7) tr.rotation.z = -.01 }
  const crowd = list => list.forEach(([c, x, z, ry, f = "neutral", walk = 0]) => { placeW(c, x, z, ry); setFace(c, f); if (walk >= 1.2) { const d = Math.min(lt * 3.2, 9), nx = x + Math.sin(ry) * d, nz = z + Math.cos(ry) * d; placeW(c, nx, nz, ry); correr(c, t + x * 3) } else if (walk > 0) { const d = (lt - len / 2) * 1.5 * walk, nx = x + Math.sin(ry) * d, nz = z + Math.cos(ry) * d; placeW(c, nx, nz, ry); pose(c, t + x, { walk }); c.body.rotation.z = Math.sin((t + x) * 8) * .045 } else pose(c, t + x, { walk }) });
  let LL = [];
  // nieve que cae alrededor de la cámara (más fuerte en «winter», nada en «quiet» ni a la mañana)
  copos(t, cam.position, L === I.quiet || manana ? 0 : L === I.winter ? 1.6 : 1); COPOS.material.size = L === I.winter ? .7 : .5;
  // el Watcher según la frase
  const W = WATCHER, eyeL = []; const enMonte = (subir) => ciervoPose(W, t, { x: MONTE[0], y: MONTE[1], z: MONTE[2], ry: .15, echado: 1 - subir, sube: subir * .6 });
  if (L === I.stood0) enMonte(eIO(k)); if (L === I.stood) enMonte(eIO(P(k, 0, .7)));
  if (L === I.cost) ciervoPose(W, t, { x: 0, y: 0, z: -92 + k * 8, paso: 1, baja: .2 });
  if (L >= I.watch && L <= I.lantern) ciervoPose(W, t, { x: LINDE[0], y: 0, z: LINDE[2], baja: .1, gira: Math.sin(t * .3) * .2 });
  if (L === I.quiet) ciervoPose(W, t, { x: 0, y: 0, z: -110, echado: .2 });
  if (L === I.shaking) ciervoPose(W, t, { x: 0, y: 0, z: -70 + k * 4, paso: 1 });
  if (L === I.taller) ciervoPose(W, t, { x: 1, y: 0, z: -62 + k * 10, paso: 1, sube: .2 });
  if (L === I.stepped) ciervoPose(W, t, { x: 6, y: 0, z: -44 + k * 3, paso: .6, baja: .5 });
  if (L === I.back) ciervoPose(W, t, { x: 5, y: 0, z: -46 - k * 14, ry: Math.PI, paso: 1 });
  if (L === I.home) ciervoPose(W, t, { x: -20, y: 20, z: -150 + k * 20, paso: 1.2, ry: .2 });
  if (L === I.lay || L === I.breath) ciervoPose(W, t, { x: 17, y: ALT(17, 20) - 1, z: 20, ry: -.4, echado: 1, gira: L === I.breath ? .5 : .2, baja: .3, aliento: L === I.breath ? 1 : .4 });
  if (L === I.last) ciervoPose(W, t, { x: 6, y: 0, z: 82, ry: Math.PI, baja: .1 });
  // el ojo en la ventana y el cuerno en el techo
  if ([I.window, I.saw, I.stopped].includes(L)) { OJO.visible = true; OJO.position.set(...IN([0, 3, 7.5 - (L === I.window ? eOut(k) * 1.2 : 1.2)])); const parp = L === I.stopped && k > .5 ? P(k, .5, .8) * .6 : 0; OJO.userData.sup.rotation.x = parp; OJO.userData.ojo.material.emissiveIntensity = L === I.stopped ? .7 - k * .4 : .7 }
  if (L >= I.roof && L <= I.stopped) { ASTA_T.visible = L !== I.stopped || k < .5; CASA_IN.userData.agujero.visible = true; if (L === I.roof) ASTA_T.position.y = (1 - eOut(P(k, 0, .4))) * 3 } else CASA_IN.userData.agujero.visible = L > I.roof && L < I.gone;
  // fuego de la chimenea: bajo, apagado, prendido
  fuegoChimenea(t, L === I.ilse ? .6 : L === I.fences ? .8 : (L === I.mila || L === I.badcold || L === I.out) ? 0 : (L >= I.lit && L <= I.morning) ? 1 : 0);
  if (lugar === "adentro") { const fa = (L === I.mila || L === I.badcold || L === I.out) ? 0 : 1; LL.push([IN([-3, 1.4, -3]), 3.2 * fa * (.85 + .15 * Math.sin(t * 13)), "#ff9a40", 14]); LL.push([IN([0, 4, 5.6]), L === I.window || L === I.saw || L === I.stopped ? 2.5 : .9, "#bfe6ff", 10]) }
  if ([I.fell, I.calf, I.baby, I.swing].includes(L)) LL.push([[14, 5, 40], 2.4, "#bcd4ff", 16]);
  if (lugar !== "adentro" && !manana) FAROLES.forEach(f => LL.length < 4 && LL.push([f.localToWorld(new THREE.Vector3(0, 3.2, 0)).toArray(), 2.4, "#ffb060", 12]));
  // tazas que se caen del estante
  CASA_IN.userData.tazas.forEach((c, i) => { const q = L === I.shook ? P(k, .25 + i * .1, .55 + i * .1) : L > I.shook ? 1 : 0; c.position.set(3.6 + i * .5 + q * .3, 3.62 - q * q * 3.5 + (L === I.shook && q === 0 ? Math.abs(Math.sin(t * 30 + i)) * .03 : 0), -4.6 + q * .8); c.rotation.set(q * 2, 0, q * 1.4) });
  // la cría: en el hueco del pino, después en los brazos, después en la cama al lado de Mila
  const cria = (x, y, z, ry = 0, eche = 1, tiembla = 0) => ciervoPose(CRIA, t, { x, y, z, ry, echado: eche, tiembla, baja: .4 });
  if (L === I.fell && k > .6 || L === I.calf || L === I.baby) cria(PINO[0], 1.0, PINO[1] + .2, -2.4, 1, 1);
  if ([I.lit, I.shook, I.window, I.roof, I.saw, I.stopped].includes(L)) { const p = IN([3.2, 1.05, -1.4]); cria(p[0], p[1], p[2], Math.PI, 1, L === I.lit ? .5 : 0) }

  switch (L) {
    case I.hook: case I.swing: { placeW(ME, 14.4, 42.0, 1.0); ME.g.visible = true; setFace(ME, L === I.hook ? "terrified" : "determined"); attach(HACHA, ME, "R", [0, -.2, .2]); const sw = Math.sin(t * (L === I.hook ? 3 : 6)); pose(ME, t, { armFwd: 1.2 + sw * .6 }); ME.body.rotation.x = .2 + sw * .12; HACHA.rotation.set(.3 + sw * .5, 0, 0);
      if (L === I.swing) ASTILLAS.forEach((a, i) => { const q = (t * 1.5 + i / 24) % 1; a.visible = true; a.position.set(15.4 + q * (Math.sin(i) * 2), 1.4 + q * 2 - q * q * 3, 43 + q * Math.cos(i * 1.7) * 2); a.rotation.set(q * 9, i, q * 5) }); break }
    case I.stood0: placeW(ME, 14.4, 42.0, 1.0); setFace(ME, "horrified"); attach(HACHA, ME, "R", [0, -.2, .2]); break;
    case I.rule: case I.valley: crowd([[FOLK[0], -1.6, -6, .4, "neutral", .8], [FOLK[3], 1.8, 6, Math.PI, "neutral", .8], [EXT[2], -6, 1.4, 1.6, "neutral", .8]]); break;
    case I.burn: crowd([[FOLK[2], -1.4, 8, Math.PI - .3, "neutral", .6]]); attach(TRINEO, FOLK[2], "R", [0, -.9, .6]); TRINEO.rotation.set(0, Math.PI, 0); pose(FOLK[2], t, { armFwd: .5, walk: .6 }); break;
    case I.sleds: crowd([[ME, -.8, 22, 0, "neutral", .9], [ME6, .8, 21, 0, "happy", .9], [EXT[0], 2.2, 19.5, .1, "happy", .9], [EXT[3], -2.2, 20, -.1, "neutral", .9]]); attach(TRINEO, ME, "R", [0, -1.0, -.8]); TRINEO.rotation.set(0, 0, 0); break;
    case I.watch: case I.antlers: case I.eyes: crowd([[FOLK[0], .6, -12, Math.PI, "worried"], [FOLK[4], -1.2, -13, Math.PI - .2, "scared"]]); break;
    case I.lantern: crowd([[FOLK[1], -1.5, -24.5, Math.PI, k > .55 ? "terrified" : "scared"]]); attach(LINTERNA, FOLK[1], "R", [0, -.2, .3]); pose(FOLK[1], t, { armFwd: .7 }); { const gl = P(k, .55, .75); LINT_GL.visible = gl < 1; LINT_GL.position.copy(LINTERNA.getWorldPosition(V3)); LINT_GL.material.opacity = .7 * (1 - gl); LINTERNA.children[0].material.emissiveIntensity = 2 * (1 - gl) } break;
    case I.buried: TRINEO.visible = true; if (TRINEO.parent !== scene) scene.add(TRINEO); TRINEO.position.set(-28, -.42, 28.4); TRINEO.rotation.set(.25, .6, .1); break;
    case I.ilse: case I.fences: case I.badcold: placeIn(GARROW, -1.4, 0, -1.6, -2.4); GARROW.g.visible = true; setFace(GARROW, L === I.badcold ? "worried" : L === I.fences ? "sad" : "neutral"); pose(GARROW, t, { sit: L === I.ilse ? .5 : 0, armFwd: L === I.fences ? .8 : 0 }); if (L === I.ilse) GARROW.g.position.y -= .25;
      if (L !== I.ilse) { placeIn(ME6, 3.6, 1.35, -2.2, 0); ME6.body.rotation.x = -Math.PI / 2 + .05; setFace(ME6, "sleepy") } break;
    case I.mila: case I.out: placeIn(ME6, 3.6, 1.35, -2.2, 0); ME6.body.rotation.x = -Math.PI / 2 + .05; setFace(ME6, "sleepy"); placeIn(GARROW, 2.0, 0, -4.1, Math.PI / 2); setFace(GARROW, "worried"); pose(GARROW, t, { armFwd: .5 }); break;
    case I.axe: crowd([[ME, 2.4, 22.4, -2.2, "determined"]]); attach(HACHA, ME, "R", [0, -.2, .2]); pose(ME, t, { lift: .3 }); break;
    case I.oldest: { const q = eIO(k); placeW(ME, lerp(11, 14.4, q), lerp(34, 42, q), .5); ME.g.visible = true; setFace(ME, "determined"); attach(HACHA, ME, "R", [0, -.2, .2]); pose(ME, t, { walk: 1 }); break }
    case I.fell: case I.calf: placeW(ME, 14.0, 41.0, .8); setFace(ME, L === I.calf ? "shock" : "scared"); attach(HACHA, ME, "R", [0, -.2, .2]); break;
    case I.baby: placeW(ME, 14.0, 41.0, .8); setFace(ME, "shock"); break;
    case I.stood: break;
    case I.brask: placeW(PIM, 6.2, -37.8, -2.4); setFace(PIM, "determined"); attach(HACHA, PIM, "R", [0, -.2, .2]); { const sw = Math.sin(t * 6); pose(PIM, t, { armFwd: 1.2 + sw * .6 }); PIM.body.rotation.x = .2 + sw * .12; HACHA.rotation.set(.3 + sw * .5, 0, 0) } break;
    case I.quiet: case I.shaking: crowd([[FOLK[3], 1.4, -8, Math.PI, "scared"], [EXT[1], -1, -10, Math.PI, "terrified"]]); break;
    case I.taller: case I.stepped: crowd([[FOLK[3], .8, -4, 0, "panic", 1.4], [EXT[1], -.8, -6, 0, "panic", 1.4]]); break;
    case I.home: { const q = eOut(k); placeW(ME, lerp(12, 4.5, q), lerp(30, 20, q), -2.5); ME.g.visible = true; setFace(ME, "panic"); correr(ME, t); const p = KW(ME, [0, 1.6, .5])(); ciervoPose(CRIA, t, { x: p[0], y: p[1] - .5, z: p[2], ry: -2.5, echado: 1 }); break }
    case I.lit: case I.shook: case I.window: case I.roof: case I.saw: case I.stopped:
      placeIn(ME6, 3.6, 1.35, -2.2, 0); ME6.body.rotation.x = -Math.PI / 2 + .05; setFace(ME6, L === I.lit ? "sleepy" : "scared"); placeIn(ME, -.6, 0, -2.8, Math.PI); setFace(ME, { [I.lit]: "worried", [I.shook]: "terrified", [I.window]: "horrified", [I.roof]: "terrified", [I.saw]: "scared", [I.stopped]: "shock" }[L]); if (L >= I.window) ME.g.rotation.y = 0;
      placeIn(GARROW, -.6, 0, -2.6, .6); setFace(GARROW, L >= I.shook ? "terrified" : "worried"); pose(GARROW, t, { cover: L >= I.window ? .6 : 0 }); break;
    case I.lay: case I.breath: break;
    case I.morning: placeIn(ME6, 3.6, 1.0, -2.2, 0); setFace(ME6, "laugh"); pose(ME6, t, { sit: 1, laugh: 1 }); ME6.g.position.y += .55; placeIn(ME, 2.0, 0, -1.4, 1.2); setFace(ME, "happy"); placeIn(GARROW, 1.0, 0, -2.6, 1.4); setFace(GARROW, "relieved"); break;
    case I.gone: break;
    case I.pile: PILA.visible = true; PILA.position.set(1.6, ALT(1.6, 18), 18); PILA.scale.setScalar(1.25); crowd([[ME, -.4, 19.6, Math.PI / 2 + .4, "shock"], [ME6, -.6, 18.2, Math.PI / 2, "excited"]]); break;
    case I.last: PILA.visible = true; PILA.position.set(1.6, ALT(1.6, 18), 18); PILA.scale.setScalar(1.25); crowd([[ME, .2, 20.6, .3, "warm"], [ME6, -.8, 20.2, .2, "happy"]]); break;
  }
  if (L === I.stood0) { const p = TS(-6, 0, -24)(); }
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

