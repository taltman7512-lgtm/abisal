# Arma _pinos.js a partir del motor (_base_tortuga.js) + el mundo, el elenco y las escenas de Hollowpine
import os
D = os.path.dirname(os.path.abspath(__file__))
s = open(os.path.join(D, "_base_tortuga.js"), encoding="utf-8").read()
def rep(a, b):
    global s
    assert a in s, a[:100]
    s = s.replace(a, b, 1)
rep('  pm.count = n }\n\nconst M_CAPA', '  pm.count = n; pm.visible = false }\n\nconst M_CAPA')
rep('[...CASAS, NUESTRA, PANADERIA, ESCUELA].forEach(H => part(new THREE.BoxGeometry(.25, 1.6, .06), M_REGLA, 1.05, 1.7, 3.06, H.walls[0], 0));', '')
rep('cartelito(CASAS[3], "RULERS", "#5a4a1a");', 'cartelito(CASAS[3], "FURS", "#5a4a1a");')
rep('enConcha(PECERA, 2.4, -2.5, 0, -.05);', 'enConcha(PECERA, 2.4, -2.5, 0, -.05); PECERA.visible = false;')
rep('const CARTEL = new THREE.Group(); enConcha(CARTEL, 3.2, 3.5, -.4);', 'const CARTEL = new THREE.Group(); enConcha(CARTEL, 3.2, 3.5, -.4); CARTEL.visible = false;')
rep('enConcha(TAZAS, 2.6, 13.5, -Math.PI / 2, -.1);', 'enConcha(TAZAS, 2.6, 13.5, -Math.PI / 2, -.1); TAZAS.visible = false;')
# elenco: se reemplaza todo el estilo de personajes del video de la tortuga
i0 = s.index("robloxify(ME, {"); i1 = s.index("//@@LUGAR")
s = s[:i0] + open(os.path.join(D, "_elenco_pinos.js"), encoding="utf-8").read() + "\n" + s[i1:]
rep("\n//@@ELENCO\n", "\n" + open(os.path.join(D, "_mundo_pinos.js"), encoding="utf-8").read() + "\n//@@ELENCO\n")
esc = open(os.path.join(D, "_escenas_pinos.js"), encoding="utf-8").read()
i0, i1 = s.index("//@@LUGAR"), s.index("//@@TEXTURAS")
s = s[:i0] + esc.rstrip() + "\n\n" + s[i1:]
open(os.path.join(D, "_pinos.js"), "w", encoding="utf-8").write(s)
print("ok", s.count("\n"), "líneas")
