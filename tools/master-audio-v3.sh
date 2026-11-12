#!/bin/bash
# Rainy Day — loudness mastering (v3) = v2 (two-pass loudnorm to -14 LUFS + brick-wall limiter) + make-up passes: v2 could
# land ~1 dB low (Episode 4 Part 2: -15.2 LUFS) when the limiter shaved peaks after loudnorm. v3 re-measures and, while the
# result is more than 0.3 LU off -14, applies the exact make-up gain followed by the same limiter (max 4 passes).
# Re-encodes ONLY the audio (AAC 192k); video is copied.  Usage: tools/master-audio-v3.sh <in.mp4> [more.mp4 ...]
set -e
LIM="aresample=192000,alimiter=limit=0.75:attack=1:release=60:level=false,aresample=48000"
meas() { ffmpeg -hide_banner -i "$1" -af ebur128=peak=true -f null - 2>&1 | grep -A20 Summary; }
for f in "$@"; do
  m=$(ffmpeg -hide_banner -i "$f" -af loudnorm=I=-14:TP=-2:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
  g() { echo "$m" | python3 -c "import sys,json; print(json.load(sys.stdin)['$1'])"; }
  tmp="${f%.mp4}.mastering.mp4"
  ffmpeg -v error -y -i "$f" -map 0:v -map 0:a -c:v copy -c:a aac -b:a 192k -ar 48000 \
    -af "loudnorm=I=-14:TP=-2:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,$LIM" \
    -movflags +faststart "$tmp"
  mv "$tmp" "$f"
  for pass in 1 2 3 4; do
    I=$(meas "$f" | awk '/I:/{print $2; exit}')
    d=$(python3 -c "print(round(-14-($I),2))")
    if python3 -c "import sys; sys.exit(0 if abs($d) <= 0.3 else 1)"; then break; fi
    ffmpeg -v error -y -i "$f" -map 0:v -map 0:a -c:v copy -c:a aac -b:a 192k -ar 48000 -af "volume=${d}dB,$LIM" -movflags +faststart "$tmp"
    mv "$tmp" "$f"
  done
  out=$(meas "$f")
  echo "$f: before $(g input_i) LUFS → after $(echo "$out" | awk '/I:/{print $2; exit}') LUFS, true peak $(echo "$out" | awk '/Peak:/{print $2; exit}') dBTP"
done
