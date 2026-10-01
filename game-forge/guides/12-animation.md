# 12 · Animation

Three kinds, often combined: **skeletal** (bones drive a mesh), **morph** (blend between stored shapes), and **procedural** (code computes motion from time).

## Playing authored clips
```js
const gltf = await loader.loadAsync('hero.glb');
const mixer = new THREE.AnimationMixer(gltf.scene);
const actions = Object.fromEntries(gltf.animations.map((c) => [c.name, mixer.clipAction(c)]));

actions.idle.play();
// each frame:
mixer.update(dt);
```

## Blending between states
Never snap from one clip to another. Cross-fade over ~0.15–0.3 s:
```js
function go(next, fade = 0.2) {
  if (current === next) return;
  next.reset().setEffectiveWeight(1).play();
  current.crossFadeTo(next, fade, false);
  current = next;
}
```
For locomotion, keep `idle`, `walk`, `run` playing together and drive their **weights** from speed (0 → idle, mid → walk, high → run). It gives smooth acceleration with no pops.

## One-shot actions
For attacks and jumps: `action.setLoop(THREE.LoopOnce); action.clampWhenFinished = true;`. Listen for the mixer's `'finished'` event to return to the locomotion state. Fire gameplay events (hit frames, footsteps) from **named times** in the clip, not from guesses.

## Morph targets
Facial expressions and damage states: set `mesh.morphTargetInfluences[i]` between 0 and 1. Ease it with `damp` (guide 03) so expressions don't pop.

## Procedural motion
Bobbing pickups, swaying foliage, breathing idles, recoil — a few lines of `sin(time)` plus springs are cheaper and more flexible than authored clips.
```js
mesh.position.y = baseY + Math.sin(world.time * 2 + phase) * 0.15;   // give each instance its own phase
```

## Retargeting and reuse
Share one skeleton across characters (same bone names and rest pose) and every clip works on all of them. Decide the skeleton early; changing it later means reworking every animation.

## Performance
Skinned meshes cost per bone per vertex. Cap bones (~60), skip updating off-screen characters, and drop distant crowds to baked vertex animation or simple billboards.

## Pitfalls
- Forgetting `mixer.update(dt)` (nothing moves).
- Mixing wall-clock time and simulation time (animation keeps playing while paused).
- Root motion fighting your controller: decide whether the clip or the code owns movement, never both.
