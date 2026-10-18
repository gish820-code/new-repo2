#!/usr/bin/env python3
"""Rainy Day: Cascadia — Episode 1 REMAKE builder (v1): the narration-led, style-B episode.

Reads the script (episodes/ep01/script-v7.md) and the per-line narration (audio/ep01-remake/narration/nNN-v1.mp3,
voice: Sterling), lays the episode out on the narration, and generates deterministically:
  episodes/ep01/ep01-remake-timeline-v1.json     every event + shot with absolute times
  episodes/ep01/shotlist-remake-v1.md            the shot list (duration, line, background, poses, card/bubble, camera)
  compositions/ep01-remake/ep01r-partN-v1.html   16:9 part sub-compositions (shots + the part's audio)
  ep01-remake-full-16x9-v1.html                  render root: the whole episode, 1920x1080
  ep01-remake-partN-9x16-v1.html                 render roots: TikTok parts, 1080x1920 (header + scene + captions)
  audio/ep01-remake/narration-full-v1.mp3        narration only, on the episode timeline
  audio/ep01-remake/mix/ep01r-partN-mix-v1.mp3   narration + SFX premix per part (mastered later on the renders)
  renders/ep01/ep01-remake-full-v1.srt           subtitles (narration + bubbles)
Usage: python3 tools/build-ep01-remake-v1.py
"""
import json, math, os, re, subprocess, sys
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = "v1"
SR = 48000
NARR = "audio/ep01-remake/narration"
BGDIR = "assets/ep01-remake/bg-1920"
GAP = 0.45            # breath after every narration line
CARD_DUR = 2.6

BG = {
    "kitchen": f"{BGDIR}/bg01-kitchen-v1.jpg", "wrecked": f"{BGDIR}/bg02-kitchen-wrecked-v1.jpg",
    "under": f"{BGDIR}/bg03-under-table-v1.jpg", "street": f"{BGDIR}/bg04-main-street-v1.jpg",
    "harbor": f"{BGDIR}/bg05-harbor-drained-v1.jpg", "jam": f"{BGDIR}/bg06-harbor-way-jam-v1.jpg",
    "trail": f"{BGDIR}/bg07-evac-trail-v1.jpg", "view": f"{BGDIR}/bg08-view-back-v2.jpg",
    "wave": f"{BGDIR}/bg09-wave-hits-v1.jpg", "hill": f"{BGDIR}/bg10-hilltop-day-v1.jpg",
    "dusk": f"{BGDIR}/bg11-hilltop-dusk-v1.jpg", "wood": f"{BGDIR}/bg12-radio-surface-v1.jpg",
}
GRAY = "grayscale(1)"
FILT = {"dusk": "grayscale(1) brightness(0.62) contrast(1.08)", "wood": "grayscale(1) brightness(0.9)"}
OUTDOOR = {"street", "harbor", "jam", "trail", "view", "wave", "hill", "dusk"}

# ---------------------------------------------------------------- poses (names = rig v5 POSES; dicts = mixed onto idle)
FLINCH = {"torso": -6, "head": -12, "lsh": 150, "lel": 70, "rsh": 160, "rel": 60, "dy": 8}
LOOKDOWN = {"head": 22, "torso": 8}
SHOULDER = {"torso": 6, "lsh": 40, "lel": 25, "rsh": -6, "rel": 10}
COUNT = {"rsh": 70, "rel": 95, "lsh": 20, "lel": 60, "head": 6}
OFFER = {"torso": 8, "rsh": 75, "rel": 10, "lsh": -6}
POINTUP = {"rsh": 150, "rel": 5, "head": -10}
TUG = {"torso": 10, "lsh": 60, "lel": 10, "rsh": 30, "rel": 20}
LEANWALK = {"rsh": 135, "rel": -25}          # Mags' arm over Drizzle's shoulder
# under the table: crouched, the near hand gripping the table leg, the other arm folded over the head
GRIP = {"torso": 30, "head": 16, "lsh": 165, "lel": 85, "rsh": 40, "rel": -6, "lhip": 100, "lkn": -128, "rhip": 88, "rkn": -122, "dy": 64}


def hold(t0, t1, pose, x=None, y=None, sc=None, facing=None, face=None, **kw):
    d = {"t0": t0, "t1": t1, "hold": pose}
    for k, v in (("x", x), ("y", y), ("scale", sc), ("facing", facing), ("face", face)):
        if v is not None:
            d[k] = v
    d.update(kw)
    return d


def walk(t0, t1, x0, x1, y0, y1, sc=None, facing=None, face=None, rate=1.8, **kw):
    w = {"x0": x0, "x1": x1, "y0": y0, "y1": y1, "rate": rate}
    w.update({k: v for k, v in kw.items() if k in ("torso", "armSwing", "arm", "phase0", "bob")})
    d = {"t0": t0, "t1": t1, "walk": w}
    for k, v in (("scale", sc), ("facing", facing), ("face", face)):
        if v is not None:
            d[k] = v
    d.update({k: v for k, v in kw.items() if k in ("bag", "blend")})
    return d


def hip(ground, sc):
    return ground - 116 * sc


def fig(who, segs, **kw):
    f = {"who": who, "segs": segs}
    f.update(kw)
    return f


def extra(segs, **opts):
    return {"who": "extra", "segs": segs, "opts": opts}


# ---------------------------------------------------------------- the episode, beat by beat
# Every event is one script item. Shots: list of (weight, spec) or a function of the event duration returning specs.
# spec keys: bg, cam (from, to) as (cx, cy, zoom), figs (fn of shot dur -> list), fx, shake, dark, rain, bubble, desc.
KD = 1.6                     # kitchen scale
KG = 1000                    # kitchen ground line
KY = hip(KG, KD)
CLOCK = {"type": "clock", "cx": 1075.3, "cy": 230.7, "r": 37, "face": "#C2C2C2", "patch": [1100, 203, 1110, 196], "time": "10:42"}
CLOCKW = dict(CLOCK, cx=1072, cy=232, time="10:46")
UD, UG = 1.9, 1030           # under-table
UY = hip(UG, UD)


def kitchen_figs(face="smile", pose="idle", x=900):
    return lambda d: [fig("drizzle", [hold(0, d, pose, x, KY, KD, 1, face)])]


EVENTS = [
    # ===================================== PART 1
    {"k": "cold", "dur": 2.2, "part": 1, "label": "COLD OPEN", "shots": [
        (1, dict(bg="wave", cam=((1280, 470, 1.0), (1330, 450, 1.16)), shake=dict(t0=0, t1=2.2, amp=9, rampIn=0.1, rampOut=0.1),
                 desc="Cold open: the wave cresting over Gull Harbor's rooftops, push-in + shake"))],
     "sfx": [("wave-crash-v1", 0, -3)]},
    {"k": "black", "dur": 0.6, "part": 1, "label": "hard cut to black", "shots": [(1, dict(bg=None, desc="Black"))]},
    {"k": "n", "n": 1, "part": 1, "shots": [
        (0.5, dict(bg="kitchen", cam=((380, 300, 2.3), (420, 300, 2.45)), desc="Rain streaking the kitchen window, the gray sea beyond")),
        (0.5, dict(bg="kitchen", cam=((960, 600, 1.12), (960, 600, 1.0)), figs=kitchen_figs(), fx=[CLOCK],
                   desc="Kitchen wide (pull-out); Drizzle by the table, smiling"))]},
    {"k": "card", "text": "DAY 0 · 10:42 AM", "icon": "clock", "part": 1},
    {"k": "n", "n": 2, "part": 1, "shots": [
        (1, dict(bg="kitchen", cam=((1000, 640, 1.25), (1040, 620, 1.42)), figs=kitchen_figs("smile", "idleB"), fx=[CLOCK],
                 desc="Slow push-in on Drizzle, content, coffee on the table"))]},
    {"k": "n", "n": 3, "part": 1, "shots": [
        (0.32, dict(bg="kitchen", cam=((1075, 236, 4.2), (1075, 234, 4.6)), fx=[CLOCK], desc="Insert: the wall clock — 10:42 (clean vector hands)")),
        (0.34, dict(bg="kitchen", cam=((1178, 520, 4.0), (1178, 524, 4.4)), fx=[CLOCK, {"type": "mug", "x": 1146, "y": 496, "w": 66, "h": 62, "t0": 0, "t1": 9, "amp": 2.6}],
                    desc="Insert: the coffee cup starts to shiver")),
        (0.34, dict(bg="kitchen", cam=((960, 560, 1.0), (960, 560, 1.06)), fx=[CLOCK], shake=dict(t0=0.6, t1=99, amp=10, rampIn=1.4),
                    figs=lambda d: [fig("drizzle", [hold(0, 0.7, "idle", 900, KY, KD, 1, "o"), hold(0.7, d, FLINCH, face="scared")])],
                    desc="Wide: the floor moves — Drizzle flinches"))],
     "sfx": [("cup-rattle-v2", 2.2, -10)]},
    {"k": "n", "n": 4, "part": 1, "shots": [
        (0.25, dict(bg="kitchen", cam=((1100, 560, 1.08), (1200, 560, 1.12)), fx=[CLOCK], shake=dict(t0=0, t1=99, amp=12, rampIn=0.01),
                    figs=lambda d: [fig("drizzle", [hold(0, 0.3, FLINCH, 900, KY, KD, 1, "scared"), walk(0.3, d, 900, 1380, KY, KY, KD, 1, "scared", rate=2.6)])],
                    desc="Drizzle runs for the doorway (fast procedural walk)")),
        (0.28, dict(bg="kitchen", cam=((1560, 640, 1.7), (1580, 620, 1.85)), fx=[CLOCK], shake=dict(t0=0, t1=99, amp=12, rampIn=0.01),
                    figs=lambda d: [fig("drizzle", [hold(0, 0.6, "idle", 1440, KY, KD, 1, "worried"), hold(0.6, d, "lookUp", face="worried")])],
                    desc="Medium: Drizzle in the doorway, looking up — the myth")),
        (0.24, dict(bg="kitchen", cam=((1600, 300, 2.4), (1600, 320, 2.6)), fx=[CLOCK, {"type": "debris", "x0": 1500, "x1": 1700, "y0": 120, "y1": 980, "t0": 0, "t1": 9, "n": 26}],
                    shake=dict(t0=0, t1=99, amp=12, rampIn=0.01), desc="Close: the door frame — plaster and glass falling right where he stands")),
        (0.23, dict(bg="kitchen", cam=((1200, 580, 1.2), (1100, 580, 1.15)), fx=[CLOCK], shake=dict(t0=0, t1=99, amp=12, rampIn=0.01),
                    figs=lambda d: [fig("drizzle", [hold(0, 0.4, FLINCH, 1440, KY, KD, 1, "scared"), hold(0.4, d, "idle", facing=-1, face="determined")])],
                    desc="Wide: Drizzle turns back toward the table"))],
     "sfx": [("glass-break-v1", 6.2, -9)]},
    {"k": "n", "n": 5, "part": 1, "shots": [
        (1, dict(bg="kitchen", cam=((1180, 640, 1.3), (1220, 660, 1.4)), fx=[CLOCK], shake=dict(t0=0, t1=99, amp=12, rampIn=0.01),
                 figs=lambda d: [fig("drizzle", [hold(0, 0.3, "idle", 1440, KY, KD, -1, "determined"), walk(0.3, 1.4, 1440, 1260, KY, KY, KD, -1, "determined", rate=2.6), hold(1.4, d, "crouch", face="determined")])],
                 desc="Drizzle dives for the table"))]},
    {"k": "card", "text": "DROP · COVER · HOLD ON", "icon": "table", "part": 1},
    {"k": "n", "n": 6, "part": 1, "shots": [
        (0.55, dict(bg="under", cam=((1300, 620, 1.05), (1360, 640, 1.15)), shake=dict(t0=0, t1=99, amp=11, rampIn=0.01),
                    figs=lambda d: [fig("drizzle", [hold(0, d, GRIP, 1520, UY, UD, 1, "scared")])],
                    desc="Under the table: Drizzle crouched, one hand gripping the leg, one arm over his head")),
        (0.45, dict(bg="under", cam=((1620, 760, 1.9), (1640, 760, 2.05)), shake=dict(t0=0, t1=99, amp=11, rampIn=0.01),
                    figs=lambda d: [fig("drizzle", [hold(0, d, GRIP, 1520, UY, UD, 1, "scared")])],
                    desc="Close: his grip on the table leg"))]},
    {"k": "n", "n": 7, "part": 1, "shots": [
        (0.5, dict(bg="under", cam=((1500, 700, 1.4), (1250, 700, 1.4)), shake=dict(t0=0, t1=99, amp=11, rampIn=0.01),
                   figs=lambda d: [fig("mags", [hold(0, d, "cover", 1150, UY, UD * 0.97, 1, "determined")]), fig("drizzle", [hold(0, d, GRIP, 1520, UY, UD, 1, "scared")])],
                   desc="Pan: Mags is already under there, head covered")),
        (0.5, dict(bg="under", cam=((1330, 680, 1.25), (1330, 690, 1.32)), shake=dict(t0=0, t1=99, amp=11, rampIn=0.01),
                   figs=lambda d: [fig("mags", [hold(0, d, "cover", 1150, UY, UD * 0.97, 1, "determined")]), fig("drizzle", [hold(0, d, GRIP, 1520, UY, UD, 1, "worried")])],
                   desc="Two-shot under the table"))]},
    {"k": "n", "n": 8, "part": 1, "shots": [
        (0.5, dict(bg="kitchen", cam=((960, 540, 1.0), (960, 540, 1.04)), fx=[CLOCK, {"type": "debris", "x0": 300, "x1": 900, "y0": 300, "y1": 1000, "t0": 0.5, "t1": 9, "n": 20}],
                   shake=dict(t0=0, t1=99, amp=16, rampIn=0.01), desc="The empty kitchen shaking hard — things falling")),
        (0.5, dict(bg="under", cam=((1330, 680, 1.4), (1330, 690, 1.5)), shake=dict(t0=0, t1=99, amp=14, rampIn=0.01),
                   figs=lambda d: [fig("mags", [hold(0, d, "cover", 1150, UY, UD * 0.97, 1, "determined")]), fig("drizzle", [hold(0, d, GRIP, 1520, UY, UD, 1, "scared")])],
                   desc="Under the table: holding on"))],
     "sfx": [("glass-break-v1", 1.4, -12)]},
    {"k": "card", "text": "4 MINUTES", "icon": "stopwatch", "part": 1},
    {"k": "n", "n": 9, "part": 1, "shots": [
        (0.34, dict(bg="under", cam=((1330, 680, 1.25), (1340, 680, 1.3)), shake=dict(t0=0, t1=99, amp=12, rampIn=0.01),
                    figs=lambda d: [fig("mags", [hold(0, d, "cover", 1150, UY, UD * 0.97, 1, "determined")]), fig("drizzle", [hold(0, d, GRIP, 1520, UY, UD, 1, "worried")])],
                    desc="Under the table, still shaking")),
        (0.33, dict(bg="kitchen", cam=((300, 330, 2.6), (330, 330, 2.9)), fx=[CLOCK], shake=dict(t0=0, t1=99, amp=8, rampIn=0.01),
                    desc="Through the window: the sea — seven hundred miles of fault offshore")),
        (0.33, dict(bg="under", cam=((1450, 720, 1.6), (1450, 720, 1.7)), shake=dict(t0=0, t1=99, amp=8, rampIn=0.01, rampOut=2.5),
                    figs=lambda d: [fig("drizzle", [hold(0, d, GRIP, 1520, UY, UD, 1, "scared")])],
                    desc="Close on Drizzle, eyes wide"))]},
    {"k": "n", "n": 10, "part": 1, "tail": 1.35, "shots": [
        (1, dict(bg="under", cam=((1330, 680, 1.3), (1330, 680, 1.36)), shake=dict(t0=0, t1=99, amp=10, rampIn=0.01),
                 figs=lambda d: [fig("mags", [hold(0, d, "cover", 1150, UY, UD * 0.97, 1, "determined")]), fig("drizzle", [hold(0, d, GRIP, 1520, UY, UD, 1, "scared")])],
                 dark=[[0, 0], [0.55, 0.55], [0.62, 0.05], [0.75, 0.7], [0.83, 0.2], [0.95, 0.84]],
                 desc="The lights flicker and go out — faint detail stays (end of Part 1)"))],
     "sfx": [("power-out-click-v1", 0.5, -8)]},
    # ===================================== PART 2
    {"k": "n", "n": 11, "part": 2, "shots": [
        (0.5, dict(bg="wrecked", cam=((1000, 640, 1.15), (960, 600, 1.05)), fx=[CLOCKW], dark=[[0, 0.84], [0.2, 0.6], [1.0, 0.3], [2.0, 0.18]],
                   figs=lambda d: [fig("mags", [hold(0, 1.2, "crouch", 1060, KY, 1.55, 1, "neutral"), hold(1.2, d, "idle", face="determined")]),
                                   fig("drizzle", [hold(0, 1.6, "crouch", 760, KY, KD, 1, "worried"), hold(1.6, d, "idle", face="worried")])],
                   desc="Daylight only — the wrecked kitchen; they get up")),
        (0.5, dict(bg="wrecked", cam=((800, 860, 1.9), (860, 860, 2.0)), fx=[CLOCKW], dark=[[0, 0.18]],
                   figs=lambda d: [fig("drizzle", [hold(0, d, LOOKDOWN, 760, KY, KD, 1, "worried")])],
                   desc="Broken glass at his feet — Now what?"))]},
    {"k": "n", "n": 12, "part": 2, "shots": [
        (0.5, dict(bg="wrecked", cam=((600, 290, 2.3), (640, 300, 2.5)), fx=[CLOCKW], dark=[[0, 0.18]],
                   desc="The cracked window — the sea right there")),
        (0.5, dict(bg="wrecked", cam=((1060, 600, 1.15), (1100, 600, 1.2)), fx=[CLOCKW], dark=[[0, 0.18]],
                   figs=lambda d: [fig("mags", [hold(0, 0.8, "idle", 1180, KY, 1.55, -1, "determined"), hold(0.8, d, "point", facing=1, face="determined")]),
                                   fig("drizzle", [hold(0, d, "idle", 760, KY, KD, 1, "worried")])],
                   desc="Mags points at the door"))]},
    {"k": "bubble", "who": "MAGS", "text": "We're not waiting for a siren.", "dur": 2.8, "part": 2, "shots": [
        (1, dict(bg="wrecked", cam=((1080, 560, 1.4), (1090, 560, 1.46)), fx=[CLOCKW], dark=[[0, 0.18]],
                 figs=lambda d: [fig("mags", [hold(0, d, "point", 1180, KY, 1.55, 1, "determined")]), fig("drizzle", [hold(0, d, "idle", 860, KY, KD, 1, "worried")])],
                 bubble=dict(x=1060, y=120, w=620, tail="down-left", t0=0.1), desc="Mags: speech bubble"))]},
    {"k": "n", "n": 13, "part": 2, "shots": [
        (0.5, dict(bg="wrecked", cam=((1260, 520, 1.9), (1260, 520, 2.05)), fx=[CLOCKW], dark=[[0, 0.18]],
                   figs=lambda d: [fig("mags", [hold(0, d, "idle", 1180, KY, 1.55, 1, "determined")])], desc="Close on Mags, steady")),
        (0.5, dict(bg="wrecked", cam=((1072, 236, 4.2), (1072, 236, 4.5)), fx=[CLOCKW], dark=[[0, 0.18]], desc="The clock: 10:46 — no siren, no alert"))]},
    {"k": "n", "n": 14, "part": 2, "shots": [
        (0.62, dict(bg="wrecked", cam=((900, 620, 1.3), (940, 620, 1.36)), fx=[CLOCKW], dark=[[0, 0.18]],
                    figs=lambda d: [fig("drizzle", [hold(0, 0.4, "reach", 860, KY, KD, -1, "worried"), hold(0.4, d, "carry", face="worried")],
                                        carry={"items": ["laptop", "album", "plant"], "appear": [None, None, None], "drop": None, "dropTo": []})],
                    desc="Drizzle grabs his laptop, photo album, a plant")),
        (0.38, dict(bg="wrecked", cam=((960, 700, 1.5), (960, 700, 1.55)), fx=[CLOCKW], dark=[[0, 0.18]],
                    figs=lambda d: [fig("drizzle", [hold(0, 0.6, "carry", 860, KY, KD, -1, "worried"), hold(0.6, d, "crouch", face="neutral")],
                                        carry={"items": ["laptop", "album", "plant"], "appear": [0, 0, 0], "drop": 0.7, "dropTo": [[700, 990], [780, 1000], [640, 985]]})],
                    desc="…then puts them all down"))]},
    {"k": "card", "text": "GO-BAG, NOT BELONGINGS", "icon": "backpack", "part": 2},
    {"k": "n", "n": 15, "part": 2, "shots": [
        (0.3, dict(bg="wrecked", cam=((1820, 360, 2.6), (1820, 380, 2.8)), fx=[CLOCKW, {"type": "gobag", "x": 1835, "y": 470, "scale": 2.5}], dark=[[0, 0.18]],
                   desc="Close: the go-bag on its hook by the door")),
        (0.25, dict(bg="wrecked", cam=((1500, 600, 1.4), (1560, 600, 1.45)), fx=[CLOCKW, {"type": "gobag", "x": 1835, "y": 470, "scale": 2.5, "hideAt": 2.2}], dark=[[0, 0.18]],
                    figs=lambda d: [fig("drizzle", [walk(0, 1.6, 1200, 1660, KY, KY, KD, 1, "determined"), hold(1.6, 2.2, "reach", face="determined"), hold(2.2, d, "idle", bag=True, face="determined")])],
                    desc="Drizzle walks to the door and grabs it (three seconds)")),
        (0.25, dict(bg="wrecked", cam=((1600, 560, 2.0), (1600, 560, 2.1)), fx=[CLOCKW], dark=[[0, 0.18]],
                    figs=lambda d: [fig("drizzle", [hold(0, d, "idle", 1660, KY, KD, -1, "smile", bag=True)])],
                    desc="Close: go-bag on — water, flashlight, radio, medicine, warm layer")),
        (0.2, dict(bg="wrecked", cam=((1300, 580, 1.2), (1360, 580, 1.25)), fx=[CLOCKW], dark=[[0, 0.18]],
                   figs=lambda d: [fig("mags", [walk(0, d, 1180, 1700, KY, KY, 1.55, 1, "determined", rate=1.7)]),
                                   fig("drizzle", [walk(0, d, 1350, 1860, KY, KY, KD, 1, "determined", bag=True)])],
                   desc="Out the door, both of them"))],
     "sfx": [("door-slam-v1", -0.6, -10, "end")]},
    {"k": "n", "n": 16, "part": 2, "shots": [
        (0.5, dict(bg="street", cam=((960, 560, 1.0), (980, 580, 1.08)),
                   figs=lambda d: [extra([hold(0, d, "lookUp", 700, hip(760, 0.62), 0.62, 1)], coat="steel", hat="cap"),
                                   extra([hold(0, d, "idle", 1310, hip(770, 0.6), 0.6, -1)], coat="mist", hair="long"),
                                   fig("mags", [walk(0, d, 220, 640, hip(1030, 1.3), hip(1030, 1.3), 1.3, 1, "determined", rate=1.7)]),
                                   fig("drizzle", [walk(0, d, 360, 800, hip(1030, 1.35), hip(1030, 1.35), 1.35, 1, "worried", bag=True)])],
                   desc="Main Street: windows shattered, lines down; they walk in")),
        (0.5, dict(bg="street", cam=((1000, 760, 1.6), (980, 700, 1.75)),
                   figs=lambda d: [fig("mags", [hold(0, d, "idle", 640, hip(1030, 1.3), 1.3, 1, "determined")]), fig("drizzle", [hold(0, d, LOOKDOWN, 800, hip(1030, 1.35), 1.35, 1, "worried", bag=True)])],
                   desc="Push-in on the cracked road"))]},
    {"k": "n", "n": 17, "part": 2, "shots": [
        (1, dict(bg="harbor", cam=((960, 560, 1.0), (900, 520, 1.12)),
                 figs=lambda d: [fig("mags", [hold(0, d, "idle", 150, hip(1060, 1.15), 1.15, 1, "worried")]), fig("drizzle", [hold(0, d, "point", 300, hip(1060, 1.2), 1.2, 1, "o", bag=True)])],
                 desc="The harbor: the water is leaving"))]},
    {"k": "card", "text": "SEA DRAINING AWAY = TSUNAMI COMING", "icon": "wave", "part": 2, "dur": 3.0},
    {"k": "n", "n": 18, "part": 2, "shots": [
        (0.33, dict(bg="harbor", cam=((560, 640, 1.8), (600, 640, 1.9)), desc="Boats sitting in the mud")),
        (0.34, dict(bg="harbor", cam=((900, 580, 1.5), (940, 560, 1.6)),
                    figs=lambda d: [extra([walk(0, d, 760, 860, hip(640, 0.36), hip(620, 0.36), 0.36, 1, rate=1.6)], coat="mist", hat="cap"),
                                    extra([walk(0, d, 820, 905, hip(655, 0.38), hip(635, 0.38), 0.38, 1, rate=1.5)], coat="steel", hair="long"),
                                    extra([walk(0, d, 1020, 1090, hip(660, 0.37), hip(642, 0.37), 0.37, 1, rate=1.5)], coat="fog")],
                    desc="A few people walk out onto the mud to look")),
        (0.33, dict(bg="harbor", cam=((360, 820, 2.0), (360, 820, 2.1)),
                    figs=lambda d: [fig("mags", [hold(0, d * 0.4, "point", 150, hip(1060, 1.15), 1.15, 1, "determined"), hold(d * 0.4, d, TUG, facing=1, face="determined")]),
                                    fig("drizzle", [hold(0, d * 0.5, "idle", 300, hip(1060, 1.2), 1.2, 1, "worried", bag=True), hold(d * 0.5, d, "idle", facing=-1, face="worried")])],
                    desc="Mags pulls Drizzle back from the edge"))]},
    {"k": "n", "n": 19, "part": 2, "shots": [
        (0.5, dict(bg="jam", cam=((800, 520, 1.1), (860, 500, 1.18)), desc="Harbor Way: cars jammed, horns, going nowhere")),
        (0.5, dict(bg="jam", cam=((1050, 330, 2.0), (1150, 320, 2.15)), desc="Down the line of stalled cars"))],
     "sfx": [("car-horns-distant-v1", 0, -9)]},
    {"k": "card", "text": "WALK, DON'T DRIVE", "icon": "footprints", "part": 2},
    {"k": "n", "n": 20, "part": 2, "shots": [
        (0.5, dict(bg="jam", cam=((900, 700, 1.25), (1000, 700, 1.25)),
                   figs=lambda d: [fig("mags", [walk(0, d, 300, 760, hip(1035, 1.25), hip(1035, 1.25), 1.25, 1, "determined", rate=1.7)]),
                                   fig("drizzle", [walk(0, d, 430, 900, hip(1040, 1.3), hip(1040, 1.3), 1.3, 1, "determined", bag=True)])],
                   desc="They walk past the jam (procedural walk, tracking)")),
        (0.5, dict(bg="jam", cam=((1050, 700, 1.25), (1150, 680, 1.3)),
                   figs=lambda d: [fig("mags", [walk(0, d * 0.7, 760, 1080, hip(1035, 1.25), hip(1035, 1.25), 1.25, 1, "determined", rate=1.7), hold(d * 0.7, d, "idle")]),
                                   fig("drizzle", [walk(0, d * 0.7, 900, 1220, hip(1040, 1.3), hip(1040, 1.3), 1.3, 1, "determined", bag=True), hold(d * 0.7, d, POINTUP, face="smile")])],
                   desc="At the evacuation sign: uphill (end of Part 2)"))],
     "sfx": [("footsteps-mud-v1", 0, -16)]},
    # ===================================== PART 3
    {"k": "n", "n": 21, "part": 3, "shots": [
        (1, dict(bg="trail", cam=((900, 620, 1.05), (980, 600, 1.12)),
                 figs=lambda d: [fig("mags", [walk(0, d, 330, 720, hip(1010, 1.05), hip(965, 1.05), 1.05, 1, "determined", rate=1.6, torso=10)]),
                                 fig("drizzle", [walk(0, d, 450, 860, hip(1005, 1.08), hip(955, 1.08), 1.08, 1, "determined", bag=True, torso=10)])],
                 desc="The evacuation trail: steep, muddy, signed"))],
     "sfx": [("footsteps-mud-v1", 0, -14)]},
    {"k": "card", "text": "HIGH GROUND · 0.4 MILES", "icon": "arrowup", "part": 3},
    {"k": "n", "n": 22, "part": 3, "shots": [
        (0.5, dict(bg="trail", cam=((900, 700, 1.4), (960, 680, 1.45)),
                   figs=lambda d: [fig("mags", [walk(0, d, 720, 940, hip(965, 1.05), hip(940, 1.05), 1.05, 1, "determined", rate=1.6, torso=10)]),
                                   fig("drizzle", [walk(0, d, 860, 1090, hip(955, 1.08), hip(928, 1.08), 1.08, 1, "determined", bag=True, torso=10)])],
                   desc="Climbing")),
        (0.5, dict(bg="trail", cam=((980, 660, 1.45), (990, 660, 1.5)), shake=dict(t0=0.3, t1=3.0, amp=9, rampIn=0.3, rampOut=0.8),
                   figs=lambda d: [fig("mags", [hold(0, 0.4, "idle", 940, hip(940, 1.05), 1.05, 1, "worried"), hold(0.4, 3.0, "cover", face="scared"), hold(3.0, d, "idle", face="determined")]),
                                   fig("drizzle", [hold(0, 0.4, "idle", 1090, hip(928, 1.08), 1.08, 1, "worried", bag=True), hold(0.4, 3.0, "cover", face="scared"), hold(3.0, d, "idle", face="determined")])],
                   desc="Aftershock: both get low, heads covered"))],
     "sfx": [("house-rumble-creak-v1", 3.9, -14, 3.4)]},
    {"k": "n", "n": 23, "part": 3, "shots": [
        (0.5, dict(bg="trail", cam=((1000, 660, 1.6), (1010, 660, 1.66)),
                   figs=lambda d: [fig("mags", [hold(0, 0.6, "idle", 940, hip(940, 1.05), 1.05, 1, "worried"), hold(0.6, d, "kneel", face="worried")]),
                                   fig("drizzle", [hold(0, 0.9, "idle", 1090, hip(928, 1.08), 1.08, -1, "worried", bag=True), hold(0.9, d, SHOULDER, facing=-1, face="determined")])],
                   desc="Mags' knees give out; Drizzle offers his shoulder")),
        (0.5, dict(bg="trail", cam=((980, 620, 1.3), (1060, 600, 1.35)),
                   figs=lambda d: [fig("mags", [walk(0, d, 855, 1065, hip(945, 1.05), hip(918, 1.05), 1.05, 1, "determined", rate=1.5, torso=12, arm=LEANWALK)]),
                                   fig("drizzle", [walk(0, d, 950, 1160, hip(938, 1.08), hip(911, 1.08), 1.08, 1, "determined", rate=1.5, bag=True, torso=10)])],
                   desc="Shared walk: Mags leaning on Drizzle"))]},
    {"k": "insert", "dur": 1.7, "part": 3, "shots": [
        (1, dict(bg="wood", cam=((960, 600, 1.0), (960, 600, 1.06)), fx=[{"type": "radio", "x": 930, "y": 720, "scale": 1.45, "crank0": 0, "static0": 0.5}],
                 desc="INSERT: the hand-crank radio — cranking, static"))],
     "sfx": [("radio-static-crank-v1", 0, -10)]},
    {"k": "bubble", "who": "RADIO", "text": "…tsunami warning for the entire Washington coast… move to high ground immediately…", "dur": 5.0, "part": 3, "shots": [
        (1, dict(bg="wood", cam=((960, 600, 1.06), (980, 590, 1.12)), fx=[{"type": "radio", "x": 930, "y": 720, "scale": 1.45, "crank0": 0, "crank1": 0.6, "clean0": 0.2}],
                 bubble=dict(x=260, y=70, w=1400, tail="down", t0=0.15, radio=True), desc="Radio bubble: the official warning"))],
     "sfx": [("radio-static-crank-v1", 2.0, -16, 3.0)]},
    {"k": "n", "n": 24, "part": 3, "shots": [
        (0.5, dict(bg="trail", cam=((1100, 420, 1.6), (1150, 400, 1.7)),
                   figs=lambda d: [extra([walk(0, d, 1050, 1250, hip(560, 0.55), hip(470, 0.55), 0.55, 1, rate=1.7, torso=12)], coat="steel", hat="beanie"),
                                   extra([walk(0, d, 980, 1180, hip(600, 0.58), hip(510, 0.58), 0.58, 1, rate=1.7, torso=12)], coat="mist", hair="bun"),
                                   extra([walk(0, d, 920, 1100, hip(630, 0.5), hip(550, 0.5), 0.5, 1, rate=1.8, torso=12)], coat="fog", kid=True)],
                   desc="Others already climbing ahead")),
        (0.5, dict(bg="trail", cam=((1080, 600, 1.35), (1150, 580, 1.4)),
                   figs=lambda d: [fig("mags", [walk(0, d, 1065, 1255, hip(918, 1.05), hip(893, 1.05), 1.05, 1, "determined", rate=1.5, torso=12, arm=LEANWALK)]),
                                   fig("drizzle", [walk(0, d, 1160, 1350, hip(911, 1.08), hip(886, 1.08), 1.08, 1, "determined", rate=1.5, bag=True, torso=10)])],
                   desc="Drizzle and Mags keep climbing"))],
     "sfx": [("footsteps-mud-v1", 0, -16)]},
    {"k": "n", "n": 25, "part": 3, "shots": [
        (0.48, dict(bg="view", cam=((960, 640, 1.08), (960, 620, 1.12)),
                    figs=lambda d: [fig("mags", [walk(0, 1.6, 1120, 1300, hip(905, 1.05), hip(905, 1.05), 1.05, 1, "determined", rate=1.5), hold(1.6, d, "idle", face="determined")]),
                                    fig("drizzle", [walk(0, 1.2, 860, 980, hip(930, 1.1), hip(930, 1.1), 1.1, 1, "worried", bag=True), hold(1.2, d, LOOKDOWN, facing=-1, face="worried")])],
                    desc="At the bend, Drizzle looks back")),
        (0.52, dict(bg="view", cam=((900, 360, 2.0), (880, 352, 2.5)), desc="Push-in: a gray line across the whole horizon"))],
     "sfx": [("wave-roar-distant-v1", 1.5, -14)]},
    {"k": "card", "text": "22 MINUTES", "icon": "stopwatch", "part": 3},
    {"k": "n", "n": 26, "part": 3, "shots": [
        (0.34, dict(bg="wave", cam=((1280, 470, 1.0), (1300, 460, 1.1)), shake=dict(t0=0, t1=99, amp=8, rampIn=0.05), desc="The first wave hits Gull Harbor")),
        (0.33, dict(bg="wave", cam=((1400, 430, 1.9), (1420, 430, 2.05)), shake=dict(t0=0, t1=99, amp=6, rampIn=0.05), desc="It takes the dock, the ferry")),
        (0.33, dict(bg="wave", cam=((900, 700, 1.6), (980, 690, 1.7)), shake=dict(t0=0, t1=99, amp=6, rampIn=0.05), desc="…then Main Street's rooftops"))],
     "sfx": [("wave-crash-v1", 0, -4), ("wave-roar-distant-v1", 3.0, -8)]},
    {"k": "n", "n": 27, "part": 3, "shots": [
        (1, dict(bg="view", cam=((1040, 700, 1.4), (1090, 690, 1.45)),
                 figs=lambda d: [fig("drizzle", [hold(0, d * 0.45, LOOKDOWN, 980, hip(930, 1.1), 1.1, -1, "scared", bag=True), walk(d * 0.45, d, 980, 1260, hip(930, 1.1), hip(915, 1.1), 1.1, 1, "worried", bag=True)]),
                                 fig("mags", [hold(0, d * 0.3, "idle", 1150, hip(915, 1.05), 1.05, -1, "determined"), hold(d * 0.3, d * 0.45, TUG, face="determined"), walk(d * 0.45, d, 1150, 1400, hip(915, 1.05), hip(900, 1.05), 1.05, 1, "determined", rate=1.6)])],
                 desc="Drizzle wants to watch; Mags doesn't let him"))]},
    {"k": "card", "text": "THE FIRST WAVE IS OFTEN NOT THE BIGGEST", "icon": "waves", "part": 3, "dur": 3.2},
    {"k": "n", "n": 28, "part": 3, "shots": [
        (0.5, dict(bg="trail", cam=((1150, 520, 1.5), (1220, 500, 1.55)),
                   figs=lambda d: [fig("mags", [walk(0, d, 1080, 1300, hip(905, 1.0), hip(870, 1.0), 1.0, 1, "determined", rate=1.6, torso=12)]),
                                   fig("drizzle", [walk(0, d, 1200, 1430, hip(895, 1.0), hip(860, 1.0), 1.0, 1, "determined", bag=True, torso=10)])],
                   desc="Up the trail again — you don't go back down")),
        (0.5, dict(bg="view", cam=((960, 420, 1.5), (960, 400, 1.62)), desc="The sea keeps coming: waves for hours (end of Part 3)"))],
     "sfx": [("wave-roar-distant-v1", 0, -12)]},
    # ===================================== PART 4
    {"k": "n", "n": 29, "part": 4, "lead": 0.6, "shots": [
        (0.5, dict(bg="hill", cam=((960, 540, 1.0), (980, 560, 1.06)),
                   figs=lambda d: [extra([hold(0, d, "idle", 640, hip(830, 0.8), 0.8, 1)], coat="steel", hat="beanie"),
                                   extra([hold(0, d, "idle", 760, hip(845, 0.82), 0.82, -1)], coat="mist", hair="long"),
                                   extra([hold(0, d, "idle", 980, hip(850, 0.8), 0.8, -1)], coat="slate", hat="cap"),
                                   extra([hold(0, d, "think", 1180, hip(840, 0.8), 0.8, -1)], coat="fog", hair="bun"),
                                   extra([hold(0, d, "idle", 1320, hip(830, 0.78), 0.78, -1)], coat="steel", hat="hood")],
                   desc="The hilltop: cold, crowded, above the water")),
        (0.5, dict(bg="hill", cam=((1000, 760, 1.4), (1080, 760, 1.45)),
                   figs=lambda d: [extra([hold(0, d, "idle", 980, hip(850, 0.8), 0.8, -1)], coat="slate", hat="cap"),
                                   fig("mags", [walk(0, d * 0.8, 475, 855, hip(1010, 1.25), hip(1010, 1.25), 1.25, 1, "determined", rate=1.5, arm=LEANWALK), hold(d * 0.8, d, "idle", face="neutral")]),
                                   fig("drizzle", [walk(0, d * 0.8, 570, 950, hip(1015, 1.3), hip(1015, 1.3), 1.3, 1, "smile", rate=1.5, bag=True), hold(d * 0.8, d, "idle", face="smile")])],
                   desc="Drizzle and Mags arrive"))],
     "sfx": [("crowd-murmur-v1", 0, -18)]},
    {"k": "n", "n": 30, "part": 4, "shots": [
        (0.5, dict(bg="hill", cam=((560, 560, 1.7), (620, 560, 1.75)),
                   figs=lambda d: [extra([hold(0, d, "think", 470, hip(705, 0.85), 0.85, 1)], coat="steel", hat="cap"),
                                   extra([hold(0, d, "point", 640, hip(720, 0.85), 0.85, -1)], coat="fog", hair="bun"),
                                   extra([hold(0, d, "idle", 760, hip(735, 0.85), 0.85, -1)], coat="mist", hat="beanie")],
                   desc="Volunteers: the tarp and the check-in table")),
        (0.5, dict(bg="hill", cam=((900, 700, 1.45), (980, 700, 1.5)),
                   figs=lambda d: [extra([hold(0, d, "idle", 760, hip(850, 0.82), 0.82, 1)], coat="slate", hair="long"),
                                   extra([hold(0, d, "wave", 860, hip(850, 0.82), 0.82, 1)], coat="fog", kid=True),
                                   extra([hold(0, d, "idle", 930, hip(855, 0.82), 0.82, -1)], coat="mist", kid=True, hat="beanie"),
                                   extra([hold(0, d, "cheer", 1000, hip(850, 0.82), 0.82, -1)], coat="steel", kid=True),
                                   extra([hold(0, d, "idle", 1070, hip(855, 0.82), 0.82, -1)], coat="fog", kid=True, hair="bun"),
                                   extra([hold(0, d, "idle", 1150, hip(850, 0.82), 0.82, -1)], coat="mist", kid=True, hat="cap")],
                   desc="The school's kids, all of them — they practiced"))]},
    {"k": "n", "n": 31, "part": 4, "shots": [
        (1, dict(bg="hill", cam=((1080, 720, 1.6), (1090, 720, 1.66)),
                 figs=lambda d: [fig("mags", [hold(0, d, "idle", 900, hip(1010, 1.25), 1.25, 1, "neutral")]), fig("drizzle", [hold(0, d, COUNT, 1150, hip(1015, 1.3), 1.3, -1, "smile", bag=True)])],
                 desc="Drizzle counts on his fingers"))]},
    {"k": "cards3", "n": 32, "part": 4, "cards": [("1 · DROP, COVER, HOLD ON", "table", 0.0), ("2 · COAST + SHAKING = WALK UPHILL NOW", "arrowup", 3.47), ("3 · GO-BAG, NOT BELONGINGS", "backpack", 9.13)]},
    {"k": "n", "n": 33, "part": 4, "shots": [
        (1, dict(bg="hill", cam=((1040, 700, 1.7), (1040, 700, 1.76)),
                 figs=lambda d: [fig("mags", [hold(0, d * 0.6, "idle", 900, hip(1010, 1.25), 1.25, 1, "neutral"), hold(d * 0.6, d, "reach", face="smile")]),
                                 fig("drizzle", [hold(0, d * 0.3, "idle", 1150, hip(1015, 1.3), 1.3, -1, "grin", bag=True), hold(d * 0.3, d, OFFER, face="grin")], snack={"t0": 0.5, "t1": 99})],
                 desc="And four: snacks — a granola bar for Mags"))]},
    {"k": "n", "n": 34, "part": 4, "shots": [
        (1, dict(bg="dusk", cam=((700, 640, 1.5), (720, 640, 1.56)),
                 figs=lambda d: [fig("mags", [hold(0, d, "idle", 480, hip(960, 1.25), 1.25, 1, "neutral")]), fig("drizzle", [hold(0, d, LOOKDOWN, 640, hip(960, 1.3), 1.3, 1, "worried", bag=True)])],
                 desc="Dusk on the hill. The radio again"))],
     "sfx": [("radio-static-crank-v1", 0, -14)]},
    {"k": "bubble", "who": "RADIO", "text": "…Highway 101 bridge at Gull Creek has collapsed… coastal roads closed…", "dur": 5.0, "part": 4, "shots": [
        (1, dict(bg="wood", filter="grayscale(1) brightness(0.6)", cam=((960, 600, 1.06), (980, 590, 1.12)), fx=[{"type": "radio", "x": 930, "y": 720, "scale": 1.45, "static0": 0, "clean0": 0.5}],
                 bubble=dict(x=260, y=70, w=1400, tail="down", t0=0.15, radio=True), desc="Radio bubble: the bridge is gone"))],
     "sfx": [("radio-static-crank-v1", 1.8, -16, 3.0)]},
    {"k": "n", "n": 35, "part": 4, "shots": [
        (0.5, dict(bg="dusk", cam=((620, 660, 1.6), (640, 660, 1.66)),
                   figs=lambda d: [fig("mags", [hold(0, d, "idle", 480, hip(960, 1.25), 1.25, 1, "worried")]), fig("drizzle", [hold(0, d, "idle", 640, hip(960, 1.3), 1.3, 1, "worried", bag=True)])],
                   desc="Two-shot at the edge")),
        (0.5, dict(bg="dusk", cam=((1200, 640, 1.2), (1150, 620, 1.3)), desc="The flooded town below — no road out"))]},
    {"k": "bubble", "who": "DRIZZLE", "text": "So… nobody's coming?", "dur": 2.8, "part": 4, "shots": [
        (1, dict(bg="dusk", cam=((640, 600, 2.0), (640, 600, 2.08)),
                 figs=lambda d: [fig("drizzle", [hold(0, d, "idle", 640, hip(960, 1.3), 1.3, 1, "worried", bag=True)])],
                 bubble=dict(x=720, y=150, w=560, tail="down-left", t0=0.1), desc="Drizzle: speech bubble"))]},
    {"k": "n", "n": 36, "part": 4, "tail": 1.4, "shots": [
        (0.36, dict(bg="dusk", cam=((800, 620, 1.15), (820, 620, 1.2)),
                    figs=lambda d: [fig("mags", [hold(0, d, "idle", 480, hip(960, 1.25), 1.25, 1, "worried")]), fig("drizzle", [hold(0, d, LOOKDOWN, 640, hip(960, 1.3), 1.3, 1, "worried", bag=True)])],
                    desc="The final look down at the town")),
        (0.3, dict(bg="dusk", cam=((1250, 700, 1.25), (1180, 720, 1.35)), desc="The water still rising; night coming")),
        (0.34, dict(bg="dusk", cam=((1020, 770, 1.8), (1055, 790, 2.6)), fx=[{"type": "light", "x": 1058, "y": 792, "t0": 0.9}],
                    desc="Push-in: a light flickers on where no one should be"))]},
    {"k": "card", "text": "NEXT: DAY 1", "icon": "moon", "part": 4, "dur": 3.4, "hold": True},
]


# ---------------------------------------------------------------- helpers
def ffprobe_dur(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]).decode())


def pauses(p):
    out = subprocess.run(["ffmpeg", "-nostdin", "-i", p, "-af", "silencedetect=n=-40dB:d=0.22", "-f", "null", "-"], capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r"silence_start: ([0-9.]+)", out)]
    en = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", out)]
    return list(zip(st, en))


def clamp_cam(c):
    cx, cy, z = c
    z = max(1.0, z)
    hw, hh = 960 / z, 540 / z
    return [round(min(max(cx, hw), 1920 - hw), 1), round(min(max(cy, hh), 1080 - hh), 1), round(z, 3)]


def load_audio(path):
    raw = subprocess.check_output(["ffmpeg", "-nostdin", "-v", "error", "-i", path, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"])
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()


def write(rel, text):
    p = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, "w").write(text)
    print("wrote", rel)


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def fmt(t):
    return f"{int(t // 60)}:{t % 60:04.1f}"


ICONS = {
    "clock": '<circle r="50" fill="none" stroke="#F2F3F5" stroke-width="9"/><line x1="0" y1="0" x2="0" y2="-27" stroke="#F2F3F5" stroke-width="9" stroke-linecap="round" transform="rotate(321)"/><line x1="0" y1="0" x2="0" y2="-39" stroke="#F2F3F5" stroke-width="6" stroke-linecap="round" transform="rotate(252)"/><circle r="6" fill="#F2F3F5"/>',
    "stopwatch": '<circle cy="6" r="44" fill="none" stroke="#F2F3F5" stroke-width="9"/><line x1="-12" y1="-50" x2="12" y2="-50" stroke="#F2F3F5" stroke-width="9" stroke-linecap="round"/><line x1="0" y1="-48" x2="0" y2="-38" stroke="#F2F3F5" stroke-width="8"/><line x1="0" y1="6" x2="20" y2="-16" stroke="#F2F3F5" stroke-width="7" stroke-linecap="round"/><line x1="34" y1="-30" x2="42" y2="-38" stroke="#F2F3F5" stroke-width="8" stroke-linecap="round"/>',
    "table": '<line x1="-50" y1="-14" x2="50" y2="-14" stroke="#F2F3F5" stroke-width="10" stroke-linecap="round"/><line x1="-40" y1="-14" x2="-40" y2="44" stroke="#F2F3F5" stroke-width="8" stroke-linecap="round"/><line x1="40" y1="-14" x2="40" y2="44" stroke="#F2F3F5" stroke-width="8" stroke-linecap="round"/><circle cx="-8" cy="20" r="11" fill="none" stroke="#F2F3F5" stroke-width="6"/><path d="M-8 31 L 4 42 M -14 30 L -24 44" stroke="#F2F3F5" stroke-width="6" stroke-linecap="round"/>',
    "backpack": '<rect x="-36" y="-34" width="72" height="84" rx="16" fill="none" stroke="#F2F3F5" stroke-width="8"/><path d="M-18 -34 Q 0 -60 18 -34" fill="none" stroke="#F2F3F5" stroke-width="8"/><rect x="-24" y="8" width="48" height="28" rx="6" fill="none" stroke="#F2F3F5" stroke-width="6"/>',
    "wave": '<path d="M-52 34 Q -30 14 -8 34 T 36 34 T 58 30" fill="none" stroke="#F2F3F5" stroke-width="8" stroke-linecap="round"/><path d="M-40 10 C -40 -40 30 -50 34 -6 C 12 -26 -10 -14 -6 8" fill="none" stroke="#F2F3F5" stroke-width="8" stroke-linecap="round"/>',
    "footprints": '<ellipse cx="-20" cy="18" rx="14" ry="24" fill="none" stroke="#F2F3F5" stroke-width="7"/><circle cx="-20" cy="-14" r="6" fill="#F2F3F5"/><ellipse cx="22" cy="-8" rx="14" ry="24" fill="none" stroke="#F2F3F5" stroke-width="7"/><circle cx="22" cy="-40" r="6" fill="#F2F3F5"/>',
    "arrowup": '<path d="M-52 48 L -8 -6 L 14 18 L 52 -28" fill="none" stroke="#F2F3F5" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/><path d="M28 -30 L 54 -32 L 52 -6" fill="none" stroke="#F2F3F5" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/>',
    "waves": '<path d="M-54 -22 Q -40 -36 -26 -22 T 2 -22" fill="none" stroke="#F2F3F5" stroke-width="6" stroke-linecap="round"/><path d="M-54 6 Q -34 -14 -14 6 T 26 6" fill="none" stroke="#F2F3F5" stroke-width="7" stroke-linecap="round"/><path d="M-54 40 Q -26 10 2 40 T 58 40" fill="none" stroke="#F2F3F5" stroke-width="9" stroke-linecap="round"/>',
    "moon": '<path d="M14 -46 A 48 48 0 1 0 46 22 A 38 38 0 1 1 14 -46 Z" fill="none" stroke="#F2F3F5" stroke-width="8" stroke-linejoin="round"/><circle cx="34" cy="-30" r="3.5" fill="#F2F3F5"/><circle cx="48" cy="-8" r="3" fill="#F2F3F5"/>',
}


def card_text(text):
    """Fit the hand-lettered text into the card: one line if it fits, else two balanced lines."""
    W = 1040
    cw = 0.6                                   # Kalam Bold caps run ~0.6 em per character
    if len(text) * cw * 118 <= W:
        return esc(text), 118
    words = text.split(" ")
    best = None
    for i in range(1, len(words)):
        a, b = " ".join(words[:i]), " ".join(words[i:])
        m = max(len(a), len(b))
        if best is None or m < best[0]:
            best = (m, a, b)
    m, a, b = best
    a, b = a.rstrip(" ·"), b.lstrip("· ")          # never start or end a line on the separator dot
    size = min(112, int(W / (max(len(a), len(b)) * cw)))
    return esc(a) + "<br>" + esc(b), size


def main():
    # ------------------------------------------------------------ narration + timeline
    script = open(os.path.join(ROOT, "episodes/ep01/script-v7.md")).read()
    nlines = [l[3:].strip() for l in script.splitlines() if l.startswith("N: ")]
    assert len(nlines) == 36
    ndur, npause = {}, {}
    for i in range(1, 37):
        p = os.path.join(ROOT, NARR, f"n{i:02d}-{V}.mp3")
        ndur[i] = ffprobe_dur(p)
        npause[i] = pauses(p)

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
        elif k == "card":
            d = ev.get("dur", CARD_DUR)
        else:
            d = ev["dur"]
        ev["t0"], ev["dur_"] = t, d
        events.append(ev)
        # shots
        if k == "card":
            prev = shots[-1]
            shots.append({"kind": "card", "bg": prev["bg"], "cam": {"from": prev["cam"]["to"], "to": prev["cam"]["to"]}, "t0": t, "dur": d,
                          "card": {"text": ev["text"], "icon": ev["icon"], "hold": ev.get("hold", False)}, "ev": ev, "desc": f"CARD: {ev['text']} (over the blurred scene)"})
        elif k == "cards3":
            prev = shots[-1]
            cuts = [c[2] for c in ev["cards"]] + [d]
            for j, (txt, icon, c0) in enumerate(ev["cards"]):
                shots.append({"kind": "card", "bg": prev["bg"], "cam": {"from": prev["cam"]["to"], "to": prev["cam"]["to"]}, "t0": t + c0, "dur": cuts[j + 1] - c0,
                              "card": {"text": txt, "icon": icon, "hold": False}, "ev": ev, "desc": f"CARD: {txt} (synced to the narration)"})
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

    # parts
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
        seg = dict(seg)
        seg["t0"] += dt
        seg["t1"] += dt
        return seg

    def resolve_appear(f, dt):
        c = f.get("carry")
        if c and c["appear"][0] is None:
            c = dict(c)
            c["appear"] = [0.5, 1.4, 2.3]
        if c:
            c = dict(c)
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

    for pn, p in enumerate(parts, 1):
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
            js["bgFilter"] = s.get("filter") or FILT.get(s["bg"], GRAY)
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
                js["figs"] = [resolve_appear(dict(f, segs=[shift(g, lt0) for g in f["segs"]]), lt0) for f in figs]
                for f in js["figs"]:
                    for g in f["segs"]:
                        g["t1"] = min(g["t1"], lt0 + s["dur"])
            if s.get("dark"):
                js["dark"] = s["dark"]
            if s.get("bg") in OUTDOOR:
                js["rain"] = 0.38 if s["bg"] != "dusk" else 0.3
            if s.get("bubble"):
                js["bubble"] = {"t0": s["bubble"].get("t0", 0.15)}
        else:
            js["card"] = {"t0": 0.06, "hold": s["card"]["hold"]}
        s["js"] = js
        p["shots"].append(s)

    # ------------------------------------------------------------ part compositions (16:9)
    css = """
    #root { position: absolute; inset: 0; width: 1920px; height: 1080px; overflow: hidden; background: #0B0D10; }
    .shot { position: absolute; inset: 0; width: 1920px; height: 1080px; overflow: hidden; background: #0B0D10; }
    .cam { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; }
    .shk { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; }
    .bg { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; }
    .stage, .rain { position: absolute; left: 0; top: 0; overflow: visible; }
    .dark { position: absolute; inset: 0; background: #05070A; opacity: 0; }
    .blur .bg { transform: scale(1.08); transform-origin: 50% 50%; }
    .bubble { position: absolute; box-sizing: border-box; background: #F4F5F6; border: 6px solid #14171C; border-radius: 46px;
      padding: 24px 40px 28px; font-family: "Kalam", cursive; font-weight: 700; font-size: 58px; line-height: 1.12; color: #14171C;
      text-align: center; filter: url(#rd-rough-bub); transform-origin: 50% 100%; }
    .bubble .tail { position: absolute; width: 90px; height: 70px; bottom: -64px; }
    .bubble.radio { border-radius: 20px; font-size: 54px; font-style: italic; box-shadow: 0 0 0 8px #F4F5F6, 0 0 0 14px #14171C; }
    .bubble .who { display: block; font-size: 30px; letter-spacing: 0.12em; margin-bottom: 4px; color: #4A5058; font-style: normal; }
    .cardwrap { position: absolute; left: 260px; top: 300px; width: 1400px; height: 480px; transform-origin: 50% 50%; }
    .cardwrap .card { position: relative; z-index: 1; width: 100%; height: 100%; box-sizing: border-box; display: flex; align-items: center;
      justify-content: center; gap: 44px; padding: 0 60px; overflow: hidden; background: #33373D; border: 5px solid #0E1116;
      border-radius: 4px; filter: url(#rd-rough-ink); }
    .cardwrap .tex { position: absolute; inset: 0; opacity: .35; background: radial-gradient(ellipse at 30% 20%, rgba(140,155,175,.35), transparent 60%),
      radial-gradient(ellipse at 80% 90%, rgba(20,24,30,.5), transparent 55%); }
    .cardwrap .ink2 { position: absolute; inset: 10px; border: 2px solid rgba(14,17,22,.8); border-radius: 2px; }
    .cardwrap .hatch { position: absolute; left: 22px; top: 22px; width: 100%; height: 100%; z-index: 0;
      background: repeating-linear-gradient(45deg, #0E1116 0 2px, transparent 2px 9px); opacity: .8; }
    .cardwrap .icon { position: relative; flex: none; }
    .cardwrap .txt { position: relative; white-space: nowrap; color: #E6EAEE; font-family: "Kalam", cursive; font-weight: 700; line-height: 1.04; text-align: center; }
"""
    tails = {"down": "left:50%; margin-left:-45px;", "down-right": "right:90px;", "down-left": "left:90px;"}
    tail_svg = {
        "down": '<svg class="tail" style="{pos}" viewBox="0 0 90 70"><path d="M8 0 L45 66 L82 0" fill="#F4F5F6" stroke="#14171C" stroke-width="6" stroke-linejoin="round"/><rect x="10" y="-8" width="70" height="12" fill="#F4F5F6"/></svg>',
        "down-right": '<svg class="tail" style="{pos}" viewBox="0 0 90 70"><path d="M10 0 Q 40 30 78 66 Q 60 24 70 0" fill="#F4F5F6" stroke="#14171C" stroke-width="6" stroke-linejoin="round"/><rect x="12" y="-8" width="56" height="12" fill="#F4F5F6"/></svg>',
        "down-left": '<svg class="tail" style="{pos}" viewBox="0 0 90 70"><path d="M80 0 Q 50 30 12 66 Q 30 24 20 0" fill="#F4F5F6" stroke="#14171C" stroke-width="6" stroke-linejoin="round"/><rect x="22" y="-8" width="56" height="12" fill="#F4F5F6"/></svg>',
    }
    for p in parts:
        pid = f"ep01r-part{p['part']}"
        divs = []
        for s in p["shots"]:
            js = s["js"]
            inner = []
            if s.get("bg"):
                blur = s["kind"] == "card"
                filt = js["bgFilter"] + (" blur(7px) brightness(0.5)" if blur else "")
                inner.append(f'<div class="cam{" blur" if blur else ""}"><div class="shk"><img class="bg" src="{BG[s["bg"]]}" style="filter:{filt}" alt="">'
                             f'<svg class="stage" viewBox="0 0 1920 1080" width="1920" height="1080" xmlns="http://www.w3.org/2000/svg"></svg></div></div>')
                inner.append('<svg class="rain" viewBox="0 0 1920 1080" width="1920" height="1080" xmlns="http://www.w3.org/2000/svg"></svg>')
                inner.append('<div class="dark"></div>')
            if s["kind"] == "shot" and s.get("bubble"):
                b = s["bubble"]
                ev = s["ev"]
                who = '<span class="who">RADIO</span>' if b.get("radio") else ""
                inner.append(f'<div class="bubble{" radio" if b.get("radio") else ""}" style="left:{b["x"]}px; top:{b["y"]}px; width:{b["w"]}px;">{who}{esc(ev["text"])}'
                             + tail_svg[b["tail"]].format(pos=tails[b["tail"]]) + "</div>")
            if s["kind"] == "card":
                txt, size = card_text(s["card"]["text"])
                inner.append(f'<div class="cardwrap"><div class="hatch"></div><div class="card"><div class="tex"></div><div class="ink2"></div>'
                             f'<svg class="icon" viewBox="-60 -60 120 120" width="190" height="190">{ICONS[s["card"]["icon"]]}</svg>'
                             f'<div class="txt" style="font-size:{size}px">{txt}</div></div></div>')
            divs.append(f'    <div id="{s["id"]}" class="clip shot" data-start="{s["lt0"]:.4f}" data-duration="{s["dur"]:.4f}" data-track-index="0">' + "".join(inner) + "</div>")
        shots_json = json.dumps([s["js"] for s in p["shots"]], separators=(",", ":"))
        html = f"""<template>
  <!-- Rainy Day: Cascadia · Episode 1 remake · PART {p['part']} ({p['dur']:.2f}s) — generated by tools/build-ep01-remake-v1.py. Needs gsap,
       assets/characters/rainy-day-rig-v5.js and assets/ep01-remake/ep01r-runtime-v1.js loaded by the render root. -->
  <style>{css}  </style>
  <div id="root" data-composition-id="{pid}" data-width="1920" data-height="1080" data-duration="{p['dur']:.4f}">
{chr(10).join(divs)}
    <!-- AUDIO: narration + SFX premix for this part (track 20); mastered to -14 LUFS on the finished render -->
    <audio id="{pid}-mix" src="audio/ep01-remake/mix/ep01r-part{p['part']}-mix-{V}.mp3" data-start="0" data-duration="{p['dur']:.4f}" data-track-index="20" data-volume="1"></audio>
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
    EP.build(tl, {shots_json});
    window.__timelines["{pid}"] = tl;
  </script>
</template>
"""
        write(f"compositions/ep01-remake/{pid}-{V}.html", html)

    # ------------------------------------------------------------ captions (narration chunks timed on the voice) + SRT
    def chunks_for(i, t_start):
        text = nlines[i - 1]
        sents = re.findall(r"[^.?!]+[.?!]+", text) or [text]
        sents = [x.strip() for x in sents]
        # merge very short sentences so a caption is not a flicker; cap ~80 chars
        groups = []
        for x in sents:
            if groups and (len(groups[-1]) + len(x) + 1 <= 62 or len(x) <= 12) and len(groups[-1]) + len(x) + 1 <= 86:
                groups[-1] += " " + x
            else:
                groups.append(x)
        d = ndur[i]
        total_c = sum(len(g) for g in groups)
        # boundary estimates by characters, snapped to detected pauses
        ps = [(a + b) / 2 for a, b in npause[i]]
        out, acc, prev = [], 0, 0.0
        for j, g in enumerate(groups):
            acc += len(g)
            if j == len(groups) - 1:
                end = d
            else:
                est = d * acc / total_c
                end = min(ps, key=lambda q: abs(q - est)) if ps else est
                if end <= prev + 0.6:
                    end = est
            out.append((t_start + prev, t_start + end, g))
            prev = end
        return out

    caps = []
    for n, t0 in vo:
        for a, b, g in chunks_for(n, t0):
            caps.append({"t0": a, "t1": b + 0.25, "text": g, "kind": "narration"})
    for e in events:
        if e["k"] == "bubble":
            who = e["who"]
            caps.append({"t0": e["t0"] + 0.15, "t1": e["t0"] + e["dur_"] - 0.1, "text": e["text"], "kind": "bubble", "who": who})
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
    write(f"renders/ep01/ep01-remake-full-{V}.srt", "\n".join(srt))

    # ------------------------------------------------------------ render roots
    style = open(os.path.join(ROOT, "assets/style/rainy-day-style-v1.css")).read()
    filters = """    <svg width="0" height="0" style="position:absolute" aria-hidden="true">
      <filter id="rd-rough-ink"><feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="6"/></filter>
      <filter id="rd-rough-bub"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="11"/><feDisplacementMap in="SourceGraphic" scale="3"/></filter>
    </svg>"""

    def head(w, h, extra_css):
        return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width={w}, height={h}" />
    <script src="assets/vendor/gsap.min.js"></script>
    <script src="assets/characters/rainy-day-rig-v5.js"></script>
    <script src="assets/ep01-remake/ep01r-runtime-v1.js"></script>
    <style>
{style}
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ margin: 0; width: {w}px; height: {h}px; overflow: hidden; background: #0B0D10; }}
      #root {{ position: relative; width: 100%; height: 100%; overflow: hidden; background: #0B0D10; }}
{extra_css}
    </style>
  </head>"""

    hosts = "\n".join(f'      <div id="full-part{p["part"]}" data-composition-id="ep01r-part{p["part"]}" data-composition-src="compositions/ep01-remake/ep01r-part{p["part"]}-{V}.html" data-start="{p["t0"]:.4f}" data-duration="{p["dur"]:.4f}" data-track-index="0" data-width="1920" data-height="1080"></div>' for p in parts)
    full = f"""{head(1920, 1080, "")}
  <body>
{filters}
    <!-- Rainy Day: Cascadia · Episode 1 remake · FULL 16:9 ({total:.2f}s) — generated by tools/build-ep01-remake-v1.py.
         Subtitles ship as renders/ep01/ep01-remake-full-{V}.srt (not burned in). Audio lives in each part composition. -->
    <div id="root" data-composition-id="ep01r-full" data-start="0" data-duration="{total:.4f}" data-width="1920" data-height="1080">
{hosts}
    </div>
    <script>
      window.__timelines = window.__timelines || {{}};
      const tl = gsap.timeline({{ paused: true }});
      window.__timelines["ep01r-full"] = tl;
    </script>
  </body>
</html>
"""
    write(f"ep01-remake-full-16x9-{V}.html", full)

    vcss = """      #hdr { position: absolute; left: 0; top: 0; width: 1080px; height: 330px; background: #101215; border-bottom: 6px solid #F2C230; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; }
      #hdr .part { font-family: "League Gothic", "Oswald", sans-serif; font-size: 150px; line-height: 0.9; letter-spacing: 0.04em; color: #F2C230; }
      #hdr .series { font-family: "Kalam", cursive; font-weight: 700; font-size: 44px; color: #C3C7CC; letter-spacing: 0.02em; }
      #frame-wrap { position: absolute; left: 0; top: 380px; width: 1080px; height: 608px; overflow: hidden; background: #000; border-top: 3px solid #3A3F46; border-bottom: 3px solid #3A3F46; }
      #frame { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; transform-origin: 0 0; transform: scale(0.5625); overflow: hidden; }
      .cap { position: absolute; left: 60px; top: 1030px; width: 960px; height: 420px; display: flex; align-items: center; justify-content: center; text-align: center;
        font-family: "Kalam", cursive; font-weight: 700; font-size: 48px; line-height: 1.28; color: #F1F3F5;
        text-shadow: 0 3px 12px rgba(0,0,0,.9), 0 0 3px rgba(0,0,0,.8); }
      .cap .who { display: block; font-size: 34px; letter-spacing: 0.1em; color: #F2C230; margin-bottom: 6px; }"""
    for p in parts:
        pid = f"ep01r-part{p['part']}-9x16"
        pc = [c for c in caps if c["t1"] > p["t0"] and c["t0"] < p["t1"]]
        cdivs, fades = [], []
        for j, c in enumerate(pc):
            a, b = max(c["t0"], p["t0"]) - p["t0"], min(c["t1"], p["t1"]) - p["t0"]
            cid = f"cap{p['part']}-{j + 1:03d}"
            body = esc(c["text"]) if c["kind"] == "narration" else f'<span class="who">{esc(c["who"])}</span>"{esc(c["text"])}"'
            cdivs.append(f'      <div id="{cid}" class="clip cap" data-start="{a:.3f}" data-duration="{b - a:.3f}" data-track-index="5"><div class="ci">{body}</div></div>')
            fades.append(f'      tl.fromTo("#{cid} .ci", {{ opacity: 0, y: 8 }}, {{ opacity: 1, y: 0, duration: 0.16, ease: "power2.out" }}, {a:.3f});')
        html = f"""{head(1080, 1920, vcss)}
  <body>
{filters}
    <!-- Rainy Day: Cascadia · Episode 1 remake · PART {p['part']} of 4 · TikTok 9:16 ({p['dur']:.2f}s) — generated by tools/build-ep01-remake-v1.py
         Layout: header (0–330) · 16:9 scene at 1080×608 (y 380–988) · narration captions (y 1030–1450) · bottom 20% (y > 1536) clear. -->
    <div id="root" data-composition-id="{pid}" data-start="0" data-duration="{p['dur']:.4f}" data-width="1080" data-height="1920">
      <div id="hdr" class="clip" data-start="0" data-duration="{p['dur']:.4f}" data-track-index="2">
        <div class="part">PART {p['part']}</div>
        <div class="series">RAINY DAY · EPISODE 1 ({p['part']}/4)</div>
      </div>
      <div id="frame-wrap">
        <div id="frame">
          <div id="{pid}-scene" data-composition-id="ep01r-part{p['part']}" data-composition-src="compositions/ep01-remake/ep01r-part{p['part']}-{V}.html" data-start="0" data-duration="{p['dur']:.4f}" data-track-index="0" data-width="1920" data-height="1080"></div>
        </div>
      </div>
{chr(10).join(cdivs)}
    </div>
    <script>
      window.__timelines = window.__timelines || {{}};
      const tl = gsap.timeline({{ paused: true }});
{chr(10).join(fades)}
      window.__timelines["{pid}"] = tl;
    </script>
  </body>
</html>
"""
        write(f"ep01-remake-part{p['part']}-9x16-{V}.html", html)

    # ------------------------------------------------------------ audio: narration track + SFX premix
    N = int(math.ceil(total * SR)) + SR
    voice = np.zeros((N, 2), np.float32)
    for n, t0 in vo:
        a = load_audio(os.path.join(ROOT, NARR, f"n{n:02d}-{V}.mp3"))
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
            if n > len(a):  # loop with a short crossfade
                reps = []
                while sum(len(r) for r in reps) < n:
                    reps.append(a)
                a = np.concatenate(reps)
            a = a[:n].copy()
        else:
            a = a.copy()
        fi, fo = max(1, int(fin * SR)), max(1, int(fout * SR))
        a[:fi] *= np.linspace(0, 1, fi)[:, None]
        a[-fo:] *= np.linspace(1, 0, fo)[:, None]
        i0 = int(round(max(0, t0) * SR))
        a = a[: max(0, N - i0)]
        sfx[i0:i0 + len(a)] += a * (10 ** (gain_db / 20))

    def ev_at(pred):
        return [e for e in events if pred(e)]
    E = {(e["k"], e.get("n")): e for e in events}
    # beds
    t_quake = E[("n", 3)]["t0"] + ndur[3] * 0.8
    t_dark_end = E[("n", 10)]["t0"] + E[("n", 10)]["dur_"]
    place("rain-window-v1", 2.8, -20, t_quake - 2.8 + 1.0, fin=0.8, fout=1.0)
    place("house-rumble-creak-v1", t_quake, -9, t_dark_end - t_quake - 0.6, fin=1.2, fout=2.5)
    place("rain-window-v1", E[("n", 11)]["t0"], -24, E[("n", 16)]["t0"] - E[("n", 11)]["t0"], fin=1.0, fout=0.6)
    out0, out1 = E[("n", 16)]["t0"], parts[2]["t1"]
    place("rain-outdoor-v1", out0, -21, out1 - out0, fin=0.8, fout=0.8)
    h0 = E[("n", 29)]["t0"] - 0.6
    place("wind-hilltop-v1", h0, -20, total - h0, fin=1.0, fout=2.5)
    place("rain-outdoor-v1", h0, -27, total - h0, fin=1.0, fout=2.5)
    # spot cues from the events
    for e in events:
        for cue in e.get("sfx", []):
            name, off, g = cue[0], cue[1], cue[2]
            dur = cue[3] if len(cue) > 3 and cue[3] != "end" else None
            t0 = e["t0"] + (e["dur_"] + off if len(cue) > 3 and cue[3] == "end" else off)
            if name in ("crowd-murmur-v1",):
                dur = (E[("n", 34)]["t0"] - e["t0"])
            place(name, t0, g, dur, fin=0.4 if dur else 0.02, fout=1.0 if dur else 0.3)
    for s in shots:
        if s["kind"] == "card":
            place("card-swish-v1", s["t0"] + 0.04, -12)
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
    enc(voice, f"audio/ep01-remake/narration-full-{V}.mp3")
    for p in parts:
        enc(mix, f"audio/ep01-remake/mix/ep01r-part{p['part']}-mix-{V}.mp3", p["t0"], p["t1"])

    # ------------------------------------------------------------ timeline JSON + shot list
    tlj = {"version": V, "total": round(total, 3), "parts": [{k: round(p[k], 3) for k in ("t0", "t1", "dur")} | {"part": p["part"]} for p in parts],
           "narration": [{"n": n, "t0": round(t0, 3), "dur": round(ndur[n], 3), "text": nlines[n - 1]} for n, t0 in vo],
           "shots": [{"id": s["id"], "t0": round(s["t0"], 3), "dur": round(s["dur"], 3), "bg": s.get("bg"), "kind": s["kind"], "desc": s.get("desc", "")} for s in shots],
           "captions": [{k: (round(v, 3) if isinstance(v, float) else v) for k, v in c.items()} for c in caps]}
    write("episodes/ep01/ep01-remake-timeline-v1.json", json.dumps(tlj, indent=1, ensure_ascii=False))

    bgfile = {k: v.split("/")[-1].replace(".jpg", ".png") for k, v in BG.items()}
    bgfile["kitchen"] = "assets/ep01-v6/bg/kitchen-style-B-v1.png (reused)"
    L = ["# RAINY DAY: CASCADIA — Episode 1 remake — Shot list (v1)", "",
         f"Generated by `tools/build-ep01-remake-v1.py` from `episodes/ep01/script-v7.md` and the narration takes. **{len(shots)} shots · "
         f"{fmt(total)} ({total:.1f} s)** · parts " + " / ".join(f"{p['dur']:.1f} s" for p in parts) + f" · longest shot {max(s['dur'] for s in shots):.2f} s "
         f"· average {total / len(shots):.2f} s.", "",
         "Backgrounds: `assets/ep01-remake/bg/` (1920 working copies in `bg-1920/`), all shown desaturated so the yellow slicker is the only "
         "saturated color. Characters: rig v5 vectors (Drizzle exactly as Phase A style B; Mags restyled: gray coat, white bun, glasses). "
         "Camera = (center x, center y, zoom) in background pixels, from → to over the shot.", ""]
    for p in parts:
        L += [f"## PART {p['part']} — {fmt(p['t0'])}–{fmt(p['t1'])} ({p['dur']:.1f} s)", "",
              "| # | Time | Dur | Narration | Background | Drizzle / Mags | Card / bubble | Camera |", "|---|---|---|---|---|---|---|---|"]
        for s in p["shots"]:
            ev = s["ev"]
            line = ""
            if ev["k"] in ("n", "cards3"):
                n = ev["n"]
                # the part of the line spoken during this shot
                a, b = s["t0"] - ev["t0"], s["t0"] - ev["t0"] + s["dur"]
                parts_txt = [g for (x0, x1, g) in chunks_for(n, 0) if x1 > a + 0.1 and x0 < b - 0.1]
                line = " ".join(parts_txt)
            poses = []
            if s["kind"] == "shot" and s.get("figs"):
                for f in s["figs"](s["dur"]):
                    if f["who"] in ("drizzle", "mags"):
                        desc = []
                        for g in f["segs"]:
                            desc.append("walk" if "walk" in g else (g["hold"] if isinstance(g["hold"], str) else "custom pose"))
                        poses.append(f"{f['who'].capitalize()}: " + " → ".join(dict.fromkeys(desc)))
                    else:
                        poses.append("townsperson" + (" (kid)" if f.get("opts", {}).get("kid") else ""))
            poses = "; ".join(dict.fromkeys(poses)) or "—"
            cb = "—"
            if s["kind"] == "card":
                cb = f"CARD: {s['card']['text']} (icon: {s['card']['icon']})"
            elif s.get("bubble"):
                cb = f"BUBBLE ({ev['who'].capitalize()}): \"{ev['text']}\""
            elif ev["k"] == "insert":
                cb = "INSERT: hand-crank radio"
            cam = "—"
            if s.get("cam"):
                c0, c1 = s["cam"]["from"], s["cam"]["to"]
                cam = f"{c0} → {c1}" + (" + shake" if s.get("shake") else "") + (" (blurred, darkened)" if s["kind"] == "card" else "")
            bgt = f"`{bgfile[s['bg']]}`" if s.get("bg") else "black"
            L.append(f"| {s['n']} | {fmt(s['t0'])} | {s['dur']:.2f}s | {esc(line) or '—'} | {bgt}<br>{s.get('desc', '')} | {poses} | {cb} | {cam} |")
        L.append("")
    write("episodes/ep01/shotlist-remake-v1.md", "\n".join(L))
    print(f"episode {total:.2f}s; parts " + " / ".join(f"{p['dur']:.2f}" for p in parts) + f"; {len(shots)} shots; {len(caps)} captions")


if __name__ == "__main__":
    main()
