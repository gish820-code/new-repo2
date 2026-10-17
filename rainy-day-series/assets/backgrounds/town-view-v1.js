/* Rainy Day background — townView, v1 (Episode 2, DAY 1 — the morning after).
 *
 * Paste VERBATIM after the rig (assets/characters/rainy-day-rig-v3.js for Episode 2; only palette / LINE / el /
 * sk / hash are used, so v1/v2 work too). Guarded; registers window.RainyDayBG.townView.
 *
 *   const bg = window.RainyDayBG.townView(bgLayer, { fog: 0.6 });   // bgLayer = <g> in a 1920x1080 SVG
 *
 * View: from the lip of the east hill, looking west-south-west down onto what is left of Gull Harbor. Wet grass
 * lip with a broken fence and fir trunks in the foreground (figures stand here, low in frame); below, the town
 * still partly flooded: muddy water in the low streets, collapsed and shifted houses, roofs in the water, the
 * ferry M/V KITTIWAKE stranded across Main Street, cars piled against buildings, debris lines, snapped power
 * poles. Main Street runs from the ruined ferry pier (left, far) to DALE'S GAS & GROCERY (mid-right, near, at
 * the foot of the hill; canopy + store + pole sign, labeled). The coast highway leaves Dale's to the right and its
 * BRIDGE over Gull Creek is broken in the middle. Ocean + flat gray horizon beyond, fog banks, a pale cold sky.
 * Static and deterministic; scenes own all motion. Weather (drizzle) is NOT included (add RainyDay.rain).
 *
 * OPTS (all optional)
 *   fog    0..1    (default 0.6) strength of the fog banks / haze over the distance.
 *   level  number  initial flood-sheet level (default water.levelY = 640). See water.setLevel.
 *   seed   number  wobble seed (default 5).
 *
 * HANDLES (return value)
 *   g            root <g>.
 *   groundY      880   the hill lip where feet stand (figure hip y = 880 - 116*scale; scale 1.4 -> hip y 717.6).
 *                Walkable full width x 0..1920. The broken fence sits at x 20–330 and x 1715–1905 (behind feet);
 *                the trailhead gap is x 1560–1700. y >= 940 is plain dark grass (caption zone).
 *   gasStation   { g, x: 1468, y: 652, smokeX: 1520, smokeY: 588, labelG }
 *                Dale's Gas & Grocery. x/y = bottom-centre of the lot. smokeX/smokeY = smoke / flash origin
 *                (store roof, just behind the sign). labelG = the "DALE'S GAS & GROCERY" fascia + pole sign group
 *                (e.g. pulse/highlight it when a character points).
 *   bridge       { g, x: 1738, y: 622, gapX0: 1716, gapX1: 1762 }  coast-highway bridge over Gull Creek; x/y = the
 *                middle of the break (where the deck is missing). g holds the whole bridge.
 *   path         { g, points: [[x,y]..], scales: [..] }  screen-space route from the trailhead at the lip down the
 *                hill flank to Dale's forecourt (first point = lip, last point = in front of Dale's). scales[i] is
 *                a suggested RainyDay.figure scale for a tiny walker at points[i] (0.42 at the lip … 0.12 at Dale's).
 *                g = the drawn muddy trail (visible on the flank).
 *   water        { g, levelY: 640, recededY: 700, highY: 600, level, setLevel(y) }
 *                The flood sheet in the low streets. setLevel(y) redraws it (pure function of y, seek-safe; call it
 *                from an onUpdate). Its NEAR edge is y + a terrain profile (water reaches nearest at left by the
 *                harbor, recedes eastward toward Dale's). Larger y = water spreads nearer / higher; smaller y =
 *                receding (more mud shows). 700 ~ still deep, 640 default, 600 drained back toward the harbor.
 *                Objects standing in the sheet carry static waterline laps drawn for the default level.
 *   town         { g, mainStreet: { x0: 300, y0: 590, x1: 1500, y1: 660 }, ferry: { g, x: 600, y: 590 },
 *                  buildings: { postOffice, diner, hardware } }   the wrecked town (all static).
 *   sky          { g }   sky, clouds, fog banks.
 *   sea          { g, horizonY: 330 }  ocean + headland + lighthouse.
 *   fogG         <g>   the fog/haze layer over the distance (scenes may fade it).
 *   lip          { g, fence: { g } }  foreground hill lip (grass, fence, fir trunks).
 *   layers       { sky, sea, town, water, haze, slope, lip }  draw-order groups.
 */
(function () {
  window.RainyDayBG = window.RainyDayBG || {};
  if (window.RainyDayBG.townView) return;
  let instance = 0;

  window.RainyDayBG.townView = function (parent, opts) {
    opts = opts || {};
    const RD = window.RainyDay, P = RD.palette, LINE = RD.LINE, sk = RD.sk, el = RD.el, H = RD.hash;
    const INK = P.ink;
    const FOG = opts.fog !== undefined ? Math.max(0, Math.min(1, +opts.fog)) : 0.6;
    const seed0 = opts.seed || 5;
    instance++;
    const uid = "rdtv" + instance + "_" + Math.round(Math.abs(H(seed0 * 2.3 + 0.7)) * 1e6);
    let sN = seed0 * 1000 + 17;
    const S = () => (sN += 7);
    const rnd = (i) => (H(i * 1.731 + 91.3) + 1) / 2;

    const HORIZON = 330, GROUND = 880, L0 = 640;
    const FONT_SIGN = "'League Gothic', Oswald, Impact, 'Arial Narrow', sans-serif";
    const FONT_HAND = "Kalam, 'Comic Sans MS', cursive";
    const f1 = (v) => (+v).toFixed(1);
    const D = (pts, close) => "M" + pts.map((p) => f1(p[0]) + " " + f1(p[1])).join(" L") + (close ? " Z" : "");
    const sc = (y) => 0.25 + (y - 470) * 0.0029; // depth scale of the town at base y (0.25 far … 1.1 near)

    const g = el("g", { class: "rdbg-town-view" }, parent);
    const defs = el("defs", {}, g);
    const layer = (name, par) => el("g", { class: "tv-" + name }, par || g);

    // ------------------------------------------------------------------ helpers
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
    function lines(par, segs, o) {
      o = o || {};
      const d = segs.map((s) => `M${f1(s[0])} ${f1(s[1])} L${f1(s[2])} ${f1(s[3])}`).join(" ");
      return el("path", { d, stroke: o.stroke || P.storm, "stroke-width": o.width || 1.6, fill: "none", opacity: o.opacity !== undefined ? o.opacity : 0.35, "stroke-linecap": "round" }, par);
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
    let clipN = 0;
    function clipTo(par, pts) { // group clipped to a polygon (keeps rect-shaped hatching inside its shape)
      const id = uid + "c" + clipN++;
      const cp = el("clipPath", { id }, defs);
      el("path", { d: D(pts, true) }, cp);
      return el("g", { "clip-path": `url(#${id})` }, par);
    }
    // a group placed at (x,y) [rotated, scaled]: draw in local units, origin = base centre
    const place = (par, x, y, s, rot, cls) => el("g", { class: cls || "tv-obj", transform: `translate(${f1(x)} ${f1(y)}) rotate(${(rot || 0).toFixed(2)}) scale(${(s || 1).toFixed(3)})` }, par);
    // stroke width in local units that renders as px on screen (keeps far lines from vanishing)
    const lw = (px, s) => Math.max(1.1, px * Math.max(s, 0.45)) / s;

    function fir(par, x, base, h, o) {
      o = o || {};
      const tg = el("g", { opacity: o.opacity !== undefined ? o.opacity : 1 }, par);
      const fill = o.fill || P.storm, stroke = o.stroke || P.night, wd = o.width || 2, w = h * (o.wide || 0.34);
      if (!o.noTrunk) sk.line(tg, x, base, x, base - h * 0.2, { stroke, width: Math.max(1.5, h / 40), seed: S(), double: false });
      const tiers = o.tiers || 4;
      for (let i = 0; i < tiers; i++) {
        const tb = base - h * 0.1 - i * h * (0.68 / tiers);
        const tt = i === tiers - 1 ? base - h : tb - h * 0.42;
        const tw = w * (1 - i * (0.7 / tiers));
        sk.poly(tg, [[x - tw, tb], [x - tw * 0.45, tb - (tb - tt) * 0.35], [x, tt], [x + tw * 0.45, tb - (tb - tt) * 0.35], [x + tw, tb], [x + tw * 0.3, tb - h * 0.035], [x - tw * 0.3, tb - h * 0.035]], { fill, stroke, width: wd, seed: S(), wobble: Math.max(0.5, h / 110), double: h > 120 });
      }
      return tg;
    }
    function gull(par, x, y, s, o) {
      o = o || {};
      s = s || 1;
      return el("path", { d: `M${f1(x - 9 * s)} ${f1(y)} Q${f1(x - 4 * s)} ${f1(y - 6 * s)} ${f1(x)} ${f1(y)} Q${f1(x + 4 * s)} ${f1(y - 6 * s)} ${f1(x + 9 * s)} ${f1(y)}`, stroke: o.stroke || P.storm, "stroke-width": o.width || 2, fill: "none", "stroke-linecap": "round", opacity: o.opacity || 0.8 }, par);
    }
    // water lap around an object's base (local units): makes it read as standing IN the flood
    function lap(par, x0, x1, y, h, s, dy) {
      dy = dy || 0;
      sk.path(par, [[x0 - 4, y - h], [x1 + 4, y - h + dy], [x1 + 4, y + 4 + dy], [x0 - 4, y + 4]], { closed: true, fill: P.steel, stroke: "none", seed: S(), double: false, wobble: 0.6 });
      sk.path(par, [[x0 - 6, y - h], [(x0 + x1) / 2, y - h + dy / 2 + 1], [x1 + 6, y - h + dy]], { stroke: P.fog, width: lw(1.6, s), seed: S(), double: false, wobble: 0.8, opacity: 0.75 });
      sk.path(par, [[x0 + (x1 - x0) * 0.15, y - h + 5], [x0 + (x1 - x0) * 0.55, y - h + 5 + dy * 0.5]], { stroke: P.mist, width: lw(1.3, s), seed: S(), double: false, opacity: 0.6 });
    }

    // HOUSE (small oblique box with gable roof). Local units: front face w x h, roof rise rh, depth vector (dx, dy).
    // o: { s, rot, fill, side, roof, state: 'ok'|'shifted'|'collapsed'|'roof'|'gutted', lapH, flat, pad: [x,y] }
    function house(par, x, by, o) {
      o = o || {};
      const s = o.s || sc(by);
      const w = o.w || 56, h = o.h || 30, rh = o.flat ? 4 : (o.rh || 18), dx = w * (o.deep || 0.55), dy = -h * 0.42;
      const st = o.stroke || P.slate, W = lw(2.2, s), Wd = lw(1.3, s);
      const fill = o.fill || P.fog, side = o.side || P.mist, roofC = o.roof || P.steel;
      if (o.pad) { // empty foundation slab left behind
        const pg = place(par, o.pad[0], o.pad[1], s, 0);
        sk.poly(pg, [[-w / 2, 0], [w / 2, 0], [w / 2 + dx, dy], [-w / 2 + dx, dy]], { fill: P.mist, stroke: st, width: W, seed: S(), double: false, wobble: 0.8, opacity: 0.85 });
        lines(pg, [[-w / 2 + 6, -3, w / 2 + dx - 10, dy + 2], [-w / 2 + 14, -1, -w / 2 + 14 + dx * 0.8, dy * 0.8]], { stroke: st, width: Wd, opacity: 0.5 });
      }
      const hg = place(par, x, by, s, o.rot || 0, "tv-house");
      const state = o.state || "ok";
      if (state === "collapsed") {
        // pancaked: roof slab dropped onto a rubble heap, one wall corner still up
        sk.poly(hg, [[-w / 2 - 6, 0], [w / 2 + dx + 8, dy], [w / 2 + dx * 0.6, dy - 12], [w * 0.1, -16], [-w / 2 + 4, -10]], { fill: P.steel, stroke: st, width: W, seed: S(), wobble: 1 });
        sk.poly(hg, [[-w / 2 - 2, -8], [w * 0.2, -26], [w / 2 + dx * 0.9, dy - 18], [w / 2 + dx * 0.2, dy - 4], [-w * 0.1, -2]], { fill: roofC, stroke: st, width: W, seed: S(), wobble: 0.8 });
        sk.hatch(hg, -w / 2, -26, w + dx, 26, { gap: 5, angle: 28, stroke: st, width: Wd, opacity: 0.45, seed: S() });
        sk.poly(hg, [[w / 2 - 4, -6], [w / 2 + 2, -h * 0.9], [w / 2 + 7, -h * 0.85], [w / 2 + 6, -8]], { fill: fill, stroke: st, width: W, seed: S(), double: false });
        const pl = [];
        for (let i = 0; i < 9; i++) { const px = -w / 2 + rnd(S()) * (w + dx), py = -4 - rnd(S()) * 14, a = (rnd(S()) - 0.5) * 2.4, l = 8 + rnd(S()) * 12; pl.push([px, py, px + Math.cos(a) * l, py + Math.sin(a) * l]); }
        lines(hg, pl, { stroke: P.storm, width: lw(1.8, s), opacity: 0.8 });
        if (o.lapH) lap(hg, -w / 2, w / 2 + dx, 2, o.lapH, s, dy * 0.2);
        return hg;
      }
      const showFront = state !== "roof";
      if (showFront) {
        // side wall (receding)
        sk.poly(hg, [[w / 2, 0], [w / 2, -h], [w / 2 + dx, -h + dy], [w / 2 + dx, dy]], { fill: side, stroke: st, width: W, seed: S(), wobble: 0.6, double: false });
        sk.hatch(hg, w / 2, -h + dy, dx, h - dy, { gap: 5, angle: 70, stroke: st, width: Wd, opacity: 0.35, seed: S() });
        // front wall
        sk.rect(hg, -w / 2, -h, w, h, { fill, stroke: st, width: W, seed: S(), wobble: 0.6, double: s > 0.7 });
        const sid = [];
        for (let yy = -h + 6; yy < -2; yy += 6) sid.push([-w / 2 + 2, yy, w / 2 - 2, yy + 0.4]);
        lines(hg, sid, { stroke: st, width: Wd, opacity: 0.25 });
        // windows + door (dark, many broken)
        const wn = o.flat ? 3 : 2;
        for (let i = 0; i < wn; i++) {
          const wx = -w / 2 + 7 + i * ((w - 26) / Math.max(1, wn - 1)) * (o.flat ? 1 : 0.62), wy = -h + 7;
          sk.rect(hg, wx, wy, 9, 9, { fill: (i + by) % 3 === 0 ? P.night : P.slate, stroke: st, width: Wd, seed: S(), double: false, wobble: 0.4 });
        }
        sk.rect(hg, w / 2 - 15, -h * 0.62, 9, h * 0.62, { fill: P.storm, stroke: st, width: Wd, seed: S(), double: false, wobble: 0.4 });
        sk.rect(hg, w / 2 + dx * 0.35, -h * 0.7 + dy * 0.35, 8, 8, { fill: P.slate, stroke: st, width: Wd, seed: S(), double: false, wobble: 0.3 });
        // mud line on the walls
        sk.path(hg, [[-w / 2, -h * 0.4], [w / 2, -h * 0.42], [w / 2 + dx, -h * 0.42 + dy]], { stroke: P.steel, width: lw(2.4, s), seed: S(), double: false, opacity: 0.8 });
      }
      // roof: gable front + roof plane receding
      const ry = showFront ? -h : 0;
      if (o.flat) {
        sk.poly(hg, [[-w / 2 - 2, ry], [w / 2 + 2, ry], [w / 2 + dx + 2, ry + dy], [-w / 2 + dx - 2, ry + dy]], { fill: roofC, stroke: st, width: W, seed: S(), wobble: 0.6 });
        sk.rect(hg, -w / 2 - 2, ry - 4, w + 4, 4, { fill: P.slate, stroke: st, width: Wd, seed: S(), double: false });
      } else {
        sk.poly(hg, [[0, ry - rh], [w / 2 + 3, ry + 1], [w / 2 + dx + 3, ry + dy + 1], [dx, ry - rh + dy]], { fill: roofC, stroke: st, width: W, seed: S(), wobble: 0.6 });
        sk.hatch(hg, 0, ry - rh + dy, w / 2 + dx, rh - dy + 2, { gap: 4.5, angle: -32, stroke: st, width: Wd, opacity: 0.32, seed: S() });
        sk.poly(hg, [[-w / 2 - 3, ry + 1], [0, ry - rh], [w / 2 + 3, ry + 1]], { fill: showFront ? fill : P.mist, stroke: st, width: W, seed: S(), wobble: 0.5 });
        if (state === "gutted" || o.hole) sk.poly(hg, [[w * 0.18, ry - rh * 0.5], [w * 0.42, ry - 3], [w * 0.42 + dx * 0.5, ry + dy * 0.5 - 2], [w * 0.2 + dx * 0.4, ry - rh * 0.6 + dy * 0.4]], { fill: P.night, stroke: st, width: Wd, seed: S(), double: false });
        if (!showFront) {
          // roof floating / sitting in the water: ripple ring + debris caught on it
          lap(hg, -w / 2 - 6, w / 2 + dx + 4, 3, 4, s, dy);
        }
      }
      if (o.chimney) sk.rect(hg, -w * 0.22, ry - rh * 0.8 - 6, 6, 12, { fill: P.steel, stroke: st, width: Wd, seed: S(), double: false });
      if (o.lapH && showFront) lap(hg, -w / 2, w / 2 + dx, 0, o.lapH, s, dy);
      return hg;
    }
    // CAR (local units, ~44 wide). o: { s, rot, fill, flip (on its roof), lapH }
    function car(par, x, by, o) {
      o = o || {};
      const s = o.s || sc(by);
      const cg = place(par, x, by, s, o.rot || 0, "tv-car");
      const inner = o.flip ? el("g", { transform: "translate(0 -16) scale(1 -1)" }, cg) : cg;
      const st = P.slate, W = lw(2, s);
      sk.path(inner, [[-22, -4], [-21, -12], [-12, -13], [-7, -21], [9, -21], [14, -13], [22, -11], [22, -4]], { closed: true, fill: o.fill || P.mist, stroke: st, width: W, seed: S(), wobble: 0.4 });
      sk.path(inner, [[-6, -14], [-3, -19], [7, -19], [10, -14]], { closed: true, fill: P.slate, stroke: st, width: lw(1.2, s), seed: S(), double: false });
      [-13, 13].forEach((wx) => sk.circle(inner, wx, -4, 4.5, { fill: P.night, stroke: st, width: lw(1.4, s), seed: S(), double: false }));
      if (o.lapH) lap(cg, -22, 22, 0, o.lapH, s, 0);
      return cg;
    }
    // POWER POLE (screen units scaled by depth). o: { lean, snap: true -> top half lying beside }
    function pole(par, x, by, o) {
      o = o || {};
      const s = o.s || sc(by), h = (o.h || 120) * s, lean = o.lean || 0;
      const pg = el("g", { class: "tv-pole" }, par);
      const top = rotPt([x, by - h], x, by, lean);
      if (o.snap) {
        const mid = rotPt([x, by - h * 0.45], x, by, lean);
        sk.line(pg, x, by, mid[0], mid[1], { stroke: P.storm, width: Math.max(2, 5 * s), seed: S(), double: false });
        const e = [mid[0] + h * 0.5, mid[1] + h * 0.38];
        sk.line(pg, mid[0] + 2, mid[1] + 4, e[0], e[1], { stroke: P.storm, width: Math.max(2, 5 * s), seed: S(), double: false });
        const ca = [mid[0] + (e[0] - mid[0]) * 0.85, mid[1] + (e[1] - mid[1]) * 0.85];
        sk.line(pg, ca[0] - 4 * s, ca[1] - 16 * s, ca[0] + 4 * s, ca[1] + 16 * s, { stroke: P.storm, width: Math.max(1.6, 3 * s), seed: S(), double: false });
        return { g: pg, top: mid };
      }
      sk.line(pg, x, by, top[0], top[1], { stroke: P.storm, width: Math.max(2, 5 * s), seed: S(), double: false });
      const ca = rotPt([x, by - h * 0.9], x, by, lean);
      const a = rotPt([ca[0] - 20 * s, ca[1]], ca[0], ca[1], lean), b = rotPt([ca[0] + 20 * s, ca[1]], ca[0], ca[1], lean);
      sk.line(pg, a[0], a[1], b[0], b[1], { stroke: P.storm, width: Math.max(1.6, 3.5 * s), seed: S(), double: false });
      return { g: pg, top, arm: [a, b] };
    }
    function wire(par, a, b, sag, o) {
      o = o || {};
      const pts = [];
      for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + sag * 4 * t * (1 - t)]); }
      sk.path(par, pts, { stroke: o.stroke || P.storm, width: o.width || 1.4, seed: S(), wobble: 0.4, double: false, step: 60, opacity: o.opacity || 0.85 });
    }
    // DEBRIS LINE: a wrack band of jumbled sticks / planks / bits along a polyline
    function debrisLine(par, pts, o) {
      o = o || {};
      const dg = el("g", { class: "tv-debris" }, par);
      const segs = [], planks = [];
      const dens = o.dens || 1;
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const n = Math.max(2, Math.round((L / 7) * dens));
        for (let k = 0; k < n; k++) {
          const t = k / n, x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t, s = sc(y);
          const id = i * 131 + k * 7 + (o.seed || 0);
          const jx = (rnd(id) - 0.5) * 10 * s, jy = (rnd(id + 3) - 0.5) * (o.thick || 10) * s;
          const ang = (rnd(id + 5) - 0.5) * 2.6, l = (5 + rnd(id + 9) * 13) * s;
          segs.push([x + jx, y + jy, x + jx + Math.cos(ang) * l, y + jy + Math.sin(ang) * l * 0.6]);
          if (rnd(id + 11) > 0.86) planks.push([x + jx, y + jy, ang, l * 1.4, s]);
        }
      }
      el("path", { d: segs.map((q) => `M${f1(q[0])} ${f1(q[1] + 1.5)} L${f1(q[2])} ${f1(q[3] + 1.5)}`).join(" "), stroke: P.night, "stroke-width": 2.6, opacity: 0.35, fill: "none", "stroke-linecap": "round" }, dg);
      el("path", { d: segs.map((q) => `M${f1(q[0])} ${f1(q[1])} L${f1(q[2])} ${f1(q[3])}`).join(" "), stroke: o.stroke || P.storm, "stroke-width": o.width || 1.8, opacity: 0.85, fill: "none", "stroke-linecap": "round" }, dg);
      planks.forEach(([x, y, a, l, s], j) => {
        const q = [[0, 0], [l, 0], [l, 3.5 * s + 1], [0, 3.5 * s + 1]].map((p) => rotPt([x + p[0], y + p[1]], x, y, (a * 180) / Math.PI * 0.5));
        sk.poly(dg, q, { fill: o.plank || (j % 3 ? P.steel : P.mist), stroke: P.slate, width: 1.2, seed: S(), double: false, wobble: 0.3 });
      });
      return dg;
    }

    // ------------------------------------------------------------------ SKY (flat, cold, pale gray dawn)
    const skyL = layer("sky");
    const sg = el("linearGradient", { id: uid + "sky", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    [[0, P.slate], [0.35, P.steel], [0.75, P.mist], [1, P.fog]].forEach(([o, c]) => el("stop", { offset: o, "stop-color": c }, sg));
    el("rect", { x: -40, y: -40, width: 2000, height: HORIZON + 60, fill: `url(#${uid}sky)` }, skyL);
    function cloud(par, x0, x1, cy, h, fill, op, sd) {
      const pts = [], n = Math.max(6, Math.round((x1 - x0) / 60));
      for (let i = 0; i <= n; i++) {
        const t = i / n, x = x0 + (x1 - x0) * t;
        const bump = Math.pow(Math.sin(t * Math.PI), 0.7) * h * (0.65 + 0.35 * rnd(sd + i));
        pts.push([x, cy - bump + (i % 2 ? h * 0.1 : 0)]);
      }
      pts.push([x1 - 30, cy + h * 0.16], [x0 + (x1 - x0) * 0.6, cy + h * 0.24], [x0 + 40, cy + h * 0.14]);
      sk.path(par, pts, { closed: true, fill, stroke: P.slate, width: LINE.detail, seed: sd, wobble: 3, opacity: op, double: false });
      sk.hatch(par, x0 + 40, cy - h * 0.05, x1 - x0 - 80, h * 0.28, { gap: 12, angle: 16, stroke: P.slate, width: 1.4, opacity: 0.14 * op, seed: sd + 2 });
    }
    cloud(skyL, -80, 760, 70, 80, P.slate, 0.75, S());
    cloud(skyL, 560, 1380, 40, 60, P.steel, 0.7, S());
    cloud(skyL, 1180, 2000, 90, 90, P.slate, 0.7, S());
    cloud(skyL, 100, 980, 190, 50, P.steel, 0.55, S());
    cloud(skyL, 980, 1700, 175, 46, P.mist, 0.5, S());
    cloud(skyL, -60, 420, 250, 36, P.mist, 0.45, S());
    // a paler break low in the east-ish sky (cold dawn glow, no warmth)
    sk.path(skyL, [[640, 300], [760, 284], [880, 276], [1010, 266], [1150, 270], [1290, 262], [1420, 274], [1560, 286], [1680, 300], [1400, 312], [1000, 314]], { closed: true, fill: P.paper, stroke: "none", seed: S(), double: false, opacity: 0.28, wobble: 3 });
    sk.path(skyL, [[900, 250], [1040, 240], [1180, 244], [1300, 252], [1120, 258]], { closed: true, fill: P.fog, stroke: "none", seed: S(), double: false, opacity: 0.35 });
    // drizzle curtains far off
    sk.hatch(skyL, 420, 120, 360, 200, { gap: 22, angle: 100, stroke: P.slate, width: 1.6, opacity: 0.1, seed: S() });
    sk.hatch(skyL, 1240, 150, 300, 170, { gap: 26, angle: 101, stroke: P.slate, width: 1.6, opacity: 0.08, seed: S() });
    [[420, 160, 0.9], [452, 172, 0.7], [1140, 130, 1], [1180, 146, 0.75], [860, 210, 0.6]].forEach(([x, y, s]) => gull(skyL, x, y, s, { opacity: 0.55 }));

    // ------------------------------------------------------------------ SEA, headland, far hills (east/north at right)
    const seaL = layer("sea");
    const seag = el("linearGradient", { id: uid + "sea", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    [[0, P.mist], [0.5, P.steel], [1, P.steel]].forEach(([o, c]) => el("stop", { offset: o, "stop-color": c }, seag));
    el("rect", { x: -40, y: HORIZON, width: 2000, height: 340, fill: `url(#${uid}sea)` }, seaL);
    sk.line(seaL, -20, HORIZON + 1, 1960, HORIZON + 1, { stroke: P.fog, width: 2, opacity: 0.8, seed: S(), double: false, wobble: 0.5 });
    const sw = [];
    for (let i = 0; i < 70; i++) {
      const x = ((i * 149) % 1700) - 10, y = HORIZON + 8 + ((i * 41) % 160);
      const l = 8 + (y - HORIZON) * 0.2;
      sw.push([x, y, x + l, y + 0.5]);
    }
    lines(seaL, sw, { stroke: P.fog, width: 1.6, opacity: 0.4 });
    // floating debris field drifting in the bay
    debrisLine(seaL, [[60, 420], [260, 432], [420, 428], [640, 444]], { dens: 0.5, thick: 6, seed: 3, width: 1.4 });
    debrisLine(seaL, [[140, 470], [330, 482], [460, 476]], { dens: 0.6, thick: 8, seed: 9, width: 1.5 });
    // far headland (south, left) with a tiny lighthouse
    sk.path(seaL, [[-30, 342], [-30, 300], [40, 292], [110, 296], [180, 308], [240, 318], [290, 330], [320, 342]], { closed: true, fill: P.steel, stroke: P.slate, width: LINE.detail, seed: S(), wobble: 1, double: false });
    for (let i = 0; i < 9; i++) fir(seaL, -12 + i * 24, 302 + i * 3, 20 + (i % 3) * 6, { fill: P.slate, stroke: P.slate, width: 1.2, tiers: 3 });
    sk.rect(seaL, 252, 304, 8, 26, { fill: P.fog, stroke: P.slate, width: 1.6, seed: S(), wobble: 0.3, double: false });
    sk.poly(seaL, [[249, 305], [256, 297], [263, 305]], { fill: P.slate, stroke: P.slate, width: 1.6, seed: S(), double: false });
    // far hills to the north-east (right), forested, fog in the creek valley
    const farHill = [[1120, 334], [1200, 322], [1320, 298], [1460, 262], [1600, 238], [1760, 212], [1960, 196], [1960, 520], [1600, 470], [1400, 400], [1250, 352], [1120, 336]];
    sk.path(seaL, farHill, { closed: true, fill: P.mist, stroke: P.steel, width: LINE.detail, seed: S(), wobble: 2, double: false });
    const nearHill = [[1330, 384], [1420, 372], [1520, 352], [1620, 330], [1760, 300], [1880, 290], [1960, 286], [1960, 600], [1700, 520], [1540, 468], [1420, 410], [1330, 386]];
    sk.path(seaL, nearHill, { closed: true, fill: P.steel, stroke: P.slate, width: LINE.detail, seed: S(), wobble: 2 });
    sk.hatch(clipTo(seaL, nearHill), 1330, 280, 640, 330, { gap: 14, angle: 60, stroke: P.slate, width: 1.4, opacity: 0.22, seed: S() });
    const hy = (pts, x) => { for (let i = 0; i < pts.length - 1; i++) if (x <= pts[i + 1][0]) return pts[i][1] + ((pts[i + 1][1] - pts[i][1]) * (x - pts[i][0])) / (pts[i + 1][0] - pts[i][0]); return pts[pts.length - 3][1]; };
    for (let i = 0; i < 30; i++) { const x = 1190 + i * 26 + rnd(i + 40) * 10; fir(seaL, x, hy(farHill, x) + 10, 22 + rnd(i) * 16, { fill: P.steel, stroke: P.steel, width: 1.2, tiers: 3 }); }
    for (let i = 0; i < 26; i++) { const x = 1340 + i * 24 + rnd(i + 70) * 10; fir(seaL, x, hy(nearHill, x) + 14, 30 + rnd(i + 5) * 22, { fill: P.slate, stroke: P.storm, width: 1.4, tiers: 3 }); }
    // shoreline: beach strip along the town front (x < 1470), the bay is deeper at left
    const SHORE = [[-20, 612], [120, 598], [240, 572], [380, 540], [520, 512], [700, 494], [900, 484], [1100, 478], [1300, 474], [1470, 472]];

    // ------------------------------------------------------------------ TOWN GROUND (mud), creek, streets
    const townL = layer("town");
    const groundG = el("g", { class: "tv-ground" }, townL);
    const landPoly = SHORE.concat([[1560, 470], [1700, 520], [1960, 560], [1960, 820], [-20, 820]]);
    sk.path(groundG, landPoly, { closed: true, fill: P.slate, stroke: P.storm, width: 2, seed: S(), wobble: 1, double: false });
    sk.path(groundG, SHORE.map((p) => [p[0], p[1] + 3]), { stroke: P.mist, width: 4, seed: S(), double: false, opacity: 0.45 }); // wet sand line
    sk.hatch(clipTo(groundG, landPoly), -20, 460, 1980, 360, { gap: 7, angle: 4, stroke: P.storm, width: 1.6, opacity: 0.5, seed: S() });
    // mud texture: flow streaks pointing inland (the water came from the sea, the back)
    const mud = [];
    for (let i = 0; i < 160; i++) {
      const x = ((i * 113) % 1900), y = 490 + ((i * 67) % 300), s = sc(y);
      mud.push([x, y, x + (8 + (i % 4) * 4) * s, y + 2 * s]);
    }
    lines(groundG, mud, { stroke: P.steel, width: 1.6, opacity: 0.4 });
    // Gull Creek: out of the north-east valley, under the coast highway, into the sea by the town's east end
    // the creek valley floor (wet, flood-scoured) is a shade lighter than the town mud
    sk.path(groundG, [[1380, 476], [1560, 472], [1700, 522], [1960, 600], [1960, 720], [1800, 700], [1640, 660], [1500, 640], [1400, 560]], { closed: true, fill: P.steel, stroke: "none", seed: S(), double: false, opacity: 0.6, wobble: 3 });
    const CREEK = [[1990, 716], [1900, 700], [1810, 684], [1738, 658], [1680, 628], [1630, 590], [1580, 544], [1520, 500], [1466, 472]];
    const cw = (y) => 5 + (y - 470) * 0.16;
    const cL = [], cR = [];
    CREEK.forEach((p, i) => {
      const a = CREEK[Math.max(0, i - 1)], b = CREEK[Math.min(CREEK.length - 1, i + 1)];
      let nx = -(b[1] - a[1]), ny = b[0] - a[0]; const L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L;
      const w = cw(p[1]) * (0.8 + 0.3 * Math.sin(i * 1.7));
      cL.push([p[0] + nx * w, p[1] + ny * w]); cR.push([p[0] - nx * w, p[1] - ny * w]);
    });
    sk.path(groundG, cL.map((p) => [p[0], p[1] + 2]).concat(cR.slice().reverse().map((p) => [p[0], p[1] + 2])), { closed: true, fill: P.slate, stroke: "none", seed: S(), wobble: 1, double: false }); // muddy banks
    sk.path(groundG, cL.concat(cR.slice().reverse()), { closed: true, fill: P.mist, stroke: P.storm, width: 2, seed: S(), wobble: 1, double: false });
    const crip = [];
    CREEK.slice(0, -1).forEach((p, i) => { const q = CREEK[i + 1], w = cw(p[1]) * 0.5; crip.push([p[0] - w * 0.3, p[1] - 1, (p[0] + q[0]) / 2, (p[1] + q[1]) / 2 - 1], [(p[0] + q[0]) / 2 + w * 0.4, (p[1] + q[1]) / 2 + 3, q[0] + w * 0.2, q[1] + 3]); });
    lines(groundG, crip, { stroke: P.fog, width: 1.8, opacity: 0.7 });
    // MAIN STREET (west -> east): from the ruined ferry pier to Dale's
    const MS = { x0: 300, y0: 590, x1: 1500, y1: 660 };
    const msY = (x) => MS.y0 + ((MS.y1 - MS.y0) * (x - MS.x0)) / (MS.x1 - MS.x0);
    const msW = (x) => 12 + ((x - MS.x0) / (MS.x1 - MS.x0)) * 26;
    const msTop = [], msBot = [];
    for (let x = MS.x0 - 40; x <= MS.x1 + 60; x += 40) { msTop.push([x, msY(x) - msW(x) * 0.5]); msBot.push([x, msY(x) + msW(x) * 0.5]); }
    sk.path(groundG, msTop.concat(msBot.slice().reverse()), { closed: true, fill: P.storm, stroke: P.night, width: 2, seed: S(), wobble: 0.8, double: false, opacity: 0.85 });
    const dash = [];
    for (let x = MS.x0; x < MS.x1; x += 34) dash.push([x, msY(x), x + 14 * sc(msY(x)), msY(x) + 0.8]);
    lines(groundG, dash, { stroke: P.mist, width: 2, opacity: 0.5 });
    // the COAST HIGHWAY: leaves Main Street at Dale's and runs east across Gull Creek (bridge drawn later)
    const HW = [[1500, 660], [1600, 648], [1690, 634], [1786, 616], [1870, 604], [1980, 592]];
    sk.path(groundG, HW.map((p) => [p[0], p[1] - 10]).concat(HW.slice().reverse().map((p) => [p[0], p[1] + 10])), { closed: true, fill: P.storm, stroke: P.night, width: 2, seed: S(), double: false, wobble: 0.6 });
    lines(groundG, HW.slice(0, -1).map((p, i) => [p[0] + 10, p[1], (p[0] + HW[i + 1][0]) / 2, (p[1] + HW[i + 1][1]) / 2]), { stroke: P.mist, width: 2, opacity: 0.45 });

    // ------------------------------------------------------------------ WATER (flood sheet in the low streets)
    const waterL = layer("water", townL);
    const waterG = el("g", { class: "tv-flood" }, waterL);
    const wcp = el("clipPath", { id: uid + "wclip" }, defs);
    el("path", { d: D([[-20, 455], [1470, 455], [1500, 486], [1540, 530], [1560, 590], [1520, 640], [1300, 820], [-20, 820]], true) }, wcp);
    const wIn = el("g", { "clip-path": `url(#${uid}wclip)` }, waterG);
    const wFill = el("path", { fill: P.steel, stroke: "none" }, wIn);
    const wTint = el("path", { fill: P.mist, stroke: "none", opacity: 0.35 }, wIn);
    const wRip = el("path", { fill: "none", stroke: P.fog, "stroke-width": 1.6, opacity: 0.45, "stroke-linecap": "round" }, wIn);
    const wSheen = el("path", { fill: "none", stroke: P.paper, "stroke-width": 2, opacity: 0.3, "stroke-linecap": "round" }, wIn);
    const wEdge = el("path", { fill: "none", stroke: P.storm, "stroke-width": 2.2, opacity: 0.9, "stroke-linecap": "round", "stroke-linejoin": "round" }, wIn);
    const wFoam = el("path", { fill: "none", stroke: P.fog, "stroke-width": 1.8, opacity: 0.6, "stroke-linecap": "round" }, wIn);
    // terrain profile: water reaches nearest at left (harbor side), recedes toward the east end / Dale's
    const prof = (x) => {
      const k = [[-20, 92], [300, 78], [600, 46], [900, 14], [1150, -22], [1350, -46], [1500, -70], [1650, -120]];
      for (let i = 0; i < k.length - 1; i++) if (x <= k[i + 1][0]) return k[i][1] + ((k[i + 1][1] - k[i][1]) * (x - k[i][0])) / (k[i + 1][0] - k[i][0]);
      return -150;
    };
    const water = { g: waterG, levelY: L0, recededY: 600, highY: 700, level: L0, setLevel: null };
    function setLevel(y) {
      y = +y;
      const edge = [];
      for (let x = -20; x <= 1660; x += 20) edge.push([x, y + prof(x) + Math.sin(x * 0.031) * 5 + Math.sin(x * 0.087 + 1.1) * 3]);
      const back = SHORE.map((p) => [p[0], p[1] - 6]);
      const poly = [[-20, 455]].concat(back, [[1520, 470], [1660, 520]], edge.slice().reverse());
      wFill.setAttribute("d", D(poly, true));
      wTint.setAttribute("d", D(poly, true));
      wEdge.setAttribute("d", D(edge));
      const rip = [], sheen = [], foam = [];
      for (let i = 0; i < 90; i++) {
        const x = ((i * 157) % 1640) - 10, ey = y + prof(x);
        const t = rnd(i * 3 + 1), yy = 480 + t * (ey - 480 - 6);
        if (yy < 476 || yy > ey - 4) continue;
        const l = (10 + (i % 5) * 5) * sc(yy);
        rip.push(`M${f1(x)} ${f1(yy)} L${f1(x + l)} ${f1(yy + 0.6)}`);
        if (i % 7 === 0) sheen.push(`M${f1(x)} ${f1(yy + 3)} L${f1(x + l * 2.2)} ${f1(yy + 3.6)}`);
      }
      for (let i = 0; i < edge.length - 1; i++) {
        if (rnd(i * 5 + 2) < 0.55) continue;
        const p = edge[i], l = 8 + rnd(i * 7) * 14;
        foam.push(`M${f1(p[0])} ${f1(p[1] - 2)} L${f1(p[0] + l)} ${f1(p[1] - 2.5)}`);
      }
      wRip.setAttribute("d", rip.join(" "));
      wSheen.setAttribute("d", sheen.join(" "));
      wFoam.setAttribute("d", foam.join(" "));
      water.level = y;
      return water;
    }
    water.setLevel = setLevel;
    // wrack line left behind where the water stood at its highest (static, nearer than the sheet)
    const wrack = [];
    for (let x = -20; x <= 1480; x += 40) wrack.push([x, Math.min(782, L0 + prof(x) + 30 + Math.sin(x * 0.02) * 6)]);
    const wrackG = debrisLine(waterL, wrack, { dens: 1.2, thick: 12, seed: 21 });

    // ------------------------------------------------------------------ TOWN OBJECTS (back to front)
    const objL = layer("objects", townL); // after the water: objects stand IN the flood
    // pier ruins (ferry dock): pilings marching out into the bay, deck gone in the middle
    const pierG = el("g", { class: "tv-pier" }, objL);
    for (let i = 0; i < 12; i++) {
      const x = 410 - i * 22, y = 556 - i * 4.2, s = sc(y);
      sk.line(pierG, x, y + 4, x + (i % 4 === 2 ? 4 : 0), y - 16 * s - (i % 3) * 2, { stroke: P.storm, width: Math.max(1.6, 4 * s), seed: S(), double: false });
      sk.path(pierG, [[x - 5, y + 4], [x + 6, y + 4]], { stroke: P.fog, width: 1.2, seed: S(), double: false, opacity: 0.6 });
    }
    sk.poly(pierG, [[420, 538], [348, 526], [348, 520], [420, 532]], { fill: P.mist, stroke: P.slate, width: 1.8, seed: S(), double: false });
    sk.poly(pierG, [[262, 512], [176, 500], [178, 495], [262, 506]], { fill: P.mist, stroke: P.slate, width: 1.6, seed: S(), double: false, opacity: 0.9 });
    sk.poly(pierG, [[340, 526], [300, 536], [298, 531], [338, 520]], { fill: P.mist, stroke: P.slate, width: 1.6, seed: S(), double: false }); // a deck section tipped into the water
    // the terminal hut, knocked flat-ish
    house(objL, 440, 548, { w: 40, h: 20, rh: 10, fill: P.fog, roof: P.slate, rot: -8, lapH: 8 });
    txt(objL, 438, 528, "FERRY", { size: 8, fill: P.slate, len: 20, rot: -8 });
    // capsized boats in the harbor
    [[160, 560, -8], [300, 590, 12], [90, 530, 4]].forEach(([x, y, r]) => {
      const s = sc(y), bg = place(objL, x, y, s, r);
      sk.path(bg, [[-20, -2], [-14, -8], [16, -8], [22, -2], [14, 2], [-12, 2]], { closed: true, fill: P.paper, stroke: P.slate, width: lw(1.8, s), seed: S(), double: false });
      lap(bg, -22, 22, 2, 4, s, 0);
    });

    // back rows of houses between the waterfront and Main Street: mostly roofs in the water, some gone
    const back = [
      [560, 514, "roof", 0], [620, 520, "roof", 6], [690, 512, "collapsed", 0], [760, 518, "roof", -10], [830, 510, "ok", 4],
      [900, 516, "roof", 14], [970, 512, "collapsed", 0], [1040, 508, "roof", -6], [1110, 512, "ok", -3], [1180, 506, "roof", 8],
      [1250, 510, "collapsed", 0], [1320, 504, "ok", 2], [1390, 508, "roof", -12],
      [600, 552, "ok", -5], [680, 548, "roof", 0], [940, 552, "roof", 10], [1010, 556, "ok", 6], [1080, 550, "collapsed", 0],
      [1150, 556, "roof", -8], [1230, 552, "ok", -4], [1300, 548, "roof", 4], [1370, 552, "ok", 0],
    ];
    back.forEach(([x, y, st, r], i) => {
      house(objL, x, y, { state: st, rot: r, fill: i % 3 ? P.fog : P.paper, roof: i % 2 ? P.steel : P.slate, lapH: st === "ok" ? 10 + (i % 3) * 3 : 6, chimney: i % 4 === 1, hole: i % 5 === 2 });
    });
    // MAIN STREET, far side: post office, diner, hardware (GULL HARBOR) — recognisable, flooded, battered
    const bld = el("g", { class: "tv-main-street" }, objL);
    // post office (flat roof, flag pole)
    const po = place(bld, 790, msY(790) - 8, 1, 0, "tv-post-office");
    {
      const s = sc(msY(790));
      sk.poly(po, [[0, 0], [-0, -40], [26, -52], [26, -12]], { fill: P.mist, stroke: P.slate, width: 2, seed: S(), double: false });
      sk.rect(po, -84, -40, 84, 40, { fill: P.fog, stroke: P.slate, width: 2.2, seed: S(), wobble: 0.6 });
      sk.poly(po, [[-86, -40], [0, -40], [26, -52], [-60, -52]], { fill: P.steel, stroke: P.slate, width: 2, seed: S(), double: false });
      sk.rect(po, -78, -36, 72, 10, { fill: P.paper, stroke: P.slate, width: 1.4, seed: S(), double: false });
      txt(po, -42, -28, "POST OFFICE", { size: 9, fill: P.storm, len: 62 });
      for (let i = 0; i < 4; i++) sk.rect(po, -76 + i * 19, -22, 10, 14, { fill: i === 1 ? P.night : P.slate, stroke: P.slate, width: 1.2, seed: S(), double: false });
      sk.line(po, -6, -52, -6, -86, { stroke: P.slate, width: 1.8, seed: S(), double: false });
      sk.path(po, [[-6, -84], [8, -80], [-6, -76]], { closed: true, fill: P.paper, stroke: P.slate, width: 1.2, seed: S(), double: false });
      sk.path(po, [[-84, -14], [0, -15], [26, -26]], { stroke: P.steel, width: 2.4, seed: S(), double: false });
      lap(po, -84, 26, 2, 8, 1, -6);
      void s;
    }
    // diner (rooftop sign hanging askew)
    const diner = place(bld, 920, msY(920) - 9, 1, 0, "tv-diner");
    sk.poly(diner, [[0, 0], [0, -36], [28, -48], [28, -12]], { fill: P.steel, stroke: P.slate, width: 2, seed: S(), double: false });
    sk.rect(diner, -96, -36, 96, 36, { fill: P.mist, stroke: P.slate, width: 2.2, seed: S(), wobble: 0.6 });
    sk.poly(diner, [[-98, -36], [0, -36], [28, -48], [-70, -48]], { fill: P.slate, stroke: P.slate, width: 2, seed: S(), double: false });
    for (let i = 0; i < 6; i++) sk.poly(diner, [[-94 + i * 16, -24], [-86 + i * 16, -24], [-87 + i * 16, -18], [-95 + i * 16, -18]], { fill: i % 2 ? P.fog : P.storm, stroke: "none", seed: S(), double: false });
    sk.rect(diner, -90, -16, 60, 13, { fill: P.night, stroke: P.slate, width: 1.2, seed: S(), double: false });
    const dsg = el("g", { transform: "rotate(14 -78 -48)" }, diner);
    lines(dsg, [[-78, -48, -78, -56], [-24, -48, -24, -56]], { stroke: P.slate, width: 2, opacity: 1 });
    sk.rect(dsg, -86, -72, 70, 18, { fill: P.paper, stroke: P.slate, width: 1.8, seed: S(), wobble: 0.4 });
    txt(dsg, -51, -58, "DINER", { size: 14, fill: P.storm, len: 54, ls: 2 });
    lap(diner, -96, 28, 2, 9, 1, -6);
    // hardware with the GULL HARBOR wall sign (tall brick block)
    const hw = place(bld, 1080, msY(1080) - 10, 1, 0, "tv-hardware");
    sk.poly(hw, [[0, 0], [0, -84], [30, -98], [30, -14]], { fill: P.slate, stroke: P.storm, width: 2, seed: S(), double: false });
    sk.rect(hw, -112, -84, 112, 84, { fill: P.steel, stroke: P.storm, width: 2.4, seed: S(), wobble: 0.7 });
    sk.poly(hw, [[-114, -84], [0, -84], [30, -98], [-84, -98]], { fill: P.slate, stroke: P.storm, width: 2, seed: S(), double: false });
    const br = [];
    for (let r = 0, y = -80; y < -2; r++, y += 6) { br.push([-110, y, -2, y]); for (let x = -108 + (r % 2) * 6; x < -2; x += 12) br.push([x, y, x, y + 6]); }
    lines(hw, br, { stroke: P.storm, width: 1, opacity: 0.25 });
    sk.rect(hw, -104, -78, 96, 30, { fill: P.storm, stroke: P.storm, width: 1.6, seed: S(), double: false });
    txt(hw, -56, -56, "GULL HARBOR", { size: 20, fill: P.paper, len: 86, ls: 1 });
    sk.rect(hw, -104, -44, 96, 10, { fill: P.slate, stroke: P.storm, width: 1.2, seed: S(), double: false });
    txt(hw, -56, -36, "HARDWARE", { size: 9, fill: P.fog, len: 50, ls: 1 });
    sk.rect(hw, -104, -30, 34, 24, { fill: P.night, stroke: P.storm, width: 1.4, seed: S(), double: false });
    sk.rect(hw, -42, -30, 34, 24, { fill: P.slate, stroke: P.storm, width: 1.4, seed: S(), double: false });
    sk.path(hw, [[-40, -30], [-24, -18], [-10, -26]], { stroke: P.fog, width: 1.2, seed: S(), double: false });
    sk.path(hw, [[-112, -20], [0, -21], [30, -33]], { stroke: P.mist, width: 2.6, seed: S(), double: false, opacity: 0.8 });
    sk.path(hw, [[-2, -84], [-14, -60], [-6, -46], [-18, -24]], { stroke: P.night, width: 1.6, seed: S(), double: false }); // crack
    // MAIN STREET, the rest of the far side to the east: houses, a church-ish hall
    [[1200, "ok", 3, 46], [1270, "gutted", -2, 50], [1340, "ok", -6, 44]].forEach(([x, st, r, w], i) => house(objL, x, msY(x) - 10, { state: st, rot: r, w, fill: i % 2 ? P.paper : P.fog, roof: P.slate, chimney: i === 1, lapH: i === 0 ? 6 : 0 }));

    // THE FERRY stranded across Main Street (bow shoved into the row, listing)
    const FX = 600, FY = 592;
    const ferryG = place(objL, FX, FY, 0.62, -9, "tv-ferry");
    {
      sk.poly(ferryG, [[-210, -40], [210, -40], [204, -12], [190, 18], [-176, 18], [-200, -10]], { fill: P.fog, stroke: P.slate, width: 3.2, seed: S(), wobble: 0.8 });
      sk.path(ferryG, [[-204, -24], [208, -24], [206, -14], [-202, -14]], { closed: true, fill: P.steel, stroke: "none", seed: S(), double: false });
      txt(ferryG, 30, -15, "M/V KITTIWAKE", { size: 15, fill: P.paper, len: 120, ls: 1 });
      sk.hatch(ferryG, -180, -8, 360, 24, { gap: 9, angle: 35, stroke: P.slate, width: 1.4, opacity: 0.35, seed: S() });
      sk.path(ferryG, [[-176, 18], [-60, 4], [60, 6], [190, 18]], { stroke: P.steel, width: 4, seed: S(), double: false, opacity: 0.8 }); // mud line on the hull
      sk.rect(ferryG, -168, -86, 330, 46, { fill: P.paper, stroke: P.slate, width: 2.6, seed: S(), wobble: 0.7 });
      for (let i = 0; i < 12; i++) sk.rect(ferryG, -156 + i * 26, -76, 15, 13, { fill: i % 4 === 1 ? P.night : P.slate, stroke: P.slate, width: 1.4, seed: S(), double: false });
      sk.rect(ferryG, -100, -118, 200, 32, { fill: P.fog, stroke: P.slate, width: 2.6, seed: S(), wobble: 0.5 });
      sk.rect(ferryG, -40, -150, 84, 32, { fill: P.paper, stroke: P.slate, width: 2.4, seed: S(), wobble: 0.5 });
      for (let i = 0; i < 4; i++) sk.rect(ferryG, -34 + i * 19, -142, 13, 11, { fill: P.slate, stroke: P.slate, width: 1.2, seed: S(), double: false });
      sk.line(ferryG, 2, -150, 2, -200, { stroke: P.slate, width: 2.6, seed: S(), double: false });
      sk.line(ferryG, -12, -188, 16, -188, { stroke: P.slate, width: 2, seed: S(), double: false });
      sk.poly(ferryG, [[60, -118], [64, -152], [88, -152], [90, -118]], { fill: P.steel, stroke: P.slate, width: 2.4, seed: S(), double: false });
      sk.line(ferryG, 62, -144, 89, -144, { stroke: P.paper, width: 2.6, seed: S(), double: false, opacity: 0.8 });
      // shattered superstructure where it hit the post office row
      sk.poly(ferryG, [[150, -86], [166, -86], [172, -60], [158, -50]], { fill: P.night, stroke: P.slate, width: 1.6, seed: S(), double: false });
      sk.path(ferryG, [[-210, -40], [-226, -60], [-210, -76]], { stroke: P.slate, width: 2, seed: S(), double: false }); // bent railing
    }
    // mud bank heaped against the hull + the lap of floodwater along its far end
    sk.path(objL, [[455, 628], [500, 612], [600, 606], [700, 596], [745, 604], [700, 620], [560, 632]], { closed: true, fill: P.slate, stroke: P.storm, width: 1.6, seed: S(), double: false, opacity: 0.9 });

    // near side of Main Street: battered houses, piled cars, debris, snapped poles
    const near = [
      [360, 662, "roof", 8, 1.0], [470, 676, "collapsed", 0, 1.0], [700, 676, "ok", 7, 1], [830, 686, "collapsed", 0, 1], [960, 690, "ok", -9, 1],
      [1100, 702, "ok", 4, 1], [1250, 704, "collapsed", 0, 1], [1340, 712, "ok", -14, 1],
    ];
    near.forEach(([x, y, st, r], i) => {
      const inWater = y < L0 + prof(x) - 4;
      house(objL, x, y, { state: st, rot: r, w: 52 + (i % 3) * 6, fill: i % 2 ? P.fog : P.mist, side: P.steel, roof: i % 2 ? P.slate : P.steel, lapH: inWater ? 12 : 0, chimney: i % 3 === 0, hole: i % 2 === 0, pad: st === "ok" && i % 2 === 0 ? [x - 46 * sc(y), y + 10] : null });
    });
    // shifted house: lifted off its slab and carried into the middle of a cross street
    house(objL, 1020, 650, { rot: -18, w: 50, fill: P.fog, roof: P.steel, pad: [1060, 664], lapH: 0, hole: true });
    // piled cars: against the hardware store, and against a house on the near side
    car(objL, 1118, 642, { rot: -6, fill: P.mist });
    car(objL, 1104, 630, { rot: 22, fill: P.fog, flip: true });
    car(objL, 1132, 622, { rot: -32, fill: P.steel });
    car(objL, 1150, 646, { rot: 10, fill: P.paper });
    car(objL, 645, 690, { rot: 8, fill: P.fog, lapH: 0 });
    car(objL, 662, 676, { rot: -24, fill: P.steel, flip: true });
    car(objL, 1000, 714, { rot: 14, fill: P.mist });
    car(objL, 300, 640, { rot: 26, fill: P.paper, lapH: 6 });
    car(objL, 860, 602, { rot: 40, fill: P.mist, flip: true });
    car(objL, 1420, 700, { rot: -10, fill: P.fog });
    // power poles along the near side of Main Street: leaning, snapped, lines down
    const poleRow = [[380, { lean: -18 }], [560, { snap: true }], [740, { lean: 24 }], [920, { lean: -6 }], [1100, { snap: true }], [1260, { lean: 32 }], [1420, { lean: -12 }]];
    const pr = poleRow.map(([x, o]) => pole(objL, x, msY(x) + msW(x) * 0.5 + 4, o));
    for (let i = 0; i < pr.length - 1; i++) {
      const a = pr[i].top, b = pr[i + 1].top;
      if (i === 1 || i === 4) { // snapped spans hang to the ground
        wire(objL, a, [a[0] + 60, msY(a[0] + 60) + 14], 18, { width: 1.3 });
        continue;
      }
      wire(objL, a, b, 18 + i * 3, { width: 1.3 });
      wire(objL, [a[0] + 3, a[1] + 5], [b[0] + 3, b[1] + 5], 26 + i * 2, { width: 1.1, opacity: 0.7 });
    }
    // debris lines: along Main Street's near edge, against the hill foot, through the back rows
    debrisLine(objL, [[420, 630], [600, 644], [800, 660], [1000, 672], [1180, 686], [1300, 694]], { dens: 0.9, thick: 10, seed: 41 });
    debrisLine(objL, [[540, 540], [700, 534], [880, 538], [1060, 532], [1250, 530], [1400, 528]], { dens: 0.8, thick: 8, seed: 57, width: 1.5 });
    debrisLine(objL, [[-20, 742], [200, 744], [420, 752], [700, 760], [950, 764], [1200, 760], [1420, 748]], { dens: 0.6, thick: 12, seed: 63, plank: P.steel, width: 1.5 });
    // uprooted trees lying in the mud
    [[250, 700, 18], [1180, 720, -12], [520, 712, 6]].forEach(([x, y, r]) => {
      const s = sc(y), tg = place(objL, x, y, s, r);
      sk.line(tg, -40, -2, 40, -6, { stroke: P.storm, width: lw(4, s), seed: S(), double: false });
      sk.path(tg, ellPts(-46, -6, 10, 9, 10), { closed: true, stroke: P.storm, width: lw(2, s), seed: S(), double: false, fill: P.slate });
      lines(tg, [[-46, -6, -58, -14], [-46, -6, -56, 2], [-46, -6, -44, -18]], { stroke: P.storm, width: lw(1.6, s), opacity: 0.9 });
      [[-10, -4], [10, -5], [28, -6]].forEach(([bx, by]) => lines(tg, [[bx, by, bx + 8, by - 10], [bx, by, bx + 10, by + 4]], { stroke: P.storm, width: lw(1.6, s), opacity: 0.8 }));
    });

    // ------------------------------------------------------------------ DALE'S GAS & GROCERY (east end of Main Street)
    const DX = 1468, DY = 652;
    const gasG = el("g", { class: "tv-dales" }, objL);
    const labelG = el("g", { class: "tv-dales-label" }, gasG);
    {
      // lot (mud + standing water)
      sk.path(gasG, [[1372, DY - 4], [1560, DY - 14], [1584, DY + 6], [1392, DY + 16]], { closed: true, fill: P.steel, stroke: P.slate, width: 1.6, seed: S(), double: false, opacity: 0.9 });
      sk.path(gasG, ellPts(1440, DY + 5, 30, 4, 14), { closed: true, fill: P.mist, stroke: "none", seed: S(), double: false, opacity: 0.8 });
      lines(gasG, [[1420, DY + 4, 1446, DY + 4], [1500, DY - 3, 1530, DY - 4]], { stroke: P.paper, width: 1.4, opacity: 0.6 });
      // store (east/right), box with side wall
      const SX0 = 1484, SX1 = 1566, SB = DY - 6, SH = 40;
      sk.poly(gasG, [[SX1, SB], [SX1, SB - SH], [SX1 + 20, SB - SH - 10], [SX1 + 20, SB - 10]], { fill: P.mist, stroke: P.slate, width: 2, seed: S(), double: false });
      sk.hatch(gasG, SX1, SB - SH - 10, 20, SH + 10, { gap: 5, angle: 70, stroke: P.slate, width: 1, opacity: 0.4, seed: S() });
      sk.rect(gasG, SX0, SB - SH, SX1 - SX0, SH, { fill: P.fog, stroke: P.storm, width: 2.4, seed: S(), wobble: 0.6 });
      sk.poly(gasG, [[SX0 - 2, SB - SH], [SX1 + 2, SB - SH], [SX1 + 22, SB - SH - 10], [SX0 + 18, SB - SH - 10]], { fill: P.slate, stroke: P.storm, width: 2, seed: S(), double: false });
      sk.rect(gasG, SX0 + 6, SB - 22, 22, 16, { fill: P.night, stroke: P.storm, width: 1.4, seed: S(), double: false });
      sk.path(gasG, [[SX0 + 8, SB - 20], [SX0 + 16, SB - 12], [SX0 + 26, SB - 18]], { stroke: P.fog, width: 1.1, seed: S(), double: false });
      sk.rect(gasG, SX0 + 34, SB - 24, 12, 24, { fill: P.storm, stroke: P.storm, width: 1.4, seed: S(), double: false });
      sk.rect(gasG, SX0 + 52, SB - 22, 24, 16, { fill: P.night, stroke: P.storm, width: 1.4, seed: S(), double: false });
      sk.path(gasG, [[SX0, SB - 12], [SX1, SB - 13], [SX1 + 20, SB - 22]], { stroke: P.steel, width: 2.2, seed: S(), double: false }); // mud line
      // fascia sign
      sk.rect(labelG, SX0 - 4, SB - SH - 4, SX1 - SX0 + 8, 16, { fill: P.paper, stroke: P.storm, width: 2, seed: S(), wobble: 0.4 });
      txt(labelG, (SX0 + SX1) / 2, SB - SH + 8.5, "DALE'S GAS & GROCERY", { size: 12, fill: P.storm, len: SX1 - SX0 - 2 });
      // canopy (west/left of the store) tilted on a buckled column
      const cg = el("g", { transform: `rotate(5 1388 ${DY - 42})` }, gasG);
      sk.poly(cg, [[1372, DY - 48], [1470, DY - 54], [1486, DY - 62], [1388, DY - 56]], { fill: P.mist, stroke: P.storm, width: 2, seed: S(), double: false });
      sk.poly(cg, [[1372, DY - 48], [1470, DY - 54], [1470, DY - 46], [1372, DY - 40]], { fill: P.fog, stroke: P.storm, width: 2, seed: S(), double: false });
      txt(cg, 1421, DY - 44.5, "GAS", { size: 7, fill: P.slate, len: 16 });
      sk.line(gasG, 1388, DY - 40, 1388, DY + 2, { stroke: P.storm, width: 3, seed: S(), double: false });
      sk.path(gasG, [[1458, DY - 38], [1462, DY - 22], [1454, DY - 12], [1458, DY - 2]], { stroke: P.storm, width: 3, seed: S(), double: false });
      // pumps (one down)
      sk.rect(gasG, 1412, DY - 18, 7, 16, { fill: P.paper, stroke: P.storm, width: 1.4, seed: S(), double: false });
      sk.poly(gasG, [[1430, DY - 2], [1446, DY - 6], [1447, DY - 1], [1431, DY + 3]], { fill: P.paper, stroke: P.storm, width: 1.4, seed: S(), double: false });
      // tall pole sign (labeled, findable)
      sk.line(labelG, 1350, DY + 4, 1356, DY - 96, { stroke: P.storm, width: 3, seed: S(), double: false });
      const ps = el("g", { transform: `rotate(-7 1356 ${DY - 96})` }, labelG);
      sk.rect(ps, 1320, DY - 132, 74, 34, { fill: P.paper, stroke: P.storm, width: 2.2, seed: S(), wobble: 0.4 });
      sk.rect(ps, 1324, DY - 128, 66, 26, { fill: "none", stroke: P.steel, width: 1.2, seed: S(), double: false });
      txt(ps, 1357, DY - 111, "DALE'S", { size: 17, fill: P.storm, len: 52, ls: 1 });
      txt(ps, 1357, DY - 102, "GAS & GROCERY", { size: 7, fill: P.slate, len: 52 });
      // car nosed into the canopy column + a boat hull in the lot
      car(gasG, 1470, DY + 2, { s: 0.7, rot: -16, fill: P.mist });
      const bh = place(gasG, 1530, DY + 6, 0.7, 6);
      sk.path(bh, [[-24, -2], [-18, -10], [20, -10], [26, -2], [18, 2], [-16, 2]], { closed: true, fill: P.fog, stroke: P.slate, width: 2, seed: S(), double: false });
      // leaning pole + line down across the lot
      sk.line(gasG, 1580, DY - 4, 1600, DY - 86, { stroke: P.storm, width: 3, seed: S(), double: false });
      sk.line(gasG, 1588, DY - 80, 1612, DY - 74, { stroke: P.storm, width: 2, seed: S(), double: false });
      sk.path(gasG, [[1600, DY - 84], [1570, DY - 40], [1540, DY - 6], [1500, DY + 6], [1460, DY + 6]], { stroke: P.night, width: 1.4, seed: S(), double: false, wobble: 0.8 });
    }
    const SMOKE = { x: 1520, y: 588 };

    // ------------------------------------------------------------------ BRIDGE over Gull Creek (broken)
    const bridgeG = el("g", { class: "tv-bridge" }, objL);
    const BX = 1738, BY = 622;
    {
      const deckY = (x) => 648 - (x - 1600) * 0.16; // highway grade across the creek
      const WY = (x) => deckY(x) + 30; // creek surface under the bridge
      // piers standing in the creek
      [1672, 1700, 1776, 1804].forEach((x) => {
        sk.rect(bridgeG, x - 4, deckY(x) + 6, 8, 24, { fill: P.mist, stroke: P.storm, width: 1.8, seed: S(), double: false });
        sk.path(bridgeG, [[x - 9, WY(x)], [x + 9, WY(x)]], { stroke: P.fog, width: 1.6, seed: S(), double: false, opacity: 0.8 });
      });
      // a deck section: girder face + deck top + railing. y0/y1 = deck top at x0/x1
      const seg = (x0, x1, y0, y1) => {
        sk.poly(bridgeG, [[x0, y0 + 3], [x1, y1 + 3], [x1, y1 + 10], [x0, y0 + 10]], { fill: P.fog, stroke: P.storm, width: 2.2, seed: S(), double: false, wobble: 0.4 });
        sk.poly(bridgeG, [[x0, y0 - 2], [x1, y1 - 2], [x1, y1 + 3], [x0, y0 + 3]], { fill: P.steel, stroke: P.storm, width: 1.6, seed: S(), double: false, wobble: 0.3 });
        const r = [], n = Math.max(2, Math.round(Math.abs(x1 - x0) / 9));
        for (let i = 0; i <= n; i++) { const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t; r.push([x, y - 2, x, y - 9]); }
        r.push([x0, y0 - 9, x1, y1 - 9]);
        lines(bridgeG, r, { stroke: P.storm, width: 1.6, opacity: 0.9 });
      };
      seg(1640, 1700, deckY(1640), deckY(1700));
      seg(1700, 1718, deckY(1700), deckY(1700) + 20); // west end broken off, hanging into the creek
      seg(1760, 1776, deckY(1776) + 24, deckY(1776)); // east span tipped down at its broken end
      seg(1776, 1850, deckY(1776), deckY(1850));
      // the GAP: a fallen slab in the creek, churning water, bent rebar
      sk.poly(bridgeG, [[1722, WY(1730) - 2], [1752, WY(1745) - 10], [1756, WY(1745) - 4], [1726, WY(1730) + 4]], { fill: P.steel, stroke: P.storm, width: 1.8, seed: S(), double: false });
      sk.path(bridgeG, ellPts(1738, WY(1738) + 2, 26, 4, 14), { closed: true, stroke: P.paper, width: 1.6, seed: S(), double: false, opacity: 0.85 });
      lines(bridgeG, [[1718, deckY(1700) + 18, 1724, deckY(1700) + 26], [1719, deckY(1700) + 14, 1727, deckY(1700) + 17], [1760, deckY(1776) + 20, 1754, deckY(1776) + 28], [1760, deckY(1776) + 16, 1751, deckY(1776) + 18]], { stroke: P.night, width: 1.4, opacity: 0.9 });
      // highway sign by the bridge
      sk.line(bridgeG, 1626, 664, 1626, 628, { stroke: P.storm, width: 2, seed: S(), double: false });
      sk.rect(bridgeG, 1606, 614, 40, 16, { fill: P.steel, stroke: P.storm, width: 1.6, seed: S(), double: false });
      txt(bridgeG, 1626, 626, "GULL CREEK", { size: 8, fill: P.paper, len: 34 });
      // a car stopped short of the gap on the far side
      car(bridgeG, 1818, deckY(1818) - 1, { s: 0.55, rot: -9, fill: P.mist });
    }

    // ------------------------------------------------------------------ HAZE (pushes the town back; keeps the action zone quiet)
    const hazeL = layer("haze");
    const hz = el("linearGradient", { id: uid + "haze", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    [[0, 0.35], [0.35, 0.22], [0.75, 0.1], [1, 0.04]].forEach(([o, a]) => el("stop", { offset: o, "stop-color": P.fog, "stop-opacity": a * (0.5 + FOG) }, hz));
    el("rect", { x: -40, y: 300, width: 2000, height: 500, fill: `url(#${uid}haze)` }, hazeL);
    const fb = el("filter", { id: uid + "fogblur", x: "-10%", y: "-60%", width: "120%", height: "220%" }, defs);
    el("feGaussianBlur", { stdDeviation: 7 }, fb);
    const fogBanks = el("g", { filter: `url(#${uid}fogblur)` }, hazeL);
    function fogBank(par, x0, x1, cy, h, op, sd) {
      const pts = [], n = Math.max(6, Math.round((x1 - x0) / 70));
      for (let i = 0; i <= n; i++) { const t = i / n; pts.push([x0 + (x1 - x0) * t, cy - Math.sin(t * Math.PI) * h * (0.6 + 0.4 * rnd(sd + i))]); }
      for (let i = n; i >= 0; i--) { const t = i / n; pts.push([x0 + (x1 - x0) * t, cy + Math.sin(t * Math.PI) * h * 0.25]); }
      sk.path(par, pts, { closed: true, fill: P.paper, stroke: "none", seed: sd, wobble: 4, double: false, opacity: op * FOG });
    }
    fogBank(fogBanks, -60, 700, HORIZON + 10, 22, 0.5, S());
    fogBank(fogBanks, 900, 1600, HORIZON + 4, 18, 0.45, S());
    fogBank(fogBanks, 1450, 2000, 470, 40, 0.55, S()); // in the creek valley
    fogBank(fogBanks, 1250, 1980, 360, 30, 0.4, S());
    fogBank(fogBanks, 380, 1100, 470, 16, 0.35, S()); // low over the waterfront
    fogBank(fogBanks, 1100, 1700, 520, 18, 0.3, S());
    fogBank(fogBanks, -40, 520, 560, 20, 0.3, S());

    // ------------------------------------------------------------------ SLOPE below the lip (tree crowns from below) + the hill flank at right with the path
    const slopeL = layer("slope");
    const SLOPE = [[-20, 790], [300, 770], [600, 778], [900, 772], [1200, 770], [1380, 744], [1460, 694], [1560, 690], [1700, 706], [1820, 690], [1960, 676], [1960, 900], [-20, 900]];
    sk.path(slopeL, SLOPE, { closed: true, fill: P.slate, stroke: P.storm, width: LINE.detail, seed: S(), wobble: 2 });
    sk.hatch(clipTo(slopeL, SLOPE), -20, 670, 1980, 230, { gap: 12, angle: 62, stroke: P.storm, width: 1.6, opacity: 0.28, seed: S() });
    const scrub = [];
    for (let i = 0; i < 80; i++) { const x = ((i * 89) % 1940) - 10, y = 760 + ((i * 37) % 100); scrub.push([x, y, x + 4, y - 9], [x + 6, y, x + 10, y - 7]); }
    lines(slopeL, scrub, { stroke: P.mist, width: 1.5, opacity: 0.25 });
    // tree crowns rising from below the lip (left cluster, a few centre-right, the flank)
    [[120, 860, 150], [196, 860, 120], [40, 870, 170], [270, 870, 100], [520, 880, 90], [1180, 880, 96], [1290, 870, 120], [1840, 760, 110], [1900, 770, 140], [1760, 780, 80]].forEach(([x, b, h]) => fir(slopeL, x, b, h, { fill: P.steel, stroke: P.slate, width: 2, tiers: 4, noTrunk: true }));
    // the trail down the flank (screen-space route), with a trail post at the top
    const PATH = [[1630, 878], [1690, 846], [1604, 812], [1676, 780], [1580, 748], [1626, 722], [1530, 702], [1490, 684], [1470, 670]];
    const PSC = PATH.map(([, y]) => +Math.max(0.12, Math.min(0.42, 0.12 + (y - 670) * 0.00144)).toFixed(3));
    const pathG = el("g", { class: "tv-path" }, slopeL);
    sk.path(pathG, PATH, { stroke: P.storm, width: 9, seed: S(), wobble: 1, double: false, opacity: 0.55 });
    const ptr = sk.path(pathG, PATH, { stroke: P.mist, width: 4, seed: S(), wobble: 1, double: false, opacity: 0.85 });
    ptr.querySelectorAll("path").forEach((p) => p.setAttribute("stroke-dasharray", "12 7"));
    // little rocks along the switchbacks
    PATH.slice(1, -1).forEach(([x, y], i) => sk.path(pathG, ellPts(x + (i % 2 ? 10 : -10), y + 3, 4, 2.5, 8), { closed: true, fill: P.mist, stroke: P.storm, width: 1.2, seed: S(), double: false }));

    // ------------------------------------------------------------------ LIP: wet grass, broken fence, fir trunks
    const lipL = layer("lip");
    const LIP = [[-20, 860], [140, 852], [320, 858], [520, 850], [760, 856], [1000, 852], [1240, 858], [1480, 850], [1600, 862], [1720, 856], [1900, 850], [1960, 854]];
    sk.path(lipL, LIP.concat([[1960, 1100], [-20, 1100]]), { closed: true, fill: P.storm, stroke: P.night, width: LINE.main, seed: S(), wobble: 1.5 });
    sk.path(lipL, LIP.map((p) => [p[0], p[1] + 12]), { stroke: P.slate, width: 8, seed: S(), double: false, opacity: 0.8 });
    // grass tufts along the edge (the only real detail band; feet stand at y 880)
    const tufts = [];
    for (let i = 0; i < 150; i++) {
      const x = (i * 13.1) % 1940, by = 858 + ((i * 7) % 14);
      const l = 8 + (i % 5) * 3;
      tufts.push([x, by, x - 3, by - l], [x + 3, by, x + 5, by - l * 0.8]);
    }
    lines(lipL, tufts, { stroke: P.slate, width: 2, opacity: 0.9 });
    lines(lipL, tufts.filter((_, i) => i % 3 === 0), { stroke: P.mist, width: 1.4, opacity: 0.35 });
    // wet sheen + a couple of puddles near the lip
    [[700, 900, 60, 7], [1260, 906, 46, 6]].forEach(([cx, cy, rx, ry]) => {
      sk.path(lipL, ellPts(cx, cy, rx, ry, 18), { closed: true, fill: P.slate, stroke: P.night, width: 1.6, seed: S(), double: false });
      lines(lipL, [[cx - rx * 0.5, cy - 1, cx - rx * 0.1, cy - 1], [cx + rx * 0.1, cy + 2, cx + rx * 0.45, cy + 2]], { stroke: P.fog, width: 1.6, opacity: 0.5 });
    });
    // the trailhead: worn mud through the grass
    sk.path(lipL, [[1556, 864], [1610, 856], [1700, 858], [1720, 872], [1690, 896], [1610, 904], [1566, 890]], { closed: true, fill: P.slate, stroke: "none", seed: S(), double: false, opacity: 0.9, wobble: 2 });
    lines(lipL, [[1584, 872, 1606, 876], [1640, 884, 1668, 882], [1620, 866, 1646, 868]], { stroke: P.storm, width: 2, opacity: 0.7 });
    // very low-detail caption zone (y >= 940)
    lines(lipL, [[80, 980, 220, 984], [600, 1010, 760, 1012], [1180, 990, 1300, 992], [1600, 1030, 1760, 1032]], { stroke: P.slate, width: 2, opacity: 0.5 });
    // broken fence: left run (one rail snapped and hanging), right run (post knocked over)
    const fenceG = el("g", { class: "tv-fence" }, lipL);
    const post = (x, by, h, lean) => {
      const t = rotPt([x, by - h], x, by, lean || 0);
      sk.path(fenceG, [[x - 5, by], [t[0] - 4, t[1]], [t[0] + 4, t[1] - 2], [x + 5, by]], { closed: true, fill: P.slate, stroke: P.night, width: 3, seed: S(), wobble: 0.6 });
      lines(fenceG, [[x - 1, by - 10, t[0] - 1, t[1] + 8]], { stroke: P.mist, width: 1.2, opacity: 0.3 });
      return t;
    };
    const rail = (a, b) => {
      sk.path(fenceG, [a, b, [b[0], b[1] + 8], [a[0], a[1] + 8]], { closed: true, fill: P.steel, stroke: P.night, width: 2.5, seed: S(), wobble: 0.6 });
      lines(fenceG, [[a[0] + 6, a[1] + 4, b[0] - 6, b[1] + 4]], { stroke: P.storm, width: 1.2, opacity: 0.6 });
    };
    post(30, 872, 104); post(140, 868, 102, -3); post(250, 872, 100, 6);
    rail([22, 790], [148, 786]); rail([22, 830], [148, 828]);
    rail([140, 788], [252, 792]);
    sk.path(fenceG, [[146, 830], [208, 846], [214, 856], [150, 840]], { closed: true, fill: P.steel, stroke: P.night, width: 2.5, seed: S() }); // snapped rail hanging
    post(330, 872, 46, 18); // broken stub
    sk.path(fenceG, [[260, 878], [370, 870], [372, 878], [262, 886]], { closed: true, fill: P.steel, stroke: P.night, width: 2.5, seed: S() }); // rail in the grass
    post(1730, 868, 100, -4); post(1830, 872, 104); post(1910, 870, 100, 3);
    rail([1726, 790], [1836, 786]); rail([1830, 788], [1930, 792]); rail([1830, 828], [1930, 830]);
    sk.path(fenceG, [[1736, 830], [1800, 846], [1808, 854], [1742, 842]], { closed: true, fill: P.steel, stroke: P.night, width: 2.5, seed: S() });
    // trail post with a small evacuation-route plate at the trailhead (steel/paper)
    sk.rect(fenceG, 1700, 800, 10, 72, { fill: P.slate, stroke: P.night, width: 3, seed: S(), wobble: 0.4 });
    sk.rect(fenceG, 1684, 776, 42, 28, { fill: P.steel, stroke: P.night, width: 2.5, seed: S(), wobble: 0.4 });
    el("path", { d: "M1692 798 L1705 784 L1718 798 M1705 786 L1705 800", stroke: P.paper, "stroke-width": 2.4, fill: "none", "stroke-linecap": "round", transform: "rotate(180 1705 791)" }, fenceG);
    // fir trunks framing the view (left edge, right edge) + boughs dipping in from the top corners
    const trunk = (x, w, topY, by) => {
      sk.path(lipL, [[x - w / 2, by], [x - w * 0.42, topY], [x + w * 0.42, topY], [x + w / 2, by]], { closed: true, fill: P.storm, stroke: P.night, width: LINE.main, seed: S(), wobble: 1.2 });
      const bark = [];
      for (let y = topY + 20; y < by - 10; y += 26) bark.push([x - w * 0.25 + rnd(y) * 6, y, x - w * 0.2 + rnd(y + 1) * 6, y + 18], [x + w * 0.12, y + 10, x + w * 0.18, y + 26]);
      lines(lipL, bark, { stroke: P.slate, width: 2, opacity: 0.7 });
    };
    trunk(64, 58, -20, 878); trunk(178, 24, 120, 866);
    trunk(1868, 52, -20, 876);
    // drooping fir bough: a sweeping limb with a ragged, layered needle mass hanging under it
    const bough = (x0, y0, x1, y1, dir) => {
      const n = 14, top = [], bot = [];
      for (let i = 0; i <= n; i++) {
        const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t + Math.sin(t * Math.PI) * 18 + t * t * 26;
        const th = (1 - t * 0.6) * 16;
        top.push([x, y - th * 0.5]);
        bot.push([x + dir * 4, y + th * (i % 2 ? 1.9 : 0.9) + 4]);
      }
      sk.path(lipL, top.concat(bot.reverse()), { closed: true, fill: P.storm, stroke: P.night, width: 2.5, seed: S(), wobble: 1.6, double: false });
      sk.path(lipL, top.map((p, i) => [p[0], p[1] + 6 + (i % 3)]), { stroke: P.slate, width: 2, seed: S(), double: false, opacity: 0.8 });
      const nd = [];
      top.forEach((p, i) => { if (i % 2 === 0 && i > 0) nd.push([p[0], p[1] + 8, p[0] + dir * 6, p[1] + 26], [p[0] - dir * 3, p[1] + 10, p[0] - dir * 1, p[1] + 24]); });
      lines(lipL, nd, { stroke: P.night, width: 1.6, opacity: 0.7 });
      sk.path(lipL, [[x0, y0], [x0 + (x1 - x0) * 0.6, y0 + (y1 - y0) * 0.6 + 16]], { stroke: P.night, width: 4, seed: S(), double: false });
    };
    bough(64, 40, 320, 110, 1); bough(64, 180, 260, 250, 1); bough(178, 300, 330, 350, 1); bough(64, 360, 200, 420, 1);
    bough(1868, 60, 1640, 120, -1); bough(1868, 220, 1700, 280, -1); bough(1868, 400, 1760, 450, -1);
    // drips hanging from the boughs (it's all wet)
    [[150, 152], [240, 128], [300, 136], [220, 276], [1700, 146], [1760, 140], [1740, 306]].forEach(([x, y]) => el("path", { d: `M${x} ${y} q 2 6 0 9 q -2 -3 0 -9`, fill: P.mist, stroke: "none", opacity: 0.8 }, lipL));

    // vignette (moody edges, gentler than Episode 1 — it's daylight)
    const vg = el("radialGradient", { id: uid + "vig", cx: 0.5, cy: 0.5, r: 0.75 }, defs);
    [[0.6, 0], [1, 0.42]].forEach(([o, a]) => el("stop", { offset: o, "stop-color": P.night, "stop-opacity": a }, vg));
    el("rect", { x: -40, y: -40, width: 2000, height: 1160, fill: `url(#${uid}vig)`, "pointer-events": "none" }, g);

    setLevel(opts.level !== undefined ? opts.level : L0);

    return {
      g,
      groundY: GROUND,
      gasStation: { g: gasG, x: DX, y: DY, smokeX: SMOKE.x, smokeY: SMOKE.y, labelG },
      bridge: { g: bridgeG, x: BX, y: BY, gapX0: 1716, gapX1: 1762 },
      path: { g: pathG, points: PATH.map((p) => p.slice()), scales: PSC },
      water,
      town: { g: townL, mainStreet: MS, ferry: { g: ferryG, x: FX, y: FY }, buildings: { postOffice: po, diner, hardware: hw }, wrack: { g: wrackG } },
      sky: { g: skyL },
      sea: { g: seaL, horizonY: HORIZON },
      fogG: hazeL,
      lip: { g: lipL, fence: { g: fenceG } },
      layers: { sky: skyL, sea: seaL, town: townL, water: waterL, haze: hazeL, slope: slopeL, lip: lipL },
    };
  };
})();
