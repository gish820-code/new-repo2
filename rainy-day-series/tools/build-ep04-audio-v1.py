#!/usr/bin/env python3
"""Rainy Day — Episode 4 audio builder (v1), a copy of tools/build-ep03-audio-v2.py. Every line is its
own take (audio/ep04/lines/<shot>-<character>[n]-v1.mp3, recorded with the docs/voice-cast-v1.md voices; manifest
audio/ep04/lines/manifest-v1.json). This script never calls a TTS service. It:
  1. trims each take to its speech and places it at its caption cue (or right after the previous caption), shrinking
     silent-sign captions / pulling earlier if a scene would overflow, and only as a last resort a small atempo;
  2. retimes every caption to the speech -> episodes/ep04/ep04-scenes-v1.json (scene lengths stay as drafted); the
     scenes are then built against these FINAL times (talk keys on the final caption spans, rig v3), so no remap is
     needed — episodes/ep04/ep04-speech-v1.json records the placement for reference;
  3. synthesizes the ambience + SFX (the Episode 1-2 synthesizer, same kinds; plus the Episode 1 remake library file
     assets/sfx/*), mixes ONE episode-long VO track and SFX track, and cuts them per part;
  4. writes audio/ep04/lines/LINES-v1.md (line log) and audio/ep04/ep04-audio-report-v1.md.
Usage: python3 tools/build-ep04-audio-v1.py
"""
import json, os, subprocess, tempfile, shutil, hashlib, copy
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = "v1"
SR = 48000
ep = json.load(open(os.path.join(ROOT, "episodes/ep04/ep04-scenes-v1-draft.json")))
cfg = json.load(open(os.path.join(ROOT, "episodes/ep04/ep04-audio-v1.json")))
LINES = json.load(open(os.path.join(ROOT, "audio/ep04/lines/manifest-v1.json")))
for d in ("vo", "sfx"):
    os.makedirs(os.path.join(ROOT, f"audio/ep04/{d}"), exist_ok=True)
TMP = tempfile.mkdtemp(prefix="rd4-audio-")
GAP = 0.12          # minimum gap between consecutive captions
HOLD = 0.3          # caption stays up this long after its speech ends (if there is room)
MIN_SIGN = 2.0      # a silent sign caption may be shortened down to this (per-scene override: cfg["minSign"])
FX = {
    "none": "anull",
    "radio": "highpass=f=380,lowpass=f=2700,acompressor=threshold=0.08:ratio=6:attack=5:release=60,volume=1.6",
}


def run(cmd):
    r = subprocess.run(cmd, cwd=ROOT, capture_output=True)
    if r.returncode != 0:
        raise SystemExit(f"command failed: {' '.join(cmd)}\n{r.stderr.decode()[-1500:]}")
    return r.stdout


def ff(args):
    run(["ffmpeg", "-v", "error", "-y"] + args)


def seed_of(*parts):
    return int(hashlib.md5("|".join(map(str, parts)).encode()).hexdigest()[:6], 16)


def speech_span(path):
    raw = run(["ffmpeg", "-v", "error", "-i", os.path.join(ROOT, path), "-ac", "1", "-ar", "16000", "-f", "s16le", "-"])
    x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
    e = 20 * np.log10(np.sqrt(np.mean(x[: len(x) // 160 * 160].reshape(-1, 160) ** 2, 1)) + 1e-9)
    v = np.where(e > e.max() - 38)[0]
    return v[0] / 100, (v[-1] + 1) / 100


def cut(line, a, z, tempo, name):
    cast = cfg["cast"][line["speaker"]]
    out = f"{TMP}/{name}.wav"
    at = f",atempo={tempo:.3f}" if abs(tempo - 1) > 1e-3 else ""
    pad = 0.04
    ff(["-ss", f"{max(0, a - pad):.3f}", "-to", f"{z + pad:.3f}", "-i", os.path.join(ROOT, line["file"]),
        "-af", f"afade=t=in:d=0.02,areverse,afade=t=in:d=0.03,areverse{at},{FX[cast['fx']]},volume={cast['gainDb']}dB,aresample={SR}",
        "-ac", "1", out])
    return out


def plan_scene(s, dur):
    caps = copy.deepcopy(s["captions"])
    by = {l["cap"]: l for l in LINES if l["sid"] == s["id"]}
    min_sign = cfg.get("minSign", {}).get(s["id"], MIN_SIGN)
    units = []
    for i, c in enumerate(caps):
        if i in by:
            a, z = speech_span(by[i]["file"])
            units.append({"line": by[i], "cap": i, "t0": c["t0"], "a": a, "z": z, "tempo": 1.0, "len": (z - a) + HOLD})
        else:
            units.append({"sign": i, "t0": c["t0"], "len": c["t1"] - c["t0"]})
    for attempt in range(10):
        cur = None
        for u in units:
            u["s"] = u["t0"] if cur is None else max(u["t0"], cur + GAP)
            cur = u["s"] + u["len"]
        over = cur - (dur - 0.06)
        if over > 0:
            for u in units:
                if "sign" in u and over > 0:
                    take = min(over, u["len"] - min_sign)
                    if take > 0:
                        u["len"] -= take
                        over -= take
        lim = dur - 0.06
        for u in reversed(units):
            if u["s"] + u["len"] > lim:
                u["s"] = lim - u["len"]
            lim = u["s"] - GAP
        if units[0]["s"] >= 0.12:
            break
        v = max((u for u in units if "line" in u), key=lambda u: u["len"])
        v["tempo"] = round(v["tempo"] * 1.04, 3)
        v["len"] = (v["z"] - v["a"]) / v["tempo"] + HOLD
    placed, remap = [], []
    for u in units:
        if "sign" in u:
            caps[u["sign"]]["t0"] = round(u["s"], 2)
            caps[u["sign"]]["t1"] = round(u["s"] + u["len"], 2)
            continue
        st = u["s"]
        en = st + (u["z"] - u["a"]) / u["tempo"]
        placed.append(dict(u, start=st, end=en))
        oc = s["captions"][u["cap"]]
        remap.append([oc["t0"], oc["t1"], round(st, 2), round(en, 2)])
        caps[u["cap"]]["t0"] = round(st, 2)
        caps[u["cap"]]["t1"] = round(en + HOLD, 2)
    order = sorted(range(len(caps)), key=lambda i: caps[i]["t0"])
    for k in range(len(order) - 1):
        a, b = caps[order[k]], caps[order[k + 1]]
        if a["t1"] > b["t0"] - 0.04:
            a["t1"] = round(b["t0"] - 0.04, 2)
    for c in caps:
        c["t1"] = round(min(c["t1"], dur - 0.02), 2)
    return caps, placed, remap


# ------------------------------------------------------------------ SFX (the Episode 1-2 synthesizer, same kinds)
def synth(kind, d, level, ramp, seed):
    o = f"{TMP}/sfx-{kind}-{seed}-{d:.2f}-{level}.wav"
    lv = level
    fade_in = f"afade=t=in:st=0:d={max(ramp, 0.02):.2f}," if ramp is not None else ""
    srcs = {
        "rain-out": (f"anoisesrc=d={d}:c=pink:r={SR}:a=0.5:seed={seed}", "highpass=f=450,lowpass=f=7500,volume=0.30"),
        "rain-out-light": (f"anoisesrc=d={d}:c=pink:r={SR}:a=0.5:seed={seed}", "highpass=f=500,lowpass=f=7000,volume=0.18"),
        "rain-in": (f"anoisesrc=d={d}:c=pink:r={SR}:a=0.5:seed={seed}", "highpass=f=120,lowpass=f=1400,volume=0.30"),
        "roar": (f"anoisesrc=d={d}:c=brown:r={SR}:a=0.9:seed={seed}", f"lowpass=f=520,highpass=f=40,volume={1.9 * lv},tremolo=f=0.6:d=0.3"),
        "drip": (f"aevalsrc='0.10*sin(2*PI*1100*t)*exp(-45*mod(t+0.3,1.73))+0.07*sin(2*PI*820*t)*exp(-50*mod(t+1.1,2.41))':d={d}:s={SR}", "anull"),
        "murmur": (f"anoisesrc=d={d}:c=pink:r={SR}:a=0.6:seed={seed}", f"bandpass=f=650:width_type=h:w=900,tremolo=f=3.7:d=0.5,tremolo=f=1.3:d=0.4,volume={0.28 * lv}"),
        "crackle": (f"anoisesrc=d={d}:c=white:r={SR}:a=0.6:seed={seed}", f"highpass=f=1500,tremolo=f=17:d=1,tremolo=f=7.3:d=1,tremolo=f=2.9:d=0.8,volume={0.14 * lv}"),
        "boil": (f"anoisesrc=d={d}:c=brown:r={SR}:a=0.8:seed={seed}", f"bandpass=f=420:width_type=h:w=500,tremolo=f=11:d=0.9,tremolo=f=4.1:d=0.5,volume={0.45 * lv}"),
        "pour": (f"anoisesrc=d={d}:c=pink:r={SR}:a=0.6:seed={seed}", f"bandpass=f=1300:width_type=h:w=1500,tremolo=f=9:d=0.3,volume={0.30 * lv}"),
    }
    one_shots = {
        "thud": (f"aevalsrc='0.9*sin(2*PI*58*t)*exp(-9*t)':d=0.7:s={SR}", f"volume={lv}"),
        "click": (f"anoisesrc=d=0.04:c=white:r={SR}:a=0.6:seed={seed}", f"highpass=f=2500,afade=t=out:st=0:d=0.04,volume={lv}"),
        # new in Episode 4: Ms. Ortega's coach's whistle — two short pea-whistle blasts (2.9 kHz with a fast warble)
        "whistle": (f"aevalsrc='0.22*sin(2*PI*2900*t+2.5*sin(2*PI*42*t))*(between(t,0.02,0.2)+between(t,0.3,0.55))':d=0.62:s={SR}", f"afade=t=out:st=0.5:d=0.1,volume={lv}"),
    }
    if kind in srcs:
        src, flt = srcs[kind]
        ff(["-f", "lavfi", "-i", src, "-af", f"{fade_in}{flt},afade=t=out:st={max(0, d - 0.35):.2f}:d=0.35,aresample={SR}", "-ac", "1", "-t", f"{d}", o])
    else:
        src, flt = one_shots[kind]
        ff(["-f", "lavfi", "-i", src, "-af", f"{flt},aresample={SR}", "-ac", "1", o])
    return o


def lib_file(path, d, level, seed):
    o = f"{TMP}/lib-{seed}.wav"
    ff(["-stream_loop", "-1", "-i", os.path.join(ROOT, path), "-t", f"{d}", "-af",
        f"volume={level},afade=t=in:d=0.2,afade=t=out:st={max(0, d - 0.4):.2f}:d=0.4,aresample={SR}", "-ac", "1", o])
    return o


def mix(items, total, out, lufs):
    args, chains = [], []
    for i, (p, st, g) in enumerate(items):
        args += ["-i", p]
        ms = int(round(st * 1000))
        chains.append(f"[{i}]volume={g},adelay={ms}|{ms},apad=whole_dur={total}[a{i}]")
    graph = ";".join(chains) + ";" + "".join(f"[a{i}]" for i in range(len(items))) + f"amix=inputs={len(items)}:normalize=0:dropout_transition=0,loudnorm=I={lufs}:TP=-2:LRA=14,aresample={SR},atrim=0:{total},aformat=channel_layouts=stereo[out]"
    script = f"{TMP}/graph.txt"
    open(script, "w").write(graph)
    ff(args + ["-filter_complex_script", script, "-map", "[out]", "-ar", f"{SR}", "-t", f"{total}", "-c:a", "pcm_s16le", out])


# ------------------------------------------------------------------ build
report = ["# Episode 4 — audio report (v1)", "",
          "Voices: one ElevenLabs v4 take per line via Higgsfield, voices from `docs/voice-cast-v1.md`: "
          + ", ".join(f"{k} = {v['name']}" for k, v in cfg["cast"].items()) + ".", "",
          "## Lines (placed)", "", "| Scene | Cap | Speaker | Line | Script cue | Start | End | Tempo |", "|---|---|---|---|---|---|---|---|"]
log = ["# Episode 4 — line log (v1 takes)", "",
       "Every narration and dialogue line of the Episode 4 v1 script, one ElevenLabs v4 take each (Higgsfield), voice from "
       "`docs/voice-cast-v1.md`.", "",
       "| # | Shot | Character | Line | Voice | Voice ID | File | Job |", "|---|---|---|---|---|---|---|---|"]
for i, l in enumerate(LINES):
    c = cfg["cast"][l["speaker"]]
    log.append(f"| {i + 1} | {l['sid']} | {l['speaker']} | {l['text']} | {c['name']} | `{l['voice_id']}` | `{l['file'].split('/')[-1]}` | `{l.get('job', '')}` |")
open(os.path.join(ROOT, "audio/ep04/lines/LINES-v1.md"), "w").write("\n".join(log) + "\n")

planned, speech_all, vo_items, sfx_items, t = [], {}, [], [], 0.0
for p in ep["parts"]:
    for s in p["scenes"]:
        sid = s["id"]
        dur = s["duration"]
        caps, placed, remap = plan_scene(s, dur)
        speech_all[sid] = {"remap": remap, "duration": dur}
        for pl in placed:
            l = pl["line"]
            wav = cut(l, pl["a"], pl["z"], pl["tempo"], f"{sid}-{pl['cap']:02d}")
            vo_items.append((wav, t + pl["start"], 1.0))
            report.append(f"| {sid} | {pl['cap'] + 1} | {l['speaker']} | {l['text']} | {s['captions'][pl['cap']]['t0']:.1f}s | {pl['start']:.2f}s | {pl['end']:.2f}s | {pl['tempo']:.2f} |")
        amb = cfg["ambience"].get(sid)
        if amb:
            sfx_items.append((synth(amb, dur + 0.3, 1.0, 0.3, seed_of(sid, amb)), t, 1.0))
        for j, e in enumerate(cfg["sfx"].get(sid, [])):
            if "file" in e:
                sfx_items.append((lib_file(e["file"], e.get("d", 2.0), e.get("level", 1.0), seed_of(sid, j, e["file"])), t + e["t"], 1.0))
            else:
                d = min(e.get("d", 1.0), dur - e["t"] + 0.3)
                sfx_items.append((synth(e["type"], d, e.get("level", 1.0), e.get("rampIn"), seed_of(sid, j, e["type"])), t + e["t"], 1.0))
        planned.append((p["part"], dict(s, captions=caps, duration=dur)))
        t += dur
EP = round(t, 3)
vo_wav, sfx_wav = f"{TMP}/ep-vo.wav", f"{TMP}/ep-sfx.wav"
mix(vo_items, EP, vo_wav, -16)
mix(sfx_items, EP, sfx_wav, -28)

ep2 = {k: v for k, v in ep.items() if k != "parts"}
ep2["version"] = 1
ep2["parts"] = []
t0 = 0.0
for n in (1, 2, 3, 4):
    scenes = [s for pn, s in planned if pn == n]
    src = next(p for p in ep["parts"] if p["part"] == n)
    dur = round(sum(s["duration"] for s in scenes), 4)
    ep2["parts"].append({"part": n, "title": src["title"], "hook": src["hook"], "duration": dur, "scenes": scenes})
    for kind, f in (("vo", vo_wav), ("sfx", sfx_wav)):
        ff(["-i", f, "-af", f"atrim=start={t0}:end={t0 + dur},asetpts=PTS-STARTPTS", "-c:a", "libmp3lame", "-b:a", "192k",
            os.path.join(ROOT, f"audio/ep04/{kind}/ep04-part{n}-{kind}-{V}.mp3")])
    print(f"part {n}: {dur:.2f}s ({t0:.2f}–{t0 + dur:.2f})")
    t0 += dur
for kind, f in (("vo", vo_wav), ("sfx", sfx_wav)):
    ff(["-i", f, "-c:a", "libmp3lame", "-b:a", "192k", os.path.join(ROOT, f"audio/ep04/{kind}/ep04-full-{kind}-{V}.mp3")])
json.dump(ep2, open(os.path.join(ROOT, "episodes/ep04/ep04-scenes-v1.json"), "w"), indent=1, ensure_ascii=False)
json.dump(speech_all, open(os.path.join(ROOT, "episodes/ep04/ep04-speech-v1.json"), "w"), indent=1)
report += ["", f"Episode length {EP:.2f}s. VO mixed to -16 LUFS, SFX/ambience to -28 LUFS (dialogue ~12 dB on top); the finished renders are mastered to -14 LUFS with `tools/master-audio-v2.sh`. No music (as in Episodes 1–3)."]
open(os.path.join(ROOT, f"audio/ep04/ep04-audio-report-{V}.md"), "w").write("\n".join(report) + "\n")
print(f"episode {EP}s")
shutil.rmtree(TMP, ignore_errors=True)
