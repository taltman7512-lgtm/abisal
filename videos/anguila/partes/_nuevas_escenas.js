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
