# 14 · Interaction and controls

## Picking: what is under the pointer?
Convert the pointer to normalised device coordinates (-1…1), cast a ray from the camera, intersect with the objects that matter.

```js
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
canvas.addEventListener('pointermove', (e) => {
  const r = canvas.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hits = ray.intersectObjects(pickables, false);     // pass a short list, not the whole scene
  hovered = hits[0]?.object ?? null;
});
```
Keep a dedicated `pickables` array. For hundreds of targets, pick against simple proxy boxes rather than detailed meshes.

## Pointer events, not mouse events
`pointerdown/move/up` cover mouse, touch and pen with one code path. Call `canvas.setPointerCapture(e.pointerId)` on press so drags continue outside the canvas.

## Camera controls to choose from
| Game | Control |
|---|---|
| Strategy / city builder | Orbit or pan-zoom, clamped to the map |
| Third-person action | Follow camera, mouse/stick orbits, ray-cast to avoid walls (guide 03) |
| First-person | Pointer lock for look, WASD for move |
| Side-scroller | Dead-zone follow, no player control |

## First-person look
```js
canvas.requestPointerLock();
document.addEventListener('mousemove', (e) => {
  if (document.pointerLockElement !== canvas) return;
  yaw   -= e.movementX * 0.002;
  pitch  = Math.max(-1.45, Math.min(1.45, pitch - e.movementY * 0.002));   // never flip over the top
  camera.rotation.set(pitch, yaw, 0, 'YXZ');                                // YXZ order avoids roll
});
```

## Touch
Virtual stick on the left thumb, buttons on the right; make hit areas at least 44 px. Don't rely on hover. Prevent page scroll/zoom on the canvas (`touch-action: none`).

## Gamepad
Poll `navigator.getGamepads()` each tick (it's a snapshot, not events). Apply a dead zone of ~0.15 and rescale so movement ramps from zero.

## Rebinding
Map physical keys → **actions** (`jump`, `fire`) in one table, then use actions everywhere (`runtime/actions.mjs`). Rebinding, touch and gamepad all become edits to the table.

## Focus and safety
Clear held keys on `blur` and `visibilitychange`, or players get stuck running forever after alt-tabbing. Show a clear "click to play" state before pointer lock or audio can start (browsers require a gesture).
