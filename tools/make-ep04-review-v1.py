#!/usr/bin/env python3
"""Episode 4 v1 — review stills from the finished full render + a captioned index (review/ep04/README-review-v1.md):
one still per caption (dialogue/narration/sign) plus the stings and montage cuts, and 3 stills per 9:16 part."""
import json, os, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "review/ep04")
FULL = os.path.join(ROOT, "renders/ep04/ep04-full-16x9-v1.mp4")
ep = json.load(open(os.path.join(ROOT, "episodes/ep04/ep04-scenes-v1.json")))
files = {f["id"]: f for f in json.load(open(os.path.join(ROOT, "episodes/ep04/scene-files-v1.json")))}

def grab(src, t, dst, w):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", src, "-frames:v", "1", "-vf", f"scale={w}:-2", "-q:v", "3", dst], check=True)


def fmt(t):
    return f"{int(t // 60)}:{t % 60:04.1f}"


def line(c):
    return f"{c['speaker']}: {c['text']}" if c.get("speaker") else c["text"]


shots = []  # (group, name, scene, scene time, caption)
extra = {"s02": [(1.5, "RAINY DAY title sting")], "s04": [(1.4, "DAY 4 card")] + [(2.6 + 1.25 * k + 0.6, f"montage cut {k + 1}") for k in range(5)],
         "s05": [(3.0, "tracker cards: WATER 6 · FOOD 10 · PEOPLE 212")], "s18": [(15.0, "Gord's tent"), (22.5, "NEXT: DAY 9 card")]}
for p in ep["parts"]:
    for s in p["scenes"]:
        items = [((c["t0"] + c["t1"]) / 2, line(c) + (f"  [name tag: {c['tag']}]" if c.get("tag") else "")) for c in s["captions"]] + extra.get(s["id"], [])
        for k, (st, what) in enumerate(sorted(items)):
            shots.append((f"Part {p['part']} — {p['title']}", f"{s['id']}-{k + 1:02d}", s["id"], st, what))

L = ["# Episode 4 v1 — review stills", "", "From `renders/ep04/ep04-full-16x9-v1.mp4` (16:9 stills 1280 px wide) and the 9:16 parts (540 px wide).", ""]
group = None
for g, name, sid, st, what in shots:
    if g != group:
        L += ["", f"## {g}", ""]
        group = g
    t = files[sid]["epStart"] + st
    grab(FULL, t, os.path.join(OUT, name + ".jpg"), 1280)
    L.append(f"- `{name}.jpg` — {fmt(t)} · {sid} +{st:.1f}s · {what}")
L += ["", "## Vertical parts (9:16)", ""]
for p in ep["parts"]:
    dur = sum(s["duration"] for s in p["scenes"])
    for tag, frac in (("a", 0.03), ("b", 0.5), ("c", 0.97)):
        name = f"vertical/part{p['part']}-{tag}-v1.jpg"
        grab(os.path.join(ROOT, f"renders/ep04/ep04-part{p['part']}-9x16-v1.mp4"), dur * frac, os.path.join(OUT, name), 540)
        L.append(f"- `{name}` — part {p['part']} \"{p['title']}\" at {fmt(dur * frac)}")
open(os.path.join(OUT, "README-review-v1.md"), "w").write("\n".join(L) + "\n")
print(len(shots), "review stills, 12 vertical stills")
