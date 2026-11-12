/* Rainy Day background — loggingRoad, v1 (Episode 5, DAY 9, GOLDEN HOUR).
 * The steep old logging road back to camp: a gravel road climbing left→right/up across a cut-over hillside
 * (stumps with long shadows, slash piles, young firs, dead snags on the ridge, dry grass), tire ruts with a
 * grassy centre hump, water bars, a rusted steel pipe gate swung open at left, an old-growth stump with a
 * springboard notch beside the road (Mags sits on it), a corrugated culvert outlet in the downhill bank, a
 * hand-lettered cardboard "CAMP →" sign at the crest where a side track branches up into the uncut timber.
 * The low sun has just dropped BEHIND the ridge at upper right: rim light on the skyline, long pale-amber shafts
 * (goldLight) fanning down-left across the slope and the road, dust hanging in them, long goldShadow shadows to
 * the lower left. At far left the land falls away to a view of the bay in gold haze.
 * Light is pale amber only — nothing here is anywhere near the slicker yellow.
 *
 * Paste VERBATIM after assets/characters/rainy-day-rig-v3.js. Usage:
 *   const bg = window.RainyDayBG.loggingRoad(svgLayerG, {});               // default view
 *   const y = bg.roadY(960);                                              // ground y under x → feet go there
 *   RD.figure(layer, { character: "drizzle", x: 960, y: y - 116 * 1.4, scale: 1.4 });
 *   RD.figure(layer, { character: "mags", x: bg.stump.x, y: bg.stump.seatY - 96 * 1.4, scale: 1.4, pose: "sit" });
 *   gsap.to(bg.lightG, { opacity: 0.6 })                                  // fade the shafts as the sun goes
 *   const W = window.RainyDayBG.loggingRoad(svgLayerG, { view: "wide" });  // the long zig-zag, figures TINY
 *   const p = W.roadPathWide(0.3);                                        // {x, y, leg, facing}
 *
 * Opts (all optional):
 *   view  — "default" | "wide". "wide" = a much wider, higher view of the same hillside: the road a long
 *           zig-zag of five legs with hairpins, figures tiny (scale ~0.2, see figScale).
 *   light — "golden" (default and only light of this location; any other value falls back to "golden").
 *
 * HANDLES — DEFAULT VIEW (returned object):
 *   g          — root <g>.  view: "default".  light: "golden".
 *   groundY    — 945: road foot line at the left edge (use roadY(x) for anything on the slope).
 *   roadY(x)   — ground y of the road foot line at x (smooth, clamped 0..1920). Feet sit exactly on it.
 *                (0, 945) → (350, 905) → (700, 845) → (1000, 780) → (1300, 700) → (1560, 615) → crest (1760, ~558)
 *                → (1920, 545). The gravel tread spans roadY(x) − 64 (back/uphill edge) … roadY(x) + 40 (front).
 *   roadPoints — [[x, y], ...] the foot line every 20 px, x 0..1920.
 *   road       — { g, back: 64, front: 40, x0: 0, y0, x1: 1920, y1 }.
 *   stump      — { g, x: 1200, y, seatY, w } the big old-growth stump on the uphill edge; y = its base, seatY = the
 *                cut top where a figure sits (sit pose: figure y = seatY − 96*scale).
 *   gate       — { g, x: 330, y, armY, x0 } rusted pipe gate swung open along the uphill edge: x/y = hinge post
 *                base, armY = height of the swing arm, x0 = the arm's free (latch) end.
 *   crest      — { x: 1760, y } top of the climb on the road (the grade levels out; the road runs on to camp at right).
 *   sideRoad   — { g, x: 1820, y, points, x0, y0, x1, y1 } a narrow dirt track branching off the uphill side at the
 *                crest and running up-right into the uncut timber. x/y = a foot point on it (a walking-away figure
 *                at ~scale 0.75 there); points = its centre line from the junction (x0,y0) to where it vanishes (x1,y1).
 *   sign       — { g, x, y } the cardboard "CAMP →" sign on a stake at the crest (x/y = card centre).
 *   culvert    — { g, x: 1480, y } corrugated culvert outlet in the downhill bank (x/y = mouth centre).
 *   hill       — { g } the cut-over slope + ridge + timber.  bay — { g } the distant bay view at far left.
 *   sun        — { x, y } where the sun sits behind the ridge (origin of the shafts).
 *   skyG       — sky group.
 *   lightG     — group of light overlays (sun bloom, shafts, dust motes, dust haze) — scenes may animate its opacity/
 *                position. shafts = [g, ...] the individual shafts (each its own <g>, e.g. to drift or flicker),
 *                dust = { g } the motes + haze.
 *   shadowDir  — { dx: -0.94, dy: 0.34 } direction cast shadows fall (lower left), unit-ish.
 *   detail     — { g, x: 872, y } the hero close-up: a drying rut puddle (sky in it, cracked mud rim) and, next to it,
 *                the fresh dent in the gravel where a dropped water jug hit, with a wet splash stain running into
 *                the puddle and kicked-out pebbles. Drawn to read at scale ~3.
 *
 * HANDLES — WIDE VIEW (opts.view: "wide"):
 *   g, view: "wide", light, skyG, lightG, shafts, dust, shadowDir, sun, hill, bay  — as above.
 *   roadYWide(x, leg = 0) — ground y of the road foot line at x on leg `leg` (0 = the lowest, nearest leg … 4 = the top
 *                leg to the crest). The road is a zig-zag, so y is only a function of x per leg. roadY = roadYWide.
 *   legs       — [{ points, x0, x1, dir }] each leg's foot line (points in travel order, dir +1 = climbing to the
 *                right, -1 = to the left). Leg x ranges: 0: -40→1480, 1: 1480→530, 2: 530→1300, 3: 1300→760,
 *                4: 760→1460.
 *   roadPathWide(t) — { x, y, leg, facing } along the whole road, t 0 (bottom-left, off the gate) … 1 (crest),
 *                hairpins included; facing = ±1 for RD.figure. A tiny walker: figure y = p.y − 116*figScale.
 *   roadPointsWide — the whole path as [[x, y], ...].
 *   figScale   — 0.2, suggested figure scale on the wide road.
 *   groundY    — roadYWide(0, 0).
 *   gate       — { g, x, y, armY, x0 } (tiny, on leg 0).  crest — { x, y } (top of leg 4, just under the ridge).
 *   sideRoad   — { g, x, y, points, x0, y0, x1, y1 } (the track into the timber at the crest).
 *   detail     — null (the close-up belongs to the default view).
 */
(function () {
  window.RainyDayBG = window.RainyDayBG || {};
  if (window.RainyDayBG.loggingRoad) return;
  let instance = 0;

  window.RainyDayBG.loggingRoad = function (parent, opts) {
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
    const C = { sky: EP5.goldSky, light: EP5.goldLight, shade: EP5.goldShadow, gravel: EP5.gravel, rust: EP5.rust, grass: EP5.dryGrass };
    const light = "golden"; // the only light of this location (opts.light accepted, falls back to golden)
    const WIDE = opts.view === "wide";
    const id = "rdlr" + (instance++) + "_";
    const f1 = (v) => (+v).toFixed(1);
    const frac = (n) => (hash(n) + 1) / 2;
    const g = el("g", { class: "rd-bg rd-bg-logging-road" + (WIDE ? " rd-bg-logging-road-wide" : "") }, parent);
    const defs = el("defs", {}, g);
    const shadowDir = { dx: -0.94, dy: 0.34 };

    function grad(name, stops, x2, y2) {
      const lg = el("linearGradient", { id: id + name, x1: 0, y1: 0, x2: x2 || 0, y2: y2 === undefined ? 1 : y2 }, defs);
      stops.forEach(([o, c, a]) => el("stop", { offset: o, "stop-color": c, "stop-opacity": a === undefined ? 1 : a }, lg));
      return "url(#" + id + name + ")";
    }
    function radial(name, cx, cy, r, stops) {
      const rg = el("radialGradient", { id: id + name, cx, cy, r, gradientUnits: "userSpaceOnUse" }, defs);
      stops.forEach(([o, c, a]) => el("stop", { offset: o, "stop-color": c, "stop-opacity": a === undefined ? 1 : a }, rg));
      return "url(#" + id + name + ")";
    }
    let clipN = 0;
    function clipTo(par, pts) {
      const cid = id + "clip" + (clipN++);
      const cp = el("clipPath", { id: cid }, defs);
      el("path", { d: "M" + pts.map((q) => f1(q[0]) + " " + f1(q[1])).join(" L") + " Z" }, cp);
      return el("g", { "clip-path": "url(#" + cid + ")" }, par);
    }

    // ------------------------------------------------------------------ geometry helpers
    function catmull(CP, per) {
      const out = [];
      for (let i = 1; i < CP.length - 2; i++) {
        const p0 = CP[i - 1], p1 = CP[i], p2 = CP[i + 1], p3 = CP[i + 2];
        for (let k = 0; k < per; k++) {
          const t = k / per, t2 = t * t, t3 = t2 * t;
          const cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
          out.push([cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1])]);
        }
      }
      out.push(CP[CP.length - 2]);
      return out;
    }
    function curve(pts, per) { // smooth an open polyline through all its points
      const a = pts[0], b = pts[1], y = pts[pts.length - 1], z = pts[pts.length - 2];
      return catmull([[2 * a[0] - b[0], 2 * a[1] - b[1]]].concat(pts, [[2 * y[0] - z[0], 2 * y[1] - z[1]]]), per || 16);
    }
    function yAt(pts, x) { // pts ascending in x
      if (x <= pts[0][0]) return pts[0][1];
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1];
        if (x >= a[0] && x <= b[0]) return a[1] + ((b[1] - a[1]) * (x - a[0])) / Math.max(0.001, b[0] - a[0]);
      }
      return pts[pts.length - 1][1];
    }

    // ------------------------------------------------------------------ drawing kits
    function castShadow(par, x, y, w, len, op, seed) { // long ground shadow from a base of width w at (x, y)
      const n = Math.hypot(shadowDir.dx, shadowDir.dy), ux = shadowDir.dx / n, uy = shadowDir.dy / n;
      const tip = 0.6;
      const pts = [[x + w * 0.5, y + 1], [x + w * 0.5 * tip + ux * len, y + uy * len + 1], [x - w * 0.5 * tip + ux * len * 0.97, y + uy * len * 0.97 - 1], [x - w * 0.5, y - 1]];
      return sk.poly(par, pts, { fill: C.shade, stroke: "none", seed: seed || 7, wobble: 0.6, double: false, opacity: op || 0.42 });
    }
    function fir(par, x, by, h, w, o) {
      const fg = el("g", {}, par);
      const seed = o.seed || 1, lw = o.width || LINE.main, stroke = o.stroke || INK;
      sk.poly(fg, [[x - w * 0.045, by + 4], [x - w * 0.018, by - h * 0.92], [x + w * 0.018, by - h * 0.92], [x + w * 0.045, by + 4]],
        { fill: o.trunk || P.night, stroke, width: lw * 0.7, seed: seed + 50, wobble: 1 });
      const tiers = o.tiers || Math.max(4, Math.round(h / 70));
      const side = o.rimSide || 1;
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
        if (o.rim) sk.path(fg, [[x + side * 2, ty - th + 3], [x + side * tw * 0.45, ty - th * 0.3 + 2], [x + side * (tw - 3), ty + th * 0.14]],
          { stroke: o.rim, width: Math.max(1.5, lw * 0.6), seed: seed + i * 13, wobble: 0.6, double: false, opacity: o.rimOp || 0.85 });
        if (o.needles) {
          const nn = Math.max(3, Math.round(tw / 22));
          for (let k = 0; k < nn; k++) {
            const nx = x - tw * 0.7 + (tw * 1.4 * (k + 0.5)) / nn;
            const ny = ty + th * 0.02 - Math.abs(nx - x) * 0.25;
            sk.line(fg, nx, ny, nx + (nx < x ? -8 : 8), ny + 14, { stroke: o.needles, width: LINE.detail, seed: seed + i * 7 + k, wobble: 0.6, double: false });
          }
        }
      }
      return fg;
    }
    function tinyFir(par, x, by, h, fill, seed, rim) {
      const tg = sk.poly(par, [[x, by - h], [x - h * 0.28, by], [x + h * 0.28, by]], { fill, stroke: fill, width: 1.5, seed, wobble: 0.6, double: false });
      if (rim) sk.line(par, x + 1, by - h + 2, x + h * 0.24, by - 1, { stroke: rim, width: 1.3, seed: seed + 3, wobble: 0.3, double: false, opacity: 0.8 });
      return tg;
    }
    function rock(par, x, y, w, h, seed, fill, o) {
      o = o || {};
      const pts = [];
      for (let i = 0; i < 9; i++) {
        const a = Math.PI + (i / 8) * Math.PI;
        pts.push([x + Math.cos(a) * w * (0.85 + 0.15 * hash(seed + i)), y + Math.sin(a) * h * (0.8 + 0.2 * hash(seed + i * 2))]);
      }
      const rg = sk.poly(par, pts, { fill: fill || P.steel, stroke: o.stroke || INK, width: o.width || LINE.detail + 1, seed, wobble: Math.min(1, w * 0.06) });
      sk.line(rg, x + w * 0.05, y - h * 0.85, x + w * 0.7, y - h * 0.35, { stroke: C.light, width: Math.max(1, (o.width || 3) * 0.55), seed: seed + 3, wobble: 0.4, double: false, opacity: 0.85 });
      return rg;
    }
    function stump(par, x, by, w, h, seed, o) {
      o = o || {};
      const sg = el("g", {}, par);
      const lw = o.lw || LINE.detail + 1, stroke = o.stroke || INK;
      if (o.shadow !== false) castShadow(sg, x, by, w * 0.95, o.shadowLen || h * 3.4 + w * 0.8, o.shadowOp, seed + 90);
      const ry = Math.max(1.5, w * 0.17);
      const body = [[x - w * 0.66, by + 2], [x - w * 0.52, by - h * 0.3], [x - w * 0.47, by - h], [x + w * 0.47, by - h], [x + w * 0.52, by - h * 0.3], [x + w * 0.66, by + 2]];
      sk.poly(sg, body, { fill: o.fill || P.slate, stroke, width: lw, seed, wobble: Math.min(1.2, w * 0.03 + 0.3) });
      const nb = Math.max(0, Math.round(w / 14));
      for (let i = 0; i < nb; i++) {
        const bx = x - w * 0.4 + (w * 0.8 * (i + 0.5)) / nb;
        sk.line(sg, bx, by - h + ry + 1, bx + hash(seed + i) * 3, by - 1, { stroke: o.bark || P.storm, width: Math.max(1, lw * 0.5), seed: seed + 10 + i, wobble: 0.5, double: false, opacity: 0.8 });
      }
      // rim light on the right (sun behind the ridge, upper right)
      sk.line(sg, x + w * 0.45, by - h + ry * 0.5, x + w * 0.53, by - h * 0.25, { stroke: C.light, width: Math.max(1.2, lw * 0.7), seed: seed + 30, wobble: 0.4, double: false, opacity: 0.9 });
      const face = [];
      for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; face.push([x + Math.cos(a) * w * 0.47, by - h + Math.sin(a) * ry]); }
      sk.poly(sg, face, { fill: o.top || C.light, stroke, width: lw, seed: seed + 40, wobble: Math.min(0.6, w * 0.02) });
      if (w > 22) {
        [0.33, 0.62].forEach((r, i) => el("ellipse", { cx: f1(x - w * 0.03), cy: f1(by - h + 0.5), rx: f1(w * 0.47 * r), ry: f1(ry * r), fill: "none", stroke: C.gravel, "stroke-width": 1.2, opacity: 0.8 }, sg));
        sk.line(sg, x - w * 0.05, by - h, x + w * 0.32, by - h - ry * 0.55, { stroke: P.storm, width: 1.2, seed: seed + 41, wobble: 0.3, double: false });
        sk.line(sg, x - w * 0.05, by - h, x - w * 0.3, by - h + ry * 0.6, { stroke: P.storm, width: 1.2, seed: seed + 42, wobble: 0.3, double: false });
      }
      return sg;
    }
    function slash(par, x, y, w, h, seed, o) { // a tangle of cut limbs on a low mound
      o = o || {};
      const sg = el("g", {}, par);
      castShadow(sg, x, y, w * 0.9, w * 0.9, 0.35, seed + 1);
      sk.poly(sg, [[x - w / 2, y], [x - w * 0.3, y - h * 0.7], [x, y - h], [x + w * 0.32, y - h * 0.65], [x + w / 2, y]], { fill: C.shade, stroke: "none", seed: seed + 2, wobble: 1.5, double: false, opacity: 0.55 });
      const n = o.n || 16;
      for (let i = 0; i < n; i++) {
        const cx = x + hash(seed + i * 3) * w * 0.42, cy = y - h * 0.15 - frac(seed + i * 5) * h * 0.75;
        const a = hash(seed + i * 7) * 1.3, l = w * (0.25 + frac(seed + i * 11) * 0.3);
        const x1 = cx - Math.cos(a) * l / 2, y1 = cy - Math.sin(a) * l / 2, x2 = cx + Math.cos(a) * l / 2, y2 = cy + Math.sin(a) * l / 2;
        sk.line(sg, x1, y1, x2, y2, { stroke: i % 3 ? (o.stroke || P.storm) : C.gravel, width: o.lw || 3, seed: seed + 20 + i, wobble: 1, double: false });
        if (i % 2 === 0) sk.line(sg, (x1 + x2) / 2, (y1 + y2) / 2, (x1 + x2) / 2 + 8 * Math.sign(hash(seed + i)), (y1 + y2) / 2 - 10, { stroke: o.stroke || P.storm, width: 1.5, seed: seed + 40 + i, wobble: 0.5, double: false });
        if (i % 4 === 1) sk.line(sg, x2 - 2, y2 - 2, x2 + 4, y2 - 5, { stroke: C.light, width: 1.5, seed: seed + 60 + i, wobble: 0.3, double: false, opacity: 0.8 });
      }
      return sg;
    }
    function tuft(par, x, y, s, seed, col, tip) {
      const tg = el("g", {}, par);
      for (let i = 0; i < 5; i++) {
        const a = -0.9 + i * 0.45 + hash(seed + i) * 0.15, l = s * (0.7 + frac(seed + i * 3) * 0.5);
        sk.line(tg, x + (i - 2) * s * 0.08, y, x + Math.sin(a) * l, y - Math.cos(a) * l, { stroke: col || C.grass, width: Math.max(1, s * 0.09), seed: seed + i, wobble: 0.3, double: false });
        if (tip && i % 2 === 0) sk.line(tg, x + Math.sin(a) * l * 0.7, y - Math.cos(a) * l * 0.7, x + Math.sin(a) * l, y - Math.cos(a) * l, { stroke: tip, width: Math.max(1, s * 0.08), seed: seed + i + 9, wobble: 0.2, double: false, opacity: 0.9 });
      }
      return tg;
    }
    function fireweed(par, x, y, h, seed) { // dry fireweed stalk gone to seed
      const fg = el("g", {}, par);
      const lean = hash(seed) * 0.15;
      sk.path(fg, [[x, y], [x + lean * h * 0.5, y - h * 0.5], [x + lean * h, y - h]], { stroke: C.rust, width: 2.5, seed, wobble: 0.4, double: false });
      for (let i = 0; i < 6; i++) {
        const t = 0.45 + i * 0.09, px = x + lean * h * t, py = y - h * t, d = i % 2 ? 1 : -1;
        sk.line(fg, px, py, px + d * 9, py - 10, { stroke: C.rust, width: 1.5, seed: seed + i, wobble: 0.3, double: false });
        el("circle", { cx: f1(px + d * 10), cy: f1(py - 12), r: 2.6, fill: C.light, opacity: 0.85 }, fg);
      }
      for (let i = 0; i < 3; i++) sk.line(fg, x + lean * h * (0.15 + i * 0.1), y - h * (0.15 + i * 0.1), x + lean * h * (0.15 + i * 0.1) + (i % 2 ? 12 : -12), y - h * (0.15 + i * 0.1) + 3, { stroke: C.grass, width: 2, seed: seed + 20 + i, wobble: 0.3, double: false });
      return fg;
    }
    function snag(par, x, by, h, seed, w) { // dead standing trunk on the ridge, silhouetted
      const sg = el("g", {}, par);
      w = w || 14;
      const top = by - h;
      sk.poly(sg, [[x - w * 0.55, by + 3], [x - w * 0.3, top + h * 0.2], [x - w * 0.18, top + 6], [x - 2, top - 6], [x + 3, top + 4], [x + w * 0.2, top - 2], [x + w * 0.3, top + h * 0.2], [x + w * 0.55, by + 3]],
        { fill: C.shade, stroke: INK, width: 3, seed, wobble: 0.7 });
      for (let i = 0; i < 4; i++) {
        const yy = top + h * (0.18 + i * 0.17), d = i % 2 ? 1 : -1, l = 14 + frac(seed + i) * 18;
        sk.line(sg, x + d * w * 0.2, yy, x + d * (w * 0.2 + l), yy - l * 0.45, { stroke: INK, width: 2.5, seed: seed + 10 + i, wobble: 0.4, double: false });
      }
      sk.line(sg, x + w * 0.3, top + 8, x + w * 0.5, by - 4, { stroke: C.light, width: 2, seed: seed + 30, wobble: 0.4, double: false, opacity: 0.9 });
      return sg;
    }

    // ------------------------------------------------------------------ SKY (shared)
    function drawSky(S, bottom) {
      const skyG = el("g", { class: "sky" }, g);
      sk.rect(skyG, -20, -20, 1960, bottom + 20, { fill: grad("sky", [[0, C.sky], [0.55, C.sky], [1, C.light]]), stroke: "none", wobble: 0, double: false });
      sk.rect(skyG, -20, -20, 1960, 300, { fill: grad("zen", [[0, P.mist, 0.55], [1, P.mist, 0]]), stroke: "none", wobble: 0, double: false });
      // sun glow behind the ridge
      el("circle", { cx: S.x, cy: S.y, r: 760, fill: radial("sunglow", S.x, S.y, 760, [[0, C.light, 1], [0.18, C.light, 0.85], [0.5, C.light, 0.3], [1, C.light, 0]]) }, skyG);
      // faint rays fanning up from the sun into the sky
      for (let i = 0; i < 9; i++) {
        const a = (-170 + i * 19) * Math.PI / 180, l = 900;
        const a1 = a - 0.025, a2 = a + 0.025;
        sk.poly(skyG, [[S.x, S.y], [S.x + Math.cos(a1) * l, S.y + Math.sin(a1) * l], [S.x + Math.cos(a2) * l, S.y + Math.sin(a2) * l]], { fill: C.light, stroke: "none", seed: 40 + i, wobble: 0, double: false, opacity: 0.22 });
      }
      // long thin evening cloud strands: cool grey bodies, undersides lit pale amber
      const strands = [[120, 92, 520, 14], [760, 64, 430, 10], [380, 168, 640, 12], [1180, 140, 380, 9], [60, 250, 360, 8], [880, 214, 300, 7], [1560, 96, 300, 8]];
      strands.forEach(([x, y, w, h], i) => {
        const pts = [];
        for (let k = 0; k <= 10; k++) pts.push([x + (w * k) / 10, y - Math.sin((k / 10) * Math.PI) * h * (0.8 + 0.3 * hash(i * 9 + k))]);
        for (let k = 10; k >= 0; k--) pts.push([x + (w * k) / 10 + 12, y + Math.sin((k / 10) * Math.PI) * h * 0.35]);
        sk.poly(skyG, pts, { fill: P.mist, stroke: "none", seed: 60 + i, wobble: 1.2, double: false, opacity: 0.55 });
        sk.path(skyG, [[x + w * 0.08, y + h * 0.2], [x + w * 0.5, y + h * 0.4], [x + w * 0.92, y + h * 0.15]], { stroke: C.light, width: 3, seed: 70 + i, wobble: 0.8, double: false, opacity: 0.95 });
        sk.path(skyG, [[x + w * 0.15, y - h * 0.4], [x + w * 0.55, y - h * 0.6], [x + w * 0.85, y - h * 0.3]], { stroke: P.steel, width: 1.5, seed: 80 + i, wobble: 0.8, double: false, opacity: 0.5 });
      });
      sk.hatch(skyG, -20, 0, 1960, 120, { gap: 22, angle: 8, stroke: P.mist, width: 1.5, opacity: 0.18, seed: 90 });
      // two birds heading home
      [[640, 300, 1], [672, 288, 0.8]].forEach(([x, y, s], i) => sk.path(skyG, [[x - 10 * s, y - 3 * s], [x - 4 * s, y - 5 * s], [x, y], [x + 4 * s, y - 5 * s], [x + 10 * s, y - 3 * s]], { stroke: P.storm, width: 2, seed: 95 + i, wobble: 0.3, double: false }));
      return skyG;
    }

    // ------------------------------------------------------------------ DISTANT VIEW: the bay in gold haze (shared)
    function drawBay(o) {
      const vg = el("g", { class: "bay" }, g);
      const X1 = o.x1, HZ = o.hz, k = o.k, s = o.seed;
      // open sea beyond the bay mouth
      sk.rect(vg, -20, HZ, X1 + 60, 260 * k, { fill: grad("sea" + s, [[0, C.light], [0.4, P.fog], [1, P.mist]]), stroke: "none", wobble: 0, double: false });
      sk.line(vg, -20, HZ, X1 + 40, HZ, { stroke: P.mist, width: 1.5, seed: s, wobble: 0.3, double: false });
      for (let i = 0; i < 16; i++) {
        const y = HZ + 5 + i * 3.2 * k, x = 10 + ((i * 97) % 260);
        sk.line(vg, x, y, x + 30 + (i % 4) * 16, y, { stroke: i % 3 ? C.light : P.paper, width: 1.8, seed: s + 10 + i, wobble: 0.3, double: false, opacity: 0.9 });
      }
      // far shore hills across the bay
      const fh = [[150, HZ + 6 * k], [250, HZ - 12 * k], [380, HZ - 24 * k], [520, HZ - 18 * k], [680, HZ - 38 * k], [840, HZ - 50 * k], [X1 + 40, HZ - 62 * k], [1960, HZ - 70 * k], [1960, HZ + 46 * k], [150, HZ + 46 * k]];
      sk.poly(vg, fh, { fill: P.mist, stroke: P.steel, width: 1.5, seed: s + 30, wobble: 0.8 });
      for (let i = 0; i < 34; i++) {
        const x = 200 + i * ((X1 - 160) / 34) + hash(s + i) * 6;
        tinyFir(vg, x, yAt(fh.slice(0, 8), x) + 8 * k + frac(s + i * 3) * 10 * k, (8 + frac(s + i * 5) * 7) * k, i % 3 ? P.steel : P.mist, s + 40 + i);
      }
      // the flooded town on the far shore: a mud band and a few roofs poking out
      sk.poly(vg, [[150, HZ + 30 * k], [X1 + 40, HZ + 26 * k], [X1 + 40, HZ + 40 * k], [150, HZ + 42 * k]], { fill: C.gravel, stroke: "none", seed: s + 80, wobble: 0.5, double: false, opacity: 0.55 });
      for (let i = 0; i < 16; i++) {
        const x = 240 + i * ((X1 - 260) / 16) + hash(s + 90 + i) * 8, y = HZ + 32 * k, w = (8 + frac(s + i) * 8) * k;
        sk.poly(vg, [[x - w / 2, y], [x, y - w * 0.5], [x + w / 2, y]], { fill: i % 2 ? P.steel : P.slate, stroke: P.slate, width: 1, seed: s + 100 + i, wobble: 0.3, double: false, opacity: 0.8 });
      }
      // bay water with a long sun path of glints
      const bay = [[-20, HZ + 40 * k], [X1 + 40, HZ + 36 * k], [X1 + 40, HZ + 130 * k], [-20, HZ + 140 * k]];
      sk.poly(vg, bay, { fill: grad("bayw" + s, [[0, C.light], [0.5, P.fog], [1, P.mist]]), stroke: "none", seed: s + 120, wobble: 0, double: false });
      for (let i = 0; i < 26; i++) {
        const y = HZ + (44 + (i % 9) * 9) * k, x = 40 + ((i * 131) % (X1 - 60));
        sk.line(vg, x, y, x + (24 + (i % 5) * 12) * k, y, { stroke: i % 4 ? C.light : P.mist, width: 1.8, seed: s + 130 + i, wobble: 0.3, double: false, opacity: 0.9 });
      }
      // headland at the bay mouth, left
      sk.poly(vg, [[-20, HZ + 10 * k], [40, HZ - 8 * k], [100, HZ - 4 * k], [150, HZ + 14 * k], [170, HZ + 40 * k], [-20, HZ + 44 * k]], { fill: P.mist, stroke: P.steel, width: 1.5, seed: s + 160, wobble: 0.6 });
      for (let i = 0; i < 7; i++) tinyFir(vg, 4 + i * 18, HZ + (2 + i * 1.5) * k, (12 + (i % 3) * 4) * k, P.steel, s + 170 + i);
      // falling shoulders of land between us and the bay (cut-over patches, tiny firs)
      o.shoulders.forEach((pts, j) => {
        const fill = j === 0 ? P.mist : P.steel;
        sk.poly(vg, pts, { fill, stroke: j === 0 ? P.steel : P.slate, width: 1.8, seed: s + 200 + j, wobble: 1 });
        const top = pts.slice(0, -2);
        for (let i = 0; i < 26; i++) {
          const x = top[0][0] + 20 + i * ((top[top.length - 1][0] - top[0][0] - 40) / 26) + hash(s + 210 + i + j * 40) * 8;
          const yy = yAt(top, x) + 6 + frac(s + 220 + i + j * 40) * 26 * k;
          if (i % 4 === 2) { sk.poly(vg, [[x - 14 * k, yy + 4], [x + 18 * k, yy], [x + 22 * k, yy + 8 * k], [x - 10 * k, yy + 10 * k]], { fill: C.grass, stroke: "none", seed: s + 260 + i, wobble: 0.5, double: false, opacity: 0.55 }); continue; }
          tinyFir(vg, x, yy + 10 * k, (12 + frac(s + 240 + i) * 10) * k * (j + 1) * 0.8, j === 0 ? P.steel : P.slate, s + 280 + i + j * 40, C.light);
        }
      });
      // gold haze over the whole distance
      sk.rect(vg, -20, HZ - 120 * k, 1980, 340 * k, { fill: grad("haze" + s, [[0, C.light, 0.15], [0.5, C.light, 0.42], [1, C.sky, 0.3]]), stroke: "none", wobble: 0, double: false });
      return vg;
    }

    // ------------------------------------------------------------------ LIGHT OVERLAYS (shared builder)
    function drawLight(S, o) {
      const lightG = el("g", { class: "light" }, g);
      el("circle", { cx: S.x, cy: S.y, r: o.bloom, fill: radial("bloom", S.x, S.y, o.bloom, [[0, C.light, 0.7], [0.4, C.light, 0.25], [1, C.light, 0]]) }, lightG);
      const shafts = [];
      o.shafts.forEach(([deg, wdeg, op], i) => {
        const sg = el("g", { class: "shaft" }, lightG);
        const a = (deg * Math.PI) / 180, h = (wdeg * Math.PI) / 360, L = o.len;
        const p1 = [S.x + Math.cos(a - h) * L, S.y + Math.sin(a - h) * L], p2 = [S.x + Math.cos(a + h) * L, S.y + Math.sin(a + h) * L];
        sk.poly(sg, [[S.x, S.y], p1, p2], { fill: grad("shaft" + i, [[0, C.light, op], [0.75, C.light, op * 0.8], [1, C.light, 0]], Math.cos(a) * 0.6, Math.sin(a) * 0.6 + 0.05), stroke: "none", seed: 300 + i, wobble: 0, double: false });
        // a soft pencil edge on one side of the shaft
        sk.line(sg, S.x + Math.cos(a - h) * 260, S.y + Math.sin(a - h) * 260, S.x + Math.cos(a - h) * L * 0.8, S.y + Math.sin(a - h) * L * 0.8, { stroke: C.light, width: 2, seed: 320 + i, wobble: 0.6, double: false, opacity: op * 1.6 });
        shafts.push(sg);
      });
      const dustG = el("g", { class: "dust" }, lightG);
      if (o.haze) sk.poly(dustG, o.haze, { fill: grad("dusthaze", [[0, C.light, 0], [0.6, C.light, 0.3], [1, C.light, 0.12]]), stroke: "none", seed: 340, wobble: 0, double: false });
      // motes: hanging in the shafts
      let m = 0;
      for (let i = 0; m < o.motes && i < o.motes * 6; i++) {
        const sh = o.shafts[i % o.shafts.length];
        const a = (sh[0] + hash(400 + i) * sh[1] * 0.5) * Math.PI / 180, r = o.moteR0 + frac(410 + i) * (o.len * 0.62 - o.moteR0);
        const x = S.x + Math.cos(a) * r, y = S.y + Math.sin(a) * r;
        if (x < 0 || x > 1920 || y < o.moteY0 || y > o.moteY1) continue;
        el("circle", { cx: f1(x), cy: f1(y), r: f1(0.8 + frac(420 + i) * 1.8), fill: i % 4 ? C.light : P.paper, opacity: f1(0.45 + frac(430 + i) * 0.5) }, dustG);
        m++;
      }
      return { lightG, shafts, dustG };
    }

    // ==================================================================================================== WIDE VIEW
    if (WIDE) {
      const S = { x: 1372, y: 250 };
      const skyG = drawSky(S, 520);
      const HZ = 330, K = 1.5;
      const bayG = drawBay({
        x1: 980, hz: HZ, k: K, seed: 1000,
        shoulders: [
          [[-20, 506], [160, 492], [360, 470], [560, 446], [760, 420], [1000, 392], [1000, 900], [-20, 900]],
          [[-20, 540], [140, 530], [300, 512], [460, 486], [640, 456], [800, 430], [800, 900], [-20, 900]],
        ],
      });
      // ---- the cut-over hillside
      const hillG = el("g", { class: "hill" }, g);
      const ridge = [[-20, 566], [200, 524], [450, 456], [700, 392], [950, 330], [1150, 284], [1300, 256], [1420, 241], [1560, 233], [1700, 226], [1950, 214]];
      const ridgeY = (x) => yAt(ridge, x);
      const hillPts = ridge.concat([[1950, 1100], [-20, 1100]]);
      sk.poly(hillG, hillPts, { fill: grad("hillw", [[0, C.shade], [0.5, C.grass], [1, C.gravel]]), stroke: "none", seed: 1100, wobble: 0, double: false });
      const hillClip = clipTo(hillG, hillPts);
      sk.hatch(hillClip, -20, 200, 1980, 900, { gap: 15, angle: 62, stroke: P.slate, width: 1.5, opacity: 0.3, seed: 1101 });
      sk.hatch(hillClip, -20, 200, 1980, 400, { gap: 19, angle: 118, stroke: C.shade, width: 1.5, opacity: 0.2, seed: 1102 });
      // dry-grass and bare-earth patches
      for (let i = 0; i < 44; i++) {
        const x = 40 + ((i * 263) % 1560) + hash(1110 + i) * 30, y = ridgeY(x) + 40 + frac(1120 + i) * (900 - ridgeY(x));
        const w = 50 + frac(1130 + i) * 90;
        sk.poly(hillClip, [[x - w / 2, y], [x - w * 0.2, y - w * 0.18], [x + w * 0.3, y - w * 0.14], [x + w / 2, y + 4], [x, y + w * 0.12]], { fill: i % 3 ? C.grass : C.gravel, stroke: "none", seed: 1140 + i, wobble: 2, double: false, opacity: 0.38 });
      }
      // gullies running down the slope
      [[620, 470, 420, 980], [1180, 300, 1030, 1000]].forEach(([x0, y0, x1, y1], i) => {
        const pts = [];
        for (let k = 0; k <= 12; k++) { const t = k / 12; pts.push([x0 + (x1 - x0) * t + Math.sin(t * 9 + i) * 14, y0 + (y1 - y0) * t]); }
        sk.path(hillClip, pts, { stroke: C.shade, width: 6, seed: 1160 + i, wobble: 1.5, double: false, opacity: 0.6 });
        sk.path(hillClip, pts.map(([x, y]) => [x + 4, y]), { stroke: C.light, width: 1.5, seed: 1170 + i, wobble: 1.5, double: false, opacity: 0.5 });
      });
      // ---- road legs (foot lines)
      const LEGS = [
        [[-40, 922], [220, 906], [460, 878], [700, 870], [940, 846], [1200, 826], [1480, 798]],
        [[1480, 770], [1300, 742], [1100, 738], [880, 708], [700, 690], [530, 668]],
        [[530, 642], [700, 624], [880, 594], [1060, 576], [1300, 532]],
        [[1300, 510], [1160, 494], [1020, 470], [880, 458], [760, 434]],
        [[760, 414], [900, 392], [1040, 360], [1180, 330], [1330, 288], [1460, 254]],
      ];
      const legs = LEGS.map((pts) => {
        const c = curve(pts, 14);
        const dir = pts[pts.length - 1][0] > pts[0][0] ? 1 : -1;
        const asc = dir > 0 ? c : c.slice().reverse();
        return { points: c.map(([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10]), asc, dir, x0: pts[0][0], x1: pts[pts.length - 1][0] };
      });
      const roadYWide = (x, leg) => yAt(legs[Math.max(0, Math.min(4, leg | 0))].asc, x);
      const tw = (y) => 10 + ((y - 250) / 680) * 10; // tread width grows toward the viewer
      const nearRoad = (x, y, pad) => legs.some((L) => { const lo = Math.min(L.x0, L.x1) - 30, hi = Math.max(L.x0, L.x1) + 30; if (x < lo || x > hi) return false; const ly = yAt(L.asc, x); return y > ly - tw(ly) * 1.6 - pad && y < ly + tw(ly) * 2.4 + pad; });
      // ---- stumps, slash, young firs scattered over the cut (before the road so the road cuts through)
      const stumpsG = el("g", { class: "stumps" }, hillG);
      for (let i = 0; i < 460; i++) {
        const x = -10 + frac(1200 + i * 3) * 1700, top = ridgeY(x) + 14, bot = 1000;
        const y = top + frac(1201 + i * 7) * (bot - top);
        if (nearRoad(x, y, 6) || x > 1560 && y < 270 + (x - 1560) * 0.45) continue;
        const kk = 0.45 + ((y - 230) / 760) * 0.9;
        stump(stumpsG, x, y, (6 + frac(1202 + i) * 6) * kk, (4 + frac(1203 + i) * 4) * kk, 1300 + i * 7, { lw: 1.3, stroke: P.storm, fill: C.shade, shadowLen: 34 * kk + frac(1204 + i) * 20 * kk, shadowOp: 0.5 });
      }
      for (let i = 0; i < 14; i++) {
        const x = 60 + ((i * 397) % 1480), y = ridgeY(x) + 60 + frac(1500 + i) * (900 - ridgeY(x));
        if (nearRoad(x, y, 14) || y > 940) continue;
        const kk = 0.45 + ((y - 230) / 760) * 0.9;
        slash(stumpsG, x, y, 60 * kk, 18 * kk, 1510 + i * 70, { n: 10, lw: 2, stroke: C.shade });
      }
      for (let i = 0; i < 40; i++) {
        const x = 30 + ((i * 181) % 1560) + hash(1600 + i) * 30, y = ridgeY(x) + 30 + frac(1601 + i) * (930 - ridgeY(x));
        if (nearRoad(x, y, 10) || x > 1560 && y < 430) continue;
        const kk = 0.45 + ((y - 230) / 760) * 0.9;
        fir(stumpsG, x, y, (18 + frac(1602 + i) * 16) * kk, (12 + frac(1603 + i) * 8) * kk, { fill: P.slate, stroke: C.shade, width: 1.2, seed: 1610 + i * 5, tiers: 3, double: false, wobble: 0.4, trunk: C.shade, rim: C.light, rimOp: 0.7 });
      }
      // snags on the skyline
      [[480, 0.9], [830, 1], [1060, 1.1], [1250, 1.2], [1335, 0.9]].forEach(([x, s], i) => snag(hillG, x, ridgeY(x) + 6, 52 * s, 1700 + i * 40, 6 * s));
      // ridge outline + rim light near the sun
      sk.path(hillG, ridge, { stroke: P.storm, width: 3, seed: 1800, wobble: 1.4 });
      sk.path(hillG, ridge.filter(([x]) => x > 800).map(([x, y]) => [x, y + 5]), { stroke: C.light, width: 10, seed: 1801, wobble: 1, double: false, opacity: 0.3 });
      sk.path(hillG, ridge.filter(([x]) => x > 700).map(([x, y]) => [x, y + 2]), { stroke: C.light, width: 2.5, seed: 1802, wobble: 1.2, double: false, opacity: 0.95 });

      // ---- road legs, top (farthest) first
      const roadG = el("g", { class: "road" }, g);
      const taper = (L, x) => { const d = Math.min(Math.abs(x - L.x0), Math.abs(x - L.x1)); return Math.max(0, Math.min(1, (d - 10) / 90)); };
      for (let li = 4; li >= 0; li--) {
        const L = legs[li], pts = L.asc;
        const back = pts.map(([x, y]) => [x, y - tw(y) * 0.55]), front = pts.map(([x, y]) => [x, y + tw(y) * 0.45]);
        // cut bank above
        const cut = back.map(([x, y], k) => [x, y - tw(y) * (0.35 + 0.2 * frac(1899 + Math.floor(k / 4) + li * 30)) * taper(L, x) - 1]);
        sk.poly(roadG, cut.concat(back.slice().reverse()), { fill: C.shade, stroke: "none", seed: 1900 + li, wobble: 0.6, double: false, opacity: 0.75 });
        sk.path(roadG, cut, { stroke: INK, width: 1.6, seed: 1905 + li, wobble: 0.8, double: false, opacity: 0.7 });
        // sidecast fill slope below (raw gravel spilling down)
        const fill = front.map(([x, y], k) => [x, y + tw(y) * (0.7 + 1.1 * frac(1910 + Math.floor(k / 3) + li * 50)) * taper(L, x) + 1]);
        sk.poly(roadG, front.concat(fill.slice().reverse()), { fill: C.gravel, stroke: "none", seed: 1915 + li, wobble: 1.2, double: false, opacity: 0.38 });
        for (let k = 0; k < fill.length; k += 3) if (taper(L, fill[k][0]) > 0.3) sk.line(roadG, front[k][0], front[k][1] + 2, fill[k][0] - 3, fill[k][1] - 1, { stroke: C.shade, width: 1.2, seed: 1920 + k + li * 60, wobble: 0.3, double: false, opacity: 0.45 });
        // tread
        sk.poly(roadG, back.concat(front.slice().reverse()), { fill: C.gravel, stroke: "none", seed: 1930 + li, wobble: 0.4, double: false });
        sk.path(roadG, pts.map(([x, y]) => [x, y - tw(y) * 0.2]), { stroke: C.shade, width: 2, seed: 1935 + li, wobble: 0.5, double: false, opacity: 0.4 });
        sk.path(roadG, pts.map(([x, y]) => [x, y + tw(y) * 0.15]), { stroke: C.shade, width: 2, seed: 1940 + li, wobble: 0.5, double: false, opacity: 0.4 });
        sk.path(roadG, back, { stroke: P.storm, width: 1.6, seed: 1945 + li, wobble: 0.6, double: false });
        sk.path(roadG, front, { stroke: INK, width: 2.4, seed: 1950 + li, wobble: 0.8, double: false });
      }
      // hairpins (outer side of each turn)
      const pins = [[0, 1, 1], [1, 2, -1], [2, 3, 1], [3, 4, -1]];
      const pinArcs = [];
      pins.forEach(([a, b, side], i) => {
        const A = LEGS[a][LEGS[a].length - 1], B = LEGS[b][0];
        const cx = (A[0] + B[0]) / 2, cy = (A[1] + B[1]) / 2, r = Math.abs(A[1] - B[1]) / 2, w = tw(cy);
        const outer = [], inner = [], mid = [];
        for (let k = 0; k <= 10; k++) {
          const t = Math.PI / 2 - (k / 10) * Math.PI; // from below (A) round the outside to above (B)
          outer.push([cx + side * Math.cos(t) * (r + w * 0.5) + side * 6, cy + Math.sin(t) * (r + w * 0.5)]);
          inner.push([cx + side * Math.cos(t) * Math.max(2, r - w * 0.5) + side * 6, cy + Math.sin(t) * Math.max(2, r - w * 0.5)]);
          mid.push([cx + side * Math.cos(t) * r + side * 6, cy + Math.sin(t) * r]);
        }
        sk.poly(roadG, outer.concat(inner.slice().reverse()), { fill: C.gravel, stroke: "none", seed: 1960 + i, wobble: 0.4, double: false });
        sk.path(roadG, outer, { stroke: INK, width: 2.4, seed: 1965 + i, wobble: 0.6, double: false });
        pinArcs.push(mid);
      });
      // the side track at the crest into the uncut timber
      const sidePts = [[1462, 252], [1510, 249], [1560, 247], [1610, 246], [1662, 247]];
      const sideG = el("g", { class: "side-road" }, roadG);
      sk.poly(sideG, sidePts.map(([x, y], k) => [x, y - 5 + k * 0.6]).concat(sidePts.slice().reverse().map(([x, y], k) => [x, y + 4 - (4 - k) * 0.4])), { fill: C.gravel, stroke: "none", seed: 1980, wobble: 0.4, double: false, opacity: 0.85 });
      sk.path(sideG, sidePts.map(([x, y]) => [x, y + 4]), { stroke: P.storm, width: 1.4, seed: 1981, wobble: 0.4, double: false });
      // main road tops out over the ridge
      sk.poly(roadG, [[1440, 262], [1462, 244], [1500, 236], [1506, 242], [1478, 254], [1462, 266]], { fill: C.gravel, stroke: "none", seed: 1985, wobble: 0.3, double: false });
      // ---- uncut timber block at upper right (behind which the side track vanishes)
      const timberG = el("g", { class: "timber" }, g);
      for (let i = 0; i < 18; i++) {
        const x = 1580 + i * 22 + hash(2000 + i) * 6, by = ridgeY(x) + 12 + frac(2001 + i) * 10;
        fir(timberG, x, by, 90 + frac(2002 + i) * 50, 44, { fill: C.shade, stroke: P.storm, width: 1.6, seed: 2010 + i * 9, tiers: 4, double: false, wobble: 0.8, trunk: C.shade, rim: C.light, rimSide: -1, rimOp: 0.75 });
      }
      for (let i = 0; i < 16; i++) {
        const x = 1640 + i * 22 + hash(2200 + i) * 8, by = 270 + (x - 1600) * 0.45 + frac(2201 + i) * 30;
        fir(timberG, x, by, 110 + frac(2202 + i) * 60, 52, { fill: P.storm, stroke: INK, width: 1.8, seed: 2210 + i * 9, tiers: 5, double: false, wobble: 0.8, trunk: P.night, rim: C.light, rimSide: -1, rimOp: 0.6 });
      }
      // ---- gate (tiny, on leg 0) and a road-number post
      const gateX = 262, gateY = roadYWide(gateX, 0) - tw(roadYWide(gateX, 0)) * 0.55 + 2, armY = gateY - 16;
      const gateG = el("g", { class: "gate" }, roadG);
      castShadow(gateG, gateX, gateY, 4, 44, 0.5, 2300);
      sk.line(gateG, gateX, gateY, gateX, gateY - 26, { stroke: INK, width: 4, seed: 2301, wobble: 0.2, double: false });
      sk.line(gateG, gateX, gateY, gateX, gateY - 26, { stroke: C.rust, width: 2, seed: 2302, wobble: 0.2, double: false });
      sk.line(gateG, gateX, armY, gateX - 52, armY, { stroke: INK, width: 3.5, seed: 2303, wobble: 0.3, double: false });
      sk.line(gateG, gateX, armY, gateX - 52, armY, { stroke: C.rust, width: 1.6, seed: 2304, wobble: 0.3, double: false });
      sk.line(gateG, gateX - 50, armY, gateX - 50, roadYWide(gateX - 50, 0) - 8, { stroke: INK, width: 2, seed: 2305, wobble: 0.2, double: false });
      // ---- light
      const LT = drawLight(S, {
        bloom: 300, len: 2100, motes: 90, moteR0: 120, moteY0: 260, moteY1: 930,
        shafts: [[136, 3, 0.2], [145, 4.5, 0.24], [153, 2.5, 0.18], [160, 4, 0.22], [167, 3, 0.18], [173, 2, 0.14]],
        haze: [[-20, 860], [700, 820], [1480, 760], [1480, 840], [700, 900], [-20, 940]],
      });
      // ---- low foreground lip at the bottom (low detail under the caption bar)
      const fgG = el("g", { class: "foreground" }, g);
      const lip = [[-20, 990], [300, 976], [700, 984], [1100, 970], [1500, 978], [1940, 962], [1940, 1100], [-20, 1100]];
      sk.poly(fgG, lip, { fill: grad("lipw", [[0, C.shade], [1, P.storm]]), stroke: INK, width: LINE.main, seed: 2400, wobble: 1.6 });
      sk.hatch(clipTo(fgG, lip), -20, 960, 1960, 140, { gap: 16, angle: 40, stroke: INK, width: 2, opacity: 0.25, seed: 2401 });
      [[140, 984], [420, 978], [980, 976], [1320, 972], [1760, 966]].forEach(([x, y], i) => tuft(fgG, x, y + 4, 26, 2410 + i * 9, C.grass, C.light));

      // ---- path along the whole road
      const full = [];
      legs.forEach((L, i) => { full.push(...L.points); if (i < 4) full.push(...pinArcs[i].slice(1, -1)); });
      const cum = [0];
      for (let i = 1; i < full.length; i++) cum.push(cum[i - 1] + Math.hypot(full[i][0] - full[i - 1][0], full[i][1] - full[i - 1][1]));
      const legOf = [];
      legs.forEach((L, i) => { L.points.forEach(() => legOf.push(i)); if (i < 4) pinArcs[i].slice(1, -1).forEach(() => legOf.push(i + 0.5)); });
      function roadPathWide(t) {
        const d = Math.max(0, Math.min(1, t)) * cum[cum.length - 1];
        let i = 1;
        while (i < cum.length - 1 && cum[i] < d) i++;
        const a = full[i - 1], b = full[i], u = (d - cum[i - 1]) / Math.max(0.001, cum[i] - cum[i - 1]);
        const lg = legOf[i];
        return { x: a[0] + (b[0] - a[0]) * u, y: a[1] + (b[1] - a[1]) * u, leg: Math.floor(lg), facing: b[0] >= a[0] ? 1 : -1 };
      }
      const crest = { x: 1460, y: 254 };
      return {
        g, view: "wide", light,
        groundY: Math.round(roadYWide(0, 0)),
        roadYWide, roadY: roadYWide,
        legs: legs.map((L) => ({ points: L.points, x0: L.x0, x1: L.x1, dir: L.dir })),
        roadPathWide,
        roadPointsWide: full.map(([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10]),
        figScale: 0.2,
        gate: { g: gateG, x: gateX, y: Math.round(gateY), armY: Math.round(armY), x0: gateX - 52 },
        crest,
        sideRoad: { g: sideG, x: 1560, y: 247, points: sidePts, x0: sidePts[0][0], y0: sidePts[0][1], x1: 1662, y1: 247 },
        hill: { g: hillG }, bay: { g: bayG }, timber: { g: timberG }, road: { g: roadG },
        sun: S, skyG, lightG: LT.lightG, shafts: LT.shafts, dust: { g: LT.dustG }, shadowDir,
        detail: null,
      };
    }

    // ==================================================================================================== DEFAULT VIEW
    // ------------------------------------------------------------------ road geometry
    const CP = [[-200, 975], [0, 945], [350, 905], [700, 845], [1000, 780], [1300, 700], [1560, 615], [1760, 558], [1920, 545], [2120, 548]];
    const samples = catmull(CP, 50);
    function roadY(x) { return yAt(samples, Math.max(0, Math.min(1920, x))); }
    const roadPoints = [];
    for (let x = 0; x <= 1920; x += 20) roadPoints.push([x, Math.round(roadY(x) * 10) / 10]);
    const BACK = 64, FRONT = 40;
    const backY = (x) => roadY(x) - BACK;

    const S = { x: 1500, y: 262 };
    const skyG = drawSky(S, 760);
    const bayG = drawBay({
      x1: 1060, hz: 440, k: 1, seed: 500,
      shoulders: [
        [[-20, 586], [200, 572], [420, 556], [640, 534], [860, 506], [1060, 470], [1060, 1000], [-20, 1000]],
        [[-20, 650], [180, 636], [380, 614], [560, 588], [720, 560], [720, 1000], [-20, 1000]],
      ],
    });

    // ------------------------------------------------------------------ THE CUT-OVER HILLSIDE (uphill, behind the road)
    const hillG = el("g", { class: "hill" }, g);
    const ridge = [[-20, 722], [250, 690], [500, 628], [750, 548], [1000, 455], [1200, 375], [1380, 305], [1480, 274], [1560, 260], [1700, 252], [1950, 242]];
    const ridgeY = (x) => yAt(ridge, x);
    const hillPts = ridge.concat([[1950, 1000], [-20, 1000]]);
    sk.poly(hillG, hillPts, { fill: grad("hill", [[0, C.shade], [0.55, C.grass], [1, C.gravel]]), stroke: "none", seed: 600, wobble: 0, double: false });
    const hillClip = clipTo(hillG, hillPts);
    sk.hatch(hillClip, -20, 240, 1980, 760, { gap: 15, angle: 60, stroke: P.slate, width: 2, opacity: 0.3, seed: 601 });
    sk.hatch(hillClip, 900, 240, 1060, 300, { gap: 11, angle: 118, stroke: C.shade, width: 1.5, opacity: 0.28, seed: 602 });
    // warm dry-grass and bare-earth patches across the slope
    for (let i = 0; i < 22; i++) {
      const x = 30 + ((i * 271) % 1640) + hash(610 + i) * 30;
      const top = ridgeY(x) + 20, bot = backY(x) - 60;
      if (bot - top < 20) continue;
      const y = top + frac(611 + i) * (bot - top), w = 70 + frac(612 + i) * 120;
      sk.poly(hillClip, [[x - w / 2, y], [x - w * 0.2, y - w * 0.16], [x + w * 0.3, y - w * 0.13], [x + w / 2, y + 4], [x, y + w * 0.11]], { fill: i % 3 ? C.grass : C.gravel, stroke: "none", seed: 620 + i, wobble: 2.5, double: false, opacity: 0.32 });
    }
    // skid trails dragged down the slope
    [[520, 640, 380, 860], [980, 470, 860, 760], [1330, 330, 1240, 640]].forEach(([x0, y0, x1, y1], i) => {
      const pts = [];
      for (let k = 0; k <= 10; k++) { const t = k / 10; pts.push([x0 + (x1 - x0) * t + Math.sin(t * 7 + i) * 12, y0 + (y1 - y0) * t]); }
      sk.path(hillClip, pts, { stroke: C.gravel, width: 14, seed: 650 + i, wobble: 1.5, double: false, opacity: 0.35 });
      sk.path(hillClip, pts.map(([x, y]) => [x - 6, y]), { stroke: C.shade, width: 2, seed: 655 + i, wobble: 1.5, double: false, opacity: 0.45 });
    });
    // dead snags on the skyline (one stands right against the sun)
    [[600, 0.55], [820, 0.7], [1100, 1.0], [1290, 0.85], [1446, 1.15]].forEach(([x, s], i) => snag(hillG, x, ridgeY(x) + 10, 170 * s, 700 + i * 40, 16 * s));
    // stumps all over the cut (small + quiet in the action zone, each with its long evening shadow)
    const slopeG = el("g", { class: "cut" }, hillG);
    for (let i = 0; i < 110; i++) {
      const x = 10 + frac(800 + i * 3) * 1640;
      const top = ridgeY(x) + 18, bot = backY(x) - 48;
      if (bot - top < 10) continue;
      const y = top + frac(801 + i * 7) * (bot - top);
      const kk = 0.5 + Math.max(0, (y - 260) / 640) * 0.9;
      const quiet = x > 300 && x < 1600 && y > 380;
      stump(slopeG, x, y, (12 + frac(802 + i) * 12) * kk, (7 + frac(803 + i) * 7) * kk, 900 + i * 7,
        { lw: quiet ? 1.6 : 2, stroke: quiet ? P.storm : INK, fill: C.shade, shadowLen: (50 + frac(804 + i) * 40) * kk, shadowOp: 0.45 });
    }
    // dry grass tufts with lit tips
    for (let i = 0; i < 90; i++) {
      const x = 10 + frac(1700 + i * 3) * 1660, top = ridgeY(x) + 16, bot = backY(x) - 40;
      if (bot - top < 10) continue;
      const y = top + frac(1701 + i * 7) * (bot - top), kk = 0.5 + Math.max(0, (y - 260) / 640) * 0.8;
      tuft(slopeG, x, y, 14 * kk, 1710 + i * 11, C.grass, C.light);
    }
    // slash piles
    [[560, 735, 120], [1050, 590, 140], [1420, 452, 110], [210, 790, 90]].forEach(([x, y, w], i) => slash(slopeG, x, y, w, w * 0.32, 1900 + i * 80, { n: 18 }));
    // young firs coming back
    [[150, 812, 96], [430, 768, 64], [700, 708, 112], [890, 650, 72], [1150, 568, 120], [1335, 490, 84], [1560, 400, 150], [270, 760, 54]].forEach(([x, by, h], i) => {
      castShadow(slopeG, x, by, h * 0.36, h * 1.9, 0.4, 2100 + i);
      fir(slopeG, x, by, h, h * 0.62, { fill: P.slate, stroke: x > 300 && x < 1600 ? P.storm : INK, width: 2, seed: 2110 + i * 23, tiers: Math.max(3, Math.round(h / 28)), double: false, wobble: 1, trunk: C.shade, rim: C.light, rimSide: 1 });
    });
    // ridge outline + rim light (brightest near the sun)
    sk.path(hillG, ridge, { stroke: INK, width: LINE.main, seed: 2200, wobble: 1.6 });
    sk.path(hillG, ridge.filter(([x]) => x > 900).map(([x, y]) => [x, y + 6]), { stroke: C.light, width: 12, seed: 2201, wobble: 1, double: false, opacity: 0.3 });
    sk.path(hillG, ridge.filter(([x]) => x > 760).map(([x, y]) => [x, y + 3]), { stroke: C.light, width: 2.5, seed: 2202, wobble: 1.2, double: false, opacity: 0.95 });

    // ------------------------------------------------------------------ UNCUT TIMBER at upper right (the side track runs into it)
    const timberG = el("g", { class: "timber" }, hillG);
    for (let i = 0; i < 9; i++) {
      const x = 1610 + i * 42 + hash(2300 + i) * 10;
      fir(timberG, x, ridgeY(x) + 24, 300 + frac(2301 + i) * 90, 120, { fill: C.shade, stroke: P.storm, width: 2, seed: 2310 + i * 17, tiers: 6, double: false, trunk: C.shade, rim: C.light, rimSide: -1, rimOp: 0.8 });
    }
    for (let i = 0; i < 6; i++) {
      const x = 1640 + i * 58 + hash(2400 + i) * 12, by = 400 + (i % 2) * 26;
      fir(timberG, x, by, 360 + frac(2401 + i) * 80, 150, { fill: P.storm, stroke: INK, width: 3, seed: 2410 + i * 17, tiers: 7, double: false, trunk: P.night, needles: C.shade, rim: C.light, rimSide: -1, rimOp: 0.65 });
    }
    sk.hatch(clipTo(timberG, [[1580, 0], [1960, 0], [1960, 520], [1580, 520]]), 1580, 0, 380, 520, { gap: 12, angle: 100, stroke: INK, width: 1.5, opacity: 0.15, seed: 2450 });

    // ------------------------------------------------------------------ SIDE TRACK at the crest, into the timber
    const sideG = el("g", { class: "side-road" }, g);
    const sidePts = [[1712, 500], [1766, 482], [1822, 462], [1876, 441], [1926, 424]];
    const sw = (k) => 40 - k * 6.5;
    const sBack = sidePts.map(([x, y], k) => [x + 4, y - sw(k) * 0.55]), sFront = sidePts.map(([x, y], k) => [x - 4, y + sw(k) * 0.45]);
    sk.poly(sideG, [[1676, backY(1676) + 4]].concat(sBack, sFront.slice().reverse(), [[1780, backY(1780) + 4]]), { fill: C.gravel, stroke: "none", seed: 2500, wobble: 0.6, double: false });
    sk.poly(sideG, [[1676, backY(1676) + 4]].concat(sBack, sFront.slice().reverse(), [[1780, backY(1780) + 4]]), { fill: C.shade, stroke: "none", seed: 2501, wobble: 0.6, double: false, opacity: 0.35 });
    sk.path(sideG, sBack, { stroke: P.storm, width: 2.5, seed: 2502, wobble: 0.8, double: false });
    sk.path(sideG, sFront, { stroke: INK, width: 3, seed: 2503, wobble: 0.8, double: false });
    sk.path(sideG, sidePts.map(([x, y], k) => [x, y - sw(k) * 0.15]), { stroke: C.shade, width: 3, seed: 2504, wobble: 0.6, double: false, opacity: 0.45 });
    sk.path(sideG, sidePts.map(([x, y], k) => [x, y + sw(k) * 0.22]), { stroke: C.shade, width: 3, seed: 2505, wobble: 0.6, double: false, opacity: 0.45 });
    for (let k = 0; k < 4; k++) tuft(sideG, sidePts[k][0] + 6, sidePts[k][1] + 2, 12 - k * 2, 2510 + k * 9, C.grass, C.light);
    // a pair of firs and brush closing over the far end of the track
    fir(sideG, 1942, 452, 330, 150, { fill: P.night, stroke: INK, width: 3, seed: 2530, tiers: 7, double: false, needles: P.storm, rim: C.light, rimSide: -1, rimOp: 0.6 });
    fir(sideG, 1688, 486, 250, 110, { fill: P.storm, stroke: INK, width: 3, seed: 2560, tiers: 6, double: false, needles: C.shade, rim: C.light, rimSide: -1, rimOp: 0.7 });
    tuft(sideG, 1900, 440, 30, 2590, C.shade, C.light);

    // ------------------------------------------------------------------ CUT BANK above the road (uphill side)
    const bankG = el("g", { class: "cut-bank" }, g);
    const cutTop = roadPoints.filter(([x]) => x <= 1700).map(([x, y]) => [x, y - BACK - (34 + Math.abs(hash(x * 0.05)) * 12) * Math.min(1, (1700 - x) / 160)]);
    const cutBot = roadPoints.filter(([x]) => x <= 1700).map(([x, y]) => [x, y - BACK + 2]).reverse();
    const cutPoly = cutTop.concat(cutBot);
    sk.poly(bankG, cutPoly, { fill: grad("cut", [[0, C.gravel], [1, C.shade]]), stroke: "none", seed: 2600, wobble: 0.8, double: false });
    sk.hatch(clipTo(bankG, cutPoly), 0, 400, 1720, 560, { gap: 9, angle: 82, stroke: C.shade, width: 1.5, opacity: 0.55, seed: 2601 });
    sk.path(bankG, cutTop, { stroke: P.storm, width: 3, seed: 2602, wobble: 1.4 });
    for (let i = 0; i < 26; i++) { // embedded stones + roots in the cut face
      const x = 20 + i * 64 + hash(2610 + i) * 18;
      if (x > 1680) continue;
      const y = backY(x) - 12 - frac(2611 + i) * 16;
      if (i % 3 === 0) sk.path(bankG, [[x, y - 6], [x + 10, y], [x + 18, y - 2], [x + 30, y + 8]], { stroke: P.storm, width: 2.5, seed: 2620 + i, wobble: 0.8, double: false });
      else rock(bankG, x, y, 6 + frac(2612 + i) * 7, 4 + frac(2613 + i) * 4, 2640 + i, i % 2 ? P.mist : C.gravel, { width: 1.5, stroke: P.storm });
    }

    // ------------------------------------------------------------------ THE ROAD (gravel tread)
    const roadG = el("g", { class: "road" }, g);
    const backEdge = roadPoints.map(([x, y]) => [x, y - BACK]);
    const frontEdge = roadPoints.map(([x, y]) => [x, y + FRONT]);
    const treadPoly = [[-20, roadY(0) - BACK]].concat(backEdge, [[1940, roadY(1920) - BACK], [1940, roadY(1920) + FRONT]], frontEdge.slice().reverse(), [[-20, roadY(0) + FRONT]]);
    sk.poly(roadG, treadPoly, { fill: C.gravel, stroke: "none", seed: 2700, wobble: 0, double: false });
    const treadClip = clipTo(roadG, treadPoly);
    sk.hatch(treadClip, -20, 480, 1960, 520, { gap: 18, angle: 168, stroke: C.shade, width: 1.5, opacity: 0.16, seed: 2701 });
    sk.path(roadG, backEdge, { stroke: P.storm, width: LINE.detail + 1, seed: 2702, wobble: 1.4 });
    // grass on the centre hump
    for (let i = 0; i < 34; i++) {
      const x = 20 + i * 56 + hash(2710 + i) * 16;
      if (Math.abs(x - 872) < 90) continue;
      tuft(roadG, x, roadY(x) - 6 + hash(2711 + i) * 3, 9 + frac(2712 + i) * 7, 2720 + i * 9, C.grass, C.light);
    }
    // tire ruts: compacted, darker, with chevron tread marks in places
    const RUTS = [-34, 16];
    RUTS.forEach((off, r) => {
      const pts = roadPoints.map(([x, y]) => [x, y + off]);
      sk.path(roadG, pts, { stroke: C.shade, width: 12, seed: 2800 + r, wobble: 1.2, double: false, opacity: 0.22 });
      sk.path(roadG, pts.map(([x, y]) => [x, y - 6]), { stroke: P.storm, width: 1.6, seed: 2805 + r, wobble: 1.2, double: false, opacity: 0.55 });
      sk.path(roadG, pts.map(([x, y]) => [x, y + 6]), { stroke: C.light, width: 1.5, seed: 2810 + r, wobble: 1.2, double: false, opacity: 0.45 });
      for (let x = 30 + r * 20; x < 1900; x += 22) {
        if ((x % 330) > 200) continue;
        const y = roadY(x) + off, s = roadY(x + 6) - roadY(x);
        sk.path(roadG, [[x - 5, y - 4 - s * 0.8], [x, y], [x - 5, y + 4 + s * 0.8]], { stroke: C.shade, width: 1.5, seed: 2820 + x + r, wobble: 0.3, double: false, opacity: 0.45 });
      }
    });
    // water bars (diagonal berms dug across the road to shed runoff)
    [560, 1420].forEach((x, i) => {
      const yb = backY(x - 40) + 4, yf = roadY(x + 40) + FRONT - 4;
      sk.poly(roadG, [[x - 44, yb], [x - 34, yb - 6], [x + 48, yf - 8], [x + 38, yf]], { fill: C.gravel, stroke: P.storm, width: 2.5, seed: 2900 + i, wobble: 0.8 });
      sk.line(roadG, x - 36, yb - 2, x + 42, yf - 6, { stroke: C.light, width: 2, seed: 2905 + i, wobble: 0.6, double: false, opacity: 0.8 });
      sk.line(roadG, x - 30, yb + 6, x + 34, yf + 2, { stroke: C.shade, width: 3, seed: 2910 + i, wobble: 0.6, double: false, opacity: 0.4 });
    });
    // gravel: pebbles over the whole tread, denser around the action spots
    const pebG = el("g", { class: "gravel" }, roadG);
    function pebble(x, y, r, seed) {
      const rx = r * (0.9 + frac(seed) * 0.6), ry = r * (0.55 + frac(seed + 1) * 0.3);
      const fill = [P.mist, C.light, P.steel, C.gravel, P.fog][Math.floor(frac(seed + 2) * 5)];
      el("ellipse", { cx: f1(x), cy: f1(y), rx: f1(rx), ry: f1(ry), fill, stroke: P.storm, "stroke-width": r > 3 ? 1.2 : 0.8, transform: "rotate(" + f1(hash(seed + 3) * 25) + " " + f1(x) + " " + f1(y) + ")" }, pebG);
      if (r > 3) el("path", { d: "M" + f1(x - rx * 0.7) + " " + f1(y + ry * 0.9) + " L" + f1(x - rx * 0.7 - r * 1.6) + " " + f1(y + ry * 0.9 + r * 0.5), stroke: C.shade, "stroke-width": f1(ry * 1.2), opacity: 0.35, "stroke-linecap": "round" }, pebG);
    }
    for (let i = 0; i < 420; i++) {
      const x = frac(3000 + i * 3) * 1920, y = roadY(x) - BACK + 6 + frac(3001 + i * 5) * (BACK + FRONT - 12);
      pebble(x, y, 1.2 + frac(3002 + i) * (i % 9 === 0 ? 4.5 : 2.4), 3100 + i * 4);
    }
    for (let i = 0; i < 260; i++) { // fine gravel around the main spots (holds up at 3×)
      const cx = [760, 960, 1200][i % 3];
      const x = cx - 230 + frac(3500 + i * 3) * 460, y = roadY(x) - BACK + 8 + frac(3501 + i * 5) * (BACK + FRONT - 14);
      pebble(x, y, 0.9 + frac(3502 + i) * 1.6, 3600 + i * 4);
    }
    // a second, older puddle (dried to a crust) near the top
    const pz = 1556, pzy = roadY(pz) + RUTS[1] + 1;
    sk.poly(roadG, Array.from({ length: 12 }, (_, k) => { const a = (k / 12) * Math.PI * 2; return [pz + Math.cos(a) * 40 * (1 + hash(k + 3100) * 0.1), pzy + Math.sin(a) * 8]; }), { fill: P.mist, stroke: P.storm, width: 1.6, seed: 3110, wobble: 0.5, double: false, opacity: 0.85 });
    for (let k = 0; k < 6; k++) sk.line(roadG, pz - 30 + k * 12, pzy - 5, pz - 26 + k * 12 + hash(3120 + k) * 4, pzy + 5, { stroke: P.storm, width: 1, seed: 3121 + k, wobble: 0.4, double: false });

    // ---- DETAIL: drying rut puddle + the dropped jug's dent (hero close-up, reads at 3×)
    const DX = 872, DY = roadY(DX) + 4;
    const detailG = el("g", { class: "detail" }, roadG);
    {
      const py = roadY(904) + RUTS[1] + 1, px = 904;
      // cracked dry-mud rim
      const rim = [];
      for (let k = 0; k < 18; k++) { const a = (k / 18) * Math.PI * 2; rim.push([px + Math.cos(a) * 66 * (1 + hash(3200 + k) * 0.08), py + Math.sin(a) * 15 * (1 + hash(3201 + k) * 0.12)]); }
      sk.poly(detailG, rim, { fill: P.steel, stroke: P.storm, width: 1.5, seed: 3210, wobble: 0.8, double: false, opacity: 0.85 });
      for (let k = 0; k < 14; k++) { // mud-crack polygons on the rim
        const a = (k / 14) * Math.PI * 2, r0 = 50, r1 = 64;
        sk.path(detailG, [[px + Math.cos(a) * r0, py + Math.sin(a) * r0 * 0.22], [px + Math.cos(a + 0.12) * (r0 + r1) / 2, py + Math.sin(a + 0.12) * (r0 + r1) / 2 * 0.22], [px + Math.cos(a + 0.05) * r1, py + Math.sin(a + 0.05) * r1 * 0.22]],
          { stroke: P.storm, width: 1, seed: 3220 + k, wobble: 0.3, double: false });
        if (k % 2) sk.line(detailG, px + Math.cos(a + 0.12) * 57, py + Math.sin(a + 0.12) * 57 * 0.22, px + Math.cos(a + 0.24) * 60, py + Math.sin(a + 0.24) * 60 * 0.22, { stroke: P.storm, width: 0.9, seed: 3240 + k, wobble: 0.2, double: false });
      }
      // the water: a sliver of evening sky in it
      const water = [];
      for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2; water.push([px + Math.cos(a) * 48 * (1 + hash(3260 + k) * 0.08), py + Math.sin(a) * 9.5 * (1 + hash(3261 + k) * 0.1)]); }
      sk.poly(detailG, water, { fill: C.sky, stroke: INK, width: 2, seed: 3270, wobble: 0.5 });
      sk.line(detailG, px - 34, py - 3, px + 12, py - 4, { stroke: C.light, width: 2.5, seed: 3271, wobble: 0.4, double: false });
      sk.line(detailG, px - 10, py + 2, px + 30, py + 1.5, { stroke: P.paper, width: 1.5, seed: 3272, wobble: 0.4, double: false, opacity: 0.9 });
      sk.line(detailG, px - 40, py + 4, px - 18, py + 4.5, { stroke: P.mist, width: 1.2, seed: 3273, wobble: 0.3, double: false });
      // reflected dark wedge of the ridge on the far side of the water
      sk.poly(detailG, [[px + 14, py - 8], [px + 44, py - 5], [px + 40, py - 2], [px + 20, py - 3]], { fill: C.shade, stroke: "none", seed: 3274, wobble: 0.3, double: false, opacity: 0.7 });
      // a few pebbles half sunk in the water
      [[px - 22, py + 3, 2.4], [px + 26, py + 4, 3], [px + 4, py - 5, 1.8]].forEach(([x, y, r], k) => { el("ellipse", { cx: f1(x), cy: f1(y), rx: f1(r * 1.4), ry: f1(r * 0.7), fill: P.steel, stroke: INK, "stroke-width": 1 }, detailG); sk.line(detailG, x - r * 1.8, y + r * 0.5, x + r * 1.8, y + r * 0.5, { stroke: P.mist, width: 0.8, seed: 3280 + k, wobble: 0.2, double: false }); });
      // the dent: an oval scoop in the gravel where the jug hit, kicked-out stones round it
      const jx = 836, jy = roadY(jx) - 14;
      const scoop = [];
      for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2; scoop.push([jx + Math.cos(a) * 24 * (1 + hash(3300 + k) * 0.08), jy + Math.sin(a) * 8 * (1 + hash(3301 + k) * 0.1)]); }
      // wet splash stain spreading from the dent down into the puddle
      sk.poly(detailG, [[jx - 34, jy - 4], [jx - 12, jy - 14], [jx + 26, jy - 10], [jx + 44, jy + 2], [px - 40, py - 6], [px - 50, py + 4], [jx + 26, jy + 16], [jx - 6, jy + 14], [jx - 30, jy + 8]], { fill: C.shade, stroke: "none", seed: 3310, wobble: 1.6, double: false, opacity: 0.45 });
      for (let k = 0; k < 7; k++) { // splash spatter
        const a = -2.6 + k * 0.75, r = 34 + frac(3320 + k) * 16;
        el("ellipse", { cx: f1(jx + Math.cos(a) * r), cy: f1(jy + Math.sin(a) * r * 0.35), rx: f1(2 + frac(3321 + k) * 2.5), ry: f1(1.2 + frac(3322 + k)), fill: C.shade, opacity: 0.45 }, detailG);
      }
      sk.path(detailG, [[jx + 18, jy + 4], [jx + 32, jy + 9], [px - 52, py - 1], [px - 44, py]], { stroke: C.shade, width: 2.5, seed: 3330, wobble: 0.8, double: false, opacity: 0.6 }); // trickle
      sk.poly(detailG, scoop, { fill: C.shade, stroke: INK, width: 2, seed: 3340, wobble: 0.5, double: false, opacity: 0.85 });
      sk.poly(detailG, scoop.map(([x, y]) => [jx + (x - jx) * 0.6, jy + 1 + (y - jy) * 0.55]), { fill: P.storm, stroke: "none", seed: 3339, wobble: 0.3, double: false, opacity: 0.6 });
      sk.path(detailG, scoop.slice(8, 14).concat([scoop[0]]), { stroke: C.light, width: 2.5, seed: 3341, wobble: 0.4, double: false, opacity: 0.85 }); // lit far lip
      sk.path(detailG, [[jx - 14, jy + 1], [jx - 2, jy + 4], [jx + 12, jy + 2]], { stroke: INK, width: 1.4, seed: 3342, wobble: 0.3, double: false, opacity: 0.7 }); // jug-base ridge print
      sk.path(detailG, [[jx - 10, jy - 2], [jx + 6, jy - 1]], { stroke: INK, width: 1, seed: 3343, wobble: 0.3, double: false, opacity: 0.5 });
      for (let k = 0; k < 12; k++) { // kicked-out pebbles thrown clear of the dent
        const a = (k / 12) * Math.PI * 2 + 0.2, r = 30 + frac(3350 + k) * 22;
        const x = jx + Math.cos(a) * r, y = jy + Math.sin(a) * r * 0.36, rr = 1.8 + frac(3351 + k) * 2.4;
        el("ellipse", { cx: f1(x), cy: f1(y), rx: f1(rr * 1.3), ry: f1(rr * 0.75), fill: k % 3 ? P.mist : C.light, stroke: INK, "stroke-width": 1, transform: "rotate(" + f1(hash(3352 + k) * 30) + " " + f1(x) + " " + f1(y) + ")" }, detailG);
        el("path", { d: "M" + f1(x - rr) + " " + f1(y + rr * 0.8) + " L" + f1(x - rr * 2.8) + " " + f1(y + rr * 1.3), stroke: C.shade, "stroke-width": f1(rr * 0.9), opacity: 0.35, "stroke-linecap": "round" }, detailG);
      }
    }

    sk.path(roadG, frontEdge, { stroke: INK, width: LINE.main, seed: 2990, wobble: 1.6 });

    // ------------------------------------------------------------------ OBJECTS ON THE UPHILL EDGE
    // ---- the gate: rusted steel pipe gate swung open along the uphill edge
    const GX = 330, GY = backY(GX) + 8, ARM = GY - 98, GX0 = 72;
    const gateG = el("g", { class: "gate" }, g);
    {
      const n = Math.hypot(shadowDir.dx, shadowDir.dy), ux = shadowDir.dx / n, uy = shadowDir.dy / n;
      castShadow(gateG, GX, GY, 18, 360, 0.42, 3400);
      const sh = [];
      for (let x = GX; x >= GX0; x -= 20) { const h = GY - ARM + (backY(x) - backY(GX)); sh.push([x + ux * h * 1.9, backY(x) + 14 + uy * h * 1.9]); }
      sk.path(gateG, sh, { stroke: C.shade, width: 7, seed: 3401, wobble: 1, double: false, opacity: 0.38 });
      // rest post (a forked stake) at the free end
      const RX = GX0 + 14, RB = backY(RX) + 10;
      castShadow(gateG, RX, RB, 10, 240, 0.4, 3402);
      sk.poly(gateG, [[RX - 6, RB], [RX - 5, ARM + 10], [RX + 5, ARM + 10], [RX + 6, RB]], { fill: C.gravel, stroke: INK, width: 3, seed: 3403, wobble: 0.6 });
      sk.line(gateG, RX - 4, ARM + 12, RX - 12, ARM - 8, { stroke: INK, width: 4, seed: 3404, wobble: 0.3 });
      sk.line(gateG, RX + 4, ARM + 12, RX + 10, ARM - 8, { stroke: INK, width: 4, seed: 3405, wobble: 0.3 });
      // hinge post (heavy pipe) with a cap and collars
      sk.poly(gateG, [[GX - 10, GY + 4], [GX - 9, GY - 150], [GX + 9, GY - 150], [GX + 10, GY + 4]], { fill: C.rust, stroke: INK, width: LINE.main, seed: 3410, wobble: 0.6 });
      sk.hatch(clipTo(gateG, [[GX - 9, GY], [GX - 9, GY - 150], [GX + 9, GY - 150], [GX + 9, GY]]), GX - 10, GY - 152, 20, 156, { gap: 5, angle: 95, stroke: C.shade, width: 1.5, opacity: 0.5, seed: 3411 });
      sk.line(gateG, GX + 6, GY - 146, GX + 7, GY - 4, { stroke: C.light, width: 2, seed: 3412, wobble: 0.4, double: false, opacity: 0.9 });
      sk.poly(gateG, [[GX - 13, GY - 150], [GX - 10, GY - 160], [GX + 10, GY - 160], [GX + 13, GY - 150]], { fill: C.gravel, stroke: INK, width: 3, seed: 3413, wobble: 0.4 });
      [ARM - 8, ARM + 34].forEach((y, i) => sk.rect(gateG, GX - 13, y, 26, 12, { fill: C.rust, stroke: INK, width: 2.5, seed: 3414 + i, wobble: 0.4 }));
      // swing arm (top pipe) + lower rail + stays + brace
      const LOW = ARM + 40;
      sk.line(gateG, GX - 4, ARM + 2, GX0, ARM + 2, { stroke: INK, width: 12, seed: 3420, wobble: 0.6 });
      sk.line(gateG, GX - 4, ARM + 1, GX0 + 2, ARM + 1, { stroke: C.rust, width: 6, seed: 3421, wobble: 0.6, double: false });
      sk.line(gateG, GX - 4, ARM - 2, GX0 + 4, ARM - 2, { stroke: C.light, width: 2, seed: 3422, wobble: 0.5, double: false, opacity: 0.85 });
      sk.line(gateG, GX - 4, LOW, GX0 + 60, LOW, { stroke: INK, width: 8, seed: 3423, wobble: 0.6 });
      sk.line(gateG, GX - 4, LOW, GX0 + 62, LOW, { stroke: C.rust, width: 3.5, seed: 3424, wobble: 0.6, double: false });
      for (let x = GX - 60; x > GX0 + 40; x -= 60) {
        sk.line(gateG, x, ARM + 6, x, LOW, { stroke: INK, width: 6, seed: 3430 + x, wobble: 0.3 });
        sk.line(gateG, x, ARM + 6, x, LOW, { stroke: C.rust, width: 2.5, seed: 3431 + x, wobble: 0.3, double: false });
      }
      sk.line(gateG, GX - 6, ARM + 38, GX - 110, ARM + 6, { stroke: INK, width: 5, seed: 3440, wobble: 0.4 });
      // end bar at the latch with a chain + padlock hanging
      sk.line(gateG, GX0 + 4, ARM - 10, GX0 + 4, ARM + 48, { stroke: INK, width: 8, seed: 3441, wobble: 0.3 });
      sk.line(gateG, GX0 + 4, ARM - 8, GX0 + 4, ARM + 46, { stroke: C.rust, width: 3, seed: 3442, wobble: 0.3, double: false });
      for (let k = 0; k < 6; k++) el("ellipse", { cx: f1(GX0 + 12 + Math.sin(k * 0.6) * 3), cy: f1(ARM + 10 + k * 7), rx: k % 2 ? 2 : 3.4, ry: k % 2 ? 4.2 : 3, fill: "none", stroke: INK, "stroke-width": 2 }, gateG);
      sk.path(gateG, [[GX0 + 9, ARM + 56], [GX0 + 9, ARM + 50], [GX0 + 13, ARM + 46], [GX0 + 17, ARM + 50], [GX0 + 17, ARM + 56]], { stroke: INK, width: 2, seed: 3443, wobble: 0.2, double: false });
      sk.rect(gateG, GX0 + 6, ARM + 56, 14, 13, { fill: C.gravel, stroke: INK, width: 2, seed: 3444, wobble: 0.3, double: false });
      el("circle", { cx: GX0 + 13, cy: ARM + 63, r: 1.6, fill: INK }, gateG);
      // stencilled plate on the arm, rust run-off under the bolts
      const PX = GX - 168, PY = ARM + 6;
      sk.rect(gateG, PX - 42, PY, 84, 30, { fill: P.fog, stroke: INK, width: 2.5, seed: 3450, wobble: 0.5 });
      [[PX - 36, PY + 5], [PX + 36, PY + 5]].forEach(([x, y], i) => { el("circle", { cx: x, cy: y, r: 2, fill: C.rust, stroke: INK, "stroke-width": 1 }, gateG); sk.line(gateG, x, y + 2, x + 1, y + 20, { stroke: C.rust, width: 2.5, seed: 3451 + i, wobble: 0.5, double: false, opacity: 0.75 }); });
      const t1 = el("text", { x: PX, y: PY + 14, "text-anchor": "middle", "font-family": "League Gothic, Oswald, Impact, sans-serif", "font-size": 12, fill: P.storm, textLength: 60, lengthAdjust: "spacingAndGlyphs" }, gateG);
      t1.textContent = "ROAD 1100";
      const t2 = el("text", { x: PX, y: PY + 26, "text-anchor": "middle", "font-family": "League Gothic, Oswald, Impact, sans-serif", "font-size": 12, fill: P.storm, textLength: 70, lengthAdjust: "spacingAndGlyphs" }, gateG);
      t2.textContent = "NO MOTOR VEHICLES";
      sk.hatch(gateG, PX - 42, PY, 84, 30, { gap: 7, angle: 100, stroke: C.rust, width: 1.5, opacity: 0.35, seed: 3455 });
      sk.line(gateG, GX - 60, ARM + 4, GX - 40, ARM + 30, { stroke: C.rust, width: 2, seed: 3456, wobble: 0.5, double: false, opacity: 0.6 });
    }

    // ---- the big old-growth stump (Mags sits on it), springboard notch, a lichen crust
    const SX = 1200, SW = 156, SH = 70, SB = backY(SX) + 16, SEAT = SB - SH;
    const stumpG = el("g", { class: "big-stump" }, g);
    stump(stumpG, SX, SB, SW, SH, 3500, { lw: LINE.main, fill: P.slate, shadowLen: 300, shadowOp: 0.45 });
    sk.poly(stumpG, [[SX - 30, SB - 44], [SX + 4, SB - 46], [SX + 4, SB - 34], [SX - 30, SB - 32]], { fill: P.night, stroke: INK, width: 2.5, seed: 3530, wobble: 0.4 }); // springboard notch
    sk.line(stumpG, SX - 28, SB - 31, SX + 3, SB - 33, { stroke: C.light, width: 1.5, seed: 3531, wobble: 0.3, double: false, opacity: 0.6 });
    [[SX + 40, SB - 24, 7], [SX - 54, SB - 14, 6], [SX + 58, SB - 46, 5]].forEach(([x, y, r], i) => sk.circle(stumpG, x, y, r, { fill: P.fog, stroke: P.storm, width: 1, seed: 3540 + i, wobble: 0.6, double: false, opacity: 0.7 }));
    // roots gripping the cut bank
    sk.path(stumpG, [[SX - 90, SB - 2], [SX - 120, SB - 10], [SX - 150, SB - 6]], { stroke: INK, width: 5, seed: 3550, wobble: 0.8 });
    sk.path(stumpG, [[SX + 92, SB - 4], [SX + 126, SB - 18], [SX + 150, SB - 16]], { stroke: INK, width: 5, seed: 3551, wobble: 0.8 });
    tuft(stumpG, SX - 70, SB + 2, 18, 3560, C.grass, C.light);
    tuft(stumpG, SX + 84, SB, 16, 3570, C.grass, C.light);

    // ---- road-number post on the downhill edge
    const NX = 640, NY = roadY(NX) + FRONT - 2;
    const postG = el("g", { class: "road-post" }, g);
    castShadow(postG, NX, NY, 8, 150, 0.4, 3600);
    sk.poly(postG, [[NX - 5, NY + 4], [NX - 4, NY - 64], [NX + 4, NY - 64], [NX + 5, NY + 4]], { fill: C.gravel, stroke: INK, width: 3, seed: 3601, wobble: 0.4 });
    sk.rect(postG, NX - 20, NY - 62, 40, 20, { fill: P.fog, stroke: INK, width: 2.5, seed: 3602, wobble: 0.4 });
    const nt = el("text", { x: NX, y: NY - 46.5, "text-anchor": "middle", "font-family": "League Gothic, Oswald, Impact, sans-serif", "font-size": 15, fill: P.storm, textLength: 30, lengthAdjust: "spacingAndGlyphs" }, postG);
    nt.textContent = "1100";

    // ---- the cardboard CAMP sign on a stake at the crest
    const CRX = 1760, CRY = roadY(CRX);
    const signX = 1716, signBase = backY(signX) + 6, signTop = signBase - 112;
    const signG = el("g", { class: "camp-sign" }, g);
    castShadow(signG, signX, signBase, 7, 260, 0.42, 3700);
    sk.poly(signG, [[signX - 4, signBase + 3], [signX - 3, signTop + 6], [signX + 3, signTop + 6], [signX + 4, signBase + 3]], { fill: C.gravel, stroke: INK, width: 3, seed: 3701, wobble: 0.4 });
    const SCW = 92, SCH = 44, scx = signX + 4, scy = signTop + 20;
    sk.poly(signG, [[scx - SCW / 2, scy - SCH / 2 + 3], [scx + SCW / 2 - 2, scy - SCH / 2], [scx + SCW / 2 + 1, scy + SCH / 2 - 1], [scx - SCW / 2 + 3, scy + SCH / 2 + 2]], { fill: C.light, stroke: INK, width: 3, seed: 3702, wobble: 0.6 });
    sk.line(signG, scx - SCW / 2 + 5, scy - SCH / 2 + 6, scx + SCW / 2 - 6, scy - SCH / 2 + 3.5, { stroke: C.gravel, width: 1.4, seed: 3703, wobble: 0.5, double: false });
    sk.poly(signG, [[scx + SCW / 2 - 14, scy + SCH / 2], [scx + SCW / 2 + 1, scy + SCH / 2 - 1], [scx + SCW / 2 - 1, scy + SCH / 2 - 10]], { fill: C.sky, stroke: INK, width: 1.5, seed: 3704, wobble: 0.3, double: false });
    el("circle", { cx: signX, cy: scy - SCH / 2 + 6, r: 2.2, fill: P.slate, stroke: INK, "stroke-width": 1 }, signG);
    const ct = el("text", { x: scx - 6, y: f1(scy + 9), "text-anchor": "middle", "font-family": '"Kalam", "Comic Sans MS", cursive', "font-weight": 700, "font-size": 26, fill: INK, textLength: 58, lengthAdjust: "spacingAndGlyphs", transform: "rotate(-3 " + scx + " " + scy + ")" }, signG);
    ct.textContent = "CAMP";
    sk.path(signG, [[scx + 26, scy + 2], [scx + 40, scy + 1], [scx + 34, scy - 5], [scx + 40, scy + 1], [scx + 34, scy + 7]], { stroke: INK, width: 3, seed: 3705, wobble: 0.3, double: false });
    // a strip of pale flagging tape tied under the card
    sk.path(signG, [[signX + 2, scy + SCH / 2 + 10], [signX - 12, scy + SCH / 2 + 22], [signX - 22, scy + SCH / 2 + 26], [signX - 30, scy + SCH / 2 + 36]], { stroke: P.paper, width: 4, seed: 3706, wobble: 0.5, double: false });
    sk.path(signG, [[signX + 2, scy + SCH / 2 + 10], [signX - 8, scy + SCH / 2 + 26], [signX - 12, scy + SCH / 2 + 40]], { stroke: P.fog, width: 3, seed: 3707, wobble: 0.5, double: false });

    // ------------------------------------------------------------------ DOWNHILL BANK + FOREGROUND (below the road)
    const fgG = el("g", { class: "foreground" }, g);
    const bankTop = frontEdge;
    const bankPoly = [[-20, roadY(0) + FRONT]].concat(bankTop, [[1940, roadY(1920) + FRONT], [1940, 1100], [-20, 1100]]);
    sk.poly(fgG, bankPoly, { fill: grad("bank", [[0, C.grass], [0.3, C.shade], [1, P.storm]]), stroke: "none", seed: 3800, wobble: 0, double: false });
    const bankClip = clipTo(fgG, bankPoly);
    sk.hatch(bankClip, -20, 520, 1980, 440, { gap: 13, angle: 38, stroke: C.shade, width: 2, opacity: 0.35, seed: 3801 });
    sk.hatch(bankClip, -20, 900, 1960, 200, { gap: 18, angle: 38, stroke: INK, width: 2, opacity: 0.18, seed: 3802 });
    // sidecast gravel spilling down the bank (raw, catching the light)
    for (let i = 0; i < 40; i++) {
      const x = 10 + i * 48 + hash(3810 + i) * 14, y0 = roadY(x) + FRONT + 4;
      const l = 12 + frac(3811 + i) * 22, x1 = x - 4 + hash(3812 + i) * 6;
      sk.path(fgG, [[x, y0], [x + (x1 - x) * 0.5 + 2, y0 + l * 0.5], [x1, y0 + l]], { stroke: i % 3 ? C.gravel : C.light, width: 2.5, seed: 3813 + i, wobble: 1, double: false, opacity: 0.6 });
      for (let k = 0; k < 3; k++) el("ellipse", { cx: f1(x1 + hash(3814 + i * 3 + k) * 8), cy: f1(y0 + l + 3 + k * 4), rx: f1(1.5 + frac(3815 + i + k) * 2), ry: 1.4, fill: k % 2 ? C.gravel : P.mist, stroke: P.storm, "stroke-width": 0.8 }, fgG);
    }
    sk.path(fgG, bankTop, { stroke: INK, width: LINE.main, seed: 3850, wobble: 1.8 });
    // the culvert outlet (corrugated steel, rusted), dry streambed of pale stones below it
    const CX = 1480, CY = roadY(CX) + FRONT + 62;
    const culvG = el("g", { class: "culvert" }, fgG);
    for (let i = 0; i < 14; i++) {
      const t = i / 14, x = CX - 20 - t * 120 + hash(3900 + i) * 30, y = CY + 34 + t * 200;
      if (y > 930) continue;
      rock(culvG, x, y, 10 + frac(3901 + i) * 12, 7 + frac(3902 + i) * 6, 3910 + i, i % 2 ? P.mist : P.fog, { width: 2, stroke: P.storm });
    }
    sk.poly(culvG, [[CX - 4, CY - 34], [CX + 70, CY - 46], [CX + 76, CY + 22], [CX + 2, CY + 34]], { fill: C.rust, stroke: INK, width: 3, seed: 3930, wobble: 0.6 });
    for (let k = 1; k < 6; k++) sk.line(culvG, CX + k * 12, CY - 34 - k * 2, CX + 2 + k * 12, CY + 34 - k * 2.2, { stroke: C.shade, width: 2, seed: 3931 + k, wobble: 0.4, double: false, opacity: 0.6 });
    sk.circle(culvG, CX, CY, 36, { fill: C.rust, stroke: INK, width: LINE.main, seed: 3940, wobble: 0.6 });
    for (let k = 0; k < 3; k++) el("ellipse", { cx: CX + 1, cy: CY, rx: 33 - k * 3, ry: 33 - k * 3, fill: "none", stroke: k % 2 ? C.light : C.shade, "stroke-width": 1.6, opacity: 0.7 }, culvG);
    el("ellipse", { cx: CX + 3, cy: CY + 1, rx: 24, ry: 24, fill: P.night, stroke: INK, "stroke-width": 2 }, culvG);
    sk.path(culvG, [[CX - 10, CY + 18], [CX, CY + 22], [CX + 12, CY + 20]], { stroke: C.gravel, width: 2, seed: 3941, wobble: 0.4, double: false }); // dry silt lip
    for (let k = 0; k < 5; k++) sk.line(culvG, CX - 14 + k * 7, CY - 10, CX - 4 + k * 3, CY + 18, { stroke: P.mist, width: 0.8, seed: 3942 + k, wobble: 0.2, double: false, opacity: 0.6 }); // a web across the mouth
    sk.line(culvG, CX - 30, CY + 22, CX - 22, CY + 60, { stroke: C.rust, width: 3, seed: 3950, wobble: 0.6, double: false, opacity: 0.7 });
    // rocks, tufts and fireweed along the outer road edge (kept out of the figure zone)
    [[120, 18], [260, 14], [1650, 20], [1800, 16], [1890, 22]].forEach(([x, w], i) => rock(fgG, x, roadY(x) + FRONT + 12, w, w * 0.7, 3960 + i, i % 2 ? P.mist : C.gravel));
    for (let i = 0; i < 22; i++) {
      const x = 20 + i * 88 + hash(3970 + i) * 20, y = roadY(x) + FRONT + 26 + frac(3971 + i) * 40;
      if (y > 930) continue;
      tuft(fgG, x, y, 20 + frac(3972 + i) * 12, 3980 + i * 9, C.grass, C.light);
    }
    [[54, 0], [150, 1], [232, 2], [1630, 3], [1700, 4], [1846, 5]].forEach(([x, i]) => fireweed(fgG, x, roadY(x) + FRONT + 10, 110 + frac(4000 + i) * 60, 4010 + i * 31));
    // slash on the bank, low left
    slash(fgG, 330, 990, 200, 50, 4100, { n: 12, stroke: C.shade, lw: 3 });
    // the open bank at right: a few cut stumps, a slash heap and a young fir, all throwing long shadows
        slash(fgG, 1170, 884, 170, 50, 4280, { n: 16, stroke: INK, lw: 3 });
    [[1030, 912, 58], [1258, 846, 44], [1610, 812, 66], [1560, 912, 40], [1100, 790, 30]].forEach(([x, y, w], i) => stump(fgG, x, y, w, w * 0.55, 4300 + i * 50, { lw: 3, fill: C.shade, shadowLen: w * 3.4, shadowOp: 0.5 }));
    castShadow(fgG, 1690, 900, 50, 330, 0.45, 4390);
    fir(fgG, 1690, 900, 190, 120, { fill: P.slate, stroke: INK, width: 3, seed: 4400, tiers: 6, double: false, needles: C.shade, trunk: C.shade, rim: C.light, rimSide: 1 });
    // big foreground stump silhouette at bottom right (low detail)
    stump(fgG, 1770, 1060, 240, 110, 4200, { lw: LINE.main, fill: C.shade, top: C.gravel, shadowLen: 360, shadowOp: 0.5 });

    // ------------------------------------------------------------------ LIGHT (shafts, bloom, dust)
    const hz = [];
    roadPoints.forEach(([x, y]) => hz.push([x, y - BACK - 70]));
    const hzBot = roadPoints.slice().reverse().map(([x, y]) => [x, y + FRONT]);
    const LT = drawLight(S, {
      bloom: 380, len: 2300, motes: 160, moteR0: 160, moteY0: 300, moteY1: 930,
      shafts: [[134, 3, 0.2], [142, 5, 0.26], [150, 2.5, 0.2], [157, 4.5, 0.24], [164, 3, 0.2], [170, 2, 0.16]],
      haze: hz.concat(hzBot),
    });

    return {
      g, view: "default", light,
      groundY: Math.round(roadY(0)),
      roadY,
      roadPoints,
      road: { g: roadG, back: BACK, front: FRONT, x0: 0, y0: Math.round(roadY(0)), x1: 1920, y1: Math.round(roadY(1920)) },
      stump: { g: stumpG, x: SX, y: Math.round(SB), seatY: Math.round(SEAT), w: SW },
      gate: { g: gateG, x: GX, y: Math.round(GY), armY: Math.round(ARM), x0: GX0 },
      crest: { x: CRX, y: Math.round(CRY) },
      sideRoad: { g: sideG, x: 1820, y: 462, points: sidePts, x0: sidePts[0][0], y0: sidePts[0][1], x1: sidePts[sidePts.length - 1][0], y1: sidePts[sidePts.length - 1][1] },
      sign: { g: signG, x: scx, y: Math.round(scy) },
      culvert: { g: culvG, x: CX, y: Math.round(CY) },
      hill: { g: hillG }, bay: { g: bayG }, timber: { g: timberG },
      sun: S, skyG, lightG: LT.lightG, shafts: LT.shafts, dust: { g: LT.dustG }, shadowDir,
      detail: { g: detailG, x: DX, y: Math.round(DY) },
    };
  };
})();
