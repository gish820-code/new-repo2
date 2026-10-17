#!/usr/bin/env python3
"""Rainy Day — Episode 2: scene files v1 -> v2 (voiced version).

v2 scenes are the v1 scenes with the pasted rig v3 swapped for rig v4 (assets/characters/rainy-day-rig-v4.js) and, just
before it, the scene's talk remap from episodes/ep02/ep02-speech-v2.json:
    window.__rdTalkRemap = [[authoredT0, authoredT1, voiceT0, voiceT1], ...];
so every figure's authored mouth flaps are re-timed onto the voice track. Nothing else in a scene changes.
Usage: python3 tools/make-ep02-scenes-v2.py   (after tools/build-ep02-audio-v2.py)
"""
import json, os, re, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RIG3 = open(os.path.join(ROOT, "assets/characters/rainy-day-rig-v3.js")).read().strip()
RIG4 = open(os.path.join(ROOT, "assets/characters/rainy-day-rig-v4.js")).read().strip()
speech = json.load(open(os.path.join(ROOT, "episodes/ep02/ep02-speech-v2.json")))
for src in sorted(glob.glob(os.path.join(ROOT, "compositions/ep02/scenes/ep02-s*-v1.html"))):
    sid = re.match(r"ep02-(s\d+b?)-", os.path.basename(src)).group(1)
    html = open(src).read()
    if RIG3 not in html:
        raise SystemExit(f"{os.path.basename(src)}: rig v3 not found verbatim")
    remap = speech.get(sid, {}).get("remap", [])
    inject = f"window.__rdTalkRemap = {json.dumps(remap)};  /* v2: authored talk re-timed onto the voice track (episodes/ep02/ep02-speech-v2.json) */\n"
    open(src[:-len("-v1.html")] + "-v2.html", "w").write(html.replace(RIG3, inject + RIG4, 1))
    print(f"{sid}: {len(remap)} voiced spans")
