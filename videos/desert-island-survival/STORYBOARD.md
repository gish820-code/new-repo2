---
format: 1920x1080
duration: 60s
message: "Stranded on a desert island, you survive by doing the right things in the right order: shelter, water, fire, food, signal."
arc: how-to-process
audience: general YouTube viewers curious about survival
mode: autonomous
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

- scene: The stick-figure castaway washes up on a tiny island with a single palm tree; a wave recedes, he sits up and looks around
- voiceover: "You wake up on a beach. No boat. No phone. Just sand, sea — and one palm tree."
- duration: 5.589s
- transition_in: cut
- status: animated
- src: compositions/frames/01-washed-ashore.html
- type: hook
- persuasion: Imagine / scenario + Progressive disclosure (each "no" removes something)
- beat: Tension + curiosity

narrativeRole: Drops the viewer into the scenario in second person so every later step is "what you do".
keyMessage: You are alone on an island with almost nothing.

- blueprint: compose
- focal: the castaway lying at the waterline, then sitting up
- roles: island stage (sea, mound, palm, sun) = background · castaway = foreground subject · "No boat / No phone" strike-through icons = supporting

Scene 1 (0.0–1.1s): "You wake up on a beach." Wide shot of the island stage, slow push-in begins (scale 1.0→1.06 over the whole frame). The castaway lies face-up at the wet edge of the sand (x≈640), eyes closed; a single wave stroke slides in from the left, washes up to his feet and recedes. At ~0.7s his eyes open ("o" face).
Scene 2 (1.4–2.9s): "No boat." (1.4s) — he sits up (sit pose) and looks left; a small ink boat outline draws on above the sea at left and gets crossed out with an ember X. "No phone." (2.17s) — a small phone outline draws on near him and gets an ember X. Both icons stay small (≈90px) at mid-left, above the waterline.
Scene 3 (3.2–5.6s): "Just sand, sea — and one palm tree." — the X'd icons fade to 30%; he stands (stand, "worried" face) and turns toward the palm; on "one palm tree" (~4.6s) the palm gets a soft sun-bloom pulse behind it and a micro-label "1 PALM TREE" appears beside it with a hairline leader. Hold.

## Frame 2 — The rule of threes

- scene: Three big hand-drawn "3"s appear one by one, each with an icon (shelter, water drop, food) and a unit (hours, days, weeks); the castaway glances between them
- voiceover: "Survival runs on the rule of threes. Three hours without shelter. Three days without water. Three weeks without food. So the order matters."
- duration: 9.195s
- transition_in: crossfade
- status: animated
- src: compositions/frames/02-rule-of-threes.html
- type: social_proof
- persuasion: Rule of three + Statistical proof
- beat: Surprise + clarity

narrativeRole: Gives the reason behind the order of everything that follows; the thesis (order matters) lands by beat 2.
keyMessage: Shelter and water come before food because of how fast each one can kill you.

- blueprint: dataviz-countup (Adapt)
- focal: three Instrument Serif "3"s, one per survival need
- roles: paper + sun-bloom = background · three numeral columns = foreground subject · icons + units = supporting · small castaway lower-left = supporting

Adapt: keep the count-up signature as each "3" lands; the trend chart becomes a three-column triptych (shelter / water / food), each column a giant numeral + unit + ink icon.
Scene 1 (0.0–2.2s): "Survival runs on the rule of threes." The castaway (scale ~1.1) stands lower-left looking up, "think" pose. A micro-label "THE RULE OF THREES" draws in top-left with its hairline. The three column slots are empty.
Scene 2 (2.6–4.1s): "Three hours without shelter." Column 1 (left third): numeral "3" counts up 0→3 in numeral-jumbo-ish serif, unit "HOURS" (micro-label) under it, a lean-to shelter icon draws on above. Castaway glances toward it.
Scene 3 (4.5–5.9s): "Three days without water." Column 2: "3" counts up, unit "DAYS", water-drop icon draws on.
Scene 4 (6.2–7.6s): "Three weeks without food." Column 3: "3" counts up, unit "WEEKS", fish icon draws on.
Scene 5 (7.9–9.2s): "So the order matters." A hairline arrow draws left→right under the three columns with small ink numerals "1 · 2 · 3" beneath; the castaway nods ("determined" face, think → point toward column 1). Hold.

## Frame 3 — Stop and take stock

- scene: The castaway freezes, takes a slow breath (chest rises), then gathers salvage from the shoreline: a plastic sheet, a bottle, a rope, a bit of glass, laid out in a neat row
- voiceover: "First, stop. Breathe. Take stock — then salvage everything the tide gives you."
- duration: 4.949s
- transition_in: crossfade
- status: animated
- src: compositions/frames/03-take-stock.html
- type: product_intro
- persuasion: Signposting ("first") + Concretization (the salvage row)
- beat: Focus

narrativeRole: Names the method (calm, then an inventory) and plants the props used later (plastic sheet, bottle, glass).
keyMessage: Panic wastes energy; calm and an inventory come first.

- blueprint: compose
- focal: the castaway taking one slow breath, then laying salvage out in a row
- roles: island stage (closer framing) = background · castaway = foreground subject · salvage row (plastic sheet, bottle, rope coil, shard of glass) = supporting

Scene 1 (0.0–0.7s): "First, stop." Medium shot (stage scaled ~1.25 toward the beach). The castaway mid-step (walkA) freezes in place — a quick settle into stand. Micro-label "STOP · THINK" top-left.
Scene 2 (1.0–1.6s): "Breathe." breatheIn pose with "closed" eyes; a soft sun-bloom swells behind him (one slow bloom) — this is the frame's still moment.
Scene 3 (1.6–2.6s): "Take stock —" eyes open ("neutral"), he turns to the waterline and crouches.
Scene 4 (2.6–4.95s): "then salvage everything the tide gives you." Four salvage items wash in on small wave strokes and he lays them in a neat row on the sand to his right, one per ~0.45s: a folded plastic sheet, a plastic bottle, a coil of rope, a shard of glass — each a small ink drawing with a micro-label under it (SHEET · BOTTLE · ROPE · GLASS). Ends standing beside the row, "smile". Hold.

## Frame 4 — Shelter

- scene: Step 1 badge. The castaway drags driftwood into an A-frame lean-to above a dashed high-tide line, then lays palm fronds on top; the sun beats down, then he sits in the shade
- voiceover: "Step one: shelter. Get out of the sun, above the high-tide line — a driftwood frame, a palm-frond roof."
- duration: 6.848s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/04-shelter.html
- type: feature_showcase
- persuasion: Demonstration + Progressive disclosure
- beat: Momentum

narrativeRole: First move of the process, built on the island stage the rest of the steps reuse.
keyMessage: Build shade above the tide line first.

- blueprint: compose
- focal: the lean-to shelter assembling above the tide line
- roles: island stage = background · castaway = foreground subject · driftwood A-frame + palm-frond roof = foreground build · dashed high-tide line + sun rays = supporting

Scene 1 (0.0–1.2s): "Step one: shelter." Step tag "STEP 1 · SHELTER" top-left; the Instrument Serif hero word "Shelter." sets top-right-ish (headline size). The stage: castaway stands near the palm, sun hot — three short ink sun-ray strokes pulse once on him ("worried" face, hand shading eyes via mix of "think").
Scene 2 (1.7–3.9s): "Get out of the sun, above the high-tide line —" a dashed ink line draws along the sand (the high-tide line) with micro-label "HIGH TIDE"; a small up-arrow marks the dry zone above it. The castaway walks (walkA/walkB alternating) up-beach to the spot above the line.
Scene 3 (4.3–6.85s): "a driftwood frame, a palm-frond roof." He carries two driftwood poles (carry pose) and they draw on into an A-frame lean-to (4.3–5.3s); then palm fronds lay over it one by one (5.3–6.3s). Final beat: he sits in the shelter's shade ("smile"), the sun-rays stop. Hold.

## Frame 5 — Water

- scene: Step 2 badge. A wave with a big red X over a cup of seawater; then three options pop in a row as he does them: rain caught on a palm leaf into the bottle, a green coconut cracked open, a solar still (pit, cup, plastic sheet, pebble, droplets running down)
- voiceover: "Step two: water. Never drink the sea — the salt dries you out faster. Catch the rain. Crack green coconuts. Build a solar still."
- duration: 8.725s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/05-water.html
- type: feature_showcase
- persuasion: Common-belief vs reality + Numbered enumeration
- beat: Unease → comprehension

narrativeRole: The most important step and the one with a deadly misconception; the solar still pays off the plastic sheet from Frame 3.
keyMessage: Never drink seawater; collect fresh water three ways.

- blueprint: compose
- focal: the three fresh-water methods, built left to right
- roles: island stage = background · castaway = foreground subject · seawater cup with ember X = supporting (warning) · rain leaf, coconut, solar still = foreground builds

Scene 1 (0.0–1.15s): "Step two: water." Step tag "STEP 2 · WATER"; hero word "Water." The castaway kneels at the waterline, a cup in hand.
Scene 2 (1.3–4.1s): "Never drink the sea — the salt dries you out faster." He raises the cup toward his mouth; at ~1.8s a big ember X slams over the cup and he recoils ("o" face, shrug). A micro-label "SALT = DEHYDRATION" appears beside the X; the X'd cup shrinks to a small corner badge (top-right) by 4.0s.
Scene 3 (4.5–5.4s): "Catch the rain." Rain streaks draw down at left; a broad palm leaf funnels drips into the bottle (from frame 3's salvage). Micro-label "1 · RAIN".
Scene 4 (5.7–7.1s): "Crack green coconuts." Center: he cracks a green coconut on a rock (reach→crouch), the coconut splits open with a few droplet strokes. Micro-label "2 · COCONUTS".
Scene 5 (7.4–8.7s): "Build a solar still." Right: a cross-section diagram draws on — pit in the sand, cup at the bottom, plastic sheet stretched over, pebble dimpling the middle, a droplet sliding down into the cup. Micro-label "3 · SOLAR STILL". Hold with the castaway pointing at it ("smile").

## Frame 6 — Fire

- scene: Step 3 badge. The castaway works a bow drill over a nest of coconut husk; smoke curls, a flame blooms; around the fire three small icons appear: boiling water, cooking, warmth
- voiceover: "Step three: fire. Friction, patience, dry coconut husk — and now you have clean water, cooked food, and warmth."
- duration: 7.275s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/06-fire.html
- type: feature_showcase
- persuasion: Causal chain (fire → clean water, food, warmth)
- beat: Delight + mastery

narrativeRole: Shows fire as a multiplier that upgrades the previous steps.
keyMessage: Fire purifies water, cooks food, and keeps you warm.

- blueprint: compose
- focal: the bow drill → flame moment
- roles: island stage at dusk (bloom shifts lower/warmer) = background · castaway at the bow drill = foreground subject · flame = focal reveal · three benefit icons = supporting

Scene 1 (0.0–1.2s): "Step three: fire." Step tag "STEP 3 · FIRE"; hero word "Fire." The castaway kneels (drill pose) over a tinder nest of coconut husk at center-left, the bow and spindle in hand.
Scene 2 (1.5–3.9s): "Friction, patience, dry coconut husk —" he saws the bow back and forth (alternate drill/drillB every ~0.25s, face "determined"); thin smoke curls rise from the spindle tip from ~2.6s ("patience"), growing; at ~3.3s ("dry coconut husk") a micro-label "HUSK" points to the nest.
Scene 3 (4.3–7.27s): "and now you have clean water, cooked food, and warmth." At 4.3s an ember flame blooms from the nest (flame core ember, outline ink, sun glow behind), he leans back into "cheer" then sit. Three small ink icons arc in above the fire on their cues: a steaming pot (≈4.6s "clean water"), a fish on a stick (≈5.3s "cooked food"), warmth wavy lines (≈6.0s "warmth"), each with micro-label (BOIL · COOK · WARM). Flame flickers via deterministic shape swaps. Hold.

## Frame 7 — Food

- scene: Step 4 badge. At a tide pool the castaway catches a crab and picks shellfish; a fish skewer roasts over the fire; a bush of mystery berries gets a red X
- voiceover: "Step four: food — the last priority. Crabs, shellfish, fish from the tide pools. Cook everything. Skip the mystery berries."
- duration: 8.32s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/07-food.html
- type: feature_showcase
- persuasion: Numbered enumeration + Counterexample (the berries)
- beat: Confidence

narrativeRole: Puts food where the rule of threes says it belongs: last, and safe.
keyMessage: Eat from the sea, cook it, avoid unknown plants.

- blueprint: compose
- focal: the tide-pool catch laid out by the fire
- roles: island stage (beach/tide-pool side, shifted framing) = background · castaway = foreground subject · crab, shellfish, fish, berry bush with ember X = supporting

Scene 1 (0.0–2.2s): "Step four: food — the last priority." Step tag "STEP 4 · FOOD"; hero word "Food." with a small italic serif "(last)" beside it on "last priority" (~1.4s). The castaway walks to a rocky tide pool at the left.
Scene 2 (2.65–5.3s): "Crabs, shellfish, fish from the tide pools." He crouches at the pool and pulls out, one per cue: a crab (≈2.7s), two shellfish (≈3.4s), a fish (≈4.2s) — each pops into a neat row on the sand with a micro-label (CRAB · SHELLS · FISH).
Scene 3 (5.6–6.45s): "Cook everything." The row slides right to the fire from frame 6 (small flame at right); the fish appears on a skewer over it with a few steam lines.
Scene 4 (6.8–8.3s): "Skip the mystery berries." A bush with berries at the far left; he reaches toward it, then an ember X slams over it and he pulls back, shaking a finger ("determined" face, point). Hold.

## Frame 8 — Signal

- scene: Step 5 badge. Camera pulls up to a bird's-eye view: the castaway lays rocks spelling SOS on the sand, three fire pits in a triangle beside it; a tiny plane crosses the sky and wiggles its wings
- voiceover: "Step five: get seen. Spell S-O-S in rocks on the sand, and keep three fires ready to light."
- duration: 6.485s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/08-signal.html
- type: benefit_highlight
- persuasion: Demonstration + Callback (the plane answers the hook's "no boat")
- beat: Hope + anticipation

narrativeRole: Turns survival into rescue; the payoff of doing the steps.
keyMessage: Make yourself visible from the air.

- blueprint: compose
- focal: the SOS spelled in rocks, seen from above
- roles: bird's-eye island (sand field, waterline curve) = background · rock SOS letters + three fire pits = foreground subject · castaway (top-down tiny, or side view inset) = supporting · tiny plane = payoff

Scene 1 (0.0–1.5s): "Step five: get seen." Step tag "STEP 5 · SIGNAL"; hero word "Signal." The camera transitions to a bird's-eye view: a large sand field with the curving waterline along the bottom-left and the palm seen from above (a frond star) at right; the castaway seen from above as a small figure (rig scale ~0.8 still in side view is fine, standing on the sand) looking up.
Scene 2 (1.9–4.1s): "Spell S-O-S in rocks on the sand," — the letters S, O, S assemble from rock circles (ink outlines, paper-deep fill), stone by stone with a fast stagger, one letter per spoken letter (~2.3s, ~2.9s, ~3.4s); each letter ≈260px tall, centered across the upper-middle of the frame.
Scene 3 (4.4–6.49s): "and keep three fires ready to light." Three small fire-pit rings (log teepees) draw on in a triangle to the right of the SOS; on "ready to light" (~5.6s) a tiny plane crosses the sky along the top edge and wiggles its wings once; the castaway switches to wave/waveB. Hold.

## Frame 9 — In order

- scene: The five step icons line up in a row (shelter, water, fire, food, signal) and connect with an arrow; the castaway waves at a boat on the horizon; title "Survive in order."
- voiceover: "Shelter. Water. Fire. Food. Signal. Do them in order — and you'll still be here when rescue comes."
- duration: 6.251s
- transition_in: crossfade
- status: animated
- src: compositions/frames/09-in-order.html
- type: branding
- persuasion: Distillation + Callback
- beat: Resolve + satisfaction

narrativeRole: Compresses the whole video into one memorable ordered line.
keyMessage: Shelter, water, fire, food, signal — in that order.

- blueprint: titlecard-reveal (Adapt)
- focal: the ordered row of five step icons
- roles: paper + sun-bloom low on the horizon = background · five icons + arrow = foreground subject · castaway waving at a boat on the horizon = supporting · title "Survive in order." = hero type

Adapt: keep the calm single-move title landing; the title card becomes the five-icon ordered row resolving under the title.
Scene 1 (0.0–3.1s): "Shelter. Water. Fire. Food. Signal." A row of five ink icons (lean-to, drop, flame, fish, SOS) lands one per word across the upper-middle third — at 0.0, 0.61, 1.40, 1.93, 2.62s — each with its micro-label below and a hairline arrow segment drawing to the next.
Scene 2 (3.3–4.0s): "Do them in order —" small numerals 1–5 tick in above the icons and the row's arrow completes with an arrowhead.
Scene 3 (4.1–6.25s): "and you'll still be here when rescue comes." Below the row, the castaway on a sliver of island at left waves (wave/waveB, "grin") at a tiny boat that sails in from the right horizon; the title "Survive in order." (Instrument Serif, headline) fades up centered above the row with ONE restrained slide-up. This is the final frame: by 6.0s everything holds still (a gentle final settle is allowed).
