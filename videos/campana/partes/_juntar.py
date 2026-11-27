import re
base = __import__("os").path.dirname(__import__("os").path.abspath(__file__))
M = open(base + r"\_polilla.js", encoding="utf-8").read().split("\n")   # plantilla original (no se pisa)
T = open(base + r"\_campana.js", encoding="utf-8").read()
sec = dict(re.findall(r"//@@(\w+)\n(.*?)(?=\n//@@|\Z)", T, re.S))
L = lambda a, b: "\n".join(M[a - 1:b])   # líneas a..b inclusive (1-based)
idx = lambda pat: next(i + 1 for i, l in enumerate(M) if l.startswith(pat))
r_robx = idx("robloxify(ME,"); r_handW = idx("const handW"); r_cielo = idx("// ---------- cielo"); r_frases = idx("// ---------- las frases")
r_sh = idx("const sh = "); r_headW = idx("const headW"); r_shots = idx("const SHOTS"); r_tiempos = idx("// tiempos de inicio"); r_escena = idx("// ---------- la escena")
r_capa = idx("// ---------- capa 2D"); r_suby = idx("const SUBY"); r_dbg = idx("window.DBG")
r_elenco = idx("// ---------- elenco"); r_estilo = idx("// ---------- estilo de bloques")
head = ['// ★ HISTORIA "Keep Your Boots On" — estilo Volze medido cuadro a cuadro (referencia/estilo-volze-medido.md), 3:4',
        '// Dustmere, pueblo de adobe en el desierto: nadie sopla el cuerno de la torre, porque baja Onetusk, la bestia de un solo colmillo.',
        '// El narrador lo sopla para guiar a su hermana Bee en la tormenta; el cuerno era el otro colmillo de Onetusk. Personajes propios.']
out = head + M[3:93] + [""] + M[162:176] + ["", sec["MUNDO"], sec["ELENCO"], L(r_estilo, r_robx - 1), sec["ROBLOX"], "",
       L(r_cielo, r_frases - 1).replace("sun.target.position.set(0, 0, -10)", "sun.target.position.set(0, 0, 0)"),
       L(r_frases, r_frases + 2), sec["LUGAR"], "", L(r_sh - 2, r_sh + 1), L(r_headW - 1, r_headW + 2), sec["SHOTS"],
       L(r_tiempos, r_escena - 1), sec["ESCENA"], "", L(r_capa, r_suby - 1),
       "const SUBY = L => .745;   // fijo al 74,5 % del alto, como Volze en terror (medido)",
       L(r_suby + 1, r_dbg - 1), "window.DBG = { cam, ALL, ME, QUILL, PIM, GARROW, TURT, THREE, TOMAS };"]
s = "\n".join(out)
for n in ["T_SHINGLE", "T_STONE", "T_PLANK", "T_DIRT"]: s = s.replace("const " + n + " = tex(", "const " + n + "0 = tex(", 1)
s = s.replace("// ---------- materiales", sec["TEXTURAS"] + "\n// ---------- materiales", 1)
s = s.replace('const WALLC = ["#b8a184", "#a89276", "#c2ab8a", "#9f8a70", "#b39a7c"];', 'const WALLC = ["#b8a184", "#a89276", "#c2ab8a", "#9f8a70", "#b39a7c", "#c9b598", "#a8957a", "#bfa07a", "#d0c0a0", "#9a8468", "#b8a890", "#c4a684", "#ad9c80", "#c8b08c", "#a48a6c", "#bcae96"];', 1)
s = s.replace("const M_WALL = WALLC.map((c, i) => SMt(T_TIMBER(40 + i, c), { bumpMap: T_TIMBER(40 + i, c), bumpScale: 1.2 }));", "const M_WALL = WALLC.map((c, i) => { const t = T_PARED(40 + i, c); return SMt(t, { bumpMap: t, bumpScale: 1.2 }) });", 1)
s = s.replace("M_WALL[v % 5]", "M_WALL[v % M_WALL.length]")
s = s.replace("const M_GABLE = WALLC.map(c => SM(c, { roughness: .95 }));", "const M_GABLE = WALLC.map((c, i) => { const t = T_PARED(80 + i, c); return SMt(t, { bumpMap: t, bumpScale: 1 }) });", 1)
s = s.replace("new THREE.ShapeGeometry(sh), M_GABLE[v % 5]", "gableUV(new THREE.ShapeGeometry(sh), Wd, rh), M_GABLE[v % M_GABLE.length]", 1)
s = s.replace('ENV.dia = { top: "#5aa0e8", hor: "#cfe4f2", fog: .004', 'ENV.dia = { top: "#5aa0e8", hor: "#cfe4f2", fog: .0022', 1)
s = s.replace("if (pelo) peloFacetado(k.head, ...pelo);", "if (pelo) peloRoblox(k.head, ...pelo);", 1)
s = s.replace("COMP.addPass(new RenderPass(scene, cam));", 'COMP.addPass(new RenderPass(scene, cam)); try { const { GTAOPass } = await import("three/addons/postprocessing/GTAOPass.js"); const ao = new GTAOPass(scene, cam, W, H); ao.updateGtaoMaterial({ radius: .8, distanceExponent: 1.5, thickness: 1.5, scale: 1.2 }); ao.blendIntensity = .9; const aoR = ao.render.bind(ao); ao.render = (...q) => { const oc = []; scene.traverse(o => { if (o.isSprite && o.visible) { o.visible = false; oc.push(o) } }); aoR(...q); oc.forEach(o => o.visible = true) }; COMP.addPass(ao) } catch (e) { console.log("sin GTAO", e.message) }', 1)
# ajustes: caras que no existen, Garrow vuelve a la tortuga, filtro sepia del recuerdo
s = s.replace('"furious"', '"angry"').replace('"overjoyed"', '"excited"')
s = s.replace("  subV(t);\n}", '  if (POST.sepia > 0) { X.globalAlpha = POST.sepia * .55; X.globalCompositeOperation = "color"; X.fillStyle = "#b08a5a"; X.fillRect(0, 0, W, H); X.globalCompositeOperation = "source-over"; X.globalAlpha = 1 }\n  subV(t);\n}', 1)
s = s.replace('hemi: 1.4, hemiG: "#8a7a60"', 'hemi: 1.8, hemiG: "#8a7a60"')

# luz cinematográfica (pedido del dueño): sol más bajo y cálido (sombras largas), menos relleno plano, un poco más de exposición
s = s.replace('ENV.dia = { top: "#5aa0e8", hor: "#cfe4f2", fog: .0022, hemi: 1.8, hemiG: "#8a7a60", sun: 3.0, sunCol: "#fff1dc", exp: 1.1', 'ENV.dia = { top: "#5aa0e8", hor: "#cfe4f2", fog: .0026, hemi: 1.15, hemiG: "#7a6a50", sun: 3.8, sunCol: "#ffe0b4", exp: 1.16', 1)
s = s.replace("sun.position.set(-40, 60, -20);", "sun.position.set(-56, 36, -40);", 1)
# transiciones siempre con movimiento de cámara: también cuando cambia el lugar, un barrido rápido (sale girando y la toma
# nueva entra girando desde el otro lado) con desenfoque, en vez del corte seco
s = s.replace("window.SUBF = t => { const k = tomaAt(t), T = TOMAS[k], N = TOMAS[k + 1]; return (N && !N.corte && N.a - t < WHIP * .6) || (!T.corte && t - T.a < WHIP * .4) ? 12 : 3 };",
              "const WC = .18; window.SUBF = t => { const k = tomaAt(t), T = TOMAS[k], N = TOMAS[k + 1]; return (N && !N.corte && N.a - t < WHIP * .6) || (!T.corte && t - T.a < WHIP * .4) || (N && N.corte && N.a - t < WC) || (T.corte && k > 0 && t - T.a < WC) ? 12 : 3 };", 1)
s = s.replace("  if (T.s.shake) { const a = T.s.shake;",
              "  { const Y = new THREE.Vector3(0, 1, 0); if (N && N.corte && N.a - t < WC) { const u = 1 - (N.a - t) / WC; quat.multiply(new THREE.Quaternion().setFromAxisAngle(Y, -u * u * .95)) } if (T.corte && k > 0 && t - T.a < WC) { const u = 1 - (t - T.a) / WC; quat.multiply(new THREE.Quaternion().setFromAxisAngle(Y, u * u * .95)) } }\n  if (T.s.shake) { const a = T.s.shake;", 1)
# barridos más lentos, como los de Volze (0,2–0,3 s, pedido del dueño): 0,3 s entre tomas y 0,3 s al cambiar de lugar
s = s.replace("const WHIP = .14,", "const WHIP = .5,", 1).replace("const WC = .18;", "const WC = .5;", 1).replace("-u * u * .95", "-u * u * 1.4", 1).replace("u * u * .95))", "u * u * 1.4))", 1)
# cámara que viaja entre tomas (reemplaza la función camara y SUBF del motor)
i0 = s.index("function camara(t) {"); i1 = s.index("updateProjectionMatrix() } }", i0) + len("updateProjectionMatrix() } }")
s = s[:i0] + open(base + r"\_camara_vuelo.js", encoding="utf-8").read() + s[i1:]
# "tapado": algo cruza por delante del lente (banda del color pedido, con bordes suaves y viñeta) mientras cambia la toma
s = s.replace("  subV(t);\n}", '  if (POST.tapa) { const u = POST.tapa.u, cx = W / 2 + (u - .5) * POST.tapa.dir * 4.6 * W, g = X.createLinearGradient(cx - 1.3 * W, 0, cx + 1.3 * W, 0); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(.3, POST.tapa.col); g.addColorStop(.7, POST.tapa.col); g.addColorStop(1, "rgba(0,0,0,0)"); X.fillStyle = g; X.fillRect(0, 0, W, H); for (let i = 0; i < 46; i++) { const yy = ((i * 97.3) % 1) * H, hh = 6 + ((i * 31.7) % 1) * 60, xx = cx - 1.1 * W + ((i * 57.1) % 1) * 2.2 * W; X.fillStyle = i % 2 ? "rgba(255,240,210,.16)" : "rgba(40,22,8,.2)"; X.fillRect(xx - .5 * W, yy, W * (.5 + ((i * 13.3) % 1)), hh) } const v = X.createRadialGradient(cx, H / 2, H * .2, cx, H / 2, H * .9); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.45)"); X.globalAlpha = Math.max(0, 1 - Math.abs(u - .5) * 4); X.fillStyle = v; X.fillRect(0, 0, W, H); X.globalAlpha = 1 }\n  subV(t);\n}', 1)
open(base + r"\historia.js", "w", encoding="utf-8").write(s)
print("líneas", s.count("\n") + 1, "| restos de la polilla:", [w for w in ["MOTH", "PELL", "WREN", "CAKE", "JAR", "CANDLES", "BRAN", "OURS", " IN."] if w in s])
