  // ★ HISTORIA "We Pay The Mountain In Teeth". Solo efectos: la música de fondo se mezcla después.
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
  const N_ = n => ORDEN.indexOf(n), sn = n => sl(N_(n)), fin = n => sl(N_(n) + 1);
  // la montaña: piedra que cruje al abrir la boca, retumbos al inclinarse, mordiscos, monedas de oro, dientes que caen
  const piedra = (t, dur, a = .1) => { rumble(t, dur, a, 38); creak(t + .1, dur * .8, a * .5) };
  const mordisco = (t, a = .12) => { thud(t, a, 55, .4); noise(t, .12, filt("lowpass", 700, 1, envG(t, a * .5, .002, .1, fx))) };
  const monedas = (t0, dur, a = .05) => { for (let t = t0; t < t0 + dur; t += .07 + r() * .12) clink(t, a * (.4 + r() * .6)) };
  viento(0, DUR, .02, 500, 900); pajaros(0, DUR, .01);
  piedra(sn("open") + .1, 2.4, .12); piedra(sn("end") + .1, 2.2, .1);
  piedra(sn("cost") + .2, 2, .14); mordisco(sn("cost") + 1.2, .18);
  piedra(sn("rumble"), fin("rumble") - sn("rumble") + .6, .18);
  for (let t = sn("run"); t < fin("run"); t += .28) thud(t, .03, 120, .1);
  monedas(sn("gold") + .3, 3, .05);
  for (let t = sn("pour") + .4; t < fin("pour"); t += .09) clink(t, .03);
  for (let t = sn("chew"); t < fin("chew"); t += 1.33) mordisco(t, .14);
  piedra(sn("sleep"), 2.2, .08);
