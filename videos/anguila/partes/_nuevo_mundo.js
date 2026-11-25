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
