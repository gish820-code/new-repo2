# Episode 1 remake (v6) — generated assets MANIFEST (v1)

Phase A art-style test: one empty kitchen background (the opening still) in 4 styles, identical composition text, only the style line changes.

- **Generator:** Higgsfield MCP `generate_image`, model `nano_banana_pro` (the job records report it as `nano_banana_2`), 16:9, resolution 2k → 2752×1536 PNG.
- **Attempts:** 1 per style (max 2 allowed). B and D were first rejected at submission ("out of credits" while two jobs were already running; no charge, no job created) and went through when resubmitted one at a time. That counts as their first and only generation.
- **Credits:** 102.23 before → 94.23 after = **8 credits** (2 per image).
- **Clock note:** the prompt asks for 10:42, but none of the four clock faces reads 10:42 exactly (see the table). In Phase B the clock hands are a vector overlay so the time is always exact.

| Style | File | Higgsfield job ID | Clock reads | Source URL (cloudfront) |
|---|---|---|---|---|
| A · Painterly semi-realistic | `assets/ep01-v6/bg/kitchen-style-A-v1.png` | `31e22198-24bb-4d15-b758-a5e231a70d99` | about 10:00 | hf_20261018_000643_31e22198-24bb-4d15-b758-a5e231a70d99.png |
| B · Ink linework + watercolor wash | `assets/ep01-v6/bg/kitchen-style-B-v1.png` | `c539d92e-f43b-4a52-b06c-a2e955054264` | about 10:10 | hf_20261018_000729_c539d92e-f43b-4a52-b06c-a2e955054264.png |
| C · Gouache storybook | `assets/ep01-v6/bg/kitchen-style-C-v1.png` | `2097dbe3-15a8-456e-a019-b8a36ec3c21b` | about 10:10 | hf_20261018_000643_2097dbe3-15a8-456e-a019-b8a36ec3c21b.png |
| D · Cinematic matte painting | `assets/ep01-v6/bg/kitchen-style-D-v1.png` | `6441e538-ff98-42aa-a41a-97f0cb876198` | about 10:10 | hf_20261018_000754_6441e538-ff98-42aa-a41a-97f0cb876198.png |

## Prompts

Each prompt = `STYLE: <style line> ` + the shared scene text below.

- **A:** STYLE: painterly semi-realistic digital painting, visible soft brush strokes, muted and moody, like a detailed background painting from an animated survival explainer channel.
- **B:** STYLE: graphic-novel illustration, confident black ink linework with crosshatching, loose watercolor wash fills that bleed past the lines, paper texture.
- **C:** STYLE: gouache storybook illustration, soft matte opaque paint, gentle rounded shapes, visible dry-brush texture and paper grain, cozy but melancholy picture-book feel.
- **D:** STYLE: cinematic matte painting, high detail, film-still realism, cool overcast rainy light, atmospheric depth, subtle volumetric window light, anamorphic film look.

**Shared scene text:**

> SCENE (empty background plate, NO people, NO characters, NO animals, NO figures): interior of a small coastal-cottage kitchen on a gray rainy morning, wide eye-level shot, 16:9. Left third: a large multi-pane window above the sink, heavy rain streaking and beading on the glass, blurred gray sea and dark fir trees outside. Center: an open, empty stretch of worn wooden floorboards in front of the counters, kept clear (space reserved for a character). Right of center: a small square wooden kitchen table with two wooden chairs; a single plain white ceramic coffee mug on the table with a thin wisp of steam. On the wall above the table, a simple round wall clock whose hands clearly show 10:42. A pendant lamp hangs over the table, unlit. Far right: the closed wooden front door, and beside it a slate-gray hiking backpack hanging on a wall hook. Palette: muted, desaturated cool blue-grays, slate, and soft fog-white; low saturation; absolutely no yellow and no saturated colors anywhere. Soft cool window light, quiet tense mood. No text other than the clock face.

## Composites

`tools/make-ep01-v6-styletest-v1.py` builds one HyperFrames composition (snapshot with `npx hyperframes snapshot`, HyperFrames 0.8.169): each plate cover-fit to 1920×1080 plus the SAME rig Drizzle (`assets/characters/rainy-day-rig-v4.js`, pose idle, smile, facing right, hip x 900, scale 1.6, feet at y 1000). The `DAY 0 · 10:42 AM` card frame per style uses the same layout, icon and text, with the edge and texture styled to match the option. Outputs are in `review/ep01-v6/`.
