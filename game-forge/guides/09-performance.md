# 09 · Performance

Target **60 fps on the weakest device you care about**. Measure first, change one thing, measure again.

## Know the budget
Per frame at 60 fps you have **16.6 ms**, shared between your code, the browser, and the GPU. Aim to use ~10 ms so spikes don't drop frames.

## Find the bottleneck before fixing anything
| Symptom | Likely cause | First test |
|---|---|---|
| FPS rises a lot when you shrink the window | **Fill-rate / pixel-bound** (heavy shaders, big transparents, high DPR) | Lower `setPixelRatio` |
| FPS unchanged by window size, CPU thread pegged | **CPU-bound** (too many draw calls, heavy JS) | Check `renderer.info.render.calls` |
| Periodic hitches every few seconds | **Garbage collection** | Look for per-frame allocations |
| Hitch when something first appears | **Shader compile / texture upload** | Pre-warm: render it once off-screen at load |

## The big wins, in order
1. **Cut draw calls.** Aim for under ~300. Merge static geometry, share materials, use `InstancedMesh` for repeats.
2. **Cap resolution.** `min(devicePixelRatio, 2)`, and offer a quality slider that drops to 1.
3. **Fewer, cheaper lights and shadows.** One shadow-casting light; bake the rest.
4. **Cull.** Frustum culling is automatic; add distance culling and room/zone visibility for large worlds.
5. **LOD.** Swap to cheaper meshes or billboards at distance.
6. **Texture memory.** Use compressed (KTX2) textures; downscale anything that never appears large.

## Don't allocate in the hot path
Creating `new Vector3()` or `{}` every frame feeds the garbage collector and causes hitches.
```js
const tmp = new THREE.Vector3();          // allocate once, reuse
function update() { tmp.copy(a).sub(b).normalize(); }
```
Pool short-lived things (bullets, particles, damage numbers): keep an array of inactive objects, grab one, reset it, return it when done.

## Update less often what you can
Run AI at 10 Hz, not 60. Update far-away entities every few frames. Sleep entities with nothing to do.

## Particles
Use one `Points` or `InstancedMesh` for thousands of particles and animate them in the vertex shader from a start time and seed. Simulating each in JS doesn't scale.

## Measure on a real low-end device
A mid-range phone shows problems your desktop hides. Test early, and test on the slowest target regularly, not once at the end.

## Build a quality ladder
Low / Medium / High presets that change pixel ratio, shadow size, particle counts and draw distance. Auto-select by measuring the first few seconds of frame time, and let the player override.
