  // ★ HISTORIA "Nobody Whistles In Wrenmoor". Solo efectos: la música de fondo se mezcla después.
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
  // el arranque: el silbido en el pozo, el fuego detrás
  silbido(sl(I.hook) + .15, 1300, 1900, .9, .06); crepita(0, el(I.behind), .03); rumble(wt(I.cost, 8), 1.4, .12, 40); splash(wt(I.cost, 9), .12); whoosh(sl(I.takes), 1, .1, 200, 900);
  // el recuerdo: la pava silba, la soga se tensa, el agua sube y sale la anguila
  pava(wt(I.tinker, 6), 2.2, .05); creak(sl(I.tight), 1.2, .07); gorgoteo(sl(I.rose), 2, .07); splash(wt(I.head, 2), .16); rumble(sl(I.coils), 2.5, .12, 36); thud(wt(I.kitchen, 6), .3, 50, .6); whoosh(sl(I.flat), 1.6, .08, 900, 200);
  // Wren silba bajito en el granero
  silbido(sl(I.barn) + .3, 1500, 1700, .5, .03); silbido(sl(I.barn) + 1.0, 1600, 1500, .4, .03);
  // el incendio
  crepita(sl(I.fire), el(I.ran), .035); whoosh(sl(I.wind), 1.5, .08, 300, 1200);
  // el silbido fuerte, la soga, el agua y la anguila que sube
  silbido(wt(I.lean, 7), 1200, 2000, 1.2, .09); silbido(sl(I.loud) + .1, 1400, 2200, 1.3, .1); creak(sl(I.tight2), 1.2, .08); gorgoteo(sl(I.rose2), 2, .08); splash(sl(I.up) + .2, .18); rumble(sl(I.up), 2.4, .14, 34);
  // apaga el fuego: siseos y vapor
  sisea(wt(I.bakery, 4), 2, .08); sisea(sl(I.hiss), 2.4, .12); sisea(sl(I.next), 1, .1); sisea(wt(I.next, 4), 1, .1); for (let k = 0; k < 3; k++) sisea(sl(I.steam) + k * .6, 1, .08);
  // se da vuelta, se va
  rumble(sl(I.turned), 1.2, .08, 40); whoosh(sl(I.didnt) + .3, 2, .1, 900, 150); gorgoteo(wt(I.didnt, 6), 1.2, .06);
