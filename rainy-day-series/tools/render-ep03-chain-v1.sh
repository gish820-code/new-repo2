#!/bin/bash
# Renders Episode 3 v1 outputs (captions only) one after another (4-core box: sequential is fastest overall).
# Usage: bash tools/render-ep03-chain-v1.sh 1 2 3 4 full
cd "$(dirname "$0")/.."
mkdir -p renders/ep03
r() { echo "== $1 → $2"; rm -f "$2"; npx hyperframes render -c "$1" -o "$2" "${@:3}" 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -E "rendered in|Render failed|sub_timeline|Error|✗" | tail -4; }
for n in "$@"; do
  if [ "$n" = full ]; then r ep03-full-16x9-v1.html renders/ep03/ep03-full-16x9-v1.mp4 --video-bitrate 2400k
  else r ep03-part$n-9x16-v1.html renders/ep03/ep03-part$n-9x16-v1.mp4 --video-bitrate 6500k; fi
done
echo "== chain done"
