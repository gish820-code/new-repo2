#!/bin/bash
# Renders Episode 5 v1 outputs (voices + SFX), each mastered with tools/master-audio-v3.sh one after another (4-core box: sequential is fastest overall).
# Usage: bash tools/render-ep05-chain-v1.sh 1 2 3 4 full
cd "$(dirname "$0")/.."
mkdir -p renders/ep05
r() { echo "== $1 → $2"; rm -f "$2"; npx hyperframes render -c "$1" -o "$2" "${@:3}" 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -E "rendered in|Render failed|sub_timeline|Error|✗" | tail -4; [ -f "$2" ] && bash tools/master-audio-v3.sh "$2"; }
for n in "$@"; do
  if [ "$n" = full ]; then r ep05-full-16x9-v1.html renders/ep05/ep05-full-16x9-v1.mp4 --video-bitrate 2400k
  else r ep05-part$n-9x16-v1.html renders/ep05/ep05-part$n-9x16-v1.mp4 --video-bitrate 6500k; fi
done
echo "== chain done"
