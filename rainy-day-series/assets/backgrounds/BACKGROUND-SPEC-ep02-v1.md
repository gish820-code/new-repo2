# Rainy Day — Episode 2 backgrounds (spec v1)

Same contract as `BACKGROUND-SPEC.md` (one guarded JS module per background, `window.RainyDayBG.<name>`, only
`RainyDay.el` + `RainyDay.sk.*`, palette only — NO yellow, deterministic and static, returns documented HANDLES,
action zone x 300–1600 / y 380–900 kept quieter, bottom 140px low-detail, weather added by scenes, self-test in a
scratch HTML under the session scratchpad). Paste after the rig (`assets/characters/rainy-day-rig-v3.js` for Episode 2;
the backgrounds only use `palette`, `LINE`, `el`, `sk`, `hash`, so they also work with v1/v2).

Episode 2 is **DAY 1** — the morning after. Light is a flat, cold, gray dawn (slightly paler sky than Episode 1's dusk,
low fog banks, drizzle). Everything outdoors is wet: puddles, dripping tarps, mud.

## `hilltopCamp` — the hilltop assembly area turned overnight camp (`hilltop-camp-v1.js`)
The same summit as `hilltop-v1.js` (keep its layout recognisable: CERT pop-up canopy at left-center, water tank far
left, picnic table right of center, ASSEMBLY AREA sign), now an improvised camp the morning after: small dome tents
and tarp lean-tos scattered around, a few cars parked on the grass at the edge, blankets and wet clothes hung on a line,
a cold smoking fire ring, scattered camp chairs, a whiteboard/missing-persons board on the canopy, a crack in the water
tank. At RIGHT, the view out over the ocean and the flooded lowland (water receded a bit, debris lines). Gray fog.
Opts: `{ crowd: true, fog: 0.6 }`. Handles: `g, groundY (~860), canopy {g,x,y,x0,x1,eaveY}`, `table {g,x,y,x0,x1,seatY,groundY}`
(Gord stands on it / counts supplies on it — it must be visible and roomy), `sign {g,x,y}`, `tank {g,x,y}`,
`tents [{g,x,y}]`, `cars [{g,x,y}]`, `crowd {g, members:[{g,x,y,scale}]}` (muted gray townspeople, opt-out),
`view {g, waterG, levelY, setLevel(y)}`, `fogG` (a fog layer scenes may fade), `sky {g}`.

## `shelter` — Drizzle and Mags' makeshift shelter at the camp edge (`shelter-v1.js`)
A closer, more intimate set: a blue-gray tarp strung between two parked cars (a hatchback at left, an old pickup at
right) with a sagging middle where rain runs off into a bucket; under it, sleeping bags, the go-bag's spot, a crate as a
table; OUTSIDE the tarp (front right, in the open) a stone fire ring with a pot on a grate and a small camp stove; a
small dome tent at far left with its door flap (for the carbon-monoxide beat); behind, the back of a small hilltop
cabin with an open utility-shed door revealing a WATER HEATER tank (tall cylinder with a drain valve near the bottom).
Fir trees, mud, puddles. Handles: `g, groundY (~860)`, `tarp {g, x0,x1, sagX, sagY}`, `rainCatch {bucketX, bucketY, dripX, dripTopY}`
(scenes animate drips/fill), `firePit {g,x,y}` (scenes add flames/smoke), `stove {g,x,y}`, `tent {g,x,y,doorX,doorY,w,h}`,
`cars [{g,x,y}]`, `waterHeater {g,x,y,valveX,valveY}`, `bagSpot {x,y}`, `crateTop {x,y}`.

## `townView` — looking down from the hill edge onto the wrecked town (`town-view-v1.js`)
A wide vista from the hill's edge in the foreground (wet grass lip, a few fir trunks, a broken fence; figures stand at
the lip, low in frame) down onto what's left of Gull Harbor: flood water still in the low streets, collapsed and
shifted houses, roofs in the water, the ferry stranded across Main Street, cars piled against buildings, debris lines,
broken power poles; the coast highway running off to the right with its BRIDGE over Gull Creek broken in the middle;
and **Dale's Gas & Grocery** (canopy + small store) at the east end of Main Street, clearly findable (mid-right, small
but readable; label it). The ocean and gray horizon beyond. Handles: `g, groundY (~880, the hill lip)`,
`gasStation {g, x, y, smokeX, smokeY}` (smoke/flash origin for scenes), `bridge {g, x, y}`,
`path {points:[[x,y],...]}` (the route down the hill to Main Street, in screen space, for tiny walking figures),
`water {g, levelY, setLevel(y)}`, `town {g}`, `sky {g}`.

## `gasStation` — Dale's Gas & Grocery, in the flood zone (`gas-station-v1.js`)
Ground level, the morning after: the fuel canopy tilted on a buckled column, a pump knocked over, the small grocery
store with shattered windows and a mud line a meter up the walls, the door jammed half open, shelves visible inside,
a pallet of bottled-water cases visible through the window, debris everywhere (planks, a boat hull, a car nosed into
the canopy column), standing muddy water across the lot with a sheen, a power pole leaning with a downed line lying
across the lot (end in a puddle), a "DALE'S GAS & GROCERY" sign. Handles: `g, groundY (~870)`,
`store {g, doorX, doorY, windowRect}`, `canopy {g, pivotX, pivotY}` (scenes can make it creak/sway),
`pumps [{g,x,y}]`, `powerLine {g, x0,y0,x1,y1}`, `water {g, y}`, `smokeOrigin {x,y}`, `pallet {x,y}`.
