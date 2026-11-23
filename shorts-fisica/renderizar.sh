#!/usr/bin/env bash
# Render completo en Linux/Mac: video mudo -> audio -> MP4 final con sonido a -14 LUFS.
set -e; cd "$(dirname "$0")"; V="${1:-pop}"; shift || true
node render.mjs --video "$V" "$@"
python3 audio/hacer_audio.py
ffmpeg -y -loglevel error -i "out/${V}_mudo.mp4" -i out/audio.wav -map 0:v:0 -map 1:a:0 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 -c:a aac -b:a 192k -shortest -movflags +faststart "out/${V}_final.mp4"
ffprobe -v error -show_entries format=duration,size -show_entries stream=codec_name,width,height,r_frame_rate -of compact "out/${V}_final.mp4"
echo "LISTO: out/${V}_final.mp4"
