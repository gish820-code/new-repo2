#!/bin/bash
# Renders the Episode 1 remake (v1) outputs one after another, then masters each to -14 LUFS (tools/master-audio-v1.sh).
# Usage: bash tools/render-ep01-remake-chain-v1.sh 1 2 3 4 full
cd "$(dirname "$0")/.."
r() { echo "== $1 → $2"; rm -f "$2"; npx hyperframes render -c "$1" -o "$2" "${@:3}" 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -E "rendered in|Render failed|Error|✗" | tail -4; }
for n in "$@"; do
  if [ "$n" = full ]; then f=renders/ep01/ep01-remake-full-16x9-v1.mp4; r ep01-remake-full-16x9-v1.html $f --video-bitrate 2300k
  else f=renders/ep01/ep01-remake-part$n-9x16-v1.mp4; r ep01-remake-part$n-9x16-v1.html $f --video-bitrate 6500k; fi
  [ -s "$f" ] && bash tools/master-audio-v1.sh "$f"
done
echo "== chain done"
