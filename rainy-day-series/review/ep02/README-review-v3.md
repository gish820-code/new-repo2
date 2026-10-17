# Episode 2 — v3 (fixes before posting)

v3 = v2 plus these pre-posting fixes. All five files are mastered to −14 LUFS (parts true peak ≤ −1.4 dBTP; full episode −0.4 dBTP). The full episode is 99.5 MB, just under GitHub's 100 MB limit.

1. **Water-heater lesson (factual gap).** s13 is re-voiced as one ElevenLabs take:
   - Mags: "Power off. Close the intake, or bad water gets in." / "Open a hot tap, then the drain."

   This is Ready.gov's order: power/gas off → close the cold-water intake → open a hot tap → drain. On screen,
   Drizzle turns the intake valve at 11 s with no water. He opens the drain only after the hot-tap line (14 s),
   and the stream and pour SFX start at 14.35 s. In v2 the stream started during the first line. The in-scene
   HIDDEN WATER sign was dropped so the exchange plays at natural pace (tempo 1.04 instead of 1.22).
2. **Cold open.** Part 1 and the full episode open with 1.9 s of the crowd arguing ("We'll be dead in weeks!",
   the real s06 animation and voice), then the recap.
3. **NEXT card.** The sting card in s17 is moved up and left onto a dark backing panel, clear of the tarp edge.
4. **TikTok split.** Scenes are cut at the line boundaries, so s06, s10 and s14 are split into a/b segments
   (`tools/make-ep02-scenes-v3.py`).

| Part | Length | Episode time | Ends on |
|---|---|---|---|
| 1 | 1:24 | 0:00–1:24 | "I'm driving out. I'm not waiting." |
| 2 | 1:26 | 1:24–2:50 | "Nobody takes anything from anybody. Not today." |
| 3 | 1:09 | 2:50–3:59 | "Into the flood zone? Any aftershock can send another wave." |
| 4 | 1:07 | 3:59–5:06 | "NEXT: DAY 1 · NIGHT" |

Times differ slightly from the suggested 1:18 / 2:42 / 3:54 because they follow the voiced lines plus the 1.9 s
cold open.

Stills (9:16 renders): `ep02-v3-*-v3.png`, covering the cold open, recap, part ends, the water-heater intake and
drain shots, and the NEXT card.

Pipeline:
```
python3 tools/build-ep02-audio-v3.py
python3 tools/make-ep02-scenes-v3.py
node tools/build-ep02-v3.mjs
bash tools/render-ep02-chain-v3.sh 1 2 3 4 full
```
