#!/usr/bin/env python3
"""Rainy Day: Cascadia — Episode 1 v8 builder (v1): the reference-style survival-guide revamp.

Reads the script (episodes/ep01/script-v8.md) and the per-line narration (audio/ep01-v8/narration/mNN-v1.mp3, voice:
Sterling), lays the episode out on the narration, and generates deterministically:
  episodes/ep01/ep01-v8-timeline-v1.json        every event + shot + word with absolute times
  episodes/ep01/shotlist-v8-v1.md               the shot list
  compositions/ep01-v8/ep01v8-partN-v1.html     16:9 part sub-compositions (shots + the part's audio)
  ep01-v8-full-16x9-v1.html                     render root: the whole episode, 1920x1080
  ep01-v8-partN-9x16-v1.html                    render roots: TikTok parts, 1080x1920 (brick wall, title box, scene,
                                                one-word caption chips, "Part N" box)
  audio/ep01-v8/narration-full-v1.mp3           narration only, on the episode timeline
  audio/ep01-v8/mix/ep01v8-partN-mix-v1.mp3     narration + quiet ambience + the few SFX, per part
  renders/ep01/ep01-v8-full-v1.srt              subtitles (narration + bubbles)
Style: the user's reference (clean colored cartoon plates, a thin stick figure at true scale, full-frame dark-gray cards
with colored ink icons, DAY cards, a radio on a dark card with a comic bubble). Audio: quiet bed + few SFX.
Usage: python3 tools/build-ep01-v8-v1.py
"""
import json, math, os, re, subprocess, sys
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = "v1"
SR = 48000
NARR = "audio/ep01-v8/narration"
BGDIR = "assets/ep01-v8/bg-2560"          # 2560x1440 working copies (shown at 1920x1080, so push-ins stay sharp)
GAP = 0.45
CARD_DUR = 2.4

BG = {
    "kitchen": f"{BGDIR}/p01-kitchen-v1.jpg", "wrecked": f"{BGDIR}/p02-kitchen-wrecked-v1.jpg",
    "street": f"{BGDIR}/p03-main-street-v1.jpg", "harbor": f"{BGDIR}/p04-harbor-drained-v1.jpg",
    "jam": f"{BGDIR}/p05-harbor-way-jam-v1.jpg", "trail": f"{BGDIR}/p06-evac-trail-v1.jpg",
    "view": f"{BGDIR}/p07-view-back-v1.jpg", "wave": f"{BGDIR}/p08-wave-hits-v1.jpg",
    "hill": f"{BGDIR}/p09-hilltop-day-v1.jpg", "dusk": f"{BGDIR}/p10-hilltop-dusk-v1.jpg",
}
OUTDOOR = {"street", "harbor", "jam", "trail", "view", "hill", "dusk"}


# ---------------------------------------------------------------- true scale: rig scale per plate, from the feet's y
# Each plate: rig scale grows linearly with how far below the horizon the feet are, calibrated on an object of known
# size in the plate (the figure is 278 units tall ≈ 5'8"; hip = ground - 116*scale).
def lin(h, g_ref, s_ref):
    return lambda g: round(s_ref * (g - h) / (g_ref - h), 3)

SCALE = {
    "kitchen": lin(560, 1000, 2.15),   # table: floor 1000 → top 735 = 265 px = 30 in
    "wrecked": lin(560, 1000, 2.15),   # same room, same table
    "street": lin(580, 720, 0.79),     # shop doorway at ground 720 ≈ 260 px
    "harbor": lin(490, 1000, 1.6),
    "jam": lin(490, 780, 0.93),        # sedan at ground 780 ≈ 220 px tall
    "trail": lin(400, 700, 1.27),      # evacuation sign post (~8 ft) at ground 700
    "view": lin(430, 900, 1.7),
    "hill": lin(480, 820, 1.88),       # check-in table: 230 px = 30 in at ground 820
    "dusk": lin(580, 690, 1.37),       # fence posts (~4 ft) at ground 690
}
MAGS = 0.95                             # Mags is a little shorter


def hip(g, s):
    return round(g - 116 * s, 1)


# ---------------------------------------------------------------- poses (names = rig POSES; dicts = mixed onto idle)
FLINCH = {"torso": -6, "head": -12, "lsh": 150, "lel": 70, "rsh": 160, "rel": 60, "dy": 8}
LOOKDOWN = {"head": 22, "torso": 8}
SHOULDER = {"torso": 6, "lsh": 40, "lel": 25, "rsh": -6, "rel": 10}
COUNT = {"rsh": 70, "rel": 95, "lsh": 20, "lel": 60, "head": 6}
OFFER = {"torso": 8, "rsh": 75, "rel": 10, "lsh": -6}
POINTUP = {"rsh": 150, "rel": 5, "head": -10}
TUG = {"torso": 10, "lsh": 60, "lel": 10, "rsh": 30, "rel": 20}
LEANWALK = {"rsh": 135, "rel": -25}
# drop-cover-hold-on: on the knees, chest over the knees, one arm over the head (approved in the style frame)
COVER_T = {"torso": 85, "head": 12, "lsh": -35, "lel": 10, "rsh": -15, "rel": 10, "lhip": 0, "lkn": -90, "rhip": 6, "rkn": -96, "dy": 56}
# outdoors (aftershock): low crouch, both arms over the head
LOW = {"torso": 22, "head": 18, "lsh": 150, "lel": 75, "rsh": 160, "rel": 65, "lhip": 95, "lkn": -122, "rhip": 82, "rkn": -116, "dy": 58}


def stand(plate, x, g, pose="idle", t0=0, t1=99, facing=1, face="neutral", mags=False, **kw):
    s = SCALE[plate](g) * (MAGS if mags else 1)
    d = {"t0": t0, "t1": t1, "hold": pose, "x": x, "y": hip(g, s), "scale": s, "facing": facing, "face": face}
    d.update(kw)
    return d


def hold(t0, t1, pose, face=None, **kw):
    d = {"t0": t0, "t1": t1, "hold": pose}
    if face:
        d["face"] = face
    d.update(kw)
    return d


def walk(plate, t0, t1, x0, x1, g0, g1, facing=1, face=None, mags=False, rate=1.8, **kw):
    k = MAGS if mags else 1
    s0, s1 = SCALE[plate](g0) * k, SCALE[plate](g1) * k
    w = {"x0": x0, "x1": x1, "y0": hip(g0, s0), "y1": hip(g1, s1), "s0": round(s0, 3), "s1": round(s1, 3), "rate": rate}
    w.update({k2: v for k2, v in kw.items() if k2 in ("torso", "armSwing", "arm", "phase0", "bob")})
    d = {"t0": t0, "t1": t1, "walk": w, "scale": round(s0, 3), "facing": facing}
    if face:
        d["face"] = face
    d.update({k2: v for k2, v in kw.items() if k2 in ("bag", "blend", "radio")})
    return d


def fig(who, segs, **kw):
    f = {"who": who, "segs": segs}
    f.update(kw)
    return f


def extra(segs, **opts):
    return {"who": "extra", "segs": segs, "opts": opts}


# ---------------------------------------------------------------- plate details (1920x1080 plate coordinates)
CLOCK1 = {"type": "clock", "cx": 927.3, "cy": 385, "r": 37, "face": "#8B97A5", "time": "10:42"}
CLOCK2 = dict(CLOCK1, face="#8C96A4", time="10:46")
TABLE_OCC = {"type": "occlude", "polys": [[[1028, 730], [1420, 717], [1420, 748], [1396, 750], [1396, 772], [1040, 782], [1028, 762]]],
             "rects": [[1038, 740, 32, 264], [1356, 740, 38, 260]]}
MUG = {"type": "mug", "x": 994, "y": 624, "w": 62, "h": 58, "t0": 0, "t1": 9, "amp": 2.4, "under": "#8E6C52"}
DOOR_DEBRIS = {"type": "debris", "x0": 1460, "x1": 1680, "y0": 150, "y1": 1050, "t0": 0, "t1": 9, "n": 26}
HOOK_BAG = {"type": "gobag", "x": 1820, "y": 650, "scale": 2.6}
SHAKE = lambda amp, **kw: dict({"t0": 0, "t1": 99, "amp": amp, "rampIn": 0.01}, **kw)
WRECK_DIM = [[0, 0.22]]                  # power out: daylight only

# under the table: Mags further back, Drizzle at the front edge (both between the legs, the table front drawn over them)
U_M = ("kitchen", 1330, 930)
U_D = ("kitchen", 1070, 992)


def under_figs(d, dface="scared", mface="determined", plate="kitchen"):
    return [fig("mags", [stand(plate, U_M[1], U_M[2], COVER_T, facing=-1, face=mface, mags=True)]),
            fig("drizzle", [stand(plate, U_D[1], U_D[2], COVER_T, facing=1, face=dface)])]


def kd(x=820, g=1010, pose="idle", face="smile", facing=1, plate="kitchen", **kw):
    return lambda d: [fig("drizzle", [stand(plate, x, g, pose, facing=facing, face=face, **kw)])]


EVENTS = [
    # ===================================== PART 1
    {"k": "cold", "dur": 2.2, "part": 1, "label": "COLD OPEN", "shots": [
        (1, dict(bg="wave", cam=((900, 520, 1.0), (920, 500, 1.14)), shake=SHAKE(9, rampIn=0.1),
                 desc="Cold open: the wave cresting over Gull Harbor's rooftops (push-in + shake)"))],
     "sfx": [("wave-crash-v1", 0, -6)]},
    {"k": "black", "dur": 0.5, "part": 1, "label": "hard cut to black", "shots": [(1, dict(bg=None, desc="Black"))]},
    {"k": "n", "n": 1, "part": 1, "shots": [
        (0.36, dict(bg="kitchen", cam=((960, 560, 1.06), (960, 540, 1.0)), fx=[CLOCK1], figs=kd(face="smile"),
                    desc="Kitchen wide: this is Drizzle")),
        (0.34, dict(bg="view", cam=((900, 560, 1.25), (960, 600, 1.35)), desc="Gull Harbor from above: two thousand people, one road out")),
        (0.30, dict(bg="kitchen", cam=((640, 470, 2.1), (660, 470, 2.3)), desc="Through the window: the sea — the fault is just off the coast"))]},
    {"k": "day", "text": "DAY 0 · 10:42 AM", "part": 1, "dur": 2.6},
    {"k": "n", "n": 2, "part": 1, "shots": [
        (0.5, dict(bg="kitchen", cam=((900, 700, 1.5), (930, 690, 1.6)), fx=[CLOCK1], figs=kd(pose="think", face="neutral"),
                   desc="Drizzle at the table, thinking: not a prepper, but one fact stuck")),
        (0.5, dict(bg="kitchen", cam=((650, 480, 2.2), (650, 470, 2.45)), desc="The gray sea in the window: on this coast the ocean can arrive in ~15 minutes"))]},
    {"k": "card", "text": "First wave: ~15 minutes", "icons": ["stopwatch", "wave"], "part": 1},
    {"k": "n", "n": 3, "part": 1, "shots": [
        (0.28, dict(bg="kitchen", cam=((927, 395, 3.6), (927, 392, 3.9)), fx=[CLOCK1], desc="Insert: the wall clock — 10:42")),
        (0.34, dict(bg="kitchen", cam=((1030, 650, 3.0), (1030, 652, 3.3)), fx=[CLOCK1, MUG], desc="Insert: the coffee starts to shiver")),
        (0.38, dict(bg="kitchen", cam=((960, 560, 1.0), (960, 560, 1.05)), fx=[CLOCK1], shake=SHAKE(10, t0=0.5, rampIn=1.2),
                    figs=lambda d: [fig("drizzle", [stand("kitchen", 820, 1010, "idle", 0, 0.6, face="o"), hold(0.6, d, FLINCH, face="scared")])],
                    desc="Wide: the floor moves — Drizzle flinches"))]},
    {"k": "n", "n": 4, "part": 1, "shots": [
        (0.3, dict(bg="kitchen", cam=((1180, 580, 1.1), (1260, 580, 1.14)), fx=[CLOCK1], shake=SHAKE(11),
                   figs=lambda d: [fig("drizzle", [stand("kitchen", 820, 1010, FLINCH, 0, 0.3, face="scared"),
                                                   walk("kitchen", 0.3, d, 820, 1560, 1010, 1050, 1, "scared", rate=2.6)])],
                   desc="Drizzle runs for the doorway — most people's instinct")),
        (0.35, dict(bg="kitchen", cam=((1560, 640, 1.55), (1570, 620, 1.65)), fx=[CLOCK1], shake=SHAKE(11),
                    figs=lambda d: [fig("drizzle", [stand("kitchen", 1565, 1050, "idle", 0, 0.5, face="worried"), hold(0.5, d, "lookUp", face="worried")])],
                    desc="Drizzle in the doorway, looking up: no stronger than the rest of the wall")),
        (0.35, dict(bg="kitchen", cam=((1560, 560, 1.35), (1560, 560, 1.4)), fx=[CLOCK1, DOOR_DEBRIS], shake=SHAKE(12),
                    figs=lambda d: [fig("drizzle", [stand("kitchen", 1565, 1050, "lookUp", 0, 1.0, face="worried"), hold(1.0, d, FLINCH, face="scared")])],
                    desc="Plaster falls right where he stands"))]},
    {"k": "n", "n": 5, "part": 1, "shots": [
        (1, dict(bg="kitchen", cam=((1300, 600, 1.2), (1260, 610, 1.24)), fx=[CLOCK1], shake=SHAKE(11),
                 figs=lambda d: [fig("drizzle", [stand("kitchen", 1565, 1050, FLINCH, 0, 0.3, facing=-1, face="determined"),
                                                 walk("kitchen", 0.3, d, 1565, 1300, 1050, 1012, -1, "determined", rate=2.4)])],
                 desc="He turns back: what the drills teach"))]},
    {"k": "card", "text": "Drop · Cover · Hold on", "icons": ["table"], "part": 1},
    {"k": "n", "n": 6, "part": 1, "shots": [
        (0.32, dict(bg="kitchen", cam=((1200, 660, 1.35), (1220, 680, 1.42)), fx=[CLOCK1, TABLE_OCC], shake=SHAKE(11),
                    figs=lambda d: [fig("drizzle", [stand("kitchen", 1300, 1012, "idle", 0, 0.4, facing=-1, face="determined"),
                                                    stand("kitchen", 1300, 1006, "crouch", 0.4, 1.0, facing=-1, face="determined"),
                                                    stand("kitchen", U_D[1], U_D[2], COVER_T, 1.0, d, facing=1, face="scared")])],
                    desc="DROP: down on his knees, in under the table")),
        (0.36, dict(bg="kitchen", cam=((1240, 790, 2.0), (1250, 790, 2.1)), fx=[CLOCK1, TABLE_OCC], shake=SHAKE(11),
                    figs=lambda d: [fig("drizzle", [stand("kitchen", U_D[1], U_D[2], COVER_T, facing=1, face="scared")])],
                    desc="COVER: head and neck covered, under the tabletop")),
        (0.32, dict(bg="kitchen", cam=((1330, 820, 2.4), (1340, 818, 2.55)), fx=[CLOCK1, TABLE_OCC], shake=SHAKE(11),
                    figs=lambda d: [fig("drizzle", [stand("kitchen", U_D[1], U_D[2], COVER_T, facing=1, face="determined")])],
                    desc="HOLD ON: the table moves, he moves with it"))]},
    {"k": "n", "n": 7, "part": 1, "shots": [
        (0.5, dict(bg="kitchen", cam=((1240, 800, 2.1), (1220, 800, 2.2)), fx=[CLOCK1, TABLE_OCC], shake=SHAKE(10),
                   figs=lambda d: [fig("mags", [stand("kitchen", 1090, 985, COVER_T, facing=1, face="determined", mags=True)])],
                   desc="Mags, his neighbor, is already under there")),
        (0.5, dict(bg="kitchen", cam=((1200, 760, 1.7), (1200, 770, 1.78)), fx=[CLOCK1, TABLE_OCC], shake=SHAKE(10),
                   figs=lambda d: under_figs(d, "worried", "determined"), desc="Two-shot under the table: she's done this drill for thirty years"))]},
    {"k": "n", "n": 8, "part": 1, "shots": [
        (0.5, dict(bg="kitchen", cam=((927, 395, 3.4), (927, 395, 3.6)), fx=[dict(CLOCK1, time1="10:44")], shake=SHAKE(6),
                   desc="The clock: ten seconds, thirty, a minute…")),
        (0.5, dict(bg="kitchen", cam=((1100, 640, 1.2), (1120, 640, 1.25)), fx=[CLOCK1, TABLE_OCC, {"type": "debris", "x0": 300, "x1": 900, "y0": 300, "y1": 1000, "t0": 0.3, "t1": 9, "n": 18}],
                   shake=SHAKE(14), figs=lambda d: under_figs(d), desc="The kitchen keeps shaking — this one kept going"))]},
    {"k": "card", "text": "4 minutes", "icons": ["stopwatch"], "part": 1},
    {"k": "n", "n": 9, "part": 1, "shots": [
        (0.5, dict(bg="kitchen", cam=((1290, 800, 2.3), (1300, 800, 2.45)), fx=[CLOCK1, TABLE_OCC], shake=SHAKE(9),
                   figs=lambda d: under_figs(d, "determined"), desc="Close on Drizzle: four minutes means the big one")),
        (0.5, dict(bg="kitchen", cam=((927, 395, 3.0), (927, 395, 3.4)), fx=[dict(CLOCK1, time1="10:46")], shake=SHAKE(6, rampOut=2.0),
                   desc="The clock in his head starts counting down"))]},
    {"k": "n", "n": 10, "part": 1, "tail": 1.3, "shots": [
        (1, dict(bg="kitchen", cam=((1180, 720, 1.5), (1180, 720, 1.54)), fx=[CLOCK2, TABLE_OCC], shake=SHAKE(5, rampOut=1.0),
                 figs=lambda d: under_figs(d, "worried", "worried"),
                 dark=[[0, 0], [0.5, 0.55], [0.58, 0.05], [0.7, 0.7], [0.8, 0.2], [0.92, 0.84]],
                 desc="The lights go out (end of Part 1)"))]},
    # ===================================== PART 2
    {"k": "n", "n": 11, "part": 2, "shots": [
        (0.36, dict(bg="wrecked", cam=((1060, 640, 1.2), (1000, 600, 1.1)), fx=[CLOCK2, TABLE_OCC, HOOK_BAG], dark=[[0, 0.6], [0.4, 0.22]],
                    figs=lambda d: [fig("mags", [stand("wrecked", U_M[1], U_M[2], COVER_T, 0, 1.0, facing=-1, face="neutral", mags=True),
                                                 stand("wrecked", 900, 975, "idle", 1.0, d, facing=1, face="determined", mags=True)]),
                                    fig("drizzle", [stand("wrecked", U_D[1], U_D[2], COVER_T, 0, 1.4, facing=1, face="worried"),
                                                    stand("wrecked", 1480, 1015, "idle", 1.4, d, facing=-1, face="worried")])],
                    desc="Daylight only: the wrecked kitchen. They come out from under the table")),
        (0.28, dict(bg="wrecked", cam=((927, 395, 3.4), (927, 395, 3.6)), fx=[CLOCK2], dark=WRECK_DIM, desc="The clock: 10:46")),
        (0.36, dict(bg="wrecked", cam=((1350, 640, 1.6), (1360, 640, 1.7)), fx=[CLOCK2, HOOK_BAG], dark=WRECK_DIM,
                    figs=lambda d: [fig("drizzle", [stand("wrecked", 1480, 1015, "think", facing=-1, face="worried")])],
                    desc="Drizzle does the math: ocean at 11:01, the walk takes twelve"))]},
    {"k": "card", "text": "15 min − 12 min walk|= 3 minutes", "icons": ["stopwatch"], "part": 2, "dur": 2.8},
    {"k": "n", "n": 12, "part": 2, "shots": [
        (0.5, dict(bg="wrecked", cam=((1000, 620, 1.3), (1040, 620, 1.36)), fx=[CLOCK2, HOOK_BAG], dark=WRECK_DIM,
                   figs=lambda d: [fig("mags", [stand("wrecked", 900, 975, "idle", face="worried", mags=True)]),
                                   fig("drizzle", [stand("wrecked", 1480, 1015, "idle", facing=-1, face="worried")])],
                   desc="Three minutes: no time to pack a life")),
        (0.5, dict(bg="wrecked", cam=((1440, 640, 1.8), (1450, 640, 1.88)), fx=[CLOCK2, HOOK_BAG], dark=WRECK_DIM,
                   figs=lambda d: [fig("drizzle", [stand("wrecked", 1480, 1015, "idle", 0, 0.4, facing=-1, face="worried"), hold(0.4, d, "shrug", face="worried")])],
                   desc="No time for keys, or the news"))]},
    {"k": "n", "n": 13, "part": 2, "shots": [
        (0.62, dict(bg="wrecked", cam=((1150, 640, 1.4), (1170, 640, 1.45)), fx=[CLOCK2, HOOK_BAG], dark=WRECK_DIM,
                    figs=lambda d: [fig("drizzle", [stand("wrecked", 1240, 1012, "reach", 0, 0.4, facing=-1, face="worried"), hold(0.4, d, "carry", face="worried")],
                                        carry={"items": ["laptop", "album", "plant"], "appear": [None, None, None], "drop": None, "dropTo": []})],
                    desc="He grabs his laptop, his photo album, a plant")),
        (0.38, dict(bg="wrecked", cam=((1200, 720, 1.6), (1200, 720, 1.66)), fx=[CLOCK2, HOOK_BAG], dark=WRECK_DIM,
                    figs=lambda d: [fig("drizzle", [stand("wrecked", 1240, 1012, "carry", 0, 0.5, facing=-1, face="worried"), hold(0.5, d, "crouch", face="neutral")],
                                        carry={"items": ["laptop", "album", "plant"], "appear": [0, 0, 0], "drop": 0.6, "dropTo": [[1120, 1000], [1180, 1008], [1060, 995]]})],
                    desc="…then puts them all down"))]},
    {"k": "card", "text": "Go-bag, not belongings", "icons": ["backpack"], "part": 2},
    {"k": "n", "n": 14, "part": 2, "shots": [
        (0.28, dict(bg="wrecked", cam=((1780, 520, 2.3), (1780, 530, 2.45)), fx=[CLOCK2, HOOK_BAG], dark=WRECK_DIM,
                    desc="The go-bag on its hook by the door, packed for exactly this")),
        (0.27, dict(bg="wrecked", cam=((1560, 600, 1.5), (1600, 600, 1.55)), fx=[CLOCK2, dict(HOOK_BAG, hideAt=2.0)], dark=WRECK_DIM,
                    figs=lambda d: [fig("drizzle", [walk("wrecked", 0, 1.4, 1250, 1700, 1012, 1040, 1, "determined"),
                                                    hold(1.4, 2.0, "reach", face="determined"), hold(2.0, d, "idle", face="determined", bag=True)])],
                    desc="He walks to the door and takes it")),
        (0.27, dict(bg="wrecked", cam=((1640, 620, 2.0), (1640, 620, 2.08)), fx=[CLOCK2], dark=WRECK_DIM,
                    figs=lambda d: [fig("drizzle", [stand("wrecked", 1700, 1040, "idle", facing=-1, face="smile", bag=True)])],
                    desc="Water, flashlight, radio, medicine, a warm layer")),
        (0.18, dict(bg="wrecked", cam=((1560, 600, 1.5), (1560, 600, 1.52)), fx=[CLOCK2], dark=WRECK_DIM,
                    figs=lambda d: [fig("drizzle", [stand("wrecked", 1700, 1040, "idle", facing=-1, face="determined", bag=True)])],
                    desc="One bag. Three seconds"))]},
    {"k": "bubble", "who": "MAGS", "text": "No siren's coming. We go now.", "dur": 2.8, "part": 2, "shots": [
        (1, dict(bg="wrecked", cam=((1350, 600, 1.45), (1360, 600, 1.5)), fx=[CLOCK2], dark=WRECK_DIM,
                 figs=lambda d: [fig("mags", [stand("wrecked", 1260, 1000, "point", facing=1, face="determined", mags=True)]),
                                 fig("drizzle", [stand("wrecked", 1560, 1030, "idle", facing=-1, face="worried", bag=True)])],
                 bubble=dict(x=560, y=110, w=640, tail="down-right", t0=0.1), desc="Mags: speech bubble"))]},
    {"k": "n", "n": 15, "part": 2, "shots": [
        (0.5, dict(bg="wrecked", cam=((1100, 260, 2.4), (1100, 270, 2.6)), fx=[CLOCK2], dark=WRECK_DIM,
                   desc="The dead lamp: with the power out, sirens might never sound")),
        (0.5, dict(bg="wrecked", cam=((1450, 600, 1.3), (1500, 600, 1.34)), fx=[CLOCK2], dark=WRECK_DIM,
                   figs=lambda d: [fig("mags", [stand("wrecked", 1260, 1000, "idle", 0, 0.8, facing=1, face="determined", mags=True),
                                                walk("wrecked", 0.8, d, 1260, 1620, 1000, 1045, 1, "determined", mags=True, rate=1.7)]),
                                   fig("drizzle", [stand("wrecked", 1560, 1030, "idle", 0, 1.2, facing=1, face="determined", bag=True),
                                                   walk("wrecked", 1.2, d, 1560, 1760, 1030, 1050, 1, "determined", bag=True)])],
                   desc="The shaking is the warning: out the door"))]},
    {"k": "n", "n": 16, "part": 2, "shots": [
        (0.55, dict(bg="street", cam=((960, 600, 1.08), (980, 620, 1.14)),
                    figs=lambda d: [fig("mags", [walk("street", 0, d, 440, 780, 920, 935, 1, "determined", mags=True, rate=1.7)]),
                                    fig("drizzle", [walk("street", 0, d, 660, 1010, 935, 950, 1, "worried", bag=True)])],
                    desc="Main Street: cracked open, windows out, lines down")),
        (0.45, dict(bg="harbor", cam=((960, 560, 1.12), (960, 540, 1.0)), desc="Down at the harbor, the water is leaving"))]},
    {"k": "card", "text": "Sea pulls back|= tsunami coming", "icons": ["wave"], "part": 2, "dur": 2.8},
    {"k": "n", "n": 17, "part": 2, "shots": [
        (0.3, dict(bg="harbor", cam=((420, 560, 1.7), (460, 560, 1.8)), desc="Boats sitting in the mud")),
        (0.34, dict(bg="harbor", cam=((900, 620, 1.5), (940, 610, 1.58)),
                    figs=lambda d: [extra([walk("harbor", 0, d, 820, 900, 780, 740, 1, rate=1.5)], coat="mist", hat="cap"),
                                    extra([walk("harbor", 0, d, 900, 975, 800, 760, 1, rate=1.4)], coat="steel", hair="long"),
                                    extra([walk("harbor", 0, d, 1040, 1100, 770, 735, 1, rate=1.4)], coat="fog")],
                    desc="A few people walk out to look — the deadliest mistake")),
        (0.36, dict(bg="harbor", cam=((560, 760, 1.5), (560, 760, 1.56)),
                    figs=lambda d: [fig("mags", [stand("harbor", 420, 1030, "point", 0, d * 0.4, face="determined", mags=True), hold(d * 0.4, d, TUG, face="determined")]),
                                    fig("drizzle", [stand("harbor", 640, 1040, "idle", 0, d * 0.5, face="worried", bag=True), hold(d * 0.5, d, "idle", facing=-1, face="worried")])],
                    desc="When the sea pulls back, it comes back bigger: Mags pulls Drizzle away"))]},
    {"k": "n", "n": 18, "part": 2, "shots": [
        (0.5, dict(bg="jam", cam=((800, 540, 1.1), (860, 520, 1.18)), desc="Harbor Way: already jammed")),
        (0.5, dict(bg="jam", cam=((900, 700, 1.25), (1000, 700, 1.25)),
                   figs=lambda d: [fig("mags", [walk("jam", 0, d, 300, 720, 1000, 990, 1, "determined", mags=True, rate=1.7)]),
                                   fig("drizzle", [walk("jam", 0, d, 520, 950, 1010, 1000, 1, "determined", bag=True)])],
                   desc="A crack can stop a thousand cars, not two people on foot"))]},
    {"k": "card", "text": "Walk, don't drive", "icons": ["footprints"], "part": 2},
    {"k": "n", "n": 19, "part": 2, "shots": [
        (1, dict(bg="jam", cam=((1240, 640, 1.3), (1280, 620, 1.36)),
                 figs=lambda d: [fig("mags", [walk("jam", 0, d * 0.6, 900, 1070, 990, 985, 1, "determined", mags=True, rate=1.7), hold(d * 0.6, d, "idle")]),
                                 fig("drizzle", [walk("jam", 0, d * 0.6, 1100, 1290, 1000, 995, 1, "determined", bag=True), hold(d * 0.6, d, POINTUP, face="determined")])],
                 desc="At the evacuation sign: uphill, right now (end of Part 2)"))]},
    # ===================================== PART 3
    {"k": "n", "n": 20, "part": 3, "shots": [
        (0.5, dict(bg="trail", cam=((1000, 560, 1.04), (1040, 560, 1.1)),
                   figs=lambda d: [fig("mags", [walk("trail", 0, d, 900, 1060, 920, 830, 1, "determined", mags=True, rate=1.6, torso=10)]),
                                   fig("drizzle", [walk("trail", 0, d, 1100, 1270, 900, 800, 1, "determined", bag=True, torso=10)])],
                   desc="The evacuation trail: steep and muddy")),
        (0.5, dict(bg="trail", cam=((1300, 560, 1.5), (1340, 540, 1.56)),
                   figs=lambda d: [fig("mags", [walk("trail", 0, d, 1080, 1220, 820, 750, 1, "determined", mags=True, rate=1.6, torso=10)]),
                                   fig("drizzle", [walk("trail", 0, d, 1270, 1400, 800, 730, 1, "determined", bag=True, torso=10)])],
                   desc="Twelve minutes, on a good day"))]},
    {"k": "card", "text": "0.4 miles uphill|= 12 minutes", "icons": ["arrowup"], "part": 3, "dur": 2.8},
    {"k": "n", "n": 21, "part": 3, "shots": [
        (0.5, dict(bg="trail", cam=((1080, 640, 1.3), (1100, 640, 1.34)), shake=SHAKE(9, t0=1.0, t1=4.2, rampIn=0.3, rampOut=0.8),
                   figs=lambda d: [fig("mags", [walk("trail", 0, 1.0, 860, 910, 900, 880, 1, "determined", mags=True, rate=1.6, torso=10), hold(1.0, 1.5, "idle", face="scared"), hold(1.5, d, LOW, face="scared")]),
                                   fig("drizzle", [walk("trail", 0, 1.0, 1080, 1130, 920, 900, 1, "determined", bag=True, torso=10), hold(1.0, 1.4, "idle", face="scared"), hold(1.4, d, LOW, face="scared")])],
                   desc="Halfway up: an aftershock — they get low")),
        (0.5, dict(bg="trail", cam=((1020, 640, 1.4), (1030, 640, 1.45)), shake=SHAKE(5, rampOut=1.2),
                   figs=lambda d: [fig("mags", [stand("trail", 910, 880, LOW, face="scared", mags=True)]),
                                   fig("drizzle", [stand("trail", 1130, 900, LOW, face="determined", bag=True)])],
                   desc="Heads covered, clear of the trees"))]},
    {"k": "n", "n": 22, "part": 3, "shots": [
        (0.45, dict(bg="trail", cam=((1030, 600, 1.3), (1040, 600, 1.34)),
                    figs=lambda d: [fig("mags", [stand("trail", 910, 880, "idle", 0, 0.8, face="worried", mags=True), hold(0.8, d, "kneel", face="worried")]),
                                    fig("drizzle", [stand("trail", 1130, 900, "idle", 0, 1.2, facing=-1, face="worried", bag=True), hold(1.2, d, SHOULDER, facing=-1, face="determined")])],
                    desc="Mags' knees give out; Drizzle gives her his shoulder")),
        (0.55, dict(bg="trail", cam=((1180, 600, 1.35), (1230, 590, 1.4)),
                    figs=lambda d: [fig("mags", [walk("trail", 0, d, 1000, 1160, 865, 795, 1, "determined", mags=True, rate=1.4, torso=12, arm=LEANWALK)]),
                                    fig("drizzle", [walk("trail", 0, d, 1120, 1280, 870, 800, 1, "determined", rate=1.4, bag=True, torso=10)])],
                    desc="Slower, but moving"))]},
    {"k": "insert", "dur": 1.8, "part": 3, "shots": [
        (1, dict(bg=None, cardbg=True, fx=[{"type": "radio", "x": 960, "y": 700, "scale": 1.3, "crank0": 0, "static0": 0.4}],
                 desc="INSERT: the hand-crank radio — cranking, static"))],
     "sfx": [("radio-static-crank-v1", 0, -14)]},
    {"k": "bubble", "who": "RADIO", "text": "…tsunami warning for the entire Washington coast… move to high ground immediately…", "dur": 5.2, "part": 3, "shots": [
        (1, dict(bg=None, cardbg=True, fx=[{"type": "radio", "x": 960, "y": 800, "scale": 1.2, "crank0": 0, "crank1": 0.6, "clean0": 0.2}],
                 bubble=dict(x=330, y=90, w=1260, tail="down", t0=0.15, radio=True), desc="Radio bubble: the official warning"))],
     "sfx": [("radio-static-crank-v1", 0, -18, 1.2)]},
    {"k": "n", "n": 23, "part": 3, "shots": [
        (0.5, dict(bg="jam", cam=((700, 560, 1.5), (760, 560, 1.56)), desc="Twenty minutes after the shaking — the people who waited are still in their cars")),
        (0.5, dict(bg="trail", cam=((1300, 560, 1.4), (1360, 540, 1.46)),
                   figs=lambda d: [fig("mags", [walk("trail", 0, d, 1160, 1300, 795, 725, 1, "determined", mags=True, rate=1.4, torso=12, arm=LEANWALK)]),
                                   fig("drizzle", [walk("trail", 0, d, 1280, 1420, 800, 730, 1, "determined", rate=1.4, bag=True, torso=10)])],
                   desc="Drizzle and Mags already climbing"))]},
    {"k": "n", "n": 24, "part": 3, "shots": [
        (0.45, dict(bg="view", cam=((900, 640, 1.2), (900, 640, 1.24)),
                    figs=lambda d: [fig("mags", [walk("view", 0, 1.4, 1060, 1000, 900, 900, -1, "determined", mags=True, rate=1.5), hold(1.4, d, "idle", face="determined")]),
                                    fig("drizzle", [walk("view", 0, 1.0, 860, 780, 930, 930, -1, "worried", bag=True), hold(1.0, d, "idle", facing=1, face="worried")])],
                    desc="At the switchback, Drizzle looks back")),
        (0.55, dict(bg="view", cam=((1100, 440, 1.5), (1100, 436, 1.9)), desc="A gray line across the horizon"))],
     "sfx": [("wave-roar-distant-v1", 2.0, -16)]},
    {"k": "day", "text": "DAY 0 · 11:04 AM", "part": 3, "dur": 2.6},
    {"k": "n", "n": 25, "part": 3, "shots": [
        (0.34, dict(bg="wave", cam=((960, 540, 1.0), (960, 520, 1.08)), shake=SHAKE(8, rampIn=0.05), desc="11:04: the first wave hits Gull Harbor")),
        (0.33, dict(bg="wave", cam=((1000, 600, 1.8), (1020, 600, 1.95)), shake=SHAKE(6, rampIn=0.05), desc="It takes the dock, the ferry")),
        (0.33, dict(bg="wave", cam=((900, 820, 1.5), (960, 820, 1.6)), shake=SHAKE(6, rampIn=0.05), desc="…then Main Street"))],
     "sfx": [("wave-crash-v1", 0, -7), ("wave-roar-distant-v1", 2.6, -12)]},
    {"k": "card", "text": "The first wave is often|not the biggest", "icons": ["waves"], "part": 3, "dur": 2.9},
    {"k": "n", "n": 26, "part": 3, "tail": 0.4, "shots": [
        (0.5, dict(bg="view", cam=((900, 620, 1.3), (960, 600, 1.34)),
                   figs=lambda d: [fig("drizzle", [stand("view", 780, 930, LOOKDOWN, 0, d * 0.45, facing=1, face="scared", bag=True),
                                                   walk("view", d * 0.45, d, 780, 560, 930, 900, -1, "worried", bag=True)]),
                                   fig("mags", [stand("view", 1000, 900, "idle", 0, d * 0.25, facing=-1, face="determined", mags=True), hold(d * 0.25, d * 0.45, TUG, face="determined"),
                                                walk("view", d * 0.45, d, 1000, 760, 900, 880, -1, "determined", mags=True, rate=1.6)])],
                   desc="Tsunamis come in sets, for hours: Mags gets him moving")),
        (0.5, dict(bg="view", cam=((1100, 420, 1.6), (1100, 410, 1.7)), desc="You don't go back down until officials say it's safe (end of Part 3)"))],
     "sfx": [("wave-roar-distant-v1", 0, -16)]},
    # ===================================== PART 4
    {"k": "n", "n": 27, "part": 4, "lead": 0.4, "shots": [
        (0.55, dict(bg="hill", cam=((900, 560, 1.0), (920, 570, 1.06)),
                    figs=lambda d: [extra([stand("hill", 1180, 760, "idle", facing=-1)], coat="steel", hat="beanie"),
                                    extra([stand("hill", 1270, 790, "idle", facing=-1)], coat="mist", hair="long"),
                                    extra([stand("hill", 300, 880, "think", facing=1)], coat="slate", hat="cap"),
                                    extra([stand("hill", 1080, 740, "idle", facing=-1)], coat="fog", hair="bun"),
                                    fig("mags", [walk("hill", 0, d * 0.8, 380, 620, 920, 875, 1, "determined", mags=True, rate=1.5), hold(d * 0.8, d, "idle", face="neutral")]),
                                    fig("drizzle", [walk("hill", 0, d * 0.8, 700, 960, 930, 885, 1, "smile", rate=1.5, bag=True), hold(d * 0.8, d, "idle", face="smile")])],
                    desc="The hilltop: cold, crowded, above the water")),
        (0.45, dict(bg="hill", cam=((840, 560, 1.4), (850, 560, 1.45)),
                    figs=lambda d: [fig("mags", [stand("hill", 620, 875, "idle", face="neutral", mags=True)]),
                                    fig("drizzle", [stand("hill", 960, 885, "idle", 0, 0.6, facing=-1, face="neutral", bag=True), hold(0.6, d, "crouch", facing=1, face="determined")])],
                    desc="Drizzle checks what he has"))],
     "sfx": [("crowd-murmur-v1", 0, -24)]},
    {"k": "card", "text": "1 gallon a day × 3 days", "icons": ["jug"], "part": 4},
    {"k": "n", "n": 28, "part": 4, "shots": [
        (0.5, dict(bg="hill", cam=((960, 640, 2.2), (960, 640, 2.35)), desc="Water first: one gallon per person, per day")),
        (0.5, dict(bg="hill", cam=((840, 560, 1.4), (850, 560, 1.45)),
                   figs=lambda d: [fig("mags", [stand("hill", 620, 875, "idle", face="neutral", mags=True)]),
                                   fig("drizzle", [stand("hill", 960, 885, "crouch", 0, 0.6, facing=1, face="determined", bag=True), hold(0.6, d, COUNT, facing=-1, face="smile")])],
                   desc="His bag held three days"))]},
    {"k": "card", "text": "6,000 calories = 3 days", "icons": ["bar", "can"], "part": 4},
    {"k": "n", "n": 29, "part": 4, "shots": [
        (0.5, dict(bg="hill", cam=((850, 570, 1.45), (860, 570, 1.5)),
                   figs=lambda d: [fig("mags", [stand("hill", 620, 875, "idle", face="neutral", mags=True)]),
                                   fig("drizzle", [stand("hill", 960, 885, OFFER, facing=-1, face="neutral", bag=True)], snack={"t0": 0, "t1": 99})],
                   desc="Food second: about 2,000 calories a day, for three days")),
        (0.5, dict(bg="hill", cam=((900, 560, 1.5), (940, 560, 1.55)),
                   figs=lambda d: [extra([stand("hill", 1120, 760, "point", facing=-1)], coat="fog", hair="bun"),
                                   extra([stand("hill", 1230, 780, "idle", facing=-1)], coat="steel", hat="cap")],
                   desc="Volunteers at the check-in table: out here, plan for two weeks"))]},
    {"k": "card", "text": "Be 2 Weeks Ready", "icons": ["calendar"], "part": 4},
    {"k": "n", "n": 30, "part": 4, "shots": [
        (1, dict(bg="hill", cam=((850, 560, 1.4), (855, 560, 1.46)),
                 figs=lambda d: [fig("mags", [stand("hill", 620, 875, "idle", face="neutral", mags=True)]),
                                 fig("drizzle", [stand("hill", 960, 885, COUNT, facing=-1, face="smile", bag=True)])],
                 desc="Drizzle counts what he did right"))]},
    {"k": "cards3", "n": 31, "part": 4, "cards": [("1. Drop, cover, hold on", ["table"]), ("2. Coast + shaking|= walk uphill now", ["arrowup"]),
                                                  ("3. Go-bag, not belongings", ["backpack"])]},
    {"k": "n", "n": 32, "part": 4, "shots": [
        (1, dict(bg="hill", cam=((840, 560, 1.45), (840, 560, 1.5)),
                 figs=lambda d: [fig("mags", [stand("hill", 620, 875, "idle", 0, d * 0.55, face="neutral", mags=True), hold(d * 0.55, d, "reach", face="smile")]),
                                 fig("drizzle", [stand("hill", 960, 885, "idle", 0, d * 0.25, facing=-1, face="grin", bag=True), hold(d * 0.25, d, OFFER, face="grin")], snack={"t0": 0.4, "t1": 99})],
                 desc="And four: snacks. Mags takes one without a word"))]},
    {"k": "n", "n": 33, "part": 4, "shots": [
        (1, dict(bg="dusk", cam=((560, 470, 1.3), (580, 470, 1.34)),
                 figs=lambda d: [fig("mags", [stand("dusk", 360, 722, "idle", face="neutral", mags=True, radio=True)]),
                                 fig("drizzle", [stand("dusk", 620, 730, LOOKDOWN, face="worried", bag=True)])],
                 desc="Dusk on the hill: the radio again"))],
     "sfx": [("radio-static-crank-v1", 0.4, -18, 1.4)]},
    {"k": "bubble", "who": "RADIO", "text": "…Highway 101 bridge at Gull Creek has collapsed… coastal roads closed…", "dur": 5.2, "part": 4, "shots": [
        (1, dict(bg=None, cardbg=True, fx=[{"type": "radio", "x": 960, "y": 800, "scale": 1.2, "static0": 0, "clean0": 0.5}],
                 bubble=dict(x=330, y=90, w=1260, tail="down", t0=0.15, radio=True), desc="Radio bubble: the bridge is gone"))],
     "sfx": [("radio-static-crank-v1", 0, -18, 0.8)]},
    {"k": "n", "n": 34, "part": 4, "shots": [
        (0.5, dict(bg="dusk", cam=((1300, 760, 1.3), (1260, 760, 1.36)), desc="The flooded town: the only road out is gone")),
        (0.5, dict(bg="dusk", cam=((540, 460, 1.4), (560, 460, 1.46)),
                   figs=lambda d: [fig("mags", [stand("dusk", 360, 722, "idle", face="worried", mags=True, radio=True)]),
                                   fig("drizzle", [stand("dusk", 620, 730, "idle", face="worried", bag=True)])],
                   desc="Help would come by air and sea, and it would take days"))]},
    {"k": "bubble", "who": "DRIZZLE", "text": "So… nobody's coming?", "dur": 2.8, "part": 4, "shots": [
        (1, dict(bg="dusk", cam=((660, 440, 1.6), (660, 440, 1.66)),
                 figs=lambda d: [fig("mags", [stand("dusk", 360, 722, "idle", face="worried", mags=True, radio=True)]),
                                 fig("drizzle", [stand("dusk", 620, 730, "idle", face="worried", bag=True)])],
                 bubble=dict(x=1010, y=150, w=600, tail="down-left", t0=0.1), desc="Drizzle: speech bubble"))]},
    {"k": "n", "n": 35, "part": 4, "tail": 1.2, "shots": [
        (0.36, dict(bg="dusk", cam=((680, 520, 1.2), (700, 520, 1.24)),
                    figs=lambda d: [fig("mags", [stand("dusk", 360, 722, "idle", face="worried", mags=True, radio=True)]),
                                    fig("drizzle", [stand("dusk", 620, 730, LOOKDOWN, face="worried", bag=True)])],
                    desc="Below them, the water still rising")),
        (0.28, dict(bg="dusk", cam=((1340, 820, 1.4), (1300, 820, 1.46)), desc="Night coming")),
        (0.36, dict(bg="dusk", cam=((1180, 840, 1.6), (1100, 900, 2.4)), fx=[{"type": "light", "x": 1096, "y": 942, "t0": 0.9}],
                    desc="Push-in: a light flickers on where no one should be"))]},
    {"k": "day", "text": "NEXT: DAY 1", "part": 4, "dur": 3.2, "hold": True},
]


# ---------------------------------------------------------------- card icons (colored ink, the reference look)
K = 'stroke="#1B1D21" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"'
ICONS = {
    "stopwatch": f"""<g {K}><rect x="-12" y="-74" width="24" height="16" rx="4" fill="#C8463F"/><rect x="-5" y="-60" width="10" height="12" fill="#9AA3AD"/>
  <path d="M38 -44 l12 -12" fill="none"/><circle cx="0" cy="4" r="52" fill="#D9DEE3"/><circle cx="0" cy="4" r="40" fill="#FBFBF8"/>
  <path d="M0 4 L0 -26" fill="none"/><path d="M0 4 L22 18" fill="none" stroke="#C8463F"/><circle cx="0" cy="4" r="4" fill="#1B1D21"/></g>""",
    "wave": f"""<g {K}><path d="M-66 52 C -70 -6 -30 -58 20 -56 C 56 -54 72 -26 60 -2 C 50 -22 26 -26 14 -12 C 2 4 18 30 66 52 Z" fill="#4F86C6"/>
  <path d="M60 -2 C 50 -22 26 -26 14 -12 C 24 -18 40 -16 46 -4" fill="#FBFBF8"/><path d="M-50 30 C -44 6 -30 -14 -12 -24" fill="none" stroke="#BFDDF0" stroke-width="6"/></g>""",
    "table": f"""<g {K}><rect x="-66" y="-30" width="132" height="14" rx="3" fill="#A9744F"/><rect x="-58" y="-16" width="10" height="66" fill="#8A5C3C"/>
  <rect x="48" y="-16" width="10" height="66" fill="#8A5C3C"/><circle cx="-14" cy="16" r="13" fill="#FBFBF8"/>
  <path d="M-2 18 L 28 20 M 26 20 L 30 44 M 8 20 L 4 44" fill="none" stroke-width="5"/><path d="M-30 8 Q -16 -6 0 6" fill="none" stroke="#F2C230" stroke-width="7"/></g>""",
    "backpack": f"""<g {K}><path d="M-22 -48 Q 0 -72 22 -48" fill="none" stroke-width="7"/><rect x="-42" y="-50" width="84" height="104" rx="20" fill="#5A6B7D"/>
  <rect x="-30" y="2" width="60" height="38" rx="8" fill="#C8463F"/><path d="M-42 -14 L 42 -14" fill="none"/><rect x="-8" y="-24" width="16" height="12" rx="3" fill="#F2C230"/></g>""",
    "footprints": f"""<g {K}><path d="M-34 60 C -52 40 -54 0 -40 -10 C -24 -20 -14 6 -18 30 C -20 46 -22 56 -34 60 Z" fill="#C9A27A"/>
  <circle cx="-44" cy="-22" r="6" fill="#C9A27A"/><circle cx="-30" cy="-26" r="6" fill="#C9A27A"/>
  <path d="M26 20 C 8 0 6 -40 20 -50 C 36 -60 46 -34 42 -10 C 40 6 38 16 26 20 Z" fill="#C9A27A"/>
  <circle cx="16" cy="-62" r="6" fill="#C9A27A"/><circle cx="30" cy="-66" r="6" fill="#C9A27A"/></g>""",
    "arrowup": f"""<g {K}><path d="M-74 56 L -20 -10 L 6 18 L 30 -6 L 74 56 Z" fill="#6E9E5A"/><path d="M-40 26 L -4 -34" fill="none" stroke="#F2C230" stroke-width="10"/>
  <path d="M-22 -40 L 0 -60 L 6 -30 Z" fill="#F2C230"/></g>""",
    "waves": f"""<g {K}><path d="M-70 -18 C -66 -40 -48 -48 -36 -40 C -44 -40 -50 -32 -46 -24 Z" fill="#9CC3E6"/>
  <path d="M-58 22 C -56 -10 -28 -24 -10 -12 C -22 -12 -28 0 -22 14 Z" fill="#6FA0D4"/>
  <path d="M-40 66 C -40 14 0 -16 40 0 C 64 10 70 34 60 50 C 52 32 34 30 26 40 C 20 50 34 62 66 66 Z" fill="#4F86C6"/></g>""",
    "jug": f"""<g {K}><rect x="-14" y="-74" width="28" height="14" rx="3" fill="#4F86C6"/><path d="M-14 -60 L -40 -30 L -40 56 Q -40 66 -30 66 L 30 66 Q 40 66 40 56 L 40 -30 L 14 -60 Z" fill="#BFDDF0"/>
  <path d="M12 -44 Q 40 -44 36 -14" fill="none" stroke-width="7"/><rect x="-28" y="4" width="56" height="34" rx="4" fill="#FBFBF8"/>
  <path d="M-14 20 L 14 20" fill="none" stroke="#4F86C6" stroke-width="6"/></g>""",
    "bar": f"""<g {K}><rect x="-60" y="-24" width="120" height="48" rx="8" fill="#E0B44A"/><path d="M-60 -24 L -70 -30 L -70 30 L -60 24" fill="#C8963A"/>
  <path d="M60 -24 L 70 -30 L 70 30 L 60 24" fill="#C8963A"/><rect x="-30" y="-12" width="60" height="24" rx="4" fill="#C8463F"/></g>""",
    "can": f"""<g {K}><ellipse cx="0" cy="-48" rx="40" ry="12" fill="#C9CED4"/><path d="M-40 -48 L -40 52 Q 0 66 40 52 L 40 -48" fill="#9AA3AD"/>
  <path d="M-40 -16 Q 0 -4 40 -16 L 40 26 Q 0 38 -40 26 Z" fill="#C8463F"/></g>""",
    "calendar": f"""<g {K}><rect x="-60" y="-56" width="120" height="116" rx="10" fill="#FBFBF8"/><path d="M-60 -24 L 60 -24 L 60 -46 Q 60 -56 50 -56 L -50 -56 Q -60 -56 -60 -46 Z" fill="#C8463F"/>
  <rect x="-36" y="-70" width="10" height="24" rx="4" fill="#9AA3AD"/><rect x="26" y="-70" width="10" height="24" rx="4" fill="#9AA3AD"/>
  <text x="0" y="40" text-anchor="middle" font-family="Montserrat, sans-serif" font-weight="800" font-size="58" fill="#1B1D21" stroke="none">14</text></g>""",
}


# ---------------------------------------------------------------- helpers
def ffprobe_dur(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]).decode())


def clamp_cam(c):
    cx, cy, z = c
    z = max(1.0, z)
    hw, hh = 960 / z, 540 / z
    return [round(min(max(cx, hw), 1920 - hw), 1), round(min(max(cy, hh), 1080 - hh), 1), round(z, 3)]


def load_audio(path, ch=2, sr=SR):
    raw = subprocess.check_output(["ffmpeg", "-nostdin", "-v", "error", "-i", path, "-f", "f32le", "-ac", str(ch), "-ar", str(sr), "-"])
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, ch).copy()


def write(rel, text):
    p = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, "w").write(text)
    print("wrote", rel)


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def fmt(t):
    return f"{int(t // 60)}:{t % 60:04.1f}"


def syllables(w):
    w = w.lower()
    digits = sum(c.isdigit() for c in w)
    if digits:
        return 1.3 * digits
    w = re.sub(r"[^a-z]", "", w)
    if not w:
        return 0.3
    n = len(re.findall(r"[aeiouy]+", w))
    if w.endswith("e") and n > 1 and not w.endswith("le"):
        n -= 1
    return max(1, n)


def word_times(path, text):
    """Estimated start/end of every word. Phrases (split at punctuation) are anchored to the real pauses in the take
    (a monotonic best match of estimated phrase boundaries to detected pauses), then the words of each phrase are
    spread by syllable weight over the voiced time inside it."""
    a = load_audio(path, 1, 16000)[:, 0]
    hop, fr = 160, 100.0
    n = len(a) // hop
    rms = np.sqrt(np.mean(a[: n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    voiced = 20 * np.log10(rms) > -40.0
    # pauses = unvoiced runs >= 0.18 s between voiced audio
    pauses, i = [], 0
    while i < n:
        if not voiced[i]:
            j = i
            while j < n and not voiced[j]:
                j += 1
            if voiced[:i].any() and j < n and (j - i) / fr >= 0.18:
                pauses.append((i / fr, j / fr))
            i = j
        else:
            i += 1
    vs = np.flatnonzero(voiced)
    t_on, t_off = vs[0] / fr, (vs[-1] + 1) / fr
    words = text.split()
    wts = [syllables(w) for w in words]
    # phrases
    phrases, cur = [], []
    for k, w in enumerate(words):
        cur.append(k)
        if re.search(r"[.?!,;:…—]$", w) and k < len(words) - 1:
            phrases.append(cur)
            cur = []
    if cur:
        phrases.append(cur)
    cum = np.cumsum(voiced) / fr
    tot = cum[-1]

    def at(speech_t):
        return min(n - 1, int(np.searchsorted(cum, speech_t, side="left"))) / fr
    W = sum(wts)
    est, acc = [], 0.0
    for ph in phrases[:-1]:
        acc += sum(wts[k] for k in ph)
        est.append(at(tot * acc / W))
    # DP: match boundaries (in order) to distinct pauses (in order), cost = |estimate - pause centre|
    P, M = len(est), len(pauses)
    bounds = list(est)
    if P and M >= P:
        INF = 1e9
        cost = [[INF] * (M + 1) for _ in range(P + 1)]
        choice = [[None] * (M + 1) for _ in range(P + 1)]
        for m in range(M + 1):
            cost[0][m] = 0
        for b in range(1, P + 1):
            for m in range(b, M + 1):
                skip = cost[b][m - 1]
                take = cost[b - 1][m - 1] + abs(est[b - 1] - (pauses[m - 1][0] + pauses[m - 1][1]) / 2)
                cost[b][m], choice[b][m] = (take, "t") if take <= skip else (skip, "s")
        b, m, picked = P, M, []
        while b > 0:
            if choice[b][m] == "t":
                picked.append(m - 1)
                b -= 1
            m -= 1
        picked.reverse()
        bounds = [pauses[q] for q in picked]
    else:
        bounds = [(e, e) for e in est]
    out = []
    edges = [(None, t_on)] + bounds + [(t_off, None)]
    for pi, ph in enumerate(phrases):
        p0, p1 = edges[pi][1], edges[pi + 1][0]
        i0, i1 = int(p0 * fr), max(int(p0 * fr) + 1, int(p1 * fr))
        c = np.cumsum(voiced[i0:i1]) / fr
        T = c[-1] if len(c) and c[-1] > 0 else (p1 - p0)
        pw = sum(wts[k] for k in ph)
        acc = 0.0
        for k in ph:
            s0 = p0 + (np.searchsorted(c, T * acc / pw + 1e-4) / fr if len(c) else 0)
            acc += wts[k]
            s1 = p0 + (np.searchsorted(c, T * acc / pw - 1e-4) + 1) / fr if len(c) else p1
            out.append((round(float(s0), 3), round(float(min(s1, p1)), 3), words[k]))
    return out


def chip_text(w):
    w = w.strip("“”\"").strip()
    w = re.sub(r"^[^\w~]+", "", w)
    w = re.sub(r"[^\w%']+$", "", w)
    return w.upper()


def card_html(text, icons, sid):
    lines = [esc(x) for x in text.split("|")]
    ic = "".join(f'<svg viewBox="-80 -80 160 160" width="300" height="300">{ICONS[i]}</svg>' for i in icons)
    return (f'<div class="cardbg">{noise(sid)}</div><div class="cardc"><div class="icons pop">{ic}</div>'
            f'<div class="ct pop">{"<br>".join(lines)}</div></div>')


def noise(sid):
    # a tiled grain texture (an SVG feTurbulence layer per card leaked through hidden clips in sub-compositions)
    return ""


def main():
    # ------------------------------------------------------------ narration + timeline
    script = open(os.path.join(ROOT, "episodes/ep01/script-v8.md")).read()
    nlines = [l[3:].strip() for l in script.splitlines() if l.startswith("N: ")]
    assert len(nlines) == 35, len(nlines)
    ndur, nwords = {}, {}
    for i in range(1, 36):
        p = os.path.join(ROOT, NARR, f"m{i:02d}-{V}.mp3")
        ndur[i] = ffprobe_dur(p)
        nwords[i] = word_times(p, nlines[i - 1])

    t = 0.0
    shots, events, vo = [], [], []
    for ev in EVENTS:
        k = ev["k"]
        if k == "n":
            d = ev.get("lead", 0) + ndur[ev["n"]] + GAP + ev.get("tail", 0)
            vo.append((ev["n"], t + ev.get("lead", 0)))
        elif k == "cards3":
            d = ndur[ev["n"]] + GAP
            vo.append((ev["n"], t))
        elif k in ("card", "day"):
            d = ev.get("dur", CARD_DUR)
        else:
            d = ev["dur"]
        ev["t0"], ev["dur_"] = t, d
        events.append(ev)
        if k in ("card", "day"):
            shots.append({"kind": k, "t0": t, "dur": d, "card": ev, "ev": ev,
                          "desc": f"{'DAY' if k == 'day' else 'CARD'}: {ev['text'].replace('|', ' ')}"})
        elif k == "cards3":
            # cut to each numbered card on its spoken number ("One." / "Two." / "Three.")
            ws = nwords[ev["n"]]
            starts = [0.0] + [next(w0 for (w0, w1, w) in ws if w.lower().startswith(num)) - 0.12 for num in ("two", "three")]
            cuts = starts + [d]
            for j, (txt, icons) in enumerate(ev["cards"]):
                shots.append({"kind": "card", "t0": t + cuts[j], "dur": cuts[j + 1] - cuts[j], "card": {"text": txt, "icons": icons}, "ev": ev,
                              "desc": f"CARD: {txt.replace('|', ' ')} (cut on the spoken number)"})
        else:
            specs = ev["shots"]
            wsum = sum(w for w, _ in specs)
            tt = t
            for j, (w, sp) in enumerate(specs):
                sd = d * w / wsum if j < len(specs) - 1 else t + d - tt
                s = dict(sp)
                s["t0"], s["dur"], s["ev"] = tt, sd, ev
                s["kind"] = "shot"
                s["cam"] = {"from": clamp_cam(sp["cam"][0]), "to": clamp_cam(sp["cam"][1])} if sp.get("bg") else None
                shots.append(s)
                tt += sd
        t += d
    total = t

    parts = []
    for pn in (1, 2, 3, 4):
        evs = [e for e in events if e["part"] == pn]
        parts.append({"part": pn, "t0": evs[0]["t0"] if pn > 1 else 0.0, "t1": evs[-1]["t0"] + evs[-1]["dur_"]})
    for i in range(3):
        parts[i]["t1"] = parts[i + 1]["t0"]
    for p in parts:
        p["dur"] = p["t1"] - p["t0"]
        if p["dur"] < 65:
            sys.exit(f"part {p['part']} is {p['dur']:.1f}s < 65s")
    for s in shots:
        if s["dur"] > 6.0 + 1e-6:
            sys.exit(f"shot at {s['t0']:.2f} ({s.get('desc')}) is {s['dur']:.2f}s > 6s")

    # ------------------------------------------------------------ resolve shots -> JSON for the runtime
    def shift(seg, dt):
        seg = json.loads(json.dumps(seg))
        seg["t0"] += dt
        seg["t1"] += dt
        return seg

    def resolve_props(f, dt):
        c = f.get("carry")
        if c:
            c = dict(c)
            if c["appear"][0] is None:
                c["appear"] = [0.5, 1.3, 2.1]
            c["appear"] = [a + dt for a in c["appear"]]
            if c.get("drop") is not None:
                c["drop"] += dt
            else:
                c.pop("drop", None)
            f = dict(f, carry=c)
        sn = f.get("snack")
        if sn:
            f = dict(f, snack={"t0": sn["t0"] + dt, "t1": sn["t1"] + dt})
        return f

    for p in parts:
        p["shots"] = []
    for i, s in enumerate(shots):
        pn = s["ev"]["part"]
        p = parts[pn - 1]
        lt0 = s["t0"] - p["t0"]
        sid = f"p{pn}s{len(p['shots']) + 1:02d}"
        s["id"], s["n"], s["part"], s["lt0"] = sid, i + 1, pn, lt0
        js = {"id": sid, "n": i + 1, "t0": round(lt0, 4), "dur": round(s["dur"], 4)}
        if s.get("bg"):
            js["bgSrc"] = BG[s["bg"]]
            js["cam"] = s["cam"]
        if s["kind"] == "shot":
            if s.get("shake"):
                sh = dict(s["shake"])
                sh["t1"] = min(sh["t1"], s["dur"])
                js["shake"] = sh
            if s.get("fx"):
                fxs = []
                for fx in s["fx"]:
                    fx = dict(fx)
                    if fx["type"] in ("mug", "debris"):
                        fx["t1"] = min(fx["t1"], s["dur"])
                    fxs.append(fx)
                js["fx"] = fxs
            if s.get("figs"):
                figs = s["figs"](s["dur"])
                js["figs"] = [resolve_props(dict(f, segs=[shift(g, lt0) for g in f["segs"]]), lt0) for f in figs]
                for f in js["figs"]:
                    for g in f["segs"]:
                        g["t1"] = min(g["t1"], lt0 + s["dur"])
            if s.get("dark"):
                js["dark"] = s["dark"]
            if s.get("bg") in OUTDOOR:
                js["rain"] = 0.22
            if s.get("bubble"):
                js["bubble"] = {"t0": s["bubble"].get("t0", 0.15)}
        s["js"] = js
        p["shots"].append(s)

    # ------------------------------------------------------------ part compositions (16:9)
    css = """
    #root { position: absolute; inset: 0; width: 1920px; height: 1080px; overflow: hidden; background: #0B0D10; }
    .shot { position: absolute; inset: 0; width: 1920px; height: 1080px; overflow: hidden; background: #0B0D10; }
    .cam, .shk, .bg { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; }
    .stage, .rain { position: absolute; left: 0; top: 0; overflow: visible; }
    .dark { position: absolute; inset: 0; background: #05070A; opacity: 0; }
    .cardbg { position: absolute; inset: 0; background: #3A3B3D url("assets/ep01-v8/card-noise-v1.png") repeat; background-size: 512px 512px; }
    .cardc { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 26px; }
    .cardc .icons { display: flex; gap: 30px; }
    .cardc .ct { font-family: "Kalam", cursive; font-weight: 700; font-size: 104px; line-height: 1.08; color: #F4F4F2; text-align: center; white-space: nowrap; }
    .daycard { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: "Kalam", cursive;
      font-weight: 700; font-size: 200px; color: #F4F4F2; letter-spacing: 0.02em; white-space: nowrap; }
    .bubble { position: absolute; box-sizing: border-box; background: #FFFFFF; border: 6px solid #111; border-radius: 48px;
      padding: 22px 40px 26px; font-family: "Kalam", cursive; font-weight: 700; font-size: 60px; line-height: 1.12; color: #111;
      text-align: center; transform-origin: 50% 100%; }
    .bubble .tail { position: absolute; width: 90px; height: 70px; bottom: -64px; }
    .bubble.radio { border-radius: 36px; font-size: 62px; }
"""
    tails = {"down": "left:50%; margin-left:-45px;", "down-right": "right:90px;", "down-left": "left:90px;"}
    tail_svg = {
        "down": '<svg class="tail" style="{pos}" viewBox="0 0 90 70"><path d="M8 0 L45 66 L82 0" fill="#FFFFFF" stroke="#111" stroke-width="6" stroke-linejoin="round"/><rect x="10" y="-8" width="70" height="12" fill="#FFFFFF"/></svg>',
        "down-right": '<svg class="tail" style="{pos}" viewBox="0 0 90 70"><path d="M10 0 Q 40 30 78 66 Q 60 24 70 0" fill="#FFFFFF" stroke="#111" stroke-width="6" stroke-linejoin="round"/><rect x="12" y="-8" width="56" height="12" fill="#FFFFFF"/></svg>',
        "down-left": '<svg class="tail" style="{pos}" viewBox="0 0 90 70"><path d="M80 0 Q 50 30 12 66 Q 30 24 20 0" fill="#FFFFFF" stroke="#111" stroke-width="6" stroke-linejoin="round"/><rect x="22" y="-8" width="56" height="12" fill="#FFFFFF"/></svg>',
    }
    for p in parts:
        pid = f"ep01v8-part{p['part']}"
        divs = []
        for s in p["shots"]:
            inner = []
            if s["kind"] == "shot" and s.get("bg"):
                inner.append(f'<div class="cam"><div class="shk"><img class="bg" src="{BG[s["bg"]]}" alt="">'
                             f'<svg class="stage" viewBox="0 0 1920 1080" width="1920" height="1080" xmlns="http://www.w3.org/2000/svg"></svg></div></div>')
                inner.append('<svg class="rain" viewBox="0 0 1920 1080" width="1920" height="1080" xmlns="http://www.w3.org/2000/svg"></svg>')
                inner.append('<div class="dark"></div>')
            elif s["kind"] == "shot" and s.get("cardbg"):
                inner.append(f'<div class="cardbg">{noise(s["id"])}</div>'
                             '<svg class="stage" viewBox="0 0 1920 1080" width="1920" height="1080" xmlns="http://www.w3.org/2000/svg"></svg>')
            if s["kind"] == "shot" and s.get("bubble"):
                b = s["bubble"]
                inner.append(f'<div class="bubble{" radio" if b.get("radio") else ""}" style="left:{b["x"]}px; top:{b["y"]}px; width:{b["w"]}px;">{esc(s["ev"]["text"])}'
                             + tail_svg[b["tail"]].format(pos=tails[b["tail"]]) + "</div>")
            if s["kind"] == "card":
                inner.append(card_html(s["card"]["text"], s["card"]["icons"], s["id"]))
            if s["kind"] == "day":
                inner.append(f'<div class="cardbg">{noise(s["id"])}</div><div class="daycard pop">{esc(s["card"]["text"])}</div>')
            divs.append(f'    <div id="{s["id"]}" class="clip shot" data-start="{s["lt0"]:.4f}" data-duration="{s["dur"]:.4f}" data-track-index="0">' + "".join(inner) + "</div>")
        shots_json = json.dumps([s["js"] for s in p["shots"]], separators=(",", ":"))
        html = f"""<template>
  <!-- Rainy Day: Cascadia · Episode 1 v8 · PART {p['part']} ({p['dur']:.2f}s) — generated by tools/build-ep01-v8-v1.py. Needs gsap,
       assets/characters/rainy-day-rig-v7.js and assets/ep01-v8/ep01v8-runtime-v1.js loaded by the render root. -->
  <style>{css}  </style>
  <div id="root" data-composition-id="{pid}" data-width="1920" data-height="1080" data-duration="{p['dur']:.4f}">
{chr(10).join(divs)}
    <!-- AUDIO: narration + quiet ambience + the few SFX (track 20); mastered to -14 LUFS on the finished render -->
    <audio id="{pid}-mix" src="audio/ep01-v8/mix/ep01v8-part{p['part']}-mix-{V}.mp3" data-start="0" data-duration="{p['dur']:.4f}" data-track-index="20" data-volume="1"></audio>
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
    EP8.build(tl, {shots_json});
    window.__timelines["{pid}"] = tl;
  </script>
</template>
"""
        write(f"compositions/ep01-v8/{pid}-{V}.html", html)

    # ------------------------------------------------------------ words: chips (vertical) + SRT chunks
    words = []                                  # (t0, t1, raw word, line n)
    for n, t0 in vo:
        for a, b, w in nwords[n]:
            words.append((t0 + a, t0 + b, w, n))
    chips = []
    i = 0
    while i < len(words):
        a, b, w, n = words[i]
        txt = chip_text(w)
        # short function words ride with the next word ("THE OCEAN"), never across a sentence end
        while (max(len(re.sub(r"\W", "", x)) for x in txt.split()) <= 3 and i + 1 < len(words) and words[i + 1][3] == n
               and not re.search(r"[.?!,…]$", w) and len(txt) + len(chip_text(words[i + 1][2])) <= 16):
            i += 1
            b, w = words[i][1], words[i][2]
            txt += " " + chip_text(w)
        if txt:
            chips.append({"t0": a, "t1": b, "text": txt})
        i += 1
    for c, nx in zip(chips, chips[1:]):
        c["t1"] = min(max(c["t1"] + 0.25, c["t0"] + 0.3), nx["t0"])
    chips[-1]["t1"] += 0.3

    caps = []
    for n, t0 in vo:
        ws = nwords[n]
        cur, c0 = [], None
        for j, (a, b, w) in enumerate(ws):
            if not cur:
                c0 = a
            cur.append(w)
            txt = " ".join(cur)
            end_sent = re.search(r"[.?!…]$", w) is not None
            if (end_sent and len(txt) >= 28) or len(txt) >= 70 or j == len(ws) - 1:
                caps.append({"t0": t0 + c0, "t1": t0 + b + 0.2, "text": txt, "kind": "narration"})
                cur = []
    for e in events:
        if e["k"] == "bubble":
            caps.append({"t0": e["t0"] + 0.15, "t1": e["t0"] + e["dur_"] - 0.1, "text": e["text"], "kind": "bubble", "who": e["who"]})
    caps.sort(key=lambda c: c["t0"])
    for a, b in zip(caps, caps[1:]):
        if a["t1"] > b["t0"] - 0.05:
            a["t1"] = b["t0"] - 0.05

    def srt_t(x):
        ms = int(round(x * 1000))
        return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"
    srt = []
    for i, c in enumerate(caps, 1):
        txt = c["text"] if c["kind"] == "narration" else f'{c["who"]}: "{c["text"]}"'
        srt += [str(i), f"{srt_t(c['t0'])} --> {srt_t(c['t1'])}", txt, ""]
    write(f"renders/ep01/ep01-v8-full-{V}.srt", "\n".join(srt))

    # ------------------------------------------------------------ render roots
    def head(w, h, extra_css):
        return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width={w}, height={h}" />
    <script src="assets/vendor/gsap.min.js"></script>
    <script src="assets/characters/rainy-day-rig-v7.js"></script>
    <script src="assets/ep01-v8/ep01v8-runtime-v1.js"></script>
    <style>
      @font-face {{ font-family: "Kalam"; src: url("assets/fonts/Kalam-Bold.woff2") format("woff2"); font-weight: 700; font-style: normal; }}
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ margin: 0; width: {w}px; height: {h}px; overflow: hidden; background: #0B0D10; }}
      #root {{ position: relative; width: 100%; height: 100%; overflow: hidden; background: #0B0D10; }}
{extra_css}
    </style>
  </head>"""

    hosts = "\n".join(f'      <div id="full-part{p["part"]}" data-composition-id="ep01v8-part{p["part"]}" data-composition-src="compositions/ep01-v8/ep01v8-part{p["part"]}-{V}.html" data-start="{p["t0"]:.4f}" data-duration="{p["dur"]:.4f}" data-track-index="0" data-width="1920" data-height="1080"></div>' for p in parts)
    full = f"""{head(1920, 1080, "")}
  <body>
    <!-- Rainy Day: Cascadia · Episode 1 v8 · FULL 16:9 ({total:.2f}s) — generated by tools/build-ep01-v8-v1.py.
         Subtitles ship as renders/ep01/ep01-v8-full-{V}.srt (not burned in). Audio lives in each part composition. -->
    <div id="root" data-composition-id="ep01v8-full" data-start="0" data-duration="{total:.4f}" data-width="1920" data-height="1080">
{hosts}
    </div>
    <script>
      window.__timelines = window.__timelines || {{}};
      const tl = gsap.timeline({{ paused: true }});
      window.__timelines["ep01v8-full"] = tl;
    </script>
  </body>
</html>
"""
    write(f"ep01-v8-full-16x9-{V}.html", full)

    brick = """<svg class="brick" viewBox="0 0 1080 1920" width="1080" height="1920"><defs>
  <pattern id="br" width="180" height="80" patternUnits="userSpaceOnUse"><rect width="180" height="80" fill="#2B2B2C"/>
    <rect x="4" y="4" width="172" height="34" rx="3" fill="#3A3A3B"/><rect x="-86" y="44" width="172" height="32" rx="3" fill="#353536"/>
    <rect x="94" y="44" width="172" height="32" rx="3" fill="#383839"/></pattern>
  <filter id="grunge"><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed="3"/><feColorMatrix values="0 0 0 0 0.75  0 0 0 0 0.75  0 0 0 0 0.75  0 0 0 2.2 -1.1"/></filter>
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0"/></filter></defs>
  <rect width="1080" height="1920" fill="url(#br)"/><rect width="1080" height="1920" filter="url(#grunge)" opacity="0.35"/>
  <rect width="1080" height="1920" filter="url(#grain)"/><rect width="1080" height="1920" fill="#000" opacity="0.28"/></svg>"""
    vcss = """      #wall { position: absolute; inset: 0; }
      .title { position: absolute; left: 60px; width: 960px; top: 300px; height: 168px; background: #FAFAF8; border-radius: 34px;
        display: flex; align-items: center; justify-content: center; text-align: center; font-family: "Nunito", sans-serif; font-weight: 900;
        font-size: 56px; line-height: 1.12; color: #111; box-shadow: 0 6px 18px rgba(0,0,0,.45); }
      #scene { position: absolute; left: 0; top: 590px; width: 1080px; height: 608px; overflow: hidden; background: #000; }
      #frame { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; transform-origin: 0 0; transform: scale(0.5625); overflow: hidden; }
      .chip { position: absolute; left: 0; width: 1080px; top: 1088px; display: flex; justify-content: center; }
      .chip .w { padding: 6px 22px 10px; background: #0B0B0B; border-radius: 18px; font-family: "Montserrat", sans-serif; font-weight: 800;
        font-size: 74px; line-height: 1.1; color: #fff; letter-spacing: 0.01em; white-space: nowrap; }
      .partbox { position: absolute; left: 50%; transform: translateX(-50%); top: 1318px; padding: 14px 64px 22px; background: #FAFAF8; border-radius: 34px;
        font-family: "Nunito", sans-serif; font-weight: 900; font-size: 96px; color: #111; box-shadow: 0 6px 18px rgba(0,0,0,.45); white-space: nowrap; }"""
    for p in parts:
        pid = f"ep01v8-part{p['part']}-9x16"
        pc = [c for c in chips if c["t1"] > p["t0"] + 0.01 and c["t0"] < p["t1"] - 0.01]
        cdivs = []
        for j, c in enumerate(pc):
            a, b = max(c["t0"], p["t0"]) - p["t0"], min(c["t1"], p["t1"]) - p["t0"]
            cdivs.append(f'      <div id="w{p["part"]}-{j + 1:03d}" class="clip chip" data-start="{a:.3f}" data-duration="{b - a:.3f}" data-track-index="5"><div class="w">{esc(c["text"])}</div></div>')
        html = f"""{head(1080, 1920, vcss)}
  <body>
    <!-- Rainy Day: Cascadia · Episode 1 v8 · PART {p['part']} of 4 · TikTok 9:16 ({p['dur']:.2f}s) — generated by tools/build-ep01-v8-v1.py
         Layout (the reference): brick wall · title box (y 300–468) · 16:9 scene at 1080×608 (y 590–1198) · one-word caption chip
         (y ~1088, inside the scene) · "Part N" box (y 1318–~1450) · bottom 20% (y > 1536) clear. -->
    <div id="root" data-composition-id="{pid}" data-start="0" data-duration="{p['dur']:.4f}" data-width="1080" data-height="1920">
      <div id="wall" class="clip" data-start="0" data-duration="{p['dur']:.4f}" data-track-index="1">{brick}
        <div class="title">Cascadia 9.0:<br>22 Minutes To Reach High Ground</div>
        <div class="partbox">Part {p['part']}</div>
      </div>
      <div id="scene">
        <div id="frame">
          <div id="{pid}-scene" data-composition-id="ep01v8-part{p['part']}" data-composition-src="compositions/ep01-v8/ep01v8-part{p['part']}-{V}.html" data-start="0" data-duration="{p['dur']:.4f}" data-track-index="0" data-width="1920" data-height="1080"></div>
        </div>
      </div>
{chr(10).join(cdivs)}
    </div>
    <script>
      window.__timelines = window.__timelines || {{}};
      const tl = gsap.timeline({{ paused: true }});
      window.__timelines["{pid}"] = tl;
    </script>
  </body>
</html>
"""
        write(f"ep01-v8-part{p['part']}-9x16-{V}.html", html)

    # ------------------------------------------------------------ audio: narration + quiet bed + few SFX
    N = int(math.ceil(total * SR)) + SR
    voice = np.zeros((N, 2), np.float32)
    for n, t0 in vo:
        a = load_audio(os.path.join(ROOT, NARR, f"m{n:02d}-{V}.mp3"))
        i0 = int(round(t0 * SR))
        voice[i0:i0 + len(a)] += a
    sfx = np.zeros((N, 2), np.float32)
    cache = {}

    def place(name, t0, gain_db, dur=None, fin=0.05, fout=0.25):
        if name not in cache:
            cache[name] = load_audio(os.path.join(ROOT, "assets/sfx", name + ".mp3"))
        a = cache[name]
        if dur is not None:
            n = int(dur * SR)
            reps = [a]
            while sum(len(r) for r in reps) < n:
                reps.append(a)
            a = np.concatenate(reps)[:n].copy()
        else:
            a = a.copy()
        fi, fo = max(1, int(fin * SR)), max(1, int(fout * SR))
        a[:fi] *= np.linspace(0, 1, fi)[:, None]
        a[-fo:] *= np.linspace(1, 0, fo)[:, None]
        i0 = int(round(max(0, t0) * SR))
        a = a[: max(0, N - i0)]
        sfx[i0:i0 + len(a)] += a * (10 ** (gain_db / 20))

    E = {(e["k"], e.get("n")): e for e in events}
    # quiet beds (continuous, like the reference): rain at the window, rain outside, wind on the hilltop
    t_quake = E[("n", 3)]["t0"] + ndur[3] * 0.55
    t_dark_end = E[("n", 10)]["t0"] + E[("n", 10)]["dur_"]
    t_out = E[("n", 16)]["t0"]
    t_hill = E[("n", 27)]["t0"]
    place("rain-window-v1", 2.7, -26, t_out - 2.7 + 0.5, fin=1.0, fout=0.8)
    place("house-rumble-creak-v1", t_quake, -12, t_dark_end - t_quake - 0.4, fin=1.0, fout=2.5)
    place("rain-outdoor-v1", t_out, -25, t_hill - t_out + 0.6, fin=0.8, fout=1.0)
    place("wind-hilltop-v1", t_hill - 0.4, -26, total - t_hill + 0.4, fin=1.2, fout=2.5)
    place("rain-outdoor-v1", t_hill - 0.4, -30, total - t_hill + 0.4, fin=1.2, fout=2.5)
    # aftershock on the trail
    s21 = next(s for s in shots if s["ev"] is E[("n", 21)])
    place("house-rumble-creak-v1", s21["t0"] + 0.9, -15, 3.6, fin=0.4, fout=1.2)
    for e in events:
        for cue in e.get("sfx", []):
            name, off, g = cue[0], cue[1], cue[2]
            dur = cue[3] if len(cue) > 3 else None
            if name == "crowd-murmur-v1":
                dur = E[("n", 33)]["t0"] - e["t0"]
            if name == "radio-static-crank-v1" and dur is None:
                dur = e["dur_"]
            place(name, e["t0"] + off, g, dur, fin=0.3 if dur else 0.02, fout=0.6 if dur else 0.3)
    mix = voice + sfx
    peak = float(np.max(np.abs(mix)))
    if peak > 0.98:
        mix *= 0.98 / peak
        voice *= 0.98 / peak

    def enc(arr, rel, a=0.0, b=None):
        i0, i1 = int(round(a * SR)), int(round((b if b is not None else total) * SR))
        p = os.path.join(ROOT, rel)
        os.makedirs(os.path.dirname(p), exist_ok=True)
        proc = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                               "-c:a", "libmp3lame", "-b:a", "192k", p], input=arr[i0:i1].astype(np.float32).tobytes())
        assert proc.returncode == 0
        print("wrote", rel)
    enc(voice, f"audio/ep01-v8/narration-full-{V}.mp3")
    for p in parts:
        enc(mix, f"audio/ep01-v8/mix/ep01v8-part{p['part']}-mix-{V}.mp3", p["t0"], p["t1"])

    # ------------------------------------------------------------ timeline JSON + shot list
    tlj = {"version": V, "total": round(total, 3), "parts": [{k: round(p[k], 3) for k in ("t0", "t1", "dur")} | {"part": p["part"]} for p in parts],
           "narration": [{"n": n, "t0": round(t0, 3), "dur": round(ndur[n], 3), "text": nlines[n - 1]} for n, t0 in vo],
           "shots": [{"id": s["id"], "t0": round(s["t0"], 3), "dur": round(s["dur"], 3), "bg": s.get("bg"), "kind": s["kind"], "desc": s.get("desc", "")} for s in shots],
           "chips": [{"t0": round(c["t0"], 3), "t1": round(c["t1"], 3), "text": c["text"]} for c in chips],
           "captions": [{k: (round(v, 3) if isinstance(v, float) else v) for k, v in c.items()} for c in caps]}
    write(f"episodes/ep01/ep01-v8-timeline-{V}.json", json.dumps(tlj, indent=1, ensure_ascii=False))

    L = ["# RAINY DAY: CASCADIA — Episode 1 v8 (survival-guide revamp) — Shot list (v1)", "",
         f"Generated by `tools/build-ep01-v8-v1.py` from `episodes/ep01/script-v8.md` and the narration takes. **{len(shots)} shots · "
         f"{fmt(total)} ({total:.1f} s)** · parts " + " / ".join(f"{p['dur']:.1f} s" for p in parts) + f" · longest shot {max(s['dur'] for s in shots):.2f} s "
         f"· average {total / len(shots):.2f} s.", "",
         "Plates: `assets/ep01-v8/bg/` (reference cartoon style, color; working copies in `bg-2560/`). Characters: rig v7 with `slim: true` "
         "(thin stick figure, yellow slicker), scaled per plate from the feet's height in the picture (`SCALE` in the builder). "
         "Camera = (center x, center y, zoom) in plate pixels, from → to over the shot.", ""]
    for p in parts:
        L += [f"## PART {p['part']} — {fmt(p['t0'])}–{fmt(p['t1'])} ({p['dur']:.1f} s)", "",
              "| # | Time | Dur | Narration | Plate / action | Characters | Card / bubble | Camera |", "|---|---|---|---|---|---|---|---|"]
        for s in p["shots"]:
            ev = s["ev"]
            line = ""
            if ev["k"] in ("n", "cards3"):
                n = ev["n"]
                a, b = s["t0"] - ev["t0"] - ev.get("lead", 0), s["t0"] - ev["t0"] - ev.get("lead", 0) + s["dur"]
                line = " ".join(w for (x0, x1, w) in nwords[n] if x0 >= a - 0.05 and x0 < b - 0.05)
            poses = []
            if s["kind"] == "shot" and s.get("figs"):
                for f in s["figs"](s["dur"]):
                    if f["who"] in ("drizzle", "mags"):
                        desc = []
                        for g in f["segs"]:
                            desc.append("walk" if "walk" in g else (g["hold"] if isinstance(g["hold"], str) else "custom pose"))
                        sc = f["segs"][0].get("scale")
                        poses.append(f"{f['who'].capitalize()} (×{sc:.2f}): " + " → ".join(dict.fromkeys(desc)))
                    else:
                        poses.append("townsperson")
            poses = "; ".join(dict.fromkeys(poses)) or "—"
            cb = "—"
            if s["kind"] == "card":
                cb = f"CARD: {s['card']['text'].replace('|', ' ')} (icon: {', '.join(s['card']['icons'])})"
            elif s["kind"] == "day":
                cb = f"DAY card: {s['card']['text']}"
            elif s.get("bubble"):
                cb = f"BUBBLE ({ev['who'].capitalize()}): \"{ev['text']}\""
            elif ev["k"] == "insert":
                cb = "INSERT: hand-crank radio"
            cam = "—"
            if s.get("cam"):
                c0, c1 = s["cam"]["from"], s["cam"]["to"]
                cam = f"{c0} → {c1}" + (" + shake" if s.get("shake") else "")
            bgt = f"`{BG[s['bg']].split('/')[-1].replace('.jpg', '.png')}`" if s.get("bg") else ("dark card" if s["kind"] != "shot" or s.get("cardbg") else "black")
            L.append(f"| {s['n']} | {fmt(s['t0'])} | {s['dur']:.2f}s | {esc(line) or '—'} | {bgt}<br>{s.get('desc', '')} | {poses} | {cb} | {cam} |")
        L.append("")
    write(f"episodes/ep01/shotlist-v8-{V}.md", "\n".join(L))
    print(f"episode {total:.2f}s; parts " + " / ".join(f"{p['dur']:.2f}" for p in parts) + f"; {len(shots)} shots; {len(chips)} chips; {len(caps)} captions")


if __name__ == "__main__":
    main()
