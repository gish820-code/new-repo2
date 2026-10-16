# Dispatch context — desert-island-survival (read after _role.md and your packet)

- PROJECT_DIR: /home/user/new-repo2/videos/desert-island-survival
- Canvas: 1920×1080 (landscape). Captions: DISABLED (offline narration has no word timings), but still keep all content above y=900 except the sea band and pagenum.
- No confirmed sketch exists for any frame (autonomous run) — build straight from your Scene lines.
- Scene times are FRAME-LOCAL seconds measured from the real narration audio; land each reveal on its cue.

## Overrides to the role (project-specific, these win)

1. **GSAP:** do NOT add any `<script src=...gsap...>` tag to your template. The assembled index already loads GSAP from the local file `assets/gsap.min.js` before any frame (the CDN is unreachable in this environment). Just use the global `gsap`.
2. **The castaway rig is mandatory:** read `assets/castaway-rig.js` and paste its full contents VERBATIM at the top of your template `<script>` (before your timeline code). Draw the stick figure ONLY with `CastawayRig.figure(...)` + `CastawayRig.animate(tl, fig, keys, { start, end, onDraw })`; build the island stage with `CastawayRig.sea / island / palm / sun`. Read the rig's header comment for the coordinate system: x/y = hip when standing; ground line = y + 116*scale for every pose; angles from straight down, positive = forward. Poses: stand, wave, waveB, walkA, walkB, sit, lie, kneel, crouch, reach, carry, pull, point, think, shrug, cheer, breatheIn, drill, drillB; customise with `CastawayRig.mix("stand", { rsh: 120 })`. Faces: neutral, smile, grin, o, worried, determined, closed. For walking, alternate walkA/walkB keys every ~0.3s while moving x. `animate` drives everything from ONE proxy tween, so give it ALL of the figure's keyframes for the frame in one call (one call per figure). Props held by the figure: move them inside `onDraw(fig)` using `fig.hand("r")` / `fig.hand("l")` (absolute SVG coords).
3. Put the whole scene in ONE full-frame `<svg viewBox="0 0 1920 1080">` (plus HTML text layers for type if you prefer) inside a full-duration `class="clip"` element; paint the paper ground + sun-bloom as its own full-duration background clip (not on #root).
4. **Camera moves** (push-in, pan): tween a wrapping `<g>` transform (scale/x/y) or the svg wrapper div — never `#root`.
5. **Fonts:** declare inside your template, using these exact files:
   `@font-face { font-family: "Instrument Serif"; src: url("assets/fonts/InstrumentSerif-Regular.woff2") format("woff2"); font-weight: 400; font-style: normal; }`
   `@font-face { font-family: "Instrument Serif"; src: url("assets/fonts/InstrumentSerif-Italic.woff2") format("woff2"); font-weight: 400; font-style: italic; }`
   `@font-face { font-family: "Archivo"; src: url("assets/fonts/Archivo-Variable.woff2") format("woff2"); font-weight: 400 600; }`
   `@font-face { font-family: "JetBrains Mono"; src: url("assets/fonts/JetBrainsMono-Regular.woff2") format("woff2"); font-weight: 400; }`
   SVG `<text>` must also use these families (set font-family explicitly).
6. **Deterministic flicker/flame/rain:** derive from timeline time only (e.g. step = Math.floor(t*10) inside an onUpdate driven by a proxy tween) — never Math.random or Date.
7. Prefix every id and custom class with your frame_id (e.g. `#f04-roof`). Do not touch any file except your own `compositions/frames/<frame_id>.html`. Do not edit STORYBOARD.md, the rig, or assets.
8. Pagenum bottom-right: "NN / 09" in JetBrains Mono 13–16px, ink at 75%, at the pad-edge (inside y≤1040 is fine — it is chrome).

## Video direction

- **Look:** `frame.md` (Biennale Yellow) — warm `paper` ground on every frame, ONE `ink` for every line of type, every stroke and the stick figure; `sun` only as the radial sun-bloom atmosphere (one per frame) and the literal sun disc; `ember` is reserved for danger marks (a red X, the flame core) and never for text. No shadows besides the rig's soft ground ellipse, no rounded cards, no gradients other than blooms.
- **The castaway:** ONE stick-figure character in every frame, drawn ONLY with the shared rig `assets/castaway-rig.js` (paste it verbatim into your template script; use `CastawayRig.figure` + `CastawayRig.animate` with its named poses / `mix()`). Same proportions, stroke, face and hair tuft everywhere — never hand-draw another figure. Default scale 1.5 (≈330px tall), facing right unless the shot says otherwise. Faces change on the cue they belong to.
- **The stage:** a shared island set built with the rig's kit — `sea()` with the waterline at y≈800, an `island()` mound centered around x≈900 (halfWidth≈620, height≈120), one `palm()` right of center (x≈1250, base y≈770, scale ≈1.1), a `sun()` disc upper right inside a sun-bloom. Frames 4–7 reuse this exact stage so the steps feel like one place; frames may push in, pan, or go bird's-eye per their Scene lines.
- **Type:** visible text is SHORT labels only — a `micro-label` step tag ("STEP 1 · SHELTER") top-left at the pad-edge with a 1px ink hairline under it, plus at most one Instrument Serif hero word/number per frame. Never print narration sentences. Pagenum bottom-right in JetBrains Mono ("01 / 09"). Fonts ship in `assets/fonts/` (InstrumentSerif-Regular.woff2, InstrumentSerif-Italic.woff2, Archivo-Variable.woff2 for 400/600, JetBrainsMono-Regular.woff2) — declare `@font-face` for each family you use inside your template.
- **Line art props:** every prop (driftwood, fronds, bottle, coconut, crab, rocks, fire, plane) is ink line art (stroke 5–9px, round caps, `paper`/`paper-deep` fills only) so it matches the figure. Props that are "drawn on" use a stroke-dashoffset draw-on.
- **Motion grammar:** VO-paced reveals — at t=0 only what the voiceover is saying enters; each prop, label or action lands on its spoken cue (cue times are given per Scene, in frame-local seconds). Character acting carries the motion: poses ease `power2.inOut`, entrances `power3.out`, no bouncy springs except the small "pop" of a check mark. The rig's 8fps line boil keeps held frames alive — no extra breathing, floating or drifting.
- **Holds:** Frame 3 ("Breathe") and Frame 9 end on deliberate still reads; every other frame ends with its last action resolved and holding.
- **Negative list:** no slideshow (front-load then freeze), no screensaver (everything floating), no emoji, no clip-art, no photographic textures, no extra characters except the tiny plane/boat in frames 8–9, nothing below y=900 except the sea band and the pagenum.


