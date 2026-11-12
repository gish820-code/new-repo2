# Rainy Day — SFX library log, Episode 5 additions (v1)

Made by `tools/make-sfx-ep05-v1.py` with the same ffmpeg synthesis method as `SFX-LOG-v1.md` (fixed seeds, stereo, 48 kHz MP3 192k, never overwritten). Tonal parts are short bursts only (the whistle blasts are 0.45 s each).

| File | Length | Description |
|---|---|---|
| `assets/sfx/creek-trickle-v1.mp3` | 20 s | Ravine creek reduced to a trickle: thin bright water babble over stones, no roar (Ep 5 s07–s08). |
| `assets/sfx/gorge-wind-v1.mp3` | 20 s | Wind through the Gull Creek gorge: hollow low gusts with an airy top, no whistle (Ep 5 s09–s10). |
| `assets/sfx/mud-squelch-v1.mp3` | 8 s | Boots in deep tidal mud: a slow suck-and-pull every ~1.1 s (Ep 5 s11). |
| `assets/sfx/dry-day-insects-v1.mp3` | 20 s | Hot dry afternoon: a broad insect/grasshopper rasp (noise buzz, not a tone) + warm still air (Ep 5 sunny camp). |
| `assets/sfx/night-forest-v1.mp3` | 20 s | Night forest: hushed air in the firs, sparse short cricket chirps (noise bursts), an occasional twig (Ep 5 s17). |
| `assets/sfx/whistle-blasts-far-v1.mp3` | 4.2 s | Three whistle blasts far off in the trees (distress signal): 0.45 s each, muffled by distance, short echo (Ep 5 s17). |

## Recipes (ffmpeg filter graphs)

### creek-trickle-v1

```
[0:a]aformat=sample_rates=48000:channel_layouts=mono,highpass=f=1400,lowpass=f=6500,tremolo=f=7.3:d=0.6,tremolo=f=13.1:d=0.45,volume=0.35,apad=whole_dur=20[l0];[1:a]aformat=sample_rates=48000:channel_layouts=mono,bandpass=f=900:width_type=h:w=900,tremolo=f=4.7:d=0.7,volume=0.35,apad=whole_dur=20[l1];[2:a]aformat=sample_rates=48000:channel_layouts=mono,bandpass=f=2400:width_type=h:w=2600,apad=whole_dur=20[l2];[3:a]aformat=sample_rates=48000:channel_layouts=mono,highpass=f=1400,lowpass=f=6500,tremolo=f=7.3:d=0.6,tremolo=f=13.1:d=0.45,volume=0.35,apad=whole_dur=20[l3];[4:a]aformat=sample_rates=48000:channel_layouts=mono,bandpass=f=900:width_type=h:w=900,tremolo=f=4.7:d=0.7,volume=0.35,apad=whole_dur=20[l4];[5:a]aformat=sample_rates=48000:channel_layouts=mono,bandpass=f=2400:width_type=h:w=2600,apad=whole_dur=20[l5];[l0][l1][l2]amix=inputs=3:normalize=0[L];[l3][l4][l5]amix=inputs=3:normalize=0[R];[L][R]join=inputs=2:channel_layout=stereo,afade=t=in:d=2,afade=t=out:st=18:d=2,atrim=0:20,alimiter=limit=0.89[out]
```

### gorge-wind-v1

```
[0:a]aformat=sample_rates=48000:channel_layouts=mono,lowpass=f=420,volume=2.4,tremolo=f=0.13:d=0.75,apad=whole_dur=20[l0];[1:a]aformat=sample_rates=48000:channel_layouts=mono,bandpass=f=700:width_type=h:w=1100,volume=0.7,tremolo=f=0.21:d=0.8,apad=whole_dur=20[l1];[2:a]aformat=sample_rates=48000:channel_layouts=mono,highpass=f=3000,lowpass=f=8000,volume=0.07,tremolo=f=0.31:d=0.9,apad=whole_dur=20[l2];[3:a]aformat=sample_rates=48000:channel_layouts=mono,lowpass=f=420,volume=2.4,tremolo=f=0.13:d=0.75,apad=whole_dur=20[l3];[4:a]aformat=sample_rates=48000:channel_layouts=mono,bandpass=f=700:width_type=h:w=1100,volume=0.7,tremolo=f=0.21:d=0.8,apad=whole_dur=20[l4];[5:a]aformat=sample_rates=48000:channel_layouts=mono,highpass=f=3000,lowpass=f=8000,volume=0.07,tremolo=f=0.31:d=0.9,apad=whole_dur=20[l5];[l0][l1][l2]amix=inputs=3:normalize=0[L];[l3][l4][l5]amix=inputs=3:normalize=0[R];[L][R]join=inputs=2:channel_layout=stereo,afade=t=in:d=2,afade=t=out:st=18:d=2,atrim=0:20,alimiter=limit=0.89[out]
```

### mud-squelch-v1

```
[0:a]aformat=sample_rates=48000:channel_layouts=mono,lowpass=f=700,highpass=f=70,apad=whole_dur=8[l0];[1:a]aformat=sample_rates=48000:channel_layouts=mono,bandpass=f=1300:width_type=h:w=900,apad=whole_dur=8[l1];[2:a]aformat=sample_rates=48000:channel_layouts=mono,lowpass=f=700,highpass=f=70,apad=whole_dur=8[l2];[3:a]aformat=sample_rates=48000:channel_layouts=mono,bandpass=f=1300:width_type=h:w=900,apad=whole_dur=8[l3];[l0][l1]amix=inputs=2:normalize=0[L];[l2][l3]amix=inputs=2:normalize=0[R];[L][R]join=inputs=2:channel_layout=stereo,afade=t=in:d=0.2,afade=t=out:st=7.4:d=0.6,atrim=0:8,alimiter=limit=0.89[out]
```

### dry-day-insects-v1

```
[0:a]aformat=sample_rates=48000:channel_layouts=mono,bandpass=f=5200:width_type=h:w=3000,tremolo=f=31:d=0.85,tremolo=f=0.23:d=0.7,volume=0.32,apad=whole_dur=20[l0];[1:a]aformat=sample_rates=48000:channel_layouts=mono,bandpass=f=3900:width_type=h:w=2400,tremolo=f=23:d=0.8,tremolo=f=0.17:d=0.8,volume=0.22,apad=whole_dur=20[l1];[2:a]aformat=sample_rates=48000:channel_layouts=mono,lowpass=f=600,volume=0.25,apad=whole_dur=20[l2];[3:a]aformat=sample_rates=48000:channel_layouts=mono,bandpass=f=5200:width_type=h:w=3000,tremolo=f=31:d=0.85,tremolo=f=0.23:d=0.7,volume=0.32,apad=whole_dur=20[l3];[4:a]aformat=sample_rates=48000:channel_layouts=mono,bandpass=f=3900:width_type=h:w=2400,tremolo=f=23:d=0.8,tremolo=f=0.17:d=0.8,volume=0.22,apad=whole_dur=20[l4];[5:a]aformat=sample_rates=48000:channel_layouts=mono,lowpass=f=600,volume=0.25,apad=whole_dur=20[l5];[l0][l1][l2]amix=inputs=3:normalize=0[L];[l3][l4][l5]amix=inputs=3:normalize=0[R];[L][R]join=inputs=2:channel_layout=stereo,afade=t=in:d=2,afade=t=out:st=18:d=2,atrim=0:20,alimiter=limit=0.89[out]
```

### night-forest-v1

```
[0:a]aformat=sample_rates=48000:channel_layouts=mono,lowpass=f=650,highpass=f=60,volume=0.6,tremolo=f=0.11:d=0.5,apad=whole_dur=20[l0];[1:a]aformat=sample_rates=48000:channel_layouts=mono,bandpass=f=4600:width_type=h:w=1400,apad=whole_dur=20[l1];[2:a]aformat=sample_rates=48000:channel_layouts=mono,bandpass=f=1800:width_type=h:w=1600,apad=whole_dur=20[l2];[3:a]aformat=sample_rates=48000:channel_layouts=mono,lowpass=f=650,highpass=f=60,volume=0.6,tremolo=f=0.11:d=0.5,apad=whole_dur=20[l3];[4:a]aformat=sample_rates=48000:channel_layouts=mono,bandpass=f=4600:width_type=h:w=1400,apad=whole_dur=20[l4];[5:a]aformat=sample_rates=48000:channel_layouts=mono,bandpass=f=1800:width_type=h:w=1600,apad=whole_dur=20[l5];[l0][l1][l2]amix=inputs=3:normalize=0[L];[l3][l4][l5]amix=inputs=3:normalize=0[R];[L][R]join=inputs=2:channel_layout=stereo,afade=t=in:d=2,afade=t=out:st=18:d=2,atrim=0:20,alimiter=limit=0.89[out]
```

### whistle-blasts-far-v1

```
[0:a]aformat=sample_rates=48000:channel_layouts=mono,lowpass=f=3600,highpass=f=900,apad=whole_dur=4.2[l0];[1:a]aformat=sample_rates=48000:channel_layouts=mono,lowpass=f=500,volume=0.15,apad=whole_dur=4.2[l1];[2:a]aformat=sample_rates=48000:channel_layouts=mono,lowpass=f=3600,highpass=f=900,apad=whole_dur=4.2[l2];[3:a]aformat=sample_rates=48000:channel_layouts=mono,lowpass=f=500,volume=0.15,apad=whole_dur=4.2[l3];[l0][l1]amix=inputs=2:normalize=0[L];[l2][l3]amix=inputs=2:normalize=0[R];[L][R]join=inputs=2:channel_layout=stereo,aecho=0.7:0.6:180|420:0.35|0.18,afade=t=out:st=3.6:d=0.6,atrim=0:4.2,alimiter=limit=0.89[out]
```
