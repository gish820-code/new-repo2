---
format: 1920x1080
duration: 60s
arc: how-to-process
music: none
style: "Elevated stick-figure animation: one ink stick-figure castaway on warm parchment, acting out each step on the same little island stage"
---

## Video direction

- **Look:** `frame.md` (Biennale Yellow) — warm `paper` ground on every frame, ONE `ink` for every line of type, every stroke and the stick figure; `sun` only as the radial sun-bloom atmosphere (one per frame) and the literal sun disc; `ember` is reserved for danger marks (a red X, the flame core) and never for text. No shadows besides the rig's soft ground ellipse, no rounded cards, no gradients other than blooms.
- **The castaway:** ONE stick-figure character in every frame, drawn ONLY with the shared rig `assets/castaway-rig.js` (paste it verbatim into your template script; use `CastawayRig.figure` + `CastawayRig.animate` with its named poses / `mix()`). Same proportions, stroke, face and hair tuft everywhere — never hand-draw another figure. Default scale 1.5 (≈330px tall), facing right unless the shot says otherwise. Faces change on the cue they belong to.
- **The stage:** a shared island set built with the rig's kit — `sea()` with the waterline at y≈800, an `island()` mound centered around x≈900 (halfWidth≈620, height≈120), one `palm()` right of center (x≈1250, base y≈770, scale ≈1.1), a `sun()` disc upper right inside a sun-bloom. Frames 4–7 reuse this exact stage so the steps feel like one place; frames may push in, pan, or go bird's-eye per their Scene lines.
- **Type:** visible text is SHORT labels only — a `micro-label` step tag ("STEP 1 · SHELTER") top-left at the pad-edge with a 1px ink hairline under it, plus at most one Instrument Serif hero word/number per frame. Never print narration sentences. Pagenum bottom-right in JetBrains Mono ("01 / 09"). Fonts ship in `assets/fonts/` (InstrumentSerif-Regular.woff2, InstrumentSerif-Italic.woff2, Archivo-Variable.woff2 for 400/600, JetBrainsMono-Regular.woff2) — declare `@font-face` for each family you use inside your template.
- **Line art props:** every prop (driftwood, fronds, bottle, coconut, crab, rocks, fire, plane) is ink line art (stroke 5–9px, round caps, `paper`/`paper-deep` fills only) so it matches the figure. Props that are "drawn on" use a stroke-dashoffset draw-on.
- **Motion grammar:** VO-paced reveals — at t=0 only what the voiceover is saying enters; each prop, label or action lands on its spoken cue (cue times are given per Scene, in frame-local seconds). Character acting carries the motion: poses ease `power2.inOut`, entrances `power3.out`, no bouncy springs except the small "pop" of a check mark. The rig's 8fps line boil keeps held frames alive — no extra breathing, floating or drifting.
- **Holds:** Frame 3 ("Breathe") and Frame 9 end on deliberate still reads; every other frame ends with its last action resolved and holding.
- **Negative list:** no slideshow (front-load then freeze), no screensaver (everything floating), no emoji, no clip-art, no photographic textures, no extra characters except the tiny plane/boat in frames 8–9, nothing below y=900 except the sea band and the pagenum.

## Frame 1 — Washed ashore

- duration: 5.589s
- transition_in: cut
- status: outline
- src: compositions/frames/01-washed-ashore.html
- type: hook
- persuasion: Imagine / scenario + Progressive disclosure (each "no" removes something)
- beat: Tension + curiosity

<fill in: this video's content for the "Washed ashore" beat — keep the layout role, replace the words.>

- blueprint: compose
- focal: the castaway lying at the waterline, then sitting up
- roles: island stage (sea, mound, palm, sun) = background · castaway = foreground subject · "No boat / No phone" strike-through icons = supporting

## Frame 2 — The rule of threes

- duration: 9.195s
- transition_in: crossfade
- status: outline
- src: compositions/frames/02-rule-of-threes.html
- type: social_proof
- persuasion: Rule of three + Statistical proof
- beat: Surprise + clarity

<fill in: this video's content for the "The rule of threes" beat — keep the layout role, replace the words.>

- blueprint: dataviz-countup (Adapt)
- focal: three Instrument Serif "3"s, one per survival need
- roles: paper + sun-bloom = background · three numeral columns = foreground subject · icons + units = supporting · small castaway lower-left = supporting

## Frame 3 — Stop and take stock

- duration: 4.949s
- transition_in: crossfade
- status: outline
- src: compositions/frames/03-take-stock.html
- type: product_intro
- persuasion: Signposting ("first") + Concretization (the salvage row)
- beat: Focus

<fill in: this video's content for the "Stop and take stock" beat — keep the layout role, replace the words.>

- blueprint: compose
- focal: the castaway taking one slow breath, then laying salvage out in a row
- roles: island stage (closer framing) = background · castaway = foreground subject · salvage row (plastic sheet, bottle, rope coil, shard of glass) = supporting

## Frame 4 — Shelter

- duration: 6.848s
- transition_in: push-slide LEFT
- status: outline
- src: compositions/frames/04-shelter.html
- type: feature_showcase
- persuasion: Demonstration + Progressive disclosure
- beat: Momentum

<fill in: this video's content for the "Shelter" beat — keep the layout role, replace the words.>

- blueprint: compose
- focal: the lean-to shelter assembling above the tide line
- roles: island stage = background · castaway = foreground subject · driftwood A-frame + palm-frond roof = foreground build · dashed high-tide line + sun rays = supporting

## Frame 5 — Water

- duration: 8.725s
- transition_in: push-slide LEFT
- status: outline
- src: compositions/frames/05-water.html
- type: feature_showcase
- persuasion: Common-belief vs reality + Numbered enumeration
- beat: Unease → comprehension

<fill in: this video's content for the "Water" beat — keep the layout role, replace the words.>

- blueprint: compose
- focal: the three fresh-water methods, built left to right
- roles: island stage = background · castaway = foreground subject · seawater cup with ember X = supporting (warning) · rain leaf, coconut, solar still = foreground builds

## Frame 6 — Fire

- duration: 7.275s
- transition_in: push-slide LEFT
- status: outline
- src: compositions/frames/06-fire.html
- type: feature_showcase
- persuasion: Causal chain (fire → clean water, food, warmth)
- beat: Delight + mastery

<fill in: this video's content for the "Fire" beat — keep the layout role, replace the words.>

- blueprint: compose
- focal: the bow drill → flame moment
- roles: island stage at dusk (bloom shifts lower/warmer) = background · castaway at the bow drill = foreground subject · flame = focal reveal · three benefit icons = supporting

## Frame 7 — Food

- duration: 8.32s
- transition_in: push-slide LEFT
- status: outline
- src: compositions/frames/07-food.html
- type: feature_showcase
- persuasion: Numbered enumeration + Counterexample (the berries)
- beat: Confidence

<fill in: this video's content for the "Food" beat — keep the layout role, replace the words.>

- blueprint: compose
- focal: the tide-pool catch laid out by the fire
- roles: island stage (beach/tide-pool side, shifted framing) = background · castaway = foreground subject · crab, shellfish, fish, berry bush with ember X = supporting

## Frame 8 — Signal

- duration: 6.485s
- transition_in: zoom-through
- status: outline
- src: compositions/frames/08-signal.html
- type: benefit_highlight
- persuasion: Demonstration + Callback (the plane answers the hook's "no boat")
- beat: Hope + anticipation

<fill in: this video's content for the "Signal" beat — keep the layout role, replace the words.>

- blueprint: compose
- focal: the SOS spelled in rocks, seen from above
- roles: bird's-eye island (sand field, waterline curve) = background · rock SOS letters + three fire pits = foreground subject · castaway (top-down tiny, or side view inset) = supporting · tiny plane = payoff

## Frame 9 — In order

- duration: 6.251s
- transition_in: crossfade
- status: outline
- src: compositions/frames/09-in-order.html
- type: branding
- persuasion: Distillation + Callback
- beat: Resolve + satisfaction

<fill in: this video's content for the "In order" beat — keep the layout role, replace the words.>

- blueprint: titlecard-reveal (Adapt)
- focal: the ordered row of five step icons
- roles: paper + sun-bloom low on the horizon = background · five icons + arrow = foreground subject · castaway waving at a boat on the horizon = supporting · title "Survive in order." = hero type
