# 07 · Entities, components and systems

An **entity** is just an id. **Components** are plain data attached to it. **Systems** are functions that act on every entity having certain components. The payoff: new behaviour is a new system or a new component, not a deeper class hierarchy.

`ecs/world.mjs` is SHADDAI's implementation.

```js
import { World } from './ecs/world.mjs';
const world = new World();

const player = world.spawn({
  pos:    { x: 0, y: 0 },
  vel:    { x: 0, y: 0 },
  sprite: { sheet: 'hero', clip: 'idle' },
  health: { hp: 100 },
});

world.system('move',   ['pos', 'vel'],    (e, { pos, vel }, dt) => { pos.x += vel.x * dt; pos.y += vel.y * dt; });
world.system('animate',['sprite'],        (e, { sprite }, dt) => { /* advance clip time */ }, 'late');
world.system('reap',   ['health'],        (e, { health }, dt, w) => { if (health.hp <= 0) w.despawn(e); });

world.step(1 / 60);
```

## Design rules
- **Components hold data, never behaviour.** If a component grows a method, it wants to be a system.
- **Tags are components with no fields** (`{}`): `enemy`, `frozen`, `invulnerable`. Querying `['enemy','pos']` is how you target a group.
- **Small and composable.** Prefer `pos` + `vel` + `bounds` over one `Body` blob. Smaller pieces recombine for new entity types.
- **Phases give order.** `early` for input and AI decisions, `update` for movement and rules, `late` for animation and camera.
- **Never hold a handle forever.** Handles carry a generation; call `world.isAlive(h)` before using one stored across frames (a target, an owner).

## Structural changes during a step
Spawning, despawning, adding or removing components inside a system is **queued** and applied between systems. You may do it freely; just don't expect the change to be visible until the system finishes.

## Events for loose coupling
```js
world.on('enemy-died', ({ at }) => spawnLoot(at));
world.system('combat', ['health'], (e, { health }, dt, w) => { if (health.hp <= 0) w.emit('enemy-died', { at: w.get(e, 'pos') }); });
```
Use events for "something happened" (audio, UI, achievements). Use components for "this is the current state".

## Wiring to three.js
Keep a `mesh` component pointing at the Object3D, and one late system that copies `pos` onto it. Gameplay never touches the mesh; the mesh is a view.

## When not to use it
A game with a dozen entities and little shared behaviour doesn't need ECS. It pays off when you have many kinds of things sharing parts: hundreds of enemies, projectiles, pickups, effects.
