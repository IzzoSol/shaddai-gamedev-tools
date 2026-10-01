// node runtime/panorama.test.mjs
import assert from 'node:assert/strict';
import { dirFromAngles, anglesFromDir, dirToEquirect, equirectToDir, cubeFaceDir, dirToCubeFace,
         FACES, detectLayout, bilinear, equirectToCubeFace, sample, FILTERS, crossToFaces, facesToCross, cubeToEquirect } from './panorama.mjs';

const test = (name, fn) => { fn(); console.log('ok  ' + name); };
const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} !≈ ${b}`);

test('yaw 0 looks down -Z; positive yaw turns right; pitch up is +Y', () => {
  const f = dirFromAngles(0, 0); near(f.z, -1); near(f.x, 0);
  near(dirFromAngles(Math.PI / 2, 0).x, 1);
  near(dirFromAngles(0, Math.PI / 2).y, 1);
});

test('angles round-trip', () => {
  for (const [yaw, pitch] of [[0.3, 0.2], [-2.5, -1.0], [3, 1.4]]) {
    const r = anglesFromDir(dirFromAngles(yaw, pitch)); near(r.yaw, yaw); near(r.pitch, pitch);
  }
});

test('equirect: centre is forward, top row is up, round-trips', () => {
  const c = dirToEquirect({ x: 0, y: 0, z: -1 }); near(c.u, 0.5); near(c.v, 0.5);
  near(dirToEquirect({ x: 0, y: 1, z: 0 }).v, 0);
  for (const [u, v] of [[0.1, 0.3], [0.9, 0.8], [0.5, 0.5]]) {
    const r = dirToEquirect(equirectToDir(u, v)); near(r.u, u, 1e-9); near(r.v, v, 1e-9);
  }
});

test('cube faces: every direction lands on the face whose axis it points along', () => {
  const axes = { px: [1, 0, 0], nx: [-1, 0, 0], py: [0, 1, 0], ny: [0, -1, 0], pz: [0, 0, 1], nz: [0, 0, -1] };
  for (const f of FACES) {
    const r = dirToCubeFace({ x: axes[f][0], y: axes[f][1], z: axes[f][2] });
    assert.equal(r.face, f); near(r.s, 0); near(r.t, 0);
  }
});

test('cube faces: dir → face → dir round-trips (direction preserved)', () => {
  for (const d of [{ x: 0.3, y: 0.2, z: -0.9 }, { x: -0.8, y: 0.1, z: 0.2 }, { x: 0.1, y: -0.9, z: 0.3 }]) {
    const { face, s, t } = dirToCubeFace(d), back = cubeFaceDir(face, s, t);
    const k = Math.hypot(d.x, d.y, d.z) / Math.hypot(back.x, back.y, back.z);
    near(back.x * k, d.x); near(back.y * k, d.y); near(back.z * k, d.z);
  }
});

test('layout detection', () => {
  assert.equal(detectLayout(2048, 1024), 'equirect');
  assert.equal(detectLayout(1024, 768), 'cube-cross');
  assert.equal(detectLayout(6144, 1024), 'cube-strip-h');
  assert.equal(detectLayout(1024, 6144), 'cube-strip-v');
  assert.equal(detectLayout(1000, 900), null);
});

test('bilinear blends neighbours', () => {
  const img = { width: 2, height: 1, data: new Uint8ClampedArray([0, 0, 0, 255, 200, 100, 50, 255]) };
  const mid = bilinear(img, 0.5, 0.5);
  near(mid[0], 100, 1e-6); near(mid[3], 255, 1e-6);
});

test('equirect → cube face: forward face centre samples the image centre', () => {
  const w = 64, h = 32, data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) data.set([x * 4, y * 8, 0, 255], (y * w + x) * 4);
  const face = equirectToCubeFace({ width: w, height: h, data }, 'nz', 8);   // nz = forward (-Z)
  const centre = (4 * 8 + 4) * 4;
  assert.ok(Math.abs(face.data[centre] - 126) < 12, 'u should be near the image middle, got ' + face.data[centre]);
  assert.ok(Math.abs(face.data[centre + 1] - 124) < 12);
});

test('cross layout: faces → cross → faces is lossless, and rejects wrong shapes', () => {
  const size = 4, faces = {};
  FACES.forEach((f, k) => { const d = new Uint8ClampedArray(size * size * 4).fill(10 * (k + 1)); faces[f] = { width: size, height: size, data: d }; });
  const cross = facesToCross(faces);
  assert.equal(detectLayout(cross.width, cross.height), 'cube-cross');
  const back = crossToFaces(cross);
  for (const f of FACES) assert.deepEqual(Array.from(back[f].data), Array.from(faces[f].data));
  assert.throws(() => crossToFaces({ width: 8, height: 4, data: new Uint8ClampedArray(128) }));
});

test('equirect → cube → equirect keeps the picture (smooth gradient, small error)', () => {
  const w = 128, h = 64, data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) data.set([Math.round(255 * x / w), Math.round(255 * y / h), 80, 255], (y * w + x) * 4);
  const src = { width: w, height: h, data };
  const faces = Object.fromEntries(FACES.map((f) => [f, equirectToCubeFace(src, f, 64)]));
  const out = cubeToEquirect(faces, w, h);
  let worst = 0;
  for (let y = 8; y < h - 8; y++) for (let x = 4; x < w - 4; x++) for (let c = 0; c < 2; c++) {
    worst = Math.max(worst, Math.abs(out.data[(y * w + x) * 4 + c] - src.data[(y * w + x) * 4 + c]));
  }
  assert.ok(worst < 12, 'worst channel error ' + worst);
});

const ramp = (w, h) => { const d = new Uint8ClampedArray(w * h * 4); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) d.set([x * 10, y * 10, 5, 255], (y * w + x) * 4); return { width: w, height: h, data: d }; };

test('every filter returns the exact pixel at a pixel centre', () => {
  const img = ramp(8, 8);
  for (const filter of FILTERS) {
    const px = sample(img, (3 + 0.5) / 8, (4 + 0.5) / 8, { filter });
    near(px[0], 30, 1e-6); near(px[1], 40, 1e-6);
  }
});

test('bicubic and lanczos reproduce a linear ramp between pixels; nearest steps', () => {
  const img = ramp(16, 16);
  for (const filter of ['bilinear', 'bicubic', 'lanczos']) near(sample(img, (6 + 0.5 + 0.5) / 16, 0.5, { filter })[0], 65, 0.6);
  assert.equal(sample(img, (6 + 1.1) / 16, 0.5, { filter: 'nearest' })[0], 70);
});

test('wrapU blends across the 360° seam instead of clamping', () => {
  const w = 8, d = new Uint8ClampedArray(w * 4 * 4);
  for (let y = 0; y < 4; y++) for (let x = 0; x < w; x++) d.set([x === 0 ? 200 : 0, 0, 0, 255], (y * w + x) * 4);
  const img = { width: w, height: 4, data: d };
  const clamped = sample(img, 1, 0.5, { filter: 'bilinear' })[0];                  // right edge, no wrap: last column only
  const wrapped = sample(img, 1, 0.5, { filter: 'bilinear', wrapU: true })[0];     // halfway between last and first column
  near(clamped, 0, 1e-6); near(wrapped, 100, 1e-6);
});

test('unknown filter is rejected', () => assert.throws(() => sample(ramp(2, 2), 0.5, 0.5, { filter: 'magic' })));

console.log('all panorama tests passed');
