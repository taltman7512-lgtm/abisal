// ================= LA TAPA: el cielo de tablones pintados (cara de abajo), su espesor, el panel que se hunde y cae, el agujero, el polvo y la lluvia de oro =================
// Medidas de _comun_cielo.js (CIELO, LID_T, PANEL_MIO, AGUJERO, SOL_PINTADO, TANNER, CALLES). Lo de ARRIBA de la tapa (trigo, granja, cielo real) está en _lejos_cielo.js.
// La tapa es una «membrana»: cara de abajo, tierra de arriba y trigo se hunden juntos con la MISMA función (sagF en GLSL = tapaSag en JS).
// El panel PANEL_MIO es aparte (grupo TAPA.PAN): se hunde rígido (+ se dobla un poco) y al final cae entero con su campo encima.
const TAPA = (() => {
  const G = new THREE.Group(); G.name = "TAPA"; scene.add(G);
  const PAN = new THREE.Group(); PAN.name = "TAPA_PANEL"; scene.add(PAN);                  // el panel que se hunde y cae (con su tierra, su trigo y los montones)
  const PAN_ARR = new THREE.Group(); PAN.add(PAN_ARR);                                    // lo que el panel lleva ARRIBA (se esconde con la cámara abajo y todo cerrado)
  const sst = (a, b, v) => { const q = cl((v - a) / (b - a)); return q * q * (3 - 2 * q) };
  const hsh = (i, j) => { let n = (Math.imul(i | 0, 374761393) + Math.imul(j | 0, 668265263)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296 };
  const rd = (x, z) => { const i = Math.floor(x), j = Math.floor(z), u = x - i, v = z - j, a = u * u * (3 - 2 * u), b = v * v * (3 - 2 * v); return lerp(lerp(hsh(i, j), hsh(i + 1, j), a), lerp(hsh(i, j + 1), hsh(i + 1, j + 1), a), b) };
  const fbm = (x, z, o = 4) => { let s = 0, a = .5, f = 1, n = 0; for (let k = 0; k < o; k++) { s += a * rd(x * f + k * 17.3, z * f - k * 9.1); n += a; a *= .5; f *= 2.03 } return s / n };
  const nrm = a => { const l = Math.hypot(...a); return a.map(v => v / l) };
  // une geometrías (posición, normal, uv y color si hay): lista de [geo, matriz | null]
  const mergeGeo = list => { let n = 0; const qs = list.map(([g, m]) => { const q = g.index ? g.toNonIndexed() : g.clone(); if (m) q.applyMatrix4(m); n += q.attributes.position.count; return q }), hayC = qs.some(q => q.attributes.color);
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2), co = hayC ? new Float32Array(n * 3).fill(1) : null; let o = 0;
    qs.forEach(q => { const k = q.attributes.position.count; pos.set(q.attributes.position.array, o * 3); if (q.attributes.normal) nor.set(q.attributes.normal.array, o * 3); if (q.attributes.uv) uv.set(q.attributes.uv.array, o * 2); if (co && q.attributes.color) co.set(q.attributes.color.array, o * 3); o += k });
    const G = new THREE.BufferGeometry(); G.setAttribute("position", new THREE.BufferAttribute(pos, 3)); G.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); G.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); if (co) G.setAttribute("color", new THREE.BufferAttribute(co, 3)); G.computeBoundingSphere(); return G };
  const P0 = PANEL_MIO, PC = [(P0.x0 + P0.x1) / 2, (P0.z0 + P0.z1) / 2];
  const TAN_R = { x0: TANNER.x0, x1: TANNER.x1, z0: 16, z1: 36 }, TAN_PISO = 1.5;
  const HAZ = nrm([-.3, 1, -.35]);                 // dirección HACIA el sol de verdad para el haz que entra por el agujero/hueco (empinado: cae cerca del poste)
  const SOL_REAL = nrm([-.82, .34, -.3]);          // el sol dorado bajo que se ve desde arriba (oeste-noroeste, ≈ 21°)
  const AG_R = .45;                                // radio del agujero terminado (≈ 0,9 m)

  // ---------------- estado (lo pone la escena en cada cuadro; tapaReset() lo vuelve a cero) ----------------
  const ST = { t: 0, m: 0, cruje: 0, cae: 0, agu: 0, tan: 0, gotea: 0, foco: null, lluvia: 0, montones: true, escalera: false };
  // uniforms compartidos por TODOS los materiales que se hunden (la misma función en GLSL y en JS)
  const U = { uM: { value: 0 }, uCaeK: { value: 0 }, uTan: { value: 0 }, uTanD: { value: CIELO((TAN_R.x0 + TAN_R.x1) / 2, (TAN_R.z0 + TAN_R.z1) / 2) - TAN_PISO },
    uPan: { value: new THREE.Vector4(P0.x0, P0.x1, P0.z0, P0.z1) }, uTanR: { value: new THREE.Vector4(TAN_R.x0, TAN_R.x1, TAN_R.z0, TAN_R.z1) },
    uT: { value: 0 }, uWind: { value: 1 }, uAg: { value: new THREE.Vector2(AGUJERO[0], AGUJERO[1]) }, uAgR: { value: new THREE.Vector2(0, 0) },
    uEsc: { value: 0 }, uEscP: { value: new THREE.Vector2(ESCALERA_KELL[0], ESCALERA_KELL[1]) }, uEmi: { value: .9 }, uPisa: { value: 0 }, uSunV: { value: new THREE.Vector3(0, 0, -1) }, uGlow: { value: 0 } };
  const rectD = (x, z, r) => Math.hypot(Math.max(0, r.x0 - x, x - r.x1), Math.max(0, r.z0 - z, z - r.z1));
  const panB = (x, z) => Math.sin(Math.PI * cl((x - P0.x0) / (P0.x1 - P0.x0))) * Math.sin(Math.PI * cl((z - P0.z0) / (P0.z1 - P0.z0)));
  // hundimiento de la membrana (sin el panel): lo mismo que sagF() del GLSL
  const sagMain = (x, z) => U.uM.value * (1 - U.uCaeK.value) * (1 - sst(0, 5, rectD(x, z, P0))) + U.uTan.value * U.uTanD.value * (1 - sst(0, 4.5, rectD(x, z, TAN_R)));
  const enPanel = (x, z) => x > P0.x0 && x < P0.x1 && z > P0.z0 && z < P0.z1;
  const SAG_GLSL = `
uniform float uM, uCaeK, uTan, uTanD, uT, uWind, uPisa; uniform vec2 uAg;
uniform vec4 uPan, uTanR;
float rectD(vec2 p, vec4 r){ vec2 d = max(vec2(r.x - p.x, r.z - p.y), vec2(p.x - r.y, p.y - r.w)); return length(max(d, 0.)); }
float panB(vec2 p){ vec2 q = clamp((p - uPan.xz) / (uPan.yw - uPan.xz), 0., 1.); return sin(3.14159 * q.x) * sin(3.14159 * q.y); }
float sagF(vec2 p){
#ifdef PANEL
  return uM * .1 * panB(p);
#else
  return uM * (1. - uCaeK) * (1. - smoothstep(0., 5., rectD(p, uPan))) + uTan * uTanD * (1. - smoothstep(0., 4.5, rectD(p, uTanR)));
#endif
}
varying vec3 vWq; varying float vWave;`;
  const FRAG_HEAD = `uniform vec2 uAg, uAgR, uEscP; uniform float uEsc, uEmi, uGlow, uT; uniform vec3 uSunV; varying vec3 vWq; varying float vWave;
float hsh1(float n){ return fract(sin(n * 127.1) * 43758.5453); }`;
  // inyecta en un MeshStandardMaterial (o MeshDepthMaterial): hundimiento, viento (trigo), agujero y trampa de la escalera
  // o: { panel, wind, hole, esc, glow, frag: código que reemplaza a map_fragment, emi: código para emissivemap_fragment }
  const sagify = (mat, o = {}) => {
    mat.defines = Object.assign(mat.defines || {}, o.panel ? { PANEL: "" } : {}, o.wind ? { WIND: "" } : {}, o.hole ? { HOLE: "" } : {}, o.esc ? { ESC: "" } : {}, o.glow ? { GLOWW: "" } : {});
    const prev = mat.onBeforeCompile;
    mat.onBeforeCompile = (sh, r) => { if (prev) prev(sh, r); Object.assign(sh.uniforms, U, o.uni || {});
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\n" + SAG_GLSL).replace("#include <begin_vertex>", `#include <begin_vertex>
#ifdef USE_INSTANCING
  { vec4 o4 = modelMatrix * instanceMatrix * vec4(0., 0., 0., 1.); float sy = length(instanceMatrix[1].xyz); transformed.y -= sagF(o4.xz) / max(sy, 1e-4);
    vWave = 0.;
  #ifdef WIND
    float h = max(position.y, 0.), hh = h * h;
    float w = sin(uT * 1.3 + o4.x * .07 + o4.z * .05) * .45 + sin(dot(o4.xz, vec2(.075, .045)) - uT * 1.7) * .85 + sin(uT * 3.3 + o4.x * .9 + o4.z * 1.3) * .22;
    vec3 wd = vec3(.86, 0., .5) * (w * .085 + .05) * hh * uWind;
    { float pk = uPisa * (1. - smoothstep(1.9, 2.7, length(o4.xz - uAg))); if (pk > 0.) { vec2 od = normalize(o4.xz - uAg + vec2(1e-3, 0.)); float hs = h * length(instanceMatrix[1].xyz); vec3 pd = (vec3(od.x, 0., od.y) * .9 + vec3(.3 * od.y, 0., -.3 * od.x) * sin(o4.x * 7. + o4.z * 5.)) * hs - vec3(0., hs * .8, 0.); wd = mix(wd, pd, pk); w *= 1. - pk; } }
    transformed += inverse(mat3(instanceMatrix)) * wd; vWave = w;
  #endif
    vWq = (modelMatrix * instanceMatrix * vec4(transformed, 1.)).xyz; }
#else
  { vec4 o4 = modelMatrix * vec4(transformed, 1.); float sg = sagF(o4.xz); transformed.y -= sg; vWq = (modelMatrix * vec4(transformed, 1.)).xyz; vWave = sg; }
#endif`);
      if (!sh.fragmentShader.includes("#include <map_fragment>")) return;   // material de profundidad: solo el vértice
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\n" + FRAG_HEAD + (o.fragHead || "")).replace("#include <clipping_planes_fragment>", `#include <clipping_planes_fragment>
#ifdef HOLE
  { vec2 d = vWq.xz - uAg; float a = atan(d.y, d.x); vec2 R = uAgR * (1. + .07 * sin(a * 7. + 1.) + .05 * sin(a * 13.)); if (R.x > 1e-3 && dot(d / R, d / R) < 1.) discard; }
#endif
#ifdef ESC
  if (uEsc > .5 && abs(vWq.x - uEscP.x) < .72 && abs(vWq.z - uEscP.y) < .72) discard;
#endif`);
      if (o.frag) sh.fragmentShader = sh.fragmentShader.replace("#include <map_fragment>", o.frag);
      if (o.wind) sh.fragmentShader = sh.fragmentShader.replace("#include <color_fragment>", "#include <color_fragment>\n  diffuseColor.rgb *= .9 + .13 * vWave;");
      if (o.emi) sh.fragmentShader = sh.fragmentShader.replace("#include <emissivemap_fragment>", o.emi);
      else if (o.glow) sh.fragmentShader = sh.fragmentShader.replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
  { float sc = max(dot(normalize(-vViewPosition), uSunV), 0.); totalEmissiveRadiance += diffuseColor.rgb * uGlow * (.18 + 1.4 * pow(sc, 6.)); }`);
    };
    mat.customProgramCacheKey = () => JSON.stringify(Object.keys(mat.defines)) + (o.key || "");
    return mat };
  const depthDe = (o = {}) => sagify(new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking }), o);

  // ---------------- TEXTURAS PINTADAS ----------------
  const envuelto = (g, w, h, fn) => { for (const dx of [-w, 0, w]) for (const dy of [-h, 0, h]) { g.save(); g.translate(dx, dy); fn(); g.restore() } };
  // junta 3 lienzos grises en una textura RGB de datos (lineal, se repite)
  const juntar = (cs, w, h) => { const c = mk(w, h), g = c.getContext("2d", { willReadFrequently: true }), out = g.createImageData(w, h), ds = cs.map(x => x ? x.getContext("2d").getImageData(0, 0, w, h).data : null);
    for (let i = 0; i < w * h; i++) { out.data[i * 4] = ds[0] ? ds[0][i * 4] : 0; out.data[i * 4 + 1] = ds[1] ? ds[1][i * 4] : 0; out.data[i * 4 + 2] = ds[2] ? ds[2][i * 4] : 0; out.data[i * 4 + 3] = 255 }
    g.putImageData(out, 0, 0); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t };
  const lienzo = (w, h, fondo, fn) => { const c = mk(w, h), g = c.getContext("2d", { willReadFrequently: true }); g.fillStyle = fondo; g.fillRect(0, 0, w, h); fn(g, w, h); return c };
  const gris = v => { const q = Math.round(cl(v) * 255); return `rgb(${q},${q},${q})` };
  // DETALLE DE CERCA: 4 m (x) × 2 m (z) = 2048 × 1024; 8 tablones de 0,25 m por fila; vigas cada 0,6 m (clavos)
  const DET = (() => { const W = 2048, H = 1024, PX = 512, RH = 128, r = rng(7701), FIL = [];
    for (let k = 0; k < 8; k++) { const n = 1 + (r() * 2.2 | 0), xs = []; for (let q = 0; q < n; q++) xs.push(((q + .2 + r() * .6) / n) * W); FIL.push(xs) }
    const tramo = (k, x) => { const xs = FIL[k]; let i = 0; while (i < xs.length && xs[i] < x) i++; return i };   // tramo (tablón) dentro de la fila
    // vetas (R)
    const cG = lienzo(W, H, "#808080", (g) => { for (let k = 0; k < 8; k++) { const y0 = k * RH, xs = [0, ...FIL[k], W];
      for (let s = 0; s < xs.length - 1; s++) { const tono = .35 + r() * .35; g.fillStyle = gris(tono); g.fillRect(xs[s], y0, xs[s + 1] - xs[s], RH) }
      for (let q = 0; q < 70; q++) { const yy = y0 + r() * RH, x0 = r() * W, len = 200 + r() * 1400, am = 2 + r() * 6, f = .004 + r() * .01; g.strokeStyle = r() < .55 ? `rgba(0,0,0,${.08 + r() * .22})` : `rgba(255,255,255,${.06 + r() * .16})`; g.lineWidth = .8 + r() * 2.6;
        g.save(); g.beginPath(); g.rect(0, y0 + 2, W, RH - 4); g.clip(); g.beginPath(); for (let x = 0; x <= len; x += 16) { const X = x0 + x, Y = yy + Math.sin(X * f + q) * am; x ? g.lineTo(X, Y) : g.moveTo(X, Y) } g.stroke();
        g.beginPath(); for (let x = 0; x <= len; x += 16) { const X = x0 + x - W, Y = yy + Math.sin((X + W) * f + q) * am; x ? g.lineTo(X, Y) : g.moveTo(X, Y) } g.stroke(); g.restore() }
      for (let q = 0; q < 2; q++) if (r() < .7) { const kx = r() * W, ky = y0 + 25 + r() * (RH - 50), rx = 10 + r() * 18; for (let a = 0; a < 7; a++) { g.strokeStyle = `rgba(30,20,10,${.5 - a * .05})`; g.lineWidth = 2; g.beginPath(); g.ellipse(kx, ky, rx + a * 7, (rx + a * 7) * .45, 0, 0, 7); g.stroke() } g.fillStyle = "rgba(20,12,6,.8)"; g.beginPath(); g.ellipse(kx, ky, rx * .6, rx * .35, 0, 0, 7); g.fill() } } });
    // pintura (G): 1 = pintado; descascarado cerca de las juntas y los clavos, cuarteado en parches
    const cP = lienzo(W, H, "#ffffff", (g) => { g.fillStyle = "#000";
      const mancha = (cx, cy, R, n = 9) => { g.beginPath(); for (let a = 0; a < n; a++) { const an = a / n * 6.283, rr = R * (.45 + r() * .75); a ? g.lineTo(cx + Math.cos(an) * rr * 1.6, cy + Math.sin(an) * rr * .8) : g.moveTo(cx + Math.cos(an) * rr * 1.6, cy + Math.sin(an) * rr * .8) } g.closePath(); g.fill() };
      for (let k = 0; k < 8; k++) { const y0 = k * RH;
        for (let q = 0; q < 26; q++) { const x = r() * W, yy = y0 + (r() < .5 ? r() * 16 : RH - r() * 16); envuelto(g, W, H, () => mancha(x, yy, 4 + r() * 16, 7)) }        // a lo largo de las juntas
        for (const bx of FIL[k]) for (let q = 0; q < 6; q++) envuelto(g, W, H, () => mancha(bx + (r() - .5) * 40, y0 + r() * RH, 6 + r() * 18));        // en los extremos de los tablones
        if (r() < .5) { const cx = r() * W, cy = y0 + RH / 2; envuelto(g, W, H, () => { mancha(cx, cy, 20 + r() * 40, 12); for (let q = 0; q < 14; q++) mancha(cx + (r() - .5) * 220, cy + (r() - .5) * 90, 3 + r() * 9, 6) }) } }
      // cuarteado (grietas finas en la pintura)
      for (let q = 0; q < 9; q++) { const cx = r() * W, cy = r() * H; g.strokeStyle = "#000"; for (let l = 0; l < 40; l++) { let x = cx + (r() - .5) * 260, y = cy + (r() - .5) * 140; g.lineWidth = .8 + r() * 1.4; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 6; s++) { x += (r() - .5) * 40; y += (r() - .5) * 24; g.lineTo(x, y) } g.stroke() } } });
    // altura (B): juntas hondas, uniones de punta, clavos salientes, la madera pelada un poco más abajo
    const cH = lienzo(W, H, gris(.82), (g) => {
      g.globalCompositeOperation = "multiply"; g.drawImage(cP, 0, 0); g.globalCompositeOperation = "source-over";   // pelado = más bajo (0 → negro: se corrige abajo)
      g.fillStyle = gris(.82); g.globalAlpha = .82; g.fillRect(0, 0, W, H); g.globalAlpha = 1;
      for (let k = 0; k <= 8; k++) { const y = k * RH; g.fillStyle = "#000"; g.fillRect(0, y - 3, W, 6); g.fillStyle = gris(.4); g.fillRect(0, y - 5, W, 2); g.fillRect(0, y + 3, W, 2) }
      for (let k = 0; k < 8; k++) for (const bx of FIL[k]) { g.fillStyle = "#000"; g.fillRect(bx - 2, k * RH, 4, RH); g.fillStyle = gris(.45); g.fillRect(bx - 4, k * RH, 2, RH) }
      for (let k = 0; k < 8; k++) for (let x = 120; x < W; x += .6 * PX) for (const yy of [30, RH - 30]) { const X = x + (r() - .5) * 8, Y = k * RH + yy + (r() - .5) * 6; g.fillStyle = gris(.3); g.beginPath(); g.arc(X, Y, 9, 0, 7); g.fill(); g.fillStyle = gris(1); g.beginPath(); g.arc(X, Y, 6, 0, 7); g.fill() } });
    // manchas (R2): agua sucia que baja por las juntas, aureolas de goteo, óxido de los clavos — y clavos (G2)
    const cS = lienzo(W, H, "#000", (g) => { for (let k = 0; k <= 8; k++) for (let q = 0; q < 10; q++) { const x = r() * W, y = k * RH, L = 60 + r() * 380, A = 10 + r() * 30;
        envuelto(g, W, H, () => { const gr = g.createRadialGradient(x, y, 0, x, y, L); gr.addColorStop(0, `rgba(255,255,255,${.35 + r() * .4})`); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.save(); g.translate(x, y); g.scale(1, A / L); g.translate(-x, -y); g.beginPath(); g.arc(x, y, L, 0, 7); g.fill(); g.restore() }) }
      for (let q = 0; q < 26; q++) { const x = r() * W, y = r() * H, R0 = 14 + r() * 50; for (let a = 0; a < 2; a++) { g.strokeStyle = `rgba(255,255,255,${.08 + r() * .12})`; g.lineWidth = 4 + r() * 8; envuelto(g, W, H, () => { g.beginPath(); g.ellipse(x, y, R0 * (1 + a * .35), R0 * (.8 + a * .3), r(), 0, 7); g.stroke() }) } }
      for (let k = 0; k < 8; k++) for (let x = 120; x < W; x += .6 * PX) for (const yy of [30, RH - 30]) { const gr = g.createRadialGradient(x, k * RH + yy, 0, x, k * RH + yy, 30 + r() * 30); gr.addColorStop(0, "rgba(255,255,255,.35)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(x - 70, k * RH + yy - 70, 140, 140) }
      for (let q = 0; q < 34; q++) { const x = r() * W, y = r() * H, L = 30 + r() * 90; const gr = g.createLinearGradient(x, y, x + (r() - .5) * 30, y + L); gr.addColorStop(0, `rgba(255,255,255,${.3 + r() * .3})`); gr.addColorStop(1, "rgba(255,255,255,0)"); g.strokeStyle = gr; g.lineWidth = 3 + r() * 6; g.lineCap = "round"; envuelto(g, W, H, () => { g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 20, y + L); g.stroke() }) } });
    const cN = lienzo(W, H, "#000", (g) => { for (let k = 0; k < 8; k++) for (let x = 120; x < W; x += .6 * PX) for (const yy of [30, RH - 30]) { g.fillStyle = "#fff"; g.beginPath(); g.arc(x, k * RH + yy, 7, 0, 7); g.fill() } });
    return { d1: juntar([cG, cP, cH], W, H), d2: juntar([cS, cN, null], W, H) } })();
  // NUBES PINTADAS: textura de 160 m que se repite. R = nube, G = luz de la nube (1 arriba-izquierda, 0 abajo), B = pinceladas del celeste
  const NUB = (() => { const W = 2048, r = rng(7702), NUBS = [];
    for (let k = 0; k < 9; k++) { const cx = r() * W, cy = r() * W, sw = 260 + r() * 460, bumps = []; const n = 5 + (r() * 6 | 0);
      for (let q = 0; q < n; q++) { const u = (q + .5) / n - .5, R = sw * (.16 + r() * .14) * (1 - Math.abs(u) * .7); bumps.push([cx + u * sw, cy - R * .35 - r() * R * .4, R]) }
      bumps.push([cx, cy + sw * .02, sw * .28]); NUBS.push({ cx, cy, sw, bumps }) }
    const forma = (g, fn) => NUBS.forEach(N => envuelto(g, W, W, () => fn(N)));
    const cA = lienzo(W, W, "#000", g => { g.filter = "blur(2px)"; forma(g, N => { g.fillStyle = "#fff"; N.bumps.forEach(([x, y, R]) => { g.beginPath(); for (let a = 0; a <= 24; a++) { const an = a / 24 * 6.283, rr = R * (1 + .06 * Math.sin(an * 5 + x)); a ? g.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr) : g.moveTo(x + rr, y) } g.fill() });
        g.fillRect(N.cx - N.sw * .48, N.cy - 6, N.sw * .96, N.sw * .1) }); g.filter = "none";
      // borde de pincel: trazos cortos sueltos alrededor
      forma(g, N => N.bumps.forEach(([x, y, R]) => { for (let q = 0; q < 14; q++) { const an = -Math.PI + r() * Math.PI * 1.1, rr = R * (.92 + r() * .12); g.strokeStyle = `rgba(255,255,255,${.4 + r() * .4})`; g.lineWidth = 3 + r() * 6; g.beginPath(); g.arc(x, y, rr, an, an + .2 + r() * .3); g.stroke() } })) });
    const cL = lienzo(W, W, "#000", g => { forma(g, N => N.bumps.forEach(([x, y, R]) => { const gr = g.createRadialGradient(x - R * .3, y - R * .45, R * .1, x, y, R * 1.05); gr.addColorStop(0, "#fff"); gr.addColorStop(.6, "#d8d8d8"); gr.addColorStop(1, "#5a5a5a"); g.fillStyle = gr; g.beginPath(); g.arc(x, y, R * 1.06, 0, 7); g.fill() }));
      forma(g, N => { const gr = g.createLinearGradient(0, N.cy - N.sw * .1, 0, N.cy + N.sw * .08); gr.addColorStop(0, "rgba(60,60,60,0)"); gr.addColorStop(1, "rgba(60,60,60,.9)"); g.fillStyle = gr; g.fillRect(N.cx - N.sw * .55, N.cy - N.sw * .1, N.sw * 1.1, N.sw * .2) });
      // pinceladas ingenuas dentro de las nubes (curvas blancas y grises)
      forma(g, N => { for (let q = 0; q < 40; q++) { const [x, y, R] = N.bumps[r() * N.bumps.length | 0], an = r() * 6.283, rr = R * r() * .85; g.strokeStyle = r() < .6 ? `rgba(255,255,255,${.25 + r() * .35})` : `rgba(40,40,40,${.15 + r() * .2})`; g.lineWidth = 4 + r() * 9; g.lineCap = "round"; g.beginPath(); g.arc(x + Math.cos(an) * rr * .3, y + Math.sin(an) * rr * .3, rr, an, an + .4 + r() * .8); g.stroke() } }) });
    const cB = lienzo(W, W, "#808080", g => { for (let q = 0; q < 700; q++) { const x = r() * W, y = r() * W, L = 80 + r() * 380, a = (r() - .5) * .5; g.strokeStyle = r() < .5 ? `rgba(255,255,255,${.04 + r() * .09})` : `rgba(0,0,0,${.04 + r() * .09})`; g.lineWidth = 12 + r() * 40; g.lineCap = "round";
        envuelto(g, W, W, () => { g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * L * .5, y + Math.sin(a) * L * .5 + (r() - .5) * 30, x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke() }) } });
    return juntar([cA, cL, cB], W, W) })();
  // CORTE de la tapa (bordes del agujero, del hueco y los costados del panel): 2 m × LID_T. Abajo el tablón pintado, las vigas, el entablonado de arriba y la tierra
  const CORTE = (() => { const W = 1024, H = Math.round(1024 / 2 * LID_T), py = v => H - v / LID_T * H;
    const [c, z] = pintarDoble(W, H, (c, z, w, h) => { const r = rng(7703); c.fillStyle = "#1c130c"; c.fillRect(0, 0, w, h); z.fillStyle = "#202020"; z.fillRect(0, 0, w, h);
      // tierra (0,9 → 1,3)
      c.fillStyle = "#4a3422"; c.fillRect(0, 0, w, py(.9)); z.fillStyle = "#909090"; z.fillRect(0, 0, w, py(.9));
      for (let k = 0; k < 900; k++) { const x = r() * w, y = r() * py(.9); c.fillStyle = r() < .5 ? `rgba(30,20,12,${.3 + r() * .5})` : `rgba(140,110,80,${.2 + r() * .4})`; c.beginPath(); c.ellipse(x, y, 2 + r() * 7, 2 + r() * 5, r() * 3, 0, 7); c.fill(); z.fillStyle = gris(.4 + r() * .6); z.beginPath(); z.ellipse(x, y, 2 + r() * 6, 2 + r() * 4, 0, 0, 7); z.fill() }
      for (let k = 0; k < 40; k++) { let x = r() * w, y = 0; c.strokeStyle = `rgba(190,160,110,${.4 + r() * .4})`; c.lineWidth = .8 + r() * 1.6; c.beginPath(); c.moveTo(x, y); for (let s = 0; s < 8; s++) { x += (r() - .5) * 18; y += 6 + r() * 14; c.lineTo(x, y) } c.stroke() }   // raíces del trigo
      c.fillStyle = "#8a7a3a"; c.fillRect(0, 0, w, 6);
      // entablonado de arriba (0,76 → 0,9)
      c.fillStyle = "#6a5038"; c.fillRect(0, py(.9), w, py(.76) - py(.9)); z.fillStyle = "#c0c0c0"; z.fillRect(0, py(.9), w, py(.76) - py(.9));
      for (let x = r() * 120; x < w; x += 90 + r() * 160) { c.fillStyle = "#140c06"; c.fillRect(x, py(.9), 3, py(.76) - py(.9)) }
      // vigas (0,06 → 0,76): cortes de punta con anillos cada 0,6 m, y el hueco oscuro entre vigas con tierra colada
      for (let x = 40; x < w; x += .6 * 512) { const bw = .14 * 512; c.fillStyle = "#7a5a3c"; c.fillRect(x, py(.76), bw, py(.06) - py(.76)); z.fillStyle = "#d0d0d0"; z.fillRect(x, py(.76), bw, py(.06) - py(.76));
        for (let a = 1; a < 9; a++) { c.strokeStyle = `rgba(60,40,24,${.5})`; c.lineWidth = 1.5; c.strokeRect(x + a * 4, py(.76) + a * 6, bw - a * 8, py(.06) - py(.76) - a * 12) } }
      for (let k = 0; k < 60; k++) { const x = r() * w, y = py(.76) + r() * (py(.06) - py(.76)); c.fillStyle = `rgba(80,60,40,${.3 + r() * .3})`; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 6, y + 40 + r() * 60); c.lineTo(x - 6, y + 40 + r() * 60); c.fill() }   // tierra colada
      // tablón de abajo (0 → 0,06) con la pintura celeste en el canto inferior
      c.fillStyle = "#86684a"; c.fillRect(0, py(.06), w, h - py(.06)); z.fillStyle = "#d8d8d8"; z.fillRect(0, py(.06), w, h - py(.06));
      for (let x = r() * 60; x < w; x += .25 * 512) { c.fillStyle = "#1a120a"; c.fillRect(x, py(.06), 3, h - py(.06)) }
      c.fillStyle = "#7fb2e6"; c.fillRect(0, h - 5, w, 5);
      for (let k = 0; k < 200; k++) { c.strokeStyle = `rgba(40,26,14,${.2 + r() * .3})`; c.lineWidth = 1; const x = r() * w, y = py(.06) + r() * (h - py(.06)); c.beginPath(); c.moveTo(x, y); c.lineTo(x + 20 + r() * 60, y + (r() - .5) * 3); c.stroke() } });
    [c, z].forEach(t => { t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.ClampToEdgeWrapping });
    return { c, z } })();

  // ---------------- MATERIALES ----------------
  const SKY_A = new THREE.Color("#4d8fd8"), SKY_B = new THREE.Color("#b4d6f0"), NUB_SH = new THREE.Color("#a9bdd6"), NUB_HI = new THREE.Color("#eef3f8"), SOL_C = new THREE.Color("#efe5c9"), HALO_C = new THREE.Color("#e9e6c8");
  const LID_FRAG = `{
  vec2 wp = vWq.xz; float dist = length(vViewPosition);
  // el cielo pintado: degradé (más hondo arriba del pueblo, más pálido lejos), pinceladas, nubes y el sol blanco
  float r0 = length(wp - vec2(0., -30.));
  vec3 sky = mix(uSkyA, uSkyB, smoothstep(15., 560., r0));
  vec3 nb = texture2D(tNub, wp / 120. + vec2(.13, .41)).rgb;
  vec3 nb2 = texture2D(tNub, vec2(wp.y, -wp.x) / 113. + vec2(.57, .2)).rgb;
  float m2 = max(smoothstep(.45, .56, texture2D(tNub, wp / 1300. + vec2(.3, .7)).b), 1. - smoothstep(120., 220., r0));
  sky *= .9 + .2 * nb.b;
  float c2 = nb2.r * m2; float cl = max(nb.r, c2); float shd = nb.r >= c2 ? nb.g : nb2.g;
  vec2 dso = wp - uSol; float ds = length(dso), ang = atan(dso.y, dso.x);
  cl *= smoothstep(10., 18., ds) * smoothstep(7., 13., length(wp - uAg)) * (1. - .75 * smoothstep(2.5, 7., vWave));
  vec3 paint = mix(sky, mix(uNubSh, uNubHi, shd), cl);
  paint = mix(paint, uNubSh * .82, smoothstep(.12, .35, cl) * (1. - smoothstep(.4, .75, cl)) * .55);   // contorno de pincel
  float rr = 3.3 * (1. + .022 * sin(ang * 9.) + .014 * sin(ang * 23. + 1.));
  float halo = (1. - smoothstep(rr, 7.5, ds)) * (.7 + .3 * sin(ds * 4.1 + sin(ang * 5.) * .9));
  paint = mix(paint, uHalo, clamp(halo, 0., 1.) * .28);
  float disco = 1. - smoothstep(rr - .05, rr + .05, ds); gSunM = max(disco, clamp(halo, 0., 1.) * .5);
  vec3 sc = uSunC * (.9 + .1 * nb.b) * (.94 + .06 * sin(ang * 3. + ds * 6.) * sin(ds * 9. - ang * 2.));
  sc = mix(sc, uSunC * .82, smoothstep(rr - .45, rr - .05, ds));
  paint = mix(paint, sc, disco);
  // de cerca: tablones, vetas, clavos, pintura descascarada, manchas de goteo
  float nd = gl_FrontFacing ? max(1. - smoothstep(2., 8., dist), smoothstep(2.5, 7., vWave) * (1. - smoothstep(30., 70., dist))) : 1.;
  vec3 col = paint;
  float fw = fwidth(wp.y);
  float jz = abs(fract(wp.y / .25 + .5) - .5) * .25;
  float jl = (1. - smoothstep(0., fw * 1.2 + .004, jz)) * min(1., .007 / max(fw, 1e-5));
  col *= 1. - jl * .1 * (1. - smoothstep(8., 45., dist));
  if (nd > 0.) {
    float blk = floor(wp.y / 2.);
    vec2 tuv = vec2(wp.x / 4. + hsh1(blk) * 7.31, wp.y / 2.);
    vec2 gx = dFdx(tuv), gy = dFdy(tuv);
    vec3 d1 = textureGrad(tDet, tuv, gx, gy).rgb, d2 = textureGrad(tDet2, tuv, gx, gy).rgb;
    float row = floor(wp.y / .25), seg = floor(tuv.x * 3.);
    float ph = hsh1(row * 3.1 + seg * 17.7);
    vec3 painted = paint * (.95 + .1 * (ph - .5)) * (.95 + .08 * (d1.r - .5));
    vec3 wood = mix(vec3(.075, .062, .05), vec3(.21, .18, .145), d1.r);
    vec3 near = mix(wood, painted, smoothstep(.35, .65, d1.g));
    near = mix(near, near * vec3(.62, .55, .45), d2.r * .7);
    near = mix(near, vec3(.06, .045, .035), smoothstep(.3, .7, d2.g));
    float groove = 1. - smoothstep(.08, .42, d1.b);
    near *= 1. - .9 * groove;
    float sh2 = clamp(1. + 5. * (dFdx(d1.b) * -.55 + dFdy(d1.b) * .8), .55, 1.35);
    col = mix(col, near * sh2, nd);
  }
  if (!gl_FrontFacing) col = mix(col, vec3(.15, .11, .075), .5 + .3 * texture2D(tNub, wp / 7.).b);
  diffuseColor.rgb = col;
}`;
  const lidUni = () => ({ tNub: { value: NUB }, tDet: { value: DET.d1 }, tDet2: { value: DET.d2 }, uSol: { value: new THREE.Vector2(SOL_PINTADO[0], SOL_PINTADO[1]) }, uSkyA: { value: SKY_A }, uSkyB: { value: SKY_B }, uNubSh: { value: NUB_SH }, uNubHi: { value: NUB_HI }, uSunC: { value: SOL_C }, uHalo: { value: HALO_C } });
  const LID_HEAD = "\nfloat gSunM = 0.; uniform sampler2D tNub, tDet, tDet2; uniform vec2 uSol; uniform vec3 uSkyA, uSkyB, uNubSh, uNubHi, uSunC, uHalo;";
  const lidMat = (panel) => sagify(new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .92, metalness: 0, side: THREE.DoubleSide }), { panel, hole: panel, esc: !panel, uni: lidUni(), fragHead: LID_HEAD, frag: LID_FRAG, emi: "totalEmissiveRadiance = diffuseColor.rgb * uEmi * (1. - .5 * gSunM) * (gl_FrontFacing ? 1. : .35);", key: "lid" });
  const M_LID = lidMat(false), M_LID_P = lidMat(true);
  const corteMat = (panel, hole) => sagify(new THREE.MeshStandardMaterial({ map: CORTE.c, bumpMap: CORTE.z, bumpScale: 3, roughness: .95, side: THREE.DoubleSide }), { panel, hole, key: "corte" });
  const M_CORTE = corteMat(false, false), M_CORTE_P = corteMat(true, false);

  // ---------------- MALLAS ----------------
  // coordenadas: parejas (paso) en [a0, a1] y crecen de a `grow` hasta ±lim
  const coords = (a0, a1, step, lim, grow) => { const L = []; for (let v = a0; v <= a1 + 1e-6; v += step) L.push(+v.toFixed(3)); let s = step, v = L[L.length - 1]; while (v < lim) { s *= grow; v += s; L.push(v) } s = step; v = L[0]; while (v > -lim) { s *= grow; v -= s; L.unshift(v) } return L };
  // grilla: y = fy(x, z); skip(x0, x1, z0, z1) saltea celdas; abajo = normales hacia abajo; color = fc(x, z) → [r,g,b]
  const grilla = (xs, zs, fy, { skip = null, abajo = false, uvs = 4, fc = null } = {}) => { const nx = xs.length, nz = zs.length, pos = new Float32Array(nx * nz * 3), uv = new Float32Array(nx * nz * 2), col = fc ? new Float32Array(nx * nz * 3) : null, idx = [];
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const k = j * nx + i, x = xs[i], z = zs[j]; pos[k * 3] = x; pos[k * 3 + 1] = fy(x, z); pos[k * 3 + 2] = z; uv[k * 2] = x / uvs; uv[k * 2 + 1] = z / uvs; if (col) { const c = fc(x, z); col.set(c, k * 3) } }
    for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) { if (skip && skip(xs[i], xs[i + 1], zs[j], zs[j + 1])) continue; const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1; abajo ? idx.push(a, b, c, b, d, c) : idx.push(a, c, b, b, c, d) }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); if (col) g.setAttribute("color", new THREE.BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals(); g.computeBoundingSphere(); return g };
  const fueraPanel = (x0, x1, z0, z1) => x0 >= P0.x0 - 1e-3 && x1 <= P0.x1 + 1e-3 && z0 >= P0.z0 - 1e-3 && z1 <= P0.z1 + 1e-3;
  // cara de ABAJO (el cielo que se ve), toda la tapa menos el panel
  const LID = new THREE.Mesh(grilla(coords(-40, 40, .5, 1700, 1.07), coords(-20, 50, .5, 1700, 1.07), (x, z) => CIELO(x, z), { skip: fueraPanel, abajo: true }), M_LID);
  LID.frustumCulled = false; LID.receiveShadow = false; LID.castShadow = false; G.add(LID);
  // el panel: cara de abajo
  const PXS = coords(P0.x0, P0.x1, .5, 0, 1).filter(v => v >= P0.x0 && v <= P0.x1), PZS = coords(P0.z0, P0.z1, .5, 0, 1).filter(v => v >= P0.z0 && v <= P0.z1);
  const LID_P = new THREE.Mesh(grilla(PXS, PZS, (x, z) => CIELO(x, z), { abajo: true }), M_LID_P); LID_P.castShadow = true; LID_P.receiveShadow = false; PAN.add(LID_P);
  // paredes de corte: a lo largo de un borde (lista de [x, z]), de CIELO a CIELO + LID_T, mirando hacia `n` (normal horizontal)
  const pared = (pts, mat) => { const pos = [], uv = [], idx = []; let s = 0;
    pts.forEach(([x, z], i) => { if (i) s += Math.hypot(x - pts[i - 1][0], z - pts[i - 1][1]); const y0 = CIELO(x, z); pos.push(x, y0, z, x, y0 + LID_T, z); uv.push(s / 2, 0, s / 2, 1); if (i) { const a = (i - 1) * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3) } });
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return new THREE.Mesh(g, mat) };
  const borde = (x0, z0, x1, z1, n = 60) => Array.from({ length: n + 1 }, (_, i) => [lerp(x0, x1, i / n), lerp(z0, z1, i / n)]);
  const LADOS = [[P0.x0, P0.z0, P0.x1, P0.z0], [P0.x1, P0.z0, P0.x1, P0.z1], [P0.x1, P0.z1, P0.x0, P0.z1], [P0.x0, P0.z1, P0.x0, P0.z0]];
  const BORDE_HUECO = new THREE.Group(); G.add(BORDE_HUECO); LADOS.forEach(L => { const m = pared(borde(...L), M_CORTE); m.receiveShadow = true; BORDE_HUECO.add(m) });
  const LADOS_PANEL = new THREE.Group(); PAN.add(LADOS_PANEL); LADOS.forEach(L => { const m = pared(borde(...L), M_CORTE_P); m.castShadow = m.receiveShadow = true; LADOS_PANEL.add(m) });
  // astillas y vigas rotas en el borde del hueco (aparecen cuando cae el panel)
  const ROTOS = (() => { const r = rng(7704), vig = [], ast = [];
    LADOS.forEach(([x0, z0, x1, z1]) => { const L = Math.hypot(x1 - x0, z1 - z0), dx = (x1 - x0) / L, dz = (z1 - z0) / L, nx = dz, nz = -dx;   // nx,nz apunta hacia adentro del hueco
      for (let s = .3; s < L; s += .6) { const x = x0 + dx * s, z = z0 + dz * s, y = CIELO(x, z); if (r() < .55) vig.push({ p: [x + nx * (.1 + r() * .5), y + .42, z + nz * (.1 + r() * .5)], ry: Math.atan2(nx, nz), rx: (r() - .5) * .5 - .3, s: [1, 1, .4 + r() * 1.4] }) }
      for (let s = .1; s < L; s += .25) { const x = x0 + dx * s, z = z0 + dz * s, y = CIELO(x, z); if (r() < .7) ast.push({ p: [x + nx * r() * .2, y + .02, z + nz * r() * .2], ry: Math.atan2(nx, nz) + (r() - .5) * .6, rx: .5 + r() * 1.1, s: [.7 + r() * .6, .6 + r() * 1.6, .7 + r() * .6] }) } });
    const gV = new THREE.BoxGeometry(.14, .68, 1); gV.translate(0, 0, .5); const gA = new THREE.ConeGeometry(.06, .5, 4); gA.translate(0, -.25, 0); gA.rotateX(Math.PI);
    const M_V = SMt(CORTE.c, { roughness: .9, color: "#9a7a58" }), M_A = new THREE.MeshStandardMaterial({ color: "#8a6a4a", roughness: .9 });
    const mk_ = (geo, mat, L) => { const m = new THREE.InstancedMesh(geo, mat, L.length); L.forEach((q, i) => { dummy.position.set(...q.p); dummy.rotation.set(q.rx, q.ry, 0, "YXZ"); dummy.scale.set(...q.s); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix) }); m.castShadow = m.receiveShadow = true; BORDE_HUECO.add(m); return m };
    return [mk_(gV, M_V, vig), mk_(gA, M_A, ast)] })();
  // el agujero del narrador: cilindro de corte (escalado al tamaño del tajo)
  const RIM = (() => { const g = new THREE.CylinderGeometry(1, 1, LID_T, 40, 1, true), p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) { const a = Math.atan2(p.getZ(i), p.getX(i)), k = 1 + .07 * Math.sin(a * 7 + 1) + .05 * Math.sin(a * 13); p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); uv.setX(i, uv.getX(i) * 1.4) }
    g.translate(0, LID_T / 2, 0); g.computeVertexNormals(); const m = new THREE.Mesh(g, corteMat(true, false)); m.position.set(AGUJERO[0], CIELO(...AGUJERO), AGUJERO[1]); m.visible = false; m.castShadow = m.receiveShadow = true; PAN.add(m); return m })();

  // ---------------- PLACAS DE HIERRO abulonadas donde apoya cada poste ----------------
  const T_RUST = (() => { const [c, z] = pintarDoble(512, 512, (c, z, w, h) => { const r = rng(7705); c.fillStyle = "#3a3634"; c.fillRect(0, 0, w, h); z.fillStyle = "#808080"; z.fillRect(0, 0, w, h);
      for (let k = 0; k < 500; k++) { const x = r() * w, y = r() * h, R = 2 + r() * 22; c.fillStyle = r() < .5 ? `rgba(130,60,24,${.15 + r() * .4})` : `rgba(20,18,16,${.2 + r() * .3})`; c.beginPath(); c.ellipse(x, y, R, R * (.5 + r() * .5), r() * 3, 0, 7); c.fill(); z.fillStyle = gris(.3 + r() * .7); z.beginPath(); z.arc(x, y, R * .6, 0, 7); z.fill() }
      c.strokeStyle = "rgba(200,190,170,.25)"; c.lineWidth = 6; c.strokeRect(8, 8, w - 16, h - 16) }); return { c, z } })();
  const M_PLACA = new THREE.MeshStandardMaterial({ map: T_RUST.c, bumpMap: T_RUST.z, bumpScale: 2, roughness: .62, metalness: .55 });
  const T_MANCHA = tex(256, 256, (g, w, h) => { const r = rng(7706); g.clearRect(0, 0, w, h); for (let k = 0; k < 60; k++) { const a = r() * 6.283, d = 40 + r() * 70, x = w / 2 + Math.cos(a) * d, y = h / 2 + Math.sin(a) * d, gr = g.createRadialGradient(x, y, 0, x, y, 14 + r() * 26); gr.addColorStop(0, `rgba(96,60,34,${.15 + r() * .25})`); gr.addColorStop(1, "rgba(96,60,34,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h) } });
  const M_MANCHA = new THREE.MeshBasicMaterial({ map: T_MANCHA, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const PLACAS = [];
  const placaEn = (x, z, par = G) => { const g = new THREE.Group(), S = 1.8; par.add(g);
    const pl = part(new THREE.BoxGeometry(S, .06, S), M_PLACA, 0, -.03, 0, g, 0); pl.castShadow = true;
    const bl = new THREE.InstancedMesh(new THREE.CylinderGeometry(.045, .045, .05, 6), SM("#2c2826", { metalness: .6, roughness: .45 }), 20); let n = 0;
    for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) { if (i > 0 && i < 4 && j > 0 && j < 4) continue; dummy.position.set(-S / 2 + .14 + i * (S - .28) / 4, -.075, -S / 2 + .14 + j * (S - .28) / 4); dummy.rotation.set(0, i + j, 0); dummy.scale.setScalar(1); dummy.updateMatrix(); bl.setMatrixAt(n++, dummy.matrix) }
    bl.count = n; g.add(bl);
    const mc = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.8), M_MANCHA); mc.rotation.x = Math.PI / 2; mc.position.y = -.004; g.add(mc);
    const q = { g, x, z, par }; PLACAS.push(q); return q };
  CALLES.forEach(C => { const x = C.poste, z = C.z; placaEn(x, z, enPanel(x, z) ? PAN : G) });
  placaEn(POSTE_NUEVE_LOMA[0], POSTE_NUEVE_LOMA[1]);

  // ---------------- PARTÍCULAS ----------------
  const PSCALE = { value: 1000 };
  const ptsMat = (vtx, frag, uni, add = false) => new THREE.ShaderMaterial({ uniforms: Object.assign({}, U, { uScale: PSCALE }, uni), vertexShader: SAG_GLSL + "\nuniform float uScale;\n" + vtx, fragmentShader: frag, transparent: true, depthWrite: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending });
  // POLVO Y TIERRA que caen de las juntas: kind 0 polvo fino (lento, flota), 1 granos (caen), 2 chorritos (siempre del mismo punto)
  const POLVO = (() => { const N = 9000, r = rng(7707), aO = new Float32Array(N * 4), aR = new Float32Array(N * 4), pos = new Float32Array(N * 3);
    const CH = Array.from({ length: 40 }, () => [lerp(-24, 24, r()), Math.round(lerp(-9, 10, r()) / .25) * .25]);
    for (let i = 0; i < N; i++) { const kind = i < 1800 ? 2 : r() < .5 ? 0 : 1; let x, z;
      if (kind === 2) { const c = CH[i % CH.length]; x = c[0] + (r() - .5) * .04; z = c[1] } else { x = lerp(-30, 30, r()); z = r() < .7 ? Math.round(lerp(-11, 12, r()) / .25) * .25 : lerp(-11, 12, r()) }
      aO.set([x, z, kind === 2 ? (i / CH.length | 0) / 45 + r() * .01 : r(), kind], i * 4); aR.set([r(), r(), Math.sqrt(r()) * Math.cos(r() * 6.283), Math.sqrt(r()) * Math.sin(r() * 6.283)], i * 4); pos.set([x, CIELO(x, z), z], i * 3) }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("aO", new THREE.BufferAttribute(aO, 4)); g.setAttribute("aR", new THREE.BufferAttribute(aR, 4));
    const m = new THREE.Points(g, ptsMat(`
attribute vec4 aO, aR; uniform float uAmt, uFocoY; uniform vec4 uFoco; varying float vA; varying float vK;
void main(){
  float kind = aO.w; float T = kind < .5 ? 5. : 2.2;
  float tau = mod(uT + aO.z * T, T);
  vec2 xz = mix(aO.xy, uFoco.xy + aR.zw * uFoco.z, uFoco.w);
  float y0 = mix(position.y, uFocoY, uFoco.w) - sagF(xz) - .03;
  float fall = kind < .5 ? (.55 * tau + .12 * tau * tau) : (kind < 1.5 ? 4.9 * tau * tau : 4.9 * tau * tau);
  vec3 p = vec3(xz.x, y0 - fall, xz.y);
  if (kind < .5) { p.x += sin(tau * 1.7 + aR.y * 6.) * .25 * tau; p.z += cos(tau * 1.3 + aR.x * 6.) * .2 * tau; }
  vA = step(aR.x, uAmt) * smoothstep(.0, .25, tau) * smoothstep(.1, .8, p.y) * (kind < .5 ? (1. - tau / T) : 1.);
  vK = kind;
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  float sz = (kind < .5 ? .04 : (kind < 1.5 ? .05 + aR.y * .05 : .045)) * mix(1., .35, uFoco.w);
  vA *= smoothstep(.35, 1.2, -mv.z);
  gl_PointSize = vA > 0. ? clamp(sz * uScale / -mv.z, 1.2, mix(40., 9., uFoco.w)) : 0.;
  gl_Position = projectionMatrix * mv;
}`, `varying float vA; varying float vK; uniform vec3 uCol;
void main(){ vec2 d = gl_PointCoord - .5; float a = 1. - smoothstep(.3, .5, length(d)); if (a * vA < .02) discard;
  vec3 c = vK < .5 ? vec3(.62, .52, .40) : vec3(.24, .17, .11); gl_FragColor = vec4(c * uCol, a * vA * (vK < .5 ? .55 : .95)); }`, { uAmt: { value: 0 }, uFoco: { value: new THREE.Vector4(0, 0, 1, 0) }, uFocoY: { value: 12 }, uCol: { value: new THREE.Color(1, 1, 1) } }));
    m.frustumCulled = false; m.renderOrder = 3; G.add(m); return m })();
  // EL HAZ de sol de verdad (agujero o hueco): volumen aditivo + polvo brillante + una luz focal sin sombras
  const BEAM_V = `varying vec2 vUv; varying vec3 vN, vV; void main(){ vUv = uv; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`;
  const BEAM_F = `uniform float uA, uT; uniform vec3 uC; varying vec2 vUv; varying vec3 vN, vV;
void main(){ float f = abs(dot(vN, vV)); float st = .62 + .25 * sin(vUv.x * 41. + sin(vUv.x * 13.) * 2. + uT * .3) + .13 * sin(vUv.x * 97. - uT * .5);
  float al = uA * pow(f, 1.4) * st * smoothstep(0., .08, vUv.y) * (1. - smoothstep(.55, 1., vUv.y));
  gl_FragColor = vec4(uC * al, al); }`;
  const beamMat = () => new THREE.ShaderMaterial({ uniforms: { uA: { value: 0 }, uT: U.uT, uC: { value: new THREE.Color("#ffd49a") } }, vertexShader: BEAM_V, fragmentShader: BEAM_F, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  // un prisma inclinado: sección `sec` (lista de [x,z]) arriba en y=0, baja a lo largo de −HAZ hasta y = −L
  const prisma = (sec, L) => { const pos = [], uv = [], idx = [], n = sec.length, dx = -HAZ[0] / HAZ[1] * L, dz = -HAZ[2] / HAZ[1] * L; let per = 0; const acc = [0]; for (let i = 1; i <= n; i++) { per += Math.hypot(sec[i % n][0] - sec[i - 1][0], sec[i % n][1] - sec[i - 1][1]); acc.push(per) }
    for (let i = 0; i <= n; i++) { const [x, z] = sec[i % n]; for (let j = 0; j <= 8; j++) { const v = j / 8; pos.push(x + dx * v, -L * v, z + dz * v); uv.push(acc[i] / per, v) } }
    for (let i = 0; i < n; i++) for (let j = 0; j < 8; j++) { const a = i * 9 + j, b = a + 9; idx.push(a, b, a + 1, a + 1, b, b + 1) }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g };
  const HAZ_AG = new THREE.Mesh(prisma(Array.from({ length: 24 }, (_, i) => [Math.cos(i / 24 * 6.283) * AG_R, Math.sin(i / 24 * 6.283) * AG_R]), 16), beamMat()); HAZ_AG.frustumCulled = false; HAZ_AG.renderOrder = 4; G.add(HAZ_AG);
  const HAZ_HU = new THREE.Mesh(prisma([[P0.x0, P0.z0], [P0.x1, P0.z0], [P0.x1, P0.z1], [P0.x0, P0.z1]].map(([x, z]) => [x - PC[0], z - PC[1]]).flatMap((p, i, L) => { const q = L[(i + 1) % 4]; return Array.from({ length: 12 }, (_, k) => [lerp(p[0], q[0], k / 12), lerp(p[1], q[1], k / 12)]) }), 16), beamMat()); HAZ_HU.frustumCulled = false; HAZ_HU.renderOrder = 4; G.add(HAZ_HU);
  const MOTAS = (() => { const N = 2600, r = rng(7708), aR = new Float32Array(N * 4); for (let i = 0; i < N; i++) aR.set([r(), r(), r(), r()], i * 4);
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3)); g.setAttribute("aR", new THREE.BufferAttribute(aR, 4));
    const m = new THREE.Points(g, ptsMat(`
attribute vec4 aR; uniform vec4 uBox; uniform vec3 uTop, uHaz; uniform float uL, uA, uDisk; varying float vA;
void main(){
  vec2 o = uDisk > .5 ? vec2(cos(aR.y * 6.283), sin(aR.y * 6.283)) * sqrt(aR.x) * uBox.x : vec2(mix(uBox.x, uBox.y, aR.x), mix(uBox.z, uBox.w, aR.y));
  float s = fract(aR.z + uT * (.004 + aR.w * .006)) * uL;
  vec3 p = uTop + vec3(o.x, 0., o.y) - uHaz / uHaz.y * s;
  p += vec3(sin(uT * .4 + aR.w * 30.), sin(uT * .3 + aR.z * 20.) * .6, cos(uT * .35 + aR.x * 25.)) * .12;
  vA = uA * smoothstep(0., .1, s / uL) * (1. - smoothstep(.7, 1., s / uL)) * (.5 + .5 * sin(uT * 2. + aR.w * 40.));
  vec4 mv = modelViewMatrix * vec4(p, 1.); gl_PointSize = vA > .01 ? clamp((.012 + aR.x * .02) * uScale / -mv.z, 1., 14.) : 0.; gl_Position = projectionMatrix * mv; }`,
      `varying float vA; void main(){ vec2 d = gl_PointCoord - .5; float a = (1. - smoothstep(.15, .5, length(d))) * vA; gl_FragColor = vec4(vec3(1., .86, .6) * a, a); }`,
      { uBox: { value: new THREE.Vector4() }, uTop: { value: new THREE.Vector3() }, uHaz: { value: new THREE.Vector3(...HAZ) }, uL: { value: 14 }, uA: { value: 0 }, uDisk: { value: 1 } }, true));
    m.frustumCulled = false; m.renderOrder = 5; G.add(m); return m })();
  const SPOT = new THREE.SpotLight("#ffd29a", 0, 0, .1, .3, 0); SPOT.castShadow = false; scene.add(SPOT, SPOT.target);

  // LLUVIA DE ORO: espigas que caen girando, terrones de tierra y briznas que brillan al sol
  const ESPIGA_G = (() => { const L = [], cab = new THREE.CylinderGeometry(.022, .009, .1, 5, 3); { const p = cab.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i), k = .55 + .45 * Math.sin((y / .1 + .5) * Math.PI); p.setX(i, p.getX(i) * k * 1.3); p.setZ(i, p.getZ(i) * k) } } cab.translate(0, .05, 0); L.push([cab, null]);
    const tal = new THREE.CylinderGeometry(.003, .003, .22, 3); tal.translate(0, -.11, 0); L.push([tal, null]); const bar = new THREE.PlaneGeometry(.004, .07); for (let k = 0; k < 4; k++) { const b = bar.clone(); b.translate(0, .035, 0); b.rotateZ((k - 1.5) * .12); b.rotateY(k * .8); b.translate(0, .09, 0); L.push([b, null]) }
    return mergeGeo(L) })();
  const M_ORO = new THREE.MeshStandardMaterial({ color: "#f0c45e", roughness: .4, metalness: .15, emissive: "#b07820", emissiveIntensity: .7, side: THREE.DoubleSide });
  const LLUVIA = (() => { const N = 2400, NT = 80, r = rng(7709), d = [], dt = []; for (let i = 0; i < N; i++) { const borde = r() < .55; let x, z; if (borde) { const s = r() * 2 * (P0.x1 - P0.x0 + P0.z1 - P0.z0); const L1 = P0.x1 - P0.x0, L2 = P0.z1 - P0.z0; if (s < L1) { x = P0.x0 + s; z = P0.z0 + r() * 1.2 } else if (s < 2 * L1) { x = P0.x0 + s - L1; z = P0.z1 - r() * 1.2 } else if (s < 2 * L1 + L2) { x = P0.x0 + r() * 1.2; z = P0.z0 + s - 2 * L1 } else { x = P0.x1 - r() * 1.2; z = P0.z0 + s - 2 * L1 - L2 } } else { x = lerp(P0.x0, P0.x1, r()); z = lerp(P0.z0, P0.z1, r()) }
      d.push([x, z, r(), 2.2 + r() * 1.6, r() * 6.28, r() * 6.28, 2.6 + r() * 1.2, r()]) }
    for (let i = 0; i < NT; i++) dt.push([lerp(P0.x0, P0.x1, r()), lerp(P0.z0, P0.z1, r()), r(), r() * 6.28, .5 + r()]);
    const m = new THREE.InstancedMesh(ESPIGA_G, M_ORO, N), mt = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.045, 0), new THREE.MeshStandardMaterial({ color: "#3a2a1c", roughness: 1 }), NT); [m, mt].forEach(q => { q.frustumCulled = false; q.castShadow = true; G.add(q) });
    // briznas: puntos dorados que destellan
    const NB = 6000, aR = new Float32Array(NB * 4); for (let i = 0; i < NB; i++) aR.set([r(), r(), r(), r()], i * 4);
    const gb = new THREE.BufferGeometry(); gb.setAttribute("position", new THREE.BufferAttribute(new Float32Array(NB * 3), 3)); gb.setAttribute("aR", new THREE.BufferAttribute(aR, 4));
    const mb = new THREE.Points(gb, ptsMat(`attribute vec4 aR; uniform float uA, uY0, uY1; varying float vA;
void main(){ float T = 9.; float tau = mod(uT + aR.z * T, T); float y = uY0 - tau * (1. + aR.w * .8);
  vec3 p = vec3(mix(uPan.x, uPan.y, aR.x) + sin(tau * 1.3 + aR.w * 20.) * .5, y, mix(uPan.z, uPan.w, aR.y) + cos(tau * 1.1 + aR.z * 20.) * .5);
  vA = step(aR.w, uA) * smoothstep(uY1, uY1 + 1., y) * (.35 + .65 * pow(.5 + .5 * sin(uT * 9. + aR.x * 60.), 4.));
  vec4 mv = modelViewMatrix * vec4(p, 1.); gl_PointSize = vA > .01 ? clamp((.03 + aR.y * .03) * uScale / -mv.z, 1.5, 12.) : 0.; gl_Position = projectionMatrix * mv; }`,
      `varying float vA; void main(){ vec2 d = gl_PointCoord - .5; float a = (1. - smoothstep(.1, .5, length(d))) * vA; gl_FragColor = vec4(vec3(1., .82, .45) * a, a); }`, { uA: { value: 0 }, uY0: { value: 14 }, uY1: { value: 2.4 } }, true));
    mb.frustumCulled = false; mb.renderOrder = 5; G.add(mb);
    return { m, mt, mb, d, dt, N, NT } })();

  // ---------------- LUGARES para la cámara ----------------
  const AG_Y0 = CIELO(...AGUJERO);
  const KELL_BORDE = [AGUJERO[0] + 4.5, CIELO(AGUJERO[0] + 4.5, P0.z0 - .9) + LID_T, P0.z0 - .9];

  // ---------------- API ----------------
  const tapaCaeY = u => { const y0 = CIELO(...PC) - ST.m; u = cl(u); if (u < .3) return lerp(y0, 7, (u / .3) ** 2); if (u < .45) return 7 - .3 * Math.sin(Math.PI * (u - .3) / .15); if (u < .85) { const q = (u - .45) / .4; return 7 - 6 * (q < .5 ? 2 * q * q : 1 - (-2 * q + 2) ** 2 / 2) + .08 * Math.sin(q * 40) * (1 - q) } return 1 + .12 * Math.sin((u - .85) / .15 * Math.PI) * (1 - (u - .85) / .15) };
  // altura de la cara de ABAJO en (x, z) con el hundimiento actual (dentro del panel caído: la cara de abajo del panel)
  const TAPA_Y = (x, z) => { if (enPanel(x, z)) { if (ST.cae > 0) return CIELO(x, z) + (tapaCaeY(ST.cae) - CIELO(...PC)); return CIELO(x, z) - ST.m - ST.m * .1 * panB(x, z) } return CIELO(x, z) - sagMain(x, z) };
  // piso de ARRIBA (tierra) en (x, z) con el hundimiento actual (sin relieve fino: ± 8 cm)
  const ARRIBA_Y = (x, z) => TAPA_Y(x, z) + LID_T;
  const AGUJERO_W = () => [AGUJERO[0], TAPA_Y(...AGUJERO), AGUJERO[1]];
  function tapaReset() { Object.assign(ST, { m: 0, cruje: 0, cae: 0, agu: 0, tan: 0, gotea: 0, foco: null, lluvia: 0, montones: true, escalera: false }) }
  const tapaHundir = (m, o = {}) => { ST.m = cl(m, 0, 4.5); ST.cruje = o.cruje ?? (ST.m > 0 && ST.m < 3.49 ? .6 : 0); if (o.polvo !== false && ST.m > 0) ST.gotea = Math.max(ST.gotea, o.polvo ?? .35) };
  const tapaGotea = (t, cant = .5, o = {}) => { ST.gotea = cl(cant); ST.foco = o.en ? [o.en[0], o.en[1], o.r ?? .6] : null };
  const tapaAgujero = u => { ST.agu = cl(u) };
  const tapaCae = u => { ST.cae = cl(u) };
  const lluviaTrigo = (t, u) => { ST.lluvia = cl(u) };
  const tanerCae = u => { ST.tan = cl(u) };

  // por cuadro (llamar después de tapaReset y de las funciones de arriba): mueve todo y prende/apaga lo que corresponde
  function tapa(t) { ST.t = t; U.uT.value = t;
    const caeK = sst(0, .12, ST.cae); U.uM.value = ST.m; U.uCaeK.value = ST.cae > 0 ? caeK : 0; U.uTan.value = ST.tan < 1 ? ST.tan * ST.tan * (3 - 2 * ST.tan) : 1;
    // el panel: rígido + crujidos; cae entero
    if (ST.cae > 0) { const y = tapaCaeY(ST.cae); PAN.position.set(0, y - CIELO(...PC), 0); PAN.rotation.set(.012 * Math.sin(Math.PI * ST.cae) + (ST.cae > .85 ? 0 : .004 * Math.sin(ST.cae * 50)), 0, -.018 * Math.sin(Math.PI * ST.cae)) }
    else { PAN.position.set(0, -ST.m, 0); PAN.rotation.set(0, 0, 0); }
    BORDE_HUECO.visible = ST.cae > 0; LADOS_PANEL.visible = ST.cae > 0;
    // agujero: tajo (0 → .35: se alarga) y después se abre (→ 1)
    const u = ST.agu, rx = u <= 0 ? 0 : u < .35 ? AG_R * u / .35 : AG_R, rz = u <= 0 ? 0 : u < .35 ? .025 : lerp(.025, AG_R, eOut((u - .35) / .65));
    U.uAgR.value.set(rx, rz); U.uPisa.value = sst(.35, .6, u); RIM.visible = u > 0 && ST.cae === 0; if (RIM.visible) RIM.scale.set(rx, 1, rz);
    // placas: siguen a la tapa
    PLACAS.forEach(q => { if (q.par === PAN) q.g.position.set(q.x, CIELO(q.x, q.z), q.z); else q.g.position.set(q.x, CIELO(q.x, q.z) - sagMain(q.x, q.z), q.z) });
    // polvo de las juntas
    { const M = POLVO.material.uniforms; M.uAmt.value = ST.gotea; POLVO.visible = ST.gotea > 0; if (ST.foco) { M.uFoco.value.set(ST.foco[0], ST.foco[1], ST.foco[2], 1); M.uFocoY.value = CIELO(ST.foco[0], ST.foco[1]) } else M.uFoco.value.w = 0 }
    // el haz
    const aguA = ST.cae > 0 ? 0 : sst(.35, 1, u), huA = sst(.05, .35, ST.cae);
    HAZ_AG.visible = aguA > 0; HAZ_HU.visible = huA > 0; MOTAS.visible = aguA > 0 || huA > 0;
    const MU = MOTAS.material.uniforms;
    if (aguA > 0) { const p = AGUJERO_W(); HAZ_AG.position.set(p[0], p[1] + .02, p[2]); HAZ_AG.scale.set(rx / AG_R, 1, rz / AG_R); HAZ_AG.material.uniforms.uA.value = .55 * aguA;
      MU.uDisk.value = 1; MU.uBox.value.set(Math.min(rx, rz) * .9, 0, 0, 0); MU.uTop.value.set(p[0], p[1], p[2]); MU.uL.value = p[1] / HAZ[1] * .98; MU.uA.value = aguA;
      SPOT.position.set(p[0] + HAZ[0] * 40, p[1] + HAZ[1] * 40, p[2] + HAZ[2] * 40); SPOT.target.position.set(p[0] - HAZ[0] * 12, p[1] - HAZ[1] * 12, p[2] - HAZ[2] * 12); SPOT.angle = Math.atan(Math.max(rx, rz) / 40) * 1.08; SPOT.penumbra = .35; SPOT.intensity = 16 * aguA }
    else if (huA > 0) { const y = CIELO(...PC); HAZ_HU.position.set(PC[0], y, PC[1]); HAZ_HU.material.uniforms.uA.value = .2 * huA;
      MU.uDisk.value = 0; MU.uBox.value.set(P0.x0 + 1, P0.x1 - 1, P0.z0 + 1, P0.z1 - 1); MU.uTop.value.set(0, y, 0); MU.uL.value = y / HAZ[1]; MU.uA.value = huA;
      SPOT.position.set(PC[0] + HAZ[0] * 150, y + HAZ[1] * 150, PC[1] + HAZ[2] * 150); SPOT.target.position.set(PC[0], 0, PC[1]); SPOT.angle = Math.atan(17 / 150); SPOT.penumbra = .25; SPOT.intensity = 7 * huA }
    else SPOT.intensity = 0;
    ST.spotI = SPOT.intensity; SPOT.visible = true; SPOT.target.updateMatrixWorld();
    // lluvia de oro
    { const L = LLUVIA, on = ST.lluvia > 0; L.m.visible = L.mt.visible = L.mb.visible = on; if (on) { const ytop = CIELO(...PC) + LID_T, ybot = ST.cae > 0 ? tapaCaeY(ST.cae) + LID_T + .1 : 0;
      let n = 0; const Q = new THREE.Quaternion(), E = new THREE.Euler(), M4 = new THREE.Matrix4(), S = new THREE.Vector3();
      for (let i = 0; i < L.N; i++) { const [x, z, ph, v, a1, a2, sc, act] = L.d[i]; if (act > ST.lluvia) continue; const T = (ytop - ybot) / v + .6, tau = (t + ph * T) % T, y = ytop - tau * v; if (y < ybot) continue;
        E.set(a1 + tau * 3.1, a2 + tau * 2.3, tau * 1.7); Q.setFromEuler(E); S.setScalar(sc); M4.compose(new THREE.Vector3(x + Math.sin(tau * 1.9 + a1) * .5, y, z + Math.cos(tau * 1.6 + a2) * .5), Q, S); L.m.setMatrixAt(n++, M4) }
      L.m.count = n; L.m.instanceMatrix.needsUpdate = true; n = 0;
      for (let i = 0; i < L.NT; i++) { const [x, z, ph, a, sc] = L.dt[i]; if (L.d[i][7] > ST.lluvia) continue; const T = Math.sqrt(2 * (ytop - ybot) / 9.8) + .8, tau = (t + ph * T) % T, y = ytop - 4.9 * tau * tau; if (y < ybot) continue;
        E.set(a + tau * 4, a, tau * 3); Q.setFromEuler(E); S.setScalar(sc); M4.compose(new THREE.Vector3(x, y, z), Q, S); L.mt.setMatrixAt(n++, M4) }
      L.mt.count = n; L.mt.instanceMatrix.needsUpdate = true; const B = L.mb.material.uniforms; B.uA.value = ST.lluvia; B.uY0.value = ytop; B.uY1.value = ybot } }
    if (typeof tapaArriba === "function") tapaArriba(t, ST);
  }
  return { G, PAN, PAN_ARR, ST, U, mergeGeo, sagify, depthDe, sagMain, enPanel, panB, fbm, rd, hsh, sst, coords, grilla, fueraPanel, juntar, lienzo, gris, envuelto, NUB, CORTE, M_LID, LID, LID_P, RIM, POLVO, MOTAS, SPOT, HAZ_AG, HAZ_HU, LLUVIA, PLACAS, placaEn, HAZ, SOL_REAL, AG_R, PC, TAN_R, PSCALE, M_ORO, ESPIGA_G,
    TAPA_Y, ARRIBA_Y, AGUJERO_W, KELL_BORDE, tapaCaeY, tapaReset, tapa, tapaHundir, tapaGotea, tapaAgujero, tapaCae, lluviaTrigo, tanerCae };
})();
// ---------------- API de la TAPA ----------------
const { TAPA_Y, AGUJERO_W, KELL_BORDE, tapaCaeY, tapaReset, tapa, tapaHundir, tapaGotea, tapaAgujero, tapaCae, lluviaTrigo, tanerCae } = TAPA;
// (stubs del video viejo: la bestia ya no existe)
function sinBestia() { }
