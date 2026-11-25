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
