#!/usr/bin/env python3
"""Episode 5 v1 — proof stills (review/ep05/README-review-v1.md):
  1. establishing shot of every new location (scene-file frames, no captions);
  2. one still per SHOT from the 16:9 render (cuts found with ffmpeg scene detection + every scene start);
  3. every resource card, every name tag;
  4. the four clean cover stills (no captions): review/ep05/cover-partN-v1.png (1920x1080, from the scene files).
Usage: python3 tools/make-ep05-review-v1.py"""
import json, os, re, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "review/ep05")
FULL = os.path.join(ROOT, "renders/ep05/ep05-full-16x9-v1.mp4")
ep = json.load(open(os.path.join(ROOT, "episodes/ep05/ep05-scenes-v1.json")))
files = {f["id"]: f for f in json.load(open(os.path.join(ROOT, "episodes/ep05/scene-files-v1.json")))}
cfg = json.load(open(os.path.join(ROOT, "review/ep05/review-points-v1.json")))   # hand-picked scene times
os.makedirs(OUT, exist_ok=True)


def grab(t, dst, w=1280):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", FULL, "-frames:v", "1", "-vf", f"scale={w}:-2", "-q:v", "3", dst], check=True)


def scene_png(sid, t, dst):
    """clean frame straight from the scene file (no captions), 1920x1080"""
    tmp = os.path.join(OUT, ".tmp-" + sid)
    subprocess.run(["node", os.path.join(ROOT, "tools/preview-scene-v1.mjs"), os.path.join(ROOT, files[sid]["file"]), f"{t}", tmp], check=True, capture_output=True)
    png = [f for f in os.listdir(tmp) if f.endswith(".png")][0]
    os.replace(os.path.join(tmp, png), dst)
    subprocess.run(["rm", "-rf", tmp])


def fmt(t):
    return f"{int(t // 60)}:{t % 60:04.1f}"


L = ["# Episode 5 v1 — proof stills", "", "16:9 stills from `renders/ep05/ep05-full-16x9-v1.mp4` (1280 px wide, with captions); "
     "establishing shots and covers are clean frames rendered straight from the scene files (1920×1080, no captions).", ""]
L += ["## Covers (one per TikTok part, no captions)", ""]
for n, (sid, t, what) in enumerate(cfg["covers"], 1):
    scene_png(sid, t, os.path.join(OUT, f"cover-part{n}-v1.png"))
    L.append(f"- `cover-part{n}-v1.png` — part {n}: {what} ({sid} +{t}s)")
L += ["", "## Establishing shot of every new location", ""]
for k, (sid, t, what) in enumerate(cfg["establishing"], 1):
    scene_png(sid, t, os.path.join(OUT, f"location-{k:02d}-{files[sid]['bg']}.png"))
    L.append(f"- `location-{k:02d}-{files[sid]['bg']}.png` — {what} ({sid} +{t}s)")
L += ["", "## Resource cards and name tags", ""]
for sid, t, what in cfg["cards"]:
    name = f"card-{sid}-{t}.jpg"
    grab(files[sid]["epStart"] + t, os.path.join(OUT, name))
    L.append(f"- `{name}` — {fmt(files[sid]['epStart'] + t)} · {what}")
for p in ep["parts"]:
    for s in p["scenes"]:
        for c in s["captions"]:
            if c.get("tag"):
                name = f"tag-{s['id']}-{c['speaker'].lower()}.jpg"
                t = files[s["id"]]["epStart"] + c["t0"] + 0.5
                grab(t, os.path.join(OUT, name))
                L.append(f"- `{name}` — {fmt(t)} · name tag [{c['tag']}] — {c['speaker']}: {c['text']}")
# shots: scene starts + detected cuts
r = subprocess.run(["ffmpeg", "-nostdin", "-i", FULL, "-vf", "select='gt(scene,0.22)',showinfo", "-an", "-f", "null", "-"], capture_output=True, text=True)
cuts = [float(m) for m in re.findall(r"pts_time:([\d.]+)", r.stderr)]
starts = sorted({round(f["epStart"], 3) for f in files.values()} | {round(c, 3) for c in cuts})
shots = []
for t in starts:
    if not shots or t - shots[-1] > 0.6:
        shots.append(t)
L += ["", f"## One still per shot ({len(shots)} shots: every scene start + every cut ffmpeg's scene detector finds)", ""]
for k, t in enumerate(shots, 1):
    sid = max((f for f in files.values() if f["epStart"] <= t + 1e-6), key=lambda f: f["epStart"])["id"]
    name = f"shots/shot-{k:03d}.jpg"
    grab(min(t + 0.4, sum(p["duration"] for p in ep["parts"]) - 0.1), os.path.join(OUT, name))
    L.append(f"- `{name}` — {fmt(t)} · {sid} {files[sid]['title']} ({files[sid]['bg']})")
open(os.path.join(OUT, "README-review-v1.md"), "w").write("\n".join(L) + "\n")
print(len(shots), "shot stills")
