#!/usr/bin/env python3
"""Rainy Day — Episode 2: scene files v3 (pre-posting fixes).

1. Every v1 scene -> v3: pasted rig v3 swapped for rig v4 + the scene's talk remap from episodes/ep02/ep02-speech-v3.json
   (same as tools/make-ep02-scenes-v2.py, new speech map: s13 re-voiced with the water-heater intake/hot-tap lines).
2. s13 v3: Drizzle closes the intake at 11 s and opens the drain at 14 s (stream from 14.35 s), matching Mags' new lines.
   s17 v3: the "NEXT: DAY 1 · NIGHT" sting card is moved up/left and given a dark backing panel so it no longer
   collides with the tarp edge.
3. Segment wrappers for the scenes the new TikTok split cuts through (s06, s10, s14): each half re-uses the v3 scene,
   re-prefixed (s06 -> s06a / s06b), and drives its timeline from an outer timeline over [from, from + duration].
4. Cold-open hook h1 (TikTok part 1 / episode start): 1.9 s of s06 v3 (the crowd arguing), inner 1.55 -> 3.45 s.
Usage: python3 tools/build-ep02-audio-v3.py && python3 tools/make-ep02-scenes-v3.py
"""
import json, os, re, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SC = os.path.join(ROOT, "compositions/ep02/scenes")
RIG3 = open(os.path.join(ROOT, "assets/characters/rainy-day-rig-v3.js")).read().strip()
RIG4 = open(os.path.join(ROOT, "assets/characters/rainy-day-rig-v4.js")).read().strip()
speech = json.load(open(os.path.join(ROOT, "episodes/ep02/ep02-speech-v3.json")))
ep = json.load(open(os.path.join(ROOT, "episodes/ep02/ep02-scenes-v3.json")))

# --- 1 + 2: v3 scenes
v3 = {}
for src in sorted(glob.glob(os.path.join(SC, "ep02-s*-v1.html"))):
    sid = re.match(r"ep02-(s\d+b?)-", os.path.basename(src)).group(1)
    html = open(src).read()
    if RIG3 not in html:
        raise SystemExit(f"{os.path.basename(src)}: rig v3 not found verbatim")
    remap = speech.get(sid, {}).get("remap", [])
    inject = f"window.__rdTalkRemap = {json.dumps(remap)};  /* v3: authored talk re-timed onto the voice track (episodes/ep02/ep02-speech-v3.json) */\n"
    html = html.replace(RIG3, inject + RIG4, 1)
    if sid == "s13":
        # Ready.gov order on screen too: at 11 s Drizzle turns the INTAKE (no water), and only after Mags' "Open a hot tap,
        # then the drain" (13.4 s) does he open the drain valve (14 s) and the stream starts (14.35 s).
        old = """  dKeys.push({ t: 11.3, pose: VALVE, face: "o" });
  dKeys.push({ t: 12.2, pose: WATCH, face: "grin" });"""
        assert old in html
        html = html.replace(old, """  dKeys.push({ t: 11.3, pose: VALVE, face: "determined" });  /* v3: intake closed */
  dKeys.push({ t: 13.6, pose: VALVE, face: "determined" });
  dKeys.push({ t: 14.0, pose: VALVE_TURN, ease: "power1.inOut" });  /* v3: drain opened */
  dKeys.push({ t: 14.3, pose: VALVE, face: "o" });
  dKeys.push({ t: 14.9, pose: WATCH, face: "grin" });""")
        assert "const STREAM_ON = 11.35;" in html
        html = html.replace("const STREAM_ON = 11.35;", "const STREAM_ON = 14.35;  /* v3: after the hot tap + drain line */")
    if sid == "s17":
        old = "#s17-sting-card { position: absolute; left: 70px; top: 40px; width: 820px; text-align: center; transform-origin: 50% 60%; }"
        assert old in html
        html = html.replace(old, "#s17-sting-card { position: absolute; left: 28px; top: 14px; width: 820px; padding: 14px 24px 18px; "
                            "text-align: center; transform-origin: 50% 60%; background: rgba(16, 22, 31, 0.82); border-radius: 22px; "
                            "box-shadow: 0 6px 0 rgba(16, 22, 31, 0.5); }  /* v3: up/left + backing panel, clear of the tarp edge */")
    out = src[:-len("-v1.html")] + "-v3.html"
    open(out, "w").write(html)
    v3[sid] = out
    print(f"{sid}: {len(remap)} voiced spans")

def wrap(src_html, sid, nid, sdur, a, dur):
    html = re.sub(r"\b" + sid + r"\b", nid, src_html)      # element ids, SID constants, composition id ep02-<sid>
    html = html.replace(f'data-duration="{sdur}"', f'data-duration="{dur}"')
    reg = f'window.__timelines["ep02-{nid}"] = tl;'
    assert reg in html, nid
    return html.replace(reg, (
        f'/* v3 segment: play {dur}s of the original scene starting at {a}s */\n'
        f'  const segTl = gsap.timeline({{ paused: true }});\n'
        f'  segTl.fromTo(tl, {{ time: {a} }}, {{ time: {round(a + dur, 4)}, duration: {dur}, ease: "none" }}, 0);\n'
        f'  window.__timelines["ep02-{nid}"] = segTl;'))

# --- 3: segments
src_dur = {}
for p in ep["parts"]:
    for s in p["scenes"]:
        if s.get("source"):
            src_dur[s["source"]] = round(src_dur.get(s["source"], 0) + s["duration"], 4)
for p in ep["parts"]:
    for s in p["scenes"]:
        if not s.get("source"):
            continue
        src = s["source"]
        sdur = round(src_dur[src])
        html = open(v3[src]).read()
        assert f'data-composition-id="ep02-{src}"' in html and f'data-duration="{sdur}"' in html, src
        open(os.path.join(ROOT, s["file"]), "w").write(wrap(html, src, s["id"], sdur, s["sourceFrom"], s["duration"]))
        print("wrote", s["file"], f"({src} {s['sourceFrom']} -> {round(s['sourceFrom'] + s['duration'], 4)})")

# --- 4: cold-open hook
h1 = next(s for s in ep["parts"][0]["scenes"] if s["id"] == "h1")
open(os.path.join(ROOT, h1["file"]), "w").write(wrap(open(v3["s06"]).read(), "s06", "h1", 18, 1.55, h1["duration"]))
print("wrote", h1["file"])
