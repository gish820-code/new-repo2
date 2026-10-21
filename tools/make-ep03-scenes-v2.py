#!/usr/bin/env python3
"""Rainy Day — Episode 3: scene files v2.

1. Every scene -> ep03-<id>-<slug>-v2.html. Source = the hand-edited ep03-<id>-*-v2src.html when it exists (s03–s05
   close-ups, s07/s09/s12 named speakers, s14/s16/s17 tent marker + new exchange + end card), else the v1 scene.
   The pasted rig v3 is swapped for rig v4 + the scene's talk remap from episodes/ep03/ep03-speech-v2.json, so the
   authored mouth flaps follow the recorded lines.
2. s01 v2: the 5 s v1 recap is played over 6.2 s (outer timeline drives the inner one 0 -> 5) so the narration fits
   at natural speed.
3. h1 v2 (cold open, 2 s): a slice of s17 v2 — Gord's flashlight landing on Drizzle — with Gord's talk re-timed to
   where the cold open places his line ("Can't sleep, Drizzle?" at 0.2 s).
Usage: python3 tools/build-ep03-audio-v2.py && python3 tools/make-ep03-scenes-v2.py
"""
import json, os, re, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SC = os.path.join(ROOT, "compositions/ep03/scenes")
RIG3 = open(os.path.join(ROOT, "assets/characters/rainy-day-rig-v3.js")).read().strip()
RIG4 = open(os.path.join(ROOT, "assets/characters/rainy-day-rig-v4.js")).read().strip()
speech = json.load(open(os.path.join(ROOT, "episodes/ep03/ep03-speech-v2.json")))
ep = json.load(open(os.path.join(ROOT, "episodes/ep03/ep03-scenes-v2.json")))
scenes = {s["id"]: s for p in ep["parts"] for s in p["scenes"]}

H1_FROM = 11.4          # s17 v2 time where the cold-open slice starts (beam snaps on at +0.2 s)
GORD_LINE_V = 13.0      # s17 v2 voice start of "Can't sleep, Drizzle?"

def slug(t):
    return re.sub(r"(^-|-$)", "", re.sub(r"[^a-z0-9]+", "-", t.lower()))

def with_rig4(html, remap, name):
    if RIG3 not in html:
        raise SystemExit(f"{name}: rig v3 not found verbatim")
    inject = f"window.__rdTalkRemap = {json.dumps(remap)};  /* v2: authored talk re-timed onto the voice track (episodes/ep03/ep03-speech-v2.json) */\n"
    return html.replace(RIG3, inject + RIG4, 1)

def wrap(html, sid, nid, sdur, a, inner, dur):
    """Play inner seconds of the scene starting at a, over dur seconds."""
    if nid != sid:
        html = re.sub(r"\b" + sid + r"\b", nid, html)
    html = html.replace(f'data-duration="{sdur}"', f'data-duration="{dur}"')
    reg = f'window.__timelines["ep03-{nid}"] = tl;'
    if reg not in html:
        reg = "window.__timelines[COMP] = tl;"   # s17 registers via its COMP constant ("ep03-" + SID)
    assert html.count(reg) == 1, nid
    return html.replace(reg, (
        f'/* v2 wrapper: play {inner}s of the scene from {a}s over {dur}s */\n'
        f'  const segTl = gsap.timeline({{ paused: true }});\n'
        f'  segTl.fromTo(tl, {{ time: {a} }}, {{ time: {round(a + inner, 4)}, duration: {dur}, ease: "none" }}, 0);\n'
        f'  window.__timelines["ep03-{nid}"] = segTl;'))

out = {}
for sid, s in scenes.items():
    if sid == "h1":
        continue
    v2src = glob.glob(os.path.join(SC, f"ep03-{sid}-*-v2src.html"))
    src = v2src[0] if v2src else glob.glob(os.path.join(SC, f"ep03-{sid}-*-v1.html"))[0]
    html = with_rig4(open(src).read(), speech.get(sid, {}).get("remap", []), os.path.basename(src))
    m = re.search(r'data-composition-id="ep03-' + sid + r'"[^>]*data-duration="([\d.]+)"', html)
    sdur = float(m.group(1))
    if sid == "s01":
        html = wrap(html, "s01", "s01", m.group(1), 0, s["stretchFrom"], s["duration"])
    elif abs(sdur - s["duration"]) > 1e-6:
        raise SystemExit(f"{sid}: scene file is {sdur}s, episode JSON says {s['duration']}s")
    dst = os.path.join(SC, f"ep03-{sid}-{slug(s['title'])}-v2.html")
    open(dst, "w").write(html)
    out[sid] = (dst, m.group(1), html)
    print(f"{sid}: {os.path.basename(src)} -> {os.path.basename(dst)} ({len(speech.get(sid, {}).get('remap', []))} voiced spans)")

# --- h1: s17 slice, Gord's authored span moved to the cold-open line timing
h1 = scenes["h1"]
s17src = glob.glob(os.path.join(SC, "ep03-s17-*-v2src.html"))[0]
r17 = speech["s17"]["remap"]
gord = min(r17, key=lambda r: abs(r[2] - GORD_LINE_V))
h1v = speech["h1"]["remap"][0]           # [auth0, auth1, voice0, voice1] in h1 time
remap = [r for r in r17 if r is not gord] + [[gord[0], gord[1], round(H1_FROM + h1v[2], 3), round(H1_FROM + h1v[3], 3)]]
html = with_rig4(open(s17src).read(), remap, "h1 (from s17)")
sdur = re.search(r'data-composition-id="ep03-s17"[^>]*data-duration="([\d.]+)"', html).group(1)
html = wrap(html, "s17", "h1", sdur, H1_FROM, h1["duration"], h1["duration"])
dst = os.path.join(SC, f"ep03-h1-{slug(h1['title'])}-v2.html")
open(dst, "w").write(html)
print(f"h1: s17 v2 {H1_FROM} -> {H1_FROM + h1['duration']} -> {os.path.basename(dst)}; Gord talk {gord[:2]} -> {remap[-1][2:]}")
