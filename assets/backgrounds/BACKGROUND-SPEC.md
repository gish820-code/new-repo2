# Rainy Day — background module spec (v1)

Each background is ONE JavaScript file, `assets/backgrounds/<name>-v1.js`, that scenes paste VERBATIM into
their `<template><script>` right after `assets/characters/rainy-day-rig-v1.js`. It must:

- be guarded and register itself: `window.RainyDayBG = window.RainyDayBG || {}; if (!window.RainyDayBG.<name>) window.RainyDayBG.<name> = function (parent, opts) { ... return handles; };`
- draw into `parent` (an SVG `<g>` inside an `<svg viewBox="0 0 1920 1080">`) using ONLY `window.RainyDay.el` and the
  hand-drawn helpers `window.RainyDay.sk.{path,line,rect,poly,circle,hatch}` (pass a distinct `seed` per object so wobble
  varies) — never raw straight-edged rectangles for visible objects.
- be fully deterministic (no Math.random, no Date) and static at build time; return HANDLES (groups + numbers + small
  functions) that scenes use to animate. Scenes own all motion; a background never touches a GSAP timeline.
- use ONLY the palette in `window.RainyDay.palette` (stormy blues/grays: night, storm, slate, steel, mist, fog, paper,
  ink). **No yellow** — the slicker is the only saturated color in the show. Signs that are normally colored
  (e.g. the blue tsunami route sign) use steel/storm + paper.
- be DETAILED, hand-drawn, illustrated — not flat: layered depth (far/mid/near), texture via `sk.hatch`, small
  storytelling details (labels, posters, window frames, shingles, bricks, wood grain, puddles, wires). Aim for a
  storyboard/graphic-novel feel. Object outlines `LINE.main` (4px), detail `LINE.detail` (2px).
- keep characters readable: leave the action zone (roughly x 300–1600, y 380–900) visually quieter (mid/far detail,
  lower contrast) so the ink stick figures pop.
- keep the bottom 140px (y ≥ 940) low-detail floor/ground — the 16:9 caption bar sits there.
- weather is NOT part of the background (scenes add `RainyDay.rain`); window panes / sky may be left so rain reads.

Every module returns at least `{ g, groundY }` plus the handles listed for it below. Document every handle in a
header comment at the top of the file. Opts must have safe defaults.

## Characters for scale
Stick figures are drawn with `RainyDay.figure(..., { scale })`. At scale 1.4 a standing figure is ~310px tall; feet are at
`y + 116*scale` (hip y + 162px). Place furniture/doors at believable sizes for that (a door ~420px tall at scale 1.4).

## The four backgrounds

### `kitchen` — Drizzle's kitchen (interior, morning, rain outside)
Back wall with a window (view: gray harbor + rain sky; export `windowRect {x,y,w,h}` so scenes can clip rain into it),
counter + cabinets, stove with a kettle, fridge with doodle magnets, open shelf with plates/jars/mugs, wall clock, a
pendant lamp hanging over a sturdy wooden kitchen TABLE (center-left; big enough for TWO crouched figures under it),
two chairs, tile or plank floor with perspective, and the FRONT DOOR at right with a coat hook + a small bench where
the go-bag sits (draw the hook/bench; the bag itself is a scene prop: `RainyDay.goBag`).
Opts: `{ mess: 0 }` — `mess: 1` draws the after-quake state (fallen plates, open cabinet doors, tipped chair, cracks
in plaster, picture askew). Handles:
- `groundY` (floor line where feet stand, ~ y 880)
- `table: { x0, x1, topY, legXs: [..], g }` (under-table space must fit two crouched scale-1.4 figures)
- `door: { x, y, w, h, g }`, `bench: { x, y }` (where the go-bag sits)
- `lamp: { g, pivotX, pivotY }` (scene swings it during shaking)
- `fallables: [ { g, x, y, kind } ]` — at least 5 separate groups (plates, jar, pot, plant, picture) the scene can drop/
  topple during the shaking; each is its own `<g>` positioned in place.
- `windowRect`, `wall` (group), `clock: { g, cx, cy }`

### `mainStreet` — Gull Harbor main street (exterior)
A small Washington coastal town street looking roughly south: storefronts along the back (diner, hardware store,
"GULL HARBOR" painted sign, a post office), power lines and poles, a gas station with a canopy and pumps at RIGHT,
the low harbor with the FERRY DOCK and a moored ferry at LEFT (water level visible), the hill rising to the EAST (right
background) with a tiny school on its lower slope and a hint of the trail, fir trees, puddles, a tsunami-zone sign
("ENTERING TSUNAMI HAZARD ZONE" style, steel/paper colors). Opts: `{ damage: 0 }` — `damage: 1` draws post-quake:
cracked asphalt, broken/crooked windows, a leaning power pole with sagging lines, a tilted gas-station canopy, scattered
debris, a buckled sidewalk. Handles:
- `groundY` (street where feet stand, ~ y 860)
- `harbor: { g, waterG, shoreX, levelY, setLevel(y) }` — `waterG` is the water polygon/group; `setLevel(y)` redraws the
  water surface at height y (so scenes can make the harbor DRAIN (y down) and SURGE (y up) by calling it from an
  onUpdate). `levelY` is the normal level.
- `dock: { g }`, `ferry: { g }`, `gasStation: { g }`, `hill: { g }`, `school: { g, x, y }`

### `hillsideTrail` — the evacuation trail up the hill (exterior)
A steep switchback dirt trail climbing left→right/up through Douglas firs, roots and ferns, a wooden handrail, the
blue-white "TSUNAMI EVACUATION ROUTE" sign with an uphill arrow (steel/paper), and a wide VIEW DOWN at left to the town
and harbor far below (small houses, the ferry dock, the bay, the ocean horizon). Handles:
- `trailY(x)` → ground y of the trail at x (a smooth slope, feet should sit on it), plus `trailPoints` (polyline)
- `harbor: { g, waterG, levelY, setLevel(y) }` (the distant bay, so scenes can show the sea pull back and surge)
- `horizon: { y, g }` and `waveLine: { g }` — a thin dark line group on the horizon, hidden by default
  (opacity 0) that scenes can reveal/scale for the incoming wave.
- `sign: { g, x, y }`

### `hilltop` — the hilltop assembly area (exterior, late afternoon gloom)
An open grassy summit with an "ASSEMBLY AREA" sign (steel/paper), a pop-up canopy + tarp shelter, a few camp chairs,
a picnic table, a water tank, firs at the edges, and at RIGHT a view out over the ocean and the flooded lowland/harbor
far below (water where the town was, roofs poking out). Handles:
- `groundY` (~ y 860)
- `canopy: { g, x, y }`, `table: { g, x, y }`, `sign: { g }`
- `view: { g, waterG, setLevel(y) }` (the distant flooded lowland)

## Self-test (required)
Render your background in a scratch HTML under /tmp (NOT in the project), with the rig + your module pasted inline,
a couple of `RainyDay.figure` characters for scale, and GSAP loaded from `/home/user/rainy-day-series/assets/vendor/gsap.min.js`.
Screenshot it with Playwright's Chromium (`executablePath: '/opt/pw-browsers/chromium'`, or the bundled one under
/opt/pw-browsers) at 1920×1080 and LOOK at the PNG. Iterate until it reads as a detailed, hand-drawn, moody scene.
Do not run the hyperframes CLI against the project and do not edit any project file except your own module.
