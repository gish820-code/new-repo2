/* Rainy Day background — `nightWoods` v1. Episode 5, NIGHT, STARS.
 * Dark Douglas-fir woods at the camp's edge. Black trunks in three depth layers (near trunks huge, ink with faint
 * P.storm bark hatching; mid trunks night/ink; far trunks P.storm/P.slate, thin, fading into the dark), a sword-fern
 * floor, a nurse log, an old stump and a narrow deer trail winding from the foreground back into the trees. Above, a
 * GAP in the canopy opens onto a clear sky full of stars (nightSky, star dots of 3 sizes, a faint Milky Way band in
 * P.storm), framed by flat black fir sprays and far spires. VERY dark and low-contrast ON PURPOSE: no moon, no glow on
 * the ground — flashlight beams (added by scenes) carve the shapes out.
 *
 * Two ways a beam can light it:
 *   1. plain: the scene draws its usual paper→fog cone over the background. Shapes inside the cone read as the
 *      ferns, bark hatching and trunk edges show through the wash (they are drawn a step lighter than the dark).
 *   2. lit layer (recommended for hero beams): the module also builds a complete FLASHLIGHT-LIT copy of the woods
 *      (`lit.g`: trunk faces, bark, ferns, floor, detail in lit greys, far things dimmer than near ones), hidden
 *      until clipped to the beam: call `bg.lit.clipTo(d)` with the same path `d` as the cone (several cones = one d
 *      with several subpaths, "" = none) from the beam's onUpdate, then draw the cone on top as usual. Inside the
 *      beam the trunks pop as lit columns against the darker woods behind them.
 *
 * Paste VERBATIM after assets/characters/rainy-day-rig-v3.js (uses only palette, LINE, el, sk, hash).
 * Deterministic, static; scenes own all motion.
 *
 *   const bg = window.RainyDayBG.nightWoods(layerG, {});
 *   RD.figure(layer, { x: 800, y: bg.groundY - 116 * 1.4, scale: 1.4 });
 *   bg.lit.clipTo(coneD);                    // reveal the lit woods inside the beam
 *
 * OPTS (all optional):
 *   light: "night"   the only light (kept for the Episode 5 contract).
 *   stars: 1         star brightness 0..1 (opacity of starG).
 *
 * Episode 5 light kit EP5 is defined inside the module (only nightSky + star are used, plus the rig palette).
 *
 * HANDLES returned (screen px in the 1920x1080 viewBox):
 *   g              root <g>.
 *   groundY = 860  forest floor where feet stand in the foreground (flat for x 300–1500; it rises gently toward the
 *                  back: mid trunks stand at y ≈ 670–700, far trunks at y ≈ 606).
 *   trunks         [ { x, w, depth, top, base, g, litG } ] every trunk, sorted near → far. x = center at the base,
 *                  w = width, depth 0 (nearest, huge ink) … 1 (farthest, thin storm-gray), top/base = visible y range,
 *                  g = its dark <g>, litG = its lit twin inside lit.g. Use them to aim beams / place beam pools.
 *   beamZone       { x0: 220, x1: 1720, y0: 300, y1: 940 }  where beams read well (trunks + floor, no sky).
 *   gap            { x: 640, y: 0, w: 720, h: 390, cx: 1000, cy: 195 }  the star gap (bounding box, top-left x/y).
 *   farPoint       { x: 1192, y: 606 }  deep in the trees where the deer trail disappears: the whistle comes from here.
 *   trail          { points: [[x, y], ...] }  the deer-trail centerline, foreground (880, 1100) → farPoint.
 *   lit            { g, clipTo(d) }  the flashlight-lit copy (see above). clipTo("") hides it again.
 *   skyG           sky inside the gap (nightSky, Milky Way, airglow, stars).
 *   starG          the star dots (scenes may twinkle / fade it).
 *   lightG         starlight overlays: faint rims on the top edges of the sprays around the gap and on the gap side
 *                  of a few mid trunks. Already faint at 1; fade to 0 for a pitch-black beat.
 *   shadowDir      { dx: 0, dy: 1 }  starlight from straight above — no readable cast shadows. Flashlight shadows are
 *                  the scene's job: cast them away from the beam origin.
 *   detail         { g, litG, x: 1456, y: 884 }  close-up spot: the foot of the near-right trunk (root flare, bark
 *                  plates, moss cushions, three small mushrooms, a fir cone, beetle holes) with a sword-fern clump
 *                  and one big frond arching across the bark. Built to read at scale ~3 when a beam (or the lit
 *                  layer) hits it.
 *   farG / midG / nearG   the dark layers (parallax).
 */
(function () {
  window.RainyDayBG = window.RainyDayBG || {};
  if (window.RainyDayBG.nightWoods) return;
  let instance = 0;

  window.RainyDayBG.nightWoods = function (parent, opts) {
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
    const STARK = Math.max(0, Math.min(1, opts.stars !== undefined ? +opts.stars : 1));
    const id = "rdnw" + (instance++) + "_";
    const f1 = (v) => (+v).toFixed(1);
    let SEED = 9300;
    const sd = () => (SEED += 7);
    const rnd = (i) => (hash(i * 2.137 + 41.9) + 1) / 2;

    const g = el("g", { class: "rd-bg rd-bg-night-woods" }, parent);
    const defs = el("defs", {}, g);
    let gradN = 0;
    function grad(stops, x2, y2) {
      const gid = id + "gr" + (gradN++);
      const lg = el("linearGradient", { id: gid, x1: 0, y1: 0, x2: x2 || 0, y2: y2 === undefined ? 1 : y2 }, defs);
      stops.forEach(([o, c, a]) => el("stop", { offset: o, "stop-color": c, "stop-opacity": a === undefined ? 1 : a }, lg));
      return "url(#" + gid + ")";
    }
    let clipN = 0;
    function clipTo(par, pts) {
      const cid = id + "clip" + (clipN++);
      const cp = el("clipPath", { id: cid }, defs);
      el("path", { d: "M" + pts.map((q) => f1(q[0]) + " " + f1(q[1])).join(" L") + " Z" }, cp);
      return el("g", { "clip-path": "url(#" + cid + ")" }, par);
    }
    const toD = (pts) => "M" + pts.map((q) => f1(q[0]) + " " + f1(q[1])).join(" L") + " Z";

    // ------------------------------------------------------------------ kits
    // sword fern frond: wobbly spine (sk.path) + all pinnae in one hand-jittered path (keeps the element count sane)
    function fern(par, x, y, len, ang, seed, col, wd, op) {
      const a = (ang * Math.PI) / 180, sgn = Math.sign(ang || 1), pts = [];
      for (let i = 0; i <= 9; i++) { const t = i / 9, bend = t * t; pts.push([x + Math.sin(a + bend * sgn) * len * t, y - Math.cos(a + bend * sgn) * len * t]); }
      sk.path(par, pts, { stroke: col, width: (wd || LINE.detail) + 1, seed, wobble: 0.6, double: false, opacity: op !== undefined ? op : 1 });
      let d = "";
      for (let i = 1; i < 9; i++) {
        const p = pts[i], q = pts[i + 1], dx = q[0] - p[0], dy = q[1] - p[1], dd = Math.hypot(dx, dy) || 1;
        const l = len * 0.2 * (1 - i / 10), nx = -dy / dd, ny = dx / dd, j = hash(seed + i) * 1.2;
        d += `M${f1(p[0])} ${f1(p[1])} L${f1(p[0] + nx * l + dx * 0.5 + j)} ${f1(p[1] + ny * l + dy * 0.5 - j)} `;
        d += `M${f1(p[0])} ${f1(p[1])} L${f1(p[0] - nx * l + dx * 0.5 - j)} ${f1(p[1] - ny * l + dy * 0.5 + j)} `;
      }
      el("path", { d, fill: "none", stroke: col, "stroke-width": wd || LINE.detail, "stroke-linecap": "round", opacity: op !== undefined ? op : 1 }, par);
    }
    function fernClump(par, x, y, s, col, seed, wd, op, n) {
      n = n || 7;
      for (let k = 0; k < n; k++) fern(par, x + (k - (n - 1) / 2) * 4 * s, y, (46 + rnd(seed + k) * 34) * s, -78 + (k * 156) / (n - 1) + hash(seed + k) * 8, seed + k * 31, col, wd, op);
    }

    // ------------------------------------------------------------------ SKY inside the gap (dark pass only)
    const GAP = { x: 640, y: 0, w: 720, h: 390 };
    sk.rect(g, -20, -20, 1960, 1120, { fill: P.night, stroke: "none", wobble: 0, double: false });
    const skyG = el("g", { class: "sky" }, g);
    sk.rect(skyG, 560, -20, 900, 520, { fill: EP5.nightSky, stroke: "none", wobble: 0, double: false });
    const mw = [[600, 420], [760, 300], [940, 170], [1120, 60], [1260, -30], [1420, -30], [1300, 80], [1130, 210], [950, 330], [800, 440]];
    sk.poly(skyG, mw, { fill: P.storm, stroke: "none", seed: sd(), wobble: 6, double: false, opacity: 0.45 });
    sk.poly(skyG, [[690, 430], [830, 320], [990, 200], [1160, 80], [1290, -20], [1330, -20], [1200, 100], [1040, 220], [880, 330], [740, 440]], { fill: P.storm, stroke: "none", seed: sd(), wobble: 5, double: false, opacity: 0.4 });
    const lane = [[700, 410], [850, 300], [1000, 196], [1150, 92], [1280, 6]];
    for (let k = 0; k < 3; k++) sk.path(skyG, lane.map(([x, y], i) => [x + k * 9 + hash(i + k) * 6, y + k * 4]), { stroke: EP5.nightSky, width: 5, seed: sd(), wobble: 4, double: false, opacity: 0.55 });
    // faint airglow low in the gap — the sky is a hair paler than the black sprays and spires
    sk.rect(skyG, 560, 120, 900, 380, { fill: grad([[0, P.storm, 0], [0.7, P.storm, 0.6], [1, P.storm, 0.8]]), stroke: "none", wobble: 0, double: false });
    const starG = el("g", { class: "stars", opacity: f1(STARK) }, skyG);
    for (let i = 0; i < 230; i++) {
      const x = 600 + rnd(i * 3 + 1) * 820, y = -10 + rnd(i * 3 + 2) * 440, sz = rnd(i * 5 + 7);
      el("circle", { cx: f1(x), cy: f1(y), r: f1(sz > 0.93 ? 2.6 : sz > 0.7 ? 1.6 : 0.9), fill: EP5.star, opacity: f1(0.35 + rnd(i + 70) * 0.6) }, starG);
    }
    for (let i = 0; i < 160; i++) {
      const t = rnd(i * 7 + 3), off = hash(i * 11 + 5) * 70;
      el("circle", { cx: f1(640 + t * 680 + off * 0.6), cy: f1(430 - t * 470 + off * 0.8), r: 0.8, fill: EP5.star, opacity: f1(0.3 + rnd(i + 300) * 0.4) }, starG);
    }
    [[760, 120], [1010, 60], [1185, 250], [880, 262], [1290, 160], [720, 300]].forEach(([x, y]) => {
      el("circle", { cx: x, cy: y, r: 2.8, fill: EP5.star }, starG);
      sk.line(starG, x - 8, y, x + 8, y, { stroke: EP5.star, width: 1, seed: sd(), wobble: 0, double: false, opacity: 0.55 });
      sk.line(starG, x, y - 8, x, y + 8, { stroke: EP5.star, width: 1, seed: sd(), wobble: 0, double: false, opacity: 0.55 });
    });

    // ================================================================== THE WOODS — drawn twice: dark + flashlight-lit
    const litWrap = el("g", { class: "lit-wrap" }, null);
    const litClipId = id + "beam";
    const litClip = el("clipPath", { id: litClipId, clipPathUnits: "userSpaceOnUse" }, defs);
    const litClipPath = el("path", { d: "M0 0 Z" }, litClip);
    const litG = el("g", { class: "lit", "clip-path": `url(#${litClipId})` }, null);

    const trunks = [];
    const out = {};
    function woods(root, LIT) {
      SEED = 20000; // same seeds on both passes → identical hand-drawn outlines
      // palette for this pass
      const C = LIT ? {
        back: P.storm, spire: P.night, farTrunk: P.slate, farTrunk2: P.steel, farStroke: P.storm, veil: P.storm, veilA: 0.45, farFern: P.slate,
        canopy: P.night, canopyNeedle: P.storm, floorA: P.slate, floorB: P.storm, duff: P.steel, trail: P.steel, hoof: P.storm,
        log: P.slate, logLine: INK, moss: P.steel, stump: P.slate, stumpTop: P.steel, branch: P.storm,
        midTrunk: P.slate, midHatch: INK, midStroke: INK, midFern: P.mist,
        nearTrunk: P.steel, nearHatch: INK, nearStroke: INK, nearFern: P.mist, nearFern2: P.steel, blaze: P.fog, web: P.paper,
        dMoss: P.mist, dMossLine: P.steel, dPlate: INK, dMush: P.fog, dMushStem: P.mist, dCone: P.slate, dFern: P.mist, dFern2: P.steel, dHole: INK,
      } : {
        back: P.night, spire: INK, farTrunk: P.storm, farTrunk2: P.slate, farStroke: P.night, veil: P.night, veilA: 0.5, farFern: P.storm,
        canopy: INK, canopyNeedle: INK, floorA: P.night, floorB: INK, duff: P.storm, trail: P.storm, hoof: P.night,
        log: P.night, logLine: P.storm, moss: P.slate, stump: P.night, stumpTop: P.storm, branch: INK,
        midTrunk: P.night, midHatch: P.storm, midStroke: INK, midFern: P.storm,
        nearTrunk: INK, nearHatch: P.storm, nearStroke: INK, nearFern: INK, nearFern2: P.night, blaze: P.night, web: P.slate,
        dMoss: P.storm, dMossLine: P.slate, dPlate: P.storm, dMush: P.slate, dMushStem: P.storm, dCone: P.storm, dFern: P.storm, dFern2: P.storm, dHole: P.night,
      };
      // trunk: x = center at base; o: fill, stroke, hatch, roots, lean
      function trunk(par, x, base, top, w, depth, o) {
        const tg = el("g", { class: "rd-trunk" }, par);
        const seed = sd(), lean = o.lean || 0, flare = o.roots ? w * 0.45 : w * 0.12;
        const pts = [[x - w / 2 - flare, base + 4], [x - w / 2 - flare * 0.25, base - w * 0.5], [x - w / 2 + lean * 0.5, (base + top) / 2], [x - w * 0.42 + lean, top - 20],
          [x + w * 0.42 + lean, top - 20], [x + w / 2 + lean * 0.5, (base + top) / 2], [x + w / 2 + flare * 0.25, base - w * 0.5], [x + w / 2 + flare, base + 4]];
        sk.poly(tg, pts, { fill: o.fill, stroke: o.stroke || INK, width: o.width || LINE.main, seed, wobble: o.wobble || 1.2, step: 40, double: o.double });
        if (o.hatch) {
          const ig = clipTo(tg, pts);
          if (LIT && o.shade) // lit trunk: the side away from the beam falls off into shade
            sk.poly(ig, [[x + w * 0.12 + lean, top - 30], [x + w + lean, top - 30], [x + w + flare, base + 10], [x + w * 0.12, base + 10]], { fill: INK, stroke: "none", seed: seed + 3, wobble: 2, double: false, opacity: 0.45 });
          const n = Math.max(3, Math.round(w / 16));
          let d = "";
          for (let i = 0; i < n; i++) {
            const xx = x - w / 2 + ((i + 0.5) * w) / n;
            for (let k = 0; k <= 14; k++) { const t = k / 14; d += (k ? "L" : "M") + f1(xx + lean * (1 - t) + hash(seed + i * 13 + k) * Math.min(6, w * 0.05)) + " " + f1(top + (base - top) * t) + " "; }
          }
          el("path", { d, fill: "none", stroke: o.hatch, "stroke-width": o.hatchW || 2, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: o.hatchOp || 0.6 }, ig);
          // bark plate breaks (short diagonal ticks)
          let d2 = "";
          for (let i = 0; i < Math.round((base - top) / 50); i++) {
            const yy = top + 30 + i * 50 + hash(seed + i) * 18, xx = x - w * 0.36 + rnd(seed + i) * w * 0.55 + lean * (1 - (yy - top) / (base - top));
            d2 += `M${f1(xx)} ${f1(yy)} L${f1(xx + w * 0.18)} ${f1(yy + 5)} `;
          }
          el("path", { d: d2, fill: "none", stroke: o.hatch, "stroke-width": o.hatchW || 2, "stroke-linecap": "round", opacity: (o.hatchOp || 0.6) * 0.8 }, ig);
        }
        if (o.roots) for (let k = -1; k <= 1; k += 2) {
          // root buttress flaring out into the duff, plus a smaller second root
          sk.poly(tg, [[x + k * w * 0.3, base - w * 0.28], [x + k * (w * 0.5 + flare * 0.5), base - w * 0.08], [x + k * (w * 0.62 + flare * 1.05), base + 7], [x + k * (w * 0.5 + flare * 0.7), base + 12], [x + k * w * 0.3, base + 10]], { fill: o.fill, stroke: o.stroke || INK, width: Math.max(2, (o.width || 4) * 0.7), seed: seed + 600 + k, wobble: 0.8, double: false });
          sk.poly(tg, [[x - k * w * 0.05, base - w * 0.1], [x + k * w * 0.2, base + 6], [x + k * w * 0.05, base + 18], [x - k * w * 0.2, base + 12]], { fill: o.fill, stroke: o.stroke || INK, width: Math.max(2, (o.width || 4) * 0.6), seed: seed + 620 + k, wobble: 0.6, double: false });
          if (o.hatch) sk.path(tg, [[x + k * w * 0.32, base - w * 0.2], [x + k * (w * 0.48 + flare * 0.6), base - 2], [x + k * (w * 0.58 + flare * 0.95), base + 7]], { stroke: o.hatch, width: 1.6, seed: seed + 640 + k, wobble: 0.6, double: false, opacity: o.hatchOp || 0.6 });
        }
        if (LIT) { const t = trunks[trunkI++]; if (t) t.litG = tg; }
        else trunks.push({ x: Math.round(x), w: Math.round(w), depth: Math.round(depth * 100) / 100, top: Math.round(top), base: Math.round(base), g: tg });
        return tg;
      }
      let trunkI = 0;

      // ---------------------------------------------------------------- FAR: spires in the gap, far trunks, far floor
      const farG = el("g", { class: "far" }, root);
      if (LIT) sk.rect(farG, -20, 380, 1960, 720, { fill: C.back, stroke: "none", wobble: 0, double: false });
      const spireBase = 470;
      for (let i = 0; i < 22; i++) {
        const x = 600 + i * 40 + hash(i + 3) * 14, h = 90 + rnd(i + 9) * 130, top = spireBase - 70 - h, pts = [[x, top]], tiers = 6;
        for (let k = 1; k <= tiers; k++) { const t = k / tiers, yy = top + (h + 60) * t, ww = 6 + 26 * t; pts.push([x + ww * 0.5, yy - 8], [x + ww, yy]); }
        pts.push([x + 30, spireBase + 40], [x - 30, spireBase + 40]);
        for (let k = tiers; k >= 1; k--) { const t = k / tiers, yy = top + (h + 60) * t, ww = 6 + 26 * t; pts.push([x - ww, yy], [x - ww * 0.5, yy - 8]); }
        sk.poly(farG, pts, { fill: C.spire, stroke: C.spire, width: 1.5, seed: sd(), wobble: 0.8, double: false, step: 400 });
      }
      sk.rect(farG, 560, spireBase - 20, 900, 200, { fill: C.spire, stroke: "none", wobble: 0, double: false });
      sk.poly(farG, [[-20, 600], [400, 606], [800, 612], [1200, 604], [1600, 598], [1940, 604], [1940, 1100], [-20, 1100]], { fill: C.back, stroke: "none", seed: sd(), wobble: 0, double: false });
      for (let i = 0; i < 30; i++) {
        const x = -10 + i * 66 + hash(i + 21) * 22, w = 12 + rnd(i + 31) * 16, base = 606 + hash(i + 33) * 6;
        trunk(farG, x, base, x > 600 && x < 1400 ? 400 : -20, w, 0.9 + rnd(i) * 0.1, { fill: i % 3 ? C.farTrunk : C.farTrunk2, stroke: C.farStroke, width: 1.5, double: false, wobble: 0.6 });
      }
      sk.rect(farG, -20, 380, 1960, 380, { fill: grad([[0, C.veil, C.veilA], [0.6, C.veil, C.veilA * 0.7], [1, C.veil, C.veilA * 0.3]]), stroke: "none", wobble: 0, double: false });
      for (let i = 0; i < 26; i++) fernClump(farG, -10 + i * 76 + hash(i) * 20, 612 + hash(i + 4) * 6, 0.55, C.farFern, sd(), 1.2, 0.7, 5);

      // ---------------------------------------------------------------- CANOPY (black fir sprays framing the gap)
      const canopyG = el("g", { class: "canopy" }, root);
      const gapEdge = [[560, -30], [596, 40], [618, 120], [656, 190], [640, 262], [690, 330], [740, 376], [820, 362], [900, 390], [980, 366], [1060, 384], [1140, 352], [1220, 378], [1290, 332], [1330, 262], [1312, 190], [1352, 120], [1340, 50], [1380, -30]];
      const lowEdge = [];
      for (let x = -30; x <= 1950; x += 60) lowEdge.push([x, 380 + Math.min(1, Math.abs(x - 1000) / 900) * 120 + hash(x * 0.13) * 30]);
      el("path", { d: toD([[-30, -30], [1950, -30]].concat(lowEdge.slice().reverse())) + " " + toD(gapEdge), fill: C.canopy, "fill-rule": "evenodd" }, canopyG);
      // needle fringe along the gap rim and the lower edge (one path each)
      const fringe = (pts, len, seed) => {
        let d = "";
        for (let i = 0; i < pts.length - 1; i++) {
          const a = pts[i], b = pts[i + 1];
          for (let k = 0; k < 5; k++) {
            const t = k / 5, x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t, cx = x < 1000 ? 1 : -1, dy = 0.6 + rnd(seed + i * 5 + k) * 0.6;
            for (let n = -2; n <= 2; n++) d += `M${f1(x)} ${f1(y)} L${f1(x + cx * (n * 4 + 6))} ${f1(y + len * dy * (0.7 + n * 0.08))} `;
          }
        }
        el("path", { d, fill: "none", stroke: C.canopyNeedle, "stroke-width": 2.6, "stroke-linecap": "round" }, canopyG);
      };
      fringe(gapEdge.slice(1, -1), 24, 100);
      fringe(lowEdge, 40, 300);
      // flat sprays reaching into the gap: a curved spine with a solid, toothed needle mass under it
      const spray = (x0, y0, len, dir, droop, thick) => {
        const spine = [];
        for (let i = 0; i <= 12; i++) { const t = i / 12; spine.push([x0 + dir * len * t, y0 + Math.sin(t * Math.PI * 0.75) * len * droop + t * len * 0.05]); }
        const upper = [], lower = [];
        spine.forEach(([x, y], i) => {
          const t = i / 12, th = thick * (1 - t * 0.75);
          upper.push([x, y - th * 0.35 - (i % 2) * 3]);
          lower.push([x + dir * 4, y + th * (0.8 + (i % 2) * 0.35)]);
        });
        sk.poly(canopyG, upper.concat(lower.reverse()), { fill: C.canopy, stroke: C.canopy, width: 2, seed: sd(), wobble: 1.5, double: false });
        let d = "";
        spine.forEach(([x, y], i) => { if (i % 1 === 0 && i > 0) { const th = thick * (1 - (i / 12) * 0.75); for (let n = -1; n <= 1; n++) d += `M${f1(x)} ${f1(y + th * 0.6)} L${f1(x + dir * (5 + n * 5))} ${f1(y + th * (1.3 + n * 0.15))} `; } });
        el("path", { d, fill: "none", stroke: C.canopy, "stroke-width": 2.6, "stroke-linecap": "round" }, canopyG);
        return spine;
      };
      out.sprays = [spray(600, 150, 320, 1, 0.16, 30), spray(1340, 90, 270, -1, 0.2, 28), spray(640, 300, 220, 1, 0.12, 24), spray(1320, 262, 240, -1, 0.14, 26), spray(980, -30, 180, 1, 0.5, 20)];
      // old man's beard lichen hanging from the sprays
      if (!LIT) {
        const sp = out.sprays;
        [[sp[0][7], 60], [sp[0][9], 40], [sp[1][6], 70], [sp[3][8], 50], [sp[2][6], 36]].forEach(([p, l], i) => {
          let d = "";
          for (let k = 0; k < 4; k++) d += `M${f1(p[0] + k * 3)} ${f1(p[1] + 10)} Q${f1(p[0] + k * 3 + hash(i + k) * 5)} ${f1(p[1] + l * 0.5)} ${f1(p[0] + k * 2 + hash(i + k + 3) * 6)} ${f1(p[1] + l * (0.8 + rnd(i + k) * 0.3))} `;
          el("path", { d, fill: "none", stroke: P.slate, "stroke-width": 1.2, opacity: 0.45 }, canopyG);
        });
      }
      out.gapEdge = gapEdge;

      // ---------------------------------------------------------------- FLOOR: duff, deer trail, nurse log, stump
      const floorG = el("g", { class: "floor" }, root);
      sk.poly(floorG, [[-20, 640], [500, 650], [1000, 656], [1500, 644], [1940, 650], [1940, 1100], [-20, 1100]], { fill: grad([[0, C.floorA], [1, C.floorB]]), stroke: "none", seed: sd(), wobble: 0, double: false });
      let duff = "";
      for (let i = 0; i < 170; i++) {
        const y = 660 + Math.pow(rnd(i * 3 + 1), 1.4) * 420, x = -10 + rnd(i * 3 + 2) * 1940, l = 10 + (y - 640) * 0.06;
        duff += `M${f1(x)} ${f1(y)} L${f1(x + l)} ${f1(y + hash(i) * 3)} `;
      }
      el("path", { d: duff, fill: "none", stroke: C.duff, "stroke-width": 1.6, "stroke-linecap": "round", opacity: 0.55 }, floorG);
      const FAR = [1192, 606];
      const trailC = [[880, 1100], [930, 1000], [1010, 920], [1060, 850], [1040, 790], [1090, 730], [1150, 680], [1170, 640], FAR];
      const trailW = (i) => 70 * Math.pow(1 - i / (trailC.length - 1), 1.3) + 3;
      const tl = [], tr = [];
      trailC.forEach(([x, y], i) => { tl.push([x - trailW(i), y]); tr.push([x + trailW(i), y]); });
      sk.poly(floorG, tl.concat(tr.reverse()), { fill: C.trail, stroke: "none", seed: sd(), wobble: 1.5, double: false, opacity: 0.75 });
      let hoof = "";
      for (let i = 1; i < trailC.length - 1; i++) {
        const [x, y] = trailC[i], s = 1 - i / trailC.length;
        [[-0.3, 0], [0.25, 18 * s]].forEach(([dx, dy]) => {
          const px = x + dx * trailW(i), py = y + dy;
          hoof += `M${f1(px - 4 * s)} ${f1(py)} L${f1(px - 2 * s)} ${f1(py - 7 * s)} M${f1(px + 4 * s)} ${f1(py)} L${f1(px + 2 * s)} ${f1(py - 7 * s)} `;
        });
      }
      el("path", { d: hoof, fill: "none", stroke: C.hoof, "stroke-width": 2.4, "stroke-linecap": "round" }, floorG);
      sk.path(floorG, [[960, 958], [1040, 944], [1120, 952]], { stroke: C.branch, width: 6, seed: sd(), wobble: 1 });
      sk.line(floorG, 1010, 948, 1024, 930, { stroke: C.branch, width: 3, seed: sd(), wobble: 0.5, double: false });
      // nurse log (mid-left) with seedlings
      const NL = [[300, 760], [520, 744], [740, 736], [760, 770], [530, 782], [306, 796]];
      sk.poly(floorG, NL, { fill: C.log, stroke: INK, width: 3, seed: sd(), wobble: 1.2 });
      let nl = "";
      for (let i = 0; i < 5; i++) nl += `M300 ${768 + i * 6} Q520 ${752 + i * 6} 760 ${744 + i * 6} `;
      el("path", { d: nl, fill: "none", stroke: C.logLine, "stroke-width": 1.6, opacity: 0.8 }, clipTo(floorG, NL));
      sk.path(floorG, [[312, 760], [430, 750], [560, 742], [700, 736]], { stroke: C.moss, width: 4, seed: sd(), wobble: 1.6, double: false, opacity: 0.5 });
      el("ellipse", { cx: 754, cy: 753, rx: 9, ry: 18, fill: C.stumpTop, stroke: INK, "stroke-width": 2 }, floorG);
      [[420, 750, 34], [600, 740, 46], [660, 738, 26]].forEach(([x, y, h]) => {
        sk.line(floorG, x, y, x, y - h, { stroke: C.logLine, width: 2, seed: sd(), wobble: 0.3, double: false });
        sk.poly(floorG, [[x, y - h - 6], [x - h * 0.22, y - h * 0.3], [x + h * 0.22, y - h * 0.3]], { fill: C.log, stroke: C.logLine, width: 1.4, seed: sd(), wobble: 0.4, double: false });
      });
      // big old stump right of the trail
      const ST = [[1250, 742], [1258, 668], [1290, 656], [1330, 662], [1346, 674], [1352, 742]];
      sk.poly(floorG, ST, { fill: C.stump, stroke: INK, width: 3, seed: sd(), wobble: 1.2 });
      sk.hatch(clipTo(floorG, ST), 1248, 650, 110, 96, { gap: 8, angle: 92, stroke: LIT ? INK : P.storm, width: 1.6, opacity: 0.6, seed: sd() });
      el("ellipse", { cx: 1302, cy: 662, rx: 44, ry: 8, fill: C.stumpTop, stroke: INK, "stroke-width": 2 }, floorG);

      // ---------------------------------------------------------------- MID trunks + fern beds
      const midG = el("g", { class: "mid" }, root);
      const mids = [[880, 676, 36], [1100, 670, 34], [400, 684, 38], [70, 690, 54], [520, 690, 44], [1240, 680, 46], [1385, 694, 64], [1790, 690, 48], [260, 700, 62], [690, 700, 58], [1640, 700, 56]];
      mids.forEach(([x, base, w], i) => {
        const inGap = x > 640 && x < 1360;
        trunk(midG, x, base, inGap ? 420 + rnd(i) * 30 : -30, w, Math.round((0.75 - (base - 670) / 150 - (w - 34) / 300) * 100) / 100, { fill: C.midTrunk, stroke: C.midStroke, width: 3, hatch: C.midHatch, hatchW: 1.6, hatchOp: 0.55, lean: hash(i + 5) * 10, shade: true });
        fernClump(midG, x - w * 0.7, base + 8, 0.9, C.midFern, sd(), 1.6, 0.9, 5);
        fernClump(midG, x + w * 0.8, base + 10, 0.8, C.midFern, sd(), 1.6, 0.9, 5);
      });
      for (let i = 0; i < 22; i++) {
        const x = 20 + i * 90 + hash(i + 50) * 30, y = 720 + rnd(i + 51) * 110;
        if (Math.abs(x - 1040) < 120 && y > 780) continue;
        fernClump(midG, x, y, 0.9 + (y - 720) / 220, C.midFern, sd(), 1.8, 0.95);
      }

      // ---------------------------------------------------------------- STARLIGHT rims (dark pass only)
      if (!LIT) {
        out.lightG = el("g", { class: "light" }, root);
        out.sprays.slice(0, 4).forEach((pts, i) => sk.path(out.lightG, pts.slice(1).map(([x, y]) => [x, y - 9]), { stroke: P.slate, width: 1.6, seed: 31000 + i * 7, wobble: 1, double: false, opacity: 0.35 }));
        trunks.filter((t) => t.depth >= 0.4 && t.depth < 0.8 && t.x > 400 && t.x < 1600).forEach((t, i) => {
          const side = t.x < 1000 ? 1 : -1, x = t.x + side * t.w * 0.4;
          sk.line(out.lightG, x, Math.max(0, t.top + 40), x + side, t.top + 240, { stroke: P.slate, width: 1.6, seed: 31100 + i * 7, wobble: 0.8, double: false, opacity: 0.3 });
        });
      }

      // ---------------------------------------------------------------- NEAR trunks, foreground ferns, web
      const nearG = el("g", { class: "near" }, root);
      const NT = { fill: C.nearTrunk, stroke: C.nearStroke, width: LINE.main, hatch: C.nearHatch, hatchW: 2.2, hatchOp: 0.5, roots: true, shade: true };
      trunk(nearG, 470, 930, -30, 84, 0.25, Object.assign({}, NT, { width: 3.5, hatchW: 1.8, lean: 6 }));
      trunk(nearG, 150, 1000, -30, 250, 0, Object.assign({}, NT, { lean: -18 }));
      trunk(nearG, 1790, 1020, -30, 230, 0.02, Object.assign({}, NT, { lean: 14 }));
      const DTX = 1490, DTB = 900;
      trunk(nearG, DTX, DTB, -30, 120, 0.15, Object.assign({}, NT, { hatchW: 2, lean: -8 }));
      // an old axe blaze on the near-left giant (dim scar; pale when lit)
      sk.poly(nearG, [[118, 520], [160, 514], [166, 592], [124, 600]], { fill: C.blaze, stroke: INK, width: 2.5, seed: sd(), wobble: 0.8 });
      let bl = "";
      for (let i = 0; i < 6; i++) bl += `M${126 + i * 6} ${520 + i} L${128 + i * 6} ${594 - i} `;
      el("path", { d: bl, fill: "none", stroke: LIT ? P.mist : P.storm, "stroke-width": 1.4, opacity: 0.7 }, nearG);
      fernClump(nearG, 330, 1090, 3.2, C.nearFern, sd(), 3.4);
      fernClump(nearG, 1660, 1090, 3.4, C.nearFern, sd(), 3.4);
      fernClump(nearG, 700, 1080, 2.2, C.nearFern2, sd(), 2.8);
      fernClump(nearG, 1250, 1070, 2.4, C.nearFern2, sd(), 2.8);
      const WX = 760, WY = 900;
      let web = "";
      for (let k = 0; k < 7; k++) { const a = (k / 7) * Math.PI * 2; web += `M${WX} ${WY} L${f1(WX + Math.cos(a) * 34)} ${f1(WY + Math.sin(a) * 26)} `; }
      [10, 18, 26].forEach((r) => { for (let k = 0; k <= 7; k++) { const a = (k / 7) * Math.PI * 2; web += (k ? "L" : "M") + f1(WX + Math.cos(a) * r * 1.3) + " " + f1(WY + Math.sin(a) * r) + " "; } });
      el("path", { d: web, fill: "none", stroke: C.web, "stroke-width": 0.8, opacity: LIT ? 0.8 : 0.4 }, nearG);

      // ---------------------------------------------------------------- DETAIL: trunk foot + sword fern (close beam)
      const detailG = el("g", { class: "detail" }, root);
      // bark plates: irregular slabs with deep fissures between them
      // deep bark fissures braiding down to the root flare (long ragged lines that split and rejoin)
      let fis = "";
      [[-40, 0], [-14, 1], [12, 2], [36, 3]].forEach(([dx, k]) => {
        let x = DTX + dx;
        for (let i = 0; i <= 10; i++) { const y = DTB - 280 + i * 26; x += hash(k * 17 + i) * 5 - (dx < 0 ? 0.6 : -0.6) * (i > 7 ? 3 : 0); fis += (i ? "L" : "M") + f1(x) + " " + f1(y) + " "; }
        for (let i = 0; i < 2; i++) { const y = DTB - 240 + i * 110 + hash(k + i) * 16, x0 = DTX + dx + hash(k * 3 + i) * 4; fis += `M${f1(x0)} ${f1(y)} Q${f1(x0 + 11)} ${f1(y + 24)} ${f1(x0 + 13 + hash(i + k) * 3)} ${f1(y + 58)} `; }
      });
      el("path", { d: fis, fill: "none", stroke: C.dPlate, "stroke-width": 3, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: LIT ? 0.75 : 0.5 }, detailG);
      for (let i = 0; i < 5; i++) el("circle", { cx: DTX + 20 + (i % 2) * 6, cy: DTB - 250 + i * 9, r: 1.8, fill: C.dHole }, detailG);
      [[DTX - 80, DTB + 4, 46], [DTX + 62, DTB + 6, 38], [DTX - 22, DTB - 40, 26]].forEach(([x, y, r]) => {
        const pts = [];
        for (let k = 0; k <= 8; k++) { const t = k / 8; pts.push([x - r + 2 * r * t, y - Math.sin(t * Math.PI) * r * 0.55 - (k % 2) * 3]); }
        sk.poly(detailG, pts, { fill: C.dMoss, stroke: INK, width: 1.6, seed: sd(), wobble: 0.8 });
        let d = "";
        for (let k = 0; k < 7; k++) d += `M${f1(x - r * 0.75 + k * r * 0.25)} ${f1(y - 2)} L${f1(x - r * 0.75 + k * r * 0.25 + 2)} ${f1(y - r * 0.3)} `;
        el("path", { d, fill: "none", stroke: C.dMossLine, "stroke-width": 1, opacity: 0.7 }, detailG);
      });
      [[DTX - 112, DTB + 2, 12], [DTX - 94, DTB + 8, 9], [DTX + 86, DTB + 8, 10]].forEach(([x, y, r]) => {
        sk.line(detailG, x, y, x + 1, y - r * 1.4, { stroke: C.dMushStem, width: 2.2, seed: sd(), wobble: 0.2, double: false });
        sk.poly(detailG, [[x - r, y - r * 1.3], [x - r * 0.4, y - r * 2], [x + r * 0.5, y - r * 2], [x + r * 1.1, y - r * 1.3]], { fill: C.dMush, stroke: INK, width: 1.4, seed: sd(), wobble: 0.3 });
      });
      const fcx = DTX + 124, fcy = DTB + 22;
      sk.poly(detailG, [[fcx - 18, fcy], [fcx - 11, fcy - 9], [fcx + 11, fcy - 9], [fcx + 20, fcy], [fcx + 8, fcy + 8], [fcx - 11, fcy + 8]], { fill: C.dCone, stroke: INK, width: 1.4, seed: sd(), wobble: 0.2 });
      let cd = "";
      for (let i = 0; i < 6; i++) cd += `M${f1(fcx - 12 + i * 5)} ${f1(fcy - 8)} L${f1(fcx - 10 + i * 5)} ${f1(fcy + 7)} `;
      el("path", { d: cd, fill: "none", stroke: INK, "stroke-width": 1 }, detailG);
      fernClump(detailG, DTX - 40, DTB + 20, 1.5, C.dFern2, sd(), 2.2);
      fern(detailG, DTX - 60, DTB + 22, 200, 26, sd(), C.dFern, 2.6);
      fern(detailG, DTX - 50, DTB + 24, 150, -40, sd(), C.dFern2, 2.2);

      out[LIT ? "lit" : "dark"] = { farG, canopyG, floorG, midG, nearG, detailG, DTX, DTB, FAR, trailC };
    }

    woods(g, false);
    g.appendChild(litWrap);
    litWrap.appendChild(litG);
    woods(litG, true);

    const D = out.dark;
    return {
      g,
      groundY: 860,
      trunks: trunks.slice().sort((a, b) => a.depth - b.depth),
      beamZone: { x0: 220, x1: 1720, y0: 300, y1: 940 },
      gap: { x: GAP.x, y: GAP.y, w: GAP.w, h: GAP.h, cx: GAP.x + GAP.w / 2, cy: Math.round(GAP.y + GAP.h / 2) },
      farPoint: { x: D.FAR[0], y: D.FAR[1] },
      trail: { points: D.trailC.map((p) => p.slice()) },
      lit: { g: litG, clipTo: (d) => litClipPath.setAttribute("d", d && String(d).trim() ? d : "M0 0 Z") },
      skyG,
      starG,
      lightG: out.lightG,
      shadowDir: { dx: 0, dy: 1 },
      detail: { g: D.detailG, litG: out.lit.detailG, x: D.DTX - 34, y: D.DTB - 16 },
      farG: D.farG,
      midG: D.midG,
      nearG: D.nearG,
    };
  };
})();
