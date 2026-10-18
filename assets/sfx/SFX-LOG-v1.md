# Rainy Day — SFX library log (v1)

Reusable sound effects for every episode, made by `tools/make-sfx-library-v1.py`. **All synthesized with ffmpeg** (noise generators + short oscillator bursts, fixed seeds, so they rebuild bit-for-bit). ElevenLabs sound effects were requested; they could not be used here: no direct ElevenLabs API key is configured, and the Higgsfield sound-effect model is limited to its game pipeline. No third-party samples, so no licensing questions.

Stereo 48 kHz MP3 192k; noise layers use different seeds per channel. Tonal parts are short bursts only (creaks < 1 s, horn beeps ≤ 1.1 s, ticks), never a sustained tone.

| File | Length | Description |
|---|---|---|
| `assets/sfx/rain-window-v1.mp3` | 20 s | Rain on a window: soft high patter + low body, loop-friendly (2 s fades). |
| `assets/sfx/cup-rattle-v1.mp3` | 3.0 s | Coffee cup rattling on a table: two irregular ceramic tick trains. |
| `assets/sfx/cup-rattle-v2.mp3` | 3.0 s | Coffee cup rattling (v2): noise-burst clicks instead of pitched ticks, so nothing rings (v1 failed the tonal check). |
| `assets/sfx/house-rumble-creak-v1.mp3` | 15 s | Earthquake: deep rumble with surges plus short wood creaks (each creak < 1 s). |
| `assets/sfx/glass-break-v1.mp3` | 2.5 s | Glass breaking: crack burst + scattered high tinkles. |
| `assets/sfx/power-out-click-v1.mp3` | 1.5 s | Power cut: hard relay click + a short falling electrical hum (0.8 s). |
| `assets/sfx/door-slam-v1.mp3` | 1.5 s | Door slam: low thump + wood crack + small frame rattle. |
| `assets/sfx/rain-outdoor-v1.mp3` | 20 s | Outdoor rain: broad hiss with body, loop-friendly. |
| `assets/sfx/car-horns-distant-v1.mp3` | 8 s | Distant car horns: short beeps (0.3-1.1 s) far away, with traffic hiss. |
| `assets/sfx/footsteps-mud-v1.mp3` | 8 s | Footsteps in mud at ~1.8 steps/s: soft squelch per step. |
| `assets/sfx/radio-static-crank-v1.mp3` | 6 s | Hand-crank radio: ratchet clicks while cranking (0-2.2 s), then crackling static. |
| `assets/sfx/wave-roar-distant-v1.mp3` | 10 s | Distant roaring wave: deep swelling surf rumble. |
| `assets/sfx/wave-crash-v1.mp3` | 6 s | Wave crashing close (cold open / the wave hits): impact + churning whitewater. |
| `assets/sfx/card-swish-v1.mp3` | 0.6 s | Card pop-in: a short soft paper swish (added for the Ep1 remake). |
| `assets/sfx/wind-hilltop-v1.mp3` | 15 s | Wind on a hilltop: slow gusts, no whistle. |
| `assets/sfx/crowd-murmur-v1.mp3` | 15 s | Crowd murmur: many voice-band noise streams modulated at syllable rates (no words). |

## Recipes (as prompts/specs)

### rain-window-v1

Layers (source → filter):

- `NOISE pink 1` → `highpass=f=1500,lowpass=f=8000,volume=0.55`
- `NOISE white 2` → `highpass=f=3500,lowpass=f=9000,tremolo=f=7.3:d=0.35,volume=0.25`
- `NOISE brown 3` → `lowpass=f=260,volume=0.5`

Master: `afade=t=in:d=2,afade=t=out:st=18:d=2` + `alimiter=limit=0.89`

### cup-rattle-v1

Layers (source → filter):

- `EVAL sin(2*PI*3150*t)*exp(-70*mod(t,0.047))*0.5` → `highpass=f=1200`
- `EVAL sin(2*PI*4420*t)*exp(-90*mod(t+0.013,0.061))*0.35` → `highpass=f=1200`
- `NOISE white 4` → `highpass=f=2500,volume=0.05`

Master: `afade=t=in:d=0.4,afade=t=out:st=2.5:d=0.5` + `alimiter=limit=0.89`

### cup-rattle-v2

Layers (source → filter):

- `EVAL (random(0)*2-1)*exp(-80*mod(t,0.047))*0.55` → `highpass=f=1800,lowpass=f=7000`
- `EVAL (random(1)*2-1)*exp(-95*mod(t+0.013,0.061))*0.4` → `highpass=f=2400,lowpass=f=8000`
- `EVAL (random(2)*2-1)*exp(-60*mod(t+0.031,0.083))*0.3` → `bandpass=f=900:width_type=h:w=700`

Master: `afade=t=in:d=0.4,afade=t=out:st=2.5:d=0.5` + `alimiter=limit=0.89`

### house-rumble-creak-v1

Layers (source → filter):

- `NOISE brown 5` → `lowpass=f=110,volume=3.2,tremolo=f=2.3:d=0.45`
- `NOISE brown 6` → `lowpass=f=420,volume=0.9,tremolo=f=5.1:d=0.6`
- `EVAL 0.35*sin(2*PI*(150+45*sin(2*PI*0.9*t))*t)*(lt(mod(t,3.7),0.7))*sin(PI*mod(t,3.7)/0.7)` → `aformat=channel_layouts=mono,acrusher=bits=6:mix=0.5,lowpass=f=1800,highpass=f=90`
- `EVAL 0.25*sin(2*PI*(210-50*sin(2*PI*0.6*t))*t)*(lt(mod(t+1.6,4.9),0.55))*sin(PI*mod(t+1.6,4.9)/0.55)` → `acrusher=bits=6:mix=0.5,lowpass=f=2200,highpass=f=120`

Master: `afade=t=in:d=1.2,afade=t=out:st=13.5:d=1.5` + `alimiter=limit=0.89`

### glass-break-v1

Layers (source → filter):

- `NOISE white 7` → `highpass=f=1800,volume=1.2,afade=t=out:st=0:d=0.35`
- `EVAL 0.3*sin(2*PI*5200*t)*exp(-14*t)+0.25*sin(2*PI*6900*(t-0.21))*exp(-18*(t-0.21))*gt(t,0.21)+0.22*sin(2*PI*4100*(t-0.38))*exp(-16*(t-0.38))*gt(t,0.38)+0.18*sin(2*PI*7800*(t-0.55))*exp(-20*(t-0.55))*gt(t,0.55)+0.15*sin(2*PI*5900*(t-0.83))*exp(-22*(t-0.83))*gt(t,0.83)+0.12*sin(2*PI*6600*(t-1.12))*exp(-25*(t-1.12))*gt(t,1.12)` → `anull`

Master: `afade=t=out:st=2:d=0.5` + `alimiter=limit=0.89`

### power-out-click-v1

Layers (source → filter):

- `EVAL 0.9*exp(-400*t)*sin(2*PI*1800*t)` → `highpass=f=600`
- `EVAL 0.25*sin(2*PI*(60*exp(-1.4*t))*t)*exp(-3.5*t)+0.12*sin(2*PI*(120*exp(-1.4*t))*t)*exp(-4*t)` → `anull`

Master: `afade=t=out:st=1.0:d=0.5` + `alimiter=limit=0.89`

### door-slam-v1

Layers (source → filter):

- `EVAL 0.9*sin(2*PI*68*t)*exp(-9*t)` → `anull`
- `NOISE pink 8` → `lowpass=f=2200,volume=1.4,afade=t=out:st=0:d=0.18`
- `EVAL 0.15*sin(2*PI*2400*t)*exp(-60*mod(t,0.033))*lt(t,0.3)` → `anull`

Master: `afade=t=out:st=1.1:d=0.4` + `alimiter=limit=0.89`

### rain-outdoor-v1

Layers (source → filter):

- `NOISE pink 9` → `highpass=f=300,lowpass=f=9000,volume=0.6`
- `NOISE white 10` → `highpass=f=5000,volume=0.12,tremolo=f=11:d=0.3`
- `NOISE brown 11` → `lowpass=f=400,volume=0.35`

Master: `afade=t=in:d=2,afade=t=out:st=18:d=2` + `alimiter=limit=0.89`

### car-horns-distant-v1

Layers (source → filter):

- `EVAL 0.22*(sin(2*PI*415*t)+0.5*sin(2*PI*830*t)+0.3*sin(2*PI*1245*t))*(between(t,0.4,1.5)+between(t,4.1,4.4)+between(t,4.6,4.9))` → `lowpass=f=1800`
- `EVAL 0.18*(sin(2*PI*349*t)+0.5*sin(2*PI*698*t)+0.3*sin(2*PI*1047*t))*(between(t,2.2,2.7)+between(t,6.0,7.1))` → `lowpass=f=1800`
- `NOISE brown 12` → `lowpass=f=700,volume=0.4`

Master: `aecho=0.8:0.5:120|260:0.35|0.2,afade=t=in:d=0.3,afade=t=out:st=7.4:d=0.6` + `alimiter=limit=0.89`

### footsteps-mud-v1

Layers (source → filter):

- `NOISE pink 13` → `lowpass=f=900,highpass=f=80,volume=2.2,tremolo=f=1.8:d=1`
- `EVAL 0.35*sin(2*PI*95*t)*exp(-28*mod(t,0.5556))` → `anull`

Master: `afade=t=in:d=0.2,afade=t=out:st=7.5:d=0.5` + `alimiter=limit=0.89`

### radio-static-crank-v1

Layers (source → filter):

- `EVAL 0.5*sin(2*PI*2600*t)*exp(-120*mod(t,0.083))*lt(t,2.2)` → `highpass=f=800`
- `NOISE white 14` → `bandpass=f=2200:width_type=h:w=2600,volume=0.55,tremolo=f=17:d=0.7`
- `NOISE velvet 15` → `highpass=f=1500,volume=0.3`

Master: `afade=t=in:st=1.6:d=0.6,afade=t=out:st=5.4:d=0.6` + `alimiter=limit=0.89`

### wave-roar-distant-v1

Layers (source → filter):

- `NOISE brown 16` → `lowpass=f=500,volume=2.2`
- `NOISE pink 17` → `lowpass=f=1600,highpass=f=200,volume=0.5,tremolo=f=0.35:d=0.6`

Master: `afade=t=in:d=2.5,afade=t=out:st=7:d=3` + `alimiter=limit=0.89`

### wave-crash-v1

Layers (source → filter):

- `NOISE brown 18` → `lowpass=f=300,volume=3.0,afade=t=in:d=0.08`
- `NOISE pink 19` → `highpass=f=400,lowpass=f=7000,volume=1.0,tremolo=f=3.1:d=0.5`
- `EVAL 0.8*sin(2*PI*48*t)*exp(-5*t)` → `anull`

Master: `afade=t=out:st=4:d=2` + `alimiter=limit=0.89`

### card-swish-v1

Layers (source → filter):

- `NOISE pink 26` → `highpass=f=700,lowpass=f=6000,volume=1.4,afade=t=in:d=0.12,afade=t=out:st=0.12:d=0.4`
- `EVAL 0.25*sin(2*PI*180*t)*exp(-30*t)` → `anull`

Master: `anull` + `alimiter=limit=0.89`

### wind-hilltop-v1

Layers (source → filter):

- `NOISE pink 20` → `lowpass=f=1100,highpass=f=60,volume=1.1,tremolo=f=0.17:d=0.7`
- `NOISE brown 21` → `lowpass=f=300,volume=0.7,tremolo=f=0.23:d=0.6`

Master: `afade=t=in:d=2,afade=t=out:st=13:d=2` + `alimiter=limit=0.89`

### crowd-murmur-v1

Layers (source → filter):

- `NOISE pink 22` → `bandpass=f=500:width_type=h:w=500,tremolo=f=4.3:d=0.8,volume=1.3`
- `NOISE pink 23` → `bandpass=f=900:width_type=h:w=700,tremolo=f=5.7:d=0.8,volume=1.0`
- `NOISE pink 24` → `bandpass=f=1400:width_type=h:w=900,tremolo=f=3.6:d=0.8,volume=0.7`
- `NOISE pink 25` → `bandpass=f=650:width_type=h:w=400,tremolo=f=6.4:d=0.9,volume=0.9`

Master: `afade=t=in:d=2,afade=t=out:st=13:d=2` + `alimiter=limit=0.89`
