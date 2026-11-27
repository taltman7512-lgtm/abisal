  // ★ HISTORIA "Nobody Answers The Knock". Solo efectos: la música de fondo se mezcla después.
  const VOLM = 1.5, M = oc.createGain(); M.gain.value = VOLM; const LP = filt("lowpass", 10000, .4, M); M.connect(mus);
  if (window.SOLO === "voz") { M.gain.value = 0; fx.gain.value = 0 }
  if (window.SOLO === "sinmusica") M.gain.value = 0;
  fx.gain.value *= 2.5;   // los efectos tienen que oírse (medido: −54 dB contra −20 de la voz)
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
  // Hollowmere: viento frío de noche, golpes en la puerta, tela que arrastra, la campana de la iglesia, tijeras, el grito
  const golpe = (t, a = .22) => { thud(t, a, 75, .22); noise(t, .05, filt("bandpass", 1400, 2, envG(t, a * .35, .001, .05, fx))); creak(t + .02, .25, a * .15) };
  const tresGolpes = (t, sep = .55, a = .22) => [0, 1, 2].forEach(k => golpe(t + k * sep, a));
  const tela = (t0, dur, a = .035) => { for (let t = t0; t < t0 + dur; t += 1.15) { whoosh(t, .9, a, 180, 600); thud(t + .3, a * 1.4, 50, .35) } };
  const tijera = (t, a = .07) => { noise(t, .04, filt("highpass", 3500, 0, envG(t, a, .001, .03, fx))); clink(t + .005, a * .4) };
  const grito = (t, dur = 2.2, a = .07) => { for (let k = 0; k < 9; k++) { const f = 180 + k * 47 + r() * 30, g = envG(t + k * .03, a / 3, .15, dur, fx), o = osc("sawtooth", f, t + k * .03, t + dur + .3, filt("bandpass", f * 2.2, 4, g)); o.frequency.linearRampToValueAtTime(f * 1.5, t + dur) } noise(t, dur, filt("bandpass", 900, 1, envG(t, a * .5, .1, dur, fx))) };
  const N_ = n => ORDEN.indexOf(n), sn = n => sl(N_(n)), wn = (n, k) => wt(N_(n), k);
  viento(0, DUR, .028, 400, 800);
  tresGolpes(sn("open") + .35); tela(sn("open"), 2, .03);
  tresGolpes(sn("voices") + .5, .5, .16);
  creak(sn("wardrobe") + .3, 1.6, .06);
  bell(sn("crane") + .5, .07); bell(sn("crane") + 2.2, .06);
  tela(sn("smell"), sl(N_("smell") + 1) - sn("smell"), .035);
  bell(sn("bell") + .1, .08); bell(sn("bell") + 1.6, .07);
  tela(sn("notcrane"), sl(N_("notcrane") + 1) - sn("notcrane"), .04);
  tresGolpes(sn("three") + .05, .62, .28);
  creak(sn("window") + .2, 1.2, .05);
  tela(sn("ladder"), 2.5, .03);
  for (let k = 0; k < 6; k++) tijera(sn("cut") + .25 + k * .38, .08);
  grito(sn("scream") + .05, 2.4, .08);
  whoosh(sn("fell") + .1, 1.4, .05, 900, 200); thud(wn("fell", 6), .05, 120, .15);
  tela(sn("walked"), 2.2, .035);
  creak(sn("noknock") + .3, 1.8, .08);
  tresGolpes(sn("readnames") + .4, .6, .12);
  pajaros(sn("morning"), sn("readnames"), .012);
