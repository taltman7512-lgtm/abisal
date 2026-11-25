// transiciones reales (pedido del dueño, 25-nov-2026, v3): la cámara SE TRASLADA por el pueblo de una toma a la otra en
// ≈ 0,8 s y nunca atraviesa nada. Afuera sube por encima de los techos (y de los pinos si el viaje es largo), cruza y baja;
// adentro de la cabaña se desliza bajo el techo. Para entrar a la cabaña va hasta la ventana de afuera y entra por la
// ventana; para salir, sale por la ventana y se aleja de la casa por la calle.
const TR = .8;
const enTransicion = t => { const k = tomaAt(t), T = TOMAS[k], N = TOMAS[k + 1]; if (N && N.a - t < TR / 2) return [T, N, .5 - (N.a - t) / TR]; if (k > 0 && t - T.a < TR / 2) return [TOMAS[k - 1], T, .5 + (t - T.a) / TR]; return null };
window.SUBF = t => enTransicion(t) ? 12 : 3;
const V_ = (...a) => new THREE.Vector3(...a);
const bez3 = (p0, p1, p2, p3, e) => { const u = 1 - e; return p0.clone().multiplyScalar(u * u * u).add(p1.clone().multiplyScalar(3 * u * u * e)).add(p2.clone().multiplyScalar(3 * u * e * e)).add(p3.clone().multiplyScalar(e * e * e)) };
// la ventana de nuestra cabaña vista desde afuera (la más cercana a la calle) y su normal hacia afuera
const VENTANA = (() => { let v = null; return () => { if (v) return v; NUESTRA.g.updateMatrixWorld(true); let best = null;
  const n = V_(0, 0, 1).transformDirection(NUESTRA.g.matrixWorld).setY(0).normalize(); const meshes = []; NUESTRA.g.traverse(o => { if (o.isMesh && NUESTRA.panes.includes(o.material)) meshes.push(o) });
  meshes.forEach(o => { const p = o.getWorldPosition(V_()); const sc = p.clone().sub(NUESTRA.g.getWorldPosition(V_())).dot(n); if (!best || sc > best.sc) best = { p, sc } });
  const p = (best ? best.p : NUESTRA.g.localToWorld(V_(1.6, 2.4, 3.2))).add(V_(n.z, 0, -n.x).multiplyScalar(.3)).add(V_(0, .3, 0)); v = { p, n }; return v } })();
const VENT_IN = { p: V_(...IN([.75, 3.7, 5])), n: V_(0, 0, 1) };
const altura = (pa, pb, dentro) => { const d = pa.distanceTo(pb); if (dentro) return Math.min(.5, d * .12); if (d < 5) return d * .2; const pico = d < 25 ? 12 : d < 70 ? 20 : 32; return Math.max(d * .1, (pico - Math.min(pa.y, pb.y)) / .75) };
function viaje(pa, la, pb, lb, e, dentro) { const h = altura(pa, pb, dentro); return { pos: bez3(pa, pa.clone().add(V_(0, h, 0)), pb.clone().add(V_(0, h, 0)), pb, e), lk: la.clone().lerp(lb, e) } }
function camara(t) { const k = tomaAt(t), T = TOMAS[k], q = cl((t - T.a) / Math.max(.01, T.b - T.a)); let c = camAt(T, q);
  const mira = (p, l) => { MA.lookAt(p, l, V_(0, 1, 0)); return new THREE.Quaternion().setFromRotationMatrix(MA) };
  let pos = V_(...c.p), lk = V_(...c.l), fov = c.f;
  const tr = enTransicion(t);
  if (tr) { const [A, B, u] = tr, ca = camAt(A, 1), cb = camAt(B, 0), e = eIO(cl(u));
    const pa = V_(...ca.p), pb = V_(...cb.p), la = V_(...ca.l), lb = V_(...cb.l), dA = LUGAR(A.L) === "adentro", dB = LUGAR(B.L) === "adentro";
    if (dA === dB) { const v = viaje(pa, la, pb, lb, e, dA); pos = v.pos; lk = v.lk; fov = lerp(ca.f, cb.f, e) }
    else { const W = VENTANA(), afuera0 = W.p.clone().addScaledVector(W.n, 5).add(V_(0, .6, 0)), afuera1 = W.p.clone().addScaledVector(W.n, .35), dentro1 = VENT_IN.p.clone().addScaledVector(VENT_IN.n, -.4), dentro0 = VENT_IN.p.clone().addScaledVector(VENT_IN.n, -2.6);
      const adentroDe = W.p.clone().addScaledVector(W.n, -3), haciaAdentro = VENT_IN.p.clone().addScaledVector(VENT_IN.n, -5), haciaAfuera = VENT_IN.p.clone().addScaledVector(VENT_IN.n, 3), afueraDe = W.p.clone().addScaledVector(W.n, 6);
      if (!dA) { // de afuera hacia adentro: viaja hasta la ventana, se acerca al vidrio y aparece adentro, alejándose de la ventana
        if (u < .5) { const w = u / .5; if (w < .7) { const v = viaje(pa, la, afuera0, adentroDe, eIO(w / .7), false); pos = v.pos; lk = v.lk } else { const z = eIO((w - .7) / .3); pos = afuera0.clone().lerp(afuera1, z); lk = adentroDe } fov = lerp(ca.f, 56, w) }
        else { const w = (u - .5) / .5; if (w < .3) { pos = dentro1.clone().lerp(dentro0, eOut(w / .3)); lk = haciaAdentro } else { const v = viaje(dentro0, haciaAdentro, pb, lb, eIO((w - .3) / .7), true); pos = v.pos; lk = v.lk } fov = lerp(56, cb.f, w) } }
      else { // de adentro hacia afuera: va hasta la ventana de adentro, sale por el vidrio y se aleja de la casa
        if (u < .5) { const w = u / .5; if (w < .7) { const v = viaje(pa, la, dentro0, haciaAfuera, eIO(w / .7), true); pos = v.pos; lk = v.lk } else { const z = eIO((w - .7) / .3); pos = dentro0.clone().lerp(dentro1, z); lk = haciaAfuera } fov = lerp(ca.f, 56, w) }
        else { const w = (u - .5) / .5; if (w < .3) { pos = afuera1.clone().lerp(afuera0, eOut(w / .3)); lk = afueraDe } else { const v = viaje(afuera0, afueraDe, pb, lb, eIO((w - .3) / .7), false); pos = v.pos; lk = v.lk } fov = lerp(56, cb.f, w) } } } }
  let quat = mira(pos, lk);
  if (T.s.shake) { const a = T.s.shake; pos.x += Math.sin(t * 23) * a + Math.sin(t * 37) * a * .5; pos.y += Math.sin(t * 29 + 1) * a }
  pos.x += Math.sin(t * 1.3) * .015; pos.y += Math.sin(t * 1.7 + 1) * .012;   // cámara en mano, muy suave
  cam.position.copy(pos); cam.quaternion.copy(quat); if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix() } }
