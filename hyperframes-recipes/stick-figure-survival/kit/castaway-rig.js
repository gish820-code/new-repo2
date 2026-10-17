/* Castaway rig — shared stick-figure character + island kit for every frame.
 *
 * Paste this file VERBATIM inside your frame's <template><script> (before your timeline code).
 * It defines window.CastawayRig once (guarded) and draws everything in SVG, deterministic and
 * seek-safe: all state is a pure function of timeline time.
 *
 * Coordinates: SVG user units = canvas px when the <svg> is 1920×1080 with viewBox "0 0 1920 1080".
 *
 *   const R = window.CastawayRig;
 *   const guy = R.figure(svgGroupEl, { x: 900, y: 760, scale: 1, facing: 1 });
 *   R.animate(tl, guy, [
 *     { t: 0,   pose: "stand" },
 *     { t: 0.8, pose: "wave",  x: 960, ease: "power2.inOut", face: "smile" },
 *     { t: 2.0, pose: R.mix("stand", { rsh: -150, rel: 20 }) },
 *   ], { start: 0, end: frameDuration, onDraw: (g) => { // move props to g.hand("r") } });
 *
 * x/y = the HIP position when standing; the GROUND line is y + 116*scale for every pose (sit/lie/kneel
 * lower the hip via the pose's dy, so keep y fixed and switch poses).
 * Angles (degrees): limbs measured from straight DOWN, positive = toward the facing direction
 * (forward). Knee/elbow angles are RELATIVE bends added to the upper limb.
 * torso: 0 = upright, positive = lean forward. head: tilt in degrees, positive = nod forward.
 * faces: "neutral" | "smile" | "grin" | "o" | "worried" | "determined" | "closed".
 */
(function () {
  if (window.CastawayRig) return;
  const NS = "http://www.w3.org/2000/svg";
  const INK = "#1B2566";
  const SUN = "#F1EE2E";
  const PAPER = "#E9E5DB";
  const PAPER_DEEP = "#DCD6C4";
  const EMBER = "#E26B4A";
  const STROKE = 9;
  const L = { torso: 98, neck: 12, head: 27, upArm: 52, loArm: 50, upLeg: 60, loLeg: 58 };

  const POSES = {
    stand: { torso: 0, head: 0, lsh: -8, lel: 6, rsh: 8, rel: 6, lhip: -6, lkn: 2, rhip: 6, rkn: 2, dy: 0 },
    wave: { torso: -2, head: -6, lsh: -10, lel: 8, rsh: 160, rel: 25, lhip: -6, lkn: 2, rhip: 6, rkn: 2, dy: 0 },
    waveB: { torso: -2, head: -6, lsh: -10, lel: 8, rsh: 150, rel: -25, lhip: -6, lkn: 2, rhip: 6, rkn: 2, dy: 0 },
    walkA: { torso: 4, head: 0, lsh: 28, lel: 20, rsh: -24, rel: 10, lhip: -22, lkn: 8, rhip: 24, rkn: 20, dy: -3 },
    walkB: { torso: 4, head: 0, lsh: -24, lel: 10, rsh: 28, rel: 20, lhip: 24, lkn: 20, rhip: -22, rkn: 8, dy: -3 },
    sit: { torso: -10, head: 4, lsh: -32, lel: 4, rsh: 30, rel: 40, lhip: 84, lkn: -6, rhip: 70, rkn: 28, dy: 96 },
    lie: { torso: -90, head: 0, lsh: 160, lel: 10, rsh: 10, rel: -60, lhip: 90, lkn: 0, rhip: 84, rkn: 8, dy: 88 },
    kneel: { torso: 12, head: 14, lsh: 40, lel: 30, rsh: 55, rel: 35, lhip: 70, lkn: -90, rhip: -5, rkn: 100, dy: 50 },
    crouch: { torso: 30, head: 16, lsh: 50, lel: 30, rsh: 62, rel: 30, lhip: 95, lkn: -120, rhip: 80, rkn: -115, dy: 58 },
    reach: { torso: 18, head: 8, lsh: 70, lel: 10, rsh: 95, rel: 8, lhip: -10, lkn: 4, rhip: 12, rkn: 4, dy: 0 },
    carry: { torso: 10, head: -4, lsh: 70, lel: 70, rsh: 80, rel: 65, lhip: -14, lkn: 10, rhip: 16, rkn: 10, dy: 0 },
    pull: { torso: -18, head: -6, lsh: 60, lel: 5, rsh: 70, rel: 5, lhip: 22, lkn: 10, rhip: -18, rkn: 20, dy: 4 },
    point: { torso: 0, head: -4, lsh: -8, lel: 6, rsh: 100, rel: 0, lhip: -6, lkn: 2, rhip: 6, rkn: 2, dy: 0 },
    think: { torso: 0, head: 8, lsh: -8, lel: 6, rsh: 40, rel: 120, lhip: -6, lkn: 2, rhip: 6, rkn: 2, dy: 0 },
    shrug: { torso: 0, head: -4, lsh: -45, lel: -70, rsh: 45, rel: 70, lhip: -6, lkn: 2, rhip: 6, rkn: 2, dy: 0 },
    cheer: { torso: -4, head: -10, lsh: -160, lel: -10, rsh: 160, rel: 10, lhip: -10, lkn: 2, rhip: 10, rkn: 2, dy: 0 },
    breatheIn: { torso: -3, head: -8, lsh: -18, lel: 10, rsh: 18, rel: 10, lhip: -6, lkn: 2, rhip: 6, rkn: 2, dy: -4 },
    drill: { torso: 28, head: 18, lsh: 60, lel: 40, rsh: 95, rel: -20, lhip: 95, lkn: -110, rhip: -10, rkn: 105, dy: 52 },
    drillB: { torso: 28, head: 18, lsh: 60, lel: 40, rsh: 70, rel: 10, lhip: 95, lkn: -110, rhip: -10, rkn: 105, dy: 52 },
  };
  const KEYS = Object.keys(POSES.stand);

  function mix(base, over) {
    const b = typeof base === "string" ? POSES[base] : base;
    return Object.assign({}, b, over || {});
  }

  // deterministic hash → [-1, 1]
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

  function dirDown(deg) {
    const r = (deg * Math.PI) / 180;
    return [Math.sin(r), Math.cos(r)];
  }

  // ---------------------------------------------------------------- figure
  function figure(parent, opts) {
    opts = opts || {};
    const g = el("g", { class: "castaway" }, parent);
    const shadow = el("ellipse", { rx: 70, ry: 10, fill: INK, opacity: 0.12 }, g);
    const body = el("g", {}, g);
    const common = { stroke: INK, "stroke-width": STROKE, "stroke-linecap": "round", "stroke-linejoin": "round", fill: "none" };
    const limbs = {};
    ["lleg", "larm", "torso", "rleg", "rarm"].forEach((k) => (limbs[k] = el("path", common, body)));
    const headG = el("g", {}, body);
    const head = el("circle", { r: L.head, fill: PAPER, stroke: INK, "stroke-width": STROKE }, headG);
    const hair = el("path", Object.assign({}, common, { "stroke-width": 6 }), headG);
    const eyeL = el("circle", { r: 3.6, fill: INK }, headG);
    const eyeR = el("circle", { r: 3.6, fill: INK }, headG);
    const mouth = el("path", Object.assign({}, common, { "stroke-width": 4.5 }), headG);
    const lidL = el("path", Object.assign({}, common, { "stroke-width": 4 }), headG);
    const lidR = el("path", Object.assign({}, common, { "stroke-width": 4 }), headG);

    const fig = {
      g,
      state: Object.assign({ x: 960, y: 760, scale: 1, facing: 1, face: "neutral", shadow: 1 }, POSES.stand, opts.pose ? mix(opts.pose) : {}, opts),
      joints: {},
      boil: opts.boil !== false,
      time: 0,
      hand(side) {
        return this.joints[side === "l" ? "lhand" : "rhand"];
      },
      foot(side) {
        return this.joints[side === "l" ? "lfoot" : "rfoot"];
      },
      headPos() {
        return this.joints.head;
      },
      draw(t) {
        if (t !== undefined) this.time = t;
        const s = this.state;
        const f = s.facing >= 0 ? 1 : -1;
        const step = Math.floor(this.time * 8); // 8 fps line boil
        const j = (i) => (this.boil ? hash(step * 31 + i) * 1.3 : 0);
        const sc = s.scale;
        const P = (lx, ly) => [s.x + lx * sc * f, s.y + ly * sc];
        const hipL = [0, -s.dy * -1];
        // local skeleton (facing right), y down
        const hip = [0, s.dy];
        const td = [Math.sin((s.torso * Math.PI) / 180), -Math.cos((s.torso * Math.PI) / 180)];
        const shoulder = [hip[0] + td[0] * L.torso, hip[1] + td[1] * L.torso];
        const neckTop = [shoulder[0] + td[0] * L.neck, shoulder[1] + td[1] * L.neck];
        const headC = [neckTop[0] + td[0] * L.head, neckTop[1] + td[1] * L.head];
        const limb = (root, a1, a2, l1, l2) => {
          const d1 = dirDown(a1);
          const mid = [root[0] + d1[0] * l1, root[1] + d1[1] * l1];
          const d2 = dirDown(a1 + a2);
          const end = [mid[0] + d2[0] * l2, mid[1] + d2[1] * l2];
          return [mid, end];
        };
        const sh = [shoulder[0] - td[0] * 8, shoulder[1] - td[1] * 8];
        const [lelb, lhand] = limb(sh, s.lsh + s.torso, s.lel, L.upArm, L.loArm);
        const [relb, rhand] = limb(sh, s.rsh + s.torso, s.rel, L.upArm, L.loArm);
        const [lkn, lfoot] = limb(hip, s.lhip, s.lkn, L.upLeg, L.loLeg);
        const [rkn, rfoot] = limb(hip, s.rhip, s.rkn, L.upLeg, L.loLeg);
        let n = 0;
        const W = (p) => {
          const q = P(p[0], p[1]);
          n += 1;
          return [q[0] + j(n), q[1] + j(n + 50)];
        };
        const path = (pts) => "M" + pts.map((p) => W(p).map((v) => v.toFixed(1)).join(" ")).join(" L");
        limbs.torso.setAttribute("d", path([hip, neckTop]));
        limbs.larm.setAttribute("d", path([sh, lelb, lhand]));
        limbs.rarm.setAttribute("d", path([sh, relb, rhand]));
        limbs.lleg.setAttribute("d", path([hip, lkn, lfoot]));
        limbs.rleg.setAttribute("d", path([hip, rkn, rfoot]));
        // back limbs slightly lighter for depth
        limbs.larm.setAttribute("opacity", 0.78);
        limbs.lleg.setAttribute("opacity", 0.78);
        const hc = W(headC);
        const sw = STROKE * sc;
        [limbs.torso, limbs.larm, limbs.rarm, limbs.lleg, limbs.rleg].forEach((p) => p.setAttribute("stroke-width", sw.toFixed(2)));
        head.setAttribute("cx", hc[0].toFixed(1));
        head.setAttribute("cy", hc[1].toFixed(1));
        head.setAttribute("r", (L.head * sc).toFixed(1));
        head.setAttribute("stroke-width", sw.toFixed(2));
        // face, rotated by head tilt + torso
        const tilt = (s.head + s.torso) * f;
        headG.setAttribute("transform", "");
        const fx = (dx, dy) => {
          const r = (tilt * Math.PI) / 180;
          const x = dx * f * sc, y = dy * sc;
          return [hc[0] + x * Math.cos(r) - y * Math.sin(r), hc[1] + x * Math.sin(r) + y * Math.cos(r)];
        };
        const pt = (p) => p.map((v) => v.toFixed(1)).join(" ");
        const eL = fx(4, -4), eR = fx(15, -4);
        const closed = s.face === "closed";
        eyeL.setAttribute("cx", eL[0].toFixed(1)); eyeL.setAttribute("cy", eL[1].toFixed(1));
        eyeR.setAttribute("cx", eR[0].toFixed(1)); eyeR.setAttribute("cy", eR[1].toFixed(1));
        eyeL.setAttribute("r", (3.6 * sc).toFixed(2)); eyeR.setAttribute("r", (3.6 * sc).toFixed(2));
        eyeL.setAttribute("opacity", closed ? 0 : 1); eyeR.setAttribute("opacity", closed ? 0 : 1);
        lidL.setAttribute("d", closed ? `M${pt(fx(0, -4))} Q${pt(fx(4, -1))} ${pt(fx(8, -4))}` : "");
        lidR.setAttribute("d", closed ? `M${pt(fx(11, -4))} Q${pt(fx(15, -1))} ${pt(fx(19, -4))}` : "");
        const m = {
          neutral: `M${pt(fx(5, 9))} L${pt(fx(16, 9))}`,
          smile: `M${pt(fx(3, 7))} Q${pt(fx(10, 15))} ${pt(fx(18, 7))}`,
          grin: `M${pt(fx(2, 6))} Q${pt(fx(10, 19))} ${pt(fx(19, 6))} Z`,
          o: `M${pt(fx(9, 7))} a ${(3.5 * sc).toFixed(1)} ${(4.5 * sc).toFixed(1)} 0 1 0 0.1 0`,
          worried: `M${pt(fx(3, 12))} Q${pt(fx(10, 6))} ${pt(fx(18, 12))}`,
          determined: `M${pt(fx(5, 10))} L${pt(fx(17, 8))}`,
          closed: `M${pt(fx(5, 9))} Q${pt(fx(10, 12))} ${pt(fx(16, 9))}`,
        }[s.face] || "";
        mouth.setAttribute("d", m);
        mouth.setAttribute("fill", s.face === "grin" ? INK : "none");
        mouth.setAttribute("stroke-width", (4.5 * sc).toFixed(2));
        // scruffy castaway hair tuft
        hair.setAttribute("d", `M${pt(fx(-14, -20))} L${pt(fx(-6, -36))} L${pt(fx(0, -24))} L${pt(fx(8, -38))} L${pt(fx(12, -25))}`);
        hair.setAttribute("stroke-width", (6 * sc).toFixed(2));
        // ground shadow under the lower foot
        const fl = P(lfoot[0], lfoot[1]), fr = P(rfoot[0], rfoot[1]);
        const gy = Math.max(fl[1], fr[1]);
        shadow.setAttribute("cx", ((fl[0] + fr[0]) / 2).toFixed(1));
        shadow.setAttribute("cy", (gy + 6 * sc).toFixed(1));
        shadow.setAttribute("rx", (70 * sc).toFixed(1));
        shadow.setAttribute("ry", (10 * sc).toFixed(1));
        shadow.setAttribute("opacity", (0.12 * s.shadow).toFixed(3));
        this.joints = {
          hip: P(hip[0], hip[1]), shoulder: P(sh[0], sh[1]), head: hc,
          lhand: P(lhand[0], lhand[1]), rhand: P(rhand[0], rhand[1]),
          lelbow: P(lelb[0], lelb[1]), relbow: P(relb[0], relb[1]),
          lfoot: fl, rfoot: fr,
        };
        return this;
      },
    };
    fig.draw(0);
    return fig;
  }

  // ---------------------------------------------------------------- animate
  // keyframes: [{ t, pose?: name|object, x?, y?, scale?, facing?, face?, ease? }]
  // Interpolates numeric state between keyframes (ease applies to the segment ARRIVING at a key).
  // face/facing switch discretely at their key. Seek-safe: driven by one proxy tween.
  function animate(tl, fig, keys, opts) {
    opts = opts || {};
    const start = opts.start || 0;
    const end = opts.end !== undefined ? opts.end : keys[keys.length - 1].t + 0.01;
    // resolve full states
    const states = [];
    let prev = Object.assign({}, fig.state);
    keys.forEach((k) => {
      const s = Object.assign({}, prev);
      if (k.pose) Object.assign(s, mix(k.pose));
      ["x", "y", "scale", "facing", "face", "shadow"].forEach((p) => {
        if (k[p] !== undefined) s[p] = k[p];
      });
      states.push(s);
      prev = s;
    });
    const eases = keys.map((k) => (k.ease ? gsap.parseEase(k.ease) : gsap.parseEase("power2.inOut")));
    const proxy = { t: 0 };
    const apply = (lt) => {
      let i = 0;
      while (i < keys.length - 1 && lt >= keys[i + 1].t) i++;
      const a = states[i];
      const out = Object.assign({}, a);
      if (i < keys.length - 1) {
        const b = states[i + 1];
        const span = keys[i + 1].t - keys[i].t;
        const p = span > 0 ? eases[i + 1](Math.min(1, Math.max(0, (lt - keys[i].t) / span))) : 1;
        KEYS.concat(["x", "y", "scale", "shadow"]).forEach((k) => {
          out[k] = a[k] + (b[k] - a[k]) * p;
        });
      }
      Object.assign(fig.state, out);
      fig.draw(lt + start);
      if (opts.onDraw) opts.onDraw(fig, lt + start);
    };
    apply(0);
    tl.fromTo(proxy, { t: 0 }, { t: end - start, duration: end - start, ease: "none", onUpdate: () => apply(proxy.t) }, start);
    return fig;
  }

  // ---------------------------------------------------------------- island kit
  function palm(parent, x, y, scale, lean) {
    scale = scale || 1;
    lean = lean || 1;
    const g = el("g", { class: "palm" }, parent);
    const s = scale;
    const top = [x + 70 * s * lean, y - 330 * s];
    el("path", { d: `M${x} ${y} C ${x + 10 * s * lean} ${y - 120 * s}, ${x + 60 * s * lean} ${y - 220 * s}, ${top[0]} ${top[1]}`, stroke: INK, "stroke-width": 14 * s, "stroke-linecap": "round", fill: "none" }, g);
    for (let i = 1; i < 7; i++) {
      const tt = i / 7;
      const bx = x + (top[0] - x) * tt * tt + 6 * s * lean;
      const by = y + (top[1] - y) * tt;
      el("path", { d: `M${bx - 9 * s} ${by + 4 * s} L${bx + 9 * s} ${by - 4 * s}`, stroke: INK, "stroke-width": 3 * s, "stroke-linecap": "round", opacity: 0.6 }, g);
    }
    const fronds = [-150, -115, -70, -30, 15, 55];
    fronds.forEach((a, i) => {
      const r = (a * Math.PI) / 180;
      const len = (150 + (i % 2) * 30) * s;
      const ex = top[0] + Math.cos(r) * len;
      const ey = top[1] + Math.sin(r) * len * 0.55 + 40 * s;
      const cx = top[0] + Math.cos(r) * len * 0.5;
      const cy = top[1] + Math.sin(r) * len * 0.5 - 40 * s;
      el("path", { d: `M${top[0]} ${top[1]} Q ${cx} ${cy} ${ex} ${ey}`, stroke: INK, "stroke-width": 9 * s, "stroke-linecap": "round", fill: "none" }, g);
      for (let k = 1; k < 6; k++) {
        const u = k / 6;
        const px = (1 - u) * (1 - u) * top[0] + 2 * (1 - u) * u * cx + u * u * ex;
        const py = (1 - u) * (1 - u) * top[1] + 2 * (1 - u) * u * cy + u * u * ey;
        el("path", { d: `M${px} ${py} l ${-10 * s} ${22 * s * (1 - u * 0.4)}`, stroke: INK, "stroke-width": 4 * s, "stroke-linecap": "round" }, g);
      }
    });
    [[-12, 18], [10, 22], [0, 34]].forEach(([dx, dy]) => el("circle", { cx: top[0] + dx * s, cy: top[1] + dy * s, r: 11 * s, fill: PAPER_DEEP, stroke: INK, "stroke-width": 4 * s }, g));
    g.top = top;
    return g;
  }

  function island(parent, opts) {
    // sand mound centered at cx with given half-width, sitting on the waterline y
    opts = opts || {};
    const cx = opts.cx || 960, wy = opts.y || 820, hw = opts.halfWidth || 520, h = opts.height || 110;
    const g = el("g", { class: "island" }, parent);
    el("path", { d: `M${cx - hw} ${wy} C ${cx - hw * 0.6} ${wy - h}, ${cx + hw * 0.6} ${wy - h}, ${cx + hw} ${wy} Z`, fill: PAPER_DEEP, stroke: INK, "stroke-width": 5 }, g);
    for (let i = 0; i < 14; i++) {
      const px = cx - hw * 0.7 + ((i * 97) % (hw * 1.4));
      const py = wy - 20 - ((i * 37) % (h * 0.6));
      el("circle", { cx: px, cy: py, r: 2.2, fill: INK, opacity: 0.35 }, g);
    }
    return g;
  }

  function sea(parent, opts) {
    // horizon line + wave strokes below it; returns { g, waves } (animate waves' x yourself)
    opts = opts || {};
    const wy = opts.y || 820, w = opts.width || 1920;
    const g = el("g", { class: "sea" }, parent);
    el("rect", { x: 0, y: wy, width: w, height: 1080 - wy, fill: INK, opacity: 0.06 }, g);
    el("line", { x1: 0, y1: wy, x2: w, y2: wy, stroke: INK, "stroke-width": 1 }, g);
    const waves = el("g", {}, g);
    for (let r = 0; r < 4; r++) {
      for (let i = -1; i < 12; i++) {
        const x = i * 200 + (r % 2) * 100, y = wy + 28 + r * 40;
        el("path", { d: `M${x} ${y} q 25 -14 50 0 q 25 14 50 0`, stroke: INK, "stroke-width": 3, fill: "none", opacity: 0.45 - r * 0.07, "stroke-linecap": "round" }, waves);
      }
    }
    return { g, waves };
  }

  function sun(parent, x, y, r) {
    const g = el("g", { class: "sun" }, parent);
    el("circle", { cx: x, cy: y, r: r, fill: SUN }, g);
    return g;
  }


  // ---------------------------------------------------------------- forest kit
  function ground(parent, opts) {
    // flat forest floor: paper-deep band below the ground line y, ink hairline, grass tufts
    opts = opts || {};
    const gy = opts.y || 820, w = opts.width || 1920;
    const g = el("g", { class: "ground" }, parent);
    el("rect", { x: -200, y: gy, width: w + 400, height: 1080 - gy + 200, fill: PAPER_DEEP }, g);
    el("line", { x1: -200, y1: gy, x2: w + 200, y2: gy, stroke: INK, "stroke-width": 4, "stroke-linecap": "round" }, g);
    for (let i = 0; i < 26; i++) {
      const x = ((i * 173) % (w + 100)) - 40, y = gy + 18 + ((i * 53) % 150);
      el("path", { d: `M${x} ${y} l 6 -16 M${x + 9} ${y} l 2 -20 M${x + 17} ${y} l -3 -14`, stroke: INK, "stroke-width": 3, "stroke-linecap": "round", opacity: 0.4 }, g);
    }
    return g;
  }

  function pine(parent, x, y, scale, opts) {
    // ink pine standing on the ground at (x, y); opts.opacity for background depth
    scale = scale || 1;
    opts = opts || {};
    const s = scale;
    const g = el("g", { class: "pine", opacity: opts.opacity !== undefined ? opts.opacity : 1 }, parent);
    el("path", { d: `M${x} ${y} L${x} ${y - 70 * s}`, stroke: opts.stroke || INK, "stroke-width": 12 * s, "stroke-linecap": "round" }, g);
    const tiers = [[0, 150], [95, 120], [175, 90], [240, 60]];
    tiers.forEach(([dy, hw], i) => {
      const base = y - 60 * s - dy * s;
      const tip = base - 150 * s;
      el("path", { d: `M${x - hw * s} ${base} L${x} ${tip} L${x + hw * s} ${base} Z`, fill: opts.fill || PAPER, stroke: opts.stroke || INK, "stroke-width": 7 * s, "stroke-linejoin": "round" }, g);
      el("path", { d: `M${x - hw * 0.55 * s} ${base - 4 * s} l ${10 * s} ${-14 * s} M${x + hw * 0.3 * s} ${base - 4 * s} l ${10 * s} ${-14 * s}`, stroke: INK, "stroke-width": 3 * s, "stroke-linecap": "round", opacity: 0.5 }, g);
    });
    g.top = [x, y - 60 * s - 240 * s - 150 * s];
    return g;
  }

  function leafyTree(parent, x, y, scale, opts) {
    scale = scale || 1;
    opts = opts || {};
    const s = scale;
    const g = el("g", { class: "leafy-tree", opacity: opts.opacity !== undefined ? opts.opacity : 1 }, parent);
    el("path", { d: `M${x - 14 * s} ${y} C ${x - 10 * s} ${y - 120 * s}, ${x - 8 * s} ${y - 200 * s}, ${x} ${y - 250 * s} M${x + 14 * s} ${y} C ${x + 10 * s} ${y - 120 * s}, ${x + 10 * s} ${y - 200 * s}, ${x + 4 * s} ${y - 250 * s} M${x} ${y - 190 * s} l ${40 * s} ${-50 * s}`, stroke: INK, "stroke-width": 8 * s, "stroke-linecap": "round", fill: "none" }, g);
    const cy = y - 330 * s;
    el("path", { d: `M${x - 150 * s} ${cy + 40 * s} c ${-40 * s} ${-80 * s}, ${40 * s} ${-160 * s}, ${100 * s} ${-120 * s} c ${20 * s} ${-70 * s}, ${140 * s} ${-70 * s}, ${150 * s} ${0} c ${70 * s} ${-10 * s}, ${100 * s} ${90 * s}, ${40 * s} ${130 * s} c ${10 * s} ${60 * s}, ${-110 * s} ${80 * s}, ${-140 * s} ${40 * s} c ${-60 * s} ${40 * s}, ${-170 * s} ${10 * s}, ${-150 * s} ${-50 * s} Z`, fill: opts.fill || PAPER, stroke: INK, "stroke-width": 8 * s, "stroke-linejoin": "round" }, g);
    return g;
  }

  function forest(parent, opts) {
    // a full forest backdrop on a ground line: two dim back rows + a front row of pines.
    // opts: { y, seed, skip: [x ranges to keep clear as [x0, x1]] }
    opts = opts || {};
    const gy = opts.y || 820, seed = opts.seed || 1, skip = opts.skip || [];
    const g = el("g", { class: "forest" }, parent);
    const clear = (x) => skip.some(([a, b]) => x > a && x < b);
    const rows = [
      { n: 14, y: gy - 40, s: 0.55, c: "#C3C1C4" },
      { n: 10, y: gy - 18, s: 0.8, c: "#9EA0B6" },
    ];
    rows.forEach((r, ri) => {
      for (let i = 0; i < r.n; i++) {
        const x = (i + 0.5) * (1920 / r.n) + hash(seed * 7 + i + ri * 31) * 40;
        if (!clear(x)) pine(g, x, r.y, r.s * (1 + hash(seed + i * 3 + ri) * 0.12), { stroke: r.c });
      }
    });
    return g;
  }

  function stream(parent, d, opts) {
    // a stream along an SVG path d: wide paper-deep band + ink banks + current ticks
    opts = opts || {};
    const g = el("g", { class: "stream" }, parent);
    el("path", { d, stroke: INK, "stroke-width": (opts.width || 70) + 10, fill: "none", "stroke-linecap": "round" }, g);
    el("path", { d, stroke: "#CBD0D8", "stroke-width": opts.width || 70, fill: "none", "stroke-linecap": "round" }, g);
    el("path", { d, stroke: INK, "stroke-width": 3, fill: "none", "stroke-dasharray": "18 26", opacity: 0.5, "stroke-linecap": "round" }, g);
    return g;
  }

  window.CastawayRig = { figure, animate, mix, POSES, palm, island, sea, sun, ground, pine, leafyTree, forest, stream, el, hash, INK, SUN, PAPER, PAPER_DEEP, EMBER };
})();
