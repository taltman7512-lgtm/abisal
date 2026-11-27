// ================= «NOBODY ANSWERS THE KNOCK»: lo común (el MAPA de Hollowmere) — lo usan el pueblo, la Tejedora, el elenco y las escenas =================
// Norte = −z, este = +x. Unidades: metros (los personajes de bloques miden ≈ 2; la Tejedora ≈ 22).
// Hollowmere: pueblo de madera y piedra en un valle con bosque de pinos y montes alrededor, de noche, con niebla baja.
// La CALLE PRINCIPAL («Hollow Lane») corre de sur a norte por x = 0 (empedrada, 10 m de ancho; las fachadas en x = ±6,5) y desemboca
// en la PLAZA de la iglesia (al norte). Una calle transversal (z = −20) va al este, hacia el sendero de LA COLINA (el poste de los abrigos).
// Ningún cable ni soga cruza la calle principal ni la plaza (la Tejedora camina por ahí).
const sstH = (a, b, v) => { const q = Math.max(0, Math.min(1, (v - a) / (b - a))); return q * q * (3 - 2 * q) };
const CALLE_T = { x: 0, an: 10, fachada: 6.5, z0: -41, z1: 80 };        // calle principal: empedrado |x| < 5; veredas hasta las fachadas |x| = 6,5
const CRUCE_T = { z: -20, an: 6, x0: -46, x1: 66 };                      // calle transversal (z −23 … −17); al este sigue el sendero a la colina
const PLAZA_T = { x: 0, z: -56, w: 40, d: 30 };                          // plaza de la iglesia: x −20 … 20, z −41 … −71 (la boda va acá)
const IGLESIA_T = { x: 0, z: -88, w: 11, d: 26, frente: -75, alto: 5.6 }; // nave de piedra (x −5,5 … 5,5; z −75 … −101); se entra por la torre, desde la plaza
const TORRE_T = { x: 0, z: -73.6, lado: 5.4, alto: 14.0, punta: 21.0 }; // campanario (al frente de la nave, puerta al sur); la aguja llega a 21 m (< Tejedora)
const CAMPANA_T = [0, 12.7, -73.6];                                      // la campana de la iglesia (centro de giro: el yugo); la cuerda baja al piso de la torre
const ARCO_BODA = [0, -59];                                              // el arco de flores de la boda (en la plaza, frente a la iglesia; la pareja mira al norte)
const CASA_CRANE = { x: 16.8, z: -80, w: 9, d: 10, ry: 0 };             // la casa de Father Crane: junto a la iglesia (al este), su puerta mira al sur (z = −75)
const CASA_FAM = { x: -10.5, z: 14, w: 7, d: 8, ry: Math.PI / 2 };       // la casa del narrador y Tib: lado oeste de la calle, la puerta mira al este (x = −6,5)
const TALLER_T = { x: 11, z: 1, w: 9, d: 9, ry: -Math.PI / 2 };          // el taller del sastre: lado este, la vidriera y la puerta miran al oeste (x = 6,5)
const CASA_MARGA = { x: -10, z: -31, w: 6.2, d: 7, ry: Math.PI / 2 };    // la casa de Marga (vieja, torcida): lado oeste, cerca de la plaza
const COLINA_T = [86, -30], COLINA_H = 20;                               // la colina al este del pueblo; cima redonda a 20 m; el poste-percha en la cima
const CAIDA_ROJO = [-2.2, 15.5];                                         // donde cae el abrigo rojo: en la calle, frente a la casa de la familia
// altura del piso: el pueblo plano (≈ 0), afuera sube de a poco al bosque, la colina al este y los montes lejos (r > 260)
const ALT_T = (x, z) => {
  const dc = Math.hypot((x - COLINA_T[0]) / 36, (z - COLINA_T[1]) / 31), colina = (COLINA_H - 3.5) * (1 - sstH(0, 1, dc)) + 3.5 * (1 - sstH(.6, 1.7, dc));
  const r = Math.hypot(x * .92, (z + 12) * 1.05), a = Math.atan2(z + 12, x);
  const afuera = sstH(62, 170, r) * (7 + 3 * Math.sin(a * 3 + 1.2) + 2 * Math.sin(a * 7 + .4));
  const montes = sstH(240, 620, r) * (150 + 70 * Math.sin(a * 3 + .6) + 35 * Math.sin(a * 8 + 2.1) + 18 * Math.sin(a * 17 + r * .01));
  const ond = (.35 * Math.sin(x * .07 + 1) * Math.sin(z * .055) + .2 * Math.sin(x * .19 - z * .13)) * sstH(48, 80, r);
  return Math.max(colina, afuera) + montes + ond };
// los climas de luz (los define _detalle_tej.js en ENV_HOLLOW y ya están cargados en ENV): "noche" (la principal), "nocheNiebla",
// "interior" (velas), "amanecer" (la mañana final), "tejedora" (sombrío, frío, niebla espesa cerca de la criatura)

// ---------- ayudantes generales (los usa también el elenco)
const ALT = (x, z) => ALT_T(x, z);
const placeW = (k, x, z, ry = 0) => { k.g.visible = true; k.g.position.set(x, ALT_T(x, z), z); k.g.rotation.set(0, ry, 0) };
const mergeG = list => { const gs = list.map(([g, m]) => { const q = g.index ? g.toNonIndexed() : g.clone(); q.applyMatrix4(m); return q }); const n = gs.reduce((a, q) => a + q.attributes.position.count, 0);
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2); let o = 0; gs.forEach(q => { if (!q.attributes.normal) q.computeVertexNormals(); pos.set(q.attributes.position.array, o * 3); nor.set(q.attributes.normal.array, o * 3); if (q.attributes.uv) uv.set(q.attributes.uv.array, o * 2); o += q.attributes.position.count });
  const G = new THREE.BufferGeometry(); G.setAttribute("position", new THREE.BufferAttribute(pos, 3)); G.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); G.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); return G };
const MZ = (p, dir, s) => new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize()), s);
