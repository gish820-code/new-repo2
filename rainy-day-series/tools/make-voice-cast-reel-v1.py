#!/usr/bin/env python3
"""Rainy Day — voice cast reel (v1). Concatenates the per-character takes in audio/voice-cast/takes/ (each take = the
narrator announcing the character's name, then that character's voice-sample line from docs/series-bible-v3.md, voiced
as one two-turn ElevenLabs v4 take via Higgsfield; job IDs in audio/voice-cast/reel-urls-v1.tsv) into
audio/voice-cast/cast-reel-v1.mp3, with the registry's per-character processing (the radio filter on the radio's turn,
docs/voice-cast-v1.md) and ~0.7 s between entries. Loudness -16 LUFS (a review file, not a mastered episode)."""
import os, subprocess, glob, tempfile
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, "audio/voice-cast")
RADIO = "highpass=f=380,lowpass=f=2700,acompressor=threshold=0.08:ratio=6:attack=5:release=60,volume=1.6,volume=-2dB"
TMP = tempfile.mkdtemp()

def run(c):
    subprocess.run(c, check=True, capture_output=True)

def first_pause(path):
    """end of the narrator's name: the first pause >= 0.2 s after speech starts."""
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout
    x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
    e = 20 * np.log10(np.sqrt(np.mean(x[: len(x) // 160 * 160].reshape(-1, 160) ** 2, 1)) + 1e-9)
    v = e > e.max() - 35
    i = int(np.argmax(v))
    while i < len(v) and v[i]: i += 1
    j = i
    while j < len(v) and not v[j]: j += 1
    while j - i < 20 and j < len(v):          # skip tiny gaps inside the name
        i = j
        while i < len(v) and v[i]: i += 1
        j = i
        while j < len(v) and not v[j]: j += 1
    return (i + j) / 2 / 100

parts = []
for k, f in enumerate(sorted(glob.glob(os.path.join(D, "takes/*-v1.mp3")))):
    o = f"{TMP}/{k:02d}.wav"
    if "-radio-" in f:
        cut = first_pause(f)
        a, b = f"{TMP}/a.wav", f"{TMP}/b.wav"
        run(["ffmpeg", "-y", "-i", f, "-t", f"{cut}", "-ar", "48000", "-ac", "1", a])
        run(["ffmpeg", "-y", "-ss", f"{cut}", "-i", f, "-af", RADIO, "-ar", "48000", "-ac", "1", b])
        run(["ffmpeg", "-y", "-i", a, "-i", b, "-filter_complex", "[0][1]concat=n=2:v=0:a=1", "-ar", "48000", "-ac", "1", o])
    else:
        run(["ffmpeg", "-y", "-i", f, "-ar", "48000", "-ac", "1", o])
    parts.append(o)
sil = f"{TMP}/sil.wav"
run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=mono", "-t", "0.7", sil])
lst = f"{TMP}/list.txt"
open(lst, "w").write("".join(f"file '{p}'\nfile '{sil}'\n" for p in parts))
run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-af", "loudnorm=I=-16:TP=-2:LRA=11", "-ar", "48000", "-ac", "2",
     "-c:a", "libmp3lame", "-b:a", "192k", os.path.join(D, "cast-reel-v1.mp3")])
print("wrote audio/voice-cast/cast-reel-v1.mp3")
