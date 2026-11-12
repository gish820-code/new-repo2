/* Rainy Day background — `gullCreekBridge` v1. Episode 5, DAY 9, AFTERNOON HAZE.
 * The collapsed Highway 101 bridge over Gull Creek — the same concrete girder bridge seen tiny and broken in the
 * middle in Episode 2's `townView` (bridge handle): a concrete deck slab on girders, post-and-top-rail bridge railing,
 * concrete piers. Here we stand ON the near approach. The coast highway runs in from the left (cracked asphalt,
 * faded centerline, a W-beam guardrail stub, a steel/paper "HWY 101" shield sign and a mile marker), crosses the
 * near abutment onto the deck and ENDS at x≈1300 in a broken, cracked edge with bent rebar and the bridge railing
 * torn off and dangling into the gap. Across the gap the far abutment and road carry on (unreachable). Through the
 * gap you look down the deep wooded gorge (Gull Creek low and thin on a wide gravel bed); the far half of the span
 * lies tilted in the creek far below, propped on a broken pier stump. Through the gorge mouth: the sea and the mud
 * flats with the tide OUT. Wind-bent firs on both rims, wind-streaked clouds, flat bright haze.
 *
 * opts.view: "below" = alternative composition from DOWN in the gorge (upstream of the bridge, on the creek bed)
 * looking up at the broken deck high overhead (scenes put tiny figures on it at underView.deckEdgeY), the near pier,
 * the far stub, the fallen span lying tilted against the far pier, the sea glimpsed under the bridge.
 *
 * Paste VERBATIM after assets/characters/rainy-day-rig-v3.js (uses only palette, LINE, el, sk, hash).
 * Deterministic, static; scenes own all motion.
 *
 *   const bg = window.RainyDayBG.gullCreekBridge(layerG, {});               // approach view
 *   const lo = window.RainyDayBG.gullCreekBridge(layerG, { view: "below" }); // from the gorge floor
 *   RD.figure(fg, { character: "drizzle", x: 900, y: bg.groundY - 116 * 1.4, scale: 1.4 });
 *   tl.to(p, { y: bg.seaG.inY, onUpdate: () => bg.seaG.setLevel(p.y) });     // tide comes in
 *
 * OPTS (all optional):
 *   view:  "approach" (default) | "below"
 *   light: "haze" (default; the only grade this location has — flat bright afternoon haze)
 *   tide:  initial waterline (screen y) for seaG.setLevel; default = seaG.outY (tide OUT)
 *
 * HANDLES — APPROACH view (screen px in the 1920x1080 viewBox):
 *   g             root <g>
 *   view          "approach"
 *   groundY = 860 approach deck where feet stand. Flat for x 0..1262 (figure y = 860 - 116*scale; 697.6 at 1.4).
 *                 The road band runs y 800 (back curb) .. 905 (front lip); feet anywhere 820..890 sit on asphalt.
 *   edge   { x: 1262, y: 860, xFront: 1350, lipX: 1300 }  the broken edge. x = the safe stop line (the break
 *                 starts here at the back curb, figures stop at or before it); at the feet line the asphalt reaches
 *                 lipX ≈ 1300; xFront = the jagged tip at the front lip (y 905).
 *   rebar  { g, tips: [[x,y],..] }  the bent bars sticking out of the break (tips = bar ends, for drips/dust).
 *   guardrail { g, x0: 110, x1: 600, y: 800, seatY: 716 }  the W-beam guardrail STUB on the approach (back curb):
 *                 y = where its posts stand, seatY = rail top (a figure sitting on it puts its hip here).
 *   bridgeRail { g, x0: 650, x1: 1250, topY: 720, dangle: {g, x: 1398, y: 1030, pivotX: 1248, pivotY: 722} }
 *                 bridge railing (posts + top rail) on the deck; its torn end hangs into the gap BEHIND the slab
 *                 (dangle.x/y = the hanging end; scenes may swing dangle.g with svgOrigin "1248 722").
 *   crowdZone { x0: 300, x1: 1180 }  where a waiting crowd stands (feet on groundY); keep x 1180–1262 for the
 *                 one figure at the edge.
 *   signBus { x: 214, y: 640, w: 64 }  the HWY 101 sign post just under the shield: tape the 'BUS →' cardboard
 *                 centred here (post is 8 px wide; a ~90x50 card fits, nothing behind it).
 *   sign    { g, x: 214, y: 520 }  the HWY 101 shield (x,y = shield centre). milePost { g, x: 540, y: 744 }.
 *   gorge   { g, bottomY: 800, creek: [[x,y],..], mouth: {x: 1415, y: 548} }  the gorge seen through the gap;
 *                 bottomY = creek bed where the fallen span's nose lies (x≈1400), far below; creek = polyline from
 *                 the mouth (548) down to where fir crowns hide the bed (~840). Below y≈800 the gap is filled by the
 *                 crowns of tall firs growing from the bed under the bridge (their tops just below deck level).
 *   span    { g, x0: 1392, y0: 790, x1: 1606, y1: 716 }  the fallen half (low nose in the creek / high end on a
 *                 broken pier stump).
 *   farSide { g, x0: 1742, y: 860 }  the far abutment road (unreachable), same depth as our deck.
 *   seaG    { g, waterG, levelY, outY: 486, inY: 530, setLevel(y) }  the sea through the gorge mouth over the mud
 *                 flats. setLevel(y) moves the waterline (screen y) over the flats: 486 = tide OUT (default, wide
 *                 shining flats) … 530 = tide IN (flats covered). Safe in onUpdate.  (Also exported as `sea`.)
 *   setLevel(y)   shortcut for seaG.setLevel.
 *   underView { view: "below", deckEdgeY: 252, edgeX: 1004, figScale: 0.2 }  numbers of the BELOW composition
 *                 (so a scene can plan the cut); the drawing itself needs opts.view: "below".
 *   skyG          sky + clouds group.     lightG   light overlays (hazy sun glare, sea sheen, deck sheen) —
 *                 scenes may tween its opacity.     shadowDir { dx: 0.42, dy: 0.22 } (soft haze shadows fall
 *                 right / toward camera).
 *   detail  { g, x: 1312, y: 878 }  hero close-up: the cracked deck edge with rebar, aggregate, spalls,
 *                 crumbs, the torn railing — holds detail at 3x around (x, y).
 *   far { g }, mid { g }, deck { g }, fg { g }   layer groups (parallax / dimming).
 *
 * HANDLES — BELOW view (opts.view: "below"):
 *   g, view: "below", groundY = 900 (gravel bank / creek bed where foreground feet stand, x 300..1500)
 *   underView { deckEdgeY: 252, deckTopY: 252, edgeX: 1004, x0: 560, x1: 990, figScale: 0.2 }
 *                 tiny figures stand ON the broken deck high above: feet at deckEdgeY for x in x0..x1
 *                 (figScale ≈ the RD.figure scale that fits the deck: y = 252 - 116*0.2).
 *   deckEdgeY = 252 (same number, top level)
 *   edge  { x: 1004, y: 252 }  broken end of the near deck overhead.    rebar { g, tips }  hanging bars/strands.
 *   guardrail { g, x0: 0, x1: 964, y: 252, seatY: 214 }  = the bridge railing up on the deck (torn at the end).
 *   pier  { g, x: 425, topY: 362, y: 868 }  the near pier.   span { g, x0: 700, y0: 800, x1: 1360, y1: 520 }
 *                 the fallen span (nose in the creek / high end on the broken far pier).   farSide { g, x0: 1440, y }
 *   gorge { g, floorG, bottomY: 900, creek: [[x,y],..] }   crowdZone { x0: 560, x1: 990 } (on the deck, tiny)
 *   signBus { x: 214, y: 640 } kept for symmetry (not visible from below).
 *   seaG / setLevel(y)  a small glimpse of sea + flats under the bridge (outY 650, inY 668).
 *   skyG, lightG (hazy shafts down through the gap), shadowDir { dx: 0.42, dy: 0.22 },
 *   detail { g, x: 1004, y: 300 }  the broken deck end overhead with hanging rebar and strands.
 */
window.RainyDayBG = window.RainyDayBG || {};
if (!window.RainyDayBG.gullCreekBridge) window.RainyDayBG.gullCreekBridge = function (parent, opts) {
  opts = opts || {};
  const RD = window.RainyDay, P = RD.palette, LINE = RD.LINE, sk = RD.sk, el = RD.el, H = RD.hash;
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
  const VIEW = opts.view === "below" ? "below" : "approach";
  const LIGHT = "haze";
  const SHADOW = { dx: 0.42, dy: 0.22 };
  const UNDER = { view: "below", deckEdgeY: 252, deckTopY: 252, edgeX: 1004, x0: 560, x1: 990, figScale: 0.2 };

  let SEED = 5500 + (VIEW === "below" ? 3000 : 0);
  const S = () => (SEED += 7);
  const rnd = (i) => (H(i * 1.731 + 57.9) + 1) / 2; // deterministic 0..1
  const D = (o) => Object.assign({ seed: S() }, o);
  const DET = (o) => Object.assign({ seed: S(), width: LINE.detail, double: false }, o);
  const f1 = (v) => (+v).toFixed(1);
  const uid = "rdGcb" + (window.__rdGcbN = (window.__rdGcbN || 0) + 1) + "_";
  const FONT_SIGN = "'League Gothic', Oswald, Impact, 'Arial Narrow', sans-serif";

  const root = el("g", { class: "rd-bg rd-bg-gull-creek-bridge rd-gcb-" + VIEW }, parent);
  const defs = el("defs", {}, root);
  const layer = (name, par) => el("g", { class: "gcb-" + name }, par || root);
  function lgrad(name, stops, x2, y2) {
    const lg = el("linearGradient", { id: uid + name, x1: 0, y1: 0, x2: x2 || 0, y2: y2 === undefined ? 1 : y2 }, defs);
    stops.forEach(([o, c, a]) => el("stop", { offset: o, "stop-color": c, "stop-opacity": a === undefined ? 1 : a }, lg));
    return "url(#" + uid + name + ")";
  }
  let clipN = 0;
  function clipTo(par, pts) {
    const cid = uid + "clip" + (clipN++);
    const cp = el("clipPath", { id: cid }, defs);
    el("path", { d: "M" + pts.map((q) => f1(q[0]) + " " + f1(q[1])).join(" L") + " Z" }, cp);
    return el("g", { "clip-path": "url(#" + cid + ")" }, par);
  }
  function txt(par, x, y, s, o) {
    o = o || {};
    const a = { x: f1(x), y: f1(y), "font-family": o.font || FONT_SIGN, "font-size": o.size || 24, fill: o.fill || INK, "text-anchor": o.anchor || "middle" };
    if (o.weight) a["font-weight"] = o.weight;
    if (o.len) { a.textLength = o.len; a.lengthAdjust = "spacingAndGlyphs"; }
    if (o.opacity !== undefined) a.opacity = o.opacity;
    if (o.rot) a.transform = "rotate(" + o.rot + " " + f1(x) + " " + f1(y) + ")";
    const t = el("text", a, par);
    t.textContent = s;
    return t;
  }
  function lines(par, segs, o) {
    o = o || {};
    const d = segs.map((s) => "M" + f1(s[0]) + " " + f1(s[1]) + " L" + f1(s[2]) + " " + f1(s[3])).join(" ");
    return el("path", { d, stroke: o.stroke || P.storm, "stroke-width": o.width || 1.6, fill: "none", opacity: o.opacity !== undefined ? o.opacity : 0.35, "stroke-linecap": "round" }, par);
  }
  const ellPts = (cx, cy, rx, ry, n) => {
    const a = []; n = n || 20;
    for (let i = 0; i < n; i++) { const t = (i / n) * Math.PI * 2; a.push([cx + Math.cos(t) * rx, cy + Math.sin(t) * ry]); }
    return a;
  };
  const lerp = (a, b, t) => a + (b - a) * t;
  // piecewise-linear y on a polyline at x
  function polyY(pts, x) {
    if (x <= pts[0][0]) return pts[0][1];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      if (x >= a[0] && x <= b[0]) return a[1] + ((b[1] - a[1]) * (x - a[0])) / Math.max(0.001, b[0] - a[0]);
    }
    return pts[pts.length - 1][1];
  }

  // ------------------------------------------------------------------ drawing kits
  // wind-bent fir: the crown is pushed downwind (+lean px at the top), boughs streamed out on the lee side
  function windFir(par, x, by, h, w, o) {
    o = o || {};
    const fg = el("g", { opacity: o.opacity !== undefined ? o.opacity : 1 }, par);
    const fill = o.fill || EP5.leafDark, stroke = o.stroke || INK, lw = o.width || LINE.main, lean = o.lean || 0;
    const tiers = o.tiers || Math.max(4, Math.round(h / 46));
    const cxAt = (t) => x + lean * Math.pow(1 - t, 1.5); // t: 0 top .. 1 base
    sk.path(fg, [[x, by + 4], [cxAt(0.7), by - h * 0.3], [cxAt(0.25), by - h * 0.75], [cxAt(0.02), by - h * 0.98]], { seed: S(), stroke, width: Math.max(lw * 0.8, w * 0.05), double: false, wobble: 0.8 });
    const top = [cxAt(0), by - h];
    const right = [], left = [];
    for (let i = 1; i <= tiers; i++) {
      const t = i / tiers, yy = by - h + h * 0.86 * t, cx = cxAt(t);
      const ww = (w / 2) * (0.22 + 0.78 * t);
      const wr = ww * 1.25, wl = ww * 0.62; // lee (right) side longer
      right.push([cx + wr, yy + 3 + wr * 0.08], [cx + wr * 0.5, yy - h * 0.035]);
      left.push([cx - wl * 0.55, yy - h * 0.03], [cx - wl, yy + 4]);
    }
    const shape = [top].concat(right.slice(0, -1), [[cxAt(0.9) + w * 0.12, by - h * 0.1], [cxAt(0.9) - w * 0.1, by - h * 0.1]], left.reverse().slice(1));
    sk.poly(fg, shape, { seed: S(), fill, stroke, width: lw, step: 200, wobble: o.wobble !== undefined ? o.wobble : 1.3, double: o.double });
    if (o.boughs !== false) {
      for (let i = 1; i < tiers; i++) {
        const t = i / tiers, yy = by - h + h * 0.86 * t, cx = cxAt(t), ww = (w / 2) * (0.22 + 0.78 * t);
        sk.path(fg, [[cx - ww * 0.2, yy - h * 0.05], [cx + ww * 0.9, yy + ww * 0.05]], { seed: S(), stroke, width: Math.max(1, lw * 0.5), opacity: 0.5, double: false });
      }
    }
    return fg;
  }
  // tiny distant fir: a leaning wedge
  function farFir(par, x, by, h, fill, lean, op) {
    return sk.poly(par, [[x + (lean || 0), by - h], [x - h * 0.22, by], [x + h * 0.3, by]], { seed: S(), fill, stroke: fill, width: 1.4, wobble: 0.5, double: false, opacity: op === undefined ? 1 : op });
  }
  // wind streak cloud: a long tapered sliver, slightly rising to the right
  function streak(par, x, y, w, h, o) {
    o = o || {};
    const n = 9, top = [], bot = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, xx = x + w * t, rise = -w * 0.05 * t;
      const th = h * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.7)), 0.8) * (0.75 + 0.25 * rnd(x + i));
      top.push([xx, y + rise - th * 0.75]);
      bot.push([xx, y + rise + th * 0.25]);
    }
    return sk.poly(par, top.concat(bot.reverse()), { seed: S(), fill: o.fill || P.paper, stroke: o.stroke || P.fog, width: o.width || 1.6, opacity: o.opacity !== undefined ? o.opacity : 0.9, step: 60, wobble: 1.2, double: false });
  }
  // concrete aggregate speckle inside a rect-ish region (small pebbles, voids)
  function aggregate(par, x0, y0, x1, y1, n, sz, op, light) {
    const ag = el("g", { opacity: op === undefined ? 0.8 : op }, par);
    for (let i = 0; i < n; i++) {
      const x = lerp(x0, x1, rnd(SEED * 0.01 + i * 2.3)), y = lerp(y0, y1, rnd(SEED * 0.013 + i * 5.1)), r = sz * (0.4 + rnd(i * 7.7 + SEED * 0.02) * 0.8);
      if (i % 3 === 0) el("circle", { cx: f1(x), cy: f1(y), r: f1(r * 0.6), fill: INK, opacity: 0.55 }, ag);
      else el("ellipse", { cx: f1(x), cy: f1(y), rx: f1(r), ry: f1(r * 0.7), fill: light ? (i % 2 ? P.fog : EP5.concrete) : (i % 2 ? P.mist : EP5.concreteDark), stroke: INK, "stroke-width": 0.7 }, ag);
    }
    S();
    return ag;
  }
  // a crack: jagged polyline with a couple of short branches
  function crack(par, x, y, len, ang, o) {
    o = o || {};
    const pts = [[x, y]];
    let cx = x, cy = y, a = (ang * Math.PI) / 180;
    const n = Math.max(3, Math.round(len / 12));
    for (let i = 0; i < n; i++) {
      a += (rnd(SEED + i * 3.1) - 0.5) * 0.9;
      cx += Math.cos(a) * (len / n); cy += Math.sin(a) * (len / n);
      pts.push([cx, cy]);
    }
    sk.path(par, pts, DET({ stroke: o.stroke || INK, width: o.width || 1.8, opacity: o.opacity !== undefined ? o.opacity : 0.85, wobble: 0.4, step: 400 }));
    if (o.branches !== false) {
      [Math.floor(n * 0.4), Math.floor(n * 0.75)].forEach((k, j) => {
        const p = pts[k]; if (!p) return;
        const b = a + (j ? -0.9 : 0.8);
        sk.path(par, [p, [p[0] + Math.cos(b) * len * 0.22, p[1] + Math.sin(b) * len * 0.22], [p[0] + Math.cos(b + 0.4) * len * 0.34, p[1] + Math.sin(b + 0.4) * len * 0.34]], DET({ stroke: o.stroke || INK, width: (o.width || 1.8) * 0.7, opacity: (o.opacity !== undefined ? o.opacity : 0.85) * 0.8, wobble: 0.3, step: 400 }));
      });
    }
    return pts;
  }
  // a bent reinforcing bar: from p, pointing out (dx,dy), bending down by droop; ribbed, rusty
  function bar(par, x, y, len, ang, droop, o) {
    o = o || {};
    const pts = [];
    const a0 = (ang * Math.PI) / 180;
    for (let i = 0; i <= 6; i++) {
      const t = i / 6, a = a0 + droop * t * t;
      const px = (pts.length ? pts[pts.length - 1][0] : x) + (i ? Math.cos(a) * (len / 6) : 0);
      const py = (pts.length ? pts[pts.length - 1][1] : y) + (i ? Math.sin(a) * (len / 6) : 0);
      pts.push([px, py]);
    }
    const w = o.w || 3.4;
    sk.path(par, pts, { seed: S(), stroke: INK, width: w + 1.6, double: false, wobble: 0.25, step: 400 });
    sk.path(par, pts, { seed: S(), stroke: EP5.rust, width: w * 0.55, double: false, wobble: 0.2, step: 400 });
    // ribs
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
      const nx = -dy / d, ny = dx / d, mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      el("line", { x1: f1(mx - nx * w * 0.8), y1: f1(my - ny * w * 0.8), x2: f1(mx + nx * w * 0.8 + dx / d * 1.5), y2: f1(my + ny * w * 0.8 + dy / d * 1.5), stroke: INK, "stroke-width": 1, opacity: 0.7 }, par);
    }
    return pts[pts.length - 1];
  }
  function rock(par, x, y, r, o) {
    o = o || {};
    const n = 7, pts = [];
    for (let i = 0; i < n; i++) {
      const a = Math.PI + (i / (n - 1)) * Math.PI, rr = r * (0.75 + rnd(x * 0.1 + i) * 0.35);
      pts.push([x + Math.cos(a) * rr * 1.25, y + Math.sin(a) * rr * (o.flat || 0.8)]);
    }
    pts.push([x + r * 1.1, y + r * 0.18], [x - r * 1.1, y + r * 0.2]);
    sk.poly(par, pts, D({ fill: o.fill || P.mist, stroke: o.stroke || INK, width: o.width || LINE.detail + 0.5, wobble: 0.8, step: 400, double: false, opacity: o.opacity }));
    if (o.shade !== false) sk.path(par, [[x + r * 0.1, y - r * 0.55], [x + r * 0.7, y - r * 0.2], [x + r * 0.95, y + r * 0.12]], DET({ stroke: INK, width: 1.4, opacity: 0.45 }));
    return pts;
  }
  function fern(par, x, y, len, ang, col, w) {
    const a = (ang * Math.PI) / 180, pts = [];
    for (let i = 0; i <= 7; i++) {
      const t = i / 7, bend = t * t * 0.9 * Math.sign(ang || 1);
      pts.push([x + Math.sin(a + bend) * len * t, y - Math.cos(a + bend) * len * t]);
    }
    sk.path(par, pts, DET({ stroke: col, width: w || 2.4, wobble: 0.4 }));
    for (let i = 1; i < 7; i++) {
      const p = pts[i], q = pts[i + 1], dx = q[0] - p[0], dy = q[1] - p[1], d = Math.hypot(dx, dy) || 1, l = len * 0.24 * (1 - i / 8);
      const nx = -dy / d, ny = dx / d;
      el("path", { d: "M" + f1(p[0]) + " " + f1(p[1]) + " L" + f1(p[0] + nx * l + dx * 0.4) + " " + f1(p[1] + ny * l + dy * 0.4) + " M" + f1(p[0]) + " " + f1(p[1]) + " L" + f1(p[0] - nx * l + dx * 0.4) + " " + f1(p[1] - ny * l + dy * 0.4), stroke: col, "stroke-width": (w || 2.4) * 0.7, fill: "none", "stroke-linecap": "round" }, par);
    }
  }
  const hazeRect = (par, y0, y1, op) => el("rect", { x: -20, y: y0, width: 1960, height: y1 - y0, fill: EP5.hazeSky, opacity: op }, par);

  // ------------------------------------------------------------------ the SEA through the gorge mouth (both views)
  function makeSea(par, o) {
    // o: { x0, x1, horizon, flatsY (near edge of the flats), outY, inY }
    const seaG = el("g", { class: "gcb-sea" }, par);
    const W = o.x1 - o.x0;
    // open sea band
    sk.poly(seaG, [[o.x0, o.horizon], [o.x1, o.horizon], [o.x1, o.flatsY], [o.x0, o.flatsY]], { seed: S(), fill: P.mist, stroke: P.steel, width: 1.4, wobble: 0.3, double: false, step: 400 });
    lines(seaG, [0, 1, 2, 3, 4, 5].map((i) => { const y = o.horizon + 3 + i * ((o.flatsY - o.horizon) / 7); const x = o.x0 + W * rnd(i * 3.3 + o.x0); return [x, y, x + 12 + W * 0.06 * rnd(i + 9), y]; }), { stroke: P.paper, width: 1.2, opacity: 0.8 });
    // the mud flats (drawn under the waterline)
    const flatsTop = o.horizon + (o.flatsY - o.horizon) * 0.18;
    sk.poly(seaG, [[o.x0, flatsTop + 4], [o.x0 + W * 0.3, flatsTop], [o.x0 + W * 0.7, flatsTop + 2], [o.x1, flatsTop + 5], [o.x1, o.flatsY + 2], [o.x0, o.flatsY + 2]], { seed: S(), fill: EP5.mudWet, stroke: EP5.mud, width: 1.2, wobble: 0.4, double: false, step: 400 });
    for (let i = 0; i < 16; i++) { // shining channels + puddles
      const y = lerp(flatsTop + 4, o.flatsY - 2, rnd(i * 2.7 + 3)), x = o.x0 + W * rnd(i * 4.1 + 1), l = 10 + W * 0.12 * rnd(i + 21);
      sk.path(seaG, [[x, y], [x + l * 0.4, y + 1.5], [x + l, y + 0.5]], { seed: S(), stroke: EP5.mudShine, width: i % 3 ? 1.6 : 2.6, wobble: 0.3, double: false, step: 400, opacity: 0.95 });
    }
    lines(seaG, [0, 1, 2, 3].map((i) => { const y = lerp(flatsTop + 6, o.flatsY - 3, rnd(i * 5.9 + 2)), x = o.x0 + W * rnd(i * 6.3 + 7); return [x, y, x + 8, y]; }), { stroke: EP5.mud, width: 1.4, opacity: 0.7 });
    // water over the flats — setLevel moves its near edge
    const waterG = el("g", { class: "gcb-sea-water" }, seaG);
    const wPath = el("path", { fill: P.mist, stroke: "none" }, waterG);
    const wInk = el("path", { fill: "none", stroke: P.steel, "stroke-width": 1.3, "stroke-linecap": "round" }, waterG);
    const wFoam = el("path", { fill: "none", stroke: P.paper, "stroke-width": 1.2, opacity: 0.9, "stroke-linecap": "round" }, waterG);
    let cur = o.outY;
    function setLevel(y) {
      cur = Math.max(o.horizon + 2, Math.min(o.flatsY + 2, y));
      const pts = [];
      for (let x = o.x0; x <= o.x1 + 0.1; x += Math.max(6, W / 24)) pts.push([x, cur + Math.sin(x * 0.09) * 1.2 + H(x * 0.37) * 0.7]);
      const top = flatsTop - 3;
      wPath.setAttribute("d", "M" + f1(o.x0) + " " + f1(top) + " L" + pts.map((p) => f1(p[0]) + " " + f1(p[1])).join(" L") + " L" + f1(o.x1) + " " + f1(top) + " Z");
      wInk.setAttribute("d", "M" + pts.map((p) => f1(p[0]) + " " + f1(p[1])).join(" L"));
      wFoam.setAttribute("d", "M" + pts.filter((p, i) => i % 2 === 0).map((p) => f1(p[0]) + " " + f1(p[1] + 1.8)).join(" L"));
    }
    setLevel(opts.tide !== undefined ? +opts.tide : o.outY);
    return { g: seaG, waterG, levelY: o.outY, outY: o.outY, inY: o.inY, setLevel, get level() { return cur; } };
  }

  return VIEW === "below" ? drawBelow() : drawApproach();

  // ====================================================================================== APPROACH VIEW
  function drawApproach() {
    const GROUND = 860, RB = 800, RF = 905, FACE = 935;
    // the break: back curb .. front lip
    const BREAK = [[1262, RB], [1284, 812], [1274, 826], [1298, 838], [1290, 852], [1312, 862], [1304, 874], [1330, 884], [1322, 894], [1350, RF]];
    const EDGE_X = 1262;
    const FAR_X = 1742;

    // ---------------------------------------------------------------- SKY
    const skyG = layer("sky");
    el("rect", { x: -20, y: -20, width: 1960, height: 720, fill: lgrad("sky", [[0, EP5.hazeSky], [0.45, EP5.hazeSky], [0.85, P.paper], [1, EP5.sunLit]]) }, skyG);
    // wind-streaked clouds (thin slivers, high, slanting)
    [[60, 70, 620, 26, 0.85], [520, 120, 760, 18, 0.7], [1180, 60, 700, 30, 0.9], [1500, 170, 520, 16, 0.7], [160, 210, 520, 14, 0.6],
      [880, 230, 600, 20, 0.75], [1400, 300, 480, 12, 0.6], [-40, 300, 380, 12, 0.5], [700, 330, 420, 10, 0.55], [1650, 380, 300, 9, 0.6]].forEach(([x, y, w, h, op]) => streak(skyG, x, y, w, h, { opacity: op }));
    lines(skyG, [[120, 150, 520, 128], [300, 172, 760, 150], [980, 108, 1500, 84], [1120, 196, 1700, 170], [420, 264, 860, 246], [1560, 252, 1900, 236], [40, 360, 420, 344], [1200, 352, 1540, 338]], { stroke: P.fog, width: 2, opacity: 0.9 });
    lines(skyG, [[240, 96, 560, 80], [1300, 130, 1640, 112], [640, 196, 900, 186]], { stroke: P.mist, width: 1.4, opacity: 0.5 });
    // gulls riding the wind
    [[1240, 250, 1], [1290, 236, 0.8], [1555, 300, 0.7]].forEach(([x, y, s]) => sk.path(skyG, [[x - 12 * s, y + 2 * s], [x - 5 * s, y - 4 * s], [x, y], [x + 6 * s, y - 5 * s], [x + 13 * s, y + 1 * s]], DET({ stroke: P.storm, width: 2, wobble: 0.3, step: 400 })));

    // ---------------------------------------------------------------- LIGHT (hazy sun high left, glare over the mouth)
    const lightG = layer("light");
    [[150, 0.18], [96, 0.28], [58, 0.55]].forEach(([r, op]) => el("circle", { cx: 470, cy: 150, r, fill: EP5.sunLit, opacity: op }, lightG));
    sk.circle(lightG, 470, 150, 34, DET({ fill: P.paper, stroke: EP5.sunLit, width: 2, opacity: 0.95 }));
    el("ellipse", { cx: 1420, cy: 500, rx: 300, ry: 60, fill: EP5.sunLit, opacity: 0.35 }, lightG);

    // ---------------------------------------------------------------- FAR: headlands + sea + flats through the mouth
    const farG = layer("far");
    const sea = makeSea(farG, { x0: 1040, x1: 1720, horizon: 466, flatsY: 548, outY: 486, inY: 530 });
    // offshore sea stack + headland silhouettes beyond the mouth
    sk.poly(farG, [[1584, 470], [1592, 452], [1604, 448], [1612, 470]], DET({ fill: P.mist, stroke: P.steel, width: 1.2 }));
    sk.poly(farG, [[1040, 520], [1080, 476], [1150, 464], [1220, 470], [1262, 492], [1290, 520], [1300, 560], [1040, 560]], DET({ fill: P.mist, stroke: P.steel, width: 1.4, opacity: 0.95 }));
    sk.poly(farG, [[1720, 430], [1660, 440], [1590, 470], [1548, 500], [1530, 560], [1720, 560]], DET({ fill: P.mist, stroke: P.steel, width: 1.4, opacity: 0.95 }));
    for (let i = 0; i < 9; i++) farFir(farG, 1090 + i * 22 + rnd(i) * 8, 472 + Math.abs(i - 4) * 3, 12 + rnd(i + 3) * 6, P.steel, 3, 0.7);
    for (let i = 0; i < 7; i++) farFir(farG, 1600 + i * 18, 452 - i * 2.6 + 8, 12 + rnd(i + 13) * 6, P.steel, 3, 0.7);
    // sun sheen on the sea (part of lightG so scenes can dim it)
    lines(lightG, [[1300, 474, 1360, 474], [1270, 480, 1400, 480], [1320, 486, 1380, 486], [1180, 478, 1220, 478], [1460, 476, 1500, 476]], { stroke: EP5.sunLit, width: 2, opacity: 0.85 });
    hazeRect(farG, 400, 600, 0.22);

    // ---------------------------------------------------------------- MID: the gorge
    const midG = layer("mid");
    const gorgeG = el("g", { class: "gcb-gorge" }, midG);
    // gorge floor far below (seen through the gap) — a gravel bed in shade, receding to the mouth
    const LB = [[1318, 548], [1298, 620], [1276, 690], [1252, 760], [1236, 820]]; // left wall base
    const RBs = [[1512, 548], [1556, 620], [1612, 690], [1690, 760], [1790, 830]]; // right wall base
    const floorPts = LB.concat(RBs.slice().reverse());
    sk.poly(gorgeG, floorPts, D({ fill: EP5.gravel, stroke: EP5.concreteDark, width: 2, wobble: 0.8, step: 60, double: false }));
    {
      const fl = clipTo(gorgeG, floorPts);
      el("rect", { x: 1220, y: 540, width: 600, height: 300, fill: lgrad("floorHaze", [[0, EP5.hazeSky, 0.75], [0.5, EP5.hazeSky, 0.3], [1, EP5.hazeSky, 0]]) }, fl);
      sk.hatch(fl, 1220, 600, 600, 240, { seed: S(), gap: 8, angle: 10, stroke: EP5.mud, width: 1.1, opacity: 0.35 });
      // pebbles: tiny far, a little bigger near (still small — it is a long way down)
      for (let i = 0; i < 60; i++) {
        const t = rnd(i * 1.9 + 4), y = lerp(570, 820, t), x = lerp(polyY(LB.map(([a, b]) => [b, a]), y) - 6, polyY(RBs.map(([a, b]) => [b, a]), y) + 6, rnd(i * 3.7 + 1));
        const r = 0.8 + t * 2.4;
        el("ellipse", { cx: f1(x), cy: f1(y), rx: f1(r * 1.3), ry: f1(r * 0.7), fill: i % 3 ? EP5.dust : EP5.mud, stroke: INK, "stroke-width": f1(0.3 + t * 0.6), opacity: 0.8 }, fl);
      }
      // flood wrack / driftwood on the bed
      [[1350, 640, 16, -8], [1560, 660, 20, 10], [1300, 720, 26, -4], [1620, 744, 30, 14], [1350, 790, 34, -6]].forEach(([x, y, l, a]) => {
        const r = (a * Math.PI) / 180;
        sk.line(fl, x, y, x + Math.cos(r) * l, y + Math.sin(r) * l, D({ stroke: P.storm, width: 2 + l * 0.04, double: false, wobble: 0.4 }));
      });
      // shade cast by the left wall on the bed
      el("path", { d: "M1300 548 L1360 548 L1330 700 L1290 830 L1230 830 Z", fill: EP5.hardShadow, opacity: 0.22 }, fl);
    }
    // Gull Creek: LOW, a thin silver thread meandering on the wide bed
    const CREEK = [[1414, 552], [1428, 584], [1404, 616], [1424, 650], [1470, 680], [1486, 712], [1450, 742], [1418, 776], [1446, 812], [1470, 840]];
    {
      const half = (i) => 0.8 + (CREEK[i][1] - 548) * 0.012;
      const L = CREEK.map((p, i) => [p[0] - half(i), p[1]]), R = CREEK.map((p, i) => [p[0] + half(i) + 1.5, p[1]]);
      sk.poly(gorgeG, L.concat(R.reverse()), D({ fill: P.mist, stroke: P.steel, width: 1.2, wobble: 0.4, step: 30, double: false }));
      sk.path(gorgeG, CREEK.map(([x, y]) => [x + 0.8, y]), DET({ stroke: P.paper, width: 1.3, opacity: 0.95, step: 30 }));
      [[1484, 700, 8, 2.4], [1420, 770, 10, 3]].forEach(([x, y, rx, ry]) => sk.path(gorgeG, ellPts(x, y, rx, ry, 12), D({ closed: true, fill: P.mist, stroke: P.steel, width: 1.2, double: false })));
    }
    // the FALLEN HALF of the span, tilted in the creek far below (+ the broken pier stump it rests on)
    const spanG = el("g", { class: "gcb-span" }, gorgeG);
    const SPAN = { x0: 1392, y0: 790, x1: 1606, y1: 716 };
    {
      // pier stump (high end rests on it)
      sk.poly(spanG, [[1596, 724], [1618, 721], [1621, 820], [1598, 822]], D({ fill: EP5.concrete, stroke: INK, width: 2.4 }));
      sk.poly(spanG, [[1609, 722], [1618, 721], [1621, 820], [1610, 821]], DET({ fill: EP5.concreteDark, stroke: "none", opacity: 0.8 }));
      sk.path(spanG, [[1596, 724], [1601, 716], [1607, 722], [1612, 713], [1618, 721]], DET({ stroke: INK, width: 1.6 }));
      el("rect", { x: 1597, y: 776, width: 23, height: 4, fill: EP5.mud, opacity: 0.8 }, spanG);
      const A = [SPAN.x0, SPAN.y0], B = [SPAN.x1, SPAN.y1], A2 = [A[0] + 8, A[1] - 22], B2 = [B[0] + 7, B[1] - 20];
      sk.poly(spanG, [A, B, [B[0] + 1, B[1] + 15], [A[0] + 1, A[1] + 16]], D({ fill: EP5.concreteDark, stroke: INK, width: 2.4 })); // fascia
      for (let i = 0; i < 4; i++) {
        const t0 = 0.1 + i * 0.26, x = lerp(A[0], B[0], t0), y = lerp(A[1], B[1], t0) + 15;
        sk.poly(spanG, [[x, y], [x + 10, y - 3], [x + 10, y + 9], [x, y + 12]], DET({ fill: P.storm, stroke: INK, width: 1.2 }));
      }
      sk.poly(spanG, [A, B, B2, A2], D({ fill: EP5.concrete, stroke: INK, width: 2.4 })); // deck top
      const sc = clipTo(spanG, [A, B, B2, A2]);
      sk.hatch(sc, 1380, 690, 240, 110, { seed: S(), gap: 5, angle: -19, stroke: EP5.concreteDark, width: 0.8, opacity: 0.5 });
      for (let i = 0; i < 6; i++) {
        const t = 0.07 + i * 0.16, x = lerp((A[0] + A2[0]) / 2, (B[0] + B2[0]) / 2, t), y = lerp((A[1] + A2[1]) / 2, (B[1] + B2[1]) / 2, t);
        sk.line(sc, x, y, x + 12, y - 4.1, DET({ stroke: P.paper, width: 1.8, opacity: 0.75 }));
      }
      crack(sc, 1480, 760, 22, -100, { width: 1, branches: false });
      // bent railing along its far edge
      for (let i = 0; i < 12; i++) {
        const t = 0.04 + i * 0.08, x = lerp(A2[0], B2[0], t), y = lerp(A2[1], B2[1], t), k = i > 7 ? (i - 7) * 2.5 : 0;
        sk.line(spanG, x, y, x - 1 + k, y - 11 + k * 0.6, DET({ stroke: INK, width: 1.3 }));
      }
      sk.path(spanG, [[A2[0], A2[1] - 11], [lerp(A2[0], B2[0], 0.62), lerp(A2[1], B2[1], 0.62) - 11], [lerp(A2[0], B2[0], 0.82), lerp(A2[1], B2[1], 0.82) - 5], [B2[0] + 6, B2[1] + 5]], DET({ stroke: INK, width: 1.4 }));
      // broken nose in the creek: jagged end, rebar, churn, rubble
      sk.path(spanG, [A, [A[0] - 4, A[1] - 7], [A[0] + 3, A[1] - 13], [A2[0] - 3, A2[1] + 3], A2], DET({ stroke: INK, width: 1.6 }));
      bar(spanG, A[0] + 1, A[1] - 9, 14, 170, 0.8, { w: 1.1 }); bar(spanG, A[0] + 4, A[1] - 17, 12, 200, -0.6, { w: 1.1 });
      bar(spanG, B2[0] + 1, B2[1] + 4, 12, -10, 1.2, { w: 1.1 });
      sk.path(spanG, ellPts(1398, 806, 16, 3, 12), D({ closed: true, stroke: P.paper, width: 1.3, double: false }));
      [[1376, 806, 3.5], [1416, 810, 3]].forEach(([x, y, r]) => rock(spanG, x, y, r, { fill: EP5.concrete, width: 1, shade: false }));
    }
    // a rock wall face: base polygon + ledges (light tops, dark undersides) + scrub on the ledges
    function rockWall(par, pts, ledges, dir) {
      sk.poly(par, pts, D({ fill: P.slate, stroke: INK, width: LINE.detail + 0.5, step: 80, wobble: 1, double: false }));
      const wc = clipTo(par, pts);
      sk.hatch(wc, 900, 440, 1060, 460, { seed: S(), gap: 8, angle: dir > 0 ? 112 : 68, stroke: INK, width: 1.2, opacity: 0.3 });
      ledges.forEach(([x0, y0, x1, y1], i) => {
        const mx = (x0 + x1) / 2, my = (y0 + y1) / 2 + (rnd(i + x0) - 0.5) * 8;
        const top = [[x0, y0], [mx - 14, my - 9], [mx + 18, my - 6], [x1, y1]];
        sk.poly(wc, top.concat([[x1, y1 + 10], [mx + 16, my + 8], [mx - 12, my + 4], [x0, y0 + 9]]), DET({ fill: i % 2 ? EP5.concreteDark : P.steel, stroke: INK, width: 1.2, wobble: 0.8, opacity: 0.8 }));
        sk.path(wc, [[x0, y0 + 9], [mx - 12, my + 4], [mx + 16, my + 8], [x1, y1 + 10]], DET({ stroke: INK, width: 2, opacity: 0.7 }));
        el("path", { d: "M" + f1(x0) + " " + f1(y0 + 10) + " L" + f1(x1) + " " + f1(y1 + 11) + " L" + f1(x1) + " " + f1(y1 + 30) + " L" + f1(x0) + " " + f1(y0 + 26) + " Z", fill: EP5.hardShadow, opacity: 0.25 }, wc);
        if (i % 2 === 0) for (let k = 0; k < 3; k++) { const bx = lerp(x0, x1, 0.2 + k * 0.3), by = lerp(y0, y1, 0.2 + k * 0.3) - 3; el("ellipse", { cx: f1(bx), cy: f1(by), rx: 7, ry: 4, fill: EP5.leafMid, stroke: INK, "stroke-width": 1 }, wc); }
      });
      // vertical joints in the rock
      for (let i = 0; i < 10; i++) {
        const x = lerp(pts[0][0], pts[Math.floor(pts.length / 2)][0], rnd(i * 5.3 + dir * 9)), y = 520 + rnd(i * 2.2 + 3) * 260;
        sk.line(wc, x, y, x + dir * 6, y + 30 + rnd(i) * 20, DET({ stroke: INK, width: 1.4, opacity: 0.5 }));
      }
      return wc;
    }
    // left hill (the near side of the gorge) — behind the whole approach
    const LH = [[-20, 330], [80, 318], [200, 336], [330, 352], [480, 372], [640, 398], [780, 424], [900, 450], [1010, 476], [1100, 500], [1180, 524], [1250, 540], [1318, 548],
      [1298, 620], [1276, 690], [1252, 760], [1236, 820], [-20, 820]];
    sk.poly(gorgeG, LH, D({ fill: EP5.leafMid, stroke: INK, width: LINE.main, step: 80, wobble: 1.4 }));
    {
      const lc = clipTo(gorgeG, LH);
      // forest texture on the hill: rows of small leaning firs, darker lower
      for (let row = 0; row < 7; row++) {
        for (let i = 0; i < 26; i++) {
          const x = -10 + i * 42 + (row % 2) * 20 + rnd(i * 7 + row) * 18;
          const rimY = polyY(LH.slice(0, 13), x);
          const by = rimY + 26 + row * 58 + rnd(i + row * 31) * 22;
          if (x > 1040 + row * 10 || by > 830) continue;
          const h = 22 + row * 9 + rnd(i * 3 + row) * 12;
          farFir(lc, x, by, h, row < 2 ? EP5.moss : row < 4 ? EP5.leafMid : EP5.leafDark, 4 + row, 0.75);
        }
      }
      sk.hatch(lc, -20, 520, 1100, 300, { seed: S(), gap: 13, angle: 58, stroke: EP5.leafDark, width: 1.5, opacity: 0.3 });
      // the inner cliff wall dropping into the gorge
      const WALL = [[980, 470], [1100, 500], [1250, 540], [1318, 548], [1298, 620], [1276, 690], [1252, 760], [1236, 830], [1090, 830], [1130, 720], [1110, 640], [1040, 540]];
      rockWall(lc, WALL, [[1060, 548, 1300, 572], [1100, 604, 1292, 622], [1120, 662, 1282, 676], [1124, 720, 1266, 730], [1110, 780, 1248, 790]], 1);
      // shrubby firs clinging to the wall
      [[1150, 600, 40], [1210, 662, 34], [1180, 760, 50]].forEach(([x, by, h]) => windFir(lc, x, by, h, h * 0.5, { fill: EP5.leafDark, width: 1.8, lean: 8, tiers: 4, boughs: false }));
    }
    // wind-bent firs along the left rim (skyline)
    [[40, 330, 120, 60, 22], [130, 326, 150, 74, 30], [250, 342, 96, 52, 22], [395, 360, 120, 60, 26], [560, 386, 84, 44, 20], [700, 410, 104, 52, 24], [840, 436, 76, 40, 18], [980, 468, 70, 36, 16], [1080, 494, 56, 30, 14]].forEach(([x, by, h, w, lean]) =>
      windFir(gorgeG, x, by + 6, h, w, { fill: EP5.leafDark, width: 2.6, lean, tiers: 4, boughs: false, opacity: 0.95 }));
    // right hill (far gorge wall) — under the far abutment
    const RH = [[1512, 548], [1540, 520], [1590, 488], [1650, 450], [1720, 408], [1800, 366], [1870, 336], [1940, 318], [1940, 880], [1790, 880], [1790, 830], [1690, 760], [1612, 690], [1556, 620]];
    sk.poly(gorgeG, RH, D({ fill: EP5.leafMid, stroke: INK, width: LINE.main, step: 80, wobble: 1.4 }));
    {
      const rc = clipTo(gorgeG, RH);
      for (let row = 0; row < 5; row++) {
        for (let i = 0; i < 9; i++) {
          const x = 1600 + i * 40 + (row % 2) * 18 + rnd(i * 5 + row) * 10, rimY = polyY(RH.slice(0, 8), x), by = rimY + 30 + row * 46;
          farFir(rc, x, by, 22 + row * 8, row < 2 ? EP5.moss : EP5.leafMid, 5, 0.75);
        }
      }
      const WALL = [[1512, 548], [1556, 620], [1612, 690], [1690, 760], [1790, 830], [1940, 830], [1940, 740], [1840, 690], [1740, 620], [1650, 560], [1580, 520]];
      rockWall(rc, WALL, [[1530, 560, 1640, 572], [1570, 616, 1720, 640], [1620, 676, 1820, 704], [1680, 736, 1940, 760], [1760, 790, 1940, 806]], -1);
      [[1600, 612, 40], [1680, 682, 48], [1866, 720, 56]].forEach(([x, by, h]) => windFir(rc, x, by, h, h * 0.45, { fill: EP5.leafDark, width: 1.8, lean: 10, tiers: 4, boughs: false }));
    }
    [[1580, 520, 70, 36, 18], [1690, 444, 110, 56, 26], [1800, 384, 130, 64, 30], [1900, 340, 150, 70, 30]].forEach(([x, by, h, w, lean]) =>
      windFir(gorgeG, x, by + 8, h, w, { fill: EP5.leafDark, width: 2.8, lean, tiers: 5, boughs: false }));
    hazeRect(gorgeG, 300, 820, 0.16);
    // the CROWNS of tall firs growing up from the creek bed right under the bridge: their tops are only just
    // below deck level, their trunks vanish into the dark — the gap reads as a long drop.
    {
      const CG = el("g", { class: "gcb-crowns" }, gorgeG);
      sk.poly(CG, [[1236, 812], [1300, 800], [1400, 822], [1520, 812], [1640, 824], [1790, 818], [1790, 1100], [1236, 1100]], D({ fill: EP5.hardShadow, stroke: "none", double: false, wobble: 2, step: 60 }));
      const crowns = [[1250, 812, 120, 64], [1300, 792, 150, 74], [1358, 826, 110, 60], [1420, 800, 160, 80], [1486, 830, 120, 62], [1546, 796, 170, 84], [1610, 828, 130, 66], [1676, 806, 150, 72], [1740, 834, 120, 60], [1780, 812, 110, 54],
        [1280, 900, 200, 96], [1380, 910, 220, 110], [1500, 920, 200, 100], [1620, 905, 220, 110], [1730, 930, 200, 96]];
      crowns.forEach(([x, top, h, w], i) => windFir(CG, x, top + h, h, w, { fill: i < 10 ? EP5.leafMid : EP5.leafDark, width: 2.4, lean: 6, tiers: 5, boughs: i >= 10, opacity: 1 }));
    }

    // fir tips poking up from DEEP in the gorge behind the bridge railing (sells the drop)
    [[700, 812, 70, 30], [790, 818, 90, 36], [905, 814, 64, 28], [1010, 820, 100, 40], [1110, 814, 80, 34], [1196, 822, 110, 44]].forEach(([x, by, h, w]) =>
      windFir(midG, x, by + 30, h + 30, w, { fill: EP5.leafDark, width: 2.4, lean: 8, tiers: 4, boughs: false, opacity: 0.9 }));
    hazeRect(midG, 640, 800, 0.12);

    // ---------------------------------------------------------------- DECK: approach road, near span, the break
    const deckG = layer("deck");
    // the torn last section of the bridge railing hangs from the back curb down into the gap, BEHIND the slab
    const dangleG = el("g", { class: "gcb-dangle" }, deckG);
    {
      sk.poly(dangleG, [[1240, 716], [1296, 718], [1340, 746], [1370, 810], [1392, 900], [1402, 990], [1388, 992], [1378, 904], [1356, 818], [1328, 760], [1290, 732], [1238, 730]], D({ fill: P.mist, stroke: INK, width: 3.4, step: 400, wobble: 0.6 }));
      sk.path(dangleG, [[1250, 723], [1298, 725], [1336, 752], [1364, 814], [1385, 902], [1395, 986]], DET({ stroke: P.steel, width: 2 }));
      sk.poly(dangleG, [[1386, 966], [1404, 964], [1410, 1030], [1392, 1032]], DET({ fill: EP5.concrete, stroke: INK, width: 2.6 })); // a post still bolted on
      el("circle", { cx: 1248, cy: 726, r: 3, fill: INK }, dangleG);
    }
    // embankment under the approach (left, low detail)
    sk.poly(deckG, [[-20, RF], [600, RF], [640, 1100], [-20, 1100]], D({ fill: EP5.dryGrass, stroke: INK, width: LINE.main, step: 120, wobble: 1 }));
    sk.hatch(deckG, -20, RF + 10, 640, 180, { seed: S(), gap: 16, angle: 60, stroke: EP5.leafDark, width: 1.6, opacity: 0.25 });
    // under-deck shadow + girders of the near span
    sk.poly(deckG, [[600, FACE], [1336, FACE], [1320, 1100], [600, 1100]], D({ fill: P.storm, stroke: INK, width: 3, step: 200 }));
    sk.poly(deckG, [[620, FACE], [1332, FACE], [1318, 1002], [1300, 990], [1286, 1010], [620, 1010]], D({ fill: EP5.concreteDark, stroke: INK, width: 3, step: 200 })); // outer girder web
    sk.poly(deckG, [[620, 1004], [1290, 1004], [1280, 1022], [620, 1022]], DET({ fill: P.slate, stroke: INK, width: 2 })); // bottom flange
    lines(deckG, [[760, FACE + 4, 760, 1004], [960, FACE + 4, 960, 1004], [1160, FACE + 4, 1160, 1004]], { stroke: INK, width: 1.6, opacity: 0.4 }); // stiffener joints
    // near pier (under the deck, low detail) + near abutment
    sk.poly(deckG, [[1110, 1022], [1176, 1022], [1180, 1100], [1106, 1100]], D({ fill: EP5.concreteDark, stroke: INK, width: 3 }));
    sk.poly(deckG, [[588, RF - 2], [652, RF - 2], [652, 1100], [580, 1100]], D({ fill: EP5.concrete, stroke: INK, width: LINE.main }));
    lines(deckG, [[590, 960, 650, 960], [590, 1010, 650, 1010], [590, 1060, 650, 1060]], { stroke: INK, width: 1.4, opacity: 0.35 });
    // strands + bars hanging out of the broken girder end
    [[1316, 996, 26, 80, 0.6], [1306, 1000, 20, 95, 1], [1322, 970, 18, 60, 1.2]].forEach(([x, y, l, a, d]) => bar(deckG, x, y, l, a, d, { w: 2 }));

    // slab fascia (front face of the deck) — concrete, with a drip line
    const faceEndX = 1352;
    sk.poly(deckG, [[588, RF], [faceEndX - 2, RF], [faceEndX + 4, 914], [1344, 922], [faceEndX - 4, FACE], [588, FACE]], D({ fill: EP5.concrete, stroke: INK, width: LINE.main }));
    sk.line(deckG, 600, 929, 1330, 929, DET({ stroke: EP5.concreteDark, width: 2, opacity: 0.8 }));
    lines(deckG, [[652, RF + 3, 652, FACE - 2], [880, RF + 3, 880, FACE - 2], [1110, RF + 3, 1110, FACE - 2]], { stroke: INK, width: 1.4, opacity: 0.5 }); // joints
    for (let i = 0; i < 9; i++) { const x = 680 + i * 74; el("path", { d: "M" + x + " " + (FACE - 4) + " q 2 8 0 14", stroke: P.slate, "stroke-width": 1.6, fill: "none", opacity: 0.5 }, deckG); } // rust/water streaks
    // approach road + deck surface (one continuous asphalt band up to the break)
    const ROAD = [[-20, RB], [EDGE_X, RB]].concat(BREAK.slice(1)).concat([[-20, RF]]);
    sk.poly(deckG, ROAD, D({ fill: EP5.concrete, stroke: INK, width: LINE.main, step: 200, wobble: 0.6 }));
    const rc = clipTo(deckG, ROAD);
    {
      // asphalt texture + far shoulder shade
      sk.hatch(rc, -20, RB, 1400, 110, { seed: S(), gap: 9, angle: -8, stroke: EP5.concreteDark, width: 1, opacity: 0.35 });
      el("rect", { x: -20, y: RB, width: 1400, height: 14, fill: EP5.concreteDark, opacity: 0.45 }, rc);
      sk.line(rc, -20, RB + 14, 1300, RB + 14, DET({ stroke: P.paper, width: 3, opacity: 0.55 })); // fog line
      // faded centerline (double, dashed, mostly worn)
      for (let i = 0; i < 18; i++) {
        const x = -10 + i * 76;
        if (x > 1250) break;
        const fade = 0.25 + 0.45 * rnd(i * 4.4 + 2);
        sk.line(rc, x, 848, x + 42, 848, DET({ stroke: P.fog, width: 3.2, opacity: fade }));
        sk.line(rc, x + 3, 855, x + 38, 855, DET({ stroke: P.fog, width: 3.2, opacity: fade * 0.8 }));
      }
      // patches + seams + alligator cracking on the approach
      [[60, 870, 120, 26], [400, 820, 90, 18], [760, 880, 70, 16]].forEach(([x, y, w, h]) => sk.rect(rc, x, y, w, h, DET({ fill: EP5.concreteDark, stroke: INK, width: 1.4, opacity: 0.55 })));
      for (let i = 0; i < 7; i++) crack(rc, 120 + i * 24, 830 + (i % 3) * 14, 26, 20 + i * 40, { width: 1.3, opacity: 0.6, branches: false });
      crack(rc, 300, 808, 90, 70, { width: 1.6, opacity: 0.7 });
      crack(rc, 520, 900, 120, -20, { width: 1.6, opacity: 0.7 });
      // expansion joint at the abutment
      sk.line(rc, 646, RB, 640, RF, DET({ stroke: INK, width: 3 }));
      sk.line(rc, 652, RB, 646, RF, DET({ stroke: P.steel, width: 2, opacity: 0.8 }));
      // the next transverse crack (where it will go next) + spider cracks from the break
      crack(rc, 1150, RB + 2, 110, 82, { width: 2.2 });
      crack(rc, 1255, 815, 70, 160, { width: 2 }); crack(rc, 1290, 850, 80, 180, { width: 2 });
      crack(rc, 1310, 880, 90, 175, { width: 1.8 }); crack(rc, 1270, 830, 50, 120, { width: 1.6 });
      crack(rc, 1236, 896, 60, -150, { width: 1.6 });
      // skid marks ending just short of the break
      sk.path(rc, [[880, 878], [1000, 874], [1120, 868], [1196, 864]], DET({ stroke: INK, width: 5, opacity: 0.22, wobble: 0.6 }));
      sk.path(rc, [[880, 892], [1000, 888], [1120, 884], [1206, 880]], DET({ stroke: INK, width: 5, opacity: 0.22, wobble: 0.6 }));
      // soft haze shadows of the rail posts (toward shadowDir)
      for (let x = 120; x < 1250; x += 60) el("path", { d: "M" + x + " " + (RB + 1) + " l 10 7 l 6 0 l -10 -7 z", fill: P.storm, opacity: 0.18 }, rc);
    }
    // the BREAK itself: crumbling lip, aggregate, spalls, rebar
    const edgeG = el("g", { class: "gcb-edge" }, deckG);
    const rebarG = el("g", { class: "gcb-rebar" }, edgeG);
    const tips = [];
    {
      // exposed fracture sliver along the break (aggregate shows)
      // the exposed fracture face: an irregular band just beyond the jagged lip, aggregate showing
      const OUTER = [[1262, RB], [1290, 806], [1300, 826], [1318, 842], [1316, 858], [1336, 870], [1338, 886], [1360, 896], [1366, 912], [1350, RF]];
      const SL = BREAK.concat(OUTER.slice().reverse());
      sk.poly(edgeG, SL, D({ fill: EP5.concreteDark, stroke: INK, width: 2.2, wobble: 0.4, step: 400 }));
      const slc = clipTo(edgeG, SL);
      el("rect", { x: 1300, y: RB, width: 80, height: 120, fill: EP5.hardShadow, opacity: 0.25 }, slc);
      sk.hatch(slc, 1260, 800, 110, 120, { seed: S(), gap: 7, angle: 75, stroke: INK, width: 0.8, opacity: 0.25 });
      aggregate(slc, 1262, 800, 1368, 914, 240, 3, 1, true);
      // the jagged ink lip over it
      sk.path(edgeG, BREAK, D({ stroke: INK, width: LINE.main, wobble: 0.5, step: 400 }));
      // spalled chips and crumbs on the deck by the edge
      [[1236, 842, 7], [1222, 868, 5], [1250, 886, 6], [1214, 822, 4], [1278, 896, 4], [1196, 852, 3], [1244, 816, 3]].forEach(([x, y, r]) =>
        sk.poly(edgeG, [[x - r, y + r * 0.4], [x - r * 0.5, y - r * 0.6], [x + r * 0.6, y - r * 0.5], [x + r, y + r * 0.3], [x, y + r * 0.6]], DET({ fill: EP5.concrete, stroke: INK, width: 1.4, step: 400 })));
      for (let i = 0; i < 22; i++) el("circle", { cx: f1(1180 + rnd(i * 2.1) * 110), cy: f1(812 + rnd(i * 3.3 + 1) * 88), r: f1(0.8 + rnd(i) * 1.4), fill: INK, opacity: 0.6 }, edgeG);
      // spalled hole in the fascia near the break showing bars
      sk.poly(edgeG, [[1296, 909], [1326, 907], [1336, 924], [1306, 931]], DET({ fill: EP5.concreteDark, stroke: INK, width: 1.8 }));
      sk.line(edgeG, 1294, 917, 1340, 916, DET({ stroke: EP5.rust, width: 2.4 }));
      // REBAR out of the break: top mat (deck surface level) + bottom mat (fascia level), bent down
      const outs = [[1278, 812, 46, -8, 1.1], [1292, 834, 62, 4, 1.4], [1302, 852, 38, -14, 0.9], [1316, 868, 74, 8, 1.7], [1330, 886, 52, -4, 1.2], [1348, 904, 40, 10, 1.0],
        [1350, 918, 64, 20, 1.5], [1346, 930, 44, 40, 1.0], [1290, 822, 28, -30, 0.6]];
      outs.forEach(([x, y, l, a, d]) => tips.push(bar(rebarG, x, y, l, a, d, { w: 3 })));
      // one long bar curled right down into the gap, with a chunk of concrete still hanging on it
      const long = bar(rebarG, 1340, 896, 120, 20, 2.2, { w: 3.4 });
      tips.push(long);
      sk.poly(rebarG, [[long[0] - 12, long[1] - 6], [long[0] + 8, long[1] - 10], [long[0] + 14, long[1] + 8], [long[0] - 4, long[1] + 16], [long[0] - 14, long[1] + 6]], DET({ fill: EP5.concrete, stroke: INK, width: 2 }));
      aggregate(rebarG, long[0] - 10, long[1] - 6, long[0] + 10, long[1] + 10, 6, 1.6, 0.9);
      // tie wire + mesh crossing near the lip
      lines(rebarG, [[1296, 836, 1326, 850], [1306, 856, 1334, 874], [1320, 872, 1346, 888]], { stroke: EP5.rust, width: 1.6, opacity: 0.9 });
      // dust falling off the lip
      for (let i = 0; i < 8; i++) el("circle", { cx: f1(1320 + rnd(i * 5) * 50), cy: f1(930 + i * 9 + rnd(i) * 6), r: f1(1 + rnd(i + 3)), fill: P.mist, opacity: 0.8 }, edgeG);
    }

    // ---------------------------------------------------------------- FAR SIDE: the far abutment + road (unreachable)
    const farSideG = el("g", { class: "gcb-far-side" }, deckG);
    {
      const FB = [[FAR_X + 18, RB], [FAR_X + 6, 816], [FAR_X + 14, 832], [FAR_X, 850], [FAR_X + 10, 866], [FAR_X - 4, 884], [FAR_X + 6, RF]];
      // abutment wall below (concrete, formwork lines) dropping into the gorge
      sk.poly(farSideG, [[FAR_X + 2, RF], [1940, RF], [1940, 1100], [FAR_X + 30, 1100], [FAR_X + 10, 1000]], D({ fill: EP5.concrete, stroke: INK, width: LINE.main }));
      lines(farSideG, [[FAR_X + 10, 960, 1940, 960], [FAR_X + 20, 1020, 1940, 1020], [1820, RF, 1820, 1100]], { stroke: INK, width: 1.4, opacity: 0.35 });
      el("rect", { x: FAR_X + 10, y: 975, width: 200, height: 8, fill: EP5.mud, opacity: 0.55 }, farSideG); // flood mud line
      sk.poly(farSideG, [[FAR_X + 6, RF], [1940, RF], [1940, FACE], [FAR_X + 4, FACE]], D({ fill: EP5.concrete, stroke: INK, width: 3 }));
      const FR = FB.concat([[1940, RF], [1940, RB]]);
      sk.poly(farSideG, FR, D({ fill: EP5.concrete, stroke: INK, width: LINE.main, step: 200, wobble: 0.6 }));
      const fc = clipTo(farSideG, FR);
      sk.hatch(fc, FAR_X - 10, RB, 220, 110, { seed: S(), gap: 9, angle: -8, stroke: EP5.concreteDark, width: 1, opacity: 0.35 });
      el("rect", { x: FAR_X, y: RB, width: 200, height: 14, fill: EP5.concreteDark, opacity: 0.45 }, fc);
      sk.line(fc, 1800, 848, 1842, 848, DET({ stroke: P.fog, width: 3.2, opacity: 0.6 }));
      sk.line(fc, 1880, 848, 1922, 848, DET({ stroke: P.fog, width: 3.2, opacity: 0.6 }));
      crack(fc, FAR_X + 12, 860, 60, 0, { width: 1.8 });
      aggregate(farSideG, FAR_X - 4, 806, FAR_X + 16, 902, 14, 2.2, 0.85);
      [[FAR_X + 8, 830, 30, 175, 0.9], [FAR_X + 4, 860, 40, 185, -0.9], [FAR_X + 8, 896, 34, 170, -1.2], [FAR_X + 6, 920, 28, 160, -1]].forEach(([x, y, l, a, d]) => bar(farSideG, x, y, l, a, d, { w: 2.6 }));
      // far bridge railing stub (posts + top rail, one bent post at the break)
      for (let x = 1772; x < 1940; x += 60) sk.rect(farSideG, x - 7, 722, 14, 80, D({ fill: EP5.concrete, stroke: INK, width: 3 }));
      sk.poly(farSideG, [[FAR_X + 18, 716], [1940, 716], [1940, 730], [FAR_X + 20, 730]], D({ fill: P.mist, stroke: INK, width: 3 }));
      sk.path(farSideG, [[FAR_X + 18, 723], [FAR_X - 6, 740], [FAR_X - 18, 770]], D({ stroke: INK, width: 4 }));
      // a "BRIDGE OUT" sawhorse somebody hauled up on the far side
      sk.line(farSideG, 1810, 772, 1800, 822, D({ width: 3 })); sk.line(farSideG, 1866, 772, 1876, 822, D({ width: 3 }));
      sk.rect(farSideG, 1790, 758, 96, 22, D({ fill: P.paper, stroke: INK, width: 3 }));
      for (let i = 0; i < 5; i++) sk.poly(farSideG, [[1796 + i * 19, 760], [1806 + i * 19, 760], [1796 + i * 19 + 4, 778], [1788 + i * 19 + 4, 778]], DET({ fill: P.storm, stroke: "none", opacity: 0.85 }));
      txt(farSideG, 1838, 802, "BRIDGE OUT", { size: 16, fill: P.storm, len: 76 });
    }

    // ---------------------------------------------------------------- PROPS on the approach
    const propsG = layer("props", deckG);
    // W-beam guardrail stub (approach, back curb), flared end at left
    const GR = { x0: 110, x1: 600, y: RB, seatY: 716 };
    const guardG = el("g", { class: "gcb-guardrail" }, propsG);
    {
      for (let x = 130; x <= 590; x += 92) {
        sk.rect(guardG, x - 7, 722, 14, RB - 722 + 2, D({ fill: P.slate, stroke: INK, width: 3 }));
        sk.line(guardG, x - 3, 728, x - 3, RB - 4, DET({ stroke: P.steel, width: 1.6, opacity: 0.8 }));
      }
      const W = [[GR.x0 + 20, 716], [GR.x1 + 40, 716], [GR.x1 + 40, 742], [GR.x0 + 20, 742]];
      sk.poly(guardG, W, D({ fill: P.mist, stroke: INK, width: LINE.main, wobble: 0.6 }));
      sk.line(guardG, GR.x0 + 24, 729, GR.x1 + 36, 729, DET({ stroke: P.steel, width: 2.4 })); // the W ridge
      sk.line(guardG, GR.x0 + 24, 722, GR.x1 + 36, 722, DET({ stroke: P.paper, width: 2, opacity: 0.8 }));
      sk.line(guardG, GR.x0 + 24, 736, GR.x1 + 36, 736, DET({ stroke: P.steel, width: 1.4, opacity: 0.7 }));
      for (let x = 130; x <= 590; x += 92) el("circle", { cx: x, cy: 729, r: 2.6, fill: INK }, guardG); // bolts
      // flared buffer end, bent down toward the shoulder
      sk.poly(guardG, [[GR.x0 + 22, 716], [GR.x0 - 6, 722], [GR.x0 - 14, 750], [GR.x0 + 6, 754], [GR.x0 + 22, 742]], D({ fill: P.mist, stroke: INK, width: 3.4 }));
      // a dent where something hit it
      sk.path(guardG, [[380, 717], [396, 724], [414, 718]], DET({ stroke: INK, width: 2 }));
      // dry grass tufts under the rail
      for (let i = 0; i < 16; i++) {
        const x = 90 + i * 34 + rnd(i) * 12, h = 10 + rnd(i + 5) * 12;
        sk.path(guardG, [[x - h * 0.4, RB - h], [x, RB + 1], [x + h * 0.15, RB - h * 1.2], [x + 3, RB + 1], [x + h * 0.5, RB - h * 0.7]], DET({ stroke: EP5.dryGrass, width: 1.8, step: 400, wobble: 0.4 }));
      }
    }
    // BRIDGE RAILING on the deck: concrete posts + top rail (as in townView), torn and dangling at the break
    const railG = el("g", { class: "gcb-bridge-rail" }, propsG);
    {
      sk.poly(railG, [[640, RB - 6], [EDGE_X + 4, RB - 6], [EDGE_X + 6, RB + 2], [640, RB + 2]], D({ fill: EP5.concrete, stroke: INK, width: 3 })); // curb
      const posts = [];
      for (let x = 662; x <= 1240; x += 58) posts.push(x);
      posts.forEach((x, i) => {
        const tilt = i === posts.length - 1 ? 10 : i === posts.length - 2 ? 4 : 0;
        sk.poly(railG, [[x - 8, RB - 4], [x + 8, RB - 4], [x + 8 + tilt, 728], [x - 8 + tilt, 728]], D({ fill: EP5.concrete, stroke: INK, width: 3 }));
        sk.line(railG, x + 3, RB - 8, x + 3 + tilt, 734, DET({ stroke: EP5.concreteDark, width: 3, opacity: 0.7 }));
        if (i % 3 === 1) crack(railG, x - 4, 742, 22, 80, { width: 1.2, branches: false });
      });
      sk.poly(railG, [[640, 716], [1188, 716], [1192, 730], [640, 730]], D({ fill: P.mist, stroke: INK, width: LINE.main, wobble: 0.5 }));
      sk.line(railG, 646, 720, 1184, 720, DET({ stroke: P.paper, width: 2, opacity: 0.85 }));
      // the torn last section, swinging down into the gap (pivot at its last bolt)
      sk.poly(railG, [[1186, 716], [1236, 720], [1240, 734], [1190, 730]], D({ fill: P.mist, stroke: INK, width: 3.4 }));
      // torn stub of the top rail where the hanging section ripped away
      sk.path(railG, [[1236, 718], [1246, 712], [1250, 726], [1242, 734]], DET({ stroke: INK, width: 2.4 }));
    }
    // "GULL CREEK" bridge plate on the first post (as in townView)
    {
      sk.line(propsG, 690, 716, 690, 676, D({ width: 3 }));
      sk.rect(propsG, 646, 646, 92, 32, D({ fill: P.steel, stroke: INK, width: 3 }));
      txt(propsG, 692, 669, "GULL CREEK", { size: 18, fill: P.paper, len: 76 });
    }
    // HWY 101 shield sign (steel/paper) with a NORTH tab; the BUS card goes on the post below
    const signG = el("g", { class: "gcb-hwy-sign" }, propsG);
    const SGX = 214, SGY = 520;
    {
      sk.rect(signG, SGX - 5, 452, 10, RB - 452, D({ fill: P.slate, stroke: INK, width: 3 }));
      sk.line(signG, SGX + 1, 600, SGX + 1, RB - 6, DET({ stroke: P.steel, width: 1.6, opacity: 0.7 }));
      // NORTH tab
      sk.rect(signG, SGX - 46, 432, 92, 28, D({ fill: P.paper, stroke: INK, width: 3 }));
      txt(signG, SGX, 454, "NORTH", { size: 22, fill: INK, len: 66 });
      // plate + shield
      sk.rect(signG, SGX - 50, 462, 100, 112, D({ fill: P.storm, stroke: INK, width: LINE.main }));
      const sh = [[SGX - 40, 472], [SGX - 20, 476], [SGX, 470], [SGX + 20, 476], [SGX + 40, 472], [SGX + 42, 500], [SGX + 36, 532], [SGX + 20, 552], [SGX, 564], [SGX - 20, 552], [SGX - 36, 532], [SGX - 42, 500]];
      sk.poly(signG, sh, D({ fill: P.paper, stroke: INK, width: 3, step: 400, wobble: 0.5 }));
      txt(signG, SGX, 496, "HWY", { size: 15, fill: P.storm, len: 32 });
      txt(signG, SGX, 536, "101", { size: 40, fill: INK, len: 58 });
      // bullet dings + weathering
      [[SGX - 22, 512], [SGX + 26, 520], [SGX + 8, 552]].forEach(([x, y]) => { el("circle", { cx: x, cy: y, r: 2.4, fill: P.storm }, signG); el("circle", { cx: x, cy: y, r: 4, fill: "none", stroke: P.steel, "stroke-width": 1 }, signG); });
      sk.hatch(signG, SGX - 50, 462, 100, 112, { seed: S(), gap: 10, angle: 40, stroke: P.steel, width: 1, opacity: 0.15 });
      // tape scraps from an old notice on the post (where the BUS card goes)
      sk.rect(signG, SGX - 12, 610, 10, 6, DET({ fill: P.fog, stroke: P.steel, width: 1, opacity: 0.9 }));
      sk.rect(signG, SGX + 4, 664, 9, 6, DET({ fill: P.fog, stroke: P.steel, width: 1, opacity: 0.9 }));
    }
    // mile marker
    const mileG = el("g", { class: "gcb-mile" }, propsG);
    {
      sk.rect(mileG, 534, 716, 12, RB - 716, D({ fill: P.slate, stroke: INK, width: 2.6 }));
      sk.rect(mileG, 524, 676, 32, 54, D({ fill: P.paper, stroke: INK, width: 3 }));
      txt(mileG, 540, 693, "MILE", { size: 11, fill: P.storm, len: 24 });
      txt(mileG, 540, 722, "38", { size: 24, fill: INK, len: 24 });
      sk.hatch(mileG, 524, 676, 32, 54, { seed: S(), gap: 6, angle: 30, stroke: P.steel, width: 0.8, opacity: 0.2 });
    }
    // a traffic cone knocked over near the break + a lost hubcap
    {
      sk.poly(propsG, [[1166, 892], [1210, 878], [1214, 892], [1170, 902]], D({ fill: P.paper, stroke: INK, width: 3 }));
      sk.line(propsG, 1186, 884, 1190, 898, DET({ stroke: P.storm, width: 4 }));
      sk.poly(propsG, [[1208, 872], [1222, 870], [1226, 898], [1212, 902]], DET({ fill: P.storm, stroke: INK, width: 2.4 }));
      sk.path(propsG, ellPts(820, 892, 14, 4.5, 14), D({ closed: true, fill: P.fog, stroke: INK, width: 2.4, double: false }));
      sk.path(propsG, ellPts(820, 891, 6, 2, 10), DET({ closed: true, stroke: P.steel, width: 1.4 }));
    }

    // ---------------------------------------------------------------- FOREGROUND framing (wind-bent fir, embankment)
    const fgG = layer("fg");
    windFir(fgG, 40, 806, 700, 230, { fill: EP5.leafDark, width: LINE.main, lean: 70, tiers: 11 });
    sk.hatch(fgG, -20, 160, 150, 640, { seed: S(), gap: 12, angle: 60, stroke: INK, opacity: 0.22 });
    // rocks + scrub on the embankment (low detail, under the caption line)
    [[120, 960, 22], [330, 990, 18], [470, 950, 14]].forEach(([x, y, r]) => rock(fgG, x, y, r, { fill: EP5.concreteDark, width: 2.4, shade: false, opacity: 0.8 }));
    for (let i = 0; i < 6; i++) fern(fgG, 40 + i * 96, 940 + (i % 2) * 22, 34, -30 + i * 14, EP5.leafDark, 2.2);

    return {
      g: root,
      view: "approach",
      light: LIGHT,
      groundY: GROUND,
      edge: { x: EDGE_X, y: GROUND, xFront: 1350, lipX: 1300 },
      rebar: { g: rebarG, tips },
      guardrail: { g: guardG, x0: GR.x0, x1: GR.x1, y: GR.y, seatY: GR.seatY },
      bridgeRail: { g: railG, x0: 650, x1: 1250, topY: 720, dangle: { g: dangleG, x: 1398, y: 1030, pivotX: 1248, pivotY: 722 } },
      crowdZone: { x0: 300, x1: 1180 },
      signBus: { x: SGX, y: 640, w: 64 },
      sign: { g: signG, x: SGX, y: SGY },
      milePost: { g: mileG, x: 540, y: 744 },
      gorge: { g: gorgeG, bottomY: 800, creek: CREEK, mouth: { x: 1415, y: 548 } },
      span: { g: spanG, x0: SPAN.x0, y0: SPAN.y0, x1: SPAN.x1, y1: SPAN.y1 },
      farSide: { g: farSideG, x0: FAR_X, y: GROUND },
      seaG: sea, sea, setLevel: sea.setLevel,
      underView: UNDER,
      skyG, lightG, shadowDir: SHADOW,
      detail: { g: edgeG, x: 1312, y: 878 },
      far: { g: farG }, mid: { g: midG }, deck: { g: deckG }, fg: { g: fgG },
    };
  }

  // ====================================================================================== BELOW VIEW
  function drawBelow() {
    const GROUND = 900;
    const DT = UNDER.deckTopY;          // deck top (railing base) of the near deck overhead
    const EX = UNDER.edgeX;             // broken end of the near deck
    const FX = 1440;                    // broken end of the far stub
    const SOFF = 372;                   // soffit far edge (bottom of the underside band)

    // ---------------------------------------------------------------- SKY (V between the walls)
    const skyG = layer("sky");
    el("rect", { x: -20, y: -20, width: 1960, height: 760, fill: lgrad("skyB", [[0, EP5.hazeSky], [0.6, P.paper], [1, EP5.sunLit]]) }, skyG);
    [[260, 60, 640, 26, 0.85], [900, 40, 700, 22, 0.8], [600, 150, 560, 16, 0.65], [1240, 140, 520, 18, 0.7], [380, 420, 420, 12, 0.6], [1100, 450, 380, 10, 0.55]].forEach(([x, y, w, h, op]) => streak(skyG, x, y, w, h, { opacity: op }));
    lines(skyG, [[420, 120, 860, 100], [1000, 100, 1500, 78], [700, 220, 1100, 204]], { stroke: P.fog, width: 2, opacity: 0.9 });
    [[1130, 180, 1], [1170, 200, 0.8]].forEach(([x, y, s]) => sk.path(skyG, [[x - 12 * s, y + 2 * s], [x - 5 * s, y - 4 * s], [x, y], [x + 6 * s, y - 5 * s], [x + 13 * s, y + 1 * s]], DET({ stroke: P.storm, width: 2, wobble: 0.3, step: 400 })));

    // ---------------------------------------------------------------- FAR: the mouth and the sea, under the bridge
    const farG = layer("far");
    const sea = makeSea(farG, { x0: 900, x1: 1420, horizon: 640, flatsY: 676, outY: 650, inY: 668 });
    sk.poly(farG, [[860, 600], [940, 616], [1010, 636], [1040, 680], [860, 680]], DET({ fill: P.mist, stroke: P.steel, width: 1.4 }));
    sk.poly(farG, [[1460, 596], [1390, 612], [1330, 634], [1300, 680], [1460, 680]], DET({ fill: P.mist, stroke: P.steel, width: 1.4 }));
    hazeRect(farG, 560, 720, 0.25);

    // ---------------------------------------------------------------- downstream walls (beyond the bridge), hazy
    const midG = layer("mid");
    const gorgeG = el("g", { class: "gcb-gorge" }, midG);
    const DL = [[-20, 120], [160, 170], [360, 260], [560, 380], [760, 520], [900, 610], [1010, 650], [1040, 700], [1060, 760], [-20, 760]];
    sk.poly(gorgeG, DL, D({ fill: EP5.moss, stroke: INK, width: 3, step: 80, wobble: 1.2 }));
    const DR = [[1940, 110], [1760, 170], [1580, 300], [1460, 440], [1380, 560], [1320, 640], [1290, 700], [1280, 760], [1940, 760]];
    sk.poly(gorgeG, DR, D({ fill: EP5.moss, stroke: INK, width: 3, step: 80, wobble: 1.2 }));
    [[DL, 0], [DR, 1]].forEach(([pts, side]) => {
      const c = clipTo(gorgeG, pts);
      sk.hatch(c, -20, 100, 1960, 680, { seed: S(), gap: 12, angle: side ? 120 : 60, stroke: EP5.leafMid, width: 1.6, opacity: 0.5 });
      for (let i = 0; i < 40; i++) {
        const t = rnd(i * 2.9 + side * 50), x = side ? lerp(1300, 1940, rnd(i * 4.3 + 7)) : lerp(-20, 1020, rnd(i * 4.3 + 7));
        const rim = polyY(side ? pts.slice(0, 8).slice().reverse() : pts.slice(0, 9), x);
        const by = rim + 20 + t * 300;
        farFir(c, x, by, 18 + t * 30, t < 0.4 ? EP5.leafMid : EP5.leafDark, 6, 0.85);
      }
    });
    // rim firs, wind-bent, against the sky
    [[60, 150, 120, 56, 26], [220, 200, 150, 64, 30], [420, 296, 110, 50, 24], [600, 420, 90, 40, 20], [1500, 400, 110, 46, 24], [1640, 250, 150, 64, 30], [1820, 160, 160, 70, 32]].forEach(([x, by, h, w, lean]) =>
      windFir(gorgeG, x, by + 8, h, w, { fill: EP5.leafDark, width: 2.8, lean, tiers: 5, boughs: false }));
    hazeRect(gorgeG, 100, 760, 0.25);

    // ---------------------------------------------------------------- LIGHT: hazy shafts down through the gap
    const lightG = layer("light");
    [[1000, 0, 1180, 0, 1080, 760, 880, 760, 0.16], [1160, 0, 1260, 0, 1200, 760, 1090, 760, 0.12], [700, 0, 780, 0, 760, 600, 640, 600, 0.08]].forEach(([a, b, c, d, e, f, g2, h2, op]) =>
      el("path", { d: "M" + a + " " + b + " L" + c + " " + d + " L" + e + " " + f + " L" + g2 + " " + h2 + " Z", fill: EP5.sunLit, opacity: op }, lightG));

    // ---------------------------------------------------------------- BRIDGE overhead
    const deckG = layer("deck");
    // far pier (its span is gone): broken top, standing in the creek
    const pierFar = el("g", { class: "gcb-pier-far" }, deckG);
    sk.poly(pierFar, [[1352, 520], [1366, 506], [1380, 516], [1396, 498], [1410, 512], [1414, 760], [1350, 762]], D({ fill: EP5.concrete, stroke: INK, width: LINE.main }));
    sk.poly(pierFar, [[1388, 506], [1410, 512], [1414, 760], [1392, 760]], DET({ fill: EP5.concreteDark, stroke: "none", opacity: 0.6 }));
    el("rect", { x: 1350, y: 640, width: 64, height: 8, fill: EP5.mud, opacity: 0.65 }, pierFar);
    bar(pierFar, 1372, 512, 26, -100, -0.5, { w: 2.4 }); bar(pierFar, 1398, 504, 22, -70, 0.6, { w: 2.4 });

    // near pier: massive column with a cap, rising from the creek bed to the deck
    const pierG = el("g", { class: "gcb-pier" }, deckG);
    {
      sk.poly(pierG, [[380, 400], [470, 400], [478, 870], [372, 870]], D({ fill: EP5.concrete, stroke: INK, width: LINE.main }));
      const pc = clipTo(pierG, [[380, 400], [470, 400], [478, 870], [372, 870]]);
      el("rect", { x: 440, y: 400, width: 40, height: 480, fill: EP5.concreteDark, opacity: 0.55 }, pc);
      sk.hatch(pc, 370, 400, 110, 470, { seed: S(), gap: 8, angle: 80, stroke: EP5.concreteDark, width: 1, opacity: 0.4 });
      el("rect", { x: 370, y: 610, width: 110, height: 12, fill: EP5.mud, opacity: 0.7 }, pc); // flood line
      sk.hatch(pc, 370, 622, 110, 250, { seed: S(), gap: 6, angle: 90, stroke: EP5.mud, width: 1, opacity: 0.35 });
      crack(pc, 400, 470, 120, 85, { width: 2 }); crack(pc, 456, 700, 80, 100, { width: 1.6 });
      lines(pc, [[372, 520, 478, 520], [372, 760, 478, 760]], { stroke: INK, width: 1.4, opacity: 0.35 });
      // pier cap
      sk.poly(pierG, [[330, SOFF - 2], [520, SOFF - 2], [512, 404], [338, 404]], D({ fill: EP5.concrete, stroke: INK, width: LINE.main }));
      sk.line(pierG, 340, 396, 510, 396, DET({ stroke: EP5.concreteDark, width: 3, opacity: 0.7 }));
      // flood debris snagged on the pier base
      sk.path(pierG, [[350, 850], [390, 836], [440, 846], [500, 832]], D({ stroke: P.storm, width: 5, double: false }));
      sk.line(pierG, 360, 860, 470, 826, D({ stroke: EP5.rust, width: 4, double: false }));
    }
    // the near deck overhead: railing on top, fascia, soffit with girder flanges, broken end
    const nearG = el("g", { class: "gcb-near-deck" }, deckG);
    const railG = el("g", { class: "gcb-rail" }, nearG);
    const rebarG = el("g", { class: "gcb-rebar" }, nearG);
    const tips = [];
    {
      const END = [[EX, DT], [EX + 14, DT + 10], [EX + 4, DT + 22], [EX + 18, DT + 34], [EX + 2, DT + 50], [EX + 20, DT + 66], [EX + 6, DT + 84], [EX + 26, DT + 100], [EX + 10, SOFF]];
      // soffit band (underside, receding) with girder bottoms
      sk.poly(nearG, [[-20, DT + 26], [EX + 4, DT + 26]].concat(END.slice(2)).concat([[-20, SOFF]]), D({ fill: EP5.concreteDark, stroke: INK, width: LINE.main, step: 300 }));
      const sc = clipTo(nearG, [[-20, DT + 26], [EX + 30, DT + 26], [EX + 30, SOFF], [-20, SOFF]]);
      [[DT + 40, 10], [DT + 66, 9], [DT + 90, 8], [DT + 110, 6]].forEach(([y, h], i) => {
        sk.poly(sc, [[-20, y], [EX + 20, y], [EX + 20, y + h], [-20, y + h]], DET({ fill: i % 2 ? P.slate : P.storm, stroke: INK, width: 1.6 }));
      });
      for (let x = 60; x < EX; x += 150) lines(sc, [[x, DT + 28, x + 6, SOFF]], { stroke: INK, width: 2.4, opacity: 0.5 }); // diaphragms
      sk.hatch(sc, -20, DT + 26, EX + 40, SOFF - DT, { seed: S(), gap: 9, angle: 10, stroke: P.storm, width: 1, opacity: 0.35 });
      // efflorescence / water stains under the deck
      for (let i = 0; i < 8; i++) { const x = 80 + i * 120; el("path", { d: "M" + x + " " + (DT + 28) + " q 4 18 -2 34", stroke: P.fog, "stroke-width": 2, fill: "none", opacity: 0.45 }, sc); }
      // fascia (front face) on top
      sk.poly(nearG, [[-20, DT], [EX, DT], [EX + 14, DT + 10], [EX + 4, DT + 22], [EX + 4, DT + 26], [-20, DT + 26]], D({ fill: EP5.concrete, stroke: INK, width: LINE.main }));
      sk.line(nearG, -10, DT + 21, EX - 6, DT + 21, DET({ stroke: EP5.concreteDark, width: 2, opacity: 0.8 }));
      // the fracture face beyond the jagged outline: broken concrete, aggregate, crumbs
      const OUT = END.map(([x, y], i) => [x + 22 + rnd(i * 3.7 + 2) * 16, y + (i === 0 ? 6 : 0)]);
      const FF = END.concat(OUT.slice().reverse());
      sk.poly(nearG, FF, D({ fill: EP5.concreteDark, stroke: INK, width: 2.6, wobble: 0.5, step: 400 }));
      const ffc = clipTo(nearG, FF);
      sk.hatch(ffc, EX - 10, DT, 70, SOFF - DT + 10, { seed: S(), gap: 7, angle: 70, stroke: INK, width: 0.8, opacity: 0.25 });
      aggregate(ffc, EX - 4, DT, EX + 50, SOFF + 4, 60, 2.8, 1, true);
      aggregate(nearG, EX - 30, DT + 2, EX + 4, DT + 24, 10, 2, 0.8);
      sk.path(nearG, END, D({ stroke: INK, width: LINE.main, wobble: 0.5, step: 400 }));
      sk.path(nearG, OUT, DET({ stroke: INK, width: 2.4, wobble: 0.6 }));
      // railing (posts + top rail) seen from below; torn at the end and dangling
      for (let x = 30; x < EX - 30; x += 46) sk.rect(railG, x - 5, DT - 36, 10, 36, D({ fill: EP5.concrete, stroke: INK, width: 2.6 }));
      sk.poly(railG, [[-20, DT - 40], [EX - 40, DT - 40], [EX - 40, DT - 31], [-20, DT - 31]], D({ fill: P.mist, stroke: INK, width: 3 }));
      const dangleG = el("g", { class: "gcb-dangle" }, nearG);
      sk.poly(dangleG, [[EX - 42, DT - 40], [EX + 30, DT - 40], [EX + 74, DT - 8], [EX + 100, DT + 90], [EX + 108, DT + 190], [EX + 96, DT + 192], [EX + 88, DT + 94], [EX + 64, DT - 2], [EX + 26, DT - 31], [EX - 42, DT - 31]], D({ fill: P.mist, stroke: INK, width: 3, step: 400 }));
      sk.path(dangleG, [[EX - 30, DT - 36], [EX + 28, DT - 36], [EX + 68, DT - 4], [EX + 94, DT + 92], [EX + 102, DT + 186]], DET({ stroke: P.steel, width: 1.6 }));
      sk.poly(dangleG, [[EX + 94, DT + 184], [EX + 110, DT + 186], [EX + 108, DT + 236], [EX + 92, DT + 234]], DET({ fill: EP5.concrete, stroke: INK, width: 2.4 }));
      // rebar + strands hanging from the broken end
      [[EX + 30, DT + 8, 46, -10, 1.6], [EX + 34, DT + 30, 64, 4, 1.5], [EX + 28, DT + 52, 80, 20, 1.2], [EX + 38, DT + 74, 56, 10, 1.4], [EX + 30, DT + 96, 96, 40, 0.9], [EX + 24, SOFF - 6, 120, 80, 0.2], [EX - 10, SOFF - 2, 80, 100, 0.2], [EX + 36, DT + 40, 34, -30, 1.8]].forEach(([x, y, l, a, d]) => tips.push(bar(rebarG, x, y, l, a, d, { w: 3.4 })));
      // a chunk of deck still hanging on two bars
      const hb = bar(rebarG, EX - 30, SOFF - 4, 70, 92, 0.2, { w: 2.6 });
      sk.poly(rebarG, [[hb[0] - 18, hb[1] - 4], [hb[0] + 14, hb[1] - 10], [hb[0] + 20, hb[1] + 16], [hb[0] - 10, hb[1] + 22]], DET({ fill: EP5.concrete, stroke: INK, width: 2.2 }));
      tips.push(hb);
      nearG.appendChild(rebarG); // bars in front of the fracture face
    }
    // the far stub overhead (right), coming from behind the right wall
    const farSideG = el("g", { class: "gcb-far-stub" }, deckG);
    {
      const FT = DT + 12, FS = SOFF + 8;
      sk.poly(farSideG, [[FX, FT], [1940, FT], [1940, FS], [FX + 6, FS], [FX - 10, FS - 30], [FX + 4, FT + 60], [FX - 8, FT + 30]], D({ fill: EP5.concreteDark, stroke: INK, width: LINE.main }));
      sk.poly(farSideG, [[FX, FT], [1940, FT], [1940, FT + 26], [FX - 4, FT + 26]], D({ fill: EP5.concrete, stroke: INK, width: LINE.main }));
      const fc = clipTo(farSideG, [[FX - 20, FT + 26], [1940, FT + 26], [1940, FS], [FX - 20, FS]]);
      [[FT + 40, 9], [FT + 64, 8], [FT + 86, 7]].forEach(([y, h], i) => sk.poly(fc, [[FX - 20, y], [1940, y], [1940, y + h], [FX - 20, y + h]], DET({ fill: i % 2 ? P.slate : P.storm, stroke: INK, width: 1.4 })));
      for (let x = FX + 10; x < 1940; x += 46) sk.rect(farSideG, x - 5, FT - 34, 10, 34, D({ fill: EP5.concrete, stroke: INK, width: 2.4 }));
      sk.poly(farSideG, [[FX + 4, FT - 38], [1940, FT - 38], [1940, FT - 29], [FX + 4, FT - 29]], D({ fill: P.mist, stroke: INK, width: 3 }));
      aggregate(farSideG, FX - 10, FT + 2, FX + 10, FS - 4, 14, 2, 0.85);
      [[FX - 4, FT + 34, 40, 110, 0.5], [FX - 6, FT + 70, 60, 100, 0.3], [FX, FS - 6, 50, 95, -0.3]].forEach(([x, y, l, a, d]) => bar(farSideG, x, y, l, a, d, { w: 2.6 }));
    }
    hazeRect(deckG, 180, 420, 0.06);

    // ---------------------------------------------------------------- the FALLEN SPAN, tilted from the far pier into the creek
    const spanG = el("g", { class: "gcb-span" }, midG);
    {
      const A = [700, 800], B = [1360, 520];            // fascia top edge: low nose .. high end on the pier
      const A3 = [720, 760], B3 = [1374, 492];          // far edge of the deck top (tilted toward us)
      sk.poly(spanG, [A, B, [B[0] + 4, B[1] + 34], [A[0] + 4, A[1] + 44]], D({ fill: EP5.concrete, stroke: INK, width: LINE.main })); // fascia
      sk.poly(spanG, [A, B, B3, A3], D({ fill: EP5.concrete, stroke: INK, width: LINE.main })); // deck top
      const tc = clipTo(spanG, [A, B, B3, A3]);
      sk.hatch(tc, 690, 480, 700, 330, { seed: S(), gap: 8, angle: -24, stroke: EP5.concreteDark, width: 1.1, opacity: 0.5 });
      for (let i = 0; i < 8; i++) {
        const t = 0.05 + i * 0.12, x = lerp((A[0] + A3[0]) / 2, (B[0] + B3[0]) / 2, t), y = lerp((A[1] + A3[1]) / 2, (B[1] + B3[1]) / 2, t);
        sk.line(tc, x, y, x + 34, y - 14.5, DET({ stroke: P.paper, width: 3, opacity: 0.7 }));
      }
      crack(tc, 900, 760, 50, -70, { width: 1.6 }); crack(tc, 1120, 640, 40, -110, { width: 1.6 });
      const fc = clipTo(spanG, [A, B, [B[0] + 4, B[1] + 34], [A[0] + 4, A[1] + 44]]);
      sk.hatch(fc, 690, 500, 700, 360, { seed: S(), gap: 7, angle: 70, stroke: EP5.concreteDark, width: 1, opacity: 0.5 });
      el("path", { d: "M700 820 L1360 540 L1364 560 L704 846 Z", fill: EP5.mud, opacity: 0.45 }, fc); // flood mud on the fascia
      // bent railing posts on the top far edge
      for (let i = 0; i < 14; i++) {
        const t = 0.03 + i * 0.07, x = lerp(A3[0], B3[0], t), y = lerp(A3[1], B3[1], t), k = i < 4 ? (4 - i) * 5 : 0;
        sk.line(spanG, x, y, x - 3 - k, y - 26 + k, DET({ stroke: INK, width: 2.2 }));
      }
      sk.path(spanG, [[A3[0] - 22, A3[1] - 10], [lerp(A3[0], B3[0], 0.3) - 3, lerp(A3[1], B3[1], 0.3) - 26], [B3[0] - 3, B3[1] - 26]], DET({ stroke: INK, width: 2.6 }));
      // ends: rebar
      [[A[0] + 2, A[1] + 10, 30, 160, 0.6], [A3[0], A3[1] + 4, 26, 190, -0.4], [B[0] + 4, B[1] + 10, 24, -20, 0.8]].forEach(([x, y, l, a, d]) => bar(spanG, x, y, l, a, d, { w: 2.4 }));
      // nose in the creek
      sk.path(spanG, ellPts(712, 850, 50, 8, 16), D({ closed: true, stroke: P.paper, width: 2, double: false }));
    }

    // ---------------------------------------------------------------- FLOOR: the wide gravel bed, the thin creek
    const floorG = el("g", { class: "gcb-floor" }, midG);
    const FL = [[-20, 740], [300, 750], [700, 780], [1000, 760], [1300, 748], [1940, 740], [1940, 1100], [-20, 1100]];
    sk.poly(floorG, FL, D({ fill: EP5.dust, stroke: INK, width: 3, step: 200, wobble: 0.8 }));
    const flc = clipTo(floorG, FL);
    sk.hatch(flc, -20, 740, 1960, 360, { seed: S(), gap: 12, angle: 8, stroke: EP5.gravel, width: 1.5, opacity: 0.45 });
    for (let i = 0; i < 120; i++) {
      const t = rnd(i * 1.3 + 9), y = lerp(760, 1070, t), x = lerp(-10, 1930, rnd(i * 2.9 + 3)), r = 2 + t * 9;
      el("ellipse", { cx: f1(x), cy: f1(y), rx: f1(r * 1.3), ry: f1(r * 0.7), fill: i % 3 ? P.fog : EP5.gravel, stroke: INK, "stroke-width": f1(0.6 + t * 1.2), opacity: 0.85 }, flc);
    }
    const CREEK = [[1300, 752], [1180, 770], [1000, 790], [860, 830], [760, 868], [700, 900], [640, 960], [560, 1020], [460, 1090]];
    {
      const half = (i) => 3 + (CREEK[i][1] - 750) * 0.09;
      const L = CREEK.map((p, i) => [p[0], p[1] - half(i) * 0.5]), R = CREEK.map((p, i) => [p[0] + half(i) * 1.6, p[1] + half(i) * 0.4]);
      sk.poly(floorG, L.concat(R.reverse()), D({ fill: P.mist, stroke: P.steel, width: 2, step: 40, wobble: 0.6, double: false }));
      sk.path(floorG, CREEK.map(([x, y], i) => [x + half(i) * 0.6, y]), DET({ stroke: P.paper, width: 2.2, opacity: 0.9, step: 40 }));
      [[880, 840, 28, 6], [620, 990, 44, 9]].forEach(([x, y, rx, ry]) => sk.path(floorG, ellPts(x, y, rx, ry, 16), D({ closed: true, fill: P.mist, stroke: P.steel, width: 1.6, double: false })));
    }
    // fallen chunks of deck on the bed (one big with rebar, near right)
    {
      const cg = el("g", {}, floorG);
      sk.poly(cg, [[1380, 930], [1420, 880], [1520, 868], [1572, 900], [1560, 950], [1400, 962]], D({ fill: EP5.concrete, stroke: INK, width: LINE.main }));
      sk.poly(cg, [[1380, 930], [1400, 962], [1560, 950], [1572, 900], [1560, 920], [1404, 934]], DET({ fill: EP5.concreteDark, stroke: "none", opacity: 0.6 }));
      aggregate(cg, 1390, 880, 1560, 950, 30, 2.4, 0.8);
      [[1520, 872, 60, -70, 0.8], [1546, 884, 50, -40, 1.2], [1420, 884, 40, -120, -0.6]].forEach(([x, y, l, a, d]) => bar(cg, x, y, l, a, d, { w: 3 }));
      rock(floorG, 1240, 820, 22, { fill: EP5.concrete });
      // flood wrack on the bed: a tire, a twisted guardrail piece, a crab pot
      sk.path(floorG, ellPts(1010, 905, 26, 10, 16), D({ closed: true, fill: P.storm, stroke: INK, width: 3, double: false }));
      sk.path(floorG, ellPts(1010, 903, 11, 4, 12), DET({ closed: true, fill: EP5.gravel, stroke: INK, width: 1.6 }));
      sk.poly(floorG, [[560, 860], [700, 846], [760, 862], [820, 850], [822, 862], [762, 876], [700, 860], [562, 874]], D({ fill: P.mist, stroke: INK, width: 2.6 }));
      sk.line(floorG, 566, 867, 816, 857, DET({ stroke: P.steel, width: 1.6 }));
      sk.rect(floorG, 1150, 846, 44, 26, D({ fill: "none", stroke: P.storm, width: 2.4 }));
      sk.hatch(floorG, 1150, 846, 44, 26, { seed: S(), gap: 6, angle: 45, stroke: P.storm, width: 1, opacity: 0.6 });
      sk.hatch(floorG, 1150, 846, 44, 26, { seed: S(), gap: 6, angle: -45, stroke: P.storm, width: 1, opacity: 0.6 });
      rock(floorG, 1090, 812, 14, { fill: EP5.concrete });
    }
    hazeRect(midG, 480, 760, 0.1);

    // ---------------------------------------------------------------- NEAR WALLS (upstream, big): framing left + right
    const fgG = layer("fg");
    // a near (upstream) gorge wall: stacked rock blocks, moss, ferns in the cracks, a high-water mud line
    function nearWall(pts, side) {
      sk.poly(fgG, pts, D({ fill: P.slate, stroke: INK, width: LINE.main, step: 60, wobble: 1.6 }));
      const c = clipTo(fgG, pts);
      const xs = pts.map((q) => q[0]), x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
      sk.hatch(c, x0, -20, x1 - x0, 1120, { seed: S(), gap: 11, angle: side < 0 ? 75 : 105, stroke: INK, width: 1.4, opacity: 0.22 });
      let row = 0;
      for (let y = -30; y < 1080; y += 96 + rnd(row * 3.1 + side) * 40, row++) {
        const h = 70 + rnd(row * 2.3 + side * 7) * 40;
        const n = 2;
        for (let k = 0; k < n; k++) {
          const bx0 = lerp(x0, x1, k / n) + (row % 2) * 30 * side - 10, bx1 = lerp(x0, x1, (k + 1) / n) + (row % 2) * 30 * side + 10;
          const j = (i) => (rnd(row * 11 + k * 5 + i + side * 3) - 0.5) * 16;
          const blk = [[bx0 + j(1), y + 8 + j(2)], [lerp(bx0, bx1, 0.4), y + j(3)], [bx1 + j(4), y + 6 + j(5)], [bx1 + j(6), y + h + j(7)], [lerp(bx0, bx1, 0.55), y + h + 8 + j(8)], [bx0 + j(9), y + h + j(10)]];
          sk.poly(c, blk, D({ fill: (row + k) % 3 === 0 ? P.steel : (row + k) % 3 === 1 ? EP5.concreteDark : P.slate, stroke: INK, width: 2.6, wobble: 1, step: 400, double: false }));
          // lit top lip and a dark undercut
          sk.path(c, [blk[0], blk[1], blk[2]], DET({ stroke: EP5.concrete, width: 3, opacity: 0.8 }));
          el("path", { d: "M" + f1(blk[5][0]) + " " + f1(blk[5][1]) + " L" + f1(blk[4][0]) + " " + f1(blk[4][1]) + " L" + f1(blk[3][0]) + " " + f1(blk[3][1]) + " L" + f1(blk[3][0]) + " " + f1(blk[3][1] - 14) + " L" + f1(blk[5][0]) + " " + f1(blk[5][1] - 12) + " Z", fill: EP5.hardShadow, opacity: 0.35 }, c);
          if ((row + k) % 2 === 0) { // moss cushion on the block top
            const mx = lerp(bx0, bx1, 0.3 + rnd(row + k) * 0.3), my = y + 4;
            sk.poly(c, [[mx - 34, my + 8], [mx - 22, my - 6], [mx, my - 10], [mx + 26, my - 4], [mx + 38, my + 8], [mx + 10, my + 14]], DET({ fill: EP5.moss, stroke: INK, width: 1.6, wobble: 1.2 }));
          }
          if ((row + k) % 3 === 2 && y > 80) fern(c, lerp(bx0, bx1, 0.5), y + 6, 30 + rnd(row) * 16, side * 30, EP5.leafDark, 2.2);
        }
      }
      // high-water mud line + wrack caught in the cracks
      const my = 640;
      sk.path(c, [[x0, my + 4], [lerp(x0, x1, 0.3), my - 2], [lerp(x0, x1, 0.6), my + 5], [x1, my]], DET({ stroke: EP5.mud, width: 9, opacity: 0.55, wobble: 2 }));
      sk.path(c, [[lerp(x0, x1, 0.2), my - 6], [lerp(x0, x1, 0.32), my + 2], [lerp(x0, x1, 0.4), my - 4]], DET({ stroke: P.storm, width: 3 }));
      return c;
    }
    const NL = [[-20, -20], [200, -20], [218, 60], [250, 110], [236, 190], [272, 260], [262, 340], [246, 420], [282, 480], [266, 560], [300, 640], [288, 720], [318, 790], [300, 860], [340, 930], [310, 1100], [-20, 1100]];
    nearWall(NL, -1);
    windFir(fgG, 210, 260, 380, 150, { fill: EP5.leafDark, width: LINE.main, lean: 80, tiers: 8 });
    sk.path(fgG, [[230, 300], [270, 260], [300, 270], [330, 240]], D({ stroke: INK, width: 5, double: false })); // root over the lip
    sk.path(fgG, [[262, 340], [290, 380], [284, 430], [300, 470]], D({ stroke: INK, width: 3, double: false })); // hanging root
    const NR = [[1940, -20], [1760, -20], [1736, 70], [1712, 150], [1726, 230], [1690, 320], [1702, 400], [1724, 480], [1684, 560], [1690, 640], [1716, 720], [1676, 800], [1650, 880], [1668, 960], [1680, 1100], [1940, 1100]];
    nearWall(NR, 1);
    windFir(fgG, 1720, 200, 300, 130, { fill: EP5.leafDark, width: LINE.main, lean: 60, tiers: 7 });
    // foreground boulders, ferns, a driftwood log (low detail at the bottom)
    rock(fgG, 200, 990, 70, { fill: EP5.concreteDark, width: 3.4, opacity: 1 });
    rock(fgG, 1760, 1000, 80, { fill: EP5.concreteDark, width: 3.4, opacity: 1 });
    sk.poly(fgG, [[1080, 1010], [1440, 984], [1452, 1006], [1090, 1034]], D({ fill: P.steel, stroke: INK, width: 3.4 }));
    sk.path(fgG, ellPts(1446, 995, 8, 11, 12), D({ closed: true, fill: P.mist, stroke: INK, width: 2.4, double: false }));
    [[300, 900, 50, -30], [330, 890, 40, 10], [1640, 900, 50, 30], [1610, 910, 40, -10]].forEach(([x, y, l, a]) => fern(fgG, x, y, l, a, EP5.leafDark, 2.6));

    const deckEdgeY = UNDER.deckEdgeY;
    return {
      g: root,
      view: "below",
      light: LIGHT,
      groundY: GROUND,
      deckEdgeY,
      underView: Object.assign({}, UNDER),
      edge: { x: EX, y: deckEdgeY },
      rebar: { g: rebarG, tips },
      guardrail: { g: railG, x0: 0, x1: EX - 40, y: deckEdgeY, seatY: deckEdgeY - 38 },
      crowdZone: { x0: UNDER.x0, x1: UNDER.x1 },
      signBus: { x: 214, y: 640, w: 64, visible: false },
      pier: { g: pierG, x: 425, topY: 362, y: 868 },
      span: { g: spanG, x0: 700, y0: 800, x1: 1360, y1: 520 },
      farSide: { g: farSideG, x0: FX, y: DT + 12 },
      gorge: { g: gorgeG, floorG, bottomY: GROUND, creek: CREEK },
      seaG: sea, sea, setLevel: sea.setLevel,
      skyG, lightG, shadowDir: SHADOW,
      detail: { g: nearG, x: EX, y: 300 },
      far: { g: farG }, mid: { g: midG }, deck: { g: deckG }, fg: { g: fgG },
    };
  }
};
