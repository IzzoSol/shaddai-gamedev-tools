# 02 · The game loop

Rendering speed varies by device; game rules must not. Separate them.

## The rule
**Simulate in fixed slices. Render whenever the browser says so, blending between the last two simulated states.**

`runtime/fixed-step.mjs` does this:
```js
import { FixedStep, blend } from './runtime/fixed-step.mjs';

const loop = new FixedStep({
  hz: 60,
  update: (dt) => world.step(dt),          // always 1/60 s
  render: (alpha) => {                     // 0..1 progress to the next slice
    for (const m of movers) m.mesh.position.x = blend(m.prevX, m.x, alpha);
    renderer.render(scene, camera);
  },
});
renderer.setAnimationLoop((ms) => loop.tick(ms / 1000));
```

## Why it matters
- **Same behaviour everywhere.** A 144 Hz laptop and a 30 Hz phone get identical physics and identical replays.
- **Stable physics.** Integrators and collision resolve badly with wildly varying `dt`.
- **Deterministic tests.** Feed 600 ticks into the world and assert the result — no browser needed.

## Stall protection
Tabs pause. Debuggers pause. Without a cap the loop returns after a minute and tries to simulate 3,600 steps at once. `maxCatchUp` (default 0.25 s) drops the backlog instead. Pair it with the Page Visibility API: pause audio and timers on `visibilitychange`.

## Store previous state
For interpolation, each mover needs `prev` and `curr`. Copy `curr → prev` at the **start** of each update, then integrate. Teleports (respawns) should set both so the mesh doesn't streak across the map.

## Time you can trust
- Use the simulation clock (`world.time`) for gameplay timers: cooldowns, spawn waves, status effects.
- Use the wall clock only for presentation: UI fades, camera shake decay, particle lifetime.
- Never use `Date.now()` for gameplay; it breaks pause and replay.

## Slow-motion and pause
Scale `dt` before it reaches `world.step` (`dt * timeScale`). Pausing is `timeScale = 0`; the render side keeps drawing, so menus and camera still animate.
