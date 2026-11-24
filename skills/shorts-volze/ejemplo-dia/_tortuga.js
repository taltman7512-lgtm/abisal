//@@MUNDO
// ---------- luz más cuidada: sombras más finas, luz de contorno fría del lado opuesto al sol
sun.shadow.mapSize.set(4096, 4096); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null } sun.shadow.bias = -.0003; sun.shadow.normalBias = .03;
const CONTRA = new THREE.DirectionalLight("#d6e4ff", .9); CONTRA.position.set(60, 35, 70); scene.add(CONTRA);

// ---------- el mar poco profundo, el agua honda y la costa (modo día)
const T_AGUA = tex(2048, 2048, (g, w, h) => { const r = rng(91); g.fillStyle = "#2fa3b4"; g.fillRect(0, 0, w, h);
  for (let k = 0; k < 9000; k++) { const x = r() * w, y = r() * h, l = 20 + r() * 60; g.strokeStyle = r() < .55 ? "rgba(255,255,255,.16)" : "rgba(10,70,90,.18)"; g.lineWidth = 2 + r() * 3; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 6, x + l, y); g.stroke() } }, [8, 8]);
const AGUA = part(new THREE.PlaneGeometry(900, 900), new THREE.MeshStandardMaterial({ map: T_AGUA, color: "#ffffff", roughness: .18, metalness: .25, transparent: true, opacity: .86 }), 0, 0, 0, scene, 0); AGUA.rotation.x = -Math.PI / 2; AGUA.receiveShadow = true;
const T_ARENA = tex(2048, 2048, (g, w, h) => { const r = rng(92); g.fillStyle = "#c8b48a"; g.fillRect(0, 0, w, h); for (let k = 0; k < 30000; k++) { g.fillStyle = r() < .5 ? "rgba(120,100,70,.18)" : "rgba(255,240,210,.18)"; g.fillRect(r() * w, r() * h, 3, 3) } }, [12, 12]);
const FONDO = part(new THREE.PlaneGeometry(900, 900), SMt(T_ARENA, { roughness: 1 }), 0, -3, 0, scene, 0); FONDO.rotation.x = -Math.PI / 2;
// el agua honda: una mancha azul oscuro hacia +x (adonde quiere ir la tortuga)
const HONDA = part(new THREE.CircleGeometry(260, 48), new THREE.MeshStandardMaterial({ color: "#0b3a63", roughness: .2, metalness: .3, transparent: true, opacity: .9 }), 330, .02, -40, scene, 0); HONDA.rotation.x = -Math.PI / 2;
// la costa hacia −x: playa, pasto y colinas
const T_PASTO = tex(1024, 1024, (g, w, h) => { const r = rng(93); g.fillStyle = "#6f9a45"; g.fillRect(0, 0, w, h); for (let k = 0; k < 6000; k++) { const v = r(); g.strokeStyle = v < .4 ? "rgba(60,95,35,.55)" : v < .75 ? "rgba(150,185,80,.45)" : "rgba(200,170,80,.35)"; g.lineWidth = 2; const x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 6, y - 8 - r() * 10); g.stroke() } }, [30, 30]);
const COSTA = new THREE.Group(); scene.add(COSTA); COSTA.position.set(-160, 0, 0);
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
    else { const rr = 3 + r() * 7; g.fillStyle = "#e6e0d0"; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); g.fillStyle = "#3a3228"; g.beginPath(); g.arc(x, y, rr * .35, 0, 7); g.fill() } }
  g.save(); const tp = Array.from({ length: 30 }, (_, i) => { const a = i / 30 * 6.28; return [w / 2 + Math.cos(a) * w * .4 * (.95 + r() * .08), h / 2 + Math.sin(a) * h * .42 * (.95 + r() * .08)] }); aMano(g, tp, r, 40); g.clip();
  g.fillStyle = "#86704f"; g.fillRect(0, 0, w, h); manchas(g, r, 120, w, h, "#5a4a32", 40, 220, .1, .3); manchas(g, r, 90, w, h, "#c8b48a", 40, 200, .06, .18); manchas(g, r, 90, w, h, "#5a7a34", 30, 180, .15, .4);
  for (let k = 0; k < 2600; k++) { const x = r() * w, y = r() * h; g.strokeStyle = `rgba(${60 + r() * 50 | 0},${100 + r() * 50 | 0},${30 + r() * 30 | 0},${.4 + r() * .4})`; g.lineWidth = 1.5 + r() * 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 10, y - 8 - r() * 14); g.stroke() }
  for (let k = 0; k < 1500; k++) { g.fillStyle = rgbj(r() < .5 ? "#9a8a72" : "#5a4a38", r, 40, .8); g.beginPath(); g.ellipse(r() * w, r() * h, 2 + r() * 5, 1.5 + r() * 4, r() * 3, 0, 7); g.fill() }
  const calle = (x0, z0, x1, z1, an) => { for (let q = 0; q <= 1; q += .0025) { const x = X(lerp(x0, x1, q)) + Math.sin(q * 9) * 10, y = Z(lerp(z0, z1, q)); for (let k = 0; k < 3; k++) { if (r() < .12) continue; const px = x + (r() - .5) * an, py = y + (r() - .5) * an, sz = 7 + r() * 10, pts = Array.from({ length: 6 }, (_, i) => { const a = i / 6 * 6.28 + r() * .5; return [px + Math.cos(a) * sz * (.7 + r() * .4), py + Math.sin(a) * sz * (.6 + r() * .4)] });
      aMano(g, pts, r, 4); g.fillStyle = rgbj(["#9a9082", "#8a8274", "#a89c88", "#7e7466"][r() * 4 | 0], r, 30); g.fill(); g.strokeStyle = "rgba(40,30,20,.5)"; g.lineWidth = 2; g.stroke(); g.fillStyle = "rgba(255,250,235,.15)"; g.beginPath(); g.arc(px - sz * .25, py - sz * .25, sz * .3, 0, 7); g.fill() } } };
  calle(0, -28, 0, 28, 120); calle(-24, 0, 24, 0, 96); g.restore() });
const M_CAPA = SMt(T_CAPA, { roughness: .85, bumpMap: T_CAPA, bumpScale: 2.5 });
// el costado del caparazón: costuras de los escudos, chorreado de sal, flecos de algas y racimos de percebes
const T_LADO = tex(2048, 512, (g, w, h) => { const r = rng(99), gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#5a4c2e"); gr.addColorStop(.55, "#3a3220"); gr.addColorStop(1, "#1e2a1c"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  let x = 0; while (x < w) { x += 50 + r() * 40; g.strokeStyle = "#1a140c"; g.lineWidth = 5 + r() * 4; g.beginPath(); g.moveTo(x, 0); for (let y = 0; y < h; y += 30) g.lineTo(x + (r() - .5) * 10, y); g.stroke() }
  manchas(g, r, 80, w, h, "#2a4a2a", 20, 120, .15, .4);
  for (let k = 0; k < 500; k++) { const x0 = r() * w, y0 = r() * h * .5, L = 30 + r() * 200; g.strokeStyle = r() < .5 ? "rgba(230,230,215,.18)" : "rgba(10,20,10,.25)"; g.lineWidth = 1 + r() * 3; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + (r() - .5) * 6, y0 + L); g.stroke() }
  for (let k = 0; k < 900; k++) { const x0 = r() * w, y0 = h * (.45 + r() * .55); g.strokeStyle = `rgba(${40 + r() * 30 | 0},${100 + r() * 50 | 0},${40 + r() * 20 | 0},${.4 + r() * .4})`; g.lineWidth = 2 + r() * 3; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 + (r() - .5) * 20, y0 + 20, x0 + (r() - .5) * 14, y0 + 30 + r() * 50); g.stroke() }
  for (let k = 0; k < 40; k++) { const cx = r() * w, cy = h * (.3 + r() * .5), n = 8 + r() * 20; for (let s = 0; s < n; s++) { const x1 = cx + (r() - .5) * 60, y1 = cy + (r() - .5) * 40, rr = 3 + r() * 8; g.fillStyle = rgbj("#e2dccb", r, 30); g.beginPath(); g.arc(x1, y1, rr, 0, 7); g.fill(); g.fillStyle = "#3a3228"; g.beginPath(); g.arc(x1, y1, rr * .35, 0, 7); g.fill() } } });

{ const geo = new THREE.PlaneGeometry(2 * SB, 2 * SA, 120, 150); geo.rotateX(-Math.PI / 2); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setY(i, SY(p.getX(i), p.getZ(i))); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, M_CAPA); m.castShadow = m.receiveShadow = true; TURT.add(m);
  // el costado del caparazón hasta el agua, con el borde aserrado y percebes
  const lado = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.08, 9, 64, 1, true), SMt(T_LADO, { roughness: .9, bumpMap: T_LADO, bumpScale: 2 })); lado.scale.set(SB, 1, SA); lado.position.y = RIM - 4.4; lado.castShadow = true; TURT.add(lado);
  const bor = new THREE.InstancedMesh(new THREE.ConeGeometry(1.4, 2.4, 4), SM("#3a3220", { roughness: 1 }), 48); TURT.add(bor); for (let k = 0; k < 48; k++) { const a = k / 48 * Math.PI * 2; dummy.position.set(Math.cos(a) * SB * 1.04, RIM - .4, Math.sin(a) * SA * 1.04); dummy.rotation.set(Math.PI / 2 + .3, 0, -a + Math.PI / 2); dummy.scale.setScalar(1); dummy.updateMatrix(); dummy.lookAt(Math.cos(a) * 99, RIM - 2, Math.sin(a) * 99); dummy.updateMatrix(); bor.setMatrixAt(k, dummy.matrix) }
  const perc = new THREE.InstancedMesh(new THREE.ConeGeometry(.35, .5, 6), SM("#d8d2c2", { roughness: .9 }), 420); TURT.add(perc); const r = rng(96); for (let k = 0; k < 420; k++) { const a = r() * Math.PI * 2, y = RIM - 1 - r() * 7; dummy.position.set(Math.cos(a) * SB * (1.02 + (RIM - y) * .008), y, Math.sin(a) * SA * (1.02 + (RIM - y) * .008)); dummy.rotation.set(r(), r(), r()); dummy.scale.setScalar(.6 + r() * 1.2); dummy.updateMatrix(); perc.setMatrixAt(k, dummy.matrix) } }
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
const T_PARPADO = tex(1024, 512, (g, w, h) => { const r = rng(200); g.fillStyle = "#6e6e52"; g.fillRect(0, 0, w, h); manchas(g, r, 40, w, h, "#3a3a28", 20, 100, .15, .35);
  for (let k = 0; k < 26; k++) { const y0 = r() * h; g.strokeStyle = "rgba(25,25,15,.55)"; g.lineWidth = 2 + r() * 3; g.beginPath(); for (let x = 0; x <= w; x += 20) { const y = y0 + Math.sin(x * .02 + k) * 6 + (r() - .5) * 3; x ? g.lineTo(x, y) : g.moveTo(x, y) } g.stroke(); g.strokeStyle = "rgba(220,210,170,.2)"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, y0 + 5); g.lineTo(w, y0 + 5 + (r() - .5) * 8); g.stroke() } });
// el ojo: globo oscuro y húmedo con venitas, iris dorado con fibras radiales, pecas, anillo oscuro y pupila redonda
const T_IRIS = tex(2048, 1024, (g, w, h) => { const r = rng(199), cx = w * .25, cy = h * .5, R = 310;
  g.fillStyle = "#2a1e14"; g.fillRect(0, 0, w, h); manchas(g, r, 30, w, h, "#4a3022", 40, 200, .2, .5);
  for (let k = 0; k < 40; k++) { let x = cx + (r() - .5) * 900, y = cy + (r() - .5) * 700; g.strokeStyle = "rgba(140,40,30,.4)"; g.lineWidth = 1 + r() * 2; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 8; s++) { x += (r() - .5) * 40; y += (r() - .5) * 40; g.lineTo(x, y) } g.stroke() }
  const gr = g.createRadialGradient(cx, cy, 20, cx, cy, R); gr.addColorStop(0, "#3a1a08"); gr.addColorStop(.3, "#a05a14"); gr.addColorStop(.6, "#d89a2a"); gr.addColorStop(.85, "#b8741c"); gr.addColorStop(1, "#3a2410"); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
  for (let k = 0; k < 700; k++) { const a = r() * 6.283, r0 = R * (.22 + r() * .2), r1 = R * (.6 + r() * .38); g.strokeStyle = r() < .5 ? `rgba(255,${200 + r() * 55 | 0},${110 + r() * 60 | 0},${.15 + r() * .3})` : `rgba(80,${30 + r() * 30 | 0},5,${.15 + r() * .3})`; g.lineWidth = 1 + r() * 3; g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); g.quadraticCurveTo(cx + Math.cos(a + .05) * (r0 + r1) / 2, cy + Math.sin(a + .05) * (r0 + r1) / 2, cx + Math.cos(a + (r() - .5) * .1) * r1, cy + Math.sin(a) * r1); g.stroke() }
  for (let k = 0; k < 30; k++) { const a = r() * 6.283, rr = R * (.45 + r() * .4); g.fillStyle = "rgba(60,25,5,.4)"; g.beginPath(); g.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 4 + r() * 12, 0, 7); g.fill() }
  g.strokeStyle = "rgba(20,10,4,.85)"; g.lineWidth = 26; g.beginPath(); g.arc(cx, cy, R - 10, 0, 7); g.stroke();
  g.fillStyle = "#050302"; g.beginPath(); g.arc(cx, cy, R * .3, 0, 7); g.fill() });
const T_PIEL = T_CAB;
const M_PIEL = SMt(T_CAB, { roughness: .7, bumpMap: T_CAB, bumpScale: 3 }), M_CUELLO = SMt(T_CUELLO, { roughness: .72, bumpMap: T_CUELLO, bumpScale: 3.5 }), M_ALETA = SMt(T_ALETA, { roughness: .7, bumpMap: T_ALETA, bumpScale: 3 });
const M_PICO = SMt(T_PICO, { roughness: .45, bumpMap: T_PICO, bumpScale: 1 }), M_PARPADO = SMt(T_PARPADO, { roughness: .7, bumpMap: T_PARPADO, bumpScale: 2.5, side: THREE.DoubleSide });
// el cuello con pliegues de verdad (la geometría se arruga donde la textura tiene los pliegues)
const GEO_CUELLO = (() => { const geo = new THREE.CylinderGeometry(4.6, 6, 14, 48, 60, true), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), v = (y + 7) / 14, a = Math.atan2(z, x);
    let k = 1 + Math.sin(a * 3 + v * 5) * .02; PLIEGUES.forEach(py => { k -= .055 * Math.exp(-(((v - (1 - py)) / .018) ** 2)) * (1 + .4 * Math.sin(a * 2 + py * 20)) }); k += .02 * Math.sin(v * 40 + a * 1.5);
    p.setX(i, x * k); p.setZ(i, z * k) } geo.computeVertexNormals(); return geo })();
function ojoTortuga(s) { const G = new THREE.Group(); CABEZA.add(G); G.position.set(s * 6.6, 7.2, 17.5); G.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(s * .8, .12, .6).normalize());
  G.add(new THREE.Mesh(new THREE.SphereGeometry(1.9, 64, 40), new THREE.MeshStandardMaterial({ map: T_IRIS, roughness: .25 })));
  G.add(new THREE.Mesh(new THREE.SphereGeometry(1.97, 48, 32), new THREE.MeshPhysicalMaterial({ color: "#ffffff", transparent: true, opacity: .14, roughness: .02, clearcoat: 1, clearcoatRoughness: 0, depthWrite: false })));
  for (const [dx, dy, rr] of [[-.55, .75, .3], [.4, -.25, .11]]) { const b = new THREE.Mesh(new THREE.SphereGeometry(rr, 12, 8), new THREE.MeshBasicMaterial({ color: "#fffdf5" })); b.position.set(dx * s, dy, 1.72); G.add(b) }
  const sup = new THREE.Mesh(new THREE.SphereGeometry(2.18, 48, 24, 0, Math.PI * 2, 0, Math.PI * .3), M_PARPADO); sup.rotation.x = .22; sup.castShadow = true; G.add(sup);
  const inf = new THREE.Mesh(new THREE.SphereGeometry(2.12, 48, 24, 0, Math.PI * 2, Math.PI * .74, Math.PI * .26), M_PARPADO); inf.rotation.x = -.2; G.add(inf);
  for (const [rr, tb, z] of [[2.35, .32, -.2], [2.85, .3, -.55], [3.4, .26, -.95]]) { const an = new THREE.Mesh(new THREE.TorusGeometry(rr, tb, 12, 48), M_PIEL); an.position.z = z; an.scale.set(1.12, .92, 1); G.add(an) }
  const mb = SM("#e2dccb", { roughness: .9 }), md = SM("#3a3228");
  for (let k = 0; k < 14; k++) { const ph = .2 * Math.PI + k / 13 * .6 * Math.PI, th = Math.PI * (.27 + (k % 3) * .02), n = new THREE.Vector3(-Math.cos(ph) * Math.sin(th), Math.cos(th), Math.sin(ph) * Math.sin(th));
    const b = new THREE.Mesh(new THREE.ConeGeometry(.22 + (k % 2) * .08, .4, 7), mb); b.position.copy(n).multiplyScalar(2.24); b.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n); sup.add(b);
    const hb = new THREE.Mesh(new THREE.CircleGeometry(.07, 8), md); hb.position.set(0, .205, 0); hb.rotation.x = -Math.PI / 2; b.add(hb) }
  return G }
const CABEZA = new THREE.Group(); TURT.add(CABEZA); CABEZA.position.set(0, 7.5, SA + 4);
{ const cu = new THREE.Mesh(GEO_CUELLO, M_CUELLO); cu.position.set(0, 0, 3); cu.rotation.x = Math.PI / 2 - .35; cu.castShadow = true; CABEZA.add(cu);
  const cab = part(new THREE.SphereGeometry(1, 64, 48), M_PIEL, 0, 4, 13, CABEZA, 0); cab.scale.set(9, 7, 11);
  // forma de tortuga: cejas óseas, mejillas, quijada y un pico con punta en gancho
  for (const s of [-1, 1]) { const ce = part(new THREE.SphereGeometry(1, 32, 20), M_PIEL, s * 5.6, 9.4, 16.4, CABEZA, 0); ce.scale.set(3.2, 1.3, 3.4); ce.rotation.set(-.2, s * .4, s * -.3);
    const me = part(new THREE.SphereGeometry(1, 32, 20), M_PIEL, s * 6.4, 3.2, 15.5, CABEZA, 0); me.scale.set(3, 3, 4.6); ojoTortuga(s);
    part(new THREE.SphereGeometry(.7, 12, 8), SM("#1a1a14"), s * 2.2, 5.6, 23.4, CABEZA, 0) }   // narinas
  const qu = part(new THREE.SphereGeometry(1, 40, 24), M_PIEL, 0, 1.2, 16, CABEZA, 0); qu.scale.set(7.2, 3.2, 8.4);
  const pico = part(new THREE.SphereGeometry(1, 40, 24), M_PICO, 0, 1.6, 21.5, CABEZA, 0); pico.scale.set(6, 2.6, 4);
  const gan = part(new THREE.SphereGeometry(1, 24, 16), M_PICO, 0, 2.2, 24.4, CABEZA, 0); gan.scale.set(1.8, 1.6, 1.2);
  const boca = new THREE.CatmullRomCurve3([[-6.2, 2.4, 15.5], [-4.6, 1.5, 20], [-2, 1.1, 23.6], [0, 1.0, 24.6], [2, 1.1, 23.6], [4.6, 1.5, 20], [6.2, 2.4, 15.5]].map(q => new THREE.Vector3(...q)));
  CABEZA.add(new THREE.Mesh(new THREE.TubeGeometry(boca, 60, .22, 8, false), SM("#14120c", { roughness: .6 }))) }

const CABL = new THREE.Object3D(); CABEZA.add(CABL); CABL.position.set(0, 11, 12);   // arriba de la cabeza (donde se para Garrow)
const ALETAS = [[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sz]) => { const piv = new THREE.Group(); TURT.add(piv); piv.position.set(sx * SB * .78, 2.2, sz * SA * .55); const f = part(new THREE.SphereGeometry(1, 30, 16), M_ALETA, sx * 9, -1.2, 0, piv, 0); f.scale.set(sz > 0 ? 14 : 9, 1.6, sz > 0 ? 6 : 5); f.rotation.y = sx * sz * .35; return { piv, sx, sz } });
{ const c = part(new THREE.ConeGeometry(3, 10, 16), M_PIEL, 0, 2.5, -SA - 3, TURT, 0); c.rotation.x = -Math.PI / 2 - .2 }
// aliento: nube tibia que sale de las narinas · espuma alrededor del cuerpo
const NUBE = Array.from({ length: 18 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#f2f2ee", transparent: true, opacity: 0, depthWrite: false })); scene.add(s); return s });
function aliento(t, k) { CABEZA.updateMatrixWorld(true); const o = new THREE.Vector3(0, 5.6, 24).applyMatrix4(CABEZA.matrixWorld); NUBE.forEach((s, i) => { const q = ((t * .35 + i / 18) % 1); s.visible = k > 0; s.position.set(o.x + Math.sin(i * 2.3) * q * 8, o.y + q * 9, o.z + q * 14); s.scale.setScalar(4 + q * 16); s.material.opacity = (1 - q) * .3 * k }) }
const ESPUMA = Array.from({ length: 30 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#ffffff", transparent: true, opacity: .5, depthWrite: false })); TURT.add(s); const a = i / 30 * Math.PI * 2; s.position.set(Math.cos(a) * SB * 1.12, .3, Math.sin(a) * SA * 1.12); s.scale.set(7, 1.6, 1); return s });
function tortuga(t, { paso = 1, bajo = 0, giro = 0, incl = 0, flinch = 0 } = {}) {
  // camina: las aletas reman (un paso cada tanto) y el cuerpo sube y baja apenas
  const ph = t * .9 * paso; ALETAS.forEach(({ piv, sx, sz }, i) => { const f = Math.sin(ph + (sx * sz > 0 ? 0 : Math.PI)); piv.rotation.set(0, sx * f * .35, sx * (.15 + f * .12)) });
  TURT.position.y = -bajo + Math.sin(ph * 2) * .25 * paso + flinch * Math.sin(t * 40) * .4; TURT.rotation.set(incl * .6 + flinch * .03 * Math.sin(t * 33), giro, incl + flinch * .04 * Math.sin(t * 29));
  CABEZA.rotation.set(Math.sin(t * .4) * .04 - flinch * .2, Math.sin(t * .3) * .08, 0);
  T_AGUA.offset.set(t * .004 * paso, t * .012 * paso); ESPUMA.forEach((s, i) => s.material.opacity = .35 + .2 * Math.sin(t * 2 + i));
}

// ---------- Shellbrook arriba del caparazón (todo hijo de TURT)
const enConcha = (o, x, z, ry = 0, dy = 0) => { if (o.parent !== TURT) TURT.add(o); o.position.set(x, SY(x, z) + dy, z); o.rotation.y = ry; return o };
const casa = (x, z, ry, op = {}) => { const H = house(0, 0, 1, op); H.g.removeFromParent(); enConcha(H.g, x, z, ry, -.3); part(new THREE.BoxGeometry((op.w ?? 7) + .4, 3, 6.4), M_STONE, 0, -1.4, 0, H.g, 0); H.lx = x; H.lz = z; return H };
// calle principal de atrás (−z) hacia la cabeza (+z), casas a los dos lados mirando a la calle
const CASAS = [];
[[-6.8, -18, 1], [6.8, -18, -1], [-6.8, -9, 1], [6.8, -9, -1], [-6.8, 9, 1], [6.8, 9, -1], [-6.8, 18, 1], [-15, -2, 0], [15, -14, 0], [-16, 14, 0], [16, 16, 0]].forEach(([x, z, s], i) => CASAS.push(casa(x, z, s ? s * Math.PI / 2 : (x < 0 ? Math.PI / 2 : -Math.PI / 2), { v: i, h: 4.6 + (i % 3) * .5, w: 6.4 })));
const NUESTRA = casa(6.8, 18, -Math.PI / 2, { v: 12, h: 5, w: 6.4 });
const PANADERIA = casa(18.5, 3, -Math.PI / 2, { v: 13, h: 4.6, w: 6.2 });          // la de Pim (se cae al mar en el recuerdo)
const ESCUELA = casa(-18, -14, Math.PI / 2, { v: 14, h: 5.4, w: 7 });
// reglas amarillas colgadas junto a cada puerta
const T_REGLA = tex(64, 512, (g, w, h) => { g.fillStyle = "#f2c41e"; g.fillRect(0, 0, w, h); g.fillStyle = "#2a2416"; for (let y = 8; y < h; y += 16) g.fillRect(0, y, y % 64 === 8 ? 30 : 16, 3) });
const M_REGLA = SMt(T_REGLA, { roughness: .5 });
[...CASAS, NUESTRA, PANADERIA, ESCUELA].forEach(H => part(new THREE.BoxGeometry(.25, 1.6, .06), M_REGLA, 1.05, 1.7, 3.06, H.walls[0], 0));
// carteles de oficio
const cartelito = (H, txt, bg = "#3a2618") => { const m = part(new THREE.PlaneGeometry(2.4, .6), SMt(tex(512, 128, (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = "#d9c08a"; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12); g.font = "800 72px 'Special Elite'"; g.fillStyle = "#f2e6c4"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, w / 2, h / 2 + 4) })), 0, 3.6, 3.08, H.walls[0], 0); return m };
cartelito(PANADERIA, "BAKERY"); cartelito(ESCUELA, "SCHOOL", "#2a3a5a"); cartelito(CASAS[3], "RULERS", "#5a4a1a");
// la iglesia arriba de todo, con el campanario de Garrow
const IGLESIA = new THREE.Group(); enConcha(IGLESIA, 0, -14, Math.PI, -.4);
{ part(new THREE.BoxGeometry(7, 7, 11), M_STONE, 0, 3.5, 0, IGLESIA, 0); const half = 4.0, rh = 3.4, sl = Math.hypot(half, rh), a = Math.atan2(rh, half); for (const s of [-1, 1]) { const m = part(new THREE.BoxGeometry(sl, .25, 11.6), M_SHING, s * half / 2, 7 + rh / 2, 0, IGLESIA, 0); m.rotation.z = -s * a }
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
const HUERTAS = [[-9, 2], [-12, -11.5]].map(([x, z]) => { const g = new THREE.Group(); enConcha(g, x, z, 0, -.1); part(new THREE.BoxGeometry(3, .35, 2), SMt(T_DIRT), 0, .17, 0, g, 0); for (let k = 0; k < 8; k++) { const zx = -1.1 + (k % 4) * .73, zz = -.5 + Math.floor(k / 4) * 1; part(new THREE.ConeGeometry(.12, .25, 8), SM("#e8792a"), zx, .38, zz, g, 0); for (let j = 0; j < 3; j++) { const h = part(new THREE.ConeGeometry(.05, .5, 4), SM("#4f8a3a"), zx + (j - 1) * .06, .65, zz, g, 0); h.rotation.z = (j - 1) * .4 } } return g });
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
const HOYO = (() => { const g = new THREE.Group(); const m = part(new THREE.CircleGeometry(1, 24), SMt(tex(256, 256, (q, w, h) => { const gr = q.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, "#120a06"); gr.addColorStop(.6, "#3a2414"); gr.addColorStop(1, "#5a3a22"); q.fillStyle = gr; q.fillRect(0, 0, w, h) }), { roughness: 1 }), 0, .12, 0, g, 0); m.rotation.x = -Math.PI / 2; const borde = part(new THREE.TorusGeometry(1.05, .22, 8, 28), SMt(T_DIRT), 0, .12, 0, g, 0); borde.rotation.x = Math.PI / 2; const piel = part(new THREE.CircleGeometry(.6, 20), SMt(T_PIEL, { color: "#d8b0a0", emissive: "#6a2a1a", emissiveIntensity: .25 }), 0, .14, 0, g, 0); piel.rotation.x = -Math.PI / 2; g.userData.piel = piel;
  const mont = part(new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), SMt(T_DIRT), 1.6, 0, .4, g, 0); g.userData.mont = mont; return g })();
const PALA = new THREE.Group(); part(new THREE.CylinderGeometry(.045, .045, 2.0, 8), SM("#8a5a30"), 0, -.6, .1, PALA, 0); { const b = part(new THREE.BoxGeometry(.42, .5, .05), SM("#8a8a90", { metalness: .7, roughness: .35 }), 0, -1.8, .14, PALA, 0) } part(new THREE.BoxGeometry(.4, .07, .07), SM("#8a5a30"), 0, .42, .1, PALA, 0);
const REGLA = new THREE.Group(); part(new THREE.BoxGeometry(.12, 1.2, .03), M_REGLA, 0, -.5, .12, REGLA, 0);
const TELESC = new THREE.Group(); { const tb = part(new THREE.CylinderGeometry(.09, .13, 1.1, 12), SM("#b8893a", { metalness: .8, roughness: .3 }), 0, -.1, .3, TELESC, 0); tb.rotation.x = Math.PI / 2 }
const TAZAS = new THREE.Group(); { const mesa = part(new THREE.BoxGeometry(2, .12, 1.2), M_PLANK, 0, 1.4, 0, TAZAS, 0); for (const [x, z] of [[-.9, -.5], [.9, -.5], [-.9, .5], [.9, .5]]) part(new THREE.BoxGeometry(.1, 1.4, .1), M_BEAM, x, .7, z, TAZAS, 0);
  TAZAS.userData.tazas = [[-.5, .1], [0, -.2], [.55, .15]].map(([x, z], i) => { const c = new THREE.Group(); c.position.set(x, 1.46, z); TAZAS.add(c); part(new THREE.CylinderGeometry(.13, .1, .22, 14), SM(["#e8dcc0", "#c94b4b", "#3f6a8a"][i]), 0, .11, 0, c, 0); part(new THREE.TorusGeometry(.07, .02, 6, 12), SM(["#e8dcc0", "#c94b4b", "#3f6a8a"][i]), .14, .12, 0, c, 0); return c }) }
enConcha(TAZAS, 2.6, 13.5, -Math.PI / 2, -.1);
const PECERA = new THREE.Group(); { part(new THREE.SphereGeometry(.5, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), SMt(T_DIRT), 0, 0, 0, PECERA, 0); part(new THREE.BoxGeometry(.06, .7, .06), M_BEAM, 0, .5, 0, PECERA, 0); part(new THREE.BoxGeometry(.4, .06, .06), M_BEAM, 0, .65, 0, PECERA, 0) }
enConcha(PECERA, 2.4, -2.5, 0, -.05);


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
const GAVIOTAS = Array.from({ length: 9 }, (_, i) => { const g = new THREE.Group(); scene.add(g); const m = SM("#f4f4f0"); const c = part(new THREE.CapsuleGeometry(.18, .6, 4, 8), m, 0, 0, 0, g, 0); c.rotation.x = Math.PI / 2;
  const alas = [-1, 1].map(sx => { const a = new THREE.Group(); a.position.x = sx * .12; g.add(a); part(new THREE.BoxGeometry(1.1, .04, .35), m, sx * .55, 0, 0, a, 0); part(new THREE.BoxGeometry(.3, .045, .36), SM("#2a2a2a"), sx * 1.0, 0, 0, a, 0); return a });
  g.userData = { alas, r: 30 + i * 6, h: 26 + (i % 3) * 5, v: .25 + (i % 4) * .05, ph: i * 1.7 }; return g });
function gaviotas(t) { TURT.updateMatrixWorld(true); const c = TURT.getWorldPosition(new THREE.Vector3()); GAVIOTAS.forEach(g => { const u = g.userData, a = t * u.v + u.ph; g.position.set(c.x + Math.cos(a) * u.r, u.h + Math.sin(t * .7 + u.ph) * 2, c.z + Math.sin(a) * u.r); g.rotation.set(0, -a, Math.sin(t * .5 + u.ph) * .2); u.alas.forEach((al, i) => al.rotation.z = (i ? -1 : 1) * Math.sin(t * 6 + u.ph) * .5) }) }

// nubes con forma y un muelle con botes en la costa
const NUBES = Array.from({ length: 16 }, (_, i) => { const r = rng(300 + i), g = new THREE.Group(); scene.add(g); const a = r() * Math.PI * 2, d = 160 + r() * 160; g.position.set(Math.cos(a) * d, 70 + r() * 50, Math.sin(a) * d);
  for (let k = 0; k < 6; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#ffffff", transparent: true, opacity: .85, depthWrite: false, fog: false })); sp.position.set((r() - .5) * 40, (r() - .3) * 8, (r() - .5) * 20); sp.scale.set(30 + r() * 30, 16 + r() * 12, 1); g.add(sp) } return g });
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
  [...CASAS, NUESTRA, ESCUELA].forEach((H, i) => { if (i % 2) return; const c = part(new THREE.BoxGeometry(.8, 2.4, .8), M_STONE, (H.Wd ?? 6.4) / 2 - 1.3, (H.Hh ?? 5) + 1.6, -1, H.g, 0); c.castShadow = true; part(new THREE.BoxGeometry(1, .2, 1), M_STONE, 0, 1.25, 0, c, 0); HUMO_PTS.push(c) });
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

//@@ELENCO
// ---------- elenco: diseños propios de bloques (nada del protagonista de Volze ni marcas)
const ME = kid({ skin: "#e8b48c", shirt: "#d1872e", cloth: "plain", pants: "#3a4a5a", shoes: "#4a3020", hair: "#3a2416", style: "despeinado" });
const ME6 = kid({ skin: "#e8b48c", shirt: "#d1872e", cloth: "plain", pants: "#3a4a5a", shoes: "#4a3020", hair: "#3a2416", style: "despeinado" }); ME6.body.scale.setScalar(.7);
const QUILL = kid({ skin: "#f0c6a0", shirt: "#2e2e4a", cloth: "suit", alt: "#a82a2a", pants: "#2e2e4a", shoes: "#111", hair: "#9a9a9a", style: "corto" });
const PIM = kid({ skin: "#c98e64", shirt: "#f2ece0", cloth: "plain", pants: "#5a4632", shoes: "#2a2420", hair: "#2b211b", style: "corto" });
const GARROW = kid({ skin: "#d9b08c", shirt: "#3a5a4a", cloth: "sweater", alt: "#c9b48a", pants: "#3a3236", shoes: "#2a2420", hair: "#e9e4dc", style: "corto" });
const FOLK = [["#7a3a2a", "plaid", "#3a3236", "#2b211b", "corto", "#c98e64"], ["#3f6a8a", "sweater", "#3a3f4a", "#6b3f22", "melena", "#f2cfae"], ["#5a7a3a", "plain", "#3a2f28", "#c9a06a", "liso", "#e8b48c"], ["#8a5a8a", "cardigan", "#3a3236", "#9a9a9a", "rodete", "#efc8a8"], ["#c9a23a", "plain", "#2e3a59", "#1d1a17", "rulos", "#8a5a3c"], ["#3a4a5a", "plain", "#2a2420", "#7a4a2a", "puntas", "#f2cfae"]].map(([sh, c, p, h, st, sk]) => { const k = kid({ skin: sk, shirt: sh, cloth: c, alt: "#d9c7a0", pants: p, shoes: "#2a2420", hair: h, style: "corto" }); k.peloR6 = [st, h]; return k });
const EXT = [["#b85a3a", "#3a3f4a", "#efc8a8"], ["#4a8a6a", "#3a2f28", "#8a5a3c"], ["#e0c060", "#2e3a59", "#f2cfae"], ["#7a4a8a", "#2a2420", "#c98e64"]].map(([sh, p, sk]) => kid({ skin: sk, shirt: sh, cloth: "plain", pants: p, shoes: "#2a2420", hair: "#2b211b", style: "corto" }));
const ALL = [ME, ME6, QUILL, PIM, GARROW, ...FOLK, ...EXT];
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

robloxify(ME, { skin: "#e8b48c", shirt: "#d1872e", pants: "#3a4a5a", shoes: "#4a3020", pelo: ["puntas", "#3a2416"] });
robloxify(ME6, { skin: "#e8b48c", shirt: "#d1872e", pants: "#3a4a5a", shoes: "#4a3020", pelo: ["puntas", "#3a2416"] });
robloxify(QUILL, { skin: "#f0c6a0", shirt: "#2e2e4a", cloth: "suit", alt: "#a82a2a", pants: "#2e2e4a", shoes: "#111", pelo: ["corto", "#9a9a9a"] });
robloxify(PIM, { skin: "#c98e64", shirt: "#f2ece0", pants: "#5a4632", pelo: ["corto", "#2b211b"] });
robloxify(GARROW, { skin: "#d9b08c", shirt: "#3a5a4a", cloth: "sweater", alt: "#c9b48a", pants: "#3a3236", pelo: ["rodete", "#e9e4dc"] });
FOLK.forEach((k, i) => robloxify(k, { skin: ["#c98e64", "#f2cfae", "#e8b48c", "#efc8a8", "#8a5a3c", "#f2cfae"][i], shirt: ["#7a3a2a", "#3f6a8a", "#5a7a3a", "#8a5a8a", "#c9a23a", "#3a4a5a"][i], cloth: ["plaid", "sweater", "plain", "cardigan", "plain", "plain"][i], alt: "#d9c7a0", pants: ["#3a3236", "#3a3f4a", "#3a2f28", "#3a3236", "#2e3a59", "#2a2420"][i], pelo: k.peloR6 }));
EXT.forEach((k, i) => robloxify(k, { skin: ["#efc8a8", "#8a5a3c", "#f2cfae", "#c98e64"][i], shirt: ["#b85a3a", "#4a8a6a", "#e0c060", "#7a4a8a"][i], pants: ["#3a3f4a", "#3a2f28", "#2e3a59", "#2a2420"][i], pelo: [["liso", "#6b3f22"], ["rulos", "#1d1a17"], ["trenzas", "#c9a06a"], ["corto", "#3a2416"]][i] }));
// sombrero de copa del intendente, gorro de panadero, barba de Garrow
{ const hm = SM("#1a1a1e", { roughness: .5 }); part(new THREE.CylinderGeometry(.34, .34, .6, 18), hm, 0, 1.05, 0, QUILL.head, 0); part(new THREE.CylinderGeometry(.52, .52, .05, 20), hm, 0, .76, 0, QUILL.head, 0); part(new THREE.CylinderGeometry(.35, .35, .1, 18), SM("#a82a2a"), 0, .82, 0, QUILL.head, 0);
  part(new THREE.CylinderGeometry(.36, .3, .4, 16), SM("#ffffff"), 0, .9, 0, PIM.head, 0); part(new THREE.SphereGeometry(.45, 16, 10), SM("#ffffff"), 0, 1.18, 0, PIM.head, 0); part(RB(.9, .7, .1, .04), SM("#ffffff"), 0, 1.5, .27, PIM.body, 0);
  part(RB(.5, .26, .14, .06, 1), new THREE.MeshStandardMaterial({ color: "#e9e4dc", flatShading: true }), 0, .17, .34, GARROW.head, 0) }

//@@LUGAR
const LUGAR = L => [I.heart, I.hum].includes(L) ? "noche" : (L >= I.pim && L <= I.firstone) ? "recuerdo" : "pueblo";

//@@SHOTS
// helpers: puntos en el caparazón (se mueven con la tortuga) y alturas sobre la superficie
const TW = v => () => TURT.localToWorld(new THREE.Vector3(...v)).toArray();
const TS = (x, dy, z) => TW([x, SY(x, z) + dy, z]);
const CABW = v => () => { CABEZA.updateMatrixWorld(true); return CABEZA.localToWorld(new THREE.Vector3(...v)).toArray() };
const HOYOP = (o = [0, 0, 0]) => () => HOYO.localToWorld(new THREE.Vector3(...o)).toArray();
const TOWR = o => () => { const tw = IGLESIA.userData.torre; tw.updateMatrixWorld(true); return tw.localToWorld(new THREE.Vector3(...o)).toArray() };
const KW = (k, o) => () => add(k.g.getWorldPosition(new THREE.Vector3()).toArray(), o);
// lugares del pueblo (todos en calles o en la plaza, lejos de las paredes)
const HUERTA0 = [-9, 2], PEZ = [2.4, -2.5], HOYO_REGLA = [-9, -2.6], HOYO_PANADERIA = [13.2, 2], HOYO_CHICO = [13, -6];
const SHOTS = {
  [I.hook]: [sh(0, TW([-70, 22, 92]), TW([-62, 20, 86]), TW([0, 6, 22]), TW([0, 6, 20]), 52), sh(5, TW([26, 12, 84]), TW([22, 11, 80]), CABW([0, 5, 16]), CABW([0, 5, 16]), 52)],
  [I.cost]: [sh(0, HOYOP([-2.2, 3.6, 2.6]), HOYOP([-1.9, 3.2, 2.2]), HOYOP([0, 0, 0]), HOYOP([0, 0, 0]), 58), sh(4, CABW([14, -1, 44]), CABW([12, 0, 40]), CABW([0, 6, 12]), CABW([0, 5, 12]), 56)],
  [I.down]: [sh(0, [-90, 30, 40], [-80, 24, 30], TW([0, 6, 0]), TW([0, 0, 0]), 52)],
  [I.walks]: [sh(0, TW([-52, 1.2, 30]), TW([-50, 1.4, 22]), TW([-24, -1, 20]), TW([-24, -1, 16]), 66), sh(5, TW([-70, 24, -60]), TW([-62, 22, -50]), TW([0, 6, 0]), TW([0, 6, 6]), 48)],
  [I.rattle]: [sh(0, () => add(TAZAS.localToWorld(new THREE.Vector3(0, 1.5, 0)).toArray(), [1.2, .6, 1.4]), null, () => TAZAS.localToWorld(new THREE.Vector3(0, 1.5, 0)).toArray(), null, 60), sh(4, TS(0, 2.6, -4), TS(0, 2.8, -1), TS(0, 3, 14), TS(0, 3, 14), 56)],
  [I.carrots]: [shF(0, ME, 2.4, 2.0, .7, .3, 64, -.8), sh(4, TS(-10.8, 2.0, -.6), TS(-10.5, 1.9, -.3), TS(HUERTA0[0], .3, HUERTA0[1]), null, 60)],
  [I.goldfish]: [sh(0, TS(-.9, 1.7, -5), TS(-.7, 1.5, -4.6), TS(PEZ[0], 1.2, PEZ[1]), TS(PEZ[0], 1.2, PEZ[1]), 60), shF(5, ME, 1.8, 1.5, .5, 0, 66)],
  [I.ruler]: [shF(0, QUILL, 2.2, 1.9, .5, .1, 64), sh(6, HOYOP([-4, 7, -4]), HOYOP([-3.6, 6.4, -3.6]), HOYOP([0, 0, 0]), null, 58)],
  [I.sign]: [sh(0, TS(3.2, 2.6, 9.8), TS(3.2, 2.7, 9.0), TS(3.2, 2.7, 3.5), TS(3.2, 2.7, 3.5), 50)],
  [I.doors]: [sh(0, TS(-1.6, 2.0, -6.2), TS(-1.3, 2.0, -11), TS(3.8, 1.8, -8), TS(3.8, 1.8, -10.5), 60)],
  [I.twelve]: [shF(0, ME, 2.6, 2.2, .4, .3, 62), shF(8, ME, 2.6, 2.2, -.7, -.2, 60, -.5)],
  [I.edge]: [sh(0, TS(.8, 3.6, 19.5), TS(.8, 3.8, 20.3), CABW([0, 6, 16]), CABW([0, 6, 16]), 54)],
  [I.church]: [sh(0, TW([-30, 6, 90]), TW([-27, 6, 87]), TW([0, 12, 10]), TW([0, 12, 10]), 50)],
  [I.barnacles]: [sh(0, CABW([12, 11, 25]), CABW([11, 10.5, 23.5]), CABW([6.6, 8.6, 17.6]), CABW([6.6, 8.6, 17.6]), 50)],
  [I.breath]: [sh(0, CABW([-22, 6, 30]), CABW([-20, 7, 29]), CABW([0, 9, 26]), CABW([0, 11, 28]), 56), sh(7, TS(-6, 2, 22.4), TS(-5.6, 2, 22.8), TS(-3, 2.6, 25), TS(-3, 2.6, 25), 60)],
  [I.heart]: [sh(0, TS(3, 3, 10), TS(2.6, 2.8, 10.5), TS(0, .5, 13.2), null, 56), sh(10, TS(2.6, 2.6, 13.5), TS(2.2, 2.6, 12.5), TS(-3.8, 2.8, 9), null, 58)],
  [I.hum]: [sh(0, TS(2.6, 2.6, 13.5), TS(2.2, 2.6, 12.5), TS(-3.8, 2.8, 9), TS(-3.8, 2.8, 9), 58)],
  [I.pim]: [shF(0, PIM, 2.6, 2.2, .6, .2, 62)],
  [I.two]: [sh(0, HOYOP([1.2, 3.4, 3.0]), HOYOP([1.1, 3.0, 2.7]), HOYOP([0, 0, 0]), HOYOP([0, 0, 0]), 60)],
  [I.cold]: [shF(0, ME6, 1.5, 1.3, .3, 0, 66)],
  [I.stopped]: [sh(0, TW([-50, 4, 60]), TW([-48, 4, 56]), CABW([0, 6, 10]), CABW([0, 6, 10]), 56)],
  [I.tilted]: [sh(0, TW([-60, 2, 30]), TW([-58, 2.4, 28]), TW([0, 6, 0]), TW([0, 6, 0]), 54, { shake: .12 })],
  [I.water]: [sh(0, TS(4, 1.2, -2), TS(4.4, 1.2, -2.2), TS(12, 0, -4), TS(12, 0, -4), 60)],
  [I.bakery]: [sh(0, TW([60, 3, 10]), TW([56, 3, 8]), () => PANADERIA.g.getWorldPosition(new THREE.Vector3()).toArray(), null, 54)],
  [I.filled]: [sh(0, HOYOP([1.8, 2.0, 1.6]), HOYOP([1.5, 1.8, 1.3]), HOYOP([0, .2, 0]), HOYOP([0, .2, 0]), 60)],
  [I.rose]: [sh(0, TW([-50, 1, 30]), TW([-48, 1.4, 28]), TW([0, 6, 0]), TW([0, 8, 0]), 54)],
  [I.rulers]: [shF(0, PIM, 3.2, 2.8, .5, -.2, 60, -.6)],
  [I.firstone]: [shF(0, QUILL, 3.2, 2.8, -.6, -.2, 60, -.6)],
  [I.noticed]: [shF(0, ME6, 1.7, 1.45, .2, 0, 68)],
  [I.away]: [sh(0, TW([4, 60, 30]), TW([4, 56, 26]), TW([8, 0, 2]), TW([8, 0, 2]), 52)],
  [I.nobody]: [sh(0, TS(12.5, 2.2, 4.2), TS(12.7, 2.2, 4.0), TS(11, 1.6, 4.6), TS(11, 1.6, 4.6), 62)],
  [I.turned]: [sh(0, TW([0, 110, 40]), TW([0, 100, 36]), TW([0, 0, 0]), TW([0, 0, 0]), 50)],
  [I.deep]: [sh(0, CABW([-5, 11, -6]), CABW([-4.5, 10.6, -3]), TW([90, 0, 110]), TW([110, 0, 120]), 56)],
  [I.garrow]: [sh(0, CABW([-4, 12, 8]), CABW([-3.6, 12.2, 8.6]), CABW([0, 12, 12]), CABW([0, 12, 12]), 58), shF(5, GARROW, 2.4, 1.8, .9, 0, 60)],
  [I.quiet]: [shF(0, GARROW, 2.0, 1.7, -.4, -.1, 64)],
  [I.home]: [sh(0, CABW([3, 10, 16]), CABW([2.6, 10.2, 15.4]), CABW([0, 12.5, 12]), null, 62), sh(4, CABW([9, 12, -6]), CABW([7, 11, -2]), CABW([0, 2, 30]), CABW([0, 2, 34]), 56)],
  [I.born]: [sh(0, TW([80, 8, 40]), TW([76, 8, 46]), TW([0, 4, 10]), TW([0, 4, 10]), 52)],
  [I.bottom]: [sh(0, TW([20, 30, -20]), TW([22, 28, -14]), TW([60, -10, 110]), TW([60, -12, 110]), 56)],
  [I.higher]: [sh(0, TW([50, 8, 4]), TW([47, 8, 6]), TW([0, 10, 0]), TW([0, 10, 0]), 56)],
  [I.market]: [sh(0, TW([-34, 16, 44]), TW([-31, 15, 41]), TS(-14, 0, 24), TS(-14, 0, 24), 54), sh(5, TW([-40, 18, -26]), TW([-37, 17, -24]), TS(-18, 0, -14), TS(-18, 0, -14), 54)],
  [I.steps]: [sh(0, TW([5, 16.5, -28]), TW([4.4, 16, -27.4]), TW([0, 13.2, -22]), TW([0, 13.2, -22]), 58)],
  [I.pray]: [shF(0, QUILL, 2.2, 1.9, .4, 0, 64)],
  [I.uphill]: [sh(0, TS(0, 9, 16), TS(0, 10, 13), TS(0, 2, 0), TS(0, 2, -2), 56)],
  [I.bell]: [sh(0, TOWR([3.5, 12, 6]), TOWR([3.1, 11.8, 5.4]), TOWR([0, 11.4, 0]), TOWR([0, 11.4, 0]), 58)],
  [I.shovel]: [sh(0, KW(ME, [-3.2, 2.4, -1]), null, KW(ME, [0, 1.6, 0]), null, 64)],
  [I.side]: [sh(0, TS(9, 3.4, -4.5), TS(9.4, 3.4, -4.7), TW([40, 0, -6]), TW([40, 0, -6]), 56)],
  [I.yells]: [shF(0, QUILL, 1.8, 1.5, .2, 0, 70)],
  [I.everybody]: [sh(0, TS(8, 3, -1.5), TS(7.4, 3.2, -1.8), TS(1, 2, -5.5), TS(1, 2, -5.5), 58)],
  [I.one]: [sh(0, HOYOP([0, 3.8, -2.4]), HOYOP([0, 3.4, -2.1]), HOYOP([0, .2, 0]), HOYOP([0, .2, 0]), 60)],
  [I.two2]: [shF(0, ME, 1.6, 1.4, .4, -.2, 70)],
  [I.cold2]: [sh(0, HOYOP([.3, 1.0, -2.2]), HOYOP([.3, .9, -1.9]), HOYOP([0, .1, 0]), HOYOP([0, .1, 0]), 62)],
  [I.three]: [sh(0, KW(ME, [2.6, 2.2, -2.6]), null, KW(ME, [0, 1.2, 0]), null, 62)],
  [I.alive]: [sh(0, HOYOP([.9, 2.2, 1.4]), HOYOP([.7, 1.8, 1.1]), HOYOP([0, 0, 0]), HOYOP([0, 0, 0]), 58)],
  [I.warm]: [shF(0, ME, 1.4, 1.2, .3, .2, 70, -.2)],
  [I.flinch]: [sh(0, CABW([14, 8, 30]), CABW([13, 8, 29]), CABW([0, 6, 18]), CABW([0, 6, 18]), 56, { shake: .25 })],
  [I.turns]: [sh(0, TW([0, 70, 30]), TW([0, 66, 26]), TW([0, 0, 0]), TW([0, 0, 0]), 52)],
  [I.shore]: [sh(0, CABW([-3, 9, -10]), CABW([-2.6, 9.4, -8]), [-160, 2, 0], [-160, 4, 0], 54)],
  [I.sigh]: [sh(0, TW([26, 10, -12]), TW([24, 9, -11]), TS(13, 0, -6), TS(13, 0, -6), 56)],
  [I.life]: [shF(0, ME, 1.8, 1.5, .4, .1, 66)],
  [I.last]: [sh(0, TW([-30, 10, 50]), TW([-60, 34, 90]), TW([0, 8, 0]), TW([0, 8, 0]), 52)],
};

//@@ESCENA
// ---------- la escena en cada instante
function setScene(t) {
  const L = lineAt(t), lt = t - s(L), len = (S[L + 1] ?? DUR) - s(L), k = P(lt, 0, len), Wd = kk => wt(L, kk);
  POST = { flash: 0, sepia: 0 };
  if (GARROW.g.parent !== TURT) TURT.add(GARROW.g);
  ALL.forEach(c => { c.g.visible = false; c.g.scale.set(1, 1, 1); c.body.rotation.set(0, 0, 0); c.head.rotation.set(0, 0, 0); power(c, null, 0); c.aura.visible = false; setFace(c, "neutral"); pose(c, t, {}) });
  [PALA, REGLA, TELESC, HOYO].forEach(o => o.visible = false); NUBE.forEach(n => n.visible = false);
  const lugar = LUGAR(L); setEnv(lugar === "noche" ? "tarde" : "dia"); if (lugar === "recuerdo") POST.sepia = .3;
  PANADERIA.g.visible = L <= I.bakery || L >= I.turned; PANADERIA.g.position.set(PANADERIA.lx, SY(PANADERIA.lx, PANADERIA.lz) - .3, PANADERIA.lz); PANADERIA.g.rotation.set(0, -Math.PI / 2, 0);
  if (L > I.bakery && L < I.turned) PANADERIA.g.visible = false;   // en el recuerdo, después de caerse ya no está
  if (L >= I.rulers) PANADERIA.g.visible = false;                    // y hoy en su lugar hay un hueco con tierra
  HOUSES.forEach(H => { H.panes.forEach(p => p.emissiveIntensity = lugar === "noche" ? .7 : 0); H.glows.forEach(g => g.visible = lugar === "noche") });
  IGLESIA.userData.campana.rotation.z = 0; TENDEDERO.userData.ropa.forEach((m, i) => m.rotation.y = Math.sin(t * 2 + i) * .25);
  TAZAS.userData.tazas.forEach(c => c.position.y = 1.46);
  const crowd = list => list.forEach(([c, x, z, ry, f = "neutral", walk = 0]) => { placeC(c, x, z, ry); setFace(c, f); pose(c, t + x, { walk }) });
  const hoyo = ([x, z], esc, mont, piel = false) => { HOYO.visible = true; enConcha(HOYO, x, z, 0, .02); HOYO.scale.setScalar(esc); HOYO.userData.mont.scale.setScalar(mont); HOYO.userData.piel.visible = piel };
  const mira = ([x, z]) => c => faceToC(c, x, z);
  let LL = [];
  // la tortuga: camina; se hunde en «down»; en el recuerdo se inclina hacia el pozo de Pim; hoy gira hacia lo hondo y se hunde
  // (bajo = cuánto baja el caparazón: el mar está en y = 0, así que el agua entra sola al pueblo)
  let tort = { paso: 1 };
  if (L === I.down) tort = { paso: .3, bajo: eIO(k) * 22, incl: -.1 * k };
  if (L >= I.stopped && L <= I.rose) { const kk = L === I.stopped ? 0 : L === I.tilted ? eIO(k) : L < I.filled ? 1 : L === I.filled ? 1 - .3 * k : .7 * (1 - eIO(k)); tort = { paso: L === I.stopped ? 0 : .2, bajo: 6 * kk, incl: -.3 * kk } }
  if (L >= I.noticed && L <= I.nobody) tort = { paso: .2, bajo: 6, incl: -.3 };
  if (L >= I.turned) {
    const g = L === I.turned ? eIO(k) * .55 : L < I.flinch ? .55 : L === I.flinch ? .55 : L === I.turns ? .55 - eIO(k) * 1.1 : -.55;
    const B = { [I.higher]: 5 * k, [I.market]: 5 + 7.5 * k, [I.steps]: 12.5 + .8 * k, [I.turns]: 13.3 - 5 * eIO(k), [I.shore]: 8.3 - 5 * eIO(k), [I.sigh]: 3.3 * (1 - eIO(k)) }, base = L < I.higher ? 0 : L >= I.sigh ? 0 : 13.3;
    tort = { paso: .8, giro: g, bajo: B[L] ?? base, flinch: L === I.flinch ? 1 - k * .6 : 0 } }
  tortuga(t, tort); gaviotas(t); humo(t); if ([I.breath, I.edge, I.church, I.barnacles].includes(L)) aliento(t, L === I.breath ? 1 : .4);

  switch (L) {
    case I.hook: crowd([[FOLK[0], -2, -6, .4], [FOLK[1], 2.5, -2, -.6, "happy", 1], [FOLK[2], -2, 8, 3, "neutral", 1], [ME, 2.0, 12, Math.PI], [EXT[0], -1.4, 16, Math.PI, "happy", 1], [EXT[1], 1.6, 3, 0, "neutral", 1], [EXT[2], -8, 3.6, 1.6, "happy", 1], [EXT[3], 8, -1, -1.6, "neutral", 1]]); break;
    case I.cost: hoyo(HOYO_REGLA, .7, .5); crowd([[QUILL, HOYO_REGLA[0] + 1.2, HOYO_REGLA[1] + .4, 0, "angry"]]); mira(HOYO_REGLA)(QUILL); attach(REGLA, QUILL, "R", [0, -.2, .1]); pose(QUILL, t, { point: 1 }); break;
    case I.down: break;
    case I.walks: case I.rattle:
      if (L === I.rattle) TAZAS.userData.tazas.forEach((c, i) => c.position.y = 1.46 + Math.abs(Math.sin(t * 22 + i)) * .03 * (Math.sin(t * 5.6) > .4 ? 1 : 0));
      crowd([[FOLK[3], -1.8, 4, 0, "neutral", .7], [FOLK[4], 1.6, 9, Math.PI, "neutral", .7], [EXT[0], -1, 12, Math.PI, "happy", .8], [EXT[1], 2, 15, Math.PI, "neutral", .8], [EXT[2], -2, 18, 0, "happy", .8], [EXT[3], 6, 2, -1.6, "neutral", .8]]); break;
    case I.carrots: crowd([[ME, HUERTA0[0] + .2, HUERTA0[1] + 1.5, Math.PI, "happy"]]); pose(ME, t, { armFwd: .8 + Math.sin(t * 5) * .1 }); ME.body.rotation.x = .3; attach(PALA, ME, "R", [0, -.2, .2]); PALA.rotation.set(.6, 0, 0); break;
    case I.goldfish: crowd([[ME, PEZ[0] + 1.2, PEZ[1] + .9, 0, "sad"]]); mira(PEZ)(ME); pose(ME, t, { nod: 1 }); break;
    case I.ruler: case I.sign: case I.doors:
      if (L === I.ruler) hoyo(HOYO_REGLA, .5, .4);
      crowd([[QUILL, HOYO_REGLA[0] + .9, HOYO_REGLA[1] + .5, 0, "suspicious"], [FOLK[2], HOYO_REGLA[0] - 1.4, HOYO_REGLA[1] + .9, Math.PI / 2, "worried"], [FOLK[5], -1.6, 6.5, Math.PI - .3, "neutral", .8], [FOLK[1], -1.2, -12, 0, "neutral", .6]]);
      mira(HOYO_REGLA)(QUILL); attach(REGLA, QUILL, "R", [0, -.2, .1]); pose(QUILL, t, { armFwd: .9 }); QUILL.body.rotation.x = .35; break;
    case I.twelve: crowd([[ME, 1.4, 16.5, -Math.PI / 2 + .5, "excited"]]); attach(PALA, ME, "R", [0, -.2, .2]); PALA.rotation.set(0, 0, 0); pose(ME, t, { armFwd: .4, lift: .25 }); break;
    case I.edge: case I.church: case I.barnacles: case I.breath:
      crowd([[ME, .8, 23.4, 0, "curious"], [FOLK[0], -1.2, 21, .2, "neutral"]]); break;
    case I.heart: case I.hum: placeC(ME, 0, 13.2, Math.PI / 2); ME.g.position.y += .35; ME.body.rotation.x = -Math.PI / 2 + .05; setFace(ME, "warm"); LL.push([TS(-2.6, 3, 15.5)(), 2, "#ffc480", 10]); break;
    case I.pim: case I.two:
      hoyo(HOYO_PANADERIA, L === I.pim ? .5 : .9, L === I.pim ? .5 : 1);
      crowd([[PIM, HOYO_PANADERIA[0] - 1.2, HOYO_PANADERIA[1] + .2, Math.PI / 2, "determined"], [ME6, 11, 4.6, 0, "curious"]]); mira(HOYO_PANADERIA)(ME6);
      attach(PALA, PIM, "R", [0, -.2, .2]); pose(PIM, t, { armFwd: .7 + Math.sin(t * 6) * .25 }); PIM.body.rotation.x = .35; break;
    case I.cold: case I.stopped: case I.tilted: case I.water: case I.bakery: case I.filled: case I.rose:
    case I.noticed: case I.away: case I.nobody: {
      hoyo(HOYO_PANADERIA, .9, L >= I.filled && L <= I.rose ? 1 - k * .8 : L > I.rose ? .2 : 1);
      const susto = L >= I.tilted && L <= I.filled ? "terrified" : L === I.noticed ? "suspicious" : "scared";
      crowd([[ME6, 11, 4.6, 0, susto], [FOLK[2], 9.6, 6.2, Math.PI / 2, "terrified"], [FOLK[3], 9.4, -1, Math.PI / 2, "horrified"], [EXT[0], 7, 3, Math.PI / 2, "terrified"], [EXT[2], 6.4, 0, Math.PI / 2, "scared"]]); mira(HOYO_PANADERIA)(ME6);
      if ((L >= I.tilted && L <= I.filled) || L === I.nobody) [FOLK[2], FOLK[3]].forEach(c => { c.body.rotation.z = .12; pose(c, t, { hug: 1 }) });
      if (L === I.bakery) { const q = eIO(k); PANADERIA.g.position.x = PANADERIA.lx + q * 14; PANADERIA.g.position.y -= q * q * 16; PANADERIA.g.rotation.z = -q * .9 }
      if (L === I.filled) { placeC(PIM, HOYO_PANADERIA[0] - .9, HOYO_PANADERIA[1] + .4, Math.PI / 2); setFace(PIM, "pleading"); pose(PIM, t, { armFwd: 1 + Math.sin(t * 8) * .3 }); PIM.body.rotation.x = .7 }
      break }
    case I.rulers: case I.firstone:
      crowd([[PIM, 1.6, -6, -Math.PI / 2 + .3, "gloomy"], [QUILL, -1.2, -5.4, Math.PI / 2, L === I.firstone ? "happy" : "neutral"]]); attach(REGLA, PIM, "R", [0, -.2, .1]); pose(PIM, t, { armFwd: .6 });
      if (L === I.firstone) { const r2 = REGLA.clone(); QUILL.handR.add(r2); r2.position.set(0, -.2, .1); r2.userData.tmp = 1; pose(QUILL, t, { armFwd: .6 }) } break;
    case I.turned: case I.deep: case I.born: case I.bottom: crowd([[FOLK[0], -2, 20, .3, "worried"], [FOLK[1], 2, 18, -.2, "worried"]]); break;
    case I.garrow: case I.quiet: case I.home:
      GARROW.g.visible = true; if (GARROW.g.parent !== CABEZA) CABEZA.add(GARROW.g); GARROW.g.position.set(0, 10.9, 12); GARROW.g.rotation.set(-.2, L === I.garrow ? 0 : Math.PI, 0);
      setFace(GARROW, L === I.garrow ? "squint" : "gloomy"); attach(TELESC, GARROW, "R", [0, -.1, .2]); pose(GARROW, t, { armFwd: L === I.garrow ? 1.3 : .2 }); break;
    case I.higher: case I.market: case I.steps: case I.pray: case I.uphill:
      crowd([[QUILL, -1, 7.2, 0, L === I.pray ? "pleading" : "horrified"], [FOLK[0], -3, 9, Math.PI, "terrified", 1.4], [FOLK[1], 2, 10, Math.PI, "panic", 1.4], [FOLK[2], 0, 13, Math.PI, "terrified", 1.4], [FOLK[5], 2.6, 6, Math.PI, "panic", 1.4], [EXT[0], -2, 14, Math.PI, "panic", 1.4], [EXT[1], 1, 16, Math.PI, "terrified", 1.4], [EXT[3], -4, 11, Math.PI, "panic", 1.4]]);
      if (L === I.uphill) [FOLK[0], FOLK[1], FOLK[2], FOLK[5]].forEach((c, i) => { const z = 15 - k * 12 - i; placeC(c, c.g.position.x, z, Math.PI); pose(c, t + i, { walk: 1.6 }) });
      if (L === I.pray) pose(QUILL, t, { hug: 1 }); break;
    case I.bell: { GARROW.g.visible = true; const tw = IGLESIA.userData.torre; tw.updateMatrixWorld(true); const p = TURT.worldToLocal(tw.localToWorld(new THREE.Vector3(.4, 10.4, -.8))); GARROW.g.position.copy(p); GARROW.g.rotation.set(0, Math.PI, 0);
      setFace(GARROW, "terrified"); pose(GARROW, t, { lift: .6 + Math.sin(t * 6) * .3 }); IGLESIA.userData.campana.rotation.z = Math.sin(t * 6) * .5; break }
    case I.shovel: case I.side: { const q = L === I.shovel ? k : 1, x = lerp(2, HOYO_CHICO[0] - 1.1, q), z = lerp(4, HOYO_CHICO[1] + .3, q); placeC(ME, x, z, Math.atan2(HOYO_CHICO[0] - 2, HOYO_CHICO[1] - 4)); pose(ME, t, { walk: L === I.shovel ? 1.6 : 0 }); setFace(ME, "determined"); attach(PALA, ME, "R", [0, -.2, .2]); PALA.rotation.set(0, 0, 0);
      crowd([[FOLK[0], -2, 2, Math.PI, "panic", 1.2], [FOLK[1], 1, 0, Math.PI, "panic", 1.2]]); break }
    case I.yells: case I.everybody: crowd([[QUILL, 2, -4, Math.PI / 2 + .5, "horrified"], [FOLK[0], 0, -6, Math.PI / 2, "panic"], [FOLK[1], 1.6, -7, Math.PI / 2 + .3, "horrified"], [FOLK[2], -1, -5, Math.PI / 2, "panic"], [FOLK[5], 3, -6.4, Math.PI / 2, "terrified"], [EXT[0], -.4, -7.4, Math.PI / 2, "panic"], [EXT[1], 2.4, -8, Math.PI / 2, "horrified"]]); if (L === I.yells) pose(QUILL, t, { point: 1 }); break;
    case I.one: case I.two2: case I.cold2: case I.three: case I.alive: case I.warm: {
      const prof = { [I.one]: .4, [I.two2]: .7, [I.cold2]: .8, [I.three]: 1, [I.alive]: 1, [I.warm]: 1 }[L];
      hoyo(HOYO_CHICO, .5 + prof * .5, .3 + prof, L >= I.alive);
      placeC(ME, HOYO_CHICO[0] - 1.1, HOYO_CHICO[1] + .3, Math.PI / 2); attach(PALA, ME, "R", [0, -.2, .2]); const dig = Math.sin(t * 7); pose(ME, t, { armFwd: .9 + dig * .35 }); ME.body.rotation.x = .3 + dig * .1; PALA.rotation.set(.4 + dig * .4, 0, 0);
      setFace(ME, L >= I.alive ? "shock" : L === I.cold2 ? "scared" : "determined"); break }
    case I.flinch: case I.turns: case I.shore: case I.sigh: hoyo(HOYO_CHICO, 1, 1.3, true); crowd([[ME, HOYO_CHICO[0] - 1.1, HOYO_CHICO[1] + .3, Math.PI / 2 + .6, L === I.flinch ? "terrified" : "relieved"], [EXT[0], 1, -1, Math.PI / 2, L === I.flinch ? "terrified" : "excited", L === I.sigh ? 1 : 0], [EXT[1], -1, 2, Math.PI / 2, L === I.flinch ? "scared" : "happy", L === I.sigh ? 1 : 0], [FOLK[1], 2, 3, Math.PI / 2, "relieved"]]); attach(PALA, ME, "R", [0, -.2, .2]); break;
    case I.life: case I.last: hoyo(HOYO_CHICO, 1, 1.3, true); crowd([[ME, HOYO_CHICO[0] - 1.1, HOYO_CHICO[1] + .3, -Math.PI / 2 - .4, L === I.life ? "warm" : "happy"], [QUILL, 9, -3, Math.PI / 2 - .3, "relieved"], [FOLK[1], 8, -6, Math.PI / 2, "excited"], [EXT[0], 7, -1, Math.PI / 2, "happy"], [EXT[2], 6, -4.4, Math.PI / 2, "excited"], [FOLK[4], 8.4, 1.2, Math.PI / 2, "relieved"]]); attach(PALA, ME, "R", [0, -.2, .2]); pose(ME, t, { lift: L === I.last ? .5 : 0 }); break;
  }
  QUILL.handR.children.filter(c => c.userData.tmp && L !== I.firstone).forEach(c => QUILL.handR.remove(c));
  if (!LL.length && lugar === "noche") LL.push([TS(0, 6, 10)(), 3, "#ffc480", 30]);
  lights(LL); camara(t);
}

//@@TEXTURAS
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

