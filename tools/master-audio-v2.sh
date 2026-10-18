#!/bin/bash
# Rainy Day — loudness mastering (v2) = v1 (two-pass EBU R128 loudnorm to -14 LUFS, linear) + a brick-wall limiter after it
# (alimiter at -2.5 dBFS, 4x oversampled peak detection), because v1 let true peaks reach +3.2 dBTP when loudnorm could not
# stay linear. Re-encodes ONLY the audio (AAC 192k); the video stream is copied.
# Usage: tools/master-audio-v2.sh <in.mp4> [more.mp4 ...]   (each file is mastered in place)
set -e
for f in "$@"; do
  m=$(ffmpeg -hide_banner -i "$f" -af loudnorm=I=-14:TP=-2:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
  g() { echo "$m" | python3 -c "import sys,json; print(json.load(sys.stdin)['$1'])"; }
  tmp="${f%.mp4}.mastering.mp4"
  ffmpeg -v error -y -i "$f" -map 0:v -map 0:a -c:v copy -c:a aac -b:a 192k -ar 48000 \
    -af "loudnorm=I=-14:TP=-2:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=192000,alimiter=limit=0.75:attack=1:release=60:level=false,aresample=48000" \
    -movflags +faststart "$tmp"
  mv "$tmp" "$f"
  out=$(ffmpeg -hide_banner -i "$f" -af ebur128=peak=true -f null - 2>&1 | grep -A20 Summary)
  echo "$f: before $(g input_i) LUFS → after $(echo "$out" | awk '/I:/{print $2; exit}') LUFS, true peak $(echo "$out" | awk '/Peak:/{print $2; exit}') dBTP"
done
