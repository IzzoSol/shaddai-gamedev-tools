# 03 · Cameras and game feel

A camera is a character. Players judge a game's quality within seconds largely by how it moves.

## Follow camera with smoothing that doesn't lag
Plain `lerp(camera, target, 0.1)` is frame-rate dependent: it feels different at 30 and 144 fps. Use an exponential decay instead:

```js
// k = how quickly we close the gap (per second). 6–12 feels snappy, 2–4 feels floaty.
const damp = (current, target, k, dt) => target + (current - target) * Math.exp(-k * dt);

camera.position.x = damp(camera.position.x, player.x + offset.x, 8, dt);
camera.position.y = damp(camera.position.y, player.y + offset.y, 5, dt);   // slower on Y = less nausea
camera.position.z = damp(camera.position.z, player.z + offset.z, 8, dt);
camera.lookAt(player.x, player.y + 1, player.z);
```

## Look-ahead
Shift the focus point toward where the player is *going*: `focus = player + velocity * 0.25`. The player sees more of what's coming; the camera feels intelligent.

## Dead zone
In 2D and side-scrollers, let the player move inside a small box before the camera follows. Constant tracking makes tiny movements feel jittery.

## Collision-aware third-person
Cast a ray from the player's head to the desired camera spot (`collide.mjs → raycast`). If it hits geometry, put the camera just in front of the hit. Ease back out slowly once the view clears.

## Shake that reads as impact
```js
// trauma ∈ [0,1], raised by hits and decayed over time; shake grows with trauma².
const s = trauma * trauma;
camera.rotation.z = s * 0.05 * noise(t * 30);
camera.position.x += s * 0.3 * noise(t * 27 + 10);
trauma = Math.max(0, trauma - dt * 1.4);
```
Use smooth noise, not `Math.random()`, or the shake looks like static. Shake rotation more than position.

## Juice checklist (do these before adding content)
- **Hit stop:** freeze the simulation 50–90 ms on a heavy hit.
- **Squash and stretch:** scale the sprite or mesh 10–20% on jump and landing, restoring over ~120 ms.
- **Input forgiveness:** buffer presses and allow coyote time (`runtime/actions.mjs`).
- **Audio on every verb:** jump, land, hit, pickup. Silence reads as broken.
- **Particles on contact:** a few short-lived puffs sell weight.
- **FOV kick:** widen the field of view 3–6° when sprinting; ease it back.
