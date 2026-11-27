// ================= «NOBODY HEARS THE BELL»: lo común (medidas del mundo) — lo usan la ciudad, la campana, el elenco y las escenas =================
// Norte = −z. Underbell es una ciudad de piedra en terrazas, en un valle rodeado de cuatro montañas. Sobre la ciudad cuelga una
// campana de bronce más ancha que la ciudad, de cuatro cadenas (una a cada montaña). La cadena del ESTE baja hasta un risco al
// borde de la ciudad: ahí está «el primer eslabón», al que se llega por una escalera tallada (Nell sube ahí al final).
const sstB = (a, b, v) => { const q = Math.max(0, Math.min(1, (v - a) / (b - a))); return q * q * (3 - 2 * q) };
const PLAZA_B = [0, 0];                                         // la plaza con la FUENTE (tallado: «PLUG YOUR EARS. REMEMBER.»)
const TIENDA = [0, -22];                                        // la tienda de cera de Mister Sallow: bajo el centro de la campana, siempre en sombra
const CASA_NELL = [16, 12];                                     // la casa del narrador y Nell
const RISCO_E = [118, 6];                                       // el risco del este, borde de la ciudad, con la escalera al primer eslabón
const CAMPANA_C = [0, -10];                                     // centro de la campana en planta
const CAMPANA_Y = 150;                                          // altura del BORDE de abajo (labio) de la campana
const CAMPANA_R = 95;                                           // radio del labio (≈ más ancha que la ciudad, que mide ≈ 160)
const CAMPANA_H = 150;                                          // alto de la campana (del labio a la corona)
const CORONA = [CAMPANA_C[0], CAMPANA_Y + CAMPANA_H, CAMPANA_C[1]];   // donde se enganchan las cuatro cadenas
// las cuatro montañas (cimas) y la cadena que va a cada una; la del este baja al risco y SE TREPA
const MONTES = { norte: [0, 260, -520], sur: [0, 240, 520], oeste: [-520, 250, 0], este: [RISCO_E[0], 34, RISCO_E[1]] };
// altura del piso: valle de la ciudad en terrazas (sube hacia afuera), montañas a lo lejos, risco del este
const ALT_B = (x, z) => { const r = Math.hypot(x, z); const terr = Math.floor(sstB(20, 110, r) * 5) * 3.2 + sstB(20, 110, r) * 1.5;
  const risco = 30 * Math.exp(-(((x - RISCO_E[0]) / 22) ** 2 + ((z - RISCO_E[1]) / 30) ** 2));
  const montes = 230 * sstB(220, 520, r) * (.75 + .25 * Math.sin(Math.atan2(z, x) * 4 + 1)); return terr + Math.max(risco, 0) + montes };
// climas de luz del video (el agente de la ciudad los define; los usa todo el mundo): "mediodia" (sombra de la campana
// cruzando la ciudad), "atardecer" (campana de cobre brillante), "noche" (luna + miles de velas), "sallow" (sombrío: frío,
// niebla baja, velas que tiemblan), "dentro" (adentro de la campana: oscuro, un rayo de luna por la corona)

// ================= «WE HOLD UP THE SKY»: lo común (medidas del mundo) — lo usan el pueblo, el cielo, el elenco y las escenas =================
// Norte = −z. El cielo es una TAPA de tablones pintada de celeste (con nubes y un sol blanco pintados) que tapa el mundo entero; cada
// calle la sostiene con UN poste gigante con un gato de rosca y una manivela abajo. Sobre la tapa hay campos de trigo al sol de verdad.
// La tapa está baja sobre las calles pobres (sur, z > −20) y sube hacia la Loma (norte), donde vive Kell y el cielo está altísimo.
const sst_ = (a, b, v) => { const q = Math.max(0, Math.min(1, (v - a) / (b - a))); return q * q * (3 - 2 * q) };
const CALLE_MIA = { z: 0, x0: -34, x1: 34 };                    // nuestra calle («Crank Row»), a lo largo de x
const POSTE_MIO = [0, 0];                                       // EL poste de nuestra calle, en la plazoleta, con la casilla de la manivela al lado
const CASA_YO = [-9, 6];                                          // la casa del narrador (frente a la calle, lado sur)
const TANNER = { z: 26, x0: -30, x1: 30 };                      // Tanner Street: la calle aplastada (en el recuerdo cae la tapa sobre ella)
const POSTE_NUEVE = [-8, 26];                                   // donde estaba Pole Nine (después aparece en la Loma)
const LOMA = [0, -95], LOMA_H = 9;                               // la Loma de Kell: mansiones, muchos postes dorados, barriletes
const POSTE_NUEVE_LOMA = [10, -84];                             // Pole Nine ya plantado en la Loma
const CIELO_Y0 = 12.2;                                          // «forty feet up»: altura de la tapa sobre nuestra calle (cara de abajo)
const LID_T = 1.3;                                              // espesor de la tapa (vigas + tablones); arriba va 0,4 de tierra y el trigo
// cara de ABAJO de la tapa en (x, z), sin hundimiento: baja (12,2) en el sur, sube hacia la Loma hasta ≈ 36
const CIELO = (x, z) => CIELO_Y0 + 24 * sst_(-25, -110, z) + 1.2 * sst_(30, 90, z) + .25 * Math.sin(x * .05) * Math.sin(z * .04);
// panel de la tapa que se hunde sobre nuestra calle (y que al final cae entero con el campo de arriba)
const PANEL_MIO = { x0: -26, x1: 26, z0: -10, z1: 11 };
const AGUJERO = [1.4, .2];                                      // donde el narrador corta el agujero, junto a la punta de nuestro poste
const SOL_PINTADO = [18, -46];                                  // el sol pintado (círculo blanco) en la cara de abajo de la tapa
const ESCALERA_KELL = [6, -80];                                 // la escalera de Kell sube de la Loma por una trampa hasta arriba de la tapa
// altura del piso: pueblo plano y la Loma que sube al norte
const ALT_C = (x, z) => LOMA_H * sst_(-35, -100, z) * (1 - .25 * sst_(40, 90, Math.abs(x))) + .15 * Math.sin(x * .13) * Math.sin(z * .11);
// las calles: una fila de casas a cada lado y un poste por calle (z de la calle, x del poste)
const CALLES = [{ z: -52, poste: 14 }, { z: -26, poste: -12 }, { z: 0, poste: 0 }, { z: 26, poste: -8, aplastada: true }, { z: 52, poste: 6 }];

// ---------- LEGADO de Gusthollow (el pueblo del viento: solo para que lo viejo siga armando mientras se reemplaza; BORRAR al integrar)
const VDIR = [1, 0, 0];                                         // hacia dónde sopla el viento (todo se inclina/flamea hacia acá)
const PLAZA = [0, 0], TORRE = [0, -10], TORRE_H = 14;           // torre de piedra de 14 de alto, cuadrada; arriba la VELETA
const VELETA_Y = TORRE_H + 2.2;                                 // altura del eje de la veleta (Pip se cuelga de ahí)
const COLINA = [-26, 18], COLINA_H = 7;                          // la loma pelada al oeste de la torre, donde Pip remonta la cometa
const CASA_MIA = [10, 14];                                      // la casa del narrador y Pip
const PANAD = [-12, -3];                                        // la panadería (su techo sale volando hacia +x)
const SIERRA_X = 150, SIERRA_H = 70;                            // la cordillera del este: cresta en x ≈ 150, picos de ≈ 70 con nieve arriba de 45
const VALLE = [520, 0], VALLE_Y = 2;                            // el valle verde sin viento (centro), del otro lado; plano a la altura 2
// altura del piso: valle de pasto ralo casi plano en el pueblo, la loma de Pip, sierras bajas al norte/sur/oeste y la cordillera al este;
// después de la cordillera baja al valle verde (plano)
const ALT = (x, z) => {
  const sst = (a, b, v) => { const q = cl((v - a) / (b - a)); return q * q * (3 - 2 * q) };
  const loma = COLINA_H * Math.exp(-(((x - COLINA[0]) / 13) ** 2 + ((z - COLINA[1]) / 11) ** 2));
  // las lomas y los montes que rodean el valle (norte, sur y oeste): una loma pareja hasta r ≈ 140 y después montes con picos (se apagan hacia el este)
  const r = Math.hypot(x * .8, z), an = Math.atan2(z, x * .8), montes = sst(115, 235, r) * (40 + 22 * Math.sin(an * 5 + 1.3) + 13 * Math.sin(an * 11 + .4) + 8 * Math.sin(an * 23 + r * .03)) * (.72 + .28 * Math.sin(r * .043 + an * 3));
  const anillo = (34 * sst(70, 140, r) * (1 + .12 * Math.sin(an * 7 + 2)) + montes) * (1 - sst(150, 260, x));
  const sierra = SIERRA_H * Math.exp(-(((x - SIERRA_X) / 38) ** 2)) * (.75 + .25 * Math.sin(z * .021 + 1.3));
  const valle = VALLE_Y * sst(220, 330, x);
  return loma + anillo + sierra * (1 - sst(240, 330, x) * 0) + valle;
};
const placeW = (k, x, z, ry = 0) => { k.g.visible = true; k.g.position.set(x, ALT(x, z), z); k.g.rotation.set(0, ry, 0) };
const mergeG = list => { const gs = list.map(([g, m]) => { const q = g.index ? g.toNonIndexed() : g.clone(); q.applyMatrix4(m); return q }); const n = gs.reduce((a, q) => a + q.attributes.position.count, 0);
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2); let o = 0; gs.forEach(q => { pos.set(q.attributes.position.array, o * 3); nor.set(q.attributes.normal.array, o * 3); if (q.attributes.uv) uv.set(q.attributes.uv.array, o * 2); o += q.attributes.position.count });
  const G = new THREE.BufferGeometry(); G.setAttribute("position", new THREE.BufferAttribute(pos, 3)); G.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); G.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); return G };
const MZ = (p, dir, s) => new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize()), s);


// ---------- LEGADO de Dustmere (solo para que lo viejo siga armando mientras se reemplaza; BORRAR cuando nadie lo use)
const CRESTA = [0, -160], CRESTA_H = 24;                        // donde está parado Onetusk hace 60 años (sobre la cresta, a 24 de alto)
const COLMILLO_L = 20;                                          // largo del colmillo y del cuerno (el mismo: «long as three houses»)
const ESTANQUES = Array.from({ length: 11 }, (_, i) => [(i % 2 ? 1 : -1) * 6, lerp(-146, -24, i / 10)]);
// ---------- el colmillo: la MISMA curva, las mismas grietas y el mismo blanco para el cuerno de la torre y el de Onetusk
const COLMILLO_PTS = [[0, 0, 0], [0, -2.2, 5], [0, -2.7, 10.5], [0, -.9, 15.6], [0, 3, 19.2]];
const colmilloCurva = (L = COLMILLO_L) => new THREE.CatmullRomCurve3(COLMILLO_PTS.map(q => new THREE.Vector3(q[0], q[1], q[2]).multiplyScalar(L / 20)));
// tubo que se afina de r0 (la base) a la punta; `desde` y `hasta` recortan el colmillo (0 = base, 1 = punta); `hueco` deja la base abierta
function geoColmillo(L = COLMILLO_L, r0 = 1.5, { desde = 0, hasta = 1, hueco = false } = {}) {
  const cu = colmilloCurva(L), TS = 72, RS = 28, pos = [], uv = [], idx = [], fr = cu.computeFrenetFrames(TS, false);
  for (let i = 0; i <= TS; i++) { const u = lerp(desde, hasta, i / TS), p = cu.getPointAt(u), k = Math.min(TS, Math.round(u * TS)), N = fr.normals[k], B = fr.binormals[k], r = r0 * (.1 + .9 * Math.pow(1 - u, .75)) * (1 + .03 * Math.sin(u * 40));
    for (let j = 0; j <= RS; j++) { const a = j / RS * Math.PI * 2, c = Math.cos(a), s = Math.sin(a), rr = r * (1 + .025 * Math.sin(a * 3 + u * 9)); pos.push(p.x + (N.x * c + B.x * s) * rr, p.y + (N.y * c + B.y * s) * rr, p.z + (N.z * c + B.z * s) * rr); uv.push(u, j / RS) } }
  for (let i = 0; i < TS; i++) for (let j = 0; j < RS; j++) { const a = i * (RS + 1) + j, b = a + RS + 1; idx.push(a, b, a + 1, b, b + 1, a + 1) }
  if (!hueco) { const c = pos.length / 3, p = cu.getPointAt(desde); pos.push(p.x, p.y, p.z); uv.push(desde, .5); for (let j = 0; j < RS; j++) idx.push(c, j, j + 1) }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g }
// marfil viejo pintado a mano: vetas a lo largo, grietas oscuras, manchas de té en la base y anillos de crecimiento
const T_MARFIL = (() => { const [c, z] = pintarDoble(2048, 1024, (c, z, w, h) => { const r = rng(2601); c.fillStyle = "#efe6d0"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
    const gr = c.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, "rgba(150,110,60,.55)"); gr.addColorStop(.18, "rgba(190,160,110,.25)"); gr.addColorStop(.6, "rgba(255,250,235,0)"); gr.addColorStop(1, "rgba(255,255,250,.35)"); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    for (let k = 0; k < 260; k++) { const y = r() * h, x0 = r() * w, len = 80 + r() * 700; c.strokeStyle = r() < .5 ? `rgba(120,90,50,${.08 + r() * .14})` : `rgba(255,255,245,${.1 + r() * .2})`; c.lineWidth = 1 + r() * 3; c.beginPath(); c.moveTo(x0, y); for (let q = 0; q <= 1; q += .1) c.lineTo(x0 + len * q, y + Math.sin(q * 6 + k) * 5); c.stroke() }
    for (let x = 0; x < w; x += 46 + r() * 60) { c.strokeStyle = `rgba(130,100,60,${.1 + r() * .12})`; c.lineWidth = 2 + r() * 4; c.beginPath(); c.moveTo(x, 0); for (let y = 0; y <= h; y += 40) c.lineTo(x + Math.sin(y * .02 + x) * 6, y); c.stroke(); z.strokeStyle = "rgba(70,70,70,.5)"; z.lineWidth = 3; z.beginPath(); z.moveTo(x, 0); z.lineTo(x, h); z.stroke() }
    for (let k = 0; k < 46; k++) { let x = r() * w, y = r() * h; const n = 14 + r() * 30 | 0; c.strokeStyle = `rgba(50,32,16,${.55 + r() * .35})`; c.lineWidth = 1.5 + r() * 3.5; z.strokeStyle = "rgba(0,0,0,.9)"; z.lineWidth = 4 + r() * 5; c.beginPath(); z.beginPath(); c.moveTo(x, y); z.moveTo(x, y); for (let q = 0; q < n; q++) { x += 10 + r() * 26; y += (r() - .5) * 16; c.lineTo(x, y); z.lineTo(x, y) } c.stroke(); z.stroke() }
    for (let k = 0; k < 500; k++) { c.fillStyle = `rgba(110,80,40,${r() * .25})`; c.beginPath(); c.arc(r() * w, r() * h, 1 + r() * 5, 0, 7); c.fill() } });
  return { c, z } })();
const M_MARFIL = new THREE.MeshStandardMaterial({ map: T_MARFIL.c, bumpMap: T_MARFIL.z, bumpScale: 5, roughness: .42, metalness: 0, color: "#ffffff" });
// el corte: donde el colmillo fue serruchado (anillos de dentina y un corazón oscuro); va en la base del cuerno y en el muñón de Onetusk
const T_CORTE_MARFIL = (() => { const [c, z] = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(2602); c.fillStyle = "#e6d8b8"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
    for (let k = 0; k < 44; k++) { const rr = 250 - k * 5.6; c.strokeStyle = k % 3 ? `rgba(150,120,70,${.25 + r() * .25})` : `rgba(250,244,225,${.5})`; c.lineWidth = 1.5 + r() * 2.5; c.beginPath(); for (let a = 0; a <= 6.3; a += .1) { const q = rr * (1 + .02 * Math.sin(a * 5 + k)); a ? c.lineTo(256 + Math.cos(a) * q, 256 + Math.sin(a) * q) : c.moveTo(256 + q, 256) } c.stroke() }
    c.fillStyle = "#5a3a22"; c.beginPath(); c.arc(256, 256, 26, 0, 7); c.fill(); z.fillStyle = "#202020"; z.beginPath(); z.arc(256, 256, 26, 0, 7); z.fill();
    for (let k = 0; k < 9; k++) { const a = r() * 6.3; c.strokeStyle = "rgba(60,36,18,.8)"; c.lineWidth = 2 + r() * 3; z.strokeStyle = "rgba(0,0,0,.9)"; z.lineWidth = 5; c.beginPath(); z.beginPath(); c.moveTo(256, 256); z.moveTo(256, 256); let x = 256, y = 256; for (let q = 0; q < 10; q++) { x += Math.cos(a + (r() - .5) * .6) * 24; y += Math.sin(a + (r() - .5) * .6) * 24; c.lineTo(x, y); z.lineTo(x, y) } c.stroke(); z.stroke() }
    for (let k = 0; k < 60; k++) { const a = r() * 6.3, q = 30 + r() * 210; c.strokeStyle = "rgba(90,70,40,.35)"; c.lineWidth = 1; c.beginPath(); c.moveTo(256 + Math.cos(a) * q, 256 + Math.sin(a) * q); c.lineTo(256 + Math.cos(a + .15) * (q + 14), 256 + Math.sin(a + .15) * (q + 14)); c.stroke() } });
  return { c, z } })();
const M_CORTE_MARFIL = new THREE.MeshStandardMaterial({ map: T_CORTE_MARFIL.c, bumpMap: T_CORTE_MARFIL.z, bumpScale: 3, roughness: .7 });

