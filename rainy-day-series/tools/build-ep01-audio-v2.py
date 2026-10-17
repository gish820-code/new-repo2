#!/usr/bin/env python3
"""Rainy Day — Episode 1 audio builder (v2).

Reads episodes/ep01/ep01-scenes-v1.json (captions + timings) and episodes/ep01/ep01-audio-v2.json (cast, ambience, SFX
events) and writes, per part N:
  audio/ep01/vo/lines/ep01-<scene>-<nn>-<speaker>-v2.wav   one voiced line (Kokoro via `npx hyperframes tts`, fitted)
  audio/ep01/vo/ep01-partN-vo-v2.mp3                       all lines of the part placed at their caption times
  audio/ep01/sfx/ep01-partN-sfx-v2.mp3                     ambience + synthesized SFX for the part (ffmpeg, seeded)
and audio/ep01/ep01-audio-report-v2.md (every line: window, raw/fitted length, speed, overlaps).

Deterministic: TTS output is cached per line (delete a line wav to regenerate it); every noise source has a fixed seed.
Usage: python3 tools/build-ep01-audio-v2.py
"""
import json, os, re, subprocess, tempfile, shutil, hashlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = "v2"
SR = 48000
ep = json.load(open(os.path.join(ROOT, "episodes/ep01/ep01-scenes-v1.json")))
cfg = json.load(open(os.path.join(ROOT, "episodes/ep01/ep01-audio-v2.json")))
LINES_DIR = os.path.join(ROOT, "audio/ep01/vo/lines")
os.makedirs(LINES_DIR, exist_ok=True)
os.makedirs(os.path.join(ROOT, "audio/ep01/sfx"), exist_ok=True)
TMP = tempfile.mkdtemp(prefix="rd-audio-")


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


# ------------------------------------------------------------------ voice lines
FX = {
    "none": "anull",
    "older": "asetrate=24000*0.94,aresample=24000,atempo=1.0638,lowpass=f=7000",
    "radio": "highpass=f=380,lowpass=f=2700,acompressor=threshold=0.08:ratio=6:attack=5:release=60,volume=1.6",
}


def make_line(sid, idx, speaker, text, window):
    cast = cfg["cast"][speaker]
    base = os.path.join(LINES_DIR, f"ep01-{sid}-{idx:02d}-{speaker.lower()}-{V}")
    out = base + ".wav"
    raw = base + ".raw.wav"
    speed = cast["speed"]
    if not os.path.exists(out):
        def gen(sp):
            run(["npx", "hyperframes", "tts", tts_text(text), "-v", cast["voice"], "-s", f"{sp:.3f}", "-o", raw])
            # trim leading/trailing silence so placement is tight
            ff(["-i", raw, "-af", "silenceremove=start_periods=1:start_threshold=-45dB:stop_periods=-1:stop_threshold=-45dB:stop_duration=0.25", TMP + "/t.wav"])
            shutil.move(TMP + "/t.wav", raw)
            return dur(raw)
        d = gen(speed)
        if d > window:
            speed = min(1.38, speed * d / window * 1.03)
            d = gen(speed)
        ff(["-i", raw, "-af", f"{FX[cast['fx']]},volume={cast['gainDb']}dB,aresample={SR}", "-ac", "1", out])
        os.remove(raw)
        json.dump({"speed": speed}, open(base + ".json", "w"))
    meta = json.load(open(base + ".json")) if os.path.exists(base + ".json") else {"speed": speed}
    return out, dur(out), meta["speed"]


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
report = ["# Episode 1 — audio report (v2)", "", "Voiced lines fitted into their caption windows (window = time until the next voiced line or the scene end).", "",
          "| Part | Scene | # | Speaker | Voice | Line | Window | Length | Speed | Note |", "|---|---|---|---|---|---|---|---|---|---|"]
for p in ep["parts"]:
    pt, vo_items, sfx_items = 0.0, [], []
    for s in p["scenes"]:
        sid = s["id"]
        voiced = []
        for i, c in enumerate(s["captions"]):
            if c["kind"] == "dialogue":
                voiced.append((i, c["speaker"], c["text"], c["t0"]))
            elif c["kind"] == "narration":
                voiced.append((i, "NARRATOR", c["text"], c["t0"]))
            elif c["kind"] == "sign" and c["text"] in cfg["voicedSigns"].get(sid, {}):
                voiced.append((i, "NARRATOR", cfg["voicedSigns"][sid][c["text"]], c["t0"]))
        for k, (i, spk, text, t0) in enumerate(voiced):
            nxt = voiced[k + 1][3] if k + 1 < len(voiced) else s["duration"]
            window = max(0.6, nxt - t0 - 0.12)
            path, d, sp = make_line(sid, i + 1, spk, text, window)
            note = "OVERLAPS next" if d > window + 0.05 else ""
            report.append(f"| {p['part']} | {sid} | {i + 1} | {spk} | {cfg['cast'][spk]['voice']} | {text} | {window:.2f}s | {d:.2f}s | {sp:.2f} | {note} |")
            vo_items.append((path, pt + t0 + 0.05, 1.0))
        # ambience for the whole scene
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
    print(f"part {n}: {len(vo_items)} voiced lines, {len(sfx_items)} sfx/ambience layers, {pt}s → {os.path.relpath(vo_out, ROOT)}, {os.path.relpath(sfx_out, ROOT)}")
open(os.path.join(ROOT, f"audio/ep01/ep01-audio-report-{V}.md"), "w").write("\n".join(report) + "\n")
shutil.rmtree(TMP, ignore_errors=True)
print("wrote audio/ep01/ep01-audio-report-v2.md")
