#!/usr/bin/env python3
"""Episode 1 v8 — review stills (v1) from the finished renders + a captioned index (review/ep01-v8/README-review-v1.md)."""
import json, os, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "review/ep01-v8")
tl = json.load(open(os.path.join(ROOT, "episodes/ep01/ep01-v8-timeline-v1.json")))
FULL = os.path.join(ROOT, "renders/ep01/ep01-v8-full-16x9-v1.mp4")


def grab(src, t, dst, w):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", src, "-frames:v", "1", "-vf", f"scale={w}:-2", "-q:v", "3", dst], check=True)


def fmt(t):
    return f"{int(t // 60)}:{t % 60:04.1f}"


L = ["# Episode 1 v8 — review stills (v1)", "",
     "All stills come from the finished renders (`renders/ep01/ep01-v8-*-v1.mp4`): one per shot mid-shot (cards 0.7 in), "
     "1280 px wide; 9:16 stills 540 px wide. The style-frame images (`styleframe-*-v1.png`) are from the earlier approval step.", "",
     "## One still per shot (16:9)", ""]
for i, s in enumerate(tl["shots"], 1):
    t = s["t0"] + s["dur"] * (0.6 if s["kind"] == "shot" else 0.7)
    name = f"shots/shot-{i:02d}-v1.jpg"
    grab(FULL, t, os.path.join(OUT, name), 1280)
    L.append(f"- `{name}` — {fmt(t)} · {s['desc']}")
L += ["", "## Vertical parts (9:16), 3 stills each", ""]
for p in tl["parts"]:
    src = os.path.join(ROOT, f"renders/ep01/ep01-v8-part{p['part']}-9x16-v1.mp4")
    for tag, frac in (("a", 0.2), ("b", 0.55), ("c", 0.85)):
        t = p["dur"] * frac
        name = f"vertical/part{p['part']}-{tag}-v1.jpg"
        grab(src, t, os.path.join(OUT, name), 540)
        et = p["t0"] + t
        sh = next((s for s in tl["shots"] if s["t0"] <= et < s["t0"] + s["dur"]), None)
        L.append(f"- `{name}` — part {p['part']} at {fmt(t)} · {sh['desc'] if sh else ''}")
open(os.path.join(OUT, "README-review-v1.md"), "w").write("\n".join(L) + "\n")
print(f"{len(tl['shots'])} shot stills, {3 * len(tl['parts'])} vertical stills")
