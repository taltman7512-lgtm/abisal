//@@LUGAR
const LUGAR = L => (L >= I.dez && L <= I.night) ? "recuerdo" : "pueblo";

//@@SHOTS
const GW = (x, dy, z) => () => [x, ALT(x, z) + dy, z];
const KW = (k, o) => () => add(k.g.getWorldPosition(new THREE.Vector3()).toArray(), o);
const OW = (obj, o) => () => { obj.updateMatrixWorld(true); return obj.localToWorld(new THREE.Vector3(...o)).toArray() };
const SHOTS = {
  [I.rule]: [sh(0, [30, 14, 40], [22, 12, 30], [0, 6, -6], null, 52)],
  [I.cost]: [sh(0, [31, 14, 40], [23, 12, 30], [0, 6, -6], null, 52)],
  [I.today]: [sh(0, [32, 14, 40], [24, 12, 30], [0, 6, -6], null, 52)],
  [I.horn]: [sh(0, [33, 14, 40], [25, 12, 30], [0, 6, -6], null, 52)],
  [I.wed]: [sh(0, [34, 14, 40], [26, 12, 30], [0, 6, -6], null, 52)],
  [I.babies]: [sh(0, [35, 14, 40], [27, 12, 30], [0, 6, -6], null, 52)],
  [I.school]: [sh(0, [36, 14, 40], [28, 12, 30], [0, 6, -6], null, 52)],
  [I.roost]: [sh(0, [37, 14, 40], [29, 12, 30], [0, 6, -6], null, 52)],
  [I.ridge]: [sh(0, [38, 14, 40], [30, 12, 30], [0, 6, -6], null, 52)],
  [I.tall]: [sh(0, [39, 14, 40], [31, 12, 30], [0, 6, -6], null, 52)],
  [I.tusk]: [sh(0, [40, 14, 40], [32, 12, 30], [0, 6, -6], null, 52)],
  [I.sixty]: [sh(0, [41, 14, 40], [33, 12, 30], [0, 6, -6], null, 52)],
  [I.bee]: [sh(0, [42, 14, 40], [34, 12, 30], [0, 6, -6], null, 52)],
  [I.listen1]: [sh(0, [43, 14, 40], [35, 12, 30], [0, 6, -6], null, 52)],
  [I.listen2]: [sh(0, [44, 14, 40], [36, 12, 30], [0, 6, -6], null, 52)],
  [I.nobody]: [sh(0, [45, 14, 40], [37, 12, 30], [0, 6, -6], null, 52)],
  [I.dez]: [sh(0, [46, 14, 40], [38, 12, 30], [0, 6, -6], null, 52)],
  [I.note]: [sh(0, [47, 14, 40], [39, 12, 30], [0, 6, -6], null, 52)],
  [I.eleven]: [sh(0, [48, 14, 40], [40, 12, 30], [0, 6, -6], null, 52)],
  [I.nine]: [sh(0, [49, 14, 40], [41, 12, 30], [0, 6, -6], null, 52)],
  [I.night]: [sh(0, [50, 14, 40], [42, 12, 30], [0, 6, -6], null, 52)],
  [I.ponds]: [sh(0, [51, 14, 40], [43, 12, 30], [0, 6, -6], null, 52)],
  [I.sign]: [sh(0, [52, 14, 40], [44, 12, 30], [0, 6, -6], null, 52)],
  [I.storm]: [sh(0, [53, 14, 40], [45, 12, 30], [0, 6, -6], null, 52)],
  [I.orange]: [sh(0, [54, 14, 40], [46, 12, 30], [0, 6, -6], null, 52)],
  [I.goat]: [sh(0, [55, 14, 40], [47, 12, 30], [0, 6, -6], null, 52)],
  [I.scream]: [sh(0, [56, 14, 40], [48, 12, 30], [0, 6, -6], null, 52)],
  [I.forty]: [sh(0, [57, 14, 40], [49, 12, 30], [0, 6, -6], null, 52)],
  [I.louder]: [sh(0, [58, 14, 40], [50, 12, 30], [0, 6, -6], null, 52)],
  [I.climb]: [sh(0, [59, 14, 40], [51, 12, 30], [0, 6, -6], null, 52)],
  [I.mouth]: [sh(0, [60, 14, 40], [52, 12, 30], [0, 6, -6], null, 52)],
  [I.blew]: [sh(0, [61, 14, 40], [53, 12, 30], [0, 6, -6], null, 52)],
  [I.rolling]: [sh(0, [62, 14, 40], [54, 12, 30], [0, 6, -6], null, 52)],
  [I.turned]: [sh(0, [63, 14, 40], [55, 12, 30], [0, 6, -6], null, 52)],
  [I.one]: [sh(0, [64, 14, 40], [56, 12, 30], [0, 6, -6], null, 52)],
  [I.five]: [sh(0, [65, 14, 40], [57, 12, 30], [0, 6, -6], null, 52)],
  [I.shadow]: [sh(0, [66, 14, 40], [58, 12, 30], [0, 6, -6], null, 52)],
  [I.stayed]: [sh(0, [67, 14, 40], [59, 12, 30], [0, 6, -6], null, 52)],
  [I.trunk]: [sh(0, [68, 14, 40], [60, 12, 30], [0, 6, -6], null, 52)],
  [I.face]: [sh(0, [69, 14, 40], [61, 12, 30], [0, 6, -6], null, 52)],
  [I.stump]: [sh(0, [70, 14, 40], [62, 12, 30], [0, 6, -6], null, 52)],
  [I.same]: [sh(0, [71, 14, 40], [63, 12, 30], [0, 6, -6], null, 52)],
  [I.built]: [sh(0, [72, 14, 40], [64, 12, 30], [0, 6, -6], null, 52)],
  [I.cut]: [sh(0, [73, 14, 40], [65, 12, 30], [0, 6, -6], null, 52)],
  [I.pins]: [sh(0, [74, 14, 40], [66, 12, 30], [0, 6, -6], null, 52)],
  [I.caught]: [sh(0, [75, 14, 40], [67, 12, 30], [0, 6, -6], null, 52)],
  [I.eyes]: [sh(0, [76, 14, 40], [68, 12, 30], [0, 6, -6], null, 52)],
  [I.small]: [sh(0, [77, 14, 40], [69, 12, 30], [0, 6, -6], null, 52)],
  [I.found]: [sh(0, [78, 14, 40], [70, 12, 30], [0, 6, -6], null, 52)],
  [I.followed]: [sh(0, [79, 14, 40], [71, 12, 30], [0, 6, -6], null, 52)],
  [I.back]: [sh(0, [80, 14, 40], [72, 12, 30], [0, 6, -6], null, 52)],
  [I.life]: [sh(0, [81, 14, 40], [73, 12, 30], [0, 6, -6], null, 52)],
  [I.ours]: [sh(0, [82, 14, 40], [74, 12, 30], [0, 6, -6], null, 52)],
  [I.listen3]: [sh(0, [83, 14, 40], [75, 12, 30], [0, 6, -6], null, 52)],
  [I.heard]: [sh(0, [84, 14, 40], [76, 12, 30], [0, 6, -6], null, 52)],
};

//@@ESCENA
// ---------- la escena en cada instante
function setScene(t) {
  const L = lineAt(t), lt = t - s(L), len = (S[L + 1] ?? DUR) - s(L), k = P(lt, 0, len), Wd = kk => wt(L, kk);
  POST = { flash: 0, sepia: 0 };
  ALL.forEach(c => { if (c.polvo) c.polvo.forEach(q => q.visible = false); c.g.visible = false; c.g.scale.set(1, 1, 1); c.body.rotation.set(0, 0, 0); c.body.position.y = 0; c.head.rotation.set(0, 0, 0); power(c, null, 0); c.aura.visible = false; setFace(c, "neutral"); pose(c, t, {}) });
  [PALA, REGLA, TELESC, HOYO].forEach(o => o.visible = false);
  const lugar = LUGAR(L); setEnv("dia"); if (lugar === "recuerdo") POST.sepia = .42;
  tortuga(t, { paso: 0 }); LUCES.forEach(l => l.visible = false);
  let LL = [];
  placeW(ME, 0, 6, Math.PI); placeW(ME6, 2, 6, Math.PI);
  lights(LL); camara(t);
}
