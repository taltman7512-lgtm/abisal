// Fondo «patio soleado»: capas pintadas una sola vez (cielo, lejos, medio, pasto, primer plano) + cosas vivas
// (nubes, molino, humo). Las capas se mueven distinto con la cámara (paralaje) para dar profundidad.
(() => {
  const D = M.D, INK = '#2c2440', HZ = 1130;   // HZ = línea donde el pasto toca la cerca
  const F = M.Fondo = {};
  const layer = (S, fn, blur) => { const cv = document.createElement('canvas'); cv.width = M.W * S * 1.3; cv.height = M.H * S; const c = cv.getContext('2d'); c.scale(S, S); c.translate(M.W * 0.15, 0); if (blur) c.filter = 'blur(' + blur + 'px)'; fn(c); return cv; };
  const cloud = (c, x, y, s, a) => { c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(s, s);
    c.beginPath(); c.moveTo(-150, 40); c.arc(-110, 5, 48, Math.PI * 0.6, Math.PI * 1.5); c.arc(-45, -40, 62, Math.PI * 1.05, Math.PI * 1.85); c.arc(40, -22, 54, Math.PI * 1.3, Math.PI * 0.05); c.arc(105, 12, 40, Math.PI * 1.45, Math.PI * 0.5); c.lineTo(-150, 52); c.closePath();
    c.fillStyle = D.lg(c, 0, -100, 0, 55, ['#ffffff', [0.6, '#ffffff'], '#cfe6fb']); c.fill(); c.restore(); };
  const tree = (c, x, y, s, col) => { c.save(); c.translate(x, y); c.scale(s, s);
    D.rr(c, -16, -150, 32, 160, 8); D.fs(c, D.lg(c, -16, 0, 16, 0, ['#a8683a', '#7a4524']), INK, 5);
    c.beginPath(); c.arc(-62, -190, 62, 0, 7); c.arc(58, -200, 68, 0, 7); c.arc(0, -262, 80, 0, 7); c.arc(-8, -180, 70, 0, 7); D.fs(c, null, INK, 10);
    c.beginPath(); c.arc(-62, -190, 62, 0, 7); c.arc(58, -200, 68, 0, 7); c.arc(0, -262, 80, 0, 7); c.arc(-8, -180, 70, 0, 7); c.fillStyle = D.lg(c, -60, -340, 60, -120, col); c.fill();
    D.oval(c, -30, -285, 34, 20, -0.5); D.fs(c, 'rgba(255,255,255,.22)');
    [[-70, -175], [40, -165], [72, -230], [-20, -225], [10, -300]].forEach(([ax, ay]) => { D.oval(c, ax, ay, 13, 13); D.fs(c, '#ff5d5d', INK, 3.5); D.oval(c, ax - 4, ay - 4, 4, 3); D.fs(c, 'rgba(255,255,255,.7)'); });
    c.restore(); };
  const house = (c, x, y, s) => { c.save(); c.translate(x, y); c.scale(s, s);
    D.rr(c, 210, -560, 60, 150, 6); D.fs(c, '#c9785a', INK, 6); D.rr(c, 200, -572, 80, 26, 6); D.fs(c, '#a85a44', INK, 6);          // chimenea
    D.rr(c, -230, -330, 520, 340, 6); D.fs(c, D.lg(c, -230, 0, 290, 0, ['#fff3d6', [0.7, '#ffe6b8'], '#f2cf96']), INK, 6);            // pared
    c.beginPath(); c.moveTo(-280, -320); c.lineTo(-170, -520); c.lineTo(300, -520); c.lineTo(340, -320); c.closePath(); D.fs(c, D.lg(c, 0, -520, 0, -320, ['#ff8f6b', '#e2573f']), INK, 7);   // techo
    c.save(); c.clip(); c.strokeStyle = 'rgba(120,30,20,.35)'; c.lineWidth = 4; for (let r = 0; r < 4; r++) { const yy = -480 + r * 46; c.beginPath(); for (let i = -7; i < 9; i++) { c.moveTo(i * 46 + (r % 2) * 23, yy); c.arc(i * 46 + 23 + (r % 2) * 23, yy, 23, Math.PI, 0, true); } c.stroke(); } c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(-300, -520, 700, 22); c.restore();
    D.rr(c, -250, -332, 560, 20, 6); D.fs(c, '#fff', INK, 5);                                                                           // alero
    D.rr(c, 120, -210, 110, 220, [50, 50, 4, 4]); D.fs(c, D.lg(c, 120, 0, 230, 0, ['#4fb6a8', '#2f8f88']), INK, 6); D.oval(c, 210, -95, 9, 9); D.fs(c, '#ffd84a', INK, 3.5);   // puerta
    D.rr(c, 108, -4, 134, 16, 4); D.fs(c, '#d9c3a0', INK, 5);
    const win = (wx) => { D.rr(c, wx, -250, 130, 130, 8); D.fs(c, D.lg(c, wx, -250, wx + 130, -120, ['#bfeaff', '#7cc6f2']), INK, 6); c.beginPath(); c.moveTo(wx + 65, -250); c.lineTo(wx + 65, -120); c.moveTo(wx, -185); c.lineTo(wx + 130, -185); D.fs(c, null, '#fff', 9); c.beginPath(); c.moveTo(wx + 20, -150); c.lineTo(wx + 50, -235); D.fs(c, null, 'rgba(255,255,255,.6)', 8);
      D.rr(c, wx - 34, -252, 30, 134, 5); D.fs(c, '#4f86d9', INK, 5); D.rr(c, wx + 134, -252, 30, 134, 5); D.fs(c, '#4f86d9', INK, 5);
      D.rr(c, wx - 8, -118, 146, 30, 6); D.fs(c, '#b8713f', INK, 5); [0, 1, 2, 3].forEach((i) => { D.oval(c, wx + 14 + i * 34, -128, 13, 13); D.fs(c, ['#ff6b9a', '#ffd84a', '#ff8f4a', '#ff6b9a'][i], INK, 3.5); }); };
    win(-180);
    c.restore(); };
  const fence = (c, y) => { for (let x = -200; x < 1300; x += 62) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 150); c.lineTo(x + 24, y - 176); c.lineTo(x + 48, y - 150); c.lineTo(x + 48, y); c.closePath(); D.fs(c, D.lg(c, x, 0, x + 48, 0, ['#ffffff', '#e4ecf7']), '#5a5f80', 4.5); }
    c.fillStyle = 'rgba(90,95,128,.18)'; c.fillRect(-200, y - 122, 1500, 12); c.fillRect(-200, y - 52, 1500, 12); };
  const bush = (c, x, y, s) => { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.arc(-60, -30, 50, 0, 7); c.arc(0, -62, 62, 0, 7); c.arc(64, -34, 52, 0, 7); c.rect(-108, -30, 222, 34); D.fs(c, null, INK, 9); c.fillStyle = D.lg(c, 0, -120, 0, 0, ['#7fdc6a', '#3fae52']); c.fill(); D.oval(c, -14, -92, 26, 12, -0.3); D.fs(c, 'rgba(255,255,255,.25)'); c.restore(); };
  const shed = (c, x, y, s) => { c.save(); c.translate(x, y); c.scale(s, s); D.rr(c, -110, -190, 220, 194, 4); D.fs(c, D.lg(c, -110, 0, 110, 0, ['#d18a50', '#a8622f']), INK, 6); c.beginPath(); for (let i = -2; i <= 2; i++) { c.moveTo(i * 44, -186); c.lineTo(i * 44, 0); } D.fs(c, null, 'rgba(80,36,10,.35)', 3.5);
    c.beginPath(); c.moveTo(-140, -180); c.lineTo(0, -290); c.lineTo(140, -180); c.closePath(); D.fs(c, D.lg(c, 0, -290, 0, -180, ['#8a5bd6', '#6039ad']), INK, 7);
    D.rr(c, -44, -130, 88, 132, 4); D.fs(c, '#7a4524', INK, 5); c.beginPath(); c.moveTo(-44, -130); c.lineTo(44, 0); c.moveTo(44, -130); c.lineTo(-44, 0); D.fs(c, null, INK, 4.5);
    D.rr(c, -86, -250, 172, 44, 8); c.save(); c.translate(0, -1); D.fs(c, '#ffe14d', INK, 5); c.restore(); c.font = '800 30px Baloo'; c.fillStyle = INK; c.textAlign = 'center'; c.fillText('KEEP OUT', 0, -217); c.restore(); };

  F.build = (S) => {
    const R = M.rng(7);
    F.sky = layer(S, (c) => { c.fillStyle = D.lg(c, 0, 0, 0, HZ, ['#2f8fe8', [0.45, '#62b8f6'], [0.8, '#a9dcfb'], '#d9f1ff']); c.fillRect(-200, 0, 1500, HZ + 40);
      const g = D.rg(c, 880, 300, 10, 620, ['rgba(255,252,220,.95)', [0.12, 'rgba(255,246,190,.6)'], [0.4, 'rgba(255,240,170,.18)'], 'rgba(255,240,170,0)']); c.fillStyle = g; c.fillRect(-200, 0, 1500, 1200);
      D.oval(c, 880, 300, 78, 78); D.fs(c, '#fff7c2'); D.oval(c, 880, 300, 62, 62); D.fs(c, '#fffbe6'); });
    F.sky2 = layer(S, (c) => { c.fillStyle = D.lg(c, 0, 0, 0, HZ, ['#5b4fb8', [0.35, '#c264b0'], [0.62, '#ff8f6b'], [0.85, '#ffc56b'], '#ffe6a3']); c.fillRect(-200, 0, 1500, HZ + 40);
      const g = D.rg(c, 880, 760, 10, 760, ['rgba(255,250,210,1)', [0.1, 'rgba(255,225,150,.75)'], [0.45, 'rgba(255,170,110,.25)'], 'rgba(255,170,110,0)']); c.fillStyle = g; c.fillRect(-200, 0, 1500, 1300);
      D.oval(c, 880, 760, 92, 92); D.fs(c, '#fff3c0'); });
    F.far = layer(S, (c) => {
      c.beginPath(); c.moveTo(-200, HZ); c.lineTo(-200, 930); c.bezierCurveTo(60, 800, 300, 800, 520, 930); c.bezierCurveTo(700, 1030, 900, 840, 1300, 900); c.lineTo(1300, HZ); c.closePath(); c.fillStyle = D.lg(c, 0, 820, 0, HZ, ['#9fdcd0', '#bfeccf']); c.fill();
      c.beginPath(); c.moveTo(-200, HZ); c.lineTo(-200, 1010); c.bezierCurveTo(200, 900, 420, 1040, 640, 990); c.bezierCurveTo(860, 940, 1000, 900, 1300, 1000); c.lineTo(1300, HZ); c.closePath(); c.fillStyle = D.lg(c, 0, 900, 0, HZ, ['#7fd08f', '#a4e08f']); c.fill();
      for (let i = 0; i < 9; i++) { const x = -120 + i * 165 + R() * 60, y = 985 + R() * 40, s = 26 + R() * 16; D.rr(c, x - 4, y - s * 0.4, 8, s, 3); D.fs(c, '#6f9a70'); c.beginPath(); c.arc(x, y - s * 0.9, s, 0, 7); c.arc(x - s * 0.7, y - s * 0.4, s * 0.7, 0, 7); c.arc(x + s * 0.7, y - s * 0.4, s * 0.7, 0, 7); c.fillStyle = '#5fb878'; c.fill(); }
      // casitas lejanas
      [[330, 1000, '#ffd9b0', '#e8785c'], [930, 968, '#fff0d0', '#6f8fe0']].forEach(([x, y, w, rf]) => { D.rr(c, x - 44, y - 44, 88, 60, 3); D.fs(c, w, 'rgba(60,70,110,.5)', 3); c.beginPath(); c.moveTo(x - 56, y - 42); c.lineTo(x, y - 86); c.lineTo(x + 56, y - 42); c.closePath(); D.fs(c, rf, 'rgba(60,70,110,.5)', 3); D.rr(c, x - 10, y - 22, 20, 22, 2); D.fs(c, '#8fd0f2'); });
      // torre del molino (las aspas giran aparte)
      c.beginPath(); c.moveTo(600, 990); c.lineTo(618, 850); c.lineTo(662, 850); c.lineTo(680, 990); c.closePath(); D.fs(c, '#f4ecd8', 'rgba(60,70,110,.55)', 3.5); c.beginPath(); c.moveTo(610, 852); c.lineTo(640, 814); c.lineTo(670, 852); c.closePath(); D.fs(c, '#e8785c', 'rgba(60,70,110,.55)', 3.5); D.rr(c, 630, 940, 20, 50, [10, 10, 0, 0]); D.fs(c, '#a8683a');
      c.fillStyle = 'rgba(217,241,255,.28)'; c.fillRect(-200, 780, 1500, HZ - 780);   // bruma: lo lejano se aclara
    });
    F.mid = layer(S, (c) => {
      tree(c, 905, HZ - 96, 1.25, ['#8be36c', '#3fae52']);
      house(c, 250, HZ - 110, 0.92);
      bush(c, 20, HZ - 108, 1.0); bush(c, 610, HZ - 106, 0.8);
      shed(c, 955, HZ - 70, 0.82);
      fence(c, HZ + 6);
    });
    F.lawn = layer(S, (c) => {
      c.fillStyle = D.lg(c, 0, HZ, 0, 1920, ['#8fe36a', [0.25, '#6fd35c'], [0.7, '#4fbe55'], '#3aa64f']); c.fillRect(-200, HZ, 1500, 800);
      // franjas de cortadora en perspectiva
      c.fillStyle = 'rgba(190,255,150,.2)'; for (let i = -6; i < 7; i += 2) { c.beginPath(); c.moveTo(540 + i * 95, HZ); c.lineTo(540 + (i + 1) * 95, HZ); c.lineTo(540 + (i + 1) * 300, 1920); c.lineTo(540 + i * 300, 1920); c.closePath(); c.fill(); }
      c.fillStyle = D.lg(c, 0, HZ, 0, HZ + 90, ['rgba(30,90,60,.35)', 'rgba(30,90,60,0)']); c.fillRect(-200, HZ, 1500, 90);   // sombra de la cerca
      for (let i = 0; i < 150; i++) { const y = HZ + 30 + R() * R() * 640, x = -180 + R() * 1440, k = (y - HZ) / 700, s = 6 + k * 13;
        if (R() < 0.3) { const col = ['#ffffff', '#fff27a', '#ffb3d1'][Math.floor(R() * 3)]; for (let p = 0; p < 5; p++) { D.oval(c, x + Math.cos(p * 1.257) * s * 0.55, y + Math.sin(p * 1.257) * s * 0.4, s * 0.38, s * 0.3); D.fs(c, col); } D.oval(c, x, y, s * 0.26, s * 0.2); D.fs(c, '#ffb62e'); }
        else { c.beginPath(); c.moveTo(x - s * 0.7, y); c.quadraticCurveTo(x - s * 0.6, y - s, x - s * 0.9, y - s * 1.4); c.moveTo(x, y); c.lineTo(x, y - s * 1.7); c.moveTo(x + s * 0.7, y); c.quadraticCurveTo(x + s * 0.6, y - s, x + s * 0.9, y - s * 1.3); D.fs(c, null, R() < 0.5 ? 'rgba(40,130,70,.55)' : 'rgba(200,255,160,.5)', 2.5 + k * 2.5); } }
    });
    const blades = (c, n, y0, h, col, seed) => { const r = M.rng(seed); c.beginPath(); for (let i = 0; i < n; i++) { const x = -200 + i * (1500 / n) + r() * 16, hh = h * (0.45 + r() * 0.75), lean = (r() - 0.5) * 70, w = 9 + r() * 9; c.moveTo(x - w, y0 + 60); c.quadraticCurveTo(x - w * 0.4 + lean * 0.3, y0 - hh * 0.5, x + lean, y0 - hh); c.quadraticCurveTo(x + w * 0.8 + lean * 0.3, y0 - hh * 0.4, x + w, y0 + 60); } c.fillStyle = col; c.fill(); };
    F.fg1 = layer(S, (c) => { blades(c, 110, 1880, 120, '#2f9a4a', 3); c.fillStyle = '#2f9a4a'; c.fillRect(-200, 1900, 1500, 40); }, 1.5);
    F.fg2 = layer(S, (c) => { blades(c, 46, 1930, 250, '#17603a', 11); }, 5);
    F.S = S;
  };

  // t = segundos, cam = {x,y,z}, gold = 0..1 (atardecer)
  F.draw = (c, t, cam, gold, upTo) => {
    const W = M.W, H = M.H;
    const put = (cv, p, alpha) => { if (!alpha && alpha !== undefined) return; c.save(); c.globalAlpha = alpha === undefined ? 1 : alpha; F.par(c, cam, p); c.drawImage(cv, -W * 0.15, 0, W * 1.3, H); c.restore(); };
    if (upTo === 'back') {
      put(F.sky, 0.12); put(F.sky2, 0.12, gold);
      c.save(); F.par(c, cam, 0.2); const cl = [[120, 430, 1.0, 9], [700, 560, 0.7, 6], [-260, 700, 0.85, 12], [460, 250, 0.6, 5], [1000, 820, 0.55, 8]];
      for (const [x, y, s, v] of cl) { const xx = ((x + t * v + 400) % 1700) - 400; c.save(); c.translate(xx, y); if (gold > 0) { /* nubes teñidas */ } c.restore(); cloudDraw(c, xx, y, s, gold); }
      c.restore();
      put(F.far, 0.4);
      c.save(); F.par(c, cam, 0.4); c.translate(640, 856); c.rotate(t * 0.9); for (let i = 0; i < 4; i++) { c.rotate(Math.PI / 2); D.rr(c, -7, -74, 14, 70, 3); D.fs(c, '#fffaf0', 'rgba(60,70,110,.6)', 3); } D.oval(c, 0, 0, 7, 7); D.fs(c, '#e8785c'); c.restore();
      put(F.mid, 0.75);
      // humo de la chimenea
      c.save(); F.par(c, cam, 0.75); for (let i = 0; i < 5; i++) { const u = ((t * 0.22 + i / 5) % 1); D.oval(c, 478 + Math.sin(u * 5 + i) * 16 + u * 30, 496 - u * 190, 14 + u * 26, 14 + u * 26); D.fs(c, 'rgba(255,255,255,' + (0.6 * (1 - u)) + ')'); } c.restore();
      put(F.lawn, 1);
    } else {
      put(F.fg1, 1.25); put(F.fg2, 1.6);
      // luz: tinte dorado + viñeta suave
      if (gold > 0) { c.save(); c.globalCompositeOperation = 'soft-light'; c.globalAlpha = gold * 0.75; c.fillStyle = D.lg(c, 0, 0, 0, H, ['#ff9a5a', [0.6, '#ffb86b'], '#7a4fd0']); c.fillRect(0, 0, W, H); c.restore(); }
      c.save(); c.globalCompositeOperation = 'soft-light'; c.fillStyle = D.rg(c, W * 0.8, H * 0.15, 50, H * 0.9, ['rgba(255,244,200,.55)', [0.5, 'rgba(255,244,200,0)'], 'rgba(20,30,90,.35)']); c.fillRect(0, 0, W, H); c.restore();
      c.fillStyle = D.rg(c, W / 2, H * 0.52, H * 0.42, H * 0.78, ['rgba(20,10,50,0)', 'rgba(20,10,50,.3)']); c.fillRect(0, 0, W, H);
    }
  };
  const cloudDraw = (c, x, y, s, gold) => { cloud(c, x, y, s, 1); if (gold > 0) { c.save(); c.globalCompositeOperation = 'source-atop'; c.restore(); c.save(); c.globalAlpha = gold * 0.55; c.translate(x, y); c.scale(s, s); c.beginPath(); c.moveTo(-150, 40); c.arc(-110, 5, 48, Math.PI * 0.6, Math.PI * 1.5); c.arc(-45, -40, 62, Math.PI * 1.05, Math.PI * 1.85); c.arc(40, -22, 54, Math.PI * 1.3, Math.PI * 0.05); c.arc(105, 12, 40, Math.PI * 1.45, Math.PI * 0.5); c.lineTo(-150, 52); c.closePath(); c.fillStyle = D.lg(c, 0, -100, 0, 55, ['#ffd7a8', '#ff9f8a']); c.fill(); c.restore(); } };
  // transformación de cámara con paralaje p (1 = plano de los personajes, <1 = lejos, >1 = primer plano)
  F.par = (c, cam, p) => { const W = M.W, H = M.H, z = 1 + (cam.z - 1) * p; c.translate(W / 2, H / 2); c.rotate((cam.rot || 0) * p); c.scale(z, z); c.translate(-(W / 2 + (cam.x - W / 2) * p), -(H / 2 + (cam.y - H / 2) * p)); };
})();
