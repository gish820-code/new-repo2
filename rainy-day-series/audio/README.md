# Audio slots (reserved — captions only in v1)

Every part composition (`compositions/ep01/parts/ep01-partN-v1.html`) and every render root carries two clearly
marked, commented-out slots:

- **NARRATION / VO — track 20.** One take per part: `audio/ep01/vo/ep01-partN-vo-vX.wav`, `data-start="0"` relative
  to the part. Because the parts are mounted by both the full 16:9 episode and the 9:16 TikTok parts, a VO take added
  to a part appears in both renders automatically.
- **MUSIC / SFX — tracks 21–29.** Music bed on 21 (`audio/ep01/music/`), SFX cues on 22+ (`audio/ep01/sfx/`).

Uncomment the `<audio>` line in the slot, point it at the file, and re-render. Every `<audio>` needs a unique `id`
(HyperFrames lint rule). Version file names (v1, v2…) and bump on every new take.
