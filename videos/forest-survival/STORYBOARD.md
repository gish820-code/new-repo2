---
format: 1920x1080
duration: 60s
message: "Lost in the forest, you survive by staying put and doing the right things in order: stop, shelter, water, fire, signal."
arc: how-to-process
audience: general YouTube viewers curious about survival
mode: autonomous
music: none
style: "Elevated stick-figure animation: the same ink stick-figure as the island video, on warm parchment, in a forest of ink pines"
---

## Video direction

- **Look:** identical to `videos/desert-island-survival` — `frame.md` (Biennale Yellow): warm `paper` ground, ONE `ink` for all type, strokes and the stick figure; `sun` only as the radial sun-bloom atmosphere (one per frame) and the sun disc; `ember` only for danger marks (red X), flame cores and the bright signal jacket. No other colors except the rig's stream fill.
- **The hiker:** the SAME stick-figure character as the island video, drawn ONLY with the shared rig `assets/castaway-rig.js` (`CastawayRig.figure` + `CastawayRig.animate`, named poses / `mix()`). Default scale 1.5, facing right unless the shot says otherwise.
- **The stage:** a shared forest set built with the rig's forest kit — `ground()` with the ground line at y≈820, `forest()` back rows along it (use `skip` to keep the action area clear), a few front `pine()`s / one `leafyTree()` as framing, `sun()` disc upper right inside a sun-bloom. Frames 3–5 reuse the same clearing (a stump at x≈760, the shelter site) so the steps feel like one place; Frame 4 may cut to the stream; Frame 6 is a wider clearing.
- **Type:** SHORT labels only — `micro-label` step tag ("STEP 1 · SHELTER") top-left at the pad-edge with a 1px ink hairline, plus at most one Instrument Serif hero word per frame (e.g. "Shelter."). Never print narration sentences. Pagenum bottom-right "NN / 08" in JetBrains Mono.
- **Line-art props:** branches, sticks, leaves, pot, whistle, jacket, helicopter, flashlight beams — all ink line art (stroke 5–9px, round caps, `paper`/`paper-deep` fills), drawn on with stroke-dashoffset where they appear.
- **Motion grammar:** VO-paced reveals on the cue times given per Scene (frame-local seconds measured from the real narration). Character acting carries motion; poses `power2.inOut`, entrances `power3.out`. The rig's 8fps line boil keeps holds alive — no extra floating.
- **Holds:** Frame 2 ("stay put") and Frame 7 end on deliberate still reads.
- **Negative list:** no slideshow (front-load then freeze), no screensaver (everything drifting), no emoji, no clip-art, no extra characters except the tiny helicopter (F6) and distant flashlight beams (F7), nothing below y=900 except the ground band and pagenum.

## Frame 1 — Off the trail

- scene: The hiker walks off a dashed trail line into a forest of ink pines; trees multiply and look identical; the sun sinks behind the treeline
- voiceover: "You took one wrong turn off the trail. Now every tree looks the same — and the light is fading fast."
- duration: 6.4s
- transition_in: cut
- status: outline
- src: compositions/frames/01-off-the-trail.html
- type: hook
- persuasion: Imagine / scenario + Progressive disclosure
- beat: Unease + curiosity

narrativeRole: Drops the viewer into being lost, in second person.
keyMessage: You are lost and night is coming.

- blueprint: compose
- focal: the hiker leaving the trail into identical pines
- roles: forest set = background · hiker = foreground subject · dashed trail line + "?" marks = supporting

Scene 1 (0.0–2.1s): "You took one wrong turn off the trail." Wide shot: a dashed ink trail line runs along the ground; the hiker walks right along it (walkA/walkB), then at ~1.2s steps OFF it, angling into the trees (trail line stays behind, a small fork mark where he left). Micro-label "OFF TRAIL" top-left.
Scene 2 (2.5–4.2s): "Now every tree looks the same —" the camera pans slowly right; the same pine shape repeats — front pines pop in one by one in a rhythmic stagger, identical; he stops, turns left then right (facing flips), "worried" face; two small ink "?" marks pop above his head.
Scene 3 (4.5–6.4s): "and the light is fading fast." The sun disc sinks behind the treeline and the sun-bloom dims and drops lower; the paper ground warms toward haze and darkens slightly (a soft ink overlay at ~12%). Hold on him alone among the trees.

## Frame 2 — Stop

- scene: The hiker freezes; the four letters S·T·O·P stack beside him (Stop, Think, Observe, Plan); a dotted search radius ring draws around him small and tight
- voiceover: "Don't wander. Stop, think, observe, plan. Most lost people are found close to where they went missing — so stay put."
- duration: 7.339s
- transition_in: crossfade
- status: outline
- src: compositions/frames/02-stop.html
- type: product_intro
- persuasion: Coined term / mnemonic + Counterintuitive claim
- beat: Focus + relief

narrativeRole: Names the method and the thesis (stay put) by beat 2.
keyMessage: Stop moving; rescuers search near where you were lost.

- blueprint: kinetic-type-beats (Adapt)
- focal: the S·T·O·P stack beside the hiker
- roles: forest set (dim) = background · hiker = foreground subject · S/T/O/P letters + words = foreground type · dotted search ring = supporting

Adapt: keep the statement-builds-across-beats signature; the four letters stack as the VO names each word.
Scene 1 (0.0–0.65s): "Don't wander." The hiker is mid-step (walkA) and freezes into stand; a short ink "halt" bar appears at his feet.
Scene 2 (0.98–3.2s): "Stop, think, observe, plan." Right of him a vertical stack builds one row per spoken word (Stop 0.98s, Think 1.58s, Observe 2.07s, Plan ~2.6s): a big Instrument Serif initial (S, T, O, P) with its word in Archivo beside it; he acts each lightly (stand → think → hand shading eyes via mix → point).
Scene 3 (3.6–6.3s): "Most lost people are found close to where they went missing —" a dotted ink ring draws around him on the ground plane (ellipse), small and tight, with a micro-label "MOST FOUND NEARBY"; a few tiny ink footprints inside the ring.
Scene 4 (6.4–7.34s): "so stay put." He sits down (sit, "determined"); the ring pulses once and holds. Hold.

## Frame 3 — Shelter

- scene: Step 1. He props a long branch on a stump, leans sticks along it as ribs, then piles leaves on until it is a thick mound; a cold-wind squiggle bounces off; he crawls in
- voiceover: "First: shelter. Nights get cold fast. Prop a branch on a stump, rib it with sticks, and pile on leaves — thicker than your arm is long. Then line the floor with leaves too."
- duration: 11.093s
- transition_in: push-slide LEFT
- status: outline
- src: compositions/frames/03-shelter.html
- type: feature_showcase
- persuasion: Demonstration + Worked example (arm-length measure)
- beat: Momentum

narrativeRole: First and most urgent step, built as a debris hut.
keyMessage: Build an insulated leaf shelter before dark.

- blueprint: compose
- focal: the debris hut assembling
- roles: forest clearing = background · hiker = foreground subject · ridgepole, rib sticks, leaf pile = foreground build · cold-wind squiggles + arm-length measure = supporting

Scene 1 (0.0–1.0s): "First: shelter." Step tag "STEP 1 · SHELTER"; hero word "Shelter." The clearing: a stump at x≈760, the hiker beside it.
Scene 2 (1.33–2.74s): "Nights get cold fast." Three ink wind squiggles blow in from the left; he hugs himself (mix of shrug/arms in), "worried"; a micro-label "COLD" with a small thermometer icon.
Scene 3 (3.09–4.22s): "Prop a branch on a stump," he carries a long branch (carry) and it draws on resting from the stump top down to the ground at right (the ridgepole).
Scene 4 (4.43–5.47s): "rib it with sticks," 6–8 sticks draw on leaning along both sides of the ridgepole in a fast stagger.
Scene 5 (5.64–6.85s): "and pile on leaves —" leaf strokes heap over the frame in waves until it reads as a thick mound.
Scene 6 (7.18–8.82s): "thicker than your arm is long." He holds an arm out beside the mound; a dimension line with end ticks draws from his shoulder to his hand, matched by an equal one on the mound's thickness, micro-label "≥ 1 ARM".
Scene 7 (9.25–11.09s): "Then line the floor with leaves too." A cutaway hint: a leaf layer draws along the floor at the shelter's mouth; he crawls in (crouch → lie) and the wind squiggles now bounce off the mound. Hold.

## Frame 4 — Water

- scene: Step 2. A contour of the land slopes downhill; he follows it to a stream; then a pot over a small fire bubbles, with a red X over drinking straight from the stream
- voiceover: "Next: water. Follow the land downhill to a stream. Bring it to a rolling boil before you drink — or you'll trade thirst for sickness."
- duration: 8.128s
- transition_in: push-slide LEFT
- status: outline
- src: compositions/frames/04-water.html
- type: feature_showcase
- persuasion: Causal chain + Before/after
- beat: Comprehension + unease

narrativeRole: Where to find water and the one rule that makes it safe.
keyMessage: Find water downhill; always boil it.

- blueprint: compose
- focal: the downhill route to the stream, then the boiling pot
- roles: sloping forest hillside = background · hiker = foreground subject · stream (rig stream) = destination · pot over small fire + ember X over cupped hands = supporting

Scene 1 (0.0–1.0s): "Next: water." Step tag "STEP 2 · WATER"; hero word "Water." The ground here slopes down from left to right (draw your own sloped ground line, same treatment as ground()); hiker at upper-left.
Scene 2 (1.36–3.43s): "Follow the land downhill to a stream." A dashed ink arrow draws down the slope; he walks down it (walkA/walkB, x and y descending); the stream (rig `stream()`) is revealed at lower right as he arrives (~3.0s), micro-label "DOWNHILL".
Scene 3 (3.85–5.95s): "Bring it to a rolling boil before you drink —" beside the stream a pot hangs over a small fire (ember flame); bubbles pop on its surface in a deterministic loop; micro-label "ROLLING BOIL".
Scene 4 (6.30–8.13s): "or you'll trade thirst for sickness." He kneels to cup water straight from the stream — an ember X slams over the cupped hands, he recoils ("o" face) and turns to the pot instead (point, "smile"). Hold.

## Frame 5 — Fire

- scene: Step 3. Three piles sort themselves by size — tinder, kindling, fuel (pencil-thin to wrist-thick); they stack into a teepee and catch; icons for warmth, dry clothes, calm appear
- voiceover: "Then fire. Gather tinder, kindling, and fuel — from pencil-thin to wrist-thick. It warms you, dries your clothes, and keeps you calm."
- duration: 8.384s
- transition_in: push-slide LEFT
- status: outline
- src: compositions/frames/05-fire.html
- type: feature_showcase
- persuasion: Rule of three + Concretization (thickness scale)
- beat: Delight + mastery

narrativeRole: Fire as the multiplier: warmth, drying, morale.
keyMessage: Build fire from tiny to thick: tinder, kindling, fuel.

- blueprint: compose
- focal: three fuel piles graded by size, then the teepee fire
- roles: forest clearing (dusk; sun-bloom low) = background · hiker = supporting · tinder / kindling / fuel piles + thickness scale = foreground subject · flame + three benefit icons = payoff

Scene 1 (0.0–0.72s): "Then fire." Step tag "STEP 3 · FIRE"; hero word "Fire." The hiker kneels at center-left in the clearing.
Scene 2 (1.05–3.5s): "Gather tinder, kindling, and fuel —" three piles land in a row right of him on their words (tinder 1.05s: a nest of fine squiggles; kindling 1.9s: a bundle of thin sticks; fuel 3.07s: thick logs), each labeled (TINDER · KINDLING · FUEL).
Scene 3 (3.5–4.7s): "from pencil-thin to wrist-thick." A thickness scale draws under the piles: a thin pencil outline at left growing to a thick wrist-width bar at right (a tapered wedge), micro-labels "PENCIL" → "WRIST".
Scene 4 (5.17–8.38s): "It warms you, dries your clothes, and keeps you calm." The piles stack into a teepee in front of him and an ember flame blooms (5.17s); three small icons arc up from the fire on their cues: warmth lines (5.2s), a shirt on a stick drying with steam (6.0s), a calm smile face/heart (7.35s), labeled WARM · DRY · CALM. He sits back ("smile"). Flame flickers by deterministic shape swaps. Hold.

## Frame 6 — Signal

- scene: Step 4. He blows a whistle: three sound-wave arcs pulse out; a bright orange jacket is spread in a clearing; a smoke column rises; a helicopter crosses overhead
- voiceover: "Make yourself easy to find. Three blasts on a whistle. Bright colors in a clearing. Smoke by day, fire by night."
- duration: 7.637s
- transition_in: zoom-through
- status: outline
- src: compositions/frames/06-signal.html
- type: benefit_highlight
- persuasion: Rule of three + Demonstration
- beat: Hope + anticipation

narrativeRole: Turns survival into rescue.
keyMessage: Three of anything says "help"; be visible.

- blueprint: compose
- focal: three ways to be seen, building to the helicopter
- roles: wider clearing among the forest = background · hiker = foreground subject · whistle sound arcs, orange jacket, smoke column = foreground subjects (one per cue) · helicopter = payoff

Scene 1 (0.0–1.6s): "Make yourself easy to find." Step tag "STEP 4 · SIGNAL"; hero word "Signal." Wider shot: a clearing in the middle of the forest; the hiker stands in it looking up.
Scene 2 (1.87–3.24s): "Three blasts on a whistle." He raises a small whistle (hand to mouth via mix); three sound-wave arc groups pulse out one after another (~1.9, 2.3, 2.7s) with a micro-label "× 3".
Scene 3 (3.66–5.13s): "Bright colors in a clearing." An ember-orange jacket (line art, ember fill) unfolds flat on the ground beside him, with small radiating "visibility" ticks; micro-label "BRIGHT".
Scene 4 (5.47–7.64s): "Smoke by day, fire by night." A small fire at the clearing edge sends up a tall ink smoke column (curling strokes); at ~6.5s a tiny helicopter crosses the top of the frame and turns toward the smoke; he waves (wave/waveB, "grin"). Hold.

## Frame 7 — Food can wait

- scene: A rumbling stomach; a calendar strip counts days; mystery berries and a mushroom get an ember X; he sips from his boiled water and shrugs it off
- voiceover: "And food? It can wait. You can last weeks without it — so skip any berries or mushrooms you can't name."
- duration: 6.549s
- transition_in: push-slide LEFT
- status: outline
- src: compositions/frames/07-food-can-wait.html
- type: social_proof
- persuasion: Counterintuitive claim + Counterexample (the berries)
- beat: Relief + caution

narrativeRole: Removes the instinct to forage and names the real food danger.
keyMessage: Food is the lowest priority; never eat what you can't identify.

- blueprint: compose
- focal: the hiker shrugging off hunger, then the X'd berries and mushroom
- roles: forest clearing by the shelter = background · hiker = foreground subject · stomach-rumble squiggle, day-count strip, berry bush + mushroom with ember X = supporting

Scene 1 (0.0–0.66s): "And food?" Step tag "NOTE · FOOD"; the hiker sits by the shelter; a small ink stomach-rumble squiggle wobbles at his belly; "o" face.
Scene 2 (0.80–1.53s): "It can wait." He shrugs (shrug, "smile"); hero word "Later." in Instrument Serif italic sets top-right.
Scene 3 (1.92–3.35s): "You can last weeks without it —" a horizontal day-count strip of small boxes ticks across the upper-middle (fast stagger, ~21 boxes) with micro-label "~3 WEEKS"; he sips from a cup (mix: hand to mouth).
Scene 4 (3.64–6.55s): "so skip any berries or mushrooms you can't name." At right a berry bush draws on, then a mushroom beside it; an ember X slams over each on "berries" (~4.3s) and "mushrooms" (~5.0s); he wags a finger at them (point, "determined"), micro-label "UNKNOWN = NO". Hold.

## Frame 8 — Stay put

- scene: The five steps (stop, shelter, water, fire, signal) line up as icons; the hiker sits by his fire next to the leaf shelter; flashlight beams of rescuers appear between the trees
- voiceover: "Stop. Shelter. Water. Fire. Signal. Stay calm, stay put — and let the rescuers come to you."
- duration: 6.507s
- transition_in: crossfade
- status: outline
- src: compositions/frames/08-stay-put.html
- type: branding
- persuasion: Distillation + Callback
- beat: Resolve + satisfaction

narrativeRole: Compresses the video into one ordered line and the stay-put thesis.
keyMessage: Stop, shelter, water, fire, signal — and stay put.

- blueprint: titlecard-reveal (Adapt)
- focal: the ordered row of five step icons
- roles: night-tinted forest (sun-bloom very low) = background · five icons + arrow = foreground subject · hiker by his fire at the shelter = supporting · rescuer flashlight beams = payoff · title "Stay put." = hero type

Adapt: keep the calm single-move title landing; the card becomes the five-icon ordered row.
Scene 1 (0.0–3.6s): "Stop. Shelter. Water. Fire. Signal." A row of five ink icons lands one per word across the upper-middle third — Stop (hand/halt) 0.0s, Shelter (leaf hut) 1.2s, Water (drop) 1.94s, Fire (flame, ember core) 2.5s, Signal (whistle arcs) 3.16s — each with its micro-label, hairline arrow segments drawing between them.
Scene 2 (3.8–4.8s): "Stay calm," below the row, the hiker sits by a small fire next to his leaf shelter at lower-left ("smile").
Scene 3 (4.83–6.5s): "stay put — and let the rescuers come to you." Two soft flashlight beams (pale sun-soft wedges) sweep in from between the trees at right; the title "Stay put." (Instrument Serif, headline, "put." italic) fades up centered above the row with ONE slide-up. This is the final frame: by ~6.2s everything holds still.
