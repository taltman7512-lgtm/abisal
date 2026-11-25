# Arma _anguila.js a partir del motor de la tortuga (_base_tortuga.js) + el mundo nuevo + las escenas nuevas
import re, os
D = os.path.dirname(os.path.abspath(__file__))
s = open(os.path.join(D, "_base_tortuga.js"), encoding="utf-8").read()
def rep(a, b):
    global s
    assert a in s, a[:100]
    s = s.replace(a, b, 1)
# la roca: el caparazón pintado de piedra gris con musgo (mismas celdas, colores de roca)
rep('g.fillStyle = "#2a2416"; g.fillRect(0, 0, w, h);\n  const S = [];', 'g.fillStyle = "#46463f"; g.fillRect(0, 0, w, h);\n  const S = [];')
rep('const tono = ["#6e5e36", "#5e5030", "#7a6838", "#54482a", "#68583a", "#73623c"][r() * 6 | 0];', 'const tono = ["#6e6c64", "#5e5c56", "#7a786e", "#54524c", "#686660", "#73706a"][r() * 6 | 0];')
rep('gr.addColorStop(0, rgbj("#8a7a4a", r, 26));', 'gr.addColorStop(0, rgbj("#9a988c", r, 26));')
rep('  pm.count = n }\n\nconst M_CAPA', '  pm.count = n; pm.visible = false }\n\nconst M_CAPA')
# sin reglas en las puertas; el cartel de oficio de la casa 3 es el del hojalatero
rep('[...CASAS, NUESTRA, PANADERIA, ESCUELA].forEach(H => part(new THREE.BoxGeometry(.25, 1.6, .06), M_REGLA, 1.05, 1.7, 3.06, H.walls[0], 0));', '')
rep('cartelito(CASAS[3], "RULERS", "#5a4a1a");', 'cartelito(CASAS[3], "TINKER", "#5a4a1a");')
rep('const PISO_LIBRE = [[-9, 2, 2.6],', 'const PISO_LIBRE = [[0, 1.5, 2.3], [-9, 2, 2.6],')
rep('dentro = i => (p.getX(i) / SB) ** 2 + (p.getZ(i) / SA) ** 2 < 1;', 'dentro = i => (p.getX(i) / SB) ** 2 + (p.getZ(i) / SA) ** 2 < 1 && (p.getX(i) ** 2 + (p.getZ(i) - 1.5) ** 2) > 1.52 ** 2;')   # agujero del pozo
rep('enConcha(pozo, -2.8, 1, .3);', 'enConcha(pozo, -2.8, 1, .3); pozo.visible = false;')
rep('enConcha(PECERA, 2.4, -2.5, 0, -.05);', 'enConcha(PECERA, 2.4, -2.5, 0, -.05); PECERA.visible = false;')
# la hermana Wren (usa el lugar de ME6): remera rosa, trenzas
rep('const ME6 = kid({ skin: "#e8b48c", shirt: "#d1872e", cloth: "plain", pants: "#3a4a5a", shoes: "#4a3020", hair: "#3a2416", style: "despeinado" });', 'const ME6 = kid({ skin: "#e8b48c", shirt: "#c9506a", cloth: "plain", pants: "#4a3a5a", shoes: "#4a3020", hair: "#5a3418", style: "despeinado" });')
rep('robloxify(ME6, { skin: "#e8b48c", shirt: "#d1872e", pants: "#3a4a5a", shoes: "#4a3020", pelo: ["puntas", "#3a2416"] });', 'robloxify(ME6, { skin: "#e8b48c", shirt: "#c9506a", pants: "#4a3a5a", shoes: "#4a3020", pelo: ["trenzas", "#5a3418"] });')
rep('telaReal(ME6, { shirt: "#d1872e", pants: "#3a4a5a", shoes: "#4a3020" });', 'telaReal(ME6, { shirt: "#c9506a", pants: "#4a3a5a", shoes: "#4a3020" });')
# secciones: mundo nuevo al final de MUNDO; LUGAR, SHOTS y ESCENA reemplazadas
nuevo = open(os.path.join(D, "_nuevo_mundo.js"), encoding="utf-8").read()
rep("\n//@@ELENCO\n", "\n" + nuevo + "\n//@@ELENCO\n")
esc = open(os.path.join(D, "_nuevas_escenas.js"), encoding="utf-8").read()
i0, i1 = s.index("//@@LUGAR"), s.index("//@@TEXTURAS")
s = s[:i0] + esc.rstrip() + "\n\n" + s[i1:]
open(os.path.join(D, "_anguila.js"), "w", encoding="utf-8").write(s)
print("ok", s.count("\n"), "líneas")
