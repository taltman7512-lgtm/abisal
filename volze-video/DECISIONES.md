# Nobody Lights A Third Lamp — Fase 2 (video de prueba, modo terror ocre)

23-nov-2026. MP4 final: `salida/nobody-lights-a-third-lamp.mp4` (no está en git: 413 MB).

## Qué es
- Historia elegida entre 3 propuestas (`PROPUESTAS.md`). En Hollow Fen cada casa tiene dos lámparas; si alguien
  enciende una tercera, la Polilla se lleva la casa entera. Narrador en primera persona; giro final: «Tonight, I'm
  the third lamp».
- **Especificaciones medidas contra el informe**:
  - 108,4 s · 439 palabras (243 por minuto; el canal está en 245–287).
  - Primera palabra en 0,02 s; última palabra 0,35 s antes del final.
  - 1080×1920, 60 fps, H.264 (NVENC) + AAC 192 k.
  - ~130 tomas con barridos de cámara, cortes duros solo al cambiar de lugar.
  - Subtítulo de una palabra: amarillo `#fff200`, 75 % del alto (22 % en 3 frases).
  - Música propia sintetizada, 6,0 dB debajo de la voz y audible el 100 % del tiempo; 7 efectos de sonido (≈ 4 por minuto).
- **Voz**: Kokoro `am_eric` a 1,3 (licencia libre, corre en la PC), ≈ 160 Hz como el narrador del canal. Whisper en
  CUDA verifica la pronunciación y da el tiempo de cada palabra a los subtítulos.
- **Personajes**: propios de bloques (motor de `reel-historias`). Nada de Volze ni de Roblox. La Polilla es procedural:
  2.600 pelos, alas pintadas con ojos, antenas plumosas, 6 patas articuladas.

## Render con la RTX 4060
| | GPU | CPU |
|---|---|---|
| WebGL | ANGLE D3D11 en la RTX 4060 | SwiftShader |
| 120 cuadros (1 pestaña, mismo tramo) | **11,0 s** (10,9 cuadros/s) | 444,1 s (0,27 cuadros/s) → **40× más lento** |
| Video completo, 6.503 cuadros | **213,8 s** (3 pestañas + NVENC) | ≈ 6,7 h estimadas |
| whisper large-v3, 105 s de audio | 16,3 s | 184,6 s (11,3×) |
| Demucs, 105 s de audio | 3,2 s | 36,8 s (11,5×) |

Durante el render final, `nvidia-smi` (415 muestras, una cada 0,5 s) marcó:
- Uso de GPU: 30 % de media, pico de 57 %.
- NVENC: 12 % de media, pico de 31 %.
- VRAM: 2,9 GB como máximo.

El cuello de botella es pasar cada cuadro de Chrome a ffmpeg como JPEG, no la placa.

**Lo que no funcionó en GPU a la primera**: el ffmpeg 9.0.2 de winget pide la API 13.1 de NVENC (driver ≥ 610), y el
driver es el 566.03 (API 12.2). Se codifica con el ffmpeg 7.1 que ya trae Remotion en el disco, que sí usa
`h264_nvenc -preset p5 -cq 19` con este driver. Si se actualiza el driver a la serie 610 o más nueva, alcanza con el
ffmpeg 9. Ninguna parte terminó por CPU.

## Comparación con el canal y las 3 diferencias corregidas
Medido sobre 240 frames de 8 videos de terror/noche del canal contra los frames propios (`comparar.py`, sin la zona
del subtítulo):

| Medida | Canal | v1 | Final |
|---|---|---|---|
| Luminancia | 0,405 | 0,189 | 0,339 |
| Contraste | 0,201 | 0,145 | 0,189 |
| Saturación | 0,380 | 0,774 | 0,401 |
| % de negros | 2,2 | 13,7 | 1,4 |
| Calidez (R−B) | 0,088 | 0,236 | 0,142 |

1. **Muy oscuro y con negros aplastados**: exposición de 1,3 a 2,3, relleno hemisférico de 0,32 a 1,0, viñeta de
   0,55 a 0,32 y niebla de 0,026 a 0,009.
2. **Todo sepia y saturado**: cielo azul profundo (`#141a2e`), luna fría (`#a8b8e0`) con sombras, lámparas menos
   saturadas (`#ffc480`) y filtro ocre del 26 % al 7 %. El cálido queda solo en las luces, como en el canal.
3. **Calle vacía**: utilería con barriles y zunchos, cajones, sacos, leña, un carro, tarimas, farolas de hierro
   apagadas (refuerzan la regla), carteles de oficio, barandas en los cuadrados, charcos y piedras.

Comparación visual: `salida/comparacion-canal-vs-propio.jpg`. No se sube al repo porque tiene frames del canal.

## Iteraciones
- Storyboard con un cuadro por toma (`render-gpu.mjs tomas`), 6 rondas. Lo que más hubo que arreglar: primeros planos
  que mostraban nucas o paredes (se resolvió con `shF`, que encuadra la cara según hacia dónde mira el personaje),
  cosas quemadas cerca de cámara (velas, luciérnagas) y la niebla que borraba los planos aéreos.
- Se agregaron 4 frases y se ajustaron las pausas para entrar en el rango de duración (101 → 108 s).

## Pendiente o mejorable
- 243 palabras por minuto, apenas debajo del piso medido (245).
- La luminancia quedó en 0,34 contra 0,41 del canal (el promedio del canal incluye `top03`, de día).
- El detalle de texturas sigue debajo del canal: no hay assets PBR fotográficos, todo es procedural.
- Algunos planos interiores (rincones de la pieza) son pobres.
