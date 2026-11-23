# Contexto para continuar «Momo» en otra sesión

Pegá o adjuntá este archivo al empezar la sesión nueva. Hablá en español sencillo. El dueño ya aprobó de antemano
correr comandos, instalar dependencias y renderizar para este proyecto.

## Importante: dónde tiene que correr la sesión

El render con placa de video (GPU/NVENC) y la descarga de referencias con yt-dlp **solo se pueden hacer en la PC
del dueño**. Una sesión anterior que debía hacerlo terminó corriendo en la nube (Linux, sin placa) y la PC no
tenía ninguna carpeta compartida por Remote Control, así que esos dos pasos siguen pendientes.

Antes de nada, revisá dónde estás (`nvidia-smi`, sistema operativo). Si estás en la nube:
- pedí la carpeta de la PC (el dueño la comparte en la app de escritorio de Claude: Configuración → Claude Code →
  Remote Control), o
- decile al dueño que abra la sesión directamente en la PC.

## Qué ya está hecho (no lo rehagas)

Repo `taltman7512-lgtm/abisal`, rama `claude/youtube-shorts-animation-trend-652m8k`:

- `shorts-fisica/` — motor y primer short del formato que es tendencia en YouTube Shorts (caricatura 2D plana con
  física, sin narración, título y contador arriba). Código puro: canvas 2D en Chromium + física propia + audio
  sintetizado con numpy. No usa Remotion, Blender ni assets bajados.
  - `motor/base.js`, `motor/fisica.js`, `motor/dibujo.js`, `motor/fondo.js`, `motor/fuente.js`
  - `videos/pop/escena.js` y `videos/pop/GUION.md` — el short «Can Brik POP Momo?» (30 s, 1080x1920, 60 fps)
  - `audio/hacer_audio.py`, `render.mjs`, `index.html`, `hoja.py`, `RENDERIZAR.bat`, `renderizar.sh`
  - `entrega/can-brik-pop-momo.mp4` — el video ya renderizado (referencia de cómo tiene que salir)
  - `entrega/shorts-fisica-2d.skill` — la skill empaquetada con el motor adentro
- `.claude/skills/shorts-fisica-2d/SKILL.md` — análisis de la tendencia, fórmula de guion, estilo, paso a paso,
  cómo escribir una escena, sonido, lista de revisión y trampas conocidas.

Personajes propios: **Momo** (bolita de mochi rosa con rulito) y **Brik** (bloque violeta gruñón con aro
naranja). El formato se inspira en la tendencia; nunca se copian personajes, nombres ni chistes de otros canales.

### Verificado en la nube el 23 nov 2026

- `./renderizar.sh pop` funciona de punta a punta en un contenedor limpio (Node 22, ffmpeg, Python con numpy 2.5,
  Playwright ya instalado): **268 s en total** (263 s el video, con x264 por software, sin placa).
- Resultado: `out/pop_final.mp4`, h264 1080x1920, 60 fps, 30,0 s, audio AAC, 57,7 MB.
- Mezcla de audio: música −16,5 dB RMS, efectos −16,2 dB RMS.
- **No se probó** `--gpu --nvenc` ni `RENDERIZAR.bat` (no había PC conectada).

## Primeros pasos en la PC

1. `git fetch origin claude/youtube-shorts-animation-trend-652m8k` y trabajá sobre esa rama (worktree o copia
   aparte si la carpeta está en uso).
2. Leé **solo** `.claude/skills/shorts-fisica-2d/SKILL.md`. Abrí únicamente el archivo que vayas a tocar.
3. Dentro de `shorts-fisica/`, corré `RENDERIZAR.bat` (o a mano: `npm i playwright`,
   `npx playwright install chromium`, `node render.mjs --video pop --gpu --nvenc`,
   `python audio\hacer_audio.py`, y el ffmpeg de unión que está en el .bat). Necesita Node, ffmpeg y Python con
   numpy.
4. Verificá `shorts-fisica\out\pop_final.mp4` con ffprobe: 1080x1920, 60 fps, 30 s, con audio. Es determinista:
   debe verse igual a `entrega/can-brik-pop-momo.mp4`. Mostrale el MP4 al dueño y decile cuánto tardó (comparar
   con los 268 s de la nube) y si NVENC/GPU funcionaron o hubo que caer a x264.

## Pendientes

- **Nadie escuchó el audio todavía.** Solo se revisó la onda y el volumen (−13,6 LUFS). Que el dueño lo escuche
  antes de publicar; ajustar `audio/hacer_audio.py` si algo suena mal.
- **Referencias sin bajar** (YouTube bloquea la descarga desde la nube). Desde la PC, con yt-dlp: si el dueño
  quiere afinar el formato, bajar 4–6 shorts del canal de referencia (@seedpit) solo para estudiar ritmo de cortes
  y sonido, medirlos y actualizar las secciones 1 y 6 de la skill. No se publican ni se copian.
- **Idea propia, todavía NO agregada** (esperar el OK del dueño): «la Momo dorada escondida» — en cada video, una
  sola de las cientos de Momos del final es dorada con coronita, visible uno o dos segundos, sin anunciarlo; el
  comentario fijado pregunta si la encontraron.
- **Monetización:** al subir, marcar «no es para niños» y cuidar que cada video tenga historia, herramientas y
  remate distintos (política de contenido repetitivo).
- No subir nada a YouTube ni hacer push a otra rama sin que el dueño lo pida.

## Para hacer el próximo video

Sección 4 de la skill: guion en tabla (segundo → acción → contador), copiar `videos/pop/` a `videos/<nombre>/`,
herramientas nuevas en `motor/dibujo.js`, fotos de control a media resolución, vista previa, audio y render final.
