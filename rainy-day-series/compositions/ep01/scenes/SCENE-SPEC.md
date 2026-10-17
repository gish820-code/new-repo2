# Rainy Day — scene build contract (Episode 1, v1)

You build one or more SCENES of Episode 1 as HyperFrames sub-compositions. The episode builder
(`tools/build-ep01-v1.mjs`) mounts your scene inside a 16:9 part composition, which is then rendered both as the full
YouTube episode (1920×1080, with subtitle captions over the bottom ~150px) and inside the 9:16 TikTok parts (scaled to
1080×608, captions in a separate area below). **You never draw captions or dialogue text** — captions are generated
from the script data on the render roots. Your scene must make the captions *true*: the acting, props and environment
must land on the caption cue times.

## Inputs (read them all before writing)
- `episodes/ep01/ep01-scenes-v1.json` — your scene's `action`, `start`/`end` states, `duration`, `bg`/`bgOpts`, and the
  `captions` (scene-local t0/t1 cue times + who speaks). Also read the scenes before/after yours for continuity.
- `episodes/ep01/scene-files-v1.json` — your scene's exact output `file` path and `compId`.
- `assets/characters/rainy-day-rig-v1.js` — Drizzle + Mags, poses, faces, `talk`, `RD.sk.*` hand-drawn helpers,
  `RD.rain`, `RD.shake`, `RD.goBag`, palette. Read its header comment.
- `assets/backgrounds/<bg>-v1.js` for your scene's background (handles listed in its header comment) and
  `assets/backgrounds/BACKGROUND-SPEC.md`.
- `assets/style/rainy-day-style-v1.css` (palette, line weights, fonts). `docs/series-bible-v1.md` (characters, tone).

## Output — exactly one file per scene, at the `file` path from scene-files-v1.json
A bare `<template>…</template>` fragment (no doctype/html/head/body outside it):
```html
<template>
  <style>
    #root { position: absolute; inset: 0; width: 100%; height: 100%; overflow: hidden; }
    @font-face { font-family: "Kalam"; src: url("assets/fonts/Kalam-Bold.woff2") format("woff2"); font-weight: 700; }   /* only if you use Kalam */
    /* your styles — prefix every id/class with s03- (your scene id) */
  </style>
  <div id="root" data-composition-id="ep01-s03" data-width="1920" data-height="1080" data-duration="22">
    <div id="s03-ground" class="clip" data-start="0" data-duration="22" data-track-index="0"></div>   <!-- full-bleed fill -->
    <svg id="s03-stage" class="clip" data-start="0" data-duration="22" data-track-index="1" viewBox="0 0 1920 1080" width="1920" height="1080">
      <g id="s03-shake"><g id="s03-cam"><g id="s03-bg"></g><g id="s03-mid"></g><g id="s03-chars"></g><g id="s03-fx"></g></g></g>
    </svg>
    <!-- optional HTML overlay clips (title cards, timer card, etc.) -->
  </div>
  <script>
    /* 1) paste assets/characters/rainy-day-rig-v1.js VERBATIM
       2) paste assets/backgrounds/<bg>-v1.js VERBATIM
       3) your scene code, wrapped in an IIFE: */
    (function () {
      const RD = window.RainyDay, BG = window.RainyDayBG;
      const tl = gsap.timeline({ paused: true });
      // build background, characters, props; RD.animate(...) once per figure; camera; rain; shake ...
      window.__timelines["ep01-s03"] = tl;
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
5. **Camera**: animate `#sNN-cam` with GSAP's SVG transform support — `tl.fromTo("#s03-cam", { scale: 1, x: 0, y: 0, svgOrigin: "960 540" }, { scale: 1.12, x: -40, ... })` —
   and put `RD.shake` on `#sNN-shake` (it writes that group's transform attribute itself). Never transform `#root` or
   the clip elements themselves.
6. **Weather**: it is raining in exterior scenes (and visible through the kitchen window): `RD.rain` (exterior: count
   ~120–160, opacity ~0.45; through a window: clip to the window rect).
7. **Captions-safe zone**: in 16:9 the bottom ~150px (y ≥ 930) is covered by the subtitle bar — keep faces and key
   actions above y ≈ 900. Keep important things within x 120–1800.
8. **Continuity**: open on your scene's `start` state and close on its `end` state (positions/poses), so hard cuts
   between scenes read as continuous. Reuse the background's handles (table, door, harbor levels…) rather than
   inventing new positions. If you build two consecutive scenes, keep positions identical across the cut.
9. **No exits / no fades at the end** — scenes hard-cut. Only the title stings (s01, s16) and the s04 blackout/s05
   fade-up are designed transitions.
10. **Prefix** every id and custom class with your scene id (`s03-…`) — scenes share one page in the full render.
11. **Every Scene beat in `action` must happen**, timed to the captions. Things should be moving most of the time
   (character acting, rain, camera drift, environment), with the rig's 8 fps line boil carrying holds.

## Self-check (required) — do not run the hyperframes CLI against the project
Preview your scene with the shared harness and LOOK at the PNGs (at least 6 times spread over the scene, including
every caption cue):
```
node tools/preview-scene-v1.mjs compositions/ep01/scenes/<your-file>.html 0.5,3,6,9,12,16,20 /tmp/<scene-id>-preview
```
It prints PAGE ERRORS if anything throws — fix all of them. Iterate until the scene reads clearly at small size
(remember TikTok shows it at 1080×608). Then stop; do not edit any other project file; do not commit; and do not write
your scene file again after your final reply.
