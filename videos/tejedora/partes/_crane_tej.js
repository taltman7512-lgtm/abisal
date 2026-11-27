// ================= MISTER SALLOW «REALISTA» (sallowR) — «Nobody Hears The Bell» =================
// Pedido del dueño: el villano es una figura DETALLADA (no de bloques) al lado de los personajes de bloques: ese contraste es
// el de los monstruos de Volze. Diseño propio: ≈ 4,8 m (los de bloques ≈ 2,2), demacrado, torso estrecho, extremidades larguísimas
// con articulaciones marcadas, dedos de ≈ 40 cm con nudillos, encorvado, cuello largo. Cabeza alargada, calva, SIN OREJAS (piel
// lisa), piel de CERA marfil-verdosa con venas grises, brillo húmedo y gotas de cera solidificadas que chorrean del cráneo, el mentón
// y el cuello; ojos chiquitos negros mate hundidos; una sonrisa fija, finísima y demasiado ancha. Levita larga raída (pliegues de
// verdad, ruedo deshilachado, jirones), delantal de cuero manchado de cera, guantes rotos que dejan ver los dedos de cera.
// Todo procedural: lofts (anillos elípticos) con pliegues, esferas deformadas, tubos sobre curvas; texturas pintadas en canvas.
// API (todas se llaman por cuadro, en este orden: poner → quieto|andar → modificadores → headW/ojoW para la cámara):
//   sallowR.poner(x, y, z, ry)        lo muestra en ese punto (y = piso) y lo deja en la pose de reposo (borra lo del cuadro anterior)
//   sallowR.ocultar()                 lo esconde (llamarlo en el reset de cada cuadro)
//   sallowR.quieto(t)                 casi no respira; los dedos se mueven solos, lento, cada uno por su cuenta
//   sallowR.andar(t, vel = .7)        pasos larguísimos y lentos, brazos colgando sin balancear, la cabeza quieta.
//                                     El que llama avanza la raíz a `vel` m/s (ciclo de dos pasos = sallowR.PASO m) para que los pies no patinen
//   sallowR.ladear(u)                 la cabeza se inclina de costado DEMASIADO (u = 1 → 60°; negativo para el otro lado)
//   sallowR.inclinarse(u, p)          se agacha sobre alguien (p = [x, y, z] del mundo, p. ej. la cabeza del otro): baja la cara hasta él
//                                     y estira una mano abierta por encima; u 0..1
//   sallowR.frasco(visible)           sostiene un frasco con brillo pálido entre dos dedos, delante del pecho
//   sallowR.martillo(visible)         martillo enorme (largo como un hombre de bloques) apoyado en el piso, en la mano derecha
//   sallowR.golpe(t, u)               martillazo con las dos manos: 0 reposo → .35 arriba atrás → .62 impacto adelante → 1 rebote
//   sallowR.caer(u)                   paso atrás y cae de espaldas, rígido como una tabla (u 0..1)
//   sallowR.aura(on, k = 1)           niebla baja que se arrastra a sus pies, moscas y polvo flotando, luz fría tenue desde abajo;
//                                     llama a velasHacia(p, u) si existe. Llamarla DESPUÉS de la animación del cuadro (usa su t)
//   sallowR.headW() / ojoW(lado = 1)  Vector3 del centro de la cabeza / del ojo (para la cámara)
//   sallowR.ojoCam(d = .08)           [x, y, z] delante del ojo a d m, en la dirección en que mira (plano extremo del ojo)
//   sallowR.caraCam(d, ang, dy)       [x, y, z] delante de la cara a d m (ang gira alrededor, dy sube)
//   sallowR.climas()                  agrega los climas "sallow" y "noche" a ENV si nadie los definió (llamar antes de setEnv)
//   sallowR.g                         el grupo raíz (mira a +z local, como el elenco)
const sallowR = (() => {
  const T3 = THREE, PI = Math.PI, TAU = PI * 2;
  const S_ = (a, b, v) => { const q = Math.max(0, Math.min(1, (v - a) / (b - a))); return q * q * (3 - 2 * q) };
  const cl01 = v => Math.max(0, Math.min(1, v)), lerp = (a, b, k) => a + (b - a) * k, eIO = k => k * k * (3 - 2 * k);
  const ex2 = (a) => Math.exp(-a);
  const rnd = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 };
  const hsh = (i, j, k) => { let n = (Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(k, 1274126177)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296 };
  const nz3 = (x, y, z) => { const i = Math.floor(x), j = Math.floor(y), k = Math.floor(z), fx = x - i, fy = y - j, fz = z - k, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), w = fz * fz * (3 - 2 * fz);
    return lerp(lerp(lerp(hsh(i, j, k), hsh(i + 1, j, k), u), lerp(hsh(i, j + 1, k), hsh(i + 1, j + 1, k), u), v), lerp(lerp(hsh(i, j, k + 1), hsh(i + 1, j, k + 1), u), lerp(hsh(i, j + 1, k + 1), hsh(i + 1, j + 1, k + 1), u), v), w) };
  const fbm = (x, y, z) => nz3(x, y, z) * .5 + nz3(x * 2.03 + 7, y * 2.03, z * 2.03) * .3 + nz3(x * 4.1, y * 4.1 + 3, z * 4.1) * .2;
  const v1 = new T3.Vector3(), v2 = new T3.Vector3(), v3 = new T3.Vector3(), v4 = new T3.Vector3(), q1 = new T3.Quaternion(), q2 = new T3.Quaternion(), ABAJO = new T3.Vector3(0, -1, 0);

  // ---------- geometría: loft de anillos (u alrededor, v a lo largo; y baja con v → caras hacia afuera), costura sin marca
  function costura(g) { g.computeVertexNormals(); const p = g.attributes.position, n = g.attributes.normal, M = new Map();
    for (let i = 0; i < p.count; i++) { const k = Math.round(p.getX(i) * 2e4) + "," + Math.round(p.getY(i) * 2e4) + "," + Math.round(p.getZ(i) * 2e4); let L = M.get(k); if (!L) M.set(k, L = []); L.push(i) }
    M.forEach(L => { if (L.length < 2) return; let x = 0, y = 0, z = 0; L.forEach(i => { x += n.getX(i); y += n.getY(i); z += n.getZ(i) }); const l = Math.hypot(x, y, z) || 1; L.forEach(i => n.setXYZ(i, x / l, y / l, z / l)) }); return g }
  function loft(nU, nV, fn, o = {}) { const P = [], UV = [], I = [];
    for (let j = 0; j <= nV; j++) for (let i = 0; i <= nU; i++) { const u = i / nU, v = j / nV, q = fn(u, v); P.push(q[0], q[1], q[2]); UV.push(u * (o.ru || 1), (1 - v) * (o.rv || 1)) }
    for (let j = 0; j < nV; j++) for (let i = 0; i < nU; i++) { const a = j * (nU + 1) + i, b = a + 1, c = a + nU + 1, d = c + 1; I.push(a, c, b, b, c, d) }
    const g = new T3.BufferGeometry(); g.setAttribute("position", new T3.Float32BufferAttribute(P, 3)); g.setAttribute("uv", new T3.Float32BufferAttribute(UV, 2)); g.setIndex(I); return costura(g) }
  // tubo vertical (de y0 hacia abajo, largo len): fn(v, th) → [rx, rz, dz, dx, dy]
  const tubo = (y0, len, nU, nV, fn, o) => loft(nU, nV, (u, v) => { const th = u * TAU, r = fn(v, th); return [Math.sin(th) * r[0] + (r[3] || 0), y0 - v * len + (r[4] || 0), Math.cos(th) * r[1] + (r[2] || 0)] }, o);
  // tubo sobre una curva con radio variable rad(v)
  function tuboCurva(pts, nU, nV, rad) { const cv = new T3.CatmullRomCurve3(pts), F = cv.computeFrenetFrames(nV, false);
    return loft(nU, nV, (u, v) => { const j = Math.round(v * nV), p = cv.getPointAt(v), th = u * TAU, r = rad(v), N = F.normals[j], B = F.binormals[j], c = Math.cos(th), s = Math.sin(th);
      return [p.x + r * (c * N.x + s * B.x), p.y + r * (c * N.y + s * B.y), p.z + r * (c * N.z + s * B.z)] }) }
  function fusionar(L) { const P = [], N = [], UV = [], I = []; let o = 0;
    L.forEach(g => { const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv; for (let i = 0; i < p.count; i++) { P.push(p.getX(i), p.getY(i), p.getZ(i)); N.push(n.getX(i), n.getY(i), n.getZ(i)); UV.push(uv ? uv.getX(i) : 0, uv ? uv.getY(i) : 0) }
      const ix = g.index.array; for (let i = 0; i < ix.length; i++) I.push(ix[i] + o); o += p.count });
    const g = new T3.BufferGeometry(); g.setAttribute("position", new T3.Float32BufferAttribute(P, 3)); g.setAttribute("normal", new T3.Float32BufferAttribute(N, 3)); g.setAttribute("uv", new T3.Float32BufferAttribute(UV, 2)); g.setIndex(I); return g }

  // ---------- texturas pintadas en canvas
  const T_VENAS = tex(1024, 512, (c, w, h) => { const r = rnd(71); c.fillStyle = "#ffffff"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 300; i++) { const x = r() * w, y = r() * h, rr = 8 + r() * 70, k = r(), gr = c.createRadialGradient(x, y, 0, x, y, rr);
      gr.addColorStop(0, k < .45 ? "rgba(160,176,138,.26)" : k < .8 ? "rgba(255,252,232,.3)" : "rgba(150,128,140,.2)"); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(x - rr, y - rr, 2 * rr, 2 * rr) }
    const vena = (x, y, a, len, wd, d) => { c.strokeStyle = `rgba(${88 + r() * 24 | 0},${100 + r() * 20 | 0},${124 + r() * 24 | 0},${.22 + .14 * wd})`; c.lineWidth = wd; c.lineCap = "round"; c.beginPath(); c.moveTo(x, y);
      for (let i = 0; i < len; i++) { a += (r() - .5) * .55; x += Math.cos(a) * 4; y += Math.sin(a) * 4; c.lineTo(x, y); if (d < 3 && r() < .05) { c.stroke(); vena(x, y, a + (r() < .5 ? -1 : 1) * (.5 + r() * .7), len * .55 | 0, wd * .62, d + 1); c.beginPath(); c.moveTo(x, y) } } c.stroke() };
    for (let i = 0; i < 60; i++) vena(r() * w, r() * h, r() * 6.28, 30 + r() * 70 | 0, 1 + r() * 2.2, 0);
    for (let i = 0; i < 4000; i++) { c.fillStyle = r() < .5 ? "rgba(120,120,90,.07)" : "rgba(255,255,240,.08)"; c.fillRect(r() * w, r() * h, 1.5, 1.5) } });
  const T_VENAS_R = tex(512, 512, (c, w, h) => { c.drawImage(T_VENAS.image, 0, 0, w, h) }, [2, 3]);
  const T_POROS = tex(512, 512, (c, w, h) => { const r = rnd(5); c.fillStyle = "#808080"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) { c.fillStyle = r() < .55 ? "rgba(40,40,40,.25)" : "rgba(220,220,220,.18)"; c.beginPath(); c.arc(r() * w, r() * h, .6 + r() * 1.4, 0, 7); c.fill() }
    for (let i = 0; i < 40; i++) { c.strokeStyle = "rgba(200,200,200,.12)"; c.lineWidth = 2 + r() * 4; c.beginPath(); let x = r() * w, y = r() * h; c.moveTo(x, y); for (let k = 0; k < 20; k++) { x += (r() - .5) * 10; y += 6 + r() * 8; c.lineTo(x, y) } c.stroke() } }, [3, 3]);
  const T_LEVITA = tex(512, 512, (c, w, h) => { const r = rnd(9); c.fillStyle = "#1e1d21"; c.fillRect(0, 0, w, h);
    for (let i = -h; i < w; i += 3) { c.strokeStyle = (i / 3) % 2 ? "rgba(255,255,255,.028)" : "rgba(0,0,0,.12)"; c.lineWidth = 1.3; c.beginPath(); c.moveTo(i, 0); c.lineTo(i + h, h); c.stroke() }
    for (let i = 0; i < 70; i++) { const x = r() * w, y = r() * h, rr = 20 + r() * 90, gr = c.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, r() < .6 ? "rgba(74,70,54,.2)" : "rgba(0,0,0,.25)"); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(x - rr, y - rr, 2 * rr, 2 * rr) }
    for (let i = 0; i < 9; i++) { const x = r() * w, y = r() * h, pw = 26 + r() * 40, ph = 20 + r() * 40; c.fillStyle = r() < .5 ? "#27252a" : "#2a2722"; c.fillRect(x, y, pw, ph); c.strokeStyle = "rgba(120,110,90,.5)"; c.lineWidth = 1.5;
      for (let k = 0; k < (pw + ph) / 5; k++) { const t = k / ((pw + ph) / 5) * 4, side = Math.floor(t), f = t - side, px = side === 0 ? x + f * pw : side === 1 ? x + pw : side === 2 ? x + pw - f * pw : x, py = side === 0 ? y : side === 1 ? y + f * ph : side === 2 ? y + ph : y + ph - f * ph; c.beginPath(); c.moveTo(px - 2, py - 2); c.lineTo(px + 2, py + 2); c.stroke() } }
    for (let i = 0; i < 260; i++) { c.strokeStyle = "rgba(130,124,104,.08)"; c.lineWidth = 1; const x = r() * w, y = r() * h; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - .5) * 30, y + (r() - .5) * 8); c.stroke() }
    for (let i = 0; i < 26; i++) { const x = r() * w, y = r() * h; c.fillStyle = "rgba(214,206,170,.55)"; c.beginPath(); c.ellipse(x, y, 2 + r() * 5, 3 + r() * 6, 0, 0, 7); c.fill(); c.fillRect(x - 1, y, 2.5, 8 + r() * 26) } }, [3, 3]);
  const T_LEVITA_B = tex(512, 512, (c, w, h) => { const r = rnd(10); c.fillStyle = "#808080"; c.fillRect(0, 0, w, h);
    for (let i = -h; i < w; i += 3) { c.strokeStyle = (i / 3) % 2 ? "rgba(255,255,255,.18)" : "rgba(0,0,0,.25)"; c.lineWidth = 1.2; c.beginPath(); c.moveTo(i, 0); c.lineTo(i + h, h); c.stroke() }
    for (let i = 0; i < 60; i++) { c.strokeStyle = "rgba(0,0,0,.3)"; c.lineWidth = 1 + r() * 2; c.beginPath(); let x = r() * w, y = r() * h; c.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (r() - .5) * 30; y += (r() - .3) * 14; c.lineTo(x, y) } c.stroke() } }, [3, 3]);
  const T_CUERO = tex(512, 1024, (c, w, h) => { const r = rnd(12); c.fillStyle = "#3d2b1e"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 16000; i++) { c.fillStyle = r() < .6 ? "rgba(20,12,6,.18)" : "rgba(110,80,56,.12)"; c.fillRect(r() * w, r() * h, 2, 2) }
    for (let i = 0; i < 40; i++) { const x = r() * w, y = r() * h, rr = 30 + r() * 120, gr = c.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, r() < .5 ? "rgba(96,70,46,.35)" : "rgba(14,8,4,.4)"); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(x - rr, y - rr, 2 * rr, 2 * rr) }
    for (let i = 0; i < 55; i++) { const x = r() * w, y = r() * h * .9, rr = 4 + r() * 22; c.fillStyle = `rgba(${214 + r() * 20 | 0},${204 + r() * 20 | 0},${170 + r() * 20 | 0},${.55 + r() * .4})`; c.beginPath(); c.ellipse(x, y, rr, rr * (.6 + r() * .5), r() * 3, 0, 7); c.fill();
      let yy = y, xx = x, wd = rr * .5; while (wd > 1 && r() < .97) { yy += 3; xx += (r() - .5) * 1.5; wd *= .985; c.fillRect(xx - wd / 2, yy, wd, 3.2) } c.beginPath(); c.arc(xx, yy + 2, wd * 1.4 + 1, 0, 7); c.fill() }
    for (let i = 0; i < 14; i++) { c.fillStyle = "rgba(10,6,3,.6)"; c.beginPath(); c.ellipse(r() * w, r() * h, 3 + r() * 12, 3 + r() * 10, 0, 0, 7); c.fill() }
    for (let i = 0; i < 120; i++) { c.strokeStyle = "rgba(140,110,80,.2)"; c.lineWidth = 1; const x = r() * w, y = r() * h; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - .5) * 40, y + (r() - .5) * 20); c.stroke() } });
  const T_CUERO_R = tex(512, 1024, (c, w, h) => { const d = c.createImageData(w, h), s = T_CUERO.image.getContext("2d").getImageData(0, 0, w, h).data;
    for (let i = 0; i < w * h; i++) { const l = (s[i * 4] + s[i * 4 + 1] + s[i * 4 + 2]) / 3, v = l > 150 ? 70 : 205; d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255 } c.putImageData(d, 0, 0) });
  const T_GUANTE = tex(256, 256, (c, w, h) => { const r = rnd(14); c.fillStyle = "#1f1a17"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 3000; i++) { c.fillStyle = r() < .5 ? "rgba(0,0,0,.25)" : "rgba(90,74,60,.15)"; c.fillRect(r() * w, r() * h, 2, 1) }
    for (let i = 0; i < 30; i++) { c.strokeStyle = "rgba(110,92,74,.3)"; c.lineWidth = 1; const y = r() * h; c.beginPath(); c.moveTo(0, y); c.bezierCurveTo(w * .3, y + 6, w * .6, y - 6, w, y + 2); c.stroke() }
    for (let i = 0; i < 7; i++) { const x = r() * w, y = r() * h, rr = 5 + r() * 10; c.fillStyle = "#d9d2b4"; c.beginPath(); c.ellipse(x, y, rr, rr * .7, r() * 3, 0, 7); c.fill(); c.strokeStyle = "#0c0907"; c.lineWidth = 2.5; c.stroke() } }, [1, 2]);
  const T_PANT = tex(256, 256, (c, w, h) => { const r = rnd(15); c.fillStyle = "#1f1e22"; c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 2) { c.fillStyle = y % 4 ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.12)"; c.fillRect(0, y, w, 1) }
    for (let i = 0; i < 30; i++) { const x = r() * w, y = r() * h, rr = 10 + r() * 40, gr = c.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, "rgba(70,66,56,.18)"); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(x - rr, y - rr, 2 * rr, 2 * rr) } }, [2, 6]);
  const T_BOTA = tex(256, 256, (c, w, h) => { const r = rnd(16); c.fillStyle = "#17120e"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 80; i++) { c.strokeStyle = `rgba(${70 + r() * 30 | 0},${58 + r() * 20 | 0},48,.35)`; c.lineWidth = 1 + r() * 2; const x = r() * w, y = r() * h; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - .5) * 30, y + (r() - .5) * 12); c.stroke() }
    for (let i = 0; i < 20; i++) { const x = r() * w, y = r() * h, rr = 8 + r() * 26, gr = c.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, "rgba(90,78,64,.3)"); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(x - rr, y - rr, 2 * rr, 2 * rr) } }, [2, 2]);
  const T_MADERA = tex(128, 512, (c, w, h) => { const r = rnd(17); c.fillStyle = "#3b2a1c"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) { c.strokeStyle = r() < .5 ? "rgba(20,12,6,.35)" : "rgba(110,80,50,.25)"; c.lineWidth = 1 + r() * 2; const x = r() * w; c.beginPath(); c.moveTo(x, 0); for (let y = 0; y < h; y += 16) c.lineTo(x + Math.sin(y * .03 + i) * 3, y); c.stroke() }
    const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(10,6,3,.55)"); gr.addColorStop(.25, "rgba(10,6,3,0)"); c.fillStyle = gr; c.fillRect(0, 0, w, h) });
  const T_HIERRO = tex(256, 256, (c, w, h) => { const r = rnd(18); c.fillStyle = "#2a2725"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 50; i++) { const x = r() * w, y = r() * h, rr = 6 + r() * 30, gr = c.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, r() < .6 ? "rgba(104,60,30,.55)" : "rgba(10,8,8,.5)"); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(x - rr, y - rr, 2 * rr, 2 * rr) }
    for (let i = 0; i < 1500; i++) { c.fillStyle = r() < .5 ? "rgba(0,0,0,.35)" : "rgba(150,120,90,.15)"; c.fillRect(r() * w, r() * h, 2, 2) }
    for (let i = 0; i < 10; i++) { c.fillStyle = "rgba(220,212,180,.7)"; const x = r() * w, y = r() * h; c.beginPath(); c.ellipse(x, y, 3 + r() * 8, 2 + r() * 5, 0, 0, 7); c.fill(); c.fillRect(x - 1.5, y, 3, 6 + r() * 20) } });
  const T_NIEBLA = tex(256, 256, (c, w, h) => { const r = rnd(19); c.clearRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) { const x = w / 2 + (r() - .5) * w * .6, y = h / 2 + (r() - .5) * h * .4, rr = 20 + r() * 60, gr = c.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, "rgba(255,255,255,.16)"); gr.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = gr; c.fillRect(0, 0, w, h) } });
  const T_PUNTO = tex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(.4, "rgba(255,255,255,.5)"); gr.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = gr; c.fillRect(0, 0, w, h) });

  // ---------- materiales
  // piel de cera: clearcoat húmedo + brillo de borde (falso subsurface: la luz «se mete» por los bordes, tono verdoso)
  const conBorde = (m, col, k) => { m.onBeforeCompile = sh => { sh.uniforms.srRim = { value: new T3.Color(col).multiplyScalar(k) };
    sh.fragmentShader = "uniform vec3 srRim;\n" + sh.fragmentShader.replace("#include <opaque_fragment>", "outgoingLight += srRim * pow(1.0 - saturate(abs(dot(normal, normalize(vViewPosition)))), 2.2) * (0.18 + 2.2 * totalDiffuse);\n#include <opaque_fragment>") };
    m.customProgramCacheKey = () => "srRim" + col + k; return m };
  const pielM = (o = {}) => conBorde(new T3.MeshPhysicalMaterial({ color: "#e2ddc4", map: T_VENAS_R, roughness: .4, bumpMap: T_POROS, bumpScale: .9, clearcoat: .75, clearcoatRoughness: .3,
    sheen: .7, sheenColor: new T3.Color("#e2ecbc"), sheenRoughness: .45, emissive: "#1d1f14", emissiveIntensity: .35, ...o }), "#d4d8bc", .4);
  const M_PIEL = pielM(), M_CERA = pielM({ color: "#e8e2c2", roughness: .3, clearcoat: 1, clearcoatRoughness: .18, side: T3.DoubleSide });
  const M_CARA = conBorde(new T3.MeshPhysicalMaterial({ color: "#ffffff", vertexColors: true, map: T_VENAS, roughness: .38, bumpMap: T_POROS, bumpScale: .7, clearcoat: .8, clearcoatRoughness: .28,
    sheen: .6, sheenColor: new T3.Color("#ecebd4"), sheenRoughness: .4, emissive: "#1c1b14", emissiveIntensity: .3 }), "#d4d8bc", .45);
  const M_OJO = new T3.MeshStandardMaterial({ color: "#030303", roughness: 1, metalness: 0 });
  const M_BOCA = new T3.MeshStandardMaterial({ color: "#120807", roughness: .7 });
  const M_UNA = new T3.MeshPhysicalMaterial({ color: "#a89a6c", roughness: .35, clearcoat: .6 });
  const M_LEVITA = new T3.MeshPhysicalMaterial({ color: "#ffffff", map: T_LEVITA, bumpMap: T_LEVITA_B, bumpScale: 1.6, roughness: .93, sheen: .8, sheenColor: new T3.Color("#4a4a58"), sheenRoughness: .6, side: T3.DoubleSide });
  const M_CHALECO = new T3.MeshStandardMaterial({ color: "#2b2924", map: T_PANT, roughness: .9 });
  const M_PANT = new T3.MeshPhysicalMaterial({ color: "#ffffff", map: T_PANT, bumpMap: T_LEVITA_B, bumpScale: 1, roughness: .9, sheen: .5, sheenColor: new T3.Color("#3a3a44") });
  const M_CUERO = new T3.MeshStandardMaterial({ color: "#ffffff", map: T_CUERO, roughnessMap: T_CUERO_R, roughness: 1, bumpMap: T_CUERO, bumpScale: 1.2, side: T3.DoubleSide });
  const M_GUANTE = new T3.MeshStandardMaterial({ color: "#ffffff", map: T_GUANTE, roughness: .62, bumpMap: T_GUANTE, bumpScale: 1, side: T3.DoubleSide });
  const M_BOTA = new T3.MeshStandardMaterial({ color: "#ffffff", map: T_BOTA, roughness: .55, bumpMap: T_BOTA, bumpScale: 1.5 });
  const M_MADERA = new T3.MeshStandardMaterial({ color: "#ffffff", map: T_MADERA, roughness: .8, bumpMap: T_MADERA, bumpScale: 1 });
  const M_HIERRO = new T3.MeshStandardMaterial({ color: "#ffffff", map: T_HIERRO, roughness: .62, metalness: .65, bumpMap: T_HIERRO, bumpScale: 2 });

  // ---------- medidas (metros). Los de bloques miden ≈ 2,2
  const LT = 1.2, LS = 1.1, LA = .08, HIP = LT + LS + LA;   // muslo, canilla, tobillo → cadera a 2,38
  const PASO = 4 * (LT + LS) * Math.sin(.3);                 // metros por ciclo de dos pasos (≈ 2,7)
  const UA = .95, FA = .92;                                  // brazo y antebrazo (manos a la altura de las rodillas)
  const pieza = (geo, mat, par, x = 0, y = 0, z = 0, sombra = true) => { const m = new T3.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = sombra; m.receiveShadow = true; par.add(m); return m };
  const grupo = (par, x = 0, y = 0, z = 0) => { const g = new T3.Group(); g.position.set(x, y, z); par.add(g); return g };

  const g = new T3.Group(); g.name = "sallowR"; g.visible = false; scene.add(g);
  const cuerpo = grupo(g), caderas = grupo(cuerpo, 0, HIP, 0), pelvis = grupo(caderas), faldaG = grupo(caderas);
  const J = { muslo: [], rodilla: [], tobillo: [], hombro: [], codo: [], muneca: [], dedos: [[], []], pulgar: [], ojos: [] };

  // ---------- piernas: pantalón raído con arrugas en rodilla y tobillo, rodilla huesuda, bota gastada de punta larga
  const gMuslo = tubo(.08, LT + .08, 28, 44, (v, th) => { const y = v * (LT + .08), r = .09 - .024 * v + .013 * ex2(((v - .97) / .05) ** 2), w = .004 * Math.sin(th * 7 + y * 30) * S_(.75, 1, v) + .003 * Math.sin(th * 5 + y * 11); return [r + w, (r + w) * 1.08, .004 * Math.sin(y * 3)] });
  const gCanilla = tubo(.02, LS - .32, 26, 40, (v, th) => { const r = .066 - .016 * v + .014 * ex2((v / .06) ** 2) * Math.max(0, Math.cos(th)) ** 2, w = .003 * Math.sin(th * 6 + v * 25); return [r + w, (r + w) * 1.05, 0] });
  const gCana = tubo(-LS + .44, .46, 28, 30, (v, th) => { const r = .066 + .006 * v + .006 * ex2((v / .05) ** 2) + .0035 * Math.sin(v * 38 + Math.sin(th * 3) * 2) * S_(.2, .6, v), w = .002 * Math.sin(th * 9); return [r + w, (r + w) * 1.1, .006 * v] });
  const gPie = loft(28, 40, (u, v) => { const th = u * TAU, z = -.1 + v * .55, e = Math.pow(Math.sin(PI * Math.min(1, .04 + v * .96)), .3), w = (.058 + .012 * Math.sin(PI * v * .8) - .03 * S_(.6, 1, v)) * e, hh = (.14 - .09 * S_(0, .55, v)) * e,
    c = Math.cos(th), sy = c < 0 ? c * .35 : c, base = -LA + .035 + .03 * S_(.85, 1, v); return [Math.sin(th) * w, base + hh * .5 * sy + .01 * S_(.3, 0, v) * (c > 0 ? c : 0), z] });
  for (const s of [0, 1]) { const sg = s ? -1 : 1, M = grupo(caderas, sg * .135, 0, 0), R = grupo(M, 0, -LT, 0), T = grupo(R, 0, -LS, 0);
    pieza(gMuslo, M_PANT, M); pieza(gCanilla, M_PANT, R); pieza(gCana, M_BOTA, R); pieza(gPie, M_BOTA, T);
    J.muslo.push(M); J.rodilla.push(R); J.tobillo.push(T) }

  // ---------- torso: cintura de avispa, costillar estrecho, joroba; chaleco gastado debajo de la levita
  const torsoR = y => { const rx = y < .72 ? lerp(.15, .125, S_(0, .4, y)) + .04 * S_(.4, .72, y) : 0, rz = y < .72 ? lerp(.11, .09, S_(0, .4, y)) + .03 * S_(.4, .72, y) : 0; return [rx, rz] };
  const col1 = grupo(pelvis, 0, .02, 0), col2 = grupo(col1, 0, .72, 0);
  pieza(tubo(.8, .95, 30, 30, (v, th) => { const y = .8 - v * .95, [rx, rz] = torsoR(Math.max(0, y)); return [rx + .012, rz + .012, 0] }), M_CHALECO, col1);
  const pechoR = y => { const rx = .17 + .035 * S_(0, .3, y) - .0 * y, top = S_(.5, .7, y); return [lerp(rx, .07, top), lerp(.13 + .02 * S_(.1, .4, y), .06, top)] };
  pieza(tubo(.7, .78, 32, 34, (v, th) => { const y = .7 - v * .78, [rx, rz] = pechoR(y), joroba = Math.cos(th) < 0 ? -.04 * ex2(((y - .42) / .18) ** 2) * Math.cos(th) ** 2 : 0; return [rx, rz, -joroba * 0 + (Math.cos(th) < 0 ? -.03 * ex2(((y - .42) / .18) ** 2) : 0)] }), M_CHALECO, col2);
  // levita (arriba): abierta adelante, solapas que se doblan, hombros caídos y huesudos, joroba, arrugas
  pieza(tubo(.72, .98, 72, 44, (v, th) => { const y = .72 - v * .98, [rx, rz] = pechoR(Math.max(-.2, y)), hom = .1 * ex2(((y - .53) / .09) ** 2), c = Math.cos(th), sn = Math.sin(th);
    const gap = .34 - .08 * v, dg = Math.min(Math.abs(th - gap), Math.abs(th - (TAU - gap))), sol = .03 * ex2((dg / .25) ** 2) * S_(.62, .3, y) * S_(-.1, .15, y), arr = .005 * Math.sin(th * 11 + y * 18) + .004 * Math.sin(y * 40 + th * 3) * (c < 0 ? 1 : .3);
    const fuera = (th < gap || th > TAU - gap) ? -1 : 0;   // dentro del hueco del frente la levita «se dobla» hacia adentro (solapa)
    return [rx + .028 + hom * sn * sn + arr + sol + fuera * .02, rz + .03 + arr + sol * .6 + (c < 0 ? .035 * ex2(((y - .42) / .2) ** 2) : 0) + fuera * .03, 0] }), M_LEVITA, col2);
  // cuello alto de la levita, de pie detrás de la nuca, con el borde comido
  pieza(loft(40, 14, (u, v) => { const th = .9 + u * (TAU - 1.8), y = .58 + v * .3, r = .1 + .045 * v, fr = v > .85 ? -.012 * hsh(Math.floor(u * 40), 3, 1) : 0; return [Math.sin(th) * r, (1.16 - v) * 0 + y + fr, Math.cos(th) * r * 1.05 - .025 - .05 * v] }), M_LEVITA, col2);
  // levita (cintura) en col1, encima del chaleco
  pieza(tubo(.86, 1.0, 64, 30, (v, th) => { const y = .86 - v * 1.0, [rx, rz] = torsoR(Math.max(0, Math.min(.72, y))), gap = .4, dg = Math.min(Math.abs(th - gap), Math.abs(th - (TAU - gap))), sol = .015 * ex2((dg / .2) ** 2), arr = .004 * Math.sin(th * 9 + y * 22);
    const k = y > .72 ? pechoR(y - .72) : [rx, rz]; return [k[0] + .03 + sol + arr, k[1] + .035 + sol + arr, 0] }), M_LEVITA, col1);
  // delantal de cuero: peto sobre el pecho (col2) y pollera hasta las rodillas (faldaG), con tiras al cuello
  pieza(loft(20, 20, (u, v) => { const th = (u - .5) * .9, y = .52 - v * .62, R = pechoR(y)[1] + .045, w = .9 + .1 * v; return [Math.sin(th * w) * (pechoR(y)[0] + .02), y, Math.cos(th * w) * R] }), M_CUERO, col2);
  pieza(tuboCurva([new T3.Vector3(-.12, .5, .12), new T3.Vector3(-.09, .7, .03), new T3.Vector3(0, .74, -.08), new T3.Vector3(.09, .7, .03), new T3.Vector3(.12, .5, .12)], 6, 30, () => .008), M_CUERO, col2);

  // ---------- la falda de la levita (cuelga de la cadera hasta debajo de la rodilla): pliegues hondos que crecen hacia abajo, abierta
  // adelante, tajo atrás, ruedo deshilachado y jirones. Se deforma por cuadro con las piernas (ver faldaDeforma)
  const FALDA_L = 1.72;
  const gFalda = (() => { const r = rnd(33), FR = Array.from({ length: 121 }, () => .02 + .16 * r() ** 2.2);
    const body = loft(120, 56, (u, v) => { const gap = .22 + .5 * v, th = gap + u * (TAU - 2 * gap), y = .3 - v * (FALDA_L + .3), c = Math.cos(th), sn = Math.sin(th);
      const R0x = lerp(.2, .38, S_(.1, 1, v)), R0z = lerp(.15, .33, S_(.1, 1, v)), A = .004 + .034 * S_(.05, 1, v),
        plie = A * (Math.sin(th * 7 + 1.3 + v * .8) * .7 + Math.sin(th * 13 + .4) * .3) + (c < -.92 ? -.02 * v : 0), fr = S_(.93, 1, v) * FR[Math.round(u * 120)];
      return [sn * (R0x + plie), y - fr, c * (R0z + plie) - .02] }, { ru: 3, rv: 3 });
    // jirones que cuelgan del ruedo
    const tiras = []; for (let i = 0; i < 26; i++) { const gap = .72, th = gap + r() * (TAU - 2 * gap), L = .08 + r() * .22, wd = .015 + r() * .035, x0 = Math.sin(th) * .4, z0 = Math.cos(th) * .35 - .02, y0 = .3 - (FALDA_L + .3) - .02;
      tiras.push(loft(2, 8, (u, v) => { const tw = (u - .5) * wd, tx = Math.cos(th), tz = -Math.sin(th); return [x0 + tx * tw + Math.sin(th) * .01 * v, y0 - v * L, z0 + tz * tw + Math.cos(th) * .01 * v + .01 * Math.sin(v * 5 + i)] })) }
    return fusionar([body, ...tiras]) })();
  const FALDA = pieza(gFalda, M_LEVITA, faldaG); const FALDA_B = Float32Array.from(gFalda.attributes.position.array);
  const gDelantal = loft(24, 40, (u, v) => { const th = (u - .5) * (.95 + .25 * v), y = .3 - v * 1.45, R = .2 + .05 * v; return [Math.sin(th) * R * 1.15, y - (v > .96 ? .02 * hsh(Math.round(u * 24), 7, 7) : 0), Math.cos(th) * R + .01 + .005 * Math.sin(u * 20)] });
  const DELANTAL = pieza(gDelantal, M_CUERO, faldaG); const DELANTAL_B = Float32Array.from(gDelantal.attributes.position.array);
  pieza(tuboCurva([new T3.Vector3(-.22, .28, .1), new T3.Vector3(0, .3, -.19), new T3.Vector3(.22, .28, .1)], 6, 20, () => .01), M_CUERO, faldaG);

  // ---------- brazos (mangas con arrugas en el codo y puño deshilachado), muñeca de cera huesuda, mano enguantada rota
  const gManga = tubo(.08, UA + .1, 26, 40, (v, th) => { const y = v * (UA + .1) - .08, cap = Math.sqrt(cl01((y + .08) / .1)), r = (.066 - .01 * v) * (.35 + .65 * cap), w = .005 * Math.sin(th * 3 + y * 26) * ex2(((y - UA) / .16) ** 2) + .003 * Math.sin(th * 5 + y * 9);
    return [r + w, (r + w) * 1.05, 0] });
  const gAnte = (() => { const r = rnd(44), FR = Array.from({ length: 27 }, () => .01 + .06 * r() ** 2); return tubo(.03, FA - .03, 26, 40, (v, th) => { const r0 = .056 - .008 * v + .012 * S_(.85, 1, v), w = .004 * Math.sin(th * 4 + v * 30) * ex2((v / .2) ** 2) + .003 * Math.sin(th * 7 + v * 12);
    return [r0 + w, (r0 + w) * 1.05, 0, 0, -S_(.94, 1, v) * FR[Math.round(th / TAU * 26)]] }) })();
  const gMunecaPiel = tubo(.16, .22, 16, 16, (v, th) => { const r = .025 + .004 * Math.cos(th * 2) + .006 * ex2(((v - .7) / .1) ** 2); return [r, r * .8, 0] });
  // dedo: segmento con nudillo al principio y yema al final
  const gSeg = (L, r0, r1, yema) => tubo(.012, L + .012, 14, 18, (v, th) => { const y = v * (L + .012), r = lerp(r0, r1, v) + .0045 * ex2(((y - .012) / .016) ** 2) + (yema ? 0 : .003 * ex2(((y - L) / .012) ** 2)), cierre = yema ? Math.sqrt(cl01((1 - v) / .12)) : 1; return [r * cierre, r * cierre * .9, 0] });
  const gPalma = tubo(.0, .17, 22, 16, (v, th) => { const r = .022 + .004 * ex2(((v - .9) / .1) ** 2), w = .046 + .006 * v; return [r * .78, w, 0] });
  const gRotura = (r0) => { const r = rnd(r0 * 1e4 | 0), FR = Array.from({ length: 15 }, () => .003 + .02 * r()); return tubo(.0, .014, 14, 3, (v, th) => [r0 + .0012, (r0 + .0012) * .9, 0, 0, -v * FR[Math.round(th / TAU * 14)]]) };
  const DEDOS = [{ z: .034, m: 1, mat: [1, 1, 0] }, { z: .012, m: 1.08, mat: [1, 0, 0] }, { z: -.011, m: 1.0, mat: [1, 1, 0] }, { z: -.033, m: .84, mat: [1, 0, 0] }];
  const SEGL = [.15, .13, .11];
  for (const s of [0, 1]) { const sg = s ? -1 : 1, H = grupo(col2, sg * .25, .5, -.01), C = grupo(H, 0, -UA, 0), W = grupo(C, 0, -FA, 0);
    pieza(gManga, M_LEVITA, H); pieza(gAnte, M_LEVITA, C); pieza(gMunecaPiel, M_PIEL, W);
    const palma = pieza(gPalma, M_GUANTE, W, 0, -.035, 0);
    DEDOS.forEach((d, f) => { let par = W; const L = []; let y = -.2;
      for (let k = 0; k < 3; k++) { const G_ = grupo(par, 0, k ? -SEGL[k - 1] * d.m : y, k ? 0 : d.z); const r0 = .0125 - k * .0012, r1 = r0 - .0014, guante = d.mat[k];
        pieza(gSeg(SEGL[k] * d.m, r0, r1, k === 2), guante ? M_GUANTE : M_PIEL, G_);
        if (k > 0 && d.mat[k - 1] && !guante) pieza(gRotura(r0 + .002), M_GUANTE, G_, 0, .012, 0);
        if (k === 2) { const u = pieza(new T3.SphereGeometry(.009, 10, 8), M_UNA, G_, sg * .008, -SEGL[2] * d.m + .006, 0); u.scale.set(.35, 1.9, 1) }
        L.push(G_); par = G_ } J.dedos[s].push(L) });
    // pulgar: sale del costado delantero de la palma
    const P0 = grupo(W, -sg * .004, -.07, .05); P0.rotation.set(-.45, 0, -sg * .2); P0.userData.rest = [-.45, 0, -sg * .2]; const P1 = grupo(P0, 0, -.11, 0);
    pieza(gSeg(.11, .014, .0125, false), M_GUANTE, P0); pieza(gSeg(.1, .0125, .011, true), M_PIEL, P1); pieza(gRotura(.0145), M_GUANTE, P1, 0, .012, 0);
    { const u = pieza(new T3.SphereGeometry(.009, 10, 8), M_UNA, P1, sg * .008, -.094, 0); u.scale.set(.35, 1.9, 1) }
    J.pulgar.push([P0, P1]); J.hombro.push(H); J.codo.push(C); J.muneca.push(W) }

  // ---------- cuello largo con tendones y nuez; gotas de cera que bajan por él
  const cuello = grupo(col2, 0, .6, .05);
  pieza(tubo(.56, .66, 30, 40, (v, th) => { const y = .56 - v * .66, c = Math.cos(th), sn = Math.sin(th), ten = .009 * (ex2(((th - .62) / .22) ** 2) + ex2(((th - (TAU - .62)) / .22) ** 2)) * S_(.0, .3, y),
    nuez = .011 * ex2(((y - .25) / .05) ** 2) * Math.max(0, c) ** 6, r = .048 + .012 * S_(.4, .56, y) + .03 * S_(.1, -.1, y); return [r + ten, r * 1.05 + ten + nuez, .01] }), M_PIEL, cuello);
  const cabeza = grupo(cuello, 0, .52, 0); cabeza.scale.setScalar(1.15);
  { const r = rnd(91); for (let i = 0; i < 4; i++) { const th = (r() - .5) * 2.4 + (i % 3 === 0 ? PI : 0), y0 = .5 - r() * .05, y1 = y0 - .14 - r() * .26, R = .053, P = [];
    for (let k = 0; k <= 6; k++) { const y = lerp(y0, y1, k / 6), a = th + .05 * Math.sin(k * 1.7 + i); P.push(new T3.Vector3(Math.sin(a) * R, y, Math.cos(a) * R * 1.05 + .01)) }
    const r0 = .004 + r() * .004; pieza(tuboCurva(P, 8, 26, v => v < .82 ? r0 * (.55 + .45 * v) : r0 * 1.7 * Math.sqrt(Math.max(0, 1 - ((v - .9) / .1) ** 2))), M_CERA, cuello) } }

  // ---------- la cabeza: esfera deformada (alargada, calva, sin orejas), cuencas hundidas, pómulos, mejillas chupadas, nariz fina,
  // la sonrisa (surco + labios finos + línea oscura), gotas de cera del cráneo; color por vértice (cuencas, labios, surco, cera)
  const HCEN = [0, .19, .035], HS = [.124, .242, .148];
  const GOTAS = (() => { const r = rnd(57), L = []; for (let i = 0; i < 22; i++) { const lon = (r() - .5) * TAU, fr = Math.abs(lon) < .9, lat0 = .55 + r() * .4, lat1 = fr ? Math.max(.4, lat0 - .1 - r() * .25) : lat0 - .2 - r() * .7;
    L.push({ lon, lat0, lat1, w: .025 + r() * .03, h: .0035 + r() * .004 }) }
    L.push({ lon: .3, lat0: .45, lat1: .2, w: .03, h: .005 }, { lon: -.5, lat0: .1, lat1: -.35, w: .03, h: .004 }); return L })();
  const W_ = {};
  function cabezaPunto(dx, dy, dz) { let sx = HS[0], sy = HS[1], sz = HS[2];
    sx *= (1 - .37 * S_(-.05, -.95, dy)) * (1 - .1 * S_(.5, 1, dy)); sz *= dz > 0 ? 1 - .1 * S_(-.35, -1, dy) : 1.1 + .06 * S_(-.2, .5, dy);
    let x = dx * sx, y = dy * sy, z = dz * sz; const fr = S_(.05, .5, dz), ax = Math.abs(x), lon = Math.atan2(dx, dz), lat = Math.asin(Math.max(-1, Math.min(1, dy))); let d = 0;
    W_.cuenca = 0; W_.boca = 0; W_.labio = 0; W_.cera = 0; W_.nariz = 0; W_.ojera = 0;
    for (const s of [-1, 1]) { const ex = (x - s * .044) / .025, ey = (y - .03) / .02, rho = Math.sqrt(ex * ex + ey * ey); d -= .027 * ex2(rho * rho) * fr; d += .0035 * ex2(((rho - 1.35) / .28) ** 2) * fr;
      W_.cuenca = Math.max(W_.cuenca, ex2(rho * rho * .45) * fr); W_.ojera = Math.max(W_.ojera, ex2(((x - s * .046) / .03) ** 2 + ((y + .008) / .014) ** 2) * fr) }
    d += .009 * ex2(((y - .068) / .014) ** 2) * ex2((x / .075) ** 4) * fr;   // arco de las cejas (sin cejas)
    d -= .013 * ex2(((Math.abs(lon) - 1.12) / .3) ** 2) * ex2(((y - .07) / .055) ** 2);   // sienes hundidas
    d += .011 * ex2(((ax - .07) / .022) ** 2 + ((y + .022) / .018) ** 2) * fr;   // pómulos
    d -= .021 * ex2(((ax - .066) / .03) ** 2 + ((y + .1) / .042) ** 2) * fr;   // mejillas chupadas
    { const hN = .008 * S_(.03, -.03, y) * (1 - S_(-.07, -.09, y)) + .0045 * ex2(((y + .075) / .01) ** 2), wN = .006 + .006 * S_(0, -.07, y); d += hN * ex2((x / wN) ** 2) * fr;
      W_.nariz = ex2(((ax - .009) / .0045) ** 2 + ((y + .086) / .0035) ** 2) * fr; d -= .004 * W_.nariz }
    { const ym = -.152 + .052 * (x / .108) ** 2, env = S_(.114, .098, ax); d -= .015 * ex2(((y - ym) / .005) ** 2) * env * fr; d += .0011 * ex2(((y - ym - .006) / .003) ** 2) * env * fr + .0009 * ex2(((y - ym + .0065) / .0035) ** 2) * env * fr;
      d -= .006 * ex2(((ax - .108) / .006) ** 2 + ((y - ym) / .007) ** 2) * fr; W_.boca = ex2(((y - ym) / .0042) ** 2) * env * fr; W_.labio = (ex2(((y - ym - .0075) / .004) ** 2) + ex2(((y - ym + .008) / .0045) ** 2)) * env * fr }
    { const px = ax - .02, py = y + .085, t = cl01((px * .08 - py * .055) / (.08 * .08 + .055 * .055)), qx = px - .08 * t, qy = py + .055 * t; d -= .004 * ex2((qx * qx + qy * qy) / (.005 * .005)) * fr }   // surcos nariz-boca
    d += .012 * ex2((x / .03) ** 2 + ((y + .238) / .024) ** 2) * fr;   // mentón
    d += .004 * ex2(((Math.abs(lon) - PI / 2) / .28) ** 2 + (y / .05) ** 2);   // donde irían las orejas: piel lisa, un montículo de cera
    for (const G of GOTAS) { const lw = G.lon + .035 * Math.sin(lat * 22 + G.lon * 3), dl = Math.atan2(Math.sin(lon - lw), Math.cos(lon - lw)) * Math.cos(lat), on = S_(G.lat1 - .01, G.lat1 + .04, lat) * S_(G.lat0 + .12, G.lat0, lat);
      const k = G.h * ex2((dl / G.w) ** 2) * on + G.h * 1.9 * ex2((dl / (G.w * 1.35)) ** 2 + ((lat - G.lat1) / .035) ** 2); d += k; W_.cera = Math.max(W_.cera, k / G.h * .6) }
    d += .0022 * (fbm(x * 38, y * 38, z * 38) - .5);
    const n = Math.hypot(dx, dy, dz) || 1; return [HCEN[0] + x + dx / n * d, HCEN[1] + y + dy / n * d, HCEN[2] + z + dz / n * d] }
  const gCabeza = (() => { const geo = new T3.SphereGeometry(1, 200, 150), p = geo.attributes.position, C = new Float32Array(p.count * 3);
    const c0 = new T3.Color("#e6e1c8"), c1 = new T3.Color("#cfd0b0"), cS = new T3.Color("#3a322c"), cO = new T3.Color("#7e7068"), cM = new T3.Color("#140a08"), cL = new T3.Color("#9a847a"), cC = new T3.Color("#efe9cc"), cN = new T3.Color("#2a201c"), c = new T3.Color();
    for (let i = 0; i < p.count; i++) { const q = cabezaPunto(p.getX(i), p.getY(i), p.getZ(i)); p.setXYZ(i, q[0], q[1], q[2]);
      c.copy(c0).lerp(c1, .7 * S_(.4, .75, fbm(q[0] * 9, q[1] * 9, q[2] * 9))); c.lerp(cO, W_.ojera * .55); c.lerp(cS, Math.min(1, W_.cuenca * 1.05)); c.lerp(cL, Math.min(1, W_.labio) * .35); c.lerp(cC, Math.min(1, W_.cera) * .7); c.lerp(cN, Math.min(1, W_.nariz)); c.lerp(cM, Math.min(1, W_.boca));
      C[i * 3] = c.r; C[i * 3 + 1] = c.g; C[i * 3 + 2] = c.b }
    geo.setAttribute("color", new T3.BufferAttribute(C, 3)); return costura(geo) })();
  const CAB = pieza(gCabeza, M_CARA, cabeza);
  // punto de la superficie de la cara a la altura (x, y) (busca la dirección por iteración)
  function sobreCara(x, y) { let a = x / HS[0], b = (y - HCEN[1]) / HS[1], q; for (let k = 0; k < 10; k++) { const zz = Math.sqrt(Math.max(.02, 1 - a * a - b * b)); q = cabezaPunto(a, b, zz); a += (x - q[0]) / HS[0] * .8; b += (y - q[1]) / HS[1] * .8 } return new T3.Vector3(...q) }
  // ojos: chiquitos, negros, mate, hundidos en el fondo de la cuenca, con párpados de cera que se escurren
  for (const s of [1, -1]) { const p = sobreCara(s * .044, HCEN[1] + .03), e = pieza(new T3.SphereGeometry(.0125, 24, 18), M_OJO, cabeza, p.x, p.y, p.z - .0055, false); J.ojos.push(e);
    const lid = [], lid2 = []; for (let k = 0; k <= 8; k++) { const a = PI * (.08 + .84 * k / 8); lid.push(new T3.Vector3(p.x + Math.cos(a) * .0145, p.y + Math.sin(a) * .0118, p.z - .003 + .003 * Math.sin(a))); lid2.push(new T3.Vector3(p.x + Math.cos(a) * .0145, p.y - Math.sin(a) * .0105, p.z - .004)) }
    pieza(tuboCurva(lid, 8, 24, v => .0024 * Math.sin(PI * v) + .0008), M_CERA, cabeza); pieza(tuboCurva(lid2, 8, 24, v => .0018 * Math.sin(PI * v) + .0006), M_CERA, cabeza);
    // lágrima de cera que sale del lagrimal y baja por la mejilla
    const L = []; for (let k = 0; k <= 3; k++) { const yy = p.y - .013 - k * .005, xx = s * (.03 + .003 * k) ; const sp = sobreCara(xx, yy); L.push(sp.add(new T3.Vector3(0, 0, .0015))) }
    pieza(tuboCurva(L, 8, 30, v => v < .8 ? .0016 + .0008 * v : .0034 * Math.sqrt(Math.max(0, 1 - ((v - .88) / .12) ** 2))), M_CERA, cabeza) }
  // la sonrisa: una línea oscura finísima metida en el surco, de comisura a comisura
  { const L = []; for (let k = 0; k <= 24; k++) { const x = -.104 + .208 * k / 24, ym = HCEN[1] - .152 + .052 * (x / .108) ** 2; L.push(sobreCara(x, ym).add(new T3.Vector3(0, 0, -.0028))) }
    pieza(tuboCurva(L, 8, 80, v => .0042 * (.45 + .55 * Math.sin(PI * v) ** .3)), M_BOCA, cabeza, 0, 0, 0, false) }
  // gotas de cera colgando del mentón y de la mandíbula, solidificadas (estalactitas)
  { const r = rnd(29); [[.012, -.232, .035], [-.03, -.222, .045], [.064, -.196, .02]].forEach(([x, y, L0]) => {
      const p = sobreCara(x, HCEN[1] + y).add(new T3.Vector3(0, .004, -.012)), L = []; for (let k = 0; k <= 5; k++) L.push(new T3.Vector3(p.x + .003 * Math.sin(k + x * 40), p.y - L0 * k / 5, p.z - .004 * k / 5));
      const r0 = .006 + r() * .003; pieza(tuboCurva(L, 10, 26, v => v < .8 ? r0 * (1.4 - .5 * v) : r0 * 1.6 * Math.sqrt(Math.max(0, 1 - ((v - .89) / .11) ** 2))), M_CERA, cabeza) }) }

  // ---------- el frasco (vidrio con un recuerdo adentro: brillo pálido que respira) y el martillo enorme
  const FRASCO = new T3.Group(); FRASCO.visible = false;
  { const prof = [[0, -.06], [.038, -.06], [.044, -.05], [.046, .02], [.04, .04], [.026, .05], [.026, .062]].map(([x, y]) => new T3.Vector2(x, y));
    const m = new T3.Mesh(new T3.LatheGeometry(prof, 32), new T3.MeshPhysicalMaterial({ color: "#d8eee4", roughness: .08, transparent: true, opacity: .32, clearcoat: 1, side: T3.DoubleSide, depthWrite: false, emissive: "#9ec8b4", emissiveIntensity: .25 })); FRASCO.add(m);
    pieza(new T3.CylinderGeometry(.024, .022, .026, 16), new T3.MeshStandardMaterial({ color: "#5a4128", roughness: .9 }), FRASCO, 0, .07, 0);
    pieza(new T3.TorusGeometry(.027, .003, 6, 24), M_CERA, FRASCO, 0, .056, 0).rotation.x = PI / 2 }
  const FR_ALMA = new T3.Mesh(new T3.IcosahedronGeometry(.024, 3), new T3.MeshBasicMaterial({ color: "#e6fff2", transparent: true, opacity: .75, blending: T3.AdditiveBlending, depthWrite: false })); FRASCO.add(FR_ALMA);
  const FR_HALO = new T3.Sprite(new T3.SpriteMaterial({ map: T_PUNTO, color: "#bfe8d6", transparent: true, opacity: .55, blending: T3.AdditiveBlending, depthWrite: false })); FR_HALO.scale.setScalar(.34); FRASCO.add(FR_HALO);
  const FR_LUZ = new T3.PointLight("#cfeee0", 0, 3, 1.6); FRASCO.add(FR_LUZ);
  { const p0 = FR_ALMA.geometry.attributes.position; FR_ALMA.userData.base = Float32Array.from(p0.array) }
  const MARTILLO = new T3.Group(); MARTILLO.visible = false;   // el mango va por −z del grupo (agarre en el origen), la cabeza en la punta
  { const LM = 2.15, ag = .14;
    const mango = pieza(new T3.CylinderGeometry(.03, .034, LM, 14, 20), M_MADERA, MARTILLO, 0, 0, -(LM / 2 - ag)); mango.rotation.x = PI / 2;
    for (const z of [.05, -.05, -.6, -.62, -1.6]) { const b = pieza(new T3.CylinderGeometry(.037, .037, .03, 14), M_HIERRO, MARTILLO, 0, 0, z); b.rotation.x = PI / 2 }
    const hg = new T3.BoxGeometry(.56, .25, .25, 10, 6, 6), hp = hg.attributes.position; for (let i = 0; i < hp.count; i++) { const x = hp.getX(i), y = hp.getY(i), z = hp.getZ(i), k = 1 - .1 * (Math.abs(y) > .1 && Math.abs(z) > .1 ? 1 : 0); hp.setXYZ(i, x * (1 + .06 * (Math.abs(x) > .26 ? 1 : 0)), y * k, z * k) } hg.computeVertexNormals();
    pieza(hg, M_HIERRO, MARTILLO, 0, 0, -(LM - ag - .05));
    for (const sx of [-1, 1]) pieza(new T3.CylinderGeometry(.14, .14, .03, 20), M_HIERRO, MARTILLO, sx * .29, 0, -(LM - ag - .05)).rotation.z = PI / 2;
    MARTILLO.userData.punta = new T3.Vector3(0, 0, -(LM - ag - .05)); MARTILLO.userData.LM = LM }

  // ---------- aura: niebla que se arrastra, moscas, polvo, luz fría desde abajo
  const AURA = grupo(g); AURA.visible = false;
  const NIEBLA = Array.from({ length: 18 }, (_, i) => { const s = new T3.Sprite(new T3.SpriteMaterial({ map: T_NIEBLA, color: "#6f7c88", transparent: true, opacity: .3, depthWrite: false, fog: true })); s.userData = { a: i * 2.4, r: .4 + (i * .37 % 1) * 2.8, sp: .05 + (i * .61 % 1) * .08, y: .15 + (i * .29 % 1) * .45, sc: 2.2 + (i * .43 % 1) * 2 }; AURA.add(s); return s });
  const MOSCAS = new T3.InstancedMesh(new T3.SphereGeometry(.006, 5, 4), new T3.MeshBasicMaterial({ color: "#050505" }), 34); MOSCAS.frustumCulled = false; AURA.add(MOSCAS);
  const POLVO = (() => { const N = 220, p = new Float32Array(N * 3); const geo = new T3.BufferGeometry(); geo.setAttribute("position", new T3.BufferAttribute(p, 3));
    const m = new T3.Points(geo, new T3.PointsMaterial({ map: T_PUNTO, color: "#c4d2dc", size: .03, transparent: true, opacity: .55, depthWrite: false, blending: T3.AdditiveBlending })); m.frustumCulled = false; AURA.add(m); return m })();
  const LUZ_FRIA = new T3.PointLight("#8fb6e6", 0, 9, 1.5); LUZ_FRIA.position.set(0, 1.9, 1.5); g.add(LUZ_FRIA);
  const LUZ_PIES = new T3.PointLight("#6f8fb8", 0, 6, 1.6); LUZ_PIES.position.set(0, .35, .9); g.add(LUZ_PIES);
  const _m4 = new T3.Matrix4(), _p = new T3.Vector3();
  function auraTick(t, k) { NIEBLA.forEach((s, i) => { const d = s.userData, a = d.a + t * d.sp * (i % 2 ? 1 : -1), rr = d.r + .35 * Math.sin(t * .2 + i); s.position.set(Math.cos(a) * rr, d.y + .06 * Math.sin(t * .5 + i), Math.sin(a) * rr + .3); s.scale.set(d.sc * 1.6, d.sc * .55, 1); s.material.rotation = .2 * Math.sin(t * .1 + i); s.material.opacity = .32 * k * (.7 + .3 * Math.sin(t * .3 + i * 1.7)) });
    g.updateMatrixWorld(true); const hc = g.worldToLocal(API.headW()), pc = g.worldToLocal(J.muneca[0].getWorldPosition(v4).clone());
    for (let i = 0; i < 34; i++) { const c = i < 8 ? hc : i < 22 ? pc : _p.set(0, 2.6, .15), f = 1.3 + (i * .37 % 1) * 2.4, ph = i * 2.1, rr = i < 14 ? .28 : .45;
      const x = c.x + Math.sin(t * f + ph) * rr + .05 * Math.sin(t * 13 + i), y = c.y + Math.sin(t * f * 1.37 + ph * 2) * rr * .6 + .03 * Math.sin(t * 17 + i * 3), z = c.z + Math.cos(t * f * .83 + ph) * rr + .04 * Math.sin(t * 11 + i * 5);
      _m4.makeTranslation(x, y, z); MOSCAS.setMatrixAt(i, _m4) } MOSCAS.instanceMatrix.needsUpdate = true;
    const P = POLVO.geometry.attributes.position; for (let i = 0; i < P.count; i++) { const a = i * 2.399, rr = .3 + (i * .618 % 1) * 2.6, h = ((i * .377 % 1) * 5 + t * (.03 + (i % 5) * .01)) % 5;
      P.setXYZ(i, Math.cos(a + t * .02) * rr + .1 * Math.sin(t * .3 + i), h, Math.sin(a + t * .02) * rr + .4) } P.needsUpdate = true; POLVO.material.opacity = .5 * k }

  // ---------- pose
  const REST = () => { cuerpo.position.set(0, 0, 0); cuerpo.rotation.set(0, 0, 0); caderas.position.set(0, HIP, 0); caderas.rotation.set(0, 0, 0); pelvis.rotation.set(.08, 0, 0); faldaG.rotation.set(0, 0, 0);
    col1.rotation.set(.14, 0, 0); col2.rotation.set(.34, 0, 0); cuello.rotation.set(.62, 0, 0); cabeza.rotation.set(0, 0, 0);
    for (const s of [0, 1]) { J.muslo[s].rotation.set(-.04, 0, 0); J.rodilla[s].rotation.set(.1, 0, 0); J.tobillo[s].rotation.set(-.06, 0, 0); J.hombro[s].rotation.set(0, 0, 0); J.codo[s].rotation.set(0, 0, 0); J.muneca[s].rotation.set(0, 0, 0); J.pulgar[s][0].rotation.set(...J.pulgar[s][0].userData.rest) }
    FRASCO.visible = false; MARTILLO.visible = false; ST.frasco = ST.martillo = false; ST.roll = 0 };
  const ST = { t: 0, frasco: false, martillo: false, roll: 0, aura: false };
  // el miembro (grupo cuyo «largo» va por −y local) apunta en la dirección dir del MUNDO
  function apuntarW(G, dir) { G.parent.updateWorldMatrix(true, false); G.parent.getWorldQuaternion(q1).invert(); v1.copy(dir).normalize().applyQuaternion(q1); G.quaternion.setFromUnitVectors(ABAJO, v1) }
  // IK de dos huesos: la muñeca va al punto T del mundo; el codo hacia «pole»
  function ik2(s, T, pole) { const H = J.hombro[s], C = J.codo[s]; H.updateWorldMatrix(true, false); const S0 = H.getWorldPosition(v2), d = v3.copy(T).sub(S0), D = Math.min(d.length(), (UA + FA) * .999), dn = d.normalize();
    const a = Math.acos(Math.max(-1, Math.min(1, (UA * UA + D * D - FA * FA) / (2 * UA * D)))), ax = v4.crossVectors(dn, pole).normalize(), up = dn.clone().applyAxisAngle(ax, a);
    apuntarW(H, up); C.rotation.set(0, 0, 0); C.updateWorldMatrix(true, false); const E = C.getWorldPosition(new T3.Vector3()); apuntarW(C, v1.copy(T).sub(E)) }
  // dedos: curl (rad) por segmento, con el giro hacia la palma de cada mano
  function dedos(s, curl, abre = 0) { const sg = s ? -1 : 1; J.dedos[s].forEach((L, f) => L.forEach((G_, k) => { const c = typeof curl === "function" ? curl(f, k) : curl; G_.rotation.set(0, 0, -sg * c); if (k === 0) G_.rotation.x = (f - 1.5) * .06 * (1 + abre * 2) }));
    J.pulgar[s][1].rotation.set(0, 0, -sg * (typeof curl === "function" ? curl(4, 1) : curl) * .6) }
  function dedosVivos(t, s, base = .22, amp = 1) { const ph = s * 3.1; dedos(s, (f, k) => { const w = .23 + f * .07 + s * .05, lento = Math.sin(t * w + f * 1.9 + ph) * .5 + Math.sin(t * w * 2.3 + f * 4.1 + k) * .25, tic = Math.max(0, Math.sin(t * .37 + f * 2.2 + ph)) ** 12 * .7;
    return base * (1 + .3 * k) + amp * (.22 * lento * (1 + .4 * k) - tic * (k === 0 ? 1 : -.4)) }) }
  // la cabeza mira con su +z según (pitch, roll) respecto de la raíz (no se mueve aunque el cuerpo se mueva)
  function cabezaNivel(pitch, roll = 0, yaw = 0) { g.updateMatrixWorld(true); g.getWorldQuaternion(q2); q2.multiply(new T3.Quaternion().setFromEuler(new T3.Euler(pitch, yaw, roll, "YXZ")));
    cabeza.parent.getWorldQuaternion(q1).invert(); cabeza.quaternion.copy(q1.multiply(q2)) }
  function brazosColgando(t, abre = .12) { g.updateMatrixWorld(true); g.getWorldQuaternion(q2);
    for (const s of [0, 1]) { const sg = s ? -1 : 1, dir = v3.set(sg * abre, -1, .1 + .02 * Math.sin(t * .2 + s)).applyQuaternion(q2); apuntarW(J.hombro[s], dir); J.codo[s].rotation.set(-.16, 0, 0); J.muneca[s].rotation.set(-.12, 0, sg * .06) } }
  // pies planos: el tobillo compensa lo que giran cadera, muslo y rodilla
  const piesPlanos = () => { for (const s of [0, 1]) J.tobillo[s].rotation.x = -(caderas.rotation.x + J.muslo[s].rotation.x + J.rodilla[s].rotation.x) + (J.tobillo[s].userData.extra || 0) };
  const extLeg = (f, k) => LT * Math.cos(f) + LS * Math.cos(f - k) + LA;   // alto vertical de una pierna (f = muslo adelante, k = rodilla)
  function faldaDeforma(t) { const fL = -J.muslo[0].rotation.x, fR = -J.muslo[1].rotation.x, kL = J.rodilla[0].rotation.x, kR = J.rodilla[1].rotation.x;
    faldaG.rotation.x = pelvis.rotation.x * .3 - .02;
    const def = (geo, B, frente) => { const P = geo.attributes.position.array; for (let i = 0; i < P.length; i += 3) { const x = B[i], y = B[i + 1], z = B[i + 2], dep = Math.max(0, -y + .1), wL = S_(-.12, .14, x), wR = 1 - wL;
        const f = wL * fL + wR * fR, k = wL * kL + wR * kR, pie = Math.min(dep, LT), canilla = Math.max(0, dep - LT);
        let dz = Math.sin(f) * pie + Math.sin(f - k) * canilla - Math.sin(f) * 0, adel = z > 0 ? 1 : .55; dz = (dz > 0 ? (frente ? 1.05 : adel) : (z < 0 ? 1 : .5)) * dz * .9;
        const sway = .012 * Math.sin(t * 1.1 + x * 7 + y * 2) * dep / FALDA_L; P[i] = x; P[i + 1] = y + Math.min(.3, dep * (1 - Math.cos(f)) * .5); P[i + 2] = z + dz + sway + (frente && dz > 0 ? .02 * S_(0, .5, f) : 0) } geo.attributes.position.needsUpdate = true; geo.computeVertexNormals() };
    def(FALDA.geometry, FALDA_B, false); def(DELANTAL.geometry, DELANTAL_B, true) }

  // ---------- API
  const API = { g, J, PASO,
    climas() { if (typeof ENV === "undefined") return; const E = {
        sallow: { top: "#080c13", hor: "#151c24", fog: .028, hemi: .42, hemiG: "#12100e", sun: .32, sunCol: "#8ea6c4", exp: 1.35, grade: ["#7f98a8", .08], sol: [.25, 1, .45], sombra: 40 },
        noche: { top: "#060a16", hor: "#18203a", fog: .014, hemi: .55, hemiG: "#18140e", sun: .85, sunCol: "#a8bce6", exp: 1.3, grade: ["#9ab0d0", .06], sol: [-.4, 1, .25], sombra: 60 } };
      for (const k in E) if (!ENV[k]) ENV[k] = E[k] },
    ocultar() { g.visible = false; AURA.visible = false; LUZ_FRIA.intensity = LUZ_PIES.intensity = 0; FR_LUZ.intensity = 0; ST.aura = false },
    poner(x, y, z, ry = 0) { g.visible = true; g.position.set(x, y, z); g.rotation.set(0, ry, 0); REST(); API.ocultarAura(); ST.t = 0; piesPlanos(); brazosColgando(0); dedosVivos(0, 0); dedosVivos(0, 1); cabezaNivel(.12); faldaDeforma(0) },
    ocultarAura() { AURA.visible = false; LUZ_FRIA.intensity = LUZ_PIES.intensity = 0; ST.aura = false },
    quieto(t) { ST.t = t; const b = Math.sin(t * .9) * .004; caderas.position.y = extLeg(.04, .1) + b * .3; col2.rotation.x = .34 + b; cuello.rotation.x = .62 - b * .5; piesPlanos();
      brazosColgando(t); dedosVivos(t, 0); dedosVivos(t, 1); cabezaNivel(.12 + .01 * Math.sin(t * .31), .015 * Math.sin(t * .17)); faldaDeforma(t) },
    andar(t, vel = .7) { ST.t = t; const ph = t * vel / PASO * TAU, A = .3;
      for (const s of [0, 1]) { const p = ph + s * PI, f = A * Math.sin(p), sw = Math.max(0, Math.cos(p)), k = .1 + .95 * sw ** 1.6 * S_(-.2, .3, Math.sin(p) + .3);
        J.muslo[s].rotation.x = -f; J.rodilla[s].rotation.x = k; J.tobillo[s].userData.extra = sw > .2 ? .25 * sw : 0 }
      caderas.position.y = Math.max(...[0, 1].map(s => extLeg(-J.muslo[s].rotation.x, J.rodilla[s].rotation.x)));
      caderas.rotation.y = .05 * Math.sin(ph); pelvis.rotation.y = -.05 * Math.sin(ph); piesPlanos(); for (const s of [0, 1]) J.tobillo[s].userData.extra = 0;
      brazosColgando(t, .1); dedosVivos(t, 0, .2, .6); dedosVivos(t, 1, .2, .6); cabezaNivel(.1); faldaDeforma(t) },
    ladear(u) { ST.roll = u; cuello.rotation.z += -u * .18; cabeza.rotateZ(-u * PI / 3 * .85); cabeza.rotateX(u * .12) },
    inclinarse(u, p) { if (!(u > 0)) return; u = eIO(cl01(u)); const T = new T3.Vector3(...p); g.updateMatrixWorld(true); const loc = g.worldToLocal(T.clone()), yaw = Math.max(-.9, Math.min(.9, Math.atan2(loc.x, loc.z)));
      const meta = T.y + .22;   // la cara queda un poco más arriba que lo que mira, encima
      const prueba = b => { const bend = Math.min(b, 1) * 1.22, cr = Math.max(0, b - .55) * 1.1; pelvis.rotation.set(.08 + bend * u, yaw * u * .6, 0); col1.rotation.x = .14 + .12 * b * u; col2.rotation.x = .34 + .1 * b * u; cuello.rotation.x = .62 + .3 * b * u;
        for (const s of [0, 1]) { J.muslo[s].rotation.x = -(.04 + .5 * cr) * u - .04 * (1 - u); J.rodilla[s].rotation.x = .1 + 1.05 * cr * u }
        caderas.position.y = extLeg(-J.muslo[0].rotation.x, J.rodilla[0].rotation.x); caderas.position.z = -.25 * cr * u; piesPlanos(); g.updateMatrixWorld(true); return API.headW().y };
      let lo = 0, hi = 1.5; for (let i = 0; i < 14; i++) { const m = (lo + hi) / 2; if (prueba(m) > meta) lo = m; else hi = m } prueba((lo + hi) / 2);
      brazosColgando(ST.t, .08); cabeza.lookAt(T); cabeza.rotateZ(-ST.roll * PI / 3 * .85 + .25 * u);
      // una mano abierta, encima de la cabeza del otro, con los dedos estirados
      const s = 0, M_ = new T3.Vector3(...p).add(new T3.Vector3(0, .55, 0)); ik2(s, M_.lerp(J.muneca[s].getWorldPosition(new T3.Vector3()), 1 - u), new T3.Vector3(0, -1, 0).applyQuaternion(g.quaternion).add(new T3.Vector3(.6, 0, 0).applyQuaternion(g.quaternion)));
      J.muneca[s].rotation.set(.5 * u, 0, -.3 * u); dedos(s, (f, k) => (.15 + .2 * k) * u + .05 * Math.sin(ST.t * (.5 + f * .2) + f), 1);
      if (ST.frasco) API.frasco(true); faldaDeforma(ST.t) },
    frasco(v) { ST.frasco = !!v; FRASCO.visible = !!v; FR_LUZ.intensity = v ? 1.6 : 0; if (!v) return; const s = 1, W = J.muneca[s], t = ST.t;
      J.hombro[s].rotation.set(-.85 - .05 * Math.sin(t * .3), 0, -.12); J.codo[s].rotation.set(-1.45, 0, 0); W.rotation.set(-.35, 1.2, .1);
      dedos(s, (f, k) => f === 0 || f === 1 ? [.05, .2, .25][k] : [.9, 1.1, .9][k] + .05 * Math.sin(t * .4 + f)); J.pulgar[s][0].rotation.set(-.1, 0, .6);
      const a = J.dedos[s][0][1], b = J.dedos[s][1][1]; if (FRASCO.parent !== W) W.add(FRASCO); W.updateMatrixWorld(true);
      const pa = W.worldToLocal(a.getWorldPosition(new T3.Vector3())), pb = W.worldToLocal(b.getWorldPosition(new T3.Vector3())); FRASCO.position.copy(pa).add(pb).multiplyScalar(.5).add(new T3.Vector3(0, -.03, 0)); FRASCO.rotation.set(0, 0, 0);
      W.getWorldQuaternion(q1).invert(); FRASCO.quaternion.copy(q1);   // el frasco queda derecho en el mundo
      const k = .85 + .15 * Math.sin(t * 2.1) + .05 * Math.sin(t * 7.3); FR_ALMA.scale.set(k, k * 1.25, k); FR_ALMA.rotation.y = t * .6; FR_HALO.material.opacity = .45 * k; FR_LUZ.intensity = 1.6 * k },
    martillo(v) { ST.martillo = !!v; MARTILLO.visible = !!v; if (!v) return; const s = 1, W = J.muneca[s]; if (MARTILLO.parent !== W) W.add(MARTILLO);
      // apoyado en el piso: mano adelante a ≈ 1,6 m, el mango baja derecho hasta la cabeza del martillo en el piso
      g.updateMatrixWorld(true); const sh = J.hombro[s].getWorldPosition(new T3.Vector3()), fw = new T3.Vector3(0, 0, 1).applyQuaternion(g.quaternion), side = new T3.Vector3(-1, 0, 0).applyQuaternion(g.quaternion);
      const T = sh.clone().addScaledVector(fw, .55).addScaledVector(side, .22); T.y = g.position.y + MARTILLO.userData.LM - .14 - .12 + .2;
      ik2(s, T, side.clone().add(new T3.Vector3(0, -.3, 0))); MARTILLO.position.set(.025, -.13, 0); W.updateMatrixWorld(true);
      W.getWorldQuaternion(q1).invert(); MARTILLO.quaternion.copy(q1).multiply(new T3.Quaternion().setFromUnitVectors(new T3.Vector3(0, 0, -1), new T3.Vector3(.08, -1, .1).normalize().applyQuaternion(g.quaternion)));
      dedos(s, (f, k) => [1.1, 1.4, 1.2][k]) },
    golpe(t, u) { ST.t = t; u = cl01(u); API.martillo(true); const s = 1, W = J.muneca[s];
      const key = [[0, -.5], [.35, -3.35], [.5, -3.45], [.62, -1.25], [.72, -1.05], [1, -1.15]]; let a = key[0][1]; for (let i = 1; i < key.length; i++) if (u <= key[i][0]) { const [u0, a0] = key[i - 1], [u1, a1] = key[i], k = (u - u0) / (u1 - u0); a = lerp(a0, a1, i === 3 ? k * k * k : eIO(k)); break } else a = key[i][1];
      const tem = .01 * Math.sin(t * 31) * S_(.3, .5, u) * (1 - S_(.5, .6, u)) + .03 * Math.sin(t * 40) * ex2(((u - .64) / .04) ** 2);
      J.hombro[s].rotation.set(a + tem, 0, .1); J.codo[s].rotation.set(-.25, 0, 0); W.rotation.set(-PI / 2 + .25, 0, 0);
      col2.rotation.x = .34 - .15 * S_(.1, .45, u) + .3 * S_(.5, .66, u); cuello.rotation.x = .62 + .1 * S_(.5, .66, u);
      MARTILLO.position.set(.025, -.13, 0); MARTILLO.quaternion.identity(); dedos(s, (f, k) => [1.1, 1.4, 1.2][k]);
      W.updateMatrixWorld(true); const pM = MARTILLO.localToWorld(new T3.Vector3(0, 0, -.32)); const side = new T3.Vector3(1, -.4, .3).applyQuaternion(g.quaternion);
      ik2(0, pM, side); J.muneca[0].rotation.set(-PI / 2 + .2, 0, 0); dedos(0, (f, k) => [1.1, 1.4, 1.2][k]); cabezaNivel(.15 + .2 * S_(.5, .66, u), ST.roll) },
    caer(u) { u = cl01(u); const paso = eIO(S_(0, .3, u)), c = S_(.25, 1, u), a = -(PI / 2 - .04) * c * c * (1 + .05 * Math.sin(c * PI));
      J.muslo[1].rotation.x = .38 * paso * (1 - c * .5); J.rodilla[1].rotation.x = .1 + .2 * paso * (1 - c); J.muslo[0].rotation.x = -.04 - .1 * paso * (1 - c);
      caderas.position.y = Math.max(extLeg(-J.muslo[0].rotation.x, J.rodilla[0].rotation.x), extLeg(-J.muslo[1].rotation.x, J.rodilla[1].rotation.x)); piesPlanos();
      // giro rígido alrededor del talón de atrás P = (0, 0, pz): pos = P − R·P (+ el espesor de la espalda al quedar acostado)
      const pz = -.15 - .45 * paso, sa = Math.sin(a), ca = Math.cos(a); cuerpo.rotation.set(a, 0, 0); cuerpo.position.set(0, pz * sa + .14 * (1 - ca), pz - pz * ca);
      for (const s of [0, 1]) { J.hombro[s].rotation.x += .25 * c; J.hombro[s].rotation.z += (s ? -1 : 1) * .18 * c } dedos(0, .5 + .4 * c); dedos(1, .5 + .4 * c); faldaDeforma(ST.t) },
    aura(on, k = 1) { ST.aura = !!on; AURA.visible = !!on; LUZ_FRIA.intensity = on ? 7 * k : 0; LUZ_PIES.intensity = on ? 4 * k : 0; if (!on) return; auraTick(ST.t, k);
      if (typeof velasHacia === "function") velasHacia(API.headW().toArray(), k) },
    headW() { CAB.updateWorldMatrix(true, false); return CAB.localToWorld(new T3.Vector3(HCEN[0], HCEN[1], HCEN[2])) },
    ojoW(lado = 1) { const e = J.ojos[lado > 0 ? 0 : 1]; e.updateWorldMatrix(true, false); return e.getWorldPosition(new T3.Vector3()) },
    ojoDir() { cabeza.updateWorldMatrix(true, false); return new T3.Vector3(0, 0, 1).applyQuaternion(cabeza.getWorldQuaternion(new T3.Quaternion())) },
    ojoCam(d = .08, lado = 1) { return API.ojoW(lado).addScaledVector(API.ojoDir(), d).toArray() },
    caraCam(d = 1, ang = 0, dy = 0) { const h = API.headW(), q = cabeza.getWorldQuaternion(new T3.Quaternion()), f = new T3.Vector3(Math.sin(ang), 0, Math.cos(ang)).applyQuaternion(q); return [h.x + f.x * d, h.y + f.y * d + dy, h.z + f.z * d] } };
  return API;
})();
