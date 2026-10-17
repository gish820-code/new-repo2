#!/usr/bin/env python3
"""Rainy Day — Episode 1 v5: the 3-second cold-open hook (flash-forward before the title).

Builds two short scene compositions that REUSE existing animated scenes by driving their timelines from an outer
timeline (GSAP tween of the inner timeline's `time`), so the flash-forward shows the real animation with no redraw:
  h1  "Hook: Shaking"  — 1.5 s of s04 "It Keeps Going" (the kitchen mid-quake, a plate crash)   inner 4.2 → 5.7 s
  h2  "Hook: The Wave" — 1.5 s of s13b "The Lower Town" (the second wave hitting the town)       inner 5.0 → 6.5 s
Ids are re-prefixed (s04 → h1, s13b → h2) so the copies can live in the same page as the originals.
Usage: python3 tools/make-ep01-hooks-v5.py
"""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOOKS = [
    ("h1", "hook-shaking", "compositions/ep01/scenes/ep01-s04-it-keeps-going-v2.html", "s04", 20, 4.2, 1.5),
    ("h2", "hook-the-wave", "compositions/ep01/scenes/ep01-s13b-the-lower-town-v3.html", "s13b", 22, 5.0, 1.5),
]
for hid, slug, src, sid, sdur, a, dur in HOOKS:
    html = open(os.path.join(ROOT, src)).read()
    html = re.sub(r"\b" + sid + r"\b", hid, html)            # ids, SID, composition id ep01-<sid>
    html = html.replace(f'data-duration="{sdur}"', f'data-duration="{dur}"')
    reg = f'window.__timelines["ep01-{hid}"] = tl;'
    assert reg in html, src
    html = html.replace(reg, (
        f'/* v5 hook: play {dur}s of the original scene starting at {a}s */\n'
        f'  const hookTl = gsap.timeline({{ paused: true }});\n'
        f'  hookTl.fromTo(tl, {{ time: {a} }}, {{ time: {a + dur}, duration: {dur}, ease: "none" }}, 0);\n'
        f'  window.__timelines["ep01-{hid}"] = hookTl;'))
    out = os.path.join(ROOT, f"compositions/ep01/scenes/ep01-{hid}-{slug}-v1.html")
    open(out, "w").write(html)
    print("wrote", os.path.relpath(out, ROOT))
