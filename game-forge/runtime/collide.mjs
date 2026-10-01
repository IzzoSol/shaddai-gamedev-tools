// Axis-aligned box collision for platformers, top-down and 3D blocky worlds (NEXUS).
// Boxes are { x, y, z?, w, h, d? } with (x,y,z) the min corner. Works in 2D by leaving z/d out.
//
// moveAndSlide resolves one axis at a time against static boxes, which gives stable
// sliding along walls and floors without tunnelling at normal speeds. For very fast
// movers it sub-steps automatically: no step is larger than the thinnest box involved.

const z0 = (b) => b.z ?? 0;
const dz = (b) => b.d ?? 1;

export function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y &&
         z0(a) < z0(b) + dz(b) && z0(a) + dz(a) > z0(b);
}

export function moveAndSlide(box, delta, solids) {
  const out = { ...box }, hit = { x: false, y: false, z: false };
  for (const axis of ['x', 'y', 'z']) {
    const amount = delta[axis] ?? 0;
    if (!amount) continue;
    const size = { x: 'w', y: 'h', z: 'd' }[axis];
    const thinnest = Math.max(0.01, Math.min(out[size] ?? 1, ...solids.map((s) => s[size] ?? 1)));
    const steps = Math.max(1, Math.ceil(Math.abs(amount) / thinnest)), each = amount / steps;
    for (let i = 0; i < steps; i++) {
      out[axis] = (out[axis] ?? 0) + each;
      let blocked = false;
      for (const s of solids) {
        if (!overlaps(out, s)) continue;
        const sMin = s[axis] ?? 0, sSize = s[size] ?? 1, mySize = out[size] ?? 1;
        out[axis] = amount > 0 ? sMin - mySize : sMin + sSize;   // push back to the touching face
        blocked = true;
      }
      if (blocked) { hit[axis] = true; break; }
    }
  }
  return { box: out, hit };
}

// Distance along a ray (origin o, direction d, both {x,y,z?}) to the first box, or null.
export function raycast(o, d, boxes, maxDist = Infinity) {
  let best = null;
  for (const b of boxes) {
    let tMin = 0, tMax = maxDist, ok = true;
    for (const [ax, sz] of [['x', 'w'], ['y', 'h'], ['z', 'd']]) {
      const org = o[ax] ?? 0, dir = d[ax] ?? 0, lo = b[ax] ?? 0, hi = lo + (b[sz] ?? 1);
      if (Math.abs(dir) < 1e-9) { if (org < lo || org > hi) { ok = false; break; } continue; }
      let t1 = (lo - org) / dir, t2 = (hi - org) / dir;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tMin = Math.max(tMin, t1); tMax = Math.min(tMax, t2);
      if (tMin > tMax) { ok = false; break; }
    }
    if (ok && (best === null || tMin < best.distance)) best = { distance: tMin, box: b };
  }
  return best;
}
