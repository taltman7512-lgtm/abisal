// Cámara con las transiciones medidas en Volze (referencia/estilo-volze-medido.md), sin atravesar nada (pedido del dueño):
//  - "vuelo"   la cámara vuela de una toma a la otra en arco, por encima de los techos (8–27 cuadros a 30 fps, poco desenfoque)
//  - "barrido" giro rápido en el lugar (≈ 7 cuadros, desenfoque fuerte, frena sin rebote)
//  - "tapa"    algo cruza por delante del lente y lo tapa 3–4 cuadros (un paño, arena, la piel de la bestia): se sale en la toma nueva
//  - "sigue"   reencuadre continuo, sin transición
// Cada toma lo elige con { tr: "vuelo" | "barrido" | "tapa" | "sigue", col: "#c9a36a" } (cómo se ENTRA a esa toma). Sin `tr`, se decide
// por la distancia. Dentro de la toma la cámara entra ya en movimiento (recorrido lineal p → p1) y nunca queda quieta.
const V_ = (...a) => new THREE.Vector3(...a);
const bez3 = (p0, p1, p2, p3, e) => { const u = 1 - e; return p0.clone().multiplyScalar(u * u * u).add(p1.clone().multiplyScalar(3 * u * u * e)).add(p2.clone().multiplyScalar(3 * u * e * e)).add(p3.clone().multiplyScalar(e * e * e)) };
const TRINFO = new Map();
const trDe = (A, B) => { let r = TRINFO.get(B); if (r) return r; const ca = camAt(A, 1), cb = camAt(B, 0), d = V_(...ca.p).distanceTo(V_(...cb.p));
  const tipo = B.s.tr || (d < 7 ? "barrido" : "vuelo"), dur = tipo === "vuelo" ? cl(.3 + d / 160, .3, .85) : tipo === "barrido" ? .24 : tipo === "tapa" ? .3 : .5;
  r = { tipo, dur: Math.min(dur, (B.b - B.a) * .9, (A.b - A.a) * .9), d }; TRINFO.set(B, r); return r };
const enTransicion = t => { const k = tomaAt(t), T = TOMAS[k], N = TOMAS[k + 1];
  if (N) { const r = trDe(T, N); if (N.a - t < r.dur / 2) return [T, N, .5 - (N.a - t) / r.dur, r] }
  if (k > 0) { const r = trDe(TOMAS[k - 1], T); if (t - T.a < r.dur / 2) return [TOMAS[k - 1], T, .5 + (t - T.a) / r.dur, r] } return null };
window.SUBF = t => { const tr = enTransicion(t); return !tr ? 4 : tr[3].tipo === "barrido" ? 14 : tr[3].tipo === "tapa" ? 10 : 6 };
window.SHUTF = t => { const tr = enTransicion(t); return !tr ? .5 : tr[3].tipo === "barrido" ? 1 : .6 };
// altura del arco: pasa por encima de las casas (5), y más alto si el viaje es largo
const altura = (pa, pb) => { const d = pa.distanceTo(pb); if (d < 8) return d * .15; const pico = d < 30 ? 9 : d < 90 ? 16 : 30; return Math.max(d * .08, (pico - Math.min(pa.y, pb.y)) / .75, 0) };
let TEMBLOR = 0;   // lo pone la escena en los 1–2 golpes grandes (en unidades del mundo); decae sola en la escena
function camara(t) { const k = tomaAt(t), T = TOMAS[k], q = cl((t - T.a) / Math.max(.01, T.b - T.a)); const c = camAt(T, q);
  const mira = (p, l) => { MA.lookAt(p, l, V_(0, 1, 0)); return new THREE.Quaternion().setFromRotationMatrix(MA) };
  let pos = V_(...c.p), lk = V_(...c.l), fov = c.f, giro = 0; POST.tapa = null;
  const tr = enTransicion(t);
  if (tr) { const [A, B, u, r] = tr, ca = camAt(A, 1), cb = camAt(B, 0), pa = V_(...ca.p), pb = V_(...cb.p), la = V_(...ca.l), lb = V_(...cb.l);
    if (r.tipo === "vuelo") { const e = eIO(cl(u)), h = altura(pa, pb); pos = bez3(pa, pa.clone().add(V_(0, h, 0)), pb.clone().add(V_(0, h, 0)), pb, e); lk = la.clone().lerp(lb, eIO(cl(u * 1.25))); fov = lerp(ca.f, cb.f, e) + Math.sin(e * Math.PI) * 6 }
    else if (r.tipo === "sigue") { const e = eIO(cl(u)); pos = pa.clone().lerp(pb, e); lk = la.clone().lerp(lb, e); fov = lerp(ca.f, cb.f, e) }
    else if (r.tipo === "barrido") { const s = B.s.dir ?? ((k % 2) ? 1 : -1); if (u < .5) { pos = pa; lk = la; fov = ca.f; giro = -s * Math.pow(u / .5, 2) * 1.5 } else { pos = pb; lk = lb; fov = cb.f; giro = s * Math.pow(1 - (u - .5) / .5, 2.4) * 1.5 } }
    else { if (u < .5) { pos = pa; lk = la; fov = ca.f } else { pos = pb; lk = lb; fov = cb.f } POST.tapa = { u, col: B.s.col || "#b8905a", dir: B.s.dir ?? 1 } } }
  let quat = mira(pos, lk); if (giro) quat.premultiply(new THREE.Quaternion().setFromAxisAngle(V_(0, 1, 0), giro));
  // pulso de cámara: nunca clavada (temblor medido en Volze ≈ 0,19 % del ancho entre cuadros)
  const n1 = Math.sin(t * 5.3) + Math.sin(t * 8.1 + 1.3) * .6 + Math.sin(t * 13.7 + .4) * .3, n2 = Math.sin(t * 4.7 + 2) + Math.sin(t * 9.3 + .7) * .6 + Math.sin(t * 15.1) * .3;
  quat.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(n2 * .0011, n1 * .0011, 0)));
  const sk = (T.s.shake || 0) * .35 + TEMBLOR; if (sk) { pos.x += (Math.sin(t * 75) + Math.sin(t * 47 + 1) * .5) * sk; pos.y += Math.sin(t * 63 + 2) * sk * 1.2 }
  cam.position.copy(pos); cam.quaternion.copy(quat); if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix() } }
