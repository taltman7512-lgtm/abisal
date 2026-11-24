  // ★ HISTORIA "Nobody Lights A Third Lamp": música propia (sintetizada), con el carácter medido en el modo terror de Volze:
  // tema lento y melancólico tipo caja de música, sin percusión, debajo de la voz durante todo el video, y casi sin efectos (2–7 por minuto).
  // Tramos: canción de cuna de Hollow Fen (Re menor, celesta + cuerdas) → la misma en piano para Pell → la canción de cumpleaños de los
  // Brannock (Fa mayor, coro sin palabras) que se achica y sube → mañana gris → luciérnagas → tema triste del final (entra con el giro).
  const VOLM = 2.7, M = oc.createGain(); M.gain.value = VOLM; const LP = filt("lowpass", 5200, .5, M); M.connect(mus);
  if (window.SOLO === "voz") { M.gain.value = 0; fx.gain.value = 0 }
  const sl = i => i < S.length ? S[i] : DUR, el = i => i < S.length ? S[i] + D[i] : DUR;
  // instrumentos propios (van a LP en vez de a mus)
  const box = (t, m, v = .07) => { const g = envG(t, v, .002, 1.8, LP); osc("sine", mtof(m), t, t + 2, g); osc("sine", mtof(m) * 3.01, t, t + .5, envG(t, v * .25, .001, .35, LP)); osc("sine", mtof(m) * 5.4, t, t + .25, envG(t, v * .08, .001, .15, LP)) };
  const pno = (t, m, v = .12, dur = 3) => { const f = mtof(m), lp = filt("lowpass", 1400 + v * 5000, .5, LP); [1, .4, .2, .1, .05].forEach((a, k) => { const n = k + 1; osc("sine", f * n * (1 + .0004 * n * n), t, t + dur, envG(t, v * a, .005, dur * 1.1 / Math.sqrt(n), lp)) }) };
  const pad = (notes, t0, t1, v = .022, cut = 900, att = 1.5) => { if (t1 <= t0 + .3) return; const lp = filt("lowpass", cut, .6, LP), g = oc.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(v, t0 + Math.min(att, (t1 - t0) / 2)); g.gain.setValueAtTime(v, Math.max(t0 + att, t1 - 1)); g.gain.linearRampToValueAtTime(0, t1); g.connect(lp); for (const m of notes) for (const d of [-6, 0, 6]) { const o = osc("sawtooth", mtof(m), t0, t1, g); o.detune.value = d } };
  const choir = (t, m, dur, v = .05, rise = 0, close = 1) => { const g = oc.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .12); g.gain.setValueAtTime(v, t + dur * .7); g.gain.linearRampToValueAtTime(0, t + dur); const f1 = filt("bandpass", 750, 4, g), f2 = filt("bandpass", 1150, 5, g); g.connect(LP);
    const o = osc("sawtooth", mtof(m), t, t + dur, f1); o.connect(f2); if (rise) o.frequency.exponentialRampToValueAtTime(mtof(m + rise), t + dur); if (close < 1) { f1.frequency.exponentialRampToValueAtTime(750 * close, t + dur); f2.frequency.exponentialRampToValueAtTime(1150 * close, t + dur) } };
  const C2 = { Dm: [50, 53, 57], Bb: [46, 50, 53], Gm: [43, 46, 50], A: [45, 49, 52], F: [41, 45, 48], C: [48, 52, 55], Am: [45, 48, 52], E: [40, 44, 47] };
  // 1) canción de cuna de Hollow Fen: Re menor, 64 por minuto, celesta + pad grave (desde el cuadro 0: el gancho ya tiene música)
  const BT = 60 / 64, MEL = [74, 77, 76, 74, 72, 70, 69, 72, 74, 77, 79, 77, 76, 74, 73, 74], PROG = ["Dm", "Bb", "Gm", "A"];
  const cuna = (t0, t1, inst, v = 1) => { let k = 0; for (let t = t0; t < t1 - .3; t += BT, k++) { const c = PROG[Math.floor(k / 4) % 4]; if (k % 4 === 0) pad(C2[c], t, Math.min(t1, t + BT * 4 + .4), .02 * v, 700); inst(t, MEL[k % 16] - (inst === pno ? 12 : 0), (inst === pno ? .1 : .065) * v); if (k % 2 === 0) pno(t, C2[c][0] - 12, .05 * v, 3) } };
  cuna(0, sl(I.pell), box);
  // el polvo y la Polilla: zumbido grave que respira (sin golpes) mientras está cerca
  const drone = (t0, t1, v = .05, f = 55) => { if (t1 <= t0) return; const g = oc.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(v, t0 + .8); g.gain.setValueAtTime(v, Math.max(t0 + .8, t1 - .8)); g.gain.linearRampToValueAtTime(0, t1); g.connect(LP); const lfo = osc("sine", .9, t0, t1, oc.createGain()), lg = oc.createGain(); lg.gain.value = v * .6; lfo.disconnect(); lfo.connect(lg); lg.connect(g.gain);
    osc("sine", f, t0, t1, g); osc("triangle", f * 1.5, t0, t1, filt("lowpass", 300, 0, g)); noise(t0, t1 - t0, filt("lowpass", 180, 1, g)) };
  drone(sl(I.third), el(I.whole) + .5, .06); drone(sl(I.snow) + 1, sl(I.pell), .07, 49); drone(sl(I.song), sl(I.raked), .06); drone(sl(I.ourroof), sl(I.mine), .07, 52); drone(sl(I.dark), DUR, .07, 46);
  // 2) Pell y el miedo a lo oscuro: la cuna en piano, más lenta y vacía
  { const t0 = sl(I.pell), t1 = sl(I.winter); let k = 0; for (let t = t0; t < t1 - .3; t += BT * 1.3, k++) pno(t, MEL[(k * 2) % 16] - 12, .09, 4); pad(C2.Dm, t0, t1 + .3, .02, 600) }
  // 3) el cumpleaños de los Brannock: canción sin palabras en Fa mayor (coro), que en "going up" se achica, sube y se apaga
  { const SONG = [[0, 65, 1], [1, 67, 1], [2, 69, 2], [4, 72, 1], [5, 70, 1], [6, 69, 2], [8, 67, 1], [9, 69, 1], [10, 70, 1], [11, 67, 1], [12, 65, 3]], bs = .42;
    const sing = (t0, v, rise = 0, close = 1) => SONG.forEach(([b, m, d]) => choir(t0 + b * bs, m, d * bs + .05, v, rise, close));
    pad(C2.F.map(m => m + 12), sl(I.winter), sl(I.song), .016, 900); for (let t = sl(I.winter); t < sl(I.song); t += BT * 2) box(t, [77, 81, 84, 81][Math.round((t - sl(I.winter)) / BT / 2) % 4], .04);
    for (let t0 = sl(I.song) + .2, n = 0; t0 < el(I.up); t0 += SONG.length && 13 * bs, n++) { const q = cl((t0 - sl(I.walls)) / (el(I.up) - sl(I.walls))); sing(t0, .045 * (1 - .85 * q), t0 > sl(I.up) ? 5 : 0, 1 - .6 * q) } }
  // 4) mañana gris: la cuna en piano, muy espaciada; la iglesia con un acorde
  { const t0 = sl(I.raked), t1 = sl(I.stopped); let k = 0; for (let t = t0; t < t1 - .3; t += BT * 2, k++) pno(t, MEL[(k * 3) % 16] - 12, .08, 4); pad(C2.Gm, t0, t1, .016, 600); pad(C2.Dm.map(m => m + 12), sl(I.church2), t1 + .2, .02, 1200) }
  // 5) Pell sonríe y las luciérnagas: brillos agudos que titilan, la cuna en celesta pero en Re mayor (por única vez)
  { const t0 = sl(I.smiling), t1 = sl(I.ourroof), M2 = [74, 78, 76, 74, 73, 71, 69, 73]; let k = 0; for (let t = t0; t < t1 - .3; t += BT, k++) box(t, M2[k % 8], .055); pad([50, 54, 57], t0, t1, .016, 900);
    for (let t = sl(I.jar); t < t1; t += .23) if (r() < .45) box(t, 86 + Math.floor(r() * 8), .022) }
  // 6) el polvo en nuestro techo y Wren: la música casi desaparece; solo el zumbido y una nota que se repite (cuenta)
  { const t0 = sl(I.ourroof), t1 = sl(I.mine); for (let t = t0; t < t1 - .2; t += BT) pno(t, 62, .045, 2); pad([38, 45], t0, t1, .025, 400) }
  // 7) el giro: tema triste nuevo (Re menor → Fa → Do → La), cuerdas que crecen hasta la última palabra y se corta seco
  { const t0 = sl(I.mine), t1 = DUR, prog = ["Dm", "F", "C", "A", "Dm", "Bb", "F", "A"], MT = [[0, 69], [1, 72], [2, 74], [3, 72], [4, 77], [6, 76], [8, 74], [9, 72], [10, 69], [12, 72], [13, 74], [14, 76], [15, 77], [16, 81], [18, 79], [20, 77], [22, 76], [24, 74]], bt = .62;
    prog.forEach((c, j) => { const t = t0 + j * bt * 4; if (t > t1 - .2) return; const v = .018 + .02 * cl((t - t0) / (t1 - t0)); pad(C2[c].map(m => m + 12), t, Math.min(t1, t + bt * 4 + .3), v, 900 + 1400 * cl((t - t0) / (t1 - t0))); pno(t, C2[c][0] - 12, .1, 4) });
    MT.forEach(([b, m]) => { const t = t0 + b * bt; if (t < t1 - .2) pno(t, m, .11, 3) });
    // en la última frase todo queda en un acorde abierto que no resuelve (el video corta con la palabra)
    pad([50, 57, 62, 69], sl(I.last) - .4, t1, .05, 2400, .3) }
  // efectos (pocos, como el canal): bastón ×2, viento desde arriba, crujido del techo, puerta, viento final
  const thud = (t, a = .3, f = 90) => { const o = osc("sine", f * 1.8, t, t + .3, envG(t, a, .002, .2, fx)); o.frequency.exponentialRampToValueAtTime(f * .6, t + .12); noise(t, .04, filt("bandpass", 1800, 2, envG(t, a * .4, .001, .03, fx))) };
  const whoosh = (t, dur, a = .12, f0 = 200, f1 = 1600) => { const g = oc.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(a, t + dur * .4); g.gain.linearRampToValueAtTime(0, t + dur); g.connect(fx); const bp = filt("bandpass", f0, 1.2, g); bp.frequency.exponentialRampToValueAtTime(f1, t + dur * .5); bp.frequency.exponentialRampToValueAtTime(f0, t + dur); noise(t, dur, bp) };
  const creak = (t, dur, a = .05) => { const g = envG(t, a, .1, dur, fx), o = osc("sawtooth", 70, t, t + dur, filt("bandpass", 900, 8, g)); o.frequency.linearRampToValueAtTime(110, t + dur) };
  const ct = wt(I.count, 7); thud(ct, .22, 120); thud(ct + .35, .22, 120);
  whoosh(wt(I.snow, 6), 2.2, .16, 150, 900);
  creak(wt(I.roof, 1), 1.4, .06); whoosh(wt(I.walls, 1), 1.2, .08, 120, 700);
  creak(wt(I.run, 1), .6, .05); whoosh(sl(I.above), 2.6, .14, 120, 800); whoosh(sl(I.wind2), 2.2, .12, 160, 900);
