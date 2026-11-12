/* Rainy Day background — `tideFlats` v1. Episode 5, DAY 9 (the dry spell): the edge of the flooded town at LOW
 * TIDE, LATE AFTERNOON. Wide shining mud flats where the streets were; Gull Harbor's clapboard houses (same build
 * as townView / mainStreet: paper/fog siding, steel/slate gables, dark windows) with mud lines at ROOF height, some
 * shoved off their foundations and tilted; at LEFT the nearest house has a FISHING BOAT (the SEA LARK) sitting on
 * its crushed roof — wheelhouse, mast, outrigger poles — with a rope ladder hanging down a debris pile to the mud.
 * The debris line runs across the middle distance (planks, a tire, a kitchen chair, a fridge, crab pots, a mailbox,
 * kelp), old pier pilings stand out on the flats, and far out the receding water shines. Low sun from the RIGHT
 * (west, over the sea), long ink-blue shadows to the LEFT, warm `lateSky`. The hilltop camp is a speck on the
 * ridge at upper left.
 *
 * Paste VERBATIM after assets/characters/rainy-day-rig-v3.js (uses only palette, LINE, el, sk, hash, so later rigs
 * work too). Deterministic, static; scenes own all motion. Weather is NOT included.
 *
 *   const bg = window.RainyDayBG.tideFlats(layerG, {});
 *   RD.figure(layer, { character: "drizzle", x: 1180, y: bg.groundY - 116 * 1.4, scale: 1.4 });
 *   // matching figure shadow: a flat ellipse/poly from the feet toward bg.shadowDir, length ≈ height * shadowDir.k
 *
 * OPTS (all optional):
 *   light: "late"   the location's own light (default and only grade: late afternoon, sun low at right).
 *   level: 500      initial y of the near edge of the far water (see water.setLevel).
 *
 * HANDLES returned (screen px in the 1920x1080 viewBox):
 *   g            root <g>.
 *   groundY      860   the firm mud edge where feet stand (figure y = 860 - 116*scale; 697.6 at scale 1.4).
 *                Walkable full width; y 860–940 is open mud (no props except the crate at x ~1335).
 *   groundAt(y)  → suggested RainyDay.figure scale for a figure standing at ground y on the flats (perspective:
 *                1.4 at y 860, ~0.86 at the debris line y 712, ~0.6 at the boat house y 630).
 *   mudZone      { x0: 1100, x1: 1700, y0: 852, y1: 940, sinkY: 34 }  the soft, wet mud where feet SINK (glossy
 *                patches). sinkY = how far (px at scale 1.4) a shin-deep sink lowers the figure.
 *   boat         { g, x: 356, y: 340, deckY: 282, bowX: 67, sternX: 640, wheelhouse: { x: 527, y: 278, g },
 *                  doorX: 527, roofY: 178, rail: { x: 620, y: 249 } }
 *                The fishing boat on the roof. x/y = keel centre on the crushed ridge; deckY = deck level by the
 *                wheelhouse (feet of a ~0.55-scale figure on deck); wheelhouse.x/y = foot of its open aft door
 *                (where Drizzle goes in / comes out with the whistle); rail = stern rail where the ladder hangs.
 *   ladder       { g, x0: 620, y0: 249, x1: 662, y1: 479 }  rope ladder from the stern rail to the pile top.
 *   pile         { g, x: 880, y: 714, topX: 650, topY: 476, path: [[x,y]..] }
 *                debris pile against the house's right gable, up to the roof. x/y = foot of the climb on the mud,
 *                topX/topY = top of the pile under the ladder; path = a climbing line foot → top (for feet).
 *   house        { g, x: 70, y: 630, w: 456, eaveY: 464, ridgeY: 334 }  the boat house (front-left base corner).
 *   houses       [ { g, x, y } ]  the other town houses (x = front-left base, y = mud line at the base).
 *   crate        { g, x: 1372, y: 872, dentCan: { x: 1409, y: 896 }, cleanCans: [ { x: 1336, y: 898 }, { x: 1354, y: 902 } ] }
 *                the split crate of cans half sunk in the soft mud; x/y = top of the crate where the cans are packed;
 *                dentCan = the dented, swollen can lying on its side; cleanCans = two sound cans spilled in the mud.
 *   debris       { g, y: 712, items: [ { kind, x, y } ] }  the debris line (tire, chair, fridge, crabPot ×2,
 *                mailbox, planks); x/y = item base on the mud.
 *   pilings      [ { g, x, y, topY } ]  old pier pilings (the last, x 1838, is the tall near one at right).
 *   water        { g, edgeG, levelY: 500, horizonY: 455, setLevel(y) }  the receding sea far out (edgeG = the redrawn near
 *                edge, layered above the flats). setLevel(y) redraws the
 *                near edge of the water at screen y (larger y = water comes nearer; 492 far out … 560 flooding the
 *                outer flats). Pure function of y, safe in an onUpdate.
 *   sun          { x: 1690, y: 318, r: 34 }  the low sun (right).
 *   skyG         sky group (gradient, clouds, sun disc, far gulls).
 *   lightG       late-light overlays scenes may fade or nudge: sun glow + rays, the glitter path on the water and
 *                the wet mud under the sun, rim-light strokes on the sun-facing (right) edges, puddle glints.
 *   shadowsG     all cast ground shadows (one group; fade it with lightG for a cloud passing the sun).
 *   shadowDir    { dx: -0.9, dy: 0.15, k: 2.2 }  direction cast shadows fall (unit-ish, screen space); k = shadow
 *                length per px of object height (a 310 px figure throws a ~680 px shadow).
 *   detail       { g, x: 1236, y: 884, w: 96, h: 34 }  the hero close-up: a boot-print hole in the soft mud with a
 *                sucked-in puddle (squeezed rim, lug-tread marks, bubbles, the sky in the water). Reads at ~3x.
 *   layers       { sky, far, water, flats, waterEdge, shadows, town, mid, near, light }  draw-order groups (back → front).
 */
(function () {
  window.RainyDayBG = window.RainyDayBG || {};
  if (window.RainyDayBG.tideFlats) return;
  let instance = 0;

  window.RainyDayBG.tideFlats = function (parent, opts) {
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
    const LIGHT = "late"; // the only grade for this location
    void opts.light;

    instance++;
    const uid = "rdtf" + instance + "_";
    let sN = 9300 + instance * 1000;
    const S = () => (sN += 7);
    const rnd = (i) => (H(i * 1.731 + 91.3) + 1) / 2; // deterministic 0..1
    const f1 = (v) => (+v).toFixed(1);
    const Dp = (pts, close) => "M" + pts.map((p) => f1(p[0]) + " " + f1(p[1])).join(" L") + (close ? " Z" : "");
    const FONT_SIGN = "'League Gothic', Oswald, Impact, 'Arial Narrow', sans-serif";
    const FONT_HAND = "Kalam, 'Comic Sans MS', cursive";

    const HOR = 455, GROUND = 860, L0 = opts.level !== undefined ? +opts.level : 500;
    const SUN = { x: 1690, y: 318, r: 34 };
    const SH = { dx: -0.9, dy: 0.15, k: 2.2 };
    const sc = (y) => Math.max(0.05, (y - HOR) / 289); // figure scale at ground y (1.4 at 860)

    const g = el("g", { class: "rd-bg rd-bg-tide-flats" }, parent);
    const defs = el("defs", {}, g);
    const layer = (name, par) => el("g", { class: "tf-" + name }, par || g);
    function lgrad(name, stops, x2, y2) {
      const lg = el("linearGradient", { id: uid + name, x1: 0, y1: 0, x2: x2 || 0, y2: y2 === undefined ? 1 : y2 }, defs);
      stops.forEach(([o, c, a]) => el("stop", { offset: o, "stop-color": c, "stop-opacity": a === undefined ? 1 : a }, lg));
      return "url(#" + uid + name + ")";
    }
    function rgrad(name, stops) {
      const rg = el("radialGradient", { id: uid + name, cx: 0.5, cy: 0.5, r: 0.5 }, defs);
      stops.forEach(([o, c, a]) => el("stop", { offset: o, "stop-color": c, "stop-opacity": a === undefined ? 1 : a }, rg));
      return "url(#" + uid + name + ")";
    }
    let clipN = 0;
    function clipTo(par, pts) { // group clipped to a polygon (keeps rect-shaped hatching inside its shape)
      const id = uid + "c" + clipN++;
      const cp = el("clipPath", { id }, defs);
      el("path", { d: Dp(pts, true) }, cp);
      return el("g", { "clip-path": `url(#${id})` }, par);
    }
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
    function lines(par, segs, o) { // many plain strokes in one <path> (texture)
      o = o || {};
      const d = segs.map((s) => `M${f1(s[0])} ${f1(s[1])} L${f1(s[2])} ${f1(s[3])}`).join(" ");
      return el("path", { d, stroke: o.stroke || P.storm, "stroke-width": o.width || 1.6, fill: "none", opacity: o.opacity !== undefined ? o.opacity : 0.35, "stroke-linecap": "round" }, par);
    }
    const ellPts = (cx, cy, rx, ry, n, j, sd) => {
      const a = []; n = n || 20;
      for (let i = 0; i < n; i++) { const t = (i / n) * Math.PI * 2, k = 1 + (j ? H((sd || 1) + i * 3.1) * j : 0); a.push([cx + Math.cos(t) * rx * k, cy + Math.sin(t) * ry * k]); }
      return a;
    };
    const rotPt = (p, cx, cy, deg) => {
      const r = (deg * Math.PI) / 180, dx = p[0] - cx, dy = p[1] - cy;
      return [cx + dx * Math.cos(r) - dy * Math.sin(r), cy + dx * Math.sin(r) + dy * Math.cos(r)];
    };
    function hull(pts) { // convex hull (monotone chain) — for cast-shadow polygons
      const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
      const lo = [], up = [];
      p.forEach((q) => { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); });
      for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
      up.pop(); lo.pop();
      return lo.concat(up);
    }

    // draw-order layers
    const skyG = layer("sky"), farL = layer("far"), waterL = layer("water"), flatsL = layer("flats"), waterEdgeL = layer("water-edge");
    const shadowsG = layer("shadows"), townL = layer("town"), midL = layer("mid"), nearL = layer("near");
    const lightG = layer("light");
    const rimG = el("g", { class: "tf-rims" }, lightG);

    // cast shadow from a base footprint + the tops above it: hull of base pts + projected tops
    // tops: [[x, y(base), h]] → projected to (x + dx*k*h, y + dy*k*h)
    function castShadow(base, tops, o) {
      o = o || {};
      const pts = base.slice();
      tops.forEach(([x, y, h]) => pts.push([x + SH.dx * SH.k * h, y + SH.dy * SH.k * h]));
      const hp = hull(pts);
      return sk.poly(o.par || shadowsG, hp, { fill: o.fill || P.storm, stroke: "none", seed: S(), wobble: 1.2, double: false, opacity: o.opacity !== undefined ? o.opacity : 0.42, step: 30 });
    }
    function poleShadow(x, y, h, w, o) { // thin tapering shadow of a post / leg / pole
      o = o || {};
      const ex = x + SH.dx * SH.k * h, ey = y + SH.dy * SH.k * h;
      return sk.poly(o.par || shadowsG, [[x - w * 0.5, y - w * 0.12], [x + w * 0.5, y + w * 0.12], [ex + w * 0.3, ey + w * 0.2], [ex - w * 0.3, ey - w * 0.05]], { fill: P.storm, stroke: "none", seed: S(), wobble: 0.8, double: false, opacity: o.opacity !== undefined ? o.opacity : 0.4 });
    }
    function rim(pts, w, op, par) { // late-sun rim light on a sun-facing edge (drawn in the object's own group so occluders hide it)
      sk.path(par || rimG, pts, { stroke: EP5.mudShine, width: w || 2.4, seed: S(), wobble: 0.5, double: false, opacity: op !== undefined ? op : 0.9 });
    }

    // ================================================================== SKY (late afternoon, warm and pale)
    el("rect", { x: -40, y: -40, width: 2000, height: HOR + 60, fill: lgrad("sky", [[0, P.mist], [0.18, P.fog], [0.5, EP5.lateSky], [1, EP5.mudShine]]) }, skyG);
    el("rect", { x: 900, y: -40, width: 1060, height: HOR + 60, fill: lgrad("skyWarm", [[0, EP5.lateSky, 0], [1, EP5.lateSky, 0.55]], 1, 0) }, skyG);
    // sun disc (pale, low, right) + a halo ring of pen strokes
    el("circle", { cx: SUN.x, cy: SUN.y, r: SUN.r + 30, fill: EP5.mudShine, opacity: 0.45 }, skyG);
    sk.circle(skyG, SUN.x, SUN.y, SUN.r, { fill: P.paper, stroke: EP5.mudShine, width: 3, seed: S(), wobble: 0.6, double: false });
    // streaky stratus, lit on the underside toward the sun
    function streak(x0, x1, cy, h, sd, o) {
      o = o || {};
      const top = [], bot = [], n = Math.max(5, Math.round((x1 - x0) / 60));
      for (let i = 0; i <= n; i++) {
        const t = i / n, x = x0 + (x1 - x0) * t, bump = Math.pow(Math.sin(t * Math.PI), 0.8) * h;
        top.push([x, cy - bump * (0.7 + 0.3 * rnd(sd + i))]);
        bot.push([x + 14, cy + bump * 0.22]);
      }
      const pts = top.concat(bot.reverse());
      sk.poly(skyG, pts, { fill: o.fill || P.fog, stroke: o.stroke || P.mist, width: o.width || 1.8, seed: S(), wobble: 1.2, double: false, opacity: o.opacity !== undefined ? o.opacity : 0.75, step: 40 });
      sk.path(skyG, bot.slice(1, -1).map((p) => [p[0], p[1] - 1]), { stroke: o.lit || EP5.mudShine, width: 3, seed: S(), wobble: 0.8, double: false, opacity: 0.85 });
      const ls = [];
      for (let i = 0; i < n * 2; i++) { const x = x0 + 20 + rnd(sd + i * 5) * (x1 - x0 - 40); ls.push([x, cy - h * 0.25 + rnd(sd + i * 7) * h * 0.3, x + 30 + rnd(sd + i) * 50, cy - h * 0.2 + rnd(sd + i * 7) * h * 0.3]); }
      lines(skyG, ls, { stroke: P.mist, width: 1.4, opacity: 0.5 });
    }
    streak(-40, 520, 92, 34, 11, { fill: P.fog, opacity: 0.7 });
    streak(380, 1120, 150, 28, 23, { fill: P.fog, opacity: 0.65 });
    streak(980, 1560, 78, 30, 37, { fill: P.fog, opacity: 0.6 });
    streak(1300, 1980, 206, 22, 41, { fill: EP5.lateSky, stroke: P.mist, opacity: 0.85 });
    streak(1500, 1900, 268, 12, 53, { fill: EP5.mudShine, stroke: EP5.lateSky, opacity: 0.9 });
    streak(60, 640, 262, 16, 61, { fill: EP5.lateSky, stroke: P.fog, opacity: 0.55 });
    streak(700, 1240, 330, 12, 71, { fill: EP5.mudShine, stroke: EP5.lateSky, opacity: 0.5 });
    // a few far gulls
    [[1180, 236, 1], [1222, 252, 0.8], [1264, 228, 0.9], [860, 300, 0.7], [1490, 160, 1.1]].forEach(([x, y, s]) =>
      el("path", { d: `M${f1(x - 9 * s)} ${f1(y)} Q${f1(x - 4 * s)} ${f1(y - 6 * s)} ${f1(x)} ${f1(y)} Q${f1(x + 4 * s)} ${f1(y - 6 * s)} ${f1(x + 9 * s)} ${f1(y)}`, stroke: P.slate, "stroke-width": 2, fill: "none", "stroke-linecap": "round", opacity: 0.8 }, skyG));

    // ================================================================== FAR: open sea horizon, far spit, the wooded hill (left)
    // far spit / headland across the bay (right, faint, backlit)
    sk.poly(farL, [[1380, HOR + 1], [1460, HOR - 9], [1560, HOR - 14], [1660, HOR - 10], [1720, HOR - 4], [1760, HOR + 1]], { fill: P.mist, stroke: P.mist, width: 1.4, seed: S(), double: false, wobble: 0.8, opacity: 0.7 });
    // the hill above town (left), backlit + hazy
    const ridge = [[-30, 196], [40, 182], [110, 176], [180, 188], [260, 214], [340, 252], [430, 300], [520, 352], [610, 398], [700, 436], [790, 462], [880, 478], [960, 488]];
    sk.poly(farL, [[-30, 230], [120, 214], [260, 238], [420, 290], [600, 360], [760, 420], [960, 470], [960, 520], [-30, 520]], { fill: P.steel, stroke: P.slate, width: 1.6, seed: S(), double: false, wobble: 1.5, opacity: 0.6 });
    const hillPts = ridge.concat([[960, 520], [-30, 520]]);
    sk.poly(farL, hillPts, { fill: P.slate, stroke: P.storm, width: LINE.detail + 1, seed: S(), wobble: 1.6, step: 40 });
    const hillC = clipTo(farL, hillPts);
    sk.hatch(hillC, -30, 170, 990, 350, { gap: 13, angle: 64, stroke: P.storm, width: 1.6, opacity: 0.3, seed: S() });
    const hillY = (x) => {
      for (let i = 0; i < ridge.length - 1; i++) { const a = ridge[i], b = ridge[i + 1]; if (x <= b[0]) return a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0]); }
      return ridge[ridge.length - 1][1];
    };
    function fir(par, x, base, h, o) {
      o = o || {};
      const tg = el("g", { opacity: o.opacity !== undefined ? o.opacity : 1 }, par);
      const fill = o.fill || P.storm, stroke = o.stroke || P.night, wd = o.width || 2, w = h * (o.wide || 0.34);
      sk.line(tg, x, base, x, base - h * 0.2, { stroke, width: Math.max(1.5, h / 40), seed: S(), double: false });
      const tiers = o.tiers || 4;
      for (let i = 0; i < tiers; i++) {
        const tb = base - h * 0.1 - i * h * (0.68 / tiers);
        const tt = i === tiers - 1 ? base - h : tb - h * 0.42;
        const tw = w * (1 - i * (0.7 / tiers));
        sk.poly(tg, [[x - tw, tb], [x - tw * 0.45, tb - (tb - tt) * 0.35], [x, tt], [x + tw * 0.45, tb - (tb - tt) * 0.35], [x + tw, tb], [x + tw * 0.3, tb - h * 0.035], [x - tw * 0.3, tb - h * 0.035]], { fill, stroke, width: wd, seed: S(), wobble: Math.max(0.5, h / 110), double: h > 120 });
        if (o.rimLit) rim([[x + tw * 0.45, tb - (tb - tt) * 0.35], [x + tw, tb]], 1.6, 0.55, tg);
      }
      return tg;
    }
    // firs along the ridge and down the slope (silhouettes against the bright west)
    for (let i = 0; i < 40; i++) {
      const x = -20 + i * 24 + H(i + 300) * 8;
      if (x > 900) break;
      const by = hillY(x) + 10 + Math.abs(H(i + 50)) * 8, hh = 38 + Math.abs(H(i + 80)) * 30 - Math.max(0, x - 500) * 0.03;
      if (x > 70 && x < 230) continue; // the camp clearing on the summit
      fir(farL, x, by, hh, { fill: P.storm, stroke: P.night, width: 1.6, tiers: 3 });
    }
    for (let i = 0; i < 26; i++) {
      const x = -10 + i * 34 + H(i + 700) * 12, by = Math.max(hillY(x) + 60, 300 + i * 6) + Math.abs(H(i + 710)) * 40;
      if (by > 500) continue;
      fir(farL, x, by, 30 + Math.abs(H(i + 720)) * 22, { fill: P.storm, stroke: P.night, width: 1.4, tiers: 3, opacity: 0.85 });
    }
    // the hilltop camp: a speck of canopy + tents on the summit
    {
      const cg = el("g", { class: "tf-camp-speck", opacity: 0.85 }, farL);
      sk.poly(cg, [[96, 180], [120, 168], [146, 180]], { fill: P.fog, stroke: P.storm, width: 1.2, seed: S(), double: false, wobble: 0.3 });
      sk.line(cg, 100, 180, 100, 188, { stroke: P.storm, width: 1.2, seed: S(), double: false });
      sk.line(cg, 142, 180, 142, 188, { stroke: P.storm, width: 1.2, seed: S(), double: false });
      [[164, 189, 9], [182, 192, 7], [80, 188, 7]].forEach(([x, y, r]) => sk.poly(cg, [[x - r, y], [x, y - r * 0.9], [x + r, y]], { fill: P.mist, stroke: P.storm, width: 1.1, seed: S(), double: false, wobble: 0.2 }));
      sk.path(cg, [[132, 168], [134, 150], [130, 136], [136, 120]], { stroke: P.fog, width: 2, seed: S(), double: false, opacity: 0.6 }); // a thread of smoke
    }
    // haze over the far layers (backlit air)
    el("rect", { x: -40, y: 150, width: 1040, height: 380, fill: lgrad("hillHaze", [[0, EP5.lateSky, 0.05], [0.7, EP5.lateSky, 0.35], [1, EP5.lateSky, 0.55]]) }, farL);

    // ================================================================== WATER (receding sea far out) + setLevel
    el("rect", { x: -40, y: HOR - 1, width: 2000, height: 140, fill: lgrad("sea", [[0, P.steel], [0.5, P.mist], [1, EP5.mudWet]]) }, waterL);
    sk.line(waterL, 880, HOR, 1960, HOR, { stroke: P.slate, width: 2, seed: S(), wobble: 0.4, double: false, opacity: 0.8 });
    {
      const sw = [];
      for (let i = 0; i < 60; i++) { const y = HOR + 4 + Math.pow(rnd(i + 40), 1.3) * 40, x = 900 + rnd(i + 41) * 1040, l = 10 + (y - HOR) * 1.2; sw.push([x, y, x + l, y]); }
      lines(waterL, sw, { stroke: P.steel, width: 1.4, opacity: 0.45 });
    }
    const waterDyn = el("g", { class: "tf-water-edge" }, waterEdgeL); // above the flats so a rising tide covers them
    const edgeY = (x, L) => L + 7 * Math.sin(x * 0.0105 + 0.6) + 4 * Math.sin(x * 0.031) + (x < 980 ? (980 - x) * 0.03 : 0) - 14 * Math.exp(-Math.pow((x - 1365) / 70, 2));
    let curLevel = L0;
    function setLevel(y) {
      curLevel = y;
      while (waterDyn.firstChild) waterDyn.removeChild(waterDyn.firstChild);
      const top = [], edge = [];
      for (let x = 860; x <= 1960; x += 40) edge.push([x, edgeY(x, y)]);
      top.push([1960, HOR + 1], [860, HOR + 1]);
      // the wet shine band just inside the water's edge, then the edge itself
      el("path", { d: Dp(edge.concat([[1960, HOR + 1], [860, HOR + 1]]), true), fill: P.mist, opacity: 0.85 }, waterDyn);
      el("path", { d: Dp(edge.map((p) => [p[0], p[1] - 6]).concat([[1960, HOR + 1], [860, HOR + 1]]), true), fill: P.steel, opacity: 0.35 }, waterDyn);
      el("path", { d: Dp(edge, false), stroke: EP5.mudShine, "stroke-width": 3, fill: "none", opacity: 0.9, "stroke-linecap": "round" }, waterDyn);
      el("path", { d: Dp(edge.map((p) => [p[0] + 6, p[1] + 3]), false), stroke: P.slate, "stroke-width": 1.4, fill: "none", opacity: 0.55, "stroke-linecap": "round" }, waterDyn);
      // a second, thinner lace of foam a little out
      el("path", { d: Dp(edge.filter((_, i) => i % 2 === 0).map((p, i) => [p[0], p[1] - 9 - (i % 3) * 2]), false), stroke: P.fog, "stroke-width": 1.6, fill: "none", opacity: 0.6, "stroke-dasharray": "26 18" }, waterDyn);
    }
    setLevel(L0);

    // ================================================================== FLATS (shining mud where the streets were)
    const flatTop = [];
    for (let x = -40; x <= 1960; x += 40) flatTop.push([x, x < 860 ? 492 + (x < 0 ? 0 : 0) : edgeY(x, L0) + 2]);
    const flatPts = flatTop.concat([[1960, 1120], [-40, 1120]]);
    sk.poly(flatsL, flatPts, { fill: lgrad("mud", [[0, EP5.mudWet], [0.18, EP5.mudWet], [0.45, EP5.mud], [1, EP5.mud]]), stroke: "none", seed: S(), double: false, wobble: 1 });
    const flatsC = clipTo(flatsL, flatPts);
    // broad sky reflections on the far wet flats (the "shine"), denser toward the sun
    for (let i = 0; i < 120; i++) {
      const y = 500 + Math.pow(rnd(i + 500), 1.5) * 300, s = sc(y);
      const x = 560 + Math.pow(rnd(i + 501), 0.7) * 1400;
      const w = (60 + rnd(i + 502) * 220) * (0.5 + s), h = (3 + rnd(i + 503) * 6) * (0.6 + s);
      const pts = [[x - w / 2, y], [x - w * 0.3, y - h * 0.6], [x + w * 0.2, y - h * 0.7], [x + w / 2, y - h * 0.1], [x + w * 0.25, y + h * 0.5], [x - w * 0.25, y + h * 0.4]];
      sk.poly(flatsC, pts, { fill: x > 1300 ? EP5.mudShine : (i % 3 ? P.fog : EP5.mudShine), stroke: "none", seed: S(), wobble: 1, double: false, opacity: 0.45 + 0.4 * rnd(i + 504) - s * 0.25 });
    }
    // ripple marks: wavy short ridges parallel to the shore, spacing grows toward the viewer
    {
      const dark = [], lit = [];
      for (let y = 506, r = 0; y < 935; r++) {
        const s = sc(y);
        const n = Math.round(10 + 26 * (1 - s * 0.5));
        for (let k = 0; k < n; k++) {
          const id = r * 97 + k;
          const x = -20 + rnd(id) * 1960, l = (20 + rnd(id + 1) * 70) * (0.4 + s);
          if (y > 860 && x > 1100 && x < 1700) continue; // the soft mud zone is glossy, not rippled
          const yy = y + (rnd(id + 2) - 0.5) * 4 * s;
          const mid = [x + l / 2, yy - 2.2 * s - 0.5];
          dark.push([x, yy, mid[0], mid[1]], [mid[0], mid[1], x + l, yy + 0.6]);
          lit.push([x + 2, yy - 1.6 * s - 0.6, mid[0] + 2, mid[1] - 1.6 * s - 0.6]);
        }
        y += 4 + s * 14;
      }
      lines(flatsC, dark, { stroke: P.storm, width: 1.6, opacity: 0.3 });
      lines(flatsC, lit, { stroke: EP5.mudShine, width: 1.3, opacity: 0.3 });
    }
    // tidal channel: a shining runnel meandering from the right edge out to the water
    const chan = [[1960, 748], [1900, 736], [1850, 708], [1790, 696], [1730, 668], [1690, 642], [1620, 634], [1560, 606], [1530, 584], [1470, 570], [1440, 548], [1400, 536], [1388, 518], [1366, 500]];
    {
      const left = [], right = [];
      chan.forEach((p, i) => {
        const q = chan[Math.min(i + 1, chan.length - 1)], o = chan[Math.max(i - 1, 0)];
        const dx = q[0] - o[0], dy = q[1] - o[1], d = Math.hypot(dx, dy) || 1, w = 2 + sc(p[1]) * 17 * (0.75 + 0.5 * rnd(i + 880));
        left.push([p[0] - (dy / d) * w, p[1] + (dx / d) * w * 0.5]);
        right.push([p[0] + (dy / d) * w, p[1] - (dx / d) * w * 0.5]);
      });
      const cp = left.concat(right.reverse());
      sk.poly(flatsL, cp, { fill: P.slate, stroke: "none", seed: S(), wobble: 1, double: false, opacity: 0.5 });
      sk.poly(flatsL, cp.map((p, i) => [p[0], p[1] + (i < cp.length / 2 ? -2 : 2)]), { fill: EP5.mudShine, stroke: "none", seed: S(), wobble: 1, double: false, opacity: 0.8 });
      sk.path(flatsL, left, { stroke: P.storm, width: 2, seed: S(), double: false, opacity: 0.7 });
      sk.path(flatsL, right.slice().reverse(), { stroke: EP5.mud, width: 2, seed: S(), double: false, opacity: 0.7 });
      const cl = [];
      for (let i = 1; i < chan.length - 1; i++) { const p = chan[i], s = sc(p[1]); cl.push([p[0] - 18 * s, p[1] + 1, p[0] + 10 * s, p[1] - 1]); }
      lines(flatsL, cl, { stroke: P.mist, width: 1.6, opacity: 0.7 });
    }
    // little side runnels draining toward the channel
    [[[1160, 640], [1240, 628], [1330, 610], [1420, 572]], [[1260, 700], [1380, 690], [1500, 660], [1600, 630]], [[960, 590], [1060, 582], [1180, 566], [1300, 540], [1360, 512]]].forEach((pts) => {
      sk.path(flatsL, pts, { stroke: P.storm, width: 4, seed: S(), double: false, opacity: 0.35, step: 30 });
      sk.path(flatsL, pts.map((p) => [p[0], p[1] - 2]), { stroke: EP5.mudShine, width: 2, seed: S(), double: false, opacity: 0.6, step: 30 });
    });
    // firm mud bank: the edge where feet stand (a slightly raised, drier crust behind the soft zone)
    {
      const bank = [[-40, 852], [200, 848], [480, 855], [760, 850], [1000, 856], [1100, 858], [1300, 864], [1500, 862], [1700, 858], [1960, 852]];
      sk.path(flatsL, bank, { stroke: P.storm, width: 3, seed: S(), double: false, opacity: 0.45, step: 40 });
      sk.path(flatsL, bank.map((p) => [p[0], p[1] - 3]), { stroke: EP5.mudShine, width: 2, seed: S(), double: false, opacity: 0.35, step: 40 });
      // drier, crusted mud on the bank at left (fine crack net), wetter to the right
      const cr = [];
      for (let i = 0; i < 70; i++) {
        const x = -20 + rnd(i + 1200) * 1080, y = 800 + rnd(i + 1201) * 52;
        let px = x, py = y;
        for (let k = 0; k < 3; k++) { const a = rnd(i * 7 + k) * Math.PI * 2, l = 8 + rnd(i * 3 + k) * 14; const nx = px + Math.cos(a) * l, ny = py + Math.sin(a) * l * 0.35; cr.push([px, py, nx, ny]); px = nx; py = ny; }
      }
      lines(flatsL, cr, { stroke: P.storm, width: 1.4, opacity: 0.3 });
    }
    // the soft-mud zone: glossy wet patches with sky in them
    const MZ = { x0: 1100, x1: 1700, y0: 852, y1: 940 };
    {
      const zg = el("g", { class: "tf-mud-zone" }, flatsL);
      [[1400, 896, 330, 44, 0.22], [1300, 890, 210, 34, 0.25], [1520, 900, 200, 36, 0.25], [1240, 900, 120, 30, 0.22], [1620, 890, 110, 28, 0.22], [1420, 900, 150, 24, 0.2]].forEach(([x, y, rx, ry, op], i) =>
        sk.poly(zg, ellPts(x, y, rx, ry, 22, 0.12, 330 + i), { fill: EP5.mudWet, stroke: "none", seed: S(), wobble: 2, double: false, opacity: op }));
      [[1150, 905, 50, 5], [1290, 920, 70, 6], [1470, 900, 90, 6], [1600, 918, 60, 5], [1410, 872, 40, 4], [1560, 872, 46, 4], [1180, 868, 30, 3]].forEach(([x, y, rx, ry], i) => {
        sk.poly(zg, ellPts(x, y, rx, ry, 14, 0.18, 300 + i), { fill: i % 2 ? EP5.mudShine : P.fog, stroke: "none", seed: S(), wobble: 0.6, double: false, opacity: 0.55 });
        sk.path(zg, [[x - rx * 0.9, y + ry * 0.3], [x - rx * 0.2, y + ry], [x + rx * 0.8, y + ry * 0.4]], { stroke: P.storm, width: 1.6, seed: S(), double: false, opacity: 0.4 });
      });
      // sucking-mud texture: short curved gloss ticks
      const ticks = [];
      for (let i = 0; i < 46; i++) { const x = MZ.x0 + rnd(i + 1500) * (MZ.x1 - MZ.x0), y = 858 + rnd(i + 1501) * 72; ticks.push([x, y, x + 6 + rnd(i) * 10, y - 1.5]); }
      lines(zg, ticks, { stroke: EP5.mudShine, width: 1.6, opacity: 0.5 });
    }
    // worm casts, shell bits, pebbles and gull tracks over the near flats (detail for 3x)
    {
      const tg = el("g", { class: "tf-ground-bits" }, flatsL);
      for (let i = 0; i < 46; i++) { // worm casts: tiny coiled squiggles
        const x = 60 + rnd(i + 1700) * 1800, y = 760 + rnd(i + 1701) * 170, s = sc(y) * 0.8;
        if (x > 1080 && x < 1720 && y > 850) continue;
        const pts = []; for (let k = 0; k < 7; k++) pts.push([x + Math.cos(k * 1.7) * (2 + k) * s, y + Math.sin(k * 1.7) * (1 + k * 0.4) * s]);
        sk.path(tg, pts, { stroke: P.storm, width: 1.4, seed: S(), double: false, opacity: 0.55, wobble: 0.3, step: 4 });
      }
      for (let i = 0; i < 60; i++) { // shells + pebbles, lit on their right
        const x = rnd(i + 1800) * 1920, y = 730 + Math.pow(rnd(i + 1801), 0.8) * 200, s = sc(y);
        const r = (2 + rnd(i + 1802) * 4) * s;
        if (rnd(i + 1803) > 0.5) {
          sk.poly(tg, [[x - r * 1.3, y], [x - r * 0.4, y - r], [x + r * 0.6, y - r * 0.9], [x + r * 1.3, y]], { fill: i % 3 ? P.fog : P.paper, stroke: P.slate, width: 1, seed: S(), double: false, wobble: 0.2, opacity: 0.85 });
          lines(tg, [[x - r * 0.6, y - 0.5, x - r * 0.1, y - r * 0.8], [x + r * 0.2, y - 0.5, x + r * 0.2, y - r * 0.9]], { stroke: P.steel, width: 0.8, opacity: 0.7 });
        } else {
          el("ellipse", { cx: f1(x), cy: f1(y), rx: f1(r * 1.2), ry: f1(r * 0.7), fill: i % 2 ? P.steel : P.slate, stroke: P.storm, "stroke-width": 1, opacity: 0.85 }, tg);
          el("path", { d: `M${f1(x + r * 0.2)} ${f1(y - r * 0.55)} q ${f1(r * 0.6)} ${f1(r * 0.1)} ${f1(r * 0.9)} ${f1(r * 0.4)}`, stroke: EP5.mudShine, "stroke-width": 1, fill: "none", opacity: 0.8 }, tg);
        }
      }
      // gull tracks wandering toward the debris line
      const gt = [];
      for (let i = 0; i < 16; i++) {
        const x = 1460 + i * 22 + Math.sin(i * 0.9) * 10, y = 820 - i * 7 + (i % 2) * 6, s = sc(y) * 0.9;
        gt.push([x, y, x - 6 * s, y - 4 * s], [x, y, x - 7 * s, y + 1 * s], [x, y, x - 4 * s, y + 5 * s], [x, y, x + 3 * s, y]);
      }
      for (let i = 0; i < 10; i++) {
        const x = 470 + i * 26, y = 790 + Math.sin(i) * 8 + (i % 2) * 5, s = sc(y) * 0.9;
        gt.push([x, y, x - 6 * s, y - 4 * s], [x, y, x - 7 * s, y + 1 * s], [x, y, x - 4 * s, y + 5 * s], [x, y, x + 3 * s, y]);
      }
      lines(tg, gt, { stroke: P.storm, width: 1.3, opacity: 0.6 });
      // kelp strands and a lost sneaker on the near mud
      [[540, 884, 1], [1760, 896, -1], [880, 806, 1]].forEach(([x, y, d], i) => {
        const pts = []; for (let k = 0; k < 8; k++) pts.push([x + d * k * 12, y + Math.sin(k * 1.3 + i) * 4]);
        sk.path(tg, pts, { stroke: P.slate, width: 4, seed: S(), double: false, opacity: 0.8 });
        sk.path(tg, pts.map((p) => [p[0], p[1] - 2]), { stroke: P.steel, width: 1.4, seed: S(), double: false, opacity: 0.6 });
      });
      const shoe = el("g", { class: "tf-sneaker" }, tg);
      sk.path(shoe, [[620, 832], [624, 822], [640, 818], [652, 824], [668, 826], [672, 834]], { closed: true, fill: P.fog, stroke: P.slate, width: 2, seed: S(), double: false, wobble: 0.4 });
      sk.line(shoe, 620, 834, 672, 835, { stroke: P.storm, width: 2.4, seed: S(), double: false });
      lines(shoe, [[636, 822, 642, 828], [642, 820, 648, 826]], { stroke: P.slate, width: 1, opacity: 0.8 });
    }
    // old boot-print trails across the near mud (someone came out here before), ending at the soft zone
    function bootPrint(par, x, y, s, rot, o) {
      o = o || {};
      const bg = el("g", { transform: `translate(${f1(x)} ${f1(y)}) rotate(${rot || 0}) scale(${s.toFixed(3)} ${(s * 0.42).toFixed(3)})` }, par);
      sk.path(bg, [[-15, -5], [-6, -8], [6, -7], [15, -4], [16, 2], [8, 6], [-4, 6], [-8, 3], [-14, 4], [-17, 0]], { closed: true, fill: o.fill || EP5.mud, stroke: P.storm, width: 1.6 / s, seed: S(), double: false, wobble: 0.3, opacity: o.opacity || 0.75 });
      lines(bg, [[-12, -2, -12, 2], [-2, -4, -2, 3], [4, -4, 4, 3], [10, -3, 10, 2]], { stroke: P.storm, width: 1.4 / s, opacity: 0.6 });
      return bg;
    }
    for (let i = 0; i < 9; i++) bootPrint(flatsL, 360 + i * 44 + (i % 2) * 6, 896 - i * 1.6 + (i % 2) * 10, 1.25, -4);
    for (let i = 0; i < 5; i++) bootPrint(flatsL, 820 + i * 50, 884 + (i % 2) * 9, 1.3, -2, { fill: EP5.mudWet });

    // ================================================================== HOUSES (Gull Harbor clapboard, as townView/mainStreet)
    // Oblique box in local units (origin = front-left base corner on the mud, front wall faces the viewer and is in
    // the SHADE — the sun is right/behind; the right gable end is SUN-LIT). Everything below the silt is buried.
    // o: { s (px per local unit), w, h (wall above the silt), rise, ox, oy (depth vector), tilt, wall, roof, mudH
    //      (mud line as a fraction of h — ~0.92 = roof height), win, door, chimney, state: 'ok' | 'eaves', crush }
    const houses = [];
    function house(par, x, y, o) {
      const s = o.s, w = o.w || 80, h = o.h || 34, rise = o.rise || 26, ox = o.ox || 26, oy = o.oy || -11;
      const hg = el("g", { class: "tf-house", transform: `translate(${f1(x)} ${f1(y)}) rotate(${(o.tilt || 0).toFixed(2)} ${f1(w / 2 * s)} 0) scale(${s.toFixed(3)})` }, par);
      const lw = (px) => Math.max(0.9, px) / s;
      const st = o.stroke || P.storm, W = lw(o.lw || 2.6), Wd = lw(1.3);
      const wall = o.wall || P.fog, lit = o.lit || EP5.mudShine, roofC = o.roof || P.steel;
      const ridgeL = [ox / 2 - 3, -h - rise + oy / 2], ridgeR = [w + ox / 2 + 3, -h - rise + oy / 2];
      // right gable end (sun-lit)
      const gable = [[w, 0], [w, -h], [w + ox / 2, -h - rise + oy / 2], [w + ox, -h + oy], [w + ox, oy]];
      sk.poly(hg, gable, { fill: lit, stroke: st, width: W, seed: S(), wobble: 0.6, double: false });
      const gc = clipTo(hg, gable);
      const gl = [];
      for (let yy = -h - rise + 6; yy < oy; yy += 7) gl.push([w, yy + 2, w + ox, yy + oy + 2]);
      lines(gc, gl, { stroke: P.mist, width: Wd, opacity: 0.6 });
      // front wall (in shade)
      sk.rect(hg, 0, -h, w, h, { fill: wall, stroke: st, width: W, seed: S(), wobble: 0.6, double: s > 2 });
      const fc = clipTo(hg, [[0, 0], [0, -h], [w, -h], [w, 0]]);
      el("rect", { x: 0, y: -h, width: w, height: h, fill: P.slate, opacity: 0.16 }, fc);
      const sid = [];
      for (let yy = -h + 5; yy < -1; yy += 5) sid.push([1, yy, w - 1, yy + 0.3]);
      lines(fc, sid, { stroke: st, width: Wd, opacity: 0.28 });
      // windows (sills just above the silt) + the top of a buried door
      const nw = o.win === undefined ? 2 : o.win;
      for (let i = 0; i < nw; i++) {
        const wx = w * (0.12 + i * (0.62 / Math.max(1, nw - 1 || 1))) + (nw === 1 ? w * 0.18 : 0), wy = -h * 0.78, ww = w * 0.16, wh = h * 0.42;
        sk.rect(hg, wx, wy, ww, wh, { fill: (i + nw) % 2 ? P.night : P.storm, stroke: st, width: Wd * 1.3, seed: S(), double: false, wobble: 0.4 });
        sk.rect(hg, wx - 1.5, wy - 1.5, ww + 3, wh + 3, { fill: "none", stroke: P.paper, width: Wd, seed: S(), double: false, wobble: 0.3, opacity: 0.7 });
        lines(hg, [[wx + ww / 2, wy, wx + ww / 2, wy + wh], [wx, wy + wh / 2, wx + ww, wy + wh / 2]], { stroke: P.mist, width: Wd, opacity: 0.6 });
        if ((i + (o.seed || 0)) % 2 === 0) sk.path(hg, [[wx + ww * 0.15, wy + wh * 0.2], [wx + ww * 0.55, wy + wh * 0.55], [wx + ww * 0.35, wy + wh * 0.95]], { stroke: P.paper, width: Wd, seed: S(), double: false, opacity: 0.6 });
      }
      if (o.door !== false) sk.rect(hg, w * (o.doorX || 0.68), -h * 0.5, w * 0.11, h * 0.5, { fill: P.storm, stroke: st, width: Wd * 1.2, seed: S(), double: false, wobble: 0.4 });
      // mud stain to roof height: a dark wash with a crisp line + drips
      const mh = h * (o.mudH || 0.9);
      el("path", { d: Dp([[0, 0], [0, -mh], [w, -mh + 0.8], [w, 0]], true), fill: EP5.mud, opacity: 0.42 }, fc);
      el("path", { d: Dp([[w, 0], [w, -mh], [w + ox, -mh + oy], [w + ox, oy]], true), fill: EP5.mud, opacity: 0.36 }, gc);
      sk.path(hg, [[0, -mh], [w, -mh + 0.8], [w + ox, -mh + oy + 0.8]], { stroke: P.storm, width: lw(2.2), seed: S(), double: false, opacity: 0.85, wobble: 0.4 });
      const dr = [];
      for (let i = 0; i < 10; i++) { const dx = rnd((o.seed || 0) * 13 + i) * w; dr.push([dx, -mh + 1, dx + 0.4, -mh + 3 + rnd(i + 7) * h * 0.18]); }
      lines(hg, dr, { stroke: P.storm, width: Wd, opacity: 0.45 });
      // roof: front plane (eave side), then the gable's rake trim
      const roof = [[-4, -h + 1], [w + 4, -h + 1], ridgeR, ridgeL];
      sk.poly(hg, roof, { fill: roofC, stroke: st, width: W, seed: S(), wobble: 0.6 });
      const rc = clipTo(hg, roof);
      const sh = [];
      for (let k = 1; k < 7; k++) { const t = k / 7, y0 = -h + 1 + (ridgeL[1] + h - 1) * t; sh.push([-4 + ox / 2 * t, y0, w + 4 + (ox / 2 - 7) * t, y0]); }
      lines(rc, sh, { stroke: st, width: Wd, opacity: 0.4 });
      sk.hatch(rc, -6, ridgeL[1] - 2, w + ox, rise + 6, { gap: 4.5 / Math.max(0.6, s / 2), angle: -30, stroke: st, width: Wd, opacity: 0.22, seed: S() });
      sk.path(hg, [[w + 4, -h + 1], ridgeR, [w + ox + 4, -h + oy + 1]], { stroke: st, width: W, seed: S(), double: false, wobble: 0.4 });
      if (o.chimney) {
        const cx = w * 0.25 + ox * 0.25, cy = -h - rise * 0.5 + oy * 0.25;
        sk.rect(hg, cx, cy - 16, 8, 18, { fill: P.slate, stroke: st, width: Wd * 1.3, seed: S(), double: false });
        sk.rect(hg, cx - 1, cy - 18, 10, 3, { fill: P.steel, stroke: st, width: Wd, seed: S(), double: false });
      }
      if (o.hole) sk.poly(hg, [[w * 0.55, -h - rise * 0.15], [w * 0.72, -h - rise * 0.2], [w * 0.7 + ox * 0.3, -h - rise * 0.75 + oy * 0.3], [w * 0.56 + ox * 0.25, -h - rise * 0.6 + oy * 0.25]], { fill: P.night, stroke: st, width: Wd, seed: S(), double: false });
      // debris caught along the roof at the high-water line
      const wr = [];
      for (let i = 0; i < 12; i++) { const px = rnd((o.seed || 0) + i * 5) * w, a = (rnd(i + 3) - 0.5) * 1.2, l = 3 + rnd(i * 2) * 6; wr.push([px, -h + 2, px + Math.cos(a) * l, -h + 2 + Math.sin(a) * l]); }
      lines(hg, wr, { stroke: P.storm, width: lw(1.6), opacity: 0.8 });
      // silt heaped against the base (buries the bottom of the walls)
      sk.poly(hg, [[-3, 1.2], [-3, -2], [w * 0.15, -4], [w * 0.4, -2.5], [w * 0.62, -5], [w * 0.85, -3], [w + 2, -4], [w + ox * 0.5, oy * 0.5 - 4], [w + ox + 3, oy - 1], [w + ox + 3, oy + 1.2], [w + 1, 1.2]], { fill: EP5.mudWet, stroke: P.storm, width: Wd * 1.4, seed: S(), double: false, wobble: 0.5, opacity: 0.95 });
      sk.path(hg, [[w * 0.62, -4.6], [w * 0.85, -2.6], [w + 2, -3.6], [w + ox * 0.5, oy * 0.5 - 3.6]], { stroke: EP5.mudShine, width: Wd, seed: S(), double: false, opacity: 0.6 });
      // sun rim on the gable's sunward edges (lightG), in screen space
      const toScr = (p) => { const r = rotPt([p[0] * s, p[1] * s], (w / 2) * s, 0, o.tilt || 0); return [x + r[0], y + r[1]]; };
      const hrG = el("g", { class: "tf-house-rim" }, par);
      rim([toScr([w + ox / 2, -h - rise + oy / 2]), toScr([w + ox + 3, -h + oy + 1])], Math.max(1.4, 2.2 * Math.min(1, s / 3)), 0.85, hrG);
      rim([toScr([w + ox, -h + oy]), toScr([w + ox, oy])], Math.max(1.2, 2 * Math.min(1, s / 3)), 0.7, hrG);
      // its long shadow to the left
      const base = [toScr([0, 0]), toScr([w, 0]), toScr([w + ox, oy]), toScr([ox, oy])];
      const tops = [[0, 0, h], [w, 0, h], [w + ox, oy, h], [ox, oy, h], [ox / 2, oy / 2, h + rise], [w + ox / 2, oy / 2, h + rise]].map(([lx, ly, hh]) => { const b = toScr([lx, ly]); return [b[0], b[1], hh * s]; });
      castShadow(base, tops, { opacity: 0.36 });
      const rec = { g: hg, x, y, w: w * s, eaveY: y - h * s, ridgeY: y + (-h - rise + oy / 2) * s };
      houses.push(rec);
      return rec;
    }
    // back row along the old shore (left/centre, far): Gull Harbor's waterfront lane
    const backRow = [
      [700, 497, 2.0, { tilt: -3, roof: P.slate, chimney: true }], [812, 500, 1.9, { tilt: 4, wall: P.paper, mudH: 0.95, win: 2, hole: true }],
      [915, 504, 1.7, { tilt: 9, roof: P.slate, mudH: 0.98, win: 1 }], [1005, 503, 1.5, { tilt: -6, wall: P.mist, chimney: true }],
      [612, 502, 2.1, { tilt: 2, wall: P.paper, roof: P.steel }],
    ];
    backRow.forEach(([x, y, s, o], i) => house(townL, x, y, Object.assign({ s, w: 64, h: 30, rise: 22, ox: 22, oy: -9, seed: i * 3 + 1, lw: 2 }, o)));
    // power pole leaning at the end of the lane, a wire looping down to the mud
    {
      const pg = el("g", { class: "tf-pole" }, townL);
      const bx = 1090, by = 512, top = rotPt([bx, by - 150], bx, by, -11);
      sk.line(pg, bx, by, top[0], top[1], { stroke: P.storm, width: 5, seed: S(), double: false });
      const ca = rotPt([bx, by - 136], bx, by, -11), a = rotPt([ca[0] - 26, ca[1]], ca[0], ca[1], -11), b = rotPt([ca[0] + 26, ca[1]], ca[0], ca[1], -11);
      sk.line(pg, a[0], a[1], b[0], b[1], { stroke: P.storm, width: 3.5, seed: S(), double: false });
      sk.path(pg, [b, [b[0] + 30, b[1] + 50], [b[0] + 44, b[1] + 100], [b[0] + 52, by + 6]], { stroke: P.storm, width: 1.6, seed: S(), double: false, opacity: 0.85 });
      sk.path(pg, [a, [a[0] - 60, a[1] + 34], [a[0] - 130, a[1] + 40]], { stroke: P.storm, width: 1.6, seed: S(), double: false, opacity: 0.8 });
      rim([[top[0] + 2, top[1]], [bx + 2, by]], 1.6, 0.8, pg);
      poleShadow(bx, by, 150, 5, { opacity: 0.35 });
    }
    // a house carried out onto the flats (right of centre): off its foundation, tilted, mud to the eaves
    house(townL, 1128, 527, { s: 2.05, w: 70, h: 30, rise: 24, ox: 24, oy: -10, tilt: 7, wall: P.paper, roof: P.slate, mudH: 0.97, win: 2, chimney: true, seed: 21, stroke: P.slate, lw: 2.4 });
    // its empty foundation slab nearer the shore
    sk.poly(townL, [[880, 548], [1020, 545], [1020, 552], [880, 555]], { fill: P.steel, stroke: P.slate, width: 2, seed: S(), double: false, wobble: 0.4 });
    sk.poly(townL, [[1020, 545], [1050, 534], [1050, 541], [1020, 552]], { fill: P.slate, stroke: P.slate, width: 2, seed: S(), double: false, wobble: 0.4 });
    sk.poly(townL, [[880, 548], [1020, 545], [1050, 534], [912, 537]], { fill: P.mist, stroke: P.slate, width: 2, seed: S(), double: false, wobble: 0.6 });
    lines(townL, [[892, 545, 1036, 538], [930, 546, 950, 536]], { stroke: P.slate, width: 1.4, opacity: 0.6 });
    [[896, 548], [1012, 546]].forEach(([x, y]) => sk.line(townL, x, y, x + 1, y - 10, { stroke: P.slate, width: 2, seed: S(), double: false }));

    // old pier pilings out on the flats (far row + a mid group), barnacled, gull on one
    const pilings = [];
    function piling(par, x, y, h, w, o) {
      o = o || {};
      const pg = el("g", { class: "tf-piling" }, par);
      const lean = o.lean || 0, tx = x + lean;
      sk.poly(pg, [[x - w / 2, y + 2], [tx - w * 0.45, y - h], [tx + w * 0.45, y - h - 2], [x + w / 2, y + 2]], { fill: P.slate, stroke: o.stroke || INK, width: Math.max(1.4, Math.min(LINE.main, w / 8)), seed: S(), wobble: 0.6, double: w > 20 });
      sk.circle(pg, tx, y - h, w * 0.45, { fill: P.steel, stroke: o.stroke || INK, width: Math.max(1, w / 14), seed: S(), double: false, wobble: 0.3 });
      if (w > 14) {
        const gr = [];
        for (let k = 0; k < 5; k++) { const gx = x - w * 0.3 + (k / 4) * w * 0.6; gr.push([gx, y - h * 0.15, gx + lean * 0.7, y - h * 0.85]); }
        lines(pg, gr, { stroke: P.storm, width: Math.max(1, w / 18), opacity: 0.6 });
        // barnacle band on the lower third, weed strands
        const bn = el("g", {}, pg);
        for (let k = 0; k < Math.round(w * 0.9); k++) {
          const bx = x - w * 0.45 + rnd(k + x) * w * 0.9, byy = y - rnd(k * 3 + x) * h * 0.32, r = 1 + rnd(k * 5 + x) * w * 0.05;
          el("circle", { cx: f1(bx), cy: f1(byy), r: f1(r), fill: P.fog, stroke: P.storm, "stroke-width": Math.max(0.8, r * 0.35), opacity: 0.85 }, bn);
          if (r > 2) el("circle", { cx: f1(bx), cy: f1(byy), r: f1(r * 0.35), fill: P.storm }, bn);
        }
        sk.path(pg, [[x - w / 2, y - h * 0.34], [x, y - h * 0.31], [x + w / 2, y - h * 0.35]], { stroke: P.storm, width: Math.max(1.2, w / 14), seed: S(), double: false, opacity: 0.7 });
        if (o.rope) {
          sk.path(pg, [[x - w / 2 - 2, y - h * 0.55], [x, y - h * 0.5], [x + w / 2 + 2, y - h * 0.56]], { stroke: P.mist, width: Math.max(2, w / 9), seed: S(), double: false });
          sk.path(pg, [[x + w / 2, y - h * 0.55], [x + w * 0.8, y - h * 0.38], [x + w * 0.7, y - h * 0.2], [x + w * 0.95, y - 2]], { stroke: P.mist, width: Math.max(1.6, w / 12), seed: S(), double: false });
        }
      }
      rim([[tx + w * 0.42, y - h + 2], [x + w * 0.46, y]], Math.max(1.2, Math.min(3, w / 10)), 0.9, pg);
      poleShadow(x, y, h, w * 0.9, { opacity: 0.38 });
      const rec = { g: pg, x, y, topY: y - h };
      pilings.push(rec);
      return rec;
    }
    [[1500, 512, 26, 6], [1532, 514, 22, 6], [1566, 513, 30, 6], [1610, 516, 18, 5], [1648, 515, 26, 6], [1700, 518, 24, 6], [1752, 517, 28, 6]].forEach(([x, y, h, w]) => piling(townL, x, y, h, w, { stroke: P.storm }));
    piling(townL, 1586, 516, 6, 22, { stroke: P.storm }); pilings.pop(); // a cross-beam stub (not a handle)
    [[1618, 618, 70, 13, 2], [1676, 628, 96, 15, -3], [1738, 622, 58, 12, 4], [1790, 640, 84, 15, 0]].forEach(([x, y, h, w, l], i) => piling(midL, x, y, h, w, { lean: l, rope: i === 1 }));

    // ================================================================== THE BOAT HOUSE (left) + the SEA LARK on its roof
    const BH = { x: 70, y: 630, s: 5.7, w: 80, h: 29, rise: 19, ox: 19, oy: -7 };
    const bhRec = house(townL, BH.x, BH.y, { s: BH.s, w: BH.w, h: BH.h, rise: BH.rise, ox: BH.ox, oy: BH.oy, tilt: -2, wall: P.fog, roof: P.slate, mudH: 0.93, win: 3, doorX: 0.615, seed: 51, lw: LINE.main, chimney: false });
    // (house(): 80×5.7 = 456 px wide; eave y ≈ 465, ridge y ≈ 334 — the boat straddles the ridge)
    // crushed roof under the keel: a ragged break along the ridge, snapped rafter ends, cracks, slipped shingles
    {
      const cg = el("g", { class: "tf-crush" }, townL);
      const brk = [[150, 344]];
      for (let k = 1; k < 18; k++) brk.push([150 + k * 22, 346 + (k % 2 ? 12 + rnd(k + 70) * 10 : 2 + rnd(k + 71) * 5)]);
      brk.push([546, 344]);
      sk.poly(cg, brk.concat([[546, 338], [150, 338]]), { fill: P.night, stroke: INK, width: LINE.detail, seed: S(), wobble: 0.8 });
      [[196, 356, 186, 334, -1], [268, 360, 278, 336, 1], [342, 362, 334, 338, -1], [420, 358, 432, 336, 1], [500, 352, 492, 334, -1]].forEach(([x1, y1, x2, y2]) => {
        sk.line(cg, x1, y1, x2, y2, { stroke: INK, width: 6, seed: S(), double: false });
        sk.line(cg, x1, y1, x2, y2, { stroke: P.mist, width: 2.6, seed: S(), double: false });
        sk.path(cg, [[x2 - 3, y2 + 2], [x2, y2 - 3], [x2 + 3, y2 + 1]], { stroke: INK, width: 1.4, seed: S(), double: false }); // splinters
      });
      [[230, 362, 200, 420], [380, 364, 404, 438], [470, 356, 500, 404]].forEach(([x1, y1, x2, y2]) =>
        sk.path(cg, [[x1, y1], [(x1 + x2) / 2 + 6, (y1 + y2) / 2], [x2, y2]], { stroke: P.night, width: 2.2, seed: S(), double: false, opacity: 0.9 }));
      for (let i = 0; i < 9; i++) { // slipped shingles sliding down the front plane
        const x = 150 + i * 42 + rnd(i + 60) * 16, y = 392 + rnd(i + 61) * 56;
        sk.poly(cg, [[x, y], [x + 18, y - 3], [x + 20, y + 5], [x + 2, y + 8]], { fill: i % 2 ? P.steel : P.mist, stroke: P.storm, width: 1.6, seed: S(), double: false, wobble: 0.3 });
      }
      // search-team spray mark on the front wall (Day 2 sweep)
      const sm = el("g", { opacity: 0.85 }, cg);
      sk.line(sm, 330, 478, 380, 528, { stroke: P.night, width: 4, seed: S(), double: false });
      sk.line(sm, 380, 478, 330, 528, { stroke: P.night, width: 4, seed: S(), double: false });
      txt(sm, 355, 494, "9/2", { size: 13, font: FONT_HAND, fill: P.night });
      txt(sm, 318, 508, "CR", { size: 12, font: FONT_HAND, fill: P.night });
      txt(sm, 392, 508, "0", { size: 13, font: FONT_HAND, fill: P.night });
      // a hanging gutter
      sk.path(cg, [[480, 468], [520, 474], [560, 520], [566, 560]], { stroke: P.steel, width: 5, seed: S(), double: false });
      sk.path(cg, [[480, 468], [520, 474], [560, 520], [566, 560]], { stroke: INK, width: 1.4, seed: S(), double: false, opacity: 0.7 });
    }
    // the boat (drawn level in local screen coords, then listed -4° about the keel centre)
    const BOAT = { cx: 356, cy: 340, rot: -4 };
    const boatG = el("g", { class: "tf-boat", transform: `rotate(${BOAT.rot} ${BOAT.cx} ${BOAT.cy})` }, townL);
    {
      const bg = boatG;
      // outrigger poles + rigging behind the hull
      sk.line(bg, 392, 250, 150, 92, { stroke: P.storm, width: 6, seed: S(), double: false });
      sk.line(bg, 404, 250, 664, 104, { stroke: P.storm, width: 6, seed: S(), double: false });
      sk.line(bg, 392, 250, 150, 92, { stroke: INK, width: 1.6, seed: S(), double: false, opacity: 0.7 });
      sk.line(bg, 404, 250, 664, 104, { stroke: INK, width: 1.6, seed: S(), double: false, opacity: 0.7 });
      [[150, 92], [664, 104]].forEach(([x, y]) => {
        sk.path(bg, [[398, 74], [x, y]], { stroke: P.storm, width: 1.6, seed: S(), double: false, opacity: 0.85, wobble: 0.4 });
        sk.path(bg, [[x, y], [x + (x < 400 ? 4 : -6), y + 70], [x + (x < 400 ? 2 : -4), y + 92]], { stroke: P.storm, width: 1.4, seed: S(), double: false, opacity: 0.8 }); // trolling line
        sk.poly(bg, [[x - 4, y + 92], [x + 4, y + 92], [x, y + 104]], { fill: P.steel, stroke: P.storm, width: 1.2, seed: S(), double: false }); // lead
      });
      // mast + crosstree + light
      sk.poly(bg, [[394, 292], [396, 70], [404, 70], [406, 292]], { fill: P.steel, stroke: INK, width: LINE.detail, seed: S(), double: false, wobble: 0.3 });
      sk.line(bg, 376, 120, 424, 120, { stroke: INK, width: 3, seed: S(), double: false });
      sk.circle(bg, 400, 66, 5, { fill: P.paper, stroke: INK, width: 1.6, seed: S(), double: false });
      sk.path(bg, [[400, 120], [300, 280]], { stroke: P.storm, width: 1.4, seed: S(), double: false, opacity: 0.8 });
      sk.path(bg, [[400, 120], [600, 282]], { stroke: P.storm, width: 1.4, seed: S(), double: false, opacity: 0.8 });
      // hull
      const hullPts = [[72, 254], [84, 276], [100, 302], [130, 330], [180, 346], [300, 354], [460, 352], [560, 346], [618, 334], [640, 316], [644, 288], [560, 290], [420, 292], [300, 292], [180, 284], [120, 272]];
      sk.poly(bg, hullPts, { fill: P.paper, stroke: INK, width: LINE.main, seed: S(), wobble: 0.8 });
      const hc = clipTo(bg, hullPts);
      el("rect", { x: 60, y: 240, width: 600, height: 130, fill: P.slate, opacity: 0.14 }, hc); // hull side is in shade
      sk.path(hc, [[80, 304], [200, 322], [400, 326], [560, 322], [650, 312], [650, 380], [60, 380]], { closed: true, fill: P.slate, stroke: "none", seed: S(), double: false }); // bottom paint
      sk.path(hc, [[80, 300], [200, 318], [400, 322], [560, 318], [650, 308]], { stroke: P.steel, width: 6, seed: S(), double: false }); // boot stripe
      const pl = [];
      for (let k = 0; k < 4; k++) pl.push([100 + k * 6, 282 + k * 8, 640, 296 + k * 8]);
      lines(hc, pl, { stroke: P.mist, width: 1.4, opacity: 0.6 }); // planking
      sk.hatch(hc, 60, 320, 600, 50, { gap: 7, angle: 30, stroke: INK, width: 1.4, opacity: 0.25, seed: S() });
      // scrapes + a stove-in plank where it came down on the ridge
      sk.poly(bg, [[300, 336], [352, 330], [372, 344], [320, 350]], { fill: P.night, stroke: INK, width: 1.8, seed: S(), double: false });
      lines(bg, [[180, 300, 260, 306], [460, 304, 540, 300], [500, 310, 560, 306]], { stroke: P.steel, width: 1.6, opacity: 0.8 });
      // rub rail + bulwark top
      sk.path(bg, [[72, 254], [120, 270], [180, 282], [300, 290], [420, 290], [560, 288], [644, 286]], { stroke: INK, width: 5, seed: S(), double: false });
      sk.path(bg, [[76, 252], [180, 278], [300, 286], [560, 284], [642, 282]], { stroke: EP5.mudShine, width: 2, seed: S(), double: false, opacity: 0.9 });
      // scuppers
      [180, 260, 340, 500, 580].forEach((x) => sk.rect(bg, x, 294, 12, 5, { fill: P.storm, stroke: INK, width: 1.2, seed: S(), double: false }));
      // name + port
      txt(bg, 168, 312, "SEA LARK", { size: 22, fill: P.storm, len: 92, ls: 2, rot: 4 });
      txt(bg, 590, 312, "GULL HBR WA", { size: 12, fill: P.storm, len: 66 });
      // rust weep (rust is in the light kit; low and dull)
      lines(bg, [[230, 296, 232, 322], [236, 296, 237, 314], [520, 294, 522, 316]], { stroke: EP5.rust, width: 2, opacity: 0.6 });
      // fenders + a buoy hanging over the side
      [[250, 300], [470, 300]].forEach(([x, y]) => {
        sk.line(bg, x, 288, x, y, { stroke: P.storm, width: 1.6, seed: S(), double: false });
        sk.path(bg, ellPts(x, y + 14, 7, 14, 12), { closed: true, fill: P.fog, stroke: INK, width: 2, seed: S(), double: false, wobble: 0.3 });
      });
      // deck clutter behind the bulwark: crab pot, coiled line, the gurdy
      sk.rect(bg, 150, 252, 60, 32, { fill: P.mist, stroke: INK, width: 2, seed: S(), double: false });
      lines(bg, [[160, 254, 160, 282], [172, 254, 172, 282], [184, 254, 184, 282], [196, 254, 196, 282], [152, 266, 208, 266]], { stroke: P.storm, width: 1.2, opacity: 0.8 });
      sk.path(bg, ellPts(250, 280, 26, 8, 14), { closed: true, fill: P.fog, stroke: P.storm, width: 2, seed: S(), double: false });
      sk.path(bg, ellPts(250, 279, 16, 5, 12), { closed: true, fill: "none", stroke: P.storm, width: 1.4, seed: S(), double: false });
      sk.rect(bg, 330, 262, 22, 26, { fill: P.steel, stroke: INK, width: 2, seed: S(), double: false });
      sk.circle(bg, 341, 262, 9, { fill: P.slate, stroke: INK, width: 1.8, seed: S(), double: false });
      // wheelhouse (aft): front windows angled, side windows, open aft door, life ring
      const wh = el("g", { class: "tf-wheelhouse" }, bg);
      sk.poly(wh, [[436, 292], [444, 202], [556, 200], [556, 292]], { fill: P.fog, stroke: INK, width: LINE.main, seed: S(), wobble: 0.6 });
      const whc = clipTo(wh, [[436, 292], [444, 202], [556, 200], [556, 292]]);
      el("rect", { x: 430, y: 196, width: 130, height: 100, fill: P.slate, opacity: 0.12 }, whc);
      lines(whc, [[436, 250, 556, 250], [436, 262, 556, 262], [436, 274, 556, 274]], { stroke: P.steel, width: 1.4, opacity: 0.5 });
      sk.poly(wh, [[428, 202], [432, 188], [566, 186], [568, 200]], { fill: P.steel, stroke: INK, width: 3, seed: S(), wobble: 0.4 });
      sk.poly(wh, [[448, 212], [452, 242], [478, 242], [478, 212]], { fill: P.storm, stroke: INK, width: 2, seed: S(), double: false });
      sk.rect(wh, 484, 212, 26, 30, { fill: P.night, stroke: INK, width: 2, seed: S(), double: false });
      sk.path(wh, [[452, 216], [470, 236]], { stroke: P.mist, width: 1.6, seed: S(), double: false, opacity: 0.7 });
      sk.path(wh, [[490, 218], [498, 230], [494, 238]], { stroke: P.mist, width: 1.4, seed: S(), double: false, opacity: 0.6 }); // cracked pane
      // the open door (dark doorway) and the door swung back against the aft wall
      sk.rect(wh, 516, 210, 30, 80, { fill: P.night, stroke: INK, width: 2.6, seed: S(), double: false });
      sk.poly(wh, [[546, 210], [570, 216], [570, 292], [546, 290]], { fill: P.mist, stroke: INK, width: 2.4, seed: S(), double: false });
      sk.rect(wh, 552, 222, 12, 18, { fill: P.storm, stroke: INK, width: 1.4, seed: S(), double: false });
      sk.circle(wh, 551, 254, 2.4, { fill: P.steel, stroke: INK, width: 1, seed: S(), double: false });
      // inside the doorway: the wheel, a lanyard hanging on a hook (the whistle's spot)
      sk.circle(wh, 526, 252, 7, { fill: "none", stroke: P.steel, width: 2, seed: S(), double: false });
      sk.path(wh, [[538, 220], [536, 236], [540, 244]], { stroke: P.fog, width: 1.4, seed: S(), double: false, opacity: 0.8 });
      // life ring on the side
      sk.circle(wh, 462, 268, 13, { fill: P.paper, stroke: INK, width: 2.4, seed: S(), double: false });
      sk.circle(wh, 462, 268, 6, { fill: P.slate, stroke: INK, width: 1.6, seed: S(), double: false });
      [[0, -13, 0, -6], [13, 0, 6, 0], [0, 13, 0, 6], [-13, 0, -6, 0]].forEach(([a, b, c, d]) => sk.line(wh, 462 + a, 268 + b, 462 + c, 268 + d, { stroke: P.storm, width: 4, seed: S(), double: false }));
      // roof gear: radar dome, whip antenna, searchlight
      sk.path(wh, ellPts(486, 180, 18, 8, 14), { closed: true, fill: P.paper, stroke: INK, width: 2, seed: S(), double: false });
      sk.line(wh, 536, 186, 548, 98, { stroke: INK, width: 2, seed: S(), double: false });
      sk.rect(wh, 448, 174, 14, 12, { fill: P.steel, stroke: INK, width: 1.8, seed: S(), double: false });
      // stern rail + the rope-ladder lashing
      sk.path(bg, [[562, 288], [566, 268], [640, 268], [644, 286]], { stroke: INK, width: 3, seed: S(), double: false });
      [586, 612].forEach((x) => sk.line(bg, x, 268, x, 288, { stroke: INK, width: 2, seed: S(), double: false }));
      // sun rim on the stern + wheelhouse aft edge (screen space → rotate the points)
      const R = (p) => rotPt(p, BOAT.cx, BOAT.cy, BOAT.rot);
      rim([[644, 288], [640, 316], [618, 334]], 3, 0.95, bg);
      rim([[570, 216], [570, 292]], 2.4, 0.9, bg);
      rim([[566, 186], [568, 200]], 2, 0.8, bg);
      rim([[664, 104], [404, 250]], 1.8, 0.6, bg);
      rim([[406, 72], [406, 290]], 1.6, 0.7, bg);
    }
    const Rb = (p) => rotPt(p, BOAT.cx, BOAT.cy, BOAT.rot);
    const doorFoot = Rb([531, 290]), railPt = Rb([626, 268]);
    // the boat house + boat throw one long shadow off to the left (off frame)
    castShadow([[70, 632], [526, 616], [636, 592], [180, 600]], [[70, 632, 170], [526, 616, 170], [636, 592, 150], [140, 630, 300], [400, 630, 390], [620, 610, 340]], { opacity: 0.4 });

    // the debris pile against the right gable, up to the roof edge: a mud-caked jumble of the town's insides
    const pileG = el("g", { class: "tf-pile" }, midL);
    const pilePts = [[536, 652], [548, 590], [572, 546], [606, 508], [640, 486], [668, 476], [700, 488], [732, 520], [770, 566], [812, 612], [860, 660], [918, 712], [840, 724], [720, 720], [610, 706]];
    castShadow([[536, 700], [918, 712], [720, 722]], [[668, 700, 220], [770, 708, 140], [860, 712, 50]], { opacity: 0.4 });
    sk.poly(pileG, pilePts, { fill: EP5.mud, stroke: INK, width: LINE.main, seed: S(), wobble: 1.4, step: 30 });
    {
      sk.hatch(clipTo(pileG, pilePts), 520, 460, 420, 280, { gap: 8, angle: 40, stroke: P.night, width: 1.6, opacity: 0.4, seed: S() });
      const pc = clipTo(pileG, pilePts.map((p) => [p[0] + (p[0] > 660 ? 30 : -30), p[1] - 30]).concat([[940, 740], [520, 740]]));
      const LITC = [P.steel, P.mist, P.fog, EP5.mudWet, P.paper, P.steel, P.mist];
      const piece = (i) => {
        const t = i / 36, r0 = rnd(i + 5100), r1 = rnd(i + 5101), r2 = rnd(i + 5102);
        const cx = 628 + t * 180 + (r0 - 0.5) * (50 + t * 300), cy = 490 + t * 214 + (r1 - 0.5) * 26;
        const kind = i % 7, a = (r2 - 0.5) * 110, fill = LITC[i % LITC.length];
        const R = (pts) => pts.map((q) => rotPt([cx + q[0], cy + q[1]], cx, cy, a));
        if (kind === 3) { // siding panel
          const pts = R([[-46, -16], [46, -16], [46, 16], [-46, 16]]);
          sk.poly(pc, pts, { fill: P.fog, stroke: INK, width: 2.2, seed: S(), double: false, wobble: 0.5 });
          const sl = []; for (let k = -10; k < 16; k += 7) { const u = R([[-44, k], [44, k]]); sl.push([u[0][0], u[0][1], u[1][0], u[1][1]]); }
          lines(pc, sl, { stroke: P.steel, width: 1.4, opacity: 0.8 });
          rim([pts[1], pts[2]], 2, 0.8, pc);
        } else if (kind === 5) { // branch with twigs
          const b0 = R([[-60, 0], [-20, -4], [20, 2], [62, -6]]);
          sk.path(pc, b0, { stroke: P.storm, width: 5, seed: S(), double: false });
          for (let k = 0; k < 3; k++) { const q = b0[k + 1]; sk.path(pc, [q, [q[0] + 10 - k * 8, q[1] - 16], [q[0] + 16 - k * 6, q[1] - 22]], { stroke: P.storm, width: 2.2, seed: S(), double: false }); }
        } else if (kind === 6 && i < 22) { // broken window frame
          const pts = R([[-24, -18], [24, -18], [24, 18], [-24, 18]]);
          sk.poly(pc, pts, { fill: P.night, stroke: P.paper, width: 4, seed: S(), double: false, wobble: 0.4 });
          const c = R([[0, -18], [0, 18], [-24, 0], [24, 0]]);
          lines(pc, [[c[0][0], c[0][1], c[1][0], c[1][1]], [c[2][0], c[2][1], c[3][0], c[3][1]]], { stroke: P.paper, width: 2.4, opacity: 0.9 });
          sk.poly(pc, pts, { fill: "none", stroke: INK, width: 1.4, seed: S(), double: false });
        } else { // plank / board
          const l = 70 + r0 * 110, wd = 9 + r1 * 8;
          const pts = R([[-l / 2, -wd / 2], [l / 2, -wd / 2], [l / 2, wd / 2], [-l / 2, wd / 2]]);
          sk.poly(pc, pts, { fill, stroke: INK, width: 2.2, seed: S(), double: false, wobble: 0.4 });
          const gl = R([[-l * 0.35, 0], [l * 0.3, 1]]);
          lines(pc, [[gl[0][0], gl[0][1], gl[1][0], gl[1][1]]], { stroke: P.storm, width: 1.2, opacity: 0.55 });
          const nl = R([[l / 2 - 6, -2], [l / 2 - 6, 3]]);
          nl.forEach((q) => el("circle", { cx: f1(q[0]), cy: f1(q[1]), r: 1.4, fill: INK }, pc));
          rim([pts[1], pts[2]], 2, 0.85, pc);
          if (kind === 2) { const u = R([[l / 2, -wd / 2], [l / 2 + 10, -wd / 2 - 3], [l / 2 + 4, 0], [l / 2 + 12, wd / 2]]); sk.path(pc, u, { stroke: INK, width: 1.6, seed: S(), double: false }); } // splintered end
        }
      };
      for (let i = 0; i < 36; i++) piece(i);
      for (let i = 40; i < 52; i++) { // fill the lower-left flank of the heap too
        const r0 = rnd(i + 5200), r1 = rnd(i + 5201), cx = 560 + r0 * 150, cy = 560 + r1 * 140 + (cx - 560) * 0.1, l = 50 + rnd(i + 5202) * 80, wd = 8 + rnd(i + 5203) * 7, a = (rnd(i + 5204) - 0.5) * 120;
        const pts = [[-l / 2, -wd / 2], [l / 2, -wd / 2], [l / 2, wd / 2], [-l / 2, wd / 2]].map((q) => rotPt([cx + q[0], cy + q[1]], cx, cy, a));
        sk.poly(pc, pts, { fill: [P.steel, P.mist, EP5.mudWet, P.fog][i % 4], stroke: INK, width: 2.2, seed: S(), double: false, wobble: 0.4 });
        rim([pts[1], pts[2]], 1.8, 0.8, pc);
      }
      // a panelled door lying across the middle (good foothold)
      const dpts = [[612, 606], [724, 628], [714, 666], [600, 646]];
      sk.poly(pc, dpts, { fill: P.fog, stroke: INK, width: 2.8, seed: S(), double: false });
      sk.poly(pc, [[628, 616], [664, 624], [660, 638], [624, 630]], { fill: "none", stroke: P.steel, width: 1.8, seed: S(), double: false });
      sk.poly(pc, [[672, 626], [710, 634], [706, 650], [668, 642]], { fill: "none", stroke: P.steel, width: 1.8, seed: S(), double: false });
      sk.circle(pc, 704, 646, 3, { fill: P.steel, stroke: INK, width: 1, seed: S(), double: false });
      rim([[724, 628], [714, 666]], 2.4, 0.9, pc);
      // pallet near the top (the step under the ladder)
      const pal = [[626, 494], [700, 504], [696, 522], [622, 512]];
      sk.poly(pc, pal, { fill: P.mist, stroke: INK, width: 2.4, seed: S(), double: false });
      lines(pc, [[640, 496, 636, 514], [658, 498, 654, 516], [676, 501, 672, 519]], { stroke: P.storm, width: 2.4, opacity: 0.85 });
      rim([[700, 504], [696, 522]], 2, 0.85, pc);
      // a blue-gray plastic bin on its side, a mattress at the foot (striped)
      sk.path(pc, ellPts(586, 612, 24, 18, 14), { closed: true, fill: P.slate, stroke: INK, width: 2.4, seed: S(), double: false });
      sk.path(pc, ellPts(590, 612, 14, 10, 12), { closed: true, fill: P.night, stroke: INK, width: 1.6, seed: S(), double: false });
      sk.poly(pc, [[768, 662], [868, 672], [892, 716], [786, 716]], { fill: P.paper, stroke: INK, width: 2.4, seed: S(), double: false });
      lines(pc, [[786, 666, 802, 716], [808, 668, 824, 716], [830, 670, 846, 716], [852, 671, 868, 716]], { stroke: P.mist, width: 3, opacity: 0.85 });
      el("path", { d: Dp([[768, 690], [880, 694], [892, 716], [786, 716]], true), fill: EP5.mud, opacity: 0.45 }, pc);
      rim([[868, 672], [892, 716]], 2.4, 0.9, pc);
      // mud caked over the lower half + dried silt splashes
      el("path", { d: Dp([[530, 660], [600, 640], [700, 690], [820, 700], [930, 716], [930, 740], [520, 740]], true), fill: EP5.mud, opacity: 0.5 }, pc);
      const sp = []; for (let k = 0; k < 40; k++) { const x = 560 + rnd(k + 5300) * 330, y = 520 + rnd(k + 5301) * 190; sp.push([x, y, x + 3, y + 1]); }
      lines(pc, sp, { stroke: EP5.mud, width: 3, opacity: 0.7 });
    }
    const pilePath = [[880, 714], [830, 680], [784, 640], [736, 600], [700, 556], [676, 518], [662, 494]];
    // rope ladder (stern rail → pile top)
    const ladG = el("g", { class: "tf-ladder" }, midL);
    {
      const a0 = [railPt[0] - 8, railPt[1] + 2], b0 = [railPt[0] + 14, railPt[1] + 2], a1 = [650, 480], b1 = [674, 478];
      const sag = (p, q, t) => [p[0] + (q[0] - p[0]) * t + Math.sin(t * Math.PI) * 6, p[1] + (q[1] - p[1]) * t];
      const L = [], Rr = [];
      for (let i = 0; i <= 10; i++) { L.push(sag(a0, a1, i / 10)); Rr.push(sag(b0, b1, i / 10)); }
      sk.path(ladG, L, { stroke: P.storm, width: 3.4, seed: S(), double: false, step: 10 });
      sk.path(ladG, Rr, { stroke: P.storm, width: 3.4, seed: S(), double: false, step: 10 });
      for (let i = 1; i < 10; i++) sk.line(ladG, L[i][0], L[i][1], Rr[i][0], Rr[i][1], { stroke: P.steel, width: 4, seed: S(), double: false });
      for (let i = 1; i < 10; i++) sk.line(ladG, L[i][0], L[i][1] + 1, Rr[i][0], Rr[i][1] + 1, { stroke: INK, width: 1.2, seed: S(), double: false, opacity: 0.6 });
      rim(Rr.map((p) => [p[0] + 2, p[1]]), 1.6, 0.8, ladG);
    }

    // ================================================================== THE DEBRIS LINE (mid-ground wrack band)
    const DY = 712;
    const debrisY = (x) => DY + 8 * Math.sin((x - 800) * 0.006) - (x > 1500 ? (x - 1500) * 0.03 : 0);
    const debrisG = el("g", { class: "tf-debris" }, midL);
    const items = [];
    {
      // the wrack band: sticks, kelp, bark, rope bits
      const segs = [], kelp = [];
      for (let i = 0; i < 260; i++) {
        const x = 880 + rnd(i + 2000) * 1080, y = debrisY(x) + (rnd(i + 2001) - 0.5) * 18, s = sc(y);
        const a = (rnd(i + 2002) - 0.5) * 2.6, l = (6 + rnd(i + 2003) * 16) * s;
        segs.push([x, y, x + Math.cos(a) * l, y + Math.sin(a) * l * 0.45]);
        if (i % 4 === 0) kelp.push([x, y + 3, x + 14 * s, y + 2 + rnd(i) * 3]);
      }
      el("path", { d: segs.map((q) => `M${f1(q[0] - 2)} ${f1(q[1] + 2)} L${f1(q[2] - 2)} ${f1(q[3] + 2)}`).join(" "), stroke: P.night, "stroke-width": 3, opacity: 0.3, fill: "none", "stroke-linecap": "round" }, debrisG);
      el("path", { d: segs.map((q) => `M${f1(q[0])} ${f1(q[1])} L${f1(q[2])} ${f1(q[3])}`).join(" "), stroke: P.storm, "stroke-width": 2.2, opacity: 0.85, fill: "none", "stroke-linecap": "round" }, debrisG);
      lines(debrisG, kelp, { stroke: P.slate, width: 4, opacity: 0.7 });
      lines(debrisG, segs.filter((_, i) => i % 3 === 0).map((q) => [q[0] + 1, q[1] - 1.5, q[2] + 1, q[3] - 1.5]), { stroke: EP5.mudShine, width: 1.2, opacity: 0.55 });
      // scattered planks along the line
      for (let i = 0; i < 16; i++) {
        const x = 900 + rnd(i + 2100) * 1000, y = debrisY(x) + (rnd(i + 2101) - 0.5) * 16, s = sc(y);
        const l = (40 + rnd(i + 2102) * 70) * s, a = (rnd(i + 2103) - 0.5) * 30, wdt = 7 * s;
        const p = [[0, 0], [l, 0], [l, wdt], [0, wdt]].map((q) => rotPt([x + q[0], y + q[1]], x, y, a * 0.4));
        castShadow(p, [[p[1][0], p[1][1], 4], [p[0][0], p[0][1], 4]], { opacity: 0.3 });
        sk.poly(debrisG, p, { fill: i % 3 ? P.steel : P.mist, stroke: P.storm, width: 1.8, seed: S(), double: false, wobble: 0.4 });
        rim([p[1], p[2]], 1.4, 0.7, debrisG);
        if (i % 4 === 0) items.push({ kind: "plank", x: Math.round(x), y: Math.round(y) });
      }
    }
    // a TIRE lying flat
    {
      const x = 1000, y = debrisY(1000) + 10, s = sc(y);
      const rx = 40 * s / 0.86, ry = 14 * s / 0.86;
      castShadow([[x - rx, y], [x + rx, y]], [[x - rx, y, 18], [x + rx, y, 18]], { opacity: 0.4 });
      sk.path(debrisG, ellPts(x, y, rx, ry, 24), { closed: true, fill: P.night, stroke: INK, width: 3, seed: S(), wobble: 0.6 });
      sk.path(debrisG, ellPts(x, y - 7, rx, ry, 24), { closed: true, fill: P.storm, stroke: INK, width: 3, seed: S(), wobble: 0.6 });
      sk.path(debrisG, ellPts(x + 2, y - 6, rx * 0.5, ry * 0.45, 18), { closed: true, fill: EP5.mudWet, stroke: INK, width: 2, seed: S(), wobble: 0.4 });
      sk.path(debrisG, ellPts(x + 2, y - 5, rx * 0.36, ry * 0.25, 12), { closed: true, fill: EP5.mudShine, stroke: "none", seed: S(), wobble: 0.3, double: false, opacity: 0.8 }); // water inside
      const tr = [];
      for (let k = 0; k < 18; k++) { const t = (k / 18) * Math.PI; tr.push([x + Math.cos(t) * rx * 0.98, y - 7 + Math.sin(t) * ry * 0.98, x + Math.cos(t) * rx * 0.98, y + Math.sin(t) * ry * 0.98]); }
      lines(debrisG, tr, { stroke: P.slate, width: 2, opacity: 0.8 });
      rim([[x + rx * 0.7, y - 7 - ry * 0.7], [x + rx, y - 7], [x + rx * 0.9, y - 1]], 2.2, 0.8, debrisG);
      items.push({ kind: "tire", x, y: Math.round(y) });
    }
    // a wooden kitchen CHAIR on its side, legs to the sun
    {
      const x = 1168, y = debrisY(1168) + 6;
      const cg = el("g", { class: "tf-chair" }, debrisG);
      castShadow([[x - 50, y], [x + 30, y]], [[x - 40, y, 30], [x + 34, y, 70], [x + 60, y, 66]], { opacity: 0.38 });
      sk.poly(cg, [[x - 52, y], [x - 46, y - 32], [x + 2, y - 30], [x - 4, y + 2]], { fill: P.steel, stroke: INK, width: 3, seed: S(), wobble: 0.5 }); // seat (edge-on)
      sk.poly(cg, [[x - 56, y - 4], [x - 104, y - 18], [x - 98, y - 50], [x - 50, y - 34]], { fill: P.mist, stroke: INK, width: 3, seed: S(), wobble: 0.5 }); // back lying on the mud
      lines(cg, [[x - 92, y - 22, x - 86, y - 46], [x - 78, y - 18, x - 72, y - 42], [x - 64, y - 12, x - 60, y - 38]], { stroke: INK, width: 2.4, opacity: 0.8 });
      [[x - 6, y - 2, x + 56, y - 50], [x - 2, y - 26, x + 58, y - 78], [x - 44, y - 4, x + 10, y - 44], [x - 40, y - 30, x + 14, y - 70]].forEach(([a, b, c, d]) => {
        sk.line(cg, a, b, c, d, { stroke: INK, width: 5, seed: S(), double: false });
        sk.line(cg, a, b, c, d, { stroke: P.steel, width: 2, seed: S(), double: false });
        rim([[c + 2, d], [(a + c) / 2 + 2, (b + d) / 2]], 1.6, 0.85, cg);
      });
      sk.line(cg, x + 27, y - 26, x + 30, y - 52, { stroke: INK, width: 3, seed: S(), double: false }); // stretcher
      items.push({ kind: "chair", x, y: Math.round(y) });
    }
    // a FRIDGE on its back, half sunk, door ajar
    {
      const x = 1420, y = debrisY(1420) + 4;
      const fg = el("g", { class: "tf-fridge" }, debrisG);
      castShadow([[x - 96, y + 2], [x + 96, y - 6]], [[x - 96, y, 56], [x + 96, y - 6, 60], [x + 110, y - 30, 40]], { opacity: 0.42 });
      const top = [[x - 100, y - 44], [x + 86, y - 54], [x + 112, y - 38], [x - 76, y - 28]];
      sk.poly(fg, [[x - 100, y - 44], [x - 76, y - 28], [x - 76, y + 6], [x - 100, y - 8]], { fill: P.mist, stroke: INK, width: 3, seed: S(), wobble: 0.5 });
      sk.poly(fg, [[x - 76, y - 28], [x + 112, y - 38], [x + 112, y - 2], [x - 76, y + 6]], { fill: P.fog, stroke: INK, width: 3, seed: S(), wobble: 0.5 });
      sk.poly(fg, top, { fill: P.paper, stroke: INK, width: 3, seed: S(), wobble: 0.5 });
      // door ajar on top (hinged at the far edge), handle, a magnet
      sk.poly(fg, [[x - 30, y - 47], [x + 80, y - 53], [x + 96, y - 70], [x - 14, y - 66]], { fill: P.paper, stroke: INK, width: 2.4, seed: S(), double: false });
      sk.line(fg, x - 4, y - 64, x + 40, y - 66, { stroke: P.steel, width: 4, seed: S(), double: false });
      sk.line(fg, x - 30, y - 47, x - 14, y - 66, { stroke: INK, width: 2, seed: S(), double: false });
      el("rect", { x: x + 20, y: y - 64, width: 10, height: 7, fill: P.slate, transform: `rotate(-4 ${x + 25} ${y - 60})` }, fg);
      sk.line(fg, x - 60, y - 33, x + 100, y - 42, { stroke: P.slate, width: 1.6, seed: S(), double: false, opacity: 0.8 });
      el("path", { d: Dp([[x - 76, y - 10], [x + 112, y - 18], [x + 112, y - 2], [x - 76, y + 6]], true), fill: EP5.mud, opacity: 0.5 }, fg);
      sk.path(fg, [[x - 104, y - 6], [x - 40, y + 8], [x + 40, y + 2], [x + 116, y - 4]], { stroke: P.storm, width: 3, seed: S(), double: false, opacity: 0.8 }); // mud lip
      rim([[x + 112, y - 38], [x + 112, y - 4]], 2.6, 0.9, fg);
      rim([[x + 86, y - 54], [x + 112, y - 38]], 2, 0.8, fg);
      items.push({ kind: "fridge", x, y: Math.round(y) });
    }
    // CRAB POTS (wire mesh boxes) with a buoy on a line
    function crabPot(x, y, s, sd) {
      const cg = el("g", { class: "tf-crabpot" }, debrisG);
      const w = 70 * s, h = 34 * s, d = 22 * s;
      castShadow([[x, y], [x + w, y], [x + w + d, y - d * 0.45]], [[x, y, h], [x + w + d, y - d * 0.45, h]], { opacity: 0.32 });
      const front = [[x, y], [x + w, y], [x + w, y - h], [x, y - h]], side = [[x + w, y], [x + w + d, y - d * 0.45], [x + w + d, y - h - d * 0.45], [x + w, y - h]];
      const tp = [[x, y - h], [x + w, y - h], [x + w + d, y - h - d * 0.45], [x + d, y - h - d * 0.45]];
      [side, tp, front].forEach((pp) => sk.poly(cg, pp, { fill: P.slate, stroke: INK, width: 2.4, seed: S(), double: false, wobble: 0.4, opacity: 0.35 }));
      [side, tp, front].forEach((pp) => sk.poly(cg, pp, { fill: "none", stroke: INK, width: 2.6, seed: S(), double: false, wobble: 0.4 }));
      const mc = clipTo(cg, front.concat([]));
      sk.hatch(mc, x, y - h, w, h, { gap: 6 * s + 1, angle: 45, stroke: INK, width: 1, opacity: 0.6, seed: S() });
      sk.hatch(mc, x, y - h, w, h, { gap: 6 * s + 1, angle: -45, stroke: INK, width: 1, opacity: 0.6, seed: S() });
      sk.path(cg, ellPts(x + w * 0.35, y - h * 0.5, 7 * s, 9 * s, 10), { closed: true, fill: "none", stroke: P.paper, width: 1.6, seed: S(), double: false }); // tunnel eye
      rim([[x + w + d, y - h - d * 0.45], [x + w + d, y - d * 0.45]], 2, 0.85, cg);
      sk.path(cg, [[x + w * 0.1, y - h], [x - 16 * s, y - h - 6 * s], [x - 34 * s, y + 2]], { stroke: P.fog, width: 1.6, seed: S(), double: false }); // line to the buoy
      const bx = x - 40 * s, by = y - 2;
      sk.path(cg, ellPts(bx, by - 8 * s, 9 * s, 12 * s, 12), { closed: true, fill: P.paper, stroke: INK, width: 2, seed: S(), double: false });
      sk.path(cg, [[bx - 9 * s, by - 9 * s], [bx + 9 * s, by - 9 * s]], { stroke: P.storm, width: 4 * s, seed: S(), double: false });
      txt(cg, bx, by - 14 * s, sd % 2 ? "GH" : "14", { size: 8 * s + 2, fill: P.storm });
      return cg;
    }
    crabPot(1586, debrisY(1586) - 4, 0.95, 1); items.push({ kind: "crabPot", x: 1622, y: Math.round(debrisY(1586) - 4) });
    crabPot(1712, debrisY(1712) - 10, 0.82, 2); items.push({ kind: "crabPot", x: 1744, y: Math.round(debrisY(1712) - 10) });
    // a MAILBOX on its post, leaning out of the wrack
    {
      const x = 1290, y = debrisY(1290) - 2, mg = el("g", { class: "tf-mailbox" }, debrisG);
      const top = rotPt([x, y - 96], x, y, 14);
      poleShadow(x, y, 96, 6, { opacity: 0.38 });
      sk.line(mg, x, y, top[0], top[1], { stroke: INK, width: 6, seed: S(), double: false });
      sk.line(mg, x, y, top[0], top[1], { stroke: P.steel, width: 2.4, seed: S(), double: false });
      const box = [[-26, -6], [20, -6], [20, -24], [-26, -24]].map((p) => rotPt([top[0] + p[0], top[1] + p[1] + 6], top[0], top[1], 14));
      sk.poly(mg, box, { fill: P.mist, stroke: INK, width: 2.6, seed: S(), double: false });
      txt(mg, top[0] - 4, top[1] - 4, "14", { size: 11, fill: P.storm, rot: 14 });
      rim([box[1], box[2]], 2, 0.85, mg);
      items.push({ kind: "mailbox", x, y: Math.round(y) });
    }

    // ================================================================== NEAR: the tall piling (right), the crate of cans, the boot-print hole
    piling(nearL, 1838, 912, 456, 46, { lean: -6, rope: true });
    {
      // a gull on top of the tall piling, looking out to sea
      const gx = 1832, gy = 912 - 458;
      const gg = el("g", { class: "tf-gull" }, nearL);
      sk.path(gg, [[gx - 20, gy], [gx - 14, gy - 16], [gx + 4, gy - 20], [gx + 14, gy - 32], [gx + 24, gy - 30], [gx + 18, gy - 18], [gx + 20, gy - 4], [gx + 4, gy]], { closed: true, fill: P.paper, stroke: INK, width: 2.4, seed: S(), wobble: 0.4 });
      sk.path(gg, [[gx - 22, gy - 8], [gx - 2, gy - 12], [gx + 10, gy - 10]], { stroke: P.slate, width: 4, seed: S(), double: false });
      sk.line(gg, gx + 24, gy - 30, gx + 32, gy - 28, { stroke: P.steel, width: 2.6, seed: S(), double: false });
      el("circle", { cx: gx + 18, cy: gy - 27, r: 1.8, fill: INK }, gg);
      sk.line(gg, gx - 2, gy, gx - 2, gy + 4, { stroke: INK, width: 1.6, seed: S(), double: false });
      sk.line(gg, gx + 6, gy, gx + 6, gy + 4, { stroke: INK, width: 1.6, seed: S(), double: false });
      rim([[gx + 24, gy - 28], [gx + 20, gy - 6]], 1.8, 0.9, gg);
    }
    // the split CRATE of cans, half sunk in the soft mud
    const CR = { x: 1372, y: 872 };
    const crateG = el("g", { class: "tf-crate" }, nearL);
    {
      const x = CR.x, y = CR.y;
      castShadow([[x - 52, y + 18], [x + 52, y + 14]], [[x - 50, y + 16, 18], [x + 56, y + 10, 22]], { opacity: 0.42 });
      // body (front + lit right side), sunk: bottom edge hidden in a mud lip
      const front = [[x - 52, y + 20], [x - 50, y - 6], [x + 40, y - 8], [x + 42, y + 18]];
      const side = [[x + 40, y - 8], [x + 58, y - 16], [x + 60, y + 10], [x + 42, y + 18]];
      sk.poly(crateG, side, { fill: EP5.mudShine, stroke: INK, width: 3, seed: S(), double: false, wobble: 0.4 });
      sk.poly(crateG, front, { fill: P.mist, stroke: INK, width: 3, seed: S(), wobble: 0.4 });
      lines(crateG, [[x - 50, y + 4, x + 41, y + 2], [x - 6, y - 7, x - 4, y + 19]], { stroke: INK, width: 2, opacity: 0.7 });
      const grain = [];
      for (let k = 0; k < 6; k++) grain.push([x - 46 + k * 15, y - 3 + (k % 2), x - 36 + k * 15, y - 2 + (k % 2)]);
      lines(crateG, grain, { stroke: P.steel, width: 1, opacity: 0.8 });
      txt(crateG, x - 24, y + 16, "DALE'S", { size: 10, fill: P.storm, len: 34, opacity: 0.8 });
      // split: a broken slat sprung up, a dark gap
      sk.poly(crateG, [[x + 8, y - 7], [x + 26, y - 8], [x + 22, y + 8], [x + 12, y + 2]], { fill: P.night, stroke: INK, width: 1.8, seed: S(), double: false });
      sk.poly(crateG, [[x + 10, y - 8], [x + 14, y - 34], [x + 22, y - 32], [x + 20, y - 8]], { fill: P.steel, stroke: INK, width: 2, seed: S(), double: false });
      // inside top: cans packed, labels (soup / beans)
      sk.poly(crateG, [[x - 50, y - 6], [x - 32, y - 14], [x + 58, y - 16], [x + 40, y - 8]], { fill: P.storm, stroke: INK, width: 2, seed: S(), double: false });
      const can = (cx, cy, r, h, lbl, o) => {
        o = o || {};
        const cg = el("g", { class: "tf-can" }, crateG);
        sk.path(cg, [[cx - r, cy - h], [cx - r, cy], [cx + r, cy], [cx + r, cy - h]], { fill: o.dent ? P.steel : P.fog, stroke: INK, width: 1.8, seed: S(), double: false, wobble: o.dent ? 1.2 : 0.2 });
        el("rect", { x: f1(cx - r + 1), y: f1(cy - h * 0.72), width: f1(2 * r - 2), height: f1(h * 0.46), fill: o.dent ? P.mist : P.paper, opacity: 0.95 }, cg);
        sk.path(cg, ellPts(cx, cy - h, r, r * 0.35, 12), { closed: true, fill: P.mist, stroke: INK, width: 1.4, seed: S(), double: false, wobble: 0.25 });
        if (lbl) txt(cg, cx, cy - h * 0.38, lbl, { size: Math.max(5, r * 0.8), fill: P.storm, len: r * 1.6 });
        if (o.dent) sk.path(cg, [[cx - r * 0.6, cy - h * 0.8], [cx + r * 0.2, cy - h * 0.55], [cx - r * 0.3, cy - h * 0.25]], { stroke: INK, width: 1.4, seed: S(), double: false });
        rim([[cx + r, cy - h], [cx + r, cy]], 1.2, 0.8, cg);
        return cg;
      };
      can(x - 28, y - 10, 8, 16, "SOUP"); can(x - 10, y - 12, 8, 16, "BEANS"); can(x + 34, y - 14, 8, 15, "SOUP");
      // spilled: two clean cans and a dented one lying in the mud
      can(x - 36, y + 26, 8, 15, "BEANS"); can(x - 18, y + 30, 8, 15, "SOUP");
      const dg = el("g", { transform: `rotate(-74 ${x + 37} ${y + 24})` }, crateG);
      const tmp = can(x + 37, y + 30, 8, 16, "SOUP", { dent: true }); dg.appendChild(tmp);
      sk.path(crateG, [[x - 60, y + 20], [x - 20, y + 25], [x + 30, y + 22], [x + 66, y + 12]], { stroke: P.storm, width: 3, seed: S(), double: false, opacity: 0.85 }); // mud lip
      sk.path(crateG, [[x - 56, y + 22], [x + 10, y + 27], [x + 64, y + 15]], { stroke: EP5.mudShine, width: 1.6, seed: S(), double: false, opacity: 0.6 });
      rim([[x + 58, y - 16], [x + 60, y + 10]], 2.4, 0.9, crateG);
    }
    // the hero close-up: a BOOT-PRINT HOLE in the soft mud with a sucked-in puddle
    const DT = { x: 1236, y: 884, w: 96, h: 34 };
    const detailG = el("g", { class: "tf-detail-bootprint" }, nearL);
    {
      const x = DT.x, y = DT.y, rx = DT.w / 2, ry = DT.h / 2;
      // squeezed-up lip of mud around the hole: a raised wet ring, lit on its far (sun) side, shaded near-left
      const lipO = ellPts(x + 2, y + 1, rx + 20, ry + 10, 26, 0.08, 401);
      sk.poly(detailG, lipO, { fill: EP5.mudWet, stroke: P.storm, width: 2.2, seed: S(), double: false, wobble: 0.6 });
      sk.path(detailG, lipO.slice(15, 26).concat([lipO[0], lipO[1]]), { stroke: EP5.mudShine, width: 3, seed: S(), double: false, opacity: 0.9, wobble: 0.4 }); // far lip catches the sun
      sk.path(detailG, lipO.slice(4, 12), { stroke: P.storm, width: 3.4, seed: S(), double: false, opacity: 0.7, wobble: 0.4 }); // near lip in shade
      // squeeze ridges radiating from the hole (mud pushed out by the boot)
      const sq = [];
      for (let k = 0; k < 16; k++) { const t = (k / 16) * Math.PI * 2, c = Math.cos(t), s2 = Math.sin(t); sq.push([x + c * (rx + 4), y + s2 * (ry + 3), x + c * (rx + 16), y + s2 * (ry + 8)]); }
      lines(detailG, sq, { stroke: P.storm, width: 1.6, opacity: 0.5 });
      // the hole itself: boot-sole outline (toe RIGHT, heel left), dark walls
      const sole = [[x - rx, y + 3], [x - rx + 3, y - ry * 0.6], [x - rx * 0.62, y - ry - 1], [x - rx * 0.2, y - ry * 0.7], [x + rx * 0.2, y - ry * 0.95], [x + rx * 0.66, y - ry - 1], [x + rx, y - ry * 0.25], [x + rx * 0.94, y + ry * 0.55], [x + rx * 0.5, y + ry], [x + rx * 0.05, y + ry * 0.72], [x - rx * 0.32, y + ry * 0.8], [x - rx * 0.8, y + ry * 0.95]];
      sk.poly(detailG, sole, { fill: P.night, stroke: INK, width: 3.4, seed: S(), wobble: 0.5 });
      // inner wall band: the near (bottom) wall faces away (dark); the far (top) wall faces the viewer and the sun
      sk.poly(detailG, [[x - rx + 4, y - ry * 0.5], [x - rx * 0.62, y - ry + 1], [x - rx * 0.2, y - ry * 0.68 + 1], [x + rx * 0.2, y - ry * 0.93 + 1], [x + rx * 0.66, y - ry + 1], [x + rx * 0.92, y - ry * 0.3], [x + rx * 0.72, y - ry * 0.25], [x + rx * 0.2, y - ry * 0.45], [x - rx * 0.4, y - ry * 0.35], [x - rx + 8, y - ry * 0.2]], { fill: EP5.mudWet, stroke: "none", seed: S(), double: false, wobble: 0.4 });
      sk.path(detailG, [[x - rx * 0.55, y - ry * 0.72], [x - rx * 0.15, y - ry * 0.55], [x + rx * 0.3, y - ry * 0.72], [x + rx * 0.7, y - ry * 0.72]], { stroke: EP5.mudShine, width: 1.6, seed: S(), double: false, opacity: 0.7 });
      // the sucked-in puddle: water drawn into the bottom of the print, sky reflected in it
      const pud = [[x - rx + 8, y + 2], [x - rx * 0.5, y - ry * 0.3], [x + rx * 0.1, y - ry * 0.4], [x + rx * 0.72, y - ry * 0.18], [x + rx * 0.86, y + ry * 0.3], [x + rx * 0.48, y + ry * 0.74], [x + rx * 0.02, y + ry * 0.52], [x - rx * 0.36, y + ry * 0.6], [x - rx * 0.74, y + ry * 0.66]];
      sk.poly(detailG, pud, { fill: P.mist, stroke: P.storm, width: 1.6, seed: S(), double: false, wobble: 0.3 });
      sk.poly(detailG, [[x - rx * 0.25, y - ry * 0.25], [x + rx * 0.5, y - ry * 0.12], [x + rx * 0.62, y + ry * 0.2], [x - rx * 0.05, y + ry * 0.12]], { fill: EP5.mudShine, stroke: "none", seed: S(), double: false, wobble: 0.3, opacity: 0.95 }); // the bright sky
      sk.path(detailG, [[x + rx * 0.05, y - ry * 0.1], [x + rx * 0.42, y - ry * 0.02]], { stroke: P.paper, width: 2, seed: S(), double: false, opacity: 0.95 });
      sk.path(detailG, pud.slice(0, 4), { stroke: P.paper, width: 1.2, seed: S(), double: false, opacity: 0.7 }); // meniscus
      // lug-tread ridges of the sole pressed in the floor, showing through the shallow water
      const tread = [];
      for (let k = 0; k < 6; k++) {
        const tx = x - rx * 0.42 + k * rx * 0.22;
        [-0.02, 0.4].forEach((v, j) => { const ty = y + ry * v + (k % 2) * 1.5; tread.push([tx - 4, ty - 3 + j, tx, ty], [tx, ty, tx - 4, ty + 3 + j]); });
      }
      tread.push([x - rx * 0.86, y - 1, x - rx * 0.68, y - 2], [x - rx * 0.86, y + 5, x - rx * 0.68, y + 4]); // heel bars
      lines(detailG, tread, { stroke: P.storm, width: 2.2, opacity: 0.5 });
      // the suck: a tongue of mud slumping in at the toe, rivulets running in over the lip, swirl in the water
      sk.poly(detailG, [[x + rx * 0.78, y - ry * 0.75], [x + rx + 6, y - ry * 0.3], [x + rx * 0.96, y + ry * 0.4], [x + rx * 0.8, y + ry * 0.3], [x + rx * 0.7, y - ry * 0.1]], { fill: EP5.mud, stroke: INK, width: 1.8, seed: S(), double: false });
      sk.path(detailG, [[x + rx * 0.8, y - ry * 0.6], [x + rx * 0.9, y - ry * 0.1]], { stroke: EP5.mudShine, width: 1.4, seed: S(), double: false, opacity: 0.8 });
      [[0.38, -1.25, 0.34, -0.55], [0.0, -1.2, 0.02, -0.6], [-0.4, -1.2, -0.38, -0.5], [0.62, -1.3, 0.58, -0.75]].forEach(([a, b, c, d]) =>
        sk.path(detailG, [[x + rx * a, y + ry * b], [x + rx * (a + c) / 2 + 2, y + ry * (b + d) / 2], [x + rx * c, y + ry * d]], { stroke: EP5.mudShine, width: 1.8, seed: S(), double: false, opacity: 0.9, wobble: 0.2 }));
      sk.path(detailG, ellPts(x + rx * 0.2, y + ry * 0.2, rx * 0.2, ry * 0.2, 9).slice(0, 7), { stroke: P.steel, width: 1.4, seed: S(), double: false, opacity: 0.9, wobble: 0.1 });
      // bubbles
      [[x + rx * 0.28, y + ry * 0.3, 2.8], [x + rx * 0.4, y + ry * 0.5, 1.8], [x - rx * 0.3, y + ry * 0.35, 2.2], [x + rx * 0.62, y + 0, 1.5], [x + rx * 0.12, y - ry * 0.2, 1.3], [x - rx * 0.5, y + ry * 0.2, 1.2]].forEach(([bx, by, r]) => {
        el("circle", { cx: f1(bx), cy: f1(by), r: f1(r), fill: "none", stroke: P.paper, "stroke-width": 1, opacity: 0.95 }, detailG);
        el("circle", { cx: f1(bx + r * 0.3), cy: f1(by - r * 0.35), r: f1(r * 0.32), fill: P.paper, opacity: 0.95 }, detailG);
      });
      // mud flecks flung out when the boot came free, and the trail of the pulled boot (smear toward the left)
      for (let k = 0; k < 14; k++) {
        const a = Math.PI * (0.6 + rnd(k + 3100) * 0.8), d = rx + 26 + rnd(k + 3101) * 34, fx = x + Math.cos(a) * d, fy = y + Math.sin(a) * d * 0.4;
        el("ellipse", { cx: f1(fx), cy: f1(fy), rx: f1(1.5 + rnd(k) * 2.5), ry: f1(1 + rnd(k + 1) * 1.2), fill: EP5.mud, stroke: P.storm, "stroke-width": 0.8, opacity: 0.9 }, detailG);
      }
      sk.path(detailG, [[x - rx - 20, y + 10], [x - rx - 50, y + 14], [x - rx - 80, y + 13]], { stroke: P.storm, width: 3, seed: S(), double: false, opacity: 0.5 });
      // a second, shallower print just behind (heel-first), with tread
      const bp = bootPrint(detailG, x - 150, y + 8, 2.6, -3, { fill: EP5.mudWet, opacity: 0.9 });
      void bp;
      // tiny ground texture around the spot (for 3x): grit, a cockle shell, a worm cast, glints
      const grit = [];
      for (let k = 0; k < 60; k++) { const gx = x - 200 + rnd(k + 3200) * 400, gy = y - 40 + rnd(k + 3201) * 80; if (Math.abs(gx - x) < rx + 24 && Math.abs(gy - y) < ry + 12) continue; grit.push([gx, gy, gx + 2, gy + 0.5]); }
      lines(detailG, grit, { stroke: P.storm, width: 1.4, opacity: 0.55 });
      const sh = [x + 96, y + 18];
      sk.poly(detailG, [[sh[0] - 9, sh[1]], [sh[0] - 4, sh[1] - 7], [sh[0] + 4, sh[1] - 7], [sh[0] + 9, sh[1]]], { fill: P.paper, stroke: P.slate, width: 1.4, seed: S(), double: false, wobble: 0.2 });
      lines(detailG, [[sh[0] - 5, sh[1] - 1, sh[0] - 2, sh[1] - 6], [sh[0], sh[1] - 1, sh[0], sh[1] - 7], [sh[0] + 5, sh[1] - 1, sh[0] + 2, sh[1] - 6]], { stroke: P.steel, width: 1, opacity: 0.9 });
      const wc = []; for (let k = 0; k < 9; k++) wc.push([x - 60 + Math.cos(k * 1.6) * (1.5 + k * 0.8), y - 24 + Math.sin(k * 1.6) * (1 + k * 0.4)]);
      sk.path(detailG, wc, { stroke: P.storm, width: 1.6, seed: S(), double: false, wobble: 0.2, step: 3 });
      el("ellipse", { cx: x - 112, cy: y - 22, rx: 7, ry: 4, fill: P.slate, stroke: P.storm, "stroke-width": 1.2 }, detailG);
      el("path", { d: `M${x - 115} ${y - 25} q 5 -1 8 2`, stroke: EP5.mudShine, "stroke-width": 1.2, fill: "none" }, detailG);
    }

    // ================================================================== LIGHT (late sun from the right)
    {
      el("ellipse", { cx: SUN.x, cy: SUN.y, rx: 520, ry: 360, fill: rgrad("sunGlow", [[0, P.paper, 0.75], [0.25, EP5.mudShine, 0.45], [1, EP5.lateSky, 0]]) }, lightG);
      el("rect", { x: -40, y: HOR - 60, width: 2000, height: 330, fill: lgrad("lateHaze", [[0, EP5.lateSky, 0], [0.25, EP5.lateSky, 0.28], [1, EP5.lateSky, 0]]) }, lightG);
      // faint rays slanting down-left from the sun (fading out toward the left)
      const rayFill = lgrad("ray", [[0, EP5.mudShine, 0], [0.6, EP5.mudShine, 0.5], [1, P.paper, 0.9]], 1, 0);
      [[0.16, 0.13, 70], [0.3, 0.1, 110], [0.06, 0.09, 50]].forEach(([slope, op, w1]) => {
        const ex = -60, ey = SUN.y + (SUN.x - ex) * slope;
        el("path", { d: Dp([[SUN.x, SUN.y - 10], [ex, ey - w1], [ex, ey + w1], [SUN.x, SUN.y + 10]], true), fill: rayFill, opacity: op }, lightG);
      });
      // glitter path: the sun on the far water and then on the wet mud under it
      const gl = [];
      for (let i = 0; i < 110; i++) {
        const t = Math.pow(rnd(i + 4000), 1.4), y = HOR + 3 + t * 300, s = sc(y);
        const spread = 30 + t * 140, x = SUN.x - 10 + (rnd(i + 4001) - 0.5) * spread * 2 - t * 60;
        const l = (6 + rnd(i + 4002) * 22) * (0.6 + s);
        gl.push([x, y, x + l, y]);
      }
      lines(lightG, gl, { stroke: P.paper, width: 2.2, opacity: 0.85 });
      lines(lightG, gl.filter((_, i) => i % 2).map((q) => [q[0] - 4, q[1] + 2, q[2] + 6, q[3] + 2]), { stroke: EP5.mudShine, width: 1.4, opacity: 0.7 });
      // puddle glints in the soft zone + along the channel
      [[1480, 898], [1300, 918], [1600, 916], [1156, 903], [1560, 870], [1420, 870], [1700, 650], [1600, 620], [1480, 572]].forEach(([x, y], i) => {
        lines(lightG, [[x - 14, y - 1, x + 18, y - 2], [x - 4, y + 2, x + 8, y + 2]], { stroke: P.paper, width: i < 6 ? 2.2 : 1.6, opacity: 0.85 });
      });
    }

    // the detail's cast shadow lip (the hole's own rim throws a short shadow left)
    sk.path(shadowsG, [[DT.x - DT.w / 2 - 14, DT.y + 6], [DT.x - DT.w / 2 - 44, DT.y + 12]], { stroke: P.storm, width: 6, seed: S(), double: false, opacity: 0.3 });

    void LIGHT; void curLevel;
    return {
      g,
      groundY: GROUND,
      groundAt: (y) => Math.round(sc(y) * 1000) / 1000,
      mudZone: { x0: MZ.x0, x1: MZ.x1, y0: MZ.y0, y1: MZ.y1, sinkY: 34 },
      boat: { g: boatG, x: BOAT.cx, y: BOAT.cy, deckY: Math.round(Rb([500, 292])[1]), bowX: Math.round(Rb([72, 254])[0]), sternX: Math.round(Rb([644, 288])[0]),
        wheelhouse: { x: Math.round(doorFoot[0]), y: Math.round(doorFoot[1]), g: boatG.querySelector(".tf-wheelhouse") },
        doorX: Math.round(doorFoot[0]), roofY: Math.round(Rb([500, 188])[1]), rail: { x: Math.round(railPt[0]), y: Math.round(railPt[1]) } },
      ladder: { g: ladG, x0: Math.round(railPt[0]), y0: Math.round(railPt[1]), x1: 662, y1: 479 },
      pile: { g: pileG, x: pilePath[0][0], y: pilePath[0][1], topX: 650, topY: 476, path: pilePath },
      house: { g: bhRec.g, x: BH.x, y: BH.y, w: Math.round(bhRec.w), eaveY: Math.round(bhRec.eaveY), ridgeY: Math.round(bhRec.ridgeY) },
      houses: houses.filter((h) => h !== bhRec).map((h) => ({ g: h.g, x: h.x, y: h.y })),
      crate: { g: crateG, x: CR.x, y: CR.y, dentCan: { x: CR.x + 37, y: CR.y + 24 }, cleanCans: [{ x: CR.x - 36, y: CR.y + 26 }, { x: CR.x - 18, y: CR.y + 30 }] },
      debris: { g: debrisG, y: DY, items },
      pilings,
      water: { g: waterL, edgeG: waterEdgeL, levelY: L0, horizonY: HOR, setLevel },
      sun: SUN,
      skyG, lightG, shadowsG,
      shadowDir: { dx: SH.dx, dy: SH.dy, k: SH.k },
      detail: { g: detailG, x: DT.x, y: DT.y, w: DT.w, h: DT.h },
      layers: { sky: skyG, far: farL, water: waterL, flats: flatsL, waterEdge: waterEdgeL, town: townL, mid: midL, near: nearL, shadows: shadowsG, light: lightG },
    };
  };
})();
