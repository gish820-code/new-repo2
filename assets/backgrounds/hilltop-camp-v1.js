/* Rainy Day background — `hilltopCamp` v1. Episode 2, DAY 1: the SAME summit as `hilltop` v1 (CERT canopy at
 * left-center, water tank far left, ASSEMBLY AREA sign, picnic table right of center, the view at RIGHT over the
 * flooded lowland), the morning after — turned into an improvised overnight camp. Flat, cold, gray dawn; low fog;
 * everything wet: dome tents and tarp lean-tos, three cars parked on the grass at the lip, blankets and wet clothes
 * on a line behind the table, a cold fire ring still smoking, scattered (one tipped) camp chairs, a missing-persons
 * whiteboard hung in the canopy, a crack in the water tank (taped, leaking). The flood has receded a little: more
 * of each house shows, every wall carries a dark mud line at last night's high water, and debris lines drift on
 * the surface.
 *
 * Paste VERBATIM after assets/characters/rainy-day-rig-v3.js (v1/v2 work too — uses only palette, LINE, el, sk,
 * hash). Deterministic, static; scenes own all motion.
 *
 *   const bg = window.RainyDayBG.hilltopCamp(layerG, { crowd: true, fog: 0.6 });
 *
 * OPTS (all optional):
 *   crowd: true      draw the muted-gray townspeople (crowd.g); false = the camp without people
 *   fog:   0.6       opacity of the fog layer (fogG), 0..1. 0 = clear morning, 1 = thick
 *   level: 575       initial flood level (screen y of the flood surface in the distant view)
 *
 * HANDLES returned (all numbers are screen px in the 1920x1080 viewBox):
 *   g                 root <g> of the whole background
 *   groundY = 860     summit grass where character feet stand (figure y = 860 - 116*scale, e.g. 697.6 at 1.4).
 *                     Flat & walkable; the foreground band y 850–905 is clear of props for x 540–1590.
 *   canopy: { g, x: 690, y: 835, x0: 500, x1: 880, eaveY: 548, peakY: 452,
 *             board: { x: 568, y: 604, w: 112, h: 92 } }
 *                     CERT pop-up canopy (same place as hilltop v1). x = center, y = front-leg ground line,
 *                     x0/x1 = front legs, eaveY = valance top. board = the missing-persons whiteboard (top-left
 *                     corner x,y) hung in its left bay.
 *   table:  { g, x: 1215, y: 742, x0: 1085, x1: 1345, seatY: 786, groundY: 818 }
 *                     picnic table (same as hilltop v1). y = tabletop (Gord stands here: feet y = 742), seatY =
 *                     front bench top, groundY = where its legs stand. Tabletop x 1110–1300 is left CLEAR; two
 *                     shrink-wrapped water cases + a clipboard sit on the left end (x 1090–1160).
 *   sign:   { g, x: 1015, y: 520, w: 200, h: 180 }   "ASSEMBLY AREA" sign. x = center, y = panel top.
 *   tank:   { g, x: 252, y: 600, crackX: 282, crackY: 668 }  water tank (x,y = top-center of the drum);
 *                     crackX/Y = the taped crack (scenes can drip from here).
 *   tents:  [ { g, x, y, w, h } ]  dome tents, x = center, y = ground line:
 *             [0] x 455  y 702  (back left, behind the lean-to)    [1] x 1530 y 800 (mid right)
 *             [2] x 1722 y 905  (front right, door rolled open)
 *   cars:   [ { g, x, y, w } ]  parked on the grass at the lip, x = center, y = tire ground line:
 *             [0] x 1452 y 744 sedan   [1] x 1652 y 752 pickup   [2] x 1856 y 764 hatchback (cut by frame)
 *   lineG / clothesline: { g, x0: 1104, x1: 1338, y: 664 }  wet blankets & clothes on a line behind the table
 *   firePit: { g, x: 392, y: 888 }   the cold, smoking fire ring (left foreground, by a small A-frame tarp shelter);
 *                     smoke: { g } its static wisp group (scenes may fade/replace it)
 *   crowd:  { g, members: [ { g, x, y, scale, pose } ] }  muted townspeople (opts.crowd, default true)
 *   view:   { g, waterG, levelY: 575, horizonY: 420, setLevel(y) }
 *                     the distant flooded lowland. setLevel(y) redraws the flood surface at screen y (smaller y =
 *                     higher water): 600 low, 575 receded (DAY 1 default), 540 = last night's peak (the mud lines),
 *                     ~500 surge. Each house/tree is clipped at its own waterline + ripple; safe in onUpdate.
 *   fogG              the fog layer (fog banks over the lowland, mist along the crest). Its opacity = opts.fog;
 *                     scenes may tween it (gsap.to(bg.fogG, { opacity: 0.2 })).
 *   sky: { g }, far: { g }   sky / far hills + ocean (for parallax / dimming).
 */
window.RainyDayBG = window.RainyDayBG || {};
if (!window.RainyDayBG.hilltopCamp) window.RainyDayBG.hilltopCamp = function (parent, opts) {
  opts = opts || {};
  const RD = window.RainyDay, P = RD.palette, LINE = RD.LINE, sk = RD.sk, el = RD.el, H = RD.hash;
  const showCrowd = opts.crowd !== false;
  const FOG = Math.max(0, Math.min(1, opts.fog !== undefined ? +opts.fog : 0.6));
  const REF = 540, L0 = 575, HORIZON = 420, GROUND = 860;
  let SEED = 8100;
  const sd = () => (SEED += 7);
  const rnd = (i) => (H(i * 1.731 + 91.3) + 1) / 2; // deterministic 0..1
  const D = (o) => Object.assign({ seed: sd() }, o);
  const DET = (o) => Object.assign({ seed: sd(), width: LINE.detail }, o);
  const txt = (g, x, y, s, a, fit) => {
    const t = el("text", Object.assign({ x, y, "text-anchor": "middle" }, fit ? { textLength: fit, lengthAdjust: "spacingAndGlyphs" } : {}, a), g);
    t.textContent = s;
    return t;
  };
  const GOTHIC = '"League Gothic", "Oswald", "Arial Narrow", sans-serif';
  const HAND = '"Kalam", "Comic Sans MS", cursive';
  const uid = "rdHc" + Math.round(Math.abs(H(SEED + (window.__rdHcN = (window.__rdHcN || 0) + 1))) * 1e6) + "_";

  const root = el("g", { class: "rd-bg rd-bg-hilltop-camp" }, parent);
  const defs = el("defs", {}, root);
  function lgrad(name, stops, x2, y2) {
    const lg = el("linearGradient", { id: uid + name, x1: 0, y1: 0, x2: x2 || 0, y2: y2 === undefined ? 1 : y2 }, defs);
    stops.forEach(([o, c, a]) => el("stop", { offset: o, "stop-color": c, "stop-opacity": a === undefined ? 1 : a }, lg));
    return `url(#${uid}${name})`;
  }

  // ------------------------------------------------------------------ helpers
  function fir(g, x, base, h, w, o) {
    o = o || {};
    const tg = el("g", { opacity: o.opacity !== undefined ? o.opacity : 1 }, g);
    const fill = o.fill || P.slate, stroke = o.stroke || P.ink, lw = o.width || LINE.main;
    const tiers = o.tiers || Math.max(5, Math.round(h / 42));
    sk.line(tg, x, base, x, base - h * 0.15, { seed: sd(), stroke, width: Math.max(lw, w * 0.07) });
    const pts = [[x, base - h]];
    for (let i = 1; i <= tiers; i++) {
      const t = i / tiers, yy = base - h + h * 0.88 * t, ww = (w / 2) * (0.25 + 0.75 * t);
      pts.push([x + ww, yy + 4], [x + ww * 0.55, yy - h * 0.03]);
    }
    const right = pts.slice(1);
    const left = right.map(([px, py]) => [2 * x - px + H(px + py) * 3, py + H(py) * 3]).reverse();
    const shape = [pts[0]].concat(right.slice(0, -1), [[x + w * 0.12, base - h * 0.12], [x - w * 0.12, base - h * 0.12]], left.slice(1));
    sk.poly(tg, shape, { seed: sd(), fill, stroke, width: lw, step: 200, wobble: o.wobble !== undefined ? o.wobble : 1.4 });
    if (o.boughs !== false) {
      for (let i = 1; i < tiers; i++) {
        const t = i / tiers, yy = base - h + h * 0.88 * t, ww = (w / 2) * (0.25 + 0.75 * t);
        sk.path(tg, [[x - ww * 0.15, yy - h * 0.06], [x + ww * 0.55, yy - h * 0.005]], { seed: sd(), stroke, width: Math.max(1, lw * 0.5), opacity: 0.55, double: false });
        sk.path(tg, [[x - ww * 0.1, yy - h * 0.05], [x - ww * 0.6, yy]], { seed: sd(), stroke, width: Math.max(1, lw * 0.5), opacity: 0.35, double: false });
      }
    }
    return tg;
  }
  // long, flat stratus band (dawn overcast)
  function stratus(g, x, y, w, h, fill, o) {
    o = o || {};
    const n = Math.max(6, Math.round(w / 90));
    const pts = [[x, y + h]];
    for (let i = 0; i <= n; i++) {
      const t = i / n, bump = Math.sin(t * Math.PI) * h * (0.5 + 0.5 * rnd(x + i * 3.7));
      pts.push([x + w * t, y + h - bump]);
    }
    pts.push([x + w, y + h]);
    for (let i = n; i >= 0; i--) pts.push([x + (w * i) / n, y + h + 4 * H(x + i)]);
    return sk.poly(g, pts, { seed: sd(), fill, stroke: o.stroke || P.steel, width: o.width || LINE.detail, opacity: o.opacity !== undefined ? o.opacity : 1, step: 50, wobble: 2, double: o.double });
  }
  // little muted stick person (crowd). pose = RD.POSES name or object
  function person(g, x, gy, s, pose, o) {
    o = o || {};
    const pz = typeof pose === "string" ? RD.POSES[pose] : pose;
    const f = o.facing === -1 ? -1 : 1;
    const stroke = o.stroke || P.storm, lw = (o.width || 9) * s;
    const pg = el("g", { class: "rd-crowd-person", opacity: o.opacity !== undefined ? o.opacity : 0.95 }, g);
    const rad = (a) => (a * Math.PI) / 180;
    const dir = (a) => [Math.sin(rad(a)) * f, Math.cos(rad(a))];
    const hip = [x, gy - 116 * s + pz.dy * s];
    const td = [Math.sin(rad(pz.torso)) * f, -Math.cos(rad(pz.torso))];
    const sh = [hip[0] + td[0] * 88 * s, hip[1] + td[1] * 88 * s];
    const hc = [hip[0] + td[0] * 135 * s + Math.sin(rad(pz.head)) * f * 4 * s, hip[1] + td[1] * 135 * s];
    const limb = (r, a1, a2, l1, l2) => {
      const d1 = dir(a1), m = [r[0] + d1[0] * l1 * s, r[1] + d1[1] * l1 * s];
      const d2 = dir(a1 + a2);
      return [r, m, [m[0] + d2[0] * l2 * s, m[1] + d2[1] * l2 * s]];
    };
    const LS = { seed: sd(), stroke, width: lw, wobble: 0.8, double: false };
    sk.path(pg, limb(hip, pz.lhip, pz.lkn, 60, 58), Object.assign({}, LS, { seed: sd(), opacity: 0.8 }));
    sk.path(pg, limb(sh, pz.lsh + pz.torso, pz.lel, 52, 50), Object.assign({}, LS, { seed: sd(), opacity: 0.8 }));
    if (o.coat) sk.poly(pg, [[sh[0] - 14 * s, sh[1] + 2 * s], [sh[0] + 14 * s, sh[1] + 2 * s], [hip[0] + 20 * s, hip[1] + 18 * s], [hip[0] - 20 * s, hip[1] + 18 * s]], { seed: sd(), fill: o.coat, stroke, width: lw * 0.5, wobble: 0.8, double: false, step: 400 });
    sk.path(pg, [hip, sh, [hc[0], hc[1] + 20 * s]], Object.assign({}, LS, { seed: sd() }));
    sk.path(pg, limb(hip, pz.rhip, pz.rkn, 60, 58), Object.assign({}, LS, { seed: sd() }));
    const ra = limb(sh, pz.rsh + pz.torso, pz.rel, 52, 50);
    sk.path(pg, ra, Object.assign({}, LS, { seed: sd() }));
    sk.circle(pg, hc[0], hc[1], 25 * s, { seed: sd(), fill: o.head || P.mist, stroke, width: lw * 0.75, wobble: 0.6, double: false });
    if (o.hood) sk.path(pg, [[hc[0] - 27 * s, hc[1] + 6 * s], [hc[0] - 22 * s, hc[1] - 20 * s], [hc[0], hc[1] - 29 * s], [hc[0] + 22 * s, hc[1] - 20 * s], [hc[0] + 27 * s, hc[1] + 6 * s]], { seed: sd(), stroke, width: lw * 0.9, wobble: 0.6, double: false, step: 400 });
    if (o.beanie) sk.poly(pg, [[hc[0] - 24 * s, hc[1] - 6 * s], [hc[0] - 18 * s, hc[1] - 24 * s], [hc[0] + 18 * s, hc[1] - 24 * s], [hc[0] + 24 * s, hc[1] - 6 * s]], { seed: sd(), fill: o.beanie, stroke, width: lw * 0.6, wobble: 0.6, double: false, step: 400 });
    return { g: pg, x, y: hip[1], scale: s, hand: ra[2], hip, head: hc, sh };
  }
  function campChair(g, x, gy, s, o) {
    o = o || {};
    const cg = el("g", {}, g);
    if (o.rot) cg.setAttribute("transform", `rotate(${o.rot} ${x} ${gy})`);
    const seatY = gy - 70 * s, w = 70 * s;
    sk.line(cg, x - w / 2, gy, x + w / 2, seatY, DET({ width: 3, stroke: P.ink }));
    sk.line(cg, x + w / 2, gy, x - w / 2, seatY, DET({ width: 3, stroke: P.ink }));
    sk.path(cg, [[x - w / 2 - 4 * s, seatY], [x, seatY + 10 * s], [x + w / 2 + 4 * s, seatY]], DET({ width: 5 * s + 1, stroke: P.ink }));
    sk.poly(cg, [[x - w / 2 - 2 * s, seatY - 4 * s], [x - w / 2 + 4 * s, seatY - 72 * s], [x + w / 2 - 4 * s, seatY - 72 * s], [x + w / 2 + 2 * s, seatY - 4 * s]], D({ fill: o.fill || P.slate, width: 3, step: 400, wobble: 1 }));
    sk.line(cg, x - w / 2, seatY - 40 * s, x + w / 2, seatY - 40 * s, DET({ stroke: P.mist, opacity: 0.6, double: false }));
    // rain pooled in the sling
    el("ellipse", { cx: x, cy: seatY + 5 * s, rx: w * 0.3, ry: 3 * s + 1, fill: P.fog, opacity: 0.5 }, cg);
    sk.line(cg, x - w / 2 - 8 * s, seatY - 26 * s, x - w / 2 + 6 * s, seatY - 26 * s, DET({ width: 3 }));
    sk.line(cg, x + w / 2 - 6 * s, seatY - 26 * s, x + w / 2 + 8 * s, seatY - 26 * s, DET({ width: 3 }));
    sk.circle(cg, x + w / 2 + 10 * s, seatY - 24 * s, 6 * s, DET({ fill: P.steel }));
    return { g: cg, seatY };
  }
  // a dome tent: x = center, gy = ground, w/h; o.door: "closed" | "open"; o.fill, o.fly
  function domeTent(g, x, gy, w, h, o) {
    o = o || {};
    const tg = el("g", { class: "rd-camp-tent" }, g);
    const lw = o.lw || (w > 160 ? LINE.main : 3);
    const fill = o.fill || P.steel, fly = o.fly || P.slate;
    // ground shadow + wet patch
    el("ellipse", { cx: x, cy: gy + 2, rx: w * 0.62, ry: Math.max(4, h * 0.07), fill: P.slate, opacity: 0.45 }, tg);
    // body (dome)
    const dome = [];
    for (let i = 0; i <= 14; i++) { const t = i / 14, a = Math.PI * (1 - t); dome.push([x + Math.cos(a) * w / 2, gy - Math.sin(a) * h * (0.96 + 0.04 * Math.sin(t * 7))]); }
    sk.poly(tg, dome, D({ fill, width: lw, step: 30, wobble: 1 }));
    // rain fly over the top half (darker), with a sagging wet hem
    const flyPts = [];
    for (let i = 0; i <= 12; i++) { const t = 0.12 + 0.76 * (i / 12), a = Math.PI * (1 - t); flyPts.push([x + Math.cos(a) * w / 2 * 1.02, gy - Math.sin(a) * h * 1.02]); }
    const hem = [];
    for (let i = 12; i >= 0; i--) { const t = 0.12 + 0.76 * (i / 12), xx = x + (t - 0.5) * w * 0.92; hem.push([xx, gy - h * 0.42 + Math.sin(i * 1.1) * h * 0.035 + 4]); }
    sk.poly(tg, flyPts.concat(hem), D({ fill: fly, width: Math.max(2, lw - 1), step: 30, wobble: 1 }));
    // pole seams (two crossing arcs)
    [[-0.5, 0.36], [0.5, -0.36]].forEach(([a, b]) => {
      const pts = [];
      for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push([x + (a + (b - a) * t) * w, gy - Math.sin(Math.PI * t) * h * 0.98]); }
      sk.path(tg, pts, DET({ stroke: P.ink, opacity: 0.55, double: false, width: lw > 3 ? 2.5 : 1.6 }));
    });
    // wet sheen streaks
    for (let i = 0; i < 3; i++) sk.line(tg, x - w * 0.28 + i * w * 0.1, gy - h * 0.8 + i * 6, x - w * 0.18 + i * w * 0.1, gy - h * 0.55 + i * 6, DET({ stroke: P.fog, opacity: 0.45, double: false, width: 2 }));
    // door
    const dw = w * 0.34, dh = h * 0.7;
    const door = [[x - dw / 2, gy - 2], [x - dw / 2, gy - dh * 0.55], [x - dw * 0.3, gy - dh * 0.9], [x, gy - dh], [x + dw * 0.3, gy - dh * 0.9], [x + dw / 2, gy - dh * 0.55], [x + dw / 2, gy - 2]];
    if (o.door === "open") {
      sk.poly(tg, door, D({ fill: P.night, width: Math.max(2, lw - 1), step: 400, wobble: 0.8 }));
      // rolled flap tied up at the top + a glimpse of a sleeping bag inside
      sk.poly(tg, [[x - dw * 0.42, gy - dh * 0.86], [x + dw * 0.42, gy - dh * 0.86], [x + dw * 0.36, gy - dh * 0.74], [x - dw * 0.36, gy - dh * 0.74]], D({ fill: fill, width: 2.5, wobble: 0.6, step: 400 }));
      sk.line(tg, x - dw * 0.1, gy - dh * 0.9, x - dw * 0.1, gy - dh * 0.68, DET({ width: 1.5 }));
      sk.poly(tg, [[x - dw * 0.42, gy - 4], [x - dw * 0.3, gy - dh * 0.3], [x + dw * 0.4, gy - dh * 0.26], [x + dw * 0.44, gy - 4]], D({ fill: P.slate, width: 2.5, wobble: 0.8, step: 400 }));
      sk.line(tg, x - dw * 0.2, gy - dh * 0.2, x + dw * 0.3, gy - dh * 0.18, DET({ stroke: P.mist, opacity: 0.6, double: false }));
    } else {
      sk.path(tg, door, DET({ stroke: P.ink, opacity: 0.7, width: Math.max(1.5, lw - 2) }));
      sk.line(tg, x, gy - dh, x + dw * 0.12, gy - 4, DET({ stroke: P.ink, opacity: 0.55, double: false, width: 1.5 })); // zip
    }
    // guy lines + stakes
    [[-1, 0.42], [1, 0.42]].forEach(([sgn, k]) => {
      const ax = x + sgn * w * 0.4, ay = gy - h * k * 1.6;
      sk.line(tg, ax, ay, x + sgn * w * 0.78, gy + 3, DET({ width: 1.5, opacity: 0.75, double: false }));
      sk.line(tg, x + sgn * w * 0.78, gy - 5, x + sgn * w * 0.8, gy + 6, DET({ width: 2.5 }));
    });
    return tg;
  }
  // a parked car seen side-on (small, distant). type: "sedan" | "pickup" | "hatch". facing 1 = nose right
  function car(g, x, gy, w, type, o) {
    o = o || {};
    const cg = el("g", { class: "rd-camp-car" }, g);
    const f = o.facing === -1 ? -1 : 1;
    const X = (u) => x + f * (u - 0.5) * w; // u 0..1 rear→front
    const hh = w * 0.3, body = o.fill || P.mist, lw = 3;
    const wr = w * 0.085;
    el("ellipse", { cx: x, cy: gy + 1, rx: w * 0.52, ry: 5, fill: P.slate, opacity: 0.5 }, cg);
    let shell, cabin;
    if (type === "pickup") {
      shell = [[X(0), gy - wr * 0.9], [X(0), gy - hh * 0.62], [X(0.52), gy - hh * 0.62], [X(0.55), gy - hh], [X(0.78), gy - hh], [X(0.84), gy - hh * 0.62], [X(1), gy - hh * 0.55], [X(1.01), gy - wr * 0.9]];
      cabin = [[X(0.58), gy - hh * 0.92], [X(0.75), gy - hh * 0.92], [X(0.81), gy - hh * 0.64], [X(0.58), gy - hh * 0.64]];
    } else if (type === "hatch") {
      shell = [[X(0), gy - wr * 0.9], [X(0.0), gy - hh * 0.6], [X(0.08), gy - hh * 0.98], [X(0.6), gy - hh], [X(0.78), gy - hh * 0.6], [X(1), gy - hh * 0.52], [X(1.01), gy - wr * 0.9]];
      cabin = [[X(0.12), gy - hh * 0.92], [X(0.56), gy - hh * 0.93], [X(0.72), gy - hh * 0.62], [X(0.08), gy - hh * 0.62]];
    } else {
      shell = [[X(0), gy - wr * 0.9], [X(0), gy - hh * 0.58], [X(0.22), gy - hh * 0.6], [X(0.32), gy - hh], [X(0.66), gy - hh], [X(0.78), gy - hh * 0.6], [X(1), gy - hh * 0.52], [X(1.01), gy - wr * 0.9]];
      cabin = [[X(0.35), gy - hh * 0.92], [X(0.64), gy - hh * 0.92], [X(0.74), gy - hh * 0.62], [X(0.27), gy - hh * 0.62]];
    }
    sk.poly(cg, shell, D({ fill: body, width: lw, step: 30, wobble: 0.8 }));
    sk.poly(cg, cabin, D({ fill: P.slate, width: 2, step: 400, wobble: 0.5 }));
    // fogged windows: pale smears + droplet beads
    sk.line(cg, (cabin[0][0] + cabin[1][0]) / 2 - w * 0.08, cabin[0][1] + hh * 0.12, (cabin[0][0] + cabin[1][0]) / 2 + w * 0.04, cabin[0][1] + hh * 0.08, DET({ stroke: P.fog, opacity: 0.55, double: false }));
    // door seam, handle, side molding
    sk.line(cg, X(type === "pickup" ? 0.66 : 0.5), gy - hh * 0.62, X(type === "pickup" ? 0.66 : 0.5), gy - wr * 1.2, DET({ opacity: 0.6, double: false, width: 1.5 }));
    sk.line(cg, X(0.04), gy - hh * 0.4, X(0.96), gy - hh * 0.38, DET({ stroke: P.steel, opacity: 0.8, double: false, width: 1.5 }));
    if (type === "pickup") {
      sk.line(cg, X(0.04), gy - hh * 0.62, X(0.5), gy - hh * 0.62, DET({ width: 2 }));
      // stuff in the bed under a tarp
      sk.poly(cg, [[X(0.06), gy - hh * 0.62], [X(0.14), gy - hh * 0.86], [X(0.4), gy - hh * 0.9], [X(0.48), gy - hh * 0.62]], D({ fill: P.steel, width: 2, step: 400, wobble: 0.8 }));
    }
    if (o.rack) sk.line(cg, X(0.3), gy - hh - 4, X(0.68), gy - hh - 4, DET({ width: 2.5 }));
    // lights
    sk.rect(cg, Math.min(X(0.97), X(1.0)), gy - hh * 0.52, w * 0.03, hh * 0.12, DET({ fill: P.fog, width: 1.2, double: false }));
    sk.rect(cg, Math.min(X(0.0), X(0.03)), gy - hh * 0.55, w * 0.03, hh * 0.12, DET({ fill: P.storm, width: 1.2, double: false }));
    // wheels sunk a little in the wet grass
    [0.2, 0.8].forEach((u) => {
      sk.circle(cg, X(u), gy - wr * 0.75, wr, DET({ fill: P.night, width: 2.5 }));
      sk.circle(cg, X(u), gy - wr * 0.75, wr * 0.45, DET({ fill: P.steel, width: 1.2, double: false }));
    });
    sk.line(cg, X(0.04), gy + 1, X(0.96), gy + 2, DET({ stroke: P.slate, width: 3, opacity: 0.7, double: false }));
    // beads of rain on the roof line
    for (let i = 0; i < 6; i++) { const u = 0.3 + i * 0.07; el("circle", { cx: X(u), cy: gy - hh + 3 + (i % 2), r: 1.4, fill: P.paper, opacity: 0.7 }, cg); }
    return cg;
  }

  // ------------------------------------------------------------------ SKY (flat, cold dawn overcast)
  const skyG = el("g", { class: "rd-hilltop-camp-sky" }, root);
  el("rect", { x: -20, y: -20, width: 1960, height: 760, fill: lgrad("sky", [[0, P.steel], [0.3, P.mist], [0.52, P.fog], [0.585, P.paper], [0.7, P.fog], [1, P.mist]]) }, skyG);
  // the pale, sunless brightening low over the sea (no glow disc, no rays)
  const rg = el("radialGradient", { id: uid + "dawn" }, defs);
  [[0, P.paper, 0.6], [0.5, P.fog, 0.3], [1, P.fog, 0]].forEach(([o, c, a]) => el("stop", { offset: o, "stop-color": c, "stop-opacity": a }, rg));
  el("ellipse", { cx: 1500, cy: 405, rx: 760, ry: 110, fill: `url(#${uid}dawn)` }, skyG);
  // overcast deck (back to front): long low stratus, low contrast
  stratus(skyG, 980, 330, 900, 50, P.fog, { opacity: 0.55, stroke: P.mist });
  stratus(skyG, -60, 300, 1000, 60, P.mist, { opacity: 0.6, stroke: P.mist });
  stratus(skyG, 1150, 260, 820, 60, P.mist, { opacity: 0.7 });
  stratus(skyG, 400, 220, 900, 70, P.mist, { opacity: 0.75 });
  stratus(skyG, -80, 150, 900, 110, P.mist, { opacity: 0.8, stroke: P.steel });
  stratus(skyG, 760, 120, 1250, 120, P.mist, { opacity: 0.75, stroke: P.steel });
  stratus(skyG, -80, 30, 1100, 120, P.steel, { opacity: 0.9, stroke: P.slate });
  stratus(skyG, 950, 10, 1100, 110, P.steel, { opacity: 0.9, stroke: P.slate });
  stratus(skyG, -80, -60, 2100, 110, P.slate, { opacity: 0.85, stroke: P.slate });
  // pen texture: long horizontal streaks
  for (let i = 0; i < 30; i++) {
    const cx = 20 + rnd(i) * 1860, cy = 60 + rnd(i + 40) * 300, w = 80 + rnd(i + 80) * 220;
    sk.line(skyG, cx, cy, cx + w, cy + 3 * H(i), DET({ stroke: cy > 220 ? P.paper : P.slate, opacity: cy > 220 ? 0.45 : 0.3, double: false, wobble: 1 }));
  }
  // a far drizzle curtain over the sea (scenery)
  for (let i = 0; i < 22; i++) {
    const x = 1300 + i * 13 + rnd(i + 7) * 10;
    sk.line(skyG, x, 340 + rnd(i) * 20, x - 14, 418, DET({ stroke: P.steel, opacity: 0.16, double: false, width: 2 }));
  }
  // a few gulls, far off
  [[1320, 300, 9], [1352, 290, 7], [1610, 318, 8], [740, 270, 7]].forEach(([x, y, s]) => sk.path(skyG, [[x - s, y], [x - s * 0.4, y - s * 0.45], [x, y], [x + s * 0.4, y - s * 0.45], [x + s, y]], DET({ stroke: P.slate, width: 1.8, double: false, wobble: 0.3 })));

  // ------------------------------------------------------------------ FAR: ocean, far hills (as hilltop v1)
  const farG = el("g", { class: "rd-hilltop-camp-far" }, root);
  sk.poly(farG, [[900, HORIZON], [1940, HORIZON], [1940, 600], [900, 600]], D({ fill: P.mist, stroke: P.mist, width: 1, double: false, wobble: 0.5 }));
  el("rect", { x: 900, y: HORIZON, width: 1040, height: 180, fill: lgrad("sea", [[0, P.fog, 0.6], [0.4, P.steel, 0.3], [1, P.steel, 0.7]]) }, farG);
  sk.line(farG, 1000, HORIZON, 1940, HORIZON, DET({ stroke: P.slate, opacity: 0.6, wobble: 0.6 }));
  for (let i = 0; i < 24; i++) {
    const y = HORIZON + 8 + Math.pow(rnd(i + 3), 1.4) * 110, x = 900 + rnd(i + 11) * 1000, w = 30 + rnd(i + 5) * 90 * (1 + (y - HORIZON) / 80);
    sk.line(farG, x, y, x + w, y, DET({ stroke: i % 4 ? P.steel : P.paper, opacity: 0.4, double: false, wobble: 0.5 }));
  }
  const cape = [[560, 520], [700, 462], [820, 440], [930, 428], [1010, 422], [1060, 421], [1090, 424], [1060, 436], [1000, 452], [930, 474], [880, 500], [860, 560], [560, 560]];
  sk.poly(farG, cape, D({ fill: P.fog, stroke: P.mist, width: LINE.detail }));
  for (let i = 0; i < 12; i++) { const x = 720 + i * 28, base = 466 - (x - 720) * 0.12 + 8; fir(farG, x, base, 16 + rnd(i + 44) * 10, 8, { fill: P.mist, stroke: P.mist, width: 1.5, opacity: 0.6, boughs: false, tiers: 3, wobble: 0.4 }); }
  sk.poly(farG, [[-20, 520], [120, 470], [260, 450], [420, 470], [560, 440], [700, 462], [860, 492], [980, 520], [1060, 560], [1060, 700], [-20, 700]], D({ fill: P.fog, stroke: P.mist, width: LINE.detail, opacity: 0.75 }));
  for (let i = 0; i < 30; i++) {
    const x = -10 + i * 36 + rnd(i) * 14, base = 520 - Math.sin((x + 60) / 340) * 50 + 28;
    fir(farG, x, base, 34 + rnd(i + 9) * 22, 16 + rnd(i) * 6, { fill: P.mist, stroke: P.steel, width: 2, opacity: 0.55, boughs: false, tiers: 4, wobble: 0.6 });
  }
  sk.poly(farG, [[-20, 590], [160, 560], [330, 548], [520, 566], [700, 552], [880, 572], [1020, 600], [1100, 640], [1100, 720], [-20, 720]], D({ fill: P.mist, stroke: P.steel, width: LINE.detail, opacity: 0.9 }));
  sk.poly(farG, [[980, 500], [1080, 478], [1180, 470], [1290, 486], [1380, 500], [1460, 514], [1540, 524], [1600, 530], [1600, 560], [980, 560]], D({ fill: P.fog, stroke: P.mist, width: LINE.detail, opacity: 0.8 }));
  for (let i = 0; i < 16; i++) {
    const x = 1000 + i * 34 + rnd(i + 30) * 10, base = 504 + (x - 1000) * 0.05 - Math.sin((x - 980) / 200) * 18;
    fir(farG, x, base, 18 + rnd(i + 2) * 12, 9, { fill: P.mist, stroke: P.steel, width: 1.5, opacity: 0.6, boughs: false, tiers: 3, wobble: 0.4 });
  }
  sk.rect(farG, 1572, 500, 8, 26, DET({ fill: P.paper, stroke: P.steel, double: false }));
  sk.poly(farG, [[1570, 500], [1576, 492], [1582, 500]], DET({ fill: P.steel, stroke: P.steel, double: false }));

  // ------------------------------------------------------------------ VIEW: the flooded lowland, receded a little
  const viewG = el("g", { class: "rd-hilltop-camp-view" }, root);
  sk.poly(viewG, [[900, 528], [1940, 528], [1940, 800], [900, 800]], D({ fill: P.steel, stroke: P.steel, width: 1, double: false }));
  // drowned fields + roads, now partly mud flats
  for (let i = 0; i < 9; i++) sk.line(viewG, 900, 545 + i * 26, 1940, 551 + i * 26, DET({ stroke: P.slate, opacity: 0.45, double: false }));
  for (let i = 0; i < 7; i++) sk.line(viewG, 1150 + i * 110, 530, 1100 + i * 150, 790, DET({ stroke: P.slate, opacity: 0.4, double: false }));
  sk.hatch(viewG, 900, 560, 1040, 240, { seed: sd(), gap: 16, angle: 8, stroke: P.slate, opacity: 0.2 });
  const waterG = el("g", { class: "rd-hilltop-camp-water" }, viewG);
  const emergG = el("g", { class: "rd-hilltop-camp-emergents" }, viewG);
  const ripG = el("g", { class: "rd-hilltop-camp-ripples" }, viewG);
  const emergents = [];
  function emergent(x, yb, w, total, roofH, drawFn) {
    const id = uid + "wl" + emergents.length;
    const cp = el("clipPath", { id }, emergG);
    const r = el("rect", { x: x - w * 3, y: yb - total - 400, width: w * 6, height: 400 + total }, cp);
    const g = el("g", { "clip-path": `url(#${id})` }, emergG);
    drawFn(g);
    const sc = w / 30;
    const base = total - roofH * (0.55 + 0.35 * rnd(x + yb)); // depth at last night's peak (REF)
    // the mud line left by last night's peak, and the darker soaked wall below it
    const wl = yb - base;
    el("rect", { x: x - w * 0.62, y: wl, width: w * 1.24, height: Math.max(0, base), fill: P.night, opacity: 0.28 }, g);
    sk.line(g, x - w * 0.62, wl, x + w * 0.62, wl + H(x) * 1.2, { seed: sd(), stroke: P.night, width: Math.max(1.2, w / 16), opacity: 0.85, wobble: 0.4, double: false });
    emergents.push({ x, yb, w, total, rect: r, base, sc });
  }
  function house(x, yb, w, i) {
    const bh = w * 0.75, rh = w * 0.55, lw = Math.max(1.2, w / 18);
    emergent(x, yb, w, bh + rh, rh, (g) => {
      const wall = i % 3 === 0 ? P.paper : i % 3 === 1 ? P.fog : P.mist;
      const tilt = i % 5 === 3 ? w * 0.12 : 0; // a few shoved off their foundations
      sk.poly(g, [[x - w / 2, yb], [x + w / 2, yb], [x + w / 2 + tilt, yb - bh], [x - w / 2 + tilt, yb - bh]], { seed: sd(), fill: wall, stroke: P.ink, width: lw, wobble: 0.5, double: false, step: 400 });
      const hip = i % 4 === 2;
      const rx = x + tilt;
      sk.poly(g, hip ? [[rx - w / 2 - w * 0.08, yb - bh], [rx - w * 0.2, yb - bh - rh], [rx + w * 0.2, yb - bh - rh], [rx + w / 2 + w * 0.08, yb - bh]] : [[rx - w / 2 - w * 0.08, yb - bh], [rx, yb - bh - rh], [rx + w / 2 + w * 0.08, yb - bh]], { seed: sd(), fill: i % 2 ? P.slate : P.steel, stroke: P.ink, width: lw, wobble: 0.5, double: false, step: 400 });
      if (w > 22) {
        sk.rect(g, rx - w * 0.3, yb - bh * 0.75, w * 0.2, w * 0.2, { seed: sd(), fill: P.storm, stroke: P.ink, width: 1, wobble: 0.3, double: false });
        sk.rect(g, rx + w * 0.1, yb - bh * 0.75, w * 0.2, w * 0.2, { seed: sd(), fill: P.storm, stroke: P.ink, width: 1, wobble: 0.3, double: false });
        if (i % 3 === 1) sk.rect(g, rx + w * 0.18, yb - bh - rh * 0.9, w * 0.12, rh * 0.5, { seed: sd(), fill: P.slate, stroke: P.ink, width: 1, wobble: 0.3, double: false });
        if (i % 4 === 0) sk.line(g, rx - w * 0.1, yb - bh - rh * 0.6, rx + w * 0.25, yb - bh - rh * 0.2, { seed: sd(), stroke: P.ink, width: 1, opacity: 0.6, wobble: 0.3, double: false }); // torn roof
      }
    });
  }
  const rows = [[566, 13, [1250, 1300, 1345, 1420, 1470, 1530]], [590, 17, [1205, 1265, 1330, 1395, 1480, 1560, 1640]],
    [622, 22, [1180, 1250, 1335, 1420, 1515, 1600, 1700, 1790]], [660, 28, [1230, 1330, 1450, 1560, 1680, 1800, 1890]],
    [700, 36, [1390, 1530, 1660, 1790, 1905]]];
  let hi = 0;
  rows.forEach(([yb, w, xs], r) => xs.forEach((x, k) => house(x + 8 * H(r * 10 + k), yb + 4 * H(k + r), w * 1.35 * (0.85 + 0.3 * rnd(r * 9 + k)), hi++)));
  emergent(1372, 640, 30, 120, 70, (g) => {
    sk.rect(g, 1360, 590, 24, 50, D({ fill: P.paper, width: 2, wobble: 0.5, double: false }));
    sk.poly(g, [[1356, 592], [1372, 520], [1388, 592]], D({ fill: P.slate, width: 2, wobble: 0.5, double: false, step: 400 }));
    sk.line(g, 1372, 520, 1372, 506, DET({ double: false }));
    sk.line(g, 1366, 512, 1378, 512, DET({ double: false }));
    sk.rect(g, 1367, 600, 10, 14, DET({ fill: P.storm, width: 1, double: false }));
  });
  emergent(1745, 640, 34, 110, 60, (g) => {
    [1730, 1760].forEach((lx) => sk.line(g, lx, 640, lx + (lx < 1745 ? 4 : -4), 570, DET({ double: false })));
    sk.line(g, 1732, 610, 1758, 580, DET({ double: false, width: 1.5 }));
    sk.rect(g, 1722, 545, 46, 28, D({ fill: P.fog, width: 2, wobble: 0.5, double: false }));
    sk.poly(g, [[1720, 546], [1745, 532], [1770, 546]], D({ fill: P.slate, width: 2, wobble: 0.4, double: false, step: 400 }));
    txt(g, 1745, 566, "GH", { "font-family": GOTHIC, "font-size": 14, fill: P.ink, opacity: 0.8 });
  });
  [[1185, 700, 70], [1290, 690, 60], [1610, 712, 80], [1860, 700, 66], [1130, 640, 50]].forEach(([x, yb, h]) =>
    emergent(x, yb, 22, h, h * 0.55, (g) => fir(g, x, yb, h, h * 0.42, { fill: P.slate, stroke: P.ink, width: 2, tiers: 5, boughs: false, wobble: 0.6 })));
  // power poles, one snapped and leaning
  [1225, 1460, 1700].forEach((x, i) => emergent(x, 680 - i * 6, 10, 80, 30, (g) => {
    const lean = i === 1 ? 14 : 0;
    sk.line(g, x, 680 - i * 6, x + lean, 600 - i * 6, DET({ width: 2.5, double: false }));
    sk.line(g, x - 12 + lean, 608 - i * 6, x + 12 + lean, 606 - i * 6, DET({ double: false }));
  }));
  sk.path(ripG, [[1225, 608], [1340, 626], [1474, 600]], DET({ stroke: P.ink, width: 1.5, opacity: 0.6, double: false }));
  sk.path(ripG, [[1474, 600], [1560, 640], [1600, 652]], DET({ stroke: P.ink, width: 1.5, opacity: 0.6, double: false })); // downed span
  const ripDyn = el("g", {}, ripG);

  let curLevel = L0;
  function setLevel(y) {
    curLevel = y;
    while (waterG.firstChild) waterG.removeChild(waterG.firstChild);
    while (ripDyn.firstChild) ripDyn.removeChild(ripDyn.firstChild);
    const top = [];
    for (let x = 900; x <= 1940; x += 52) top.push([x, y + 2.5 * Math.sin(x / 61) + 1.5 * H(x)]);
    // the muddy brown-gray flood, flat and still this morning
    sk.poly(waterG, top.concat([[1940, 820], [900, 820]]), { seed: 9001, fill: P.slate, stroke: P.ink, width: LINE.detail, wobble: 0.6, opacity: 1, step: 60 });
    el("rect", { x: 900, y: y + 2, width: 1040, height: 30, fill: P.fog, opacity: 0.28 }, waterG);
    // dull sheen streaks (sky reflection)
    for (let i = 0; i < 30; i++) {
      const sy = y + 6 + Math.pow(rnd(i + 200), 1.3) * (820 - y - 10), sx = 930 + rnd(i + 300) * 980, w = 14 + rnd(i + 400) * 60 * (1 + (sy - 520) / 160);
      if (sy > 800) continue;
      sk.line(waterG, sx, sy, sx + w, sy + H(i) * 1.5, { seed: 9100 + i, stroke: i % 5 ? P.mist : P.fog, width: 1.6, opacity: 0.5, wobble: 0.4, double: false });
    }
    // debris lines: long drifting rafts of planks, branches and trash, gathered in bands
    for (let b = 0; b < 5; b++) {
      const by = y + 16 + b * 30 + rnd(b + 33) * 10, bx = 940 + rnd(b + 44) * 300, len = 380 + rnd(b + 55) * 420;
      if (by > 795) continue;
      const pts = [];
      for (let k = 0; k <= 8; k++) pts.push([bx + (len * k) / 8, by + Math.sin(k * 0.9 + b) * 5]);
      sk.path(waterG, pts, { seed: 9300 + b, stroke: P.night, width: 2, opacity: 0.4, wobble: 1.2, double: false, step: 30 });
      for (let k = 0; k < 16; k++) {
        const t = rnd(b * 20 + k + 600), dx = bx + len * t, dy2 = by + Math.sin(t * 8 * 0.9 + b) * 5 + H(k + b) * 3, w = 5 + rnd(k + b * 7) * 12;
        sk.line(waterG, dx, dy2, dx + w, dy2 + H(k * 3 + b) * 4, { seed: 9400 + b * 20 + k, stroke: P.ink, width: k % 3 ? 2 : 3, opacity: 0.75, wobble: 0.4, double: false });
      }
    }
    // a floating roof section and a capsized skiff
    sk.poly(waterG, [[1515, y + 92], [1560, y + 82], [1572, y + 94], [1528, y + 104]], { seed: 9500, fill: P.steel, stroke: P.ink, width: 1.5, wobble: 0.4, double: false });
    sk.path(waterG, [[1268, y + 120], [1282, y + 112], [1306, y + 112], [1316, y + 121]], { seed: 9501, stroke: P.ink, width: 2, fill: P.fog, wobble: 0.3, double: false });
    // per-object waterlines
    emergents.forEach((e) => {
      const under = e.yb > y;
      const depth = under ? Math.max(0, Math.min(e.yb - y, e.base + (REF - y) * 0.55 * e.sc)) : 0;
      const wl = e.yb - depth;
      e.rect.setAttribute("height", Math.max(0, wl - (e.yb - e.total - 400)).toFixed(1));
      if (depth > 0.5) {
        el("ellipse", { cx: e.x, cy: wl, rx: e.w * 0.75, ry: Math.max(1.2, e.w * 0.08), fill: "none", stroke: P.fog, "stroke-width": 1.4, opacity: 0.6 }, ripDyn);
        el("line", { x1: e.x - e.w * 0.6, y1: wl, x2: e.x + e.w * 0.6, y2: wl, stroke: P.ink, "stroke-width": 1.2, opacity: 0.6 }, ripDyn);
      }
    });
  }
  setLevel(opts.level !== undefined ? opts.level : L0);
  // our hill's forested flank, with a band of fresh mud where the water has dropped
  const flankG = el("g", {}, viewG);
  sk.poly(flankG, [[860, 590], [960, 600], [1060, 625], [1150, 662], [1240, 700], [1320, 740], [1320, 820], [860, 820]], D({ fill: P.steel, stroke: P.slate, width: LINE.detail }));
  sk.path(flankG, [[1090, 640], [1180, 676], [1270, 714], [1320, 736]], DET({ stroke: P.slate, width: 7, opacity: 0.6, double: false }));
  for (let i = 0; i < 14; i++) {
    const x = 880 + i * 30 + rnd(i + 70) * 12, base = 610 + Math.max(0, x - 960) * 0.33 + 10;
    fir(flankG, x, base, 50 + rnd(i + 3) * 26, 24, { fill: P.slate, stroke: P.storm, width: 2, tiers: 4, boughs: false, wobble: 0.6, opacity: 0.9 });
  }

  // ------------------------------------------------------------------ SUMMIT GROUND (wet, trampled)
  const groundG = el("g", { class: "rd-hilltop-camp-ground" }, root);
  const crest = [[-20, 662], [200, 646], [420, 652], [640, 642], [860, 648], [1020, 660], [1140, 680], [1260, 704], [1450, 720], [1700, 730], [1940, 738]];
  sk.poly(groundG, crest.concat([[1940, 1100], [-20, 1100]]), D({ fill: P.steel, width: LINE.main, step: 40 }));
  sk.hatch(groundG, 0, 668, 1100, 60, { seed: sd(), gap: 18, angle: 70, stroke: P.slate, opacity: 0.22 });
  sk.path(groundG, [[1150, 690], [1300, 716], [1500, 730], [1700, 740], [1940, 748]], DET({ stroke: P.slate, width: 6, opacity: 0.6, double: false }));
  [[1180, 692, 26], [1340, 722, 18], [1760, 744, 14]].forEach(([x, y, r]) =>
    sk.poly(groundG, [[x - r, y + 6], [x - r * 0.6, y - r * 0.5], [x + r * 0.3, y - r * 0.6], [x + r, y + 6]], D({ fill: P.mist, width: 3, wobble: 1, step: 400 })));
  // foreground band (darker, low detail; the caption bar sits at y >= 940)
  sk.poly(groundG, [[-20, 905], [300, 898], [700, 908], [1100, 900], [1500, 910], [1940, 902], [1940, 1100], [-20, 1100]], D({ fill: P.slate, stroke: P.slate, width: 2, double: false, step: 60 }));
  sk.hatch(groundG, 0, 900, 1920, 40, { seed: sd(), gap: 22, angle: 75, stroke: P.storm, opacity: 0.35 });
  // the trail-head path, now churned mud
  sk.poly(groundG, [[-20, 940], [140, 905], [300, 868], [430, 842], [560, 830], [700, 836], [640, 860], [460, 880], [320, 912], [200, 960], [80, 1010], [-20, 1040]], D({ fill: P.slate, stroke: P.storm, width: LINE.detail, opacity: 0.6, step: 40 }));
  for (let i = 0; i < 9; i++) { const x = 70 + i * 62, y = 958 - i * 15; sk.path(groundG, [[x, y], [x + 10, y - 6], [x + 22, y - 3]], DET({ stroke: P.storm, opacity: 0.55, double: false, width: 2 })); } // boot prints
  // tire ruts across the grass to the parked cars (right)
  [[0, 0], [16, 10]].forEach(([dx, dy]) => sk.path(groundG, [[1000 + dx, 905 + dy], [1150 + dx, 860 + dy], [1300 + dx, 820 + dy], [1420 + dx, 786 + dy], [1540 + dx, 764 + dy]], DET({ stroke: P.slate, width: 5, opacity: 0.45, double: false, step: 24 })));
  // grass tufts (mid-ground: light)
  for (let i = 0; i < 70; i++) {
    const x = rnd(i + 800) * 1920, y = 680 + Math.pow(rnd(i + 900), 0.8) * 220;
    if (y < 650 + (x > 1100 ? (x - 1100) * 0.06 + 30 : 0)) continue;
    const h = 8 + (y - 660) * 0.05;
    sk.path(groundG, [[x - h * 0.5, y - h], [x, y], [x + h * 0.15, y - h * 1.2], [x + 2, y], [x + h * 0.7, y - h * 0.8]], DET({ stroke: P.slate, opacity: 0.55, double: false, wobble: 0.5, step: 400 }));
  }
  // puddles everywhere (pale sky reflections)
  [[300, 878, 70, 9], [1170, 892, 90, 10], [760, 872, 54, 6], [1360, 840, 44, 6], [470, 900, 40, 5], [1000, 812, 36, 5], [1620, 860, 50, 6]].forEach(([x, y, rx, ry]) => {
    el("ellipse", { cx: x, cy: y, rx, ry, fill: P.fog, opacity: 0.45 }, groundG);
    sk.path(groundG, [[x - rx, y], [x - rx * 0.6, y - ry], [x + rx * 0.5, y - ry * 0.9], [x + rx, y], [x + rx * 0.4, y + ry], [x - rx * 0.6, y + ry * 0.9], [x - rx, y]], DET({ stroke: P.slate, opacity: 0.7, double: false }));
    sk.line(groundG, x - rx * 0.4, y - 2, x + rx * 0.2, y - 2, DET({ stroke: P.paper, opacity: 0.6, double: false }));
  });

  // ------------------------------------------------------------------ MID: trees behind the summit (left)
  const treesG = el("g", { class: "rd-hilltop-camp-trees" }, root);
  [[250, 660, 230, 96], [330, 655, 290, 120], [420, 664, 200, 84], [930, 664, 210, 86], [990, 672, 170, 70], [800, 655, 160, 64]].forEach(([x, b, h, w]) =>
    fir(treesG, x, b, h, w, { fill: P.slate, stroke: P.storm, width: 3, opacity: 0.85 }));

  // ------------------------------------------------------------------ BACK TENT (behind the lean-to)
  const tentsG = el("g", { class: "rd-hilltop-camp-tents" }, root);
  const tents = [];
  tents.push({ g: domeTent(tentsG, 455, 702, 120, 62, { fill: P.mist, fly: P.steel, lw: 2.5 }), x: 455, y: 702, w: 120, h: 62 });

  // ------------------------------------------------------------------ FOG (scenes may fade it)
  const fogG = el("g", { class: "rd-hilltop-camp-fog", opacity: FOG }, root);
  const fogBand = lgrad("fogband", [[0, P.paper, 0], [0.45, P.paper, 0.75], [0.6, P.fog, 0.6], [1, P.fog, 0]]);
  const fogSide = lgrad("fogside", [[0, P.paper, 0], [0.25, P.paper, 1], [0.75, P.paper, 1], [1, P.paper, 0]], 1, 0);
  const fogMask = el("mask", { id: uid + "fm" }, defs);
  el("rect", { x: -20, y: 0, width: 1960, height: 1080, fill: fogSide }, fogMask);
  const fogIn = el("g", { mask: `url(#${uid}fm)` }, fogG);
  // lowland fog banks lying on the flood + over the far hills
  [[880, 560, 1080, 70], [1050, 618, 900, 60], [-20, 520, 1100, 70], [960, 470, 1000, 46], [-20, 610, 1000, 80]].forEach(([x, y, w, h]) =>
    el("rect", { x, y, width: w, height: h, fill: fogBand }, fogIn));
  // mist hugging the crest behind the camp
  el("rect", { x: -20, y: 630, width: 1960, height: 90, fill: fogBand, opacity: 0.8 }, fogG);
  // drawn wisps
  [[60, 556, 360], [520, 588, 300], [1120, 600, 420], [1500, 640, 380], [200, 642, 320], [780, 676, 260]].forEach(([x, y, w], i) => {
    sk.path(fogG, [[x, y], [x + w * 0.3, y - 6], [x + w * 0.6, y + 2], [x + w, y - 4]], DET({ stroke: P.paper, width: 3, opacity: 0.55, double: false, step: 30 }));
    sk.path(fogG, [[x + w * 0.15, y + 12], [x + w * 0.5, y + 8], [x + w * 0.85, y + 13]], DET({ stroke: P.paper, width: 2, opacity: 0.4, double: false, step: 30 }));
  });

  // ------------------------------------------------------------------ CARS at the lip (right)
  const carsG = el("g", { class: "rd-hilltop-camp-cars" }, root);
  const cars = [];
  const carA = el("g", {}, carsG), carB = el("g", {}, carsG), carC = el("g", {}, carsG);
  car(carC, 1856, 764, 210, "hatch", { facing: 1, fill: P.mist });
  car(carB, 1652, 752, 200, "pickup", { facing: -1, fill: P.steel });
  car(carA, 1452, 744, 186, "sedan", { facing: 1, fill: P.fog, rack: true });
  // a blanket drying over the sedan's open door / roof
  sk.poly(carA, [[1416, 690], [1480, 688], [1484, 716], [1474, 712], [1462, 720], [1450, 712], [1420, 716]], D({ fill: P.slate, width: 2.5, step: 400, wobble: 0.8 }));
  [1430, 1450, 1470].forEach((x) => sk.line(carA, x, 692, x + 2, 712, DET({ stroke: P.mist, opacity: 0.5, double: false, width: 1.5 })));
  cars.push({ g: carA, x: 1452, y: 744, w: 186 }, { g: carB, x: 1652, y: 752, w: 200 }, { g: carC, x: 1856, y: 764, w: 210 });
  // STAY BACK on a stake at the drop
  const stay = el("g", {}, carsG);
  sk.line(stay, 1318, 760, 1320, 708, D({ width: 5 }));
  sk.rect(stay, 1288, 690, 64, 26, D({ fill: P.paper, width: 2.5, wobble: 0.8 }));
  txt(stay, 1320, 709, "STAY BACK", { "font-family": GOTHIC, "font-size": 16, fill: P.ink }, 52);
  sk.path(stay, [[1322, 722], [1352, 760], [1380, 752]], DET({ stroke: P.fog, width: 3, opacity: 0.8, double: false })); // flagging tape

  // ------------------------------------------------------------------ CLOTHESLINE behind the table
  const lineG = el("g", { class: "rd-hilltop-camp-line" }, root);
  const CL = { x0: 1104, x1: 1338, y: 664 };
  sk.line(lineG, CL.x0, 728, CL.x0 + 2, CL.y - 6, D({ width: 4 }));
  sk.line(lineG, CL.x1, 734, CL.x1 - 2, CL.y - 2, D({ width: 4 }));
  const sag = (x) => CL.y + Math.sin(((x - CL.x0) / (CL.x1 - CL.x0)) * Math.PI) * 10;
  const linePts = [];
  for (let x = CL.x0; x <= CL.x1; x += 18) linePts.push([x, sag(x)]);
  sk.path(lineG, linePts, DET({ width: 1.8, step: 12 }));
  // hung things: [x0, x1, drop, kind]
  [[1114, 1170, 62, "blanket"], [1178, 1202, 34, "shirt"], [1210, 1240, 46, "jeans"], [1250, 1318, 66, "blanket2"]].forEach(([a, b, drop, kind]) => {
    const ya = sag(a), yb = sag(b);
    if (kind === "shirt") {
      sk.poly(lineG, [[a, ya], [b, yb], [b + 6, yb + 10], [b - 2, yb + 12], [b - 2, yb + drop], [a + 2, ya + drop], [a + 2, ya + 12], [a - 6, ya + 10]], D({ fill: P.fog, width: 2, step: 400, wobble: 0.6 }));
    } else if (kind === "jeans") {
      const m = (a + b) / 2;
      sk.poly(lineG, [[a, ya], [b, yb], [b + 2, yb + drop], [m + 3, yb + drop], [m, ya + 14], [m - 3, ya + drop], [a - 2, ya + drop]], D({ fill: P.slate, width: 2, step: 400, wobble: 0.6 }));
    } else {
      const fill = kind === "blanket" ? P.mist : P.steel;
      sk.poly(lineG, [[a, ya], [b, yb], [b + 2, yb + drop], [b - (b - a) * 0.3, yb + drop + 5], [a + (b - a) * 0.3, ya + drop - 2], [a - 2, ya + drop + 3]], D({ fill, width: 2.5, step: 400, wobble: 0.8 }));
      // plaid / stripes on the blankets
      for (let k = 1; k < 4; k++) sk.line(lineG, a + 2, ya + (drop * k) / 4, b - 2, yb + (drop * k) / 4, DET({ stroke: kind === "blanket" ? P.steel : P.slate, opacity: 0.7, double: false, width: 1.5 }));
      if (kind === "blanket") for (let k = 1; k < 3; k++) sk.line(lineG, a + ((b - a) * k) / 3, ya + 2, a + ((b - a) * k) / 3, ya + drop - 2, DET({ stroke: P.steel, opacity: 0.6, double: false, width: 1.5 }));
    }
    // drips off the hems
    for (let k = 0; k < 2; k++) { const dx = a + (b - a) * (0.3 + 0.4 * k); el("ellipse", { cx: dx, cy: (ya + yb) / 2 + drop + 9 + k * 4, rx: 1.4, ry: 2.6, fill: P.fog, opacity: 0.8 }, lineG); }
    // clothespins
    [a + 4, b - 4].forEach((px) => sk.line(lineG, px, sag(px) - 4, px, sag(px) + 6, DET({ width: 2.5, double: false })));
  });

  // ------------------------------------------------------------------ WATER TANK (left) — cracked, taped, leaking
  const tankG = el("g", { class: "rd-hilltop-camp-tank" }, root);
  const TX = 252;
  [[200, 818], [304, 818], [214, 806], [292, 806]].forEach(([x, y]) => sk.line(tankG, x, y, x + (x < TX ? 8 : -8), 760, D({ width: 5 })));
  sk.line(tankG, 208, 790, 296, 770, DET({}));
  sk.line(tankG, 208, 770, 296, 790, DET({}));
  sk.rect(tankG, 188, 752, 128, 14, D({ fill: P.slate, width: 3 }));
  sk.poly(tankG, [[196, 752], [194, 616], [310, 616], [308, 752]], D({ fill: P.fog, width: LINE.main }));
  el("ellipse", { cx: TX, cy: 616, rx: 58, ry: 12, fill: P.paper, stroke: P.ink, "stroke-width": 3 }, tankG);
  el("ellipse", { cx: TX, cy: 615, rx: 16, ry: 5, fill: P.mist, stroke: P.ink, "stroke-width": 2 }, tankG);
  for (let i = 0; i < 5; i++) sk.path(tankG, [[196, 640 + i * 24], [TX, 646 + i * 24], [308, 640 + i * 24]], DET({ stroke: P.steel, opacity: 0.8, double: false }));
  sk.hatch(tankG, 276, 620, 32, 130, { seed: sd(), gap: 9, angle: 60, stroke: P.steel, opacity: 0.5 });
  txt(tankG, TX - 8, 700, "POTABLE", { "font-family": GOTHIC, "font-size": 22, fill: P.slate }, 70);
  txt(tankG, TX - 8, 724, "WATER", { "font-family": GOTHIC, "font-size": 22, fill: P.slate }, 56);
  // the crack (zig-zag down the right shoulder), a wet stain running from it, duct-tape X, a scrawled note
  const CRX = 282, CRY = 668;
  el("path", { d: `M${CRX - 6} 636 L${CRX + 2} 648 L${CRX - 4} 658 L${CRX + 4} 668 L${CRX - 2} 682 L${CRX + 6} 694 L${CRX + 1} 706`, fill: P.storm, stroke: "none", opacity: 0.15 }, tankG);
  sk.path(tankG, [[CRX - 6, 636], [CRX + 2, 648], [CRX - 4, 658], [CRX + 4, 668], [CRX - 2, 682], [CRX + 6, 694], [CRX + 1, 706]], DET({ stroke: P.ink, width: 3, step: 400, wobble: 0.4 }));
  sk.line(tankG, CRX + 2, 648, CRX + 12, 652, DET({ width: 1.5, double: false }));
  sk.line(tankG, CRX - 2, 682, CRX - 12, 690, DET({ width: 1.5, double: false }));
  el("path", { d: `M${CRX - 4} 700 Q${CRX + 2} 726 ${CRX - 2} 752 L${CRX + 12} 752 Q${CRX + 10} 724 ${CRX + 6} 698 Z`, fill: P.steel, opacity: 0.55 }, tankG);
  sk.poly(tankG, [[CRX - 16, 654], [CRX + 14, 680], [CRX + 18, 674], [CRX - 12, 648]], DET({ fill: P.mist, width: 1.5, wobble: 0.4 }));
  sk.poly(tankG, [[CRX - 14, 680], [CRX + 16, 652], [CRX + 20, 658], [CRX - 10, 686]], DET({ fill: P.mist, width: 1.5, wobble: 0.4 }));
  const note = el("g", { transform: `rotate(-6 214 650)` }, tankG);
  sk.rect(note, 200, 632, 50, 30, D({ fill: P.paper, width: 2, wobble: 0.6 }));
  txt(note, 225, 652, "LEAK!", { "font-family": HAND, "font-weight": 700, "font-size": 15, fill: P.ink }, 40);
  // spigot, jugs (one tipped, empty), and the wet patch + puddle below the crack
  sk.path(tankG, [[300, 738], [318, 738], [318, 748]], D({ width: 4 }));
  el("ellipse", { cx: 286, cy: 822, rx: 54, ry: 8, fill: P.fog, opacity: 0.5 }, tankG);
  sk.path(tankG, [[234, 822], [262, 814], [314, 816], [340, 824], [300, 830], [250, 830], [234, 822]], DET({ stroke: P.slate, opacity: 0.7, double: false }));
  sk.rect(tankG, 168, 788, 24, 30, D({ fill: P.mist, width: 2.5, wobble: 0.6 }));
  sk.poly(tankG, [[318, 812], [348, 806], [352, 822], [322, 828]], D({ fill: P.fog, width: 2.5, wobble: 0.6, step: 400 }));
  sk.rect(tankG, 148, 794, 22, 26, D({ fill: P.fog, width: 2.5, wobble: 0.6 }));

  // ------------------------------------------------------------------ CANOPY + TARP LEAN-TO (as hilltop v1, wet)
  const canopyG = el("g", { class: "rd-hilltop-camp-canopy" }, root);
  const C = { x0: 500, x1: 880, cx: 690, eave: 548, peak: 452, base: 835 };
  sk.poly(canopyG, [[512, 556], [540, 532], [392, 760], [356, 790]], D({ fill: P.slate, width: LINE.main }));
  for (let i = 1; i < 4; i++) sk.line(canopyG, 512 + i * 7, 556 - i * 6, 356 + i * 9, 790 - i * 7.5, DET({ stroke: P.storm, opacity: 0.7, double: false }));
  sk.hatch(canopyG, 380, 600, 140, 180, { seed: sd(), gap: 11, angle: -30, stroke: P.ink, opacity: 0.2 });
  [[356, 790], [392, 760]].forEach(([x, y]) => { sk.line(canopyG, x, y, x - 34, y + 38, DET({})); sk.line(canopyG, x - 38, y + 34, x - 30, y + 44, DET({ width: 3 })); });
  sk.line(canopyG, 410, 735, 410, 800, D({ width: 4 }));
  // under the lean-to: crates and two bedrolls, someone's boots
  sk.rect(canopyG, 430, 772, 56, 40, D({ fill: P.steel, width: 3 }));
  sk.rect(canopyG, 440, 740, 44, 32, D({ fill: P.mist, width: 3 }));
  txt(canopyG, 458, 798, "SUPPLIES", { "font-family": GOTHIC, "font-size": 12, fill: P.ink }, 44);
  sk.line(canopyG, 450, 756, 474, 756, DET({ stroke: P.ink }));
  sk.poly(canopyG, [[372, 816], [430, 806], [436, 822], [376, 830]], D({ fill: P.slate, width: 2.5, wobble: 0.8, step: 400 }));
  sk.circle(canopyG, 432, 814, 8, DET({ fill: P.steel }));
  // back legs
  sk.line(canopyG, 540, 800, 540, 560, D({ width: 3, opacity: 0.7 }));
  sk.line(canopyG, 840, 800, 840, 560, D({ width: 3, opacity: 0.7 }));
  // folding table: jugs (mostly empty now), radio, first-aid box, a stack of foil blankets
  sk.poly(canopyG, [[570, 722], [810, 722], [816, 734], [566, 734]], D({ fill: P.mist, width: 3 }));
  [[584, 734], [800, 734]].forEach(([x, y]) => sk.line(canopyG, x, y, x + (x < 690 ? -6 : 6), 805, D({ width: 3 })));
  sk.rect(canopyG, 690, 700, 26, 22, D({ fill: P.steel, width: 2.5 }));
  sk.line(canopyG, 712, 700, 718, 680, DET({}));
  const aid = el("g", {}, canopyG);
  sk.rect(aid, 728, 694, 44, 28, D({ fill: P.slate, width: 2.5 }));
  sk.rect(aid, 745, 698, 10, 20, { seed: sd(), fill: P.paper, stroke: P.paper, width: 1, double: false, wobble: 0.3 });
  sk.rect(aid, 740, 703, 20, 10, { seed: sd(), fill: P.paper, stroke: P.paper, width: 1, double: false, wobble: 0.3 });
  sk.poly(canopyG, [[778, 716], [806, 712], [808, 721], [780, 724]], DET({ fill: P.paper }));
  sk.rect(canopyG, 646, 702, 24, 20, D({ fill: P.fog, width: 2.5, wobble: 0.6 }));
  sk.poly(canopyG, [[612, 720], [640, 716], [642, 722], [612, 724]], DET({ fill: P.fog })); // tipped empty jug
  // paper sign taped to the table front
  sk.rect(canopyG, 648, 738, 84, 34, D({ fill: P.paper, width: 2.5, wobble: 0.6 }));
  txt(canopyG, 690, 761, "SIGN IN HERE", { "font-family": HAND, "font-weight": 700, "font-size": 14, fill: P.ink }, 70);
  // the MISSING-PERSONS whiteboard hung in the left bay (zip-tied to the truss)
  const BD = { x: 568, y: 604, w: 112, h: 92 };
  sk.line(canopyG, BD.x + 10, 590, BD.x + 12, BD.y + 2, DET({ width: 1.5 }));
  sk.line(canopyG, BD.x + BD.w - 10, 590, BD.x + BD.w - 12, BD.y + 2, DET({ width: 1.5 }));
  sk.rect(canopyG, BD.x, BD.y, BD.w, BD.h, D({ fill: P.paper, width: 3, wobble: 0.6 }));
  sk.rect(canopyG, BD.x + 4, BD.y + 4, BD.w - 8, BD.h - 8, DET({ stroke: P.mist, width: 1.5, double: false }));
  txt(canopyG, BD.x + 32, BD.y + 18, "MISSING", { "font-family": HAND, "font-weight": 700, "font-size": 13, fill: P.ink }, 50);
  txt(canopyG, BD.x + 86, BD.y + 18, "SAFE", { "font-family": HAND, "font-weight": 700, "font-size": 13, fill: P.ink }, 30);
  sk.line(canopyG, BD.x + 64, BD.y + 8, BD.x + 64, BD.y + BD.h - 8, DET({ width: 1.5, double: false }));
  // photos pinned under MISSING (tiny faces), names under SAFE (ticks)
  [[BD.x + 10, BD.y + 26], [BD.x + 36, BD.y + 26], [BD.x + 10, BD.y + 56], [BD.x + 36, BD.y + 58]].forEach(([px, py], k) => {
    const pg = el("g", { transform: `rotate(${(k % 2 ? 4 : -5)} ${px + 10} ${py + 12})` }, canopyG);
    sk.rect(pg, px, py, 20, 24, DET({ fill: P.fog, width: 1.5, wobble: 0.3 }));
    sk.circle(pg, px + 10, py + 10, 5, { seed: sd(), fill: P.mist, stroke: P.ink, width: 1, wobble: 0.2, double: false });
    sk.line(pg, px + 4, py + 21, px + 16, py + 21, { seed: sd(), stroke: P.ink, width: 2, double: false, wobble: 0.2 });
    el("circle", { cx: px + 10, cy: py + 1, r: 2, fill: P.storm }, pg);
  });
  for (let k = 0; k < 6; k++) {
    const yy = BD.y + 30 + k * 10;
    sk.line(canopyG, BD.x + 70, yy, BD.x + 92 + (k % 3) * 4, yy, { seed: sd(), stroke: P.slate, width: 1.4, double: false, wobble: 0.4 });
    sk.path(canopyG, [[BD.x + 96 + (k % 3) * 4, yy - 2], [BD.x + 99 + (k % 3) * 4, yy + 1], [BD.x + 104 + (k % 3) * 4, yy - 5]], { seed: sd(), stroke: P.ink, width: 1.4, double: false, wobble: 0.2 });
  }
  // scissor truss under the valance
  [[C.x0, C.x0 + 190], [C.x0 + 190, C.x1]].forEach(([a, b]) => {
    sk.line(canopyG, a, 586, b, 614, DET({ width: 3, opacity: 0.85 }));
    sk.line(canopyG, a, 614, b, 586, DET({ width: 3, opacity: 0.85 }));
  });
  // front legs (+ sandbag weights)
  [C.x0, C.x1].forEach((x) => {
    sk.line(canopyG, x, 570, x, C.base, D({ width: 7 }));
    sk.poly(canopyG, [[x - 22, C.base + 2], [x - 18, C.base - 16], [x + 18, C.base - 16], [x + 22, C.base + 2]], D({ fill: P.slate, width: 3, wobble: 1 }));
  });
  // notices stapled to the right leg (soggy, curling)
  sk.poly(canopyG, [[C.x1 + 6, 640], [C.x1 + 46, 638], [C.x1 + 48, 690], [C.x1 + 30, 696], [C.x1 + 8, 692]], D({ fill: P.paper, width: 2, wobble: 0.7, step: 400 }));
  txt(canopyG, C.x1 + 27, 654, "BOIL", { "font-family": HAND, "font-weight": 700, "font-size": 11, fill: P.ink }, 26);
  txt(canopyG, C.x1 + 27, 666, "WATER", { "font-family": HAND, "font-weight": 700, "font-size": 11, fill: P.ink }, 32);
  for (let i = 0; i < 3; i++) sk.line(canopyG, C.x1 + 12, 674 + i * 6, C.x1 + 40 - (i % 2) * 8, 674 + i * 6, DET({ width: 1.2, opacity: 0.7, double: false }));
  sk.rect(canopyG, C.x1 + 10, 700, 32, 26, D({ fill: P.fog, width: 2, wobble: 0.7 }));
  for (let i = 0; i < 3; i++) sk.line(canopyG, C.x1 + 14, 708 + i * 6, C.x1 + 36, 708 + i * 6, DET({ width: 1.2, opacity: 0.6, double: false }));
  // roof — with a rain pocket sagging the left panel
  sk.poly(canopyG, [[C.x0 - 34, C.eave], [C.cx, C.peak], [C.x1 + 34, C.eave]], D({ fill: P.steel, width: LINE.main }));
  [[C.x0 + 80, C.eave], [C.cx, C.eave], [C.x1 - 80, C.eave]].forEach(([x, y]) => sk.line(canopyG, C.cx, C.peak + 4, x, y, DET({ stroke: P.ink, opacity: 0.55, double: false })));
  sk.hatch(canopyG, C.cx, C.peak, 230, 96, { seed: sd(), gap: 10, angle: 120, stroke: P.storm, opacity: 0.28 });
  sk.path(canopyG, [[560, 528], [600, 520], [640, 527]], DET({ stroke: P.storm, opacity: 0.8, double: false, width: 2.5 }));
  el("ellipse", { cx: 600, cy: 530, rx: 36, ry: 7, fill: P.mist, opacity: 0.45 }, canopyG);
  sk.line(canopyG, 586, 529, 606, 528, DET({ stroke: P.paper, opacity: 0.6, double: false, width: 1.5 }));
  // valance + lettering
  const val = [[C.x0 - 34, C.eave], [C.x1 + 34, C.eave]];
  for (let i = 0; i <= 10; i++) { const x = C.x1 + 34 - (i * (C.x1 - C.x0 + 68)) / 10; val.push([x, 584 + (i % 2) * 8]); }
  sk.poly(canopyG, val, D({ fill: P.slate, width: 3, step: 60 }));
  txt(canopyG, C.cx, 576, "GULL HARBOR  CERT  RELIEF", { "font-family": GOTHIC, "font-size": 24, fill: P.paper }, 330);
  // drips hanging from the scallops
  for (let i = 0; i < 11; i++) {
    const x = C.x0 - 30 + i * 41 + rnd(i + 70) * 6, y0 = 588 + (i % 2) * 8;
    el("path", { d: `M${x} ${y0 + 2} q -2.6 6 0 8 q 2.6 -2 0 -8 z`, fill: P.fog, stroke: P.slate, "stroke-width": 0.8, opacity: 0.9 }, canopyG);
  }
  // lantern (cold now, out of fuel)
  sk.line(canopyG, C.cx + 60, 592, C.cx + 60, 620, DET({}));
  sk.rect(canopyG, C.cx + 50, 620, 20, 26, D({ fill: P.mist, width: 2.5, wobble: 0.5 }));
  // guy line to stake
  sk.line(canopyG, C.x1 + 34, C.eave, C.x1 + 96, C.base - 6, DET({ opacity: 0.8 }));
  sk.line(canopyG, C.x1 + 90, C.base - 12, C.x1 + 100, C.base, DET({ width: 3 }));
  // camp chairs by the canopy (one blown over in the night)
  campChair(canopyG, 812, 840, 0.62, { fill: P.slate });
  const chairB = campChair(canopyG, 556, 846, 0.6, { fill: P.storm });
  sk.poly(canopyG, [[536, chairB.seatY - 6], [576, chairB.seatY - 8], [574, chairB.seatY + 2], [538, chairB.seatY + 4]], DET({ fill: P.mist }));

  // ------------------------------------------------------------------ ASSEMBLY AREA SIGN (as hilltop v1)
  const signG = el("g", { class: "rd-hilltop-camp-sign" }, root);
  const SX = 1015, SY = 520, SW = 200, SH = 180;
  [SX - 70, SX + 70].forEach((x) => sk.line(signG, x, SY + 20, x + H(x) * 2, 818, D({ width: 8 })));
  [SX - 70, SX + 70].forEach((x) => sk.line(signG, x - 2, 760, x + 2, 812, DET({ stroke: P.mist, opacity: 0.5, double: false })));
  sk.rect(signG, SX - SW / 2, SY, SW, SH, D({ fill: P.steel, width: LINE.main }));
  sk.rect(signG, SX - SW / 2 + 9, SY + 9, SW - 18, SH - 18, DET({ stroke: P.paper, width: 3, double: false }));
  const pic = el("g", {}, signG);
  sk.circle(pic, SX, SY + 50, 30, DET({ stroke: P.paper, width: 3, fill: P.storm }));
  [[SX - 14, 1], [SX, 1.2], [SX + 13, 0.8]].forEach(([x, k]) => {
    sk.circle(pic, x, SY + 42 - k * 3, 4 * k, { seed: sd(), fill: P.paper, stroke: P.paper, width: 1, double: false, wobble: 0.2 });
    sk.line(pic, x, SY + 48 - k * 2, x, SY + 64, { seed: sd(), stroke: P.paper, width: 5 * k, double: false, wobble: 0.2 });
  });
  txt(signG, SX, SY + 120, "ASSEMBLY", { "font-family": GOTHIC, "font-size": 44, fill: P.paper }, 150);
  txt(signG, SX, SY + 152, "AREA", { "font-family": GOTHIC, "font-size": 36, fill: P.paper }, 80);
  txt(signG, SX, SY + 168, "TSUNAMI SAFE ZONE · ELEV 210 FT", { "font-family": GOTHIC, "font-size": 12, fill: P.fog }, 160);
  sk.hatch(signG, SX + 40, SY + 4, 58, SH - 8, { seed: sd(), gap: 9, angle: 60, stroke: P.ink, opacity: 0.15 });
  [[SX - 88, SY + 12], [SX + 86, SY + 12], [SX - 88, SY + 166], [SX + 86, SY + 166]].forEach(([x, y]) => sk.circle(signG, x, y, 3, DET({ fill: P.mist, width: 1, double: false })));
  // water beads running down the face
  [[SX - 60, SY + 80, 30], [SX + 70, SY + 30, 40], [SX + 20, SY + 128, 22]].forEach(([x, y, l]) => sk.line(signG, x, y, x + 1, y + l, DET({ stroke: P.fog, opacity: 0.5, double: false, width: 1.5 })));

  // ------------------------------------------------------------------ PICNIC TABLE (as hilltop v1; top kept clear)
  const tableG = el("g", { class: "rd-hilltop-camp-table" }, root);
  const T = { x0: 1085, x1: 1345, top: 742, ground: 818 };
  sk.poly(tableG, [[T.x0 + 18, 752], [T.x1 + 6, 752], [T.x1 + 10, 760], [T.x0 + 14, 760]], D({ fill: P.slate, width: 3 }));
  [T.x0 + 40, T.x1 - 40].forEach((x) => {
    sk.line(tableG, x - 26, T.ground, x + 10, T.top + 10, D({ width: 5 }));
    sk.line(tableG, x + 34, T.ground, x - 4, T.top + 10, D({ width: 5 }));
    sk.line(tableG, x - 36, 786, x + 44, 786, D({ width: 4 }));
  });
  // supplies stashed under the table, under a sheet of plastic
  sk.poly(tableG, [[1150, 818], [1170, 790], [1250, 788], [1272, 818]], D({ fill: P.mist, width: 2.5, step: 400, wobble: 1 }));
  sk.line(tableG, 1170, 800, 1250, 798, DET({ stroke: P.steel, opacity: 0.7, double: false }));
  sk.poly(tableG, [[T.x0, T.top - 8], [T.x1 - 10, T.top - 8], [T.x1, T.top + 8], [T.x0 + 12, T.top + 8]], D({ fill: P.mist, width: LINE.main }));
  sk.line(tableG, T.x0 + 6, T.top, T.x1 - 4, T.top, DET({ opacity: 0.6, double: false }));
  for (let i = 0; i < 8; i++) sk.line(tableG, T.x0 + 20 + i * 30, T.top - 4 + (i % 2) * 8, T.x0 + 40 + i * 30, T.top - 4 + (i % 2) * 8, DET({ stroke: P.steel, opacity: 0.8, double: false }));
  // standing water + beads on the boards
  el("ellipse", { cx: 1240, cy: T.top - 1, rx: 40, ry: 3, fill: P.fog, opacity: 0.5 }, tableG);
  sk.rect(tableG, T.x0 + 6, T.top + 8, T.x1 - T.x0 - 4, 9, D({ fill: P.steel, width: 3 }));
  sk.poly(tableG, [[T.x0 - 4, 780], [T.x1 + 18, 780], [T.x1 + 22, 792], [T.x0, 792]], D({ fill: P.mist, width: 3 }));
  for (let i = 0; i < 6; i++) sk.line(tableG, T.x0 + 20 + i * 44, 785, T.x0 + 44 + i * 44, 785, DET({ stroke: P.steel, opacity: 0.8, double: false }));
  // left end: two shrink-wrapped cases of bottled water + clipboard
  [[1092, 712, 46, 26], [1098, 690, 40, 22]].forEach(([x, y, w, h]) => {
    sk.rect(tableG, x, y, w, h, D({ fill: P.fog, width: 2.5, wobble: 0.6 }));
    for (let k = 1; k < 5; k++) sk.line(tableG, x + (w * k) / 5, y + 3, x + (w * k) / 5, y + h - 3, DET({ stroke: P.steel, opacity: 0.6, double: false, width: 1.2 }));
    sk.line(tableG, x + 2, y + h * 0.5, x + w - 2, y + h * 0.5, DET({ stroke: P.paper, opacity: 0.8, double: false, width: 1.5 }));
  });
  sk.poly(tableG, [[1144, 734], [1172, 730], [1176, 738], [1146, 742]], DET({ fill: P.paper }));

  // ------------------------------------------------------------------ MORE TENTS (mid right + front right)
  const tents2G = el("g", { class: "rd-hilltop-camp-tents-front" }, root);
  tents.push({ g: domeTent(tents2G, 1530, 800, 140, 74, { fill: P.mist, fly: P.slate, lw: 3 }), x: 1530, y: 800, w: 140, h: 74 });
  // gear outside it: boots, a pot, a crate
  sk.rect(tents2G, 1608, 778, 28, 22, D({ fill: P.steel, width: 2.5, wobble: 0.6 }));
  sk.poly(tents2G, [[1446, 800], [1450, 786], [1462, 786], [1468, 800]], DET({ fill: P.slate }));
  sk.poly(tents2G, [[1470, 800], [1474, 786], [1486, 786], [1492, 800]], DET({ fill: P.slate }));
  tents.push({ g: domeTent(tents2G, 1722, 905, 236, 124, { door: "open", fill: P.mist, fly: P.steel }), x: 1722, y: 905, w: 236, h: 124 });

  // ------------------------------------------------------------------ LEAN-TO + COLD FIRE RING (left foreground)
  const fireG = el("g", { class: "rd-hilltop-camp-fire" }, root);
  // a second tarp shelter: an A-frame over a ridge line tied from the tank frame to a stake, bedroll inside
  sk.line(fireG, 196, 790, 262, 892, DET({ width: 1.5, opacity: 0.8 })); // ridge line to the front stake
  sk.poly(fireG, [[110, 892], [192, 784], [204, 790], [150, 892]], D({ fill: P.slate, width: 3, step: 60 })); // far side, seen inside
  sk.poly(fireG, [[150, 892], [204, 790], [252, 892]], D({ fill: P.night, width: 3, step: 60 })); // dark opening
  sk.poly(fireG, [[160, 892], [204, 806], [200, 892]], { seed: sd(), fill: P.storm, stroke: "none", double: false, wobble: 0.5 });
  sk.poly(fireG, [[172, 892], [190, 874], [236, 876], [244, 892]], D({ fill: P.steel, width: 2.5, wobble: 0.8, step: 400 })); // bedroll
  sk.poly(fireG, [[204, 790], [282, 822], [300, 900], [252, 892]], D({ fill: P.steel, width: 3, step: 60 })); // near panel (blowing back)
  for (let i = 1; i < 4; i++) sk.line(fireG, 204 + i * 18, 790 + i * 7, 252 + i * 14, 892 + i * 2, DET({ stroke: P.slate, opacity: 0.6, double: false }));
  sk.hatch(fireG, 110, 790, 190, 110, { seed: sd(), gap: 11, angle: -60, stroke: P.ink, opacity: 0.12 });
  [[110, 892], [300, 900]].forEach(([x, y]) => sk.line(fireG, x - 6, y - 8, x + 4, y + 8, DET({ width: 3 })));
  el("ellipse", { cx: 284, cy: 905, rx: 22, ry: 4, fill: P.fog, opacity: 0.5 }, fireG); // drip puddle off the hem
  // the ring: stones, charred logs, ash; a thin smoke still rising
  const FX = 392, FY = 888;
  el("ellipse", { cx: FX, cy: FY + 2, rx: 60, ry: 14, fill: P.storm, opacity: 0.85 }, fireG);
  sk.line(fireG, FX - 28, FY + 2, FX + 18, FY - 6, D({ width: 6, stroke: P.night }));
  sk.line(fireG, FX - 10, FY - 6, FX + 30, FY + 4, D({ width: 5, stroke: P.night }));
  sk.line(fireG, FX - 18, FY - 4, FX - 4, FY - 1, DET({ stroke: P.mist, opacity: 0.7, double: false })); // ash
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2, sx = FX + Math.cos(a) * 64, sy = FY + Math.sin(a) * 16, r = 10 + rnd(i + 900) * 5;
    sk.poly(fireG, [[sx - r, sy + r * 0.4], [sx - r * 0.7, sy - r * 0.6], [sx + r * 0.4, sy - r * 0.7], [sx + r, sy + r * 0.3], [sx + r * 0.3, sy + r * 0.7]], D({ fill: i % 2 ? P.mist : P.steel, width: 2.5, wobble: 0.6, step: 400 }));
  }
  const smokeG = el("g", { class: "rd-hilltop-camp-smoke", opacity: 0.85 }, fireG);
  sk.path(smokeG, [[FX - 4, FY - 10], [FX - 12, FY - 50], [FX + 4, FY - 96], [FX - 8, FY - 140], [FX + 12, FY - 186], [FX + 2, FY - 230]], DET({ stroke: P.fog, width: 7, opacity: 0.55, double: false, step: 14 }));
  sk.path(smokeG, [[FX + 6, FY - 14], [FX + 2, FY - 60], [FX + 16, FY - 110], [FX + 8, FY - 160]], DET({ stroke: P.paper, width: 3, opacity: 0.5, double: false, step: 14 }));
  // a log seat and an empty chair pulled up to the ring
  sk.poly(fireG, [[452, 900], [456, 884], [524, 880], [530, 896]], D({ fill: P.steel, width: 3, wobble: 0.8, step: 400 }));
  sk.circle(fireG, 527, 888, 8, DET({ fill: P.mist }));

  // ------------------------------------------------------------------ CROWD (optional townspeople, muted gray)
  const crowdG = el("g", { class: "rd-hilltop-camp-crowd" }, root);
  const members = [];
  if (showCrowd) {
    const add = (m, pose) => { m.pose = pose; members.push(m); return m; };
    // volunteer at the sign-in table, clipboard
    const vol = add(person(crowdG, 620, 832, 0.62, RD.mix("talk", { rsh: 50, rel: 70 }), { facing: 1, coat: P.steel, hood: true }), "talk");
    sk.rect(crowdG, vol.hand[0] - 6, vol.hand[1] - 20, 16, 22, DET({ fill: P.paper, width: 1.5 }));
    // neighbor asleep in the camp chair under a blanket
    const sl = add(person(crowdG, 812, 840 - 50 * 0.62, 0.6, RD.mix("sit", { head: 30, lsh: 40, lel: 110, rsh: 50, rel: 100 }), { facing: -1, coat: P.slate, beanie: P.steel }), "sit");
    sk.poly(crowdG, [[sl.sh[0] - 22, sl.sh[1] - 2], [sl.sh[0] + 22, sl.sh[1] - 4], [sl.hip[0] + 30, sl.hip[1] + 40], [sl.hip[0] - 34, sl.hip[1] + 44]], D({ fill: P.mist, stroke: P.slate, width: 3, step: 400, wobble: 1 }));
    // someone at the cracked tank, empty jug, scratching head
    const filler = add(person(crowdG, 352, 822, 0.58, RD.mix("think", { rsh: 20, rel: 30 }), { facing: -1, coat: P.slate, hood: true }), "think");
    sk.rect(crowdG, filler.hand[0] - 9, filler.hand[1] - 2, 16, 20, DET({ fill: P.fog, width: 1.5 }));
    // wrapped in a blanket on the log by the cold fire
    const lg = add(person(crowdG, 492, 890, 0.5, RD.mix("sit", { torso: 16, head: 24, lsh: 60, lel: 90, rsh: 70, rel: 85 }), { facing: -1, coat: P.slate, beanie: P.steel }), "sit");
    const hc = lg.head, hp = lg.hip;
    sk.poly(crowdG, [[hc[0] - 4, hc[1] - 18], [hc[0] + 16, hc[1] - 10], [hc[0] + 24, hc[1] + 14], [hp[0] + 22, hp[1] - 4], [hp[0] + 18, hp[1] + 10], [hp[0] - 24, hp[1] + 12], [hp[0] - 22, hp[1] - 14], [hc[0] - 18, hc[1] + 14], [hc[0] - 16, hc[1] - 6]], D({ fill: P.mist, stroke: P.slate, width: 3, step: 20, wobble: 1.2 }));
    sk.path(crowdG, [[hc[0] + 6, hc[1] + 20], [hp[0] + 2, hp[1] - 2]], DET({ stroke: P.steel, opacity: 0.7, double: false }));
    sk.circle(crowdG, hc[0] - 3, hc[1] + 1, 9, DET({ fill: P.fog, stroke: P.storm, double: false }));
    // two at the lip by the cars, looking at the flood
    add(person(crowdG, 1560, 762, 0.46, RD.mix("point", { rsh: 72 }), { facing: 1, coat: P.slate, opacity: 0.85 }), "point");
    add(person(crowdG, 1532, 764, 0.44, "idle", { facing: 1, opacity: 0.85, hood: true }), "idle");
    // a kid crouched at the front tent's door
    add(person(crowdG, 1650, 902, 0.42, "crouch", { facing: 1, coat: P.steel, opacity: 0.9, hood: true }), "crouch");
  }

  // ------------------------------------------------------------------ FOREGROUND FRAMING
  const fgG = el("g", { class: "rd-hilltop-camp-fg" }, root);
  fir(fgG, 40, 960, 980, 300, { fill: P.storm, stroke: P.ink, width: LINE.main, tiers: 13 });
  sk.hatch(fgG, -20, 200, 120, 760, { seed: sd(), gap: 12, angle: 60, stroke: P.ink, opacity: 0.3 });
  // dripping bough tips
  for (let i = 0; i < 7; i++) { const x = 70 + i * 22, y = 300 + i * 80; el("ellipse", { cx: x + 30 + i * 8, cy: y + 18, rx: 1.6, ry: 3, fill: P.fog, opacity: 0.8 }, fgG); }
  sk.poly(fgG, [[1888, 960], [1896, 300], [1904, 240], [1912, 300], [1924, 960]], D({ fill: P.storm, width: LINE.main }));
  [[1898, 420, 1840, 380], [1904, 520, 1950, 470], [1898, 620, 1846, 600], [1902, 360, 1940, 330]].forEach(([a, b, c, d]) => sk.line(fgG, a, b, c, d, D({ width: 4 })));
  for (let i = 0; i < 24; i++) {
    const x = 120 + i * 78 + rnd(i + 1200) * 30, y = 915 + rnd(i + 1300) * 20, h = 16 + rnd(i) * 14;
    sk.path(fgG, [[x - h * 0.4, y - h], [x, y], [x + h * 0.2, y - h * 1.2], [x + 4, y], [x + h * 0.6, y - h * 0.7]], DET({ stroke: P.storm, opacity: 0.7, double: false, wobble: 0.6, step: 400 }));
  }
  sk.poly(fgG, [[520, 960], [534, 936], [570, 932], [588, 962]], D({ fill: P.steel, width: 3 }));

  return {
    g: root,
    groundY: GROUND,
    canopy: { g: canopyG, x: C.cx, y: C.base, x0: C.x0, x1: C.x1, eaveY: C.eave, peakY: C.peak, board: BD },
    table: { g: tableG, x: (T.x0 + T.x1) / 2, y: T.top, x0: T.x0, x1: T.x1, seatY: 786, groundY: T.ground },
    sign: { g: signG, x: SX, y: SY, w: SW, h: SH },
    tank: { g: tankG, x: TX, y: 600, crackX: CRX, crackY: CRY },
    tents,
    cars,
    clothesline: { g: lineG, x0: CL.x0, x1: CL.x1, y: CL.y },
    firePit: { g: fireG, x: FX, y: FY },
    smoke: { g: smokeG },
    crowd: { g: crowdG, members },
    view: { g: viewG, waterG, levelY: L0, horizonY: HORIZON, setLevel, get level() { return curLevel; } },
    fogG,
    sky: { g: skyG },
    far: { g: farG },
  };
};
