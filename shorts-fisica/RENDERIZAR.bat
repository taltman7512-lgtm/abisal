@echo off
rem Doble clic: renderiza el short con la placa de video y deja out\pop_final.mp4
cd /d "%~dp0"
where node >nul 2>nul || (echo Falta Node.js & pause & exit /b 1)
where ffmpeg >nul 2>nul || (echo Falta ffmpeg & pause & exit /b 1)
if not exist node_modules\playwright (call npm i playwright || (echo No se pudo instalar Playwright & pause & exit /b 1)) & call npx playwright install chromium
node render.mjs --video pop --gpu --nvenc || (echo Con NVENC fallo, pruebo sin el & node render.mjs --video pop --gpu) || (echo ERROR en el render & pause & exit /b 1)
python audio\hacer_audio.py || (echo ERROR en el audio: hace falta Python con numpy & pause & exit /b 1)
ffmpeg -y -loglevel error -i out\pop_mudo.mp4 -i out\audio.wav -map 0:v:0 -map 1:a:0 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 -c:a aac -b:a 192k -shortest -movflags +faststart out\pop_final.mp4 || (echo ERROR al unir audio y video & pause & exit /b 1)
echo.
echo LISTO: %~dp0out\pop_final.mp4
pause
