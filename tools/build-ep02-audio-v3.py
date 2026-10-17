#!/usr/bin/env python3
"""Rainy Day — Episode 2 audio builder (v3). v2 pipeline (tools/build-ep02-audio-v2.py) plus: the re-voiced s13 water-heater
exchange (blocks-v3), a 1.9 s cold open (h1) that reuses a line from the s06 take, ONE episode-long mix, and the new
TikTok split (parts cut mid-scene at caption boundaries) → episodes/ep02/ep02-scenes-v3.json + per-part audio cut from
the episode mix.

v2 notes:

v4 voices whole EXCHANGES instead of single lines: every run of consecutive voiced captions in a scene (dialogue,
narration and voiced signs, broken by silent signs) was generated as ONE multi-speaker ElevenLabs v4 take via
Higgsfield (manifest audio/ep02/vo/ep02-blocks-v2.json → audio/ep02/vo/blocks-v2/*.mp3, source URLs in
ep02-block-urls-v2.json). This script never calls a TTS service. It:
  1. splits each take back into its lines at the pauses (dynamic programming over the detected silences, guided by a
     per-voice speaking-rate model), keeping the take's own natural timing between lines;
  2. places each take at its scene cue (or right after the previous caption), shrinking silent-sign captions / pulling
     earlier if a scene would overflow, and only as a last resort a small atempo;
  3. retimes every caption to the speech → episodes/ep02/ep02-scenes-v2.json, and writes the per-scene mouth-flap map
     (who speaks when) → episodes/ep02/ep02-speech-v2.json (consumed by tools/build-ep02-v2.mjs / rig v4);
  4. mixes per part: audio/ep02/vo/ep02-partN-vo-v2.mp3 and audio/ep02/sfx/ep02-partN-sfx-v2.mp3;
  5. writes audio/ep02/ep02-audio-report-v2.md.
Usage: python3 tools/build-ep02-audio-v3.py
"""
import json, os, re, subprocess, tempfile, shutil, hashlib, copy, math
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = "v3"
SR = 48000
ep = json.load(open(os.path.join(ROOT, "episodes/ep02/ep02-scenes-v3-draft.json")))
cfg = json.load(open(os.path.join(ROOT, "episodes/ep02/ep02-audio-v3.json")))
BLOCKS = json.load(open(os.path.join(ROOT, "audio/ep02/vo/ep02-blocks-v3.json")))
os.makedirs(os.path.join(ROOT, "audio/ep02/sfx"), exist_ok=True)
TMP = tempfile.mkdtemp(prefix="rd-audio-")
# s15-b1: three narrator lines in a row with dramatic pauses ("...walk uphill. [pause] Now."); the pause pattern
# was read by hand: "Now." ends at 11.55s, "Three." starts at 11.81s.
# s04-b1: the NEIGHBOR_F print (from a preview sample) is weak; cut points read from the per-chunk voice evidence
MANUAL_CUTS = {"s04-b1": [3.13, 6.05, 9.51, 12.00]}
VW = 4.0           # weight of the voice-print term in the take splitter
GAP = 0.12          # minimum gap between consecutive captions
HOLD = 0.3          # caption stays up this long after its speech ends (if there is room)
MIN_SIGN = 2.0      # a silent sign caption may be shortened down to this
# seconds per alphanumeric character, measured on the v3 single-line takes of the same voices
RATE = {"NARRATOR": 0.0964, "MAGS": 0.1116, "DRIZZLE": 0.0989, "NEIGHBOR": 0.1024, "RADIO": 0.0778,
        "GORD": 0.105, "TESS": 0.10, "PRUITT": 0.10, "NEIGHBOR_F": 0.10}  # new voices: estimates


def run(cmd):
    r = subprocess.run(cmd, cwd=ROOT, capture_output=True)
    if r.returncode != 0:
        raise SystemExit(f"command failed: {' '.join(cmd)}\n{r.stderr.decode()[-1500:]}")
    return r.stdout


def dur(path):
    return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]).decode().strip())


def ff(args):
    run(["ffmpeg", "-v", "error", "-y"] + args)


def seed_of(*parts):
    return int(hashlib.md5("|".join(map(str, parts)).encode()).hexdigest()[:6], 16)


FX = {
    "none": "anull",
    "radio": "highpass=f=380,lowpass=f=2700,acompressor=threshold=0.08:ratio=6:attack=5:release=60,volume=1.6",
}


# ------------------------------------------------------------------ split a take into its lines
def pcm(path, sr=16000):
    raw = run(["ffmpeg", "-v", "error", "-i", os.path.join(ROOT, path), "-ac", "1", "-ar", str(sr), "-f", "s16le", "-"])
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0, sr


# voice prints: per-voice diagonal Gaussian over log-mel frames, trained on the v3 single-line takes of the same
# voices (audio/ep01/vo/ep01-voiceprints-v4.json; 78/79 v3 lines classified correctly)
VP = {k: (np.array(m), np.array(v)) for k, (m, v) in json.load(open(os.path.join(ROOT, "audio/ep01/vo/ep01-voiceprints-v4.json"))).items()}
# Episode 2 voices: prints from the voices' Higgsfield preview samples (audio/ep02/vo/ep02-voiceprints-v2.json)
VP.update({k: (np.array(m), np.array(v)) for k, (m, v) in json.load(open(os.path.join(ROOT, "audio/ep02/vo/ep02-voiceprints-v2.json"))).items()})


def _melfb(sr=16000, nfft=512, nb=32):
    mel = lambda f: 2595 * np.log10(1 + f / 700)
    imel = lambda m: 700 * (10 ** (m / 2595) - 1)
    pts = imel(np.linspace(mel(60), mel(7600), nb + 2))
    bins = np.floor((nfft + 1) * pts / sr).astype(int)
    fb = np.zeros((nb, nfft // 2 + 1))
    for i in range(nb):
        a, b, c = bins[i], bins[i + 1], bins[i + 2]
        fb[i, a:b] = (np.arange(a, b) - a) / max(1, b - a)
        fb[i, b:c] = (c - np.arange(b, c)) / max(1, c - b)
    return fb


FB = _melfb()


def frame_loglik(x, speakers):
    """per-10ms-frame log-likelihood under each speaker's voice print, plus a voiced mask."""
    hop, win = 160, 400
    n = (len(x) - win) // hop
    idx = np.arange(win)[None, :] + hop * np.arange(n)[:, None]
    fr = x[idx] * np.hamming(win)
    lm = np.log((np.abs(np.fft.rfft(fr, 512)) ** 2) @ FB.T + 1e-8)
    en = 10 * np.log10((fr ** 2).mean(1) + 1e-10)
    ll = {k: -0.5 * np.sum((lm - VP[k][0]) ** 2 / VP[k][1] + np.log(VP[k][1]), 1) for k in speakers}
    return ll, en > en.max() - 30


def split_take(block):
    """Split a multi-line take at its pauses. DP over the detected silences: every line gets one segment; the cost
    mixes (a) segment length vs. a per-voice speaking-rate estimate, (b) segment pitch vs. the speaker's voice and
    (c) a bonus for cutting at long pauses."""
    x, sr = pcm(block["file"])
    hop = sr // 100
    n = len(x) // hop
    e = np.array([np.sqrt(np.mean(x[i * hop:(i + 1) * hop] ** 2) + 1e-12) for i in range(n)])
    db = 20 * np.log10(e)
    voiced = db > db.max() - 38
    idx = np.where(voiced)[0]
    s0, s1 = idx[0] * 0.01, (idx[-1] + 1) * 0.01
    sil, i = [], idx[0]
    while i <= idx[-1]:
        if not voiced[i]:
            j = i
            while j <= idx[-1] and not voiced[j]:
                j += 1
            if (j - i) * 0.01 >= 0.09:
                sil.append((i * 0.01, j * 0.01))
            i = j
        else:
            i += 1
    lines = block["lines"]
    k = len(lines)
    if k == 1:
        return [(s0, s1)], s0, s1, []
    if len(sil) < k - 1:
        raise SystemExit(f"{block['id']}: only {len(sil)} pauses for {k} lines")
    spks = sorted({l["speaker"] for l in lines})
    LL, vmask = frame_loglik(x, spks)
    def guess(t, spk):  # seconds: speaking rate + the pauses that ellipses and inner sentence breaks add
        inner = t.strip(" .!?…")
        return max(0.4, sum(ch.isalnum() for ch in t) * RATE[spk] + 0.35 * inner.count("...") + 0.1 * sum(inner.count(c) for c in ".!?—"))
    est = np.array([guess(l["text"], l["speaker"]) for l in lines])
    scale = (s1 - s0 - 0.3 * (k - 1)) / est.sum()
    est = est * max(0.6, min(1.6, scale))
    # boundary b: index into sil, plus virtual start (-1) and end (m)
    m = len(sil)
    def seg_bounds(c_prev, c):
        a = s0 if c_prev < 0 else sil[c_prev][1]
        z = s1 if c >= m else sil[c][0]
        return a, z
    def seg_cost(j, c_prev, c):
        a, z = seg_bounds(c_prev, c)
        d = z - a
        if d < 0.25:
            return 1e9
        cost = (math.log(d / est[j]) / 0.4) ** 2
        if len(spks) > 1:
            i0, i1 = int(a * 100), min(int(z * 100), len(vmask))
            mk = vmask[i0:i1]
            if mk.sum() >= 10:
                own = LL[lines[j]["speaker"]][i0:i1][mk]
                best = np.max(np.stack([LL[k][i0:i1][mk] for k in spks]), 0)
                # evidence grows with the amount of audio that sounds like someone else (per second, clipped)
                cost += VW * float(np.minimum(best - own, 20).sum()) / 100
        if c < m:
            # same voice on both sides: only the pause tells the lines apart, so trust long pauses more
            same = j + 1 < k and lines[j]["speaker"] == lines[j + 1]["speaker"]
            cost -= (10.0 if same else 5.0) * min(sil[c][1] - sil[c][0], 0.8)
        return cost
    if block["id"] in MANUAL_CUTS:   # hand-checked cut points (take time, start of the pause)
        cs = [min(range(m), key=lambda c: abs(sil[c][0] - t)) for t in MANUAL_CUTS[block["id"]]]
        segs, prev = [], -1
        for c in cs + [m]:
            segs.append(seg_bounds(prev, c))
            prev = c
        return segs, s0, s1, [round((sil[c][0] + sil[c][1]) / 2, 2) for c in cs] + ["manual"]
    INF = 1e18
    # best[j][c]: lines 0..j placed, line j ends at boundary c (c in 0..m-1, or m = end for the last line)
    best = [[INF] * (m + 1) for _ in range(k)]
    back = [[-1] * (m + 1) for _ in range(k)]
    for c in range(m):
        best[0][c] = seg_cost(0, -1, c)
    for j in range(1, k):
        targets = range(m + 1) if j == k - 1 else range(m)
        for c in targets:
            if j == k - 1 and c != m:
                continue
            for cp in range(c):
                if best[j - 1][cp] >= INF:
                    continue
                v = best[j - 1][cp] + seg_cost(j, cp, c)
                if v < best[j][c]:
                    best[j][c], back[j][c] = v, cp
    cs, c = [], m
    for j in range(k - 1, 0, -1):
        c = back[j][c]
        cs.append(c)
    cs = cs[::-1]
    segs, prev = [], -1
    for c in cs + [m]:
        segs.append(seg_bounds(prev, c))
        prev = c
    diag = [round((sil[c][0] + sil[c][1]) / 2, 2) for c in cs]
    return segs, s0, s1, diag


def cut(block, a, z, speaker, tempo, name):
    cast = cfg["cast"][speaker]
    out = f"{TMP}/{name}.wav"
    at = f",atempo={tempo:.3f}" if abs(tempo - 1) > 1e-3 else ""
    pad = 0.04
    ff(["-ss", f"{max(0, a - pad):.3f}", "-to", f"{z + pad:.3f}", "-i", os.path.join(ROOT, block["file"]),
        "-af", f"afade=t=in:d=0.02,areverse,afade=t=in:d=0.03,areverse{at},{FX[cast['fx']]},volume={cast['gainDb']}dB,aresample={SR}",
        "-ac", "1", out])
    return out


# ------------------------------------------------------------------ plan a scene
def plan_scene(s, takes, spill=0.0):
    """takes: {block_id: (segs, s0, s1)}. Returns captions, placed segments, speech map.
    spill: seconds the last line may run past the scene end (only when the next scene opens silent)."""
    caps = copy.deepcopy(s["captions"])
    D = s["duration"] + spill
    blocks = [b for b in BLOCKS if b["sid"] == s["id"]]
    cap2block = {l["cap"]: (b, j) for b in blocks for j, l in enumerate(b["lines"])}
    # units in caption order: a take (several captions) or a silent sign
    units, seen = [], set()
    for i, c in enumerate(caps):
        if i in cap2block:
            b, _ = cap2block[i]
            if b["id"] in seen:
                continue
            seen.add(b["id"])
            segs, s0, s1 = takes[b["id"]]
            units.append({"block": b, "t0": c["t0"], "tempo": 1.0, "segs": segs, "s0": s0, "len": (s1 - s0) + HOLD})
        else:
            units.append({"sign": i, "t0": c["t0"], "len": c["t1"] - c["t0"], "full": c["t1"] - c["t0"]})
    for attempt in range(8):
        cur = None
        for u in units:
            u["s"] = u["t0"] if cur is None else max(u["t0"], cur + GAP)
            cur = u["s"] + u["len"]
        over = cur - (D - 0.06)
        if over > 0:
            # 1) shrink silent signs
            for u in units:
                if "sign" in u and over > 0:
                    take = min(over, u["len"] - MIN_SIGN)
                    if take > 0:
                        u["len"] -= take
                        over -= take
        lim = D - 0.06
        for u in reversed(units):   # 2) pull earlier from the end
            if u["s"] + u["len"] > lim:
                u["s"] = lim - u["len"]
            lim = u["s"] - GAP
        if units[0]["s"] >= 0.25:
            break
        # 3) last resort: speed the longest take up a little
        v = max((u for u in units if "block" in u), key=lambda u: u["len"])
        v["tempo"] = round(v["tempo"] * 1.04, 3)
        v["len"] = (v["segs"][-1][1] - v["s0"]) / v["tempo"] + HOLD
    placed, speech = [], {}
    for u in units:
        if "sign" in u:
            caps[u["sign"]]["t0"] = round(u["s"], 2)
            caps[u["sign"]]["t1"] = round(u["s"] + u["len"], 2)
            continue
        b, tempo = u["block"], u["tempo"]
        for j, (a, z) in enumerate(u["segs"]):
            l = b["lines"][j]
            st = u["s"] + (a - u["s0"]) / tempo
            en = u["s"] + (z - u["s0"]) / tempo
            placed.append({"block": b, "line": l, "a": a, "z": z, "start": st, "end": en, "tempo": tempo})
            # mouth-flap remap: the scene's authored talk span for this caption -> the real speech span
            oc = s["captions"][l["cap"]]
            speech.setdefault("remap", []).append([oc["t0"], oc["t1"], round(st, 2), round(en, 2)])
            caps[l["cap"]]["t0"] = round(st, 2)
            caps[l["cap"]]["t1"] = round(en + HOLD, 2)
    # captions never overlap: clip each to the next caption's start
    order = sorted(range(len(caps)), key=lambda i: caps[i]["t0"])
    for k in range(len(order) - 1):
        a, b = caps[order[k]], caps[order[k + 1]]
        if a["t1"] > b["t0"] - 0.04:
            a["t1"] = round(b["t0"] - 0.04, 2)
    for c in caps:
        c["t1"] = round(min(c["t1"], D - 0.02), 2)
    return caps, placed, speech


# ------------------------------------------------------------------ SFX (same synthesizer as v2/v3)
def synth(kind, d, level, ramp, seed):
    o = f"{TMP}/sfx-{kind}-{seed}-{d:.2f}-{level}.wav"
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
        # Episode 2
        "murmur": (f"anoisesrc=d={d}:c=pink:r={SR}:a=0.6:seed={seed}", f"bandpass=f=650:width_type=h:w=900,tremolo=f=3.7:d=0.5,tremolo=f=1.3:d=0.4,volume={0.28 * lv}"),
        "crackle": (f"anoisesrc=d={d}:c=white:r={SR}:a=0.6:seed={seed}", f"highpass=f=1500,tremolo=f=17:d=1,tremolo=f=7.3:d=1,tremolo=f=2.9:d=0.8,volume={0.14 * lv}"),
        "boil": (f"anoisesrc=d={d}:c=brown:r={SR}:a=0.8:seed={seed}", f"bandpass=f=420:width_type=h:w=500,tremolo=f=11:d=0.9,tremolo=f=4.1:d=0.5,volume={0.45 * lv}"),
        "hiss": (f"anoisesrc=d={d}:c=white:r={SR}:a=0.5:seed={seed}", f"highpass=f=3000,lowpass=f=9000,volume={0.05 * lv}"),
        "pour": (f"anoisesrc=d={d}:c=pink:r={SR}:a=0.6:seed={seed}", f"bandpass=f=1300:width_type=h:w=1500,tremolo=f=9:d=0.3,volume={0.30 * lv}"),
        "engine": (f"aevalsrc='0.30*sin(2*PI*41*t)*(0.65+0.35*sin(2*PI*6.5*t))+0.10*sin(2*PI*83*t)':d={d}:s={SR}", f"lowpass=f=420,volume={lv}"),
        "spin": (f"anoisesrc=d={d}:c=brown:r={SR}:a=0.9:seed={seed}", f"bandpass=f=260:width_type=h:w=300,tremolo=f=13:d=0.9,volume={0.9 * lv}"),
        # v4: the debris-laden surge — churning water, grinding wood, intermittent snaps
        "debris": (f"anoisesrc=d={d}:c=pink:r={SR}:a=0.7:seed={seed}", f"bandpass=f=900:width_type=h:w=1400,tremolo=f=7.3:d=0.8,tremolo=f=1.7:d=0.6,volume={0.55 * lv}"),
    }
    one_shots = {
        "crash": (f"anoisesrc=d=1.2:c=white:r={SR}:a=0.8:seed={seed}", f"highpass=f=1300,volume={1.1 * lv},afade=t=out:st=0.02:d=1.15:curve=exp"),
        "thud": (f"aevalsrc='0.9*sin(2*PI*58*t)*exp(-9*t)':d=0.7:s={SR}", f"volume={lv}"),
        "click": (f"anoisesrc=d=0.04:c=white:r={SR}:a=0.6:seed={seed}", "highpass=f=2500,afade=t=out:st=0:d=0.04"),
        "thunk": (f"aevalsrc='0.9*sin(2*PI*52*t)*exp(-7*t)+0.25*sin(2*PI*140*t)*exp(-20*t)':d=0.9:s={SR}", "anull"),
        "door": (f"aevalsrc='0.10*sin(2*PI*(280+160*t)*t)*lt(t,0.55)+0.6*sin(2*PI*70*(t-0.55))*exp(-12*(t-0.55))*gt(t,0.55)':d=1.0:s={SR}", "lowpass=f=1800"),
        "horn": (f"aevalsrc='0.16*(sin(2*PI*415*t)+sin(2*PI*522*t))*lt(t,0.42)':d=0.5:s={SR}", "lowpass=f=2500,afade=t=out:st=0.36:d=0.06"),
        "pop": (f"aevalsrc='0.5*sin(2*PI*240*t)*exp(-14*t)':d=0.5:s={SR}", "anull"),
        "spark": (f"anoisesrc=d=0.3:c=white:r={SR}:a=0.9:seed={seed}", f"bandpass=f=4200:width_type=h:w=3000,tremolo=f=60:d=1,volume={0.9 * lv},afade=t=out:st=0.02:d=0.27:curve=exp"),
        "scrape": (f"aevalsrc='0.25*sin(2*PI*(170+70*sin(2*PI*9*t))*t)*(0.5+0.5*sin(2*PI*23*t))':d=0.55:s={SR}", f"highpass=f=250,lowpass=f=2600,volume={lv},afade=t=out:st=0.4:d=0.15"),
        # v4: a big low impact (wave hitting the town) and a wood snap
        "impact": (f"aevalsrc='0.95*sin(2*PI*41*t)*exp(-2.2*t)+0.5*sin(2*PI*63*t)*exp(-3.5*t)':d=2.6:s={SR}", f"volume={lv}"),
        "snap": (f"anoisesrc=d=0.35:c=white:r={SR}:a=0.8:seed={seed}", f"bandpass=f=1600:width_type=h:w=2200,volume={0.9 * lv},afade=t=out:st=0.01:d=0.33:curve=exp"),
    }
    if kind in srcs:
        src, flt = srcs[kind]
        ff(["-f", "lavfi", "-i", src, "-af", f"{fade_in}{flt},afade=t=out:st={max(0, d - 0.35):.2f}:d=0.35,aresample={SR}", "-ac", "1", "-t", f"{d}", o])
    else:
        src, flt = one_shots[kind]
        ff(["-f", "lavfi", "-i", src, "-af", f"{flt},aresample={SR}", "-ac", "1", o])
    return o


def mix(items, total, out, lufs):
    """items: [(path, start_s, gain)] → stereo SR mp3 of length total."""
    args, chains = [], []
    for i, (p, st, g) in enumerate(items):
        args += ["-i", p]
        ms = int(round(st * 1000))
        chains.append(f"[{i}]volume={g},adelay={ms}|{ms},apad=whole_dur={total}[a{i}]")
    graph = ";".join(chains) + ";" + "".join(f"[a{i}]" for i in range(len(items))) + f"amix=inputs={len(items)}:normalize=0:dropout_transition=0,loudnorm=I={lufs}:TP=-2:LRA=14,aresample={SR},atrim=0:{total},aformat=channel_layouts=stereo[out]"
    script = f"{TMP}/graph.txt"
    open(script, "w").write(graph)
    codec = ["-c:a", "pcm_s16le"] if out.endswith(".wav") else ["-c:a", "libmp3lame", "-b:a", "192k"]
    ff(args + ["-filter_complex_script", script, "-map", "[out]", "-ar", f"{SR}", "-t", f"{total}", *codec, out])


# ------------------------------------------------------------------ build
# TikTok split (v3): cut a scene right before caption index k+1 (part N ends on caption k)
SPLITS = {"s06": 1, "s10": 4, "s14": 1}
FPS = 30
takes, split_report = {}, []
for b in BLOCKS:
    segs, s0, s1, diag = split_take(b)
    takes[b["id"]] = (segs, s0, s1)
    split_report.append(f"| {b['id']} | {len(b['lines'])} | {s1 - s0:.2f}s | " + " · ".join(f"{a:.2f}–{z:.2f}" for a, z in segs) + " | " + " ".join(str(c) for c in diag) + " |")

report = ["# Episode 2 — audio report (v3)", "",
          "Voices: ElevenLabs v4 via Higgsfield, voiced as whole multi-speaker exchanges. Cast: "
          + ", ".join(f"{k} = {v['name']}" for k, v in cfg["cast"].items()) + ".",
          "v3: s13 re-voiced (water-heater steps), 1.9 s cold open, one episode-long mix cut into the new TikTok parts.", "",
          "## Lines", "", "| Scene | # | Speaker | Line | Script cue | Start | End | Tempo |", "|---|---|---|---|---|---|---|---|"]
scenes = [s for p in ep["parts"] for s in p["scenes"]]
planned, speech_all, vo_items, sfx_items, t = [], {}, [], [], 0.0
for si, s in enumerate(scenes):
    sid = s["id"]
    if "hookVO" in s:   # cold open: a slice of an existing take, caption fixed
        h = s["hookVO"]
        b = next(x for x in BLOCKS if x["id"] == h["block"])
        wav = cut(b, h["from"], h["to"], h["speaker"], 1.0, f"{sid}-hook")
        vo_items.append((wav, t + h["at"], 1.0))
        caps = copy.deepcopy(s["captions"])
        report.append(f"| {sid} | 1 | {h['speaker']} | {caps[0]['text']} | – | {h['at']:.2f}s | {h['at'] + h['to'] - h['from']:.2f}s | 1.00 |")
    else:
        nxt = scenes[si + 1] if si + 1 < len(scenes) else None
        spill = max(0.0, min(3.0, nxt["captions"][0]["t0"] - 0.6)) if nxt and nxt["captions"] and nxt["id"] == "s02" else 0.0
        caps, placed, speech = plan_scene(s, takes, spill)
        speech_all[sid] = speech
        for pl in placed:
            l = pl["line"]
            wav = cut(pl["block"], pl["a"], pl["z"], l["speaker"], pl["tempo"], f"{sid}-{l['cap']:02d}")
            vo_items.append((wav, t + pl["start"], 1.0))
            report.append(f"| {sid} | {l['cap'] + 1} | {l['speaker']} | {l['text']} | {s['captions'][l['cap']]['t0']:.1f}s | {pl['start']:.2f}s | {pl['end']:.2f}s | {pl['tempo']:.2f} |")
    amb = cfg["ambience"].get(sid)
    if amb:
        sfx_items.append((synth(amb, s["duration"] + 0.3, 1.0, 0.3, seed_of(sid, amb)), t, 1.0))
    for j, e in enumerate(cfg["sfx"].get(sid, [])):
        sfx_items.append((synth(e["type"], e.get("d", 1.0), e.get("level", 1.0), e.get("rampIn"), seed_of(sid, j, e["type"])), t + e["t"], 1.0))
    planned.append(dict(s, captions=caps))
    t += s["duration"]
EP = round(t, 3)
vo_wav, sfx_wav = f"{TMP}/ep-vo.wav", f"{TMP}/ep-sfx.wav"
mix(vo_items, EP, vo_wav, -16)
mix(sfx_items, EP, sfx_wav, -28)

# ---- segments: split scenes at frame-aligned caption boundaries
def seg_entry(s, sid, a, b, caps, file, comp):
    return {"id": sid, "title": s["title"], "bg": s["bg"], "bgOpts": s.get("bgOpts", {}), "duration": round(b - a, 4),
            "action": s.get("action", ""), "start": s.get("start", ""), "end": s.get("end", ""), "captions": caps,
            "file": file, "compId": comp, "source": s["id"], "sourceFrom": round(a, 4)}
slug = lambda x: re.sub(r"(^-|-$)", "", re.sub(r"[^a-z0-9]+", "-", x.lower()))
flat = []
for s in planned:
    f3 = s.get("file") or f"compositions/ep02/scenes/ep02-{s['id']}-{slug(s['title'])}-v3.html"
    if s["id"] in SPLITS:
        k = SPLITS[s["id"]]
        X = round(math.floor((s["captions"][k + 1]["t0"] - 0.02) * FPS) / FPS, 4)   # cut just before caption k+1
        ca = [dict(c, t1=min(c["t1"], X)) for c in s["captions"] if c["t0"] < X]
        cb = [dict(c, t0=round(c["t0"] - X, 2), t1=round(c["t1"] - X, 2)) for c in s["captions"] if c["t0"] >= X]
        assert all(c["t1"] <= X for c in ca), s["id"]
        flat.append(seg_entry(s, s["id"] + "a", 0, X, ca, f"compositions/ep02/scenes/ep02-{s['id']}a-{slug(s['title'])}-v3.html", f"ep02-{s['id']}a"))
        flat.append(seg_entry(s, s["id"] + "b", X, s["duration"], cb, f"compositions/ep02/scenes/ep02-{s['id']}b-{slug(s['title'])}-v3.html", f"ep02-{s['id']}b"))
    else:
        flat.append(dict(s, file=f3, compId=s.get("compId") or f"ep02-{s['id']}"))
ends = ["s06a", "s10a", "s14a", flat[-1]["id"]]
titles = ["The Morning After", "Water First", "Mine", "Down the Hill"]
parts, cur = [], []
for e in flat:
    cur.append(e)
    if e["id"] in ends:
        parts.append(cur); cur = []
ep3 = {k: v for k, v in ep.items() if k != "parts"}
ep3["version"] = 3
ep3["parts"] = []
t0 = 0.0
for n, ps in enumerate(parts, 1):
    dur = round(sum(e["duration"] for e in ps), 4)
    ep3["parts"].append({"part": n, "title": titles[n - 1], "hook": ps[-1]["captions"][-1]["text"] if ps[-1]["captions"] else "", "duration": dur, "scenes": ps})
    for kind, src in (("vo", vo_wav), ("sfx", sfx_wav)):
        out = os.path.join(ROOT, f"audio/ep02/{kind}/ep02-part{n}-{kind}-{V}.mp3")
        ff(["-i", src, "-af", f"atrim=start={t0}:end={t0 + dur},asetpts=PTS-STARTPTS", "-c:a", "libmp3lame", "-b:a", "192k", out])
    print(f"part {n}: {dur:.2f}s ({t0:.2f}–{t0 + dur:.2f}) ends on: {ep3['parts'][-1]['hook']}")
    t0 += dur
for kind, src in (("vo", vo_wav), ("sfx", sfx_wav)):
    ff(["-i", src, "-c:a", "libmp3lame", "-b:a", "192k", os.path.join(ROOT, f"audio/ep02/{kind}/ep02-full-{kind}-{V}.mp3")])
report += ["", "## Take splits", "", "| Take | Lines | Speech | Segments (take time) | Cuts |", "|---|---|---|---|---|"] + split_report
json.dump(ep3, open(os.path.join(ROOT, "episodes/ep02/ep02-scenes-v3.json"), "w"), indent=1, ensure_ascii=False)
json.dump(speech_all, open(os.path.join(ROOT, "episodes/ep02/ep02-speech-v3.json"), "w"), indent=1)
open(os.path.join(ROOT, f"audio/ep02/ep02-audio-report-{V}.md"), "w").write("\n".join(report) + "\n")
print(f"episode {EP}s")
shutil.rmtree(TMP, ignore_errors=True)
