#!/bin/bash
# Episode 1 v5: render all outputs one after another, then master each to -14 LUFS (tools/master-audio-v1.sh).
cd "$(dirname "$0")/.."
r() { echo "== $1 → $2"; npx hyperframes render -c "$1" -o "$2" "${@:3}" 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -E "rendered in|Render failed|sub_timeline|Error|✗" | tail -4; tools/master-audio-v1.sh "$2"; }
for n in ${PARTS:-1 2 3 4}; do r ep01-part$n-9x16-v5.html renders/ep01/ep01-part$n-9x16-v5.mp4; done
# 329 s episode: 2100k keeps the file under GitHub's 100 MB limit
r ep01-full-16x9-v5.html renders/ep01/ep01-full-16x9-v5.mp4 --video-bitrate 2100k
echo "== chain done"
