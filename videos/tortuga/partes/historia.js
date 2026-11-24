// ★ HISTORIA "We Live On Its Back" — estilo Volze, modo pueblo de día (reglas medidas en analisis/informe.md)
// Shellbrook vive arriba de una tortuga gigante que camina el mar poco profundo: si alguien cava más de una pala, se sumerge.
// Contada en primera persona por un chico de doce años con su primera pala. Personajes propios de bloques (no los de Volze, sin marcas).
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

// ---------- el mar poco profundo, el agua honda y la costa (modo día)
const T_AGUA = tex(1024, 1024, (g, w, h) => { const r = rng(91); g.fillStyle = "#2fa3b4"; g.fillRect(0, 0, w, h);
  for (let k = 0; k < 2600; k++) { const x = r() * w, y = r() * h, l = 20 + r() * 60; g.strokeStyle = r() < .55 ? "rgba(255,255,255,.16)" : "rgba(10,70,90,.18)"; g.lineWidth = 2 + r() * 3; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 6, x + l, y); g.stroke() } }, [24, 24]);
const AGUA = part(new THREE.PlaneGeometry(900, 900), new THREE.MeshStandardMaterial({ map: T_AGUA, color: "#ffffff", roughness: .18, metalness: .25, transparent: true, opacity: .86 }), 0, 0, 0, scene, 0); AGUA.rotation.x = -Math.PI / 2; AGUA.receiveShadow = true;
const T_ARENA = tex(1024, 1024, (g, w, h) => { const r = rng(92); g.fillStyle = "#c8b48a"; g.fillRect(0, 0, w, h); for (let k = 0; k < 9000; k++) { g.fillStyle = r() < .5 ? "rgba(120,100,70,.18)" : "rgba(255,240,210,.18)"; g.fillRect(r() * w, r() * h, 3, 3) } }, [40, 40]);
const FONDO = part(new THREE.PlaneGeometry(900, 900), SMt(T_ARENA, { roughness: 1 }), 0, -3, 0, scene, 0); FONDO.rotation.x = -Math.PI / 2;
// el agua honda: una mancha azul oscuro hacia +x (adonde quiere ir la tortuga)
const HONDA = part(new THREE.CircleGeometry(260, 48), new THREE.MeshStandardMaterial({ color: "#0b3a63", roughness: .2, metalness: .3, transparent: true, opacity: .9 }), 330, .02, -40, scene, 0); HONDA.rotation.x = -Math.PI / 2;
// la costa hacia −x: playa, pasto y colinas
const T_PASTO = tex(1024, 1024, (g, w, h) => { const r = rng(93); g.fillStyle = "#6f9a45"; g.fillRect(0, 0, w, h); for (let k = 0; k < 6000; k++) { const v = r(); g.strokeStyle = v < .4 ? "rgba(60,95,35,.55)" : v < .75 ? "rgba(150,185,80,.45)" : "rgba(200,170,80,.35)"; g.lineWidth = 2; const x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 6, y - 8 - r() * 10); g.stroke() } }, [30, 30]);
const COSTA = new THREE.Group(); scene.add(COSTA); COSTA.position.set(-160, 0, 0);
{ const pl = part(new THREE.PlaneGeometry(60, 700), SMt(T_ARENA), 30, .25, 0, COSTA, 0); pl.rotation.x = -Math.PI / 2; const ps = part(new THREE.PlaneGeometry(400, 700), SMt(T_PASTO), -170, .6, 0, COSTA, 0); ps.rotation.x = -Math.PI / 2;
  const r = rng(94); for (let k = 0; k < 14; k++) { const c = part(new THREE.SphereGeometry(30 + r() * 30, 18, 12), SMt(T_PASTO), -60 - r() * 180, -10, -300 + k * 46, COSTA, 0); c.scale.y = .45 + r() * .3 }
  for (let k = 0; k < 9; k++) { const x = -20 - r() * 40, z = -200 + k * 50; part(RB(6, 5, 6, .2), M_WALL[k % 5], x, 2.8, z, COSTA, 0); const t = part(new THREE.ConeGeometry(5, 3.4, 4), M_SHING, x, 7, z, COSTA, 0); t.rotation.y = Math.PI / 4 } }

// ---------- la tortuga (todo cuelga de TURT: si se inclina, se hunde o gira, el pueblo va con ella)
const TURT = new THREE.Group(); scene.add(TURT);
const SA = 34, SB = 27, SH = 11, RIM = 5;                                   // caparazón: semiejes en z y x, alto, altura del borde sobre el agua
const SY = (x, z) => { const q = 1 - (x / SB) ** 2 - (z / SA) ** 2; return RIM + SH * Math.pow(Math.max(0, q), .62) };   // altura del caparazón en (x, z)
const T_CAPA = tex(2048, 2048, (g, w, h) => { const r = rng(95), X = x => (x / (2 * SB) + .5) * w, Z = z => (z / (2 * SA) + .5) * h;
  g.fillStyle = "#4a4a2e"; g.fillRect(0, 0, w, h);
  // escudos del caparazón (placas) con borde oscuro, vetas y musgo
  const pl = [[0, 0, 9], [0, -15, 8], [0, 15, 8], [-12, -7, 8], [12, -7, 8], [-12, 8, 8], [12, 8, 8], [-21, 0, 6], [21, 0, 6], [0, -26, 6], [0, 26, 6], [-17, -20, 6], [17, -20, 6], [-17, 21, 6], [17, 21, 6]];
  pl.forEach(([x, z, s]) => { g.save(); g.translate(X(x), Z(z)); g.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + .5; g.lineTo(Math.cos(a) * s / (2 * SB) * w, Math.sin(a) * s / (2 * SA) * h) } g.closePath();
    const gr = g.createRadialGradient(0, 0, 10, 0, 0, s / (2 * SB) * w); gr.addColorStop(0, "#7a6a3e"); gr.addColorStop(1, "#4a3e24"); g.fillStyle = gr; g.fill(); g.lineWidth = 14; g.strokeStyle = "#2a2416"; g.stroke();
    g.strokeStyle = "rgba(30,25,15,.35)"; g.lineWidth = 3; for (let k = 1; k < 5; k++) { g.beginPath(); g.arc(0, 0, k * s / (2 * SB) * w / 5, 0, 7); g.stroke() } g.restore() });
  for (let k = 0; k < 900; k++) { g.fillStyle = r() < .6 ? "rgba(90,120,50,.35)" : "rgba(200,190,160,.3)"; g.beginPath(); g.arc(r() * w, r() * h, 4 + r() * 16, 0, 7); g.fill() }
  // el pueblo: tierra apisonada, pasto y una calle de adoquines del centro hacia los bordes
  g.save(); g.beginPath(); g.ellipse(w / 2, h / 2, w * .4, h * .42, 0, 0, 7); g.clip(); g.fillStyle = "#8a7356"; g.fillRect(0, 0, w, h);
  for (let k = 0; k < 4000; k++) { const v = r(); g.fillStyle = v < .4 ? "rgba(90,120,50,.4)" : v < .7 ? "rgba(60,45,30,.25)" : "rgba(255,240,210,.12)"; g.beginPath(); g.arc(r() * w, r() * h, 3 + r() * 10, 0, 7); g.fill() }
  const calle = (x0, z0, x1, z1, an) => { for (let q = 0; q <= 1; q += .004) { const x = X(lerp(x0, x1, q)), y = Z(lerp(z0, z1, q)); for (let k = 0; k < 3; k++) { const v = 110 + r() * 40 | 0; g.fillStyle = `rgb(${v + 8},${v},${v - 10})`; g.beginPath(); g.ellipse(x + (r() - .5) * an, y + (r() - .5) * an, 11, 9, r() * 3, 0, 7); g.fill() } } };
  calle(0, -28, 0, 28, 110); calle(-24, 0, 24, 0, 90); g.restore() });
const M_CAPA = SMt(T_CAPA, { roughness: .9, bumpMap: T_CAPA, bumpScale: 1.5 });
{ const geo = new THREE.PlaneGeometry(2 * SB, 2 * SA, 120, 150); geo.rotateX(-Math.PI / 2); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setY(i, SY(p.getX(i), p.getZ(i))); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, M_CAPA); m.castShadow = m.receiveShadow = true; TURT.add(m);
  // el costado del caparazón hasta el agua, con el borde aserrado y percebes
  const lado = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.08, 9, 64, 1, true), SMt(T_CAPA, { roughness: .95 })); lado.scale.set(SB, 1, SA); lado.position.y = RIM - 4.4; lado.castShadow = true; TURT.add(lado);
  const bor = new THREE.InstancedMesh(new THREE.ConeGeometry(1.4, 2.4, 4), SM("#3a3220", { roughness: 1 }), 48); TURT.add(bor); for (let k = 0; k < 48; k++) { const a = k / 48 * Math.PI * 2; dummy.position.set(Math.cos(a) * SB * 1.04, RIM - .4, Math.sin(a) * SA * 1.04); dummy.rotation.set(Math.PI / 2 + .3, 0, -a + Math.PI / 2); dummy.scale.setScalar(1); dummy.updateMatrix(); dummy.lookAt(Math.cos(a) * 99, RIM - 2, Math.sin(a) * 99); dummy.updateMatrix(); bor.setMatrixAt(k, dummy.matrix) }
  const perc = new THREE.InstancedMesh(new THREE.ConeGeometry(.35, .5, 6), SM("#d8d2c2", { roughness: .9 }), 420); TURT.add(perc); const r = rng(96); for (let k = 0; k < 420; k++) { const a = r() * Math.PI * 2, y = RIM - 1 - r() * 7; dummy.position.set(Math.cos(a) * SB * (1.02 + (RIM - y) * .008), y, Math.sin(a) * SA * (1.02 + (RIM - y) * .008)); dummy.rotation.set(r(), r(), r()); dummy.scale.setScalar(.6 + r() * 1.2); dummy.updateMatrix(); perc.setMatrixAt(k, dummy.matrix) } }
// piel: verde grisácea con escamas, para la cabeza, el cuello y las aletas
const T_PIEL = tex(1024, 1024, (g, w, h) => { const r = rng(97); g.fillStyle = "#8a8a6e"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 70) for (let x = (y / 70 % 2) * 50; x < w; x += 100) { const v = r(); g.fillStyle = v < .5 ? "rgba(60,62,40,.45)" : "rgba(190,185,150,.35)"; g.beginPath(); g.ellipse(x, y, 44 + r() * 8, 30 + r() * 6, 0, 0, 7); g.fill(); g.strokeStyle = "rgba(20,25,15,.4)"; g.lineWidth = 2; g.stroke() }
  for (let k = 0; k < 300; k++) { g.fillStyle = "rgba(60,55,40,.18)"; g.beginPath(); g.arc(r() * w, r() * h, 6 + r() * 20, 0, 7); g.fill() } }, [1, 1]);
const M_PIEL = SMt(T_PIEL, { roughness: .75, bumpMap: T_PIEL, bumpScale: 2 });
const CABEZA = new THREE.Group(); TURT.add(CABEZA); CABEZA.position.set(0, 7.5, SA + 4);
{ const cu = part(new THREE.CylinderGeometry(4.6, 6, 14, 24), M_PIEL, 0, 0, 3, CABEZA, 0); cu.rotation.x = Math.PI / 2 - .35;
  const cab = part(new THREE.SphereGeometry(1, 40, 30), M_PIEL, 0, 4, 13, CABEZA, 0); cab.scale.set(9, 7, 11);
  const pico = part(new THREE.SphereGeometry(1, 30, 20), SM("#4a4a38", { roughness: .5 }), 0, 1.6, 21.5, CABEZA, 0); pico.scale.set(6, 2.6, 4);
  for (const s of [-1, 1]) { part(new THREE.SphereGeometry(.7, 12, 8), SM("#1a1a14"), s * 2.2, 5.6, 23.4, CABEZA, 0);   // narinas
    const ojo = part(new THREE.SphereGeometry(1.9, 28, 20), new THREE.MeshStandardMaterial({ color: "#1a1410", roughness: .08, metalness: .2 }), s * 6.6, 7.2, 17.5, CABEZA, 0);
    part(new THREE.SphereGeometry(.4, 12, 8), SM("#ffffff"), s * 7.0, 8.0, 18.9, CABEZA, 0);
    const par = part(new THREE.SphereGeometry(2.3, 28, 20, 0, Math.PI * 2, 0, Math.PI * .45), M_PIEL, s * 6.6, 7.3, 17.4, CABEZA, 0); par.rotation.x = -.5;   // párpado
    for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI - Math.PI / 2, b = part(new THREE.ConeGeometry(.28, .45, 6), SM("#e2dccb", { roughness: .9 }), s * 6.6 + Math.sin(a) * 1.8, 9.2 + Math.cos(a) * .35 - Math.abs(Math.sin(a)) * .5, 17.4 + Math.cos(a) * 1.1, CABEZA, 0); b.rotation.set(-.3, 0, -Math.sin(a) * .8) } } }   // percebes en los párpados
const CABL = new THREE.Object3D(); CABEZA.add(CABL); CABL.position.set(0, 11, 12);   // arriba de la cabeza (donde se para Garrow)
const ALETAS = [[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sz]) => { const piv = new THREE.Group(); TURT.add(piv); piv.position.set(sx * SB * .78, 2.2, sz * SA * .55); const f = part(new THREE.SphereGeometry(1, 30, 16), M_PIEL, sx * 9, -1.2, 0, piv, 0); f.scale.set(sz > 0 ? 14 : 9, 1.6, sz > 0 ? 6 : 5); f.rotation.y = sx * sz * .35; return { piv, sx, sz } });
{ const c = part(new THREE.ConeGeometry(3, 10, 16), M_PIEL, 0, 2.5, -SA - 3, TURT, 0); c.rotation.x = -Math.PI / 2 - .2 }
// aliento: nube tibia que sale de las narinas · espuma alrededor del cuerpo
const NUBE = Array.from({ length: 18 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#f2f2ee", transparent: true, opacity: 0, depthWrite: false })); scene.add(s); return s });
function aliento(t, k) { CABEZA.updateMatrixWorld(true); const o = new THREE.Vector3(0, 5.6, 24).applyMatrix4(CABEZA.matrixWorld); NUBE.forEach((s, i) => { const q = ((t * .35 + i / 18) % 1); s.visible = k > 0; s.position.set(o.x + Math.sin(i * 2.3) * q * 8, o.y + q * 9, o.z + q * 14); s.scale.setScalar(4 + q * 16); s.material.opacity = (1 - q) * .3 * k }) }
const ESPUMA = Array.from({ length: 30 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#ffffff", transparent: true, opacity: .5, depthWrite: false })); TURT.add(s); const a = i / 30 * Math.PI * 2; s.position.set(Math.cos(a) * SB * 1.12, .3, Math.sin(a) * SA * 1.12); s.scale.set(7, 1.6, 1); return s });
function tortuga(t, { paso = 1, bajo = 0, giro = 0, incl = 0, flinch = 0 } = {}) {
  // camina: las aletas reman (un paso cada tanto) y el cuerpo sube y baja apenas
  const ph = t * .9 * paso; ALETAS.forEach(({ piv, sx, sz }, i) => { const f = Math.sin(ph + (sx * sz > 0 ? 0 : Math.PI)); piv.rotation.set(0, sx * f * .35, sx * (.15 + f * .12)) });
  TURT.position.y = -bajo + Math.sin(ph * 2) * .25 * paso + flinch * Math.sin(t * 40) * .4; TURT.rotation.set(incl * .6 + flinch * .03 * Math.sin(t * 33), giro, incl + flinch * .04 * Math.sin(t * 29));
  CABEZA.rotation.set(Math.sin(t * .4) * .04 - flinch * .2, Math.sin(t * .3) * .08, 0);
  T_AGUA.offset.set(t * .004 * paso, t * .012 * paso); ESPUMA.forEach((s, i) => s.material.opacity = .35 + .2 * Math.sin(t * 2 + i));
}

// ---------- Shellbrook arriba del caparazón (todo hijo de TURT)
const enConcha = (o, x, z, ry = 0, dy = 0) => { if (o.parent !== TURT) TURT.add(o); o.position.set(x, SY(x, z) + dy, z); o.rotation.y = ry; return o };
const casa = (x, z, ry, op = {}) => { const H = house(0, 0, 1, op); H.g.removeFromParent(); enConcha(H.g, x, z, ry, -.3); part(new THREE.BoxGeometry((op.w ?? 7) + .4, 3, 6.4), M_STONE, 0, -1.4, 0, H.g, 0); H.lx = x; H.lz = z; return H };
// calle principal de atrás (−z) hacia la cabeza (+z), casas a los dos lados mirando a la calle
const CASAS = [];
[[-6.8, -18, 1], [6.8, -18, -1], [-6.8, -9, 1], [6.8, -9, -1], [-6.8, 9, 1], [6.8, 9, -1], [-6.8, 18, 1], [-15, -2, 0], [15, -14, 0], [-16, 14, 0], [16, 16, 0]].forEach(([x, z, s], i) => CASAS.push(casa(x, z, s ? s * Math.PI / 2 : (x < 0 ? Math.PI / 2 : -Math.PI / 2), { v: i % 5, h: 4.6 + (i % 3) * .5, w: 6.4 })));
const NUESTRA = casa(6.8, 18, -Math.PI / 2, { v: 2, h: 5, w: 6.4 });
const PANADERIA = casa(18.5, 3, -Math.PI / 2, { v: 4, h: 4.6, w: 6.2 });          // la de Pim (se cae al mar en el recuerdo)
const ESCUELA = casa(-18, -14, Math.PI / 2, { v: 3, h: 5.4, w: 7 });
// reglas amarillas colgadas junto a cada puerta
const T_REGLA = tex(64, 512, (g, w, h) => { g.fillStyle = "#f2c41e"; g.fillRect(0, 0, w, h); g.fillStyle = "#2a2416"; for (let y = 8; y < h; y += 16) g.fillRect(0, y, y % 64 === 8 ? 30 : 16, 3) });
const M_REGLA = SMt(T_REGLA, { roughness: .5 });
[...CASAS, NUESTRA, PANADERIA, ESCUELA].forEach(H => part(new THREE.BoxGeometry(.25, 1.6, .06), M_REGLA, 1.05, 1.7, 3.06, H.walls[0], 0));
// carteles de oficio
const cartelito = (H, txt, bg = "#3a2618") => { const m = part(new THREE.PlaneGeometry(2.4, .6), SMt(tex(512, 128, (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = "#d9c08a"; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12); g.font = "800 72px 'Special Elite'"; g.fillStyle = "#f2e6c4"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, w / 2, h / 2 + 4) })), 0, 3.6, 3.08, H.walls[0], 0); return m };
cartelito(PANADERIA, "BAKERY"); cartelito(ESCUELA, "SCHOOL", "#2a3a5a"); cartelito(CASAS[3], "RULERS", "#5a4a1a");
// la iglesia arriba de todo, con el campanario de Garrow
const IGLESIA = new THREE.Group(); enConcha(IGLESIA, 0, -14, Math.PI, -.4);
{ part(new THREE.BoxGeometry(7, 7, 11), M_STONE, 0, 3.5, 0, IGLESIA, 0); const half = 4.0, rh = 3.4, sl = Math.hypot(half, rh), a = Math.atan2(rh, half); for (const s of [-1, 1]) { const m = part(new THREE.BoxGeometry(sl, .25, 11.6), M_SHING, s * half / 2, 7 + rh / 2, 0, IGLESIA, 0); m.rotation.z = -s * a }
  const tw = new THREE.Group(); tw.position.set(0, 0, 6); IGLESIA.add(tw); part(new THREE.BoxGeometry(3.2, 10, 3.2), M_STONE, 0, 5, 0, tw, 0); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) part(new THREE.BoxGeometry(.35, 3, .35), M_BEAM, a * 1.4, 11.5, b * 1.4, tw, 0); part(new THREE.BoxGeometry(3.6, .3, 3.6), M_BEAM, 0, 13.1, 0, tw, 0); part(new THREE.ConeGeometry(2.4, 6, 4), M_SHING, 0, 16, 0, tw, 0).rotation.y = Math.PI / 4;
  part(new THREE.BoxGeometry(1.6, 2.8, .2), M_PLANK, 0, 1.4, 1.62, tw, 0); 
  const campana = part(new THREE.CylinderGeometry(.5, .9, 1.3, 18, 1, true), SM("#b8893a", { metalness: .8, roughness: .3, side: THREE.DoubleSide }), 0, 11.5, 0, tw, 0); IGLESIA.userData.campana = campana; IGLESIA.userData.torre = tw;
  for (const s of [-1, 1]) part(new THREE.BoxGeometry(.6, 1.2, .2), M_PLANK, s * 2.3, 4.2, 5.52, IGLESIA, 0) }
const ESCALONES = []; for (let k = 0; k < 3; k++) ESCALONES.push(part(new THREE.BoxGeometry(3.4 - k * .4, .3, 1), M_STONE, 0, .15 + k * .3, 8.1 - k * .5, IGLESIA, 0));
// la plaza con el cartel de la regla
const CARTEL = new THREE.Group(); enConcha(CARTEL, 3.2, 3.5, -.4);
{ for (const s of [-1, 1]) part(new THREE.BoxGeometry(.2, 3.2, .2), M_BEAM, s * 1.4, 1.6, 0, CARTEL, 0);
  part(new THREE.PlaneGeometry(3.2, 1.6), SMt(tex(640, 320, (g, w, h) => { g.fillStyle = "#e8dcc0"; g.fillRect(0, 0, w, h); g.strokeStyle = "#3a2618"; g.lineWidth = 16; g.strokeRect(8, 8, w - 16, h - 16); g.font = "800 92px 'Special Elite'"; g.fillStyle = "#7a1e16"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("ONE SHOVEL.", w / 2, 115); g.fillText("NO MORE.", w / 2, 220) })), 0, 2.7, .12, CARTEL, 0) }
// huertas de una pala de tierra (zanahorias) y ropa tendida del lado de la cabeza
const HUERTAS = [[-9, 2], [-12, -11.5]].map(([x, z]) => { const g = new THREE.Group(); enConcha(g, x, z, 0, -.1); part(new THREE.BoxGeometry(3, .35, 2), SMt(T_DIRT), 0, .17, 0, g, 0); for (let k = 0; k < 8; k++) { const zx = -1.1 + (k % 4) * .73, zz = -.5 + Math.floor(k / 4) * 1; part(new THREE.ConeGeometry(.12, .25, 8), SM("#e8792a"), zx, .38, zz, g, 0); for (let j = 0; j < 3; j++) { const h = part(new THREE.ConeGeometry(.05, .5, 4), SM("#4f8a3a"), zx + (j - 1) * .06, .65, zz, g, 0); h.rotation.z = (j - 1) * .4 } } return g });
const TENDEDERO = new THREE.Group(); enConcha(TENDEDERO, -3, 25, 0, 0);
{ for (const s of [-1, 1]) part(new THREE.BoxGeometry(.18, 3.2, .18), M_BEAM, s * 5, 1.6, 0, TENDEDERO, 0); part(new THREE.CylinderGeometry(.02, .02, 10, 4), SM("#ddd"), 0, 3, 0, TENDEDERO, 0).rotation.z = Math.PI / 2;
  TENDEDERO.userData.ropa = ["#e05a4a", "#f2e6c4", "#4a7ab8", "#f2c41e", "#ffffff"].map((c, i) => { const m = part(new THREE.PlaneGeometry(1.3, 1.6), new THREE.MeshStandardMaterial({ color: c, side: THREE.DoubleSide, roughness: .9 }), -3.6 + i * 1.8, 2.2, 0, TENDEDERO, 0); return m }) }
// el mercado de pescado en el borde de adelante a la izquierda
const MERCADO = new THREE.Group(); enConcha(MERCADO, -14, 24, .6, -.2);
{ for (let k = 0; k < 3; k++) { const g = new THREE.Group(); g.position.set(-4 + k * 4, 0, 0); MERCADO.add(g); part(new THREE.BoxGeometry(3, 1, 1.6), M_PLANK, 0, .5, 0, g, 0); for (const s of [-1, 1]) part(new THREE.BoxGeometry(.12, 2.6, .12), M_BEAM, s * 1.4, 1.3, -.7, g, 0);
    const tol = part(new THREE.BoxGeometry(3.4, .08, 2.2), SM(["#c94b4b", "#e8dcc0", "#3f6a8a"][k]), 0, 2.6, 0, g, 0); tol.rotation.x = .25; for (let j = 0; j < 4; j++) { const p = part(new THREE.SphereGeometry(.18, 10, 8), SM("#9ab0b8", { metalness: .4, roughness: .3 }), -1 + j * .65, 1.1, .2, g, 0); p.scale.set(2.6, .7, 1) } } }
// utilería suelta: barriles, cajones, sacos (instanciados sobre el caparazón)
{ const r = rng(98), bar = new THREE.InstancedMesh(new THREE.CylinderGeometry(.42, .38, 1.1, 14), M_PLANK, 26), cra = new THREE.InstancedMesh(new THREE.BoxGeometry(.9, .8, .9), M_PLANK, 26); [bar, cra].forEach(m => { m.castShadow = m.receiveShadow = true; TURT.add(m) });
  for (let k = 0; k < 26; k++) { const x = (r() < .5 ? -1 : 1) * (3.6 + r() * 1.2), z = -24 + r() * 46; dummy.position.set(x, SY(x, z) + .55, z); dummy.rotation.set(0, r() * 6, 0); dummy.scale.setScalar(1); dummy.updateMatrix(); bar.setMatrixAt(k, dummy.matrix);
    const x2 = (r() < .5 ? -1 : 1) * (9 + r() * 6), z2 = -22 + r() * 44; dummy.position.set(x2, SY(x2, z2) + .4, z2); dummy.rotation.set(0, r() * 6, 0); dummy.updateMatrix(); cra.setMatrixAt(k, dummy.matrix) } }
// el pozo de la panadería (recuerdo), el pozo del chico (final) y la tierra que saca
const HOYO = (() => { const g = new THREE.Group(); const m = part(new THREE.CircleGeometry(1, 24), SMt(tex(256, 256, (q, w, h) => { const gr = q.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, "#120a06"); gr.addColorStop(.6, "#3a2414"); gr.addColorStop(1, "#5a3a22"); q.fillStyle = gr; q.fillRect(0, 0, w, h) }), { roughness: 1 }), 0, .12, 0, g, 0); m.rotation.x = -Math.PI / 2; const borde = part(new THREE.TorusGeometry(1.05, .22, 8, 28), SMt(T_DIRT), 0, .12, 0, g, 0); borde.rotation.x = Math.PI / 2; const piel = part(new THREE.CircleGeometry(.6, 20), SMt(T_PIEL, { color: "#d8b0a0", emissive: "#6a2a1a", emissiveIntensity: .25 }), 0, .14, 0, g, 0); piel.rotation.x = -Math.PI / 2; g.userData.piel = piel;
  const mont = part(new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), SMt(T_DIRT), 1.6, 0, .4, g, 0); g.userData.mont = mont; return g })();
const PALA = new THREE.Group(); part(new THREE.CylinderGeometry(.045, .045, 2.0, 8), SM("#8a5a30"), 0, -.6, .1, PALA, 0); { const b = part(new THREE.BoxGeometry(.42, .5, .05), SM("#8a8a90", { metalness: .7, roughness: .35 }), 0, -1.8, .14, PALA, 0) } part(new THREE.BoxGeometry(.4, .07, .07), SM("#8a5a30"), 0, .42, .1, PALA, 0);
const REGLA = new THREE.Group(); part(new THREE.BoxGeometry(.12, 1.2, .03), M_REGLA, 0, -.5, .12, REGLA, 0);
const TELESC = new THREE.Group(); { const tb = part(new THREE.CylinderGeometry(.09, .13, 1.1, 12), SM("#b8893a", { metalness: .8, roughness: .3 }), 0, -.1, .3, TELESC, 0); tb.rotation.x = Math.PI / 2 }
const TAZAS = new THREE.Group(); { const mesa = part(new THREE.BoxGeometry(2, .12, 1.2), M_PLANK, 0, 1.4, 0, TAZAS, 0); for (const [x, z] of [[-.9, -.5], [.9, -.5], [-.9, .5], [.9, .5]]) part(new THREE.BoxGeometry(.1, 1.4, .1), M_BEAM, x, .7, z, TAZAS, 0);
  TAZAS.userData.tazas = [[-.5, .1], [0, -.2], [.55, .15]].map(([x, z], i) => { const c = new THREE.Group(); c.position.set(x, 1.46, z); TAZAS.add(c); part(new THREE.CylinderGeometry(.13, .1, .22, 14), SM(["#e8dcc0", "#c94b4b", "#3f6a8a"][i]), 0, .11, 0, c, 0); part(new THREE.TorusGeometry(.07, .02, 6, 12), SM(["#e8dcc0", "#c94b4b", "#3f6a8a"][i]), .14, .12, 0, c, 0); return c }) }
enConcha(TAZAS, 2.6, 13.5, -Math.PI / 2, -.1);
const PECERA = new THREE.Group(); { part(new THREE.SphereGeometry(.5, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), SMt(T_DIRT), 0, 0, 0, PECERA, 0); part(new THREE.BoxGeometry(.06, .7, .06), M_BEAM, 0, .5, 0, PECERA, 0); part(new THREE.BoxGeometry(.4, .06, .06), M_BEAM, 0, .65, 0, PECERA, 0) }
enConcha(PECERA, 2.4, -2.5, 0, -.05);


// ---------- más detalle (pedido del dueño): faroles, cercas, macetas, leña, algas y piedras en el borde, gaviotas
{ const r = rng(120), poste = SM("#2a2420", { metalness: .5, roughness: .5 }), vid = new THREE.MeshStandardMaterial({ color: "#fff1c8", emissive: "#ffd68a", emissiveIntensity: .2, roughness: .2 });
  [[-3.2, 12], [-3.2, 7], [-3.2, -4], [3.2, -12], [9, 4.5], [-12, 4.5], [3.2, 18], [-3.2, -20]].forEach(([x, z]) => { const g = new THREE.Group(); enConcha(g, x, z); part(new THREE.CylinderGeometry(.07, .1, 3, 8), poste, 0, 1.5, 0, g, 0); part(new THREE.BoxGeometry(.36, .5, .36), vid, 0, 3.15, 0, g, 0); part(new THREE.ConeGeometry(.32, .3, 4), poste, 0, 3.55, 0, g, 0).rotation.y = Math.PI / 4 });
  const est = new THREE.InstancedMesh(new THREE.BoxGeometry(.1, .7, .06), M_PLANK, 120); est.castShadow = true; TURT.add(est); let n = 0;
  [[-9, 2], [-12, -11.5]].forEach(([cx, cz]) => { for (let k = 0; k < 22 && n < 120; k++) { const a = k / 22 * Math.PI * 2, x = cx + Math.cos(a) * 2.1, z = cz + Math.sin(a) * 1.5; dummy.position.set(x, SY(x, z) + .3, z); dummy.rotation.set(0, -a, (r() - .5) * .15); dummy.scale.setScalar(1); dummy.updateMatrix(); est.setMatrixAt(n++, dummy.matrix) } }); est.count = n;
  const mac = new THREE.InstancedMesh(new THREE.CylinderGeometry(.22, .16, .3, 10), SM("#a8553a"), 60), flo = new THREE.InstancedMesh(new THREE.SphereGeometry(.2, 8, 6), SM("#e05a7a"), 60), flo2 = new THREE.InstancedMesh(new THREE.SphereGeometry(.16, 8, 6), SM("#f2d23a"), 60), lena = new THREE.InstancedMesh(new THREE.CylinderGeometry(.09, .09, 1, 6), SM("#7a5030"), 160);
  [mac, flo, flo2, lena].forEach(m => { m.castShadow = true; TURT.add(m) });
  let nm = 0; for (let k = 0; k < 200 && nm < 60; k++) { const sx = r() < .5 ? -1 : 1, x = sx * (3.55 + r() * .15), z = -21 + r() * 42; if (Math.abs(z) < 6) continue; const y = SY(x, z);
    dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(1); dummy.position.set(x, y + .15, z); dummy.updateMatrix(); mac.setMatrixAt(nm, dummy.matrix); dummy.position.set(x, y + .4, z); dummy.updateMatrix(); flo.setMatrixAt(nm, dummy.matrix); dummy.position.set(x + .1, y + .5, z + .1); dummy.updateMatrix(); flo2.setMatrixAt(nm, dummy.matrix); nm++ }
  mac.count = flo.count = flo2.count = nm;
  for (let k = 0; k < 160; k++) { const pila = k / 20 | 0, sx = pila % 2 ? 1 : -1, z0 = -19 + pila * 5.2, x = sx * 3.6, z = z0 + (k % 5) * .2 - .4, y = SY(x, z) + .1 + ((k % 20) / 5 | 0) * .18; dummy.position.set(x, y, z); dummy.rotation.set(Math.PI / 2, 0, 0); dummy.scale.setScalar(1); dummy.updateMatrix(); lena.setMatrixAt(k, dummy.matrix) }
  const alga = new THREE.InstancedMesh(new THREE.ConeGeometry(.25, 1.6, 5), SM("#3a6a3a", { roughness: .9 }), 260), pie = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.5, 0), SM("#8a8478", { roughness: 1 }), 140); [alga, pie].forEach(m => { m.castShadow = true; TURT.add(m) });
  for (let k = 0; k < 260; k++) { const a = r() * Math.PI * 2, f = .86 + r() * .13, x = Math.cos(a) * SB * f, z = Math.sin(a) * SA * f; dummy.position.set(x, SY(x, z) + .4, z); dummy.rotation.set((r() - .5) * .6, r() * 6, (r() - .5) * .6); dummy.scale.set(1, .6 + r(), 1); dummy.updateMatrix(); alga.setMatrixAt(k, dummy.matrix) }
  for (let k = 0; k < 140; k++) { const a = r() * Math.PI * 2, f = .7 + r() * .28, x = Math.cos(a) * SB * f, z = Math.sin(a) * SA * f; dummy.position.set(x, SY(x, z) + .1, z); dummy.rotation.set(r() * 3, r() * 3, r() * 3); dummy.scale.setScalar(.4 + r() * .9); dummy.updateMatrix(); pie.setMatrixAt(k, dummy.matrix) } }
const GAVIOTAS = Array.from({ length: 9 }, (_, i) => { const g = new THREE.Group(); scene.add(g); const m = SM("#f4f4f0"); const c = part(new THREE.CapsuleGeometry(.18, .6, 4, 8), m, 0, 0, 0, g, 0); c.rotation.x = Math.PI / 2;
  const alas = [-1, 1].map(sx => { const a = new THREE.Group(); a.position.x = sx * .12; g.add(a); part(new THREE.BoxGeometry(1.1, .04, .35), m, sx * .55, 0, 0, a, 0); part(new THREE.BoxGeometry(.3, .045, .36), SM("#2a2a2a"), sx * 1.0, 0, 0, a, 0); return a });
  g.userData = { alas, r: 30 + i * 6, h: 26 + (i % 3) * 5, v: .25 + (i % 4) * .05, ph: i * 1.7 }; return g });
function gaviotas(t) { TURT.updateMatrixWorld(true); const c = TURT.getWorldPosition(new THREE.Vector3()); GAVIOTAS.forEach(g => { const u = g.userData, a = t * u.v + u.ph; g.position.set(c.x + Math.cos(a) * u.r, u.h + Math.sin(t * .7 + u.ph) * 2, c.z + Math.sin(a) * u.r); g.rotation.set(0, -a, Math.sin(t * .5 + u.ph) * .2); u.alas.forEach((al, i) => al.rotation.z = (i ? -1 : 1) * Math.sin(t * 6 + u.ph) * .5) }) }

// nubes con forma y un muelle con botes en la costa
const NUBES = Array.from({ length: 16 }, (_, i) => { const r = rng(300 + i), g = new THREE.Group(); scene.add(g); const a = r() * Math.PI * 2, d = 160 + r() * 160; g.position.set(Math.cos(a) * d, 70 + r() * 50, Math.sin(a) * d);
  for (let k = 0; k < 6; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: "#ffffff", transparent: true, opacity: .85, depthWrite: false, fog: false })); sp.position.set((r() - .5) * 40, (r() - .3) * 8, (r() - .5) * 20); sp.scale.set(30 + r() * 30, 16 + r() * 12, 1); g.add(sp) } return g });
{ const mu = new THREE.Group(); COSTA.add(mu); mu.position.set(40, 0, 10); for (let k = 0; k < 10; k++) part(new THREE.BoxGeometry(2, .25, 1), M_PLANK, k * 2, 1.2, 0, mu, 0); for (let k = 0; k < 6; k++) part(new THREE.CylinderGeometry(.18, .18, 3, 8), M_BEAM, k * 4, 0, .6, mu, 0);
  [["#c94b4b", 6, 5], ["#3f6a8a", 14, -5], ["#e8dcc0", 24, 6]].forEach(([c, x, z]) => { const b = part(new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), SM(c), x, .6, z, mu, 0); b.scale.set(1.2, .7, 3) }) }

// ---------- elenco: diseños propios de bloques (nada del protagonista de Volze ni marcas)
const ME = kid({ skin: "#e8b48c", shirt: "#d1872e", cloth: "plain", pants: "#3a4a5a", shoes: "#4a3020", hair: "#3a2416", style: "despeinado" });
const ME6 = kid({ skin: "#e8b48c", shirt: "#d1872e", cloth: "plain", pants: "#3a4a5a", shoes: "#4a3020", hair: "#3a2416", style: "despeinado" }); ME6.body.scale.setScalar(.7);
const QUILL = kid({ skin: "#f0c6a0", shirt: "#2e2e4a", cloth: "suit", alt: "#a82a2a", pants: "#2e2e4a", shoes: "#111", hair: "#9a9a9a", style: "corto" });
const PIM = kid({ skin: "#c98e64", shirt: "#f2ece0", cloth: "plain", pants: "#5a4632", shoes: "#2a2420", hair: "#2b211b", style: "corto" });
const GARROW = kid({ skin: "#d9b08c", shirt: "#3a5a4a", cloth: "sweater", alt: "#c9b48a", pants: "#3a3236", shoes: "#2a2420", hair: "#e9e4dc", style: "corto" });
const FOLK = [["#7a3a2a", "plaid", "#3a3236", "#2b211b", "corto", "#c98e64"], ["#3f6a8a", "sweater", "#3a3f4a", "#6b3f22", "melena", "#f2cfae"], ["#5a7a3a", "plain", "#3a2f28", "#c9a06a", "liso", "#e8b48c"], ["#8a5a8a", "cardigan", "#3a3236", "#9a9a9a", "rodete", "#efc8a8"], ["#c9a23a", "plain", "#2e3a59", "#1d1a17", "rulos", "#8a5a3c"], ["#3a4a5a", "plain", "#2a2420", "#7a4a2a", "puntas", "#f2cfae"]].map(([sh, c, p, h, st, sk]) => { const k = kid({ skin: sk, shirt: sh, cloth: c, alt: "#d9c7a0", pants: p, shoes: "#2a2420", hair: h, style: "corto" }); k.peloR6 = [st, h]; return k });
const EXT = [["#b85a3a", "#3a3f4a", "#efc8a8"], ["#4a8a6a", "#3a2f28", "#8a5a3c"], ["#e0c060", "#2e3a59", "#f2cfae"], ["#7a4a8a", "#2a2420", "#c98e64"]].map(([sh, p, sk]) => kid({ skin: sk, shirt: sh, cloth: "plain", pants: p, shoes: "#2a2420", hair: "#2b211b", style: "corto" }));
const ALL = [ME, ME6, QUILL, PIM, GARROW, ...FOLK, ...EXT];
ALL.forEach(k => TURT.add(k.g));   // todos viven arriba de la tortuga
const handW = (k, h = "R") => { k.g.updateMatrixWorld(true); return (h === "R" ? k.handR : k.handL).getWorldPosition(new THREE.Vector3()) };
const attach = (obj, k, h = "R", o = [0, -.15, .1]) => { const hand = h === "R" ? k.handR : k.handL; if (obj.parent !== hand) hand.add(obj); obj.position.set(...o); obj.visible = true };
// en la concha: los personajes se paran sobre la superficie del caparazón
const placeC = (k, x, z, ry = 0) => { k.g.visible = true; k.g.position.set(x, SY(x, z), z); k.g.rotation.set(0, ry, 0) };
const faceToC = (k, x, z) => k.g.rotation.y = Math.atan2(x - k.g.position.x, z - k.g.position.z);

// ---------- estilo de bloques como el de Volze (pedido del dueño, 24-nov-2026): cabeza = cubo redondeado más ancho que alto, sin cuello,
// cara impresa al frente (ojos ovalados negros con brillo, cejas y boca gruesas); torso = un bloque; brazos y piernas = un bloque cada
// uno, del mismo ancho, con la piel abajo del brazo y el calzado pintado en la pierna. Diseños de cara propios (no la cara de fábrica de Roblox).
// Mantiene los mismos puntos de giro que kid(): pose(), los primeros planos (shF) y las velas siguen funcionando.
const CARAS_R6 = {};
function caraR6(kind) {
  if (CARAS_R6[kind]) return CARAS_R6[kind];
  return CARAS_R6[kind] = tex(512, 384, (g, w, h) => {
    const ink = "#141014", ex = [176, 336], ey = 165;
    const K = { neutral: [1, 0, "flat"], worried: [1, 1, "frown"], gloomy: [.8, 1, "flat"], pleading: [1, 1, "frown"], sad: [1, 1, "frown"], scared: [1.35, 1.2, "o"], terrified: [1.5, 1.4, "scream"], horrified: [1.45, 1.3, "scream"], panic: [1.4, 1.3, "scream"],
      shock: [1.35, -1, "o"], gasp: [1.35, -1, "o"], happy: [1, 0, "smile"], warm: [.9, 0, "smile"], laugh: [.95, -.5, "open"], excited: [1.15, -.6, "open"], starstruck: [1.2, -.8, "open"], hopeful: [1.1, .6, "smile"],
      relieved: [.9, .8, "smile"], squint: [.6, -1.2, "flat"], suspicious: [.7, -1.4, "smirk"], determined: [.85, -1.4, "smirk"], brave: [.9, -1.2, "flat"], angry: [.9, -1.6, "frown"], curious: [1.15, -.4, "o"] }[kind] || [1, 0, "flat"];
    const [es, bro, boca] = K;
    g.fillStyle = ink; g.strokeStyle = ink; g.lineCap = "round"; g.lineJoin = "round";
    // ojos: óvalo negro vertical con un brillo blanco
    ex.forEach((x, i) => { g.fillStyle = ink; g.beginPath(); g.ellipse(x, ey, 26 * Math.min(1.2, es), 46 * Math.min(1.25, es), 0, 0, 7); g.fill(); g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(x - 8, ey - 18 * Math.min(1.25, es), 8, 11, 0, 0, 7); g.fill();
      // cejas gruesas: bro > 0 preocupada (sube adentro), bro < 0 enojada (baja adentro)
      g.strokeStyle = ink; g.lineWidth = 18; const s = i ? 1 : -1, yb = ey - 10 - 66 * Math.min(1.25, es) - (bro < 0 && boca === "o" ? 14 : 0); g.beginPath(); g.moveTo(x - s * 36, yb + bro * 10 * -1 * 0 + (bro > 0 ? 8 : bro < 0 ? -12 : 0)); g.lineTo(x + s * 26, yb + (bro > 0 ? -14 : bro < 0 ? 12 : 0)); g.stroke() });
    // boca gruesa
    g.fillStyle = ink; g.lineWidth = 18; const my = 290;
    if (boca === "flat") { g.beginPath(); g.moveTo(222, my); g.lineTo(290, my); g.stroke() }
    if (boca === "frown") { g.beginPath(); g.moveTo(214, my + 16); g.quadraticCurveTo(256, my - 22, 298, my + 16); g.stroke() }
    if (boca === "smile") { g.beginPath(); g.moveTo(206, my - 14); g.quadraticCurveTo(256, my + 34, 306, my - 14); g.stroke() }
    if (boca === "smirk") { g.beginPath(); g.moveTo(220, my + 6); g.quadraticCurveTo(268, my + 10, 300, my - 14); g.stroke() }
    if (boca === "o") { g.beginPath(); g.ellipse(256, my, 22, 28, 0, 0, 7); g.fill() }
    if (boca === "open") { g.beginPath(); g.moveTo(196, my - 22); g.quadraticCurveTo(256, my + 62, 316, my - 22); g.closePath(); g.fill(); g.fillStyle = "#c94b5a"; g.beginPath(); g.ellipse(256, my + 18, 26, 10, 0, 0, 7); g.fill() }
    if (boca === "scream") { g.beginPath(); g.moveTo(214, my - 26); g.quadraticCurveTo(256, my - 44, 298, my - 26); g.lineTo(306, my + 40); g.quadraticCurveTo(256, my + 58, 206, my + 40); g.closePath(); g.fill(); g.fillStyle = "#ffffff"; g.fillRect(224, my - 30, 64, 12) }
  });
}
const LIMBT = {};
const brazoTex = (shirt, skin, manga) => LIMBT["b" + shirt + skin + manga] ||= tex(128, 256, (g, w, h) => { g.fillStyle = skin; g.fillRect(0, 0, w, h); const y = h * manga; g.fillStyle = shirt; g.fillRect(0, 0, w, y); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(255,255,255,.06)"); gr.addColorStop(1, "rgba(0,0,0,.14)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(0,0,0,.18)"; g.fillRect(0, y - 6, w, 6) });
const piernaTex = (pants, shoes) => LIMBT["p" + pants + shoes] ||= tex(128, 256, (g, w, h) => { g.fillStyle = pants; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(0,0,0,.12)"; g.fillRect(w / 2 - 2, 0, 4, h * .86); g.fillStyle = shoes; g.fillRect(0, h * .86, w, h * .14); g.fillStyle = "rgba(255,255,255,.12)"; g.fillRect(0, h * .86, w, 5); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(255,255,255,.05)"); gr.addColorStop(1, "rgba(0,0,0,.12)"); g.fillStyle = gr; g.fillRect(0, 0, w, h) });
function robloxify(k, { skin, shirt, alt = "#ffffff", cloth = "plain", pants, shoes = "#2a2420", manga = .82, pelo = null }) {
  k.r6 = true; k.skin = skin;
  const quitar = grp => [...grp.children].forEach(c => { if (c.isMesh) grp.remove(c) });
  // brazos y piernas: un solo bloque cada uno (mismo ancho), con la misma articulación que kid()
  [k.legL, k.legR].forEach(p => { quitar(p); const m = new THREE.MeshStandardMaterial({ map: piernaTex(pants, shoes), roughness: .7 }); part(RB(.5, 1.02, .5, .045), m, 0, -.5, 0, p, 0) });
  [k.armL, k.armR].forEach((p, i) => { quitar(p); const m = new THREE.MeshStandardMaterial({ map: brazoTex(shirt, skin, manga), roughness: .7 }); part(RB(.5, 1.04, .5, .045), m, 0, -.44, 0, p, 0); const hnd = new THREE.Object3D(); hnd.position.set(0, -.86, 0); p.add(hnd); if (i) k.handR = hnd; else k.handL = hnd });
  k.handMat = new THREE.MeshStandardMaterial({ color: skin });   // power() lo toca: material suelto, no pinta los brazos
  // torso: un bloque con la ropa estampada
  [...k.body.children].forEach(c => { if (c.isMesh) k.body.remove(c) });
  const sh = SM(shirt), fr = new THREE.MeshStandardMaterial({ map: clothTex(cloth, shirt, alt), roughness: .75 }), bk = new THREE.MeshStandardMaterial({ map: clothTex(cloth, shirt, alt, true), roughness: .75 });
  part(RB(1.04, 1.04, .52, .045), boxMats(sh, fr, bk), 0, 1.54, 0, k.body, 0);
  // cabeza: cubo redondeado más ancho que alto, sin cuello, cara impresa al frente
  [...k.head.children].forEach(c => { if (c.isMesh && (c.geometry.type === "LatheGeometry" || (c.geometry.type === "CylinderGeometry" && c !== k.decal))) k.head.remove(c) });
  part(RB(.7, .62, .66, .15), SM(skin, { roughness: .55 }), 0, .38, 0, k.head, 0);
  k.decal.geometry = new THREE.PlaneGeometry(.62, .465); k.decal.position.set(0, .39, .332); k.decal.material.map = caraR6("neutral"); k.decal.material.needsUpdate = true;
  // pelo de piezas facetadas (como el canal: mechones con caras planas, en punta y con volumen arriba); se saca el pelo blando de kid()
  [...k.head.children].forEach(c => { if (c.isMesh && (c.userData.shell || (c.material && c.material.map === HAIRT))) k.head.remove(c) });
  if (pelo) peloFacetado(k.head, ...pelo);
}
function peloFacetado(head, estilo, color) {
  const m = new THREE.MeshStandardMaterial({ color, roughness: .55, flatShading: true }), md = new THREE.MeshStandardMaterial({ color: new THREE.Color(color).multiplyScalar(.78), roughness: .6, flatShading: true });
  const blk = (w, hh, d, x, y, z, rx = 0, ry = 0, rz = 0, mm = m) => { const p = part(RB(w, hh, d, .05, 1), mm, x, y, z, head, 0); p.rotation.set(rx, ry, rz); return p };
  const pico = (r, l, x, y, z, rx, rz, mm = m) => { const c = part(new THREE.ConeGeometry(r, l, 5), mm, x, y, z, head, 0); c.rotation.set(rx, 0, rz); return c };
  const bola = (r, x, y, z, mm = m) => part(new THREE.IcosahedronGeometry(r, 0), mm, x, y, z, head, 0);
  // casquete: arriba, atrás y costados (tapa las esquinas del cubo de la cabeza)
  blk(.76, .22, .72, 0, .77, -.01); blk(.76, .4, .14, 0, .52, -.34, 0, 0, 0, md); for (const s of [-1, 1]) blk(.08, .18, .5, s * .37, .7, -.08, 0, 0, 0, md);
  if (estilo === "puntas") { [[-.22, .12, -.45], [0, .18, 0], [.22, .12, .45], [-.12, -.1, -.3], [.14, -.1, .3], [0, -.22, 0], [-.28, -.18, -.75], [.28, -.18, .75]].forEach(([x, z, a]) => pico(.13, .4, x, 1.0, z, .35 + z * .8, -a * .55));
    [-.2, 0, .2].forEach((x, i) => pico(.11, .3, x, .82, .3, 1.15, (i - 1) * .35)) }
  if (estilo === "liso") { blk(.62, .14, .12, .04, .66, .34, -.2, 0, -.12); blk(.42, .12, .5, -.1, .86, .06, 0, 0, .1) }
  if (estilo === "corto") { blk(.66, .08, .1, 0, .66, .35, -.15) }
  if (estilo === "trenzas") { blk(.66, .12, .12, 0, .66, .34, -.2); for (const s of [-1, 1]) for (let k2 = 0; k2 < 4; k2++) bola(.1 - k2 * .01, s * .4, .42 - k2 * .16, -.1, k2 % 2 ? md : m) }
  if (estilo === "rodete") { blk(.6, .1, .1, 0, .66, .35, -.15); bola(.2, 0, .9, -.2); blk(.3, .06, .3, 0, .82, -.2, 0, .6, 0, md) }
  if (estilo === "melena" || estilo === "largo") { blk(.7, .14, .12, 0, .65, .34, -.2); const L = estilo === "largo" ? .9 : .6; blk(.8, L, .16, 0, .66 - L / 2, -.37, 0, 0, 0, md); for (const s of [-1, 1]) blk(.12, L - .1, .5, s * .4, .7 - L / 2, -.06) }
  if (estilo === "rulos") { for (let k2 = 0; k2 < 16; k2++) { const a = k2 / 16 * Math.PI * 2, rr = .22 + (k2 % 3) * .06; bola(.12, Math.cos(a) * rr, .86 + (k2 % 2) * .05, Math.sin(a) * rr * .9 - .05, k2 % 4 ? m : md) } }
}
const setFace0 = setFace;
setFace = (k, f) => { if (!k.r6) return setFace0(k, f); const t = caraR6(f); if (k.decal.material.map !== t) { k.decal.material.map = t; k.decal.material.needsUpdate = true } };
robloxify(ME, { skin: "#e8b48c", shirt: "#d1872e", pants: "#3a4a5a", shoes: "#4a3020", pelo: ["puntas", "#3a2416"] });
robloxify(ME6, { skin: "#e8b48c", shirt: "#d1872e", pants: "#3a4a5a", shoes: "#4a3020", pelo: ["puntas", "#3a2416"] });
robloxify(QUILL, { skin: "#f0c6a0", shirt: "#2e2e4a", cloth: "suit", alt: "#a82a2a", pants: "#2e2e4a", shoes: "#111", pelo: ["corto", "#9a9a9a"] });
robloxify(PIM, { skin: "#c98e64", shirt: "#f2ece0", pants: "#5a4632", pelo: ["corto", "#2b211b"] });
robloxify(GARROW, { skin: "#d9b08c", shirt: "#3a5a4a", cloth: "sweater", alt: "#c9b48a", pants: "#3a3236", pelo: ["rodete", "#e9e4dc"] });
FOLK.forEach((k, i) => robloxify(k, { skin: ["#c98e64", "#f2cfae", "#e8b48c", "#efc8a8", "#8a5a3c", "#f2cfae"][i], shirt: ["#7a3a2a", "#3f6a8a", "#5a7a3a", "#8a5a8a", "#c9a23a", "#3a4a5a"][i], cloth: ["plaid", "sweater", "plain", "cardigan", "plain", "plain"][i], alt: "#d9c7a0", pants: ["#3a3236", "#3a3f4a", "#3a2f28", "#3a3236", "#2e3a59", "#2a2420"][i], pelo: k.peloR6 }));
EXT.forEach((k, i) => robloxify(k, { skin: ["#efc8a8", "#8a5a3c", "#f2cfae", "#c98e64"][i], shirt: ["#b85a3a", "#4a8a6a", "#e0c060", "#7a4a8a"][i], pants: ["#3a3f4a", "#3a2f28", "#2e3a59", "#2a2420"][i], pelo: [["liso", "#6b3f22"], ["rulos", "#1d1a17"], ["trenzas", "#c9a06a"], ["corto", "#3a2416"]][i] }));
// sombrero de copa del intendente, gorro de panadero, barba de Garrow
{ const hm = SM("#1a1a1e", { roughness: .5 }); part(new THREE.CylinderGeometry(.34, .34, .6, 18), hm, 0, 1.05, 0, QUILL.head, 0); part(new THREE.CylinderGeometry(.52, .52, .05, 20), hm, 0, .76, 0, QUILL.head, 0); part(new THREE.CylinderGeometry(.35, .35, .1, 18), SM("#a82a2a"), 0, .82, 0, QUILL.head, 0);
  part(new THREE.CylinderGeometry(.36, .3, .4, 16), SM("#ffffff"), 0, .9, 0, PIM.head, 0); part(new THREE.SphereGeometry(.45, 16, 10), SM("#ffffff"), 0, 1.18, 0, PIM.head, 0); part(RB(.9, .7, .1, .04), SM("#ffffff"), 0, 1.5, .27, PIM.body, 0);
  part(RB(.5, .26, .14, .06, 1), new THREE.MeshStandardMaterial({ color: "#e9e4dc", flatShading: true }), 0, .17, .34, GARROW.head, 0) }


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
ENV.dia = { top: "#5aa0e8", hor: "#cfe4f2", fog: .004, hemi: 1.8, hemiG: "#8a7a60", sun: 3.0, sunCol: "#fff1dc", exp: 1.1, grade: ["#ffffff", 0] };
let ENVNOW = "noche";
function setEnv(a) { const A = ENV[a]; ENVNOW = a; SKY.material.uniforms.top.value.set(A.top); SKY.material.uniforms.hor.value.set(A.hor); scene.background.set(A.hor); scene.fog.color.set(A.hor); scene.fog.density = A.fog;
  hemi.intensity = A.hemi; hemi.color.set("#c4c4d8"); hemi.groundColor.set(A.hemiG); sun.intensity = A.sun; sun.color.set(A.sunCol); R.toneMappingExposure = A.exp }
sun.position.set(-40, 60, -20); sun.target.position.set(0, 0, 0); Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 160 }); sun.shadow.camera.updateProjectionMatrix();

// ---------- las frases (índices de voz.json)
//@ORDEN
const I = Object.fromEntries(ORDEN.map((n, i) => [n, i]));
const LUGAR = L => [I.heart, I.hum].includes(L) ? "noche" : (L >= I.pim && L <= I.firstone) ? "recuerdo" : "pueblo";


// ---------- planos: cada frase tiene una lista de tomas; cada toma empieza en una palabra (w) y la cámara se mueve todo el tiempo (p→p1, l→l1)
// barrido de 0,2 s entre tomas del mismo lugar; corte seco cuando cambia el lugar. f = fov (gran angular en los primeros planos)
const sh = (w, p, p1, l, l1, f = 55, o = {}) => ({ w, p, p1: p1 || p, l, l1: l1 || l, f, ...o });
const add = (a, b) => a.map((v, i) => v + b[i]);
// primeros planos a partir de la cara: la cámara se pone delante de la cabeza (ang gira alrededor, dy sube) y se acerca de d0 a d1
const headW = k => { k.g.updateMatrixWorld(true); const q = k.head.getWorldQuaternion(new THREE.Quaternion()); return k.head.getWorldPosition(new THREE.Vector3()).addScaledVector(new THREE.Vector3(0, 1, 0).applyQuaternion(q), .38 * k.body.scale.y * k.g.scale.y) };
const fwdW = (k, ang) => new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang)).applyQuaternion(k.head.getWorldQuaternion(new THREE.Quaternion()));
const shF = (w, k, d0, d1, ang = 0, dy = 0, f = 62, ldy = 0, o = {}) => { const P = d => () => { const h = headW(k), v = fwdW(k, ang); return [h.x + v.x * d, h.y + v.y * d + dy, h.z + v.z * d] }, Lk = () => { const h = headW(k); return [h.x, h.y + ldy, h.z] }; return sh(w, P(d0), P(d1), Lk, Lk, f, o) };
// helpers: puntos en el caparazón (se mueven con la tortuga) y alturas sobre la superficie
const TW = v => () => TURT.localToWorld(new THREE.Vector3(...v)).toArray();
const TS = (x, dy, z) => TW([x, SY(x, z) + dy, z]);
const CABW = v => () => { CABEZA.updateMatrixWorld(true); return CABEZA.localToWorld(new THREE.Vector3(...v)).toArray() };
const HOYOP = (o = [0, 0, 0]) => () => HOYO.localToWorld(new THREE.Vector3(...o)).toArray();
const TOWR = o => () => { const tw = IGLESIA.userData.torre; tw.updateMatrixWorld(true); return tw.localToWorld(new THREE.Vector3(...o)).toArray() };
const KW = (k, o) => () => add(k.g.getWorldPosition(new THREE.Vector3()).toArray(), o);
// lugares del pueblo (todos en calles o en la plaza, lejos de las paredes)
const HUERTA0 = [-9, 2], PEZ = [2.4, -2.5], HOYO_REGLA = [-9, -2.6], HOYO_PANADERIA = [13.2, 2], HOYO_CHICO = [13, -6];
const SHOTS = {
  [I.hook]: [sh(0, TW([-70, 22, 92]), TW([-62, 20, 86]), TW([0, 6, 22]), TW([0, 6, 20]), 52), sh(5, TW([26, 12, 84]), TW([22, 11, 80]), CABW([0, 5, 16]), CABW([0, 5, 16]), 52)],
  [I.cost]: [sh(0, HOYOP([-2.2, 3.6, 2.6]), HOYOP([-1.9, 3.2, 2.2]), HOYOP([0, 0, 0]), HOYOP([0, 0, 0]), 58), sh(4, CABW([14, -1, 44]), CABW([12, 0, 40]), CABW([0, 6, 12]), CABW([0, 5, 12]), 56)],
  [I.down]: [sh(0, [-90, 30, 40], [-80, 24, 30], TW([0, 6, 0]), TW([0, 0, 0]), 52)],
  [I.walks]: [sh(0, TW([-52, 1.2, 30]), TW([-50, 1.4, 22]), TW([-24, -1, 20]), TW([-24, -1, 16]), 66), sh(5, TW([-70, 24, -60]), TW([-62, 22, -50]), TW([0, 6, 0]), TW([0, 6, 6]), 48)],
  [I.rattle]: [sh(0, () => add(TAZAS.localToWorld(new THREE.Vector3(0, 1.5, 0)).toArray(), [1.2, .6, 1.4]), null, () => TAZAS.localToWorld(new THREE.Vector3(0, 1.5, 0)).toArray(), null, 60), sh(4, TS(0, 2.6, -4), TS(0, 2.8, -1), TS(0, 3, 14), TS(0, 3, 14), 56)],
  [I.carrots]: [shF(0, ME, 2.4, 2.0, .7, .3, 64, -.8), sh(4, TS(-10.8, 2.0, -.6), TS(-10.5, 1.9, -.3), TS(HUERTA0[0], .3, HUERTA0[1]), null, 60)],
  [I.goldfish]: [sh(0, TS(-.9, 1.7, -5), TS(-.7, 1.5, -4.6), TS(PEZ[0], 1.2, PEZ[1]), TS(PEZ[0], 1.2, PEZ[1]), 60), shF(5, ME, 1.8, 1.5, .5, 0, 66)],
  [I.ruler]: [shF(0, QUILL, 2.2, 1.9, .5, .1, 64), sh(6, HOYOP([-4, 7, -4]), HOYOP([-3.6, 6.4, -3.6]), HOYOP([0, 0, 0]), null, 58)],
  [I.sign]: [sh(0, TS(3.2, 2.6, 9.8), TS(3.2, 2.7, 9.0), TS(3.2, 2.7, 3.5), TS(3.2, 2.7, 3.5), 50)],
  [I.doors]: [sh(0, TS(-1.6, 2.0, -6.2), TS(-1.3, 2.0, -11), TS(3.8, 1.8, -8), TS(3.8, 1.8, -10.5), 60)],
  [I.twelve]: [shF(0, ME, 2.6, 2.2, .4, .3, 62), shF(8, ME, 2.6, 2.2, -.7, -.2, 60, -.5)],
  [I.edge]: [sh(0, TS(.8, 3.6, 19.5), TS(.8, 3.8, 20.3), CABW([0, 6, 16]), CABW([0, 6, 16]), 54)],
  [I.church]: [sh(0, TW([-30, 6, 90]), TW([-27, 6, 87]), TW([0, 12, 10]), TW([0, 12, 10]), 50)],
  [I.barnacles]: [sh(0, CABW([12, 11, 25]), CABW([11, 10.5, 23.5]), CABW([6.6, 8.6, 17.6]), CABW([6.6, 8.6, 17.6]), 50)],
  [I.breath]: [sh(0, CABW([-22, 6, 30]), CABW([-20, 7, 29]), CABW([0, 9, 26]), CABW([0, 11, 28]), 56), sh(7, TS(-6, 2, 22.4), TS(-5.6, 2, 22.8), TS(-3, 2.6, 25), TS(-3, 2.6, 25), 60)],
  [I.heart]: [sh(0, TS(3, 3, 10), TS(2.6, 2.8, 10.5), TS(0, .5, 13.2), null, 56), sh(10, TS(2.6, 2.6, 13.5), TS(2.2, 2.6, 12.5), TS(-3.8, 2.8, 9), null, 58)],
  [I.hum]: [sh(0, TS(2.6, 2.6, 13.5), TS(2.2, 2.6, 12.5), TS(-3.8, 2.8, 9), TS(-3.8, 2.8, 9), 58)],
  [I.pim]: [shF(0, PIM, 2.6, 2.2, .6, .2, 62)],
  [I.two]: [sh(0, HOYOP([1.2, 3.4, 3.0]), HOYOP([1.1, 3.0, 2.7]), HOYOP([0, 0, 0]), HOYOP([0, 0, 0]), 60)],
  [I.cold]: [shF(0, ME6, 1.5, 1.3, .3, 0, 66)],
  [I.stopped]: [sh(0, TW([-50, 4, 60]), TW([-48, 4, 56]), CABW([0, 6, 10]), CABW([0, 6, 10]), 56)],
  [I.tilted]: [sh(0, TW([-60, 2, 30]), TW([-58, 2.4, 28]), TW([0, 6, 0]), TW([0, 6, 0]), 54, { shake: .12 })],
  [I.water]: [sh(0, TS(4, 1.2, -2), TS(4.4, 1.2, -2.2), TS(12, 0, -4), TS(12, 0, -4), 60)],
  [I.bakery]: [sh(0, TW([60, 3, 10]), TW([56, 3, 8]), () => PANADERIA.g.getWorldPosition(new THREE.Vector3()).toArray(), null, 54)],
  [I.filled]: [sh(0, HOYOP([1.8, 2.0, 1.6]), HOYOP([1.5, 1.8, 1.3]), HOYOP([0, .2, 0]), HOYOP([0, .2, 0]), 60)],
  [I.rose]: [sh(0, TW([-50, 1, 30]), TW([-48, 1.4, 28]), TW([0, 6, 0]), TW([0, 8, 0]), 54)],
  [I.rulers]: [shF(0, PIM, 3.2, 2.8, .5, -.2, 60, -.6)],
  [I.firstone]: [shF(0, QUILL, 3.2, 2.8, -.6, -.2, 60, -.6)],
  [I.noticed]: [shF(0, ME6, 1.7, 1.45, .2, 0, 68)],
  [I.away]: [sh(0, TW([4, 60, 30]), TW([4, 56, 26]), TW([8, 0, 2]), TW([8, 0, 2]), 52)],
  [I.nobody]: [sh(0, TS(12.5, 2.2, 4.2), TS(12.7, 2.2, 4.0), TS(11, 1.6, 4.6), TS(11, 1.6, 4.6), 62)],
  [I.turned]: [sh(0, TW([0, 110, 40]), TW([0, 100, 36]), TW([0, 0, 0]), TW([0, 0, 0]), 50)],
  [I.deep]: [sh(0, CABW([-5, 11, -6]), CABW([-4.5, 10.6, -3]), TW([90, 0, 110]), TW([110, 0, 120]), 56)],
  [I.garrow]: [sh(0, CABW([-4, 12, 8]), CABW([-3.6, 12.2, 8.6]), CABW([0, 12, 12]), CABW([0, 12, 12]), 58), shF(5, GARROW, 2.4, 1.8, .9, 0, 60)],
  [I.quiet]: [shF(0, GARROW, 2.0, 1.7, -.4, -.1, 64)],
  [I.home]: [sh(0, CABW([3, 10, 16]), CABW([2.6, 10.2, 15.4]), CABW([0, 12.5, 12]), null, 62), sh(4, CABW([9, 12, -6]), CABW([7, 11, -2]), CABW([0, 2, 30]), CABW([0, 2, 34]), 56)],
  [I.born]: [sh(0, TW([80, 8, 40]), TW([76, 8, 46]), TW([0, 4, 10]), TW([0, 4, 10]), 52)],
  [I.bottom]: [sh(0, TW([20, 30, -20]), TW([22, 28, -14]), TW([60, -10, 110]), TW([60, -12, 110]), 56)],
  [I.higher]: [sh(0, TW([50, 8, 4]), TW([47, 8, 6]), TW([0, 10, 0]), TW([0, 10, 0]), 56)],
  [I.market]: [sh(0, TW([-34, 16, 44]), TW([-31, 15, 41]), TS(-14, 0, 24), TS(-14, 0, 24), 54), sh(5, TW([-40, 18, -26]), TW([-37, 17, -24]), TS(-18, 0, -14), TS(-18, 0, -14), 54)],
  [I.steps]: [sh(0, TW([5, 16.5, -28]), TW([4.4, 16, -27.4]), TW([0, 13.2, -22]), TW([0, 13.2, -22]), 58)],
  [I.pray]: [shF(0, QUILL, 2.2, 1.9, .4, 0, 64)],
  [I.uphill]: [sh(0, TS(0, 9, 16), TS(0, 10, 13), TS(0, 2, 0), TS(0, 2, -2), 56)],
  [I.bell]: [sh(0, TOWR([3.5, 12, 6]), TOWR([3.1, 11.8, 5.4]), TOWR([0, 11.4, 0]), TOWR([0, 11.4, 0]), 58)],
  [I.shovel]: [sh(0, KW(ME, [-3.2, 2.4, -1]), null, KW(ME, [0, 1.6, 0]), null, 64)],
  [I.side]: [sh(0, TS(9, 3.4, -4.5), TS(9.4, 3.4, -4.7), TW([40, 0, -6]), TW([40, 0, -6]), 56)],
  [I.yells]: [shF(0, QUILL, 1.8, 1.5, .2, 0, 70)],
  [I.everybody]: [sh(0, TS(8, 3, -1.5), TS(7.4, 3.2, -1.8), TS(1, 2, -5.5), TS(1, 2, -5.5), 58)],
  [I.one]: [sh(0, HOYOP([0, 3.8, -2.4]), HOYOP([0, 3.4, -2.1]), HOYOP([0, .2, 0]), HOYOP([0, .2, 0]), 60)],
  [I.two2]: [shF(0, ME, 1.6, 1.4, .4, -.2, 70)],
  [I.cold2]: [sh(0, HOYOP([.3, 1.0, -2.2]), HOYOP([.3, .9, -1.9]), HOYOP([0, .1, 0]), HOYOP([0, .1, 0]), 62)],
  [I.three]: [sh(0, KW(ME, [2.6, 2.2, -2.6]), null, KW(ME, [0, 1.2, 0]), null, 62)],
  [I.alive]: [sh(0, HOYOP([.9, 2.2, 1.4]), HOYOP([.7, 1.8, 1.1]), HOYOP([0, 0, 0]), HOYOP([0, 0, 0]), 58)],
  [I.warm]: [shF(0, ME, 1.4, 1.2, .3, .2, 70, -.2)],
  [I.flinch]: [sh(0, CABW([14, 8, 30]), CABW([13, 8, 29]), CABW([0, 6, 18]), CABW([0, 6, 18]), 56, { shake: .25 })],
  [I.turns]: [sh(0, TW([0, 70, 30]), TW([0, 66, 26]), TW([0, 0, 0]), TW([0, 0, 0]), 52)],
  [I.shore]: [sh(0, CABW([-3, 9, -10]), CABW([-2.6, 9.4, -8]), [-160, 2, 0], [-160, 4, 0], 54)],
  [I.sigh]: [sh(0, TW([26, 10, -12]), TW([24, 9, -11]), TS(13, 0, -6), TS(13, 0, -6), 56)],
  [I.life]: [shF(0, ME, 1.8, 1.5, .4, .1, 66)],
  [I.last]: [sh(0, TW([-30, 10, 50]), TW([-60, 34, 90]), TW([0, 8, 0]), TW([0, 8, 0]), 52)],
};

// tiempos de inicio de cada toma y cortes; window.SUBF: más sub-cuadros (desenfoque) en los barridos
const TOMAS = []; Object.entries(SHOTS).forEach(([L, list]) => { L = +L; list.forEach((s0, j) => { const a = j === 0 ? S[L] : wt(L, s0.w) - .06; TOMAS.push({ L, j, a, s: s0 }) }) });
TOMAS.sort((a, b) => a.a - b.a); TOMAS.forEach((t, i) => { t.b = TOMAS[i + 1]?.a ?? DUR; t.corte = i === 0 || LUGAR(t.L) !== LUGAR(TOMAS[i - 1].L) || t.s.cut });
const WHIP = .14, tomaAt = t => { let k = 0; for (let i = 0; i < TOMAS.length; i++) if (t >= TOMAS[i].a) k = i; return k };
window.SUBF = t => { const k = tomaAt(t), T = TOMAS[k], N = TOMAS[k + 1]; return (N && !N.corte && N.a - t < WHIP * .6) || (!T.corte && t - T.a < WHIP * .4) ? 12 : 3 };
window.SHUTF = t => window.SUBF(t) > 3 ? .6 : .5;
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
  const L = lineAt(t), lt = t - s(L), len = (S[L + 1] ?? DUR) - s(L), k = P(lt, 0, len), Wd = kk => wt(L, kk);
  POST = { flash: 0, sepia: 0 };
  if (GARROW.g.parent !== TURT) TURT.add(GARROW.g);
  if (GARROW.g.parent !== TURT) TURT.add(GARROW.g);
  ALL.forEach(c => { c.g.visible = false; c.g.scale.set(1, 1, 1); c.body.rotation.set(0, 0, 0); c.head.rotation.set(0, 0, 0); power(c, null, 0); c.aura.visible = false; setFace(c, "neutral"); pose(c, t, {}) });
  [PALA, REGLA, TELESC, HOYO].forEach(o => o.visible = false); NUBE.forEach(n => n.visible = false);
  const lugar = LUGAR(L); setEnv(lugar === "noche" ? "tarde" : "dia"); if (lugar === "recuerdo") POST.sepia = .3;
  PANADERIA.g.visible = L <= I.bakery || L >= I.turned; PANADERIA.g.position.set(PANADERIA.lx, SY(PANADERIA.lx, PANADERIA.lz) - .3, PANADERIA.lz); PANADERIA.g.rotation.set(0, -Math.PI / 2, 0);
  if (L > I.bakery && L < I.turned) PANADERIA.g.visible = false;   // en el recuerdo, después de caerse ya no está
  if (L >= I.rulers) PANADERIA.g.visible = false;                    // y hoy en su lugar hay un hueco con tierra
  HOUSES.forEach(H => { H.panes.forEach(p => p.emissiveIntensity = lugar === "noche" ? .7 : 0); H.glows.forEach(g => g.visible = lugar === "noche") });
  IGLESIA.userData.campana.rotation.z = 0; TENDEDERO.userData.ropa.forEach((m, i) => m.rotation.y = Math.sin(t * 2 + i) * .25);
  TAZAS.userData.tazas.forEach(c => c.position.y = 1.46);
  const crowd = list => list.forEach(([c, x, z, ry, f = "neutral", walk = 0]) => { placeC(c, x, z, ry); setFace(c, f); pose(c, t + x, { walk }) });
  const hoyo = ([x, z], esc, mont, piel = false) => { HOYO.visible = true; enConcha(HOYO, x, z, 0, .02); HOYO.scale.setScalar(esc); HOYO.userData.mont.scale.setScalar(mont); HOYO.userData.piel.visible = piel };
  const mira = ([x, z]) => c => faceToC(c, x, z);
  let LL = [];
  // la tortuga: camina; se hunde en «down»; en el recuerdo se inclina hacia el pozo de Pim; hoy gira hacia lo hondo y se hunde
  // (bajo = cuánto baja el caparazón: el mar está en y = 0, así que el agua entra sola al pueblo)
  let tort = { paso: 1 };
  if (L === I.down) tort = { paso: .3, bajo: eIO(k) * 22, incl: -.1 * k };
  if (L >= I.stopped && L <= I.rose) { const kk = L === I.stopped ? 0 : L === I.tilted ? eIO(k) : L < I.filled ? 1 : L === I.filled ? 1 - .3 * k : .7 * (1 - eIO(k)); tort = { paso: L === I.stopped ? 0 : .2, bajo: 6 * kk, incl: -.3 * kk } }
  if (L >= I.noticed && L <= I.nobody) tort = { paso: .2, bajo: 6, incl: -.3 };
  if (L >= I.turned) {
    const g = L === I.turned ? eIO(k) * .55 : L < I.flinch ? .55 : L === I.flinch ? .55 : L === I.turns ? .55 - eIO(k) * 1.1 : -.55;
    const B = { [I.higher]: 5 * k, [I.market]: 5 + 7.5 * k, [I.steps]: 12.5 + .8 * k, [I.turns]: 13.3 - 5 * eIO(k), [I.shore]: 8.3 - 5 * eIO(k), [I.sigh]: 3.3 * (1 - eIO(k)) }, base = L < I.higher ? 0 : L >= I.sigh ? 0 : 13.3;
    tort = { paso: .8, giro: g, bajo: B[L] ?? base, flinch: L === I.flinch ? 1 - k * .6 : 0 } }
  tortuga(t, tort); gaviotas(t); if ([I.breath, I.edge, I.church, I.barnacles].includes(L)) aliento(t, L === I.breath ? 1 : .4);

  switch (L) {
    case I.hook: crowd([[FOLK[0], -2, -6, .4], [FOLK[1], 2.5, -2, -.6, "happy", 1], [FOLK[2], -2, 8, 3, "neutral", 1], [ME, 2.0, 12, Math.PI], [EXT[0], -1.4, 16, Math.PI, "happy", 1], [EXT[1], 1.6, 3, 0, "neutral", 1], [EXT[2], -8, 3.6, 1.6, "happy", 1], [EXT[3], 8, -1, -1.6, "neutral", 1]]); break;
    case I.cost: hoyo(HOYO_REGLA, .7, .5); crowd([[QUILL, HOYO_REGLA[0] + 1.2, HOYO_REGLA[1] + .4, 0, "angry"]]); mira(HOYO_REGLA)(QUILL); attach(REGLA, QUILL, "R", [0, -.2, .1]); pose(QUILL, t, { point: 1 }); break;
    case I.down: break;
    case I.walks: case I.rattle:
      if (L === I.rattle) TAZAS.userData.tazas.forEach((c, i) => c.position.y = 1.46 + Math.abs(Math.sin(t * 22 + i)) * .03 * (Math.sin(t * 5.6) > .4 ? 1 : 0));
      crowd([[FOLK[3], -1.8, 4, 0, "neutral", .7], [FOLK[4], 1.6, 9, Math.PI, "neutral", .7], [EXT[0], -1, 12, Math.PI, "happy", .8], [EXT[1], 2, 15, Math.PI, "neutral", .8], [EXT[2], -2, 18, 0, "happy", .8], [EXT[3], 6, 2, -1.6, "neutral", .8]]); break;
    case I.carrots: crowd([[ME, HUERTA0[0] + .2, HUERTA0[1] + 1.5, Math.PI, "happy"]]); pose(ME, t, { armFwd: .8 + Math.sin(t * 5) * .1 }); ME.body.rotation.x = .3; attach(PALA, ME, "R", [0, -.2, .2]); PALA.rotation.set(.6, 0, 0); break;
    case I.goldfish: crowd([[ME, PEZ[0] + 1.2, PEZ[1] + .9, 0, "sad"]]); mira(PEZ)(ME); pose(ME, t, { nod: 1 }); break;
    case I.ruler: case I.sign: case I.doors:
      if (L === I.ruler) hoyo(HOYO_REGLA, .5, .4);
      crowd([[QUILL, HOYO_REGLA[0] + .9, HOYO_REGLA[1] + .5, 0, "suspicious"], [FOLK[2], HOYO_REGLA[0] - 1.4, HOYO_REGLA[1] + .9, Math.PI / 2, "worried"], [FOLK[5], -1.6, 6.5, Math.PI - .3, "neutral", .8], [FOLK[1], -1.2, -12, 0, "neutral", .6]]);
      mira(HOYO_REGLA)(QUILL); attach(REGLA, QUILL, "R", [0, -.2, .1]); pose(QUILL, t, { armFwd: .9 }); QUILL.body.rotation.x = .35; break;
    case I.twelve: crowd([[ME, 1.4, 16.5, -Math.PI / 2 + .5, "excited"]]); attach(PALA, ME, "R", [0, -.2, .2]); PALA.rotation.set(0, 0, 0); pose(ME, t, { armFwd: .4, lift: .25 }); break;
    case I.edge: case I.church: case I.barnacles: case I.breath:
      crowd([[ME, .8, 23.4, 0, "curious"], [FOLK[0], -1.2, 21, .2, "neutral"]]); break;
    case I.heart: case I.hum: placeC(ME, 0, 13.2, Math.PI / 2); ME.g.position.y += .35; ME.body.rotation.x = -Math.PI / 2 + .05; setFace(ME, "warm"); LL.push([TS(-2.6, 3, 15.5)(), 2, "#ffc480", 10]); break;
    case I.pim: case I.two:
      hoyo(HOYO_PANADERIA, L === I.pim ? .5 : .9, L === I.pim ? .5 : 1);
      crowd([[PIM, HOYO_PANADERIA[0] - 1.2, HOYO_PANADERIA[1] + .2, Math.PI / 2, "determined"], [ME6, 11, 4.6, 0, "curious"]]); mira(HOYO_PANADERIA)(ME6);
      attach(PALA, PIM, "R", [0, -.2, .2]); pose(PIM, t, { armFwd: .7 + Math.sin(t * 6) * .25 }); PIM.body.rotation.x = .35; break;
    case I.cold: case I.stopped: case I.tilted: case I.water: case I.bakery: case I.filled: case I.rose:
    case I.noticed: case I.away: case I.nobody: {
      hoyo(HOYO_PANADERIA, .9, L >= I.filled && L <= I.rose ? 1 - k * .8 : L > I.rose ? .2 : 1);
      const susto = L >= I.tilted && L <= I.filled ? "terrified" : L === I.noticed ? "suspicious" : "scared";
      crowd([[ME6, 11, 4.6, 0, susto], [FOLK[2], 9.6, 6.2, Math.PI / 2, "terrified"], [FOLK[3], 9.4, -1, Math.PI / 2, "horrified"], [EXT[0], 7, 3, Math.PI / 2, "terrified"], [EXT[2], 6.4, 0, Math.PI / 2, "scared"]]); mira(HOYO_PANADERIA)(ME6);
      if ((L >= I.tilted && L <= I.filled) || L === I.nobody) [FOLK[2], FOLK[3]].forEach(c => { c.body.rotation.z = .12; pose(c, t, { hug: 1 }) });
      if (L === I.bakery) { const q = eIO(k); PANADERIA.g.position.x = PANADERIA.lx + q * 14; PANADERIA.g.position.y -= q * q * 16; PANADERIA.g.rotation.z = -q * .9 }
      if (L === I.filled) { placeC(PIM, HOYO_PANADERIA[0] - .9, HOYO_PANADERIA[1] + .4, Math.PI / 2); setFace(PIM, "pleading"); pose(PIM, t, { armFwd: 1 + Math.sin(t * 8) * .3 }); PIM.body.rotation.x = .7 }
      break }
    case I.rulers: case I.firstone:
      crowd([[PIM, 1.6, -6, -Math.PI / 2 + .3, "gloomy"], [QUILL, -1.2, -5.4, Math.PI / 2, L === I.firstone ? "happy" : "neutral"]]); attach(REGLA, PIM, "R", [0, -.2, .1]); pose(PIM, t, { armFwd: .6 });
      if (L === I.firstone) { const r2 = REGLA.clone(); QUILL.handR.add(r2); r2.position.set(0, -.2, .1); r2.userData.tmp = 1; pose(QUILL, t, { armFwd: .6 }) } break;
    case I.turned: case I.deep: case I.born: case I.bottom: crowd([[FOLK[0], -2, 20, .3, "worried"], [FOLK[1], 2, 18, -.2, "worried"]]); break;
    case I.garrow: case I.quiet: case I.home:
      GARROW.g.visible = true; if (GARROW.g.parent !== CABEZA) CABEZA.add(GARROW.g); GARROW.g.position.set(0, 10.9, 12); GARROW.g.rotation.set(-.2, L === I.garrow ? 0 : Math.PI, 0);
      setFace(GARROW, L === I.garrow ? "squint" : "gloomy"); attach(TELESC, GARROW, "R", [0, -.1, .2]); pose(GARROW, t, { armFwd: L === I.garrow ? 1.3 : .2 }); break;
    case I.higher: case I.market: case I.steps: case I.pray: case I.uphill:
      crowd([[QUILL, -1, 7.2, 0, L === I.pray ? "pleading" : "horrified"], [FOLK[0], -3, 9, Math.PI, "terrified", 1.4], [FOLK[1], 2, 10, Math.PI, "panic", 1.4], [FOLK[2], 0, 13, Math.PI, "terrified", 1.4], [FOLK[5], 2.6, 6, Math.PI, "panic", 1.4], [EXT[0], -2, 14, Math.PI, "panic", 1.4], [EXT[1], 1, 16, Math.PI, "terrified", 1.4], [EXT[3], -4, 11, Math.PI, "panic", 1.4]]);
      if (L === I.uphill) [FOLK[0], FOLK[1], FOLK[2], FOLK[5]].forEach((c, i) => { const z = 15 - k * 12 - i; placeC(c, c.g.position.x, z, Math.PI); pose(c, t + i, { walk: 1.6 }) });
      if (L === I.pray) pose(QUILL, t, { hug: 1 }); break;
    case I.bell: { GARROW.g.visible = true; const tw = IGLESIA.userData.torre; tw.updateMatrixWorld(true); const p = TURT.worldToLocal(tw.localToWorld(new THREE.Vector3(.4, 10.4, -.8))); GARROW.g.position.copy(p); GARROW.g.rotation.set(0, Math.PI, 0);
      setFace(GARROW, "terrified"); pose(GARROW, t, { lift: .6 + Math.sin(t * 6) * .3 }); IGLESIA.userData.campana.rotation.z = Math.sin(t * 6) * .5; break }
    case I.shovel: case I.side: { const q = L === I.shovel ? k : 1, x = lerp(2, HOYO_CHICO[0] - 1.1, q), z = lerp(4, HOYO_CHICO[1] + .3, q); placeC(ME, x, z, Math.atan2(HOYO_CHICO[0] - 2, HOYO_CHICO[1] - 4)); pose(ME, t, { walk: L === I.shovel ? 1.6 : 0 }); setFace(ME, "determined"); attach(PALA, ME, "R", [0, -.2, .2]); PALA.rotation.set(0, 0, 0);
      crowd([[FOLK[0], -2, 2, Math.PI, "panic", 1.2], [FOLK[1], 1, 0, Math.PI, "panic", 1.2]]); break }
    case I.yells: case I.everybody: crowd([[QUILL, 2, -4, Math.PI / 2 + .5, "horrified"], [FOLK[0], 0, -6, Math.PI / 2, "panic"], [FOLK[1], 1.6, -7, Math.PI / 2 + .3, "horrified"], [FOLK[2], -1, -5, Math.PI / 2, "panic"], [FOLK[5], 3, -6.4, Math.PI / 2, "terrified"], [EXT[0], -.4, -7.4, Math.PI / 2, "panic"], [EXT[1], 2.4, -8, Math.PI / 2, "horrified"]]); if (L === I.yells) pose(QUILL, t, { point: 1 }); break;
    case I.one: case I.two2: case I.cold2: case I.three: case I.alive: case I.warm: {
      const prof = { [I.one]: .4, [I.two2]: .7, [I.cold2]: .8, [I.three]: 1, [I.alive]: 1, [I.warm]: 1 }[L];
      hoyo(HOYO_CHICO, .5 + prof * .5, .3 + prof, L >= I.alive);
      placeC(ME, HOYO_CHICO[0] - 1.1, HOYO_CHICO[1] + .3, Math.PI / 2); attach(PALA, ME, "R", [0, -.2, .2]); const dig = Math.sin(t * 7); pose(ME, t, { armFwd: .9 + dig * .35 }); ME.body.rotation.x = .3 + dig * .1; PALA.rotation.set(.4 + dig * .4, 0, 0);
      setFace(ME, L >= I.alive ? "shock" : L === I.cold2 ? "scared" : "determined"); break }
    case I.flinch: case I.turns: case I.shore: case I.sigh: hoyo(HOYO_CHICO, 1, 1.3, true); crowd([[ME, HOYO_CHICO[0] - 1.1, HOYO_CHICO[1] + .3, Math.PI / 2 + .6, L === I.flinch ? "terrified" : "relieved"], [EXT[0], 1, -1, Math.PI / 2, L === I.flinch ? "terrified" : "excited", L === I.sigh ? 1 : 0], [EXT[1], -1, 2, Math.PI / 2, L === I.flinch ? "scared" : "happy", L === I.sigh ? 1 : 0], [FOLK[1], 2, 3, Math.PI / 2, "relieved"]]); attach(PALA, ME, "R", [0, -.2, .2]); break;
    case I.life: case I.last: hoyo(HOYO_CHICO, 1, 1.3, true); crowd([[ME, HOYO_CHICO[0] - 1.1, HOYO_CHICO[1] + .3, -Math.PI / 2 - .4, L === I.life ? "warm" : "happy"], [QUILL, 9, -3, Math.PI / 2 - .3, "relieved"], [FOLK[1], 8, -6, Math.PI / 2, "excited"], [EXT[0], 7, -1, Math.PI / 2, "happy"], [EXT[2], 6, -4.4, Math.PI / 2, "excited"], [FOLK[4], 8.4, 1.2, Math.PI / 2, "relieved"]]); attach(PALA, ME, "R", [0, -.2, .2]); pose(ME, t, { lift: L === I.last ? .5 : 0 }); break;
  }
  QUILL.handR.children.filter(c => c.userData.tmp && L !== I.firstone).forEach(c => QUILL.handR.remove(c));
  if (!LL.length && lugar === "noche") LL.push([TS(0, 6, 10)(), 3, "#ffc480", 30]);
  lights(LL); camara(t);
}


// ---------- capa 2D: color ocre por escena, viñeta y subtítulos estilo Volze (una palabra, minúscula, amarillo, contorno negro grueso, 75 % del alto)
const VIG2 = (() => { const c = mk(W, H), g = c.getContext("2d"), r = g.createRadialGradient(W / 2, H * .48, Math.min(W, H) * .28, W / 2, H * .48, Math.max(W, H) * .6); r.addColorStop(0, "rgba(0,0,0,0)"); r.addColorStop(1, "rgba(10,5,0,.32)"); g.fillStyle = r; g.fillRect(0, 0, W, H); return c })();
let POST = {};
COMP = new EffectComposer(R); COMP.setPixelRatio(1); COMP.setSize(W, H); COMP.addPass(new RenderPass(scene, cam)); COMP.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), .42, .5, .8)); COMP.addPass(new OutputPass());
const SUBY = L => [I.goldfish, I.one, I.cold2, I.alive, I.heart].includes(L) ? .22 : .75;   // sube al 22 % cuando la acción está abajo
function subV(t) {
  let i = -1; for (let k = 0; k < WORDS.length; k++) if (t >= WORDS[k][0]) i = k; if (i < 0 || !WORDS[i][1]) return;
  const w = WORDS[i][1].toLowerCase().replace(/[.,!?"“”]/g, ""), edad = t - WORDS[i][0], size = 112, y = H * SUBY(lineAt(t));
  const sc = RES(.55, 1, edad, 600, 16); X.save(); X.translate(W / 2, y); X.scale(sc, sc); X.font = `800 ${size}px 'Baloo 2'`; X.textAlign = "center"; X.textBaseline = "middle"; X.lineJoin = "round";
  X.shadowColor = "rgba(0,0,0,.55)"; X.shadowBlur = 0; X.shadowOffsetY = 7; X.lineWidth = size * .22; X.strokeStyle = "#000"; X.strokeText(w, 0, 0); X.shadowColor = "transparent"; X.fillStyle = "#fff200"; X.fillText(w, 0, 0); X.restore();
}
function overlay(t) {
  const gr = ENV[ENVNOW].grade; X.globalAlpha = gr[1]; X.globalCompositeOperation = "soft-light"; X.fillStyle = gr[0]; X.fillRect(0, 0, W, H); X.globalCompositeOperation = "source-over"; X.globalAlpha = 1; X.drawImage(VIG2, 0, 0);
  if (POST.flash > 0) { X.globalAlpha = Math.min(1, POST.flash); X.fillStyle = "#fff6e0"; X.fillRect(0, 0, W, H); X.globalAlpha = 1 }
  if (POST.sepia > 0) { X.globalAlpha = POST.sepia * .55; X.globalCompositeOperation = "color"; X.fillStyle = "#b08a5a"; X.fillRect(0, 0, W, H); X.globalCompositeOperation = "source-over"; X.globalAlpha = 1 }
  subV(t);
}
window.DBG = { cam, ALL, ME, QUILL, PIM, GARROW, TURT, CABEZA, THREE, TOMAS };