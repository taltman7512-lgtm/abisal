  // ★ HISTORIA "Nobody Hears The Bell". Solo efectos: la música de fondo se mezcla después.
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
  // la campana: zumbido grave de bronce (siempre, más fuerte cerca), cera que burbujea, cadenas que crujen, viento en la altura,
  // el «thud» final, la ciudad que murmura; cerca de Sallow: silencio frío y un tono agudo casi inaudible
  const zumbido = (t0, dur, a = .03, f = 55) => { if (dur <= .1) return; const g = oc.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(a, t0 + Math.min(1.5, dur * .3)); g.gain.setValueAtTime(a, Math.max(t0 + .2, t0 + dur - 1)); g.gain.linearRampToValueAtTime(0, t0 + dur); g.connect(fx);
    [1, 2.01, 2.76, 4.07].forEach((m, k) => { const o = osc("sine", f * m, t0, t0 + dur, g); o.detune.value = Math.sin(k) * 6 }) };
  const burbuja = (t0, dur, a = .03) => { for (let t = t0; t < t0 + dur; t += .12 + r() * .2) { const o = osc("sine", 300 + r() * 500, t, t + .06, envG(t, a * (.4 + r() * .6), .004, .05, fx)); o.frequency.exponentialRampToValueAtTime(900 + r() * 600, t + .05) } };
  const cadenaC = (t, dur = 1.4, a = .06) => { creak(t, dur, a); for (let k = 0; k < 5; k++) clink(t + k * dur / 5 + r() * .1, a * .5) };
  const agudo = (t0, dur, a = .006) => { if (dur <= .1) return; osc("sine", 3150, t0, t0 + dur, envG(t0, a, 1, dur - 1, fx)) };
  // la campana de fondo todo el video, más fuerte adentro
  zumbido(0, sl(I.climb), .018); zumbido(sl(I.climb), sl(I.inside) - sl(I.climb), .03); zumbido(sl(I.inside), sl(I.thud) - sl(I.inside), .07, 52);
  // la ciudad
  rumble(sl(I.plug), 2, .03, 80); bell(sl(I.rule) + .2, .05); burbuja(sl(I.work), 3, .03); burbuja(sl(I.climb), 2, .03);
  // Sallow: frío, agudo casi inaudible, velas
  agudo(sl(I.sallow), sl(I.work) - sl(I.sallow), .007); whoosh(sl(I.candles) + .2, 1.2, .04, 150, 500); agudo(sl(I.hammer), sl(I.thud) - sl(I.hammer), .006);
  // descubrimientos
  clink(wt(I.hole, 4), .06); thud(sl(I.ledger) + .2, .06, 120, .2);
  // la trepada: cadenas, viento en la altura
  cadenaC(sl(I.climb) + 1, 1.6, .06); cadenaC(sl(I.links), 1.4, .06); viento(sl(I.clouds), sl(I.inside) - sl(I.clouds), .05, 500, 1200);
  // adentro: el martillo, la cera, el thud
  splash(sl(I.pour) + .3, .1); burbuja(sl(I.pour), 2.5, .05); whoosh(sl(I.swing), .8, .08, 120, 600); thud(sl(I.thud) + .15, .25, 45, 1.2);
  whoosh(sl(I.fell) + .8, 1.6, .04, 800, 150);
  // abajo: la ciudad que se enciende, pájaros al final
  for (let k = 0; k < 6; k++) clink(sl(I.below) + .3 + k * .35, .03); pajaros(sl(I.nightly), DUR, .015);
