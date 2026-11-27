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
const TALL = { mesa: [11.6, 1.2], perchero: [11.9, -2.8], ME: [11.6, 2.45] };
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
  [PA("open", 0, [4, 1.2, 34], TCAB([0, -7, 0]), 62), PA("open", 4, [3.2, 1.7, 19], [-5.5, 2.2, 13], 54, { h: .5 }), PA("open", 8, [-2.4, 1.8, 16.4], [-6.4, 1.8, 12.85], 50, { h: .6 })],
  // 2 · del cielo al pueblo, baja hasta el botón y después recorre las puertas de la calle
  [PA("rule", 0, [0, 46, 110], [0, 4, -20], 50), PA("rule", 5, [6, 26, 52], [0, 6, 0], 52), PA("cost", 0, [10, 21, 30], TCAB(), 46, { h: .4 }), PA("cost", 5, TJ_C(9), TCAB(), 40, { h: .5 }),
   PA("mystery", 0, [-2.6, 2.4, 34], [-6.5, 1.3, 30], 52), PA("mystery", 5, [-3, 1.6, 24.5], [-6.5, 1.2, 20], 50, { h: .5 })],
  // 3 · la plaza: más alta que la iglesia; los brazos de percha; el botón
  [PA("tall", 0, [-6, 1.3, -32], TCAB([0, -10, 0]), 64), PA("tall", 4, [-4, 1.5, -40], TCAB([0, -4, 0]), 60), PA("arms", 0, () => add(TEJEDORA.ganchoW(), [5, -3, 9]), () => TEJEDORA.ganchoW(), 52, { h: .5 }), PA("arms", 6, TJ_C(10), TCAB(), 44, { h: .6 })],
  // 4 · golpea la puerta de Marga
  [PA("voices", 0, [4.5, 1.5, -14], TCAB([0, -8, 0]), 62), PA("voices", 5, [1.5, 2.2, -26], [-6.4, 1.9, -32.45], 54, { h: .5 }), PA("voices", 13, [-2.6, 1.7, -29.6], [-6.4, 1.7, -32.45], 50, { h: .6 })],
  // 5 · los picaportes arrancados
  [PA("handles", 0, [-2.6, 1.4, 16.2], [-6.45, 1.1, 12.85], 46), PA("handles", 5, [-4.5, 1.2, 13.9], [-6.45, 1.05, 12.85], 38, { h: .6 })],
  // 6 · el ropero contra la puerta
  [PA("wardrobe", 0, [-12.2, 2.4, 16.2], [-7.4, 1.2, 12.8], 60), PA("wardrobe", 6, [-11.6, 2.2, 15.8], [-7.4, 1.2, 12.8], 56, { h: .5 })],
  // 7 · la boda: asienten
  [PA("wed", 0, [4, 2.4, -47], [0, 1.6, -59], 54), PA("wed", 8, [2.4, 2, -53.4], [0, 1.5, -58.8], 52, { h: .6 })],
  // 8 · Tib y el coro; las buenas noches
  [PA("choir", 0, [-9.4, 1.7, 15.6], () => add(headW(TIB).toArray(), [0, -.3, 0]), 52), PA("choir", 8, FRC2("TIB", 1.6, .5, .2), HD2("TIB"), 46, { h: .5 }),
   PA("goodnight", 0, [-9.6, 2.1, 14.2], HD2("TIB"), 54), PA("goodnight", 7, [-9.2, 1.9, 14.2], HD2("TIB"), 52, { h: .5 })],
  // 9 · el taller: cose; los agujeros
  [PA("tailor", 0, [14.6, 1.9, -2.6], [10, 1.1, 1.6], 58), PA("tailor", 3, FRC2("ME", 2.8, .9, .4), HD2("ME"), 52, { h: .4 }), PA("sew", 0, () => add(TALL_MESA(), [.9, .7, -1]), TALL_MESA, 42, { h: .6 }), PA("sew", 7, FRC2("ME", 2.8, -.9, .3), HD2("ME"), 52)],
  // 10 · la colina: se lleva el abrigo
  [PA("anyway", 0, [96, 22, -16], TCAB([0, -8, 0]), 58), PA("anyway", 4, [92, 21.4, -24], () => add(POSTE, [0, 2.7, 0]), 50, { h: .5 })],
  // 11 · Marga en su puerta
  [PA("marga", 0, [-1.2, 1.8, -27], HD2("MARGA"), 52), PA("marga", 8, FRC2("MARGA", 1.8, .4, .1), HD2("MARGA"), 46, { h: .5 })],
  // 12 · Marga le enseña a coser con las manos
  [PA("hands", 0, [14, 1.9, -1.4], () => add(headW(MARGA).toArray(), [-.6, -.4, 0]), 54), PA("hands", 6, FRC2("MARGA", 1.7, -.5, .1), HD2("MARGA"), 48, { h: .5 })],
  // 13 · Crane toca la campana (sube por la cuerda hasta la campana)
  [PA("crane", 0, [3.4, 1.6, -63.4], HD2("CRANE"), 54), PA("crane", 6, [3.6, 5, -62.6], [0, 8, -70], 58), PA("crane", 9, [3.2, 9.4, -63], IGL.campana, 50, { h: .6 })],
  // 14 · la única puerta con picaporte; Crane sonríe
  [PA("handle", 0, [14, 1.6, -69], [16.8, 1.3, -75], 52), PA("handle", 5, [16.4, 1.15, -73.5], CRN.picaporte, 34, { h: .7 }), PA("sinners", 0, FRC2("CRANE", 2.6, .3, -.5), HD2("CRANE"), 50), PA("sinners", 5, FRC2("CRANE", 1.8, .1, -.2), HD2("CRANE"), 44, { h: .4 })],
  // 15 · el bolsillo y la lista
  [PA("pocket", 0, [15.4, 2.5, -2.2], HD2("ME", -.5), 60), PA("pocket", 11, () => add(headW(ME).toArray(), [1.3, .8, 1.6]), LISTA_W, 46, { h: .6 }), PA("names", 0, () => add(LISTA_W(), [.25, .45, .35]), LISTA_W, 40), PA("owed", 0, () => add(LISTA_W(), [-.3, .4, .4]), LISTA_W, 38, { h: .6 }), PA("owed", 7, FRC2("ME", 2.4, .4, .1), HD2("ME"), 48)],
  // 16 · Crane cobra
  [PA("collect", 0, FRC2("CRANE", 3.2, -.5, -.8), HD2("CRANE"), 52), PA("collect", 4, FRC2("CRANE", 2.2, -.3, -.4), HD2("CRANE"), 46, { h: .5 })],
  // 17 · sigue el abrigo hasta la casa (la Tejedora camina por la calle)
  [PA("smell", 0, [4, 1.2, 24], TCAB([0, -6, 0]), 60), PA("smell", 7, [3.5, 1.4, 21], TCAB([0, -10, 0]), 62, { h: .5 })],
  // 18 · el abrigo rojo de la madre, hace dos años (recuerdo)
  [PA("red", 0, [93, 21.6, -23], () => add(POSTE, [0, 2.6, 0]), 50), PA("red", 8, FRC2("MAMA", 2.2, .5, .1), HD2("MAMA"), 46, { h: .5 })],
  // 19 · muda desde entonces
  [PA("mute", 0, FRC2("MAMA", 2.4, .3, .2), HD2("MAMA"), 50), PA("mute", 5, FRC2("MAMA", 1.9, .2, .1), HD2("MAMA"), 46, { h: .5 })],
  // 20 · el abrigo chico de Tib
  [PA("small", 0, () => add(TALL_MESA(), [.6, .8, -1.2]), TALL_MESA, 46), PA("small", 6, FRC2("ME", 2.4, .4, .1), HD2("ME"), 48, { h: .5 })],
  // 21 · la deuda: el padre y Tib que tose
  [PA("medicine", 0, [-8, 1.9, 13.4], HD2("PAPA"), 54), PA("medicine", 6, FRC2("TIB", 1.7, .5, .2), HD2("TIB"), 48, { h: .5 })],
  // 22 · los cambia
  [PA("stole", 0, FRC2("ME", 2.8, -.6, .3), HD2("ME"), 50), PA("stole", 6, FRC2("ME", 2.3, -.3, .1), HD2("ME"), 46, { h: .4 })],
  // 23 · roba el abrigo de Crane del gancho
  [PA("hook", 0, [13.4, 1.5, -68.6], CRN.gancho, 52), PA("hook", 4, [16, 1.9, -72.4], CRN.gancho, 44, { h: .5 }), PA("hook", 9, [14.6, 1.8, -70.6], HD2("ME"), 50)],
  // 24 · la campana suena y la Tejedora camina
  [PA("bell", 0, [6, 3, -50], [0, 13, -73.6], 50), PA("bell", 3, [4, 8, -62], IGL.campana, 46, { h: .5 })],
  // 25 · no fue a lo de Crane: vino a casa
  [PA("notcrane", 0, [-3.6, 1.6, 18.5], TCAB([0, -6, 0]), 60), PA("notcrane", 7, [-4.2, 1.2, 16], TCAB([0, -4, 0]), 64, { h: .5 })],
  // 26 · adentro: el olor, tres golpes, «open the door», la madre, Tib
  [PA("carried", 0, FRC2("ME", 2, .5, .2), HD2("ME"), 48), PA("three", 0, [-10.8, 1.8, 15.6], [-7, 1.5, 12.9], 56), PA("three", 3, [-8.6, 1.6, 14.6], [-6.9, 1.6, 12.9], 50, { h: .6 }),
   PA("love", 0, [-7.6, 2, 14.4], () => add(headW(MAMA).toArray(), [0, -.4, 0]), 54), PA("beside", 2, [-7.8, 1.95, 14.2], HD2("MAMA"), 50, { h: .5 }), PA("beside", 8, [-8, 1.9, 14.3], HD2("MAMA"), 48),
   PA("tibup", 0, FRC2("TIB", 1.6, .95, .35), HD2("TIB"), 60), PA("tibup", 5, FRC2("TIB", 1.4, .95, .3), HD2("TIB"), 58, { h: .5 })],
  // 27 · sale por la ventana de atrás
  [PA("window", 0, [-10.6, 1.8, 15.8], [-13.6, 1.3, 14], 56), PA("window", 6, [-11.2, 1.7, 15.4], [-13.8, 1.4, 14], 52, { h: .5 })],
  // 28 · trepa la Tejedora, el abrigo rojo, corta los puntos, grita
  [PA("ladder", 0, () => TREPA_CAM(.15, 0), () => ME.g.getWorldPosition(new THREE.Vector3()).toArray(), 58), PA("ladder", 6, () => TREPA_CAM(.45, 0), () => ME.g.getWorldPosition(new THREE.Vector3()).toArray(), 58),
   PA("chest", 0, () => TREPA_CAM(.85, 0), TPECHO(), 52), PA("chest", 7, TPECHO_C(2.4), TPECHO(), 44, { h: .6 }),
   PA("cut", 0, TPECHO_C(1.6), TPECHO(), 42), PA("cut", 5, TPECHO_C(2), () => add(TEJEDORA.pechoW(), [0, .3, 0]), 46, { h: .5 }),
   PA("scream", 0, [4, 2, 34], TCAB([0, -5, 0]), 64), PA("scream", 4, [3.4, 1.6, 27], TCAB([0, -2, 0]), 60, { h: .4 })],
  // 29 · el abrigo rojo cae a la calle; la madre lo levanta y tose
  [PA("fell", 0, [3, 4, 21], () => ROJO_W(), 54), PA("fell", 7, () => add([CAIDA[0], 0, CAIDA[1]], [-1.8, 1.5, -1.6]), () => add(headW(MAMA).toArray(), [0, -.5, 0]), 50, { h: .6 })],
  // 30 · camina hasta la única puerta con picaporte
  [PA("walked", 0, [3, 1.3, 30], TCAB([0, -8, 0]), 60), PA("walked", 6, [2.5, 1.6, 22], TCAB([0, -6, 0]), 62, { h: .4 })],
  // 31 · no necesitó golpear
  [PA("noknock", 0, [8, 4, -56], [16.8, 3, -73], 52), PA("noknock", 3, [10, 3, -60], [16.8, 1.6, -74], 48, { h: .6 })],
  // 32 · a la mañana, la puerta de Crane abierta
  [PA("morning", 0, [10, 2, -60], [16.8, 1.4, -75], 52), PA("morning", 7, [15.4, 2.5, -65.6], [16.8, 1.3, -75.5], 48, { h: .5 })],
  // 33 · ahora golpea con la voz de Crane, leyendo nombres
  [PA("readnames", 0, [14, 22, 30], TCAB([0, -8, 0]), 50), PA("readnames", 7, [8, 9, 6], TCAB([0, -5, 0]), 56, { h: .4 })],
  // 34 · esta noche: buenas noches cinco veces, y alguien contesta
  [PA("tonightend", 0, [-9.4, 1.8, 15.4], HD2("TIB"), 52), PA("tonightend", 5, FRC2("TIB", 1.7, .5, .2), HD2("TIB"), 46, { h: .4 }),
   PA("end", 0, FRC2("MAMA", 2.8, .5, .2), HD2("MAMA", -.45), 52), PA("end", 5, FRC2("MAMA", 2.4, .3, .1), HD2("MAMA", -.45), 50, { h: .5 })],
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
  const lug = LUG[N] || "calle";
  setEnv(QS.get("env") || ({ calle: "tejedora", calleSin: "noche", niebla: "nocheNiebla", casa: "interior", recuerdo: "noche", dia: "amanecer" })[lug]); ambiente(t);
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
    case "wed": bodaVisible(true); { const [a, b] = BODA_V.novios; mira(NOVIO, a[0], a[1], b[0], b[1], "ternura"); mira(NOVIA, b[0], b[1], a[0], a[1], "happy"); asentir(NOVIO, t); asentir(NOVIA, t + .3);
      mira(CRANE, BODA_V.cura[0], BODA_V.cura[1], 0, -50, "sonrisaFalsa"); V.slice(0, 6).forEach((c, i) => mira(c, -3 + (i % 3) * 3, -53.5 + (i / 3 | 0) * 1.6, 0, -59, "warm")) } break;
    case "choir": den(TIB, -12.4, 15.9, -9.4, 15.6, "habla"); muneco(TIB, "mano"); den(ME, -10.8, 14.6, -12.4, 15.9, "squint"); break;
    case "goodnight": den(TIB, -12.4, 15.9, -9.4, 14.4, "ternura"); saludarBuenasNoches(TIB, t); muneco(TIB, "abrazo"); den(MAMA, -13.3, 14.3, -12.4, 15.9, "tristeMudo"); break;
    case "tailor": taller(); break;
    case "sew": taller(); coser(ME, t); break;
    case "anyway": { abrigoEnPoste(lt < dW(4) ? "gris" : null); teje(POSTE[0] - 5, POSTE[2] - 4, ryA(POSTE[0] - 5, POSTE[2] - 4, POSTE[0], POSTE[2])); TEJEDORA.agacharse(.4, add(POSTE, [0, 2.7, 0])); break }
    case "marga": mira(MARGA, -5, -32.2, 0, -27, "sad"); break;
    case "hands": taller(); coser(ME, t); ponerP(MARGA, 9.6, 2, ryA(9.6, 2, TALL.ME[0], TALL.ME[1])); setFace(MARGA, "ternura"); hablarManos(MARGA, t); break;
    case "crane": ponerP(CRANE, .9, -68.4, Math.PI * .1); setFace(CRANE, "crane"); campanaToca(.8 * tocarCampana(CRANE, t, { alto: 9 }) - .4); break;
    case "handle": break;
    case "sinners": case "collect": mira(CRANE, 16.8, -73.6, 16.8, -60, N === "collect" ? "desprecio" : "sonrisaFalsa"); break;
    case "pocket": case "names": case "owed": taller(N === "owed" ? "horrified" : "concentrado"); lista(ME, true); break;
    case "smell": camina(.5, -12, 2.6, 0); break;
    case "red": abrigoEnPoste("rojo"); mira(MAMA, POSTE[0] + 3, POSTE[2] + 3.4, POSTE[0], POSTE[2], "tristeMudo"); break;
    case "mute": den(MAMA, -11.6, 15.6, -9.6, 14, "tristeMudo"); break;
    case "small": taller("horrified"); abrigoEnMano(ME, "tib", { doblado: false }); break;
    case "medicine": den(PAPA, -9.4, 13.4, -12.4, 15.9, "cansado"); den(TIB, -12.4, 15.9, -9.4, 13.4, "tos"); toser(TIB, t); break;
    case "stole": taller("determined"); cortarTijera(ME, t); break;
    case "hook": { abrigoEnGancho(lt < dW(4)); ponerP(ME, 17.4, -73.6, Math.PI * .8); setFace(ME, "scared"); if (lt > dW(4)) abrigoEnMano(ME, "crane") } break;
    case "bell": campanaToca(.9 * Math.sin(t * 2.6)); break;
    case "notcrane": camina(.5, -6, 2.6, 0); break;
    case "carried": familia("horrified"); break;
    case "three": { familia(); const f = Math.max(...[.2, .55, .9].map(g => Math.exp(-(((k - g) / .04) ** 2)))); TEMBLOR = .015 * f; roperoMover(0); break }
    case "love": case "beside": familia(); setFace(MAMA, N === "beside" || lt > dW(3) ? "llora" : "tristeMudo"); break;
    case "tibup": den(TIB, -10.9, 13.9, -6.6, 12.9, "miedo"); den(ME, -10.2, 12.6, -6.6, 12.9, "terror"); taparBoca(ME, TIB, P(lt, dW(5) - .3, dW(7))); den(MAMA, -11.8, 16.2, -6.6, 12.9, "llora"); break;
    case "window": { puertaAbrir("ventanaAtras", 1); adentro(ME, FAMP.ventana[0] - .3, FAMP.ventana[1], -Math.PI / 2); salirVentana(ME, P(lt, 0, dW(6))); setFace(ME, "determined"); tejeFam(); break }
    case "ladder": case "chest": case "cut": case "scream": { tejeFam(); const u = N === "ladder" ? .1 + .5 * k : N === "chest" ? .6 + .4 * k : 1; const q = TEJEDORA.trepaPunto(u);
      enAire(ME, [q.p[0] + q.n[0] * .45, q.p[1] - 1.2, q.p[2] + q.n[2] * .45], Math.atan2(-q.n[0], -q.n[2])); trepar(ME, t, {});
      setFace(ME, N === "cut" ? "determined" : N === "scream" ? "terror" : "esfuerzo");
      if (N === "cut") { cortarTijera(ME, t, { sobre: true }); TEJEDORA.cortarPuntos(P(lt, 0, len)) } else if (N === "scream") { TEJEDORA.cortarPuntos(1); TEJEDORA.gritar(t, P(lt, 0, .6)); TEMBLOR = .03 } break }
    case "fell": { tejeFam(); TEJEDORA.gritar(t, 1 - P(lt, 0, 1)); const u = P(lt, 0, dW(6)); if (u < 1) TEJEDORA.abrigoRojoCae(u, [CAIDA[0], PISO(...CAIDA), CAIDA[1]]); else { TEJEDORA.ROJO.visible = false; levantarAbrigo(MAMA, P(lt, dW(6), dW(9)), { tipo: "rojo" }) }
      mira(MAMA, CAIDA[0] + .9, CAIDA[1] + .5, CAIDA[0], CAIDA[1], lt > dW(11) ? "tos" : "llora"); if (lt > dW(11)) toser(MAMA, t); break }
    case "walked": camina(.5, 10, 2.6, Math.PI); break;
    case "noknock": { setEnv("noche"); ambiente(t); teje(16.8, -67.4, Math.PI); const a = TEJEDORA.abrirPuerta(P(lt, .1, len), CRN.picaporte); puertaAbrir("crane", a); break }
    case "morning": puertaAbrir("crane", 1); abrigoEnGancho(false); [[11.4, -70], [13, -70.4], [20.4, -70], [22, -69.6]].forEach(([x, z], i) => mira(V[i], x, z, 16.8, -75, i % 2 ? "scared" : "worried")); break;
    case "readnames": teje(-.6, -10, -Math.PI / 2); TEJEDORA.golpear(t, P(lt, 0, len), [-6.45, 1.9, -10]); break;
    case "tonightend": den(TIB, -12.4, 15.9, -9.4, 15.4, "ternura"); saludarBuenasNoches(TIB, t); den(MAMA, -11, 14.7, -12.4, 15.9, "tristeMudo"); abrigoRojo(MAMA, true); den(ME, -9.8, 15.8, -12.4, 15.9, "warm"); break;
    case "end": den(TIB, -12.4, 15.9, -11, 14.7, lt > dW(4) ? "happy" : "ternura"); den(MAMA, -11, 14.7, -12.4, 15.9, lt > dW(4) ? "habla" : "ternura"); abrigoRojo(MAMA, true); den(ME, -9.8, 15.8, -12.4, 15.9, "relieved"); break;
  }
  const hayTeje = ["open", "rule", "cost", "mystery", "tall", "arms", "voices", "anyway", "smell", "notcrane", "window", "ladder", "chest", "cut", "scream", "fell", "walked", "noknock", "readnames"].includes(N);
  if (hayTeje) TEJEDORA.aura(true, 1);
  lejos(t);
  if (VISTA) { cam.position.set(VISTA[0], VISTA[1], VISTA[2]); cam.lookAt(VISTA[3], VISTA[4], VISTA[5]); cam.fov = VISTA[6] || 50; cam.updateProjectionMatrix(); lights(lucesCerca(cam.position.toArray(), 6)); POST.tapa = null; return }
  camara(t); let LX = lucesCerca(cam.position.toArray(), 6);
  if (cam.position.x > 6 && cam.position.x < 16 && cam.position.z > -4 && cam.position.z < 6) LX = LX.map(l => [l[0], l[1] * .3, l[2], l[3]]);   // el taller: la lámpara quemaba las caras
  if (lug === "casa" && cam.position.x < -6) LX = LX.map(l => [l[0], l[1] * .55, l[2], l[3]]);
  if (N === "window") LX.push([[-15.4, 2.6, 15], 5, "#ffc480", 12]); lights(hayTeje ? TEJEDORA.luzFria(LX) : LX);
}
