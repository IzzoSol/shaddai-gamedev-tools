// Panorama and skybox maths (NEXUS) — pure functions, no dependencies, usable in Node and the browser.
//
// Conventions (match three.js): right-handed, +X right, +Y up, camera looks down -Z at yaw 0.
//   yaw   0 → forward, positive turns right.   pitch +π/2 → straight up.
//   Image coordinates: u 0→1 left→right, v 0→1 top→bottom.
// Cube faces use the standard graphics-API layout: 'px','nx','py','ny','pz','nz', with (s,t) in [-1,1],
// s to the right and t downward when the face is viewed from inside.

const TAU = Math.PI * 2;

export function dirFromAngles(yaw, pitch) {
  const c = Math.cos(pitch);
  return { x: Math.sin(yaw) * c, y: Math.sin(pitch), z: -Math.cos(yaw) * c };
}

export function anglesFromDir({ x, y, z }) {
  const len = Math.hypot(x, y, z) || 1;
  return { yaw: Math.atan2(x, -z), pitch: Math.asin(y / len) };
}

// ── equirectangular (2:1 sphere map) ────────────────────────────────────────
export function dirToEquirect(dir) {
  const { yaw, pitch } = anglesFromDir(dir);
  return { u: 0.5 + yaw / TAU, v: 0.5 - pitch / Math.PI };
}
export function equirectToDir(u, v) {
  return dirFromAngles((u - 0.5) * TAU, (0.5 - v) * Math.PI);
}

// ── cube faces ──────────────────────────────────────────────────────────────
export const FACES = ['px', 'nx', 'py', 'ny', 'pz', 'nz'];

export function cubeFaceDir(face, s, t) {
  switch (face) {
    case 'px': return { x: 1, y: -t, z: -s };
    case 'nx': return { x: -1, y: -t, z: s };
    case 'py': return { x: s, y: 1, z: t };
    case 'ny': return { x: s, y: -1, z: -t };
    case 'pz': return { x: s, y: -t, z: 1 };
    case 'nz': return { x: -s, y: -t, z: -1 };
    default: throw new Error('unknown cube face: ' + face);
  }
}

export function dirToCubeFace({ x, y, z }) {
  const ax = Math.abs(x), ay = Math.abs(y), az = Math.abs(z);
  let face, s, t, m;
  if (ax >= ay && ax >= az) { m = ax; face = x > 0 ? 'px' : 'nx'; s = x > 0 ? -z : z; t = -y; }
  else if (ay >= az) { m = ay; face = y > 0 ? 'py' : 'ny'; s = x; t = y > 0 ? z : -z; }
  else { m = az; face = z > 0 ? 'pz' : 'nz'; s = z > 0 ? x : -x; t = -y; }
  return { face, s: s / m, t: t / m };
}

// ── layouts ─────────────────────────────────────────────────────────────────
// Guess what an image is from its size. Returns null when it matches nothing.
export function detectLayout(width, height) {
  const r = width / height;
  const near = (a) => Math.abs(r - a) < 0.02;
  if (near(2)) return 'equirect';          // 2:1 sphere map
  if (near(4 / 3)) return 'cube-cross';    // 4×3 unfolded cube
  if (near(6)) return 'cube-strip-h';      // six faces side by side
  if (near(1 / 6)) return 'cube-strip-v';  // six faces stacked
  return null;
}

// ── resampling ──────────────────────────────────────────────────────────────
// image: { width, height, data: Uint8ClampedArray RGBA }
// Reconstruction kernels: [radius in pixels, weight(distance)].
//   bilinear — tent;  bicubic — Catmull-Rom (exact on linear ramps);  lanczos — sinc windowed to 3 lobes.
const KERNELS = {
  nearest: null,
  bilinear: [1, (d) => Math.max(0, 1 - Math.abs(d))],
  bicubic: [2, (d) => {
    d = Math.abs(d);
    return d < 1 ? 1.5 * d ** 3 - 2.5 * d * d + 1 : d < 2 ? -0.5 * d ** 3 + 2.5 * d * d - 4 * d + 2 : 0;
  }],
  lanczos: [3, (d) => {
    d = Math.abs(d);
    if (d === 0) return 1;
    if (d >= 3) return 0;
    const p = Math.PI * d;
    return (3 * Math.sin(p) * Math.sin(p / 3)) / (p * p);
  }],
};
export const FILTERS = Object.keys(KERNELS);

const wrap = (i, n) => ((i % n) + n) % n;
const clampIdx = (i, n) => (i < 0 ? 0 : i > n - 1 ? n - 1 : i);

// Sample an RGBA image at (u,v) in [0,1]². Pixel centres sit at half-integers, so there is no
// half-pixel drift. `wrapU` wraps horizontally — required for 360° images, otherwise the seam
// behind the viewer blurs against the opposite edge instead of the neighbouring column.
export function sample(image, u, v, { filter = 'bilinear', wrapU = false } = {}) {
  const { width: w, height: h, data } = image;
  const px = u * w - 0.5, py = v * h - 0.5, out = [0, 0, 0, 0];
  const col = (i) => (wrapU ? wrap(i, w) : clampIdx(i, w));
  const k = KERNELS[filter];
  if (k === undefined) throw new Error('unknown filter: ' + filter);
  if (k === null) {
    const o = (clampIdx(Math.round(py), h) * w + col(Math.round(px))) * 4;
    return [data[o], data[o + 1], data[o + 2], data[o + 3]];
  }
  const [r, weight] = k, x0 = Math.floor(px), y0 = Math.floor(py);
  const wx = [], wy = [];
  let sx = 0, sy = 0;
  for (let t = 1 - r; t <= r; t++) {
    const a = weight(px - (x0 + t)), b = weight(py - (y0 + t));
    wx.push(a); wy.push(b); sx += a; sy += b;
  }
  for (let j = 0; j < 2 * r; j++) {
    const row = clampIdx(y0 + 1 - r + j, h) * w;
    for (let i = 0; i < 2 * r; i++) {
      const o = (row + col(x0 + 1 - r + i)) * 4, f = (wx[i] / sx) * (wy[j] / sy);
      out[0] += data[o] * f; out[1] += data[o + 1] * f; out[2] += data[o + 2] * f; out[3] += data[o + 3] * f;
    }
  }
  return out;
}

export const bilinear = (image, u, v, opts) => sample(image, u, v, { ...opts, filter: 'bilinear' });

// Render one cube face (size×size RGBA) from an equirectangular image.
export function equirectToCubeFace(image, face, size, { filter = 'bilinear' } = {}) {
  const data = new Uint8ClampedArray(size * size * 4);
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      const s = ((i + 0.5) / size) * 2 - 1, t = ((j + 0.5) / size) * 2 - 1;
      const { u, v } = dirToEquirect(cubeFaceDir(face, s, t));
      data.set(sample(image, u, v, { filter, wrapU: true }), (j * size + i) * 4);
    }
  }
  return { width: size, height: size, data };
}

// ── cube ↔ equirect and the 4×3 cross ──────────────────────────────────────
// Cross layout (cells are `size` px):        [  ][py][  ][  ]
//                                            [nx][pz][px][nz]
//                                            [  ][ny][  ][  ]
const CROSS_CELL = { py: [1, 0], nx: [0, 1], pz: [1, 1], px: [2, 1], nz: [3, 1], ny: [1, 2] };

function cropRect(image, x0, y0, w, h) {
  const out = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    const from = ((y0 + y) * image.width + x0) * 4;
    out.set(image.data.subarray(from, from + w * 4), y * w * 4);
  }
  return { width: w, height: h, data: out };
}

// Split a 4:3 cross image into six face images.
export function crossToFaces(image) {
  if (detectLayout(image.width, image.height) !== 'cube-cross') throw new Error('not a 4:3 cross layout');
  const size = image.width / 4, faces = {};
  for (const f of FACES) { const [cx, cy] = CROSS_CELL[f]; faces[f] = cropRect(image, cx * size, cy * size, size, size); }
  return faces;
}

// Pack six equal square faces into a 4:3 cross (unused cells stay transparent).
export function facesToCross(faces) {
  const size = faces.px.width, width = size * 4, height = size * 3;
  const data = new Uint8ClampedArray(width * height * 4);
  for (const f of FACES) {
    const [cx, cy] = CROSS_CELL[f];
    for (let y = 0; y < size; y++) data.set(faces[f].data.subarray(y * size * 4, (y + 1) * size * 4), ((cy * size + y) * width + cx * size) * 4);
  }
  return { width, height, data };
}

// Rebuild a 2:1 sphere map from six faces.
export function cubeToEquirect(faces, width, height = width / 2, { filter = 'bilinear' } = {}) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      const { face, s, t } = dirToCubeFace(equirectToDir((i + 0.5) / width, (j + 0.5) / height));
      data.set(sample(faces[face], (s + 1) / 2, (t + 1) / 2, { filter }), (j * width + i) * 4);
    }
  }
  return { width, height, data };
}
