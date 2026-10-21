# Rainy Day — Episode 3 v2 scene edits (contract addendum)

Read `compositions/ep03/scenes/SCENE-SPEC.md` first — every rule there still applies (look = Episode 2, rig v3 pasted
verbatim, one paused timeline, seek-safe, palette only, no yellow except Drizzle and the stings, ids prefixed, etc.).

## What v2 is
Episode 3 v2 adds recorded voices. A later script (`tools/make-ep03-scenes-v2.py`) swaps the pasted rig v3 for rig v4
and injects a mouth-flap REMAP that maps each AUTHORED talk span onto the recorded line. So:

- **Talk spans (`talk: true` keyframes) stay authored on the DRAFT caption times** in
  `episodes/ep03/ep03-scenes-v2-draft.json` (= the v1 times, plus the new s17 lines). Do not move existing talk keys.
  When a line moves to a different figure (renamed speaker), author that figure's `talk: true` over the SAME draft
  span and remove talk from the old figure for that span.
- **Everything visual that must land on a line (camera cuts, close-ups, reactions) follows the FINAL voiced caption
  times** in `episodes/ep03/ep03-scenes-v2.json` (the lines were recorded and placed; times shifted a little).
- Durations: use the `duration` of your scene in `episodes/ep03/ep03-scenes-v2.json` (only s17 changes: 26.7 s).

## Files
- Start from your scene's v1 file (`compositions/ep03/scenes/ep03-<id>-<slug>-v1.html`, never edit it) and write the
  edited scene to the same path with `-v2src.html` instead of `-v1.html`. Keep rig v3 pasted VERBATIM (the swap script
  looks for it). Keep the composition id `ep03-<id>` and element-id prefixes unchanged.
- Preview: `node tools/preview-scene-v1.mjs compositions/ep03/scenes/<file>-v2src.html <times> <outdir>` with outdir under
  `/tmp/claude-0/-home-user-new-repo2/5906bc33-ac4a-5c66-a126-bccd64db9f61/scratchpad/ep03v2-preview/<id>`.
  Look at the PNGs at every caption cue; fix all page errors. Do not edit other files; do not commit.

## Character looks (bible v3 — `docs/series-bible-v3.md` §8; use exactly these rig opts)
- **BENNY OCHOA** (the dad, Ep 2 stove scene): `character: "extra", coat: "slate", hat: "beanie", hatColor: "storm", hair: "short", speaker: "benny"`
- **DARLA FINCH** (the frightened woman): `character: "extra", coat: "mist", hair: "long", hairColor: "slate", speaker: "darla"`
- **LYLE KEMPER** (the cap man): `character: "extra", coat: "steel", hat: "cap", hatColor: "slate", hair: "short", speaker: "lyle"`
- **HANK DORSEY** (the driver): `character: "extra", coat: "slate", hat: "beanie", hatColor: "night", speaker: "hank"`
- Gord, Tess, Milo, Wes, Roy, Dana: as in SCENE-SPEC.md.
- No two on-screen extras in the same scene should share Benny/Darla/Lyle/Hank's exact look unless it IS that character.
