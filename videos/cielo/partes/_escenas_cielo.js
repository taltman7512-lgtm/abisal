//@@LUGAR
// lugares (cambio de lugar = corte duro): la calle de hoy, la Loma, el recuerdo de Tanner, arriba de la tapa
const LUGAR = L => (L >= I.skipped && L <= I.cut) ? "recuerdo" : (L === I.kell || L === I.decides || L === I.moved) ? "loma" : (L >= I.through && L <= I.never) ? "arriba" : "calle";
const PISO = (x, z) => SUELO(x, z);
const ponerP = (k, x, z, ry = 0) => { k.g.visible = true; k.g.position.set(x, PISO(x, z), z); k.g.rotation.set(0, ry, 0) };
const enAire = (k, p, ry = 0) => { k.g.visible = true; k.g.position.set(p[0], p[1], p[2]); k.g.rotation.set(0, ry, 0) };
// orientación: el personaje mira a +z local; mirarA da el ry para que mire hacia (tx, tz)
const ryA = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);

//@@SHOTS
const G = (x, dy, z) => () => [x, SUELO(x, z) + dy, z];
const KW = (k, o) => () => add(k.g.getWorldPosition(new THREE.Vector3()).toArray(), o);
const HD = (k, o) => () => { const h = headW(k); return [h.x + o[0], h.y + o[1], h.z + o[2]] };
const VZ = VECINOS;
// puntos fijos de la calle (z = 0 a lo largo de x; el poste en el origen; los peldaños del lado +x)
const PM = POSTE_MIO, CY = CIELO_Y0;
const CRK = (o = [0, 0, 0]) => () => add(POSTE_BASE(POSTE_MI), o);
const TOP = (o = [0, 0, 0]) => () => add(POSTE_TOP(POSTE_MI), o);
const AGW = (o = [0, 0, 0]) => () => add(AGUJERO_W(), o);
const ARR = (o = [0, 0, 0]) => () => { const [x, , z] = AGUJERO_W(); return [x + o[0], ARRIBA_Y(x, z) + o[1], z + o[2]] };
const CAS = () => CASILLAS[POSTE_MI];
const P9 = [POSTE_NUEVE[0], 0, POSTE_NUEVE[1]], P9L = POSTE_NUEVE_LOMA;
const SOLP = [SOL_PINTADO[0], CIELO(...SOL_PINTADO), SOL_PINTADO[1]];
// dónde está la gente al final (al este del panel que cae, mirando al oeste)
const FIN = [31, 0];
let t_ = 0;   // el tiempo del cuadro
const SHOTS = {
  [I.open]: [sh(0, [-14, 2.2, 1.5], [-13, 2.4, 1.2], [-9, CY - 3.3, -3], null, 60),
    sh(4, KW(ME, [3, 1.6, 3.4]), KW(ME, [2.7, 1.7, 3.1]), KW(ME, [0, 2.6, 0]), null, 62, { tr: "barrido" })],
  [I.rule]: [sh(0, [42, 8, .5], [37, 8.3, .3], [0, 6.5, -1], null, 56),
    sh(5, [5.5, .9, -3.4], [5, 1.1, -3], [0, 9.5, 0], null, 64, { tr: "barrido" })],
  [I.cost]: [sh(0, [-43, 1.6, 25], [-41, 1.8, 25.6], [-6, 2.5, 26], null, 58)],
  [I.nobody]: [sh(0, [-20, 1.5, 1], [-18.6, 1.6, .8], [0, CY, -4], null, 64)],
  [I.hard]: [sh(0, [-.5, 1.5, 6.5], [-.8, 1.6, 6.1], [-3, 2.4, 2], null, 60),
    sh(10, [3, 6.5, 6], [2.6, 7.2, 5.4], [0, CY, -4], null, 56, { tr: "barrido" })],
  [I.forty]: [sh(0, [-25, 1.6, -1], [-23, 2, -1.2], [-8, 7.5, 5], null, 60)],
  [I.pole]: [sh(0, [6, .8, 6], [5.4, 1, 5.4], [0, 7, 0], null, 66),
    sh(11, CRK([4.2, .8, 4.2]), CRK([3.7, .9, 3.7]), CRK([0, 0, 0]), null, 58, { tr: "barrido" })],
  [I.bell]: [sh(0, [CAMPANA_P[0] + 3.4, 2.2, CAMPANA_P[1] + 4], [CAMPANA_P[0] + 3, 2.4, CAMPANA_P[1] + 3.5], [CAMPANA_P[0], 3.2, CAMPANA_P[1]], null, 56),
    sh(5, [5.6, 4.8, 8.6], [5, 5, 8.2], CRK([0, -.5, 0]), null, 56),
    sh(12, CRK([5.6, 2.4, 4.4]), CRK([5.2, 2.5, 4]), CRK([0, .3, 0]), null, 60, { tr: "barrido" })],
  [I.wed]: [sh(0, [4.2, 1.8, 8], [3.8, 1.9, 7.6], [2.8, 1.5, 3.4], null, 58)],
  [I.babies]: [sh(0, () => add(CAS().puerta, [0, 1, 3.4]), () => add(CAS().puerta, [0, 1.05, 3]), () => add(CAS().puerta, [0, .3, -1.8]), null, 58),
    sh(6, () => add(CAS().puerta, [1.6, 1.4, 3]), () => add(CAS().puerta, [1.4, 1.45, 2.7]), () => add(CAS().puerta, [0, .2, -1.6]), null, 56, { tr: "barrido" })],
  [I.school]: [sh(0, CRK([-2, 1.4, 5.6]), CRK([-1.8, 1.5, 5.2]), CRK([0, .3, 0]), null, 60)],
  [I.sun]: [sh(0, G(12, 1.8, -47.5), G(12.6, 1.9, -47), [15, 8, -46], null, 64), sh(9, G(16, 1.7, -51), G(16.4, 1.8, -50.6), SOLP, null, 50, { tr: "barrido" })],
  [I.sign]: [sh(0, [-7, 3.6, 2.6], [-6.4, 4, 2.2], [0, 5.6, 0], null, 50), sh(9, [-6, 4.5, 2], [-5.7, 4.6, 1.8], [0, 5.6, 0], null, 50, { tr: "barrido" })],
  [I.greaser]: [sh(0, KW(ME, [.6, 1.2, 3.4]), KW(ME, [.5, 1.3, 3.1]), KW(ME, [0, 1.2, 0]), null, 58),
    sh(4, KW(ME, [.3, -1.2, 3.6]), KW(ME, [.2, -1, 3.3]), KW(ME, [-.2, 1, 0]), null, 64, { tr: "barrido" })],
  [I.slip]: [sh(0, CRK([3, 1.2, 2.6]), CRK([2.7, 1.25, 2.3]), CRK([0, .3, 0]), null, 52)],
  [I.ollie]: [sh(0, KW(ME, [3.4, 1.6, 1]), KW(ME, [3.2, 1.7, .9]), KW(ME, [0, 2.2, 0]), null, 58)],
  [I.higher]: [sh(0, KW(ME, [1.6, .5, 2.2]), KW(ME, [1.4, .4, 1.9]), KW(ME, [0, 3.2, 0]), null, 70),
    sh(7, KW(ME, [2, .7, 3]), KW(ME, [1.8, .6, 2.8]), [0, 9, -1], null, 68, { tr: "barrido" })],
  [I.oneday]: [sh(0, KW(ME, [2.8, 1.6, 3.2]), KW(ME, [2.6, 1.65, 3]), KW(ME, [0, 2.4, 0]), null, 60)],
  [I.kell]: [sh(0, G(-4, 7.5, -66), G(-2, 7.8, -66.6), [4, LOMA_H + 12, -96], null, 60),
    sh(6, KW(KELL, [-1.6, 1.4, 2.8]), KW(KELL, [-1.4, 1.5, 2.5]), KW(KELL, [0, 2.2, 0]), null, 56, { tr: "barrido" }),
    sh(13, G(-8, 1.6, -66), G(-8.5, 1.8, -66.6), G(-12, 18, -92), null, 64, { tr: "barrido" })],
  [I.decides]: [sh(0, KW(KELL, [3, 1.5, 3.6]), KW(KELL, [2.8, 1.6, 3.3]), KW(KELL, [-1.5, 1.8, 0]), null, 58)],
  [I.sinks]: [sh(0, [-14, 1.8, 1], [-13, 1.9, .8], [0, CY - 2, -2], null, 62)],
  [I.takes]: [sh(0, G(12, 2, -71), G(10, 2.3, -71.4), [0, 16, -96], null, 60),
    sh(11, KW(HOMBRES_KELL[2], [3.5, 1.6, 1.2]), KW(HOMBRES_KELL[2], [3.2, 1.7, 1.1]), KW(HOMBRES_KELL[2], [0, 1.2, 0]), null, 58)],
  [I.three]: [sh(0, [26, 3, 3], [23, 3.4, 2.6], [0, 5, 0], null, 54)],
  [I.skipped]: [sh(0, KW(ME, [5, 1.3, 1.2]), KW(ME, [4.8, 1.35, 1.1]), KW(ME, [0, 1.4, 0]), null, 58),
    sh(8, KW(OLLIE, [3.4, 1.6, 2]), KW(OLLIE, [3.1, 1.65, 1.8]), KW(OLLIE, [0, 1, 0]), null, 58, { tr: "barrido" })],
  [I.night]: [sh(0, [-7.3, 2.3, 28.2], [-7.4, 2.4, 28.5], [-8, 2.6, 26], null, 40)],
  [I.tanner]: [sh(0, [-43, 1.8, 24.6], [-41, 2, 25], [0, 6, 27], null, 62)],
  [I.flat]: [sh(0, [42, 3.2, 26.5], [40, 3.4, 26], [0, .8, 26], null, 56)],
  [I.blame]: [sh(0, KW(KELL, [2.6, 1.5, 1.6]), KW(KELL, [2.3, 1.6, 1.4]), KW(KELL, [0, 1.8, 0]), null, 56),
    sh(12, [-45.5, 2.4, 21.8], [-45.2, 2.45, 22], KW(KELL, [0, 1.6, 0]), null, 56, { tr: "barrido" })],
  [I.looked]: [sh(0, HD(ME, [.45, .05, .22]), HD(ME, [.5, .05, .25]), [-39.5, 1.5, 25], null, 56)],
  [I.cut]: [sh(0, [-9.6, 1.9, 28.8], [-9.4, 1.95, 28.6], [-7.8, 1.6, 26.8], null, 58),
    sh(12, [-10, 2.2, 29], [-9.8, 2.2, 28.7], [-8, 2.1, 26], null, 38, { tr: "barrido" })],
  [I.moved]: [sh(0, [P9L[0] - 4.5, LOMA_H + 3, P9L[1] + 9], [P9L[0] - 3.5, LOMA_H + 3.4, P9L[1] + 8], [P9L[0], LOMA_H + 5, P9L[1]], null, 56)],
  [I.spare]: [sh(0, [-20, 2.2, 1.8], [-18, 2.4, 1.6], KW(HOMBRES_KELL[2], [0, 1.2, 0]), null, 56)],
  [I.chimneys]: [sh(0, [14, 5, 2], [13, 5.2, 1.7], [-4, CY - 2.6, -4.5], null, 60, { shake: .05 })],
  [I.snap]: [sh(0, CRK([0, 4.2, 6]), CRK([-.4, 4.3, 5.6]), CRK([0, 0, 0]), null, 58),
    sh(6, [-5, 1.4, 5.5], [-4.4, 1.6, 5], [-8, 7.4, -2], null, 64, { tr: "barrido", shake: .06 })],
  [I.climb]: [sh(0, [-3.8, 1.7, -.9], [-4, 1.8, -.8], KW(VZ[4], [0, 1.5, 0]), null, 52),
    sh(11, KW(ME, [.5, -.6, 3.4]), KW(ME, [.4, -.3, 3.1]), KW(ME, [0, 1.6, 0]), null, 64, { tr: "barrido" })],
  [I.top]: [sh(0, KW(ME, [.4, 1.6, 3.2]), KW(ME, [.35, 1.7, 2.9]), KW(ME, [-.2, 1.8, 0]), null, 60)],
  [I.drop]: [sh(0, HD(ME, [.3, -.1, 1.9]), HD(ME, [.25, -.1, 1.7]), HD(ME, [0, .1, 0]), null, 56)],
  [I.wood]: [sh(0, KW(ME, [.5, 1, 3]), KW(ME, [.45, 1.1, 2.7]), KW(ME, [-.2, 2.1, 0]), null, 60),
    sh(8, AGW([-2.4, -1.6, -1.8]), AGW([-2.2, -1.55, -1.65]), AGW([.2, 0, .2]), null, 60, { tr: "barrido" })],
  [I.count]: [sh(0, KW(ME, [1.4, .4, .9]), KW(ME, [1.6, .2, 1.1]), [6, 0, 4], null, 70, { shake: .08 }),
    sh(5, [-9, 1.6, -2.2], [-8.4, 1.7, -2], [0, CY - 4.2, -1], null, 62, { tr: "barrido", shake: .06 })],
  [I.through]: [sh(0, ARR([3.2, 2.4, 3]), ARR([2.9, 2.3, 2.7]), ARR([0, .6, 0]), null, 54)],
  [I.fields]: [sh(0, ARR([0, .32, 0]), ARR([.2, .45, -.3]), ARR([-30, 1.8, -9]), null, 56),
    sh(4, ARR([-3, 3, 4]), ARR([-5, 4, 5]), ARR([-60, 2, -20]), null, 54, { tr: "barrido" })],
  [I.farm]: [sh(0, ARR([10, 9, 12]), ARR([14, 16, 16]), ARR([-10, 0, -6]), null, 52)],
  [I.dirt]: [sh(0, ARR([7, 4.5, -8]), ARR([6, 4.6, -7]), [ESCALERA_KELL[0], ARRIBA_Y(...ESCALERA_KELL) + 1.5, ESCALERA_KELL[1]], null, 50),
    sh(6, KW(HOMBRES_KELL[1], [3, 1.6, 3]), KW(HOMBRES_KELL[1], [2.6, 1.7, 2.6]), KW(HOMBRES_KELL[1], [0, .9, 0]), null, 56, { tr: "barrido" })],
  [I.heavier]: [sh(0, ARR([-6, 2.6, 5]), ARR([-4, 2.7, 4]), ARR([-6, 0, -6]), null, 56)],
  [I.never]: [sh(0, ARR([-3.2, 1.7, -2.6]), ARR([-3, 1.65, -2.4]), ARR([0, .6, 0]), null, 58)],
  [I.told]: [sh(0, KW(ME, [-3, 1.8, 1.6]), KW(ME, [-2.6, 1.9, 1.4]), KW(ME, [0, 1.4, 0]), null, 58),
    sh(12, KW(ME, [-2.2, 1.6, 2.1]), KW(ME, [-2, 1.55, 1.9]), KW(ME, [-.3, 1.3, .3]), null, 50, { tr: "barrido" })],
  [I.letgo]: [sh(0, CRK([6.4, 2.2, 5]), CRK([5.6, 2.5, 4.4]), CRK([0, .2, 0]), null, 58)],
  [I.out]: [sh(0, () => add(CAS().puerta, [12, 1.2, 4]), () => add(CAS().puerta, [11, 1.3, 3.8]), () => add(CAS().puerta, [2, 1, 2]), null, 56),
    sh(6, [FIN[0] + 8, 1.8, FIN[1] + 1], [FIN[0] + 7, 2, FIN[1] + .8], [FIN[0] - 4, 1.4, FIN[1]], null, 58, { tr: "barrido" })],
  [I.fall]: [sh(0, [44, 2.4, 1.6], [42, 2.6, 1.2], [0, 7, -1], null, 62, { shake: .06 })],
  [I.gold]: [sh(0, [46, 1.8, 2], [45, 1.9, 1.8], [10, 14, -2], null, 66),
    sh(8, [40, 6, 1.6], [38, 6.3, 1.4], [8, 6, 0], null, 58, { tr: "barrido" })],
  [I.kellup]: [sh(0, () => add(KELL_BORDE, [2, -3, 6]), () => add(KELL_BORDE, [1.8, -2.8, 5.6]), () => add(KELL_BORDE, [0, 2, 0]), null, 56),
    sh(4, () => add(KELL_BORDE, [3.4, 1.2, 4.8]), () => add(KELL_BORDE, [3.1, 1.25, 4.4]), () => add(KELL_BORDE, [-.5, .8, -2]), null, 58, { tr: "barrido" })],
  [I.lost]: [sh(0, [44, 7, -1.5], [42.6, 7.1, -1.3], [-6, 2, 1], null, 58)],
  [I.shoulders]: [sh(0, KW(ME, [-2.8, 1.9, .6]), KW(ME, [-2.5, 2, .5]), KW(ME, [0, 2.4, 0]), null, 58),
    sh(11, KW(ME, [-2.6, .6, 1.2]), KW(ME, [-2.4, .55, 1.1]), KW(ME, [0, 3.2, 0]), null, 66, { tr: "barrido" })],
  [I.end]: [sh(0, KW(ME, [-2.2, .5, .6]), KW(ME, [-2.5, .4, .7]), KW(ME, [0, 2.6, 0]), null, 66)],
};

//@@ESCENA
// ---------- la escena en cada instante
const QS = new URLSearchParams(location.search), VISTA = QS.get("vista") ? QS.get("vista").split(",").map(Number) : null;
let ENV_OK = false;
window.MAPA = () => RECTS.map(R => [R.x, R.z, R.w, R.d, R.ry || 0]);
function setScene(t) {
  t_ = t;
  const L = lineAt(t), lt = t - s(L), len = (S[L + 1] ?? DUR) - s(L), k = P(lt, 0, len), Wd = kk => wt(L, kk), T0 = s(L), dW = kk => Wd(kk) - T0;
  POST = { flash: 0, sepia: 0 };
  if (!ENV_OK) { Object.assign(ENV, ENV_LEJOS, ENV_CIELO_PUEBLO); ENV_OK = true }
  mundoReset(); utileriaReset(); lejosReset(true);
  ALL.forEach(c => { if (c.polvo) c.polvo.forEach(q => q.visible = false); c.g.visible = false; c.body.rotation.set(0, 0, 0); c.body.position.y = 0; c.head.rotation.set(0, 0, 0); power(c, null, 0); c.aura.visible = false; setFace(c, "neutral"); pose(c, t, {}); quieto(c, t) });
  [PALA, REGLA, TELESC, HOYO].forEach(o => o.visible = false);
  sinBestia(); tortuga(t, { paso: 0 }); LUCES.forEach(l => l.visible = false);
  TEMBLOR = 0;
  const REC = LUGAR(L) === "recuerdo", ARRIBA_ = LUGAR(L) === "arriba", CAIDO = L >= I.fall;
  // ---- la tapa: cuánto se hundió sobre nuestra calle, el agujero, la caída
  const hund = L === I.open ? 3.3 + .15 * k : L === I.sinks ? .2 + .3 * k : L === I.chimneys ? 2.4 + .9 * eIO(k) : L === I.snap ? 3.3 + .3 * k : (L >= I.climb && L <= I.wood) ? 3.6 : L === I.count ? 3.6 + .6 * eIO(P(lt, dW(3), len)) : (L >= I.through && L <= I.out) ? 4.2 : 0;
  tapaHundir(hund, { polvo: hund > 0 ? (L === I.count || L === I.snap || L === I.chimneys ? .7 : .3) : false });
  posteBaja(POSTE_MI, hund);
  const agu = L === I.wood ? .3 * P(lt, dW(1), len) : L === I.count ? .3 + .05 * k : L === I.through ? .35 + .65 * eIO(P(lt, dW(1), dW(4))) : (L > I.through && L < I.fall) ? 1 : 0;
  if (agu > 0) tapaAgujero(agu);
  if (L === I.drop) tapaGotea(t, .9, { en: [AGUJERO[0] + .4, AGUJERO[1]], r: .5 });
  // la caída: el panel baja hasta apoyarse en los techos (≈ 7 m) con su campo encima; queda ahí
  const cae = L === I.fall ? .45 * eIO(P(lt, dW(1) - .1, dW(6))) : L > I.fall ? .45 : 0;
  if (cae > 0) { tapaCae(cae); tapaAgujero(0) }
  if (L >= I.gold) lluviaTrigo(t, L === I.gold ? P(lt, 0, 1.2) : L <= I.lost ? .8 : .5);
  // Tanner: en pie en el recuerdo (antes de «tanner»), la tapa bajando en «tanner», aplastada después
  const tan = (L === I.skipped || L === I.night) ? 0 : L === I.tanner ? eIO(P(lt, dW(1), dW(13) + .3)) : 1;
  tannerEstado(tan); tanerCae(tan);
  poste9Corte(L === I.cut || L === I.moved);
  if (L === I.night) posteBaja(POSTE_9T, .5 * eIO(P(lt, dW(2), len)));
  montonesTierra(true); escaleraArriba(L === I.dirt || L === I.heavier || L === I.kellup);
  escaleraKell(true);
  // ---- la manivela: gira una vuelta por campanada; se parte en «snap»
  const giroB = L === I.bell ? (lt > dW(9) ? Math.PI * 2 * eIO(P(lt, dW(9), dW(13))) : 0) : L === I.snap ? 1.4 * P(lt, 0, dW(5)) : L === I.letgo ? -Math.PI * 3 * eIO(P(lt, dW(8), len)) : L === I.school ? .9 * k : L === I.pole || L === I.slip ? .25 * k : 0;
  manivelaGiro(POSTE_MI, giroB);
  if (L >= I.snap && L < I.fall) manivelaRota(POSTE_MI, L === I.snap ? P(lt, dW(5) - .05, dW(5) + .6) : 1);
  posteGrasa(POSTE_MI, 1);
  campana(L === I.bell ? .35 * Math.sin(lt * 6) * Math.exp(-lt * .6) * (lt > dW(3) - .1 ? 1 : 0) : 0);
  techosRajan(L === I.open ? .35 : L === I.chimneys ? .2 + .3 * k : L === I.snap ? (lt > dW(6) ? .5 + .4 * P(lt, dW(6), len) : .5) : (L > I.snap && L < I.fall) ? .9 : L >= I.fall ? 1 : 0);
  callePolvo(L === I.open || L === I.chimneys || L === I.snap || L === I.count ? .7 : (L >= I.climb && L <= I.wood) ? .3 : L >= I.fall && L <= I.gold ? 1 : 0);
  barriletes(t, LUGAR(L) === "loma" || L === I.takes);
  // ---- luz
  setEnv(QS.get("env") || (REC ? "recuerdo" : ARRIBA_ ? "arriba" : CAIDO ? "luzReal" : "bajo")); ambiente(t);
  if (REC) POST.sepia = .55;
  // ---- gente
  const V = VECINOS, HK = HOMBRES_KELL;
  const parado = (c, x, z, ry, cara = "neutral") => { ponerP(c, x, z, ry); setFace(c, cara); quieto(c, t) };
  const mirando = (c, x, z, tx, tz, cara = "neutral") => parado(c, x, z, ryA(x, z, tx, tz), cara);
  const arriba = (c, x, z, tx, tz, cara = "scared", u = 1) => { ponerP(c, x, z, ryA(x, z, tx, tz)); setFace(c, cara); mirarArriba(c, t, u) };
  const enHombros = (x, z, ry, o = {}) => { ponerP(ME, x, z, ry); if (o.andar) andar(ME, t, { vel: .8 }); hombros(ME, OLLIE, t, { senala: o.senala || 0, andar: o.andar ? 1 : 0, mira: o.mira || 0 }) };
  // la gente de la calle alrededor del poste (cuando no empujan)
  const gentio = (cara = "scared", u = 1) => [[V[0], -4.6, 3.2], [V[1], -2.4, 4.6], [V[2], 3.6, 4.2], [V[3], 5.2, 2.2], [V[4], -6.4, 1], [V[5], 6.6, -1.2], [V[7], 1.4, 5.6], [V[8], -1.2, 6.2], [V[9], 4.8, 5.8]].forEach(([c, x, z], i) => arriba(c, x, z, 0, 0, i % 2 ? cara : "worried", u));
  // la manivela de nuestra calle con su gente
  const empujan = (lista, o = {}) => { const P_ = POSTES[POSTE_MI]; manivelaGrupo(lista, [P_.x, P_.z], 3.3, -(P_.ang || 0), { brazos: 4, t, suelo: PISO, sentido: -1, fuerza: o.fuerza ?? 1 }); lista.forEach(c => setFace(c, o.cara || "aguanta")) };
  // el narrador colgado del poste a la altura h (peldaños del lado +x, mira hacia −x)
  const enPoste = (h, fn) => { const p = postePeldano(POSTE_MI, h); enAire(ME, [p[0] + .1, p[1] - 1.1, p[2]], -Math.PI / 2); fn() };
  const topH = () => POSTE_TOP(POSTE_MI)[1] - SUELO(...PM) - 2.1;
  switch (L) {
    case I.open: enHombros(-5.5, 3, ryA(-5.5, 3, -14, 7)); setFace(ME, "scared"); setFace(OLLIE, "worried"); ME.head.rotation.x = -.35; mirando(V[1], -8, 1.5, -3, -2, "scared"); arriba(V[8], -1, 1, -3, 0, "terrified"); break;
    case I.rule: gentio("neutral", .6); empujan([V[10], V[11], HK[3], V[6]], { cara: "neutral" }); break;
    case I.cost: break;
    case I.nobody: arriba(V[6], 3.4, -11.4, SOLP[0], SOLP[2], "curious"); arriba(V[7], 4.6, -10, SOLP[0], SOLP[2], "neutral", .8); break;
    case I.hard: ponerP(V[6], -3, 2, ryA(-3, 2, 2, 6)); setFace(V[6], "happy"); senalarArriba(V[6], t, P(lt, 0, .8)); parado(V[7], -1.6, 2.6, ryA(-1.6, 2.6, 3, 7), "laugh"); break;
    case I.forty: mirando(V[0], -14, 3, -20, -1, "neutral"); mirando(V[3], -12.4, 2, -20, -1, "neutral"); break;
    case I.pole: empujan([V[0], V[2], V[3], V[9]], { cara: "neutral", fuerza: .4 }); break;
    case I.bell: case I.school: { const L_ = L === I.school ? [V[6], V[7], V[11], OLLIE] : [V[0], V[2], V[3], V[9], V[4], V[5], V[10], V[11]];
      empujan(L_, { cara: L === I.school ? "happy" : "aguanta" }); if (L === I.school) setFace(OLLIE, "laugh"); break }
    case I.wed: { const x = 2.8, z = 3.4; ponerP(NOVIO, x - .68, z, Math.PI / 2); ponerP(NOVIA, x + .68, z, -Math.PI / 2); boda(NOVIO, NOVIA, t); setFace(NOVIO, "happy"); setFace(NOVIA, "warm");
      mirando(V[4], x - 2.6, z + 1.6, x, z, "warm"); mirando(V[5], x + 2.8, z + 1.2, x, z, "happy"); mirando(V[10], x - 2.2, z + 2, x, z, "laugh"); break }
    case I.babies: { const C = CAS(); ponerP(MADRES[0], C.puerta[0] + .6, C.puerta[2] - 1.1, ryA(C.puerta[0] + .6, C.puerta[2] - 1.1, C.puerta[0] + .6, C.puerta[2] + 3)); cargarBebe(MADRES[0], t); setFace(MADRES[0], "warm"); break }
    case I.sun: arriba(V[6], 3.4, -10.6, SOLP[0], SOLP[2], "neutral", .9); break;
    case I.sign: break;
    case I.greaser: enPoste(5 + .8 * k, () => { if (lt < dW(3)) { engrasar(ME, t) } else trepar(ME, t, {}); setFace(ME, "neutral") }); baldeGrasa(ME, true, "cinto"); ponerP(OLLIE, 4.6, 2.2, ryA(4.6, 2.2, 0, 0)); senalarArriba(OLLIE, t, .5); setFace(OLLIE, "happy"); break;
    case I.slip: break;
    case I.ollie: enHombros(-12 + 2.2 * lt, .8, Math.PI / 2, { andar: 1 }); setFace(ME, "warm"); setFace(OLLIE, "laugh"); baldeGrasa(ME, true, "L"); break;
    case I.higher: case I.oneday: enHombros(1.8, 2.4, ryA(1.8, 2.4, 6, 6), { senala: L === I.higher ? eIO(P(lt, dW(3), dW(5))) : .3, mira: 0 }); setFace(ME, L === I.oneday ? "warm" : "happy"); setFace(OLLIE, "wow"); if (L === I.higher) ME.head.rotation.x = -.25; break;
    case I.kell: { const x = -1, z = -78; ponerP(KELL, x, z, ryA(x, z, -12, -60)); bastonQuieto(KELL, t); setFace(KELL, "frio");
      [[V[6], -10, -72], [V[7], -6, -70], [V[11], -13, -74]].forEach(([c, xx, zz], i) => { ponerP(c, xx, zz, ryA(xx, zz, -12, -96)); remontarBarrilete(c, t + i); setFace(c, "happy") }); break }
    case I.decides: ponerP(KELL, -1, -78, ryA(-1, -78, 1, -74)); apuntarDedo(KELL, t, { u: P(lt, 0, .6) }); setFace(KELL, "desprecio"); break;
    case I.sinks: gentio("worried", .8); break;
    case I.takes: { if (lt > dW(11)) { const x = -10 + 1.4 * (lt - dW(11)), z = 1; ponerP(HK[2], x, z, Math.PI / 2); empujarCarretilla(HK[2], t); setFace(HK[2], "squint"); ponerP(HK[0], x - 2, z - 1.6, Math.PI / 2); andar(HK[0], t); serrucho(HK[0], true, "R"); setFace(HK[0], "suspicious");
        arriba(V[4], -12, 4.6, x, z, "sad", 0); arriba(V[0], -8, -3.6, x, z, "worried", 0) } break }
    case I.three: gentio("sad", .4); break;
    case I.skipped: { const x = -27 + 3.4 * lt, z = 23.6; ponerP(ME, x, z, Math.PI / 2); correrV(ME, t); setFace(ME, "laugh"); ponerP(OLLIE, x + 2.2, z + .8, Math.PI / 2); correrV(OLLIE, t + .2); setFace(OLLIE, "laugh"); baldeGrasa(ME, true, "L"); break }
    case I.night: break;
    case I.tanner: [[V[0], -24, 14], [V[1], -21, 13.4], [V[3], -18, 14.6]].forEach(([c, x, z]) => arriba(c, x, z, -6, 26, "terrified", .8)); break;
    case I.flat: break;
    case I.blame: { ponerP(KELL, -39, 25, Math.PI / 2); if (lt > dW(11)) { apuntarDedo(KELL, t, { u: P(lt, dW(11), dW(12)) }); KELL.g.rotation.y = ryA(-39, 25, -43.5, 23) } else bastonQuieto(KELL, t); setFace(KELL, "frio");
      parado(ME, -43.5, 23, ryA(-43.5, 23, -39, 25), "worried"); [[V[0], -42, 27.6], [V[2], -44, 26.6], [V[5], -41.6, 21.4]].forEach(([c, x, z]) => parado(c, x, z, ryA(x, z, -39, 25), "sad")); break }
    case I.looked: { parado(ME, -43.5, 23, ryA(-43.5, 23, -39, 25), "sad"); [[V[0], -41, 27.4], [V[2], -39.4, 27], [V[5], -40.2, 21.6], [V[3], -38.4, 23], [KELL, -39, 25]].forEach(([c, x, z]) => parado(c, x, z, ryA(x, z, -43.5, 23), c === KELL ? "frio" : "suspicious")); break }
    case I.cut: { ponerP(ME, -7.4, 27.6, ryA(-7.4, 27.6, -8, 26)); quieto(ME, t); setFace(ME, lt > dW(15) ? "shock" : "squint"); ME.body.position.y = -.25; break }
    case I.moved: [[V[6], P9L[0] - 4, P9L[1] + 4], [V[7], P9L[0] - 7, P9L[1] + 6]].forEach(([c, x, z], i) => { ponerP(c, x, z, ryA(x, z, -12, -96)); remontarBarrilete(c, t + i); setFace(c, "happy") }); break;
    case I.spare: { const x = -12 - 1.3 * lt, z = 1; ponerP(HK[2], x, z, -Math.PI / 2); empujarCarretilla(HK[2], t); setFace(HK[2], "squint"); ponerP(HK[1], x + 1.8, z - 1.4, -Math.PI / 2); andar(HK[1], t); setFace(HK[1], "neutral"); arriba(ME, -6, 3, x, z, "worried", 0); break }
    case I.chimneys: gentio("terrified", 1); enHombros(-8, 4.6, ryA(-8, 4.6, 14, 7)); setFace(ME, "scared"); setFace(OLLIE, "scared"); ME.head.rotation.x = -.3; break;
    case I.snap: { empujan([V[0], V[2], V[3], V[9], V[4], V[5], V[10], ME], { cara: lt > dW(5) ? "shock" : "esfuerzo", fuerza: 1 }); if (lt > dW(6)) TEMBLOR = .03; break }
    case I.climb: { gentio("terrified", .5); if (lt < dW(11)) { arriba(ME, 4.6, 1.2, 0, 0, "determined", .7) } else enPoste(1.8 + 2.4 * P(lt, dW(11), len), () => { trepar(ME, t, {}); setFace(ME, "determined") }); break }
    case I.top: enPoste(topH() - .5 + .5 * eIO(k), () => { trepar(ME, t, { vel: .5 }); setFace(ME, "aguanta"); ME.head.rotation.x = -.4 }); break;
    case I.drop: enPoste(topH(), () => { quieto(ME, t); setFace(ME, lt > dW(2) ? "squint" : "aguanta"); ME.head.rotation.x = -.45 }); break;
    case I.wood: enPoste(topH(), () => { cortarArriba(ME, t, P(lt, dW(1), dW(3))); cuchilloGrasa(ME, true, "R"); setFace(ME, lt > dW(11) ? "shock" : "esfuerzo") }); break;
    case I.count: { enPoste(topH(), () => { cortarArriba(ME, t, 1); cuchilloGrasa(ME, true, "R"); setFace(ME, "esfuerzo") }); gentio("terrified", .8); TEMBLOR = lt > dW(3) ? .04 : 0; break }
    case I.through: case I.fields: case I.farm: case I.dirt: case I.heavier: case I.never: { const [x, , z] = AGUJERO_W(); enAire(ME, [x, ARRIBA_Y(x, z), z], L === I.dirt ? Math.PI * .75 : -Math.PI * .6);
      cabezaAfuera(ME, t, L === I.through ? eIO(P(lt, dW(4), len)) : 1); setFace(ME, L === I.fields ? "wow" : L === I.never ? "determined" : L === I.farm ? "shock" : L === I.through ? "esfuerzo" : "squint");
      if (L === I.dirt || L === I.heavier) { const B = [-3, -6]; [[HK[1], B[0], B[1]], [HK[3], B[0] + 2.2, B[1] - 1.4]].forEach(([c, xx, zz]) => { enAire(c, [xx, ARRIBA_Y(xx, zz), zz], ryA(xx, zz, 0, 0)); palear(c, t); setFace(c, "neutral") });
        const xx = 1.5 - 1.2 * lt, zz = -8; enAire(HK[2], [xx, ARRIBA_Y(xx, zz), zz], -Math.PI / 2); empujarCarretilla(HK[2], t); setFace(HK[2], "squint") } break }
    case I.told: { parado(ME, 4.6, 1.6, ryA(4.6, 1.6, 0, 6), "determined"); if (lt > dW(11)) { abrirMano(ME, t, P(lt, dW(11), dW(14))) }
      [[V[0], 1.6, 5.4], [V[2], 3.2, 6.6], [V[3], 5.6, 6.4], [V[9], 7.2, 4.6], [V[4], .2, 3.8]].forEach(([c, x, z]) => parado(c, x, z, ryA(x, z, 4.6, 1.6), lt > dW(15) ? "shock" : "suspicious")); break }
    case I.letgo: { const e = P(lt, dW(8), len); if (e <= 0) empujan([V[0], V[2], V[3], V[9]], { cara: "determined", fuerza: .4 });
      else [[V[0], 4.6, 2.8], [V[2], -3.6, 3.6], [V[3], 3.2, -4.4], [V[9], -4.4, -2.6]].forEach(([c, x, z]) => { ponerP(c, x * (1 + e * .6), z * (1 + e * .6), ryA(x, z, 0, 0)); retroceder(c, t, e); setFace(c, "determined") }); break }
    case I.out: { const C = CAS(), q = P(lt, 0, dW(6)); [[MADRES[0], 0], [MADRES[1], 1]].forEach(([c, i]) => { const x = C.puerta[0] + 2 + q * 14 + i * 1.6, z = C.puerta[2] + 2 + i * 1.2; ponerP(c, x, z, Math.PI / 2); cargarBebe(c, t, { andar: 1 }); setFace(c, "worried") });
      if (lt > dW(6)) [[V[0], FIN[0] - 2, FIN[1] - 2], [V[2], FIN[0] - 1, FIN[1] + 1], [V[3], FIN[0] - 2.6, FIN[1] + 2.2], [V[9], FIN[0] - .6, FIN[1] - 1.4], [ME, FIN[0] - 1.8, FIN[1] + .2]].forEach(([c, x, z]) => { ponerP(c, x + P(lt, dW(6), len) * 2, z, ryA(x, z, 0, 0)); retroceder(c, t, 1); setFace(c, "determined") }); break }
    case I.fall: case I.gold: case I.lost: { [[V[0], FIN[0] + 1, FIN[1] - 2], [V[2], FIN[0] + 2.4, FIN[1] + 1.2], [V[3], FIN[0] + .4, FIN[1] + 2.2], [V[9], FIN[0] + 2.6, FIN[1] - 1.2], [MADRES[0], FIN[0] + 3.8, FIN[1] + 2], [MADRES[1], FIN[0] + 4.2, FIN[1] - 2], [V[4], FIN[0] + 5, FIN[1] + .4]].forEach(([c, x, z], i) => { const cara = L === I.fall ? "terrified" : L === I.gold ? "wow" : "sad"; if (c === MADRES[0] || c === MADRES[1]) { ponerP(c, x, z, ryA(x, z, 0, 0)); cargarBebe(c, t); setFace(c, cara) } else arriba(c, x, z, 0, 0, cara, L === I.lost ? .2 : .8) });
      enHombros(FIN[0] + 1.4, FIN[1] - .2, ryA(FIN[0] + 1.4, FIN[1] - .2, 0, 0), { mira: 0 }); setFace(ME, L === I.lost ? "sad" : L === I.gold ? "wow" : "scared"); setFace(OLLIE, L === I.gold ? "wow" : L === I.lost ? "sad" : "terrified"); break }
    case I.kellup: { enAire(KELL, KELL_BORDE, 0); bastonQuieto(KELL, t); setFace(KELL, lt > dW(8) ? "shock" : "frio"); KELL.head.rotation.x = .5; break }
    case I.shoulders: case I.end: { enHombros(FIN[0] - 1, FIN[1] + .6, ryA(FIN[0] - 1, FIN[1] + .6, 0, -1), { senala: L === I.shoulders ? eIO(P(lt, dW(5), dW(9))) : 1 }); setFace(ME, L === I.end ? "warm" : "relieved"); setFace(OLLIE, "wow"); ME.head.rotation.x = -.3;
      if (L === I.end) { const e = eIO(P(lt, 0, dW(3))); OLLIE.g.position.y += .5 * e; ME.armL.rotation.x = -2.6 * e; ME.armR.rotation.x = -2.6 * e }
      [[V[2], FIN[0] + 1.6, FIN[1] + 2], [V[9], FIN[0] + 2.2, FIN[1] - 1.6]].forEach(([c, x, z]) => arriba(c, x, z, 0, 0, "relieved", .6)); break }
  }
  lejos(t);
  if (VISTA) { cam.position.set(VISTA[0], VISTA[1], VISTA[2]); cam.lookAt(VISTA[3], VISTA[4], VISTA[5]); cam.fov = VISTA[6] || 50; cam.updateProjectionMatrix(); lights([]); POST.tapa = null; return }
  lights([]); camara(t);
}
