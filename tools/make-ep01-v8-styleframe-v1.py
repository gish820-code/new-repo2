#!/usr/bin/env python3
"""Rainy Day: Cascadia — Episode 1 v8 (reference-style revamp): STYLE FRAME (v1), for approval before the full rebuild.

Two small HyperFrames projects, snapshotted to review/ep01-v8/:
  styleframe-kitchen-v1.png     test plate (reference cartoon style) + slim Drizzle (rig v6) at true scale, clock fixed to 10:42
  styleframe-undertable-v1.png  scale check: Drizzle + Mags in the drop-cover position fit under a normal-height table
  styleframe-card-day-v1.png    full-frame dark-gray DAY card (chalky hand lettering)
  styleframe-card-math-v1.png   full-frame survival-math card with a colored ink icon
  styleframe-vertical-v1.png    1080x1920 TikTok layout: brick wall, title box, scene, one-word caption, "Part 1" box
Usage: python3 tools/make-ep01-v8-styleframe-v1.py <build-dir>
"""
import os, shutil, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.abspath(sys.argv[1])
OUT = os.path.join(ROOT, "review/ep01-v8")
BG = "assets/ep01-v8/bg-1920/kitchen-ref-style-test-v1.jpg"

# scale: at the table's depth the plate is ~9.4 px per inch -> a 5'8" adult ~ 610 px -> rig scale 2.2 (figure = 278 units)
SC, GROUND = 2.2, 936
HIP = GROUND - 116 * SC
# drop-cover-hold-on "turtle": knees down, chest over the knees, one arm over the head, one hand on the table leg
COVER_T = '{"torso": 85, "head": 12, "lsh": -35, "lel": 10, "rsh": -15, "rel": 10, "lhip": 0, "lkn": -90, "rhip": 6, "rkn": -96, "dy": 56}'
# depth scale: rig scale grows linearly with how far below the horizon the feet are (horizon ~ y 600 on this plate)
HORIZON = 600


def depth_scale(ground):
    return round(SC * (ground - HORIZON) / (GROUND - HORIZON), 3)

CLOCK = """<defs><filter id="cb" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.4"/></filter></defs>
  <circle cx="927.3" cy="385" r="37" fill="#8896A2" filter="url(#cb)"/>
  <line x1="927.3" y1="385" x2="927.3" y2="363" stroke="#17191C" stroke-width="6" stroke-linecap="round" transform="rotate(321 927.3 385)"/>
  <line x1="927.3" y1="385" x2="927.3" y2="350" stroke="#17191C" stroke-width="4" stroke-linecap="round" transform="rotate(252 927.3 385)"/>
  <circle cx="927.3" cy="385" r="4" fill="#17191C"/>"""
ICON_STOPWATCH = """<g stroke="#1B1D21" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
  <rect x="-12" y="-74" width="24" height="16" rx="4" fill="#C8463F"/><rect x="-5" y="-60" width="10" height="12" fill="#9AA3AD"/>
  <path d="M38 -44 l12 -12" fill="none"/><circle cx="0" cy="4" r="52" fill="#D9DEE3"/><circle cx="0" cy="4" r="40" fill="#FBFBF8"/>
  <path d="M0 4 L0 -26" fill="none"/><path d="M0 4 L22 18" fill="none" stroke="#C8463F"/><circle cx="0" cy="4" r="4" fill="#1B1D21"/></g>"""
NOISE = """<svg class="noise" width="1920" height="1080"><filter id="n3"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed="9"/>
  <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.10 0"/></filter><rect width="1920" height="1080" filter="url(#n3)"/></svg>"""
BRICK = """<svg class="brick" viewBox="0 0 1080 1920" width="1080" height="1920"><defs>
  <pattern id="br" width="180" height="80" patternUnits="userSpaceOnUse"><rect width="180" height="80" fill="#2B2B2C"/>
    <rect x="4" y="4" width="172" height="34" rx="3" fill="#3A3A3B"/><rect x="-86" y="44" width="172" height="32" rx="3" fill="#353536"/>
    <rect x="94" y="44" width="172" height="32" rx="3" fill="#383839"/></pattern>
  <filter id="grunge"><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed="3"/><feColorMatrix values="0 0 0 0 0.75  0 0 0 0 0.75  0 0 0 0 0.75  0 0 0 2.2 -1.1"/></filter>
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0"/></filter></defs>
  <rect width="1080" height="1920" fill="url(#br)"/><rect width="1080" height="1920" filter="url(#grunge)" opacity="0.35"/>
  <rect width="1080" height="1920" filter="url(#grain)"/><rect width="1080" height="1920" fill="#000" opacity="0.28"/></svg>"""

CSS = """
  @font-face { font-family: "Kalam"; src: url("assets/fonts/Kalam-Bold.woff2") format("woff2"); font-weight: 700; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: W px; height: H px; overflow: hidden; background: #111; }
  #root { position: relative; width: W px; height: H px; overflow: hidden; }
  .f { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; overflow: hidden; }
  .bg { position: absolute; inset: 0; width: 1920px; height: 1080px; }
  .stage { position: absolute; inset: 0; }
  .card { background: #3A3B3D; }
  .card .noise { position: absolute; inset: 0; opacity: .5; }
  .card .day { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: "Kalam", cursive;
     font-weight: 700; font-size: 210px; color: #F4F4F2; letter-spacing: 0.02em; }
  .card .math { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 30px; }
  .card .math .t { font-family: "Kalam", cursive; font-weight: 700; font-size: 104px; color: #F4F4F2; line-height: 1.1; text-align: center; }
  .vert { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; overflow: hidden; }
  .vert .brick { position: absolute; inset: 0; }
  .title { position: absolute; left: 60px; width: 960px; top: 300px; height: 168px; background: #FAFAF8; border-radius: 34px;
     display: flex; align-items: center; justify-content: center; text-align: center; font-family: "Nunito", sans-serif; font-weight: 900;
     font-size: 56px; line-height: 1.12; color: #111; box-shadow: 0 6px 18px rgba(0,0,0,.45); }
  .scene { position: absolute; left: 0; top: 590px; width: 1080px; height: 608px; overflow: hidden; }
  .scene .inner { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; transform: scale(0.5625); transform-origin: 0 0; }
  .word { position: absolute; left: 50%; transform: translateX(-50%); top: 1088px; padding: 6px 22px 10px; background: #0B0B0B; border-radius: 18px;
     font-family: "Montserrat", sans-serif; font-weight: 800; font-size: 74px; color: #fff; letter-spacing: 0.01em; }
  .partbox { position: absolute; left: 50%; transform: translateX(-50%); top: 1318px; padding: 14px 64px 22px; background: #FAFAF8; border-radius: 34px;
     font-family: "Nunito", sans-serif; font-weight: 900; font-size: 96px; color: #111; box-shadow: 0 6px 18px rgba(0,0,0,.45); }
"""


def head(w, h):
    return f"""<!doctype html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width={w}, height={h}" />
<script src="assets/vendor/gsap.min.js"></script><script src="assets/characters/rainy-day-rig-v6.js"></script>
<style>{CSS.replace("W px", f"{w}px").replace("H px", f"{h}px")}</style></head>"""


def project(d, html):
    if os.path.exists(d):
        shutil.rmtree(d)
    for sub in ("assets/vendor", "assets/fonts", "assets/characters", "bg"):
        os.makedirs(os.path.join(d, sub))
    shutil.copy(os.path.join(ROOT, "assets/vendor/gsap.min.js"), os.path.join(d, "assets/vendor/"))
    shutil.copy(os.path.join(ROOT, "assets/characters/rainy-day-rig-v6.js"), os.path.join(d, "assets/characters/"))
    shutil.copy(os.path.join(ROOT, "assets/fonts/Kalam-Bold.woff2"), os.path.join(d, "assets/fonts/"))
    shutil.copy(os.path.join(ROOT, BG), os.path.join(d, "bg/kitchen.jpg"))
    open(os.path.join(d, "index.html"), "w").write(html)


def snap(d, times):
    r = subprocess.run(["npx", "hyperframes", "snapshot", d, "--at", ",".join(times), "--no-end", "--keep", "-o", os.path.join(d, "snap"),
                        "--timeout", "20000", "--describe", "false"], cwd=ROOT, capture_output=True, text=True)
    if r.returncode:
        print(r.stdout[-800:], r.stderr[-800:])


def main():
    zoom = "transform:scale(1.45);transform-origin:1140px 800px"
    main_html = head(1920, 1080) + f"""
<body>
<div id="root" data-composition-id="sf" data-start="0" data-duration="4" data-width="1920" data-height="1080">
  <div id="f1" class="f clip" data-start="0" data-duration="1" data-track-index="0"><img class="bg" src="bg/kitchen.jpg" alt="">
    <svg id="s1" class="stage" viewBox="0 0 1920 1080" width="1920" height="1080">{CLOCK}</svg></div>
  <div id="f2" class="f clip" data-start="1" data-duration="1" data-track-index="0"><img class="bg" src="bg/kitchen.jpg" alt="" style="{zoom}">
    <svg id="s2" class="stage" viewBox="0 0 1920 1080" width="1920" height="1080" style="{zoom}"></svg>
    <svg class="stage" viewBox="0 0 1920 1080" width="1920" height="1080" style="{zoom}"><defs><clipPath id="tablefront">
      <rect x="985" y="683" width="318" height="50"/><rect x="990" y="700" width="27" height="242"/><rect x="1254" y="700" width="28" height="242"/>
      <rect x="1100" y="1000" width="1" height="1"/></clipPath></defs>
      <image href="bg/kitchen.jpg" x="0" y="0" width="1920" height="1080" clip-path="url(#tablefront)"/></svg></div>
  <div id="f3" class="f card clip" data-start="2" data-duration="1" data-track-index="0">{NOISE}<div class="day">DAY 0 · 10:42 AM</div>
    <svg class="noise" width="1920" height="1080" style="opacity:1"><g stroke="#3A3B3D" stroke-width="3" fill="none" stroke-linecap="round">
      <path d="M520 470 l18 30 l-6 26 l14 22"/><path d="M820 560 l-12 26 l10 30"/><path d="M1130 480 l20 22 l-4 30"/><path d="M1400 590 l-16 22 l8 26"/></g></svg></div>
  <div id="f4" class="f card clip" data-start="3" data-duration="1" data-track-index="0">{NOISE}
    <div class="math"><svg viewBox="-80 -90 160 160" width="330" height="330">{ICON_STOPWATCH}</svg><div class="t">15 min − 12 min walk<br>= 3 minutes</div></div></div>
</div>
<script>
  window.__timelines = window.__timelines || {{}};
  const RD = window.RainyDay;
  RD.figure(document.getElementById("s1"), {{ character: "drizzle", slim: true, x: 690, y: {HIP}, scale: {SC}, facing: 1, face: "smile" }});
  RD.figure(document.getElementById("s1"), {{ character: "mags", slim: true, x: 1390, y: {980 - 116 * depth_scale(980) * 0.96}, scale: {depth_scale(980) * 0.96}, facing: -1, face: "neutral" }});
  RD.figure(document.getElementById("s2"), {{ character: "drizzle", slim: true, x: 960, y: {HIP}, scale: {SC}, facing: 1, face: "scared", pose: {COVER_T} }});
  const tl = gsap.timeline({{ paused: true }});
  window.__timelines["sf"] = tl;
</script></body></html>"""
    vert_html = head(1080, 1920) + f"""
<body>
<div id="root" data-composition-id="sfv" data-start="0" data-duration="1" data-width="1080" data-height="1920">
  <div id="v1" class="vert clip" data-start="0" data-duration="1" data-track-index="0">{BRICK}
    <div class="title">Cascadia 9.0:<br>22 Minutes To Reach High Ground</div>
    <div class="scene"><div class="inner"><img class="bg" src="bg/kitchen.jpg" alt="">
      <svg id="s5" class="stage" viewBox="0 0 1920 1080" width="1920" height="1080">{CLOCK}</svg></div></div>
    <div class="word">DOORWAY</div>
    <div class="partbox">Part 1</div></div>
</div>
<script>
  window.__timelines = window.__timelines || {{}};
  const RD = window.RainyDay;
  RD.figure(document.getElementById("s5"), {{ character: "drizzle", slim: true, x: 800, y: {HIP}, scale: {SC}, facing: 1, face: "worried", pose: "lookUp" }});
  const tl = gsap.timeline({{ paused: true }});
  window.__timelines["sfv"] = tl;
</script></body></html>"""
    vb = BUILD + "-vert"
    project(BUILD, main_html)
    project(vb, vert_html)
    snap(BUILD, ["0.5", "1.5", "2.5", "3.5"])
    snap(vb, ["0.5"])
    os.makedirs(OUT, exist_ok=True)
    pairs = [(BUILD, "0.5", "styleframe-kitchen-v1"), (BUILD, "1.5", "styleframe-undertable-v1"), (BUILD, "2.5", "styleframe-card-day-v1"),
             (BUILD, "3.5", "styleframe-card-math-v1"), (vb, "0.5", "styleframe-vertical-v1")]
    for d, t, n in pairs:
        shutil.copy(os.path.join(d, "snap", f"at-{t}s.png"), os.path.join(OUT, n + ".png"))
        print("wrote", f"review/ep01-v8/{n}.png")


if __name__ == "__main__":
    main()
