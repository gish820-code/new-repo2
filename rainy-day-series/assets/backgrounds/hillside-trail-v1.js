/* Rainy Day background — hillsideTrail, v1.
 * The evacuation trail up the hill above Gull Harbor: a dirt trail traversing the slope left→right/up through
 * Douglas firs, ferns and roots, a wooden handrail on the uphill side, the steel/paper "TSUNAMI EVACUATION
 * ROUTE" sign with an uphill arrow, and a wide view down at LEFT across the bay to the town on the far shore,
 * the ferry pier and the ocean horizon. The switchback's upper leg is glimpsed higher up the slope at right.
 *
 * Paste VERBATIM after assets/characters/rainy-day-rig-v1.js. Usage:
 *   const bg = window.RainyDayBG.hillsideTrail(svgLayerG, {});
 *   const y = bg.trailY(820);                       // ground y under x=820 → feet go there
 *   RD.figure(layer, { x: 820, y: y - 116 * 1.3, scale: 1.3 });   // hip = feet - 116*scale
 *   tl.to(p, { lvl: bg.harbor.drainedY, onUpdate: () => bg.harbor.setLevel(p.lvl) })
 *
 * Opts (all optional): { level } initial harbor water level (default 470).
 *
 * HANDLES (returned object):
 *   g            — root <g> of the whole background.
 *   groundY      — 905: trail ground at the left edge (use trailY(x) for anything on the slope).
 *   trailY(x)    — ground y of the main trail at x (smooth slope, clamped to 0..1920). Feet sit exactly on it.
 *                  Start (0, 905) → (500, 862) → (1000, 792) → (1500, 694) → end (1920, 592).
 *   trailPoints  — [[x, y], ...] polyline of the trail ground line, every 20px from x=0 to x=1920.
 *   trail        — { g, x0: 0, y0: 905, x1: 1920, y1: 592 }.
 *   harbor       — { g, waterG, floatG, levelY: 470, drainedY: 545, surgedY: 405, setLevel(y) }
 *                  The bay seen across from the hill (x ≈ 0–1000). The water surface top edge sits at levelY on
 *                  the far shore. setLevel(y) redraws the water: larger y = water DRAINS (mud flats, rocks,
 *                  bare pier pilings and a stranded skiff appear); smaller y = SURGE (water climbs over the
 *                  waterfront houses). Sensible range 405 (surged, town swamped) … 470 (normal) … 545 (drained).
 *                  floatG (ferry + boats) rides the surface and settles on the mud when drained.
 *   horizon      — { y: 330, x0: 0, x1: 560, g } ocean horizon (visible through the harbor mouth, x 0–560).
 *   waveLine     — { g, scaleG, x0: 50, x1: 570, y: 330, cx: 300, cy: 330 } a thin dark swell line with a pale
 *                  crest on the horizon, opacity 0 by default. Reveal: gsap.to(waveLine.g, { opacity: 1 }).
 *                  Grow / approach: tween waveLine.scaleG — its local origin IS (cx, cy), so
 *                  gsap.to(waveLine.scaleG, { scaleX: 1.4, scaleY: 4, y: 30 }) swells it in place and moves it
 *                  toward shore (y: +px). (Or scale waveLine.g with svgOrigin: "300 330".)
 *   sign         — { g, x: 1585, y: 395, postX: 1585, postY: 649 } evacuation route sign: x/y = board center,
 *                  postY = where the post meets the trail.
 *   rail         — { g } wooden handrail (uphill side of the trail, behind the figures).
 *   hill         — { g } the uphill slope mass with the big firs.
 *   view         — { g } the whole distant view group (sky excluded) — e.g. to blur/fade it.
 *   sky          — { g }.
 */
(function () {
  window.RainyDayBG = window.RainyDayBG || {};
  if (window.RainyDayBG.hillsideTrail) return;
  let instance = 0;

  window.RainyDayBG.hillsideTrail = function (parent, opts) {
    opts = opts || {};
    const RD = window.RainyDay, P = RD.palette, LINE = RD.LINE, sk = RD.sk, el = RD.el, hash = RD.hash;
    const INK = P.ink;
    const id = "rdht" + (instance++) + "_";
    const f1 = (v) => (+v).toFixed(1);
    const g = el("g", { class: "rd-bg rd-bg-hillside-trail" }, parent);
    const defs = el("defs", {}, g);

    function grad(name, stops, x2, y2) {
      const lg = el("linearGradient", { id: id + name, x1: 0, y1: 0, x2: x2 || 0, y2: y2 === undefined ? 1 : y2 }, defs);
      stops.forEach(([o, c, a]) => el("stop", { offset: o, "stop-color": c, "stop-opacity": a === undefined ? 1 : a }, lg));
      return "url(#" + id + name + ")";
    }
    let clipN = 0;
    function clipTo(par, pts) { // group clipped to a polygon (keeps rect-shaped hatching inside its shape)
      const cid = id + "clip" + (clipN++);
      const cp = el("clipPath", { id: cid }, defs);
      el("path", { d: "M" + pts.map((q) => f1(q[0]) + " " + f1(q[1])).join(" L") + " Z" }, cp);
      return el("g", { "clip-path": "url(#" + cid + ")" }, par);
    }
    const skyFill = grad("sky", [[0, P.night], [0.35, P.storm], [0.72, P.slate], [1, P.steel]]);
    const seaFill = grad("sea", [[0, P.mist], [0.5, P.steel], [1, P.slate]]);
    const bayFill = grad("bay", [[0, P.steel], [1, P.slate]]);
    const fogFill = grad("fog", [[0, P.fog, 0], [0.5, P.fog, 0.35], [1, P.fog, 0]]);
    const glowFill = grad("glow", [[0, P.fog, 0], [1, P.fog, 0.5]]);
    const bankFill = grad("bank", [[0, P.slate], [0.45, P.storm], [1, P.night]]);
    const hillFill = grad("hill", [[0, P.slate], [1, P.storm]]);

    // ------------------------------------------------------------------ trail geometry
    const CP = [[-200, 925], [0, 905], [500, 862], [1000, 792], [1500, 694], [1920, 592], [2120, 535]];
    const samples = [];
    for (let i = 1; i < CP.length - 2; i++) {
      const p0 = CP[i - 1], p1 = CP[i], p2 = CP[i + 1], p3 = CP[i + 2];
      for (let k = 0; k < 50; k++) {
        const t = k / 50, t2 = t * t, t3 = t2 * t;
        const cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
        samples.push([cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1])]);
      }
    }
    samples.push(CP[CP.length - 2]);
    function trailY(x) {
      x = Math.max(0, Math.min(1920, x));
      for (let i = 0; i < samples.length - 1; i++) {
        const a = samples[i], b = samples[i + 1];
        if (x >= a[0] && x <= b[0]) return a[1] + ((b[1] - a[1]) * (x - a[0])) / Math.max(0.001, b[0] - a[0]);
      }
      return samples[samples.length - 1][1];
    }
    const trailPoints = [];
    for (let x = 0; x <= 1920; x += 20) trailPoints.push([x, Math.round(trailY(x) * 10) / 10]);
    const BACK = 36, FRONT = 30; // tread depth behind / in front of the foot line

    // ------------------------------------------------------------------ small drawing kits
    function fir(par, x, by, h, w, o) {
      const fg = el("g", {}, par);
      const seed = o.seed || 1, lw = o.width || LINE.main, stroke = o.stroke || INK;
      sk.poly(fg, [[x - w * 0.045, by + 4], [x - w * 0.018, by - h * 0.92], [x + w * 0.018, by - h * 0.92], [x + w * 0.045, by + 4]],
        { fill: o.trunk || P.night, stroke, width: lw * 0.7, seed: seed + 50, wobble: 1 });
      const tiers = o.tiers || Math.max(4, Math.round(h / 70));
      for (let i = 0; i < tiers; i++) {
        const t = i / tiers;
        const ty = by - h * 0.14 - h * 0.84 * t;
        const tw = w * 0.5 * (1 - t * 0.86) * (0.9 + 0.2 * Math.abs(hash(seed + i * 3)));
        const th = ((h * 0.84) / tiers) * 1.9;
        const pts = [[x + hash(seed + i) * 3, ty - th], [x - tw * 0.45, ty - th * 0.3], [x - tw, ty + th * 0.18]];
        const jag = 7;
        for (let k = 1; k < jag; k++) pts.push([x - tw + (2 * tw * k) / jag, ty + (k % 2 ? th * 0.02 : th * 0.16) + Math.sin((k / jag) * Math.PI) * th * 0.06]);
        pts.push([x + tw, ty + th * 0.18], [x + tw * 0.45, ty - th * 0.3]);
        sk.poly(fg, pts, { fill: o.fill, stroke, width: lw, seed: seed + i * 11, wobble: o.wobble || 1.6, double: o.double });
        if (o.needles) {
          for (let k = 0; k < Math.max(3, Math.round(tw / 22)); k++) {
            const nx = x - tw * 0.7 + (tw * 1.4 * (k + 0.5)) / Math.max(3, Math.round(tw / 22));
            const ny = ty + th * 0.02 - Math.abs(nx - x) * 0.25;
            sk.line(fg, nx, ny, nx + (nx < x ? -8 : 8), ny + 14, { stroke: o.needles, width: LINE.detail, seed: seed + i * 7 + k, wobble: 0.6, double: false });
          }
        }
      }
      return fg;
    }
    function tinyFir(par, x, by, h, fill, seed) {
      return sk.poly(par, [[x, by - h], [x - h * 0.28, by], [x + h * 0.28, by]], { fill, stroke: fill, width: 1.5, seed, wobble: 0.6, double: false });
    }
    function fern(par, x, y, len, ang, seed, col) {
      const fg = el("g", {}, par);
      const a = (ang * Math.PI) / 180, c = col || P.slate;
      const pts = [];
      for (let i = 0; i <= 8; i++) {
        const t = i / 8, bend = t * t * 0.9;
        pts.push([x + Math.sin(a + bend * Math.sign(ang || 1)) * len * t, y - Math.cos(a + bend * Math.sign(ang || 1)) * len * t]);
      }
      sk.path(fg, pts, { stroke: c, width: LINE.detail + 1, seed, wobble: 0.6, double: false });
      for (let i = 1; i < 8; i++) {
        const p = pts[i], q = pts[i + 1], dx = q[0] - p[0], dy = q[1] - p[1], d = Math.hypot(dx, dy) || 1;
        const l = len * 0.22 * (1 - i / 9);
        const nx = -dy / d, ny = dx / d;
        sk.line(fg, p[0], p[1], p[0] + nx * l + dx * 0.6, p[1] + ny * l + dy * 0.6, { stroke: c, width: LINE.detail, seed: seed + i, wobble: 0.4, double: false });
        sk.line(fg, p[0], p[1], p[0] - nx * l + dx * 0.6, p[1] - ny * l + dy * 0.6, { stroke: c, width: LINE.detail, seed: seed + i + 20, wobble: 0.4, double: false });
      }
      return fg;
    }
    function rock(par, x, y, w, h, seed, fill) {
      const pts = [];
      for (let i = 0; i < 9; i++) {
        const a = Math.PI + (i / 8) * Math.PI;
        pts.push([x + Math.cos(a) * w * (0.85 + 0.15 * hash(seed + i)), y + Math.sin(a) * h * (0.8 + 0.2 * hash(seed + i * 2))]);
      }
      const rg = sk.poly(par, pts, { fill: fill || P.steel, width: LINE.detail + 1, seed, wobble: 1 });
      sk.line(rg, x - w * 0.3, y - h * 0.55, x + w * 0.4, y - h * 0.2, { stroke: P.fog, width: LINE.detail, seed: seed + 3, wobble: 0.5, double: false, opacity: 0.6 });
      return rg;
    }
    function house(par, x, by, w, h, o) {
      const hg = el("g", {}, par);
      const seed = o.seed || 1, lw = o.lw || 1.6;
      sk.rect(hg, x, by - h, w, h, { fill: o.fill || P.fog, stroke: o.stroke || P.slate, width: lw, seed, wobble: 0.5, double: false });
      const roofH = o.flat ? 4 : h * 0.55;
      sk.poly(hg, o.flat ? [[x - 2, by - h], [x + w + 2, by - h], [x + w + 2, by - h - roofH], [x - 2, by - h - roofH]]
        : [[x - 3, by - h], [x + w / 2, by - h - roofH], [x + w + 3, by - h]], { fill: o.roof || P.slate, stroke: o.stroke || P.slate, width: lw, seed: seed + 1, wobble: 0.4, double: false });
      const nw = Math.max(1, Math.floor(w / 11));
      for (let i = 0; i < nw; i++) {
        const wx = x + ((i + 0.5) * w) / nw - 2.5;
        el("rect", { x: f1(wx), y: f1(by - h * 0.7), width: 5, height: 5, fill: o.win || P.steel }, hg);
      }
      return hg;
    }

    // ------------------------------------------------------------------ SKY
    const skyG = el("g", { class: "sky" }, g);
    sk.rect(skyG, -20, -20, 1960, 760, { fill: skyFill, stroke: "none", wobble: 0, double: false });
    // heavy cloud decks with pen hatching
    const clouds = [
      [[-30, 40], [300, 70], [620, 40], [900, 90], [1300, 60], [1950, 80], [1950, -30], [-30, -30]],
      [[-30, 170], [180, 150], [420, 190], [700, 165], [980, 205], [1250, 175], [1950, 200], [1950, 110], [1300, 120], [900, 140], [500, 105], [200, 125], [-30, 110]],
      [[-30, 262], [140, 248], [330, 270], [520, 252], [760, 276], [1000, 258], [1950, 280], [1950, 230], [900, 225], [600, 215], [300, 228], [-30, 220]],
    ];
    const cloudCols = [P.night, P.storm, P.slate];
    clouds.forEach((pts, i) => {
      sk.poly(skyG, pts, { fill: cloudCols[i], stroke: cloudCols[i] === P.night ? P.storm : P.night, width: LINE.detail, seed: 30 + i, wobble: 3, opacity: 0.9 });
    });
    sk.hatch(skyG, 0, 0, 1920, 90, { gap: 16, angle: 62, stroke: P.slate, width: 2, opacity: 0.25, seed: 41 });
    sk.hatch(skyG, 0, 130, 1100, 70, { gap: 22, angle: 60, stroke: P.night, width: 2, opacity: 0.25, seed: 42 });
    sk.hatch(skyG, 0, 232, 1000, 40, { gap: 26, angle: 58, stroke: P.storm, width: 2, opacity: 0.25, seed: 43 });
    // faint distant rain curtains (static streaks under the cloud deck, out at sea)
    for (let i = 0; i < 26; i++) {
      const x = 40 + i * 19 + hash(i + 5) * 6;
      sk.line(skyG, x, 255 + hash(i) * 8, x - 16, 326, { stroke: P.mist, width: 1.5, seed: 60 + i, wobble: 0.5, double: false, opacity: 0.35 });
    }
    // pale glow band at the horizon
    sk.rect(skyG, -20, 270, 1400, 60, { fill: glowFill, stroke: "none", wobble: 0, double: false });

    // ------------------------------------------------------------------ DISTANT VIEW (sea, far shore, town, bay)
    const viewG = el("g", { class: "view" }, g);
    const HORIZON = 330;
    // ocean to the horizon
    const seaG = el("g", {}, viewG);
    sk.rect(seaG, -20, HORIZON, 1440, 200, { fill: seaFill, stroke: "none", wobble: 0, double: false });
    sk.line(seaG, -20, HORIZON, 1400, HORIZON, { stroke: P.slate, width: LINE.detail, seed: 70, wobble: 0.6 });
    for (let i = 0; i < 18; i++) {
      const y = HORIZON + 8 + i * 7 + i * i * 0.35, x = 20 + ((i * 137) % 420);
      sk.line(seaG, x, y, x + 60 + (i % 4) * 30, y, { stroke: i % 3 ? P.fog : P.slate, width: 1.5, seed: 80 + i, wobble: 0.4, double: false, opacity: 0.5 });
    }
    // the horizon handle + hidden incoming-wave line
    const horizonG = el("g", { class: "horizon" }, viewG);
    sk.line(horizonG, -20, HORIZON, 560, HORIZON, { stroke: P.steel, width: 1.5, seed: 99, wobble: 0.3, double: false, opacity: 0.8 });
    const waveOuter = el("g", { class: "wave-line", opacity: 0 }, viewG);
    const WCX = 300;
    const wavePos = el("g", { transform: "translate(" + WCX + " " + HORIZON + ")" }, waveOuter);
    const waveInner = el("g", { class: "wave-line-scale" }, wavePos); // local origin = (WCX, HORIZON)
    sk.poly(waveInner, [[-250, 1], [-150, -3], [0, -5], [150, -4], [270, 1], [270, 4], [-250, 4]], { fill: P.night, stroke: P.night, width: 2, seed: 101, wobble: 0.5 });
    sk.path(waveInner, [[-240, -1], [-120, -4], [0, -5], [140, -5], [260, -1]], { stroke: P.paper, width: 2, seed: 102, wobble: 0.6, double: false, opacity: 0.75 });
    sk.path(waveInner, [[-200, 6], [0, 7], [220, 6]], { stroke: P.storm, width: 2, seed: 103, wobble: 0.5, double: false, opacity: 0.6 });

    // far headland at the harbor mouth (left) with a small light — in front of the wave line
    const headG = el("g", {}, viewG);
    sk.poly(headG, [[-20, 352], [30, 336], [70, 340], [96, 352], [120, 372], [-20, 380]], { fill: P.mist, stroke: P.steel, width: LINE.detail, seed: 90 });
    for (let i = 0; i < 6; i++) tinyFir(headG, 0 + i * 13, 344 + i * 1.5, 14 + (i % 3) * 4, P.steel, 91 + i);
    sk.rect(headG, 98, 340, 6, 18, { fill: P.paper, stroke: P.slate, width: 1.5, seed: 97, wobble: 0.3, double: false });
    sk.poly(headG, [[96, 340], [101, 333], [106, 340]], { fill: P.slate, stroke: P.slate, width: 1.5, seed: 98, wobble: 0.2, double: false });

    // far hills behind the town (right part of the view), with tiny firs
    const farHillG = el("g", {}, viewG);
    const farHillPts = [[300, 470], [380, 440], [470, 418], [560, 392], [660, 368], [760, 338], [880, 308], [1010, 280], [1200, 250], [1400, 240], [1400, 480]];
    sk.poly(farHillG, farHillPts, { fill: P.mist, stroke: P.steel, width: LINE.detail, seed: 110 });
    sk.poly(farHillG, [[520, 470], [600, 446], [700, 420], [800, 396], [900, 372], [1010, 350], [1400, 300], [1400, 480]],
      { fill: P.steel, stroke: P.slate, width: LINE.detail, seed: 111, opacity: 0.55 });
    for (let i = 0; i < 38; i++) {
      const x = 470 + i * 14 + hash(i + 120) * 5;
      const top = 470 - (x - 300) * 0.27;
      tinyFir(farHillG, x, top + 12 + Math.abs(hash(i)) * 22, 14 + Math.abs(hash(i + 7)) * 10, i % 3 ? P.steel : P.slate, 130 + i);
    }
    sk.hatch(clipTo(farHillG, farHillPts), 560, 290, 840, 160, { gap: 10, angle: 120, stroke: P.slate, width: 1.5, opacity: 0.15, seed: 112 });

    // seabed — normally under water, exposed when the harbor drains
    const seabedG = el("g", { class: "seabed" }, viewG);
    sk.poly(seabedG, [[-20, 470], [200, 474], [500, 470], [1010, 466], [1400, 460], [1400, 640], [-20, 640]], { fill: P.slate, stroke: P.storm, width: LINE.detail, seed: 140, wobble: 1 });
    sk.hatch(seabedG, -20, 476, 1030, 160, { gap: 9, angle: 8, stroke: P.storm, width: 1.5, opacity: 0.45, seed: 141 });
    for (let i = 0; i < 16; i++) {
      const x = 30 + i * 61 + hash(i + 150) * 20, y = 490 + Math.abs(hash(i + 151)) * 70;
      rock(seabedG, x, y, 9 + Math.abs(hash(i)) * 10, 6 + Math.abs(hash(i + 3)) * 5, 160 + i, P.storm);
    }
    for (let i = 0; i < 10; i++) { // kelp squiggles / channels in the mud
      const x = 60 + i * 90, y = 520 + (i % 3) * 18;
      sk.path(seabedG, [[x, y], [x + 18, y + 4], [x + 34, y - 2], [x + 52, y + 5]], { stroke: P.mist, width: 1.5, seed: 180 + i, wobble: 1, double: false, opacity: 0.5 });
    }
    // stranded skiff (only visible when drained)
    const skiffX = 470, skiffY = 528;
    sk.poly(seabedG, [[skiffX - 24, skiffY - 6], [skiffX + 22, skiffY - 9], [skiffX + 16, skiffY + 2], [skiffX - 18, skiffY + 4]], { fill: P.fog, width: LINE.detail, seed: 190 });
    sk.line(seabedG, skiffX - 4, skiffY - 7, skiffX - 2, skiffY + 2, { width: 1.5, seed: 191, double: false });

    // far shore: beach + waterfront town
    const townG = el("g", { class: "town" }, viewG);
    sk.poly(townG, [[150, 474], [250, 466], [420, 462], [700, 458], [1010, 452], [1400, 446], [1400, 476], [150, 478]], { fill: P.fog, stroke: P.mist, width: 1.5, seed: 200, wobble: 0.6 });
    sk.hatch(townG, 150, 462, 860, 16, { gap: 7, angle: 30, stroke: P.mist, width: 1.5, opacity: 0.6, seed: 201 });
    sk.line(townG, 230, 466, 1010, 452, { stroke: P.steel, width: 2, seed: 202, wobble: 0.5, double: false });
    // back rows climbing the far hill
    const backRow = [[560, 440, 22, 14], [600, 436, 18, 12], [640, 430, 24, 15], [690, 422, 20, 13], [735, 414, 26, 16], [790, 404, 18, 12], [830, 398, 22, 14], [880, 390, 20, 12], [930, 380, 24, 14]];
    backRow.forEach(([x, by, w, h], i) => house(townG, x, by, w, h, { seed: 210 + i, fill: P.mist, roof: P.steel, stroke: P.steel, win: P.fog, lw: 1.2 }));
    // water tower + church steeple
    sk.line(townG, 668, 418, 664, 392, { stroke: P.steel, width: 1.5, seed: 230, double: false });
    sk.line(townG, 684, 418, 688, 392, { stroke: P.steel, width: 1.5, seed: 231, double: false });
    sk.rect(townG, 658, 378, 36, 16, { fill: P.fog, stroke: P.steel, width: 1.5, seed: 232, wobble: 0.4, double: false });
    sk.poly(townG, [[656, 378], [676, 368], [696, 378]], { fill: P.steel, stroke: P.steel, width: 1.5, seed: 233, double: false });
    house(townG, 470, 452, 26, 26, { seed: 234, fill: P.paper, roof: P.slate, stroke: P.slate });
    sk.poly(townG, [[476, 426], [483, 398], [490, 426]], { fill: P.slate, stroke: P.slate, width: 1.5, seed: 235, double: false });
    // waterfront row
    const front = [[300, 464, 34, 20, 1], [342, 463, 26, 24, 0], [376, 462, 40, 16, 1], [430, 461, 30, 22, 0], [508, 460, 28, 20, 0], [544, 459, 36, 26, 0],
      [588, 458, 26, 18, 0], [622, 458, 40, 22, 1], [670, 457, 30, 24, 0], [710, 456, 26, 18, 0], [745, 455, 34, 22, 0], [790, 454, 28, 26, 0], [830, 453, 40, 18, 1], [880, 452, 30, 22, 0]];
    front.forEach(([x, by, w, h, flat], i) => house(townG, x, by, w, h, { seed: 240 + i, flat: !!flat, fill: i % 3 === 0 ? P.paper : P.fog, roof: i % 2 ? P.slate : P.steel, stroke: P.slate }));
    // cannery shed on pilings at the waterfront + little sign
    sk.rect(townG, 236, 444, 58, 22, { fill: P.mist, stroke: P.slate, width: 1.6, seed: 270, wobble: 0.5, double: false });
    sk.poly(townG, [[232, 444], [265, 432], [298, 444]], { fill: P.steel, stroke: P.slate, width: 1.6, seed: 271, double: false });
    for (let i = 0; i < 5; i++) sk.line(townG, 242 + i * 12, 466, 242 + i * 12, 500, { stroke: P.slate, width: 2, seed: 272 + i, wobble: 0.3, double: false });
    // ferry pier jutting left into the bay, on pilings that run down into the water
    const dockG = el("g", { class: "dock" }, viewG);
    for (let i = 0; i < 8; i++) sk.line(dockG, 112 + i * 18, 466, 112 + i * 18, 540, { stroke: P.storm, width: 2.5, seed: 280 + i, wobble: 0.3, double: false });
    sk.poly(dockG, [[104, 462], [240, 464], [240, 469], [104, 467]], { fill: P.mist, stroke: P.slate, width: 1.6, seed: 290, wobble: 0.3, double: false });
    sk.line(dockG, 108, 462, 108, 448, { stroke: P.slate, width: 1.6, seed: 291, double: false }); // light pole
    sk.line(dockG, 104, 449, 114, 449, { stroke: P.slate, width: 1.6, seed: 292, double: false });

    // ---- the bay water (waterG) — redrawn by setLevel
    const LEVEL0 = 470;
    const waterG = el("g", { class: "harbor-water" }, viewG);
    const waterPath = el("path", { fill: bayFill, stroke: "none" }, waterG);
    const waterEdgeInk = el("path", { fill: "none", stroke: P.storm, "stroke-width": 2, "stroke-linecap": "round" }, waterG);
    const waterFoam = el("path", { fill: "none", stroke: P.fog, "stroke-width": 1.5, opacity: 0.7, "stroke-linecap": "round" }, waterG);
    const rippleG = el("g", {}, waterG);
    for (let i = 0; i < 22; i++) {
      const y = LEVEL0 + 10 + (i % 8) * 13 + Math.floor(i / 8) * 4, x = 20 + ((i * 173) % 900);
      sk.line(rippleG, x, y, x + 30 + (i % 5) * 14, y, { stroke: i % 4 ? P.mist : P.storm, width: 1.5, seed: 300 + i, wobble: 0.4, double: false, opacity: 0.55 });
    }
    // boats + ferry ride the surface
    const floatG = el("g", { class: "harbor-float" }, viewG);
    // ferry alongside the pier
    const ferryG = el("g", { class: "ferry" }, floatG);
    sk.poly(ferryG, [[118, 462], [214, 462], [206, 474], [126, 474]], { fill: P.paper, stroke: P.slate, width: 1.8, seed: 320, wobble: 0.4, double: false });
    sk.line(ferryG, 124, 468, 208, 468, { stroke: P.steel, width: 2, seed: 321, double: false });
    sk.rect(ferryG, 140, 452, 50, 10, { fill: P.fog, stroke: P.slate, width: 1.6, seed: 322, wobble: 0.3, double: false });
    sk.rect(ferryG, 152, 444, 22, 8, { fill: P.fog, stroke: P.slate, width: 1.6, seed: 323, wobble: 0.3, double: false });
    for (let i = 0; i < 6; i++) el("rect", { x: 143 + i * 8, y: 455, width: 4, height: 3, fill: P.steel }, ferryG);
    sk.line(ferryG, 180, 444, 180, 436, { stroke: P.slate, width: 2, seed: 324, double: false });
    // moored fishing boats
    [[380, 478, 330], [560, 476, 340], [760, 474, 350]].forEach(([x, y, s]) => {
      sk.poly(floatG, [[x - 14, y - 4], [x + 14, y - 5], [x + 9, y + 2], [x - 10, y + 2]], { fill: P.fog, stroke: P.slate, width: 1.4, seed: s, wobble: 0.3, double: false });
      sk.line(floatG, x - 2, y - 4, x - 2, y - 18, { stroke: P.slate, width: 1.4, seed: s + 1, double: false });
      sk.line(floatG, x - 2, y - 18, x + 8, y - 6, { stroke: P.slate, width: 1, seed: s + 2, double: false, opacity: 0.7 });
    });

    let levelNow = LEVEL0;
    function setLevel(y) {
      levelNow = y;
      let d = "M-20 " + f1(y), ink = "M-20 " + f1(y), foam = "";
      const pts = [];
      for (let x = -20; x <= 1404; x += 24) pts.push([x, y + Math.sin(x * 0.045) * 1.2 + hash(x * 0.31) * 0.8]);
      d = "M" + pts.map((p) => f1(p[0]) + " " + f1(p[1])).join(" L") + " L1404 700 L-20 700 Z";
      ink = "M" + pts.map((p) => f1(p[0]) + " " + f1(p[1])).join(" L");
      foam = "M" + pts.filter((p, i) => i % 1 === 0).map((p) => f1(p[0]) + " " + f1(p[1] + 3)).join(" L");
      waterPath.setAttribute("d", d);
      waterEdgeInk.setAttribute("d", ink);
      waterFoam.setAttribute("d", foam);
      rippleG.setAttribute("transform", "translate(0 " + f1(y - LEVEL0) + ")");
      // boats float with the surface; when drained they settle on the mud (max 26px drop)
      floatG.setAttribute("transform", "translate(0 " + f1(Math.min(26, y - LEVEL0)) + ")");
    }
    setLevel(opts.level !== undefined ? opts.level : LEVEL0);

    // atmospheric fog over the distant view (keeps it low-contrast behind the figures)
    sk.rect(viewG, -20, 420, 1440, 120, { fill: fogFill, stroke: "none", wobble: 0, double: false, opacity: 0.8 });

    // ------------------------------------------------------------------ NEAR FLANK: fir tops rising from below the trail
    const flankG = el("g", { class: "flank" }, g);
    const flankPts = [[-20, 640], [200, 640], [500, 660], [800, 700], [1000, 760], [1000, 960], [-20, 960]];
    sk.poly(flankG, flankPts, { fill: P.steel, stroke: "none", wobble: 0, double: false });
    const topsBack = [];
    for (let i = 0; i < 22; i++) topsBack.push([-10 + i * 46 + hash(i + 400) * 12, 590 + Math.abs(hash(i + 401)) * 30 + i * 4.5, 70 + Math.abs(hash(i + 402)) * 40]);
    topsBack.forEach(([x, apex, h], i) => fir(flankG, x, apex + h, h, h * 0.55, { fill: P.mist, stroke: P.steel, width: 1.6, seed: 410 + i, tiers: 3, double: false, wobble: 1, trunk: P.steel }));
    sk.rect(flankG, -20, 590, 1040, 80, { fill: fogFill, stroke: "none", wobble: 0, double: false, opacity: 0.9 });
    const topsFront = [];
    for (let i = 0; i < 17; i++) topsFront.push([10 + i * 56 + hash(i + 450) * 14, 650 + Math.abs(hash(i + 451)) * 30 + i * 6.5, 90 + Math.abs(hash(i + 452)) * 50]);
    topsFront.forEach(([x, apex, h], i) => fir(flankG, x, apex + h, h, h * 0.55, { fill: P.steel, stroke: P.slate, width: 2, seed: 460 + i, tiers: 3, double: false, wobble: 1.2, trunk: P.slate }));
    sk.hatch(clipTo(flankG, flankPts), -20, 700, 1000, 220, { gap: 12, angle: 125, stroke: P.slate, width: 1.5, opacity: 0.25, seed: 490 });

    // ------------------------------------------------------------------ UPHILL MASS (right) with big firs
    const hillG = el("g", { class: "hill" }, g);
    const ridge = [[760, 880], [840, 760], [930, 650], [1050, 520], [1170, 410], [1300, 330], [1450, 262], [1650, 205], [1800, 175], [1950, 150]];
    sk.poly(hillG, ridge.concat([[1950, 900], [760, 900]]), { fill: hillFill, stroke: P.storm, width: LINE.main, seed: 500, wobble: 2.4 });
    sk.hatch(clipTo(hillG, ridge.concat([[1950, 900], [760, 900]])), 760, 140, 1200, 760, { gap: 15, angle: 55, stroke: P.storm, width: 2, opacity: 0.28, seed: 501 });
    // distant firs along the ridge line (behind the big ones)
    for (let i = 0; i < 16; i++) {
      const x = 900 + i * 66 + hash(i + 510) * 15;
      const rY = x < 1300 ? 650 - (x - 930) * 0.86 : 330 - (x - 1300) * 0.28;
      fir(hillG, x, rY + 40, 150 + Math.abs(hash(i + 511)) * 90, 90, { fill: P.slate, stroke: P.storm, width: 2, seed: 520 + i, tiers: 5, double: false, trunk: P.storm });
    }
    // upper switchback leg glimpsed higher on the slope
    const upLeg = [[1290, 360], [1450, 386], [1620, 410], [1780, 432], [1950, 452]];
    sk.poly(hillG, upLeg.map(([x, y]) => [x, y - 12]).concat(upLeg.slice().reverse().map(([x, y]) => [x, y + 10])), { fill: P.steel, stroke: P.storm, width: LINE.detail, seed: 540, wobble: 1 });
    for (let i = 0; i < 6; i++) {
      const x = 1340 + i * 115, y = 365 + (x - 1290) * 0.14 - 12;
      sk.line(hillG, x, y, x, y - 28, { stroke: P.storm, width: 3, seed: 545 + i, double: false });
    }
    sk.path(hillG, upLeg.map(([x, y]) => [x, y - 36]), { stroke: P.storm, width: 3, seed: 552, double: false });
    // big Douglas firs on the slope above the trail
    fir(hillG, 1290, trailY(1290) - BACK - 16, 820, 340, { fill: P.slate, stroke: INK, width: LINE.main, seed: 560, tiers: 11, needles: P.storm, trunk: P.storm });
    fir(hillG, 1060, trailY(1060) - BACK - 10, 560, 230, { fill: P.steel, stroke: P.storm, width: 3, seed: 600, tiers: 8, needles: P.slate, trunk: P.slate });
    fir(hillG, 1760, trailY(1760) - BACK - 20, 980, 400, { fill: P.storm, stroke: INK, width: LINE.main, seed: 640, tiers: 13, needles: P.night, trunk: P.night });
    // mossy fallen log + stump on the slope
    sk.poly(hillG, [[1380, 640], [1520, 600], [1528, 622], [1388, 664]], { fill: P.steel, width: 3, seed: 680 });
    sk.circle(hillG, 1524, 611, 12, { fill: P.mist, width: 3, seed: 681 });
    sk.circle(hillG, 1524, 611, 6, { fill: "none", stroke: P.slate, width: 1.5, seed: 682, double: false });
    for (let i = 0; i < 6; i++) sk.line(hillG, 1400 + i * 20, 650 - i * 6, 1412 + i * 20, 640 - i * 6, { stroke: P.slate, width: 1.5, seed: 683 + i, double: false });
    sk.poly(hillG, [[950, 700], [990, 696], [994, 724], [946, 728]], { fill: P.mist, width: 3, seed: 690 });
    sk.path(hillG, [[948, 701], [970, 690], [992, 697]], { stroke: INK, width: 2, seed: 691, double: false });
    // salal / ferns on the slope (quiet, mid tone)
    for (let i = 0; i < 12; i++) {
      const x = 880 + i * 90 + hash(i + 700) * 20;
      fern(hillG, x, trailY(x) - BACK - 4, 50 + Math.abs(hash(i + 701)) * 30, -35 + (i % 3) * 30, 710 + i, P.mist);
    }
    // cut bank above the tread: exposed earth and roots
    const cutTop = trailPoints.filter(([x]) => x >= 700).map(([x, y]) => [x, y - BACK - 22 - Math.abs(hash(x * 0.07)) * 8]);
    const cutBot = trailPoints.filter(([x]) => x >= 700).map(([x, y]) => [x, y - BACK]).reverse();
    sk.poly(hillG, cutTop.concat(cutBot), { fill: P.slate, stroke: P.storm, width: LINE.detail, seed: 730, wobble: 1 });
    for (let i = 0; i < 14; i++) {
      const x = 760 + i * 84 + hash(i + 740) * 20, y = trailY(x) - BACK - 14;
      sk.path(hillG, [[x, y], [x + 12, y + 6], [x + 22, y + 4], [x + 34, y + 12]], { stroke: P.storm, width: 2.5, seed: 750 + i, double: false });
    }

    // ------------------------------------------------------------------ HANDRAIL (uphill edge, behind figures)
    const railG = el("g", { class: "rail" }, g);
    const posts = [];
    for (let x = 150; x <= 1450; x += 162) posts.push(x);
    const postTop = (x) => trailY(x) - BACK - 112;
    const postMid = (x) => trailY(x) - BACK - 60;
    sk.path(railG, posts.map((x) => [x, postTop(x) + 4]), { stroke: INK, width: 7, seed: 800, wobble: 1.2 });
    sk.path(railG, posts.map((x) => [x, postTop(x) + 4]), { stroke: P.mist, width: 3, seed: 801, wobble: 1.2, double: false });
    sk.path(railG, posts.map((x) => [x, postMid(x)]), { stroke: INK, width: 6, seed: 802, wobble: 1.2 });
    sk.path(railG, posts.map((x) => [x, postMid(x)]), { stroke: P.steel, width: 2.5, seed: 803, wobble: 1.2, double: false });
    posts.forEach((x, i) => {
      const yb = trailY(x) - BACK + 6, yt = postTop(x) - 8;
      sk.poly(railG, [[x - 8, yb], [x - 7, yt], [x + 7, yt - 2], [x + 8, yb]], { fill: P.steel, stroke: INK, width: 3, seed: 810 + i, wobble: 0.8 });
      sk.line(railG, x - 2, yt + 12, x - 1, yb - 10, { stroke: P.slate, width: 1.5, seed: 830 + i, double: false });
      sk.line(railG, x + 3, yt + 30, x + 3, yt + 60, { stroke: P.slate, width: 1.5, seed: 850 + i, double: false });
    });

    // ------------------------------------------------------------------ THE TRAIL (tread)
    const trailG = el("g", { class: "trail" }, g);
    const backEdge = trailPoints.map(([x, y]) => [x, y - BACK]);
    const frontEdge = trailPoints.map(([x, y]) => [x, y + FRONT]).reverse();
    sk.poly(trailG, [[-20, trailY(0) - BACK]].concat(backEdge, [[1940, trailY(1920) - BACK], [1940, trailY(1920) + FRONT]], frontEdge, [[-20, trailY(0) + FRONT]]),
      { fill: P.mist, stroke: "none", seed: 900, wobble: 0, double: false });
    sk.path(trailG, backEdge, { stroke: P.storm, width: LINE.detail + 1, seed: 901, wobble: 1.4 });
    // ruts, pebbles and texture on the tread
    for (let i = 0; i < 3; i++) {
      const off = -22 + i * 16;
      const seg = trailPoints.filter((p, k) => (k + i * 5) % 9 < 6).map(([x, y]) => [x, y + off]);
      for (let s = 0; s < seg.length - 2; s += 6) sk.path(trailG, seg.slice(s, s + 4), { stroke: P.steel, width: 2, seed: 910 + i * 40 + s, wobble: 1.2, double: false, opacity: 0.8 });
    }
    for (let i = 0; i < 60; i++) {
      const x = 10 + i * 32 + hash(i + 960) * 12, y = trailY(x) - 24 + Math.abs(hash(i + 961)) * 48;
      el("ellipse", { cx: f1(x), cy: f1(y), rx: f1(2 + Math.abs(hash(i)) * 3), ry: f1(1.5 + Math.abs(hash(i + 1)) * 1.5), fill: i % 3 ? P.steel : P.fog, stroke: P.slate, "stroke-width": 1 }, trailG);
    }
    // puddles (a little sky in them)
    [[360, 10, 70], [1150, 6, 58], [1660, 12, 48]].forEach(([x, dy, w], i) => {
      const y = trailY(x) + dy;
      const pts = [];
      for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; pts.push([x + Math.cos(a) * w * (1 + hash(k + i * 9) * 0.12), y + Math.sin(a) * w * 0.17]); }
      sk.poly(trailG, pts, { fill: P.fog, stroke: P.slate, width: LINE.detail, seed: 1000 + i, wobble: 0.6 });
      sk.line(trailG, x - w * 0.5, y - 2, x + w * 0.1, y - 3, { stroke: P.paper, width: 2, seed: 1010 + i, double: false });
      sk.line(trailG, x - w * 0.2, y + 3, x + w * 0.45, y + 2, { stroke: P.mist, width: 1.5, seed: 1020 + i, double: false });
    });
    // roots crossing the tread
    [[560, 1], [930, -1], [1400, 1], [1830, -1]].forEach(([x, dir], i) => {
      const y0 = trailY(x) - BACK + 2;
      sk.path(trailG, [[x, y0], [x + dir * 10, y0 + 14], [x + dir * 4, y0 + 30], [x + dir * 18, y0 + 46], [x + dir * 26, y0 + 62]], { stroke: P.storm, width: 5, seed: 1040 + i, wobble: 1 });
      sk.path(trailG, [[x + dir * 4, y0 + 30], [x + dir * 30, y0 + 34], [x + dir * 48, y0 + 44]], { stroke: P.storm, width: 3, seed: 1050 + i, wobble: 1, double: false });
    });
    // log water-bars across the tread (trail-crew detail)
    [760, 1250, 1720].forEach((x, i) => {
      const yb = trailY(x - 30) - BACK + 4, yf = trailY(x + 30) + FRONT - 4;
      sk.poly(trailG, [[x - 34, yb], [x - 22, yb - 4], [x + 38, yf - 4], [x + 26, yf]], { fill: P.steel, stroke: INK, width: 3, seed: 1060 + i, wobble: 0.8 });
      sk.line(trailG, x - 24, yb + 2, x + 28, yf - 6, { stroke: P.slate, width: 1.5, seed: 1070 + i, double: false });
    });
    sk.path(trailG, trailPoints.map(([x, y]) => [x, y + FRONT]), { stroke: INK, width: LINE.main, seed: 1080, wobble: 1.6 });

    // ------------------------------------------------------------------ SIGN (uphill side)
    const SIGN_X = 1585, SIGN_Y = 395, postY = trailY(SIGN_X) - BACK + 10;
    const signG = el("g", { class: "evac-sign" }, g);
    sk.poly(signG, [[SIGN_X - 7, postY], [SIGN_X - 6, SIGN_Y + 40], [SIGN_X + 6, SIGN_Y + 40], [SIGN_X + 7, postY]], { fill: P.mist, stroke: INK, width: 3, seed: 1100 });
    for (let i = 0; i < 3; i++) sk.line(signG, SIGN_X - 2 + i * 2, SIGN_Y + 120 + i * 50, SIGN_X - 1 + i * 2, SIGN_Y + 150 + i * 50, { stroke: P.slate, width: 1.5, seed: 1101 + i, double: false });
    sk.rect(signG, SIGN_X - 112, SIGN_Y - 88, 224, 176, { fill: P.steel, stroke: INK, width: LINE.main, seed: 1110, wobble: 1 });
    sk.rect(signG, SIGN_X - 102, SIGN_Y - 78, 204, 156, { fill: "none", stroke: P.paper, width: 3, seed: 1111, wobble: 0.8, double: false });
    // wave-and-arrow icon
    sk.path(signG, [[SIGN_X - 88, SIGN_Y - 22], [SIGN_X - 74, SIGN_Y - 40], [SIGN_X - 56, SIGN_Y - 48], [SIGN_X - 44, SIGN_Y - 40], [SIGN_X - 56, SIGN_Y - 36], [SIGN_X - 60, SIGN_Y - 26], [SIGN_X - 40, SIGN_Y - 22]], { stroke: P.paper, width: 4, seed: 1112, wobble: 0.6, double: false });
    sk.path(signG, [[SIGN_X - 92, SIGN_Y - 14], [SIGN_X - 40, SIGN_Y - 14]], { stroke: P.paper, width: 3, seed: 1113, wobble: 0.5, double: false });
    // big uphill arrow (up and to the right)
    sk.poly(signG, [[SIGN_X + 10, SIGN_Y - 14], [SIGN_X + 50, SIGN_Y - 54], [SIGN_X + 38, SIGN_Y - 64], [SIGN_X + 88, SIGN_Y - 72], [SIGN_X + 80, SIGN_Y - 22], [SIGN_X + 68, SIGN_Y - 34], [SIGN_X + 28, SIGN_Y + 6]], { fill: P.paper, stroke: INK, width: 2.5, seed: 1114, wobble: 0.6 });
    const txt = (s, y, size, w) => {
      const t = el("text", { x: SIGN_X, y, textLength: w, lengthAdjust: "spacingAndGlyphs", "text-anchor": "middle", "font-family": "League Gothic, Oswald, Impact, sans-serif", "font-size": size, fill: P.paper, "letter-spacing": 1.5 }, signG);
      t.textContent = s;
      return t;
    };
    txt("TSUNAMI", SIGN_Y + 24, 34, 120);
    txt("EVACUATION ROUTE", SIGN_Y + 58, 28, 184);
    // little distance plate under the sign
    sk.rect(signG, SIGN_X - 64, SIGN_Y + 98, 128, 34, { fill: P.paper, stroke: INK, width: 3, seed: 1120, wobble: 0.6 });
    const t2 = el("text", { x: SIGN_X, y: SIGN_Y + 123, "text-anchor": "middle", "font-family": "League Gothic, Oswald, Impact, sans-serif", "font-size": 22, fill: P.storm, textLength: 108, lengthAdjust: "spacingAndGlyphs" }, signG);
    t2.textContent = "HILLTOP 0.4 MI";
    sk.hatch(signG, SIGN_X - 112, SIGN_Y - 88, 224, 176, { gap: 18, angle: 135, stroke: P.slate, width: 1.5, opacity: 0.25, seed: 1130 });

    // ------------------------------------------------------------------ DOWNHILL BANK + FOREGROUND (below the trail)
    const fgG = el("g", { class: "foreground" }, g);
    const bankTop = trailPoints.map(([x, y]) => [x, y + FRONT]);
    sk.poly(fgG, [[-20, trailY(0) + FRONT]].concat(bankTop, [[1940, trailY(1920) + FRONT], [1940, 1100], [-20, 1100]]), { fill: bankFill, stroke: "none", seed: 1200, wobble: 0, double: false });
    sk.path(fgG, bankTop, { stroke: INK, width: LINE.main, seed: 1201, wobble: 1.8 });
    sk.hatch(fgG, 0, 760, 1920, 180, { gap: 14, angle: 40, stroke: P.night, width: 2, opacity: 0.3, seed: 1202 });
    // rocks and ferns along the outer edge of the trail
    [[120, 18, 1210], [690, 16, 1211], [1030, 22, 1212], [1480, 18, 1213], [1890, 24, 1214]].forEach(([x, w, s]) => rock(fgG, x, trailY(x) + FRONT + 10, w, w * 0.7, s, P.steel));
    for (let i = 0; i < 26; i++) {
      const x = 30 + i * 74 + hash(i + 1220) * 20;
      const y = trailY(x) + FRONT + 18 + Math.abs(hash(i + 1221)) * 18;
      fern(fgG, x, y, 46 + Math.abs(hash(i + 1222)) * 34, (i % 2 ? 1 : -1) * (20 + Math.abs(hash(i + 1223)) * 30), 1230 + i, i % 3 ? P.steel : P.mist);
    }
    // big foreground fir trunk framing the right edge, roots onto the trail
    const tx = 1870, tb = trailY(tx) + FRONT + 4;
    sk.poly(fgG, [[tx - 70, tb + 30], [tx - 40, tb - 20], [tx - 34, -20], [tx + 40, -20], [tx + 46, tb - 20], [tx + 90, tb + 40], [tx + 90, 1100], [tx - 90, 1100]],
      { fill: P.night, stroke: INK, width: LINE.main, seed: 1300, wobble: 1.6 });
    for (let i = 0; i < 9; i++) {
      const bx = tx - 24 + (i % 5) * 14, by = 40 + i * 96;
      sk.path(fgG, [[bx, by], [bx + 3, by + 40], [bx - 2, by + 80]], { stroke: P.slate, width: 2, seed: 1310 + i, wobble: 1.4, double: false });
    }
    sk.hatch(fgG, tx - 40, 0, 80, tb, { gap: 10, angle: 100, stroke: P.storm, width: 2, opacity: 0.5, seed: 1320 });
    sk.path(fgG, [[tx - 50, tb - 10], [tx - 90, tb - 2], [tx - 130, tb + 2], [tx - 170, tb + 14]], { stroke: INK, width: 6, seed: 1330, wobble: 1.4 });
    // drooping boughs across the top-left corner and top-right (a tree just out of frame)
    const bough = (x0, y0, len, dir, seed) => {
      const bg = el("g", {}, fgG);
      const pts = [];
      for (let i = 0; i <= 8; i++) { const t = i / 8; pts.push([x0 + dir * len * t, y0 + Math.sin(t * Math.PI * 0.8) * len * 0.22 + t * len * 0.05]); }
      sk.path(bg, pts, { stroke: INK, width: 5, seed, wobble: 1 });
      for (let i = 1; i < pts.length; i++) {
        const [px, py] = pts[i], l = 46 * (1 - i / 10);
        for (let k = -2; k <= 2; k++) sk.line(bg, px, py, px + dir * (8 + k * 4), py + l * (0.6 + k * 0.12), { stroke: P.night, width: 3, seed: seed + i * 5 + k, wobble: 0.6, double: false });
      }
      return bg;
    };
    bough(-30, 18, 380, 1, 1400);
    bough(-30, 92, 250, 1, 1450);
    bough(-30, -10, 520, 1, 1500);
    bough(1840, 40, 360, -1, 1550);
    bough(1840, 150, 220, -1, 1600);

    return {
      g,
      groundY: Math.round(trailY(0)),
      trailY,
      trailPoints,
      trail: { g: trailG, x0: 0, y0: Math.round(trailY(0)), x1: 1920, y1: Math.round(trailY(1920)) },
      harbor: { g: viewG, waterG, floatG, levelY: LEVEL0, drainedY: 545, surgedY: 405, setLevel, get currentY() { return levelNow; } },
      horizon: { y: HORIZON, x0: 0, x1: 560, g: horizonG },
      waveLine: { g: waveOuter, scaleG: waveInner, x0: 50, x1: 570, y: HORIZON, cx: WCX, cy: HORIZON },
      sign: { g: signG, x: SIGN_X, y: SIGN_Y, postX: SIGN_X, postY: Math.round(postY) },
      rail: { g: railG },
      hill: { g: hillG },
      view: { g: viewG },
      sky: { g: skyG },
      dock: { g: dockG },
      ferry: { g: ferryG },
    };
  };
})();
