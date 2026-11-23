// Dibujo: formas con contorno, los dos personajes, herramientas, partículas y el cartel de arriba.
// Estilo: vector plano, contorno oscuro (nunca negro puro), degradé suave, brillo arriba a la izquierda.
(() => {
  const TAU = Math.PI * 2, INK = '#3b1630', INK2 = '#15102e';
  const D = M.D = {};

  D.rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
  D.oval = (c, x, y, rx, ry, rot = 0) => { c.beginPath(); c.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot, 0, TAU); };
  D.fs = (c, fill, stroke, lw) => { if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 5; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); } };
  D.lg = (c, x0, y0, x1, y1, stops) => { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach((s, i) => g.addColorStop(Array.isArray(s) ? s[0] : i / (stops.length - 1), Array.isArray(s) ? s[1] : s)); return g; };
  D.rg = (c, x, y, r0, r1, stops) => { const g = c.createRadialGradient(x, y, r0, x, y, r1); stops.forEach((s, i) => g.addColorStop(Array.isArray(s) ? s[0] : i / (stops.length - 1), Array.isArray(s) ? s[1] : s)); return g; };
  D.star = (c, x, y, r, n = 4, inner = 0.38, rot = 0) => { c.beginPath(); for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n - Math.PI / 2, q = i % 2 ? r * inner : r; c.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } c.closePath(); };
  D.heart = (c, x, y, s) => { c.beginPath(); c.moveTo(x, y + s * 0.9); c.bezierCurveTo(x - s * 1.5, y - s * 0.1, x - s * 0.7, y - s * 1.1, x, y - s * 0.35); c.bezierCurveTo(x + s * 0.7, y - s * 1.1, x + s * 1.5, y - s * 0.1, x, y + s * 0.9); c.closePath(); };

  // ---------- MOMO (bolita de mochi rosa) ----------
  // b: {x,y,r,sq,ang}  o: {face, lx, ly (mirada -1..1), blink}
  D.momo = (c, b, o = {}) => {
    const r = b.r, face = o.face || 'smile', lw = Math.max(3.5, r * 0.075);
    c.save(); c.translate(b.x, b.y + r * b.sq * 0.9); c.rotate(b.ang || 0); c.scale(1 + b.sq * 0.8, 1 - b.sq);
    // aro claro por fuera (separa a cada bolita dentro de la pila)
    D.oval(c, 0, 0, r + lw * 0.9, r + lw * 0.9); D.fs(c, 'rgba(255,244,248,.85)');
    D.oval(c, 0, 0, r, r); D.fs(c, D.rg(c, -r * 0.3, -r * 0.38, r * 0.05, r * 1.25, ['#fff0f4', [0.45, '#ffc3d4'], [0.85, '#f79ab8'], '#e87fa4']), INK, lw);
    c.save(); D.oval(c, 0, 0, r - lw * 0.5, r - lw * 0.5); c.clip();
    D.oval(c, r * 0.12, r * 0.95, r * 1.0, r * 0.42); D.fs(c, 'rgba(214,92,140,.33)');            // sombra propia abajo
    D.oval(c, -r * 0.42, -r * 0.5, r * 0.26, r * 0.15, -0.6); D.fs(c, 'rgba(255,255,255,.82)');    // brillo
    D.oval(c, -r * 0.66, -r * 0.24, r * 0.06, r * 0.05); D.fs(c, 'rgba(255,255,255,.7)');
    c.restore();
    // rulito (seña del personaje)
    c.beginPath(); c.moveTo(-r * 0.04, -r * 0.97); c.bezierCurveTo(-r * 0.1, -r * 1.3, r * 0.3, -r * 1.34, r * 0.24, -r * 1.12); c.bezierCurveTo(r * 0.2, -r * 1.0, r * 0.06, -r * 1.08, r * 0.12, -r * 1.17);
    D.fs(c, null, INK, lw * 0.95);
    // cara
    const lx = (o.lx || 0) * r * 0.07, ly = (o.ly || 0) * r * 0.06, ex = r * 0.27, ey = -r * 0.04 + ly;
    D.oval(c, -r * 0.52 + lx * 0.5, r * 0.2 + ly, r * 0.15, r * 0.09); D.fs(c, 'rgba(255,92,138,.5)');
    D.oval(c, r * 0.52 + lx * 0.5, r * 0.2 + ly, r * 0.15, r * 0.09); D.fs(c, 'rgba(255,92,138,.5)');
    const eye = (sx) => {
      const x = sx * ex + lx;
      if (o.blink || face === 'kiss') { c.beginPath(); c.moveTo(x - r * 0.1, ey); c.quadraticCurveTo(x, ey + r * 0.07, x + r * 0.1, ey); D.fs(c, null, INK, lw * 0.8); return; }
      if (face === 'laugh') { c.beginPath(); c.moveTo(x - r * 0.11, ey + r * 0.04); c.quadraticCurveTo(x, ey - r * 0.13, x + r * 0.11, ey + r * 0.04); D.fs(c, null, INK, lw * 0.85); return; }
      const big = face === 'wow' ? 1.35 : 1;
      D.oval(c, x, ey, r * 0.085 * big, r * 0.12 * big); D.fs(c, INK);
      D.oval(c, x - r * 0.025, ey - r * 0.045 * big, r * 0.032 * big, r * 0.04 * big); D.fs(c, '#fff');
    };
    eye(-1); eye(1);
    const mx = lx, my = r * 0.24 + ly;
    if (face === 'smile') { c.beginPath(); c.moveTo(mx - r * 0.09, my - r * 0.02); c.quadraticCurveTo(mx, my + r * 0.09, mx + r * 0.09, my - r * 0.02); D.fs(c, null, INK, lw * 0.8); }
    else if (face === 'o' || face === 'wow') { D.oval(c, mx, my + r * 0.03, r * (face === 'wow' ? 0.085 : 0.06), r * (face === 'wow' ? 0.115 : 0.075)); D.fs(c, '#7a2440', INK, lw * 0.6); }
    else if (face === 'laugh') { c.beginPath(); c.moveTo(mx - r * 0.15, my - r * 0.03); c.quadraticCurveTo(mx, my + r * 0.3, mx + r * 0.15, my - r * 0.03); c.closePath(); D.fs(c, '#7a2440', INK, lw * 0.65); D.oval(c, mx, my + r * 0.1, r * 0.06, r * 0.035); D.fs(c, '#ff7f9a'); }
    else if (face === 'kiss') { c.beginPath(); c.arc(mx + r * 0.02, my + r * 0.02, r * 0.045, -1.9, 1.9); D.fs(c, null, INK, lw * 0.8); }
    c.restore();
  };

  // ---------- BRIK (bloque gruñón) ----------
  // k: {x,y,r,sq,ang}  o: {face, lx, ly, red (0..1), blink}
  D.brik = (c, k, o = {}) => {
    const r = k.r, face = o.face || 'grin', lw = Math.max(5, r * 0.075), s = r * 0.94, cr = r * 0.34, red = o.red || 0;
    c.save(); c.translate(k.x, k.y + r * (k.sq || 0) * 0.9); c.rotate(k.ang || 0); c.scale(1 + (k.sq || 0) * 0.8, 1 - (k.sq || 0));
    // aro naranja que brilla
    c.save(); c.shadowColor = red > 0.5 ? '#ff3d2e' : '#ff8a3c'; c.shadowBlur = r * 0.32; D.rr(c, -s - lw, -s - lw, (s + lw) * 2, (s + lw) * 2, cr + lw); D.fs(c, red > 0.5 ? '#ff5a3c' : '#ff9a45'); c.restore();
    // pies
    if (!o.noFeet) { D.oval(c, -s * 0.45, s + lw * 0.6, r * 0.2, r * 0.1); D.fs(c, INK2); D.oval(c, s * 0.45, s + lw * 0.6, r * 0.2, r * 0.1); D.fs(c, INK2); }
    D.rr(c, -s, -s, s * 2, s * 2, cr);
    const mix = (a, b) => { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * red)).join(',') + ')'; };
    D.fs(c, D.lg(c, -s, -s, s * 0.4, s, [mix('#6b58c9', '#e0524a'), [0.5, mix('#4a3a9c', '#b8322f')], mix('#30246e', '#7d1f2a')]), INK2, lw);
    c.save(); D.rr(c, -s + lw * 0.5, -s + lw * 0.5, s * 2 - lw, s * 2 - lw, cr - lw * 0.5); c.clip();
    D.oval(c, s * 0.2, s * 1.05, s * 1.2, s * 0.42); D.fs(c, 'rgba(15,8,50,.32)');
    D.rr(c, -s * 0.78, -s * 0.82, s * 0.62, s * 0.2, s * 0.1); D.fs(c, 'rgba(255,255,255,.28)');
    c.restore();
    // curita (detalle de regalo)
    c.save(); c.translate(s * 0.62, -s * 0.66); c.rotate(0.6); D.rr(c, -r * 0.2, -r * 0.075, r * 0.4, r * 0.15, r * 0.07); D.fs(c, '#f6c9a0', INK2, lw * 0.45); D.rr(c, -r * 0.06, -r * 0.05, r * 0.12, r * 0.1, r * 0.02); D.fs(c, '#e2a878'); c.restore();
    // cara
    const lx = (o.lx || 0) * r * 0.07, ly = (o.ly || 0) * r * 0.06, ex = r * 0.33, ey = -r * 0.1 + ly;
    const eyeR = { shock: 0.25, dizzy: 0.2, tired: 0.17 }[face] || 0.19;
    const eye = (sx) => {
      const x = sx * ex + lx;
      if (o.blink || face === 'tired') { c.beginPath(); c.moveTo(x - r * 0.15, ey + r * 0.02); c.lineTo(x + r * 0.15, ey + r * 0.02); D.fs(c, null, INK2, lw * 0.9); if (face === 'tired') { c.beginPath(); c.arc(x, ey + r * 0.08, r * 0.13, 0.3, Math.PI - 0.3); D.fs(c, null, 'rgba(21,16,46,.5)', lw * 0.5); } return; }
      if (face === 'dizzy') { c.beginPath(); for (let a = 0; a < 11; a += 0.3) c.lineTo(x + Math.cos(a + (o.t || 0) * 8 * sx) * a * r * 0.016, ey + Math.sin(a + (o.t || 0) * 8 * sx) * a * r * 0.016); D.fs(c, null, '#ffd84a', lw * 0.7); return; }
      D.oval(c, x, ey, r * eyeR * 0.82, r * eyeR); D.fs(c, face === 'shock' ? '#fff' : '#ffd84a', INK2, lw * 0.6);
      const pr = face === 'shock' ? 0.045 : 0.085; D.oval(c, x + lx * 1.3, ey + ly * 1.2, r * pr, r * pr * 1.25); D.fs(c, INK2);
      if (face !== 'shock') { D.oval(c, x + lx * 1.3 - r * 0.03, ey + ly * 1.2 - r * 0.04, r * 0.028, r * 0.028); D.fs(c, '#fff'); }
    };
    eye(-1); eye(1);
    // cejas gruesas: el ángulo dice la emoción
    const brow = { grin: [0.38, 0.38], sly: [0.42, 0.1], angry: [0.55, 0.55], furious: [0.7, 0.7], confused: [-0.25, 0.35], shock: [-0.3, -0.3], tired: [-0.35, -0.35], dizzy: [-0.2, -0.2], blush: [0.25, 0.25], manic: [0.5, 0.5] }[face] || [0.3, 0.3];
    const by = ey - r * (face === 'shock' ? 0.42 : 0.3);
    [-1, 1].forEach((sx, i) => { const a = brow[i] * sx; c.save(); c.translate(sx * ex + lx, by - (face === 'confused' && i === 0 ? r * 0.1 : 0)); c.rotate(a); D.rr(c, -r * 0.2, -r * 0.055, r * 0.4, r * 0.11, r * 0.05); D.fs(c, INK2); c.restore(); });
    // boca
    const mx = lx, my = r * 0.38 + ly;
    const teeth = (w, h, up) => { c.beginPath(); if (up) { c.moveTo(mx - w, my + h); c.quadraticCurveTo(mx, my - h * 1.3, mx + w, my + h); c.quadraticCurveTo(mx, my + h * 0.3, mx - w, my + h); } else { c.moveTo(mx - w, my - h * 0.5); c.quadraticCurveTo(mx, my + h * 0.1, mx + w, my - h * 0.5); c.quadraticCurveTo(mx + w * 0.7, my + h * 1.5, mx, my + h * 1.5); c.quadraticCurveTo(mx - w * 0.7, my + h * 1.5, mx - w, my - h * 0.5); } c.closePath(); D.fs(c, '#fff', INK2, lw * 0.6); c.beginPath(); for (let i = -1; i <= 1; i++) { c.moveTo(mx + i * w * 0.45, my - h * 0.4); c.lineTo(mx + i * w * 0.45, my + h * 1.4); } c.save(); c.clip && 0; D.fs(c, null, 'rgba(21,16,46,.55)', lw * 0.35); c.restore(); };
    if (face === 'grin' || face === 'manic') teeth(r * (face === 'manic' ? 0.48 : 0.4), r * 0.16);
    else if (face === 'sly') { c.beginPath(); c.moveTo(mx - r * 0.25, my + r * 0.02); c.quadraticCurveTo(mx + r * 0.05, my + r * 0.16, mx + r * 0.3, my - r * 0.1); D.fs(c, null, INK2, lw * 0.85); }
    else if (face === 'angry') teeth(r * 0.34, r * 0.12, true);
    else if (face === 'furious') { D.rr(c, mx - r * 0.36, my - r * 0.12, r * 0.72, r * 0.42, r * 0.12); D.fs(c, '#5a1020', INK2, lw * 0.6); D.rr(c, mx - r * 0.3, my - r * 0.1, r * 0.6, r * 0.1, r * 0.03); D.fs(c, '#fff'); D.oval(c, mx, my + r * 0.24, r * 0.16, r * 0.08); D.fs(c, '#ff6f7f'); }
    else if (face === 'confused') { c.beginPath(); c.moveTo(mx - r * 0.18, my + r * 0.06); c.quadraticCurveTo(mx - r * 0.05, my - r * 0.06, mx + r * 0.06, my + r * 0.05); c.quadraticCurveTo(mx + r * 0.14, my + r * 0.11, mx + r * 0.2, my); D.fs(c, null, INK2, lw * 0.85); }
    else if (face === 'shock') { D.oval(c, mx, my + r * 0.1, r * 0.17, r * 0.24); D.fs(c, '#5a1020', INK2, lw * 0.6); D.oval(c, mx, my + r * 0.22, r * 0.09, r * 0.07); D.fs(c, '#ff6f7f'); }
    else if (face === 'tired' || face === 'dizzy') { c.beginPath(); c.moveTo(mx - r * 0.22, my + r * 0.1); c.quadraticCurveTo(mx - r * 0.1, my - r * 0.02, mx, my + r * 0.08); c.quadraticCurveTo(mx + r * 0.1, my + r * 0.18, mx + r * 0.22, my + r * 0.06); D.fs(c, null, INK2, lw * 0.85); }
    else if (face === 'blush') { c.beginPath(); c.moveTo(mx - r * 0.16, my + r * 0.08); c.quadraticCurveTo(mx, my - r * 0.04, mx + r * 0.16, my + r * 0.08); D.fs(c, null, INK2, lw * 0.85); D.oval(c, -r * 0.6, r * 0.2, r * 0.16, r * 0.09); D.fs(c, 'rgba(255,110,150,.75)'); D.oval(c, r * 0.6, r * 0.2, r * 0.16, r * 0.09); D.fs(c, 'rgba(255,110,150,.75)'); }
    c.restore();
  };
  // mano flotante (manopla): un círculo con contorno
  D.hand = (c, x, y, r) => { D.oval(c, x, y, r, r); D.fs(c, D.rg(c, x - r * 0.3, y - r * 0.3, 1, r * 1.3, ['#7d6ad6', '#3b2c86']), INK2, Math.max(4, r * 0.22)); };

  // ---------- HERRAMIENTAS ----------
  const METAL = (c, x0, y0, x1, y1) => D.lg(c, x0, y0, x1, y1, ['#f4f8ff', [0.35, '#c5cfe0'], [0.6, '#8f9bb5'], '#dfe6f2']);
  // alfiler: punta en (0,0), apunta hacia -x local. len = largo
  D.pin = (c, x, y, ang, len) => { c.save(); c.translate(x, y); c.rotate(ang); c.beginPath(); c.moveTo(0, 0); c.lineTo(len * 0.25, -len * 0.035); c.lineTo(len, -len * 0.035); c.lineTo(len, len * 0.035); c.lineTo(len * 0.25, len * 0.035); c.closePath(); D.fs(c, METAL(c, 0, -len * 0.04, 0, len * 0.04), INK2, 4); D.oval(c, len * 1.06, 0, len * 0.14, len * 0.14); D.fs(c, D.rg(c, len * 1.02, -len * 0.05, 1, len * 0.2, ['#ff9a9a', '#e8323c', '#a8141f']), INK2, 4.5); D.oval(c, len * 1.02, -len * 0.05, len * 0.04, len * 0.03); D.fs(c, 'rgba(255,255,255,.8)'); c.restore(); };
  // tenedor gigante: puntas en x=0 hacia -x local
  D.fork = (c, x, y, ang, len) => { c.save(); c.translate(x, y); c.rotate(ang); const w = len * 0.2; c.beginPath(); [-1, 0, 1].forEach((i) => { const yy = i * w * 0.72; c.moveTo(len * 0.36, yy - w * 0.17); c.lineTo(len * 0.04, yy - w * 0.12); c.lineTo(0, yy); c.lineTo(len * 0.04, yy + w * 0.12); c.lineTo(len * 0.36, yy + w * 0.17); c.closePath(); }); D.fs(c, METAL(c, 0, -w, 0, w), INK2, 5);
    c.beginPath(); c.moveTo(len * 0.33, -w); c.quadraticCurveTo(len * 0.5, -w, len * 0.58, -w * 0.18); c.lineTo(len * 0.72, -w * 0.14); c.lineTo(len * 0.72, w * 0.14); c.lineTo(len * 0.58, w * 0.18); c.quadraticCurveTo(len * 0.5, w, len * 0.33, w); c.closePath(); D.fs(c, METAL(c, 0, -w, 0, w), INK2, 5);
    D.rr(c, len * 0.7, -w * 0.24, len * 0.42, w * 0.48, w * 0.2); D.fs(c, D.lg(c, 0, -w * 0.24, 0, w * 0.24, ['#e9a45c', '#b86a2c']), INK2, 5); c.beginPath(); for (let i = 1; i < 4; i++) { c.moveTo(len * (0.7 + i * 0.1), -w * 0.2); c.lineTo(len * (0.7 + i * 0.1), w * 0.2); } D.fs(c, null, 'rgba(90,40,10,.45)', 3); c.restore(); };
  // bola con púas (radio r), con cadena hacia arriba si chain>0
  D.spikeBall = (c, x, y, r, rot, chain) => {
    if (chain) { for (let yy = y - r * 1.1; yy > y - r - chain; yy -= 44) { D.oval(c, x, yy, 13, 22); D.fs(c, null, INK2, 13); D.oval(c, x, yy, 13, 22); D.fs(c, null, '#aab4c8', 6); } }
    c.save(); c.translate(x, y); c.rotate(rot || 0);
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; c.save(); c.rotate(a); c.beginPath(); c.moveTo(r * 0.86, -r * 0.17); c.lineTo(r * 1.36, 0); c.lineTo(r * 0.86, r * 0.17); c.closePath(); D.fs(c, METAL(c, 0, -r * 0.17, 0, r * 0.17), INK2, 5); c.restore(); }
    D.oval(c, 0, 0, r, r); D.fs(c, D.rg(c, -r * 0.35, -r * 0.4, r * 0.05, r * 1.3, ['#8e98b4', [0.5, '#515a78'], '#272b45']), INK2, 7);
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + 0.4; c.save(); c.translate(Math.cos(a) * r * 0.52, Math.sin(a) * r * 0.52); c.beginPath(); c.moveTo(-r * 0.13, r * 0.09); c.lineTo(0, -r * 0.2); c.lineTo(r * 0.13, r * 0.09); c.closePath(); D.fs(c, '#dfe6f2', INK2, 4); c.restore(); }
    c.restore();
    D.oval(c, x - r * 0.4, y - r * 0.45, r * 0.22, r * 0.12, -0.6); D.fs(c, 'rgba(255,255,255,.4)');
  };
  // cartel colgado (texto dentro del mundo)
  D.tag = (c, x, y, txt, rot) => { c.save(); c.translate(x, y); c.rotate(rot || 0); c.font = '800 34px Baloo'; const w = c.measureText(txt).width + 36; c.beginPath(); c.moveTo(0, -30); c.lineTo(0, 0); D.fs(c, null, INK2, 4); D.rr(c, -w / 2, 0, w, 52, 10); D.fs(c, '#ffe14d', INK2, 5); c.fillStyle = INK2; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 0, 29); c.restore(); };
  // rodillo con púas + tractorcito. (x,y) = centro del rodillo, r = radio
  D.roller = (c, x, y, r, rot, bounce) => {
    c.save(); c.translate(x, y + (bounce || 0));
    // chasis detrás
    D.rr(c, r * 0.2, -r * 1.75, r * 2.5, r * 1.25, r * 0.22); D.fs(c, D.lg(c, 0, -r * 1.75, 0, -r * 0.5, ['#ffd24a', '#f29a1f']), INK2, 7);
    D.rr(c, r * 0.4, -r * 1.58, r * 2.1, r * 0.18, r * 0.09); D.fs(c, 'rgba(255,255,255,.4)');
    for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(r * (0.45 + i * 0.44), -r * 0.62); c.lineTo(r * (0.7 + i * 0.44), -r * 0.62); c.lineTo(r * (0.5 + i * 0.44), -r * 0.86); c.lineTo(r * (0.25 + i * 0.44), -r * 0.86); c.closePath(); D.fs(c, 'rgba(21,16,46,.8)'); }
    D.rr(c, r * 2.2, -r * 2.3, r * 0.16, r * 0.6, 6); D.fs(c, '#5b6480', INK2, 5);   // escape
    // rueda trasera
    c.save(); c.translate(r * 2.25, r * 0.28); c.rotate(rot * 1.4); D.oval(c, 0, 0, r * 0.72, r * 0.72); D.fs(c, '#2b2a44', INK2, 7); D.oval(c, 0, 0, r * 0.36, r * 0.36); D.fs(c, '#ffd24a', INK2, 5); for (let i = 0; i < 8; i++) { c.save(); c.rotate(i / 8 * TAU); D.rr(c, r * 0.6, -r * 0.07, r * 0.2, r * 0.14, 3); D.fs(c, '#15102e'); c.restore(); } c.restore();
    // brazo al rodillo
    c.beginPath(); c.moveTo(r * 0.9, -r * 0.6); c.lineTo(0, 0); D.fs(c, null, INK2, 26); c.beginPath(); c.moveTo(r * 0.9, -r * 0.6); c.lineTo(0, 0); D.fs(c, null, '#f29a1f', 13);
    // rodillo
    c.save(); c.rotate(rot);
    for (let i = 0; i < 12; i++) { c.save(); c.rotate(i / 12 * TAU); c.beginPath(); c.moveTo(r * 0.88, -r * 0.16); c.lineTo(r * 1.3, 0); c.lineTo(r * 0.88, r * 0.16); c.closePath(); D.fs(c, METAL(c, 0, -r * 0.16, 0, r * 0.16), INK2, 5); c.restore(); }
    D.oval(c, 0, 0, r, r); D.fs(c, D.rg(c, -r * 0.3, -r * 0.35, r * 0.05, r * 1.3, ['#a7b0c8', [0.55, '#646d8c'], '#33375a']), INK2, 7);
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; D.oval(c, Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.6, r * 0.09, r * 0.09); D.fs(c, '#dfe6f2', INK2, 3.5); }
    D.oval(c, 0, 0, r * 0.2, r * 0.2); D.fs(c, '#f29a1f', INK2, 5);
    c.restore(); c.restore();
  };
  D.remote = (c, x, y, s, pressed) => { c.save(); c.translate(x, y); c.rotate(-0.25); D.rr(c, -s * 0.5, -s * 0.7, s, s * 1.4, s * 0.16); D.fs(c, D.lg(c, 0, -s * 0.7, 0, s * 0.7, ['#69728f', '#3a4060']), INK2, 5); D.oval(c, 0, -s * 0.12 + (pressed ? s * 0.05 : 0), s * 0.3, s * 0.3); D.fs(c, D.rg(c, -s * 0.08, -s * 0.2, 1, s * 0.4, pressed ? ['#ffb0b0', '#ff4a4a'] : ['#ff8f8f', '#e0242e', '#a3101a']), INK2, 4); c.beginPath(); c.moveTo(s * 0.25, -s * 0.7); c.lineTo(s * 0.4, -s * 1.3); D.fs(c, null, INK2, 6); D.oval(c, s * 0.4, -s * 1.34, s * 0.1, s * 0.1); D.fs(c, pressed ? '#ff4a4a' : '#ffd84a', INK2, 3.5); c.restore(); };

  // ---------- PARTÍCULAS ----------
  // p: {k, x, y, vx, vy, t0, life, s, rot, vr, col, g, txt}
  M.Parts = class {
    constructor() { this.p = []; }
    add(o) { this.p.push(Object.assign({ vx: 0, vy: 0, life: 0.6, s: 20, rot: 0, vr: 0, g: 0, col: '#fff' }, o)); }
    burst(x, y, n, rnd, o) { for (let i = 0; i < n; i++) { const a = rnd() * TAU, sp = (o.sp || 600) * (0.35 + rnd() * 0.75); this.add(Object.assign({}, o, { x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (o.up || 0), s: (o.s || 18) * (0.6 + rnd() * 0.8), rot: rnd() * TAU, vr: (rnd() - 0.5) * 14, life: (o.life || 0.6) * (0.7 + rnd() * 0.6), col: Array.isArray(o.col) ? o.col[Math.floor(rnd() * o.col.length)] : o.col })); } }
    step(dt, t) { for (const p of this.p) { p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; if (p.drag) { p.vx *= 1 - p.drag * dt; p.vy *= 1 - p.drag * dt; } } this.p = this.p.filter((p) => t - p.t0 < p.life); }
    draw(c, t, layer) {
      for (const p of this.p) { if ((p.layer || 0) !== layer) continue; const u = (t - p.t0) / p.life; if (u < 0) continue; const a = 1 - Math.pow(u, 2.2);
        c.save(); c.globalAlpha = M.clamp(a, 0, 1);
        if (p.k === 'ring') { D.oval(c, p.x, p.y, p.s * (0.3 + M.out(u) * 1.0), p.s * (0.3 + M.out(u) * 1.0)); D.fs(c, null, p.col, Math.max(1, p.w * (1 - u))); }
        else if (p.k === 'star') { D.star(c, p.x, p.y, p.s * (1 - u * 0.5), 4, 0.36, p.rot); D.fs(c, p.col, INK, Math.max(2, p.s * 0.14)); }
        else if (p.k === 'conf') { c.translate(p.x, p.y); c.rotate(p.rot); c.scale(1, Math.cos(p.rot * 2.3)); D.rr(c, -p.s * 0.5, -p.s * 0.3, p.s, p.s * 0.6, p.s * 0.12); D.fs(c, p.col); }
        else if (p.k === 'puff') { const s = p.s * (0.6 + M.out(u) * 0.8); D.oval(c, p.x, p.y, s, s); D.fs(c, p.col, p.ink === false ? null : 'rgba(59,22,48,.55)', 3.5); }
        else if (p.k === 'heart') { D.heart(c, p.x, p.y, p.s * M.back(Math.min(1, u * 4))); D.fs(c, p.col, INK, 4.5); }
        else if (p.k === 'drop') { c.translate(p.x, p.y); c.rotate(Math.atan2(p.vy, p.vx) - Math.PI / 2); c.beginPath(); c.moveTo(0, -p.s); c.quadraticCurveTo(p.s * 0.7, p.s * 0.3, 0, p.s * 0.6); c.quadraticCurveTo(-p.s * 0.7, p.s * 0.3, 0, -p.s); D.fs(c, p.col, INK2, 3); }
        else if (p.k === 'txt') { c.translate(p.x, p.y); c.rotate(p.rot0 || 0); const s = p.s * M.back(Math.min(1, u * 5)); c.font = '800 ' + s + 'px Baloo'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.strokeStyle = p.ink || INK2; c.lineWidth = s * 0.26; c.strokeText(p.txt, 0, 0); c.fillStyle = p.col; c.fillText(p.txt, 0, 0); }
        else if (p.k === 'note') { c.translate(p.x + Math.sin((t - p.t0) * 5 + p.rot) * 14, p.y); c.rotate(Math.sin((t - p.t0) * 4) * 0.25); D.oval(c, 0, 0, p.s * 0.42, p.s * 0.32, -0.4); D.fs(c, p.col, INK, 4); c.beginPath(); c.moveTo(p.s * 0.36, -p.s * 0.05); c.lineTo(p.s * 0.36, -p.s * 1.1); c.quadraticCurveTo(p.s * 0.8, -p.s * 1.0, p.s * 0.85, -p.s * 0.6); D.fs(c, null, INK, 9); c.beginPath(); c.moveTo(p.s * 0.36, -p.s * 0.05); c.lineTo(p.s * 0.36, -p.s * 1.1); c.quadraticCurveTo(p.s * 0.8, -p.s * 1.0, p.s * 0.85, -p.s * 0.6); D.fs(c, null, p.col, 4); }
        else if (p.k === 'scrap') { c.translate(p.x, p.y); c.rotate(p.rot); c.beginPath(); c.moveTo(-p.s, p.s * 0.4); c.lineTo(0, -p.s * 0.8); c.lineTo(p.s, p.s * 0.5); c.closePath(); D.fs(c, p.col, INK2, 4); }
        c.restore(); }
    }
  };

  // ---------- CARTEL DE ARRIBA (título + contador) ----------
  // o: {l1, w1, w2, col1, col2, n, bump (0..1), icon:'momo'|'brik', pop (0..1 entrada)}
  D.hud = (c, o) => {
    const txt = (s, x, y, size, fill, lw, al) => { c.font = '800 ' + size + 'px Baloo'; c.textAlign = al || 'center'; c.textBaseline = 'alphabetic'; c.lineJoin = 'round'; c.strokeStyle = INK2; c.lineWidth = lw; c.strokeText(s, x, y + lw * 0.3); c.strokeText(s, x, y); c.fillStyle = fill; c.fillText(s, x, y); };
    c.save(); c.translate(540, 250); const e = M.back(M.clamp(o.pop === undefined ? 1 : o.pop, 0, 1)); c.scale(0.7 + 0.3 * e, 0.7 + 0.3 * e); c.translate(-540, -250);
    txt(o.l1, 540, 172, 66, '#ffffff', 16);
    c.font = '800 132px Baloo'; const a = c.measureText(o.w1 + ' ').width, b = c.measureText(o.w2).width, x0 = 540 - (a + b) / 2;
    txt(o.w1, x0, 286, 132, D.lg(c, 0, 190, 0, 290, o.col1), 24, 'left'); txt(o.w2, x0 + a, 286, 132, D.lg(c, 0, 190, 0, 290, o.col2), 24, 'left');
    c.restore();
    // contador
    const s = 1 + 0.35 * (o.bump || 0); c.save(); c.translate(540, 366); c.scale(s, s); c.font = '800 84px Baloo'; const w = c.measureText(String(o.n)).width, tot = w + 92;
    if (o.icon === 'brik') D.brik(c, { x: -tot / 2 + 34, y: -4, r: 31 }, { face: 'shock', noFeet: true }); else D.momo(c, { x: -tot / 2 + 34, y: -2, r: 33, sq: 0, ang: 0 }, { face: 'smile' });
    txt(String(o.n), -tot / 2 + 88, 28, 84, '#ffffff', 17, 'left'); c.restore();
  };
})();
