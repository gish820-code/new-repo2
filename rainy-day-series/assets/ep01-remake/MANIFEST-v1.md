# Episode 1 remake — generated assets MANIFEST (v1)

Backgrounds for the Phase B build (style locked to Phase A option B). Higgsfield MCP `generate_image`, model `nano_banana_pro` (job records report `nano_banana_2`), 16:9, 2k → 2752×1536 PNG, **every generation passed the Phase A style-B kitchen job (`c539d92e-…`) as an `image_references` input** so all plates share the look. Every prompt starts with the same style text:

> Style: ink linework with watercolor wash, grayscale, muted, rainy Pacific Northwest coastal town, no people, no characters, no text. Match the drawing style of the reference image exactly (black ink lines, crosshatching, loose gray watercolor washes, paper texture).

followed by the scene description (see `tools/` history / this conversation; summarised in the table). 1920×1080 cover-fit working copies used by the compositions are in `bg-1920/` (JPEG q3). In the episode every plate is shown through `grayscale(1)` (the AI added blue to the evacuation signs), so Drizzle's slicker stays the only saturated color; the one warm light at the very end is a vector overlay.

| ID | Plate | File (`assets/ep01-remake/bg/`) | Higgsfield job ID | Attempt |
|---|---|---|---|---|
| bg01 | Kitchen (reused from Phase A style B; also the lights-out shots, darkened in HyperFrames) | `assets/ep01-v6/bg/kitchen-style-B-v1.png` | `c539d92e-f43b-4a52-b06c-a2e955054264` | Phase A |
| bg02 | Kitchen after the quake | `bg02-kitchen-wrecked-v1.png` | `8e89c17b-f7cd-4934-8faf-7faf2bb5ba70` | 1 |
| bg03 | Under-the-table low angle | `bg03-under-table-v1.png` | `6e88567e-9f49-407a-924d-368c9ea219c0` | 1 |
| bg04 | Gull Harbor main street after the quake | `bg04-main-street-v1.png` | `21ac71b8-379c-4bac-a5c2-f5caa9fc9797` | 1 |
| bg05 | Harbor drained | `bg05-harbor-drained-v1.png` | `259a16a4-f548-4429-8895-afcbdf2bfe2e` | 1 |
| bg06 | Harbor Way traffic jam + evacuation sign | `bg06-harbor-way-jam-v1.png` | `4bb19a16-f62b-4c35-8dfa-ea1c6ecbeaef` | 1 |
| bg07 | Evacuation trail | `bg07-evac-trail-v1.png` | `cf82d8ef-8f1d-441f-874e-14aca6201f5c` | 1 |
| bg08 v1 | View back from the trail (REJECTED: the wave came out as a tall wall, not a line; kept, unused) | `bg08-view-back-v1.png` | `b9fbf560-eb90-4a99-9673-6d87c65ade9a` | 1 |
| bg08 v2 | View back from the trail: thin gray line on the horizon (USED) | `bg08-view-back-v2.png` | `57daa088-9782-4599-b3cc-aa0c909cf447` | 2 |
| bg09 | The wave hitting town from above (also the cold open) | `bg09-wave-hits-v1.png` | `0d67e4a3-28a4-44e2-9a27-2b44749811ba` | 1 |
| bg10 | Hilltop assembly area by day | `bg10-hilltop-day-v1.png` | `7a1d41d9-74a3-48f9-bc2a-d8179c42a16e` | 1 |
| bg11 | Hilltop at dusk over the flooded town | `bg11-hilltop-dusk-v1.png` | `80b59ff4-09c5-4009-a6d3-5560ded2ed12` | 1 |
| bg12 | Radio insert surface: weathered wet wood | `bg12-radio-surface-v1.png` | `a7a14839-276c-477f-87dc-5f80793a7787` | 1 |

**Credits (Phase B):** 94.23 at start → 90.78 after the 3 voice samples (3.45) → 71.69 after the 36 narration lines (19.09) → 47.69 after 12 background generations (24.00, 2 each). **Total Phase B: 46.54 credits.**

**Not AI-generated:** the radio insert's hand-crank radio is a HyperFrames vector drawn in the same ink style (`assets/ep01-remake/ep01r-runtime-v1.js`, `FX.radio`), so no prop generation was needed. The kitchen clock hands are masked and redrawn in HyperFrames (10:42 before the quake, 10:46 after).
