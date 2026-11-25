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
- **Formato 3:4 como Volze (25-nov-2026, lo decidió el dueño al ver la medición)**: los videos se hacen en
  **1440×1920 a 60 fps**, igual que los 16 top y recientes del canal (antes 1080×1920). `motor/armar.js` ya lo fija
  (`?v916` en la URL vuelve a 1080×1920) y las hojas de `render-gpu.mjs` salen en 3:4. El campo vertical es el mismo y
  se ve un tercio más a los costados: encuadrar pensando en ese ancho.
- **Calidad (24-nov-2026)**: siempre a 60 fps y **más detalle** que el mínimo: utilería en cada rincón,
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
  - **Corridas como las de Volze** (medidas el 25-nov-2026: ciclo de 14–16 cuadros, torso inclinado 15–25°, brazos
    rígidos apenas hacia atrás; ver «Movimiento, cámara y sincronía»).
  - **Arranque como Volze** (25-nov-2026). **Corregido con la segunda medición**: la primera frase en acción y en
    primera persona es de la **comedia** (4 de 4); los **top de terror** arrancan con la **regla o la amenaza en
    presente** (6 de 6: «We only move when the eye blinks.») y la segunda frase es el costo con «Whoever…»; recién a
    los 5–8 s viene «This morning / Tonight…». Los recientes mezclan (3 de 6 arrancan con el incidente). Para terror
    usar la regla en presente con la amenaza ya en el cuadro 0; el arranque en acción queda para la comedia o si el
    dueño lo pide para un video. Lo que se había anotado: la primera frase es
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
   imagen que ya se mueve. Sin silencio, logo ni plano de ambientación. **En el cuadro 0 está la amenaza en
   primerísimo plano** (70–90 % del ancho) y el narrador entra en cuadro antes de 1,0 s.
3. **Un gimmick visual que se entiende en un frame** (algo gigante, altísimo o multitudinario que ilustra la regla).
4. **Un solo narrador en primera persona, rápido**: 245–287 palabras por minuto (mediana 260), diálogos citados por la
   misma voz. **Duración 105–178 s** (≈ 430–650 palabras).
5. **Giro en los últimos ≈ 5 s que retoma la regla del arranque y la da vuelta.** El video termina 0,2–2 s después de
   la última palabra: sin cierre, sin pantalla final (bucle).
6. **Contraste de tres niveles**: personajes de bloques propios / mundo con texturas reales / criatura u objeto
   gigante, detallado y no cuadrado.
7. **Cámara siempre en movimiento, también dentro de cada encuadre**: deriva ≈ 24 % del ancho por segundo con empuje
   hacia adelante, y cambia de encuadre cada ≈ 0,9 s (35 por minuto; 9–14 cambios en los primeros 10 s). Las
   transiciones son de cuatro tipos (vuelo, barrido, tapado y reencuadre; ver «Movimiento, cámara y sincronía»).
   Reparto de planos: 30 % general o aéreo, 25 % entero, 20 % medio, 15 % detalle; contrapicado a la amenaza.
8. **Subtítulo de una palabra** con salto de escala: minúscula, amarillo **#FFF200**, contorno negro grueso,
   **fijo al 74,5 % del alto** (en terror nunca sube; el 22 % es solo de la comedia), sin puntuación, un solo
   color, altura de x ≈ 3 % del alto.
9. **Música debajo de la voz todo el video**, según el modo (tabla de abajo). Nunca la música del canal.
10. **Luz de una fuente dura, bruma lejana, profundidad de campo y desenfoque de movimiento.** Los carteles del mundo
    hacen la exposición (ej.: «TWO LAMPS. ALWAYS.» pintado en el pozo).

## Movimiento, cámara y sincronía (medido a 30 cuadros por segundo, 25-nov-2026)
Segundo análisis del canal, aspecto por aspecto, con los 22 videos a 30 cuadros por segundo. El detalle, los números
y los ejemplos con segundo están en **`referencia/estilo-volze-medido.md`: leerlo antes de animar**. Esto reemplaza
cualquier cosa de más abajo que diga lo contrario. Donde Volze choca con un pedido del dueño, manda el dueño (tabla
al final de la referencia).

**Personajes** (casi no se animan; la energía la pone la cámara)
- Bloques rígidos, sin codos ni rodillas, sin estirar ni aplastar. Pose base: brazos rectos en «A» a 20–30°.
- Caminata: ciclo de **15 cuadros** (a 30 fps), piernas ±25–30°, brazos ±5–10°, torso con balanceo lateral de ±5°,
  sin inclinarse. Tiene que avanzar (pedido del dueño).
- Corrida: ciclo de **14–16 cuadros** (`correr()` ya da 14,5), torso inclinado **15–25°**, brazos rígidos apenas hacia
  atrás; bombeo a 90° solo en el plano clave. Volze no pone polvo en terror; el dueño lo pidió: polvo suave.
- Quieto: rígido, con **un parpadeo de 4 cuadros por plano**. Nadie queda más de 1,5 s en cuadro sin que cambie el
  encuadre.
- Gestos: **8–15 cuadros, lineales**, sin rebote. Anticipación (agacharse 8 cuadros) solo antes de saltar.
- Objetos pegados a la mano o al pecho; el «agarre» se resuelve en 1–2 cuadros.
- Cara: **boca fija** (nadie mueve los labios, tampoco en los diálogos); la expresión cambia **de golpe, en 1–2
  cuadros**, 1–3 cuadros antes de la palabra clave. 4–5 caras por personaje.
- Entrar al plano ya en movimiento y cambiar de plano antes de frenar.
- Grupos: 4–6 al frente sincronizados, fondo parado mirando, masas con el mismo ciclo desfasado.

**Criatura**
- En el **cuadro 0**, en primerísimo plano; alejarse a cuerpo entero en 10–40 cuadros.
- **Un gesto por plano, de 30–60 cuadros, a velocidad constante**; el resto del cuerpo en pose. Paso pesado cada
  25–30 cuadros. Pisada: flotar ≈ 48 cuadros, bajar en 4–6, apoyar ≈ 18, subir en 8. Parpadeo: 4 cerrar, ≈ 10 cerrado,
  4 abrir. Cara rígida: se mueven ojos, párpado, dedos y cuello.
- El contacto violento **se tapa** con su cuerpo llenando el cuadro; después polvo y el objeto ya no está.
- **Polvo en cada apoyo** (aparece 4–6 cuadros después, dura 0,9–2,5 s). Escombros (40–80 trozos) y **temblor de
  cámara** (10–12 cuadros, ±3–4 % del ancho, decayendo) solo en 1–2 golpes grandes por video; en el resto, paneo.
- Elegir régimen: **hito** visible detrás de los personajes el 30–70 % del tiempo, o **visitante** el 13–22 % con
  entradas de 1–3 s. Siempre con casas o personas en el mismo cuadro para la escala.

**Cámara** (medir con `herramientas/movimiento.py`; metas del formato pueblo/terror)
- Dentro del encuadre: **13–30 % del ancho por segundo** de deriva (nosotros veníamos en 1,6–3 %: es la diferencia
  más grande con el canal) y empuje de +3 a +11 % por segundo. 0 % de encuadres quietos. El encuadre entra ya en
  movimiento.
- Encuadre: 0,6–0,9 s de mediana, con planos largos de 3–8 s para diálogos y para el cierre. Cada 15–20 s, un aéreo
  del mundo entero de 1,2–1,7 s.
- Plano entero: personaje al **20–25 % del alto**, centrado, mitad inferior, ≥ 60 % de fondo con fuga y cielo. Plano
  medio: busto al 45 %, contrapicado, cabeza por encima del subtítulo. Sin primeros planos (dueño).
- Transiciones, mezcladas: **vuelo** a otra posición (1 de cada 3; 8–27 cuadros, poco desenfoque, por arriba de los
  techos o por la calle), **barrido** en el lugar (6–9 cuadros, frena en 2–4, sin rebote), **tapado** (≈ 10 por
  minuto en Volze: algo llena el lente 2–6 cuadros y se sale en otro lugar; nosotros lo hacemos con algo que **cruza
  por delante** del lente, sin atravesar nada) y **reencuadre continuo**. Cortes limpios: ≤ 1 por minuto.
- Criatura: contrapicado angular con una persona al 18–25 % en primer término, o avanzando hasta tapar el lente.
  Quien corre: picado 3/4 de frente con la cámara retrocediendo. Cuadro final: protagonista abajo, amenaza detrás.
- Movimiento que no es de cámara: Volze ≈ 43 % del ancho por segundo, nosotros 4–11 %. En cada plano tiene que
  moverse algo además de la cámara (gente, criatura, humo, banderas, partículas).

**Sincronía con la voz**
- **Cambiar de encuadre en la primera palabra de cada frase** (±6 cuadros); una frase, un encuadre.
- La cosa nombrada tiene que estar en pantalla **≈ 12 cuadros antes** de la palabra y nunca más de 8 después. Las
  acciones pegan en el verbo (±3 cuadros).
- Frase abstracta: cara del narrador, objeto-prueba, criatura, un secundario con un gesto o un aéreo. Nunca texto.
- Diálogo citado: plano del que habla, de frente, con un gesto de brazo; cuando contesta el narrador, encuadre a él.
- Cifras dentro del mundo (carteles, marcas, objetos contables). Sin contadores, flechas ni emojis.
- Voz casi sin pausas (callada ≈ 12 % del tiempo): 2–3 silencios de 0,5–1,2 s, solo justo antes de una revelación.
- Sonido: en terror no va un «whoosh» por barrido (solo 15–23 % de los cambios de cámara tienen golpe).

**Luz**: 2–4 cambios de luz por video (noche para «dormir» o el recuerdo; último acto más oscuro o más cálido).
Pueblo poco saturado (≈ 34 %); el color fuerte lo llevan el protagonista y la criatura.

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

## Plantilla de guion (inglés, ≈ 430–650 palabras, frases de 6 palabras de mediana, un tercio de ≤ 4)

Tiempos medidos en los 12 de terror (mediana, % del video): regla 0 %, costo 2 %, «This morning / Tonight…» 5 %,
criatura 8 %, vida con la regla 10 %, personaje cercano 26 %, antecedente 30 %, decisión 48 %, clímax 69 %, giro 87 %.
Lo que tienen los top y no los recientes: **un ser querido chico con nombre corto** (Mo, Bee, June) antes del 30 %,
con una muletilla que vuelve en la última línea; el costo dicho con **«Whoever…»**; la regla aplicada a **bodas,
bebés, dormir o la escuela** antes de los 25 s; un **estribillo** que vuelve 3 veces; 12–35 cifras; y un giro en el
que la criatura no era lo que creíamos o el narrador pasa a serlo. La última frase repite palabras de las dos
primeras (bucle).

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
`partes/frases.json`: `[{ "n": "nombre", "t": "texto", "gap": 0.1 }]`. Pausa 0,1–0,15 s por defecto (Volze: 0,14 s de mediana y
casi ninguna de más de 0,3 s); 0,5–1,2 s solo 2–3 veces, justo antes de una revelación. Medir: palabras ÷ duración × 60 entre 245 y 287.

## Personajes (diseños propios de bloques)
- Constructor `kid()` de la plantilla de `reel-historias` (cuerpo por partes, cara pintada, pelo de una forma, ropa
  con textura). Prohibido: el protagonista de Volze (rubio en punta, cabeza y brazos blancos, torso azul), logos o
  marca de Roblox, cualquier asset del canal.
- Protagonista: silueta reconocible con 3 colores planos (ej.: pelo castaño despeinado, saco oliva `#55613a`,
  bufanda roja). Una hermana/amigo chico (escala 0,74), una vieja del pueblo con algo en las manos (bastón, farol),
  2–5 vecinos descartables.
- Caras: mínimas en lo serio (`neutral`, `worried`, `squint`, `scared`, `terrified`, `horrified`), exageradas en lo
  gracioso. Cambiar de cara **de golpe (1–2 cuadros), 1–3 cuadros antes** de la palabra fuerte. La boca no se mueve
  al hablar.
- Proporciones medidas en Volze (14 personajes): 4,5 cabezas de alto; torso cuadrado 1 × 1; cabeza 0,65 del ancho
  del torso y 0,85 de alto/ancho, sin cuello; piernas 0,5 de ancho y ≈ 1 de alto, pegadas; brazos 0,42 × 1,05; ojos
  de óvalo negro de 8 % × 15 % de la cabeza, separados 18 %; boca en arco de 35 %. Chicos: el mismo modelo a 0,88 o
  menos. En un grupo, el protagonista es el de cabeza más clara y color más saturado.

## Cámara y luz (implementadas en el ejemplo)
- `SHOTS[I.frase] = [sh(palabra, p0, p1, mira0, mira1, fov), …]`: cada toma arranca en una **palabra** de
  `palabras.json`; la cámara se mueve de p0 a p1 todo el tiempo, y ese recorrido tiene que dar **13–30 % del ancho
  por segundo** en pantalla (medirlo con `movimiento.py`; con recorridos cortos quedaba en 2–3 %). Entre tomas: vuelo,
  barrido o algo que cruza por delante del lente (ver «Movimiento, cámara y sincronía»), con sub-cuadros de desenfoque
  (`window.SUBF`). Nada de corte duro entre lugares.
- `shF(palabra, personaje, d0, d1, ángulo, alto, fov)` encuadra la **cara** según hacia dónde mira el personaje (sirve
  también acostado). Usarlo para todos los primeros planos: los planos «a mano» terminaban en nucas y paredes.
- FOV: gran angular (66–82) para la criatura en contrapicado y para planos medios cercanos; 46–56 en planos
  abiertos y aéreos. Sin primeros planos de caras (dueño).
- Una sola luz dura con sombras (sol o luna) + relleno hemisférico + **hasta 7 luces puntuales** reubicadas por
  escena (`lights()`); las ventanas son emisivas con un brillo, sin luz propia. Bloom 0,55.
- Cuidado con lo que quema: luces puntuales a < 1 m de una cara, brillos aditivos cerca de cámara, luciérnagas.

## Subtítulos
`subV(t)` del ejemplo: Baloo 2 800, 112 px, `#fff200`, contorno negro de 22 % del tamaño, sombra abajo, minúscula,
tiempos **reales** de cada palabra (whisper), texto del guion. Medido en Volze: **nace al 128 % y baja lineal al
100 % en 0,13 s** (8 cuadros de 60), sin rebote ni giro; una sola palabra, sin puntuación (solo apóstrofo y guion),
cantidades en letras, un solo color, nada resaltado; fijo al 74,5 % del alto; los cuadros 0–2 van sin subtítulo y se
apaga en silencios de ≥ 0,5 s. El resorte desde 0,55 que usábamos no es de Volze.

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
- **NVENC**: `h264_nvenc -preset p5 -tune hq -rc vbr -cq 19 -b:v 0 -profile:v high`, 1440×1920, 60 fps, AAC 192 k.
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
- [ ] Subtítulos: texto del guion (no el de whisper: «Ren», «40»), amarillo, fijo al 74,5 %, sin puntuación,
      entrada 128 % → 100 % en 0,13 s.
- [ ] `movimiento.py salida/<video>.mp4`: deriva dentro del encuadre ≥ 13 % del ancho por segundo, 0 % de encuadres
      quietos, encuadre mediano ≤ 1,0 s, movimiento que no es de cámara ≥ 30 %.
- [ ] Cada encuadre cambia en la primera palabra de su frase; lo nombrado está en pantalla antes de la palabra.
- [ ] La criatura está en el cuadro 0 y el narrador entra antes de 1,0 s; cuadro final con el protagonista abajo y la
      amenaza detrás.
- [ ] Hay un ser querido con nombre, un estribillo que vuelve 3 veces y 2–4 cambios de luz.
- [ ] Voz − música ≈ 6 dB (terror/día); música audible > 95 %; pico ≤ 0,97.
- [ ] `comparar.py` dentro de las metas del modo.
- [ ] `render-gpu.mjs info` dice RTX 4060; el MP4: h264, 1440×1920 (3:4), 60 fps, AAC, duración = `DUR`.

## Archivos
- `motor/armar.js`: junta la plantilla de `reel-historias` (personajes, caras, ropa, voz por frases, grabador) con
  `historia.js` y `musica.js`, y aplica el estilo Volze (voz desde 0,0, sin fundidos, desenfoque variable, Baloo 2).
- `motor/render-gpu.mjs`: `info`, `hoja`, `tomas`, `audio`, `video` (GPU + NVENC).
- `ejemplo-terror/`: el video de la polilla completo (mundo, Polilla procedural, 52 frases, ~130 tomas, música).
- `herramientas/`: `voz.py`, `palabras.py`, `verif_voz.py`, `comparar.py` y los scripts del análisis del canal
  (`procesar.py`, `musica.py`, `cortes2.py`, `resumen.py`) para volver a medir si el canal cambia.
- `referencia/historias-hechas.md`: premisas ya usadas (no repetir).
- `referencia/estilo-volze-medido.md`: el análisis cuadro a cuadro del canal (movimiento de personajes y criatura,
  mundo, cámara, sincronía, subtítulos, guion, sonido, diseño, luz), con números, ejemplos y la comparación con
  nuestros videos.
- `herramientas/movimiento.py` (cámara con números: deriva, empuje, transiciones, temblor), `herramientas/tira.py`
  (plancha de cuadros seguidos a 30/15/10 por segundo para mirar movimiento) y `herramientas/sonido_eventos.py`
  (golpes de sonido contra cambios de cámara y pausas de la voz).
