  // ★ HISTORIA "Keep Your Boots On". Solo efectos: la música de fondo se mezcla después.
  const VOLM = 1.5, M = oc.createGain(); M.gain.value = VOLM; const LP = filt("lowpass", 10000, .4, M); M.connect(mus);
  if (window.SOLO === "voz") { M.gain.value = 0; fx.gain.value = 0 }
  if (window.SOLO === "sinmusica") M.gain.value = 0;
  fx.gain.value *= 2.5;   // los efectos de Gusthollow: el viento tiene que oírse (medido: −54 dB contra −20 de la voz)
  const sl = i => i < S.length ? S[i] : DUR, el = i => i < S.length ? S[i] + D[i] : DUR;
  const pno = (t, m, v = .1, dur = 2.2) => { const f = mtof(m), lp = filt("lowpass", 2400 + (m - 48) * 50, .4, LP);
    [1, .45, .22, .12, .06].forEach((a, k) => { const n = k + 1; for (const dt of [-.5, .5]) { const o = osc("sine", f * n * (1 + .0003 * n * n), t, t + dur + .2, envG(t, v * a * .5, .003, dur / Math.sqrt(n), lp)); o.detune.value = dt } }) };
  const pad = (notes, t0, t1, v = .015, cut = 900) => { if (t1 <= t0 + .3) return; const lp = filt("lowpass", cut, .6, LP), g = oc.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(v, t0 + Math.min(1.2, (t1 - t0) / 2)); g.gain.setValueAtTime(v, Math.max(t0 + .1, t1 - .6)); g.gain.linearRampToValueAtTime(0, t1); g.connect(lp);
    notes.forEach(m => { for (const dt of [-6, 6]) { const o = osc("sawtooth", mtof(m), t0, t1, g); o.detune.value = dt } }) };
  const ACR = { C: [48, 52, 55], G: [43, 47, 50], Am: [45, 48, 52], F: [41, 45, 48], Dm: [50, 53, 57], Bb: [46, 50, 53], E: [40, 44, 47] };
  const tramo = (t0, t1, prog, bpm, v) => { const bt = 60 / bpm; let k = 0; for (let t = t0; t < t1 - .2; t += bt / 2, k++) { const c = ACR[prog[Math.floor(k / 8) % prog.length]];
      if (k % 8 === 0) pad(c.map(m => m + 12), t, Math.min(t1, t + bt * 4 + .3), .012 * v);
      pno(t, [c[0], c[2], c[1] + 12, c[2]][k % 4] + 12, (k % 4 ? .04 : .06) * v, 1.4) } };
  // sin música propia: de fondo va la canción del dueño, mezclada aparte (ver SKILL.md)
  M.gain.value = 0;

// ---- efectos (≈ 6 por minuto, debajo de la voz) ----
  const thud = (t, a = .3, f = 60, dec = .5) => { const o = osc("sine", f * 1.8, t, t + dec + .3, envG(t, a, .004, dec, fx)); o.frequency.exponentialRampToValueAtTime(f * .6, t + .15); noise(t, .06, filt("lowpass", 400, 1, envG(t, a * .3, .002, .06, fx))) };
  const rumble = (t, dur, a = .12, f = 45) => { const g = oc.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(a, t + dur * .3); g.gain.linearRampToValueAtTime(0, t + dur); g.connect(fx); noise(t, dur, filt("lowpass", 160, 1, g)); osc("sine", f, t, t + dur, g) };
  const whoosh = (t, dur, a = .1, f0 = 200, f1 = 1400) => { const g = oc.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(a, t + dur * .4); g.gain.linearRampToValueAtTime(0, t + dur); g.connect(fx); const bp = filt("bandpass", f0, 1.2, g); bp.frequency.exponentialRampToValueAtTime(f1, t + dur); noise(t, dur, bp) };
  const creak = (t, dur, a = .05) => { const g = envG(t, a, .1, dur, fx), o = osc("sawtooth", 70, t, t + dur, filt("bandpass", 900, 8, g)); o.frequency.linearRampToValueAtTime(110, t + dur) };
  const clink = (t, a = .05) => { [2637, 3951, 5274].forEach((f, k) => osc("sine", f * (1 + r() * .01), t, t + .5, envG(t, a / (k + 1), .001, .25, fx))) };
  const bell = (t, a = .1) => { [[220, 1], [440, .6], [528, .35], [660, .3], [880, .18], [1188, .1]].forEach(([f, v]) => osc("sine", f, t, t + 3.2, envG(t, a * v, .002, 2.6, fx))) };
  const dig = (t, a = .12) => { noise(t, .18, filt("bandpass", 700, 1.5, envG(t, a, .003, .14, fx))); noise(t + .02, .1, filt("highpass", 2500, 0, envG(t + .02, a * .4, .001, .06, fx))) };
  const splash = (t, a = .14) => { noise(t, 1.4, filt("lowpass", 1800, .7, envG(t, a, .01, 1.1, fx))); whoosh(t, .8, a * .6, 300, 2500) };
  // viento continuo (cama), ráfagas, botas de hierro, cadenas, el techo, la cometa, la veleta, el vuelo; en el valle verde: silencio y pájaros
  const viento = (t0, dur, a = .05, f0 = 500, f1 = 900) => { if (dur <= .1) return; const g = oc.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(a, t0 + Math.min(1.5, dur * .3)); g.gain.setValueAtTime(a, Math.max(t0 + .2, t0 + dur - 1)); g.gain.linearRampToValueAtTime(0, t0 + dur); g.connect(fx);
    const bp = filt("bandpass", f0, 2.5, g); for (let t = t0; t < t0 + dur; t += 1.7) bp.frequency.linearRampToValueAtTime(f0 + (f1 - f0) * (.5 + .5 * Math.sin(t * 1.9)), t + .85); noise(t0, dur, bp) };
  const rafaga = (t, dur = 1.4, a = .07) => whoosh(t, dur, a, 250, 1100);
  const bota = (t, a = .07) => { thud(t, a, 90, .14); [1180, 1770, 2650].forEach((f, k) => osc("triangle", f * (1 + r() * .02), t, t + .3, envG(t, a * .18 / (k + 1), .001, .18, fx))) };
  const cadena = (t, dur = .5, a = .05) => { for (let k = 0; k < dur * 16; k++) { const tt = t + k / 16 + r() * .03; [2100, 3300].forEach(f => osc("triangle", f * (1 + r() * .05), tt, tt + .1, envG(tt, a * (.3 + r() * .7) * .4, .001, .06, fx))) } };
  const chasquido = (t, a = .12) => { noise(t, .05, filt("highpass", 2000, 0, envG(t, a, .001, .04, fx))); clink(t + .01, a * .6); thud(t, a * .5, 200, .08) };
  const aleteo = (t0, dur, a = .03) => { for (let t = t0; t < t0 + dur; t += .07 + r() * .03) noise(t, .04, filt("bandpass", 900 + r() * 500, 2, envG(t, a * (.5 + r() * .5), .002, .03, fx))) };
  const pajaros = (t0, t1, a = .025) => { for (let t = t0 + .4; t < t1; t += 1.1 + r() * 1.6) { const f = 2800 + r() * 1400; for (let k = 0; k < 2 + Math.floor(r() * 3); k++) { const tt = t + k * .11, o = osc("sine", f, tt, tt + .09, envG(tt, a, .005, .07, fx)); o.frequency.linearRampToValueAtTime(f * 1.25, tt + .07) } } };
  // la cama de viento: todo el pueblo; el doble en la tormenta y el vuelo; se apaga al aparecer el valle
  viento(0, sl(I.doubled), .03); viento(sl(I.doubled), sl(I.over) - sl(I.doubled), .065, 450, 1300); viento(sl(I.over), sl(I.then) - sl(I.over), .05, 700, 1600);
  viento(sl(I.tobb), sl(I.doubled) - sl(I.tobb), .02);
  // botas de hierro: las del arranque, las de la gente inclinada y las que caen
  for (let k = 0; k < 4; k++) bota(sl(I.iron) + .1 + k * .32, .06); for (let k = 0; k < 6; k++) bota(sl(I.lean) + .15 + k * .42, .04);
  bota(wt(I.boots2, 1), .05); bota(wt(I.boots2, 5), .05); bota(wt(I.left, 4), .06); bota(wt(I.left, 7), .06); bota(sl(I.second) + .3, .05);
  cadena(sl(I.chains) + .2, .8, .04);
  // Tobb vuela (recuerdo) y Pip vuela
  rafaga(sl(I.leaf), 1.6, .07); rafaga(sl(I.up), 1.4, .08); rafaga(sl(I.letgo), 1.5, .09); rafaga(sl(I.flew), 1.2, .08);
  // la tormenta: ráfaga fuerte, cadenas que se cortan, el techo, la cometa, la correa, la veleta que se dobla y se rompe
  rafaga(sl(I.doubled), 2, .1); chasquido(sl(I.snapped) + .15, .1); chasquido(sl(I.snapped) + .45, .09); cadena(sl(I.snapped) + .2, .6, .05); creak(wt(I.snapped, 3), .8, .06); whoosh(wt(I.snapped, 5), 1.4, .08, 300, 1500);
  aleteo(sl(I.hill), sl(I.boots2) - sl(I.hill), .03); chasquido(wt(I.pulled, 4), .09);
  creak(sl(I.vane) + .3, 1.2, .05); creak(sl(I.bend) + .1, 1.8, .07); thud(sl(I.grab) + .1, .14, 70, .3); chasquido(sl(I.broke) + .15, .14); creak(sl(I.broke), .5, .07);
  // el valle: silencio, pájaros, el golpe blando en el pasto
  pajaros(sl(I.calm), DUR, .022); thud(sl(I.landed) + .55, .1, 60, .4); noise(sl(I.landed) + .55, .5, filt("lowpass", 1200, .7, envG(sl(I.landed) + .55, .04, .01, .4, fx)));
