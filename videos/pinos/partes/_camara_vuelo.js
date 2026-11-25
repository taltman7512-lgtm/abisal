// transiciones como en el Short de referencia (pedido del dueño, 25-nov-2026): la cámara VIAJA por el mundo de una toma a
// la otra en ≈ 0,8 s (no hay corte ni barrido abstracto): sube en arco por encima de los techos si están lejos, el punto
// donde mira se desliza de un lugar al otro y el desenfoque de movimiento hace el resto. Entre lugares distintos (adentro ↔
// afuera, recuerdo ↔ hoy) la cámara se mete volando hacia adelante en la toma vieja y sale desde atrás en la nueva.
const TR = .8;
const enTransicion = t => { const k = tomaAt(t), T = TOMAS[k], N = TOMAS[k + 1]; if (N && N.a - t < TR / 2) return [T, N, .5 - (N.a - t) / TR]; if (k > 0 && t - T.a < TR / 2) return [TOMAS[k - 1], T, .5 + (t - T.a) / TR]; return null };
window.SUBF = t => enTransicion(t) ? 12 : 3;
function camara(t) { const k = tomaAt(t), T = TOMAS[k], q = cl((t - T.a) / Math.max(.01, T.b - T.a)); let c = camAt(T, q);
  const mira = (p, l) => { MA.lookAt(p, l, new THREE.Vector3(0, 1, 0)); return new THREE.Quaternion().setFromRotationMatrix(MA) };
  let pos = new THREE.Vector3(...c.p), lk = new THREE.Vector3(...c.l), fov = c.f;
  const tr = enTransicion(t);
  if (tr) { const [A, B, u] = tr, ca = camAt(A, 1), cb = camAt(B, 0), e = eIO(cl(u));
    const pa = new THREE.Vector3(...ca.p), pb = new THREE.Vector3(...cb.p), la = new THREE.Vector3(...ca.l), lb = new THREE.Vector3(...cb.l);
    if (!B.corte && pa.distanceTo(pb) < 160) { const d = pa.distanceTo(pb), mid = pa.clone().add(pb).multiplyScalar(.5); mid.y += cl(d * .22, .5, 14);
      pos = pa.clone().multiplyScalar((1 - e) ** 2).add(mid.multiplyScalar(2 * (1 - e) * e)).add(pb.clone().multiplyScalar(e * e)); lk = la.clone().lerp(lb, e); fov = lerp(ca.f, cb.f, e) }
    else if (u < .5) { const w = (u / .5) ** 2, dir = la.clone().sub(pa).normalize(); pos = pa.clone().addScaledVector(dir, w * 7); lk = la.clone().addScaledVector(dir, w * 7); fov = ca.f + w * 10 }
    else { const w = (1 - (u - .5) / .5) ** 2, dir = lb.clone().sub(pb).normalize(); pos = pb.clone().addScaledVector(dir, -w * 7); lk = lb.clone().addScaledVector(dir, -w * 7); fov = cb.f + w * 10 } }
  let quat = mira(pos, lk);
  if (T.s.shake) { const a = T.s.shake; pos.x += Math.sin(t * 23) * a + Math.sin(t * 37) * a * .5; pos.y += Math.sin(t * 29 + 1) * a }
  pos.x += Math.sin(t * 1.3) * .015; pos.y += Math.sin(t * 1.7 + 1) * .012;   // cámara en mano, muy suave
  cam.position.copy(pos); cam.quaternion.copy(quat); if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix() } }
