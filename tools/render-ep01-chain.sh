#!/bin/bash
# Renders Episode 1 outputs one after another (4-core box: sequential is fastest overall).
cd "$(dirname "$0")/.."
r() { echo "== $1 → $2"; npx hyperframes render -c "$1" -o "$2" "${@:3}" 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -E "rendered in|Render failed|sub_timeline|✗" | tail -4; }
r ep01-part1-9x16-v1.html renders/ep01/ep01-part1-9x16-v1.mp4
r ep01-part3-9x16-v1.html renders/ep01/ep01-part3-9x16-v1.mp4
for n in 1 2 3 4; do r ep01-part$n-9x16-v2.html renders/ep01/ep01-part$n-9x16-v2.mp4; done
r ep01-full-16x9-v2.html renders/ep01/ep01-full-16x9-v2.mp4 --video-bitrate 2400k
echo "== chain done"
