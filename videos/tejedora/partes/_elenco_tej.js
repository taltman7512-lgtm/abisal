// ================= ELENCO DE «NOBODY ANSWERS THE KNOCK»: personajes, caras, utilería y poses =================
// Va DESPUÉS de _volze_personajes.js (usa caraV, CARAS_CAT, trazoC, ojo*, ceja, ojeras, parpado, medialuna, boca*, estampa, sombra2D,
// anteojosV, accMat, bloque, gema). Estilo: bloques de plástico mate con bisel chico, ropa PINTADA (calcomanía), cabeza recta, caras v2.
// En 3D solo pelo (con textura de hebras y trenzas de eslabones), gorras, anteojos, y los accesorios que cuentan algo:
// la cinta métrica y las tijeras del sastre, el muñeco de Tib, los hilos de Marga, el llavero de Crane, los abrigos.
//
// QUIÉN ES QUIÉN (instancias del motor reutilizadas + 6 nuevas)
//   ME     = el narrador, sastre adolescente (escala .9): camisa blanca, chaleco azul marino con alfileres, cinta métrica al cuello,
//            tijeras grandes colgando del cinto, pelo castaño despeinado.
//   TIB    = el hermano chico (escala .74): pijama celeste con estrellitas, pelo rubio revuelto, muñeco de trapo en la mano izquierda.
//   MAMA   = muda, ojos tristes (cara de reposo «tristeMudo»): vestido lavanda floreado, trenza negra larga. abrigoRojo(MAMA, true) al final.
//   PAPA   = cansado (cara de reposo «cansado»): camisa a cuadros verde, overol de jean, gorra roja.
//   MARGA  = vieja (escala .9, encorvada): chal rosa, rodete gris, anteojos, hilos de colores al cuello.
//   CRANE  = Father Crane: ≈ 1,3 × más alto que un adulto, flaco, sotana negra con botonera, cuello clerical blanco, pelo gris
//            engominado, llavero en el cinto; cara de reposo «crane» (sonrisa de costado, no parpadea). abrigoPuesto(CRANE, "crane").
//   VECINOS[0..9] (abrigados, colores distintos) · NOVIO · NOVIA (velo) · CORO[0..3] (túnicas bordó con esclavina blanca)
//   ELENCO_V = todos en orden · ELENCO_N = { ME, TIB, MAMA, PAPA, MARGA, CRANE, NOVIO, NOVIA, V0..V9, C0..C3 }
//
// CONVENCIONES: las poses se llaman DESPUÉS de ponerP/enAire y de pose() del motor (que limpia todo y esconde la utilería por cuadro).
// k.g es el punto de los pies; el personaje mira a +z local. t = segundos (para ciclos), u = 0..1 (avance de una acción).
// setFace(k, "neutral") pone la cara de reposo del personaje (k.caraBase: Crane «crane», Mamá «tristeMudo», Papá «cansado»).
//
// API (todas devuelven algo útil o nada):
//   caras nuevas: crane, sonrisaFalsa, ternura, tristeMudo, llora, tapada, tos, habla, cansado, concentrado, canta, miedo, tristeza,
//     alivio, susto, enojo (+ todas las del catálogo v2: happy, warm, sad, worried, scared, terrified, horrified, shock, relieved,
//     determined, suspicious, gloomy, listen, frio, desprecio, aguanta, esfuerzo, terror, grito…)
//   quieto(k,t) · andar(k,t,{vel}) · correrV(k,t,{fuerte}) · mirarArriba(k,t,u) · senalar(k,t,u,{alto,mano}) · retroceder(k,t,u)
//   abrazarse(k,t) · boda(novio,novia,t) · ladear(k,t,u,{lado}) · caerAtras(k,t,u) · gesto(k,t,t0,tipo) · caer · saltar
//   taparBoca(a,b,u,{colocar=true,cara="tapada"})   A (a la derecha de B, de costado) le tapa la boca a B con la mano; el otro brazo
//                                                   por la espalda. colocar = pone a A junto a B (B ya puesto). B se agarra del brazo.
//   hablarManos(k,t,{vel=1})                        lengua de señas: las dos manos cambian de seña cada ≈ .45 s, golpecitos y giros
//   coser(k,t,{punto=null, tela=true})              aguja con hilo: tira el hilo en lazos; tela = retazo en la mano izquierda;
//                                                   punto = Vector3 del mundo donde entra la aguja (p. ej. un abrigo de la escena)
//   cortarTijera(k,t,{a=null, sobre=false, vel=1})  las tijeras grandes en la mano derecha, abren y cierran; a = punto a cortar (mundo);
//                                                   sobre = true: solo mueve el brazo derecho (llamarla después de trepar). Devuelve la
//                                                   punta (Vector3 mundo).
//   trepar(k,t,{h=0, vel=1})                        trepa la tela (la cara a +z, pegada a la pared de abrigos ≈ .45·s adelante)
//   levantarAbrigo(k,u,{tipo="rojo"})               se agacha y levanta el abrigo del piso (estaba 0,9·s adelante) hasta el pecho
//   toser(k,t,{cara="tos"})                         tose con el puño en la boca, sacudones
//   llorarMudo(k,t,{cara="llora"})                  llora sin ruido: cabeza gacha, hombros que tiemblan, lágrimas 3D que caen
//   asentir(k,t,{vel=1, fuerza=1})                  asiente («sí» sin voz, las bodas)
//   empujarRopero(k,u,{pasos=3})                    empuja con las dos manos (la cara de atrás del ropero a ≈ .95·s adelante);
//                                                   la escena mueve k.g y el ropero con u
//   tocarCampana(k,t,{periodo=2.4, cuerda=true, alto=8})  tira de la cuerda (dibuja la cuerda hasta `alto` m arriba). Devuelve el tirón 0..1
//   colgarAbrigo(k,u,{tipo="tib", gancho=null})     lleva el abrigo en la mano derecha hasta el gancho (Vector3 mundo; por defecto
//                                                   ≈ 2,5·s arriba y .9·s adelante) y lo deja colgado desde u = .75
//   abrigoEnMano(k, tipo|null, {mano="R", doblado=true})   tipo: "tib" (chico, azul) · "crane" (negro largo) · "rojo"
//   abrigoPuesto(k, tipo|null, on=true)             se lo pone (cáscara pintada sobre torso, mangas y faldón). Persistente.
//   abrigoRojo(k, on)                               = abrigoPuesto(k, "rojo", on)
//   abrigoColgado(tipo, pos, ry=0)                  el abrigo colgado en un gancho del mundo (pos = el gancho; cuelga hacia abajo)
//   abrigoEnPiso(tipo, pos, ry=0)                   el abrigo tirado en el piso (la calle)
//   lista(k, on, {leer=true})                       el papel con nombres y deudas en las dos manos, leyendo (cabeza gacha)
//   listaEn(pos, ry, rx)                            el papel solo en el mundo (planos de detalle)
//   saludarBuenasNoches(k,t,{hablar=true})          saludo chiquito con la mano, cabeza ladeada, boca que habla
//   escuchar(k,t)                                   la oreja contra la puerta (la puerta ≈ .5·s adelante), manos apoyadas
//   asustado(k,t,{u=1, cara="terror"})              encogido, manos en el pecho, tiembla
//   salirVentana(k,u,{alto=1, fondo=.55})           sale por la ventana (alféizar a `alto` m, `fondo` adelante): pierna arriba, se
//                                                   sube agachado, pasa y cae del otro lado. Termina parado ≈ 1,5·s adelante.
//   muneco(k, modo)                                 Tib: "mano" (por defecto, colgando de la mano izq.) · "abrazo" · null (sin muñeco)
//   tijeraCuelga(k, on)                             las tijeras colgadas del cinto del sastre (se esconden solas mientras corta)
//   ojosW(k) → [Vector3, Vector3] · bocaW(k) → Vector3   (centros de los ojos y de la boca en el mundo, para la cámara)
const H_CAD = 1.02, A_BRAZO = .42, F30 = 1 / 30;
const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3(), _v4 = new THREE.Vector3(), _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _q3 = new THREE.Quaternion();
const _ABAJO = new THREE.Vector3(0, -1, 0), _mb = new THREE.Matrix4(), _ax = new THREE.Vector3(), _ay = new THREE.Vector3(), _az = new THREE.Vector3();
const _frac = x => x - Math.floor(x), _suave = q => { q = cl(q); return q * q * (3 - 2 * q) };
const HC = k => k.hcad ?? H_CAD, AB = k => k.brazoA ?? A_BRAZO;   // alto de la cadera y ángulo de los brazos en «A» de cada uno (Sallow los tiene distintos)
function caraDz(kind, cerr = false) { return caraV(kind, cerr) }   // la reasigna _volze_personajes.js: la declaración tiene que existir

// ================= CARAS EXTRA del elenco: con las piezas de la v2 del integrador (_volze_personajes.js: trazoC, ojoSolido, ojoAnillo, ojoMedio,
// parpado, ojeras, ceja, medialuna, bocaSusto, bocaU, bocaArcoInv, bocaRecta, bocaO; EX, EY, MY, ERX, ERY). Misma complejidad que el catálogo:
// cejas que se afinan, ojeras en miedo/cansancio, medialuna rellena en risa/grito, labio bajo la boca triste, brillo en ojos asustados.
// dientes apretados: rectángulo redondeado negro con la fila de dientes blanca al medio y una raya
const dientesApret = (g, w = 100, h = 30) => { g.fillStyle = TINTA; g.beginPath(); g.roundRect(256 - w / 2, MY - h / 2, w, h, h * .35); g.fill(); g.fillStyle = "#ffffff"; g.beginPath(); g.roundRect(256 - w / 2 + 7, MY - h / 2 + 6, w - 14, h - 12, 5); g.fill(); g.fillStyle = TINTA; g.fillRect(256 - w / 2 + 7, MY - 1.5, w - 14, 3) };
const dosE = (g, f) => [-1, 1].forEach(s => f(256 + s * EX, s));
// «frio»: mirada fija con cejas rectas y bajas, boca recta finita
CARAS_CAT.frio = g => { dosE(g, (x, s) => { ojoSolido(g, x, .85); trazoC(g, [[x - 28, EY - ERY - 16], [x, EY - ERY - 18], [x + 28, EY - ERY - 16 + s * 3]], 12, { ini: .35, fin: .35 }) }); bocaRecta(g, .11) };
// «desprecio»: un ojo entornado, una ceja alzada, media sonrisa torcida
CARAS_CAT.desprecio = g => { dosE(g, (x, s) => { if (s < 0) ojoMedio(g, x, s); else { ojoSolido(g, x); ceja(g, x, s, "duda") } }); trazoC(g, [[256 - 34, MY + 6], [256 + 6, MY + 6], [256 + 40, MY - 12]], 13, { ini: .35, fin: .3 }) };
// «aguanta»: cejas de enojo, dientes apretados (medialuna chata con dientes)
CARAS_CAT.aguanta = g => { dosE(g, (x, s) => { ojoSolido(g, x, .9); ceja(g, x, s, "enojo") }); dientesApret(g, 100, 30) };
// «esfuerzo»: ojos apretados, cejas de enojo, dientes apretados más anchos, ojeras de cansancio
CARAS_CAT.esfuerzo = g => { dosE(g, (x, s) => { ojoApret(g, x, s); ceja(g, x, s, "enojo"); ojeras(g, x, s, 1) }); dientesApret(g, 120, 36) };
// «wow»: asombro feliz, ojos grandes con brillo, cejas altas, medialuna con dientes
CARAS_CAT.wow = g => { dosE(g, (x, s) => { ojoSolido(g, x, 1.2, { brillo: true }); ceja(g, x, s, "alta") }); medialuna(g, 130, 64, { dientes: true }) };
// «mira»: mirando algo arriba, ojos con brillo, cejas altas, «o» chica
CARAS_CAT.mira = g => { dosE(g, (x, s) => { ojoSolido(g, x, 1.05, { brillo: true, dy: -4 }); ceja(g, x, s, "alta") }); bocaO(g, 10, 13) };
// «furia»: cejas de enojo bien marcadas, ojos chicos, grito con dientes (boca hacia abajo)
CARAS_CAT.furia = g => { dosE(g, (x, s) => { ojoSolido(g, x, .85); ceja(g, x, s, "enojo") }); bocaSusto(g, 78, 58) };
// «grito» (pisa la del catálogo: es NELL llamando «Say my name»): ojos apretados, cejas de pena, boca enorme abierta con dientes
CARAS_CAT.grito = g => { dosE(g, (x, s) => { ojoApret(g, x, s); ceja(g, x, s, "pena") }); bocaSusto(g, 92, 92) };
// «terror»: ojos enormes con brillo, párpado alto, cejas de pena, doble ojera, boca de susto con dientes
CARAS_CAT.terror = g => { dosE(g, (x, s) => { ojoSolido(g, x, 1.25, { brillo: true }); ceja(g, x, s, "pena"); ojeras(g, x, s, 2) }); bocaSusto(g, 86, 88) };
// «educada»: Nell mirando a un extraño: ojos un poco chicos sin cejas, una sonrisita chata de compromiso
CARAS_CAT.educada = g => { dosE(g, x => ojoSolido(g, x, .88)); bocaU(g, .13, 10) };
// «vacia»: los olvidados. Sin rasgos.
CARAS_CAT.vacia = g => { };
// «sallow» (no se usa: hay un Sallow nuevo): ojos chiquitos fijos con ojeras, sin cejas, una U finísima demasiado ancha
CARAS_CAT.sallow = g => { dosE(g, (x, s) => { ojoSolido(g, x - s * 14, .5); ojeras(g, x - s * 14, s, 2) }); trazoC(g, [[256 - 150, MY - 50], [256 - 130, MY + 60], [256 + 130, MY + 60], [256 + 150, MY - 50]], 9, { ini: .2, fin: .2 }) };
// ---------- caras de «Nobody Answers The Knock»
// «crane»: la cara de reposo de Father Crane: ojos chicos y quietos (los ojos NO sonríen), párpado bajo, una sonrisa de costado que sube
// solo del lado derecho, con un hoyuelo en la punta
CARAS_CAT.crane = g => { dosE(g, (x, s) => { ojoSolido(g, x, .78); trazoC(g, [[x - 26, EY - ERY * .55], [x, EY - ERY * .75], [x + 26, EY - ERY * .55]], 9, { ini: .3, fin: .3 }) });
  trazoC(g, [[256 - 72, MY + 6], [256 - 10, MY + 16], [256 + 50, MY + 4], [256 + 84, MY - 24]], 13, { ini: .3, fin: .45 }); trazoC(g, [[256 + 80, MY - 34], [256 + 92, MY - 22], [256 + 88, MY - 10]], 6, { ini: .2, fin: .2 }) };
// «sonrisaFalsa»: Crane sonriendo a alguien: medialuna torcida (más alta a la derecha), ojos medio cerrados sin brillo, una ceja alzada
CARAS_CAT.sonrisaFalsa = g => { dosE(g, (x, s) => { ojoMedio(g, x, s); if (s > 0) ceja(g, x, s, "duda") });
  g.save(); g.translate(256, MY); g.rotate(-.16); g.translate(-256, -MY); medialuna(g, 150, 46, { dientes: true, curva: 8 }); g.restore() };
// «ternura»: ojos cerrados contentos (arcos), cejas apenas de pena, sonrisa chica
CARAS_CAT.ternura = g => { dosE(g, (x, s) => { ojoArco(g, x, true); trazoC(g, [[x - s * 24, EY - ERY - 22], [x + s * 4, EY - ERY - 30], [x + s * 26, EY - ERY - 24]], 10, { ini: .4, fin: .3 }) }); bocaU(g, .2, 26) };
// «tristeMudo»: la madre: párpados caídos de pena, doble ojera, boca cerrada en arco chato (sin labio: no habla)
CARAS_CAT.tristeMudo = g => { dosE(g, (x, s) => { ojoSolido(g, x, .9, { dy: 5 }); parpado(g, x, s, "pena"); ojeras(g, x, s, 2) }); bocaArcoInv(g, .12, 8, false) };
// «llora»: ojos apretados, cejas de pena, ojeras, boca temblando en arco con labio (las lágrimas son 3D: llorarMudo)
CARAS_CAT.llora = g => { dosE(g, (x, s) => { ojoApret(g, x, -s); ceja(g, x, s, "pena"); ojeras(g, x, s, 2) }); bocaArcoInv(g, .18, 20) };
// «tapada»: le taparon la boca: ojos enormes con brillo, cejas de pena, sin boca (la tapa la mano)
CARAS_CAT.tapada = g => { dosE(g, (x, s) => { ojoSolido(g, x, 1.25, { brillo: true }); ceja(g, x, s, "pena"); ojeras(g, x, s, 1) }) };
// «tos»: ojos apretados, boca «o» abierta
CARAS_CAT.tos = g => { dosE(g, (x, s) => { ojoApret(g, x, s); ceja(g, x, s, "pena") }); bocaO(g, 20, 26) };
// «habla»: hablando bajito (Tib: «goodnight»): ojos normales, medialuna chica abierta
CARAS_CAT.habla = g => { dosE(g, x => ojoSolido(g, x)); medialuna(g, 70, 34, { curva: 4 }) };
// «cansado»: el padre: ojos a media asta, ojeras dobles, boca recta un poco caída a un lado
CARAS_CAT.cansado = g => { dosE(g, (x, s) => { ojoMedio(g, x, s); ojeras(g, x, s, 2) }); bocaRecta(g, .13, -5) };
// «concentrado»: cosiendo: mirada abajo, una ceja de duda, boca corta torcida
CARAS_CAT.concentrado = g => { dosE(g, (x, s) => { ojoSolido(g, x, .9, { dy: 9 }); if (s < 0) ceja(g, x, s, "duda") }); bocaRecta(g, .08, 6) };
// «canta»: el coro: ojos cerrados para arriba, boca abierta redonda grande
CARAS_CAT.canta = g => { dosE(g, (x, s) => { ojoArco(g, x, false); ceja(g, x, s, "alta") }); bocaO(g, 24, 32) };
// alias en castellano (los nombres que usa el guion)
Object.assign(CARAS_CAT, { miedo: CARAS_CAT.scared, tristeza: CARAS_CAT.sad, alivio: CARAS_CAT.relieved, susto: CARAS_CAT.horrified, enojo: CARAS_CAT.angry, alegre: CARAS_CAT.happy });
const SIN_PARPADEO = new Set(["relieved", "alivio", "paz", "cerrados", "sopla", "esfuerzo", "happyD", "grito", "sallow", "vacia", "vuelve", "terror", "ternura", "llora", "tos", "canta"]);
// UN parpadeo de 4 cuadros (a 30 fps) cada 1,2–1,6 s, desfasado por personaje (Crane no parpadea nunca: k.sinParpadeo)
function parpadeo(k, t) { if (k.caraFija || k.sinParpadeo) return false; const T = 1.2 + .4 * _frac(k.idx * .618 + .31), ph = (t + T * _frac(k.idx * .377 + .15)) % T;
  if (ph < 4 * F30 && k.cara && !SIN_PARPADEO.has(k.cara)) { const m = caraV(k.cara, true); if (k.decal.material.map !== m) { k.decal.material.map = m; k.decal.material.needsUpdate = true } return true } return false }
// setFace: Sallow siempre con su sonrisa (k.caraFija); los olvidados (k.sinCara) quedan «vacia» cuando la escena pide «neutral»
{ const sf0 = setFace; setFace = (k, f) => sf0(k, k.caraFija || (f === "neutral" && k.caraBase ? k.caraBase : k.sinCara && f === "neutral" ? "vacia" : f)) }
// caraVuelve(k, u, cara): la cara de un olvidado vuelve: u = 0 lisa («vacia») … 1 la cara pedida (por defecto «neutral»). 11 pasos cacheados.
const CARA_VUELVE = {};
function caraVuelve(k, u, cara = "neutral") { const q = Math.round(cl(u) * 10) / 10, m = k.decal.material; let t;
  if (q <= 0) t = caraV("vacia"); else if (q >= 1) t = caraV(cara);
  else t = CARA_VUELVE[cara + q] ||= tex(512, 384, g => { g.globalAlpha = 1 - q; g.drawImage(caraV("vacia").image, 0, 0); g.globalAlpha = q; g.drawImage(caraV(cara).image, 0, 0); g.globalAlpha = 1 });
  k.cara = q >= 1 ? cara : "vuelve"; if (m.map !== t) { m.map = t; m.needsUpdate = true } return t }

// ================= ROPA PINTADA (texturas planas con sombreado suave): estampados de colores, cera, quemaduras =================
const ROPAC = {};
// manchas de grasa/hollín: gotas negras irregulares con un brillo chico (sembradas: siempre las mismas)
function manchasG(g, w, h, n, seed, y0 = 0) { const r = rng(seed); for (let i = 0; i < n; i++) { const x = r() * w, y = y0 + r() * (h - y0), R = 8 + r() * 16; g.fillStyle = "rgba(22,18,14,.86)"; g.beginPath();
    for (let j = 0; j < 9; j++) { const a = j / 9 * 6.283, rr = R * (.65 + r() * .55); g.lineTo(x + Math.cos(a) * rr * 1.7, y + Math.sin(a) * rr * .6) } g.closePath(); g.fill();
    g.fillStyle = "rgba(255,255,255,.22)"; g.beginPath(); g.ellipse(x - R * .25, y - R * .25, R * .22, R * .12, -.5, 0, 7); g.fill() } }
// chorreadas de CERA: gota de cera clara con un hilo que cae y termina en una bolita, brillo arriba
function manchasCera(g, w, h, n, seed, y0 = 0, col = "rgba(222,200,140,.8)") { const r = rng(seed); for (let i = 0; i < n; i++) { const x = r() * w, y = y0 + r() * (h - y0) * .85, R = 4 + r() * 9;
    g.fillStyle = col; g.beginPath(); for (let j = 0; j < 11; j++) { const a = j / 11 * 6.283, rr = R * (.55 + r() * .7); g.lineTo(x + Math.cos(a) * rr * 1.3, y + Math.sin(a) * rr * .8) } g.closePath(); g.fill();   // salpicón irregular
    for (let d = 0, nd = 1 + (r() * 2 | 0); d < nd; d++) { const xd = x + (r() - .5) * R * 1.4, L = R * (1 + r() * 3.2), wd = R * (.18 + r() * .2); g.beginPath(); g.moveTo(xd - wd, y); g.lineTo(xd + wd, y); g.lineTo(xd + wd * .7, y + L); g.arc(xd, y + L, wd * 1.25, 0, Math.PI); g.closePath(); g.fill() }   // chorritos que caen
    for (let d = 0; d < 4; d++) { g.beginPath(); g.arc(x + (r() - .5) * R * 4, y + (r() - .5) * R * 3, 1 + r() * 2.5, 0, 7); g.fill() }   // gotitas sueltas
    g.fillStyle = "rgba(255,250,230,.35)"; g.beginPath(); g.ellipse(x - R * .3, y - R * .2, R * .3, R * .16, 0, 0, 7); g.fill() } }
// quemaduras de cera en la piel: manchas rojizas con el centro rosado y una ampollita
function quemadurasG(g, x0, y0, w, h, n, seed) { const r = rng(seed); for (let i = 0; i < n; i++) { const x = x0 + r() * w, y = y0 + r() * h, R = 4 + r() * 7;
    g.fillStyle = "rgba(170,70,58,.45)"; g.beginPath(); for (let j = 0; j < 9; j++) { const a = j / 9 * 6.283, rr = R * (.6 + r() * .7); g.lineTo(x + Math.cos(a) * rr * 1.4, y + Math.sin(a) * rr) } g.closePath(); g.fill();
    g.fillStyle = "rgba(226,140,120,.55)"; g.beginPath(); g.ellipse(x + R * .2, y, R * .6, R * .4, r() * 3, 0, 7); g.fill(); if (r() < .5) { g.fillStyle = "rgba(255,236,214,.6)"; g.beginPath(); g.arc(x - R * .2, y - R * .1, R * .22, 0, 7); g.fill() } } }
// remiendo: un parche de otro color con puntadas
function remiendoG(g, x, y, w, h, col) { g.fillStyle = col; g.fillRect(x, y, w, h); g.fillStyle = "rgba(0,0,0,.12)"; g.fillRect(x, y + h - 6, w, 6); g.setLineDash([10, 8]); g.strokeStyle = "rgba(240,230,210,.75)"; g.lineWidth = 4; g.strokeRect(x + 7, y + 7, w - 14, h - 14); g.setLineDash([]) }
// estampados nuevos (además de los de estampa(): rayas, franjas, rombos, zigzag, guarda, lunares):
//   floreado (flores grandes de 5 pétalos con hojitas) · florecitas (chiquitas, sin hojas) · cuadros (vichy) · rayitas (finas)
// esc = escala del dibujo (.5 en brazos y piernas, que tienen la mitad de píxeles por metro que el torso)
function estampaC(g, w, h, kind, base, alt, alt2, esc = 1) { g.save(); if (esc !== 1) g.scale(esc, esc); const W = w / esc, H = h / esc;
  if (kind === "floreado" || kind === "florecitas") { const big = kind === "floreado", R = big ? 30 : 15, paso = big ? 118 : 64, r = rng(big ? 77 : 31);
    for (let y = paso * .45, f = 0; y < H + R; y += paso * .78, f++) for (let x = (f % 2) * paso / 2 + paso * .2; x < W + R; x += paso) { const xx = x + (r() - .5) * paso * .25, yy = y + (r() - .5) * paso * .25, rot = r() * 6;
      if (big) { g.fillStyle = "#5e8a52"; for (const a of [rot + 2.2, rot + 4.1]) { g.beginPath(); g.ellipse(xx + Math.cos(a) * R * 1.05, yy + Math.sin(a) * R * 1.05, R * .5, R * .22, a, 0, 7); g.fill() } }
      g.fillStyle = alt; for (let p = 0; p < 5; p++) { const a = rot + p / 5 * 6.283; g.beginPath(); g.ellipse(xx + Math.cos(a) * R * .55, yy + Math.sin(a) * R * .55, R * .45, R * .32, a, 0, 7); g.fill() }
      g.fillStyle = alt2 || "#f2c230"; g.beginPath(); g.arc(xx, yy, R * .27, 0, 7); g.fill() } }
  else if (kind === "cuadros") { g.fillStyle = alt; g.globalAlpha = .55; for (let x = 0; x < W; x += 56) g.fillRect(x, 0, 26, H); for (let y = 0; y < H; y += 56) g.fillRect(0, y, W, 26); g.globalAlpha = 1 }
  else if (kind === "rayitas") { g.fillStyle = alt; for (let x = 10; x < W; x += 34) g.fillRect(x, 0, 9, H) }
  else if (kind === "estrellitas") { const r = rng(404), estrella = (x, y, R, a) => { g.beginPath(); for (let i = 0; i < 10; i++) { const q = a + i * Math.PI / 5, rr = i % 2 ? R * .45 : R; g.lineTo(x + Math.cos(q) * rr, y + Math.sin(q) * rr) } g.closePath(); g.fill() };
    for (let y = 40, f = 0; y < H + 30; y += 92, f++) for (let x = (f % 2) * 60 + 30; x < W + 30; x += 120) { const xx = x + (r() - .5) * 40, yy = y + (r() - .5) * 30;
      if (r() < .7) { g.fillStyle = r() < .5 ? alt : (alt2 || "#f4e27a"); estrella(xx, yy, 13 + r() * 6, r() * 6) } else { g.fillStyle = alt2 || "#f4e27a"; g.beginPath(); g.arc(xx, yy, 14, 0, 7); g.fill(); g.fillStyle = base; g.beginPath(); g.arc(xx + 7, yy - 4, 12, 0, 7); g.fill() } } }
  else estampa(g, W, H, kind, base, alt);
  g.restore() }
const patronC = (g, w, h, o, base) => { g.save(); g.beginPath(); g.rect(0, 0, w, h); g.clip(); estampaC(g, w, h, o.kind, base, o.alt || "#efe6d2", o.alt2, .5); g.restore() };
// frente/espalda del torso. o: { col, kind, alt, alt2, levita: [col, chaleco, camisa, corbata], cadena: col, chaleco: [col, botón], panuelo: col, cuello: col,
//   botones: col, delantal: [col, borde, "cuero"?], chal: [col, guarda], traje: [camisa, moño, flor], encaje: col, faja: [col, vivo], tirantes: col,
//   remiendos: [col, …], manchas: n (grasa), cera: n (chorreadas de cera), seed }
function torsoC(o, back = false) { const key = "t" + JSON.stringify(o) + back; return ROPAC[key] ||= tex(512, 512, (g, w, h) => {
  g.fillStyle = o.col; g.fillRect(0, 0, w, h); if (o.kind) estampaC(g, w, h, o.kind, o.col, o.alt || "#efe6d2", o.alt2);
  if (o.tejido) { const [c1, c2] = o.tejido; g.fillStyle = c1; for (let y = 70; y < h; y += 150) g.fillRect(0, y, w, 26); g.fillStyle = c2; for (let y = 130, f = 0; y < h; y += 150, f++) for (let x = (f % 2) * 30 + 15; x < w; x += 60) { g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill() }
    g.strokeStyle = "rgba(0,0,0,.12)"; g.lineWidth = 2; for (let y = 8; y < h; y += 16) for (let x = 0; x < w; x += 16) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 8, y + 8); g.lineTo(x + 16, y); g.stroke() } }
  if (o.cuelloR && !back) { g.strokeStyle = o.cuelloR; g.lineWidth = 22; g.beginPath(); g.arc(256, -30, 120, .25, Math.PI - .25); g.stroke() }
  if (o.overol) { g.fillStyle = o.overol; g.fillRect(0, 300, w, h - 300); if (!back) { g.fillRect(150, 190, 212, 120); g.fillRect(150, 0, 40, 200); g.fillRect(322, 0, 40, 200); g.fillStyle = "#f2d060"; for (const x of [170, 342]) { g.beginPath(); g.arc(x, 200, 11, 0, 7); g.fill() } g.strokeStyle = "rgba(255,255,255,.5)"; g.setLineDash([8, 6]); g.lineWidth = 3; g.strokeRect(160, 200, 192, 100); g.setLineDash([]) } else { g.save(); g.lineWidth = 40; g.strokeStyle = o.overol; g.beginPath(); g.moveTo(120, 0); g.lineTo(380, 310); g.moveTo(392, 0); g.lineTo(132, 310); g.stroke(); g.restore() } }
  if (o.escudo && !back) { const [c1, c2] = o.escudo, x = 256, y = 250; g.fillStyle = c1; g.beginPath(); g.moveTo(x - 60, y - 60); g.lineTo(x + 60, y - 60); g.lineTo(x + 60, y + 10); g.quadraticCurveTo(x + 50, y + 60, x, y + 80); g.quadraticCurveTo(x - 50, y + 60, x - 60, y + 10); g.closePath(); g.fill(); g.fillStyle = c2; g.font = "bold 80px sans-serif"; g.textAlign = "center"; g.fillText("7", x, y + 38) }
  if (o.cuello && !back) { g.fillStyle = o.cuello; g.beginPath(); g.moveTo(160, 0); g.lineTo(256, 110); g.lineTo(352, 0); g.closePath(); g.fill() }
  if (o.chaleco) { g.fillStyle = o.chaleco[0]; if (back) g.fillRect(0, 0, w, h); else { g.beginPath(); g.moveTo(0, 0); g.lineTo(196, 0); g.lineTo(256, 150); g.lineTo(256, h); g.lineTo(0, h); g.closePath(); g.fill(); g.beginPath(); g.moveTo(w, 0); g.lineTo(316, 0); g.lineTo(256, 150); g.lineTo(256, h); g.lineTo(w, h); g.closePath(); g.fill();
      g.fillStyle = "rgba(0,0,0,.3)"; g.fillRect(253, 150, 6, h - 150); if (o.chaleco[1]) { g.fillStyle = o.chaleco[1]; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(276, 200 + i * 80, 12, 0, 7); g.fill() } } } }
  if (o.levita) { const [lc, ch, cam, cor] = o.levita; g.fillStyle = lc; if (back) { g.fillRect(0, 0, w, h); g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(250, 300, 10, h - 300); for (const x of [200, 312]) { g.fillStyle = "#4a4440"; g.beginPath(); g.arc(x, 410, 11, 0, 7); g.fill() } }
    else { g.fillStyle = ch; g.fillRect(150, 0, 212, h); g.fillStyle = cam; g.beginPath(); g.moveTo(186, 0); g.lineTo(256, 120); g.lineTo(326, 0); g.closePath(); g.fill(); g.fillStyle = cor; g.beginPath(); g.moveTo(232, 14); g.lineTo(280, 14); g.lineTo(268, 112); g.lineTo(256, 126); g.lineTo(244, 112); g.closePath(); g.fill();
      g.fillStyle = "rgba(255,255,255,.18)"; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(256, 180 + i * 78, 10, 0, 7); g.fill() }
      g.fillStyle = lc; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(256 + s * 256, 0); g.lineTo(256 + s * 66, 0); g.lineTo(256 + s * 150, 210); g.lineTo(256 + s * 106, 260); g.lineTo(256 + s * 106, h); g.lineTo(256 + s * 256, h); g.closePath(); g.fill() }
      g.fillStyle = "rgba(255,255,255,.08)"; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(256 + s * 66, 0); g.lineTo(256 + s * 150, 210); g.lineTo(256 + s * 120, 236); g.lineTo(256 + s * 96, 0); g.closePath(); g.fill() } }
    // gastada: brillos de uso y deshilachado en los bordes
    g.fillStyle = "rgba(160,150,140,.10)"; const r = rng(91 + (back ? 1 : 0)); for (let i = 0; i < 26; i++) g.fillRect(r() * w, r() * h, 6 + r() * 30, 2 + r() * 4) }
  if (o.cadena && !back) { g.strokeStyle = o.cadena; g.lineWidth = 9; g.setLineDash([12, 6]); g.beginPath(); g.moveTo(262, 260); g.quadraticCurveTo(300, 330, 352, 300); g.stroke(); g.setLineDash([]) }
  if (o.tirantes) { g.fillStyle = o.tirantes; g.fillRect(130, 0, 34, h); g.fillRect(348, 0, 34, h) }
  if (o.chal) { const V = (d, lw, c) => { g.strokeStyle = c; g.lineWidth = lw; g.lineJoin = "miter"; g.beginPath(); g.moveTo(-10, 250 - d); g.lineTo(256, 470 - d); g.lineTo(522, 250 - d); g.stroke() };
    g.fillStyle = o.chal[0]; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w, 250); g.lineTo(256, 470); g.lineTo(0, 250); g.closePath(); g.fill(); estampa(g, w, 250, "rombos", o.chal[0], oscV(o.chal[0], .82)); if (o.chal[1]) V(40, 18, o.chal[1]) }
  if (o.traje && !back) { const [cam, mo, flor] = o.traje; g.fillStyle = cam; g.beginPath(); g.moveTo(186, 0); g.lineTo(326, 0); g.lineTo(256, 230); g.closePath(); g.fill();
    g.fillStyle = "rgba(0,0,0,.35)"; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(256 + s * 70, 0); g.lineTo(256 + s * 96, 0); g.lineTo(256 + s * 8, 250); g.lineTo(256, 236); g.closePath(); g.fill() }
    g.fillStyle = mo; g.beginPath(); g.moveTo(256, 44); g.lineTo(222, 26); g.lineTo(222, 64); g.closePath(); g.fill(); g.beginPath(); g.moveTo(256, 44); g.lineTo(290, 26); g.lineTo(290, 64); g.closePath(); g.fill(); g.fillRect(248, 36, 16, 16);
    if (flor) { for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283; g.fillStyle = "#f6f2ea"; g.beginPath(); g.arc(140 + Math.cos(a) * 15, 110 + Math.sin(a) * 15, 11, 0, 7); g.fill() } g.fillStyle = flor; g.beginPath(); g.arc(140, 110, 9, 0, 7); g.fill() } }
  if (o.delantal) { const [dc, db, tipo] = o.delantal; g.fillStyle = dc; g.fillRect(0, 226, w, 22); if (!back) { g.fillRect(150, 60, 212, 180); g.fillRect(96, 236, 320, h - 236); g.fillRect(156, 0, 18, 64); g.fillRect(338, 0, 18, 64);
      g.strokeStyle = db; g.lineWidth = 8; g.strokeRect(186, 340, 140, 80); g.fillStyle = db; g.fillRect(96, h - 30, 320, 12);
      if (tipo === "cuero") { g.setLineDash([9, 7]); g.strokeStyle = "rgba(240,220,180,.6)"; g.lineWidth = 3; g.strokeRect(160, 70, 192, 160); g.strokeRect(106, 246, 300, h - 290); g.setLineDash([]);
        g.fillStyle = "rgba(0,0,0,.18)"; for (const [x, y, ww, hh] of [[110, 300, 60, 6], [330, 380, 70, 5], [200, 450, 90, 6]]) g.fillRect(x, y, ww, hh);   // marcas y rayones del cuero
        g.fillStyle = "rgba(255,240,210,.14)"; g.fillRect(150, 60, 212, 14) } } }
  if (o.encaje) { g.fillStyle = o.encaje; for (let x = 0; x < w + 32; x += 40) { g.beginPath(); g.arc(x, 0, 22, 0, Math.PI); g.fill() } }
  if (o.faja) { g.fillStyle = o.faja[0]; g.fillRect(0, h - 104, w, 54); if (o.faja[1]) { g.fillStyle = o.faja[1]; g.fillRect(0, h - 84, w, 12) } }
  if (o.panuelo) { g.fillStyle = o.panuelo; g.fillRect(96, 0, 320, 40); if (!back) { g.beginPath(); g.moveTo(150, 24); g.lineTo(256, 190); g.lineTo(362, 24); g.closePath(); g.fill(); g.fillStyle = "rgba(255,255,255,.55)"; for (const [x, y] of [[210, 60], [300, 60], [256, 120], [236, 90], [276, 90]]) { g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill() } g.fillStyle = "rgba(0,0,0,.2)"; g.fillRect(96, 36, 320, 6) } }
  if (o.corazon && !back) { const x = 330, y = 300, r = 34; g.fillStyle = o.corazon; g.beginPath(); g.moveTo(x, y + r * 1.4); g.bezierCurveTo(x - r * 2.2, y + r * .2, x - r * 1.1, y - r * 1.4, x, y - r * .35); g.bezierCurveTo(x + r * 1.1, y - r * 1.4, x + r * 2.2, y + r * .2, x, y + r * 1.4); g.fill() }
  if (o.bufanda) { const [b1, b2] = o.bufanda; for (let x = 0; x < w; x += 64) { g.fillStyle = (x / 64) % 2 ? b2 : b1; g.fillRect(x, 0, 64, 70) } if (!back) for (let y = 70; y < 330; y += 52) { g.fillStyle = ((y - 70) / 52) % 2 ? b2 : b1; g.fillRect(320, y, 74, 52) } }
  // sotana: botonera larga de botoncitos al medio (y la costura)
  if (!back && o.botonera) { g.fillStyle = "rgba(255,255,255,.06)"; g.fillRect(250, 0, 12, h); for (let i = 0; i < 11; i++) { const y = 70 + i * 42; g.fillStyle = o.botonera; g.beginPath(); g.arc(256, y, 8, 0, 7); g.fill(); g.fillStyle = "rgba(255,255,255,.35)"; g.beginPath(); g.arc(253, y - 3, 3, 0, 7); g.fill() } }
  // cuello clerical: banda blanca arriba con la lengüeta cuadrada al medio
  if (o.clerical) { g.fillStyle = o.clerical; g.fillRect(150, 0, 212, 22); if (!back) { g.fillRect(232, 0, 48, 52); g.fillStyle = "rgba(0,0,0,.18)"; g.fillRect(232, 48, 48, 4) } }
  // esclavina del coro: capa corta blanca sobre los hombros con el borde en ondas y un ribete
  if (o.esclavina) { const [c1, c2] = o.esclavina, yb = back ? 150 : 175; g.fillStyle = c1; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w, yb - 40);
    for (let x = w; x >= 0; x -= 32) g.quadraticCurveTo(x - 16, yb + 26 - Math.abs(x - 256) * .12, x - 32, yb - 40 + (back ? 0 : 0)); g.closePath(); g.fill();
    if (c2) { g.strokeStyle = c2; g.lineWidth = 8; g.beginPath(); g.moveTo(0, yb - 58); g.lineTo(w, yb - 58); g.stroke() } if (!back && o.cruz) { g.fillStyle = o.cruz; g.fillRect(250, 60, 12, 60); g.fillRect(234, 78, 44, 12) } }
  // alfileres clavados en el pecho (cabezas de colores con la aguja plateada), y un carretel de hilo pintado en el bolsillo
  if (!back && o.alfileres) { const r = rng(o.seed || 31), cols = ["#e8403a", "#f2d040", "#4a8ae0", "#f4f4f4", "#5ab05a", "#e870b0"];
    for (let i = 0; i < o.alfileres; i++) { const x = 330 + r() * 120, y = 120 + r() * 120, a = -.6 + r() * 1.2, L = 34 + r() * 14;
      g.strokeStyle = "#d8dce2"; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.sin(a) * L, y + Math.cos(a) * L); g.stroke(); g.fillStyle = cols[i % cols.length]; g.beginPath(); g.arc(x, y, 8, 0, 7); g.fill(); g.fillStyle = "rgba(255,255,255,.5)"; g.beginPath(); g.arc(x - 3, y - 3, 2.5, 0, 7); g.fill() }
    g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(70, 300, 110, 6); g.fillStyle = "#c9a26a"; g.fillRect(96, 262, 20, 44); g.fillStyle = "#d8403a"; g.fillRect(100, 270, 12, 28); g.fillStyle = "#8a6238"; g.fillRect(92, 260, 28, 6); g.fillRect(92, 302, 28, 6) }
  if (!back && o.botones) { g.fillStyle = o.botones; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(256, 150 + k * 82, 11, 0, 7); g.fill() } }
  if (o.remiendos) o.remiendos.forEach((c, i) => back ? remiendoG(g, i ? 300 : 70, i ? 120 : 300, 120, 100, c) : remiendoG(g, i ? 70 : 340, i ? 330 : 380, 110, 96, c));
  if (o.manchas) manchasG(g, w, h, o.manchas, (o.seed || 7) + (back ? 50 : 0), 120);
  if (o.cera) manchasCera(g, w, h, back ? Math.ceil(o.cera / 3) : o.cera, (o.seed || 7) + (back ? 60 : 0), back ? 120 : 190);
  { const gp = (x, y, r, a) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r) };   // pliegues pintados
    gp(0, 140, 150, .16); gp(w, 140, 150, .16); gp(256, h, 220, .12); g.strokeStyle = "rgba(0,0,0,.06)"; g.lineWidth = 14; g.lineCap = "round"; for (const [x0, y0, x1, y1] of [[60, 200, 180, 330], [452, 210, 340, 340], [200, 420, 300, 460]]) { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2 + 20, (y0 + y1) / 2, x1, y1); g.stroke() }
    const br = g.createRadialGradient(200, 160, 0, 200, 160, 200); br.addColorStop(0, "rgba(255,255,255,.10)"); br.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = br; g.fillRect(0, 0, w, h) }
  sombra2D(g, w, h, .12) }) }
const torsoLadoC = o => ROPAC["l" + JSON.stringify(o)] ||= tex(64, 64, (g, w, h) => { g.fillStyle = o.levita ? o.levita[0] : o.chaleco ? o.chaleco[0] : o.chal ? o.chal[0] : o.col; g.fillRect(0, 0, w, h);
  if (o.kind && !o.levita && !o.chaleco && !o.chal) estampaC(g, w, h, o.kind, o.col, o.alt || "#efe6d2", o.alt2, .125);
  if (o.delantal) { g.fillStyle = o.delantal[0]; g.fillRect(0, 28, w, 3) } if (o.faja) { g.fillStyle = o.faja[0]; g.fillRect(0, h - 13, w, 7) } if (o.panuelo) { g.fillStyle = o.panuelo; g.fillRect(0, 0, w, 5) } sombra2D(g, w, h, .12) });
// brazo: manga hasta `manga` (0 sin manga … 1 larga) con estampado (kind/alt/alt2), puño (punoH = alto: arremangado grueso), rayas, guante (y guanteDesde),
// manchas, cera, quemaduras (n, en la piel), remiendo; el resto es la mano color piel
const brazoC = o => ROPAC["b" + JSON.stringify(o)] ||= tex(128, 256, (g, w, h) => { const y = h * (o.manga ?? .82); g.fillStyle = o.skin; g.fillRect(0, 0, w, h); g.fillStyle = o.col; g.fillRect(0, 0, w, y);
  if (o.kind) patronC(g, w, y, o, o.col);
  if (o.rayas) { g.fillStyle = o.rayas; for (let yy = 34; yy < y - 34; yy += 54) g.fillRect(0, yy, w, 16) }
  if (o.puno) { const ph = o.punoH || 20; g.fillStyle = o.puno; g.fillRect(0, y - ph - 6, w, ph); if (o.punoH) { g.fillStyle = "rgba(0,0,0,.18)"; g.fillRect(0, y - ph / 2 - 6, w, 3) } }
  if (o.remiendo) remiendoG(g, 18, h * .3, 92, 60, o.remiendo);
  if (o.alfiletero) { const yy = y - 46; g.fillStyle = "#6a4a2a"; g.fillRect(0, yy - 4, w, 10); g.fillStyle = o.alfiletero; g.beginPath(); g.ellipse(64, yy - 16, 30, 24, 0, 0, 7); g.fill(); g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = 2; for (const a of [-.8, 0, .8]) { g.beginPath(); g.moveTo(64, yy - 40); g.quadraticCurveTo(64 + a * 40, yy - 16, 64, yy + 8); g.stroke() }
    const cols = ["#f2d040", "#f4f4f4", "#4a8ae0", "#5ab05a"]; [[50, -30], [76, -34], [60, -22], [84, -18]].forEach(([x, dy], i) => { g.strokeStyle = "#d8dce2"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, yy + dy); g.lineTo(x - 6, yy + dy - 22); g.stroke(); g.fillStyle = cols[i]; g.beginPath(); g.arc(x - 6, yy + dy - 22, 5, 0, 7); g.fill() }) }
  if (o.manchas) manchasG(g, w, y, o.manchas, o.seed || 3);
  if (o.cera) manchasCera(g, w, y, o.cera, (o.seed || 3) + 20, 10);
  g.fillStyle = "rgba(0,0,0,.16)"; g.fillRect(0, y, w, 4);
  if (o.quemaduras) quemadurasG(g, 10, y + 16, w - 20, h * .95 - y - 16, o.quemaduras, (o.seed || 3) + 40);
  if (o.guante) { const yg = h * (o.guanteDesde ?? .76); g.fillStyle = o.guante; g.fillRect(0, yg, w, h - yg); g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(0, yg + 6, w, 7); g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(0, yg, w, 5) }
  sombra2D(g, w, h, .1) });
// pierna: pantalón hasta `largo` (debajo, media o piel) con estampado, pollera/levita pintada arriba hasta `falda` (con estampado si hay kind);
// zapato = franja oscura abajo (cana = alto), gastado = raspones; frente = 1 → la cara de adelante (delantalP: el delantal sigue hasta la rodilla; cera)
const piernaC = o => ROPAC["p" + JSON.stringify(o)] ||= tex(128, 256, (g, w, h) => { const L = h * (o.largo ?? .87);
  g.fillStyle = o.media || o.skin; g.fillRect(0, 0, w, h); g.fillStyle = o.col; g.fillRect(0, 0, w, L);
  if (o.rayado) { g.fillStyle = o.rayado; for (let x = 10; x < w; x += 26) g.fillRect(x, 0, 6, L) }
  if (o.kind && !o.falda) patronC(g, w, L, o, o.col);
  if (o.denim) { const r = rng(o.seed || 5); for (let i = 0; i < 900; i++) { g.fillStyle = r() < .5 ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.08)"; g.fillRect(r() * w, r() * L, 1 + r() * 3, 1) }
    const kn = g.createRadialGradient(w / 2, L * .5, 4, w / 2, L * .5, 60); kn.addColorStop(0, "rgba(255,255,255,.12)"); kn.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = kn; g.fillRect(0, 0, w, L);
    g.strokeStyle = "rgba(230,190,110,.35)"; g.setLineDash([5, 4]); g.lineWidth = 2; g.beginPath(); g.moveTo(8, 0); g.lineTo(8, L); g.stroke(); g.setLineDash([]); g.fillStyle = "rgba(0,0,0,.15)"; g.fillRect(0, L - 16, w, 5) }
  if (!o.falda) { g.fillStyle = "rgba(0,0,0,.1)"; g.fillRect(w / 2 - 2, 0, 4, L * .9) }
  if (o.remiendo) remiendoG(g, 20, h * .42, 86, 56, o.remiendo);
  if (o.manchas) manchasG(g, w, L, o.manchas, o.seed || 5, 20);
  if (o.falda) { const yf = h * o.falda; g.fillStyle = o.faldaCol || o.col; g.fillRect(0, 0, w, yf); if (o.kind) patronC(g, w, yf, o, o.faldaCol || o.col); if (o.ruedo) { g.fillStyle = o.ruedo; g.fillRect(0, yf - 24, w, 14) } if (o.remiendoF) remiendoG(g, 24, yf * .35, 80, 50, o.remiendoF); g.fillStyle = "rgba(0,0,0,.2)"; g.fillRect(0, yf, w, 5) }
  if (o.frente && o.delantalP) { const yd = h * .5; g.fillStyle = o.delantalP; g.fillRect(0, 0, w, yd); g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(0, yd - 6, w, 6) }
  if (o.frente && o.cera) manchasCera(g, w, L, o.cera, (o.seed || 5) + 9, 10);
  if (L < h * .86) { g.fillStyle = "rgba(0,0,0,.2)"; g.fillRect(0, L, w, 4) }
  const zb = h * (1 - (o.cana ?? .13)); g.fillStyle = o.zapato || "#2a2220"; g.fillRect(0, zb, w, h - zb); g.fillStyle = "rgba(255,255,255,.12)"; g.fillRect(0, zb, w, 4);
  if (o.gastado) { g.fillStyle = "rgba(200,190,170,.3)"; for (let i = 0; i < 8; i++) g.fillRect(6 + (i * 37) % (w - 30), zb + 8 + (i * 13) % Math.max(4, h - zb - 14), 12 + (i * 7) % 16, 3) }
  sombra2D(g, w, h, .1) });

// ================= PELO COMO EL DE VOLZE: pieza esculpida con mechones, surcos y textura de hebras =================
// Base: un casco continuo (caja redondeada alrededor de la cabeza) que cubre arriba, costados y nuca hasta la línea de cada estilo y se hunde
// en la cabeza debajo de esa línea. Encima: surcos irregulares entre mechones grandes (desplazamiento + oclusión en el color de vértice: crestas
// claras, surcos oscuros), ruido de volumen asimétrico, mechones sueltos en lágrima (flequillo de 3–5, puntas que salen), trenzas de eslabones
// alternados, rodete de vueltas. Material: textura de hebras finas a lo largo del peinado (mapa de color) + bump con los surcos (1024 px).
// Estilos: "despeinado" · "trenzas" · "coletas" · "atras" · "melena" · "rodete" · "coleta" · "jopo" · "corto" · "rulos" · "calvo". Colores PELO_COL.
const PELO_COL = { rubio: "#e6b340", choco: "#5b3a24", castano: "#8a5a34", rojo: "#b2502a", gris: "#cfcfd3", negro: "#2a2422", blanco: "#ecebe6" };
const _sst = (a, b, v) => { const q = cl((v - a) / (b - a)); return q * q * (3 - 2 * q) };
// hebras: líneas finas onduladas a lo largo de v (mapa de color) y, en el bump, surcos más anchos cada tanto
const [T_HEBRAS_C, T_HEBRAS_B] = (() => { const W = 1024, H = 1024, r = rng(90210), c = mk(W, H), b = mk(W, H), g = c.getContext("2d"), z = b.getContext("2d");
  g.fillStyle = "#e8e8e8"; g.fillRect(0, 0, W, H); z.fillStyle = "#808080"; z.fillRect(0, 0, W, H);
  for (let i = 0; i < 700; i++) { const x = r() * W, a = 4 + r() * 10, ph = r() * 6, dark = r() < .55, lw = .7 + r() * 2.2;
    g.strokeStyle = dark ? `rgba(0,0,0,${.08 + r() * .16})` : `rgba(255,255,255,${.2 + r() * .35})`; z.strokeStyle = dark ? `rgba(0,0,0,${.15 + r() * .2})` : `rgba(255,255,255,${.15 + r() * .2})`;
    g.lineWidth = z.lineWidth = lw; g.beginPath(); z.beginPath(); for (let y = 0; y <= H; y += 32) { const xx = x + a * Math.sin(y / H * 6.283 * 1.5 + ph); y ? (g.lineTo(xx, y), z.lineTo(xx, y)) : (g.moveTo(xx, y), z.moveTo(xx, y)) } g.stroke(); z.stroke() }
  for (let x = 0; x < W;) { const w = 10 + r() * 16, ph = r() * 6; for (const [ctx, col] of [[g, "rgba(0,0,0,.14)"], [z, "rgba(0,0,0,.55)"]]) { ctx.strokeStyle = col; ctx.lineWidth = w * (ctx === z ? .5 : .35); ctx.beginPath(); for (let y = 0; y <= H; y += 32) { const xx = x + 6 * Math.sin(y / H * 9 + ph); y ? ctx.lineTo(xx, y) : ctx.moveTo(xx, y) } ctx.stroke() } x += 40 + r() * 60 }
  return [c, b].map(cv => { const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t }) })();
T_HEBRAS_C.colorSpace = THREE.SRGBColorSpace;
const M_PELO2 = {}; const matPelo = (col, rep = 3, brillo = 0) => M_PELO2[col + rep + (brillo ? "b" : "")] ||= (() => { const m = new THREE.MeshStandardMaterial({ color: col, roughness: brillo ? .2 : .42, metalness: brillo ? .15 : 0, vertexColors: true, map: T_HEBRAS_C.clone(), bumpMap: T_HEBRAS_B.clone(), bumpScale: 2.2, side: THREE.DoubleSide });
  [m.map, m.bumpMap].forEach(t => { t.repeat.set(rep, 1); t.needsUpdate = true }); return m })();
// color de vértice: degradé suave por alto × oclusión (ao 0 = cresta, 1 = surco)
const _colorPelo = (G, ao = null, y0 = .1, y1 = 1) => { const P = G.attributes.position, c = new Float32Array(P.count * 3); for (let i = 0; i < P.count; i++) { const s = (.82 + .18 * _sst(y0, y1, P.getY(i))) * (1 - .55 * (ao ? ao[i] : 0)); c[i * 3] = c[i * 3 + 1] = c[i * 3 + 2] = s } G.setAttribute("color", new THREE.BufferAttribute(c, 3)); return G };
// mechón suelto: lágrima aplastada contra el cráneo (la textura de hebras corre a lo largo)
const GEO_MECHON = (() => { const pr = [[.001, 0], [.62, .06], [.86, .26], [.8, .52], [.5, .8], [.18, .95], [.001, 1]].map(([x, y]) => new THREE.Vector2(x, y)); return new THREE.LatheGeometry(pr, 12) })();
const _CEN_P = new THREE.Vector3(0, .5, -.05);
function mechonG(b, d, L, r, ap = .42) { const B = new THREE.Vector3(...b), Y = new THREE.Vector3(...d).normalize(), Z = B.clone().sub(_CEN_P).normalize(); Z.addScaledVector(Y, -Z.dot(Y)).normalize(); const X = new THREE.Vector3().crossVectors(Y, Z);
  const g = GEO_MECHON.clone(); g.applyMatrix4(new THREE.Matrix4().makeBasis(X.multiplyScalar(r), Y.multiplyScalar(L), Z.multiplyScalar(r * ap)).setPosition(B)); return _colorPelo(g, null, -.3, 1) }
// cfg: frente/lado/nuca = borde del pelo (coords de la cabeza: .05 mentón … .71 coronilla) · fleqBaja: [x, ancho, cuánto] · largo: estira costados y nuca
// surcos: { n, prof, modo: "a" (alrededor) | "x" (peinado atrás), seed } · raya: x de la raya (surco hondo de adelante a atrás) · vol, asim (ruido de volumen)
// bultos: [[azimut, alto, ancho, cuánto]] · mechones: [[base, dir, largo, grosor]] · trenzas: { r, n } · rodete: [x, y, z, r] · cola: [base, dir, r, largo]
function cascoPeloV(cfg) { const G = new THREE.SphereGeometry(1, 80, 56), P = G.attributes.position, C = new THREE.Vector3(0, .41, -.02), E = [.43, .42 + (cfg.alto || 0), .42], v = new THREE.Vector3(), ao = new Float32Array(P.count);
  const S = cfg.surcos || { n: 0 }, r = rng(S.seed || 7), L = cfg.largo || 1, fl = cfg.fleqBaja;
  const surcos = Array.from({ length: S.n || 0 }, (_, i) => [(i + .5 + (r() - .5) * .6) / S.n, .25 + r() * .5, .6 + r() * .8]);   // [posición 0..1, ancho relativo, hondura relativa]
  const ph = [r() * 6, r() * 6, r() * 6, r() * 6];
  for (let i = 0; i < P.count; i++) { v.set(P.getX(i), P.getY(i), P.getZ(i)); const a = Math.atan2(v.x, v.z), t = Math.abs(a) / Math.PI;
    const q = [v.x, v.y, v.z].map((u, j) => Math.sign(u) * Math.pow(Math.abs(u), .36) * E[j]); let x = q[0], y = q[1], z = q[2];
    if (L > 1 && y < 0 && t > .22) y *= lerp(1, L, _sst(.22, .45, t));
    const Y = C.y + y;
    let yB = t < .5 ? lerp(cfg.frente, cfg.lado, _sst(.12, .5, t)) : lerp(cfg.lado, cfg.nuca, _sst(.5, .88, t));
    if (fl && t < .3) yB -= fl[2] * Math.exp(-(((x - fl[0]) / fl[1]) ** 2)) * (1 - _sst(.15, .3, t));
    yB += .025 * Math.sin(a * 7 + ph[0]) + .015 * Math.sin(a * 13 + ph[1]);   // borde despar
    const vis = _sst(yB - .03, yB + .03, Y), arriba = _sst(.45, .75, Y);
    let f = 1 + (cfg.vol || 0) * arriba + (cfg.asim ?? .03) * (Math.sin(a * 2 + ph[2]) * .7 + Math.sin(a * 5 + ph[3]) * .3) * arriba, dip = 0;
    if (surcos.length) { const u = S.modo === "x" ? (x / E[0] + 1) / 2 : (a / Math.PI + 1) / 2; for (const [p, w, h] of surcos) { const d = Math.abs(u - p), dd = Math.min(d, 1 - d) * S.n; dip += h * Math.exp(-((dd / (w * .35)) ** 2)) } dip = Math.min(1, dip) * _sst(.45, .7, Y) }
    if (cfg.raya != null) { const dr = (x - cfg.raya) / .03; const rr = Math.exp(-dr * dr) * _sst(.6, .8, Y) * (z > -.1 ? 1 : _sst(-.4, -.1, z)); dip = Math.max(dip, rr) }
    f -= (S.prof || .04) * dip; (cfg.bultos || []).forEach(([ba, by, bw, bk]) => { const da = Math.atan2(Math.sin(a - ba), Math.cos(a - ba)); f += bk * Math.exp(-((da / bw) ** 2) - (((Y - by) / (bw * .5)) ** 2)) });
    ao[i] = dip * vis; f = lerp(.76, f, vis); P.setXYZ(i, C.x + x * f, C.y + y * f, C.z + z * f) }
  G.computeVertexNormals(); return _colorPelo(G, ao) }
const ESTILOS_PELO = {
  despeinado: { frente: .68, lado: .4, nuca: .26, vol: .05, asim: .05, surcos: { n: 9, prof: .05, modo: "a", seed: 3 }, bultos: [[.5, .86, .5, .07], [-.7, .82, .4, .04], [2.6, .8, .6, .05]],
    mechones: [[[-.26, .8, .3], [.3, -.6, .5], .24, .12], [[-.08, .82, .31], [.45, -.6, .45], .27, .13], [[.12, .8, .3], [.55, -.5, .4], .22, .11], [[.27, .78, .28], [.6, -.35, .3], .2, .1],
      [[.1, .9, -.05], [.7, .3, .6], .22, .12], [[-.2, .89, .02], [-.6, .25, .7], .2, .11], [[.43, .62, -.1], [.3, -.8, -.2], .2, .09], [[-.15, .7, -.44], [-.3, -.8, -.4], .2, .1]] },
  trenzas: { frente: .62, lado: .42, nuca: .3, raya: 0, surcos: { n: 10, prof: .035, modo: "x", seed: 11 },
    mechones: [[[-.2, .82, .3], [-.25, -.7, .55], .2, .12], [[-.05, .84, .31], [-.1, -.7, .55], .19, .11], [[.07, .84, .31], [.12, -.7, .55], .19, .11], [[.21, .82, .3], [.28, -.7, .5], .2, .12]],
    trenzas: { r: .085, n: 7, base: [.42, .5, -.1] } },
  coletas: { frente: .62, lado: .42, nuca: .3, raya: 0, surcos: { n: 8, prof: .035, modo: "x", seed: 5 }, cola2: 1 },
  atras: { frente: .75, lado: .42, nuca: .28, vol: .04, asim: .02, surcos: { n: 11, prof: .055, modo: "x", seed: 21 }, bultos: [[0, .84, .5, .04], [.9, .7, .4, .03]],
    mechones: [[[.4, .5, .16], [0, -1, .05], .14, .06], [[-.4, .5, .16], [0, -1, .05], .14, .06], [[.1, .9, -.38], [.1, -.4, -1], .18, .1]] },
  melena: { frente: .64, lado: -.18, nuca: -.2, largo: 1.75, fleqBaja: [-.16, .2, .08], raya: .12, surcos: { n: 8, prof: .045, modo: "a", seed: 13 }, bultos: [[1.3, .2, .6, .05], [-1.3, .15, .6, .07]],
    mechones: [[[-.26, .78, .29], [-.5, -.6, .4], .26, .12], [[-.08, .8, .31], [-.3, -.7, .5], .24, .11], [[.43, .1, .05], [.15, -1, .1], .22, .1], [[-.44, .05, -.05], [-.2, -1, 0], .24, .1]] },
  rodete: { frente: .66, lado: .42, nuca: .32, raya: -.08, surcos: { n: 10, prof: .04, modo: "x", seed: 17 }, rodete: [0, .9, -.24, .17],
    mechones: [[[.2, .8, .29], [.5, -.6, .4], .2, .1], [[.33, .74, .25], [.4, -.8, .2], .2, .08], [[-.42, .58, .05], [-.1, -1, .1], .16, .07]] },
  coleta: { frente: .66, lado: .42, nuca: .32, raya: .1, surcos: { n: 9, prof: .04, modo: "x", seed: 19 }, cola: [[0, .76, -.42], [0, -.85, -.5], .12, .42],
    mechones: [[[-.18, .8, .3], [-.4, -.6, .45], .22, .11], [[0, .82, .31], [-.2, -.7, .5], .2, .1]] },
  jopo: { frente: .72, lado: .44, nuca: .3, surcos: { n: 8, prof: .045, modo: "x", seed: 23 }, bultos: [[0, .82, .55, .14]],
    mechones: [[[-.12, .86, .26], [.1, .4, .9], .22, .13], [[.1, .87, .24], [.2, .45, .85], .2, .12], [[.3, .62, .1], [0, -1, .1], .14, .07], [[-.3, .62, .1], [0, -1, .1], .14, .07]] },
  corto: { frente: .7, lado: .44, nuca: .32, asim: .03, surcos: { n: 10, prof: .035, modo: "a", seed: 29 }, bultos: [[.4, .84, .5, .04]],
    mechones: [[[-.22, .82, .29], [.7, -.4, .4], .2, .1], [[-.05, .84, .3], [.75, -.35, .35], .2, .1], [[.13, .82, .29], [.8, -.3, .3], .18, .09]] },
  rulos: { frente: .68, lado: .4, nuca: .3, vol: .06, surcos: { n: 14, prof: .07, modo: "a", seed: 31 }, rulos: 1 },
  // ---- estilos de «Nobody Answers The Knock»
  // revuelto (Tib, recién levantado): casco con bultos desparejos y mechones que salen PARA ARRIBA y a los costados (remolino atrás)
  revuelto: { frente: .66, lado: .4, nuca: .28, vol: .07, asim: .07, surcos: { n: 11, prof: .06, modo: "a", seed: 41 }, bultos: [[.3, .88, .45, .08], [-1.1, .84, .5, .06], [2.8, .82, .5, .07]],
    mechones: [[[-.2, .84, .26], [-.3, .25, .9], .2, .11], [[.02, .87, .26], [.15, .3, .9], .22, .12], [[.22, .83, .24], [.6, .1, .7], .2, .1], [[-.05, .91, -.12], [-.15, .5, -.8], .2, .11],
      [[.18, .88, -.22], [.5, .35, -.7], .18, .1], [[-.32, .8, -.1], [-.9, .25, -.2], .18, .09], [[.4, .68, -.05], [.9, .05, -.1], .17, .08], [[-.08, .78, -.4], [-.2, .1, -1], .18, .09], [[.3, .78, .24], [.5, -.4, .6], .16, .08]] },
  // engominado (Crane): peinado para atrás, pegado y brillante, surcos de peine parejos, raya al costado y un rulito de frente que se le escapa
  engominado: { frente: .76, lado: .46, nuca: .3, vol: .01, asim: .01, raya: -.15, brillo: 1, surcos: { n: 18, prof: .045, modo: "x", seed: 43 }, bultos: [[0, .86, .5, .03]],
    mechones: [[[.06, .78, .3], [.4, -.7, .2], .14, .06]] },
  // trenzaLarga (la madre): raya al medio, pelo tirante a los costados y UNA trenza larga de eslabones que cae por la espalda
  trenzaLarga: { frente: .64, lado: .4, nuca: .26, raya: 0, surcos: { n: 12, prof: .04, modo: "x", seed: 47 },
    mechones: [[[-.2, .8, .3], [-.5, -.55, .3], .2, .1], [[.2, .8, .3], [.5, -.55, .3], .2, .1]],
    trenzas: { r: .095, n: 13, base: [0, .42, -.36], lados: [1], dir: [.05, -1, -.18] } } };
// peloC(estilo, col, { lazo }): devuelve un Group (casco + mechones + trenzas/rodete/cola) para k.peloG. lazo = color del moño (trenzas/coletas)
function peloC(estilo, col, op = {}) { if (estilo === "calvo") return null; const cfg = ESTILOS_PELO[estilo] || ESTILOS_PELO.corto, G = new THREE.Group(), m = matPelo(col, 3, cfg.brillo), mS = matPelo(col, 1, cfg.brillo);
  const add = (geo, mat = m) => { const me = new THREE.Mesh(geo, mat); me.castShadow = me.receiveShadow = true; me.userData.pelo = 1; G.add(me); return me };
  add(cascoPeloV(cfg)); const extra = [];
  (cfg.mechones || []).forEach(([b, d, L, r]) => extra.push(mechonG(b, d, L, r)));
  if (cfg.rulos) { const rr = rng(5); for (let i = 0; i < 26; i++) { const u = i / 26, a = i * 2.4, R = .12 + Math.sqrt(u) * .3; extra.push(mechonG([Math.cos(a) * R, .92 - u * .3, Math.sin(a) * R - .04], [Math.cos(a) * .3, .4 + rr() * .4, Math.sin(a) * .3], .12 + rr() * .05, .09)) } }
  if (cfg.rodete) { const [x, y, z, R] = cfg.rodete; for (let i = 0; i < 3; i++) { const tg = new THREE.TorusGeometry(R * (1 - i * .3), R * .42 * (1 - i * .15), 12, 28); tg.rotateX(-Math.PI / 2 + .5); tg.translate(x, y + i * R * .45, z + i * .02); extra.push(_colorPelo(tg, null, .6, 1.2)) } const s = new THREE.SphereGeometry(R * .4, 14, 10); s.translate(x, y + R * 1.2, z + .04); extra.push(_colorPelo(s)) }
  if (cfg.cola) { const [b, d, r, Lc] = cfg.cola; for (let i = 0; i < 3; i++) extra.push(mechonG([b[0] + (i - 1) * .05, b[1], b[2]], [d[0] + (i - 1) * .2, d[1], d[2]], Lc * (1 - i * .1 + (i === 1 ? .1 : 0)), r * .9, .8)) }
  if (cfg.cola2) for (const s of [-1, 1]) for (let i = 0; i < 3; i++) extra.push(mechonG([s * .44, .56, -.1], [s * (.8 - i * .15), -.7 - i * .1, -.15 + i * .1], .36 + i * .03, .12, .8));
  if (cfg.trenzas) { const { r: R, n, base, lados = [-1, 1], dir: dd = [.22, -1, .18] } = cfg.trenzas; for (const s of lados) { let p = new THREE.Vector3(s * base[0], base[1], base[2]); const dir = new THREE.Vector3(s * dd[0], dd[1], dd[2]).normalize(), seg = R * 1.45;
      for (let i = 0; i < n; i++) { const g = new THREE.SphereGeometry(1, 14, 10), lado = i % 2 ? 1 : -1, rr = R * (1 - i * .035); g.scale(rr * 1.05, seg * .78, rr * .8); g.rotateZ(lado * .55); g.translate(lado * rr * .3, 0, 0);
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().negate()); g.applyQuaternion(q); g.translate(p.x, p.y, p.z); extra.push(_colorPelo(g, null, -.6, .8)); p = p.clone().addScaledVector(dir, seg * .62) }
      if (op.lazo) { const k = new THREE.Group(); k.position.copy(p).addScaledVector(dir, -.02); G.add(k); monoCinta(k, op.lazo, 0, 0, .02, .75) }
      const pun = mechonG([p.x, p.y + .03, p.z], [dir.x * .4, -1, dir.z], .12, .07, .9); extra.push(pun) } }
  if (extra.length) add(mergeG(extra.map(g => [g, new THREE.Matrix4()])).setAttribute("color", new THREE.BufferAttribute(new Float32Array(extra.reduce((a, g) => (a.push(...(g.index ? g.toNonIndexed() : g).attributes.color.array), a), [])), 3)), mS);
  G.userData.pelo = 1; return G }
// barbaC(k, col): perilla lisa de UNA pieza debajo de la boca, con un patrón tejido IMPRESO (filas de V) como las barbas de Volze
const T_TEJIDO = tex(128, 128, (g, w, h) => { g.fillStyle = "#ffffff"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(0,0,0,.22)"; g.lineWidth = 3; for (let y = 4; y < h; y += 12) for (let x = 0; x < w; x += 12) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 6, y + 7); g.lineTo(x + 12, y); g.stroke() } }, [2, 2]);
function barbaC(k, col) { const m = new THREE.MeshStandardMaterial({ color: col, map: T_TEJIDO, roughness: .6 });
  const g = new THREE.CapsuleGeometry(.1, .2, 6, 16); g.rotateZ(Math.PI / 2); g.scale(1, 1.05, .55); const b = part(g, m, 0, .13, .355, k.head, 0); b.userData.pelo = 1;
  for (const s of [-1, 1]) { const p = part(new THREE.CapsuleGeometry(.04, .1, 4, 10), m, s * .17, .19, .35, k.head, 0); p.rotation.z = s * .5; p.scale.z = .55; p.userData.pelo = 1 } }
// sombreros y moños: piezas lisas de plástico
const M_PELO = {}; const peloMat = col => M_PELO[col] ||= new THREE.MeshStandardMaterial({ color: col, roughness: .45 });
const pzP = (h, geo, col, x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const m = part(geo, peloMat(col), x, y, z, h, 0); m.rotation.set(rx, ry, rz); m.scale.set(sx, sy, sz); m.userData.pelo = 1; return m };
const esfP = r => new THREE.SphereGeometry(r, 18, 12);
function gorraLisa(h, col) { pzP(h, new THREE.SphereGeometry(.45, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), col, 0, .6, -.01, 0, 0, 0, 1, .7, 1); pzP(h, RB(.6, .04, .34, .02, 2), col, 0, .63, .44, .12) }
const gorraTela = gorraLisa, gorraChata = gorraLisa;
function panueloC(h, col) { pzP(h, new THREE.SphereGeometry(.42, 24, 14, 0, Math.PI * 2, 0, Math.PI * .58), col, 0, .5, -.03, 0, 0, 0, 1, .95, .96); pzP(h, esfP(.1), col, 0, .34, -.42) }
function monoCinta(h, col, x = .22, y = .88, z = -.06, tam = 1) { for (const q of [-1, 1]) pzP(h, new THREE.ConeGeometry(.11 * tam, .22 * tam, 14), col, x + q * .12 * tam, y, z, 0, 0, q * Math.PI / 2); pzP(h, esfP(.06 * tam), col, x, y, z) }
function velo(k, col = "#f4f4f4") { const geo = new THREE.BoxGeometry(.68, .9, .02); geo.translate(0, -.45, -.05); const v = part(geo, new THREE.MeshStandardMaterial({ color: col, roughness: .5, transparent: true, opacity: .9 }), 0, .86, -.34, k.head, 0); v.rotation.x = .22; v.castShadow = false; v.userData.pelo = 1 }
// ================= VESTIR: reconstruye al personaje con seis bloques + ropa pintada; pelo y sombreros FUNDIDOS en pocas mallas (una por color) =================
// o: { skin (pasa por pielPastel salvo sinPastel), torso: {…torsoC}, brazo: {…brazoC}, pierna: {…piernaC}, pelo: [estilo, col] (peloC), gorra: col, panuelo: col,
//      peloExtra: h => {} (más pelo/moños, se funde con el resto), anteojos, barba: col, bigote: col, extra: k => {}, escala, encorvado,
//      forma: { torso: [w, h, d], brazo: [w, largo, d], pierna: [w, largo, d], cabeza: [w, h, d], sepPierna, cuello, cabezaZ, dedos: colorGuante }, cabezaMat }
const MANO_INVIS = new THREE.MeshBasicMaterial({ visible: false });
const FORMA0 = { torso: [1.04, 1.04, .52], brazo: [.5, 1.04, .5], pierna: [.5, 1.02, .5], cabeza: [.74, .66, .7], sepPierna: .26, cuello: 0, cabezaZ: 0, dedos: null };
function vestirC(k, o) { const skin = (typeof pielPastel === "function" && !o.sinPastel) ? pielPastel(o.skin) : o.skin, F = { ...FORMA0, ...(o.forma || {}) }; k.skin = skin; k.r6 = true; delete k.falda; delete k.pasoMax; delete k.zancMax; k.encorvado = o.encorvado || 0; k.flamea = [];
  [k.body, k.armL, k.armR, k.legL, k.legR].forEach(gr => [...gr.children].forEach(c => { if (c.isMesh || c.userData.pelo || c.userData.bota || c.userData.dedo) gr.remove(c) })); [...k.head.children].forEach(c => { if (c !== k.decal) k.head.remove(c) });
  const [tw, th, td] = F.torso, [bw, bl, bd] = F.brazo, [pw, pl, pd] = F.pierna, [cw, ch, cd] = F.cabeza, yS = pl + th - .08, yH = pl + th + F.cuello;
  k.hcad = pl; k._p0 = { armY: yS, armX: tw / 2 + bw / 2, armL: bl }; k._forma = F; delete k.abrigos;
  const plast = map => new THREE.MeshStandardMaterial({ map, roughness: .5 }), t = o.torso;
  part(RB(tw, th, td, .05), boxMats(plast(torsoLadoC(t)), plast(torsoC(t)), plast(torsoC(t, true))), 0, pl + th / 2, 0, k.body, 0);
  [k.armL, k.armR].forEach((a, i) => { part(RB(bw, bl, bd, .05), plast(brazoC({ skin, ...o.brazo, seed: (o.brazo.seed || 3) + i })), 0, .08 - bl / 2, 0, a, 0); a.position.set((i ? 1 : -1) * k._p0.armX, yS, 0);
    const hd = i ? k.handR : k.handL; a.add(hd); hd.position.set(0, .18 - bl, 0); hd.rotation.set(0, 0, 0); hd.material = MANO_INVIS; hd.castShadow = hd.receiveShadow = false });   // la mano: ancla invisible para la utilería
  [k.legL, k.legR].forEach((l, i) => { const po = { skin, ...o.pierna, seed: (o.pierna.seed || 5) + i }, lado = plast(piernaC(po)); part(RB(pw, pl, pd, .05), boxMats(lado, plast(piernaC({ ...po, frente: 1 })), lado), 0, .01 - pl / 2, 0, l, 0); l.position.set((i ? 1 : -1) * F.sepPierna, pl, 0) });
  const mCab = o.cabezaMat || new THREE.MeshStandardMaterial({ color: skin, roughness: .6, emissive: skin, emissiveIntensity: .28 });
  k.head.position.set(0, yH, F.cabezaZ); part(RB(cw, ch, cd, .075, 4), mCab, 0, .05 + ch / 2, 0, k.head, 0);
  if (F.cuello) part(new THREE.CylinderGeometry(.1, .13, F.cuello + .12, 8), mCab, 0, yH - F.cuello / 2 + .02, F.cabezaZ * .6, k.body, 0);
  k.decal.geometry = new THREE.PlaneGeometry(cw, ch * .84); k.decal.position.set(0, .07 + ch / 2, cd / 2 + .0015); k.decal.material.transparent = true; k.decal.material.needsUpdate = true;
  // dedos largos (Sallow): cuatro bloques finos y un pulgar en la punta de cada brazo, con pivote (se curvan: dedosSallow)
  k.dedos = []; if (F.dedos) { const md = accMat(F.dedos, { roughness: .55 }); [k.armL, k.armR].forEach(a => { [[-.105, 0, .3], [-.035, 0, .35], [.035, 0, .35], [.105, 0, .31], [0, .12, .2]].forEach(([x, z, L]) => {
      const pv = new THREE.Group(); pv.position.set(x * bw / .32, .1 - bl, z * bd / .34); pv.userData.dedo = 1; a.add(pv); const geo = new THREE.BoxGeometry(.055, L, .06); geo.translate(0, -L / 2, 0); part(geo, md, 0, 0, 0, pv, 0); k.dedos.push(pv) }) }) }
  const tmp = new THREE.Group(); if (o.gorra) gorraLisa(tmp, o.gorra); if (o.panuelo) panueloC(tmp, o.panuelo); if (o.peloExtra) o.peloExtra(tmp);
  tmp.updateMatrixWorld(true); const porCol = new Map(); tmp.traverse(m => { if (!m.isMesh) return; const key = m.material.color.getHexString() + (m.material.roughness) + (m.material.side || 0); if (!porCol.has(key)) porCol.set(key, [m.material, []]); porCol.get(key)[1].push([m.geometry, m.matrixWorld.clone()]) });
  k.peloG = new THREE.Group(); k.head.add(k.peloG); porCol.forEach(([mat, list]) => { const me = part(mergeG(list), mat, 0, 0, 0, k.peloG, 0); me.userData.pelo = 1 });
  if (o.pelo) { const hm = peloC(...o.pelo); if (hm) { k.peloG.add(hm); hm.scale.set(cw / .74, ch / .66, cd / .7) } }   // el pelo se ajusta a la cabeza (Crane la tiene angosta y alta)
  if (o.anteojos) anteojosV(k); if (o.barba) barbaC(k, o.barba); if (o.bigote) { const m = accMat(o.bigote); for (const s of [-1, 1]) { bloque(k.head, m, .19, .06, .05, s * .1, .345, .37, 0, 0, s * -.15) } } if (o.extra) o.extra(k);
  k.body.scale.setScalar(o.escala || 1); k.arrugas = 0; k._arena = null; setFace(k, "neutral"); return k }

// ================= ACCESORIOS PERSISTENTES (parte del personaje, no utilería) =================
const EL_ACERO = new THREE.MeshStandardMaterial({ color: "#e4e8ee", roughness: .32, metalness: .55, emissive: "#3a3e44", emissiveIntensity: .35 }), EL_ACERO_O = new THREE.MeshStandardMaterial({ color: "#9aa0a8", roughness: .35, metalness: .5 });
const EL_MANGO = new THREE.MeshStandardMaterial({ color: "#1c1c1e", roughness: .35 }), EL_LATON = new THREE.MeshStandardMaterial({ color: "#caa24c", roughness: .28, metalness: .85 });
const EL_HIERRO = new THREE.MeshStandardMaterial({ color: "#5a5c62", roughness: .45, metalness: .7 });
// ---------- las TIJERAS grandes de sastre: dos mitades (hoja de acero afinada + mango negro con ojo), tornillo de bronce. Origen = el tornillo,
// las hojas hacia +z (≈ .62), los ojos hacia −z. abrir(a) abre las hojas a radianes (0 cerradas).
function nuevaTijera() { const G = new THREE.Group(), mit = [];
  for (const s of [-1, 1]) { const M = new THREE.Group(); G.add(M); mit.push(M);
    const hg = new THREE.BoxGeometry(.085, .022, .64, 1, 1, 8); hg.translate(0, 0, .32); const p = hg.attributes.position;
    for (let i = 0; i < p.count; i++) { const z = p.getZ(i), f = 1 - .88 * Math.pow(z / .64, 1.3); p.setX(i, s * .036 + p.getX(i) * f); p.setY(i, p.getY(i) + s * .012) }
    hg.computeVertexNormals(); part(hg, EL_ACERO, 0, 0, 0, M, 0);
    part(new THREE.BoxGeometry(.03, .024, .62), EL_ACERO_O, s * .012, s * .012, .31, M, 0);   // filo (el lomo más oscuro)
    const sk = part(new THREE.BoxGeometry(.05, .03, .16), EL_MANGO, -s * .045, s * .012, -.09, M, 0); sk.rotation.y = s * .25;
    const ojo = part(new THREE.TorusGeometry(s < 0 ? .075 : .06, .022, 8, 20), EL_MANGO, -s * .085, s * .012, -.22, M, 0); ojo.rotation.x = Math.PI / 2; ojo.scale.set(1, s < 0 ? 1.3 : 1, 1) }
  const tor = part(new THREE.CylinderGeometry(.022, .022, .07, 10), EL_LATON, 0, 0, 0, G, 0);
  G.userData.abrir = a => { mit[0].rotation.y = -a / 2; mit[1].rotation.y = a / 2 }; return G }
// tijeraCuelga(k, on): las tijeras cuelgan del cinto (adelante, a la izquierda), con un cordón. La pose de corte las esconde en ese cuadro.
function armarTijeraCuelga(k) { const F = k._forma, pl = F.pierna[1], td = F.torso[2], G = new THREE.Group(); G.name = "tijeraCuelga"; k.body.add(G);
  const T = nuevaTijera(); T.rotation.x = Math.PI / 2; T.position.set(0, -.26, 0); G.add(T); T.userData.abrir(.06);
  part(new THREE.CylinderGeometry(.012, .012, .16, 6), accMat("#8a2a2a"), 0, -.06, 0, G, 0);   // el cordón
  G.position.set(-.3, pl + .06, td / 2 + .035); G.rotation.z = .12; k.tijeraC = G; k.conTijera = true; return G }
function tijeraCuelga(k, on = true) { k.conTijera = on; if (k.tijeraC) k.tijeraC.visible = on }
// ---------- la CINTA MÉTRICA amarilla colgada del cuello (dos tiras que bajan por adelante, una más larga), con rayitas y números
const EL_T_CINTA = tex(64, 512, (g, w, h) => { g.fillStyle = "#f2c830"; g.fillRect(0, 0, w, h); g.fillStyle = "#1a1a1a"; for (let y = 0; y < h; y += 8) g.fillRect(0, y, y % 40 ? 14 : 26, 2);
  g.font = "bold 14px sans-serif"; g.textAlign = "right"; for (let y = 40, n = 1; y < h; y += 40, n++) g.fillText(String(n), w - 4, y + 5); g.fillStyle = "rgba(0,0,0,.12)"; g.fillRect(0, 0, w, 3); g.fillRect(0, h - 3, w, 3) });
function cintaMetrica(k) { const F = k._forma, [tw, th, td] = F.torso, top = F.pierna[1] + th, m = new THREE.MeshStandardMaterial({ map: EL_T_CINTA, roughness: .45 });
  const tira = (x, y0, L, z, rz = 0, rx = 0) => { const geo = new THREE.BoxGeometry(.1, L, .012); geo.translate(0, -L / 2, 0); const me = part(geo, m, x, y0, z, k.body, 0); me.rotation.set(rx, 0, rz); return me };
  tira(-.19, top + .006, .82, td / 2 + .012, .04); tira(.17, top + .006, .56, td / 2 + .012, -.06);                 // las dos puntas adelante
  for (const x of [-.19, .17]) tira(x, top + .008, td + .03, td / 2 + .012, 0, Math.PI / 2);   // por arriba de los hombros
  { const geo = new THREE.BoxGeometry(.38, .1, .012); const me = part(geo, m, -.01, top - .04, -td / 2 - .008, k.body, 0); me.rotation.z = Math.PI / 2 * 0 }   // la vuelta por la nuca
  // la chapita de metal de la punta larga
  part(new THREE.BoxGeometry(.11, .04, .02), EL_LATON, -.19 + .033, top - .82, td / 2 + .014, k.body, 0) }
// ---------- los HILOS de Marga: tres hebras gruesas de colores colgadas del cuello (le pasan por la nuca y caen adelante)
function hilosCuello(k) { const F = k._forma, [tw, th, td] = F.torso, top = F.pierna[1] + th;
  [["#d8403a", 0, .5], ["#3a7ad8", .04, .62], ["#f0c838", -.035, .42]].forEach(([col, dx, L]) => { const P = [[-.2 + dx, top - L, td / 2 + .03], [-.23 + dx, top - .12, td / 2 + .03], [-.25 + dx, top + .022, .14], [-.12 + dx, top + .026, -td / 2 + .02],
      [.12 + dx, top + .026, -td / 2 + .02], [.25 + dx, top + .022, .14], [.22 + dx, top - .14, td / 2 + .03], [.18 + dx, top - L * .8, td / 2 + .03]].map(q => new THREE.Vector3(...q));
    const me = part(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P), 40, .017, 6), new THREE.MeshStandardMaterial({ color: col, roughness: .7 }), 0, 0, 0, k.body, 0); me.castShadow = false;
    // la aguja enhebrada en la punta del hilo rojo
    if (col === "#d8403a") part(new THREE.CylinderGeometry(.006, .006, .14, 5), EL_ACERO, P[0].x, P[0].y - .06, P[0].z, k.body, 0) }) }
// ---------- el LLAVERO de Crane: argolla de bronce en el cinto con seis llaves viejas (una grande de bronce)
function llaveG(L, m) { const G = new THREE.Group(); const ojo = part(new THREE.TorusGeometry(.03, .009, 6, 14), m, 0, -.03, 0, G, 0);
  part(new THREE.CylinderGeometry(.008, .008, L, 6), m, 0, -.06 - L / 2, 0, G, 0); part(new THREE.BoxGeometry(.012, .045, .03), m, 0, -.06 - L + .03, .02, G, 0); part(new THREE.BoxGeometry(.012, .02, .02), m, 0, -.06 - L + .07, .015, G, 0); return G }
function llavero(k) { const F = k._forma, pl = F.pierna[1], td = F.torso[2], G = new THREE.Group(); G.position.set(.26, pl + .1, td / 2 + .03); k.body.add(G);
  const ar = part(new THREE.TorusGeometry(.06, .009, 8, 22), EL_LATON, 0, 0, 0, G, 0);
  [[.16, EL_HIERRO, -.5], [.22, EL_LATON, -.2], [.13, EL_HIERRO, .05], [.18, EL_HIERRO, .3], [.11, EL_LATON, .55], [.15, EL_HIERRO, .8]].forEach(([L, m, a]) => { const l = llaveG(L, m); l.position.set(Math.sin(a) * .06, -Math.cos(a) * .06 + .02, 0); l.rotation.z = a * .5; l.rotation.y = a; G.add(l) });
  k.llaveroG = G; return G }

// ================= EL ELENCO =================
const EL_NUEVOS = Array.from({ length: 6 }, () => { const k = kid({ skin: "#f2dec8", shirt: "#7a6a5a", cloth: "plain", pants: "#3a3a3a", shoes: "#2a2420", hair: "#2b211b", style: "corto" }); TURT.add(k.g); ALL.push(k); return k });
const TIB = ME6, MAMA = QUILL, PAPA = PIM, CRANE = GARROW, MARGA = PESCADOR;
const VECINOS = [...FOLK, ...EXT], NOVIO = EL_NUEVOS[0], NOVIA = EL_NUEVOS[1], CORO = EL_NUEVOS.slice(2, 6);
const ORO = "#d9a84a";
const COL_EL = { rojo: "#d8483a", azul: "#3d8fd6", celeste: "#5aa7e0", amarillo: "#e0c040", verde: "#6aa04a", rosa: "#e88ab0", naranja: "#e8843a", violeta: "#8a5ab8",
  marino: "#1e2f5a", crema: "#efe4cf", blanco: "#f4f4f2", jean: "#2c2f36", jeanClaro: "#8fb4da", caqui: "#b8a07a", negro: "#26262a", gris: "#6a6a74", lavanda: "#ab92d6", bordo: "#8e1f3a" };
const PIEL = { clara: "#eab890", durazno: "#dfa478", trigueña: "#c98d62", morena: "#a06a46", oscura: "#7e5034" };
const JEAN = (col = COL_EL.jean, o = {}) => ({ col, denim: 1, zapato: "#2a2420", ...o });
// ---------- ME, el sastre (≈ 15): camisa blanca arremangada, chaleco azul marino con alfileres, alfiletero rojo en la muñeca, pantalón gris,
// cinta métrica amarilla al cuello, tijeras grandes colgando del cinto, pelo castaño despeinado
vestirC(ME, { skin: PIEL.durazno, torso: { col: "#f4f2ec", cuello: "#ffffff", chaleco: ["#24346a", "#d8c890"], alfileres: 9, seed: 31 },
  brazo: { col: "#f4f2ec", manga: .6, puno: "#e2ded4", punoH: 26, alfiletero: "#d83a3a" }, pierna: { col: "#5c616e", zapato: "#3a2a20", gastado: 1 }, pelo: ["despeinado", PELO_COL.castano], escala: .9,
  extra: k => { cintaMetrica(k); armarTijeraCuelga(k) } });
// ---------- TIB (≈ 6): pijama celeste con estrellitas y lunas, cuello y botones blancos, pantuflas violeta, pelo rubio revuelto, el muñeco de trapo
const EL_PIJ = { col: "#8cc2ec", kind: "estrellitas", alt: "#ffffff", alt2: "#f6e27a" };
vestirC(TIB, { skin: PIEL.clara, torso: { ...EL_PIJ, cuelloR: "#ffffff", botones: "#ffffff" }, brazo: { ...EL_PIJ, manga: .92, puno: "#ffffff" }, pierna: { ...EL_PIJ, largo: .9, zapato: "#8a5ab0", cana: .1 },
  pelo: ["revuelto", PELO_COL.rubio], escala: .74 });
// ---------- MAMÁ (muda): vestido lavanda floreado con cuello blanco, trenza negra larga; la cara de reposo es la triste
vestirC(MAMA, { skin: PIEL.trigueña, torso: { col: COL_EL.lavanda, kind: "floreado", alt: "#f4ecfa", alt2: "#f2c84a", cuello: "#ffffff" }, brazo: { col: COL_EL.lavanda, manga: .88, puno: "#ffffff" },
  pierna: { col: COL_EL.lavanda, falda: .9, kind: "floreado", alt: "#f4ecfa", alt2: "#f2c84a", zapato: "#3a2a2a" }, pelo: ["trenzaLarga", PELO_COL.negro] });
MAMA.caraBase = "tristeMudo";
// ---------- PAPÁ (cansado): camisa a cuadros verde, overol de jean con manchas de grasa, gorra roja, bigote
vestirC(PAPA, { skin: PIEL.morena, torso: { col: "#3f8a4a", kind: "cuadros", alt: "#1c4a26", overol: "#3a5f9a", manchas: 2, seed: 17 }, brazo: { col: "#3f8a4a", kind: "cuadros", alt: "#1c4a26", manga: .86, puno: "#2a5a32" },
  pierna: JEAN("#3a5f9a", { zapato: "#3a2418", gastado: 1, manchas: 2, seed: 18 }), pelo: ["corto", PELO_COL.choco], gorra: "#c83a32", bigote: PELO_COL.choco, escala: 1.04 });
PAPA.caraBase = "cansado";
// ---------- MARGA (vieja): vestido gris, chal rosa con guarda, rodete gris, anteojos, hilos de colores al cuello (con una aguja)
vestirC(MARGA, { skin: PIEL.clara, torso: { col: "#77777f", chal: ["#e87aa8", "#f8e2ee"] }, brazo: { col: "#77777f", manga: .9, puno: "#e87aa8" }, pierna: { col: "#5a5a64", falda: .92, zapato: "#2a2420" },
  pelo: ["rodete", PELO_COL.gris], anteojos: 1, encorvado: .18, escala: .9, extra: k => hilosCuello(k) });
// ---------- FATHER CRANE: altísimo y flaco (≈ 1,3 × un adulto), sotana negra con botonera, cuello clerical, pelo gris engominado, llavero, no parpadea
const EL_PIEL_CRANE = "#d2cbb6";   // piel de cera, un poco gris: la cabeza con poco brillo propio (no se lava como la de los demás)
vestirC(CRANE, { skin: EL_PIEL_CRANE, sinPastel: 1, cabezaMat: new THREE.MeshStandardMaterial({ color: EL_PIEL_CRANE, roughness: .6, emissive: EL_PIEL_CRANE, emissiveIntensity: .04 }), forma: { torso: [.8, 1.22, .42], brazo: [.32, 1.42, .34], pierna: [.36, 1.42, .4], cabeza: [.6, .8, .62], sepPierna: .2, cuello: .12, cabezaZ: .04 },
  torso: { col: "#141418", botonera: "#2e2e36", clerical: "#f6f6f2" }, brazo: { col: "#141418", manga: .9, puno: "#1e1e24" }, pierna: { col: "#141418", falda: .97, faldaCol: "#141418", zapato: "#08080a", cana: .07 },
  pelo: ["engominado", "#b9b9be"], extra: k => llavero(k) });
CRANE.caraBase = "crane"; CRANE.sinParpadeo = true; CRANE.brazoA = .16;
// ---------- LOS NOVIOS
vestirC(NOVIO, { skin: PIEL.durazno, torso: { col: COL_EL.marino, traje: [COL_EL.blanco, COL_EL.rojo, COL_EL.blanco] }, brazo: { col: COL_EL.marino, manga: .88, puno: COL_EL.blanco }, pierna: { col: COL_EL.marino, zapato: "#141418" }, pelo: ["jopo", PELO_COL.negro] });
vestirC(NOVIA, { skin: PIEL.clara, torso: { col: COL_EL.blanco, encaje: "#ffffff", faja: ["#e8d8c8"] }, brazo: { col: COL_EL.blanco, manga: .82 }, pierna: { col: COL_EL.blanco, falda: .94, zapato: COL_EL.blanco }, pelo: ["rodete", PELO_COL.castano], extra: k => velo(k) });
// ---------- EL CORO: túnica bordó larga con esclavina blanca y cruz dorada
const EL_CORO_T = { col: COL_EL.bordo, esclavina: ["#f6f4ee", ORO], cruz: ORO }, EL_CORO_B = { col: COL_EL.bordo, manga: .94, puno: "#f6f4ee" }, EL_CORO_P = { col: COL_EL.bordo, falda: .97, zapato: "#141418" };
[[PIEL.durazno, ["corto", PELO_COL.castano], 1], [PIEL.clara, ["rodete", PELO_COL.rubio], .96], [PIEL.morena, ["calvo"], 1.04, PELO_COL.gris], [PIEL.trigueña, ["rulos", PELO_COL.negro], .94]].forEach(([skin, pelo, esc, barba], i) =>
  vestirC(CORO[i], { skin, torso: EL_CORO_T, brazo: EL_CORO_B, pierna: EL_CORO_P, pelo, escala: esc, barba }));
// ---------- LOS VECINOS (de noche: abrigados, un color dominante distinto cada uno)
const VV = VECINOS;
vestirC(VV[0], { skin: PIEL.clara, torso: { col: COL_EL.azul, cuelloR: "#2a6ab0", bufanda: [COL_EL.rojo, COL_EL.blanco] }, brazo: { col: COL_EL.azul, manga: .9, puno: "#2a6ab0" }, pierna: JEAN(), pelo: ["corto", PELO_COL.negro] });   // hombre: suéter azul, bufanda rayada
vestirC(VV[1], { skin: PIEL.trigueña, torso: { col: COL_EL.amarillo, cuelloR: COL_EL.celeste, corazon: COL_EL.rojo }, brazo: { col: COL_EL.amarillo, manga: .9, puno: COL_EL.celeste }, pierna: { col: COL_EL.marino, falda: .86, zapato: "#2a2420" }, pelo: ["coleta", PELO_COL.castano] });   // mujer: suéter amarillo
vestirC(VV[2], { skin: PIEL.durazno, torso: { col: COL_EL.marino, cuelloR: "#14203f" }, brazo: { col: COL_EL.marino, manga: .9, puno: "#14203f" }, pierna: { col: "#7a7a82", zapato: "#2a2420" }, pelo: ["atras", PELO_COL.gris], barba: PELO_COL.gris, encorvado: .2 });   // viejo
vestirC(VV[3], { skin: PIEL.clara, torso: { col: COL_EL.rosa, kind: "florecitas", alt: "#fbe6ee", alt2: COL_EL.amarillo, cuello: COL_EL.blanco }, brazo: { col: COL_EL.rosa, manga: .88 }, pierna: { col: COL_EL.rosa, falda: .88, kind: "florecitas", alt: "#fbe6ee", zapato: "#7a2030" }, pelo: ["melena", PELO_COL.rubio] });   // muchacha
vestirC(VV[4], { skin: PIEL.oscura, torso: { col: COL_EL.naranja, tirantes: "#3a2418", cuello: "#f0e0c8" }, brazo: { col: COL_EL.naranja, manga: .88 }, pierna: { col: "#4a4a52", zapato: "#2a2420" }, pelo: ["jopo", PELO_COL.negro] });   // muchacho: camisa naranja con tiradores
vestirC(VV[5], { skin: PIEL.morena, torso: { col: COL_EL.verde, tejido: ["#e8f0d8", "#f2c84a"] }, brazo: { col: COL_EL.verde, manga: .9, puno: "#e8f0d8" }, pierna: { col: "#5a5a64", falda: .9, zapato: "#2a2420" }, pelo: ["rulos", PELO_COL.negro] });   // mujer: suéter tejido verde
vestirC(VV[6], { skin: PIEL.clara, torso: { col: COL_EL.rojo, kind: "franjas", alt: COL_EL.blanco, cuelloR: COL_EL.blanco }, brazo: { col: COL_EL.rojo, manga: .36 }, pierna: JEAN(COL_EL.jean, { largo: .55, media: COL_EL.blanco }), gorra: COL_EL.azul, pelo: ["corto", PELO_COL.castano], escala: .72 });   // chico
vestirC(VV[7], { skin: PIEL.durazno, torso: { col: COL_EL.amarillo, overol: COL_EL.jeanClaro }, brazo: { col: COL_EL.amarillo, manga: .34 }, pierna: JEAN(COL_EL.jeanClaro, { zapato: "#d84a3a" }), pelo: ["coletas", PELO_COL.rojo], peloExtra: h => monoCinta(h, COL_EL.rosa, .3, .72, -.2, .8), escala: .7 });   // chica
vestirC(VV[8], { skin: PIEL.durazno, torso: { col: COL_EL.blanco, delantal: ["#ffffff", "#dcdcdc"], manchas: 0 }, brazo: { col: COL_EL.blanco, manga: .6, puno: "#e6e6e6", punoH: 24 }, pierna: { col: "#3a3a44", zapato: "#2a2420", delantalP: "#ffffff" }, pelo: ["corto", PELO_COL.negro], bigote: PELO_COL.negro, escala: 1.06 });   // panadero
vestirC(VV[9], { skin: PIEL.trigueña, torso: { col: COL_EL.violeta, botones: "#f2d060", cuelloR: "#6a4098" }, brazo: { col: COL_EL.violeta, manga: .9, puno: "#6a4098" }, pierna: { col: "#3a3044", falda: .9, zapato: "#2a2420" }, panuelo: COL_EL.naranja });   // mujer: tapado violeta, pañuelo naranja
const ELENCO_V = [ME, TIB, MAMA, PAPA, MARGA, CRANE, NOVIO, NOVIA, ...VECINOS, ...CORO];
const ELENCO_N = { ME, TIB, MAMA, PAPA, MARGA, CRANE, NOVIO, NOVIA, ...Object.fromEntries(VECINOS.map((k, i) => ["V" + i, k])), ...Object.fromEntries(CORO.map((k, i) => ["C" + i, k])) };
ALL.forEach((k, i) => { k.idx = i; setFace(k, "neutral") });
function vientoPelo() { }   // (legado: acá no sopla)

// ---------- helpers de pose (cuerpo entero con cuaterniones; brazos que apuntan a un punto del mundo)
function qMundo(k, arriba, frente, out = new THREE.Quaternion()) { _ay.set(...arriba).normalize(); _az.set(...frente); _az.addScaledVector(_ay, -_az.dot(_ay)); if (_az.lengthSq() < 1e-6) _az.set(1, 0, 0).addScaledVector(_ay, -_ay.x);
  _az.normalize(); _ax.crossVectors(_ay, _az); _mb.makeBasis(_ax, _ay, _az); out.setFromRotationMatrix(_mb); k.g.updateWorldMatrix(true, false); k.g.getWorldQuaternion(_q2); return out.premultiply(_q2.invert()) }
function cuerpoQ(k, q, pivL, pivG) { const b = k.body, s = b.scale.y; b.quaternion.copy(q); _v3.set(...pivL).multiplyScalar(s).applyQuaternion(q); b.position.set(pivG[0] - _v3.x, pivG[1] - _v3.y, pivG[2] - _v3.z) }
// apuntar(k, miembro, p): el brazo/pierna apunta con su punta al punto p del MUNDO (Vector3). Los brazos no doblan: la mano queda a un largo de brazo del hombro.
function apuntar(k, m, p) { k.g.updateMatrixWorld(true); _v1.copy(p); m.parent.worldToLocal(_v1); _v1.sub(m.position); if (_v1.lengthSq() < 1e-8) return; m.quaternion.setFromUnitVectors(_ABAJO, _v1.normalize()) }
const gW = (k, x, y, z, out = new THREE.Vector3()) => { k.g.updateMatrixWorld(true); return k.g.localToWorld(out.set(x, y, z)) };
// punto del cuerpo (coordenadas del cuerpo SIN escala, como las medidas de la forma) → mundo, con la pose actual
const bW = (k, x, y, z, out = new THREE.Vector3()) => { k.g.updateMatrixWorld(true); return k.body.localToWorld(out.set(x, y, z)) };
const _MIEM = k => [k.armL, k.armR, k.legL, k.legR, k.head];
function fotoPose(k) { return { bq: k.body.quaternion.clone(), bp: k.body.position.clone(), m: _MIEM(k).map(o => o.quaternion.clone()) } }
function mezclaPoses(k, fA, fB, u) { fA(); const A = fotoPose(k); fB(); const B = fotoPose(k); k.body.quaternion.slerpQuaternions(A.bq, B.bq, u); k.body.position.lerpVectors(A.bp, B.bp, u); _MIEM(k).forEach((o, i) => o.quaternion.slerpQuaternions(A.m[i], B.m[i], u)) }
// medidas de la cara (coordenadas de la cabeza): centro de cada ojo y de la boca, sobre la calcomanía
function _cara(k) { const [cw, ch, cd] = k._forma.cabeza, yc = .07 + ch / 2, hD = ch * .84; return { cw, ch, cd, yc, hD, ey: yc + (.5 - EY / 384) * hD, my: yc + (.5 - MY / 384) * hD, ex: EX / 512 * cw } }
function ojosW(k) { const c = _cara(k); k.g.updateMatrixWorld(true); return [-1, 1].map(s => k.head.localToWorld(new THREE.Vector3(s * c.ex, c.ey, c.cd / 2 + .01))) }
function bocaW(k, adelante = .01) { const c = _cara(k); k.g.updateMatrixWorld(true); return k.head.localToWorld(new THREE.Vector3(0, c.my, c.cd / 2 + adelante)) }
const _hombro = k => k._p0.armY, _sc = k => k.body.scale.y;

// ================= UTILERÍA (escondida en cada cuadro: se muestra al pedirla) =================
const PROPS_C = [];
const PROP = g => { g.visible = false; g.userData.prop = 1; PROPS_C.push(g); return g };
// enMano(obj, k, mano, { off, derecho }): en la mano; derecho = queda vertical en el mundo (mirando para donde mira el personaje). Llamar DESPUÉS de posar los brazos.
function enMano(obj, k, mano = "R", { off = [0, -.12, 0], derecho = false } = {}) { attach(obj, k, mano, off); obj.quaternion.identity(); if (!derecho) return obj; const h = mano === "R" ? k.handR : k.handL;
  k.g.updateMatrixWorld(true); h.getWorldQuaternion(_q1); k.g.getWorldQuaternion(_q2); obj.quaternion.copy(_q1.invert().multiply(_q2)); return obj }
function enMundo(obj, pos, ry = 0, rx = 0, rz = 0) { if (obj.parent !== scene) scene.add(obj); obj.visible = true; obj.position.set(...(pos.isVector3 ? pos.toArray() : pos)); obj.rotation.set(rx, ry, rz); obj.scale.setScalar(obj.userData.esc || 1); return obj }
function utileriaReset() { PROPS_C.forEach(o => o.visible = false) }
const glowEl = (col, sz, op = 1) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false })); s.scale.setScalar(sz); return s };
// estira un cilindro de largo 1 (que cuelga hacia −y desde su origen) entre a y b (mundo)
function estirarEl(obj, a, b) { if (obj.parent !== scene) scene.add(obj); obj.visible = true; obj.position.copy(a); _v4.copy(b).sub(a); const L = _v4.length(); obj.quaternion.setFromUnitVectors(_ABAJO, _v4.normalize()); obj.scale.set(1, Math.max(L, .001), 1); return obj }
const cilindroEl = (r, mat) => { const geo = new THREE.CylinderGeometry(r, r, 1, 6, 1, true); geo.translate(0, -.5, 0); const G = new THREE.Group(); const m = part(geo, mat, 0, 0, 0, G, 0); m.castShadow = false; return G };

// ---------- el MUÑECO DE TRAPO de Tib: tela cruda remendada, ojos de botón, boca cosida en X, pelo de lana naranja, vestidito a cuadros rojos.
// Origen = la manito del muñeco (Tib lo lleva agarrado de un brazo, colgando).
const EL_T_TRAPO = tex(256, 256, (g, w, h) => { const r = rng(808); g.fillStyle = "#e6d6b8"; g.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { g.fillStyle = r() < .5 ? "rgba(120,90,50,.08)" : "rgba(255,255,255,.08)"; g.fillRect(r() * w, r() * h, 2, 1 + r() * 4) }
  remiendoG(g, 150, 30, 70, 60, "#9ab8d8"); g.strokeStyle = "rgba(90,60,30,.5)"; g.setLineDash([6, 5]); g.lineWidth = 2; g.strokeRect(4, 4, w - 8, h - 8); g.setLineDash([]) });
const EL_T_TRAPO_CARA = tex(256, 256, (g, w, h) => { g.drawImage(EL_T_TRAPO.image, 0, 0); for (const x of [86, 170]) { g.fillStyle = "#1a1a1a"; g.beginPath(); g.arc(x, 110, 22, 0, 7); g.fill(); g.fillStyle = "#e6d6b8"; for (const [dx, dy] of [[-6, -6], [6, -6], [-6, 6], [6, 6]]) { g.beginPath(); g.arc(x + dx, 110 + dy, 3.5, 0, 7); g.fill() } }
  g.strokeStyle = "#8a2a2a"; g.lineWidth = 5; for (let x = 90; x <= 166; x += 19) { g.beginPath(); g.moveTo(x, 168); g.lineTo(x + 12, 184); g.moveTo(x + 12, 168); g.lineTo(x, 184); g.stroke() } g.fillStyle = "rgba(230,120,120,.4)"; for (const x of [58, 198]) { g.beginPath(); g.arc(x, 150, 16, 0, 7); g.fill() } });
const EL_T_TRAPO_VEST = tex(128, 128, (g, w, h) => { g.fillStyle = "#c83a3a"; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(255,255,255,.45)"; for (let x = 0; x < w; x += 24) g.fillRect(x, 0, 10, h); for (let y = 0; y < h; y += 24) g.fillRect(0, y, w, 10); sombra2D(g, w, h, .15) });
function nuevoMuneco() { const G = new THREE.Group(), mT = new THREE.MeshStandardMaterial({ map: EL_T_TRAPO, roughness: .9 }), mV = new THREE.MeshStandardMaterial({ map: EL_T_TRAPO_VEST, roughness: .85 });
  const B = new THREE.Group(); G.add(B); B.rotation.z = -.25;   // el cuerpo cuelga un poco torcido del brazo
  part(RB(.06, .2, .06, .025), mT, 0, -.1, 0, B, 0);                                                 // el brazo agarrado (para arriba)
  part(RB(.24, .26, .12, .04), boxMats(mV, mV, mV), .1, -.32, 0, B, 0);                              // el cuerpo con el vestidito
  part(RB(.22, .2, .15, .05), boxMats(mT, mT, mT, mT, new THREE.MeshStandardMaterial({ map: EL_T_TRAPO_CARA, roughness: .9 }), mT), .1, -.08, 0, B, 0);   // la cabeza
  const lana = new THREE.MeshStandardMaterial({ color: "#e0782a", roughness: .8 }); [[-.02, .02], [.05, .04], [.12, .045], [.19, .03], [.24, -.02]].forEach(([x, y], i) => { const l = part(new THREE.CapsuleGeometry(.025, .09, 4, 8), lana, x, y, -.02, B, 0); l.rotation.z = (i - 2) * .5 });
  const bz = part(RB(.06, .18, .06, .025), mT, .25, -.32, 0, B, 0); bz.rotation.z = .5;                 // el otro brazo, flojo
  for (const x of [.05, .15]) { const p = part(RB(.07, .22, .07, .03), new THREE.MeshStandardMaterial({ color: "#ece4d4", map: EL_T_TRAPO_VEST, roughness: .9 }), x, -.55, 0, B, 0); p.rotation.z = (x - .1) * 2 }
  G.scale.setScalar(1.2); return G }
// muneco(k, modo): "mano" (cuelga de la mano izquierda: lo pone solo en cada cuadro), "abrazo" (contra el pecho: mueve los brazos; llamar después de la pose), null = sin muñeco
function muneco(k, modo = "mano") { k.modoMuneco = modo; if (!k.munecoP) { k.munecoP = nuevoMuneco(); scene.add(k.munecoP) } const M = k.munecoP; M.visible = !!modo; if (!modo) return M;
  if (modo === "abrazo") { const s = _sc(k), Y = _hombro(k), td = k._forma.torso[2]; if (M.parent !== k.body) k.body.add(M); M.position.set(-.1, Y - .1, td / 2 + .1); M.rotation.set(0, 0, .25); M.scale.setScalar(1.05);
    apuntar(k, k.armL, bW(k, .25, Y - .55, td / 2 + .45)); apuntar(k, k.armR, bW(k, -.25, Y - .45, td / 2 + .45)); return M }
  attach(M, k, "L", [0, -.03, .02]); M.quaternion.identity(); M.rotation.z = AB(k) * .8; M.scale.setScalar(1.2); return M }
muneco(TIB, "mano");

// ---------- utilería de las poses: tijeras en la mano, aguja, hilo, retazo de tela, cuerda de la campana, lágrimas, la lista
const EL_TIJERA = PROP(nuevaTijera());
const EL_AGUJA = PROP((() => { const G = new THREE.Group(); const a = part(new THREE.CylinderGeometry(.007, .004, .16, 6), EL_ACERO, 0, 0, 0, G, 0); a.rotation.x = Math.PI / 2; part(new THREE.TorusGeometry(.012, .003, 4, 10), EL_ACERO, 0, 0, -.075, G, 0); return G })());
const EL_M_HILO = new THREE.MeshStandardMaterial({ color: "#d8403a", roughness: .6 });
const EL_HILO = PROP(cilindroEl(.012, EL_M_HILO));
const EL_RETAZO = PROP((() => { const G = new THREE.Group(); const t = tex(128, 128, (g, w, h) => { g.fillStyle = "#3a6fc8"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(255,255,255,.6)"; g.setLineDash([8, 6]); g.lineWidth = 3; g.beginPath(); g.moveTo(10, 64); g.lineTo(80, 64); g.stroke(); g.setLineDash([]); g.fillStyle = "rgba(0,0,0,.6)"; g.beginPath(); g.ellipse(96, 60, 14, 9, .3, 0, 7); g.fill() });
  const m = part(new THREE.BoxGeometry(.34, .26, .02), new THREE.MeshStandardMaterial({ map: t, roughness: .9 }), 0, 0, 0, G, 0); return G })());
const EL_T_SOGA = tex(32, 128, (g, w, h) => { g.fillStyle = "#c8ac7a"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(60,40,20,.45)"; g.lineWidth = 3; for (let y = -w; y < h; y += 10) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + w); g.stroke() } }, [1, 30]);
const EL_CUERDA = PROP(cilindroEl(.035, new THREE.MeshStandardMaterial({ map: EL_T_SOGA, roughness: .85 })));
// la EL_LISTA: papel viejo con nombres y deudas escritos a mano (en inglés, como el video), una mancha, nombres tachados y uno marcado
const EL_T_LISTA = tex(360, 470, (g, w, h) => { const r = rng(1212); g.fillStyle = "#efe4c8"; g.fillRect(0, 0, w, h); for (let i = 0; i < 1400; i++) { g.fillStyle = r() < .5 ? "rgba(120,90,40,.05)" : "rgba(255,255,255,.06)"; g.fillRect(r() * w, r() * h, 2, 2) }
  const gr = g.createRadialGradient(w * .8, h * .85, 4, w * .8, h * .85, 80); gr.addColorStop(0, "rgba(140,100,40,.35)"); gr.addColorStop(1, "rgba(140,100,40,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = "rgba(90,110,150,.25)"; g.lineWidth = 1.5; for (let y = 78; y < h - 10; y += 38) { g.beginPath(); g.moveTo(16, y); g.lineTo(w - 16, y); g.stroke() }
  g.fillStyle = "#2a1c12"; g.font = "italic bold 30px Georgia, serif"; g.fillText("Owed —", 22, 52);
  const L = [["Widow Hale", "9"], ["Old Fenn", "22"], ["the Brack boys", "14"], ["Tanner's girl", "5"], ["Marga Wick", "40"], ["the Tailor", "30"], ["Ostler", "11"], ["Pell & wife", "18"], ["Dory", "7"], ["Mott", "26"]];
  g.font = "italic 25px Georgia, serif"; L.forEach(([n, d], i) => { const y = 108 + i * 38 - 6 + (r() - .5) * 3; g.fillText(n, 24 + (r() - .5) * 4, y); g.fillText(d, w - 60, y); g.strokeStyle = "rgba(42,28,18,.5)"; g.setLineDash([2, 6]); g.beginPath(); g.moveTo(24 + g.measureText(n).width + 34, y - 6); g.lineTo(w - 70, y - 6); g.stroke(); g.setLineDash([]);
    if (i === 1 || i === 3 || i === 8) { g.strokeStyle = "#2a1c12"; g.lineWidth = 3; g.beginPath(); g.moveTo(18, y - 8); g.lineTo(w - 24, y - 10); g.stroke(); g.lineWidth = 1.5 }
    if (i === 5) { g.strokeStyle = "#8a1a1a"; g.lineWidth = 3; g.beginPath(); g.ellipse(80, y - 8, 76, 20, -.03, 0, 7); g.stroke(); g.lineWidth = 1.5 } });
  g.fillStyle = "rgba(30,20,10,.85)"; g.font = "italic 22px Georgia, serif"; g.fillText("— F. C.", w - 100, h - 22);
  g.strokeStyle = "rgba(120,90,40,.35)"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, h * .5); g.lineTo(w, h * .52); g.stroke() });   // el doblez
const EL_T_LISTA_DORSO = tex(64, 84, (g, w, h) => { g.fillStyle = "#e6dabc"; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(60,40,20,.08)"; for (let y = 18; y < h; y += 7) g.fillRect(8 + (y * 7) % 9, y, 30 + (y * 13) % 18, 2) });
function nuevaLista() { const G = new THREE.Group(); const geo = new THREE.PlaneGeometry(.5, .66, 4, 4); const p = geo.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, .015 * Math.sin(p.getY(i) * 9) + .01 * Math.cos(p.getX(i) * 12)); geo.computeVertexNormals();
  const f = part(geo, new THREE.MeshStandardMaterial({ map: EL_T_LISTA, roughness: .85, side: THREE.FrontSide }), 0, 0, 0, G, 0); const b = part(geo.clone(), new THREE.MeshStandardMaterial({ map: EL_T_LISTA_DORSO, roughness: .9, side: THREE.BackSide }), 0, 0, 0, G, 0); return G }
const EL_LISTA = PROP(nuevaLista()), EL_LISTA_MUNDO = PROP(nuevaLista());
// listaEn(pos, ry, rx): el papel solo, en el mundo (la cara escrita mira a +z rotado por ry/rx)
function listaEn(pos, ry = 0, rx = 0) { return enMundo(EL_LISTA_MUNDO, pos, ry, rx) }
// lágrimas 3D (dos gotas que bajan desde los ojos + la estela mojada brillante), una por personaje
const EL_M_LAGRIMA = new THREE.MeshStandardMaterial({ color: "#cfe8ff", roughness: .05, metalness: .1, emissive: "#6a9ad0", emissiveIntensity: .45, transparent: true, opacity: .9 });
const EL_M_ESTELA = new THREE.MeshBasicMaterial({ color: "#bfe0ff", transparent: true, opacity: .55, depthWrite: false });
function lagrimas(k, t) { const c = _cara(k); if (!k.lagr) { k.lagr = [-1, 1].map(s => { const G = PROP(new THREE.Group()); k.head.add(G); const d = part(new THREE.SphereGeometry(.028, 10, 8), EL_M_LAGRIMA, 0, 0, .012, G, 0); d.scale.set(.8, 1.3, .6); d.castShadow = false;
      const e = new THREE.Mesh(new THREE.PlaneGeometry(.022, 1), EL_M_ESTELA); e.geometry.translate(0, -.5, 0); G.add(e); G.userData = { d, e, s, prop: 1 }; return G }) }
  k.lagr.forEach((G, i) => { const s = G.userData.s, y0 = c.ey - ERY / 384 * c.hD * 1.1, y1 = c.my - .1, ph = (t * .55 + i * .43) % 1, y = lerp(y0, y1, ph * ph);
    G.visible = true; G.position.set(s * (c.ex + .02), 0, c.cd / 2 + .004); G.userData.d.position.y = y; G.userData.d.visible = ph < .92; G.userData.e.position.set(0, y0, .004); G.userData.e.scale.y = Math.max(.02, (y0 - y)) }) }

// ---------- LOS ABRIGOS: tres tipos. Puestos = cáscara pintada sobre los bloques (torso, mangas, faldón en cada pierna); en la mano / colgados /
// en el piso = una pieza de abrigo colgando (cuerpo, mangas que cuelgan, cuello) con la misma tela pintada.
const EL_ABR = {
  rojo: { col: "#c4262e", osc: "#8e1a20", bot: "#1a1a1a", solapa: "#a61e26", largo: .62, cinto: "#8e1a20", doble: 1, L: 1.34, W: .92 },
  crane: { col: "#141417", osc: "#08080a", bot: "#2e2e34", solapa: "#24242a", largo: .95, L: 1.8, W: 1.0, terciopelo: 1 },
  tib: { col: "#2f6fd0", osc: "#22549e", bot: "#eadcb4", solapa: "#22549e", largo: .3, L: .8, W: .64, remiendos: ["#e8b840", "#d24a3a"], palillos: 1 } };
const _elLana = (g, w, h, seed, a = .07) => { const r = rng(seed); for (let i = 0; i < w * h / 90; i++) { g.fillStyle = r() < .5 ? `rgba(0,0,0,${a})` : `rgba(255,255,255,${a * .8})`; g.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 2) } };
const EL_TEX_ABR = {};
function texAbrigo(tipo, parte) { const C = EL_ABR[tipo], key = tipo + parte; if (EL_TEX_ABR[key]) return EL_TEX_ABR[key];
  const W = parte === "frente" || parte === "espalda" ? 512 : parte === "lado" ? 64 : 128, H = parte === "frente" || parte === "espalda" ? 512 : parte === "lado" ? 64 : 256;
  return EL_TEX_ABR[key] = tex(W, H, (g, w, h) => { g.fillStyle = C.col; g.fillRect(0, 0, w, h); _elLana(g, w, h, tipo.length * 31 + parte.length);
    if (parte === "frente") {
      // solapas en V (y el cuello de terciopelo en el de Crane), costura del cierre, botones, bolsillos con tapa, cinturón
      g.fillStyle = C.solapa; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(256 + s * 40, 0); g.lineTo(256 + s * 150, 0); g.lineTo(256 + s * 120, 150); g.lineTo(256 + s * 30, 250); g.lineTo(256 + s * 6, 250); g.closePath(); g.fill() }
      g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 4; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(256 + s * 150, 0); g.lineTo(256 + s * 120, 150); g.lineTo(256 + s * 30, 250); g.stroke() }
      g.fillStyle = C.osc; g.fillRect(250, 240, 12, h - 240);
      if (C.terciopelo) { g.fillStyle = "#26262c"; g.fillRect(150, 0, 212, 26) }
      const bot = (x, y, r = 13) => { g.fillStyle = C.bot; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = "rgba(255,255,255,.25)"; g.beginPath(); g.arc(x - 4, y - 4, r * .3, 0, 7); g.fill(); g.fillStyle = "rgba(0,0,0,.5)"; for (const [dx, dy] of [[-3, -3], [3, 3]]) { g.beginPath(); g.arc(x + dx, y + dy, 2, 0, 7); g.fill() } };
      if (C.palillos) for (let i = 0; i < 3; i++) { const y = 270 + i * 70; g.fillStyle = C.bot; g.beginPath(); g.roundRect(226, y - 8, 60, 16, 8); g.fill(); g.strokeStyle = "#5a3a20"; g.lineWidth = 4; g.beginPath(); g.moveTo(256, y - 8); g.lineTo(290, y - 22); g.stroke() }
      else if (C.doble) for (let i = 0; i < 3; i++) { bot(212, 280 + i * 70); bot(300, 280 + i * 70) } else for (let i = 0; i < 5; i++) bot(276, 270 + i * 50, 10);
      for (const s of [-1, 1]) { g.fillStyle = C.osc; g.fillRect(256 + s * 170 - 60, 400, 120, 22); g.strokeStyle = "rgba(0,0,0,.3)"; g.lineWidth = 2; g.strokeRect(256 + s * 170 - 60, 400, 120, 22) }
      if (C.cinto) { g.fillStyle = C.cinto; g.fillRect(0, 360, w, 30); g.fillStyle = "#d8c070"; g.fillRect(236, 356, 40, 38); g.fillStyle = C.cinto; g.fillRect(246, 364, 20, 22) }
      if (C.remiendos) { remiendoG(g, 330, 140, 100, 80, C.remiendos[0]); remiendoG(g, 70, 300, 90, 70, C.remiendos[1]) } }
    else if (parte === "espalda") { g.fillStyle = C.osc; g.fillRect(252, 0, 8, h); if (C.cinto) { g.fillStyle = C.cinto; g.fillRect(150, 360, 212, 30); for (const x of [170, 342]) { g.fillStyle = C.bot; g.beginPath(); g.arc(x, 375, 9, 0, 7); g.fill() } }
      if (C.terciopelo) { g.fillStyle = "#26262c"; g.fillRect(140, 0, 232, 40) } if (C.remiendos) remiendoG(g, 280, 220, 110, 90, C.remiendos[0]) }
    else if (parte === "manga") { g.fillStyle = C.osc; g.fillRect(0, h - 40, w, 26); g.fillStyle = C.bot; g.beginPath(); g.arc(w * .7, h - 27, 7, 0, 7); g.fill(); g.fillStyle = "rgba(0,0,0,.14)"; g.fillRect(w / 2 - 2, 0, 4, h - 40) }
    else if (parte === "falda") { g.fillStyle = C.osc; g.fillRect(0, h - 22, w, 14); g.fillStyle = "rgba(0,0,0,.12)"; g.fillRect(w / 2 - 2, 0, 4, h) }
    sombra2D(g, w, h, .14) }) }
const EL_M_ABR = {}; const matAbr = (tipo, parte) => EL_M_ABR[tipo + parte] ||= new THREE.MeshStandardMaterial({ map: texAbrigo(tipo, parte), roughness: tipo === "crane" ? .55 : .8 });
// abrigoPuesto(k, tipo, on): la cáscara del abrigo sobre el personaje (persistente). Pone uno solo por vez.
function armarAbrigoPuesto(k, tipo) { const C = EL_ABR[tipo], F = k._forma, [tw, th, td] = F.torso, [bw, bl, bd] = F.brazo, [pw, pl, pd] = F.pierna, L = [], lado = matAbr(tipo, "lado");
  L.push(part(RB(tw + .07, th + .03, td + .08, .05), boxMats(lado, matAbr(tipo, "frente"), matAbr(tipo, "espalda")), 0, pl + th / 2 + .01, 0, k.body, 0));
  const lm = bl * .84; [k.armL, k.armR].forEach(a => L.push(part(RB(bw + .055, lm, bd + .055, .05), matAbr(tipo, "manga"), 0, .1 - lm / 2, 0, a, 0)));
  const lf = pl * C.largo; [k.legL, k.legR].forEach(l => L.push(part(RB(pw + .06, lf, pd + .06, .04), matAbr(tipo, "falda"), 0, .02 - lf / 2, 0, l, 0)));
  if (C.terciopelo || C.doble) { const cu = part(RB(tw * .7, .14, td + .14, .05), matAbr(tipo, "lado"), 0, pl + th + .01, -.02, k.body, 0); L.push(cu) }   // cuello alto del tapado
  return L }
function abrigoPuesto(k, tipo, on = true) { k.abrigos ||= {}; for (const n in k.abrigos) if (n !== tipo || !on) k.abrigos[n].forEach(m => m.visible = false); if (!tipo || !on) { k.abrigoActual = null; return }
  (k.abrigos[tipo] ||= armarAbrigoPuesto(k, tipo)).forEach(m => m.visible = true); k.abrigoActual = tipo }
const abrigoRojo = (k, on = true) => abrigoPuesto(k, "rojo", on);
// el abrigo suelto: origen = el cuello (de donde cuelga); cuelga hacia −y, la cara de adelante a +z
function nuevoAbrigoSuelto(tipo) { const C = EL_ABR[tipo], G = new THREE.Group(), W = C.W, L = C.L, lado = matAbr(tipo, "lado");
  const cuerpo = new THREE.BoxGeometry(W, L, .16, 3, 6, 1); const p = cuerpo.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i), v = (y + L / 2) / L; p.setX(i, p.getX(i) * (.82 + .18 * (1 - v)) * (v > .9 ? lerp(1, .78, (v - .9) / .1) : 1)); p.setZ(i, p.getZ(i) + .03 * Math.sin(p.getX(i) * 7 + y * 3)) }   // se abre hacia abajo, hombros caídos, pliegues
  cuerpo.computeVertexNormals(); cuerpo.translate(0, -L / 2 - .06, 0); part(cuerpo, boxMats(lado, matAbr(tipo, "frente"), matAbr(tipo, "espalda")), 0, 0, 0, G, 0);
  for (const s of [-1, 1]) { const lm = L * .62, m = part(RB(W * .24, lm, .15, .04), matAbr(tipo, "manga"), s * (W * .46), -.1 - lm / 2, -.01, G, 0); m.rotation.z = s * .07 }   // las mangas que cuelgan a los costados
  part(RB(W * .62, .12, .2, .05), lado, 0, -.06, -.01, G, 0);                                    // el cuello
  const presilla = part(new THREE.TorusGeometry(.04, .01, 5, 12), lado, 0, .0, -.04, G, 0);          // la presilla de colgar
  G.userData.tipo = tipo; return G }
const EL_ABR_MANO = {}, EL_ABR_MUNDO = {};
const abrigoProp = (tipo, donde = "mundo") => { const D = donde === "mano" ? EL_ABR_MANO : EL_ABR_MUNDO; return D[tipo] ||= PROP(nuevoAbrigoSuelto(tipo)) };
// abrigoColgado(tipo, pos, ry): colgado del gancho pos (mundo) · abrigoEnPiso(tipo, pos, ry): tirado en el piso, un poco arrugado
function abrigoColgado(tipo, pos, ry = 0) { const A = enMundo(abrigoProp(tipo), pos, ry); A.scale.set(1, 1, 1); return A }
function abrigoEnPiso(tipo, pos, ry = 0) { const P = pos.isVector3 ? pos.toArray() : pos, A = enMundo(abrigoProp(tipo), [P[0], P[1] + .09, P[2]], ry, -Math.PI / 2 + .04, .12); A.scale.set(1, .8, .55);
  A.position.add(new THREE.Vector3(0, 0, EL_ABR[tipo].L * .4).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry)); return A }
// abrigoEnMano(k, tipo, { mano, doblado }): lo lleva colgando de la mano (doblado = a la mitad, sobre el antebrazo). tipo null = nada.
function abrigoEnMano(k, tipo, { mano = "R", doblado = true } = {}) { if (!tipo) return null; const A = abrigoProp(tipo, "mano"); A.visible = true; enMano(A, k, mano, { off: [0, -.06, .06], derecho: true });
  A.scale.set(1, doblado ? .5 : 1, doblado ? 1.8 : 1); return A }

// ================= ANIMACIÓN (se llaman DESPUÉS de pose(); dejan al personaje listo) =================
// pose() del motor queda envuelta: limpia lo que estas funciones tocan (nada queda pegado de un cuadro al otro), esconde la utilería una vez
// por cuadro, vuelve a colgar las tijeras del sastre y el muñeco de Tib.
{ const pose0 = pose; let tUlt = -1e9;
  pose = (k, t, o = {}) => { if (t !== tUlt) { tUlt = t; utileriaReset() } k._t = t; k.body.quaternion.identity(); k.body.position.set(0, 0, 0); _MIEM(k).forEach(m => m.quaternion.identity()); if (k._p0) { k.armL.position.y = k.armR.position.y = k._p0.armY; k.head.position.x = 0 }
    if (k.tijeraC) k.tijeraC.visible = k.conTijera !== false; if (k.munecoP && k.modoMuneco === "abrazo") k.modoMuneco = "mano"; pose0(k, t, o); if (k.munecoP) muneco(k, k.modoMuneco) } }
// quiebre de cadera (el torso gira en la cadera y las piernas siguen rectas; sin codos ni rodillas). lean = inclinación del torso (+ adelante); psi = ángulo de las piernas
function cadera(k, lean, psi = 0) { const b = k.body, L0 = b.rotation.x, s = b.scale.y, d = lean - L0, H = HC(k);
  b.rotation.x = lean; k.legL.rotation.x += psi - d; k.legR.rotation.x += psi - d; b.position.z -= H * s * ((Math.sin(lean) - Math.sin(L0)) - Math.sin(psi)); b.position.y -= H * s * ((Math.cos(lean) - Math.cos(L0)) - (Math.cos(psi) - 1)) }
const _fase = k => (k.idx || 0) * 1.7;
const _respira = (k, t) => k.quietoTotal ? 0 : .012 * Math.sin(t * 2.2 + (k.idx || 0));
function dedosSallow() { }   // (legado)
// quieto(k, t, { mira }): parado derecho, brazos en «A», respira
function quieto(k, t, { mira = 0 } = {}) { const A = AB(k); k._t = t;
  k.legL.rotation.set(0, 0, 0); k.legR.rotation.set(0, 0, 0); k.armL.rotation.set(0, 0, -A - _respira(k, t)); k.armR.rotation.set(0, 0, A + _respira(k, t)); k.head.rotation.set(_respira(k, t), mira, 0); k.body.rotation.set(0, 0, 0); k.body.position.set(0, 0, 0);
  if (k.encorvado) { cadera(k, k.encorvado); k.head.rotation.x = -k.encorvado * .75; k.armL.rotation.x = k.encorvado * .8; k.armR.rotation.x = k.encorvado * .8 }
  parpadeo(k, t) }
// caminata: ciclo de 0,5 s; piernas ±27,5°, brazos ±7° en «A», balanceo ±5°. vel < 0 = hacia atrás
function andar(k, t, { vel = 1 } = {}) { const f = t * vel / .5 * Math.PI * 2 + _fase(k), sw = Math.sin(f), amp = k.pasoMax ?? .48, A = AB(k), s = k.body.scale.y; k._t = t;
  k.body.rotation.set(0, 0, sw * .087); k.body.position.set(0, -HC(k) * s * (1 - Math.cos(amp * sw)), 0);
  k.legL.rotation.set(sw * amp, 0, 0); k.legR.rotation.set(-sw * amp, 0, 0); k.armL.rotation.set(-sw * .12, 0, -A); k.armR.rotation.set(sw * .12, 0, A); k.head.rotation.set(0, 0, -sw * .04);
  if (k.encorvado) { cadera(k, k.encorvado); k.head.rotation.x = -k.encorvado * .75 }
  parpadeo(k, t) }
// corrida: ciclo de 0,5 s; torso 20° adelante; fuerte = 1: brazos que bombean
function correrV(k, t, { fuerte = 0 } = {}) { const f = t / .5 * Math.PI * 2 + _fase(k), sw = Math.sin(f), amp = k.zancMax ?? .87, A = AB(k), lean = .35, s = k.body.scale.y; k._t = t;
  k.body.rotation.set(0, 0, 0); k.body.position.set(0, Math.abs(sw) * .13 * s, 0); k.legL.rotation.set(sw * amp, 0, 0); k.legR.rotation.set(-sw * amp, 0, 0); cadera(k, lean);
  const b0 = lerp(.38, -1.2, fuerte), ba = lerp(.06, .55, fuerte), bz = lerp(A * .7, .12, fuerte); k.armL.rotation.set(b0 - sw * ba, 0, -bz); k.armR.rotation.set(b0 + sw * ba, 0, bz); k.head.rotation.set(-lean * .7, 0, 0); parpadeo(k, t) }
function mirarArriba(k, t, u = 1) { const e = _suave(u); quieto(k, t); cadera(k, (k.encorvado || 0) - .14 * e); k.head.rotation.x = -.5 * e + _respira(k, t); k.armL.rotation.x = .12 * e; k.armR.rotation.x = .12 * e; parpadeo(k, t) }
function senalarArriba(k, t, u = 1, { mano = "R" } = {}) { const e = _suave(u); mirarArriba(k, t, u); const a = mano === "R" ? k.armR : k.armL, sg = mano === "R" ? 1 : -1; a.rotation.set(lerp(0, -2.75, e) + .03 * Math.sin(t * 3), 0, sg * lerp(AB(k), .05, e)); parpadeo(k, t) }
// senalar(k, t, u, { alto, mano }): señala adelante con el brazo estirado (alto = cuánto más arriba, rad)
function senalar(k, t, u = 1, { alto = 0, mano = "R" } = {}) { const e = _suave(u); quieto(k, t); const a = mano === "R" ? k.armR : k.armL, sg = mano === "R" ? 1 : -1; a.rotation.set(lerp(0, -1.5 - alto, e) + .02 * Math.sin(t * 4), 0, sg * lerp(AB(k), .03, e)); k.head.rotation.x = -alto * .4 * e; parpadeo(k, t) }
// retroceder(k, t, u): camina HACIA ATRÁS (la escena mueve k.g hacia −z local) mirando arriba, brazos un poco adelante
function retroceder(k, t, u = 1) { const e = _suave(u); andar(k, t, { vel: -.85 }); cadera(k, -.1 * e); k.head.rotation.x = -.45 * e; k.armL.rotation.x -= .5 * e; k.armR.rotation.x -= .5 * e; k.armL.rotation.z -= .2 * e; k.armR.rotation.z += .2 * e; parpadeo(k, t) }
// abrazarse(k, t, { tiembla }): se abraza a sí mismo (brazos cruzados sobre el pecho), encogido, tiritando
function abrazarse(k, t, { tiembla = 1 } = {}) { quieto(k, t); const s = k.body.scale.y, j = tiembla * .02 * Math.sin(t * 37 + (k.idx || 0)); cadera(k, (k.encorvado || 0) + .1); k.head.rotation.x = .12;
  apuntar(k, k.armL, gW(k, (.5 + j) * s, 1.72 * s, .72 * s)); apuntar(k, k.armR, gW(k, (-.5 - j) * s, 1.56 * s, .68 * s)); k.body.rotation.z += j; parpadeo(k, t) }
// boda(novio, novia, t): de frente (≈ 1,3 de distancia) tomados de las dos manos, meciéndose apenas
function boda(a, b, t) { quieto(a, t); quieto(b, t); [a, b].forEach((k, i) => { k.body.rotation.z = .03 * Math.sin(t * 1.6 + i * Math.PI); k.head.rotation.x = .06 }); a.g.updateMatrixWorld(true); b.g.updateMatrixWorld(true);
  const pa = a.g.getWorldPosition(new THREE.Vector3()), pb = b.g.getWorldPosition(new THREE.Vector3()), mid = pa.clone().lerp(pb, .5), d = pb.clone().sub(pa).setY(0).normalize(), lat = _v3.set(d.z, 0, -d.x), y = 1.25 * Math.min(a.body.scale.y, b.body.scale.y);
  for (const [k, sg] of [[a, 1], [b, -1]]) { apuntar(k, k.armL, mid.clone().addScaledVector(lat, -.28 * sg).setY(mid.y + y)); apuntar(k, k.armR, mid.clone().addScaledVector(lat, .28 * sg).setY(mid.y + y)) } parpadeo(a, t); parpadeo(b, t) }
// ladear(k, t, u, { lado }): inclina la cabeza de costado DEMASIADO (≈ 47°), despacio (Crane). Se llama después de la pose de base.
function ladear(k, t, u = 1, { lado = 1 } = {}) { const e = _suave(u); k.head.rotation.z += lado * .82 * e; k.head.rotation.x += .05 * e; k.head.position.x = lado * -.05 * e; k.body.rotation.z += -lado * .03 * e; return e }
// caerAtras(k, t, u): da un paso atrás (u 0→.3) y cae de espaldas TIESO (u .3→1, acelerando); queda acostado. Devuelve cuánto cayó (0..1).
function caerAtras(k, t, u = 1) { const s = k.body.scale.y; quieto(k, t); const p = _suave(u / .3), f = cl((u - .3) / .7), a = f * f * Math.PI / 2, paso = .38 * s * p;
  if (f <= 0) { k.legR.rotation.x = .4 * Math.sin(p * Math.PI); k.body.position.z -= paso; cadera(k, (k.encorvado || 0) - .08 * p) }
  else { cuerpoQ(k, _q3.setFromAxisAngle(_ax.set(1, 0, 0), -a - .08 * (1 - f)), [0, 0, -.22], [0, 0, -paso - .22 * s]); k.legL.rotation.set(0, 0, 0); k.legR.rotation.set(0, 0, 0); k.head.rotation.set(0, 0, 0) }
  k.armL.rotation.set(0, 0, -AB(k)); k.armR.rotation.set(0, 0, AB(k)); return f }
// gestos LINEALES (dur = 0,4 s), se quedan en la pose; `fin`: tiempo en que vuelve. tipos: senala, cubre, brazos, alza, abraza, tira, grita, agita, manosCabeza
const GESTOS = {
  senala: { R: [-1.5, 0] }, alza: { R: [-3.0, .1] }, para: { R: [-1.6, -.2], hx: -.06 },
  cubre: { L: [-2.2, .62], R: [-2.2, -.62], hx: .16, lean: .1 }, brazos: { L: [0, -.94], R: [0, .94], hx: -.06, lean: -.07 }, abraza: { L: [-1.2, .42], R: [-1.2, -.42] },
  tira: { L: [-1.25, .14], R: [-1.25, -.14], lean: -.3, hx: .12 }, grita: { L: [-2.0, -.14], R: [-2.0, .14], lean: .26, hx: -.2 },
  agita: { R: [-1.6, .1] }, manosCabeza: { L: [-2.7, .9], R: [-2.7, -.9], hx: .1 } };
function gesto(k, t, t0, tipo, { dur = .4, fin = null, mano = "R", alto = 0 } = {}) { const G = GESTOS[tipo]; if (!G) return 0; let u = P(t, t0, t0 + dur); if (fin != null) u *= 1 - P(t, fin, fin + dur); if (u <= 0) return 0;
  const esp = mano === "L" && !G.L, ap = (a, [x, z], sg) => { a.rotation.x = lerp(a.rotation.x, x, u); a.rotation.z = lerp(a.rotation.z, z * sg, u) };
  if (G.L) ap(k.armL, G.L, 1); if (G.R) { const [x, z] = G.R, xx = tipo === "senala" ? x - alto : x; esp ? ap(k.armL, [xx, z], -1) : ap(k.armR, [xx, z], 1) }
  if (G.lean) cadera(k, lerp(k.body.rotation.x, k.body.rotation.x + G.lean, u));
  if (G.hx) k.head.rotation.x += G.hx * u;
  if (u >= 1 && tipo === "agita") { const q = ((t - t0 - dur) / (16 * F30)) % 1, tri = q < .5 ? q * 4 - 1 : 3 - q * 4, a = esp ? k.armL : k.armR; a.rotation.x = -1.6 + tri * .38 }
  return u }
// caída: el cuerpo tieso vuelca en 16 cuadros (dir = 1 de cara, −1 de espaldas) y queda acostado
function caer(k, t, t0, { dir = -1, dur = 16 * F30 } = {}) { const u = P(t, t0, t0 + dur); if (u <= 0) return 0; const a = u * u * Math.PI / 2, s = k.body.scale.y; k.body.rotation.x = dir * a; k.body.position.y = Math.sin(a) * .3 * s; k.body.position.z = -dir * Math.sin(a) * .3 * s; k.head.rotation.set(0, 0, 0); return u }
// salto: se agacha 8 cuadros, salta tieso y cae (14 cuadros en el aire); devuelve la altura
function saltar(k, t, t0, { alto = .9, aire = 14 * F30 } = {}) { const ta = 8 * F30, s = k.body.scale.y; if (t <= t0 || t >= t0 + ta + aire) return 0;
  if (t < t0 + ta) { const c = (t - t0) / ta; cadera(k, .5 * c, -.42 * c); k.armL.rotation.x = .5 * c; k.armR.rotation.x = .5 * c; k.head.rotation.x -= .3 * c; return 0 }
  const v = (t - t0 - ta) / aire, y = alto * 4 * v * (1 - v) * s; k.body.position.y += y; k.armL.rotation.z = -A_BRAZO - .25; k.armR.rotation.z = A_BRAZO + .25; return y }
// taparOidos(k, t, u, { cara }): se tapa las orejas con las manos, encogido, tiembla (genérico de miedo)
function taparOidos(k, t, u = 1, { cara = "terror" } = {}) { const e = _suave(u), tr = .035 * Math.sin(t * 31 + (k.idx || 0)) * e; quieto(k, t);
  cadera(k, (k.encorvado || 0) + .1 * e); k.head.rotation.x += .08 * e; k.head.rotation.z = tr * .5;
  for (const [a, sg] of [[k.armL, -1], [k.armR, 1]]) { a.rotation.set(lerp(a.rotation.x, -2.98, e) + tr, 0, sg * lerp(AB(k), -.21, e)); a.position.y = k._p0.armY - .22 * e }
  if (cara && u > .3) setFace(k, cara); parpadeo(k, t) }

// ================= LAS ACCIONES DE ESTA HISTORIA =================
// taparBoca(a, b, u, { colocar, cara }): A, parado delante de B y corrido a la derecha de B (su hombro derecho justo frente a la cara de B),
// le pone la mano derecha en la boca (el brazo derecho estirado hacia la cara, la mano tapa boca y mentón, los ojos de B quedan a la vista)
// y le agarra el hombro con la izquierda; la cabeza de A gira hacia B. B se echa para atrás, se agarra del brazo de A con las dos manos y pone
// cara «tapada». u 0→1 desde quietos. colocar = true: pone a A (B tiene que estar puesto antes); si no, la escena pone a A en ese lugar.
// Cámara que se lee bien: del lado izquierdo de B, a 45° (se ven la cara de B de tres cuartos y A de perfil).
function taparBoca(a, b, u = 1, { colocar = true, cara = "tapada" } = {}) { const e = _suave(u), t = a._t ?? 0, sa = _sc(a), sb = _sc(b);
  quieto(b, t); cadera(b, -.08 * e); b.head.rotation.x = -.12 * e; b.head.rotation.z = .02 * Math.sin(t * 29) * e; b.body.rotation.z += .012 * Math.sin(t * 23) * e;
  b.g.updateMatrixWorld(true); const xB = new THREE.Vector3(1, 0, 0).transformDirection(b.g.matrixWorld), zB = new THREE.Vector3(0, 0, 1).transformDirection(b.g.matrixWorld);
  const T = bocaW(b, .06).add(new THREE.Vector3(0, -.2 * sb, 0));   // donde termina la mano: sobre la boca, un poco abajo (los ojos quedan libres)
  if (colocar) { const R = (a._p0.armL - .1) * sa, dy = a._p0.armY * sa + b.g.position.y - T.y, hz = Math.sqrt(Math.max(.01, R * R - dy * dy));
    const S = T.clone().addScaledVector(zB, hz); a.g.visible = true; a.g.position.set(S.x, b.g.position.y, S.z).addScaledVector(xB, a._p0.armX * sa); a.g.rotation.set(0, b.g.rotation.y + Math.PI, 0) }
  quieto(a, t); cadera(a, .03 * e); a.head.rotation.set(.12 * e, .6 * e, 0);
  apuntar(a, a.armR, gW(a, (a._p0.armX + .15) * sa, 0, .1 * sa).lerp(T, e));
  apuntar(a, a.armL, gW(a, -(a._p0.armX + .15) * sa, 0, 0).lerp(bW(b, -.42, _hombro(b) - .05, .1), e));
  // B se agarra del antebrazo de A, por debajo
  a.g.updateMatrixWorld(true); const brazo = a.handR.getWorldPosition(new THREE.Vector3()).addScaledVector(zB, .3 * sb).add(new THREE.Vector3(0, -.2 * sb, 0));
  for (const [arm, sx] of [[b.armL, -1], [b.armR, 1]]) apuntar(b, arm, gW(b, sx * b._p0.armX * sb, .2 * sb, 0).lerp(brazo.clone().addScaledVector(xB, sx * .1 * sb), e));
  if (cara && u > .3) setFace(b, cara); parpadeo(a, t) }
// hablarManos(k, t, { vel }): lengua de señas: los dos brazos adelante cambian de seña cada ≈ .45 s (alto, apertura y giro de cada mano, sin cruzarse),
// golpecitos en cada seña, la cabeza acompaña. Cada seña = [[x izq, z izq, giro izq], [x der, z der, giro der]] (rotaciones del hombro, z + = hacia adentro).
const EL_SENAS = [[[-1.3, .1, .4], [-1.65, .15, -.6]], [[-1.75, .22, 0], [-1.75, .22, 0]], [[-1.05, .02, 1.1], [-1.95, .28, -.3]], [[-1.55, .3, -.5], [-1.2, .05, .8]],
  [[-1.95, .12, .3], [-1.4, .32, 1.2]], [[-1.25, -.12, -.9], [-1.5, -.1, .9]], [[-2.1, .26, .6], [-1.15, .1, -.2]], [[-1.45, .3, 1.4], [-1.85, .05, -1.4]]];
function hablarManos(k, t, { vel = 1 } = {}) { quieto(k, t); const q = t * vel / .45 + _fase(k), i = Math.floor(q), f = q - i, n = EL_SENAS.length, ex = k.encorvado || 0;
  const A = EL_SENAS[((i % n) + n) % n], B = EL_SENAS[(((i + 1) % n) + n) % n], m = _suave((f - .6) / .4), tap = .07 * Math.max(0, Math.sin(f * Math.PI * 4)) * (1 - m);
  cadera(k, ex + .04); k.head.rotation.x = -ex * .6 + .04 + .05 * Math.sin(q * Math.PI); k.head.rotation.y = .1 * Math.sin(q * .9); k.head.rotation.z = .05 * Math.sin(q * 1.3);
  [[k.armL, 0, -1], [k.armR, 1, 1]].forEach(([arm, j, sg]) => { const a = A[j], b = B[j]; arm.rotation.set(lerp(a[0], b[0], m) + ex * .5 + (j ? -tap : tap * .6), lerp(a[2], b[2], m), -sg * lerp(a[1], b[1], m)) });
  parpadeo(k, t) }
// coser(k, t, { punto, tela }): cose con aguja e hilo rojo, sin ruido: la mano izquierda sostiene la tela, la derecha tira el hilo en lazos largos
// (entra, tira para arriba y afuera, vuelve). punto = Vector3 del mundo donde cose (la mano izquierda va al lado); tela = retazo en la mano izquierda.
function coser(k, t, { punto = null, tela = true } = {}) { quieto(k, t); const s = _sc(k), Y = _hombro(k), c = (t * .7 + _fase(k) * .1) % 1; cadera(k, (k.encorvado || 0) + .14); k.head.rotation.x = .42 - (k.encorvado || 0) * .5;
  const PT = punto ? punto.clone() : gW(k, -.3 * s, (Y - .62) * s, .72 * s); apuntar(k, k.armL, PT.clone().add(gW(k, -.12 * s, -.02 * s, 0).sub(gW(k, 0, 0, 0))));
  const tira = c < .2 ? 0 : c < .7 ? _suave((c - .2) / .5) : 1 - _suave((c - .7) / .3), arco = Math.sin(tira * Math.PI);
  apuntar(k, k.armR, PT.clone().add(gW(k, (.5 + .4 * tira) * s, (.05 + .5 * tira + .15 * arco) * s, (.02 - .15 * tira) * s).sub(gW(k, 0, 0, 0))));
  k.g.updateMatrixWorld(true); if (tela && !punto) { enMano(EL_RETAZO, k, "L", { off: [0, -.2, .05] }); EL_RETAZO.rotation.set(-.3, 0, 0); EL_RETAZO.scale.setScalar(1.5) }
  enMano(EL_AGUJA, k, "R", { off: [0, -.17, .08] }); EL_AGUJA.rotation.set(.4, 0, 0); EL_AGUJA.scale.setScalar(2); k.g.updateMatrixWorld(true);
  const ojo = EL_AGUJA.localToWorld(new THREE.Vector3(0, 0, -.075)), dest = punto ? PT : EL_RETAZO.getWorldPosition(new THREE.Vector3()); estirarEl(EL_HILO, ojo, dest); parpadeo(k, t) }
// cortarTijera(k, t, { a, sobre, vel }): las tijeras grandes en la mano derecha abriendo y cerrando, apuntando a `a` (Vector3 del mundo; por defecto
// adelante y arriba). sobre = true: no toca el resto del cuerpo (llamarla DESPUÉS de trepar para cortar colgado). Devuelve la punta de las hojas (mundo).
function cortarTijera(k, t, { a = null, sobre = false, vel = 1 } = {}) { const s = _sc(k), Y = _hombro(k); if (!sobre) { quieto(k, t); cadera(k, (k.encorvado || 0) + .06) }
  apuntar(k, k.armR, a ? a.clone() : gW(k, .2 * s, (Y + .35) * s, 1.3 * s)); if (k.tijeraC) k.tijeraC.visible = false;
  enMano(EL_TIJERA, k, "R", { off: [0, -.02, .02] }); EL_TIJERA.rotation.set(Math.PI / 2, 0, 0); EL_TIJERA.position.y -= .2; const ab = .1 + .55 * (.5 + .5 * Math.sin(t * vel * Math.PI * 2 * 1.4)); EL_TIJERA.userData.abrir(ab);
  if (!sobre) { k.head.rotation.x = -.15; apuntar(k, k.armL, gW(k, -.2 * s, (Y - .3) * s, .7 * s)) } k.g.updateMatrixWorld(true); return EL_TIJERA.localToWorld(new THREE.Vector3(0, 0, .5)) }
// trepar(k, t, { h, vel }): trepa la tela de abrigos: la cara a +z, pegado a la pared (≈ .45·s adelante); brazos que se alternan arriba
// agarrando, piernas que empujan, el cuerpo se balancea. h = cuánto subió (se suma al body).
function trepar(k, t, { h = 0, vel = 1 } = {}) { const c = t * vel * 1.1 + _fase(k) * .1, sw = Math.sin(c * Math.PI * 2), s = k.body.scale.y; k._t = t;
  k.body.rotation.set(.12, 0, sw * .06); k.body.position.set(0, h + .12 * s * (1 - Math.cos(c * Math.PI * 4)) * .5, .02 * s);
  k.armL.rotation.set(-2.55 - .5 * sw, 0, .12 + .1 * Math.max(0, sw)); k.armR.rotation.set(-2.55 + .5 * sw, 0, -.12 - .1 * Math.max(0, -sw));
  k.legL.rotation.set(-.1 - .7 * Math.max(0, -sw), 0, -.08); k.legR.rotation.set(-.1 - .7 * Math.max(0, sw), 0, .08); k.head.rotation.set(-.35, .12 * sw, 0); parpadeo(k, t) }
// levantarAbrigo(k, u, { tipo }): el abrigo está tirado ≈ .9·s adelante; se agacha (u 0→.45), lo agarra y se endereza con el abrigo contra el pecho (u .45→1).
// El abrigo tirado/levantado es el de abrigoProp(tipo) (el mismo que abrigoEnPiso).
function levantarAbrigo(k, u = 1, { tipo = "rojo" } = {}) { const t = k._t ?? 0, s = _sc(k), Y = _hombro(k), e1 = _suave(u / .45), e2 = _suave((u - .45) / .55); quieto(k, t);
  const lean = 1.25 * (u < .45 ? e1 : 1 - e2), psi = .45 * (u < .45 ? e1 : 1 - e2); cadera(k, lean, psi); k.head.rotation.x = .25 - lean * .35;
  const piso = gW(k, 0, .05, .95 * s), pecho = (sx) => bW(k, sx * .16, Y - .3, k._forma.torso[2] / 2 + .45);
  for (const [arm, sx] of [[k.armL, -1], [k.armR, 1]]) { const abajo = piso.clone().add(gW(k, sx * .2 * s, 0, 0).sub(gW(k, 0, 0, 0))), rest = gW(k, sx * (k._p0.armX + .2) * s, .3 * s, .1 * s);
    apuntar(k, arm, u < .45 ? rest.lerp(abajo, e1) : abajo.lerp(pecho(sx), e2)) }
  const A = abrigoProp(tipo); k.g.updateMatrixWorld(true); const ry = k.g.rotation.y;
  if (u < .45) abrigoEnPiso(tipo, gW(k, 0, 0, .55 * s), ry);
  else { const m = k.handL.getWorldPosition(new THREE.Vector3()).add(k.handR.getWorldPosition(new THREE.Vector3())).multiplyScalar(.5), q = _suave(e2 / .5); enMundo(A, m, ry, lerp(-Math.PI / 2 + .3, 0, q)); A.scale.set(1, lerp(.8, 1, q), lerp(.55, 1, q)) }
  parpadeo(k, t); return A }
// toser(k, t, { cara }): tose con el puño en la boca: sacudones hacia adelante cada ≈ .8 s, la otra mano en el pecho
function toser(k, t, { cara = "tos" } = {}) { quieto(k, t); const s = _sc(k), Y = _hombro(k), p = Math.pow(Math.max(0, Math.sin(t * Math.PI * 2 / .8)), 6);
  cadera(k, (k.encorvado || 0) + .1 + .22 * p); k.head.rotation.x = .08 + .22 * p; k.body.position.y -= .03 * p * s;
  apuntar(k, k.armR, bocaW(k, .2).add(new THREE.Vector3(0, -.16 * s, 0)).add(gW(k, .12 * s, 0, 0).sub(gW(k, 0, 0, 0)))); apuntar(k, k.armL, bW(k, .05, Y - .62, k._forma.torso[2] / 2 + .25)); if (cara) setFace(k, cara); parpadeo(k, t) }
// llorarMudo(k, t, { cara }): llora sin ruido: cabeza gacha, hombros que tiemblan, una mano en la boca y la otra en la cintura; lágrimas 3D que caen
function llorarMudo(k, t, { cara = "llora" } = {}) { quieto(k, t); const s = _sc(k), Y = _hombro(k), j = Math.sin(t * 19 + (k.idx || 0)) * .5 + Math.sin(t * 7.3) * .5;
  cadera(k, (k.encorvado || 0) + .12); k.head.rotation.x = .32 - (k.encorvado || 0) * .4 + .03 * j; k.body.rotation.z += .015 * j; k.armL.position.y = k._p0.armY + .02 * j; k.armR.position.y = k._p0.armY - .02 * j;
  apuntar(k, k.armR, bocaW(k, .2).add(new THREE.Vector3(0, -.15 * s, 0))); apuntar(k, k.armL, bW(k, .2, Y - .75, k._forma.torso[2] / 2 + .2));
  if (cara) setFace(k, cara); lagrimas(k, t) }
// asentir(k, t, { vel, fuerza }): asiente con la cabeza («sí» sin decirlo)
function asentir(k, t, { vel = 1, fuerza = 1 } = {}) { quieto(k, t); const n = Math.max(0, Math.sin(t * vel * Math.PI * 2 * .9)); k.head.rotation.x += .06 + fuerza * .3 * n; k.body.position.y -= .01 * n * _sc(k); parpadeo(k, t) }
// empujarRopero(k, u, { pasos }): empuja con las dos manos estiradas (la cara de atrás del ropero a ≈ .95·s adelante del k.g), muy inclinado,
// pasitos cortos (pasos = cuántos pasos en todo u). La escena corre k.g y el ropero juntos.
function empujarRopero(k, u = 1, { pasos = 3 } = {}) { const t = k._t ?? 0, s = _sc(k), Y = _hombro(k), f = u * pasos * Math.PI * 2, sw = Math.sin(f); quieto(k, t);
  cadera(k, .5 + .03 * Math.sin(f * 2), .12); k.legL.rotation.x += .32 * sw + .1; k.legR.rotation.x += -.32 * sw + .1; k.body.position.y -= .03 * s * Math.abs(sw);
  for (const [arm, sx] of [[k.armL, -1], [k.armR, 1]]) apuntar(k, arm, bW(k, sx * .3, Y + .6, 1.3)); k.head.rotation.x = -.35; parpadeo(k, t) }
// tocarCampana(k, t, { periodo, cuerda, alto }): tira de la cuerda de la campana con las dos manos (una arriba de la otra): baja de golpe (agachándose)
// y deja que la cuerda lo levante. Dibuja la cuerda (de .7 m debajo de las manos hasta `alto` m arriba). Devuelve el tirón 0..1 (1 = abajo del todo).
function tocarCampana(k, t, { periodo = 2.4, cuerda = true, alto = 8 } = {}) { quieto(k, t); const s = _sc(k), Y = _hombro(k), c = ((t / periodo) % 1 + 1) % 1, p = c < .35 ? _suave(c / .35) : 1 - _suave((c - .35) / .65);
  cadera(k, .12 * p, -.18 * p); const hy = lerp(Y + .95, Y + .05, p); apuntar(k, k.armR, gW(k, .02 * s, (hy + .2) * s, .55 * s)); apuntar(k, k.armL, gW(k, -.02 * s, (hy - .05) * s, .57 * s));
  k.head.rotation.x = -.45 + .3 * p; k.g.updateMatrixWorld(true);
  if (cuerda) { const a = k.handR.getWorldPosition(new THREE.Vector3()), b = k.handL.getWorldPosition(new THREE.Vector3()), m = a.clone().lerp(b, .5); estirarEl(EL_CUERDA, m.clone().add(new THREE.Vector3(0, alto, 0)), m.clone().add(new THREE.Vector3(.03 * Math.sin(t * 3), -.7 * s, 0))) }
  parpadeo(k, t); return p }
// colgarAbrigo(k, u, { tipo, gancho }): levanta el abrigo (desplegado, colgando de la mano derecha) hasta el gancho y lo deja; desde u = .75 queda
// colgado (abrigoColgado) y el brazo baja. gancho = Vector3 del mundo (por defecto, adelante y arriba al alcance de la mano).
function colgarAbrigo(k, u = 1, { tipo = "tib", gancho = null } = {}) { const t = k._t ?? 0, s = _sc(k), Y = _hombro(k); quieto(k, t);
  const G = gancho ? gancho.clone() : gW(k, .3 * s, (Y + .72) * s, .42 * s), rest = gW(k, (k._p0.armX + .25) * s, .2 * s, .25 * s), a = _suave(u / .6), b = _suave((u - .75) / .25);
  apuntar(k, k.armR, u < .75 ? rest.clone().lerp(G, a) : G.clone().lerp(rest, b)); k.head.rotation.x = -.35 * (u < .75 ? a : 1 - b); cadera(k, -.05 * a);
  k.g.updateMatrixWorld(true);
  if (u < .75) { const A = abrigoProp(tipo, "mano"), hm = k.handR.getWorldPosition(new THREE.Vector3()); enMundo(A, hm.lerp(G, _suave((u - .5) / .25)), k.g.rotation.y); A.scale.setScalar(1) }
  else abrigoColgado(tipo, G, k.g.rotation.y);
  parpadeo(k, t) }
// lista(k, on, { leer }): el papel con los nombres en las dos manos, delante del pecho; leer = cabeza gacha leyendo (el texto mira al personaje:
// se lee por encima del hombro; de frente se ve el dorso).
function lista(k, on = true, { leer = true } = {}) { if (!on) return null; const s = _sc(k), Y = _hombro(k), td = k._forma.torso[2];
  if (EL_LISTA.parent !== k.body) k.body.add(EL_LISTA); EL_LISTA.visible = true; EL_LISTA.position.set(0, Y - .3, td / 2 + .5); EL_LISTA.rotation.set(-2.6, 0, Math.PI); EL_LISTA.scale.setScalar(1);
  for (const [arm, sx] of [[k.armL, -1], [k.armR, 1]]) apuntar(k, arm, bW(k, sx * .3, Y - .62, td / 2 + .4)); if (leer) { k.head.rotation.x = .42; k.head.rotation.y = 0 } return EL_LISTA }
// saludarBuenasNoches(k, t, { hablar }): Tib dice «goodnight»: la mano derecha saluda chiquito a la altura de la cara, cabeza ladeada,
// la boca alterna «habla» / «warm» (hablar = false: no toca la cara)
function saludarBuenasNoches(k, t, { hablar = true } = {}) { quieto(k, t); const w = Math.sin(t * Math.PI * 2 * 2.2);
  k.armR.rotation.set(-2.35, 0, .35 + .28 * w); k.head.rotation.z = .14 + .03 * w; k.head.rotation.x = .05; k.body.rotation.z = -.02 * w;
  if (hablar) setFace(k, Math.floor(t / .38) % 2 ? "warm" : "habla"); parpadeo(k, t) }
// escuchar(k, t): la oreja contra la puerta (la puerta es un plano ≈ .5·s adelante del k.g): inclinado, la cabeza girada de costado,
// las dos manos apoyadas en la puerta arriba; respira cortito
function escuchar(k, t) { quieto(k, t); const s = _sc(k), Y = _hombro(k), r = .01 * Math.sin(t * 4.2);
  cadera(k, .2 + r); k.head.rotation.set(.05, 1.25, .12); k.head.position.x = -.08;
  for (const [arm, sx] of [[k.armL, -1], [k.armR, 1]]) apuntar(k, arm, gW(k, sx * (k._p0.armX + .45) * s, (Y + .55) * s, .55 * s)); parpadeo(k, t) }
// asustado(k, t, { u, cara }): encogido de miedo: hombros arriba, las manos juntas en el pecho/mentón, un paso atrás, tiembla
function asustado(k, t, { u = 1, cara = "terror" } = {}) { quieto(k, t); const e = _suave(u), s = _sc(k), Y = _hombro(k), j = .02 * Math.sin(t * 33 + (k.idx || 0)) * e;
  cadera(k, (k.encorvado || 0) + .1 * e); k.legL.rotation.x += -.25 * e; k.legR.rotation.x += .15 * e; k.head.rotation.x += .1 * e; k.head.rotation.z = j;
  k.armL.position.y = k.armR.position.y = k._p0.armY + .06 * e; for (const [arm, sx] of [[k.armL, -1], [k.armR, 1]]) apuntar(k, arm, gW(k, (sx * k._p0.armX * (1 - e) + sx * .12 * e + j) * s, lerp(0, Y + .1, e) * s, .55 * e * s));
  if (cara && u > .25) setFace(k, cara); parpadeo(k, t) }
// salirVentana(k, u, { alto, fondo }): sale por la ventana de atrás. El alféizar está a `alto` m del piso y `fondo` m adelante (mundo, sin escala).
// u 0→.3 sube la pierna derecha al alféizar con las manos apoyadas · .3→.6 se sube agachado · .6→1 pasa y cae del otro lado (parado, ≈ 1,5·s adelante).
function salirVentana(k, u = 1, { alto = 1, fondo = .55 } = {}) { const t = k._t ?? 0, s = _sc(k), Y = _hombro(k), pl = HC(k); quieto(k, t);
  const a = _suave(u / .3), b = _suave((u - .3) / .3), c = _suave((u - .6) / .4);
  if (u < .3) { cadera(k, .25 * a); k.legR.rotation.x = -1.45 * a; k.body.position.y += .05 * a * s;
    for (const [arm, sx] of [[k.armL, -1], [k.armR, 1]]) apuntar(k, arm, gW(k, sx * (k._p0.armX + .2 * a) * s, lerp(.3 * s, alto, a), lerp(.1 * s, fondo, a))) }
  else if (u < .6) { const y0 = alto - .64 * pl * s, z0 = fondo - .6 * pl * s; cadera(k, lerp(.25, .7, b)); k.legL.rotation.x += lerp(0, -1.3, b); k.legR.rotation.x += lerp(-1.45, -1.3, b);
    k.body.position.y += lerp(.05 * s, y0, b); k.body.position.z += lerp(0, z0, b); for (const [arm, sx] of [[k.armL, -1], [k.armR, 1]]) apuntar(k, arm, gW(k, sx * (k._p0.armX + .2) * s, alto, fondo + .05)) }
  else { const y0 = alto - .64 * pl * s, z0 = fondo - .6 * pl * s, zF = fondo + .9 * s; cadera(k, lerp(.7, 0, c)); k.legL.rotation.x += lerp(-1.3, 0, c); k.legR.rotation.x += lerp(-1.3, 0, c);
    k.body.position.y += lerp(y0, 0, c) + .25 * s * Math.sin(Math.PI * c); k.body.position.z += lerp(z0, zF, c);
    k.armL.rotation.set(-1.4 * (1 - c) - .3, 0, -AB(k) - .5 * Math.sin(Math.PI * c)); k.armR.rotation.set(-1.4 * (1 - c) - .3, 0, AB(k) + .5 * Math.sin(Math.PI * c)) }
  k.head.rotation.x = u < .6 ? .2 : .1; parpadeo(k, t) }
