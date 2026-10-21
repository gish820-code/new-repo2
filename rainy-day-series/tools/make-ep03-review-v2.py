#!/usr/bin/env python3
"""Episode 3 v2 — proof stills from the finished full render + a captioned index (review/ep03-v2/README-review-v2.md):
the new cold open, the new close-ups in 0:24–1:12, every renamed / named supporting speaker's first line with its name
tag, Gord's tent marker, the new Gord/Drizzle exchange and the end card. Plus 3 stills per 9:16 part."""
import json, os, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "review/ep03-v2")
FULL = os.path.join(ROOT, "renders/ep03/ep03-full-16x9-v2.mp4")
ep = json.load(open(os.path.join(ROOT, "episodes/ep03/ep03-scenes-v2.json")))
files = {f["id"]: f for f in json.load(open(os.path.join(ROOT, "episodes/ep03/scene-files-v2.json")))}
caps = {s["id"]: s["captions"] for p in ep["parts"] for s in p["scenes"]}


def grab(src, t, dst, w):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", src, "-frames:v", "1", "-vf", f"scale={w}:-2", "-q:v", "3", dst], check=True)


def fmt(t):
    return f"{int(t // 60)}:{t % 60:04.1f}"


def line(c):
    return f"{c['speaker']}: {c['text']}" if c.get("speaker") else c["text"]


shots = []  # (group, name, scene, scene time, caption)
shots.append(("Cold open (new)", "01-cold-open", "h1", 0.6, "Gord's flashlight lands on Drizzle at the tent — before PREVIOUSLY: DAY 1"))
for sid, t, what in [("s03", 4.5, "group shot: the burned three come back (Gord, Roy, Dana)"), ("s03", 11.0, "close-up: GORD \"Right behind us\""),
                     ("s03", 14.0, "close-up: ROY \"He wasn't behind us, Gord.\""), ("s04", 1.5, "close-up: GORD \"The wire sparked\""),
                     ("s04", 9.5, "group shot on DANA's line"), ("s04", 12.8, "close-up: GORD \"I told everyone to get OUT\""),
                     ("s05", 4.0, "close-up: GORD \"Nobody goes down in the dark.\""), ("s05", 9.0, "close-up: MAGS \"First light\"")]:
    shots.append(("New close-ups 0:24–1:12", f"02-{sid}-{t}", sid, t, what))
for p in ep["parts"]:
    for s in p["scenes"]:
        for c in s["captions"]:
            if c.get("tag"):
                shots.append(("Supporting speakers' first lines with name tags", f"03-tag-{s['id']}-{c['speaker'].lower().replace('.', '').replace(' ', '')}", s["id"], c["t0"] + 0.6, f"[{c['tag']}] {line(c)}"))
shots += [("Gord's tent marker (G. PIKE)", "04-tent-s14", "s14", 6.0, "Gord walks to his tent; the G. PIKE sign and clipboard"),
          ("Gord's tent marker (G. PIKE)", "04-tent-s16", "s16", 17.0, "Milo and Drizzle arrive at the G. PIKE tent")]
for c in caps["s17"]:
    if c.get("speaker") in ("GORD", "DRIZZLE") and c["t0"] > 15:
        shots.append(("New Gord / Drizzle exchange", f"05-s17-{c['speaker'].lower()}-{c['t0']}", "s17", (c["t0"] + c["t1"]) / 2, line(c)))
shots += [("New Gord / Drizzle exchange", "05-s17-gord-beat", "s17", 22.9, "one beat on Gord's face"),
          ("End card", "06-end-card", "s17", 25.5, "NEXT: DAY 4 — shown once (title only, no caption copy)")]

L = ["# Episode 3 v2 — proof stills", "", "From `renders/ep03/ep03-full-16x9-v2.mp4` (16:9 stills 1280 px wide) and the 9:16 parts (540 px wide).", ""]
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
        name = f"vertical/part{p['part']}-{tag}-v2.jpg"
        grab(os.path.join(ROOT, f"renders/ep03/ep03-part{p['part']}-9x16-v2.mp4"), dur * frac, os.path.join(OUT, name), 540)
        L.append(f"- `{name}` — part {p['part']} \"{p['title']}\" at {fmt(dur * frac)}")
open(os.path.join(OUT, "README-review-v2.md"), "w").write("\n".join(L) + "\n")
print(len(shots), "proof stills, 12 vertical stills")
