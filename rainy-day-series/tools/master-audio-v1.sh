#!/bin/bash
# Rainy Day — loudness mastering for finished renders (v1). Two-pass EBU R128 loudnorm to YouTube/TikTok level:
# -14 LUFS integrated, -2 dBTP true peak (AAC encoding adds ~0.7 dB overshoot), LRA 11. Re-encodes ONLY the audio (AAC 192k); the video stream is copied.
# Usage: tools/master-audio-v1.sh <in.mp4> [more.mp4 ...]   (each file is mastered in place)
set -e
for f in "$@"; do
  m=$(ffmpeg -hide_banner -i "$f" -af loudnorm=I=-14:TP=-2:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
  g() { echo "$m" | python3 -c "import sys,json; print(json.load(sys.stdin)['$1'])"; }
  tmp="${f%.mp4}.mastering.mp4"
  ffmpeg -v error -y -i "$f" -map 0:v -map 0:a -c:v copy -c:a aac -b:a 192k -ar 48000 \
    -af "loudnorm=I=-14:TP=-2:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true" \
    -movflags +faststart "$tmp"
  mv "$tmp" "$f"
  out=$(ffmpeg -hide_banner -i "$f" -af ebur128=peak=true -f null - 2>&1 | grep -A20 Summary)
  echo "$f: before $(g input_i) LUFS → after $(echo "$out" | awk '/I:/{print $2; exit}') LUFS, true peak $(echo "$out" | awk '/Peak:/{print $2; exit}') dBTP"
done
