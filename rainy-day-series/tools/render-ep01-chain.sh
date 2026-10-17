#!/bin/bash
# Renders Episode 1 outputs one after another (4-core box: sequential is fastest overall).
cd "$(dirname "$0")/.."
r() { echo "== $1 → $2"; npx hyperframes render -c "$1" -o "$2" "${@:3}" 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -E "rendered in|Render failed|sub_timeline|✗" | tail -4; }
for n in 4 1 2 3; do r ep01-part$n-9x16-v4.html renders/ep01/ep01-part$n-9x16-v4.mp4; done
# 326s episode: 2150k keeps the file under GitHub's 100MB limit
r ep01-full-16x9-v4.html renders/ep01/ep01-full-16x9-v4.mp4 --video-bitrate 2150k
echo "== chain done"
