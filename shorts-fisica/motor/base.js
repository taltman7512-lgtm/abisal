// Base del motor: constantes, azar con semilla y curvas. Todo determinista: mismo cuadro, misma imagen.
window.M = { FPS: 60, W: 1080, H: 1920 };
M.rng = (seed) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
M.hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
M.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
M.lerp = (a, b, t) => a + (b - a) * t;
M.u = (t, a, b) => M.clamp((t - a) / (b - a), 0, 1);            // avance 0..1 entre a y b
M.ss = (x) => x * x * x * (x * (x * 6 - 15) + 10);               // smootherstep
M.out = (x) => 1 - Math.pow(1 - x, 3);                           // frena al final
M.inn = (x) => x * x * x;                                        // arranca lento (caídas)
M.back = (x) => { const c = 2.2; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); }; // se pasa y vuelve
M.E = { lin: (x) => x, ss: M.ss, out: M.out, inn: M.inn, back: M.back };
// Llaves: [[t, valor, curva?], ...] -> valor en t (la curva es la de llegada a esa llave)
M.key = (t, ks) => {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) { const a = ks[i - 1], b = ks[i]; return M.lerp(a[1], b[1], (M.E[b[2]] || M.ss)(M.u(t, a[0], b[0]))); }
  return ks[ks.length - 1][1];
};
// Saltitos: n rebotes de altura h entre t0 y t1 (devuelve altura >= 0)
M.hops = (t, t0, t1, n, h) => (t <= t0 || t >= t1) ? 0 : h * Math.abs(Math.sin(M.u(t, t0, t1) * Math.PI * n));
