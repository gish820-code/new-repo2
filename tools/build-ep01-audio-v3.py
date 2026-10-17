#!/usr/bin/env python3
"""Rainy Day — Episode 1 audio builder (v3).

v3 swaps the offline Kokoro voices for ElevenLabs v4 (elevenlabs_v4 via Higgsfield). The voiced lines are generated
once and downloaded to audio/ep01/vo/lines-v3/ (manifest: audio/ep01/vo/ep01-lines-v3.json, source URLs in
ep01-urls-v3.json). This script never calls a TTS service; it:
  1. trims each downloaded line, applies the cast fx (radio filter for RADIO) and gain;
  2. places every line at natural speed, starting at its caption t0 or right after the previous caption, and retimes
     the captions to the speech (signs keep their length) -> episodes/ep01/ep01-scenes-v3.json;
     if a scene would overflow, captions are pulled earlier from the end; atempo is only used as a last resort;
  3. mixes per part: audio/ep01/vo/ep01-partN-vo-v3.mp3 and audio/ep01/sfx/ep01-partN-sfx-v3.mp3 (SFX as in v2);
  4. writes audio/ep01/ep01-audio-report-v3.md.
Usage: python3 tools/build-ep01-audio-v3.py
"""
import json, os, re, subprocess, tempfile, shutil, hashlib, copy

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = "v3"
SR = 48000
ep = json.load(open(os.path.join(ROOT, "episodes/ep01/ep01-scenes-v1.json")))
cfg = json.load(open(os.path.join(ROOT, "episodes/ep01/ep01-audio-v3.json")))
LINES = json.load(open(os.path.join(ROOT, "audio/ep01/vo/ep01-lines-v3.json")))
BY_KEY = {(l["sid"], l["n"]): l for l in LINES}
os.makedirs(os.path.join(ROOT, "audio/ep01/sfx"), exist_ok=True)
TMP = tempfile.mkdtemp(prefix="rd-audio-")
GAP = 0.15        # silence between consecutive captions
HOLD = 0.35       # caption stays up this long after the speech ends
MIN_CAP = 1.1     # shortest caption on screen


def run(cmd):
    r = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit(f"command failed: {' '.join(cmd)}\n{r.stderr[-1500:]}")
    return r.stdout


def dur(path):
    return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]).strip())


def ff(args):
    run(["ffmpeg", "-v", "error", "-y"] + args)


def seed_of(*parts):
    return int(hashlib.md5("|".join(map(str, parts)).encode()).hexdigest()[:6], 16)


def tts_text(text):
    t = text.replace("—", ", ").replace("...", "… ").replace("·", ",")
    t = re.sub(r"\b([A-Z]{2,})\b", lambda m: m.group(1).capitalize() if m.group(1) not in ("SOS",) else m.group(1), t)
    return t.strip()



FX = {
    "none": "anull",
    "radio": "highpass=f=380,lowpass=f=2700,acompressor=threshold=0.08:ratio=6:attack=5:release=60,volume=1.6",
}


def prep_line(l, tempo=1.0):
    """downloaded mp3 -> trimmed, fx'd mono wav at SR; returns (path, duration)."""
    cast = cfg["cast"][l["speaker"]]
    out = f"{TMP}/{l['sid']}-{l['n']:02d}-{tempo:.3f}.wav"
    trim = ("silenceremove=start_periods=1:start_threshold=-50dB,areverse,"
            "silenceremove=start_periods=1:start_threshold=-50dB,areverse")
    at = f",atempo={tempo:.3f}" if abs(tempo - 1) > 1e-3 else ""
    ff(["-i", os.path.join(ROOT, l["file"]), "-af", f"{trim}{at},{FX[cast['fx']]},volume={cast['gainDb']}dB,aresample={SR}", "-ac", "1", out])
    return out, dur(out)


def plan_scene(s):
    """returns retimed captions + [(caption index, line, wav, dur, start, tempo)]"""
    caps = copy.deepcopy(s["captions"])
    D = s["duration"]
    items = []  # per caption: dict(kind, len, t0, voiced info)
    for i, c in enumerate(caps):
        l = BY_KEY.get((s["id"], i + 1))
        if l:
            wav, d = prep_line(l)
            items.append({"i": i, "line": l, "wav": wav, "d": d, "tempo": 1.0, "len": max(d + HOLD, MIN_CAP), "t0": c["t0"]})
        else:
            items.append({"i": i, "line": None, "len": c["t1"] - c["t0"], "t0": c["t0"]})
    for attempt in range(6):
        cur = 0.0
        for it in items:  # forward: never earlier than the scripted cue, never overlapping
            it["s"] = max(it["t0"], cur + GAP if cur else it["t0"])
            cur = it["s"] + it["len"]
        lim = D - 0.08
        for it in reversed(items):  # backward: pull captions earlier if the scene would overflow
            if it["s"] + it["len"] > lim:
                it["s"] = lim - it["len"]
            lim = it["s"] - GAP
        if items[0]["s"] >= 0.2:
            break
        # still overflowing: speed up the longest voiced line slightly and retry
        v = max((it for it in items if it["line"]), key=lambda it: it["d"])
        v["tempo"] = round(v["tempo"] * 1.06, 3)
        v["wav"], v["d"] = prep_line(v["line"], v["tempo"])
        v["len"] = max(v["d"] + HOLD, MIN_CAP)
    for it in items:
        c = caps[it["i"]]
        c["t0"] = round(it["s"], 2)
        c["t1"] = round(it["s"] + it["len"], 2)
    voiced = [(it["i"], it["line"], it["wav"], it["d"], it["s"], it["tempo"]) for it in items if it["line"]]
    return caps, voiced


# ------------------------------------------------------------------ SFX synthesis (mono, SR)
def synth(kind, d, level, ramp, seed):
    o = f"{TMP}/sfx-{kind}-{seed}.wav"
    lv = level
    fade_in = f"afade=t=in:st=0:d={max(ramp, 0.02):.2f}," if ramp is not None else ""
    srcs = {
        "rain-out": (f"anoisesrc=d={d}:c=pink:r={SR}:a=0.5:seed={seed}", "highpass=f=450,lowpass=f=7500,volume=0.30"),
        "rain-out-light": (f"anoisesrc=d={d}:c=pink:r={SR}:a=0.5:seed={seed}", "highpass=f=500,lowpass=f=7000,volume=0.18"),
        "rain-in": (f"anoisesrc=d={d}:c=pink:r={SR}:a=0.5:seed={seed}", "highpass=f=120,lowpass=f=1400,volume=0.30"),
        "rain-in-quiet": (f"anoisesrc=d={d}:c=pink:r={SR}:a=0.5:seed={seed}", "highpass=f=120,lowpass=f=1200,volume=0.14"),
        "rain-forest": (f"anoisesrc=d={d}:c=pink:r={SR}:a=0.5:seed={seed}", "highpass=f=300,lowpass=f=5200,volume=0.26"),
        "rumble": (f"anoisesrc=d={d}:c=brown:r={SR}:a=0.9:seed={seed}", f"lowpass=f=95,lowpass=f=95,volume={1.6 * lv},tremolo=f=6:d=0.45"),
        "rattle": (f"anoisesrc=d={d}:c=white:r={SR}:a=0.5:seed={seed}", f"bandpass=f=3800:width_type=h:w=3000,tremolo=f=14:d=0.95,tremolo=f=5.3:d=0.7,volume={0.16 * lv}"),
        "roar": (f"anoisesrc=d={d}:c=brown:r={SR}:a=0.9:seed={seed}", f"lowpass=f=520,highpass=f=40,volume={1.9 * lv},tremolo=f=0.6:d=0.3"),
        "static": (f"anoisesrc=d={d}:c=white:r={SR}:a=0.5:seed={seed}", f"bandpass=f=1900:width_type=h:w=2600,tremolo=f=23:d=0.6,tremolo=f=3.1:d=0.5,volume={0.32 * lv}"),
        "kettle": (f"anoisesrc=d={d}:c=pink:r={SR}:a=0.5:seed={seed}", "highpass=f=2600,lowpass=f=6000,volume=0.07"),
        "creak": (f"aevalsrc='0.07*sin(2*PI*(130+35*sin(2*PI*0.45*t))*t)*(0.6+0.4*sin(2*PI*0.9*t))':d={d}:s={SR}", "lowpass=f=900"),
        "drip": (f"aevalsrc='0.10*sin(2*PI*1100*t)*exp(-45*mod(t+0.3,1.73))+0.07*sin(2*PI*820*t)*exp(-50*mod(t+1.1,2.41))':d={d}:s={SR}", "anull"),
        "crank": (f"aevalsrc='0.22*exp(-55*mod(t,0.085))*sin(2*PI*2300*t)':d={d}:s={SR}", "highpass=f=800"),
    }
    one_shots = {
        "crash": (f"anoisesrc=d=1.2:c=white:r={SR}:a=0.8:seed={seed}", f"highpass=f=1300,volume={1.1 * lv},afade=t=out:st=0.02:d=1.15:curve=exp"),
        "thud": (f"aevalsrc='0.9*sin(2*PI*58*t)*exp(-9*t)':d=0.7:s={SR}", f"volume={lv}"),
        "click": (f"anoisesrc=d=0.04:c=white:r={SR}:a=0.6:seed={seed}", "highpass=f=2500,afade=t=out:st=0:d=0.04"),
        "thunk": (f"aevalsrc='0.9*sin(2*PI*52*t)*exp(-7*t)+0.25*sin(2*PI*140*t)*exp(-20*t)':d=0.9:s={SR}", "anull"),
        "door": (f"aevalsrc='0.10*sin(2*PI*(280+160*t)*t)*lt(t,0.55)+0.6*sin(2*PI*70*(t-0.55))*exp(-12*(t-0.55))*gt(t,0.55)':d=1.0:s={SR}", "lowpass=f=1800"),
        "horn": (f"aevalsrc='0.16*(sin(2*PI*415*t)+sin(2*PI*522*t))*lt(t,0.42)':d=0.5:s={SR}", "lowpass=f=2500,afade=t=out:st=0.36:d=0.06"),
        "pop": (f"aevalsrc='0.5*sin(2*PI*240*t)*exp(-14*t)':d=0.5:s={SR}", "anull"),
    }
    if kind in srcs:
        src, flt = srcs[kind]
        ff(["-f", "lavfi", "-i", src, "-af", f"{fade_in}{flt},afade=t=out:st={max(0, d - 0.35):.2f}:d=0.35,aresample={SR}", "-ac", "1", "-t", f"{d}", o])
    else:
        src, flt = one_shots[kind]
        ff(["-f", "lavfi", "-i", src, "-af", f"{flt},aresample={SR}", "-ac", "1", o])
    return o


def mix(items, total, out, lufs):
    """items: [(path, start_s, gain)] → stereo SR wav of length total."""
    if not items:
        ff(["-f", "lavfi", "-i", f"anullsrc=r={SR}:cl=stereo", "-t", f"{total}", "-c:a", "libmp3lame", "-b:a", "192k", out])
        return
    args, chains = [], []
    for i, (p, st, g) in enumerate(items):
        args += ["-i", p]
        ms = int(round(st * 1000))
        chains.append(f"[{i}]volume={g},adelay={ms}|{ms},apad=whole_dur={total}[a{i}]")
    graph = ";".join(chains) + ";" + "".join(f"[a{i}]" for i in range(len(items))) + f"amix=inputs={len(items)}:normalize=0:dropout_transition=0,loudnorm=I={lufs}:TP=-2:LRA=14,aresample={SR},atrim=0:{total},aformat=channel_layouts=stereo[out]"
    script = f"{TMP}/graph.txt"
    open(script, "w").write(graph)
    ff(args + ["-filter_complex_script", script, "-map", "[out]", "-ar", f"{SR}", "-t", f"{total}", "-c:a", "libmp3lame", "-b:a", "192k", out])


# ------------------------------------------------------------------ build
report = ["# Episode 1 — audio report (v3)", "",
          f"Voices: ElevenLabs v4 via Higgsfield. Cast: " + ", ".join(f"{k} = {v['name']}" for k, v in cfg["cast"].items()) + ".",
          "Lines play at natural speed; captions are retimed to the speech (see ep01-scenes-v3.json).", "",
          "| Part | Scene | # | Speaker | Line | Cue v1 | Start v3 | Length | Tempo |", "|---|---|---|---|---|---|---|---|---|"]
ep3 = copy.deepcopy(ep)
ep3["version"] = 3
for pi, p in enumerate(ep["parts"]):
    pt, vo_items, sfx_items = 0.0, [], []
    for si, s in enumerate(p["scenes"]):
        sid = s["id"]
        caps, voiced = plan_scene(s)
        ep3["parts"][pi]["scenes"][si]["captions"] = caps
        for (i, l, wav, d, st, tempo) in voiced:
            report.append(f"| {p['part']} | {sid} | {i + 1} | {l['speaker']} | {l['text']} | {s['captions'][i]['t0']:.2f}s | {st:.2f}s | {d:.2f}s | {tempo:.2f} |")
            vo_items.append((wav, pt + st, 1.0))
        amb = cfg["ambience"].get(sid)
        if amb:
            sfx_items.append((synth(amb, s["duration"] + 0.3, 1.0, 0.3, seed_of(sid, amb)), pt, 1.0))
        for j, e in enumerate(cfg["sfx"].get(sid, [])):
            d = e.get("d", 1.0)
            path = synth(e["type"], d, e.get("level", 1.0), e.get("rampIn"), seed_of(sid, j, e["type"]))
            sfx_items.append((path, pt + e["t"], 1.0))
        pt += s["duration"]
    n = p["part"]
    vo_out = os.path.join(ROOT, f"audio/ep01/vo/ep01-part{n}-vo-{V}.mp3")
    sfx_out = os.path.join(ROOT, f"audio/ep01/sfx/ep01-part{n}-sfx-{V}.mp3")
    mix(vo_items, pt, vo_out, -16)
    mix(sfx_items, pt, sfx_out, -28)
    print(f"part {n}: {len(vo_items)} voiced lines, {len(sfx_items)} sfx layers -> {os.path.relpath(vo_out, ROOT)}")
json.dump(ep3, open(os.path.join(ROOT, "episodes/ep01/ep01-scenes-v3.json"), "w"), indent=1, ensure_ascii=False)
open(os.path.join(ROOT, f"audio/ep01/ep01-audio-report-{V}.md"), "w").write("\n".join(report) + "\n")
shutil.rmtree(TMP, ignore_errors=True)
