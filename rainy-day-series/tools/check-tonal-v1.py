#!/usr/bin/env python3
"""Spectrum check for sustained tonal ringing (v1).

Flags any narrow frequency peak that stands > PROM dB above its local spectral neighbourhood continuously for more
than MIN_S seconds (a hum, whine, feedback or a stuck oscillator). Speech pitch moves, so voices do not trip it;
short tonal SFX (creaks, beeps < 1.5 s) do not either.
Usage: python3 tools/check-tonal-v1.py <audio-or-video> [more ...]
"""
import subprocess, sys
import numpy as np

SR, NFFT, HOP = 24000, 4096, 2048
PROM, MIN_S, FMIN, FMAX = 12.0, 1.5, 40.0, 11000.0


def analyse(path):
    raw = subprocess.check_output(["ffmpeg", "-nostdin", "-v", "error", "-i", path, "-vn", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"])
    x = np.frombuffer(raw, np.float32)
    win = np.hanning(NFFT)
    frames = (len(x) - NFFT) // HOP
    freqs = np.fft.rfftfreq(NFFT, 1 / SR)
    band = (freqs >= FMIN) & (freqs <= FMAX)
    idx = np.where(band)[0]
    run = np.zeros(len(freqs), int)
    worst = {}
    k = 15  # neighbourhood half-width in bins (~88 Hz)
    for i in range(frames):
        seg = x[i * HOP:i * HOP + NFFT] * win
        if np.sqrt(np.mean(seg ** 2)) < 1e-4:
            run[:] = 0
            continue
        mag = 20 * np.log10(np.abs(np.fft.rfft(seg)) + 1e-9)
        # local median via a sliding window
        pad = np.pad(mag, k, mode="edge")
        win_view = np.lib.stride_tricks.sliding_window_view(pad, 2 * k + 1)
        med = np.median(win_view, axis=1)
        peak = (mag - med > PROM) & band
        peak &= (mag >= np.roll(mag, 1)) & (mag >= np.roll(mag, -1))
        # allow the peak to wander by one bin between frames
        p2 = peak | np.roll(peak, 1) | np.roll(peak, -1)
        run = np.where(p2, run + 1, 0)
        for b in idx[run[idx] * HOP / SR > MIN_S]:
            t = i * HOP / SR
            f = round(freqs[b], 0)
            dur = run[b] * HOP / SR
            if f not in worst or dur > worst[f][1]:
                worst[f] = (t - dur, dur)
    return worst


def main():
    bad = False
    for p in sys.argv[1:]:
        w = analyse(p)
        if not w:
            print(f"{p}: OK — no tonal component held > {MIN_S}s at > {PROM} dB prominence")
        else:
            bad = True
            # merge neighbouring bins
            items = sorted(w.items())
            print(f"{p}: {len(items)} sustained tonal bins:")
            for f, (t0, d) in items[:20]:
                print(f"  {f:7.0f} Hz  from {t0:7.2f}s for {d:5.2f}s")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
