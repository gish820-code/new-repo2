/* Rainy Day background — `ravineCreek` v1. Episode 5, DAY 9 (dry spell), MIDDAY, dappled light.
 * A steep forested ravine seen from INSIDE it, looking upstream: tall Douglas-fir and red-alder trunks rising out
 * of frame, a canopy that lets the noon light through in patches (shafts + dapple), sword ferns (hatched fronds),
 * mossy boulders, roots, a fallen fir lying across the ravine, and the CREEK BED — wide,
 * rocky, the stones dry and pale — with only a THIN silver trickle winding down the middle past a few tiny pools.
 * Just in front of the figures the trickle drops ~20 cm over a small MOSSY LIP into a palm-sized pool (the close-up
 * spot: the jug goes under it). High up at the top right, through a gap in the canopy, the edge of the ridge road
 * (gravel shoulder + guardrail, a dry culvert under it); at top center, far up the ravine, its bright upper rim.
 * Small story details: the old high-water wrack line on both banks, a bleached snag stranded in the bed, cracked
 * dried mud, deer tracks at the pool, a faded survey ribbon on a branch, a web by a fern, shelf fungi on the log,
 * a dry culvert under the road. The fallen fir's snapped butt end (with rings) rests in the left slope.
 *
 * Colours: RainyDay.palette + the Episode 5 light kit (EP5 below, copied exactly; this module uses the MIDDAY DAPPLE
 * entries plus sunSkyLow for the sky slivers). No slicker yellow anywhere. Flat hand-inked fills, sk.* only.
 *
 * Paste VERBATIM after assets/characters/rainy-day-rig-v3.js (uses only palette, LINE, el, sk, hash).
 * Deterministic, static; scenes own all motion.
 *
 *   const bg = window.RainyDayBG.ravineCreek(layerG, {});
 *   const s = 1.4, x = 880;
 *   RD.figure(fig, { character: "drizzle", x, y: bg.groundY(x) - 116 * s, scale: s });   // feet on the ground
 *   jug at (bg.lip.x, bg.lip.jugY)  — under the falling trickle
 *   gsap.to(bg.dapples, { x: "+=14", duration: 4, yoyo: true, repeat: 1 })   // leaves moving in the canopy
 *
 * OPTS (all optional):
 *   light: "midday"   the only light this location has (default). Unknown values fall back to "midday".
 *
 * HANDLES returned (screen px in the 1920x1080 viewBox):
 *   g                root <g> of the whole background.
 *   groundY(x)       ground y under x on the main foot plane (feet). Banks ~846–854 (x < 490, x > 1450), creek bed
 *                    ~874–876 (x 560–1380), short earth steps between. groundY(830) = 875, groundY(1260) = 874.
 *   footY = 874      groundY at the creek centre (a plain number, for code that wants one).
 *   creek            { g, x0: 534, x1: 1402, y: 874, trickleX(y), bedLeftX(y), bedRightX(y),
 *                      pools: [{ x, y, rx }], waterG }
 *                    x0/x1 = dry bed edges at the foot plane y. trickleX(y) = x of the trickle at screen y
 *                    (valid y 600 … 1080; it runs from the bend far upstream (≈ 955, 600) to the bottom edge).
 *                    bedLeftX/RightX(y) = bed edges at y. waterG = the trickle + pools group.
 *   lip              { x: 1040, y: 826, poolY: 868, jugY: 874, drop: 40, g }
 *                    (x, y) = the notch in the mossy lip where the trickle falls off; it lands in the little pool at
 *                    poolY. A jug placed with its BOTTOM at (x, jugY) sits under the fall (mouth up to ~y 830).
 *   rocks            [{ x, y, r, groundY, g }] sit-able mossy boulders: x = centre, y = TOP (seat) line,
 *                    r = half-width, groundY = where the boulder meets the ground (figure hip ≈ y for "sit").
 *                    [0] left bank x 372, y 790 · [1] right bank x 1572, y 783 · [2] dry boulder in the bed x 690, y 846.
 *   topEdge          { x: 905, y: 236, scale: 0.3 } the bright upper rim far up the ravine, where figures appear,
 *                    small (suggested figure scale ~0.3, feet at y).
 *   ridgeRoad        { g, y: 124, x0: 1290, x1: 1660 } the ridge-road shoulder high at the top right; a tiny figure
 *                    (scale ~0.22) stands with feet at y between x0 and x1 and can shout down.
 *   log              { g, x0: 640, y0: 456, x1: 1236, y1: 386 } the fallen fir bridging the ravine (cut butt end at
 *                    x0,y0; the top line of the trunk runs between the two points).
 *   skyG             the sky slivers seen through the canopy (pale + a little blue).
 *   lightG           all light overlays (shafts + dapple patches), drawn over the whole background; scenes may
 *                    fade it (opacity) or drift its parts.
 *   shafts           [g] the individual light-shaft groups inside lightG.
 *   dapples          [g] the individual dapple-patch groups inside lightG (ground, trunks, log, walls, lip).
 *   shadowDir        { dx: -0.42, dy: 0.18 } direction cast shadows fall (noon sun high, a little right of camera).
 *   detail           { g, x: 1040, y: 846 } the hero close-up: the mossy lip with the falling trickle, pool,
 *                    pebbles, moss cushion, fiddlehead, leaf, twig, deer slot, water strider — drawn to read at 3×.
 *   walls            { g } both ravine walls · far { g } the far upstream view · canopy { g } · trunksG { g }
 */
(function () {
  window.RainyDayBG = window.RainyDayBG || {};
  if (window.RainyDayBG.ravineCreek) return;
  let instance = 0;

  window.RainyDayBG.ravineCreek = function (parent, opts) {
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
    const LD = EP5.leafDark, LM = EP5.leafMid, MOSS = EP5.moss, DL = EP5.dappleLight;
    const light = "midday"; // the only light for this location (opts.light accepted, falls back to midday)
    void opts.light;

    const id = "rdrc" + (instance++) + "_";
    const f1 = (v) => (+v).toFixed(1);
    const g = el("g", { class: "rd-bg rd-bg-ravine-creek", "data-light": light }, parent);
    const defs = el("defs", {}, g);
    let clipN = 0;
    function clipTo(par, pts) {
      const cid = id + "clip" + (clipN++);
      const cp = el("clipPath", { id: cid }, defs);
      el("path", { d: "M" + pts.map((q) => f1(q[0]) + " " + f1(q[1])).join(" L") + " Z" }, cp);
      return el("g", { "clip-path": "url(#" + cid + ")" }, par);
    }
    // interpolate x on a polyline sorted by increasing y
    function xAtY(pts, y) {
      if (y <= pts[0][1]) return pts[0][0];
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1];
        if (y >= a[1] && y <= b[1]) return a[0] + ((b[0] - a[0]) * (y - a[1])) / Math.max(0.001, b[1] - a[1]);
      }
      return pts[pts.length - 1][0];
    }
    function yAtX(pts, x) {
      if (x <= pts[0][0]) return pts[0][1];
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1];
        if (x >= a[0] && x <= b[0]) return a[1] + ((b[1] - a[1]) * (x - a[0])) / Math.max(0.001, b[0] - a[0]);
      }
      return pts[pts.length - 1][1];
    }

    // ------------------------------------------------------------------ geometry
    // bed edges meander (sinuous, with seeded jitter) so the bed reads as a creek, not a path
    const BED_L = [], BED_R = [];
    for (let k = 0; k <= 26; k++) {
      const t = k / 26, y = 598 + t * 494;
      const c = 957 - 70 * Math.sin(t * 6.2) * Math.min(1, t * 3) * (1 - 0.6 * t), w = 35 + 725 * t;
      BED_L.push([c - w + Math.sin(t * 21 + 1) * 22 * t + hash(k + 11) * 6 * t, y]);
      BED_R.push([c + w + Math.sin(t * 17 + 2.2) * 26 * t + hash(k + 31) * 6 * t, y]);
    }
    const TRICKLE = [[955, 598], [948, 630], [962, 665], [942, 705], [958, 745], [995, 783], [1026, 810], [1040, 826], [1043, 866],
      [1030, 892], [1004, 930], [988, 975], [1000, 1035], [994, 1090]];
    const bedLeftX = (y) => xAtY(BED_L, y), bedRightX = (y) => xAtY(BED_R, y), trickleX = (y) => xAtY(TRICKLE, y);
    const GL = xAtY(BED_L, 874), GR = xAtY(BED_R, 874); // the foot plane steps down from the banks into the bed
    const GROUND = [[-20, 846], [300, 850], [GL - 40, 854], [GL - 8, 860], [GL + 22, 873], [1000, 876], [GR - 22, 873], [GR + 8, 860], [GR + 50, 852], [1700, 848], [1940, 846]];
    const groundY = (x) => yAtX(GROUND, Math.max(-20, Math.min(1940, x)));
    const WALL_L_FOOT = [[-20, 690], [200, 700], [420, 712], [600, 690], [740, 652], [850, 616], [922, 598]];
    const WALL_R_FOOT = [[992, 598], [1080, 618], [1200, 652], [1380, 684], [1640, 692], [1940, 680]];
    const SIL_L = [[922, 598], [900, 566], [884, 528], [856, 500], [838, 452], [826, 410], [804, 372], [796, 322], [778, 280], [774, 232], [762, 190], [758, 140], [750, -30]];
    const SIL_R = [[992, 598], [1016, 562], [1040, 520], [1070, 492], [1090, 440], [1118, 400], [1140, 350], [1170, 306], [1190, 250], [1216, 200], [1230, 160], [1250, 132], [1940, 118]];
    const LIP = { x: 1040, y: 826, poolY: 868, jugY: 874 };
    const SHADOW = { dx: -0.42, dy: 0.18 };

    // ------------------------------------------------------------------ drawing kits
    function ellPts(cx, cy, rx, ry, seed, n, jag) {
      const pts = []; n = n || 12; jag = jag === undefined ? 0.12 : jag;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2, k = 1 + jag * hash(seed + i * 3.7);
        pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
      }
      return pts;
    }
    function scallop(cx, cy, rx, ry, seed, lobes) { // foliage clump outline
      const pts = [], n = 64, k = lobes || 9, ph = hash(seed) * 3;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const r = 0.8 + 0.2 * Math.abs(Math.sin(a * k / 2 + ph)) + 0.06 * hash(seed + i);
        pts.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]);
      }
      return pts;
    }
    function clump(par, cx, cy, rx, ry, seed, o) {
      o = o || {};
      const pts = scallop(cx, cy, rx, ry, seed, o.lobes);
      const cg = el("g", {}, par);
      sk.poly(cg, pts, { fill: o.fill || LD, stroke: o.stroke || INK, width: o.width || 3, seed, wobble: 1.2, double: o.double, step: 14 });
      const inner = clipTo(cg, pts);
      // leaf ticks
      const nT = Math.round((rx * ry) / 900);
      for (let i = 0; i < nT; i++) {
        const tx = cx + hash(seed + i * 5.1) * rx * 0.85, ty = cy + hash(seed + i * 7.3) * ry * 0.85;
        sk.path(inner, [[tx - 6, ty - 2], [tx, ty + 3], [tx + 6, ty - 2]], { stroke: o.tick || LM, width: 1.6, seed: seed + i, wobble: 0.5, double: false, step: 100 });
      }
      if (o.hatch !== false) sk.hatch(inner, cx - rx, cy, rx * 2, ry, { gap: 9, angle: 125, stroke: INK, width: 1.4, opacity: 0.3, seed: seed + 3 });
      return cg;
    }
    function trunk(par, x, baseY, topY, wB, wT, o) {
      o = o || {};
      const tg = el("g", {}, par), seed = o.seed || 1, lean = o.lean || 0;
      const L = [], R = [];
      const n = 10;
      for (let i = 0; i <= n; i++) {
        const t = i / n, y = baseY + (topY - baseY) * t, w = wB + (wT - wB) * t, cx = x + lean * t;
        L.push([cx - w / 2 + hash(seed + i) * 1.5, y]); R.push([cx + w / 2 + hash(seed + i + 40) * 1.5, y]);
      }
      // root flare
      const fl = o.flare || 0;
      if (fl) { L[0] = [x - wB / 2 - fl, baseY + 6]; R[0] = [x + wB / 2 + fl, baseY + 6]; L[1][0] -= fl * 0.25; R[1][0] += fl * 0.25; }
      const pts = L.concat(R.slice().reverse());
      sk.poly(tg, pts, { fill: o.fill, stroke: o.stroke || INK, width: o.width || LINE.main, seed, wobble: 1, double: o.double });
      const inner = clipTo(tg, pts);
      if (o.kind === "alder") {
        // smooth pale bark: lichen blotches + horizontal lenticel dashes
        const nb = Math.round(((baseY - topY) * (wB + wT)) / 2 / (o.blotchArea || 1400));
        for (let i = 0; i < nb; i++) {
          const t = Math.abs(hash(seed + i * 2.3)), y = baseY + (topY - baseY) * t, w = wB + (wT - wB) * t;
          const bx = x + lean * t + hash(seed + i * 4.1) * w * 0.4;
          const c = (o.blotch || [P.fog, P.paper, MOSS, P.steel])[i % 4];
          sk.poly(inner, ellPts(bx, y, w * (0.12 + 0.12 * Math.abs(hash(seed + i))), 6 + Math.abs(hash(seed + i * 3)) * 12, seed + i * 9, 9, 0.35),
            { fill: c, stroke: "none", seed: seed + i, wobble: 1, double: false, opacity: o.blotchOp || (c === MOSS ? 0.55 : 0.7) });
        }
        for (let i = 0; i < nb * 1.4; i++) {
          const t = Math.abs(hash(seed + i * 6.7)), y = baseY + (topY - baseY) * t, w = wB + (wT - wB) * t;
          const bx = x + lean * t + hash(seed + i * 1.9) * w * 0.35;
          sk.line(inner, bx - w * 0.08, y, bx + w * 0.08, y + 1, { stroke: o.mark || P.slate, width: 1.6, seed: seed + i, wobble: 0.4, double: false, opacity: 0.8 });
        }
        sk.hatch(inner, x - wB, topY, wB * 0.55, baseY - topY, { gap: 7, angle: 90, stroke: o.shade || P.steel, width: 1.4, opacity: 0.5, seed: seed + 7 });
      } else {
        // fir: deep vertical furrows + plate breaks
        const nf = Math.max(3, Math.round(wB / 14));
        for (let i = 0; i < nf; i++) {
          const fx = (i + 0.5) / nf - 0.5, fp = [];
          for (let k = 0; k <= 12; k++) {
            const t = k / 12, y = baseY + (topY - baseY) * t, w = wB + (wT - wB) * t;
            fp.push([x + lean * t + fx * w + hash(seed + i * 13 + k) * w * 0.04, y]);
          }
          sk.path(inner, fp, { stroke: o.furrow || P.storm, width: Math.max(1.4, wB / 60), seed: seed + i * 3, wobble: 1, double: false, opacity: 0.8 });
        }
        const np = Math.round((baseY - topY) / 40) * (wB > 80 ? 3 : 1);
        for (let i = 0; i < np; i++) {
          const t = Math.abs(hash(seed + i * 3.9)), y = baseY + (topY - baseY) * t, w = wB + (wT - wB) * t;
          const bx = x + lean * t + hash(seed + i * 2.2) * w * 0.45;
          sk.line(inner, bx - w * 0.07, y, bx + w * 0.07, y - 3, { stroke: o.furrow || P.storm, width: 1.4, seed: seed + i, wobble: 0.4, double: false, opacity: 0.7 });
        }
        if (o.mossSide) sk.hatch(inner, x + wB * 0.1, topY, wB * 0.5, baseY - topY, { gap: 6, angle: 80, stroke: MOSS, width: 1.6, opacity: 0.35, seed: seed + 11 });
        sk.hatch(inner, x - wB * 0.6, topY, wB * 0.4, baseY - topY, { gap: 6, angle: 95, stroke: INK, width: 1.4, opacity: 0.35, seed: seed + 12 });
      }
      if (o.baseMoss) {
        const mp = [[x - wB / 2 - fl, baseY + 6]];
        for (let i = 0; i <= 8; i++) { const t = i / 8; mp.push([x - wB / 2 - fl + (wB + 2 * fl) * t, baseY - o.baseMoss * (0.5 + 0.5 * Math.abs(hash(seed + i * 5))) * Math.sin(t * Math.PI) - 4]); }
        mp.push([x + wB / 2 + fl, baseY + 6]);
        const mc = clipTo(tg, pts); // the moss skirt hugs the trunk (clipped to it)
        sk.poly(mc, mp, { fill: MOSS, stroke: LD, width: 2, seed: seed + 70, wobble: 1.5, double: false });
        mossTex(mc, mp, seed + 71, 0.6);
      }
      return tg;
    }
    function mossTex(par, pts, seed, dens) { // little curls + dots inside a moss shape
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      pts.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); });
      const inner = clipTo(par, pts);
      const n = Math.round(((x1 - x0) * (y1 - y0) / 140) * (dens || 1));
      for (let i = 0; i < Math.min(n, 220); i++) {
        const cx = x0 + (x1 - x0) * (0.5 + 0.5 * hash(seed + i * 3.1)), cy = y0 + (y1 - y0) * (0.5 + 0.5 * hash(seed + i * 5.7));
        const c = i % 3 === 0 ? DL : i % 3 === 1 ? LD : LM;
        if (i % 2) el("circle", { cx: f1(cx), cy: f1(cy), r: 1.1, fill: c, opacity: 0.9 }, inner);
        else for (let q = 0; q < 3; q++) { const a = -Math.PI / 2 + (q - 1) * 0.7; el("line", { x1: f1(cx), y1: f1(cy), x2: f1(cx + Math.cos(a) * 3.2), y2: f1(cy + Math.sin(a) * 3.2), stroke: c, "stroke-width": 1.1, "stroke-linecap": "round", opacity: 0.85 }, inner); }
      }
      return inner;
    }
    function swordFern(par, x, y, size, seed, o) {
      o = o || {};
      const fg = el("g", {}, par);
      const nF = o.fronds || 9, spread = o.spread || 78;
      for (let f = 0; f < nF; f++) {
        const a0 = ((-spread + (2 * spread * f) / (nF - 1)) + hash(seed + f) * 8) * Math.PI / 180;
        const L = size * (0.75 + 0.3 * Math.abs(hash(seed + f * 2.7))) * (1 - Math.abs(a0) * 0.18);
        const sgn = a0 === 0 ? 1 : Math.sign(a0), steps = 11, pts = [[x, y]];
        let px = x, py = y;
        const dirs = [];
        for (let i = 1; i <= steps; i++) {
          const t = i / steps, th = a0 + sgn * (o.droop || 1.15) * Math.pow(t, 1.6);
          px += Math.sin(th) * L / steps; py -= Math.cos(th) * L / steps;
          pts.push([px, py]); dirs.push(th);
        }
        sk.path(fg, pts, { stroke: o.rib || o.stroke || INK, width: o.ribW || 2, seed: seed + f * 7, wobble: 0.5, double: false, step: 100 });
        for (let i = 1; i < steps; i++) {
          const t = i / steps, th = dirs[i - 1], p = pts[i];
          const l = size * 0.15 * (1 - 0.6 * t) * (i < 2 ? 0.6 : 1);
          const dx = Math.sin(th), dy = -Math.cos(th);
          for (const side of [-1, 1]) {
            const nx = -dy * side, ny = dx * side;
            const tip = [p[0] + nx * l * 0.92 + dx * l * 0.42, p[1] + ny * l * 0.92 + dy * l * 0.42];
            if (o.fill) {
              const b1 = [p[0] + dx * l * 0.16, p[1] + dy * l * 0.16];
              const m = [p[0] + nx * l * 0.5 + dx * l * 0.38, p[1] + ny * l * 0.5 + dy * l * 0.38];
              const m2 = [p[0] + nx * l * 0.55 + dx * l * 0.02, p[1] + ny * l * 0.55 + dy * l * 0.02];
              sk.poly(fg, [p, m2, tip, m, b1], { fill: o.fill, stroke: o.stroke || INK, width: o.width || 1.5, seed: seed + f * 31 + i * 3 + side, wobble: 0.35, double: false, step: 100 });
            } else {
              sk.line(fg, p[0], p[1], tip[0], tip[1], { stroke: o.stroke || LM, width: o.width || 1.8, seed: seed + f * 31 + i * 3 + side, wobble: 0.3, double: false });
            }
          }
        }
      }
      return fg;
    }
    function mossyRock(par, x, gy, w, h, seed, o) {
      o = o || {};
      const rg = el("g", {}, par);
      const pts = [];
      for (let i = 0; i <= 12; i++) {
        const a = Math.PI + (i / 12) * Math.PI;
        pts.push([x + Math.cos(a) * w * (0.9 + 0.1 * hash(seed + i)), gy - 2 + Math.sin(a) * h * (0.86 + 0.14 * Math.abs(hash(seed + i * 2)))]);
      }
      pts.push([x + w * 0.9, gy + 6], [x - w * 0.9, gy + 6]);
      // cast shadow toward shadowDir
      sk.poly(rg, ellPts(x + SHADOW.dx * h * 0.9, gy + 4 + SHADOW.dy * h * 0.3, w * 1.05, h * 0.18, seed + 90, 12, 0.1), { fill: LD, stroke: "none", seed: seed + 91, double: false, opacity: 0.55 });
      sk.poly(rg, pts, { fill: o.fill || P.steel, stroke: INK, width: o.width || 3.5, seed, wobble: 1 });
      const inner = clipTo(rg, pts);
      sk.hatch(inner, x - w, gy - h, w * 0.9, h + 6, { gap: 7, angle: 60, stroke: INK, width: 1.4, opacity: 0.35, seed: seed + 3 });
      // moss cap
      const cap = [];
      for (let i = 0; i <= 12; i++) {
        const a = Math.PI + (i / 12) * Math.PI;
        cap.push([x + Math.cos(a) * w * 1.04, gy - 2 + Math.sin(a) * h * 1.08]);
      }
      for (let i = 12; i >= 0; i--) {
        const t = i / 12, cx = x - w * 0.96 + w * 1.92 * t;
        cap.push([cx, gy - h * (o.capDepth || 0.45) * Math.sin(Math.PI * (0.15 + 0.7 * t)) + Math.abs(hash(seed + i * 7)) * h * 0.18 + (i % 3 === 0 ? h * 0.14 : 0)]);
      }
      const capClip = clipTo(rg, pts);
      sk.poly(capClip, cap, { fill: MOSS, stroke: LD, width: 2, seed: seed + 5, wobble: 1.4, double: false });
      mossTex(capClip, cap, seed + 6, 1);
      // crack + pale lichen spots on the rock face
      sk.path(inner, [[x + w * 0.2, gy - h * 0.3], [x + w * 0.28, gy - h * 0.15], [x + w * 0.22, gy]], { stroke: INK, width: 1.6, seed: seed + 8, wobble: 0.5, double: false });
      for (let i = 0; i < 4; i++) sk.poly(inner, ellPts(x + hash(seed + i * 9) * w * 0.6, gy - h * 0.18 + hash(seed + i) * 6, 4 + i, 3, seed + i * 11, 8, 0.3), { fill: P.fog, stroke: "none", double: false, opacity: 0.7, seed: seed + i });
      return rg;
    }
    function cobble(par, x, y, rx, ry, seed, fill, detail) {
      const cg = el("g", {}, par);
      const pts = [], n = Math.max(14, Math.min(32, Math.round(rx * 1.2))), p1 = hash(seed) * 3, p2 = hash(seed + 1) * 3;
      for (let i = 0; i < n; i++) { // smooth, slightly lumpy pebble outline (no per-point noise)
        const a = (i / n) * Math.PI * 2, k = 1 + 0.09 * Math.sin(2 * a + p1) + 0.05 * Math.sin(3 * a + p2);
        pts.push([x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * k * (Math.sin(a) > 0 ? 0.92 : 1.05)]);
      }
      sk.poly(cg, pts, { fill, stroke: INK, width: rx > 26 ? 3 : rx > 10 ? 2 : 1.4, seed, wobble: Math.min(0.35, rx / 60), double: false, step: 1000 });
      if (detail && rx > 7) {
        // shaded underside + a highlight on top
        sk.path(cg, [[x - rx * 0.75, y + ry * 0.35], [x - rx * 0.2, y + ry * 0.75], [x + rx * 0.6, y + ry * 0.5]], { stroke: P.steel, width: Math.max(1.2, rx / 12), seed: seed + 3, wobble: 0.4, double: false, opacity: 0.8 });
        sk.path(cg, [[x - rx * 0.45, y - ry * 0.45], [x + rx * 0.15, y - ry * 0.62]], { stroke: P.paper, width: Math.max(1.2, rx / 14), seed: seed + 4, wobble: 0.3, double: false, opacity: 0.9 });
      }
      return cg;
    }
    function blob(par, cx, cy, rx, ry, seed, fill, op) {
      return sk.poly(par, ellPts(cx, cy, rx, ry, seed, 14, 0.14), { fill, stroke: "none", seed, wobble: 1, double: false, opacity: op, step: 1000 });
    }
    function fleck(par, cx, cy, rx, ry, seed, op) { // a sun fleck: one soft spot + a few smaller round spots around it
      blob(par, cx, cy, rx, ry, seed, DL, op);
      const n = 2 + Math.round(Math.abs(hash(seed)) * 3);
      for (let i = 0; i < n; i++) {
        const a = hash(seed + i * 3.1) * Math.PI, d = 1 + 0.4 * Math.abs(hash(seed + i));
        const k = 0.2 + 0.25 * Math.abs(hash(seed + i * 5.3));
        blob(par, cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d, rx * k, ry * k * 1.1, seed + 10 + i, DL, op * 0.9);
      }
    }
    function root(par, pts, w, seed, fill) {
      // a root as a tapered band
      const L = [], R = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
        const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, ww = (w * (1 - i / pts.length)) / 2 + 0.8;
        L.push([pts[i][0] - (dy / d) * ww, pts[i][1] + (dx / d) * ww]); R.push([pts[i][0] + (dy / d) * ww, pts[i][1] - (dx / d) * ww]);
      }
      return sk.poly(par, L.concat(R.reverse()), { fill: fill || LD, stroke: INK, width: w > 10 ? 2.5 : 1.8, seed, wobble: 0.7, double: false });
    }

    // ================================================================== SKY (slivers through the canopy)
    const skyG = el("g", { class: "rc-sky" }, g);
    sk.rect(skyG, -20, -20, 1960, 640, { fill: DL, stroke: "none", wobble: 0, double: false });
    [[1420, 40, 170, 34], [930, 60, 110, 40], [1180, 16, 60, 14], [700, 16, 50, 12]].forEach(([x, y, rx, ry], i) =>
      blob(skyG, x, y, rx, ry, 10 + i, EP5.sunSkyLow, 0.85));
    [[880, 150, 60, 22], [1000, 120, 70, 26], [1470, 70, 90, 16]].forEach(([x, y, rx, ry], i) => blob(skyG, x, y, rx, ry, 20 + i, P.paper, 0.9));

    // ================================================================== FAR UPSTREAM VIEW (centre notch)
    const farG = el("g", { class: "rc-far" }, g);
    // far canopy beyond the rim
    for (let i = 0; i < 9; i++) {
      const x = 700 + i * 70 + hash(i + 30) * 20;
      clump(farG, x, 150 + Math.abs(hash(i + 31)) * 40, 60, 46, 300 + i * 7, { fill: MOSS, stroke: LM, width: 1.6, tick: DL, hatch: false, double: false });
    }
    sk.rect(farG, 680, 80, 620, 260, { fill: DL, stroke: "none", wobble: 0, double: false, opacity: 0.45 });
    const RIM = [[690, 270], [760, 244], [840, 228], [905, 236], [960, 226], [1040, 236], [1120, 228], [1200, 246], [1280, 262]];
    const far3 = RIM.concat([[1280, 640], [690, 640]]);
    sk.poly(farG, far3, { fill: MOSS, stroke: LM, width: 2, seed: 320, wobble: 1.4 });
    sk.poly(farG, far3, { fill: DL, stroke: "none", seed: 321, wobble: 0, double: false, opacity: 0.45 });
    sk.hatch(clipTo(farG, far3), 690, 226, 590, 400, { gap: 11, angle: 70, stroke: LM, width: 1.4, opacity: 0.3, seed: 322 });
    // thin far trunks standing on the rim and on the far slopes
    [[790, 250, 8], [842, 236, 10], [1062, 238, 9], [1130, 232, 11], [1176, 250, 8], [990, 240, 6]].forEach(([x, by, w], i) => {
      sk.poly(farG, [[x - w / 2, by + 4], [x - w * 0.35, -20], [x + w * 0.35, -20], [x + w / 2, by + 4]], { fill: i % 2 ? P.fog : MOSS, stroke: LM, width: 1.5, seed: 330 + i, wobble: 0.6, double: false, opacity: 0.85 });
    });
    // rim bushes + sword ferns, small, catching light
    for (let i = 0; i < 12; i++) {
      const x = 710 + i * 48 + hash(i + 40) * 10;
      swordFern(farG, x, yAtX(RIM, x) + 6, 22 + Math.abs(hash(i)) * 10, 340 + i * 3, { stroke: LM, rib: LM, width: 1.2, ribW: 1.4, fronds: 6 });
    }
    // middle-far slopes converging on the bend
    const far2L = [[690, 300], [760, 340], [830, 430], [890, 520], [940, 600], [690, 640]];
    const far2R = [[1280, 300], [1200, 340], [1120, 430], [1050, 520], [978, 600], [1280, 640]];
    [far2L, far2R].forEach((pts, i) => {
      sk.poly(farG, pts, { fill: MOSS, stroke: LM, width: 2.2, seed: 350 + i, wobble: 1.2 });
      sk.poly(farG, pts, { fill: DL, stroke: "none", seed: 352 + i, double: false, opacity: 0.25 });
      sk.hatch(clipTo(farG, pts), 690, 290, 590, 350, { gap: 9, angle: i ? 60 : 120, stroke: LM, width: 1.5, opacity: 0.4, seed: 354 + i });
    });
    for (let i = 0; i < 10; i++) {
      const left = i < 5, k = i % 5;
      const yy = 380 + k * 40, xx = left ? xAtY(far2L.slice(0, 5), yy) - 30 - k * 4 : xAtY(far2R.slice(0, 5), yy) + 30 + k * 4;
      swordFern(farG, xx, yy, 26 + k * 4, 360 + i * 5, { fill: LM, stroke: LM, rib: LD, width: 1, ribW: 1.4, fronds: 7 });
    }
    // far bend: shade pooled low in the notch, a few far boulders, mid-far trunks and a small fallen log
    sk.poly(farG, [[800, 470], [900, 500], [960, 520], [1030, 500], [1150, 470], [1150, 640], [800, 640]], { fill: LM, stroke: "none", seed: 380, wobble: 3, double: false, opacity: 0.35 });
    [[868, 455, 12], [1064, 470, 13], [1012, 330, 9]].forEach(([x, by, w], i) =>
      sk.poly(farG, [[x - w / 2 - 3, by + 4], [x - w * 0.3, -20], [x + w * 0.3, -20], [x + w / 2 + 3, by + 4]], { fill: i % 2 ? LM : MOSS, stroke: LD, width: 1.8, seed: 382 + i, wobble: 0.6, double: false, opacity: 0.85 }));
    [[946, 586, 8], [972, 590, 6], [936, 548, 10], [1004, 556, 7], [880, 520, 9], [1046, 530, 8]].forEach(([x, y, r], i) =>
      sk.poly(farG, ellPts(x, y, r, r * 0.6, 392 + i, 14, 0.1), { fill: i % 2 ? P.fog : MOSS, stroke: LD, width: 1.5, seed: 393 + i, double: false, wobble: 0.4, step: 1000 }));
    const topEdge = { x: 905, y: 236, scale: 0.3 };

    // ================================================================== RAVINE WALLS
    const wallsG = el("g", { class: "rc-walls" }, g);
    // left wall polygon: silhouette (top→bottom) then foot line (right→left)
    const WL = SIL_L.slice().reverse().concat(WALL_L_FOOT.slice().reverse()).concat([[-30, 690], [-30, -30]]);
    const WR = SIL_R.concat([[1960, 118], [1960, 680]]).concat(WALL_R_FOOT.slice().reverse());
    [WL, WR].forEach((pts, i) => {
      sk.poly(wallsG, pts, { fill: LM, stroke: INK, width: 3, seed: 400 + i, wobble: 1.2 });
      const c = clipTo(wallsG, pts);
      sk.hatch(c, -30, -30, 1990, 760, { gap: 10, angle: i ? 55 : 125, stroke: LD, width: 1.6, opacity: 0.45, seed: 402 + i });
      // moss slabs and soil steps on the slope
      for (let k = 0; k < 16; k++) { // short mossy terraces / soil steps following the slope
        const yy = 200 + Math.abs(hash(k * 3.3 + i * 50)) * 470;
        const len = 120 + Math.abs(hash(k * 5.1 + i)) * 220;
        const xa = i ? 1080 + Math.abs(hash(k * 2.9 + 7)) * 760 : -20 + Math.abs(hash(k * 4.3 + 2)) * 760;
        const pts = [];
        for (let q = 0; q <= 6; q++) { const x = xa + (len * q) / 6; pts.push([x, yy + (i ? -1 : 1) * (q - 3) * len * 0.012 + Math.sin(q * 1.7 + k) * 5]); }
        sk.path(c, pts, { stroke: MOSS, width: 6, seed: 410 + k + i * 30, wobble: 2, double: false, opacity: 0.75 });
        sk.path(c, pts.map(([x, y]) => [x, y + 5]), { stroke: LD, width: 2.5, seed: 430 + k + i * 30, wobble: 1.5, double: false, opacity: 0.8 });
      }
      // dark soil seams (where the slope folds) — deep shade
      for (let k = 0; k < 6; k++) {
        const yy = 260 + k * 75 + hash(k + i) * 20;
        const xx = i ? 1200 + k * 120 : 60 + k * 120;
        sk.path(c, [[xx, yy], [xx + (i ? 60 : -50), yy + 20], [xx + (i ? 140 : -120), yy + 26]], { stroke: LD, width: 5, seed: 440 + k + i * 9, wobble: 2, double: false, opacity: 0.8 });
      }
    });
    // exposed rock outcrops with strata
    const wallRocksLater = [[640, 560, 50, 34], [430, 430, 44, 28], [1290, 520, 50, 32], [1560, 430, 54, 30], [200, 330, 40, 24]];
    // roots snaking down the walls
    [[[560, 610], [600, 640], [630, 690], [650, 702]], [[260, 560], [230, 610], [215, 660], [205, 700]], [[1340, 600], [1300, 640], [1290, 688]],
      [[1600, 560], [1630, 620], [1660, 690]], [[880, 430], [860, 470], [855, 520]]].forEach((pts, i) => root(wallsG, pts, 10, 490 + i, LD));
    // ferns on the walls (mid distance: lighter strokes, they catch the light)
    const wallFerns = [[90, 640, 70], [180, 560, 56], [300, 660, 60], [420, 610, 54], [520, 470, 46], [700, 600, 50], [760, 520, 40],
      [1130, 560, 44], [1240, 620, 56], [1330, 540, 50], [1420, 650, 60], [1540, 620, 64], [1700, 600, 66], [1820, 520, 60], [1660, 450, 48]];
    wallRocksLater.forEach(([x, gy, w, h], i) => mossyRock(wallsG, x, gy, w, h, 460 + i * 7, { fill: P.slate, width: 3, capDepth: 0.55 }));
    wallFerns.forEach(([x, y, s], i) => swordFern(wallsG, x, y, s, 520 + i * 13, { fill: i % 3 ? MOSS : LM, stroke: LD, rib: LD, width: 1.2, ribW: 1.8, fronds: 9 }));
    [SIL_L, SIL_R].forEach((sil, side) => {
      for (let k = 0; k < 9; k++) {
        const y = 200 + k * 46, x = xAtY(side ? sil.slice(0, 11).reverse() : sil.slice().reverse(), y);
        clump(wallsG, x + (side ? 10 : -10), y + 6, 26 + (k % 3) * 8, 14 + (k % 2) * 6, 5000 + k + side * 20, { fill: k % 2 ? LM : MOSS, stroke: LD, width: 1.8, tick: k % 2 ? MOSS : DL, hatch: false, double: false, lobes: 5 });
        if (k % 2) swordFern(wallsG, x + (side ? 14 : -14), y + 4, 30, 5050 + k + side * 30, { fill: MOSS, stroke: LD, rib: LD, width: 1, ribW: 1.5, fronds: 8 });
      }
    });
    // the ridge road at the top right: dry culvert in the bank, gravel shoulder, guardrail
    const roadG = el("g", { class: "rc-ridge-road" }, g);
    clump(roadG, 1460, 64, 80, 30, 600, { fill: LM, stroke: LD, width: 1.6, tick: MOSS, hatch: false, double: false });
    clump(roadG, 1330, 70, 60, 26, 601, { fill: MOSS, stroke: LM, width: 1.6, tick: DL, hatch: false, double: false });
    const shoulder = [[1250, 132], [1290, 120], [1700, 114], [1960, 112], [1960, 126], [1700, 130], [1290, 136], [1250, 138]];
    sk.poly(roadG, shoulder, { fill: P.mist, stroke: INK, width: 3, seed: 602, wobble: 0.8 });
    for (let i = 0; i < 40; i++) el("circle", { cx: f1(1280 + i * 17 + hash(i + 600) * 5), cy: f1(126 + hash(i + 601) * 5), r: 1.4, fill: P.slate }, roadG);
    for (let i = 0; i < 9; i++) {
      const x = 1300 + i * 72;
      sk.line(roadG, x, 124, x, 96, { stroke: INK, width: 3, seed: 610 + i, wobble: 0.4, double: false });
    }
    sk.poly(roadG, [[1290, 96], [1960, 90], [1960, 102], [1290, 106]], { fill: P.steel, stroke: INK, width: 2.5, seed: 620, wobble: 0.5 });
    sk.line(roadG, 1294, 99, 1960, 93, { stroke: P.fog, width: 1.6, seed: 621, double: false, wobble: 0.3 });
    // bent end of the rail drooping over the edge + a reflector post
    sk.path(roadG, [[1292, 100], [1268, 108], [1252, 124]], { stroke: INK, width: 4, seed: 622, wobble: 0.6 });
    sk.line(roadG, 1700, 126, 1700, 84, { stroke: INK, width: 2.5, seed: 623, double: false });
    sk.rect(roadG, 1696, 84, 8, 10, { fill: P.paper, stroke: INK, width: 1.4, seed: 624, wobble: 0.2, double: false });
    // culvert outlet below the road (dry, a dark stain down the bank)
    sk.poly(roadG, ellPts(1352, 196, 22, 15, 630, 14, 0.04), { fill: P.steel, stroke: INK, width: 3, seed: 631, wobble: 0.4 });
    sk.poly(roadG, ellPts(1352, 197, 15, 10, 632, 12, 0.04), { fill: P.night, stroke: INK, width: 1.5, seed: 633, double: false });
    for (let k = 0; k < 4; k++) sk.path(roadG, [[1352 + (k - 1.5) * 9, 182], [1352 + (k - 1.5) * 10, 211]], { stroke: P.slate, width: 1.2, seed: 634 + k, double: false, wobble: 0.6 });
    sk.poly(roadG, [[1340, 210], [1364, 210], [1360, 260], [1352, 330], [1344, 262]], { fill: LD, stroke: "none", seed: 640, double: false, opacity: 0.55 });
    const ridgeRoad = { g: roadG, y: 124, x0: 1290, x1: 1660 };

    // ================================================================== FALLEN LOG ACROSS THE RAVINE
    const logG = el("g", { class: "rc-log" }, g);
    const LOG0 = [640, 456], LOG1 = [1236, 386];
    const ldx = LOG1[0] - LOG0[0], ldy = LOG1[1] - LOG0[1], llen = Math.hypot(ldx, ldy);
    const lnx = -ldy / llen, lny = ldx / llen; // normal (pointing down-ish)
    const logTop = [], logBot = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12, th = 40 - 10 * t, x = LOG0[0] + ldx * t, y = LOG0[1] + ldy * t;
      logTop.push([x + hash(700 + i) * 1.2, y + hash(701 + i) * 1.2]);
      logBot.push([x + lnx * th, y + lny * th]);
    }
    // hanging moss strands under the log
    for (let i = 0; i < 22; i++) {
      const t = 0.12 + (i / 22) * 0.82, bx = LOG0[0] + ldx * t + lnx * (40 - 10 * t), by = LOG0[1] + ldy * t + lny * (40 - 10 * t) - 2;
      const len = 14 + Math.abs(hash(i + 710)) * 30;
      sk.path(logG, [[bx, by], [bx + 2, by + len * 0.5], [bx - 1, by + len]], { stroke: i % 3 ? MOSS : DL, width: 1.6, seed: 711 + i, wobble: 0.6, double: false });
    }
    const logPts = logTop.concat(logBot.slice().reverse());
    sk.poly(logG, logPts, { fill: P.slate, stroke: INK, width: 3.5, seed: 720, wobble: 0.8 });
    const lc = clipTo(logG, logPts);
    for (let k = 0; k < 4; k++) {
      const off = 8 + k * 7;
      sk.path(lc, logTop.map(([x, y], i) => [x + lnx * off + hash(730 + k * 20 + i) * 2, y + lny * off]), { stroke: P.storm, width: 1.5, seed: 730 + k, wobble: 0.8, double: false });
    }
    // moss mat along the top
    const mossTop = logTop.map(([x, y], i) => [x, y - 4 - Math.abs(hash(740 + i)) * 4]).concat(logTop.slice().reverse().map(([x, y], i) => [x + lnx * (10 + (i % 3) * 3), y + lny * (10 + (i % 3) * 3)]));
    sk.poly(logG, mossTop, { fill: MOSS, stroke: LD, width: 2, seed: 741, wobble: 1.2, double: false });
    mossTex(logG, mossTop, 742, 1.2);
    // small ferns + seedlings on the log
    [[0.3, 22], [0.55, 18], [0.78, 20]].forEach(([t, s], i) => swordFern(logG, LOG0[0] + ldx * t, LOG0[1] + ldy * t - 3, s, 750 + i * 7, { stroke: LD, rib: LD, width: 1.4, ribW: 1.6, fronds: 6 }));
    // shelf fungi on the side
    [[0.42, 0], [0.47, 1], [0.66, 0]].forEach(([t, k], i) => {
      const bx = LOG0[0] + ldx * t + lnx * 22, by = LOG0[1] + ldy * t + lny * 22 + k * 6;
      sk.poly(logG, [[bx - 10, by], [bx - 6, by - 6], [bx + 6, by - 7], [bx + 11, by - 1]], { fill: P.fog, stroke: INK, width: 1.5, seed: 760 + i, wobble: 0.3, double: false });
    });
    // broken branch stubs
    [[0.36, -26, -20], [0.62, -18, -30], [0.86, 10, -24]].forEach(([t, dx, dy], i) => {
      const bx = LOG0[0] + ldx * t, by = LOG0[1] + ldy * t - 4;
      sk.poly(logG, [[bx - 4, by + 2], [bx + dx - 2, by + dy], [bx + dx + 3, by + dy + 1], [bx + 5, by + 2]], { fill: P.slate, stroke: INK, width: 2, seed: 770 + i, wobble: 0.4, double: false });
    });
    // the snapped butt end at the left, resting in the slope: a soil heap, ferns, and the cut face with rings
    sk.poly(logG, [[LOG0[0] - 70, LOG0[1] + 60], [LOG0[0] - 40, LOG0[1] + 22], [LOG0[0] + 10, LOG0[1] + 30], [LOG0[0] + 60, LOG0[1] + 48], [LOG0[0] + 90, LOG0[1] + 70], [LOG0[0] - 80, LOG0[1] + 74]],
      { fill: LD, stroke: INK, width: 2.5, seed: 780, wobble: 1.4 });
    const ecx = LOG0[0] + lnx * 20, ecy = LOG0[1] + lny * 20;
    const endPts = ellPts(ecx, ecy, 13, 23, 781, 18, 0.06);
    sk.poly(logG, endPts, { fill: P.fog, stroke: INK, width: 3, seed: 782, wobble: 0.6 });
    for (let k = 1; k <= 3; k++) sk.poly(logG, ellPts(ecx + 1, ecy + 1, 13 * k / 4, 23 * k / 4, 783 + k, 14, 0.05), { fill: "none", stroke: P.steel, width: 1.3, seed: 786 + k, double: false, wobble: 0.4 });
    sk.line(logG, ecx + 1, ecy + 1, ecx + 8, ecy - 14, { stroke: P.slate, width: 1.4, seed: 790, double: false, wobble: 0.3 }); // check crack
    swordFern(logG, LOG0[0] - 30, LOG0[1] + 64, 40, 791, { fill: MOSS, stroke: LD, rib: LD, width: 1.1, ribW: 1.6, fronds: 8 });
    swordFern(logG, LOG0[0] + 50, LOG0[1] + 70, 34, 792, { fill: LM, stroke: LD, rib: LD, width: 1.1, ribW: 1.6, fronds: 7 });
    const log = { g: logG, x0: LOG0[0], y0: LOG0[1], x1: LOG1[0], y1: LOG1[1] };

    // ================================================================== MID TRUNKS (on the walls)
    const trunksG = el("g", { class: "rc-trunks" }, g);
    trunk(trunksG, 548, 708, -30, 44, 32, { seed: 800, fill: LD, width: 3, furrow: INK, flare: 10, mossSide: true });
    trunk(trunksG, 336, 738, -30, 48, 38, { seed: 810, kind: "alder", fill: P.mist, width: 3, lean: -14, flare: 8, shade: P.slate });
    trunk(trunksG, 1474, 696, -30, 46, 34, { seed: 820, fill: LD, width: 3, furrow: INK, flare: 10, mossSide: true });
    trunk(trunksG, 1644, 694, -30, 38, 28, { seed: 830, kind: "alder", fill: P.mist, width: 3, lean: 10, flare: 6, shade: P.slate });
    trunk(trunksG, 1200, 640, -30, 26, 20, { seed: 840, fill: LM, width: 2.5, furrow: LD, stroke: INK, flare: 6 });
    trunk(trunksG, 735, 640, -30, 24, 18, { seed: 850, kind: "alder", fill: P.fog, width: 2.5, lean: 8, flare: 4, shade: P.mist, mark: P.steel });

    // ================================================================== CANOPY
    const canopyG = el("g", { class: "rc-canopy" }, g);
    // back clumps (lighter) then front clumps (dark)
    [[620, 60, 120, 60], [820, 20, 100, 50], [1100, 10, 110, 46], [1600, 40, 120, 54], [300, 120, 150, 60]].forEach(([x, y, rx, ry], i) =>
      clump(canopyG, x, y, rx, ry, 900 + i * 11, { fill: LM, stroke: LD, width: 2, tick: MOSS }));
    [[-40, 70, 230, 120], [190, 10, 190, 100], [420, 50, 150, 80], [610, -10, 150, 70], [750, 70, 80, 40], [980, -40, 130, 60],
      [1200, -30, 100, 50], [1760, 20, 220, 110], [1930, 200, 140, 120], [1620, -30, 120, 60]].forEach(([x, y, rx, ry], i) =>
      clump(canopyG, x, y, rx, ry, 960 + i * 13, { fill: LD, stroke: INK, width: 3, tick: LM, lobes: 7 + (i % 4) }));
    // old-man's-beard lichen hanging from the canopy
    [[90, 170], [160, 120], [300, 150], [480, 120], [560, 80], [720, 100], [1650, 90], [1720, 120], [1860, 300], [1800, 160], [960, 16], [1180, 18]].forEach(([x, y], i) => {
      const len = 22 + Math.abs(hash(i + 1100)) * 36;
      for (let k = 0; k < 3; k++) sk.path(canopyG, [[x + k * 4, y], [x + k * 4 + 3, y + len * 0.5], [x + k * 4 - 2, y + len * (0.8 + k * 0.1)]], { stroke: P.fog, width: 1.4, seed: 1101 + i * 3 + k, wobble: 0.8, double: false, opacity: 0.9 });
    });
    // survey ribbon on a low branch on the right wall (faded, paper)
    sk.path(canopyG, [[1380, 560], [1420, 548], [1452, 552]], { stroke: INK, width: 3, seed: 1120, wobble: 0.6, double: false });
    sk.path(canopyG, [[1420, 549], [1424, 566], [1418, 590]], { stroke: P.paper, width: 4, seed: 1121, wobble: 1, double: false });
    sk.path(canopyG, [[1422, 549], [1432, 568], [1436, 586]], { stroke: P.fog, width: 3.5, seed: 1122, wobble: 1, double: false });

    // ================================================================== BANKS (forest floor)
    const banksG = el("g", { class: "rc-banks" }, g);
    const BANK_L = WALL_L_FOOT.slice(0, -1).concat(BED_L.map(([x, y]) => [x - 2, y])).concat([[-30, 1090]]);
    const BR = [[985, 598]].concat(WALL_R_FOOT.slice(1)).concat([[1960, 1090]]).concat(BED_R.slice().reverse());
    [BANK_L, BR].forEach((pts, i) => {
      sk.poly(banksG, pts, { fill: LM, stroke: INK, width: 3, seed: 1200 + i, wobble: 1 });
      const c = clipTo(banksG, pts);
      sk.hatch(c, -30, 590, 1990, 500, { gap: 8, angle: i ? 15 : 165, stroke: LD, width: 1.5, opacity: 0.55, seed: 1202 + i });
      for (let k = 0; k < 14; k++) {
        const yy = 720 + Math.abs(hash(k * 3 + i * 40)) * 220;
        const xx = i ? 1300 + Math.abs(hash(k * 7 + 1)) * 640 : -10 + Math.abs(hash(k * 5 + 2)) * 680;
        blob(c, xx, yy, 40 + Math.abs(hash(k + i * 7)) * 60, 8 + Math.abs(hash(k * 2 + i * 3)) * 10, 1210 + k + i * 30, MOSS, 0.75);
      }
      // needle litter + fallen twigs
      for (let k = 0; k < 70; k++) {
        const yy = 712 + Math.abs(hash(k * 1.7 + i * 20)) * 230, xx = i ? 1280 + Math.abs(hash(k * 2.3 + 5)) * 660 : -10 + Math.abs(hash(k * 3.1 + 9)) * 700;
        const l = 4 + Math.abs(hash(k + 1250)) * 10, a = hash(k * 4.4 + i) * 1.4;
        sk.line(c, xx, yy, xx + Math.cos(a) * l, yy + Math.sin(a) * l, { stroke: k % 4 ? LD : P.fog, width: 1.4, seed: 1260 + k + i * 100, wobble: 0.3, double: false, opacity: 0.85 });
      }
      // deep shade toward the walls and the camera corners
      sk.poly(c, i ? [[1300, 680], [1960, 660], [1960, 1090], [1700, 1090], [1500, 900]] : [[-30, 680], [640, 700], [420, 860], [300, 1090], [-30, 1090]],
        { fill: LD, stroke: "none", seed: 1290 + i, double: false, opacity: 0.45 });
    });
    // bank lips: the cut earth step down into the bed, with roots and the dry high-water wrack line
    function bankCut(edge, dir, seed) {
      const top = edge.map(([x, y], i) => { const s2 = 0.4 + (y - 598) / 490, w = (10 + 22 * Math.abs(Math.sin(i * 1.3 + seed))) * s2; return [x - dir * w, y - 6 * s2]; });
      const pts = top.concat(edge.slice().reverse());
      sk.poly(banksG, pts, { fill: P.storm, stroke: INK, width: 3, seed, wobble: 1.2 });
      sk.hatch(clipTo(banksG, pts), Math.min(...pts.map((p) => p[0])) - 10, 590, 820, 500, { gap: 6, angle: dir > 0 ? 70 : 110, stroke: INK, width: 1.3, opacity: 0.5, seed: seed + 1 });
      for (let i = 2; i < edge.length - 1; i++) {
        const [x, y] = top[i], s2 = 0.4 + (y - 598) / 490;
        if (hash(seed + i * 3) > 0.15) { // an exposed root curling out of the cut, with hair rootlets
          const pts2 = [[x - dir * 6, y], [x + dir * 10 * s2, y + 8 * s2], [x + dir * 18 * s2, y + 22 * s2], [x + dir * 14 * s2, y + 34 * s2]];
          root(banksG, pts2, 6 * s2 + 2, seed + 10 + i, LD);
          for (let k = 0; k < 3; k++) sk.line(banksG, pts2[2][0], pts2[2][1], pts2[2][0] + dir * (k - 1) * 5 * s2, pts2[2][1] + (10 + k * 4) * s2, { stroke: INK, width: 1, seed: seed + 60 + i * 4 + k, double: false, wobble: 0.4 });
        }
        // wrack: dry twigs + leaves stranded along the old waterline
        for (let k = 0; k < 3; k++) {
          const wx = x + dir * (4 + k * 9 + hash(seed + i + k) * 4) * s2, wy = y + (4 + k * 2) * s2;
          sk.line(banksG, wx - 6 * s2, wy, wx + 7 * s2, wy - 2 * s2 * hash(i + k), { stroke: P.fog, width: 1.4, seed: seed + 40 + i * 5 + k, double: false, wobble: 0.3, opacity: 0.9 });
        }
      }
    }
    bankCut(BED_L, 1, 1300);
    bankCut(BED_R, -1, 1360);

    // ================================================================== CREEK BED (dry, rocky)
    const creekG = el("g", { class: "rc-creek" }, g);
    const BED = BED_L.concat(BED_R.slice().reverse());
    sk.poly(creekG, BED, { fill: P.fog, stroke: INK, width: 3, seed: 1400, wobble: 1 });
    const bedC = clipTo(creekG, BED);
    // gravel speckle
    for (let i = 0; i < 520; i++) {
      const y = 600 + Math.pow(Math.abs(hash(i * 1.37 + 3)), 0.8) * 480;
      const x0 = bedLeftX(y), x1 = bedRightX(y), x = x0 + (x1 - x0) * (0.5 + 0.5 * hash(i * 2.71 + 9));
      const s = 0.5 + (y - 600) / 300;
      el("circle", { cx: f1(x), cy: f1(y), r: f1(Math.max(0.8, s * (0.8 + Math.abs(hash(i)) * 1.2))), fill: i % 3 ? P.mist : P.steel, opacity: 0.8 }, bedC);
    }
    // damp band hugging the trickle (darker sand)
    const tr = []; for (let y = 598; y <= 1090; y += 10) tr.push([trickleX(y), y]);
    sk.path(bedC, tr, { stroke: P.mist, width: 34, seed: 1410, wobble: 1, double: false, opacity: 0.6 });
    sk.path(bedC, tr, { stroke: P.steel, width: 14, seed: 1411, wobble: 1.5, double: false, opacity: 0.5 });
    // cracked dried mud patches
    [[860, 790, 60, 16], [1150, 760, 46, 12], [800, 990, 90, 24]].forEach(([cx, cy, rx, ry], i) => {
      const pts = ellPts(cx, cy, rx, ry, 1420 + i, 12, 0.15);
      sk.poly(bedC, pts, { fill: DL, stroke: "none", seed: 1421 + i, double: false, opacity: 0.85 });
      const cc = clipTo(bedC, pts);
      const NX = 7, NY = 3, V = [];
      for (let a = 0; a <= NX; a++) { V.push([]); for (let b = 0; b <= NY; b++) V[a].push([cx - rx + (2 * rx * a) / NX + hash(i * 50 + a * 7 + b) * rx / NX * 0.45, cy - ry + (2 * ry * b) / NY + hash(i * 60 + a * 3 + b * 11) * ry / NY * 0.7]); }
      for (let a = 0; a <= NX; a++) for (let b = 0; b <= NY; b++) {
        if (a < NX) sk.line(cc, V[a][b][0], V[a][b][1], V[a + 1][b][0], V[a + 1][b][1], { stroke: P.steel, width: 1.1, seed: 1430 + a * 5 + b + i * 70, double: false, wobble: 1 });
        if (b < NY && (a + b + i) % 4 !== 0) sk.line(cc, V[a][b][0], V[a][b][1], V[a][b + 1][0], V[a][b + 1][1], { stroke: P.steel, width: 1.1, seed: 1460 + a * 5 + b + i * 70, double: false, wobble: 1 });
      }
    });
    // cobbles, sized by depth, avoiding the trickle and the lip
    const stoneFills = [P.fog, DL, P.paper, P.mist, DL, P.fog];
    for (let i = 0; i < 260; i++) {
      const t = Math.abs(hash(i * 3.3 + 1)), y = 606 + Math.pow(t, 0.9) * 470;
      const x0 = bedLeftX(y), x1 = bedRightX(y), x = x0 + 8 + (x1 - x0 - 16) * (0.5 + 0.5 * hash(i * 5.9 + 4));
      const s = 0.25 + (y - 600) / 340;
      const rx = s * (7 + Math.abs(hash(i * 7.7)) * 16), ry = rx * (0.5 + 0.12 * hash(i));
      if (Math.abs(x - trickleX(y)) < rx + 6 * s) continue;
      if (y > 796 && y < 890 && x > 920 && x < 1170) continue;
      const fill = Math.abs(x - trickleX(y)) < rx + 24 * s ? (i % 2 ? P.mist : P.steel) : stoneFills[i % stoneFills.length];
      cobble(bedC, x, y, rx, ry, 1500 + i, fill, y < 940);
    }
    // a few bigger dry boulders + a bleached snag stranded in the bed
    const snag = [[862, 700], [884, 690], [1000, 668], [1060, 660], [1066, 670], [1004, 682], [890, 708]];
    sk.poly(bedC, snag, { fill: DL, stroke: INK, width: 3, seed: 1700, wobble: 0.6 });
    for (let k = 0; k < 3; k++) sk.line(bedC, 880 + k * 6, 698 - k * 1, 1050, 666 + k * 1.5, { stroke: P.steel, width: 1.3, seed: 1701 + k, double: false, wobble: 0.6 });
    sk.poly(bedC, [[930, 688], [912, 660], [900, 648], [906, 646], [920, 658], [940, 684]], { fill: DL, stroke: INK, width: 2, seed: 1705, wobble: 0.3, double: false });
    sk.poly(bedC, [[1010, 674], [1024, 652], [1036, 640], [1040, 644], [1030, 656], [1020, 676]], { fill: DL, stroke: INK, width: 2, seed: 1706, wobble: 0.3, double: false });
    sk.poly(bedC, ellPts(1064, 665, 7, 6, 1707, 10, 0.1), { fill: P.fog, stroke: INK, width: 2, seed: 1708, double: false });
    // shade on the bed: the left wall/canopy shadow (the dapple comes back on top in lightG)
    sk.poly(bedC, [[600, 590], [960, 590], [900, 700], [800, 820], [740, 980], [700, 1090], [540, 1090]], { fill: LD, stroke: "none", seed: 1710, double: false, opacity: 0.32 });
    sk.poly(bedC, [[1100, 700], [1300, 720], [1480, 1090], [1240, 1090], [1170, 880]], { fill: LD, stroke: "none", seed: 1711, double: false, opacity: 0.22 });
    const shadeB = []; for (let x = 200; x <= 1800; x += 20) shadeB.push([x, 985 + Math.sin(x * 0.011) * 14 + Math.sin(x * 0.029 + 1) * 6]);
    sk.poly(bedC, shadeB.concat([[1800, 1100], [200, 1100]]), { fill: LD, stroke: "none", seed: 1712, wobble: 0, double: false, opacity: 0.3 });

    // ---- the trickle + tiny pools
    const waterG = el("g", { class: "rc-water" }, creekG);
    const tUp = TRICKLE.filter((p) => p[1] <= LIP.y + 0.1), tDn = TRICKLE.filter((p) => p[1] >= LIP.poolY - 2);
    const POOLS = [{ x: 950, y: 640, rx: 10 }, { x: 948, y: 712, rx: 16 }, { x: 990, y: 778, rx: 20 }, { x: 1006, y: 928, rx: 34 }, { x: 991, y: 1010, rx: 40 }];
    [tUp, tDn].forEach((pts, i) => {
      sk.path(waterG, pts, { stroke: P.steel, width: i ? 8 : 6, seed: 1720 + i, wobble: 0.8, double: false, step: 12 });
      sk.path(waterG, pts, { stroke: P.paper, width: i ? 4 : 3, seed: 1722 + i, wobble: 0.8, double: false, step: 12 });
    });
    POOLS.forEach((p, i) => {
      const ry = p.rx * 0.28;
      sk.poly(waterG, ellPts(p.x, p.y, p.rx, ry, 1730 + i, 12, 0.12), { fill: P.mist, stroke: P.steel, width: p.rx > 20 ? 2.5 : 1.6, seed: 1731 + i, wobble: 0.5, double: false });
      sk.poly(waterG, ellPts(p.x - p.rx * 0.15, p.y - ry * 0.2, p.rx * 0.6, ry * 0.45, 1740 + i, 10, 0.1), { fill: P.paper, stroke: "none", seed: 1741 + i, double: false, opacity: 0.9 });
      if (p.rx > 18) sk.line(waterG, p.x + p.rx * 0.2, p.y + ry * 0.3, p.x + p.rx * 0.6, p.y + ry * 0.2, { stroke: P.paper, width: 1.4, seed: 1745 + i, double: false, wobble: 0.3 });
    });

    // ================================================================== THE MOSSY LIP (hero close-up)
    const lipG = el("g", { class: "rc-lip" }, creekG);
    const LT = [[938, 856], [944, 842], [958, 832], [982, 826], [1008, 823], [1028, 825], [1040, 830], [1050, 827], [1068, 822], [1094, 823], [1116, 829], [1134, 838], [1146, 852]];
    const LB = [[1150, 866], [1136, 869], [1110, 871], [1080, 869], [1058, 870], [1040, 868], [1020, 871], [994, 869], [966, 870], [946, 867], [936, 862]];
    // the upper bed shelf behind the lip (wet-dark sand where the trickle arrives)
    sk.poly(lipG, [[944, 836], [980, 812], [1040, 804], [1110, 810], [1146, 834]], { fill: P.mist, stroke: "none", seed: 1800, double: false, opacity: 0.7 });
    const faceP = LT.concat(LB);
    sk.poly(lipG, faceP, { fill: P.slate, stroke: INK, width: 3.5, seed: 1801, wobble: 0.8 });
    const fc = clipTo(lipG, faceP);
    // strata + cracks on the stone face
    for (let k = 0; k < 2; k++) sk.path(fc, [[930, 846 + k * 11], [960, 836 + k * 9 + 2], [1040, 838 + k * 8], [1120, 836 + k * 9], [1150, 848 + k * 11]], { stroke: P.storm, width: 1.4, seed: 1810 + k, wobble: 1.2, double: false });
    [[968, 834, 6, 30], [1100, 830, -4, 34], [1124, 836, 3, 28]].forEach(([x, y, dx, h], k) => sk.path(fc, [[x, y], [x + dx * 0.5, y + h * 0.5], [x + dx, y + h]], { stroke: INK, width: 1.6, seed: 1820 + k, wobble: 0.6, double: false }));
    // wet streak where the water runs down the face (darker, glossy)
    sk.poly(fc, [[1028, 826], [1052, 826], [1058, 870], [1024, 870]], { fill: P.storm, stroke: "none", seed: 1830, double: false, opacity: 0.85 });
    sk.line(fc, 1051, 832, 1054, 864, { stroke: P.mist, width: 1.3, seed: 1831, double: false, wobble: 0.4 });
    sk.line(fc, 1029, 834, 1027, 862, { stroke: P.mist, width: 1.2, seed: 1832, double: false, wobble: 0.4 });
    sk.hatch(fc, 930, 850, 230, 30, { gap: 6, angle: 120, stroke: INK, width: 1, opacity: 0.25, seed: 1833 });
    // moss cushions on the lip (split by the water notch) with fringe hanging over the face
    function lipMoss(x0, x1, seed) {
      const top = [], bot = [];
      for (let i = 0; i <= 10; i++) {
        const x = x0 + ((x1 - x0) * i) / 10, ly = yAtX(LT, x);
        top.push([x, ly - 4 - (5 + Math.abs(hash(seed + i)) * 5) * Math.sqrt(Math.sin((i / 10) * Math.PI)) - (i % 2 ? 2 : 0)]);
        bot.push([x, ly + 5 + (i % 2 ? 4 + Math.abs(hash(seed + i * 3)) * 7 : 1)]);
      }
      const pts = top.concat(bot.reverse());
      sk.poly(lipG, pts, { fill: MOSS, stroke: LD, width: 2, seed, wobble: 0.8, double: false, step: 10 });
      mossTex(lipG, pts, seed + 1, 2.6);
      // fringe strands over the face
      for (let i = 0; i < 14; i++) {
        const x = x0 + 4 + ((x1 - x0 - 8) * i) / 13, ly = yAtX(LT, x) + 5, l = 4 + Math.abs(hash(seed + i * 7)) * 9;
        sk.line(lipG, x, ly, x + hash(seed + i) * 2, ly + l, { stroke: i % 2 ? MOSS : LM, width: 1.3, seed: seed + 20 + i, wobble: 0.3, double: false });
      }
      // sporophyte stalks (tiny capsules) — reads at 3x
      for (let i = 0; i < 6; i++) {
        const x = x0 + 12 + ((x1 - x0 - 24) * (i + 0.5 + hash(seed + i) * 0.3)) / 6, ly = yAtX(top, x) + 3, h = 6 + Math.abs(hash(seed + i * 2)) * 4, b = hash(seed + i * 5) * 3;
        sk.path(lipG, [[x, ly], [x + b * 0.4, ly - h * 0.6], [x + b, ly - h]], { stroke: LD, width: 0.8, seed: seed + 40 + i, wobble: 0.1, double: false, step: 100 });
        el("ellipse", { cx: f1(x + b), cy: f1(ly - h - 1), rx: 0.8, ry: 1.4, fill: MOSS, stroke: LD, "stroke-width": 0.6 }, lipG);
      }
      // a highlight along the sunny top of the cushion
      sk.path(lipG, top.slice(2, 8).map(([x, y]) => [x, y + 2.5]), { stroke: DL, width: 1.6, seed: seed + 60, wobble: 0.4, double: false, opacity: 0.8 });
    }
    lipMoss(946, 1032, 1840);
    lipMoss(1049, 1142, 1870);
    // gravel heaped at the foot of the step
    for (let i = 0; i < 18; i++) {
      const x = 942 + i * 12 + hash(i + 1880) * 4;
      if (Math.abs(x - 1043) < 40) continue;
      cobble(lipG, x, yAtX(LB.slice().reverse(), x) + 1 + Math.abs(hash(i + 1881)) * 3, 3 + Math.abs(hash(i + 1882)) * 3.5, 2 + Math.abs(hash(i + 1883)) * 1.5, 1884 + i, [P.fog, DL, P.mist][i % 3], false);
    }
    // the trickle arriving at the notch and the falling strand
    sk.path(lipG, [[1026, 812], [1034, 820], [1040, 829]], { stroke: P.steel, width: 6, seed: 1900, double: false, wobble: 0.3, step: 6 });
    sk.path(lipG, [[1026, 812], [1034, 820], [1040, 829]], { stroke: P.paper, width: 3, seed: 1901, double: false, wobble: 0.3, step: 6 });
    const strand = [[1040, 829], [1043, 836], [1045, 846], [1045, 856], [1044, 866]];
    sk.path(lipG, strand, { stroke: P.mist, width: 6, seed: 1902, double: false, wobble: 0.2, step: 5, opacity: 0.8 });
    sk.path(lipG, strand, { stroke: P.paper, width: 3, seed: 1903, double: false, wobble: 0.2, step: 5 });
    sk.path(lipG, strand.map(([x, y]) => [x - 1.2, y]), { stroke: P.ink, width: 0.9, seed: 1904, double: false, wobble: 0.2, step: 5, opacity: 0.5 });
    // the pool under the fall, rings + splash
    sk.poly(lipG, [[996, 872], [1010, 864], [1080, 863], [1094, 872], [1070, 880], [1010, 880]], { fill: P.steel, stroke: "none", seed: 1910, double: false, opacity: 0.55 });
    sk.poly(lipG, ellPts(1043, LIP.poolY, 32, 7.5, 1911, 14, 0.08), { fill: P.mist, stroke: P.slate, width: 1.8, seed: 1912, double: false, wobble: 0.3 });
    sk.poly(lipG, ellPts(1036, LIP.poolY - 1, 18, 3.5, 1913, 12, 0.08), { fill: P.paper, stroke: "none", seed: 1914, double: false, opacity: 0.85 });
    [[10, 2.4], [18, 4.2]].forEach(([rx, ry], k) => sk.poly(lipG, ellPts(1044, LIP.poolY, rx, ry, 1915 + k, 14, 0.04), { fill: "none", stroke: P.paper, width: 1.1, seed: 1916 + k, double: false, wobble: 0.2 }));
    [[1036, 860, 1.6], [1052, 858, 1.4], [1049, 852, 1.1], [1033, 856, 1.0], [1056, 863, 1.2]].forEach(([x, y, r]) => el("circle", { cx: x, cy: y, r, fill: P.paper, stroke: P.steel, "stroke-width": 0.6 }, lipG));
    // water strider on the pool (4 legs + body)
    sk.line(lipG, 1062, 868, 1068, 867, { stroke: INK, width: 1.6, seed: 1920, double: false, wobble: 0.1 });
    [[1062, 868, 1055, 864], [1062, 868, 1056, 872], [1068, 867, 1076, 863], [1068, 867, 1075, 871]].forEach(([a, b, c, d], k) => sk.line(lipG, a, b, c, d, { stroke: INK, width: 0.8, seed: 1921 + k, double: false, wobble: 0.1 }));
    // pebbles round the pool
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + 0.2, x = 1043 + Math.cos(a) * (40 + Math.abs(hash(i + 1930)) * 18), y = LIP.poolY + 3 + Math.sin(a) * (10 + Math.abs(hash(i + 1931)) * 4);
      if (y < LIP.poolY - 2) continue;
      cobble(lipG, x, y, 3 + Math.abs(hash(i + 1932)) * 4, 2 + Math.abs(hash(i + 1933)) * 2, 1934 + i, [P.fog, P.mist, DL, P.steel][i % 4], false);
    }
    // fiddlehead + a little fern in the face crack (left), a dry alder leaf + twig on the lip (right)
    swordFern(lipG, 952, 850, 22, 1950, { fill: LM, stroke: INK, rib: INK, width: 0.9, ribW: 1.2, fronds: 5, spread: 60 });
    sk.path(lipG, [[972, 830], [973, 818], [978, 812], [982, 814], [980, 818], [976, 817]], { stroke: LD, width: 1.8, seed: 1960, double: false, wobble: 0.1, step: 100 });
    const leaf = [[1096, 818], [1108, 811], [1122, 812], [1126, 819], [1114, 824]];
    sk.poly(lipG, leaf, { fill: P.mist, stroke: INK, width: 1.4, seed: 1961, double: false, wobble: 0.2 });
    sk.line(lipG, 1096, 818, 1124, 816, { stroke: P.slate, width: 1, seed: 1962, double: false, wobble: 0.1 });
    for (let k = 0; k < 3; k++) sk.line(lipG, 1102 + k * 7, 817.5, 1106 + k * 7, 812 + k * 0.5, { stroke: P.slate, width: 0.8, seed: 1963 + k, double: false, wobble: 0.1 });
    sk.path(lipG, [[1054, 818], [1072, 812], [1090, 806]], { stroke: P.storm, width: 2.4, seed: 1970, double: false, wobble: 0.3 });
    sk.line(lipG, 1068, 813, 1072, 805, { stroke: P.storm, width: 1.6, seed: 1971, double: false, wobble: 0.2 });
    // deer slot (two-toed print) in the damp sand right of the pool, + a second one
    [[1100, 888, 0], [1128, 902, 1]].forEach(([x, y, k]) => {
      sk.poly(lipG, [[x - 5, y + 6], [x - 6, y - 2], [x - 2, y - 7], [x - 1, y + 5]], { fill: P.steel, stroke: P.slate, width: 1.2, seed: 1980 + k * 3, double: false, wobble: 0.2 });
      sk.poly(lipG, [[x + 1, y + 5], [x + 2, y - 7], [x + 6, y - 2], [x + 5, y + 6]], { fill: P.steel, stroke: P.slate, width: 1.2, seed: 1981 + k * 3, double: false, wobble: 0.2 });
    });
    const detail = { g: lipG, x: 1040, y: 846 };

    // ================================================================== SIT-ABLE MOSSY BOULDERS + bank ferns
    const nearG = el("g", { class: "rc-near" }, g);
    swordFern(nearG, 240, 836, 90, 2000, { fill: LM, stroke: INK, rib: INK, width: 1.4, ribW: 2.2, fronds: 11 });
    swordFern(nearG, 520, 770, 60, 2010, { fill: MOSS, stroke: INK, rib: INK, width: 1.3, ribW: 2, fronds: 9 });
    swordFern(nearG, 1470, 790, 64, 2020, { fill: MOSS, stroke: INK, rib: INK, width: 1.3, ribW: 2, fronds: 9 });
    swordFern(nearG, 1690, 846, 96, 2030, { fill: LM, stroke: INK, rib: INK, width: 1.4, ribW: 2.2, fronds: 11 });
    swordFern(nearG, 420, 735, 44, 2040, { fill: MOSS, stroke: LD, rib: LD, width: 1.2, ribW: 1.8, fronds: 9 });
    swordFern(nearG, 1600, 724, 46, 2050, { fill: MOSS, stroke: LD, rib: LD, width: 1.2, ribW: 1.8, fronds: 9 });
    [[0.18, -1, 26], [0.34, -1, 34], [0.62, -1, 48], [0.9, -1, 64], [0.26, 1, 30], [0.46, 1, 40], [0.74, 1, 56], [0.97, 1, 70]].forEach(([t, side, w], i) => {
      const y = 598 + t * 494, x = side < 0 ? bedLeftX(y) + 6 : bedRightX(y) - 6;
      if (y < 930) mossyRock(nearG, x, y + w * 0.2, w, w * 0.62, 2060 + i * 9, { fill: i % 2 ? P.steel : P.mist, width: w > 40 ? 3.5 : 2.5, capDepth: 0.4 });
      else cobble(nearG, x, y, w, w * 0.5, 2060 + i * 9, P.steel, false);
    });
    const rocks = [];
    [[372, 852, 82, 62, 2100, P.steel], [1572, 849, 90, 66, 2120, P.steel], [690, 884, 50, 38, 2140, P.fog]].forEach(([x, gy, w, h, seed, fill], i) => {
      const rg = mossyRock(nearG, x, gy, w, h, seed, { fill, capDepth: i === 2 ? 0.3 : 0.5 });
      rocks.push({ x, y: Math.round(gy - h), r: w, groundY: gy, g: rg });
    });
    // spider web between the right fern and the boulder (catching the light)
    const wc = [1660, 776];
    for (let k = 0; k < 7; k++) { const a = -Math.PI * 0.9 + k * 0.4; sk.line(nearG, wc[0], wc[1], wc[0] + Math.cos(a) * 34, wc[1] + Math.sin(a) * 30, { stroke: P.paper, width: 0.9, seed: 2160 + k, double: false, wobble: 0.2, opacity: 0.8 }); }
    for (let r = 10; r < 32; r += 7) sk.path(nearG, [[wc[0] - r, wc[1] - r * 0.3], [wc[0] - r * 0.4, wc[1] - r * 0.9], [wc[0] + r * 0.5, wc[1] - r * 0.85], [wc[0] + r, wc[1] - r * 0.2]], { stroke: P.paper, width: 0.8, seed: 2170 + r, double: false, wobble: 0.3, opacity: 0.7 });

    // ================================================================== NEAR TRUNKS (framing, out of frame)
    const nearT = el("g", { class: "rc-near-trunks" }, g);
    // left: huge Douglas-fir, dark furrowed bark, roots onto the bank
    [[[150, 896], [220, 902], [290, 914], [350, 934]], [[160, 906], [220, 930], [262, 962]], [[20, 904], [-10, 930]]].forEach((pts, i) => root(nearT, pts, 30 - i * 6, 2200 + i, P.storm));
    trunk(nearT, 92, 905, -40, 172, 150, { seed: 2210, fill: P.night, furrow: P.storm, flare: 40, width: 4.5, mossSide: true, baseMoss: 40 });
    // right: big red alder, pale lichen-blotched bark
    [[[1790, 902], [1730, 910], [1676, 928], [1630, 950]], [[1800, 912], [1760, 936], [1740, 966]]].forEach((pts, i) => root(nearT, pts, 26 - i * 6, 2220 + i, P.slate));
    trunk(nearT, 1838, 910, -40, 132, 116, { seed: 2230, kind: "alder", fill: P.steel, blotch: [P.mist, MOSS, P.fog, P.mist], blotchOp: 0.5, blotchArea: 3200, flare: 30, width: 4.5, lean: 8, shade: P.slate, mark: P.storm, baseMoss: 34 });
    // low fir boughs hanging in from the left trunk + alder leaves in from the right
    function bough(x0, y0, len, dir, seed) {
      const bg = el("g", {}, nearT);
      const pts = [];
      for (let i = 0; i <= 8; i++) { const t = i / 8; pts.push([x0 + dir * len * t, y0 + Math.sin(t * Math.PI * 0.8) * len * 0.18 + t * len * 0.08]); }
      sk.path(bg, pts, { stroke: INK, width: 5, seed, wobble: 1 });
      for (let i = 1; i < pts.length; i++) {
        const [px, py] = pts[i], l = 40 * (1 - i / 10);
        for (let k = -2; k <= 2; k++) sk.line(bg, px, py, px + dir * (6 + k * 4), py + l * (0.6 + k * 0.12), { stroke: LD, width: 3, seed: seed + i * 5 + k, wobble: 0.6, double: false });
      }
      return bg;
    }
    bough(150, 230, 260, 1, 2300);
    bough(150, 330, 180, 1, 2320);
    bough(1790, 250, 230, -1, 2340);
    bough(1790, 340, 150, -1, 2360);
    // foreground corner ferns in deep shade (silhouettes; low detail in the caption band)
    swordFern(nearT, 330, 1060, 150, 2400, { fill: LD, stroke: INK, rib: INK, width: 1.5, ribW: 2.5, fronds: 9, spread: 70 });
    swordFern(nearT, 1610, 1070, 160, 2420, { fill: LD, stroke: INK, rib: INK, width: 1.5, ribW: 2.5, fronds: 9, spread: 70 });

    // ================================================================== LIGHT (shafts + dapple) — lightG
    const lightG = el("g", { class: "rc-light" }, g);
    const shafts = [], dapples = [];
    [[[870, 110], [940, 110], [800, 890], [690, 890], 0.16], [[1385, 70], [1440, 70], [1235, 900], [1150, 900], 0.14],
      [[1005, 130], [1030, 130], [930, 770], [885, 770], 0.12], [[1555, 70], [1600, 70], [1450, 780], [1380, 780], 0.11],
      [[1120, 40], [1150, 40], [1050, 620], [1010, 620], 0.09]].forEach(([a, b, c, d, op], i) => {
      const sg = el("g", { class: "rc-shaft" }, lightG);
      sk.poly(sg, [a, b, c, d], { fill: DL, stroke: "none", seed: 2500 + i, wobble: 0, double: false, opacity: op });
      sk.poly(sg, [[a[0] + (b[0] - a[0]) * 0.35, a[1]], [a[0] + (b[0] - a[0]) * 0.6, a[1]], [d[0] + (c[0] - d[0]) * 0.6, c[1]], [d[0] + (c[0] - d[0]) * 0.4, c[1]]],
        { fill: P.paper, stroke: "none", seed: 2510 + i, wobble: 0, double: false, opacity: op * 0.9 });
      shafts.push(sg);
    });
    const DAP = [
      // ground: banks
      [330, 790, 54, 10, 0.7], [520, 760, 34, 7, 0.65], [190, 990, 80, 14, 0.4], [600, 880, 40, 8, 0.6], [80, 760, 40, 8, 0.6], [400, 900, 30, 6, 0.6],
      [1520, 765, 54, 10, 0.65], [1680, 870, 66, 12, 0.6], [1380, 905, 46, 9, 0.6], [1760, 760, 40, 8, 0.6], [1300, 730, 26, 5, 0.6],
      // bed
      [880, 735, 40, 8, 0.6], [770, 905, 70, 14, 0.5], [1180, 950, 90, 16, 0.4], [1250, 800, 40, 8, 0.5], [960, 650, 22, 5, 0.6], [820, 1030, 80, 14, 0.3],
      // the lip (close-up spot)
      [1070, 832, 36, 9, 0.6], [985, 860, 22, 5, 0.5],
      // walls
      [400, 520, 40, 16, 0.6], [250, 430, 30, 12, 0.6], [640, 590, 36, 10, 0.6], [1350, 480, 40, 14, 0.6], [1560, 560, 36, 12, 0.6], [1290, 300, 30, 10, 0.55], [700, 330, 26, 10, 0.5],
      // trunks (narrow, vertical)
      [150, 520, 12, 46, 0.55], [128, 720, 10, 30, 0.5], [1800, 600, 14, 50, 0.55], [1830, 380, 12, 32, 0.5], [344, 520, 8, 26, 0.6], [1650, 470, 8, 24, 0.55], [1480, 300, 8, 22, 0.5],
      // log top + boulder caps
      [900, 418, 34, 6, 0.6], [1090, 398, 24, 5, 0.6], [452, 800, 30, 8, 0.55], [1470, 790, 34, 8, 0.55],
    ];
    DAP.forEach(([x, y, rx, ry, op], i) => {
      const dg = el("g", { class: "rc-dapple" }, lightG);
      fleck(dg, x, y, rx * 0.7, ry * 0.8, 2600 + i * 7, op);
      dapples.push(dg);
    });

    return {
      g,
      groundY,
      footY: 874,
      creek: { g: creekG, x0: Math.round(bedLeftX(874)), x1: Math.round(bedRightX(874)), y: 874, trickleX, bedLeftX, bedRightX, pools: POOLS.map((p) => ({ x: p.x, y: p.y, rx: p.rx })), waterG },
      lip: { x: LIP.x, y: LIP.y, poolY: LIP.poolY, jugY: LIP.jugY, drop: LIP.poolY - LIP.y - 2, g: lipG },
      rocks,
      topEdge,
      ridgeRoad,
      log,
      skyG,
      lightG,
      shafts,
      dapples,
      shadowDir: { dx: SHADOW.dx, dy: SHADOW.dy },
      detail,
      walls: { g: wallsG },
      far: { g: farG },
      canopy: { g: canopyG },
      trunksG: { g: trunksG },
    };
  };
})();
