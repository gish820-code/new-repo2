#!/usr/bin/env python3
"""Episode 1 remake — review stills (v1) from the finished renders + a captioned index.

  review/ep01-remake/shots/shot-NN-v1.jpg   one still per shot, from the 16:9 render (mid-shot; cards at +1.2 s)
  review/ep01-remake/cards/card-NN-v1.jpg   every card once
  review/ep01-remake/vertical/partN-a|b-v1.jpg  2 stills per 9:16 part
  review/ep01-remake/walk-cycle-strip-v1.png  (made separately from a walk test; listed here)
  review/ep01-remake/README-review-v1.md   every image with a one-line caption
"""
import json, os, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "review/ep01-remake")
tl = json.load(open(os.path.join(ROOT, "episodes/ep01/ep01-remake-timeline-v1.json")))
FULL = os.path.join(ROOT, "renders/ep01/ep01-remake-full-16x9-v1.mp4")


def grab(src, t, dst, w):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", src, "-frames:v", "1", "-vf", f"scale={w}:-2", "-q:v", "3", dst], check=True)


def fmt(t):
    return f"{int(t // 60)}:{t % 60:04.1f}"


L = ["# Episode 1 remake — review stills (v1)", "",
     "All stills come from the finished renders (`renders/ep01/ep01-remake-*-v1.mp4`). Shot stills are taken mid-shot "
     "(cards 1.2 s in, after the pop settles); JPEG, 1280 px wide for 16:9 and 540 px wide for 9:16.", "",
     "## Walk cycle", "", "- `walk-cycle-strip-v1.png` — 6 frames across one stride of the procedural rig-v5 walk (1.8 steps/s): knees bend forward, "
     "the planted foot stays put (≤1 px drift, i.e. only the line boil), arms swing opposite the legs, ~4 px body bob.", "",
     "## One still per shot (16:9)", ""]
cards = []
for i, s in enumerate(tl["shots"], 1):
    t = s["t0"] + (min(1.2, s["dur"] * 0.6) if s["kind"] == "card" else s["dur"] * 0.55)
    name = f"shots/shot-{i:02d}-v1.jpg"
    grab(FULL, t, os.path.join(OUT, name), 1280)
    L.append(f"- `{name}` — {fmt(t)} · {s['desc']}")
    if s["kind"] == "card":
        cards.append((t, s))
L += ["", "## Every card once", ""]
for j, (t, s) in enumerate(cards, 1):
    name = f"cards/card-{j:02d}-v1.jpg"
    grab(FULL, t, os.path.join(OUT, name), 1280)
    L.append(f"- `{name}` — {fmt(t)} · {s['desc'].split(' (')[0]}")
L += ["", "## Vertical parts (9:16), 2 stills each", ""]
for p in tl["parts"]:
    src = os.path.join(ROOT, f"renders/ep01/ep01-remake-part{p['part']}-9x16-v1.mp4")
    for tag, frac in (("a", 0.3), ("b", 0.8)):
        t = p["dur"] * frac
        name = f"vertical/part{p['part']}-{tag}-v1.jpg"
        grab(src, t, os.path.join(OUT, name), 540)
        # which shot is on screen
        et = p["t0"] + t
        sh = next((s for s in tl["shots"] if s["t0"] <= et < s["t0"] + s["dur"]), None)
        L.append(f"- `{name}` — part {p['part']} at {fmt(t)} · {sh['desc'] if sh else ''}")
open(os.path.join(OUT, "README-review-v1.md"), "w").write("\n".join(L) + "\n")
print(f"{len(tl['shots'])} shot stills, {len(cards)} cards, {2 * len(tl['parts'])} vertical stills")
