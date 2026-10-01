// node runtime/runtime.test.mjs
import assert from 'node:assert/strict';
import { FixedStep, blend } from './fixed-step.mjs';
import { overlaps, moveAndSlide, raycast } from './collide.mjs';
import { gridSheet, frameRect, clip } from './clips.mjs';
import { Actions } from './actions.mjs';

const test = (name, fn) => { fn(); console.log('ok  ' + name); };
const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} !≈ ${b}`);

test('fixed step: equal slices, leftover becomes alpha', () => {
  let updates = 0, alpha = -1;
  const loop = new FixedStep({ hz: 10, update: () => updates++, render: (a) => (alpha = a) });
  loop.tick(0); loop.tick(0.25);
  assert.equal(updates, 2);
  near(alpha, 0.5);
});

test('fixed step: long stall is clamped, not simulated', () => {
  let updates = 0;
  const loop = new FixedStep({ hz: 60, maxCatchUp: 0.25, update: () => updates++, render() {} });
  loop.tick(0); loop.tick(60);
  assert.ok(updates <= 16, 'got ' + updates);
});

test('blend', () => near(blend(10, 20, 0.25), 12.5));

test('moveAndSlide lands on a floor and slides along a wall', () => {
  const floor = { x: -10, y: 0, w: 20, h: 1 }, wall = { x: 5, y: 0, w: 1, h: 10 };
  const body = { x: 0, y: 3, w: 1, h: 2 };
  const fell = moveAndSlide(body, { y: -5 }, [floor]);
  assert.ok(fell.hit.y); near(fell.box.y, 1);
  const slid = moveAndSlide({ x: 3.5, y: 2, w: 1, h: 2 }, { x: 3, y: 1 }, [wall]);
  assert.ok(slid.hit.x); near(slid.box.x, 4); near(slid.box.y, 3);
});

test('overlaps ignores touching edges', () => assert.ok(!overlaps({ x: 0, y: 0, w: 1, h: 1 }, { x: 1, y: 0, w: 1, h: 1 })));

test('raycast finds the nearest box', () => {
  const hit = raycast({ x: 0, y: 0.5 }, { x: 1, y: 0 }, [{ x: 8, y: 0, w: 1, h: 1 }, { x: 3, y: 0, w: 1, h: 1 }]);
  near(hit.distance, 3);
  assert.equal(raycast({ x: 0, y: 5 }, { x: 1, y: 0 }, [{ x: 3, y: 0, w: 1, h: 1 }]), null);
});

test('sprite clips: loop, once, pingpong; UVs flip for bottom-left origin', () => {
  const sheet = gridSheet({ cols: 4, rows: 2, frameW: 32, frameH: 32 });
  const loop = clip(sheet, { row: 1, from: 0, to: 3, fps: 4, mode: 'loop' });
  assert.equal(loop.at(0).index, 4); assert.equal(loop.at(1).index, 4);          // wrapped after 4 frames
  const once = clip(sheet, { row: 0, from: 0, to: 2, fps: 2, mode: 'once' });
  assert.equal(once.at(99).index, 2); assert.ok(once.done(99));
  const pp = clip(sheet, { row: 0, from: 0, to: 2, fps: 1, mode: 'pingpong' });
  assert.deepEqual([0, 1, 2, 3, 4].map((t) => pp.at(t).index), [0, 1, 2, 1, 0]);
  const r = frameRect(sheet, 0); near(r.v, 0.5); near(r.uw, 0.25);
});

test('actions: buffer window, single use, axis', () => {
  const a = new Actions({ bufferMs: 100 });
  a.press('jump', 1000);
  assert.ok(a.consume('jump', 1080)); assert.ok(!a.consume('jump', 1081));
  a.press('jump', 2000); assert.ok(!a.consume('jump', 2200));
  a.press('right', 0); assert.equal(a.axis('left', 'right'), 1);
  a.press('left', 0); assert.equal(a.axis('left', 'right'), 0);
});

console.log('all runtime tests passed');
