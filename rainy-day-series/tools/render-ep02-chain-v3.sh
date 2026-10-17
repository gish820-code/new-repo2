#!/bin/bash
# Renders Episode 2 v3 outputs one after another (4-core box: sequential is fastest overall), then masters each to -14 LUFS.
cd "$(dirname "$0")/.."
r() { echo "== $1 → $2"; npx hyperframes render -c "$1" -o "$2" "${@:3}" 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -E "rendered in|Render failed|sub_timeline|Error|✗" | tail -4; }
for n in "$@"; do
  if [ "$n" = full ]; then r ep02-full-16x9-v3.html renders/ep02/ep02-full-16x9-v3.mp4 --video-bitrate 2400k
  else r ep02-part$n-9x16-v3.html renders/ep02/ep02-part$n-9x16-v3.mp4; fi
  f=renders/ep02/ep02-$([ "$n" = full ] && echo full-16x9 || echo part$n-9x16)-v3.mp4; [ -s "$f" ] && bash tools/master-audio-v1.sh "$f"
done
echo "== chain done"
