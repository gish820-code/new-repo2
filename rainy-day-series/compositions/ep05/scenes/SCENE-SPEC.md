# Rainy Day — scene build contract (Episode 5, v1)

You build one or more SCENES of Episode 5 ("DAY 9: THE LONG WAIT") as HyperFrames sub-compositions. The episode builder
(`tools/build-ep05-v1.mjs`) mounts your scene inside a 16:9 part composition, which is then rendered both as the full
YouTube episode (1920×1080, with subtitle captions over the bottom ~150px) and inside the 9:16 TikTok parts (scaled to
1080×608, captions in a separate area below). **You never draw captions or dialogue text** — captions are generated
from the script data on the render roots. Your scene must make the captions *true*: the acting, props and environment
must land on the caption cue times.

## Inputs (read them all before writing)
- `episodes/ep05/ep05-scenes-v1.json` — your scene's `action`, `start`/`end` states, `duration`, `bg`/`bgOpts`, and the
  `captions` (scene-local t0/t1 cue times + who speaks). Also read the scenes before/after yours for continuity.
- `episodes/ep05/scene-files-v1.json` — your scene's exact output `file` path and `compId`.
- `assets/characters/rainy-day-rig-v3.js` — Drizzle + Mags + the Episode-2 characters (Gord with his clipboard, Tess with her padlocked duffel, generic `extra` townspeople incl. kids — read its header for the opts), poses, faces, `talk`, `RD.sk.*` hand-drawn helpers,
  `RD.rain`, `RD.shake`, `RD.goBag`, palette. Read its header comment.
- your scene's background module — the `bgFile` path in scene-files-v1.json (handles listed in its header comment) —
  and `assets/backgrounds/BACKGROUND-SPEC.md` + `assets/backgrounds/BACKGROUND-SPEC-ep02-v1.md`.
- `docs/series-bible-v3.md` (the v3 direction: tense, grounded, serious; Drizzle's humor as release; no gore, no
  on-screen killing, no graphic injury) and the Episode 1 scenes in `compositions/ep01/scenes/*-v1.html` for the
  established look (title sting in s01, NEXT sting in s16, hilltop in s14).
- `assets/style/rainy-day-style-v1.css` (palette, line weights, fonts). `docs/series-bible-v3.md` (characters, tone, §3 time-jump devices, §9 facts).

## Output — exactly one file per scene, at the `file` path from scene-files-v1.json
A bare `<template>…</template>` fragment (no doctype/html/head/body outside it):
```html
<template>
  <style>
    #root { position: absolute; inset: 0; width: 100%; height: 100%; overflow: hidden; }
    @font-face { font-family: "Kalam"; src: url("assets/fonts/Kalam-Bold.woff2") format("woff2"); font-weight: 700; }   /* only if you use Kalam */
    /* your styles — prefix every id/class with s03- (your scene id) */
  </style>
  <div id="root" data-composition-id="ep05-s03" data-width="1920" data-height="1080" data-duration="22">
    <div id="s03-ground" class="clip" data-start="0" data-duration="22" data-track-index="0"></div>   <!-- full-bleed fill -->
    <svg id="s03-stage" class="clip" data-start="0" data-duration="22" data-track-index="1" viewBox="0 0 1920 1080" width="1920" height="1080">
      <g id="s03-shake"><g id="s03-cam"><g id="s03-bg"></g><g id="s03-mid"></g><g id="s03-chars"></g><g id="s03-fx"></g></g></g>
    </svg>
    <!-- optional HTML overlay clips (title cards, timer card, etc.) -->
  </div>
  <script>
    /* 1) paste assets/characters/rainy-day-rig-v3.js VERBATIM
       2) paste your scene's background module (bgFile) VERBATIM
       3) your scene code, wrapped in an IIFE: */
    (function () {
      const RD = window.RainyDay, BG = window.RainyDayBG;
      const tl = gsap.timeline({ paused: true });
      // build background, characters, props; RD.animate(...) once per figure; camera; rain; shake ...
      window.__timelines["ep05-s03"] = tl;
    })();
  </script>
</template>
```

## Rules (load-bearing)
1. **One paused timeline**, registered at `window.__timelines["<compId>"]`, built synchronously; root `data-duration`
   = your scene duration exactly. No `<script src>` and **no GSAP script tag** (GSAP is loaded by the render root).
2. **Deterministic & seek-safe:** no `Math.random`, `Date`, `performance.now`; every animated value is a function of
   timeline time (use `fromTo` with explicit from-states; drive procedural motion — flicker, dust, water level, timers —
   from a proxy tween's `onUpdate`, like `RD.animate`/`RD.rain`/`RD.shake` do). No CSS transitions/animations.
   No `repeat: -1`.
3. **Characters only via the rig**: `RD.figure(..., { character: "drizzle" | "mags", ... })` + ONE `RD.animate` call per
   figure covering the whole scene. Drizzle's slicker never comes off. Use `talk: true` on a figure for the span of
   each of their dialogue captions (and `talk: false` after). Faces must match the beat (worried, scared, determined,
   grin…). Default scale 1.4 (adjust for close-ups / wide shots, stay consistent within a scene).
4. **Palette**: only `RD.palette`; **yellow belongs to Drizzle's slicker and the title stings only** (no yellow props,
   lights or flames). Hand-drawn look: build props with `RD.sk.*` (seeded wobble) — not plain rects.
5. **Camera** (CHANGED from Episode 3 v1 — the GSAP svgOrigin/x/y tween approach did not land on the frames it asked
   for): drive `#sNN-cam` with ONE proxy tween whose `onUpdate` writes the `transform` attribute directly
   (`translate(tx ty) scale(s)`), from a shot table. Copy `camKey()` + `shots()` from
   `compositions/ep03/scenes/ep03-s03-the-return-v2src.html` (camKey(scale, worldX, worldY, screenX, screenY) = put
   world point (wx, wy) at screen (sx, sy) at that scale; shots = [[t0, t1, fromKey, toKey], ...], hard cuts between
   rows, eased push/drift inside a row; every moment is inside exactly one row). Put `RD.shake` on `#sNN-shake`.
   Never transform `#root` or the clip elements themselves. **Pacing rule: no static framing held longer than ~6 s** —
   cut or push to the speaker (medium close-ups on the speaker's line, scale ~1.8–2.4) and back to wider shots.
6. **Weather**: it is raining in exterior scenes (and visible through the kitchen window): `RD.rain` (exterior: count
   ~120–160, opacity ~0.45; through a window: clip to the window rect).
7. **Captions-safe zone**: in 16:9 the bottom ~150px (y ≥ 930) is covered by the subtitle bar — keep faces and key
   actions above y ≈ 900. Keep important things within x 120–1800.
8. **Continuity**: open on your scene's `start` state and close on its `end` state (positions/poses), so hard cuts
   between scenes read as continuous. Reuse the background's handles (table, door, harbor levels…) rather than
   inventing new positions. If you build two consecutive scenes, keep positions identical across the cut.
9. **No exits / no fades at the end** — scenes hard-cut. Only the recap (s01), the title sting (s02) and the NEXT sting (s17)
   are designed transitions.
10. **Prefix** every id and custom class with your scene id (`s03-…`) — scenes share one page in the full render.
11. **Every Scene beat in `action` must happen**, timed to the captions. Things should be moving most of the time
   (character acting, rain, camera drift, environment), with the rig's 8 fps line boil carrying holds.

## Self-check (required) — do not run the hyperframes CLI against the project
Preview your scene with the shared harness and LOOK at the PNGs (at least 6 times spread over the scene, including
every caption cue):
```
node tools/preview-scene-v1.mjs compositions/ep05/scenes/<your-file>.html 0.5,3,6,9,12,16,20 /tmp/<scene-id>-preview
```
It prints PAGE ERRORS if anything throws — fix all of them. Iterate until the scene reads clearly at small size
(remember TikTok shows it at 1080×608). Then stop; do not edit any other project file; do not commit; and do not write
your scene file again after your final reply.

## Episode 5 notes (read these too) — VISUAL VARIETY is the priority
- **Timing is FINAL.** Captions in `episodes/ep05/ep05-scenes-v1.json` are timed to the recorded lines
  (`audio/ep05/ep05-audio-report-v1.md` has every line's start/end). `talk: true` on the speaker for exactly each dialogue
  caption's t0→t1. Do not change scene durations.
- **New backgrounds** (read `assets/backgrounds/BACKGROUND-SPEC-ep05-v1.md` and the module's header comment for its
  handles and `opts.light` / `opts.view`): paste the rig, then the module. For `camp9` paste
  `assets/backgrounds/hilltop-camp-v1.js` FIRST, then `camp-day9-v1.js` (it wraps hilltopCamp). Use each module's
  `skyG/lightG/shadowDir/detail` handles.
- **Light and weather per scene** (from the scene's `action` + `bgOpts.light`): NO RAIN in Episode 5 (dry spell) — no
  `RD.rain` anywhere. Sunny camp: every figure gets a HARD SHADOW (a dark `EP5.hardShadow`-colored skewed ellipse/polygon on
  the ground in the module's `shadowDir`, drawn per frame under the feet; copy one helper across your scenes), plus a
  little dust kicked up on footsteps. Golden hour and late afternoon: LONG shadows in `shadowDir`. Night woods: figures lit
  only where flashlight beams fall (beam cones like `compositions/ep04/scenes/ep04-s18-the-list-v1.html`), stars visible.
  Dusk: figures read as near-silhouettes with a faint rim — faces still readable at TikTok size.
- **Camera variety (required):** every scene must use at least three framing types from: WIDE with the characters TINY in
  frame (scale ≤ 0.5 or a wide view), LOW ANGLE (camera low — horizon low in frame, figures loom; fake it with a wider
  framing anchored low + the module's view options), OVER-THE-SHOULDER (a big out-of-focus-dark foreground shoulder/head
  silhouette of one character at the frame edge, the other character beyond), OBJECT CLOSE-UP (camera scale 3–4.5 on the
  `detail` spot or a prop: the jug, the cans, the whistle, the note, the radio, a boot in mud), MEDIUM two-shot, speaker
  MCU. **No static framing held longer than 6 s** — cut or move. Camera = `camKey()` + `shots()` (see the Camera rule).
- **Inserts:** close-ups of hand-held props may also be drawn as a full-frame insert group (props drawn big with
  `RD.sk.*` over a background crop) when the rig is too small to read at 4×.
- **Cast looks (exact opts):** DRIZZLE (bag: false), MAGS (radio as noted), GORD `character: "gord"`. DARLA:
  `character: "extra", coat: "mist", hair: "long", hairColor: "slate", speaker: "darla"` + a dead phone (small night
  rectangle in hand); her two kids: `extra, kid: true` (mist/steel coats). HANK DORSEY: `character: "extra", coat: "slate",
  hat: "beanie", hatColor: "night", speaker: "hank"` + a big hiking pack (drawn on his back: slate pack with ink straps and a
  rolled mat) + a ring of car keys (small fog circle with 3 tiny keys) in one hand. BENNY (silent): `extra, coat: "slate",
  hat: "beanie", hatColor: "storm", hair: "short"`. WES (silent): `extra, coat: "mist", hat: "cap", hatColor: "slate",
  hair: "short", hairColor: "storm"` + rope coil. Crowd: muted-gray extras. Yellow belongs to Drizzle and the stings only
  (the EP5 light kit stays desaturated).
- **Mags' knee (s13–s14) is implied only**: drop to one knee, hand on the knee, wince; no swelling, no gore.
- **Title/DAY/NEXT stings, PREVIOUSLY recap, tracker cards:** copy the Episode 4 treatments exactly
  (`ep04-s02-first-light-v1.html` title, `ep04-s04-day-four-v1.html` DAY card, `ep04-s05-the-count-v1.html` tracker cards,
  `ep04-s01-previously-v1.html` recap flicker, `ep04-s18-the-list-v1.html` NEXT card). Drawn once; no caption copies.
- **Lesson/sign captions are drawn by the builder** — do not draw them, but make the action match while they are up.
- Preview: `node tools/preview-scene-v1.mjs compositions/ep05/scenes/<file>.html <times> /tmp/claude-0/-home-user-new-repo2/5906bc33-ac4a-5c66-a126-bccd64db9f61/scratchpad/ep05-preview/<scene-id>`.
  Check every caption cue and every camera cut; no PAGE ERRORS. Keep your build sources in your OWN scratchpad subfolder
  (other agents share the scratchpad).
