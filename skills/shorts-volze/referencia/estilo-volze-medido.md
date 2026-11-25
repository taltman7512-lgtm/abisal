# Estilo Volze medido cuadro a cuadro (25-nov-2026)

Segundo análisis del canal, pedido por el dueño: **todos los aspectos**, mirados a **30 cuadros por segundo** (y tramos
a 60) en los 22 videos bajados. Completa y corrige `analisis/informe.md`. Los segundos van como `rec01 @ 4,6`.

- Cuadros: `C:\Users\123\Documents\volze-fuentes\frames30\<id>\f%05d.jpg` (≈ 82.000 cuadros, 1,8 GB, fuera del repo).
- Planchas y datos de cada parte: `C:\Users\123\Documents\volze-fuentes\estudio\{personajes,criatura,camara,guion,arte,numeros}\`.
- Herramientas nuevas: `herramientas/tira.py` (plancha de cuadros seguidos), `herramientas/movimiento.py` (cámara con
  números), `herramientas/sonido_eventos.py` (golpes de sonido contra cámara y voz).
- Formatos: **pueblo/terror** = top02, top03, top05, top07, top10, rec01–rec06 (el que hacemos). **Comedia** = top01,
  top04, top08, top09. `top06` es de una etapa intermedia (mundo plano y saturado). **Bajo** = los 6 peores (etapa vieja).

## 0. Lo que cambia respecto de lo que creíamos

1. **Los videos son 3:4 (1440×1920), no 9:16.** Los 16 top y recientes vienen así; solo los «bajo» son 1080×1920.
   Nosotros rendereamos 1080×1920 (decisión del dueño; no se cambia sin preguntarle).
2. **No hay «barridos» sueltos: hay cuatro tipos de transición** (sección 4). Uno de cada cuatro es un **tapado**: la
   cámara se mete en un objeto, la pantalla queda de su color 2–6 cuadros y sale en otro lugar.
3. **La cámara dentro de cada encuadre se mueve 8 veces más que la nuestra** (24 % del ancho por segundo contra 3 %).
4. **Los personajes casi no se animan**: bloques rígidos, brazos en «A», gestos lineales de 8–15 cuadros, boca fija.
   La energía la pone la cámara.
5. **La criatura se mueve poco y lento**: un gesto por plano de 30–60 cuadros; no tiembla la cámara salvo en 1–2 golpes.
6. **El subtítulo en terror nunca sube**: siempre al 74,5 % del alto, aunque tape una cara. Entra al 128 % y baja
   lineal al 100 % en 0,13 s, sin rebote. Cero palabras resaltadas.
7. **La voz casi no hace pausas**: 12 % del tiempo callada; solo 34 de 10.101 huecos entre palabras llegan a 0,3 s.
8. **Los top de terror arrancan con la regla en presente**, no con la acción (eso es la comedia). En el cuadro 0 está
   la amenaza en primerísimo plano y el narrador entra antes de 1,0 s.
9. **Los top tienen un ser querido chico con nombre** (6 de 6) y la última línea habla de él; los recientes no (0 de 6).

## 1. Movimiento de los personajes (46 tramos en 16 videos)

- **Rig**: bloques rígidos tipo Roblox clásico, sin codos ni rodillas visibles, sin estirar ni aplastar (0 de 42).
  60 fps reales (0–0,4 % de cuadros repetidos). El desenfoque de movimiento hace de «elasticidad».
- **Pose base**: brazos rectos en «A», a 20–35° del cuerpo (12 de 14 quietos; `rec06 @ 81,0`, `rec02 @ 67,3`).
- **Caminata**: ciclo de **15 cuadros** a 30 fps (`rec05 @ 61,9`; ≈ 15 en `rec03 @ 100,0`; ≈ 11–12 en `rec04 @ 77,0`).
  Piernas ±25–30°, brazos casi sin balanceo (< 10°) en 5 de 7, balanceo lateral del torso ≈ 5° con rebote chico,
  sin inclinarse hacia adelante. Brazos doblados a 90° solo si cargan algo (`top10 @ 41,0`).
- **Corrida**: ciclo de **14–16 cuadros** (`top10 @ 141,2`, `top07 @ 94,6`), torso inclinado **15–25°** (6 de 8),
  brazos rígidos a los costados o apenas atrás (5 de 8); bombean a 90° solo en `top10 @ 141,2` y `top06 @ 19,5`.
  **Sin polvo ni estela en pueblo/terror** (0 de 6); sí en comedia (`top01 @ 0,7`, `@ 38,6`).
- **Quieto**: rígido; lo único vivo es un **parpadeo de 3–5 cuadros** (`rec06 @ 102,35`, `top07 @ 20,95`). Ningún
  personaje aguanta más de 1–1,5 s en cuadro: la cámara reemplaza al movimiento.
- **Gestos**: 6–15 cuadros, lineales, sin anticipación ni rebote (bajar el brazo de señalar ≈ 15, `rec03 @ 52,0`;
  cubrirse la cara ≈ 8, `rec01 @ 11,33`; patada ≈ 10, `rec04 @ 39,4`). Anticipación solo antes de saltar (se agacha
  ≈ 8 cuadros, `top05 @ 40,33`).
- **Agarrar**: no hay dedos; el objeto pasa a la mano en 1–2 cuadros (`top06 @ 14,30`) o va pegado al cuerpo.
- **Reacciones**: susto = cambio de cara + brazos que se abren ≈ 30° en 8–20 cuadros (`rec03 @ 93,0`). Caída = cuerpo
  tieso que vuelca en ≈ 16 cuadros (`top01 @ 1,03`). «Paso y congelar» = paso de 9 cuadros, 12 congelado (`top02 @ 16,9`).
- **Cabeza y cara**: la cabeza gira sola en 2 tramos; casi siempre gira el cuerpo entero. **La boca no se mueve al
  hablar** (0 de 42). La expresión cambia **de golpe, en 1–2 cuadros**, 1–3 cuadros antes de la palabra clave
  (`rec04 @ 77,73`). 4–5 caras por protagonista; 7 en total vistas (neutra, triste, susto, enojo con dientes, sonrisa,
  ojos cerrados, llanto con lágrima).
- **Arranques y frenadas**: no se ven. El personaje entra al plano ya en movimiento y el plano cambia antes de que
  frene (8 de 8 corridas).
- **Grupos**: 4–6 al frente, sincronizados (`top02 @ 16,9`, `top05 @ 40,6`); fondo parado y rígido mirando (4 de 6);
  masas de cientos con el mismo ciclo desfasado (`top07 @ 8,0`).
- No se pudo ver: si los pies patinan, trepar, empujar, usar herramientas en movimiento.

## 2. Movimiento de la criatura (12 videos de pueblo/terror)

- **Está en el cuadro 0 en 11 de 12**, en primerísimo plano (70–90 % del ancho), y la cámara se aleja a cuerpo entero
  en 10–40 cuadros (`top07 @ 0–1,3`, `rec06 @ 0–0,5`, `rec01 @ 0–0,3`).
- **Lenta y constante** (9 de 12): un gesto por plano, de **30–60 cuadros**, y el resto del cuerpo en pose.
  Paso cada ≈ 25 cuadros (`rec04 @ 77,1`); levanta el brazo en 48 (`top07 @ 109,3`); abre los dedos en ≈ 66
  (`rec03 @ 120,8`); pisada: el pie flota 48 cuadros, baja en 4–6, queda 18, sube en 8 (`rec06 @ 23,7`); parpadeo del
  ojo gigante: cierra en 4, cerrado ≈ 10, abre en 4 (`top02 @ 43,6`).
- **Partes**: esqueleto en 8 de 12 (dedos, ojos, cuello y brazos largos); cara rígida y sin boca que hable (8 de 8).
- **Aspecto**: ninguna es de bloques. Modelos esculpidos con un material reconocible y gastado: cuero rojo arrugado,
  bronce con verdín, cera chorreada, cromo que refleja el cielo, piedra veteada, iris con venas.
- **Contacto**: el violento se **tapa** con la mano, el pie o la bola llenando el cuadro, y después el objeto ya no
  está (6 de 6: `top03 @ 68,9`, `rec06 @ 25,4`, `rec01 @ 133,5`). El manso se muestra (`rec05 @ 105`).
- **Dos regímenes**: *hito* siempre visible detrás de los personajes (5 de 12; 31–70 % del tiempo en cuadro;
  `top02 @ 1–8`) o *visitante* (13–22 %; entradas de 1–3 s). De fondo queda en pose congelada.
- **Escala**: siempre contra casas o personas en el mismo cuadro (la persona al tobillo, `rec04 @ 77,5`; la bola de
  2–3 casas, `rec01 @ 1,0`).
- **Segunda criatura**: si la hay, se revela pasado el 65 % con un paneo de ≈ 18 cuadros (`top02 @ 94,7`).

## 3. Movimiento del mundo

- **Polvo en cada apoyo** de la criatura: aparece 4–6 cuadros después y dura 0,9–2,5 s (`rec06 @ 25,6`, `rec01 @ 133,9`).
- **Escombros** (40–80 trozos que giran) solo en 2 de 12 videos y en 1–2 golpes (`rec01 @ 0,5`). En el resto las
  cosas desaparecen sin física (`rec02 @ 88`).
- **Temblor de cámara**: medido en 14 golpes; oscilante en 3 (10–12 cuadros, ±3–4 % del ancho, decae: `rec01 @ 0,53`,
  `rec02 @ 85,47`), un sacudón en 1, **nada en 10**. El golpe se vende con paneo y polvo.
- **Partículas grandes** en 10 de 12 videos pero en el 2–7 % del tiempo (lluvia 25 % en `top02`). Motas finas en
  interiores. Humo de chimenea, banderines y nubes de ambiente.
- **Utilería que se mueve** en 12 de 12: palancas, ruedas, sogas, campanas, portones, luces que cambian en 1–2 cuadros.

## 4. Cámara (128 encuadres clasificados + medidor en los 22 videos)

Medianas del medidor (`movimiento.py`):

| Medida | Pueblo/terror (11) | Comedia (4) | Nuestros (pinos v4 / tortuga v4 / anguila) |
|---|---|---|---|
| Cambios de encuadre por minuto | 35 (21–54) | 32 | 35 / 43 / 38 |
| «Cortes» por minuto (casi todos son tapados) | 9,5 | 6,1 | 0 / 0 / 1,2 |
| Duración de la transición | 0,32 s | 0,20 s | 0,23 / 0,13 / 0,23 s |
| Duración del encuadre (mediana / p75 / máx.) | 0,93 / 2,1 / 7,5 s | 1,2 / 2,4 / 6,7 s | 1,37 / 2,0 / 4,1 s |
| **Velocidad de la cámara dentro del encuadre** (% del ancho por s) | **23,6** | 13,6 | **3,0 / 1,6 / 2,9** |
| Empuje (zoom, % por s) | +8,3 | +21,8 | +4,4 / +8,8 / +12,0 |
| Encuadres quietos | 0 % | 0 % | 0 / 0 / 3 % |
| Temblor (% del ancho entre cuadros) | 0,19 | 0,15 | 0,02 / 0,01 / 0,02 |
| **Movimiento que no es de cámara** (% del ancho por s) | **43** | 35 | **10,8 / 4,0 / 9,5** |

- **Tipos de plano**: general o aéreo 29 %, entero 24 %, medio 19 %, detalle de objeto 15 %, primer plano de la
  criatura 5 %, **primer plano humano 4 %**, por encima del hombro 2 %, subjetivo 2 %.
- **Ángulo**: picado 37 %, contrapicado 32 %, altura de ojos 30 %, cenital 1 %.
- **Tamaño**: en plano entero el personaje ocupa ≈ **22 % del alto** (8–70), centrado, en la mitad inferior, con
  60–85 % de fondo con fuga y cielo. En plano medio, busto al 45 %, contrapicado, cabeza por encima del subtítulo.
- **Dentro del encuadre** la cámara nunca está quieta (≈ 2 %): empuje hacia adelante (el más común), retroceso,
  órbita o seguimiento. Entra ya en movimiento y sigue derivando; no arranca de cero.
- **Transiciones** (88 clasificadas en `rec01` y `rec02`):
  - **Vuelo** a otra posición, 33 %: 8–27 cuadros a 30 fps, poco desenfoque, por arriba de los techos, por la calle,
    zambullida de aéreo a personaje (`rec01 @ 3,07`, `@ 18,4`, `@ 50,4`). Une lugares lejanos sin cortar.
  - **Barrido** en el lugar, 27 %: 6–9 cuadros, desenfoque medio, frena en 2–4 cuadros, sin rebote (`rec02 @ 29,47`).
  - **Tapado** por objeto, 25 % (≈ 11 por minuto): la cámara entra en la bola, un bloque, una bandera o una silueta
    que cruza; 2–6 cuadros de ese color plano con viñeta; el plano nuevo sale ya en movimiento (`rec01 @ 4,6–5,0`,
    `rec02 @ 6,67`, `@ 13,67`).
  - **Reencuadre continuo** sin transición, 14 % (`rec01 @ 22,3`).
  - **Corte limpio**, 1 %. Otros videos cortan más (`top06` 25 por minuto; `top02` 3 en el final).
- **Ritmo**: 9–14 cambios en los primeros 10 s y ≈ 8 cada 10 s después en los recientes; `top02` y `top10` van a la
  mitad (encuadre mediano de 2–2,7 s). Planos largos: diálogo de 3–8 s con reencuadres (`rec01 @ 20,9–29,6`), un viaje
  único de 8,5 s (`rec03 @ 23,5–32`), el cierre (`top02 @ 136,2–141`).
- **Cada 15–20 s**, un aéreo del mundo entero de 1,2–1,7 s.
- **Lente**: gran angular con deformación en la criatura (`rec01 @ 0,4`); foco profundo en los recientes; viñeta suave;
  bloom en luces nocturnas.
- **Criatura**: contrapicado angular con el protagonista al 18–25 % en primer término (`rec01 @ 0,5`, `rec05 @ 0,6`),
  o a ras del suelo en su camino hasta que tapa el lente (`rec01 @ 52,8`). Cuadro final: protagonista abajo y
  amenaza detrás (`rec01 @ 142,5`).
- **Quien corre**: picado 3/4 de frente con la cámara retrocediendo (`rec02 @ 56,3`), de costado o de atrás.
- **Interiores**: entra por tapado (`rec01 @ 5,07`), sale atravesando un muro (`rec01 @ 61,6`) o por corte. No se vio
  entrar por puerta ni ventana.

## 5. Sincronía voz–imagen (66 frases en 8 videos)

- **El encuadre cambia con la primera palabra de la frase**: 84 % de los cortes duros y 53 % de todos los cambios
  caen a ±6 cuadros de un inicio de frase.
- **La cosa nombrada ya está en pantalla ≈ 12 cuadros antes de la palabra** (p25 −32, p75 −2); nunca llega más de 8
  cuadros después. Las acciones pegan en el verbo ±3 cuadros (`top02 @ 3,3`, `top03 @ 33,0`).
- **Una frase, un encuadre** (mediana): 68 % de las frases vive en un solo encuadre.
- **Frases abstractas** (29 casos): nunca texto ni negro. Cara del narrador (6), objeto-prueba o cartel (6), criatura
  (5), secundario con un gesto (5), aérea del mundo (4), multitud cumpliendo la regla (3).
- **Diálogos citados** (12): se ve al que habla en 11, de frente, con un gesto de brazo en 8; boca fija; cuando
  contesta el narrador, el encuadre cambia a él.
- **Cifras**: en 8 de 16 están dentro del mundo (cartel «DAY 19» en `top02 @ 27,5`, marcas talladas, 10 fotos en
  fila); cero contadores, flechas o interfaz en terror.
- **Cuadro 0**: amenaza en primerísimo plano en 9 de 12, narrador en cuadro antes de 1,0 s en 10 de 12. Sin placa
  final en 16 de 16. Último cuadro típico: protagonista abajo, criatura detrás.

## 6. Subtítulos (medido en ≈ 69.000 cuadros)

- **Una sola palabra siempre**, en minúscula (también «i» y los nombres), **sin puntuación** (solo apóstrofo, guion y
  «:» de hora). Cantidades en letras; años, horas y códigos en cifras.
- **Un solo color**: amarillo. 0 % de palabras resaltadas o más grandes.
- **Entrada**: nace al **128 %** y baja **lineal** al 100 % en **8 cuadros de 60 (0,13 s)**; sin rebote ni giro.
- **Posición**: terror 100 % al **74,5 %** del alto (a veces tapa caras: `rec03 @ 0,5`); comedia sube al 22 % en el
  20–56 % de los cuadros, cuando la acción está abajo.
- Los cuadros 0–2 van sin subtítulo; la primera palabra aparece en el cuadro 3. Se apaga en silencios de ≥ 0,5 s.
- **Carteles del mundo**: 0–3 por video en terror, serif en mayúsculas sobre madera, llenan 30–60 % del ancho y el
  clave se lee textual ≈ 2 s (`rec05 @ 25,6–32`). Comedia: 8–14 por video.

## 7. Guion (16 transcripciones)

| Parte | Segundo (mediana) | % del video |
|---|---|---|
| Regla | 0 | 0 |
| Costo («Whoever…») | 3,1 | 2 |
| «This morning / Tonight…» | 7,9 | 5 |
| Criatura presentada | 10,9 | 8 |
| Vida con la regla (bodas, bebés, dormir) | 13,7 | 10 |
| Personaje cercano con nombre | 38 | 26 |
| Antecedente (alguien la rompió) | 43 | 30 |
| Decisión del narrador | 70 | 48 |
| Clímax | 100 | 69 |
| Giro | 127 | 87 |

- **Frases**: mediana 6 palabras (p10 2,5, p90 10); un tercio de ≤ 4 palabras. Pausa entre frases 0,14 s. Las pocas
  pausas largas (0,5–1,2 s) caen justo antes de una revelación (`top05 @ 118,2`, `@ 136,8`).
- **Nombres**: 1–6 por video, cortos e inventados (Mo, Bo, Bee, June, Tilda, Old Dez); el narrador nunca tiene nombre.
- **Cifras**: 12–35 por video (mediana 20).
- **Estribillo** en 12 de 12: una frase corta que vuelve 3 veces o más («Now?», «Race you», «Colder / Warmer»).
- **Primera frase**: comedia = acción en primera persona en pasado (4 de 4); terror top = regla o amenaza en presente
  (6 de 6); recientes = mitad regla, mitad incidente.
- **Última frase**: da vuelta la regla en 5; remate en 6; eco emotivo en 2; abierta en 3. 9 de 10 top comparten una
  palabra clave entre los primeros 8 s y los últimos 10 s (bucle).
- **Lo que tienen los top y no los recientes**: ser querido chico con nombre y muletilla (6 de 6 contra 0 de 6); costo
  con «Whoever…» en la segunda frase (5 de 6 contra 1 de 6); la regla aplicada a rituales universales antes de los
  25 s (4 de 6 contra 1 de 6); giro «cósmico» (la criatura no era lo que creíamos, o el narrador pasa a serlo) en vez de
  «el pueblo traiciona al narrador».

## 8. Voz y sonido

- **Voz**: callada solo el 12 % del tiempo; cero pausas de más de 0,4 s en 6 de 8 videos medidos.
- **Golpes de sonido** en la pista sin voz (`sonido_eventos.py`): solo el 15–23 % de los cambios de cámara tiene un
  golpe cerca (±0,15 s). En terror **no hay un «whoosh» por barrido**. Solo el 1–13 % de los golpes cae en una pausa
  de la voz: el sonido va debajo de la voz, no en los huecos.
- Límite: el detector cuenta también notas agudas de la música (31–47 «golpes» por minuto), así que el total no sirve
  como cantidad de efectos; vale el dato anterior de 0–7 efectos fuertes por minuto.

## 9. Personajes (diseño)

| Medida (14 personajes) | Mediana | Rango |
|---|---|---|
| Alto total sin pelo | 4,5 cabezas | 4,2–4,8 |
| Ancho de cabeza / ancho de torso | 0,65 | 0,59–0,68 |
| Alto / ancho de cabeza | 0,85 | 0,78–1,0 |
| Torso ancho / alto | 1,0 | 0,93–1,05 |
| Piernas / alto del torso | 0,95 | 0,82–1,07 |
| Brazo / alto del torso | 1,05 | 1,0–1,2 |
| Ancho de brazo / ancho de torso | 0,42 | 0,40–0,45 |

- Cabeza de caja muy redondeada, sin cuello (14 de 14). Sin manos ni pies separados (13 de 14): el último 25–35 % del
  brazo va en color piel y el zapato es una franja de ≈ 8 % de la pierna.
- **Cara** pintada plana, sin nariz: ojos de óvalo negro vertical (7–10 % × 12–18 % de la cabeza, separados ≈ 18 %),
  cejas de línea fina, boca en arco de ≈ 35 % del ancho.
- **Pelo** de malla facetada de un color; como mucho un accesorio 3D chico por secundario (anteojos, sombrero, gorra).
- **Ropa** de color plano con dibujo pintado (cuadros, botones, escudo); casi sin volumen.
- **Paleta**: el protagonista es el único con cabeza clara y el color más saturado del plano; cada secundario lleva
  un color apagado (familia `#82705A`, `#A2A497`, `#576371`); la multitud usa el «uniforme» del pueblo.
- **Elenco**: 4–7 caras con rol por video, 2 por plano de mediana. Viejos = mismo cuerpo con canas, cejas caídas y
  anteojos, sin arrugas. Chicos = el mismo modelo a escala 0,88 o menos.

## 10. Mundo

- **Un mundo-gimmick por video con 3–5 rincones**; ≥ 90 % exterior en 9 de 11.
- Pueblo compacto (≈ 60 casas) y **mundo imposible** en 6 de 11 (pared vertical, ojo colgado, gradas en un cañón).
  El horizonte siempre tiene algo: llanura con bruma, montañas nevadas, niebla, estepa. Nunca vacío.
- Arquitectura medieval europea en 8 de 11: piedra irregular, revoque descascarado, entramado, tejas; todo gastado y
  cada casa distinta.
- **Utilería por plano**: mediana ≈ 12 objetos (2–35); interiores 6–20. Ninguna superficie lisa grande. Piso con
  relieve en 11 de 11.
- Cielo con cúmulos volumétricos; agua con reflejo solo en `top10`; árboles detallados lejos y arbustos facetados.

## 11. Luz y color (1 cuadro por segundo, sin la franja del subtítulo)

| Formato | Luminancia (0–255) | Contraste | Saturación | Negros | Quemados | R−B |
|---|---|---|---|---|---|---|
| Pueblo/terror (11) | 121 | 53 | 34 % | 5,5 % | 1,1 % | +21 |
| Comedia (4) | 138 | 45 | 45 % | 0,6 % | 0,2 % | +50 |
| Bajo (6) | 107 | 62 | 37 % | 8,3 % | 0,5 % | +5 |

- Base del pueblo: `#AF9D87`, `#85715B`, `#534434`, cielo `#D0D1CC`. El pueblo es **poco saturado**; la saturación la
  ponen el protagonista y la criatura.
- **Día en 8 de 11**; la luz **cambia 2–4 veces por video** (10 de 11): noche para «dormir» o el recuerdo, y el último
  acto más oscuro (−25 % de luminancia) o más cálido (R−B > +40).
- Sol bajo, lateral o de atrás, con sombras duras y largas; caras muchas veces en sombra con borde iluminado.
  Faroles, ventanas y velas que iluminan de verdad (charco de luz en el piso, `rec03 @ 24`).
- Bruma de distancia en todos los exteriores; rayos con polvo en interiores; bloom moderado.

## 12. Lo que contradice un pedido del dueño (mandan los pedidos del dueño)

| Volze hace | El dueño pidió | Qué hacemos |
|---|---|---|
| Tapados: la cámara atraviesa objetos y cuerpos (25 % de las transiciones) | Que las transiciones no atraviesen nada | No atravesar. Se puede **tapar** con algo que cruza por delante del lente (una bandera, la criatura, humo), sin meterse adentro |
| Primer plano humano en el 4 % de los encuadres | Sin primeros planos | Ninguno; plano medio contrapicado en su lugar |
| Ropa plana con dibujo pintado, pelo de un color, viejos sin arrugas | Ropa con tela y relieve, pelo con mechones, viejos con arrugas, ultradetalle en todo | Lo del dueño |
| Subtítulo que a veces tapa caras | (el revisor lo marca como bug) | Mantener al 74,5 % y encuadrar la cabeza por encima |
| 3:4 (1440×1920) | 1080×1920 | 1080×1920 hasta que el dueño decida |
| Sin polvo al correr en terror | Corridas con polvo en los pies | Polvo suave (lo pidió el dueño) |
