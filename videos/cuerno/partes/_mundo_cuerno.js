// ================= DUSTMERE: pueblo de adobe en un valle de desierto, de día (provisorio) =================
CABEZA.visible = false; ALETAS.forEach(a => a.piv.visible = false); COLA.visible = false; COSTA.visible = false; FOAM.visible = false; FONDO.visible = false;
BOTES.forEach(b => b.visible = false); GAVIOTAS.forEach(g => g.visible = false); LUCES.forEach(l => l.visible = false); ESPUMA.forEach(s => s.visible = false); SALPI.forEach(s => s.visible = false);
NUBE.forEach(s => s.visible = false); ROPA3.forEach(m => m.visible = false);
GALLINAS.forEach(g => g.visible = false);
TURT.children.forEach(o => { if (o.material && o.material.map === T_LADO) o.visible = false; if (o.isInstancedMesh && o.geometry === GEO_PERCEBE) o.visible = false });
HOUSES.forEach(H => H.g.visible = false);
