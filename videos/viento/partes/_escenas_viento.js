//@@LUGAR
const LUGAR = L => "pueblo";
const PISO = (x, z) => x > 95 ? SUELO_LEJOS(x, z) : SUELO(x, z);
const ponerP = (k, x, z, ry = 0) => { k.g.visible = true; k.g.position.set(x, PISO(x, z), z); k.g.rotation.set(0, ry, 0) };
const enAire = (k, p, ry = 0) => { k.g.visible = true; k.g.position.set(p[0], p[1], p[2]); k.g.rotation.set(0, ry, 0) };

// dónde está la gente en la plaza durante la tormenta (lado sur de la torre)
const YO_T = [2.6, -3.4], TOBB_T = [1.1, -3.2];
// camino de Pip de la loma a la veleta y del narrador de la plaza a la veleta
const curva = (a, b, h, u) => { const e = eIO(cl(u)); return [lerp(a[0], b[0], e), lerp(a[1], b[1], e) + h * Math.sin(Math.PI * e), lerp(a[2], b[2], e)] };

//@@SHOTS
const G = (x, dy, z) => () => [x, SUELO(x, z) + dy, z];
const KW = (k, o) => () => add(k.g.getWorldPosition(new THREE.Vector3()).toArray(), o);
const VW = (o = [0, 0, 0]) => () => add(VELETA_W(), o);
const TW_ = (o = [0, 0, 0]) => () => add(TECHO_W(), o);
const TOR = (dx, y, dz) => [TORRE[0] + dx, y, TORRE[1] + dz];
const VP = (u, o = [0, 0, 0]) => () => add(vueloP(u), o);
const C_SEPIA = "#b08a5a", C_POLVO = "#9a9080", C_NUBE = "#e8eef4";
const VZ = VECINOS, HD = (k, o) => () => { const h = headW(k); return [h.x + o[0], h.y + o[1], h.z + o[2]] };
const SHOTS = {
  [I.rule]: [sh(0, G(-14, 1.1, 7.5), G(-11, 1.3, 7.8), G(-4, 1.5, 4), G(-3, 1.6, 4), 62), sh(4, KW(VZ[0], [-4.5, 1.4, 2.2]), KW(VZ[0], [-4, 1.3, 2.4]), KW(VZ[0], [0, 1, 0]), null, 50, { tr: "barrido" })],
  [I.cost]: [sh(0, KW(VZ[5], [-10, -2, 12]), KW(VZ[5], [-12, -3, 13]), KW(VZ[5], [0, 0, 0]), null, 46), sh(5, KW(VZ[5], [-14, -3, 16]), KW(VZ[5], [-16, -3, 18]), KW(VZ[5], [8, 0, 0]), null, 50, { lat: 2 })],
  [I.today]: [sh(0, KW(ME, [4.2, 1.8, 2.4]), KW(ME, [3.4, 1.6, 2]), KW(ME, [0, 1.2, 0]), null, 54, { tr: "barrido" })],
  [I.never]: [sh(0, [-60, 34, 50], [-40, 30, 46], [0, 4, -4], [6, 4, -6], 52, { tr: "barrido" }), sh(5, G(-20, .5, 30), G(-16, .55, 30.5), G(-6, 1.2, 26), G(-4, 1.4, 26), 64)],
  [I.sideways]: [sh(0, () => { const a = arbolCerca(-30, 30); return [a[0] - 12, SUELO(a[0], a[1]) + 3.4, a[1] + 11] }, () => { const a = arbolCerca(-30, 30); return [a[0] - 9, SUELO(a[0], a[1]) + 3.6, a[1] + 12] }, () => { const a = arbolCerca(-30, 30); return [a[0] + 2, SUELO(a[0], a[1]) + 2.4, a[1]] }, null, 52), sh(4, () => add(humoCerca(6, 4), [-5, 1.6, 7]), () => add(humoCerca(6, 4), [-3.6, 2, 7]), () => add(humoCerca(6, 4), [3, 1.2, 0]), null, 50)],
  [I.laundry]: [sh(0, () => { const p = tendCerca(-14, 14); return [p[0] - 1.6, SUELO(p[0], p[1]) + 1.4, p[1] + 4.5] }, () => { const p = tendCerca(-14, 14); return [p[0] - .6, SUELO(p[0], p[1]) + 1.5, p[1] + 4.1] }, () => { const p = tendCerca(-14, 14); return [p[0] + .4, SUELO(p[0], p[1]) + 1.9, p[1]] }, null, 54)],
  [I.chains]: [sh(0, [1, 4.6, 26], [2.4, 4.8, 25.4], [10, 2.8, 14], null, 50, { tr: "barrido" }), sh(7, () => estacaW(MI_CASA, 0, [-2.4, 1.2, 2.2]), () => estacaW(MI_CASA, 0, [-1.6, 1, 2]), () => estacaW(MI_CASA, 0, [0, 1.2, 0]), null, 54)],
  [I.iron]: [sh(0, KW(ME, [-3.2, 1, 3.6]), KW(ME, [-2.6, .9, 3.4]), KW(ME, [0, .8, 0]), null, 50), sh(4, G(-2, 1.4, 11.5), G(-1, 1.3, 11.6), KW(VZ[2], [0, .9, 0]), null, 56, { tr: "barrido" })],
  [I.babies]: [sh(0, () => [PUNTOS.bebe[0] - 3.6, SUELO(...PUNTOS.bebe) + 1.8, PUNTOS.bebe[1] + 4], () => [PUNTOS.bebe[0] - 3, SUELO(...PUNTOS.bebe) + 1.7, PUNTOS.bebe[1] + 3.4], KW(MAMA, [0, 1.3, 0]), null, 50)],
  [I.wed]: [sh(0, () => [PUNTOS.boda[0] - .6, SUELO(...PUNTOS.boda) + 2.3, PUNTOS.boda[1] + 6.8], () => [PUNTOS.boda[0] + .6, SUELO(...PUNTOS.boda) + 2.1, PUNTOS.boda[1] + 5.6], () => [PUNTOS.boda[0], SUELO(...PUNTOS.boda) + 1.6, PUNTOS.boda[1] - .6], null, 50), sh(9, () => [PUNTOS.boda[0] + 7, SUELO(...PUNTOS.boda) + 4.4, PUNTOS.boda[1] + 9], () => [PUNTOS.boda[0] + 5, SUELO(...PUNTOS.boda) + 4, PUNTOS.boda[1] + 10], () => [PUNTOS.boda[0], SUELO(...PUNTOS.boda) + 1.4, PUNTOS.boda[1] - .6], null, 52)],
  [I.lean]: [sh(0, KW(VZ[1], [1.4, 1.8, 8.4]), KW(VZ[1], [-.4, 1.8, 8.4]), KW(VZ[1], [0, 1.4, 0]), null, 50, { fijo: 1 }), sh(5, KW(VZ[1], [-9, 1.5, 4]), KW(VZ[1], [-8, 1.5, 3.8]), KW(VZ[1], [0, 1.6, 0]), null, 50)],
  [I.soup]: [sh(0, () => [PUNTOS.sopa[0] - 4.6, SUELO(...PUNTOS.sopa) + 2.4, PUNTOS.sopa[1] + 1.2], () => [PUNTOS.sopa[0] - 3.8, SUELO(...PUNTOS.sopa) + 2.2, PUNTOS.sopa[1] + .6], KW(MARTA, [0, 1.9, 0]), null, 50), sh(4, () => [PUNTOS.sopa[0] - 3.4, SUELO(...PUNTOS.sopa) + 1.6, PUNTOS.sopa[1] + 1.8], () => [PUNTOS.sopa[0] - 3, SUELO(...PUNTOS.sopa) + 1.5, PUNTOS.sopa[1] + 1.4], KW(MARTA, [0, 1.6, 0]), null, 48)],
  [I.sign]: [sh(0, G(-3, 1.6, 14), G(-1, 2.2, 11), TOR(0, 10, 0), TOR(0, 12, 0), 46), sh(7, TOR(-4, 7, 13), TOR(-2, 7.6, 12), TOR(0, 8, 0), null, 42)],
  [I.pip]: [sh(0, KW(PIP, [-2.6, 1.6, 3.4]), KW(PIP, [-1.6, 1.5, 2.8]), KW(PIP, [0, 1.3, 0]), null, 52), sh(6, KW(PIP, [3.4, 2.2, 5.2]), KW(PIP, [2.4, 2.2, 4.8]), KW(PIP, [0, 1, 0]), null, 54)],
  [I.rocks]: [sh(0, KW(PIP, [-1.6, 1.3, 2.6]), KW(PIP, [-1.3, 1.25, 2.4]), KW(PIP, [0, 1, 0]), null, 50), sh(7, KW(PIP, [2.6, 1.6, 3.6]), KW(PIP, [1.8, 1.6, 3.4]), KW(PIP, [0, 1, 0]), null, 54, { tr: "barrido" })],
  [I.kites]: [sh(0, () => [COLINA[0] - 6, SUELO(...COLINA) + 2.4, COLINA[1] + 6], () => [COLINA[0] - 4.4, SUELO(...COLINA) + 2.2, COLINA[1] + 5], () => [COLINA[0] + 1.6, SUELO(...COLINA) + 2.6, COLINA[1]], null, 54), sh(4, () => add(cometaV(t_), [-4, -1.5, 5]), null, () => cometaV(t_), null, 52, { tr: "sigue" })],
  [I.where]: [sh(0, () => [COLINA[0] + 2.4, SUELO(...COLINA) + 1.8, COLINA[1] + 2.6], () => [COLINA[0] + 2, SUELO(...COLINA) + 1.9, COLINA[1] + 2.2], KW(PIP, [0, 1.4, 0]), null, 50), sh(6, () => [COLINA[0] - 3.2, SUELO(...COLINA) + 2.4, COLINA[1] + 1.2], () => [COLINA[0] - 3.8, SUELO(...COLINA) + 2.8, COLINA[1] + 1.4], [SIERRA_X, 50, 10], null, 48, { lat: .6 })],
  [I.tobb]: [sh(0, G(-21, 2.6, -11), G(-22, 2.4, -12), KW(TOBB_CHICO, [0, .8, 0]), null, 48, { tr: "tapa", col: C_SEPIA }), sh(7, KW(TOBB_CHICO, [1.4, .8, 3.6]), KW(TOBB_CHICO, [1, .75, 3.2]), KW(TOBB_CHICO, [0, 1, .4]), null, 46)],
  [I.second]: [sh(0, KW(TOBB_CHICO, [3.2, 1, 1.4]), KW(TOBB_CHICO, [2.8, .9, 1.6]), KW(TOBB_CHICO, [0, .4, .8]), null, 46)],
  [I.leaf]: [sh(0, KW(TOBB_CHICO, [-4, 0, 10]), KW(TOBB_CHICO, [-2.4, -.4, 9]), KW(TOBB_CHICO, [0, 0, 0]), null, 54, { tr: "barrido" })],
  [I.sock]: [sh(0, G(-6, 1.4, 6), G(-5, 1.3, 6.4), KW(TOBB_CHICO, [0, 0, 0]), null, 50), sh(7, KW(TOBB_CHICO, [2.6, 1, 3]), KW(TOBB_CHICO, [2, .8, 2.6]), KW(TOBB_CHICO, [0, 0, 0]), null, 46)],
  [I.walked]: [sh(0, () => add(tobbVuelta(), [-5, 2.4, 8]), () => add(tobbVuelta(), [-4.2, 2.2, 7.4]), () => add(tobbVuelta(), [0, 1.3, 0]), null, 46, { tr: "barrido" })],
  [I.green]: [sh(0, G(-4, 2.2, 8), G(-3, 2.1, 7), KW(TOBB_CHICO, [0, 1.6, 0]), null, 54), sh(7, G(4.4, 2.4, 9), G(3.6, 2.3, 8.4), G(1.2, 1.5, 3), null, 54)],
  [I.old]: [sh(0, KW(TOBB, [-3.2, 2.2, 4.6]), KW(TOBB, [-2.6, 2.1, 4]), KW(TOBB, [0, 1.6, 0]), null, 46, { tr: "barrido" }), sh(5, KW(TOBB, [3.4, 1.4, 4.2]), KW(TOBB, [3, 1.3, 3.8]), KW(TOBB, [0, 1.2, 0]), null, 50)],
  [I.doubled]: [sh(0, [-40, 26, 40], [-30, 22, 34], [0, 4, -4], null, 52, { tr: "barrido" }), sh(3, G(-12, 1.5, 10), G(-10.6, 1.4, 9.4), G(-3, 1.4, 4.4), null, 56, { shake: .1 })],
  [I.snapped]: [sh(0, () => { const c = CASAS_ROTAS[0]; return [c[0] - 7, SUELO(c[0], c[1]) + 3.4, c[1] + 7] }, null, () => { const c = CASAS_ROTAS[0]; return [c[0] + 1.5, SUELO(c[0], c[1]) + 3, c[1]] }, null, 54, { shake: .15 }), sh(2, () => [PANAD[0] - 12, SUELO(...PANAD) + 4, PANAD[1] + 10], () => [PANAD[0] - 8, SUELO(...PANAD) + 6, PANAD[1] + 11], TW_(), null, 54)],
  [I.hill]: [sh(0, () => [COLINA[0] + 7, SUELO(...COLINA) + 3.2, COLINA[1] + 8], () => [COLINA[0] + 5, SUELO(...COLINA) + 2.8, COLINA[1] + 6.6], KW(PIP, [0, 1.8, 0]), null, 52, { tr: "barrido" }), sh(8, KW(PIP, [3.4, 1.8, 4.4]), KW(PIP, [2.8, 1.8, 4]), KW(PIP, [1.2, 2, -.4]), null, 54)],
  [I.pulled]: [sh(0, KW(PIP, [-3, 2.6, 3.4]), KW(PIP, [-2.4, 2.8, 3]), () => cometaV(t_), null, 54), sh(3, KW(PIP, [2, 1, 2.4]), KW(PIP, [1.7, .95, 2.1]), KW(PIP, [0, .7, 0]), null, 52, { tr: "barrido" })],
  [I.boots2]: [sh(0, KW(PIP, [2.6, 1, 3]), KW(PIP, [2.2, 1, 2.6]), KW(PIP, [0, .6, 0]), null, 54)],
  [I.up]: [sh(0, () => [COLINA[0] + 6, SUELO(...COLINA) + 2, COLINA[1] + 9], () => [COLINA[0] + 9, SUELO(...COLINA) + 3, COLINA[1] + 8], KW(PIP, [0, 0, 0]), null, 56)],
  [I.vane]: [sh(0, VW([-6, -1.4, 6]), VW([-4.4, -.6, 5]), VW([.6, -.6, 0]), null, 50), sh(8, TOR(-14, 4, 16), TOR(-11, 5, 14), VW([0, -2, 0]), null, 50)],
  [I.climb]: [sh(0, G(-3, .8, 5.5), G(-2.4, .75, 5.2), G(1, .4, 1), null, 56, { shake: .1 }), sh(4, G(8, 5, 6), G(6, 4, 5), G(1, .4, -1), null, 56)],
  [I.bend]: [sh(0, VW([-4.4, 1.2, 4]), VW([-3.4, 1, 3.4]), VW([.6, -.8, 0]), null, 50, { shake: .08 })],
  [I.oneway]: [sh(0, KW(ME, [-1.8, 1.1, -3.8]), KW(ME, [-1.4, 1, -3.2]), KW(ME, [0, 2, 0]), null, 46)],
  [I.laces]: [sh(0, KW(ME, [1, 1.2, 4.6]), KW(ME, [.8, 1.1, 4.2]), KW(ME, [0, 1.1, .4]), null, 46), sh(3, KW(ME, [-2.4, .8, 3]), KW(ME, [-2, .75, 2.7]), KW(ME, [0, 1, .4]), null, 46)],
  [I.dont]: [sh(0, () => add(mitad(TOBB, ME), [-.5, 2.6, 7]), () => add(mitad(TOBB, ME), [0, 2.5, 6.4]), () => add(mitad(TOBB, ME), [0, 1.2, 0]), null, 44), sh(5, KW(ME, [.2, 2.4, 4.6]), KW(ME, [.6, 2.4, 4.2]), KW(TOBB, [0, 2, 0]), null, 42)],
  [I.left]: [sh(0, KW(ME, [1, 1.2, 4.6]), KW(ME, [.8, 1.1, 4.2]), KW(ME, [0, 1, .5]), null, 46), sh(6, KW(ME, [-2.4, .8, 3]), KW(ME, [-2, .75, 2.7]), KW(ME, [0, .9, .5]), null, 46, { tr: "barrido" })],
  [I.letgo]: [sh(0, () => [YO_T[0] - 4, SUELO(...YO_T) + 1, YO_T[1] + 4.5], () => [YO_T[0] - 4.4, SUELO(...YO_T) + 1.6, YO_T[1] + 4.9], KW(ME, [0, .8, 0]), null, 56)],
  [I.flew]: [sh(0, KW(ME, [1.5, 1.6, 4.5]), KW(ME, [1.2, 1.4, 4]), KW(ME, [0, 0, 0]), null, 54, { tr: "sigue" }), sh(2, KW(ME, [-3, 2.4, 9]), KW(ME, [-1, 2.6, 9]), TW_(), null, 54)],
  [I.grab]: [sh(0, VW([-7, 1, 7]), VW([-5.4, 1.2, 6]), VW([-1, -.4, 0]), null, 52, { shake: .12 }), sh(8, VW([-4.4, 2.2, 6]), VW([-3.8, 2, 5.4]), VW([.4, -.8, 0]), null, 50)],
  [I.broke]: [sh(0, KW(ME, [5, .5, 5]), KW(ME, [4.4, .3, 4.6]), KW(ME, [0, 0, 0]), null, 48, { shake: .15 })],
  [I.over]: [sh(0, KW(ME, [-6, 3, 7]), KW(ME, [-7, 3.4, 8]), KW(ME, [0, 0, 0]), null, 50, { tr: "barrido" })],
  [I.tight]: [sh(0, KW(ME, [3.4, 1.4, 4.4]), KW(ME, [3, 1.3, 4]), KW(ME, [0, .4, 0]), null, 50)],
  [I.clouds]: [sh(0, KW(ME, [-3, 3, 5]), KW(ME, [-2.6, 2.8, 4.6]), KW(ME, [4, -12, 0]), null, 56), sh(3, KW(ME, [-6, 3, 8]), KW(ME, [-5, 2.6, 7]), KW(ME, [0, 0, 0]), null, 52)],
  [I.then]: [sh(0, KW(ME, [-3.2, 2, 3.2]), KW(ME, [-2.8, 1.8, 3]), KW(ME, [10, -10, 0]), null, 56, { tr: "barrido" })],
  [I.calm]: [sh(0, () => add(vueloP(.78), [-30, 24, 30]), () => add(vueloP(.82), [-24, 20, 26]), () => [VALLE[0], VALLE_Y, VALLE[1]], null, 52)],
  [I.straight]: [sh(0, () => valleCam(0), () => valleCam(.3), () => valleMira(0), null, 50), sh(4, () => valleCam(1), () => valleCam(1.3), () => valleMira(1), null, 50)],
  [I.fields]: [sh(0, () => add(vueloP(.9), [-6, 3, 8]), () => add(vueloP(.93), [-5, 2.6, 7]), () => add(ATERRIZA, [6, 0, -4]), null, 52), sh(2, () => add(ATERRIZA, [-14, 4, 12]), () => add(ATERRIZA, [-10, 3, 12]), () => add(ATERRIZA, [0, 0, 0]), null, 54)],
  [I.hers]: [sh(0, () => add(COMETAS_PIP, [-3.6, 2.2, 3.2]), () => add(COMETAS_PIP, [-2.6, 1.8, 2.6]), () => add(COMETAS_PIP, [0, .2, 0]), null, 50)],
  [I.landed]: [sh(0, () => add(ATERRIZA, [-7, 3, 7]), () => add(ATERRIZA, [-5.4, 2.4, 6]), () => add(ATERRIZA, [0, .8, 0]), null, 52), sh(4, () => add(ATERRIZA, [0, 7.4, .6]), () => add(ATERRIZA, [0, 6.2, .5]), () => add(ATERRIZA, [0, 0, 0]), null, 50)],
  [I.told]: [sh(0, HD(PIP, [.8, 4.2, 1.6]), HD(PIP, [.6, 3.4, 1.3]), HD(PIP, [0, 0, 0]), null, 50)],
  [I.rightall]: [sh(0, KW(ME, [-4, 3, 5]), KW(ME, [-3.4, 2.8, 4.6]), KW(ME, [1, .3, 0]), null, 46)],
  [I.life]: [sh(0, KW(ME, [-3.4, 4.4, -1.4]), KW(ME, [-3, 4.2, -1.2]), KW(ME, [.4, .4, .4]), null, 48)],
  [I.tomorrow]: [sh(0, KW(ME, [-3.6, 2.2, 3.6]), KW(ME, [-3, 2.1, 3]), KW(ME, [0, 1.9, 0]), null, 48), sh(4, KW(ME, [2, 2, 4]), KW(ME, [3.4, 2.6, 6]), KW(ME, [-1.5, 1.6, 0]), null, 52)],
};
// el vuelo de los hermanos: curva suave por VUELO_PTS (de la veleta al pasto del valle), u = 0..1
const VUELO_C = new THREE.CatmullRomCurve3(VUELO_PTS.map(q => new THREE.Vector3(...q)), false, "centripetal");
const vueloP = u => VUELO_C.getPointAt(cl(u)).toArray();
const valleCam = i => { const c = i < 1 ? CAMS_VALLE.pastoPersona : CAMS_VALLE.humoDerecho, f = i % 1; return add(c.p, [f * 6, f * .4, -f * 2]) };
const valleMira = i => (i < 1 ? CAMS_VALLE.pastoPersona : CAMS_VALLE.humoDerecho).l;
let t_ = 0;   // el tiempo del cuadro, para las cámaras que siguen algo que se mueve
const mitad = (a, b) => { const p = a.g.getWorldPosition(new THREE.Vector3()), q = b.g.getWorldPosition(new THREE.Vector3()); return [(p.x + q.x) / 2, (p.y + q.y) / 2, (p.z + q.z) / 2] };
const cerca = (list, x, z) => list.reduce((m, p) => Math.hypot(p[0] - x, p[1] - z) < Math.hypot(m[0] - x, m[1] - z) ? p : m);
const arbolCerca = (x, z) => cerca(ARBOLES, x, z);
const tendCerca = (x, z) => cerca(TENDEDEROS, x, z);
const humoCerca = (x, z) => { const h = HUMOS.map(v => [v.x, v.z, v.y]); const c = cerca(h, x, z); return [c[0], c[2], c[1]] };
const estacaW = (C, i, o) => { const a = C.anclas[i].b; const p = a.isVector3 ? a.toArray() : a; return add(p, o) };
const CASAS_ROTAS = [[15.8, -12.4], [.9, -19.5], [-5.2, 24]];

//@@ESCENA
// ---------- la escena en cada instante
const QS = new URLSearchParams(location.search), VISTA = QS.get("vista") ? QS.get("vista").split(",").map(Number) : null;
let ENV_OK = false; const FILA = QS.has("fila");
// la cometa de Pip (la nueva): vuela atada al hilo; en «kites» (la de antes) se corta y se va
const cometaV = t => { const L = lineAt(t), lt = t - s(L), b = [COLINA[0], SUELO(...COLINA), COLINA[1]];
  if (L === I.kites && lt > wt(L, 4) - s(L)) { const u = lt - (wt(L, 4) - s(L)); return [b[0] + 4 + u * 9, b[1] + 7 + u * 4, b[2] - 2 + Math.sin(u * 3) * .8] }
  const tir = L === I.pulled ? 1.6 : 1; return [b[0] + 4.2 * tir, b[1] + 6.4 + Math.sin(t * 2.3) * .5, b[2] - 1.6 + Math.sin(t * 1.7) * .6] };
// el viejo Tobb de chico volviendo a pie por la sierra (recuerdo)
const tobbVuelta = () => { const x = 60, z = -20; return [x, PISO(x, z), z] };
function setScene(t) {
  t_ = t;
  const L = lineAt(t), lt = t - s(L), len = (S[L + 1] ?? DUR) - s(L), k = P(lt, 0, len), Wd = kk => wt(L, kk), T0 = s(L), dW = kk => Wd(kk) - T0;
  POST = { flash: 0, sepia: 0 };
  if (!ENV_OK) { Object.assign(ENV, ENV_VIENTO, typeof ENV_LEJOS !== "undefined" ? ENV_LEJOS : {}); ENV_OK = true }
  mundoReset(); utileriaReset(); lejosReset(true);
  ALL.forEach(c => { if (c.polvo) c.polvo.forEach(q => q.visible = false); c.g.visible = false; c.body.rotation.set(0, 0, 0); c.body.position.y = 0; c.head.rotation.set(0, 0, 0); power(c, null, 0); c.aura.visible = false; setFace(c, "neutral"); pose(c, t, {}); quieto(c, t) });
  [PALA, REGLA, TELESC, HOYO].forEach(o => o.visible = false);
  // ---- ambiente según el tramo
  const RECUERDO = L >= I.tobb && L <= I.green, TORM = (L >= I.doubled && L <= I.over) || L === I.today, VALLE_ = L >= I.then, CUMBRE = L >= I.over && L < I.then;
  setEnv(QS.get("env") || (RECUERDO ? "recuerdo" : VALLE_ ? "valle" : CUMBRE ? "cumbre" : TORM ? "tormenta" : "ventoso")); SOL.z = 0;
  ambiente(t); sinBestia();
  lejos(t, { nubes: L === I.clouds ? (lt > dW(5) - .1 ? 0 : null) : L === I.then ? eIO(k) : null, jirones: L === I.clouds ? (lt > dW(5) ? .35 : 0) : L === I.then ? .6 : 0, nieve: 1, pajaros: VALLE_ ? 1 : 0 }); tortuga(t, { paso: 0 }); LUCES.forEach(l => l.visible = false);
  vientoFuerza(VALLE_ ? 0 : TORM ? 2 : CUMBRE ? 1.4 : 1); humoInclinacion(1);
  if (RECUERDO) POST.sepia = .55;
  TEMBLOR = 0;
  // ---- la tormenta: cadenas, techo, veleta
  cadenasRotas(L < I.snapped ? (L === I.today ? 1 : 0) : L === I.snapped ? eIO(P(lt, 0, dW(2))) : 1);
  techoPanaderia(L < I.snapped ? 0 : L === I.snapped ? (lt < dW(2) - .1 ? .05 : .1 + .7 * P(lt, dW(2) - .1, len + 1.5)) : L === I.flew ? .18 + .08 * k : 1);
  const vel = L < I.vane ? { doblez: 0 } : L <= I.climb ? { doblez: .15 } : L === I.bend ? { doblez: .15 + .3 * eIO(P(lt, dW(3), len)) } : L < I.broke ? { doblez: .45 + .05 * Math.sin(t * 9) } : L === I.broke ? { doblez: .6, rota: eOut(P(lt, dW(1), dW(2) + .1)) } : L > I.broke && L <= I.over ? { rota: 1, pos: add(VELETA_W(), [99, 0, 0]) } : {};
  if (L >= I.over && typeof VELETA_PIEZA !== "undefined") vel.rota = 1;
  veleta(t, vel);
  // ---- helpers de gente
  const vi = VALLE_ ? 0 : TORM ? 1.5 : 1;
  const parado = (k, x, z, ry, cara = "neutral", o = {}) => { ponerP(k, x, z, ry); setFace(k, cara); quietoViento(k, t, o); vientoPelo(k, vi, { t }) };
  const camina = (k, x0, z, vx, cara = "aguanta", ph = 0) => { ponerP(k, x0 + vx * lt, z, vx < 0 ? -Math.PI / 2 : Math.PI / 2); setFace(k, cara); andarViento(k, t + ph); vientoPelo(k, vi, { t }) };
  const tirado = (k, x, z, cara = "aguanta", ph = 0) => { ponerP(k, x, z, -Math.PI / 2 + Math.sin(x * 3) * .3); setFace(k, cara); aplastado(k, t + ph); vientoPelo(k, vi, { t }) };
  const bota0 = k => botas(k, { izq: 0, der: 0 });
  const V = VECINOS;
  switch (L) {
    case I.rule: camina(V[0], -2, 4, -1.1, "aguanta"); camina(V[1], 1, 4.8, -1, "neutral", .3); camina(V[2], -5, 3.6, -1.05, "aguanta", .5); camina(V[3], 3, 3.2, -1.1, "neutral", .2); parado(ME, -1, 2.4, .9, "neutral"); break;
    case I.cost: { const f = 6 + lt * 22; enAire(V[5], [f, 8 + lt * 9, -2]); volar(V[5], t, {}); bota0(V[5]); setFace(V[5], "terrified"); vientoPelo(V[5], 1.5, { t }); break }
    case I.today: ponerP(ME, YO_T[0], YO_T[1], Math.PI / 2 + .2); bota0(ME); setFace(ME, "determined"); despega(ME, t, .15 + .3 * k); vientoPelo(ME, 1.5, { t }); botaEnPiso(botaSuelta(ME, "izq"), YO_T[0] - .8, YO_T[1] + .8, { ry: .6, volcada: 1 }); botaEnPiso(botaSuelta(ME, "der"), YO_T[0] - .4, YO_T[1] + 1.3, { ry: -.4 }); break;
    case I.never: case I.sideways: case I.laundry: camina(V[4], -4, 26, -1, "neutral"); break;
    case I.chains: parado(V[6], CASA_MIA[0] - 4.4, CASA_MIA[1] + 3, -1.2, "neutral"); break;
    case I.iron: parado(ME, -1, 5, .6, "neutral"); camina(V[0], 1, 2.6, -1.2, "aguanta"); camina(V[2], 3, 3, -1.1, "neutral", .4); camina(V[7], -1, 1.8, -1.1, "aguanta", .2); break;
    case I.babies: parado(MAMA, PUNTOS.bebe[0], PUNTOS.bebe[1], -.6, "warm"); acunar(MAMA); break;
    case I.wed: { const [x, z] = PUNTOS.boda, y = SUELO(x, z); parado(NOVIA, x - .7, z, Math.PI * .15, "happy", { lean: .2 }); parado(NOVIO, x + .7, z, -Math.PI * .15, "happy", { lean: .2 }); sogaNovios(NOVIA, NOVIO, t, { viento: 1 });
      parado(V[1], x - 3.2, z + 1.4, Math.PI * .7, "happy"); parado(V[3], x + 3, z + 1.6, -Math.PI * .7, "laugh"); parado(V[8], x + 2.2, z - .6, -Math.PI * .5, "warm"); break }
    case I.lean: [[V[0], 0, 6.6], [V[1], 2.4, 7], [V[2], 4.6, 6.2], [ME, 1.2, 5.6], [V[3], 6.4, 6.8], [V[7], 3.4, 5.2]].forEach(([c, x, z], i) => camina(c, x, z, -1.6, i % 2 ? "aguanta" : "neutral", i * .27)); break;
    case I.soup: { const [x, z] = PUNTOS.sopa; parado(MARTA, x + 1.1, z, -Math.PI / 2, "happy", { lean: .15 }); MARTA.armR.rotation.set(-.85, 0, .1); enMano(TAZA_TAPA, MARTA, "R", { off: [0, -.06, .14] }); parado(V[9], x - 1.3, z - 1.4, Math.PI / 2 - .4, "neutral"); break }
    case I.sign: camina(V[2], 3, 3, -1, "neutral"); parado(TOBB, -2, 2.2, Math.PI, "worried"); attach(BASTON, TOBB, "R", [0, -.2, .1]); break;
    case I.pip: parado(PIP, -3, 8, .5, lt > dW(8) ? "happy" : "neutral"); bambolea(PIP, t, 1); parado(ME, -1.6, 7.4, -.4, "warm"); break;
    case I.rocks: parado(PIP, -3, 8, .5, lt > dW(7) ? "scared" : "happy"); bambolea(PIP, t, lt > dW(7) ? 2 : 1); break;
    case I.kites: case I.where: { const b = COLINA; parado(PIP, b[0], b[1], L === I.where ? Math.PI / 2 + .3 : .9, L === I.where ? "wow" : lt > dW(4) ? "sad" : "happy"); bambolea(PIP, t, 1);
      if (L === I.kites) { if (lt <= dW(4)) sostieneCometa(PIP, t, { cometa: cometaV(t) }); else cometaPip(t, cometaV(t), {}) } break }
    case I.tobb: case I.second: { const x = -24, z = -19; ponerP(TOBB_CHICO, x, z, .4); sentadoDesata(TOBB_CHICO, t, { lado: "der" }); setFace(TOBB_CHICO, "happy"); vientoPelo(TOBB_CHICO, 1, { t });
      if (L === I.second) { botas(TOBB_CHICO, { izq: 0, der: 0, descalzo: 1 }); botaEnPiso(botaSuelta(TOBB_CHICO, "izq"), x + .9, z + .4, { ry: .5 }); botaEnPiso(botaSuelta(TOBB_CHICO, "der"), x + 1.3, z - .2, { ry: -.3, volcada: 1 }); enMano(MEDIA_TOBB, TOBB_CHICO, "R", { off: [0, -.1, .1], viento: 1 }); TOBB_CHICO.armR.rotation.set(-1.4, 0, .3) }
      else if (lt > dW(10)) { botas(TOBB_CHICO, { izq: 0, der: 1 }); botaEnPiso(botaSuelta(TOBB_CHICO, "izq"), x + .9, z + .4, { ry: .5 }) } break }
    case I.leaf: { const x = -24, z = -19, q = eIO(P(lt, 0, len)); if (q < .3) { ponerP(TOBB_CHICO, x, z, .4); despega(TOBB_CHICO, t, q / .3) } else { enAire(TOBB_CHICO, [x + (q - .3) * 14, SUELO(x, z) + 1.4 + (q - .3) * 9, z]); volar(TOBB_CHICO, t, {}) }
      botas(TOBB_CHICO, { izq: 0, der: 0, descalzo: 1 }); setFace(TOBB_CHICO, "terrified"); enMano(MEDIA_TOBB, TOBB_CHICO, "R", { off: [0, -.1, .1], viento: 1 }); vientoPelo(TOBB_CHICO, 1.5, { t }); botaEnPiso(botaSuelta(TOBB_CHICO, "izq"), x + .9, z + .4, { ry: .5 }); botaEnPiso(botaSuelta(TOBB_CHICO, "der"), x + 1.3, z - .2, { ry: -.3, volcada: 1 }); break }
    case I.sock: { [[V[0], -3.4, 5.2], [V[3], -4.6, 4.6], [V[8], -2.6, 4.4]].forEach(([c, x, z]) => parado(c, x, z, Math.PI / 2 - .3, "shock")); const p = vueloP(.2 + .25 * k); enAire(TOBB_CHICO, [p[0], p[1] + 10, p[2] + 20]); volar(TOBB_CHICO, t, {}); botas(TOBB_CHICO, { izq: 0, der: 0, descalzo: 1 }); setFace(TOBB_CHICO, lt > dW(7) ? "scared" : "terrified"); enMano(MEDIA_TOBB, TOBB_CHICO, "R", { off: [0, -.1, .1], viento: 1.5 }); vientoPelo(TOBB_CHICO, 1.5, { t }); break }
    case I.walked: { const p = tobbVuelta(); ponerP(TOBB_CHICO, p[0] - lt * .9, p[2], -Math.PI / 2); andarViento(TOBB_CHICO, t); botas(TOBB_CHICO, { izq: 0, der: 0, descalzo: 1 }); setFace(TOBB_CHICO, "determined"); vientoPelo(TOBB_CHICO, 1, { t }); break }
    case I.green: parado(TOBB_CHICO, 0, 4.4, Math.PI * .9, "happy"); gesto(TOBB_CHICO, t, T0 + .2, "brazos", { dur: .3, fin: dW(7) + T0 });
      [[V[0], -2, 1.6, .5], [V[1], 1.6, 1.2, -.3], [V[3], 3.2, 2.6, -.9], [V[7], -3.4, 3, 1]].forEach(([c, x, z, ry]) => { parado(c, x, z, ry, lt > dW(7) ? "laugh" : "suspicious") }); break;
    case I.old: parado(TOBB, -3, 6, .3, "worried"); attach(BASTON, TOBB, "R", [0, -.2, .1]); break;
    case I.doubled: [[V[0], -5, 4.4], [V[2], -2.4, 6], [V[3], 1, 4.8]].forEach(([c, x, z], i) => { parado(c, x, z, -1.4, "aguanta", { brazos: "cubre" }) }); tirado(V[7], 0, 7.4, "terrified"); break;
    case I.snapped: break;
    case I.hill: case I.pulled: case I.boots2: { const b = COLINA; parado(PIP, b[0], b[1], .9, L === I.hill ? "happy" : L === I.pulled ? "scared" : "terrified"); bambolea(PIP, t, 2); sostieneCometa(PIP, t, { cometa: cometaV(t), tiron: L === I.hill ? .5 : 1.5 });
      if (L === I.boots2) { botas(PIP, { izq: lt > dW(1) ? 0 : 1, der: lt > dW(5) ? 0 : 1 }); if (lt > dW(1)) botaEnPiso(botaSuelta(PIP, "izq"), b[0] + .8 + 2 * P(lt, dW(1), dW(1) + .4), b[1] + .3, { ry: .4 + lt * 3, volcada: 1 }); if (lt > dW(5)) botaEnPiso(botaSuelta(PIP, "der"), b[0] + .6 + 1.5 * P(lt, dW(5), dW(5) + .4), b[1] - .4, { ry: -.6 + lt * 2, volcada: 1 }); despega(PIP, t, .2 * P(lt, dW(5), len)) }
      break }
    case I.up: { const a = [COLINA[0], SUELO(...COLINA) + 1, COLINA[1]], q = eIO(k); enAire(PIP, curva(a, add(VELETA_W(), [-3, -1, 2]), 6, q * .7)); volar(PIP, t, {}); bota0(PIP); setFace(PIP, "terrified"); vientoPelo(PIP, 1.5, { t }); break }
    case I.vane: case I.climb: case I.bend: case I.oneway: case I.laces: case I.dont: case I.left: case I.letgo: case I.flew: case I.grab: {
      const pv = VELETA_W(); enAire(PIP, pv); colgado(PIP, t, { fuerza: L >= I.bend ? 1.5 : 1 }); bota0(PIP); setFace(PIP, L === I.vane ? "terrified" : "scared"); vientoPelo(PIP, 1.5, { t });
      if (L >= I.climb && L <= I.oneway) { [[V[0], -4, 1], [V[2], -1.4, 2.6], [V[3], 4.6, 1.4], [V[7], -6, -1.2], [V[1], 6.6, 3.2], [TOBB, TOBB_T[0] - 1, TOBB_T[1] + 1.6]].forEach(([c, x, z], i) => tirado(c, x, z, i % 2 ? "terrified" : "aguanta", i * .3)); if (L === I.oneway) parado(ME, YO_T[0], YO_T[1], Math.PI - .2, "determined", { lean: .5 }); else tirado(ME, YO_T[0], YO_T[1], "aguanta") }
      if (L >= I.laces && L <= I.left) { [[V[0], -4, 1], [V[2], -1.4, 2.6], [V[3], 4.6, 1.4], [V[7], -6.4, 3.4]].forEach(([c, x, z], i) => tirado(c, x, z, "aguanta", i * .3));
        ponerP(ME, YO_T[0], YO_T[1], -.3); vientoPelo(ME, 1.5, { t });
        if (L === I.laces) { sentadoDesata(ME, t, { lado: lt > dW(3) ? "der" : "izq" }); ME.head.rotation.x -= .45; setFace(ME, "determined") }
        else if (L === I.dont) { sentadoDesata(ME, t, { lado: "der" }); setFace(ME, lt > dW(5) ? "sad" : "shock"); ponerP(TOBB, TOBB_T[0], TOBB_T[1], Math.PI / 2 - .2); quietoViento(TOBB, t, { lean: .5 }); agarraBrazo(TOBB, ME, t, { mano: "R", de: "L" }); setFace(TOBB, lt > dW(5) ? "terrified" : "worried"); vientoPelo(TOBB, 1.5, { t }) }
        else { ME.head.rotation.x -= .4; const q1 = P(lt, dW(1), dW(5) + .1), q2 = P(lt, dW(6), len); if (q1 < 1) sacaBota(ME, t, "izq", q1); else { botas(ME, { izq: 0, der: 1 }); botaEnPiso(botaSuelta(ME, "izq"), YO_T[0] - .9, YO_T[1] + .9, { ry: .6, volcada: 1 }); sacaBota(ME, t, "der", q2) } setFace(ME, "esfuerzo") } }
      if (L === I.letgo) { ponerP(ME, YO_T[0], YO_T[1], Math.PI / 2); bota0(ME); despega(ME, t, eIO(P(lt, dW(2), len))); setFace(ME, "shock"); vientoPelo(ME, 1.5, { t });
        [[V[0], -4, 1], [V[2], -1.4, 2.6], [TOBB, TOBB_T[0] - .8, TOBB_T[1] + 1.4]].forEach(([c, x, z], i) => tirado(c, x, z, "terrified", i * .3)) }
      if (L === I.letgo || L === I.left || L === I.flew || L === I.grab) { botaEnPiso(botaSuelta(ME, "izq"), YO_T[0] - .9, YO_T[1] + .9, { ry: .6, volcada: 1 }); if (L !== I.left) botaEnPiso(botaSuelta(ME, "der"), YO_T[0] - .3, YO_T[1] + 1.4, { ry: -.4 }) }
      if (L === I.flew) { const a = [YO_T[0], SUELO(...YO_T) + 2.4, YO_T[1]], q = eIO(k); enAire(ME, curva(a, add(pv, [-2.6, -.6, 1.6]), 4, q * .85)); volarHacia(ME, t, { objetivo: new THREE.Vector3(...pv) }); bota0(ME); setFace(ME, "determined"); vientoPelo(ME, 1.5, { t }) }
      if (L === I.grab) { if (lt < dW(8)) { const q = eIO(P(lt, 0, dW(3))); enAire(ME, curva(add(pv, [-2.6, -.6, 1.6]), add(pv, [-.6, -.4, .4]), .3, q)); volarHacia(ME, t, { objetivo: new THREE.Vector3(...pv) }); bota0(ME); setFace(ME, lt > dW(4) ? "esfuerzo" : "determined"); vientoPelo(ME, 1.5, { t }); if (lt > dW(1)) TEMBLOR = .06 * (1 - P(lt, dW(1), dW(1) + .4)) }
        else { PIP.g.visible = false; abrazoVuelo(ME, PIP, t, { pos: add(pv, [.4, -.9, 0]), ry: .3 + Math.PI, dir: [1, .1, 0] }); bota0(ME); bota0(PIP); setFace(ME, "esfuerzo"); setFace(PIP, "relieved") } }
      break }
    case I.broke: { const pv = VELETA_W(), u = P(lt, dW(2), len); abrazoVuelo(ME, PIP, t, { pos: add(pv, [.4 + u * 3, -.9 + u * .6, 0]), ry: .3 + Math.PI, dir: [1, .1, 0] }); bota0(ME); bota0(PIP); setFace(ME, "shock"); setFace(PIP, "terrified"); break }
    case I.over: case I.tight: case I.clouds: case I.then: case I.calm: { const u = L === I.over ? .02 + .1 * k : L === I.tight ? .13 + .08 * k : L === I.clouds ? .28 + .3 * k : L === I.then ? .62 + .1 * k : .75 + .1 * k;
      if (L === I.tight) { const p = vueloP(u); enAire(ME, p); volar(ME, t, {}); enAire(PIP, add(p, [.5, .5, -.9])); volar(PIP, t + .7, { rollo: .3 }); vientoPelo(ME, 1.5, { t }); vientoPelo(PIP, 1.5, { t }) } else abrazoVuelo(ME, PIP, t, { pos: vueloP(u), ry: .3 + Math.PI, dir: [1, -.1, 0] }); bota0(ME); bota0(PIP); setFace(ME, L === I.tight ? "worried" : L >= I.then ? "wow" : "scared"); setFace(PIP, L >= I.then ? "wow" : "scared");
      break }
    case I.straight: break;
    case I.fields: { const u = .88 + .1 * k; abrazoVuelo(ME, PIP, t, { pos: vueloP(u), ry: .3 + Math.PI, dir: [1, -.3, 0] }); bota0(ME); bota0(PIP); setFace(ME, "wow"); setFace(PIP, "happy"); break }
    case I.hers: break;
    case I.landed: case I.told: case I.rightall: case I.life: { const a = ATERRIZA;
      if (L === I.landed && lt < dW(1) + .2) { const q = P(lt, 0, dW(1) + .2); abrazoVuelo(ME, PIP, t, { pos: add(a, [-6 * (1 - q), 2.5 * (1 - q) + .6, 0]), ry: .3 + Math.PI, dir: [1, -.4, 0] }) }
      else { ponerP(ME, a[0] - .9, a[2], Math.PI / 2 + .3); acostadoEspaldas(ME, t, { sentar: L === I.life ? eIO(P(lt, dW(3), len)) * .8 : 0 }); setFace(ME, L === I.told ? "laugh" : L === I.rightall ? "wow" : L === I.life ? "relieved" : "shock");
        ponerP(PIP, a[0] + 1, a[2] + .6, Math.PI / 2 - .2); acostadoEspaldas(PIP, t); setFace(PIP, L === I.told ? "laugh" : "happy") }
      bota0(ME); bota0(PIP); vientoPelo(ME, 0, { t }); vientoPelo(PIP, 0, { t }); break }
    case I.tomorrow: { const a = ATERRIZA; ponerP(ME, a[0] - .6, a[2] + .4, -Math.PI / 2 + .25); quieto(ME, t); setFace(ME, "determined"); bota0(ME); ponerP(PIP, a[0] + .2, a[2] + .9, -Math.PI / 2 + .1); quieto(PIP, t); setFace(PIP, "happy"); bota0(PIP); vientoPelo(ME, 0, { t }); vientoPelo(PIP, 0, { t }); break }
  }
  if (FILA) { ALL.forEach(c => c.g.visible = false); [ME, PIP, TOBB, TOBB_CHICO, MARTA, NOVIA, NOVIO, MAMA].forEach((c, i) => { ponerP(c, -8 + i * 2.3, 3, 0); quietoViento(c, t) }); cam.position.set(0, 3.2, 20); cam.lookAt(0, 1.4, 2); cam.fov = 44; cam.updateProjectionMatrix(); lights([]); return }
  if (VISTA) { cam.position.set(VISTA[0], VISTA[1], VISTA[2]); cam.lookAt(VISTA[3], VISTA[4], VISTA[5]); cam.fov = VISTA[6] || 50; cam.updateProjectionMatrix(); lights([]); POST.tapa = null; return }
  lights([]); camara(t);
}
