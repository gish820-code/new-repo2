/* Rainy Day background — `forestRoad` v1. Episode 5, DAY 9, DUSK.
 * A narrow dirt forest road receding from the foreground (bottom center) into a notch between dark hills, where it
 * bends right and vanishes under the firs. Strong one-point perspective: the road, its ruts, ditches, fir walls and a
 * line of old boot prints all follow the same ground plane, so a figure walked along roadPath(t) shrinks correctly.
 * Sky duskSkyTop → duskSkyLow with a pale duskGlow band low in the west behind the notch; firs silhouetted in
 * duskHill / ink with aerial haze (far = paler, near = ink). A small side track joins from the left foreground: the
 * fallen fir log lies at that junction (Mags sits on it). At right, a leaning rusted steel post with a hand-lettered
 * paper board 'HWY 4 →'. Dry spell: dusty ruts, a dry ditch with ferns and a culvert mouth, a soft damp patch at the
 * right verge with one clear boot print (the close-up). No power lines.
 *
 * Paste VERBATIM after assets/characters/rainy-day-rig-v3.js (uses only palette, LINE, el, sk, hash).
 * Deterministic, static; scenes own all motion.
 *
 *   const bg = window.RainyDayBG.forestRoad(layerG, { light: "dusk" });
 *   const p = bg.roadPath(0.3);                                  // { x, y, scale } — y = FEET
 *   RD.figure(layer, { x: p.x, y: p.y - 116 * p.scale, scale: p.scale });
 *
 * OPTS (all optional):
 *   light: "dusk"   (default) sun just down: glowing west band behind the notch, road catching the last light.
 *          "late"   twenty minutes later: glow almost gone, everything a step darker, a few stars out.
 *
 * Episode 5 light kit EP5 is defined inside the module (only duskSkyTop/duskSkyLow/duskGlow/duskHill/star used).
 *
 * HANDLES returned (screen px in the 1920x1080 viewBox):
 *   g              root <g>.
 *   groundY = 860  foreground road where feet stand (= roadPath(0).y). Road spans x ≈ 610–1270 at y 860.
 *   roadPath(t, lane) → { x, y, scale }   t 0 (foreground, x 940 y 860 scale 1.4) … 1 (the vanishing point under the
 *                  firs, x ≈ 1080 y ≈ 560 scale ≈ 0.09). y is the FEET line (hip y = y - 116*scale). t is linear in
 *                  ground distance, so a constant-speed tween of t is a constant walking pace (the figure shrinks
 *                  fast at first, then slowly). lane (−1 … 1, default 0) shifts sideways across the road (±0.6 of its
 *                  half width; +1 = right wheel rut). Values of t < 0 (down to −0.03) step toward camera.
 *   road           { g, vanish: {x, y} }   the road group; vanish = where it disappears under the firs.
 *   log            { g, x: 475, y: 902, seatY: 818, x0: 320, x1: 640 }   fallen fir at the junction, left foreground.
 *                  x = middle, y = ground line under it, seatY = top of the log (sit hip there). x0/x1 = sit-able span.
 *   sign           { g, x: 1303, y: 366, postX: 1254, postY: 802 }   'HWY 4 →' board center (x, y); the leaning post
 *                  meets the verge at postX/postY.
 *   sideTrack      { x: 120, y: 905 }   where the side track leaves frame at left (figures can arrive from here).
 *   skyG           sky group (gradient, clouds, stars).
 *   lightG         light overlays: the duskGlow band in the west sky behind the notch (clipped to the sky above the
 *                  far ridge) + the glow rim along that ridge. It sits behind the nearer ridges and the firs, so
 *                  scenes can tween its opacity (fade the dusk out: 1 → 0.2) or drift it without washing the trees.
 *                  (The far road's faint sheen is part of the road and stays.)
 *   shadowDir      { dx: -0.2, dy: 0.98 }   the last light is low and ahead (behind the notch): soft shadows fall
 *                  toward camera / slightly left. Keep figure shadows faint and long at dusk.
 *   detail         { g, x: 1210, y: 812 }   close-up spot: the rusted sign-post base (bolted foot, flaking paint,
 *                  grass tufts, pebbles) with a boot print pressed into the soft verge beside it. Reads at scale 3.
 *   hills          { g }   the far hills and notch;  trees { g }  the fir walls;  nearG  the framing near trunks.
 */
(function () {
  window.RainyDayBG = window.RainyDayBG || {};
  if (window.RainyDayBG.forestRoad) return;
  let instance = 0;

  window.RainyDayBG.forestRoad = function (parent, opts) {
    opts = opts || {};
    const RD = window.RainyDay, P = RD.palette, LINE = RD.LINE, sk = RD.sk, el = RD.el, hash = RD.hash;
    const INK = P.ink;
    const EP5 = {
      // FIRST SUNNY DAY (camp, sun)
      sunSkyTop: "#7FA3C2", sunSkyLow: "#B9CFDF", sunLit: "#EEF0EA", sunGround: "#A9A595", dust: "#C8C2B2",
      dryGrass: "#8E8F7C", hardShadow: "#2B3644",
      // MIDDAY DAPPLE (ravine)
      leafDark: "#2F3D3A", leafMid: "#4C5E57", moss: "#6E7F6A", dappleLight: "#DCE3D6",
      // AFTERNOON HAZE (bridge)
      hazeSky: "#C9D2D9", concrete: "#9EA4A6", concreteDark: "#6B7275", rust: "#7A6A5E",
      // LATE AFTERNOON (tide flats)
      lateSky: "#D7CDBF", mud: "#5E5A52", mudWet: "#7C7A72", mudShine: "#D9D3C6",
      // GOLDEN HOUR (logging road) — pale amber, clearly NOT slicker yellow
      goldSky: "#D8BE96", goldLight: "#E6D3B0", goldShadow: "#3E3A42", gravel: "#8C8478",
      // DUSK (forest road)
      duskSkyTop: "#4F5270", duskSkyLow: "#A88E92", duskGlow: "#CDB2A4", duskHill: "#2C2E40",
      // NIGHT (woods)
      nightSky: "#0E131D", star: "#E6EAEE",
    };
    const LIGHT = opts.light === "late" ? "late" : "dusk";
    const id = "rdfr" + (instance++) + "_";
    const f1 = (v) => (+v).toFixed(1);
    let SEED = 5200;
    const sd = () => (SEED += 7);
    const rnd = (i) => (hash(i * 1.913 + 17.7) + 1) / 2; // deterministic 0..1

    const g = el("g", { class: "rd-bg rd-bg-forest-road" }, parent);
    const defs = el("defs", {}, g);
    function grad(name, stops, x2, y2) {
      const lg = el("linearGradient", { id: id + name, x1: 0, y1: 0, x2: x2 || 0, y2: y2 === undefined ? 1 : y2 }, defs);
      stops.forEach(([o, c, a]) => el("stop", { offset: o, "stop-color": c, "stop-opacity": a === undefined ? 1 : a }, lg));
      return "url(#" + id + name + ")";
    }
    let clipN = 0;
    function clipTo(par, pts) {
      const cid = id + "clip" + (clipN++);
      const cp = el("clipPath", { id: cid }, defs);
      el("path", { d: "M" + pts.map((q) => f1(q[0]) + " " + f1(q[1])).join(" L") + " Z" }, cp);
      return el("g", { "clip-path": "url(#" + cid + ")" }, par);
    }

    // ------------------------------------------------------------------ perspective ground plane
    // Ground distance D (1 = the foreground feet line). u = 1/D. Screen y = HZ + 320u. Lateral world X (px at D=1)
    // projects to x = VX + X*u. The road centerline bends right with distance: lat(D).
    const HZ = 540, VX = 1000, GY = 860, W = 330, D_END = 16;
    const lat = (D) => -60 + 5.96 * (D - 1) * (D - 1);
    const proj = (D, X) => [VX + X / D, HZ + (GY - HZ) / D];
    const D_of_t = (t) => 1 + (D_END - 1) * t;
    function roadPath(t, lane) {
      t = Math.max(-0.03, Math.min(1, +t || 0));
      const D = D_of_t(t), X = lat(D) + (lane || 0) * W * 0.6;
      const [x, y] = proj(D, X);
      return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, scale: Math.round((1.4 / D) * 1000) / 1000 };
    }
    const Dlist = (d0, d1, n) => { const a = []; for (let i = 0; i <= n; i++) { const k = i / n; a.push(1 / (1 / d0 + (1 / d1 - 1 / d0) * k)); } return a; };
    const edge = (X, d0, d1, n) => Dlist(d0, d1, n || 40).map((D) => proj(D, lat(D) + X));

    // ------------------------------------------------------------------ drawing kits
    // fir: x = trunk center, base = ground, h/w size; o: fill, stroke, width, bare (visible trunk fraction), tiers,
    // needles (stroke colour for little bough lines), trunk colour, opacity
    function fir(par, x, base, h, w, o) {
      o = o || {};
      const fg = el("g", { opacity: o.opacity !== undefined ? o.opacity : 1 }, par);
      const seed = o.seed || sd(), lw = o.width !== undefined ? o.width : LINE.main, stroke = o.stroke || INK;
      const bare = o.bare !== undefined ? o.bare : 0.12;
      const tw = Math.max(1.5, w * 0.06);
      sk.poly(fg, [[x - tw, base + 2], [x - tw * 0.35, base - h * 0.9], [x + tw * 0.35, base - h * 0.9], [x + tw, base + 2]],
        { fill: o.trunk || o.fill, stroke, width: Math.max(1, lw * 0.6), seed: seed + 3, wobble: Math.min(1, h / 200), double: false });
      const tiers = o.tiers || Math.max(4, Math.min(14, Math.round(h / 55)));
      const top = base - h, cb = base - h * bare;
      const R = [], Lf = [];
      for (let i = 1; i <= tiers; i++) {
        const t = i / tiers, yy = top + (cb - top) * t;
        const ww = (w / 2) * (0.1 + 0.9 * Math.pow(t, 0.85)) * (0.85 + 0.3 * rnd(seed + i));
        const th = (cb - top) / tiers;
        R.push([x + ww * 0.55, yy - th * 0.55], [x + ww, yy + th * 0.15]);
        const wl = ww * (0.85 + 0.3 * rnd(seed + i + 40));
        Lf.push([x - wl * 0.55, yy - th * 0.55], [x - wl, yy + th * 0.15]);
      }
      const under = [];
      for (let k = 1; k < 6; k++) under.push([x + (w / 2) * 0.9 * (1 - (2 * k) / 6), cb + (k % 2 ? -h * 0.02 : h * 0.015)]);
      const shape = [[x + hash(seed) * w * 0.02, top]].concat(R, under, Lf.reverse());
      sk.poly(fg, shape, { fill: o.fill, stroke, width: lw, seed: seed + 7, wobble: Math.min(1.6, Math.max(0.3, h / 260)), step: 400, double: o.double });
      if (o.needles) { // bough lines inside the crown (one path)
        let d = "";
        for (let i = 2; i < tiers; i += 1) {
          const t = i / tiers, yy = top + (cb - top) * t, ww = (w / 2) * (0.1 + 0.9 * Math.pow(t, 0.85)), j = hash(seed + i) * 2;
          d += `M${f1(x - ww * 0.1)} ${f1(yy - 6 + j)} L${f1(x + ww * 0.7)} ${f1(yy + 4 - j)} M${f1(x - ww * 0.05)} ${f1(yy - 4 - j)} L${f1(x - ww * 0.6)} ${f1(yy + 6 + j)} `;
        }
        el("path", { d, fill: "none", stroke: o.needles, "stroke-width": f1(Math.max(1, lw * 0.5)), "stroke-linecap": "round", opacity: 0.5 }, fg);
      }
      return fg;
    }
    function fern(par, x, y, len, ang, seed, col, wd) {
      // wobbly spine (sk.path) + all pinnae in one hand-jittered path (keeps the element count sane)
      const a = (ang * Math.PI) / 180, c = col || P.slate, sgn = Math.sign(ang || 1), pts = [];
      for (let i = 0; i <= 8; i++) { const t = i / 8, bend = t * t * 0.9; pts.push([x + Math.sin(a + bend * sgn) * len * t, y - Math.cos(a + bend * sgn) * len * t]); }
      sk.path(par, pts, { stroke: c, width: (wd || LINE.detail) + 1, seed, wobble: 0.6, double: false });
      let d = "";
      for (let i = 1; i < 8; i++) {
        const p = pts[i], q = pts[i + 1], dx = q[0] - p[0], dy = q[1] - p[1], dd = Math.hypot(dx, dy) || 1;
        const l = len * 0.22 * (1 - i / 9), nx = -dy / dd, ny = dx / dd, j = hash(seed + i) * 1.2;
        d += `M${f1(p[0])} ${f1(p[1])} L${f1(p[0] + nx * l + dx * 0.6 + j)} ${f1(p[1] + ny * l + dy * 0.6 - j)} M${f1(p[0])} ${f1(p[1])} L${f1(p[0] - nx * l + dx * 0.6 - j)} ${f1(p[1] - ny * l + dy * 0.6 + j)} `;
      }
      el("path", { d, fill: "none", stroke: c, "stroke-width": wd || LINE.detail, "stroke-linecap": "round" }, par);
    }
    function fernClump(par, x, y, s, col, seed, wd) {
      for (let k = 0; k < 6; k++) fern(par, x + (k - 2.5) * 4 * s, y, (40 + rnd(seed + k) * 30) * s, -70 + k * 28 + hash(seed + k) * 8, seed + k * 31, col, wd);
    }
    function tuft(par, x, y, s, col, seed) {
      let d = "";
      for (let k = 0; k < 5; k++) d += `M${f1(x + (k - 2) * 3 * s)} ${f1(y)} L${f1(x + (k - 2) * 6 * s + hash(seed + k) * 3 * s)} ${f1(y - (10 + rnd(seed + k) * 9) * s)} `;
      el("path", { d, fill: "none", stroke: col, "stroke-width": f1(Math.max(1, 1.6 * Math.min(1.4, s))), "stroke-linecap": "round" }, par);
    }
    function pebble(par, x, y, r, fill, seed) {
      sk.poly(par, [[x - r, y], [x - r * 0.6, y - r * 0.7], [x + r * 0.5, y - r * 0.75], [x + r, y - r * 0.1], [x + r * 0.6, y + r * 0.35], [x - r * 0.5, y + r * 0.35]], { fill, stroke: P.storm, width: Math.max(1, r * 0.25), seed, wobble: 0.3, double: false, step: 400 });
    }

    // ------------------------------------------------------------------ SKY
    const skyG = el("g", { class: "sky" }, g);
    const skyFill = grad("sky", [[0, EP5.duskSkyTop], [0.55, EP5.duskSkyTop], [0.86, EP5.duskSkyLow], [1, EP5.duskSkyLow]]);
    sk.rect(skyG, -20, -20, 1960, 640, { fill: skyFill, stroke: "none", wobble: 0, double: false });
    sk.hatch(skyG, -20, -20, 1960, 170, { gap: 18, angle: 160, stroke: EP5.duskHill, width: 2, opacity: 0.22, seed: sd() });
    sk.hatch(skyG, -20, 140, 1960, 110, { gap: 26, angle: 160, stroke: EP5.duskHill, width: 1.5, opacity: 0.12, seed: sd() });
    // long thin dusk clouds: dark bodies, glow-lit undersides near the west
    const cloud = (x, y, w, h, lit) => {
      const n = Math.max(6, Math.round(w / 70)), top = [], bot = [];
      for (let i = 0; i <= n; i++) { const t = i / n; top.push([x + w * t, y - Math.sin(t * Math.PI) * h * (0.6 + 0.4 * rnd(x + i))]); bot.push([x + w * t, y + 3 + hash(x + i) * 2]); }
      sk.poly(skyG, top.concat(bot.reverse()), { fill: EP5.duskHill, stroke: EP5.duskHill, width: 2, seed: sd(), wobble: 1.5, opacity: 0.55, step: 60, double: false });
      if (lit) sk.path(skyG, bot.slice(1, -1).reverse().map(([a, b]) => [a, b - 1]), { stroke: EP5.duskGlow, width: 2.5, seed: sd(), wobble: 0.8, double: false, opacity: lit });
    };
    cloud(80, 120, 520, 22, 0); cloud(520, 78, 380, 14, 0); cloud(1250, 105, 640, 26, 0);
    cloud(260, 260, 460, 14, 0.35); cloud(760, 300, 420, 10, 0.7); cloud(1240, 318, 380, 12, 0.75); cloud(1500, 250, 420, 14, 0.4);
    cloud(860, 372, 300, 7, 0.9);
    // first stars (and the evening star) — few at dusk, more when late
    const starG = el("g", { class: "stars" }, skyG);
    const nStars = LIGHT === "late" ? 34 : 9;
    for (let i = 0; i < nStars; i++) {
      const x = 40 + rnd(i * 3 + 1) * 1840, y = 18 + rnd(i * 3 + 2) * (LIGHT === "late" ? 300 : 180);
      const r = 1 + rnd(i * 5 + 7) * 1.4;
      el("circle", { cx: f1(x), cy: f1(y), r: f1(r), fill: EP5.star, opacity: f1(0.35 + rnd(i + 70) * 0.45) }, starG);
    }
    el("circle", { cx: 1395, cy: 198, r: 3.2, fill: EP5.star, opacity: 0.95 }, starG);
    sk.line(starG, 1388, 198, 1402, 198, { stroke: EP5.star, width: 1, seed: sd(), wobble: 0, double: false, opacity: 0.6 });
    sk.line(starG, 1395, 191, 1395, 205, { stroke: EP5.star, width: 1, seed: sd(), wobble: 0, double: false, opacity: 0.6 });

    // ------------------------------------------------------------------ FAR HILLS + NOTCH
    const hillsG = el("g", { class: "hills" }, g);
    const NOTCH = [1086, 446];
    const far1 = [[-20, 250], [120, 226], [260, 222], [420, 246], [580, 290], [730, 342], [860, 390], [970, 424], [1040, 440], NOTCH, [1130, 436], [1220, 410], [1340, 360], [1480, 300], [1620, 262], [1760, 246], [1940, 256], [1940, 620], [-20, 620]];
    sk.poly(hillsG, far1, { fill: EP5.duskHill, stroke: EP5.duskHill, width: LINE.detail, seed: sd(), wobble: 2 });
    sk.rect(hillsG, -20, 210, 1960, 400, { fill: grad("haze1", [[0, EP5.duskSkyLow, 0.34], [0.5, EP5.duskSkyLow, 0.22], [1, EP5.duskSkyLow, 0.08]]), stroke: "none", wobble: 0, double: false });
    sk.hatch(clipTo(hillsG, far1), -20, 210, 1960, 400, { gap: 16, angle: 118, stroke: EP5.duskHill, width: 1.5, opacity: 0.35, seed: sd() });
    const ridgeY = (x) => { for (let k = 0; k < far1.length - 3; k++) { const a = far1[k], b = far1[k + 1]; if (x >= a[0] && x <= b[0]) return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]); } return 0; };
    // serrated tree line on the far ridges (tiny firs)
    for (let i = 0; i < 150; i++) {
      const x = -10 + i * 13.1 + hash(i + 7) * 4, y = ridgeY(x);
      if (!y) continue;
      const h = 9 + rnd(i) * 13;
      sk.poly(hillsG, [[x, y - h], [x - h * 0.3, y + 3], [x + h * 0.3, y + 3]], { fill: EP5.duskHill, stroke: EP5.duskHill, width: 1.2, seed: sd(), wobble: 0.5, double: false });
    }
    // ------------------------------------------------------------------ LIGHT (glow band behind the notch)
    const lightG = el("g", { class: "light", opacity: LIGHT === "late" ? 0.3 : 1 }, g);
    const glowBand = clipTo(lightG, far1.slice(0, -2).concat([[1940, -20], [-20, -20]]));
    sk.rect(glowBand, -20, 300, 1960, 160, { fill: grad("glow", [[0, EP5.duskGlow, 0], [0.5, EP5.duskGlow, 0.7], [1, EP5.duskGlow, 1]]), stroke: "none", wobble: 0, double: false });
    sk.poly(glowBand, [[700, 440], [860, 404], [1000, 384], [1110, 380], [1250, 392], [1400, 418], [1520, 452], [1520, 470], [700, 470]], { fill: EP5.duskGlow, stroke: "none", seed: sd(), wobble: 2, double: false, opacity: 0.9 });
    for (let i = 0; i < 6; i++) {
      const y = 372 + i * 11, x = 820 + hash(i + 3) * 70;
      sk.line(glowBand, x, y, x + 240 + rnd(i) * 160, y + 2, { stroke: P.paper, width: 1.5, seed: sd(), wobble: 0.6, double: false, opacity: 0.16 + 0.06 * i });
    }
    // rim light along the far ridge near the notch
    sk.path(lightG, [[730, 342], [860, 390], [970, 424], [1040, 440], NOTCH, [1130, 436], [1220, 410], [1340, 360]], { stroke: EP5.duskGlow, width: 2, seed: sd(), wobble: 1, double: false, opacity: 0.6 });

    // nearer ridge pair (darker) dipping into the notch
    const far2L = [[-20, 360], [160, 352], [340, 372], [520, 408], [700, 452], [850, 490], [960, 516], [1050, 532], [1070, 560], [-20, 560]];
    const far2R = [[1110, 548], [1150, 526], [1250, 498], [1400, 458], [1560, 420], [1720, 400], [1940, 398], [1940, 560], [1110, 560]];
    [far2L, far2R].forEach((pts) => {
      sk.poly(hillsG, pts, { fill: EP5.duskHill, stroke: INK, width: LINE.detail, seed: sd(), wobble: 1.8 });
      sk.hatch(clipTo(hillsG, pts), Math.min(pts[0][0], pts[pts.length - 2][0]) - 20, 340, 1100, 230, { gap: 12, angle: 120, stroke: INK, width: 1.5, opacity: 0.3, seed: sd() });
    });

    // ------------------------------------------------------------------ GROUND PLANE (forest floor)
    const groundG = el("g", { class: "ground" }, g);
    const floorPts = [[-20, HZ + 12], [1940, HZ + 12], [1940, 1100], [-20, 1100]];
    sk.poly(groundG, floorPts, { fill: grad("floor", [[0, EP5.duskHill], [0.3, P.storm], [1, P.night]]), stroke: "none", seed: sd(), wobble: 0, double: false });
    // needle litter: short strokes laid on the plane, compressing with distance
    for (let i = 0; i < 30; i++) {
      const D = 1 / (1 / 0.6 - (1 / 0.6 - 1 / 14) * (i / 30));
      for (let j = 0; j < 7; j++) {
        const s = j % 2 ? 1 : -1, X = lat(D) + s * (W + 160 + rnd(i * 17 + j) * 1500), [x, y] = proj(D, X);
        if (x < -40 || x > 1960) continue;
        sk.line(groundG, x, y, x + (24 + rnd(j + i) * 30) / D, y + hash(i * 3 + j) * 2, { stroke: P.slate, width: Math.max(1, 2 / D), seed: sd(), wobble: 0.6, double: false, opacity: 0.45 });
      }
    }

    // ------------------------------------------------------------------ TREE WALLS (rows on the ground plane, far → near, with haze)
    const treesG = el("g", { class: "trees" }, g);
    const trees = [];
    const rows = [24, 21, 18.5, 16, 13.8, 11.8, 10, 8.5, 7.1, 6, 5, 4.2, 3.5, 2.9, 2.4, 1.95, 1.6];
    rows.forEach((D, ri) => {
      [-1, 1].forEach((s) => {
        let o = W + (D < 2.5 ? 1150 : 860) + rnd(ri * 7 + s) * 200;
        for (let k = 0; k < 14; k++) {
          const X = lat(D) + s * o, x = VX + X / D;
          if (x < -320 || x > 2240 || o > 6200) break;
          trees.push({ D: D * (1 + hash(ri * 31 + k + s) * 0.04), X, H: (D < 9 ? 2400 + rnd(ri * 13 + k * 3 + s) * 1500 : 1600 + rnd(ri * 13 + k * 3 + s) * 800), s: ri * 40 + k * 2 + (s > 0 ? 1 : 0), inner: k === 0 });
          // young understory fir in front of the gap, now and then
          if (rnd(ri * 19 + k * 7 + s) > 0.55 && D < 12) trees.push({ D: D * 0.94, X: X - s * (140 + rnd(k + ri) * 120), H: 700 + rnd(ri * 3 + k) * 700, s: 500 + ri * 40 + k * 2 + (s > 0 ? 1 : 0), young: true });
          o += 420 + rnd(ri * 5 + k * 11 + s) * 300;
        }
      });
    });
    // the clump the road vanishes under (standing on the road's continuation past the bend)
    [[17.6, -140], [18.4, 150], [19.4, -20], [20.6, 260], [22, 60]].forEach(([D, dx], k) => trees.push({ D, X: lat(D) + dx * D / 9, H: 1500 + rnd(k + 91) * 700, s: 900 + k }));
    trees.sort((a, b) => b.D - a.D);
    const hazeAt = [15, 9, 5];
    let hz = 0;
    trees.forEach((tr) => {
      while (hz < hazeAt.length && tr.D < hazeAt[hz]) {
        sk.rect(treesG, -20, 120, 1960, 560, { fill: grad("hz" + hz, [[0, EP5.duskSkyLow, 0.0], [0.55, EP5.duskSkyLow, 0.2], [0.8, EP5.duskSkyLow, 0.16], [1, EP5.duskSkyLow, 0]]), stroke: "none", wobble: 0, double: false });
        hz++;
      }
      const [x, y] = proj(tr.D, tr.X);
      const h = tr.H / tr.D, w = h * (tr.young ? 0.42 : 0.23 + rnd(tr.s + 50) * 0.08);
      if (x + w < -40 || x - w > 1960) return;
      const far = tr.D > 12, mid = tr.D > 5.5;
      const tg = fir(treesG, x, y, h, w, {
        seed: 6000 + tr.s * 17,
        fill: far ? EP5.duskHill : mid ? P.storm : P.night,
        stroke: far ? EP5.duskHill : INK,
        width: far ? 1.2 : mid ? 2 : 3,
        trunk: far ? EP5.duskHill : mid ? P.night : INK,
        bare: tr.young ? 0.04 : far ? 0.1 : 0.14 + rnd(tr.s + 9) * 0.2,
        needles: far ? null : mid ? P.slate : P.storm,
        double: false,
      });
      // sky-lit rim on the corridor side of the front trees of each wall
      if (tr.inner && !far) {
        const sgn = x < VX + lat(tr.D) / tr.D ? 1 : -1, cb = y - h * 0.2;
        sk.path(tg, [[x + sgn * w * 0.06, y - h + 6], [x + sgn * w * 0.28, y - h * 0.62], [x + sgn * w * 0.4, y - h * 0.38], [x + sgn * w * 0.48, cb]], { stroke: mid ? P.steel : P.slate, width: mid ? 1.6 : 2.4, seed: 7000 + tr.s, wobble: 1.4, double: false, opacity: 0.55 });
      }
      // a dead lower branch stub on some bare trunks
      if (!far && !tr.young && rnd(tr.s + 77) > 0.6) {
        const by = y - h * (0.08 + rnd(tr.s + 5) * 0.08), dir = rnd(tr.s + 6) > 0.5 ? 1 : -1;
        sk.line(tg, x, by, x + dir * w * 0.22, by - h * 0.04, { stroke: mid ? P.night : INK, width: Math.max(1.2, w * 0.018), seed: 7100 + tr.s, wobble: 0.4, double: false });
      }
    });

    // ------------------------------------------------------------------ THE ROAD
    const roadG = el("g", { class: "road" }, g);
    // soft grassy shoulders, then the tread
    [-1, 1].forEach((s) => {
      const pts = edge(s * (W + 150), 0.55, 19, 50).concat(edge(s * (W - 10), 19, 0.55, 50));
      sk.poly(roadG, pts, { fill: P.slate, stroke: "none", seed: sd(), wobble: 0, double: false });
    });
    const rL = edge(-W, 0.55, 19, 60), rR = edge(W, 0.55, 19, 60);
    const roadPoly = rL.concat(rR.slice().reverse());
    sk.poly(roadG, roadPoly, { fill: grad("road", [[0, EP5.duskGlow], [0.1, EP5.duskSkyLow], [0.45, P.steel], [1, P.slate]]), stroke: "none", seed: sd(), wobble: 0, double: false });
    sk.poly(roadG, roadPoly, { fill: EP5.duskSkyLow, stroke: "none", seed: sd(), wobble: 0, double: false, opacity: 0.18 });
    const roadIn = clipTo(roadG, roadPoly);
    // dust texture: short strokes that compress with distance
    for (let i = 0; i < 40; i++) {
      const D = 1 / (1 / 0.55 - (1 / 0.55 - 1 / 16) * (i / 40));
      const a = proj(D, lat(D) - W), b = proj(D, lat(D) + W);
      const k = Math.min(1, 1.6 / D);
      for (let j = 0; j < 4; j++) {
        const t0 = rnd(i * 9 + j), len = 0.05 + rnd(i * 11 + j) * 0.1;
        const x0 = a[0] + (b[0] - a[0]) * t0, x1 = a[0] + (b[0] - a[0]) * Math.min(1, t0 + len);
        sk.line(roadIn, x0, a[1] + hash(i + j) * 3 * k, x1, a[1] + hash(i + j + 5) * 3 * k, { stroke: P.slate, width: Math.max(1, 2 * k), seed: sd(), wobble: 0.5 * k, double: false, opacity: 0.3 });
      }
    }
    // two wheel ruts (soft dark bands with a pale lip) + a few pebbles
    [-0.55, 0.55].forEach((lane, li) => {
      const rutF = edge(W * (lane - 0.12), 0.56, 17, 50).concat(edge(W * (lane + 0.12), 17, 0.56, 50));
      sk.poly(roadIn, rutF, { fill: P.slate, stroke: "none", seed: sd(), wobble: 0, double: false, opacity: 0.4 });
      sk.path(roadIn, edge(W * (lane + (li ? -0.13 : 0.13)), 0.56, 15, 40), { stroke: P.mist, width: 1.6, seed: sd(), wobble: 1.2, double: false, opacity: 0.35 });
      sk.path(roadIn, edge(W * (lane + (li ? 0.12 : -0.12)), 0.56, 15, 40), { stroke: P.storm, width: 2, seed: sd(), wobble: 1.2, double: false, opacity: 0.4 });
    });
    for (let i = 0; i < 22; i++) {
      const D = 1 / (1 / 0.62 - (1 / 0.62 - 1 / 9) * (i / 22));
      const [x, y] = proj(D, lat(D) + hash(i * 3) * W * 0.1);
      tuft(roadIn, x, y, 1.1 / D, P.slate, sd());
      const [px, py] = proj(D * 1.03, lat(D) + hash(i * 7 + 1) * W * 0.9);
      pebble(roadIn, px, py, 4.5 / D, P.mist, sd());
    }
    // far road catching the last of the glow (static sheen, part of the road)
    const glowRoad = edge(-W * 0.85, 3.2, 19, 30).concat(edge(W * 0.85, 19, 3.2, 30));
    sk.poly(roadG, glowRoad, { fill: grad("rglow", [[0, EP5.duskGlow, 0.0], [0.4, EP5.duskGlow, 0.5], [1, EP5.duskGlow, 0.0]], 0, 1), stroke: "none", seed: sd(), wobble: 0, double: false, opacity: LIGHT === "late" ? 0.25 : 1 });
    sk.path(roadG, rL, { stroke: P.storm, width: 2.5, seed: sd(), wobble: 1.6, double: false, opacity: 0.8 });
    sk.path(roadG, rR, { stroke: P.storm, width: 2.5, seed: sd(), wobble: 1.6, double: false, opacity: 0.8 });

    // old boot prints walking away up the left rut (someone went this way)
    const printsG = el("g", { class: "prints" }, roadG);
    for (let i = 0; i < 18; i++) {
      const D = 1.15 + i * 0.38;
      const X = lat(D) - W * (0.3 + (i % 2 ? 0.06 : -0.06));
      const [x, y] = proj(D, X), s = 1 / D;
      el("ellipse", { cx: f1(x), cy: f1(y), rx: f1(9 * s), ry: f1(4 * s), fill: P.slate, opacity: 0.6 }, printsG);
      if (s > 0.3) el("ellipse", { cx: f1(x + 1 * s), cy: f1(y - 7 * s), rx: f1(6 * s), ry: f1(2.6 * s), fill: P.slate, opacity: 0.5 }, printsG);
    }

    // ------------------------------------------------------------------ DITCHES (dry: stones, ferns, culvert)
    const ditchG = el("g", { class: "ditch" }, g);
    [-1, 1].forEach((s) => {
      const outer = edge(s * (W + 150), 0.55, 18, 40), inner = edge(s * (W + 60), 18, 0.55, 40);
      sk.poly(ditchG, outer.concat(inner), { fill: P.storm, stroke: "none", seed: sd(), wobble: 0, double: false, opacity: 0.9 });
      sk.path(ditchG, edge(s * (W + 105), 0.6, 16, 40), { stroke: P.night, width: 2.5, seed: sd(), wobble: 1.4, double: false, opacity: 0.7 });
      // ragged grass lip on the road side
      for (let i = 0; i < 34; i++) {
        const D = 1 / (1 / 0.6 - (1 / 0.6 - 1 / 12) * (i / 34)), [x, y] = proj(D, lat(D) + s * (W + 62));
        tuft(ditchG, x, y, 1.1 / D, P.steel, sd());
      }
      for (let i = 0; i < 18; i++) {
        const D = 1 / (1 / 0.75 - (1 / 0.75 - 1 / 11) * (i / 18));
        const [x, y] = proj(D, lat(D) + s * (W + 170 + rnd(i * 13 + s) * 120));
        if (s < 0 && x > 180 && x < 720 && y > 800) continue; // keep the log clear
        fernClump(ditchG, x, y, 1.1 / D, D < 1.4 ? P.slate : P.storm, sd(), D < 1.4 ? 2.4 : 1.6);
      }
      for (let i = 0; i < 7; i++) {
        const D = 0.9 + i * 0.7, [x, y] = proj(D, lat(D) + s * (W + 100 + hash(i) * 20));
        pebble(ditchG, x, y, 8 / D, P.slate, sd());
      }
    });
    // culvert mouth in the left ditch (corrugated pipe end) — mid distance
    {
      const D = 2.6, [x, y] = proj(D, lat(D) - W - 105), r = 44 / D;
      sk.circle(ditchG, x, y - r * 0.8, r, { fill: P.night, stroke: P.steel, width: 2, seed: sd(), wobble: 0.4 });
      sk.circle(ditchG, x, y - r * 0.8, r * 0.7, { fill: "none", stroke: P.slate, width: 1.4, seed: sd(), wobble: 0.3, double: false });
    }
    // an old reflector post on the right verge, mid distance
    {
      const D = 3.8, [x, y] = proj(D, lat(D) + W + 200), h = 300 / D;
      sk.poly(ditchG, [[x - 3, y], [x - 2, y - h], [x + 3, y - h - 1], [x + 3, y]], { fill: P.steel, stroke: INK, width: 1.6, seed: sd(), wobble: 0.3 });
      sk.rect(ditchG, x - 2.5, y - h + 6, 5, 10, { fill: P.fog, stroke: P.storm, width: 1, seed: sd(), wobble: 0.2, double: false });
    }

    // an old cut stump on the right verge (springboard notch, moss cap) + a slash pile
    {
      const D = 1.9, [x, y] = proj(D, lat(D) + W + 560), k = 1 / D;
      const st = [[x - 104 * k, y + 6], [x - 74 * k, y - 18 * k], [x - 62 * k, y - 86 * k], [x - 20 * k, y - 96 * k], [x + 30 * k, y - 92 * k], [x + 64 * k, y - 82 * k], [x + 78 * k, y - 20 * k], [x + 112 * k, y + 6]];
      sk.poly(ditchG, st, { fill: P.slate, stroke: INK, width: 3, seed: sd(), wobble: 1 });
      sk.hatch(clipTo(ditchG, st), x - 74 * k, y - 134 * k, 150 * k, 140 * k, { gap: 7, angle: 95, stroke: P.storm, width: 1.5, opacity: 0.6, seed: sd() });
      el("ellipse", { cx: f1(x), cy: f1(y - 90 * k), rx: f1(64 * k), ry: f1(12 * k), fill: P.slate, stroke: INK, "stroke-width": 2 }, ditchG);
      el("ellipse", { cx: f1(x - 4 * k), cy: f1(y - 90 * k), rx: f1(30 * k), ry: f1(5 * k), fill: "none", stroke: P.storm, "stroke-width": 1.4 }, ditchG);
      sk.poly(ditchG, [[x - 40 * k, y - 60 * k], [x - 8 * k, y - 64 * k], [x - 8 * k, y - 48 * k], [x - 40 * k, y - 44 * k]], { fill: P.night, stroke: INK, width: 2, seed: sd(), wobble: 0.4 });
      const [sx, sy] = proj(2.3, lat(2.3) + W + 820);
      for (let i = 0; i < 9; i++) sk.line(ditchG, sx - 60 + i * 13, sy - rnd(i) * 26, sx - 20 + i * 11 + hash(i) * 30, sy - 30 - rnd(i + 4) * 30, { stroke: i % 2 ? P.slate : INK, width: 3, seed: sd(), wobble: 0.6, double: false });
      fernClump(ditchG, x + 90 * k, y + 6, 1.2 * k * 1.6, P.slate, sd(), 2);
    }

    // ------------------------------------------------------------------ SIDE TRACK + JUNCTION (left foreground)
    const juncG = el("g", { class: "junction" }, g);
    const trackTop = [[-20, 880], [160, 872], [340, 864], [500, 858], [600, 856]];
    const trackBot = [[640, 940], [480, 958], [280, 976], [80, 990], [-20, 996]];
    sk.poly(juncG, trackTop.concat(trackBot), { fill: P.slate, stroke: "none", seed: sd(), wobble: 0, double: false });
    sk.path(juncG, trackTop, { stroke: P.storm, width: 3, seed: sd(), wobble: 1.4, double: false });
    sk.path(juncG, [[-20, 940], [200, 928], [420, 916], [600, 904]], { stroke: P.steel, width: 2, seed: sd(), wobble: 1, double: false, opacity: 0.5 });
    sk.hatch(clipTo(juncG, trackTop.concat(trackBot)), -20, 850, 680, 150, { gap: 16, angle: 174, stroke: P.storm, width: 1.5, opacity: 0.4, seed: sd() });

    // ------------------------------------------------------------------ THE SIGN 'HWY 4 →' (right shoulder)
    const signG = el("g", { class: "sign" }, g);
    const SD = 1.22, SPp = proj(SD, lat(SD) + W + 40);
    const SP = [Math.round(SPp[0]), Math.round(SPp[1])];          // post foot (≈ 1252, 802)
    const lean = 7;                                                // degrees, leaning right
    const sGrp = el("g", { transform: `rotate(${lean} ${SP[0]} ${SP[1]})` }, signG);
    sk.poly(sGrp, [[SP[0] - 9, SP[1] + 4], [SP[0] - 8, SP[1] - 452], [SP[0] + 8, SP[1] - 452], [SP[0] + 9, SP[1] + 4]], { fill: EP5.rust, stroke: INK, width: 3, seed: sd(), wobble: 0.6 });
    for (let i = 0; i < 9; i++) {
      const y = SP[1] - 40 - i * 44 - rnd(i) * 18;
      sk.line(sGrp, SP[0] - 7, y, SP[0] + 6, y + 6 + rnd(i + 4) * 10, { stroke: P.storm, width: 1.5, seed: sd(), wobble: 0.3, double: false, opacity: 0.7 });
    }
    for (let i = 0; i < 16; i++) el("circle", { cx: f1(SP[0] - 5 + rnd(i + 3) * 10), cy: f1(SP[1] - 30 - rnd(i + 9) * 380), r: f1(1 + rnd(i) * 1.5), fill: P.steel, opacity: 0.8 }, sGrp);
    const BX = SP[0] - 4, BY = SP[1] - 436;   // board center (before the lean)
    sk.poly(sGrp, [[BX - 112, BY - 46], [BX + 112, BY - 50], [BX + 116, BY + 44], [BX - 108, BY + 48]], { fill: P.steel, stroke: INK, width: LINE.main, seed: sd(), wobble: 0.8 });
    sk.poly(sGrp, [[BX - 100, BY - 36], [BX + 102, BY - 40], [BX + 104, BY + 34], [BX - 96, BY + 38]], { fill: P.paper, stroke: P.slate, width: 2, seed: sd(), wobble: 0.6, double: false });
    sk.hatch(sGrp, BX - 96, BY + 8, 70, 28, { gap: 7, angle: 80, stroke: EP5.rust, width: 1.5, opacity: 0.45, seed: sd() });
    sk.hatch(sGrp, BX + 58, BY - 38, 44, 22, { gap: 8, angle: 100, stroke: P.mist, width: 1.5, opacity: 0.6, seed: sd() });
    sk.poly(sGrp, [[BX + 102, BY + 34], [BX + 116, BY + 44], [BX + 92, BY + 48]], { fill: P.slate, stroke: INK, width: 2, seed: sd(), wobble: 0.3 });
    [[BX, BY - 28], [BX + 2, BY + 28]].forEach(([x, y]) => { sk.circle(sGrp, x, y, 4, { fill: P.steel, stroke: INK, width: 1.5, seed: sd(), double: false }); });
    const T = el("text", { x: BX - 38, y: BY + 17, "text-anchor": "middle", "font-family": '"Kalam", "Comic Sans MS", "Segoe Print", cursive', "font-weight": 700, "font-size": 46, fill: P.storm, textLength: 112, lengthAdjust: "spacingAndGlyphs", transform: `rotate(-2 ${BX} ${BY})` }, sGrp);
    T.textContent = "HWY 4";
    sk.path(sGrp, [[BX + 30, BY + 2], [BX + 86, BY - 1]], { stroke: P.storm, width: 7, seed: sd(), wobble: 0.8 });
    sk.path(sGrp, [[BX + 68, BY - 16], [BX + 88, BY - 1], [BX + 70, BY + 16]], { stroke: P.storm, width: 7, seed: sd(), wobble: 0.8 });
    [[BX - 78, BY + 22, 12], [BX - 30, BY + 22, 8], [BX + 56, BY + 6, 10]].forEach(([x, y, l]) => sk.line(sGrp, x, y, x + 1, y + l, { stroke: P.storm, width: 2.5, seed: sd(), wobble: 0.2, double: false, opacity: 0.8 }));
    sk.path(sGrp, [[SP[0] - 8, SP[1] - 300], [SP[0] - 18, SP[1] - 294], [SP[0] - 14, SP[1] - 284], [SP[0] - 24, SP[1] - 276]], { stroke: P.mist, width: 1.6, seed: sd(), double: false });

    // ------------------------------------------------------------------ DETAIL: post base + boot print in the soft shoulder
    const detailG = el("g", { class: "detail" }, g);
    const DX = SP[0] - 44, DY = SP[1] + 10;
    const damp = [[DX - 70, DY - 4], [DX - 30, DY - 16], [DX + 30, DY - 14], [DX + 64, DY - 2], [DX + 50, DY + 14], [DX - 20, DY + 18], [DX - 66, DY + 10]];
    sk.poly(detailG, damp, { fill: P.slate, stroke: P.storm, width: 1.6, seed: sd(), wobble: 1.2, double: false });
    sk.hatch(clipTo(detailG, damp), DX - 72, DY - 18, 140, 40, { gap: 4, angle: 172, stroke: P.storm, width: 1, opacity: 0.45, seed: sd() });
    // boot print: sole outline, heel, lug tread, a pushed-up mud lip
    const bp = el("g", { transform: `translate(${DX - 4} ${DY + 4}) rotate(-12) scale(1.3)` }, detailG);
    sk.path(bp, [[-6, -11], [8, -12], [15, -9], [16, -3], [10, 0], [3, 1], [-4, 2], [-12, 3], [-18, 2], [-21, -2], [-18, -6], [-13, -8]], { closed: true, fill: P.storm, stroke: INK, width: 1.3, seed: sd(), wobble: 0.3, double: false, step: 400 });
    for (let i = 0; i < 6; i++) sk.line(bp, 12 - i * 3.4, -9 + (i % 2), 12 - i * 3.4 - 1, -1 + (i % 2), { stroke: P.steel, width: 1, seed: sd(), wobble: 0.1, double: false });
    sk.line(bp, -11, -6, -11, 1.5, { stroke: P.steel, width: 1, seed: sd(), wobble: 0.1, double: false });
    sk.line(bp, -16, -5, -16, 1.5, { stroke: P.steel, width: 1, seed: sd(), wobble: 0.1, double: false });
    sk.path(bp, [[-6, -12.5], [8, -13.6], [16, -10.5]], { stroke: P.mist, width: 1, seed: sd(), wobble: 0.2, double: false, opacity: 0.8 });
    el("ellipse", { cx: DX + 34, cy: DY - 8, rx: 10, ry: 3.4, fill: P.storm, opacity: 0.85, transform: `rotate(-10 ${DX + 34} ${DY - 8})` }, detailG);
    // post foot: bolted rusty base plate in a cracked concrete plug, flaking paint, grass, pebbles
    sk.poly(detailG, [[SP[0] - 24, SP[1] + 8], [SP[0] - 19, SP[1] - 4], [SP[0] + 21, SP[1] - 5], [SP[0] + 26, SP[1] + 8]], { fill: P.mist, stroke: INK, width: 2, seed: sd(), wobble: 0.5 });
    sk.path(detailG, [[SP[0] - 14, SP[1] + 1], [SP[0] - 8, SP[1] + 4], [SP[0] - 4, SP[1] + 7]], { stroke: P.slate, width: 1, seed: sd(), wobble: 0.2, double: false });
    sk.poly(detailG, [[SP[0] - 15, SP[1] - 3], [SP[0] - 14, SP[1] - 9], [SP[0] + 15, SP[1] - 10], [SP[0] + 16, SP[1] - 4]], { fill: EP5.rust, stroke: INK, width: 1.5, seed: sd(), wobble: 0.3 });
    [-10, 11].forEach((dx) => { sk.circle(detailG, SP[0] + dx, SP[1] - 6.5, 2, { fill: P.steel, stroke: INK, width: 0.8, seed: sd(), double: false }); });
    for (let i = 0; i < 8; i++) el("circle", { cx: f1(SP[0] - 7 + rnd(i + 30) * 14), cy: f1(SP[1] - 14 - rnd(i + 40) * 34), r: f1(0.7 + rnd(i) * 0.9), fill: P.slate, opacity: 0.9 }, detailG);
    [[SP[0] + 30, SP[1] + 8, 1.2], [SP[0] + 46, SP[1] + 12, 0.9], [SP[0] + 18, SP[1] - 2, 0.8], [DX - 76, DY + 14, 0.8], [DX + 64, DY + 16, 0.7]].forEach(([x, y, s]) => tuft(detailG, x, y, s * 1.3, P.steel, sd()));
    [[DX - 14, DY + 14, 3], [DX + 2, DY + 17, 1.8], [DX - 44, DY + 6, 2.4], [SP[0] + 18, SP[1] + 14, 2.6], [SP[0] - 32, SP[1] + 18, 1.8], [DX + 28, DY + 8, 1.6], [DX + 46, DY - 6, 2.2]].forEach(([x, y, r]) => pebble(detailG, x, y, r, P.mist, sd()));
    // fir cone + dry twig + a dropped bottle cap
    const cx0 = SP[0] + 34, cy0 = SP[1] + 2;
    sk.poly(detailG, [[cx0, cy0], [cx0 + 4, cy0 - 5], [cx0 + 15, cy0 - 4], [cx0 + 17, cy0 + 1], [cx0 + 6, cy0 + 4]], { fill: P.slate, stroke: INK, width: 1, seed: sd(), wobble: 0.2, double: false });
    for (let i = 0; i < 4; i++) sk.line(detailG, cx0 + 3 + i * 3.2, cy0 - 4, cx0 + 4 + i * 3.2, cy0 + 3, { stroke: INK, width: 0.8, seed: sd(), wobble: 0.1, double: false });
    sk.path(detailG, [[DX - 84, DY + 22], [DX - 52, DY + 18], [DX - 40, DY + 20]], { stroke: P.storm, width: 1.8, seed: sd(), wobble: 0.3, double: false });
    sk.line(detailG, DX - 64, DY + 19, DX - 60, DY + 12, { stroke: P.storm, width: 1.2, seed: sd(), wobble: 0.2, double: false });
    sk.circle(detailG, DX + 22, DY + 16, 3, { fill: P.steel, stroke: INK, width: 1, seed: sd(), double: false });

    // ------------------------------------------------------------------ THE LOG (left foreground, at the junction)
    const logG = el("g", { class: "log" }, g);
    const LX0 = 300, LX1 = 650, LGY = 902, LR = 42;
    el("ellipse", { cx: 475, cy: LGY + 4, rx: 220, ry: 13, fill: INK, opacity: 0.4 }, logG);
    const ltop = [[LX0, LGY - 2 * LR + 6], [LX0 + 120, LGY - 2 * LR - 1], [LX0 + 240, LGY - 2 * LR - 3], [LX1, LGY - 2 * LR + 2]];
    const lbot = [[LX1 + 4, LGY - 3], [LX0 + 240, LGY + 2], [LX0 + 120, LGY + 2], [LX0, LGY - 2]];
    const logPts = ltop.concat(lbot);
    sk.poly(logG, logPts, { fill: P.slate, stroke: INK, width: LINE.main, seed: sd(), wobble: 1, step: 60 });
    const logIn = clipTo(logG, logPts);
    sk.rect(logIn, LX0 - 10, LGY - LR + 6, LX1 - LX0 + 30, LR + 10, { fill: P.storm, stroke: "none", wobble: 0, double: false, opacity: 0.7 }); // shaded underside
    // long bark furrows along the log + cross checks
    for (let i = 0; i < 7; i++) {
      const yy = LGY - 2 * LR + 10 + i * 11;
      const pts = [];
      for (let k = 0; k <= 8; k++) pts.push([LX0 + 10 + k * 44 + hash(i * 9 + k) * 10, yy + hash(i * 5 + k) * 3]);
      for (let s = 0; s < pts.length - 1; s += 2) sk.path(logIn, pts.slice(s, s + 2 + (i % 2)), { stroke: i < 2 ? P.steel : INK, width: 2, seed: sd(), wobble: 0.6, double: false, opacity: i < 2 ? 0.6 : 0.55 });
    }
    sk.path(logG, [[LX0 + 10, LGY - 2 * LR + 9], [LX0 + 200, LGY - 2 * LR + 3], [LX1 - 20, LGY - 2 * LR + 7]], { stroke: P.mist, width: 2.5, seed: sd(), wobble: 0.8, double: false, opacity: 0.6 }); // sky-lit top
    // moss saddles on top
    [[LX0 + 70, 46], [LX0 + 196, 36], [LX0 + 290, 30]].forEach(([x, w]) => sk.poly(logG, [[x - w / 2, LGY - 2 * LR + 6], [x - w / 3, LGY - 2 * LR - 3], [x + w / 3, LGY - 2 * LR - 4], [x + w / 2, LGY - 2 * LR + 5], [x, LGY - 2 * LR + 12]], { fill: P.steel, stroke: P.storm, width: 1.5, seed: sd(), wobble: 0.8, double: false }));
    // cut end (right) with growth rings and a check crack
    const ex = LX1 + 2, ey = LGY - LR + 1;
    el("ellipse", { cx: ex, cy: ey, rx: 19, ry: LR, fill: P.mist, stroke: INK, "stroke-width": 3.5 }, logG);
    [0.74, 0.5, 0.28, 0.1].forEach((k) => el("ellipse", { cx: ex - 1, cy: ey + 2, rx: f1(19 * k), ry: f1(LR * k), fill: "none", stroke: P.steel, "stroke-width": 1.5 }, logG));
    sk.line(logG, ex - 2, ey - LR * 0.85, ex + 1, ey + 4, { stroke: P.slate, width: 1.6, seed: sd(), wobble: 0.3, double: false });
    // broken stub branches
    sk.path(logG, [[LX0 + 150, LGY - 2 * LR], [LX0 + 140, LGY - 2 * LR - 34], [LX0 + 126, LGY - 2 * LR - 48]], { stroke: INK, width: 7, seed: sd(), wobble: 0.6 });
    sk.path(logG, [[LX0 + 310, LGY - 2 * LR + 2], [LX0 + 326, LGY - 2 * LR - 24]], { stroke: INK, width: 6, seed: sd(), wobble: 0.6 });
    // root wad on the left end: a dark disc of tangled roots with dirt clods
    const rwx = LX0 - 6, rwy = LGY - 46;
    const wad = [];
    for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; wad.push([rwx + Math.cos(a) * (26 + rnd(i + 3) * 12), rwy + Math.sin(a) * (54 + rnd(i + 9) * 14)]); }
    sk.poly(logG, wad, { fill: P.night, stroke: INK, width: 3, seed: sd(), wobble: 1.5 });
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + 0.3, r0 = 8, r1 = 40 + rnd(i) * 30;
      sk.path(logG, [[rwx + Math.cos(a) * r0, rwy + Math.sin(a) * r0 * 1.8], [rwx + Math.cos(a + 0.2) * r1 * 0.6, rwy + Math.sin(a + 0.2) * r1 * 1.3], [rwx + Math.cos(a + 0.1) * r1, rwy + Math.sin(a + 0.1) * r1 * 1.6]], { stroke: P.storm, width: 2.5, seed: sd(), wobble: 0.8, double: false });
    }
    [[rwx - 6, rwy - 20, 7], [rwx + 8, rwy + 18, 6], [rwx - 12, rwy + 30, 5]].forEach(([x, y, r]) => pebble(logG, x, y, r, P.slate, sd()));
    // bracket fungus + grass tufts
    [[LX0 + 214, LGY - LR + 6], [LX0 + 238, LGY - LR + 16]].forEach(([x, y]) => sk.poly(logG, [[x - 13, y], [x - 6, y - 7], [x + 8, y - 7], [x + 14, y]], { fill: P.fog, stroke: INK, width: 1.6, seed: sd(), wobble: 0.3 }));
    for (let i = 0; i < 5; i++) tuft(logG, LX0 + 40 + i * 64, LGY - 2 * LR + 5 + hash(i) * 3, 0.9, P.steel, sd());
    fernClump(logG, LX1 + 46, LGY + 6, 1.3, P.slate, sd(), 2.2);

    // ------------------------------------------------------------------ NEAR FRAMING (huge trunks + boughs at the edges)
    const nearG = el("g", { class: "near" }, g);
    const bigTrunk = (x, w, lean, seed) => {
      const pts = [[x - w / 2 - 18, 1090], [x - w / 2 + lean * 0.2, 700], [x - w / 2 + lean, -20], [x + w / 2 + lean, -20], [x + w / 2 + lean * 0.2, 700], [x + w / 2 + 22, 1090]];
      sk.poly(nearG, pts, { fill: INK, stroke: INK, width: LINE.main, seed, wobble: 1.6 });
      const inG = clipTo(nearG, pts);
      for (let i = 0; i < 9; i++) {
        const xx = x - w / 2 + 10 + (i * (w - 20)) / 8;
        const p = [];
        for (let k = 0; k <= 12; k++) p.push([xx + lean * (1 - k / 12) + hash(seed + i * 13 + k) * 5, -20 + k * 92]);
        sk.path(inG, p, { stroke: P.storm, width: 2, seed: seed + i * 3, wobble: 1.2, double: false, opacity: 0.7 });
      }
      const side = x < 960 ? 1 : -1;
      sk.path(nearG, [[x + side * (w / 2 + 22) - side * 4, 1090], [x + side * w / 2 + lean * 0.2 - side * 3, 700], [x + side * w / 2 + lean - side * 3, -20]], { stroke: P.slate, width: 3, seed: seed + 50, wobble: 1.2, double: false, opacity: 0.8 });
    };
    bigTrunk(30, 150, -14, sd());
    bigTrunk(1880, 170, 18, sd());
    const bough = (x0, y0, len, dir, seed) => {
      const pts = [];
      for (let i = 0; i <= 9; i++) { const t = i / 9; pts.push([x0 + dir * len * t, y0 + Math.sin(t * Math.PI * 0.8) * len * 0.2 + t * len * 0.07]); }
      sk.path(nearG, pts, { stroke: INK, width: 6, seed, wobble: 1 });
      for (let i = 1; i < pts.length; i++) {
        const [px, py] = pts[i], l = 54 * (1 - i / 11);
        for (let k = -2; k <= 2; k++) sk.line(nearG, px, py, px + dir * (8 + k * 5), py + l * (0.6 + k * 0.12), { stroke: INK, width: 3.5, seed: seed + i * 5 + k, wobble: 0.6, double: false });
      }
    };
    bough(60, 30, 400, 1, sd()); bough(60, 120, 250, 1, sd()); bough(90, -10, 520, 1, sd());
    bough(1830, 50, 360, -1, sd()); bough(1830, 160, 220, -1, sd()); bough(1830, -6, 480, -1, sd());
    fernClump(nearG, 150, 1062, 2.6, INK, sd(), 3);
    fernClump(nearG, 1760, 1062, 2.8, INK, sd(), 3);
    fernClump(nearG, 1600, 1000, 1.8, P.night, sd(), 2.6);
    // ------------------------------------------------------------------ LATE grade
    if (LIGHT === "late") {
      sk.rect(g, -20, -20, 1960, 1120, { fill: P.night, stroke: "none", wobble: 0, double: false, opacity: 0.38 });
    }

    const v = roadPath(1);
    return {
      g,
      groundY: GY,
      roadPath,
      road: { g: roadG, vanish: { x: v.x, y: v.y } },
      log: { g: logG, x: 475, y: LGY, seatY: LGY - 2 * LR, x0: 320, x1: 640 },
      sign: { g: signG, x: Math.round(BX + Math.sin((lean * Math.PI) / 180) * (SP[1] - BY)), y: BY, postX: SP[0], postY: SP[1] },
      sideTrack: { x: 120, y: 905 },
      skyG,
      lightG,
      shadowDir: { dx: -0.2, dy: 0.98 },
      detail: { g: detailG, x: DX, y: DY },
      hills: { g: hillsG },
      trees: { g: treesG },
      nearG,
    };
  };
})();
