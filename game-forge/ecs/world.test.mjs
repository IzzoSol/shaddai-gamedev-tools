// node ecs/world.test.mjs
import assert from 'node:assert/strict';
import { World } from './world.mjs';

const test = (name, fn) => { fn(); console.log('ok  ' + name); };

test('spawn / get / has', () => {
  const w = new World();
  const e = w.spawn({ pos: { x: 1, y: 2 } });
  assert.deepEqual(w.get(e, 'pos'), { x: 1, y: 2 });
  assert.ok(w.has(e, 'pos'));
  assert.ok(!w.has(e, 'vel'));
});

test('recycled slot rejects the stale handle', () => {
  const w = new World();
  const a = w.spawn({ tag: {} });
  w.despawn(a);
  const b = w.spawn({ tag: {} });
  assert.ok(!w.isAlive(a));
  assert.ok(w.isAlive(b));
  assert.notEqual(a, b);
});

test('query matches only entities with every type, and stays fresh', () => {
  const w = new World();
  const both = w.spawn({ pos: {}, vel: {} });
  w.spawn({ pos: {} });
  assert.deepEqual(w.query(['pos', 'vel']), [both]);
  const late = w.spawn({ pos: {}, vel: {} });
  assert.equal(w.query(['pos', 'vel']).length, 2);
  w.remove(late, 'vel');
  assert.deepEqual(w.query(['pos', 'vel']), [both]);
});

test('swap-remove keeps the remaining components intact', () => {
  const w = new World();
  const ids = [1, 2, 3, 4].map((n) => w.spawn({ n: { n } }));
  w.despawn(ids[1]);
  assert.deepEqual(ids.filter((id) => w.isAlive(id)).map((id) => w.get(id, 'n').n), [1, 3, 4]);
});

test('systems run in phase order and see integrated state', () => {
  const w = new World(), order = [];
  const e = w.spawn({ pos: { x: 0 }, vel: { x: 2 } });
  w.system('late', ['pos'], () => order.push('late'), 'late');
  w.system('move', ['pos', 'vel'], (_e, { pos, vel }, dt) => { order.push('move'); pos.x += vel.x * dt; });
  w.system('early', ['pos'], () => order.push('early'), 'early');
  w.step(0.5);
  assert.deepEqual(order, ['early', 'move', 'late']);
  assert.equal(w.get(e, 'pos').x, 1);
});

test('despawn during a system is deferred, not corrupting the loop', () => {
  const w = new World();
  const seen = [];
  [1, 2, 3].forEach((n) => w.spawn({ mob: { n } }));
  w.system('reap', ['mob'], (e, { mob }) => { seen.push(mob.n); if (mob.n === 2) w.despawn(e); });
  w.step(1);
  assert.deepEqual(seen, [1, 2, 3]);
  assert.equal(w.query(['mob']).length, 2);
});

test('events can be subscribed and unsubscribed', () => {
  const w = new World(), got = [];
  const off = w.on('hit', (p) => got.push(p));
  w.emit('hit', 1); off(); w.emit('hit', 2);
  assert.deepEqual(got, [1]);
});

console.log('all ECS tests passed');
