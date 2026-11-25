  // ★ HISTORIA "Nobody Blows The Horn". Solo efectos: la música de fondo se mezcla después.
  const VOLM = 1.5, M = oc.createGain(); M.gain.value = VOLM; const LP = filt("lowpass", 10000, .4, M); M.connect(mus);
  if (window.SOLO === "voz") { M.gain.value = 0; fx.gain.value = 0 }
  if (window.SOLO === "sinmusica") M.gain.value = 0;
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
  // silbidos: el del chico (dos notas que suben) y el de la pava (agudo con vibrato)
  const silbido = (t, f0, f1, dur, a = .07) => { const g = envG(t, a, .05, dur, fx), o = osc("sine", f0, t, t + dur + .2, g); o.frequency.linearRampToValueAtTime(f1, t + dur * .8); const lg = oc.createGain(); lg.gain.value = f0 * .012; lg.connect(o.frequency); osc("sine", 6, t, t + dur + .2, lg); noise(t, dur, filt("bandpass", f1, 8, envG(t, a * .25, .05, dur, fx))) };
  const pava = (t, dur, a = .05) => { const g = oc.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(a, t + dur * .6); g.gain.linearRampToValueAtTime(0, t + dur); g.connect(fx); const o = osc("sine", 2300, t, t + dur, g); const lg = oc.createGain(); lg.gain.value = 40; lg.connect(o.frequency); osc("sine", 9, t, t + dur, lg); noise(t, dur, filt("bandpass", 2300, 4, g)) };
  const crepita = (t0, t1, a = .05) => { for (let t = t0; t < t1; t += .05 + r() * .12) noise(t, .02 + r() * .04, filt("bandpass", 1500 + r() * 3000, 1, envG(t, a * (.3 + r()), .001, .03, fx))) };
  const sisea = (t, dur, a = .1) => { const g = oc.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(a, t + .15); g.gain.linearRampToValueAtTime(0, t + dur); g.connect(fx); noise(t, dur, filt("highpass", 3000, .5, g)) };
  const gorgoteo = (t, dur, a = .08) => { for (let k = 0; k < dur * 8; k++) { const tt = t + k / 8 + r() * .05, o = osc("sine", 120 + r() * 140, tt, tt + .12, envG(tt, a * (.4 + r() * .6), .005, .08, fx)); o.frequency.exponentialRampToValueAtTime(300 + r() * 200, tt + .1) } };
  // pasos del gigante, hachazos, el pino que cruje y cae, viento, el techo que se rompe, tazas, aliento
  const paso = t => { thud(t, .32, 34, .7); noise(t, .3, filt("lowpass", 300, 1, envG(t, .08, .005, .25, fx))) };
  const hachazo = (t, a = .12) => { noise(t, .06, filt("bandpass", 1800, 2, envG(t, a, .002, .05, fx))); thud(t, a * .8, 120, .12) };
  const viento = (t0, dur, a = .05) => { const g = oc.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(a, t0 + dur * .3); g.gain.linearRampToValueAtTime(0, t0 + dur); g.connect(fx); const bp = filt("bandpass", 500, 3, g); bp.frequency.linearRampToValueAtTime(900, t0 + dur * .5); bp.frequency.linearRampToValueAtTime(400, t0 + dur); noise(t0, dur, bp) };
  const crujido = (t, dur, a = .08) => { for (let k = 0; k < dur * 14; k++) { const tt = t + k / 14 + r() * .04; noise(tt, .03, filt("bandpass", 600 + r() * 900, 4, envG(tt, a * (.3 + r() * .7), .002, .03, fx))) } };
  const caida = (t, a = .2) => { crujido(t, 1.2, .08); thud(t + 1.2, a, 40, 1.2); noise(t + 1.2, 1, filt("lowpass", 900, .7, envG(t + 1.2, a * .5, .01, .8, fx))) };
  // el cuerno: una nota grave y larga, con armónicos y soplido (pocos efectos, debajo de la voz: en el terror de Volze no hay un golpe por barrido)
  const cuerno = (t, dur, a = .09) => { const g = oc.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(a, t + .25); g.gain.setValueAtTime(a, t + dur * .7); g.gain.linearRampToValueAtTime(0, t + dur); g.connect(fx);
    [[87.3, 1], [174.6, .5], [261.9, .28], [349.2, .12]].forEach(([f, v]) => { const gg = oc.createGain(); gg.gain.value = v; gg.connect(filt("lowpass", 900, .6, g)); const o = osc("sawtooth", f, t, t + dur, gg); o.frequency.setValueAtTime(f * .97, t); o.frequency.linearRampToValueAtTime(f, t + .4) }); noise(t, dur, filt("bandpass", 500, 1.5, envG(t, a * .25, .2, dur, fx))) };
  const zumbido = (t0, t1, a = .02) => { const g = oc.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(a, t0 + .6); g.gain.setValueAtTime(a, Math.max(t0 + .7, t1 - .5)); g.gain.linearRampToValueAtTime(0, t1); g.connect(fx); const o = osc("sine", 58, t0, t1, g), lg = oc.createGain(); lg.gain.value = 1.5; lg.connect(o.frequency); osc("sine", .7, t0, t1, lg); osc("sine", 116, t0, t1, filt("lowpass", 300, .5, g)) };
  // la mañana: el zumbido que solo oye Bee
  zumbido(sl(I.listen2) + .9, sl(I.dez), .025);
  // el recuerdo: fuego, la nota de Dez, los pasos y las casas
  crepita(sl(I.dez), sl(I.note), .04); cuerno(wt(I.dez, 7), 1.6, .08); cuerno(sl(I.note), .9, .1);
  for (let k = 0; k < 3; k++) paso(sl(I.eleven) + .15 + k * .6); for (let k = 0; k < 3; k++) { const t = sl(I.nine) + .2 + k * .55; paso(t); crujido(t, .5, .09) }
  rumble(sl(I.night), 1.4, .07, 40);
  // la tormenta
  viento(sl(I.storm), sl(I.eyes) - sl(I.storm), .05); viento(sl(I.today), 1.2, .05); whoosh(sl(I.storm), 1.6, .08, 200, 900); viento(sl(I.scream), 3.4, .05);
  // la nota del narrador: suena de «blew» a «rolling», y otra vez en «kept blowing»
  cuerno(sl(I.today), 1, .07); cuerno(sl(I.blew), el(I.rolling) + .4 - sl(I.blew), .11); cuerno(wt(I.stayed, 4), 1.4, .09);
  // Onetusk baja: arena del lomo, pasos pesados, tazas, estanques
  rumble(sl(I.turned), 1.3, .08, 36); for (let k = 0; k < 2; k++) paso(sl(I.one) + .15 + k * .7); for (let k = 0; k < 5; k++) clink(wt(I.one, 4) + k * .09, .05);
  for (let k = 0; k < 2; k++) paso(sl(I.five) + .1 + k * .7); splash(wt(I.five, 4), .1); for (let k = 0; k < 3; k++) paso(sl(I.shadow) + .1 + k * .6);
  crujido(wt(I.trunk, 6) - .1, 1, .12); thud(wt(I.trunk, 6), .22, 55, .5);
  // los pernos, el cuerno que se suelta, y el silencio cuando deja de zumbar
  for (let k = 0; k < 4; k++) { const t = sl(I.pins) + .15 + k * .16; noise(t, .05, filt("bandpass", 2400, 3, envG(t, .08, .002, .04, fx))); thud(t, .08, 160, .08) }
  creak(wt(I.pins, 4), 1.1, .07); thud(sl(I.caught) + .35, .2, 70, .5); zumbido(sl(I.face), wt(I.eyes, 4), .03);
  for (let k = 0; k < 3; k++) paso(sl(I.back) + .2 + k * .75); zumbido(wt(I.heard, 5), DUR, .035);
