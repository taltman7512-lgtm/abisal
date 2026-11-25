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
  g.fillStyle = "#46463f"; g.fillRect(0, 0, w, h);
  const S = []; for (let k = 0; k < 5; k++) S.push([(r() - .5) * 2, -24 + k * 12 + (r() - .5) * 2]);
  for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) S.push([sx * (12 + r() * 2), -18 + k * 12 + (r() - .5) * 3]);
  for (let k = 0; k < 26; k++) { const a = k / 26 * 6.28 + r() * .08; S.push([Math.cos(a) * SB * .9, Math.sin(a) * SA * .92]) }
  const P = S.map(([x, z]) => [X(x), Z(z)]), cerca = (x, y) => { let b = 0, bd = 1e12; P.forEach(([px, py], i) => { const d = (x - px) ** 2 + (y - py) ** 2; if (d < bd) { bd = d; b = i } }); return b };
  const fuera = (x, y) => ((x / w - .5) / .5) ** 2 + ((y / h - .5) / .5) ** 2 > 1.04;
  P.forEach(([px, py], i) => { const pts = []; for (let k = 0; k < 40; k++) { const a = k / 40 * 6.28; let d = 4; while (d < 700) { const x = px + Math.cos(a) * d, y = py + Math.sin(a) * d; if (cerca(x, y) !== i || fuera(x, y)) break; d += 6 } pts.push([px + Math.cos(a) * Math.max(4, d - 8), py + Math.sin(a) * Math.max(4, d - 8)]) }
    const tono = ["#6e6c64", "#5e5c56", "#7a786e", "#54524c", "#686660", "#73706a"][r() * 6 | 0];
    aMano(g, pts, r, 14); const gr = g.createRadialGradient(px - 20, py - 20, 10, px, py, 260); gr.addColorStop(0, rgbj("#9a988c", r, 26)); gr.addColorStop(1, rgbj(tono, r, 20)); g.fillStyle = gr; g.fill();
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
  { const ix = geo.index.array, keep = [], dentro = i => (p.getX(i) / SB) ** 2 + (p.getZ(i) / SA) ** 2 < 1 && (p.getX(i) ** 2 + (p.getZ(i) - 1.5) ** 2) > 1.52 ** 2; for (let k = 0; k < ix.length; k += 3) if (dentro(ix[k]) && dentro(ix[k + 1]) && dentro(ix[k + 2])) keep.push(ix[k], ix[k + 1], ix[k + 2]); geo.setIndex(keep) }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, M_CAPA); m.castShadow = m.receiveShadow = true; TURT.add(m);
  // el costado del caparazón hasta el agua, con el borde aserrado y percebes
  { const tapa = new THREE.Mesh(new THREE.RingGeometry(.985, 1.06, 96, 1), SMt(T_LADO, { roughness: .9 })); tapa.rotation.x = -Math.PI / 2; tapa.scale.set(SB, SA, 1); tapa.position.y = RIM + .02; tapa.receiveShadow = true; TURT.add(tapa) }   // el borde, entre el óvalo y el costado
  const lado = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.08, 9, 64, 1, true), SMt(T_LADO, { roughness: .9, bumpMap: T_LADO, bumpScale: 2 })); lado.scale.set(SB, 1, SA); lado.position.y = RIM - 4.4; lado.castShadow = true; TURT.add(lado);
  const bor = new THREE.InstancedMesh(new THREE.ConeGeometry(1.4, 2.4, 4), SM("#3a3220", { roughness: 1 }), 48); TURT.add(bor); for (let k = 0; k < 48; k++) { const a = k / 48 * Math.PI * 2; dummy.position.set(Math.cos(a) * SB * 1.04, RIM - .4, Math.sin(a) * SA * 1.04); dummy.rotation.set(Math.PI / 2 + .3, 0, -a + Math.PI / 2); dummy.scale.setScalar(1); dummy.updateMatrix(); dummy.lookAt(Math.cos(a) * 99, RIM - 2, Math.sin(a) * 99); dummy.updateMatrix(); bor.setMatrixAt(k, dummy.matrix) }
  const perc = new THREE.InstancedMesh(GEO_PERCEBE, M_PERCEBE, 420); TURT.add(perc); const r = rng(96); for (let k = 0; k < 420; k++) { const a = r() * Math.PI * 2, y = RIM - 1 - r() * 7; dummy.position.set(Math.cos(a) * SB * (1.02 + (RIM - y) * .008), y, Math.sin(a) * SA * (1.02 + (RIM - y) * .008)); dummy.rotation.set(0, 0, 0); dummy.lookAt(dummy.position.x * 2, y, dummy.position.z * 2); dummy.rotateX(Math.PI / 2 + (r() - .5) * .4); dummy.scale.setScalar(.8 + r() * 1.6); dummy.updateMatrix(); perc.setMatrixAt(k, dummy.matrix) } }
// ---------- relieve de verdad en el piso (pedido del dueño: nada dibujado plano): empedrado 3D en las calles, piedritas y
// terrones sueltos en la tierra. Cada piedra es un canto irregular distinto (geometría deformada), con su color y su sombra.
const PISO_LIBRE = [[0, 1.5, 2.3], [-9, 2, 2.6], [-12, -11.5, 2.6], [2.4, -2.5, 1.2], [-9, -2.6, 1.6], [13.2, 2, 2], [13, -6, 2.2]];
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
cartelito(PANADERIA, "BAKERY"); cartelito(ESCUELA, "SCHOOL", "#2a3a5a"); cartelito(CASAS[3], "TINKER", "#5a4a1a");
// la iglesia arriba de todo, con el campanario de Garrow
const IGLESIA = new THREE.Group(); enConcha(IGLESIA, 0, -14, Math.PI, -.4);
{ part(new THREE.BoxGeometry(7.6, 8, 11.6), M_STONE, 0, -3.8, 0, IGLESIA, 0); part(new THREE.BoxGeometry(3.8, 8, 3.8), M_STONE, 0, -3.8, 6, IGLESIA, 0); part(new THREE.BoxGeometry(7, 7, 11), M_STONE, 0, 3.5, 0, IGLESIA, 0); const half = 4.0, rh = 3.4, sl = Math.hypot(half, rh), a = Math.atan2(rh, half); for (const s of [-1, 1]) { const m = part(new THREE.BoxGeometry(sl, .25, 11.6), M_SHING, s * half / 2, 7 + rh / 2, 0, IGLESIA, 0); m.rotation.z = -s * a }
  const tw = new THREE.Group(); tw.position.set(0, 0, 6); IGLESIA.add(tw); part(new THREE.BoxGeometry(3.2, 10, 3.2), M_STONE, 0, 5, 0, tw, 0); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) part(new THREE.BoxGeometry(.35, 3, .35), M_BEAM, a * 1.4, 11.5, b * 1.4, tw, 0); part(new THREE.BoxGeometry(3.6, .3, 3.6), M_BEAM, 0, 13.1, 0, tw, 0); part(new THREE.ConeGeometry(2.4, 6, 4), M_SHING, 0, 16, 0, tw, 0).rotation.y = Math.PI / 4;
  part(new THREE.BoxGeometry(1.6, 2.8, .2), M_PLANK, 0, 1.4, 1.62, tw, 0); 
  const campana = part(new THREE.CylinderGeometry(.5, .9, 1.3, 18, 1, true), SM("#b8893a", { metalness: .8, roughness: .3, side: THREE.DoubleSide }), 0, 11.5, 0, tw, 0); IGLESIA.userData.campana = campana; IGLESIA.userData.torre = tw;
  for (const s of [-1, 1]) part(new THREE.BoxGeometry(.6, 1.2, .2), M_PLANK, s * 2.3, 4.2, 5.52, IGLESIA, 0) }
const ESCALONES = []; for (let k = 0; k < 3; k++) ESCALONES.push(part(new THREE.BoxGeometry(3.4 - k * .4, .3, 1), M_STONE, 0, .15 + k * .3, 8.1 - k * .5, IGLESIA, 0));
// la plaza con el cartel de la regla
const CARTEL = new THREE.Group(); enConcha(CARTEL, 3.2, 3.5, -.4);
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
enConcha(TAZAS, 2.6, 13.5, -Math.PI / 2, -.1);
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
  const pozo = new THREE.Group(); enConcha(pozo, -2.8, 1, .3); pozo.visible = false; part(new THREE.CylinderGeometry(.9, .95, .9, 20, 1, true), (() => { const m = M_STONE.clone(); m.side = THREE.DoubleSide; return m })(), 0, .45, 0, pozo, 0); part(new THREE.CircleGeometry(.85, 20), SM("#0e1a1c", { roughness: .1 }), 0, .5, 0, pozo, 0).rotation.x = -Math.PI / 2;
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

// ================= WRENMOOR: el pueblo sobre una roca en un lago frío =================
// la tortuga ya no existe: el caparazón es la roca (pintada de piedra gris con musgo); se esconden cabeza, aletas y cola
CABEZA.visible = false; ALETAS.forEach(a => a.piv.visible = false); COLA.visible = false;
// trama de tela para la utilería (la de los personajes se define más abajo)
const T_TRAMA = tex(256, 256, (g, w, h) => { g.fillStyle = "#808080"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 4) { g.fillStyle = y % 8 ? "rgba(255,255,255,.18)" : "rgba(0,0,0,.2)"; g.fillRect(0, y, w, 2) } for (let x = 0; x < w; x += 4) { g.fillStyle = x % 8 ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.15)"; g.fillRect(x, 0, 2, h) } }, [4, 4]);
const WELL = [0, 1.5], WY = () => SY(WELL[0], WELL[1]);
// ---------- el pozo grande de la plaza: brocal de piedras de verdad, techito, manivela, soga y balde, y un caño que baja hasta el lago
const T_PIEDRA_POZO = tex(1024, 512, (g, w, h) => { const r = rng(901); g.fillStyle = "#5a5650"; g.fillRect(0, 0, w, h);
  for (let fila = 0, y = 0; y < h; fila++) { const hh = 34 + r() * 26; let x = -(fila % 2) * 40; while (x < w) { const ww = 60 + r() * 70; const pts = [[x + 3, y + 3], [x + ww - 3, y + 2 + r() * 3], [x + ww - 2, y + hh - 3], [x + 2, y + hh - 2 - r() * 3]];
      aMano(g, pts, r, 5); const gr = g.createLinearGradient(x, y, x, y + hh); gr.addColorStop(0, rgbj("#9a968c", r, 30)); gr.addColorStop(1, rgbj("#6a665e", r, 24)); g.fillStyle = gr; g.fill(); g.strokeStyle = "rgba(20,18,14,.8)"; g.lineWidth = 5; g.stroke();
      for (let k = 0; k < 6; k++) { g.fillStyle = `rgba(${70 + r() * 40 | 0},${110 + r() * 40 | 0},${50 + r() * 20 | 0},${.25 + r() * .3})`; g.beginPath(); g.arc(x + r() * ww, y + hh - r() * 12, 3 + r() * 9, 0, 7); g.fill() } x += ww } y += hh }
  grietas(g, r, 40, w, h, "rgba(20,16,12,.5)") }, [3, 1]);
const M_POZO = SMt(T_PIEDRA_POZO, { roughness: .92, bumpMap: T_PIEDRA_POZO, bumpScale: 3, side: THREE.DoubleSide });
const POZO = new THREE.Group(); enConcha(POZO, WELL[0], WELL[1], 0, 0);
{ const br = new THREE.CylinderGeometry(1.75, 1.85, 1.15, 40, 4, true), p = br.attributes.position; for (let i = 0; i < p.count; i++) { const a = Math.atan2(p.getZ(i), p.getX(i)), k = 1 + Math.sin(a * 13) * .012 + Math.sin(a * 29 + 1) * .008; p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k) } br.computeVertexNormals();
  part(br, M_POZO, 0, .55, 0, POZO, 0); const inn = part(new THREE.CylinderGeometry(1.4, 1.4, 1.2, 40, 1, true), M_POZO, 0, .55, 0, POZO, 0);
  const tapa = part(new THREE.RingGeometry(1.38, 1.86, 40), SMt(T_PIEDRA_POZO, { roughness: .9, bumpMap: T_PIEDRA_POZO, bumpScale: 2 }), 0, 1.13, 0, POZO, 0); tapa.rotation.x = -Math.PI / 2;
  // caño hondo de piedra (para la toma que baja por adentro) y agua negra adentro
  const cano = part(new THREE.CylinderGeometry(1.4, 1.4, 34, 40, 8, true), (() => { const m = M_POZO.clone(); m.side = THREE.BackSide; m.map = T_PIEDRA_POZO.clone(); m.map.repeat.set(3, 14); m.map.wrapS = m.map.wrapT = THREE.RepeatWrapping; m.map.needsUpdate = true; return m })(), 0, -16.5, 0, POZO, 0); cano.receiveShadow = true;
  for (const s of [-1, 1]) { part(new THREE.BoxGeometry(.24, 2.9, .24), M_BEAM, s * 1.62, 2.4, 0, POZO, 0) }
  const eje = part(new THREE.CylinderGeometry(.12, .12, 3.4, 10), M_BEAM, 0, 3.4, 0, POZO, 0); eje.rotation.z = Math.PI / 2;
  const man = new THREE.Group(); man.position.set(1.8, 3.4, 0); POZO.add(man); part(new THREE.BoxGeometry(.08, .6, .08), M_BEAM, .05, -.3, 0, man, 0); part(new THREE.CylinderGeometry(.05, .05, .35, 8), M_BEAM, .2, -.6, 0, man, 0).rotation.z = Math.PI / 2;
  for (let k = 0; k < 9; k++) { const tor = part(new THREE.TorusGeometry(.16, .045, 6, 16), SM("#b8a07a", { roughness: 1 }), -.6 + k * .13, 3.4, 0, POZO, 0); tor.rotation.y = Math.PI / 2 }
  const soga = part(new THREE.CylinderGeometry(.035, .035, 1, 6), SM("#b8a07a", { roughness: 1 }), 0, 0, 0, POZO, 0);
  const balde = new THREE.Group(); POZO.add(balde); part(new THREE.CylinderGeometry(.32, .25, .5, 16), M_PLANK, 0, 0, 0, balde, 0); part(new THREE.TorusGeometry(.32, .03, 6, 20), SM("#3a3a3a", { metalness: .6 }), 0, .2, 0, balde, 0).rotation.x = Math.PI / 2; part(new THREE.TorusGeometry(.3, .02, 6, 20, Math.PI), SM("#3a3a3a", { metalness: .6 }), 0, .25, 0, balde, 0);
  const agua = part(new THREE.CircleGeometry(1.39, 40), new THREE.MeshPhysicalMaterial({ color: "#020304", roughness: .06, metalness: 0, clearcoat: 1, normalMap: T_OLAS, normalScale: new THREE.Vector2(.25, .25), envMap: ENV_AGUA, envMapIntensity: .14 }), 0, -.6, 0, POZO, 0); agua.rotation.x = -Math.PI / 2;
  const derrame = part(new THREE.RingGeometry(1.8, 4.5, 48), new THREE.MeshPhysicalMaterial({ color: "#10181c", roughness: .05, transparent: true, opacity: 0, envMap: ENV_AGUA, envMapIntensity: .8, depthWrite: false }), 0, .05, 0, POZO, 0); derrame.rotation.x = -Math.PI / 2;
  // piedritas, baldes y un banco alrededor
  const piedras = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.16, 0), SM("#7a766c", { roughness: 1 }), 50); piedras.castShadow = true; POZO.add(piedras); const r = rng(910);
  for (let k = 0; k < 50; k++) { const a = r() * 6.283, d = 1.9 + r() * .7; dummy.position.set(Math.cos(a) * d, .05, Math.sin(a) * d); dummy.rotation.set(r() * 3, r() * 3, r() * 3); dummy.scale.set(1 + r(), .6 + r() * .5, 1 + r()); dummy.updateMatrix(); piedras.setMatrixAt(k, dummy.matrix) }
  POZO.userData = { soga, balde, agua, derrame, man } }
// soga: de la manivela al balde (o tirante hacia abajo cuando la anguila tira)
function pozo(t, { tirante = 0, nivel = -.6, balde = 2.2, derrame = 0 } = {}) { const u = POZO.userData;
  const yB = tirante > 0 ? -.4 - tirante * 4 : balde, vib = tirante > 0 ? Math.sin(t * 70) * .03 * tirante : 0; u.balde.position.set(vib, yB, 0); u.balde.visible = yB > -2;
  const top = 3.35, bot = yB + .3; u.soga.position.set(vib * .5, (top + bot) / 2, 0); u.soga.scale.set(1, Math.max(.01, top - bot), 1);
  u.man.rotation.x = tirante > 0 ? -t * 9 * tirante : 0; u.agua.position.y = nivel; u.agua.material.normalScale.setScalar(.25 + Math.max(0, nivel + .6) * .4);
  u.derrame.material.opacity = derrame * .85; u.derrame.scale.setScalar(.6 + derrame * .5) }

// ---------- el cartel del pozo: «NO WHISTLING. NOT EVEN SOFTLY.» y, al final, la línea nueva «WHISTLE IF IT BURNS.»
const cartelTex = nueva => tex(768, 640, (g, w, h) => { const r = rng(920); g.fillStyle = "#4a3220"; g.fillRect(0, 0, w, h); vetas(g, r, 0, 0, w, h, "#6a4a2e", false);
  g.fillStyle = "rgba(232,220,192,.94)"; g.fillRect(30, 30, w - 60, h - 60); g.strokeStyle = "#3a2618"; g.lineWidth = 10; g.strokeRect(30, 30, w - 60, h - 60);
  g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#7a1e16"; g.font = "800 112px 'Special Elite'"; g.fillText("NO", w / 2, 120); g.fillText("WHISTLING.", w / 2, 230);
  g.font = "800 62px 'Special Elite'"; g.fillStyle = "#3a2618"; g.fillText("NOT EVEN SOFTLY.", w / 2, 330);
  if (nueva) { g.save(); g.translate(w / 2, 470); g.rotate(-.04); g.font = "800 70px 'Special Elite'"; g.fillStyle = "#1e4a7a"; g.fillText("WHISTLE IF", 0, 0); g.fillText("IT BURNS.", 0, 74); g.restore() }
  for (let k = 0; k < 400; k++) { g.fillStyle = `rgba(60,40,20,${r() * .12})`; g.fillRect(r() * w, r() * h, 2 + r() * 6, 1 + r() * 3) } });
const T_CARTEL0 = cartelTex(false), T_CARTEL1 = cartelTex(true);
const CARTEL2 = new THREE.Group(); enConcha(CARTEL2, 3.0, 3.6, -.55);
{ for (const s of [-1, 1]) part(new THREE.BoxGeometry(.2, 3.6, .2), M_BEAM, s * 1.25, 1.8, 0, CARTEL2, 0); const pl = part(new THREE.BoxGeometry(2.7, 2.25, .1), [M_PLANK, M_PLANK, M_PLANK, M_PLANK, SMt(T_CARTEL0, { roughness: .8 }), M_PLANK], 0, 2.5, .08, CARTEL2, 0); CARTEL2.userData.pl = pl }
CARTEL.visible = false;
const ponerCartel = nueva => { const m = CARTEL2.userData.pl.material[4]; const t = nueva ? T_CARTEL1 : T_CARTEL0; if (m.map !== t) { m.map = t; m.needsUpdate = true } };

// ---------- el granero de Wren (rojo, de tablas, con la puerta grande abierta y fardos de paja adentro)
const GRANERO = new THREE.Group(); enConcha(GRANERO, -13, -22.5, .5, -.2);
{ const T_GR = tex(1024, 1024, (g, w, h) => { const r = rng(930); for (let x = 0; x < w; x += 64) vetas(g, r, x, 0, 62, h, ["#8a2e22", "#7a2a1e", "#9a3628"][r() * 3 | 0], true); g.fillStyle = "rgba(20,10,8,.6)"; for (let x = 62; x < w; x += 64) g.fillRect(x, 0, 4, h); manchas(g, r, 40, w, h, "#4a2a20", 20, 120, .1, .25) });
  const mg = SMt(T_GR, { bumpMap: T_GR, bumpScale: 2 }); part(new THREE.BoxGeometry(7, 9, 8), M_STONE, 0, -4.55, 0, GRANERO, 0);
  for (const [x, z, w, d] of [[-3.5, 0, .2, 8], [3.5, 0, .2, 8], [0, -4, 7, .2]]) part(new THREE.BoxGeometry(w, 5, d), mg, x, 2.5, z, GRANERO, 0);
  for (const s of [-1, 1]) part(new THREE.BoxGeometry(2.1, 5, .2), mg, s * 2.45, 2.5, 4, GRANERO, 0); part(new THREE.BoxGeometry(2.8, 1.2, .2), mg, 0, 4.4, 4, GRANERO, 0);
  const pta = part(new THREE.BoxGeometry(1.4, 3.8, .12), mg, -2.2, 1.9, 4.9, GRANERO, 0); pta.rotation.y = -1.2;
  for (const s of [-1, 1]) { const tj = part(new THREE.BoxGeometry(4.6, .2, 8.6), M_SHING, s * 1.95, 6.0, 0, GRANERO, 0); tj.rotation.z = -s * .62 }
  const paja = SM("#d8b860", { roughness: 1, bumpMap: T_TRAMA, bumpScale: 3 }); [[-2, -2.5], [-.6, -2.6], [.8, -2.4], [-1.4, -2.5, 1], [2, -1]].forEach(([x, z, up]) => part(RB(1.3, .8, .9, .08), paja, x, .4 + (up ? .8 : 0), z, GRANERO, 0));
  part(new THREE.BoxGeometry(6.8, .1, 7.8), SMt(T_DIRT), 0, .05, 0, GRANERO, 0) }

// ---------- utilería: pava de tinker (con silbato), pinza, bebé envuelto, trapos en las chimeneas, cocina de hierro
const PAVA = new THREE.Group(); { const m = SM("#8a8e94", { metalness: .85, roughness: .28 }); const cu = part(new THREE.SphereGeometry(.32, 24, 16), m, 0, .28, 0, PAVA, 0); cu.scale.set(1, .85, 1); part(new THREE.CylinderGeometry(.22, .3, .1, 20), m, 0, .04, 0, PAVA, 0);
  const pico = part(new THREE.CylinderGeometry(.045, .075, .45, 10), m, .33, .38, 0, PAVA, 0); pico.rotation.z = -1.0; const sil = part(new THREE.CylinderGeometry(.05, .05, .1, 10), SM("#c9a040", { metalness: .9, roughness: .2 }), .5, .5, 0, PAVA, 0); sil.rotation.z = -1.0; PAVA.userData.sil = sil;
  const asa = part(new THREE.TorusGeometry(.2, .03, 8, 20, Math.PI), SM("#2a2420"), 0, .52, 0, PAVA, 0); part(new THREE.SphereGeometry(.06, 10, 8), SM("#2a2420"), 0, .58, 0, PAVA, 0) }
const PINZA = new THREE.Group(); { const m = SM("#5a5e64", { metalness: .8, roughness: .35 }); for (const s of [-1, 1]) { const b = part(new THREE.BoxGeometry(.05, .5, .04), m, s * .04, -.1, 0, PINZA, 0); b.rotation.z = s * .1 } part(new THREE.BoxGeometry(.1, .25, .06), SM("#b83a2a"), 0, .22, 0, PINZA, 0) }
const BEBE = new THREE.Group(); { part(RB(.4, .34, .7, .15), SM("#f2ece0", { bumpMap: T_TRAMA, bumpScale: 2 }), 0, 0, 0, BEBE, 0); part(new THREE.SphereGeometry(.15, 16, 12), SM("#f0c6a0"), 0, .08, .3, BEBE, 0) }
const COCINA = new THREE.Group(); { const m = SM("#26262a", { metalness: .6, roughness: .5 }); part(RB(1.1, .8, .8, .05), m, 0, .4, 0, COCINA, 0); part(new THREE.CylinderGeometry(.09, .09, 2, 8), m, -.35, 1.7, -.25, COCINA, 0);
  const fu = part(new THREE.BoxGeometry(.5, .25, .05), new THREE.MeshStandardMaterial({ color: "#ff7a20", emissive: "#ff5a10", emissiveIntensity: 1.2 }), 0, .3, .41, COCINA, 0); PAVA.position.set(.15, .8, 0); COCINA.add(PAVA) }
enConcha(COCINA, 1.4, -8.2, -Math.PI / 2, 0); COCINA.visible = false;
const TRAPOS = []; HUMO_PTS.forEach((c, i) => { const g = new THREE.Group(); c.add(g); g.position.set(0, 1.35, 0); const col = ["#c94b4b", "#e8dcc0", "#4a7ab8", "#6a8a4a"][i % 4]; part(RB(.7, .3, .7, .1), SM(col, { bumpMap: T_TRAMA, bumpScale: 3, roughness: 1 }), 0, 0, 0, g, 0); const cola = part(new THREE.BoxGeometry(.3, .6, .04), SM(col, { bumpMap: T_TRAMA, bumpScale: 3, roughness: 1, side: THREE.DoubleSide }), .3, -.3, .36, g, 0); cola.rotation.z = .3; TRAPOS.push(g) });
// pájaros cantores (chiquitos, de bloques) en los techos
const PAJAROS = Array.from({ length: 9 }, (_, i) => { const g = new THREE.Group(); TURT.add(g); const c = ["#c9502a", "#e0c040", "#4a6a9a"][i % 3]; part(RB(.22, .2, .3, .06), SM(c), 0, 0, 0, g, 0); part(RB(.15, .15, .15, .04), SM(c), 0, .12, .14, g, 0); part(new THREE.ConeGeometry(.03, .08, 4), SM("#e8a020"), 0, .12, .25, g, 0).rotation.x = Math.PI / 2;
  const alas = [-1, 1].map(s => { const a = new THREE.Group(); a.position.x = s * .1; g.add(a); part(new THREE.BoxGeometry(.25, .02, .16), SM(c), s * .12, 0, 0, a, 0); return a }); g.userData.alas = alas; return g });

// ---------- la anguila: cuerpo de tubo que se rearma cada cuadro sobre un recorrido (sale del pozo y se enrosca), con
// piel gris de piedra de río mojada (manchas, línea lateral, panza clara), aleta dorsal continua y una cabeza ancha con
// ojos blancos como huevos duros, boca larga con dientitos, narinas y branquias
const T_ANG = (() => { const [c, z] = pintarDoble(1024, 1024, (c, z, w, h) => { const r = rng(940);
  const gr = c.createLinearGradient(0, 0, w, 0); [[0, "#5e6058"], [.3, "#6e7068"], [.5, "#b4b2a2"], [.7, "#6e7068"], [1, "#5e6058"]].forEach(([q, col]) => gr.addColorStop(q, col)); c.fillStyle = gr; c.fillRect(0, 0, w, h);
  z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
  for (let k = 0; k < 900; k++) { const x = r() * w, y = r() * h, s = 6 + r() * 34; if (Math.abs(x / w - .5) < .14) continue; c.fillStyle = `rgba(${40 + r() * 20 | 0},${42 + r() * 20 | 0},${38 + r() * 16 | 0},${.25 + r() * .35})`; c.beginPath(); c.ellipse(x, y, s, s * (.5 + r() * .5), r() * 3, 0, 7); c.fill() }
  for (let k = 0; k < 5000; k++) { const x = r() * w, y = r() * h; c.fillStyle = `rgba(230,228,210,${r() * .18})`; c.fillRect(x, y, 2, 2) }
  for (const lx of [.25, .75]) { c.strokeStyle = "rgba(220,218,196,.45)"; c.lineWidth = 4; c.beginPath(); for (let y = 0; y <= h; y += 8) { const x = lx * w + Math.sin(y * .05) * 3; y ? c.lineTo(x, y) : c.moveTo(x, y) } c.stroke(); for (let y = 0; y < h; y += 22) { c.fillStyle = "rgba(30,30,26,.6)"; c.beginPath(); c.arc(lx * w, y, 3, 0, 7); c.fill() } }
  for (let k = 0; k < 600; k++) { const y = r() * h, x = r() * w, L = 20 + r() * 80; z.strokeStyle = r() < .5 ? "rgba(40,40,40,.35)" : "rgba(220,220,220,.25)"; z.lineWidth = 2 + r() * 3; z.beginPath(); z.moveTo(x, y); z.quadraticCurveTo(x + L / 2, y + (r() - .5) * 20, x + L, y + (r() - .5) * 10); z.stroke() }
  for (let y = 0; y < h; y += 16 + r() * 10) { z.strokeStyle = "rgba(60,60,60,.35)"; z.lineWidth = 3; z.beginPath(); for (let x = 0; x <= w; x += 16) { const yy = y + Math.sin(x * .03 + y) * 4; x ? z.lineTo(x, yy) : z.moveTo(x, yy) } z.stroke() } });
  [c, z].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }); return { c, z } })();
const M_ANG = new THREE.MeshPhysicalMaterial({ map: T_ANG.c, bumpMap: T_ANG.z, bumpScale: 2.6, roughness: .55, clearcoat: .45, clearcoatRoughness: .3, color: "#e4e4dc" });
const ANG = new THREE.Group(); TURT.add(ANG); ANG.visible = false;
const NR = 300, NS = 36;   // anillos a lo largo, lados alrededor
const GEO_ANG = (() => { const g = new THREE.BufferGeometry(), pos = new Float32Array(NR * (NS + 1) * 3), uv = new Float32Array(NR * (NS + 1) * 2), idx = [];
  for (let i = 0; i < NR - 1; i++) for (let j = 0; j < NS; j++) { const a = i * (NS + 1) + j, b = a + NS + 1; idx.push(a, b, a + 1, b, b + 1, a + 1) }
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); g.setIndex(idx); return g })();
const CUERPO = new THREE.Mesh(GEO_ANG, M_ANG); CUERPO.castShadow = CUERPO.receiveShadow = true; CUERPO.frustumCulled = false; ANG.add(CUERPO);
const GEO_ALETA = (() => { const g = new THREE.BufferGeometry(), pos = new Float32Array(NR * 2 * 3), idx = []; for (let i = 0; i < NR - 1; i++) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3) } g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setIndex(idx); return g })();
const ALETA_D = new THREE.Mesh(GEO_ALETA, new THREE.MeshPhysicalMaterial({ color: "#4a4c44", roughness: .4, clearcoat: .6, transparent: true, opacity: .85, side: THREE.DoubleSide })); ALETA_D.frustumCulled = false; ALETA_D.castShadow = true; ANG.add(ALETA_D);
// cabeza: más ancha que el pozo, chata, hocico redondeado, mandíbula que se abre
const CAB_A = new THREE.Group(); ANG.add(CAB_A);
const M_BOCA = new THREE.MeshStandardMaterial({ color: "#1a0e0e", roughness: .6 });
{ const geo = new THREE.SphereGeometry(1, 64, 40), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { let x = p.getX(i), y = p.getY(i), z = p.getZ(i); const f = z > 0 ? 1 - .42 * z * z : 1 - .1 * z * z; x *= f; y *= f * (y < 0 ? .7 : 1); p.setXYZ(i, x * 2.05, y * 1.3 + .1, z * 3.1 + .6) }
  geo.computeVertexNormals(); const cab = new THREE.Mesh(geo, M_ANG); cab.castShadow = cab.receiveShadow = true; CAB_A.add(cab);
  const mand = new THREE.Group(); mand.position.set(0, -.35, -1.2); CAB_A.add(mand); CAB_A.userData.mand = mand;
  const gj = new THREE.SphereGeometry(1, 48, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), pj = gj.attributes.position; for (let i = 0; i < pj.count; i++) { const z = pj.getZ(i), f = z > 0 ? 1 - .4 * z * z : 1; pj.setXYZ(i, pj.getX(i) * 1.9 * f, pj.getY(i) * .55, pj.getZ(i) * 2.9 + 1.7) } gj.computeVertexNormals();
  const jaw = new THREE.Mesh(gj, M_ANG); jaw.castShadow = true; mand.add(jaw); const inside = part(new THREE.CircleGeometry(1, 32), M_BOCA, 0, .02, 1.7, mand, 0); inside.rotation.x = -Math.PI / 2; inside.scale.set(1.75, 2.6, 1);
  const diente = new THREE.ConeGeometry(.06, .22, 6), M_D = SM("#efe8d8", { roughness: .4 });
  for (let k = 0; k < 18; k++) { const q = k / 17, s = k % 2 ? 1 : -1, z = 3.6 - q * 2.6, x = s * (1.65 - (1 - q) * .9) * (1 - .3 * ((z - .6) / 3) ** 2); const d = part(diente, M_D, x * .95, -.2, z - .6, CAB_A, 0); d.rotation.x = Math.PI; part(diente, M_D, x * .92, .2, z - .6 - 1.2 + 1.2, mand, 0) }
  // ojos blancos como huevos duros: esfera blanca lechosa, con un velo gris y un punto apenas más oscuro
  const M_OJO = new THREE.MeshPhysicalMaterial({ color: "#f2efe6", roughness: .35, clearcoat: 1, clearcoatRoughness: .05, sheen: .5, sheenColor: new THREE.Color("#cfd6dc") });
  for (const s of [-1, 1]) { const o = part(new THREE.SphereGeometry(.62, 40, 28), M_OJO, s * 1.32, .62, 1.9, CAB_A, 0); o.scale.set(1, .9, 1.1); const pu = part(new THREE.CircleGeometry(.2, 24), new THREE.MeshStandardMaterial({ color: "#9aa0a2", transparent: true, opacity: .55, roughness: .3 }), s * .6, .05, .1, o, 0); pu.lookAt(o.localToWorld(new THREE.Vector3(s * 3, 0, 1)));
    const pr = part(new THREE.TorusGeometry(.6, .1, 10, 32), M_ANG, s * 1.32, .62, 1.9, CAB_A, 0); pr.rotation.y = s * 1.2; pr.scale.set(1, .9, 1);
    const nar = part(new THREE.CylinderGeometry(.08, .12, .3, 10), M_ANG, s * .45, .25, 3.55, CAB_A, 0); nar.rotation.x = 1.2; part(new THREE.CircleGeometry(.07, 10), M_BOCA, s * .45, .38, 3.66, CAB_A, 0).rotation.x = -.4;
    for (let k = 0; k < 4; k++) { const b = part(new THREE.TorusGeometry(.42, .05, 6, 20, Math.PI * .8), SM("#3a3c36", { roughness: .5 }), s * 1.7, -.1, -1.4 - k * .32, CAB_A, 0); b.rotation.set(0, s * Math.PI / 2, Math.PI / 2 + .3) } }
  // labios: línea oscura de la boca a los costados
  for (const s of [-1, 1]) { const cu = new THREE.CatmullRomCurve3([[0, -.22, 3.7], [s * .9, -.3, 3.2], [s * 1.6, -.36, 2.0], [s * 1.85, -.34, .6], [s * 1.8, -.2, -.6]].map(q => new THREE.Vector3(...q))); part(new THREE.TubeGeometry(cu, 40, .07, 6), M_BOCA, 0, 0, 0, CAB_A, 0) } }
// gotas que caen de la anguila mojada
const GOTAS = Array.from({ length: 60 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#cfe2ea", transparent: true, opacity: 0, depthWrite: false })); scene.add(s); s.scale.setScalar(.25); return s });
const _P = [], _T = new THREE.Vector3(), _N = new THREE.Vector3(), _B = new THREE.Vector3(), _UP = new THREE.Vector3(0, 1, 0), _V = new THREE.Vector3();
// recorridos en coordenadas de la roca (y absoluta): siempre empiezan hondo en el caño del pozo
const RUTA = pts => { const c = new THREE.CatmullRomCurve3([[WELL[0], WY() - 40, WELL[1]], [WELL[0], WY() - 14, WELL[1]], ...pts].map(q => new THREE.Vector3(...q)), false, "centripetal", .5); c.L = c.getLength(); c.arcLengthDivisions = 2000; c.updateArcLengths(); return c };
const SOBRE = (x, z, dy = 1.3) => [x, SY(x, z) + dy, z];
// espiral alrededor de un centro (cx, cz), de radio r0 a r1, n vueltas, apoyada en el piso
const ESPIRAL = (cx, cz, r0, r1, n, a0 = 0, dy = 1.3, pasos = 18) => { const a = []; for (let k = 0; k <= n * pasos; k++) { const q = k / (n * pasos), an = a0 + q * n * 6.283, rr = lerp(r0, r1, q), x = cx + Math.cos(an) * rr, z = cz + Math.sin(an) * rr; a.push(SOBRE(x, z, dy)) } return a };
// una vuelta alrededor del techo de una casa (centro de la casa, altura del techo)
const ENROSCA = (H, vueltas = 1, a0 = 0) => { H.g.updateMatrix(); const c = new THREE.Vector3(0, 0, 0).applyMatrix4(H.g.matrix), y0 = SY(c.x, c.z) + (H.Hh ?? 5) + 1.2, a = []; for (let k = 0; k <= vueltas * 16; k++) { const an = a0 + k / 16 * 6.283, rr = 4.3; a.push([c.x + Math.cos(an) * rr, y0 + Math.sin(k * .7) * .5 - k * .06, c.z + Math.sin(an) * rr * 1.1]) } return a };
function anguila(t, curva, E, { largo = 230, R = 1.3, boca = .15, mira = null, gotas = 1, ola = 1 } = {}) {
  ANG.visible = true; const L = curva.L, sh = Math.min(E, L), st = Math.max(0, sh - largo), pos = GEO_ANG.attributes.position.array, uv = GEO_ANG.attributes.uv.array, fp = GEO_ALETA.attributes.position.array;
  for (let i = 0; i < NR; i++) { const s = lerp(st, sh, i / (NR - 1)); const p = curva.getPointAt(Math.min(1, Math.max(0, s / L))); _P[i] = (_P[i] || new THREE.Vector3()).copy(p); _P[i].s = s }
  // ondulación lateral viva (menos cerca de la cabeza)
  for (let i = 1; i < NR - 1; i++) { _T.subVectors(_P[i + 1], _P[i - 1]).normalize(); _N.crossVectors(_T, _UP); if (_N.lengthSq() < 1e-4) _N.set(1, 0, 0); _N.normalize(); const f = (1 - i / NR) * .5 * ola; _P[i].addScaledVector(_N, Math.sin(_P[i].s * .45 - t * 3.2) * f) }
  let prevN = null;
  for (let i = 0; i < NR; i++) { const a = _P[Math.max(0, i - 1)], b = _P[Math.min(NR - 1, i + 1)]; _T.subVectors(b, a).normalize();
    if (!prevN) { _N.crossVectors(_UP, _T); if (_N.lengthSq() < 1e-4) _N.set(1, 0, 0); _N.normalize(); _N.crossVectors(_T, _N).normalize() } else { _N.copy(prevN).addScaledVector(_T, -prevN.dot(_T)).normalize() }
    prevN = (prevN || new THREE.Vector3()).copy(_N); _B.crossVectors(_T, _N).normalize();
    const q = i / (NR - 1), cola = Math.min(1, (_P[i].s - st) / 18), rr = R * (.25 + .75 * Math.sqrt(cola)) * (q > .97 ? 1 + (q - .97) * 10 : 1);
    for (let j = 0; j <= NS; j++) { const an = j / NS * 6.283, cx = Math.cos(an), sy = Math.sin(an), o = (i * (NS + 1) + j); pos[o * 3] = _P[i].x + (_N.x * sy + _B.x * cx) * rr; pos[o * 3 + 1] = _P[i].y + (_N.y * sy + _B.y * cx) * rr * .92; pos[o * 3 + 2] = _P[i].z + (_N.z * sy + _B.z * cx) * rr; uv[o * 2] = j / NS; uv[o * 2 + 1] = -_P[i].s / 7 }
    // aleta dorsal (lado _N = arriba del tubo)
    const fh = .7 * Math.min(1, cola * 1.5) * (q > .93 ? Math.max(0, 1 - (q - .93) * 14) : 1); fp[i * 6] = _P[i].x + _N.x * rr * .9; fp[i * 6 + 1] = _P[i].y + _N.y * rr * .9; fp[i * 6 + 2] = _P[i].z + _N.z * rr * .9; fp[i * 6 + 3] = _P[i].x + _N.x * (rr + fh); fp[i * 6 + 4] = _P[i].y + _N.y * (rr + fh); fp[i * 6 + 5] = _P[i].z + _N.z * (rr + fh) }
  GEO_ANG.attributes.position.needsUpdate = GEO_ANG.attributes.uv.needsUpdate = GEO_ALETA.attributes.position.needsUpdate = true; GEO_ANG.computeVertexNormals(); GEO_ALETA.computeVertexNormals();
  // cabeza en la punta, mirando hacia adelante (o hacia «mira»)
  const h = _P[NR - 1], d = _V.subVectors(_P[NR - 1], _P[NR - 6]).normalize(); CAB_A.position.copy(h).addScaledVector(d, -.8);
  const obj = mira ? TURT.worldToLocal(new THREE.Vector3(...(typeof mira === "function" ? mira() : mira))) : h.clone().add(d);
  { const m = new THREE.Matrix4().lookAt(h, obj, _UP); CAB_A.quaternion.setFromRotationMatrix(m); CAB_A.rotateY(Math.PI) }
  CAB_A.userData.mand.rotation.x = boca * .5 + Math.sin(t * 1.7) * .03;
  // gotas que caen del cuerpo
  GOTAS.forEach((g, k) => { const i = (k * 37) % NR, q = (t * 1.1 + k * .13) % 1; if (gotas <= 0 || _P[i].s < 1) { g.material.opacity = 0; return } const w = TURT.localToWorld(_V.copy(_P[i])); g.position.set(w.x + Math.sin(k) * .9, w.y - R - q * 3, w.z + Math.cos(k) * .9); g.material.opacity = (1 - q) * .55 * gotas });
  return h }

// ---------- fuego de verdad: llamas en capas (núcleo amarillo, cuerpo naranja, puntas rojas), chispas, humo negro que
// sube y se ensancha, luz naranja que titila; cuando se apaga, vapor blanco
const T_LLAMA = tex(128, 256, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h * .72, 4, w / 2, h * .62, h * .55); gr.addColorStop(0, "rgba(255,250,220,1)"); gr.addColorStop(.25, "rgba(255,200,80,.95)"); gr.addColorStop(.55, "rgba(255,110,20,.6)"); gr.addColorStop(1, "rgba(160,30,0,0)"); g.fillStyle = gr; g.beginPath(); g.moveTo(w / 2, 0); g.bezierCurveTo(w * 1.05, h * .45, w, h, w / 2, h); g.bezierCurveTo(0, h, -w * .05, h * .45, w / 2, 0); g.fill() });
const T_HUMO = tex(256, 256, (g, w, h) => { const r = rng(950); for (let k = 0; k < 30; k++) { const x = w / 2 + (r() - .5) * 120, y = h / 2 + (r() - .5) * 120, rr = 30 + r() * 60, gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, "rgba(255,255,255,.35)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h) } });
const FUEGOS = [];
function nuevoFuego(H) { const f = { H, llamas: [], humo: [], vapor: [], chispas: [] };
  for (let k = 0; k < 26; k++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: T_LLAMA, color: k % 3 ? "#ffffff" : "#ffb060", transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(s); f.llamas.push(s) }
  for (let k = 0; k < 14; k++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: T_HUMO, color: "#2a2624", transparent: true, depthWrite: false, opacity: 0 })); scene.add(s); f.humo.push(s) }
  for (let k = 0; k < 16; k++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: T_HUMO, color: "#f4f6f8", transparent: true, depthWrite: false, opacity: 0 })); scene.add(s); f.vapor.push(s) }
  for (let k = 0; k < 20; k++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#ffb040", transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 })); s.scale.setScalar(.15); scene.add(s); f.chispas.push(s) }
  FUEGOS.push(f); return f }
const QUEMAN = [PANADERIA, CASAS[5], CASAS[4], CASAS[6], CASAS[2], CASAS[1]].map(nuevoFuego);
// fuego(f, t, a, v): a = cuánto arde (0..1), v = vapor (0..1). Devuelve la luz para lights()
function fuego(f, t, a, v = 0) { const H = f.H; H.g.updateMatrixWorld(true); const W = H.Wd ?? 6.4, c = H.g.localToWorld(new THREE.Vector3(0, (H.Hh ?? 5) + .6, 0));
  f.llamas.forEach((s, k) => { const q = (t * (1.3 + (k % 5) * .17) + k * .37) % 1, x = ((k * .618) % 1 - .5) * W * .9, z = ((k * .382) % 1 - .5) * 4; s.visible = a > .02; s.position.set(c.x + x + Math.sin(t * 7 + k) * .15, c.y + q * 3.2 * a + (k % 4) * .2, c.z + z); const sz = (1 - q * .7) * (1.4 + (k % 3) * .5) * a; s.scale.set(sz, sz * 1.9, 1); s.material.opacity = (1 - q) * .95 * Math.min(1, a * 1.5) });
  f.humo.forEach((s, k) => { const q = (t * .18 + k / 14) % 1; s.visible = a > .02; s.position.set(c.x + Math.sin(k * 2.3) * 1.5 + q * 6, c.y + 2 + q * 18, c.z + Math.cos(k * 1.7) * 1.5 + q * 3); s.scale.setScalar(3 + q * 12); s.material.opacity = Math.min(1, a * 1.3) * (1 - q) * .55; s.material.rotation = k + q });
  f.chispas.forEach((s, k) => { const q = (t * .9 + k / 20) % 1; s.visible = a > .1; s.position.set(c.x + Math.sin(k * 3.1 + t) * (1 + q * 3), c.y + q * 8, c.z + Math.cos(k * 2.3) * (1 + q * 2)); s.material.opacity = (1 - q) * a });
  f.vapor.forEach((s, k) => { const q = (t * .35 + k / 16) % 1; s.visible = v > .02; s.position.set(c.x + Math.sin(k * 1.9) * 2.5, c.y - 1 + q * 12, c.z + Math.cos(k * 2.9) * 2.5); s.scale.setScalar(2.5 + q * 9); s.material.opacity = v * (1 - q) * .42; s.material.rotation = k * .7 + q });
  // techo chamuscado
  H.roof.traverse(m => { if (m.isMesh && m.material && m.material.color) { if (!m.userData.c0) m.userData.c0 = m.material.color.clone(); } });
  return a > .02 ? [c.toArray(), 3.2 * a * (.85 + .15 * Math.sin(t * 17 + c.x)), "#ff8a30", 22] : null }
function sinFuego() { FUEGOS.forEach(f => [...f.llamas, ...f.humo, ...f.vapor, ...f.chispas].forEach(s => s.visible = false)) }

//@@ELENCO
// ---------- elenco: diseños propios de bloques (nada del protagonista de Volze ni marcas)
const ME = kid({ skin: "#e8b48c", shirt: "#d1872e", cloth: "plain", pants: "#3a4a5a", shoes: "#4a3020", hair: "#3a2416", style: "despeinado" });
const ME6 = kid({ skin: "#e8b48c", shirt: "#c9506a", cloth: "plain", pants: "#4a3a5a", shoes: "#4a3020", hair: "#5a3418", style: "despeinado" }); ME6.body.scale.setScalar(.7);
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

robloxify(ME, { skin: "#e8b48c", shirt: "#d1872e", pants: "#3a4a5a", shoes: "#4a3020", pelo: ["puntas", "#3a2416"] });
robloxify(ME6, { skin: "#e8b48c", shirt: "#c9506a", pants: "#4a3a5a", shoes: "#4a3020", pelo: ["trenzas", "#5a3418"] });
robloxify(QUILL, { skin: "#f0c6a0", shirt: "#2e2e4a", cloth: "suit", alt: "#a82a2a", pants: "#2e2e4a", shoes: "#111", pelo: ["corto", "#9a9a9a"] });
robloxify(PIM, { skin: "#c98e64", shirt: "#f2ece0", pants: "#5a4632", pelo: ["corto", "#2b211b"] });
robloxify(GARROW, { skin: "#d9b08c", shirt: "#3a5a4a", cloth: "sweater", alt: "#c9b48a", pants: "#3a3236", pelo: ["rodete", "#e9e4dc"] });
FOLK.forEach((k, i) => robloxify(k, { skin: ["#c98e64", "#f2cfae", "#e8b48c", "#efc8a8", "#8a5a3c", "#f2cfae"][i], shirt: ["#7a3a2a", "#3f6a8a", "#5a7a3a", "#8a5a8a", "#c9a23a", "#3a4a5a"][i], cloth: ["plaid", "sweater", "plain", "sweater", "plain", "plain"][i], alt: "#d9c7a0", pants: ["#3a3236", "#3a3f4a", "#3a2f28", "#3a3236", "#2e3a59", "#2a2420"][i], pelo: k.peloR6 }));
EXT.forEach((k, i) => robloxify(k, { skin: ["#efc8a8", "#8a5a3c", "#f2cfae", "#c98e64"][i], shirt: ["#b85a3a", "#4a8a6a", "#e0c060", "#7a4a8a"][i], pants: ["#3a3f4a", "#3a2f28", "#2e3a59", "#2a2420"][i], pelo: [["liso", "#6b3f22"], ["rulos", "#1d1a17"], ["trenzas", "#c9a06a"], ["corto", "#3a2416"]][i] }));
robloxify(PESCADOR, { skin: "#c98e64", shirt: "#e8c040", pants: "#3a4a5a", pelo: ["corto", "#5a3a22"] }); { const ca = new THREE.Group(); part(new THREE.CylinderGeometry(.03, .05, 4, 6), SM("#7a5030"), 0, 1.6, 0, ca, 0); ca.rotation.x = 1.1; PESCADOR.handR.add(ca); part(new THREE.CylinderGeometry(.01, .01, 4.5, 4), SM("#dddddd"), 0, 1.6, 2.3, ca, 0) }
// sombrero de copa del intendente, gorro de panadero, barba de Garrow
{ const hm = SM("#1a1a1e", { roughness: .5 }); part(new THREE.CylinderGeometry(.34, .34, .6, 18), hm, 0, 1.05, 0, QUILL.head, 0); part(new THREE.CylinderGeometry(.52, .52, .05, 20), hm, 0, .76, 0, QUILL.head, 0); part(new THREE.CylinderGeometry(.35, .35, .1, 18), SM("#a82a2a"), 0, .82, 0, QUILL.head, 0);
  cocinero(PIM); barbaSensei(GARROW, "#ece8e0") }
// tela con relieve y piezas 3D para todos (el traje del intendente y la chaqueta del cocinero sin botones de camisa)
telaReal(ME, { shirt: "#d1872e", pants: "#3a4a5a", shoes: "#4a3020" }); telaReal(ME6, { shirt: "#c9506a", pants: "#4a3a5a", shoes: "#4a3020" });
telaReal(QUILL, { shirt: "#2e2e4a", pants: "#2e2e4a", shoes: "#111", botones: false, bolsillo: false }); telaReal(PIM, { shirt: "#f2ece0", pants: "#5a4632", botones: false, bolsillo: false, cinto: false });
telaReal(GARROW, { shirt: "#3a5a4a", pants: "#3a3236", botones: false });
FOLK.forEach((k, i) => telaReal(k, { shirt: ["#7a3a2a", "#3f6a8a", "#5a7a3a", "#8a5a8a", "#c9a23a", "#3a4a5a"][i], pants: ["#3a3236", "#3a3f4a", "#3a2f28", "#3a3236", "#2e3a59", "#2a2420"][i], botones: i % 2 === 0, bolsillo: i % 3 !== 1 }));
EXT.forEach((k, i) => telaReal(k, { shirt: ["#b85a3a", "#4a8a6a", "#e0c060", "#7a4a8a"][i], pants: ["#3a3f4a", "#3a2f28", "#2e3a59", "#2a2420"][i], botones: i % 2 === 1 }));
telaReal(PESCADOR, { shirt: "#e8c040", pants: "#3a4a5a" });
// bajo la galera y el gorro de cocinero no va el pelo entero (asomaba como un ala de sombrero): solo patillas y nuca
[[QUILL, "#9a9a9a"], [PIM, "#2b211b"]].forEach(([k, col]) => { [...k.head.children].forEach(c => { if (c.userData.pelo) k.head.remove(c) }); const mt = new THREE.MeshStandardMaterial({ map: mechTex(col, 7), roughness: .5, flatShading: true });
  for (const s of [-1, 1]) for (let j = 0; j < 3; j++) mechR(k.head, mt, [[s * .36, .68, -.02 - j * .12], [s * .4, .5, -.05 - j * .12], [s * .38, .32, -.03 - j * .1]], .07, .02, 1.5);
  for (let j = 0; j < 4; j++) mechR(k.head, mt, [[-.27 + j * .18, .68, -.35], [-.27 + j * .18, .48, -.4], [-.25 + j * .17, .3, -.37]], .08, .02, 1.5) });

//@@LUGAR
const LUGAR = L => (L >= I.tinker && L <= I.flat) ? "recuerdo" : "pueblo";
// recorridos de la anguila (arco medido: «boca» = el largo hasta la boca del pozo)
const marca = (c, p) => { let best = 0, bd = 1e9; for (let k = 0; k <= 1200; k++) { const q = c.getPointAt(k / 1200), d = q.distanceToSquared(new THREE.Vector3(...p)); if (d < bd) { bd = d; best = k / 1200 * c.L } } return best };
const BOCA = c => marca(c, [WELL[0], WY(), WELL[1]]);
const R_SUBE = RUTA([[WELL[0], WY() + 3, WELL[1]], [WELL[0] + .3, WY() + 9, WELL[1]], [WELL[0] + 1.2, WY() + 13, WELL[1] + 1.5], [WELL[0] + 2.6, WY() + 15, WELL[1] + 4]]);
const R_PAVA = RUTA([[WELL[0], WY() + 4, WELL[1]], [WELL[0] + 1, WY() + 7.5, WELL[1] + 2], [3.2, WY() + 5.5, 5.4], [3.3, WY() + 3.4, 6.2]]);
const R_ROSCA = RUTA([[WELL[0], WY() + 3, WELL[1]], [WELL[0] + 2.5, WY() + 3.5, WELL[1] + 2], ...ESPIRAL(WELL[0], WELL[1], 5, 9.5, 3, .6, 1.25), SOBRE(7, -4, 2.2), SOBRE(5.6, -7.8, 2.6), SOBRE(7.2, -9, 2.6)]);
const R_FUEGO = (() => { const P0 = [[WELL[0], WY() + 5, WELL[1]], [WELL[0] + 2, WY() + 12, WELL[1] + 1], [9, WY() + 10, 2]];
  const C = H => { H.g.updateMatrix(); return new THREE.Vector3().applyMatrix4(H.g.matrix) };
  const cam = []; [PANADERIA, CASAS[5], CASAS[6], CASAS[4], CASAS[2], CASAS[1]].forEach((H, i) => { const c = C(H); if (i) cam.push([c.x * .6, SY(c.x * .6, c.z * .9) + 8, c.z * .9]); cam.push(...ENROSCA(H, 1, i * 1.3)) });
  return RUTA([...P0, ...cam, [4, WY() + 7, -6], [3.2, WY() + 4.2, 1.2], [2.8, WY() + 3.4, 3.0]]) })();
const R_BAJA = RUTA([[WELL[0], WY() + 3, WELL[1]], [WELL[0] + .2, WY() + 6, WELL[1] + .6], [WELL[0] + 1.6, WY() + 5.2, WELL[1] + 2.4]]);
const B_SUBE = BOCA(R_SUBE), B_PAVA = BOCA(R_PAVA), B_ROSCA = BOCA(R_ROSCA), B_FUEGO = BOCA(R_FUEGO), B_BAJA = BOCA(R_BAJA);
const M_FUEGO = [PANADERIA, CASAS[5], CASAS[6], CASAS[4], CASAS[2], CASAS[1]].map(H => { H.g.updateMatrix(); const c = new THREE.Vector3().applyMatrix4(H.g.matrix); return marca(R_FUEGO, [c.x + 4.3, SY(c.x, c.z) + (H.Hh ?? 5) + 1.2, c.z]) + 26 });
const MEP = [2.6, 4.6];   // donde se para el narrador en el final (al lado del pozo)

//@@SHOTS
const TW = v => () => TURT.localToWorld(new THREE.Vector3(...v)).toArray();
const TS = (x, dy, z) => TW([x, SY(x, z) + dy, z]);
const PZ = (dx, dy, dz) => () => [WELL[0] + dx, WY() + dy, WELL[1] + dz];
const KW = (k, o) => () => add(k.g.getWorldPosition(new THREE.Vector3()).toArray(), o);
const HW = o => () => { CAB_A.updateMatrixWorld(true); return CAB_A.localToWorld(new THREE.Vector3(...o)).toArray() };
const GW = o => () => { GRANERO.updateMatrixWorld(true); return GRANERO.localToWorld(new THREE.Vector3(...o)).toArray() };
const OW = (obj, o) => () => { obj.updateMatrixWorld(true); return obj.localToWorld(new THREE.Vector3(...o)).toArray() };
const HP = o => () => { CAB_A.updateMatrixWorld(true); return add(CAB_A.getWorldPosition(new THREE.Vector3()).toArray(), o) };
const CHW = (i, o) => () => { const c = HUMO_PTS[i]; c.updateMatrixWorld(true); return c.localToWorld(new THREE.Vector3(...o)).toArray() };
const SHOTS = {
  [I.hook]: [sh(0, PZ(3.0, 2.5, 3.4), PZ(2.5, 2.4, 2.9), PZ(0, 1.9, 1.4), PZ(0, 1.8, 1.3), 60)],
  [I.never]: [sh(0, [-60, 34, 80], [-52, 30, 70], TS(0, 4, 2), TS(0, 4, 2), 50)],
  [I.cost]: [sh(0, PZ(.5, 3.0, .6), PZ(.3, 2.4, .4), PZ(0, -4, 0), PZ(0, -4, 0), 62), sh(8, PZ(.6, .8, 9), PZ(.4, 1.0, 8), PZ(0, 4, 0), PZ(0, 9, 0), 62)],
  [I.behind]: [sh(0, PZ(.4, 3.2, -3.8), PZ(.2, 3.6, -4.8), KW(ME, [0, 1.8, 0]), TS(0, 5, 9), 58)],
  [I.takes]: [sh(0, KW(FOLK[3], [-3.4, 1.5, 2.6]), KW(FOLK[3], [-3.0, 1.4, 2.2]), KW(FOLK[3], [0, 2.4, -1.4]), null, 62)],
  [I.rock]: [sh(0, [-118, 58, -46], [-104, 52, -10], TS(0, 6, 0), TS(0, 6, 0), 48)],
  [I.well]: [sh(0, PZ(0, 6, .02), PZ(0, -13, .02), PZ(0, -20, 0), PZ(0, -34, 0), 72)],
  [I.rope]: [shF(0, FOLK[1], 2.4, 2.0, -.7, .1, 62), sh(5, PZ(2.4, 2.4, 2.6), PZ(2.0, 2.3, 2.2), PZ(0, 1.8, 0), PZ(0, 2.4, 0), 58)],
  [I.sign]: [sh(0, TS(1.0, 2.8, 8.2), TS(1.6, 2.7, 7.0), TS(3, 2.5, 3.6), TS(3, 2.5, 3.6), 48)],
  [I.kettles]: [shF(0, QUILL, 2.7, 2.3, .5, -.25, 62, -.55)],
  [I.birds]: [sh(0, TS(-1, 1.6, 2), TS(-.6, 1.8, 3.4), TS(6.8, 6.5, 9), TS(6.8, 8, 9), 54)],
  [I.hum]: [shF(0, FOLK[1], 2.0, 1.7, -.6, .1, 62)],
  [I.rags]: [sh(0, CHW(4, [1.5, 1.6, 1.5]), CHW(4, [1.1, 1.5, 1.1]), CHW(4, [0, 1.3, 0]), CHW(4, [0, 1.3, 0]), 56)],
  [I.garrow]: [shF(0, GARROW, 2.4, 2.0, .5, .1, 62), sh(9, KW(GARROW, [-1.2, 2.6, -2.4]), KW(GARROW, [-1, 2.5, -2.0]), [-90, 4, -60], [-90, 6, -60], 54)],
  [I.seen]: [shF(0, GARROW, 1.6, 1.4, .2, 0, 68)],
  [I.tinker]: [sh(0, () => add(OW(PAVA, [0, 0, 0])(), [-.2, 1.0, 1.9]), () => add(OW(PAVA, [0, 0, 0])(), [-.1, .8, 1.5]), OW(PAVA, [0, .3, 0]), null, 50), shF(6, FOLK[0], 2.2, 1.9, .5, .1, 60)],
  [I.tight]: [sh(0, PZ(1.8, 3.3, 2.6), PZ(1.5, 3.1, 2.2), PZ(0, 1.6, 0), PZ(0, 1.2, 0), 56, { shake: .08 })],
  [I.rose]: [sh(0, PZ(1.4, 3.3, 1.4), PZ(1.1, 2.9, 1.1), PZ(0, .6, 0), PZ(0, .9, 0), 58)],
  [I.head]: [sh(0, PZ(-.6, .8, 9), PZ(-.4, 1.0, 8), PZ(0, 3, 0), PZ(0, 8, 0), 60)],
  [I.eel]: [sh(0, HP([-4.4, 2.8, 4.0]), HP([-3.4, 2.2, 3.2]), HW([0, .5, 1.8]), HW([0, .5, 1.8]), 52)],
  [I.coils]: [sh(0, PZ(-2, 34, 14), PZ(-1, 46, 10), PZ(0, 0, 0), PZ(0, 0, 0), 56)],
  [I.kitchen]: [sh(0, TS(-2.4, 11, 2), TS(-2, 10, 1), TS(5.5, 2.4, -8.6), TS(6.8, 2.4, -9), 56)],
  [I.flat]: [sh(0, PZ(1.5, 3.0, 1.5), PZ(1.3, 2.7, 1.3), PZ(0, 0, 0), PZ(0, 0, 0), 56)],
  [I.tinker2]: [sh(0, TS(-19, 3, 22), TS(-18, 3, 21), [-140, 3, 150], [-140, 3, 150], 46)],
  [I.wren]: [shF(0, ME6, 1.7, 1.45, .3, 0, 66)],
  [I.barn]: [sh(0, GW([1.6, 1.6, 10.5]), GW([1.1, 1.5, 9.2]), GW([0, 1.3, 4.2]), GW([0, 1.3, 4.2]), 54)],
  [I.told]: [shF(0, ME, 2.2, 1.9, .6, .1, 62), shF(5, ME6, 1.8, 1.5, -.4, 0, 64)],
  [I.fire]: [sh(0, TS(5, 3, -6), TS(6.4, 3.2, -4.6), TS(18.5, 5, 3), TS(18.5, 6, 3), 52)],
  [I.wind]: [sh(0, TS(1.5, 6.5, -2), TS(1.5, 6.5, 7), TS(16, 6, 4), TS(6.8, 6, 10), 56)],
  [I.buckets]: [sh(0, PZ(-3.4, 2.4, -2.4), PZ(-2.8, 2.3, -1.6), PZ(3, 1.2, 4), PZ(3.5, 1.2, 5), 60)],
  [I.slow]: [sh(0, [2, 56, -46], [2, 50, -38], TS(0, 4, 3), TS(0, 4, 3), 52)],
  [I.arm]: [shF(0, GARROW, 2.2, 1.9, .7, .1, 62), shF(4, ME, 1.8, 1.6, -.5, 0, 64)],
  [I.looked]: [sh(0, PZ(-2.6, 2.6, 5.6), PZ(-2.2, 2.5, 5.2), PZ(0, 1, 0), null, 60), sh(5, PZ(-1.2, 2.6, 1.0), PZ(-1.0, 2.6, 1.4), TS(6.8, 6.5, 9), null, 58)],
  [I.knew]: [shF(0, ME6, 1.6, 1.4, .2, 0, 66)],
  [I.lean]: [sh(0, PZ(3.4, 2.6, 2.8), PZ(2.8, 2.5, 2.4), PZ(0, 1.9, 1.2), null, 58)],
  [I.loud]: [sh(0, PZ(0, -1.6, .15), PZ(0, -2.6, .15), KW(ME, [0, 1.7, 0]), null, 70, { shake: .1 })],
  [I.tight2]: [sh(0, PZ(-1.8, 3.3, 2.4), PZ(-1.5, 3.1, 2.0), PZ(0, 1.6, 0), PZ(0, 1.2, 0), 56, { shake: .1 })],
  [I.rose2]: [sh(0, PZ(-1.6, 4.4, 1.4), PZ(-1.2, 3.8, 1.1), PZ(0, .6, 0), PZ(0, .9, 0), 58)],
  [I.up]: [sh(0, PZ(-.8, .9, 10), PZ(-.6, 1.2, 9), PZ(0, 5, 0), PZ(0, 17, 0), 62)],
  [I.ran]: [sh(0, PZ(1.6, 3.4, 12.5), PZ(1.4, 3.2, 11.5), PZ(1, 2, 2), PZ(1, 3, 2), 58)],
  [I.bakery]: [sh(0, TS(8, 13, -14), TS(9.5, 12.5, -12), TS(18.5, 6, 3), TS(18.5, 6.5, 3), 54)],
  [I.hiss]: [sh(0, TS(13, 15, -16), TS(13.6, 14.5, -14.5), TS(18.5, 6.5, 3), null, 58)],
  [I.next]: [sh(0, TS(0, 10, 2), TS(0, 10, 12), TS(6.8, 6, 9), TS(-6.8, 6, 15), 56)],
  [I.steam]: [sh(0, [0, 60, 44], [0, 52, 36], TS(0, 4, 0), TS(0, 4, 0), 52)],
  [I.turned]: [sh(0, KW(ME, [-5.2, 2.4, -.6]), KW(ME, [-4.6, 2.3, -.8]), KW(ME, [0, 2.2, -1.2]), null, 62)],
  [I.eye]: [sh(0, HP([-1.6, 1.3, 3.8]), HP([-1.3, 1.1, 3.0]), HW([0, .62, 1.9]), HW([0, .62, 1.9]), 52)],
  [I.waited]: [shF(0, ME, 1.45, 1.25, .3, 0, 70)],
  [I.didnt]: [sh(0, PZ(-4.2, 6.5, 4.2), PZ(-3.4, 5.4, 3.4), PZ(0, 3, 0), PZ(0, 0, 0), 56)],
  [I.newline]: [sh(0, TS(4.2, 2.8, 7.6), TS(4.4, 2.7, 6.8), TS(3, 2.0, 3.6), TS(3, 2.0, 3.6), 46)],
  [I.last]: [sh(0, PZ(3.4, 3, 6), PZ(-24, 32, 44), PZ(0, 1.6, 2), PZ(0, 2, 2), 52)],
};

//@@ESCENA
// ---------- la escena en cada instante
function setScene(t) {
  const L = lineAt(t), lt = t - s(L), len = (S[L + 1] ?? DUR) - s(L), k = P(lt, 0, len), Wd = kk => wt(L, kk);
  POST = { flash: 0, sepia: 0 };
  ALL.forEach(c => { if (c.polvo) c.polvo.forEach(q => q.visible = false); c.body.rotation.z = 0; c.head.rotation.z = 0; c.g.visible = false; c.g.scale.set(1, 1, 1); c.body.rotation.set(0, 0, 0); c.head.rotation.set(0, 0, 0); power(c, null, 0); c.aura.visible = false; setFace(c, "neutral"); pose(c, t, {}) });
  [PALA, REGLA, TELESC, HOYO, PAVA, PINZA, BEBE].forEach(o => o.visible = false); NUBE.forEach(n => n.visible = false); ANG.visible = false; GOTAS.forEach(g => g.material.opacity = 0); sinFuego();
  COCINA.visible = false; if (PAVA.parent !== COCINA) { COCINA.add(PAVA); PAVA.position.set(.15, .8, 0); PAVA.rotation.set(0, 0, 0) }
  const lugar = LUGAR(L); setEnv("dia"); if (lugar === "recuerdo") POST.sepia = .42;
  HOUSES.forEach(H => { H.panes.forEach(p => p.emissiveIntensity = 0); H.glows.forEach(g => g.visible = false) });
  CASAS[3].g.visible = L <= I.kitchen; CASAS[3].g.position.set(CASAS[3].lx, SY(CASAS[3].lx, CASAS[3].lz) - .3, CASAS[3].lz); CASAS[3].g.rotation.set(0, -Math.PI / 2, 0);
  ponerCartel(L >= I.newline);
  const crowd = list => list.forEach(([c, x, z, ry, f = "neutral", walk = 0]) => { placeC(c, x, z, ry); setFace(c, f); if (walk >= 1.2) { const d = Math.min(lt * 3.2, 9), nx = x + Math.sin(ry) * d, nz = z + Math.cos(ry) * d; placeC(c, nx, nz, ry); correr(c, t + x * 3) } else if (walk > 0) { const d = (lt - len / 2) * 1.5 * walk, nx = x + Math.sin(ry) * d, nz = z + Math.cos(ry) * d; placeC(c, nx, nz, ry); pose(c, t + x, { walk }); c.body.rotation.z = Math.sin((t + x) * 8) * .045; c.head.rotation.z = -Math.sin((t + x) * 8) * .03 } else pose(c, t + x, { walk }) });
  const mira = ([x, z]) => c => faceToC(c, x, z);
  let LL = [];
  tortuga(t, { paso: 0 }); gaviotas(t); espuma(t, { paso: 0 }); vida(t); noche(t, false);
  // pájaros: posados en el techo de la casa 5; en «birds» se espantan
  PAJAROS.forEach((g, i) => { const H = CASAS[5]; H.g.updateMatrix(); const b = new THREE.Vector3(-1.5 + i * .4, (H.Hh ?? 5) + 2.1, 0).applyMatrix4(H.g.matrix); const vuela = L === I.birds ? P(lt, .6 + i * .12, 2.2 + i * .12) : L > I.birds ? 1 : 0;
    g.visible = vuela < 1 || L === I.birds; g.position.set(b.x - vuela * 10 - i * vuela, b.y + vuela * (8 + i), b.z + vuela * (i - 4) * 2); g.rotation.y = vuela > 0 ? Math.PI : 0; g.userData.alas.forEach((a, j) => a.rotation.z = (j ? 1 : -1) * (vuela > 0 ? Math.sin(t * 30 + i) * .9 : .1)) });
  // pozo: soga, balde y agua según la frase
  const pz = { tirante: 0, nivel: -.6, balde: 2.2, derrame: 0 };
  if (L === I.hook || L === I.behind) { pz.tirante = L === I.hook ? .15 : .35; pz.nivel = L === I.hook ? -.6 : -.3 }
  if (L === I.rope) pz.balde = lerp(-1.2, 2.2, eIO(k));
  if (L === I.well) pz.nivel = -WY() + .3;
  if (L === I.cost) { pz.nivel = -.6 + (k > .6 ? 1.6 : 0) }
  if (L === I.tight || L === I.tight2) pz.tirante = .4 + .6 * k;
  if (L === I.rose || L === I.rose2) { pz.tirante = 1; pz.nivel = lerp(-.6, 1.0, eIO(k)); pz.derrame = P(k, .7, 1) }
  if ([I.head, I.eel, I.coils, I.kitchen, I.up, I.ran, I.bakery, I.hiss, I.next, I.steam, I.turned, I.eye, I.waited].includes(L)) { pz.tirante = 1; pz.nivel = 1.0; pz.derrame = 1 }
  if (L === I.didnt) { pz.tirante = 1 - k; pz.nivel = lerp(1, -.6, k); pz.derrame = 1 - k }
  if (L === I.flat) { pz.nivel = -.6; pz.derrame = .4 * (1 - k) }
  pozo(t, pz);
  if (L === I.well) LL.push([PZ(0, -8, 0)(), 1.2, "#9ab4c8", 20]);
  // la anguila
  if (L === I.cost && k > .62) anguila(t, R_SUBE, B_SUBE + lerp(-2, 10, eOut(P(k, .62, 1))), { boca: .6 });
  if (L === I.takes) anguila(t, R_PAVA, lerp(B_PAVA + 6, R_PAVA.L, eIO(P(k, 0, .7))), { boca: .2 + .8 * P(k, .3, .8) });
  if (L === I.head) anguila(t, R_ROSCA, B_ROSCA + lerp(-1, 9, eOut(k)), { boca: .1 });
  if (L === I.eel) anguila(t, R_ROSCA, B_ROSCA + 9 + k * 2, { boca: .15 });
  if (L === I.coils) anguila(t, R_ROSCA, lerp(B_ROSCA + 11, marca(R_ROSCA, SOBRE(7, -4, 2.2)), eIO(k)));
  if (L === I.kitchen) anguila(t, R_ROSCA, lerp(marca(R_ROSCA, SOBRE(7, -4, 2.2)), R_ROSCA.L, eIO(P(k, 0, .5))), { boca: k < .5 ? .3 + k * 1.4 : .9 });
  if (L === I.kitchen && k > .45) { const q = P(k, .45, .85); CASAS[3].g.position.y -= q * q * 9; CASAS[3].g.rotation.z = q * .5; CASAS[3].g.position.x += Math.sin(t * 40) * .1 * (1 - q); if (q >= 1) CASAS[3].g.visible = false }
  if (L === I.up) anguila(t, R_FUEGO, B_FUEGO + lerp(-1, 15, eOut(k)), { boca: .2, mira: PZ(0, 30, 6) });
  if (L === I.ran) anguila(t, R_FUEGO, lerp(B_FUEGO + 15, M_FUEGO[0] - 22, eIO(k)), { boca: .2 });
  if (L === I.bakery) anguila(t, R_FUEGO, lerp(M_FUEGO[0] - 22, M_FUEGO[0], eIO(k)));
  if (L === I.hiss) anguila(t, R_FUEGO, M_FUEGO[0] + k * 3);
  if (L === I.next) anguila(t, R_FUEGO, lerp(M_FUEGO[0] + 3, M_FUEGO[2], eIO(k)));
  if (L === I.steam) anguila(t, R_FUEGO, lerp(M_FUEGO[2], M_FUEGO[5], eIO(k)));
  if ([I.turned, I.eye, I.waited].includes(L)) anguila(t, R_FUEGO, lerp(M_FUEGO[5], R_FUEGO.L, L === I.turned ? eIO(k) : 1), { mira: KW(ME, [0, 1.6, 0]), boca: .1, ola: .4 });
  if (L === I.didnt) anguila(t, R_BAJA, lerp(R_BAJA.L, B_BAJA - 3, eIO(P(k, .25, 1))), { ola: .3 });
  // el fuego: arranca en la panadería, el viento lo pasa de techo en techo; la anguila lo apaga casa por casa
  const arde = [0, 0, 0, 0, 0, 0], vap = [0, 0, 0, 0, 0, 0];
  if (L <= I.behind) arde.fill(1);
  if (L === I.fire) arde[0] = .45 + .55 * k;
  if (L === I.wind) { arde[0] = 1; arde[1] = eIO(k); arde[3] = P(k, .5, 1) * .6 }
  if (L === I.buckets) { arde[0] = arde[1] = 1; arde[3] = .6 + .4 * k; arde[2] = P(k, .4, 1) * .7 }
  if (L >= I.slow && L <= I.ran) arde.fill(1);
  if (L === I.slow) { arde[4] = .5 + .5 * k; arde[5] = .3 + .7 * k }
  if (L === I.bakery) { arde.fill(1); arde[0] = 1 - P(k, .55, 1) * .7; vap[0] = P(k, .5, 1) }
  if (L === I.hiss) { arde.fill(1); arde[0] = .3 * (1 - k); vap[0] = 1 }
  if (L === I.next) { arde.fill(1); arde[0] = 0; vap[0] = .8; arde[1] = 1 - P(k, 0, .45); vap[1] = P(k, 0, .5); arde[2] = 1 - P(k, .5, .95); vap[2] = P(k, .5, 1) }
  if (L === I.steam) { arde.fill(0); [3, 4, 5].forEach((i, j) => { arde[i] = 1 - P(k, j * .3, j * .3 + .3) }); vap.fill(1) }
  if (L >= I.turned && L <= I.didnt) vap.fill(L === I.turned ? .8 : .55);
  if (L >= I.newline) vap.fill(.25);
  QUEMAN.forEach((f, i) => { if (arde[i] > 0 || vap[i] > 0) { const l = fuego(f, t, arde[i], vap[i]); if (l && LL.length < 6) LL.push(l) } });

  switch (L) {
    case I.hook: case I.behind: placeC(ME, WELL[0], WELL[1] + 2.05, Math.PI); setFace(ME, L === I.hook ? "kiss" : "terrified");
      if (L === I.hook) { pose(ME, t, { armFwd: .5 }); ME.body.rotation.x = .55 } else { pose(ME, t, {}); ME.head.rotation.y = Math.sin(t * 2) * .3 }
      crowd([[ME6, -2.8, 6.2, Math.PI - .5, "worried"], [GARROW, -1.2, 7.4, Math.PI + .4, "worried"]]); break;
    case I.never: crowd([[FOLK[0], -2.2, -6, .4, "neutral", .8], [FOLK[1], 2.6, -2, -.6, "happy", .8], [FOLK[2], -2.4, 9, 3, "neutral", .8], [ME, 3.6, 6, -2.4, "neutral"], [EXT[0], -1.6, 14, Math.PI, "happy", .8], [EXT[1], 4.2, -1, -1.2, "neutral", .7], [EXT[2], -8, 3.6, 1.6, "happy", .8], [EXT[3], 8, -1, -1.6, "neutral", .8]]); break;
    case I.cost: case I.rock: crowd([[FOLK[0], -3.2, -4, .4, "neutral", .6], [EXT[1], 4.2, -1, -1.2, "neutral", .7], [EXT[2], -8, 3.6, 1.6, "happy", .8]]); break;
    case I.takes: crowd([[FOLK[3], 3.3, 7.4, Math.PI, "terrified"]]); attach(PAVA, FOLK[3], "R", [0, -.35, .25]); pose(FOLK[3], t, { armFwd: .9, cover: .3 }); FOLK[3].body.rotation.x = -.2; break;
    case I.rope: crowd([[FOLK[1], 2.2, 1.3, -Math.PI / 2, "neutral"], [EXT[0], -2.8, 4, 2.4, "neutral"]]); pose(FOLK[1], t, { armFwd: 1 + Math.sin(t * 4) * .3 }); break;
    case I.sign: crowd([[EXT[2], .6, 6.5, 2.6, "neutral", .7], [FOLK[5], -2.6, 5.4, 2.2, "neutral", .6]]); break;
    case I.kettles: crowd([[QUILL, 1.8, 7.2, Math.PI - .2, "determined"]]); attach(PAVA, QUILL, "L", [0, -.35, .25]); attach(PINZA, QUILL, "R", [0, -.25, .12]); pose(QUILL, t, { armFwd: .85 + Math.sin(t * 9) * .08 }); QUILL.armR.rotation.x -= Math.max(0, Math.sin(t * 3)) * .3; break;
    case I.birds: crowd([[FOLK[4], 3.8, 8.6, Math.PI / 2, "angry"]]); pose(FOLK[4], t, { wave: 1, lift: .5 }); break;
    case I.hum: crowd([[FOLK[1], -2.4, 7.5, Math.PI / 2 + .3, "warm"], [EXT[3], -4, 11, 2.6, "neutral", .7]]); attach(BEBE, FOLK[1], "R", [-.25, -.2, .3]); pose(FOLK[1], t, { hug: 1 }); FOLK[1].head.rotation.x = .25 + Math.sin(t * 1.5) * .04; break;
    case I.rags: break;
    case I.garrow: case I.seen: crowd([[GARROW, -3.4, 4.4, -2.4, L === I.seen ? "squint" : "neutral"]]); pose(GARROW, t, { sit: .55 }); GARROW.g.position.y -= .25; break;
    case I.tinker: COCINA.visible = true; PAVA.visible = true; crowd([[FOLK[0], .2, -10.2, .6, "happy"]]); { const s2 = Math.sin(t * 50) * .01; PAVA.position.y = .8 + s2 } LL.push([OW(COCINA, [0, .6, .8])(), 1.4, "#ff8a40", 6]); break;
    case I.tight: case I.rose: crowd([[FOLK[0], 3.4, -2, -.7, "scared"], [EXT[1], -3.6, 4.2, 2.4, "terrified"]]); break;
    case I.head: case I.eel: crowd([[FOLK[0], 1.2, 13, Math.PI, "horrified"], [EXT[1], -1.4, 12, Math.PI, "terrified"], [EXT[3], 9, -1.2, -1.5, "terrified"]]); [FOLK[0], EXT[1], EXT[3]].forEach(c => pose(c, t, { cover: .6 })); break;
    case I.coils: crowd([[FOLK[0], 14, 8, .8, "panic", 1.4], [EXT[1], -14, 6, -.9, "panic", 1.4], [EXT[3], 10, -12, 2.4, "panic", 1.4]]); break;
    case I.kitchen: COCINA.visible = PAVA.visible = k < .55; crowd([[FOLK[0], -1.6, -12, 1.2, "horrified"]]); pose(FOLK[0], t, { cover: 1 }); break;
    case I.flat: break;
    case I.tinker2: break;
    case I.wren: crowd([[ME6, -1.6, 9.5, Math.PI - .4, "happy"], [ME, -.4, 12.5, Math.PI - .2, "neutral", .6]]); break;
    case I.barn: { GRANERO.updateMatrixWorld(true); const p = TURT.worldToLocal(GRANERO.localToWorld(new THREE.Vector3(0, 0, 4.2))); crowd([[ME6, p.x, p.z, .5, "kiss"]]); pose(ME6, t, { nod: Math.sin(t * 4) * .3 }); break }
    case I.told: { GRANERO.updateMatrixWorld(true); const p = TURT.worldToLocal(GRANERO.localToWorld(new THREE.Vector3(.4, 0, 3.2))), q = TURT.worldToLocal(GRANERO.localToWorld(new THREE.Vector3(.2, 0, 5.4)));
      crowd([[ME6, p.x, p.z, 0, k < .45 ? "sheepish" : "cheeky"], [ME, q.x, q.z, 0, "angry"]]); faceToC(ME, p.x, p.z); faceToC(ME6, q.x, q.z); pose(ME, t, { point: k < .5 ? 1 : 0 }); pose(ME6, t, { armL: .15, armR: .15 }); break }
    case I.fire: crowd([[PIM, 13.6, 1.6, Math.PI / 2, "horrified"], [EXT[0], 10, -2, .8, "panic", 1.3], [FOLK[2], 9, 5, -.6, "terrified"]]); pose(PIM, t, { cover: .5 + Math.sin(t * 6) * .2 }); break;
    case I.wind: crowd([[PIM, 12.6, 1.4, -Math.PI / 2, "panic", 1.4], [FOLK[2], 3, 6, Math.PI / 2, "terrified"]]); break;
    case I.buckets: { const fila = [[FOLK[0], 1.6, 3.6], [FOLK[1], 2.8, 5.0], [FOLK[2], 3.6, 6.4], [EXT[0], 4.2, 7.6], [EXT[2], 4.6, 8.4]]; fila.forEach(([c, x, z], i) => { placeC(c, x, z, -Math.PI / 2 - .5 + (i % 2) * .4); setFace(c, i % 2 ? "panic" : "determined"); pose(c, t + i * .5, { armFwd: .6 + Math.sin(t * 5 + i) * .4 }) }); attach(PAVA, FOLK[2], "R", [0, -.4, .2]); PAVA.visible = false;
      crowd([[QUILL, -2.8, 4, 2.2, "horrified"]]); break }
    case I.slow: crowd([[QUILL, -2.8, 4, 2.2, "horrified"], [FOLK[0], 1.6, 3.6, -1.8, "panic"], [FOLK[1], 2.8, 5, -1.6, "panic"]]); break;
    case I.arm: case I.looked: case I.knew: case I.lean: case I.loud: case I.tight2: case I.rose2: {
      const mp = L >= I.lean ? [WELL[0], WELL[1] + 2.05] : MEP; placeC(ME, mp[0], mp[1], L >= I.lean ? Math.PI : -2.6); ME.g.visible = true;
      setFace(ME, { [I.arm]: "worried", [I.looked]: "worried", [I.knew]: "determined", [I.lean]: "kiss", [I.loud]: "kiss", [I.tight2]: "scared", [I.rose2]: "terrified" }[L]);
      if (L === I.looked) ME.head.rotation.y = lt < Wd(5) - s(L) ? .5 : -.6;
      if (L === I.lean || L === I.loud) { ME.body.rotation.x = .55; pose(ME, t, { armFwd: .5 }); ME.body.rotation.x = .55 }
      if (L === I.loud) ME.body.position.y += Math.sin(t * 30) * .01;
      crowd([[ME6, mp[0] - (L >= I.lean ? 2.8 : 1.6), mp[1] + (L >= I.lean ? 2.6 : 1.4), L >= I.lean ? Math.PI - .4 : -2.2, L === I.knew ? "determined" : "worried"], [GARROW, mp[0] - (L >= I.lean ? 1 : -1.5), mp[1] + (L >= I.lean ? 4 : .6), L >= I.lean ? Math.PI : -1.9, L === I.arm ? "determined" : "worried"]]);
      if (L === I.arm) { faceToC(GARROW, ME.g.position.x, ME.g.position.z); pose(GARROW, t, { armFwd: .9 }); faceToC(ME, GARROW.g.position.x, GARROW.g.position.z) }
      if (L === I.knew) faceToC(ME6, ME.g.position.x, ME.g.position.z);
      if (L >= I.tight2) crowd([[FOLK[0], 5, 4, -1.6, "terrified"], [EXT[1], -5, 6, 2, "horrified"]]);
      break }
    case I.up: case I.ran: { placeC(ME, WELL[0] + .6, WELL[1] + 3.4, Math.PI, ); setFace(ME, "terrified"); pose(ME, t, { cover: L === I.up ? .4 : 0 });
      crowd([[ME6, -2.4, 6.2, Math.PI - .6, "terrified"], [GARROW, 3.2, 5.4, -2.2, "horrified"]]);
      if (L === I.ran) crowd([[FOLK[0], 3, 5, .3, "panic", 1.4], [FOLK[1], -3, 4, -.3, "panic", 1.4], [FOLK[2], 4, 3, .9, "panic", 1.4], [EXT[0], -4, 2, -.8, "panic", 1.4], [EXT[2], 2, 6, .1, "panic", 1.4], [QUILL, -1, 5.6, -.1, "panic", 1.4]]);
      break }
    case I.bakery: case I.hiss: case I.next: case I.steam:
      crowd([[ME, WELL[0] + .6, WELL[1] + 3.4, .9, "shock"], [ME6, -2, 7, .5, "shock"], [GARROW, 3.4, 6, .8, "relieved"], [FOLK[0], 9, 14, -2.4, "shock"], [PIM, 12, -3, -1, "shock"]]); break;
    case I.turned: case I.eye: case I.waited:
      crowd([[ME, MEP[0], MEP[1] + .4, Math.PI + .2, L === I.waited ? "scared" : "terrified"], [ME6, -2.4, 7.2, 2.6, "terrified"]]); if (L === I.waited) pose(ME, t, { armL: .1, armR: .1 }); break;
    case I.didnt: crowd([[ME, MEP[0], MEP[1] + .4, Math.PI + .2, "relieved"], [ME6, -1.2, 6.4, 2.6, "shock"]]); break;
    case I.newline: crowd([[ME, .2, 7.0, Math.PI - .4, "happy"], [ME6, -1.0, 7.2, Math.PI - .2, "happy"], [QUILL, 5.4, 4.6, -2.0, "neutral"]]); break;
    case I.last: crowd([[ME, .9, 4.4, Math.PI, "warm"], [ME6, -.6, 4.6, Math.PI, "happy"], [GARROW, 2.6, 5.4, -2.6, "relieved"], [FOLK[1], -3, 6, 2.6, "happy"], [EXT[2], 4, 7, -2.6, "happy"]]); break;
  }
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

