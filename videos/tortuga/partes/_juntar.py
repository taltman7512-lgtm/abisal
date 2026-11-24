import re
base = r"C:\Users\123\Documents\abisal-volze\videos\tortuga\partes"
M = open(base + r"\historia.js", encoding="utf-8").read().split("\n")
if M[0].startswith("// ★ HISTORIA \"We Live"):
    M = open(base + r"\_polilla.js", encoding="utf-8").read().split("\n")
else:
    open(base + r"\_polilla.js", "w", encoding="utf-8").write("\n".join(M))
T = open(base + r"\_tortuga.js", encoding="utf-8").read()
sec = dict(re.findall(r"//@@(\w+)\n(.*?)(?=\n//@@|\Z)", T, re.S))
L = lambda a, b: "\n".join(M[a - 1:b])   # líneas a..b inclusive (1-based)
idx = lambda pat: next(i + 1 for i, l in enumerate(M) if l.startswith(pat))
r_robx = idx("robloxify(ME,"); r_handW = idx("const handW"); r_cielo = idx("// ---------- cielo"); r_frases = idx("// ---------- las frases")
r_sh = idx("const sh = "); r_headW = idx("const headW"); r_shots = idx("const SHOTS"); r_tiempos = idx("// tiempos de inicio"); r_escena = idx("// ---------- la escena")
r_capa = idx("// ---------- capa 2D"); r_suby = idx("const SUBY"); r_dbg = idx("window.DBG")
r_elenco = idx("// ---------- elenco"); r_estilo = idx("// ---------- estilo de bloques")
head = ['// ★ HISTORIA "We Live On Its Back" — estilo Volze, modo pueblo de día (reglas medidas en analisis/informe.md)',
        '// Shellbrook vive arriba de una tortuga gigante que camina el mar poco profundo: si alguien cava más de una pala, se sumerge.',
        '// Contada en primera persona por un chico de doce años con su primera pala. Personajes propios de bloques (no los de Volze, sin marcas).']
out = head + M[3:93] + [""] + M[162:176] + ["", sec["MUNDO"], sec["ELENCO"], L(r_estilo, r_robx - 1), sec["ROBLOX"], "",
       L(r_cielo, r_frases - 1).replace("sun.target.position.set(0, 0, -10)", "sun.target.position.set(0, 0, 0)"),
       L(r_frases, r_frases + 2), sec["LUGAR"], "", L(r_sh - 2, r_sh + 1), L(r_headW - 1, r_headW + 2), sec["SHOTS"],
       L(r_tiempos, r_escena - 1), sec["ESCENA"], "", L(r_capa, r_suby - 1),
       "const SUBY = L => [I.goldfish, I.one, I.cold2, I.alive, I.heart].includes(L) ? .22 : .75;   // sube al 22 % cuando la acción está abajo",
       L(r_suby + 1, r_dbg - 1), "window.DBG = { cam, ALL, ME, QUILL, PIM, GARROW, TURT, CABEZA, THREE, TOMAS };"]
s = "\n".join(out)
# ajustes: caras que no existen, Garrow vuelve a la tortuga, filtro sepia del recuerdo
s = s.replace('"furious"', '"angry"').replace('"overjoyed"', '"excited"')
s = s.replace('ALL.forEach(c => { c.g.visible = false;', 'if (GARROW.g.parent !== TURT) TURT.add(GARROW.g);\n  ALL.forEach(c => { c.g.visible = false;', 1)
s = s.replace("  subV(t);\n}", '  if (POST.sepia > 0) { X.globalAlpha = POST.sepia * .55; X.globalCompositeOperation = "color"; X.fillStyle = "#b08a5a"; X.fillRect(0, 0, W, H); X.globalCompositeOperation = "source-over"; X.globalAlpha = 1 }\n  subV(t);\n}', 1)
s = s.replace('hemi: 1.4, hemiG: "#8a7a60"', 'hemi: 1.8, hemiG: "#8a7a60"')
open(base + r"\historia.js", "w", encoding="utf-8").write(s)
print("líneas", s.count("\n") + 1, "| restos de la polilla:", [w for w in ["MOTH", "PELL", "WREN", "CAKE", "JAR", "CANDLES", "BRAN", "OURS", " IN."] if w in s])
