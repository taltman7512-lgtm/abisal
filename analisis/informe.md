# Informe Fase 1 — Shorts de Volze (@volzewho)

Relevado el 23-nov-2026. **Informe completo de la Fase 1**: la primera versión
(lo visual, los subtítulos y los números públicos) se hizo en la nube; el análisis
de video y audio se terminó el mismo día en una PC con RTX 4060.

Timestamps: `top03 @ 8,9 s` significa el video `top03` de `videos.csv` en el
segundo 8,9. Las métricas por video están en `medidas.csv`.

## Qué se hizo y con qué

| Paso | Estado | Detalle |
|---|---|---|
| Listar Shorts y ordenar por vistas | Hecho | 280 Shorts en `todos_los_shorts.csv`; los 22 analizados en `videos.csv` |
| Descargar los 22 videos | Hecho | yt-dlp desde IP residencial, sin cookies. Quedan fuera del repo (material de terceros) |
| Frames | Hecho | 1 por segundo + uno por cada corte detectado (≈ 3.000 frames, fuera del repo). Las planchas de `frames/` siguen siendo las miniaturas públicas |
| Transcripción | Hecho | faster-whisper `large-v3` en CUDA (float16), con timestamp por palabra |
| Separar voz y fondo | Hecho | Demucs `htdemucs` en CUDA |
| Identificar música | Hecho en 22/22 | Shazam sobre la pista **sin voz**, en 4 fragmentos por video. Sobre la mezcla con voz no reconocía ninguna |
| Cortes y movimiento de cámara | Hecho, con ruido | Detector propio (diferencia de color y de píxel a 30 fps). Ver «Límites» |
| Efectos de sonido | Contados, no clasificados | Golpes de volumen en la pista sin voz |
| Hook, voz, giro final, duración | Hecho | De la transcripción con timestamps |

### GPU (RTX 4060, driver 566.03, CUDA 12.7)

| Tarea | GPU | CPU | Aceleración |
|---|---|---|---|
| whisper large-v3, 105 s de audio (`top01`) | 16,3 s | 184,6 s | 11,3× |
| Demucs htdemucs, 105 s (`top01`) | 3,2 s | 36,8 s | 11,5× |

Durante el lote completo, `nvidia-smi` (una muestra cada 0,5 s) marcó un pico de
100 % de uso y 5,3 GB de VRAM. La media fue del 26 %, porque los frames, el
detector de cortes y Shazam corren por CPU entre una transcripción y otra.

## Corrección de la premisa: cuáles son los videos top

Las cifras del pedido (7,5 M, 2,2 M, 1,2 M, 189 k) son las de los **últimos 6
Shorts subidos**, no las de los más vistos. El canal tiene Shorts de hasta 37 M:

| # | Título | Vistas | Likes | Fecha |
|---|---|---|---|---|
| 1 | I Tripped the Fastest Man Alive 😳 | 37,5 M | 483 k | 6-oct |
| 2 | We Only Move When It Blinks | 28,5 M | 607 k | 17-nov |
| 3 | Don't Look Down 🧗 | 27,3 M | 396 k | 19-nov |
| 4 | She Never Says No 😳 | 26,2 M | 388 k | 14-oct |
| 5 | We Jump Every Nine Seconds 🪢 | 25,0 M | 498 k | 17-nov |
| 6 | Nobody Ever Comes Back Down 🪜 | 22,5 M | 409 k | 24-oct |
| 7 | We Race To Lose | 21,8 M | 432 k | 14-nov |
| 8 | I Slept Through My Night Shift 😳 | 20,2 M | 465 k | 12-oct |
| 9 | Nobody Leaves Seat 13C 💺 | 18,7 M | 295 k | 17-oct |
| 10 | The Last Thing We'll Ever See | 16,7 M | 350 k | 13-nov |

Datos del canal: 280 Shorts entre fines de agosto y el 23-nov (≈ 5–6 por día en
noviembre). Mediana 1,9 M, media 3,8 M; 24 videos pasan los 10 M.

El de «189 k» (*Don't Let It Reach The Bottom*, hoy 200 k) se subió el mismo día
del relevamiento: tiene horas de vida. Compararlo con el de 7,5 M (un día más
viejo) mide sobre todo la edad, no la calidad. Para «qué separa a los que explotan»
usé los 280 títulos y los 6 con menos vistas de todo el canal (43 k–67 k).

## Medidas de video y audio

Medianas por grupo (detalle por video en `medidas.csv`):

| Medida | Top 10 | 6 recientes | 6 peores |
|---|---|---|---|
| Duración | **141 s** (105–178) | 144 s (143–147) | 60 s (34–81) |
| Palabras por minuto | **260** (245–287) | 262 | 236 |
| Primera palabra | 0,0 s en los 10 | 0,0 s | 0,0 s |
| Última palabra antes del final | 0,2–2,1 s | 0,4 s | 0,3 s |
| Cambios de encuadre por minuto | **36** (24–55) | 51 | 50 |
| Duración mediana de cada encuadre | **1,2 s** | 0,9 s | 1,0 s |
| Música audible | 95–100 % del video | 100 % | 95–100 % |

### Duración — corrige un supuesto
Los Shorts del canal **no duran menos de 60 s**: el top 10 va de 105 a 178 s. Los
de 60 s o menos son todos de septiembre, la etapa peor.

### Hook (primeros 3 s) — medido
- La **primera palabra suena en 0,0 s** en los 22 videos: no hay silencio, logo
  ni plano de ambientación.
- Dos oraciones: la **regla** y enseguida el **costo**. La segunda empieza entre
  1,6 y 3,4 s:
  - `top02 @ 0,0` «We only move when the eye blinks.» → `@ 1,7` «Whoever moves
    while it's open turns to stone.»
  - `top03 @ 0,0` «A giant is climbing up after all of us.» → `@ 1,9` «Whoever it
    reaches is gone.»
  - `top07 @ 0,0` «Something waits at every finish line.» → `@ 1,7` «Whoever
    finishes is never seen again.»
  - En comedia la regla es la hazaña absurda: `top01 @ 0,0` «I stuck out my foot
    and tripped the fastest man alive…».
- La imagen arranca **en plena acción y con la cámara ya en movimiento**
  (`top01 @ 0,0–1,0`: el tropiezo ocurre en el primer segundo).

### Voz — confirmada
- **Un solo narrador**, en primera persona, durante todo el video. Los diálogos
  se dicen citados con la misma voz («He yelled, that's four euros»,
  `top01 @ 31,9`).
- Medido por tono (F0): desde `bajo06` (1-nov) en adelante, los 17 videos están
  entre **167 y 179 Hz**, con variación interna chica (22–40 Hz). Es la misma voz
  en todo el canal actual. Los de septiembre (`bajo01–05`) tienen otra voz
  (235–296 Hz) y una mezcla más fuerte y cargada.
- **Rápido**: ≈ 260 palabras por minuto, casi el doble que una narración normal.

### Cierre y giro final — medido
- Los 10 del top terminan con un **giro en los últimos ≈ 5 s**, y **6 de 10
  retoman la regla del arranque y la dan vuelta**:
  - `top03 @ 154,0` «Whoever I reach is gone»: el narrador ahora es la amenaza.
  - `top02 @ 135,9` «…Tonight, I'm begging it not to blink.»
  - `top07 @ 154,4` «For the first time in my life, I'm running the wrong way.»
  - `top10 @ 156,7` «Now, you're in my photo forever.»
  - En comedia, el giro es un remate que cambia lo que creíamos entender:
    `top09 @ 120,5` (el avión era una atracción de feria), `top08 @ 136,9`.
- **Sin cierre ni pantalla final**: la última palabra termina entre 0,2 y 2,1 s
  antes del final, lo que deja el video listo para el bucle.

### Ritmo de montaje — medido, y distinto de lo que parecía
- La cámara **nunca está quieta**: travellings, órbitas y **barridos rápidos**
  (≈ 0,2–0,3 s con desenfoque de movimiento) cambian el encuadre cada ≈ 1,2 s
  (mediana del top 10).
- Los **cortes duros son pocos** y separan escenas. En `top01` el primer corte
  está en 15,9 s: todo el hook es un solo plano en movimiento. En `top09 @ 9,4` y
  `@ 10,6` hay barridos, no cortes (la diferencia entre frames se sostiene unos
  7 frames en vez de dar un pico aislado).
- El top 10 cambia de encuadre **menos seguido** que los recientes y los peores
  (36 contra ≈ 50 por minuto): sostiene cada imagen un poco más.

### Música — identificada en los 22
Shazam sobre la pista sin voz:

| Pista | Videos | Volumen bajo la voz | Golpes de SFX por minuto |
|---|---|---|---|
| *Fallen Down (Reprise)* — Toby Fox (Undertale) | top03, top07, top10, rec01–06 | ≈ 6 dB | 0–7 |
| *nosleep funk* — akinari | top02, top05 (y el inicio de rec06) | ≈ 6 dB | 5–7 |
| *Hide and Sneak* — The Fly Guy Five | top01, top04, top08, top09, bajo04, bajo06 | ≈ 15–17 dB | 47–62 |
| *Ebb* — Density & Time | top06 | ≈ 17 dB | 18 |
| *No Surprises* — Radiohead / *Apocalyptic Echoes* | bajo01–03 / bajo05 | 4–12 dB | 2–19 |

- Son **pistas existentes**, no música original. YouTube igual muestra «Original
  Sound» porque el audio se sube ya mezclado.
- **Dos mezclas según el formato**:
  - **Regla del pueblo / terror**: tema melancólico y lento sin batería (la
    pista de batería de Demucs queda en −35 a −45 dB), ≈ 6 dB bajo la voz, casi
    sin efectos.
  - **Comedia en primera persona**: pista juguetona a ≈ 16 dB bajo la voz y
    **un golpe de efecto casi por cada barrido** (≈ 1 por segundo).
- En `top05` y `rec06` la música **cambia** de *nosleep funk* a *Fallen Down
  (Reprise)* en el último acto: el tema triste entra con el giro.
- Para la Fase 2 sirve el carácter (tempo lento, melodía simple tipo caja de
  música o piano, sin percusión), nunca las pistas.

## Las 5 observaciones iniciales

### 1. Personajes cuadrados en escenarios realistas — confirmada, y falta la mitad
- Cuerpos de bloques con bordes apenas redondeados, cabeza tipo cilindro o caja,
  pelo low-poly facetado. Sin logos ni interfaz de Roblox en los videos actuales.
- Hay **un protagonista recurrente**: pelo rubio en punta, cabeza y brazos blancos,
  torso azul, pantalón oscuro. Aparece en 12 de los 22 videos.
- Caras pintadas planas, que cambian de expresión. Dos registros: **mínima** (ojos
  de óvalo negro, boca de una línea) en las historias serias; **caricatura
  exagerada** (ojos saltones, lágrimas, cara roja) en la comedia
  (`top01 @ 4–8`: el abrazo con lágrimas).
- Escenarios con texturas realistas: adoquín, madera, piedra, cobre con pátina.
- **Lo que faltaba**: casi todos los videos fuertes tienen una **criatura u objeto
  gigante, detallado y no cuadrado** (ojo gigante, gigante que trepa, escalera de
  luz, figura de porcelana). El contraste es de tres niveles: gente de juguete,
  mundo real y amenaza detallada.

### 2. Luz cálida, niebla, ocres — corregida
Vale para 2 de los últimos videos. En el top 10, 8 de 10 son **exteriores de día,
cielo azul o blanco, colores saturados**; hay hora dorada en 2. Lo constante es una
sola luz dura (sol), sombras definidas, bruma en la lejanía y bloom suave. También
hay profundidad de campo y desenfoque de movimiento en casi todos los planos.

### 3. Temas: misterio, terror leve, historia — parcial
El canal pasó por cuatro etapas, visibles en los títulos:

| Etapa | Fórmula de título | Mediana de vistas |
|---|---|---|
| Sep (puestos 241–280) | «How Do You Defeat the "Simply X" Monster 🤔», «Could You… in ROBLOX» | 233 k |
| Fines sep – oct | «How Do You… / Why Does… 🤔» (problema absurdo) | 3,1 M |
| Oct (161–200) | «I [hazaña absurda] 😳» — comedia en primera persona | 5,6 M |
| Nov (1–80) | «We… / Nobody… / Don't… / It…» — un pueblo con una regla inexplicable | 4,1 M (últimos 40) |

Hoy conviven **dos formatos**: la comedia en primera persona («I…», el video más
visto, 37 M) y la regla del pueblo («We / Nobody…», la etapa actual). Cada uno
tiene su propia mezcla de música y efectos (ver «Música»).

### 4. Subtítulos — confirmada con dos correcciones
- Una palabra por vez, **en minúscula**, tipografía redonda y gruesa (tipo
  Fredoka/Baloo), amarillo **#FFF200** aprox., contorno negro grueso y sombra.
- Cada palabra **entra con un salto de escala** (aparece un poco más grande y se
  asienta): se ve en `top01 @ 2,0–3,0` a 8 fps.
- **No van abajo**: el centro del texto está al **75 % del alto** en 54 de 64
  frames; sube al 22 % cuando la acción ocupa la zona baja.
- Altura de la letra ≈ 3 % del alto del cuadro.
- Los videos de septiembre usan una letra más chica y fina, con puntuación.

### 5. Cámara cerca de las caras, contrapicado — confirmada y ampliada
- Primeros planos con **gran angular**: la cabeza llena medio cuadro.
- Contrapicado para las criaturas y los carteles gigantes (`top07 @ 38–40`).
- Plano cenital o aéreo para mostrar la escala o la multitud (6 del top 10).
- **Nuevo**: la cámara no se queda quieta nunca, y el encuadre cambia con barridos
  rápidos (ver «Ritmo de montaje»).

## Producción: no es IA — inferencia corregida

La primera versión decía que los videos parecían **generados con IA**. Con los
videos completos, la evidencia apunta a **render 3D con personajes riggeados**:
- Los carteles se leen bien y sin errores: `top07 @ 38–44` «FASTEST KID ALIVE.
  FORTY STEPS FROM FIRST.», «DON'T BE LAST.», «BE FIRST.»; `top01 @ 0–16` «GO
  CHAMP! RUNNING NON-STOP SINCE 2016», «HOT DOGS», «ROW 1». El «JUST F??? STEPS»
  de la primera versión era un artefacto de la miniatura de baja resolución.
- La geometría y el texto se mantienen idénticos de un frame a otro durante
  movimientos de cámara largos y continuos (`top01 @ 0–15,9`, un solo plano).
- Multitudes de cientos de personajes iguales (`top07 @ 41–44`), y profundidad de
  campo y desenfoque de movimiento coherentes con la cámara.

No se puede saber qué motor usan. Para la Fase 2 la conclusión es buena noticia:
con Three.js o Blender se puede igualar el lenguaje completo. El límite sigue
siendo el detalle de las texturas, que necesita buenos assets PBR.

## Qué separa a los que explotan de los que no

De los títulos de los 280 Shorts:

| Variable | Resultado |
|---|---|
| Largo del título | ≤ 5 palabras: mediana 2,9 M · 6–8: 2,2 M · 9 o más: 588 k |
| Hashtags o «Roblox» en el título | Son los peores del canal (43 k–360 k) |
| Fórmula | «We/Nobody/Don't/It» 3,6 M e «I/My» 3,2 M, contra «He/She» 342 k y «Can You» 325 k |
| Series con numeración (Part 2, Origins Pt. 3) | Casi todas bajo 1 M |

De los videos (top 10 contra los 6 peores):

| Top 10 | 6 peores |
|---|---|
| 105–178 s | 34–81 s |
| Un gimmick visual que se entiende en un solo frame | Situación cotidiana sin imagen fuerte |
| Exterior, escala grande, multitudes | Interior chico, pocos personajes |
| Carteles dentro del mundo que explican la regla | Interfaz de juego encima (popup, barra de poder) |
| Narrador único en primera persona, ≈ 170 Hz, mezcla limpia | Otra voz, más aguda (235–296 Hz), mezcla cargada |
| Giro final que retoma la regla del arranque | Cierre de chiste suelto o moraleja (`bajo05 @ 61–65`) |
| Encuadre cada ≈ 1,2 s | Encuadre cada ≈ 1,0 s |

## Límites: qué no se pudo medir bien

- **BPM**: la estimación por autocorrelación da números poco fiables
  (periodicidad 0,06–0,21 sobre 1), porque la música es lenta, sin batería y de
  tempo libre. No los uso como dato; quedan en el script de análisis.
- **Voz humana o sintética**: el tono es muy constante entre 17 videos, lo que es
  compatible con una voz sintética, pero no lo puedo confirmar.
- **Efectos de sonido**: están contados (golpes de volumen en la pista sin voz),
  no clasificados por tipo.
- **Cortes**: el detector confunde parpadeos de luz con cortes (`top09 @ 27–29`).
  Los cambios por minuto son aproximados (±10 %), pero la diferencia entre grupos
  se mantiene.
- **Shazam**: en algunos fragmentos no reconoce nada (por ejemplo, `top02` en los
  fragmentos de 47 s, 93 s y 127 s); ahí puede haber otra pista o la misma
  demasiado baja.

## Las 10 reglas del estilo Volze (por impacto)

Todas medidas. Las anteriores 9 y 10 (hook y cierre) ya no son provisorias y suben
de puesto.

1. **Premisa en una oración con una regla imposible**, dicha en el título en 5
   palabras o menos, sin hashtags ni «Roblox». («We Only Move When It Blinks».)
2. **Hook de dos oraciones desde el segundo 0**: la regla (≈ 0–2 s) y el costo
   (empieza antes de los 3,5 s), sobre una imagen que ya está en movimiento. Sin
   silencio, logo ni plano de ambientación.
3. **Un gimmick visual que se lee en un frame**: algo gigante, altísimo o
   multitudinario que ilustra la regla.
4. **Un solo narrador en primera persona, rápido**: ≈ 260 palabras por minuto,
   «we / I», diálogos citados por la misma voz. Video de **105–178 s**
   (≈ 600 palabras).
5. **Giro final en los últimos ≈ 5 s que retoma la regla del arranque y la da
   vuelta**. El video termina con la última palabra, sin cierre: bucle limpio.
6. **Contraste de tres niveles**: protagonista fijo de bloques (silueta y 3
   colores planos) y secundarios descartables, mundo con texturas realistas, y una
   criatura u objeto detallado y no cuadrado.
7. **Cámara siempre en movimiento**, con barridos rápidos que cambian el encuadre
   cada ≈ 1,2 s y pocos cortes duros. Se alternan primer plano gran angular,
   contrapicado a la amenaza y cenital o aéreo para la escala.
8. **Subtítulo de una palabra** que entra con un salto de escala: minúscula,
   amarillo #FFF200, contorno negro grueso, centrado al 75 % del alto (22 % si
   tapa la acción).
9. **Música que cambia según el formato**, siempre debajo de la voz durante todo
   el video:
   - Regla o terror: tema lento y melancólico, sin percusión, ≈ 6 dB bajo la
     voz, casi sin efectos.
   - Comedia: pista juguetona a ≈ 16 dB bajo la voz, con un golpe de efecto por
     barrido.
   - En el giro puede entrar el tema triste.
10. **Exterior con sol duro, bruma lejana, profundidad de campo y desenfoque de
    movimiento**. La noche y el ocre se reservan para el terror. Los carteles del
    mundo hacen la exposición.
