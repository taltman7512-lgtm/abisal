# Informe Fase 1 — Shorts de Volze (@volzewho)

Relevado el 23-nov-2026. **Informe parcial**: lo visual, los subtítulos y los
números están verificados; el audio y el ritmo de montaje no se pudieron analizar
(ver «Qué no se pudo hacer»).

## Qué se pudo hacer y qué no

| Paso pedido | Estado | Detalle |
|---|---|---|
| Listar Shorts y ordenar por vistas | Hecho | 280 Shorts, todos en `todos_los_shorts.csv`; los 22 analizados en `videos.csv` |
| Descargar videos con yt-dlp | **Falló** | YouTube responde «Sign in to confirm you're not a bot» a la IP de este entorno, y la red del contenedor no permite los servidores de video (`googlevideo.com`) |
| Plan B: reproducir en Chrome y capturar | **Falló** | Mismo bloqueo: el reproductor no recibe el video. No hay «Claude en Chrome» en esta sesión en la nube |
| Frames | Parcial | 3 frames reales a 1080×1920 por video (los que YouTube publica como miniaturas automáticas), 22 videos = 66 frames. No tienen timestamp exacto: son inicio / medio / final aproximados |
| Transcripción con whisper | No hecho | Sin audio |
| Identificar música | No hecho | Sin audio. Único dato: YouTube atribuye «Original Sound» en los 55 videos consultados (no usan pista de la biblioteca de YouTube) |
| Hook, duración, ritmo de cortes, voz, SFX, giro final | No hecho | Requieren el video |

Las planchas de frames están en `frames/`. Cada plancha tiene 2 videos (una fila
cada uno, 3 frames por fila); la columna `frames` de `videos.csv` dice cuál es cuál.

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

## Las 5 observaciones iniciales

### 1. Personajes cuadrados en escenarios realistas — confirmada, y falta la mitad
- Cuerpos de bloques con bordes apenas redondeados, cabeza tipo cilindro/caja,
  pelo low-poly facetado. Sin logos ni interfaz de Roblox en los videos actuales.
- Hay **un protagonista recurrente**: pelo rubio en punta, cabeza y brazos blancos,
  torso azul, pantalón oscuro. Aparece en 12 de los 22 videos
  (`top03-04`, `top05-06`, `top07-08`, `rec01-02` … `rec05-06`).
- Dos registros de cara: **mínima** (ojos de óvalo negro, boca de una línea, cejas
  finas) en las historias serias; **caricatura exagerada** (ojos saltones, lágrimas,
  cara roja de furia) en las de comedia (`top01-02` fila 1, `top05-06` fila 2).
- Escenarios con texturas realistas: adoquín, entramado de madera, piedra, tablones
  gastados, cobre con pátina (`rec05-06`, `rec03-04`, `rec01-02`).
- **Lo que faltaba**: en casi todos los videos fuertes hay un tercer elemento, una
  **criatura u objeto gigante hiperdetallado y no cuadrado**: ojo gigante con
  pestañas sobre una boda (`top01-02` fila 2), criatura del tamaño de una montaña
  sobre el pueblo (ídem), figura de porcelana agrietada (`top07-08`), gigante de
  piel roja (`rec05-06`), ser pálido de brazos largos (`rec03-04`), criatura-campana
  verdosa (`rec05-06`). El contraste es de tres niveles: gente de juguete / mundo
  real / amenaza detallada.

### 2. Luz cálida, niebla, ocres — corregida
Vale para 2 de los últimos videos (`rec01-02` fila 1 «brannock», `rec03-04` fila 1
«help»), que son justo los que tenías a la vista. En el top 10, 8 de 10 son
**exteriores de día, cielo azul o blanco, colores saturados**. Hay hora dorada en 2
(`top05-06`). Lo constante no es el ocre sino: una sola fuente de luz dura (sol),
sombras definidas, bruma atmosférica en la lejanía y bloom suave.

### 3. Temas: misterio, terror leve, historia — parcial
El canal pasó por cuatro etapas, visibles en los títulos:

| Etapa | Fórmula de título | Mediana de vistas |
|---|---|---|
| Sep (puestos 241–280) | «How Do You Defeat the "Simply X" Monster 🤔», «Could You… in ROBLOX» | 233 k |
| Fines sep – oct | «How Do You… / Why Does… 🤔» (problema absurdo) | 3,1 M |
| Oct (161–200) | «I [hazaña absurda] 😳» — comedia en primera persona | 5,6 M |
| Nov (1–80) | «We… / Nobody… / Don't… / It…» — un pueblo con una regla inexplicable | 4,1 M (últimos 40) |

El terror leve/misterio es la etapa actual, pero el video más visto (37 M) es
comedia. Los nombres raros de los subtítulos («brannock», «dorrick») son nombres
de personajes o lugares inventados: mundo ficticio, no historia real.

### 4. Subtítulos — confirmada con dos correcciones
Medido sobre los 66 frames:
- Una palabra por vez, **en minúscula**, tipografía redonda y gruesa (tipo
  Fredoka/Baloo), amarillo **#FFF200** aprox., contorno negro grueso y sombra.
- **No van abajo**: el centro del texto está al **75 % del alto** (y ≈ 1440 de
  1920) en 54 de 64 frames, bien por encima de la interfaz de Shorts. En 10 frames
  sube al 22 % del alto cuando la acción ocupa la zona baja.
- Altura de la letra ≈ 3 % del alto del cuadro (≈ 55–60 px de altura de x a 1080×1920).
- Los videos de septiembre (los peores) usan una letra más chica y fina, con
  puntuación («off.»). El estilo actual es más grande y limpio.

### 5. Cámara cerca de las caras, contrapicado — confirmada y ampliada
- Primeros planos con **gran angular**: la cabeza llena medio cuadro y los brazos
  se deforman hacia cámara (`rec05-06`, `top07-08` fila 1).
- Contrapicado para las criaturas (`rec05-06` fila 2, `rec03-04` fila 2).
- **Además**: plano cenital o aéreo que muestra la escala o la multitud
  (`top05-06` fila 1, `top09-10` fila 1, `top01-02` fila 2). Aparece en 6 del top 10.

## Qué separa a los que explotan de los que no

De los títulos de los 280 Shorts:

| Variable | Resultado |
|---|---|
| Largo del título | ≤ 5 palabras: mediana 2,9 M · 6–8: 2,2 M · 9 o más: 588 k |
| Hashtags o «Roblox» en el título | Son los peores del canal (43 k–360 k) |
| Fórmula | «We/Nobody/Don't/It» 3,6 M e «I/My» 3,2 M, contra «He/She» 342 k y «Can You» 325 k |
| Series con numeración (Part 2, Origins Pt. 3) | Casi todas bajo 1 M |

De los frames (top 10 contra los 6 peores):

| Top 10 | 6 peores |
|---|---|
| Un gimmick visual que se entiende en un solo frame: ojo gigante, escalera al cielo, fila infinita, pared de escalada | Situación cotidiana sin imagen fuerte: gimnasio, ascensor, cinta de equipaje, barco |
| Exterior, escala grande, multitudes | Interior chico, pocos personajes |
| Carteles dentro del mundo que explican la regla («ONLY 4 YEARS AWAY», «BE FIRST», «FORTY STEPS») | Interfaz de juego encima: popup de donación, barra de poder (`bajo01-02`) |
| Narración en primera persona («i'm», «us», «we») | Discusión entre dos personajes («He called me…») |
| Caras mínimas o caricatura limpia | Caras de meme |

## Inferencias sin confirmar

- **Voz**: los subtítulos en primera persona sugieren un narrador-protagonista, no
  diálogo. No lo escuché.
- **Producción**: hay indicios de video generado con IA más que de animación 3D
  tradicional: carteles con texto roto («JUST F??? STEPS» en `top07-08`), el
  protagonista cambia de proporciones entre videos, aparece una cara humana
  realista en un video de bloques (`top03-04`), y el ritmo de 5–6 Shorts diarios.
  Si es así, importa para la Fase 2: con Three.js o Blender se puede igualar el
  lenguaje (personajes, cámara, subtítulos, estructura) pero no el nivel de
  detalle de las texturas sin assets PBR buenos.

## Las 10 reglas del estilo Volze (por impacto)

Las reglas 1–8 salen de datos y frames. Las 9 y 10 quedan **provisorias** hasta
analizar video y audio.

1. **Premisa en una oración con una regla imposible**, dicha en el título en 5
   palabras o menos, sin hashtags ni «Roblox». («We Only Move When It Blinks».)
2. **Un gimmick visual que se lee en un frame**: algo gigante, altísimo o
   multitudinario que ilustra la regla.
3. **Contraste de tres niveles**: personajes de bloques simples, mundo con
   texturas realistas, y una criatura u objeto detallado y no cuadrado.
4. **Primera persona colectiva**: «we / us / I». El protagonista cuenta; nadie
   discute en cámara.
5. **Protagonista fijo y reconocible** (silueta y 3 colores planos) rodeado de
   secundarios descartables.
6. **Subtítulo de una palabra**, minúscula, amarillo #FFF200, contorno negro
   grueso, centrado al 75 % del alto (22 % si tapa la acción).
7. **Tres encuadres que se alternan**: primer plano gran angular de la cara,
   contrapicado a la amenaza, cenital o aéreo para la escala.
8. **Exterior con sol duro y bruma lejana**; la noche y el ocre se reservan para
   las historias de terror. Los carteles del mundo hacen la exposición.
9. *(provisoria)* Hook en los primeros 3 s: la regla dicha por el narrador sobre
   el plano del gimmick.
10. *(provisoria)* Cierre con giro que invierte la regla, y música original
    discreta bajo la voz.

## Para completar el análisis

Hace falta correr la descarga desde una máquina con IP residencial y sesión de
YouTube, es decir, tu PC (la misma de la RTX 4060, que también es necesaria para
el render de la Fase 2). Con eso se completan: duración, cortes por escena,
transcripción con whisper en CUDA, música/BPM, hook y giro final, y las reglas 9
y 10 pasan de provisorias a medidas.
