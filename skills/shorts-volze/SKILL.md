---
name: shorts-volze
description: Hace Shorts verticales con el estilo medido del canal Volze (@volzewho) — personajes de bloques propios en un pueblo con texturas reales, una regla imposible, una criatura gigante no cuadrada, narrador único en primera persona, cámara siempre en movimiento con barridos, subtítulo amarillo de una palabra — con render 3D por GPU (RTX 4060, NVENC). Dos modos ya decididos: «pueblo de día» (por defecto) y «terror ocre». Usar cuando pidan «un short estilo Volze», «otro como el de la polilla», «un pueblo con una regla», «un short de terror de bloques» o «uno de día con una criatura gigante». No pregunta el estilo: viene decidido por el análisis.
---

# shorts-volze

Receta para hacer, con un solo pedido, un Short con el estilo que hace destacar a Volze, medido en `analisis/informe.md`
(22 videos descargados, whisper, Demucs, Shazam, detector de cortes) y probado en el video
`volze-video/salida/nobody-lights-a-third-lamp.mp4` (modo terror). **No preguntes el estilo**: está decidido acá.
Lo único que se aprueba es la historia (paso 1) si la persona quiere verla; si pidió «hacelo», elegí vos y seguí.

## Preferencias del dueño (mandan sobre todo lo demás; se van sumando)
El dueño dio permiso (24-nov-2026) para modificar esta skill cuando haga falta. **Cada vez que pida un cambio de
gusto** (pelo, aspecto de los personajes, nivel de detalle, voz, música, ritmo, tipo de historia, lo que sea),
anotarlo acá con la fecha, en la misma conversación, y copiar la skill a `~/.claude/skills/shorts-volze/`.
- **Voz**: ElevenLabs «Skylar – Viral Zillennial Voice». Rechazadas: Kokoro, Liam Viral.
- **Música de fondo (24-nov-2026, reemplaza al piano propio)**: de ahora en más va **el MP3 que dio el dueño**,
  «undertale-fallen down but more comforting.mp3», guardado **fuera del repo** en
  `C:/Users/123/Documents/volze-fuentes/musica/fondo-terror.mp3` (no se sube a git ni se baja de YouTube). Se pone en
  loop debajo de todo el video, **≈ 6 dB bajo la voz**, y el pico final queda en ≤ 0,9 (`alimiter`). Se renderiza el video
  `--sinmusica` y se mezcla con ffmpeg (receta en «Música»). El dueño sabe que tiene derechos de terceros y asume el
  riesgo de reclamo de Content ID en su canal. Rechazado: música sintetizada con senos puros; el piano propio no le gustó.
- **Personajes**: estilo de bloques «robloxiano» como los de Volze, siempre con `robloxify()`: brazos y piernas de un
  bloque, cara impresa con ojos ovalados grandes, pelo facetado. Nada de estilo propio (mangas por partes, manos).
- **Calidad (24-nov-2026)**: siempre 1080×1920 a 60 fps y **más detalle** que el mínimo: utilería en cada rincón,
  texturas con relieve, nada de superficies lisas ni planos vacíos. Ante la duda, sumar detalle.
- **Todo dibujado a mano, sin patrones (24-nov-2026)**: nada de texturas repetidas en grilla (escamas en óvalos
  iguales, adoquines clonados, placas en fila). Cada textura se pinta entera: un lienzo grande sin repetir, con
  trazos irregulares, manchas, desgaste y variación, como un dibujo casero. Vale para el caparazón, las casas, la piel
  y la cara de la criatura y el pelo.
- **Pelo**: ver «pelo como los accesorios de Roblox» más abajo (24-nov-2026, reemplaza al casco liso): `peloRoblox()` en
  `ejemplo-dia/_tortuga.js`. Nunca una mezcla de cubos y rectángulos sueltos.
- **Criatura**: ojos con detalle (iris, pupila, brillo húmedo, párpado con arrugas) y cuello con pliegues y arrugas.
- **Flores y detalles chicos en 3D, no pintados (24-nov-2026)**: flores con tallo, pétalos, centro y hojas, pasto en
  matas y percebes huecos, todos con relieve y sombra. Nada de puntitos blancos pintados que parezcan flores.
- **Criatura ultradetallada, como una foto real** (el dueño mandó de referencia una tortuga gigante de Galápagos):
  hocico chato con narinas hundidas, boca de cuerno con labio, ojos hundidos con párpados pesados y cuero rajado en
  placas, con relieve de verdad (geometría deformada + mapa de desplazamiento). La cabeza lleva **textura bien visible**
  (placas de cuero con contraste y relieve; el dueño la pidió así el 24-nov-2026 después de una versión muy lisa) y el **cuello
  bien marcado** (pliegues hondos). Sin percebes en fila sobre el párpado: parecían una ceja pegada. Ver `formaCab`
  y `placas()` en `ejemplo-dia/_cabeza.js`.
- **Revisión cuadro a cuadro (24-nov-2026)**: después de cada render, `python herramientas/chequeo_cuadros.py
  salida/<video>.mp4 --hojas salida/revision` mide TODOS los cuadros (negros, quemados, congelados, parpadeos) y arma
  hojas densas de 4 cuadros por segundo. El agente `revisor-volze` las mira todas y devuelve dos listas: bugs y
  **ultradetalle** concreto para agregar. Se aplica y se vuelve a renderizar.
- **Luz**: más cuidada. Sol cálido con sombras suaves, relleno del cielo, luz de contorno y oclusión en los rincones.
  Más detalle en todo; ante la duda, sumar.
- **Subir al canal «RobloxStories» (24-nov-2026)**: todo video de este estilo (historias del pueblo, personajes de
  bloques tipo Roblox, la tanda de Volze/«Ghostly») se sube al canal de YouTube **RobloxStories** una vez que pasó
  el revisor. Lo subo yo con Claude in Chrome en YouTube Studio: primero confirmar arriba a la derecha que la cuenta
  activa es RobloxStories (si no, «Cambiar de cuenta»), y después seguir el método que anduvo en
  `reel-historias/referencia/youtube.md` (pedazos de 9 MB, juntar con SHA-256 igual, `DataTransfer` al diálogo de
  subida). Se sube el MP4 **sin música** (voz + efectos). Título = el del video (≤ 5 palabras, sin hashtags ni
  «Roblox»); descripción corta en inglés de 1–2 líneas sin hashtags. Queda **privado**: la audiencia («¿creado para
  niños?»), la canción desde la app y el botón de publicar los decide el dueño, salvo que pida publicarlo.
- **Revisión del dueño a la tortuga (24-nov-2026)**: le gustó, pero pidió para este video y los siguientes:
  - **Nunca dibujar cosas planas**, salvo una pintura o un cartel: el piso, la tierra y las piedras llevan relieve de
    verdad (geometría con desplazamiento).
  - **Ropa con textura y relieve de tela** (costuras, pliegues, bolsillos, botones), con aspecto Roblox. **Nunca
    figuras o personas dibujadas sobre la ropa.**
  - **Pelo como los accesorios de pelo de la tienda de Roblox** (mandó «Pelo de colega», un flequillo rubio en capas y
    un pelo castaño de mechones): masa de mechones gruesos y algo facetados, con puntas en pico que salen hacia arriba
    y para los costados, mechones largos que caen sobre la frente y la nuca, degradé de color (más oscuro en la raíz) y
    mechas pintadas a lo largo de cada mechón con brillo. No un casco liso.
  - **Comida y utilería con detalle real** (zanahorias con hojas, estrías y tierra pegada).
  - **Cámara**: ángulos más fluidos y **siempre transiciones con movimiento de cámara**, no saltos.
  - **Criatura**: textura también en la cabeza, ojo con más detalle (iris, brillo, párpado) y sin ceja, salvo que quede
    muy bien. Se mueve **como el animal de verdad** (patas, cuello, cabeza, balanceo), no solo para adelante y atrás.
  - **Oficios**: el cocinero con gorro y chaqueta detallados; la vieja sabia (Olga) con barba de **maestro sensei**.
  - **Casas pegadas al piso**: nada flota ni se buguea cuando se mueve el suelo.
  - **Corridas como las de Volze**.
  - **Arranque como Volze** (25-nov-2026, medido en las 16 transcripciones top y recientes): la primera frase es
    **lo que está pasando ahora, en primera persona** («I stuck out my foot and tripped the fastest man alive…»,
    «I grabbed the mic at a stranger's wedding…», «Last night, I jammed their gate.»), y recién después la regla y el
    contexto. Nunca arrancar con «We live on…» o la descripción del mundo. Ej.: «I just whistled down the well. In
    Wrenmoor, that's the one thing you never do.» La historia después vuelve atrás y alcanza ese momento.
  - **Cada video, un mundo nuevo** (25-nov-2026, el de la anguila no le gustó por esto): pueblo distinto (clima,
    estación, arquitectura, paisaje), tema distinto y **personajes nuevos** (otros diseños, ropa, pelo y nombres). No
    reciclar el pueblo de techos de paja/entramado ni a Garrow, Quill, Pim ni al chico de remera naranja. Mirar
    `referencia/historias-hechas.md` y cambiar todo lo que se vea.
  - **Tema que le gusta**: un **monstruo que acecha al pueblo y se enoja por algo**; el narrador hace justo eso que lo
    enoja, **con un motivo** (salvar a alguien), y el monstruo también tiene **su motivo** para enojarse, que se revela
    al final.
  - **Transiciones como el Short de referencia del dueño** (youtube.com/shorts/s2oIgA4z9BY, medido 25-nov-2026): la
    cámara **viaja por el mundo** de una toma a la siguiente en ≈ 0,7–1,4 s (sube en arco por encima de los techos si
    está lejos, el punto donde mira se desliza, desenfoque de movimiento); en los cuadros del medio se ve el entorno real,
    nunca un borrón abstracto ni un corte. Entre lugares distintos, la cámara entra volando hacia adelante y sale desde
    atrás. Hecho en `videos/pinos/partes/_camara_vuelo.js` (`TR = .8`).
  - **Sin primeros planos** (25-nov-2026): siempre se ven las cabezas enteras (plano medio mínimo: `shF` con distancia
    ≥ 3,4 → 3,0).
  - **Nada superpuesto**: ni personajes metidos en paredes, troncos o muebles, ni el hacha dentro del árbol, ni la
    cámara adentro de algo, ni un ojo que atraviese la pared. El revisor y yo lo chequeamos en cada hoja de tomas.
  - **Ultradetalle en todo** (objetos, estructuras, materiales, plantas, árboles, fondo, animales): nada plano ni
    vacío. Adentro de las casas, paredes con luz y cosas (faroles, estantes, frascos, hierbas, cuadros, cortinas); el
    fuego con profundidad (hogar, troncos, brasas, chispas); ojos de criaturas ultra detallados (iris con fibras,
    venitas, córnea mojada, párpados escamosos); los viejos con arrugas y los ojos siempre visibles bajo gorros.
  - **Entrar a una casa**: el personaje da la vuelta y entra por la puerta (nunca aparece adentro de golpe).
  - **Revisión del dueño a los pinos v2 (25-nov-2026)**:
    - **Ultradetalle en TODO, sin excepción**: techos (sin huecos, tejas/tablas con relieve, nieve con volumen), paredes,
      arbustos (ramitas, hojas, nieve encima), árboles (corteza, ramas en capas, agujas, nieve en cada rama), personajes,
      herramientas, piso, fondo. No alcanza con el techo y las paredes: todo.
    - **El pueblo vive en la tierra**: nada de cúpula ni globo ni cielo con borde visible; el terreno sigue hasta el
      horizonte con montañas, bosque y niebla.
    - **Atuendos como los de Volze**: ropa de bloques simple y legible (remera/campera de un color con un detalle,
      pantalón liso, zapatos), accesorios de Roblox (gorro, bufanda) sin recargar.
    - **Transiciones reales**: la cámara **se traslada por el pueblo** a la velocidad de las tomas (calles, por encima
      de las casas); nunca atraviesa nada (paredes, techos, árboles, personajes). Para entrar a una casa, rodea y
      entra por la puerta, o mira por la ventana y entra por la ventana abierta. La transición buena es lo que retiene.
    - **Planos**: sin primeros planos (ni el del amanecer); nunca un plano donde solo se vean piernas; **siempre se ve el
      fondo y lo que se está contando**. Si una toma no se entiende (techo oscuro con algo blanco), rehacerla.
    - **Ningún techo con hueco** (insistió dos veces): toda construcción con techo a dos aguas (casas, iglesia, galpones,
      el interior) lleva los dos triángulos de las puntas cerrados; mirar cada techo desde abajo y de costado en la hoja.
    - **Troncos cortados como una rodaja real** (mandó foto): anillos finos e irregulares, madera temprana clara y tardía
      oscura, grietas radiales, nudos, aserrín, albura clara y corteza alrededor, con relieve (`T_RODAJA` en
      `videos/pinos/partes/_detalle_pinos.js`). Nunca un disco beige liso.
    - **El revisor revisa también los planos**: que no haya primeros planos, que se lea de qué se habla, que haya fondo,
      que las transiciones no atraviesen nada, y que todo tenga detalle.
  - **Transiciones lentas y que se noten** (25-nov-2026): que se vea que es una transición y no un corte: barrido de
    ≈ 0,5 s con la cámara girando y desenfoque fuerte (`WHIP = .5`, `WC = .5`, giro ≈ 1,4 rad), también al cambiar de
    lugar. Nunca un corte seco.
  - **Barridos y pasadas de cámara más lentos** (25-nov-2026): los de Volze duran 0,2–0,3 s (≈ 7 cuadros) y el top 10
    sostiene cada encuadre más (≈ 36 cambios por minuto). En el motor: `WHIP = .3` entre tomas y `WC = .3` al cambiar
    de lugar (en `_juntar.py`), y recorridos de cámara cortos dentro de cada toma.
  - **Caminatas de verdad** (24-nov-2026): quien camina **avanza** al ritmo de las piernas, con balanceo; nunca piernas
    moviéndose en el lugar. En `crowd()` del ejemplo, `walk` entre 0 y 1,2 avanza a 1,5 × walk por segundo, centrado en
    la marca de la escena (pasa por ahí a mitad de la frase).
  - **Agua ultra realista como la de Volze** (24-nov-2026): material físico con normales de olas en tres escalas que se
    mueven, reflejo del cielo con fresnel (`ENV_AGUA`, prefiltrado con PMREM), brillitos de sol chicos (sin manchas
    que revienten el cuadro), espuma de vetas finas y burbujas contra la orilla. Nunca un plano con textura dibujada.
  - **Luz cinematográfica**: dirección clara, contraluz o luz de borde, sombras largas y contraste.
  - Dónde está hecho (en `ejemplo-dia/_tortuga.js` y `_juntar.py`): `peloRoblox()` y `mechR()` (pelo), `telaReal()`
    (tela con relieve y piezas 3D), `cocinero()`, `barbaSensei()`, `zanahoria()`, `correr()` (corrida con polvo; la
    multitud con `walk ≥ 1.2` corre y avanza sola), empedrado 3D `PISO_LIBRE`, zócalos hondos en `casa()`,
    `tortuga()` (aletas en diagonal, balanceo, cuello, parpadeo, cola), barrido de cámara también entre lugares
    (`WC` en `_juntar.py`) y la luz (`ENV.dia`, sol bajo en `(-56, 36, -40)`, contraluz 1,7).
- **Voz provisoria**: no hacer una voz de reemplazo para el video. Si Chrome no está conectado, armar el video y
  esperar a ElevenLabs. Kokoro solo sirve para medir los tiempos de las tomas y nunca se entrega.
- **Historias**: la de la polilla y las lámparas («Nobody Lights A Third Lamp», terror) no le gustó. La siguiente que
  eligió fue de día: «We Live On Its Back» (pueblo arriba de una tortuga gigante).

Responder siempre en español rioplatense simple. El video va en inglés.

## Ejemplo de día: `ejemplo-dia/` (la tortuga, 24-nov-2026)
Partir de acá para videos nuevos, no de la polilla:
- `_pintado.js`: texturas pintadas a mano sin patrones (`T_PARED` con una pared distinta por casa, tejas, piedra,
  tablas, tierra, caparazón, piel con escamas sueltas, cuello con pliegues, iris), `peloVolze()` (casco liso, ya reemplazado por
  `peloRoblox()` de `_tortuga.js`), ojo de criatura con iris, córnea, párpados y arrugas, luz de
  contorno, más utilería (hiedra, chimeneas con humo, pozo, bancos, cajones).
- `_tortuga.js`: mundo, elenco, `SHOTS` y `setScene`. `_juntar.py` arma `historia.js` con la base de la polilla e
  inyecta las texturas, 16 paredes, `peloVolze` y la oclusión ambiental (GTAO, sin afectar los sprites).

## Las 10 reglas (medidas, ordenadas por impacto)

1. **Premisa en una oración con una regla imposible**; título de **≤ 5 palabras**, fórmula «We… / Nobody… / Don't… / It…»
   (comedia: «I…»). Sin hashtags ni «Roblox» en el título (son los peores del canal: 43 k–360 k).
2. **Hook de dos oraciones desde el segundo 0,0**: la regla (≈ 0–2 s) y el costo (empieza antes de 3,5 s), sobre una
   imagen que ya se mueve. Sin silencio, logo ni plano de ambientación.
3. **Un gimmick visual que se entiende en un frame** (algo gigante, altísimo o multitudinario que ilustra la regla).
4. **Un solo narrador en primera persona, rápido**: 245–287 palabras por minuto (mediana 260), diálogos citados por la
   misma voz. **Duración 105–178 s** (≈ 430–650 palabras).
5. **Giro en los últimos ≈ 5 s que retoma la regla del arranque y la da vuelta.** El video termina 0,2–2 s después de
   la última palabra: sin cierre, sin pantalla final (bucle).
6. **Contraste de tres niveles**: personajes de bloques propios / mundo con texturas reales / criatura u objeto
   gigante, detallado y no cuadrado.
7. **Cámara siempre en movimiento**: barridos rápidos (0,2 s con desenfoque) que cambian el encuadre cada ≈ 1,2 s
   (24–55 por minuto); pocos cortes duros, solo cuando cambia el lugar. Alternar primer plano gran angular,
   contrapicado a la amenaza y cenital/aéreo para la escala.
8. **Subtítulo de una palabra** con salto de escala: minúscula, amarillo **#FFF200**, contorno negro grueso,
   centrado al **75 %** del alto (22 % si tapa la acción), altura de x ≈ 3 % del alto.
9. **Música debajo de la voz todo el video**, según el modo (tabla de abajo). Nunca la música del canal.
10. **Luz de una fuente dura, bruma lejana, profundidad de campo y desenfoque de movimiento.** Los carteles del mundo
    hacen la exposición (ej.: «TWO LAMPS. ALWAYS.» pintado en el pozo).

## Los dos modos (no preguntar: elegir por la premisa)

- Por defecto **pueblo de día** (es la etapa con mejor rendimiento sostenido: top 10 = 8 de 10 exteriores de día).
- **Terror ocre** si el pedido dice miedo/terror/noche o la premisa es de terror.
- (La **comedia en primera persona** «I…» fue el video más visto, 37 M; usarla solo si la piden: música ≈ 16 dB
  bajo la voz y un golpe de efecto por barrido, ≈ 1 por segundo.)

| | Pueblo de día | Terror ocre |
|---|---|---|
| Hora / cielo | día, cielo arriba `#5aa0e8`, horizonte `#cfe4f2` | noche, arriba `#141a2e`, horizonte `#3a3442` |
| Sol / luna (`sun`) | `#fff1dc`, 3.0, sombras duras | luna `#a8b8e0`, 1.0 (+ lámparas `#ffc480` puntuales) |
| Relleno (`hemi`) | `#e8eef8` / suelo `#8a7a60`, 1.4 | `#c4c4d8` / suelo `#2a2018`, 1.0 |
| Niebla (FogExp2) | 0.004 | 0.009 (interior 0.003) |
| Exposición (ACES) | 1.1 | 2.3 (interior 2.05) |
| Corrección final | ninguna | soft-light `#d0962e` al 7 % |
| Muros / madera / piedra | `#b8a184`, `#3a2618`, `#8a8478` | iguales; las lámparas dan el cálido |
| Criatura | gigante a pleno sol, se lee en un frame | gigante que se recorta contra el cielo azul |
| Música | curiosa y con pulso suave, sin batería fuerte; **≈ 6 dB** bajo la voz; 5–7 SFX/min | lenta y melancólica tipo caja de música, sin percusión; **≈ 6 dB** bajo la voz; 0–7 SFX/min; cambia a un tema triste con el giro |
| Metas de imagen (`comparar.py`) | luminancia ≈ 0,45–0,55, saturación ≈ 0,4 | luminancia ≈ 0,34–0,41, contraste ≈ 0,19–0,20, saturación ≈ 0,38–0,41, negros ≈ 1,5–2,5 %, calidez R−B ≤ 0,15 |

Lección del video de prueba: la primera versión salió **demasiado oscura, saturada y naranja** (luminancia 0,19,
saturación 0,77, 13,7 % de negros). La exposición y los colores de esta tabla ya están corregidos: no volver al
«todo sepia con niebla».

## Plantilla de guion (inglés, ≈ 430–650 palabras, frases de 3–14 palabras)

```
HOOK (0–3,5 s)        1. «[Every/We/Nobody] … [la regla].»              2. «[El costo concreto y visual].»
MUNDO (≈ 3–20 s)      3–8. cómo se vive con la regla: detalles concretos, un personaje del pueblo con nombre raro
                      (Wren, Brannock, Garrow), un cartel en el mundo que la recuerda, una cifra («Twelve squares so far»)
LA CRIATURA (≈ 20–30 s) cómo se anuncia (algo que cae / un ruido / el viento) → revelación a escala → un detalle inquietante
ANTECEDENTE (≈ 30–55 s) la vez que alguien rompió la regla sin querer (una sola vela) y qué pasó, en 6–9 frases cortas
LA TENTACIÓN (≈ 55–75 s) alguien cercano al narrador rompe la regla en secreto; la amenaza llega a su casa
DECISIÓN (≈ 75–100 s) el narrador hace algo físico, en frases de una acción cada una
GIRO (últimos ≈ 5 s)  la regla del arranque dada vuelta, en primera persona: «My whole life, I counted to two. Tonight, I'm the third lamp.»
```
`partes/frases.json`: `[{ "n": "nombre", "t": "texto", "gap": 0.1 }]`. Pausa 0,1 s por defecto; 0,3–0,7 s solo
donde la imagen tiene que respirar. Medir: palabras ÷ duración × 60 entre 245 y 287.

## Personajes (diseños propios de bloques)
- Constructor `kid()` de la plantilla de `reel-historias` (cuerpo por partes, cara pintada, pelo de una forma, ropa
  con textura). Prohibido: el protagonista de Volze (rubio en punta, cabeza y brazos blancos, torso azul), logos o
  marca de Roblox, cualquier asset del canal.
- Protagonista: silueta reconocible con 3 colores planos (ej.: pelo castaño despeinado, saco oliva `#55613a`,
  bufanda roja). Una hermana/amigo chico (escala 0,74), una vieja del pueblo con algo en las manos (bastón, farol),
  2–5 vecinos descartables.
- Caras: mínimas en lo serio (`neutral`, `worried`, `squint`, `scared`, `terrified`, `horrified`), exageradas en lo
  gracioso. Cambiar de cara en el momento fuerte de la frase.

## Cámara y luz (implementadas en el ejemplo)
- `SHOTS[I.frase] = [sh(palabra, p0, p1, mira0, mira1, fov), …]`: cada toma arranca en una **palabra** de
  `palabras.json`; la cámara se mueve de p0 a p1 todo el tiempo. Entre tomas del mismo lugar: barrido de 0,2 s con
  12 sub-cuadros de desenfoque (`window.SUBF`); entre lugares: corte duro (`LUGAR()`).
- `shF(palabra, personaje, d0, d1, ángulo, alto, fov)` encuadra la **cara** según hacia dónde mira el personaje (sirve
  también acostado). Usarlo para todos los primeros planos: los planos «a mano» terminaban en nucas y paredes.
- FOV: 66–82 en primeros planos (gran angular), 46–56 en planos abiertos y aéreos.
- Una sola luz dura con sombras (sol o luna) + relleno hemisférico + **hasta 7 luces puntuales** reubicadas por
  escena (`lights()`); las ventanas son emisivas con un brillo, sin luz propia. Bloom 0,55.
- Cuidado con lo que quema: luces puntuales a < 1 m de una cara, brillos aditivos cerca de cámara, luciérnagas.

## Subtítulos
`subV(t)` del ejemplo: Baloo 2 800, 112 px, `#fff200`, contorno negro de 22 % del tamaño, sombra abajo, minúscula,
entra con resorte (0,55 → 1), tiempos **reales** de cada palabra (whisper), texto del guion.

## Música (sintetizada en `partes/musica.js`, nunca canciones ajenas dentro del MP4)
- **Receta de la canción de fondo** (24-nov-2026): ganancia = dB(voz) − 6 − dB(canción) (medidos en RMS), y
  `ffmpeg -i video-sinmusica.mp4 -stream_loop -1 -i fondo-terror.mp3 -filter_complex "[1:a]volume=<g>dB,afade=t=in:d=0.3[m];[0:a][m]amix=inputs=2:duration=first:normalize=0,volume=0.96,alimiter=limit=0.9:level=false[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest salida.mp4`.
- **(Antes) el dueño pidió el video sin canción de fondo** (24-nov-2026, reemplazado por la canción de arriba): la entrega principal es **sin música**
  (voz + efectos). La música propia queda como opción: se entregan dos MP4 con el mismo video, con música y **sin música** (voz + efectos,
  `node render-gpu.mjs audio` → `salida/sin-musica.wav`, unido con `ffmpeg -c:v copy`). El dueño puede ponerle una
  canción con licencia desde la app de YouTube al subir (por ejemplo «Numbers» de Temporex). Nunca meter la
  canción adentro del archivo.
- Instrumentos que suenan bien: caja de música FM (moduladora 3,53× que se apaga en 0,6 s) y piano con 7 parciales
  desafinados de a pares + martillo. El seno puro sonaba sintético: el dueño lo rechazó.
- Forma como las pistas de terror del canal: piano lento con el acorde arpegiado y la melodía arriba, sin
  percusión, pad casi inaudible.
- Medir con `node render-gpu.mjs audio` + el cálculo de dB de abajo: voz − música ≈ **6 dB**, música audible 95–100 %.
- Terror: caja de música/celesta en menor, ≈ 64 por minuto, pad grave, piano; un tema propio para el grupo que canta;
  un zumbido grave que «respira» cuando la criatura está cerca (sin golpes); tema triste nuevo desde el giro, que no
  resuelve: el video corta con la última palabra.
- Día: ostinato curioso en mayor (pizzicato + celesta + bajo suave), ≈ 96–110 por minuto, sin batería fuerte.

## Pasos (con un solo pedido)
1. **Historia**: proponer 3 premisas originales (no repetir las de `ejemplo-terror/` ni las de Volze: ojo que parpadea,
   gigante que trepa, bola, filas, «It said hot», escaleras, fotos, polilla y lámparas), elegir una y justificar en 5
   líneas. Si la persona pidió «hacelo», seguir sin esperar.
2. **Carpeta** `<repo>/videos/<nombre>/`: copiar `motor/render-gpu.mjs` y `motor/package.json` a la raíz,
   `motor/armar.js` a `partes/`, y como punto de partida `ejemplo-terror/{historia.js, musica.js}` a `partes/`.
   `npm i` (instala playwright-core). Escribir `partes/frases.json`.
3. **Voz** (24-nov-2026: **ElevenLabs**, voz de biblioteca **«Skylar – Viral Zillennial Voice»**, filtros Male + Young; reemplazó a «Liam – Viral Short-Form
   Storyteller», que el dueño rechazó. Modelo Eleven v4, estabilidad 35 %, similitud 75 %, **sin Auto-tag** porque agrega `[whisper]`,
   `[sighs]`, etc.):
   - Generarla con Claude in Chrome en `elevenlabs.io/app/speech-synthesis/text-to-speech`, con la cuenta del dueño
     ya abierta. Pegar el guion entero (las frases de `voz.json` separadas por espacios), «Generate speech»,
     descargar la generación más corta y copiarla a `voz-eleven/completa.mp3`. Chrome tiene que tener permitidas
     las descargas múltiples de elevenlabs.io (ya habilitado).
   - Cortarla por frases: `python <skill>/herramientas/cortar_completo.py voz-eleven/completa.mp3 --tempo 1.45`.
     Alinea con whisper, corta en el último silencio antes de cada frase, acorta las pausas internas y acelera
     ×1,45 sin cambiar el tono, porque Skylar habla a ≈ 172 palabras por minuto y el canal a ≈ 260. Después correr `verif_voz.py` y `palabras.py`.
   - Si `cortar_completo.py` dice «SIN ALINEAR frase N», esa frase quedó pegada al final de la anterior y las
     siguientes se corren una (`verif_voz.py` lo muestra). Partir el WAV anterior con whisper en el silencio antes de
     la primera palabra de N y guardar `voz/NN.wav` (pasó con «Warm, under the dirt, like skin» en la tortuga).
   - Medición (`perfil_voz.py`, contra la voz de Volze aislada con Demucs: 172 Hz, rango 68 Hz): Skylar es la de ElevenLabs más
     parecida (151 Hz, rango 73 Hz, distancia 2,7). Más lejos: Liam Viral 4,2, Revenant 4,3, Mike Story 4,9,
     Mike POV 4,8, PJ 5,5, Snap 6,2. La más parecida medida es **Chatterbox** (gratis, local, en la GPU):
     `python <skill>/herramientas/voz.py` (motor por defecto), por si se acaban los créditos.
   **`musica.js` siempre propio**: el de `ejemplo-terror/` nombra frases de la polilla (`I.count`, `I.snow`…) y rompe el
   audio del render. Reescribirlo con los efectos de la historia nueva (ver `ejemplo-dia/musica.js`), aunque la entrega
   sea sin música; no repetir nombres de la página (`CH` ya existe).
4. **Escena**: reescribir en `historia.js` el mundo, el elenco, `SHOTS`, `LUGAR` y los `case` de `setScene`.
   `node partes/armar.js` (chequea sintaxis).
5. **Revisión barata + agente revisor (obligatorio, pedido del dueño 24-nov-2026)**: `node render-gpu.mjs tomas` →
   `salida/tomas-NN.jpg` (un cuadro del medio de cada toma). Lanzar el agente **`revisor-volze`** en modo `antes`
   (`agentes/revisor-volze.md`, instalado en `~/.claude/agents/`; si la sesión no lo tiene cargado, lanzar un agente
   general con «leé y seguí agentes/revisor-volze.md»). Compara contra frames reales del canal: estilo de los
   personajes, detalles, espacios vacíos y bugs visuales. Corregir lo de gravedad alta y media y volver a sacar solo
   esas tomas (`--lineas=8,13,40`). **Después del render**, el mismo agente en modo `despues` sobre el MP4; no se
   entrega hasta que diga «listo para entregar».
   **Personajes**: siempre pasarlos por `robloxify()` (en `ejemplo-terror/historia.js`): cabeza cubo redondeado sin
   cuello, cara impresa con ojos ovalados y cejas y boca gruesas, torso, brazos y piernas de un bloque. Así son los
   del canal; el estilo propio de `kid()` (mangas por partes, manos, cordones) no va.
6. **Música** y medición de audio (paso de abajo).
7. **Comparar con el canal**: `python <skill>/herramientas/comparar.py <tmp> salida/<video>.mp4` y llevar las medidas a
   la tabla del modo. Mirar 8 frames propios contra 8 del canal lado a lado y corregir las 3 diferencias más grandes.
8. **Render final por GPU** (sección de abajo) y verificación del MP4.
9. Entregar con `SendUserFile`; anotar la historia en `referencia/historias-hechas.md`; commit (el MP4 pesa
   ≈ 350 MB con CQ 19: no va al repo, queda en `salida/`, ignorado por git).
10. **Subir al canal RobloxStories** (pedido fijo del dueño, ver «Preferencias del dueño»): privado, con título y
    descripción; avisar el link de Studio.

Medición de audio:
```powershell
node render-gpu.mjs audio
```
```powershell
python -c "import numpy as np,soundfile as sf;db=lambda x:20*np.log10(np.sqrt(np.mean(x**2))+1e-9);v=sf.read('salida/solo-voz.wav')[0].mean(1);m=sf.read('salida/solo-musica.wav')[0].mean(1);print('voz-musica dB',round(db(v)-db(m),1))"
```

## Render con la GPU (RTX 4060, 8 GB)
- `nvidia-smi` primero: tiene que aparecer la RTX 4060 (driver probado: 566.03, CUDA 12.7).
- **WebGL por GPU**: Chrome sin ventana con `--use-angle=d3d11 --enable-gpu --ignore-gpu-blocklist`
  (`render-gpu.mjs info` tiene que decir «ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 … D3D11)»). Vulkan no hizo falta.
- **Concurrencia 3** (3 pestañas en paralelo): 2,9 GB de VRAM como máximo, muy lejos de los 8 GB.
- **NVENC**: `h264_nvenc -preset p5 -tune hq -rc vbr -cq 19 -b:v 0 -profile:v high`, 1080×1920, 60 fps, AAC 192 k.
  **Ojo**: el ffmpeg 9 de winget pide la API 13.1 de NVENC (driver ≥ 610). Con el driver 566 se codifica con el
  ffmpeg 7.1 de Remotion (`FFENC`, ya configurado en `render-gpu.mjs`). Si se actualiza el driver a ≥ 610 sirve el 9.
- **whisper** `large-v3` en CUDA float16 (faster-whisper + `nvidia-cublas-cu12` + `nvidia-cudnn-cu12`, las DLL se
  agregan con `os.add_dll_directory`); **Demucs** en CUDA (PyTorch cu128).
- Números medidos en esta PC: whisper 16,3 s GPU contra 184,6 s CPU (105 s de audio); Demucs 3,2 s contra 36,8 s;
  render del video de prueba (6.503 cuadros) en 214 s con GPU; el mismo tramo de 120 cuadros tardó 11,0 s con GPU
  contra 444,1 s con CPU (40×). Detalle en `volze-video/DECISIONES.md`.
- Verificar que la GPU se usó: `nvidia-smi --query-gpu=utilization.gpu,utilization.encoder,memory.used --format=csv -lms 500`
  durante el render (el script de la skill lo guarda en `salida/gpu_*.csv`).
- Si algo no anda en GPU: avisar y recién ahí usar CPU para esa parte (`--cpu` = SwiftShader + libx264).

```powershell
node render-gpu.mjs video salida/<nombre>.mp4 --conc=3 --sinmusica
```

## Checklist antes de exportar
- [ ] Título ≤ 5 palabras, sin hashtags ni «Roblox».
- [ ] Primera palabra en 0,0 s; la segunda oración (el costo) empieza antes de 3,5 s.
- [ ] 105–178 s y 245–287 palabras por minuto (`render-gpu.mjs info` da la duración).
- [ ] La última frase da vuelta la regla del arranque; el video termina 0,2–2 s después de la última palabra.
- [ ] Ningún personaje, música, logo ni asset de Volze o de Roblox; personajes propios.
- [ ] Hoja de tomas sin nucas, paredes, cámaras adentro de algo, cosas quemadas (blanco) ni negras.
- [ ] Subtítulos: texto del guion (no el de whisper: «Ren», «40»), amarillo, 75 %/22 %.
- [ ] Voz − música ≈ 6 dB (terror/día); música audible > 95 %; pico ≤ 0,97.
- [ ] `comparar.py` dentro de las metas del modo.
- [ ] `render-gpu.mjs info` dice RTX 4060; el MP4: h264, 1080×1920, 60 fps, AAC, duración = `DUR`.

## Archivos
- `motor/armar.js`: junta la plantilla de `reel-historias` (personajes, caras, ropa, voz por frases, grabador) con
  `historia.js` y `musica.js`, y aplica el estilo Volze (voz desde 0,0, sin fundidos, desenfoque variable, Baloo 2).
- `motor/render-gpu.mjs`: `info`, `hoja`, `tomas`, `audio`, `video` (GPU + NVENC).
- `ejemplo-terror/`: el video de la polilla completo (mundo, Polilla procedural, 52 frases, ~130 tomas, música).
- `herramientas/`: `voz.py`, `palabras.py`, `verif_voz.py`, `comparar.py` y los scripts del análisis del canal
  (`procesar.py`, `musica.py`, `cortes2.py`, `resumen.py`) para volver a medir si el canal cambia.
- `referencia/historias-hechas.md`: premisas ya usadas (no repetir).
