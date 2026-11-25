//@@LUGAR
const LUGAR = L => "pueblo";
// dónde termina Onetusk la bajada: un poco al oeste, para que la torre le quede del lado del muñón (su izquierda)
const BFIN = { x: -8, z: -33 };
let BX = CRESTA[0], BZ = CRESTA[1];   // dónde está parada la bestia en este cuadro (para las cámaras relativas a ella)
const ponerP = (k, x, z, ry = 0) => { k.g.visible = true; k.g.position.set(x, SUELO(x, z), z); k.g.rotation.set(0, ry, 0) };
const enTorre = (k, p, ry) => { k.g.visible = true; k.g.position.set(p[0], p[1], p[2]); k.g.rotation.set(0, ry, 0) };

//@@SHOTS
const G = (x, dy, z) => () => [x, SUELO(x, z) + dy, z];
const KW = (k, o) => () => add(k.g.getWorldPosition(new THREE.Vector3()).toArray(), o);
const OW = (obj, o) => () => { obj.updateMatrixWorld(true); return obj.localToWorld(new THREE.Vector3(...o)).toArray() };
const BR = o => () => [BX + o[0], SUELO(BX, BZ) + o[1], BZ + o[2]];           // relativo a los pies de la bestia
const CB = (o = [0, 0, 0]) => () => cabezaW(o);
const OJ = (o = [0, 0, 0], lado = 1) => () => add(ojoW(lado), o);
const MU = (o = [0, 0, 0]) => () => add(munonW(), o);
const BO = (o = [0, 0, 0]) => () => add(BOCA_W(), o);
const BQ = (o = [0, 0, 0]) => () => add(BOQUILLA_W(), o);
const CBA = (o = [0, 0, 0]) => () => add(CUERNO_BASE_W(), o);
// cámara que acompaña al narrador por la escalera de la torre: afuera de la espiral, a `r` del eje
const ESC = (r, dy) => () => { const p = ME.g.getWorldPosition(new THREE.Vector3()), dx = p.x - TORRE[0], dz = p.z - TORRE[1], d = Math.hypot(dx, dz) || 1; return [p.x + dx / d * r, p.y + dy, p.z + dz / d * r] };
const ARENA = "#c9925a", MARFIL = "#e8dcc0", NOCHE = "#2a1a14", PIEL = "#8a7458";
const SHOTS = {
  [I.rule]: [sh(0, CB([9, -3, 15]), [16, 44, -92], CB([0, -3, 6]), CB([0, -8, 0]), 42), sh(3, [2.6, 2.4, 23], [1.6, 3, 17], [0, 12, -10], [0, 14, -10], 58, { lat: 1 })],
  [I.cost]: [sh(0, [10, 23, 3], [5, 20.6, -3], [0, 18, -10], null, 50), sh(3, [-17, 21, 12], [-14, 26, 0], [0, 46, -160], [0, 50, -160], 30, { lat: 2 })],
  [I.today]: [sh(0, BO([-3.4, 2.8, 5.6]), BO([-2, 2.2, 3.8]), BO([-.6, 1.5, 0]), null, 50, { tr: "tapa", col: ARENA })],
  [I.horn]: [sh(0, [-24, 27, 12], [-12, 24, 20], [0, 16, -10], null, 50, { tr: "tapa", col: ARENA, dir: -1 }), sh(6, [22, 9, 24], [10, 11, 22], [0, 14, -10], null, 55), sh(10, [-10, 20.2, -6], [3, 19.8, -6.6], [6, 18.4, -10], [12, 18, -10], 45)],
  [I.wed]: [sh(0, [-3, 4.4, 3], [-7.4, 3.4, 6.6], [-13, 1.8, 12], null, 55), sh(6, [-12.4, 3.3, 5.6], [-12.8, 3, 7.6], [-13, 1.7, 12], null, 50)],
  [I.babies]: [sh(0, [-16.6, 4.4, 36.4], [-18.6, 3.2, 33], [-20, 1.6, 28], null, 46), sh(6, [-18.2, 3, 34.2], [-19, 2.7, 32.8], [-20, 1.5, 28], null, 48)],
  [I.school]: [sh(0, [20, 5.4, -8], [25, 3.6, -12.2], [29, 2.2, -15], null, 60), sh(5, [22.6, 3, -17.4], [24.4, 2.8, -15.6], KW(QUILL, [0, 1.9, 0]), null, 52)],
  [I.roost]: [sh(0, [-20, 5, -7], [-24.6, 2.6, -11.4], [-28, .8, -14], null, 55), sh(5, [-20.6, 2.7, -11.4], [-22.2, 2.5, -12.8], KW(FOLK[3], [0, 1.8, 0]), null, 52)],
  [I.ridge]: [sh(0, [-15, 2.4, 8], [-12.6, 3, 1], [0, 40, -160], [0, 48, -160], 24, { lat: 1.2 }), sh(5, G(12, 3, -106), G(7, 3.6, -117), [0, 42, -152], [0, 48, -156], 52)],
  [I.tall]: [sh(0, [-17, 3, 34], [-14.4, 4, 26], [-4, 26, -120], [-4, 31, -120], 34, { lat: 1.5 }), sh(6, G(30, 9, -134), G(20, 7, -144), [-2, 38, -160], [-2, 44, -160], 62, { lat: 3 })],
  [I.tusk]: [sh(0, [-27, 45, -98], [-18, 43.4, -106], CB([-3, -9, 14]), null, 36), sh(4, [24, 47, -104], [16, 45, -114], MU(), null, 32)],
  [I.sixty]: [sh(0, [-62, 42, -88], [-48, 38, -102], [0, 44, -160], null, 40)],
  [I.bee]: [sh(0, [-2, 2.6, 9], [.8, 2.1, 11.4], KW(ME6, [0, 1.3, 0]), null, 52), sh(6, [-.4, 2, 15.4], [.8, 1.8, 14.4], KW(ME6, [0, 1.3, 0]), null, 50)],
  [I.listen1]: [sh(0, KW(ME6, [2.8, 1.8, 5.4]), KW(ME6, [1, 1.7, 4.8]), KW(ME6, [.6, 1.3, 0]), null, 50), sh(3, KW(ME6, [-2.4, 1, 4.2]), KW(ME6, [-1.2, .9, 3.6]), KW(ME6, [0, .9, 0]), null, 52), sh(7, KW(ME6, [1.2, .9, 4.6]), KW(ME6, [2.4, .8, 3.6]), KW(ME6, [-1, 5, -6]), null, 60)],
  [I.listen2]: [sh(0, [-7.4, 2.2, 15.4], [-7.8, 2.4, 13.4], [-7, 3.6, -30], [-7, 5, -30], 50, { lat: 1 }), sh(8, [-12, 30, -56], [-8, 36, -78], CB([0, 0, 4]), null, 30)],
  [I.nobody]: [sh(0, KW(ME, [3.4, 1.8, -6.4]), KW(ME, [1.6, 1.8, -5.6]), KW(ME, [-.6, 1.4, 0]), null, 52)],
  [I.dez]: [sh(0, [34, 28, 40], [22, 22, 28], () => FUEGO_POS, null, 50, { tr: "tapa", col: NOCHE }), sh(4, BO([-3.6, 2.8, 5.8]), BO([-2, 2.2, 3.8]), BO([-.6, 1.4, 0]), null, 50), sh(10, [-14, 25, -17], [-10, 23, -14], () => FUEGO_POS, null, 52)],
  [I.note]: [sh(0, [-22, 31, 8], [-16, 27, 0], BO([-7, 0, 0]), null, 55)],
  [I.eleven]: [sh(0, BR([26, 4, 52]), BR([20, 3.4, 44]), CB([0, -10, 0]), null, 56, { shake: .2 }), sh(5, BR([-46, 62, 60]), BR([-36, 54, 46]), BR([0, 14, 10]), null, 50)],
  [I.nine]: [sh(0, BR([40, 6, 40]), BR([29, 5, 31]), BR([6, 8, 14]), null, 60, { shake: .3 }), sh(4, BR([22, 10, 60]), BR([16, 9, 52]), CB([0, -4, 4]), null, 50)],
  [I.night]: [sh(0, [27, 4, -15], [20, 5.6, -12], [-4, 24, -24], null, 62), sh(8, [-12, 12, -24], [-11, 15.4, -32], BR([0, 20, 0]), null, 50, { tr: "tapa", col: "#d8a070", lat: 1 })],
  [I.ponds]: [sh(0, [0, 70, 40], [0, 56, 14], [0, 2, -70], [0, 2, -88], 55, { tr: "tapa", col: ARENA }), sh(6, [-1, 5.4, -11], [-3, 3.6, -16.4], [-6, .4, -24], null, 52)],
  [I.sign]: [sh(0, [0, 3, 23], [0, 3.8, 15], [0, 10, -10], null, 50), sh(7, [1.6, 6, 9], [1, 7.4, 3.6], [0, 10.6, -10], null, 40)],
  [I.storm]: [sh(0, [64, 42, 92], [46, 33, 72], [0, 10, -34], null, 50), sh(3, [0, 2.6, 41], [0, 2.7, 32], [0, 4.5, 0], null, 55)],
  [I.orange]: [sh(0, [3.4, 2, 27], [3, 2.2, 22], [0, 12, -10], [0, 15, -10], 55), sh(4, KW(ME, [-2.6, 1.8, 5.8]), KW(ME, [-1.4, 1.8, 4.6]), KW(ME, [0, 1.4, 0]), null, 50)],
  [I.goat]: [sh(0, [7, 2.4, -44], [5.6, 2.2, -50], KW(ME6, [0, 1, -3]), null, 58, { lat: 1 }), sh(3, [9, 2, -42.6], [9, 2.1, -45], [0, 1.2, -43], [0, 1.2, -45], 62, { fijo: 1 })],
  [I.scream]: [sh(0, [3.8, 2.2, -32.8], [2.6, 2.2, -31], KW(ME, [0, 1.5, 0]), null, 50), sh(4, [11, 3.2, -31], [8.4, 3, -29.6], [0, 2, -28], null, 54)],
  [I.forty]: [sh(0, [-13, 2.6, -33], [-4, 2.6, -32], [3, 2, -26], [8, 2, -26], 52), sh(3, [9, 10.5, -38], [5.4, 8, -35], [0, 1.5, -26], null, 54)],
  [I.louder]: [sh(0, [2.8, 3, -16], [2.2, 2.6, -20], KW(ME, [0, 1.5, 0]), null, 52), sh(5, [4, 3, -31], [5.4, 7, -27], [0, 17, -10], [0, 18.4, -10], 50)],
  [I.climb]: [sh(0, ESC(8, 2.6), ESC(7, 2.2), KW(ME, [0, 1.2, 0]), null, 56), sh(4, [.5, 36, -9], [0, 30, -9.6], [0, 0, -10], null, 50)],
  [I.mouth]: [sh(0, BO([-3.2, 2.5, 5]), BO([-1.8, 2.1, 3.4]), BO([-.7, 1.5, 0]), null, 46)],
  [I.blew]: [sh(0, BO([-3.6, 1.5, -4.2]), BO([-2.4, 1.5, -3.2]), BO([-.6, 1.6, 0]), null, 50), sh(3, [15, 24, -9], [20, 28, -8], [0, 18, -10], null, 55)],
  [I.rolling]: [sh(0, [15, 23, 3], [-4, 32, -104], BO([-4, 1, -8]), [0, 46, -160], 50)],
  [I.turned]: [sh(0, [-18, 51, -110], [-12, 50.5, -119], CB([0, 0, 4]), null, 30), sh(3, [15, 50.4, -122], [11.4, 50.2, -126.4], OJ(), null, 26)],
  [I.one]: [sh(0, G(22, 3, -116), G(15, 3.4, -127), [0, 36, -156], [0, 40, -152], 62, { shake: .25 }), sh(2, [-7, 5.2, 15], [-3, 3.6, 15.5], [7, 1.6, 16], null, 60)],
  [I.five]: [sh(0, BR([44, 10, 58]), BR([34, 8, 40]), BR([0, 18, 6]), null, 54, { shake: .2 }), sh(2, [-1, 5.4, -11], [-3, 3.8, -16.4], [-6, .4, -24], null, 52)],
  [I.shadow]: [sh(0, [7, 1.9, 12], [5, 2.5, 5], CB([0, -8, 0]), null, 62, { shake: .25 }), sh(3, [2, 30, 26], [0, 22, 17], [0, 6, -14], null, 56)],
  [I.stayed]: [sh(0, [0, 2.4, 33], [0, 2.4, 41], [0, 2.2, 12], null, 54), sh(2, BO([.6, 1.6, 5]), BO([-.6, 1.6, 3.8]), BO([-.4, 1.7, 0]), null, 52)],
  [I.trunk]: [sh(0, [16, 9, 8], [12, 12, 3], [0, 10, -10], null, 60, { shake: .15 }), sh(6, [11, 6.6, 3], [7.6, 8, -1.6], [2, 9, -8], null, 46)],
  [I.face]: [sh(0, BO([5.4, 2.6, 3.4]), BO([4.2, 2.3, 2.4]), OJ(), null, 52), sh(5, [6.4, 20.4, 8], [5, 19.4, 5], () => { const a = BOCA_W(), b = ojoW(1); return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + .8, (a[2] + b[2]) / 2] }, null, 54)],
  [I.stump]: [sh(0, BR([26, 31, 60]), BR([21, 29, 52]), MU(), null, 34)],
  [I.same]: [sh(0, [-4, 21.4, 8], [3, 21, 6], [2, 18.6, -10], null, 50), sh(3, [-4, 19.9, -8], [-1.2, 19.6, -8.2], [0, 18.6, -10], null, 30), sh(6, BR([15, 27, 47]), BR([13, 26, 43]), MU(), null, 30)],
  [I.built]: [sh(0, BO([-5.6, 2.2, 2.8]), BO([-4.4, 2, 2.1]), BO([0, 1.5, 0]), null, 50)],
  [I.cut]: [sh(0, BR([25, 26, 57]), BR([19, 25, 48]), MU([0, -2, 0]), null, 44)],
  [I.pins]: [sh(0, [7, 21.6, -1], [4.4, 20.2, -4.6], OW(PERNOS[0], [0, 0, 0]), null, 40), sh(4, [21, 21, 11], [16, 19.6, 6], [1, 18, -10], [0, 16.6, -11], 54)],
  [I.caught]: [sh(0, BR([27, 27, 60]), BR([20, 25.6, 50]), MU([0, -1.5, 0]), null, 42, { tr: "tapa", col: MARFIL }), sh(3, BR([30, 24, 62]), BR([23, 23, 52]), MU([0, -3, 2]), null, 46)],
  [I.eyes]: [sh(0, OJ([9, .4, 12]), OJ([6.4, .2, 9.4]), OJ(), null, 28)],
  [I.small]: [sh(0, [7, 9, -10], [3.6, 4, -17], KW(ME6, [0, 1, 0]), null, 54), sh(5, KW(ME6, [4, 1.7, 4.4]), KW(ME6, [2.6, 1.5, 3.2]), KW(ME6, [0, 1.1, 0]), null, 50)],
  [I.found]: [sh(0, KW(ME6, [-3, 1.7, 5.2]), KW(ME6, [-1.8, 1.6, 4.4]), KW(ME6, [0, 1.1, 0]), null, 50, { lat: .6 }), sh(4, KW(ME6, [-4.4, 2.4, 7.6]), KW(ME6, [-3, 2, 5.8]), KW(ME6, [1, 1.1, .4]), null, 56, { tr: "sigue", lat: .6 })],
  [I.followed]: [sh(0, KW(ME6, [-4, 1.6, 5.6]), KW(ME6, [-2.8, 1.5, 4.4]), KW(ME6, [.9, 1.2, 0]), null, 52, { tr: "sigue", lat: .6 })],
  [I.back]: [sh(0, [9, 2.4, -21], [7, 2.9, -23.4], BR([0, 22, 0]), null, 56), sh(5, BR([54, 16, 14]), BR([44, 14, 4]), CB([0, -6, 6]), null, 32)],
  [I.life]: [sh(0, [9, 23, 2], [5, 21, -3.4], [0, 18, -10], null, 50), sh(3, [-44, 42, 54], [-30, 34, 40], [0, 10, -10], null, 50)],
  [I.ours]: [sh(0, KW(ME, [2.8, 1.9, -6]), KW(ME, [1.4, 1.9, -4.8]), KW(ME, [-.7, 1.4, 0]), null, 52)],
  [I.listen3]: [sh(0, KW(ME6, [-2.6, 1.7, -5.4]), KW(ME6, [-1.2, 1.6, -4.4]), KW(ME6, [.7, 1.3, 0]), null, 50)],
  [I.heard]: [sh(0, [-9.4, 3.2, 9.4], [-9.4, 3.8, 11.6], [0, 20, -160], [0, 23, -160], 34, { lat: .4 })],
};

//@@ESCENA
// ---------- la escena en cada instante
let ENV_OK = false;
function setScene(t) {
  const L = lineAt(t), lt = t - s(L), len = (S[L + 1] ?? DUR) - s(L), k = P(lt, 0, len), Wd = kk => wt(L, kk), T0 = s(L);
  POST = { flash: 0, sepia: 0 };
  if (!ENV_OK) { Object.assign(ENV, ENV_DUSTMERE); ENV_OK = true; M_ESTANQUE.bumpScale = 1.3; M_ESTANQUE.envMapIntensity = .55; ENV.desierto.agua = "#3f6f88"; ENV.despues.agua = "#4f7f98"; ENV.tormenta.agua = "#7a6a4a"; ENV.incendio.agua = "#1a2a3a" }
  mundoReset(); utileriaReset();
  ALL.forEach(c => { if (c.polvo) c.polvo.forEach(q => q.visible = false); c.g.visible = false; c.body.rotation.set(0, 0, 0); c.body.position.y = 0; c.head.rotation.set(0, 0, 0); power(c, null, 0); c.aura.visible = false; setFace(c, "neutral"); pose(c, t, {}); quieto(c, t) });
  [PALA, REGLA, TELESC, HOYO].forEach(o => o.visible = false);
  // ---- la luz según el momento: mañana clara, recuerdo de noche con incendio, tormenta naranja, y la tormenta que se abre
  const RECUERDO = L >= I.dez && L <= I.night, ALBA = L === I.night && lt >= Wd(8) - T0 - .06;
  const TORM = L === I.today || (L >= I.storm && L <= I.eyes), DESPUES = L >= I.small;
  const fuerza = L === I.today ? .8 : L === I.storm ? .15 + .85 * eIO(k) : (L > I.storm && L <= I.rolling) ? 1 : (L >= I.turned && L <= I.shadow) ? .55 : (L >= I.stayed && L <= I.cut) ? .5 : (L >= I.pins && L <= I.eyes) ? .5 - .3 * ((L - I.pins) + k) / 3 : 0;
  setEnv(RECUERDO ? (ALBA ? "despues" : "incendio") : TORM ? "tormenta" : DESPUES ? "despues" : "desierto");
  if (TORM) { const A = ENV.tormenta, B = ENV.desierto, f = cl(fuerza); scene.fog.density = lerp(B.fog * 2.5, A.fog * (L >= I.trunk ? .16 : L >= I.turned ? .26 : L === I.rolling ? .13 : (L === I.orange || L === I.storm) ? .26 : .42), f) }
  if (L >= I.life) scene.fog.density *= .45;
  SOL.z = (L === I.ridge || L === I.tall || L === I.tusk || L === I.sixty || L === I.turned || (L === I.one && lt < Wd(2) - T0) || L === I.heard || L === I.listen2) ? -150 : 0;
  ambiente(t); tormenta(t, cam.position, TORM ? fuerza : 0); tortuga(t, { paso: 0 }); LUCES.forEach(l => l.visible = false);
  estanquesVisibles(!RECUERDO || ALBA); RUINAS.forEach((r, i) => ruinaEstado(i, !RECUERDO ? 1 : L < I.nine ? 0 : L === I.nine ? eIO(P(k, i * .09, i * .09 + .22)) : 1));
  fuegoViejo(t, RECUERDO && !ALBA);
  let LL = []; if (RECUERDO && !ALBA) LL.push([FUEGO_POS, 5, "#ff8a3a", 60], [[0, 20, -6], 2.2, "#ffb070", 40]);
  TEMBLOR = 0; grietasTorre(L < I.trunk ? 0 : L === I.trunk ? eIO(P(lt, Wd(6) - T0 - .3, Wd(6) - T0 + .5)) : (L <= I.back && !RECUERDO) ? 1 : (L > I.back ? 1 : 0));
  // ---- el cuerno: en la torre hasta que el narrador saca los pernos; después lo tiene Onetusk
  const SIN_CUERNO = L > I.pins; PERNOS.forEach(q => q.visible = L <= I.pins); pernosFuera(L < I.pins ? 0 : L === I.pins ? eOut(P(k, .05, .42)) : 1); cuernoCae(L < I.pins ? 0 : L === I.pins ? eIO(P(lt, Wd(4) - T0 - .1, len)) : 1); CUERNO.visible = !SIN_CUERNO;
  // ---- Onetusk según la frase
  const SEG = BESTIA_SEG_PASO, baj = p => { const pp = Math.min(p, BAJADA.pasos); return { x: BFIN.x * eIO(P(pp, 17, BAJADA.pasos)), z: CRESTA[1] + bestiaAvance(pp, BAJADA.pasos), paso: p, pasoFin: BAJADA.pasos } };
  let B = { x: CRESTA[0], z: CRESTA[1] };   // por defecto: quieta en la cresta
  const QUIETA = { gira: Math.sin(t * .23) * .04, orejas: .05 };
  if (L === I.turned) B = { ...B, gira: -.5 * eIO(P(k, .05, .8)), orejas: .5 * eIO(P(k, .3, .9)) };
  else if (L === I.one) B = { ...baj(lt / SEG), gira: -.3, orejas: .7 };
  else if (L === I.five) B = { ...baj(9 + lt / SEG), orejas: .8 };
  else if (L === I.shadow) B = { ...baj(21.6 + lt / SEG), orejas: 1, baja: .2 };
  else if (L === I.stayed) B = { ...baj(BAJADA.pasos + 3 + lt / SEG), orejas: 1, baja: .3 * eIO(k) };
  else if (L === I.trunk) B = { ...baj(99), orejas: 1, baja: .3, trompa: "enrosca", trompaEn: [TORRE[0], 9.5, TORRE[1]], trompaR: 4.4, trompaQ: eIO(P(k, 0, .7)) };
  else if (L >= I.face && L <= I.pins) B = { ...baj(99), orejas: .7, baja: L === I.face ? .55 + .25 * eIO(k) : L === I.stump ? lerp(.8, .22, eIO(k)) : .22, gira: L === I.face ? .32 * eIO(k) : L === I.stump ? lerp(.32, .06, eIO(k)) : .06, trompa: "enrosca", trompaEn: [TORRE[0], 9.5, TORRE[1]], trompaR: 4.4, trompaQ: 1 };
  else if (L === I.caught) B = { ...baj(99), orejas: .4, baja: .5, gira: .2, trompa: "sostiene", trompaDe: "enrosca", trompaQ: eIO(P(k, 0, .5)), conColmillo: eIO(P(k, .05, .4)) };
  else if (L >= I.eyes && L <= I.followed) B = { ...baj(99), orejas: .1, baja: .45, gira: .1, trompa: "sostiene", conColmillo: 1, ojos: L === I.eyes ? eIO(P(k, .1, .45)) : L === I.small ? 1 - eIO(P(k, .3, .6)) : 0 };
  else if (L === I.back) { const p = 6 + lt / SEG; B = { x: BFIN.x * (1 - eIO(P(p, 0, 14))), z: BFIN.z - 30 - bestiaAvance(p, 99), ry: Math.PI, paso: p, trompa: "sostiene", conColmillo: 1 } }
  else if (L >= I.life) B = { ...B, trompa: "sostiene", conColmillo: 1, ...QUIETA };
  else if (L === I.eleven) B = { ...baj(7 + lt / SEG), orejas: .9 };
  else if (L === I.nine) B = { ...baj(15 + lt / SEG), orejas: 1, baja: lt >= Wd(4) - T0 ? .5 : .1, gira: Math.sin(t * 1.2) * .35 };
  else if (L === I.night) B = ALBA ? { x: 0, z: -60 - bestiaAvance(4 + (t - Wd(8)) / SEG, 99), ry: Math.PI, paso: 4 + (t - Wd(8)) / SEG } : { ...baj(99), baja: .35, gira: Math.sin(t * .5) * .2, orejas: .6 };
  else B = { ...B, ...QUIETA };
  BX = B.x; BZ = B.z; bestiaPose(t, B);
  { const g = pisadaGolpe(t); if (L === I.one && lt < Wd(2) - T0 || L === I.shadow && lt < Wd(3) - T0 || L === I.nine && lt < Wd(4) - T0) TEMBLOR = g * .22 }
  if (L === I.shadow && lt >= Wd(3) - T0) R.toneMappingExposure *= lerp(1, .55, eIO(P(t, Wd(3), Wd(3) + .5)));
  if (L === I.stayed || L === I.trunk) R.toneMappingExposure *= .7;
  tazasSaltan(L < I.one ? 0 : L === I.one ? eOut(P(lt, Wd(2) - T0 + .1, len)) : 1);
  if (L === I.five) { const q = P(lt, Wd(2) - T0 + .05, len); salpicar(10, q); salpicar(9, cl(q * 1.2 - .15)) }
  // ---- la gente: [personaje, x, z, ry, cara, modo] con modo 0 quieto, 1 camina, 2 corre (avanza al ritmo de las piernas)
  const gente = list => list.forEach(([c, x, z, ry, f = "neutral", modo = 0, ph = 0]) => { let d = 0; if (modo === 1) d = (lt - len / 2) * 2.3; if (modo === 2) d = (lt - len / 2) * 6.4; ponerP(c, x + Math.sin(ry) * d, z + Math.cos(ry) * d, ry); setFace(c, f); if (modo === 1) andar(c, t + ph); else if (modo === 2) correrV(c, t + ph); else quieto(c, t + ph) });
  const BOCA = BOCA_W(), enCuerno = (c, cara, t0g) => { enTorre(c, BOCA, -Math.PI / 2); setFace(c, cara); if (t0g != null) gesto(c, t, t0g, "sopla", { dur: .3 }) };
  const VEC = [FOLK[4], FOLK[5], EXT[0], EXT[1], EXT[2], EXT[3], PESCADOR, FOLK[0], FOLK[1], FOLK[2], FOLK[3], QUILL, GARROW];
  switch (L) {
    case I.rule: gente([[ME, 1.4, 6, 2.5, "worried"], [FOLK[4], -5, 3, 1.2, "neutral", 1], [EXT[0], 6, 1, -1.8, "neutral", 1, .2]]); break;
    case I.cost: gente([[FOLK[5], -4, 2, .6, "neutral", 1], [EXT[1], 5, 5, -2.4, "neutral", 1, .3]]); break;
    case I.today: enCuerno(ME, "sopla", T0 - .3); break;
    case I.horn: gente([[FOLK[4], -6, 4, .8, "neutral", 1], [EXT[2], 5, 8, 3, "neutral", 1, .2], [EXT[3], -2, 16, 0, "neutral", 1, .4], [GARROW, 8, -2, -2.2, "worried"]]); attach(BASTON, GARROW, "R", [0, -.2, .1]); break;
    case I.wed: { const [x, z] = PUNTOS.boda; gente([[FOLK[0], x - .9, z, Math.PI / 2 + .2, "happy"], [FOLK[1], x + .9, z, -Math.PI / 2 - .2, "warm"], [EXT[0], x - 2.6, z + 2.4, 2.6, "happy"], [EXT[1], x + 2.4, z + 2.6, -2.5, "laugh"], [FOLK[4], x + 3.4, z - 1.2, -1.4, "happy"], [PESCADOR, x - 3.6, z - .8, 1.3, "warm"]]);
      [[FOLK[0], 0], [FOLK[1], 1]].forEach(([c, i]) => { attach(TAZA_M[i], c, "L", [0, -.15, .15]); attach(CUCHARA_M[i], c, "R", [0, -.15, .15]); gesto(c, t, T0 + .15 + i * .12 + Math.floor(Math.max(0, lt - .15) / .42) * .42, "golpea", { dur: .2 }) }); break }
    case I.babies: { const [x, z] = PUNTOS.bebe; gente([[FOLK[2], x + .2, z - 1.4, .1, "warm"], [FOLK[3], x + 2, z - .8, -.5, "happy"]]); acunar(FOLK[2], BEBE); setFace(FOLK[2], lt > Wd(6) - T0 ? "susurra" : "warm"); FOLK[2].head.rotation.x = .35 * eIO(P(lt, Wd(6) - T0 - .1, Wd(6) - T0 + .25)); CUNA_BEBE.rotation.z = Math.sin(t * 2.2) * .12; break }
    case I.school: { const [x, z] = PUNTOS.escuela; gente([[QUILL, x - 1.6, z + 2.6, -2.3, "determined"], [EXT[2], x + 2.8, z + 6, -2.6, "happy", 2], [ME6, x + 4.6, z + 7.4, -2.6, "excited", 2, .2], [PIM, x + 1.4, z + 8, -2.7, "happy", 2, .35]]); attach(BANDERA_ROJA, QUILL, "R", [0, -.15, .15]); gesto(QUILL, t, T0 - 1, "agita", { dur: .3, fin: 99 }); banderaFlamea(t); break }
    case I.roost: { const [x, z] = PUNTOS.gallos; galloPose(0, t, { x: x - .8, z: z + .6, ry: 1.2 }); galloPose(1, t, { x: x + 1, z: z - .4, ry: -2 }); gente([[FOLK[3], x + 2.6, z - 1.6, .9, lt > Wd(5) - T0 ? "happy" : "neutral"]]); if (lt > Wd(5) - T0) gesto(FOLK[3], t, Wd(5), "brazos", { dur: .3 }); break }
    case I.ridge: gente([[FOLK[4], -12, -7, -2.9, "worried"], [EXT[3], -10, -9, 2.9, "scared"], [EXT[1], -14.5, -10, -2.8, "worried"]]); break;
    case I.tall: case I.tusk: case I.sixty: break;
    case I.bee: gente([[ME6, 3.6, 13.6, -1.2, "listen"], [ME, 7, 12.4, -1.9, "warm"]]); gesto(ME6, t, T0 + .2, "escucha", { dur: .3, fin: 99 }); cabraPose(t, { x: 1.4, z: 16.4, ry: 2.2 }); break;
    case I.listen1: { const piso = lt >= Wd(3) - T0 - .06 && lt < Wd(7) - T0 - .06, cielo = lt >= Wd(7) - T0 - .06; gente([[ME6, 3.6, 13.6, .4, cielo ? "excited" : "listen"], [ME, 6.4, 12.2, -1.2, "curious"]]); if (piso) ME6.body.rotation.x = .5; if (cielo) gesto(ME6, t, Wd(7) - .1, "senala", { dur: .3, fin: 99, alto: 1 }); else gesto(ME6, t, T0 - 1, "escucha", { dur: .3, fin: 99 }); cabraPose(t, { x: 9, z: 12.4, ry: -2 }); break }
    case I.listen2: gente([[ME6, -8.4, 8, Math.PI - .25, lt > Wd(8) - T0 ? "listen" : "curious"], [ME, -6.4, 8.8, Math.PI - .4, "suspicious"]]); gesto(ME6, t, Wd(3) - .15, "senala", { dur: .4, fin: 99, alto: .6 }); break;
    case I.nobody: gente([[ME6, -8.4, 8, Math.PI + .05, "listen"], [ME, -6.8, 8.6, Math.PI + .1, "worried"], [FOLK[5], -12, 3, 1.5, "neutral", 1], [EXT[0], -2, 4.4, -1.5, "neutral", 1, .25], [EXT[2], -10, -1, 1.6, "neutral", 1, .1]]); gesto(ME6, t, T0 - 1, "escucha", { dur: .3, fin: 99 }); break;
    case I.dez: enCuerno(PIM, "sopla", T0 - 1); gente([[FOLK[4], 14, 20, .6, "panic", 2], [EXT[0], 10, 24, .8, "terrified", 2, .2], [EXT[1], 18, 16, .5, "panic", 2, .4]]); break;
    case I.note: enCuerno(PIM, "sopla", T0 - 1); break;
    case I.eleven: case I.nine: enCuerno(PIM, "terrified"); gente([[FOLK[5], -4, -30, Math.PI * 0, "panic", 2], [EXT[2], 3, -36, .1, "terrified", 2, .3]]); break;
    case I.night: if (!ALBA) { enCuerno(PIM, "horrified"); gesto(PIM, t, T0 - 1, "cubre", { dur: .3, fin: 99 }) } else gente([[PIM, -2, 6, Math.PI, "shock"], [FOLK[5], 2, 7, Math.PI, "scared"], [EXT[2], -5, 8, Math.PI - .2, "worried"]]); break;
    case I.ponds: if (lt >= Wd(6) - T0 - .06) { gente([[ME, -11.8, -22.6, 1.3, "happy"], [ME6, -10.8, -27, 1.5, "laugh"]]); saltar(ME6, t, Wd(6) + .2) } break;
    case I.sign: gente([[GARROW, 3.4, 4, Math.PI, "worried"], [FOLK[2], -3, 7, Math.PI - .3, "neutral"], [EXT[3], -6, 2, 1.4, "neutral", 1]]); attach(BASTON, GARROW, "R", [0, -.2, .1]); gesto(GARROW, t, T0 + .3, "senala", { dur: .45, fin: 99, mano: "L", alto: .8 }); break;
    case I.storm: gente([[FOLK[4], -2, 20, Math.PI, "scared", 2], [EXT[1], 2.4, 14, Math.PI, "panic", 2, .3], [FOLK[1], 0, 26, Math.PI, "terrified", 2, .15], [EXT[0], -2.6, 30, 0, "scared"]]); break;
    case I.orange: gente([[ME, -1.4, 21.4, .2, "scared"]]); gesto(ME, t, Wd(4) - .2, "alza", { dur: .4, fin: 99 }); break;
    case I.goat: { const d = lt * 5.6; ponerP(ME6, 0, -34 - d, Math.PI); setFace(ME6, "determined"); correrV(ME6, t); cabraPose(t, { x: .8, z: -39 - d * 1.05, ry: Math.PI, corre: 1 }); break }
    case I.scream: gente([[ME, 1, -27, Math.PI, "grito"]]); gesto(ME, t, T0 + .1, "grita", { dur: .25, fin: Wd(4) - .1 }); break;
    case I.forty: VEC.forEach((c, i) => { ponerP(c, -10.5 + i * 1.75 + Math.sin(i * 7) * .4, -26 + Math.cos(i * 3.3) * 1.3, Math.PI + Math.sin(i * 2.1) * .2); setFace(c, "grito"); quieto(c, t + i * .13); gesto(c, t, T0 + .05 + (i % 4) * .07, "grita", { dur: .25, fin: Wd(3) - .1 }) }); gente([[ME, 1, -29.6, Math.PI, "grito"]]); break;
    case I.louder: gente([[ME, 1, -27, lerp(Math.PI, .15, eIO(P(k, 0, .35))), "determined"]]); break;
    case I.climb: { const q = lerp(8, 86, k), i0 = Math.floor(q), a = ESCALON_W(i0), b = ESCALON_W(Math.min(91, i0 + 1)), f = q - i0; enTorre(ME, [lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f)], Math.atan2(b[0] - a[0], b[2] - a[2])); setFace(ME, "determined"); correrV(ME, t); break }
    case I.mouth: enCuerno(ME, "determined", T0 + .25); break;
    case I.blew: case I.rolling: enCuerno(ME, "sopla", T0 - 1); break;
    case I.turned: break;
    case I.one: enCuerno(ME, "sopla", T0 - 1); break;
    case I.five: enCuerno(ME, "sopla", T0 - 1); break;
    case I.shadow: enCuerno(ME, "sopla", T0 - 1); gente([[FOLK[4], -3, -2, 0, "panic", 2], [EXT[1], 2.4, -4, .2, "terrified", 2, .3], [FOLK[1], -6, 0, -.2, "panic", 2, .15], [EXT[0], -8, 3, .1, "terrified", 2, .4], [QUILL, 1, 2, 0, "panic", 2, .2]]); break;
    case I.stayed: enCuerno(ME, lt > Wd(2) - T0 ? "sopla" : "terrified", Wd(4) - .1); gente([[FOLK[4], -1.6, 22, 0, "panic", 2], [EXT[1], 1.8, 18, 0, "terrified", 2, .3], [FOLK[1], .2, 27, 0, "panic", 2, .15], [EXT[0], -2.2, 30, 0, "terrified", 2, .4], [QUILL, 2.4, 25, 0, "panic", 2, .2], [GARROW, -2.6, 15, 0, "horrified", 1]]); break;
    case I.trunk: enCuerno(ME, "terrified"); gesto(ME, t, T0 + .1, "brazos", { dur: .3, fin: 99 }); break;
    case I.face: enCuerno(ME, "horrified"); ME.g.rotation.y = lerp(-Math.PI / 2, -Math.PI * .86, eIO(P(k, 0, .4))); break;
    case I.stump: case I.same: enCuerno(ME, "shock"); ME.g.rotation.y = -Math.PI * .86; break;
    case I.built: case I.cut: enCuerno(ME, L === I.cut ? "sad" : "shock"); break;
    case I.pins: enCuerno(ME, "determined"); gesto(ME, t, T0 + .05, "tira", { dur: .3, fin: Wd(4) }); break;
    case I.caught: case I.eyes: enCuerno(ME, L === I.eyes ? "relieved" : "shock"); break;
    case I.small: case I.found: case I.followed: { const p = pieW(0), bx = p[0] + 5.4, bz = p[2] + 3.4, suelta = L === I.small ? eIO(P(lt, Wd(7) - T0 - .1, len)) : 1;
      ponerP(ME6, lerp(p[0] + 4.3, bx, suelta), lerp(p[2] + 2.2, bz, suelta), lerp(Math.atan2(-1, -.5), .5, suelta)); setFace(ME6, L === I.followed ? "warm" : L === I.found ? "hopeful" : "scared"); arenaEncima(ME6, 1); arenaEncima(CABRA, 1); cabraPose(t, { x: 0, z: 0, enBrazos: ME6 }); CABRA.position.y -= .42; CABRA.position.x += .3;
      if (L !== I.small) { const q = L === I.found ? eIO(P(lt, Wd(4) - T0 - .2, len)) : 1; ponerP(ME, lerp(bx + 9, bx + 2.3, q), lerp(bz + 8, bz + .5, q), Math.atan2(-1, -.6)); setFace(ME, L === I.followed ? "relieved" : "gasp"); if (q < 1 && L === I.found) correrV(ME, t); if (L === I.followed) gesto(ME, t, T0 - 1, "abraza", { dur: .3, fin: 99 }) } break }
    case I.back: gente([[ME, 2, -25, Math.PI, "warm"], [ME6, .4, -25.6, Math.PI, "happy"]]); arenaEncima(ME6, .8); arenaEncima(CABRA, .8); cabraPose(t, { x: -1.6, z: -24.4, ry: 2.6 }); break;
    case I.life: gente([[FOLK[4], -6, 4, .4, "hopeful"], [EXT[1], 5, 6, -.5, "relieved"], [GARROW, 3, 9, Math.PI, "relieved"], [QUILL, -3, 10, Math.PI, "warm"], [FOLK[1], 7, 11, -2.8, "hopeful"]]); attach(BASTON, GARROW, "R", [0, -.2, .1]); break;
    case I.ours: case I.listen3: case I.heard: gente([[ME, -8.6, 2.6, Math.PI + .1, L === I.heard ? "listen" : "warm"], [ME6, -10.2, 2, Math.PI + .05, L === I.ours ? "happy" : "listen"]]); arenaEncima(ME6, .6); if (L !== I.ours) gesto(ME6, t, s(I.listen3) + .05, "escucha", { dur: .3, fin: 999 }); if (L === I.heard) gesto(ME, t, T0 + .4, "escucha", { dur: .4, fin: 999 }); cabraPose(t, { x: -12, z: 3.4, ry: 2.6 }); break;
  }
  lights(LL); camara(t);
}
