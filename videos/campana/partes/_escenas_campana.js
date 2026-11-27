//@@LUGAR
// lugares (cambio de lugar = corte duro): adentro de la campana, la ciudad, la tienda de Sallow, la casa de Nell, la cadena
const LUGAR = L => (L <= I.open || (L >= I.inside && L <= I.fell) || L === I.stay) ? "dentro"
  : (L >= I.sallow && L <= I.smile) || L === I.boots ? "tienda" : (L === I.work || (L >= I.found && L <= I.hired) || L === I.faces) ? "trastienda"
  : (L >= I.nell && L <= I.sir) ? "casa" : (L === I.chain || (L >= I.climb && L <= I.clouds) || L >= I.nightly) ? "cadena" : "ciudad";
const PISO = (x, z) => sueloB(x, z);
const ponerP = (k, x, z, ry = 0) => { k.g.visible = true; k.g.position.set(x, PISO(x, z), z); k.g.rotation.set(0, ry, 0) };
const enAire = (k, p, ry = 0) => { k.g.visible = true; k.g.position.set(p[0], p[1], p[2]); k.g.rotation.set(0, ry, 0) };
const ryA = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);
const P2 = a => a.length === 3 ? [a[0], a[2]] : a;

//@@SHOTS
let t_ = 0;
let TAPON_P = [0, 1.2, 0]; const taponW = () => TAPON_P;
const KW = (k, o) => () => add(k.g.getWorldPosition(new THREE.Vector3()).toArray(), o);
const HDc = k => () => add(headW(k).toArray(), [0, -.3, 0]);
// frente de la cabeza de un personaje: a d metros delante de la cara, dy arriba, lat al costado
const FR = (k, d0 = 1.4, dy = 0, lat = 0) => () => { const d = d0 * 2.1, h = headW(k), a = k.g.rotation.y; return [h.x + Math.sin(a) * d + Math.cos(a) * lat, h.y + dy, h.z + Math.cos(a) * d - Math.sin(a) * lat] };
const SRH = (o = [0, 0, 0]) => () => add(sallowR.headW().toArray(), o);
const SRC = (d = 1.25, ang = 0, dy = 0) => () => sallowR.caraCam(d, ang, dy);
const CC = (n, k = "p") => () => { const c = CAMS_CAMPANA[n]; return typeof c[k] === "function" ? c[k]() : c[k] };
const PW = (x, y, z) => () => plataformaW(x, y, z);
const TIx = k => TI.P[k];
const TIo = (k, o = [0, 0, 0]) => () => add(TIx(k), o);
const RC = RISCO_CIMA, PE = PRIMER_ESLABON;
// la cadena del este: punto de trepada y su marco
const TREPA = u => cadenaMarco("este", u);
const enCadena = (u, o = [0, 0, 0]) => () => { const m = TREPA(u); return [m.p[0] + m.n[0] * o[0] + m.lado[0] * o[1], m.p[1] + o[2], m.p[2] + m.n[2] * o[0] + m.lado[2] * o[1]] };
const U_TREPA = { climb: .03, links: .08, clouds: .2 };
const SHOTS = {
  // ---- adentro de la campana (gancho del arranque)
  [I.open]: [sh(0, PW(-5.5, 3.2, 4), PW(-5, 3, 3.6), PW(1, 1.6, 0), null, 62),
    sh(5, FR(ME, 1.6, .1, .3), FR(ME, 1.4, .05, .2), HDc(ME), null, 50, { tr: "barrido" })],
  // ---- la ciudad al mediodía: la campana, las cadenas, la sombra
  [I.rule]: [sh(0, CC("aereaDia"), () => add(CAMS_CAMPANA.aereaDia.p, [20, -10, -20]), CC("aereaDia", "l"), null, 50)],
  [I.cost]: [sh(0, [7.5, 1.7, 9.5], [7, 1.8, 9], [0, 3, -2], null, 56), sh(3, FR(VECINOS[0], 1.3, .1), FR(VECINOS[0], 1.15, .05), HDc(VECINOS[0]), null, 46, { tr: "barrido" })],
  [I.nobody]: [sh(0, [0, 1.7, 19], [0, 1.8, 18], [0, 60, 40], null, 64)],
  [I.hangs]: [sh(0, CC("aerea"), () => add(CAMS_CAMPANA.aerea.p, [-30, 10, -10]), CC("aerea", "l"), null, 50), sh(9, [40, 30, 120], [30, 34, 112], [0, 150, -10], null, 56, { tr: "barrido" })],
  [I.shadow]: [sh(0, [-60, 80, 140], [-50, 82, 130], [0, 0, 0], null, 52)],
  // ---- la Larga Noche se prepara (atardecer): la plaza tapándose los oídos, la boda, los bebés, la escuela, la fuente
  [I.plug]: [sh(0, [9, 3.2, 12], [8, 3.4, 11], [0, 1.5, 0], null, 58), sh(6, FR(VECINOS[1], 1.3, .05, .2), FR(VECINOS[1], 1.15, .05, .1), HDc(VECINOS[1]), null, 46, { tr: "barrido" })],
  [I.wed]: [sh(0, () => { const c = P2(LUGARES_GENTE.altar.centro); return [2 * c[0] + 1.2, PISO(c[0], c[1]) + 1.9, 2 * c[1] - 6.2] }, () => { const c = P2(LUGARES_GENTE.altar.centro); return [2 * c[0] + 1.4, PISO(c[0], c[1]) + 1.95, 2 * c[1] - 6.6] }, () => { const c = P2(LUGARES_GENTE.altar.centro); return [c[0], PISO(c[0], c[1]) + 1.4, c[1]] }, null, 54)],
  [I.babies]: [sh(0, FR(MADRES[0], 1.6, -.1, .3), FR(MADRES[0], 1.4, -.1, .2), () => add(headW(MADRES[0]).toArray(), [0, -.4, 0]), null, 50)],
  [I.school]: [sh(0, [-7.6, 1.6, -5.4], [-7.9, 1.65, -5.8], [-12.6, 1.7, -9.8], null, 55)],
  [I.sign]: [sh(0, [1.2, 1.3, 9.6], [.5, 1.25, 9], [0, 1.1, 4.2], null, 50)],
  // ---- Mister Sallow en su tienda (clima sombrío)
  [I.sallow]: [sh(0, [4.5, 1.2, -8.5], [4, 1.3, -9.2], SRH([0, -1.6, 0]), null, 62), sh(5, SRC(2.4, .5, -.3), SRC(2.1, .4, -.3), SRH([0, -.2, 0]), null, 48, { tr: "barrido" })],
  [I.never]: [sh(0, SRC(1.1, -.6, 0), SRC(1, -.55, 0), SRH(), null, 42)],
  [I.price]: [sh(0, [3.6, 2.2, -10], [3.3, 2.3, -10.4], () => { const p = VECINOS[12].g.position; return [p.x - .2, p.y + 2.4, p.z - .8] }, null, 54),
    sh(6, () => { const p = VECINOS[12].g.position; return [p.x + 4.4, p.y + 2, p.z + 1.8] }, () => { const p = VECINOS[12].g.position; return [p.x + 4, p.y + 2.1, p.z + 2.3] }, () => add(headW(VECINOS[12]).toArray(), [-.3, 1, -1]), null, 58, { tr: "barrido" })],
  [I.shop]: [sh(0, [6, 2.2, -4], [5.4, 2.3, -4.6], [0, 4, -17], null, 58)],
  [I.candles]: [sh(0, [-3.5, .9, -9], [-3, 1, -9.6], SRH([0, -2, 0]), null, 56)],
  [I.name]: [sh(0, [2.9, 1.5, -8.2], [2.8, 1.55, -8.4], SRH([0, -.3, 0]), null, 54)],
  [I.smile]: [sh(0, SRC(2.4, 0, -.2), SRC(2.1, .15, -.2), SRH([0, -.3, 0]), null, 50), sh(6, SRC(2.2, .5, -.3), SRC(2, .35, -.3), SRH([0, -.2, 0]), null, 46, { tr: "barrido" })],
  // ---- la trastienda
  [I.work]: [sh(0, [-3.4, 2.6, -20.6], [-3.2, 2.65, -20.9], () => add(TIx("olla"), [0, .9, 0]), null, 64), sh(4, () => { const h = headW(ME); return [.6 + (h.x - .6) * .35, 2.1, -20.4 + (h.z + 20.4) * .35] }, () => { const h = headW(ME); return [.6 + (h.x - .6) * .45, 2.1, -20.4 + (h.z + 20.4) * .45] }, HDc(ME), null, 52, { tr: "barrido" })],
  // ---- la casa de Nell (noche cálida)
  [I.nell]: [sh(0, () => CASA_NELL_V.ventana.map((v, i) => v + [-.6, -.35, -.8][i]), () => CASA_NELL_V.ventana.map((v, i) => v + [-.4, -.35, -.6][i]), HDc(NELL), null, 50)],
  [I.say]: [sh(0, FR(NELL, .55, .05, 0), FR(NELL, .5, .05, 0), HDc(NELL), null, 52), sh(9, FR(ME, 1.0, .35, 0), FR(ME, .92, .35, 0), HDc(ME), null, 50, { tr: "barrido" })],
  [I.last]: [sh(0, FR(ME, 1.0, .35, .1), FR(ME, .92, .35, .05), () => add(headW(ME).toArray(), [0, -.4, 0]), null, 54)],
  [I.forgot]: [sh(0, FR(NELL, .55, 0, 0), FR(NELL, .5, 0, 0), HDc(NELL), null, 52)],
  [I.sir]: [sh(0, FR(ME, 1.0, .35, 0), FR(ME, .92, .35, 0), HDc(ME), null, 50)],
  // ---- lo que encontró en la trastienda
  [I.found]: [sh(0, [-3.2, 1.25, -20.4], [-3.25, 1.2, -20.6], [-3.45, .7, -21.4], null, 45)],
  [I.hole]: [sh(0, FR(ME, 1.2, .05, .25), FR(ME, 1.05, .05, .2), HDc(ME), null, 46)],
  [I.ledger]: [sh(0, TIo("libro", [.3, .55, .45]), TIo("libro", [.25, .5, .38]), TIo("libro"), null, 40)],
  [I.workers]: [sh(0, [-3.4, 2.6, -20.6], [-3.2, 2.6, -20.8], [0, 1.6, -25], null, 66), sh(14, [-3.6, 2.4, -21.6], [-3.4, 2.45, -21.9], [0, 2, -24.5], null, 70, { tr: "barrido" })],
  [I.hired]: [sh(0, [-3.4, 2.6, -20.6], [-3.2, 2.6, -20.8], HDc(ME), null, 62)],
  // ---- la cadena del este y las botas
  [I.chain]: [sh(0, CC("primerEslabon"), () => add(CAMS_CAMPANA.primerEslabon.p, [3, 1, -2]), CC("primerEslabon", "l"), null, 55), sh(4, () => add(PE, [-16, 8, 12]), () => add(PE, [-15, 8.8, 13]), () => add(PE, [0, 3, 0]), null, 55, { tr: "barrido" })],
  [I.boots]: [sh(0, () => add(sallowR.g.position.toArray(), [3.6, .4, 3.6]), () => add(sallowR.g.position.toArray(), [3.1, .45, 4]), () => add(sallowR.g.position.toArray(), [0, 2.2, 0]), null, 66)],
  // ---- esta noche: los tapones nuevos de Nell
  [I.tonight]: [sh(0, FR(NELL, .9, .2, -.6), FR(NELL, .82, .2, -.5), () => add(headW(NELL).toArray(), [0, -.4, 0]), null, 54)],
  [I.needle]: [sh(0, FR(ME, 1.0, .1, 0), FR(ME, .92, .1, 0), HDc(ME), null, 50)],
  [I.nobodyleft]: [sh(0, FR(NELL, .85, 0, 0), FR(NELL, .78, 0, 0), HDc(NELL), null, 50)],
  // ---- la trepada
  [I.climb]: [sh(0, () => add(RC, [-6, 2.5, 5]), () => add(RC, [-5.5, 2.7, 4.5]), () => add(RC, [-1, 1.5, 0]), null, 58), sh(10, enCadena(.05, [7, 5, 2]), enCadena(.055, [6.5, 4.5, 2.4]), () => ME.g.getWorldPosition(new THREE.Vector3()).toArray(), null, 56, { tr: "barrido" })],
  [I.links]: [sh(0, enCadena(.09, [12, 9, -4]), enCadena(.095, [11, 8.5, -3]), () => add(ME.g.getWorldPosition(new THREE.Vector3()).toArray(), [0, 1.5, 0]), null, 58)],
  [I.clouds]: [sh(0, enCadena(.2, [9, 7, 10]), enCadena(.21, [8.5, 6.5, 11]), () => ME.g.getWorldPosition(new THREE.Vector3()).toArray(), null, 58), sh(5, enCadena(.22, [7, 4, 6]), enCadena(.22, [7, 4.4, 5.4]), () => ME.g.getWorldPosition(new THREE.Vector3()).toArray(), null, 62, { tr: "barrido" })],
  // ---- adentro de la campana
  [I.inside]: [sh(0, CC("dentro"), () => add(CAMS_CAMPANA.dentro.p, [-.5, .3, .4]), HDc(ME), null, 68)],
  [I.noclapper]: [sh(0, CC("dentro"), () => add(CAMS_CAMPANA.dentro.p, [.4, .3, -.3]), () => add(headW(ME).toArray(), [0, 1.2, 0]), null, 70)],
  [I.hammer]: [sh(0, PW(-5.5, 1.2, 3.8), PW(-5, 1.3, 3.4), SRH([0, -1.8, 0]), null, 64), sh(5, () => add(sallowR.g.position.toArray(), [-3.6, 1, 3.6]), () => add(sallowR.g.position.toArray(), [-3.1, 1.1, 3.9]), () => add(sallowR.g.position.toArray(), [0, 2, 0]), null, 62, { tr: "barrido" })],
  [I.smiled]: [sh(0, SRC(2.6, 0, -.3), SRC(2.3, -.15, -.3), SRH([0, -.4, 0]), null, 52), sh(4, () => add(sallowR.g.position.toArray(), [-3.2, 1.2, 3.4]), () => add(sallowR.g.position.toArray(), [-2.6, 1.3, 3.6]), SRH([0, -1, 0]), null, 56, { tr: "barrido" })],
  [I.pour]: [sh(0, FR(ME, 1.6, .7, .7), FR(ME, 1.45, .7, .6), HDc(ME), null, 54), sh(7, () => add(interior().vuelca, [3.2, 1.6, 3.2]), () => add(interior().vuelca, [2.9, 1.4, 2.9]), () => interior().vuelca, null, 56, { tr: "barrido" })],
  [I.swing]: [sh(0, () => add(sallowR.g.position.toArray(), [-4, .6, 3.4]), () => add(sallowR.g.position.toArray(), [-3.5, .5, 3.9]), () => add(sallowR.g.position.toArray(), [0, 2.4, 0]), null, 66)],
  [I.thud]: [sh(0, CC("dentroPlataforma"), () => add(CAMS_CAMPANA.dentroPlataforma.p, [0, -1, 0]), CC("dentroPlataforma", "l"), null, 56, { shake: .08 })],
  [I.first]: [sh(0, CC("dentroLabio"), () => add(CAMS_CAMPANA.dentroLabio.p, [0, .4, 0]), CC("dentroLabio", "l"), null, 70)],
  [I.fell]: [sh(0, PW(-3, 1.6, -4.5), PW(-2.8, 1.7, -4.3), SRH([0, -1, 0]), null, 60), sh(6, PW(-6.2, 3, -3), PW(-6.2, 3.2, -2.8), () => sallowR.headW().toArray(), null, 70, { tr: "barrido" })],
  // ---- abajo: la ciudad que se enciende, los trabajadores recuperan la cara
  [I.below]: [sh(0, [0, 40, 75], [0, 44, 70], [0, 0, 0], null, 55)],
  [I.faces]: [sh(0, [.6, 2.2, -20.4], [.3, 2.2, -21], [-1, 1.4, -26], null, 64), sh(9, [-3.4, 2.6, -20.6], [-3.2, 2.6, -20.8], [0, 2, -24.5], null, 70, { tr: "barrido" })],
  [I.stay]: [sh(0, FR(ME, 1.6, .2, .5), FR(ME, 1.45, .2, .4), HDc(ME), null, 54)],
  // ---- el final: Nell en el primer eslabón
  [I.nightly]: [sh(0, () => add(RC, [-2, 1.8, -2]), () => add(RC, [-1.6, 2, -2.4]), HDc(NELL), null, 58)],
  [I.end]: [sh(0, FR(NELL, 1.4, .5, 1.1), FR(NELL, 1.3, .45, 1), HDc(NELL), null, 52), sh(5, FR(NELL, 1.5, -.3, .9), FR(NELL, 1.4, -.35, .8), () => add(headW(NELL).toArray(), [0, .7, 0]), null, 68, { tr: "barrido" })],
};
Object.values(SHOTS).forEach(L => L.forEach(x => { x.tr = x.tr || "barrido"; x.lat = x.lat ?? .35 }));

//@@ESCENA
const QS = new URLSearchParams(location.search), VISTA = QS.get("vista") ? QS.get("vista").split(",").map(Number) : null;
let ENV_OK = false;
window.MAPA = () => RECTS.map(R => [R.x, R.z, R.w, R.d, R.ry || 0]);
// dónde está el tapón agujereado en la mano del narrador (para los planos de detalle)
function setScene(t) {
  t_ = t; POST = { flash: 0, sepia: 0 };
  if (!ENV_OK) { Object.assign(ENV, ENV_CAMPANA_CIUDAD); if (typeof envCampana === "function") envCampana(ENV); sallowR.climas(); ENV_OK = true }
  const L = lineAt(t), lt = t - s(L), len = (S[L + 1] ?? DUR) - s(L), k = P(lt, 0, len), Wd = kk => wt(L, kk), T0 = s(L), dW = kk => Wd(kk) - T0;
  mundoReset(); utileriaReset(); lejosReset(true); sallowR.ocultar(); TEMBLOR = 0;
  ALL.forEach(c => { c.g.visible = false; pose(c, t, {}); quieto(c, t); setFace(c, "neutral") });
  const lug = LUGAR(L);
  const env = lug === "dentro" ? "dentro" : (lug === "tienda" || lug === "trastienda") ? "sallow" : lug === "casa" ? "noche"
    : (L >= I.rule && L <= I.shadow) ? "mediodia" : (L >= I.plug && L <= I.sign) || L === I.chain ? "atardecer" : "noche";
  setEnv(QS.get("env") || env); ambiente(t);
  R.toneMappingExposure *= lug === "dentro" ? 1.85 : (lug === "cadena" || env === "noche") ? 1.6 : 1.3;   // revisor: luminancia 0,27 contra 0,34–0,41 y 18 % de negros
  if (scene.fog && scene.fog.density !== undefined && (L === I.rule || L === I.hangs || L === I.shadow || L === I.below || L === I.nobody)) scene.fog.density = Math.min(scene.fog.density, .0004);
  if (QS.has("caras")) { const L6 = ["happy", "sad", "worried", "angry", "scared", "terrified"], k6 = L6[Math.floor(t) % 6]; ponerP(ME, 7, 6, ryA(7, 6, 7.5, 9.5)); quieto(ME, t); setFace(ME, k6); ME.g.updateMatrixWorld(true);
    const h = headW(ME), d = new THREE.Vector3(Math.sin(ME.g.rotation.y), 0, Math.cos(ME.g.rotation.y)); lejos(t); const dC = +(QS.get("carasd") || 1.5); cam.position.set(h.x + d.x * dC, h.y + .05, h.z + d.z * dC); cam.lookAt(h.x, h.y - .05 - (dC - 1.5) * .35, h.z); cam.fov = 40; cam.updateProjectionMatrix(); lights([]); POST.tapa = null; return }
  const V = VECINOS;
  const parado = (c, x, z, ry, cara = "neutral") => { ponerP(c, x, z, ry); setFace(c, cara); quieto(c, t) };
  const mirando = (c, x, z, tx, tz, cara = "neutral") => parado(c, x, z, ryA(x, z, tx, tz), cara);
  const PL = LUGARES_GENTE.plaza.filter(([x, z]) => z < 4);
  // ---- la campana: cera en el labio, el golpe, el zumbido, las nubes de la trepada
  const cera = L === I.pour ? P(lt, dW(1), len) : (L > I.pour && L <= I.stay) ? 1 : 0;
  if (cera > 0) ceraEnLabio(cera, L === I.pour ? 1 : .6);
  if (L === I.swing || L === I.thud) golpe(s(I.swing) + .45, t);
  zumbido(t, lug === "dentro" ? (L >= I.thud ? .4 : 2) : .6);
  nubesTrepada(L === I.clouds || L === I.links);
  if (L >= I.thud && L <= I.first) TEMBLOR = Math.max(TEMBLOR, golpeTemblor());
  // ---- quiénes y dónde
  switch (L) {
    case I.open: case I.pour: case I.stay: { const pv = plataformaW(-1.2, 0, 2.6), pq = interior().vuelca; enAire(ME, pv, ryA(pv[0], pv[2], pq[0], pq[2]));
      if (L === I.pour) { volcarOlla(ME, t, P(lt, dW(1), dW(7))); ollaCera(ME, true, "manos", { t }); setFace(ME, lt > dW(7) ? "esfuerzo" : "aguanta") }
      else { ollaCera(ME, true, "manos", { t }); setFace(ME, L === I.stay ? "sad" : "determined") }
      if (L === I.open) { const sp = plataformaW(2.6, 0, -1.2); sallowR.poner(sp[0], sp[1], sp[2], ryA(sp[0], sp[2], pv[0], pv[2])); sallowR.quieto(t); sallowR.martillo(true); sallowR.aura(true, .6) }
      break }
    case I.rule: case I.hangs: case I.shadow: PL.slice(0, 40).forEach(([x, z], i) => { const c = ALL[i % ALL.length]; if (c === ME || c === NELL || TRABAJADORES.includes(c)) return; parado(c, x, z, ryA(x, z, 0, 0)) }); break;
    case I.cost: case I.nobody: case I.plug: { PL.slice(0, 18).forEach(([x, z], i) => { const c = V[i % V.length]; ponerP(c, x, z, ryA(x, z, 7.5, 9.5)); if (L === I.nobody) { mirarArriba(c, t, .8); setFace(c, "worried") } else { taparOidos(c, t, L === I.plug ? P(lt, dW(5) - .2, dW(7)) : .6, { cara: L === I.cost ? "terror" : "worried" }) } }); break }
    case I.wed: { const n = P2(LUGARES_GENTE.altar.novio), m = P2(LUGARES_GENTE.altar.novia); ponerP(NOVIO, n[0], n[1], ryA(n[0], n[1], m[0], m[1])); ponerP(NOVIA, m[0], m[1], ryA(m[0], m[1], n[0], n[1])); taparOidosOtro(NOVIO, NOVIA, t, P(lt, .2, 1)); setFace(NOVIO, "warm"); setFace(NOVIA, "happy");
      (LUGARES_GENTE.altar.invitados || []).slice(0, 8).forEach((p, i) => { const q = P2(p); const c = V[(i + 4) % V.length]; if (c === NOVIO || c === NOVIA) return; ponerP(c, q[0], q[1], ryA(q[0], q[1], n[0], n[1])); taparOidos(c, t, .9, { cara: "warm" }) }); break }
    case I.babies: { const [x, z] = PL[3]; ponerP(MADRES[0], x, z, ryA(x, z, 7.5, 9.5)); cargarBebe(MADRES[0], t); setFace(MADRES[0], "warm"); const [x2, z2] = PL[5]; ponerP(MADRES[1], x2, z2, ryA(x2, z2, 7.5, 9.5)); cargarBebe(MADRES[1], t); setFace(MADRES[1], "hopeful"); break }
    case I.school: { const E = LUGARES_GENTE.escuela; const m = P2(E.maestra); ponerP(MAESTRA, m[0], m[1], ryA(m[0], m[1], -7.6, -5.4)); setFace(MAESTRA, "neutral"); senalar(MAESTRA, t, .8);
      E.alumnos.slice(0, 3).forEach((p, i) => { const q = P2(p), c = CHICOS[i]; ponerP(c, q[0], q[1], ryA(q[0], q[1], m[0], m[1])); leerLabios(c, t); setFace(c, "curious") }); break }
    case I.sign: { const [x, z] = PL[2]; mirando(CHICOS[0], x, z, 0, 0, "curious"); break }
    case I.sallow: case I.never: case I.price: case I.shop: case I.candles: case I.name: case I.smile: case I.boots: {
      const sx = 0, sz = -14.2; sallowR.poner(sx, PISO(sx, sz), sz, 0);
      if (L === I.candles) { const z = -18 + lt * .7; sallowR.poner(-1.5, PISO(-1.5, z), z, 0); sallowR.andar(t, .7) } else sallowR.quieto(t);
      if (L === I.never || L === I.smile) sallowR.ladear(L === I.smile ? .7 * eIO(k) : .45);
      if (L === I.price) { const cx = .4, cz = -12.6; ponerP(V[12], cx, cz, Math.PI); susurrarFrasco(V[12], t); sallowR.frasco(true); sallowR.inclinarse(eIO(P(lt, 0, 1.2)) * .8, headW(V[12]).toArray()) }
      if (L === I.name) { const nx = 1.6, nz = -10.6; ponerP(NELL, nx, nz, ryA(nx, nz, 0, -14)); setFace(NELL, "terror"); taparOidos(NELL, t, 0, { cara: "terror" }); sallowR.inclinarse(.5 * eIO(k), headW(NELL).toArray()) }
      if (L === I.shop) [[V[0], -5.5, -11], [V[4], 3.5, -11.5]].forEach(([c, x, z]) => mirando(c, x, z, 0, -14, "worried"));
      sallowR.aura(true, 1); break }
    case I.work: case I.found: case I.hole: case I.ledger: case I.workers: case I.hired: case I.faces: {
      const olla = TIx("olla"), mx = olla[0] + .9, mz = olla[2] + .9; ponerP(ME, mx, mz, ryA(mx, mz, olla[0], olla[2]));
      if (L === I.work) { derretirCera(ME, t); setFace(ME, "gloomy") }
      else if (L === I.found || L === I.hole || L === I.ledger) { const cj = TIx("cajon"), x = cj[0] + .2, z = cj[2] + .9; ponerP(ME, x, z, ryA(x, z, cj[0], cj[2])); mostrarTapones(ME, t, L === I.found ? P(lt, dW(3), len) : 1); taponesEnMano(ME, true, "R"); setFace(ME, L === I.ledger ? "horrified" : "shock") }
      else setFace(ME, L === I.hired ? "sad" : "scared");
      [...LUGARES_GENTE.trastienda].sort((a, b) => Math.hypot(b[0] - .6, b[1] + 20.4) - Math.hypot(a[0] - .6, a[1] + 20.4)).forEach(([x, z], i) => { const c = TRABAJADORES[i % TRABAJADORES.length]; if (i >= TRABAJADORES.length) return; ponerP(c, x, z, (L === I.faces || L === I.workers || L === I.hired) ? ryA(x, z, .6, -20.4) : ryA(x, z, x, z - 1)); if (L === I.faces) { quieto(c, t + i); caraVuelve(c, P(lt, dW(9) - .4, len), "relieved") } else derretirCera(c, t + i); if (L === I.faces) {} else setFace(c, "vacia") });
      ME.g.updateMatrixWorld(true); TAPON_P = ME.handR.getWorldPosition(new THREE.Vector3()).toArray();
      break }
    case I.nell: case I.say: case I.last: case I.forgot: case I.sir: {
      const m = CASA_NELL_V.mesa, a = CASA_NELL_V.adentro; ponerP(NELL, a[0], a[2], ryA(a[0], a[2], m[0], m[2])); quieto(NELL, t);
      ponerP(ME, a[0] + 1.3, a[2] + .6, ryA(a[0] + 1.3, a[2] + .6, a[0], a[2])); NELL.g.rotation.y = ryA(a[0], a[2], a[0] + 1.3, a[2] + .6);
      if (L === I.say) { POST.sepia = .5; setFace(NELL, "happy"); setFace(ME, lt > dW(11) ? "happy" : "warm") }
      else if (L === I.last) { POST.sepia = .5; mostrarTapones(ME, t, 1); taponesEnMano(ME, true, "R"); setFace(ME, "warm"); setFace(NELL, "happy") }
      else { setFace(NELL, L === I.nell ? "educada" : "educada"); setFace(ME, L === I.sir ? "sad" : L === I.forgot ? "worried" : "hopeful") }
      break }
    case I.chain: { const c = RC; ponerP(ME, c[0] - 3, c[2] + 2, ryA(c[0] - 3, c[2] + 2, PE[0], PE[2])); mirarArriba(ME, t, .8); setFace(ME, "suspicious"); break }
    case I.tonight: case I.needle: case I.nobodyleft: { const [nx, nz] = [4.2, 7.2]; ponerP(NELL, nx, nz, ryA(nx, nz, 6, 9)); setFace(NELL, L === I.nobodyleft ? "educada" : "happy"); mostrarTapones(NELL, t, L === I.tonight ? P(lt, dW(2), len) : .6); taponesEnMano(NELL, true, "R");
      ponerP(ME, nx + 2.1, nz + .7, ryA(nx + 2.1, nz + .7, nx, nz)); NELL.g.rotation.y = ryA(nx, nz, nx + 2.1, nz + .7); if (L === I.needle) { mostrarTapones(ME, t, 1); taponesEnMano(ME, true, "R"); setFace(ME, "horrified"); ME.g.updateMatrixWorld(true); TAPON_P = ME.handR.getWorldPosition(new THREE.Vector3()).toArray() } else setFace(ME, L === I.nobodyleft ? "terrified" : "worried"); break }
    case I.climb: case I.links: case I.clouds: { const u = L === I.climb ? (lt < dW(9) ? 0 : U_TREPA.climb * P(lt, dW(9), len)) : L === I.links ? U_TREPA.links + .03 * k : U_TREPA.clouds + .04 * k;
      if (L === I.climb && lt < dW(9)) { const c = RC; ponerP(ME, c[0] - 2, c[2] + 1.5, ryA(c[0] - 2, c[2] + 1.5, PE[0], PE[2])); ollaCera(ME, true, "manos", { t }); setFace(ME, "determined") }
      else { const m = TREPA(Math.max(.012, u)); enAire(ME, [m.p[0] + m.n[0] * 3, m.p[1] - 1, m.p[2] + m.n[2] * 3], Math.atan2(-m.n[0], -m.n[2])); trepaCadena(ME, t, {}); ollaCera(ME, true, "L", { t }); setFace(ME, L === I.clouds ? "aguanta" : "esfuerzo") }
      break }
    case I.inside: case I.noclapper: case I.hammer: case I.smiled: case I.swing: case I.thud: case I.first: case I.fell: {
      const pv = plataformaW(-1.2, 0, 2.6), sp = plataformaW(2.6, 0, -1.2); enAire(ME, pv, ryA(pv[0], pv[2], sp[0], sp[2])); ollaCera(ME, true, "manos", { t: t });
      setFace(ME, L === I.inside ? "scared" : L === I.noclapper ? "shock" : L === I.hammer ? "terrified" : L === I.smiled ? "terrified" : L === I.first ? "relieved" : L === I.fell ? "shock" : "esfuerzo");
      sallowR.poner(sp[0], sp[1], sp[2], ryA(sp[0], sp[2], pv[0], pv[2]));
      if (L === I.swing || L === I.thud) { sallowR.martillo(true); sallowR.golpe(t, L === I.swing ? .62 * eIO(k) : .62 + .38 * k); }
      else if (L === I.fell) sallowR.caer(eIO(P(lt, dW(1), dW(7) + .4)));
      else { sallowR.quieto(t); sallowR.martillo(L !== I.inside); if (L === I.smiled) sallowR.ladear(.55 * eIO(k)) }
      sallowR.aura(L !== I.inside && L !== I.noclapper, .8); if (L === I.inside || L === I.noclapper) sallowR.ocultar();
      break }
    case I.below: break;
    case I.nightly: case I.end: { const c = RC; ponerP(NELL, c[0] - 1.2, c[2] + 1.2, ryA(c[0] - 1.2, c[2] + 1.2, PE[0], PE[2])); gritarArriba(NELL, t, { u: L === I.end ? 1 : .3, cara: L === I.end ? "grito" : "hopeful" }); break }
  }
  lejos(t);
  if (VISTA) { cam.position.set(VISTA[0], VISTA[1], VISTA[2]); cam.lookAt(VISTA[3], VISTA[4], VISTA[5]); cam.fov = VISTA[6] || 50; cam.updateProjectionMatrix(); lights([]); POST.tapa = null; return }
  camara(t); const LX = typeof lucesCerca === "function" ? lucesCerca(cam.position.toArray(), 4) : [];
  if (lug === "dentro") { LX.length = Math.min(LX.length, 2); LX.push([add(interior().gancho, [0, 1.5, 2]), 6, "#ffd6a0", 18], [add(cam.position.toArray(), [0, 2, 0]), L === I.noclapper ? .6 : 2.5, "#a8b8e0", 14]) }
  if (L === I.nightly || L === I.end) LX.push([add(headW(NELL).toArray(), [1.2, 1.5, 1.5]), 3, "#ffc480", 8]);
  lights(LX);
}
