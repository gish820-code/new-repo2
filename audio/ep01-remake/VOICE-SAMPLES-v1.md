# Ep1 remake — narrator voice samples (v1)

No direct ElevenLabs API key and no `NARRATOR_VOICE_ID` are set in this environment, so the samples were made with
ElevenLabs (model `elevenlabs_v4`) through the Higgsfield MCP — the same route as every voice in Episodes 1 and 2.
Each sample reads the script's first three N: lines as one take:

> In Gull Harbor, it rains two hundred days a year. Drizzle was ready for every one of them. / He was ready for rain. He
> was not ready for this. / At 10:42 on a Tuesday morning, his coffee cup started to shiver. Then the floor moved.

Voices were short-listed by measuring the median pitch of 15 male preset previews and keeping the lowest, steadiest ones.

| File | Voice | voice_id | Preview median pitch | Length | Higgsfield job |
|---|---|---|---|---|---|
| `voice-sample-1-v1.mp3` | Alistair | `d9d5c263-f84e-4752-97b5-3750fcc6fd2f` | ~82 Hz (lowest) | 16.6 s | `ac245843-f710-4fcc-aef1-8ec38e33c2a9` |
| `voice-sample-2-v1.mp3` | Sterling | `dc382508-c8bd-443c-8cb2-46e57b8d2e6f` | ~91 Hz | 16.4 s | `fbaa413a-cc08-4786-9826-cac5d2e6b99d` |
| `voice-sample-3-v1.mp3` | Orion | `ed69c516-92d2-4b30-a967-617737a342e5` | ~109 Hz (most even) | 14.8 s | `436b0ffb-54ab-4027-891b-ac1a15ee8067` |

Credits: 94.23 → 90.78 (3.45 for all three). Episode 1 v4/v5's narrator (Arthur, ~139 Hz) was not included: it is
noticeably higher than the "calm, low" brief.
