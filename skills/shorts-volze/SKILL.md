---
name: shorts-volze
description: Hace Shorts verticales con el estilo medido del canal Volze (@volzewho) — personajes de bloques propios en un pueblo con texturas reales, una regla imposible, una criatura gigante no cuadrada, narrador único en primera persona, cámara siempre en movimiento con barridos, subtítulo amarillo de una palabra — con render 3D por GPU (RTX 4060, NVENC). Dos modos ya decididos: «pueblo de día» (por defecto) y «terror ocre». Usar cuando pidan «un short estilo Volze», «otro como el de la polilla», «un pueblo con una regla», «un short de terror de bloques» o «uno de día con una criatura gigante». No pregunta el estilo: viene decidido por el análisis.
---

# shorts-volze

Receta para hacer, con un solo pedido, un Short con el estilo que hace destacar a Volze, medido en `analisis/informe.md`
(22 videos descargados, whisper, Demucs, Shazam, detector de cortes) y probado en el video
`volze-video/salida/nobody-lights-a-third-lamp.mp4` (modo terror). **No preguntes el estilo**: está decidido acá.
Lo único que se aprueba es la historia (paso 1) si la persona quiere verla; si pidió «hacelo», elegí vos y seguí.

Responder siempre en español rioplatense simple. El video va en inglés.

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
- **Siempre se entregan dos MP4 con el mismo video**: con música propia y **sin música** (voz + efectos,
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
3. **Voz** (elegida por el dueño el 24-nov-2026: **ElevenLabs**, voz de biblioteca **«Liam – Viral Short-Form
   Storyteller»**, modelo Eleven v4, estabilidad 35 %, similitud 75 %, **sin Auto-tag** porque agrega `[whisper]`,
   `[sighs]`, etc.):
   - Generarla con Claude in Chrome en `elevenlabs.io/app/speech-synthesis/text-to-speech`, con la cuenta del dueño
     ya abierta. Pegar el guion entero (las frases de `voz.json` separadas por espacios), «Generate speech»,
     descargar la generación más corta y copiarla a `voz-eleven/completa.mp3`. Chrome tiene que tener permitidas
     las descargas múltiples de elevenlabs.io (ya habilitado).
   - Cortarla por frases: `python <skill>/herramientas/cortar_completo.py voz-eleven/completa.mp3 --tempo 1.35`.
     Alinea con whisper, acorta las pausas internas y acelera ×1,35 sin cambiar el tono, porque Liam habla a
     ≈ 175 palabras por minuto y el canal a ≈ 260. Después correr `verif_voz.py` y `palabras.py`.
   - Medición (`perfil_voz.py`, contra la voz de Volze aislada con Demucs: 172 Hz, rango 68 Hz): ninguna voz de
     ElevenLabs probada llega a ese tono (Liam Viral 129 Hz, Revenant 123, PJ 114, Snap 110); Liam fue la más
     cercana en conjunto. La más parecida medida es **Chatterbox** (gratis, local, en la GPU):
     `python <skill>/herramientas/voz.py` (motor por defecto), por si se acaban los créditos.
4. **Escena**: reescribir en `historia.js` el mundo, el elenco, `SHOTS`, `LUGAR` y los `case` de `setScene`.
   `node partes/armar.js` (chequea sintaxis).
5. **Revisión barata**: `node render-gpu.mjs tomas` → `salida/tomas-NN.jpg` (un cuadro del medio de cada toma).
   Arreglar nucas, paredes, cosas quemadas o negras; volver a sacar solo esas (`--lineas=8,13,40`).
6. **Música** y medición de audio (paso de abajo).
7. **Comparar con el canal**: `python <skill>/herramientas/comparar.py <tmp> salida/<video>.mp4` y llevar las medidas a
   la tabla del modo. Mirar 8 frames propios contra 8 del canal lado a lado y corregir las 3 diferencias más grandes.
8. **Render final por GPU** (sección de abajo) y verificación del MP4.
9. Entregar con `SendUserFile`; anotar la historia en `referencia/historias-hechas.md`; commit (el MP4 pesa
   ≈ 350 MB con CQ 19: no va al repo, queda en `salida/`, ignorado por git).

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
node render-gpu.mjs video salida/<nombre>.mp4 --conc=3
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
