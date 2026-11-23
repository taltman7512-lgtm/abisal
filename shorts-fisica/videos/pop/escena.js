// «Can Brik POP Momo?» — 30 s, 60 fps, 1080x1920. Sin narración: todo se cuenta con acción, caras y el contador.
// La escena es una lista de «cues» (momento en segundos -> lo que pasa) sobre una simulación física que corre sola.
(() => {
  const D = M.D, G = 1590, KR = 95;
  const V = M.Video = { name: 'pop', fps: 60, dur: 30, frames: 1800 };
  let W, P, R, st, K, cam, cues, tws, ci;
  const ev = (k, v) => M.ev.push({ t: +st.t.toFixed(3), k, v: v === undefined ? 1 : +(+v).toFixed(2) });
  const tw = (o, p, dur, v1, e) => { tws = tws.filter((w) => !(w.o === o && w.p === p)); tws.push({ o, p, t0: st.t, t1: st.t + dur, v0: o[p], v1, e: M.E[e] || M.ss }); };
  const move = (x1, dur, h = 0, n = 1) => { K.mv = { x0: K.x, x1, t0: st.t, t1: st.t + dur, h, n, k: 0 }; };
  const momos = () => W.b.filter((b) => b.kind === 'm');
  const shake = (a) => { st.shake = Math.max(st.shake, a); };
  const mood = (m, dur, look) => { st.mood = m; st.moodT = st.t; st.moodEnd = st.t + dur; if (look) st.look = look; };
  const say = (x, y, txt, col, s = 90, life = 0.9, rot0 = 0) => P.add({ k: 'txt', x, y, vy: -60, txt, col, s, life, t0: st.t, rot0, layer: 1 });

  // Una bolita revienta y salen n más chicas (nacen chiquitas y se inflan: así no «explotan» al separarse)
  const pop = (b, n, rr, o = {}) => {
    W.remove(b); const t = st.t, lite = o.lite;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (o.spread || 1.5) * ((n === 1 ? 0.5 : i / (n - 1)) - 0.5) + (R() - 0.5) * 0.35 + (o.lean || 0), sp = (o.sp || 1150) * (0.75 + R() * 0.5);
      const r1 = rr * (0.92 + R() * 0.16);
      W.add({ x: M.clamp(b.x + Math.cos(a) * b.r * 0.45, 30, 1050), y: Math.min(b.y + Math.sin(a) * b.r * 0.45, G - 20), vx: Math.cos(a) * sp * 0.75 + (o.vx || 0), vy: Math.sin(a) * sp + (o.vy || 0), r: r1 * 0.3, rT: r1, sqv: -2.5, nh: t + 0.6 + R() * 1.5 });
    }
    P.add({ k: 'ring', x: b.x, y: b.y, s: b.r * 1.9, w: lite ? 8 : 16, col: '#ffffff', life: 0.32, t0: t, layer: 1 });
    P.burst(b.x, b.y, lite ? 3 : 12, R, { k: 'conf', col: ['#ff8fb3', '#ffffff', '#ffe14d', '#8fe3ff'], s: lite ? 16 : 22, sp: 800, up: 300, g: 2200, life: 0.9, t0: t, layer: 1 });
    if (!lite) { P.burst(b.x, b.y, 5, R, { k: 'star', col: '#fff27a', s: 26, sp: 620, life: 0.45, t0: t, drag: 3, layer: 1 }); P.burst(b.x, b.y, 4, R, { k: 'puff', col: '#ffffff', s: 30, sp: 260, life: 0.45, t0: t, drag: 4, layer: 1 }); }
    ev('pop', M.clamp(b.r / 110, 0.25, 1)); st.bumpT = t;
  };
  const poof = (x, y, s = 36) => { P.burst(x, y, 7, R, { k: 'puff', col: '#ffffff', s, sp: 240, life: 0.4, t0: st.t, drag: 4, layer: 1 }); ev('poof'); };
  const nearest = (x, y, f) => { let best = null, bd = 1e9; for (const b of momos()) { if (f && !f(b)) continue; const d = Math.hypot(b.x - x, b.y - y); if (d < bd) { bd = d; best = b; } } return best; };

  // Un pinchazo con el tenedor: se acerca, toma impulso, pincha en t0+0.42
  const stab = (t0) => {
    cues.push([t0, () => { const m = nearest(K.x, G - 80, (b) => b.r > 60) || nearest(K.x, G); if (!m) return; const right = m.x + m.r + KR + 70 < 1000; K.dir = right ? -1 : 1; move(M.clamp(m.x + (right ? 1 : -1) * (m.r + KR + 70), 110, 970), 0.3, 80, 1); tw(st, 'th', 0.25, -1, 'out'); ev('whoosh', 0.5); }]);
    cues.push([t0 + 0.34, () => tw(st, 'th', 0.08, 1.35, 'lin')]);
    cues.push([t0 + 0.42, () => { const tipx = K.x + K.dir * (KR + 150), m = nearest(tipx, G - 80, (b) => b.r > 60) || nearest(tipx, G - 80); if (m) { pop(m, 3, 70, { sp: 1150, vx: K.dir * 120 }); say(m.x, m.y - 150, 'POP!', '#ffe14d', 96, 0.6, (R() - 0.5) * 0.4); shake(13); K.red = Math.min(1, K.red + 0.3); mood('laugh', 0.55); } }]);
    cues.push([t0 + 0.46, () => tw(st, 'th', 0.18, 0, 'out')]);
  };

  V.init = () => {
    R = M.rng(2026); W = new M.World({ ground: G }); P = new M.Parts(); M.ev = []; tws = []; ci = 0;
    st = { t: 0, shake: 0, flash: 0, gold: 0, shown: 1, bumpT: -9, tool: 'pin', th: 0, mood: '', moodEnd: 0, moodT: 0, look: null, hud2: 0, hudPop: 1, pressed: 0, ball: null, roll: null, pinFly: null, forkFly: null, pinFall: null, kGhost: false, twinkle: -9 };
    K = { x: 1035, y: G - KR - 8, r: KR, hop: 0, sq: 0, sqv: 0, ang: 0, face: 'sly', red: 0, dir: -1, mv: null, body: null, lx: -1, ly: 0, vis: true };
    cam = M.cam = { x: 540, y: 960, z: 1.03, rot: 0 };
    K.kb = W.add({ x: K.x, y: K.y, r: KR, dyn: false, kind: 'kk' });
    W.add({ x: 430, y: G - 110, r: 110, rT: 110, nh: 99 });
    V.W = W; V.st = st; V.K = K;

    const first = () => momos()[0];
    cues = [
      // ---- 0–3 s · GANCHO: Momo salta feliz, Brik se acerca con un alfiler ----
      ...[0.02, 0.72, 1.42, 2.12].map((t, i) => [t, () => { const m = first(); m.vy = -880; m.vx = (430 - m.x) * 1.4 + (i % 2 ? 60 : -60); m.sqv = -3; ev('boing', 0.5); P.add({ k: 'note', x: m.x + (i % 2 ? 90 : -90), y: m.y - 150, vy: -150, s: 34, col: ['#ff8fb3', '#8fe3ff', '#ffe14d', '#b59bff'][i], life: 1.3, t0: st.t, rot: i, layer: 1 }); }]),
      [0.1, () => { st.look = { x: 100, y: 1100 }; move(800, 2.0, 46, 5); }],
      [2.15, () => { tw(st, 'th', 0.5, -1, 'out'); tw(cam, 'z', 0.7, 1.14); tw(cam, 'x', 0.7, 590); tw(cam, 'y', 0.7, 1230); K.face = 'grin'; ev('whoosh', 0.4); }],
      [2.62, () => { st.twinkle = st.t; ev('ting', 0.7); }],
      [2.95, () => { tw(st, 'th', 0.1, 1.4, 'lin'); move(668, 0.1); ev('whoosh', 1); }],
      // ---- 3,05 s · primer POP: 1 -> 2 ----
      [3.05, () => { const m = first(); pop(m, 2, 90, { sp: 1150, spread: 1.0 }); say(m.x, m.y - 190, 'POP!', '#ffe14d', 130, 0.7, -0.15); shake(16); st.flash = 0.5; K.face = 'shock'; st.look = null; }],
      [3.1, () => { tw(st, 'th', 0.3, -0.6, 'out'); move(850, 0.45, 130, 1); tw(cam, 'z', 0.6, 1.03, 'out'); tw(cam, 'x', 0.6, 540); tw(cam, 'y', 0.6, 960); }],
      [3.9, () => { K.face = 'confused'; say(K.x - 30, K.y - 190, '?', '#ffffff', 120, 1.0, 0.2); ev('huh'); mood('laugh', 1.4); ev('giggle', 0.6); }],
      [5.0, () => { tw(st, 'th', 0.3, -0.7, 'out'); K.lx = -0.6; K.ly = -0.8; }],
      // tira el alfiler al cielo (vuelve al final)
      [5.5, () => { st.tool = null; st.pinFly = { x: K.x - 110, y: K.y - 120, vy: -2900, rot: 0 }; st.th = 0; ev('whistleup'); K.face = 'angry'; K.ly = 0; K.lx = -1; }],
      [6.05, () => { P.add({ k: 'star', x: 705, y: 520, s: 46, col: '#ffffff', life: 0.5, t0: st.t, vr: 5, layer: 0 }); ev('ting', 1); }],
      // ---- 6,4 s · tenedor gigante: 2 -> 4 -> 6 -> 8 ----
      [6.4, () => { st.tool = 'fork'; poof(K.x - 150, K.y, 40); K.face = 'grin'; tw(cam, 'z', 0.5, 1.07); tw(cam, 'y', 0.5, 1120); ev('evil'); }],
      // ---- 9 s · berrinche ----
      [9.05, () => { K.face = 'furious'; tw(K, 'red', 0.3, 1); st.tool = null; st.forkFly = { x: K.x + K.dir * 150, y: K.y, vx: -K.dir * 900, vy: -1700, rot: 0 }; move(K.x, 0.9, 110, 3); ev('grr'); mood('laugh', 1.6); ev('giggle', 0.9); }],
      ...[9.1, 9.25, 9.4, 9.55, 9.7, 9.85].map((t) => [t, () => { P.add({ k: 'puff', x: K.x + (R() - 0.5) * 120, y: K.y - K.hop - 110, vy: -260, vx: (R() - 0.5) * 200, s: 26, col: '#ffffff', life: 0.5, t0: st.t, layer: 1 }); }]),
      [10.1, () => { K.dir = 1; K.lx = 1; move(1300, 0.95, 70, 3); tw(K, 'red', 0.5, 0.5); tw(cam, 'z', 0.6, 1.03); tw(cam, 'y', 0.6, 960); }],
      [10.9, () => { st.kGhost = true; }],
      // ---- 11,3 s · el rodillo con púas: 8 -> 32 ----
      [11.25, () => { mood('o', 0.9, { x: 1300, y: 1400 }); ev('rumble', 3.9); }],
      [11.6, () => { st.roll = { x: 1340, rot: 0 }; K.face = 'manic'; K.dir = -1; K.lx = -1; K.red = 0.25; st.look = { x: 1300, y: 1400 }; for (const m of momos()) { m.vx -= 260 + R() * 200; m.vy = -500 - R() * 300; } }],
      [15.05, () => { st.roll = null; K.x = -160; K.dir = 1; K.lx = 1; K.face = 'grin'; K.red = 0; st.kGhost = false; move(165, 0.7, 70, 2); st.look = null; }],
      [15.9, () => { K.face = 'shock'; say(K.x + 40, K.y - 200, '!', '#ff5a4a', 130, 0.8); tw(cam, 'z', 0.22, 1.2, 'out'); tw(cam, 'x', 0.22, 330); tw(cam, 'y', 0.22, 1360); ev('gasp'); mood('laugh', 1.2, { x: 160, y: 1450 }); ev('giggle', 1); }],
      // ---- 16,8 s · el arma final ----
      [16.75, () => { K.face = 'furious'; tw(K, 'red', 0.3, 1); ev('grr'); tw(cam, 'z', 0.5, 1.03); tw(cam, 'x', 0.5, 540); tw(cam, 'y', 0.5, 960); }],
      [17.1, () => { st.ball = { x: 610, y: -420, r: 150, rot: 0, sw: 0.5 }; tw(st.ball, 'y', 1.0, 600, 'out'); tw(st, 'gold', 1.9, 0.4); ev('chain'); }],
      [17.3, () => { st.tool = 'remote'; poof(K.x + 140, K.y - 20, 34); K.face = 'sly'; tw(K, 'red', 0.4, 0.2); mood('wow', 1.5, { x: 610, y: 600 }); }],
      [18.25, () => { st.pressed = 1; ev('click'); K.face = 'manic'; }],
      [18.47, () => { tw(st.ball, 'y', 0.28, G - 150, 'inn'); ev('drop'); }],
      // ---- 18,75 s · MEGA POP: 32 -> ~200 ----
      [18.75, () => {
        const ms = momos(), n = Math.max(2, Math.round(168 / ms.length)); for (const m of ms) pop(m, n, 37, { lite: true, sp: 1500, spread: 2.2, vx: (m.x - 610) * 1.6, vy: -900 - R() * 700 });
        P.burst(610, G - 150, 16, R, { k: 'scrap', col: ['#8f9bb5', '#515a78', '#dfe6f2'], s: 34, sp: 1500, up: 900, g: 2400, life: 1.4, t0: st.t, layer: 1 });
        P.add({ k: 'ring', x: 610, y: G - 150, s: 1100, w: 60, col: '#ffffff', life: 0.5, t0: st.t, layer: 1 }); say(540, 900, 'MEGA POP!', '#ffe14d', 190, 1.0, -0.08);
        st.ball = null; st.flash = 1; shake(46); st.tool = null; st.pressed = 0; tw(st, 'gold', 2.2, 1); ev('boom'); st.mood = ''; st.look = null;
        W.remove(K.kb); K.body = W.add({ x: K.x, y: K.y, r: 92, rT: 92, m: 1.2, e: 0.15, vx: 105, vy: -3350, spin: true, kind: 'k', ghost: true }); K.face = 'shock'; K.red = 0; K.air = true;
        cam.z = 1.12; tw(cam, 'z', 0.9, 1.03, 'out');
      }],
      [21.6, () => { mood('laugh', 3.0); ev('giggle', 1); }],
      [23.4, () => { if (!K.air) K.face = 'tired'; }],
      // ---- 24,6 s · el besito ----
      [24.6, () => { const b = K.body, m = nearest(b.x, b.y - 40, (q) => !q.cov) || nearest(b.x, b.y); if (m) { m.face = 'kiss'; m.faceEnd = st.t + 1.0; m.vy = -520; m.vx = (b.x - m.x) * 1.5; P.add({ k: 'heart', x: (m.x + b.x) / 2, y: Math.min(m.y, b.y) - 110, vy: -120, s: 44, col: '#ff5a8a', life: 1.2, t0: st.t + 0.25, layer: 1 }); } ev('kiss'); st.mood = ''; }],
      [25.0, () => { K.face = 'blush'; }],
      // ---- 25,9 s · el alfiler vuelve del cielo ----
      [25.85, () => { ev('whistledown', 1.15); }],
      [26.0, () => { st.pinFall = { y: -900 }; tw(st.pinFall, 'y', 1.0, 0, 'inn'); }],
      [26.35, () => { K.face = 'confused'; K.ly = -1; K.lx = 0; mood('o', 0.7, { x: K.body.x, y: -200 }); }],
      [26.72, () => { K.face = 'shock'; }],
      // ---- 27 s · REMATE: revienta Brik -> 2 Briks ----
      [27.0, () => {
        const b = K.body, t = st.t; W.remove(b); st.pinFall = null; K.body = null; K.vis = false;
        K.twins = [-1, 1].map((s) => W.add({ x: b.x + s * 40, y: b.y - 10, r: 30, rT: 80, m: 1.2, e: 0.2, vx: s * 170, vy: -1250, spin: true, kind: 'k', sqv: -2.5 }));
        P.add({ k: 'ring', x: b.x, y: b.y, s: 260, w: 22, col: '#ffffff', life: 0.35, t0: t, layer: 1 }); P.burst(b.x, b.y, 16, R, { k: 'conf', col: ['#ff9a45', '#6b58c9', '#ffe14d', '#ffffff'], s: 26, sp: 900, up: 400, g: 2200, life: 1.0, t0: t, layer: 1 }); P.burst(b.x, b.y, 6, R, { k: 'star', col: '#fff27a', s: 34, sp: 700, life: 0.5, t0: t, drag: 3, layer: 1 });
        say(b.x, b.y - 210, 'POP!', '#ff9a45', 150, 0.8, 0.12); shake(22); st.flash = 0.6; ev('brikpop'); K.tface = 'shock'; mood('wow', 0.8);
        st.pinDrop = { x: b.x, y: b.y - 60, vx: -500, vy: -1100, rot: 1.57 };
      }],
      [27.15, () => { st.hud2 = 1; st.hudPop = 0; tw(st, 'hudPop', 0.35, 1, 'lin'); st.shown = 2; st.bumpT = st.t; ev('ding'); }],
      [27.9, () => { mood('laugh', 9); ev('cheer'); }],
      [28.35, () => { K.tface = 'confused'; K.tlook = 'each'; const a = K.twins[0], b = K.twins[1]; tw(cam, 'z', 1.1, 1.32); tw(cam, 'x', 1.1, (a.x + b.x) / 2); tw(cam, 'y', 1.1, (a.y + b.y) / 2 + 60); }],
      [29.0, () => { K.tface = 'shock'; K.tlook = 'cam'; ev('ting', 0.6); }],
    ];
    stab(6.95); stab(7.65); stab(8.35);
    cues.sort((a, b) => a[0] - b[0]);
  };

  V.step = (f) => {
    const t = st.t = f / 60, dt = 1 / 60;
    while (ci < cues.length && Math.round(cues[ci][0] * 60) <= f) cues[ci++][1]();
    for (const w of tws) w.o[w.p] = M.lerp(w.v0, w.v1, w.e(M.u(t, w.t0, w.t1)));
    tws = tws.filter((w) => t < w.t1);
    // Brik guiado (hasta el MEGA POP)
    if (!K.body && K.vis) {
      if (K.mv) { const m = K.mv, u = M.u(t, m.t0, m.t1); K.x = M.lerp(m.x0, m.x1, M.ss(u)); K.hop = m.h * Math.abs(Math.sin(u * Math.PI * m.n)); const k = Math.floor(u * m.n + 1e-6); if (k > m.k && m.h > 20) { m.k = k; K.sqv += 3.2; if (m.h > 100) { ev('thud', 0.6); shake(8); } else ev('step', 0.5); } if (u >= 1) K.mv = null; }
      if (st.roll) { K.x = st.roll.x + 200; K.hop = 292 + Math.sin(t * 40) * 3; }
      K.sqv += (-520 * K.sq - 16 * K.sqv) * dt; K.sq = M.clamp(K.sq + K.sqv * dt, -0.25, 0.35);
      K.y = G - KR - 8 - K.hop; K.kb.x = K.x; K.kb.y = K.y; K.kb.ghost = st.kGhost || !!st.roll;
    }
    // rodillo: revienta a las grandes, a las chicas las revolea para atrás
    if (st.roll) { const r = st.roll; r.x -= 600 * dt; r.rot -= 600 * dt / 120; if (f % 3 === 0) P.add({ k: 'puff', x: r.x + 60 + R() * 300, y: G - 10, vy: -90, vx: 200, s: 20, col: 'rgba(255,255,255,.8)', ink: false, life: 0.4, t0: t, layer: 0 }); shake(5);
      for (const m of momos()) { if ((Math.abs(m.x - r.x) > 120 + m.r * 0.7 || m.y < G - 640) && !(r.x < 160 && m.rT > 60 && m.x < 520)) continue; if (m.rT > 60) pop(m, 4, 50, { sp: 1300, spread: 1.1, lean: 0.55, vx: 260 }); else if (t - (m.fl || -9) > 0.5) { m.fl = t; m.vy = -1000 - R() * 500; m.vx = 300 + R() * 500; ev('boing', 0.4); } } }
    // bolitas: se inflan al nacer y dan saltitos solas
    const ms = momos(), many = ms.length > 60, laugh = st.mood === 'laugh' && t < st.moodEnd;
    for (const m of ms) { if (m.rT && m.r < m.rT) m.r = Math.min(m.rT, m.r + (m.rT - m.r) * 0.2 + 0.4);
      if (t > m.nh && m.gc !== undefined) { if ((m.gc || m.touch) && !m.cov && t > 3.2) { m.vy = -(many ? 260 + R() * 340 : 380 + R() * 420) * (laugh ? 1.25 : 1); m.vx += (R() - 0.5) * 260; m.sqv -= 2; } m.nh = t + (many ? 0.8 + R() * 3.2 : 0.45 + R() * 1.5) * (laugh ? 0.55 : 1); } }
    for (const k of W.b) if (k.kind === 'k') { if (k.r < k.rT) k.r = Math.min(k.rT, k.r + (k.rT - k.r) * 0.2 + 0.5); if (k.ghost && k.vy > 0) k.ghost = false; if (k.vy > 1300 && t > 20) k.vy = 1300; }
    W.ev.length = 0; W.step(dt);
    let ln = 0, lv = 0; for (const e of W.ev) { if (e.kind === 'k') { ev('thud', e.v); shake(10 * e.v + 4); if (K.air && t > 20) { K.air = false; K.face = 'dizzy'; } } else if (e.v > 0.3) { ln++; lv = Math.max(lv, e.v * e.r / 90); } }
    if (ln) ev('land', Math.min(1, lv) * (ln > 3 ? 0.8 : 1));
    // cosas que vuelan
    if (st.pinFly) { const p = st.pinFly; p.y += p.vy * dt; p.rot += 16 * dt; if (p.y < -400) st.pinFly = null; }
    if (st.forkFly) { const p = st.forkFly; p.vy += 2600 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += 11 * dt; if (p.y > 2200) st.forkFly = null; }
    if (st.pinDrop) { const p = st.pinDrop; p.vy += 2600 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot -= 13 * dt; if (p.y > 2200) st.pinDrop = null; }
    if (st.ball) { st.ball.rot = Math.sin(t * 2.2) * 0.08; }
    P.step(dt, t); st.shake *= 0.86; st.flash *= 0.8;
    // contador: sube rápido hacia la cantidad real
    if (!st.hud2) { const n = ms.length; if (st.shown < n) { const d = Math.max(1, Math.ceil((n - st.shown) * 0.09)); st.shown += d; st.bumpT = t; if (n - st.shown > 3 && f % 3 === 0) ev('tick', M.clamp(st.shown / 200, 0, 1)); } else st.shown = n; }
  };

  V.draw = (c, f) => {
    const t = st.t, F = M.Fondo, sh = st.shake, sg = f % 2 ? 1 : -1;
    const z = Math.max(1.03, cam.z), cm = { z, rot: cam.rot, x: M.clamp(cam.x, 540 / z + 6, 1080 - 540 / z - 6) + sg * sh * 0.7, y: M.clamp(cam.y, 960 / z + 4, 1920 - 960 / z - 4) + (M.hash(f) - 0.5) * sh * 1.5 };
    F.draw(c, t, cm, st.gold, 'back');
    c.save(); F.par(c, cm, 1);
    const ms = momos(), many = ms.length > 60;
    // sombras de contacto
    const shadow = (x, y, r, k = 1) => { const hgt = G - (y + r), a = M.clamp(1 - hgt / 520, 0, 1); if (a <= 0) return; D.oval(c, x, G + 4, r * (0.55 + 0.4 * a) * k, r * 0.16 * (0.6 + 0.4 * a)); D.fs(c, 'rgba(18,70,50,' + (0.3 * a) + ')'); };
    for (const m of ms) if (!many || m.gc) shadow(m.x, m.y, m.r);
    if (K.vis && !K.body && !st.roll) shadow(K.x, K.y, KR, 1.15);
    for (const k of W.b) if (k.kind === 'k') shadow(k.x, k.y, k.r, 1.15);
    if (st.ball) { const a = M.clamp((st.ball.y + 420) / 1000, 0, 1); D.oval(c, st.ball.x, G + 6, 200 * a + 40, 34 * a + 6); D.fs(c, 'rgba(18,60,50,' + (0.34 * a) + ')'); }
    if (st.roll) { D.oval(c, st.roll.x + 150, G + 6, 420, 30); D.fs(c, 'rgba(18,70,50,.3)'); }
    P.draw(c, t, 0);
    if (st.pinFly) D.pin(c, st.pinFly.x, st.pinFly.y, st.pinFly.rot, 120);
    // Brik guiado
    const kface = { face: K.face, red: K.red, lx: K.lx, ly: K.ly, t, blink: (K.face !== 'shock' && ((t + 0.7) % 2.6) < 0.1) };
    if (K.vis && !K.body) { const lean = st.th < 0 ? st.th * -0.1 * K.dir : st.th * 0.07 * K.dir; D.brik(c, { x: K.x, y: K.y, r: KR, sq: K.sq, ang: lean + (st.roll ? Math.sin(t * 30) * 0.02 : 0) }, Object.assign(kface, { noFeet: !!st.roll })); }
    if (st.roll) D.roller(c, st.roll.x, G - 120, 120, st.roll.rot, Math.sin(t * 40) * 3);
    // bolitas (las de abajo se dibujan al final: quedan adelante)
    ms.sort((a, b) => a.y - b.y || a.id - b.id);
    const moodOn = st.mood && t < st.moodEnd;
    for (const m of ms) {
      const hh = M.hash(m.id), dly = hh * 0.3; let face = 'smile';
      if (t - m.born < 0.45 && t > 1) face = 'wow'; else if (m.face && t < m.faceEnd) face = m.face; else if (moodOn && t > st.moodT + dly) face = st.mood; else if (!m.gc && !m.touch && Math.hypot(m.vx, m.vy) > 900) face = 'o';
      const lk = st.look, blink = ((t + hh * 7) % (2.1 + hh * 2.2)) < 0.11 && face === 'smile';
      D.momo(c, m, { face, blink, lx: lk ? M.clamp((lk.x - m.x) / 260, -1, 1) : M.clamp(m.vx / 500, -1, 1) * 0.6, ly: lk ? M.clamp((lk.y - m.y) / 260, -1, 1) : 0 });
    }
    // Brik suelto (después del MEGA POP) y los dos Briks del final
    if (K.body) { const b = K.body; D.brik(c, b, Object.assign(kface, { noFeet: true, lx: K.face === 'confused' ? 0 : 0, ly: K.ly }));
      if (K.face === 'tired' && ((t * 2) % 1) < 0.5) { /* gota de cansancio */ P; }
      if (st.pinFall) D.pin(c, b.x, b.y - b.r - 8 + st.pinFall.y, Math.PI / 2 * -1, 120); }
    if (K.twins) K.twins.forEach((b, i) => D.brik(c, b, { face: K.tface, noFeet: true, lx: K.tlook === 'each' ? (K.twins[1 - i].x > b.x ? 1 : -1) : 0, ly: 0, t }));
    if (st.pinDrop) D.pin(c, st.pinDrop.x, st.pinDrop.y, st.pinDrop.rot, 120);
    // mano + herramienta
    if (K.vis && !K.body && st.tool) { const d = K.dir, th = st.th, hx = K.x + d * (KR + 34 + Math.max(0, th) * 62 + Math.min(0, th) * 46), hy = K.y + 14 + Math.min(0, th) * 70 - Math.max(0, th) * 8;
      if (st.tool === 'pin') { const a = (th < 0 ? th * 0.55 : 0) * -d; c.save(); c.translate(hx, hy); c.scale(-d, 1); c.rotate(th < 0 ? th * -0.5 : 0); D.pin(c, -128, 0, 0, 120); c.restore(); void a; if (t - st.twinkle < 0.35) { const u = (t - st.twinkle) / 0.35; D.star(c, hx + d * 112, hy - 62, 60 * Math.sin(u * Math.PI), 4, 0.3, u * 2); D.fs(c, '#ffffff', '#3b1630', 3); } }
      else if (st.tool === 'fork') { c.save(); c.translate(hx, hy); c.scale(-d, 1); c.rotate(th < 0 ? th * -0.35 : 0); D.fork(c, -215, 0, 0, 290); c.restore(); }
      else if (st.tool === 'remote') D.remote(c, hx + d * 6, hy - 46, 58, st.pressed);
      D.hand(c, hx, hy, 27); if (st.tool === 'remote') D.hand(c, hx + d * 4, hy - 66 + (st.pressed ? 8 : -14), 20);
    }
    if (st.forkFly) D.fork(c, st.forkFly.x, st.forkFly.y, st.forkFly.rot, 290);
    if (st.ball) { const b = st.ball; c.save(); c.translate(b.x, -500); c.rotate(b.rot); c.translate(-b.x, 500); D.spikeBall(c, b.x, b.y, b.r, 0, 1400); D.tag(c, b.x + 175, b.y - 150, 'MEGA POP 9000', 0.12); c.restore(); }
    P.draw(c, t, 1);
    c.restore();
    F.draw(c, t, cm, st.gold, 'front');
    if (st.flash > 0.02) { c.fillStyle = 'rgba(255,255,255,' + Math.min(1, st.flash) + ')'; c.fillRect(0, 0, 1080, 1920); }
    const bump = Math.max(0, 1 - (t - st.bumpT) / 0.25);
    if (st.hud2) D.hud(c, { l1: 'Can Momo', w1: 'POP', w2: 'Brik?', col1: ['#fff27a', '#ff9a2e'], col2: ['#b9a8ff', '#7a62e0'], n: st.shown, bump, icon: 'brik', pop: st.hudPop });
    else D.hud(c, { l1: 'Can Brik', w1: 'POP', w2: 'Momo?', col1: ['#fff27a', '#ff9a2e'], col2: ['#ffd0de', '#ff7fa8'], n: st.shown, bump, icon: 'momo', pop: M.u(t, -0.2, 0.25) });
  };
})();
