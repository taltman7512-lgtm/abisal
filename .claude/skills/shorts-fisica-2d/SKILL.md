---
name: shorts-fisica-2d
description: Hace shorts animados verticales en el formato que es tendencia en YouTube Shorts (nov 2026) — caricatura 2D plana con física, sin narración, un personaje tierno que se multiplica y un villano que escala sus intentos, con título y contador arriba. Usar cuando la persona pida «un short de física», «como el de Momo y Brik», «el formato de las bolitas», «Can X … Y?», o un video nuevo con el motor de `shorts-fisica/`. Trae el análisis de la tendencia, las reglas de guion, el motor (canvas 2D + física propia + audio sintetizado) y el paso a paso hasta el MP4.
---

# Shorts de física 2D («Can X … Y?»)

Formato de short **sin voz**: todo se cuenta con acción, caras y un contador. Se programa entero (canvas 2D en
Chromium + física propia + audio sintetizado en Python); no usa Blender, Remotion, IA de video ni assets bajados.
El primer video hecho con esto es **«Can Brik POP Momo?»** (30 s, 1080x1920, 60 fps), en `shorts-fisica/`.

Habla con la persona en español sencillo. Los textos **dentro** del video van en inglés (el formato es mundial y
casi no tiene texto), salvo que pida otra cosa.

## 0. Dónde está todo

- Proyecto y motor: carpeta `shorts-fisica/` del repo `taltman7512-lgtm/abisal` (si no está en la rama actual:
  `git fetch origin claude/youtube-shorts-animation-trend-652m8k` y copiá la carpeta). Si esta skill vino como
  archivo `.skill`, la misma carpeta viene adentro como `plantilla/`.
- Abrí **solo** el archivo que vayas a tocar. Mapa:

| Archivo | Qué es | ¿Se toca en un video nuevo? |
|---|---|---|
| `motor/base.js` | constantes, azar con semilla, curvas, llaves | no |
| `motor/fisica.js` | `M.World`: bolitas blandas, pila de cientos | casi nunca |
| `motor/dibujo.js` | formas, **Momo**, **Brik**, herramientas, partículas, cartel de arriba | sí: herramientas y caras nuevas |
| `motor/fondo.js` | patio soleado en capas con paralaje + atardecer | sí, si cambia el lugar |
| `videos/<nombre>/escena.js` | **el video**: lista de cues sobre la simulación | sí: es lo que se escribe |
| `audio/hacer_audio.py` | música + efectos sintetizados desde `out/eventos.json` | sí: niveles por tramo y efectos nuevos |
| `index.html` | vista previa (abrir en Chrome; `?f=600` salta a un cuadro; `?video=<nombre>`) | no |
| `render.mjs` | render sin pantalla → ffmpeg | no |
| `RENDERIZAR.bat` / `renderizar.sh` | render completo con un doble clic | cambiar el nombre del video |

## 1. Qué es la tendencia (medido el 23 nov 2026)

Se buscó en YouTube lo más visto del último mes en animación corta (13 búsquedas, ~500 videos). Sacando canciones
infantiles y video hecho con IA, lo que más crece es **SEEDPIT Official** (@seedpit): un short por día desde hace
pocos meses; de sus 80 shorts más recientes, **17 pasan de 10 M de vistas**, la mediana es 3 M y el mayor tiene 75 M.

Qué se pudo estudiar y qué no: se analizaron títulos, vistas y **24 cuadros** (miniatura vertical + 3 cuadros
intermedios de 6 shorts). YouTube bloquea la descarga de video desde la nube, así que **el audio y el ritmo exacto
de cortes no se midieron**: lo de sonido de esta skill es una decisión propia, no una copia medida. Si en la PC de
la persona se pueden bajar las referencias (`yt-dlp`), medí eso antes de cambiar las reglas de audio.

Lo que se ve en esos cuadros:
- **2D plano tipo vector**, no 3D: contorno oscuro grueso y parejo, degradé suave, un brillo arriba a la izquierda.
- **Dos personajes que son formas simples**: uno claro, redondo e inocente (ojos de punto con brillo, boca
  mínima) y uno oscuro con un aro de color que brilla (el villano). Sin brazos ni piernas: las herramientas flotan.
- **Fondo acogedor en capas**: cielo en degradé con sol y nubes, casitas y árboles, cerca, pasto con flores y
  hojas oscuras desenfocadas en primer plano. De día, de noche con lluvia o interior cálido según la historia.
- **Cartel fijo arriba**: una línea chica blanca + una línea grande de color («Can Kevin / CUT Seed?») y debajo un
  **contador con el ícono del personaje**. Es lo único escrito y funciona como marcador del juego.
- **La física es el chiste**: el personaje tierno se multiplica y la pantalla termina llena de él.
- Duración: 35–55 s los que más rinden; 16–50 s en general.

Títulos que más rinden en ese canal (mediana de vistas del grupo):

| Patrón | Ejemplo | Mediana |
|---|---|---|
| «NO … ALLOWED en el lugar de X» | NO SEEDS ALLOWED at Kevin's PARTY (30 M) | 11,6 M |
| «Can X VERBO Y?» | Can Kevin CUT Seed? every cut makes MORE (37 M) | 5,1 M |
| Historia en partes | Seed MOVED OUT · PART 1 (75 M) / 2 / 3 | 3,5 M |
| El resto | — | 2,0 M |

Verbo físico y simple en MAYÚSCULAS + un emoji. La coletilla «every X is BIGGER / makes MORE» promete la escalada.

**Qué se copia y qué no.** Se copia el *formato* (2D plano, física, sin voz, cartel con contador, escalada,
remate). **Nunca** sus personajes, nombres, fondos, chistes ni títulos: los nuestros son **Momo** (bolita de
mochi rosa con rulito) y **Brik** (bloque violeta gruñón con aro naranja, cejas gruesas y una curita). No nombres
al canal de referencia en títulos ni descripciones.

## 2. Guion: la fórmula

Un video = **una pregunta + una regla física + una escalada + un remate que da vuelta la pregunta**.

1. **Pregunta** (título y cartel): «Can Brik VERBO Momo?». El verbo es una acción física que un nene entiende sin
   leer: pop, squash, wash, freeze, vacuum, launch, bury, sink, blow away.
2. **Regla**: lo que le pasa a Momo cada vez, siempre igual y siempre a favor de Momo. En «POP»: cada pinchazo
   la divide en más. Otras: cada golpe la hace más grande, cada intento la hace rebotar más alto, cada capa
   esconde otra. La regla se entiende en el primer intento, sin texto.
3. **Escalada en 4 intentos**, cada herramienta más grande y más ridícula que la anterior (alfiler → tenedor
   gigante → rodillo con púas → «MEGA POP 9000» colgado de una cadena). El contador salta cada vez más:
   1 → 2 → 8 → 32 → 160. Entre intento e intento, **una reacción** de Brik (confundido → enojado → furioso →
   maníaco) y una de las Momos (se ríen).
4. **Clímax**: la pantalla se llena. Cambia la luz (día → atardecer dorado).
5. **Respiro tierno** de 1–2 s (una Momo le da un besito a Brik) para que el remate pegue.
6. **Remate**: algo sembrado al principio vuelve y le aplica la regla al villano (el alfiler que tiró al cielo en
   el segundo 5 cae en el 27 y revienta a Brik: ahora hay dos). El cartel cambia a «Can Momo POP Brik?» con el
   contador en 2. Termina ≤1 s después de la última reacción, para que empalme en bucle.

Tiempos de «Can Brik POP Momo?» (usalos de molde; 30–45 s en total):

| s | Qué pasa | Contador |
|---|---|---|
| 0–3 | **Gancho**: Momo salta feliz; Brik entra de puntitas con el alfiler. La amenaza se ve en el cuadro 0 | 1 |
| 3,05 | primer POP (silencio de medio segundo antes) | 2 |
| 3–6,4 | «?» de Brik, risitas; tira el alfiler al cielo (siembra del remate) | 2 |
| 6,4–9 | tenedor gigante: 3 pinchazos seguidos | 4, 6, 8 |
| 9–11,3 | berrinche (se pone rojo, zapatea, sale) | 8 |
| 11,3–15 | rodillo con púas cruza toda la pantalla | 32 |
| 15–18,7 | vuelve, se espanta; baja la bola gigante; aprieta el botón | 32 |
| 18,75 | **MEGA POP**: destello, temblor, lluvia de Momos | 160 |
| 21–25 | Brik aterriza arriba de la pila, mareado; besito | 160 |
| 26–27 | silbido: cae el alfiler | — |
| 27–30 | **POP a Brik** → 2 Briks; cambia el cartel; se miran, miran a cámara | 2 |

Reglas de guion:
- **Nada de texto para explicar.** Solo el cartel, onomatopeyas cortas («POP!», «?», «!») y carteles dentro del
  mundo («KEEP OUT», «MEGA POP 9000»). Si una idea necesita una frase para entenderse, cambiá la idea.
- **Un golpe de efecto cada 2–4 s** y ningún tramo de más de 1,5 s sin que cambie algo (un salto, una cara, el
  contador).
- **Sembrar y cobrar**: el remate usa un objeto que el público ya vio y olvidó.
- **El villano nunca gana y nunca lastima**: a Momo no le duele, se ríe. Es apto para todo público.
- Escribí el guion como esa tabla (segundo → acción → contador) en `videos/<nombre>/GUION.md` antes de programar.
  Con la persona ausente o si ya aprobó de antemano, seguí de corrido.

## 3. Estilo visual (lo que hace que se vea «de canal grande»)

- **Lienzo** 1080x1920 a **60 fps** (la física a 60 se ve mucho más suave que a 30).
- **Contorno**: nunca negro puro. Ciruela `#3b1630` en Momo, azul noche `#15102e` en Brik y objetos, gris azulado
  en lo lejano. Grosor ≈ 7,5 % del radio del personaje (mínimo 3,5 px); 5–7 px en objetos; 3–4 px en lo lejano.
- **Volumen con 4 capas baratas** en cada forma: degradé radial con el foco arriba a la izquierda → sombra propia
  (óvalo más oscuro recortado abajo) → brillo blanco chico arriba a la izquierda → **aro claro por fuera** del
  contorno (separa cada bolita dentro de la pila; sin él, 160 bolitas son una mancha).
- **Villano con aro de luz** (`shadowBlur` naranja): es lo que lo hace leerse sobre cualquier fondo.
- **Caras**: ojos óvalo oscuro con un punto de brillo, juntos y un poco abajo del centro; cachetes rosados; boca
  mínima. Emociones por cejas (Brik) y por forma de ojos y boca (Momo). Librería actual — Momo: `smile`, `o`,
  `wow`, `laugh`, `kiss` + parpadeo; Brik: `grin`, `sly`, `angry`, `furious`, `confused`, `shock`, `tired`,
  `dizzy`, `blush`, `manic`. La cara cambia **de golpe** en el cuadro del cue; el cuerpo, con resorte.
- **Aplastar y estirar**: cada bolita tiene un resorte amortiguado (`sq`) que se dispara con el golpe contra el
  piso; al nacer llegan chiquitas y se inflan en ~0,15 s. Eso es el 80 % de la «vida».
- **Fondo en 6 capas con paralaje** (cielo 0,12 · nubes 0,2 · lejos 0,4 · medio 0,75 · pasto 1 · hojas de primer
  plano 1,25 y 1,6 con desenfoque): se pintan una sola vez en lienzos aparte y cada cuadro solo se pegan. Cosas
  vivas encima: nubes que corren, aspas del molino, humo de la chimenea.
- **Luz**: bruma clara sobre lo lejano, sombra de la cerca sobre el pasto, sombra de contacto bajo cada personaje
  (se achica y aclara cuando salta), tinte `soft-light` cálido desde el sol, viñeta suave, y un **segundo cielo
  de atardecer** que se funde durante el clímax (`st.gold` 0→1). Cambiar la luz una vez por video, en el clímax.
- **Paleta**: un par cálido/frío (cielo azul + casa coral; después violeta + naranja) y cada personaje con un
  color que no esté en el fondo (rosa y violeta sobre verde).
- **Detalles de regalo** (2–4 por fondo, no se nombran): molino girando, cartel «KEEP OUT», flores en la ventana,
  la curita de Brik, manzanas en el árbol.
- **Cámara**: fija casi siempre (el público tiene que leer la física). Zoom mínimo de 1,03 para poder temblar sin
  mostrar el borde; empujón a 1,12–1,2 hacia la acción en los momentos de cara; temblor que cambia de signo cada
  cuadro y se apaga solo (`shake(n)`: 13–16 px un pop, 46 px el clímax); destello blanco de 3–5 cuadros solo en
  el primer pop, el clímax y el remate.
- **Cartel**: fuente Baloo 2 ExtraBold (licencia abierta, incrustada). Línea chica 66 px blanca; línea grande
  132 px con degradé (amarillo→naranja el verbo, color del personaje el nombre); contorno azul noche doble para
  dar sombra dura; contador 84 px que «salta» (+35 % de escala, 0,25 s) cada vez que cambia. Queda entre el 6 % y
  el 21 % del alto. Nada importante debajo del 85 % del alto (lo tapa la interfaz de Shorts).

## 4. Paso a paso de un video nuevo

1. **Guion** (sección 2) → `videos/<nombre>/GUION.md`.
2. **Copiá** `videos/pop/` a `videos/<nombre>/` y cambiá `V.name`, `dur` y `frames`.
3. **Herramientas y caras nuevas** en `motor/dibujo.js` (una función por objeto, con la punta o el punto de agarre
   en el origen, como `D.pin` y `D.fork`). Lugar nuevo → copiá `motor/fondo.js` a otro archivo y cargalo desde
   `index.html`.
4. **Escena**: escribí los cues (sección 5).
5. **Fotos de control**: `node render.mjs --video <nombre> --scale 0.5 --fotos 0,180,400,…` (un cuadro por
   golpe de efecto) y `python hoja.py out/hoja.jpg 5 out/foto_*.png`. Mirá **una hoja**, no foto por foto.
6. **Vista previa**: `node render.mjs --video <nombre> --scale 0.5 --salida out/prueba.mp4` (≈1 min en la nube) y
   hojas con ffmpeg: `ffmpeg -i out/prueba.mp4 -vf "fps=1,scale=200:-1,tile=10x3" -frames:v 1 out/rev.jpg`
   (y `fps=4` con `-ss` para el clímax y el remate). Pasá la lista de la sección 7.
7. **Audio**: ajustá `level(t)` (qué suena en cada tramo), los silencios y los efectos nuevos en
   `audio/hacer_audio.py`; `python audio/hacer_audio.py`. Mirá la onda
   (`ffmpeg -i out/audio.wav -filter_complex showwavespic=s=1800x260 -frames:v 1 out/onda.png`): la música tiene
   que verse a lo largo de todo el video y los efectos sobresalir un poco; ningún bloque macizo más alto que el
   resto salvo el clímax.
8. **Render final**: `./renderizar.sh <nombre>` o doble clic en `RENDERIZAR.bat` en la PC (usa la placa con
   `--gpu --nvenc`). Sale `out/<nombre>_final.mp4` a −14 LUFS. En la nube sin placa el render completo tarda
   ~4 min, así que la placa no es imprescindible para este formato.
9. **Verificá el MP4**: `ffprobe` (1080x1920, 60 fps, duración, pista de audio) y una hoja de 1 cuadro por segundo.
10. **Publicación**: título = la pregunta + emoji + coletilla («Can Brik POP Momo? 🎈 every pop makes MORE»);
    descripción de una línea; sin `#shorts` en el título. Uno por día con el mismo formato y los mismos dos
    personajes; juzgá el formato por tandas de 10–20 videos.

## 5. Cómo se escribe una escena

Todo es determinista y **secuencial**: el cuadro 600 solo existe después de simular del 0 al 599 (`M.goto(f)` lo
hace solo). Mismo código → mismo video, en cualquier máquina. Nunca uses `Math.random()` ni la hora: usá
`R = M.rng(semilla)`.

`escena.js` define `M.Video = { name, fps, dur, frames, init(), step(f), draw(c, f) }`:

- **`init()`** crea el mundo (`new M.World({ ground })`), las partículas, el estado `st`, a Brik (`K`) y la lista
  **`cues`**: pares `[segundo, función]` que se disparan una vez en su cuadro. Ahí va toda la historia.
- **`step(f)`** dispara cues, aplica interpolaciones, mueve lo guiado, corre la física y junta eventos de sonido.
- **`draw(c, f)`** dibuja en orden: fondo → sombras → partículas de atrás → Brik → bolitas (ordenadas por altura:
  las de abajo quedan adelante) → mano y herramienta → partículas de adelante → primer plano y luz → destello →
  cartel.

Ayudas dentro de la escena:

| Ayuda | Para qué |
|---|---|
| `tw(obj, 'prop', dur, valor, curva)` | interpolar cualquier número (cámara, `st.th`, `st.gold`, `K.red`). Curvas: `ss` suave, `out` frena, `inn` cae, `back` se pasa, `lin` |
| `move(x, dur, altoSalto, nSaltos)` | Brik se desplaza a saltitos (suena y se aplasta en cada apoyo) |
| `pop(bolita, n, radio, {sp, spread, lean, vx, vy, lite})` | revienta una y salen `n`; `lite: true` cuando revientan muchas a la vez |
| `nearest(x, y, filtro)` | la bolita más cercana a un punto |
| `mood('laugh' \| 'wow' \| 'o', dur, {x, y})` | cara de todas las bolitas (entran con 0–0,3 s de desfase) y hacia dónde miran |
| `say(x, y, 'POP!', color, tamaño, vida, giro)` | onomatopeya dentro del mundo |
| `shake(px)`, `st.flash = 0..1` | temblor y destello |
| `poof(x, y)` | nubecitas (aparece una herramienta) |
| `ev('nombre', valor)` | **evento de sonido** en este instante (lo usa el audio) |
| `st.th` | gesto de la herramienta: −1 preparado (atrás y arriba) · 0 reposo · +1,4 estocada |

Recetas que ya están probadas en `videos/pop/escena.js`:
- **Golpe con anticipación**: `tw(st,'th',0.5,-1,'out')` → sostené 0,3–0,4 s (brillito en la punta) → estocada
  en 0,1 s lineal + `move` corto → `pop` en el cuadro del contacto → retroceso de 0,45 s con salto.
- **Ráfaga**: la función `stab(t0)` encola 4 cues (acercarse, preparar, pinchar, soltar) y elige el blanco al
  momento. Tres seguidas cada 0,7 s.
- **Vehículo que cruza**: objeto guiado (`st.roll.x -= v*dt`) que **no** choca: solo dispara `pop` en las grandes
  y revolea para atrás a las chicas. Brik va «sentado» (se dibuja antes que el chasis).
- **Clímax**: todas hacen `pop(..., {lite:true})` con velocidad hacia afuera y arriba; Brik pasa de guiado a
  cuerpo físico (`W.add({kind:'k', spin:true, ghost:true, vy:-3350})`), sale de cuadro y cae **último** para
  quedar arriba de la pila.
- **Remate sembrado**: el objeto sale de cuadro en el segundo 5 (`st.pinFly`) y vuelve en el 26 (`st.pinFall`)
  siguiendo la posición del cuerpo de Brik.

Física (`motor/fisica.js`), valores que funcionan: gravedad 2600 px/s², 3 subpasos × 4 iteraciones, rigidez 0,7,
rebote contra el piso 0,42, tope de velocidad 4200 px/s. Con 160 bolitas de radio 37 la pila llega al 40 % del
alto (deja ver el cartel y el techo de la casa); con 200 tapa todo. Para llenar la pantalla calculá:
`alto de la pila ≈ n · π · r² / (0,85 · 1080)`.

## 6. Sonido (sin voz)

Todo se sintetiza con numpy en `audio/hacer_audio.py`; no hay samples ni música bajada, así que no hay problemas
de licencia. La simulación escribe `out/eventos.json` y cada evento suena en su instante exacto.

- **Efectos**: pop (más grave cuanto más grande la bolita), boing, golpe, pasos, silbido que sube y que baja,
  campanita, risitas agudas en coro, gruñido y risa grave de Brik, motor del rodillo, cadena, clic, explosión,
  tics del contador que suben de tono, besito, acorde de «ding», festejo.
- **Música**: original, marimba + bajo + percusión a 132 pulsos por minuto, Do – La m – Fa – Sol. `level(t)`
  decide qué capas suenan en cada tramo de la historia.
- **Los silencios son el chiste**: medio segundo de silencio total antes del primer pop, antes del clímax y
  mientras cae el alfiler. Redoble que crece 1,5 s antes del clímax; una octava más arriba durante el festejo;
  acorde final en la última reacción.
- **Mezcla**: efectos y música con RMS parecido (los efectos sobresalen por sus picos), saturación suave y
  normalización a **−14 LUFS** al unir.
- Los eventos repetidos se limitan (`once`) para que 160 pops simultáneos no saturen.
- Como el audio de la referencia no se pudo medir, **escuchá el resultado** (o pedile a la persona que lo
  escuche) antes de publicar: la onda dice si está balanceado, no si es lindo.

## 7. Lista de revisión (antes del render final)

En la hoja de 1 cuadro por segundo y en las de 4 por segundo del clímax y el remate:
- ¿En el cuadro 0 ya se ven el personaje tierno, el villano y la amenaza? ¿El cartel se lee?
- ¿El contador coincide con lo que se ve y sube más en cada intento?
- ¿Cada herramienta es claramente más grande que la anterior?
- ¿El villano cambia de cara entre intento e intento? ¿Las bolitas reaccionan (risa, sorpresa)?
- ¿Algún tramo de más de 1,5 s sin cambio? (suele pasar justo después de un vehículo que cruza)
- ¿La pila deja ver el cartel? ¿El villano queda **arriba** de la pila, derecho y lejos del borde?
- ¿Nada importante debajo del 85 % del alto ni detrás del cartel?
- ¿Se nota el cambio de luz en el clímax?
- ¿El remate usa algo sembrado y el cartel cambia?
- `ffprobe`: 1080x1920, 60 fps, con audio; duración = `dur`.

## 8. Trampas que ya pisamos

- **Bolitas que nacen encimadas salen disparadas** (la corrección de posición se vuelve velocidad). Nacen con el
  30 % del radio y se inflan (`r` → `rT`).
- **El villano queda enterrado** si sale volando junto con las bolitas: tiene que ser `ghost` hasta el punto más
  alto, salir más rápido que ellas (−3350 contra −2400) y caer con la velocidad topeada.
- **Un cuerpo cuadrado que rueda queda de costado**: al apoyarse se endereza a 0° (`spin` en `fisica.js`), no al
  cuarto de vuelta más cercano.
- **Una bolita grande se le escapa al vehículo** saltando por arriba: al llegar al borde, el vehículo revienta
  todas las grandes que queden cerca. Si no, el contador da 29 en vez de 32.
- **El personaje guiado empuja** a las bolitas (es un cuerpo fijo): ponelo `ghost` cuando sale de cuadro o va
  montado.
- **Temblor sin margen** muestra el borde del lienzo: zoom mínimo 1,03 y capas un 30 % más anchas que el cuadro.
- **Demasiadas bolitas**: más de ~170 de radio 37 tapan el fondo y el cartel.
- **Scripts en `file://`**: son scripts clásicos sobre el global `M`, no módulos (Chrome bloquea módulos locales).
  La fuente va incrustada en `motor/fuente.js` por lo mismo.
- **Todos los efectos al mismo volumen** dejan la música inaudible: mirá la onda después de cada cambio.
- **YouTube bloquea descargas desde la nube** («Sign in to confirm you're not a bot»). Sí funcionan los listados
  (`yt-dlp --flat-playlist`) y las miniaturas (`i.ytimg.com/vi/<id>/oardefault.jpg`, `hq1.jpg`…`hq3.jpg`), que
  alcanzan para estudiar estilo. Para ritmo y audio hace falta bajar el video desde la PC.

## 9. Render en la PC con la placa de video

En la carpeta `shorts-fisica/` de la PC: doble clic en `RENDERIZAR.bat` (instala Playwright la primera vez,
renderiza con `--gpu --nvenc`, hace el audio y une todo en `out\pop_final.mp4`). Necesita Node, ffmpeg y Python
con numpy. Si NVENC falla, reintenta solo con x264. Si se le pide a otra sesión que lo haga: que haga
`git fetch` de la rama, corra el `.bat` (o los tres comandos de `renderizar.sh`) y confirme con `ffprobe`.
