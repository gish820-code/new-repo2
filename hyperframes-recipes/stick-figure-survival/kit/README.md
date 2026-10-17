# stick-figure-survival kit

Companion files for the `stick-figure-survival` HyperFrames recipe (faceless-explainer · Biennale Yellow ·
Kokoro voice `bm_george` · 16:9). First made for `videos/desert-island-survival`.

The recipe itself (`../recipe.json`, `../frame.md`, the skeletons) is restored into `~/.media/recipes/`
by `.claude/hooks/session-start.sh`, so `recipe.mjs use --name stick-figure-survival` works in a fresh
container. This kit holds what the recipe format does not carry:

| File | Copy to (in the new project) | Why |
| --- | --- | --- |
| `castaway-rig.js` | `assets/castaway-rig.js` | The shared stick-figure character + island kit (sea, island, palm) + forest kit (ground, forest, pine, leafyTree, stream). Every frame pastes it verbatim. |
| `gsap.min.js` | `assets/gsap.min.js` | The jsdelivr CDN is blocked in this environment; GSAP must load locally. |
| `fonts/*.woff2` | `assets/fonts/` | Instrument Serif, Archivo, JetBrains Mono for frame.md. |
| `dispatch-template.md` | `.hyperframes/frame-packets/_dispatch.md` | Worker overrides (no GSAP tag, mandatory rig, fonts, ids). Replace its `## Video direction` with the new storyboard's. |

## Pipeline notes (learned the hard way)

1. Narration: `audio.mjs --voice bm_george`. Word timings are empty offline (Whisper downloads from
   Hugging Face, which is blocked) → captions off; time reveals with
   `ffmpeg -af silencedetect=noise=-35dB:d=0.18` on each `assets/voice/NN.wav`.
2. After `assemble-index.mjs`, swap the CDN GSAP tag in `index.html` for `assets/gsap.min.js`.
3. Run `transitions.mjs inject` exactly ONCE per assembly — it is additive and stretches frame
   durations if re-run. To redo: re-run `assemble-index.mjs`, restore frames from git, then inject.
4. Render only after EVERY frame worker has reported back; a late write discards the injected transition.
5. Rig poses animate via onUpdate; HyperFrames' seek fires callbacks, so snapshots/renders move.
