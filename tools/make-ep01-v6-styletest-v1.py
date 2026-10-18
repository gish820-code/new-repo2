#!/usr/bin/env python3
"""Rainy Day: Cascadia — Episode 1 remake (v6), Phase A art-style test (v1).

Builds ONE HyperFrames composition with 8 one-second frames and snapshots them to PNG:
  0-3  style A-D kitchen still: the generated empty kitchen background (assets/ep01-v6/bg/kitchen-style-X-v1.png,
       cover-fit to 1920x1080) + the SAME vector Drizzle from the series rig (assets/characters/rainy-day-rig-v4.js):
       identical pose, scale and position in all four.
  4-7  style A-D "DAY 0 · 10:42 AM" day/time card: the plain dark-gray resource-card format (one simple icon + big
       hand-lettered text) over a darkened, blurred plate of the same background, card edges/texture styled per option.
Outputs (review/ep01-v6/): style-X-kitchen-v1.png, style-X-card-v1.png, style-compare-v1.png (2x2, labeled A-D).
The build project lives in the session scratch dir (it only holds copies); this script is the source of truth.
Usage: python3 tools/make-ep01-v6-styletest-v1.py <build-dir>
"""
import os, shutil, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.abspath(sys.argv[1])
OUT = os.path.join(ROOT, "review/ep01-v6")
STYLES = ["A", "B", "C", "D"]
NAMES = {"A": "Painterly semi-realistic", "B": "Ink + watercolor wash", "C": "Gouache storybook", "D": "Cinematic matte painting"}

# ---- Drizzle: one placement for every style (hip x/y, scale; ground line = y + 116*scale = 1000)
DRIZZLE = {"x": 900, "scale": 1.6, "facing": 1, "pose": "idle", "face": "smile"}
DRIZZLE["y"] = 1000 - 116 * DRIZZLE["scale"]

# ---- card styling per option (same layout, same text, same icon; only the treatment changes)
CARD_CSS = {
    # painterly: soft brushed edge (turbulence-displaced), soft drop shadow, faint brush texture
    "A": ".card{background:#2C3138;border-radius:10px;filter:url(#rough-soft) drop-shadow(0 18px 30px rgba(0,0,0,.55));}"
         ".card .tex{opacity:.18;background:repeating-linear-gradient(100deg,rgba(255,255,255,.08) 0 3px,transparent 3px 11px);}",
    # ink + watercolor: inked double outline, crosshatched shadow, wash that bleeds past the line
    "B": ".card{background:#33373D;border:5px solid #0E1116;border-radius:4px;box-shadow:16px 16px 0 -2px rgba(14,17,22,.0);filter:url(#rough-ink);}"
         ".card .tex{opacity:.35;background:radial-gradient(ellipse at 30% 20%,rgba(140,155,175,.35),transparent 60%),radial-gradient(ellipse at 80% 90%,rgba(20,24,30,.5),transparent 55%);}"
         ".card .ink2{position:absolute;inset:10px;border:2px solid rgba(14,17,22,.8);border-radius:2px;}"
         ".hatch{position:absolute;left:22px;top:22px;width:100%;height:100%;z-index:0;background:repeating-linear-gradient(45deg,#0E1116 0 2px,transparent 2px 9px);opacity:.8;}",
    # gouache: big soft radius, matte warm-gray, dry-brush grain at the edge
    "C": ".card{background:#3A3B40;border-radius:44px;filter:url(#rough-dry) drop-shadow(0 10px 0 rgba(20,22,28,.45));}"
         ".card .tex{opacity:.5;background:radial-gradient(circle at 20% 15%,rgba(255,255,255,.07),transparent 50%);mix-blend-mode:screen;}",
    # cinematic: crisp slate glass card, hairline border, soft glow, film grain
    "D": ".card{background:linear-gradient(180deg,rgba(40,46,56,.92),rgba(22,26,33,.94));border:2px solid rgba(195,205,216,.35);border-radius:6px;"
         "box-shadow:0 30px 80px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.12);}",
}
CARD_FONT = {"A": "'Kalam'", "B": "'Kalam'", "C": "'Kalam'", "D": "'League Gothic'"}
CARD_SIZE = {"A": 118, "B": 118, "C": 118, "D": 180}
CARD_SPACING = {"A": "0.01em", "B": "0.01em", "C": "0.01em", "D": "0.06em"}
PLATE = {"A": "blur(6px) brightness(.45) saturate(.6)", "B": "blur(5px) brightness(.5) saturate(.5)",
         "C": "blur(7px) brightness(.5) saturate(.6)", "D": "blur(10px) brightness(.35) saturate(.5)"}


def clock_icon(stroke):
    # simple clock icon, hands at 10:42 (hour 10 + 42/60 -> 321 deg; minute 42 -> 252 deg)
    return (f'<svg class="icon" viewBox="-60 -60 120 120" width="190" height="190">'
            f'<circle r="50" fill="none" stroke="{stroke}" stroke-width="9"/>'
            f'<line x1="0" y1="0" x2="0" y2="-27" stroke="{stroke}" stroke-width="9" stroke-linecap="round" transform="rotate(321)"/>'
            f'<line x1="0" y1="0" x2="0" y2="-39" stroke="{stroke}" stroke-width="6" stroke-linecap="round" transform="rotate(252)"/>'
            f'<circle r="6" fill="{stroke}"/></svg>')


def main():
    if os.path.exists(BUILD):
        shutil.rmtree(BUILD)
    os.makedirs(os.path.join(BUILD, "bg"))
    os.makedirs(os.path.join(BUILD, "assets/vendor"))
    os.makedirs(os.path.join(BUILD, "assets/fonts"))
    shutil.copy(os.path.join(ROOT, "assets/vendor/gsap.min.js"), os.path.join(BUILD, "assets/vendor/"))
    for f in ("Kalam-Bold.woff2", "Kalam-Regular.woff2"):
        shutil.copy(os.path.join(ROOT, "assets/fonts", f), os.path.join(BUILD, "assets/fonts/"))
    for s in STYLES:  # cover-fit 2752x1536 -> 1920x1080
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(ROOT, f"assets/ep01-v6/bg/kitchen-style-{s}-v1.png"),
                        "-vf", "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080", "-q:v", "2",
                        os.path.join(BUILD, f"bg/kitchen-{s}.jpg")], check=True)
    rig = open(os.path.join(ROOT, "assets/characters/rainy-day-rig-v4.js")).read()

    clips = []
    for i, s in enumerate(STYLES):
        clips.append(f'''    <div id="k{s}" class="clip frame" data-start="{i}" data-duration="1" data-track-index="0">
      <img class="bg" src="bg/kitchen-{s}.jpg" alt="">
      <svg id="k{s}-svg" class="stage" viewBox="0 0 1920 1080" width="1920" height="1080" xmlns="http://www.w3.org/2000/svg"></svg>
    </div>''')
    for i, s in enumerate(STYLES):
        ink = "#E6EAEE"
        hatch = '<div class="hatch"></div>' if s == "B" else ""
        ink2 = '<div class="ink2"></div>' if s == "B" else ""
        clips.append(f'''    <div id="c{s}" class="clip frame card-frame card-{s}" data-start="{4 + i}" data-duration="1" data-track-index="0">
      <img class="bg plate" src="bg/kitchen-{s}.jpg" alt="" style="filter:{PLATE[s]}">
      <div class="card-wrap">{hatch}<div class="card"><div class="tex"></div>{ink2}
        {clock_icon(ink)}
        <div class="txt" style="font-family:{CARD_FONT[s]};font-size:{CARD_SIZE[s]}px;letter-spacing:{CARD_SPACING[s]}">DAY 0 <span class="dot">·</span> 10:42 AM</div>
      </div></div>
    </div>''')

    # scope each style's rules under .card-X
    scoped = []
    for s, r in CARD_CSS.items():
        for rule in r.split("}"):
            if rule.strip():
                scoped.append(f".card-{s} {rule.strip()}}}")
    html = f'''<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <script src="assets/vendor/gsap.min.js"></script>
    <style>
      @font-face {{ font-family: "Kalam"; src: url("assets/fonts/Kalam-Bold.woff2") format("woff2"); font-weight: 700; }}
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ width: 1920px; height: 1080px; overflow: hidden; background: #141B26; }}
      #root {{ position: relative; width: 1920px; height: 1080px; overflow: hidden; background: #141B26; }}
      .frame {{ position: absolute; inset: 0; overflow: hidden; }}
      .bg {{ position: absolute; inset: 0; width: 1920px; height: 1080px; object-fit: cover; }}
      .plate {{ transform: scale(1.06); }}
      .stage {{ position: absolute; inset: 0; }}
      .card-wrap {{ position: absolute; left: 260px; top: 300px; width: 1400px; height: 480px; }}
      .card {{ position: relative; z-index: 1; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; gap: 44px; padding: 0 60px; overflow: hidden; }}
      .card .tex {{ position: absolute; inset: 0; pointer-events: none; }}
      .card .icon {{ position: relative; flex: none; }}
      .card .txt {{ position: relative; color: #E6EAEE; font-weight: 700; line-height: 1; white-space: nowrap; }}
      .card .dot {{ color: #8FA0B4; }}
{chr(10).join("      " + r for r in scoped)}
    </style>
  </head>
  <body>
    <svg width="0" height="0" style="position:absolute">
      <filter id="rough-soft"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="3"/><feDisplacementMap in="SourceGraphic" scale="14"/></filter>
      <filter id="rough-ink"><feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="6"/></filter>
      <filter id="rough-dry"><feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="4" seed="11"/><feDisplacementMap in="SourceGraphic" scale="10"/></filter>
    </svg>
    <!-- Rainy Day: Cascadia · Ep1 v6 · Phase A style test v1 — generated by tools/make-ep01-v6-styletest-v1.py -->
    <div id="root" data-composition-id="ep01v6-styletest" data-start="0" data-duration="8" data-width="1920" data-height="1080">
{chr(10).join(clips)}
    </div>
    <script>
{rig}
      const RD = window.RainyDay;
      const D = {DRIZZLE};
      for (const s of ["A", "B", "C", "D"]) {{
        const svg = document.getElementById("k" + s + "-svg");
        RD.figure(svg, {{ character: "drizzle", x: D.x, y: D.y, scale: D.scale, facing: D.facing, pose: D.pose, face: D.face }});
      }}
      const tl = gsap.timeline({{ paused: true }});
      window.__timelines["ep01v6-styletest"] = tl;
    </script>
  </body>
</html>
'''
    open(os.path.join(BUILD, "index.html"), "w").write(html)
    snap = os.path.join(BUILD, "snap")
    r = subprocess.run(["npx", "hyperframes", "snapshot", BUILD, "--at", "0.5,1.5,2.5,3.5,4.5,5.5,6.5,7.5", "--no-end", "--keep",
                        "-o", snap, "--timeout", "20000", "--describe", "false"], cwd=ROOT, capture_output=True, text=True)
    print(r.stdout[-1500:], r.stderr[-1500:])
    os.makedirs(OUT, exist_ok=True)
    for i, s in enumerate(STYLES):
        for kind, t in (("kitchen", i + 0.5), ("card", i + 4.5)):
            src = os.path.join(snap, f"at-{t:g}s.png")
            dst = os.path.join(OUT, f"style-{s}-{kind}-v1.png")
            if os.path.exists(dst):
                raise SystemExit(f"refusing to overwrite {dst}")
            shutil.copy(src, dst)
            print("wrote", os.path.relpath(dst, ROOT))
    # 2x2 compare sheet, labeled
    inputs, labels = [], []
    for i, s in enumerate(STYLES):
        inputs += ["-i", os.path.join(OUT, f"style-{s}-kitchen-v1.png")]
        labels.append(f"[{i}:v]scale=960:540,drawbox=x=0:y=0:w=620:h=64:color=0x10161F@0.85:t=fill,"
                      f"drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='{s}  {NAMES[s]}':x=18:y=12:fontsize=36:fontcolor=0xE6EAEE[v{i}]")
    dst = os.path.join(OUT, "style-compare-v1.png")
    if os.path.exists(dst):
        raise SystemExit(f"refusing to overwrite {dst}")
    fc = ";".join(labels) + ";[v0][v1]hstack[top];[v2][v3]hstack[bot];[top][bot]vstack"
    subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", fc, "-frames:v", "1", dst], check=True)
    print("wrote", os.path.relpath(dst, ROOT))


if __name__ == "__main__":
    main()
