#!/usr/bin/env python3
"""Rainy Day — Episode 5 SFX additions (v1): new location ambiences, same method as tools/make-sfx-library-v1.py
(ffmpeg-synthesized noise + short oscillator bursts, fixed seeds, stereo, never overwrites). Log:
assets/sfx/SFX-LOG-ep05-v1.md. Usage: python3 tools/make-sfx-ep05-v1.py"""
import importlib.util, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location("lib1", os.path.join(ROOT, "tools/make-sfx-library-v1.py"))
lib1 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(lib1)

LIB = {
    "creek-trickle-v1": (20, "Ravine creek reduced to a trickle: thin bright water babble over stones, no roar (Ep 5 s07–s08).", [
        ("NOISE white 31", "highpass=f=1400,lowpass=f=6500,tremolo=f=7.3:d=0.6,tremolo=f=13.1:d=0.45,volume=0.35"),
        ("NOISE pink 32", "bandpass=f=900:width_type=h:w=900,tremolo=f=4.7:d=0.7,volume=0.35"),
        ("EVAL (random(3)*2-1)*0.35*exp(-55*mod(t,0.37))+(random(4)*2-1)*0.25*exp(-70*mod(t+0.11,0.53))", "bandpass=f=2400:width_type=h:w=2600"),
    ], "afade=t=in:d=2,afade=t=out:st=18:d=2"),
    "gorge-wind-v1": (20, "Wind through the Gull Creek gorge: hollow low gusts with an airy top, no whistle (Ep 5 s09–s10).", [
        ("NOISE brown 33", "lowpass=f=420,volume=2.4,tremolo=f=0.13:d=0.75"),
        ("NOISE pink 34", "bandpass=f=700:width_type=h:w=1100,volume=0.7,tremolo=f=0.21:d=0.8"),
        ("NOISE white 35", "highpass=f=3000,lowpass=f=8000,volume=0.07,tremolo=f=0.31:d=0.9"),
    ], "afade=t=in:d=2,afade=t=out:st=18:d=2"),
    "mud-squelch-v1": (8, "Boots in deep tidal mud: a slow suck-and-pull every ~1.1 s (Ep 5 s11).", [
        ("EVAL (random(5)*2-1)*0.9*exp(-11*mod(t,1.1))*gt(mod(t,1.1),0)", "lowpass=f=700,highpass=f=70"),
        ("EVAL (random(6)*2-1)*0.4*exp(-25*mod(t+0.55,1.1))", "bandpass=f=1300:width_type=h:w=900"),
    ], "afade=t=in:d=0.2,afade=t=out:st=7.4:d=0.6"),
    "dry-day-insects-v1": (20, "Hot dry afternoon: a broad insect/grasshopper rasp (noise buzz, not a tone) + warm still air (Ep 5 sunny camp).", [
        ("NOISE white 36", "bandpass=f=5200:width_type=h:w=3000,tremolo=f=31:d=0.85,tremolo=f=0.23:d=0.7,volume=0.32"),
        ("NOISE white 37", "bandpass=f=3900:width_type=h:w=2400,tremolo=f=23:d=0.8,tremolo=f=0.17:d=0.8,volume=0.22"),
        ("NOISE pink 38", "lowpass=f=600,volume=0.25"),
    ], "afade=t=in:d=2,afade=t=out:st=18:d=2"),
    "night-forest-v1": (20, "Night forest: hushed air in the firs, sparse short cricket chirps (noise bursts), an occasional twig (Ep 5 s17).", [
        ("NOISE pink 39", "lowpass=f=650,highpass=f=60,volume=0.6,tremolo=f=0.11:d=0.5"),
        ("EVAL (random(7)*2-1)*0.25*lt(mod(t,1.73),0.24)*gt(mod(t*12.5,1),0.45)", "bandpass=f=4600:width_type=h:w=1400"),
        ("EVAL (random(8)*2-1)*0.5*exp(-90*mod(t+2.3,6.1))", "bandpass=f=1800:width_type=h:w=1600"),
    ], "afade=t=in:d=2,afade=t=out:st=18:d=2"),
    "whistle-blasts-far-v1": (4.2, "Three whistle blasts far off in the trees (distress signal): 0.45 s each, muffled by distance, short echo (Ep 5 s17).", [
        ("EVAL 0.3*sin(2*PI*2850*t+2.2*sin(2*PI*40*t))*(between(t,0.1,0.55)+between(t,0.95,1.4)+between(t,1.8,2.25))", "lowpass=f=3600,highpass=f=900"),
        ("NOISE pink 40", "lowpass=f=500,volume=0.15"),
    ], "aecho=0.7:0.6:180|420:0.35|0.18,afade=t=out:st=3.6:d=0.6"),
}


def main():
    log = ["# Rainy Day — SFX library log, Episode 5 additions (v1)", "",
           "Made by `tools/make-sfx-ep05-v1.py` with the same ffmpeg synthesis method as `SFX-LOG-v1.md` (fixed seeds, stereo, "
           "48 kHz MP3 192k, never overwritten). Tonal parts are short bursts only (the whistle blasts are 0.45 s each).", "",
           "| File | Length | Description |", "|---|---|---|"]
    rec = []
    for name, (dur, desc, layers, master) in LIB.items():
        fc = lib1.build(name, dur, layers, master)
        log.append(f"| `assets/sfx/{name}.mp3` | {dur} s | {desc} |")
        rec += [f"### {name}", "", "```", fc, "```", ""]
    open(os.path.join(ROOT, "assets/sfx/SFX-LOG-ep05-v1.md"), "w").write("\n".join(log + ["", "## Recipes (ffmpeg filter graphs)", ""] + rec))
    print("ok")


main()
