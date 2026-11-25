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
