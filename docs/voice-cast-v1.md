# Rainy Day — Voice cast registry (v1)

**The single source of truth for every voiced line in the series.** Every line in every episode is recorded with the
voice and settings in this table for its character. Rules:

1. **Never change a LOCKED row** (narrator, Drizzle, Mags, radio — the Episode 1–2 voices and settings).
2. **Never reuse a voice across two characters.** A voice ID appears in exactly one row.
3. **A new character gets a row here before their first line is recorded.**
4. **Swapping a voice** = edit that one row (bump this file to v2), then re-record only that character's lines (the
   per-line files are named `<shot>-<character>-vN.mp3`, so a swap touches nothing else).
5. Engine for all rows: **ElevenLabs v4 (`elevenlabs_v4`) via the Higgsfield MCP**, `dialogue: [{text, voice_type:
   "preset", voice_id}]`, `stability` and `similarity_boost` **omitted (provider defaults)** — exactly as in Episodes 1–2.
   Post-processing per row: the `fx` chain and `gain` below (applied when cutting each line); playback speed 1.00
   (a small atempo only as a last resort to fit a scene, logged per line).

| Character | Voice (Higgsfield preset) | Voice ID | Settings | Direction | Episodes |
|---|---|---|---|---|---|
| **NARRATOR** 🔒 | Arthur (male) | `30fc8796-ceb6-4a66-b3a7-4a145ef7f346` | defaults · fx none · gain 0 dB | warm, measured storyteller; never hurried | 1, 2, 3 |
| **DRIZZLE** 🔒 | Dylan (male) | `b847bc29-f184-583a-8ad9-d1f1e16d1a60` | defaults · fx none · gain 0 dB | bright, upbeat, a little goofy; cracks when scared | 1, 2, 3 |
| **MAGS** 🔒 | Mabel (female) | `fa64fba4-ad02-405e-99d0-1f085d87c706` | defaults · fx none · gain 0 dB | dry, blunt, older; short sentences | 1, 2, 3 |
| **RADIO** 🔒 | Grady (male) | `e2a2d2e6-9ed2-59cd-82af-feaa27f8a678` | defaults · fx **radio** (highpass 380 Hz, lowpass 2.7 kHz, compressor 6:1, +4 dB) · gain −2 dB | official broadcaster through static, fragments with pauses | 1, 2 |
| **GORD PIKE** | Gideon (male) | `1ad38ba4-9cc4-4f2f-9fde-b0fefdf67ae5` | defaults · fx none · gain 0 dB | big, loud, sure of himself; "Folks!" | 2, 3 |
| **TESS VARGA** | Sloane (female) | `b57b22a0-f287-405b-bc82-6f08f5e6bb1f` | defaults · fx none · gain 0 dB | quiet, clipped, guarded; few words | 2, 3 |
| **CAL PRUITT** (Ep 2 "PRUITT") | Knox (male) | `195e386a-cb61-5c1b-a53b-0e2f0669c408` | defaults · fx none · gain −1 dB | young deckhand, alert, practical | 2 |
| **DARLA FINCH** (Ep 2 "NEIGHBOR_F") | Juno (female) | `a3ce02fe-4d3e-55bc-b4d4-a4801b9acdb4` | defaults · fx none · gain −1 dB | frightened, fast, repeats what she heard | 2, 3 |
| **LYLE KEMPER** — inherits the shared Ep 1–2 neighbor voice | Jake (male) | `76fe86d8-bf3a-5ed8-ba52-f793b29cf71f` | defaults · fx none · gain −1 dB | flat, sure, borrows Gord's authority | 1–2 (as NEIGHBOR), 3 |
| **MILO VARGA** | Leo (male, high) | `73a45c18-0c56-4642-a61e-f6b303f8ded1` | defaults · fx none · gain 0 dB | 8-year-old: small, whispery, earnest | 3 |
| **MS. ORTEGA** | Marisol (female) | `75e72cd5-011b-4130-a474-e8b1ab341f04` | defaults · fx none · gain 0 dB | teacher voice: warm, clear, carries | — (first line Ep 4) |
| **WES PRUITT** | Ken (male) | `ceee41dc-0ee8-59a7-b3e8-2744116fcb5e` | defaults · fx none · gain 0 dB | young, raw, urgent (Cal's twin — deliberately a different voice) | 3 |
| **DANA REYES** | Karen (female) | `b483a172-2776-559b-b138-8853559b20ee` | defaults · fx none · gain 0 dB | low, tired, kind but short | 3 |
| **HANK DORSEY** | Bob (male) | `ca12fd00-218c-5198-b10c-7d36e768c12c` | defaults · fx none · gain 0 dB | middle-aged, gruff, "no offense" | 1–2 (as NEIGHBOR, Jake), 3 |
| **BENNY OCHOA** | Marcus (male) | `6f98d3dd-324f-4845-8c28-c1d1647a06cd` | defaults · fx none · gain 0 dB | dad; warm, practical, a little sheepish | 2 (as NEIGHBOR, Jake), 3 |
| **ROY** | Harrison (male) | `573e5163-59b3-4926-aab1-951ef2985f81` | defaults · fx none · gain 0 dB | older volunteer, hurting, plain-spoken | 3 |
| **RENNER** | Tamsin (female) | `9eb5a147-c322-4f8a-8bc5-a30679dfaf5c` | defaults · fx none · gain 0 dB | outsider: calm, weathered, not from here (non-local accent) | — (first line Ep 6) |

🔒 = LOCKED.

### Notes on continuity with Episodes 1–2
- In Episodes 1–2 one voice, **Jake**, played every unnamed male NEIGHBOR line (Ep 1 s07 phone line; Ep 2 s04, s06,
  s07, s08, s10). From Episode 3 on Jake belongs to **Lyle Kemper** alone — the cap man whose Ep 2 lines ("They'll come.
  They have to.", "It's just rainwater.", "Yeah! Why should he keep it?") carry the most weight. Hank (Ep 1 phone line,
  Ep 2 driver) and Benny (Ep 2 stove dad) were also voiced by Jake in the published episodes; they get their own
  voices from Episode 3. The published episodes are not re-voiced.
- Gord, Tess, Cal ("PRUITT") and Darla ("NEIGHBOR_F") keep the voices they were published with in Episode 2.
- Cast reel for review: `audio/voice-cast/cast-reel-v1.mp3` (each character announced by the narrator, then one line
  from their bible v3 voice sample; takes and job IDs in `audio/voice-cast/takes/` and `reel-urls-v1.tsv`; made by
  `tools/make-voice-cast-reel-v1.py`).
- **To verify by ear:** Milo (no Higgsfield preset is labeled as a child; Leo was chosen as the highest-pitched male
  voice, ~190–260 Hz) and Renner's accent (Tamsin chosen for a non-Pacific-Northwest sound).
