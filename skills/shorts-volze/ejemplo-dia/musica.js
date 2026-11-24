  // ★ HISTORIA "We Live On Its Back" (modo día). El dueño pidió el video SIN canción de fondo: la entrega es voz + efectos
  // (--sinmusica). La música propia queda solo para la versión «con música»: ostinato curioso en mayor, sin batería.
  const VOLM = 1.2, M = oc.createGain(); M.gain.value = VOLM; const LP = filt("lowpass", 10000, .4, M); M.connect(mus);
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
  tramo(0, sl(I.cold), ["C", "G", "Am", "F"], 104, 1);                // el pueblo, curioso
  tramo(sl(I.cold), sl(I.rose), ["Am", "F", "Dm", "E"], 84, .8);       // el sótano de Pim
  tramo(sl(I.rose), sl(I.turned), ["C", "G", "Am", "F"], 96, .8);
  tramo(sl(I.turned), sl(I.turns), ["Dm", "Bb", "Am", "E"], 92, .9);  // se va a lo hondo
  tramo(sl(I.turns), DUR, ["F", "C", "G", "C"], 80, 1);                // vuelve a la costa

  // ---- efectos (≈ 6 por minuto, debajo de la voz) ----
  const thud = (t, a = .3, f = 60, dec = .5) => { const o = osc("sine", f * 1.8, t, t + dec + .3, envG(t, a, .004, dec, fx)); o.frequency.exponentialRampToValueAtTime(f * .6, t + .15); noise(t, .06, filt("lowpass", 400, 1, envG(t, a * .3, .002, .06, fx))) };
  const rumble = (t, dur, a = .12, f = 45) => { const g = oc.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(a, t + dur * .3); g.gain.linearRampToValueAtTime(0, t + dur); g.connect(fx); noise(t, dur, filt("lowpass", 160, 1, g)); osc("sine", f, t, t + dur, g) };
  const whoosh = (t, dur, a = .1, f0 = 200, f1 = 1400) => { const g = oc.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(a, t + dur * .4); g.gain.linearRampToValueAtTime(0, t + dur); g.connect(fx); const bp = filt("bandpass", f0, 1.2, g); bp.frequency.exponentialRampToValueAtTime(f1, t + dur); noise(t, dur, bp) };
  const creak = (t, dur, a = .05) => { const g = envG(t, a, .1, dur, fx), o = osc("sawtooth", 70, t, t + dur, filt("bandpass", 900, 8, g)); o.frequency.linearRampToValueAtTime(110, t + dur) };
  const clink = (t, a = .05) => { [2637, 3951, 5274].forEach((f, k) => osc("sine", f * (1 + r() * .01), t, t + .5, envG(t, a / (k + 1), .001, .25, fx))) };
  const bell = (t, a = .1) => { [[220, 1], [440, .6], [528, .35], [660, .3], [880, .18], [1188, .1]].forEach(([f, v]) => osc("sine", f, t, t + 3.2, envG(t, a * v, .002, 2.6, fx))) };
  const dig = (t, a = .12) => { noise(t, .18, filt("bandpass", 700, 1.5, envG(t, a, .003, .14, fx))); noise(t + .02, .1, filt("highpass", 2500, 0, envG(t + .02, a * .4, .001, .06, fx))) };
  const splash = (t, a = .14) => { noise(t, 1.4, filt("lowpass", 1800, .7, envG(t, a, .01, 1.1, fx))); whoosh(t, .8, a * .6, 300, 2500) };
  // el paso de la tortuga y las tazas que tiemblan
  thud(wt(I.walks, 5), .3, 40, .9); thud(wt(I.rattle, 2), .28, 40, .9); for (let k = 0; k < 5; k++) clink(wt(I.rattle, 2) + .05 + k * .07, .04);
  // el corazón: dos latidos graves, tres veces
  for (let k = 0; k < 3; k++) { const t = wt(I.heart, 6) + k * .9; thud(t, .22, 38, .35); thud(t + .22, .16, 38, .3) }
  // el zumbido que hace vibrar las ventanas
  { const t = wt(I.hum, 2), g = oc.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.06, t + .4); g.gain.linearRampToValueAtTime(0, el(I.hum) + .4); g.connect(fx); osc("sine", 82, t, el(I.hum) + .5, g); osc("triangle", 164, t, el(I.hum) + .5, filt("lowpass", 400, 0, g)) }
  // el sótano de Pim: el suelo se enfría, se inclina, entra el agua, la panadería se hunde
  rumble(sl(I.cold), 1.6, .1, 40); creak(wt(I.tilted, 3), 1.4, .06); rumble(wt(I.tilted, 2), 2, .14, 36);
  whoosh(sl(I.water), 1.8, .12, 150, 900); splash(wt(I.bakery, 5), .16);
  // se da vuelta hacia lo hondo
  rumble(sl(I.turned), 1.8, .1, 38); splash(sl(I.market) + .3, .1);
  // Garrow en la campana: suena durante toda la frase
  for (let t = sl(I.bell) + .1; t < el(I.bell) + .6; t += .75) bell(t, .07);
  // las tres paladas, el golpe contra algo vivo y la tortuga que se sacude
  dig(wt(I.one, 1)); dig(wt(I.two2, 0)); dig(wt(I.three, 0)); thud(wt(I.alive, 3), .3, 70, .25);
  rumble(sl(I.flinch), 1.4, .16, 34); whoosh(sl(I.flinch), 1, .1, 120, 600);
  // el agua que se va de las calles como un suspiro
  whoosh(sl(I.sigh), 2.4, .12, 900, 180);
