// ---------- elenco de Dustmere (provisorio: el del motor)
robloxify(ME, { skin: "#e8b48c", shirt: "#d1872e", pants: "#3a4a5a", shoes: "#4a3020", pelo: ["puntas", "#3a2416"] });
robloxify(ME6, { skin: "#e8b48c", shirt: "#d1872e", pants: "#3a4a5a", shoes: "#4a3020", pelo: ["puntas", "#3a2416"] });
robloxify(QUILL, { skin: "#f0c6a0", shirt: "#2e2e4a", cloth: "suit", alt: "#a82a2a", pants: "#2e2e4a", shoes: "#111", pelo: ["corto", "#9a9a9a"] });
robloxify(PIM, { skin: "#c98e64", shirt: "#f2ece0", pants: "#5a4632", pelo: ["corto", "#2b211b"] });
robloxify(GARROW, { skin: "#d9b08c", shirt: "#3a5a4a", cloth: "sweater", alt: "#c9b48a", pants: "#3a3236", pelo: ["rodete", "#e9e4dc"] });
FOLK.forEach((k, i) => robloxify(k, { skin: ["#c98e64", "#f2cfae", "#e8b48c", "#efc8a8", "#8a5a3c", "#f2cfae"][i], shirt: ["#7a3a2a", "#3f6a8a", "#5a7a3a", "#8a5a8a", "#c9a23a", "#3a4a5a"][i], cloth: ["plaid", "sweater", "plain", "sweater", "plain", "plain"][i], alt: "#d9c7a0", pants: ["#3a3236", "#3a3f4a", "#3a2f28", "#3a3236", "#2e3a59", "#2a2420"][i], pelo: k.peloR6 }));
EXT.forEach((k, i) => robloxify(k, { skin: ["#efc8a8", "#8a5a3c", "#f2cfae", "#c98e64"][i], shirt: ["#b85a3a", "#4a8a6a", "#e0c060", "#7a4a8a"][i], pants: ["#3a3f4a", "#3a2f28", "#2e3a59", "#2a2420"][i], pelo: [["liso", "#6b3f22"], ["rulos", "#1d1a17"], ["trenzas", "#c9a06a"], ["corto", "#3a2416"]][i] }));
robloxify(PESCADOR, { skin: "#c98e64", shirt: "#e8c040", pants: "#3a4a5a", pelo: ["corto", "#5a3a22"] }); { const ca = new THREE.Group(); part(new THREE.CylinderGeometry(.03, .05, 4, 6), SM("#7a5030"), 0, 1.6, 0, ca, 0); ca.rotation.x = 1.1; PESCADOR.handR.add(ca); part(new THREE.CylinderGeometry(.01, .01, 4.5, 4), SM("#dddddd"), 0, 1.6, 2.3, ca, 0) }
// sombrero de copa del intendente, gorro de panadero, barba de Garrow
{ const hm = SM("#1a1a1e", { roughness: .5 }); part(new THREE.CylinderGeometry(.34, .34, .6, 18), hm, 0, 1.05, 0, QUILL.head, 0); part(new THREE.CylinderGeometry(.52, .52, .05, 20), hm, 0, .76, 0, QUILL.head, 0); part(new THREE.CylinderGeometry(.35, .35, .1, 18), SM("#a82a2a"), 0, .82, 0, QUILL.head, 0);
  cocinero(PIM); barbaSensei(GARROW, "#ece8e0") }
// tela con relieve y piezas 3D para todos (el traje del intendente y la chaqueta del cocinero sin botones de camisa)
telaReal(ME, { shirt: "#d1872e", pants: "#3a4a5a", shoes: "#4a3020" }); telaReal(ME6, { shirt: "#d1872e", pants: "#3a4a5a", shoes: "#4a3020" });
telaReal(QUILL, { shirt: "#2e2e4a", pants: "#2e2e4a", shoes: "#111", botones: false, bolsillo: false }); telaReal(PIM, { shirt: "#f2ece0", pants: "#5a4632", botones: false, bolsillo: false, cinto: false });
telaReal(GARROW, { shirt: "#3a5a4a", pants: "#3a3236", botones: false });
FOLK.forEach((k, i) => telaReal(k, { shirt: ["#7a3a2a", "#3f6a8a", "#5a7a3a", "#8a5a8a", "#c9a23a", "#3a4a5a"][i], pants: ["#3a3236", "#3a3f4a", "#3a2f28", "#3a3236", "#2e3a59", "#2a2420"][i], botones: i % 2 === 0, bolsillo: i % 3 !== 1 }));
EXT.forEach((k, i) => telaReal(k, { shirt: ["#b85a3a", "#4a8a6a", "#e0c060", "#7a4a8a"][i], pants: ["#3a3f4a", "#3a2f28", "#2e3a59", "#2a2420"][i], botones: i % 2 === 1 }));
telaReal(PESCADOR, { shirt: "#e8c040", pants: "#3a4a5a" });
// bajo la galera y el gorro de cocinero no va el pelo entero (asomaba como un ala de sombrero): solo patillas y nuca
[[QUILL, "#9a9a9a"], [PIM, "#2b211b"]].forEach(([k, col]) => { [...k.head.children].forEach(c => { if (c.userData.pelo) k.head.remove(c) }); const mt = new THREE.MeshStandardMaterial({ map: mechTex(col, 7), roughness: .5, flatShading: true });
  for (const s of [-1, 1]) for (let j = 0; j < 3; j++) mechR(k.head, mt, [[s * .36, .68, -.02 - j * .12], [s * .4, .5, -.05 - j * .12], [s * .38, .32, -.03 - j * .1]], .07, .02, 1.5);
  for (let j = 0; j < 4; j++) mechR(k.head, mt, [[-.27 + j * .18, .68, -.35], [-.27 + j * .18, .48, -.4], [-.25 + j * .17, .3, -.37]], .08, .02, 1.5) });

