# Episode 1 v8 — plates manifest (v1)

Reference-style cartoon plates (clean ink outlines, muted cool color, painted rain) for the survival-guide revamp.
Generator: Higgsfield `nano_banana_pro` (job records report `nano_banana_2`), 16:9, 2k → 2752×1536 PNG, 2 credits each.
Style lock: the test plate (`kitchen-ref-style-test-v1.png`) was made from a text-only style prompt (third-party reference
screenshots were not uploaded anywhere); p01 used the test plate as image reference, p02–p10 used p01's job as reference.

| File | Job ID | Used for |
|---|---|---|
| `bg/kitchen-ref-style-test-v1.png` | `cde8db8f-e0ca-476c-81ba-2fe144f19102` | style frame only |
| `bg/p01-kitchen-v1.png` | `3df1bbec-191c-4f91-ba7e-049c7cf4f533` | Part 1 kitchen (clock fixed to 10:42 in the runtime) |
| `bg/p02-kitchen-wrecked-v1.png` | `ff7d8068-48d7-4e1d-9253-f10d3f59dcfd` | Part 2 kitchen after the quake (clock 10:46) |
| `bg/p03-main-street-v1.png` | `e91d5ab7-959b-4bcc-8945-83c5bc04de26` | cracked Main Street |
| `bg/p04-harbor-drained-v1.png` | `7934c520-bcc3-4d70-b414-e8c350040e33` | the drained harbor |
| `bg/p05-harbor-way-jam-v1.png` | `85037788-6e26-449e-b313-730815654432` | Harbor Way jam + evacuation sign |
| `bg/p06-evac-trail-v1.png` | `f9bd80e9-9e99-4eb4-a0e6-07f98b0ef1aa` | evacuation trail |
| `bg/p07-view-back-v1.png` | `4553d9e4-35c3-4309-b468-2872a82ddbe9` | switchback view of the town |
| `bg/p08-wave-hits-v1.png` | `13c4eec1-f028-430d-bb4b-47c0b1aefa0e` | cold open + the first wave |
| `bg/p09-hilltop-day-v1.png` | `43811f10-b5ef-4eaf-b640-19e3fd51f875` | hilltop check-in area |
| `bg/p10-hilltop-dusk-v1.png` | `19763f1e-00e5-44d7-a170-2393ab78525c` | dusk, the flooded town |

Working copies: `bg-1920/*.jpg` (measuring), `bg-2560/*.jpg` (what the compositions load — sharper on push-ins).
`card-noise-v1.png`: tiled grain for the dark-gray cards (generated locally).

Scale calibration (rig scale vs. the feet's y, per plate) lives in `SCALE` in `tools/build-ep01-v8-v1.py`, each
calibrated on a known object (kitchen table 30 in, sedan, sign post, fence posts, check-in table).

Credits: v8 narration (30 new lines) + 11 images spent 37.71 credits (45.69 → 7.98).
