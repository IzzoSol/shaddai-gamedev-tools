# 06 · Physics and collision

Pick the lightest tool that gives the behaviour you need.

| Your game needs | Use | Cost |
|---|---|---|
| Platformer, top-down, blocky worlds | **Box sweeps** (`runtime/collide.mjs`) | Tiny |
| Picking, line of sight, ground checks | **Ray casts** | Tiny |
| Stacking crates, rolling balls, ragdolls | A full rigid-body engine (WASM) | Significant |
| Vehicles, joints, constraints | A full rigid-body engine | Significant |

Most games never need the last two. Reach for a heavy engine only when stacking, tumbling or joints are core to the fun.

## Character controllers (platformers)
Use a **kinematic** controller: you decide velocity, the collision code only stops you. Don't make the player a free-tumbling rigid body.
```js
body.vy -= GRAVITY * dt;                        // 30–40 u/s² feels punchy; real gravity feels floaty
body.vy = Math.max(body.vy, -TERMINAL);
const { box, hit } = moveAndSlide(body, { x: body.vx * dt, y: body.vy * dt }, solids);
Object.assign(body, box);
if (hit.y) { if (body.vy < 0) grounded = true; body.vy = 0; }
if (hit.x) body.vx = 0;
```
Add **variable jump height** (cut `vy` when the button is released early), **coyote time** and a **jump buffer** (`runtime/actions.mjs`). These three change feel more than any physics tuning.

## Broad phase when you have many bodies
Brute-force overlap tests are fine below ~100 bodies. Beyond that, bucket bodies into a uniform grid keyed by cell (`Math.floor(x / cell)`), and only test neighbours in the same or adjacent cells.

## Tunnelling
A fast body can skip entirely over a thin wall between two frames. `moveAndSlide` sub-steps automatically. For projectiles, ray cast along the path travelled this tick instead of testing the end position.

## Determinism
Fixed timestep (guide 02) + no `Math.random` in physics + a fixed iteration order = identical results on every machine. That unlocks replays, rollback netcode, and reliable automated tests.

## Debug it visually
Draw every collider as a wireframe box in a toggleable layer. Most "physics bugs" are a collider that isn't where you think it is.
