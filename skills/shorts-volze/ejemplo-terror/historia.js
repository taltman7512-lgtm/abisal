// ★ HISTORIA "Nobody Lights A Third Lamp" — estilo Volze, modo terror ocre (reglas medidas en analisis/informe.md)
// Hollow Fen: cada casa tiene dos lámparas; si se enciende una tercera, la Polilla se lleva la casa entera.
// Contada en primera persona por el chico que recorta las mechas. Personajes propios de bloques (no los de Volze, sin marcas).
const dummy = new THREE.Object3D(), V = new THREE.Vector3(), V2 = new THREE.Vector3();
const place = (k, x, z, ry = 0, y = 0) => { k.g.visible = true; k.g.position.set(x, y, z); k.g.rotation.set(0, ry, 0) };
const faceTo = (k, x, z) => k.g.rotation.y = Math.atan2(x - k.g.position.x, z - k.g.position.z);
const AMBER = "#ffc480", DUSTC = "#ffd27a", FIREF = "#d6ff72";

// ---------- subtítulos con los tiempos reales de cada palabra (whisper) y el texto del guion
{ const PAL = await fetch("palabras.json").then(r => r.json()); WORDS.length = 0;
  PAL.forEach((ws0, i) => { const ws = []; ws0.forEach(w => { if (w[0].startsWith("-") && ws.length) { ws[ws.length - 1][0] += w[0]; ws[ws.length - 1][2] = w[2] } else ws.push([...w]) });
    const gui = LINES[i].split(" "); if (gui.length === ws.length) ws.forEach((w, k) => w[0] = gui[k]);
    ws.forEach(([w, a]) => WORDS.push([S[i] + a, w])); const fin = e(i), sig = S[i + 1] ?? DUR; if (sig - fin > .45) WORDS.push([fin + .2, ""]) });
  window.PAL = PAL; }
const wt = (L, k) => S[L] + (window.PAL[L][Math.min(k, window.PAL[L].length - 1)]?.[1] ?? 0);   // tiempo de la palabra k de la frase L

// ---------- texturas con aspecto real (adoquín, revoque con vigas, tejas, piedra, tierra, pantano)
const T_COB = tex(1024, 1024, (g, w, h) => { const r = rng(5); g.fillStyle = "#1f1a16"; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h + 30; y += 30) for (let x = (y / 30 % 2) * 17; x < w + 34; x += 34) { const v = 62 + r() * 46 | 0, rx = 14 + r() * 3, ry = 12 + r() * 2;
    g.fillStyle = `rgb(${v + 10},${v + 2},${v - 8})`; g.beginPath(); g.ellipse(x + (r() - .5) * 4, y + (r() - .5) * 4, rx, ry, r() * .6, 0, 7); g.fill();
    g.fillStyle = "rgba(255,225,180,.09)"; g.beginPath(); g.ellipse(x - 4, y - 4, rx * .55, ry * .4, 0, 0, 7); g.fill() }
  for (let k = 0; k < 2200; k++) { g.fillStyle = r() < .5 ? "rgba(0,0,0,.18)" : "rgba(160,140,110,.08)"; g.fillRect(r() * w, r() * h, 2, 2) } }, [6, 40]);
const T_TIMBER = (seed, base) => tex(512, 512, (g, w, h) => { const r = rng(seed); g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let k = 0; k < 900; k++) { g.fillStyle = r() < .5 ? "rgba(60,40,20,.07)" : "rgba(255,240,210,.06)"; g.beginPath(); g.arc(r() * w, r() * h, 3 + r() * 18, 0, 7); g.fill() }
  for (let k = 0; k < 14; k++) { const x = r() * w; const gr = g.createLinearGradient(0, h * .55, 0, h); gr.addColorStop(0, "rgba(40,28,16,0)"); gr.addColorStop(1, "rgba(40,28,16,.22)"); g.fillStyle = gr; g.fillRect(x, h * .55, 6 + r() * 20, h * .45) }
  const beam = (x0, y0, x1, y1, wd = 22) => { g.strokeStyle = "#3a2618"; g.lineWidth = wd; g.lineCap = "butt"; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.strokeStyle = "rgba(255,220,170,.10)"; g.lineWidth = 3; g.beginPath(); g.moveTo(x0 + 6, y0); g.lineTo(x1 + 6, y1); g.stroke() };
  beam(11, 0, 11, h); beam(w - 11, 0, w - 11, h); beam(w / 2, 0, w / 2, h, 18); beam(0, 11, w, 11); beam(0, h * .5, w, h * .5, 18); beam(0, h - 11, w, h - 11);
  beam(20, h * .5, w / 2 - 10, 18, 14); beam(w - 20, h * .5, w / 2 + 10, 18, 14) });
const T_PLANK = tex(256, 512, (g, w, h) => { const r = rng(7); for (let x = 0; x < w; x += 32) { const v = 70 + r() * 30 | 0; g.fillStyle = `rgb(${v + 18},${v},${v - 18})`; g.fillRect(x, 0, 31, h); g.strokeStyle = "rgba(0,0,0,.25)"; for (let k = 0; k < 6; k++) { g.lineWidth = 1 + r() * 2; g.beginPath(); const xx = x + 4 + r() * 24; g.moveTo(xx, 0); g.bezierCurveTo(xx + 6, h * .3, xx - 6, h * .6, xx + 2, h); g.stroke() } g.fillStyle = "rgba(0,0,0,.5)"; g.fillRect(x + 31, 0, 2, h) } });
const T_SHINGLE = tex(512, 512, (g, w, h) => { const r = rng(9); g.fillStyle = "#1e1a18"; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 24) for (let x = (y / 24 % 2) * 16 - 16; x < w; x += 32) { const v = 52 + r() * 34 | 0; g.fillStyle = `rgb(${v + 6},${v},${v - 4})`; g.fillRect(x + 1, y, 30, 22); g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(x + 1, y + 18, 30, 4); if (r() < .12) { g.fillStyle = "rgba(90,110,50,.35)"; g.fillRect(x + 1, y + 10, 30, 12) } } }, [3, 3]);
const T_STONE = tex(512, 512, (g, w, h) => { const r = rng(13); g.fillStyle = "#2a2622"; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 40) for (let x = (y / 40 % 2) * 36 - 36; x < w; x += 72) { const v = 88 + r() * 40 | 0; g.fillStyle = `rgb(${v + 6},${v},${v - 10})`; g.beginPath(); g.roundRect(x + 3, y + 3, 66 + r() * 4, 34, 6); g.fill(); g.fillStyle = "rgba(0,0,0,.12)"; for (let k = 0; k < 6; k++) g.fillRect(x + 6 + r() * 56, y + 6 + r() * 26, 3, 3) } }, [2, 2]);
const T_DIRT = tex(512, 512, (g, w, h) => { const r = rng(17); g.fillStyle = "#8a7356"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 10) { g.strokeStyle = y % 20 ? "rgba(60,45,30,.25)" : "rgba(255,240,210,.12)"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, y + r() * 3); for (let x = 0; x < w; x += 32) g.lineTo(x, y + r() * 4); g.stroke() } });
const T_GROUND = tex(1024, 1024, (g, w, h) => { const r = rng(21); g.fillStyle = "#2c2a1c"; g.fillRect(0, 0, w, h); for (let k = 0; k < 7000; k++) { const v = r(); g.strokeStyle = v < .4 ? "rgba(70,72,40,.5)" : v < .75 ? "rgba(40,34,22,.6)" : "rgba(120,100,60,.3)"; g.lineWidth = 2; const x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 6, y - 6 - r() * 8); g.stroke() } }, [50, 50]);
const T_PISO = tex(512, 512, (g, w, h) => { const r = rng(23); for (let y = 0; y < h; y += 42) { const v = 80 + r() * 26 | 0; g.fillStyle = `rgb(${v + 30},${v + 8},${v - 16})`; g.fillRect(0, y, w, 40); g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(0, y + 40, w, 2); for (let k = 0; k < 5; k++) { g.strokeStyle = "rgba(0,0,0,.12)"; g.beginPath(); g.moveTo(0, y + 6 + r() * 30); g.lineTo(w, y + 6 + r() * 30); g.stroke() } } }, [3, 3]);
const T_WALLIN = tex(512, 512, (g, w, h) => { const r = rng(29); g.fillStyle = "#8f7356"; g.fillRect(0, 0, w, h); for (let k = 0; k < 600; k++) { g.fillStyle = r() < .5 ? "rgba(50,35,20,.08)" : "rgba(255,230,190,.06)"; g.beginPath(); g.arc(r() * w, r() * h, 4 + r() * 22, 0, 7); g.fill() } g.fillStyle = "#4a3222"; g.fillRect(0, h - 40, w, 40) });
const T_QUILT = tex(512, 512, (g, w, h) => { const r = rng(31), cs = ["#7a3b32", "#b08a4a", "#3f5a6a", "#d9c7a0", "#5f6b3a"]; for (let y = 0; y < h; y += 64) for (let x = 0; x < w; x += 64) { g.fillStyle = cs[r() * 5 | 0]; g.fillRect(x, y, 64, 64); g.strokeStyle = "rgba(255,240,210,.35)"; g.setLineDash([4, 5]); g.strokeRect(x + 4, y + 4, 56, 56); g.setLineDash([]) } });
const T_WELLSIGN = tex(1024, 400, (g, w, h) => { g.fillStyle = "rgba(0,0,0,0)"; g.clearRect(0, 0, w, h); g.font = "800 150px 'Special Elite'"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#efe6d2";
  g.fillText("TWO LAMPS.", w / 2, 120); g.fillText("ALWAYS.", w / 2, 290); const r = rng(3); for (let k = 0; k < 22; k++) { const x = 120 + r() * 780, y = 170 + (k % 2) * 170; g.fillRect(x, y, 5, 18 + r() * 50) } });
const T_CANDLESIGN = tex(1024, 300, (g, w, h) => { g.fillStyle = "#2e2218"; g.fillRect(0, 0, w, h); g.strokeStyle = "#b08a4a"; g.lineWidth = 12; g.strokeRect(14, 14, w - 28, h - 28); g.font = "800 150px 'Special Elite'"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#d9b36a"; g.fillText("CANDLES", w / 2, h / 2 + 8) });
const T_CLOSED = tex(512, 220, (g, w, h) => { g.fillStyle = "#d9cdb2"; g.fillRect(0, 0, w, h); g.font = "800 110px 'Special Elite'"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#5a2a1e"; g.fillText("CLOSED", w / 2, h / 2 + 6) });

// ---------- materiales
const SMt = (map, o = {}) => new THREE.MeshStandardMaterial({ map, roughness: .9, ...o });
const M_COB = SMt(T_COB, { roughness: .55, bumpMap: T_COB, bumpScale: 2.5 });
const M_SHING = SMt(T_SHINGLE, { bumpMap: T_SHINGLE, bumpScale: 2 });
const M_STONE = SMt(T_STONE, { bumpMap: T_STONE, bumpScale: 2 });
const M_PLANK = SMt(T_PLANK, { bumpMap: T_PLANK, bumpScale: 1.5 });
const M_DIRT = SMt(T_DIRT, { bumpMap: T_DIRT, bumpScale: 1 });
const M_BEAM = SM("#3a2618", { roughness: .85 });
const WALLC = ["#b8a184", "#a89276", "#c2ab8a", "#9f8a70", "#b39a7c"];
const M_WALL = WALLC.map((c, i) => SMt(T_TIMBER(40 + i, c), { bumpMap: T_TIMBER(40 + i, c), bumpScale: 1.2 }));
const M_GABLE = WALLC.map(c => SM(c, { roughness: .95 }));
const M_WIN = () => new THREE.MeshStandardMaterial({ color: "#2a1d12", emissive: AMBER, emissiveIntensity: 1.6, roughness: .4 });
const M_GLASS = new THREE.MeshStandardMaterial({ color: "#ffe2a8", transparent: true, opacity: .1, roughness: .05, emissive: "#ffb24a", emissiveIntensity: .06, depthWrite: false });

// ---------- casas (frente = +z local). En la calle: lado -1 a la izquierda (x = -8,5, mira a +x), lado +1 a la derecha (x = 8,5, mira a -x)
// muro con huecos (ventanas y puerta de verdad, para ver adentro): se arma con franjas verticales
function wallHoles(par, Wd, Hh, th, holes, mat, z) {
  const xs = [-Wd / 2, Wd / 2]; holes.forEach(h => xs.push(h.x - h.w / 2, h.x + h.w / 2)); xs.sort((a, b) => a - b);
  for (let i = 0; i < xs.length - 1; i++) { const a = xs[i], b = xs[i + 1], cx = (a + b) / 2, w = b - a; if (w < .01) continue;
    const hh = holes.find(h => cx > h.x - h.w / 2 && cx < h.x + h.w / 2);
    const box = (y0, y1) => { if (y1 - y0 < .01) return; const m = part(new THREE.BoxGeometry(w, y1 - y0, th), mat, cx, (y0 + y1) / 2, z, par, 0); m.material.map && (m.geometry = boxUV(m.geometry, w, y1 - y0, cx, (y0 + y1) / 2, Wd, Hh)) };
    if (!hh) box(0, Hh); else { box(0, hh.y - hh.h / 2); box(hh.y + hh.h / 2, Hh) } }
  holes.forEach(h => { for (const [x, y, w, hh] of [[h.x, h.y + h.h / 2 + .08, h.w + .3, .16], [h.x, h.y - h.h / 2 - .08, h.w + .4, .16], [h.x - h.w / 2 - .08, h.y, .16, h.h], [h.x + h.w / 2 + .08, h.y, .16, h.h]]) part(new THREE.BoxGeometry(w, hh, th + .12), M_BEAM, x, y, z, par, 0) });
}
function boxUV(geo, w, h, cx, cy, Wd, Hh) { const uv = geo.attributes.uv, p = geo.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (p.getX(i) + cx + Wd / 2) / Wd, (p.getY(i) + cy) / Hh); uv.needsUpdate = true; return geo }
const HOUSES = [];
function house(x, z, side, o = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2; scene.add(g);
  const Wd = o.w ?? 7, Dp = 6, Hh = o.h ?? 5.4, rh = o.rh ?? 2.8, v = o.v ?? 0, wm = M_WALL[v % 5], th = .3;
  const H = { g, x, z, side, walls: [], roof: new THREE.Group(), porch: null, panes: [], glows: [], holes: !!o.holes, Hh, Wd };
  const W4 = [0, 1, 2, 3].map(() => { const q = new THREE.Group(); g.add(q); H.walls.push(q); return q });
  const holes = o.holes || [];
  if (holes.length) { wallHoles(W4[0], Wd, Hh, th, holes, wm, Dp / 2 - th / 2); holes.filter(h => h.h < 2.5).forEach(h => { const m = new THREE.Mesh(new THREE.PlaneGeometry(h.w, h.h), M_GLASS); m.position.set(h.x, h.y, Dp / 2 - .05); W4[0].add(m); const gl = glowSprite(AMBER, 1.6); gl.material.opacity = .3; W4[0].add(gl); gl.position.set(h.x, h.y, Dp / 2 + .4); H.glows.push(gl) }) } else { const m = part(new THREE.BoxGeometry(Wd, Hh, th), wm, 0, Hh / 2, Dp / 2 - th / 2, W4[0], 0) }
  part(new THREE.BoxGeometry(Wd, Hh, th), wm, 0, Hh / 2, -Dp / 2 + th / 2, W4[1], 0);
  for (const [q, sx] of [[W4[2], -1], [W4[3], 1]]) { const m = part(new THREE.BoxGeometry(th, Hh, Dp), wm, sx * (Wd / 2 - th / 2), Hh / 2, 0, q, 0) }
  part(new THREE.BoxGeometry(Wd + .2, .35, Dp + .2), M_STONE, 0, .17, 0, W4[1], 0);                                         // zócalo de piedra
  // techo a dos aguas con tejas + hastiales
  g.add(H.roof); H.roof.position.y = Hh; const half = Dp / 2 + .55, sl = Math.hypot(half, rh), ang = Math.atan2(rh, half);
  for (const s of [-1, 1]) { const m = part(new THREE.BoxGeometry(Wd + .9, .22, sl), M_SHING, 0, rh / 2, s * half / 2, H.roof, 0); m.rotation.x = s * ang }
  part(new THREE.BoxGeometry(Wd + 1, .3, .3), M_BEAM, 0, rh + .05, 0, H.roof, 0);
  for (const s of [-1, 1]) { const sh = new THREE.Shape(); sh.moveTo(-Wd / 2, 0); sh.lineTo(0, rh - .05); sh.lineTo(Wd / 2, 0); sh.closePath(); const m = part(new THREE.ShapeGeometry(sh), M_GABLE[v % 5], 0, 0, s * (Dp / 2 - .02), H.roof, 0); if (s < 0) m.rotation.y = Math.PI }
  part(new THREE.BoxGeometry(.9, 2.2, .9), M_STONE, Wd * .28, rh * .55 + .6, -.8, H.roof, 0);                               // chimenea
  // puerta (si no tiene hueco de puerta) y ventanas con dos lámparas
  if (!holes.length) { part(new THREE.BoxGeometry(1.3, 2.6, .12), M_PLANK, o.door ?? 0, 1.3, Dp / 2 + .02, W4[0], 0); part(new THREE.BoxGeometry(1.6, .18, .3), M_BEAM, o.door ?? 0, 2.7, Dp / 2 + .05, W4[0], 0)
    for (const wx of o.wins ?? [-2.1, 2.1]) { const pm = M_WIN(); part(new THREE.BoxGeometry(1.2, 1.4, .1), pm, wx, 2.5, Dp / 2 + .01, W4[0], 0); H.panes.push(pm);
      for (const [a, b, w, h] of [[0, 3.28, 1.5, .18], [0, 1.72, 1.6, .18], [-.68, 2.5, .16, 1.6], [.68, 2.5, .16, 1.6], [0, 2.5, .07, 1.4], [0, 2.5, 1.2, .07]]) part(new THREE.BoxGeometry(w, h, .16), M_BEAM, wx + a, b, Dp / 2 + .03, W4[0], 0);
      const gl = glowSprite(AMBER, 3.2); gl.material.opacity = .55; W4[0].add(gl); gl.position.set(wx, 2.5, Dp / 2 + .4); H.glows.push(gl) } }
  if (o.attic) { const pm = M_WIN(); pm.emissiveIntensity = 0; const m = part(new THREE.CircleGeometry(.5, 24), pm, 0, rh * .42, Dp / 2 + .03, H.roof, 0); part(new THREE.TorusGeometry(.52, .08, 8, 24), M_BEAM, 0, rh * .42, Dp / 2 + .05, H.roof, 0); H.attic = pm; const gl = glowSprite(AMBER, 0); H.roof.add(gl); gl.position.set(0, rh * .42, Dp / 2 + .5); H.atticGlow = gl }
  HOUSES.push(H); return H;
}
// calle
const ZS = [6, -2, -10, -18, -26, -34, -42];
const GROUND = part(new THREE.PlaneGeometry(400, 400), SMt(T_GROUND, { roughness: 1 }), 0, -.02, -40, scene, 0); GROUND.rotation.x = -Math.PI / 2;
{ const m = part(new THREE.PlaneGeometry(11, 76), M_COB, 0, .005, -21, scene, 0); m.rotation.x = -Math.PI / 2 }
const SQUARES = {};
function square(x, z, side) { const m = part(new THREE.PlaneGeometry(7.4, 6.4), M_DIRT, x, .015, z, scene, 0); m.rotation.x = -Math.PI / 2; m.rotation.z = side < 0 ? Math.PI / 2 : -Math.PI / 2; for (const s of [-1, 1]) for (const t of [-1, 1]) part(new THREE.BoxGeometry(.18, .5, .18), M_BEAM, x + s * 3.3, .25, z + t * 3.6, scene, 0); return m }
// lado izquierdo: Brannock (6), velas (-2), -10, cuadrado (-18), -26, -34, cuadrado (-42) · lado derecho: nosotros (6), -2, la casa del gancho (-10), -18, cuadrado (-26), -34, -42
const BRAN = house(-8.5, 6, -1, { v: 2, holes: [{ x: -1.2, y: 2.45, w: 1.7, h: 1.7 }, { x: 1.6, y: 1.5, w: 1.4, h: 3 }] });
const SHOP = house(-8.5, -2, -1, { v: 4, h: 5.8 });
house(-8.5, -10, -1, { v: 1, h: 5 }); SQUARES.l18 = square(-8.5, -18, -1); house(-8.5, -26, -1, { v: 3, h: 6 }); house(-8.5, -34, -1, { v: 0, h: 5.2 }); SQUARES.l42 = square(-8.5, -42, -1);
const OURS = house(8.5, 6, 1, { v: 0, h: 5.6, holes: [{ x: 1.2, y: 2.45, w: 1.7, h: 1.7 }, { x: -1.6, y: 1.5, w: 1.4, h: 3 }] });
house(8.5, -2, 1, { v: 3, h: 5.2 }); const HOOK = house(8.5, -10, 1, { v: 1, h: 5.6, attic: true }); SQUARES.r10 = square(8.5, -10, 1);
house(8.5, -18, 1, { v: 4, h: 5 }); SQUARES.r26 = square(8.5, -26, 1); house(8.5, -34, 1, { v: 2, h: 5.6 }); house(8.5, -42, 1, { v: 0, h: 5 });
// segunda fila (para el plano aéreo de los "doce cuadrados")
[[-22, 1, [0, 0, 1, 0, 1, 0, 0]], [22, -1, [1, 0, 0, 1, 0, 0, 1]]].forEach(([x, sd, gaps]) => ZS.forEach((z, i) => { if (gaps[i]) square(x, z, sd); else house(x, z, sd, { v: (i + 2) % 5, h: 5 + (i % 3) * .4 }) }));
[[-8.5, 14, -1], [8.5, 14, 1], [-22, 14, 1], [22, 14, -1]].forEach(([x, z, sd], i) => i % 2 ? square(x, z, sd) : house(x, z, sd, { v: i, h: 5 }));
// ---------- utilería del pueblo (diferencia 3 contra el canal: sus calles están llenas de objetos; la nuestra estaba vacía)
{ const r = rng(301), libre = (x, z) => !((x > 0 && z > 2.6 && z < 7.4) || (x < 0 && z > 3 && z < 6) || (x > 0 && z > -3.4 && z < .2) || Math.abs(z - 14) < 2.6);
  const M_HOOP = SM("#2a2622", { metalness: .6, roughness: .45 });
  // barriles con zunchos y cajones (instanciados)
  const NB = 34, NC = 40, bar = new THREE.InstancedMesh(new THREE.CylinderGeometry(.42, .38, 1.1, 14), M_PLANK, NB), hoop = new THREE.InstancedMesh(new THREE.TorusGeometry(.43, .035, 6, 18), M_HOOP, NB * 2), cra = new THREE.InstancedMesh(new THREE.BoxGeometry(.9, .8, .9), M_PLANK, NC);
  [bar, hoop, cra].forEach(m => { m.castShadow = m.receiveShadow = true; scene.add(m) }); let ib = 0, ic = 0;
  const putB = (x, z, s = 1) => { if (ib >= NB) return; dummy.position.set(x, .55 * s, z); dummy.rotation.set(0, r() * 6, 0); dummy.scale.setScalar(s); dummy.updateMatrix(); bar.setMatrixAt(ib, dummy.matrix); for (const y of [-.32, .32]) { dummy.position.set(x, (.55 + y) * s, z); dummy.rotation.set(Math.PI / 2, 0, 0); dummy.updateMatrix(); hoop.setMatrixAt(ib * 2 + (y > 0), dummy.matrix) } ib++ };
  const putC = (x, y, z, s = 1) => { if (ic >= NC) return; dummy.position.set(x, y + .4 * s, z); dummy.rotation.set(0, (r() - .5) * .6, 0); dummy.scale.setScalar(s); dummy.updateMatrix(); cra.setMatrixAt(ic++, dummy.matrix) };
  for (const sd of [-1, 1]) for (let z = 12; z > -46; z -= 1.6 + r() * 2.2) { const x = sd * (4.7 + r() * .5); if (!libre(x, z)) continue; const k = r(); if (k < .35) { putB(x, z); if (r() < .4) putB(x - sd * .2, z + .9, .9) } else if (k < .65) { putC(x, 0, z); if (r() < .5) putC(x, .8, z + (r() - .5) * .2, .85) } }
  [bar, hoop, cra].forEach(m => { m.count = m === bar ? ib : m === hoop ? ib * 2 : ic; m.instanceMatrix.needsUpdate = true });
  // tarimas de madera frente a cada casa (sobre la calle) y escalón en la puerta
  for (const sd of [-1, 1]) for (const z of ZS) { if ((sd < 0 && [-18, -42].includes(z)) || (sd > 0 && [-26].includes(z))) continue; const m = part(new THREE.BoxGeometry(1.1, .16, 7), M_PLANK, sd * 5.0, .08, z, scene, 0) }
  // farolas de hierro APAGADAS (en Hollow Fen no se prende nada más que las dos lámparas de cada casa)
  for (const z of [10, -6, -22, -38]) for (const sd of [-1, 1]) { const g = new THREE.Group(); g.position.set(sd * 4.4, 0, z + sd * 2); scene.add(g); part(new THREE.CylinderGeometry(.07, .1, 3.6, 8), M_HOOP, 0, 1.8, 0, g, 0); part(new THREE.BoxGeometry(.06, .06, .7), M_HOOP, 0, 3.55, -sd * .3, g, 0);
    const c = new THREE.Group(); c.position.set(0, 3.2, -sd * .6); g.add(c); for (const [x, zz] of [[-.13, -.13], [.13, -.13], [-.13, .13], [.13, .13]]) part(new THREE.BoxGeometry(.025, .4, .025), M_HOOP, x, 0, zz, c, 0); part(new THREE.ConeGeometry(.24, .2, 4), M_HOOP, 0, .3, 0, c, 0).rotation.y = Math.PI / 4; const gl = new THREE.Mesh(new THREE.BoxGeometry(.24, .36, .24), new THREE.MeshStandardMaterial({ color: "#3a3430", roughness: .2, transparent: true, opacity: .5 })); c.add(gl) }
  // carteles de oficio colgados (cuentan que es un pueblo vivo)
  [["BAKER", 8.5, -18, 1], ["TAILOR", -8.5, -26, -1], ["SMITH", 8.5, -34, 1]].forEach(([t, x, z, sd]) => { const g = new THREE.Group(); g.position.set(x - sd * 3.4, 3.6, z + 2.2); scene.add(g); part(new THREE.BoxGeometry(.9, .07, .07), M_BEAM, sd * -.0, .45, 0, g, 0).rotation.y = Math.PI / 2;
    const s = part(new THREE.PlaneGeometry(1.4, .5), SMt(tex(512, 180, (c, w, h) => { c.fillStyle = "#3a2618"; c.fillRect(0, 0, w, h); c.strokeStyle = "#a88a5a"; c.lineWidth = 8; c.strokeRect(8, 8, w - 16, h - 16); c.font = "800 92px 'Special Elite'"; c.fillStyle = "#d9c08a"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(t, w / 2, h / 2 + 6) })), 0, 0, 0, g, 0); s.rotation.y = Math.PI / 2; s.material.side = THREE.DoubleSide });
  // leña, sacos y un carro
  const sack = SM("#8a7a5a", { roughness: 1 }); [[-4.9, 1.2], [-5.1, 1.9], [4.9, -12.4], [5.1, -13.2], [-4.8, -29]].forEach(([x, z]) => { const m = part(new THREE.SphereGeometry(.42, 12, 10), sack, x, .36, z, scene, 0); m.scale.set(1, .85, .8) });
  for (const [x, z] of [[-5, -8.5], [5, -20.5]]) for (let k = 0; k < 9; k++) { const m = part(new THREE.CylinderGeometry(.13, .13, 1.4, 8), SM("#6a4a2e"), x + (k % 3 - 1) * .27, .14 + Math.floor(k / 3) * .25, z, scene, 0); m.rotation.x = Math.PI / 2 }
  const cart = new THREE.Group(); cart.position.set(-3.6, 0, -15); cart.rotation.y = .3; scene.add(cart); part(new THREE.BoxGeometry(1.6, .5, 2.6), M_PLANK, 0, 1.0, 0, cart, 0); for (const s of [-1, 1]) { const w = part(new THREE.TorusGeometry(.55, .09, 8, 16), M_BEAM, s * .9, .55, .3, cart, 0); w.rotation.y = Math.PI / 2 } part(new THREE.BoxGeometry(.1, .1, 2.2), M_BEAM, -.4, .9, 2.2, cart, 0); part(new THREE.BoxGeometry(.1, .1, 2.2), M_BEAM, .4, .9, 2.2, cart, 0);
  // barandas en los cuadrados vacíos (como un lugar que se cuida y se evita)
  Object.values(SQUARES).forEach(sq => { const x = sq.position.x, z = sq.position.z; for (const s of [-1, 1]) { part(new THREE.BoxGeometry(.08, .08, 7.2), M_BEAM, x + s * 3.3, .42, z, scene, 0); part(new THREE.BoxGeometry(6.6, .08, .08), M_BEAM, x, .42, z + s * 3.6, scene, 0) } });
  // charcos y piedras sueltas en la calle
  const pud = new THREE.MeshStandardMaterial({ color: "#1a1612", roughness: .05, metalness: .6 }); [[1.2, -4], [-2.4, -12], [2.8, -28], [-1.0, 9]].forEach(([x, z], i) => { const m = part(new THREE.CircleGeometry(.8 + i * .2, 20), pud, x, .012, z, scene, 0); m.rotation.x = -Math.PI / 2; m.scale.set(1.6, 1, 1) });
  const st = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.12), SM("#5a544c", { roughness: 1 }), 160); scene.add(st); for (let i = 0; i < 160; i++) { dummy.position.set((r() - .5) * 11, .05, 14 - r() * 60); dummy.rotation.set(r() * 3, r() * 3, 0); dummy.scale.setScalar(.5 + r()); dummy.updateMatrix(); st.setMatrixAt(i, dummy.matrix) } }
// cartel de la vela (negocio cerrado)
const SHOPSIGN = new THREE.Group(); scene.add(SHOPSIGN); SHOPSIGN.position.set(-5.1, 3.9, -2); part(new THREE.BoxGeometry(.08, .08, 1.6), M_BEAM, .2, .55, 0, SHOPSIGN, 0);
{ const m = part(new THREE.PlaneGeometry(1.9, .56), SMt(T_CANDLESIGN), .25, 0, 0, SHOPSIGN, 0); m.rotation.y = Math.PI / 2; const c = part(new THREE.PlaneGeometry(.9, .39), SMt(T_CLOSED), .07, -1.5, -1.6, SHOPSIGN, 0); c.rotation.y = Math.PI / 2; c.rotation.z = .08 }
// el pozo con el cartel pintado
const WELL = new THREE.Group(); scene.add(WELL); WELL.position.set(0, 0, 14);
{ const ring = new THREE.LatheGeometry([[1.25, 0], [1.3, .05], [1.3, 1.15], [1.38, 1.2], [1.38, 1.32], [1.05, 1.32], [1.05, .2]].map(([a, b]) => new THREE.Vector2(a, b)), 40); const m = part(ring, M_STONE, 0, 0, 0, WELL, 0); m.material = M_STONE;
  for (const s of [-1, 1]) part(new THREE.BoxGeometry(.2, 2.6, .2), M_BEAM, s * 1.15, 2.3, 0, WELL, 0); part(new THREE.CylinderGeometry(.09, .09, 2.6, 8), M_BEAM, 0, 3.2, 0, WELL, 0).rotation.z = Math.PI / 2;
  for (const s of [-1, 1]) { const m = part(new THREE.BoxGeometry(3.1, .14, 1.6), M_SHING, 0, 3.75, s * .62, WELL, 0); m.rotation.x = s * .62 }
  const bu = part(new THREE.CylinderGeometry(.22, .18, .36, 12), M_PLANK, 0, 2.2, 0, WELL, 0); part(new THREE.CylinderGeometry(.01, .01, 1, 4), SM("#555"), 0, 2.7, 0, WELL, 0) }
const WELLSIGN = new THREE.Mesh(new THREE.CylinderGeometry(1.32, 1.32, .75, 32, 1, true, Math.PI - .95, 1.9), new THREE.MeshStandardMaterial({ map: T_WELLSIGN, transparent: true, roughness: .9, depthWrite: false })); WELLSIGN.position.set(0, .68, 0); WELL.add(WELLSIGN);
const PAINT = new THREE.Group(); scene.add(PAINT); part(new THREE.CylinderGeometry(.2, .17, .32, 14), SM("#6a5a48"), 0, .16, 0, PAINT, 0); part(new THREE.CylinderGeometry(.18, .18, .02, 14), SM("#efe6d2"), 0, .3, 0, PAINT, 0);
// la iglesia al fondo
const CHURCH = new THREE.Group(); scene.add(CHURCH); CHURCH.position.set(0, 0, -60);
{ part(new THREE.BoxGeometry(12, 10, 16), M_STONE, 0, 5, 0, CHURCH, 0); const half = 6.8, rh = 5, sl = Math.hypot(half, rh), a = Math.atan2(rh, half);
  for (const s of [-1, 1]) { const m = part(new THREE.BoxGeometry(sl, .3, 16.8), M_SHING, s * half / 2, 10 + rh / 2, 0, CHURCH, 0); m.rotation.z = -s * a }
  const tw = new THREE.Group(); tw.position.set(0, 0, 8.5); CHURCH.add(tw); part(new THREE.BoxGeometry(4.4, 20, 4.4), M_STONE, 0, 10, 0, tw, 0); part(new THREE.ConeGeometry(3.3, 11, 4), M_SHING, 0, 25.5, 0, tw, 0).rotation.y = Math.PI / 4;
  part(new THREE.BoxGeometry(2, 3.6, .2), M_PLANK, 0, 1.8, 2.25, tw, 0); const rw = part(new THREE.CircleGeometry(.9, 24), new THREE.MeshStandardMaterial({ color: "#2a1d12", emissive: AMBER, emissiveIntensity: .7 }), 0, 13, 2.23, tw, 0);
  part(new THREE.BoxGeometry(.25, 1.6, .25), M_BEAM, 0, 31.6, 0, tw, 0); part(new THREE.BoxGeometry(1, .22, .22), M_BEAM, 0, 31.9, 0, tw, 0) }
const CHPOSTS = [-2.2, 2.2].map(x => { const g = new THREE.Group(); scene.add(g); g.position.set(x, 0, -48.4); part(new THREE.CylinderGeometry(.08, .1, 2.6, 8), M_BEAM, 0, 1.3, 0, g, 0); const l = oilLamp(); l.g.position.set(0, 2.62, 0); g.add(l.g); return { g, l } });
// el pantano detrás del pozo
const MARSH = new THREE.Group(); scene.add(MARSH);
{ const w = part(new THREE.PlaneGeometry(120, 70), new THREE.MeshStandardMaterial({ color: "#14120c", roughness: .12, metalness: .45 }), 0, .03, 55, MARSH, 0); w.rotation.x = -Math.PI / 2; w.receiveShadow = true;
  const N = 2400, reed = new THREE.InstancedMesh(new THREE.ConeGeometry(.035, 1, 4), SM("#4a4628", { roughness: 1 }), N), r = rng(51); MARSH.add(reed);
  for (let i = 0; i < N; i++) { const x = (r() - .5) * 70, z = 19 + r() * 45; if (Math.abs(x) < 1.6 && r() < .9) continue; const h = 1.4 + r() * 2.6; dummy.position.set(x, h / 2, z); dummy.rotation.set((r() - .5) * .25, r() * 6, (r() - .5) * .25); dummy.scale.set(1, h, 1); dummy.updateMatrix(); reed.setMatrixAt(i, dummy.matrix); reed.setColorAt(i, new THREE.Color().setHSL(.12 + r() * .05, .35, .12 + r() * .14)) }
  const tops = new THREE.InstancedMesh(new THREE.CapsuleGeometry(.07, .35, 3, 6), SM("#3a2414"), 300); MARSH.add(tops); for (let i = 0; i < 300; i++) { const x = (r() - .5) * 60, z = 20 + r() * 40, h = 2.6 + r() * 1.6; dummy.position.set(x, h, z); dummy.rotation.set(0, 0, (r() - .5) * .2); dummy.scale.setScalar(1); dummy.updateMatrix(); tops.setMatrixAt(i, dummy.matrix) } }

// ---------- utilería: lámpara de aceite, bastón, farol, rastrillo, brocha, torta, frasco, velas, cama, mesa
function oilLamp(sc = 1) { const g = new THREE.Group(); g.scale.setScalar(sc); const br = SM("#8a6a3a", { metalness: .6, roughness: .35 });
  part(new THREE.CylinderGeometry(.16, .2, .1, 16), br, 0, .05, 0, g, 0); part(new THREE.SphereGeometry(.17, 16, 10), br, 0, .2, 0, g, 0); part(new THREE.CylinderGeometry(.08, .1, .08, 12), br, 0, .36, 0, g, 0);
  const ch = new THREE.Mesh(new THREE.SphereGeometry(.15, 16, 12), M_GLASS); ch.scale.set(1, 1.7, 1); ch.position.y = .58; g.add(ch); part(new THREE.TorusGeometry(.1, .015, 6, 16), br, 0, .9, 0, g, 0).rotation.x = Math.PI / 2;
  const fl = new THREE.Mesh(new THREE.SphereGeometry(.045, 10, 8), new THREE.MeshBasicMaterial({ color: "#fff2c0" })); fl.scale.set(1, 2.2, 1); fl.position.y = .55; g.add(fl);
  const gl = glowSprite(AMBER, 1.6, false); g.add(gl); gl.position.y = .55; return { g, gl, fl } }
const LIGHTS = Array.from({ length: 7 }, () => { const l = new THREE.PointLight(AMBER, 0, 12, 1.6); scene.add(l); return l });
function lights(list) { LIGHTS.forEach((l, i) => { const d = list[i]; l.intensity = d ? d[1] : 0; if (d) { l.position.set(...d[0]); l.color.set(d[2] || AMBER); l.distance = d[3] || 12 } }) }
const CANE = new THREE.Group(); part(new THREE.CylinderGeometry(.04, .045, 2.4, 8), SM("#4a3020"), 0, -1.05, .12, CANE, 0); part(new THREE.TorusGeometry(.13, .04, 6, 12, Math.PI), SM("#4a3020"), -.13, .15, .12, CANE, 0);
const LANT = new THREE.Group(); { const m = SM("#2a2420", { metalness: .5 }); part(new THREE.BoxGeometry(.32, .04, .32), m, 0, .02, 0, LANT, 0); part(new THREE.BoxGeometry(.36, .06, .36), m, 0, .5, 0, LANT, 0); for (const [x, z] of [[-.15, -.15], [.15, -.15], [-.15, .15], [.15, .15]]) part(new THREE.BoxGeometry(.03, .48, .03), m, x, .26, z, LANT, 0); const gl = new THREE.Mesh(new THREE.BoxGeometry(.28, .44, .28), M_GLASS); gl.position.y = .26; LANT.add(gl); part(new THREE.TorusGeometry(.1, .015, 6, 12, Math.PI), m, 0, .6, 0, LANT, 0) }
const LANTG = glowSprite(AMBER, 2.2, false); LANT.add(LANTG); LANTG.position.y = .26;
const RAKE = new THREE.Group(); part(new THREE.CylinderGeometry(.035, .035, 3, 8), SM("#7a5a3a"), 0, -1.2, .1, RAKE, 0); part(new THREE.BoxGeometry(1, .08, .1), SM("#3a3a3a", { metalness: .5 }), 0, -2.7, .1, RAKE, 0); for (let k = 0; k < 8; k++) part(new THREE.BoxGeometry(.03, .2, .03), SM("#3a3a3a"), -.45 + k * .13, -2.82, .1, RAKE, 0);
const BRUSH = new THREE.Group(); part(new THREE.CylinderGeometry(.03, .03, .6, 8), SM("#7a5a3a"), 0, -.25, .1, BRUSH, 0); part(new THREE.BoxGeometry(.16, .16, .06), SM("#efe6d2"), 0, -.6, .1, BRUSH, 0);
const SCISS = new THREE.Group(); for (const s of [-1, 1]) { const b = part(new THREE.BoxGeometry(.03, .34, .015), SM("#c9c9d2", { metalness: .9, roughness: .2 }), 0, -.15, .1, SCISS, 0); b.rotation.z = s * .18; part(new THREE.TorusGeometry(.05, .012, 6, 12), SM("#1a1a1a"), s * .04, .06, .1, SCISS, 0) }
// la torta con una vela (y su luz)
const CAKE = new THREE.Group(); scene.add(CAKE); part(new THREE.CylinderGeometry(.42, .42, .3, 24), SM("#e9dcc0"), 0, .15, 0, CAKE, 0); part(new THREE.CylinderGeometry(.44, .44, .05, 24), SM("#c94b4b"), 0, .3, 0, CAKE, 0); part(new THREE.CylinderGeometry(.5, .5, .03, 24), SM("#d9d4cc"), 0, .01, 0, CAKE, 0);
part(new THREE.CylinderGeometry(.03, .03, .26, 8), SM("#f4f1ea"), 0, .46, 0, CAKE, 0); const CFL = new THREE.Mesh(new THREE.SphereGeometry(.035, 8, 6), new THREE.MeshBasicMaterial({ color: "#fff2c0" })); CFL.scale.set(1, 2, 1); CFL.position.y = .63; CAKE.add(CFL); const CGL = glowSprite(AMBER, 1.1, false); CAKE.add(CGL); CGL.position.y = .63;
// el frasco con cuarenta luciérnagas
const JAR = new THREE.Group(); scene.add(JAR); { const gm = new THREE.MeshStandardMaterial({ color: "#e8f6ff", transparent: true, opacity: .22, roughness: .05, depthWrite: false }); const b = new THREE.Mesh(new THREE.CylinderGeometry(.24, .24, .55, 22, 1, true), gm); b.position.y = .28; JAR.add(b); part(new THREE.CylinderGeometry(.24, .24, .02, 22), gm, 0, .01, 0, JAR, 0); part(new THREE.CylinderGeometry(.26, .26, .08, 22), SM("#7a6a4a", { metalness: .5 }), 0, .58, 0, JAR, 0) }
const FFLY = Array.from({ length: 40 }, () => { const s = glowSprite(FIREF, .1, false); JAR.add(s); return s }), FFD = (() => { const r = rng(40); return Array.from({ length: 40 }, () => [r(), r(), r(), r() * 6, 1 + r() * 2]) })();
const JARL = new THREE.PointLight(FIREF, 0, 6, 1.5); JAR.add(JARL); JARL.position.y = .3;
function jarFX(t, a = 1) { FFLY.forEach((s, i) => { const [x, y, z, ph, sp] = FFD[i], bl = Math.max(0, Math.sin(t * sp + ph)); s.position.set((x - .5) * .34 + Math.sin(t * .7 + ph) * .04, .08 + y * .42, (z - .5) * .34); s.scale.setScalar((.012 + .05 * bl) * a) }); JARL.intensity = (.55 + Math.sin(t * 3) * .12) * a }
// cama, mesa con cajón y velas (adentro de nuestra casa)
const OH = (x, y, z) => [8.5 - z, y, 6 + x];            // nuestra casa: local → mundo
const BH = (x, y, z) => [-8.5 + z, y, 6 - x];           // casa Brannock: local → mundo
const IN = new THREE.Group(); OURS.g.add(IN);
{ const f = part(new THREE.PlaneGeometry(6.8, 5.8), SMt(T_PISO, { roughness: .8 }), 0, .02, 0, IN, 0); f.rotation.x = -Math.PI / 2; const c = part(new THREE.PlaneGeometry(6.8, 5.8), SM("#3a2a1e"), 0, 5.3, 0, IN, 0); c.rotation.x = Math.PI / 2;
  for (const [x, z, ry, w] of [[0, -2.84, 0, 6.8], [-3.34, 0, Math.PI / 2, 5.8], [3.34, 0, -Math.PI / 2, 5.8]]) { const m = part(new THREE.PlaneGeometry(w, 5.3), SMt(T_WALLIN), x, 2.65, z, IN, 0); m.rotation.y = ry }
  for (let k = 0; k < 3; k++) part(new THREE.BoxGeometry(6.8, .3, .3), M_BEAM, 0, 5.1, -2 + k * 2, IN, 0) }
const BED = new THREE.Group(); IN.add(BED); BED.position.set(1.6, 0, -1.7); { part(new THREE.BoxGeometry(3.2, .6, 1.9), M_PLANK, 0, .5, 0, BED, 0); part(new THREE.BoxGeometry(.2, 1.6, 2), M_PLANK, -1.6, .8, 0, BED, 0); part(new THREE.BoxGeometry(.9, .25, 1.3), SM("#e9dcc0"), -1.05, .92, 0, BED, 0) }
const QUILT = part(new THREE.BoxGeometry(2.3, .25, 2.0), SMt(T_QUILT), .45, .92, 0, BED, 0);
const TABLE = new THREE.Group(); IN.add(TABLE); TABLE.position.set(-2, 0, -1.6); { part(new THREE.BoxGeometry(2.2, .12, 1.3), M_PLANK, 0, 1.55, 0, TABLE, 0); for (const [x, z] of [[-1, -.55], [1, -.55], [-1, .55], [1, .55]]) part(new THREE.BoxGeometry(.12, 1.5, .12), M_BEAM, x, .75, z, TABLE, 0) }
const DRAWER = new THREE.Group(); TABLE.add(DRAWER); DRAWER.position.set(0, 1.36, .3); part(new THREE.BoxGeometry(1, .22, .9), M_PLANK, 0, 0, 0, DRAWER, 0); part(new THREE.SphereGeometry(.05, 8, 6), SM("#8a6a3a", { metalness: .6 }), 0, 0, .47, DRAWER, 0);
const HOOKL = [OH(-3.2, 3.2, -1), OH(3.2, 3.2, -1)];
const HL = [0, 1].map(i => { const l = oilLamp(1.1); scene.add(l.g); return l });                       // las dos lámparas de casa
const BL = [0, 1].map(i => { const l = oilLamp(1); scene.add(l.g); return l });                        // las dos de los Brannock
const TL = [0, 1].map(i => { const l = oilLamp(.9); scene.add(l.g); return l });                       // lámparas de mesa (montaje)
const BTABLE = new THREE.Group(); BRAN.g.add(BTABLE); BTABLE.position.set(-.6, 0, .3); part(new THREE.BoxGeometry(2.2, .12, 1.4), M_PLANK, 0, 1.55, 0, BTABLE, 0); for (const [x, z] of [[-1, -.6], [1, -.6], [-1, .6], [1, .6]]) part(new THREE.BoxGeometry(.12, 1.5, .12), M_BEAM, x, .75, z, BTABLE, 0);
{ const f = part(new THREE.PlaneGeometry(6.8, 5.8), SMt(T_PISO, { roughness: .8 }), 0, .02, 0, BRAN.walls[1], 0); f.rotation.x = -Math.PI / 2; for (const [x, z, ry, w] of [[0, -2.84, 0, 6.8], [-3.34, 0, Math.PI / 2, 5.8], [3.34, 0, -Math.PI / 2, 5.8]]) { const m = part(new THREE.PlaneGeometry(w, 5.3), SMt(T_WALLIN), x, 2.65, z, [BRAN.walls[1], BRAN.walls[2], BRAN.walls[3]][[0, 1, 2][[0, -Math.PI / 2, Math.PI / 2].indexOf(-ry) === -1 ? 0 : 0]], 0); m.rotation.y = ry } }
// porche de los Brannock (techito + postes + escalón) frente a la puerta
BRAN.porch = new THREE.Group(); BRAN.g.add(BRAN.porch); { const p = BRAN.porch; p.position.set(1.6, 0, 3.6); part(new THREE.BoxGeometry(2.6, .2, 1.6), M_PLANK, 0, .1, 0, p, 0); for (const s of [-1, 1]) part(new THREE.BoxGeometry(.18, 3.4, .18), M_BEAM, s * 1.15, 1.8, .65, p, 0); const r = part(new THREE.BoxGeometry(2.9, .16, 1.9), M_SHING, 0, 3.55, .1, p, 0); r.rotation.x = .22 }
// velas que el chico se ata encima
const CANDLES = Array.from({ length: 22 }, () => { const g = new THREE.Group(); part(new THREE.CylinderGeometry(.05, .05, .26, 8), SM("#efe6d2"), 0, .13, 0, g, 0); const fl = new THREE.Mesh(new THREE.SphereGeometry(.035, 8, 6), new THREE.MeshBasicMaterial({ color: "#fff2c0" })); fl.scale.set(1, 2, 1); fl.position.y = .32; g.add(fl); const gl = glowSprite(AMBER, .5, false); g.add(gl); gl.position.y = .32; return { g, gl, fl } });

// ---------- la Polilla: cuerpo peludo, alas con dos ojos pintados, antenas plumosas, seis patas (todo procedural, nada cuadrado)
const T_WING = (hind) => { const c = mk(1024, 1024), g = c.getContext("2d"), r = rng(hind ? 72 : 71), U = 1024 / 28, VV = 1024 / 22;
  const pts = hind ? [[0, -1], [5, -3], [12, -6], [16, -9.5], [15, -13], [10, -15], [5, -14], [1.5, -10], [0, -5]] : [[0, 1.5], [7, 4.2], [16, 5.6], [24, 4.5], [27, 1], [25, -3.5], [17, -6.5], [8, -6], [2, -3], [0, -1]];
  const X0 = x => x * U + 20, Y0 = y => (6.5 - y) * VV;
  g.save(); g.beginPath(); pts.forEach(([x, y], i) => { const px = X0(x), py = Y0(y); if (!i) g.moveTo(px, py); else { const [qx, qy] = pts[i - 1]; g.quadraticCurveTo((X0(qx) + px) / 2 + (r() - .5) * 20, (Y0(qy) + py) / 2 + (r() - .5) * 20, px, py) } }); g.closePath(); g.clip();
  const gr = g.createLinearGradient(X0(0), 0, X0(hind ? 16 : 27), 0); gr.addColorStop(0, hind ? "#3a2418" : "#2e2016"); gr.addColorStop(.45, hind ? "#8a5a3a" : "#6a4a2c"); gr.addColorStop(1, hind ? "#b0805a" : "#a8834e"); g.fillStyle = gr; g.fillRect(0, 0, 1024, 1024);
  for (let k = 0; k < 9000; k++) { const x = r() * 1024, y = r() * 1024, v = r(); g.strokeStyle = v < .5 ? "rgba(30,20,10,.18)" : "rgba(230,200,150,.12)"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 6, y + (r() - .5) * 3); g.stroke() }
  for (let b = 0; b < 3; b++) { g.strokeStyle = b === 1 ? "rgba(230,200,140,.45)" : "rgba(25,15,8,.6)"; g.lineWidth = 10 - b * 2; g.beginPath(); for (let y = -16; y < 8; y += .5) { const x = (hind ? 6 : 9) + b * 4 + Math.sin(y * 1.7 + b) * .6; y === -16 ? g.moveTo(X0(x), Y0(y)) : g.lineTo(X0(x), Y0(y)) } g.stroke() }
  g.strokeStyle = "rgba(20,12,6,.55)"; g.lineWidth = 3; for (let k = 0; k < 9; k++) { const a = (hind ? -1.35 : -.75) + k * (hind ? .14 : .19); g.beginPath(); g.moveTo(X0(.3), Y0(0)); g.quadraticCurveTo(X0(8 * Math.cos(a)), Y0(8 * Math.sin(a) + 1), X0(28 * Math.cos(a)), Y0(28 * Math.sin(a))); g.stroke() }
  // el ojo pintado
  const ex = hind ? 10 : 16, ey = hind ? -9 : -.5, R0 = (hind ? 2.1 : 3.9) * U;
  const ring = (rr, col) => { g.fillStyle = col; g.beginPath(); g.ellipse(X0(ex), Y0(ey), rr, rr * .92, -.15, 0, 7); g.fill() };
  ring(R0 * 1.12, "rgba(235,215,170,.55)"); ring(R0, "#120c08"); ring(R0 * .84, "#d6922e"); ring(R0 * .74, "#f0b850"); ring(R0 * .62, "#1a0f08"); ring(R0 * .46, "#2c1a0c"); ring(R0 * .3, "#0a0604");
  g.fillStyle = "rgba(255,250,235,.92)"; g.beginPath(); g.ellipse(X0(ex) - R0 * .18, Y0(ey) - R0 * .2, R0 * .16, R0 * .1, -.5, 0, 7); g.fill();
  g.restore();
  // borde con flecos
  g.strokeStyle = "rgba(210,180,130,.85)"; g.lineWidth = 2; for (let i = 0; i < pts.length; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length]; for (let k = 0; k < 40; k++) { const q = k / 40, x = X0(lerp(x0, x1, q)), y = Y0(lerp(y0, y1, q)); g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 14, y + (r() - .5) * 14); g.stroke() } }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return { t, pts, U, VV } };
function wingGeo(W) { const sh = new THREE.Shape(); W.pts.forEach(([x, y], i) => i ? sh.lineTo(x, y) : sh.moveTo(x, y)); const geo = new THREE.ShapeGeometry(sh, 24), uv = geo.attributes.uv, p = geo.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (p.getX(i) * W.U + 20) / 1024, 1 - (6.5 - p.getY(i)) * W.VV / 1024);
  // las alas no son planas: se curvan un poco hacia abajo en la punta
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, -.012 * x * x - .03 * Math.abs(y)) } geo.computeVertexNormals(); return geo }
const WF = T_WING(false), WH = T_WING(true);
const wingMat = W => new THREE.MeshStandardMaterial({ map: W.t, roughness: .95, side: THREE.DoubleSide, transparent: true, alphaTest: .35, emissive: "#ffffff", emissiveMap: W.t, emissiveIntensity: .12 });
const MOTH = new THREE.Group(); scene.add(MOTH); const MB = new THREE.Group(); MOTH.add(MB);
const FUR = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 1 });
const WINGS = []; for (const s of [-1, 1]) for (const hind of [0, 1]) { const piv = new THREE.Group(); piv.position.set(s * 1.4, .6, hind ? -.8 : 1.8); MB.add(piv); const m = new THREE.Mesh(wingGeo(hind ? WH : WF), wingMat(hind ? WH : WF)); m.rotation.x = -Math.PI / 2; m.scale.x = s; piv.add(m); m.castShadow = true; WINGS.push({ piv, s, hind }) }
{ const bodyM = new THREE.MeshStandardMaterial({ color: "#6a4a2c", roughness: 1 });
  const parts = [[0, .4, 2.2, 2.3, 2.0, 2.9], [0, .9, 5.3, 1.45, 1.35, 1.35], [0, .1, -1.2, 1.9, 1.7, 1.8], [0, -.1, -3.6, 1.7, 1.5, 1.6], [0, -.3, -5.8, 1.4, 1.25, 1.4], [0, -.5, -7.7, 1.05, .95, 1.1], [0, -.7, -9.2, .7, .65, .8]];
  const blobs = parts.map(([x, y, z, a, b, c]) => { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), bodyM); m.position.set(x, y, z); m.scale.set(a, b, c); MB.add(m); m.castShadow = true; return m });
  // pelaje: 2600 pelos sobre el cuerpo, más largos en el cuello y el tórax
  const N = 2600, fur = new THREE.InstancedMesh(new THREE.ConeGeometry(.07, 1, 4), FUR, N), r = rng(61); MB.add(fur); const nrm = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < N; i++) { const bi = r() < .45 ? 0 : r() < .2 ? 1 : 2 + (r() * 5 | 0), [x, y, z, a, b, c] = parts[bi], u = r() * Math.PI * 2, v = Math.acos(r() * 2 - 1);
    nrm.set(Math.sin(v) * Math.cos(u), Math.cos(v), Math.sin(v) * Math.sin(u)); if (nrm.y < -.6 && bi > 1) { i--; continue }
    const len = (bi === 0 ? 1.1 : bi === 1 ? .8 : .55) * (.6 + r() * .7); dummy.position.set(x + nrm.x * a * .95, y + nrm.y * b * .95, z + nrm.z * c * .95);
    dummy.quaternion.setFromUnitVectors(up, nrm.clone().add(new THREE.Vector3(0, .15, -.5)).normalize()); dummy.scale.set(1, len, 1); dummy.position.addScaledVector(nrm, len * .45); dummy.updateMatrix(); fur.setMatrixAt(i, dummy.matrix);
    fur.setColorAt(i, new THREE.Color().setHSL(.09 + r() * .03, .35 + r() * .2, bi === 0 ? .55 + r() * .25 : .3 + r() * .3)) }
  // anillos oscuros en el abdomen
  for (let k = 2; k < 7; k++) { const [x, y, z, a, b, c] = parts[k]; const t = part(new THREE.TorusGeometry(1, .12, 8, 28), SM("#2a1a10", { roughness: 1 }), x, y, z - c * .55, MB, 0); t.scale.set(a * .95, b * .95, 1) }
  // ojos compuestos enormes, oscuros y brillantes
  const T_EYE = tex(256, 256, (g) => { g.fillStyle = "#0b0706"; g.fillRect(0, 0, 256, 256); for (let y = 0; y < 256; y += 9) for (let x = (y / 9 % 2) * 5; x < 256; x += 10) { g.strokeStyle = "rgba(120,80,40,.35)"; g.beginPath(); g.arc(x, y, 4, 0, 7); g.stroke() } });
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(.95, 28, 20), new THREE.MeshStandardMaterial({ map: T_EYE, roughness: .15, metalness: .3, emissive: "#ff6a20", emissiveIntensity: .05 })); e.position.set(s * 1.05, 1.15, 6.0); MB.add(e) }
  // antenas plumosas
  for (const s of [-1, 1]) { const cv = new THREE.CatmullRomCurve3([new THREE.Vector3(s * .5, 1.9, 6.1), new THREE.Vector3(s * 1.6, 3.6, 7.6), new THREE.Vector3(s * 3.4, 4.6, 9.8), new THREE.Vector3(s * 5.4, 4.4, 11.6)]);
    MB.add(new THREE.Mesh(new THREE.TubeGeometry(cv, 40, .07, 6), SM("#3a2618"))); const nb = 70, barb = new THREE.InstancedMesh(new THREE.CylinderGeometry(.015, .03, 1, 4), SM("#7a5a3a", { roughness: 1 }), nb * 2); MB.add(barb);
    for (let k = 0; k < nb; k++) { const q = .12 + k / nb * .85, p0 = cv.getPointAt(q), tg = cv.getTangentAt(q), side = new THREE.Vector3().crossVectors(tg, new THREE.Vector3(0, 1, 0)).normalize(), len = .9 * Math.sin(q * Math.PI) + .2;
      for (const d of [-1, 1]) { const dir = side.clone().multiplyScalar(d).addScaledVector(tg, .55).normalize(); dummy.position.copy(p0).addScaledVector(dir, len / 2); dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); dummy.scale.set(1, len, 1); dummy.updateMatrix(); barb.setMatrixAt(k * 2 + (d > 0), dummy.matrix) } } }
  // seis patas articuladas y peludas (MOTH.userData.legs: cada una con su pivote, se estiran para agarrar)
  MOTH.userData.legs = [];
  for (const [z, s] of [[3.4, -1], [3.4, 1], [2, -1], [2, 1], [.6, -1], [.6, 1]]) { const hip = new THREE.Group(); hip.position.set(s * 1.2, -1.2, z); MB.add(hip); const m = SM("#4a3220", { roughness: 1 });
    const fem = new THREE.Group(); hip.add(fem); part(new THREE.CylinderGeometry(.22, .17, 3.6, 8), m, 0, -1.8, 0, fem, 0); const knee = new THREE.Group(); knee.position.y = -3.6; fem.add(knee); part(new THREE.CylinderGeometry(.15, .09, 4.2, 8), m, 0, -2.1, 0, knee, 0);
    const tar = new THREE.Group(); tar.position.y = -4.2; knee.add(tar); part(new THREE.CylinderGeometry(.08, .04, 1.6, 6), m, 0, -.8, 0, tar, 0); MOTH.userData.legs.push({ hip, fem, knee, tar, s, z }) }
  MOTH.userData.blobs = blobs }
// ojos pintados del ala delantera derecha (para el plano que empuja hacia el ojo)
const EYEP = new THREE.Object3D(); WINGS.find(w => w.s < 0 && !w.hind).piv.children[0].add(EYEP); EYEP.position.set(16, -.5, 0);
const MOTHL = new THREE.PointLight("#ffb060", 0, 60, 1.2); scene.add(MOTHL);
function moth(t, { pos = [0, 30, 0], yaw = 0, pitch = 0, flap = 1, sp = 1.4, sc = 1, grab = 0, open = 0, glow = 1 } = {}) {
  MOTH.visible = true; MOTH.position.set(...pos); MOTH.rotation.set(pitch, yaw, 0); MOTH.scale.setScalar(sc);
  const ph = t * sp * Math.PI * 2, a = Math.sin(ph) * .55 * flap + .15 - open * .35;
  WINGS.forEach(({ piv, s, hind }) => { piv.rotation.set(0, s * (hind ? -.25 : .12) * (1 - open), s * (a + (hind ? .08 : 0) + Math.sin(ph - .4) * .05)) });
  MB.position.y = -Math.sin(ph) * .6 * flap; MB.rotation.x = Math.sin(ph + 1) * .04 * flap;
  MOTH.userData.legs.forEach(({ fem, knee, tar, s, z }, i) => { const wig = Math.sin(t * 2 + i) * .08; fem.rotation.set(-.4 + z * .05 + wig, 0, s * lerp(-1.1, -.25, grab)); knee.rotation.set(lerp(1.3, .25, grab), 0, s * lerp(.6, .1, grab)); tar.rotation.set(lerp(.6, .1, grab), 0, 0) });
  MOTHL.position.set(pos[0], pos[1] - 6 * sc, pos[2]); MOTHL.intensity = 60 * glow * sc; MOTHL.distance = 70 * sc;
}

// ---------- polvo dorado que cae de las alas (Points) y niebla baja ocre
const NDUST = 2200, DPOS = new Float32Array(NDUST * 3), DUST = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(DPOS, 3)), new THREE.PointsMaterial({ map: GLOW, color: DUSTC, size: .22, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .9, fog: false }));
DUST.frustumCulled = false; scene.add(DUST); const DD = (() => { const r = rng(83); return Array.from({ length: NDUST }, () => [r(), r(), r(), r(), r()]) })();
function dust(t, c, { R = 14, top = 26, k = 1, wind = 0, sz = .22 } = {}) { DUST.visible = k > 0; if (!DUST.visible) return; DUST.material.size = sz; DUST.material.opacity = Math.min(1, k) * .9;
  for (let i = 0; i < NDUST; i++) { const [a, b, cc, d, e] = DD[i], on = a < k ? 1 : 0, fall = (t * (.9 + d * 1.4) + b * top) % top, rr = Math.sqrt(cc) * R, an = e * 6.283 + t * .05;
    DPOS[i * 3] = c[0] + Math.cos(an) * rr + Math.sin(t * 1.3 + i) * .4 + wind * Math.sin(t * 3 + i * .7) * 2; DPOS[i * 3 + 1] = on ? top - fall : -50; DPOS[i * 3 + 2] = c[2] + Math.sin(an) * rr + Math.cos(t * 1.1 + i) * .4 }
  DUST.geometry.attributes.position.needsUpdate = true }
const FOGT = tex(256, 256, (g) => { const r = rng(8); for (let k = 0; k < 40; k++) { const x = 40 + r() * 176, y = 60 + r() * 136, rr = 20 + r() * 50, gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, "rgba(255,255,255,.22)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256) } });
const WISPS = []; { const r = rng(21); for (let k = 0; k < 30; k++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(16, 6), new THREE.MeshBasicMaterial({ map: FOGT, color: "#a8a2a8", transparent: true, opacity: 0, depthWrite: false, fog: false })); m.userData = { x: r() * 30 - 15, y: .6 + r() * 2.5, z: 26 - r() * 80, v: .2 + r() * .4, ph: r() * 6 }; scene.add(m); WISPS.push(m) } }
function wisps(t, a = 1) { WISPS.forEach(m => { const u = m.userData; m.position.set(u.x + Math.sin(t * u.v + u.ph) * 3, u.y, u.z); m.quaternion.copy(cam.quaternion); m.material.opacity = .18 * a }) }

// ---------- elenco (diseños propios de bloques: nada del protagonista de Volze, sin marcas)
const ME = kid({ skin: "#e8b48c", shirt: "#55613a", cloth: "plain", pants: "#3a2f28", shoes: "#4a3020", hair: "#4a2f1f", style: "despeinado", face: {}, extra: ["scarf"] });
const PELL = kid({ skin: "#efc8a8", shirt: "#e6d6b4", cloth: "plain", pants: "#e6d6b4", shoes: "#c9a27a", hair: "#b5562a", style: "trenzas", face: { freckles: true, lashes: true } });
const WREN = kid({ skin: "#d9b08c", shirt: "#4a3f5a", cloth: "cardigan", alt: "#cbb8a0", pants: "#3a3236", shoes: "#2a2420", hair: "#d9d4cc", style: "recogido", face: { wrinkles: true, lashes: true } });
const BDAD = kid({ skin: "#c98e64", shirt: "#7a3a2a", cloth: "plaid", alt: "#d9b36a", pants: "#3a3236", shoes: "#2a2420", hair: "#2b211b", style: "corto", face: { mustache: true } });
const BMOM = kid({ skin: "#f2cfae", shirt: "#3f6a8a", cloth: "sweater", alt: "#d9c7a0", pants: "#3a3f4a", shoes: "#2a2420", hair: "#6b3f22", style: "melena", face: { lashes: true } });
const BKID = kid({ skin: "#c98e64", shirt: "#c9a23a", cloth: "plain", pants: "#3a3f4a", shoes: "#5a3a2a", hair: "#2b211b", style: "rulos", face: {} });
const FOLK = [["#5a3a2a", "plain", "#3a3236", "#1d1a17", "corto", "#e8b48c"], ["#6a6a4a", "sweater", "#3a2f28", "#7a4a2a", "raya", "#c98e64"], ["#3a4a5a", "plain", "#2a2420", "#c9a06a", "melena", "#f2cfae"], ["#7a5a3a", "plaid", "#3a3236", "#2b211b", "lobo", "#8a5a3c"], ["#4a3a4a", "cardigan", "#3a3236", "#9a9a9a", "recogido", "#efc8a8"]].map(([sh, c, p, h, st, sk]) => kid({ skin: sk, shirt: sh, cloth: c, alt: "#d9c7a0", pants: p, shoes: "#2a2420", hair: h, style: st, face: { lashes: st === "melena" || st === "recogido" } }));
const GROOM = kid({ skin: "#e8b48c", shirt: "#1e1d22", cloth: "suit", alt: "#7a2a2a", pants: "#1e1d22", shoes: "#111", hair: "#3a2a20", style: "raya", face: {} });
const BRIDE = kid({ skin: "#f2cfae", shirt: "#f2ece0", cloth: "plain", pants: "#f2ece0", shoes: "#f2ece0", hair: "#c9a06a", style: "largo", face: { lashes: true, blush: true } });
const VEIL = new THREE.Mesh(new THREE.ConeGeometry(.75, 2.2, 20, 1, true), new THREE.MeshStandardMaterial({ color: "#ffffff", transparent: true, opacity: .45, side: THREE.DoubleSide, depthWrite: false })); VEIL.position.set(0, .2, -.15); BRIDE.head.add(VEIL);
PELL.body.scale.setScalar(.74); WREN.body.scale.setScalar(1.04); BKID.body.scale.setScalar(.8);
const HATS = [BDAD, BMOM, BKID].map((k, i) => { const h = part(new THREE.ConeGeometry(.26, .62, 16), SM(["#c94b4b", "#3f8a6a", "#d9a03a"][i]), 0, 1.15, 0, k.head, 0); return h });
const ALL = [ME, PELL, WREN, BDAD, BMOM, BKID, ...FOLK, GROOM, BRIDE];
const handW = (k, h = "R") => { k.g.updateMatrixWorld(true); return (h === "R" ? k.handR : k.handL).getWorldPosition(new THREE.Vector3()) };
const attach = (obj, k, h = "R", o = [0, -.15, .1]) => { const hand = h === "R" ? k.handR : k.handL; if (obj.parent !== hand) hand.add(obj); obj.position.set(...o); obj.visible = true };

// ---------- cielo y ambientes (noche ocre, atardecer, mañana gris, interior)
const SKY = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() } },
  vertexShader: "varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
  fragmentShader: "uniform vec3 top; uniform vec3 hor; varying vec3 vD; void main(){ float h = vD.y; vec3 c = mix(hor, top, smoothstep(-.05, .55, h)); gl_FragColor = vec4(c, 1.); }" })); SKY.renderOrder = -1; scene.add(SKY);
const ENV = {
  noche: { top: "#141a2e", hor: "#3a3442", fog: .009, hemi: 1.0, hemiG: "#2a2018", sun: 1.0, sunCol: "#a8b8e0", exp: 2.3, grade: ["#d0962e", .07] },
  tarde: { top: "#2a2a48", hor: "#8a6a58", fog: .008, hemi: 1.0, hemiG: "#2a1c10", sun: 1.3, sunCol: "#ffb070", exp: 1.85, grade: ["#d8902e", .07] },
  manana: { top: "#6a7488", hor: "#a8a49a", fog: .009, hemi: 1.4, hemiG: "#3a3022", sun: 1.4, sunCol: "#f0e2c8", exp: 1.3, grade: ["#c9a06a", .05] },
  adentro: { top: "#141a2e", hor: "#2a2630", fog: .003, hemi: .7, hemiG: "#2a2018", sun: .3, sunCol: "#a8b8e0", exp: 2.05, grade: ["#d0962e", .06] },
};
// modo «pueblo de día» de la skill shorts-volze (no se usa en este video de terror; queda listo para el próximo)
ENV.dia = { top: "#5aa0e8", hor: "#cfe4f2", fog: .004, hemi: 1.4, hemiG: "#8a7a60", sun: 3.0, sunCol: "#fff1dc", exp: 1.1, grade: ["#ffffff", 0] };
let ENVNOW = "noche";
function setEnv(a) { const A = ENV[a]; ENVNOW = a; SKY.material.uniforms.top.value.set(A.top); SKY.material.uniforms.hor.value.set(A.hor); scene.background.set(A.hor); scene.fog.color.set(A.hor); scene.fog.density = A.fog;
  hemi.intensity = A.hemi; hemi.color.set("#c4c4d8"); hemi.groundColor.set(A.hemiG); sun.intensity = A.sun; sun.color.set(A.sunCol); R.toneMappingExposure = A.exp }
sun.position.set(-40, 60, -20); sun.target.position.set(0, 0, -10); Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 160 }); sun.shadow.camera.updateProjectionMatrix();

// ---------- las frases (índices de voz.json)
//@ORDEN
const I = Object.fromEntries(ORDEN.map((n, i) => [n, i]));
// donde cambia el lugar hay corte duro; dentro del mismo lugar, barrido de cámara
const LUGAR = L => [I.morning, I.twelve].includes(L) ? "manana1" : L === I.church2 ? "iglesia" : [I.raked, I.well, I.nocandles].includes(L) ? "manana2" : L === I.eat ? "montaje" : [I.wicks, I.wren, I.count].includes(L) ? "tarde" :
  [I.pell, I.corners, I.stopped, I.smiling, I.why, I.blanket, I.jar, I.blink, I.mine, I.lamps, I.light, I.tie, I.brightest, I.brighter].includes(L) ? "adentro" : [I.winter, I.candle].includes(L) ? "bran" : "calle";

// ---------- planos: cada frase tiene una lista de tomas; cada toma empieza en una palabra (w) y la cámara se mueve todo el tiempo (p→p1, l→l1)
// barrido de 0,2 s entre tomas del mismo lugar; corte seco cuando cambia el lugar. f = fov (gran angular en los primeros planos)
const sh = (w, p, p1, l, l1, f = 55, o = {}) => ({ w, p, p1: p1 || p, l, l1: l1 || l, f, ...o });
const add = (a, b) => a.map((v, i) => v + b[i]);
const EYEW = () => { MOTH.updateMatrixWorld(true); return EYEP.getWorldPosition(new THREE.Vector3()).toArray() };
const EYEN = () => { const n = new THREE.Vector3(0, 0, 1).applyQuaternion(EYEP.parent.getWorldQuaternion(new THREE.Quaternion())); if (n.y > 0) n.negate(); return n };   // normal del ala, del lado de abajo (desde la calle)
const EYEC = (d, side = 0, up = 0) => () => { const e = new THREE.Vector3(...EYEW()), n = EYEN(), s = new THREE.Vector3().crossVectors(n, new THREE.Vector3(0, 1, 0)).normalize(); return e.addScaledVector(n, d).addScaledVector(s, side).add(new THREE.Vector3(0, up, 0)).toArray() };
const MPOS = { hook: [8.5, 21, -10], church: [0, 30, -58], bran: [-8.5, 17, 6], ours: [8.5, 19, 6], marsh: [0, 22, 30] };
// primeros planos a partir de la cara: la cámara se pone delante de la cabeza (ang gira alrededor, dy sube) y se acerca de d0 a d1
const headW = k => { k.g.updateMatrixWorld(true); const q = k.head.getWorldQuaternion(new THREE.Quaternion()); return k.head.getWorldPosition(new THREE.Vector3()).addScaledVector(new THREE.Vector3(0, 1, 0).applyQuaternion(q), .38 * k.body.scale.y * k.g.scale.y) };
const fwdW = (k, ang) => new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang)).applyQuaternion(k.head.getWorldQuaternion(new THREE.Quaternion()));
const shF = (w, k, d0, d1, ang = 0, dy = 0, f = 62, ldy = 0, o = {}) => { const P = d => () => { const h = headW(k), v = fwdW(k, ang); return [h.x + v.x * d, h.y + v.y * d + dy, h.z + v.z * d] }, Lk = () => { const h = headW(k); return [h.x, h.y + ldy, h.z] }; return sh(w, P(d0), P(d1), Lk, Lk, f, o) };
const JARP = (o) => () => add(JAR.position.toArray(), o);
const SHOTS = {
  [I.hook]: [sh(0, [0, 9, 22], [0, 6.5, 15], [0, 3, -20], [0, 3.5, -24], 58), sh(6, [-.6, 2.7, -7.2], [-.2, 2.6, -8.6], [5.5, 2.5, -10], [5.5, 2.6, -10], 62)],
  [I.third]: [sh(0, [2.4, 4.6, -6.5], [3, 5.2, -7.6], [5.6, 7.4, -10], [5.6, 7.6, -10], 58), sh(5, [-1, .9, -3.5], [-1.4, .8, -4.5], [8.5, 15, -10], [8.5, 20, -10], 74)],
  [I.whole]: [sh(0, [-4, 1.4, -1], [-4.6, 1.2, 0], [8.5, 6, -10], [8.5, 12, -10], 64), sh(4, [-6, 46, -2], [-5, 50, -6], [8.5, 14, -10], [8.5, 22, -10], 50)],
  [I.morning]: [sh(0, [6.6, 2.3, -6.6], [6.4, 2.4, -7.8], [2.6, 2.1, -9.4], [2.6, 2.1, -9.6], 58), sh(6, [7.5, 13, -5.5], [8.3, 11.5, -9], [8.5, 0, -10.2], [8.5, 0, -10.6], 50)],
  [I.twelve]: [sh(0, [-18, 46, 18], [-10, 50, 2], [0, 0, -14], [0, 0, -20], 52), sh(4, [-1.6, 1.8, -12.5], [-1.8, 1.8, -16.5], [-8.5, 1.4, -17], [-8.5, 1.2, -19.5], 62)],
  [I.wicks]: [shF(0, ME, 1.8, 1.5, .45, .15, 70), sh(3, [5.0, 2.5, -.15], [4.95, 2.45, -.35], [4.05, 2.25, -1.42], [4.05, 2.25, -1.42], 58)],
  [I.wren]: [sh(0, [-.6, 2.6, 5.2], [-.6, 2.5, 7.4], [-.8, 2.4, -.5], [-.8, 2.4, 1.8], 60), sh(7, [-2.6, 3.4, -1.2], [-2.8, 3.6, -.2], [8.5, 3.2, -2], [8.5, 3.4, -1.6], 58)],
  [I.count]: [sh(0, [2.4, 2.6, -4.6], [2.6, 2.6, .6], [5.5, 2.5, -4.1], [5.5, 2.5, .1], 62), shF(2, WREN, 1.7, 1.45, -.45, .05, 70), shF(4, WREN, 3.0, 2.7, .35, -1.7, 64, -1.3), sh(9, [-1.5, 2.2, 3], [-1.8, 2.4, 4], [1.6, 1.6, -3], [1.8, 1.6, -5], 56)],
  [I.eat]: [sh(0, OH(-1.5, 2.7, -2.45), OH(-2.3, 2.6, -2.4), OH(-1.9, 2.2, -.3), OH(-1.9, 2.2, -.3), 66), shF(5, PELL, 1.9, 1.6, .25, .15, 66), sh(10, [0, 2.6, -42], [0, 2.5, -43.6], [0, 2.4, -47.6], [0, 2.4, -47.6], 58, { cut: true })],
  [I.nobody]: [sh(0, [0, .8, -30], [0, 1, -33], [0, 13, -60], [0, 17, -60], 60), sh(5, [2.2, 1.1, -4], [2.0, 1.0, -5.2], [0, 30, -20], [0, 32, -22], 66)],
  [I.dust]: [shF(0, ME, 1.7, 1.45, .3, .45, 72), sh(4, [.6, 3.4, 1.5], [.5, 3.2, 1.5], [1, 4.6, -.6], [1, 3.4, -.6], 62)],
  [I.snow]: [sh(0, [0, 3, 11], [0, 3.6, 7], [0, 3.4, -24], [0, 3.6, -24], 56), sh(6, [1.7, .6, 1.4], [1.6, .6, .8], [0, 30, -8], [1, 30, -10], 80, { shake: .08 })],
  [I.wings]: [sh(0, [0, 1.8, -24], [0, 1.5, -29], [0, 18, -58], [0, 22, -58], 64), sh(3, [46, 30, -26], [40, 36, -34], [0, 24, -58], [0, 24, -58], 52)],
  [I.eyes]: [sh(0, EYEC(16, 4, -2), EYEC(11, 3, -1.5), () => EYEW(), () => EYEW(), 54), sh(10, EYEC(8.5, 1.5, 0), EYEC(7, 1, 0), () => EYEW(), () => EYEW(), 50)],
  [I.pell]: [shF(0, PELL, 1.6, 1.35, .25, 0, 68), sh(4, OH(1.7, 2.0, -1.0), OH(1.6, 2.0, -1.2), OH(-3.3, 3.4, -2.8), OH(-3.3, 3.2, -2.8), 58)],
  [I.corners]: [sh(0, OH(-3, .6, -2.4), OH(-2.8, .6, -2.2), OH(1.2, 1.6, -1.6), OH(1.2, 1.6, -1.6), 72), sh(6, OH(1.6, 1.9, -1.1), OH(.6, 2.3, -1.6), OH(-3.34, 3.6, -2.84), OH(-3.34, 3.6, -2.84), 56)],
  [I.winter]: [sh(0, OH(1.6, 2.2, 1.0), OH(1.4, 2.2, 1.4), BH(-1.2, 2.2, 0), BH(-1.2, 2.2, 0), 46), sh(5, BH(-1.4, 3, 2.4), BH(-1.6, 2.9, 2.1), BH(-.6, 1.9, .3), BH(-.6, 1.9, .3), 70)],
  [I.candle]: [sh(0, BH(-.4, 2.05, 1.2), BH(-.5, 2.0, 1.05), BH(-.6, 2.1, .3), BH(-.6, 2.2, .3), 56), shF(5, BKID, 1.4, 1.15, -.3, .1, 70)],
  [I.three]: [sh(0, [-1.4, 2.6, 7.2], [-2.6, 2.6, 7.2], [-5.6, 2.45, 7.2], [-5.6, 2.45, 7.2], 50)],
  [I.song]: [sh(0, [-2, 1.4, 9], [-2.4, 1.3, 10], [-8.5, 9, 6], [-8.5, 9.5, 6], 66), sh(6, BH(.4, 2.2, 1.6), BH(.3, 2.2, 1.3), BH(-.6, 2.3, -.3), BH(-.6, 2.3, -.3), 70)],
  [I.watch]: [sh(0, [3.6, 2.7, 7.6], [4.2, 2.7, 7.4], OH(1.2, 2.5, 1.6), OH(1.2, 2.5, 1.6), 52), shF(6, PELL, 1.25, 1.05, .3, .1, 70)],
  [I.roof]: [sh(0, OH(1.6, 2.0, 1.2), OH(1.5, 2.1, 1.5), [-8.5, 6, 6], [-8.5, 9, 6], 58), sh(5, [-1, .8, 13], [-.4, .7, 12], [-8.5, 9, 6], [-8.5, 13, 6], 72)],
  [I.walls]: [sh(0, [3, 2.2, 13], [2.6, 2.4, 12], [-8.5, 6, 6], [-8.5, 9, 6], 62), sh(3, [-.6, 1.4, .6], [-.9, 1.4, 1.2], [-6, 3, 4.4], [-6, 5, 4.4], 64), sh(6, [-3.4, 3, 7], [-3.6, 4, 7], [-8, 5, 7], [-8, 9, 7], 66)],
  [I.up]: [sh(0, [-3, .7, 9], [-3, .6, 9.4], [-8.5, 30, 6], [-8.5, 40, 6], 74), sh(5, [8, 70, 30], [6, 76, 28], [-8.5, 40, 6], [-8.5, 46, 6], 50)],
  [I.raked]: [shF(0, WREN, 3.0, 2.5, .6, .3, 60, -.6), shF(6, WREN, 3.4, 3.1, -.7, -1.4, 64, -.9)],
  [I.well]: [shF(0, WREN, 2.6, 2.2, -.7, 0, 62, -.4), sh(7, [.5, 1.0, 9.6], [.4, .95, 10.3], [0, .7, 12.7], [0, .7, 12.7], 62)],
  [I.nocandles]: [sh(0, [-2.4, 3.6, -4.6], [-2.6, 3.8, -3.6], [-5.2, 3.6, -2], [-5.2, 3.3, -2], 58), sh(5, [0, 2.6, -8], [0, 2.4, -6], [0, 2.2, -16], [0, 2.2, -16], 52)],
  [I.church2]: [sh(0, [0, 1.2, -38], [0, 1.4, -41], [0, 6, -50], [0, 9, -52], 58), sh(5, [1.2, 2.6, -46.6], [1.4, 2.7, -46.9], [2.2, 2.85, -48.4], [2.2, 2.85, -48.4], 62)],
  [I.stopped]: [shF(0, PELL, 1.7, 1.45, .35, 0, 64)],
  [I.smiling]: [shF(0, PELL, 1.35, 1.15, -.25, 0, 70), shF(5, PELL, 1.05, .9, .3, 0, 72)],
  [I.why]: [shF(0, ME, 2.3, 1.9, .3, 0, 62)],
  [I.blanket]: [sh(0, OH(2.9, 3.1, .4), OH(2.7, 2.9, .2), OH(1.2, 1.1, -1.7), OH(1.2, 1.1, -1.7), 64)],
  [I.jar]: [sh(0, JARP([-1.1, .35, -.25]), JARP([-.85, .3, -.2]), JARP([0, .28, 0]), JARP([0, .28, 0]), 50)],
  [I.blink]: [sh(0, JARP([-.75, .2, .3]), JARP([-.6, .2, .25]), JARP([0, .28, 0]), JARP([0, .28, 0]), 60), shF(3, PELL, 1.15, .95, .4, 0, 70)],
  [I.ourroof]: [sh(0, [2, 1.4, 1], [2.2, 1.3, 1.8], [8.5, 9, 6], [8.5, 12, 6], 70), sh(4, [3, 26, -4], [4, 24, -2], [8.5, 6, 6], [8.5, 6, 6], 54)],
  [I.gold]: [sh(0, [4.2, 6.4, 3], [4.4, 6.0, 3.6], [6, 6.8, 6], [6, 6.6, 6], 60), sh(5, [3.2, 2.6, 2.6], [3.4, 2.5, 3.0], [5.5, 1.8, 4.4], [5.5, 1.8, 4.4], 62), sh(8, [3.6, 2.6, 8.6], [3.8, 2.6, 8.2], [5.5, 2.5, 7.2], [5.5, 2.5, 7.2], 60)],
  [I.outside]: [sh(0, [-1.4, 3.6, 2], [-1.6, 3.6, 3], [5.5, 3, 7], [5.5, 3, 7], 56), shF(6, WREN, 1.9, 1.6, .2, -.4, 66), shF(8, WREN, 1.25, 1.05, .1, -.6, 74, .15)],
  [I.stops]: [shF(0, WREN, 1.35, 1.15, -.2, -.7, 78, .1, { shake: .02 })],
  [I.never]: [sh(0, [1.2, 15, 7.4], [1.1, 12, 7], [.4, 1, 5.6], [.4, 1, 5.6], 54)],
  [I.mine]: [sh(0, OH(2.9, 3.3, .5), OH(2.7, 3.1, .3), OH(.9, 1.4, -1.5), OH(.9, 1.4, -1.5), 62), shF(7, PELL, 1.05, .9, .1, 0, 72)],
  [I.lamps]: [shF(0, ME, 2.5, 2.1, .7, .2, 62), shF(5, ME, 1.5, 1.3, -.45, 0, 66)],
  [I.light]: [shF(0, ME, 1.9, 1.6, -.6, .25, 64), sh(5, OH(-2.0, 2.4, -.3), OH(-2.0, 2.25, -.5), OH(-2.2, 1.6, -1.2), OH(-2.2, 1.6, -1.2), 66)],
  [I.tie]: [shF(0, ME, 2.1, 1.85, .4, 0, 62), shF(5, ME, 1.4, 1.25, .3, -.75, 66, -.8), shF(7, ME, 1.4, 1.25, -.3, -1.25, 66, -1.3), shF(9, ME, 1.6, 1.4, .3, -2.0, 70, -2.45)],
  [I.brightest]: [shF(0, ME, 2.7, 2.4, .25, -2.0, 76, -.2)],
  [I.brighter]: [shF(0, ME, 1.7, 1.45, .2, 0, 70), sh(4, OH(1.6, 3.6, -1.4), OH(1.2, 3.8, -1.2), OH(-1.6, 1.8, 2.2), OH(-1.6, 1.8, 2.2), 56)],
  [I.run]: [sh(0, [2.6, 2.4, 3.4], [2.8, 2.4, 3.8], [5.5, 2, 4.4], [5.5, 2, 4.4], 62), sh(5, () => [ME.g.position.x - 3.4, 2.2, ME.g.position.z - .5], null, () => [ME.g.position.x, 1.6, ME.g.position.z + .6], null, 64), sh(8, [-2.2, 1.6, 15.8], [-2.6, 1.6, 16.4], [0, 1.4, 14], [0, 1.6, 15], 62), sh(10, () => [ME.g.position.x, 2.6, ME.g.position.z - 4], null, () => [ME.g.position.x, 1.8, ME.g.position.z + 4], null, 60)],
  [I.dark]: [sh(0, [2.5, 4.6, 33], [2, 4.1, 31], [0, 3, -10], [0, 3, -14], 46)],
  [I.nobodybright]: [sh(0, [-14, 30, 34], [-12, 34, 28], [0, 0, -10], [0, 0, -14], 48)],
  [I.above]: [sh(0, [-2.4, .6, 23.6], [-2.6, .6, 24], [0, 26, 32], [0, 26, 33], 82, { shake: .06 }), sh(3, [5, 4, 33], [4, 3, 32], [0, 18, 30], [0, 16, 30], 70)],
  [I.wind2]: [sh(0, [3.4, 1.0, 23], [3.0, .9, 23.6], [0, 1.6, 26], [0, 1.8, 26], 62, { shake: .05 }), shF(5, ME, 1.6, 1.35, .9, -1.2, 66, -1.0)],
  [I.life]: [shF(0, ME, 1.55, 1.3, .25, .1, 66, 0, { shake: .03 })],
  [I.last]: [sh(0, [0, 40, 25.6], [0, 30, 25.8], [0, 0, 26], [0, 0, 26], 52)],
};
// tiempos de inicio de cada toma y cortes; window.SUBF: más sub-cuadros (desenfoque) en los barridos
const TOMAS = []; Object.entries(SHOTS).forEach(([L, list]) => { L = +L; list.forEach((s0, j) => { const a = j === 0 ? S[L] : wt(L, s0.w) - .06; TOMAS.push({ L, j, a, s: s0 }) }) });
TOMAS.sort((a, b) => a.a - b.a); TOMAS.forEach((t, i) => { t.b = TOMAS[i + 1]?.a ?? DUR; t.corte = i === 0 || LUGAR(t.L) !== LUGAR(TOMAS[i - 1].L) || t.s.cut });
const WHIP = .2, tomaAt = t => { let k = 0; for (let i = 0; i < TOMAS.length; i++) if (t >= TOMAS[i].a) k = i; return k };
window.SUBF = t => { const k = tomaAt(t), T = TOMAS[k], N = TOMAS[k + 1]; return (N && !N.corte && N.a - t < WHIP * .6) || (!T.corte && t - T.a < WHIP * .4) ? 12 : 3 };
window.SHUTF = t => window.SUBF(t) > 3 ? 1 : .5;
const val = (v, q) => typeof v === "function" ? v(q) : v;
function camAt(T, q) { const s = T.s, p0 = val(s.p, q), p1 = val(s.p1, q), l0 = val(s.l, q), l1 = val(s.l1, q), e = q * q * (3 - 2 * q) * .35 + q * .65;
  return { p: p0.map((v, i) => lerp(v, p1[i], e)), l: l0.map((v, i) => lerp(v, l1[i], e)), f: s.f } }
const QA = new THREE.Quaternion(), QB = new THREE.Quaternion(), MA = new THREE.Matrix4();
function camara(t) { const k = tomaAt(t), T = TOMAS[k], N = TOMAS[k + 1], q = cl((t - T.a) / Math.max(.01, T.b - T.a)); let c = camAt(T, q);
  const look = (c) => { MA.lookAt(new THREE.Vector3(...c.p), new THREE.Vector3(...c.l), new THREE.Vector3(0, 1, 0)); return new THREE.Quaternion().setFromRotationMatrix(MA) };
  let quat = look(c), pos = new THREE.Vector3(...c.p), fov = c.f;
  // barrido: los últimos 0,12 s de una toma y los primeros 0,08 s de la siguiente se mezclan con una curva rápida
  const into = N && !N.corte ? (t - (N.a - WHIP * .6)) / WHIP : -1, from = !T.corte && k > 0 ? (t - T.a + WHIP * .6) / WHIP : 2;
  if (into > 0 && into < 1 || from > 0 && from < 1) { const A = into > 0 && into < 1 ? T : TOMAS[k - 1], B = into > 0 && into < 1 ? N : T, u = into > 0 && into < 1 ? into : from, e = eIO(u);
    const ca = camAt(A, 1), cb = camAt(B, 0); pos = new THREE.Vector3(...ca.p).lerp(new THREE.Vector3(...cb.p), e); quat = look(ca).slerp(look(cb), e); fov = lerp(ca.f, cb.f, e) }
  if (T.s.shake) { const a = T.s.shake; pos.x += Math.sin(t * 23) * a + Math.sin(t * 37) * a * .5; pos.y += Math.sin(t * 29 + 1) * a }
  pos.x += Math.sin(t * 1.3) * .015; pos.y += Math.sin(t * 1.7 + 1) * .012;   // cámara en mano, muy suave
  cam.position.copy(pos); cam.quaternion.copy(quat); if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix() } }

// ---------- la escena en cada instante
function setScene(t) {
  const L = lineAt(t), lt = t - s(L), len = (S[L + 1] ?? DUR) - s(L), k = P(lt, 0, len), W = kk => wt(L, kk);
  POST = { flash: 0, dark: 0 };
  ALL.forEach(c => { c.g.visible = false; c.g.scale.set(1, 1, 1); c.body.rotation.set(0, 0, 0); c.head.rotation.set(0, 0, 0); power(c, null, 0); c.aura.visible = false; c.g.position.y = 0; setFace(c, "neutral"); pose(c, t, {}) });
  [CANE, LANT, RAKE, BRUSH, SCISS, PAINT, JAR, CAKE].forEach(o => o.visible = false); MOTH.visible = false; MOTHL.intensity = 0; DUST.visible = false; JARL.intensity = 0;
  [...HL, ...BL, ...TL].forEach(l => { l.g.visible = false; if (l.g.parent !== scene) scene.add(l.g); l.g.rotation.set(0, 0, 0) }); CANDLES.forEach(c => { c.g.visible = false; if (c.g.parent !== scene) scene.add(c.g) }); CHPOSTS.forEach(p => p.l.g.visible = false);
  HATS.forEach(h => h.visible = true); VEIL.visible = true; DRAWER.position.z = .3; QUILT.position.set(.45, .92, 0); QUILT.rotation.x = 0; QUILT.scale.x = 1;
  const env = LUGAR(L).startsWith("manana") ? "manana" : LUGAR(L) === "tarde" ? "tarde" : LUGAR(L) === "adentro" ? "adentro" : L === I.eat && t < W(10) ? "adentro" : "noche"; setEnv(env);
  const ventanas = env === "manana" ? .25 : 1;
  // estado del pueblo: la casa del gancho se va en la frase 2 y queda el cuadrado; la de los Brannock se va en 21–23
  const hookGone = L > I.whole, branGone = L > I.up;
  HOUSES.forEach(H => { H.g.visible = true; H.g.position.y = 0; H.g.rotation.x = 0; H.walls.forEach(w => { w.position.set(0, 0, 0); w.rotation.set(0, 0, 0) }); H.roof.position.set(0, H.Hh, 0); H.roof.rotation.set(0, 0, 0); if (H.porch) { H.porch.position.y = 0 } H.panes.forEach(p => p.emissiveIntensity = 1.6 * ventanas); H.glows.forEach(g => { g.visible = env !== "manana"; g.material.opacity = .55 }); if (H.attic) { H.attic.emissiveIntensity = 0; H.atticGlow.scale.setScalar(.001) } });
  HOOK.g.visible = !hookGone; SQUARES.r10.visible = hookGone; BRAN.g.visible = !branGone; BTABLE.visible = true;
  // lámparas de casa (en los ganchos) y de los Brannock: siempre dos
  HL.forEach((l, i) => { l.g.visible = true; l.g.position.set(...HOOKL[i]); l.g.position.y -= .3 });
  BL.forEach((l, i) => { l.g.visible = !branGone; BRAN.g.updateMatrixWorld(true); const p = new THREE.Vector3(i ? 1.2 : -2.6, 2.9, -2.4).applyMatrix4(BRAN.g.matrixWorld); l.g.position.copy(p) });
  CAKE.visible = !branGone; { const p = new THREE.Vector3(-.6, 1.61, .3).applyMatrix4(BRAN.g.matrixWorld); CAKE.position.copy(p) }
  const lamp = (l, a = 1) => { l.gl.scale.setScalar(1.0 * a); l.fl.visible = a > .05 };
  [...HL, ...BL, ...TL].forEach(l => lamp(l, 1));
  let LL = [];
  const ourLamps = () => HL.forEach(l => LL.push([[l.g.position.x - .6, l.g.position.y + .6, l.g.position.z], 7, AMBER, 9]));
  const branLamps = () => { if (BRAN.g.visible) BL.forEach(l => LL.push([[l.g.position.x + .3, l.g.position.y + .6, l.g.position.z], 6, AMBER, 9])) };
  wisps(t, env === "adentro" ? 0 : env === "manana" ? .6 : 1);
  const B0 = BH(0, 0, 0);
  // gente de la calle (para el pueblo que mira el cuadrado o camina alrededor)
  const crowd = (list) => list.forEach(([c, x, z, ry, f = "neutral", walk = 0]) => { place(c, x, z, ry); setFace(c, f); pose(c, t + x, { walk }) });

  switch (L) {
    case I.hook: case I.third: case I.whole: {
      const on3 = L > I.hook ? (L === I.third ? P(t, W(2) - .05, W(2) + .15) : 1) : 0; HOOK.attic.emissiveIntensity = 2.2 * on3; HOOK.atticGlow.scale.setScalar(.001 + 3 * on3);
      const md = L === I.hook ? 0 : L === I.third ? eOut(P(t, W(4), e(I.third) + .2)) : 1, lift = L === I.whole ? eIO(P(lt, .1, len)) : 0;
      if (L > I.hook) { const p = MPOS.hook; moth(t, { pos: [p[0], lerp(70, p[1], md) + lift * 26, p[2]], yaw: Math.PI / 2 + .3, flap: 1, sp: 1.1, grab: lift > 0 ? 1 : md * .6 }); dust(t, [8.5, 0, -10], { R: 13, top: 24 + lift * 20, k: .2 + md * .8, wind: lift }) }
      HOOK.g.position.y = lift * 26; HOOK.g.rotation.x = Math.sin(t * 2) * .03 * lift;
      LL.push([[5, 3, -10], 4 * on3 + 2, AMBER, 10]); if (lift > 0) LL.push([[8.5, 3 + lift * 26, -10], 6, AMBER, 14]);
      break }
    case I.morning: case I.twelve: {
      crowd([[FOLK[0], 3.6, -7.2, Math.PI / 2], [FOLK[1], 4.1, -12.3, Math.PI / 2 - .3, "worried"], [FOLK[2], 3.2, -10.2, Math.PI / 2 + .2], [PELL, 2.5, -8.6, Math.PI / 2], [ME, 2.2, -9.6, Math.PI / 2]]);
      if (L === I.twelve) { const a = lt * .5; crowd([[FOLK[3], -8.5 + Math.cos(a) * 4.6, -18 + Math.sin(a) * 4, -a, "neutral", 1], [FOLK[4], -8.5 + Math.cos(a + 2) * 4.6, -18 + Math.sin(a + 2) * 4, -a - 2, "neutral", 1], [FOLK[0], -8.5 + Math.cos(a + 4) * 4.6, -18 + Math.sin(a + 4) * 4, -a - 4, "neutral", 1]]) }
      break }
    case I.wicks: {
      place(ME, 3.6, -1.6, Math.PI / 2); setFace(ME, "neutral"); pose(ME, t, { armFwd: .55 }); TL[0].g.visible = true; TL[0].g.position.set(4.05, 1.78, -1.42); attach(SCISS, ME, "L", [0, -.2, .3]); SCISS.rotation.set(.3, 0, Math.sin(t * 14) * .1);
      LL.push([[4.2, 2.6, -1.0], 5, AMBER, 7]); break }
    case I.wren: case I.count: {
      const walkZ = L === I.wren ? lerp(-3.4, 1.2, k) : -2; place(WREN, 1.5, walkZ, L === I.wren && k < .75 ? 0 : Math.PI / 2); pose(WREN, t, { walk: L === I.wren && k < .75 ? .5 : 0, armFwd: .2 }); WREN.body.rotation.x = .12; setFace(WREN, "squint");
      attach(CANE, WREN, "R", [0, -.15, .15]); attach(LANT, WREN, "L", [0, -.5, .1]); LANT.rotation.z = Math.sin(t * 3) * .1;
      if (L === I.count) { const tap = [W(7), W(7) + .35].some(a => t > a && t < a + .15); WREN.armR.rotation.x = tap ? -.45 : -.2; if (t > W(9)) { place(WREN, 1.5, -2 + (t - W(9)) * 1.2, 0); pose(WREN, t, { walk: .5 }); WREN.body.rotation.x = .12 } }
      LL.push([[WREN.g.position.x, 1.8, WREN.g.position.z + .4], 6, AMBER, 8]); break }
    case I.eat: {
      if (t < W(10)) { // comer y leer, adentro
        TL.forEach((l, i) => { l.g.visible = true; l.g.position.set(...OH(-2.7 + i * 1.4, 1.62, -1.5)) });
        if (t < W(5)) { place(ME, ...[OH(-2.5, 0, -.5)[0], OH(-2.5, 0, -.5)[2]], 0); place(PELL, OH(-1.4, 0, -.5)[0], OH(-1.4, 0, -.5)[2], 0); [ME, PELL].forEach(c => { faceTo(c, ...[OH(-2, 0, -1.6)[0], OH(-2, 0, -1.6)[2]]); pose(c, t, { sit: 0, armFwd: .5 + .15 * Math.sin(t * 6) }) }); setFace(PELL, "neutral") }
        else { const bp = OH(2.65, 0, -1.7); place(PELL, bp[0], bp[2], 0); PELL.body.rotation.x = -Math.PI / 2 + .7; PELL.g.position.y = .9; pose(PELL, t, { armFwd: .8 }); PELL.body.rotation.x = -Math.PI / 2 + .7; setFace(PELL, "curious"); TL.forEach((l, i) => l.g.position.set(...OH(-.25 + i * 3.4, 1.0, -2.45))) }
        TL.forEach(l => LL.push([[l.g.position.x, l.g.position.y + .7, l.g.position.z], 3, AMBER, 8]));
      } else { // la boda en la puerta de la iglesia
        CHPOSTS.forEach(p => { p.l.g.visible = true; LL.push([[p.g.position.x, 2.9, p.g.position.z + .4], 7, AMBER, 9]) });
        place(GROOM, -.8, -47.6, 0); place(BRIDE, .8, -47.6, 0); setFace(GROOM, "warm"); setFace(BRIDE, "warm"); pose(GROOM, t, { hug: .4 }); pose(BRIDE, t, { hug: .4 });
        crowd([[FOLK[0], -3.2, -48.6, .5], [FOLK[2], 3.2, -48.6, -.5]]);
      } break }
    case I.church2: { CHPOSTS.forEach(p => { p.l.g.visible = true; LL.push([[p.g.position.x, 2.9, p.g.position.z + .5], 6, AMBER, 9]) }); break }
    case I.nobody: { break }
    case I.dust: case I.snow: {
      place(ME, 0, 0, Math.PI); setFace(ME, L === I.snow && t > W(6) ? "scared" : "worried"); ME.head.rotation.x = -.55; dust(t, [0, 0, -2], { R: 12, top: 18, k: L === I.dust ? .35 + k * .3 : .7 + k * .3, wind: L === I.snow && t > W(6) ? 1 : 0, sz: .18 });
      TL[0].g.visible = true; TL[0].g.position.set(-.9, 0, -1.2); LL.push([[-.6, 1.6, -.8], 6, AMBER, 8]);
      if (L === I.snow && t > W(6)) { ME.body.rotation.z = Math.sin(t * 9) * .03; } break }
    case I.wings: case I.eyes: {
      const p = MPOS.church; moth(t, { pos: p, yaw: Math.PI * .5 + .15, pitch: -.12, flap: L === I.eyes ? .25 : .5, sp: .5, open: L === I.eyes ? .6 : .2, grab: .2, sc: 1.1 }); dust(t, [0, 0, -58], { R: 26, top: 40, k: 1, sz: .35 });
      LL.push([[0, 8, -46], 10, AMBER, 30]); break }
    case I.pell: case I.corners: case I.stopped: case I.smiling: case I.why: case I.blanket: case I.jar: case I.blink: case I.mine: {
      // Pell acostada: los pies al borde de la cama, la cabeza en la almohada (cabecera hacia -z del mundo)
      const bp = OH(2.65, 0, -1.7); place(PELL, bp[0], bp[2], 0); PELL.body.rotation.x = -Math.PI / 2 + .42; PELL.g.position.y = .9;
      setFace(PELL, { [I.pell]: "scared", [I.corners]: "worried", [I.stopped]: "gloomy", [I.smiling]: "warm", [I.why]: "warm", [I.blanket]: "shock", [I.jar]: "hopeful", [I.blink]: "starstruck", [I.mine]: "pleading" }[L]);
      const jarOn = L >= I.smiling; if (jarOn) { JAR.visible = true; const jp = OH(1.15, 1.08, -1.25); JAR.position.set(...jp); jarFX(t, L >= I.blanket ? 1 : .25) }
      if (L <= I.why) QUILT.position.y = .92; if (L === I.blanket) { QUILT.position.y = .92 + eIO(P(lt, .1, .6)) * .9; QUILT.rotation.x = -eIO(P(lt, .1, .6)) * .8 } if (L > I.blanket) { QUILT.position.set(1.35, .92, 0); QUILT.scale.x = .45 }
      if ([I.why, I.blanket, I.mine].includes(L)) { const mp = L === I.why ? OH(-1.6, 0, 1.9) : OH(.2, 0, -.6); place(ME, mp[0], mp[2], 0); faceTo(ME, bp[0], bp[2]); setFace(ME, L === I.why ? "suspicious" : L === I.mine ? "worried" : "shock"); pose(ME, t, { armFwd: L === I.why ? 0 : .7 }) }
      if (L === I.mine) { pose(PELL, t, { hug: 1 }); PELL.body.rotation.x = -Math.PI / 2 + .9 }
      if (L === I.corners) { HL[0].gl.scale.setScalar(1.2 + Math.sin(t * 7) * .1) }
      ourLamps(); if (jarOn) LL.push([JAR.position.toArray(), L >= I.blanket ? .5 : .15, FIREF, 4]); break }
    case I.winter: case I.candle: case I.three: case I.song: {
      crowd([[BDAD, ...[BH(-.6, 0, -.8)[0], BH(-.6, 0, -.8)[2]], 0], [BMOM, BH(-1.7, 0, .3)[0], BH(-1.7, 0, .3)[2], 0], [BKID, BH(.4, 0, .5)[0], BH(.4, 0, .5)[2], 0]]);
      [BDAD, BMOM, BKID].forEach(c => { faceTo(c, CAKE.position.x, CAKE.position.z); setFace(c, L === I.song ? "laugh" : "happy"); pose(c, t, { armFwd: L === I.song ? .3 : .1 }) }); setFace(BKID, L === I.candle ? "excited" : L === I.song ? "laugh" : "happy");
      branLamps(); LL.push([[CAKE.position.x, CAKE.position.y + 1, CAKE.position.z], 3, AMBER, 6]);
      if (L === I.winter) { place(ME, ...[OH(1.2, 0, .2)[0], OH(1.2, 0, .2)[2]], 0); faceTo(ME, -8.5, 7.2); place(PELL, OH(1.4, 0, .5)[0], OH(1.4, 0, .5)[2], 0); faceTo(PELL, -8.5, 7.2); ourLamps() }
      if (L === I.song) { const p = MPOS.bran; moth(t, { pos: [p[0], lerp(60, p[1] + 6, eOut(k)), p[2]], yaw: .4, flap: 1, sp: 1, grab: .3 }); dust(t, [-8.5, 0, 6], { R: 10, top: 24, k: .3 + k * .7 }) }
      break }
    case I.watch: case I.roof: case I.walls: case I.up: {
      // nosotros en la ventana; enfrente se van el techo, las paredes, el porche y la torta (con la familia)
      const wp = OH(1.2, 0, 1.3); place(ME, wp[0] + .55, wp[2] - .3, -Math.PI / 2); place(PELL, wp[0], wp[2] + .1, -Math.PI / 2); setFace(ME, "horrified"); setFace(PELL, "scared");
      pose(ME, t, { armFwd: .9 }); ME.armR.rotation.set(-2.2, 0, .7); ourLamps();
      crowd([[BDAD, BH(-.6, 0, -.8)[0], BH(-.6, 0, -.8)[2], 0, "laugh"], [BMOM, BH(-1.7, 0, .3)[0], BH(-1.7, 0, .3)[2], 0, "laugh"], [BKID, BH(.4, 0, .5)[0], BH(.4, 0, .5)[2], 0, "laugh"]]); [BDAD, BMOM, BKID].forEach(c => faceTo(c, CAKE.position.x, CAKE.position.z));
      const tR = L === I.roof ? P(t, W(1), e(L) + .3) : L > I.roof ? 1 : 0, tW = L === I.walls ? P(t, W(1), W(3) + .4) : L > I.walls ? 1 : 0, tP = L === I.walls ? P(t, W(4), W(6) + .3) : L > I.walls ? 1 : 0, tC = L === I.walls ? P(t, W(7), e(L) + .4) : L > I.walls ? 1 : 0;
      const up = L === I.up ? eIO(k) * 40 : 0, ROOFY = eIO(tR) * 14 + eIO(tW) * 8 + up, WALLY = eIO(tW) * 12 + up, PORY = eIO(tP) * 12 + up, CAKY = eIO(tC) * 10 + up;
      BRAN.roof.position.y = BRAN.Hh + ROOFY; BRAN.roof.rotation.z = Math.sin(t * 1.5) * .06 * tR;
      BRAN.walls.forEach((w, i) => { w.position.y = WALLY * (1 + i * .08); w.rotation.z = Math.sin(t * 1.2 + i) * .05 * tW }); BRAN.porch.position.y = PORY;
      BTABLE.position.y = CAKY; [BDAD, BMOM, BKID].forEach(c => { c.g.position.y = CAKY; }); { const p = new THREE.Vector3(-.6, 1.61 + CAKY, .3).applyMatrix4(BRAN.g.matrixWorld); CAKE.position.copy(p) } BL.forEach(l => l.g.position.y += WALLY);
      if (L === I.up) [BDAD, BMOM, BKID].forEach(c => setFace(c, "neutral"));
      const p = MPOS.bran; moth(t, { pos: [p[0], p[1] + 6 + ROOFY * .9, p[2]], yaw: .4, flap: 1, sp: 1, grab: 1, sc: 1 }); dust(t, [-8.5, 0, 6], { R: 11, top: 26 + ROOFY, k: 1, wind: .6 });
      branLamps(); LL.push([[CAKE.position.x, CAKE.position.y + 1, CAKE.position.z], 4, AMBER, 7]); if (L === I.watch) HATS.forEach(h => h.visible = true);
      break }
    case I.raked: case I.well: case I.nocandles: {
      if (L === I.raked) { place(WREN, -6.4, 5.6 + Math.sin(t * 2) * .3, -Math.PI / 2); setFace(WREN, "gloomy"); pose(WREN, t, { armFwd: .7 + Math.sin(t * 4) * .15 }); WREN.body.rotation.x = .2; attach(RAKE, WREN, "R", [0, -.1, .2]); RAKE.rotation.set(.5 + Math.sin(t * 4) * .15, 0, 0) }
      if (L === I.well) { place(WREN, -1.15, 12.35, .55); setFace(WREN, "squint"); WREN.body.rotation.x = .25; pose(WREN, t, { armFwd: .9 }); WREN.armR.rotation.z = Math.sin(t * 5) * .3; attach(BRUSH, WREN, "R", [0, -.1, .2]); PAINT.visible = true; PAINT.position.set(-1.9, 0, 12.1); WELLSIGN.material.opacity = L === I.well ? lerp(.3, 1, P(lt, 0, len * .6)) : 1 }
      if (L === I.nocandles) crowd([[FOLK[1], -1, -10, 0, "gloomy"], [FOLK[2], 1.2, -12, 0, "gloomy"], [FOLK[3], -.4, -14, 0, "gloomy"], [FOLK[4], 1.8, -9, -.3, "gloomy"]]);
      break }
    case I.ourroof: case I.gold: case I.outside: case I.stops: case I.never: {
      const p = MPOS.ours, md = L === I.ourroof ? eOut(k) : 1; moth(t, { pos: [p[0], lerp(60, p[1] + 3, md), p[2]], yaw: -.5, flap: L >= I.stops ? .4 : 1, sp: L >= I.stops ? .6 : 1, grab: .3 }); dust(t, [8.5, 0, 6], { R: 13, top: 26, k: .4 + .6 * md });
      place(WREN, .4, 5.6, Math.PI / 2 + .3); WREN.head.rotation.x = -.5; setFace(WREN, L >= I.stops ? "terrified" : "squint"); attach(LANT, WREN, "L", [0, -.5, .1]); attach(CANE, WREN, "R", [0, -.15, .15]); WREN.body.rotation.x = .1;
      if (L === I.outside) WREN.armR.rotation.x = -.3 - .3 * Math.abs(Math.sin(t * 6));
      LL.push([[.6, 1.8, 6.2], 5, AMBER, 7]); LL.push([[6, 2.6, 7.2], 1, FIREF, 8]); break }
    case I.lamps: case I.light: case I.tie: case I.brightest: case I.brighter: {
      const mp = L === I.lamps ? OH(lerp(-.2, -2.2, eIO(P(lt, 0, len * .5))), 0, -.2) : L >= I.brightest ? OH(-1.6, 0, 2.0) : OH(-1.4, 0, 0); place(ME, mp[0], mp[2], 0);
      faceTo(ME, ...(L === I.lamps ? [HOOKL[0][0], HOOKL[0][2]] : L >= I.brightest ? [OH(-1.6, 0, 5)[0], OH(-1.6, 0, 5)[2]] : [OH(-2, 0, -1.6)[0], OH(-2, 0, -1.6)[2]]));
      setFace(ME, L >= I.brightest ? "determined" : "brave");
      const took = L > I.lamps || (L === I.lamps && t > W(2) + .3); if (took) HL.forEach((l, i) => { attach(l.g, ME, i ? "R" : "L", [0, -.35, .2]); lamp(l, .55) });
      pose(ME, t, { armFwd: L === I.light ? .9 : .35, armL: .05, armR: .05 });
      if (L === I.light) { DRAWER.position.z = .3 + eOut(P(lt, 0, .5)) * .8; CANDLES.slice(0, 10).forEach((c, i) => { c.g.visible = true; const p = OH(-2.6 + (i % 5) * .3, 1.62, -1.2 + (i / 5 | 0) * .3); c.g.position.set(...p); const on = t > W(1) + i * .06; c.fl.visible = on; c.gl.scale.setScalar(on ? .18 : .001) }) }
      if (L >= I.tie) { const nOn = L === I.tie ? (t < W(5) ? 4 : t < W(7) ? 10 : t < W(9) ? 16 : 22) : 22; const spots = [[-.4, 1.9, .3], [.4, 1.9, .3], [0, 1.7, .3], [-.3, 1.5, .3], [.3, 1.5, .3], [-.45, 1.3, .3], [.45, 1.3, .3], [0, 1.25, .3], [-.5, 1.1, .3], [.5, 1.1, .3], [0, 1.08, .32], [-.3, 1.08, .32], [.3, 1.08, .32], [-.5, 2.1, .1], [.5, 2.1, .1], [0, 1.4, -.3]];
        CANDLES.forEach((c, i) => { if (i >= nOn) return; c.g.visible = true; if (i < spots.length) { if (c.g.parent !== ME.body) ME.body.add(c.g); c.g.position.set(...spots[i]) } else { const lg = i % 2 ? ME.legR : ME.legL; if (c.g.parent !== lg) lg.add(c.g); c.g.position.set(.27 * (i % 2 ? 1 : -1), -.85, .1) } c.fl.visible = true; c.gl.scale.setScalar(.3 + Math.sin(t * 13 + i) * .04); c.g.rotation.set(0, 0, 0) }) }
      ourLamps(); LL[0][1] = took ? 0 : 7; LL[1][1] = took ? 0 : 7; const hp = ME.g.position; LL.push([[hp.x + 1.1, 1.3, hp.z + .4], took ? 2.2 : 0, AMBER, 9]);
      if (L >= I.brightest) LL.push([[hp.x + 1.2, 1.2, hp.z], 3.5, "#ffc070", 8]); if (L === I.light) LL.push([[OH(-2, 2.2, -1)[0], 2.2, OH(-2, 2.2, -1)[2]], 2.5, AMBER, 7]);
      break }
    case I.run: case I.dark: case I.nobodybright: case I.above: case I.wind2: case I.life: case I.last: {
      // corre desde la puerta, pasa el pozo y entra al pantano, lleno de velas
      const path = [[5.2, 4.4], [2.5, 5.2], [.8, 10], [-1.6, 13.6], [-.6, 18], [0, 26]];
      const rk = L === I.run ? P(t, W(1), e(L) + .3) : 1, seg = rk * (path.length - 1), si = Math.min(path.length - 2, Math.floor(seg)), sq = seg - si, x = lerp(path[si][0], path[si + 1][0], sq), z = lerp(path[si][1], path[si + 1][1], sq);
      place(ME, x, z, Math.atan2(path[si + 1][0] - path[si][0], path[si + 1][1] - path[si][1])); pose(ME, t, { walk: L === I.run && rk < 1 ? 1.4 : 0, armL: .05, armR: .05 }); setFace(ME, L >= I.life ? "neutral" : "brave");
      if (L >= I.above) { ME.g.rotation.y = Math.PI; ME.head.rotation.x = L === I.above ? -.6 : -.35 } if (L === I.last) ME.head.rotation.x = -.9;
      HL.forEach((l, i) => attach(l.g, ME, i ? "R" : "L", [0, -.35, .2])); CANDLES.forEach((c, i) => { c.g.visible = true; c.fl.visible = true; c.gl.scale.setScalar((.45 + Math.sin(t * 13 + i) * .06) * (L >= I.above ? 1.2 : 1)); if (L === I.wind2) c.g.rotation.z = .35 + Math.sin(t * 9 + i) * .06 });
      LL.push([[x, 2.2, z + .3], 6, "#ffc070", 12]); LL.push([[x, 1, z - .4], 3, AMBER, 7]);
      if (L === I.run && t < W(5)) { place(ME, 4.6, 4.4, -Math.PI / 2); pose(ME, t, {}) }
      // las ventanas del pueblo se apagan una por una, de las lejanas a las cercanas
      if (L >= I.dark) { const kd = L === I.dark ? P(lt, .1, len * .9) : 1; HOUSES.forEach(H => { const d = 1 - cl((H.z + 45) / 55), off = kd > d; H.panes.forEach(p => p.emissiveIntensity = off ? 0 : 1.6); H.glows.forEach(g => g.visible = !off) }); HL.forEach(l => { }); }
      if (L >= I.dark) { const md = L === I.dark ? P(lt, len * .4, len) * .3 : L === I.nobodybright ? .3 : L === I.above ? .3 + eOut(k) * .5 : L === I.wind2 ? .8 : L === I.life ? .85 : 1;
        const p = MPOS.marsh; moth(t, { pos: [p[0], lerp(70, L === I.last ? 9 + (1 - k) * 8 : 18, md), p[2] + 1], yaw: Math.PI, pitch: L === I.last ? 0 : -.1, flap: L === I.last ? .25 : .8, sp: L === I.last ? .4 : .8, open: L === I.last ? eIO(k) * .9 : 0, grab: md, sc: 1 });
        dust(t, [0, 0, 27], { R: 14, top: 30, k: md, wind: L >= I.above ? .8 : 0, sz: .28 }) }
      break }
  }
  if (LUGAR(L) === "adentro" || (L === I.eat && t < W(10))) { HOUSES.forEach(H => { if (H !== OURS) H.g.visible = H === BRAN && !branGone }); }
  lights(LL); camara(t); IN.visible = true;
}

// ---------- capa 2D: color ocre por escena, viñeta y subtítulos estilo Volze (una palabra, minúscula, amarillo, contorno negro grueso, 75 % del alto)
const VIG2 = (() => { const c = mk(W, H), g = c.getContext("2d"), r = g.createRadialGradient(W / 2, H * .48, Math.min(W, H) * .28, W / 2, H * .48, Math.max(W, H) * .6); r.addColorStop(0, "rgba(0,0,0,0)"); r.addColorStop(1, "rgba(10,5,0,.32)"); g.fillStyle = r; g.fillRect(0, 0, W, H); return c })();
let POST = {};
COMP = new EffectComposer(R); COMP.setPixelRatio(1); COMP.setSize(W, H); COMP.addPass(new RenderPass(scene, cam)); COMP.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), .55, .6, .72)); COMP.addPass(new OutputPass());
const SUBY = L => [I.tie, I.brightest, I.never].includes(L) ? .22 : .75;   // sube al 22 % cuando la acción está abajo
function subV(t) {
  let i = -1; for (let k = 0; k < WORDS.length; k++) if (t >= WORDS[k][0]) i = k; if (i < 0 || !WORDS[i][1]) return;
  const w = WORDS[i][1].toLowerCase().replace(/[.,!?"“”]/g, ""), edad = t - WORDS[i][0], size = 112, y = H * SUBY(lineAt(t));
  const sc = RES(.55, 1, edad, 600, 16); X.save(); X.translate(W / 2, y); X.scale(sc, sc); X.font = `800 ${size}px 'Baloo 2'`; X.textAlign = "center"; X.textBaseline = "middle"; X.lineJoin = "round";
  X.shadowColor = "rgba(0,0,0,.55)"; X.shadowBlur = 0; X.shadowOffsetY = 7; X.lineWidth = size * .22; X.strokeStyle = "#000"; X.strokeText(w, 0, 0); X.shadowColor = "transparent"; X.fillStyle = "#fff200"; X.fillText(w, 0, 0); X.restore();
}
function overlay(t) {
  const gr = ENV[ENVNOW].grade; X.globalAlpha = gr[1]; X.globalCompositeOperation = "soft-light"; X.fillStyle = gr[0]; X.fillRect(0, 0, W, H); X.globalCompositeOperation = "source-over"; X.globalAlpha = 1; X.drawImage(VIG2, 0, 0);
  if (POST.flash > 0) { X.globalAlpha = Math.min(1, POST.flash); X.fillStyle = "#fff6e0"; X.fillRect(0, 0, W, H); X.globalAlpha = 1 }
  subV(t);
}
window.DBG = { cam, ALL, ME, PELL, WREN, MOTH, THREE, TOMAS };
