// Física de bolitas blandas (dinámica basada en posiciones). Estable con pilas de cientos de bolas.
// Unidades: píxeles a 1080x1920 y segundos.
M.World = class {
  constructor(o) { Object.assign(this, { b: [], g: 2600, ground: 1590, x0: 0, x1: 1080, sub: 3, iters: 4, ev: [], t: 0 }, o); this.nid = 1; }
  add(o) {
    const b = Object.assign({ id: this.nid++, x: 0, y: 0, vx: 0, vy: 0, r: 40, m: 1, e: 0.42, dyn: true, sq: 0, sqv: 0, ang: 0, gc: 0, touch: 0, cov: 0, born: this.t, kind: 'm' }, o);
    this.b.push(b); return b;
  }
  remove(b) { const i = this.b.indexOf(b); if (i >= 0) this.b.splice(i, 1); }
  step(dt) {
    const B = this.b, h = dt / this.sub, G = this.ground;
    for (let s = 0; s < this.sub; s++) {
      let maxR = 10;
      for (const b of B) { if (b.r > maxR) maxR = b.r; b.gc = 0; b.touch = 0; b.cov = 0; b.wall = 0; if (!b.dyn) continue; b.vy += this.g * h; b.px = b.x; b.py = b.y; b.pvx = b.vx; b.pvy = b.vy; b.x += b.vx * h; b.y += b.vy * h; }
      const cs = maxR * 2 + 2;
      for (let it = 0; it < this.iters; it++) {
        const grid = new Map();
        for (const b of B) { const k = Math.floor(b.x / cs) * 4096 + Math.floor(b.y / cs); let c = grid.get(k); if (!c) grid.set(k, c = []); c.push(b); }
        for (const a of B) {
          const cx = Math.floor(a.x / cs), cy = Math.floor(a.y / cs);
          for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
            const c = grid.get((cx + i) * 4096 + cy + j); if (!c) continue;
            for (const o of c) {
              if (o.id <= a.id || (!a.dyn && !o.dyn) || a.ghost || o.ghost) continue;
              let dx = o.x - a.x, dy = o.y - a.y; const min = a.r + o.r, d2 = dx * dx + dy * dy;
              if (d2 >= min * min) continue;
              let d = Math.sqrt(d2); if (d < 0.01) { dx = 0.01; dy = -1; d = 1; }
              const wa = a.dyn ? 1 / a.m : 0, wb = o.dyn ? 1 / o.m : 0, k = 0.7 * (min - d) / d / (wa + wb);
              a.x -= dx * k * wa; a.y -= dy * k * wa; o.x += dx * k * wb; o.y += dy * k * wb;
              a.touch = o.touch = 1; if (dy < -0.5 * a.r) a.cov = 1; if (dy > 0.5 * o.r) o.cov = 1;
            }
          }
        }
        for (const b of B) { if (!b.dyn) continue;
          if (b.y + b.r > G) { b.y = G - b.r; b.gc = 1; }
          if (b.x - b.r < this.x0) { b.x = this.x0 + b.r; b.wall = 1; } else if (b.x + b.r > this.x1) { b.x = this.x1 - b.r; b.wall = -1; }
        }
      }
      for (const b of B) { if (!b.dyn) continue;
        b.vx = (b.x - b.px) / h; b.vy = (b.y - b.py) / h;
        if (b.gc) { if (b.pvy > 380) { b.vy = -b.pvy * b.e; b.sqv += Math.min(b.pvy, 2400) * 0.0045; this.ev.push({ t: this.t, k: 'land', v: Math.min(1, b.pvy / 2000), r: b.r, kind: b.kind }); } b.vx *= 0.975; }
        if (b.wall && Math.abs(b.pvx) > 300) b.vx = -b.pvx * 0.4;
        if (b.touch) { b.vx *= 0.992; b.vy *= 0.992; }
        const sp = Math.hypot(b.vx, b.vy), mx = 4200; if (sp > mx) { b.vx *= mx / sp; b.vy *= mx / sp; }
      }
    }
    // Gelatina: resorte amortiguado del aplastamiento + inclinación según la velocidad
    for (const b of B) {
      b.sqv += (-520 * b.sq - 15 * b.sqv) * dt; b.sq = M.clamp(b.sq + b.sqv * dt, -0.3, 0.42);
      if (b.spin) { b.ang += b.vx * dt / b.r * 0.55; b.ang = Math.atan2(Math.sin(b.ang), Math.cos(b.ang)); if (b.touch || b.gc) { b.ang -= b.ang * Math.min(1, dt * 6); b.vx *= 0.93; } }   // al apoyarse se endereza y frena
      else b.ang += (M.clamp(b.vx * 0.00035, -0.3, 0.3) - b.ang) * Math.min(1, dt * 9);
    }
    this.t += dt;
  }
};
