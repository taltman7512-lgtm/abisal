//@@LUGAR
// «We Pay The Mountain In Teeth» — escenas (reglas «Romper el techo»: de día, criatura a plena luz desde el segundo 0,
// planos claros en tercera persona, cámara lenta con RUTAS; Toby = ME, Ollie = TIB, Doctor Pell = PAPA).
const LUGAR = L => RUTA_DE[L] ?? 0;
const PISO = (x, z) => sueloT(x, z);
const ponerP = (k, x, z, ry = 0) => { k.g.visible = true; k.g.position.set(x, PISO(x, z), z); k.g.rotation.set(0, ry, 0) };
const enAire = (k, p, ry = 0) => { k.g.visible = true; k.g.position.set(p[0], p[1], p[2]); k.g.rotation.set(0, ry, 0) };
const ryA = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);
const P2 = a => a.length === 3 ? [a[0], a[2]] : a;

//@@SHOTS
let t_ = 0;
const HD = (k, dy = -.2) => () => add(headW(k).toArray(), [0, dy, 0]);
const FRC = (k, d0 = 2.6, ang = 0, dy0 = .1) => () => { const d = Math.max(d0, 2.6), dy = dy0 + .35, h = headW(k), a = k.g.rotation.y + ang; return [h.x + Math.sin(a) * d, h.y + dy, h.z + Math.cos(a) * d] };
const EL = { ME, TIB, PELL: PAPA };
const FRC2 = (n, d, ang, dy) => () => FRC(EL[n], d, ang, dy)();
const HD2 = (n, dy = -.25) => () => HD(EL[n], dy)();
const BOCAM = (o = [0, 0, 0]) => () => add(MONTE.bocaW(), o);
const CARAM = (o = [0, 0, 0]) => () => add(MONTE.caraW(), o);
const LABIOM = (o = [0, 0, 0]) => () => add(MONTE.labioW(0), o);
const TW = (n, w = 0) => () => w ? wt(I[n], w) - .15 : S[I[n]] + .001;
const PA = (n, w, p, l, f = 55, o = {}) => ({ t: TW(n, w), p, l, f, _n: n, ...o });
// la calle donde viven Toby y Ollie (mirando al norte, a la montaña)
const CASA = [-1.6, 16], OLL = [-.3, 16.4];
const RUTAS = [
  // 1 · hoy la montaña abrió la boca; los hermanos de espaldas, chiquitos frente a la cara
  [PA("open", 0, [3, 1.6, 34], BOCAM([0, 6, 0]), 56), PA("open", 6, [2.2, 1.5, 26], BOCAM([0, 2, 0]), 50, { h: .8 }), PA("open", 10, FRC2("ME", 3, .5, .1), HD2("ME"), 52, { h: .6 })],
  // 2 · Gumridge desde arriba, la montaña detrás; 3 · se inclina y muerde una casa
  [PA("rule", 0, [26, 34, 70], [0, 40, -120], 54), PA("rule", 8, [18, 26, 40], CARAM([0, -10, 0]), 52, { h: .8 }), PA("cost", 0, [14, 6, -36], CARAM([0, -20, 0]), 60), PA("cost", 6, [10, 4, -44], BOCAM(), 58, { h: .8 })],
  // 4 · los collares de dientes, nadie sonríe
  [PA("smile", 0, [6, 2.4, -34], [0, 1.6, -46], 54), PA("smile", 9, [3.2, 2.2, -40], [0, 1.6, -47], 50, { h: .8 })],
  // 5 · Doctor Pell, el único que sonríe
  [PA("pell", 0, FRC2("PELL", 4.5, .4, .1), HD2("PELL", -.5), 54), PA("pell", 7, FRC2("PELL", 3, .25, .1), HD2("PELL"), 50, { h: .8 })],
  // 6 · Ollie y su último diente; 7 · Pell con la pinza
  [PA("ollie", 0, FRC2("TIB", 3.6, .3, .3), HD2("TIB", -.4), 56), PA("ollie", 6, FRC2("TIB", 2.8, .5, .2), HD2("TIB", -.1), 52, { h: .8 }),
   PA("pliers", 0, [3.6, 2.2, 13], HD2("PELL", -.4), 58), PA("pliers", 5, [2.6, 1.9, 15.2], HD2("TIB", -.2), 52, { h: .8 })],
  // 8 · agarra la bolsa; 9 · cientos de dientes; nunca alimentó a la montaña
  [PA("bag", 0, [2.8, 2, 19], HD2("ME", -.6), 54), PA("bag", 6, FRC2("ME", 2.8, -.5, .1), () => add(BOLSA_W(), [0, .4, 0]), 48, { h: .8 }),
   PA("never", 0, FRC2("ME", 2.8, -.3, .2), () => add(BOLSA_W(), [0, .3, 0]), 46), PA("never", 6, FRC2("PELL", 3.2, .4, .1), HD2("PELL"), 50, { h: .8 })],
  // 10 · la montaña escupe oro; Pell se lo queda
  [PA("gold", 0, [12, 8, -30], BOCAM([0, -10, 0]), 60), PA("gold", 8, [9, 3.2, -40], [2, 2, -60], 56, { h: .8 })],
  // 11 · y la montaña sigue con hambre
  [PA("hungry", 0, [0, 30, -60], CARAM(), 50), PA("hungry", 4, [0, 34, -80], CARAM([0, 8, 0]), 46, { h: .6 })],
  // 12 · tiembla, se inclina sobre la calle; 13 · todos corren
  [PA("rumble", 0, [3, 1.5, 34], CARAM([0, -10, 0]), 62), PA("rumble", 8, [2, 1.4, 28], CARAM([0, -14, 0]), 64, { h: .6 }), PA("run", 0, [4, 2.4, 30], [0, 1.4, 18], 58), PA("run", 4, [3.4, 2.2, 32], [0, 1.4, 22], 56, { h: .6 })],
  // 14 · trepa al labio con la bolsa; 15 · vuelca los dientes en la boca
  [PA("climb", 0, LABIOM([22, 3, 22]), LABIOM([3, 1, -3]), 50), PA("climb", 7, LABIOM([15, 2, 14]), LABIOM([3, .8, -3]), 46, { h: .8 }),
   PA("pour", 0, LABIOM([13, 1.5, 12]), LABIOM([3, 0, -3]), 45), PA("pour", 7, LABIOM([10, 3, 9]), LABIOM([2, -1, -5]), 48, { h: .8 })],
  // 16 · mastica; 17 · cierra los ojos y vuelve a subir
  [PA("chew", 0, [0, 24, -36], BOCAM(), 58), PA("chew", 5, [0, 22, -48], BOCAM(), 54, { h: .8 }), PA("sleep", 0, [12, 8, -66], CARAM([0, 10, 0]), 54), PA("sleep", 8, [8, 4, -40], CARAM(), 56, { h: .8 })],
  // 18 · Ollie le sonríe a la montaña; 19 · la montaña le devuelve la sonrisa
  [PA("smiled", 0, FRC2("TIB", 3.2, .5, .1), HD2("TIB", -.2), 54), PA("smiled", 8, [2.4, 1.3, 20.5], BOCAM([0, 4, 0]), 58, { h: .8 }),
   PA("back", 0, [2, 1.4, 24], BOCAM([0, 6, 0]), 54), PA("back", 3, [1.6, 1.4, 26], BOCAM([0, 4, 0]), 50, { h: .8 })],
  // 20 · el loop: «por eso hoy la montaña abrió la boca» (vuelve al plano del arranque)
  [PA("end", 0, [3.4, 1.7, 36], BOCAM([0, 8, 0]), 58), PA("end", 7, [3, 1.6, 34], BOCAM([0, 6, 0]), 56, { h: .6 })],
];
const RUTA_DE = {}; ORDEN.forEach((n, L) => { RUTAS.forEach((R, i) => { if (R.some(p => p._n === n)) RUTA_DE[L] = i }) });
const SHOTS = Object.fromEntries(ORDEN.map((n, i) => [i, [sh(0, [0, 10, 40], [0, 10, 40], [0, 0, 0], null, 50)]]));
// utilería: la bolsa de dientes y la pinza
const BOLSA = new THREE.Group(); { const m = new THREE.MeshStandardMaterial({ color: "#8a5a2c", roughness: .8 }), s = new THREE.Mesh(new THREE.SphereGeometry(.32, 16, 12), m); s.scale.set(1, 1.15, .9); BOLSA.add(s);
  const nudo = new THREE.Mesh(new THREE.CylinderGeometry(.06, .12, .16, 10), m); nudo.position.y = .38; BOLSA.add(nudo);
  const dm = new THREE.MeshStandardMaterial({ color: "#f6f2e6", roughness: .35 }); for (let i = 0; i < 9; i++) { const d = new THREE.Mesh(new THREE.BoxGeometry(.07, .09, .06), dm); d.position.set(Math.sin(i * 2.4) * .12, .3 + (i % 3) * .03, Math.cos(i * 2.4) * .1); BOLSA.add(d) } scene.add(BOLSA) }
const PINZA = new THREE.Group(); { const m = new THREE.MeshStandardMaterial({ color: "#b8bcc4", metalness: .7, roughness: .3 }); for (const s of [-1, 1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(.03, .34, .03), m); b.position.set(s * .03, 0, 0); b.rotation.z = s * .12; PINZA.add(b) } scene.add(PINZA) }
const BOLSA_W = () => BOLSA.getWorldPosition(new THREE.Vector3()).toArray();
const propMano = (obj, k, dy = -.15) => { k.g.updateMatrixWorld(true); const p = k.handR.getWorldPosition(new THREE.Vector3()); obj.position.set(p.x, p.y + dy, p.z); obj.visible = true };

//@@ESCENA
const QS = new URLSearchParams(location.search), VISTA = QS.get("vista") ? QS.get("vista").split(",").map(Number) : null;
let ENV_OK = false;
window.MAPA = () => RECTS.map(R => [R.x, R.z, R.w, R.d, R.ry || 0]);
function setScene(t) {
  t_ = t; POST = { flash: 0, sepia: 0 };
  if (!ENV_OK) { Object.assign(ENV, ENV_HOLLOW); ENV_OK = true }
  const L = lineAt(t), N = ORDEN[L], lt = t - s(L), len = (S[L + 1] ?? DUR) - s(L), k = P(lt, 0, len), dW = kk => wt(L, kk) - s(L);
  mundoReset(); utileriaReset(); lejosReset(); TEJEDORA.ocultar(); if (typeof sallowR !== "undefined") sallowR.ocultar(); TEMBLOR = 0;
  ALL.forEach(c => { c.g.visible = false; pose(c, t, {}); quieto(c, t); setFace(c, "neutral") });
  BOLSA.visible = false; PINZA.visible = false;
  setEnv(QS.get("env") || "dia"); ambiente(t);
  const V = VECINOS, mira = (c, x, z, tx, tz, cara) => { ponerP(c, x, z, ryA(x, z, tx, tz)); if (cara) setFace(c, cara) };
  const hermanos = (caraT = "worried", caraO = "worried") => { mira(ME, CASA[0], CASA[1], 0, -160, caraT); mira(TIB, OLL[0], OLL[1], 0, -160, caraO) };
  const gentePlaza = (cara = "worried") => [[-4, -44], [-1.5, -46], [1.6, -45], [4, -47], [-3, -49], [2.5, -50], [-5.5, -51], [5.4, -52]].forEach(([x, z], i) => mira(V[i], x, z, 0, -160, cara));
  MONTE.ojos(.12);
  switch (N) {
    case "open": case "end": hermanos("shock", "terror"); MONTE.boca(eIO(P(lt, .2, Math.min(len, 2.6)))); MONTE.ojos(.6); TEMBLOR = .01 * P(lt, 0, 1.2); break;
    case "rule": gentePlaza("worried"); MONTE.boca(.15); break;
    case "cost": { const u = Math.sin(Math.PI * P(lt, 0, len)); MONTE.inclinar(.45 * u); MONTE.boca(.6 * u); MONTE.ojos(.5); TEMBLOR = MONTE.temblor(t) * u; break }
    case "smile": gentePlaza("sad"); break;
    case "pell": mira(PAPA, 1.5, -45, 1.5, -20, "sonrisaFalsa"); gentePlaza("worried"); BOLSA.visible = true; propMano(BOLSA, PAPA); break;
    case "ollie": hermanos("worried", "worried"); TIB.g.rotation.y = ryA(OLL[0], OLL[1], 2.6, 21); ME.g.rotation.y = ryA(CASA[0], CASA[1], OLL[0], OLL[1]); break;
    case "pliers": { hermanos("terror", "terror"); TIB.g.rotation.y = ryA(OLL[0], OLL[1], .6, 13.4); const z = 10.5 + 2.6 * eIO(P(lt, 0, len * .7)); mira(PAPA, .6, z, OLL[0], OLL[1], "sonrisaFalsa"); if (lt < len * .7) andar(PAPA, t); PINZA.visible = true; propMano(PINZA, PAPA, -.05); BOLSA.visible = false; break }
    case "bag": case "never": hermanos(N === "never" ? "horrified" : "determined", "scared"); mira(PAPA, .6, 13.4, CASA[0], CASA[1], N === "never" ? "enojo" : "shock"); ME.g.rotation.y = ryA(CASA[0], CASA[1], .6, 13.4); BOLSA.visible = true; propMano(BOLSA, ME, -.1); break;
    case "gold": { MONTE.boca(.5); MONTE.escupirOro(t, P(lt, 0, len)); mira(PAPA, 2, -60, 0, -160, "happy"); senalarArriba(PAPA, t); gentePlaza("worried"); break }
    case "hungry": MONTE.ojos(1); MONTE.boca(.3); MONTE.mirar([0, 30, -60], 1); break;
    case "rumble": { MONTE.inclinar(eIO(P(lt, 0, len))); MONTE.boca(.4); MONTE.ojos(1); TEMBLOR = MONTE.temblor(t); hermanos("terror", "terror"); break }
    case "run": { MONTE.inclinar(1); MONTE.boca(.5); MONTE.ojos(1); TEMBLOR = MONTE.temblor(t) * .6;
      [[-3, 14], [2.5, 12], [-1, 9], [3.5, 7], [-2.5, 5], [1, 3]].forEach(([x, z], i) => { const zz = z + 3.2 * lt; ponerP(V[i], x, zz, 0); correrV(V[i], t + i * .2); setFace(V[i], "terror") });
      const zp = 8 + 4.6 * lt; ponerP(PAPA, .5, zp, 0); correrV(PAPA, t); setFace(PAPA, "terror"); break }
    case "climb": case "pour": { MONTE.inclinar(0); MONTE.boca(.55); MONTE.ojos(1); const lb = MONTE.labioW(6), u = N === "climb" ? P(lt, 0, len) : 1;
      enAire(ME, [lb[0] + 1.8 * (1 - u), lb[1] - 1.4 * (1 - u), lb[2] + 3 * (1 - u)], Math.PI); if (N === "climb") trepar(ME, t, {}); else setFace(ME, "determined"); setFace(ME, "determined");
      BOLSA.visible = true; propMano(BOLSA, ME, N === "pour" ? .1 : -.1); if (N === "pour") { BOLSA.rotation.x = -1.6 * P(lt, .3, 1.4) } else BOLSA.rotation.x = 0; break }
    case "chew": MONTE.inclinar(1 - .3 * P(lt, 0, len)); MONTE.masticar(t, 1); MONTE.ojos(.7); break;
    case "sleep": { const u = eIO(P(lt, 0, len)); MONTE.inclinar(.7 * (1 - u)); MONTE.ojos(.7 * (1 - P(lt, 0, 1.2))); MONTE.boca(.1); break }
    case "smiled": hermanos("happy", "happy"); MONTE.ojos(.3); break;
    case "back": hermanos("happy", "happy"); MONTE.ojos(.6); MONTE.sonreir(eIO(P(lt, 0, len * .8))); MONTE.boca(.2); break;
  }
  BOLSA.rotation.x = (N === "pour") ? BOLSA.rotation.x : 0;
  lejos(t);
  if (VISTA) { cam.position.set(VISTA[0], VISTA[1], VISTA[2]); cam.lookAt(VISTA[3], VISTA[4], VISTA[5]); cam.fov = VISTA[6] || 50; cam.updateProjectionMatrix(); lights(lucesCerca(cam.position.toArray(), 6)); POST.tapa = null; return }
  camara(t); let LX = lucesCerca(cam.position.toArray(), 4);
  if (window.CAM_L) { const l = new THREE.Vector3(...window.CAM_L), dv = l.clone().sub(cam.position).setY(0).normalize(), rim = l.clone().addScaledVector(dv, 1.8).add(new THREE.Vector3(0, 1.1, 0)); LX = [[rim.toArray(), 2.4, "#ffe2b8", 7], ...LX] }   // contraluz cálido de sol
  lights(LX);
}
