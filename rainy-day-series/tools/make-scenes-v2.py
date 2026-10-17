#!/usr/bin/env python3
"""Rainy Day — Episode 1: scene files v1 -> v2.

v2 scenes are the v1 scenes with the pasted rig v1 swapped for rig v2 (assets/characters/rainy-day-rig-v2.js) and,
just before it, the scene's speech map from episodes/ep01/ep01-speech-v4.json:
    window.__rdSpeech = { "drizzle": [[t0, t1], ...], "mags": [...] };
so every mouth flap follows the v4 voice track instead of the v1 caption cues. Nothing else in a scene changes.
Usage: python3 tools/make-scenes-v2.py   (after tools/build-ep01-audio-v4.py)
"""
import json, os, re, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RIG1 = open(os.path.join(ROOT, "assets/characters/rainy-day-rig-v1.js")).read().strip()
RIG2 = open(os.path.join(ROOT, "assets/characters/rainy-day-rig-v2.js")).read().strip()
speech = json.load(open(os.path.join(ROOT, "episodes/ep01/ep01-speech-v4.json")))
for src in sorted(glob.glob(os.path.join(ROOT, "compositions/ep01/scenes/ep01-s*-v1.html"))):
    sid = re.match(r"ep01-(s\d+b?)-", os.path.basename(src)).group(1)
    html = open(src).read()
    if RIG1 not in html:
        raise SystemExit(f"{os.path.basename(src)}: rig v1 not found verbatim")
    sp = speech.get(sid, {})
    inject = f"window.__rdSpeech = {json.dumps(sp)};  /* v2: mouth flaps follow the voice track (episodes/ep01/ep01-speech-v4.json) */\n"
    out = html.replace(RIG1, inject + RIG2, 1)
    dst = src[:-len("-v1.html")] + "-v2.html"
    open(dst, "w").write(out)
    print(f"{os.path.relpath(dst, ROOT)}: drizzle {len(sp.get('drizzle', []))} / mags {len(sp.get('mags', []))} speech spans")
