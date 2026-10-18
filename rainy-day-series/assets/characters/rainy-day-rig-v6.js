/* Rainy Day rig — v6 (v5 + opts.slim: the reference-video look — thin stick figure, half-weight lines, a narrow coat/jacket,
 * thin sleeves; same skeleton, poses, IK walk and driver). v5 = (v4 + RD.walkPose / RD.drive: a procedural IK walk with planted feet and a segment driver; Mags restyled for the
 * Episode 1 remake: neutral gray coat, white hair; worried/scared brows now slant up at the inner ends). v4 = (v3 + window.__rdTalkRemap: authored talk re-timed onto the voice track). v3 = v2 + Episode 2 cast: Gord, Tess, generic townspeople "extra". v2 = v1 + mouth flaps driven by
 * window.__rdSpeech, the voice-track timing. Shared characters, hand-drawn line helpers, rain and camera shake.
 * Drizzle and Mags render exactly as in v2.
 *
 * HOW TO USE IN A SCENE: paste this file VERBATIM inside your scene's <template><script>, before your own
 * code (it is guarded, so it defines window.RainyDay once). Everything is deterministic and seek-safe:
 * every visual is a pure function of timeline time, driven from tween onUpdate callbacks.
 *
 * Coordinates: SVG user units = canvas px for an <svg viewBox="0 0 1920 1080">.
 *
 *   const RD = window.RainyDay;
 *   const drizzle = RD.figure(layer, { character: "drizzle", x: 700, y: 640, scale: 1.4 });
 *   const mags    = RD.figure(layer, { character: "mags",    x: 1100, y: 640, scale: 1.4, facing: -1 });
 *   RD.animate(tl, drizzle, [
 *     { t: 0,   pose: "idle" },
 *     { t: 1.2, pose: "walkA", x: 760 }, { t: 1.5, pose: "walkB", x: 820 },
 *     { t: 2.0, pose: "point", talk: true, face: "smile" },
 *     { t: 3.4, pose: "idle",  talk: false },
 *   ], { start: 0, end: SCENE_DURATION });
 *
 * x/y = the HIP when standing. The GROUND line is y + 116*scale for every pose (crouch/cover/sit lower the
 * hip themselves via the pose's dy), so keep y fixed on flat ground and change poses.
 * Angles (deg): limbs measured from straight DOWN; positive = toward the facing direction (forward).
 * Elbow/knee values are RELATIVE bends. torso: 0 upright, + leans forward. head: + nods forward.
 * Poses: idle, idleB, walkA, walkB, runA, runB, crouch, cover, holdOn, point, talk, shrug, think, reach,
 *        carry, wave, waveB, sit, kneel, lie, cheer, lookUp, brace.
 * Faces: neutral, smile, grin, o, worried, scared, determined, closed, talk (mouth flaps automatically).
 * Keyframe fields: t (scene-local s), pose (name | object from RD.mix), x, y, scale, facing (1|-1), face,
 *                  talk (true/false — flaps the mouth while true), ease (arriving ease, default power2.inOut),
 *                  and the prop toggles bag, radio, clipboard, clipboardHand, duffel, duffelAt (switch, not tween).
 * One RD.animate call per figure per scene (it drives everything from ONE proxy tween).
 *
 * Costumes are part of the character: Drizzle ALWAYS wears the yellow slicker with the hood up (and can
 * wear the go-bag: { bag: true }). Mags wears her cardigan, glasses, gray bun, and holds the hand-crank radio
 * in her left hand ({ radio: false } to hide it, e.g. when she sets it down).
 *
 * v3 — EPISODE 2 CAST (all muted grays; slicker yellow stays Drizzle's alone):
 *   character: "gord"  — Gord Pike, self-appointed camp leader. Big and broad (torso/head ×1.08, wider shoulders,
 *       stands chest-out), flat slate newsboy cap, gray stubble, quilted puffy steel vest over slate shirt sleeves,
 *       heavy brows. SIGNATURE PROP: a clipboard (paper checklist + clipped pen) in his hand.
 *       opts: { clipboard: true (default), clipboardHand: "l" (default, the far hand — drawn in front like Mags'
 *       radio) | "r" (the near hand; avoid with "point", which uses the right arm) }.
 *       The board hangs from the hand when the forearm is down (idle/walk), tilts with the forearm, and comes upright
 *       "being read" when the forearm is raised (talk, think, carry). fig.joints.clipboard = board centre.
 *   character: "tess"  — Tess Varga, quiet wary stockpiler. Slim, steel knit beanie with a fog pom, dark ponytail
 *       out the back, long slate coat with night collar/belt, thin brows. SIGNATURE PROP: a big steel duffel with a
 *       padlock on the zipper, on a shoulder strap. opts: { duffel: true (default),
 *       duffelAt: "auto" (default) | "side" | "lap" | "ground" }.
 *       auto: "side" = hangs at her hip from the shoulder strap and swings with walk/run; "lap" for sit (bag across her
 *       thighs, strap slack); "ground" for crouch/cover/holdOn/kneel/lie/brace-low (bag on the ground behind her).
 *       fig.joints.duffel = bag centre.
 *   character: "extra" — generic townsperson for crowds: fog face, no brows, figure opacity 0.9.
 *       opts: { coat: "mist" (default) | "steel" | "slate" | "fog", hat: "none" (default) | "beanie" | "cap" |
 *       "hood", hair: "short" (default) | "none" | "long" | "bun", hairColor / hatColor: a palette NAME
 *       ("night" | "storm" | "slate" | "steel" | "mist" | "fog" | "hair"), kid: false | true,
 *       seed: number (line-boil seed; defaults from x so a crowd does not boil in sync),
 *       speaker: "name" (key into window.__rdSpeech; default "extra") }.
 *       kid: true draws a child (≈0.7 height, bigger head, shorter torso) standing on the SAME ground line as an
 *       adult with the same y/scale — so put kids at the same y as the grown-ups beside them. All poses work.
 *   Every character: same poses, faces, talk and __rdSpeech flaps (keyed by opts.speaker || character).
 */
(function () {
  if (window.RainyDay) return;
  const NS = "http://www.w3.org/2000/svg";

  const palette = {
    night: "#141B26", storm: "#24303F", slate: "#3A4A5E", steel: "#5B6E85", mist: "#8FA0B4",
    fog: "#C3CDD8", paper: "#E6EAEE", ink: "#10161F", slicker: "#F2C230", slickerShade: "#C99A16",
    cardigan: "#6F7E92", hair: "#F3F4F5", magsCoat: "#8E9298", magsSleeve: "#74787F",
  };
  const LINE = { figure: 8, main: 4, detail: 2 };
  const INK = palette.ink;
  const L = { torso: 96, neck: 12, head: 27, upArm: 52, loArm: 50, upLeg: 60, loLeg: 58 };

  const POSES = {
    idle: { torso: 0, head: 0, lsh: -8, lel: 6, rsh: 8, rel: 6, lhip: -6, lkn: 2, rhip: 6, rkn: 2, dy: 0 },
    idleB: { torso: 1, head: 3, lsh: -6, lel: 10, rsh: 10, rel: 10, lhip: -6, lkn: 2, rhip: 6, rkn: 2, dy: 1 },
    walkA: { torso: 4, head: 0, lsh: 28, lel: 20, rsh: -24, rel: 10, lhip: -22, lkn: 8, rhip: 24, rkn: 20, dy: -3 },
    walkB: { torso: 4, head: 0, lsh: -24, lel: 10, rsh: 28, rel: 20, lhip: 24, lkn: 20, rhip: -22, rkn: 8, dy: -3 },
    runA: { torso: 16, head: -4, lsh: -40, lel: 85, rsh: 55, rel: 75, lhip: -38, lkn: -70, rhip: 62, rkn: -55, dy: -6 },
    runB: { torso: 16, head: -4, lsh: 55, lel: 75, rsh: -40, rel: 85, lhip: 62, lkn: -55, rhip: -38, rkn: -70, dy: -6 },
    crouch: { torso: 30, head: 16, lsh: 50, lel: 30, rsh: 62, rel: 30, lhip: 95, lkn: -120, rhip: 80, rkn: -115, dy: 58 },
    cover: { torso: 42, head: 26, lsh: 150, lel: 45, rsh: 160, rel: 50, lhip: 100, lkn: -128, rhip: 88, rkn: -122, dy: 64 },
    holdOn: { torso: 36, head: 20, lsh: 160, lel: 50, rsh: 82, rel: -4, lhip: 100, lkn: -128, rhip: 88, rkn: -122, dy: 64 },
    point: { torso: 0, head: -4, lsh: -8, lel: 6, rsh: 96, rel: 0, lhip: -6, lkn: 2, rhip: 6, rkn: 2, dy: 0 },
    talk: { torso: 2, head: 2, lsh: 20, lel: 70, rsh: 35, rel: 60, lhip: -6, lkn: 2, rhip: 6, rkn: 2, dy: 0 },
    shrug: { torso: 0, head: -4, lsh: -45, lel: -70, rsh: 45, rel: 70, lhip: -6, lkn: 2, rhip: 6, rkn: 2, dy: 0 },
    think: { torso: 0, head: 8, lsh: -8, lel: 6, rsh: 40, rel: 120, lhip: -6, lkn: 2, rhip: 6, rkn: 2, dy: 0 },
    reach: { torso: 18, head: 8, lsh: 70, lel: 10, rsh: 95, rel: 8, lhip: -10, lkn: 4, rhip: 12, rkn: 4, dy: 0 },
    carry: { torso: 8, head: -2, lsh: 70, lel: 70, rsh: 80, rel: 65, lhip: -14, lkn: 10, rhip: 16, rkn: 10, dy: 0 },
    wave: { torso: -2, head: -6, lsh: -10, lel: 8, rsh: 160, rel: 25, lhip: -6, lkn: 2, rhip: 6, rkn: 2, dy: 0 },
    waveB: { torso: -2, head: -6, lsh: -10, lel: 8, rsh: 150, rel: -25, lhip: -6, lkn: 2, rhip: 6, rkn: 2, dy: 0 },
    sit: { torso: -10, head: 4, lsh: -32, lel: 4, rsh: 30, rel: 40, lhip: 84, lkn: -6, rhip: 70, rkn: 28, dy: 96 },
    kneel: { torso: 12, head: 14, lsh: 40, lel: 30, rsh: 55, rel: 35, lhip: 70, lkn: -90, rhip: -5, rkn: 100, dy: 50 },
    lie: { torso: -90, head: 0, lsh: 160, lel: 10, rsh: 10, rel: -60, lhip: 90, lkn: 0, rhip: 84, rkn: 8, dy: 88 },
    cheer: { torso: -4, head: -10, lsh: -160, lel: -10, rsh: 160, rel: 10, lhip: -10, lkn: 2, rhip: 10, rkn: 2, dy: 0 },
    lookUp: { torso: -6, head: -22, lsh: -12, lel: 8, rsh: 12, rel: 8, lhip: -6, lkn: 2, rhip: 6, rkn: 2, dy: 0 },
    brace: { torso: 6, head: 6, lsh: -55, lel: 30, rsh: 55, rel: 30, lhip: -26, lkn: 22, rhip: 26, rkn: 22, dy: 14 },
  };
  const KEYS = Object.keys(POSES.idle);

  function mix(base, over) {
    const b = typeof base === "string" ? POSES[base] : base;
    return Object.assign({}, b, over || {});
  }
  function hash(n) {
    const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return (s - Math.floor(s)) * 2 - 1;
  }
  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  const f1 = (v) => v.toFixed(1);

  // ---------------------------------------------------------------- hand-drawn line helpers
  // Points get a small seeded wobble and every stroke is doubled by a faint offset pass, so lines read
  // as pen-drawn. Static: call once at build time. opts: { stroke, width, fill, seed, wobble, double, opacity }
  function wobblePts(pts, seed, amt) {
    return pts.map(([x, y], i) => [x + hash(seed * 13 + i * 7.1) * amt, y + hash(seed * 17 + i * 3.3) * amt]);
  }
  function densify(pts, step, closed) {
    const out = [];
    const n = pts.length;
    for (let i = 0; i < (closed ? n : n - 1); i++) {
      const a = pts[i], b = pts[(i + 1) % n];
      const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const k = Math.max(1, Math.round(d / step));
      for (let j = 0; j < k; j++) out.push([a[0] + ((b[0] - a[0]) * j) / k, a[1] + ((b[1] - a[1]) * j) / k]);
    }
    if (!closed) out.push(pts[n - 1]);
    return out;
  }
  function ptsToD(pts, closed) {
    return "M" + pts.map((p) => f1(p[0]) + " " + f1(p[1])).join(" L") + (closed ? " Z" : "");
  }
  const sk = {
    path(parent, pts, o) {
      o = o || {};
      const seed = o.seed || 1, amt = o.wobble !== undefined ? o.wobble : 1.6;
      const g = el("g", { opacity: o.opacity !== undefined ? o.opacity : 1 }, parent);
      const dense = densify(pts, o.step || 28, !!o.closed);
      if (o.fill && o.fill !== "none") el("path", { d: ptsToD(dense, true), fill: o.fill, stroke: "none" }, g);
      const w = o.width || LINE.main;
      el("path", { d: ptsToD(wobblePts(dense, seed, amt), o.closed), fill: "none", stroke: o.stroke || INK, "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
      if (o.double !== false) el("path", { d: ptsToD(wobblePts(dense, seed + 101, amt * 1.4), o.closed), fill: "none", stroke: o.stroke || INK, "stroke-width": Math.max(1, w * 0.45), opacity: 0.45, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
      return g;
    },
    line(parent, x1, y1, x2, y2, o) {
      return sk.path(parent, [[x1, y1], [x2, y2]], o);
    },
    rect(parent, x, y, w, h, o) {
      return sk.path(parent, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], Object.assign({ closed: true }, o));
    },
    poly(parent, pts, o) {
      return sk.path(parent, pts, Object.assign({ closed: true }, o));
    },
    circle(parent, cx, cy, r, o) {
      const n = Math.max(12, Math.round(r / 4));
      const pts = [];
      for (let i = 0; i < n; i++) pts.push([cx + Math.cos((i / n) * Math.PI * 2) * r, cy + Math.sin((i / n) * Math.PI * 2) * r]);
      return sk.path(parent, pts, Object.assign({ closed: true, step: 1000 }, o));
    },
    hatch(parent, x, y, w, h, o) {
      // diagonal pen hatching for shading: o.gap, o.angle (deg), o.stroke, o.width, o.opacity
      o = o || {};
      const gap = o.gap || 14, a = ((o.angle || 45) * Math.PI) / 180;
      const g = el("g", { opacity: o.opacity !== undefined ? o.opacity : 0.35 }, parent);
      const cid = "rdclip" + Math.round(Math.abs(hash((o.seed || 1) + x * 0.37 + y * 0.11)) * 1e9);
      const cp = el("clipPath", { id: cid }, g);
      el("rect", { x, y, width: w, height: h }, cp);
      const inner = el("g", { "clip-path": `url(#${cid})` }, g);
      const span = w + h;
      for (let i = -span; i < span; i += gap) {
        const x1 = x + i, y1 = y, x2 = x1 + Math.cos(a) * span, y2 = y1 + Math.sin(a) * span;
        el("line", { x1: f1(x1), y1: f1(y1), x2: f1(x2), y2: f1(y2), stroke: o.stroke || INK, "stroke-width": o.width || LINE.detail, "stroke-linecap": "round" }, inner);
      }
      return g;
    },
  };

  // ---------------------------------------------------------------- characters
  // v3: per-character build config. Drizzle/Mags values are exactly the v2 constants (k/headK/torsoK/armK = 1),
  // so their output is unchanged. k = overall size (kid 0.7, ground line kept), headK/torsoK/armK = proportions.
  const CHARS = ["drizzle", "mags", "gord", "tess", "extra"];
  const EXTRA_COATS = {
    mist: [palette.mist, palette.steel], steel: [palette.steel, palette.slate],
    slate: [palette.slate, palette.storm], fog: [palette.fog, palette.mist],
  };
  const NAMED = { night: palette.night, storm: palette.storm, slate: palette.slate, steel: palette.steel, mist: palette.mist, fog: palette.fog, hair: palette.hair };
  // v6: slim = reference stick-figure look (thin limbs, narrow jacket). Skeleton and poses are unchanged.
  const SLIM = {
    drizzle: { lwK: 0.5, armW: 1.06, topW: 13, hemW: 19, coatLen: 1.1 },
    mags: { lwK: 0.5, armW: 1, topW: 12, hemW: 18, coatLen: 1.25 },
    extra: { lwK: 0.5, armW: 0.92, topW: 11, hemW: 14 },
  };
  function charCfg(who, opts) {
    const C = charCfgBase(who, opts);
    if (!opts.slim) return C;
    const sl = Object.assign({ slim: true }, SLIM[who] || SLIM.extra);
    if (C.kid) sl.lwK *= 1.2;
    return Object.assign(C, sl);
  }
  function charCfgBase(who, opts) {
    const base = { k: 1, headK: 1, torsoK: 1, armK: 1, armW: 1, lwK: 1, hunch: 0, coatLen: 1.0, topW: 24, hemW: 32, seed: 0, headFill: palette.paper };
    if (who === "drizzle") return Object.assign(base, { coatLen: 1.22, hemW: 40, coat: palette.slicker, sleeveBack: palette.slickerShade, sleeveFront: palette.slicker });
    if (who === "mags") return Object.assign(base, { hunch: 7, coatLen: 1.3, hemW: 36, coat: palette.magsCoat, sleeveBack: palette.magsSleeve, sleeveFront: palette.magsCoat });
    if (who === "gord") return Object.assign(base, { headK: 1.08, torsoK: 1.08, armK: 1.04, armW: 1.08, hunch: -2, coatLen: 1.02, topW: 31, hemW: 37, seed: 7, coat: palette.steel, sleeveBack: palette.storm, sleeveFront: palette.slate });
    if (who === "tess") return Object.assign(base, { headK: 0.96, armW: 0.86, hunch: 3, coatLen: 1.5, topW: 19, hemW: 31, seed: 13, coat: palette.slate, sleeveBack: palette.night, sleeveFront: palette.slate });
    // extra: generic muted townsperson
    const kid = !!opts.kid;
    const cc = EXTRA_COATS[opts.coat] || EXTRA_COATS.mist;
    const hat = ["none", "beanie", "cap", "hood"].indexOf(opts.hat) >= 0 ? opts.hat : "none";
    const hair = ["none", "short", "long", "bun"].indexOf(opts.hair) >= 0 ? opts.hair : "short";
    return Object.assign(base, {
      k: kid ? 0.7 : 1, headK: kid ? 1.24 : 1, torsoK: kid ? 0.86 : 1, armK: kid ? 0.9 : 1, armW: 0.92, lwK: kid ? 1.25 : 1,
      coatLen: kid ? 1.0 : 1.08, topW: 22, hemW: kid ? 27 : 30,
      seed: opts.seed !== undefined ? opts.seed : 29 + Math.round(Math.abs(opts.x || 0) * 0.37),
      coat: cc[0], sleeveBack: cc[1], sleeveFront: cc[0], headFill: palette.fog, opacity: kid ? 0.95 : 0.9,
      hat, hair, kid,
      hairColor: NAMED[opts.hairColor] || (cc[0] === palette.slate ? palette.mist : palette.slate),
      hatColor: NAMED[opts.hatColor] || (hat === "hood" ? cc[0] : cc[1]),
    });
  }

  function figure(parent, opts) {
    opts = opts || {};
    const who = CHARS.indexOf(opts.character) >= 0 && opts.character !== "drizzle" ? opts.character : "drizzle";
    const isNew = who === "gord" || who === "tess" || who === "extra";
    const C = charCfg(who, opts);
    const hood = who === "drizzle" || (who === "extra" && C.hat === "hood");
    const g = el("g", { class: "rd-figure rd-" + who + (C.kid ? " rd-kid" : "") }, parent);
    if (C.opacity !== undefined) g.setAttribute("opacity", C.opacity);
    const shadow = el("ellipse", { rx: 70, ry: 10, fill: INK, opacity: 0.18 }, g);
    const body = el("g", {}, g);
    const line = { stroke: INK, "stroke-linecap": "round", "stroke-linejoin": "round", fill: "none" };
    // layer order: back limbs → coat → front limbs → head
    const P = {};
    P.lleg = el("path", line, body);
    P.larmOut = el("path", line, body);
    P.larmFill = el("path", Object.assign({}, line, { stroke: C.sleeveBack }), body);
    P.larmHand = el("path", line, body);
    P.bag = el("g", {}, body);
    P.coat = el("path", { fill: C.coat, stroke: INK, "stroke-linejoin": "round" }, body);
    P.coatDetail = el("path", Object.assign({}, line, { opacity: 0.55 }), body);
    if (who === "gord") P.quilt = el("path", Object.assign({}, line, { stroke: palette.storm }), body);
    if (who === "tess") P.coatTrim = el("path", Object.assign({}, line, { stroke: palette.night }), body);
    P.rleg = el("path", line, body);
    P.bootL = el("ellipse", { fill: INK }, body);
    P.bootR = el("ellipse", { fill: INK }, body);
    if (who === "tess") { P.duffel = el("g", {}, body); P.duffelStrap = el("path", line, body); }
    P.rarmOut = el("path", line, body);
    P.rarmFill = el("path", Object.assign({}, line, { stroke: C.sleeveFront }), body);
    P.rarmHand = el("path", line, body);
    P.radio = el("g", {}, body);
    if (who === "gord") { P.clip = el("g", {}, body); P.clipThumb = el("path", line, body); }
    const headG = el("g", {}, body);
    P.hoodBack = el("path", { fill: hood && who !== "drizzle" ? C.hatColor : palette.slicker, stroke: INK, "stroke-linejoin": "round" }, headG);
    P.bun = el("circle", { fill: isNew ? C.hairColor || palette.hair : palette.hair, stroke: INK }, headG);
    if (isNew) P.xBack = el("path", { fill: who === "tess" ? palette.night : C.hairColor, stroke: INK, "stroke-linejoin": "round" }, headG);
    P.head = el("circle", { fill: C.headFill, stroke: INK }, headG);
    P.hoodRim = el("path", Object.assign({}, line, { stroke: hood && who !== "drizzle" ? C.hatColor : palette.slicker }), headG);
    P.hoodRimInk = el("path", line, headG);
    P.hair = el("path", Object.assign({}, line, { stroke: isNew ? C.hairColor || palette.hair : palette.hair }), headG);
    if (who === "gord") P.beard = el("path", { fill: palette.mist, stroke: palette.steel, "stroke-linejoin": "round", opacity: 0.85 }, headG);
    P.eyeL = el("circle", { fill: INK }, headG);
    P.eyeR = el("circle", { fill: INK }, headG);
    P.glasses = el("path", Object.assign({}, line, { opacity: who === "mags" ? 1 : 0 }), headG);
    P.brow = el("path", line, headG);
    P.mouth = el("path", line, headG);
    if (isNew) {
      P.hat = el("path", { fill: who === "gord" ? palette.slate : who === "tess" ? palette.steel : C.hatColor, stroke: INK, "stroke-linejoin": "round" }, headG);
      P.hatBand = el("path", Object.assign({}, line, { stroke: who === "tess" ? palette.slate : who === "gord" ? palette.storm : palette.storm }), headG);
      P.hatInk = el("path", line, headG);
      P.pom = el("circle", { fill: palette.fog, stroke: INK }, headG);
    }
    // radio prop (Mags)
    el("rect", { x: -20, y: -13, width: 40, height: 26, rx: 4, fill: palette.steel, stroke: INK, "stroke-width": 3 }, P.radio);
    el("circle", { cx: -7, cy: 0, r: 7, fill: palette.fog, stroke: INK, "stroke-width": 2 }, P.radio);
    el("line", { x1: 6, y1: -6, x2: 15, y2: -6, stroke: INK, "stroke-width": 2 }, P.radio);
    el("line", { x1: 6, y1: 0, x2: 15, y2: 0, stroke: INK, "stroke-width": 2 }, P.radio);
    el("line", { x1: 12, y1: -13, x2: 22, y2: -40, stroke: INK, "stroke-width": 3, "stroke-linecap": "round" }, P.radio);
    el("path", { d: "M20 6 l 10 4 l -3 8", stroke: INK, "stroke-width": 3, fill: "none", "stroke-linecap": "round" }, P.radio);
    // go-bag (Drizzle, worn on the back)
    el("rect", { x: -26, y: -34, width: 40, height: 58, rx: 8, fill: palette.slate, stroke: INK, "stroke-width": 3 }, P.bag);
    el("rect", { x: -22, y: -6, width: 32, height: 18, rx: 4, fill: palette.steel, stroke: INK, "stroke-width": 2 }, P.bag);
    // clipboard (Gord). Local frame: board centred on 0,0, +x = facing direction, top = -y.
    if (P.clip) {
      el("rect", { x: -18, y: -25, width: 36, height: 50, rx: 4, fill: palette.slate, stroke: INK, "stroke-width": 3.2 }, P.clip);
      el("rect", { x: -13.5, y: -17, width: 27, height: 37, rx: 1, fill: palette.paper, stroke: INK, "stroke-width": 1.6 }, P.clip);
      [-7, -1, 5, 11].forEach((yy, i) => el("line", { x1: -3, y1: yy, x2: i % 2 ? 8 : 10, y2: yy, stroke: palette.steel, "stroke-width": 2, "stroke-linecap": "round" }, P.clip));
      [-7, -1, 5].forEach((yy) => el("path", { d: `M-10 ${yy} l 2 2 l 4 -4`, fill: "none", stroke: INK, "stroke-width": 1.6, "stroke-linecap": "round", "stroke-linejoin": "round" }, P.clip));
      el("rect", { x: -9.5, y: 9, width: 4, height: 4, fill: "none", stroke: INK, "stroke-width": 1.4 }, P.clip);
      // pen tucked under the clip, sticking up and out
      el("line", { x1: 2, y1: -14, x2: 17, y2: -40, stroke: INK, "stroke-width": 6.5, "stroke-linecap": "round" }, P.clip);
      el("line", { x1: 3, y1: -16, x2: 15.5, y2: -37.5, stroke: palette.fog, "stroke-width": 2.8, "stroke-linecap": "round" }, P.clip);
      el("line", { x1: 15, y1: -36.5, x2: 17, y2: -40, stroke: INK, "stroke-width": 3, "stroke-linecap": "round" }, P.clip);
      el("rect", { x: -9, y: -29, width: 18, height: 10, rx: 2.5, fill: palette.mist, stroke: INK, "stroke-width": 2.2 }, P.clip);
      el("line", { x1: -5, y1: -24, x2: 5, y2: -24, stroke: INK, "stroke-width": 1.4, opacity: 0.6 }, P.clip);
    }
    // padlocked duffel (Tess). Local frame: origin = top centre where the strap meets, bag hangs below (y 2..44).
    if (P.duffel) {
      el("path", { d: "M-16 6 Q 0 -8 16 6", fill: "none", stroke: INK, "stroke-width": 3.4, "stroke-linecap": "round" }, P.duffel);
      el("rect", { x: -42, y: 3, width: 84, height: 42, rx: 19, fill: palette.steel, stroke: INK, "stroke-width": 3.6 }, P.duffel);
      el("ellipse", { cx: -33, cy: 24, rx: 7.5, ry: 17, fill: palette.slate, stroke: INK, "stroke-width": 2.2 }, P.duffel);
      el("ellipse", { cx: 33, cy: 24, rx: 7.5, ry: 17, fill: palette.slate, stroke: INK, "stroke-width": 2.2 }, P.duffel);
      el("line", { x1: -14, y1: 4, x2: -14, y2: 44, stroke: palette.slate, "stroke-width": 4 }, P.duffel);
      el("line", { x1: 14, y1: 4, x2: 14, y2: 44, stroke: palette.slate, "stroke-width": 4 }, P.duffel);
      el("path", { d: "M-25 11 L 22 11", fill: "none", stroke: INK, "stroke-width": 2.4, "stroke-dasharray": "2.2 2", "stroke-linecap": "butt" }, P.duffel);
      el("path", { d: "M-25 11 L 22 11", fill: "none", stroke: INK, "stroke-width": 1, opacity: 0.6 }, P.duffel);
      // padlock on the zipper pull
      el("path", { d: "M18.5 19 v -4.5 a 5 5 0 0 1 10 0 v 4.5", fill: "none", stroke: INK, "stroke-width": 2.6, "stroke-linecap": "round" }, P.duffel);
      el("rect", { x: 15.5, y: 18, width: 16, height: 13, rx: 2.5, fill: palette.fog, stroke: INK, "stroke-width": 2.4 }, P.duffel);
      el("circle", { cx: 23.5, cy: 23.2, r: 1.8, fill: INK }, P.duffel);
      el("line", { x1: 23.5, y1: 23.5, x2: 23.5, y2: 27.5, stroke: INK, "stroke-width": 1.6, "stroke-linecap": "round" }, P.duffel);
    }

    const fig = {
      g, who, speaker: opts.speaker || who,
      state: Object.assign({ x: 960, y: 640, scale: 1, facing: 1, face: "neutral", talk: false, shadow: 1, bag: false, radio: who === "mags", clipboard: who === "gord", clipboardHand: "l", duffel: who === "tess", duffelAt: "auto" }, POSES.idle, opts.pose ? mix(opts.pose) : {}, opts),
      joints: {},
      time: 0,
      hand(side) { return this.joints[side === "l" ? "lhand" : "rhand"]; },
      foot(side) { return this.joints[side === "l" ? "lfoot" : "rfoot"]; },
      headPos() { return this.joints.head; },
      draw(t) {
        if (t !== undefined) this.time = t;
        const s = this.state, f = s.facing >= 0 ? 1 : -1;
        // kids: shrink everything about the ground line so x/y/scale keep meaning "hip of an adult on this ground"
        const sc = C.k === 1 ? s.scale : s.scale * C.k;
        const y0 = C.k === 1 ? s.y : s.y + 116 * s.scale * (1 - C.k);
        const step = Math.floor(this.time * 8);
        const j = (i) => hash(step * 31 + i + C.seed) * 1.2;
        const hunch = C.hunch;
        const torsoA = s.torso + hunch;
        const W = (lp, i) => [s.x + lp[0] * sc * f + j(i), y0 + lp[1] * sc + j(i + 50)];
        const T = L.torso * C.torsoK, HL = L.head * C.headK, UA = L.upArm * C.armK, LA = L.loArm * C.armK;
        const hip = [0, s.dy];
        const td = [Math.sin((torsoA * Math.PI) / 180), -Math.cos((torsoA * Math.PI) / 180)];
        const shoulder = [hip[0] + td[0] * T, hip[1] + td[1] * T];
        const neckTop = [shoulder[0] + td[0] * L.neck, shoulder[1] + td[1] * L.neck];
        const headC = [neckTop[0] + td[0] * HL, neckTop[1] + td[1] * HL];
        const dir = (a) => [Math.sin((a * Math.PI) / 180), Math.cos((a * Math.PI) / 180)];
        const limb = (root, a1, a2, l1, l2) => {
          const d1 = dir(a1), mid = [root[0] + d1[0] * l1, root[1] + d1[1] * l1];
          const d2 = dir(a1 + a2), end = [mid[0] + d2[0] * l2, mid[1] + d2[1] * l2];
          return [mid, end];
        };
        const sh = [shoulder[0] - td[0] * 8, shoulder[1] - td[1] * 8];
        const [lelb, lhand] = limb(sh, s.lsh + torsoA, s.lel, UA, LA);
        const [relb, rhand] = limb(sh, s.rsh + torsoA, s.rel, UA, LA);
        const [lkn, lfoot] = limb(hip, s.lhip, s.lkn, L.upLeg, L.loLeg);
        const [rkn, rfoot] = limb(hip, s.rhip, s.rkn, L.upLeg, L.loLeg);
        const pts = (arr, i0) => arr.map((p, k) => W(p, i0 + k));
        const D = (arr) => "M" + arr.map((p) => f1(p[0]) + " " + f1(p[1])).join(" L");
        const sw = C.lwK === 1 ? LINE.figure * sc : LINE.figure * sc * C.lwK;
        // legs + boots
        P.lleg.setAttribute("d", D(pts([hip, lkn, lfoot], 1)));
        P.rleg.setAttribute("d", D(pts([hip, rkn, rfoot], 4)));
        P.lleg.setAttribute("stroke-width", f1(sw)); P.rleg.setAttribute("stroke-width", f1(sw));
        P.lleg.setAttribute("opacity", 0.85);
        const fl = W(lfoot, 3), fr = W(rfoot, 6);
        [[P.bootL, fl], [P.bootR, fr]].forEach(([e, p]) => {
          e.setAttribute("cx", f1(p[0] + 6 * sc * f)); e.setAttribute("cy", f1(p[1] - 2 * sc));
          e.setAttribute("rx", f1(13 * sc)); e.setAttribute("ry", f1(7 * sc));
        });
        // arms: ink outline (wide) + sleeve color (narrower) for the upper+lower arm, hand stub in ink
        const sleeveEnd = (elb, hand) => [elb[0] + (hand[0] - elb[0]) * 0.82, elb[1] + (hand[1] - elb[1]) * 0.82];
        const aw = C.armW;
        const armDraw = (out, fill, hand, elb, hd, i0) => {
          const se = sleeveEnd(elb, hd);
          const p = pts([sh, elb, se], i0);
          out.setAttribute("d", D(p)); out.setAttribute("stroke-width", f1(aw === 1 ? sw * 2.6 : sw * 2.6 * aw));
          fill.setAttribute("d", D(p)); fill.setAttribute("stroke-width", f1(aw === 1 ? sw * 1.7 : sw * (2.6 * aw - 0.9)));
          hand.setAttribute("d", D(pts([se, hd], i0 + 3))); hand.setAttribute("stroke-width", f1(sw));
        };
        armDraw(P.larmOut, P.larmFill, P.larmHand, lelb, lhand, 10);
        armDraw(P.rarmOut, P.rarmFill, P.rarmHand, relb, rhand, 20);
        P.larmOut.setAttribute("opacity", 0.9);
        // coat: a trapezoid hung from the shoulders along the torso, hem below the hip
        const nrm = [-td[1], td[0]];
        let coatLen = C.coatLen;
        // v3: long coats (Tess, extras) must not poke through the ground when sitting/kneeling: shorten the hem
        if (isNew && coatLen > 1 && shoulder[1] - td[1] * T * coatLen > 108) coatLen = Math.max(1, (108 - shoulder[1]) / (-td[1] * T || 1));
        const hem = [shoulder[0] - td[0] * T * coatLen, shoulder[1] - td[1] * T * coatLen];
        const topW = C.topW, hemW = C.hemW;
        const cpts = [
          [sh[0] + nrm[0] * topW, sh[1] + nrm[1] * topW], [sh[0] - nrm[0] * topW, sh[1] - nrm[1] * topW],
          [hem[0] - nrm[0] * hemW, hem[1] - nrm[1] * hemW], [hem[0] + nrm[0] * hemW, hem[1] + nrm[1] * hemW],
        ];
        const along = (u, w) => [sh[0] + (hem[0] - sh[0]) * u + nrm[0] * w, sh[1] + (hem[1] - sh[1]) * u + nrm[1] * w];
        const widthAt = (u) => topW + (hemW - topW) * u;
        if (who === "gord") {
          // puffy vest: each side bulges between the quilt seams
          const N = 4, side = (sgn, rev) => {
            const out = [];
            for (let q = 0; q <= N * 2; q++) {
              const u = q / (N * 2), bulge = q % 2 ? 5 : 0;
              out.push(along(u, sgn * (widthAt(u) + bulge)));
            }
            return rev ? out.reverse() : out;
          };
          const vpts = side(-1, false).concat(side(1, true));
          P.coat.setAttribute("d", D(pts(vpts, 30)) + " Z");
        } else {
          P.coat.setAttribute("d", D(pts(cpts, 30)) + " Z");
        }
        P.coat.setAttribute("stroke-width", f1(LINE.main * sc * 1.2));
        // coat detail: front seam + (Drizzle) toggles / (Mags) pocket
        const seamTop = [sh[0] + td[0] * 0, sh[1]], seamBot = hem;
        let det = D(pts([[sh[0] + nrm[0] * 4, sh[1] + nrm[1] * 4], [hem[0] + nrm[0] * 4, hem[1] + nrm[1] * 4]], 40));
        if (who === "drizzle") {
          for (let k = 1; k <= 3; k++) {
            const u = k / 4, cx = sh[0] + (hem[0] - sh[0]) * u + nrm[0] * 4, cy = sh[1] + (hem[1] - sh[1]) * u + nrm[1] * 4;
            const a = W([cx - nrm[0] * 9, cy - nrm[1] * 9], 44 + k), b = W([cx + nrm[0] * 9, cy + nrm[1] * 9], 48 + k);
            det += ` M${f1(a[0])} ${f1(a[1])} L${f1(b[0])} ${f1(b[1])}`;
          }
        } else if (who === "mags") {
          const pc = [sh[0] + (hem[0] - sh[0]) * 0.7 - nrm[0] * 16, sh[1] + (hem[1] - sh[1]) * 0.7 - nrm[1] * 16];
          const a = W([pc[0] - 9, pc[1] - 7], 52), b = W([pc[0] + 9, pc[1] + 9], 53);
          det += ` M${f1(a[0])} ${f1(a[1])} L${f1(b[0])} ${f1(a[1])} L${f1(b[0])} ${f1(b[1])} L${f1(a[0])} ${f1(b[1])} Z`;
        } else if (who === "gord") {
          // zip pull + open collar V
          const zp = W(along(0.1, 4), 54), zq = W(along(0.2, 4), 55);
          det += ` M${f1(zp[0])} ${f1(zp[1])} L${f1(zq[0])} ${f1(zq[1])}`;
        } else if (who === "tess") {
          // two buttons
          [0.3, 0.55].forEach((u, k) => {
            const c = W(along(u, 9), 56 + k), r = 2.6 * sc;
            det += ` M${f1(c[0] - r)} ${f1(c[1])} a ${f1(r)} ${f1(r)} 0 1 0 ${f1(2 * r)} 0 a ${f1(r)} ${f1(r)} 0 1 0 ${f1(-2 * r)} 0`;
          });
        }
        void seamTop; void seamBot;
        P.coatDetail.setAttribute("d", det);
        P.coatDetail.setAttribute("stroke-width", f1(LINE.detail * sc * 1.4));
        if (P.quilt) {
          // horizontal quilt seams + a storm-gray collar
          let q = "";
          for (let k = 1; k < 4; k++) {
            const u = k / 4, wq = widthAt(u) - 1;
            const a = W(along(u, -wq), 60 + k), m = W(along(u + 0.035, 0), 63 + k), b = W(along(u, wq), 66 + k);
            q += ` M${f1(a[0])} ${f1(a[1])} Q${f1(m[0])} ${f1(m[1])} ${f1(b[0])} ${f1(b[1])}`;
          }
          const c1 = W(along(-0.02, -14), 70), c2 = W(along(0.12, 3), 71), c3 = W(along(-0.02, 16), 72);
          q += ` M${f1(c1[0])} ${f1(c1[1])} L${f1(c2[0])} ${f1(c2[1])} L${f1(c3[0])} ${f1(c3[1])}`;
          P.quilt.setAttribute("d", q.trim());
          P.quilt.setAttribute("stroke-width", f1(2.6 * sc));
        }
        if (P.coatTrim) {
          // dark collar + belt across the long coat
          const b1 = W(along(0.5, -widthAt(0.5) + 1), 73), b2 = W(along(0.5, widthAt(0.5) - 1), 74);
          const c1 = W(along(-0.02, -12), 75), c2 = W(along(0.14, 4), 76), c3 = W(along(-0.02, 15), 77);
          P.coatTrim.setAttribute("d", `M${f1(b1[0])} ${f1(b1[1])} L${f1(b2[0])} ${f1(b2[1])} M${f1(c1[0])} ${f1(c1[1])} L${f1(c2[0])} ${f1(c2[1])} L${f1(c3[0])} ${f1(c3[1])}`);
          P.coatTrim.setAttribute("stroke-width", f1(5 * sc));
        }
        // go-bag on the back
        if (who === "drizzle" && s.bag) {
          const bl = [hip[0] + td[0] * 58 - nrm[0] * 34, hip[1] + td[1] * 58 - nrm[1] * 34];
          const bc = W(bl, 60);
          P.bag.setAttribute("transform", `translate(${f1(bc[0])} ${f1(bc[1])}) rotate(${f1(torsoA * f)}) scale(${f1(sc * f)} ${f1(sc)})`);
          P.bag.setAttribute("opacity", 1);
        } else P.bag.setAttribute("opacity", 0);
        // radio in Mags' left hand
        if (who === "mags" && s.radio) {
          const rh = W(lhand, 13);
          P.radio.setAttribute("transform", `translate(${f1(rh[0])} ${f1(rh[1] + 10 * sc)}) scale(${f1(sc * f)} ${f1(sc)})`);
          P.radio.setAttribute("opacity", 1);
        } else P.radio.setAttribute("opacity", 0);
        // clipboard in Gord's hand: hangs from the hand when the forearm is down, stands upright (being read)
        // when the forearm comes up; tilts with the forearm in between.
        let clipC = null;
        if (P.clip) {
          if (s.clipboard) {
            const side = s.clipboardHand === "r" ? "r" : "l";
            const hd = side === "l" ? lhand : rhand;
            const fa = side === "l" ? s.lsh + torsoA + s.lel : s.rsh + torsoA + s.rel;
            const u = Math.min(1, Math.max(0, (fa - 30) / 70)), us = u * u * (3 - 2 * u);
            const hang = -Math.min(60, Math.max(-40, fa)) * 0.45;
            const rot = hang + (12 - hang) * us;
            const ox = 13 + (12 - 13) * us, oy = 19 + (-15 - 19) * us;
            const hw = W(hd, side === "l" ? 13 : 23);
            P.clip.setAttribute("transform", `translate(${f1(hw[0])} ${f1(hw[1])}) rotate(${f1(rot * f)}) scale(${f1(sc * f)} ${f1(sc)}) translate(${f1(ox)} ${f1(oy)})`);
            P.clip.setAttribute("opacity", 1);
            // thumb over the board edge so it reads as gripped
            const r = (rot * f * Math.PI) / 180, tx = 6 * sc * f, ty = -2 * sc;
            const tp = [hw[0] + tx * Math.cos(r) - ty * Math.sin(r), hw[1] + tx * Math.sin(r) + ty * Math.cos(r)];
            P.clipThumb.setAttribute("d", `M${f1(hw[0])} ${f1(hw[1])} L${f1(tp[0])} ${f1(tp[1])}`);
            P.clipThumb.setAttribute("stroke-width", f1(sw * 1.05));
            const cr = [ox * sc * f, oy * sc];
            clipC = [hw[0] + cr[0] * Math.cos(r) - cr[1] * Math.sin(r), hw[1] + cr[0] * Math.sin(r) + cr[1] * Math.cos(r)];
          } else {
            P.clip.setAttribute("opacity", 0);
            P.clipThumb.setAttribute("d", "");
          }
        }
        // padlocked duffel (Tess): on the shoulder strap at her hip (swings with the stride); on her lap when she
        // sits; on the ground beside her when she crouches/kneels/lies. duffelAt: "auto" | "side" | "lap" | "ground"
        let duffC = null;
        if (P.duffel) {
          if (s.duffel) {
            let mode = s.duffelAt;
            if (mode !== "side" && mode !== "lap" && mode !== "ground") {
              const thigh = (s.lhip + s.rhip) / 2, knee = (Math.abs(s.lkn) + Math.abs(s.rkn)) / 2;
              mode = s.torso < -60 ? "ground" : s.dy >= 80 && thigh > 55 && knee < 60 ? "lap" : s.dy >= 36 ? "ground" : "side";
            }
            let o, rot;
            if (mode === "side") {
              const swing = (s.rhip - s.lhip) * 0.13;
              o = [hip[0] + td[0] * 8 - nrm[0] * 14, hip[1] + td[1] * 8 - nrm[1] * 14];
              rot = torsoA * 0.35 + swing;
            } else if (mode === "lap") {
              const a = (s.lhip + s.rhip) / 2, d = dir(a);
              rot = 90 - a;
              const lap = [hip[0] + d[0] * 28, hip[1] + d[1] * 28];
              const rr = (rot * Math.PI) / 180;
              o = [lap[0] + 47 * Math.sin(rr), lap[1] - 47 * Math.cos(rr)];
            } else {
              o = [hip[0] - 64, 116 - 46];
              rot = 0;
            }
            const ow = W(o, 80);
            const r = (rot * f * Math.PI) / 180;
            const bp = (lx, ly) => { const x = lx * sc * f, y = ly * sc; return [ow[0] + x * Math.cos(r) - y * Math.sin(r), ow[1] + x * Math.sin(r) + y * Math.cos(r)]; };
            P.duffel.setAttribute("transform", `translate(${f1(ow[0])} ${f1(ow[1])}) rotate(${f1(rot * f)}) scale(${f1(sc * f)} ${f1(sc)})`);
            P.duffel.setAttribute("opacity", 1);
            const ea = bp(-30, 8), eb = bp(30, 8);
            if (mode === "side") {
              const so = W([sh[0] - nrm[0] * 6, sh[1] - nrm[1] * 6], 81);
              P.duffelStrap.setAttribute("d", `M${f1(ea[0])} ${f1(ea[1])} L${f1(so[0])} ${f1(so[1])} L${f1(eb[0])} ${f1(eb[1])}`);
            } else {
              const mid = bp(0, -30);
              P.duffelStrap.setAttribute("d", `M${f1(ea[0])} ${f1(ea[1])} Q${f1(mid[0])} ${f1(mid[1])} ${f1(eb[0])} ${f1(eb[1])}`);
            }
            P.duffelStrap.setAttribute("stroke-width", f1(4.2 * sc));
            duffC = bp(0, 24);
          } else {
            P.duffel.setAttribute("opacity", 0);
            P.duffelStrap.setAttribute("d", "");
          }
        }
        // head
        const hc = W(headC, 70);
        const hr = C.headK === 1 ? L.head * sc : L.head * sc * C.headK;
        const scH = C.headK === 1 ? sc : sc * C.headK;
        P.head.setAttribute("cx", f1(hc[0])); P.head.setAttribute("cy", f1(hc[1])); P.head.setAttribute("r", f1(hr));
        P.head.setAttribute("stroke-width", f1(sw));
        const tilt = (s.head + torsoA) * f;
        const fx = (dx, dy) => {
          const r = (tilt * Math.PI) / 180, x = dx * f * scH, y = dy * scH;
          return [hc[0] + x * Math.cos(r) - y * Math.sin(r), hc[1] + x * Math.sin(r) + y * Math.cos(r)];
        };
        const pt = (p) => f1(p[0]) + " " + f1(p[1]);
        if (hood) {
          // hood UP: a yellow shell behind/around the head, open toward the face, with an inked rim
          const R = hr * 1.42;
          const back = fx(-10, -4);
          P.hoodBack.setAttribute("d", `M${pt(fx(16, -31))} Q${pt(fx(0, -54))} ${pt(fx(-18, -50))} Q${pt(fx(-46, -38))} ${pt(fx(-44, -2))} Q${pt(fx(-44, 30))} ${pt(fx(-30, 40))} L${pt(fx(12, 44))} Q${pt(fx(26, 36))} ${pt(fx(22, 24))} Q${pt(fx(38, 0))} ${pt(fx(16, -31))} Z`);
          P.hoodBack.setAttribute("stroke-width", f1(LINE.main * sc * 1.2));
          P.hoodRim.setAttribute("d", `M${pt(fx(15, -30))} Q${pt(fx(34, 0))} ${pt(fx(19, 27))}`);
          P.hoodRim.setAttribute("stroke-width", f1(7 * sc));
          P.hoodRimInk.setAttribute("d", `M${pt(fx(20, -29))} Q${pt(fx(40, 0))} ${pt(fx(23, 26))}`);
          P.hoodRimInk.setAttribute("stroke-width", f1(LINE.main * sc));
          P.bun.setAttribute("r", 0);
          P.hair.setAttribute("d", "");
          void R; void back;
        } else if (who === "mags") {
          P.hoodBack.setAttribute("d", ""); P.hoodRim.setAttribute("d", ""); P.hoodRimInk.setAttribute("d", "");
          const bn = C.slim ? fx(-9, -29) : fx(-20, -24);   /* v6 slim: a small top-knot, so it never reads as an ear */
          P.bun.setAttribute("cx", f1(bn[0])); P.bun.setAttribute("cy", f1(bn[1])); P.bun.setAttribute("r", f1((C.slim ? 9.5 : 13) * sc));
          P.bun.setAttribute("stroke-width", f1(LINE.main * sc));
          P.hair.setAttribute("d", `M${pt(fx(-27, 8))} Q${pt(fx(-30, -22))} ${pt(fx(-6, -27))} Q${pt(fx(8, -29))} ${pt(fx(18, -21))} M${pt(fx(-23, 14))} Q${pt(fx(-26, -12))} ${pt(fx(-10, -21))}`);
          P.hair.setAttribute("stroke-width", f1(5 * sc));
        } else {
          P.hoodBack.setAttribute("d", ""); P.hoodRim.setAttribute("d", ""); P.hoodRimInk.setAttribute("d", "");
          P.bun.setAttribute("r", 0);
          P.hair.setAttribute("d", "");
        }
        if (isNew) {
          // v3 heads: hair behind the head (xBack), hair strokes, hats in front, Gord's stubble
          const hairStyle = who === "extra" ? C.hair : "none";
          const hat = who === "gord" ? "newsboy" : who === "tess" ? "pom" : C.hat;
          let back = "", hairD = "", hatD = "", band = "", hatInk = "";
          if (who === "tess") {
            // ponytail out the back, under the beanie; sways a little with the stride
            const sway = (s.rhip - s.lhip) * 0.08;
            back = `M${pt(fx(-20, -8))} Q${pt(fx(-42, -10))} ${pt(fx(-48 - sway, 12))} Q${pt(fx(-52 - sway, 30))} ${pt(fx(-44 - sway * 1.4, 44))} Q${pt(fx(-38 - sway, 26))} ${pt(fx(-24, 8))} Z`;
            hairD = `M${pt(fx(-30, -6))} L${pt(fx(-27, -1))}`;
          } else if (hairStyle === "long" && hat !== "hood") {
            back = `M${pt(fx(-6, -28))} Q${pt(fx(-36, -26))} ${pt(fx(-34, 6))} Q${pt(fx(-34, 30))} ${pt(fx(-22, 40))} L${pt(fx(-6, 34))} Q${pt(fx(-14, 10))} ${pt(fx(-8, -10))} Z`;
            hairD = `M${pt(fx(-24, -14))} Q${pt(fx(-10, -32))} ${pt(fx(16, -24))}`;
          } else if (hairStyle === "short" && hat !== "hood") {
            hairD = `M${pt(fx(-26, 6))} Q${pt(fx(-30, -22))} ${pt(fx(-4, -27))} Q${pt(fx(12, -29))} ${pt(fx(22, -18))}`;
          } else if (hairStyle === "bun" && hat !== "hood") {
            hairD = `M${pt(fx(-27, 8))} Q${pt(fx(-30, -22))} ${pt(fx(-6, -27))} Q${pt(fx(8, -29))} ${pt(fx(18, -21))}`;
            if (hat === "none") {
              const bn = fx(-20, -24);
              P.bun.setAttribute("cx", f1(bn[0])); P.bun.setAttribute("cy", f1(bn[1])); P.bun.setAttribute("r", f1(12 * scH));
              P.bun.setAttribute("stroke-width", f1(LINE.main * sc));
            } else {
              const bn = fx(-28, 2);
              P.bun.setAttribute("cx", f1(bn[0])); P.bun.setAttribute("cy", f1(bn[1])); P.bun.setAttribute("r", f1(10 * scH));
              P.bun.setAttribute("stroke-width", f1(LINE.main * sc));
            }
          }
          if (who === "gord") {
            // flat newsboy cap: low crown overhanging the front, short brim, top button; gray hair at the back
            hatD = `M${pt(fx(-30, -2))} Q${pt(fx(-34, -30))} ${pt(fx(-6, -35))} Q${pt(fx(26, -38))} ${pt(fx(39, -20))} Q${pt(fx(38, -13))} ${pt(fx(26, -13))} L${pt(fx(-30, -2))} Z`;
            band = `M${pt(fx(18, -14))} Q${pt(fx(34, -17))} ${pt(fx(43, -11))}`;
            hatInk = `M${pt(fx(-28, -4))} L${pt(fx(22, -14))} M${pt(fx(17, -14))} Q${pt(fx(34, -18))} ${pt(fx(44, -11))} Q${pt(fx(30, -8))} ${pt(fx(16, -11))} M${pt(fx(-4, -36))} L${pt(fx(-2, -33))}`;
            hairD = `M${pt(fx(-27, -2))} L${pt(fx(-25, 10))} M${pt(fx(-21, 0))} L${pt(fx(-20, 9))}`;
            P.hair.setAttribute("stroke", palette.mist);
          } else if (hat === "pom" || hat === "beanie") {
            hatD = `M${pt(fx(-30, 2))} C${pt(fx(-36, -36))} ${pt(fx(22, -50))} ${pt(fx(30, -15))} L${pt(fx(-30, 2))} Z`;
            band = `M${pt(fx(-29, -3))} L${pt(fx(30, -18))}`;
            hatInk = [-18, -6, 6, 18].map((dx) => `M${pt(fx(dx, -11 - dx * 0.25))} L${pt(fx(dx, -4 - dx * 0.25))}`).join(" ");
          } else if (hat === "cap") {
            hatD = `M${pt(fx(-28, -2))} Q${pt(fx(-30, -34))} ${pt(fx(0, -35))} Q${pt(fx(26, -33))} ${pt(fx(27, -11))} L${pt(fx(-28, -2))} Z`;
            band = `M${pt(fx(20, -11))} L${pt(fx(44, -7))}`;
            hatInk = `M${pt(fx(18, -12))} L${pt(fx(46, -6))}`;
          }
          P.xBack.setAttribute("d", back);
          P.xBack.setAttribute("stroke-width", f1(LINE.main * sc));
          if (hairD) { P.hair.setAttribute("d", hairD); P.hair.setAttribute("stroke-width", f1((who === "gord" ? 4 : 6) * scH)); }
          P.hat.setAttribute("d", hatD);
          P.hat.setAttribute("stroke-width", f1(LINE.main * sc * 1.1));
          P.hatBand.setAttribute("d", band);
          P.hatBand.setAttribute("stroke-width", f1((hat === "cap" ? 7 : hat === "newsboy" ? 5 : 8) * scH));
          P.hatInk.setAttribute("d", hatInk);
          P.hatInk.setAttribute("stroke-width", f1((hat === "cap" ? 2.6 : 2) * sc));
          if (hat === "pom") {
            const pc = fx(-6, -44);
            P.pom.setAttribute("cx", f1(pc[0])); P.pom.setAttribute("cy", f1(pc[1])); P.pom.setAttribute("r", f1(8 * scH));
            P.pom.setAttribute("stroke-width", f1(LINE.main * sc * 0.8));
          } else P.pom.setAttribute("r", 0);
          if (P.beard) {
            // short gray stubble: a shaded crescent around the chin + stubble dots along the jaw
            P.beard.setAttribute("d", `M${pt(fx(-6, 2))} Q${pt(fx(-4, 24))} ${pt(fx(12, 26))} Q${pt(fx(26, 24))} ${pt(fx(27, 6))} Q${pt(fx(24, 18))} ${pt(fx(12, 18))} Q${pt(fx(0, 17))} ${pt(fx(-6, 2))} Z`);
            P.beard.setAttribute("stroke-width", f1(1.6 * sc));
            P.beard.setAttribute("stroke-dasharray", `${f1(2 * sc)} ${f1(2.4 * sc)}`);
          }
        }
        // face
        const talkOpen = s.talk && hash(Math.floor(this.time * 7) + 3) > -0.2;
        const face = s.talk ? (talkOpen ? "talkOpen" : "talkShut") : s.face;
        const closed = face === "closed";
        const eL = fx(5, -4), eR = fx(16, -4);
        [[P.eyeL, eL], [P.eyeR, eR]].forEach(([e, p]) => {
          e.setAttribute("cx", f1(p[0])); e.setAttribute("cy", f1(p[1])); e.setAttribute("r", f1((face === "scared" ? 4.6 : 3.6) * scH));
          e.setAttribute("opacity", closed ? 0 : 1);
        });
        P.glasses.setAttribute("d", who === "mags" ? `M${pt(fx(-1, -4))} a ${f1(6 * sc)} ${f1(6 * sc)} 0 1 0 ${f1(12 * sc * f)} 0 a ${f1(6 * sc)} ${f1(6 * sc)} 0 1 0 ${f1(-12 * sc * f)} 0 M${pt(fx(11, -4))} L${pt(fx(14, -5))} M${pt(fx(14, -4))} a ${f1(5 * sc)} ${f1(6 * sc)} 0 1 0 ${f1(10 * sc * f)} 0 a ${f1(5 * sc)} ${f1(6 * sc)} 0 1 0 ${f1(-10 * sc * f)} 0` : "");
        P.glasses.setAttribute("stroke-width", f1(2.4 * sc));
        const brows = {
          worried: `M${pt(fx(1, -11))} L${pt(fx(8, -14))} M${pt(fx(13, -14))} L${pt(fx(20, -11))}`,   /* v5: inner ends raised (anxious, not angry) */
          scared: `M${pt(fx(1, -13))} L${pt(fx(8, -16.5))} M${pt(fx(13, -16.5))} L${pt(fx(20, -13))}`,
          determined: `M${pt(fx(1, -11))} L${pt(fx(8, -9))} M${pt(fx(13, -9))} L${pt(fx(20, -11))}`,
        };
        // resting brows: Mags (v2), Gord (heavy, level), Tess (thin, a touch wary); Drizzle/extras none
        const restBrow = who === "mags" ? `M${pt(fx(0, -12))} L${pt(fx(9, -11))} M${pt(fx(13, -11))} L${pt(fx(21, -12))}`
          : who === "gord" ? `M${pt(fx(-1, -12))} L${pt(fx(9, -11))} M${pt(fx(13, -11))} L${pt(fx(22, -12))}`
          : who === "tess" ? `M${pt(fx(1, -11))} L${pt(fx(8, -11))} M${pt(fx(13, -11))} L${pt(fx(20, -12))}` : "";
        P.brow.setAttribute("d", restBrow && !brows[face] ? restBrow : brows[face] || "");
        P.brow.setAttribute("stroke-width", f1((who === "gord" ? 4.4 : who === "tess" ? 2.6 : 3) * scH));
        const m = {
          neutral: `M${pt(fx(6, 10))} L${pt(fx(16, 10))}`,
          smile: `M${pt(fx(4, 8))} Q${pt(fx(11, 15))} ${pt(fx(18, 8))}`,
          grin: `M${pt(fx(3, 7))} Q${pt(fx(11, 19))} ${pt(fx(19, 7))} Z`,
          o: `M${pt(fx(10, 8))} a ${f1(3.5 * scH)} ${f1(4.5 * scH)} 0 1 0 0.1 0`,
          worried: `M${pt(fx(4, 13))} Q${pt(fx(11, 7))} ${pt(fx(18, 13))}`,
          scared: `M${pt(fx(6, 9))} Q${pt(fx(11, 4))} ${pt(fx(16, 9))} Q${pt(fx(11, 16))} ${pt(fx(6, 9))} Z`,
          determined: `M${pt(fx(6, 11))} L${pt(fx(17, 9))}`,
          closed: `M${pt(fx(6, 10))} Q${pt(fx(11, 13))} ${pt(fx(16, 10))}`,
          talkOpen: `M${pt(fx(6, 8))} Q${pt(fx(11, 4))} ${pt(fx(16, 8))} Q${pt(fx(11, 16))} ${pt(fx(6, 8))} Z`,
          talkShut: `M${pt(fx(6, 10))} Q${pt(fx(11, 12))} ${pt(fx(16, 10))}`,
        }[face] || "";
        P.mouth.setAttribute("d", m);
        P.mouth.setAttribute("fill", face === "grin" || face === "scared" || face === "talkOpen" ? INK : "none");
        P.mouth.setAttribute("stroke-width", f1(4 * scH));
        // ground shadow
        const gy = Math.max(fl[1], fr[1]);
        shadow.setAttribute("cx", f1((fl[0] + fr[0]) / 2)); shadow.setAttribute("cy", f1(gy + 6 * sc));
        shadow.setAttribute("rx", f1(70 * sc)); shadow.setAttribute("ry", f1(10 * sc));
        shadow.setAttribute("opacity", (0.18 * s.shadow).toFixed(3));
        this.joints = { hip: W(hip, 90), shoulder: W(sh, 91), head: hc, lhand: W(lhand, 13), rhand: W(rhand, 23), lelbow: W(lelb, 11), relbow: W(relb, 21), lfoot: fl, rfoot: fr };
        if (clipC) this.joints.clipboard = clipC;
        if (duffC) this.joints.duffel = duffC;
        return this;
      },
    };
    fig.draw(0);
    return fig;
  }
  // ---------------------------------------------------------------- animate (one proxy tween per figure)
  function animate(tl, fig, keys, opts) {
    opts = opts || {};
    const start = opts.start || 0;
    const end = opts.end !== undefined ? opts.end : keys[keys.length - 1].t + 0.01;
    const states = [];
    let prev = Object.assign({}, fig.state);
    keys.forEach((k) => {
      const s = Object.assign({}, prev);
      if (k.pose) Object.assign(s, mix(k.pose));
      ["x", "y", "scale", "facing", "face", "shadow", "talk", "bag", "radio", "clipboard", "clipboardHand", "duffel", "duffelAt"].forEach((p) => { if (k[p] !== undefined) s[p] = k[p]; });
      states.push(s);
      prev = s;
    });
    const eases = keys.map((k) => gsap.parseEase(k.ease || "power2.inOut"));
    // v2: when the scene declares who speaks when (window.__rdSpeech = { drizzle: [[t0, t1], ...], mags: [...], gord: [...] },
    // scene-local seconds, set right before the scene code), the mouth follows the voice track instead of the keys.
    const speech = window.__rdSpeech || null;
    const spans = speech ? speech[fig.speaker || fig.who] || [] : null; // v3: extras can set opts.speaker
    // v4: window.__rdTalkRemap = [[authoredT0, authoredT1, voiceT0, voiceT1], ...] (scene-local s, set right before the
    // scene code) re-times each figure's AUTHORED talk spans onto the real voice track: during voice span i the figure
    // talks exactly when its keyframes talked at the matching moment of authored span i; outside every span it is quiet.
    // Works for every figure (leads and extras alike) without speaker keys. Takes precedence over __rdSpeech.
    const remap = window.__rdTalkRemap || null;
    const keyTalkAt = (lt) => { let i = 0; while (i < keys.length - 1 && lt >= keys[i + 1].t) i++; return lt >= keys[0].t && !!states[i].talk; };
    const proxy = { t: 0 };
    const apply = (lt) => {
      let i = 0;
      while (i < keys.length - 1 && lt >= keys[i + 1].t) i++;
      const a = states[i], out = Object.assign({}, a);
      if (i < keys.length - 1 && lt >= keys[i].t) {
        const b = states[i + 1], span = keys[i + 1].t - keys[i].t;
        const p = span > 0 ? eases[i + 1](Math.min(1, Math.max(0, (lt - keys[i].t) / span))) : 1;
        KEYS.concat(["x", "y", "scale", "shadow"]).forEach((k) => { out[k] = a[k] + (b[k] - a[k]) * p; });
      }
      if (remap) {
        const st = lt + start;
        const r = remap.find((m) => st >= m[2] && st < m[3]);
        out.talk = r ? keyTalkAt(r[0] + ((st - r[2]) / Math.max(0.01, r[3] - r[2])) * (r[1] - r[0]) - start) : false;
      } else if (spans) { const st = lt + start; out.talk = spans.some((r) => st >= r[0] && st < r[1]); }
      Object.assign(fig.state, out);
      fig.draw(lt + start);
      if (opts.onDraw) opts.onDraw(fig, lt + start);
    };
    apply(0);
    tl.fromTo(proxy, { t: 0 }, { t: end - start, duration: end - start, ease: "none", onUpdate: () => apply(proxy.t) }, start);
    return fig;
  }

  // ---------------------------------------------------------------- weather + camera
  // rain(tl, parent, opts): falling streaks over [start, end]. opts: { start, end, count, angle, length,
  // speed, stroke, opacity, seed, x0, y0, w, h }. Deterministic: positions are a function of time.
  function rain(tl, parent, opts) {
    opts = opts || {};
    const start = opts.start || 0, end = opts.end || 10;
    const n = opts.count || 140, ang = ((opts.angle || 12) * Math.PI) / 180, len = opts.length || 46, speed = opts.speed || 1500;
    const x0 = opts.x0 || -100, y0 = opts.y0 || -60, w = opts.w || 2120, h = opts.h || 1200, seed = opts.seed || 5;
    const g = el("g", { class: "rd-rain", opacity: opts.opacity !== undefined ? opts.opacity : 0.5 }, parent);
    const drops = [];
    for (let i = 0; i < n; i++) {
      drops.push({ e: el("line", { stroke: opts.stroke || palette.mist, "stroke-width": i % 5 === 0 ? 3 : 2, "stroke-linecap": "round" }, g), x: x0 + ((hash(seed + i) + 1) / 2) * w, y: ((hash(seed * 3 + i) + 1) / 2) * h, sp: speed * (0.8 + 0.4 * ((hash(i + 9) + 1) / 2)) });
    }
    const proxy = { t: 0 };
    const draw = (t) => {
      drops.forEach((d) => {
        const yy = y0 + ((d.y + t * d.sp) % h);
        const xx = d.x - Math.tan(ang) * (yy - y0) * 0.3;
        d.e.setAttribute("x1", f1(xx)); d.e.setAttribute("y1", f1(yy));
        d.e.setAttribute("x2", f1(xx - Math.sin(ang) * len)); d.e.setAttribute("y2", f1(yy - Math.cos(ang) * len));
      });
    };
    draw(0);
    tl.fromTo(proxy, { t: 0 }, { t: end - start, duration: end - start, ease: "none", onUpdate: () => draw(proxy.t) }, start);
    return g;
  }

  // shake(tl, target, opts): deterministic camera shake on a wrapper element's x/y/rotation.
  // opts: { start, end, amp (px), rot (deg), freq (Hz), rampIn, rampOut }. Use on a <g> or <div> that wraps
  // the whole scene (never #root). Amplitude ramps in/out so the quake builds and settles.
  function shake(tl, target, opts) {
    opts = opts || {};
    const start = opts.start || 0, end = opts.end || 2, amp = opts.amp || 14, rot = opts.rot || 0.6, freq = opts.freq || 11;
    const rin = opts.rampIn !== undefined ? opts.rampIn : 0.6, rout = opts.rampOut !== undefined ? opts.rampOut : 0.8;
    const elx = typeof target === "string" ? (document.getElementById(target.replace(/^#/, "")) || document.querySelector(target)) : target;
    if (!elx) return;
    const isSvg = elx && elx.namespaceURI === NS;
    const proxy = { t: 0 };
    const apply = (t) => {
      const dur = end - start;
      const env = Math.min(1, t / Math.max(0.001, rin)) * Math.min(1, (dur - t) / Math.max(0.001, rout));
      const k = Math.floor(t * freq), u = t * freq - k;
      const lerp = (a, b) => a + (b - a) * u;
      const x = lerp(hash(k * 3 + 1), hash(k * 3 + 4)) * amp * env;
      const y = lerp(hash(k * 5 + 2), hash(k * 5 + 7)) * amp * 0.6 * env;
      const r = lerp(hash(k * 7 + 3), hash(k * 7 + 10)) * rot * env;
      if (isSvg) elx.setAttribute("transform", `translate(${f1(x)} ${f1(y)}) rotate(${r.toFixed(3)} 960 540)`);
      else elx.style.transform = `translate(${f1(x)}px, ${f1(y)}px) rotate(${r.toFixed(3)}deg)`;
    };
    apply(0);
    tl.fromTo(proxy, { t: 0 }, { t: end - start, duration: end - start, ease: "none", onUpdate: () => apply(proxy.t) }, start);
  }

  // goBag(parent, x, y, scale): the go-bag as a standalone prop (by the door, being grabbed).
  function goBag(parent, x, y, scale) {
    const s = scale || 1;
    const g = el("g", { transform: `translate(${x} ${y}) scale(${s})` }, parent);
    el("rect", { x: -32, y: -70, width: 64, height: 76, rx: 12, fill: palette.slate, stroke: INK, "stroke-width": 4 }, g);
    el("rect", { x: -26, y: -30, width: 52, height: 28, rx: 6, fill: palette.steel, stroke: INK, "stroke-width": 3 }, g);
    el("path", { d: "M-18 -70 Q 0 -96 18 -70", fill: "none", stroke: INK, "stroke-width": 4, "stroke-linecap": "round" }, g);
    el("rect", { x: -12, y: -60, width: 24, height: 12, rx: 3, fill: palette.slicker, stroke: INK, "stroke-width": 2 }, g);
    return g;
  }

  // ---------------------------------------------------------------- v5: procedural walk (IK, planted feet) + segment driver
  // walkPose(phase, opts) -> pose object for one instant of a walk. phase = cycles walked (1 cycle = 2 steps).
  // Two-segment legs solved by IK so each foot stays planted on the ground (local y = 116) for 60% of its cycle
  // (double support) and swings forward with a lift for 40%; knees bend FORWARD; arms swing opposite the legs;
  // the hip bobs (highest at mid-stance, lowest at double support). opts.stride = local units between foot plants.
  const LEG1 = 60, LEG2 = 58, DUTY = 0.6;
  function legIK(hipY, fx, fy) {
    const vx = fx, vy = fy - hipY;
    let d = Math.hypot(vx, vy);
    d = Math.min(d, LEG1 + LEG2 - 0.6);
    const th = Math.atan2(vx, vy);
    const ca = (LEG1 * LEG1 + d * d - LEG2 * LEG2) / (2 * LEG1 * d);
    const cb = (LEG1 * LEG1 + LEG2 * LEG2 - d * d) / (2 * LEG1 * LEG2);
    const a = Math.acos(Math.max(-1, Math.min(1, ca))), b = Math.acos(Math.max(-1, Math.min(1, cb)));
    return [((th + a) * 180) / Math.PI, -((Math.PI - b) * 180) / Math.PI];
  }
  function footAt(ph, stride, lift) {
    // ph in [0,1): stance [0, DUTY): foot slides back under the moving body (planted in the world); swing: forward + lift
    const half = stride * DUTY;              // stance covers 2*half of body travel = DUTY of a cycle (2 strides)
    if (ph < DUTY) return [half - (ph / DUTY) * 2 * half, 116];
    const u = (ph - DUTY) / (1 - DUTY), e = u * u * (3 - 2 * u);
    return [-half + e * 2 * half, 116 - lift * Math.sin(Math.PI * u)];
  }
  function walkPose(phase, opts) {
    opts = opts || {};
    const stride = opts.stride || 60, lift = opts.lift || 14, bob = opts.bob || 1.4, base = opts.hipDrop || 10;
    const pa = ((phase % 1) + 1) % 1, pb = (pa + 0.5) % 1;
    const dy = base - bob * Math.cos(4 * Math.PI * (pa - DUTY / 2));
    const fa = footAt(pa, stride, lift), fb = footAt(pb, stride, lift);
    const [lhip, lkn] = legIK(dy, fa[0], fa[1]);
    const [rhip, rkn] = legIK(dy, fb[0], fb[1]);
    const half = stride * DUTY;
    const nl = fb[0] / half, nr = fa[0] / half;   // left arm follows the RIGHT leg, and vice versa
    const sw = opts.armSwing === undefined ? 26 : opts.armSwing;
    return {
      torso: opts.torso === undefined ? 5 : opts.torso, head: opts.head || 0,
      lsh: 2 + sw * nl, lel: 14 + 10 * Math.max(0, nl), rsh: 2 + sw * nr, rel: 14 + 10 * Math.max(0, nr),
      lhip, lkn, rhip, rkn, dy,
    };
  }
  // drive(tl, fig, segs, {start, end}): ONE proxy tween drives the figure through a list of segments (scene-local s):
  //   { t0, t1, hold: poseName|poseObj, face, x, y, scale, facing, bag, radio, blend }   — pose blended in over `blend` s
  //   { t0, t1, walk: { x0, x1, y0, y1, rate (steps/s, default 1.8), torso, armSwing, arm: {rsh, rel} } , face, ... }
  // opts.onDraw(fig, t) runs after every draw (props held in a hand: fig.hand('r'), fig.hand('l')).
  // A walk's stride is DERIVED from its travel speed and step rate (stride = speed / rate / scale), clamped to a natural
  // range; if clamped, the step rate is adjusted instead, so travel speed always matches the stride (no foot sliding).
  function lerpPose(a, b, u) { const o = {}; KEYS.forEach((k) => (o[k] = a[k] + (b[k] - a[k]) * u)); return o; }
  function drive(tl, fig, segs, opts) {
    const start = opts.start || 0, end = opts.end;
    const st = fig.state;
    const resolve = (p) => (typeof p === "string" ? POSES[p] : mix("idle", p));
    function walkState(s, t) {
      const w = s.walk, T = Math.max(0.01, s.t1 - s.t0), sc = s.scale || st.scale;
      const dist = Math.abs(w.x1 - w.x0), speed = dist / T;
      let rate = w.rate || 1.8, stride = speed / rate / sc;
      if (stride > 64) { stride = 64; rate = speed / stride / sc; }
      if (stride < 26 && dist > 0) { stride = Math.max(26, stride); rate = speed / stride / sc; }
      const lt = Math.max(0, Math.min(T, t - s.t0));
      const pose = walkPose((lt * rate) / 2 + (w.phase0 || 0), { stride: dist > 0 ? stride : 0.001, torso: w.torso, armSwing: w.armSwing, bob: w.bob, hipDrop: w.hipDrop });
      if (w.arm) Object.assign(pose, w.arm);
      return { pose, x: w.x0 + (w.x1 - w.x0) * (lt / T), y: w.y0 + (w.y1 - w.y0) * (lt / T) };
    }
    function stateAt(t) {
      let i = 0;
      while (i < segs.length - 1 && t >= segs[i + 1].t0) i++;
      const s = segs[i];
      let cur;
      if (s.walk) cur = walkState(s, t);
      else cur = { pose: resolve(s.hold), x: s.x, y: s.y };
      if (i > 0) {
        const p = segs[i - 1], bl = s.blend === undefined ? 0.22 : s.blend;
        if (bl > 0 && t < s.t0 + bl) {
          const prev = p.walk ? walkState(p, s.t0) : { pose: resolve(p.hold), x: p.x, y: p.y };
          const u0 = (t - s.t0) / bl, u = u0 * u0 * (3 - 2 * u0);
          cur = { pose: lerpPose(prev.pose, cur.pose, u), x: cur.x === undefined ? prev.x : prev.x + (cur.x - prev.x) * u, y: cur.y === undefined ? prev.y : prev.y + (cur.y - prev.y) * u };
        }
      }
      return { s, cur };
    }
    // carry x/y/scale/facing forward through segments that omit them
    let last = { x: st.x, y: st.y, scale: st.scale, facing: st.facing, face: st.face, bag: st.bag, radio: st.radio };
    segs.forEach((s) => {
      if (s.walk) { s.x = s.walk.x1; s.y = s.walk.y1; }
      ["x", "y", "scale", "facing", "face", "bag", "radio"].forEach((k) => { if (s[k] === undefined) s[k] = last[k]; else last[k] = s[k]; });
    });
    function draw(lt) {
      const t = lt + start, { s, cur } = stateAt(t);
      Object.assign(st, cur.pose, { x: cur.x, y: cur.y, scale: s.scale, facing: s.facing, face: s.face, bag: s.bag, radio: s.radio });
      fig.draw(t);
      if (opts.onDraw) opts.onDraw(fig, t);
    }
    const proxy = { t: 0 };
    draw(0);
    tl.fromTo(proxy, { t: 0 }, { t: end - start, duration: end - start, ease: "none", onUpdate: () => draw(proxy.t) }, start);
  }
  window.RainyDay = { palette, LINE, POSES, mix, hash, el, sk, figure, animate, rain, shake, goBag, walkPose, drive };
})();
