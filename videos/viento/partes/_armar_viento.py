# Arma _viento.js a partir del motor (_base_tortuga.js) + el mundo, el elenco y las escenas de Dustmere
import os
D = os.path.dirname(os.path.abspath(__file__))
s = open(os.path.join(D, "_base_tortuga.js"), encoding="utf-8").read()
def rep(a, b):
    global s
    assert a in s, a[:100]
    s = s.replace(a, b, 1)
rep('  pm.count = n }\n\nconst M_CAPA', '  pm.count = n; pm.visible = false }\n\nconst M_CAPA')
# v3 (pedido del dueño): el pueblo vive en la tierra, no en una cúpula: el lomo pasa a ser el piso del valle (casi plano)
rep('const SA = 34, SB = 27, SH = 11, RIM = 5;', 'const SA = 34, SB = 27, SH = .3, RIM = .06;')
rep('[...CASAS, NUESTRA, PANADERIA, ESCUELA].forEach(H => part(new THREE.BoxGeometry(.25, 1.6, .06), M_REGLA, 1.05, 1.7, 3.06, H.walls[0], 0));', '')
rep('cartelito(CASAS[3], "RULERS", "#5a4a1a");', 'cartelito(CASAS[3], "POTS", "#5a4a1a");')
rep('enConcha(PECERA, 2.4, -2.5, 0, -.05);', 'enConcha(PECERA, 2.4, -2.5, 0, -.05); PECERA.visible = false;')
rep('const CARTEL = new THREE.Group(); enConcha(CARTEL, 3.2, 3.5, -.4);', 'const CARTEL = new THREE.Group(); enConcha(CARTEL, 3.2, 3.5, -.4); CARTEL.visible = false;')
rep('enConcha(TAZAS, 2.6, 13.5, -Math.PI / 2, -.1);', 'enConcha(TAZAS, 2.6, 13.5, -Math.PI / 2, -.1); TAZAS.visible = false;')
# elenco: se reemplaza todo el estilo de personajes del video de la tortuga
i0 = s.index("robloxify(ME, {"); i1 = s.index("//@@LUGAR")
# (elenco de Gusthollow) _volze_personajes.js va PRIMERO: el elenco nuevo usa sus funciones y vuelve a vestir a todos al final
s = s[:i0] + (open(os.path.join(D, "_volze_personajes.js"), encoding="utf-8").read() + chr(10) + open(os.path.join(D, "_elenco_viento.js"), encoding="utf-8").read()) + "\n" + s[i1:]
NL = chr(10)
rep(NL + "//@@ELENCO" + NL, NL + NL.join(open(os.path.join(D, f), encoding="utf-8").read() for f in ["_comun_viento.js", "_mundo_viento.js", "_bestia_viento.js", "_detalle_viento.js", "_lejos_viento.js"]) + NL + "//@@ELENCO" + NL)
esc = open(os.path.join(D, "_escenas_viento.js"), encoding="utf-8").read()
i0, i1 = s.index("//@@LUGAR"), s.index("//@@TEXTURAS")
s = s[:i0] + esc.rstrip() + "\n\n" + s[i1:]
open(os.path.join(D, "_viento.js"), "w", encoding="utf-8").write(s)
print("ok", s.count("\n"), "líneas")
