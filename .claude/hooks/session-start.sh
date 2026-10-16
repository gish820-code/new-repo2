#!/bin/bash
# SessionStart hook: prepare HyperFrames video work in Claude Code cloud sessions.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}"

# Offline narration engine used by `hyperframes tts` / the workflows' audio step (Kokoro).
if ! python3 -c "import kokoro_onnx, soundfile" >/dev/null 2>&1; then
  pip install --quiet --disable-pip-version-check kokoro-onnx soundfile
fi

# Restore saved HyperFrames recipes into the user tier (~/.media/recipes is wiped with the container).
if [ -d hyperframes-recipes ]; then
  mkdir -p "$HOME/.media/recipes"
  for dir in hyperframes-recipes/*/; do
    [ -f "$dir/recipe.json" ] || continue
    name="$(basename "$dir")"
    mkdir -p "$HOME/.media/recipes/$name"
    cp -f "$dir"*.md "$dir"recipe.json "$HOME/.media/recipes/$name/" 2>/dev/null || true
  done
fi

# Warm the HyperFrames CLI into the npx cache so the first command is fast.
npx --yes hyperframes@0.8.166 --version >/dev/null 2>&1 || true
