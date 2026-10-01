# SHADDAI Game Forge

SHADDAI's own toolkit for building browser games — 3D (Three.js) and 2D. Reached through the MCP by TURTLE (`shaddai_turtle_build`) and by anyone via `gamedev_search`.

## What's here
| Path | What |
|---|---|
| `ecs/world.mjs` | Entity-component-system: generational handles, sparse-set storage, cached queries, phases, deferred changes, events (tested) |
| `runtime/fixed-step.mjs` | Fixed-timestep loop with interpolation and stall protection |
| `runtime/collide.mjs` | Box sweeps with automatic sub-stepping, sliding response, ray casts |
| `runtime/clips.mjs` | Sprite sheets and time-driven animation clips |
| `runtime/actions.mjs` | Input buffering, coyote-time-style forgiveness, axes |
| `runtime/panorama.mjs` | 360° maths: equirect ↔ cube faces ↔ 4×3 cross, nearest/bilinear/bicubic/Lanczos resampling with seam wrapping (tested) |
| `runtime/panorama-viewer.html` | Minimal drag-to-look panorama viewer (three.js) |
| `guides/01–16` | Scene setup, the loop, cameras and feel, assets and materials, shaders, physics, ECS, 2D sprites, performance, running a project, release QA, animation, geometry and textures, interaction and controls, post-processing, panoramas and skyboxes |

## Use it
```
node ecs/world.test.mjs
node runtime/runtime.test.mjs
node runtime/panorama.test.mjs
```
Both suites must pass before anything here changes.

## Reading order
Starting a 3D game: 01 → 02 → 03 → 04 → 06 → 07 → 09 (then 05, 12–15 as needed).  
Starting a 2D game: 02 → 03 → 08 → 06 → 07 → 09.  
Running the project: 10 then 11. Skyboxes and 360° content: 16.

## Principles
- Gameplay is a pure function of a fixed clock — replayable, testable, the same on every device.
- The scene is a view of game state, never the source of truth.
- Measure before optimising; ship a quality ladder, not one setting.
- Feel (guide 03) comes before content.
