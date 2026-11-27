// ================= (vacío) El Mister Sallow «realista» del video anterior ya no existe: Father Crane es un personaje de bloques del elenco
// (CRANE en _elenco_tej.js). Queda este stub `sallowR` con los mismos métodos, vacíos, para que las escenas viejas sigan armando.
const sallowR = (() => { const g = new THREE.Group(); g.name = "sallowR"; g.visible = false; scene.add(g); const nada = () => { };
  return { g, PASO: 1, poner: nada, ocultar: nada, quieto: nada, andar: nada, ladear: nada, inclinarse: nada, frasco: nada, martillo: nada, golpe: nada, caer: nada, aura: nada, climas: nada,
    headW: () => g.position.clone(), ojoW: () => g.position.clone(), ojoCam: () => g.position.toArray(), caraCam: () => g.position.toArray() } })();
