#!/usr/bin/env python3
"""Episode 3 v1 — review stills from the finished renders + a captioned index (review/ep03/README-review-v1.md).
One 16:9 still per scene at its middle caption cue, and 3 stills per 9:16 part."""
import json, os, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "review/ep03")
files = json.load(open(os.path.join(ROOT, "episodes/ep03/scene-files-v1.json")))
ep = json.load(open(os.path.join(ROOT, "episodes/ep03/ep03-scenes-v1.json")))
caps = {s["id"]: s["captions"] for p in ep["parts"] for s in p["scenes"]}


def grab(src, t, dst, w):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", src, "-frames:v", "1", "-vf", f"scale={w}:-2", "-q:v", "3", dst], check=True)


def fmt(t):
    return f"{int(t // 60)}:{t % 60:04.1f}"


L = ["# Episode 3 v1 — review stills", "", "From `renders/ep03/ep03-*-v1.mp4` (captions only). 16:9 stills 1280 px wide, 9:16 stills 540 px wide.", "",
     "## One still per scene (16:9, at the middle caption)", ""]
for f in files:
    c = caps[f["id"]][len(caps[f["id"]]) // 2]
    t = f["epStart"] + (c["t0"] + c["t1"]) / 2
    name = f"scenes/{f['id']}-v1.jpg"
    grab(os.path.join(ROOT, "renders/ep03/ep03-full-16x9-v1.mp4"), t, os.path.join(OUT, name), 1280)
    L.append(f"- `{name}` — {fmt(t)} · {f['id']} {f['title']} · {(c.get('speaker', '') + ': ') if c.get('speaker') else ''}{c['text']}")
L += ["", "## Vertical parts (9:16)", ""]
for p in ep["parts"]:
    dur = sum(s["duration"] for s in p["scenes"])
    for tag, frac in (("a", 0.2), ("b", 0.55), ("c", 0.9)):
        name = f"vertical/part{p['part']}-{tag}-v1.jpg"
        grab(os.path.join(ROOT, f"renders/ep03/ep03-part{p['part']}-9x16-v1.mp4"), dur * frac, os.path.join(OUT, name), 540)
        L.append(f"- `{name}` — part {p['part']} \"{p['title']}\" at {fmt(dur * frac)}")
open(os.path.join(OUT, "README-review-v1.md"), "w").write("\n".join(L) + "\n")
print(len(files), "scene stills, 12 vertical stills")
