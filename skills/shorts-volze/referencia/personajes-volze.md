# Cómo son los personajes y las caras de Volze (descripción para construirlos)

Mirado de cerca el 25-nov-2026 en cuadros a tamaño completo (`rec06 @ 81`, `rec03 @ 21`, `rec03 @ 52`, `rec04 @ 32`,
`rec05 @ 132`, `top10 @ 68`, `top02 @ 24`, `rec02 @ 42`, `rec01 @ 54`). Pedido del dueño: «menos detalle, un brazo
rectangular, no dos figuras; las caras son muy Playmobil y no Roblox». Hecho en `videos/cuerno/partes/_volze_personajes.js`
(`volze()`, `caraV()`, `peloV()`): copiar esas funciones en los videos nuevos.

## La descripción («prompt») del cuerpo
Un muñeco de Roblox clásico de **seis bloques**: cabeza, torso, dos brazos y dos piernas. Cada parte es **una sola
pieza** de plástico mate (rugosidad ≈ 0,6), con un bisel chico en las aristas (≈ 5 % del lado), sin brillo de laca.
- **Torso**: un cubo achatado, 2 de ancho × 2 de alto × 1 de profundidad.
- **Brazos**: un bloque rectangular cada uno, 1 × 2 × 1 (la mitad del ancho del torso), pegados al costado del torso y
  con el borde de arriba a la altura del hombro. **Sin codo, sin mano separada, sin manga aparte, sin puño en 3D.**
- **Piernas**: un bloque cada una, 1 × 2 × 1, pegadas entre sí debajo del torso, sin hueco, **sin rodilla ni zapato
  en 3D**.
- **Cabeza**: un **bloque recto**, ≈ 0,7 del ancho del torso y un poco menos alto que ancho, con un **bisel chico**
  (≈ 10 % del ancho; `RB(.74, .66, .7, .075)`) y el frente plano; **sin cuello**, apoyada sobre el torso. El 25-nov-2026
  la hicimos con aristas muy redondeadas (radio .2) y el dueño la rechazó: «son muy redondas, hacelas más rectas, como las
  de Volze».
- **Proporción total**: ≈ 4,5 cabezas de alto. Los chicos son el mismo muñeco más chico (0,7–0,9).

## La ropa: una calcomanía, no prendas
Toda la ropa es **pintura plana sobre los bloques**, como la ropa 2D de Roblox:
- Remera o camisa pintada en el frente y la espalda del torso; las **mangas pintadas** en la parte de arriba del brazo
  (corta ≈ 40 %, larga ≈ 80 %) y el resto del brazo del color de la piel, que hace de mano.
- Pantalón pintado en las piernas; los **zapatos son una franja oscura** abajo (≈ 13 %). Una pollera o un vestido se
  pinta en la parte de arriba de las piernas.
- Un solo color por prenda con **un estampado limpio y simple** que se lee de lejos: un escote en V, botones, rayas,
  un escudo, flores chicas, una guarda; también puños o un cinturón pintados como una banda.
- Sombreado suave de arriba hacia abajo. **Sin trama de tela, sin relieve, sin pliegues, sin bolsillos ni botones en
  3D.** Los ponchos, chalecos, fajas y pañuelos al cuello también se pintan.

## Lo único que va en 3D: accesorios de pocos polígonos
- **Pelo**: un accesorio de Roblox, **más grande que la cabeza y por encima** de ella (no un casco que la abraza): pocas
  piezas facetadas, en punta o en mechones gruesos, de **un solo color** con caras planas (una pieza un poco más
  oscura para dar volumen). Nunca mechones finos ni hebras.
- **Sombreros, pañuelos de cabeza, anteojos, barbas**: formas simples, de pocas caras, color liso.
- Nada más: ni ropa en 3D, ni sandalias, ni hombreras.

## La descripción («prompt») de la cara
Una **calcomanía de Roblox** pegada en el frente de la cabeza, en negro casi puro (`#121014`), **sin sombras, sin
nariz, sin cachetes, sin brillo en los ojos**.
- **Ojos**: dos óvalos negros rellenos, un poco más altos que anchos (≈ 12 % × 16 % del ancho de la cabeza), separados
  ≈ 26 % del ancho de centro a centro, a ≈ 40 % del alto de la cabeza desde arriba.
- **Cejas**: un trazo fino y corto (≈ 2 % del ancho), **solo cuando expresan algo**: inclinadas hacia adentro y abajo
  (enojo), hacia adentro y arriba (pena, miedo), altas y curvas (sorpresa), una sola levantada (duda).
- **Boca**: un trazo fino, a ≈ 75–80 % del alto. Variantes del canal:
  - neutra: una línea corta; contenta: un arco hacia arriba; triste: un arco hacia abajo;
  - **miedo: un zigzag fino y ancho** («WWW», ≈ 40 % del ancho de la cabeza; `rec03 @ 21`);
  - **enojo: dientes apretados**, un rectángulo blanco redondeado con contorno negro y rayitas verticales (`rec06 @ 81`);
  - sorpresa: una «o» negra chica; risa o grito: una boca abierta negra con una franja blanca de dientes arriba.
- **Ojos especiales**: cerrados (arco fino), apretados («> <»), entrecerrados (raya horizontal), contentos (arco al revés).
- La expresión se cambia de golpe, en 1–2 cuadros. La boca no se mueve al hablar.
- Los viejos se distinguen por el pelo gris o blanco, la barba y los anteojos, **no por arrugas pintadas**.

## Qué hacía que los nuestros parecieran Playmobil (y no hay que repetir)
- Pelo en casco liso que abraza la cabeza, con mechones finos.
- Ojos con un punto blanco de brillo y cejas gruesas siempre puestas.
- Ropa en 3D encima de los bloques (ponchos, hombreras, fajas, sandalias) y telas con relieve: el brazo quedaba como
  «dos figuras» (la manga y el brazo).
- Cabeza más chica y redonda, y rasgos chicos en el medio de la cara.

## Caras: estilo del catálogo clásico de caras de Roblox (25-nov-2026, reemplaza la cara de arriba)
La cara de óvalos negros y trazo parejo no le gustó al dueño; mandó capturas del catálogo de caras de Roblox («usá este
catálogo de caras»). Las dibujamos nosotros con ese estilo, sin copiar ninguna cara puntual (`CARAS_CAT` y `pincel()` en
`videos/cuerno/partes/_volze_personajes.js`):
- **Trazo de pincel**: cada línea (cejas, bocas, párpados) es una forma rellena que **se afina en las dos puntas**.
- **Ojos según la emoción**: óvalos negros con un **puntito de brillo** (neutra, contenta), gotas negras con brillo
  (tristeza), ojos **blancos con contorno y pupila chica** (miedo, sorpresa, risa), párpados de «chill» (ojo como barra
  negra con línea arriba y abajo: entrecerrado, sospecha), arcos (ojos cerrados o felices), «> <» (soplar, esfuerzo).
- **Bocas**: arco de pincel (sonrisa, tristeza ondulada), **boca abierta bordó con lengua rosa** y a veces dientes
  blancos (risa, grito, terror), «o» bordó (sorpresa), zigzag (miedo), dientes apretados con rayitas (enojo), sonrisa
  torcida (valiente, sospecha).
- **Cejas de pincel** solo cuando expresan: pena (adentro arriba), enojo (adentro abajo), altas (sorpresa), una
  levantada (duda).
- La cara ocupa casi todo el frente de la cabeza: ojos grandes a ≈ 40 % del alto, boca a ≈ 75 %.
