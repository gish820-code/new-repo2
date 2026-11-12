# Rainy Day — Episode 5 backgrounds (spec v1)

Same contract as `BACKGROUND-SPEC.md` and `BACKGROUND-SPEC-ep02-v1.md` — read both first, and open two existing modules
(`hilltop-camp-v1.js`, `hillside-trail-v1.js`) to copy their METHOD exactly:
- one guarded JS module per location, `window.RainyDayBG.<name> = function (parent, opts) { ...; return handles; }`;
- drawn only with `RainyDay.el` + `RainyDay.sk.{path,line,rect,poly,circle,hatch}` (seeded wobble), ink outlines
  `LINE.main` 4px / `LINE.detail` 2px, hatching for texture, layered far/mid/near depth, small storytelling details;
- deterministic, static; scenes own all motion; return documented HANDLES (header comment lists every one);
- action zone x 300–1600 / y 380–900 visually quieter; bottom 140 px (y ≥ 940) low-detail ground (caption bar);
- NO AI images, no bitmaps, no gradients-as-paintings: the same flat hand-inked storyboard look as Episodes 1–4.
- Paste after `assets/characters/rainy-day-rig-v3.js`.

## Episode 5 breaks the gray palette ON PURPOSE (the brief asks for it) — but in a controlled way
Episode 5 is DAY 9, a dry spell: new times of day and weather. Every module still uses `RainyDay.palette` for ink,
figures-adjacent greys and most shapes, PLUS this shared **Episode 5 light kit** (use these exact hex values; no other
new colors). Saturation stays LOW; **slicker yellow `#F2C230` remains Drizzle's alone** — no light, sky or prop may be
that yellow or near it.

```js
const EP5 = {
  // FIRST SUNNY DAY (camp, sun)
  sunSkyTop: "#7FA3C2", sunSkyLow: "#B9CFDF", sunLit: "#EEF0EA", sunGround: "#A9A595", dust: "#C8C2B2",
  dryGrass: "#8E8F7C", hardShadow: "#2B3644",
  // MIDDAY DAPPLE (ravine)
  leafDark: "#2F3D3A", leafMid: "#4C5E57", moss: "#6E7F6A", dappleLight: "#DCE3D6",
  // AFTERNOON HAZE (bridge)
  hazeSky: "#C9D2D9", concrete: "#9EA4A6", concreteDark: "#6B7275", rust: "#7A6A5E",
  // LATE AFTERNOON (tide flats)
  lateSky: "#D7CDBF", mud: "#5E5A52", mudWet: "#7C7A72", mudShine: "#D9D3C6",
  // GOLDEN HOUR (logging road) — pale amber, clearly NOT slicker yellow
  goldSky: "#D8BE96", goldLight: "#E6D3B0", goldShadow: "#3E3A42", gravel: "#8C8478",
  // DUSK (forest road)
  duskSkyTop: "#4F5270", duskSkyLow: "#A88E92", duskGlow: "#CDB2A4", duskHill: "#2C2E40",
  // NIGHT (woods)
  nightSky: "#0E131D", star: "#E6EAEE",
};
```
Define `EP5` inside your module (copy the block exactly) — do not add it to the rig.

Every module takes `opts.light` (default = the location's own light below) and exposes `skyG`, `lightG` (a group of
light overlays — sun shafts, dapple patches, glow — scenes may animate its opacity/position) and `shadowDir`
(`{dx, dy}`, the direction cast shadows fall, unit-ish vector) so scenes can draw matching figure shadows.

## Close-ups and inserts
Each location must also serve a MEDIUM and a CLOSE-UP framing. Scenes zoom the camera (scale 2–4) — so the area
around the main action spots must hold detail at 3× (texture, cracks, pebbles, moss, rivets). Also export a
`detail` handle: `{ g, x, y }` for the location's hero close-up object (listed below), drawn at a size that reads at
scale ~3.

## The seven modules

### `camp9` — the hilltop camp on DAY 9 (`camp-day9-v1.js`)
A WRAPPER around `hilltop-camp-v1.js` (scenes paste both; `camp9` calls `window.RainyDayBG.hilltopCamp(parent,
{crowd:false, fog:0})` first, then draws on top). Visibly changed since Day 4: 4–6 more small tents/tarp lean-tos
squeezed in, tarps faded and torn (patches, frayed edges), the rain-catch tarp + two barrels by the tank DRY (a sag, no
water, a web), the picnic/supply table half bare (two cans, an empty crate, a hand-lettered FOOD card), the board
under the canopy with the SHIFTS sheet curled, the G. PIKE tent (tents[1]) with its cardboard sign (copy `gordSign()`
from `compositions/ep04/scenes/ep04-s18-the-list-v1.html` into the module), laundry stiff on the line, a boiling
station (stove on a rock, big pot) by the canopy, cracked dry mud paths worn between tents.
`opts.light`: `"morning"` (pale clear morning, low fog wisps, cool), `"sun"` (default for this brief's dry-spell scenes:
blue sky `sunSkyTop→sunSkyLow`, hard light, `dust` ground haze, every big prop gets a hard shadow polygon toward
`shadowDir` {dx: 0.55, dy: 0.25}), `"night"` (night grade like Ep 4 s18 — `P.night` rect over the background).
The flood view at right: water lower, a wide band of mud. Handles: everything `hilltopCamp` returns (pass them
through: `base`), plus `table`, `board`, `rainCatch {g, x, y}`, `station {g, x, y}`, `gordTent {g, x, y}`,
`skyG`, `lightG`, `shadowDir`, `detail` = the last water jug on the table `{g,x,y}`.

### `ravineCreek` — forested ravine creek (`ravine-creek-v1.js`), MIDDAY, dappled
A steep forested ravine seen from inside it: tall fir and alder trunks rising out of frame, a canopy that lets
light through in patches, ferns (sword ferns: hatched fronds), mossy boulders, roots, a fallen log bridging the
ravine, the CREEK BED wide and rocky (dry stones pale) with only a THIN trickle down the middle (a narrow silver line
with a few tiny pools); a small mossy lip where the trickle falls 20 cm (the close-up spot). Light: `dappleLight`
patches on the ground and trunks (in `lightG`, as separate shapes scenes can drift), deep `leafDark` shade, shafts.
Handles: `g, groundY(x)` (bank ground under x — feet), `creek {g, x0, x1, y, trickleX(y)}`, `lip {x, y}` (where the
trickle falls — the jug goes under it), `rocks [{x,y,r}]` (sit-able rocks), `topEdge {x, y}` (where figures appear at
the top of the ravine, small), `ridgeRoad {g, y}` (a road edge high up at the top of frame where a tiny figure can
shout from), `skyG, lightG, shadowDir, detail` = the mossy lip with the trickle.

### `gullCreekBridge` — the collapsed Highway 101 bridge at Gull Creek (`gull-creek-bridge-v1.js`), AFTERNOON haze
The coast highway approach running onto a concrete girder bridge that has SNAPPED mid-span: the near half ends in a
broken, cracked edge with bent rebar and a dangling guardrail; the far half has dropped and lies tilted in the gorge
far below; the far abutment and road continue on the other side (unreachable). A deep wooded gorge with Gull Creek
(low) at the bottom, wind-bent firs, and through the gorge mouth a glimpse of the sea and the mud flats far off
(the tide OUT — `seaG` with `setLevel(y)` like the other harbor handles so a scene can show it). A green-free "HWY 101"
shield sign (steel/paper), a mile marker, a cracked asphalt approach with a faded centerline, a guardrail stub people
can sit on. Haze light `hazeSky`, flat and bright, wind-streaked clouds.
Handles: `g, groundY` (approach deck where feet stand, flat, x 0..~1300), `edge {x, y}` (the broken edge — figures stop
before it), `rebar {g}`, `guardrail {x0, x1, y, seatY}`, `crowdZone {x0, x1}`, `signBus {x, y}` (where scenes tape the
'BUS →' cardboard), `gorge {g, bottomY}`, `seaG / setLevel(y)`, `underView` (a second, alternative composition via
`opts.view: "below"`: the bridge seen from DOWN in the gorge, looking up at the broken deck with tiny figures on it —
returns `deckEdgeY` for that view), `skyG, lightG, shadowDir, detail` = the cracked deck edge with rebar.

### `tideFlats` — the edge of the flooded town at LOW TIDE (`tide-flats-v1.js`), LATE AFTERNOON, long shadows
Wide shining mud flats where streets were; houses with mud lines at roof height, some tilted, one with a FISHING BOAT
sitting on its ROOF (wheelhouse, outriggers, a rope ladder down the debris pile); a debris line (planks, a tire, a
chair, a fridge, crab pots); a few pilings; the receding water far out (`mudShine` glints); low sun from the RIGHT,
LONG shadows to the left (`shadowDir {dx:-0.9, dy:0.15}`). Sky `lateSky`.
Handles: `g, groundY` (firm mud edge where feet stand, ~860), `mudZone {x0, x1}` (where feet sink), `boat {g, x, y,
deckY, wheelhouse {x,y}}`, `pile {g, x, y, topY}` (debris pile up to the roof), `crate {x, y}` (the split crate of cans),
`debris {g}`, `water {g, levelY}`, `skyG, lightG, shadowDir, detail` = a boot-print hole in the mud with a sucked-in
puddle.

### `loggingRoad` — steep old logging road back to camp (`logging-road-v1.js`), GOLDEN HOUR
A steep gravel road climbing left→right/up through a cut-over hillside: stumps, slash piles, young firs, a rusted
yellow-free gate (steel/rust), tire ruts, a culvert, dust in the air; the low sun BEHIND the hill at upper right
throwing long shafts (`goldLight`) across the road; long `goldShadow` shadows toward lower left. A view down to the
bay at far left in gold haze. Use `roadY(x)` like `hillside-trail-v1.js`'s `trailY(x)`.
Handles: `g, roadY(x), roadPoints, stump {x, y, seatY}` (Mags sits), `gate {g, x, y}`, `crest {x, y}` (top of the road,
right), `sideRoad {x, y}` (a side track branching into the trees at the crest — where Hank is seen walking away),
`skyG, lightG, shadowDir, detail` = gravel with a dropped jug's dent / a rut puddle.
Also `opts.view: "wide"` = a much wider, higher view of the same road (the road a long zig-zag on the hillside, figures
would be TINY): returns `roadYWide(x)`.

### `forestRoad` — forest road disappearing into the hills (`forest-road-v1.js`), DUSK
A narrow dirt forest road receding from foreground (bottom center) into a notch between dark hills, vanishing under
firs; ditch, ferns, a leaning rusted sign 'HWY 4 →' (steel/paper, hand-lettered feel), a fallen log at the junction
(where Mags sits), power-line-free. Sky `duskSkyTop → duskSkyLow`, a pale `duskGlow` band low in the west behind the
notch, firs silhouetted `duskHill`/ink. Strong perspective: a figure walking away along `roadPath(t)` shrinks.
Handles: `g, groundY` (foreground road, ~860), `roadPath(t)` → `{x, y, scale}` for t 0 (foreground) … 1 (vanishing
point) so scenes can walk a figure away and shrink it, `log {x, y, seatY}`, `sign {g, x, y}`, `skyG, lightG, shadowDir,
detail` = the sign post base / a boot print in the soft road.

### `nightWoods` — dark woods at the camp's edge at night (`night-woods-v1.js`), NIGHT, STARS
Black fir trunks in several depth layers (near trunks huge, ink with faint `P.storm` bark hatching; far trunks
`P.storm`/`P.slate`), a fern floor, a deer trail; above, through a gap in the canopy, a CLEAR sky full of stars
(`nightSky` with `star` dots of 2–3 sizes, a faint Milky Way band in `P.storm`). Very dark, low contrast, so flashlight
beams (scenes add them) carve the shapes. No moon glow on the ground. Export `trunks [{x, w, depth}]` so scenes can
make beams hit trunks, and `beamZone {x0,x1,y0,y1}`.
Handles: `g, groundY (~860), trunks, gap {x, y, w, h}` (the star gap), `farPoint {x, y}` (where the whistle sound comes
from, deep in the trees), `skyG, lightG, shadowDir, detail` = a fern frond and trunk base for a close beam.

## Self-test (required)
Render each `opts.light`/`opts.view` variant in a scratch HTML under
`/tmp/claude-0/-home-user-new-repo2/5906bc33-ac4a-5c66-a126-bccd64db9f61/scratchpad/ep05-bg/<name>/` with the rig + your
module pasted inline and 2 figures (`drizzle`, `mags`, scale 1.4 at the main spot) for scale; also render a 3× zoom
crop on the `detail` spot. Screenshot with Playwright Chromium (`executablePath: '/opt/pw-browsers/chromium'`) at
1920×1080 and LOOK at the PNGs; iterate until it reads as a detailed, hand-drawn scene in the series style with the
right time of day. Do not edit any project file except your own module. Do not commit.
