# Rainy Day — scene build contract (Episode 4, v1)

You build one or more SCENES of Episode 4 ("DAY 4: THE CAMP") as HyperFrames sub-compositions. The episode builder
(`tools/build-ep04-v1.mjs`) mounts your scene inside a 16:9 part composition, which is then rendered both as the full
YouTube episode (1920×1080, with subtitle captions over the bottom ~150px) and inside the 9:16 TikTok parts (scaled to
1080×608, captions in a separate area below). **You never draw captions or dialogue text** — captions are generated
from the script data on the render roots. Your scene must make the captions *true*: the acting, props and environment
must land on the caption cue times.

## Inputs (read them all before writing)
- `episodes/ep04/ep04-scenes-v1.json` — your scene's `action`, `start`/`end` states, `duration`, `bg`/`bgOpts`, and the
  `captions` (scene-local t0/t1 cue times + who speaks). Also read the scenes before/after yours for continuity.
- `episodes/ep04/scene-files-v1.json` — your scene's exact output `file` path and `compId`.
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
  <div id="root" data-composition-id="ep04-s03" data-width="1920" data-height="1080" data-duration="22">
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
      window.__timelines["ep04-s03"] = tl;
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
node tools/preview-scene-v1.mjs compositions/ep04/scenes/<your-file>.html 0.5,3,6,9,12,16,20 /tmp/<scene-id>-preview
```
It prints PAGE ERRORS if anything throws — fix all of them. Iterate until the scene reads clearly at small size
(remember TikTok shows it at 1080×608). Then stop; do not edit any other project file; do not commit; and do not write
your scene file again after your final reply.

## Episode 4 notes (read these too)
- **Timing is FINAL.** The captions in `episodes/ep04/ep04-scenes-v1.json` are already timed to the recorded voice
  lines (`audio/ep04/lines/`, placed by `tools/build-ep04-audio-v1.py`). Put `talk: true` on the speaking figure for
  exactly each dialogue caption's t0→t1 (and `talk: false` after) and land the acting on those times. Do not change the
  scene's duration. You can listen-check timing in `audio/ep04/ep04-audio-report-v1.md` (start/end of every line).
- **Look = Episode 2 / Episode 3 exactly** (`docs/style-lock-v1.md`; rig v3 pasted verbatim). **Episode 4 is DAY**
  (DAY 4, flat gray overcast, light rain — `RD.rain` count ~100–140, opacity ~0.35) for every scene except: h1 + s18
  (NIGHT — do night exactly like `compositions/ep03/scenes/ep03-s17-inside-v2src.html`: night grade over the background,
  figures above the grade, flashlight beam cones), s01 (night recap), s17 (EVENING/dusk — like `ep03-s02-dusk-v1.html`,
  with the pale fire ring). For day staging, crowd density and scale on the camp, copy the Episode 2 day scenes
  (`compositions/ep02/scenes/ep02-s04-nobody-s-coming-v1.html`, `ep02-s09-the-count-v1.html`, shelter:
  `ep02-s07-water-first-v1.html`, `ep02-s08-not-in-the-tent-v1.html`).
- **The camp is now WORKING (DAY 4)** (bible §3.3): add the new props in your scenes with `RD.sk.*` where they are in
  shot — boiling station (Benny's two-burner stove on a flat rock OUTSIDE, big pot, steam), a latrine screen far
  downhill, a FIRST-AID crate with a paper cross sign under the canopy's left bay, the SIGN-UP BOARD (canopy.board) now
  holding a paper "SHIFTS" sheet (+ "WHO HAS WHAT" sheet beside it), the supply table full-ish with hand-lettered
  labels, a rope barrier around the water tank. All signs are hand-lettered (Kalam, ink on paper), never yellow.
- **Gord's tent** = `tents[1]` with the **G. PIKE** cardboard sign + spare clipboard on a stake: copy `gordSign()` from
  `compositions/ep03/scenes/ep03-s17-inside-v2src.html` verbatim whenever his tent is in shot (h1? no — h1 is the
  board; s18 yes; any wide camp shot that shows tents[1]).
- **Drizzle wears NO go-bag on his back** (bag: false) all episode. In s10 he carries the first-aid kit pouch in his hand
  (paper/fog pouch with an ink cross — no red).
- **Cast looks (use exactly these opts; speaker = the key used for talk):**
  - GORD: `character: "gord"` (clipboard). TESS: `character: "tess"` (padlocked duffel). DRIZZLE, MAGS as always.
  - MS. ORTEGA (new): `character: "extra", coat: "steel", hat: "none", hair: "short", hairColor: "fog", speaker: "ortega"`,
    plus a WHISTLE on a lanyard: a thin ink lanyard line from neck to a small paper/fog whistle at the chest (drawn per
    frame from the figure's joints in onDraw or a follower group — look at how other scenes attach props to joints).
  - WES PRUITT: `character: "extra", coat: "mist", hat: "cap", hatColor: "slate", hair: "short", hairColor: "storm", speaker: "wes"` + a coil of rope on his shoulder (ink circle loops) when noted.
  - CAL PRUITT (Wes's identical twin, first time on screen): same opts as Wes but `speaker: "cal"`; injured right ankle:
    in s03 he sits/stands on one leg; from s10 on a SPLINT (two paper slats + ink ties on the lower leg) and in s15 a
    branch crutch (ink line under his arm). Tell the twins apart by position/props only.
  - BENNY OCHOA: `character: "extra", coat: "slate", hat: "beanie", hatColor: "storm", hair: "short", speaker: "benny"`;
    his son LEO: `character: "extra", kid: true, coat: "mist", hat: "beanie", hatColor: "slate", speaker: "leo"` (silent).
  - DANA REYES: `character: "extra", coat: "slate", hat: "beanie", hatColor: "steel", hair: "long", hairColor: "night", speaker: "dana"`; white gauze on her forearm (paper wrap).
  - MILO VARGA: `character: "extra", kid: true, coat: "mist", hat: "beanie", hatColor: "steel", speaker: "milo"` + a tiny
    flashlight on a lanyard at his chest (ink line + small steel cylinder).
  - DARLA FINCH: `character: "extra", coat: "mist", hair: "long", hairColor: "slate", speaker: "darla"`; holds a dead
    phone (small night rectangle in her hand) she keeps glancing at.
  - RADIO lines come out of Mags' radio: when RADIO speaks, show static squiggle lines at the speaker and have Mags
    cranking/holding it up (copy the radio static from `compositions/ep02/scenes/ep02-s05-static-v1.html`). No talk on any figure.
  - Other townspeople: `extra` crowd figures in muted grays (no yellow).
- **Title/DAY/NEXT stings and cards:** title sting = copy `compositions/ep03/scenes/ep03-s02-dusk-v1.html`'s RAINY DAY
  sting treatment; DAY card = copy `compositions/ep02/scenes/ep02-s02-day-one-v1.html`'s "DAY 1" card (now "DAY 4", subtitle
  "THE CAMP"); NEXT card = copy `compositions/ep03/scenes/ep03-s17-inside-v2src.html`'s "NEXT: DAY 4" card (now "NEXT: DAY 9").
  These are drawn ONCE as HTML/SVG in the scene (no caption copies). Yellow is allowed only on these stings and Drizzle.
- **Lesson/sign captions** are rendered by the builder at the bottom — do NOT draw them in the scene, but make the action
  match them while they are up (e.g. the pot keeps rolling during the BOIL sign).
- **Safety/no gore** (bible §5): injuries are implied (splint, gauze). The insulin is drawn as small paper vials/pens
  in a pouch — no needles shown in use.
- Preview: `node tools/preview-scene-v1.mjs compositions/ep04/scenes/<file>.html <times> /tmp/claude-0/-home-user-new-repo2/5906bc33-ac4a-5c66-a126-bccd64db9f61/scratchpad/ep04-preview/<scene-id>`
  — check at least every caption cue and every camera cut, and confirm there are no PAGE ERRORS.
