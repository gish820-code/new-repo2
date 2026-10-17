/* Rainy Day background — mainStreet (Gull Harbor main street), v1.
 *
 * Paste VERBATIM after assets/characters/rainy-day-rig-v1.js. Guarded; registers window.RainyDayBG.mainStreet.
 *
 *   const bg = window.RainyDayBG.mainStreet(bgLayer, { damage: 0 });   // bgLayer = <g> in a 1920x1080 SVG
 *
 * View: a small Washington coastal town street looking roughly south. Harbor + ferry dock + moored ferry at LEFT,
 * storefronts along the back (post office, diner, hardware store with the painted "GULL HARBOR" wall sign), gas station at RIGHT, the
 * hill rising to the east (right background) with the tiny school on its lower slope and the evacuation trail.
 * Static and deterministic; scenes own all motion (no GSAP inside). Weather is NOT included (add RainyDay.rain).
 *
 * OPTS (all optional)
 *   damage      0 | 1   (default 0). 1 = post-quake: cracked asphalt, broken/crooked windows, leaning power pole
 *                       with sagging + snapped lines, tilted gas-station canopy, scattered debris, buckled sidewalk.
 *   level       number  initial harbor water y (default harbor.levelY = 650).
 *   floatFerry  bool    (default true) setLevel() also floats the ferry on the water (rises on a surge, settles and
 *                       lists in the mud when drained). Pass false if the scene wants to move the ferry itself.
 *   seed        number  wobble seed (default 3).
 *
 * HANDLES (return value)
 *   g            root <g> of the whole background.
 *   groundY      860   street line where feet stand (figure hip y = 860 - 116*scale; scale 1.4 -> y 697.6).
 *                The street runs full width (x 0..1920); the harbor seawall + railing sit behind it at left.
 *   sidewalkY    782   back sidewalk / building base line.   nearCurbY 1000 (front curb; below it = caption zone).
 *   harbor       { g, waterG, shoreX: 545, levelY: 650, drainedY: 790, lowY: 720, surgedY: 560, floodY: 480,
 *                  wallY: 768, deckY: 612, level, setLevel(y) }
 *                - waterG holds the harbor water AND the street flood sheet; it sits in FRONT of the street,
 *                  buildings and gas station (but behind poles/railing/sign), so a surge visibly floods the town.
 *                - setLevel(y) redraws the water surface at image height y (pure function of y, seek-safe; call it
 *                  from a tween's onUpdate). Larger y = lower water:
 *                    650 normal (just under the pier deck) · 720 low · 790 fully DRAINED (exposed mud, rocks,
 *                    stranded rowboat, pilings with water marks, ferry aground and listing)
 *                    < 625 water tops the pier and spills over the seawall onto the street: the flood sheet
 *                    grows rightward and deepens (y 560 ~ floods to x 1450 / ~50px deep; y <= 500 whole street,
 *                    ~95px up the storefronts; 480 = floodY, everything awash).
 *                - level = the current y (read-only bookkeeping).
 *   dock         { g, deckY: 612, x0: 16, x1: 548, hut: { g } }  the ferry pier (pilings, deck, terminal hut).
 *   ferry        { g, floatG, x: 240, waterline: 650 }  g is scene-owned (translate/rotate freely); floatG is
 *                driven by setLevel when floatFerry is on.
 *   gasStation   { g, canopyG, pumps: [{x,y}], x: 1590, y: 782 }  (canopyG is pre-tilted when damage = 1).
 *   hill         { g, ridge: [[x,y]..], yAt(x) }  hill surface y at x (east hill, right background).
 *   school       { g, x: 1720, y: 330 }  bottom-centre of the tiny school on the lower slope (above the gas canopy).
 *   trail        { g, points: [[x,y]..] }  the switchback evacuation trail from the school up to the ridge.
 *   sign         { g, x: 600, y: 300 }  the "ENTERING TSUNAMI HAZARD ZONE" sign (x = post, y = panel top; base y 800).
 *   poles        [{ g, x, baseY, top: [x,y] }]  power poles at x 300 / 945 / 1590 (index 1 leans + a line
 *                snaps when damaged).
 *   wires        { g }  all power lines.
 *   buildings    { postOffice, diner, hardware }  each a <g> (x 690–935 / 955–1225 / 1235–1565; doors ~330px).
 *   debris       { g }  post-quake debris layer (empty when damage = 0).
 *   layers       { sky, far, hill, mid, harbor, ground, water, front }  draw-order groups.
 */
(function () {
  window.RainyDayBG = window.RainyDayBG || {};
  if (window.RainyDayBG.mainStreet) return;

  window.RainyDayBG.mainStreet = function (parent, opts) {
    opts = opts || {};
    const RD = window.RainyDay, P = RD.palette, LINE = RD.LINE, sk = RD.sk, el = RD.el, H = RD.hash;
    const INK = P.ink;
    const DMG = (opts.damage || 0) >= 0.5;
    const floatFerry = opts.floatFerry !== false;
    const seed0 = opts.seed || 3;
    const uid = "rdms" + Math.round(Math.abs(H(seed0 * 1.7 + 0.3)) * 1e6);
    let sN = seed0 * 1000 + 11;
    const S = () => (sN += 7);

    const GROUND = 860, SIDE = 782, CURB = 812, NEAR = 1000, HORIZON = 560;
    const SHOREX = 545, LEVEL = 650, WALL = 768, DECK = 612, FLOOD0 = 625;
    const FONT_SIGN = "'League Gothic', Oswald, Impact, 'Arial Narrow', sans-serif";
    const FONT_HAND = "Kalam, 'Comic Sans MS', cursive";
    const f1 = (v) => (+v).toFixed(1);
    const D = (pts, close) => "M" + pts.map((p) => f1(p[0]) + " " + f1(p[1])).join(" L") + (close ? " Z" : "");

    const g = el("g", { class: "rdbg-main-street" }, parent);
    const defs = el("defs", {}, g);
    const layer = (name, par) => el("g", { class: "ms-" + name }, par || g);

    // ------------------------------------------------------------------ small helpers
    function txt(par, x, y, s, o) {
      o = o || {};
      const a = { x: f1(x), y: f1(y), "font-family": o.font || FONT_SIGN, "font-size": o.size || 24, fill: o.fill || INK, "text-anchor": o.anchor || "middle" };
      if (o.ls) a["letter-spacing"] = o.ls;
      if (o.weight) a["font-weight"] = o.weight;
      if (o.len) { a.textLength = o.len; a.lengthAdjust = "spacingAndGlyphs"; }
      if (o.opacity !== undefined) a.opacity = o.opacity;
      if (o.rot) a.transform = `rotate(${o.rot} ${f1(x)} ${f1(y)})`;
      const t = el("text", a, par);
      t.textContent = s;
      return t;
    }
    const ellPts = (cx, cy, rx, ry, n) => {
      const a = []; n = n || 20;
      for (let i = 0; i < n; i++) { const t = (i / n) * Math.PI * 2; a.push([cx + Math.cos(t) * rx, cy + Math.sin(t) * ry]); }
      return a;
    };
    const rotPt = (p, cx, cy, deg) => {
      const r = (deg * Math.PI) / 180, dx = p[0] - cx, dy = p[1] - cy;
      return [cx + dx * Math.cos(r) - dy * Math.sin(r), cy + dx * Math.sin(r) + dy * Math.cos(r)];
    };
    // texture lines as one path (bricks, siding, planks): rows of short jittered strokes
    function lines(par, segs, o) {
      o = o || {};
      const d = segs.map((s) => `M${f1(s[0])} ${f1(s[1])} L${f1(s[2])} ${f1(s[3])}`).join(" ");
      return el("path", { d, stroke: o.stroke || P.storm, "stroke-width": o.width || 1.6, fill: "none", opacity: o.opacity !== undefined ? o.opacity : 0.35, "stroke-linecap": "round" }, par);
    }
    function crack(par, x0, y0, x1, y1, o) {
      o = o || {};
      const n = o.n || 9, amp = o.amp || 10, seed = o.seed || S();
      const pts = [];
      for (let i = 0; i <= n; i++) {
        const t = i / n, nx = -(y1 - y0), ny = x1 - x0, len = Math.hypot(nx, ny) || 1;
        const k = i === 0 || i === n ? 0 : (i % 2 ? 1 : -1) * amp * (0.5 + 0.5 * Math.abs(H(seed + i)));
        pts.push([x0 + (x1 - x0) * t + (nx / len) * k, y0 + (y1 - y0) * t + (ny / len) * k]);
      }
      const cg = el("g", {}, par);
      if (o.shade) sk.path(cg, pts.map((p) => [p[0] + 3, p[1] + 4]), { stroke: o.shade, width: (o.width || 3) + 3, seed: seed + 3, double: false, opacity: 0.6 });
      sk.path(cg, pts, { stroke: o.stroke || INK, width: o.width || 3, seed, wobble: 1, double: false });
      if (o.branches) {
        for (let i = 2; i < n - 1; i += 3) {
          const p = pts[i], a = Math.atan2(y1 - y0, x1 - x0) + (i % 2 ? 0.9 : -0.9), l = amp * 3.2;
          sk.path(cg, [p, [p[0] + Math.cos(a) * l * 0.5 + H(seed + i) * 4, p[1] + Math.sin(a) * l * 0.5], [p[0] + Math.cos(a) * l, p[1] + Math.sin(a) * l]], { stroke: o.stroke || INK, width: Math.max(1.5, (o.width || 3) - 1.2), seed: seed + i * 5, double: false });
        }
      }
      return cg;
    }
    function glassStar(par, cx, cy, r, seed) {
      const cg = el("g", {}, par);
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2 + H(seed + i) * 0.4, rr = r * (0.55 + 0.45 * Math.abs(H(seed + i * 3)));
        const mid = [cx + Math.cos(a) * rr * 0.5 + H(seed + i * 5) * 3, cy + Math.sin(a) * rr * 0.5 + H(seed + i * 7) * 3];
        sk.path(cg, [[cx, cy], mid, [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]], { stroke: P.paper, width: 1.8, seed: seed + i, double: false, wobble: 0.6 });
      }
      sk.path(cg, ellPts(cx, cy, r * 0.32, r * 0.28, 9), { closed: true, stroke: P.paper, width: 1.5, seed: seed + 40, double: false, opacity: 0.8 });
      return cg;
    }
    // window: o = { lit, cols, rows, stroke, brk: 'crack' | 'smash' | 'crooked' }
    function win(par, x, y, w, h, o) {
      o = o || {};
      const wg = el("g", {}, par);
      const st = o.stroke || P.storm;
      sk.rect(wg, x, y, w, h, { fill: o.lit ? P.fog : P.slate, stroke: st, width: 3, seed: S(), wobble: 0.9 });
      sk.line(wg, x + w * 0.18, y + h * 0.5, x + w * 0.5, y + h * 0.16, { stroke: o.lit ? P.paper : P.mist, width: 2, opacity: 0.55, seed: S(), double: false });
      sk.line(wg, x + w * 0.3, y + h * 0.62, x + w * 0.56, y + h * 0.36, { stroke: o.lit ? P.paper : P.mist, width: 2, opacity: 0.35, seed: S(), double: false });
      const cols = o.cols || 1, rows = o.rows || 1;
      for (let c = 1; c < cols; c++) sk.line(wg, x + (w * c) / cols, y + 2, x + (w * c) / cols, y + h - 2, { stroke: st, width: 2.5, seed: S(), double: false });
      for (let r = 1; r < rows; r++) sk.line(wg, x + 2, y + (h * r) / rows, x + w - 2, y + (h * r) / rows, { stroke: st, width: 2.5, seed: S(), double: false });
      sk.line(wg, x - 6, y + h + 4, x + w + 6, y + h + 4, { stroke: st, width: LINE.main, seed: S() });
      if (DMG && o.brk) {
        if (o.brk === "smash") {
          const sx = x + w * 0.55, sy = y + h * 0.4;
          sk.poly(wg, [[sx - w * 0.3, sy - h * 0.25], [sx + w * 0.05, sy - h * 0.32], [sx + w * 0.3, sy + h * 0.05], [sx + w * 0.02, sy + h * 0.4], [sx - w * 0.12, sy + h * 0.08], [sx - w * 0.34, sy + h * 0.2]], { fill: P.night, stroke: P.paper, width: 1.6, seed: S(), double: false });
          glassStar(wg, sx - w * 0.3, sy - h * 0.2, Math.min(w, h) * 0.35, S());
        } else if (o.brk === "crack") {
          glassStar(wg, x + w * (0.3 + 0.4 * Math.abs(H(S()))), y + h * 0.45, Math.min(w, h) * 0.45, S());
        } else if (o.brk === "crooked") {
          wg.setAttribute("transform", `rotate(${o.rot || 4} ${f1(x)} ${f1(y)})`);
          glassStar(wg, x + w * 0.6, y + h * 0.6, Math.min(w, h) * 0.3, S());
        }
      }
      return wg;
    }
    function fir(par, x, base, h, o) {
      o = o || {};
      const tg = el("g", {}, par);
      const fill = o.fill || P.storm, stroke = o.stroke || P.night, wd = o.width || 2, w = h * (o.wide || 0.36);
      sk.line(tg, x, base, x, base - h * 0.2, { stroke, width: Math.max(2, h / 40), seed: S(), double: false });
      const tiers = o.tiers || 4;
      for (let i = 0; i < tiers; i++) {
        const tb = base - h * 0.1 - i * h * (0.68 / tiers);
        const tt = i === tiers - 1 ? base - h : tb - h * 0.42;
        const tw = w * (1 - i * (0.7 / tiers));
        sk.poly(tg, [[x - tw, tb], [x - tw * 0.45, tb - (tb - tt) * 0.35], [x, tt], [x + tw * 0.45, tb - (tb - tt) * 0.35], [x + tw, tb], [x + tw * 0.3, tb - h * 0.035], [x - tw * 0.3, tb - h * 0.035]], { fill, stroke, width: wd, seed: S(), wobble: Math.max(0.6, h / 90), double: h > 90 });
      }
      return tg;
    }
    function gull(par, x, y, s, o) {
      o = o || {};
      s = s || 1;
      return el("path", { d: `M${f1(x - 9 * s)} ${f1(y)} Q${f1(x - 4 * s)} ${f1(y - 6 * s)} ${f1(x)} ${f1(y)} Q${f1(x + 4 * s)} ${f1(y - 6 * s)} ${f1(x + 9 * s)} ${f1(y)}`, stroke: o.stroke || INK, "stroke-width": o.width || 2, fill: "none", "stroke-linecap": "round", opacity: o.opacity || 0.85 }, par);
    }
    function sittingGull(par, x, y) {
      const gg = el("g", {}, par);
      sk.path(gg, [[x - 9, y], [x - 6, y - 7], [x + 2, y - 9], [x + 8, y - 14], [x + 12, y - 12], [x + 8, y - 8], [x + 10, y - 2], [x + 2, y]], { closed: true, fill: P.paper, stroke: INK, width: 2, seed: S(), wobble: 0.4, double: false });
      sk.line(gg, x - 10, y - 4, x - 1, y - 6, { stroke: P.slate, width: 2, seed: S(), double: false });
      el("circle", { cx: x + 9, cy: y - 12, r: 1.2, fill: INK }, gg);
      return gg;
    }

    // ------------------------------------------------------------------ SKY
    const skyL = layer("sky");
    const sg = el("linearGradient", { id: uid + "sky", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    [[0, P.night], [0.45, P.storm], [0.82, P.slate], [1, P.steel]].forEach(([o, c]) => el("stop", { offset: o, "stop-color": c }, sg));
    el("rect", { x: -40, y: -40, width: 2000, height: 1160, fill: P.storm }, skyL);
    el("rect", { x: -40, y: -40, width: 2000, height: HORIZON + 50, fill: `url(#${uid}sky)` }, skyL);
    function cloud(par, x0, x1, cy, h, fill, op, sd) {
      const pts = [], n = Math.max(6, Math.round((x1 - x0) / 55));
      for (let i = 0; i <= n; i++) {
        const t = i / n, x = x0 + (x1 - x0) * t;
        const bump = Math.pow(Math.sin(t * Math.PI), 0.7) * h * (0.65 + 0.35 * Math.abs(H(sd + i)));
        pts.push([x, cy - bump + (i % 2 ? h * 0.12 : 0)]);
      }
      pts.push([x1 - 30, cy + h * 0.18], [x0 + (x1 - x0) * 0.6, cy + h * 0.26], [x0 + 40, cy + h * 0.16]);
      const cg = sk.path(par, pts, { closed: true, fill, stroke: P.night, width: LINE.detail, seed: sd, wobble: 3, opacity: op });
      sk.hatch(par, x0 + 30, cy - h * 0.1, x1 - x0 - 60, h * 0.32, { gap: 11, angle: 20, stroke: P.night, width: 1.5, opacity: 0.18 * op, seed: sd + 2 });
      return cg;
    }
    cloud(skyL, -80, 620, 120, 90, P.storm, 0.9, S());
    cloud(skyL, 480, 1260, 70, 70, P.night, 0.55, S());
    cloud(skyL, 1050, 2000, 140, 110, P.storm, 0.85, S());
    cloud(skyL, 120, 900, 300, 70, P.slate, 0.6, S());
    cloud(skyL, 820, 1500, 250, 60, P.storm, 0.5, S());
    cloud(skyL, -60, 380, 430, 50, P.slate, 0.55, S());
    // distant rain curtains
    sk.hatch(skyL, 0, 150, 760, 420, { gap: 20, angle: 102, stroke: P.mist, width: 2, opacity: 0.1, seed: S() });
    sk.hatch(skyL, 900, 200, 600, 330, { gap: 24, angle: 100, stroke: P.mist, width: 2, opacity: 0.07, seed: S() });
    [[300, 205, 1], [338, 218, 0.8], [720, 170, 1.1], [1010, 330, 0.7]].forEach(([x, y, s]) => gull(skyL, x, y, s, { opacity: 0.6 }));

    // ------------------------------------------------------------------ FAR: open sea, headland, lighthouse
    const farL = layer("far");
    sk.path(farL, [[-30, HORIZON], [1500, HORIZON], [1500, 730], [-30, 730]], { closed: true, fill: P.slate, stroke: P.storm, width: LINE.detail, seed: S(), wobble: 0.5 });
    sk.line(farL, -20, HORIZON + 1, 1500, HORIZON + 1, { stroke: P.mist, width: 2, opacity: 0.55, seed: S(), double: false, wobble: 0.6 });
    const waveSegs = [];
    for (let i = 0; i < 46; i++) {
      const x = ((i * 137) % 1480) + 10, y = HORIZON + 10 + ((i * 53) % 150);
      const l = 10 + (y - HORIZON) * 0.18;
      waveSegs.push([x, y, x + l, y]);
    }
    lines(farL, waveSegs, { stroke: P.mist, width: 2, opacity: 0.35 });
    // headland across the bay, with tiny firs and a lighthouse
    sk.path(farL, [[-30, 578], [-30, 520], [30, 508], [90, 512], [150, 526], [210, 540], [262, 552], [300, 566], [320, 578]], { closed: true, fill: P.storm, stroke: P.night, width: LINE.detail, seed: S(), wobble: 1.2 });
    for (let i = 0; i < 9; i++) fir(farL, -10 + i * 26, 518 + i * 3.6, 26 + (i % 3) * 7, { fill: P.night, stroke: P.night, width: 1.5, tiers: 3 });
    sk.rect(farL, 268, 528, 9, 30, { fill: P.fog, stroke: P.night, width: 2, seed: S(), wobble: 0.3, double: false });
    sk.poly(farL, [[265, 529], [272.5, 520], [280, 529]], { fill: P.night, stroke: P.night, width: 2, seed: S(), double: false });
    sk.path(farL, [[264, 525], [222, 512], [222, 538]], { closed: true, fill: P.fog, stroke: "none", width: 0.1, opacity: 0.12, seed: S(), double: false });
    sk.path(farL, [[380, 566], [410, 556], [450, 553], [490, 560], [510, 567]], { closed: true, fill: P.storm, stroke: P.night, width: 1.6, seed: S(), double: false });

    // ------------------------------------------------------------------ HILL (east), school, trail
    const hillL = layer("hill");
    const ridge = [[980, 430], [1150, 352], [1300, 292], [1450, 238], [1600, 192], [1740, 152], [1860, 122], [1960, 104]];
    const hillY = (x) => {
      if (x <= ridge[0][0]) return ridge[0][1];
      for (let i = 0; i < ridge.length - 1; i++) {
        const a = ridge[i], b = ridge[i + 1];
        if (x <= b[0]) return a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0]);
      }
      return ridge[ridge.length - 1][1];
    };
    // a farther ridge behind for depth
    sk.path(hillL, [[1100, 420], [1260, 300], [1420, 225], [1600, 160], [1780, 112], [1960, 70], [1960, 460], [1100, 460]], { closed: true, fill: P.steel, stroke: P.slate, width: LINE.detail, seed: S(), wobble: 2, opacity: 0.7 });
    sk.path(hillL, ridge.concat([[1960, 800], [980, 800]]), { closed: true, fill: P.slate, stroke: P.storm, width: LINE.main, seed: S(), wobble: 2 });
    sk.hatch(hillL, 1000, 100, 960, 700, { gap: 16, angle: 62, stroke: P.storm, width: 1.6, opacity: 0.22, seed: S() });
    const grass = [];
    for (let i = 0; i < 90; i++) {
      const x = 1000 + ((i * 97) % 950), y = hillY(x) + 18 + ((i * 61) % 300);
      grass.push([x, y, x + 3, y - 9], [x + 5, y, x + 9, y - 7]);
    }
    lines(hillL, grass, { stroke: P.mist, width: 1.6, opacity: 0.28 });
    // ridge firs (top row)
    for (let i = 0; i < 32; i++) {
      const x = 990 + i * 31 + H(i + 300) * 9;
      fir(hillL, x, hillY(x) + 12 + Math.abs(H(i + 50)) * 8, 50 + Math.abs(H(i + 80)) * 36, { fill: P.storm, stroke: P.night, width: 2 });
    }
    // school (lower slope, just above the gas-station canopy)
    const SCHX = 1720, SCHY = 330;
    // firs flanking the school clearing
    [[1600, 318, 70], [1628, 336, 58], [1806, 300, 64], [1838, 318, 72], [1878, 286, 60], [1912, 312, 70], [1650, 250, 46], [1860, 236, 44], [1770, 214, 40]].forEach(([x, b, h]) => fir(hillL, x, b, h, { fill: P.storm, stroke: P.night, width: 2, tiers: 3 }));
    const schoolG = el("g", { class: "ms-school" }, hillL);
    sk.path(schoolG, ellPts(SCHX + 6, SCHY + 2, 96, 12, 18), { closed: true, fill: P.steel, stroke: "none", seed: S(), double: false, opacity: 0.9 });
    sk.rect(schoolG, SCHX - 54, SCHY - 58, 108, 58, { fill: P.fog, stroke: P.storm, width: 3, seed: S(), wobble: 0.6 });
    sk.poly(schoolG, [[SCHX - 64, SCHY - 56], [SCHX, SCHY - 84], [SCHX + 64, SCHY - 56]], { fill: P.steel, stroke: P.storm, width: 3, seed: S(), wobble: 0.6 });
    lines(schoolG, [[SCHX - 42, SCHY - 62, SCHX + 42, SCHY - 62], [SCHX - 26, SCHY - 70, SCHX + 26, SCHY - 70]], { stroke: P.storm, opacity: 0.5 });
    sk.rect(schoolG, SCHX - 8, SCHY - 100, 16, 18, { fill: P.fog, stroke: P.storm, width: 2.5, seed: S(), wobble: 0.4, double: false });
    sk.poly(schoolG, [[SCHX - 12, SCHY - 99], [SCHX, SCHY - 112], [SCHX + 12, SCHY - 99]], { fill: P.steel, stroke: P.storm, width: 2.5, seed: S(), double: false });
    el("circle", { cx: SCHX, cy: SCHY - 90, r: 3.5, fill: P.storm }, schoolG);
    for (let i = 0; i < 4; i++) if (i !== 2) win(schoolG, SCHX - 46 + i * 24, SCHY - 44, 15, 16, { stroke: P.storm });
    sk.rect(schoolG, SCHX + 4, SCHY - 30, 15, 30, { fill: P.slate, stroke: P.storm, width: 2.5, seed: S(), double: false });
    txt(schoolG, SCHX - 2, SCHY - 50, "SCHOOL", { size: 11, fill: P.storm, len: 44, ls: 1 });
    sk.line(schoolG, SCHX + 72, SCHY + 2, SCHX + 72, SCHY - 92, { stroke: P.storm, width: 2.5, seed: S(), double: false });
    sk.path(schoolG, [[SCHX + 72, SCHY - 90], [SCHX + 94, SCHY - 87], [SCHX + 92, SCHY - 79], [SCHX + 72, SCHY - 78]], { closed: true, fill: P.paper, stroke: P.storm, width: 1.8, seed: S(), double: false });
    // evacuation trail (switchbacks) from the school up the ridge
    const trailPts = [[SCHX - 30, SCHY + 6], [1800, 300], [1752, 276], [1858, 244], [1812, 216], [1930, 184], [1902, 156], [1960, 146]];
    const trailG = el("g", { class: "ms-trail" }, hillL);
    sk.path(trailG, trailPts, { stroke: P.storm, width: 7, seed: S(), wobble: 1.2, double: false, opacity: 0.6 });
    const tr = sk.path(trailG, trailPts, { stroke: P.fog, width: 3, seed: S(), wobble: 1.2, double: false, opacity: 0.85 });
    tr.querySelectorAll("path").forEach((p) => p.setAttribute("stroke-dasharray", "10 8"));
    sk.line(trailG, 1792, 300, 1792, 280, { stroke: P.storm, width: 2.5, seed: S(), double: false });
    sk.rect(trailG, 1781, 266, 24, 15, { fill: P.steel, stroke: P.paper, width: 1.5, seed: S(), double: false });
    el("path", { d: "M1786 277 L1793 269 L1800 277 M1793 270 L1793 279", stroke: P.paper, "stroke-width": 1.8, fill: "none", "stroke-linecap": "round" }, trailG);
    // atmospheric haze over the far layers
    const hz = el("linearGradient", { id: uid + "haze", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    [[0, 0], [0.6, 0.16], [1, 0.05]].forEach(([o, a]) => el("stop", { offset: o, "stop-color": P.mist, "stop-opacity": a }, hz));
    el("rect", { x: -40, y: 260, width: 2000, height: 460, fill: `url(#${uid}haze)` }, hillL);

    // ------------------------------------------------------------------ HARBOR (bed, ferry, pier) — water comes later
    const harborL = layer("harbor");
    const bedG = el("g", { class: "ms-harbor-bed" }, harborL);
    const bedTop = [];
    for (let i = 0; i <= 12; i++) { const x = -20 + i * 46; bedTop.push([x, 668 + x * 0.035 + H(i + 900) * 5]); }
    sk.path(bedG, bedTop.concat([[540, 772], [-20, 772]]), { closed: true, fill: P.storm, stroke: P.night, width: LINE.detail, seed: S(), wobble: 1.5 });
    sk.hatch(bedG, -20, 670, 560, 100, { gap: 9, angle: 8, stroke: P.night, width: 1.6, opacity: 0.4, seed: S() });
    // mud ripples, rocks, kelp, junk revealed when the water drains
    const rip = [];
    for (let i = 0; i < 22; i++) { const x = (i * 83) % 520, y = 690 + ((i * 37) % 70); rip.push([x, y, x + 22, y + 1]); }
    lines(bedG, rip, { stroke: P.steel, width: 2, opacity: 0.45 });
    [[30, 700, 16, 10], [96, 742, 22, 13], [176, 708, 12, 8], [250, 752, 18, 11], [342, 700, 14, 9], [430, 728, 20, 12], [505, 702, 12, 9], [60, 762, 14, 7]].forEach(([x, y, rx, ry], i) => {
      sk.path(bedG, [[x - rx, y + ry * 0.4], [x - rx * 0.7, y - ry * 0.6], [x - rx * 0.1, y - ry], [x + rx * 0.7, y - ry * 0.6], [x + rx, y + ry * 0.4]], { closed: true, fill: i % 2 ? P.steel : P.slate, stroke: INK, width: 2, seed: S(), wobble: 0.8, double: false });
    });
    [[140, 702], [300, 690], [470, 745], [215, 760]].forEach(([x, y]) => {
      sk.path(bedG, [[x, y], [x - 6, y - 10], [x + 3, y - 20], [x - 4, y - 30]], { stroke: P.slate, width: 3, seed: S(), double: false });
      sk.path(bedG, [[x + 5, y], [x + 9, y - 12], [x + 4, y - 22]], { stroke: P.slate, width: 2.5, seed: S(), double: false });
    });
    // stranded rowboat
    sk.path(bedG, [[300, 722], [372, 716], [382, 726], [366, 742], [314, 746], [296, 734]], { closed: true, fill: P.mist, stroke: INK, width: 3, seed: S(), wobble: 0.8 });
    sk.line(bedG, 304, 729, 376, 722, { stroke: INK, width: 2, seed: S(), double: false });
    lines(bedG, [[318, 730, 320, 744], [345, 728, 346, 744]], { stroke: INK, opacity: 0.6, width: 2 });
    // old tire + shopping cart + crab
    sk.path(bedG, ellPts(462, 760, 16, 7, 14), { closed: true, fill: P.night, stroke: INK, width: 3, seed: S(), double: false });
    sk.path(bedG, ellPts(462, 759, 7, 3, 10), { closed: true, fill: P.storm, stroke: INK, width: 1.6, seed: S(), double: false });
    sk.path(bedG, [[150, 744], [196, 744], [190, 764], [156, 764]], { closed: true, stroke: P.mist, width: 2, seed: S(), double: false });
    lines(bedG, [[160, 744, 162, 764], [170, 744, 171, 764], [180, 744, 180, 764], [153, 754, 193, 754]], { stroke: P.mist, width: 1.5, opacity: 0.7 });
    sk.line(bedG, 196, 744, 206, 734, { stroke: P.mist, width: 2, seed: S(), double: false });
    sk.path(bedG, ellPts(244, 718, 8, 5, 10), { closed: true, fill: P.steel, stroke: INK, width: 2, seed: S(), double: false });
    lines(bedG, [[236, 716, 230, 710], [252, 716, 258, 710], [238, 721, 232, 725], [250, 721, 256, 725]], { stroke: INK, width: 1.8, opacity: 0.9 });

    // the ferry (behind the pier). floatG is moved by setLevel; ferryG is the scene's to animate.
    const ferryG = el("g", { class: "ms-ferry" }, harborL);
    const floatG = el("g", {}, ferryG);
    sk.poly(floatG, [[32, 598], [452, 598], [444, 638], [424, 676], [72, 676], [42, 640]], { fill: P.fog, stroke: INK, width: LINE.main, seed: S(), wobble: 1 });
    sk.path(floatG, [[40, 618], [449, 618], [446, 632], [42, 632]], { closed: true, fill: P.storm, stroke: "none", seed: S(), double: false });
    sk.rect(floatG, 46, 600, 58, 32, { fill: P.night, stroke: INK, width: 2.5, seed: S(), double: false });
    txt(floatG, 270, 630, "M/V KITTIWAKE", { size: 15, fill: P.paper, len: 120, ls: 1 });
    sk.hatch(floatG, 60, 636, 380, 36, { gap: 10, angle: 35, stroke: P.slate, width: 1.5, opacity: 0.35, seed: S() });
    sk.rect(floatG, 70, 548, 352, 50, { fill: P.fog, stroke: INK, width: 3, seed: S(), wobble: 0.8 });
    for (let i = 0; i < 12; i++) sk.rect(floatG, 84 + i * 28, 560, 16, 14, { fill: P.slate, stroke: INK, width: 1.6, seed: S(), wobble: 0.4, double: false });
    sk.line(floatG, 70, 586, 422, 586, { stroke: P.steel, width: 2, seed: S(), double: false });
    sk.rect(floatG, 140, 514, 222, 34, { fill: P.paper, stroke: INK, width: 3, seed: S(), wobble: 0.6 });
    lines(floatG, [[150, 506, 352, 506]].concat([0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => [150 + i * 25, 506, 150 + i * 25, 514])), { stroke: INK, width: 1.6, opacity: 0.7 });
    sk.rect(floatG, 205, 478, 92, 36, { fill: P.fog, stroke: INK, width: 3, seed: S(), wobble: 0.5 });
    for (let i = 0; i < 4; i++) sk.rect(floatG, 212 + i * 21, 486, 15, 12, { fill: P.slate, stroke: INK, width: 1.6, seed: S(), wobble: 0.3, double: false });
    sk.line(floatG, 252, 478, 252, 418, { stroke: INK, width: 3, seed: S(), double: false });
    sk.line(floatG, 236, 432, 268, 432, { stroke: INK, width: 2.5, seed: S(), double: false });
    sk.poly(floatG, [[318, 514], [322, 474], [348, 474], [350, 514]], { fill: P.slate, stroke: INK, width: 3, seed: S(), wobble: 0.5 });
    sk.line(floatG, 320, 484, 349, 484, { stroke: P.paper, width: 3, seed: S(), double: false, opacity: 0.8 });
    sk.path(floatG, ellPts(172, 534, 7, 7, 10), { closed: true, stroke: P.paper, width: 3, seed: S(), double: false });
    sk.path(floatG, [[372, 530], [412, 530], [406, 542], [378, 542]], { closed: true, fill: P.steel, stroke: INK, width: 2, seed: S(), double: false });

    // the pier: pilings, bracing, deck, terminal hut, bollards
    const dockG = el("g", { class: "ms-dock" }, harborL);
    const pileXs = [];
    for (let x = 30; x <= 530; x += 50) pileXs.push(x);
    pileXs.forEach((x, i) => {
      sk.rect(dockG, x - 7, i % 3 === 0 ? 596 : 618, 14, i % 3 === 0 ? 174 : 152, { fill: P.storm, stroke: INK, width: 3, seed: S(), wobble: 0.8 });
      sk.hatch(dockG, x - 6, 662, 12, 104, { gap: 6, angle: 30, stroke: P.mist, width: 1.4, opacity: 0.4, seed: S() });
      sk.line(dockG, x - 7, 654, x + 7, 655, { stroke: P.mist, width: 2, opacity: 0.6, seed: S(), double: false });
    });
    const brace = [];
    for (let i = 0; i < pileXs.length - 1; i++) { const a = pileXs[i], b = pileXs[i + 1]; brace.push([a + 6, 628, b - 6, 690], [a + 6, 690, b - 6, 628]); }
    lines(dockG, brace, { stroke: INK, width: 2.5, opacity: 0.7 });
    sk.rect(dockG, 16, DECK, 534, 13, { fill: P.steel, stroke: INK, width: LINE.main, seed: S(), wobble: 0.8 });
    const planks = [];
    for (let x = 30; x < 548; x += 17) planks.push([x, DECK + 2, x + 1, DECK + 11]);
    lines(dockG, planks, { stroke: INK, width: 1.4, opacity: 0.4 });
    const railSegs = [[20, 590, 545, 592]];
    for (let x = 24; x < 548; x += 40) railSegs.push([x, DECK, x, 588]);
    lines(dockG, railSegs, { stroke: INK, width: 2.5, opacity: 0.75 });
    harborL.insertBefore(bedG, dockG); // mud bed in front of the ferry hull (it settles INTO the mud when drained)
    const hutG = el("g", {}, dockG);
    sk.rect(hutG, 458, 552, 70, 60, { fill: P.mist, stroke: INK, width: 3, seed: S(), wobble: 0.6 });
    sk.poly(hutG, [[450, 554], [493, 530], [536, 554]], { fill: P.slate, stroke: INK, width: 3, seed: S(), wobble: 0.6 });
    win(hutG, 466, 566, 22, 20, { stroke: INK, cols: 2 });
    sk.rect(hutG, 498, 568, 20, 44, { fill: P.storm, stroke: INK, width: 2, seed: S(), double: false });
    sk.rect(hutG, 462, 538, 62, 13, { fill: P.paper, stroke: INK, width: 2, seed: S(), double: false, wobble: 0.3 });
    txt(hutG, 493, 549, "FERRY", { size: 12, fill: P.storm, len: 40, ls: 1 });
    [[130, 600], [330, 600]].forEach(([x, y]) => sk.rect(dockG, x - 6, y, 12, 12, { fill: P.storm, stroke: INK, width: 2, seed: S(), double: false }));
    sittingGull(dockG, 30, 596); sittingGull(dockG, 180, 596); sittingGull(dockG, 434, 597);
    // mooring lines ferry -> pier
    sk.path(dockG, [[90, 600], [105, 606], [128, 604]], { stroke: INK, width: 2, seed: S(), double: false });
    sk.path(dockG, [[420, 600], [400, 607], [382, 604]], { stroke: INK, width: 2, seed: S(), double: false });
    // shore embankment (riprap) between the pier and the street
    const EMB = [[520, 770], [540, 700], [562, 646], [600, 614], [700, 612]];
    sk.path(harborL, EMB.concat([[700, 790], [520, 790]]), { closed: true, fill: P.steel, stroke: INK, width: 3, seed: S(), wobble: 1 });
    [[548, 690, 12], [566, 662, 11], [592, 640, 12], [560, 728, 14], [600, 690, 15], [640, 650, 12], [630, 730, 16], [672, 690, 12]].forEach(([x, y, r]) => {
      sk.path(harborL, [[x - r, y + r * 0.5], [x - r * 0.6, y - r * 0.6], [x + r * 0.3, y - r * 0.8], [x + r, y + r * 0.2], [x + r * 0.5, y + r * 0.6]], { closed: true, fill: P.mist, stroke: INK, width: 2, seed: S(), wobble: 0.6, double: false });
    });
    // crab pots stacked on the shore
    [[612, 598], [640, 598], [626, 584]].forEach(([x, y]) => {
      sk.rect(harborL, x - 13, y, 26, 14, { fill: P.slate, stroke: INK, width: 2, seed: S(), wobble: 0.4, double: false });
      lines(harborL, [[x - 6, y + 1, x - 6, y + 13], [x + 2, y + 1, x + 2, y + 13], [x - 12, y + 7, x + 12, y + 7]], { stroke: P.fog, width: 1.3, opacity: 0.6 });
    });

    // ------------------------------------------------------------------ MID: storefronts (sized for scale-1.4 figures: doors ~330px)
    const midL = layer("mid");
    const BST = P.storm; // building outline: a step softer than ink keeps the action zone quieter
    fir(midL, 952, 372, 220, { fill: P.slate, stroke: P.storm, width: 3, tiers: 5 });
    fir(midL, 1574, 420, 270, { fill: P.slate, stroke: P.storm, width: 3, tiers: 6 });

    // POST OFFICE (690–935)
    const po = el("g", { class: "ms-post-office" }, midL);
    sk.rect(po, 690, 362, 245, SIDE - 362, { fill: P.fog, stroke: BST, width: LINE.main, seed: S(), wobble: 1 });
    sk.poly(po, [[786, 346], [812, 318], [838, 346]], { fill: P.mist, stroke: BST, width: 3, seed: S(), wobble: 0.5 });
    sk.rect(po, 682, 344, 261, 22, { fill: P.mist, stroke: BST, width: 3, seed: S(), wobble: 0.6 });
    const dent = [];
    for (let x = 690; x < 936; x += 14) dent.push([x, 366, x, 372]);
    lines(po, dent, { stroke: BST, width: 3, opacity: 0.5 });
    sk.hatch(po, 692, 600, 241, 180, { gap: 26, angle: 0, stroke: P.mist, width: 1.5, opacity: 0.7, seed: S() });
    sk.rect(po, 704, 380, 217, 50, { fill: P.paper, stroke: BST, width: 3, seed: S(), wobble: 0.5 });
    txt(po, 812, 418, "POST OFFICE", { size: 40, fill: P.storm, len: 190, ls: 2 });
    txt(po, 812, 448, "U.S. MAIL · GULL HARBOR, WA", { size: 13, fill: P.slate, len: 170 });
    win(po, 700, 468, 46, 226, { rows: 4, cols: 2, brk: "smash" });
    win(po, 878, 468, 46, 226, { rows: 4, cols: 2, brk: "crack" });
    sk.rect(po, 757, 458, 110, SIDE - 458, { fill: P.slate, stroke: BST, width: 3, seed: S(), wobble: 0.6 });
    sk.line(po, 812, 462, 812, SIDE - 2, { stroke: BST, width: 2.5, seed: S(), double: false });
    win(po, 766, 476, 38, 120, { stroke: BST, brk: "crack" }); win(po, 820, 476, 38, 120, { stroke: BST });
    lines(po, [[800, 640, 800, 670], [824, 640, 824, 670]], { stroke: P.fog, width: 4, opacity: 0.8 });
    sk.poly(po, [[748, SIDE - 6], [876, SIDE - 6], [884, SIDE + 2], [740, SIDE + 2]], { fill: P.mist, stroke: BST, width: 2.5, seed: S(), double: false });
    sk.line(po, 922, 344, 922, 236, { stroke: BST, width: 3, seed: S(), double: false });
    sk.path(po, [[922, 238], [954, 242], [968, 252], [952, 262], [922, 264]], { closed: true, fill: P.steel, stroke: BST, width: 2, seed: S(), double: false });
    lines(po, [[924, 248, 962, 251], [924, 256, 954, 258]], { stroke: P.paper, width: 2, opacity: 0.8 });
    sk.rect(po, 882, 708, 40, 52, { fill: P.paper, stroke: BST, width: 2, seed: S(), double: false, wobble: 0.4 });
    txt(po, 902, 726, "DRILL", { size: 11, font: FONT_HAND, fill: P.storm, len: 30 });
    txt(po, 902, 742, "SAT 10AM", { size: 8, font: FONT_HAND, fill: P.storm, len: 32 });
    el("path", { d: "M890 752 q 6 -6 12 0 q 6 6 12 0", stroke: P.storm, "stroke-width": 1.4, fill: "none" }, po);
    if (DMG) {
      crack(po, 704, 366, 744, 466, { amp: 7, width: 2.5, branches: true });
      crack(po, 930, 440, 880, 560, { amp: 6, width: 2.5 });
    }

    // ALLEY (935–955)
    sk.rect(midL, 935, 384, 20, SIDE - 384, { fill: P.night, stroke: BST, width: 2, seed: S(), double: false });

    // DINER (955–1225)
    const diner = el("g", { class: "ms-diner" }, midL);
    sk.rect(diner, 955, 380, 270, SIDE - 380, { fill: P.mist, stroke: BST, width: LINE.main, seed: S(), wobble: 1 });
    const sid = [];
    for (let y = 392; y < 410; y += 12) sid.push([958, y, 1222, y + 1]);
    lines(diner, sid, { stroke: BST, width: 1.5, opacity: 0.3 });
    sk.rect(diner, 955, 700, 270, SIDE - 702, { fill: P.steel, stroke: BST, width: 3, seed: S(), wobble: 0.6 });
    const tiles = [];
    for (let x = 962; x < 1222; x += 20) tiles.push([x, 704, x, SIDE - 4]);
    for (let y = 722; y < SIDE; y += 20) tiles.push([958, y, 1222, y]);
    lines(diner, tiles, { stroke: P.storm, opacity: 0.3 });
    win(diner, 964, 470, 106, 220, { lit: true, cols: 2, rows: 2, brk: "smash" });
    win(diner, 1170, 470, 48, 220, { lit: true, rows: 2, brk: "crack" });
    txt(diner, 1017, 560, "PIE", { size: 34, font: FONT_HAND, fill: P.slate, weight: 700 });
    txt(diner, 1194, 548, "COFFEE", { size: 10, font: FONT_HAND, fill: P.slate, weight: 700, len: 40 });
    lines(diner, [[980, 688, 980, 664], [1000, 688, 1000, 664], [1020, 688, 1020, 664], [1040, 688, 1040, 664], [972, 664, 1056, 664]], { stroke: P.slate, width: 5, opacity: 0.55 });
    sk.rect(diner, 1080, 458, 80, SIDE - 458, { fill: P.slate, stroke: BST, width: 3, seed: S(), wobble: 0.6 });
    win(diner, 1092, 472, 56, 120, { lit: true, stroke: BST });
    el("circle", { cx: 1150, cy: 640, r: 4, fill: P.fog }, diner);
    sk.rect(diner, 1100, 600, 40, 18, { fill: P.paper, stroke: BST, width: 1.6, seed: S(), double: false });
    txt(diner, 1120, 613, DMG ? "CLOSED" : "OPEN", { size: 11, fill: P.storm, len: 32 });
    const aw = el("g", {}, diner);
    sk.poly(aw, [[958, 412], [1222, 412], [1234, 452], [946, 452]], { fill: P.fog, stroke: BST, width: 3, seed: S(), wobble: 0.6 });
    for (let i = 0; i < 12; i += 2) {
      const x0 = 958 + i * 22, x1 = x0 + 22;
      sk.poly(aw, [[x0, 413], [x1, 413], [x1 + (x1 - 1090) * 0.045, 451], [x0 + (x0 - 1090) * 0.045, 451]], { fill: P.storm, stroke: "none", seed: S(), double: false, opacity: 0.85 });
    }
    const scal = [];
    for (let i = 0; i <= 12; i++) scal.push([946 + i * 24, 452 + (i % 2 ? 9 : 0)]);
    sk.path(aw, scal, { stroke: BST, width: 2.5, seed: S(), double: false });
    // rooftop DINER sign on legs (hangs askew after the quake)
    const ds = el("g", {}, diner);
    lines(ds, [[1000, 380, 1000, 350], [1180, 380, 1180, 350]], { stroke: BST, width: 5, opacity: 1 });
    sk.rect(ds, 978, 280, 224, 72, { fill: P.paper, stroke: BST, width: LINE.main, seed: S(), wobble: 0.8 });
    sk.rect(ds, 988, 289, 204, 54, { fill: "none", stroke: P.steel, width: 2, seed: S(), double: false, wobble: 0.5 });
    txt(ds, 1090, 335, "DINER", { size: 54, fill: P.storm, len: 170, ls: 4 });
    if (DMG) ds.setAttribute("transform", "rotate(9 1000 380)");
    sk.rect(diner, 1174, 708, 40, 52, { fill: P.paper, stroke: BST, width: 2, seed: S(), double: false, wobble: 0.4 });
    txt(diner, 1194, 726, "LOST", { size: 11, font: FONT_HAND, fill: P.storm, len: 28 });
    txt(diner, 1194, 740, "CAT", { size: 11, font: FONT_HAND, fill: P.storm, len: 22 });
    el("path", { d: "M1186 752 q 8 -8 16 0", stroke: P.storm, "stroke-width": 1.4, fill: "none" }, diner);
    if (DMG) crack(diner, 1076, 382, 1030, 468, { amp: 6, width: 2.5, branches: true });

    // HARDWARE with the painted "GULL HARBOR" wall sign (1235–1565)
    const hw = el("g", { class: "ms-hardware" }, midL);
    sk.path(hw, [[1235, SIDE], [1235, 200], [1290, 200], [1290, 182], [1360, 182], [1360, 166], [1440, 166], [1440, 182], [1510, 182], [1510, 200], [1565, 200], [1565, SIDE]], { closed: true, fill: P.steel, stroke: BST, width: LINE.main, seed: S(), wobble: 1 });
    sk.rect(hw, 1229, 196, 342, 12, { fill: P.slate, stroke: BST, width: 2.5, seed: S(), double: false });
    const bricks = [];
    for (let r = 0, y = 212; y < 452; r++, y += 14) {
      bricks.push([1238, y, 1562, y + (r % 3) * 0.6]);
      for (let x = 1244 + (r % 2) * 14; x < 1562; x += 28) bricks.push([x, y, x, y + 14]);
    }
    lines(hw, bricks, { stroke: P.storm, width: 1.4, opacity: 0.3 });
    // painted wall sign (weathered)
    sk.rect(hw, 1254, 216, 292, 104, { fill: P.storm, stroke: BST, width: 3, seed: S(), wobble: 0.7 });
    txt(hw, 1400, 290, "GULL HARBOR", { size: 76, fill: P.paper, len: 262, ls: 2 });
    txt(hw, 1400, 312, "EST. 1891", { size: 15, fill: P.fog, len: 70, ls: 2 });
    gull(hw, 1276, 236, 1, { stroke: P.paper, opacity: 0.9 });
    gull(hw, 1524, 232, 0.8, { stroke: P.paper, opacity: 0.9 });
    sk.hatch(hw, 1256, 218, 288, 100, { gap: 30, angle: 75, stroke: P.storm, width: 3, opacity: 0.25, seed: S() });
    win(hw, 1262, 334, 50, 56, { rows: 2, cols: 2, brk: "crooked", rot: -6 });
    win(hw, 1488, 334, 50, 56, { rows: 2, cols: 2, brk: "smash" });
    txt(hw, 1400, 372, "PAINT · TOOLS · BAIT", { size: 18, fill: P.fog, len: 150, ls: 1 });
    sk.rect(hw, 1248, 402, 304, 48, { fill: P.slate, stroke: BST, width: 3, seed: S(), wobble: 0.5 });
    txt(hw, 1400, 441, "HARDWARE", { size: 42, fill: P.paper, len: 230, ls: 4 });
    win(hw, 1245, 470, 102, 230, { lit: true, rows: 2, cols: 2, brk: "crack" });
    sk.rect(hw, 1258, 484, 40, 26, { fill: P.paper, stroke: BST, width: 1.6, seed: S(), double: false });
    txt(hw, 1278, 503, "SALE", { size: 15, fill: P.storm, len: 32 });
    win(hw, 1458, 470, 98, 230, { lit: true, rows: 2, cols: 2, brk: "smash" });
    [[1476, 676], [1500, 676], [1524, 676], [1488, 652], [1512, 652]].forEach(([x, y]) => sk.rect(hw, x - 10, y - 20, 20, 22, { fill: P.steel, stroke: BST, width: 2, seed: S(), double: false, wobble: 0.3 }));
    sk.rect(hw, 1238, 708, 324, SIDE - 710, { fill: P.slate, stroke: BST, width: 2, seed: S(), double: false, opacity: 0.6 });
    sk.rect(hw, 1362, 458, 80, SIDE - 458, { fill: P.slate, stroke: BST, width: 3, seed: S(), wobble: 0.6 });
    win(hw, 1374, 472, 56, 120, { stroke: BST, lit: true });
    el("circle", { cx: 1434, cy: 640, r: 4, fill: P.fog }, hw);
    // tools barrel outside (shovels / rakes)
    const rack = el("g", {}, hw);
    sk.rect(rack, 1258, 736, 70, 46, { fill: P.steel, stroke: BST, width: 2.5, seed: S(), double: false });
    lines(rack, [[1258, 750, 1328, 750], [1258, 768, 1328, 768]], { stroke: BST, width: 2, opacity: 0.6 });
    [1266, 1282, 1298, 1314].forEach((x, i) => {
      sk.line(rack, x, 736, x + (i % 2 ? 3 : -3), 640, { stroke: BST, width: 3, seed: S(), double: false });
      if (i % 2) sk.path(rack, [[x - 6, 640], [x + 12, 640], [x + 9, 652], [x - 3, 652]], { closed: true, fill: P.steel, stroke: BST, width: 2, seed: S(), double: false });
      else lines(rack, [[x - 12, 642, x + 6, 642], [x - 11, 642, x - 11, 634], [x - 4, 642, x - 4, 634], [x + 3, 642, x + 3, 634]], { stroke: BST, width: 2, opacity: 0.9 });
    });
    if (!DMG) {
      sk.line(hw, 1548, SIDE, 1566, 540, { stroke: P.storm, width: 4, seed: S(), double: false });
      sk.line(hw, 1576, SIDE, 1580, 542, { stroke: P.storm, width: 4, seed: S(), double: false });
      const rungs = [];
      for (let y = 560; y < SIDE; y += 30) { const t = (y - 540) / (SIDE - 540); rungs.push([1566 - 18 * t, y, 1580 - 4 * t, y]); }
      lines(hw, rungs, { stroke: P.storm, width: 3, opacity: 0.9 });
    } else {
      crack(hw, 1562, 214, 1490, 440, { amp: 9, width: 3, branches: true });
      crack(hw, 1238, 330, 1286, 214, { amp: 5, width: 2.5 });
    }

    // GAS STATION (1580–1920): kiosk, canopy, pumps, price sign
    const gas = el("g", { class: "ms-gas-station" }, midL);
    sk.rect(gas, 1660, 470, 270, SIDE - 470, { fill: P.mist, stroke: BST, width: LINE.main, seed: S(), wobble: 1 });
    sk.rect(gas, 1660, 470, 270, 18, { fill: P.slate, stroke: BST, width: 2.5, seed: S(), double: false });
    win(gas, 1676, 520, 126, 140, { lit: true, cols: 3, brk: "smash" });
    [["ICE", 1698], ["BAIT", 1739], ["SNACKS", 1780]].forEach(([s, x]) => {
      sk.rect(gas, x - 17, 536, 34, 22, { fill: P.paper, stroke: BST, width: 1.5, seed: S(), double: false });
      txt(gas, x, 552, s, { size: 11, fill: P.storm, len: s.length > 4 ? 30 : 20 });
    });
    sk.rect(gas, 1822, 480, 72, SIDE - 480, { fill: P.slate, stroke: BST, width: 3, seed: S(), wobble: 0.6 });
    win(gas, 1834, 494, 48, 124, { lit: true, stroke: BST });
    sk.rect(gas, 1680, 676, 60, 50, { fill: P.steel, stroke: BST, width: 2, seed: S(), double: false });
    txt(gas, 1710, 706, "PROPANE", { size: 10, fill: P.paper, len: 46 });
    // canopy (left pillar fixed; the right side drops when damaged)
    const canopyG = el("g", { class: "ms-canopy" }, gas);
    sk.rect(midL, 1610, 394, 16, SIDE - 394 + 6, { fill: P.fog, stroke: BST, width: 3, seed: S(), wobble: 0.5 });
    sk.poly(canopyG, [[1584, 336], [1918, 336], [1918, 396], [1584, 396]], { fill: P.mist, stroke: INK, width: LINE.main, seed: S(), wobble: 0.8 });
    sk.rect(canopyG, 1584, 336, 334, 16, { fill: P.slate, stroke: INK, width: 2.5, seed: S(), double: false });
    txt(canopyG, 1751, 386, "GAS · DIESEL · PROPANE", { size: 28, fill: P.storm, len: 270, ls: 2 });
    for (let i = 0; i < 5; i++) sk.rect(canopyG, 1610 + i * 64, 396, 28, 7, { fill: P.paper, stroke: INK, width: 1.5, seed: S(), double: false });
    sk.hatch(canopyG, 1586, 352, 330, 42, { gap: 12, angle: 70, stroke: P.storm, width: 1.4, opacity: 0.16, seed: S() });
    // pump island + pumps
    sk.rect(gas, 1676, SIDE - 12, 170, 14, { fill: P.fog, stroke: BST, width: 2.5, seed: S(), double: false });
    const pumps = [{ x: 1714, y: SIDE - 12 }, { x: 1806, y: SIDE - 12 }];
    pumps.forEach((p, i) => {
      const pg = el("g", {}, gas);
      sk.rect(pg, p.x - 24, p.y - 220, 48, 220, { fill: P.steel, stroke: INK, width: 3, seed: S(), wobble: 0.7 });
      sk.rect(pg, p.x - 28, p.y - 232, 56, 16, { fill: P.slate, stroke: INK, width: 2.5, seed: S(), double: false });
      sk.rect(pg, p.x - 16, p.y - 200, 32, 30, { fill: P.paper, stroke: INK, width: 2, seed: S(), double: false });
      lines(pg, [[p.x - 11, p.y - 190, p.x + 11, p.y - 190], [p.x - 11, p.y - 180, p.x + 6, p.y - 180]], { stroke: INK, width: 1.8, opacity: 0.7 });
      sk.rect(pg, p.x - 14, p.y - 156, 28, 44, { fill: P.slate, stroke: INK, width: 2, seed: S(), double: false });
      lines(pg, [[p.x - 8, p.y - 146, p.x + 8, p.y - 146], [p.x - 8, p.y - 136, p.x + 8, p.y - 136], [p.x - 8, p.y - 126, p.x + 8, p.y - 126]], { stroke: P.mist, width: 2, opacity: 0.6 });
      sk.path(pg, [[p.x + 24, p.y - 140], [p.x + 40, p.y - 110], [p.x + 38, p.y - 40], [p.x + 30, p.y - 8]], { stroke: INK, width: 3.5, seed: S(), double: false });
      sk.rect(pg, p.x + 20, p.y - 150, 10, 22, { fill: INK, stroke: INK, width: 2, seed: S(), double: false });
      if (DMG && i === 1) pg.setAttribute("transform", `rotate(-7 ${p.x - 24} ${p.y})`);
    });
    if (DMG) {
      canopyG.setAttribute("transform", "rotate(6.5 1618 396)");
      sk.path(midL, [[1870, SIDE + 4], [1874, 620], [1856, 560], [1864, 430]], { stroke: INK, width: 17, seed: S(), double: false });
      sk.path(midL, [[1870, SIDE + 4], [1874, 620], [1856, 560], [1864, 430]], { stroke: P.fog, width: 10, seed: S(), double: false });
    } else {
      sk.rect(midL, 1862, 394, 16, SIDE - 394 + 6, { fill: P.fog, stroke: BST, width: 3, seed: S(), wobble: 0.5 });
    }
    // price sign on its own pole
    const price = el("g", {}, midL);
    sk.line(price, 1904, SIDE + 10, 1904, 262, { stroke: INK, width: 6, seed: S(), double: false });
    sk.rect(price, 1846, 160, 68, 104, { fill: P.slate, stroke: INK, width: 3, seed: S(), wobble: 0.6 });
    txt(price, 1880, 186, "GAS", { size: 20, fill: P.paper, len: 36 });
    sk.rect(price, 1853, 196, 54, 26, { fill: P.paper, stroke: INK, width: 1.6, seed: S(), double: false });
    sk.rect(price, 1853, 230, 54, 26, { fill: P.paper, stroke: INK, width: 1.6, seed: S(), double: false });
    txt(price, 1880, 216, "4.59", { size: 18, fill: P.storm, len: 38 });
    txt(price, 1880, 250, "4.89", { size: 18, fill: P.storm, len: 38 });
    if (DMG) price.setAttribute("transform", "rotate(-6 1904 792)");

    // ------------------------------------------------------------------ GROUND: seawall cap, sidewalk, street
    const groundL = layer("ground");
    sk.rect(groundL, -20, 766, 562, 18, { fill: P.steel, stroke: INK, width: 3, seed: S(), wobble: 0.6 });
    const capJ = [];
    for (let x = 30; x < 540; x += 52) capJ.push([x, 768, x + 1, 782]);
    lines(groundL, capJ, { stroke: INK, width: 1.6, opacity: 0.5 });
    sk.path(groundL, [[-20, SIDE], [1940, SIDE], [1940, CURB], [-20, CURB]], { closed: true, fill: P.mist, stroke: INK, width: 3, seed: S(), wobble: 0.6 });
    const slabs = [];
    for (let x = 40; x < 1920; x += 88) slabs.push([x, SIDE + 2, x - 6, CURB - 2]);
    lines(groundL, slabs, { stroke: P.storm, width: 1.6, opacity: 0.45 });
    sk.path(groundL, [[-20, CURB], [1940, CURB], [1940, NEAR], [-20, NEAR]], { closed: true, fill: P.slate, stroke: "none", seed: S(), double: false });
    sk.line(groundL, -20, CURB + 2, 1940, CURB + 2, { stroke: INK, width: LINE.main, seed: S() });
    sk.line(groundL, -20, CURB + 9, 1940, CURB + 9, { stroke: P.storm, width: 6, seed: S(), double: false, opacity: 0.6 });
    sk.hatch(groundL, -20, CURB + 12, 1960, NEAR - CURB - 12, { gap: 18, angle: 4, stroke: P.storm, width: 1.6, opacity: 0.28, seed: S() });
    // wet sheen: vertical-ish reflections of the lit windows + horizontal streaks
    const sheen = [];
    for (let i = 0; i < 40; i++) { const x = (i * 211) % 1900, y = 830 + ((i * 47) % 150); sheen.push([x, y, x + 30 + (i % 4) * 12, y]); }
    lines(groundL, sheen, { stroke: P.mist, width: 2, opacity: 0.25 });
    const refl = [];
    [[964, 1070], [1170, 1218], [1245, 1347], [1458, 1556], [1676, 1802]].forEach(([a, b]) => { for (let x = a + 6; x < b; x += 9) refl.push([x, CURB + 14, x + 2, CURB + 30 + ((x * 7) % 26)]); });
    lines(groundL, refl, { stroke: P.fog, width: 2, opacity: 0.16 });
    for (let x = 20; x < 1920; x += 150) sk.poly(groundL, [[x, 914], [x + 80, 913], [x + 80, 920], [x, 921]], { fill: P.fog, stroke: "none", seed: S(), double: false, opacity: DMG ? 0.4 : 0.5 });
    sk.rect(groundL, 1010, CURB + 1, 52, 10, { fill: P.night, stroke: INK, width: 2, seed: S(), double: false });
    lines(groundL, [[1020, CURB + 2, 1020, CURB + 10], [1030, CURB + 2, 1030, CURB + 10], [1040, CURB + 2, 1040, CURB + 10], [1050, CURB + 2, 1050, CURB + 10]], { stroke: P.mist, width: 1.5, opacity: 0.6 });
    sk.path(groundL, ellPts(1460, 952, 44, 9, 18), { closed: true, fill: P.storm, stroke: INK, width: 2, seed: S(), double: false, opacity: 0.8 });
    [[760, 878, 74, 12], [1290, 892, 96, 13], [430, 862, 56, 9], [1700, 870, 60, 10], [220, 940, 80, 12]].forEach(([cx, cy, rx, ry], i) => {
      sk.path(groundL, ellPts(cx, cy, rx, ry, 22).map((p, k) => [p[0] + H(i * 30 + k) * 5, p[1] + H(i * 30 + k + 9) * 2]), { closed: true, fill: P.steel, stroke: P.storm, width: 2, seed: S(), wobble: 1, double: false });
      lines(groundL, [[cx - rx * 0.5, cy - 2, cx - rx * 0.1, cy - 2], [cx + rx * 0.05, cy + 3, cx + rx * 0.45, cy + 3], [cx - rx * 0.25, cy + 5, cx - rx * 0.05, cy + 5]], { stroke: P.fog, width: 2, opacity: 0.6 });
    });
    sk.path(groundL, [[-20, NEAR], [1940, NEAR], [1940, 1100], [-20, 1100]], { closed: true, fill: P.storm, stroke: "none", seed: S(), double: false });
    sk.line(groundL, -20, NEAR, 1940, NEAR, { stroke: INK, width: LINE.main, seed: S() });
    sk.line(groundL, -20, NEAR + 12, 1940, NEAR + 12, { stroke: P.slate, width: 3, seed: S(), double: false, opacity: 0.7 });
    const nj = [];
    for (let x = 100; x < 1920; x += 240) nj.push([x, NEAR + 14, x - 18, 1080]);
    lines(groundL, nj, { stroke: P.slate, width: 2, opacity: 0.5 });
    // post-quake ground damage + debris
    const debrisG = el("g", { class: "ms-debris" }, groundL);
    if (DMG) {
      crack(groundL, 300, CURB + 4, 1180, NEAR - 4, { n: 16, amp: 14, width: 4, branches: true, shade: P.night });
      crack(groundL, 1480, CURB + 4, 1760, NEAR - 6, { n: 9, amp: 11, width: 3.5, branches: true, shade: P.night });
      crack(groundL, 40, 890, 360, 940, { n: 7, amp: 8, width: 3, shade: P.night });
      crack(groundL, 1880, 830, 1620, 930, { n: 6, amp: 8, width: 3 });
      sk.poly(groundL, [[620, 892], [760, 912], [742, 930], [600, 908]], { fill: P.steel, stroke: INK, width: 3, seed: S() });
      // buckled sidewalk: slabs tented up in front of the hardware store
      sk.poly(groundL, [[1300, CURB], [1392, 764], [1406, 768], [1496, CURB]], { fill: P.mist, stroke: INK, width: 3, seed: S() });
      sk.poly(groundL, [[1392, 764], [1406, 768], [1404, CURB], [1394, CURB]], { fill: P.night, stroke: INK, width: 2, seed: S(), double: false });
      lines(groundL, [[1346, 790, 1350, CURB - 2], [1452, 792, 1448, CURB - 2]], { stroke: P.storm, width: 1.6, opacity: 0.6 });
      sk.poly(groundL, [[340, SIDE + 2], [430, SIDE - 10], [436, CURB - 2], [344, CURB]], { fill: P.mist, stroke: INK, width: 3, seed: S() });
      const plank = (x, y, l, a, w) => {
        const p = [[0, 0], [l, 0], [l, w], [0, w]].map((q) => rotPt([x + q[0], y + q[1]], x, y, a));
        sk.poly(debrisG, p, { fill: P.steel, stroke: INK, width: 3, seed: S(), wobble: 0.6 });
        lines(debrisG, [[p[0][0] + (p[1][0] - p[0][0]) * 0.1, p[0][1] + (p[1][1] - p[0][1]) * 0.1 + w * 0.5, p[0][0] + (p[1][0] - p[0][0]) * 0.8, p[0][1] + (p[1][1] - p[0][1]) * 0.8 + w * 0.5]], { stroke: INK, width: 1.4, opacity: 0.5 });
      };
      plank(520, 838, 130, 12, 12); plank(1585, 900, 110, -9, 11); plank(1050, 826, 70, 24, 10);
      // bricks fallen from the hardware parapet
      [[1530, 800], [1546, 808], [1566, 796], [1582, 812], [1556, 820], [1520, 818], [1600, 804]].forEach(([x, y], i) => {
        const p = [[0, 0], [22, 0], [22, 10], [0, 10]].map((q) => rotPt([x + q[0], y + q[1]], x, y, (i * 37) % 50 - 20));
        sk.poly(debrisG, p, { fill: P.steel, stroke: INK, width: 2, seed: S(), double: false });
      });
      // glass shards under the broken windows
      [[700, 820], [726, 828], [980, 824], [1010, 832], [1250, 822], [1470, 830], [1500, 822], [1690, 816], [1716, 824]].forEach(([x, y], i) => {
        sk.poly(debrisG, [[x, y], [x + 10 + (i % 3) * 3, y - 4], [x + 6, y + 5]], { fill: P.fog, stroke: INK, width: 1.4, seed: S(), double: false });
      });
      sk.poly(debrisG, rotPtArr([[1150, 830], [1218, 830], [1218, 850], [1150, 850]], 1184, 840, -14), { fill: P.paper, stroke: INK, width: 2.5, seed: S() });
      txt(debrisG, 1184, 846, "SALE", { size: 15, fill: P.storm, len: 40, rot: -14 });
      // toppled trash can + spilled litter
      sk.poly(debrisG, [[852, 824], [892, 806], [906, 832], [866, 850]], { fill: P.steel, stroke: INK, width: 3, seed: S() });
      sk.path(debrisG, ellPts(899, 819, 7, 15, 10).map((p) => rotPt(p, 899, 819, -24)), { closed: true, fill: P.night, stroke: INK, width: 2, seed: S(), double: false });
      sk.path(debrisG, [[866, 850], [838, 856], [824, 850]], { stroke: INK, width: 2, seed: S(), double: false });
      sk.poly(debrisG, [[916, 836], [930, 832], [934, 842], [920, 846]], { fill: P.paper, stroke: INK, width: 1.6, seed: S(), double: false });
      // fallen ladder on the sidewalk
      sk.line(debrisG, 1480, 800, 1650, 786, { stroke: P.storm, width: 4, seed: S(), double: false });
      sk.line(debrisG, 1482, 813, 1652, 799, { stroke: P.storm, width: 4, seed: S(), double: false });
      const lr = [];
      for (let x = 1492; x < 1650; x += 24) lr.push([x, 799 - (x - 1480) * 0.082, x + 1, 812 - (x - 1480) * 0.082]);
      lines(debrisG, lr, { stroke: P.storm, width: 3, opacity: 0.95 });
    }
    function rotPtArr(arr, cx, cy, a) { return arr.map((p) => rotPt(p, cx, cy, a)); }

    // ------------------------------------------------------------------ WATER (harbor + street flood), setLevel
    const waterL = layer("water");
    const waterG = el("g", { class: "ms-water" }, waterL);
    const wFill = el("path", { fill: P.slate, stroke: "none" }, waterG);
    const wHatch = el("path", { fill: "none", stroke: P.storm, "stroke-width": 1.6, opacity: 0.5, "stroke-linecap": "round" }, waterG);
    const wRip = el("path", { fill: "none", stroke: P.mist, "stroke-width": 2, opacity: 0.55, "stroke-linecap": "round" }, waterG);
    const wLine = el("path", { fill: "none", stroke: INK, "stroke-width": 3, opacity: 0.85, "stroke-linecap": "round", "stroke-linejoin": "round" }, waterG);
    const wGlint = el("path", { fill: "none", stroke: P.fog, "stroke-width": 2, opacity: 0.7, "stroke-linecap": "round" }, waterG);
    const fFill = el("path", { fill: P.slate, stroke: "none", opacity: 0.96 }, waterG);
    const fRip = el("path", { fill: "none", stroke: P.mist, "stroke-width": 2, opacity: 0.5, "stroke-linecap": "round" }, waterG);
    const fLine = el("path", { fill: "none", stroke: INK, "stroke-width": 3, opacity: 0.85, "stroke-linecap": "round", "stroke-linejoin": "round" }, waterG);
    const fFoam = el("path", { fill: "none", stroke: P.paper, "stroke-width": 3, opacity: 0.85, "stroke-linecap": "round" }, waterG);
    // shoreline x (right edge of harbor water) at height y: follows the riprap embankment
    const shoreAt = (y) => {
      if (y <= EMB[EMB.length - 1][1]) return 680;
      for (let i = EMB.length - 1; i > 0; i--) {
        const a = EMB[i], b = EMB[i - 1]; // a higher (smaller y) than b
        if (y <= b[1]) return a[0] + ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]);
      }
      return EMB[0][0];
    };
    const surf = (x, y, amp) => y + Math.sin(x * 0.045) * amp + Math.sin(x * 0.11 + 1.3) * amp * 0.5;
    function setLevel(y) {
      y = +y;
      // --- harbor water: from the surface y down to the seawall cap
      if (y < WALL - 2) {
        const xr = y < 640 ? 690 : Math.min(680, shoreAt(y));
        const top = [];
        for (let x = -20; x < xr; x += 18) top.push([x, surf(x, y, 2.2)]);
        top.push([xr, y]);
        // right edge: follow the riprap embankment below the surface (fully covered once the water tops it)
        const down = y < 640 ? [[690, Math.max(y, 612)], [690, WALL]] : EMB.filter((p) => p[1] > y).sort((a, b) => a[1] - b[1]);
        const poly = top.concat(down, [[-20, WALL], [-20, y]]);
        wFill.setAttribute("d", D(poly, true));
        wLine.setAttribute("d", D(top));
        const gl = [], rp = [], ht = [];
        for (let i = 0; i < 14; i++) {
          const x = -10 + ((i * 97) % 600), x2 = x + 22 + (i % 3) * 8;
          if (x2 < xr - 6) gl.push(`M${f1(x)} ${f1(surf(x, y, 2.2) + 4)} L${f1(x2)} ${f1(surf(x2, y, 2.2) + 4)}`);
        }
        for (let k = 1; k <= 6; k++) {
          const yy = y + k * 17;
          if (yy > WALL - 4) break;
          for (let i = 0; i < 6; i++) {
            const x = ((i * 113 + k * 59) % 560) - 10, l = 18 + k * 3;
            if (x + l < shoreAt(yy) - 6) rp.push(`M${f1(x)} ${f1(yy)} L${f1(x + l)} ${f1(yy)}`);
          }
          ht.push(`M-20 ${f1(yy + 8)} L${f1(Math.min(shoreAt(yy + 8), 680) - 4)} ${f1(yy + 8)}`);
        }
        wGlint.setAttribute("d", gl.join(" "));
        wRip.setAttribute("d", rp.join(" "));
        wHatch.setAttribute("d", ht.join(" "));
      } else {
        [wFill, wLine, wGlint, wRip, wHatch].forEach((e) => e.setAttribute("d", ""));
      }
      // --- flood sheet over the seawall and along the street when the water tops the pier
      if (y < FLOOD0) {
        const over = FLOOD0 - y;
        const depth = Math.min(260, over * 0.75);
        const ft = SIDE + 8 - depth;
        const reach = SHOREX + over * 14;
        const top = [];
        for (let x = -20; x < reach; x += 22) top.push([x, surf(x, ft, 2.5)]);
        const fr = [];
        const n = 8;
        for (let i = 0; i <= n; i++) {
          const yy = ft + ((1100 - ft) * i) / n;
          fr.push([reach + (yy - ft) * 0.32 + Math.sin(i * 1.7) * 12, yy]);
        }
        const poly = top.concat(fr, [[-20, 1100]]);
        fFill.setAttribute("d", D(poly, true));
        fLine.setAttribute("d", D(top.concat(fr)));
        const foam = [];
        fr.forEach((p, i) => { if (i < n) foam.push(`M${f1(p[0] - 26)} ${f1(p[1] + 6)} Q${f1(p[0] - 10)} ${f1(p[1] - 4)} ${f1(p[0] + 4)} ${f1(p[1] + 10)}`); });
        for (let i = 0; i < 10; i++) { const x = 40 + i * 190; if (x < reach - 40) foam.push(`M${f1(x)} ${f1(ft + 5)} Q${f1(x + 12)} ${f1(ft - 2)} ${f1(x + 26)} ${f1(ft + 5)}`); }
        fFoam.setAttribute("d", foam.join(" "));
        const rp = [];
        for (let k = 1; k <= 12; k++) {
          const yy = ft + k * 22;
          if (yy > 1080) break;
          for (let i = 0; i < 9; i++) {
            const x = ((i * 233 + k * 71) % 1900) - 10, l = 24 + (k % 3) * 10;
            if (x + l < reach + (yy - ft) * 0.32 - 20) rp.push(`M${f1(x)} ${f1(yy)} L${f1(x + l)} ${f1(yy)}`);
          }
        }
        fRip.setAttribute("d", rp.join(" "));
      } else {
        fFill.setAttribute("d", ""); fLine.setAttribute("d", ""); fFoam.setAttribute("d", ""); fRip.setAttribute("d", "");
      }
      // --- ferry floats with the water; aground + listing when drained
      if (floatFerry) {
        const dy = Math.max(-420, Math.min(y, 690) - LEVEL);
        const list = y > 690 ? Math.min(1, (y - 690) / 70) * 3.2 : 0;
        floatG.setAttribute("transform", `translate(0 ${f1(dy)}) rotate(${list.toFixed(2)} 452 676)`);
      }
      harbor.level = y;
      return harbor;
    }

    // ------------------------------------------------------------------ FRONT: railing, sign, poles + wires, street furniture
    const frontL = layer("front");
    // seawall railing + life ring
    const rail = [[-20, 708, 540, 709], [-20, 738, 540, 739]];
    for (let x = 10; x < 545; x += 58) rail.push([x, 700, x, 768]);
    lines(frontL, rail, { stroke: INK, width: 3.5, opacity: 0.9 });
    sk.path(frontL, ellPts(420, 738, 18, 18, 14), { closed: true, stroke: INK, width: 11, seed: S(), double: false });
    sk.path(frontL, ellPts(420, 738, 18, 18, 14), { closed: true, stroke: P.paper, width: 6, seed: S(), double: false });
    lines(frontL, [[406, 726, 411, 731], [434, 750, 429, 745], [433, 725, 428, 730], [407, 751, 412, 746]], { stroke: P.steel, width: 5, opacity: 1 });
    // tsunami hazard zone sign (steel + paper; no yellow)
    const SGX = 600, SGY = 300;
    const signG = el("g", { class: "ms-tsunami-sign" }, frontL);
    sk.rect(signG, SGX - 7, SGY + 190, 14, 800 - SGY - 190, { fill: P.mist, stroke: INK, width: 3, seed: S(), wobble: 0.4 });
    sk.rect(signG, SGX - 100, SGY, 200, 190, { fill: P.steel, stroke: INK, width: LINE.main, seed: S(), wobble: 0.7 });
    sk.rect(signG, SGX - 91, SGY + 9, 182, 172, { fill: "none", stroke: P.paper, width: 3, seed: S(), double: false, wobble: 0.5 });
    // curling-wave icon
    const wv = (dx, dy) => f1(SGX + dx) + " " + f1(SGY + dy);
    el("path", { d: `M${wv(-62, 84)} Q${wv(-58, 36)} ${wv(-18, 24)} Q${wv(24, 16)} ${wv(36, 46)} Q${wv(40, 62)} ${wv(24, 62)} Q${wv(10, 62)} ${wv(14, 50)} Q${wv(18, 38)} ${wv(2, 42)} Q${wv(-22, 50)} ${wv(-26, 84)} Z`, fill: P.paper, stroke: INK, "stroke-width": 2, "stroke-linejoin": "round" }, signG);
    sk.path(signG, [[SGX - 74, SGY + 90], [SGX - 56, SGY + 84], [SGX - 38, SGY + 90], [SGX - 20, SGY + 84], [SGX - 2, SGY + 90], [SGX + 16, SGY + 84], [SGX + 34, SGY + 90]], { stroke: P.paper, width: 3, seed: S(), double: false });
    sk.path(signG, [[SGX + 42, SGY + 88], [SGX + 76, SGY + 40]], { stroke: P.paper, width: 3, seed: S(), double: false });
    sk.path(signG, [[SGX + 64, SGY + 42], [SGX + 77, SGY + 38], [SGX + 78, SGY + 52]], { stroke: P.paper, width: 3, seed: S(), double: false });
    txt(signG, SGX, SGY + 120, "ENTERING", { size: 24, fill: P.paper, len: 104, ls: 2 });
    txt(signG, SGX, SGY + 150, "TSUNAMI HAZARD", { size: 32, fill: P.paper, len: 168, ls: 1 });
    txt(signG, SGX, SGY + 178, "ZONE", { size: 28, fill: P.paper, len: 66, ls: 3 });
    sk.rect(signG, SGX - 84, SGY + 200, 168, 44, { fill: P.paper, stroke: INK, width: 3, seed: S(), wobble: 0.5 });
    txt(signG, SGX, SGY + 218, "IN CASE OF EARTHQUAKE", { size: 13, fill: P.storm, len: 140 });
    txt(signG, SGX, SGY + 236, "GO TO HIGH GROUND OR INLAND", { size: 13, fill: P.storm, len: 150 });
    if (DMG) signG.setAttribute("transform", `rotate(5 ${SGX} 800)`);

    // power poles + wires
    const wiresL = el("g", { class: "ms-wires" }, frontL);
    const polesL = el("g", { class: "ms-poles" }, frontL);
    const POLE_TOP = 96, POLE_BASE = 806, LEAN_I = 1;
    const poleDefs = [{ x: 300, lean: 0 }, { x: 945, lean: DMG ? -8 : 0, tx: true }, { x: 1590, lean: DMG ? 2.5 : 0 }];
    const poles = poleDefs.map((pd, i) => {
      const pgr = el("g", { class: "ms-pole" }, polesL);
      const x = pd.x;
      sk.poly(pgr, [[x - 8, POLE_TOP], [x + 8, POLE_TOP], [x + 12, POLE_BASE], [x - 12, POLE_BASE]], { fill: P.storm, stroke: INK, width: 3, seed: S(), wobble: 0.6 });
      const gr = [];
      for (let y = POLE_TOP + 40; y < POLE_BASE; y += 34) gr.push([x - 3 + H(y + i) * 2, y, x - 2 + H(y + i + 5) * 2, y + 18]);
      lines(pgr, gr, { stroke: P.mist, width: 1.4, opacity: 0.35 });
      sk.rect(pgr, x - 70, POLE_TOP + 16, 140, 11, { fill: P.storm, stroke: INK, width: 3, seed: S(), wobble: 0.4 });
      sk.rect(pgr, x - 48, POLE_TOP + 62, 96, 9, { fill: P.storm, stroke: INK, width: 2.5, seed: S(), wobble: 0.4, double: false });
      [-60, -22, 22, 60].forEach((dx) => sk.rect(pgr, x + dx - 3, POLE_TOP + 6, 7, 11, { fill: P.fog, stroke: INK, width: 1.6, seed: S(), double: false, wobble: 0.2 }));
      // climbing steps
      const steps = [];
      for (let y = POLE_TOP + 120; y < 620; y += 46) steps.push([x + (i % 2 ? -10 : 10), y, x + (i % 2 ? -22 : 22), y + 2]);
      lines(pgr, steps, { stroke: INK, width: 3, opacity: 0.7 });
      if (pd.tx) {
        sk.rect(pgr, x + 12, POLE_TOP + 86, 30, 46, { fill: P.steel, stroke: INK, width: 3, seed: S(), wobble: 0.5 });
        lines(pgr, [[x + 16, POLE_TOP + 98, x + 38, POLE_TOP + 98], [x + 16, POLE_TOP + 120, x + 38, POLE_TOP + 120]], { stroke: INK, width: 1.6, opacity: 0.6 });
        sk.rect(pgr, x - 9, 600, 18, 26, { fill: P.paper, stroke: INK, width: 1.6, seed: S(), double: false, wobble: 0.3 });
        lines(pgr, [[x - 5, 607, x + 5, 607], [x - 5, 614, x + 5, 614]], { stroke: INK, width: 1.2, opacity: 0.6 });
      }
      if (i === 0) {
        sk.rect(pgr, x - 62, 330, 124, 24, { fill: P.steel, stroke: INK, width: 2.5, seed: S(), wobble: 0.3 });
        txt(pgr, x, 348, "HARBOR WAY", { size: 17, fill: P.paper, len: 104, ls: 1 });
      }
      if (pd.lean) pgr.setAttribute("transform", `rotate(${pd.lean} ${x} ${POLE_BASE})`);
      const att = [-60, -22, 22, 60].map((dx) => rotPt([x + dx, POLE_TOP + 7], x, POLE_BASE, pd.lean));
      const low = [-44, 44].map((dx) => rotPt([x + dx, POLE_TOP + 62], x, POLE_BASE, pd.lean));
      return { g: pgr, x, baseY: POLE_BASE, top: rotPt([x, POLE_TOP], x, POLE_BASE, pd.lean), att, low, lean: pd.lean };
    });
    const span = (a, b, sag, o) => {
      const pts = [];
      for (let i = 0; i <= 14; i++) { const t = i / 14; pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + sag * 4 * t * (1 - t)]); }
      sk.path(wiresL, pts, Object.assign({ stroke: INK, width: 2.2, seed: S(), wobble: 0.5, double: false, step: 60 }, o || {}));
    };
    const offL = { att: [-60, -22, 22, 60].map((dx) => [-40, POLE_TOP + 30 + dx * 0.1]), low: [[-40, POLE_TOP + 80], [-40, POLE_TOP + 88]] };
    const offR = { att: [-60, -22, 22, 60].map((dx) => [1960, POLE_TOP - 6 + dx * 0.15]), low: [[1960, POLE_TOP + 48], [1960, POLE_TOP + 56]] };
    const chain = [offL].concat(poles, [offR]);
    for (let i = 0; i < chain.length - 1; i++) {
      const a = chain[i], b = chain[i + 1];
      const hurt = DMG && (a === poles[LEAN_I] || b === poles[LEAN_I]);
      for (let k = 0; k < 4; k++) {
        if (hurt && k === 3 && b === poles[LEAN_I]) continue; // this one snapped
        span(a.att[k], b.att[k], hurt ? 80 + k * 16 : 26 + k * 3, {});
      }
      for (let k = 0; k < 2; k++) span(a.low[k], b.low[k], hurt ? 110 : 34, { width: 2.6 });
    }
    // service drops to buildings
    span(poles[1].low[0], [918, 346], 10, { width: 1.8 });
    span(poles[2].low[0], [1500, 200], 14, { width: 1.8 });
    if (DMG) {
      // snapped line dangling to the street from both ends
      const a = poles[0].att[3], b = poles[LEAN_I].att[3];
      sk.path(wiresL, [a, [a[0] + 70, a[1] + 140], [a[0] + 120, a[1] + 340], [a[0] + 130, 700], [a[0] + 150, 832], [a[0] + 190, 846], [a[0] + 206, 832]], { stroke: INK, width: 2.4, seed: S(), double: false, wobble: 1.5 });
      sk.path(wiresL, [b, [b[0] - 40, b[1] + 180], [b[0] - 50, b[1] + 380], [b[0] - 80, 836], [b[0] - 120, 852], [b[0] - 136, 840]], { stroke: INK, width: 2.4, seed: S(), double: false, wobble: 1.5 });
      lines(wiresL, [[a[0] + 206, 832, a[0] + 218, 818], [a[0] + 206, 832, a[0] + 224, 834], [a[0] + 206, 832, a[0] + 210, 814]], { stroke: P.paper, width: 2.4, opacity: 0.9 });
    }
    sittingGull(wiresL, poles[0].att[0][0] + 2, poles[0].att[0][1] - 1);
    sittingGull(wiresL, poles[2].att[3][0] - 2, poles[2].att[3][1] - 1);
    gull(frontL, 760, 210, 1.2, { opacity: 0.8 });

    // street furniture (front; sized for scale-1.4 figures)
    const furn = el("g", { class: "ms-furniture" }, frontL);
    const mb = el("g", {}, furn);
    sk.path(mb, [[700, 812], [704, 690], [700, 650], [716, 618], [774, 618], [790, 650], [786, 690], [790, 812]], { closed: true, fill: P.steel, stroke: INK, width: 3.5, seed: S(), wobble: 0.5 });
    sk.line(mb, 712, 664, 778, 664, { stroke: INK, width: 4, seed: S(), double: false });
    sk.rect(mb, 718, 690, 54, 36, { fill: P.paper, stroke: INK, width: 2, seed: S(), double: false, wobble: 0.3 });
    txt(mb, 745, 714, "U.S. MAIL", { size: 12, fill: P.storm, len: 46 });
    lines(mb, [[706, 790, 784, 790]], { stroke: INK, width: 3, opacity: 0.6 });
    if (DMG) mb.setAttribute("transform", "rotate(-11 700 812)");
    // fire hydrant
    const hy = el("g", {}, furn);
    sk.path(hy, [[1212, 812], [1216, 740], [1208, 730], [1218, 708], [1246, 708], [1256, 730], [1248, 740], [1252, 812]], { closed: true, fill: P.mist, stroke: INK, width: 3.5, seed: S(), wobble: 0.4 });
    sk.line(hy, 1200, 756, 1264, 756, { stroke: INK, width: 7, seed: S(), double: false });
    sk.rect(hy, 1226, 696, 12, 12, { fill: P.mist, stroke: INK, width: 2.5, seed: S(), double: false });
    if (DMG) {
      [[1264, 756, 1330, 700, 1380, 800], [1264, 752, 1320, 690, 1352, 790], [1262, 760, 1300, 728, 1324, 806]].forEach(([x0, y0, cx, cy, x1, y1]) =>
        el("path", { d: `M${x0} ${y0} Q${cx} ${cy} ${x1} ${y1}`, stroke: P.fog, "stroke-width": 3, fill: "none", "stroke-dasharray": "8 7", "stroke-linecap": "round", opacity: 0.85 }, hy));
    }
    // trash can + bench
    if (!DMG) {
      sk.path(furn, [[860, 812], [856, 676], [906, 676], [902, 812]], { closed: true, fill: P.steel, stroke: INK, width: 3, seed: S(), wobble: 0.5 });
      sk.rect(furn, 852, 666, 58, 12, { fill: P.slate, stroke: INK, width: 2.5, seed: S(), double: false });
      lines(furn, [[870, 690, 871, 800], [881, 690, 881, 800], [892, 690, 891, 800]], { stroke: INK, width: 1.6, opacity: 0.6 });
    }
    const bench = el("g", {}, furn);
    sk.rect(bench, 972, 724, 110, 12, { fill: P.steel, stroke: INK, width: 3, seed: S(), wobble: 0.4 });
    sk.rect(bench, 972, 680, 110, 12, { fill: P.steel, stroke: INK, width: 3, seed: S(), wobble: 0.4 });
    sk.rect(bench, 972, 698, 110, 12, { fill: P.steel, stroke: INK, width: 3, seed: S(), wobble: 0.4 });
    lines(bench, [[980, 736, 978, 810], [1074, 736, 1076, 810], [982, 680, 982, 736], [1072, 680, 1072, 736]], { stroke: INK, width: 4, opacity: 1 });
    if (DMG) bench.setAttribute("transform", "rotate(4 972 810)");

    // vignette (moody edges)
    const vg = el("radialGradient", { id: uid + "vig", cx: 0.5, cy: 0.45, r: 0.75 }, defs);
    [[0.55, 0], [1, 0.5]].forEach(([o, a]) => el("stop", { offset: o, "stop-color": P.night, "stop-opacity": a }, vg));
    el("rect", { x: -40, y: -40, width: 2000, height: 1160, fill: `url(#${uid}vig)`, "pointer-events": "none" }, g);

    const harbor = { g: harborL, waterG, shoreX: SHOREX, levelY: LEVEL, drainedY: 790, lowY: 720, surgedY: 560, floodY: 480, wallY: WALL, deckY: DECK, level: LEVEL, setLevel };
    setLevel(opts.level !== undefined ? opts.level : LEVEL);

    return {
      g,
      groundY: GROUND,
      sidewalkY: SIDE,
      nearCurbY: NEAR,
      harbor,
      dock: { g: dockG, deckY: DECK, x0: 16, x1: 548, hut: { g: hutG } },
      ferry: { g: ferryG, floatG, x: 240, waterline: LEVEL },
      gasStation: { g: gas, canopyG, pumps, x: 1590, y: SIDE },
      hill: { g: hillL, ridge, yAt: hillY },
      school: { g: schoolG, x: SCHX, y: SCHY },
      trail: { g: trailG, points: trailPts },
      sign: { g: signG, x: SGX, y: SGY },
      poles: poles.map((p) => ({ g: p.g, x: p.x, baseY: p.baseY, top: p.top })),
      wires: { g: wiresL },
      buildings: { postOffice: po, diner, hardware: hw },
      debris: { g: debrisG },
      layers: { sky: skyL, far: farL, hill: hillL, mid: midL, harbor: harborL, ground: groundL, water: waterL, front: frontL },
    };
  };
})();
