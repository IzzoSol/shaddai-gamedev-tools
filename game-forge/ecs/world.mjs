// SHADDAI Game Forge — ECS "World". Original implementation (NEXUS).
//
// Model
//   • An entity is an integer handle: low 20 bits = slot, high bits = generation,
//     so a recycled slot never answers to an old handle.
//   • Components live in per-type sparse sets (dense arrays + a slot→index map):
//     iteration is a straight array walk, add/remove is O(1).
//   • A query is a set of component types. Results are cached and invalidated only
//     when a matching component is added or removed.
//   • Structural changes made while systems run are queued and applied between
//     systems, so nothing mutates under an active loop.
//
// Usage
//   const world = new World();
//   const Pos = world.define('pos'), Vel = world.define('vel');
//   const e = world.spawn({ pos: { x: 0, y: 0 }, vel: { x: 1, y: 0 } });
//   world.system('move', ['pos', 'vel'], (e, { pos, vel }, dt) => { pos.x += vel.x * dt; });
//   world.step(1 / 60);

const SLOT_BITS = 20;
const SLOT_MASK = (1 << SLOT_BITS) - 1;

class SparseSet {
  constructor() { this.dense = []; this.owners = []; this.index = new Map(); }
  has(slot) { return this.index.has(slot); }
  get(slot) { const i = this.index.get(slot); return i === undefined ? undefined : this.dense[i]; }
  set(slot, value) {
    const i = this.index.get(slot);
    if (i !== undefined) { this.dense[i] = value; return false; }
    this.index.set(slot, this.dense.length); this.dense.push(value); this.owners.push(slot);
    return true;
  }
  delete(slot) {
    const i = this.index.get(slot);
    if (i === undefined) return false;
    const last = this.dense.length - 1;
    if (i !== last) {                       // swap-remove keeps the arrays dense
      this.dense[i] = this.dense[last]; this.owners[i] = this.owners[last]; this.index.set(this.owners[i], i);
    }
    this.dense.pop(); this.owners.pop(); this.index.delete(slot);
    return true;
  }
}

export class World {
  constructor() {
    this.stores = new Map();        // type name → SparseSet
    this.generation = [];           // slot → current generation
    this.alive = [];                // slot → boolean
    this.free = [];                 // recycled slots
    this.queries = new Map();       // key → { types, slots, dirty }
    this.systems = [];              // { name, types, fn, phase }
    this.phases = ['early', 'update', 'late'];
    this.pending = [];              // deferred structural ops
    this.running = false;
    this.listeners = new Map();     // event → Set<fn>
    this.time = 0;
  }

  // ── types ──────────────────────────────────────────────────────────────────
  define(type) { if (!this.stores.has(type)) this.stores.set(type, new SparseSet()); return type; }

  // ── entities ───────────────────────────────────────────────────────────────
  spawn(components = {}) {
    const slot = this.free.length ? this.free.pop() : this.generation.length;
    if (slot > SLOT_MASK) throw new Error('entity limit reached');
    if (slot === this.generation.length) { this.generation.push(0); this.alive.push(false); }
    this.alive[slot] = true;
    const handle = (this.generation[slot] << SLOT_BITS) | slot;
    for (const [type, value] of Object.entries(components)) this.#put(slot, type, value);
    return handle;
  }
  isAlive(handle) {
    const slot = handle & SLOT_MASK;
    return this.alive[slot] === true && this.generation[slot] === (handle >>> SLOT_BITS);
  }
  despawn(handle) {
    if (this.running) return void this.pending.push(() => this.despawn(handle));
    if (!this.isAlive(handle)) return;
    const slot = handle & SLOT_MASK;
    for (const [type, store] of this.stores) if (store.delete(slot)) this.#touch(type);
    this.alive[slot] = false; this.generation[slot]++; this.free.push(slot);
  }

  // ── components ─────────────────────────────────────────────────────────────
  add(handle, type, value = {}) {
    if (this.running) return void this.pending.push(() => this.add(handle, type, value));
    if (this.isAlive(handle)) this.#put(handle & SLOT_MASK, type, value);
  }
  remove(handle, type) {
    if (this.running) return void this.pending.push(() => this.remove(handle, type));
    const store = this.stores.get(type);
    if (store && this.isAlive(handle) && store.delete(handle & SLOT_MASK)) this.#touch(type);
  }
  get(handle, type) { return this.isAlive(handle) ? this.stores.get(type)?.get(handle & SLOT_MASK) : undefined; }
  has(handle, type) { return this.isAlive(handle) && !!this.stores.get(type)?.has(handle & SLOT_MASK); }

  #put(slot, type, value) {
    this.define(type);
    if (this.stores.get(type).set(slot, value)) this.#touch(type);
  }
  #touch(type) { for (const q of this.queries.values()) if (q.types.includes(type)) q.dirty = true; }

  // ── queries ────────────────────────────────────────────────────────────────
  // Returns live entity handles that have every listed component.
  query(types) {
    const key = [...types].sort().join('|');
    let q = this.queries.get(key);
    if (!q) { q = { types: [...types], slots: [], dirty: true }; this.queries.set(key, q); }
    if (q.dirty) {
      const stores = types.map((t) => this.stores.get(t));
      if (stores.some((s) => !s)) q.slots = [];
      else {
        const smallest = stores.reduce((a, b) => (a.owners.length <= b.owners.length ? a : b));
        q.slots = smallest.owners.filter((slot) => stores.every((s) => s.has(slot)));
      }
      q.dirty = false;
    }
    return q.slots.map((slot) => (this.generation[slot] << SLOT_BITS) | slot);
  }

  // ── systems ────────────────────────────────────────────────────────────────
  system(name, types, fn, phase = 'update') {
    if (!this.phases.includes(phase)) throw new Error('unknown phase: ' + phase);
    this.systems.push({ name, types, fn, phase });
    return this;
  }
  step(dt) {
    this.time += dt;
    this.running = true;
    try {
      for (const phase of this.phases) {
        for (const sys of this.systems) {
          if (sys.phase !== phase) continue;
          for (const e of this.query(sys.types)) {
            const parts = {};
            for (const t of sys.types) parts[t] = this.stores.get(t).get(e & SLOT_MASK);
            sys.fn(e, parts, dt, this);
          }
          this.#flush();
        }
      }
    } finally { this.running = false; this.#flush(); }
  }
  #flush() {
    const ops = this.pending; this.pending = [];
    const was = this.running; this.running = false;
    for (const op of ops) op();
    this.running = was;
  }

  // ── events ─────────────────────────────────────────────────────────────────
  on(event, fn) { (this.listeners.get(event) ?? this.listeners.set(event, new Set()).get(event)).add(fn); return () => this.listeners.get(event).delete(fn); }
  emit(event, payload) { for (const fn of this.listeners.get(event) ?? []) fn(payload); }
}
